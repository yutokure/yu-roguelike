// Addon: Churning Karst - cascading subterranean rivers eroding limestone chambers
(function(){

  function carveCircle(ctx, cx, cy, r, color){
    for(let y=cy-r; y<=cy+r; y++){
      for(let x=cx-r; x<=cx+r; x++){
        const dx = x-cx, dy=y-cy;
        if(dx*dx + dy*dy <= r*r && ctx.inBounds(x,y)){
          ctx.set(x,y,0);
          if(color) ctx.setFloorColor(x,y,color);
        }
      }
    }
  }

  function floodPath(ctx, start, flowLength, palette){
    const { random, inBounds, set, setFloorColor } = ctx;
    let [x,y] = start;
    let dir = [0,1];
    for(let i=0;i<flowLength;i++){
      if(!inBounds(x,y)) break;
      set(x,y,0);
      const mix = i/Math.max(1,flowLength-1);
      const color = palette[Math.min(palette.length-1, Math.floor(mix*(palette.length)))];
      setFloorColor(x,y,color);
      if(random()<0.35){
        const turn = random()<0.5 ? [dir[1], -dir[0]] : [-dir[1], dir[0]];
        dir = turn;
      }
      if(random()<0.2) dir = [[1,0],[-1,0],[0,1],[0,-1]][Math.floor(random()*4)];
      x += dir[0];
      y += dir[1];
    }
  }

  function algorithm(ctx){
    const { width:W, height:H, map, random, set, setFloorColor, setWallColor, inBounds, ensureConnectivity, carvePath } = ctx;

    for(let y=0;y<H;y++){
      for(let x=0;x<W;x++){
        const edge = x===0 || y===0 || x===W-1 || y===H-1;
        map[y][x] = edge ? 1 : (random() < 0.46 ? 1 : 0);
      }
    }

    const dirs = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]];
    for(let iter=0; iter<5; iter++){
      const next = map.map(row => row.slice());
      for(let y=1;y<H-1;y++){
        for(let x=1;x<W-1;x++){
          let walls=0;
          for(const [dx,dy] of dirs){ walls += map[y+dy][x+dx]; }
          next[y][x] = walls >= 5 ? 1 : 0;
        }
      }
      for(let y=1;y<H-1;y++){
        for(let x=1;x<W-1;x++) map[y][x] = next[y][x];
      }
    }

    for(let y=0;y<H;y++){
      for(let x=0;x<W;x++){
        set(x,y,map[y][x]);
        if(map[y][x] === 0){
          const hueShift = Math.sin((x*0.3)+(y*0.15))*0.15;
          const base = 0.35 + hueShift;
          const g = Math.floor(lerp(60, 160, Math.min(1, Math.max(0, base + 0.25))));
          const b = Math.floor(lerp(70, 180, Math.min(1, Math.max(0, base + 0.45))));
          ctx.setFloorColor(x,y,`rgb(${Math.floor(lerp(40,120,base))},${g},${b})`);
        } else if(ctx.setWallColor){
          ctx.setWallColor(x,y, '#3f3d56');
        }
      }
    }

    const basins = [];
    const basinCount = Math.max(4, Math.floor((W+H)/12));
    for(let i=0;i<basinCount;i++){
      const r = 2 + Math.floor(random()*3);
      const cx = 2 + Math.floor(random()*(W-4));
      const cy = 2 + Math.floor(random()*(H-4));
      carveCircle(ctx,cx,cy,r,'#4f9da6');
      basins.push({x:cx,y:cy});
    }

    const palette = ['#1d4ed8','#2563eb','#38bdf8','#a5f3fc'];
    basins.forEach(basin => {
      floodPath(ctx, [basin.x, basin.y], Math.floor(W*H/20), palette);
    });

    if(basins.length > 1){
      const edges = [];
      const used = new Set([0]);
      while(used.size < basins.length){
        let best = Infinity, bi=-1, bj=-1;
        used.forEach(i => {
          basins.forEach((b,j) => {
            if(used.has(j)) return;
            const a = basins[i];
            const d = (a.x-b.x)*(a.x-b.x) + (a.y-b.y)*(a.y-b.y);
            if(d<best){ best=d; bi=i; bj=j; }
          });
        });
        if(bj>=0){ used.add(bj); edges.push([basins[bi], basins[bj]]); }
      }
      edges.forEach(([a,b]) => {
        const path = ctx.aStar ? ctx.aStar(a,b,{wallCost:1, floorCost:0.2, straightPenalty:0.05}) : null;
        if(path && path.length){
          carvePath(path,1);
          path.forEach(p => {
            setFloorColor(p.x,p.y,'#93c5fd');
          });
        } else {
          const steps = Math.max(Math.abs(a.x-b.x), Math.abs(a.y-b.y));
          for(let i=0;i<=steps;i++){
            const x = Math.round(lerp(a.x,b.x,i/steps));
            const y = Math.round(lerp(a.y,b.y,i/steps));
            if(inBounds(x,y)){
              set(x,y,0);
              setFloorColor(x,y,'#93c5fd');
            }
          }
        }
      });
    }

    for(let i=0;i<Math.floor((W*H)/70);i++){
      const x = Math.floor(random()*W);
      const y = Math.floor(random()*H);
      if(inBounds(x,y)){
        if(random()<0.5) setFloorColor(x,y,'#bae6fd');
      }
    }

    ensureConnectivity();
  }

  function lerp(a,b,t){ return a + (b-a)*t; }

  const gen = {
    id: 'churning-karst',
    name: '奔流石灰洞',
    nameKey: "dungeon.types.churning_karst.name",
    description: '石灰質が侵食された水流迷宮。複層の地下水脈が洞窟を削り続ける。',
    descriptionKey: "dungeon.types.churning_karst.description",
    algorithm,
    mixin: { normalMixed: 0.5, blockDimMixed: 0.55, tags: ['cave','water','erosion'] }
  };

  function mkBoss(depth){ const floors=[]; if(depth>=5) floors.push(5); if(depth>=9) floors.push(9); if(depth>=14) floors.push(14); return floors; }

  const blocks = {
    blocks1:[
      {
        key:'karst_theme_01',
        name:'Karst Rapids I',
        nameKey: "dungeon.types.churning_karst.blocks.karst_theme_01.name",
        level:+0,
        size:0,
        depth:+1,
        chest:'normal',
        type:'churning-karst',
        bossFloors:mkBoss(7)
      },
      {
        key:'karst_theme_02',
        name:'Karst Rapids II',
        nameKey: "dungeon.types.churning_karst.blocks.karst_theme_02.name",
        level:+6,
        size:+1,
        depth:+1,
        chest:'more',
        type:'churning-karst',
        bossFloors:mkBoss(10)
      },
      {
        key:'karst_theme_03',
        name:'Karst Rapids III',
        nameKey: "dungeon.types.churning_karst.blocks.karst_theme_03.name",
        level:+12,
        size:+1,
        depth:+2,
        chest:'less',
        type:'churning-karst',
        bossFloors:mkBoss(13)
      },
      {
        key:'karst_theme_04',
        name:'Karst Rapids IV',
        nameKey: "dungeon.types.churning_karst.blocks.karst_theme_04.name",
        level:+18,
        size:+2,
        depth:+2,
        chest:'normal',
        type:'churning-karst',
        bossFloors:mkBoss(16)
      }
    ],
    blocks2:[
      {
        key:'karst_core_01',
        name:'Karst Core I',
        nameKey: "dungeon.types.churning_karst.blocks.karst_core_01.name",
        level:+0,
        size:+1,
        depth:0,
        chest:'normal',
        type:'churning-karst'
      },
      {
        key:'karst_core_02',
        name:'Karst Core II',
        nameKey: "dungeon.types.churning_karst.blocks.karst_core_02.name",
        level:+5,
        size:+1,
        depth:+1,
        chest:'more',
        type:'churning-karst'
      },
      {
        key:'karst_core_03',
        name:'Karst Core III',
        nameKey: "dungeon.types.churning_karst.blocks.karst_core_03.name",
        level:+11,
        size:+2,
        depth:+1,
        chest:'less',
        type:'churning-karst'
      },
      {
        key:'karst_core_04',
        name:'Karst Core IV',
        nameKey: "dungeon.types.churning_karst.blocks.karst_core_04.name",
        level:+17,
        size:+2,
        depth:+2,
        chest:'normal',
        type:'churning-karst'
      }
    ],
    blocks3:[
      {
        key:'karst_relic_01',
        name:'Karst Relic I',
        nameKey: "dungeon.types.churning_karst.blocks.karst_relic_01.name",
        level:+0,
        size:0,
        depth:+2,
        chest:'more',
        type:'churning-karst',
        bossFloors:[5]
      },
      {
        key:'karst_relic_02',
        name:'Karst Relic II',
        nameKey: "dungeon.types.churning_karst.blocks.karst_relic_02.name",
        level:+9,
        size:+1,
        depth:+2,
        chest:'normal',
        type:'churning-karst',
        bossFloors:[9]
      },
      {
        key:'karst_relic_03',
        name:'Karst Relic III',
        nameKey: "dungeon.types.churning_karst.blocks.karst_relic_03.name",
        level:+15,
        size:+1,
        depth:+3,
        chest:'less',
        type:'churning-karst',
        bossFloors:[14]
      }
    ]
  };

  window.registerDungeonAddon({
    id:'churning_karst_pack',
    name:'Churning Karst Pack',
    nameKey: "dungeon.packs.churning_karst_pack.name",
    version:'1.0.0',
    blocks,
    generators:[gen]
  });
})();

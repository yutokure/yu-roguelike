// Addon: Fungal Bloom - mycelial caverns with toxic spore pods
(function(){
  function circle(ctx, cx, cy, r, color){
    const r2 = r * r;
    for(let y = cy - r - 1; y <= cy + r + 1; y++){
      for(let x = cx - r - 1; x <= cx + r + 1; x++){
        const dx = x - cx, dy = y - cy;
        if(dx*dx + dy*dy <= r2 && ctx.inBounds(x, y)){
          ctx.set(x, y, 0);
          if(color) ctx.setFloorColor(x, y, color);
        }
      }
    }
  }
  function pathCarve(ctx, x, y, len, color){
    const random = ctx.random;
    let dir = [1,0];
    for(let i=0;i<len;i++){
      if(ctx.inBounds(x, y)){
        ctx.set(x, y, 0);
        ctx.setFloorColor(x, y, color);
      }
      if(random() < 0.35){
        const turn = random() < 0.5 ? [dir[1], -dir[0]] : [-dir[1], dir[0]];
        dir = turn;
      }
      x += dir[0]; y += dir[1];
      if(!ctx.inBounds(x, y)) break;
    }
  }
  function mst(points){
    if(points.length<=1) return [];
    const used = Array(points.length).fill(false);
    used[0] = true;
    const edges = [];
    for(let it=0; it<points.length-1; it++){
      let best=Infinity, bi=-1, bj=-1;
      for(let i=0;i<points.length;i++) if(used[i])
        for(let j=0;j<points.length;j++) if(!used[j]){
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const d = dx*dx + dy*dy;
          if(d < best){ best = d; bi=i; bj=j; }
        }
      if(bj>=0){ used[bj]=true; edges.push([points[bi], points[bj]]); }
    }
    return edges;
  }
  function algorithm(ctx){
    const W = ctx.width, H = ctx.height;
    const random = ctx.random;
    const rooms = [];
    const count = Math.max(6, Math.floor(Math.min(W, H) / 3));
    const minDist2 = Math.max(36, Math.floor(Math.min(W, H)/3)) ** 2;

    for(let attempt=0; attempt < count*12 && rooms.length < count; attempt++){
      const r = 3 + Math.floor(random() * Math.max(4, Math.min(W, H)/8));
      const cx = 2 + r + Math.floor(random() * (W - 4 - 2*r));
      const cy = 2 + r + Math.floor(random() * (H - 4 - 2*r));
      const candidate = { x: cx, y: cy, r };
      if(rooms.some(room => {
        const dx=room.x-candidate.x, dy=room.y-candidate.y;
        return dx*dx + dy*dy < minDist2;
      })) continue;
      rooms.push(candidate);
      circle(ctx, cx, cy, r, '#6b8e62');
    }

    if(!rooms.length){
      const r = Math.floor(Math.min(W,H)/5);
      circle(ctx, Math.floor(W/2), Math.floor(H/2), r, '#6b8e62');
      rooms.push({ x:Math.floor(W/2), y:Math.floor(H/2), r });
    }

    const centers = rooms.map(({x,y}) => ({x,y}));
    const edges = mst(centers);
    edges.forEach(([a,b]) => {
      const path = ctx.aStar(a,b,{ wallCost:1.0, floorCost:0.1, straightPenalty:0.05, hugWalls:0.05 });
      ctx.carvePath(path, 2);
      path.forEach(p => ctx.setFloorColor(p.x, p.y, '#7f9f6b'));
    });

    rooms.forEach(room => {
      const tendrils = 2 + Math.floor(random()*3);
      for(let t=0;t<tendrils;t++){
        const angle = random()*Math.PI*2;
        const startX = Math.round(room.x + Math.cos(angle)*Math.max(1, room.r-1));
        const startY = Math.round(room.y + Math.sin(angle)*Math.max(1, room.r-1));
        const len = Math.max(8, Math.floor(Math.min(W,H)/3));
        pathCarve(ctx, startX, startY, len, '#7a9a65');
      }
    });

    // Toxic spore pods
    const podCount = Math.max(4, Math.floor(rooms.length * 1.5));
    for(let i=0;i<podCount;i++){
      const room = rooms[Math.floor(random()*rooms.length)];
      const angle = random()*Math.PI*2;
      const radius = Math.max(1, room.r-1);
      const px = Math.round(room.x + Math.cos(angle)*radius);
      const py = Math.round(room.y + Math.sin(angle)*radius);
      const podR = 1 + (random()<0.3?1:0);
      for(let y=py-podR; y<=py+podR; y++){
        for(let x=px-podR; x<=px+podR; x++){
          const dx=x-px, dy=y-py;
          if(dx*dx + dy*dy <= podR*podR && ctx.inBounds(x,y)){
            ctx.set(x,y,0);
            ctx.setFloorColor(x,y,'#b9e769');
            ctx.setFloorType(x,y,'poison');
          }
        }
      }
    }

    ctx.ensureConnectivity();
  }

  const gen = {
    id: 'fungal-bloom',
    name: '菌糸繁茂洞',
    nameKey: "dungeon.types.fungal_bloom.name",
    description: '胞子嚢と菌糸の網目が広がる有機的な洞窟',
    descriptionKey: "dungeon.types.fungal_bloom.description",
    algorithm,
    mixin: { normalMixed: 0.45, blockDimMixed: 0.5, tags: ['organic','poison','cave'] }
  };

  function mkBoss(depth){ const r=[]; if(depth>=5) r.push(5); if(depth>=10) r.push(10); if(depth>=15) r.push(15); return r; }
  const blocks = {
    blocks1:[
      {
        key:'fungal_theme_01',
        name:'Fungal Theme I',
        nameKey: "dungeon.types.fungal_bloom.blocks.fungal_theme_01.name",
        level:+0,
        size:0,
        depth:+1,
        chest:'less',
        type:'fungal-bloom',
        bossFloors:mkBoss(6)
      },
      {
        key:'fungal_theme_02',
        name:'Fungal Theme II',
        nameKey: "dungeon.types.fungal_bloom.blocks.fungal_theme_02.name",
        level:+7,
        size:+1,
        depth:+1,
        chest:'normal',
        type:'fungal-bloom',
        bossFloors:mkBoss(8)
      },
      {
        key:'fungal_theme_03',
        name:'Fungal Theme III',
        nameKey: "dungeon.types.fungal_bloom.blocks.fungal_theme_03.name",
        level:+14,
        size:+1,
        depth:+2,
        chest:'more',
        type:'fungal-bloom',
        bossFloors:mkBoss(10)
      },
      {
        key:'fungal_theme_04',
        name:'Fungal Theme IV',
        nameKey: "dungeon.types.fungal_bloom.blocks.fungal_theme_04.name",
        level:+21,
        size:+2,
        depth:+2,
        chest:'normal',
        type:'fungal-bloom',
        bossFloors:mkBoss(12)
      },
      {
        key:'fungal_theme_05',
        name:'Fungal Theme V',
        nameKey: "dungeon.types.fungal_bloom.blocks.fungal_theme_05.name",
        level:+28,
        size:+2,
        depth:+3,
        chest:'less',
        type:'fungal-bloom',
        bossFloors:mkBoss(15)
      },
    ],
    blocks2:[
      {
        key:'mycel_core_01',
        name:'Mycel Core I',
        nameKey: "dungeon.types.fungal_bloom.blocks.mycel_core_01.name",
        level:+0,
        size:+1,
        depth:0,
        chest:'normal',
        type:'fungal-bloom'
      },
      {
        key:'mycel_core_02',
        name:'Mycel Core II',
        nameKey: "dungeon.types.fungal_bloom.blocks.mycel_core_02.name",
        level:+6,
        size:+1,
        depth:+1,
        chest:'more',
        type:'fungal-bloom'
      },
      {
        key:'mycel_core_03',
        name:'Mycel Core III',
        nameKey: "dungeon.types.fungal_bloom.blocks.mycel_core_03.name",
        level:+12,
        size:+2,
        depth:+1,
        chest:'less',
        type:'fungal-bloom'
      },
      {
        key:'mycel_core_04',
        name:'Mycel Core IV',
        nameKey: "dungeon.types.fungal_bloom.blocks.mycel_core_04.name",
        level:+18,
        size:+2,
        depth:+2,
        chest:'normal',
        type:'fungal-bloom'
      },
      {
        key:'mycel_core_05',
        name:'Mycel Core V',
        nameKey: "dungeon.types.fungal_bloom.blocks.mycel_core_05.name",
        level:+24,
        size:+3,
        depth:+2,
        chest:'more',
        type:'fungal-bloom'
      },
    ],
    blocks3:[
      {
        key:'spore_relic_01',
        name:'Spore Relic I',
        nameKey: "dungeon.types.fungal_bloom.blocks.spore_relic_01.name",
        level:+0,
        size:0,
        depth:+2,
        chest:'more',
        type:'fungal-bloom',
        bossFloors:[5]
      },
      {
        key:'spore_relic_02',
        name:'Spore Relic II',
        nameKey: "dungeon.types.fungal_bloom.blocks.spore_relic_02.name",
        level:+9,
        size:+1,
        depth:+2,
        chest:'normal',
        type:'fungal-bloom',
        bossFloors:[10]
      },
      {
        key:'spore_relic_03',
        name:'Spore Relic III',
        nameKey: "dungeon.types.fungal_bloom.blocks.spore_relic_03.name",
        level:+18,
        size:+1,
        depth:+3,
        chest:'less',
        type:'fungal-bloom',
        bossFloors:[15]
      },
      {
        key:'spore_relic_04',
        name:'Spore Relic IV',
        nameKey: "dungeon.types.fungal_bloom.blocks.spore_relic_04.name",
        level:+24,
        size:+2,
        depth:+3,
        chest:'more',
        type:'fungal-bloom',
        bossFloors:[10,15]
      },
      {
        key:'spore_relic_05',
        name:'Spore Relic V',
        nameKey: "dungeon.types.fungal_bloom.blocks.spore_relic_05.name",
        level:+30,
        size:+2,
        depth:+4,
        chest:'normal',
        type:'fungal-bloom',
        bossFloors:[5,10,15]
      },
    ]
  };

  window.registerDungeonAddon({
    id:'fungal_pack',
    name:'Fungal Bloom Pack',
    nameKey: "dungeon.packs.fungal_pack.name",
    version:'1.0.0',
    blocks,
    generators:[gen]
  });
})();

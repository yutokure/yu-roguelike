// Addon: Starlit Canopy - moonlit treetops and glowing constellations
(function(){
  function algorithm(ctx){
    const W = ctx.width;
    const H = ctx.height;
    const map = ctx.map;

    const supportsTexture = typeof ctx.setFloorTexture === 'function';
    const supportsAmbient = typeof ctx.setAmbientEffect === 'function';
    const isFloor = (x,y) => map[y] && map[y][x] === 0;
    const paintFloor = (x,y,color) => { if(isFloor(x,y)) ctx.setFloorColor(x,y,color); };

    const applyTexture = (x,y) => {
      if(supportsTexture){
        ctx.setFloorTexture(x,y,'starlight');
        return;
      }
      const palette = ['#9fb5ff', '#c4d4ff', '#e7f0ff'];
      paintFloor(x,y, palette[Math.floor(ctx.random()*palette.length)]);
      if(ctx.random() < 0.45){
        const halo = `rgba(${200 + Math.floor(ctx.random()*30)}, ${210 + Math.floor(ctx.random()*40)}, ${255}, 0.75)`;
        [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy]) => {
          if(ctx.random() < 0.5) paintFloor(x+dx, y+dy, halo);
        });
      }
    };

    const applyFirefly = (x,y) => {
      if(supportsAmbient){
        ctx.setAmbientEffect(x,y,'firefly');
        return;
      }
      const offsets = [[0,0],[1,0],[-1,0],[0,1],[0,-1]];
      offsets.forEach(([dx,dy]) => {
        const nx = x+dx;
        const ny = y+dy;
        if(!isFloor(nx, ny)) return;
        const intensity = Math.max(0.35, 0.7 - 0.15*(Math.abs(dx)+Math.abs(dy)) + ctx.random()*0.1);
        const gold = 220 + Math.floor(ctx.random()*25);
        paintFloor(nx, ny, `rgba(${gold}, ${200 + Math.floor(ctx.random()*40)}, ${120 + Math.floor(ctx.random()*50)}, ${intensity.toFixed(2)})`);
      });
    };

    for(let y=0;y<H;y++){
      for(let x=0;x<W;x++){
        const edge = x===0 || y===0 || x===W-1 || y===H-1;
        map[y][x] = edge ? 1 : (ctx.random() < 0.46 ? 1 : 0);
      }
    }

    for(let iter=0; iter<4; iter++){
      const next = map.map(row => row.slice());
      for(let y=1;y<H-1;y++){
        for(let x=1;x<W-1;x++){
          let walls = 0;
          for(let yy=y-1; yy<=y+1; yy++){
            for(let xx=x-1; xx<=x+1; xx++){
              if(xx===x && yy===y) continue;
              if(map[yy][xx] === 1) walls++;
            }
          }
          const threshold = iter < 2 ? 4 : 5;
          next[y][x] = walls >= threshold ? 1 : 0;
        }
      }
      for(let y=1;y<H-1;y++){
        for(let x=1;x<W-1;x++) map[y][x] = next[y][x];
      }
    }

    for(let y=0;y<H;y++){
      for(let x=0;x<W;x++){
        if(map[y][x] === 0){
          const night = 0.5 + 0.5*Math.sin((x/5)+(y/7));
          const blue = Math.floor(150 + night*80);
          ctx.setFloorColor(x,y,`rgb(${60 + Math.floor(night*40)}, ${80 + Math.floor(night*60)}, ${blue})`);
          if(ctx.random() < 0.08){
            applyTexture(x,y);
          }
        } else {
          const glow = 0.2 + 0.2*Math.sin(y/3);
          ctx.setWallColor(x,y,`rgba(${40}, ${70 + Math.floor(glow*120)}, ${120 + Math.floor(glow*100)}, 1)`);
        }
      }
    }

    for(let i=0;i<Math.floor(W*H/50);i++){
      const rx = Math.floor(ctx.random()*W);
      const ry = Math.floor(ctx.random()*H);
      if(isFloor(rx, ry)) applyFirefly(rx, ry);
    }

    ctx.ensureConnectivity();
  }

  const gen = {
    id: 'starlit-canopy',
    name: '星影樹海',
    description: '夜空の星々が照らす高木の樹海',
    algorithm,
    mixin: { normalMixed: 0.42, blockDimMixed: 0.55, tags: ['forest','night','celestial'] }
  };

  function boss(depth){
    const arr = [];
    if(depth >= 5) arr.push(5);
    if(depth >= 10) arr.push(10);
    if(depth >= 15) arr.push(15);
    if(depth >= 20) arr.push(20);
    return arr;
  }

  const blocks = {
    blocks1:[
      { key:'starlit_theme_01', name:'Canopy Theme I', level:+0,  size:0,  depth:+1, chest:'normal', type:'starlit-canopy', bossFloors:boss(5) },
      { key:'starlit_theme_02', name:'Canopy Theme II', level:+4,  size:+1, depth:+1, chest:'less',   type:'starlit-canopy', bossFloors:boss(7) },
      { key:'starlit_theme_03', name:'Canopy Theme III',level:+8,  size:+1, depth:+1, chest:'more',   type:'starlit-canopy', bossFloors:boss(9) },
      { key:'starlit_theme_04', name:'Canopy Theme IV', level:+12, size:+1, depth:+2, chest:'normal', type:'starlit-canopy', bossFloors:boss(11) },
      { key:'starlit_theme_05', name:'Canopy Theme V',  level:+16, size:+2, depth:+2, chest:'less',   type:'starlit-canopy', bossFloors:boss(13) },
      { key:'starlit_theme_06', name:'Canopy Theme VI', level:+20, size:+2, depth:+2, chest:'normal', type:'starlit-canopy', bossFloors:boss(15) },
      { key:'starlit_theme_07', name:'Canopy Theme VII',level:+24, size:+2, depth:+3, chest:'more',   type:'starlit-canopy', bossFloors:boss(17) }
    ],
    blocks2:[
      { key:'starlit_core_01', name:'Canopy Core I', level:+0,  size:+1, depth:0,  chest:'normal', type:'starlit-canopy' },
      { key:'starlit_core_02', name:'Canopy Core II',level:+5,  size:+1, depth:+1, chest:'more',   type:'starlit-canopy' },
      { key:'starlit_core_03', name:'Canopy Core III',level:+9,  size:+1, depth:+1, chest:'less',   type:'starlit-canopy' },
      { key:'starlit_core_04', name:'Canopy Core IV', level:+13, size:+1, depth:+2, chest:'normal', type:'starlit-canopy' },
      { key:'starlit_core_05', name:'Canopy Core V',  level:+17, size:+2, depth:+2, chest:'more',   type:'starlit-canopy' },
      { key:'starlit_core_06', name:'Canopy Core VI', level:+21, size:+2, depth:+3, chest:'less',   type:'starlit-canopy' },
      { key:'starlit_core_07', name:'Canopy Core VII',level:+25, size:+3, depth:+3, chest:'normal', type:'starlit-canopy' }
    ],
    blocks3:[
      { key:'starlit_relic_01', name:'Canopy Relic I', level:+0,  size:0,  depth:+2, chest:'more',    type:'starlit-canopy', bossFloors:[5] },
      { key:'starlit_relic_02', name:'Canopy Relic II',level:+6,  size:+1, depth:+2, chest:'normal',  type:'starlit-canopy', bossFloors:[10] },
      { key:'starlit_relic_03', name:'Canopy Relic III',level:+12, size:+1, depth:+3, chest:'less',   type:'starlit-canopy', bossFloors:[15] },
      { key:'starlit_relic_04', name:'Canopy Relic IV', level:+18, size:+2, depth:+3, chest:'normal', type:'starlit-canopy', bossFloors:[20] },
      { key:'starlit_relic_05', name:'Canopy Relic V',  level:+24, size:+2, depth:+4, chest:'more',   type:'starlit-canopy', bossFloors:[20] },
      { key:'starlit_relic_06', name:'Canopy Relic VI', level:+30, size:+2, depth:+4, chest:'less',   type:'starlit-canopy', bossFloors:[20] }
    ]
  };

  window.registerDungeonAddon({ id:'starlit_canopy_pack', name:'Starlit Canopy Pack', version:'1.0.0', blocks, generators:[gen] });
})();

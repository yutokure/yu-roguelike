// Addon: Luminescent Glade - glowing fungal forest with bioluminescent pools
(function(){
  function algorithm(ctx){
    const W = ctx.width;
    const H = ctx.height;
    const map = ctx.map;

    const supportsTexture = typeof ctx.setFloorTexture === 'function';
    const isFloor = (x,y) => map[y] && map[y][x] === 0;
    const paintFloor = (x,y,color) => { if(isFloor(x,y)) ctx.setFloorColor(x,y,color); };

    const applyGlowPool = (x,y) => {
      if(supportsTexture){
        ctx.setFloorTexture(x,y,'glow_pool');
        return;
      }
      const center = `rgba(${120 + Math.floor(ctx.random()*20)}, ${240 + Math.floor(ctx.random()*15)}, ${230 + Math.floor(ctx.random()*20)}, 0.95)`;
      paintFloor(x,y, center);
      const ring = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]];
      ring.forEach(([dx,dy]) => {
        if(ctx.random() < 0.7){
          const nx = x+dx, ny = y+dy;
          const glow = `rgba(${90 + Math.floor(ctx.random()*30)}, ${210 + Math.floor(ctx.random()*25)}, ${200 + Math.floor(ctx.random()*30)}, 0.8)`;
          paintFloor(nx, ny, glow);
        }
      });
    };

    for(let y=0;y<H;y++){
      for(let x=0;x<W;x++){
        const edge = x===0 || y===0 || x===W-1 || y===H-1;
        map[y][x] = edge ? 1 : (ctx.random() < 0.48 ? 1 : 0);
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
          const glow = Math.sin((x+y)/4) * 0.1 + 0.15;
          const g = Math.max(0, Math.min(1, 0.6 + glow));
          ctx.setFloorColor(x,y,`rgba(${Math.floor(80 + g*80)}, ${Math.floor(200*g)}, ${Math.floor(160 + glow*255)}, 1)`);
        } else {
          const tint = 0.3 + (Math.sin(y/3) * 0.1);
          ctx.setWallColor(x,y,`rgba(${Math.floor(30 + tint*60)}, ${Math.floor(90 + tint*90)}, ${Math.floor(120 + tint*70)}, 1)`);
        }
      }
    }

    for(let i=0;i<Math.floor((W*H)/60);i++){
      const rx = Math.floor(ctx.random()*W);
      const ry = Math.floor(ctx.random()*H);
      if(isFloor(rx, ry)) applyGlowPool(rx, ry);
    }

    ctx.ensureConnectivity();
  }

  const gen = {
    id: 'luminescent-glade',
    name: '光る木立',
    description: '発光する水たまりが点在する神秘的な木立のダンジョン',
    algorithm,
    mixin: { normalMixed: 0.45, blockDimMixed: 0.6, tags: ['forest','bioluminescent','mystic'] }
  };

  function mkBoss(depth){
    const floors = [];
    if(depth >= 5) floors.push(5);
    if(depth >= 9) floors.push(9);
    if(depth >= 14) floors.push(14);
    return floors;
  }

  const blocks = {
    blocks1:[
      { key:'lumigrove_theme_01', name:'Glade Theme I', level:+0,  size:0,  depth:+1, chest:'normal', type:'luminescent-glade', bossFloors:mkBoss(5) },
      { key:'lumigrove_theme_02', name:'Glade Theme II', level:+4,  size:+1, depth:+1, chest:'less',   type:'luminescent-glade', bossFloors:mkBoss(7) },
      { key:'lumigrove_theme_03', name:'Glade Theme III',level:+8,  size:+1, depth:+1, chest:'more',  type:'luminescent-glade', bossFloors:mkBoss(9) },
      { key:'lumigrove_theme_04', name:'Glade Theme IV', level:+12, size:+1, depth:+2, chest:'normal',type:'luminescent-glade', bossFloors:mkBoss(11) },
      { key:'lumigrove_theme_05', name:'Glade Theme V',  level:+16, size:+2, depth:+2, chest:'more', type:'luminescent-glade', bossFloors:mkBoss(13) },
      { key:'lumigrove_theme_06', name:'Glade Theme VI', level:+20, size:+2, depth:+3, chest:'less', type:'luminescent-glade', bossFloors:mkBoss(15) },
      { key:'lumigrove_theme_07', name:'Glade Theme VII',level:+24, size:+2, depth:+3, chest:'normal',type:'luminescent-glade', bossFloors:mkBoss(17) }
    ],
    blocks2:[
      { key:'lumigrove_core_01', name:'Glade Core I', level:+0,  size:+1, depth:0,  chest:'normal', type:'luminescent-glade' },
      { key:'lumigrove_core_02', name:'Glade Core II',level:+5,  size:+1, depth:+1, chest:'more',   type:'luminescent-glade' },
      { key:'lumigrove_core_03', name:'Glade Core III',level:+9,  size:+1, depth:+1, chest:'less',   type:'luminescent-glade' },
      { key:'lumigrove_core_04', name:'Glade Core IV', level:+13, size:+2, depth:+2, chest:'normal', type:'luminescent-glade' },
      { key:'lumigrove_core_05', name:'Glade Core V',  level:+17, size:+2, depth:+2, chest:'more',   type:'luminescent-glade' },
      { key:'lumigrove_core_06', name:'Glade Core VI', level:+21, size:+2, depth:+3, chest:'less',   type:'luminescent-glade' },
      { key:'lumigrove_core_07', name:'Glade Core VII',level:+25, size:+3, depth:+3, chest:'normal', type:'luminescent-glade' }
    ],
    blocks3:[
      { key:'lumigrove_relic_01', name:'Glade Relic I', level:+0,  size:0,  depth:+2, chest:'more',    type:'luminescent-glade', bossFloors:[5] },
      { key:'lumigrove_relic_02', name:'Glade Relic II',level:+6,  size:+1, depth:+2, chest:'normal',  type:'luminescent-glade', bossFloors:[7] },
      { key:'lumigrove_relic_03', name:'Glade Relic III',level:+12, size:+1, depth:+3, chest:'less',   type:'luminescent-glade', bossFloors:[9] },
      { key:'lumigrove_relic_04', name:'Glade Relic IV', level:+18, size:+2, depth:+3, chest:'normal', type:'luminescent-glade', bossFloors:[11] },
      { key:'lumigrove_relic_05', name:'Glade Relic V',  level:+24, size:+2, depth:+4, chest:'more',   type:'luminescent-glade', bossFloors:[13] },
      { key:'lumigrove_relic_06', name:'Glade Relic VI', level:+30, size:+2, depth:+4, chest:'less',   type:'luminescent-glade', bossFloors:[15] }
    ]
  };

  window.registerDungeonAddon({ id:'luminescent_glade_pack', name:'Luminescent Glade Pack', version:'1.0.0', blocks, generators:[gen] });
})();

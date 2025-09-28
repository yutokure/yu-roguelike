// Addon: Bamboo Hollows - tranquil bamboo groves with winding streams
(function(){
  function algorithm(ctx){
    const { width: W, height: H, map } = ctx;

    for(let y=0;y<H;y++){
      for(let x=0;x<W;x++){
        const edge = x===0 || y===0 || x===W-1 || y===H-1;
        map[y][x] = edge ? 1 : (ctx.random() < 0.45 ? 1 : 0);
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
          const sway = Math.sin(x/3) * 0.1 + Math.cos(y/4) * 0.1;
          const g = Math.floor(180 + sway*40);
          ctx.setFloorColor(x,y,`rgb(${120 + Math.floor(sway*60)}, ${g}, ${120})`);
          if(ctx.random() < 0.04) ctx.setFloorTexture(x,y,'bamboo_leaf');
          if(ctx.random() < 0.03) ctx.setFloorTexture(x,y,'stone_path');
        } else {
          const hue = 100 + Math.floor(Math.sin((x+y)/4)*30);
          ctx.setWallColor(x,y,`rgb(${60 + hue/2}, ${150 + hue/3}, ${80 + hue/4})`);
        }
      }
    }

    for(let i=0;i<Math.floor(W/3);i++){
      const ry = Math.floor(ctx.random()*H);
      for(let x=0;x<W;x++){
        if(ctx.random()<0.03){
          ctx.setFloorTexture(x,ry,'stream');
        }
      }
    }

    ctx.ensureConnectivity();
  }

  const gen = {
    id: 'bamboo-hollows',
    name: '竹のホロウ',
    description: '竹林の小道とせせらぎが続く静かな迷路',
    algorithm,
    mixin: { normalMixed: 0.48, blockDimMixed: 0.52, tags: ['forest','bamboo','stream'] }
  };

  function boss(depth){
    const floors = [];
    if(depth >= 4) floors.push(4);
    if(depth >= 9) floors.push(9);
    if(depth >= 13) floors.push(13);
    if(depth >= 18) floors.push(18);
    return floors;
  }

  const blocks = {
    blocks1:[
      { key:'bamboo_theme_01', name:'Bamboo Theme I', level:+0,  size:0,  depth:+1, chest:'normal', type:'bamboo-hollows', bossFloors:boss(4) },
      { key:'bamboo_theme_02', name:'Bamboo Theme II', level:+4,  size:+1, depth:+1, chest:'less',   type:'bamboo-hollows', bossFloors:boss(6) },
      { key:'bamboo_theme_03', name:'Bamboo Theme III',level:+8,  size:+1, depth:+1, chest:'normal', type:'bamboo-hollows', bossFloors:boss(8) },
      { key:'bamboo_theme_04', name:'Bamboo Theme IV', level:+12, size:+1, depth:+2, chest:'more',   type:'bamboo-hollows', bossFloors:boss(10) },
      { key:'bamboo_theme_05', name:'Bamboo Theme V',  level:+16, size:+2, depth:+2, chest:'less',   type:'bamboo-hollows', bossFloors:boss(12) },
      { key:'bamboo_theme_06', name:'Bamboo Theme VI', level:+20, size:+2, depth:+2, chest:'normal', type:'bamboo-hollows', bossFloors:boss(14) },
      { key:'bamboo_theme_07', name:'Bamboo Theme VII',level:+24, size:+2, depth:+3, chest:'more',   type:'bamboo-hollows', bossFloors:boss(16) }
    ],
    blocks2:[
      { key:'bamboo_core_01', name:'Bamboo Core I', level:+0,  size:+1, depth:0,  chest:'normal', type:'bamboo-hollows' },
      { key:'bamboo_core_02', name:'Bamboo Core II',level:+4,  size:+1, depth:+1, chest:'more',   type:'bamboo-hollows' },
      { key:'bamboo_core_03', name:'Bamboo Core III',level:+8,  size:+1, depth:+1, chest:'less',   type:'bamboo-hollows' },
      { key:'bamboo_core_04', name:'Bamboo Core IV', level:+12, size:+1, depth:+2, chest:'normal', type:'bamboo-hollows' },
      { key:'bamboo_core_05', name:'Bamboo Core V',  level:+16, size:+2, depth:+2, chest:'more',   type:'bamboo-hollows' },
      { key:'bamboo_core_06', name:'Bamboo Core VI', level:+20, size:+2, depth:+3, chest:'less',   type:'bamboo-hollows' },
      { key:'bamboo_core_07', name:'Bamboo Core VII',level:+24, size:+3, depth:+3, chest:'normal', type:'bamboo-hollows' }
    ],
    blocks3:[
      { key:'bamboo_relic_01', name:'Bamboo Relic I', level:+0,  size:0,  depth:+2, chest:'more',    type:'bamboo-hollows', bossFloors:[4] },
      { key:'bamboo_relic_02', name:'Bamboo Relic II',level:+6,  size:+1, depth:+2, chest:'normal',  type:'bamboo-hollows', bossFloors:[9] },
      { key:'bamboo_relic_03', name:'Bamboo Relic III',level:+12, size:+1, depth:+3, chest:'less',   type:'bamboo-hollows', bossFloors:[13] },
      { key:'bamboo_relic_04', name:'Bamboo Relic IV', level:+18, size:+2, depth:+3, chest:'normal', type:'bamboo-hollows', bossFloors:[18] },
      { key:'bamboo_relic_05', name:'Bamboo Relic V',  level:+24, size:+2, depth:+4, chest:'more',   type:'bamboo-hollows', bossFloors:[18] },
      { key:'bamboo_relic_06', name:'Bamboo Relic VI', level:+30, size:+2, depth:+4, chest:'less',   type:'bamboo-hollows', bossFloors:[18] }
    ]
  };

  window.registerDungeonAddon({ id:'bamboo_hollows_pack', name:'Bamboo Hollows Pack', version:'1.0.0', blocks, generators:[gen] });
})();

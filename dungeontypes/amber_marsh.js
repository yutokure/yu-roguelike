// Addon: Amber Marsh - autumnal wetlands with misty hollows
(function(){
  function algorithm(ctx){
    const W = ctx.width;
    const H = ctx.height;
    const map = ctx.map;

    for(let y=0;y<H;y++){
      for(let x=0;x<W;x++){
        const edge = x===0 || y===0 || x===W-1 || y===H-1;
        map[y][x] = edge ? 1 : (ctx.random() < 0.5 ? 1 : 0);
      }
    }

    for(let iter=0; iter<5; iter++){
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
          const threshold = iter < 2 ? 5 : 4;
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
          const fog = 0.2 + 0.3*Math.sin((x+y)/5);
          ctx.setFloorColor(x,y,`rgba(${180 + Math.floor(Math.sin(y/3)*40)}, ${120 + Math.floor(Math.cos(x/3)*30)}, 80, 0.95)`);
          if(ctx.random() < 0.05){
            ctx.setFloorTexture(x,y, ctx.random() < 0.5 ? 'fallen_leaves' : 'reed_clump');
          }
          if(ctx.random() < fog){
            ctx.setAmbientEffect(x,y,'mist');
          }
        } else {
          const hue = 90 + Math.floor(Math.sin(y/2)*20);
          ctx.setWallColor(x,y,`rgb(${90 + hue}, ${60 + Math.floor(hue/2)}, ${40 + Math.floor(hue/3)})`);
        }
      }
    }

    ctx.ensureConnectivity();
  }

  const gen = {
    id: 'amber-marsh',
    name: '琥珀湿地',
    description: '秋色の湿原に漂う靄と泥の迷路',
    algorithm,
    mixin: { normalMixed: 0.55, blockDimMixed: 0.5, tags: ['swamp','autumn','mist'] }
  };

  function boss(depth){
    const res = [];
    if(depth >= 3) res.push(3);
    if(depth >= 7) res.push(7);
    if(depth >= 11) res.push(11);
    if(depth >= 15) res.push(15);
    return res;
  }

  const blocks = {
    blocks1:[
      { key:'amber_theme_01', name:'Marsh Theme I', level:+0,  size:0,  depth:+1, chest:'normal', type:'amber-marsh', bossFloors:boss(3) },
      { key:'amber_theme_02', name:'Marsh Theme II', level:+4,  size:+1, depth:+1, chest:'less',   type:'amber-marsh', bossFloors:boss(5) },
      { key:'amber_theme_03', name:'Marsh Theme III',level:+8,  size:+1, depth:+1, chest:'more',   type:'amber-marsh', bossFloors:boss(7) },
      { key:'amber_theme_04', name:'Marsh Theme IV', level:+12, size:+1, depth:+2, chest:'normal', type:'amber-marsh', bossFloors:boss(9) },
      { key:'amber_theme_05', name:'Marsh Theme V',  level:+16, size:+2, depth:+2, chest:'less',   type:'amber-marsh', bossFloors:boss(11) },
      { key:'amber_theme_06', name:'Marsh Theme VI', level:+20, size:+2, depth:+2, chest:'normal', type:'amber-marsh', bossFloors:boss(13) },
      { key:'amber_theme_07', name:'Marsh Theme VII',level:+24, size:+2, depth:+3, chest:'more',   type:'amber-marsh', bossFloors:boss(15) }
    ],
    blocks2:[
      { key:'amber_core_01', name:'Marsh Core I', level:+0,  size:+1, depth:0,  chest:'normal', type:'amber-marsh' },
      { key:'amber_core_02', name:'Marsh Core II',level:+5,  size:+1, depth:+1, chest:'more',   type:'amber-marsh' },
      { key:'amber_core_03', name:'Marsh Core III',level:+9,  size:+1, depth:+1, chest:'less',   type:'amber-marsh' },
      { key:'amber_core_04', name:'Marsh Core IV', level:+13, size:+2, depth:+2, chest:'normal', type:'amber-marsh' },
      { key:'amber_core_05', name:'Marsh Core V',  level:+17, size:+2, depth:+2, chest:'more',   type:'amber-marsh' },
      { key:'amber_core_06', name:'Marsh Core VI', level:+21, size:+2, depth:+3, chest:'less',   type:'amber-marsh' },
      { key:'amber_core_07', name:'Marsh Core VII',level:+25, size:+3, depth:+3, chest:'normal', type:'amber-marsh' }
    ],
    blocks3:[
      { key:'amber_relic_01', name:'Marsh Relic I', level:+0,  size:0,  depth:+2, chest:'more',    type:'amber-marsh', bossFloors:[3] },
      { key:'amber_relic_02', name:'Marsh Relic II',level:+6,  size:+1, depth:+2, chest:'normal',  type:'amber-marsh', bossFloors:[7] },
      { key:'amber_relic_03', name:'Marsh Relic III',level:+12, size:+1, depth:+3, chest:'less',   type:'amber-marsh', bossFloors:[11] },
      { key:'amber_relic_04', name:'Marsh Relic IV', level:+18, size:+2, depth:+3, chest:'normal', type:'amber-marsh', bossFloors:[15] },
      { key:'amber_relic_05', name:'Marsh Relic V',  level:+24, size:+2, depth:+4, chest:'more',   type:'amber-marsh', bossFloors:[15] },
      { key:'amber_relic_06', name:'Marsh Relic VI', level:+30, size:+2, depth:+4, chest:'less',   type:'amber-marsh', bossFloors:[15] }
    ]
  };

  window.registerDungeonAddon({ id:'amber_marsh_pack', name:'Amber Marsh Pack', version:'1.0.0', blocks, generators:[gen] });
})();

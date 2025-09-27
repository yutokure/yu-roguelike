// Addon: Sandstorm Expanse - windswept dunes with low visibility
(function(){
  function algorithm(ctx){
    const W = ctx.width, H = ctx.height;
    const random = ctx.random;

    for(let y=1;y<H-1;y++){
      for(let x=1;x<W-1;x++) if(ctx.inBounds(x,y)){
        ctx.set(x,y,0);
        ctx.setFloorColor(x,y,'#f2d492');
      }
    }

    const dunes = Math.floor((W*H)/80);
    for(let i=0;i<dunes;i++){
      const cx = 2 + Math.floor(random()*(W-4));
      const cy = 2 + Math.floor(random()*(H-4));
      const radius = 2 + Math.floor(random()*4);
      const height = random()*0.4 + 0.4;
      for(let y=cy-radius; y<=cy+radius; y++){
        for(let x=cx-radius; x<=cx+radius; x++){
          if(!ctx.inBounds(x,y)) continue;
          const dx=x-cx, dy=y-cy;
          if(dx*dx + dy*dy <= radius*radius){
            ctx.setFloorColor(x,y,'#f8e0a0');
            if(random()<height*0.5){
              ctx.set(x,y,1);
              ctx.setWallColor(x,y,'#d9b371');
            }
          }
        }
      }
    }

    // Scatter tattered shelters
    for(let k=0;k<Math.max(4, Math.floor(W/8));k++){
      const rx = 2 + Math.floor(random()*(W-4));
      const ry = 2 + Math.floor(random()*(H-4));
      const rw = 2 + Math.floor(random()*3);
      const rh = 2 + Math.floor(random()*3);
      for(let y=ry; y<ry+rh; y++){
        for(let x=rx; x<rx+rw; x++) if(ctx.inBounds(x,y)){
          if(y===ry || y===ry+rh-1 || x===rx || x===rx+rw-1){
            ctx.set(x,y,1);
            ctx.setWallColor(x,y,'#b08968');
          }else{
            ctx.set(x,y,0);
            ctx.setFloorColor(x,y,'#edd4a1');
          }
        }
      }
    }

    ctx.ensureConnectivity();
  }

  const gen = {
    id: 'sandstorm-expanse',
    name: '砂嵐の砂漠',
    description: '砂嵐が吹き荒れ視界が遮られる灼熱の砂漠',
    algorithm,
    mixin: { normalMixed: 0.3, blockDimMixed: 0.5, tags: ['desert','storm'] },
    effects: { dark: true }
  };

  function mkBoss(depth){ const r=[]; if(depth>=5) r.push(5); if(depth>=10) r.push(10); if(depth>=15) r.push(15); return r; }
  const blocks = {
    blocks1:[
      { key:'sand_theme_01', name:'Sandstorm Theme I', level:+0,  size:0,  depth:+1, chest:'normal', type:'sandstorm-expanse', bossFloors:mkBoss(6) },
      { key:'sand_theme_02', name:'Sandstorm Theme II',level:+7,  size:+1, depth:+1, chest:'less',   type:'sandstorm-expanse', bossFloors:mkBoss(8) },
      { key:'sand_theme_03', name:'Sandstorm Theme III',level:+14, size:+1, depth:+2, chest:'more',  type:'sandstorm-expanse', bossFloors:mkBoss(10) },
      { key:'sand_theme_04', name:'Sandstorm Theme IV', level:+21, size:+2, depth:+2, chest:'normal',type:'sandstorm-expanse', bossFloors:mkBoss(12) },
      { key:'sand_theme_05', name:'Sandstorm Theme V',  level:+28, size:+2, depth:+3, chest:'less',  type:'sandstorm-expanse', bossFloors:mkBoss(15) },
    ],
    blocks2:[
      { key:'sand_core_01', name:'Sandstorm Core I', level:+0,  size:+1, depth:0, chest:'normal', type:'sandstorm-expanse' },
      { key:'sand_core_02', name:'Sandstorm Core II',level:+6,  size:+1, depth:+1, chest:'more',  type:'sandstorm-expanse' },
      { key:'sand_core_03', name:'Sandstorm Core III',level:+12, size:+2, depth:+1, chest:'less', type:'sandstorm-expanse' },
      { key:'sand_core_04', name:'Sandstorm Core IV',level:+18, size:+2, depth:+2, chest:'normal',type:'sandstorm-expanse' },
      { key:'sand_core_05', name:'Sandstorm Core V', level:+24, size:+3, depth:+2, chest:'more',  type:'sandstorm-expanse' },
    ],
    blocks3:[
      { key:'sand_relic_01', name:'Sandstorm Relic I', level:+0,  size:0,  depth:+2, chest:'more',   type:'sandstorm-expanse', bossFloors:[5] },
      { key:'sand_relic_02', name:'Sandstorm Relic II',level:+9,  size:+1, depth:+2, chest:'normal', type:'sandstorm-expanse', bossFloors:[10] },
      { key:'sand_relic_03', name:'Sandstorm Relic III',level:+18, size:+1, depth:+3, chest:'less', type:'sandstorm-expanse', bossFloors:[15] },
      { key:'sand_relic_04', name:'Sandstorm Relic IV', level:+24, size:+2, depth:+3, chest:'more', type:'sandstorm-expanse', bossFloors:[10,15] },
      { key:'sand_relic_05', name:'Sandstorm Relic V',  level:+30, size:+2, depth:+4, chest:'normal',type:'sandstorm-expanse', bossFloors:[5,10,15] },
    ]
  };

  window.registerDungeonAddon({ id:'sandstorm_pack', name:'Sandstorm Expanse Pack', version:'1.0.0', blocks, generators:[gen] });
})();

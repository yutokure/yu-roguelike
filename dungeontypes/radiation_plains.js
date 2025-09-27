// Addon: Radiation Plains - open fields with hazardous fallout
(function(){
  function algorithm(ctx){
    const W = ctx.width, H = ctx.height;
    const random = ctx.random;

    for(let y=1;y<H-1;y++){
      for(let x=1;x<W-1;x++) if(ctx.inBounds(x,y)){
        ctx.set(x,y,0);
        ctx.setFloorColor(x,y,'#cde47b');
      }
    }

    const craters = Math.max(6, Math.floor((W*H)/150));
    for(let i=0;i<craters;i++){
      const cx = 2 + Math.floor(random()*(W-4));
      const cy = 2 + Math.floor(random()*(H-4));
      const radius = 2 + Math.floor(random()*3);
      for(let y=cy-radius; y<=cy+radius; y++){
        for(let x=cx-radius; x<=cx+radius; x++){
          if(!ctx.inBounds(x,y)) continue;
          const dx=x-cx, dy=y-cy;
          if(dx*dx + dy*dy <= radius*radius){
            ctx.set(x,y,0);
            ctx.setFloorColor(x,y,'#b4d455');
            if(random()<0.25){
              ctx.setFloorType(x,y,'poison');
            }
          }
        }
      }
    }

    // Scatter broken reactors as obstacles
    const reactors = Math.max(4, Math.floor(W/12));
    for(let i=0;i<reactors;i++){
      const rx = 2 + Math.floor(random()*(W-6));
      const ry = 2 + Math.floor(random()*(H-6));
      const rw = 2 + Math.floor(random()*2);
      const rh = 2 + Math.floor(random()*2);
      for(let y=ry; y<ry+rh; y++){
        for(let x=rx; x<rx+rw; x++) if(ctx.inBounds(x,y)){
          ctx.set(x,y,1);
          ctx.setWallColor(x,y,'#6a7a40');
        }
      }
    }

    ctx.ensureConnectivity();
  }

  const gen = {
    id: 'radiation-plains',
    name: '放射線の平原',
    description: '残留放射線が漂い床自体が有害な荒廃した平原',
    algorithm,
    mixin: { normalMixed: 0.35, blockDimMixed: 0.45, tags: ['fields','poison'] },
    effects: { poisonMist: true }
  };

  function mkBoss(depth){ const r=[]; if(depth>=5) r.push(5); if(depth>=10) r.push(10); if(depth>=15) r.push(15); return r; }
  const blocks = {
    blocks1:[
      { key:'rad_theme_01', name:'Radiation Theme I', level:+0,  size:0,  depth:+1, chest:'normal', type:'radiation-plains', bossFloors:mkBoss(6) },
      { key:'rad_theme_02', name:'Radiation Theme II',level:+7,  size:+1, depth:+1, chest:'less',   type:'radiation-plains', bossFloors:mkBoss(8) },
      { key:'rad_theme_03', name:'Radiation Theme III',level:+14, size:+1, depth:+2, chest:'more',  type:'radiation-plains', bossFloors:mkBoss(10) },
      { key:'rad_theme_04', name:'Radiation Theme IV', level:+21, size:+2, depth:+2, chest:'normal',type:'radiation-plains', bossFloors:mkBoss(12) },
      { key:'rad_theme_05', name:'Radiation Theme V',  level:+28, size:+2, depth:+3, chest:'less',  type:'radiation-plains', bossFloors:mkBoss(15) },
    ],
    blocks2:[
      { key:'rad_core_01', name:'Radiation Core I', level:+0,  size:+1, depth:0, chest:'normal', type:'radiation-plains' },
      { key:'rad_core_02', name:'Radiation Core II',level:+6,  size:+1, depth:+1, chest:'more',  type:'radiation-plains' },
      { key:'rad_core_03', name:'Radiation Core III',level:+12, size:+2, depth:+1, chest:'less', type:'radiation-plains' },
      { key:'rad_core_04', name:'Radiation Core IV',level:+18, size:+2, depth:+2, chest:'normal',type:'radiation-plains' },
      { key:'rad_core_05', name:'Radiation Core V', level:+24, size:+3, depth:+2, chest:'more',  type:'radiation-plains' },
    ],
    blocks3:[
      { key:'rad_relic_01', name:'Radiation Relic I', level:+0,  size:0,  depth:+2, chest:'more',   type:'radiation-plains', bossFloors:[5] },
      { key:'rad_relic_02', name:'Radiation Relic II',level:+9,  size:+1, depth:+2, chest:'normal', type:'radiation-plains', bossFloors:[10] },
      { key:'rad_relic_03', name:'Radiation Relic III',level:+18, size:+1, depth:+3, chest:'less', type:'radiation-plains', bossFloors:[15] },
      { key:'rad_relic_04', name:'Radiation Relic IV', level:+24, size:+2, depth:+3, chest:'more', type:'radiation-plains', bossFloors:[10,15] },
      { key:'rad_relic_05', name:'Radiation Relic V',  level:+30, size:+2, depth:+4, chest:'normal',type:'radiation-plains', bossFloors:[5,10,15] },
    ]
  };

  window.registerDungeonAddon({ id:'radiation_pack', name:'Radiation Plains Pack', version:'1.0.0', blocks, generators:[gen] });
})();

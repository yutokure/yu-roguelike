// Addon: Toxic Boglands - open space with scattered poison marshes
(function(){
  function algorithm(ctx){
    const W=ctx.width, H=ctx.height;
    const random=ctx.random;

    for(let y=1;y<H-1;y++){
      for(let x=1;x<W-1;x++) if(ctx.inBounds(x,y)){
        ctx.set(x,y,0);
        ctx.setFloorColor(x,y,'#d8f5a2');
      }
    }

    const pools = Math.max(5, Math.floor((W*H)/120));
    for(let i=0;i<pools;i++){
      const cx = 2 + Math.floor(random()*(W-4));
      const cy = 2 + Math.floor(random()*(H-4));
      const radius = 1 + Math.floor(random()*3);
      for(let y=cy-radius; y<=cy+radius; y++){
        for(let x=cx-radius; x<=cx+radius; x++){
          const dx=x-cx, dy=y-cy;
          if(dx*dx + dy*dy <= radius*radius && ctx.inBounds(x,y)){
            ctx.set(x,y,0);
            ctx.setFloorColor(x,y,'#9be15d');
            ctx.setFloorType(x,y,'poison');
          }
        }
      }
    }

    // Add sparse pillars for variety
    for(let k=0;k<Math.max(4, Math.floor(W/10)); k++){
      const x = 2 + Math.floor(random()*(W-4));
      const y = 2 + Math.floor(random()*(H-4));
      if(random()<0.4) continue;
      ctx.set(x,y,1);
      ctx.setWallColor(x,y,'#6c757d');
    }

    ctx.ensureConnectivity();
  }

    const gen = {
    id: 'toxic-boglands',
    name: '毒沼空間',
    description: '広い空間に点在する毒沼が漂う湿地帯',
    algorithm,
    mixin: { normalMixed: 0.35, blockDimMixed: 0.45, tags: ['open-space','poison'] }
  };

  function mkBoss(depth){ const r=[]; if(depth>=5) r.push(5); if(depth>=10) r.push(10); if(depth>=15) r.push(15); return r; }
  const blocks = {
    blocks1:[
      { key:'bog_theme_01', name:'Bog Theme I', level:+0,  size:0,  depth:+1, chest:'normal', type:'toxic-boglands', bossFloors:mkBoss(6) },
      { key:'bog_theme_02', name:'Bog Theme II',level:+7,  size:+1, depth:+1, chest:'less',   type:'toxic-boglands', bossFloors:mkBoss(8) },
      { key:'bog_theme_03', name:'Bog Theme III',level:+14, size:+1, depth:+2, chest:'more',  type:'toxic-boglands', bossFloors:mkBoss(10) },
      { key:'bog_theme_04', name:'Bog Theme IV', level:+21, size:+2, depth:+2, chest:'normal',type:'toxic-boglands', bossFloors:mkBoss(12) },
      { key:'bog_theme_05', name:'Bog Theme V',  level:+28, size:+2, depth:+3, chest:'less',  type:'toxic-boglands', bossFloors:mkBoss(15) },
    ],
    blocks2:[
      { key:'bog_core_01', name:'Bog Core I', level:+0,  size:+1, depth:0, chest:'normal', type:'toxic-boglands' },
      { key:'bog_core_02', name:'Bog Core II',level:+6,  size:+1, depth:+1, chest:'more',  type:'toxic-boglands' },
      { key:'bog_core_03', name:'Bog Core III',level:+12, size:+2, depth:+1, chest:'less', type:'toxic-boglands' },
      { key:'bog_core_04', name:'Bog Core IV',level:+18, size:+2, depth:+2, chest:'normal',type:'toxic-boglands' },
      { key:'bog_core_05', name:'Bog Core V', level:+24, size:+3, depth:+2, chest:'more',  type:'toxic-boglands' },
    ],
    blocks3:[
      { key:'bog_relic_01', name:'Bog Relic I', level:+0,  size:0,  depth:+2, chest:'more',   type:'toxic-boglands', bossFloors:[5] },
      { key:'bog_relic_02', name:'Bog Relic II',level:+9,  size:+1, depth:+2, chest:'normal', type:'toxic-boglands', bossFloors:[10] },
      { key:'bog_relic_03', name:'Bog Relic III',level:+18, size:+1, depth:+3, chest:'less', type:'toxic-boglands', bossFloors:[15] },
      { key:'bog_relic_04', name:'Bog Relic IV', level:+24, size:+2, depth:+3, chest:'more', type:'toxic-boglands', bossFloors:[10,15] },
      { key:'bog_relic_05', name:'Bog Relic V',  level:+30, size:+2, depth:+4, chest:'normal',type:'toxic-boglands', bossFloors:[5,10,15] },
    ]
  };

  window.registerDungeonAddon({ id:'bog_pack', name:'Toxic Boglands Pack', version:'1.0.0', blocks, generators:[gen] });
})();

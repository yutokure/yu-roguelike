// Addon: Lightless Caverns - winding cave tunnels with limited lighting
(function(){
  function algorithm(ctx){
    const W = ctx.width, H = ctx.height;
    const random = ctx.random;

    for(let y=1;y<H-1;y++){
      for(let x=1;x<W-1;x++) if(ctx.inBounds(x,y)){
        ctx.set(x,y,1);
        ctx.setWallColor(x,y,'#2d2d34');
      }
    }

    const carve = (cx, cy, length, dir)=>{
      let x=cx, y=cy;
      for(let i=0;i<length;i++){
        if(!ctx.inBounds(x,y)) break;
        ctx.set(x,y,0);
        ctx.setFloorColor(x,y,'#3f3f46');
        if(random()<0.05){
          const branchDir = dir + (random()<0.5?-1:1);
          carve(x, y, 4 + Math.floor(random()*4), branchDir);
        }
        const step = [[1,0],[0,1],[-1,0],[0,-1]][((dir%4)+4)%4];
        x += step[0];
        y += step[1];
        if(random()<0.2){
          dir = (dir + (random()<0.5?1:-1)+4)%4;
        }
      }
    };

    const tunnels = 5 + Math.floor(random()*4);
    for(let i=0;i<tunnels;i++){
      const cx = 2 + Math.floor(random()*(W-4));
      const cy = 2 + Math.floor(random()*(H-4));
      carve(cx, cy, Math.floor(W+H)/2, Math.floor(random()*4));

      if(random()<0.6){
        const roomRadius = 2 + Math.floor(random()*3);
        for(let yy=cy-roomRadius; yy<=cy+roomRadius; yy++){
          for(let xx=cx-roomRadius; xx<=cx+roomRadius; xx++){
            if(!ctx.inBounds(xx,yy)) continue;
            const dx=xx-cx, dy=yy-cy;
            if(dx*dx+dy*dy <= roomRadius*roomRadius){
              ctx.set(xx,yy,0);
              ctx.setFloorColor(xx,yy,'#454550');
            }
          }
        }
      }
    }

    ctx.ensureConnectivity();
  }

  const gen = {
    id: 'lightless-caverns',
    name: '暗い洞窟',
    description: '光がほとんど届かない曲がりくねった洞窟',
    algorithm,
    mixin: { normalMixed: 0.45, blockDimMixed: 0.4, tags: ['cave','dark'] },
    effects: { dark: true }
  };

  function mkBoss(depth){ const r=[]; if(depth>=5) r.push(5); if(depth>=10) r.push(10); if(depth>=15) r.push(15); return r; }
  const blocks = {
    blocks1:[
      { key:'cave_theme_01', name:'Cave Theme I', level:+0,  size:0,  depth:+1, chest:'normal', type:'lightless-caverns', bossFloors:mkBoss(6) },
      { key:'cave_theme_02', name:'Cave Theme II',level:+7,  size:+1, depth:+1, chest:'less',   type:'lightless-caverns', bossFloors:mkBoss(8) },
      { key:'cave_theme_03', name:'Cave Theme III',level:+14, size:+1, depth:+2, chest:'more',  type:'lightless-caverns', bossFloors:mkBoss(10) },
      { key:'cave_theme_04', name:'Cave Theme IV', level:+21, size:+2, depth:+2, chest:'normal',type:'lightless-caverns', bossFloors:mkBoss(12) },
      { key:'cave_theme_05', name:'Cave Theme V',  level:+28, size:+2, depth:+3, chest:'less',  type:'lightless-caverns', bossFloors:mkBoss(15) },
    ],
    blocks2:[
      { key:'cave_core_01', name:'Cave Core I', level:+0,  size:+1, depth:0, chest:'normal', type:'lightless-caverns' },
      { key:'cave_core_02', name:'Cave Core II',level:+6,  size:+1, depth:+1, chest:'more',  type:'lightless-caverns' },
      { key:'cave_core_03', name:'Cave Core III',level:+12, size:+2, depth:+1, chest:'less', type:'lightless-caverns' },
      { key:'cave_core_04', name:'Cave Core IV',level:+18, size:+2, depth:+2, chest:'normal',type:'lightless-caverns' },
      { key:'cave_core_05', name:'Cave Core V', level:+24, size:+3, depth:+2, chest:'more',  type:'lightless-caverns' },
    ],
    blocks3:[
      { key:'cave_relic_01', name:'Cave Relic I', level:+0,  size:0,  depth:+2, chest:'more',   type:'lightless-caverns', bossFloors:[5] },
      { key:'cave_relic_02', name:'Cave Relic II',level:+9,  size:+1, depth:+2, chest:'normal', type:'lightless-caverns', bossFloors:[10] },
      { key:'cave_relic_03', name:'Cave Relic III',level:+18, size:+1, depth:+3, chest:'less', type:'lightless-caverns', bossFloors:[15] },
      { key:'cave_relic_04', name:'Cave Relic IV', level:+24, size:+2, depth:+3, chest:'more', type:'lightless-caverns', bossFloors:[10,15] },
      { key:'cave_relic_05', name:'Cave Relic V',  level:+30, size:+2, depth:+4, chest:'normal',type:'lightless-caverns', bossFloors:[5,10,15] },
    ]
  };

  window.registerDungeonAddon({ id:'dark_cave_pack', name:'Lightless Caverns Pack', version:'1.0.0', blocks, generators:[gen] });
})();

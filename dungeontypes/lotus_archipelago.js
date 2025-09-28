// Addon: Lotus Archipelago - floating isles with lotus blooms
(function(){
  function carveEllipse(ctx,cx,cy,rx,ry){
    for(let y=-ry;y<=ry;y++){
      for(let x=-rx;x<=rx;x++){
        const nx=cx+x, ny=cy+y;
        if(!ctx.inBounds(nx,ny)) continue;
        const v = (x*x)/(rx*rx) + (y*y)/(ry*ry);
        if(v<=1.1) ctx.set(nx,ny,0);
      }
    }
  }

  function connect(ctx,a,b){
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    for(let i=0;i<=steps;i++){
      const t = i/steps;
      const x = Math.round(a.x + dx*t);
      const y = Math.round(a.y + dy*t);
      for(let oy=-1; oy<=1; oy++)
        for(let ox=-1; ox<=1; ox++)
          if(ctx.inBounds(x+ox,y+oy)) ctx.set(x+ox,y+oy,0);
    }
  }

  function algorithm(ctx){
    const {width:W,height:H} = ctx;
    for(let y=0;y<H;y++)
      for(let x=0;x<W;x++) ctx.set(x,y,1);

    const isles=[];
    const isleCount = 6;
    for(let i=0;i<isleCount;i++){
      const cx = 3 + Math.floor(ctx.random()*(W-6));
      const cy = 3 + Math.floor(ctx.random()*(H-6));
      const rx = 2 + Math.floor(ctx.random()*3);
      const ry = 2 + Math.floor(ctx.random()*3);
      carveEllipse(ctx,cx,cy,rx,ry);
      isles.push({x:cx,y:cy});
    }

    isles.sort((a,b)=>a.x-b.x);
    for(let i=0;i<isles.length-1;i++) connect(ctx,isles[i],isles[i+1]);

    for(let y=1;y<H-1;y++){
      for(let x=1;x<W-1;x++){
        if(ctx.get(x,y)===0){
          const bloom = (Math.sin(x*0.4)+Math.cos(y*0.3)+2)/4;
          const r = Math.floor(lerp(180,240,bloom));
          const g = Math.floor(lerp(120,200,bloom));
          const b = Math.floor(lerp(160,220,bloom));
          ctx.setFloorColor(x,y,`rgb(${r},${g},${b})`);
          if(ctx.random()<0.07) ctx.setFloorType(x,y,'normal');
        } else {
          const mist = (Math.sin((x+y)*0.2)+1)/2;
          const color = `rgb(${Math.floor(lerp(90,140,mist))},${Math.floor(lerp(110,160,mist))},${Math.floor(lerp(170,220,mist))})`;
          ctx.setWallColor(x,y,color);
        }
      }
    }

    ctx.ensureConnectivity();
  }

  function lerp(a,b,t){ return a + (b-a)*t; }

  const gen = {
    id: 'lotus-archipelago',
    name: '蓮華群島',
    description: '浮遊する蓮の島々を繋ぐ光の橋',
    algorithm,
    mixin: { normalMixed: 0.55, blockDimMixed: 0.6, tags: ['floating','garden','mystic'] }
  };

  function mkBoss(depth){
    const floors=[];
    if(depth>=5) floors.push(5);
    if(depth>=9) floors.push(9);
    if(depth>=13) floors.push(13);
    if(depth>=17) floors.push(17);
    if(depth>=21) floors.push(21);
    return floors;
  }

  const blocks = {
    blocks1:[
      { key:'lotus_theme_01', name:'Lotus Theme I', level:+0,  size:0,  depth:+1, chest:'normal', type:'lotus-archipelago', bossFloors:mkBoss(5) },
      { key:'lotus_theme_02', name:'Lotus Theme II',level:+4,  size:+1, depth:+1, chest:'more',   type:'lotus-archipelago', bossFloors:mkBoss(7) },
      { key:'lotus_theme_03', name:'Lotus Theme III',level:+8, size:+1, depth:+2, chest:'less',   type:'lotus-archipelago', bossFloors:mkBoss(9) },
      { key:'lotus_theme_04', name:'Lotus Theme IV',level:+12, size:+2, depth:+2, chest:'normal', type:'lotus-archipelago', bossFloors:mkBoss(11) },
      { key:'lotus_theme_05', name:'Lotus Theme V', level:+16, size:+2, depth:+3, chest:'more',   type:'lotus-archipelago', bossFloors:mkBoss(13) },
      { key:'lotus_theme_06', name:'Lotus Theme VI',level:+20, size:+2, depth:+3, chest:'less',   type:'lotus-archipelago', bossFloors:mkBoss(15) },
      { key:'lotus_theme_07', name:'Lotus Theme VII',level:+24,size:+3, depth:+4, chest:'normal', type:'lotus-archipelago', bossFloors:mkBoss(17) }
    ],
    blocks2:[
      { key:'isle_link_01', name:'Isle Link I', level:+0,  size:+1, depth:0,  chest:'normal', type:'lotus-archipelago' },
      { key:'isle_link_02', name:'Isle Link II',level:+3,  size:+1, depth:+1, chest:'less',   type:'lotus-archipelago' },
      { key:'isle_link_03', name:'Isle Link III',level:+6, size:+1, depth:+1, chest:'normal', type:'lotus-archipelago' },
      { key:'isle_link_04', name:'Isle Link IV',level:+9,  size:+2, depth:+2, chest:'more',   type:'lotus-archipelago' },
      { key:'isle_link_05', name:'Isle Link V', level:+12, size:+2, depth:+2, chest:'less',   type:'lotus-archipelago' },
      { key:'isle_link_06', name:'Isle Link VI',level:+15, size:+2, depth:+3, chest:'normal', type:'lotus-archipelago' },
      { key:'isle_link_07', name:'Isle Link VII',level:+18,size:+3, depth:+3, chest:'more',   type:'lotus-archipelago' }
    ],
    blocks3:[
      { key:'lotus_sanctum_01', name:'Lotus Sanctum I', level:+0,  size:0,  depth:+2, chest:'more',   type:'lotus-archipelago', bossFloors:[5] },
      { key:'lotus_sanctum_02', name:'Lotus Sanctum II',level:+5,  size:+1, depth:+2, chest:'normal', type:'lotus-archipelago', bossFloors:[9] },
      { key:'lotus_sanctum_03', name:'Lotus Sanctum III',level:+10,size:+1, depth:+3, chest:'less',   type:'lotus-archipelago', bossFloors:[13] },
      { key:'lotus_sanctum_04', name:'Lotus Sanctum IV', level:+15,size:+2, depth:+3, chest:'more',   type:'lotus-archipelago', bossFloors:[17] },
      { key:'lotus_sanctum_05', name:'Lotus Sanctum V',  level:+20,size:+2, depth:+4, chest:'normal', type:'lotus-archipelago', bossFloors:[21] },
      { key:'lotus_sanctum_06', name:'Lotus Sanctum VI', level:+25,size:+3, depth:+4, chest:'more',   type:'lotus-archipelago', bossFloors:[11,21] }
    ]
  };

  window.registerDungeonAddon({ id:'lotus_archipelago_pack', name:'Lotus Archipelago Pack', version:'1.0.0', blocks, generators:[gen] });
})();

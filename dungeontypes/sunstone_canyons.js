// Addon: Sunstone Canyons - sunlit slot canyons with warm winds
(function(){
  function algorithm(ctx){
    const {width:W,height:H} = ctx;
    for(let y=0;y<H;y++)
      for(let x=0;x<W;x++) ctx.set(x,y,1);

    let currentY = Math.floor(H/2);
    for(let x=1;x<W-1;x++){
      currentY += Math.floor((ctx.random()-0.5)*3);
      currentY = Math.max(2, Math.min(H-3,currentY));
      for(let w=-2;w<=2;w++){
        const ny = currentY+w;
        if(ctx.inBounds(x,ny)) ctx.set(x,ny,0);
        if(ctx.random()<0.4 && ctx.inBounds(x+1,ny)) ctx.set(x+1,ny,0);
      }
      if(x%6===0){
        const branchY = currentY + (ctx.random()<0.5?-1:1)* (2+Math.floor(ctx.random()*3));
        for(let y=currentY; Math.abs(y-branchY)>0 && y>1 && y<H-2; y += branchY>currentY?1:-1){
          if(ctx.random()<0.8) ctx.set(x,y,0);
        }
      }
    }

    for(let y=1;y<H-1;y++){
      const t = y/(H-1);
      const floorColor = `rgb(${Math.floor(lerp(210,255,t))},${Math.floor(lerp(150,190,t))},${Math.floor(lerp(90,130,t))})`;
      const wallColor = `rgb(${Math.floor(lerp(120,180,t))},${Math.floor(lerp(70,120,t))},${Math.floor(lerp(40,80,t))})`;
      for(let x=1;x<W-1;x++){
        if(ctx.get(x,y)===0){
          ctx.setFloorColor(x,y,floorColor);
          if(ctx.random()<0.04) ctx.setFloorType(x,y,'normal');
        } else {
          ctx.setWallColor(x,y,wallColor);
        }
      }
    }

    ctx.ensureConnectivity();
  }

  function lerp(a,b,t){ return a + (b-a)*t; }

  const gen = {
    id: 'sunstone-canyons',
    name: '陽石峡谷',
    description: '太陽に焼かれた狭隘な峡谷が風で形を変える',
    algorithm,
    mixin: { normalMixed: 0.35, blockDimMixed: 0.45, tags: ['canyon','wind','arid'] }
  };

  function mkBoss(depth){
    const floors=[];
    if(depth>=6) floors.push(6);
    if(depth>=10) floors.push(10);
    if(depth>=14) floors.push(14);
    if(depth>=18) floors.push(18);
    if(depth>=22) floors.push(22);
    return floors;
  }

  const blocks = {
    blocks1:[
      { key:'sunstone_theme_01', name:'Sunstone Theme I', level:+0,  size:0,  depth:+1, chest:'normal', type:'sunstone-canyons', bossFloors:mkBoss(6) },
      { key:'sunstone_theme_02', name:'Sunstone Theme II',level:+5,  size:+1, depth:+1, chest:'less',   type:'sunstone-canyons', bossFloors:mkBoss(8) },
      { key:'sunstone_theme_03', name:'Sunstone Theme III',level:+10, size:+1, depth:+2, chest:'more', type:'sunstone-canyons', bossFloors:mkBoss(10) },
      { key:'sunstone_theme_04', name:'Sunstone Theme IV',level:+15, size:+2, depth:+2, chest:'normal', type:'sunstone-canyons', bossFloors:mkBoss(12) },
      { key:'sunstone_theme_05', name:'Sunstone Theme V', level:+20, size:+2, depth:+3, chest:'more',  type:'sunstone-canyons', bossFloors:mkBoss(14) },
      { key:'sunstone_theme_06', name:'Sunstone Theme VI',level:+24, size:+2, depth:+3, chest:'less',  type:'sunstone-canyons', bossFloors:mkBoss(16) },
      { key:'sunstone_theme_07', name:'Sunstone Theme VII',level:+28,size:+3, depth:+4, chest:'normal',type:'sunstone-canyons', bossFloors:mkBoss(18) }
    ],
    blocks2:[
      { key:'canyon_pass_01', name:'Canyon Pass I', level:+0,  size:+1, depth:0,  chest:'normal', type:'sunstone-canyons' },
      { key:'canyon_pass_02', name:'Canyon Pass II',level:+4,  size:+1, depth:+1, chest:'less',   type:'sunstone-canyons' },
      { key:'canyon_pass_03', name:'Canyon Pass III',level:+8, size:+1, depth:+1, chest:'normal', type:'sunstone-canyons' },
      { key:'canyon_pass_04', name:'Canyon Pass IV',level:+12, size:+2, depth:+2, chest:'more',   type:'sunstone-canyons' },
      { key:'canyon_pass_05', name:'Canyon Pass V', level:+16, size:+2, depth:+2, chest:'less',   type:'sunstone-canyons' },
      { key:'canyon_pass_06', name:'Canyon Pass VI',level:+20, size:+2, depth:+3, chest:'normal', type:'sunstone-canyons' },
      { key:'canyon_pass_07', name:'Canyon Pass VII',level:+24,size:+3, depth:+3, chest:'more',   type:'sunstone-canyons' }
    ],
    blocks3:[
      { key:'sun_altar_01', name:'Sun Altar I', level:+0,  size:0,  depth:+2, chest:'more',   type:'sunstone-canyons', bossFloors:[6] },
      { key:'sun_altar_02', name:'Sun Altar II',level:+6,  size:+1, depth:+2, chest:'normal', type:'sunstone-canyons', bossFloors:[10] },
      { key:'sun_altar_03', name:'Sun Altar III',level:+12,size:+1, depth:+3, chest:'less',   type:'sunstone-canyons', bossFloors:[14] },
      { key:'sun_altar_04', name:'Sun Altar IV', level:+18,size:+2, depth:+3, chest:'more',   type:'sunstone-canyons', bossFloors:[18] },
      { key:'sun_altar_05', name:'Sun Altar V',  level:+24,size:+2, depth:+4, chest:'normal', type:'sunstone-canyons', bossFloors:[22] },
      { key:'sun_altar_06', name:'Sun Altar VI', level:+30,size:+3, depth:+4, chest:'more',   type:'sunstone-canyons', bossFloors:[12,22] }
    ]
  };

  window.registerDungeonAddon({ id:'sunstone_canyons_pack', name:'Sunstone Canyons Pack', version:'1.0.0', blocks, generators:[gen] });
})();

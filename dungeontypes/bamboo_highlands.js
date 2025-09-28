// Addon: Bamboo Highlands - terraced bamboo groves and ridges
(function(){
  function algorithm(ctx){
    const {width:W,height:H} = ctx;
    for(let y=0;y<H;y++)
      for(let x=0;x<W;x++) ctx.set(x,y,1);

    for(let x=2;x<W-2;x+=3){
      for(let y=1;y<H-1;y++){
        if(ctx.random()<0.8) ctx.set(x,y,0);
        if(ctx.random()<0.4) ctx.set(x-1,y,0);
      }
    }

    for(let y=2;y<H-2;y+=4){
      for(let x=1;x<W-1;x++){
        if(ctx.random()<0.7) ctx.set(x,y,0);
      }
    }

    for(let y=1;y<H-1;y++){
      for(let x=1;x<W-1;x++){
        if(ctx.get(x,y)===0){
          const terrace = Math.floor(y/4)%2;
          const shade = terrace? '#9bd37a' : '#b2e58a';
          ctx.setFloorColor(x,y,shade);
          if(ctx.random()<0.08) ctx.setFloorType(x,y,'normal');
        } else {
          const groove = (x+y)%3===0;
          ctx.setWallColor(x,y, groove ? '#556b2f' : '#6f8f37');
        }
      }
    }

    ctx.ensureConnectivity();
  }

  const gen = {
    id: 'bamboo-highlands',
    name: '竹嶺段丘',
    description: '段々の高地に竹が密生する風鳴りの谷',
    algorithm,
    mixin: { normalMixed: 0.5, blockDimMixed: 0.6, tags: ['forest','terrace','wind'] }
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
      { key:'bamboo_theme_01', name:'Bamboo Theme I', level:+0,  size:0,  depth:+1, chest:'normal', type:'bamboo-highlands', bossFloors:mkBoss(5) },
      { key:'bamboo_theme_02', name:'Bamboo Theme II',level:+4,  size:+1, depth:+1, chest:'less',   type:'bamboo-highlands', bossFloors:mkBoss(7) },
      { key:'bamboo_theme_03', name:'Bamboo Theme III',level:+8, size:+1, depth:+2, chest:'more',  type:'bamboo-highlands', bossFloors:mkBoss(9) },
      { key:'bamboo_theme_04', name:'Bamboo Theme IV',level:+12, size:+1, depth:+2, chest:'normal', type:'bamboo-highlands', bossFloors:mkBoss(11) },
      { key:'bamboo_theme_05', name:'Bamboo Theme V', level:+16, size:+2, depth:+3, chest:'more',  type:'bamboo-highlands', bossFloors:mkBoss(13) },
      { key:'bamboo_theme_06', name:'Bamboo Theme VI',level:+20, size:+2, depth:+3, chest:'less',  type:'bamboo-highlands', bossFloors:mkBoss(15) },
      { key:'bamboo_theme_07', name:'Bamboo Theme VII',level:+24,size:+2, depth:+4, chest:'normal',type:'bamboo-highlands', bossFloors:mkBoss(17) }
    ],
    blocks2:[
      { key:'bamboo_ridge_01', name:'Bamboo Ridge I', level:+0,  size:+1, depth:0,  chest:'normal', type:'bamboo-highlands' },
      { key:'bamboo_ridge_02', name:'Bamboo Ridge II',level:+3,  size:+1, depth:+1, chest:'less',   type:'bamboo-highlands' },
      { key:'bamboo_ridge_03', name:'Bamboo Ridge III',level:+6, size:+1, depth:+1, chest:'normal', type:'bamboo-highlands' },
      { key:'bamboo_ridge_04', name:'Bamboo Ridge IV',level:+9,  size:+2, depth:+2, chest:'more',   type:'bamboo-highlands' },
      { key:'bamboo_ridge_05', name:'Bamboo Ridge V', level:+12, size:+2, depth:+2, chest:'less',   type:'bamboo-highlands' },
      { key:'bamboo_ridge_06', name:'Bamboo Ridge VI',level:+15, size:+2, depth:+3, chest:'normal', type:'bamboo-highlands' },
      { key:'bamboo_ridge_07', name:'Bamboo Ridge VII',level:+18,size:+3, depth:+3, chest:'more',   type:'bamboo-highlands' }
    ],
    blocks3:[
      { key:'bamboo_zen_01', name:'Bamboo Zen I', level:+0,  size:0,  depth:+2, chest:'more',   type:'bamboo-highlands', bossFloors:[5] },
      { key:'bamboo_zen_02', name:'Bamboo Zen II',level:+5,  size:+1, depth:+2, chest:'normal', type:'bamboo-highlands', bossFloors:[9] },
      { key:'bamboo_zen_03', name:'Bamboo Zen III',level:+10,size:+1, depth:+3, chest:'less',   type:'bamboo-highlands', bossFloors:[13] },
      { key:'bamboo_zen_04', name:'Bamboo Zen IV', level:+15,size:+2, depth:+3, chest:'more',   type:'bamboo-highlands', bossFloors:[17] },
      { key:'bamboo_zen_05', name:'Bamboo Zen V',  level:+20,size:+2, depth:+4, chest:'normal', type:'bamboo-highlands', bossFloors:[21] },
      { key:'bamboo_zen_06', name:'Bamboo Zen VI', level:+25,size:+3, depth:+4, chest:'more',   type:'bamboo-highlands', bossFloors:[11,21] }
    ]
  };

  window.registerDungeonAddon({ id:'bamboo_highlands_pack', name:'Bamboo Highlands Pack', version:'1.0.0', blocks, generators:[gen] });
})();

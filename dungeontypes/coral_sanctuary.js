// Addon: Coral Sanctuary - tidepools and coral labyrinths
(function(){
  function carveCircle(ctx,cx,cy,r){
    for(let y=-r;y<=r;y++){
      for(let x=-r;x<=r;x++){
        const nx=cx+x, ny=cy+y;
        if(!ctx.inBounds(nx,ny)) continue;
        if(x*x + y*y <= r*r) ctx.set(nx,ny,0);
      }
    }
  }

  function scatterCoral(ctx,count){
    for(let i=0;i<count;i++){
      const cx = 2 + Math.floor(ctx.random()*(ctx.width-4));
      const cy = 2 + Math.floor(ctx.random()*(ctx.height-4));
      const r = 2 + Math.floor(ctx.random()*3);
      carveCircle(ctx,cx,cy,r);
    }
  }

  function linkPools(ctx,points){
    for(let i=0;i<points.length-1;i++){
      const a=points[i], b=points[i+1];
      let x=a.x, y=a.y;
      while(x!==b.x || y!==b.y){
        if(ctx.inBounds(x,y)) ctx.set(x,y,0);
        if(x<b.x) x++; else if(x>b.x) x--;
        if(ctx.inBounds(x,y)) ctx.set(x,y,0);
        if(y<b.y) y++; else if(y>b.y) y--;
      }
    }
  }

  function algorithm(ctx){
    const {width:W,height:H} = ctx;
    for(let y=0;y<H;y++)
      for(let x=0;x<W;x++) ctx.set(x,y,1);

    const pools=[];
    for(let i=0;i<5;i++){
      const px = 2 + Math.floor(ctx.random()*(W-4));
      const py = 2 + Math.floor(ctx.random()*(H-4));
      const r = 3 + Math.floor(ctx.random()*3);
      carveCircle(ctx,px,py,r);
      pools.push({x:px,y:py});
    }
    scatterCoral(ctx, 8 + Math.floor(W*H*0.02));
    linkPools(ctx,pools.sort((a,b)=>a.x-b.x));

    for(let y=1;y<H-1;y++){
      for(let x=1;x<W-1;x++){
        if(ctx.get(x,y)===0){
          const tide = (Math.sin((x/3)+(y/4))+1)/2;
          const blue = Math.floor(lerp(120,210,tide));
          const green = Math.floor(lerp(160,230,tide));
          const color = `rgb(${Math.floor(lerp(90,130,tide))},${green},${blue})`;
          ctx.setFloorColor(x,y,color);
          if(ctx.random()<0.05) ctx.setFloorType(x,y,'ice');
        } else {
          const coral = `rgb(${150+((x+y)%50)},${80+((x*3)%70)},${120+((y*5)%50)})`;
          ctx.setWallColor(x,y,coral);
        }
      }
    }

    ctx.ensureConnectivity();
  }

  function lerp(a,b,t){ return a + (b-a)*t; }

  const gen = {
    id: 'coral-sanctuary',
    name: '珊瑚聖域',
    description: '潮溜まりと珊瑚礁が広がる海底の迷宮',
    algorithm,
    mixin: { normalMixed: 0.4, blockDimMixed: 0.55, tags: ['aquatic','organic','cavern'] }
  };

  function mkBoss(depth){
    const floors=[];
    if(depth>=4) floors.push(4);
    if(depth>=8) floors.push(8);
    if(depth>=12) floors.push(12);
    if(depth>=16) floors.push(16);
    if(depth>=20) floors.push(20);
    return floors;
  }

  const blocks = {
    blocks1:[
      { key:'coral_theme_01', name:'Coral Theme I', level:+0,  size:0,  depth:+1, chest:'normal', type:'coral-sanctuary', bossFloors:mkBoss(5) },
      { key:'coral_theme_02', name:'Coral Theme II',level:+4,  size:+1, depth:+1, chest:'more',   type:'coral-sanctuary', bossFloors:mkBoss(7) },
      { key:'coral_theme_03', name:'Coral Theme III',level:+8, size:+1, depth:+2, chest:'less',   type:'coral-sanctuary', bossFloors:mkBoss(9) },
      { key:'coral_theme_04', name:'Coral Theme IV',level:+12, size:+2, depth:+2, chest:'normal', type:'coral-sanctuary', bossFloors:mkBoss(11) },
      { key:'coral_theme_05', name:'Coral Theme V', level:+16, size:+2, depth:+3, chest:'more',   type:'coral-sanctuary', bossFloors:mkBoss(13) },
      { key:'coral_theme_06', name:'Coral Theme VI',level:+20, size:+2, depth:+3, chest:'less',   type:'coral-sanctuary', bossFloors:mkBoss(15) },
      { key:'coral_theme_07', name:'Coral Theme VII',level:+24,size:+3, depth:+4, chest:'normal', type:'coral-sanctuary', bossFloors:mkBoss(17) }
    ],
    blocks2:[
      { key:'reef_path_01', name:'Reef Path I', level:+0,  size:+1, depth:0,  chest:'normal', type:'coral-sanctuary' },
      { key:'reef_path_02', name:'Reef Path II',level:+3,  size:+1, depth:+1, chest:'less',   type:'coral-sanctuary' },
      { key:'reef_path_03', name:'Reef Path III',level:+6, size:+1, depth:+1, chest:'normal', type:'coral-sanctuary' },
      { key:'reef_path_04', name:'Reef Path IV',level:+9,  size:+2, depth:+2, chest:'more',   type:'coral-sanctuary' },
      { key:'reef_path_05', name:'Reef Path V', level:+12, size:+2, depth:+2, chest:'less',   type:'coral-sanctuary' },
      { key:'reef_path_06', name:'Reef Path VI',level:+15, size:+2, depth:+3, chest:'normal', type:'coral-sanctuary' },
      { key:'reef_path_07', name:'Reef Path VII',level:+18,size:+3, depth:+3, chest:'more',   type:'coral-sanctuary' }
    ],
    blocks3:[
      { key:'tidepool_core_01', name:'Tidepool Core I', level:+0,  size:0,  depth:+2, chest:'more',   type:'coral-sanctuary', bossFloors:[4] },
      { key:'tidepool_core_02', name:'Tidepool Core II',level:+5,  size:+1, depth:+2, chest:'normal', type:'coral-sanctuary', bossFloors:[8] },
      { key:'tidepool_core_03', name:'Tidepool Core III',level:+10,size:+1, depth:+3, chest:'less',   type:'coral-sanctuary', bossFloors:[12] },
      { key:'tidepool_core_04', name:'Tidepool Core IV', level:+15,size:+2, depth:+3, chest:'more',   type:'coral-sanctuary', bossFloors:[16] },
      { key:'tidepool_core_05', name:'Tidepool Core V',  level:+20,size:+2, depth:+4, chest:'normal', type:'coral-sanctuary', bossFloors:[20] },
      { key:'tidepool_core_06', name:'Tidepool Core VI', level:+25,size:+3, depth:+4, chest:'more',   type:'coral-sanctuary', bossFloors:[10,20] }
    ]
  };

  window.registerDungeonAddon({ id:'coral_sanctuary_pack', name:'Coral Sanctuary Pack', version:'1.0.0', blocks, generators:[gen] });
})();

// Addon: Aurora Canopy - shimmering boreal forest canopies
(function(){
  function lerp(a,b,t){ return a + (b-a)*t; }
  function lerpColor(c1,c2,t){
    const p = parseInt(c1.slice(1),16);
    const q = parseInt(c2.slice(1),16);
    const r1 = (p>>16)&255, g1=(p>>8)&255, b1=p&255;
    const r2 = (q>>16)&255, g2=(q>>8)&255, b2=q&255;
    const r = Math.round(lerp(r1,r2,t));
    const g = Math.round(lerp(g1,g2,t));
    const b = Math.round(lerp(b1,b2,t));
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  }

  function carveGlowPath(ctx,start,steps,widthBias){
    let {x,y} = start;
    const dirs = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]];
    for(let i=0;i<steps;i++){
      for(let yy=-1; yy<=1; yy++){
        for(let xx=-1; xx<=1; xx++){
          if(Math.abs(xx)+Math.abs(yy) <= widthBias){
            const nx=x+xx, ny=y+yy;
            if(ctx.inBounds(nx,ny)) ctx.set(nx,ny,0);
          }
        }
      }
      const dir = dirs[Math.floor(ctx.random()*dirs.length)];
      x = Math.min(Math.max(x+dir[0],1), ctx.width-2);
      y = Math.min(Math.max(y+dir[1],1), ctx.height-2);
      if(ctx.random() < 0.25){
        widthBias = Math.max(1, widthBias + (ctx.random() < 0.5 ? -1 : 1));
        widthBias = Math.min(widthBias, 2);
      }
    }
  }

  function algorithm(ctx){
    const W=ctx.width, H=ctx.height;
    for(let y=0;y<H;y++)
      for(let x=0;x<W;x++) ctx.set(x,y,1);

    const seeds = [
      { x: Math.floor(W*0.3), y: 1 },
      { x: Math.floor(W*0.7), y: H-2 },
      { x: Math.floor(W*0.5), y: Math.floor(H/2) }
    ];
    seeds.forEach((s,idx)=>{
      carveGlowPath(ctx,s,Math.floor(W*H*0.25), idx===2?2:1);
    });

    for(let y=1;y<H-1;y++){
      const t = y/(H-1);
      const floorColor = lerpColor('#0b7285','#e0f7ff',t);
      const wallColor  = lerpColor('#16324f','#274060',t);
      for(let x=1;x<W-1;x++){
        if(ctx.get(x,y)===0){
          ctx.setFloorColor(x,y,floorColor);
        } else {
          ctx.setWallColor(x,y,wallColor);
        }
      }
    }

    ctx.ensureConnectivity();
  }

  const gen = {
    id: 'aurora-canopy',
    name: '極光樹冠',
    description: '夜空に揺らめくオーロラが照らす森冠の遊歩路',
    algorithm,
    mixin: { normalMixed: 0.45, blockDimMixed: 0.5, tags: ['forest','organic','light'] }
  };

  function mkBoss(depth){
    const floors=[];
    if(depth>=5) floors.push(5);
    if(depth>=10) floors.push(10);
    if(depth>=15) floors.push(15);
    if(depth>=20) floors.push(20);
    return floors;
  }

  const blocks = {
    blocks1:[
      { key:'aurora_theme_01', name:'Aurora Theme I', level:+0,  size:0,  depth:+1, chest:'normal', type:'aurora-canopy', bossFloors:mkBoss(6) },
      { key:'aurora_theme_02', name:'Aurora Theme II',level:+5,  size:+1, depth:+1, chest:'less',   type:'aurora-canopy', bossFloors:mkBoss(8) },
      { key:'aurora_theme_03', name:'Aurora Theme III',level:+10, size:+1, depth:+2, chest:'more',  type:'aurora-canopy', bossFloors:mkBoss(10) },
      { key:'aurora_theme_04', name:'Aurora Theme IV',level:+15, size:+1, depth:+2, chest:'normal', type:'aurora-canopy', bossFloors:mkBoss(12) },
      { key:'aurora_theme_05', name:'Aurora Theme V', level:+20, size:+2, depth:+3, chest:'more',  type:'aurora-canopy', bossFloors:mkBoss(14) },
      { key:'aurora_theme_06', name:'Aurora Theme VI',level:+24, size:+2, depth:+3, chest:'less',  type:'aurora-canopy', bossFloors:mkBoss(16) },
      { key:'aurora_theme_07', name:'Aurora Theme VII',level:+28, size:+2, depth:+4, chest:'normal',type:'aurora-canopy', bossFloors:mkBoss(18) },
      { key:'aurora_theme_08', name:'Aurora Theme VIII',level:+32,size:+3, depth:+4, chest:'more', type:'aurora-canopy', bossFloors:mkBoss(20) }
    ],
    blocks2:[
      { key:'aurora_trail_01', name:'Aurora Trail I', level:+0,  size:+1, depth:0,  chest:'normal', type:'aurora-canopy' },
      { key:'aurora_trail_02', name:'Aurora Trail II',level:+4,  size:+1, depth:+1, chest:'less',   type:'aurora-canopy' },
      { key:'aurora_trail_03', name:'Aurora Trail III',level:+8, size:+1, depth:+1, chest:'normal', type:'aurora-canopy' },
      { key:'aurora_trail_04', name:'Aurora Trail IV',level:+12, size:+2, depth:+2, chest:'more',   type:'aurora-canopy' },
      { key:'aurora_trail_05', name:'Aurora Trail V', level:+16, size:+2, depth:+2, chest:'less',   type:'aurora-canopy' },
      { key:'aurora_trail_06', name:'Aurora Trail VI',level:+22, size:+3, depth:+3, chest:'normal', type:'aurora-canopy' }
    ],
    blocks3:[
      { key:'aurora_grove_01', name:'Aurora Grove I', level:+0,  size:0,  depth:+2, chest:'more',   type:'aurora-canopy', bossFloors:[5] },
      { key:'aurora_grove_02', name:'Aurora Grove II',level:+6,  size:+1, depth:+2, chest:'normal', type:'aurora-canopy', bossFloors:[8] },
      { key:'aurora_grove_03', name:'Aurora Grove III',level:+12,size:+1, depth:+3, chest:'less',   type:'aurora-canopy', bossFloors:[12] },
      { key:'aurora_grove_04', name:'Aurora Grove IV',level:+18,size:+2, depth:+3, chest:'more',    type:'aurora-canopy', bossFloors:[16] },
      { key:'aurora_grove_05', name:'Aurora Grove V', level:+24,size:+2, depth:+4, chest:'normal',  type:'aurora-canopy', bossFloors:[20] },
      { key:'aurora_grove_06', name:'Aurora Grove VI',level:+30,size:+3, depth:+4, chest:'more',    type:'aurora-canopy', bossFloors:[10,20] }
    ]
  };

  window.registerDungeonAddon({ id:'aurora_canopy_pack', name:'Aurora Canopy Pack', version:'1.0.0', blocks, generators:[gen] });
})();

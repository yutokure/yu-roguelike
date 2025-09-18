// Addon: Ring City (環都市) - concentric rings with radial spokes
(function(){
  function bresenham(x0,y0,x1,y1,cb){
    let dx=Math.abs(x1-x0), sx=x0<x1?1:-1;
    let dy=-Math.abs(y1-y0), sy=y0<y1?1:-1;
    let err=dx+dy, e2;
    for(;;){ cb(x0,y0); if(x0===x1&&y0===y1) break; e2=2*err; if(e2>=dy){err+=dy; x0+=sx;} if(e2<=dx){err+=dx; y0+=sy;} }
  }
  function carveCircle(ctx,cx,cy,r,th=2){
    const r2=r*r, rin=Math.max(0,r-th), rin2=rin*rin;
    for(let y=cy-r-1;y<=cy+r+1;y++){
      for(let x=cx-r-1;x<=cx+r+1;x++){
        const dx=x-cx, dy=y-cy; const d2=dx*dx+dy*dy;
        if(d2<=r2 && d2>=rin2){ if(ctx.inBounds(x,y)) ctx.set(x,y,0); }
      }
    }
  }
  function algorithm(ctx){
    const W=ctx.width, H=ctx.height; const cx=Math.floor(W/2), cy=Math.floor(H/2);
    // carve concentric rings
    const maxR=Math.min(W,H)/2-3; const step=Math.max(3, Math.floor(maxR/5));
    for(let r=step; r<=maxR; r+=step){ carveCircle(ctx,cx,cy,Math.floor(r),2); }
    // carve spokes (8 directions)
    const dirs=[[1,0],[0,1],[-1,0],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]];
    for(const [dx,dy] of dirs){
      bresenham(cx,cy, cx+dx*(Math.floor(maxR)+1), cy+dy*(Math.floor(maxR)+1), (x,y)=>{ if(ctx.inBounds(x,y)) ctx.set(x,y,0); });
    }
    // small plazas: open discs on some ring intersections
    for(let i=0;i<4;i++){
      const ang=(i*90+45)*Math.PI/180; const rr=Math.floor(step*2.5);
      const x=Math.round(cx+Math.cos(ang)*rr), y=Math.round(cy+Math.sin(ang)*rr);
      for(let yy=-2; yy<=2; yy++) for(let xx=-2; xx<=2; xx++) if(ctx.inBounds(x+xx,y+yy)) ctx.set(x+xx,y+yy,0);
    }
    ctx.ensureConnectivity();
  }

  const gen = { id:'ring-city', name:'環都市', description:'同心円の街路と放射状の道', algorithm, mixin:{ normalMixed:0.5, blockDimMixed:0.5, tags:['structured','rooms'] } };

  function mkBoss(depth){ const r=[]; if(depth>=5) r.push(5); if(depth>=10) r.push(10); if(depth>=15) r.push(15); return r; }
  const blocks = {
    blocks1:[
      { key:'ring_theme_01', name:'Ring Theme I', level:+0,  size:0,  depth:+1, chest:'normal', type:'ring-city', bossFloors:mkBoss(6) },
      { key:'ring_theme_02', name:'Ring Theme II',level:+8,  size:+1, depth:+1, chest:'less',   type:'ring-city', bossFloors:mkBoss(8) },
      { key:'ring_theme_03', name:'Ring Theme III',level:+16, size:+1, depth:+2, chest:'more',   type:'ring-city', bossFloors:mkBoss(10) },
      { key:'ring_theme_04', name:'Ring Theme IV',level:+24, size:+2, depth:+2, chest:'normal', type:'ring-city', bossFloors:mkBoss(12) },
      { key:'ring_theme_05', name:'Ring Theme V', level:+32, size:+2, depth:+3, chest:'less',   type:'ring-city', bossFloors:mkBoss(15) },
    ],
    blocks2:[
      { key:'spokes_01', name:'Spokes I', level:+0,  size:+1, depth:0, chest:'normal', type:'ring-city' },
      { key:'spokes_02', name:'Spokes II',level:+6,  size:+1, depth:+1, chest:'more',  type:'ring-city' },
      { key:'spokes_03', name:'Spokes III',level:+12, size:+2, depth:+1, chest:'less', type:'ring-city' },
      { key:'spokes_04', name:'Spokes IV',level:+18, size:+2, depth:+2, chest:'normal',type:'ring-city' },
      { key:'spokes_05', name:'Spokes V', level:+24, size:+3, depth:+2, chest:'more',  type:'ring-city' },
    ],
    blocks3:[
      { key:'citadel_01', name:'Citadel I', level:+0,  size:0, depth:+2, chest:'more',   type:'ring-city', bossFloors:[5] },
      { key:'citadel_02', name:'Citadel II',level:+7,  size:+1, depth:+2, chest:'normal', type:'ring-city', bossFloors:[10] },
      { key:'citadel_03', name:'Citadel III',level:+14, size:+1, depth:+3, chest:'less', type:'ring-city', bossFloors:[15] },
      { key:'citadel_04', name:'Citadel IV', level:+21, size:+2, depth:+3, chest:'more', type:'ring-city', bossFloors:[10,15] },
      { key:'citadel_05', name:'Citadel V',  level:+28, size:+2, depth:+4, chest:'normal',type:'ring-city', bossFloors:[5,10,15] },
    ]
  };

  window.registerDungeonAddon({ id:'ring_city_pack', name:'Ring City Pack', version:'1.0.0', blocks, generators:[gen] });
})();

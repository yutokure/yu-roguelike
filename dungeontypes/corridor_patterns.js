// Addon: Corridor Patterns - crossroads, stripes, perforated grid, ladder, branching corridors (narrow/thick)
(function(){
  function clamp(v,a,b){ return v<a?a:(v>b?b:v); }
  function setF(ctx,x,y){ if(ctx.inBounds(x,y)) ctx.set(x,y,0); }
  function setW(ctx,x,y){ if(ctx.inBounds(x,y)) ctx.set(x,y,1); }
  function lineF(ctx,x1,y1,x2,y2,th){ let dx=Math.abs(x2-x1),sx=x1<x2?1:-1; let dy=-Math.abs(y2-y1),sy=y1<y2?1:-1; let err=dx+dy,e2; for(;;){ for(let yy=-th;yy<=th;yy++) for(let xx=-th;xx<=th;xx++) setF(ctx,x1+xx,y1+yy); if(x1===x2&&y1===y2) break; e2=2*err; if(e2>=dy){err+=dy;x1+=sx;} if(e2<=dx){err+=dx;y1+=sy;} } }

  // 1) Crossroads: grid of 3-wide corridors
  function genCrossroads(ctx){ const W=ctx.width,H=ctx.height; const step=clamp(Math.floor(Math.min(W,H)/6),5,10); const th=1; for(let y=2;y<H-2;y+=step){ for(let x=1;x<W-1;x++) setF(ctx,x,y); if(th>0){ for(let o=1;o<=th;o++){ for(let x=1;x<W-1;x++) setF(ctx,x,y+o); for(let x=1;x<W-1;x++) setF(ctx,x,y-o); } } } for(let x=2;x<W-2;x+=step){ for(let y=1;y<H-1;y++) setF(ctx,x,y); if(th>0){ for(let o=1;o<=th;o++){ for(let y=1;y<H-1;y++) setF(ctx,x+o,y); for(let y=1;y<H-1;y++) setF(ctx,x-o,y); } } } ctx.ensureConnectivity(); }

  // 2) Horizontal stripes: random width bands
  function genHorizontalStripes(ctx){ const W=ctx.width,H=ctx.height; let y=2; const maxBand=Math.max(2,Math.floor(Math.min(W,H)/30)); const maxGap=Math.max(1,Math.floor(Math.min(W,H)/30)); while(y<H-2){ const band=1+Math.floor(ctx.random()*Math.min(3,maxBand)); for(let yy=0;yy<band && y<H-2;yy++,y++){ for(let x=1;x<W-1;x++) setF(ctx,x,y); } y+=1+Math.floor(ctx.random()*Math.min(3,maxGap)); } ctx.ensureConnectivity(); }

  // 3) Vertical stripes: random width bands
  function genVerticalStripes(ctx){ const W=ctx.width,H=ctx.height; let x=2; const maxBand=Math.max(2,Math.floor(Math.min(W,H)/30)); const maxGap=Math.max(1,Math.floor(Math.min(W,H)/30)); while(x<W-2){ const band=1+Math.floor(ctx.random()*Math.min(3,maxBand)); for(let xx=0;xx<band && x<W-2;xx++,x++){ for(let y=1;y<H-1;y++) setF(ctx,x,y); } x+=1+Math.floor(ctx.random()*Math.min(3,maxGap)); } ctx.ensureConnectivity(); }

  // 4) Perforated grid: grid walls with random holes
  function genPerforatedGrid(ctx){ const W=ctx.width,H=ctx.height; // start clear
    for(let y=1;y<H-1;y++) for(let x=1;x<W-1;x++) setF(ctx,x,y);
    const step=clamp(Math.floor(Math.min(W,H)/10),4,8); for(let y=2;y<H-2;y+=step){ for(let x=1;x<W-1;x++) setW(ctx,x,y); }
    for(let x=2;x<W-2;x+=step){ for(let y=1;y<H-1;y++) setW(ctx,x,y); }
    // punch holes（格子密度に応じて）
    const holes = Math.max(8, Math.floor((W*H)/(step*step*2)));
    for(let i=0;i<holes;i++){ const x=2+Math.floor(ctx.random()*(W-4)); const y=2+Math.floor(ctx.random()*(H-4)); setF(ctx,x,y); }
    ctx.ensureConnectivity(); }

  // 5) Ladder room (amida-like)
  function genLadder(ctx){ const W=ctx.width,H=ctx.height; const baseRails=Math.max(4, Math.floor(W/12)); const rails=clamp(baseRails + Math.floor(ctx.random()*3)-1, 3, 10); const gap=Math.max(2, Math.floor((W-4)/rails)); const xs=[]; for(let i=0;i<rails;i++){ const x=2+i*gap; if(x>=W-1) break; xs.push(x); for(let y=1;y<H-1;y++) setF(ctx,x,y); }
    const rungs=Math.max(8, Math.floor(H/2)); for(let i=0;i<rungs;i++){ const k=Math.floor(ctx.random()*Math.max(1,xs.length-1)); const y=2+Math.floor(ctx.random()*(H-4)); for(let x=xs[k]; x<=xs[k+1]; x++) setF(ctx,x,y); }
    ctx.ensureConnectivity(); }

  // 6) Branching corridors (narrow/thick)
  function mst(points){ const n=points.length; const used=Array(n).fill(false); const edges=[]; used[0]=true; const dist=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y); for(let it=0;it<n-1;it++){ let bestD=1e9, u=-1,v=-1; for(let i=0;i<n;i++) if(used[i]) for(let j=0;j<n;j++) if(!used[j]){ const d=dist(points[i],points[j]); if(d<bestD){bestD=d;u=i;v=j;} } used[v]=true; edges.push([points[u],points[v]]); } return edges; }
  function genBranching(width){ return function(ctx){ const W=ctx.width,H=ctx.height; const count=Math.max(8, Math.floor((W+H)/6)); const pts=[]; for(let i=0;i<count;i++){ let p; do{ p={x:2+Math.floor(ctx.random()*(W-4)), y:2+Math.floor(ctx.random()*(H-4))}; } while(!ctx.inBounds(p.x,p.y)); pts.push(p); }
      const es=mst(pts); for(const [a,b] of es){ const path=ctx.aStar(a,b,{wallCost:1.0,floorCost:0.0,straightPenalty:0.05,hugWalls:0.08}); ctx.carvePath(path,width); }
      // extra branches（20%程度）
      const extras = Math.max(1, Math.floor(es.length*0.2 + 0.5));
      for(let i=0;i<extras;i++){ const a=pts[Math.floor(ctx.random()*pts.length)], b=pts[Math.floor(ctx.random()*pts.length)]; const path=ctx.aStar(a,b,{wallCost:1.0,floorCost:0.0}); ctx.carvePath(path,width); }
      ctx.ensureConnectivity(); } }

  const gens = [
    {
      id:'crossroads-3wide',
      name:'交差点部屋',
      nameKey: "dungeon.types.crossroads_3wide.name",
      algorithm:genCrossroads,
      mixin:{ normalMixed:0.45, blockDimMixed:0.45, tags:['grid'] }
    },
    {
      id:'horizontal-stripes',
      name:'一本道横部屋',
      nameKey: "dungeon.types.horizontal_stripes.name",
      algorithm:genHorizontalStripes,
      mixin:{ normalMixed:0.4, blockDimMixed:0.35, tags:['corridor'] }
    },
    {
      id:'vertical-stripes',
      name:'一本道縦部屋',
      nameKey: "dungeon.types.vertical_stripes.name",
      algorithm:genVerticalStripes,
      mixin:{ normalMixed:0.4, blockDimMixed:0.35, tags:['corridor'] }
    },
    {
      id:'perforated-grid',
      name:'格子壁穴あき部屋',
      nameKey: "dungeon.types.perforated_grid.name",
      algorithm:genPerforatedGrid,
      mixin:{ normalMixed:0.4, blockDimMixed:0.4, tags:['grid'] }
    },
    {
      id:'ladder-room',
      name:'梯子のような部屋',
      nameKey: "dungeon.types.ladder_room.name",
      algorithm:genLadder,
      mixin:{ normalMixed:0.35, blockDimMixed:0.35, tags:['corridor'] }
    },
    {
      id:'branching-corridors-narrow',
      name:'通路が枝分かれ（狭い）',
      nameKey: "dungeon.types.branching_corridors_narrow.name",
      algorithm:genBranching(1),
      mixin:{ normalMixed:0.45, blockDimMixed:0.45, tags:['maze'] }
    },
    {
      id:'branching-corridors-thick',
      name:'通路が枝分かれ（太い）',
      nameKey: "dungeon.types.branching_corridors_thick.name",
      algorithm:genBranching(3),
      mixin:{ normalMixed:0.4, blockDimMixed:0.4, tags:['maze'] }
    },
  ];

  function mkBoss(d){ const r=[]; if(d>=5) r.push(5); if(d>=10) r.push(10); if(d>=15) r.push(15); return r; }
  const types = gens.map(g=>g.id);
  const blocks = {
    blocks1:[
      { key:'cor_theme_01', name:'Corr Theme I', level:+4,  size:0,  depth:+1, chest:'normal', type:types[0], bossFloors:mkBoss(8) },
      { key:'cor_theme_02', name:'Corr Theme II',level:+10, size:+1, depth:+1, chest:'less',   type:types[1], bossFloors:mkBoss(10) },
      { key:'cor_theme_03', name:'Corr Theme III',level:+16, size:+1, depth:+2, chest:'more',  type:types[2], bossFloors:mkBoss(12) },
      { key:'cor_theme_04', name:'Corr Theme IV',level:+22, size:+2, depth:+2, chest:'normal', type:types[3], bossFloors:mkBoss(14) },
      { key:'cor_theme_05', name:'Corr Theme V', level:+28, size:+2, depth:+3, chest:'less',   type:types[4], bossFloors:mkBoss(15) },
    ],
    blocks2:[
      { key:'cor_core_01', name:'Corr Core I', level:+0,  size:+1, depth:0, chest:'normal', type:types[5] },
      { key:'cor_core_02', name:'Corr Core II',level:+8,  size:+1, depth:+1, chest:'more',  type:types[6] },
      { key:'cor_core_03', name:'Corr Core III',level:+14, size:+2, depth:+1, chest:'less', type:types[0] },
      { key:'cor_core_04', name:'Corr Core IV',level:+20, size:+2, depth:+2, chest:'normal',type:types[1] },
      { key:'cor_core_05', name:'Corr Core V', level:+26, size:+3, depth:+2, chest:'more',  type:types[2] },
    ],
    blocks3:[
      { key:'cor_relic_01', name:'Corr Relic I', level:+0,  size:0,  depth:+2, chest:'more',   type:types[3], bossFloors:[5] },
      { key:'cor_relic_02', name:'Corr Relic II',level:+9,  size:+1, depth:+2, chest:'normal', type:types[4], bossFloors:[10] },
      { key:'cor_relic_03', name:'Corr Relic III',level:+18, size:+1, depth:+3, chest:'less', type:types[5], bossFloors:[15] },
      { key:'cor_relic_04', name:'Corr Relic IV', level:+24, size:+2, depth:+3, chest:'more', type:types[6], bossFloors:[10,15] },
      { key:'cor_relic_05', name:'Corr Relic V',  level:+30, size:+2, depth:+4, chest:'normal',type:types[0], bossFloors:[5,10,15] },
    ]
  };

  window.registerDungeonAddon({
    id:'corridor_pack',
    name:'Corridor Patterns Pack',
    nameKey: "dungeon.packs.corridor_pack.name",
    version:'1.0.0',
    blocks,
    generators:gens
  });
})();

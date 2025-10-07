// Addon: Overgrown Ruins (蔦覆遺跡) - non-overlapping rooms with extra loops
(function(){
  function rectsOverlap(a,b){ return !(a.x2<b.x1 || b.x2<a.x1 || a.y2<b.y1 || b.y2<a.y1); }
  function center(r){ return { x: Math.floor((r.x1+r.x2)/2), y: Math.floor((r.y1+r.y2)/2) }; }
  function dist2(a,b){ const dx=a.x-b.x, dy=a.y-b.y; return dx*dx+dy*dy; }
  function mst(points){
    if(points.length<=1) return [];
    const n=points.length; const used=Array(n).fill(false); used[0]=true; const edges=[];
    for(let it=0; it<n-1; it++){
      let best=Infinity, u=-1, v=-1;
      for(let i=0;i<n;i++) if(used[i]) for(let j=0;j<n;j++) if(!used[j]){
        const d=dist2(points[i], points[j]);
        if(d<best){ best=d; u=i; v=j; }
      }
      used[v]=true; edges.push([points[u], points[v]]);
    }
    return edges;
  }
  function algorithm(ctx){
    const W=ctx.width, H=ctx.height; const rooms=[];
    const roomCount = Math.max(5, Math.floor(Math.min(W,H)/4));
    const minCenterDist = Math.max(4, Math.floor(Math.min(W,H)/6));
    const minCenterDist2 = minCenterDist*minCenterDist;
    // Poisson風：重なり＋中心距離の両方でフィルタ
    for(let i=0;i<roomCount*20 && rooms.length<roomCount;i++){
      const w=4+Math.floor(ctx.random()*6), h=4+Math.floor(ctx.random()*6);
      const x=1+Math.floor(ctx.random()*(W-w-2)), y=1+Math.floor(ctx.random()*(H-h-2));
      const r={ x1:x, y1:y, x2:x+w, y2:y+h };
      const c=center(r);
      if(rooms.some(rr=>rectsOverlap(rr,{x1:r.x1-1,y1:r.y1-1,x2:r.x2+1,y2:r.y2+1}))) continue;
      if(rooms.some(rr=>{ const cc=center(rr); return dist2(c,cc)<minCenterDist2; })) continue;
      rooms.push(r);
      for(let yy=r.y1; yy<=r.y2; yy++) for(let xx=r.x1; xx<=r.x2; xx++) if(ctx.inBounds(xx,yy)) ctx.set(xx,yy,0);
    }
    const centers = rooms.map(center);
    // 最小全域木で主要接続 + 余剰枝でループ
    const edges = mst(centers);
    for(const [a,b] of edges){
      const path=ctx.aStar(a,b,{wallCost:1.0,floorCost:0.0,straightPenalty:0.05,hugWalls:0.05});
      ctx.carvePath(path,1);
    }
    const extra = Math.max(2, Math.floor(rooms.length/3));
    for(let i=0;i<extra;i++){
      const a = centers[Math.floor(ctx.random()*centers.length)];
      const b = centers[Math.floor(ctx.random()*centers.length)];
      if(!a||!b||a===b) continue;
      const path=ctx.aStar(a,b,{wallCost:1.0,floorCost:0.0,straightPenalty:0.12,hugWalls:0.1});
      ctx.carvePath(path,1);
    }
    ctx.ensureConnectivity();
  }

  const gen = {
    id:'overgrown-ruins',
    name:'蔦覆遺跡',
    nameKey: "dungeon.types.overgrown_ruins.name",
    description:'部屋主体＋蔦のような追加回廊でループが多い遺跡',
    descriptionKey: "dungeon.types.overgrown_ruins.description",
    algorithm,
    mixin:{ normalMixed:0.6, blockDimMixed:0.5, tags:['rooms'] }
  };

  function mkBoss(d){ const r=[]; if(d>=5) r.push(5); if(d>=10) r.push(10); if(d>=15) r.push(15); return r; }
  const blocks = {
    blocks1:[
      {
        key:'ruin_theme_01',
        name:'Ruin Theme I',
        nameKey: "dungeon.types.overgrown_ruins.blocks.ruin_theme_01.name",
        level:+0,
        size:0,
        depth:+1,
        chest:'normal',
        type:'overgrown-ruins',
        bossFloors:mkBoss(6)
      },
      {
        key:'ruin_theme_02',
        name:'Ruin Theme II',
        nameKey: "dungeon.types.overgrown_ruins.blocks.ruin_theme_02.name",
        level:+6,
        size:0,
        depth:+1,
        chest:'more',
        type:'overgrown-ruins',
        bossFloors:mkBoss(8)
      },
      {
        key:'ruin_theme_03',
        name:'Ruin Theme III',
        nameKey: "dungeon.types.overgrown_ruins.blocks.ruin_theme_03.name",
        level:+12,
        size:+1,
        depth:+2,
        chest:'less',
        type:'overgrown-ruins',
        bossFloors:mkBoss(10)
      },
      {
        key:'ruin_theme_04',
        name:'Ruin Theme IV',
        nameKey: "dungeon.types.overgrown_ruins.blocks.ruin_theme_04.name",
        level:+18,
        size:+1,
        depth:+2,
        chest:'normal',
        type:'overgrown-ruins',
        bossFloors:mkBoss(12)
      },
      {
        key:'ruin_theme_05',
        name:'Ruin Theme V',
        nameKey: "dungeon.types.overgrown_ruins.blocks.ruin_theme_05.name",
        level:+24,
        size:+2,
        depth:+3,
        chest:'more',
        type:'overgrown-ruins',
        bossFloors:mkBoss(15)
      },
    ],
    blocks2:[
      {
        key:'ivy_01',
        name:'Ivy I',
        nameKey: "dungeon.types.overgrown_ruins.blocks.ivy_01.name",
        level:+0,
        size:+1,
        depth:0,
        chest:'normal',
        type:'overgrown-ruins'
      },
      {
        key:'ivy_02',
        name:'Ivy II',
        nameKey: "dungeon.types.overgrown_ruins.blocks.ivy_02.name",
        level:+7,
        size:+1,
        depth:+1,
        chest:'more',
        type:'overgrown-ruins'
      },
      {
        key:'ivy_03',
        name:'Ivy III',
        nameKey: "dungeon.types.overgrown_ruins.blocks.ivy_03.name",
        level:+14,
        size:+2,
        depth:+1,
        chest:'less',
        type:'overgrown-ruins'
      },
      {
        key:'ivy_04',
        name:'Ivy IV',
        nameKey: "dungeon.types.overgrown_ruins.blocks.ivy_04.name",
        level:+21,
        size:+2,
        depth:+2,
        chest:'normal',
        type:'overgrown-ruins'
      },
      {
        key:'ivy_05',
        name:'Ivy V',
        nameKey: "dungeon.types.overgrown_ruins.blocks.ivy_05.name",
        level:+28,
        size:+3,
        depth:+2,
        chest:'more',
        type:'overgrown-ruins'
      },
    ],
    blocks3:[
      {
        key:'idol_01',
        name:'Idol I',
        nameKey: "dungeon.types.overgrown_ruins.blocks.idol_01.name",
        level:+0,
        size:0,
        depth:+2,
        chest:'more',
        type:'overgrown-ruins',
        bossFloors:[5]
      },
      {
        key:'idol_02',
        name:'Idol II',
        nameKey: "dungeon.types.overgrown_ruins.blocks.idol_02.name",
        level:+8,
        size:+1,
        depth:+2,
        chest:'normal',
        type:'overgrown-ruins',
        bossFloors:[10]
      },
      {
        key:'idol_03',
        name:'Idol III',
        nameKey: "dungeon.types.overgrown_ruins.blocks.idol_03.name",
        level:+16,
        size:+1,
        depth:+3,
        chest:'less',
        type:'overgrown-ruins',
        bossFloors:[15]
      },
      {
        key:'idol_04',
        name:'Idol IV',
        nameKey: "dungeon.types.overgrown_ruins.blocks.idol_04.name",
        level:+24,
        size:+2,
        depth:+3,
        chest:'more',
        type:'overgrown-ruins',
        bossFloors:[10,15]
      },
      {
        key:'idol_05',
        name:'Idol V',
        nameKey: "dungeon.types.overgrown_ruins.blocks.idol_05.name",
        level:+32,
        size:+2,
        depth:+4,
        chest:'normal',
        type:'overgrown-ruins',
        bossFloors:[5,10,15]
      },
    ]
  };

  window.registerDungeonAddon({
    id:'ruins_pack',
    name:'Overgrown Ruins Pack',
    nameKey: "dungeon.packs.ruins_pack.name",
    version:'1.0.0',
    blocks,
    generators:[gen]
  });
})();

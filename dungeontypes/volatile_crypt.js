// Addon: Volatile Crypts - trap-laden catacombs with bomb floor clusters
(function(){
  function rectsOverlap(a,b){ return !(a.x2<b.x1 || b.x2<a.x1 || a.y2<b.y1 || b.y2<a.y1); }
  function center(rect){ return { x: Math.floor((rect.x1 + rect.x2) / 2), y: Math.floor((rect.y1 + rect.y2) / 2) }; }
  function dist2(a,b){ const dx=a.x-b.x, dy=a.y-b.y; return dx*dx + dy*dy; }
  function manhattan(a,b){ return Math.abs(a.x-b.x) + Math.abs(a.y-b.y); }
  function shuffle(arr, rnd){ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(rnd()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; } return arr; }

  function carveRoom(ctx, room){
    for(let y=room.y1; y<=room.y2; y++){
      for(let x=room.x1; x<=room.x2; x++){
        if(ctx.inBounds(x,y)){
          ctx.set(x,y,0);
          ctx.setFloorColor(x,y,'#e5dcc5');
        }
      }
    }
  }

  function algorithm(ctx){
    const W = ctx.width, H = ctx.height;
    const rnd = ctx.random;
    const rooms = [];
    const targetRooms = Math.max(5, Math.floor(Math.min(W,H) / 4));
    const attempts = targetRooms * 20;

    for(let i=0; i<attempts && rooms.length<targetRooms; i++){
      const w = 4 + Math.floor(rnd()*5);
      const h = 4 + Math.floor(rnd()*5);
      const x = 1 + Math.floor(rnd() * (W - w - 2));
      const y = 1 + Math.floor(rnd() * (H - h - 2));
      const room = { x1:x, y1:y, x2:x+w, y2:y+h };
      let overlaps = false;
      for(const existing of rooms){
        const expanded = { x1:existing.x1-1, y1:existing.y1-1, x2:existing.x2+1, y2:existing.y2+1 };
        if(rectsOverlap(room, expanded)){ overlaps = true; break; }
      }
      if(overlaps) continue;
      rooms.push(room);
      carveRoom(ctx, room);
    }

    if(!rooms.length){
      const cx = Math.floor(W/2), cy = Math.floor(H/2);
      const size = Math.max(3, Math.floor(Math.min(W,H)/6));
      const fallback = { x1:cx-size, y1:cy-size, x2:cx+size, y2:cy+size };
      rooms.push(fallback);
      carveRoom(ctx, fallback);
    }

    const centers = rooms.map(center);
    if(centers.length>1){
      const used = Array(centers.length).fill(false);
      used[0] = true;
      const edges = [];
      for(let k=0;k<centers.length-1;k++){
        let best=Infinity, u=-1, v=-1;
        for(let i=0;i<centers.length;i++) if(used[i])
          for(let j=0;j<centers.length;j++) if(!used[j]){
            const d = dist2(centers[i], centers[j]);
            if(d<best){ best=d; u=i; v=j; }
          }
        if(v>=0){ used[v]=true; edges.push([centers[u], centers[v]]); }
      }
      for(const [a,b] of edges){
        const path = ctx.aStar(a,b,{ wallCost:1.0, floorCost:0.05, straightPenalty:0.08, hugWalls:0.05 });
        ctx.carvePath(path,1);
        path.forEach(p => ctx.setFloorColor(p.x, p.y, '#d8d0ba'));
      }
      const extra = Math.max(2, Math.floor(centers.length/3));
      for(let i=0;i<extra;i++){
        const a = centers[Math.floor(rnd()*centers.length)];
        const b = centers[Math.floor(rnd()*centers.length)];
        if(!a || !b || (a.x===b.x && a.y===b.y)) continue;
        const path = ctx.aStar(a,b,{ wallCost:1.0, floorCost:0.1, straightPenalty:0.15, hugWalls:0.08 });
        ctx.carvePath(path,1);
        path.forEach(p => ctx.setFloorColor(p.x, p.y, '#d8d0ba'));
      }
    }

    ctx.ensureConnectivity();

    const floorTiles = [];
    for(let y=1;y<H-1;y++){
      for(let x=1;x<W-1;x++){
        if(ctx.get(x,y)===0) floorTiles.push({x,y});
      }
    }

    const usedBombs = new Set();
    function key(x,y){ return x + ',' + y; }
    function placeBomb(x,y){
      if(!ctx.inBounds(x,y)) return false;
      if(ctx.get(x,y)!==0) return false;
      const k = key(x,y);
      if(usedBombs.has(k)) return false;
      ctx.setFloorType(x,y,'bomb');
      ctx.setFloorColor(x,y,'#ffadad');
      usedBombs.add(k);
      return true;
    }
    function scorch(x,y){
      for(let dy=-1; dy<=1; dy++){
        for(let dx=-1; dx<=1; dx++){
          if(!dx && !dy) continue;
          const nx = x+dx, ny = y+dy;
          if(!ctx.inBounds(nx,ny)) continue;
          if(ctx.get(nx,ny)!==0) continue;
          const meta = ctx.getTileMeta(nx,ny);
          if(meta?.floorType === 'bomb') continue;
          if(meta?.floorColor) continue;
          ctx.setFloorColor(nx,ny,'#ffe0ba');
        }
      }
    }

    const centerPos = { x: Math.floor(W/2), y: Math.floor(H/2) };
    const safeRadius = Math.max(4, Math.floor(Math.min(W,H) / 6));
    const clusterTarget = Math.max(4, Math.floor(floorTiles.length * 0.025));
    let placed = 0;
    let guard = clusterTarget * 20;
    while(placed < clusterTarget && guard-- > 0){
      const base = floorTiles[Math.floor(rnd()*floorTiles.length)];
      if(!base) break;
      if(manhattan(base, centerPos) < safeRadius) continue;
      if(!placeBomb(base.x, base.y)) continue;
      scorch(base.x, base.y);
      placed++;
      const dirs = shuffle([[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]], rnd);
      const extra = 1 + Math.floor(rnd()*3); // 1-3 extra bombs around anchor
      for(let i=0;i<dirs.length && i<extra; i++){
        const nx = base.x + dirs[i][0];
        const ny = base.y + dirs[i][1];
        if(placeBomb(nx, ny)) scorch(nx, ny);
      }
    }
  }

  const gen = {
    id: 'volatile-crypt',
    name: '揮発する地下霊廟',
    description: '崩れた霊廟に爆弾床の罠が散りばめられた危険地帯',
    algorithm,
    mixin: { normalMixed: 0.35, blockDimMixed: 0.4, tags: ['rooms','traps','bomb'] }
  };

  function mkBoss(depth){ const r=[]; if(depth>=5) r.push(5); if(depth>=10) r.push(10); if(depth>=15) r.push(15); return r; }
  const blocks = {
    blocks1:[
      { key:'volatile_theme_01', name:'Volatile Theme I', level:+0,  size:0,  depth:+1, chest:'less',   type:'volatile-crypt', bossFloors:mkBoss(6) },
      { key:'volatile_theme_02', name:'Volatile Theme II',level:+6,  size:0,  depth:+1, chest:'normal', type:'volatile-crypt', bossFloors:mkBoss(8) },
      { key:'volatile_theme_03', name:'Volatile Theme III',level:+12, size:+1, depth:+2, chest:'more',  type:'volatile-crypt', bossFloors:mkBoss(10) },
      { key:'volatile_theme_04', name:'Volatile Theme IV',level:+18, size:+1, depth:+2, chest:'normal', type:'volatile-crypt', bossFloors:mkBoss(12) },
      { key:'volatile_theme_05', name:'Volatile Theme V', level:+24, size:+2, depth:+3, chest:'less',   type:'volatile-crypt', bossFloors:mkBoss(15) },
    ],
    blocks2:[
      { key:'blast_ward_01', name:'Blast Ward I', level:+0,  size:+1, depth:0, chest:'normal', type:'volatile-crypt' },
      { key:'blast_ward_02', name:'Blast Ward II',level:+7,  size:+1, depth:+1, chest:'less',  type:'volatile-crypt' },
      { key:'blast_ward_03', name:'Blast Ward III',level:+14, size:+2, depth:+1, chest:'normal', type:'volatile-crypt' },
      { key:'blast_ward_04', name:'Blast Ward IV',level:+21, size:+2, depth:+2, chest:'more',   type:'volatile-crypt' },
      { key:'blast_ward_05', name:'Blast Ward V', level:+28, size:+3, depth:+2, chest:'normal', type:'volatile-crypt' },
    ],
    blocks3:[
      { key:'relic_core_01', name:'Relic Core I', level:+0,  size:0,  depth:+2, chest:'more',   type:'volatile-crypt', bossFloors:[5] },
      { key:'relic_core_02', name:'Relic Core II',level:+9,  size:+1, depth:+2, chest:'normal', type:'volatile-crypt', bossFloors:[10] },
      { key:'relic_core_03', name:'Relic Core III',level:+18, size:+1, depth:+3, chest:'less',  type:'volatile-crypt', bossFloors:[15] },
      { key:'relic_core_04', name:'Relic Core IV', level:+24, size:+2, depth:+3, chest:'more',  type:'volatile-crypt', bossFloors:[10,15] },
      { key:'relic_core_05', name:'Relic Core V',  level:+32, size:+2, depth:+4, chest:'normal', type:'volatile-crypt', bossFloors:[5,10,15] },
    ]
  };

  window.registerDungeonAddon({ id:'volatile_crypt_pack', name:'Volatile Crypt Pack', version:'1.0.0', blocks, generators:[gen] });
})();

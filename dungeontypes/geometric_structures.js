// Addon: Geometric Structures - rings, hex lattice, bubbles, spiral, towers, diamond, triangle
(function(){
  function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
  function inC(ctx,x,y){ return ctx.inBounds(x,y); }
  function setF(ctx,x,y){ if(inC(ctx,x,y)) ctx.set(x,y,0); }
  function setW(ctx,x,y){ if(inC(ctx,x,y)) ctx.set(x,y,1); }
  function circle(ctx,cx,cy,r,thick=1,fill=false){
    const r2 = r*r; const rin = Math.max(0, r-thick); const rin2 = rin*rin;
    for(let y=cy-r-1;y<=cy+r+1;y++){
      for(let x=cx-r-1;x<=cx+r+1;x++){
        const dx=x-cx, dy=y-cy; const d2=dx*dx+dy*dy;
        if(fill){ if(d2<=r2) setF(ctx,x,y); }
        else { if(d2<=r2 && d2>=rin2) setF(ctx,x,y); }
      }
    }
  }
  function line(ctx,x1,y1,x2,y2,th=1){
    let dx=Math.abs(x2-x1),sx=x1<x2?1:-1; let dy=-Math.abs(y2-y1),sy=y1<y2?1:-1; let err=dx+dy, e2;
    for(;;){ for(let yy=-th;yy<=th;yy++) for(let xx=-th;xx<=th;xx++) setF(ctx,x1+xx,y1+yy); if(x1===x2&&y1===y2) break; e2=2*err; if(e2>=dy){err+=dy;x1+=sx;} if(e2<=dx){err+=dx;y1+=sy;} }
  }

  function placeStructure(ctx, id, x, y, opts){
    if (!ctx || !ctx.structures) return false;
    const base = Object.assign({ anchor:'center', strict:false }, opts || {});
    return ctx.structures.place(id, x, y, base);
  }

  function randomRotation(ctx){
    const rng = ctx.random?.() ?? Math.random();
    return Math.floor(rng * 360) % 360;
  }

  const structures = [
    {
      id:'geo_cross_plaza',
      name:'Geo Cross Plaza',
      anchor:'center',
      tags:['geo','plaza','geo-tile'],
      pattern:[
        '  ...  ',
        '  ...  ',
        '.......',
        '.......',
        '  ...  ',
        '  ...  '
      ]
    },
    {
      id:'geo_ring_gate',
      name:'Geo Ring Gate',
      anchor:'center',
      tags:['geo','gate','geo-tile'],
      pattern:[
        '..###..',
        '.#...#.',
        '#.....#',
        '#.....#',
        '.#...#.',
        '..###..'
      ]
    },
    {
      id:'geo_corner_turn',
      name:'Geo Corner Turn',
      anchor:'center',
      tags:['geo','corridor','geo-tile'],
      pattern:[
        '.....',
        '...##',
        '...##',
        '.....',
        '.....'
      ]
    },
    {
      id:'geo_split_hall',
      name:'Geo Split Hall',
      anchor:'center',
      tags:['geo','corridor','geo-tile'],
      pattern:[
        '##...##',
        '##...##',
        '.......',
        '##...##',
        '##...##'
      ]
    }
  ];

  // 1) Ring-linked rooms
  function genRingLinked(ctx){
    const W=ctx.width,H=ctx.height; const step=Math.max(8, Math.floor(Math.min(W,H)/5)); const r=Math.max(3, Math.floor(step/3));
    for(let y=step; y<H-step; y+=step){
      for(let x=step; x<W-step; x+=step){ circle(ctx,x,y,r,2,false); }
    }
    // connect neighbors
    for(let y=step; y<H-step; y+=step){
      for(let x=step; x<W-step; x+=step){ if(x+step<W-step) line(ctx,x+r,y, x+step-r, y,1); if(y+step<H-step) line(ctx,x,y+r, x, y+step-r,1); }
    }
    if (ctx.structures) {
      for(let y=step; y<H-step; y+=step){
        for(let x=step; x<W-step; x+=step){
          if ((ctx.random?.() ?? Math.random()) < 0.35) {
            placeStructure(ctx,'geo_ring_gate',x,y,{ rotation: randomRotation(ctx), scaleX: 1.5, scaleY: 1 });
          }
        }
      }
      placeStructure(ctx,'geo_cross_plaza',Math.floor(W/2),Math.floor(H/2));
    }
    ctx.ensureConnectivity();
  }

  // 2) Hex lattice rooms (approx)
  function carveHex(ctx,cx,cy,R){
    for(let y=cy-R-1;y<=cy+R+1;y++){
      for(let x=cx-R-1;x<=cx+R+1;x++){
        const dx=Math.abs(x-cx), dy=Math.abs(y-cy);
        // approx hex: max(dx, Math.floor((dx+dy)/2), dy) <= R
        if(Math.max(dx, Math.floor((dx+dy)/2), dy) <= R) setF(ctx,x,y);
      }
    }
  }
  function genHexLattice(ctx){
    const W=ctx.width,H=ctx.height; const R=Math.max(3, Math.floor(Math.min(W,H)/10)); const dx=R*2+2; const dy=Math.floor(R*1.8)+2;
    for(let row=0, y=2+R; y<H-2-R; y+=dy, row++){
      const x0 = 2+R + (row%2 ? Math.floor(dx/2) : 0);
      for(let x=x0; x<W-2-R; x+=dx) carveHex(ctx,x,y,R);
    }
    // link nearby centers
    for(let y=2+R; y<H-2-R; y+=dy){ for(let x=2+R; x<W-2-R; x+=dx){ if(x+dx<W-2-R) line(ctx,x,y, x+dx,y,1); if(y+dy<H-2-R) line(ctx,x,y, x+(dx/2|0), y+dy,1); }}
    if (ctx.structures) {
      for(let row=0, y=2+R; y<H-2-R; y+=dy, row++){
        const x0 = 2+R + (row%2 ? Math.floor(dx/2) : 0);
        for(let x=x0; x<W-2-R; x+=dx){
          if ((ctx.random?.() ?? Math.random()) < 0.25) {
            placeStructure(ctx,'geo_corner_turn',x,y,{ rotation: randomRotation(ctx), scale:{ x: 1, y: 1.75 } });
          }
        }
      }
    }
    ctx.ensureConnectivity();
  }

  // 3) Bubble rooms (overlapping circles)
  function genBubbleRooms(ctx){
    const W=ctx.width,H=ctx.height; const n=8+Math.floor((W*H)/500);
    for(let i=0;i<n;i++){
      const r=3+Math.floor(ctx.random()*Math.max(4,Math.min(W,H)/8));
      const x=2+r+Math.floor(ctx.random()*(W-4-2*r));
      const y=2+r+Math.floor(ctx.random()*(H-4-2*r));
      circle(ctx,x,y,r,1,true);
    }
    ctx.ensureConnectivity();
  }

  // 4) Spiral room
  function genSpiral(ctx){
    const W=ctx.width,H=ctx.height; let l=1,t=1,r=W-2,b=H-2; const w=1;
    while(l<r && t<b){ for(let x=l;x<=r;x++) for(let k=-w;k<=w;k++) setF(ctx,x,t+k); t++; for(let y=t;y<=b;y++) for(let k=-w;k<=w;k++) setF(ctx,r+k,y); r--; if(!(l<r&&t<b)) break; for(let x=r;x>=l;x--) for(let k=-w;k<=w;k++) setF(ctx,x,b+k); b--; for(let y=b;y>=t;y--) for(let k=-w;k<=w;k++) setF(ctx,l+k,y); l++; }
    if (ctx.structures) {
        placeStructure(ctx,'geo_split_hall',Math.floor(W/2),Math.floor(H/2),{ rotation: randomRotation(ctx), scaleY: 1.5 });
    }
    ctx.ensureConnectivity();
  }

  // 5) Circular tower (big disc with partitions)
  function genCircularTower(ctx){
    const W=ctx.width,H=ctx.height; const cx=W>>1, cy=H>>1; const R=Math.min(W,H)/2-3|0; circle(ctx,cx,cy,R,1,true);
    const parts=4+Math.floor(ctx.random()*4);
    for(let i=0;i<parts;i++){
      const angle = ctx.random()*Math.PI*2;
      const startX = cx+Math.cos(angle)*(R-2)|0;
      const startY = cy+Math.sin(angle)*(R-2)|0;
      const endX = cx-Math.cos(angle)*(R-2)|0;
      const endY = cy-Math.sin(angle)*(R-2)|0; // wall chord
      // draw wall (set 1) but punch doors later
      let x1 = startX;
      let y1 = startY;
      const x2 = endX;
      const y2 = endY;
      let dx=Math.abs(x2-x1),sx=x1<x2?1:-1; let dy=-Math.abs(y2-y1),sy=y1<y2?1:-1; let err=dx+dy, e2;
      for(;;){ if(inC(ctx,x1,y1)) setW(ctx,x1,y1); if(x1===x2&&y1===y2) break; e2=2*err; if(e2>=dy){err+=dy;x1+=sx;} if(e2<=dx){err+=dx;y1+=sy;} }
    }
    // doors
    const doors=6; for(let i=0;i<doors;i++){ const a=ctx.random()*Math.PI*2; const d=2+Math.floor(ctx.random()*(R-3)); const x=cx+Math.cos(a)*d|0, y=cy+Math.sin(a)*d|0; setF(ctx,x,y); setF(ctx,x+1,y); setF(ctx,x,y+1); }
    ctx.ensureConnectivity();
  }

  // 6) Square tower (big square with partitions)
  function genSquareTower(ctx){
    const W=ctx.width,H=ctx.height; const m=3; for(let y=m;y<H-m;y++) for(let x=m;x<W-m;x++) setF(ctx,x,y);
    const parts=5+Math.floor(ctx.random()*5);
    for(let i=0;i<parts;i++){
      const vertical = ctx.random()<0.5; if(vertical){ const x=m+2+Math.floor(ctx.random()*(W-2*m-4)); for(let y=m;y<H-m;y++) setW(ctx,x,y); } else { const y=m+2+Math.floor(ctx.random()*(H-2*m-4)); for(let x=m;x<W-m;x++) setW(ctx,x,y); }
    }
    for(let i=0;i<8;i++){ const x=m+2+Math.floor(ctx.random()*(W-2*m-4)); const y=m+2+Math.floor(ctx.random()*(H-2*m-4)); setF(ctx,x,y); }
    ctx.ensureConnectivity();
  }

  // 7) Diamond room
  function genDiamond(ctx){ const W=ctx.width,H=ctx.height; const cx=W>>1, cy=H>>1; const R=Math.min(W,H)/2-3|0; for(let y=cy-R;y<=cy+R;y++) for(let x=cx-R;x<=cx+R;x++){ if(Math.abs(x-cx)+Math.abs(y-cy)<=R) setF(ctx,x,y); } }

  // 8) Triangle room (random orientation)
  function genTriangle(ctx){ const W=ctx.width,H=ctx.height; const cx=W>>1, cy=H>>1; const R=Math.min(W,H)/2-3|0; const o=Math.floor(ctx.random()*4); if(o===0){ // up
      for(let y=0;y<=R;y++){ const half = Math.floor((y*W)/(2*R)); const y0=cy+R-y; for(let x=cx-half;x<=cx+half;x++) setF(ctx,x,y0); }
    } else if(o===1){ // down
      for(let y=0;y<=R;y++){ const half = Math.floor((y*W)/(2*R)); const y0=cy-R+y; for(let x=cx-half;x<=cx+half;x++) setF(ctx,x,y0); }
    } else if(o===2){ // left
      for(let x=0;x<=R;x++){ const half = Math.floor((x*H)/(2*R)); const x0=cx+R-x; for(let y=cy-half;y<=cy+half;y++) setF(ctx,x0,y); }
    } else { // right
      for(let x=0;x<=R;x++){ const half = Math.floor((x*H)/(2*R)); const x0=cx-R+x; for(let y=cy-half;y<=cy+half;y++) setF(ctx,x0,y); }
    } ctx.ensureConnectivity(); }

  function genStructureMosaic(ctx){
    if (!ctx.structures) { genBubbleRooms(ctx); return; }
    const pool = ctx.structures.list({ tags:['geo-tile'] });
    if (!pool.length) { genBubbleRooms(ctx); return; }
    const W=ctx.width,H=ctx.height;
    const step=Math.max(6, Math.floor(Math.min(W,H)/6));
    for(let y=3; y<H-3; y+=step){
      for(let x=3; x<W-3; x+=step){
        const choice = pool[Math.floor(((ctx.random?.() ?? Math.random()) % 1) * pool.length)];
        if (!choice) continue;
        placeStructure(ctx, choice.id, x, y, { rotation: randomRotation(ctx) });
      }
    }
    ctx.ensureConnectivity();
  }

  const gens = [
    { id:'ring-linked-rooms', name:'リング連結部屋', algorithm:genRingLinked, mixin:{ normalMixed:0.45, blockDimMixed:0.45, tags:['rooms'] } },
    { id:'hex-lattice-rooms', name:'六角格子部屋', algorithm:genHexLattice, mixin:{ normalMixed:0.4, blockDimMixed:0.5, tags:['sf','grid'] } },
    { id:'bubble-rooms',      name:'バブル部屋', algorithm:genBubbleRooms, mixin:{ normalMixed:0.5, blockDimMixed:0.6, tags:['organic','rooms'] } },
    { id:'spiral-room',       name:'螺旋部屋', algorithm:genSpiral, mixin:{ normalMixed:0.4, blockDimMixed:0.4, tags:['maze'] } },
    { id:'circular-tower',    name:'円の塔', algorithm:genCircularTower, mixin:{ normalMixed:0.35, blockDimMixed:0.45, tags:['rooms'] } },
    { id:'square-tower',      name:'四角の塔', algorithm:genSquareTower, mixin:{ normalMixed:0.35, blockDimMixed:0.45, tags:['rooms'] } },
    { id:'diamond-room',      name:'ダイヤの部屋', algorithm:genDiamond, mixin:{ normalMixed:0.3, blockDimMixed:0.3, tags:['single'] } },
    { id:'triangle-room',     name:'三角の部屋', algorithm:genTriangle, mixin:{ normalMixed:0.3, blockDimMixed:0.3, tags:['single'] } },
    { id:'structure-mosaic',  name:'構造モザイク', algorithm:genStructureMosaic, mixin:{ normalMixed:0.3, blockDimMixed:0.35, tags:['rooms','modular'] } },
    {
      id:'geo-fixed-labyrinth',
      name:'固定幾何ラビリンス',
      description:'固定マップを用いた幾何学迷宮。各階層のレイアウトを固定しつつ構造APIのテンプレートとして利用できます。',
      floors:{
        max:3,
        bossFloors:[3],
        maps:[
          {
            floor:1,
            layout:[
              '#####################',
              '#...................#',
              '#.###.###.###.###.###',
              '#.###.###.###.###.###',
              '#.###.###.###.###.###',
              '#...................#',
              '#.###.###.###.###.###',
              '#.###.###.###.###.###',
              '#.###.###.###.###.###',
              '#...................#',
              '#.###.###.###.###.###',
              '#.###.###.###.###.###',
              '#.###.###.###.###.###',
              '#...................#',
              '#####################'
            ]
          },
          {
            floor:2,
            layout:[
              '#####################',
              '#...................#',
              '#.#################.#',
              '#.#...............#.#',
              '#.#.#############.#.#',
              '#.#.#...........#.#.#',
              '#.#.#.#########.#.#.#',
              '#.#.#.#.......#.#.#.#',
              '#.#.#.#.#####.#.#.#.#',
              '#.#.#.#.#...#.#.#.#.#',
              '#.#.#.#.#.#.#.#.#.#.#',
              '#.#.#.#.#.#.#.#.#.#.#',
              '#.#...#.#.#.#.#...#.#',
              '#.#####.#.#.#.#####.#',
              '#####################'
            ]
          },
          {
            floor:3,
            layout:[
              '#####################',
              '#.......###.......###',
              '#.#####.#.#.#####..##',
              '#.#...#.#.#.#...#..##',
              '#.#.#.#.#.#.#.#.#..##',
              '#...#.#...#...#.#..##',
              '#####.#########.#####',
              '#..................##',
              '#####.#########.#####',
              '#...#.#...#...#.#..##',
              '#.#.#.#.#.#.#.#.#..##',
              '#.#...#.#.#.#...#..##',
              '#.#####.#.#.#####..##',
              '#.......###.......###',
              '#####################'
            ]
          }
        ]
      },
      algorithm:function algorithm(ctx){
        if (!ctx.fixedMaps?.applyCurrent?.()) {
          genRingLinked(ctx);
        }
      },
      mixin:{ normalMixed:0.25, blockDimMixed:0.25, tags:['fixed','rooms'] }
    }
  ];

  function mkBoss(d){ const r=[]; if(d>=5) r.push(5); if(d>=10) r.push(10); if(d>=15) r.push(15); return r; }
  const types = gens.map(g=>g.id);
  const blocks = {
    blocks1:[
      { key:'geo_theme_01', name:'Geo Theme I', level:+4,  size:0,  depth:+1, chest:'normal', type:types[0], bossFloors:mkBoss(8) },
      { key:'geo_theme_02', name:'Geo Theme II',level:+10, size:+1, depth:+1, chest:'less',   type:types[1], bossFloors:mkBoss(10) },
      { key:'geo_theme_03', name:'Geo Theme III',level:+16, size:+1, depth:+2, chest:'more',  type:types[2], bossFloors:mkBoss(12) },
      { key:'geo_theme_04', name:'Geo Theme IV',level:+22, size:+2, depth:+2, chest:'normal', type:types[3], bossFloors:mkBoss(14) },
      { key:'geo_theme_05', name:'Geo Theme V', level:+28, size:+2, depth:+3, chest:'less',   type:types[4], bossFloors:mkBoss(15) },
      { key:'geo_fixed_trial', name:'Geo Fixed Trial', level:+12, size:0, depth:+1, chest:'normal', type:'geo-fixed-labyrinth', bossFloors:[3] }
    ],
    blocks2:[
      { key:'geo_core_01', name:'Geo Core I', level:+0,  size:+1, depth:0, chest:'normal', type:types[5] },
      { key:'geo_core_02', name:'Geo Core II',level:+8,  size:+1, depth:+1, chest:'more',  type:types[6] },
      { key:'geo_core_03', name:'Geo Core III',level:+14, size:+2, depth:+1, chest:'less', type:types[7] },
      { key:'geo_core_04', name:'Geo Core IV',level:+20, size:+2, depth:+2, chest:'normal',type:types[0] },
      { key:'geo_core_05', name:'Geo Core V', level:+26, size:+3, depth:+2, chest:'more',  type:types[1] },
    ],
    blocks3:[
      { key:'geo_relic_01', name:'Geo Relic I', level:+0,  size:0,  depth:+2, chest:'more',   type:types[2], bossFloors:[5] },
      { key:'geo_relic_02', name:'Geo Relic II',level:+9,  size:+1, depth:+2, chest:'normal', type:types[3], bossFloors:[10] },
      { key:'geo_relic_03', name:'Geo Relic III',level:+18, size:+1, depth:+3, chest:'less', type:types[4], bossFloors:[15] },
      { key:'geo_relic_04', name:'Geo Relic IV', level:+24, size:+2, depth:+3, chest:'more', type:types[5], bossFloors:[10,15] },
      { key:'geo_relic_05', name:'Geo Relic V',  level:+30, size:+2, depth:+4, chest:'normal',type:types[8], bossFloors:[5,10,15] },
    ]
  };

  window.registerDungeonAddon({ id:'geometric_pack', name:'Geometric Structures Pack', version:'1.0.0', blocks, generators:gens, structures });
})();

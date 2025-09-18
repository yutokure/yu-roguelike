// Addon: Icy Caverns (氷窟) - cellular automata smoothed caves
(function(){
  function countWalls(map,x,y,W,H){
    let c=0; 
    for(let yy=y-1;yy<=y+1;yy++){
      for(let xx=x-1;xx<=x+1;xx++){
        if(xx===x&&yy===y) continue; 
        if(xx<0||yy<0||xx>=W||yy>=H) { c++; continue; }
        if(map[yy][xx]===1) c++;
      }
    }
    return c;
  }
  function algorithm(ctx){
    const W=ctx.width, H=ctx.height; const map=ctx.map;
    // 外周は必ず壁
    for(let x=0;x<W;x++){ map[0][x]=1; map[H-1][x]=1; }
    for(let y=0;y<H;y++){ map[y][0]=1; map[y][W-1]=1; }
    // random fill (~45% floor -> 55% wall) on interior (seeded)
    for(let y=1;y<H-1;y++){
      for(let x=1;x<W-1;x++){
        map[y][x] = (ctx.random()<0.55 ? 1:0);
      }
    }
    // smooth 5 iterations（前半は閾値4、後半は5で締める）
    for(let it=0; it<5; it++){
      const next=[]; for(let y=0;y<H;y++){ next[y]=map[y].slice(); }
      const thr = it<2 ? 4 : 5;
      for(let y=1;y<H-1;y++){
        for(let x=1;x<W-1;x++){
          const w = countWalls(map,x,y,W,H);
          next[y][x] = (w>thr)?1:0;
        }
      }
      for(let y=1;y<H-1;y++) for(let x=1;x<W-1;x++) map[y][x]=next[y][x];
    }
    // 外周を再度固定
    for(let x=0;x<W;x++){ map[0][x]=1; map[H-1][x]=1; }
    for(let y=0;y<H;y++){ map[y][0]=1; map[y][W-1]=1; }
    ctx.ensureConnectivity();
  }

  const gen = { id:'icy-caverns', name:'氷窟', description:'セルオートマトン平滑化の広間と棚氷', algorithm, mixin:{ normalMixed:0.6, blockDimMixed:0.6, tags:['cave','organic'] } };

  function mkBoss(d){ const r=[]; if(d>=5) r.push(5); if(d>=10) r.push(10); if(d>=15) r.push(15); return r; }
  const blocks = {
    blocks1:[
      { key:'frost_theme_01', name:'Frost Theme I', level:+0,  size:0,  depth:+1, chest:'less',   type:'icy-caverns', bossFloors:mkBoss(6) },
      { key:'frost_theme_02', name:'Frost Theme II',level:+6,  size:0,  depth:+1, chest:'normal', type:'icy-caverns', bossFloors:mkBoss(8) },
      { key:'frost_theme_03', name:'Frost Theme III',level:+12, size:+1, depth:+2, chest:'more', type:'icy-caverns', bossFloors:mkBoss(10) },
      { key:'frost_theme_04', name:'Frost Theme IV',level:+18, size:+1, depth:+2, chest:'normal',type:'icy-caverns', bossFloors:mkBoss(12) },
      { key:'frost_theme_05', name:'Frost Theme V', level:+24, size:+2, depth:+3, chest:'less',  type:'icy-caverns', bossFloors:mkBoss(15) },
    ],
    blocks2:[
      { key:'glacier_01', name:'Glacier I', level:+0,  size:+1, depth:0, chest:'normal', type:'icy-caverns' },
      { key:'glacier_02', name:'Glacier II',level:+7,  size:+1, depth:+1, chest:'more',  type:'icy-caverns' },
      { key:'glacier_03', name:'Glacier III',level:+14, size:+2, depth:+1, chest:'less',type:'icy-caverns' },
      { key:'glacier_04', name:'Glacier IV',level:+21, size:+2, depth:+2, chest:'normal',type:'icy-caverns' },
      { key:'glacier_05', name:'Glacier V', level:+28, size:+3, depth:+2, chest:'more', type:'icy-caverns' },
    ],
    blocks3:[
      { key:'blizzard_01', name:'Blizzard I', level:+0,  size:0,  depth:+2, chest:'more',   type:'icy-caverns', bossFloors:[5] },
      { key:'blizzard_02', name:'Blizzard II',level:+8,  size:+1, depth:+2, chest:'normal', type:'icy-caverns', bossFloors:[10] },
      { key:'blizzard_03', name:'Blizzard III',level:+16, size:+1, depth:+3, chest:'less', type:'icy-caverns', bossFloors:[15] },
      { key:'blizzard_04', name:'Blizzard IV', level:+24, size:+2, depth:+3, chest:'more', type:'icy-caverns', bossFloors:[10,15] },
      { key:'blizzard_05', name:'Blizzard V',  level:+32, size:+2, depth:+4, chest:'normal',type:'icy-caverns', bossFloors:[5,10,15] },
    ]
  };

  window.registerDungeonAddon({ id:'icy_caverns_pack', name:'Icy Caverns Pack', version:'1.0.0', blocks, generators:[gen] });
})();

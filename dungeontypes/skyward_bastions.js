// Addon: Skyward Bastions - floating islands linked by icy bridges
(function(){
  function dist2(a,b){ const dx=a.x-b.x, dy=a.y-b.y; return dx*dx + dy*dy; }
  function carveCircle(ctx, cx, cy, r, color){
    const r2 = r * r;
    for(let y = cy - r - 1; y <= cy + r + 1; y++){
      for(let x = cx - r - 1; x <= cx + r + 1; x++){
        const dx = x - cx, dy = y - cy;
        if(dx*dx + dy*dy <= r2 && ctx.inBounds(x, y)){
          ctx.set(x, y, 0);
          if(color) ctx.setFloorColor(x, y, color);
        }
      }
    }
  }
  function carveBridge(ctx, ax, ay, bx, by){
    let x = ax, y = ay;
    let step = 0;
    while(true){
      if(ctx.inBounds(x, y)){
        ctx.set(x, y, 0);
        ctx.setFloorColor(x, y, '#dbe4ff');
        if(step % 4 === 0){ ctx.setFloorType(x, y, 'ice'); }
        else { ctx.setFloorType(x, y, 'normal'); }
      }
      if(x === bx && y === by) break;
      if(x !== bx){ x += (bx > x ? 1 : -1); }
      else if(y !== by){ y += (by > y ? 1 : -1); }
      step++;
    }
  }
  function algorithm(ctx){
    const W = ctx.width, H = ctx.height;
    const random = ctx.random;
    const islands = [];
    const attempt = Math.max(12, Math.floor(W * H / 80));
    const minDist = Math.max(8, Math.floor(Math.min(W, H) / 4));
    const minDist2 = minDist * minDist;

    for(let i = 0; i < attempt && islands.length < 6; i++){
      const r = Math.max(3, Math.floor(Math.min(W, H) / 10) + Math.floor(random() * 3));
      const cx = 2 + r + Math.floor(random() * (W - 4 - 2 * r));
      const cy = 2 + r + Math.floor(random() * (H - 4 - 2 * r));
      const candidate = { x: cx, y: cy, r };
      if(islands.some(isle => dist2(isle, candidate) < minDist2)) continue;
      islands.push(candidate);
      carveCircle(ctx, cx, cy, r, '#f8edc6');
    }

    if(!islands.length){
      const r = Math.floor(Math.min(W, H) / 6);
      carveCircle(ctx, Math.floor(W/2), Math.floor(H/2), r, '#f8edc6');
      islands.push({ x: Math.floor(W/2), y: Math.floor(H/2), r });
    }

    islands.sort((a,b)=>a.x-b.x || a.y-b.y);
    for(let i=1;i<islands.length;i++){
      carveBridge(ctx, islands[i-1].x, islands[i-1].y, islands[i].x, islands[i].y);
    }

    if(islands.length >= 3){
      for(let i=0;i<islands.length;i++){
        if(random() < 0.4){
          const j = Math.floor(random() * islands.length);
          if(i !== j) carveBridge(ctx, islands[i].x, islands[i].y, islands[j].x, islands[j].y);
        }
      }
    }

    islands.forEach(isle => {
      const rim = isle.r + 2;
      for(let ang=0; ang<360; ang+=8){
        const rad = (ang * Math.PI)/180;
        const x = Math.round(isle.x + Math.cos(rad) * rim);
        const y = Math.round(isle.y + Math.sin(rad) * rim);
        if(ctx.inBounds(x, y) && ctx.get(x, y) === 0){ ctx.setFloorColor(x, y, '#e9d8a6'); }
      }
    });

    ctx.ensureConnectivity();
  }

  const gen = {
    id: 'skyward-bastions',
    name: '天空の砦',
    description: '浮遊島と氷の橋で構成された空中要塞',
    algorithm,
    mixin: { normalMixed: 0.35, blockDimMixed: 0.4, tags: ['void','bridge','ice'] }
  };

  function mkBoss(depth){ const r=[]; if(depth>=5) r.push(5); if(depth>=10) r.push(10); if(depth>=15) r.push(15); return r; }
  const blocks = {
    blocks1:[
      { key:'skyward_theme_01', name:'Skyward Theme I', level:+0,  size:0,  depth:+1, chest:'normal', type:'skyward-bastions', bossFloors:mkBoss(6) },
      { key:'skyward_theme_02', name:'Skyward Theme II',level:+8,  size:+1, depth:+1, chest:'less',   type:'skyward-bastions', bossFloors:mkBoss(8) },
      { key:'skyward_theme_03', name:'Skyward Theme III',level:+16, size:+1, depth:+2, chest:'more',   type:'skyward-bastions', bossFloors:mkBoss(10) },
      { key:'skyward_theme_04', name:'Skyward Theme IV',level:+24, size:+2, depth:+2, chest:'normal', type:'skyward-bastions', bossFloors:mkBoss(12) },
      { key:'skyward_theme_05', name:'Skyward Theme V', level:+32, size:+2, depth:+3, chest:'less',   type:'skyward-bastions', bossFloors:mkBoss(15) },
    ],
    blocks2:[
      { key:'bastion_core_01', name:'Bastion Core I', level:+0,  size:+1, depth:0, chest:'normal', type:'skyward-bastions' },
      { key:'bastion_core_02', name:'Bastion Core II',level:+6,  size:+1, depth:+1, chest:'more',  type:'skyward-bastions' },
      { key:'bastion_core_03', name:'Bastion Core III',level:+12, size:+2, depth:+1, chest:'less', type:'skyward-bastions' },
      { key:'bastion_core_04', name:'Bastion Core IV',level:+18, size:+2, depth:+2, chest:'normal',type:'skyward-bastions' },
      { key:'bastion_core_05', name:'Bastion Core V', level:+24, size:+3, depth:+2, chest:'more',  type:'skyward-bastions' },
    ],
    blocks3:[
      { key:'airy_relic_01', name:'Airy Relic I', level:+0,  size:0,  depth:+2, chest:'more',   type:'skyward-bastions', bossFloors:[5] },
      { key:'airy_relic_02', name:'Airy Relic II',level:+9,  size:+1, depth:+2, chest:'normal', type:'skyward-bastions', bossFloors:[10] },
      { key:'airy_relic_03', name:'Airy Relic III',level:+18, size:+1, depth:+3, chest:'less', type:'skyward-bastions', bossFloors:[15] },
      { key:'airy_relic_04', name:'Airy Relic IV', level:+24, size:+2, depth:+3, chest:'more', type:'skyward-bastions', bossFloors:[10,15] },
      { key:'airy_relic_05', name:'Airy Relic V',  level:+30, size:+2, depth:+4, chest:'normal',type:'skyward-bastions', bossFloors:[5,10,15] },
    ]
  };

  window.registerDungeonAddon({ id:'skyward_pack', name:'Skyward Bastions Pack', version:'1.0.0', blocks, generators:[gen] });
})();

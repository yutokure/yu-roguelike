// Addon: Clockwork Labyrinth - concentric mechanical corridors with gear spokes
(function(){
  function carveRectRing(ctx, x1, y1, x2, y2, color){
    for(let x=x1; x<=x2; x++){
      if(ctx.inBounds(x,y1)){ ctx.set(x,y1,0); ctx.setFloorColor(x,y1,color); }
      if(ctx.inBounds(x,y2)){ ctx.set(x,y2,0); ctx.setFloorColor(x,y2,color); }
    }
    for(let y=y1; y<=y2; y++){
      if(ctx.inBounds(x1,y)){ ctx.set(x1,y,0); ctx.setFloorColor(x1,y,color); }
      if(ctx.inBounds(x2,y)){ ctx.set(x2,y,0); ctx.setFloorColor(x2,y,color); }
    }
  }
  function carveLine(ctx, x1,y1,x2,y2,color){
    let x=x1, y=y1;
    const dx = Math.sign(x2-x1), dy = Math.sign(y2-y1);
    const len = Math.max(Math.abs(x2-x1), Math.abs(y2-y1));
    for(let i=0;i<=len;i++){
      if(ctx.inBounds(x,y)){ ctx.set(x,y,0); ctx.setFloorColor(x,y,color); }
      if(x !== x2) x += dx;
      if(y !== y2) y += dy;
    }
  }
  function algorithm(ctx){
    const W = ctx.width, H = ctx.height;
    const random = ctx.random;
    const layers = [];
    const maxLayer = Math.min(W,H)/2 - 2;
    const baseColor = ['#ced4da','#adb5bd','#dee2e6','#ffd43b'];
    for(let offset=2, idx=0; offset<maxLayer; offset+=3, idx++){
      const x1 = offset, y1 = offset;
      const x2 = W-1-offset, y2 = H-1-offset;
      if(x2<=x1 || y2<=y1) break;
      const color = baseColor[idx % baseColor.length];
      carveRectRing(ctx, x1, y1, x2, y2, color);
      layers.push({x1,y1,x2,y2,color});
    }

    const cx = Math.floor(W/2), cy = Math.floor(H/2);
    layers.forEach((layer, idx) => {
      const step = 4;
      for(let a=0;a<360;a+=45){
        const rad = (a*Math.PI)/180;
        const rx = Math.round(cx + Math.cos(rad)*(layer.x2-layer.x1)/2);
        const ry = Math.round(cy + Math.sin(rad)*(layer.y2-layer.y1)/2);
        carveLine(ctx, cx, cy, rx, ry, idx % 2 === 0 ? '#ffe066' : '#ffba08');
      }
    });

    // Internal partitions forming gear teeth
    for(let i=0;i<layers.length;i++){
      const layer = layers[i];
      const color = i%2===0 ? '#e9ecef' : '#f8f9fa';
      const segment = 3;
      for(let x = layer.x1+segment; x<layer.x2; x+=segment*2){
        for(let y = layer.y1+1; y<layer.y2; y++){
          if((y-layer.y1)%segment===0 && ctx.inBounds(x,y)){
            ctx.set(x,y,0);
            ctx.setFloorColor(x,y,color);
          }
        }
      }
    }

    // Random maintenance shafts
    for(let k=0;k<8;k++){
      const x = 2 + Math.floor(random()*(W-4));
      const y = 2 + Math.floor(random()*(H-4));
      if(ctx.inBounds(x,y)){
        ctx.set(x,y,0);
        ctx.setFloorColor(x,y,'#ffc107');
      }
    }

    ctx.ensureConnectivity();
  }

  const gen = {
    id: 'clockwork-labyrinth',
    name: '機構迷宮',
    description: '歯車のような同心回廊が広がる機械仕掛けの迷宮',
    algorithm,
    mixin: { normalMixed: 0.4, blockDimMixed: 0.45, tags: ['structured','mechanical'] }
  };

  function mkBoss(depth){ const r=[]; if(depth>=5) r.push(5); if(depth>=10) r.push(10); if(depth>=15) r.push(15); return r; }
  const blocks = {
    blocks1:[
      { key:'clock_theme_01', name:'Clock Theme I', level:+0,  size:0,  depth:+1, chest:'normal', type:'clockwork-labyrinth', bossFloors:mkBoss(6) },
      { key:'clock_theme_02', name:'Clock Theme II',level:+8,  size:+1, depth:+1, chest:'less',   type:'clockwork-labyrinth', bossFloors:mkBoss(8) },
      { key:'clock_theme_03', name:'Clock Theme III',level:+16, size:+1, depth:+2, chest:'more',  type:'clockwork-labyrinth', bossFloors:mkBoss(10) },
      { key:'clock_theme_04', name:'Clock Theme IV', level:+24, size:+2, depth:+2, chest:'normal',type:'clockwork-labyrinth', bossFloors:mkBoss(12) },
      { key:'clock_theme_05', name:'Clock Theme V',  level:+32, size:+2, depth:+3, chest:'less',  type:'clockwork-labyrinth', bossFloors:mkBoss(15) },
    ],
    blocks2:[
      { key:'gear_core_01', name:'Gear Core I', level:+0,  size:+1, depth:0, chest:'normal', type:'clockwork-labyrinth' },
      { key:'gear_core_02', name:'Gear Core II',level:+6,  size:+1, depth:+1, chest:'more',  type:'clockwork-labyrinth' },
      { key:'gear_core_03', name:'Gear Core III',level:+12, size:+2, depth:+1, chest:'less', type:'clockwork-labyrinth' },
      { key:'gear_core_04', name:'Gear Core IV',level:+18, size:+2, depth:+2, chest:'normal',type:'clockwork-labyrinth' },
      { key:'gear_core_05', name:'Gear Core V', level:+24, size:+3, depth:+2, chest:'more',  type:'clockwork-labyrinth' },
    ],
    blocks3:[
      { key:'gear_relic_01', name:'Gear Relic I', level:+0,  size:0,  depth:+2, chest:'more',   type:'clockwork-labyrinth', bossFloors:[5] },
      { key:'gear_relic_02', name:'Gear Relic II',level:+9,  size:+1, depth:+2, chest:'normal', type:'clockwork-labyrinth', bossFloors:[10] },
      { key:'gear_relic_03', name:'Gear Relic III',level:+18, size:+1, depth:+3, chest:'less', type:'clockwork-labyrinth', bossFloors:[15] },
      { key:'gear_relic_04', name:'Gear Relic IV', level:+24, size:+2, depth:+3, chest:'more', type:'clockwork-labyrinth', bossFloors:[10,15] },
      { key:'gear_relic_05', name:'Gear Relic V',  level:+30, size:+2, depth:+4, chest:'normal',type:'clockwork-labyrinth', bossFloors:[5,10,15] },
    ]
  };

  window.registerDungeonAddon({ id:'clockwork_pack', name:'Clockwork Labyrinth Pack', version:'1.0.0', blocks, generators:[gen] });
})();

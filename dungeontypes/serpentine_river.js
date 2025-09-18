// Addon: Serpentine River (蛇行河) - meandering corridors with branches
(function(){
  function clamp(v,a,b){ return v<a?a:(v>b?b:v); }
  function algorithm(ctx){
    const W = ctx.width, H = ctx.height; 
    const centerY = Math.floor(H/2);
    function carveWide(x,y,w){
      for(let dy=-w; dy<=w; dy++) for(let dx=-w; dx<=w; dx++)
        if(ctx.inBounds(x+dx,y+dy)) ctx.set(x+dx,y+dy,0);
    }

    let x = 1, y = centerY;
    let targetY = centerY; // ゆっくり動く目標Yで滑らかな蛇行
    const width = Math.max(1, Math.min(3, Math.floor(Math.min(W,H)/25)));
    const steps = Math.max(W*3, (W+H)*2);

    for (let i=0; i<steps; i++){
      carveWide(x,y,width);

      // 目標Yをゆっくり変化（1Dノイズ風）
      if (ctx.random() < 0.15){
        const amp = Math.max(1, Math.floor(H*0.08));
        targetY = clamp(targetY + Math.floor((ctx.random()*2 - 1) * amp), 2, H-3);
      }

      const dy = Math.sign(targetY - y);
      const dir = (Math.abs(targetY - y) > 0 && ctx.random() < 0.7) ? [1, dy] : [1, 0];

      x += dir[0]; y += dir[1];
      if (x >= W-2) { x = W-2; }
      if (x <= 1) { x = 2; }
      if (y <= 1) { y = 2; }
      if (y >= H-2) { y = H-3; }

      // 側枝（本流座標を汚染しない＆実際の座標で境界判定）
      if (ctx.random() < Math.min(0.04, 0.02 + (Math.min(W,H)/2000))){
        const by = y; const sy = (ctx.random() < 0.5 ? -1 : 1);
        let bx = x; const len = 3 + Math.floor(ctx.random() * Math.max(6, Math.min(W,H)/6));
        for (let k=0; k<len; k++){
          bx += 1; const yy = by + Math.floor(sy * k / 2);
          if (!ctx.inBounds(bx, yy)) break;
          carveWide(bx, yy, Math.max(1, Math.floor(width/2)));
        }
      }
    }
    ctx.ensureConnectivity();
  }

  const gen = { id:'serpentine-river', name:'蛇行河', description:'蛇行する本流と分流の回廊', algorithm, mixin:{ normalMixed:0.5, blockDimMixed:0.4, tags:['snake','corridor'] } };

  function mkBoss(d){ const r=[]; if(d>=5) r.push(5); if(d>=10) r.push(10); if(d>=15) r.push(15); return r; }
  const blocks = {
    blocks1:[
      { key:'river_theme_01', name:'River Theme I', level:+0,  size:0,  depth:+1, chest:'normal', type:'serpentine-river', bossFloors:mkBoss(6) },
      { key:'river_theme_02', name:'River Theme II',level:+6,  size:0,  depth:+1, chest:'less',   type:'serpentine-river', bossFloors:mkBoss(8) },
      { key:'river_theme_03', name:'River Theme III',level:+12, size:+1, depth:+2, chest:'more',   type:'serpentine-river', bossFloors:mkBoss(10) },
      { key:'river_theme_04', name:'River Theme IV',level:+18, size:+1, depth:+2, chest:'normal', type:'serpentine-river', bossFloors:mkBoss(12) },
      { key:'river_theme_05', name:'River Theme V', level:+24, size:+2, depth:+3, chest:'less',   type:'serpentine-river', bossFloors:mkBoss(15) },
    ],
    blocks2:[
      { key:'delta_01', name:'Delta I', level:+0,  size:+1, depth:0, chest:'normal', type:'serpentine-river' },
      { key:'delta_02', name:'Delta II',level:+7,  size:+1, depth:+1, chest:'more',  type:'serpentine-river' },
      { key:'delta_03', name:'Delta III',level:+14, size:+2, depth:+1, chest:'less',type:'serpentine-river' },
      { key:'delta_04', name:'Delta IV',level:+21, size:+2, depth:+2, chest:'normal',type:'serpentine-river' },
      { key:'delta_05', name:'Delta V', level:+28, size:+3, depth:+2, chest:'more', type:'serpentine-river' },
    ],
    blocks3:[
      { key:'serpent_01', name:'Serpent I', level:+0,  size:0,  depth:+2, chest:'more',   type:'serpentine-river', bossFloors:[5] },
      { key:'serpent_02', name:'Serpent II',level:+8,  size:+1, depth:+2, chest:'normal', type:'serpentine-river', bossFloors:[10] },
      { key:'serpent_03', name:'Serpent III',level:+16, size:+1, depth:+3, chest:'less', type:'serpentine-river', bossFloors:[15] },
      { key:'serpent_04', name:'Serpent IV', level:+24, size:+2, depth:+3, chest:'more', type:'serpentine-river', bossFloors:[10,15] },
      { key:'serpent_05', name:'Serpent V',  level:+32, size:+2, depth:+4, chest:'normal',type:'serpentine-river', bossFloors:[5,10,15] },
    ]
  };

  window.registerDungeonAddon({ id:'serpentine_pack', name:'Serpentine River Pack', version:'1.0.0', blocks, generators:[gen] });
})();

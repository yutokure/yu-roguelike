// Addon: Ruined Labyrinth (遺跡迷宮) - maze with collapsed walls and open breaches
(function(){
  function carveCell(ctx, cx, cy){
    const x = 1 + cx * 2;
    const y = 1 + cy * 2;
    if(ctx.inBounds(x, y)){
      ctx.set(x, y, 0);
      ctx.setFloorColor(x, y, '#d6c7a1');
    }
  }
  function carvePassage(ctx, cx, cy, nx, ny){
    const x1 = 1 + cx * 2;
    const y1 = 1 + cy * 2;
    const x2 = 1 + nx * 2;
    const y2 = 1 + ny * 2;
    const mx = Math.floor((x1 + x2) / 2);
    const my = Math.floor((y1 + y2) / 2);
    if(ctx.inBounds(mx, my)) ctx.set(mx, my, 0);
    carveCell(ctx, nx, ny);
    if(ctx.inBounds(mx, my)) ctx.setFloorColor(mx, my, '#d6c7a1');
  }
  function applyWear(ctx, W, H, random){
    const breachCount = Math.max(10, Math.floor((W * H) / 30));
    for(let i=0;i<breachCount;i++){
      const x = 2 + Math.floor(random() * Math.max(1, W-4));
      const y = 2 + Math.floor(random() * Math.max(1, H-4));
      if(ctx.inBounds(x, y) && ctx.get(x, y) === 1){
        ctx.set(x, y, 0);
        ctx.setFloorColor(x, y, '#cbb793');
        // chance to erode surrounding walls for wider gaps
        if(random() < 0.5){
          const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
          for(const [dx,dy] of dirs){
            const nx = x + dx;
            const ny = y + dy;
            if(ctx.inBounds(nx, ny) && ctx.get(nx, ny) === 1 && random() < 0.5){
              ctx.set(nx, ny, 0);
              ctx.setFloorColor(nx, ny, '#cbb793');
            }
          }
        }
      }
    }
    // add rubble colored walls sporadically
    for(let y=1;y<H-1;y++){
      for(let x=1;x<W-1;x++){
        if(ctx.get(x, y) === 1 && random() < 0.08){
          ctx.setWallColor(x, y, '#8c7a5b');
        }
      }
    }
  }
  function algorithm(ctx){
    const W = ctx.width, H = ctx.height;
    const random = ctx.random;
    for(let y=0;y<H;y++){
      for(let x=0;x<W;x++){
        ctx.set(x, y, 1);
        if(x===0 || y===0 || x===W-1 || y===H-1){
          ctx.setWallColor(x, y, '#735f3a');
        }else if(random() < 0.15){
          ctx.setWallColor(x, y, '#9f8a62');
        }
      }
    }
    const cellsX = Math.max(2, Math.floor((W-1)/2));
    const cellsY = Math.max(2, Math.floor((H-1)/2));
    const visited = Array.from({length:cellsY}, () => Array(cellsX).fill(false));
    const stack = [];
    const start = { cx: Math.floor(random()*cellsX), cy: Math.floor(random()*cellsY) };
    stack.push(start);
    visited[start.cy][start.cx] = true;
    carveCell(ctx, start.cx, start.cy);
    const dirs = [
      {cx:1, cy:0}, {cx:-1, cy:0}, {cx:0, cy:1}, {cx:0, cy:-1}
    ];
    while(stack.length){
      const current = stack[stack.length-1];
      const neighbors = [];
      for(const dir of dirs){
        const nx = current.cx + dir.cx;
        const ny = current.cy + dir.cy;
        if(nx>=0 && nx<cellsX && ny>=0 && ny<cellsY && !visited[ny][nx]){
          neighbors.push({cx:nx, cy:ny});
        }
      }
      if(neighbors.length){
        const next = neighbors[Math.floor(random()*neighbors.length)];
        carvePassage(ctx, current.cx, current.cy, next.cx, next.cy);
        visited[next.cy][next.cx] = true;
        stack.push(next);
      }else{
        stack.pop();
      }
    }
    applyWear(ctx, W, H, random);
    ctx.ensureConnectivity();
  }
  const gen = {
    id: 'ruined-labyrinth',
    name: '遺跡迷宮',
    nameKey: "dungeon.types.ruined_labyrinth.name",
    description: '迷路の壁が崩れ、所々で大きく開いた遺跡の迷宮',
    descriptionKey: "dungeon.types.ruined_labyrinth.description",
    algorithm,
    mixin: { normalMixed: 0.5, blockDimMixed: 0.45, tags: ['maze','ruins'] }
  };
  function mkBoss(depth){ const r=[]; if(depth>=5) r.push(5); if(depth>=10) r.push(10); if(depth>=15) r.push(15); return r; }
  const blocks = {
    blocks1:[
      {
        key:'ruined_lab_theme_01',
        name:'Ruined Labyrinth I',
        nameKey: "dungeon.types.ruined_labyrinth.blocks.ruined_lab_theme_01.name",
        level:+0,
        size:0,
        depth:+1,
        chest:'normal',
        type:'ruined-labyrinth',
        bossFloors:mkBoss(6)
      },
      {
        key:'ruined_lab_theme_02',
        name:'Ruined Labyrinth II',
        nameKey: "dungeon.types.ruined_labyrinth.blocks.ruined_lab_theme_02.name",
        level:+6,
        size:0,
        depth:+1,
        chest:'more',
        type:'ruined-labyrinth',
        bossFloors:mkBoss(8)
      },
      {
        key:'ruined_lab_theme_03',
        name:'Ruined Labyrinth III',
        nameKey: "dungeon.types.ruined_labyrinth.blocks.ruined_lab_theme_03.name",
        level:+12,
        size:+1,
        depth:+2,
        chest:'less',
        type:'ruined-labyrinth',
        bossFloors:mkBoss(10)
      },
      {
        key:'ruined_lab_theme_04',
        name:'Ruined Labyrinth IV',
        nameKey: "dungeon.types.ruined_labyrinth.blocks.ruined_lab_theme_04.name",
        level:+18,
        size:+1,
        depth:+2,
        chest:'normal',
        type:'ruined-labyrinth',
        bossFloors:mkBoss(12)
      },
      {
        key:'ruined_lab_theme_05',
        name:'Ruined Labyrinth V',
        nameKey: "dungeon.types.ruined_labyrinth.blocks.ruined_lab_theme_05.name",
        level:+24,
        size:+2,
        depth:+3,
        chest:'more',
        type:'ruined-labyrinth',
        bossFloors:mkBoss(15)
      },
    ],
    blocks2:[
      {
        key:'ruined_lab_core_01',
        name:'Ruined Core I',
        nameKey: "dungeon.types.ruined_labyrinth.blocks.ruined_lab_core_01.name",
        level:+0,
        size:+1,
        depth:0,
        chest:'normal',
        type:'ruined-labyrinth'
      },
      {
        key:'ruined_lab_core_02',
        name:'Ruined Core II',
        nameKey: "dungeon.types.ruined_labyrinth.blocks.ruined_lab_core_02.name",
        level:+7,
        size:+1,
        depth:+1,
        chest:'more',
        type:'ruined-labyrinth'
      },
      {
        key:'ruined_lab_core_03',
        name:'Ruined Core III',
        nameKey: "dungeon.types.ruined_labyrinth.blocks.ruined_lab_core_03.name",
        level:+14,
        size:+2,
        depth:+1,
        chest:'less',
        type:'ruined-labyrinth'
      },
      {
        key:'ruined_lab_core_04',
        name:'Ruined Core IV',
        nameKey: "dungeon.types.ruined_labyrinth.blocks.ruined_lab_core_04.name",
        level:+21,
        size:+2,
        depth:+2,
        chest:'normal',
        type:'ruined-labyrinth'
      },
      {
        key:'ruined_lab_core_05',
        name:'Ruined Core V',
        nameKey: "dungeon.types.ruined_labyrinth.blocks.ruined_lab_core_05.name",
        level:+28,
        size:+3,
        depth:+2,
        chest:'more',
        type:'ruined-labyrinth'
      },
    ],
    blocks3:[
      {
        key:'ruined_lab_relic_01',
        name:'Ancient Relic I',
        nameKey: "dungeon.types.ruined_labyrinth.blocks.ruined_lab_relic_01.name",
        level:+0,
        size:0,
        depth:+2,
        chest:'more',
        type:'ruined-labyrinth',
        bossFloors:[5]
      },
      {
        key:'ruined_lab_relic_02',
        name:'Ancient Relic II',
        nameKey: "dungeon.types.ruined_labyrinth.blocks.ruined_lab_relic_02.name",
        level:+9,
        size:+1,
        depth:+2,
        chest:'normal',
        type:'ruined-labyrinth',
        bossFloors:[10]
      },
      {
        key:'ruined_lab_relic_03',
        name:'Ancient Relic III',
        nameKey: "dungeon.types.ruined_labyrinth.blocks.ruined_lab_relic_03.name",
        level:+18,
        size:+1,
        depth:+3,
        chest:'less',
        type:'ruined-labyrinth',
        bossFloors:[15]
      },
      {
        key:'ruined_lab_relic_04',
        name:'Ancient Relic IV',
        nameKey: "dungeon.types.ruined_labyrinth.blocks.ruined_lab_relic_04.name",
        level:+24,
        size:+2,
        depth:+3,
        chest:'more',
        type:'ruined-labyrinth',
        bossFloors:[10,15]
      },
      {
        key:'ruined_lab_relic_05',
        name:'Ancient Relic V',
        nameKey: "dungeon.types.ruined_labyrinth.blocks.ruined_lab_relic_05.name",
        level:+30,
        size:+2,
        depth:+4,
        chest:'normal',
        type:'ruined-labyrinth',
        bossFloors:[5,10,15]
      },
    ]
  };
  window.registerDungeonAddon({
    id:'ruined_labyrinth_pack',
    name:'Ruined Labyrinth Pack',
    nameKey: "dungeon.packs.ruined_labyrinth_pack.name",
    version:'1.0.0',
    blocks,
    generators:[gen]
  });
})();

// Addon: Echo Vaults - harmonic amphitheaters carved by sound resonance
(function(){
  function carveEllipse(ctx, grid, cx, cy, rx, ry, color){
    for(let y=cy-ry; y<=cy+ry; y++){
      for(let x=cx-rx; x<=cx+rx; x++){
        const dx = (x-cx)/rx;
        const dy = (y-cy)/ry;
        if(dx*dx + dy*dy <= 1 && ctx.inBounds(x,y)){
          ctx.set(x,y,0);
          if(grid) grid[y][x] = 0;
          if(color) ctx.setFloorColor(x,y,color);
        }
      }
    }
  }

  function carveArcCorridor(ctx, grid, ax, ay, bx, by, radius, color){
    const steps = Math.max(Math.abs(ax-bx), Math.abs(ay-by))*2;
    for(let i=0;i<=steps;i++){
      const t = i/steps;
      const mx = Math.round(ax + (bx-ax)*t);
      const my = Math.round(ay + (by-ay)*t);
      const angle = t*Math.PI;
      const offsetX = Math.round(Math.cos(angle)*radius*0.3);
      const offsetY = Math.round(Math.sin(angle)*radius*0.3);
      for(let yy=my-radius; yy<=my+radius; yy++){
        for(let xx=mx-radius; xx<=mx+radius; xx++){
          const dx = xx-(mx+offsetX);
          const dy = yy-(my+offsetY);
          if(dx*dx + dy*dy <= radius*radius && ctx.inBounds(xx,yy)){
            ctx.set(xx,yy,0);
            if(grid) grid[yy][xx] = 0;
            if(color) ctx.setFloorColor(xx,yy,color);
          }
        }
      }
    }
  }

  function algorithm(ctx){
    const { width:W, height:H, set, setFloorColor, setWallColor, setFloorType, ensureConnectivity, random, inBounds } = ctx;

    const grid = Array.from({length:H}, () => Array(W).fill(1));
    for(let y=0;y<H;y++){
      for(let x=0;x<W;x++) set(x,y,1);
    }

    const center = { x: Math.floor(W/2), y: Math.floor(H/2) };
    const mainRadiusX = Math.floor(W*0.28);
    const mainRadiusY = Math.floor(H*0.24);
    carveEllipse(ctx, grid, center.x, center.y, mainRadiusX, mainRadiusY, '#f5f3ff');

    const lobes = [];
    const lobeCount = 6;
    for(let i=0;i<lobeCount;i++){
      const angle = (Math.PI*2*i)/lobeCount;
      const rx = Math.max(4, Math.floor(W*0.12 + Math.sin(angle*2)*2));
      const ry = Math.max(4, Math.floor(H*0.1 + Math.cos(angle*2)*2));
      const distance = Math.floor(Math.min(W,H)/3);
      const cx = center.x + Math.round(Math.cos(angle)*distance);
      const cy = center.y + Math.round(Math.sin(angle)*distance*0.85);
      carveEllipse(ctx, grid, cx, cy, rx, ry, '#ddd6fe');
      lobes.push({x:cx,y:cy,rx,ry});
    }

    lobes.forEach(lobe => {
      carveArcCorridor(ctx, grid, center.x, center.y, lobe.x, lobe.y, Math.max(3, Math.floor(Math.min(lobe.rx,lobe.ry)/2)), '#ede9fe');
    });

    const resonanceNodes = [];
    const resonanceCount = Math.max(5, Math.floor((W+H)/10));
    for(let i=0;i<resonanceCount;i++){
      const lobe = lobes[Math.floor(random()*lobes.length)];
      const angle = random()*Math.PI*2;
      const radius = Math.max(2, Math.floor(Math.min(lobe.rx,lobe.ry)/2));
      const cx = lobe.x + Math.round(Math.cos(angle)*(lobe.rx-2));
      const cy = lobe.y + Math.round(Math.sin(angle)*(lobe.ry-2));
      carveEllipse(ctx, grid, cx, cy, radius, Math.max(2, Math.floor(radius*0.6)), '#c4b5fd');
      resonanceNodes.push({x:cx,y:cy});
    }

    for(let y=0;y<H;y++){
      for(let x=0;x<W;x++){
        if(grid[y][x] === 0){
          const dist = Math.sqrt((x-center.x)**2 + (y-center.y)**2);
          const tone = Math.max(0, 1 - dist / Math.max(1, Math.min(W,H)/2));
          const light = Math.floor(lerp(50, 220, tone));
          setFloorColor(x,y,`rgb(${light},${Math.floor(light*0.8)},${220})`);
          if(random()<0.05) setFloorType(x,y,'echo_crystal');
        } else {
          const shade = Math.floor(lerp(20,80, random()));
          setWallColor(x,y,`rgb(${shade},${shade},${shade+20})`);
        }
      }
    }

    resonanceNodes.forEach((node, idx) => {
      const phase = (idx/resonanceNodes.length) * Math.PI*2;
      const ringRadius = 3 + (idx % 4);
      for(let angle=0; angle<Math.PI*2; angle+=Math.PI/24){
        const rx = node.x + Math.round(Math.cos(angle+phase)*ringRadius);
        const ry = node.y + Math.round(Math.sin(angle+phase)*ringRadius);
        if(inBounds(rx,ry)){
          set(rx,ry,0);
          grid[ry][rx] = 0;
          setFloorColor(rx,ry,'#a78bfa');
        }
      }
    });

    ensureConnectivity();
  }

  function lerp(a,b,t){ return a + (b-a)*t; }

  const gen = {
    id: 'echo-vaults',
    name: '残響聖窟',
    nameKey: "dungeon.types.echo_vaults.name",
    description: '音が共鳴して形作られた聖堂のような洞窟。音の波紋が床面を彩る。',
    descriptionKey: "dungeon.types.echo_vaults.description",
    algorithm,
    mixin: { normalMixed: 0.48, blockDimMixed: 0.5, tags: ['cave','resonance','structure'] }
  };

  function mkBoss(depth){ const floors=[]; if(depth>=6) floors.push(6); if(depth>=12) floors.push(12); if(depth>=18) floors.push(18); return floors; }

  const blocks = {
    blocks1:[
      {
        key:'echo_vault_theme_01',
        name:'Echo Vault I',
        nameKey: "dungeon.types.echo_vaults.blocks.echo_vault_theme_01.name",
        level:+0,
        size:0,
        depth:+1,
        chest:'normal',
        type:'echo-vaults',
        bossFloors:mkBoss(8)
      },
      {
        key:'echo_vault_theme_02',
        name:'Echo Vault II',
        nameKey: "dungeon.types.echo_vaults.blocks.echo_vault_theme_02.name",
        level:+8,
        size:+1,
        depth:+1,
        chest:'less',
        type:'echo-vaults',
        bossFloors:mkBoss(12)
      },
      {
        key:'echo_vault_theme_03',
        name:'Echo Vault III',
        nameKey: "dungeon.types.echo_vaults.blocks.echo_vault_theme_03.name",
        level:+16,
        size:+1,
        depth:+2,
        chest:'more',
        type:'echo-vaults',
        bossFloors:mkBoss(16)
      }
    ],
    blocks2:[
      {
        key:'echo_core_01',
        name:'Echo Core I',
        nameKey: "dungeon.types.echo_vaults.blocks.echo_core_01.name",
        level:+0,
        size:+1,
        depth:0,
        chest:'normal',
        type:'echo-vaults'
      },
      {
        key:'echo_core_02',
        name:'Echo Core II',
        nameKey: "dungeon.types.echo_vaults.blocks.echo_core_02.name",
        level:+7,
        size:+1,
        depth:+1,
        chest:'more',
        type:'echo-vaults'
      },
      {
        key:'echo_core_03',
        name:'Echo Core III',
        nameKey: "dungeon.types.echo_vaults.blocks.echo_core_03.name",
        level:+14,
        size:+2,
        depth:+1,
        chest:'less',
        type:'echo-vaults'
      }
    ],
    blocks3:[
      {
        key:'echo_relic_01',
        name:'Echo Relic I',
        nameKey: "dungeon.types.echo_vaults.blocks.echo_relic_01.name",
        level:+0,
        size:0,
        depth:+2,
        chest:'more',
        type:'echo-vaults',
        bossFloors:[6]
      },
      {
        key:'echo_relic_02',
        name:'Echo Relic II',
        nameKey: "dungeon.types.echo_vaults.blocks.echo_relic_02.name",
        level:+11,
        size:+1,
        depth:+3,
        chest:'normal',
        type:'echo-vaults',
        bossFloors:[12]
      },
      {
        key:'echo_relic_03',
        name:'Echo Relic III',
        nameKey: "dungeon.types.echo_vaults.blocks.echo_relic_03.name",
        level:+19,
        size:+1,
        depth:+4,
        chest:'less',
        type:'echo-vaults',
        bossFloors:[18]
      }
    ]
  };

  window.registerDungeonAddon({
    id:'echo_vaults_pack',
    name:'Echo Vaults Pack',
    nameKey: "dungeon.packs.echo_vaults_pack.name",
    version:'1.0.0',
    blocks,
    generators:[gen]
  });
})();

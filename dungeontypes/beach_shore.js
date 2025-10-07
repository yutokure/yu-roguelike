// Addon: Sunlit Shore - sandy beaches with tidal waterlines
(function(){
  function algorithm(ctx){
    const W=ctx.width, H=ctx.height;
    const random=ctx.random;
    const shoreline = Math.floor(H*0.6);

    for(let y=2;y<shoreline;y++){
      for(let x=2;x<W-2;x++) if(ctx.inBounds(x,y)){
        ctx.set(x,y,0);
        ctx.setFloorColor(x,y,'#ffe8a1');
      }
    }

    // Beach ripples
    for(let y=shoreline-3; y<shoreline; y++){
      for(let x=2; x<W-2; x++) if(ctx.inBounds(x,y) && random()<0.2){
        ctx.set(x,y,0);
        ctx.setFloorColor(x,y,'#ffd8a8');
      }
    }

    for(let y=shoreline;y<H-1;y++){
      for(let x=0;x<W;x++){
        ctx.setWallColor(x,y,'#4dabf7');
      }
    }

    // Tidal pools cutting into sand
    const pools = Math.max(3, Math.floor(W/12));
    for(let i=0;i<pools;i++){
      const px = 3 + Math.floor(random()*(W-6));
      const py = shoreline - 1 - Math.floor(random()*4);
      const len = 3 + Math.floor(random()*4);
      let x=px, y=py;
      for(let k=0;k<len;k++){
        if(ctx.inBounds(x,y)){
          ctx.set(x,y,1);
          ctx.setWallColor(x,y,'#4dc0f1');
        }
        x += random()<0.5 ? -1:1;
        if(x<2) x=2;
        if(x>W-3) x=W-3;
      }
    }

    // Walkway along coastline to keep connectivity
    for(let x=2;x<W-2;x++) if(ctx.inBounds(x, shoreline-1)){
      ctx.set(x, shoreline-1, 0);
      ctx.setFloorColor(x, shoreline-1, '#ffe8a1');
    }

    ctx.ensureConnectivity();
  }

  const gen = {
    id: 'sunlit-shore',
    name: '砂浜',
    nameKey: "dungeon.types.sunlit_shore.name",
    description: '砂浜と海水が広がる海岸沿いの地形',
    descriptionKey: "dungeon.types.sunlit_shore.description",
    algorithm,
    mixin: { normalMixed: 0.35, blockDimMixed: 0.4, tags: ['beach','water'] }
  };

  function mkBoss(depth){ const r=[]; if(depth>=5) r.push(5); if(depth>=10) r.push(10); if(depth>=15) r.push(15); return r; }
  const blocks = {
    blocks1:[
      {
        key:'shore_theme_01',
        name:'Shore Theme I',
        nameKey: "dungeon.types.sunlit_shore.blocks.shore_theme_01.name",
        level:+0,
        size:0,
        depth:+1,
        chest:'normal',
        type:'sunlit-shore',
        bossFloors:mkBoss(6)
      },
      {
        key:'shore_theme_02',
        name:'Shore Theme II',
        nameKey: "dungeon.types.sunlit_shore.blocks.shore_theme_02.name",
        level:+7,
        size:+1,
        depth:+1,
        chest:'less',
        type:'sunlit-shore',
        bossFloors:mkBoss(8)
      },
      {
        key:'shore_theme_03',
        name:'Shore Theme III',
        nameKey: "dungeon.types.sunlit_shore.blocks.shore_theme_03.name",
        level:+14,
        size:+1,
        depth:+2,
        chest:'more',
        type:'sunlit-shore',
        bossFloors:mkBoss(10)
      },
      {
        key:'shore_theme_04',
        name:'Shore Theme IV',
        nameKey: "dungeon.types.sunlit_shore.blocks.shore_theme_04.name",
        level:+21,
        size:+2,
        depth:+2,
        chest:'normal',
        type:'sunlit-shore',
        bossFloors:mkBoss(12)
      },
      {
        key:'shore_theme_05',
        name:'Shore Theme V',
        nameKey: "dungeon.types.sunlit_shore.blocks.shore_theme_05.name",
        level:+28,
        size:+2,
        depth:+3,
        chest:'less',
        type:'sunlit-shore',
        bossFloors:mkBoss(15)
      },
    ],
    blocks2:[
      {
        key:'shore_core_01',
        name:'Shore Core I',
        nameKey: "dungeon.types.sunlit_shore.blocks.shore_core_01.name",
        level:+0,
        size:+1,
        depth:0,
        chest:'normal',
        type:'sunlit-shore'
      },
      {
        key:'shore_core_02',
        name:'Shore Core II',
        nameKey: "dungeon.types.sunlit_shore.blocks.shore_core_02.name",
        level:+6,
        size:+1,
        depth:+1,
        chest:'more',
        type:'sunlit-shore'
      },
      {
        key:'shore_core_03',
        name:'Shore Core III',
        nameKey: "dungeon.types.sunlit_shore.blocks.shore_core_03.name",
        level:+12,
        size:+2,
        depth:+1,
        chest:'less',
        type:'sunlit-shore'
      },
      {
        key:'shore_core_04',
        name:'Shore Core IV',
        nameKey: "dungeon.types.sunlit_shore.blocks.shore_core_04.name",
        level:+18,
        size:+2,
        depth:+2,
        chest:'normal',
        type:'sunlit-shore'
      },
      {
        key:'shore_core_05',
        name:'Shore Core V',
        nameKey: "dungeon.types.sunlit_shore.blocks.shore_core_05.name",
        level:+24,
        size:+3,
        depth:+2,
        chest:'more',
        type:'sunlit-shore'
      },
    ],
    blocks3:[
      {
        key:'shore_relic_01',
        name:'Shore Relic I',
        nameKey: "dungeon.types.sunlit_shore.blocks.shore_relic_01.name",
        level:+0,
        size:0,
        depth:+2,
        chest:'more',
        type:'sunlit-shore',
        bossFloors:[5]
      },
      {
        key:'shore_relic_02',
        name:'Shore Relic II',
        nameKey: "dungeon.types.sunlit_shore.blocks.shore_relic_02.name",
        level:+9,
        size:+1,
        depth:+2,
        chest:'normal',
        type:'sunlit-shore',
        bossFloors:[10]
      },
      {
        key:'shore_relic_03',
        name:'Shore Relic III',
        nameKey: "dungeon.types.sunlit_shore.blocks.shore_relic_03.name",
        level:+18,
        size:+1,
        depth:+3,
        chest:'less',
        type:'sunlit-shore',
        bossFloors:[15]
      },
      {
        key:'shore_relic_04',
        name:'Shore Relic IV',
        nameKey: "dungeon.types.sunlit_shore.blocks.shore_relic_04.name",
        level:+24,
        size:+2,
        depth:+3,
        chest:'more',
        type:'sunlit-shore',
        bossFloors:[10,15]
      },
      {
        key:'shore_relic_05',
        name:'Shore Relic V',
        nameKey: "dungeon.types.sunlit_shore.blocks.shore_relic_05.name",
        level:+30,
        size:+2,
        depth:+4,
        chest:'normal',
        type:'sunlit-shore',
        bossFloors:[5,10,15]
      },
    ]
  };

  window.registerDungeonAddon({
    id:'shore_pack',
    name:'Sunlit Shore Pack',
    nameKey: "dungeon.packs.shore_pack.name",
    version:'1.0.0',
    blocks,
    generators:[gen]
  });
})();

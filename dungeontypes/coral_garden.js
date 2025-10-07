// Addon: Coral Garden - sunken coral labyrinth with tidal corridors
(function(){
  function algorithm(ctx){
    const { width: W, height: H, map } = ctx;

    const supportsTexture = typeof ctx.setFloorTexture === 'function';
    const isFloor = (x,y) => map[y] && map[y][x] === 0;
    const paintFloor = (x,y,color) => { if(isFloor(x,y)) ctx.setFloorColor(x,y,color); };

    const applyTexture = (x,y,variant) => {
      if(supportsTexture){
        ctx.setFloorTexture(x,y,variant);
        return;
      }
      const palette = variant === 'sea_anemone'
        ? ['#ff8fb1', '#ffb3c6', '#ff7096', '#f85f73']
        : ['#8bd6ff', '#6ac4ff', '#5aa7ff', '#7fd5ff'];
      paintFloor(x,y, palette[Math.floor(ctx.random()*palette.length)]);
      if(ctx.random() < 0.4){
        const swirl = palette[Math.floor(ctx.random()*palette.length)];
        [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy]) => {
          if(ctx.random() < 0.5) paintFloor(x+dx, y+dy, swirl);
        });
      }
    };

    for(let y=0;y<H;y++){
      for(let x=0;x<W;x++){
        const edge = x===0 || y===0 || x===W-1 || y===H-1;
        map[y][x] = edge ? 1 : (ctx.random() < 0.42 ? 1 : 0);
      }
    }

    for(let iter=0; iter<3; iter++){
      const next = map.map(row => row.slice());
      for(let y=1;y<H-1;y++){
        for(let x=1;x<W-1;x++){
          let walls = 0;
          for(let yy=y-1; yy<=y+1; yy++){
            for(let xx=x-1; xx<=x+1; xx++){
              if(xx===x && yy===y) continue;
              if(map[yy][xx] === 1) walls++;
            }
          }
          const threshold = 5 - Math.floor(iter/2);
          next[y][x] = walls >= threshold ? 1 : 0;
        }
      }
      for(let y=1;y<H-1;y++){
        for(let x=1;x<W-1;x++) map[y][x] = next[y][x];
      }
    }

    for(let y=0;y<H;y++){
      for(let x=0;x<W;x++){
        if(map[y][x] === 0){
          const depthFactor = y/H;
          const blue = Math.floor(150 + depthFactor*70);
          const green = Math.floor(120 + depthFactor*60);
          ctx.setFloorColor(x,y,`rgb(${80 + Math.floor(depthFactor*40)}, ${green}, ${blue})`);
          if(ctx.random() < 0.06){
            applyTexture(x,y, ctx.random() < 0.5 ? 'coral_branch' : 'sea_anemone');
          }
        } else {
          const coralHue = 200 + Math.floor(Math.sin(x/2 + y/3)*20);
          ctx.setWallColor(x,y,`rgb(${coralHue}, ${70 + (coralHue % 90)}, ${90 + (coralHue % 80)})`);
        }
      }
    }

    ctx.ensureConnectivity();
  }

  const gen = {
    id: 'coral-garden',
    name: '珊瑚庭園',
    nameKey: "dungeon.types.coral_garden.name",
    description: '潮騒に包まれた珊瑚と海藻の迷路',
    descriptionKey: "dungeon.types.coral_garden.description",
    algorithm,
    mixin: { normalMixed: 0.5, blockDimMixed: 0.5, tags: ['water','reef','undersea'] }
  };

  function boss(depth){
    const res = [];
    if(depth >= 4) res.push(4);
    if(depth >= 8) res.push(8);
    if(depth >= 12) res.push(12);
    if(depth >= 16) res.push(16);
    return res;
  }

  const blocks = {
    blocks1:[
      {
        key:'coral_theme_01',
        name:'Coral Theme I',
        nameKey: "dungeon.types.coral_garden.blocks.coral_theme_01.name",
        level:+0,
        size:0,
        depth:+1,
        chest:'normal',
        type:'coral-garden',
        bossFloors:boss(4)
      },
      {
        key:'coral_theme_02',
        name:'Coral Theme II',
        nameKey: "dungeon.types.coral_garden.blocks.coral_theme_02.name",
        level:+3,
        size:+1,
        depth:+1,
        chest:'less',
        type:'coral-garden',
        bossFloors:boss(6)
      },
      {
        key:'coral_theme_03',
        name:'Coral Theme III',
        nameKey: "dungeon.types.coral_garden.blocks.coral_theme_03.name",
        level:+6,
        size:+1,
        depth:+1,
        chest:'normal',
        type:'coral-garden',
        bossFloors:boss(8)
      },
      {
        key:'coral_theme_04',
        name:'Coral Theme IV',
        nameKey: "dungeon.types.coral_garden.blocks.coral_theme_04.name",
        level:+9,
        size:+1,
        depth:+2,
        chest:'more',
        type:'coral-garden',
        bossFloors:boss(10)
      },
      {
        key:'coral_theme_05',
        name:'Coral Theme V',
        nameKey: "dungeon.types.coral_garden.blocks.coral_theme_05.name",
        level:+12,
        size:+2,
        depth:+2,
        chest:'less',
        type:'coral-garden',
        bossFloors:boss(12)
      },
      {
        key:'coral_theme_06',
        name:'Coral Theme VI',
        nameKey: "dungeon.types.coral_garden.blocks.coral_theme_06.name",
        level:+15,
        size:+2,
        depth:+2,
        chest:'normal',
        type:'coral-garden',
        bossFloors:boss(14)
      },
      {
        key:'coral_theme_07',
        name:'Coral Theme VII',
        nameKey: "dungeon.types.coral_garden.blocks.coral_theme_07.name",
        level:+18,
        size:+2,
        depth:+3,
        chest:'more',
        type:'coral-garden',
        bossFloors:boss(16)
      }
    ],
    blocks2:[
      {
        key:'coral_core_01',
        name:'Coral Core I',
        nameKey: "dungeon.types.coral_garden.blocks.coral_core_01.name",
        level:+0,
        size:+1,
        depth:0,
        chest:'normal',
        type:'coral-garden'
      },
      {
        key:'coral_core_02',
        name:'Coral Core II',
        nameKey: "dungeon.types.coral_garden.blocks.coral_core_02.name",
        level:+4,
        size:+1,
        depth:+1,
        chest:'more',
        type:'coral-garden'
      },
      {
        key:'coral_core_03',
        name:'Coral Core III',
        nameKey: "dungeon.types.coral_garden.blocks.coral_core_03.name",
        level:+8,
        size:+1,
        depth:+1,
        chest:'less',
        type:'coral-garden'
      },
      {
        key:'coral_core_04',
        name:'Coral Core IV',
        nameKey: "dungeon.types.coral_garden.blocks.coral_core_04.name",
        level:+12,
        size:+1,
        depth:+2,
        chest:'normal',
        type:'coral-garden'
      },
      {
        key:'coral_core_05',
        name:'Coral Core V',
        nameKey: "dungeon.types.coral_garden.blocks.coral_core_05.name",
        level:+16,
        size:+2,
        depth:+2,
        chest:'more',
        type:'coral-garden'
      },
      {
        key:'coral_core_06',
        name:'Coral Core VI',
        nameKey: "dungeon.types.coral_garden.blocks.coral_core_06.name",
        level:+20,
        size:+2,
        depth:+3,
        chest:'less',
        type:'coral-garden'
      },
      {
        key:'coral_core_07',
        name:'Coral Core VII',
        nameKey: "dungeon.types.coral_garden.blocks.coral_core_07.name",
        level:+24,
        size:+3,
        depth:+3,
        chest:'normal',
        type:'coral-garden'
      }
    ],
    blocks3:[
      {
        key:'coral_relic_01',
        name:'Coral Relic I',
        nameKey: "dungeon.types.coral_garden.blocks.coral_relic_01.name",
        level:+0,
        size:0,
        depth:+2,
        chest:'more',
        type:'coral-garden',
        bossFloors:[4]
      },
      {
        key:'coral_relic_02',
        name:'Coral Relic II',
        nameKey: "dungeon.types.coral_garden.blocks.coral_relic_02.name",
        level:+5,
        size:+1,
        depth:+2,
        chest:'normal',
        type:'coral-garden',
        bossFloors:[8]
      },
      {
        key:'coral_relic_03',
        name:'Coral Relic III',
        nameKey: "dungeon.types.coral_garden.blocks.coral_relic_03.name",
        level:+10,
        size:+1,
        depth:+3,
        chest:'less',
        type:'coral-garden',
        bossFloors:[12]
      },
      {
        key:'coral_relic_04',
        name:'Coral Relic IV',
        nameKey: "dungeon.types.coral_garden.blocks.coral_relic_04.name",
        level:+15,
        size:+2,
        depth:+3,
        chest:'normal',
        type:'coral-garden',
        bossFloors:[16]
      },
      {
        key:'coral_relic_05',
        name:'Coral Relic V',
        nameKey: "dungeon.types.coral_garden.blocks.coral_relic_05.name",
        level:+20,
        size:+2,
        depth:+4,
        chest:'more',
        type:'coral-garden',
        bossFloors:[20]
      },
      {
        key:'coral_relic_06',
        name:'Coral Relic VI',
        nameKey: "dungeon.types.coral_garden.blocks.coral_relic_06.name",
        level:+25,
        size:+2,
        depth:+4,
        chest:'less',
        type:'coral-garden',
        bossFloors:[20]
      }
    ]
  };

  window.registerDungeonAddon({
    id:'coral_garden_pack',
    name:'Coral Garden Pack',
    nameKey: "dungeon.packs.coral_garden_pack.name",
    version:'1.0.0',
    blocks,
    generators:[gen]
  });
})();

// Addon: Scorched Desert - sparse obstacles on sun-baked sands
(function(){
  function algorithm(ctx){
    const W=ctx.width, H=ctx.height;
    const map=ctx.map;
    const random=ctx.random;
    const density = Math.max(0.05, 0.18 / Math.sqrt(Math.min(W,H)/20));

    for(let y=1;y<H-1;y++){
      for(let x=1;x<W-1;x++){
        map[y][x] = (random() < density ? 1 : 0);
      }
    }

    // dunes: horizontal streaks of walls
    for(let y=3;y<H-3;y+=6){
      for(let x=2;x<W-2;x++) if(random()<0.4){
        map[y][x] = 1;
        map[y][x+1] = 1;
      }
    }

    for(let y=0;y<H;y++){
      for(let x=0;x<W;x++){
        if(map[y][x] === 1){
          ctx.setWallColor(x,y,'#d9a066');
        } else {
          ctx.setFloorColor(x,y,'#f5d491');
        }
      }
    }

    ctx.ensureConnectivity();
  }

  const gen = {
    id: 'scorched-desert',
    name: '砂漠',
    nameKey: "dungeon.types.scorched_desert.name",
    description: '照りつける砂と風紋が続く砂漠地帯',
    descriptionKey: "dungeon.types.scorched_desert.description",
    algorithm,
    mixin: { normalMixed: 0.45, blockDimMixed: 0.5, tags: ['field','desert'] }
  };

  function mkBoss(depth){ const r=[]; if(depth>=5) r.push(5); if(depth>=10) r.push(10); if(depth>=15) r.push(15); return r; }
  const blocks = {
    blocks1:[
      {
        key:'desert_theme_01',
        name:'Desert Theme I',
        nameKey: "dungeon.types.scorched_desert.blocks.desert_theme_01.name",
        level:+0,
        size:0,
        depth:+1,
        chest:'normal',
        type:'scorched-desert',
        bossFloors:mkBoss(6)
      },
      {
        key:'desert_theme_02',
        name:'Desert Theme II',
        nameKey: "dungeon.types.scorched_desert.blocks.desert_theme_02.name",
        level:+7,
        size:+1,
        depth:+1,
        chest:'less',
        type:'scorched-desert',
        bossFloors:mkBoss(8)
      },
      {
        key:'desert_theme_03',
        name:'Desert Theme III',
        nameKey: "dungeon.types.scorched_desert.blocks.desert_theme_03.name",
        level:+14,
        size:+1,
        depth:+2,
        chest:'more',
        type:'scorched-desert',
        bossFloors:mkBoss(10)
      },
      {
        key:'desert_theme_04',
        name:'Desert Theme IV',
        nameKey: "dungeon.types.scorched_desert.blocks.desert_theme_04.name",
        level:+21,
        size:+2,
        depth:+2,
        chest:'normal',
        type:'scorched-desert',
        bossFloors:mkBoss(12)
      },
      {
        key:'desert_theme_05',
        name:'Desert Theme V',
        nameKey: "dungeon.types.scorched_desert.blocks.desert_theme_05.name",
        level:+28,
        size:+2,
        depth:+3,
        chest:'less',
        type:'scorched-desert',
        bossFloors:mkBoss(15)
      },
    ],
    blocks2:[
      {
        key:'desert_core_01',
        name:'Desert Core I',
        nameKey: "dungeon.types.scorched_desert.blocks.desert_core_01.name",
        level:+0,
        size:+1,
        depth:0,
        chest:'normal',
        type:'scorched-desert'
      },
      {
        key:'desert_core_02',
        name:'Desert Core II',
        nameKey: "dungeon.types.scorched_desert.blocks.desert_core_02.name",
        level:+6,
        size:+1,
        depth:+1,
        chest:'more',
        type:'scorched-desert'
      },
      {
        key:'desert_core_03',
        name:'Desert Core III',
        nameKey: "dungeon.types.scorched_desert.blocks.desert_core_03.name",
        level:+12,
        size:+2,
        depth:+1,
        chest:'less',
        type:'scorched-desert'
      },
      {
        key:'desert_core_04',
        name:'Desert Core IV',
        nameKey: "dungeon.types.scorched_desert.blocks.desert_core_04.name",
        level:+18,
        size:+2,
        depth:+2,
        chest:'normal',
        type:'scorched-desert'
      },
      {
        key:'desert_core_05',
        name:'Desert Core V',
        nameKey: "dungeon.types.scorched_desert.blocks.desert_core_05.name",
        level:+24,
        size:+3,
        depth:+2,
        chest:'more',
        type:'scorched-desert'
      },
    ],
    blocks3:[
      {
        key:'desert_relic_01',
        name:'Desert Relic I',
        nameKey: "dungeon.types.scorched_desert.blocks.desert_relic_01.name",
        level:+0,
        size:0,
        depth:+2,
        chest:'more',
        type:'scorched-desert',
        bossFloors:[5]
      },
      {
        key:'desert_relic_02',
        name:'Desert Relic II',
        nameKey: "dungeon.types.scorched_desert.blocks.desert_relic_02.name",
        level:+9,
        size:+1,
        depth:+2,
        chest:'normal',
        type:'scorched-desert',
        bossFloors:[10]
      },
      {
        key:'desert_relic_03',
        name:'Desert Relic III',
        nameKey: "dungeon.types.scorched_desert.blocks.desert_relic_03.name",
        level:+18,
        size:+1,
        depth:+3,
        chest:'less',
        type:'scorched-desert',
        bossFloors:[15]
      },
      {
        key:'desert_relic_04',
        name:'Desert Relic IV',
        nameKey: "dungeon.types.scorched_desert.blocks.desert_relic_04.name",
        level:+24,
        size:+2,
        depth:+3,
        chest:'more',
        type:'scorched-desert',
        bossFloors:[10,15]
      },
      {
        key:'desert_relic_05',
        name:'Desert Relic V',
        nameKey: "dungeon.types.scorched_desert.blocks.desert_relic_05.name",
        level:+30,
        size:+2,
        depth:+4,
        chest:'normal',
        type:'scorched-desert',
        bossFloors:[5,10,15]
      },
    ]
  };

  window.registerDungeonAddon({
    id:'desert_pack',
    name:'Scorched Desert Pack',
    nameKey: "dungeon.packs.desert_pack.name",
    version:'1.0.0',
    blocks,
    generators:[gen]
  });
})();

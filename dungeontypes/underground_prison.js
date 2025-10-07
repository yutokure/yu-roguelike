// Addon: Underground Prison - orderly corridors with side cells
(function(){
  function carveCorridor(ctx, y, height, color){
    const W = ctx.width;
    for(let yy = y; yy < y + height; yy++){
      for(let x = 2; x < W-2; x++) if(ctx.inBounds(x, yy)){
        ctx.set(x, yy, 0);
        ctx.setFloorColor(x, yy, color);
      }
    }
  }
  function carveRoom(ctx, x, y, w, h, color){
    for(let yy = y; yy < y + h; yy++){
      for(let xx = x; xx < x + w; xx++) if(ctx.inBounds(xx, yy)){
        ctx.set(xx, yy, 0);
        ctx.setFloorColor(xx, yy, color);
      }
    }
  }
  function algorithm(ctx){
    const W = ctx.width, H = ctx.height;
    const random = ctx.random;
    const corridorColor = '#cfd2d7';
    const roomColor = '#dee2e6';

    const corridorSpacing = 6;
    const corridorHeight = 2;
    for(let y = 3; y < H-3; y += corridorSpacing){
      carveCorridor(ctx, y, corridorHeight, corridorColor);

      for(let x = 4; x < W-6; x += 8){
        const roomWidth = 4 + Math.floor(random()*3);
        const roomHeight = 3 + Math.floor(random()*2);
        carveRoom(ctx, x, y - roomHeight, roomWidth, roomHeight, roomColor);
        carveRoom(ctx, x, y + corridorHeight, roomWidth, roomHeight, roomColor);
      }
    }

    // Vertical spine corridors
    for(let x = 4; x < W-4; x += 10){
      for(let y = 2; y < H-2; y++) if(ctx.inBounds(x, y)){
        ctx.set(x, y, 0);
        ctx.setFloorColor(x, y, corridorColor);
      }
    }

    // Color remaining walls as dark steel
    for(let y=0;y<H;y++){
      for(let x=0;x<W;x++){
        if(ctx.get(x,y) === 1){
          ctx.setWallColor(x,y,'#495057');
        }
      }
    }

    ctx.ensureConnectivity();
  }

  const gen = {
    id: 'underground-prison',
    name: '地下牢',
    nameKey: "dungeon.types.underground_prison.name",
    description: '広い回廊と規則正しい牢房が並ぶ地下監獄',
    descriptionKey: "dungeon.types.underground_prison.description",
    dark: true,
    algorithm,
    mixin: { normalMixed: 0.4, blockDimMixed: 0.45, tags: ['structured','rooms'] }
  };

  function mkBoss(depth){ const r=[]; if(depth>=5) r.push(5); if(depth>=10) r.push(10); if(depth>=15) r.push(15); return r; }
  const blocks = {
    blocks1:[
      {
        key:'prison_theme_01',
        name:'Prison Theme I',
        nameKey: "dungeon.types.underground_prison.blocks.prison_theme_01.name",
        level:+0,
        size:0,
        depth:+1,
        chest:'normal',
        type:'underground-prison',
        bossFloors:mkBoss(6)
      },
      {
        key:'prison_theme_02',
        name:'Prison Theme II',
        nameKey: "dungeon.types.underground_prison.blocks.prison_theme_02.name",
        level:+7,
        size:+1,
        depth:+1,
        chest:'less',
        type:'underground-prison',
        bossFloors:mkBoss(8)
      },
      {
        key:'prison_theme_03',
        name:'Prison Theme III',
        nameKey: "dungeon.types.underground_prison.blocks.prison_theme_03.name",
        level:+14,
        size:+1,
        depth:+2,
        chest:'more',
        type:'underground-prison',
        bossFloors:mkBoss(10)
      },
      {
        key:'prison_theme_04',
        name:'Prison Theme IV',
        nameKey: "dungeon.types.underground_prison.blocks.prison_theme_04.name",
        level:+21,
        size:+2,
        depth:+2,
        chest:'normal',
        type:'underground-prison',
        bossFloors:mkBoss(12)
      },
      {
        key:'prison_theme_05',
        name:'Prison Theme V',
        nameKey: "dungeon.types.underground_prison.blocks.prison_theme_05.name",
        level:+28,
        size:+2,
        depth:+3,
        chest:'less',
        type:'underground-prison',
        bossFloors:mkBoss(15)
      },
    ],
    blocks2:[
      {
        key:'prison_core_01',
        name:'Prison Core I',
        nameKey: "dungeon.types.underground_prison.blocks.prison_core_01.name",
        level:+0,
        size:+1,
        depth:0,
        chest:'normal',
        type:'underground-prison'
      },
      {
        key:'prison_core_02',
        name:'Prison Core II',
        nameKey: "dungeon.types.underground_prison.blocks.prison_core_02.name",
        level:+6,
        size:+1,
        depth:+1,
        chest:'more',
        type:'underground-prison'
      },
      {
        key:'prison_core_03',
        name:'Prison Core III',
        nameKey: "dungeon.types.underground_prison.blocks.prison_core_03.name",
        level:+12,
        size:+2,
        depth:+1,
        chest:'less',
        type:'underground-prison'
      },
      {
        key:'prison_core_04',
        name:'Prison Core IV',
        nameKey: "dungeon.types.underground_prison.blocks.prison_core_04.name",
        level:+18,
        size:+2,
        depth:+2,
        chest:'normal',
        type:'underground-prison'
      },
      {
        key:'prison_core_05',
        name:'Prison Core V',
        nameKey: "dungeon.types.underground_prison.blocks.prison_core_05.name",
        level:+24,
        size:+3,
        depth:+2,
        chest:'more',
        type:'underground-prison'
      },
    ],
    blocks3:[
      {
        key:'prison_relic_01',
        name:'Prison Relic I',
        nameKey: "dungeon.types.underground_prison.blocks.prison_relic_01.name",
        level:+0,
        size:0,
        depth:+2,
        chest:'more',
        type:'underground-prison',
        bossFloors:[5]
      },
      {
        key:'prison_relic_02',
        name:'Prison Relic II',
        nameKey: "dungeon.types.underground_prison.blocks.prison_relic_02.name",
        level:+9,
        size:+1,
        depth:+2,
        chest:'normal',
        type:'underground-prison',
        bossFloors:[10]
      },
      {
        key:'prison_relic_03',
        name:'Prison Relic III',
        nameKey: "dungeon.types.underground_prison.blocks.prison_relic_03.name",
        level:+18,
        size:+1,
        depth:+3,
        chest:'less',
        type:'underground-prison',
        bossFloors:[15]
      },
      {
        key:'prison_relic_04',
        name:'Prison Relic IV',
        nameKey: "dungeon.types.underground_prison.blocks.prison_relic_04.name",
        level:+24,
        size:+2,
        depth:+3,
        chest:'more',
        type:'underground-prison',
        bossFloors:[10,15]
      },
      {
        key:'prison_relic_05',
        name:'Prison Relic V',
        nameKey: "dungeon.types.underground_prison.blocks.prison_relic_05.name",
        level:+30,
        size:+2,
        depth:+4,
        chest:'normal',
        type:'underground-prison',
        bossFloors:[5,10,15]
      },
    ]
  };

  window.registerDungeonAddon({
    id:'prison_pack',
    name:'Underground Prison Pack',
    nameKey: "dungeon.packs.prison_pack.name",
    version:'1.0.0',
    blocks,
    generators:[gen]
  });
})();

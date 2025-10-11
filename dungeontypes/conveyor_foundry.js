// Addon: Conveyor Foundry - dense workshops filled with moving belts
(function(){
  function carveFactory(ctx){
    const {
      width: W,
      height: H,
      set,
      setFloorType,
      setFloorColor,
      setWallColor,
      ensureConnectivity,
      inBounds,
      random
    } = ctx;

    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        set(x, y, 0);
        setFloorColor(x, y, '#555b6e');
      }
    }

    for (let row = 2; row < H - 2; row += 3) {
      const dir = (Math.floor(row / 3) % 2 === 0) ? 'right' : 'left';
      for (let x = 2; x < W - 2; x++) {
        if (x % 6 === 0) continue;
        setFloorType(x, row, { type: 'conveyor', direction: dir });
        setFloorColor(x, row, dir === 'right' ? '#ffd43b' : '#fab005');
      }
    }

    for (let col = 3; col < W - 3; col += 6) {
      const dir = (Math.floor(col / 6) % 2 === 0) ? 'down' : 'up';
      for (let y = 2; y < H - 2; y++) {
        if (y % 5 === 0) continue;
        setFloorType(col, y, { type: 'conveyor', direction: dir });
        setFloorColor(col, y, '#ffe066');
      }
    }

    for (let x = 2; x < W - 2; x += 6) {
      for (let y = 1; y < H - 1; y++) {
        setFloorType(x, y, 'normal');
        setFloorColor(x, y, '#adb5bd');
      }
    }

    for (let y = 3; y < H - 3; y += 5) {
      for (let x = 3; x < W - 3; x += 7) {
        if (random() < 0.55) {
          for (let dy = 0; dy < 2; dy++) {
            for (let dx = 0; dx < 2; dx++) {
              const tx = x + dx;
              const ty = y + dy;
              if (!inBounds(tx, ty)) continue;
              set(tx, ty, 1);
              setWallColor(tx, ty, '#3f3f3f');
            }
          }
        }
      }
    }

    ensureConnectivity();
  }

  const generator = {
    id: 'conveyor-foundry',
    name: 'コンベヤー鋳造所',
    nameKey: "dungeon.types.conveyor_foundry.name",
    description: '流れるベルトと狭い作業路が入り組む機械工場跡',
    descriptionKey: "dungeon.types.conveyor_foundry.description",
    recommendedLevel: 45,
    algorithm: carveFactory,
    mixin: { normalMixed: 0.35, blockDimMixed: 0.45, tags: ['mechanical', 'hazard'] }
  };

  const blocks = {
    blocks1: [
      {
        key: 'conveyor_foundry_a',
        name: '鋳造ライン',
        nameKey: "dungeon.types.conveyor_foundry.blocks.conveyor_foundry_a.name",
        level: +8,
        size: 0,
        depth: +1,
        chest: 'normal',
        type: 'conveyor-foundry'
      },
      {
        key: 'conveyor_foundry_b',
        name: '搬入区画',
        nameKey: "dungeon.types.conveyor_foundry.blocks.conveyor_foundry_b.name",
        level: +16,
        size: +1,
        depth: +2,
        chest: 'less',
        type: 'conveyor-foundry'
      },
      {
        key: 'conveyor_foundry_c',
        name: '歯車整備室',
        nameKey: "dungeon.types.conveyor_foundry.blocks.conveyor_foundry_c.name",
        level: +20,
        size: +1,
        depth: +2,
        chest: 'normal',
        type: 'conveyor-foundry'
      },
      {
        key: 'conveyor_foundry_d',
        name: '試験炉通路',
        nameKey: "dungeon.types.conveyor_foundry.blocks.conveyor_foundry_d.name",
        level: +24,
        size: +2,
        depth: +3,
        chest: 'more',
        type: 'conveyor-foundry'
      }
    ],
    blocks2: [
      {
        key: 'conveyor_foundry_core',
        name: '中枢制御室',
        nameKey: "dungeon.types.conveyor_foundry.blocks.conveyor_foundry_core.name",
        level: +24,
        size: +1,
        depth: +2,
        chest: 'more',
        type: 'conveyor-foundry'
      },
      {
        key: 'conveyor_foundry_press',
        name: '油圧プレス区画',
        nameKey: "dungeon.types.conveyor_foundry.blocks.conveyor_foundry_press.name",
        level: +28,
        size: +1,
        depth: +2,
        chest: 'rich',
        type: 'conveyor-foundry'
      },
      {
        key: 'conveyor_foundry_smelter',
        name: '連続溶解炉',
        nameKey: "dungeon.types.conveyor_foundry.blocks.conveyor_foundry_smelter.name",
        level: +30,
        size: +2,
        depth: +3,
        chest: 'rich',
        type: 'conveyor-foundry'
      },
      {
        key: 'conveyor_foundry_dispatch',
        name: '出荷ヤード',
        nameKey: "dungeon.types.conveyor_foundry.blocks.conveyor_foundry_dispatch.name",
        level: +32,
        size: +2,
        depth: +3,
        chest: 'rare',
        type: 'conveyor-foundry'
      }
    ],
    blocks3: [
      {
        key: 'conveyor_foundry_boss',
        name: '炉心プラットフォーム',
        nameKey: "dungeon.types.conveyor_foundry.blocks.conveyor_foundry_boss.name",
        level: +32,
        size: +2,
        depth: +3,
        chest: 'rich',
        type: 'conveyor-foundry',
        bossFloors: [6, 12]
      },
      {
        key: 'conveyor_foundry_overseer',
        name: '監督塔制御盤',
        nameKey: "dungeon.types.conveyor_foundry.blocks.conveyor_foundry_overseer.name",
        level: +36,
        size: +2,
        depth: +3,
        chest: 'rich',
        type: 'conveyor-foundry',
        bossFloors: [9, 15]
      },
      {
        key: 'conveyor_foundry_vault',
        name: '資材保管庫',
        nameKey: "dungeon.types.conveyor_foundry.blocks.conveyor_foundry_vault.name",
        level: +40,
        size: +3,
        depth: +4,
        chest: 'rare',
        type: 'conveyor-foundry',
        bossFloors: [12]
      },
      {
        key: 'conveyor_foundry_reactor',
        name: '炉心反応層',
        nameKey: "dungeon.types.conveyor_foundry.blocks.conveyor_foundry_reactor.name",
        level: +44,
        size: +3,
        depth: +4,
        chest: 'legendary',
        type: 'conveyor-foundry',
        bossFloors: [18]
      }
    ]
  };

  window.registerDungeonAddon({
    id: 'conveyor_foundry_pack',
    name: 'Conveyor Foundry Pack',
    nameKey: "dungeon.packs.conveyor_foundry_pack.name",
    version: '1.0.0',
    generators: [generator],
    blocks
  });
})();

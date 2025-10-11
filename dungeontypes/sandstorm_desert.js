// Addon: Sandstorm Dunes - windswept desert canyons with low visibility
(function(){
  function algorithm(ctx){
    const { width: W, height: H, random, set, inBounds, ensureConnectivity, setFloorColor, setWallColor } = ctx;

    // Gradient background for dunes
    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        set(x, y, 1);
        const t = y / H;
        const tone = Math.floor(200 + t * 30);
        const hex = tone.toString(16).padStart(2, '0');
        setWallColor(x, y, `#${hex}c68a`);
      }
    }

    // Carve meandering wadi corridors
    const carve = (sx, sy, len, biasY) => {
      let x = sx, y = sy;
      for (let i = 0; i < len; i++) {
        if (!inBounds(x, y)) break;
        set(x, y, 0);
        setFloorColor(x, y, '#fbbb74');
        const dirRoll = random();
        if (dirRoll < 0.35) x += 1;
        else if (dirRoll < 0.7) x -= 1;
        else y += biasY;
        x = Math.max(1, Math.min(W - 2, x));
        y = Math.max(1, Math.min(H - 2, y));
      }
    };

    const riverCount = Math.max(2, Math.floor(W / 12));
    for (let r = 0; r < riverCount; r++) {
      const startX = 2 + Math.floor(random() * (W - 4));
      carve(startX, 1 + Math.floor(random() * 3), H + Math.floor(random() * H), 1);
    }

    // Scatter pillars and oasis pockets
    for (let i = 0; i < Math.max(6, Math.floor((W * H) / 160)); i++) {
      const x = 2 + Math.floor(random() * (W - 4));
      const y = 2 + Math.floor(random() * (H - 4));
      if (random() < 0.15) {
        // Oasis
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx, ny = y + dy;
            if (!inBounds(nx, ny)) continue;
            set(nx, ny, 0);
            setFloorColor(nx, ny, '#81e6d9');
          }
        }
      } else {
        set(x, y, 1);
        setWallColor(x, y, '#d4a373');
      }
    }

    ensureConnectivity();
  }

  const gen = {
    id: 'sandstorm-dunes',
    name: '砂嵐の砂漠',
    nameKey: "dungeon.types.sandstorm_dunes.name",
    description: '砂嵐で視界が閉ざされた灼熱の砂漠地帯',
    descriptionKey: "dungeon.types.sandstorm_dunes.description",
    dark: true,
    algorithm,
    mixin: { normalMixed: 0.3, blockDimMixed: 0.4, tags: ['field','desert','dark'] }
  };

  function mkBoss(depth) {
    const r = [];
    if (depth >= 5) r.push(5);
    if (depth >= 9) r.push(9);
    if (depth >= 13) r.push(13);
    return r;
  }

  const blocks = {
    blocks1: [
      {
        key:'sandstorm_theme_01',
        name:'Sandstorm Theme I',
        nameKey: "dungeon.types.sandstorm_dunes.blocks.sandstorm_theme_01.name",
        level:+0,
        size:0,
        depth:+1,
        chest:'less',
        type:'sandstorm-dunes',
        bossFloors:mkBoss(6)
      },
      {
        key:'sandstorm_theme_02',
        name:'Sandstorm Theme II',
        nameKey: "dungeon.types.sandstorm_dunes.blocks.sandstorm_theme_02.name",
        level:+12,
        size:+1,
        depth:+2,
        chest:'normal',
        type:'sandstorm-dunes',
        bossFloors:mkBoss(10)
      },
      {
        key:'sandstorm_theme_03',
        name:'Sandstorm Theme III',
        nameKey: "dungeon.types.sandstorm_dunes.blocks.sandstorm_theme_03.name",
        level:+16,
        size:+1,
        depth:+2,
        chest:'normal',
        type:'sandstorm-dunes',
        bossFloors:mkBoss(12)
      },
      {
        key:'sandstorm_theme_04',
        name:'Sandstorm Theme IV',
        nameKey: "dungeon.types.sandstorm_dunes.blocks.sandstorm_theme_04.name",
        level:+20,
        size:+2,
        depth:+3,
        chest:'more',
        type:'sandstorm-dunes',
        bossFloors:mkBoss(14)
      }
    ],
    blocks2: [
      {
        key:'sandstorm_core_01',
        name:'Dune Core',
        nameKey: "dungeon.types.sandstorm_dunes.blocks.sandstorm_core_01.name",
        level:+0,
        size:+1,
        depth:0,
        chest:'normal',
        type:'sandstorm-dunes'
      },
      {
        key:'sandstorm_core_02',
        name:'Mirage Nexus',
        nameKey: "dungeon.types.sandstorm_dunes.blocks.sandstorm_core_02.name",
        level:+8,
        size:+1,
        depth:+1,
        chest:'more',
        type:'sandstorm-dunes'
      },
      {
        key:'sandstorm_core_03',
        name:'Shifting Basin',
        nameKey: "dungeon.types.sandstorm_dunes.blocks.sandstorm_core_03.name",
        level:+14,
        size:+2,
        depth:+2,
        chest:'rich',
        type:'sandstorm-dunes'
      },
      {
        key:'sandstorm_core_04',
        name:'Storm Shelter',
        nameKey: "dungeon.types.sandstorm_dunes.blocks.sandstorm_core_04.name",
        level:+18,
        size:+2,
        depth:+3,
        chest:'rare',
        type:'sandstorm-dunes'
      }
    ],
    blocks3: [
      {
        key:'sandstorm_relic_01',
        name:'Storm Eye Relic',
        nameKey: "dungeon.types.sandstorm_dunes.blocks.sandstorm_relic_01.name",
        level:+18,
        size:+1,
        depth:+3,
        chest:'more',
        type:'sandstorm-dunes',
        bossFloors:[9,13]
      },
      {
        key:'sandstorm_relic_02',
        name:'Dune Oracle',
        nameKey: "dungeon.types.sandstorm_dunes.blocks.sandstorm_relic_02.name",
        level:+22,
        size:+2,
        depth:+3,
        chest:'rich',
        type:'sandstorm-dunes',
        bossFloors:[11,15]
      },
      {
        key:'sandstorm_relic_03',
        name:'Oasis Vault',
        nameKey: "dungeon.types.sandstorm_dunes.blocks.sandstorm_relic_03.name",
        level:+26,
        size:+2,
        depth:+4,
        chest:'rare',
        type:'sandstorm-dunes',
        bossFloors:[13,17]
      },
      {
        key:'sandstorm_relic_04',
        name:'Golden Tempest',
        nameKey: "dungeon.types.sandstorm_dunes.blocks.sandstorm_relic_04.name",
        level:+30,
        size:+3,
        depth:+4,
        chest:'legendary',
        type:'sandstorm-dunes',
        bossFloors:[20]
      }
    ]
  };

  window.registerDungeonAddon({
    id:'sandstorm_dunes_pack',
    name:'Sandstorm Dunes Pack',
    nameKey: "dungeon.packs.sandstorm_dunes_pack.name",
    version:'1.0.0',
    blocks,
    generators:[gen]
  });
})();

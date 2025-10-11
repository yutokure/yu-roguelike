// Addon: Irradiated Plains - windswept plains soaked with toxic fallout
(function(){
  function algorithm(ctx){
    const { width: W, height: H, random, set, inBounds, ensureConnectivity, setFloorColor, setFloorType, setWallColor } = ctx;

    // Start as open field
    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        set(x, y, 0);
        setFloorColor(x, y, '#cbd5f5');
      }
    }

    // Scatter ruined pillars
    const ruinCount = Math.max(8, Math.floor((W + H) / 3));
    for (let i = 0; i < ruinCount; i++) {
      const x = 2 + Math.floor(random() * (W - 4));
      const y = 2 + Math.floor(random() * (H - 4));
      set(x, y, 1);
      setWallColor(x, y, '#64748b');
    }

    // Create radiation hotspots
    const hotspotCount = Math.max(4, Math.floor((W * H) / 150));
    for (let i = 0; i < hotspotCount; i++) {
      const radius = 2 + Math.floor(random() * 3);
      const cx = 2 + Math.floor(random() * (W - 4));
      const cy = 2 + Math.floor(random() * (H - 4));
      for (let y = cy - radius; y <= cy + radius; y++) {
        for (let x = cx - radius; x <= cx + radius; x++) {
          const dx = x - cx;
          const dy = y - cy;
          if (!inBounds(x, y)) continue;
          if (dx * dx + dy * dy > radius * radius) continue;
          set(x, y, 0);
          setFloorType(x, y, 'poison');
          setFloorColor(x, y, '#84cc16');
        }
      }
    }

    // Fallout drift strips
    const strips = Math.max(3, Math.floor(W / 10));
    for (let s = 0; s < strips; s++) {
      const x = 1 + Math.floor(random() * (W - 2));
      for (let y = 1; y < H - 1; y++) {
        if (random() < 0.35) {
          setFloorType(x, y, 'poison');
          setFloorColor(x, y, '#a3e635');
        }
      }
    }

    ensureConnectivity();
  }

  const gen = {
    id: 'irradiated-plains',
    name: '放射線の平原',
    nameKey: "dungeon.types.irradiated_plains.name",
    description: '毒霧に侵された危険な平原地帯',
    descriptionKey: "dungeon.types.irradiated_plains.description",
    poisonFog: true,
    algorithm,
    mixin: { normalMixed: 0.5, blockDimMixed: 0.6, tags: ['field','poison'] }
  };

  function mkBoss(depth) {
    const r = [];
    if (depth >= 6) r.push(6);
    if (depth >= 12) r.push(12);
    return r;
  }

  const blocks = {
    blocks1: [
      {
        key:'irradiated_theme_01',
        name:'Fallout Plains I',
        nameKey: "dungeon.types.irradiated_plains.blocks.irradiated_theme_01.name",
        level:+0,
        size:0,
        depth:+1,
        chest:'normal',
        type:'irradiated-plains',
        bossFloors:mkBoss(8)
      },
      {
        key:'irradiated_theme_02',
        name:'Fallout Plains II',
        nameKey: "dungeon.types.irradiated_plains.blocks.irradiated_theme_02.name",
        level:+14,
        size:+1,
        depth:+2,
        chest:'less',
        type:'irradiated-plains',
        bossFloors:mkBoss(12)
      },
      {
        key:'irradiated_theme_03',
        name:'Fallout Plains III',
        nameKey: "dungeon.types.irradiated_plains.blocks.irradiated_theme_03.name",
        level:+18,
        size:+1,
        depth:+2,
        chest:'normal',
        type:'irradiated-plains',
        bossFloors:mkBoss(14)
      },
      {
        key:'irradiated_theme_04',
        name:'Fallout Plains IV',
        nameKey: "dungeon.types.irradiated_plains.blocks.irradiated_theme_04.name",
        level:+22,
        size:+2,
        depth:+3,
        chest:'more',
        type:'irradiated-plains',
        bossFloors:mkBoss(16)
      }
    ],
    blocks2: [
      {
        key:'irradiated_core_01',
        name:'Core Fallout',
        nameKey: "dungeon.types.irradiated_plains.blocks.irradiated_core_01.name",
        level:+8,
        size:+1,
        depth:+1,
        chest:'normal',
        type:'irradiated-plains'
      },
      {
        key:'irradiated_core_02',
        name:'Toxic Heart',
        nameKey: "dungeon.types.irradiated_plains.blocks.irradiated_core_02.name",
        level:+16,
        size:+1,
        depth:+2,
        chest:'more',
        type:'irradiated-plains'
      },
      {
        key:'irradiated_core_03',
        name:'Fission Ward',
        nameKey: "dungeon.types.irradiated_plains.blocks.irradiated_core_03.name",
        level:+20,
        size:+2,
        depth:+2,
        chest:'rich',
        type:'irradiated-plains'
      },
      {
        key:'irradiated_core_04',
        name:'Glow Hub',
        nameKey: "dungeon.types.irradiated_plains.blocks.irradiated_core_04.name",
        level:+24,
        size:+2,
        depth:+3,
        chest:'rare',
        type:'irradiated-plains'
      }
    ],
    blocks3: [
      {
        key:'irradiated_relic_01',
        name:'Radiant Relic',
        nameKey: "dungeon.types.irradiated_plains.blocks.irradiated_relic_01.name",
        level:+18,
        size:+2,
        depth:+3,
        chest:'more',
        type:'irradiated-plains',
        bossFloors:[6,12]
      },
      {
        key:'irradiated_relic_02',
        name:'Core Containment',
        nameKey: "dungeon.types.irradiated_plains.blocks.irradiated_relic_02.name",
        level:+24,
        size:+2,
        depth:+3,
        chest:'rich',
        type:'irradiated-plains',
        bossFloors:[9,15]
      },
      {
        key:'irradiated_relic_03',
        name:'Fallout Vault',
        nameKey: "dungeon.types.irradiated_plains.blocks.irradiated_relic_03.name",
        level:+28,
        size:+3,
        depth:+4,
        chest:'rare',
        type:'irradiated-plains',
        bossFloors:[12,18]
      },
      {
        key:'irradiated_relic_04',
        name:'Gamma Sanctum',
        nameKey: "dungeon.types.irradiated_plains.blocks.irradiated_relic_04.name",
        level:+32,
        size:+3,
        depth:+4,
        chest:'legendary',
        type:'irradiated-plains',
        bossFloors:[20]
      }
    ]
  };

  window.registerDungeonAddon({
    id:'irradiated_plains_pack',
    name:'Irradiated Plains Pack',
    nameKey: "dungeon.packs.irradiated_plains_pack.name",
    version:'1.0.0',
    blocks,
    generators:[gen]
  });
})();

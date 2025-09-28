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
    description: '毒霧に侵された危険な平原地帯',
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
      { key:'irradiated_theme_01', name:'Fallout Plains I', level:+0,  size:0,  depth:+1, chest:'normal', type:'irradiated-plains', bossFloors:mkBoss(8) },
      { key:'irradiated_theme_02', name:'Fallout Plains II', level:+14, size:+1, depth:+2, chest:'less',   type:'irradiated-plains', bossFloors:mkBoss(12) }
    ],
    blocks2: [
      { key:'irradiated_core_01', name:'Core Fallout', level:+8, size:+1, depth:+1, chest:'normal', type:'irradiated-plains' }
    ],
    blocks3: [
      { key:'irradiated_relic_01', name:'Radiant Relic', level:+18, size:+2, depth:+3, chest:'more', type:'irradiated-plains', bossFloors:[6,12] }
    ]
  };

  window.registerDungeonAddon({ id:'irradiated_plains_pack', name:'Irradiated Plains Pack', version:'1.0.0', blocks, generators:[gen] });
})();

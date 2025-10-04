(function(){
  const ADDON_ID = 'noise_interference_pack';
  const ADDON_NAME = 'Interference Noise Expansion Pack';
  const VERSION = '1.0.0';

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function createSignalAlgorithm(options) {
    const density = clamp(options.density ?? 0.56, 0.3, 0.78);
    const corridorFactor = clamp(options.corridorFactor ?? 0.12, 0.04, 0.3);
    const branchChance = clamp(options.branchChance ?? 0.28, 0.05, 0.6);
    const stripePeriod = Math.max(2, Math.floor(options.stripePeriod ?? 5));
    const stripeSlopeX = options.stripeSlopeX ?? 1;
    const stripeSlopeY = options.stripeSlopeY ?? 2;
    const accentChance = clamp(options.accentChance ?? 0.22, 0, 1);
    const palette = options.palette || {};

    return function(ctx) {
      const W = ctx.width;
      const H = ctx.height;
      const map = ctx.map;
      const rng = typeof ctx.random === 'function' ? ctx.random.bind(ctx) : Math.random;

      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          map[y][x] = 1;
        }
      }

      const carve = (x, y) => {
        if (x <= 0 || y <= 0 || x >= W - 1 || y >= H - 1) return;
        map[y][x] = 0;
      };

      const cx = Math.floor(W / 2);
      const cy = Math.floor(H / 2);
      for (let yy = cy - 1; yy <= cy + 1; yy++) {
        for (let xx = cx - 1; xx <= cx + 1; xx++) carve(xx, yy);
      }

      for (let y = 1; y < H - 1; y++) {
        for (let x = 1; x < W - 1; x++) {
          if (rng() < density) carve(x, y);
        }
      }

      const iterations = Math.max(1, Math.floor((W + H) * corridorFactor));
      for (let i = 0; i < iterations; i++) {
        let x = 1 + Math.floor(rng() * (W - 2));
        let y = 1 + Math.floor(rng() * (H - 2));
        let dirX = rng() < 0.5 ? (rng() < 0.5 ? 1 : -1) : 0;
        let dirY = dirX === 0 ? (rng() < 0.5 ? 1 : -1) : 0;
        const length = Math.max(6, Math.floor((Math.max(W, H) * 0.35) + rng() * (Math.max(W, H) * 0.25)));
        for (let step = 0; step < length; step++) {
          if (x <= 0 || y <= 0 || x >= W - 1 || y >= H - 1) break;
          carve(x, y);
          if (rng() < branchChance) {
            let bx = x;
            let by = y;
            const branchDirX = dirY;
            const branchDirY = -dirX;
            const branchLen = 2 + Math.floor(rng() * 5);
            for (let b = 0; b < branchLen; b++) {
              bx += branchDirX;
              by += branchDirY;
              if (bx <= 0 || by <= 0 || bx >= W - 1 || by >= H - 1) break;
              carve(bx, by);
            }
          }
          x += dirX;
          y += dirY;
          if (rng() < 0.14) {
            dirX = rng() < 0.5 ? (rng() < 0.5 ? 1 : -1) : 0;
            dirY = dirX === 0 ? (rng() < 0.5 ? 1 : -1) : 0;
          }
        }
      }

      ctx.ensureConnectivity();

      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          if (map[y][x] === 0) {
            const pattern = Math.abs((x * stripeSlopeX) + (y * stripeSlopeY)) % stripePeriod;
            const accent = pattern === 0 || rng() < accentChance;
            const color = accent ? (palette.accent || palette.floor || '#60a5fa') : (palette.floor || '#1e293b');
            ctx.setFloorColor(x, y, color);
          } else if (palette.wall) {
            ctx.setWallColor(x, y, palette.wall);
          }
        }
      }
    };
  }

  const generatorConfigs = [
    {
      id: 'sealed-radio-den',
      name: '電波の閉ざされた密室',
      description: '遮断された鋼壁と微かな警告灯が点滅する、閉ざされた通信遮断エリア。',
      dark: true,
      noise: true,
      palette: { floor: '#3b5bdb', accent: '#b6ccff', wall: '#0f172a' },
      density: 0.6,
      corridorFactor: 0.14,
      branchChance: 0.3,
      stripePeriod: 5,
      stripeSlopeX: 2,
      stripeSlopeY: 3,
      accentChance: 0.18,
      levelOffset: 0,
      baseDepth: 2,
      tags: ['facility', 'sealed']
    },
    {
      id: 'phantasmagoric-woods',
      name: '幻妖の森',
      description: '幻光のツタが絡み合い、霧の奥からノイズ混じりの囁きが響く幽玄の森域。',
      dark: true,
      noise: true,
      palette: { floor: '#3f6212', accent: '#bef264', wall: '#111827' },
      density: 0.58,
      corridorFactor: 0.1,
      branchChance: 0.32,
      stripePeriod: 6,
      stripeSlopeX: 1,
      stripeSlopeY: 2,
      accentChance: 0.26,
      levelOffset: 6,
      baseDepth: 2,
      tags: ['forest', 'phantasm']
    },
    {
      id: 'ultra-secure-base',
      name: '超機密基地',
      description: '多重遮蔽された制御区画。乱れた干渉波が監視網を走査している。',
      dark: false,
      noise: true,
      palette: { floor: '#1f2937', accent: '#38bdf8', wall: '#0b1120' },
      density: 0.54,
      corridorFactor: 0.16,
      branchChance: 0.24,
      stripePeriod: 4,
      stripeSlopeX: 3,
      stripeSlopeY: 1,
      accentChance: 0.2,
      levelOffset: 12,
      baseDepth: 3,
      tags: ['facility', 'signal']
    },
    {
      id: 'echo-control-sector',
      name: '残響制御区画',
      description: '電磁反響を閉じ込める層が幾重にも並ぶ、計測用の調整セクター。',
      dark: false,
      noise: true,
      palette: { floor: '#4f46e5', accent: '#c4b5fd', wall: '#1e1b4b' },
      density: 0.57,
      corridorFactor: 0.11,
      branchChance: 0.34,
      stripePeriod: 6,
      stripeSlopeX: 2,
      stripeSlopeY: 4,
      accentChance: 0.24,
      levelOffset: 20,
      baseDepth: 3,
      tags: ['laboratory', 'signal']
    },
    {
      id: 'phantom-circuit-grove',
      name: '幻影回路庭園',
      description: '生体回路が発光し、虚像の枝葉が交錯する電磁庭園。暗闇に潜む音が錯綜する。',
      dark: true,
      noise: true,
      palette: { floor: '#14532d', accent: '#5eead4', wall: '#042f2e' },
      density: 0.61,
      corridorFactor: 0.13,
      branchChance: 0.3,
      stripePeriod: 5,
      stripeSlopeX: 2,
      stripeSlopeY: 3,
      accentChance: 0.28,
      levelOffset: 28,
      baseDepth: 4,
      tags: ['organic', 'circuit']
    },
    {
      id: 'quantum-barrier-command',
      name: '量子障壁司令塔',
      description: '量子障壁発生装置が林立する司令塔。干渉波の縞模様が空間を歪ませる。',
      dark: false,
      noise: true,
      palette: { floor: '#155e75', accent: '#bae6fd', wall: '#082f49' },
      density: 0.52,
      corridorFactor: 0.15,
      branchChance: 0.22,
      stripePeriod: 4,
      stripeSlopeX: 1,
      stripeSlopeY: 3,
      accentChance: 0.2,
      levelOffset: 36,
      baseDepth: 4,
      tags: ['facility', 'quantum']
    },
    {
      id: 'starmist-signal-hall',
      name: '星霧交信の間',
      description: '星霧が舞い、失われた星間通信が残響する聖堂。暗闇を彩るノイズが波打つ。',
      dark: true,
      noise: true,
      palette: { floor: '#4338ca', accent: '#f472b6', wall: '#1e1b4b' },
      density: 0.59,
      corridorFactor: 0.12,
      branchChance: 0.31,
      stripePeriod: 6,
      stripeSlopeX: 3,
      stripeSlopeY: 2,
      accentChance: 0.25,
      levelOffset: 44,
      baseDepth: 5,
      tags: ['astral', 'temple']
    },
    {
      id: 'rupture-wave-reservoir',
      name: '断絶波動集積庫',
      description: '隔離されたエネルギー庫。断絶波動が積層し、赤熱した配管が軋む。',
      dark: false,
      noise: true,
      palette: { floor: '#7c2d12', accent: '#fbbf24', wall: '#2f0f0f' },
      density: 0.55,
      corridorFactor: 0.17,
      branchChance: 0.27,
      stripePeriod: 5,
      stripeSlopeX: 2,
      stripeSlopeY: 1,
      accentChance: 0.22,
      levelOffset: 52,
      baseDepth: 5,
      tags: ['industrial', 'energy']
    }
  ];

  const generators = generatorConfigs.map(cfg => ({
    id: cfg.id,
    name: cfg.name,
    description: cfg.description,
    dark: !!cfg.dark,
    noise: true,
    algorithm: createSignalAlgorithm(cfg),
    mixin: {
      normalMixed: cfg.normalMixed ?? 0.38,
      blockDimMixed: cfg.blockDimMixed ?? 0.52,
      tags: Array.isArray(cfg.tags) ? cfg.tags.slice() : ['anomaly']
    },
    meta: cfg.palette ? { floorColor: cfg.palette.floor, wallColor: cfg.palette.wall } : undefined
  }));

  const blocks = { blocks1: [], blocks2: [], blocks3: [] };
  generatorConfigs.forEach((cfg, index) => {
    const baseLevel = cfg.levelOffset ?? index * 6;
    const baseDepth = cfg.baseDepth ?? 2;
    const baseSize = cfg.baseSize ?? 0;
    const bossFloors = Array.isArray(cfg.bossFloors)
      ? cfg.bossFloors.slice()
      : [5, 10, 15];

    const themeBoss = bossFloors.filter(n => n <= baseDepth * 3);
    const blockTheme = {
      key: `${cfg.id}_theme_${index + 1}`,
      name: `${cfg.name}・外殻`,
      level: baseLevel,
      size: baseSize,
      depth: baseDepth,
      chest: cfg.chest1 || 'normal',
      type: cfg.id
    };
    if (themeBoss.length) blockTheme.bossFloors = themeBoss;
    blocks.blocks1.push(blockTheme);

    blocks.blocks2.push({
      key: `${cfg.id}_core_${index + 1}`,
      name: `${cfg.name}・中枢`,
      level: baseLevel + 6,
      size: baseSize + 1,
      depth: baseDepth + 1,
      chest: cfg.chest2 || (index % 2 === 0 ? 'more' : 'less'),
      type: cfg.id
    });

    const relicBoss = bossFloors.filter(n => n <= (cfg.maxDepth ?? 15));
    const blockRelic = {
      key: `${cfg.id}_relic_${index + 1}`,
      name: `${cfg.name}・信号核`,
      level: baseLevel + 12,
      size: baseSize + 1,
      depth: baseDepth + 2,
      chest: cfg.chest3 || 'normal',
      type: cfg.id
    };
    if (relicBoss.length) blockRelic.bossFloors = relicBoss;
    blocks.blocks3.push(blockRelic);
  });

  window.registerDungeonAddon({ id: ADDON_ID, name: ADDON_NAME, version: VERSION, blocks, generators });
})();

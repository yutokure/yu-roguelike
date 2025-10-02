// Addon: Natural Roadways Pack - generates meadow and forest road dungeons
(function(){
  const COLORS = {
    meadow: '#a6e072',
    tree: '#2f6b2f',
    deepTree: '#224b24',
    flower: '#f6a4c8',
    dirt: '#a8744d'
  };
  const GRASS_SHADOW = '#6da83f';
  const GRASS_HIGHLIGHT = '#c8f59b';
  const TREE_SHADOW = '#1f3b1d';
  const TREE_HIGHLIGHT = '#4a9a4a';
  const DEEP_TREE_SHADOW = '#142713';
  const DEEP_TREE_HIGHLIGHT = '#3f8a3f';
  const ROAD_SHADOW = '#7c5433';
  const ROAD_HIGHLIGHT = '#c98c57';

  function clamp(value, min, max){
    return value < min ? min : (value > max ? max : value);
  }

  function hexToRgb(hex){
    const normalized = (hex || '').toString().trim().replace(/^#/, '');
    const value = normalized.length === 3
      ? normalized.split('').map(ch => ch + ch).join('')
      : normalized.padEnd(6, '0');
    return {
      r: parseInt(value.slice(0,2), 16) || 0,
      g: parseInt(value.slice(2,4), 16) || 0,
      b: parseInt(value.slice(4,6), 16) || 0
    };
  }

  function rgbToHex(rgb){
    const toHex = (v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0');
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  }

  function lerpColor(a, b, t){
    const ca = hexToRgb(a);
    const cb = hexToRgb(b);
    return rgbToHex({
      r: ca.r + (cb.r - ca.r) * t,
      g: ca.g + (cb.g - ca.g) * t,
      b: ca.b + (cb.b - ca.b) * t
    });
  }

  function adjustColor(base, shadow, highlight, amount){
    const clamped = clamp(amount, -1, 1);
    if(clamped >= 0){
      return lerpColor(base, highlight, clamped);
    }
    return lerpColor(base, shadow, -clamped);
  }

  function pseudoRandom(x, y, seed){
    const s = Math.sin((x * 12.9898 + y * 78.233 + (seed || 0) * 37.719) * 43758.5453);
    return s - Math.floor(s);
  }

  function createRoadAlgorithm(options){
    return function(ctx){
      const W = ctx.width;
      const H = ctx.height;
      const map = ctx.map;
      const random = ctx.random;
      const keyFor = (x, y) => `${x},${y}`;
      const roadTiles = new Set();
      const flowerTiles = new Set();
      const treeColors = new Map();

      function randomRange(min, max){
        if(max == null) return min;
        if(max < min) [min, max] = [max, min];
        if(max === min) return min;
        return min + random() * (max - min);
      }

      function ensureTreeColor(x, y){
        const key = keyFor(x, y);
        if(treeColors.has(key)){
          return treeColors.get(key);
        }
        const base = options.deepForest ? COLORS.deepTree : COLORS.tree;
        const shadow = options.deepForest ? DEEP_TREE_SHADOW : TREE_SHADOW;
        const highlight = options.deepForest ? DEEP_TREE_HIGHLIGHT : TREE_HIGHLIGHT;
        const variation = options.treeVariation || 0;
        const noise = pseudoRandom(x, y, 2) * 2 - 1;
        const color = adjustColor(base, shadow, highlight, noise * variation);
        treeColors.set(key, color);
        return color;
      }

      function addTree(x, y){
        if(x <= 0 || y <= 0 || x >= W - 1 || y >= H - 1) return;
        const key = keyFor(x, y);
        if(roadTiles.has(key)) return;
        map[y][x] = 1;
        ensureTreeColor(x, y);
      }

      function carveCircle(cx, cy, radius, kind){
        const r = Math.max(1, Math.ceil(radius));
        const rSq = radius * radius;
        for(let dy = -r; dy <= r; dy++){
          for(let dx = -r; dx <= r; dx++){
            const nx = cx + dx;
            const ny = cy + dy;
            if(nx <= 0 || ny <= 0 || nx >= W - 1 || ny >= H - 1) continue;
            if(dx * dx + dy * dy > rSq) continue;
            const key = keyFor(nx, ny);
            map[ny][nx] = 0;
            if(kind === 'road'){
              roadTiles.add(key);
            }
          }
        }
      }

      function carveBranch(startX, startY){
        const branchRange = options.branchLength || [4, 8];
        const branchRadius = options.branchRadius != null ? options.branchRadius : Math.max(1, (options.roadRadius || 1.4) - 0.4);
        const branchTurnChance = options.branchTurnChance != null ? options.branchTurnChance : 0.45;
        const branchShoulderChance = options.branchShoulderChance || 0;
        const length = Math.round(randomRange(branchRange[0], branchRange[1]));
        let bx = startX;
        let by = startY;
        const dir = random() < 0.5 ? -1 : 1;
        for(let i = 0; i < length; i++){
          by += dir;
          if(by <= 1 || by >= H - 2) break;
          if(random() < branchTurnChance){
            bx += random() < 0.5 ? -1 : 1;
          }
          bx = clamp(bx, 1, W - 2);
          carveCircle(bx, by, branchRadius, 'road');
          if(branchShoulderChance && random() < branchShoulderChance){
            carveCircle(bx, by, branchRadius + 1, 'grass');
          }
        }
      }

      function isNearRoad(x, y){
        for(let oy = -1; oy <= 1; oy++){
          for(let ox = -1; ox <= 1; ox++){
            if(ox === 0 && oy === 0) continue;
            const nx = x + ox;
            const ny = y + oy;
            if(nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
            if(roadTiles.has(keyFor(nx, ny))){
              return true;
            }
          }
        }
        return false;
      }

      const baseFill = options.baseFill === 1 ? 1 : 0;
      for(let y = 0; y < H; y++){
        for(let x = 0; x < W; x++){
          if(x === 0 || y === 0 || x === W - 1 || y === H - 1){
            map[y][x] = 1;
          } else {
            map[y][x] = baseFill;
          }
        }
      }

      const startRange = options.startRatio || [0.45, 0.55];
      let currentY = clamp(Math.round(H * randomRange(startRange[0], startRange[1])), 2, H - 3);
      const wave = options.wave || {};
      const waveFrequency = wave.frequency || 0;
      const waveAmp = wave.amplitude != null ? wave.amplitude : (wave.amplitudeRatio ? wave.amplitudeRatio * H : 0);
      const wavePhase = random() * Math.PI * 2;
      const roadRadius = options.roadRadius || 1.4;
      const shoulderChance = options.shoulderChance || 0;
      for(let x = 1; x < W - 1; x++){
        if(waveAmp){
          const targetY = clamp(Math.round(H / 2 + Math.sin(wavePhase + x * waveFrequency) * waveAmp), 2, H - 3);
          currentY = Math.round(currentY * 0.65 + targetY * 0.35);
        }
        if(options.turnChance && random() < options.turnChance){
          currentY += random() < 0.5 ? -1 : 1;
        }
        if(options.turnBigChance && random() < options.turnBigChance){
          currentY += random() < 0.5 ? -2 : 2;
        }
        currentY = clamp(currentY, 2, H - 3);
        carveCircle(x, currentY, roadRadius, 'road');
        if(shoulderChance && random() < shoulderChance){
          carveCircle(x, currentY, roadRadius + 1, 'grass');
        }
        if(options.branchChance && random() < options.branchChance){
          carveBranch(x, currentY);
        }
      }

      const vertical = options.verticalRoad;
      if(vertical){
        const vStart = vertical.startRatio || [0.35, 0.65];
        let currentX = clamp(Math.round(W * randomRange(vStart[0], vStart[1])), 2, W - 3);
        const vWave = vertical.wave || {};
        const vFreq = vWave.frequency || 0;
        const vAmp = vWave.amplitude != null ? vWave.amplitude : (vWave.amplitudeRatio ? vWave.amplitudeRatio * W : 0);
        const vPhase = random() * Math.PI * 2;
        const vRadius = vertical.radius != null ? vertical.radius : roadRadius;
        const vShoulder = vertical.shoulderChance || 0;
        const vTurnChance = vertical.turnChance || 0;
        for(let y = 1; y < H - 1; y++){
          if(vAmp){
            const targetX = clamp(Math.round(W / 2 + Math.sin(vPhase + y * vFreq) * vAmp), 2, W - 3);
            currentX = Math.round(currentX * 0.65 + targetX * 0.35);
          }
          if(vTurnChance && random() < vTurnChance){
            currentX += random() < 0.5 ? -1 : 1;
          }
          currentX = clamp(currentX, 2, W - 3);
          carveCircle(currentX, y, vRadius, 'road');
          if(vShoulder && random() < vShoulder){
            carveCircle(currentX, y, vRadius + 1, 'grass');
          }
        }
      }

      const clearingCount = options.clearingCount || 0;
      const clearingRadius = options.clearingRadius || [2.2, 3.6];
      for(let i = 0; i < clearingCount; i++){
        const cx = 2 + Math.floor(random() * (W - 4));
        const cy = 2 + Math.floor(random() * (H - 4));
        const radius = randomRange(clearingRadius[0], clearingRadius[1]);
        carveCircle(cx, cy, radius, 'grass');
      }

      if(options.edgeClearingRadius){
        const radius = options.edgeClearingRadius;
        const r = Math.ceil(radius);
        const rSq = radius * radius;
        const chance = options.edgeClearingChance != null ? options.edgeClearingChance : 0.45;
        for(const key of roadTiles){
          const parts = key.split(',');
          const rx = parseInt(parts[0], 10);
          const ry = parseInt(parts[1], 10);
          for(let dy = -r; dy <= r; dy++){
            for(let dx = -r; dx <= r; dx++){
              if(dx * dx + dy * dy > rSq) continue;
              const nx = rx + dx;
              const ny = ry + dy;
              if(nx <= 0 || ny <= 0 || nx >= W - 1 || ny >= H - 1) continue;
              const nKey = keyFor(nx, ny);
              if(roadTiles.has(nKey)) continue;
              if(map[ny][nx] === 1 && random() < chance){
                map[ny][nx] = 0;
              }
            }
          }
        }
      }

      if(options.backgroundClearingChance){
        const chance = options.backgroundClearingChance;
        for(let y = 1; y < H - 1; y++){
          for(let x = 1; x < W - 1; x++){
            const key = keyFor(x, y);
            if(map[y][x] === 1 && !roadTiles.has(key) && random() < chance){
              map[y][x] = 0;
            }
          }
        }
      }

      const treeClusterCount = options.treeClusterCount || 0;
      const treeClusterRadius = options.treeClusterRadius || [1.5, 2.8];
      const treeClusterFill = options.treeClusterFill != null ? options.treeClusterFill : 0.7;
      for(let i = 0; i < treeClusterCount; i++){
        const cx = 2 + Math.floor(random() * (W - 4));
        const cy = 2 + Math.floor(random() * (H - 4));
        const radius = randomRange(treeClusterRadius[0], treeClusterRadius[1]);
        const r = Math.ceil(radius);
        const rSq = radius * radius;
        for(let dy = -r; dy <= r; dy++){
          for(let dx = -r; dx <= r; dx++){
            if(dx * dx + dy * dy > rSq) continue;
            const nx = cx + dx;
            const ny = cy + dy;
            if(nx <= 0 || ny <= 0 || nx >= W - 1 || ny >= H - 1) continue;
            const key = keyFor(nx, ny);
            if(roadTiles.has(key)) continue;
            if(map[ny][nx] === 0 && random() < treeClusterFill){
              addTree(nx, ny);
            }
          }
        }
      }

      if(options.treeDensity){
        for(let y = 1; y < H - 1; y++){
          for(let x = 1; x < W - 1; x++){
            const key = keyFor(x, y);
            if(map[y][x] === 0 && !roadTiles.has(key) && random() < options.treeDensity){
              addTree(x, y);
            }
          }
        }
      }

      const flowerPatchCount = options.flowerPatchCount || 0;
      const flowerPatchRadius = options.flowerPatchRadius || [1.2, 2.2];
      const flowerPatchDensity = options.flowerPatchDensity != null ? options.flowerPatchDensity : 0.65;
      for(let i = 0; i < flowerPatchCount; i++){
        const cx = 2 + Math.floor(random() * (W - 4));
        const cy = 2 + Math.floor(random() * (H - 4));
        const radius = randomRange(flowerPatchRadius[0], flowerPatchRadius[1]);
        const r = Math.ceil(radius);
        const rSq = radius * radius;
        for(let dy = -r; dy <= r; dy++){
          for(let dx = -r; dx <= r; dx++){
            if(dx * dx + dy * dy > rSq) continue;
            const nx = cx + dx;
            const ny = cy + dy;
            if(nx <= 0 || ny <= 0 || nx >= W - 1 || ny >= H - 1) continue;
            const key = keyFor(nx, ny);
            if(map[ny][nx] === 0 && !roadTiles.has(key) && random() < flowerPatchDensity){
              flowerTiles.add(key);
            }
          }
        }
      }

      if(options.flowerChance){
        const chance = options.flowerChance;
        for(let y = 1; y < H - 1; y++){
          for(let x = 1; x < W - 1; x++){
            const key = keyFor(x, y);
            if(map[y][x] === 0 && !roadTiles.has(key) && !flowerTiles.has(key) && random() < chance){
              flowerTiles.add(key);
            }
          }
        }
      }

      const meadowVariation = options.meadowVariation || 0;
      const roadVariation = options.roadVariation || 0;
      for(let y = 0; y < H; y++){
        for(let x = 0; x < W; x++){
          const key = keyFor(x, y);
          if(map[y][x] === 0){
            let color;
            let type = 'grass';
            if(roadTiles.has(key)){
              const noise = pseudoRandom(x, y, 3) * 2 - 1;
              color = adjustColor(COLORS.dirt, ROAD_SHADOW, ROAD_HIGHLIGHT, noise * roadVariation);
              type = 'road';
            } else if(flowerTiles.has(key)){
              color = COLORS.flower;
            } else {
              const noise = pseudoRandom(x, y, 1) * 2 - 1;
              color = adjustColor(COLORS.meadow, GRASS_SHADOW, GRASS_HIGHLIGHT, noise * meadowVariation);
            }
            ctx.setFloorColor(x, y, color);
            ctx.setFloorType(x, y, type);
          } else {
            const baseColor = ensureTreeColor(x, y);
            let color = baseColor;
            if(options.deepForest && isNearRoad(x, y)){
              color = adjustColor(color, DEEP_TREE_SHADOW, DEEP_TREE_HIGHLIGHT, 0.25);
            }
            ctx.setWallColor(x, y, color);
          }
        }
      }

      ctx.ensureConnectivity();
    };
  }

  const configs = [
    {
      id: 'winding-country-road',
      name: '街道',
      description: '草原を横断する素朴な街道。黄緑の草原に茶色い土の道と花が点在する',
      baseFill: 0,
      roadRadius: 1.6,
      startRatio: [0.42, 0.58],
      wave: { frequency: 0.12, amplitudeRatio: 0.18 },
      turnChance: 0.35,
      turnBigChance: 0.08,
      branchChance: 0.16,
      branchLength: [4, 8],
      branchRadius: 1.25,
      branchTurnChance: 0.5,
      branchShoulderChance: 0.25,
      shoulderChance: 0.45,
      clearingCount: 4,
      clearingRadius: [2.0, 3.2],
      treeClusterCount: 7,
      treeClusterRadius: [1.6, 3.0],
      treeClusterFill: 0.75,
      treeDensity: 0.045,
      flowerPatchCount: 6,
      flowerPatchRadius: [1.2, 2.2],
      flowerPatchDensity: 0.7,
      flowerChance: 0.035,
      meadowVariation: 0.6,
      roadVariation: 0.4,
      treeVariation: 0.45,
      tags: ['road', 'field', 'nature'],
      mixin: { normalMixed: 0.55, blockDimMixed: 0.5, tags: ['road', 'field', 'nature'] }
    },
    {
      id: 'deep-forest-road',
      name: '森の街道',
      description: '深い森を縫う街道。濃い緑の樹木と花が自然に生成される',
      baseFill: 1,
      roadRadius: 1.5,
      startRatio: [0.45, 0.55],
      wave: { frequency: 0.1, amplitudeRatio: 0.14 },
      turnChance: 0.4,
      turnBigChance: 0.12,
      branchChance: 0.22,
      branchLength: [5, 10],
      branchRadius: 1.2,
      branchTurnChance: 0.55,
      branchShoulderChance: 0.3,
      shoulderChance: 0.35,
      verticalRoad: {
        startRatio: [0.35, 0.65],
        wave: { frequency: 0.09, amplitudeRatio: 0.18 },
        turnChance: 0.28,
        radius: 1.25,
        shoulderChance: 0.25
      },
      clearingCount: 8,
      clearingRadius: [2.4, 4.0],
      edgeClearingRadius: 2.4,
      edgeClearingChance: 0.55,
      backgroundClearingChance: 0.06,
      treeClusterCount: 0,
      flowerPatchCount: 4,
      flowerPatchRadius: [1.0, 2.0],
      flowerPatchDensity: 0.55,
      flowerChance: 0.015,
      meadowVariation: 0.5,
      roadVariation: 0.35,
      treeVariation: 0.55,
      deepForest: true,
      tags: ['road', 'forest', 'nature'],
      mixin: { normalMixed: 0.45, blockDimMixed: 0.6, tags: ['road', 'forest', 'nature'] }
    }
  ];

  const generators = configs.map(conf => ({
    id: conf.id,
    name: conf.name,
    description: conf.description,
    algorithm: createRoadAlgorithm(conf),
    mixin: conf.mixin || { normalMixed: 0.5, blockDimMixed: 0.5, tags: conf.tags || ['road', 'nature'] }
  }));

  function mkBoss(depth){
    const floors = [];
    if(depth >= 5) floors.push(5);
    if(depth >= 10) floors.push(10);
    if(depth >= 15) floors.push(15);
    return floors.length ? floors : undefined;
  }

  const blocks = {
    blocks1: [
      { key: 'roadways_country_path', name: '街道探訪', level: +0,  size: 0,  depth: +1, chest: 'normal', type: 'winding-country-road', bossFloors: mkBoss(6) },
      { key: 'roadways_forest_patrol', name: '森の街道探訪', level: +5,  size: +1, depth: +1, chest: 'less',   type: 'deep-forest-road', bossFloors: mkBoss(9) }
    ],
    blocks2: [
      { key: 'roadways_country_route', name: '街道縦走', level: +6,  size: +1, depth: +1, chest: 'more',   type: 'winding-country-road' },
      { key: 'roadways_forest_route',  name: '森の街道縦走', level: +12, size: +1, depth: +2, chest: 'normal', type: 'deep-forest-road' }
    ],
    blocks3: [
      { key: 'roadways_country_relic', name: '街道遺構', level: +10, size: +1, depth: +2, chest: 'normal', type: 'winding-country-road', bossFloors: mkBoss(10) },
      { key: 'roadways_forest_relic',  name: '森の街道遺構', level: +16, size: +2, depth: +3, chest: 'more',   type: 'deep-forest-road', bossFloors: mkBoss(14) }
    ]
  };

  window.registerDungeonAddon({
    id: 'natural_roadways_pack',
    name: 'Natural Roadways Pack',
    version: '1.0.0',
    blocks,
    generators
  });
})();

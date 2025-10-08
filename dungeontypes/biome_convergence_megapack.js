// Addon: Biome Convergence Mega Pack - 15 mixed-biome generation types and 60 blocks
(function(){
  const ADDON_ID = 'biome_convergence_megapack';
  const ADDON_NAME = 'Biome Convergence Mega Pack';
  const VERSION = '1.0.0';

  function sanitizeKey(value){
    return (value || '').toString().trim().replace(/[^a-z0-9]+/gi, '_').toLowerCase();
  }

  function applyTypeLocalization(config){
    const typeKey = sanitizeKey(config.id);
    const localized = Object.assign({}, config);
    localized.nameKey = `dungeon.types.${typeKey}.name`;
    if(config.description){
      localized.descriptionKey = `dungeon.types.${typeKey}.description`;
    }
    return localized;
  }

  function buildBlockEntry(config, data){
    if(!data || !data.key){
      throw new Error('Block entry requires a key');
    }
    const entry = Object.assign({ type: config.id }, data);
    const typeKey = sanitizeKey(config.id);
    entry.nameKey = `dungeon.types.${typeKey}.blocks.${data.key}.name`;
    if(entry.description){
      entry.descriptionKey = `dungeon.types.${typeKey}.blocks.${data.key}.description`;
    }
    return entry;
  }

  function clamp(v, min, max){
    return v < min ? min : (v > max ? max : v);
  }

  function hexToRgb(hex){
    const normalized = (hex || '').toString().trim().replace(/^#/, '');
    if(!/^[0-9a-fA-F]{6}$/.test(normalized)){
      return { r: 0, g: 0, b: 0 };
    }
    return {
      r: parseInt(normalized.slice(0,2), 16),
      g: parseInt(normalized.slice(2,4), 16),
      b: parseInt(normalized.slice(4,6), 16)
    };
  }

  function rgbToHex(rgb){
    const toHex = (value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0');
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  }

  function mixColor(hexA, hexB, ratio){
    const a = hexToRgb(hexA);
    const b = hexToRgb(hexB);
    const t = clamp(ratio == null ? 0.5 : ratio, 0, 1);
    return rgbToHex({
      r: a.r + (b.r - a.r) * t,
      g: a.g + (b.g - a.g) * t,
      b: a.b + (b.b - a.b) * t
    });
  }

  function adjustLightness(hex, delta){
    const rgb = hexToRgb(hex);
    const factor = 1 + delta;
    return rgbToHex({
      r: rgb.r * factor,
      g: rgb.g * factor,
      b: rgb.b * factor
    });
  }

  function fillCircle(ctx, cx, cy, radius, color){
    const setFloorColor = typeof ctx.setFloorColor === 'function' ? ctx.setFloorColor.bind(ctx) : null;
    const r2 = radius * radius;
    for(let y = cy - radius; y <= cy + radius; y++){
      for(let x = cx - radius; x <= cx + radius; x++){
        if(!ctx.inBounds(x, y)) continue;
        const dx = x - cx;
        const dy = y - cy;
        if(dx*dx + dy*dy <= r2){
          ctx.set(x, y, 0);
          if(setFloorColor && color){
            setFloorColor(x, y, color);
          }
        }
      }
    }
  }

  function fallbackCarvePath(ctx, path, width, color){
    const setFloorColor = typeof ctx.setFloorColor === 'function' ? ctx.setFloorColor.bind(ctx) : null;
    const carveRadius = Math.max(0, Math.floor((width || 1) / 2));
    for(const point of path || []){
      fillCircle(ctx, point.x, point.y, carveRadius, color);
      ctx.set(point.x, point.y, 0);
      if(setFloorColor && color){
        setFloorColor(point.x, point.y, color);
      }
    }
  }

  function createMultiBiomeGenerator(config){
    const {
      id,
      name,
      nameKey,
      description,
      descriptionKey,
      tags,
      biomes,
      seedsPerBiome,
      connectors,
      fillRatio,
      jitter,
      baseFrequency,
      secondaryFrequency,
      corridorWidth,
      chaos,
      blendIntensity
    } = config;

    function algorithm(ctx){
      const W = ctx.width;
      const H = ctx.height;
      const random = ctx.random;
      const map = ctx.map;
      const set = ctx.set.bind(ctx);
      const inBounds = ctx.inBounds.bind(ctx);
      const hasFloorColor = typeof ctx.setFloorColor === 'function';
      const setFloorColor = hasFloorColor ? ctx.setFloorColor.bind(ctx) : () => {};
      const hasCarvePath = typeof ctx.carvePath === 'function';
      const carvePath = hasCarvePath ? ctx.carvePath.bind(ctx) : (path, width, color) => fallbackCarvePath(ctx, path, width, color);
      const hasAStar = typeof ctx.aStar === 'function';
      const findPath = (from, to) => {
        if(hasAStar){
          const path = ctx.aStar(from, to, { wallCost: 1.0, floorCost: 0.3 });
          if(path && path.length){
            return path;
          }
        }
        const path = [];
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const steps = Math.max(Math.abs(dx), Math.abs(dy));
        for(let i=0; i<=steps; i++){
          const x = Math.round(from.x + dx * (i/steps));
          const y = Math.round(from.y + dy * (i/steps));
          path.push({ x, y });
        }
        return path;
      };

      const phase = random() * Math.PI * 2;
      const phase2 = random() * Math.PI * 2;
      const seedCount = seedsPerBiome || 3;
      const regionMap = Array.from({ length: H }, () => new Array(W).fill(-1));
      const seeds = [];

      function randomPoint(){
        return {
          x: 2 + Math.floor(random() * Math.max(1, W - 4)),
          y: 2 + Math.floor(random() * Math.max(1, H - 4))
        };
      }

      biomes.forEach((biome) => {
        const count = Math.max(1, biome.seeds || seedCount);
        for(let i=0; i<count; i++){
          const pt = randomPoint();
          seeds.push({
            biome,
            x: pt.x,
            y: pt.y
          });
        }
      });

      const globalFrequency = baseFrequency || 0.07;
      const secondary = secondaryFrequency || 0.035;
      const coverageTarget = Math.floor((W - 2) * (H - 2) * clamp(fillRatio == null ? 0.65 : fillRatio, 0.25, 0.9));
      const carveChaos = chaos == null ? 0.18 : chaos;
      const jitterAmount = jitter == null ? 0.45 : jitter;

      for(let y=1; y<H-1; y++){
        for(let x=1; x<W-1; x++){
          let bestIndex = 0;
          let bestDistance = Infinity;
          for(let i=0; i<seeds.length; i++){
            const seed = seeds[i];
            const dx = x - seed.x;
            const dy = y - seed.y;
            const span = seed.biome.span || 1.0;
            const weight = Math.sqrt(dx*dx + dy*dy) / span + (random() - 0.5) * jitterAmount;
            if(weight < bestDistance){
              bestDistance = weight;
              bestIndex = i;
            }
          }
          regionMap[y][x] = bestIndex;
        }
      }

      let carved = 0;
      const passCount = 2;
      for(let pass=0; pass<passCount; pass++){
        for(let y=1; y<H-1; y++){
          for(let x=1; x<W-1; x++){
            const seedIndex = regionMap[y][x];
            const seed = seeds[seedIndex];
            const biome = seed.biome;
            const openness = biome.openness == null ? 0.5 : biome.openness;
            const roughness = biome.roughness == null ? 1.0 : biome.roughness;
            const meander = biome.meander == null ? 0.6 : biome.meander;

            const freq = globalFrequency * roughness;
            const freq2 = secondary * (1.0 + biome.roughness * 0.5);
            const freq3 = freq * (0.35 + meander * 0.65);

            const noiseA = Math.sin((x + phase) * freq) * 0.4 + Math.cos((y - phase) * freq2) * 0.4;
            const noiseB = Math.sin((x * 0.5 + y * 0.75 + phase2) * freq3) * 0.2;
            const value = 0.5 + noiseA + noiseB;
            const threshold = 0.55 - openness * 0.2 + (random() - 0.5) * carveChaos;

            if(value > threshold){
              if(map[y][x] === 1){
                carved++;
              }
              set(x, y, 0);
              if(hasFloorColor){
                const baseColor = biome.color;
                const accent = biome.accent || mixColor(baseColor, '#ffffff', 0.3);
                const alt = biome.shadow || mixColor(baseColor, '#000000', 0.2);
                const tint = value > threshold + 0.25 ? accent : (value < threshold + 0.05 ? alt : baseColor);
                setFloorColor(x, y, tint);
              }
            }
          }
        }
      }

      const connectorsCount = Math.max(4, connectors || Math.ceil(seeds.length * 0.6));
      for(let i=0; i<connectorsCount; i++){
        const from = seeds[Math.floor(random() * seeds.length)];
        const to = seeds[Math.floor(random() * seeds.length)];
        if(!from || !to || (from.x === to.x && from.y === to.y)) continue;
        const path = findPath({ x: from.x, y: from.y }, { x: to.x, y: to.y });
        const width = Math.max(1, corridorWidth || 2);
        const color = hasFloorColor ? mixColor(from.biome.color, to.biome.color, 0.5) : null;
        carvePath(path, width, color);
      }

      if(carved < coverageTarget){
        const deficit = coverageTarget - carved;
        const attempts = Math.min(deficit * 2, 600);
        for(let attempt=0; attempt<attempts; attempt++){
          const seed = seeds[Math.floor(random() * seeds.length)];
          if(!seed) continue;
          const radius = 1 + Math.floor(random() * clamp(seed.biome.span * 2 + deficit / 400, 2, 6));
          const offsetX = Math.floor((random() - 0.5) * seed.biome.span * 6);
          const offsetY = Math.floor((random() - 0.5) * seed.biome.span * 6);
          fillCircle(ctx, clamp(seed.x + offsetX, 2, W-3), clamp(seed.y + offsetY, 2, H-3), radius, hasFloorColor ? seed.biome.color : null);
        }
      }

      const blending = blendIntensity == null ? 0.45 : blendIntensity;
      if(hasFloorColor && blending > 0){
        for(let y=2; y<H-2; y++){
          for(let x=2; x<W-2; x++){
            if(map[y][x] !== 0) continue;
            const current = regionMap[y][x];
            let mixedColor = null;
            let mixCount = 0;
            for(const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
              const nx = x + dx;
              const ny = y + dy;
              if(!inBounds(nx, ny)) continue;
              if(map[ny][nx] !== 0) continue;
              const neighbor = regionMap[ny][nx];
              if(neighbor !== current){
                const from = seeds[current]?.biome?.color || '#888888';
                const to = seeds[neighbor]?.biome?.color || '#888888';
                mixedColor = mixedColor ? mixColor(mixedColor, mixColor(from, to, 0.5), 0.5) : mixColor(from, to, 0.5);
                mixCount++;
              }
            }
            if(mixCount > 0 && mixedColor){
              const finalColor = mixColor(mixedColor, seeds[current]?.biome?.accent || mixedColor, blending);
              setFloorColor(x, y, finalColor);
            }
          }
        }
      }

      // Secondary smoothing to remove isolated walls
      const temp = map.map(row => row.slice());
      for(let y=1; y<H-1; y++){
        for(let x=1; x<W-1; x++){
          if(map[y][x] === 0) continue;
          let neighborFloors = 0;
          for(const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
            if(map[y+dy][x+dx] === 0) neighborFloors++;
          }
          if(neighborFloors >= 3){
            temp[y][x] = 0;
            if(hasFloorColor){
              const seed = seeds[regionMap[y][x]];
              const color = seed ? adjustLightness(seed.biome.color, 0.1) : '#cccccc';
              setFloorColor(x, y, color);
            }
          }
        }
      }
      for(let y=1; y<H-1; y++){
        for(let x=1; x<W-1; x++){
          map[y][x] = temp[y][x];
        }
      }

      if(typeof ctx.ensureConnectivity === 'function'){
        ctx.ensureConnectivity();
      }
    }

    return {
      id,
      name,
      nameKey,
      description,
      descriptionKey,
      algorithm,
      mixin: {
        normalMixed: 0.75,
        blockDimMixed: 0.82,
        tags: tags || ['biome-mix']
      }
    };
  }

  const MULTI_BIOME_CONFIGS = [
    {
      id: 'aurora-jungle-delta',
      name: '極光密林デルタ',
      shortName: 'Aurora Delta',
      description: '極光ツンドラと密林と湿地が入り混じる大規模デルタ地形。',
      tags: ['aurora','jungle','marsh','water'],
      fillRatio: 0.68,
      seedsPerBiome: 3,
      connectors: 9,
      jitter: 0.38,
      corridorWidth: 2,
      chaos: 0.16,
      blendIntensity: 0.45,
      biomes: [
        { key: 'aurora', color: '#8ec5ff', accent: '#d0ebff', span: 1.1, openness: 0.58, roughness: 0.6, meander: 0.4, seeds: 3 },
        { key: 'jungle', color: '#2f9e44', accent: '#51cf66', span: 0.95, openness: 0.5, roughness: 1.05, meander: 0.8, seeds: 3 },
        { key: 'delta', color: '#5c7cfa', accent: '#c0eb75', span: 1.0, openness: 0.52, roughness: 0.85, meander: 0.7, seeds: 2 }
      ],
      blockTuning: { levelBase: -12, levelStep: 6, depthBase: 1, depthStep: 1 }
    },
    {
      id: 'ember-tide-fissures',
      name: '紅潮裂溝群',
      shortName: 'Ember Tide',
      description: '火山の割れ目と深い海溝が交差する熱水噴出帯。',
      tags: ['lava','ocean','thermal'],
      fillRatio: 0.62,
      seedsPerBiome: 3,
      connectors: 10,
      jitter: 0.42,
      corridorWidth: 3,
      chaos: 0.2,
      blendIntensity: 0.55,
      biomes: [
        { key: 'magma', color: '#ff6b6b', accent: '#ffa8a8', shadow: '#c92a2a', span: 0.9, openness: 0.44, roughness: 1.2, meander: 0.6, seeds: 4 },
        { key: 'abyss', color: '#364fc7', accent: '#748ffc', shadow: '#202b6e', span: 1.15, openness: 0.48, roughness: 0.9, meander: 0.5, seeds: 3 },
        { key: 'reef', color: '#12b886', accent: '#63e6be', span: 1.05, openness: 0.54, roughness: 0.8, meander: 0.7, seeds: 2 }
      ],
      blockTuning: { levelBase: -6, levelStep: 7, depthBase: 2, depthStep: 2 }
    },
    {
      id: 'shifting-dune-forest',
      name: '砂林蜃気楼地帯',
      shortName: 'Mirage Expanse',
      description: '砂漠と針葉樹林と遺跡が交互に現れる蜃気楼地帯。',
      tags: ['desert','forest','ruins'],
      fillRatio: 0.64,
      seedsPerBiome: 3,
      connectors: 8,
      jitter: 0.33,
      corridorWidth: 2,
      chaos: 0.15,
      blendIntensity: 0.4,
      biomes: [
        { key: 'dune', color: '#f08c00', accent: '#ffd43b', shadow: '#ad6800', span: 1.2, openness: 0.6, roughness: 0.7, meander: 0.4, seeds: 3 },
        { key: 'pine', color: '#2b8a3e', accent: '#40c057', span: 0.9, openness: 0.48, roughness: 1.1, meander: 0.85, seeds: 3 },
        { key: 'ruins', color: '#868e96', accent: '#ced4da', span: 1.0, openness: 0.55, roughness: 0.95, meander: 0.6, seeds: 2 }
      ],
      blockTuning: { levelBase: -2, levelStep: 5, depthBase: 1, depthStep: 1 }
    },
    {
      id: 'cinder-frost-warrens',
      name: '熾氷迷宮網',
      shortName: 'Cinder Frost',
      description: '火の洞窟と氷晶洞と地下迷宮が絡み合う極地の巣穴。',
      tags: ['lava','ice','cavern'],
      fillRatio: 0.6,
      seedsPerBiome: 3,
      connectors: 9,
      jitter: 0.37,
      corridorWidth: 2,
      chaos: 0.18,
      blendIntensity: 0.5,
      biomes: [
        { key: 'cinder', color: '#ff922b', accent: '#ffa94d', shadow: '#d9480f', span: 0.95, openness: 0.46, roughness: 1.15, meander: 0.55, seeds: 3 },
        { key: 'frost', color: '#74c0fc', accent: '#a5d8ff', shadow: '#1c7ed6', span: 1.05, openness: 0.52, roughness: 0.9, meander: 0.65, seeds: 3 },
        { key: 'warren', color: '#adb5bd', accent: '#dee2e6', shadow: '#495057', span: 1.1, openness: 0.5, roughness: 0.85, meander: 0.75, seeds: 2 }
      ],
      blockTuning: { levelBase: 4, levelStep: 6, depthBase: 2, depthStep: 2 }
    },
    {
      id: 'lumina-spore-basin',
      name: '燐光胞子盆地',
      shortName: 'Lumina Basin',
      description: '光る茸と湿原の湖沼が交互に沈む盆地群。',
      tags: ['fungus','wetland','glow'],
      fillRatio: 0.7,
      seedsPerBiome: 4,
      connectors: 8,
      jitter: 0.36,
      corridorWidth: 2,
      chaos: 0.14,
      blendIntensity: 0.48,
      biomes: [
        { key: 'lumina', color: '#94d82d', accent: '#c0eb75', span: 1.05, openness: 0.58, roughness: 0.95, meander: 0.8, seeds: 4 },
        { key: 'spore', color: '#be4bdb', accent: '#da77f2', shadow: '#862e9c', span: 0.9, openness: 0.5, roughness: 1.1, meander: 0.75, seeds: 3 },
        { key: 'basin', color: '#339af0', accent: '#74c0fc', span: 1.2, openness: 0.6, roughness: 0.8, meander: 0.55, seeds: 2 }
      ],
      blockTuning: { levelBase: 0, levelStep: 5, depthBase: 1, depthStep: 1 }
    },
    {
      id: 'stormroot-plateaus',
      name: '嵐根段丘',
      shortName: 'Stormroot',
      description: '雷鳴轟く高原に湿地と古樹が根を下ろす段丘群。',
      tags: ['storm','plateau','forest','swamp'],
      fillRatio: 0.63,
      seedsPerBiome: 3,
      connectors: 9,
      jitter: 0.32,
      corridorWidth: 3,
      chaos: 0.17,
      blendIntensity: 0.46,
      biomes: [
        { key: 'storm', color: '#4dabf7', accent: '#74c0fc', shadow: '#1864ab', span: 1.0, openness: 0.5, roughness: 1.05, meander: 0.65, seeds: 3 },
        { key: 'root', color: '#5f3dc4', accent: '#7950f2', span: 0.85, openness: 0.45, roughness: 1.1, meander: 0.8, seeds: 3 },
        { key: 'marsh', color: '#37b24d', accent: '#74c69d', span: 1.2, openness: 0.6, roughness: 0.75, meander: 0.55, seeds: 2 }
      ],
      blockTuning: { levelBase: 6, levelStep: 6, depthBase: 2, depthStep: 2 }
    },
    {
      id: 'gale-coral-highlands',
      name: '風珊瑚高地',
      shortName: 'Gale Coral',
      description: '浮遊する珊瑚礁と風の断崖が連なる高地帯。',
      tags: ['air','coral','cliff'],
      fillRatio: 0.66,
      seedsPerBiome: 3,
      connectors: 8,
      jitter: 0.34,
      corridorWidth: 2,
      chaos: 0.16,
      blendIntensity: 0.44,
      biomes: [
        { key: 'gale', color: '#66d9e8', accent: '#99e9f2', span: 1.1, openness: 0.6, roughness: 0.85, meander: 0.6, seeds: 3 },
        { key: 'coral', color: '#ff8787', accent: '#ffc9c9', span: 0.95, openness: 0.48, roughness: 1.05, meander: 0.7, seeds: 3 },
        { key: 'ridge', color: '#adb5bd', accent: '#ced4da', span: 1.1, openness: 0.52, roughness: 0.9, meander: 0.5, seeds: 2 }
      ],
      blockTuning: { levelBase: 10, levelStep: 5, depthBase: 1, depthStep: 1 }
    },
    {
      id: 'obsidian-bloom-bastion',
      name: '黒耀花壁帯',
      shortName: 'Obsidian Bloom',
      description: '黒曜石の峡谷と花咲く段丘と霧の谷が入り混じる防壁地形。',
      tags: ['volcanic','floral','cliff','fog'],
      fillRatio: 0.67,
      seedsPerBiome: 3,
      connectors: 10,
      jitter: 0.39,
      corridorWidth: 3,
      chaos: 0.19,
      blendIntensity: 0.47,
      biomes: [
        { key: 'obsidian', color: '#212529', accent: '#495057', shadow: '#0b090a', span: 0.9, openness: 0.42, roughness: 1.2, meander: 0.55, seeds: 3 },
        { key: 'bloom', color: '#f06595', accent: '#faa2c1', span: 1.05, openness: 0.54, roughness: 0.9, meander: 0.7, seeds: 3 },
        { key: 'mist', color: '#748ffc', accent: '#bac8ff', span: 1.15, openness: 0.58, roughness: 0.8, meander: 0.6, seeds: 2 }
      ],
      blockTuning: { levelBase: 14, levelStep: 6, depthBase: 2, depthStep: 2 }
    },
    {
      id: 'crystal-mire-depths',
      name: '晶泥深淵',
      shortName: 'Crystal Mire',
      description: '結晶化した湿地と底無しの淵が交差する輝く深層。',
      tags: ['crystal','swamp','abyss'],
      fillRatio: 0.63,
      seedsPerBiome: 4,
      connectors: 8,
      jitter: 0.4,
      corridorWidth: 2,
      chaos: 0.18,
      blendIntensity: 0.52,
      biomes: [
        { key: 'crystal', color: '#9775fa', accent: '#b197fc', span: 0.95, openness: 0.5, roughness: 1.1, meander: 0.7, seeds: 4 },
        { key: 'mire', color: '#5f3d26', accent: '#795738', span: 1.2, openness: 0.55, roughness: 0.8, meander: 0.6, seeds: 3 },
        { key: 'void', color: '#343a40', accent: '#495057', span: 1.05, openness: 0.46, roughness: 1.0, meander: 0.65, seeds: 2 }
      ],
      blockTuning: { levelBase: 12, levelStep: 5, depthBase: 2, depthStep: 2 }
    },
    {
      id: 'verdant-cinder-barrens',
      name: '翠灼荒原',
      shortName: 'Verdant Cinder',
      description: '燃え残る灰原に芽吹く草木と熱風の荒野が共存する。',
      tags: ['ash','rebirth','wind'],
      fillRatio: 0.65,
      seedsPerBiome: 3,
      connectors: 9,
      jitter: 0.35,
      corridorWidth: 2,
      chaos: 0.17,
      blendIntensity: 0.45,
      biomes: [
        { key: 'ash', color: '#868e96', accent: '#adb5bd', span: 1.0, openness: 0.48, roughness: 1.05, meander: 0.6, seeds: 3 },
        { key: 'verdant', color: '#2b8a3e', accent: '#51cf66', span: 1.1, openness: 0.6, roughness: 0.85, meander: 0.7, seeds: 3 },
        { key: 'gust', color: '#74c0fc', accent: '#a5d8ff', span: 0.95, openness: 0.52, roughness: 0.9, meander: 0.5, seeds: 2 }
      ],
      blockTuning: { levelBase: 8, levelStep: 4, depthBase: 1, depthStep: 1 }
    },
    {
      id: 'deepwood-cavernfall',
      name: '深林洞瀑領域',
      shortName: 'Cavernfall',
      description: '巨大な洞窟内に樹海と滝と霧が混在する垂直世界。',
      tags: ['forest','cavern','waterfall'],
      fillRatio: 0.7,
      seedsPerBiome: 4,
      connectors: 11,
      jitter: 0.41,
      corridorWidth: 3,
      chaos: 0.2,
      blendIntensity: 0.5,
      biomes: [
        { key: 'deepwood', color: '#2f9e44', accent: '#51cf66', span: 1.0, openness: 0.55, roughness: 0.95, meander: 0.8, seeds: 4 },
        { key: 'cascade', color: '#4dabf7', accent: '#74c0fc', span: 1.2, openness: 0.6, roughness: 0.75, meander: 0.55, seeds: 3 },
        { key: 'mistcave', color: '#495057', accent: '#868e96', span: 0.9, openness: 0.48, roughness: 1.1, meander: 0.7, seeds: 3 }
      ],
      blockTuning: { levelBase: 16, levelStep: 6, depthBase: 2, depthStep: 2 }
    },
    {
      id: 'arcanum-glasswastes',
      name: '秘術玻璃荒野',
      shortName: 'Glasswastes',
      description: '秘術で融解した砂漠と結晶化した峡谷が広がる荒野。',
      tags: ['arcane','desert','crystal'],
      fillRatio: 0.61,
      seedsPerBiome: 3,
      connectors: 7,
      jitter: 0.3,
      corridorWidth: 2,
      chaos: 0.15,
      blendIntensity: 0.42,
      biomes: [
        { key: 'arcane', color: '#845ef7', accent: '#b197fc', span: 1.05, openness: 0.5, roughness: 1.05, meander: 0.7, seeds: 3 },
        { key: 'glass', color: '#fab005', accent: '#ffd43b', span: 1.15, openness: 0.58, roughness: 0.8, meander: 0.45, seeds: 3 },
        { key: 'waste', color: '#e67700', accent: '#ffa94d', span: 0.9, openness: 0.46, roughness: 1.1, meander: 0.65, seeds: 2 }
      ],
      blockTuning: { levelBase: 18, levelStep: 5, depthBase: 1, depthStep: 1 }
    },
    {
      id: 'twilight-lotus-marsh',
      name: '黄昏蓮湿原',
      shortName: 'Twilight Lotus',
      description: '夕暮れに染まる蓮池と霞む湿原と影の森が交錯する。',
      tags: ['twilight','marsh','lotus'],
      fillRatio: 0.68,
      seedsPerBiome: 4,
      connectors: 8,
      jitter: 0.37,
      corridorWidth: 2,
      chaos: 0.14,
      blendIntensity: 0.49,
      biomes: [
        { key: 'twilight', color: '#ff922b', accent: '#ffc078', span: 1.0, openness: 0.56, roughness: 0.9, meander: 0.7, seeds: 4 },
        { key: 'lotus', color: '#f783ac', accent: '#ffb6c1', span: 1.1, openness: 0.6, roughness: 0.75, meander: 0.6, seeds: 3 },
        { key: 'shadowwood', color: '#343a40', accent: '#495057', span: 0.9, openness: 0.46, roughness: 1.1, meander: 0.8, seeds: 3 }
      ],
      blockTuning: { levelBase: 2, levelStep: 4, depthBase: 1, depthStep: 1 }
    },
    {
      id: 'stellar-reef-sanctum',
      name: '星珊瑚聖域',
      shortName: 'Stellar Reef',
      description: '星屑のように輝く珊瑚と夜光虫の海底が入り混じる聖域。',
      tags: ['cosmic','reef','abyss'],
      fillRatio: 0.64,
      seedsPerBiome: 3,
      connectors: 9,
      jitter: 0.36,
      corridorWidth: 2,
      chaos: 0.18,
      blendIntensity: 0.5,
      biomes: [
        { key: 'stellar', color: '#fcc419', accent: '#ffe066', span: 1.1, openness: 0.6, roughness: 0.85, meander: 0.55, seeds: 3 },
        { key: 'reef', color: '#12b886', accent: '#63e6be', span: 0.95, openness: 0.5, roughness: 1.05, meander: 0.7, seeds: 3 },
        { key: 'voidsea', color: '#4263eb', accent: '#748ffc', span: 1.0, openness: 0.48, roughness: 0.95, meander: 0.65, seeds: 2 }
      ],
      blockTuning: { levelBase: -4, levelStep: 6, depthBase: 2, depthStep: 2 }
    },
    {
      id: 'ashen-aurora-ridge',
      name: '灰極光稜線',
      shortName: 'Ashen Aurora',
      description: '灰の雪原に極光が差す山脈と蒼い洞窟が混在する稜線。',
      tags: ['tundra','ash','aurora'],
      fillRatio: 0.62,
      seedsPerBiome: 3,
      connectors: 10,
      jitter: 0.38,
      corridorWidth: 3,
      chaos: 0.19,
      blendIntensity: 0.46,
      biomes: [
        { key: 'ashsnow', color: '#adb5bd', accent: '#e9ecef', span: 1.2, openness: 0.6, roughness: 0.8, meander: 0.45, seeds: 3 },
        { key: 'aurora', color: '#91a7ff', accent: '#bac8ff', span: 0.95, openness: 0.52, roughness: 1.05, meander: 0.7, seeds: 3 },
        { key: 'glacier', color: '#3bc9db', accent: '#66d9e8', span: 1.0, openness: 0.5, roughness: 0.9, meander: 0.6, seeds: 2 }
      ],
      blockTuning: { levelBase: 20, levelStep: 5, depthBase: 2, depthStep: 2 }
    },
    {
      id: 'chaos-biome',
      name: 'カオスバイオーム',
      shortName: 'Chaos Biome',
      description: '全てのバイオームが渦巻く極大融合領域。色彩と気候が刻々と変化する混沌空間。',
      tags: ['chaos','all-biomes','mega'],
      fillRatio: 0.72,
      seedsPerBiome: 2,
      connectors: 14,
      jitter: 0.45,
      corridorWidth: 3,
      chaos: 0.28,
      blendIntensity: 0.62,
      biomes: [
        { key: 'aurora', color: '#8ec5ff', accent: '#d0ebff', span: 1.1, openness: 0.58, roughness: 0.65, meander: 0.55, seeds: 2 },
        { key: 'jungle', color: '#2f9e44', accent: '#51cf66', span: 1.0, openness: 0.5, roughness: 1.1, meander: 0.9, seeds: 2 },
        { key: 'magma', color: '#ff6b6b', accent: '#ffa8a8', span: 0.95, openness: 0.42, roughness: 1.25, meander: 0.6, seeds: 2 },
        { key: 'abyss', color: '#364fc7', accent: '#748ffc', span: 1.15, openness: 0.48, roughness: 0.9, meander: 0.5, seeds: 2 },
        { key: 'dune', color: '#f08c00', accent: '#ffd43b', span: 1.2, openness: 0.6, roughness: 0.75, meander: 0.45, seeds: 2 },
        { key: 'frost', color: '#74c0fc', accent: '#a5d8ff', span: 1.05, openness: 0.52, roughness: 0.95, meander: 0.7, seeds: 2 },
        { key: 'spore', color: '#be4bdb', accent: '#da77f2', span: 0.9, openness: 0.5, roughness: 1.15, meander: 0.8, seeds: 2 },
        { key: 'storm', color: '#4dabf7', accent: '#74c0fc', span: 1.0, openness: 0.5, roughness: 1.05, meander: 0.7, seeds: 2 },
        { key: 'reef', color: '#12b886', accent: '#63e6be', span: 1.05, openness: 0.54, roughness: 0.85, meander: 0.7, seeds: 2 },
        { key: 'waste', color: '#e67700', accent: '#ffa94d', span: 0.9, openness: 0.46, roughness: 1.1, meander: 0.65, seeds: 2 },
        { key: 'twilight', color: '#ff922b', accent: '#ffc078', span: 1.0, openness: 0.56, roughness: 0.9, meander: 0.7, seeds: 2 },
        { key: 'voidsea', color: '#4263eb', accent: '#748ffc', span: 1.0, openness: 0.48, roughness: 0.95, meander: 0.65, seeds: 2 },
        { key: 'ashsnow', color: '#adb5bd', accent: '#e9ecef', span: 1.15, openness: 0.58, roughness: 0.82, meander: 0.5, seeds: 2 },
        { key: 'lumina', color: '#94d82d', accent: '#c0eb75', span: 1.1, openness: 0.6, roughness: 0.9, meander: 0.75, seeds: 2 }
      ],
      blockTuning: {
        levelBase: 26,
        levelStep: 6,
        depthBase: 3,
        depthStep: 2,
        sizeBase: 1,
        chestPattern: ['more', 'more', 'more', 'abundant'],
        sizePattern: [1, 1, 2, 3],
        bossSets: {
          early: [6, 7],
          mid: [11, 12],
          late: [16, 17],
          apex: [20]
        }
      }
    }
  ].map(applyTypeLocalization);

  const generators = MULTI_BIOME_CONFIGS.map(createMultiBiomeGenerator);

  const blocks = { blocks1: [], blocks2: [], blocks3: [], blocks4: [] };
  const chestPatternDefault = ['normal', 'more', 'less', 'more'];
  const sizePatternDefault = [-1, 0, +1, +2];
  const bossDefaults = {
    early: [5],
    mid: [5, 10],
    late: [10, 15],
    apex: [15]
  };

  MULTI_BIOME_CONFIGS.forEach((cfg, index) => {
    const tuning = cfg.blockTuning || {};
    const levelBase = tuning.levelBase == null ? index * 4 : tuning.levelBase;
    const levelStep = tuning.levelStep == null ? 5 : tuning.levelStep;
    const depthBase = tuning.depthBase == null ? 0 : tuning.depthBase;
    const depthStep = tuning.depthStep == null ? 1 : tuning.depthStep;
    const sizeBase = tuning.sizeBase == null ? 0 : tuning.sizeBase;
    const chestPattern = tuning.chestPattern || chestPatternDefault;
    const sizePattern = tuning.sizePattern || sizePatternDefault;
    const bossSets = tuning.bossSets || bossDefaults;
    const short = cfg.shortName || cfg.name;
    const keyBase = cfg.id.replace(/[^a-z0-9]+/g, '_');

    const layout = [
      { target: 'blocks1', suffix: 'I', levelOffset: 0,  chest: chestPattern[0] || 'normal', depthOffset: 0,         sizeOffset: sizePattern[0] || 0, boss: bossSets.early },
      { target: 'blocks2', suffix: 'II', levelOffset: 1, chest: chestPattern[1] || 'normal', depthOffset: 1,         sizeOffset: sizePattern[1] || 0, boss: bossSets.mid },
      { target: 'blocks3', suffix: 'III',levelOffset: 2, chest: chestPattern[2] || 'normal', depthOffset: 2,         sizeOffset: sizePattern[2] || 0, boss: bossSets.late },
      { target: 'blocks4', suffix: 'IV', levelOffset: 3, chest: chestPattern[3] || 'normal', depthOffset: 3,         sizeOffset: sizePattern[3] || 0, boss: bossSets.apex }
    ];

    layout.forEach(entry => {
      const level = levelBase + levelStep * entry.levelOffset;
      const depth = depthBase + depthStep * entry.depthOffset;
      const size = clamp(sizeBase + entry.sizeOffset, -2, 3);
      const blockKey = `${keyBase}_${entry.target}_${entry.suffix}`;
      const blockName = `${short} Convergence ${entry.suffix}`;
      const block = buildBlockEntry(cfg, {
        key: blockKey,
        name: blockName,
        level,
        size,
        depth,
        chest: entry.chest
      });
      if(entry.boss && entry.boss.length){
        block.bossFloors = entry.boss.slice();
      }
      blocks[entry.target].push(block);
    });
  });

  window.registerDungeonAddon({
    id: ADDON_ID,
    name: ADDON_NAME,
    nameKey: "dungeon.packs.biome_convergence_megapack.name",
    version: VERSION,
    blocks,
    generators
  });
})();

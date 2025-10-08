// Addon: Skyrim Nordic Legends Pack - inspired by the frozen reaches of Tamriel
(function(){
  const ADDON_ID = 'skyrim_nordic_legends_pack';
  const ADDON_NAME = 'Skyrim Nordic Legends Pack';
  const VERSION = '3.0.0';

  function sanitizeKey(value){
    return (value || '').toString().trim().replace(/[^a-z0-9]+/gi, '_').toLowerCase();
  }

  function clamp(value, min, max){
    return Math.max(min, Math.min(max, value));
  }

  function random(ctx){
    return ctx && typeof ctx.random === 'function' ? ctx.random() : Math.random();
  }

  function lerp(a, b, t){
    return a + (b - a) * t;
  }

  function hexToRgb(hex){
    if (!hex) return [128, 128, 128];
    const normalized = hex.replace('#', '').trim();
    if (/^[0-9a-fA-F]{3}$/.test(normalized)){
      const r = parseInt(normalized[0] + normalized[0], 16);
      const g = parseInt(normalized[1] + normalized[1], 16);
      const b = parseInt(normalized[2] + normalized[2], 16);
      return [r, g, b];
    }
    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return [128, 128, 128];
    return [
      parseInt(normalized.slice(0, 2), 16),
      parseInt(normalized.slice(2, 4), 16),
      parseInt(normalized.slice(4, 6), 16)
    ];
  }

  function rgbToHex(rgb){
    const [r, g, b] = rgb.map((c) => clamp(Math.round(c), 0, 255));
    const toHex = (value) => value.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  function mixColor(a, b, t){
    const rgbA = hexToRgb(a);
    const rgbB = hexToRgb(b);
    const result = [
      lerp(rgbA[0], rgbB[0], t),
      lerp(rgbA[1], rgbB[1], t),
      lerp(rgbA[2], rgbB[2], t)
    ];
    return rgbToHex(result);
  }

  function createZoneMap(width, height, initial = 'wall'){
    return Array.from({ length: height }, () => Array.from({ length: width }, () => initial));
  }

  function carveRectZone(map, zoneMap, x0, y0, x1, y1, zone){
    const minX = Math.max(1, Math.min(Math.floor(x0), Math.floor(x1)));
    const maxX = Math.min(map[0].length - 2, Math.max(Math.floor(x0), Math.floor(x1)));
    const minY = Math.max(1, Math.min(Math.floor(y0), Math.floor(y1)));
    const maxY = Math.min(map.length - 2, Math.max(Math.floor(y0), Math.floor(y1)));
    for (let y = minY; y <= maxY; y++){
      for (let x = minX; x <= maxX; x++){
        map[y][x] = 0;
        zoneMap[y][x] = zone;
      }
    }
  }

  function carveCircleZone(map, zoneMap, cx, cy, radius, zone){
    const r = Math.max(1, Math.floor(radius));
    const r2 = r * r;
    for (let y = cy - r - 1; y <= cy + r + 1; y++){
      for (let x = cx - r - 1; x <= cx + r + 1; x++){
        if (y <= 0 || x <= 0 || y >= map.length - 1 || x >= map[0].length - 1) continue;
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy <= r2){
          map[y][x] = 0;
          zoneMap[y][x] = zone;
        }
      }
    }
  }

  function carveCorridor(map, zoneMap, x0, y0, x1, y1, width, zone){
    const half = Math.max(0, Math.floor(width / 2));
    const steps = Math.max(1, Math.max(Math.abs(Math.floor(x1) - Math.floor(x0)), Math.abs(Math.floor(y1) - Math.floor(y0))));
    for (let i = 0; i <= steps; i++){
      const t = i / steps;
      const x = Math.round(lerp(x0, x1, t));
      const y = Math.round(lerp(y0, y1, t));
      for (let yy = -half; yy <= half; yy++){
        for (let xx = -half; xx <= half; xx++){
          const tx = x + xx;
          const ty = y + yy;
          if (ty <= 0 || tx <= 0 || ty >= map.length - 1 || tx >= map[0].length - 1) continue;
          map[ty][tx] = 0;
          zoneMap[ty][tx] = zone;
        }
      }
    }
  }

  function carveSpiralSanctum(map, zoneMap, cx, cy, radius, zone, ctx){
    let currentRadius = Math.max(3, Math.floor(radius));
    let angle = random(ctx) * Math.PI * 2;
    while (currentRadius > 2){
      const px = Math.round(cx + Math.cos(angle) * currentRadius);
      const py = Math.round(cy + Math.sin(angle) * currentRadius);
      carveCircleZone(map, zoneMap, px, py, Math.max(2, Math.floor(currentRadius * 0.45)), zone);
      angle += Math.PI / 1.8;
      currentRadius -= 2;
    }
    carveCircleZone(map, zoneMap, cx, cy, 2, zone);
  }

  function scatterChambers(map, zoneMap, ctx, options){
    const { count = 5, band = [0.1, 0.9], radius = [2, 5], zones = ['ice_cavern'] } = options || {};
    for (let i = 0; i < count; i++){
      const cx = 2 + Math.floor(random(ctx) * (map[0].length - 4));
      const cy = Math.floor(lerp(map.length * band[0], map.length * band[1], random(ctx)));
      const r = Math.max(2, Math.floor(lerp(radius[0], radius[1], random(ctx))));
      const zone = Array.isArray(zones) ? zones[Math.floor(random(ctx) * zones.length)] : zones;
      carveCircleZone(map, zoneMap, cx, cy, r, zone);
    }
  }

  function layRidgeLoops(map, zoneMap, ctx, options){
    const { count = 2, zone = 'tundra_pass', jitter = 2, thickness = 3 } = options || {};
    for (let i = 0; i < count; i++){
      const y = Math.floor(lerp(map.length * 0.35, map.length * 0.9, (i + 1) / (count + 1)) + (random(ctx) - 0.5) * jitter * 2);
      carveCorridor(map, zoneMap, 2, y, map[0].length - 3, y + (random(ctx) - 0.5) * jitter, thickness, zone);
      if (random(ctx) > 0.6){
        const bendX = Math.floor(map[0].length * (0.35 + random(ctx) * 0.3));
        carveCorridor(map, zoneMap, bendX, y - 2, bendX, Math.min(map.length - 3, y + 6), thickness - 1, zone);
      }
    }
  }

  function carveBarrowField(map, zoneMap, options){
    const { rows = 2, cols = 3, zone = 'nordic_barrow', rect = [0.15, 0.6, 0.85, 0.9] } = options || {};
    const width = map[0].length;
    const height = map.length;
    const left = Math.floor(width * rect[0]);
    const right = Math.floor(width * rect[2]);
    const top = Math.floor(height * rect[1]);
    const bottom = Math.floor(height * rect[3]);
    const cellWidth = Math.max(3, Math.floor((right - left) / cols));
    const cellHeight = Math.max(3, Math.floor((bottom - top) / rows));
    for (let row = 0; row < rows; row++){
      for (let col = 0; col < cols; col++){
        const cx = left + col * cellWidth + Math.floor(cellWidth / 2);
        const cy = top + row * cellHeight + Math.floor(cellHeight / 2);
        carveRectZone(map, zoneMap, cx - Math.floor(cellWidth / 2) + 1, cy - Math.floor(cellHeight / 2) + 1, cx + Math.floor(cellWidth / 2) - 1, cy + Math.floor(cellHeight / 2) - 1, zone);
        carveCircleZone(map, zoneMap, cx, cy, Math.floor(Math.min(cellWidth, cellHeight) / 3), zone);
      }
    }
  }

  function carveWatchPosts(map, zoneMap, ctx, options){
    const { count = 2, zone = 'storm_battlements' } = options || {};
    for (let i = 0; i < count; i++){
      const edge = random(ctx) > 0.5 ? 0.12 : 0.88;
      const cx = Math.floor(map[0].length * lerp(0.1, 0.9, random(ctx)));
      const cy = Math.floor(map.length * edge);
      carveCircleZone(map, zoneMap, cx, cy, 3, zone);
    }
  }

  function carveFissures(map, zoneMap, ctx, options){
    const { count = 4, zone = 'glacial_crevasse' } = options || {};
    for (let i = 0; i < count; i++){
      const x = Math.floor(map[0].length * lerp(0.2, 0.8, random(ctx)));
      const y0 = Math.floor(map.length * lerp(0.45, 0.95, random(ctx)));
      const y1 = Math.floor(map.length * lerp(0.45, 0.95, random(ctx)));
      carveCorridor(map, zoneMap, x, y0, x + Math.floor((random(ctx) - 0.5) * 10), y1, 2, zone);
    }
  }

  function seedShrines(map, zoneMap, ctx, options){
    const { count = 3, zone = 'secluded_shrine' } = options || {};
    for (let i = 0; i < count; i++){
      const cx = Math.floor(map[0].length * lerp(0.15, 0.85, random(ctx)));
      const cy = Math.floor(map.length * lerp(0.25, 0.55, random(ctx)));
      carveRectZone(map, zoneMap, cx - 2, cy - 2, cx + 2, cy + 2, zone);
      carveCircleZone(map, zoneMap, cx, cy, 2, zone);
    }
  }

  function seedHotSprings(map, zoneMap, ctx, options){
    const { count = 3, zone = 'moonlit_grove' } = options || {};
    for (let i = 0; i < count; i++){
      const cx = Math.floor(map[0].length * lerp(0.2, 0.8, random(ctx)));
      const cy = Math.floor(map.length * lerp(0.65, 0.92, random(ctx)));
      carveCircleZone(map, zoneMap, cx, cy, Math.floor(3 + random(ctx) * 3), zone);
    }
  }

  function mutateZones(zoneMap, ctx, fromZone, toZone, chance){
    for (let y = 1; y < zoneMap.length - 1; y++){
      for (let x = 1; x < zoneMap[0].length - 1; x++){
        if (zoneMap[y][x] === fromZone && random(ctx) < chance){
          zoneMap[y][x] = toZone;
        }
      }
    }
  }

  function mixIntoNeighbors(zoneMap, ctx, sourceZone, targetZone, chance){
    for (let y = 1; y < zoneMap.length - 1; y++){
      for (let x = 1; x < zoneMap[0].length - 1; x++){
        if (zoneMap[y][x] !== sourceZone) continue;
        let neighbor = false;
        for (let yy = -1; yy <= 1; yy++){
          for (let xx = -1; xx <= 1; xx++){
            if (!xx && !yy) continue;
            if (zoneMap[y + yy][x + xx] === targetZone) neighbor = true;
          }
        }
        if (neighbor && random(ctx) < chance){
          zoneMap[y][x] = targetZone;
        }
      }
    }
  }

  function paintMap(ctx, zoneMap, palettes){
    const { width: W, height: H, map } = ctx;
    const defaultPalette = palettes.wall;
    for (let y = 0; y < H; y++){
      for (let x = 0; x < W; x++){
        if (map[y][x] === 0){
          const zone = zoneMap[y][x];
          const palette = palettes[zone] || defaultPalette;
          const wave = (Math.sin(x / 3) + Math.cos(y / 4)) * 0.5;
          const rand = random(ctx);
          const mix = clamp(0.25 + rand * 0.35 + wave * 0.1, 0, 1);
          const floorColor = mixColor(palette.floor, palette.alt, mix);
          ctx.setFloorColor(x, y, floorColor);
          if (palette.accent && rand > 0.82){
            ctx.setFloorColor(x, y, mixColor(floorColor, palette.accent, 0.5));
          }
          if (palette.texture && ctx.setFloorTexture){
            if (rand > 0.6){
              ctx.setFloorTexture(x, y, palette.texture);
            }
          }
          if (palette.effect && ctx.setAmbientEffect && rand > 0.9){
            ctx.setAmbientEffect(x, y, palette.effect);
          }
        } else {
          let neighborPalette = defaultPalette;
          for (let yy = -1; yy <= 1; yy++){
            for (let xx = -1; xx <= 1; xx++){
              if (!xx && !yy) continue;
              const nx = x + xx;
              const ny = y + yy;
              if (ny < 0 || nx < 0 || ny >= H || nx >= W) continue;
              if (map[ny][nx] === 0){
                neighborPalette = palettes[zoneMap[ny][nx]] || neighborPalette;
              }
            }
          }
          const shade = 0.2 + Math.abs(Math.sin(x * 0.35) * Math.cos(y * 0.25)) * 0.45;
          const wallColor = mixColor(neighborPalette.wall, '#0b0b0f', shade);
          ctx.setWallColor(x, y, wallColor);
        }
      }
    }
  }

  const basePalettes = {
    wall: { floor: '#2f2f38', alt: '#4d4d56', wall: '#23232a', accent: '#848a9a', effect: null },
    mead_hall: { floor: '#3b2617', alt: '#7a4e2c', wall: '#27160d', accent: '#d79f5b', texture: 'nordic_carpet', effect: 'ember_sparks' },
    skyforge_dais: { floor: '#73502c', alt: '#f2d48b', wall: '#3c2d18', accent: '#ffbe66', texture: 'skyforge_runic', effect: 'forge_glow' },
    tundra_pass: { floor: '#2e4533', alt: '#7da06a', wall: '#1b291e', accent: '#c5dba8', texture: 'frosted_flagstone', effect: 'snow_swirl' },
    ice_cavern: { floor: '#173650', alt: '#6ec5f7', wall: '#0c1c2b', accent: '#bdeaff', texture: 'glacial_crust', effect: 'diamond_dust' },
    glacial_crevasse: { floor: '#0f2438', alt: '#4aa8d8', wall: '#08121f', accent: '#98ecff', texture: 'cracked_ice', effect: 'arctic_drift' },
    dwemer_forge: { floor: '#4d3820', alt: '#c47c2f', wall: '#25160c', accent: '#ffcf70', texture: 'dwemer_plate', effect: 'steam_plume' },
    dwemer_underworks: { floor: '#2f2a26', alt: '#8d7756', wall: '#1a1613', accent: '#d2a264', texture: 'copper_grate', effect: 'gear_whir' },
    volcanic_ruin: { floor: '#3c211f', alt: '#d66340', wall: '#1e1010', accent: '#ff9158', texture: 'basalt_scoria', effect: 'ember_fall' },
    ancient_crypt: { floor: '#30323d', alt: '#6f7382', wall: '#1d1f26', accent: '#a6b0c2', texture: 'rune_tablet', effect: 'soul_mist' },
    aurora_chamber: { floor: '#242253', alt: '#7f90ff', wall: '#161435', accent: '#a0f6ff', texture: 'aurora_glass', effect: 'aurora_ribbon' },
    dragon_sanctum: { floor: '#3a1f30', alt: '#cf6a7a', wall: '#1f1118', accent: '#f7a2b5', texture: 'dragon_inlay', effect: 'dragon_breath' },
    nordic_barrow: { floor: '#3b3a45', alt: '#8a8899', wall: '#282631', accent: '#d1d1dd', texture: 'carved_sarcophagus', effect: 'ancestral_whisper' },
    storm_battlements: { floor: '#1c2535', alt: '#4a6d9c', wall: '#111926', accent: '#8fb7ed', texture: 'windcarved_flagstone', effect: 'storm_gale' },
    reach_cliff: { floor: '#3a4d3a', alt: '#9bb68a', wall: '#222f21', accent: '#d6f0bd', texture: 'mossy_slab', effect: 'falcon_cry' },
    sovngarde_gate: { floor: '#412860', alt: '#a889d9', wall: '#281844', accent: '#f7e7ff', texture: 'ethereal_sigils', effect: 'soulstream' },
    frost_ritual: { floor: '#223d48', alt: '#5fbad0', wall: '#13252d', accent: '#c9f4ff', texture: 'ritual_etching', effect: 'icy_echo' },
    secluded_shrine: { floor: '#463338', alt: '#b28088', wall: '#281c1f', accent: '#ffd2d6', texture: 'prayer_tiles', effect: 'chant_chime' },
    moonlit_grove: { floor: '#25362d', alt: '#5b8d6a', wall: '#152019', accent: '#b5f7d8', texture: 'mist_pool', effect: 'mist_glow' },
    reach_vale: { floor: '#34463f', alt: '#76a58d', wall: '#212e29', accent: '#c4f2de', texture: 'fern_floor', effect: 'vale_breeze' },
    aurora_colonnade: { floor: '#262a73', alt: '#8eb7ff', wall: '#181b49', accent: '#dcecff', texture: 'aurora_tile', effect: 'aurora_ripple' },
    steam_vein: { floor: '#3f2b1b', alt: '#c08a43', wall: '#1f130b', accent: '#f6bd68', texture: 'steam_grate', effect: 'steam_vent' },
    wyrmrest_tomb: { floor: '#332b3f', alt: '#82619a', wall: '#1f1827', accent: '#d5b5ea', texture: 'obsidian_sigil', effect: 'soul_glow' },
    blizzard_wall: { floor: '#1a2c45', alt: '#6aa0d6', wall: '#0c1726', accent: '#cde9ff', texture: 'frosted_battlement', effect: 'blizzard_surge' },
    midnight_summit: { floor: '#152a38', alt: '#4c7c9b', wall: '#0c1c25', accent: '#a8e3ff', texture: 'snow_ridge', effect: 'aurora_spindrift' }
  };

  const VARIANTS = [
    {
      id: 'skyrim-legends',
      name: 'スカイリム伝承巡り',
      nameKey: "dungeon.types.skyrim_legends.name",
      description: 'ノルドの大広間から氷河の裂け目、ドワーフ遺跡まで巡る極寒の旅路',
      descriptionKey: "dungeon.types.skyrim_legends.description",
      mixin: { normalMixed: 0.62, blockDimMixed: 0.58, tags: ['skyrim', 'nordic', 'snow', 'dragon'] },

      config: {
        hall: { widthFactor: 0.68, heightFactor: 0.24, topOffset: 0.16, daisRadius: 0.12 },
        hallColumns: 4,
        hallExits: [
          { xFactor: 0.5, yFactor: 0.16, targetXFactor: 0.5, targetY: 1, width: 4, zone: 'tundra_pass' },
          { xFactor: 0.5, yFactor: 0.4, targetXFactor: 0.5, targetY: null, targetYFactor: 0.88, width: 4, zone: 'tundra_pass' },
          { xFactor: 0.18, yFactor: 0.28, targetX: 1, targetYFactor: 0.28, width: 3, zone: 'tundra_pass' },
          { xFactor: 0.82, yFactor: 0.28, targetX: null, targetXFactor: 0.98, targetYFactor: 0.28, width: 3, zone: 'tundra_pass' }
        ],
        wings: [
          { xFactor: 0.26, yFactor: 0.18, radiusFactor: 0.12, zone: 'aurora_chamber' },
          { xFactor: 0.74, yFactor: 0.2, radiusFactor: 0.13, zone: 'dragon_sanctum' }
        ],
        lowerScatter: { count: 12, band: [0.55, 0.92], radius: [3, 7], zones: ['dwemer_forge', 'ice_cavern', 'ancient_crypt'] },
        ridgeLoops: { count: 3, zone: 'tundra_pass', jitter: 4, thickness: 3 },
        watchPosts: { count: 2, zone: 'storm_battlements' },
        barrows: { rows: 2, cols: 3, zone: 'nordic_barrow', rect: [0.15, 0.58, 0.85, 0.9] },
        spiral: { xFactor: 0.5, yFactor: 0.74, radiusFactor: 0.16, zone: 'sovngarde_gate' },
        fissures: { count: 4, zone: 'glacial_crevasse' },
        shrines: { count: 3, zone: 'secluded_shrine' },
        springs: { count: 2, zone: 'moonlit_grove' },
        mutate: [{ from: 'ice_cavern', to: 'glacial_crevasse', chance: 0.18 }]
      }
    },
    {
      id: 'skyrim-legends-gauntlet',
      name: 'スカイリム鉄壁の試練',
      nameKey: "dungeon.types.skyrim_legends_gauntlet.name",
      description: 'ドワーフ機構と熔岩の罠が連なる苛烈な突撃路',
      descriptionKey: "dungeon.types.skyrim_legends_gauntlet.description",
      mixin: { normalMixed: 0.52, blockDimMixed: 0.64, tags: ['skyrim', 'gauntlet', 'dwemer', 'lava'] },

      config: {
        hall: { widthFactor: 0.56, heightFactor: 0.18, topOffset: 0.12, daisRadius: 0.1 },
        hallColumns: 6,
        hallExits: [
          { xFactor: 0.5, yFactor: 0.12, targetXFactor: 0.5, targetY: 1, width: 5, zone: 'dwemer_underworks' },
          { xFactor: 0.5, yFactor: 0.3, targetXFactor: 0.5, targetYFactor: 0.58, width: 5, zone: 'dwemer_underworks' }
        ],
        wings: [
          { xFactor: 0.24, yFactor: 0.24, radiusFactor: 0.11, zone: 'dwemer_underworks' },
          { xFactor: 0.76, yFactor: 0.24, radiusFactor: 0.11, zone: 'dwemer_underworks' }
        ],
        lowerScatter: { count: 16, band: [0.5, 0.95], radius: [3, 6], zones: ['dwemer_underworks', 'volcanic_ruin', 'dwemer_forge'] },
        ridgeLoops: { count: 4, zone: 'dwemer_underworks', jitter: 6, thickness: 4 },
        fissures: { count: 6, zone: 'volcanic_ruin' },
        shrines: { count: 2, zone: 'frost_ritual' },
        springs: { count: 1, zone: 'moonlit_grove' },
        mutate: [
          { from: 'dwemer_underworks', to: 'volcanic_ruin', chance: 0.22 },
          { from: 'dwemer_forge', to: 'volcanic_ruin', chance: 0.12 }
        ]
      }
    },
    {
      id: 'skyrim-legends-pilgrimage',
      name: 'スカイリム巡礼の旅路',
      nameKey: "dungeon.types.skyrim_legends_pilgrimage.name",
      description: '峡谷沿いの祠と霊樹を巡る瞑想的な回廊',
      descriptionKey: "dungeon.types.skyrim_legends_pilgrimage.description",
      mixin: { normalMixed: 0.7, blockDimMixed: 0.48, tags: ['skyrim', 'pilgrimage', 'grove', 'ritual'] },

      config: {
        hall: { widthFactor: 0.62, heightFactor: 0.2, topOffset: 0.18, daisRadius: 0.1 },
        hallColumns: 3,
        hallExits: [
          { xFactor: 0.5, yFactor: 0.18, targetXFactor: 0.5, targetY: 1, width: 4, zone: 'reach_vale' },
          { xFactor: 0.2, yFactor: 0.26, targetXFactor: 0.05, targetYFactor: 0.26, width: 3, zone: 'reach_vale' },
          { xFactor: 0.8, yFactor: 0.26, targetXFactor: 0.95, targetYFactor: 0.26, width: 3, zone: 'reach_vale' }
        ],
        wings: [
          { xFactor: 0.3, yFactor: 0.22, radiusFactor: 0.12, zone: 'aurora_chamber' },
          { xFactor: 0.7, yFactor: 0.22, radiusFactor: 0.12, zone: 'secluded_shrine' }
        ],
        lowerScatter: { count: 10, band: [0.55, 0.92], radius: [3, 6], zones: ['reach_vale', 'moonlit_grove', 'ice_cavern'] },
        ridgeLoops: { count: 2, zone: 'reach_vale', jitter: 3, thickness: 3 },
        fissures: { count: 3, zone: 'glacial_crevasse' },
        shrines: { count: 5, zone: 'secluded_shrine' },
        springs: { count: 4, zone: 'moonlit_grove' },
        barrows: { rows: 1, cols: 4, zone: 'frost_ritual', rect: [0.18, 0.6, 0.82, 0.82] },
        spiral: { xFactor: 0.5, yFactor: 0.72, radiusFactor: 0.14, zone: 'sovngarde_gate' },
        mutate: [{ from: 'reach_vale', to: 'moonlit_grove', chance: 0.18 }]
      }
    },
    {
      id: 'skyrim-legends-siege',
      name: 'スカイリム攻城最前線',
      nameKey: "dungeon.types.skyrim_legends_siege.name",
      description: '氷原の砦と断崖の防衛線を縫う戦場型迷宮',
      descriptionKey: "dungeon.types.skyrim_legends_siege.description",
      mixin: { normalMixed: 0.48, blockDimMixed: 0.66, tags: ['skyrim', 'battle', 'storm', 'fortress'] },

      config: {
        hall: { widthFactor: 0.58, heightFactor: 0.22, topOffset: 0.14, daisRadius: 0.11 },
        hallColumns: 5,
        hallExits: [
          { xFactor: 0.5, yFactor: 0.14, targetXFactor: 0.5, targetY: 1, width: 5, zone: 'storm_battlements' },
          { xFactor: 0.3, yFactor: 0.32, targetXFactor: 0.1, targetYFactor: 0.5, width: 4, zone: 'storm_battlements' },
          { xFactor: 0.7, yFactor: 0.32, targetXFactor: 0.9, targetYFactor: 0.5, width: 4, zone: 'storm_battlements' }
        ],
        wings: [
          { xFactor: 0.22, yFactor: 0.2, radiusFactor: 0.11, zone: 'storm_battlements' },
          { xFactor: 0.78, yFactor: 0.2, radiusFactor: 0.11, zone: 'storm_battlements' }
        ],
        lowerScatter: { count: 14, band: [0.52, 0.94], radius: [3, 7], zones: ['storm_battlements', 'reach_cliff', 'nordic_barrow'] },
        ridgeLoops: { count: 4, zone: 'storm_battlements', jitter: 5, thickness: 4 },
        fissures: { count: 5, zone: 'reach_cliff' },
        watchPosts: { count: 4, zone: 'storm_battlements' },
        shrines: { count: 2, zone: 'frost_ritual' },
        springs: { count: 1, zone: 'reach_vale' },
        barrows: { rows: 2, cols: 4, zone: 'nordic_barrow', rect: [0.12, 0.6, 0.88, 0.92] },
        mutate: [
          { from: 'storm_battlements', to: 'reach_cliff', chance: 0.14 },
          { from: 'nordic_barrow', to: 'storm_battlements', chance: 0.1 }
        ]
      }
    },
    {
      id: 'skyrim-legends-aurora',
      name: 'スカイリム極光幻想',
      nameKey: "dungeon.types.skyrim_legends_aurora.name",
      description: '極光が降り注ぐ天空回廊と霊泉を巡る光彩の迷宮',
      descriptionKey: "dungeon.types.skyrim_legends_aurora.description",
      mixin: { normalMixed: 0.74, blockDimMixed: 0.42, tags: ['skyrim', 'aurora', 'mythic', 'sky'] },

      paletteOverrides: {
        aurora_chamber: { floor: '#2d2a74', alt: '#97a7ff', wall: '#17184b', accent: '#dff5ff', texture: 'aurora_glass', effect: 'aurora_ribbon' },
        aurora_colonnade: { floor: '#262a73', alt: '#8eb7ff', wall: '#181b49', accent: '#dcecff', texture: 'aurora_tile', effect: 'aurora_ripple' },
        midnight_summit: { floor: '#142a3a', alt: '#4b7fa6', wall: '#0f1e29', accent: '#8ff9ff', texture: 'snow_ridge', effect: 'aurora_spindrift' }
      },

      config: {
        hall: { widthFactor: 0.64, heightFactor: 0.18, topOffset: 0.14, daisRadius: 0.12 },
        hallColumns: 3,
        hallExits: [
          { xFactor: 0.5, yFactor: 0.16, targetXFactor: 0.5, targetY: 1, width: 4, zone: 'aurora_colonnade' },
          { xFactor: 0.18, yFactor: 0.28, targetXFactor: 0.02, targetYFactor: 0.42, width: 3, zone: 'midnight_summit' },
          { xFactor: 0.82, yFactor: 0.28, targetXFactor: 0.98, targetYFactor: 0.42, width: 3, zone: 'midnight_summit' }
        ],
        wings: [
          { xFactor: 0.34, yFactor: 0.2, radiusFactor: 0.11, zone: 'aurora_colonnade', orbitZone: 'aurora_chamber' },
          { xFactor: 0.66, yFactor: 0.2, radiusFactor: 0.11, zone: 'sovngarde_gate', orbitZone: 'aurora_chamber' }
        ],
        lowerScatter: { count: 14, band: [0.54, 0.92], radius: [3, 6], zones: ['aurora_colonnade', 'moonlit_grove', 'sovngarde_gate'] },
        ridgeLoops: { count: 3, zone: 'midnight_summit', jitter: 4, thickness: 3 },
        shrines: { count: 4, zone: 'secluded_shrine' },
        springs: { count: 4, zone: 'moonlit_grove' },
        spiral: { xFactor: 0.5, yFactor: 0.72, radiusFactor: 0.15, zone: 'aurora_chamber' },
        fissures: { count: 3, zone: 'glacial_crevasse' },
        mutate: [
          { from: 'aurora_colonnade', to: 'aurora_chamber', chance: 0.16 },
          { from: 'moonlit_grove', to: 'aurora_colonnade', chance: 0.12 }
        ],
        mingle: [
          { from: 'sovngarde_gate', to: 'aurora_chamber', chance: 0.18 },
          { from: 'midnight_summit', to: 'aurora_colonnade', chance: 0.16 }
        ]
      }
    },
    {
      id: 'skyrim-legends-deepdelve',
      name: 'スカイリム鍛冶の深淵',
      nameKey: "dungeon.types.skyrim_legends_deepdelve.name",
      description: '熔鉱炉と蒸気管が迷宮状に絡み合うドワーフ地底帝都',
      descriptionKey: "dungeon.types.skyrim_legends_deepdelve.description",
      mixin: { normalMixed: 0.46, blockDimMixed: 0.7, tags: ['skyrim', 'dwemer', 'forge', 'depth'] },

      paletteOverrides: {
        dwemer_underworks: { floor: '#302a26', alt: '#9a7d56', wall: '#181411', accent: '#dfb176', texture: 'copper_grate', effect: 'gear_whir' },
        steam_vein: { floor: '#3f2b1b', alt: '#c08a43', wall: '#1f130b', accent: '#f6bd68', texture: 'steam_grate', effect: 'steam_vent' },
        volcanic_ruin: { floor: '#43231f', alt: '#df6e43', wall: '#1f0f0f', accent: '#ff9a63', texture: 'basalt_scoria', effect: 'ember_fall' }
      },

      config: {
        hall: { widthFactor: 0.52, heightFactor: 0.2, topOffset: 0.12, daisRadius: 0.09 },
        hallColumns: 6,
        hallExits: [
          { xFactor: 0.5, yFactor: 0.14, targetXFactor: 0.5, targetY: 1, width: 5, zone: 'dwemer_underworks' },
          { xFactor: 0.28, yFactor: 0.28, targetXFactor: 0.12, targetYFactor: 0.5, width: 4, zone: 'steam_vein' },
          { xFactor: 0.72, yFactor: 0.28, targetXFactor: 0.88, targetYFactor: 0.5, width: 4, zone: 'steam_vein' }
        ],
        wings: [
          { xFactor: 0.24, yFactor: 0.22, radiusFactor: 0.1, zone: 'dwemer_forge', orbitZone: 'steam_vein' },
          { xFactor: 0.76, yFactor: 0.22, radiusFactor: 0.1, zone: 'dwemer_underworks', orbitZone: 'steam_vein' }
        ],
        lowerScatter: { count: 18, band: [0.5, 0.94], radius: [3, 6], zones: ['dwemer_underworks', 'steam_vein', 'volcanic_ruin'] },
        ridgeLoops: { count: 5, zone: 'steam_vein', jitter: 5, thickness: 4 },
        fissures: { count: 7, zone: 'volcanic_ruin' },
        shrines: { count: 2, zone: 'frost_ritual' },
        springs: { count: 2, zone: 'steam_vein' },
        mutate: [
          { from: 'dwemer_underworks', to: 'steam_vein', chance: 0.22 },
          { from: 'dwemer_forge', to: 'volcanic_ruin', chance: 0.18 }
        ],
        mingle: [
          { from: 'steam_vein', to: 'dwemer_forge', chance: 0.16 }
        ]
      }
    },
    {
      id: 'skyrim-legends-barrowmarch',
      name: 'スカイリム古墳の夜行',
      nameKey: "dungeon.types.skyrim_legends_barrowmarch.name",
      description: '山野を横断する層積古墳と幽霊火の参道を進む葬送巡礼',
      descriptionKey: "dungeon.types.skyrim_legends_barrowmarch.description",
      mixin: { normalMixed: 0.62, blockDimMixed: 0.5, tags: ['skyrim', 'barrow', 'ancient', 'ritual'] },

      paletteOverrides: {
        wyrmrest_tomb: { floor: '#332b3f', alt: '#82619a', wall: '#1f1827', accent: '#d5b5ea', texture: 'obsidian_sigil', effect: 'soul_glow' },
        nordic_barrow: { floor: '#3c3b46', alt: '#8f8b9c', wall: '#282732', accent: '#d8d3df', texture: 'carved_sarcophagus', effect: 'ancestral_whisper' }
      },

      config: {
        hall: { widthFactor: 0.66, heightFactor: 0.22, topOffset: 0.18, daisRadius: 0.13 },
        hallColumns: 4,
        hallExits: [
          { xFactor: 0.5, yFactor: 0.2, targetXFactor: 0.5, targetY: 1, width: 4, zone: 'wyrmrest_tomb' },
          { xFactor: 0.18, yFactor: 0.3, targetXFactor: 0.02, targetYFactor: 0.48, width: 3, zone: 'nordic_barrow' },
          { xFactor: 0.82, yFactor: 0.3, targetXFactor: 0.98, targetYFactor: 0.48, width: 3, zone: 'nordic_barrow' }
        ],
        wings: [
          { xFactor: 0.32, yFactor: 0.24, radiusFactor: 0.12, zone: 'ancient_crypt' },
          { xFactor: 0.68, yFactor: 0.24, radiusFactor: 0.12, zone: 'wyrmrest_tomb' }
        ],
        lowerScatter: { count: 16, band: [0.56, 0.94], radius: [3, 7], zones: ['nordic_barrow', 'wyrmrest_tomb', 'ancient_crypt'] },
        ridgeLoops: { count: 3, zone: 'wyrmrest_tomb', jitter: 3, thickness: 4 },
        watchPosts: { count: 2, zone: 'storm_battlements' },
        barrows: { rows: 3, cols: 3, zone: 'nordic_barrow', rect: [0.12, 0.56, 0.88, 0.92] },
        shrines: { count: 4, zone: 'frost_ritual' },
        springs: { count: 2, zone: 'secluded_shrine' },
        spiral: { xFactor: 0.5, yFactor: 0.78, radiusFactor: 0.18, zone: 'wyrmrest_tomb' },
        mutate: [
          { from: 'nordic_barrow', to: 'wyrmrest_tomb', chance: 0.2 },
          { from: 'ancient_crypt', to: 'wyrmrest_tomb', chance: 0.14 }
        ],
        mingle: [
          { from: 'wyrmrest_tomb', to: 'ancient_crypt', chance: 0.1 }
        ]
      }
    },
    {
      id: 'skyrim-legends-blizzardwatch',
      name: 'スカイリム吹雪の監視線',
      nameKey: "dungeon.types.skyrim_legends_blizzardwatch.name",
      description: '吹雪渦巻く砦と氷崖の警備線を突破する攻防戦迷宮',
      descriptionKey: "dungeon.types.skyrim_legends_blizzardwatch.description",
      mixin: { normalMixed: 0.5, blockDimMixed: 0.68, tags: ['skyrim', 'storm', 'fortress', 'blizzard'] },

      paletteOverrides: {
        storm_battlements: { floor: '#1a273b', alt: '#4d6c9b', wall: '#0f1827', accent: '#a6c3f0', texture: 'windcarved_flagstone', effect: 'storm_gale' },
        blizzard_wall: { floor: '#1a2c45', alt: '#6aa0d6', wall: '#0c1726', accent: '#cde9ff', texture: 'frosted_battlement', effect: 'blizzard_surge' },
        midnight_summit: { floor: '#152a38', alt: '#4c7c9b', wall: '#0c1c25', accent: '#a8e3ff', texture: 'snow_ridge', effect: 'aurora_spindrift' }
      },

      config: {
        hall: { widthFactor: 0.6, heightFactor: 0.2, topOffset: 0.16, daisRadius: 0.1 },
        hallColumns: 5,
        hallExits: [
          { xFactor: 0.5, yFactor: 0.18, targetXFactor: 0.5, targetY: 1, width: 5, zone: 'storm_battlements' },
          { xFactor: 0.2, yFactor: 0.32, targetXFactor: 0.08, targetYFactor: 0.54, width: 4, zone: 'blizzard_wall', split: [
            { xFactor: 0.08, yFactor: 0.72, width: 3, zone: 'midnight_summit' }
          ] },
          { xFactor: 0.8, yFactor: 0.32, targetXFactor: 0.92, targetYFactor: 0.54, width: 4, zone: 'blizzard_wall', split: [
            { xFactor: 0.92, yFactor: 0.72, width: 3, zone: 'midnight_summit' }
          ] }
        ],
        wings: [
          { xFactor: 0.26, yFactor: 0.22, radiusFactor: 0.1, zone: 'storm_battlements' },
          { xFactor: 0.74, yFactor: 0.22, radiusFactor: 0.1, zone: 'storm_battlements' }
        ],
        lowerScatter: { count: 18, band: [0.5, 0.94], radius: [3, 7], zones: ['storm_battlements', 'blizzard_wall', 'glacial_crevasse'] },
        ridgeLoops: { count: 5, zone: 'blizzard_wall', jitter: 6, thickness: 4 },
        watchPosts: { count: 5, zone: 'storm_battlements' },
        fissures: { count: 6, zone: 'glacial_crevasse' },
        shrines: { count: 2, zone: 'frost_ritual' },
        springs: { count: 2, zone: 'midnight_summit' },
        barrows: { rows: 2, cols: 4, zone: 'nordic_barrow', rect: [0.16, 0.6, 0.84, 0.92] },
        mutate: [
          { from: 'storm_battlements', to: 'blizzard_wall', chance: 0.18 },
          { from: 'tundra_pass', to: 'midnight_summit', chance: 0.16 }
        ],
        mingle: [
          { from: 'blizzard_wall', to: 'storm_battlements', chance: 0.14 },
          { from: 'midnight_summit', to: 'aurora_chamber', chance: 0.1 }
        ]
      }
    }
  ];

  function applyHallFeatures(map, zoneMap, ctx, config){
    const W = map[0].length;
    const H = map.length;
    const hall = config.hall || {};
    const hallLeft = Math.floor(W * (0.5 - hall.widthFactor / 2));
    const hallRight = Math.floor(W * (0.5 + hall.widthFactor / 2));
    const hallTop = Math.floor(H * hall.topOffset);
    const hallBottom = Math.min(H - 2, hallTop + Math.floor(H * hall.heightFactor));
    carveRectZone(map, zoneMap, hallLeft, hallTop, hallRight, hallBottom, 'mead_hall');
    const daisRadius = Math.floor(Math.min(W, H) * (hall.daisRadius || 0.1));
    carveCircleZone(map, zoneMap, Math.floor(W * 0.5), Math.floor((hallTop + hallBottom) / 2), daisRadius, 'skyforge_dais');

    const columns = config.hallColumns || 0;
    if (columns > 0){
      for (let i = 0; i < columns; i++){
        const t = (i + 1) / (columns + 1);
        const cx = Math.floor(lerp(hallLeft + 2, hallRight - 2, t));
        const cyTop = hallTop + Math.floor((i % 2 === 0 ? 0.35 : 0.65) * (hallBottom - hallTop));
        carveCircleZone(map, zoneMap, cx, cyTop, 2, 'mead_hall');
        carveCircleZone(map, zoneMap, cx, cyTop + 3, 2, 'mead_hall');
      }
    }

    (config.hallExits || []).forEach((exit) => {
      const startX = exit.x !== undefined ? exit.x : Math.floor(W * (exit.xFactor !== undefined ? exit.xFactor : 0.5));
      const startY = exit.y !== undefined ? exit.y : Math.floor(H * (exit.yFactor !== undefined ? exit.yFactor : 0.5));
      const endX = exit.targetX !== undefined ? exit.targetX : Math.floor((exit.targetXFactor !== undefined ? W * exit.targetXFactor : startX));
      const endY = exit.targetY !== undefined ? exit.targetY : Math.floor((exit.targetYFactor !== undefined ? H * exit.targetYFactor : startY));
      carveCorridor(map, zoneMap, startX, startY, endX, endY, exit.width || 3, exit.zone || 'tundra_pass');
      if (exit.split && Array.isArray(exit.split)){
        exit.split.forEach((branch) => {
          carveCorridor(map, zoneMap, endX, endY, Math.floor(W * branch.xFactor), Math.floor(H * branch.yFactor), branch.width || 2, branch.zone || exit.zone || 'tundra_pass');
        });
      }
    });

    (config.wings || []).forEach((wing) => {
      const cx = Math.floor(W * wing.xFactor);
      const cy = Math.floor(H * wing.yFactor);
      const radius = Math.floor(Math.min(W, H) * wing.radiusFactor);
      carveCircleZone(map, zoneMap, cx, cy, radius, wing.zone);
      if (wing.orbitZone){
        carveSpiralSanctum(map, zoneMap, cx, cy, radius + 2, wing.orbitZone, ctx);
      }
    });
  }

  function generateNordicLayout(ctx, variant){
    const W = ctx.width;
    const H = ctx.height;
    const map = ctx.map;
    const zoneMap = createZoneMap(W, H);

    for (let y = 0; y < H; y++){
      for (let x = 0; x < W; x++){
        map[y][x] = 1;
      }
    }

    applyHallFeatures(map, zoneMap, ctx, variant.config);

    if (variant.config.lowerScatter){
      scatterChambers(map, zoneMap, ctx, variant.config.lowerScatter);
    }

    if (variant.config.ridgeLoops){
      layRidgeLoops(map, zoneMap, ctx, variant.config.ridgeLoops);
    }

    if (variant.config.watchPosts){
      carveWatchPosts(map, zoneMap, ctx, variant.config.watchPosts);
    }

    if (variant.config.barrows){
      carveBarrowField(map, zoneMap, variant.config.barrows);
    }

    if (variant.config.spiral){
      const { xFactor = 0.5, yFactor = 0.75, radiusFactor = 0.14, zone = 'sovngarde_gate' } = variant.config.spiral;
      carveSpiralSanctum(map, zoneMap, Math.floor(W * xFactor), Math.floor(H * yFactor), Math.floor(Math.min(W, H) * radiusFactor), zone, ctx);
    }

    if (variant.config.fissures){
      carveFissures(map, zoneMap, ctx, variant.config.fissures);
    }

    if (variant.config.shrines){
      seedShrines(map, zoneMap, ctx, variant.config.shrines);
    }

    if (variant.config.springs){
      seedHotSprings(map, zoneMap, ctx, variant.config.springs);
    }

    if (variant.config.mutate){
      variant.config.mutate.forEach((item) => {
        mutateZones(zoneMap, ctx, item.from, item.to, item.chance);
      });
    }

    if (variant.config.mingle){
      variant.config.mingle.forEach((item) => {
        mixIntoNeighbors(zoneMap, ctx, item.from, item.to, item.chance);
      });
    }

    const palettes = Object.assign({}, basePalettes, variant.paletteOverrides || {});
    paintMap(ctx, zoneMap, palettes);
    if (ctx.ensureConnectivity) ctx.ensureConnectivity();
  }

  function bossFloors(maxDepth){
    const anchors = [3, 6, 9, 12, 15, 18, 21, 24];
    return anchors.filter((floor) => floor <= maxDepth);
  }

  const generators = VARIANTS.map((variant) => ({
    id: variant.id,
    name: variant.name,
    nameKey: variant.nameKey || `dungeon.types.${sanitizeKey(variant.id)}.name`,
    description: variant.description,
    descriptionKey: variant.descriptionKey || (variant.description ? `dungeon.types.${sanitizeKey(variant.id)}.description` : undefined),
    mixin: variant.mixin,
    algorithm: (ctx) => generateNordicLayout(ctx, variant)
  }));

  const blocks = {
    saga: [
      {
        key: 'skyrim_saga_01',
        name: 'ノルドの伝承 I',
        nameKey: "dungeon.types.skyrim_legends.blocks.skyrim_saga_01.name",
        level: -4,
        size: -1,
        depth: 0,
        chest: 'less',
        type: 'skyrim-legends',
        bossFloors: bossFloors(3)
      },
      {
        key: 'skyrim_saga_02',
        name: 'ノルドの伝承 II',
        nameKey: "dungeon.types.skyrim_legends.blocks.skyrim_saga_02.name",
        level: -1,
        size: -1,
        depth: 0,
        chest: 'normal',
        type: 'skyrim-legends',
        bossFloors: bossFloors(5)
      },
      {
        key: 'skyrim_saga_03',
        name: 'ノルドの伝承 III',
        nameKey: "dungeon.types.skyrim_legends.blocks.skyrim_saga_03.name",
        level: 3,
        size: 0,
        depth: 1,
        chest: 'normal',
        type: 'skyrim-legends',
        bossFloors: bossFloors(7)
      },
      {
        key: 'skyrim_saga_04',
        name: 'ノルドの伝承 IV',
        nameKey: "dungeon.types.skyrim_legends.blocks.skyrim_saga_04.name",
        level: 7,
        size: 0,
        depth: 1,
        chest: 'more',
        type: 'skyrim-legends',
        bossFloors: bossFloors(9)
      },
      {
        key: 'skyrim_saga_05',
        name: 'ノルドの伝承 V',
        nameKey: "dungeon.types.skyrim_legends.blocks.skyrim_saga_05.name",
        level: 12,
        size: +1,
        depth: 2,
        chest: 'normal',
        type: 'skyrim-legends',
        bossFloors: bossFloors(12)
      },
      {
        key: 'skyrim_saga_06',
        name: 'ノルドの伝承 VI',
        nameKey: "dungeon.types.skyrim_legends.blocks.skyrim_saga_06.name",
        level: 16,
        size: +1,
        depth: 2,
        chest: 'less',
        type: 'skyrim-legends',
        bossFloors: bossFloors(15)
      },
      {
        key: 'skyrim_saga_07',
        name: 'ノルドの伝承 VII',
        nameKey: "dungeon.types.skyrim_legends.blocks.skyrim_saga_07.name",
        level: 20,
        size: +1,
        depth: 2,
        chest: 'more',
        type: 'skyrim-legends',
        bossFloors: bossFloors(18)
      },
      {
        key: 'skyrim_saga_08',
        name: 'ノルドの伝承 VIII',
        nameKey: "dungeon.types.skyrim_legends.blocks.skyrim_saga_08.name",
        level: 24,
        size: +2,
        depth: 3,
        chest: 'normal',
        type: 'skyrim-legends',
        bossFloors: bossFloors(21)
      },
      {
        key: 'skyrim_saga_09',
        name: 'ノルドの伝承 IX',
        nameKey: "dungeon.types.skyrim_legends.blocks.skyrim_saga_09.name",
        level: 28,
        size: +2,
        depth: 3,
        chest: 'more',
        type: 'skyrim-legends',
        bossFloors: bossFloors(24)
      },
      {
        key: 'skyrim_saga_10',
        name: 'ノルドの伝承 X',
        nameKey: "dungeon.types.skyrim_legends.blocks.skyrim_saga_10.name",
        level: 32,
        size: +3,
        depth: 3,
        chest: 'normal',
        type: 'skyrim-legends',
        bossFloors: bossFloors(24)
      },
      {
        key: 'skyrim_saga_11',
        name: 'ノルドの伝承 XI',
        nameKey: "dungeon.types.skyrim_legends.blocks.skyrim_saga_11.name",
        level: 36,
        size: +3,
        depth: 4,
        chest: 'more',
        type: 'skyrim-legends',
        bossFloors: bossFloors(24)
      },
      {
        key: 'skyrim_saga_12',
        name: 'ノルドの伝承 XII',
        nameKey: "dungeon.types.skyrim_legends.blocks.skyrim_saga_12.name",
        level: 40,
        size: +4,
        depth: 4,
        chest: 'abundant',
        type: 'skyrim-legends',
        bossFloors: bossFloors(24)
      }
    ],
    trials: [
      {
        key: 'skyrim_trial_01',
        name: '氷刃の試練 I',
        nameKey: "dungeon.types.skyrim_legends.blocks.skyrim_trial_01.name",
        level: 0,
        size: 0,
        depth: 1,
        chest: 'less',
        type: 'skyrim-legends'
      },
      {
        key: 'skyrim_trial_02',
        name: '氷刃の試練 II',
        nameKey: "dungeon.types.skyrim_legends.blocks.skyrim_trial_02.name",
        level: 5,
        size: 0,
        depth: 1,
        chest: 'normal',
        type: 'skyrim-legends'
      },
      {
        key: 'skyrim_trial_03',
        name: '氷刃の試練 III',
        nameKey: "dungeon.types.skyrim_legends.blocks.skyrim_trial_03.name",
        level: 9,
        size: +1,
        depth: 2,
        chest: 'normal',
        type: 'skyrim-legends'
      },
      {
        key: 'skyrim_trial_04',
        name: '氷刃の試練 IV',
        nameKey: "dungeon.types.skyrim_legends.blocks.skyrim_trial_04.name",
        level: 13,
        size: +1,
        depth: 2,
        chest: 'more',
        type: 'skyrim-legends'
      },
      {
        key: 'skyrim_trial_05',
        name: '氷刃の試練 V',
        nameKey: "dungeon.types.skyrim_legends.blocks.skyrim_trial_05.name",
        level: 17,
        size: +1,
        depth: 3,
        chest: 'less',
        type: 'skyrim-legends'
      },
      {
        key: 'skyrim_trial_06',
        name: '氷刃の試練 VI',
        nameKey: "dungeon.types.skyrim_legends.blocks.skyrim_trial_06.name",
        level: 21,
        size: +2,
        depth: 3,
        chest: 'normal',
        type: 'skyrim-legends'
      },
      {
        key: 'skyrim_trial_07',
        name: '氷刃の試練 VII',
        nameKey: "dungeon.types.skyrim_legends.blocks.skyrim_trial_07.name",
        level: 25,
        size: +2,
        depth: 3,
        chest: 'more',
        type: 'skyrim-legends'
      },
      {
        key: 'skyrim_trial_08',
        name: '氷刃の試練 VIII',
        nameKey: "dungeon.types.skyrim_legends.blocks.skyrim_trial_08.name",
        level: 29,
        size: +3,
        depth: 4,
        chest: 'normal',
        type: 'skyrim-legends'
      },
      {
        key: 'skyrim_trial_09',
        name: '氷刃の試練 IX',
        nameKey: "dungeon.types.skyrim_legends.blocks.skyrim_trial_09.name",
        level: 33,
        size: +3,
        depth: 4,
        chest: 'more',
        type: 'skyrim-legends'
      }
    ],
    relics: [
      {
        key: 'skyrim_relic_01',
        name: '古代ノルドの遺宝 I',
        nameKey: "dungeon.types.skyrim_legends.blocks.skyrim_relic_01.name",
        level: 2,
        size: 0,
        depth: 2,
        chest: 'more',
        type: 'skyrim-legends',
        bossFloors: [3]
      },
      {
        key: 'skyrim_relic_02',
        name: '古代ノルドの遺宝 II',
        nameKey: "dungeon.types.skyrim_legends.blocks.skyrim_relic_02.name",
        level: 8,
        size: +1,
        depth: 2,
        chest: 'normal',
        type: 'skyrim-legends',
        bossFloors: [6]
      },
      {
        key: 'skyrim_relic_03',
        name: '古代ノルドの遺宝 III',
        nameKey: "dungeon.types.skyrim_legends.blocks.skyrim_relic_03.name",
        level: 14,
        size: +1,
        depth: 3,
        chest: 'more',
        type: 'skyrim-legends',
        bossFloors: [9]
      },
      {
        key: 'skyrim_relic_04',
        name: '古代ノルドの遺宝 IV',
        nameKey: "dungeon.types.skyrim_legends.blocks.skyrim_relic_04.name",
        level: 18,
        size: +1,
        depth: 3,
        chest: 'normal',
        type: 'skyrim-legends',
        bossFloors: [12]
      },
      {
        key: 'skyrim_relic_05',
        name: '古代ノルドの遺宝 V',
        nameKey: "dungeon.types.skyrim_legends.blocks.skyrim_relic_05.name",
        level: 22,
        size: +2,
        depth: 3,
        chest: 'less',
        type: 'skyrim-legends',
        bossFloors: [15]
      },
      {
        key: 'skyrim_relic_06',
        name: '古代ノルドの遺宝 VI',
        nameKey: "dungeon.types.skyrim_legends.blocks.skyrim_relic_06.name",
        level: 26,
        size: +2,
        depth: 4,
        chest: 'normal',
        type: 'skyrim-legends',
        bossFloors: [18]
      },
      {
        key: 'skyrim_relic_07',
        name: '古代ノルドの遺宝 VII',
        nameKey: "dungeon.types.skyrim_legends.blocks.skyrim_relic_07.name",
        level: 30,
        size: +2,
        depth: 4,
        chest: 'more',
        type: 'skyrim-legends',
        bossFloors: [21]
      },
      {
        key: 'skyrim_relic_08',
        name: '古代ノルドの遺宝 VIII',
        nameKey: "dungeon.types.skyrim_legends.blocks.skyrim_relic_08.name",
        level: 34,
        size: +3,
        depth: 4,
        chest: 'more',
        type: 'skyrim-legends',
        bossFloors: [24]
      },
      {
        key: 'skyrim_relic_09',
        name: '古代ノルドの遺宝 IX',
        nameKey: "dungeon.types.skyrim_legends.blocks.skyrim_relic_09.name",
        level: 38,
        size: +3,
        depth: 4,
        chest: 'abundant',
        type: 'skyrim-legends',
        bossFloors: [24]
      }
    ],
    gauntlet: [
      {
        key: 'skyrim_gauntlet_01',
        name: '熔鋼の防衛線 I',
        nameKey: "dungeon.types.skyrim_legends_gauntlet.blocks.skyrim_gauntlet_01.name",
        level: 6,
        size: 0,
        depth: 2,
        chest: 'less',
        type: 'skyrim-legends-gauntlet'
      },
      {
        key: 'skyrim_gauntlet_02',
        name: '熔鋼の防衛線 II',
        nameKey: "dungeon.types.skyrim_legends_gauntlet.blocks.skyrim_gauntlet_02.name",
        level: 12,
        size: +1,
        depth: 2,
        chest: 'normal',
        type: 'skyrim-legends-gauntlet'
      },
      {
        key: 'skyrim_gauntlet_03',
        name: '熔鋼の防衛線 III',
        nameKey: "dungeon.types.skyrim_legends_gauntlet.blocks.skyrim_gauntlet_03.name",
        level: 18,
        size: +1,
        depth: 3,
        chest: 'more',
        type: 'skyrim-legends-gauntlet'
      },
      {
        key: 'skyrim_gauntlet_04',
        name: '熔鋼の防衛線 IV',
        nameKey: "dungeon.types.skyrim_legends_gauntlet.blocks.skyrim_gauntlet_04.name",
        level: 24,
        size: +2,
        depth: 3,
        chest: 'normal',
        type: 'skyrim-legends-gauntlet',
        bossFloors: [12, 18]
      },
      {
        key: 'skyrim_gauntlet_05',
        name: '熔鋼の防衛線 V',
        nameKey: "dungeon.types.skyrim_legends_gauntlet.blocks.skyrim_gauntlet_05.name",
        level: 30,
        size: +2,
        depth: 4,
        chest: 'more',
        type: 'skyrim-legends-gauntlet',
        bossFloors: [21]
      },
      {
        key: 'skyrim_gauntlet_06',
        name: '熔鋼の防衛線 VI',
        nameKey: "dungeon.types.skyrim_legends_gauntlet.blocks.skyrim_gauntlet_06.name",
        level: 36,
        size: +3,
        depth: 4,
        chest: 'abundant',
        type: 'skyrim-legends-gauntlet',
        bossFloors: [24]
      }
    ],
    pilgrimage: [
      {
        key: 'skyrim_pilgrimage_01',
        name: '霜露の巡礼 I',
        nameKey: "dungeon.types.skyrim_legends_pilgrimage.blocks.skyrim_pilgrimage_01.name",
        level: -2,
        size: -1,
        depth: 0,
        chest: 'less',
        type: 'skyrim-legends-pilgrimage'
      },
      {
        key: 'skyrim_pilgrimage_02',
        name: '霜露の巡礼 II',
        nameKey: "dungeon.types.skyrim_legends_pilgrimage.blocks.skyrim_pilgrimage_02.name",
        level: 4,
        size: 0,
        depth: 1,
        chest: 'normal',
        type: 'skyrim-legends-pilgrimage'
      },
      {
        key: 'skyrim_pilgrimage_03',
        name: '霜露の巡礼 III',
        nameKey: "dungeon.types.skyrim_legends_pilgrimage.blocks.skyrim_pilgrimage_03.name",
        level: 10,
        size: 0,
        depth: 1,
        chest: 'more',
        type: 'skyrim-legends-pilgrimage'
      },
      {
        key: 'skyrim_pilgrimage_04',
        name: '霜露の巡礼 IV',
        nameKey: "dungeon.types.skyrim_legends_pilgrimage.blocks.skyrim_pilgrimage_04.name",
        level: 16,
        size: +1,
        depth: 2,
        chest: 'normal',
        type: 'skyrim-legends-pilgrimage',
        bossFloors: [6]
      },
      {
        key: 'skyrim_pilgrimage_05',
        name: '霜露の巡礼 V',
        nameKey: "dungeon.types.skyrim_legends_pilgrimage.blocks.skyrim_pilgrimage_05.name",
        level: 22,
        size: +1,
        depth: 2,
        chest: 'more',
        type: 'skyrim-legends-pilgrimage',
        bossFloors: [9]
      },
      {
        key: 'skyrim_pilgrimage_06',
        name: '霜露の巡礼 VI',
        nameKey: "dungeon.types.skyrim_legends_pilgrimage.blocks.skyrim_pilgrimage_06.name",
        level: 28,
        size: +2,
        depth: 3,
        chest: 'abundant',
        type: 'skyrim-legends-pilgrimage',
        bossFloors: [12]
      }
    ],
    siege: [
      {
        key: 'skyrim_siege_01',
        name: '氷砦の攻城 I',
        nameKey: "dungeon.types.skyrim_legends_siege.blocks.skyrim_siege_01.name",
        level: 8,
        size: 0,
        depth: 2,
        chest: 'less',
        type: 'skyrim-legends-siege'
      },
      {
        key: 'skyrim_siege_02',
        name: '氷砦の攻城 II',
        nameKey: "dungeon.types.skyrim_legends_siege.blocks.skyrim_siege_02.name",
        level: 14,
        size: +1,
        depth: 2,
        chest: 'normal',
        type: 'skyrim-legends-siege'
      },
      {
        key: 'skyrim_siege_03',
        name: '氷砦の攻城 III',
        nameKey: "dungeon.types.skyrim_legends_siege.blocks.skyrim_siege_03.name",
        level: 20,
        size: +1,
        depth: 3,
        chest: 'more',
        type: 'skyrim-legends-siege'
      },
      {
        key: 'skyrim_siege_04',
        name: '氷砦の攻城 IV',
        nameKey: "dungeon.types.skyrim_legends_siege.blocks.skyrim_siege_04.name",
        level: 26,
        size: +2,
        depth: 3,
        chest: 'normal',
        type: 'skyrim-legends-siege',
        bossFloors: [12, 18]
      },
      {
        key: 'skyrim_siege_05',
        name: '氷砦の攻城 V',
        nameKey: "dungeon.types.skyrim_legends_siege.blocks.skyrim_siege_05.name",
        level: 32,
        size: +2,
        depth: 4,
        chest: 'more',
        type: 'skyrim-legends-siege',
        bossFloors: [21]
      },
      {
        key: 'skyrim_siege_06',
        name: '氷砦の攻城 VI',
        nameKey: "dungeon.types.skyrim_legends_siege.blocks.skyrim_siege_06.name",
        level: 38,
        size: +3,
        depth: 4,
        chest: 'abundant',
        type: 'skyrim-legends-siege',
        bossFloors: [24]
      }
    ],
    aurora: [
      {
        key: 'skyrim_aurora_01',
        name: '極光幻想 I',
        nameKey: "dungeon.types.skyrim_legends_aurora.blocks.skyrim_aurora_01.name",
        level: -1,
        size: -1,
        depth: 0,
        chest: 'less',
        type: 'skyrim-legends-aurora'
      },
      {
        key: 'skyrim_aurora_02',
        name: '極光幻想 II',
        nameKey: "dungeon.types.skyrim_legends_aurora.blocks.skyrim_aurora_02.name",
        level: 3,
        size: 0,
        depth: 1,
        chest: 'normal',
        type: 'skyrim-legends-aurora'
      },
      {
        key: 'skyrim_aurora_03',
        name: '極光幻想 III',
        nameKey: "dungeon.types.skyrim_legends_aurora.blocks.skyrim_aurora_03.name",
        level: 7,
        size: 0,
        depth: 1,
        chest: 'more',
        type: 'skyrim-legends-aurora'
      },
      {
        key: 'skyrim_aurora_04',
        name: '極光幻想 IV',
        nameKey: "dungeon.types.skyrim_legends_aurora.blocks.skyrim_aurora_04.name",
        level: 12,
        size: +1,
        depth: 2,
        chest: 'normal',
        type: 'skyrim-legends-aurora',
        bossFloors: [6]
      },
      {
        key: 'skyrim_aurora_05',
        name: '極光幻想 V',
        nameKey: "dungeon.types.skyrim_legends_aurora.blocks.skyrim_aurora_05.name",
        level: 18,
        size: +1,
        depth: 2,
        chest: 'more',
        type: 'skyrim-legends-aurora',
        bossFloors: [9]
      },
      {
        key: 'skyrim_aurora_06',
        name: '極光幻想 VI',
        nameKey: "dungeon.types.skyrim_legends_aurora.blocks.skyrim_aurora_06.name",
        level: 24,
        size: +2,
        depth: 3,
        chest: 'abundant',
        type: 'skyrim-legends-aurora',
        bossFloors: [12]
      }
    ],
    deepdelve: [
      {
        key: 'skyrim_deepdelve_01',
        name: '鍛冶の深淵 I',
        nameKey: "dungeon.types.skyrim_legends_deepdelve.blocks.skyrim_deepdelve_01.name",
        level: 6,
        size: 0,
        depth: 2,
        chest: 'less',
        type: 'skyrim-legends-deepdelve'
      },
      {
        key: 'skyrim_deepdelve_02',
        name: '鍛冶の深淵 II',
        nameKey: "dungeon.types.skyrim_legends_deepdelve.blocks.skyrim_deepdelve_02.name",
        level: 11,
        size: +1,
        depth: 2,
        chest: 'normal',
        type: 'skyrim-legends-deepdelve'
      },
      {
        key: 'skyrim_deepdelve_03',
        name: '鍛冶の深淵 III',
        nameKey: "dungeon.types.skyrim_legends_deepdelve.blocks.skyrim_deepdelve_03.name",
        level: 17,
        size: +1,
        depth: 3,
        chest: 'more',
        type: 'skyrim-legends-deepdelve'
      },
      {
        key: 'skyrim_deepdelve_04',
        name: '鍛冶の深淵 IV',
        nameKey: "dungeon.types.skyrim_legends_deepdelve.blocks.skyrim_deepdelve_04.name",
        level: 23,
        size: +2,
        depth: 3,
        chest: 'normal',
        type: 'skyrim-legends-deepdelve',
        bossFloors: [12, 18]
      },
      {
        key: 'skyrim_deepdelve_05',
        name: '鍛冶の深淵 V',
        nameKey: "dungeon.types.skyrim_legends_deepdelve.blocks.skyrim_deepdelve_05.name",
        level: 29,
        size: +2,
        depth: 4,
        chest: 'more',
        type: 'skyrim-legends-deepdelve',
        bossFloors: [21]
      },
      {
        key: 'skyrim_deepdelve_06',
        name: '鍛冶の深淵 VI',
        nameKey: "dungeon.types.skyrim_legends_deepdelve.blocks.skyrim_deepdelve_06.name",
        level: 35,
        size: +3,
        depth: 4,
        chest: 'abundant',
        type: 'skyrim-legends-deepdelve',
        bossFloors: [24]
      }
    ],
    barrowmarch: [
      {
        key: 'skyrim_barrow_01',
        name: '古墳の夜行 I',
        nameKey: "dungeon.types.skyrim_legends_barrowmarch.blocks.skyrim_barrow_01.name",
        level: 2,
        size: 0,
        depth: 1,
        chest: 'less',
        type: 'skyrim-legends-barrowmarch'
      },
      {
        key: 'skyrim_barrow_02',
        name: '古墳の夜行 II',
        nameKey: "dungeon.types.skyrim_legends_barrowmarch.blocks.skyrim_barrow_02.name",
        level: 8,
        size: 0,
        depth: 1,
        chest: 'normal',
        type: 'skyrim-legends-barrowmarch'
      },
      {
        key: 'skyrim_barrow_03',
        name: '古墳の夜行 III',
        nameKey: "dungeon.types.skyrim_legends_barrowmarch.blocks.skyrim_barrow_03.name",
        level: 14,
        size: +1,
        depth: 2,
        chest: 'more',
        type: 'skyrim-legends-barrowmarch'
      },
      {
        key: 'skyrim_barrow_04',
        name: '古墳の夜行 IV',
        nameKey: "dungeon.types.skyrim_legends_barrowmarch.blocks.skyrim_barrow_04.name",
        level: 20,
        size: +1,
        depth: 2,
        chest: 'normal',
        type: 'skyrim-legends-barrowmarch',
        bossFloors: [9]
      },
      {
        key: 'skyrim_barrow_05',
        name: '古墳の夜行 V',
        nameKey: "dungeon.types.skyrim_legends_barrowmarch.blocks.skyrim_barrow_05.name",
        level: 26,
        size: +2,
        depth: 3,
        chest: 'more',
        type: 'skyrim-legends-barrowmarch',
        bossFloors: [12, 18]
      },
      {
        key: 'skyrim_barrow_06',
        name: '古墳の夜行 VI',
        nameKey: "dungeon.types.skyrim_legends_barrowmarch.blocks.skyrim_barrow_06.name",
        level: 32,
        size: +2,
        depth: 3,
        chest: 'abundant',
        type: 'skyrim-legends-barrowmarch',
        bossFloors: [21]
      }
    ],
    blizzardwatch: [
      {
        key: 'skyrim_blizzard_01',
        name: '吹雪の監視線 I',
        nameKey: "dungeon.types.skyrim_legends_blizzardwatch.blocks.skyrim_blizzard_01.name",
        level: 10,
        size: 0,
        depth: 2,
        chest: 'less',
        type: 'skyrim-legends-blizzardwatch'
      },
      {
        key: 'skyrim_blizzard_02',
        name: '吹雪の監視線 II',
        nameKey: "dungeon.types.skyrim_legends_blizzardwatch.blocks.skyrim_blizzard_02.name",
        level: 16,
        size: +1,
        depth: 2,
        chest: 'normal',
        type: 'skyrim-legends-blizzardwatch'
      },
      {
        key: 'skyrim_blizzard_03',
        name: '吹雪の監視線 III',
        nameKey: "dungeon.types.skyrim_legends_blizzardwatch.blocks.skyrim_blizzard_03.name",
        level: 22,
        size: +1,
        depth: 3,
        chest: 'more',
        type: 'skyrim-legends-blizzardwatch'
      },
      {
        key: 'skyrim_blizzard_04',
        name: '吹雪の監視線 IV',
        nameKey: "dungeon.types.skyrim_legends_blizzardwatch.blocks.skyrim_blizzard_04.name",
        level: 28,
        size: +2,
        depth: 3,
        chest: 'normal',
        type: 'skyrim-legends-blizzardwatch',
        bossFloors: [12, 18]
      },
      {
        key: 'skyrim_blizzard_05',
        name: '吹雪の監視線 V',
        nameKey: "dungeon.types.skyrim_legends_blizzardwatch.blocks.skyrim_blizzard_05.name",
        level: 34,
        size: +2,
        depth: 4,
        chest: 'more',
        type: 'skyrim-legends-blizzardwatch',
        bossFloors: [21]
      },
      {
        key: 'skyrim_blizzard_06',
        name: '吹雪の監視線 VI',
        nameKey: "dungeon.types.skyrim_legends_blizzardwatch.blocks.skyrim_blizzard_06.name",
        level: 40,
        size: +3,
        depth: 4,
        chest: 'abundant',
        type: 'skyrim-legends-blizzardwatch',
        bossFloors: [24]
      }
    ]
  };

  window.registerDungeonAddon({
    id: ADDON_ID,
    name: ADDON_NAME,
    nameKey: "dungeon.packs.skyrim_nordic_legends_pack.name",
    version: VERSION,
    blocks,
    generators
  });
})();

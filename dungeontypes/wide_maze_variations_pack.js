// Addon: Wide Maze Variations Pack - themed expansions for wide-maze layouts
(function(){
  const ADDON_ID = 'wide_maze_variations_pack';
  const ADDON_NAME = 'Wide Maze Variations Pack';
  const VERSION = '1.0.0';

  function clamp(value, min, max){
    return value < min ? min : (value > max ? max : value);
  }

  function sanitizeKey(value){
    return (value || '').toString().trim().replace(/[^a-z0-9]+/gi, '_').toLowerCase();
  }

  function hexToRgb(hex){
    const normalized = (hex || '').toString().trim().replace(/^#/, '');
    if(!/^[0-9a-fA-F]{6}$/.test(normalized)){
      return { r: 0, g: 0, b: 0 };
    }
    return {
      r: parseInt(normalized.slice(0, 2), 16),
      g: parseInt(normalized.slice(2, 4), 16),
      b: parseInt(normalized.slice(4, 6), 16)
    };
  }

  function rgbToHex(rgb){
    const toHex = (v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0');
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  }

  function adjustLightness(hex, delta){
    const rgb = hexToRgb(hex);
    if(delta >= 0){
      const mix = clamp(delta, 0, 1);
      return rgbToHex({
        r: rgb.r + (255 - rgb.r) * mix,
        g: rgb.g + (255 - rgb.g) * mix,
        b: rgb.b + (255 - rgb.b) * mix
      });
    } else {
      const mix = clamp(-delta, 0, 1);
      return rgbToHex({
        r: rgb.r * (1 - mix),
        g: rgb.g * (1 - mix),
        b: rgb.b * (1 - mix)
      });
    }
  }

  function choose(arr, rnd){
    if(!Array.isArray(arr) || arr.length === 0) return arr;
    return arr[Math.floor(rnd() * arr.length) % arr.length];
  }

  function carveRect(ctx, x1, y1, x2, y2){
    const left = Math.min(x1, x2);
    const right = Math.max(x1, x2);
    const top = Math.min(y1, y2);
    const bottom = Math.max(y1, y2);
    for(let y = top; y <= bottom; y++){
      for(let x = left; x <= right; x++){
        if(ctx.inBounds(x, y)){
          ctx.set(x, y, 0);
        }
      }
    }
  }

  function collectFloors(ctx){
    const floors = [];
    for(let y = 1; y < ctx.height - 1; y++){
      for(let x = 1; x < ctx.width - 1; x++){
        if(ctx.get(x, y) === 0){
          floors.push({ x, y });
        }
      }
    }
    return floors;
  }

  function scatterOnFloors(ctx, count, callback){
    const floors = collectFloors(ctx);
    if(!floors.length) return;
    const rnd = ctx.random;
    for(let i = 0; i < count; i++){
      const pick = floors[Math.floor(rnd() * floors.length) % floors.length];
      callback(pick.x, pick.y, i);
    }
  }

  function assignTileMeta(ctx, x, y, values, options){
    if(!values || typeof values !== 'object') return;
    if(!ctx || typeof ctx.getTileMeta !== 'function') return;
    if(typeof ctx.inBounds === 'function' && !ctx.inBounds(x, y)) return;
    let meta = ctx.getTileMeta(x, y);
    if(!meta){
      const ensureColor = options && typeof options.ensureFloorColor === 'string' ? options.ensureFloorColor : null;
      if(ensureColor && typeof ctx.setFloorColor === 'function'){
        ctx.setFloorColor(x, y, ensureColor);
        meta = ctx.getTileMeta(x, y);
      }
    }
    if(!meta) return;
    Object.assign(meta, values);
  }

  function generateWideMazeLayout(ctx, options){
    const rnd = ctx.random;
    const padding = clamp(Math.floor(options && options.padding != null ? options.padding : 2), 1, 6);
    const corridorWidth = clamp(Math.floor(options && options.corridorWidth != null ? options.corridorWidth : 3), 2, 8);
    const cellStep = clamp(Math.floor(options && options.cellStep != null ? options.cellStep : (corridorWidth + 2)), corridorWidth + 1, Math.max(corridorWidth + 2, 9));
    const extraLoops = Math.max(0, Math.floor(options && options.extraLoops != null ? options.extraLoops : 0));

    const cellsX = Math.max(1, Math.floor((ctx.width - padding * 2) / cellStep));
    const cellsY = Math.max(1, Math.floor((ctx.height - padding * 2) / cellStep));
    const visited = Array.from({ length: cellsY }, () => Array(cellsX).fill(false));
    const stack = [];

    function centerOf(cell){
      return {
        x: padding + cell.cx * cellStep,
        y: padding + cell.cy * cellStep
      };
    }

    function carveCell(cell){
      const center = centerOf(cell);
      const half = Math.floor(corridorWidth / 2);
      const offset = corridorWidth % 2 === 0 ? half - 1 : half;
      const left = center.x - half;
      const top = center.y - half;
      const right = corridorWidth % 2 === 0 ? center.x + offset : center.x + half;
      const bottom = corridorWidth % 2 === 0 ? center.y + offset : center.y + half;
      carveRect(ctx, left, top, right, bottom);
      return center;
    }

    function carveBetween(a, b){
      const ac = centerOf(a);
      const bc = centerOf(b);
      carveRect(ctx, ac.x, ac.y, bc.x, bc.y);
    }

    const start = { cx: Math.floor(rnd() * cellsX), cy: Math.floor(rnd() * cellsY) };
    visited[start.cy][start.cx] = true;
    const centers = [carveCell(start)];
    stack.push(start);

    while(stack.length){
      const current = stack[stack.length - 1];
      const dirs = [];
      if(current.cy > 0 && !visited[current.cy - 1][current.cx]) dirs.push({ cx: current.cx, cy: current.cy - 1 });
      if(current.cy < cellsY - 1 && !visited[current.cy + 1][current.cx]) dirs.push({ cx: current.cx, cy: current.cy + 1 });
      if(current.cx > 0 && !visited[current.cy][current.cx - 1]) dirs.push({ cx: current.cx - 1, cy: current.cy });
      if(current.cx < cellsX - 1 && !visited[current.cy][current.cx + 1]) dirs.push({ cx: current.cx + 1, cy: current.cy });

      if(dirs.length === 0){
        stack.pop();
        continue;
      }
      const next = dirs[Math.floor(rnd() * dirs.length)];
      carveBetween(current, next);
      visited[next.cy][next.cx] = true;
      centers.push(carveCell(next));
      stack.push(next);
    }

    for(let i = 0; i < extraLoops; i++){
      const cx = Math.floor(rnd() * (ctx.width - padding * 2)) + padding;
      const cy = Math.floor(rnd() * (ctx.height - padding * 2)) + padding;
      const radius = Math.max(1, Math.floor(corridorWidth / 2));
      carveRect(ctx, cx - radius, cy - radius, cx + radius, cy + radius);
    }

    return {
      centers,
      corridorWidth,
      cellStep,
      padding
    };
  }

  function applyFloorPalette(ctx, palette){
    const rnd = ctx.random;
    const colors = (palette && palette.floors && palette.floors.length) ? palette.floors : ['#bfc3c8'];
    const noise = palette && palette.noise != null ? palette.noise : 0;
    for(let y = 1; y < ctx.height - 1; y++){
      for(let x = 1; x < ctx.width - 1; x++){
        if(ctx.get(x, y) !== 0) continue;
        let base = choose(colors, rnd) || colors[0];
        if(noise > 0){
          const delta = (rnd() - 0.5) * noise;
          base = adjustLightness(base, delta);
        }
        ctx.setFloorColor(x, y, base);
      }
    }
  }

  function applyWallPalette(ctx, palette){
    const rnd = ctx.random;
    const colors = (palette && palette.walls && palette.walls.length) ? palette.walls : ['#2f3439'];
    const noise = palette && palette.wallNoise != null ? palette.wallNoise : 0;
    for(let y = 0; y < ctx.height; y++){
      for(let x = 0; x < ctx.width; x++){
        if(ctx.get(x, y) !== 1) continue;
        let base = choose(colors, rnd) || colors[0];
        if(noise > 0){
          const delta = (rnd() - 0.5) * noise;
          base = adjustLightness(base, delta);
        }
        ctx.setWallColor(x, y, base);
      }
    }
  }

  function createCentralChannel(ctx, opts){
    if(!opts) return;
    const orientation = opts.orientation === 'horizontal' ? 'horizontal' : 'vertical';
    const width = clamp(Math.floor(opts.width || 3), 1, 9);
    const channelColor = opts.color || '#3b6072';
    const floorType = opts.floorType;
    const bridgeColor = opts.bridgeColor || adjustLightness(channelColor, 0.35);
    const bridgeSpacing = clamp(Math.floor(opts.bridgeSpacing || 6), 2, 20);
    const inset = clamp(Math.floor(opts.bridgeInset || 2), 0, 6);

    if(orientation === 'vertical'){
      const mid = Math.floor(ctx.width / 2);
      const startX = clamp(mid - Math.floor(width / 2), 1, ctx.width - 2);
      const endX = clamp(startX + width - 1, 1, ctx.width - 2);
      for(let x = startX; x <= endX; x++){
        for(let y = inset; y < ctx.height - inset; y++){
          if(!ctx.inBounds(x, y)) continue;
          ctx.set(x, y, 0);
          ctx.setFloorColor(x, y, channelColor);
          if(floorType) ctx.setFloorType(x, y, floorType);
        }
      }
      for(let y = inset + bridgeSpacing; y < ctx.height - inset; y += bridgeSpacing){
        for(let x = startX - 2; x <= endX + 2; x++){
          if(!ctx.inBounds(x, y)) continue;
          ctx.set(x, y, 0);
          ctx.setFloorColor(x, y, bridgeColor);
          if(opts.bridgeFloorType) ctx.setFloorType(x, y, opts.bridgeFloorType);
        }
      }
    } else {
      const mid = Math.floor(ctx.height / 2);
      const startY = clamp(mid - Math.floor(width / 2), 1, ctx.height - 2);
      const endY = clamp(startY + width - 1, 1, ctx.height - 2);
      for(let y = startY; y <= endY; y++){
        for(let x = inset; x < ctx.width - inset; x++){
          if(!ctx.inBounds(x, y)) continue;
          ctx.set(x, y, 0);
          ctx.setFloorColor(x, y, channelColor);
          if(floorType) ctx.setFloorType(x, y, floorType);
        }
      }
      for(let x = inset + bridgeSpacing; x < ctx.width - inset; x += bridgeSpacing){
        for(let y = startY - 2; y <= endY + 2; y++){
          if(!ctx.inBounds(x, y)) continue;
          ctx.set(x, y, 0);
          ctx.setFloorColor(x, y, bridgeColor);
          if(opts.bridgeFloorType) ctx.setFloorType(x, y, opts.bridgeFloorType);
        }
      }
    }
  }

  function highlightNeighbors(ctx, origin, radius, color){
    for(let y = origin.y - radius; y <= origin.y + radius; y++){
      for(let x = origin.x - radius; x <= origin.x + radius; x++){
        if(!ctx.inBounds(x, y)) continue;
        if(ctx.get(x, y) === 0){
          ctx.setFloorColor(x, y, color);
        }
      }
    }
  }

  const THEMES = [
    {
      id: 'subterranean-aqueduct',
      name: '地下水路迷宮',
      description: '濁った水路と石造の橋が交差する幅広迷宮。',
      maze: { corridorWidth: 4, cellStep: 5, extraLoops: 6, padding: 2 },
      palette: {
        floors: ['#4c6774', '#415b68', '#3a515d'],
        noise: 0.08,
        walls: ['#1e2d3f', '#1b2633'],
        wallNoise: 0.05
      },
      decorate(ctx){
        createCentralChannel(ctx, {
          orientation: 'vertical',
          width: 3,
          color: '#274a5a',
          floorType: 'water',
          bridgeSpacing: 6,
          bridgeColor: '#7f8a94',
          bridgeFloorType: 'bridge',
          bridgeInset: 2
        });
      },
      mixin: { normalMixed: 0.4, blockDimMixed: 0.45, tags: ['wide-maze', 'water', 'maze'] }
    },
    {
      id: 'abandoned-mine',
      name: '廃坑回廊',
      description: '朽ちた支柱と中央通路が残る鉱山跡の幅広迷路。',
      maze: { corridorWidth: 3, cellStep: 5, extraLoops: 3, padding: 2 },
      palette: {
        floors: ['#6f4f33', '#7b5839', '#5f3f28'],
        noise: 0.1,
        walls: ['#3d1f0e', '#33190a'],
        wallNoise: 0.08
      },
      decorate(ctx){
        createCentralChannel(ctx, {
          orientation: 'horizontal',
          width: 3,
          color: '#8a8f95',
          bridgeSpacing: 7,
          bridgeColor: '#75512f',
          bridgeInset: 2
        });
        scatterOnFloors(ctx, 40, (x, y, i) => {
          if(i % 4 === 0){
            const color = '#9e7b4f';
            ctx.setFloorColor(x, y, color);
            assignTileMeta(ctx, x, y, { supportBeam: true }, { ensureFloorColor: color });
          }
        });
      },
      mixin: { normalMixed: 0.42, blockDimMixed: 0.45, tags: ['wide-maze', 'mine'] }
    },
    {
      id: 'demon-lord-citadel',
      name: '魔王城回廊',
      description: '紫紺の魔力が漂う魔王城の幅広迷宮。',
      maze: { corridorWidth: 4, cellStep: 5, extraLoops: 5, padding: 2 },
      palette: {
        floors: ['#5f3d8a', '#6c48a0', '#55357c'],
        noise: 0.12,
        walls: ['#26113d', '#2f1847'],
        wallNoise: 0.07
      },
      decorate(ctx, state){
        const center = state && state.centers && state.centers.length ? state.centers[Math.floor(state.centers.length / 2)] : { x: Math.floor(ctx.width / 2), y: Math.floor(ctx.height / 2) };
        highlightNeighbors(ctx, center, 2, '#7a4ad9');
        scatterOnFloors(ctx, 30, (x, y, i) => {
          if(i % 5 === 0){
            ctx.setFloorColor(x, y, '#8f63f2');
            assignTileMeta(ctx, x, y, { runeCircle: true });
          }
        });
      },
      mixin: { normalMixed: 0.38, blockDimMixed: 0.42, tags: ['wide-maze', 'castle', 'arcane'], dark: true }
    },
    {
      id: 'moss-clad-ruins',
      name: '苔むした遺跡',
      description: '湿った苔と崩れた壁が連なる古代遺跡の幅広迷宮。',
      maze: { corridorWidth: 3, cellStep: 5, extraLoops: 4, padding: 2 },
      palette: {
        floors: ['#4f6d41', '#5c7b4b', '#426238'],
        noise: 0.09,
        walls: ['#2f3528', '#363c2d'],
        wallNoise: 0.06
      },
      decorate(ctx){
        scatterOnFloors(ctx, 50, (x, y, i) => {
          if(i % 3 === 0){
            ctx.setFloorColor(x, y, '#6f9151');
          }
        });
        for(let y = 1; y < ctx.height - 1; y++){
          for(let x = 1; x < ctx.width - 1; x++){
            if(ctx.get(x, y) === 1 && ctx.random() < 0.08){
              ctx.setWallColor(x, y, '#3b452f');
            }
          }
        }
      },
      mixin: { normalMixed: 0.44, blockDimMixed: 0.46, tags: ['wide-maze', 'ruins', 'nature'] }
    },
    {
      id: 'deep-mineworks',
      name: '鉱山坑道',
      description: '鉱脈の残滓と採掘跡が入り組む幅広迷路。',
      maze: { corridorWidth: 4, cellStep: 6, extraLoops: 5, padding: 3 },
      palette: {
        floors: ['#5c5751', '#6a645d', '#4f4a45'],
        noise: 0.07,
        walls: ['#2b2824', '#332f29'],
        wallNoise: 0.05
      },
      decorate(ctx){
        scatterOnFloors(ctx, 35, (x, y, i) => {
          if(i % 4 === 0){
            ctx.setFloorColor(x, y, '#c27f3a');
            assignTileMeta(ctx, x, y, { ore: true });
          }
        });
        for(let step = 4; step < ctx.width - 4; step += 9){
          carveRect(ctx, step, 2, step + 1, ctx.height - 3);
        }
      },
      mixin: { normalMixed: 0.43, blockDimMixed: 0.47, tags: ['wide-maze', 'mine'] }
    },
    {
      id: 'ember-forge-labyrinth',
      name: '熔鉄鍛冶迷宮',
      description: '灼熱の炉と熔けた鉄が滴る鍛冶場風の幅広迷路。',
      maze: { corridorWidth: 4, cellStep: 5, extraLoops: 6, padding: 2 },
      palette: {
        floors: ['#a34729', '#b3522f', '#8f3c22'],
        noise: 0.11,
        walls: ['#2d1b16', '#361f19'],
        wallNoise: 0.06
      },
      decorate(ctx){
        scatterOnFloors(ctx, 25, (x, y, i) => {
          if(i % 3 === 0){
            ctx.setFloorColor(x, y, '#d36d2f');
          }
          if(i % 7 === 0){
            highlightNeighbors(ctx, { x, y }, 1, '#f5a142');
          }
        });
      },
      mixin: { normalMixed: 0.39, blockDimMixed: 0.43, tags: ['wide-maze', 'fire'], dark: true }
    },
    {
      id: 'crystal-echo-maze',
      name: '水晶響迷宮',
      description: '青白い水晶が反響する幻想的な幅広迷宮。',
      maze: { corridorWidth: 3, cellStep: 5, extraLoops: 5, padding: 2 },
      palette: {
        floors: ['#4b6b87', '#5680a0', '#3e5f7a'],
        noise: 0.1,
        walls: ['#1f2937', '#243042'],
        wallNoise: 0.05
      },
      decorate(ctx){
        scatterOnFloors(ctx, 40, (x, y, i) => {
          if(i % 4 === 0){
            ctx.setFloorColor(x, y, '#8ec5ff');
            assignTileMeta(ctx, x, y, { crystal: true });
          }
        });
      },
      mixin: { normalMixed: 0.41, blockDimMixed: 0.45, tags: ['wide-maze', 'crystal'] }
    },
    {
      id: 'sandstone-terraces',
      name: '砂岩テラス迷宮',
      description: '段差のような砂岩が折り重なる幅広迷宮。',
      maze: { corridorWidth: 3, cellStep: 5, extraLoops: 4, padding: 2 },
      palette: {
        floors: ['#c69c6d', '#b98958', '#d3a472'],
        noise: 0.08,
        walls: ['#8b623b', '#7b5734'],
        wallNoise: 0.05
      },
      decorate(ctx){
        for(let y = 3; y < ctx.height - 3; y += 6){
          for(let x = 2; x < ctx.width - 2; x++){
            if(ctx.inBounds(x, y)){
              ctx.set(x, y, 0);
              ctx.setFloorColor(x, y, '#deb887');
            }
          }
        }
      },
      mixin: { normalMixed: 0.45, blockDimMixed: 0.46, tags: ['wide-maze', 'desert'] }
    },
    {
      id: 'obsidian-catacombs',
      name: '黒曜石地下墓地',
      description: '黒曜石の壁と蒼い燭火が揺らめく幅広迷宮。',
      maze: { corridorWidth: 4, cellStep: 6, extraLoops: 4, padding: 3 },
      palette: {
        floors: ['#2f2a33', '#362f3a', '#2a252e'],
        noise: 0.07,
        walls: ['#18151a', '#1f1a22'],
        wallNoise: 0.04
      },
      decorate(ctx){
        scatterOnFloors(ctx, 28, (x, y, i) => {
          if(i % 3 === 0){
            ctx.setFloorColor(x, y, '#3f4c7d');
            assignTileMeta(ctx, x, y, { lantern: true });
          }
        });
      },
      mixin: { normalMixed: 0.36, blockDimMixed: 0.4, tags: ['wide-maze', 'crypt'], dark: true }
    },
    {
      id: 'twilight-garden-maze',
      name: '薄暮庭園迷宮',
      description: '薄紫の光と幻想的な植物が彩る庭園風幅広迷宮。',
      maze: { corridorWidth: 3, cellStep: 5, extraLoops: 6, padding: 2 },
      palette: {
        floors: ['#6a5f85', '#7b6f93', '#5d5476'],
        noise: 0.1,
        walls: ['#2b2438', '#332b42'],
        wallNoise: 0.05
      },
      decorate(ctx){
        scatterOnFloors(ctx, 45, (x, y, i) => {
          if(i % 3 === 0){
            ctx.setFloorColor(x, y, '#a4c96c');
            assignTileMeta(ctx, x, y, { flora: true });
          } else if(i % 5 === 0){
            ctx.setFloorColor(x, y, '#c8a6e5');
          }
        });
      },
      mixin: { normalMixed: 0.43, blockDimMixed: 0.45, tags: ['wide-maze', 'garden', 'mystic'] }
    }
  ];

  function createGenerator(theme){
    const idKey = sanitizeKey(theme.id);
    const themeMixin = theme.mixin || {};
    const dark = themeMixin.dark;
    const mixin = { normalMixed: 0.4, blockDimMixed: 0.45, tags: ['wide-maze'] };
    for(const key in themeMixin){
      if(!Object.prototype.hasOwnProperty.call(themeMixin, key)) continue;
      if(key === 'dark') continue;
      mixin[key] = themeMixin[key];
    }
    return {
      id: theme.id,
      name: theme.name,
      nameKey: `dungeon.types.${idKey}.name`,
      description: theme.description,
      descriptionKey: `dungeon.types.${idKey}.description`,
      dark: !!dark,
      algorithm(ctx){
        const mazeState = generateWideMazeLayout(ctx, theme.maze || {});
        applyFloorPalette(ctx, theme.palette || {});
        if(typeof theme.decorate === 'function'){
          theme.decorate(ctx, mazeState);
        }
        applyWallPalette(ctx, theme.palette || {});
        ctx.ensureConnectivity();
      },
      mixin
    };
  }

  function mkBoss(depth){
    const result = [];
    if(depth >= 5) result.push(5);
    if(depth >= 10) result.push(10);
    if(depth >= 15) result.push(15);
    return result;
  }

  function createBlockEntries(theme, index){
    const keyBase = sanitizeKey(theme.id);
    const label = theme.name.replace(/\s+/g, ' ');
    const levelBase = 4 * index;
    const entries = [
      {
        key: `${keyBase}_route_01`,
        name: `${label} Route I`,
        level: +levelBase,
        size: 0,
        depth: +1,
        chest: 'normal',
        type: theme.id,
        bossFloors: mkBoss(6)
      },
      {
        key: `${keyBase}_route_02`,
        name: `${label} Route II`,
        level: +(levelBase + 4),
        size: +1,
        depth: +1,
        chest: 'less',
        type: theme.id,
        bossFloors: mkBoss(8)
      },
      {
        key: `${keyBase}_route_03`,
        name: `${label} Route III`,
        level: +(levelBase + 8),
        size: +1,
        depth: +2,
        chest: 'more',
        type: theme.id,
        bossFloors: mkBoss(10)
      },
      {
        key: `${keyBase}_route_04`,
        name: `${label} Route IV`,
        level: +(levelBase + 12),
        size: +2,
        depth: +2,
        chest: 'normal',
        type: theme.id,
        bossFloors: mkBoss(12)
      }
    ];
    return entries.map(entry => {
      const enriched = Object.assign({}, entry);
      enriched.nameKey = `dungeon.types.${keyBase}.blocks.${entry.key}.name`;
      return enriched;
    });
  }

  const generators = THEMES.map(createGenerator);

  const blocks = { blocks1: [], blocks2: [], blocks3: [] };
  THEMES.forEach((theme, index) => {
    const entries = createBlockEntries(theme, index + 1);
    if(entries[0]) blocks.blocks1.push(entries[0]);
    if(entries[1]) blocks.blocks1.push(entries[1]);
    if(entries[2]) blocks.blocks2.push(entries[2]);
    if(entries[3]) blocks.blocks3.push(entries[3]);
  });

  window.registerDungeonAddon({
    id: ADDON_ID,
    name: ADDON_NAME,
    version: VERSION,
    generators,
    blocks
  });
})();

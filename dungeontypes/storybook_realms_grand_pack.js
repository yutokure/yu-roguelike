(function(){
  const ADDON_ID = 'storybook_realms_grand_pack';
  const ADDON_NAME = 'Storybook Realms Grand Pack';
  const VERSION = '1.0.0';

  const palettes = {
    appleBloom: ['#f8f0d4', '#fce4ec', '#ffe9c7', '#d6f5d6'],
    midnightRose: ['#38163a', '#6b275a', '#ae3f7d', '#f4c1e4'],
    lanternGrove: ['#1f2d3a', '#334e57', '#5f8a8b', '#cde4dd'],
    oceanGlass: ['#0b1d3a', '#184c63', '#2a7d8c', '#9fe8f5'],
    crystalFrost: ['#13213d', '#224b6a', '#4a8aac', '#d6f1ff'],
    gingerSpice: ['#3b1b0d', '#6b2f1a', '#a85a2d', '#f8c17a'],
    moonSilk: ['#211f42', '#3d3d7a', '#686ec4', '#dcdcff'],
    emeraldPath: ['#112d1f', '#1c5a37', '#3d9361', '#baf7c9'],
    twilightMauve: ['#241934', '#3f2d55', '#6d4c8d', '#c9a4e5'],
    hearthstone: ['#2f231d', '#4c3a2f', '#7f5b46', '#e4c7a6'],
    sunlitMeadow: ['#23311f', '#375b27', '#5f8a33', '#d9f2a6'],
    carnivalGlow: ['#281829', '#4c1f4f', '#833179', '#ffcbe8'],
    cobaltForge: ['#191d38', '#283257', '#46598a', '#9fb7ff'],
    lilypadLagoon: ['#132b26', '#1f4f43', '#367c68', '#a6f2d8'],
    parchment: ['#312313', '#4f3a21', '#7f6039', '#efd3a9'],
    auroraWing: ['#141a39', '#2a3f67', '#4f79aa', '#d7e9ff'],
    roseGold: ['#352129', '#5c3741', '#936165', '#f0c4b6'],
    starlight: ['#0d182f', '#1c3256', '#365c8d', '#b4d0ff'],
    goldenSpindle: ['#24190d', '#443015', '#7d531f', '#f4d47a'],
    ivyShadow: ['#192820', '#284734', '#457359', '#c9ebcd']
  };

  function sanitizeKey(value){
    return (value || '').toString().trim().replace(/[^a-z0-9]+/gi, '_').toLowerCase();
  }

  function lerpColor(a, b, t){
    const pa = parseInt(a.slice(1), 16);
    const pb = parseInt(b.slice(1), 16);
    const r1 = (pa >> 16) & 0xff;
    const g1 = (pa >> 8) & 0xff;
    const b1 = pa & 0xff;
    const r2 = (pb >> 16) & 0xff;
    const g2 = (pb >> 8) & 0xff;
    const b2 = pb & 0xff;
    const mix = (x1, x2) => Math.round(x1 + (x2 - x1) * t)
      .toString(16)
      .padStart(2, '0');
    return `#${mix(r1, r2)}${mix(g1, g2)}${mix(b1, b2)}`;
  }

  function pick(arr, rnd){
    if(!arr || !arr.length) return '#ffffff';
    return arr[Math.floor(rnd() * arr.length) % arr.length];
  }

  function fillGradientWalls(ctx, top, bottom){
    const { width: W, height: H } = ctx;
    for(let y = 0; y < H; y++){
      const t = H <= 1 ? 0 : y / (H - 1);
      const tone = lerpColor(top, bottom, t);
      for(let x = 0; x < W; x++){
        ctx.set(x, y, 1);
        ctx.setWallColor(x, y, tone);
      }
    }
  }

  function fillFlatWalls(ctx, color){
    const { width: W, height: H } = ctx;
    for(let y = 0; y < H; y++){
      for(let x = 0; x < W; x++){
        ctx.set(x, y, 1);
        ctx.setWallColor(x, y, color);
      }
    }
  }

  function carveCircle(ctx, cx, cy, radius, palette){
    const { inBounds, random, set, setFloorColor } = ctx;
    const r2 = radius * radius;
    for(let y = -radius; y <= radius; y++){
      for(let x = -radius; x <= radius; x++){
        const nx = cx + x;
        const ny = cy + y;
        if(!inBounds(nx, ny)) continue;
        if(x * x + y * y <= r2){
          set(nx, ny, 0);
          setFloorColor(nx, ny, pick(palette, random));
        }
      }
    }
  }

  function carveEllipse(ctx, cx, cy, rx, ry, palette){
    const { inBounds, random, set, setFloorColor } = ctx;
    const rx2 = rx * rx;
    const ry2 = ry * ry;
    for(let y = -ry; y <= ry; y++){
      for(let x = -rx; x <= rx; x++){
        const nx = cx + x;
        const ny = cy + y;
        if(!inBounds(nx, ny)) continue;
        if((x * x) * ry2 + (y * y) * rx2 <= rx2 * ry2){
          set(nx, ny, 0);
          setFloorColor(nx, ny, pick(palette, random));
        }
      }
    }
  }

  function carveRectangle(ctx, x0, y0, x1, y1, palette){
    const { random, set, setFloorColor } = ctx;
    for(let y = y0; y <= y1; y++){
      for(let x = x0; x <= x1; x++){
        if(!ctx.inBounds(x, y)) continue;
        set(x, y, 0);
        setFloorColor(x, y, pick(palette, random));
      }
    }
  }

  function carvePath(ctx, a, b, opts){
    const { random } = ctx;
    const palette = opts.palette || palettes.sunlitMeadow;
    const width = Math.max(1, opts.width || 1);
    const jitter = opts.jitter || 0;
    const steps = Math.max(1, Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y)));
    for(let i = 0; i <= steps; i++){
      const t = steps === 0 ? 0 : i / steps;
      let px = a.x + (b.x - a.x) * t;
      let py = a.y + (b.y - a.y) * t;
      if(jitter){
        px += (random() - 0.5) * jitter;
        py += (random() - 0.5) * jitter;
      }
      const cx = Math.round(px);
      const cy = Math.round(py);
      for(let oy = -width; oy <= width; oy++){
        for(let ox = -width; ox <= width; ox++){
          const tx = cx + ox;
          const ty = cy + oy;
          if(!ctx.inBounds(tx, ty)) continue;
          ctx.set(tx, ty, 0);
          ctx.setFloorColor(tx, ty, pick(palette, random));
        }
      }
    }
  }

  function sprinkleFloor(ctx, palette, chance){
    const { width: W, height: H, random, get, setFloorColor } = ctx;
    for(let y = 1; y < H - 1; y++){
      for(let x = 1; x < W - 1; x++){
        if(get(x, y) === 0 && random() < chance){
          setFloorColor(x, y, pick(palette, random));
        }
      }
    }
  }

  function scatterLights(ctx, palette, count){
    const { width: W, height: H, random, inBounds, set, setFloorColor } = ctx;
    for(let i = 0; i < count; i++){
      const x = 1 + Math.floor(random() * (W - 2));
      const y = 1 + Math.floor(random() * (H - 2));
      const size = 1 + Math.floor(random() * 2);
      for(let oy = -size; oy <= size; oy++){
        for(let ox = -size; ox <= size; ox++){
          const tx = x + ox;
          const ty = y + oy;
          if(!inBounds(tx, ty)) continue;
          if(Math.abs(ox) + Math.abs(oy) <= size){
            set(tx, ty, 0);
            setFloorColor(tx, ty, pick(palette, random));
          }
        }
      }
    }
  }

  function addScatterGroves(ctx, palette, attempts, radiusRange){
    if(!attempts || !palette) return;
    const { width: W, height: H, random } = ctx;
    const minR = Math.max(1, Math.floor(radiusRange?.[0] ?? 1));
    const maxR = Math.max(minR, Math.floor(radiusRange?.[1] ?? minR));
    for(let i = 0; i < attempts; i++){
      const cx = 2 + Math.floor(random() * Math.max(1, W - 4));
      const cy = 2 + Math.floor(random() * Math.max(1, H - 4));
      const radius = Math.max(1, Math.min(maxR, minR + Math.floor(random() * (maxR - minR + 1))));
      carveCircle(ctx, cx, cy, radius, palette);
    }
  }

  function addEdgeEntrances(ctx, palette, count, width, jitter){
    if(!count) return;
    const { width: W, height: H, random } = ctx;
    const laneWidth = Math.max(1, Math.floor(width || 1));
    const laneJitter = jitter ?? 1.2;
    for(let i = 0; i < count; i++){
      const side = Math.floor(random() * 4);
      let start;
      if(side === 0){
        start = { x: 2 + Math.floor(random() * Math.max(1, W - 4)), y: 1 };
      } else if(side === 1){
        start = { x: 2 + Math.floor(random() * Math.max(1, W - 4)), y: H - 2 };
      } else if(side === 2){
        start = { x: 1, y: 2 + Math.floor(random() * Math.max(1, H - 4)) };
      } else {
        start = { x: W - 2, y: 2 + Math.floor(random() * Math.max(1, H - 4)) };
      }
      const target = {
        x: 2 + Math.floor(random() * Math.max(1, W - 4)),
        y: 2 + Math.floor(random() * Math.max(1, H - 4))
      };
      carvePath(ctx, start, target, {
        width: laneWidth,
        palette: palette || palettes.sunlitMeadow,
        jitter: laneJitter
      });
    }
  }

  function addStorySpokes(ctx, palette, count, radiusRange, width){
    if(!count) return;
    const { width: W, height: H, random } = ctx;
    const center = { x: Math.floor(W / 2), y: Math.floor(H / 2) };
    const minR = Math.max(3, radiusRange?.[0] ?? Math.min(center.x, center.y) / 2);
    const maxR = Math.max(minR, radiusRange?.[1] ?? Math.min(center.x, center.y) - 2);
    const laneWidth = Math.max(1, Math.floor(width || 1));
    for(let i = 0; i < count; i++){
      const angle = random() * Math.PI * 2;
      const radius = minR + (maxR - minR) * random();
      const target = {
        x: Math.max(1, Math.min(W - 2, Math.round(center.x + Math.cos(angle) * radius))),
        y: Math.max(1, Math.min(H - 2, Math.round(center.y + Math.sin(angle) * radius)))
      };
      carvePath(ctx, center, target, {
        width: laneWidth,
        palette: palette || palettes.starlight,
        jitter: 0.8
      });
    }
  }

  function gardenLayout(ctx, opts){
    const { width: W, height: H, random } = ctx;
    const nodes = [];
    const margin = opts.margin ?? 5;
    const nodeCount = opts.nodeCount ?? 6;
    const rMin = opts.radiusMin ?? 3;
    const rMax = opts.radiusMax ?? 6;
    for(let i = 0; i < nodeCount; i++){
      nodes.push({
        x: margin + Math.floor(random() * Math.max(1, W - margin * 2)),
        y: margin + Math.floor(random() * Math.max(1, H - margin * 2)),
        r: Math.floor(rMin + random() * (rMax - rMin + 1))
      });
    }
    nodes.forEach(node => carveCircle(ctx, node.x, node.y, node.r, opts.palette));
    for(let i = 1; i < nodes.length; i++){
      carvePath(ctx, nodes[i - 1], nodes[i], {
        width: opts.pathWidth || 2,
        palette: opts.pathPalette || opts.palette,
        jitter: opts.pathJitter || 1.5
      });
    }
    if(opts.extra){
      opts.extra(ctx, nodes);
    }
    if(opts.sparkle){
      sprinkleFloor(ctx, opts.sparklePalette || opts.palette, opts.sparkle);
    }
  }

  function riverLayout(ctx, opts){
    const { width: W, height: H, random, setFloorColor, set } = ctx;
    const channels = opts.channels ?? 3;
    for(let i = 0; i < channels; i++){
      let x = 2 + Math.floor(random() * (W - 4));
      let y = 1;
      while(y < H - 2){
        const width = opts.width ?? 2;
        for(let oy = -width; oy <= width; oy++){
          for(let ox = -width; ox <= width; ox++){
            const tx = x + ox;
            const ty = y + oy;
            if(!ctx.inBounds(tx, ty)) continue;
            set(tx, ty, 0);
            setFloorColor(tx, ty, pick(opts.palette, random));
          }
        }
        if(random() < 0.35) x += random() < 0.5 ? -1 : 1;
        if(random() < 0.2) x += random() < 0.5 ? -1 : 1;
        x = Math.max(2, Math.min(W - 3, x));
        y += 1;
      }
    }
    if(opts.glades){
      const glades = opts.glades;
      for(let i = 0; i < glades.count; i++){
        carveCircle(ctx,
          2 + Math.floor(random() * (W - 4)),
          2 + Math.floor(random() * (H - 4)),
          glades.radius,
          glades.palette || opts.palette);
      }
    }
    if(opts.sparkle){
      sprinkleFloor(ctx, opts.sparklePalette || opts.palette, opts.sparkle);
    }
  }

  function spiralLayout(ctx, opts){
    const { width: W, height: H, random, setFloorColor, set } = ctx;
    const center = { x: Math.floor(W / 2), y: Math.floor(H / 2) };
    const maxR = Math.min(center.x, center.y) - 2;
    const turnStep = opts.turnStep || 3;
    const laneWidth = Math.max(1, opts.width || 1);
    let angle = 0;
    let radius = maxR;
    while(radius > 1){
      const steps = Math.floor(radius * Math.PI * 2);
      for(let i = 0; i < steps; i++){
        const t = i / steps;
        const theta = angle + t * Math.PI * 2;
        const x = Math.round(center.x + Math.cos(theta) * radius);
        const y = Math.round(center.y + Math.sin(theta) * radius);
        for(let oy = -laneWidth; oy <= laneWidth; oy++){
          for(let ox = -laneWidth; ox <= laneWidth; ox++){
            const tx = x + ox;
            const ty = y + oy;
            if(!ctx.inBounds(tx, ty)) continue;
            set(tx, ty, 0);
            setFloorColor(tx, ty, pick(opts.palette, random));
          }
        }
      }
      radius -= turnStep;
      angle += opts.rotate || Math.PI / 4;
    }
    if(opts.sparkle){
      sprinkleFloor(ctx, opts.sparklePalette || opts.palette, opts.sparkle);
    }
  }

  function patchworkLayout(ctx, opts){
    const { width: W, height: H, random } = ctx;
    const cellW = opts.cellWidth || 8;
    const cellH = opts.cellHeight || 6;
    for(let cy = 1; cy < H - 1; cy += cellH){
      for(let cx = 1; cx < W - 1; cx += cellW){
        const roomW = Math.min(cellW - 1, W - cx - 2);
        const roomH = Math.min(cellH - 1, H - cy - 2);
        const palette = opts.paletteVariants ? pick(opts.paletteVariants, random) : opts.palette;
        carveEllipse(ctx,
          cx + Math.floor(roomW / 2),
          cy + Math.floor(roomH / 2),
          Math.max(2, Math.floor(roomW / 2) - 1),
          Math.max(2, Math.floor(roomH / 2) - 1),
          palette);
      }
    }
    const connectors = opts.connectors || 6;
    for(let i = 0; i < connectors; i++){
      const ax = 2 + Math.floor(random() * (W - 4));
      const ay = 2 + Math.floor(random() * (H - 4));
      const bx = 2 + Math.floor(random() * (W - 4));
      const by = 2 + Math.floor(random() * (H - 4));
      carvePath(ctx, { x: ax, y: ay }, { x: bx, y: by }, {
        width: opts.pathWidth || 1,
        palette: opts.pathPalette || opts.palette,
        jitter: 2
      });
    }
    if(opts.sparkle){
      sprinkleFloor(ctx, opts.sparklePalette || opts.palette, opts.sparkle);
    }
  }

  function mazeLayout(ctx, opts){
    const { width: W, height: H, random } = ctx;
    const cellsW = Math.floor((W - 3) / 2);
    const cellsH = Math.floor((H - 3) / 2);
    const visited = new Set();
    function key(x, y){ return `${x},${y}`; }
    const start = { x: Math.floor(random() * cellsW), y: Math.floor(random() * cellsH) };
    const stack = [start];
    while(stack.length){
      const current = stack[stack.length - 1];
      visited.add(key(current.x, current.y));
      const dirs = [
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 }
      ];
      for(let i = dirs.length - 1; i > 0; i--){
        const j = Math.floor(random() * (i + 1));
        const tmp = dirs[i];
        dirs[i] = dirs[j];
        dirs[j] = tmp;
      }
      let carved = false;
      for(const dir of dirs){
        const nx = current.x + dir.x;
        const ny = current.y + dir.y;
        if(nx < 0 || ny < 0 || nx >= cellsW || ny >= cellsH) continue;
        if(visited.has(key(nx, ny))) continue;
        const wx = 2 + current.x * 2;
        const wy = 2 + current.y * 2;
        const ex = 2 + nx * 2;
        const ey = 2 + ny * 2;
        carvePath(ctx, { x: wx, y: wy }, { x: ex, y: ey }, {
          width: opts.width || 1,
          palette: opts.palette
        });
        carved = true;
        stack.push({ x: nx, y: ny });
        break;
      }
      if(!carved){
        stack.pop();
      }
    }
    sprinkleFloor(ctx, opts.sparklePalette || opts.palette, opts.sparkle || 0.08);
  }

  function radialCourts(ctx, opts){
    const { width: W, height: H } = ctx;
    const center = { x: Math.floor(W / 2), y: Math.floor(H / 2) };
    const rings = opts.rings || 4;
    const step = Math.max(2, Math.min(center.x, center.y) / (rings + 1));
    for(let i = 1; i <= rings; i++){
      const radius = Math.floor(step * i);
      carveCircle(ctx, center.x, center.y, radius, opts.palette);
    }
    if(opts.spokes){
      for(let i = 0; i < opts.spokes; i++){
        const angle = (Math.PI * 2 * i) / opts.spokes;
        const ex = center.x + Math.cos(angle) * (rings * step);
        const ey = center.y + Math.sin(angle) * (rings * step);
        carvePath(ctx, center, { x: Math.round(ex), y: Math.round(ey) }, {
          width: opts.spokeWidth || 1,
          palette: opts.palette,
          jitter: 0.5
        });
      }
    }
    if(opts.sparkle){
      sprinkleFloor(ctx, opts.sparklePalette || opts.palette, opts.sparkle);
    }
  }

  function terraceLayout(ctx, opts){
    const { width: W, height: H } = ctx;
    const layers = opts.layers || 5;
    const shrink = opts.shrink || 2;
    let x0 = 2;
    let y0 = 2;
    let x1 = W - 3;
    let y1 = H - 3;
    for(let i = 0; i < layers && x0 < x1 && y0 < y1; i++){
      carveRectangle(ctx, x0, y0, x1, y1, opts.palette);
      x0 += shrink;
      y0 += shrink;
      x1 -= shrink;
      y1 -= shrink;
    }
    if(opts.cross){
      const centerX = Math.floor(W / 2);
      const centerY = Math.floor(H / 2);
      carvePath(ctx, { x: 2, y: centerY }, { x: W - 3, y: centerY }, { width: opts.crossWidth || 1, palette: opts.palette });
      carvePath(ctx, { x: centerX, y: 2 }, { x: centerX, y: H - 3 }, { width: opts.crossWidth || 1, palette: opts.palette });
    }
    if(opts.sparkle){
      sprinkleFloor(ctx, opts.sparklePalette || opts.palette, opts.sparkle);
    }
  }

  function latticeLayout(ctx, opts){
    const { width: W, height: H } = ctx;
    const spacingX = opts.spacingX || 6;
    const spacingY = opts.spacingY || 6;
    for(let y = 2; y < H - 2; y += spacingY){
      carvePath(ctx, { x: 2, y }, { x: W - 3, y }, { width: opts.width || 1, palette: opts.palette });
    }
    for(let x = 2; x < W - 2; x += spacingX){
      carvePath(ctx, { x, y: 2 }, { x, y: H - 3 }, { width: opts.width || 1, palette: opts.palette });
    }
    if(opts.diagonal){
      carvePath(ctx, { x: 2, y: 2 }, { x: W - 3, y: H - 3 }, { width: opts.width || 1, palette: opts.palette });
      carvePath(ctx, { x: W - 3, y: 2 }, { x: 2, y: H - 3 }, { width: opts.width || 1, palette: opts.palette });
    }
    sprinkleFloor(ctx, opts.sparklePalette || opts.palette, opts.sparkle || 0.06);
  }

  function floatingIsles(ctx, opts){
    const { width: W, height: H, random } = ctx;
    const islands = opts.islands || 6;
    let prev = null;
    for(let i = 0; i < islands; i++){
      const cx = 3 + Math.floor(random() * (W - 6));
      const cy = 3 + Math.floor(random() * (H - 6));
      const rx = Math.floor(opts.radiusMin + random() * (opts.radiusMax - opts.radiusMin + 1));
      const ry = Math.max(2, Math.floor(rx * (0.6 + random() * 0.5)));
      carveEllipse(ctx, cx, cy, rx, ry, opts.palette);
      if(opts.bridges && prev){
        carvePath(ctx, prev, { x: cx, y: cy }, {
          width: opts.bridgeWidth || 1,
          palette: opts.bridgePalette || opts.palette,
          jitter: 1.5
        });
      }
      prev = { x: cx, y: cy };
    }
    if(opts.sparkle){
      sprinkleFloor(ctx, opts.sparklePalette || opts.palette, opts.sparkle);
    }
  }

  function branchingTrails(ctx, opts){
    const { width: W, height: H, random } = ctx;
    const hubs = opts.hubs || 4;
    const nodes = [];
    for(let i = 0; i < hubs; i++){
      const x = 3 + Math.floor(random() * (W - 6));
      const y = 3 + Math.floor(random() * (H - 6));
      carveCircle(ctx, x, y, opts.hubRadius || 3, opts.palette);
      nodes.push({ x, y });
    }
    nodes.forEach((origin, index) => {
      const branches = opts.branches || 3;
      for(let b = 0; b < branches; b++){
        const target = nodes[(index + b + 1) % nodes.length];
        carvePath(ctx, origin, target, {
          width: opts.pathWidth || 1,
          palette: opts.pathPalette || opts.palette,
          jitter: 2
        });
      }
    });
    if(opts.sparkle){
      sprinkleFloor(ctx, opts.sparklePalette || opts.palette, opts.sparkle);
    }
  }

  function createVariantBuilder(variants){
    const normalized = variants.map(entry => {
      if(typeof entry === 'function'){
        return { weight: 1, build: entry };
      }
      return {
        weight: entry.weight ?? 1,
        build: entry.build
      };
    }).filter(entry => typeof entry.build === 'function' && entry.weight > 0);
    return function(ctx){
      if(!normalized.length) return;
      const { random = Math.random } = ctx;
      const total = normalized.reduce((sum, entry) => sum + entry.weight, 0);
      let roll = random() * total;
      let chosen = normalized[normalized.length - 1];
      for(const entry of normalized){
        roll -= entry.weight;
        if(roll <= 0){
          chosen = entry;
          break;
        }
      }
      chosen.build(ctx);
    };
  }

  const generatorData = [
    {
      id: 'enchanted-apple-orchard',
      name: '魔法の林檎園の道',
      description: '林檎の木立が輪になって結ぶ優しい庭園の回廊',
      wallGradient: ['#1a261b', '#3d5131'],
      build: createVariantBuilder([
        ctx => {
          gardenLayout(ctx, {
            palette: palettes.appleBloom,
            nodeCount: 7,
            radiusMin: 3,
            radiusMax: 5,
            sparkle: 0.14
          });
          addScatterGroves(ctx, palettes.appleBloom, 2, [2, 3]);
          addEdgeEntrances(ctx, palettes.sunlitMeadow, 2, 1, 1);
        },
        ctx => {
          gardenLayout(ctx, {
            palette: palettes.appleBloom,
            nodeCount: 8,
            radiusMin: 2,
            radiusMax: 4,
            pathWidth: 2,
            pathPalette: palettes.sunlitMeadow,
            sparkle: 0.1
          });
          const reach = Math.min(ctx.width, ctx.height) * 0.45;
          addStorySpokes(ctx, palettes.appleBloom, 4, [reach * 0.6, reach], 1);
          scatterLights(ctx, palettes.appleBloom, 3);
        },
        {
          weight: 0.6,
          build(ctx){
            gardenLayout(ctx, {
              palette: palettes.appleBloom,
              nodeCount: 6,
              radiusMin: 3,
              radiusMax: 6,
              pathWidth: 1,
              sparkle: 0.16
            });
            addScatterGroves(ctx, palettes.sunlitMeadow, 3, [1, 2]);
            addEdgeEntrances(ctx, palettes.emeraldPath, 3, 1, 1.5);
          }
        }
      ]),
      tags: ['garden', 'orchard', 'fairytale']
    },
    {
      id: 'glass-slipper-ballroom',
      name: '硝子の舞踏会場',
      description: '螺旋舞踏の痕跡が重なる煌めきの舞踏会広間',
      wallGradient: ['#211c3a', '#453f73'],
      build: createVariantBuilder([
        ctx => {
          spiralLayout(ctx, {
            palette: palettes.moonSilk,
            width: 2,
            turnStep: 2,
            rotate: Math.PI / 3,
            sparkle: 0.2
          });
          scatterLights(ctx, palettes.moonSilk, 6);
        },
        ctx => {
          spiralLayout(ctx, {
            palette: palettes.moonSilk,
            width: 1,
            turnStep: 3,
            rotate: Math.PI / 4,
            sparkle: 0.16
          });
          const reach = Math.min(ctx.width, ctx.height) * 0.42;
          addStorySpokes(ctx, palettes.moonSilk, 6, [reach * 0.5, reach], 1);
          addEdgeEntrances(ctx, palettes.moonSilk, 2, 1, 0.8);
        },
        {
          weight: 0.7,
          build(ctx){
            spiralLayout(ctx, {
              palette: palettes.moonSilk,
              width: 1,
              turnStep: 2,
              rotate: Math.PI / 2.5,
              sparkle: 0.14
            });
            radialCourts(ctx, {
              palette: palettes.moonSilk,
              rings: 3,
              spokes: 6,
              spokeWidth: 1,
              sparkle: 0.12
            });
            scatterLights(ctx, palettes.moonSilk, 4);
          }
        }
      ]),
      tags: ['ballroom', 'spiral', 'royal']
    },
    {
      id: 'gingerbread-crumb-trail',
      name: 'ジンジャーブレッドの屑道',
      description: '甘い香り漂う菓子小屋と曲がり道が点在する森の道筋',
      wallGradient: ['#2e1a12', '#5b3624'],
      build: createVariantBuilder([
        ctx => {
          patchworkLayout(ctx, {
            palette: palettes.gingerSpice,
            paletteVariants: [palettes.gingerSpice, palettes.hearthstone],
            connectors: 7,
            pathWidth: 1,
            sparkle: 0.1
          });
          addScatterGroves(ctx, palettes.hearthstone, 2, [1, 2]);
        },
        ctx => {
          patchworkLayout(ctx, {
            palette: palettes.gingerSpice,
            paletteVariants: [palettes.gingerSpice, palettes.hearthstone],
            cellWidth: 8,
            cellHeight: 5,
            connectors: 6,
            pathWidth: 2,
            pathPalette: palettes.sunlitMeadow,
            sparkle: 0.12
          });
          addEdgeEntrances(ctx, palettes.gingerSpice, 3, 1, 1.3);
        },
        {
          weight: 0.7,
          build(ctx){
            patchworkLayout(ctx, {
              palette: palettes.gingerSpice,
              paletteVariants: [palettes.gingerSpice, palettes.hearthstone, palettes.parchment],
              cellWidth: 7,
              cellHeight: 6,
              connectors: 8,
              pathWidth: 1,
              sparkle: 0.14
            });
            const reach = Math.min(ctx.width, ctx.height) * 0.4;
            addStorySpokes(ctx, palettes.hearthstone, 4, [reach * 0.5, reach], 1);
          }
        }
      ]),
      tags: ['forest', 'sweets', 'paths']
    },
    {
      id: 'emerald-city-boulevard',
      name: 'エメラルド街の大通り',
      description: '光る敷石と規則的な街路が迷宮のように伸びる都市庭園',
      wallGradient: ['#102919', '#245c36'],
      build: createVariantBuilder([
        ctx => {
          latticeLayout(ctx, {
            palette: palettes.emeraldPath,
            spacingX: 6,
            spacingY: 6,
            width: 1,
            sparkle: 0.08
          });
        },
        ctx => {
          latticeLayout(ctx, {
            palette: palettes.emeraldPath,
            spacingX: 5,
            spacingY: 7,
            width: 1,
            diagonal: true,
            sparkle: 0.1
          });
          addEdgeEntrances(ctx, palettes.emeraldPath, 3, 1, 0.9);
        },
        {
          weight: 0.75,
          build(ctx){
            latticeLayout(ctx, {
              palette: palettes.emeraldPath,
              spacingX: 7,
              spacingY: 5,
              width: 2,
              sparkle: 0.07
            });
            radialCourts(ctx, {
              palette: palettes.emeraldPath,
              rings: 3,
              spokes: 4,
              spokeWidth: 1,
              sparkle: 0.06
            });
            addScatterGroves(ctx, palettes.emeraldPath, 2, [2, 3]);
          }
        }
      ]),
      tags: ['city', 'grid', 'emerald']
    },
    {
      id: 'sleeping-spindle-spire',
      name: '眠りの紡ぎ塔',
      description: '紡錘の輪が塔を巡る静かな螺旋の尖塔',
      wallGradient: ['#1e1421', '#4a2a3b'],
      build: createVariantBuilder([
        ctx => {
          radialCourts(ctx, {
            palette: palettes.goldenSpindle,
            rings: 4,
            spokes: 8,
            spokeWidth: 1,
            sparkle: 0.12
          });
        },
        ctx => {
          radialCourts(ctx, {
            palette: palettes.goldenSpindle,
            rings: 5,
            spokes: 10,
            spokeWidth: 1,
            sparkle: 0.1
          });
          const reach = Math.min(ctx.width, ctx.height) * 0.48;
          addStorySpokes(ctx, palettes.goldenSpindle, 5, [reach * 0.6, reach], 1);
        },
        {
          weight: 0.65,
          build(ctx){
            spiralLayout(ctx, {
              palette: palettes.goldenSpindle,
              width: 1,
              turnStep: 2,
              rotate: Math.PI / 3,
              sparkle: 0.1
            });
            radialCourts(ctx, {
              palette: palettes.goldenSpindle,
              rings: 3,
              spokes: 6,
              spokeWidth: 1,
              sparkle: 0.1
            });
            scatterLights(ctx, palettes.goldenSpindle, 4);
          }
        }
      ]),
      tags: ['tower', 'spiral', 'sleep']
    },
    {
      id: 'little-mermaid-grotto',
      name: '人魚姫の珊瑚洞',
      description: '潮の流れが水路を刻む光る珊瑚の洞窟',
      wallGradient: ['#0f1f36', '#1e4c63'],
      build: createVariantBuilder([
        ctx => {
          riverLayout(ctx, {
            palette: palettes.oceanGlass,
            channels: 4,
            width: 2,
            glades: { count: 4, radius: 3, palette: palettes.lilypadLagoon },
            sparkle: 0.18
          });
        },
        ctx => {
          riverLayout(ctx, {
            palette: palettes.oceanGlass,
            channels: 3,
            width: 3,
            glades: { count: 3, radius: 4, palette: palettes.lilypadLagoon },
            sparkle: 0.16
          });
          addEdgeEntrances(ctx, palettes.oceanGlass, 2, 1, 1.1);
          scatterLights(ctx, palettes.lilypadLagoon, 5);
        },
        {
          weight: 0.8,
          build(ctx){
            riverLayout(ctx, {
              palette: palettes.oceanGlass,
              channels: 5,
              width: 2,
              glades: { count: 5, radius: 3, palette: palettes.crystalFrost },
              sparkle: 0.2
            });
            addScatterGroves(ctx, palettes.lilypadLagoon, 3, [2, 3]);
          }
        }
      ]),
      tags: ['water', 'cave', 'mermaid']
    },
    {
      id: 'wonderland-checkerboard',
      name: '不思議の国の盤庭',
      description: '色とりどりの盤が並ぶ不規則な庭園広場',
      wallGradient: ['#1f1630', '#3a2d52'],
      build: createVariantBuilder([
        ctx => {
          patchworkLayout(ctx, {
            palette: palettes.carnivalGlow,
            paletteVariants: [palettes.carnivalGlow, palettes.twilightMauve, palettes.moonSilk],
            cellWidth: 7,
            cellHeight: 7,
            connectors: 8,
            pathWidth: 2,
            sparkle: 0.16
          });
        },
        ctx => {
          patchworkLayout(ctx, {
            palette: palettes.carnivalGlow,
            paletteVariants: [palettes.carnivalGlow, palettes.twilightMauve, palettes.moonSilk, palettes.parchment],
            cellWidth: 6,
            cellHeight: 6,
            connectors: 10,
            pathWidth: 1,
            pathPalette: palettes.twilightMauve,
            sparkle: 0.14
          });
          addEdgeEntrances(ctx, palettes.carnivalGlow, 3, 1, 1.4);
        },
        {
          weight: 0.7,
          build(ctx){
            patchworkLayout(ctx, {
              palette: palettes.carnivalGlow,
              paletteVariants: [palettes.carnivalGlow, palettes.moonSilk],
              cellWidth: 8,
              cellHeight: 5,
              connectors: 7,
              pathWidth: 2,
              sparkle: 0.18
            });
            mazeLayout(ctx, {
              palette: palettes.twilightMauve,
              width: 1,
              sparkle: 0.08,
              sparklePalette: palettes.moonSilk
            });
          }
        }
      ]),
      tags: ['maze', 'garden', 'wonderland']
    },
    {
      id: 'frozen-crystal-palace',
      name: '氷晶の宮殿',
      description: '氷の輝きが層状に広がる冷たい宮殿の回廊',
      wallGradient: ['#102039', '#254a70'],
      build: createVariantBuilder([
        ctx => {
          terraceLayout(ctx, {
            palette: palettes.crystalFrost,
            layers: 6,
            shrink: 2,
            cross: true,
            crossWidth: 1,
            sparkle: 0.22
          });
        },
        ctx => {
          terraceLayout(ctx, {
            palette: palettes.crystalFrost,
            layers: 5,
            shrink: 2,
            cross: true,
            crossWidth: 2,
            sparkle: 0.2
          });
          addStorySpokes(ctx, palettes.crystalFrost, 4, [Math.min(ctx.width, ctx.height) * 0.4, Math.min(ctx.width, ctx.height) * 0.5], 1);
          scatterLights(ctx, palettes.crystalFrost, 5);
        },
        {
          weight: 0.75,
          build(ctx){
            terraceLayout(ctx, {
              palette: palettes.crystalFrost,
              layers: 7,
              shrink: 2,
              cross: false,
              sparkle: 0.18
            });
            radialCourts(ctx, {
              palette: palettes.crystalFrost,
              rings: 3,
              spokes: 6,
              spokeWidth: 1,
              sparkle: 0.14
            });
          }
        }
      ]),
      tags: ['palace', 'ice', 'terrace']
    },
    {
      id: 'beanstalk-floating-isles',
      name: '豆の木の浮島路',
      description: '蔦が絡む浮遊島が吊り橋で繋がる天空の道',
      wallGradient: ['#15251b', '#284834'],
      build: createVariantBuilder([
        ctx => {
          floatingIsles(ctx, {
            palette: palettes.sunlitMeadow,
            islands: 7,
            radiusMin: 2,
            radiusMax: 4,
            bridges: true,
            bridgePalette: palettes.emeraldPath,
            bridgeWidth: 1,
            sparkle: 0.14
          });
        },
        ctx => {
          floatingIsles(ctx, {
            palette: palettes.sunlitMeadow,
            islands: 8,
            radiusMin: 2,
            radiusMax: 5,
            bridges: true,
            bridgePalette: palettes.emeraldPath,
            bridgeWidth: 2,
            sparkle: 0.12
          });
          addEdgeEntrances(ctx, palettes.sunlitMeadow, 2, 1, 1.2);
        },
        {
          weight: 0.8,
          build(ctx){
            floatingIsles(ctx, {
              palette: palettes.sunlitMeadow,
              islands: 6,
              radiusMin: 3,
              radiusMax: 5,
              bridges: true,
              bridgePalette: palettes.emeraldPath,
              bridgeWidth: 1,
              sparkle: 0.16
            });
            addStorySpokes(ctx, palettes.emeraldPath, 4, [Math.min(ctx.width, ctx.height) * 0.35, Math.min(ctx.width, ctx.height) * 0.5], 1);
            scatterLights(ctx, palettes.sunlitMeadow, 4);
          }
        }
      ]),
      tags: ['sky', 'floating', 'vine']
    },
    {
      id: 'alchemists-lamp-bazaar',
      name: '魔法のランプ市街路',
      description: '市場通りが層をなして香辛料の香りが漂う迷宮市街',
      wallGradient: ['#241419', '#4a2430'],
      build: createVariantBuilder([
        ctx => {
          mazeLayout(ctx, {
            palette: palettes.roseGold,
            width: 1,
            sparkle: 0.09
          });
          scatterLights(ctx, palettes.roseGold, 5);
        },
        ctx => {
          mazeLayout(ctx, {
            palette: palettes.roseGold,
            width: 2,
            sparkle: 0.11,
            sparklePalette: palettes.goldenSpindle
          });
          addEdgeEntrances(ctx, palettes.roseGold, 3, 1, 1.2);
          scatterLights(ctx, palettes.goldenSpindle, 4);
        },
        {
          weight: 0.85,
          build(ctx){
            mazeLayout(ctx, {
              palette: palettes.roseGold,
              width: 1,
              sparkle: 0.1,
              sparklePalette: palettes.goldenSpindle
            });
            patchworkLayout(ctx, {
              palette: palettes.roseGold,
              paletteVariants: [palettes.roseGold, palettes.goldenSpindle, palettes.parchment],
              cellWidth: 6,
              cellHeight: 5,
              connectors: 6,
              pathWidth: 1,
              sparkle: 0.09
            });
            scatterLights(ctx, palettes.roseGold, 4);
          }
        }
      ]),
      tags: ['market', 'maze', 'desert']
    },
    {
      id: 'red-hood-forest-trail',
      name: '赤ずきんの森小径',
      description: '分岐だらけの森道が狼の影をかわしながら続く',
      wallGradient: ['#141f18', '#2b3d2d'],
      build: createVariantBuilder([
        ctx => {
          branchingTrails(ctx, {
            palette: palettes.ivyShadow,
            hubs: 5,
            hubRadius: 3,
            branches: 3,
            pathWidth: 1,
            sparkle: 0.1
          });
        },
        ctx => {
          branchingTrails(ctx, {
            palette: palettes.ivyShadow,
            hubs: 6,
            hubRadius: 3,
            branches: 4,
            pathWidth: 2,
            pathPalette: palettes.appleBloom,
            sparkle: 0.12
          });
          addEdgeEntrances(ctx, palettes.ivyShadow, 2, 1, 1.2);
        },
        {
          weight: 0.85,
          build(ctx){
            branchingTrails(ctx, {
              palette: palettes.ivyShadow,
              hubs: 5,
              hubRadius: 4,
              branches: 4,
              pathWidth: 1,
              pathPalette: palettes.appleBloom,
              sparkle: 0.11
            });
            addScatterGroves(ctx, palettes.appleBloom, 3, [1, 2]);
            mazeLayout(ctx, {
              palette: palettes.ivyShadow,
              width: 1,
              sparkle: 0.08,
              sparklePalette: palettes.appleBloom
            });
          }
        }
      ]),
      tags: ['forest', 'trail', 'story']
    },
    {
      id: 'snow-white-cottage-ring',
      name: '白雪姫の小人集落',
      description: '小屋が輪状に並ぶ穏やかな森の集落',
      wallGradient: ['#1c2318', '#334528'],
      build: createVariantBuilder([
        ctx => {
          gardenLayout(ctx, {
            palette: palettes.hearthstone,
            nodeCount: 6,
            radiusMin: 2,
            radiusMax: 4,
            pathWidth: 1,
            sparkle: 0.09,
            extra(innerCtx, nodes){
              const center = nodes[0];
              nodes.slice(1).forEach(node => {
                carvePath(innerCtx, center, node, {
                  width: 1,
                  palette: palettes.hearthstone,
                  jitter: 1
                });
              });
            }
          });
        },
        ctx => {
          gardenLayout(ctx, {
            palette: palettes.hearthstone,
            nodeCount: 7,
            radiusMin: 2,
            radiusMax: 5,
            pathWidth: 2,
            pathPalette: palettes.appleBloom,
            sparkle: 0.1,
            extra(innerCtx, nodes){
              nodes.forEach((node, index) => {
                const next = nodes[(index + 1) % nodes.length];
                carvePath(innerCtx, node, next, {
                  width: 1,
                  palette: palettes.appleBloom,
                  jitter: 1.2
                });
              });
            }
          });
          addScatterGroves(ctx, palettes.appleBloom, 3, [1, 2]);
        },
        {
          weight: 0.8,
          build(ctx){
            gardenLayout(ctx, {
              palette: palettes.hearthstone,
              nodeCount: 5,
              radiusMin: 3,
              radiusMax: 5,
              pathWidth: 1,
              sparkle: 0.11,
              extra(innerCtx, nodes){
                const hub = nodes[0];
                nodes.slice(1).forEach(node => {
                  carvePath(innerCtx, hub, node, {
                    width: 1,
                    palette: palettes.hearthstone,
                    jitter: 0.8
                  });
                });
              }
            });
            addEdgeEntrances(ctx, palettes.hearthstone, 2, 1, 1.2);
            const reach = Math.min(ctx.width, ctx.height) * 0.4;
            addStorySpokes(ctx, palettes.appleBloom, 3, [reach * 0.5, reach], 1);
          }
        }
      ]),
      tags: ['village', 'forest', 'circle']
    },
    {
      id: 'twelve-dancing-halls',
      name: '十二姉妹の舞踏廊',
      description: '連なる舞踏室が秘密の抜け道で繋がる地下迷路',
      wallGradient: ['#1d1631', '#3a2a5b'],
      build: createVariantBuilder([
        ctx => {
          mazeLayout(ctx, {
            palette: palettes.midnightRose,
            width: 2,
            sparkle: 0.12
          });
        },
        ctx => {
          mazeLayout(ctx, {
            palette: palettes.midnightRose,
            width: 1,
            sparkle: 0.1,
            sparklePalette: palettes.moonSilk
          });
          addStorySpokes(ctx, palettes.moonSilk, 4, [Math.min(ctx.width, ctx.height) * 0.45, Math.min(ctx.width, ctx.height) * 0.55], 1);
        },
        {
          weight: 0.7,
          build(ctx){
            mazeLayout(ctx, {
              palette: palettes.midnightRose,
              width: 2,
              sparkle: 0.11,
              sparklePalette: palettes.moonSilk
            });
            radialCourts(ctx, {
              palette: palettes.moonSilk,
              rings: 3,
              spokes: 6,
              spokeWidth: 1,
              sparkle: 0.1
            });
          }
        }
      ]),
      tags: ['maze', 'dance', 'underground']
    },
    {
      id: 'pied-piper-catacombs',
      name: '笛吹きの地下回廊',
      description: '音の通り道が交錯する石造りの地下回廊',
      wallGradient: ['#1a1d2b', '#2f384e'],
      build: createVariantBuilder([
        ctx => {
          terraceLayout(ctx, {
            palette: palettes.cobaltForge,
            layers: 5,
            shrink: 2,
            cross: true,
            crossWidth: 2,
            sparkle: 0.08
          });
        },
        ctx => {
          terraceLayout(ctx, {
            palette: palettes.cobaltForge,
            layers: 6,
            shrink: 2,
            cross: true,
            crossWidth: 1,
            sparkle: 0.07
          });
          addEdgeEntrances(ctx, palettes.cobaltForge, 2, 1, 1.3);
        },
        {
          weight: 0.75,
          build(ctx){
            terraceLayout(ctx, {
              palette: palettes.cobaltForge,
              layers: 4,
              shrink: 3,
              cross: true,
              crossWidth: 2,
              sparkle: 0.09
            });
            mazeLayout(ctx, {
              palette: palettes.cobaltForge,
              width: 1,
              sparkle: 0.07,
              sparklePalette: palettes.starlight
            });
          }
        }
      ]),
      tags: ['underground', 'music', 'stone']
    },
    {
      id: 'rapunzels-lantern-terrace',
      name: 'ラプンツェルの灯籠テラス',
      description: '灯籠の光が並ぶ段状の庭園と空中回廊',
      wallGradient: ['#1b1a32', '#3e355f'],
      build: createVariantBuilder([
        ctx => {
          terraceLayout(ctx, {
            palette: palettes.auroraWing,
            layers: 4,
            shrink: 3,
            cross: false,
            sparkle: 0.18
          });
          scatterLights(ctx, palettes.auroraWing, 6);
        },
        ctx => {
          terraceLayout(ctx, {
            palette: palettes.auroraWing,
            layers: 5,
            shrink: 2,
            cross: true,
            crossWidth: 1,
            sparkle: 0.16
          });
          scatterLights(ctx, palettes.auroraWing, 8);
          addStorySpokes(ctx, palettes.auroraWing, 3, [Math.min(ctx.width, ctx.height) * 0.4, Math.min(ctx.width, ctx.height) * 0.5], 1);
        },
        {
          weight: 0.75,
          build(ctx){
            terraceLayout(ctx, {
              palette: palettes.auroraWing,
              layers: 4,
              shrink: 3,
              cross: false,
              sparkle: 0.17
            });
            floatingIsles(ctx, {
              palette: palettes.auroraWing,
              islands: 4,
              radiusMin: 2,
              radiusMax: 3,
              bridges: true,
              bridgePalette: palettes.moonSilk,
              bridgeWidth: 1,
              sparkle: 0.12
            });
            scatterLights(ctx, palettes.moonSilk, 5);
          }
        }
      ]),
      tags: ['tower', 'terrace', 'lantern']
    },
    {
      id: 'brave-tailor-parade',
      name: '勇敢な仕立屋の行進路',
      description: '城下町を縫うように路地が走る石畳の行進路',
      wallGradient: ['#261c21', '#4a3238'],
      build: createVariantBuilder([
        ctx => {
          latticeLayout(ctx, {
            palette: palettes.parchment,
            spacingX: 5,
            spacingY: 7,
            width: 1,
            diagonal: true,
            sparkle: 0.07
          });
        },
        ctx => {
          latticeLayout(ctx, {
            palette: palettes.parchment,
            spacingX: 6,
            spacingY: 6,
            width: 1,
            diagonal: true,
            sparkle: 0.09
          });
          addEdgeEntrances(ctx, palettes.parchment, 3, 1, 1.4);
        },
        {
          weight: 0.8,
          build(ctx){
            latticeLayout(ctx, {
              palette: palettes.parchment,
              spacingX: 7,
              spacingY: 5,
              width: 2,
              diagonal: true,
              sparkle: 0.06
            });
            patchworkLayout(ctx, {
              palette: palettes.parchment,
              paletteVariants: [palettes.parchment, palettes.roseGold, palettes.appleBloom],
              cellWidth: 7,
              cellHeight: 6,
              connectors: 5,
              pathWidth: 1,
              sparkle: 0.08
            });
          }
        }
      ]),
      tags: ['city', 'parade', 'stone']
    },
    {
      id: 'rumpelstiltskin-workshop',
      name: 'ルンペルシュティルツヒェンの紡ぎ工房',
      description: '黄金糸が巡る工房と炉の間が複雑に繋がる',
      wallGradient: ['#2b1b16', '#553327'],
      build: createVariantBuilder([
        ctx => {
          patchworkLayout(ctx, {
            palette: palettes.goldenSpindle,
            paletteVariants: [palettes.goldenSpindle, palettes.hearthstone, palettes.roseGold],
            cellWidth: 6,
            cellHeight: 5,
            connectors: 9,
            pathWidth: 1,
            sparkle: 0.15
          });
        },
        ctx => {
          patchworkLayout(ctx, {
            palette: palettes.goldenSpindle,
            paletteVariants: [palettes.goldenSpindle, palettes.hearthstone, palettes.roseGold],
            cellWidth: 7,
            cellHeight: 6,
            connectors: 8,
            pathWidth: 2,
            pathPalette: palettes.hearthstone,
            sparkle: 0.13
          });
          addEdgeEntrances(ctx, palettes.goldenSpindle, 3, 1, 1.2);
        },
        {
          weight: 0.85,
          build(ctx){
            patchworkLayout(ctx, {
              palette: palettes.goldenSpindle,
              paletteVariants: [palettes.goldenSpindle, palettes.hearthstone, palettes.roseGold, palettes.parchment],
              cellWidth: 6,
              cellHeight: 5,
              connectors: 10,
              pathWidth: 1,
              sparkle: 0.17
            });
            mazeLayout(ctx, {
              palette: palettes.goldenSpindle,
              width: 1,
              sparkle: 0.08,
              sparklePalette: palettes.roseGold
            });
          }
        }
      ]),
      tags: ['workshop', 'gold', 'maze']
    },
    {
      id: 'crystal-carriage-waystation',
      name: '水晶馬車の宿駅',
      description: '夜空に映える馬車道と煌めく待避所が交差する駅',
      wallGradient: ['#131c2f', '#264167'],
      build: createVariantBuilder([
        ctx => {
          radialCourts(ctx, {
            palette: palettes.starlight,
            rings: 3,
            spokes: 6,
            sparkle: 0.19
          });
          scatterLights(ctx, palettes.starlight, 4);
        },
        ctx => {
          radialCourts(ctx, {
            palette: palettes.starlight,
            rings: 4,
            spokes: 8,
            sparkle: 0.17
          });
          addEdgeEntrances(ctx, palettes.starlight, 2, 1, 1.1);
          scatterLights(ctx, palettes.starlight, 6);
        },
        {
          weight: 0.75,
          build(ctx){
            radialCourts(ctx, {
              palette: palettes.starlight,
              rings: 3,
              spokes: 5,
              sparkle: 0.18
            });
            spiralLayout(ctx, {
              palette: palettes.starlight,
              width: 1,
              turnStep: 3,
              rotate: Math.PI / 3,
              sparkle: 0.14
            });
            scatterLights(ctx, palettes.starlight, 5);
          }
        }
      ]),
      tags: ['road', 'station', 'night']
    },
    {
      id: 'tortoise-hare-raceway',
      name: '兎と亀の競争路',
      description: 'アップダウンのある周回コースが折り返す森の競技場',
      wallGradient: ['#182516', '#2f4a28'],
      build: createVariantBuilder([
        ctx => {
          branchingTrails(ctx, {
            palette: palettes.sunlitMeadow,
            hubs: 4,
            hubRadius: 4,
            branches: 4,
            pathWidth: 2,
            sparkle: 0.08
          });
        },
        ctx => {
          branchingTrails(ctx, {
            palette: palettes.sunlitMeadow,
            hubs: 5,
            hubRadius: 4,
            branches: 4,
            pathWidth: 2,
            pathPalette: palettes.emeraldPath,
            sparkle: 0.09
          });
          addEdgeEntrances(ctx, palettes.sunlitMeadow, 3, 2, 1.4);
        },
        {
          weight: 0.85,
          build(ctx){
            branchingTrails(ctx, {
              palette: palettes.sunlitMeadow,
              hubs: 4,
              hubRadius: 5,
              branches: 5,
              pathWidth: 2,
              pathPalette: palettes.emeraldPath,
              sparkle: 0.1
            });
            addStorySpokes(ctx, palettes.sunlitMeadow, 4, [Math.min(ctx.width, ctx.height) * 0.45, Math.min(ctx.width, ctx.height) * 0.55], 2);
          }
        }
      ]),
      tags: ['race', 'forest', 'loop']
    },
    {
      id: 'storybook-grand-castle',
      name: '物語の大城郭',
      description: '幾重もの郭と水路が守る壮大な童話城郭',
      wallGradient: ['#1b1e2f', '#34405b'],
      build: createVariantBuilder([
        ctx => {
          terraceLayout(ctx, {
            palette: palettes.lanternGrove,
            layers: 6,
            shrink: 2,
            cross: true,
            crossWidth: 2,
            sparkle: 0.1
          });
          gardenLayout(ctx, {
            palette: palettes.lanternGrove,
            nodeCount: 5,
            radiusMin: 2,
            radiusMax: 4,
            pathWidth: 1,
            sparkle: 0.06
          });
        },
        ctx => {
          terraceLayout(ctx, {
            palette: palettes.lanternGrove,
            layers: 7,
            shrink: 2,
            cross: true,
            crossWidth: 2,
            sparkle: 0.12
          });
          gardenLayout(ctx, {
            palette: palettes.lanternGrove,
            nodeCount: 6,
            radiusMin: 2,
            radiusMax: 5,
            pathWidth: 2,
            pathPalette: palettes.emeraldPath,
            sparkle: 0.08
          });
          addEdgeEntrances(ctx, palettes.lanternGrove, 3, 2, 1.3);
        },
        {
          weight: 0.8,
          build(ctx){
            terraceLayout(ctx, {
              palette: palettes.lanternGrove,
              layers: 5,
              shrink: 3,
              cross: true,
              crossWidth: 3,
              sparkle: 0.11
            });
            gardenLayout(ctx, {
              palette: palettes.lanternGrove,
              nodeCount: 5,
              radiusMin: 3,
              radiusMax: 5,
              pathWidth: 1,
              sparkle: 0.07,
              extra(innerCtx, nodes){
                const center = nodes[0];
                nodes.slice(1).forEach(node => {
                  carvePath(innerCtx, center, node, {
                    width: 1,
                    palette: palettes.emeraldPath,
                    jitter: 1.1
                  });
                });
              }
            });
            addStorySpokes(ctx, palettes.lanternGrove, 4, [Math.min(ctx.width, ctx.height) * 0.45, Math.min(ctx.width, ctx.height) * 0.55], 2);
          }
        }
      ]),
      tags: ['castle', 'grand', 'waterway']
    }
  ];

  function createGenerators(){
    return generatorData.map((def, index) => {
      return {
        id: def.id,
        name: def.name,
        nameKey: `dungeon.types.${sanitizeKey(def.id)}.name`,
        description: def.description,
        descriptionKey: `dungeon.types.${sanitizeKey(def.id)}.description`,
        algorithm(ctx){
          if(def.wallGradient){
            fillGradientWalls(ctx, def.wallGradient[0], def.wallGradient[1]);
          } else {
            fillFlatWalls(ctx, '#1b1b30');
          }
          def.build(ctx);
          ctx.ensureConnectivity();
        },
        mixin: {
          normalMixed: 0.62 - (index % 5) * 0.02,
          blockDimMixed: 0.7 - (index % 7) * 0.01,
          tags: def.tags || ['fairytale']
        }
      };
    });
  }

  function createBlocks(){
    const blocks1 = [];
    const blocks2 = [];
    const blocks3 = [];
    generatorData.forEach((def, index) => {
      const keyBase = sanitizeKey(def.id);
      const levelBase = 22 + index * 2;
      blocks1.push({
        key: `${keyBase}_path`,
        name: `${def.name}・遊歩`,
        nameKey: `dungeon.types.${keyBase}.blocks.${keyBase}_path.name`,
        level: levelBase,
        size: (index % 5) - 2,
        depth: 2 + (index % 3),
        chest: index % 2 === 0 ? 'normal' : 'more',
        type: def.id,
        bossFloors: [5, 10, 15].filter(v => v <= 15)
      });
      blocks2.push({
        key: `${keyBase}_court`,
        name: `${def.name}・中枢`,
        nameKey: `dungeon.types.${keyBase}.blocks.${keyBase}_court.name`,
        level: levelBase + 3,
        size: (index % 4) - 1,
        depth: 3 + (index % 4),
        chest: index % 3 === 0 ? 'more' : 'normal',
        type: def.id
      });
      blocks3.push({
        key: `${keyBase}_legend`,
        name: `${def.name}・秘宝`,
        nameKey: `dungeon.types.${keyBase}.blocks.${keyBase}_legend.name`,
        level: levelBase + 6,
        size: (index % 3),
        depth: 4 + (index % 5),
        chest: index % 4 === 0 ? 'less' : 'more',
        type: def.id,
        bossFloors: [12, 18, 24].filter(v => v <= 24)
      });
    });

    const dimensions = [
      {
        key: 'storybook_courtyard',
        name: '童話中庭界',
        nameKey: 'dungeon.dimensions.storybook_courtyard.name',
        baseLevel: 28
      },
      {
        key: 'moonlit_festival_realm',
        name: '月灯祭の界層',
        nameKey: 'dungeon.dimensions.moonlit_festival_realm.name',
        baseLevel: 34
      },
      {
        key: 'crystal_fair_reach',
        name: '水晶童話境',
        nameKey: 'dungeon.dimensions.crystal_fair_reach.name',
        baseLevel: 40
      }
    ];

    return { blocks1, blocks2, blocks3, dimensions };
  }

  const addon = {
    id: ADDON_ID,
    name: ADDON_NAME,
    nameKey: 'dungeon.packs.storybook_realms_grand_pack.name',
    version: VERSION,
    api: '1.0.0',
    description: [
      '童話の世界から着想を得た20種類のダンジョン生成タイプに複数のバリエーションを備え、',
      '浮遊島や螺旋塔、灯籠庭園などが冒険ごとに異なる構成で立ち現れる大型追加パックです。'
    ].join(''),
    descriptionKey: 'dungeon.packs.storybook_realms_grand_pack.description',
    generators: createGenerators(),
    blocks: createBlocks()
  };

  window.registerDungeonAddon(addon);
})();

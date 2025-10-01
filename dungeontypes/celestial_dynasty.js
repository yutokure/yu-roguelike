(function(){
  const ADDON_ID = 'celestial_dynasty_pack';
  const ADDON_NAME = '華夏王朝拡張パック';
  const VERSION = '1.2.0';

  function clamp(value, min, max) {
    return value < min ? min : (value > max ? max : value);
  }

  function randomFloat(ctx) {
    return ctx.random ? ctx.random() : Math.random();
  }

  function hexToRgb(hex) {
    const sanitized = hex.replace('#', '');
    const bigint = parseInt(sanitized, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255
    };
  }

  function rgbToHex({ r, g, b }) {
    const toHex = (value) => {
      const clamped = clamp(Math.round(value), 0, 255);
      return clamped.toString(16).padStart(2, '0');
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  function blendHex(a, b, t) {
    const aRgb = hexToRgb(a);
    const bRgb = hexToRgb(b);
    return rgbToHex({
      r: aRgb.r + (bRgb.r - aRgb.r) * t,
      g: aRgb.g + (bRgb.g - aRgb.g) * t,
      b: aRgb.b + (bRgb.b - aRgb.b) * t
    });
  }

  function jitterHex(hex, amount, ctx) {
    if (!amount) return hex;
    const rgb = hexToRgb(hex);
    const factor = (randomFloat(ctx) * 2 - 1) * amount * 255;
    return rgbToHex({
      r: rgb.r + factor,
      g: rgb.g + factor * 0.8,
      b: rgb.b + factor * 0.6
    });
  }

  function gradientColorAt(gradient, x, y, fallback) {
    if (!gradient) return fallback;
    if (gradient.type === 'radial') {
      const cx = gradient.centerX;
      const cy = gradient.centerY;
      const radius = Math.max(1, gradient.radius);
      const inner = gradient.inner ?? fallback;
      const outer = gradient.outer ?? fallback;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const t = clamp(dist / radius, 0, 1);
      return blendHex(inner, outer, t);
    }
    if (gradient.type === 'linear') {
      const ox = gradient.originX;
      const oy = gradient.originY;
      const tx = gradient.targetX;
      const ty = gradient.targetY;
      const dx = tx - ox;
      const dy = ty - oy;
      const lengthSq = dx * dx + dy * dy || 1;
      const dot = ((x - ox) * dx + (y - oy) * dy) / lengthSq;
      const t = clamp(dot, 0, 1);
      const start = gradient.start ?? fallback;
      const end = gradient.end ?? fallback;
      return blendHex(start, end, t);
    }
    if (gradient.type === 'banded' && Array.isArray(gradient.bands)) {
      const bands = gradient.bands;
      const bandWidth = gradient.bandWidth ?? 4;
      const axis = gradient.axis ?? 'x';
      const coord = axis === 'y' ? y : x;
      const index = Math.floor((coord - (gradient.offset ?? 0)) / bandWidth);
      return bands[Math.abs(index % bands.length)] ?? fallback;
    }
    return fallback;
  }

  function fillSolid(ctx, value) {
    const v = value ? 1 : 0;
    for (let y = 0; y < ctx.height; y++) {
      for (let x = 0; x < ctx.width; x++) {
        ctx.set(x, y, v);
      }
    }
  }

  function carveRect(ctx, x0, y0, x1, y1) {
    const minX = Math.max(1, Math.min(x0, x1));
    const maxX = Math.min(ctx.width - 2, Math.max(x0, x1));
    const minY = Math.max(1, Math.min(y0, y1));
    const maxY = Math.min(ctx.height - 2, Math.max(y0, y1));
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        ctx.set(x, y, 0);
      }
    }
  }

  function carveRing(ctx, cx, cy, radius, thickness = 1) {
    const r = Math.max(2, radius);
    const t = clamp(Math.floor(thickness), 1, r - 1);
    const outer2 = r * r;
    const inner = Math.max(0, r - t);
    const inner2 = inner * inner;
    for (let y = cy - r - 1; y <= cy + r + 1; y++) {
      for (let x = cx - r - 1; x <= cx + r + 1; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const d2 = dx * dx + dy * dy;
        if (d2 <= outer2 && d2 >= inner2 && ctx.inBounds(x, y)) {
          ctx.set(x, y, 0);
        }
      }
    }
  }

  function carveLine(ctx, x0, y0, x1, y1, width = 1) {
    let dx = Math.abs(x1 - x0);
    let sx = x0 < x1 ? 1 : -1;
    let dy = -Math.abs(y1 - y0);
    let sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    const half = Math.max(0, Math.floor(width / 2));
    while (true) {
      for (let yy = -half; yy <= half; yy++) {
        for (let xx = -half; xx <= half; xx++) {
          const tx = x0 + xx;
          const ty = y0 + yy;
          if (ctx.inBounds(tx, ty)) ctx.set(tx, ty, 0);
        }
      }
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) {
        err += dy;
        x0 += sx;
      }
      if (e2 <= dx) {
        err += dx;
        y0 += sy;
      }
    }
  }

  function randomInt(ctx, min, max) {
    if (max <= min) return min;
    const r = randomFloat(ctx);
    return Math.floor(r * (max - min + 1)) + min;
  }

  function applyPalette(ctx, palette, options = {}) {
    const accentStride = options.accentStride ?? 5;
    const accentChance = options.accentChance ?? 0.08;
    const accentColor = options.accentColor ?? palette.accent;
    const gradient = options.gradient;
    const wallGradient = options.wallGradient;
    const floorNoise = options.floorNoise ?? 0;
    const wallNoise = options.wallNoise ?? 0;
    for (let y = 1; y < ctx.height - 1; y++) {
      for (let x = 1; x < ctx.width - 1; x++) {
        if (ctx.get(x, y) === 0) {
          let color = palette.floor;
          if (accentColor && (((x + y) % accentStride === 0) || randomFloat(ctx) < accentChance)) {
            color = accentColor;
          }
          color = gradientColorAt(gradient, x, y, color);
          color = jitterHex(color, floorNoise, ctx);
          ctx.setFloorColor(x, y, color);
        } else {
          let color = palette.wall;
          color = gradientColorAt(wallGradient, x, y, color);
          color = jitterHex(color, wallNoise, ctx);
          ctx.setWallColor(x, y, color);
        }
      }
    }
  }

  function sprinkleLanterns(ctx, color, chance = 0.04) {
    for (let y = 2; y < ctx.height - 2; y++) {
      for (let x = 2; x < ctx.width - 2; x++) {
        if (ctx.get(x, y) === 0 && randomFloat(ctx) < chance) {
          ctx.setFloorColor(x, y, color);
        }
      }
    }
  }

  function carveStar(ctx, cx, cy, radius, arms = 5) {
    const points = [];
    const innerRadius = Math.max(1, radius / 2);
    for (let i = 0; i < arms * 2; i++) {
      const angle = (Math.PI * i) / arms;
      const r = i % 2 === 0 ? radius : innerRadius;
      const x = Math.round(cx + Math.cos(angle) * r);
      const y = Math.round(cy + Math.sin(angle) * r);
      points.push({ x, y });
    }
    ctx.carvePath(points.concat(points[0]), 2);
  }

  function carveSpiral(ctx, cx, cy, turns, step, thickness) {
    const points = [];
    const maxRadius = Math.min(ctx.width, ctx.height) / 2 - 2;
    const total = Math.max(1, Math.floor(turns * 24));
    for (let i = 0; i <= total; i++) {
      const t = i / total;
      const angle = t * Math.PI * 2 * turns;
      const radius = step * t * maxRadius;
      const x = Math.round(cx + Math.cos(angle) * radius);
      const y = Math.round(cy + Math.sin(angle) * radius);
      points.push({ x, y });
    }
    ctx.carvePath(points, thickness);
  }

  function algorithmImperialCourtyard(ctx) {
    const { width: W, height: H } = ctx;
    fillSolid(ctx, 1);
    const padding = 2;
    carveRect(ctx, padding, padding, W - padding - 1, H - padding - 1);

    const courtyardWidth = Math.floor(W * 0.4);
    const courtyardHeight = Math.floor(H * 0.4);
    const cx0 = Math.floor((W - courtyardWidth) / 2);
    const cy0 = Math.floor((H - courtyardHeight) / 2);
    carveRect(ctx, cx0, cy0, cx0 + courtyardWidth, cy0 + courtyardHeight);

    for (let i = 0; i < 4; i++) {
      const offset = Math.floor((i + 1) * W / 10);
      carveLine(ctx, offset, padding + 1, offset, H - padding - 2, 1 + (i % 2));
      carveLine(ctx, padding + 1, offset, W - padding - 2, offset, 1 + ((i + 1) % 2));
    }

    const gateWidth = Math.max(2, Math.floor(W / 12));
    carveRect(ctx, cx0, padding, cx0 + gateWidth, padding + 1);
    carveRect(ctx, cx0, H - padding - 2, cx0 + gateWidth, H - padding - 1);
    carveRect(ctx, padding, cy0, padding + 1, cy0 + gateWidth);
    carveRect(ctx, W - padding - 2, cy0, W - padding - 1, cy0 + gateWidth);

    carveRing(ctx, Math.floor(W / 2), Math.floor(H / 2), Math.floor(Math.min(W, H) / 4), 2);
    carveRing(ctx, Math.floor(W / 2), Math.floor(H / 2), Math.floor(Math.min(W, H) / 6), 1);

    applyPalette(ctx, {
      floor: '#c85c5c',
      wall: '#401010',
      accent: '#ffd166'
    }, {
      accentStride: 6,
      accentChance: 0.1,
      gradient: {
        type: 'radial',
        centerX: W / 2,
        centerY: H / 2,
        radius: Math.min(W, H) / 1.8,
        inner: '#d46a6a',
        outer: '#8c1f28'
      },
      wallGradient: {
        type: 'linear',
        originX: 1,
        originY: 1,
        targetX: W - 2,
        targetY: H - 2,
        start: '#401010',
        end: '#240808'
      },
      floorNoise: 0.04,
      wallNoise: 0.02
    });
    sprinkleLanterns(ctx, '#ffef8b', 0.05);
    ctx.ensureConnectivity();
  }

  function algorithmLotusLabyrinth(ctx) {
    const { width: W, height: H } = ctx;
    fillSolid(ctx, 1);
    const rings = 4;
    for (let i = 0; i < rings; i++) {
      const radius = Math.floor(Math.min(W, H) / 2) - 2 - i * 2;
      carveRing(ctx, Math.floor(W / 2), Math.floor(H / 2), radius, 1);
    }

    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      const x0 = Math.floor(W / 2 + Math.cos(angle) * (Math.min(W, H) / 2 - 4));
      const y0 = Math.floor(H / 2 + Math.sin(angle) * (Math.min(W, H) / 2 - 4));
      carveLine(ctx, Math.floor(W / 2), Math.floor(H / 2), x0, y0, i % 2 === 0 ? 2 : 1);
    }

    for (let i = 0; i < 6; i++) {
      const angle = Math.PI / 3 * i + (randomFloat(ctx) * 0.4);
      const radius = Math.min(W, H) / 4 + randomFloat(ctx) * 3;
      const cx = Math.floor(W / 2 + Math.cos(angle) * radius);
      const cy = Math.floor(H / 2 + Math.sin(angle) * radius);
      carveRing(ctx, cx, cy, 3 + randomInt(ctx, 0, 2), 1 + randomInt(ctx, 0, 1));
    }

    applyPalette(ctx, {
      floor: '#7ad1b3',
      wall: '#184f45',
      accent: '#c2f970'
    }, {
      accentStride: 5,
      accentChance: 0.12,
      accentColor: '#f7f48b',
      gradient: {
        type: 'radial',
        centerX: W / 2,
        centerY: H / 2,
        radius: Math.min(W, H) / 2.2,
        inner: '#bde4c9',
        outer: '#59b89a'
      },
      wallGradient: {
        type: 'banded',
        axis: 'y',
        bandWidth: 3,
        bands: ['#133c33', '#1f5e4d']
      },
      floorNoise: 0.05
    });
    sprinkleLanterns(ctx, '#f7f48b', 0.06);
    ctx.ensureConnectivity();
  }

  function algorithmSilkMarket(ctx) {
    const { width: W, height: H } = ctx;
    fillSolid(ctx, 1);

    for (let y = 2; y < H - 2; y += 3) {
      carveLine(ctx, 1, y, W - 2, y, 1);
    }
    for (let x = 2; x < W - 2; x += 4) {
      carveLine(ctx, x, 1, x, H - 2, 1);
    }

    for (let y = 2; y < H - 3; y += 3) {
      for (let x = 2; x < W - 3; x += 4) {
        if (randomFloat(ctx) < 0.6) {
          carveRect(ctx, x + 1, y + 1, x + 2, y + 1);
        }
        if (randomFloat(ctx) < 0.3) {
          carveRect(ctx, x + 1, y + 1, x + 2, y + 2);
        }
      }
    }

    for (let i = 0; i < 3; i++) {
      const y = randomInt(ctx, 3, H - 4);
      carveLine(ctx, 1, y, W - 2, y, 2);
    }

    applyPalette(ctx, {
      floor: '#f3c5b5',
      wall: '#744e32',
      accent: '#f08a5d'
    }, {
      accentStride: 4,
      accentChance: 0.15,
      gradient: {
        type: 'linear',
        originX: 2,
        originY: H / 2,
        targetX: W - 2,
        targetY: H / 2,
        start: '#f3b799',
        end: '#f7d6bf'
      },
      wallGradient: {
        type: 'banded',
        axis: 'x',
        bandWidth: 5,
        bands: ['#5f3b24', '#7d5232']
      },
      floorNoise: 0.06,
      wallNoise: 0.04
    });
    sprinkleLanterns(ctx, '#ffb677', 0.04);
    ctx.ensureConnectivity();
  }

  function algorithmGreatWall(ctx) {
    const { width: W, height: H } = ctx;
    fillSolid(ctx, 1);
    carveRect(ctx, 2, 2, W - 3, H - 3);
    const pathWidth = 3;
    for (let x = 2; x < W - 2; x++) {
      if ((x % 5) < 3) {
        carveRect(ctx, x, 2, x, H - 3);
      }
    }
    for (let y = 2; y < H - 2; y++) {
      if ((y % 4) < 2) {
        carveRect(ctx, 2, y, W - 3, y);
      }
    }

    for (let i = 0; i < 6; i++) {
      const cx = randomInt(ctx, 4, W - 5);
      const cy = randomInt(ctx, 4, H - 5);
      carveRect(ctx, cx - 1, cy - 1, cx + 1, cy + 1);
    }

    carveLine(ctx, 2, Math.floor(H / 2), W - 3, Math.floor(H / 2), pathWidth);
    carveLine(ctx, Math.floor(W / 2), 2, Math.floor(W / 2), H - 3, pathWidth);

    applyPalette(ctx, {
      floor: '#b7b5a4',
      wall: '#4a4332',
      accent: '#f9e784'
    }, {
      accentStride: 6,
      accentChance: 0.1,
      accentColor: '#f9e784',
      gradient: {
        type: 'linear',
        originX: 2,
        originY: 2,
        targetX: 2,
        targetY: H - 2,
        start: '#d3d0c0',
        end: '#948e77'
      },
      wallGradient: {
        type: 'radial',
        centerX: W / 2,
        centerY: H / 2,
        radius: Math.max(W, H) / 2,
        inner: '#3d3528',
        outer: '#1f1a13'
      },
      floorNoise: 0.03,
      wallNoise: 0.02
    });
    sprinkleLanterns(ctx, '#ffe26f', 0.03);
    ctx.ensureConnectivity();
  }

  function algorithmDragonSpine(ctx) {
    const { width: W, height: H } = ctx;
    fillSolid(ctx, 1);
    const spinePoints = [];
    const segments = 12;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = Math.floor(2 + t * (W - 4));
      const wave = Math.sin(t * Math.PI * 2) * (H / 4);
      const y = Math.floor(H / 2 + wave * (0.6 + randomFloat(ctx) * 0.2));
      spinePoints.push({ x, y });
    }
    ctx.carvePath(spinePoints, 3);

    for (const point of spinePoints) {
      const size = randomInt(ctx, 3, 5);
      carveRect(ctx, point.x - size, point.y - 1, point.x + size, point.y + 1);
      if (randomFloat(ctx) < 0.45) {
        carveRect(ctx, point.x - 1, point.y - size, point.x + 1, point.y + size);
      }
    }

    for (let i = 0; i < 6; i++) {
      const cx = randomInt(ctx, 3, W - 4);
      const cy = randomInt(ctx, 3, H - 4);
      const radius = randomInt(ctx, 2, 4);
      carveRing(ctx, cx, cy, radius, 1);
    }

    applyPalette(ctx, {
      floor: '#c1666b',
      wall: '#2b1d1f',
      accent: '#f0c808'
    }, {
      accentStride: 5,
      accentChance: 0.14,
      gradient: {
        type: 'linear',
        originX: 2,
        originY: H / 2,
        targetX: W - 2,
        targetY: H / 2,
        start: '#dd7f7b',
        end: '#a33b46'
      },
      wallGradient: {
        type: 'banded',
        axis: 'y',
        bandWidth: 4,
        bands: ['#1f1416', '#382122']
      },
      floorNoise: 0.05,
      wallNoise: 0.03
    });
    sprinkleLanterns(ctx, '#f0c808', 0.05);
    ctx.ensureConnectivity();
  }

  function algorithmScholarArchive(ctx) {
    const { width: W, height: H } = ctx;
    fillSolid(ctx, 1);
    const aisleSpacing = 4;
    for (let x = 2; x < W - 2; x += aisleSpacing) {
      carveRect(ctx, x, 2, x + 1, H - 3);
    }
    for (let y = 3; y < H - 3; y += 6) {
      carveRect(ctx, 2, y, W - 3, y);
      carveRect(ctx, 2, y + 2, W - 3, y + 2);
    }

    carveRect(ctx, 4, 4, W - 5, H - 5);
    carveRect(ctx, Math.floor(W / 2) - 2, 2, Math.floor(W / 2) + 2, H - 3);
    carveRect(ctx, 2, Math.floor(H / 2) - 2, W - 3, Math.floor(H / 2) + 2);

    applyPalette(ctx, {
      floor: '#e8d4b8',
      wall: '#5b4636',
      accent: '#d9ad77'
    }, {
      accentStride: 3,
      accentChance: 0.18,
      gradient: {
        type: 'linear',
        originX: 2,
        originY: 2,
        targetX: W - 2,
        targetY: 2,
        start: '#f2e2cc',
        end: '#d8b994'
      },
      wallGradient: {
        type: 'linear',
        originX: 2,
        originY: H - 3,
        targetX: W - 2,
        targetY: 3,
        start: '#4b372a',
        end: '#6b5240'
      },
      floorNoise: 0.04,
      wallNoise: 0.03
    });
    sprinkleLanterns(ctx, '#ffdca2', 0.05);
    ctx.ensureConnectivity();
  }

  function algorithmMoonlitWaterways(ctx) {
    const { width: W, height: H } = ctx;
    fillSolid(ctx, 1);
    const channels = 5;
    for (let i = 0; i < channels; i++) {
      const offset = Math.floor((i + 1) * H / (channels + 1));
      ctx.carvePath([
        { x: 2, y: offset },
        { x: Math.floor(W / 3), y: offset + randomInt(ctx, -2, 2) },
        { x: Math.floor((2 * W) / 3), y: offset + randomInt(ctx, -3, 3) },
        { x: W - 3, y: offset + randomInt(ctx, -2, 2) }
      ], 2);
    }

    for (let i = 0; i < 8; i++) {
      const x = randomInt(ctx, 3, W - 4);
      const y = randomInt(ctx, 3, H - 4);
      carveRect(ctx, x - 1, y - 1, x + 1, y + 1);
    }

    for (let y = 2; y < H - 2; y++) {
      for (let x = 2; x < W - 2; x++) {
        if (ctx.get(x, y) === 0 && randomFloat(ctx) < 0.2) {
          ctx.setFloorType(x, y, 'ice');
        }
      }
    }

    applyPalette(ctx, {
      floor: '#8ab6d6',
      wall: '#1b2430',
      accent: '#d6e6f2'
    }, {
      accentStride: 7,
      accentChance: 0.08,
      gradient: {
        type: 'linear',
        originX: 2,
        originY: 2,
        targetX: W - 2,
        targetY: H - 2,
        start: '#5fa8d3',
        end: '#d6e6f2'
      },
      wallGradient: {
        type: 'radial',
        centerX: W / 2,
        centerY: H / 2,
        radius: Math.max(W, H) / 1.8,
        inner: '#253149',
        outer: '#0c121c'
      },
      floorNoise: 0.06,
      wallNoise: 0.03
    });
    sprinkleLanterns(ctx, '#f6f4f0', 0.03);
    ctx.ensureConnectivity();
  }

  function algorithmCelestialObservatory(ctx) {
    const { width: W, height: H } = ctx;
    fillSolid(ctx, 1);
    const cx = Math.floor(W / 2);
    const cy = Math.floor(H / 2);
    const outerRadius = Math.floor(Math.min(W, H) / 2) - 2;

    for (let r = outerRadius; r > 3; r -= 3) {
      carveRing(ctx, cx, cy, r, 2);
    }

    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const x = Math.floor(cx + Math.cos(angle) * (outerRadius - 1));
      const y = Math.floor(cy + Math.sin(angle) * (outerRadius - 1));
      carveLine(ctx, cx, cy, x, y, i % 2 === 0 ? 3 : 2);
    }

    carveStar(ctx, cx, cy, Math.floor(outerRadius / 3), 6);

    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5 + randomFloat(ctx) * 0.3;
      const distance = outerRadius * 0.55 + randomFloat(ctx) * 2;
      const sx = Math.floor(cx + Math.cos(angle) * distance);
      const sy = Math.floor(cy + Math.sin(angle) * distance);
      carveStar(ctx, sx, sy, 4, 5);
    }

    applyPalette(ctx, {
      floor: '#f8d49d',
      wall: '#2f195f',
      accent: '#ffe66d'
    }, {
      accentStride: 8,
      accentChance: 0.1,
      gradient: {
        type: 'radial',
        centerX: cx,
        centerY: cy,
        radius: outerRadius,
        inner: '#ffe6a7',
        outer: '#7f5af0'
      },
      wallGradient: {
        type: 'linear',
        originX: cx,
        originY: 1,
        targetX: cx,
        targetY: H - 2,
        start: '#1a103d',
        end: '#3d2c8d'
      },
      floorNoise: 0.05,
      wallNoise: 0.03
    });

    sprinkleLanterns(ctx, '#fffee0', 0.06);
    ctx.ensureConnectivity();
  }

  function algorithmJadeTerraces(ctx) {
    const { width: W, height: H } = ctx;
    fillSolid(ctx, 1);
    const steps = 5;
    const inset = 2;
    for (let i = 0; i < steps; i++) {
      const offset = inset + i * 2;
      carveRect(ctx, offset, offset, W - offset - 1, H - offset - 1);
      if (i % 2 === 0) {
        carveLine(ctx, offset, Math.floor(H / 2), W - offset - 1, Math.floor(H / 2), 2);
      }
    }

    for (let i = 0; i < 4; i++) {
      const cx = randomInt(ctx, 4, W - 5);
      const cy = randomInt(ctx, 4, H - 5);
      carveRing(ctx, cx, cy, 3 + (i % 2), 1);
      if (randomFloat(ctx) < 0.4) {
        ctx.setFloorType(cx, cy, 'water');
      }
    }

    for (let x = 3; x < W - 3; x += 3) {
      carveLine(ctx, x, 3, x, H - 4, (x / 3) % 2 === 0 ? 1 : 2);
    }

    applyPalette(ctx, {
      floor: '#9ad2ba',
      wall: '#2e5234',
      accent: '#d4f2c4'
    }, {
      accentStride: 5,
      accentChance: 0.12,
      gradient: {
        type: 'banded',
        axis: 'y',
        bandWidth: 4,
        offset: 2,
        bands: ['#7bc4b2', '#9ad2ba', '#bde0c1']
      },
      wallGradient: {
        type: 'linear',
        originX: 2,
        originY: H - 2,
        targetX: W - 2,
        targetY: 2,
        start: '#203b2b',
        end: '#3f6c44'
      },
      floorNoise: 0.04,
      wallNoise: 0.02
    });

    sprinkleLanterns(ctx, '#f4f9c4', 0.05);
    ctx.ensureConnectivity();
  }

  function algorithmLanternFestival(ctx) {
    const { width: W, height: H } = ctx;
    fillSolid(ctx, 1);

    const rows = 6;
    for (let i = 0; i < rows; i++) {
      const y = Math.floor((i + 1) * H / (rows + 1));
      carveLine(ctx, 2, y, W - 3, y, 2 + (i % 2));
    }

    for (let x = 3; x < W - 3; x += 4) {
      carveLine(ctx, x, 2, x, H - 3, 1 + ((x / 4) % 2));
    }

    for (let y = 3; y < H - 3; y += 3) {
      for (let x = 3; x < W - 3; x += 4) {
        if ((x + y) % 2 === 0 && randomFloat(ctx) < 0.35) {
          carveRect(ctx, x, y, x + 1, y + 1);
        }
      }
    }

    for (let y = 4; y < H - 4; y += 5) {
      carveLine(ctx, 2, y, W - 3, y, 3);
    }

    applyPalette(ctx, {
      floor: '#f9d5a7',
      wall: '#5a1a01',
      accent: '#ff5d73'
    }, {
      accentStride: 4,
      accentChance: 0.2,
      gradient: {
        type: 'linear',
        originX: 2,
        originY: H / 2,
        targetX: W - 2,
        targetY: H / 2,
        start: '#f7b267',
        end: '#f4845f'
      },
      wallGradient: {
        type: 'banded',
        axis: 'y',
        bands: ['#6f1a07', '#410b0b'],
        bandWidth: 3
      },
      floorNoise: 0.05,
      wallNoise: 0.04
    });

    sprinkleLanterns(ctx, '#ffd384', 0.12);
    sprinkleLanterns(ctx, '#ff758f', 0.06);
    ctx.ensureConnectivity();
  }

  function algorithmOperaHouse(ctx) {
    const { width: W, height: H } = ctx;
    fillSolid(ctx, 1);
    const stageHeight = Math.floor(H / 4);
    carveRect(ctx, 3, 3, W - 4, H - 4);
    carveRect(ctx, 5, 5, W - 6, H - 6);

    carveRect(ctx, 4, 4, W - 5, 4 + stageHeight);
    carveRect(ctx, Math.floor(W / 3), 4 + stageHeight, Math.floor((2 * W) / 3), H - 5);

    for (let i = 0; i < 5; i++) {
      const offset = 6 + i * 2;
      carveLine(ctx, 4, offset, W - 5, offset, 1);
      carveLine(ctx, 4, offset, Math.floor(W / 2), H - 5, 2);
      carveLine(ctx, W - 5, offset, Math.floor(W / 2), H - 5, 2);
    }

    for (let i = 0; i < 6; i++) {
      const cx = randomInt(ctx, 6, W - 7);
      const cy = randomInt(ctx, 6, H - 7);
      carveRing(ctx, cx, cy, 2 + (i % 2), 1);
    }

    applyPalette(ctx, {
      floor: '#f2d7ee',
      wall: '#3b0918',
      accent: '#f25f5c'
    }, {
      accentStride: 5,
      accentChance: 0.15,
      gradient: {
        type: 'radial',
        centerX: W / 2,
        centerY: 4 + stageHeight / 2,
        radius: Math.max(W, H) / 2,
        inner: '#fcd5ce',
        outer: '#f2d7ee'
      },
      wallGradient: {
        type: 'linear',
        originX: W / 2,
        originY: 4,
        targetX: W / 2,
        targetY: H - 4,
        start: '#250710',
        end: '#601023'
      },
      floorNoise: 0.08,
      wallNoise: 0.05
    });

    sprinkleLanterns(ctx, '#ffe5ec', 0.08);
    ctx.ensureConnectivity();
  }

  function algorithmCraneSanctuary(ctx) {
    const { width: W, height: H } = ctx;
    fillSolid(ctx, 1);
    const cx = Math.floor(W / 2);
    const cy = Math.floor(H / 2);
    carveSpiral(ctx, cx, cy, 2.5, 1.1, 2);

    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI / 2) * i + 0.6;
      const px = Math.floor(cx + Math.cos(angle) * (Math.min(W, H) / 3));
      const py = Math.floor(cy + Math.sin(angle) * (Math.min(W, H) / 3));
      ctx.carvePath([
        { x: px, y: py },
        { x: px + (i % 2 === 0 ? 3 : -3), y: py + (i < 2 ? -4 : 4) },
        { x: px + (i % 2 === 0 ? 6 : -6), y: py }
      ], 2);
      carveRing(ctx, px, py, 3, 1);
      ctx.setFloorType(px, py, 'water');
    }

    for (let i = 0; i < 6; i++) {
      const x = randomInt(ctx, 3, W - 4);
      const y = randomInt(ctx, 3, H - 4);
      if (ctx.get(x, y) === 0) {
        ctx.setFloorType(x, y, 'bridge');
      }
    }

    applyPalette(ctx, {
      floor: '#d6f0ff',
      wall: '#0c2d48',
      accent: '#89d8d3'
    }, {
      accentStride: 6,
      accentChance: 0.1,
      gradient: {
        type: 'radial',
        centerX: cx,
        centerY: cy,
        radius: Math.max(W, H) / 2,
        inner: '#c7f9cc',
        outer: '#87bfff'
      },
      wallGradient: {
        type: 'linear',
        originX: 2,
        originY: 2,
        targetX: W - 2,
        targetY: H - 2,
        start: '#0b2033',
        end: '#164866'
      },
      floorNoise: 0.03,
      wallNoise: 0.02
    });

    sprinkleLanterns(ctx, '#f0fff1', 0.05);
    ctx.ensureConnectivity();
  }

  function algorithmTeaPavilion(ctx) {
    const { width: W, height: H } = ctx;
    fillSolid(ctx, 1);
    for (let y = 3; y < H - 3; y += 4) {
      carveLine(ctx, 3, y, W - 4, y, 2);
    }

    for (let x = 4; x < W - 4; x += 5) {
      carveRect(ctx, x, 3, x + 2, H - 4);
    }

    for (let i = 0; i < 5; i++) {
      const px = randomInt(ctx, 4, W - 5);
      const py = randomInt(ctx, 4, H - 5);
      carveRect(ctx, px, py, px + 2, py + 2);
      ctx.setFloorType(px + 1, py + 1, 'garden');
    }

    for (let i = 0; i < 3; i++) {
      const cx = Math.floor((W / 4) * (i + 1));
      carveRing(ctx, cx, Math.floor(H / 2), 3 + i, 1);
    }

    applyPalette(ctx, {
      floor: '#d1c089',
      wall: '#4a3211',
      accent: '#f2e1ac'
    }, {
      accentStride: 5,
      accentChance: 0.1,
      gradient: {
        type: 'banded',
        axis: 'x',
        bandWidth: 5,
        bands: ['#c7b377', '#d8c289', '#ead29b']
      },
      wallGradient: {
        type: 'linear',
        originX: 2,
        originY: H / 2,
        targetX: W - 2,
        targetY: H / 2,
        start: '#3b2710',
        end: '#5c3b17'
      },
      floorNoise: 0.07,
      wallNoise: 0.03
    });

    sprinkleLanterns(ctx, '#ffe6a7', 0.05);
    ctx.ensureConnectivity();
  }

  const generators = [
    {
      id: 'imperial-courtyard',
      name: '紫禁庭苑',
      description: '王宮の中庭が重なる儀礼空間',
      algorithm: algorithmImperialCourtyard,
      mixin: { normalMixed: 0.42, blockDimMixed: 0.5, tags: ['imperial', 'symmetry', 'ceremony'] }
    },
    {
      id: 'lotus-labyrinth',
      name: '蓮花迷宮',
      description: '蓮が幾重にも咲く輪郭状の迷宮',
      algorithm: algorithmLotusLabyrinth,
      mixin: { normalMixed: 0.36, blockDimMixed: 0.48, tags: ['garden', 'ring', 'water'] }
    },
    {
      id: 'silk-market',
      name: '絲綢市集',
      description: '縦横に伸びる商人の路地と屋台',
      algorithm: algorithmSilkMarket,
      mixin: { normalMixed: 0.4, blockDimMixed: 0.45, tags: ['market', 'grid', 'urban'] }
    },
    {
      id: 'great-wall-terrace',
      name: '長城高台',
      description: '城壁と展望台が交差する防衛構造',
      algorithm: algorithmGreatWall,
      mixin: { normalMixed: 0.28, blockDimMixed: 0.4, tags: ['fortress', 'grid', 'defense'] }
    },
    {
      id: 'dragon-spine',
      name: '龍脈回廊',
      description: '龍の背骨のような弧状の回廊',
      algorithm: algorithmDragonSpine,
      mixin: { normalMixed: 0.5, blockDimMixed: 0.55, tags: ['organic', 'serpentine'] }
    },
    {
      id: 'scholar-archive',
      name: '翰林書庫',
      description: '書架と閲覧室が層を成す学術空間',
      algorithm: algorithmScholarArchive,
      mixin: { normalMixed: 0.34, blockDimMixed: 0.46, tags: ['library', 'archive'] }
    },
    {
      id: 'moonlit-waterways',
      name: '月影水路',
      description: '氷の水路と舟着き場が連なる夜景',
      algorithm: algorithmMoonlitWaterways,
      mixin: { normalMixed: 0.3, blockDimMixed: 0.52, tags: ['water', 'ice', 'canal'] }
    },
    {
      id: 'celestial-observatory',
      name: '天穹観星塔',
      description: '星環と観測塔が重なり合う天文殿',
      algorithm: algorithmCelestialObservatory,
      mixin: { normalMixed: 0.44, blockDimMixed: 0.56, tags: ['astral', 'rings', 'ritual'] }
    },
    {
      id: 'jade-terraces',
      name: '翠玉連台',
      description: '段々畑のように広がる翠玉の庭園',
      algorithm: algorithmJadeTerraces,
      mixin: { normalMixed: 0.38, blockDimMixed: 0.5, tags: ['garden', 'terrace', 'water'] }
    },
    {
      id: 'lantern-festival',
      name: '燈海嘉年',
      description: '連なる提灯と露店が彩る祝祭の街路',
      algorithm: algorithmLanternFestival,
      mixin: { normalMixed: 0.46, blockDimMixed: 0.52, tags: ['festival', 'lantern', 'market'] }
    },
    {
      id: 'opera-house',
      name: '梨園大戯',
      description: '舞台と客席が重層する大劇場',
      algorithm: algorithmOperaHouse,
      mixin: { normalMixed: 0.4, blockDimMixed: 0.54, tags: ['theater', 'stage', 'crescent'] }
    },
    {
      id: 'crane-sanctuary',
      name: '仙鶴雲苑',
      description: '雲水庭園に橋が螺旋する聖域',
      algorithm: algorithmCraneSanctuary,
      mixin: { normalMixed: 0.35, blockDimMixed: 0.5, tags: ['garden', 'water', 'sanctuary'] }
    },
    {
      id: 'tea-pavilion',
      name: '香茗雲亭',
      description: '茶亭と座敷が連なる静謐な庭園',
      algorithm: algorithmTeaPavilion,
      mixin: { normalMixed: 0.32, blockDimMixed: 0.48, tags: ['tea', 'terrace', 'pavilion'] }
    }
  ];

  function bossFloorsFor(depth) {
    const floors = [];
    const maxDepth = Math.max(0, Math.floor(depth));
    for (let floor = 4; floor <= maxDepth; floor += 4) {
      floors.push(floor);
    }
    if (maxDepth > 0) {
      const last = floors[floors.length - 1];
      if (last !== maxDepth && maxDepth - (last ?? 0) >= 2) {
        floors.push(maxDepth);
      }
    }
    return floors;
  }

  const blocks = {
    blocks1: [
      { key: 'jinluo_01', name: '金鑼街区', level: 4, size: 0, depth: 2, chest: 'normal', type: 'silk-market', bossFloors: bossFloorsFor(12) },
      { key: 'jinluo_02', name: '金鑼夜市', level: 7, size: 1, depth: 3, chest: 'more', type: 'silk-market', bossFloors: bossFloorsFor(14) },
      { key: 'jinluo_03', name: '金鑼豪市', level: 10, size: 1, depth: 3, chest: 'normal', type: 'silk-market', bossFloors: bossFloorsFor(16) },
      { key: 'zijin_01', name: '紫禁正門', level: 8, size: 1, depth: 3, chest: 'less', type: 'imperial-courtyard', bossFloors: bossFloorsFor(12) },
      { key: 'zijin_02', name: '紫禁内苑', level: 12, size: 1, depth: 4, chest: 'normal', type: 'imperial-courtyard', bossFloors: bossFloorsFor(18) },
      { key: 'zijin_03', name: '紫禁儀殿', level: 16, size: 2, depth: 4, chest: 'more', type: 'imperial-courtyard', bossFloors: bossFloorsFor(20) },
      { key: 'jinglu_01', name: '京路胡同', level: 5, size: 0, depth: 2, chest: 'less', type: 'dragon-spine', bossFloors: bossFloorsFor(10) },
      { key: 'jinglu_02', name: '京路龍鱗', level: 11, size: 1, depth: 3, chest: 'normal', type: 'dragon-spine', bossFloors: bossFloorsFor(16) },
      { key: 'jinglu_03', name: '京路龍脈', level: 18, size: 2, depth: 4, chest: 'more', type: 'dragon-spine', bossFloors: bossFloorsFor(22) },
      { key: 'changcheng_01', name: '長城外哨', level: 6, size: 0, depth: 2, chest: 'less', type: 'great-wall-terrace', bossFloors: bossFloorsFor(10) },
      { key: 'changcheng_02', name: '長城箭楼', level: 13, size: 1, depth: 3, chest: 'normal', type: 'great-wall-terrace', bossFloors: bossFloorsFor(18) },
      { key: 'changcheng_03', name: '長城烽台', level: 20, size: 2, depth: 4, chest: 'more', type: 'great-wall-terrace', bossFloors: bossFloorsFor(24) },
      { key: 'hanlin_01', name: '翰林序館', level: 9, size: 0, depth: 3, chest: 'normal', type: 'scholar-archive', bossFloors: bossFloorsFor(14) },
      { key: 'hanlin_02', name: '翰林内庫', level: 15, size: 1, depth: 4, chest: 'less', type: 'scholar-archive', bossFloors: bossFloorsFor(18) },
      { key: 'hanlin_03', name: '翰林秘閣', level: 21, size: 2, depth: 4, chest: 'more', type: 'scholar-archive', bossFloors: bossFloorsFor(24) },
      { key: 'lianhua_01', name: '蓮華初層', level: 3, size: -1, depth: 2, chest: 'normal', type: 'lotus-labyrinth', bossFloors: bossFloorsFor(8) },
      { key: 'lianhua_02', name: '蓮華霧層', level: 9, size: 0, depth: 3, chest: 'more', type: 'lotus-labyrinth', bossFloors: bossFloorsFor(12) },
      { key: 'lianhua_03', name: '蓮華夜層', level: 17, size: 1, depth: 4, chest: 'normal', type: 'lotus-labyrinth', bossFloors: bossFloorsFor(20) },
      { key: 'yueliang_01', name: '月梁水街', level: 7, size: 0, depth: 3, chest: 'less', type: 'moonlit-waterways', bossFloors: bossFloorsFor(12) },
      { key: 'yueliang_02', name: '月梁寒渠', level: 14, size: 1, depth: 3, chest: 'normal', type: 'moonlit-waterways', bossFloors: bossFloorsFor(18) },
      { key: 'yueliang_03', name: '月梁霜港', level: 22, size: 2, depth: 4, chest: 'more', type: 'moonlit-waterways', bossFloors: bossFloorsFor(24) },
      { key: 'tianwen_01', name: '天文前庭', level: 9, size: 0, depth: 3, chest: 'normal', type: 'celestial-observatory', bossFloors: bossFloorsFor(14) },
      { key: 'tianwen_02', name: '天文星塔', level: 16, size: 1, depth: 4, chest: 'more', type: 'celestial-observatory', bossFloors: bossFloorsFor(20) },
      { key: 'tianwen_03', name: '天文極殿', level: 23, size: 2, depth: 5, chest: 'normal', type: 'celestial-observatory', bossFloors: bossFloorsFor(26) },
      { key: 'cuitai_01', name: '翠台浅園', level: 6, size: 0, depth: 2, chest: 'less', type: 'jade-terraces', bossFloors: bossFloorsFor(12) },
      { key: 'cuitai_02', name: '翠台深苑', level: 13, size: 1, depth: 3, chest: 'normal', type: 'jade-terraces', bossFloors: bossFloorsFor(18) },
      { key: 'cuitai_03', name: '翠台玉峰', level: 21, size: 2, depth: 4, chest: 'more', type: 'jade-terraces', bossFloors: bossFloorsFor(24) },
      { key: 'denghai_01', name: '燈海市街', level: 7, size: 0, depth: 2, chest: 'less', type: 'lantern-festival', bossFloors: bossFloorsFor(12) },
      { key: 'denghai_02', name: '燈海慶宴', level: 14, size: 1, depth: 3, chest: 'more', type: 'lantern-festival', bossFloors: bossFloorsFor(18) },
      { key: 'denghai_03', name: '燈海宵宮', level: 22, size: 2, depth: 4, chest: 'normal', type: 'lantern-festival', bossFloors: bossFloorsFor(24) },
      { key: 'liyuan_01', name: '梨園雅台', level: 10, size: 1, depth: 3, chest: 'less', type: 'opera-house', bossFloors: bossFloorsFor(16) },
      { key: 'liyuan_02', name: '梨園霓殿', level: 17, size: 1, depth: 4, chest: 'normal', type: 'opera-house', bossFloors: bossFloorsFor(22) },
      { key: 'liyuan_03', name: '梨園極舞', level: 24, size: 2, depth: 5, chest: 'more', type: 'opera-house', bossFloors: bossFloorsFor(28) },
      { key: 'xianhe_01', name: '仙鶴水苑', level: 8, size: 0, depth: 3, chest: 'less', type: 'crane-sanctuary', bossFloors: bossFloorsFor(14) },
      { key: 'xianhe_02', name: '仙鶴雲台', level: 15, size: 1, depth: 4, chest: 'normal', type: 'crane-sanctuary', bossFloors: bossFloorsFor(20) },
      { key: 'xianhe_03', name: '仙鶴星舞', level: 23, size: 2, depth: 5, chest: 'more', type: 'crane-sanctuary', bossFloors: bossFloorsFor(26) },
      { key: 'xiangming_01', name: '香茗茶肆', level: 6, size: 0, depth: 2, chest: 'normal', type: 'tea-pavilion', bossFloors: bossFloorsFor(12) },
      { key: 'xiangming_02', name: '香茗御亭', level: 12, size: 1, depth: 3, chest: 'less', type: 'tea-pavilion', bossFloors: bossFloorsFor(18) },
      { key: 'xiangming_03', name: '香茗霧榭', level: 19, size: 1, depth: 4, chest: 'more', type: 'tea-pavilion', bossFloors: bossFloorsFor(24) }
    ],
    blocks2: [
      { key: 'mingshi_01', name: '名市小径', level: 6, size: 0, depth: 2, chest: 'normal', type: 'silk-market' },
      { key: 'mingshi_02', name: '名市帳幕', level: 12, size: 1, depth: 3, chest: 'more', type: 'silk-market' },
      { key: 'mingshi_03', name: '名市楼閣', level: 18, size: 2, depth: 3, chest: 'less', type: 'silk-market' },
      { key: 'huadian_01', name: '花殿回廊', level: 10, size: 1, depth: 3, chest: 'normal', type: 'imperial-courtyard' },
      { key: 'huadian_02', name: '花殿主殿', level: 16, size: 1, depth: 4, chest: 'more', type: 'imperial-courtyard' },
      { key: 'huadian_03', name: '花殿玉階', level: 22, size: 2, depth: 4, chest: 'less', type: 'imperial-courtyard' },
      { key: 'longyin_01', name: '龍吟巷', level: 8, size: 0, depth: 2, chest: 'less', type: 'dragon-spine' },
      { key: 'longyin_02', name: '龍吟華軒', level: 15, size: 1, depth: 3, chest: 'normal', type: 'dragon-spine' },
      { key: 'longyin_03', name: '龍吟梧宮', level: 23, size: 2, depth: 4, chest: 'more', type: 'dragon-spine' },
      { key: 'yanmen_01', name: '雁門関廊', level: 9, size: 0, depth: 2, chest: 'normal', type: 'great-wall-terrace' },
      { key: 'yanmen_02', name: '雁門砦楼', level: 17, size: 1, depth: 3, chest: 'more', type: 'great-wall-terrace' },
      { key: 'yanmen_03', name: '雁門烽楼', level: 24, size: 2, depth: 4, chest: 'less', type: 'great-wall-terrace' },
      { key: 'wenxin_01', name: '文心閲廊', level: 11, size: 0, depth: 3, chest: 'less', type: 'scholar-archive' },
      { key: 'wenxin_02', name: '文心秘庫', level: 18, size: 1, depth: 4, chest: 'normal', type: 'scholar-archive' },
      { key: 'wenxin_03', name: '文心玉架', level: 25, size: 2, depth: 4, chest: 'more', type: 'scholar-archive' },
      { key: 'shuilian_01', name: '水蓮回庭', level: 5, size: 0, depth: 2, chest: 'normal', type: 'lotus-labyrinth' },
      { key: 'shuilian_02', name: '水蓮幻郭', level: 13, size: 1, depth: 3, chest: 'less', type: 'lotus-labyrinth' },
      { key: 'shuilian_03', name: '水蓮星殿', level: 20, size: 1, depth: 4, chest: 'more', type: 'lotus-labyrinth' },
      { key: 'liangyue_01', name: '涼月津', level: 9, size: 0, depth: 3, chest: 'normal', type: 'moonlit-waterways' },
      { key: 'liangyue_02', name: '涼月霜渠', level: 16, size: 1, depth: 4, chest: 'more', type: 'moonlit-waterways' },
      { key: 'liangyue_03', name: '涼月天港', level: 24, size: 2, depth: 4, chest: 'less', type: 'moonlit-waterways' },
      { key: 'xingguan_01', name: '星観迴廊', level: 11, size: 0, depth: 3, chest: 'normal', type: 'celestial-observatory' },
      { key: 'xingguan_02', name: '星観塔層', level: 18, size: 1, depth: 4, chest: 'more', type: 'celestial-observatory' },
      { key: 'xingguan_03', name: '星観穹宮', level: 25, size: 2, depth: 5, chest: 'less', type: 'celestial-observatory' },
      { key: 'yuta_01', name: '玉台浅苑', level: 9, size: 0, depth: 2, chest: 'less', type: 'jade-terraces' },
      { key: 'yuta_02', name: '玉台翠庭', level: 15, size: 1, depth: 3, chest: 'normal', type: 'jade-terraces' },
      { key: 'yuta_03', name: '玉台霊峰', level: 22, size: 2, depth: 4, chest: 'more', type: 'jade-terraces' },
      { key: 'zhaohui_01', name: '照輝街巷', level: 10, size: 0, depth: 3, chest: 'less', type: 'lantern-festival' },
      { key: 'zhaohui_02', name: '照輝夜市', level: 17, size: 1, depth: 4, chest: 'normal', type: 'lantern-festival' },
      { key: 'zhaohui_03', name: '照輝長廊', level: 23, size: 2, depth: 4, chest: 'more', type: 'lantern-festival' },
      { key: 'liyuan_04', name: '梨園雅席', level: 12, size: 1, depth: 3, chest: 'more', type: 'opera-house' },
      { key: 'liyuan_05', name: '梨園錦幕', level: 19, size: 1, depth: 4, chest: 'less', type: 'opera-house' },
      { key: 'xianhe_04', name: '仙鶴霧橋', level: 13, size: 0, depth: 3, chest: 'normal', type: 'crane-sanctuary' },
      { key: 'xianhe_05', name: '仙鶴雲路', level: 20, size: 1, depth: 4, chest: 'more', type: 'crane-sanctuary' },
      { key: 'xiangming_04', name: '香茗茶舟', level: 11, size: 0, depth: 2, chest: 'less', type: 'tea-pavilion' },
      { key: 'xiangming_05', name: '香茗花亭', level: 18, size: 1, depth: 3, chest: 'normal', type: 'tea-pavilion' }
    ],
    blocks3: [
      { key: 'huangyu_01', name: '皇御斎殿', level: 14, size: 1, depth: 3, chest: 'normal', type: 'imperial-courtyard', bossFloors: [8, 16] },
      { key: 'huangyu_02', name: '皇御宸極', level: 20, size: 1, depth: 4, chest: 'more', type: 'imperial-courtyard', bossFloors: [12, 20] },
      { key: 'huangyu_03', name: '皇御星穹', level: 27, size: 2, depth: 5, chest: 'less', type: 'imperial-courtyard', bossFloors: [16, 24] },
      { key: 'longxin_01', name: '龍心宝庫', level: 15, size: 1, depth: 3, chest: 'more', type: 'dragon-spine', bossFloors: [10, 18] },
      { key: 'longxin_02', name: '龍心霊壇', level: 22, size: 1, depth: 4, chest: 'normal', type: 'dragon-spine', bossFloors: [14, 22] },
      { key: 'longxin_03', name: '龍心雲闕', level: 29, size: 2, depth: 5, chest: 'more', type: 'dragon-spine', bossFloors: [18, 26] },
      { key: 'changsheng_01', name: '長勝烽堡', level: 16, size: 1, depth: 3, chest: 'less', type: 'great-wall-terrace', bossFloors: [10, 18] },
      { key: 'changsheng_02', name: '長勝天闕', level: 23, size: 2, depth: 4, chest: 'normal', type: 'great-wall-terrace', bossFloors: [14, 22] },
      { key: 'changsheng_03', name: '長勝雲堞', level: 30, size: 2, depth: 5, chest: 'more', type: 'great-wall-terrace', bossFloors: [18, 26] },
      { key: 'lianxin_01', name: '蓮心霧宮', level: 12, size: 1, depth: 3, chest: 'normal', type: 'lotus-labyrinth', bossFloors: [8, 16] },
      { key: 'lianxin_02', name: '蓮心星塔', level: 19, size: 1, depth: 4, chest: 'more', type: 'lotus-labyrinth', bossFloors: [12, 20] },
      { key: 'lianxin_03', name: '蓮心天蓬', level: 26, size: 2, depth: 5, chest: 'less', type: 'lotus-labyrinth', bossFloors: [16, 24] },
      { key: 'shangshi_01', name: '商市耀庭', level: 13, size: 1, depth: 3, chest: 'more', type: 'silk-market', bossFloors: [8, 16] },
      { key: 'shangshi_02', name: '商市霓楼', level: 21, size: 1, depth: 4, chest: 'normal', type: 'silk-market', bossFloors: [12, 20] },
      { key: 'shangshi_03', name: '商市金穹', level: 28, size: 2, depth: 5, chest: 'more', type: 'silk-market', bossFloors: [16, 24] },
      { key: 'hanxin_01', name: '翰心星閲', level: 17, size: 1, depth: 3, chest: 'less', type: 'scholar-archive', bossFloors: [10, 18] },
      { key: 'hanxin_02', name: '翰心霜庫', level: 24, size: 2, depth: 4, chest: 'normal', type: 'scholar-archive', bossFloors: [14, 22] },
      { key: 'hanxin_03', name: '翰心辰宮', level: 31, size: 2, depth: 5, chest: 'more', type: 'scholar-archive', bossFloors: [18, 26] },
      { key: 'yuexiang_01', name: '月香流光', level: 14, size: 1, depth: 3, chest: 'normal', type: 'moonlit-waterways', bossFloors: [8, 16] },
      { key: 'yuexiang_02', name: '月香寒波', level: 22, size: 1, depth: 4, chest: 'less', type: 'moonlit-waterways', bossFloors: [12, 20] },
      { key: 'yuexiang_03', name: '月香雪港', level: 30, size: 2, depth: 5, chest: 'more', type: 'moonlit-waterways', bossFloors: [16, 24] },
      { key: 'starcrest_01', name: '星冠観測', level: 18, size: 1, depth: 4, chest: 'more', type: 'celestial-observatory', bossFloors: [12, 20] },
      { key: 'starcrest_02', name: '星冠律塔', level: 26, size: 2, depth: 5, chest: 'normal', type: 'celestial-observatory', bossFloors: [16, 24] },
      { key: 'starcrest_03', name: '星冠穹儀', level: 33, size: 3, depth: 5, chest: 'more', type: 'celestial-observatory', bossFloors: [20, 28] },
      { key: 'emerald_01', name: '翡翠段陵', level: 17, size: 1, depth: 4, chest: 'less', type: 'jade-terraces', bossFloors: [12, 20] },
      { key: 'emerald_02', name: '翡翠雲壇', level: 25, size: 2, depth: 5, chest: 'normal', type: 'jade-terraces', bossFloors: [16, 24] },
      { key: 'emerald_03', name: '翡翠霊峰', level: 32, size: 3, depth: 6, chest: 'more', type: 'jade-terraces', bossFloors: [20, 28] },
      { key: 'festival_01', name: '灯宴極街', level: 19, size: 1, depth: 4, chest: 'more', type: 'lantern-festival', bossFloors: [12, 20] },
      { key: 'festival_02', name: '灯宴宵城', level: 27, size: 2, depth: 5, chest: 'normal', type: 'lantern-festival', bossFloors: [16, 24] },
      { key: 'festival_03', name: '灯宴星都', level: 34, size: 3, depth: 6, chest: 'more', type: 'lantern-festival', bossFloors: [20, 28] },
      { key: 'grandopera_01', name: '戯都雅廊', level: 20, size: 1, depth: 4, chest: 'normal', type: 'opera-house', bossFloors: [12, 20] },
      { key: 'grandopera_02', name: '戯都彩殿', level: 28, size: 2, depth: 5, chest: 'more', type: 'opera-house', bossFloors: [16, 24] },
      { key: 'grandopera_03', name: '戯都霓穹', level: 35, size: 3, depth: 6, chest: 'more', type: 'opera-house', bossFloors: [20, 28] },
      { key: 'cranecloud_01', name: '鶴雲環洲', level: 18, size: 1, depth: 4, chest: 'less', type: 'crane-sanctuary', bossFloors: [12, 20] },
      { key: 'cranecloud_02', name: '鶴雲聖蓮', level: 26, size: 2, depth: 5, chest: 'normal', type: 'crane-sanctuary', bossFloors: [16, 24] },
      { key: 'cranecloud_03', name: '鶴雲霊橋', level: 33, size: 3, depth: 6, chest: 'more', type: 'crane-sanctuary', bossFloors: [20, 28] },
      { key: 'pavilion_01', name: '茗亭雲居', level: 17, size: 1, depth: 4, chest: 'normal', type: 'tea-pavilion', bossFloors: [12, 20] },
      { key: 'pavilion_02', name: '茗亭霧軒', level: 24, size: 2, depth: 5, chest: 'more', type: 'tea-pavilion', bossFloors: [16, 24] },
      { key: 'pavilion_03', name: '茗亭香閣', level: 31, size: 3, depth: 6, chest: 'more', type: 'tea-pavilion', bossFloors: [20, 28] }
    ],
    blocks4: [
      { key: 'constellation_01', name: '星羅雲殿', level: 24, size: 2, depth: 5, chest: 'more', type: 'celestial-observatory', bossFloors: [16, 24, 30] },
      { key: 'constellation_02', name: '星羅宙宮', level: 31, size: 3, depth: 6, chest: 'normal', type: 'celestial-observatory', bossFloors: [20, 28, 34] },
      { key: 'constellation_03', name: '星羅永極', level: 38, size: 3, depth: 7, chest: 'more', type: 'celestial-observatory', bossFloors: [24, 32, 40] },
      { key: 'emeraldcrest_01', name: '翠冠梯苑', level: 23, size: 2, depth: 5, chest: 'normal', type: 'jade-terraces', bossFloors: [16, 24, 30] },
      { key: 'emeraldcrest_02', name: '翠冠霊台', level: 30, size: 3, depth: 6, chest: 'more', type: 'jade-terraces', bossFloors: [20, 28, 34] },
      { key: 'emeraldcrest_03', name: '翠冠仙壇', level: 37, size: 3, depth: 7, chest: 'less', type: 'jade-terraces', bossFloors: [24, 32, 40] },
      { key: 'radiantgala_01', name: '燈耀宵宴', level: 25, size: 2, depth: 5, chest: 'more', type: 'lantern-festival', bossFloors: [16, 24, 30] },
      { key: 'radiantgala_02', name: '燈耀星街', level: 32, size: 3, depth: 6, chest: 'normal', type: 'lantern-festival', bossFloors: [20, 28, 34] },
      { key: 'radiantgala_03', name: '燈耀霓京', level: 39, size: 3, depth: 7, chest: 'more', type: 'lantern-festival', bossFloors: [24, 32, 40] },
      { key: 'royalopera_01', name: '戯皇瑠殿', level: 26, size: 2, depth: 5, chest: 'less', type: 'opera-house', bossFloors: [16, 24, 30] },
      { key: 'royalopera_02', name: '戯皇星舞', level: 33, size: 3, depth: 6, chest: 'normal', type: 'opera-house', bossFloors: [20, 28, 34] },
      { key: 'royalopera_03', name: '戯皇虹蓋', level: 40, size: 3, depth: 7, chest: 'more', type: 'opera-house', bossFloors: [24, 32, 40] },
      { key: 'cranesummit_01', name: '鶴頂浮洲', level: 24, size: 2, depth: 5, chest: 'normal', type: 'crane-sanctuary', bossFloors: [16, 24, 30] },
      { key: 'cranesummit_02', name: '鶴頂翔庭', level: 31, size: 3, depth: 6, chest: 'less', type: 'crane-sanctuary', bossFloors: [20, 28, 34] },
      { key: 'cranesummit_03', name: '鶴頂雲極', level: 38, size: 3, depth: 7, chest: 'more', type: 'crane-sanctuary', bossFloors: [24, 32, 40] },
      { key: 'jadebrew_01', name: '茗冠香庭', level: 23, size: 2, depth: 5, chest: 'less', type: 'tea-pavilion', bossFloors: [16, 24, 30] },
      { key: 'jadebrew_02', name: '茗冠霧亭', level: 30, size: 3, depth: 6, chest: 'normal', type: 'tea-pavilion', bossFloors: [20, 28, 34] },
      { key: 'jadebrew_03', name: '茗冠星閣', level: 37, size: 3, depth: 7, chest: 'more', type: 'tea-pavilion', bossFloors: [24, 32, 40] }
    ],
    dimensions: [
      { key: 'huaxia', name: '華夏界域', baseLevel: 12 },
      { key: 'jinluo', name: '金鑼交易圏', baseLevel: 18 },
      { key: 'longmai', name: '龍脈天廊', baseLevel: 22 },
      { key: 'xinglu', name: '星路天界', baseLevel: 28 },
      { key: 'cuitian', name: '翠天雲境', baseLevel: 26 }
    ]
  };

  window.registerDungeonAddon({
    id: ADDON_ID,
    name: ADDON_NAME,
    version: VERSION,
    blocks,
    generators
  });
})();

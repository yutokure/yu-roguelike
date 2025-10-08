(function(){
  const ADDON_ID = 'sf_expansion_pack';
  const ADDON_NAME = 'SF Expansion Pack';
  const VERSION = '1.1.0';

  function clamp(value, min, max) {
    return value < min ? min : (value > max ? max : value);
  }

  function ensurePositiveInt(value, fallback, options = {}) {
    const min = options.min ?? 1;
    const max = options.max ?? Number.POSITIVE_INFINITY;
    const parsed = Number.isFinite(value) ? value : Number.parseInt(value, 10);
    const normalized = Number.isFinite(parsed) ? Math.floor(parsed) : NaN;
    if (!Number.isFinite(normalized)) return clamp(fallback, min, max);
    return clamp(normalized, min, max);
  }

  function ensureRatio(value, fallback = 0.5) {
    if (typeof value !== 'number' || Number.isNaN(value)) return clamp(fallback, 0, 1);
    return clamp(value, 0, 1);
  }

  function brighten(hex, ratio = 0.2) {
    if (!hex || typeof hex !== 'string') return hex;
    const normalized = hex.trim().replace(/^#/, '');
    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return hex;
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    const mix = (channel) => {
      const v = Math.round(channel + (255 - channel) * ratio);
      return clamp(v, 0, 255);
    };
    const toHex = (value) => value.toString(16).padStart(2, '0');
    return '#' + toHex(mix(r)) + toHex(mix(g)) + toHex(mix(b));
  }

  function fillSolid(ctx, value) {
    const fill = value ? 1 : 0;
    for (let y = 1; y < ctx.height - 1; y++) {
      for (let x = 1; x < ctx.width - 1; x++) {
        ctx.set(x, y, fill);
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

  function carveDisc(ctx, cx, cy, radius) {
    const r = Math.max(1, radius);
    const r2 = r * r;
    for (let y = cy - r - 1; y <= cy + r + 1; y++) {
      for (let x = cx - r - 1; x <= cx + r + 1; x++) {
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy <= r2) {
          if (ctx.inBounds(x, y)) ctx.set(x, y, 0);
        }
      }
    }
  }

  function carveRing(ctx, cx, cy, radius, thickness = 2) {
    const r = Math.max(2, radius);
    const t = Math.max(1, thickness);
    const outer2 = r * r;
    const inner = Math.max(0, r - t);
    const inner2 = inner * inner;
    for (let y = cy - r - 1; y <= cy + r + 1; y++) {
      for (let x = cx - r - 1; x <= cx + r + 1; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const d2 = dx * dx + dy * dy;
        if (d2 <= outer2 && d2 >= inner2) {
          if (ctx.inBounds(x, y)) ctx.set(x, y, 0);
        }
      }
    }
  }

  function carveRectRing(ctx, x0, y0, x1, y1, thickness = 1) {
    const minX = Math.max(1, Math.min(x0, x1));
    const maxX = Math.min(ctx.width - 2, Math.max(x0, x1));
    const minY = Math.max(1, Math.min(y0, y1));
    const maxY = Math.min(ctx.height - 2, Math.max(y0, y1));
    const t = Math.max(1, thickness);
    for (let i = 0; i < t; i++) {
      for (let x = minX + i; x <= maxX - i; x++) {
        ctx.set(x, minY + i, 0);
        ctx.set(x, maxY - i, 0);
      }
      for (let y = minY + i; y <= maxY - i; y++) {
        ctx.set(minX + i, y, 0);
        ctx.set(maxX - i, y, 0);
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
    const r = ctx.random ? ctx.random() : Math.random();
    return Math.floor(r * (max - min + 1)) + min;
  }

  function applyPalette(ctx, palette, options = {}) {
    const accentStride = options.accentStride ?? 5;
    const accentChance = options.accentChance ?? 0.08;
    const accentColor = options.accentColor || palette.accent;
    const finalAccent = accentColor ? brighten(accentColor, 0.15) : null;
    const wallColor = palette.wall ? brighten(palette.wall, 0.05) : null;
    for (let y = 1; y < ctx.height - 1; y++) {
      for (let x = 1; x < ctx.width - 1; x++) {
        if (ctx.get(x, y) === 0) {
          let color = palette.floor;
          if (finalAccent && ((x + y) % accentStride === 0 || (ctx.random && ctx.random() < accentChance))) {
            color = finalAccent;
          }
          ctx.setFloorColor(x, y, color);
        } else if (wallColor) {
          ctx.setWallColor(x, y, wallColor);
        }
      }
    }
  }

  function sprinkleStructures(ctx, tags, attempts = 2) {
    const normalizedTags = Array.isArray(tags) ? tags : (typeof tags === 'string' ? [tags] : []);
    if (!normalizedTags.length) return;
    const pool = ctx.structures.list ? ctx.structures.list({ addonId: ADDON_ID }) : [];
    if (!pool.length) return;
    for (let i = 0; i < attempts; i++) {
      const tag = normalizedTags[i % normalizedTags.length];
      const subset = pool.filter(def => Array.isArray(def.tags) && def.tags.includes(tag));
      const choices = subset.length ? subset : pool;
      if (!choices.length) break;
      const pick = choices[randomInt(ctx, 0, choices.length - 1)];
      const px = randomInt(ctx, 3, ctx.width - 4);
      const py = randomInt(ctx, 3, ctx.height - 4);
      try {
        ctx.structures.place(pick.id, px, py, { allowRotation: true, allowMirror: true, anchor: 'center' });
      } catch (_) {}
    }
  }
  function createHubAlgorithm(options) {
    const {
      arms = 6,
      rings = 3,
      armWidth = 2,
      coreRadius = 4,
      structureTags,
      palette
    } = options;
    return function(ctx) {
      fillSolid(ctx, 1);
      const cx = Math.floor(ctx.width / 2);
      const cy = Math.floor(ctx.height / 2);
      const maxRadius = Math.min(ctx.width, ctx.height) / 2 - 3;
      const safeCoreRadius = ensurePositiveInt(coreRadius, 4, { min: 2, max: maxRadius });
      const safeRings = ensurePositiveInt(rings, 3, { min: 1, max: 12 });
      const safeArmWidth = ensurePositiveInt(armWidth, 2, { min: 1, max: 8 });
      carveDisc(ctx, cx, cy, Math.max(3, safeCoreRadius));
      const spacing = Math.max(3, Math.floor((maxRadius - safeCoreRadius) / Math.max(1, safeRings)));
      for (let i = 1; i <= safeRings; i++) {
        carveRing(ctx, cx, cy, safeCoreRadius + spacing * i, safeArmWidth);
      }
      const offset = (ctx.random ? ctx.random() : Math.random()) * Math.PI * 2;
      const safeArms = ensurePositiveInt(arms, 6, { min: 3, max: 16 });
      for (let i = 0; i < safeArms; i++) {
        const angle = offset + (Math.PI * 2 * i) / safeArms;
        const length = maxRadius + 2;
        const targetX = Math.round(cx + Math.cos(angle) * length);
        const targetY = Math.round(cy + Math.sin(angle) * length);
        carveLine(ctx, cx, cy, targetX, targetY, safeArmWidth);
        carveDisc(ctx, Math.round(cx + Math.cos(angle) * (safeCoreRadius + spacing)), Math.round(cy + Math.sin(angle) * (safeCoreRadius + spacing)), Math.max(2, safeArmWidth + 1));
      }
      for (let i = 0; i < safeArms; i++) {
        const angle = offset + (Math.PI * 2 * i) / safeArms;
        const next = offset + (Math.PI * 2 * (i + 1)) / safeArms;
        const innerR = safeCoreRadius + spacing * Math.max(1, Math.floor(safeRings / 2));
        const x1 = Math.round(cx + Math.cos(angle) * innerR);
        const y1 = Math.round(cy + Math.sin(angle) * innerR);
        const x2 = Math.round(cx + Math.cos(next) * innerR);
        const y2 = Math.round(cy + Math.sin(next) * innerR);
        carveLine(ctx, x1, y1, x2, y2, 1);
      }
      if (structureTags) sprinkleStructures(ctx, structureTags, 3);
      ctx.ensureConnectivity();
      applyPalette(ctx, palette, options.paletteOptions || {});
    };
  }

  function createGridAlgorithm(options) {
    const {
      cellSize = 4,
      corridorWidth = 2,
      margin = 2,
      openings = 6,
      structureTags,
      palette
    } = options;
    return function(ctx) {
      fillSolid(ctx, 1);
      const safeMargin = ensurePositiveInt(margin, 2, { min: 1, max: 6 });
      const safeCell = ensurePositiveInt(cellSize, 4, { min: 2, max: 12 });
      const safeCorridor = ensurePositiveInt(corridorWidth, 2, { min: 1, max: 6 });
      const step = Math.max(1, safeCell + safeCorridor);
      for (let y = safeMargin; y < ctx.height - safeMargin; y += step) {
        for (let x = safeMargin; x < ctx.width - safeMargin; x += step) {
          carveRect(ctx, x, y, x + safeCell - 1, y + safeCell - 1);
        }
      }
      for (let y = safeMargin + safeCell; y < ctx.height - safeMargin; y += step) {
        carveRect(ctx, safeMargin, y, ctx.width - safeMargin - 1, y + safeCorridor - 1);
      }
      for (let x = safeMargin + safeCell; x < ctx.width - safeMargin; x += step) {
        carveRect(ctx, x, safeMargin, x + safeCorridor - 1, ctx.height - safeMargin - 1);
      }
      const safeOpenings = ensurePositiveInt(openings, 6, { min: 0, max: 32 });
      for (let i = 0; i < safeOpenings; i++) {
        const rx = randomInt(ctx, safeMargin, ctx.width - safeMargin - 2);
        const ry = randomInt(ctx, safeMargin, ctx.height - safeMargin - 2);
        carveRect(ctx, rx, ry, rx + 1, ry + 1);
      }
      if (structureTags) sprinkleStructures(ctx, structureTags, 3);
      ctx.ensureConnectivity();
      applyPalette(ctx, palette, options.paletteOptions || {});
    };
  }

  function createFlowAlgorithm(options) {
    const {
      streams = 4,
      steps = 90,
      width = 2,
      margin = 2,
      branchInterval = 18,
      structureTags,
      palette
    } = options;
    return function(ctx) {
      fillSolid(ctx, 1);
      const safeMargin = ensurePositiveInt(margin, 2, { min: 1, max: 8 });
      const safeWidth = ensurePositiveInt(width, 2, { min: 1, max: 6 });
      const safeStreams = ensurePositiveInt(streams, 4, { min: 1, max: 16 });
      const safeSteps = ensurePositiveInt(steps, 90, { min: 10, max: 500 });
      const safeBranchInterval = ensurePositiveInt(branchInterval, 18, { min: 4, max: 60 });
      carveRect(ctx, safeMargin, Math.floor(ctx.height / 2) - Math.floor(safeWidth / 2), ctx.width - safeMargin - 1, Math.floor(ctx.height / 2) + Math.floor(safeWidth / 2));
      carveRect(ctx, Math.floor(ctx.width / 2) - Math.floor(safeWidth / 2), safeMargin, Math.floor(ctx.width / 2) + Math.floor(safeWidth / 2), ctx.height - safeMargin - 1);
      for (let s = 0; s < safeStreams; s++) {
        let x = randomInt(ctx, safeMargin, ctx.width - safeMargin - 1);
        let y = randomInt(ctx, safeMargin, ctx.height - safeMargin - 1);
        for (let step = 0; step < safeSteps; step++) {
          carveRect(ctx, x - Math.floor(safeWidth / 2), y - Math.floor(safeWidth / 2), x + Math.floor(safeWidth / 2), y + Math.floor(safeWidth / 2));
          const dirBias = s % 2 === 0 ? 1 : -1;
          const optionsDir = [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1]
          ];
          const choice = optionsDir[randomInt(ctx, 0, optionsDir.length - 1)];
          const jitter = optionsDir[randomInt(ctx, 0, optionsDir.length - 1)];
          x += choice[0] + (step % 5 === 0 ? dirBias : 0);
          y += choice[1] + (step % 7 === 0 ? -dirBias : 0);
          if (step % safeBranchInterval === 0) {
            carveLine(ctx, x, y, Math.floor(ctx.width / 2), Math.floor(ctx.height / 2), safeWidth);
          }
          x = clamp(x, safeMargin, ctx.width - safeMargin - 1);
          y = clamp(y, safeMargin, ctx.height - safeMargin - 1);
          if (step % 11 === 0) {
            carveRect(ctx, x + jitter[0], y + jitter[1], x + jitter[0], y + jitter[1]);
          }
        }
      }
      for (let i = 0; i < safeStreams; i++) {
        const edge = i % 4;
        let sx, sy;
        if (edge === 0) { sx = randomInt(ctx, safeMargin, ctx.width - safeMargin - 1); sy = safeMargin; }
        else if (edge === 1) { sx = ctx.width - safeMargin - 1; sy = randomInt(ctx, safeMargin, ctx.height - safeMargin - 1); }
        else if (edge === 2) { sx = randomInt(ctx, safeMargin, ctx.width - safeMargin - 1); sy = ctx.height - safeMargin - 1; }
        else { sx = safeMargin; sy = randomInt(ctx, safeMargin, ctx.height - safeMargin - 1); }
        carveLine(ctx, sx, sy, Math.floor(ctx.width / 2), Math.floor(ctx.height / 2), safeWidth);
      }
      if (structureTags) sprinkleStructures(ctx, structureTags, 2);
      ctx.ensureConnectivity();
      applyPalette(ctx, palette, options.paletteOptions || {});
    };
  }

  function createOrganicAlgorithm(options) {
    const {
      fillChance = 0.45,
      smoothSteps = 3,
      structureTags,
      palette
    } = options;
    return function(ctx) {
      const w = ctx.width;
      const h = ctx.height;
      const data = [];
      const safeFillChance = ensureRatio(fillChance, 0.45);
      const safeSmoothSteps = ensurePositiveInt(smoothSteps, 3, { min: 0, max: 8 });
      for (let y = 0; y < h; y++) {
        const row = [];
        for (let x = 0; x < w; x++) {
          if (x === 0 || y === 0 || x === w - 1 || y === h - 1) {
            row.push(1);
          } else {
            const chance = safeFillChance + (Math.sin(x * 0.2) + Math.cos(y * 0.17)) * 0.05;
            row.push((ctx.random && ctx.random() < chance) ? 0 : 1);
          }
        }
        data.push(row);
      }
      for (let step = 0; step < safeSmoothSteps; step++) {
        const next = [];
        for (let y = 0; y < h; y++) {
          const row = [];
          for (let x = 0; x < w; x++) {
            if (x === 0 || y === 0 || x === w - 1 || y === h - 1) {
              row.push(1);
              continue;
            }
            let floors = 0;
            for (let yy = -1; yy <= 1; yy++) {
              for (let xx = -1; xx <= 1; xx++) {
                if (xx === 0 && yy === 0) continue;
                if (data[y + yy]?.[x + xx] === 0) floors++;
              }
            }
            if (floors >= 4) row.push(0);
            else if (floors <= 2) row.push(1);
            else row.push(data[y][x]);
          }
          next.push(row);
        }
        for (let y = 0; y < h; y++) data[y] = next[y];
      }
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          ctx.set(x, y, data[y][x] ? 1 : 0);
        }
      }
      carveDisc(ctx, Math.floor(w / 2), Math.floor(h / 2), 4);
      carveRect(ctx, 2, Math.floor(h / 2) - 1, w - 3, Math.floor(h / 2) + 1);
      if (structureTags) sprinkleStructures(ctx, structureTags, 2);
      ctx.ensureConnectivity();
      applyPalette(ctx, palette, options.paletteOptions || {});
    };
  }

  function createPlatformAlgorithm(options) {
    const {
      islands = 7,
      platformRadius = 3,
      bridgeWidth = 2,
      structureTags,
      palette
    } = options;
    return function(ctx) {
      fillSolid(ctx, 1);
      const cx = Math.floor(ctx.width / 2);
      const cy = Math.floor(ctx.height / 2);
      const safeIslands = ensurePositiveInt(islands, 7, { min: 1, max: 24 });
      const safeRadius = ensurePositiveInt(platformRadius, 3, { min: 1, max: 8 });
      const safeBridgeWidth = ensurePositiveInt(bridgeWidth, 2, { min: 1, max: 6 });
      carveDisc(ctx, cx, cy, safeRadius + 2);
      for (let i = 0; i < safeIslands; i++) {
        const angle = (Math.PI * 2 * i) / safeIslands + (ctx.random ? ctx.random() * 0.6 : Math.random() * 0.6);
        const radius = safeRadius + 4 + (ctx.random ? ctx.random() * 6 : Math.random() * 6);
        const px = Math.round(cx + Math.cos(angle) * radius);
        const py = Math.round(cy + Math.sin(angle) * radius);
        carveDisc(ctx, px, py, safeRadius);
        carveLine(ctx, cx, cy, px, py, safeBridgeWidth);
        if (i % 2 === 0) {
          const nextAngle = angle + Math.PI / safeIslands;
          const nx = Math.round(cx + Math.cos(nextAngle) * (radius + 3));
          const ny = Math.round(cy + Math.sin(nextAngle) * (radius + 3));
          carveLine(ctx, px, py, nx, ny, 1);
        }
      }
      if (structureTags) sprinkleStructures(ctx, structureTags, 3);
      ctx.ensureConnectivity();
      applyPalette(ctx, palette, options.paletteOptions || {});
    };
  }

  function createLoopAlgorithm(options) {
    const {
      loops = 4,
      spacing = 3,
      corridorWidth = 2,
      structureTags,
      palette
    } = options;
    return function(ctx) {
      fillSolid(ctx, 1);
      const safeLoops = ensurePositiveInt(loops, 4, { min: 1, max: 12 });
      const safeSpacing = ensurePositiveInt(spacing, 3, { min: 1, max: 8 });
      const safeCorridor = ensurePositiveInt(corridorWidth, 2, { min: 1, max: 6 });
      const margin = Math.max(2, safeSpacing);
      for (let i = 0; i < safeLoops; i++) {
        const inset = margin + i * safeSpacing;
        carveRectRing(ctx, inset, inset, ctx.width - inset - 1, ctx.height - inset - 1, safeCorridor);
        if (i % 2 === 0) {
          carveDisc(ctx, Math.floor(ctx.width / 2), inset + 2, 2);
          carveDisc(ctx, Math.floor(ctx.width / 2), ctx.height - inset - 3, 2);
        }
      }
      for (let i = 2; i < ctx.height - 2; i += Math.max(4, safeSpacing + 1)) {
        carveRect(ctx, Math.floor(ctx.width / 2) - 1, i, Math.floor(ctx.width / 2) + 1, i + 1);
      }
      if (structureTags) sprinkleStructures(ctx, structureTags, 2);
      ctx.ensureConnectivity();
      applyPalette(ctx, palette, options.paletteOptions || {});
    };
  }

  function createSymmetryAlgorithm(options) {
    const {
      armLength = 12,
      crossWidth = 2,
      includeDiagonals = true,
      structureTags,
      palette
    } = options;
    return function(ctx) {
      fillSolid(ctx, 1);
      const cx = Math.floor(ctx.width / 2);
      const cy = Math.floor(ctx.height / 2);
      const safeArmLength = ensurePositiveInt(armLength, 12, { min: 4, max: 32 });
      const safeCrossWidth = ensurePositiveInt(crossWidth, 2, { min: 1, max: 6 });
      const safeIncludeDiagonal = Boolean(includeDiagonals);
      carveRect(ctx, cx - safeCrossWidth, Math.max(2, cy - safeArmLength), cx + safeCrossWidth, Math.min(ctx.height - 3, cy + safeArmLength));
      carveRect(ctx, Math.max(2, cx - safeArmLength), cy - safeCrossWidth, Math.min(ctx.width - 3, cx + safeArmLength), cy + safeCrossWidth);
      carveDisc(ctx, cx, cy, safeCrossWidth + 2);
      carveRect(ctx, Math.max(2, cx - safeCrossWidth - 4), Math.max(2, cy - safeCrossWidth - 4), Math.min(ctx.width - 3, cx + safeCrossWidth + 4), Math.min(ctx.height - 3, cy + safeCrossWidth + 4));
      if (safeIncludeDiagonal) {
        carveLine(ctx, 2, 2, ctx.width - 3, ctx.height - 3, 1);
        carveLine(ctx, ctx.width - 3, 2, 2, ctx.height - 3, 1);
      }
      if (structureTags) sprinkleStructures(ctx, structureTags, 2);
      ctx.ensureConnectivity();
      applyPalette(ctx, palette, options.paletteOptions || {});
    };
  }

  function createPlazaAlgorithm(options) {
    const {
      radius = 8,
      spokes = 6,
      structureTags,
      palette
    } = options;
    return function(ctx) {
      fillSolid(ctx, 1);
      const cx = Math.floor(ctx.width / 2);
      const cy = Math.floor(ctx.height / 2);
      const safeRadius = ensurePositiveInt(radius, 8, { min: 3, max: 12 });
      const safeSpokes = ensurePositiveInt(spokes, 6, { min: 3, max: 16 });
      carveDisc(ctx, cx, cy, safeRadius);
      carveRing(ctx, cx, cy, safeRadius + 3, 2);
      for (let i = 0; i < safeSpokes; i++) {
        const angle = (Math.PI * 2 * i) / safeSpokes;
        const tx = Math.round(cx + Math.cos(angle) * (safeRadius + 6));
        const ty = Math.round(cy + Math.sin(angle) * (safeRadius + 6));
        carveLine(ctx, cx, cy, tx, ty, 2);
        carveDisc(ctx, Math.round(cx + Math.cos(angle) * (safeRadius + 3)), Math.round(cy + Math.sin(angle) * (safeRadius + 3)), 2);
      }
      if (structureTags) sprinkleStructures(ctx, structureTags, 4);
      ctx.ensureConnectivity();
      applyPalette(ctx, palette, options.paletteOptions || {});
    };
  }

  function createSpiralAlgorithm(options) {
    const {
      turns = 3,
      spacing = 2,
      width = 2,
      structureTags,
      palette
    } = options;
    return function(ctx) {
      fillSolid(ctx, 1);
      let x0 = 2;
      let y0 = 2;
      let x1 = ctx.width - 3;
      let y1 = ctx.height - 3;
      let toggle = 0;
      const safeTurns = ensurePositiveInt(turns, 3, { min: 1, max: 12 });
      const safeSpacing = ensurePositiveInt(spacing, 2, { min: 1, max: 6 });
      const safeWidth = ensurePositiveInt(width, 2, { min: 1, max: 6 });
      while (x0 <= x1 && y0 <= y1) {
        if (toggle % 4 === 0) carveRect(ctx, x0, y0, x1, y0 + safeWidth - 1);
        if (toggle % 4 === 1) carveRect(ctx, x1 - safeWidth + 1, y0, x1, y1);
        if (toggle % 4 === 2) carveRect(ctx, x0, y1 - safeWidth + 1, x1, y1);
        if (toggle % 4 === 3) carveRect(ctx, x0, y0, x0 + safeWidth - 1, y1);
        if (toggle >= safeTurns * 4) break;
        x0 += safeSpacing;
        y0 += safeSpacing;
        x1 -= safeSpacing;
        y1 -= safeSpacing;
        toggle++;
      }
      carveDisc(ctx, Math.floor((x0 + x1) / 2), Math.floor((y0 + y1) / 2), safeWidth + 1);
      if (structureTags) sprinkleStructures(ctx, structureTags, 2);
      ctx.ensureConnectivity();
      applyPalette(ctx, palette, options.paletteOptions || {});
    };
  }

  function createSectorAlgorithm(options) {
    const {
      sectors = 6,
      ringSpacing = 3,
      corridorWidth = 2,
      coreRadius = 3,
      structureTags,
      palette
    } = options;
    return function(ctx) {
      fillSolid(ctx, 1);
      const cx = Math.floor(ctx.width / 2);
      const cy = Math.floor(ctx.height / 2);
      const maxRadius = Math.min(cx, cy) - 2;
      const safeCoreRadius = ensurePositiveInt(coreRadius, 3, { min: 1, max: maxRadius });
      const safeRingSpacing = ensurePositiveInt(ringSpacing, 3, { min: 1, max: 8 });
      const safeCorridor = ensurePositiveInt(corridorWidth, 2, { min: 1, max: 6 });
      const safeSectors = ensurePositiveInt(sectors, 6, { min: 3, max: 16 });
      carveDisc(ctx, cx, cy, Math.max(2, safeCoreRadius));
      for (let r = safeCoreRadius + safeRingSpacing; r < maxRadius; r += safeRingSpacing) {
        carveRing(ctx, cx, cy, r, 1);
      }
      const offset = (ctx.random ? ctx.random() : Math.random()) * Math.PI * 2;
      for (let i = 0; i < safeSectors; i++) {
        const angle = offset + (Math.PI * 2 * i) / safeSectors;
        const next = offset + (Math.PI * 2 * (i + 1)) / safeSectors;
        const mid = (angle + next) / 2;
        const corridorStep = Math.max(2, safeCorridor + 1);
        for (let step = safeCoreRadius + 1; step < maxRadius; step += corridorStep) {
          const x = Math.round(cx + Math.cos(angle) * step);
          const y = Math.round(cy + Math.sin(angle) * step);
          carveRect(ctx, x - Math.floor(safeCorridor / 2), y - Math.floor(safeCorridor / 2), x + Math.floor(safeCorridor / 2), y + Math.floor(safeCorridor / 2));
          if (step % (safeRingSpacing * 2) === 0) {
            const mx = Math.round(cx + Math.cos(mid) * step);
            const my = Math.round(cy + Math.sin(mid) * step);
            carveLine(ctx, x, y, mx, my, Math.max(1, safeCorridor - 1));
          }
        }
      }
      carveRing(ctx, cx, cy, maxRadius - 1, safeCorridor);
      if (structureTags) sprinkleStructures(ctx, structureTags, 3);
      ctx.ensureConnectivity();
      applyPalette(ctx, palette, options.paletteOptions || {});
    };
  }

  function createWeaveAlgorithm(options) {
    const {
      bands = 6,
      bandWidth = 2,
      gap = 2,
      diagonal = false,
      structureTags,
      palette
    } = options;
    return function(ctx) {
      fillSolid(ctx, 1);
      const safeBandWidth = ensurePositiveInt(bandWidth, 2, { min: 1, max: 6 });
      const safeGap = ensurePositiveInt(gap, 2, { min: 1, max: 8 });
      let toggle = 0;
      for (let y = 2; y < ctx.height - 2; y += safeBandWidth + safeGap) {
        for (let yy = 0; yy < safeBandWidth && y + yy < ctx.height - 2; yy++) {
          if (toggle % 2 === 0) {
            carveRect(ctx, 2, y + yy, ctx.width - 3, y + yy);
          } else {
            for (let x = 2; x < ctx.width - 2; x += safeGap + safeBandWidth) {
              carveRect(ctx, x, y + yy, Math.min(ctx.width - 3, x + safeBandWidth - 1), y + yy);
            }
          }
        }
        toggle++;
      }
      toggle = 0;
      for (let x = 2; x < ctx.width - 2; x += safeBandWidth + safeGap) {
        for (let xx = 0; xx < safeBandWidth && x + xx < ctx.width - 2; xx++) {
          if (toggle % 2 === 0) {
            carveRect(ctx, x + xx, 2, x + xx, ctx.height - 3);
          } else {
            for (let y = 2; y < ctx.height - 2; y += safeGap + safeBandWidth) {
              carveRect(ctx, x + xx, y, x + xx, Math.min(ctx.height - 3, y + safeBandWidth - 1));
            }
          }
        }
        toggle++;
      }
      if (diagonal) {
        carveLine(ctx, 2, 2, ctx.width - 3, ctx.height - 3, 1);
        carveLine(ctx, ctx.width - 3, 2, 2, ctx.height - 3, 1);
      }
      carveRect(ctx, Math.floor(ctx.width / 2) - 1, 2, Math.floor(ctx.width / 2) + 1, ctx.height - 3);
      carveRect(ctx, 2, Math.floor(ctx.height / 2) - 1, ctx.width - 3, Math.floor(ctx.height / 2) + 1);
      if (structureTags) sprinkleStructures(ctx, structureTags, 4);
      ctx.ensureConnectivity();
      applyPalette(ctx, palette, options.paletteOptions || {});
    };
  }

  function createClusterAlgorithm(options) {
    const {
      clusters = 8,
      minRadius = 2,
      maxRadius = 5,
      connectors = 6,
      structureTags,
      palette
    } = options;
    return function(ctx) {
      fillSolid(ctx, 1);
      const safeClusters = ensurePositiveInt(clusters, 8, { min: 1, max: 32 });
      const safeMinRadius = ensurePositiveInt(minRadius, 2, { min: 1, max: 6 });
      const safeMaxRadius = ensurePositiveInt(maxRadius, Math.max(safeMinRadius, 5), { min: safeMinRadius, max: 10 });
      const safeConnectors = ensurePositiveInt(connectors, 6, { min: 0, max: 32 });
      const points = [];
      for (let i = 0; i < safeClusters; i++) {
        const radius = randomInt(ctx, safeMinRadius, safeMaxRadius);
        const px = randomInt(ctx, 4, ctx.width - 5);
        const py = randomInt(ctx, 4, ctx.height - 5);
        carveDisc(ctx, px, py, radius);
        points.push({ x: px, y: py });
      }
      const cx = Math.floor(ctx.width / 2);
      const cy = Math.floor(ctx.height / 2);
      carveDisc(ctx, cx, cy, Math.max(safeMinRadius + 1, 3));
      points.forEach(p => {
        carveLine(ctx, cx, cy, p.x, p.y, 2);
      });
      for (let i = 0; i < safeConnectors && points.length > 1; i++) {
        const a = points[randomInt(ctx, 0, points.length - 1)];
        const b = points[randomInt(ctx, 0, points.length - 1)];
        if (a !== b) carveLine(ctx, a.x, a.y, b.x, b.y, 2);
      }
      if (structureTags) sprinkleStructures(ctx, structureTags, 3);
      ctx.ensureConnectivity();
      applyPalette(ctx, palette, options.paletteOptions || {});
    };
  }

  const styleFactories = {
    hub: createHubAlgorithm,
    grid: createGridAlgorithm,
    flow: createFlowAlgorithm,
    organic: createOrganicAlgorithm,
    platforms: createPlatformAlgorithm,
    loop: createLoopAlgorithm,
    symmetry: createSymmetryAlgorithm,
    plaza: createPlazaAlgorithm,
    spiral: createSpiralAlgorithm,
    sector: createSectorAlgorithm,
    weave: createWeaveAlgorithm,
    cluster: createClusterAlgorithm
  };
  const generatorConfigs = [
    {
      id: 'spaceship_core',
      name: '機関部ノード',
      nameKey: "dungeon.types.spaceship_core.name",
      description: '反応炉周辺のリングと放射状の保守路。',
      descriptionKey: "dungeon.types.spaceship_core.description",
      palette: { floor: '#0F1E33', wall: '#08111F', accent: '#2FD3FF' },
      mixin: { normalMixed: 0.3, blockDimMixed: 0.5, tags: ['sf', 'spaceship', 'technical'] },
      style: 'hub',
      arms: 6,
      rings: 4,
      coreRadius: 4,
      paletteOptions: { accentStride: 6 },
      structureTags: ['spaceship', 'hub'],
      soundscape: 'ship-engine'
    },
    {
      id: 'spaceship_hab',
      name: '居住区モジュール',
      nameKey: "dungeon.types.spaceship_hab.name",
      description: 'コリドーがグリッド状に走る生活区画。',
      descriptionKey: "dungeon.types.spaceship_hab.description",
      palette: { floor: '#1F2D3F', wall: '#32465A', accent: '#4BE2C2' },
      mixin: { normalMixed: 0.25, blockDimMixed: 0.4, tags: ['sf', 'spaceship', 'residential'] },
      style: 'grid',
      cellSize: 4,
      corridorWidth: 2,
      openings: 8,
      structureTags: ['spaceship', 'residential'],
      paletteOptions: { accentChance: 0.1 },
      soundscape: 'habitat-murmur'
    },
    {
      id: 'spaceship_dock',
      name: 'ドックベイ',
      nameKey: "dungeon.types.spaceship_dock.name",
      description: '巨大ハンガーと貨物レーンが交差する船舶ドック。',
      descriptionKey: "dungeon.types.spaceship_dock.description",
      palette: { floor: '#15283B', wall: '#071421', accent: '#5AA4FF' },
      mixin: { normalMixed: 0.35, blockDimMixed: 0.5, tags: ['sf', 'spaceship', 'industrial'] },
      style: 'flow',
      streams: 5,
      steps: 110,
      width: 3,
      branchInterval: 14,
      structureTags: ['spaceship', 'industrial'],
      paletteOptions: { accentStride: 4 },
      soundscape: 'dock-hum'
    },
    {
      id: 'spaceship_ai',
      name: '指令AI中枢',
      nameKey: "dungeon.types.spaceship_ai.name",
      description: '演算コアが同心ループで守られた制御中枢。',
      descriptionKey: "dungeon.types.spaceship_ai.description",
      palette: { floor: '#112233', wall: '#050B11', accent: '#7E5CFF' },
      mixin: { normalMixed: 0.2, blockDimMixed: 0.35, tags: ['sf', 'spaceship', 'ai'] },
      style: 'loop',
      loops: 5,
      spacing: 2,
      corridorWidth: 2,
      structureTags: ['spaceship', 'ai'],
      paletteOptions: { accentChance: 0.06 },
      soundscape: 'core-thrum'
    },
    {
      id: 'spaceship_medbay',
      name: 'メディカルベイ',
      nameKey: "dungeon.types.spaceship_medbay.name",
      description: '無菌処置室が十字に配置された治療層。',
      descriptionKey: "dungeon.types.spaceship_medbay.description",
      palette: { floor: '#143347', wall: '#0B1E2B', accent: '#55F3E9' },
      mixin: { normalMixed: 0.22, blockDimMixed: 0.35, tags: ['sf', 'spaceship', 'medical'] },
      style: 'symmetry',
      armLength: 10,
      crossWidth: 2,
      includeDiagonals: false,
      structureTags: ['spaceship', 'medical'],
      paletteOptions: { accentStride: 4, accentChance: 0.12 },
      soundscape: 'med-lab'
    },
    {
      id: 'spaceship_engineering',
      name: '保守機関層',
      nameKey: "dungeon.types.spaceship_engineering.name",
      description: '補修用ブリッジと配管が密集する工学区画。',
      descriptionKey: "dungeon.types.spaceship_engineering.description",
      palette: { floor: '#1A2639', wall: '#0A141F', accent: '#FFB347' },
      mixin: { normalMixed: 0.28, blockDimMixed: 0.45, tags: ['sf', 'spaceship', 'engineering'] },
      style: 'flow',
      streams: 5,
      steps: 120,
      width: 2,
      branchInterval: 12,
      structureTags: ['spaceship', 'engineering'],
      paletteOptions: { accentChance: 0.1 },
      soundscape: 'maintenance-rattle'
    },

    {
      id: 'cyber_grid',
      name: 'データグリッド',
      nameKey: "dungeon.types.cyber_grid.name",
      description: '直交グリッドが無限に伸びるデータ層。',
      descriptionKey: "dungeon.types.cyber_grid.description",
      palette: { floor: '#090513', wall: '#211A6B', accent: '#45E0FF' },
      mixin: { normalMixed: 0.3, blockDimMixed: 0.45, tags: ['sf', 'cyber', 'grid'] },
      style: 'grid',
      cellSize: 3,
      corridorWidth: 2,
      openings: 10,
      structureTags: ['cyber', 'grid'],
      paletteOptions: { accentStride: 3 },
      soundscape: 'data-flow'
    },
    {
      id: 'cyber_vault',
      name: 'セキュリティヴォールト',
      nameKey: "dungeon.types.cyber_vault.name",
      description: '層状のファイアウォールとバンカーが守るデータ金庫。',
      descriptionKey: "dungeon.types.cyber_vault.description",
      palette: { floor: '#12132A', wall: '#2E1B4B', accent: '#8F53FF' },
      mixin: { normalMixed: 0.25, blockDimMixed: 0.4, tags: ['sf', 'cyber', 'security'] },
      style: 'loop',
      loops: 4,
      spacing: 3,
      corridorWidth: 3,
      structureTags: ['cyber', 'security'],
      paletteOptions: { accentChance: 0.05 },
      soundscape: 'vault-drone'
    },
    {
      id: 'cyber_glitch',
      name: 'グリッチ領域',
      nameKey: "dungeon.types.cyber_glitch.name",
      description: '乱数的な欠損が散在する不安定領域。',
      descriptionKey: "dungeon.types.cyber_glitch.description",
      palette: { floor: '#0A3B3C', wall: '#0F1F20', accent: '#C1FF2E' },
      mixin: { normalMixed: 0.15, blockDimMixed: 0.35, tags: ['sf', 'cyber', 'chaos'] },
      style: 'organic',
      fillChance: 0.52,
      smoothSteps: 2,
      structureTags: ['cyber', 'chaos'],
      paletteOptions: { accentChance: 0.15 },
      soundscape: 'glitch-static'
    },
    {
      id: 'cyber_stream',
      name: '情報フロー帯',
      nameKey: "dungeon.types.cyber_stream.name",
      description: '流線的な情報の大河が流れる帯域。',
      descriptionKey: "dungeon.types.cyber_stream.description",
      palette: { floor: '#051B2C', wall: '#0B3857', accent: '#1BFF9F' },
      mixin: { normalMixed: 0.3, blockDimMixed: 0.4, tags: ['sf', 'cyber', 'flow'] },
      style: 'flow',
      streams: 6,
      steps: 130,
      width: 2,
      branchInterval: 16,
      structureTags: ['cyber', 'flow'],
      paletteOptions: { accentChance: 0.12 },
      soundscape: 'data-stream'
    },
    {
      id: 'cyber_forum',
      name: 'ソーシャルホール',
      nameKey: "dungeon.types.cyber_forum.name",
      description: 'ホログラム座席が円環状に整列する交流広場。',
      descriptionKey: "dungeon.types.cyber_forum.description",
      palette: { floor: '#1A0D3A', wall: '#3A1266', accent: '#FF4BD1' },
      mixin: { normalMixed: 0.28, blockDimMixed: 0.42, tags: ['sf', 'cyber', 'forum'] },
      style: 'plaza',
      radius: 7,
      spokes: 8,
      structureTags: ['cyber', 'forum'],
      paletteOptions: { accentChance: 0.14 },
      soundscape: 'holo-voices'
    },
    {
      id: 'cyber_subroutine',
      name: 'サブルーチン回廊',
      nameKey: "dungeon.types.cyber_subroutine.name",
      description: '同期ゲートで区切られた連続回廊。',
      descriptionKey: "dungeon.types.cyber_subroutine.description",
      palette: { floor: '#051F2A', wall: '#04353F', accent: '#5CFF8F' },
      mixin: { normalMixed: 0.32, blockDimMixed: 0.45, tags: ['sf', 'cyber', 'utility'] },
      style: 'symmetry',
      armLength: 14,
      crossWidth: 1,
      includeDiagonals: true,
      structureTags: ['cyber', 'utility'],
      paletteOptions: { accentStride: 4 },
      soundscape: 'clocked-ticks'
    },
    {
      id: 'future_plaza',
      name: 'ホログラム広場',
      nameKey: "dungeon.types.future_plaza.name",
      description: '浮遊広告塔が立ち並ぶ中心広場。',
      descriptionKey: "dungeon.types.future_plaza.description",
      palette: { floor: '#124652', wall: '#1D6F7A', accent: '#3BFFFF' },
      mixin: { normalMixed: 0.35, blockDimMixed: 0.5, tags: ['sf', 'city', 'plaza'] },
      style: 'plaza',
      radius: 9,
      spokes: 6,
      structureTags: ['future', 'plaza'],
      paletteOptions: { accentChance: 0.16 },
      soundscape: 'city-hum'
    },
    {
      id: 'future_industrial',
      name: 'メガ工場層',
      nameKey: "dungeon.types.future_industrial.name",
      description: 'ナノ炉とコンベアが連結する工業区。',
      descriptionKey: "dungeon.types.future_industrial.description",
      palette: { floor: '#1E2B3C', wall: '#3A5169', accent: '#FFBF3B' },
      mixin: { normalMixed: 0.3, blockDimMixed: 0.45, tags: ['sf', 'city', 'industrial'] },
      style: 'grid',
      cellSize: 5,
      corridorWidth: 2,
      openings: 7,
      structureTags: ['future', 'industrial'],
      paletteOptions: { accentChance: 0.08 },
      soundscape: 'factory-rumble'
    },
    {
      id: 'future_sky',
      name: 'スカイドメイン',
      nameKey: "dungeon.types.future_sky.name",
      description: '浮遊プラットフォームと昇降路が交差する高層域。',
      descriptionKey: "dungeon.types.future_sky.description",
      palette: { floor: '#101A33', wall: '#233A66', accent: '#77F6FF' },
      mixin: { normalMixed: 0.25, blockDimMixed: 0.4, tags: ['sf', 'city', 'aerial'] },
      style: 'platforms',
      islands: 8,
      platformRadius: 3,
      bridgeWidth: 2,
      structureTags: ['future', 'aerial'],
      paletteOptions: { accentChance: 0.1 },
      soundscape: 'wind-turbine'
    },
    {
      id: 'future_core',
      name: '都市制御局',
      nameKey: "dungeon.types.future_core.name",
      description: '制御卓が集中する統制センター。',
      descriptionKey: "dungeon.types.future_core.description",
      palette: { floor: '#162938', wall: '#0C141D', accent: '#49FFB5' },
      mixin: { normalMixed: 0.2, blockDimMixed: 0.35, tags: ['sf', 'city', 'control'] },
      style: 'symmetry',
      armLength: 12,
      crossWidth: 2,
      includeDiagonals: true,
      structureTags: ['future', 'control'],
      paletteOptions: { accentChance: 0.06 },
      soundscape: 'command-ops'
    },
    {
      id: 'future_residential',
      name: 'コロニー住居帯',
      nameKey: "dungeon.types.future_residential.name",
      description: 'モジュール住宅が連なる住居棟。',
      descriptionKey: "dungeon.types.future_residential.description",
      palette: { floor: '#1B2F39', wall: '#223B44', accent: '#7FFFD7' },
      mixin: { normalMixed: 0.32, blockDimMixed: 0.45, tags: ['sf', 'city', 'residential'] },
      style: 'grid',
      cellSize: 4,
      corridorWidth: 2,
      openings: 6,
      structureTags: ['future', 'residential'],
      paletteOptions: { accentChance: 0.12 },
      soundscape: 'residence-soft'
    },
    {
      id: 'future_underworks',
      name: 'アンダーワークス',
      nameKey: "dungeon.types.future_underworks.name",
      description: '廃熱管と補修橋が巡る地下保守層。',
      descriptionKey: "dungeon.types.future_underworks.description",
      palette: { floor: '#0D1724', wall: '#121E2D', accent: '#88FF52' },
      mixin: { normalMixed: 0.26, blockDimMixed: 0.38, tags: ['sf', 'city', 'maintenance'] },
      style: 'organic',
      fillChance: 0.48,
      smoothSteps: 3,
      structureTags: ['future', 'maintenance'],
      paletteOptions: { accentChance: 0.09 },
      soundscape: 'steam-vents'
    },

    {
      id: 'orbital_ring',
      name: '軌道リング廊',
      nameKey: "dungeon.types.orbital_ring.name",
      description: 'リング状の回廊が星を周回する。',
      descriptionKey: "dungeon.types.orbital_ring.description",
      palette: { floor: '#111B28', wall: '#202F45', accent: '#64FFE3' },
      mixin: { normalMixed: 0.3, blockDimMixed: 0.45, tags: ['sf', 'orbital', 'ring'] },
      style: 'hub',
      arms: 8,
      rings: 5,
      coreRadius: 5,
      paletteOptions: { accentStride: 5 },
      structureTags: ['orbital', 'ring'],
      soundscape: 'orbital-comm'
    },
    {
      id: 'orbital_lab',
      name: '真空ラボ',
      nameKey: "dungeon.types.orbital_lab.name",
      description: '零G実験室が配置された研究ハブ。',
      descriptionKey: "dungeon.types.orbital_lab.description",
      palette: { floor: '#132435', wall: '#06121E', accent: '#7BD8FF' },
      mixin: { normalMixed: 0.25, blockDimMixed: 0.35, tags: ['sf', 'orbital', 'lab'] },
      style: 'grid',
      cellSize: 4,
      corridorWidth: 2,
      openings: 5,
      structureTags: ['orbital', 'lab'],
      paletteOptions: { accentChance: 0.07 },
      soundscape: 'lab-hum'
    },
    {
      id: 'orbital_armory',
      name: '軍備庫層',
      nameKey: "dungeon.types.orbital_armory.name",
      description: '磁気弾薬庫が並ぶ防衛セクション。',
      descriptionKey: "dungeon.types.orbital_armory.description",
      palette: { floor: '#1B1E2B', wall: '#2F3547', accent: '#FF4F64' },
      mixin: { normalMixed: 0.2, blockDimMixed: 0.35, tags: ['sf', 'orbital', 'armory'] },
      style: 'loop',
      loops: 4,
      spacing: 2,
      corridorWidth: 3,
      structureTags: ['orbital', 'armory'],
      paletteOptions: { accentChance: 0.05 },
      soundscape: 'armory-drum'
    },
    {
      id: 'orbital_greenhouse',
      name: '宇宙温室帯',
      nameKey: "dungeon.types.orbital_greenhouse.name",
      description: '水耕プールが連なる生態維持区画。',
      descriptionKey: "dungeon.types.orbital_greenhouse.description",
      palette: { floor: '#123123', wall: '#071A10', accent: '#6CFF7A' },
      mixin: { normalMixed: 0.22, blockDimMixed: 0.35, tags: ['sf', 'orbital', 'bio'] },
      style: 'organic',
      fillChance: 0.5,
      smoothSteps: 4,
      structureTags: ['orbital', 'bio'],
      paletteOptions: { accentChance: 0.11 },
      soundscape: 'greenhouse-air'
    },
    {
      id: 'orbital_command',
      name: '指令甲板',
      nameKey: "dungeon.types.orbital_command.name",
      description: '指揮卓とセンサーが集中する管制甲板。',
      descriptionKey: "dungeon.types.orbital_command.description",
      palette: { floor: '#0F1626', wall: '#1D2740', accent: '#4CF0FF' },
      mixin: { normalMixed: 0.18, blockDimMixed: 0.32, tags: ['sf', 'orbital', 'command'] },
      style: 'symmetry',
      armLength: 11,
      crossWidth: 2,
      includeDiagonals: true,
      structureTags: ['orbital', 'command'],
      paletteOptions: { accentChance: 0.05 },
      soundscape: 'command-bridge'
    },

    {
      id: 'quantum_reactor',
      name: '量子炉チャンバー',
      nameKey: "dungeon.types.quantum_reactor.name",
      description: '螺旋状に配置された量子束柱が唸る。',
      descriptionKey: "dungeon.types.quantum_reactor.description",
      palette: { floor: '#170B2C', wall: '#2A1752', accent: '#FF3CF0' },
      mixin: { normalMixed: 0.2, blockDimMixed: 0.3, tags: ['sf', 'quantum', 'reactor'] },
      style: 'spiral',
      turns: 4,
      spacing: 2,
      width: 2,
      structureTags: ['quantum', 'reactor'],
      paletteOptions: { accentChance: 0.12 },
      soundscape: 'quantum-thrum'
    },
    {
      id: 'quantum_archive',
      name: '記録保管層',
      nameKey: "dungeon.types.quantum_archive.name",
      description: '時間結晶が整然と並ぶ書架帯。',
      descriptionKey: "dungeon.types.quantum_archive.description",
      palette: { floor: '#1F142E', wall: '#2C1F43', accent: '#3CE3FF' },
      mixin: { normalMixed: 0.15, blockDimMixed: 0.3, tags: ['sf', 'quantum', 'archive'] },
      style: 'grid',
      cellSize: 3,
      corridorWidth: 2,
      openings: 5,
      structureTags: ['quantum', 'archive'],
      paletteOptions: { accentChance: 0.06 },
      soundscape: 'archive-chime'
    },
    {
      id: 'quantum_void',
      name: '位相虚空',
      nameKey: "dungeon.types.quantum_void.name",
      description: '断片的な足場が浮遊する虚無領域。',
      descriptionKey: "dungeon.types.quantum_void.description",
      palette: { floor: '#04070E', wall: '#000000', accent: '#66FFAA' },
      mixin: { normalMixed: 0.1, blockDimMixed: 0.25, tags: ['sf', 'quantum', 'void'] },
      style: 'platforms',
      islands: 6,
      platformRadius: 2,
      bridgeWidth: 1,
      structureTags: ['quantum', 'void'],
      paletteOptions: { accentChance: 0.18 },
      soundscape: 'void-whisper'
    },
    {
      id: 'quantum_prism',
      name: 'プリズム観測塔',
      nameKey: "dungeon.types.quantum_prism.name",
      description: '光束導鏡で構成された観測ループ。',
      descriptionKey: "dungeon.types.quantum_prism.description",
      palette: { floor: '#1E0E36', wall: '#2F125A', accent: '#FFD84F' },
      mixin: { normalMixed: 0.18, blockDimMixed: 0.28, tags: ['sf', 'quantum', 'light'] },
      style: 'hub',
      arms: 5,
      rings: 3,
      coreRadius: 4,
      paletteOptions: { accentChance: 0.1 },
      structureTags: ['quantum', 'light'],
      soundscape: 'prism-hum'
    },
    {
      id: 'chrono_station',
      name: '時間駅',
      nameKey: "dungeon.types.chrono_station.name",
      description: '停滞ホームが並ぶクロノ・プラットフォーム。',
      descriptionKey: "dungeon.types.chrono_station.description",
      palette: { floor: '#14243E', wall: '#233861', accent: '#FF6BC4' },
      mixin: { normalMixed: 0.16, blockDimMixed: 0.3, tags: ['sf', 'chrono', 'station'] },
      style: 'symmetry',
      armLength: 13,
      crossWidth: 2,
      includeDiagonals: false,
      structureTags: ['chrono', 'station'],
      paletteOptions: { accentChance: 0.08 },
      soundscape: 'station-chime'
    },
    {
      id: 'chrono_loop',
      name: '反復ループ域',
      nameKey: "dungeon.types.chrono_loop.name",
      description: '閉じたループが時間を循環させる領域。',
      descriptionKey: "dungeon.types.chrono_loop.description",
      palette: { floor: '#0B1A21', wall: '#132A32', accent: '#74FFE5' },
      mixin: { normalMixed: 0.14, blockDimMixed: 0.28, tags: ['sf', 'chrono', 'loop'] },
      style: 'spiral',
      turns: 5,
      spacing: 2,
      width: 2,
      structureTags: ['chrono', 'loop'],
      paletteOptions: { accentChance: 0.14 },
      soundscape: 'loop-echo'
    },
    {
      id: 'xeno_jungle',
      name: '異星樹海',
      nameKey: "dungeon.types.xeno_jungle.name",
      description: '繁茂する発光樹液で満たされた樹海。',
      descriptionKey: "dungeon.types.xeno_jungle.description",
      palette: { floor: '#093326', wall: '#042018', accent: '#5BFF8C' },
      mixin: { normalMixed: 0.28, blockDimMixed: 0.38, tags: ['sf', 'xeno', 'jungle'] },
      style: 'organic',
      fillChance: 0.55,
      smoothSteps: 4,
      structureTags: ['xeno', 'organic'],
      paletteOptions: { accentChance: 0.15 },
      soundscape: 'alien-fauna'
    },
    {
      id: 'xeno_crystal',
      name: '結晶洞',
      nameKey: "dungeon.types.xeno_crystal.name",
      description: '共鳴結晶が層を為す洞窟帯。',
      descriptionKey: "dungeon.types.xeno_crystal.description",
      palette: { floor: '#0B1430', wall: '#16224A', accent: '#7DFFFB' },
      mixin: { normalMixed: 0.22, blockDimMixed: 0.34, tags: ['sf', 'xeno', 'crystal'] },
      style: 'loop',
      loops: 4,
      spacing: 3,
      corridorWidth: 2,
      structureTags: ['xeno', 'crystal'],
      paletteOptions: { accentChance: 0.13 },
      soundscape: 'crystal-tone'
    },
    {
      id: 'xeno_ruins',
      name: '古代遺構',
      nameKey: "dungeon.types.xeno_ruins.name",
      description: '刻印された遺跡が散在する異星遺構帯。',
      descriptionKey: "dungeon.types.xeno_ruins.description",
      palette: { floor: '#1E1B26', wall: '#2C2433', accent: '#FFAA54' },
      mixin: { normalMixed: 0.24, blockDimMixed: 0.36, tags: ['sf', 'xeno', 'ruins'] },
      style: 'plaza',
      radius: 8,
      spokes: 5,
      structureTags: ['xeno', 'ruins'],
      paletteOptions: { accentChance: 0.09 },
      soundscape: 'ruin-wind'
    },
    {
      id: 'xeno_tide',
      name: '潮汐ラボ',
      nameKey: "dungeon.types.xeno_tide.name",
      description: '液状の潮汐が往復する研究帯。',
      descriptionKey: "dungeon.types.xeno_tide.description",
      palette: { floor: '#0A1E3F', wall: '#083A5C', accent: '#4DF6FF' },
      mixin: { normalMixed: 0.2, blockDimMixed: 0.32, tags: ['sf', 'xeno', 'tide'] },
      style: 'flow',
      streams: 5,
      steps: 120,
      width: 2,
      branchInterval: 15,
      structureTags: ['xeno', 'tide'],
      paletteOptions: { accentChance: 0.11 },
      soundscape: 'tidal-rush'
    },
    {
      id: 'xeno_desert',
      name: '微粒砂層',
      nameKey: "dungeon.types.xeno_desert.name",
      description: '砂丘と耐砂ブリッジが複雑に絡む砂層。',
      descriptionKey: "dungeon.types.xeno_desert.description",
      palette: { floor: '#2B1C0F', wall: '#3A2815', accent: '#FFC66B' },
      mixin: { normalMixed: 0.26, blockDimMixed: 0.35, tags: ['sf', 'xeno', 'desert'] },
      style: 'flow',
      streams: 4,
      steps: 100,
      width: 2,
      branchInterval: 20,
      structureTags: ['xeno', 'desert'],
      paletteOptions: { accentChance: 0.1 },
      soundscape: 'sand-shift'
    },

    {
      id: 'colony_foundry',
      name: '鋳造区画',
      nameKey: "dungeon.types.colony_foundry.name",
      description: 'レーザー炉と補給レールが並列する生産柱。',
      descriptionKey: "dungeon.types.colony_foundry.description",
      palette: { floor: '#1F1F2D', wall: '#2D2D44', accent: '#FF7A3C' },
      mixin: { normalMixed: 0.3, blockDimMixed: 0.44, tags: ['sf', 'colony', 'foundry'] },
      style: 'grid',
      cellSize: 4,
      corridorWidth: 2,
      openings: 6,
      structureTags: ['colony', 'foundry'],
      paletteOptions: { accentChance: 0.07 },
      soundscape: 'forge-roar'
    },
    {
      id: 'colony_spire',
      name: '管制スパイア',
      nameKey: "dungeon.types.colony_spire.name",
      description: '縦方向へ積層された管制塔。',
      descriptionKey: "dungeon.types.colony_spire.description",
      palette: { floor: '#101B2C', wall: '#1C2F46', accent: '#5AF0FF' },
      mixin: { normalMixed: 0.18, blockDimMixed: 0.3, tags: ['sf', 'colony', 'command'] },
      style: 'symmetry',
      armLength: 14,
      crossWidth: 2,
      includeDiagonals: true,
      structureTags: ['colony', 'command'],
      paletteOptions: { accentChance: 0.05 },
      soundscape: 'spire-signal'
    },
    {
      id: 'colony_commons',
      name: 'コモンズ',
      nameKey: "dungeon.types.colony_commons.name",
      description: '市民交流のための共有中庭。',
      descriptionKey: "dungeon.types.colony_commons.description",
      palette: { floor: '#1A2D2E', wall: '#223B3C', accent: '#94FFDD' },
      mixin: { normalMixed: 0.34, blockDimMixed: 0.48, tags: ['sf', 'colony', 'commons'] },
      style: 'plaza',
      radius: 9,
      spokes: 7,
      structureTags: ['colony', 'commons'],
      paletteOptions: { accentChance: 0.16 },
      soundscape: 'commons-voices'
    },
    {
      id: 'colony_reactor',
      name: 'コロニー炉心',
      nameKey: "dungeon.types.colony_reactor.name",
      description: '余熱導管が束ねられた炉心基底。',
      descriptionKey: "dungeon.types.colony_reactor.description",
      palette: { floor: '#220F2C', wall: '#331635', accent: '#FF57B0' },
      mixin: { normalMixed: 0.22, blockDimMixed: 0.34, tags: ['sf', 'colony', 'reactor'] },
      style: 'hub',
      arms: 6,
      rings: 4,
      coreRadius: 4,
      structureTags: ['colony', 'reactor'],
      paletteOptions: { accentChance: 0.1 },
      soundscape: 'reactor-core'
    },
    {
      id: 'spaceship_warp',
      name: 'ワープハンガー',
      nameKey: "dungeon.types.spaceship_warp.name",
      description: '星間跳躍ゲートが扇状に配置されたベイ。',
      descriptionKey: "dungeon.types.spaceship_warp.description",
      palette: { floor: '#081F38', wall: '#050D18', accent: '#5C9DFF' },
      mixin: { normalMixed: 0.18, blockDimMixed: 0.32, tags: ['sf', 'spaceship', 'warp'] },
      style: 'sector',
      sectors: 7,
      ringSpacing: 3,
      corridorWidth: 2,
      coreRadius: 4,
      structureTags: ['spaceship', 'warp'],
      paletteOptions: { accentChance: 0.08 },
      soundscape: 'warp-resonance'
    },
    {
      id: 'spaceship_observatory',
      name: '星間観測ドーム',
      nameKey: "dungeon.types.spaceship_observatory.name",
      description: 'パノラミックドームを通して星図を投影する観測層。',
      descriptionKey: "dungeon.types.spaceship_observatory.description",
      palette: { floor: '#0C1F33', wall: '#091423', accent: '#7DE9FF' },
      mixin: { normalMixed: 0.2, blockDimMixed: 0.34, tags: ['sf', 'spaceship', 'observatory'] },
      style: 'weave',
      bands: 6,
      bandWidth: 2,
      gap: 2,
      diagonal: true,
      structureTags: ['spaceship', 'observation'],
      paletteOptions: { accentChance: 0.11 },
      soundscape: 'stellar-pulse'
    },
    {
      id: 'cyber_arena',
      name: 'シミュレーションアリーナ',
      nameKey: "dungeon.types.cyber_arena.name",
      description: '層状のホログラム壁が交差する訓練領域。',
      descriptionKey: "dungeon.types.cyber_arena.description",
      palette: { floor: '#0A1230', wall: '#1C2461', accent: '#FF43B9' },
      mixin: { normalMixed: 0.26, blockDimMixed: 0.4, tags: ['sf', 'cyber', 'arena'] },
      style: 'weave',
      bands: 7,
      bandWidth: 2,
      gap: 2,
      diagonal: true,
      structureTags: ['cyber', 'arena'],
      paletteOptions: { accentChance: 0.18 },
      soundscape: 'arena-beat'
    },
    {
      id: 'cyber_mirror',
      name: 'ミラールーム',
      nameKey: "dungeon.types.cyber_mirror.name",
      description: '反射するデータ層が多面体状に連結する領域。',
      descriptionKey: "dungeon.types.cyber_mirror.description",
      palette: { floor: '#071428', wall: '#1D305A', accent: '#7CFFEE' },
      mixin: { normalMixed: 0.21, blockDimMixed: 0.36, tags: ['sf', 'cyber', 'mirror'] },
      style: 'cluster',
      clusters: 10,
      minRadius: 2,
      maxRadius: 4,
      connectors: 8,
      structureTags: ['cyber', 'mirror'],
      paletteOptions: { accentChance: 0.12 },
      soundscape: 'mirror-chime'
    },
    {
      id: 'future_metro',
      name: 'ハイパーメトロ網',
      nameKey: "dungeon.types.future_metro.name",
      description: '多層リニアが編み込まれた交通結節点。',
      descriptionKey: "dungeon.types.future_metro.description",
      palette: { floor: '#142A38', wall: '#1B3C4F', accent: '#54FFE2' },
      mixin: { normalMixed: 0.33, blockDimMixed: 0.48, tags: ['sf', 'city', 'metro'] },
      style: 'weave',
      bands: 6,
      bandWidth: 3,
      gap: 2,
      diagonal: true,
      structureTags: ['future', 'transport'],
      paletteOptions: { accentChance: 0.13 },
      soundscape: 'metro-thunder'
    },
    {
      id: 'future_cloudport',
      name: 'クラウドポート',
      nameKey: "dungeon.types.future_cloudport.name",
      description: '浮遊港湾と気流制御塔がクラスタを成す空港域。',
      descriptionKey: "dungeon.types.future_cloudport.description",
      palette: { floor: '#12284C', wall: '#152036', accent: '#8DFFFA' },
      mixin: { normalMixed: 0.24, blockDimMixed: 0.38, tags: ['sf', 'city', 'cloudport'] },
      style: 'cluster',
      clusters: 9,
      minRadius: 2,
      maxRadius: 5,
      connectors: 7,
      structureTags: ['future', 'aerial', 'port'],
      paletteOptions: { accentChance: 0.1 },
      soundscape: 'aero-drift'
    },
    {
      id: 'orbital_scrapyard',
      name: '軌道スクラップ場',
      nameKey: "dungeon.types.orbital_scrapyard.name",
      description: '廃船残骸を繋ぎ合わせた浮遊修繕帯。',
      descriptionKey: "dungeon.types.orbital_scrapyard.description",
      palette: { floor: '#1B1F2C', wall: '#242F3D', accent: '#FF7B42' },
      mixin: { normalMixed: 0.27, blockDimMixed: 0.38, tags: ['sf', 'orbital', 'scrap'] },
      style: 'cluster',
      clusters: 11,
      minRadius: 2,
      maxRadius: 5,
      connectors: 9,
      structureTags: ['orbital', 'scrap'],
      paletteOptions: { accentChance: 0.08 },
      soundscape: 'scrap-grind'
    },
    {
      id: 'orbital_listening',
      name: 'リスニングステーション',
      nameKey: "dungeon.types.orbital_listening.name",
      description: '星間通信を受信する放射状アンテナリング。',
      descriptionKey: "dungeon.types.orbital_listening.description",
      palette: { floor: '#0E1D2F', wall: '#142A3F', accent: '#4CF2FF' },
      mixin: { normalMixed: 0.19, blockDimMixed: 0.32, tags: ['sf', 'orbital', 'listening'] },
      style: 'sector',
      sectors: 8,
      ringSpacing: 3,
      corridorWidth: 2,
      coreRadius: 3,
      structureTags: ['orbital', 'antenna'],
      paletteOptions: { accentChance: 0.07 },
      soundscape: 'signal-sweep'
    },
    {
      id: 'quantum_flux',
      name: 'フラックス遷移域',
      nameKey: "dungeon.types.quantum_flux.name",
      description: '量子層が位相リングで共鳴する遷移コア。',
      descriptionKey: "dungeon.types.quantum_flux.description",
      palette: { floor: '#150926', wall: '#26103F', accent: '#FF72ED' },
      mixin: { normalMixed: 0.17, blockDimMixed: 0.3, tags: ['sf', 'quantum', 'flux'] },
      style: 'sector',
      sectors: 9,
      ringSpacing: 2,
      corridorWidth: 2,
      coreRadius: 5,
      structureTags: ['quantum', 'flux'],
      paletteOptions: { accentChance: 0.15 },
      soundscape: 'flux-hum'
    },
    {
      id: 'chrono_archive',
      name: '時間アーカイブ',
      nameKey: "dungeon.types.chrono_archive.name",
      description: '時間波形を編み込んだ螺旋書庫。',
      descriptionKey: "dungeon.types.chrono_archive.description",
      palette: { floor: '#111C31', wall: '#19273F', accent: '#FF85D6' },
      mixin: { normalMixed: 0.15, blockDimMixed: 0.29, tags: ['sf', 'chrono', 'archive'] },
      style: 'weave',
      bands: 6,
      bandWidth: 2,
      gap: 2,
      diagonal: true,
      structureTags: ['chrono', 'archive'],
      paletteOptions: { accentChance: 0.12 },
      soundscape: 'chronicle-ripple'
    },
    {
      id: 'chrono_fracture',
      name: '時空断層帯',
      nameKey: "dungeon.types.chrono_fracture.name",
      description: '断層ゲートが群を成し予測不能な分岐を生む領域。',
      descriptionKey: "dungeon.types.chrono_fracture.description",
      palette: { floor: '#0A1A24', wall: '#121F2C', accent: '#74FFF4' },
      mixin: { normalMixed: 0.13, blockDimMixed: 0.28, tags: ['sf', 'chrono', 'fracture'] },
      style: 'cluster',
      clusters: 8,
      minRadius: 2,
      maxRadius: 4,
      connectors: 10,
      structureTags: ['chrono', 'fracture'],
      paletteOptions: { accentChance: 0.14 },
      soundscape: 'fracture-echo'
    },
    {
      id: 'xeno_hive',
      name: '異星ハイブ',
      nameKey: "dungeon.types.xeno_hive.name",
      description: '有機質の胞巣が層を為す生命圏。',
      descriptionKey: "dungeon.types.xeno_hive.description",
      palette: { floor: '#132C1C', wall: '#0B1A11', accent: '#83FF5A' },
      mixin: { normalMixed: 0.29, blockDimMixed: 0.4, tags: ['sf', 'xeno', 'hive'] },
      style: 'cluster',
      clusters: 9,
      minRadius: 2,
      maxRadius: 5,
      connectors: 8,
      structureTags: ['xeno', 'hive'],
      paletteOptions: { accentChance: 0.18 },
      soundscape: 'hive-thrum'
    },
    {
      id: 'xeno_reef',
      name: '星間リーフ',
      nameKey: "dungeon.types.xeno_reef.name",
      description: '珊瑚状の浮遊骨格が網目状に広がる生態帯。',
      descriptionKey: "dungeon.types.xeno_reef.description",
      palette: { floor: '#0C2430', wall: '#16353F', accent: '#5EFFF7' },
      mixin: { normalMixed: 0.25, blockDimMixed: 0.36, tags: ['sf', 'xeno', 'reef'] },
      style: 'weave',
      bands: 5,
      bandWidth: 3,
      gap: 2,
      diagonal: false,
      structureTags: ['xeno', 'reef'],
      paletteOptions: { accentChance: 0.16 },
      soundscape: 'reef-glow'
    },
    {
      id: 'colony_vault',
      name: '戦略備蓄庫',
      nameKey: "dungeon.types.colony_vault.name",
      description: '多重リングで守られた戦略物資の保管庫。',
      descriptionKey: "dungeon.types.colony_vault.description",
      palette: { floor: '#1A1E32', wall: '#242B3F', accent: '#FF9A4F' },
      mixin: { normalMixed: 0.2, blockDimMixed: 0.33, tags: ['sf', 'colony', 'vault'] },
      style: 'sector',
      sectors: 6,
      ringSpacing: 3,
      corridorWidth: 3,
      coreRadius: 5,
      structureTags: ['colony', 'vault'],
      paletteOptions: { accentChance: 0.08 },
      soundscape: 'vault-lock'
    },
    {
      id: 'colony_arcology',
      name: 'アーコロジースパイン',
      nameKey: "dungeon.types.colony_arcology.name",
      description: '垂直都市の核を担う立体街区。',
      descriptionKey: "dungeon.types.colony_arcology.description",
      palette: { floor: '#101C2A', wall: '#172535', accent: '#4CFFF4' },
      mixin: { normalMixed: 0.31, blockDimMixed: 0.46, tags: ['sf', 'colony', 'arcology'] },
      style: 'weave',
      bands: 7,
      bandWidth: 2,
      gap: 1,
      diagonal: true,
      structureTags: ['colony', 'arcology'],
      paletteOptions: { accentChance: 0.09 },
      soundscape: 'arcology-hum'
    }
  ];
  function createGenerators() {
    return generatorConfigs.map(def => {
      const factory = styleFactories[def.style] || createHubAlgorithm;
      const algorithm = factory(def);
      const palette = def.palette || { floor: '#1c1c1c', wall: '#101010', accent: '#3fc5ff' };
      return {
        id: def.id,
        name: def.name,
        description: def.description,
        mixin: def.mixin,
        algorithm,
        meta: {
          palette,
          lighting: {
            floor: palette.floor,
            wall: brighten(palette.wall || palette.floor, 0.1),
            accent: brighten(palette.accent || palette.floor, 0.25)
          },
          soundscape: def.soundscape || null,
          addonId: ADDON_ID
        }
      };
    });
  }

  function createStructures() {
    const entries = [
      { id: 'sf_cross_hub', name: 'クロス制御室', pattern: [
        '#######',
        '#.....#',
        '#..#..#',
        '.......',
        '#..#..#',
        '#.....#',
        '#######'
      ], tags: ['sf', 'spaceship', 'hub'], allowRotation: true, allowMirror: true },
      { id: 'sf_reactor_core', name: 'リアクターハート', pattern: [
        '#######',
        '#..#..#',
        '#..#..#',
        '##...##',
        '#..#..#',
        '#..#..#',
        '#######'
      ], tags: ['sf', 'spaceship', 'reactor'], allowRotation: true },
      { id: 'sf_datagrid_cell', name: 'データセル', pattern: [
        '#####',
        '#...#',
        '#.#.#',
        '#...#',
        '#####'
      ], tags: ['sf', 'cyber', 'grid'], allowRotation: true },
      { id: 'sf_glitch_shard', name: 'グリッチ欠片', pattern: [
        '#####',
        '#..##',
        '#.#.#',
        '##..#',
        '#####'
      ], tags: ['sf', 'cyber', 'chaos'], allowRotation: true, allowMirror: true },
      { id: 'sf_forum_ring', name: 'フォーラムリング', pattern: [
        '#######',
        '#..#..#',
        '#.....#',
        '#.#.#.#',
        '#.....#',
        '#..#..#',
        '#######'
      ], tags: ['sf', 'cyber', 'forum'], allowRotation: true },
      { id: 'sf_plaza_podium', name: 'ホロポディウム', pattern: [
        '#######',
        '#.....#',
        '#.....#',
        '#..#..#',
        '#.....#',
        '#.....#',
        '#######'
      ], tags: ['sf', 'future', 'plaza'], allowRotation: true },
      { id: 'sf_industrial_line', name: 'コンベアライン', pattern: [
        '###',
        '#.#',
        '#.#',
        '#.#',
        '###'
      ], tags: ['sf', 'future', 'industrial'], allowRotation: true },
      { id: 'sf_sky_platform', name: '浮遊プラットフォーム', pattern: [
        '#####',
        '#...#',
        '#...#',
        '#...#',
        '#####'
      ], tags: ['sf', 'future', 'aerial'], allowRotation: true },
      { id: 'sf_residential_quad', name: '住居クアッド', pattern: [
        '######',
        '#....#',
        '#.##.#',
        '#....#',
        '######'
      ], tags: ['sf', 'future', 'residential'], allowRotation: true },
      { id: 'sf_underworks_loop', name: 'メンテナンスループ', pattern: [
        '#######',
        '#.#.#.#',
        '#.....#',
        '#.#.#.#',
        '#.....#',
        '#.#.#.#',
        '#######'
      ], tags: ['sf', 'future', 'maintenance'], allowRotation: true },
      { id: 'sf_greenhouse_cell', name: '温室セル', pattern: [
        '######',
        '#....#',
        '#.##.#',
        '#....#',
        '######'
      ], tags: ['sf', 'orbital', 'bio'], allowRotation: true },
      { id: 'sf_command_bridge', name: '管制ブリッジ', pattern: [
        '#######',
        '#..#..#',
        '#.#.#.#',
        '#..#..#',
        '#######'
      ], tags: ['sf', 'orbital', 'command'], allowRotation: true },
      { id: 'sf_quantum_focus', name: '量子フォーカス', pattern: [
        '#######',
        '#..#..#',
        '#.#.#.#',
        '#..#..#',
        '#######'
      ], tags: ['sf', 'quantum', 'reactor'], allowRotation: true },
      { id: 'sf_archive_stack', name: '記録スタック', pattern: [
        '#######',
        '#.#.#.#',
        '#.#.#.#',
        '#.#.#.#',
        '#######'
      ], tags: ['sf', 'quantum', 'archive'], allowRotation: true },
      { id: 'sf_chrono_platform', name: 'クロノホーム', pattern: [
        '#######',
        '#.....#',
        '#.#.#.#',
        '#.....#',
        '#######'
      ], tags: ['sf', 'chrono', 'station'], allowRotation: true },
      { id: 'sf_xeno_grove', name: '異星グローブ', pattern: [
        '#######',
        '#..#..#',
        '#.....#',
        '#.....#',
        '#..#..#',
        '#######'
      ], tags: ['sf', 'xeno', 'organic'], allowRotation: true },
      { id: 'sf_xeno_gate', name: '遺構ゲート', pattern: [
        '#######',
        '#.#.#.#',
        '#.....#',
        '#.#.#.#',
        '#######'
      ], tags: ['sf', 'xeno', 'ruins'], allowRotation: true },
      { id: 'sf_colony_commons', name: 'コモンズホール', pattern: [
        '#########',
        '#.......#',
        '#.#####.#',
        '#.#...#.#',
        '#.#...#.#',
        '#.#####.#',
        '#.......#',
        '#########'
      ], tags: ['sf', 'colony', 'commons'], allowRotation: true },
      { id: 'sf_warp_gate', name: 'ワープゲートリング', pattern: [
        '#######',
        '#..#..#',
        '#.#.#.#',
        '#..#..#',
        '#######'
      ], tags: ['sf', 'spaceship', 'warp'], allowRotation: true },
      { id: 'sf_observatory_grid', name: '観測グリッド', pattern: [
        '#######',
        '#..#..#',
        '#.....#',
        '#..#..#',
        '#######'
      ], tags: ['sf', 'spaceship', 'observation'], allowRotation: true },
      { id: 'sf_arena_mesh', name: 'アリーナメッシュ', pattern: [
        '########',
        '#.#..#.#',
        '#......#',
        '#.#..#.#',
        '########'
      ], tags: ['sf', 'cyber', 'arena'], allowRotation: true, allowMirror: true },
      { id: 'sf_metro_cross', name: 'メトロ交差', pattern: [
        '###.###',
        '...#...',
        '###.###'
      ], tags: ['sf', 'future', 'transport'], allowRotation: true },
      { id: 'sf_cloud_dock', name: 'クラウドドック', pattern: [
        '#####',
        '#...#',
        '#.#.#',
        '#...#',
        '#####'
      ], tags: ['sf', 'future', 'port'], allowRotation: true },
      { id: 'sf_scrap_node', name: 'スクラップノード', pattern: [
        '######',
        '#.#..#',
        '#....#',
        '#..#.#',
        '######'
      ], tags: ['sf', 'orbital', 'scrap'], allowRotation: true, allowMirror: true },
      { id: 'sf_listening_spire', name: 'リスニングスパイア', pattern: [
        '#######',
        '#..#..#',
        '#.#.#.#',
        '#..#..#',
        '#######'
      ], tags: ['sf', 'orbital', 'antenna'], allowRotation: true },
      { id: 'sf_flux_cell', name: 'フラックスセル', pattern: [
        '#######',
        '#.#.#.#',
        '#..#..#',
        '#.#.#.#',
        '#######'
      ], tags: ['sf', 'quantum', 'flux'], allowRotation: true },
      { id: 'sf_chrono_stack', name: '時間アーカイブスタック', pattern: [
        '########',
        '#......#',
        '#.####.#',
        '#......#',
        '########'
      ], tags: ['sf', 'chrono', 'archive'], allowRotation: true },
      { id: 'sf_fracture_node', name: '断層ノード', pattern: [
        '#####',
        '#.#.#',
        '##.##',
        '#.#.#',
        '#####'
      ], tags: ['sf', 'chrono', 'fracture'], allowRotation: true, allowMirror: true },
      { id: 'sf_hive_chamber', name: 'ハイブチャンバー', pattern: [
        '#######',
        '#..#..#',
        '#.....#',
        '#..#..#',
        '#######'
      ], tags: ['sf', 'xeno', 'hive'], allowRotation: true },
      { id: 'sf_reef_arc', name: 'リーフアーチ', pattern: [
        '######',
        '#....#',
        '#.##.#',
        '#....#',
        '######'
      ], tags: ['sf', 'xeno', 'reef'], allowRotation: true },
      { id: 'sf_vault_ring', name: '備蓄リング', pattern: [
        '#######',
        '#.#.#.#',
        '#.....#',
        '#.#.#.#',
        '#######'
      ], tags: ['sf', 'colony', 'vault'], allowRotation: true },
      { id: 'sf_arcology_core', name: 'アーコロジー核', pattern: [
        '#########',
        '#..###..#',
        '#.......#',
        '###...###',
        '#.......#',
        '#..###..#',
        '#########'
      ], tags: ['sf', 'colony', 'arcology'], allowRotation: true }
    ];
    return entries.map(structure => ({
      ...structure,
      nameKey: structure.nameKey || `dungeon.structures.${structure.id}.name`
    }));
  }
  function createBlocks() {
    const dimensions = [
      { key: 'sf-deep-orbit', name: 'ディープオービット', baseLevel: 120 },
      { key: 'sf-cyber-lattice', name: 'サイバーラティス', baseLevel: 150 },
      { key: 'sf-quantum-fold', name: '量子折り畳み階層', baseLevel: 180 },
      { key: 'sf-stellar-halo', name: 'ステラーハローベルト', baseLevel: 200 },
      { key: 'sf-bio-cascade', name: 'バイオカスケード', baseLevel: 135 }
    ];

    const blocks1 = [
      {
        key: 'sf-reactor-floor',
        name: 'プラズマ反応床',
        nameKey: "dungeon.types.spaceship_core.blocks.sf-reactor-floor.name",
        level: +1,
        size: 0,
        depth: 0,
        chest: 'normal',
        type: 'spaceship_core',
        weight: 1.2
      },
      {
        key: 'sf-magnetic-wall',
        name: '磁束壁板',
        nameKey: "dungeon.types.spaceship_core.blocks.sf-magnetic-wall.name",
        level: +1,
        size: 0,
        depth: 0,
        chest: 'less',
        type: 'spaceship_core',
        weight: 0.8
      },
      {
        key: 'sf-hab-garden',
        name: 'ハイドロポニクス床',
        nameKey: "dungeon.types.spaceship_hab.blocks.sf-hab-garden.name",
        level: 0,
        size: 0,
        depth: 0,
        chest: 'more',
        type: 'spaceship_hab',
        weight: 1.1
      },
      {
        key: 'sf-ai-server',
        name: 'AIサーバーパネル',
        nameKey: "dungeon.types.spaceship_ai.blocks.sf-ai-server.name",
        level: +2,
        size: +1,
        depth: 0,
        chest: 'less',
        type: 'spaceship_ai'
      },
      {
        key: 'sf-grid-node',
        name: 'グリッドノード床',
        nameKey: "dungeon.types.cyber_grid.blocks.sf-grid-node.name",
        level: +1,
        size: 0,
        depth: 0,
        chest: 'normal',
        type: 'cyber_grid'
      },
      {
        key: 'sf-firewall-wall',
        name: 'ファイアウォール壁',
        nameKey: "dungeon.types.cyber_vault.blocks.sf-firewall-wall.name",
        level: +2,
        size: 0,
        depth: 0,
        chest: 'less',
        type: 'cyber_vault'
      },
      {
        key: 'sf-glitch-tile',
        name: 'グリッチタイル',
        nameKey: "dungeon.types.cyber_glitch.blocks.sf-glitch-tile.name",
        level: 0,
        size: -1,
        depth: 0,
        chest: 'less',
        type: 'cyber_glitch',
        weight: 0.9
      },
      {
        key: 'sf-stream-bridge',
        name: '信号橋梁',
        nameKey: "dungeon.types.cyber_stream.blocks.sf-stream-bridge.name",
        level: +1,
        size: +1,
        depth: 0,
        chest: 'normal',
        type: 'cyber_stream'
      },
      {
        key: 'sf-plaza-holo',
        name: 'ホログラム床',
        nameKey: "dungeon.types.future_plaza.blocks.sf-plaza-holo.name",
        level: 0,
        size: 0,
        depth: 0,
        chest: 'more',
        type: 'future_plaza'
      },
      {
        key: 'sf-industrial-conveyor',
        name: 'メガライン床',
        nameKey: "dungeon.types.future_industrial.blocks.sf-industrial-conveyor.name",
        level: +2,
        size: +1,
        depth: 0,
        chest: 'normal',
        type: 'future_industrial'
      },
      {
        key: 'sf-sky-lift',
        name: '垂直リフト床',
        nameKey: "dungeon.types.future_sky.blocks.sf-sky-lift.name",
        level: +1,
        size: +1,
        depth: 0,
        chest: 'less',
        type: 'future_sky'
      },
      {
        key: 'sf-core-glass',
        name: '強化監視壁',
        nameKey: "dungeon.types.future_core.blocks.sf-core-glass.name",
        level: +1,
        size: 0,
        depth: 0,
        chest: 'less',
        type: 'future_core'
      },
      {
        key: 'sf-medbay-sterile',
        name: '無菌メディカル床',
        nameKey: "dungeon.types.spaceship_medbay.blocks.sf-medbay-sterile.name",
        level: 0,
        size: 0,
        depth: 0,
        chest: 'more',
        type: 'spaceship_medbay'
      },
      {
        key: 'sf-engineering-grate',
        name: 'エンジニアリンググレーチング',
        nameKey: "dungeon.types.spaceship_engineering.blocks.sf-engineering-grate.name",
        level: +1,
        size: 0,
        depth: 0,
        chest: 'normal',
        type: 'spaceship_engineering'
      },
      {
        key: 'sf-forum-stage',
        name: 'ソーシャルホール舞台床',
        nameKey: "dungeon.types.cyber_forum.blocks.sf-forum-stage.name",
        level: 0,
        size: -1,
        depth: 0,
        chest: 'less',
        type: 'cyber_forum'
      },
      {
        key: 'sf-subroutine-panel',
        name: 'サブルーチン診断床',
        nameKey: "dungeon.types.cyber_subroutine.blocks.sf-subroutine-panel.name",
        level: +1,
        size: 0,
        depth: 0,
        chest: 'normal',
        type: 'cyber_subroutine'
      },
      {
        key: 'sf-residential-terrace',
        name: 'テラスフロア',
        nameKey: "dungeon.types.future_residential.blocks.sf-residential-terrace.name",
        level: 0,
        size: 0,
        depth: 0,
        chest: 'more',
        type: 'future_residential'
      },
      {
        key: 'sf-underworks-catwalk',
        name: 'アンダーワークス猫歩き床',
        nameKey: "dungeon.types.future_underworks.blocks.sf-underworks-catwalk.name",
        level: +1,
        size: 0,
        depth: 0,
        chest: 'less',
        type: 'future_underworks'
      },
      {
        key: 'sf-xeno-jungle-floor',
        name: 'バイオルミ床板',
        nameKey: "dungeon.types.xeno_jungle.blocks.sf-xeno-jungle-floor.name",
        level: +1,
        size: 0,
        depth: 0,
        chest: 'normal',
        type: 'xeno_jungle'
      },
      {
        key: 'sf-colony-commons-floor',
        name: 'コモンズ共有床',
        nameKey: "dungeon.types.colony_commons.blocks.sf-colony-commons-floor.name",
        level: 0,
        size: 0,
        depth: 0,
        chest: 'more',
        type: 'colony_commons'
      },
      {
        key: 'sf-warp-pad',
        name: 'ワープパッド床',
        nameKey: "dungeon.types.spaceship_warp.blocks.sf-warp-pad.name",
        level: +2,
        size: 0,
        depth: 0,
        chest: 'less',
        type: 'spaceship_warp',
        weight: 0.9
      },
      {
        key: 'sf-observatory-plate',
        name: '観測ドーム床板',
        nameKey: "dungeon.types.spaceship_observatory.blocks.sf-observatory-plate.name",
        level: +1,
        size: 0,
        depth: 0,
        chest: 'normal',
        type: 'spaceship_observatory'
      },
      {
        key: 'sf-arena-track',
        name: 'アリーナトラック床',
        nameKey: "dungeon.types.cyber_arena.blocks.sf-arena-track.name",
        level: +1,
        size: 0,
        depth: 0,
        chest: 'more',
        type: 'cyber_arena'
      },
      {
        key: 'sf-mirror-panel',
        name: 'ミラーパネル壁',
        nameKey: "dungeon.types.cyber_mirror.blocks.sf-mirror-panel.name",
        level: +1,
        size: 0,
        depth: 0,
        chest: 'less',
        type: 'cyber_mirror',
        weight: 0.8
      },
      {
        key: 'sf-metro-strut',
        name: 'メトロ支持梁',
        nameKey: "dungeon.types.future_metro.blocks.sf-metro-strut.name",
        level: +2,
        size: +1,
        depth: 0,
        chest: 'normal',
        type: 'future_metro'
      },
      {
        key: 'sf-cloud-dock-floor',
        name: 'クラウドドック床',
        nameKey: "dungeon.types.future_cloudport.blocks.sf-cloud-dock-floor.name",
        level: +1,
        size: 0,
        depth: 0,
        chest: 'normal',
        type: 'future_cloudport'
      },
      {
        key: 'sf-scrap-plating',
        name: 'スクラップ装甲板',
        nameKey: "dungeon.types.orbital_scrapyard.blocks.sf-scrap-plating.name",
        level: +1,
        size: 0,
        depth: 0,
        chest: 'less',
        type: 'orbital_scrapyard'
      },
      {
        key: 'sf-listening-array',
        name: 'リスニングアレイ床',
        nameKey: "dungeon.types.orbital_listening.blocks.sf-listening-array.name",
        level: +1,
        size: 0,
        depth: 0,
        chest: 'normal',
        type: 'orbital_listening'
      },
      {
        key: 'sf-reef-trellis',
        name: 'リーフトレリス床',
        nameKey: "dungeon.types.xeno_reef.blocks.sf-reef-trellis.name",
        level: +1,
        size: 0,
        depth: 0,
        chest: 'more',
        type: 'xeno_reef'
      },
      {
        key: 'sf-hive-pith',
        name: 'ハイブピス床',
        nameKey: "dungeon.types.xeno_hive.blocks.sf-hive-pith.name",
        level: +2,
        size: 0,
        depth: 0,
        chest: 'less',
        type: 'xeno_hive',
        weight: 0.95
      },
      {
        key: 'sf-arcology-floor',
        name: 'アーコロジーフロア',
        nameKey: "dungeon.types.colony_arcology.blocks.sf-arcology-floor.name",
        level: +2,
        size: +1,
        depth: 0,
        chest: 'normal',
        type: 'colony_arcology'
      },
      {
        key: 'sf-vault-plate',
        name: '備蓄庫床板',
        nameKey: "dungeon.types.colony_vault.blocks.sf-vault-plate.name",
        level: +1,
        size: 0,
        depth: 0,
        chest: 'less',
        type: 'colony_vault'
      }
    ];
    const blocks2 = [
      {
        key: 'sf-orbit-ring-floor',
        name: '軌道リング床',
        nameKey: "dungeon.types.orbital_ring.blocks.sf-orbit-ring-floor.name",
        level: +2,
        size: +1,
        depth: +1,
        chest: 'normal',
        type: 'orbital_ring'
      },
      {
        key: 'sf-orbit-solar',
        name: 'ソーラー壁板',
        nameKey: "dungeon.types.orbital_ring.blocks.sf-orbit-solar.name",
        level: +2,
        size: 0,
        depth: +1,
        chest: 'less',
        type: 'orbital_ring'
      },
      {
        key: 'sf-orbit-lab',
        name: '零G実験床',
        nameKey: "dungeon.types.orbital_lab.blocks.sf-orbit-lab.name",
        level: +3,
        size: 0,
        depth: +1,
        chest: 'less',
        type: 'orbital_lab'
      },
      {
        key: 'sf-orbit-armory',
        name: '反応装甲床',
        nameKey: "dungeon.types.orbital_armory.blocks.sf-orbit-armory.name",
        level: +3,
        size: +1,
        depth: +1,
        chest: 'less',
        type: 'orbital_armory'
      },
      {
        key: 'sf-quantum-column',
        name: '量子束柱',
        nameKey: "dungeon.types.quantum_reactor.blocks.sf-quantum-column.name",
        level: +4,
        size: 0,
        depth: +2,
        chest: 'less',
        type: 'quantum_reactor'
      },
      {
        key: 'sf-quantum-phasewall',
        name: '位相壁',
        nameKey: "dungeon.types.quantum_reactor.blocks.sf-quantum-phasewall.name",
        level: +3,
        size: 0,
        depth: +2,
        chest: 'less',
        type: 'quantum_reactor'
      },
      {
        key: 'sf-quantum-archive',
        name: '時間結晶棚',
        nameKey: "dungeon.types.quantum_archive.blocks.sf-quantum-archive.name",
        level: +2,
        size: 0,
        depth: +1,
        chest: 'normal',
        type: 'quantum_archive'
      },
      {
        key: 'sf-quantum-anchor',
        name: '次元アンカー',
        nameKey: "dungeon.types.quantum_void.blocks.sf-quantum-anchor.name",
        level: +4,
        size: +1,
        depth: +2,
        chest: 'less',
        type: 'quantum_void'
      },
      {
        key: 'sf-cyber-cache',
        name: 'データキャッシュ床',
        nameKey: "dungeon.types.cyber_vault.blocks.sf-cyber-cache.name",
        level: +2,
        size: +1,
        depth: +1,
        chest: 'more',
        type: 'cyber_vault'
      },
      {
        key: 'sf-cyber-wave',
        name: '波形パネル壁',
        nameKey: "dungeon.types.cyber_stream.blocks.sf-cyber-wave.name",
        level: +3,
        size: 0,
        depth: +1,
        chest: 'less',
        type: 'cyber_stream'
      },
      {
        key: 'sf-future-transit',
        name: 'リニアトランジット床',
        nameKey: "dungeon.types.future_core.blocks.sf-future-transit.name",
        level: +3,
        size: +1,
        depth: +1,
        chest: 'normal',
        type: 'future_core'
      },
      {
        key: 'sf-future-aero',
        name: 'エアロバリア壁',
        nameKey: "dungeon.types.future_sky.blocks.sf-future-aero.name",
        level: +2,
        size: 0,
        depth: +1,
        chest: 'less',
        type: 'future_sky'
      },
      {
        key: 'sf-greenhouse-canopy',
        name: '温室キャノピー床',
        nameKey: "dungeon.types.orbital_greenhouse.blocks.sf-greenhouse-canopy.name",
        level: +2,
        size: +1,
        depth: +1,
        chest: 'more',
        type: 'orbital_greenhouse'
      },
      {
        key: 'sf-command-console',
        name: '指令コンソール壁',
        nameKey: "dungeon.types.orbital_command.blocks.sf-command-console.name",
        level: +3,
        size: 0,
        depth: +1,
        chest: 'less',
        type: 'orbital_command'
      },
      {
        key: 'sf-quantum-prism',
        name: 'プリズム導光床',
        nameKey: "dungeon.types.quantum_prism.blocks.sf-quantum-prism.name",
        level: +3,
        size: 0,
        depth: +2,
        chest: 'normal',
        type: 'quantum_prism'
      },
      {
        key: 'sf-chrono-platform',
        name: '時間駅プラットフォーム',
        nameKey: "dungeon.types.chrono_station.blocks.sf-chrono-platform.name",
        level: +2,
        size: +1,
        depth: +1,
        chest: 'normal',
        type: 'chrono_station'
      },
      {
        key: 'sf-loop-gate',
        name: 'ループゲート壁',
        nameKey: "dungeon.types.chrono_loop.blocks.sf-loop-gate.name",
        level: +3,
        size: 0,
        depth: +2,
        chest: 'less',
        type: 'chrono_loop'
      },
      {
        key: 'sf-xeno-crystal-spire',
        name: '結晶尖塔床',
        nameKey: "dungeon.types.xeno_crystal.blocks.sf-xeno-crystal-spire.name",
        level: +2,
        size: +1,
        depth: +1,
        chest: 'normal',
        type: 'xeno_crystal'
      },
      {
        key: 'sf-xeno-ruins-pillar',
        name: '遺跡支柱壁',
        nameKey: "dungeon.types.xeno_ruins.blocks.sf-xeno-ruins-pillar.name",
        level: +3,
        size: 0,
        depth: +1,
        chest: 'less',
        type: 'xeno_ruins'
      },
      {
        key: 'sf-colony-foundry-crane',
        name: '鋳造クレーン床',
        nameKey: "dungeon.types.colony_foundry.blocks.sf-colony-foundry-crane.name",
        level: +3,
        size: +1,
        depth: +1,
        chest: 'normal',
        type: 'colony_foundry'
      },
      {
        key: 'sf-laser-grid',
        name: 'レーザーグリッド罠',
        nameKey: "dungeon.types.future_core.blocks.sf-laser-grid.name",
        level: +3,
        size: 0,
        depth: +1,
        chest: 'less',
        type: 'future_core',
        weight: 0.6,
        meta: { hazard: 'laser-grid', period: 3 }
      },
      {
        key: 'sf-gravity-inverter',
        name: '重力反転装置',
        nameKey: "dungeon.types.orbital_ring.blocks.sf-gravity-inverter.name",
        level: +4,
        size: 0,
        depth: +1,
        chest: 'less',
        type: 'orbital_ring',
        weight: 0.5,
        meta: { hazard: 'gravity-inverter' }
      },
      {
        key: 'sf-data-spike',
        name: 'データスパイク',
        nameKey: "dungeon.types.cyber_vault.blocks.sf-data-spike.name",
        level: +3,
        size: 0,
        depth: +1,
        chest: 'less',
        type: 'cyber_vault',
        weight: 0.5,
        meta: { hazard: 'data-spike' }
      },
      {
        key: 'sf-quantum-rift',
        name: '量子リフト裂け目',
        nameKey: "dungeon.types.quantum_void.blocks.sf-quantum-rift.name",
        level: +4,
        size: 0,
        depth: +2,
        chest: 'less',
        type: 'quantum_void',
        weight: 0.4,
        meta: { hazard: 'quantum-rift' }
      },
      {
        key: 'sf-temporal-loop',
        name: '時間ループ罠',
        nameKey: "dungeon.types.chrono_loop.blocks.sf-temporal-loop.name",
        level: +3,
        size: 0,
        depth: +1,
        chest: 'less',
        type: 'chrono_loop',
        weight: 0.6,
        meta: { hazard: 'temporal-loop' }
      },
      {
        key: 'sf-crystal-resonator',
        name: '結晶レゾネーター',
        nameKey: "dungeon.types.xeno_crystal.blocks.sf-crystal-resonator.name",
        level: +3,
        size: 0,
        depth: +1,
        chest: 'less',
        type: 'xeno_crystal',
        weight: 0.6,
        meta: { hazard: 'crystal-resonator' }
      },
      {
        key: 'sf-bio-spore',
        name: '胞子散布床',
        nameKey: "dungeon.types.xeno_jungle.blocks.sf-bio-spore.name",
        level: +2,
        size: 0,
        depth: +1,
        chest: 'less',
        type: 'xeno_jungle',
        weight: 0.6,
        meta: { hazard: 'bio-spore' }
      },
      {
        key: 'sf-nanite-surge',
        name: 'ナナイトサージ',
        nameKey: "dungeon.types.colony_foundry.blocks.sf-nanite-surge.name",
        level: +3,
        size: 0,
        depth: +1,
        chest: 'less',
        type: 'colony_foundry',
        weight: 0.5,
        meta: { hazard: 'nanite-surge' }
      },
      {
        key: 'sf-warp-conduit',
        name: 'ワープ導管柱',
        nameKey: "dungeon.types.spaceship_warp.blocks.sf-warp-conduit.name",
        level: +3,
        size: 0,
        depth: +1,
        chest: 'less',
        type: 'spaceship_warp',
        weight: 0.8
      },
      {
        key: 'sf-observatory-array',
        name: '観測アレイ床',
        nameKey: "dungeon.types.spaceship_observatory.blocks.sf-observatory-array.name",
        level: +2,
        size: +1,
        depth: +1,
        chest: 'normal',
        type: 'spaceship_observatory'
      },
      {
        key: 'sf-arena-barrier',
        name: 'アリーナ障壁',
        nameKey: "dungeon.types.cyber_arena.blocks.sf-arena-barrier.name",
        level: +3,
        size: 0,
        depth: +1,
        chest: 'less',
        type: 'cyber_arena',
        meta: { hazard: 'holo-wall', cycle: 4 }
      },
      {
        key: 'sf-mirror-spire',
        name: 'ミラースパイア',
        nameKey: "dungeon.types.cyber_mirror.blocks.sf-mirror-spire.name",
        level: +2,
        size: 0,
        depth: +1,
        chest: 'less',
        type: 'cyber_mirror'
      },
      {
        key: 'sf-metro-switch',
        name: 'メトロ分岐床',
        nameKey: "dungeon.types.future_metro.blocks.sf-metro-switch.name",
        level: +3,
        size: +1,
        depth: +1,
        chest: 'normal',
        type: 'future_metro'
      },
      {
        key: 'sf-cloud-anchor',
        name: '浮遊アンカー',
        nameKey: "dungeon.types.future_cloudport.blocks.sf-cloud-anchor.name",
        level: +2,
        size: 0,
        depth: +1,
        chest: 'less',
        type: 'future_cloudport',
        meta: { hazard: 'wind-gust' }
      },
      {
        key: 'sf-scrap-gantry',
        name: 'スクラップガントリー',
        nameKey: "dungeon.types.orbital_scrapyard.blocks.sf-scrap-gantry.name",
        level: +2,
        size: +1,
        depth: +1,
        chest: 'normal',
        type: 'orbital_scrapyard'
      },
      {
        key: 'sf-listening-dish',
        name: '傍受ディッシュ',
        nameKey: "dungeon.types.orbital_listening.blocks.sf-listening-dish.name",
        level: +3,
        size: 0,
        depth: +1,
        chest: 'less',
        type: 'orbital_listening',
        meta: { hazard: 'signal-pulse' }
      },
      {
        key: 'sf-flux-ribbon',
        name: 'フラックスリボン床',
        nameKey: "dungeon.types.quantum_flux.blocks.sf-flux-ribbon.name",
        level: +3,
        size: 0,
        depth: +2,
        chest: 'normal',
        type: 'quantum_flux'
      },
      {
        key: 'sf-chrono-weave',
        name: 'クロノ織路',
        nameKey: "dungeon.types.chrono_archive.blocks.sf-chrono-weave.name",
        level: +2,
        size: +1,
        depth: +1,
        chest: 'normal',
        type: 'chrono_archive'
      },
      {
        key: 'sf-fracture-gate',
        name: '断層ゲート',
        nameKey: "dungeon.types.chrono_fracture.blocks.sf-fracture-gate.name",
        level: +3,
        size: 0,
        depth: +2,
        chest: 'less',
        type: 'chrono_fracture',
        meta: { hazard: 'time-rift' }
      },
      {
        key: 'sf-hive-resonator',
        name: 'ハイブレゾネーター',
        nameKey: "dungeon.types.xeno_hive.blocks.sf-hive-resonator.name",
        level: +2,
        size: 0,
        depth: +1,
        chest: 'less',
        type: 'xeno_hive',
        meta: { hazard: 'bio-resonance' }
      },
      {
        key: 'sf-reef-bloom',
        name: 'リーフブルーム',
        nameKey: "dungeon.types.xeno_reef.blocks.sf-reef-bloom.name",
        level: +2,
        size: +1,
        depth: +1,
        chest: 'normal',
        type: 'xeno_reef'
      },
      {
        key: 'sf-vault-lockdown',
        name: 'ロックダウン装置',
        nameKey: "dungeon.types.colony_vault.blocks.sf-vault-lockdown.name",
        level: +3,
        size: 0,
        depth: +1,
        chest: 'less',
        type: 'colony_vault',
        meta: { hazard: 'lockdown' }
      },
      {
        key: 'sf-arcology-bridge',
        name: 'アーコロジーブリッジ',
        nameKey: "dungeon.types.colony_arcology.blocks.sf-arcology-bridge.name",
        level: +3,
        size: +1,
        depth: +1,
        chest: 'normal',
        type: 'colony_arcology'
      }
    ];
    const blocks3 = [
      {
        key: 'sf-reactor-heart',
        name: '炉心安定床',
        nameKey: "dungeon.types.spaceship_core.blocks.sf-reactor-heart.name",
        level: +5,
        size: +2,
        depth: +2,
        chest: 'normal',
        type: 'spaceship_core',
        bossFloors: [10, 20]
      },
      {
        key: 'sf-ai-overmind',
        name: 'オーバーマインド核',
        nameKey: "dungeon.types.spaceship_ai.blocks.sf-ai-overmind.name",
        level: +6,
        size: +1,
        depth: +2,
        chest: 'less',
        type: 'spaceship_ai',
        bossFloors: [15]
      },
      {
        key: 'sf-glitch-singularity',
        name: 'グリッチ特異点',
        nameKey: "dungeon.types.cyber_glitch.blocks.sf-glitch-singularity.name",
        level: +6,
        size: +1,
        depth: +3,
        chest: 'less',
        type: 'cyber_glitch',
        bossFloors: [12, 18]
      },
      {
        key: 'sf-vault-guardian',
        name: 'ICEガーディアン床',
        nameKey: "dungeon.types.cyber_vault.blocks.sf-vault-guardian.name",
        level: +5,
        size: +2,
        depth: +3,
        chest: 'less',
        type: 'cyber_vault',
        bossFloors: [20]
      },
      {
        key: 'sf-sky-zenith',
        name: 'ゼニス浮遊床',
        nameKey: "dungeon.types.future_sky.blocks.sf-sky-zenith.name",
        level: +4,
        size: +2,
        depth: +2,
        chest: 'more',
        type: 'future_sky',
        bossFloors: [9, 18]
      },
      {
        key: 'sf-industrial-forge',
        name: '星鋳炉床',
        nameKey: "dungeon.types.future_industrial.blocks.sf-industrial-forge.name",
        level: +5,
        size: +2,
        depth: +2,
        chest: 'normal',
        type: 'future_industrial',
        bossFloors: [14]
      },
      {
        key: 'sf-orbit-guardian',
        name: '軌道防衛壁',
        nameKey: "dungeon.types.orbital_armory.blocks.sf-orbit-guardian.name",
        level: +5,
        size: +1,
        depth: +2,
        chest: 'less',
        type: 'orbital_armory',
        bossFloors: [16]
      },
      {
        key: 'sf-orbit-null',
        name: '無重力制御床',
        nameKey: "dungeon.types.orbital_lab.blocks.sf-orbit-null.name",
        level: +5,
        size: +1,
        depth: +2,
        chest: 'normal',
        type: 'orbital_lab',
        bossFloors: [12]
      },
      {
        key: 'sf-quantum-core',
        name: '量子核床',
        nameKey: "dungeon.types.quantum_reactor.blocks.sf-quantum-core.name",
        level: +6,
        size: +2,
        depth: +3,
        chest: 'less',
        type: 'quantum_reactor',
        bossFloors: [20]
      },
      {
        key: 'sf-quantum-horizon',
        name: '地平遮蔽壁',
        nameKey: "dungeon.types.quantum_void.blocks.sf-quantum-horizon.name",
        level: +6,
        size: +1,
        depth: +3,
        chest: 'less',
        type: 'quantum_void',
        bossFloors: [18]
      },
      {
        key: 'sf-cyber-cascade',
        name: '情報カスケード床',
        nameKey: "dungeon.types.cyber_stream.blocks.sf-cyber-cascade.name",
        level: +5,
        size: +1,
        depth: +2,
        chest: 'normal',
        type: 'cyber_stream',
        bossFloors: [10, 15]
      },
      {
        key: 'sf-plaza-crown',
        name: '王冠ホロ床',
        nameKey: "dungeon.types.future_plaza.blocks.sf-plaza-crown.name",
        level: +4,
        size: +2,
        depth: +2,
        chest: 'more',
        type: 'future_plaza',
        bossFloors: [12]
      },
      {
        key: 'sf-medbay-overseer',
        name: 'メディカル監督核',
        nameKey: "dungeon.types.spaceship_medbay.blocks.sf-medbay-overseer.name",
        level: +5,
        size: +1,
        depth: +2,
        chest: 'less',
        type: 'spaceship_medbay',
        bossFloors: [8, 14]
      },
      {
        key: 'sf-engineering-core',
        name: 'エンジン制御心核',
        nameKey: "dungeon.types.spaceship_engineering.blocks.sf-engineering-core.name",
        level: +5,
        size: +2,
        depth: +3,
        chest: 'normal',
        type: 'spaceship_engineering',
        bossFloors: [16]
      },
      {
        key: 'sf-forum-oracle',
        name: 'フォーラムオラクル床',
        nameKey: "dungeon.types.cyber_forum.blocks.sf-forum-oracle.name",
        level: +6,
        size: +1,
        depth: +3,
        chest: 'less',
        type: 'cyber_forum',
        bossFloors: [15]
      },
      {
        key: 'sf-subroutine-kernel',
        name: 'サブルーチン核壁',
        nameKey: "dungeon.types.cyber_subroutine.blocks.sf-subroutine-kernel.name",
        level: +5,
        size: +1,
        depth: +2,
        chest: 'less',
        type: 'cyber_subroutine',
        bossFloors: [11, 17]
      },
      {
        key: 'sf-chrono-paradox',
        name: 'パラドックス交差床',
        nameKey: "dungeon.types.chrono_loop.blocks.sf-chrono-paradox.name",
        level: +6,
        size: +2,
        depth: +3,
        chest: 'normal',
        type: 'chrono_loop',
        bossFloors: [13, 19]
      },
      {
        key: 'sf-xeno-elder',
        name: '異星守護床',
        nameKey: "dungeon.types.xeno_ruins.blocks.sf-xeno-elder.name",
        level: +5,
        size: +2,
        depth: +3,
        chest: 'less',
        type: 'xeno_ruins',
        bossFloors: [18]
      },
      {
        key: 'sf-xeno-maelstrom',
        name: '潮汐メイルストロム床',
        nameKey: "dungeon.types.xeno_tide.blocks.sf-xeno-maelstrom.name",
        level: +5,
        size: +2,
        depth: +3,
        chest: 'normal',
        type: 'xeno_tide',
        bossFloors: [10, 20]
      },
      {
        key: 'sf-colony-reactor-heart',
        name: 'コロニー炉心核',
        nameKey: "dungeon.types.colony_reactor.blocks.sf-colony-reactor-heart.name",
        level: +6,
        size: +2,
        depth: +3,
        chest: 'less',
        type: 'colony_reactor',
        bossFloors: [20]
      },
      {
        key: 'sf-warp-singularity',
        name: 'ワープ特異核',
        nameKey: "dungeon.types.spaceship_warp.blocks.sf-warp-singularity.name",
        level: +6,
        size: +2,
        depth: +3,
        chest: 'less',
        type: 'spaceship_warp',
        bossFloors: [18]
      },
      {
        key: 'sf-observatory-core',
        name: '観測中枢核',
        nameKey: "dungeon.types.spaceship_observatory.blocks.sf-observatory-core.name",
        level: +5,
        size: +1,
        depth: +2,
        chest: 'normal',
        type: 'spaceship_observatory',
        bossFloors: [14]
      },
      {
        key: 'sf-arena-champion',
        name: 'アリーナチャンピオン床',
        nameKey: "dungeon.types.cyber_arena.blocks.sf-arena-champion.name",
        level: +5,
        size: +2,
        depth: +3,
        chest: 'more',
        type: 'cyber_arena',
        bossFloors: [16]
      },
      {
        key: 'sf-mirror-overseer',
        name: 'ミラーオーバーシア壁',
        nameKey: "dungeon.types.cyber_mirror.blocks.sf-mirror-overseer.name",
        level: +5,
        size: +1,
        depth: +2,
        chest: 'less',
        type: 'cyber_mirror',
        bossFloors: [13]
      },
      {
        key: 'sf-metro-command',
        name: 'メトロ司令床',
        nameKey: "dungeon.types.future_metro.blocks.sf-metro-command.name",
        level: +5,
        size: +2,
        depth: +2,
        chest: 'normal',
        type: 'future_metro',
        bossFloors: [15, 22]
      },
      {
        key: 'sf-cloud-throne',
        name: 'クラウドスローン床',
        nameKey: "dungeon.types.future_cloudport.blocks.sf-cloud-throne.name",
        level: +5,
        size: +2,
        depth: +2,
        chest: 'more',
        type: 'future_cloudport',
        bossFloors: [12, 19]
      },
      {
        key: 'sf-scrap-overseer',
        name: 'スクラップ監督核',
        nameKey: "dungeon.types.orbital_scrapyard.blocks.sf-scrap-overseer.name",
        level: +5,
        size: +1,
        depth: +2,
        chest: 'less',
        type: 'orbital_scrapyard',
        bossFloors: [17]
      },
      {
        key: 'sf-listening-core',
        name: 'リスニング中枢',
        nameKey: "dungeon.types.orbital_listening.blocks.sf-listening-core.name",
        level: +5,
        size: +1,
        depth: +2,
        chest: 'less',
        type: 'orbital_listening',
        bossFloors: [11, 18]
      },
      {
        key: 'sf-flux-heart',
        name: 'フラックス心核',
        nameKey: "dungeon.types.quantum_flux.blocks.sf-flux-heart.name",
        level: +6,
        size: +2,
        depth: +3,
        chest: 'less',
        type: 'quantum_flux',
        bossFloors: [21]
      },
      {
        key: 'sf-chrono-vault',
        name: 'クロノヴォールト床',
        nameKey: "dungeon.types.chrono_archive.blocks.sf-chrono-vault.name",
        level: +5,
        size: +1,
        depth: +2,
        chest: 'normal',
        type: 'chrono_archive',
        bossFloors: [13, 20]
      },
      {
        key: 'sf-fracture-core',
        name: '断層中核',
        nameKey: "dungeon.types.chrono_fracture.blocks.sf-fracture-core.name",
        level: +6,
        size: +1,
        depth: +3,
        chest: 'less',
        type: 'chrono_fracture',
        bossFloors: [19]
      },
      {
        key: 'sf-hive-queen',
        name: 'ハイブクイーン床',
        nameKey: "dungeon.types.xeno_hive.blocks.sf-hive-queen.name",
        level: +5,
        size: +2,
        depth: +3,
        chest: 'more',
        type: 'xeno_hive',
        bossFloors: [18, 24]
      },
      {
        key: 'sf-reef-titan',
        name: 'リーフタイタン床',
        nameKey: "dungeon.types.xeno_reef.blocks.sf-reef-titan.name",
        level: +5,
        size: +2,
        depth: +2,
        chest: 'normal',
        type: 'xeno_reef',
        bossFloors: [16]
      },
      {
        key: 'sf-vault-command',
        name: '備蓄指令核',
        nameKey: "dungeon.types.colony_vault.blocks.sf-vault-command.name",
        level: +6,
        size: +1,
        depth: +2,
        chest: 'less',
        type: 'colony_vault',
        bossFloors: [19]
      },
      {
        key: 'sf-arcology-nexus',
        name: 'アーコロジーネクサス',
        nameKey: "dungeon.types.colony_arcology.blocks.sf-arcology-nexus.name",
        level: +6,
        size: +2,
        depth: +3,
        chest: 'normal',
        type: 'colony_arcology',
        bossFloors: [22]
      }
    ];

    return { dimensions, blocks1, blocks2, blocks3 };
  }
  const addon = {
    id: ADDON_ID,
    name: ADDON_NAME,
    nameKey: "dungeon.packs.sf_expansion_pack.name",
    version: VERSION,
    api: '1.0.0',
    description: '宇宙船・サイバー空間・未来都市・軌道施設・量子/時間研究・異星生態・メガコロニーを網羅し、50タイプと5次元拡張を収録した大規模SFダンジョン生成パック。',
    descriptionKey: "dungeon.packs.sf_expansion_pack.description",
    blocks: createBlocks(),
    structures: createStructures(),
    generators: createGenerators()
  };

  window.registerDungeonAddon(addon);
})();

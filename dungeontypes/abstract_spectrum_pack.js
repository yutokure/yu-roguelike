(function(){
  const ADDON_ID = 'abstract_spectrum_pack';
  const ADDON_NAME = '抽象スペクトラム生成パック';
  const VERSION = '1.0.0';

  function clamp(value, min, max){
    return value < min ? min : (value > max ? max : value);
  }

  function pseudoNoise(x, y, seed){
    const s = Math.sin((x * 127.1 + y * 311.7 + seed * 74.7) * 12.9898) * 43758.5453;
    return s - Math.floor(s);
  }

  function hexToRgb(hex){
    if(!hex) return { r: 0, g: 0, b: 0 };
    const normalized = hex.replace('#', '');
    const value = normalized.length === 3
      ? parseInt(normalized.split('').map((c) => c + c).join(''), 16)
      : parseInt(normalized.slice(0, 6), 16);
    return {
      r: (value >> 16) & 0xff,
      g: (value >> 8) & 0xff,
      b: value & 0xff
    };
  }

  function rgbToHex(rgb){
    const r = clamp(Math.round(rgb.r), 0, 255).toString(16).padStart(2, '0');
    const g = clamp(Math.round(rgb.g), 0, 255).toString(16).padStart(2, '0');
    const b = clamp(Math.round(rgb.b), 0, 255).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }

  function blendHex(a, b, t){
    const colorA = hexToRgb(a);
    const colorB = hexToRgb(b);
    const ratio = clamp(t, 0, 1);
    return rgbToHex({
      r: colorA.r + (colorB.r - colorA.r) * ratio,
      g: colorA.g + (colorB.g - colorA.g) * ratio,
      b: colorA.b + (colorB.b - colorA.b) * ratio
    });
  }

  function parseGradientStops(gradient){
    if(!Array.isArray(gradient) || !gradient.length) return null;
    const stops = [];
    const length = gradient.length;
    for(let i = 0; i < length; i++){
      const entry = gradient[i];
      if(typeof entry === 'string'){
        stops.push({ at: length === 1 ? 0 : i / (length - 1), color: entry });
      } else if(entry && typeof entry === 'object' && entry.color){
        const position = typeof entry.at === 'number' ? entry.at : (length === 1 ? 0 : i / (length - 1));
        stops.push({ at: clamp(position, 0, 1), color: entry.color });
      }
    }
    if(!stops.length) return null;
    stops.sort((a, b) => a.at - b.at);
    return stops;
  }

  function sampleGradient(stops, t){
    if(!stops || !stops.length) return null;
    if(stops.length === 1) return stops[0].color;
    const clamped = clamp(t, 0, 1);
    if(clamped <= stops[0].at) return stops[0].color;
    for(let i = 1; i < stops.length; i++){
      const prev = stops[i - 1];
      const next = stops[i];
      if(clamped <= next.at){
        const span = next.at - prev.at || 1;
        const localT = (clamped - prev.at) / span;
        return blendHex(prev.color, next.color, localT);
      }
    }
    return stops[stops.length - 1].color;
  }

  function computeGradientT(ctx, theme, x, y, variation){
    const W = Math.max(1, ctx.width - 1);
    const H = Math.max(1, ctx.height - 1);
    const cx = W / 2;
    const cy = H / 2;
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = Math.sqrt(cx * cx + cy * cy) || 1;
    switch(theme.gradientMode){
      case 'linear-x':
        return clamp(x / W, 0, 1);
      case 'linear-y':
        return clamp(y / H, 0, 1);
      case 'diagonal':
        return clamp((x + y) / (W + H), 0, 1);
      case 'angular': {
        const base = (Math.atan2(dy, dx) / (Math.PI * 2)) + 0.5 + (variation || 0) * 0.02 + theme.seed * 0.001;
        return base - Math.floor(base);
      }
      case 'noise':
        return pseudoNoise(x * 0.6 + theme.seed, y * 0.6 + theme.seed * 1.7, theme.seed + 991);
      default:
        return clamp(dist / maxDist, 0, 1);
    }
  }

  function applyColors(ctx, x, y, palette, theme, random, meta){
    const variation = meta && typeof meta.variation === 'number' ? meta.variation : 0;
    const score = meta && typeof meta.score === 'number' ? meta.score : null;
    const gradientStops = theme.gradientStops;
    let color = null;
    if(theme.gradientMode && gradientStops){
      let t = computeGradientT(ctx, theme, x, y, variation);
      const variance = theme.gradientVariance ?? 0.05;
      if(score != null){
        t += (score - theme.threshold) * variance;
      } else {
        t += variation * variance;
      }
      color = sampleGradient(gradientStops, t);
      if(color && theme.palette.gradientOverlay){
        const overlayStrength = clamp(theme.palette.gradientOverlayStrength ?? 0.2, 0, 1);
        color = blendHex(color, theme.palette.gradientOverlay, overlayStrength);
      }
    }
    if(!color && palette && palette.length){
      const baseSeed = theme.seed * 131 + x * 37 + y * 53;
      const modifier = score != null ? score * 97 : variation * 131;
      const idx = Math.abs(Math.floor((baseSeed + modifier + random() * 17) % palette.length));
      color = palette[idx % palette.length];
    }
    if(!color && palette && palette.length){
      color = palette[0];
    }
    if(color && theme.palette.overlay){
      const overlayStrength = clamp(theme.palette.overlayStrength ?? 0.25, 0, 1);
      const mod = overlayStrength * (0.75 + (random() - 0.5) * 0.2);
      color = blendHex(color, theme.palette.overlay, clamp(mod, 0, 1));
    }
    if(color && theme.palette.shift){
      const shiftStrength = clamp(theme.palette.shiftStrength ?? 0.1, 0, 0.6);
      const shiftT = score != null ? clamp((score - theme.threshold) * 0.4 + 0.5, 0, 1) : 0.5;
      color = blendHex(color, theme.palette.shift, shiftStrength * shiftT);
    }
    if(typeof ctx.setFloorColor === 'function' && color){
      ctx.setFloorColor(x, y, color);
    }
    if(typeof ctx.setFloorType === 'function' && theme.floorTypes && theme.floorTypes.length){
      const typeMode = theme.floorTypeMode || 'random';
      const typeScale = theme.typeScale ?? 2.2;
      let index = 0;
      if(typeMode === 'gradient' && (score != null || typeof variation === 'number')){
        const base = score != null ? score : variation;
        const normalized = clamp(0.5 + (base - theme.threshold) * 0.5 * typeScale, 0, 0.999);
        index = Math.floor(normalized * theme.floorTypes.length);
      } else if(typeMode === 'sequence'){
        index = Math.abs(Math.floor((x + y + theme.seed) % theme.floorTypes.length));
      } else if(typeMode === 'angular'){
        const angle = Math.atan2(y - ctx.height / 2, x - ctx.width / 2);
        const normalized = (angle / (Math.PI * 2) + 1.5) % 1;
        index = Math.floor(normalized * theme.floorTypes.length);
      } else {
        const baseSeed = theme.seed * 17 + x * 31 + y * 13;
        const modifier = score != null ? score * 29 : variation * 19;
        index = Math.abs(Math.floor(baseSeed + modifier)) % theme.floorTypes.length;
      }
      ctx.setFloorType(x, y, theme.floorTypes[index]);
    }
  }

  function carveDisc(ctx, cx, cy, radius, palette, theme, random, metaOverride){
    const r = Math.max(1, Math.floor(radius));
    const r2 = r * r;
    for(let y = cy - r - 1; y <= cy + r + 1; y++){
      for(let x = cx - r - 1; x <= cx + r + 1; x++){
        if(typeof ctx.inBounds === 'function' && !ctx.inBounds(x, y)) continue;
        const dx = x - cx;
        const dy = y - cy;
        const dist2 = dx * dx + dy * dy;
        if(dist2 <= r2){
          ctx.set(x, y, 0);
          const normalized = 1 - Math.min(1, dist2 / (r2 || 1));
          const meta = metaOverride ? Object.assign({}, metaOverride) : {};
          if(meta.variation == null) meta.variation = normalized;
          if(meta.score == null) meta.score = theme.threshold + 0.2 + normalized * 0.5;
          applyColors(ctx, x, y, palette, theme, random, meta);
        }
      }
    }
  }

  function carveLine(ctx, x0, y0, x1, y1, width, palette, theme, random, metaOverride){
    const w = Math.max(1, Math.floor(width || 1));
    let dx = Math.abs(x1 - x0);
    const sx = x0 < x1 ? 1 : -1;
    let dy = -Math.abs(y1 - y0);
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    const half = Math.floor(w / 2);
    const totalSteps = Math.max(dx, -dy) + 1;
    let steps = 0;
    let x = x0;
    let y = y0;
    while(true){
      for(let oy = -half; oy <= half; oy++){
        for(let ox = -half; ox <= half; ox++){
          const tx = x + ox;
          const ty = y + oy;
          if(typeof ctx.inBounds === 'function' && !ctx.inBounds(tx, ty)) continue;
          ctx.set(tx, ty, 0);
          const progress = totalSteps <= 1 ? 0 : steps / Math.max(1, totalSteps - 1);
          const meta = metaOverride ? Object.assign({}, metaOverride) : {};
          if(meta.variation == null) meta.variation = 1 - progress;
          if(meta.score == null) meta.score = theme.threshold + 0.15 + (1 - progress) * 0.5;
          applyColors(ctx, tx, ty, palette, theme, random, meta);
        }
      }
      if(x === x1 && y === y1) break;
      const e2 = err * 2;
      if(e2 >= dy){
        err += dy;
        x += sx;
      }
      if(e2 <= dx){
        err += dx;
        y += sy;
      }
      steps++;
    }
  }

  function raisePillar(ctx, theme, cx, cy, radius){
    const r = Math.max(1, Math.floor(radius));
    const r2 = r * r;
    for(let y = cy - r - 1; y <= cy + r + 1; y++){
      for(let x = cx - r - 1; x <= cx + r + 1; x++){
        if(typeof ctx.inBounds === 'function' && !ctx.inBounds(x, y)) continue;
        const dx = x - cx;
        const dy = y - cy;
        if(dx * dx + dy * dy <= r2){
          ctx.set(x, y, 1);
          if(typeof ctx.setWallColor === 'function' && theme.palette.wall){
            ctx.setWallColor(x, y, theme.palette.wall);
          }
        }
      }
    }
  }

  function carveRing(ctx, cx, cy, outerRadius, width, palette, theme, random){
    const outer = Math.max(1, Math.floor(outerRadius));
    carveDisc(ctx, cx, cy, outer, palette, theme, random, { score: theme.threshold + 0.35 });
    const inner = outer - Math.max(1, Math.floor(width || 1));
    if(inner > 0){
      raisePillar(ctx, theme, cx, cy, inner);
    }
  }

  function imprintCoreMask(scoreMap, mask, cx, cy, radius, scoreValue){
    const r = Math.max(1, Math.floor(radius));
    const r2 = r * r;
    const H = mask.length;
    const W = mask[0].length;
    for(let y = Math.max(1, cy - r); y <= Math.min(H - 2, cy + r); y++){
      for(let x = Math.max(1, cx - r); x <= Math.min(W - 2, cx + r); x++){
        const dx = x - cx;
        const dy = y - cy;
        if(dx * dx + dy * dy <= r2){
          mask[y][x] = true;
          if(scoreMap){
            scoreMap[y][x] = Math.max(scoreMap[y][x], scoreValue != null ? scoreValue : 0.6);
          }
        }
      }
    }
  }

  function smoothMask(mask, iterations, threshold){
    let current = mask.map((row) => row.slice());
    const H = current.length;
    const W = current[0].length;
    for(let iter = 0; iter < iterations; iter++){
      const next = new Array(H);
      for(let y = 0; y < H; y++){
        const row = new Array(W);
        for(let x = 0; x < W; x++){
          if(y === 0 || y === H - 1 || x === 0 || x === W - 1){
            row[x] = false;
            continue;
          }
          let neighbors = 0;
          for(let ky = -1; ky <= 1; ky++){
            for(let kx = -1; kx <= 1; kx++){
              if(kx === 0 && ky === 0) continue;
              if(current[y + ky][x + kx]) neighbors++;
            }
          }
          const alive = current[y][x];
          if(alive){
            row[x] = neighbors >= threshold - 1;
          } else {
            row[x] = neighbors >= threshold;
          }
        }
        next[y] = row;
      }
      current = next;
    }
    return current;
  }

  function applyMaskToMap(ctx, mask, theme, random, scoreMap){
    const W = ctx.width;
    const H = ctx.height;
    for(let y = 0; y < H; y++){
      for(let x = 0; x < W; x++){
        if(mask[y][x]){
          ctx.set(x, y, 0);
          const score = scoreMap ? scoreMap[y][x] : theme.threshold + 0.25;
          const variation = score != null ? clamp(0.5 + (score - theme.threshold) * 0.5, 0, 1) : 0.5;
          applyColors(ctx, x, y, theme.palette.floor, theme, random, { score, variation });
        } else {
          ctx.set(x, y, 1);
        }
      }
    }
  }

  function applyOverlays(ctx, theme, random){
    if(!Array.isArray(theme.overlays) || !theme.overlays.length) return;
    const palette = theme.palette.floor && theme.palette.floor.length ? theme.palette.floor : theme.palette.accent;
    const W = ctx.width;
    const H = ctx.height;
    const cx = Math.floor((W - 1) / 2);
    const cy = Math.floor((H - 1) / 2);
    theme.overlays.forEach((overlay) => {
      if(!overlay || !overlay.type) return;
      switch(overlay.type){
        case 'halos': {
          const count = overlay.count ?? 2;
          const start = overlay.start ?? Math.max(3, Math.floor(Math.min(W, H) * 0.15));
          const step = overlay.step ?? 3;
          const width = overlay.width ?? 1;
          for(let i = 0; i < count; i++){
            carveRing(ctx, cx, cy, start + i * step, width, palette, theme, random);
          }
          break;
        }
        case 'voids': {
          const count = overlay.count ?? 6;
          const minR = overlay.minRadius ?? 2;
          const maxR = overlay.maxRadius ?? 4;
          for(let i = 0; i < count; i++){
            const radius = minR + random() * (maxR - minR);
            const px = clamp(Math.floor(random() * (W - 4)) + 2, 1, W - 2);
            const py = clamp(Math.floor(random() * (H - 4)) + 2, 1, H - 2);
            raisePillar(ctx, theme, px, py, radius);
          }
          break;
        }
        case 'spokes': {
          const count = overlay.count ?? 5;
          const width = overlay.width ?? 2;
          const radiusScale = overlay.radiusScale ?? 0.95;
          const jitter = overlay.jitter ?? 0.2;
          for(let i = 0; i < count; i++){
            const baseAngle = (i / count) * Math.PI * 2;
            const angle = baseAngle + (random() - 0.5) * jitter;
            const length = Math.min(W, H) * 0.5 * radiusScale;
            const x1 = cx + Math.cos(angle) * length;
            const y1 = cy + Math.sin(angle) * length;
            carveLine(ctx, cx, cy, Math.round(x1), Math.round(y1), width, palette, theme, random);
          }
          break;
        }
        case 'veins': {
          const count = overlay.count ?? 6;
          const width = overlay.width ?? 1;
          const mode = overlay.mode || 'sinuous';
          const steps = overlay.steps ?? 4;
          for(let i = 0; i < count; i++){
            if(mode === 'horizontal'){
              const yStart = clamp(Math.floor(random() * (H - 4)) + 2, 1, H - 2);
              const yEnd = clamp(yStart + Math.floor((random() - 0.5) * (overlay.span || H / 3)), 1, H - 2);
              carveLine(ctx, 1, yStart, W - 2, yEnd, width, palette, theme, random);
            } else if(mode === 'vertical'){
              const xStart = clamp(Math.floor(random() * (W - 4)) + 2, 1, W - 2);
              const xEnd = clamp(xStart + Math.floor((random() - 0.5) * (overlay.span || W / 3)), 1, W - 2);
              carveLine(ctx, xStart, 1, xEnd, H - 2, width, palette, theme, random);
            } else {
              let sx = clamp(Math.floor(random() * (W - 6)) + 3, 1, W - 2);
              let sy = clamp(Math.floor(random() * (H - 6)) + 3, 1, H - 2);
              for(let step = 0; step < steps; step++){
                const ex = clamp(sx + Math.floor((random() - 0.5) * (overlay.span || W / 2)), 1, W - 2);
                const ey = clamp(sy + Math.floor((random() - 0.5) * (overlay.span || H / 2)), 1, H - 2);
                carveLine(ctx, sx, sy, ex, ey, width, palette, theme, random);
                sx = ex;
                sy = ey;
              }
            }
          }
          break;
        }
        default:
          break;
      }
    });
  }

  function applyAccent(ctx, theme, random){
    const palette = theme.palette.accent && theme.palette.accent.length ? theme.palette.accent : theme.palette.floor;
    const W = ctx.width;
    const H = ctx.height;
    const cx = Math.floor(W / 2);
    const cy = Math.floor(H / 2);
    const longest = Math.max(W, H);

    switch(theme.accent){
      case 'radiant': {
        const rays = 6 + (theme.seed % 5);
        for(let i = 0; i < rays; i++){
          const angle = (i / rays) * Math.PI * 2 + random() * 0.2;
          const x1 = cx + Math.cos(angle) * longest;
          const y1 = cy + Math.sin(angle) * longest;
          carveLine(ctx, cx, cy, Math.round(x1), Math.round(y1), theme.parameters.accentWidth || 1, palette, theme, random);
        }
        break;
      }
      case 'rift': {
        const cracks = 8;
        for(let i = 0; i < cracks; i++){
          const xStart = Math.round(random() * (W - 2)) + 1;
          const yStart = Math.round(random() * (H - 2)) + 1;
          const xEnd = Math.round(random() * (W - 2)) + 1;
          const yEnd = Math.round(random() * (H - 2)) + 1;
          carveLine(ctx, xStart, yStart, xEnd, yEnd, 1 + (i % 2), palette, theme, random);
        }
        break;
      }
      case 'glyphs': {
        const glyphCount = 12;
        for(let i = 0; i < glyphCount; i++){
          const gx = Math.floor(random() * (W - 6)) + 3;
          const gy = Math.floor(random() * (H - 6)) + 3;
          carveDisc(ctx, gx, gy, 1 + (i % 3), palette, theme, random);
          carveLine(ctx, gx - 2, gy, gx + 2, gy, 1, palette, theme, random);
          carveLine(ctx, gx, gy - 2, gx, gy + 2, 1, palette, theme, random);
        }
        break;
      }
      case 'rings': {
        const ringCount = 3 + (theme.seed % 3);
        const baseRadius = Math.min(W, H) / 5;
        for(let i = 0; i < ringCount; i++){
          carveDisc(ctx, cx, cy, baseRadius + i * (theme.parameters.ringSpacing || 3), palette, theme, random);
        }
        break;
      }
      case 'pools': {
        const poolCount = 10;
        for(let i = 0; i < poolCount; i++){
          const px = Math.floor(random() * (W - 4)) + 2;
          const py = Math.floor(random() * (H - 4)) + 2;
          carveDisc(ctx, px, py, 1 + (i % 2) + random() * 2, palette, theme, random);
        }
        break;
      }
      case 'lattice': {
        const spacing = Math.max(3, Math.round(theme.parameters.latticeSpacing || 5));
        for(let x = 1; x < W - 1; x += spacing){
          carveLine(ctx, x, 1, x, H - 2, 1, palette, theme, random);
        }
        for(let y = 1; y < H - 1; y += spacing){
          carveLine(ctx, 1, y, W - 2, y, 1, palette, theme, random);
        }
        break;
      }
      case 'cascade': {
        const steps = 5 + (theme.seed % 4);
        for(let i = 0; i < steps; i++){
          const offset = i * 2;
          const targetY = Math.min(H - 2, Math.round(1 + offset + (theme.parameters.cascadeSlope || 0.25) * (W - 2)));
          carveLine(ctx, 1, 1 + offset, W - 2, targetY, 2, palette, theme, random);
        }
        break;
      }
      case 'threads': {
        const threadCount = 16;
        for(let i = 0; i < threadCount; i++){
          let x = Math.floor(random() * (W - 2)) + 1;
          let y = Math.floor(random() * (H - 2)) + 1;
          const length = 12 + Math.floor(random() * 24);
          for(let step = 0; step < length; step++){
            if(typeof ctx.inBounds === 'function' && !ctx.inBounds(x, y)) break;
            ctx.set(x, y, 0);
            const meta = {
              variation: 1 - clamp(step / Math.max(1, length - 1), 0, 1),
              score: theme.threshold + 0.12 + (step / Math.max(1, length)) * 0.4
            };
            applyColors(ctx, x, y, palette, theme, random, meta);
            const dir = Math.floor(random() * 4);
            if(dir === 0) x++;
            else if(dir === 1) x--;
            else if(dir === 2) y++;
            else y--;
          }
        }
        break;
      }
      case 'mirrors': {
        const folds = 4;
        for(let i = 0; i < folds; i++){
          const angle = (Math.PI * i) / folds;
          const x1 = cx + Math.cos(angle) * longest;
          const y1 = cy + Math.sin(angle) * longest;
          carveLine(ctx, cx, cy, Math.round(x1), Math.round(y1), 2, palette, theme, random);
        }
        break;
      }
      case 'petals': {
        const petals = 8;
        const radius = Math.min(W, H) / 3;
        for(let i = 0; i < petals; i++){
          const angle = (i / petals) * Math.PI * 2;
          const px = cx + Math.cos(angle) * radius;
          const py = cy + Math.sin(angle) * radius;
          carveDisc(ctx, Math.round(px), Math.round(py), theme.parameters.petalRadius || 3, palette, theme, random);
        }
        break;
      }
      case 'orbits': {
        const orbitCount = 5;
        const radius = Math.min(W, H) / 4;
        for(let i = 0; i < orbitCount; i++){
          const angle = random() * Math.PI * 2;
          const px = cx + Math.cos(angle) * radius;
          const py = cy + Math.sin(angle) * radius;
          carveDisc(ctx, Math.round(px), Math.round(py), 2 + (i % 2), palette, theme, random);
          carveLine(ctx, cx, cy, Math.round(px), Math.round(py), 1, palette, theme, random);
        }
        break;
      }
      case 'aurora': {
        const bands = theme.parameters.auroraBands || 3;
        const amplitude = theme.parameters.auroraAmplitude || Math.max(3, Math.floor(H * 0.18));
        const freq = theme.parameters.auroraFrequency || 0.32;
        const width = theme.parameters.auroraWidth || 2;
        for(let band = 0; band < bands; band++){
          let prevY = clamp(Math.floor(random() * (H - 6)) + 3, 1, H - 2);
          for(let x = 1; x < W - 2; x += 2){
            const offset = Math.sin((x + band * 11 + theme.seed * 0.05) * freq);
            const targetY = clamp(Math.floor(prevY + offset * amplitude), 1, H - 2);
            carveLine(ctx, x, prevY, Math.min(W - 2, x + 2), targetY, width, palette, theme, random, { variation: 0.6 });
            prevY = targetY;
          }
        }
        break;
      }
      case 'spiral': {
        const loops = theme.parameters.spiralLoops || 5;
        const width = theme.parameters.spiralWidth || 2;
        const segments = Math.max(loops * 24, 24);
        const maxRadius = Math.min(W, H) / 2 - 2;
        let angle = 0;
        let px = cx;
        let py = cy;
        for(let step = 1; step <= segments; step++){
          const t = step / segments;
          angle += (Math.PI * 2) / (loops * 12) + random() * 0.03;
          const radius = maxRadius * t;
          const nx = clamp(Math.round(cx + Math.cos(angle) * radius), 1, W - 2);
          const ny = clamp(Math.round(cy + Math.sin(angle) * radius), 1, H - 2);
          carveLine(ctx, px, py, nx, ny, width, palette, theme, random, { variation: 1 - t, score: theme.threshold + 0.3 + t * 0.4 });
          px = nx;
          py = ny;
        }
        break;
      }
      case 'spires': {
        const count = theme.parameters.spireCount || 7;
        const width = theme.parameters.spireWidth || 3;
        const length = Math.min(W, H) * 0.45;
        for(let i = 0; i < count; i++){
          const angle = (i / count) * Math.PI * 2 + (random() - 0.5) * 0.25;
          const x1 = cx + Math.cos(angle) * length;
          const y1 = cy + Math.sin(angle) * length;
          carveLine(ctx, cx, cy, Math.round(x1), Math.round(y1), width, palette, theme, random, { variation: 0.7 });
          carveDisc(ctx, Math.round(x1), Math.round(y1), Math.max(2, Math.floor(width * 1.5)), palette, theme, random, { variation: 0.8 });
        }
        break;
      }
      default:
        break;
    }
  }

  const PATTERN_PRESETS = {
    swirl: {
      weights:{ noise:0.45, swirl:1.1, wave:0.2, radial:0.35, ripple:0.25, turbulence:0.28, domain:0.12 },
      parameters:{ noiseScale:6.5, swirlFreq:6.5, swirlTwist:5.4, waveFreq:3.4, waveX:1.1, waveY:0.8, radialScale:1.2, rippleFreq:14, ripplePhase:3.2, coreRadius:3, smoothingIterations:2, smoothingThreshold:4, domainScale:3.2, domainStrength:0.45, domainWave:7.2, domainCross:5.6, turbulenceFreq:2.3, turbulenceOctaves:3, spiralWidth:3 },
      threshold:0.0,
      bias:0,
      accent:'radiant',
      floorTypes:['prismatic','swirl','spiral'],
      gradientMode:'angular',
      gradientVariance:0.06,
      overlays:[
        { type:'spokes', count:6, width:2, radiusScale:0.9 },
        { type:'halos', count:2, start:4, step:4, width:2 }
      ],
      floorTypeMode:'gradient',
      typeScale:2.8
    },
    mosaic: {
      weights:{ noise:0.55, cell:0.7, diagonal:0.25, radial:0.1, turbulence:0.2, domain:0.1 },
      parameters:{ noiseScale:4.1, cellScale:7.5, diagonalFreq:5.3, radialScale:1.4, coreRadius:2, smoothingIterations:1, smoothingThreshold:4, domainScale:5.1, domainStrength:0.35, domainWave:6.5, domainCross:5.5, turbulenceFreq:2.1, turbulenceOctaves:2 },
      threshold:-0.05,
      bias:0.05,
      accent:'glyphs',
      floorTypes:['mosaic','fragment','tile'],
      gradientMode:'diagonal',
      gradientVariance:0.05,
      overlays:[
        { type:'voids', count:7, minRadius:2, maxRadius:3 },
        { type:'veins', count:3, width:1, mode:'horizontal', span:8 },
        { type:'veins', count:3, width:1, mode:'vertical', span:8 }
      ],
      floorTypeMode:'gradient',
      typeScale:2.4
    },
    strata: {
      weights:{ noise:0.35, wave:0.85, ridge:0.45, radial:0.15, turbulence:0.18, domain:0.22 },
      parameters:{ noiseScale:5.6, waveFreq:8.2, waveX:1.4, waveY:0.2, ridgeFreq:5.7, radialScale:1.1, coreRadius:2, smoothingIterations:2, smoothingThreshold:4, domainScale:2.8, domainStrength:0.4, domainWave:6.4, domainCross:4.8, turbulenceFreq:1.7, turbulenceOctaves:3, auroraAmplitude:6, auroraBands:3, auroraFrequency:0.28, auroraWidth:2 },
      threshold:0.05,
      bias:-0.1,
      accent:'cascade',
      floorTypes:['stratum','flow','band'],
      gradientMode:'linear-y',
      gradientVariance:0.045,
      overlays:[
        { type:'veins', count:4, width:2, mode:'horizontal', span:10 }
      ],
      floorTypeMode:'gradient',
      typeScale:2.1
    },
    lattice: {
      weights:{ noise:0.25, diagonal:0.6, ridge:0.5, cross:0.6, turbulence:0.15, domain:0.18 },
      parameters:{ noiseScale:3.5, diagonalFreq:4.4, ridgeFreq:6.3, coreRadius:2, latticeSpacing:5, smoothingIterations:1, smoothingThreshold:4, domainScale:3.6, domainStrength:0.3, domainWave:5.8, domainCross:4.6, turbulenceFreq:1.9, turbulenceOctaves:2 },
      threshold:0.1,
      bias:-0.12,
      accent:'lattice',
      floorTypes:['lattice','grid','node'],
      gradientMode:'linear-x',
      gradientVariance:0.04,
      overlays:[
        { type:'veins', count:4, width:1, mode:'vertical', span:8 },
        { type:'spokes', count:4, width:1, radiusScale:0.85 }
      ],
      floorTypeMode:'sequence',
      typeScale:1.8
    },
    dunes: {
      weights:{ noise:0.6, wave:0.9, ripple:0.4, turbulence:0.24, domain:0.16 },
      parameters:{ noiseScale:3.8, waveFreq:5.5, waveX:1.8, waveY:0.5, rippleFreq:10, ripplePhase:1.7, coreRadius:2, smoothingIterations:2, smoothingThreshold:4, domainScale:2.4, domainStrength:0.3, domainWave:5.5, domainCross:4.2, turbulenceFreq:1.5, turbulenceOctaves:3 },
      threshold:-0.08,
      bias:0.08,
      accent:'threads',
      floorTypes:['dune','sweep','trace'],
      gradientMode:'diagonal',
      gradientVariance:0.05,
      overlays:[
        { type:'veins', count:6, width:2, mode:'sinuous', span:12 }
      ],
      floorTypeMode:'gradient',
      typeScale:2.0
    },
    bloom: {
      weights:{ noise:0.5, radial:0.7, ripple:0.4, swirl:0.3, turbulence:0.22, domain:0.14 },
      parameters:{ noiseScale:4.8, radialScale:0.9, radialPower:1.4, rippleFreq:9, ripplePhase:2.6, swirlFreq:3.2, swirlTwist:2.4, coreRadius:3, smoothingIterations:2, smoothingThreshold:4, domainScale:2.9, domainStrength:0.32, domainWave:6.1, domainCross:4.9, turbulenceFreq:1.9, turbulenceOctaves:3, petalRadius:3 },
      threshold:-0.03,
      bias:0.02,
      accent:'petals',
      floorTypes:['bloom','petal','halo'],
      gradientMode:'radial',
      gradientVariance:0.055,
      overlays:[
        { type:'halos', count:3, start:3, step:2, width:2 }
      ],
      floorTypeMode:'gradient',
      typeScale:2.5
    },
    crystal: {
      weights:{ noise:0.4, ridge:0.65, diagonal:0.45, radial:0.3, turbulence:0.2, domain:0.25 },
      parameters:{ noiseScale:5.2, ridgeFreq:7.1, diagonalFreq:6.8, radialScale:1.3, coreRadius:3, smoothingIterations:2, smoothingThreshold:4, domainScale:3.8, domainStrength:0.4, domainWave:7.3, domainCross:5.1, turbulenceFreq:2.5, turbulenceOctaves:3 },
      threshold:0.02,
      bias:-0.04,
      accent:'rings',
      floorTypes:['crystal','facet','shear'],
      gradientMode:'angular',
      gradientVariance:0.05,
      overlays:[
        { type:'voids', count:5, minRadius:2, maxRadius:4 },
        { type:'spokes', count:5, width:2, radiusScale:0.88 }
      ],
      floorTypeMode:'angular',
      typeScale:2.6
    },
    abyss: {
      weights:{ noise:0.6, ripple:0.55, radial:-0.25, swirl:0.4, turbulence:0.26, domain:0.18 },
      parameters:{ noiseScale:4.9, rippleFreq:12.6, ripplePhase:2.9, radialScale:1.5, radialPower:1.6, swirlFreq:4.4, swirlTwist:3.7, coreRadius:2, smoothingIterations:3, smoothingThreshold:5, domainScale:2.6, domainStrength:0.42, domainWave:6.8, domainCross:5.4, turbulenceFreq:2.1, turbulenceOctaves:3 },
      threshold:0.12,
      bias:-0.15,
      accent:'rift',
      floorTypes:['abyss','rift','shadow'],
      gradientMode:'radial',
      gradientVariance:0.065,
      overlays:[
        { type:'voids', count:7, minRadius:2, maxRadius:5 },
        { type:'veins', count:4, width:2, mode:'vertical', span:12 }
      ],
      floorTypeMode:'gradient',
      typeScale:2.9
    },
    circuit: {
      weights:{ noise:0.45, wave:0.55, cell:0.4, diagonal:0.35, ridge:0.3, turbulence:0.24, domain:0.2 },
      parameters:{ noiseScale:4.4, waveFreq:9.1, waveX:1.3, waveY:0.7, cellScale:6.1, diagonalFreq:5.6, ridgeFreq:7.4, coreRadius:2, smoothingIterations:2, smoothingThreshold:4, domainScale:3.1, domainStrength:0.36, domainWave:7.1, domainCross:5.0, turbulenceFreq:2.2, turbulenceOctaves:3 },
      threshold:0.04,
      bias:-0.02,
      accent:'threads',
      floorTypes:['circuit','trace','mesh'],
      gradientMode:'linear-x',
      gradientVariance:0.045,
      overlays:[
        { type:'veins', count:4, width:2, mode:'horizontal', span:10 },
        { type:'spokes', count:3, width:2, radiusScale:0.9 }
      ],
      floorTypeMode:'gradient',
      typeScale:2.3
    },
    cascade: {
      weights:{ noise:0.4, radial:0.35, wave:0.65, ripple:0.35, turbulence:0.2, domain:0.16 },
      parameters:{ noiseScale:5.1, radialScale:1.0, radialPower:1.2, waveFreq:7.6, waveX:0.4, waveY:1.8, rippleFreq:8.5, ripplePhase:3.4, coreRadius:2, cascadeSlope:0.25, smoothingIterations:2, smoothingThreshold:4, domainScale:2.9, domainStrength:0.3, domainWave:6.5, domainCross:4.7, turbulenceFreq:1.8, turbulenceOctaves:3 },
      threshold:-0.02,
      bias:0.01,
      accent:'cascade',
      floorTypes:['cascade','stream','plunge'],
      gradientMode:'linear-y',
      gradientVariance:0.05,
      overlays:[
        { type:'veins', count:4, width:2, mode:'vertical', span:12 },
        { type:'halos', count:1, start:4, step:3, width:2 }
      ],
      floorTypeMode:'gradient',
      typeScale:2.2
    }
  };

  const THEMES = [
    {
      id:'abs_prism_spiral',
      name:'プリズム螺旋界',
      description:'虹色の渦と光輪が幾層にも折り重なる抽象螺旋世界。',
      preset:'swirl',
      palette:{ floor:['#f054ff','#c7f0ff','#735dff','#ffa8d6'], accent:['#ffd166','#3d5af1'], wall:'#120a2f' },
      accent:'spiral',
      parameters:{ swirlFreq:7.2, swirlTwist:5.8 },
      mix:{ normal:8, block:6, tags:['swirl','prismatic','abstract'] },
      levelBase:-2,
      sizeBias:0,
      depthBase:2,
      chestBias:'normal'
    },
    {
      id:'abs_chroma_delta',
      name:'クロマデルタ原野',
      description:'彩色されたデルタが波紋のように広がる平原型の抽象地形。',
      preset:'cascade',
      palette:{ floor:['#4de9ff','#2dd881','#f8f32b','#ff6b97'], accent:['#f8f32b','#2f9a9a'], wall:'#0c1f26' },
      parameters:{ cascadeSlope:0.18 },
      mix:{ normal:6, block:7, tags:['delta','fluid','abstract'] },
      levelBase:-1,
      sizeBias:1,
      depthBase:1,
      chestBias:'more'
    },
    {
      id:'abs_vapor_strata',
      name:'蒸気層の聖域',
      description:'蒸気の層が幾筋もの水平面を描く夢幻の聖域。',
      preset:'strata',
      palette:{ floor:['#f1f1f1','#9ad0ec','#c19dfb','#fbb1bd'], accent:['#d7f9ff','#ffc3e3'], wall:'#182128' },
      accent:'aurora',
      parameters:{ waveFreq:7.5 },
      mix:{ normal:5, block:8, tags:['layered','mist','abstract'] },
      levelBase:0,
      sizeBias:-1,
      depthBase:2,
      chestBias:'less'
    },
    {
      id:'abs_lattice_halo',
      name:'格子の光環',
      description:'格子状の輝きが光環となって幾何学的に重なる領域。',
      preset:'lattice',
      palette:{ floor:['#bff3ff','#ffe066','#d4b5ff','#96f7d2'], accent:['#ffd43b','#70d6ff'], wall:'#141414' },
      parameters:{ latticeSpacing:4 },
      mix:{ normal:7, block:5, tags:['geometric','grid','abstract'] },
      levelBase:1,
      sizeBias:0,
      depthBase:3,
      chestBias:'normal'
    },
    {
      id:'abs_gossamer_drift',
      name:'薄紗漂流層',
      description:'薄紗のような繊維が漂い、紐が絡み合う漂流空間。',
      preset:'dunes',
      palette:{ floor:['#fcefff','#f3d1f4','#e8f6f8','#c8d9eb'], accent:['#f7aef8','#a0d4f6'], wall:'#1f1a2e' },
      parameters:{ waveFreq:4.8, rippleFreq:12.3 },
      mix:{ normal:6, block:6, tags:['threads','flow','abstract'] },
      levelBase:-3,
      sizeBias:-1,
      depthBase:1,
      chestBias:'less'
    },
    {
      id:'abs_celadon_fragment',
      name:'青磁フラグメント',
      description:'青磁色の破片が浮遊し、欠片が繋ぎ合わさる断片界。',
      preset:'mosaic',
      palette:{ floor:['#9fd8cb','#6db5a0','#f2efea','#ddeedf'], accent:['#88c0a8','#e6f2ee'], wall:'#0f292f' },
      mix:{ normal:5, block:6, tags:['fragment','mosaic','abstract'] },
      levelBase:-1,
      sizeBias:0,
      depthBase:2,
      chestBias:'normal'
    },
    {
      id:'abs_neon_river_mesh',
      name:'ネオン河の網界',
      description:'ネオン色の河が網目のように走る流線型の世界。',
      preset:'circuit',
      palette:{ floor:['#0cff95','#17c3b2','#ff6f91','#845ec2'], accent:['#f9f871','#00bbf0'], wall:'#050b12' },
      parameters:{ waveFreq:10.4 },
      mix:{ normal:8, block:6, tags:['neon','network','abstract'] },
      levelBase:2,
      sizeBias:1,
      depthBase:3,
      chestBias:'more'
    },
    {
      id:'abs_opaline_reservoir',
      name:'オパール貯留層',
      description:'オパールの光が水面のように反射する貯留層。',
      preset:'bloom',
      palette:{ floor:['#a6e3e9','#f9f7f7','#ffcbf2','#dfe7fd'], accent:['#bde0fe','#ffcfd2'], wall:'#16202a' },
      mix:{ normal:4, block:7, tags:['reservoir','opal','abstract'] },
      levelBase:0,
      sizeBias:-1,
      depthBase:2,
      chestBias:'normal'
    },
    {
      id:'abs_aurora_petals',
      name:'オーロラ花弁界',
      description:'オーロラが花弁となって開く幻想的な空中庭園。',
      preset:'bloom',
      palette:{ floor:['#6ef3d6','#71dfe7','#f6d1f1','#d9f0ff'], accent:['#ffadad','#bde0fe'], wall:'#0e1420' },
      accent:'aurora',
      parameters:{ rippleFreq:11.5, ripplePhase:4.1 },
      mix:{ normal:7, block:7, tags:['aurora','garden','abstract'] },
      levelBase:1,
      sizeBias:0,
      depthBase:3,
      chestBias:'more'
    },
    {
      id:'abs_echo_veil',
      name:'エコーヴェイル回廊',
      description:'音の残響が薄いヴェイルとなって延びる回廊。',
      preset:'swirl',
      palette:{ floor:['#cdb4db','#a2d2ff','#dfe7fd','#ffc8dd'], accent:['#b185db','#ffafcc'], wall:'#1b1334' },
      parameters:{ swirlFreq:5.1, waveFreq:2.8 },
      mix:{ normal:5, block:4, tags:['corridor','echo','abstract'] },
      levelBase:-2,
      sizeBias:0,
      depthBase:2,
      chestBias:'less'
    },
    {
      id:'abs_fractal_orchard',
      name:'フラクタル果樹苑',
      description:'フラクタル樹冠が幾何学的な果実園を形成する空間。',
      preset:'crystal',
      palette:{ floor:['#d0f4de','#a9def9','#fcf6bd','#e4c1f9'], accent:['#f694c1','#d3f8e2'], wall:'#142215' },
      parameters:{ ridgeFreq:6.5 },
      mix:{ normal:6, block:6, tags:['fractal','grove','abstract'] },
      levelBase:0,
      sizeBias:0,
      depthBase:3,
      chestBias:'normal'
    },
    {
      id:'abs_glass_mandala',
      name:'玻璃マンダラ',
      description:'ガラスの破片が曼荼羅のように広がる聖域。',
      preset:'mosaic',
      palette:{ floor:['#bee3f8','#e9d8fd','#fefcbf','#c3dafe'], accent:['#fbb6ce','#b794f4'], wall:'#1a1e3f' },
      parameters:{ cellScale:8.4 },
      mix:{ normal:4, block:5, tags:['mandala','glass','abstract'] },
      levelBase:1,
      sizeBias:-1,
      depthBase:2,
      chestBias:'normal'
    },
    {
      id:'abs_glyphfield_drift',
      name:'グリフフィールドの漂い',
      description:'古代グリフが漂う野原状の抽象空間。',
      preset:'mosaic',
      palette:{ floor:['#f7f7ff','#cdc1ff','#f8edeb','#b8bedd'], accent:['#ffc6ff','#cdb4db'], wall:'#1d1d2f' },
      parameters:{ diagonalFreq:6.1 },
      mix:{ normal:5, block:6, tags:['glyph','field','abstract'] },
      levelBase:-1,
      sizeBias:0,
      depthBase:2,
      chestBias:'less'
    },
    {
      id:'abs_origami_horizon',
      name:'折紙地平',
      description:'折り紙の折線が地平線のように続く曲面世界。',
      preset:'lattice',
      palette:{ floor:['#fde2e4','#c5dedd','#f0efeb','#d8e2dc'], accent:['#ffcad4','#9d8189'], wall:'#221e22' },
      parameters:{ latticeSpacing:6 },
      mix:{ normal:6, block:5, tags:['fold','plane','abstract'] },
      levelBase:0,
      sizeBias:-1,
      depthBase:2,
      chestBias:'normal'
    },
    {
      id:'abs_crystal_cascade',
      name:'クリスタルカスケード',
      description:'結晶の滝が階段状に連なる抽象瀑布。',
      preset:'cascade',
      palette:{ floor:['#96e6b3','#d9f8c4','#f4f9f9','#84c7d0'], accent:['#56cfe1','#4ea8de'], wall:'#17323f' },
      parameters:{ waveFreq:6.8 },
      mix:{ normal:5, block:7, tags:['cascade','crystal','abstract'] },
      levelBase:2,
      sizeBias:1,
      depthBase:3,
      chestBias:'more'
    },
    {
      id:'abs_ember_shroud',
      name:'残燼の被膜',
      description:'残り火が薄い被膜となって漂う陰影空間。',
      preset:'abyss',
      palette:{ floor:['#ffb5a7','#fcd5ce','#f8edeb','#f9dcc4'], accent:['#f08080','#bb3e03'], wall:'#2c1810' },
      parameters:{ rippleFreq:13.6 },
      mix:{ normal:4, block:6, tags:['ember','shadow','abstract'] },
      levelBase:1,
      sizeBias:-1,
      depthBase:2,
      chestBias:'less'
    },
    {
      id:'abs_lunar_tessellation',
      name:'月面テッセレーション',
      description:'月面を思わせるタイルがテッセレーションを描く領域。',
      preset:'mosaic',
      palette:{ floor:['#dfe7fd','#ced4da','#adb5bd','#dee2e6'], accent:['#fff1e6','#9d8189'], wall:'#1b1d24' },
      mix:{ normal:6, block:5, tags:['lunar','tile','abstract'] },
      levelBase:0,
      sizeBias:-2,
      depthBase:2,
      chestBias:'normal'
    },
    {
      id:'abs_saffron_tempest',
      name:'サフランテンペスト',
      description:'サフラン色の嵐が筋状に走る灼熱の抽象地帯。',
      preset:'strata',
      palette:{ floor:['#ffb703','#fb8500','#fdfcdc','#ffedd8'], accent:['#ff9f1c','#ff5d73'], wall:'#2f1b0c' },
      parameters:{ waveFreq:9.4 },
      mix:{ normal:8, block:6, tags:['storm','heat','abstract'] },
      levelBase:3,
      sizeBias:1,
      depthBase:3,
      chestBias:'more'
    },
    {
      id:'abs_verdigris_tangle',
      name:'緑青タングル',
      description:'緑青色の線が絡み合うタングル構造の迷界。',
      preset:'dunes',
      palette:{ floor:['#00a896','#02c39a','#f0f3bd','#05668d'], accent:['#78c6a3','#00c2a8'], wall:'#052022' },
      parameters:{ waveFreq:5.2, rippleFreq:11 },
      mix:{ normal:6, block:7, tags:['tangle','organic','abstract'] },
      levelBase:1,
      sizeBias:0,
      depthBase:2,
      chestBias:'normal'
    },
    {
      id:'abs_iridescent_delta',
      name:'玉虫デルタ',
      description:'玉虫色のデルタが光の筋で区切られた幻想地形。',
      preset:'cascade',
      palette:{ floor:['#f8edeb','#fad2e1','#e2ece9','#bee1e6'], accent:['#cddafd','#d0f4de'], wall:'#15211f' },
      parameters:{ cascadeSlope:0.32 },
      mix:{ normal:5, block:5, tags:['delta','iridescent','abstract'] },
      levelBase:0,
      sizeBias:1,
      depthBase:2,
      chestBias:'more'
    },
    {
      id:'abs_quantum_dunes',
      name:'量子砂丘',
      description:'量子揺らぎが砂丘に干渉して揺れる不規則な波紋。',
      preset:'dunes',
      palette:{ floor:['#ffe066','#ffd166','#f4978e','#f3d5b5'], accent:['#f07167','#ffb997'], wall:'#1f170f' },
      parameters:{ ripplePhase:2.2 },
      mix:{ normal:7, block:5, tags:['dune','quantum','abstract'] },
      levelBase:2,
      sizeBias:1,
      depthBase:3,
      chestBias:'normal'
    },
    {
      id:'abs_velvet_abyss',
      name:'ベルベット深淵',
      description:'ベルベットのように柔らかい闇が広がる深淵。',
      preset:'abyss',
      palette:{ floor:['#231942','#5e548e','#9f86c0','#be95c4'], accent:['#e0b1cb','#9f86c0'], wall:'#120919' },
      mix:{ normal:4, block:4, tags:['abyss','velvet','abstract'] },
      levelBase:-2,
      sizeBias:-1,
      depthBase:2,
      chestBias:'less'
    },
    {
      id:'abs_radiant_cathedral',
      name:'光輝カテドラル',
      description:'光が柱とアーチを形成する抽象聖堂。',
      preset:'crystal',
      palette:{ floor:['#f4f1de','#e07a5f','#81b29a','#f2cc8f'], accent:['#f6bd60','#f7ede2'], wall:'#251a0f' },
      accent:'spires',
      parameters:{ radialScale:1.0 },
      mix:{ normal:6, block:6, tags:['cathedral','light','abstract'] },
      levelBase:1,
      sizeBias:0,
      depthBase:3,
      chestBias:'normal'
    },
    {
      id:'abs_mirage_loom',
      name:'蜃気楼織機',
      description:'蜃気楼が織機の糸のように交差する幻影世界。',
      preset:'circuit',
      palette:{ floor:['#ade8f4','#caf0f8','#efefef','#ffc8dd'], accent:['#ffafcc','#90e0ef'], wall:'#0f1b2c' },
      parameters:{ waveFreq:8.6, cellScale:5.4 },
      mix:{ normal:7, block:6, tags:['mirage','loom','abstract'] },
      levelBase:0,
      sizeBias:1,
      depthBase:2,
      chestBias:'normal'
    },
    {
      id:'abs_vapor_prism_towers',
      name:'蒸気プリズム塔',
      description:'蒸気とプリズムが塔のように立ち昇る垂直世界。',
      preset:'swirl',
      palette:{ floor:['#c1f8ff','#ffe3fe','#e6f6ff','#d4efff'], accent:['#ffb7b2','#ade8f4'], wall:'#14213d' },
      parameters:{ swirlTwist:4.9, waveFreq:3.6 },
      mix:{ normal:6, block:7, tags:['tower','steam','abstract'] },
      levelBase:2,
      sizeBias:0,
      depthBase:3,
      chestBias:'more'
    },
    {
      id:'abs_celestial_foldspace',
      name:'星界フォールドスペース',
      description:'星明かりが折り畳まれた空間へと折り重なる異界。',
      preset:'lattice',
      palette:{ floor:['#3a0ca3','#4361ee','#4cc9f0','#b5179e'], accent:['#7209b7','#4895ef'], wall:'#10002b' },
      parameters:{ latticeSpacing:5 },
      mix:{ normal:8, block:7, tags:['stellar','fold','abstract'] },
      levelBase:3,
      sizeBias:0,
      depthBase:3,
      chestBias:'more'
    },
    {
      id:'abs_sapphire_ridge',
      name:'サファイアリッジ',
      description:'青い稜線が幾何学的に折り重なる稜堡空間。',
      preset:'crystal',
      palette:{ floor:['#0d3b66','#1a659e','#1d8a99','#bee9e8'], accent:['#d8e2dc','#99d6ea'], wall:'#051622' },
      parameters:{ ridgeFreq:8.4 },
      mix:{ normal:7, block:5, tags:['ridge','sapphire','abstract'] },
      levelBase:1,
      sizeBias:1,
      depthBase:3,
      chestBias:'normal'
    },
    {
      id:'abs_emberglass_ribbons',
      name:'焔玻璃リボン',
      description:'火と玻璃がリボンとなって絡み合う空間。',
      preset:'strata',
      palette:{ floor:['#ff7b00','#ff8800','#ffd670','#fffcf2'], accent:['#fcbf49','#e85d04'], wall:'#2d1e0f' },
      accent:'spiral',
      parameters:{ waveFreq:10.2 },
      mix:{ normal:5, block:6, tags:['ribbon','ember','abstract'] },
      levelBase:2,
      sizeBias:0,
      depthBase:3,
      chestBias:'more'
    },
    {
      id:'abs_pale_greenwave',
      name:'蒼波グリーンウェイブ',
      description:'青緑の波動が静かに打ち寄せる抽象潮汐界。',
      preset:'cascade',
      palette:{ floor:['#00afb9','#90f1ef','#c0fdfb','#ffd6e0'], accent:['#f07167','#0081a7'], wall:'#0c3a40' },
      parameters:{ waveFreq:7.9 },
      mix:{ normal:6, block:5, tags:['wave','tidal','abstract'] },
      levelBase:-1,
      sizeBias:0,
      depthBase:2,
      chestBias:'normal'
    },
    {
      id:'abs_twilight_circuit',
      name:'薄暮回路',
      description:'薄暮の光が回路となって都市のように流れる空間。',
      preset:'circuit',
      palette:{ floor:['#14213d','#1b2a4b','#9d4edd','#f72585'], accent:['#4361ee','#ff4d6d'], wall:'#05060a' },
      parameters:{ waveFreq:11.2, cellScale:5.1 },
      mix:{ normal:7, block:7, tags:['twilight','circuit','abstract'] },
      levelBase:2,
      sizeBias:1,
      depthBase:3,
      chestBias:'more'
    },
    {
      id:'abs_obsidian_sonar',
      name:'黒曜ソナー',
      description:'黒曜石の反響が波紋を描くソナー空間。',
      preset:'abyss',
      palette:{ floor:['#03045e','#023e8a','#0077b6','#00b4d8'], accent:['#90e0ef','#ade8f4'], wall:'#01030c' },
      parameters:{ rippleFreq:15.2 },
      mix:{ normal:5, block:4, tags:['echo','deep','abstract'] },
      levelBase:-1,
      sizeBias:-1,
      depthBase:2,
      chestBias:'less'
    },
    {
      id:'abs_cobalt_mistways',
      name:'コバルト霧道',
      description:'コバルト色の霧が道筋となって流れる幻想通路。',
      preset:'dunes',
      palette:{ floor:['#0077b6','#0096c7','#00b4d8','#48cae4'], accent:['#ade8f4','#caf0f8'], wall:'#021d30' },
      parameters:{ waveFreq:6.3, ripplePhase:3.1 },
      mix:{ normal:6, block:5, tags:['mist','path','abstract'] },
      levelBase:0,
      sizeBias:0,
      depthBase:2,
      chestBias:'normal'
    },
    {
      id:'abs_crimson_moire',
      name:'深紅モアレ',
      description:'モアレ干渉が深紅の層を揺らす抽象地帯。',
      preset:'strata',
      palette:{ floor:['#f94144','#f3722c','#f8961e','#f9844a'], accent:['#f9c74f','#f9844a'], wall:'#2c0703' },
      parameters:{ waveFreq:11.5 },
      mix:{ normal:8, block:5, tags:['moire','fire','abstract'] },
      levelBase:3,
      sizeBias:1,
      depthBase:3,
      chestBias:'more'
    },
    {
      id:'abs_spectral_brushwork',
      name:'スペクトル筆致',
      description:'絵筆のような筆致が色彩スペクトルを描くアトリエ世界。',
      preset:'bloom',
      palette:{ floor:['#ffcad4','#b0d0d3','#c08497','#f7af9d'], accent:['#ff99c8','#fcf6bd'], wall:'#2a1a1f' },
      parameters:{ rippleFreq:8.8, swirlFreq:4.1 },
      mix:{ normal:5, block:6, tags:['art','spectrum','abstract'] },
      levelBase:-1,
      sizeBias:0,
      depthBase:2,
      chestBias:'normal'
    },
    {
      id:'abs_porcelain_trench',
      name:'磁器トレンチ',
      description:'磁器質の断面が幾重にも走る深いトレンチ。',
      preset:'crystal',
      palette:{ floor:['#f0efeb','#dfe7fd','#adcbe3','#d6eadf'], accent:['#ffddd2','#e2ece9'], wall:'#212121' },
      parameters:{ diagonalFreq:5.9 },
      mix:{ normal:4, block:5, tags:['trench','porcelain','abstract'] },
      levelBase:-1,
      sizeBias:-2,
      depthBase:2,
      chestBias:'less'
    },
    {
      id:'abs_azure_pendulum',
      name:'蒼の振り子',
      description:'振り子運動の軌跡が蒼い軌道を描く世界。',
      preset:'swirl',
      palette:{ floor:['#4895ef','#56cfe1','#64dfdf','#72efdd'], accent:['#80ffdb','#4ea8de'], wall:'#10203a' },
      parameters:{ swirlFreq:4.9, waveFreq:4.2 },
      mix:{ normal:6, block:6, tags:['pendulum','wave','abstract'] },
      levelBase:0,
      sizeBias:0,
      depthBase:3,
      chestBias:'normal'
    },
    {
      id:'abs_gilded_vortex',
      name:'金渦殿',
      description:'黄金の渦が宮殿のように螺旋を描く神秘空間。',
      preset:'swirl',
      palette:{ floor:['#ffbe0b','#fb5607','#ff006e','#8338ec'], accent:['#ffd60a','#ff9f1c'], wall:'#2f1a0a' },
      parameters:{ swirlFreq:8.3, rippleFreq:12.1 },
      mix:{ normal:8, block:7, tags:['vortex','gold','abstract'] },
      levelBase:4,
      sizeBias:1,
      depthBase:3,
      chestBias:'more'
    },
    {
      id:'abs_monochrome_mountain',
      name:'モノクローム山脈',
      description:'モノクロームの陰影が山脈の抽象形を描き出す。',
      preset:'crystal',
      palette:{ floor:['#f8f9fa','#ced4da','#adb5bd','#6c757d'], accent:['#dee2e6','#b0b0b0'], wall:'#1b1b1b' },
      parameters:{ ridgeFreq:5.4 },
      mix:{ normal:4, block:5, tags:['monochrome','ridge','abstract'] },
      levelBase:-2,
      sizeBias:-1,
      depthBase:2,
      chestBias:'less'
    },
    {
      id:'abs_auric_confluence',
      name:'金色コンフルエンス',
      description:'金色の流線が一点に収束するコンフルエンス界。',
      preset:'cascade',
      palette:{ floor:['#f0d3f7','#f7f1d7','#fff5c2','#fde2b9'], accent:['#ffbe0b','#ffdd00'], wall:'#302213', shift:'#fff3b0', shiftStrength:0.22 },
      parameters:{ cascadeSlope:0.27 },
      mix:{ normal:6, block:6, tags:['confluence','gold','abstract'] },
      levelBase:1,
      sizeBias:1,
      depthBase:2,
      chestBias:'more'
    },
    {
      id:'abs_noctilucent_threadsea',
      name:'夜光糸の海',
      description:'夜光虫のような糸が海原に漂う幻想世界。',
      preset:'dunes',
      palette:{ floor:['#03071e','#370617','#6a040f','#d00000'], accent:['#ffba08','#f48c06'], wall:'#000814', overlay:'#1a759f', overlayStrength:0.25 },
      parameters:{ waveFreq:4.4, rippleFreq:9.7 },
      mix:{ normal:5, block:7, tags:['thread','noctilucent','abstract'] },
      levelBase:0,
      sizeBias:0,
      depthBase:3,
      chestBias:'normal'
    }
  ];
  function mergeTheme(theme, index){
    const preset = PATTERN_PRESETS[theme.preset];
    if(!preset){
      throw new Error(`Unknown preset ${theme.preset}`);
    }
    const merged = Object.assign({}, theme);
    merged.weights = Object.assign({}, preset.weights, theme.weights || {});
    merged.parameters = Object.assign({}, preset.parameters, theme.parameters || {});
    merged.threshold = typeof theme.threshold === 'number' ? theme.threshold : preset.threshold;
    merged.bias = typeof theme.bias === 'number' ? theme.bias : preset.bias;
    merged.accent = theme.accent || preset.accent;
    const baseFloorTypes = theme.floorTypes || preset.floorTypes || [];
    merged.floorTypes = Array.isArray(baseFloorTypes) ? baseFloorTypes.slice() : [];
    merged.palette = Object.assign({ floor:[], accent:[], wall:null }, preset.palette || {}, theme.palette || {});
    merged.palette.floor = Array.isArray(merged.palette.floor) ? merged.palette.floor.slice() : [];
    merged.palette.accent = Array.isArray(merged.palette.accent) ? merged.palette.accent.slice() : [];
    if(Array.isArray(merged.palette.gradient)){
      merged.palette.gradient = merged.palette.gradient.slice();
    }
    merged.gradientMode = theme.gradientMode || preset.gradientMode || null;
    merged.gradientVariance = theme.gradientVariance ?? preset.gradientVariance ?? 0.05;
    if(!merged.palette.gradient && merged.gradientMode && merged.palette.floor.length >= 2){
      merged.palette.gradient = merged.palette.floor.slice();
    }
    merged.gradientStops = Array.isArray(merged.palette.gradient) ? parseGradientStops(merged.palette.gradient) : null;
    const presetOverlays = Array.isArray(preset.overlays) ? preset.overlays : [];
    const themeOverlays = Array.isArray(theme.overlays) ? theme.overlays : (theme.overlays ? [theme.overlays] : []);
    merged.overlays = presetOverlays.concat(themeOverlays).map((overlay) => Object.assign({}, overlay));
    merged.floorTypeMode = theme.floorTypeMode || preset.floorTypeMode || 'random';
    merged.typeScale = theme.typeScale ?? preset.typeScale ?? 2.2;
    merged.seed = (theme.seed != null ? theme.seed : (index * 17 + 97)) & 0xffff;
    merged.levelBase = theme.levelBase ?? 0;
    merged.sizeBias = theme.sizeBias ?? 0;
    merged.depthBase = theme.depthBase ?? 2;
    merged.chestBias = theme.chestBias || 'normal';
    merged.mix = theme.mix || { normal:5, block:5, tags:['abstract'] };
    return merged;
  }

  function generateAbstractMap(ctx, theme){
    const W = ctx.width;
    const H = ctx.height;
    const random = ctx.random || Math.random;
    const palette = theme.palette.floor;
    const seed = theme.seed;
    const map = ctx.map;
    for(let y = 0; y < H; y++){
      for(let x = 0; x < W; x++){
        map[y][x] = 1;
        if(typeof ctx.setWallColor === 'function' && theme.palette.wall){
          ctx.setWallColor(x, y, theme.palette.wall);
        }
      }
    }
    const cx = (W - 1) / 2;
    const cy = (H - 1) / 2;
    const scaleBase = 1 / Math.max(W, H);
    const params = theme.parameters;
    const scoreMap = Array.from({ length: H }, () => new Array(W).fill(theme.threshold - 1));
    const mask = Array.from({ length: H }, () => new Array(W).fill(false));
    for(let y = 1; y < H - 1; y++){
      for(let x = 1; x < W - 1; x++){
        const nx = (x - cx) * scaleBase * (params.stretchX || 1);
        const ny = (y - cy) * scaleBase * (params.stretchY || 1);
        const radius = Math.sqrt(nx * nx + ny * ny);
        const angle = Math.atan2(ny, nx);
        let score = theme.bias || 0;
        if(theme.weights.noise){
          const n = pseudoNoise(nx * (params.noiseScale || 1) + seed, ny * (params.noiseScale || 1) + seed * 0.7, seed + ctx.floor * 13);
          score += theme.weights.noise * (n - 0.5);
        }
        if(theme.weights.swirl){
          const swirl = Math.sin(angle * (params.swirlFreq || 0) + radius * (params.swirlTwist || 0) + seed * 0.01 * ctx.floor);
          score += theme.weights.swirl * swirl;
        }
        if(theme.weights.wave){
          const wave = Math.sin((nx * (params.waveX || 1) + ny * (params.waveY || 0.5)) * (params.waveFreq || 1) + seed * 0.03);
          score += theme.weights.wave * wave;
        }
        if(theme.weights.radial){
          const falloff = 1 - Math.pow(radius * (params.radialScale || 1), params.radialPower || 1);
          score += theme.weights.radial * falloff;
        }
        if(theme.weights.cell){
          const cellX = Math.floor((nx + 2) * (params.cellScale || 6));
          const cellY = Math.floor((ny + 2) * (params.cellScale || 6));
          const cellNoise = pseudoNoise(cellX, cellY, seed + 311);
          score += theme.weights.cell * (cellNoise - 0.5);
        }
        if(theme.weights.diagonal){
          const diag = Math.cos((nx - ny) * (params.diagonalFreq || 4) + seed * 0.13);
          score += theme.weights.diagonal * diag;
        }
        if(theme.weights.ridge){
          const rid = 1 - Math.abs(Math.sin((nx + ny) * (params.ridgeFreq || 6) + seed * 0.21));
          score += theme.weights.ridge * (rid - 0.5);
        }
        if(theme.weights.ripple){
          const ripple = Math.sin(radius * (params.rippleFreq || 10) + angle * (params.ripplePhase || 2) + seed * 0.19);
          score += theme.weights.ripple * ripple;
        }
        if(theme.weights.cross){
          const cross = 0.5 - Math.min(Math.abs(nx), Math.abs(ny));
          score += theme.weights.cross * cross;
        }
        if(theme.weights.domain){
          const domainScale = params.domainScale || 3;
          const domainStrength = params.domainStrength || 0.4;
          const warpX = pseudoNoise(nx * domainScale + seed * 0.17, ny * domainScale + seed * 0.21, seed + 503);
          const warpY = pseudoNoise(nx * domainScale + seed * 0.33, ny * domainScale + seed * 0.37, seed + 709);
          const warpedX = nx + (warpX - 0.5) * domainStrength;
          const warpedY = ny + (warpY - 0.5) * domainStrength;
          const domainWave = Math.sin((warpedX + warpedY) * (params.domainWave || 6.0));
          const domainCross = Math.cos((warpedX - warpedY) * (params.domainCross || 4.5));
          score += theme.weights.domain * ((domainWave + domainCross) * 0.5);
        }
        if(theme.weights.turbulence){
          const octaves = clamp(params.turbulenceOctaves || 3, 1, 5);
          let freq = params.turbulenceFreq || 2.5;
          let amp = 1;
          let ampSum = 0;
          let turb = 0;
          for(let o = 0; o < octaves; o++){
            const noiseValue = pseudoNoise(nx * freq + seed * (0.11 + o * 0.07), ny * freq + seed * (0.17 + o * 0.05), seed + 97 * (o + 1));
            turb += noiseValue * amp;
            ampSum += amp;
            freq *= 2;
            amp *= 0.5;
          }
          turb = ampSum ? (turb / ampSum) - 0.5 : 0;
          score += theme.weights.turbulence * turb;
        }
        scoreMap[y][x] = score;
        if(score > theme.threshold){
          mask[y][x] = true;
        }
      }
    }
    const coreRadius = params.coreRadius || 2;
    imprintCoreMask(scoreMap, mask, Math.round(cx), Math.round(cy), coreRadius, theme.threshold + 0.3);
    const smoothingIterations = Math.max(0, Math.floor(params.smoothingIterations || 0));
    const smoothingThreshold = clamp(params.smoothingThreshold || 4, 2, 7);
    let workingMask = mask;
    if(smoothingIterations > 0){
      workingMask = smoothMask(mask, smoothingIterations, smoothingThreshold);
      for(let y = 1; y < H - 1; y++){
        for(let x = 1; x < W - 1; x++){
          if(workingMask[y][x] && !mask[y][x]){
            scoreMap[y][x] = Math.max(scoreMap[y][x], theme.threshold + 0.2);
          }
        }
      }
    }
    applyMaskToMap(ctx, workingMask, theme, random, scoreMap);
    carveDisc(ctx, Math.round(cx), Math.round(cy), coreRadius, palette, theme, random, { score: theme.threshold + 0.5, variation: 1 });
    applyOverlays(ctx, theme, random);
    applyAccent(ctx, theme, random);
  }

  const mergedThemes = THEMES.map(mergeTheme);

  const generators = mergedThemes.map((theme) => ({
    id: theme.id,
    name: theme.name,
    description: theme.description,
    mixin: {
      normalMixed: clamp(theme.mix.normal ?? 5, 0, 12),
      blockDimMixed: clamp(theme.mix.block ?? 5, 0, 12),
      tags: Array.isArray(theme.mix.tags) ? theme.mix.tags : ['abstract']
    },
    algorithm(ctx){
      generateAbstractMap(ctx, theme);
    }
  }));

  const blocks = { blocks1:[], blocks2:[], blocks3:[], dimensions:[] };
  const chestCycle = ['less','normal','more','normal'];
  const anomalyCount = 20;

  mergedThemes.forEach((theme, index) => {
    const keyBase = theme.id.replace(/[^a-z0-9]+/gi, '_');
    const levelBase = theme.levelBase;
    const depthBase = clamp(theme.depthBase, 1, 5);
    const sizeBase = clamp(theme.sizeBias, -2, 2);
    const blockChest = theme.chestBias;

    blocks.blocks1.push({
      key: `${keyBase}_entry`,
      name: `${theme.name}：導入層`,
      level: clamp(levelBase, -5, 10),
      size: clamp(sizeBase, -2, 2),
      depth: clamp(depthBase, 1, 5),
      chest: chestCycle[index % chestCycle.length] || blockChest,
      type: theme.id,
      bossFloors: depthBase >= 4 ? [depthBase] : undefined
    });

    blocks.blocks2.push({
      key: `${keyBase}_core`,
      name: `${theme.name}：中核層`,
      level: clamp(levelBase + 2, -3, 12),
      size: clamp(sizeBase + 1, -2, 2),
      depth: clamp(depthBase + 1, 1, 6),
      chest: blockChest,
      type: theme.id,
      bossFloors: depthBase + 1 >= 5 ? [depthBase + 1] : undefined
    });

    const apexDepth = clamp(depthBase + 2, 2, 7);
    const bossFloors = [];
    if(apexDepth >= 5) bossFloors.push(5);
    if(apexDepth >= 8) bossFloors.push(8);

    blocks.blocks3.push({
      key: `${keyBase}_apex`,
      name: `${theme.name}：極致層`,
      level: clamp(levelBase + 5, -1, 15),
      size: clamp(sizeBase + (index % 2 === 0 ? 0 : 1), -2, 2),
      depth: apexDepth,
      chest: index % 3 === 0 ? 'more' : blockChest,
      type: theme.id,
      bossFloors: bossFloors.length ? bossFloors : undefined
    });

    if(index < anomalyCount){
      blocks.blocks3.push({
        key: `${keyBase}_anomaly`,
        name: `${theme.name}：異相断面`,
        level: clamp(levelBase + 7, 0, 18),
        size: clamp(sizeBase - 1, -2, 2),
        depth: clamp(apexDepth + 1, 3, 8),
        chest: 'more',
        type: theme.id,
        bossFloors: [Math.min(6, clamp(apexDepth + 1, 4, 10))]
      });
    }
  });

  blocks.dimensions.push(
    { key:'abs-spectrum-origin', name:'スペクトラム起源界', baseLevel:0 },
    { key:'abs-spectrum-halo', name:'光輪多層界', baseLevel:4 },
    { key:'abs-spectrum-deep', name:'深層抽象海', baseLevel:7 }
  );

  window.registerDungeonAddon({
    id: ADDON_ID,
    name: ADDON_NAME,
    nameKey: "dungeon.packs.abstract_spectrum_pack.name",
    version: VERSION,
    blocks,
    generators
  });
})();

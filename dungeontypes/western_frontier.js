(function(){
  const ADDON_ID = 'western_frontier_pack';
  const ADDON_NAME = 'Western Frontier Mega Pack';
  const VERSION = '1.1.0';

  function clamp(value, min, max){
    return value < min ? min : (value > max ? max : value);
  }

  function hexToRgb(hex){
    const value = hex.replace('#', '');
    const bigint = parseInt(value, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  }

  function rgbToHex({ r, g, b }){
    const clampChannel = (c) => clamp(Math.round(c), 0, 255);
    const toHex = (c) => clampChannel(c).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  function mixColor(a, b, t){
    const ra = hexToRgb(a);
    const rb = hexToRgb(b);
    return rgbToHex({
      r: ra.r + (rb.r - ra.r) * t,
      g: ra.g + (rb.g - ra.g) * t,
      b: ra.b + (rb.b - ra.b) * t,
    });
  }

  function jitterColor(hex, magnitude, random){
    if(!magnitude) return hex;
    const base = hexToRgb(hex);
    const delta = () => (random() - 0.5) * magnitude * 255;
    return rgbToHex({
      r: base.r + delta(),
      g: base.g + delta(),
      b: base.b + delta(),
    });
  }

  function fill(ctx, value){
    const { map, width: W, height: H } = ctx;
    for(let y = 0; y < H; y++){
      for(let x = 0; x < W; x++){
        map[y][x] = value;
      }
    }
  }

  function carveRect(ctx, x0, y0, x1, y1, value){
    const { map, width: W, height: H } = ctx;
    const minX = clamp(Math.min(x0, x1), 1, W - 2);
    const maxX = clamp(Math.max(x0, x1), 1, W - 2);
    const minY = clamp(Math.min(y0, y1), 1, H - 2);
    const maxY = clamp(Math.max(y0, y1), 1, H - 2);
    for(let y = minY; y <= maxY; y++){
      for(let x = minX; x <= maxX; x++){
        map[y][x] = value;
      }
    }
  }

  function carveDisc(ctx, cx, cy, radius, value){
    const { map, width: W, height: H } = ctx;
    const r = Math.max(1, radius);
    const r2 = r * r;
    for(let y = Math.max(1, cy - r); y <= Math.min(H - 2, cy + r); y++){
      for(let x = Math.max(1, cx - r); x <= Math.min(W - 2, cx + r); x++){
        const dx = x - cx;
        const dy = y - cy;
        if(dx * dx + dy * dy <= r2){
          map[y][x] = value;
        }
      }
    }
  }

  function carveLine(ctx, x0, y0, x1, y1, thickness = 1, value = 0){
    const { map, width: W, height: H } = ctx;
    let dx = Math.abs(x1 - x0);
    let sx = x0 < x1 ? 1 : -1;
    let dy = -Math.abs(y1 - y0);
    let sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    const half = Math.max(0, Math.floor(thickness / 2));
    while(true){
      for(let yy = -half; yy <= half; yy++){
        for(let xx = -half; xx <= half; xx++){
          const tx = x0 + xx;
          const ty = y0 + yy;
          if(tx >= 1 && tx < W - 1 && ty >= 1 && ty < H - 1){
            map[ty][tx] = value;
          }
        }
      }
      if(x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if(e2 >= dy){ err += dy; x0 += sx; }
      if(e2 <= dx){ err += dx; y0 += sy; }
    }
  }

  function tintLine(ctx, x0, y0, x1, y1, thickness = 1, color){
    const { map, width: W, height: H } = ctx;
    let dx = Math.abs(x1 - x0);
    let sx = x0 < x1 ? 1 : -1;
    let dy = -Math.abs(y1 - y0);
    let sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    const half = Math.max(0, Math.floor(thickness / 2));
    while(true){
      for(let yy = -half; yy <= half; yy++){
        for(let xx = -half; xx <= half; xx++){
          const tx = x0 + xx;
          const ty = y0 + yy;
          if(tx >= 1 && tx < W - 1 && ty >= 1 && ty < H - 1 && map[ty][tx] === 0){
            ctx.setFloorColor(tx, ty, color);
          }
        }
      }
      if(x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if(e2 >= dy){ err += dy; x0 += sx; }
      if(e2 <= dx){ err += dx; y0 += sy; }
    }
  }

  function jitter(random, value, variance){
    return value + Math.round((random() - 0.5) * variance);
  }

  function applyPalette(ctx, palette, options = {}){
    const accentStride = options.accentStride ?? 5;
    const accentChance = options.accentChance ?? 0.1;
    const gradientAxis = options.gradientAxis ?? 'y';
    const { map, width: W, height: H, random } = ctx;
    const floorGradient = palette.floorGradient;
    const wallGradient = palette.wallGradient;

    const resolveT = (axis, x, y) => {
      if(axis === 'x'){ return W <= 1 ? 0 : x / (W - 1); }
      if(axis === 'radial'){
        const cx = W / 2;
        const cy = H / 2;
        const dx = x - cx;
        const dy = y - cy;
        const maxDist = Math.sqrt(cx * cx + cy * cy) || 1;
        return clamp(Math.sqrt(dx * dx + dy * dy) / maxDist, 0, 1);
      }
      return H <= 1 ? 0 : y / (H - 1);
    };

    for(let y = 0; y < H; y++){
      for(let x = 0; x < W; x++){
        if(map[y][x] === 0){
          let baseColor = palette.floor;
          if(floorGradient){
            const t = resolveT(floorGradient.axis ?? gradientAxis, x, y);
            baseColor = mixColor(floorGradient.start, floorGradient.end, t);
          }
          if(palette.floorBands){
            for(const band of palette.floorBands){
              const axis = band.axis ?? 'y';
              const t = resolveT(axis, x, y);
              if(t >= band.start && t <= band.end){
                baseColor = band.color;
                break;
              }
            }
          }
          const useAccent = ((x + y) % accentStride === 0) || (random() < accentChance);
          const tinted = palette.accent && useAccent ? palette.accent : baseColor;
          ctx.setFloorColor(x, y, jitterColor(tinted, options.noise ?? 0, random));
        } else {
          let wallColor = palette.wall;
          if(wallGradient){
            const t = resolveT(wallGradient.axis ?? gradientAxis, x, y);
            wallColor = mixColor(wallGradient.start, wallGradient.end, t);
          }
          ctx.setWallColor(x, y, jitterColor(wallColor, options.wallNoise ?? options.noise ?? 0, random));
        }
      }
    }
  }

  function outlineStructures(ctx){
    const { map, width: W, height: H } = ctx;
    for(let y = 1; y < H - 1; y++){
      for(let x = 1; x < W - 1; x++){
        if(map[y][x] !== 0) continue;
        let walls = 0;
        for(let yy = -1; yy <= 1; yy++){
          for(let xx = -1; xx <= 1; xx++){
            if(map[y + yy][x + xx] === 1) walls++;
          }
        }
        if(walls >= 6){
          ctx.setFloorColor(x, y, '#d2b48c');
        }
      }
    }
  }

  function tintRect(ctx, x0, y0, x1, y1, color){
    const { map, width: W, height: H } = ctx;
    const minX = clamp(Math.min(x0, x1), 1, W - 2);
    const maxX = clamp(Math.max(x0, x1), 1, W - 2);
    const minY = clamp(Math.min(y0, y1), 1, H - 2);
    const maxY = clamp(Math.max(y0, y1), 1, H - 2);
    for(let y = minY; y <= maxY; y++){
      for(let x = minX; x <= maxX; x++){
        if(map[y][x] === 0){
          ctx.setFloorColor(x, y, color);
        }
      }
    }
  }

  function tintDisc(ctx, cx, cy, radius, color){
    const { map, width: W, height: H } = ctx;
    const r = Math.max(1, radius);
    const r2 = r * r;
    for(let y = Math.max(1, cy - r); y <= Math.min(H - 2, cy + r); y++){
      for(let x = Math.max(1, cx - r); x <= Math.min(W - 2, cx + r); x++){
        const dx = x - cx;
        const dy = y - cy;
        if(dx * dx + dy * dy <= r2 && map[y][x] === 0){
          ctx.setFloorColor(x, y, color);
        }
      }
    }
  }

  function frontierTown(ctx){
    const { width: W, height: H, random } = ctx;
    fill(ctx, 1);
    const midY = Math.floor(H / 2);
    carveRect(ctx, 1, midY - 2, W - 2, midY + 2, 0);
    const avenueX = Math.floor(W / 2);
    carveRect(ctx, avenueX - 2, 1, avenueX + 2, H - 2, 0);

    carveRect(ctx, 2, midY - 4, W - 3, midY + 4, 0);
    carveRect(ctx, avenueX - 4, 2, avenueX + 4, H - 3, 0);

    const lotWidth = 8;
    for(let side = -1; side <= 1; side += 2){
      for(let i = 0; i < 6; i++){
        const width = Math.max(4, jitter(random, lotWidth, 3));
        const startX = 3 + i * (lotWidth + 2);
        const offsetY = side === -1 ? midY - jitter(random, 5, 3) - 6 : midY + jitter(random, 5, 3) + 6;
        const startY = clamp(offsetY, 2, H - 8);
        const endY = clamp(startY + Math.max(4, jitter(random, 5, 3)), 4, H - 3);
        carveRect(ctx, startX, startY, startX + width, endY, 0);
      }
    }

    for(let i = 0; i < 3; i++){
      const cx = jitter(random, avenueX, 10);
      const cy = jitter(random, midY, 6);
      carveDisc(ctx, clamp(cx, 4, W - 5), clamp(cy, 4, H - 5), random() < 0.4 ? 4 : 3, 0);
    }

    for(let i = 0; i < 4; i++){
      const plazaX = clamp(jitter(random, avenueX, 10), 4, W - 5);
      const plazaY = clamp(jitter(random, midY, 8), 4, H - 5);
      carveRect(ctx, plazaX - 2, plazaY - 2, plazaX + 2, plazaY + 2, 0);
    }

    outlineStructures(ctx);
    applyPalette(ctx, {
      floor: '#b57f50',
      wall: '#5f3a24',
      accent: '#d6a16b',
      floorGradient: { start: '#9c673e', end: '#d9a56c', axis: 'x' },
      wallGradient: { start: '#4a2c1a', end: '#7a4c2e', axis: 'y' },
    }, { accentChance: 0.05, accentStride: 7, noise: 0.03, wallNoise: 0.02 });
    tintRect(ctx, 1, midY - 2, W - 2, midY + 2, '#cba271');
    tintRect(ctx, avenueX - 2, 1, avenueX + 2, H - 2, '#cca877');
    ctx.ensureConnectivity();
  }

  function canyonMeanders(ctx){
    const { width: W, height: H, random } = ctx;
    fill(ctx, 1);

    const passes = 3;
    for(let p = 0; p < passes; p++){
      let x = 2;
      let y = jitter(random, Math.floor(H / 2), H / 4);
      const thickness = 3 + p;
      while(x < W - 2){
        const nx = x + jitter(random, 6, 4);
        const ny = clamp(y + jitter(random, 0, 6) - 3, 2, H - 3);
        carveLine(ctx, x, y, nx, ny, thickness, 0);
        x = nx;
        y = ny;
      }
    }

    for(let y = 2; y < H - 2; y += 5){
      for(let x = 2; x < W - 2; x++){
        if(random() < 0.18){
          carveDisc(ctx, x, y, 2 + Math.floor(random() * 2), 0);
        }
      }
    }

    applyPalette(ctx, {
      floor: '#c98958',
      wall: '#6d3d22',
      accent: '#f0c987',
      floorBands: [
        { start: 0.0, end: 0.15, color: '#e1b774' },
        { start: 0.6, end: 0.9, color: '#a7653b' },
      ],
      wallGradient: { start: '#5a2f18', end: '#8d4726', axis: 'y' },
    }, { accentChance: 0.04, accentStride: 9, noise: 0.04 });
    ctx.ensureConnectivity();
  }

  function ghostTown(ctx){
    const { width: W, height: H, random } = ctx;
    fill(ctx, 1);

    for(let x = 3; x < W - 3; x += 6){
      carveRect(ctx, x, 2, x + 3, H - 3, 0);
      for(let y = 4; y < H - 4; y += 8){
        carveRect(ctx, x - 1, y - 1, x + 4, y + 2, 0);
        if(random() < 0.4){
          carveDisc(ctx, x + 1, y + 1, 2, 0);
        }
      }
    }

    for(let i = 0; i < 5; i++){
      const cx = jitter(random, Math.floor(W / 2), 12);
      const cy = jitter(random, Math.floor(H / 2), 8);
      carveDisc(ctx, clamp(cx, 4, W - 5), clamp(cy, 4, H - 5), random() < 0.5 ? 4 : 5, 0);
    }

    applyPalette(ctx, {
      floor: '#b6a38f',
      wall: '#3f2a22',
      accent: '#d9d0c5',
      floorGradient: { start: '#a7937e', end: '#d3c7b5', axis: 'y' },
      wallGradient: { start: '#2d1d17', end: '#5b4036', axis: 'radial' },
    }, { accentChance: 0.07, accentStride: 6, noise: 0.02, wallNoise: 0.03 });
    ctx.ensureConnectivity();
  }

  function railwayWarrens(ctx){
    const { width: W, height: H, random } = ctx;
    fill(ctx, 1);

    let y = Math.floor(H / 2);
    carveLine(ctx, 1, y, W - 2, y, 3, 0);
    for(let x = 4; x < W - 4; x += 7){
      const branchHeight = jitter(random, 10, 6);
      const top = clamp(y - branchHeight, 2, H - 6);
      const bottom = clamp(y + branchHeight, 5, H - 3);
      carveLine(ctx, x, y, x, top, 2, 0);
      carveLine(ctx, x, y, x, bottom, 2, 0);
      for(let s = top; s <= bottom; s += 5){
        carveRect(ctx, x - 2, s - 2, x + 2, s + 2, 0);
      }
    }

    applyPalette(ctx, {
      floor: '#8d6b5c',
      wall: '#2d1a13',
      accent: '#d9bf9b',
      floorGradient: { start: '#7d5f51', end: '#a27b66', axis: 'x' },
      wallGradient: { start: '#22120c', end: '#3c241a', axis: 'y' },
    }, { accentChance: 0.12, accentStride: 8, noise: 0.05, wallNoise: 0.02 });
    tintRect(ctx, 1, y - 1, W - 2, y + 1, '#caa57f');
    ctx.ensureConnectivity();
  }

  function sunsetBadlands(ctx){
    const { width: W, height: H, random } = ctx;
    fill(ctx, 1);

    const terraces = 5;
    for(let i = 0; i < terraces; i++){
      const offset = jitter(random, 0, 4) - 2;
      const bandY = Math.floor((H / terraces) * i + offset);
      carveRect(ctx, 1, clamp(bandY - 1, 1, H - 2), W - 2, clamp(bandY + 1, 1, H - 2), 0);
    }

    for(let i = 0; i < 4; i++){
      let x = 2;
      let y = clamp(jitter(random, Math.floor(H / 2), 10), 3, H - 4);
      while(x < W - 2){
        const nx = x + jitter(random, 6, 5);
        const ny = clamp(y + jitter(random, 0, 8) - 4, 2, H - 3);
        carveLine(ctx, x, y, nx, ny, 2 + (i % 2), 0);
        x = nx;
        y = ny;
      }
    }

    for(let i = 0; i < 12; i++){
      const cx = clamp(jitter(random, Math.floor(W / 2), W / 2), 3, W - 4);
      const cy = clamp(jitter(random, Math.floor(H / 2), H / 2), 3, H - 4);
      carveDisc(ctx, cx, cy, random() < 0.4 ? 4 : 3, 0);
    }

    applyPalette(ctx, {
      floor: '#d07a3c',
      wall: '#4d1e16',
      accent: '#f8c070',
      floorGradient: { start: '#7a2c18', end: '#f5b45c', axis: 'y' },
      wallGradient: { start: '#3a1511', end: '#7f3322', axis: 'y' },
      floorBands: [
        { start: 0.15, end: 0.25, color: '#f0a45d' },
        { start: 0.55, end: 0.65, color: '#c45f2a' },
        { start: 0.8, end: 0.92, color: '#9f3e1c' },
      ],
    }, { accentChance: 0.05, accentStride: 8, noise: 0.05, wallNoise: 0.04 });

    const centralBand = Math.floor(H / 2);
    tintRect(ctx, 1, centralBand - 1, W - 2, centralBand + 1, '#eda86b');
    ctx.ensureConnectivity();
  }

  function sagebrushBasin(ctx){
    const { width: W, height: H, random } = ctx;
    fill(ctx, 1);

    const cx = Math.floor(W / 2);
    const cy = Math.floor(H / 2);
    const outer = Math.min(cx, cy) - 2;
    carveDisc(ctx, cx, cy, outer, 0);
    carveDisc(ctx, cx, cy, Math.floor(outer * 0.6), 1);
    carveDisc(ctx, cx, cy, Math.floor(outer * 0.35), 0);

    for(let i = 0; i < 6; i++){
      const angle = (Math.PI * 2 / 6) * i;
      const radius = outer - 2;
      const sx = cx + Math.floor(Math.cos(angle) * 2);
      const sy = cy + Math.floor(Math.sin(angle) * 2);
      const ex = cx + Math.floor(Math.cos(angle) * radius);
      const ey = cy + Math.floor(Math.sin(angle) * radius);
      carveLine(ctx, sx, sy, ex, ey, 2, 0);
    }

    for(let i = 0; i < 14; i++){
      const angle = random() * Math.PI * 2;
      const radius = random() * (outer - 4);
      const px = clamp(cx + Math.floor(Math.cos(angle) * radius), 3, W - 4);
      const py = clamp(cy + Math.floor(Math.sin(angle) * radius), 3, H - 4);
      carveDisc(ctx, px, py, random() < 0.5 ? 2 : 3, 0);
    }

    applyPalette(ctx, {
      floor: '#9d875d',
      wall: '#3b2a15',
      accent: '#d4c08a',
      floorGradient: { start: '#7a643c', end: '#c1ae7c', axis: 'radial' },
      wallGradient: { start: '#2a1a0f', end: '#5a4021', axis: 'y' },
    }, { accentChance: 0.09, accentStride: 6, noise: 0.03, wallNoise: 0.02 });

    tintDisc(ctx, cx, cy, Math.floor(outer * 0.32), '#6aa5a1');
    tintDisc(ctx, cx, cy, Math.floor(outer * 0.2), '#4d7a77');
    ctx.ensureConnectivity();
  }

  function thunderMesa(ctx){
    const { width: W, height: H, random } = ctx;
    fill(ctx, 1);

    for(let i = 0; i < 5; i++){
      const startY = clamp(3 + i * 6 + jitter(random, 0, 3), 2, H - 3);
      const endY = clamp(startY + jitter(random, 10, 8) - 4, 2, H - 3);
      carveLine(ctx, 2, startY, W - 3, endY, 2 + (i % 2), 0);
    }

    for(let i = 0; i < 8; i++){
      const cx = clamp(jitter(random, Math.floor(W / 2), W / 3), 3, W - 4);
      const cy = clamp(jitter(random, Math.floor(H / 2), H / 3), 3, H - 4);
      carveDisc(ctx, cx, cy, random() < 0.3 ? 5 : 3, 0);
    }

    for(let i = 0; i < 3; i++){
      const strikeX = clamp(jitter(random, Math.floor(W / 2), W / 4), 4, W - 5);
      carveLine(ctx, strikeX, 2, strikeX - 3, H - 3, 2, 0);
    }

    applyPalette(ctx, {
      floor: '#a66540',
      wall: '#2f1a24',
      accent: '#f3d27a',
      floorGradient: { start: '#5c2b1d', end: '#f4be6f', axis: 'y' },
      wallGradient: { start: '#24121a', end: '#5b2f3b', axis: 'x' },
      floorBands: [
        { start: 0.0, end: 0.2, color: '#d98a52' },
        { start: 0.75, end: 1.0, color: '#7d3c2a' },
      ],
    }, { accentChance: 0.06, accentStride: 7, noise: 0.06, wallNoise: 0.05 });

    const highlightY = clamp(Math.floor(H * 0.3), 2, H - 3);
    tintRect(ctx, 2, highlightY - 1, W - 3, highlightY + 1, '#c9805a');
    ctx.ensureConnectivity();
  }

  function stampedeRidge(ctx){
    const { width: W, height: H, random } = ctx;
    fill(ctx, 1);

    const ridgeY = Math.floor(H * 0.35);
    carveRect(ctx, 1, ridgeY - 1, W - 2, ridgeY + 1, 0);
    carveRect(ctx, 1, ridgeY + 7, W - 2, ridgeY + 10, 0);

    for(let i = 0; i < 6; i++){
      const cx = jitter(random, Math.floor(W * (0.1 + 0.15 * i)), 3);
      carveDisc(ctx, clamp(cx, 4, W - 5), ridgeY + 4, 3, 0);
    }

    for(let i = 0; i < 12; i++){
      const cx = jitter(random, Math.floor(W / 2), W / 2);
      const cy = jitter(random, Math.floor(H * 0.7), 6);
      carveDisc(ctx, clamp(cx, 4, W - 5), clamp(cy, 4, H - 5), random() < 0.5 ? 3 : 4, 0);
    }

    applyPalette(ctx, {
      floor: '#d6b276',
      wall: '#6f4c27',
      accent: '#f2d4a5',
      floorGradient: { start: '#b58c4a', end: '#f4d89a', axis: 'x' },
      wallGradient: { start: '#5b3b1c', end: '#8a5b2d', axis: 'y' },
      floorBands: [
        { start: 0.2, end: 0.35, color: '#e3c082' },
        { start: 0.55, end: 0.7, color: '#c99a54' },
      ],
    }, { accentChance: 0.05, accentStride: 10, noise: 0.03 });
    ctx.ensureConnectivity();
  }

  function saltFlatRuins(ctx){
    const { width: W, height: H, random } = ctx;
    fill(ctx, 1);

    for(let y = 2; y < H - 2; y += 5){
      carveRect(ctx, 2, y, W - 3, y + 1, 0);
    }

    for(let i = 0; i < 20; i++){
      const cx = jitter(random, Math.floor(W / 2), W / 3);
      const cy = jitter(random, Math.floor(H / 2), H / 3);
      carveDisc(ctx, clamp(cx, 3, W - 4), clamp(cy, 3, H - 4), random() < 0.3 ? 5 : 3, 0);
    }

    applyPalette(ctx, {
      floor: '#e8e0d0',
      wall: '#9f8a73',
      accent: '#f5f0e6',
      floorGradient: { start: '#f6f1e7', end: '#d4c7b5', axis: 'radial' },
      wallGradient: { start: '#7f6a57', end: '#bba995', axis: 'y' },
    }, { accentChance: 0.03, accentStride: 4, noise: 0.02, wallNoise: 0.02 });
    ctx.ensureConnectivity();
  }

  function frontierCitadel(ctx){
    const { width: W, height: H, random } = ctx;
    fill(ctx, 1);

    carveRect(ctx, 2, 2, W - 3, H - 3, 0);
    const cx = Math.floor(W / 2);
    const cy = Math.floor(H / 2);
    carveRect(ctx, cx - 2, 2, cx + 2, H - 3, 0);
    carveRect(ctx, 2, cy - 2, W - 3, cy + 2, 0);

    const bastionSize = 4;
    const bastionOffsets = [
      [3, 3],
      [W - bastionSize - 4, 3],
      [3, H - bastionSize - 4],
      [W - bastionSize - 4, H - bastionSize - 4],
    ];
    for(const [bx, by] of bastionOffsets){
      carveRect(ctx, bx, by, bx + bastionSize, by + bastionSize, 0);
    }

    for(let i = 0; i < 6; i++){
      const towerX = clamp(jitter(random, cx, Math.floor(W / 3)), 4, W - 5);
      const towerY = clamp(jitter(random, cy, Math.floor(H / 3)), 4, H - 5);
      carveDisc(ctx, towerX, towerY, random() < 0.4 ? 2 : 3, 0);
    }

    outlineStructures(ctx);
    applyPalette(ctx, {
      floor: '#bfa47a',
      wall: '#4d2c1d',
      accent: '#e8d3a2',
      floorGradient: { start: '#94774d', end: '#ddc796', axis: 'radial' },
      wallGradient: { start: '#371c13', end: '#6d402c', axis: 'y' },
    }, { accentChance: 0.08, accentStride: 5, noise: 0.03, wallNoise: 0.02 });
    tintRect(ctx, cx - 2, 2, cx + 2, H - 3, '#c8b689');
    tintRect(ctx, 2, cy - 2, W - 3, cy + 2, '#ceb889');
    ctx.ensureConnectivity();
  }

  function hoodooNeedles(ctx){
    const { width: W, height: H, random } = ctx;
    fill(ctx, 1);

    const anchors = [];
    for(let i = 0; i < 8; i++){
      const ax = clamp(jitter(random, Math.floor(W / 2), W / 3), 3, W - 4);
      const ay = clamp(jitter(random, Math.floor(H / 2), H / 3), 3, H - 4);
      carveDisc(ctx, ax, ay, random() < 0.5 ? 3 : 4, 0);
      anchors.push([ax, ay]);
    }

    for(let i = 0; i < anchors.length; i++){
      const [ax, ay] = anchors[i];
      const [bx, by] = anchors[(i + 1) % anchors.length];
      carveLine(ctx, ax, ay, bx, by, 2, 0);
    }

    for(const [ax, ay] of anchors){
      const spireCount = 3 + Math.floor(random() * 3);
      for(let s = 0; s < spireCount; s++){
        const angle = random() * Math.PI * 2;
        const length = 4 + Math.floor(random() * 4);
        const ex = clamp(ax + Math.floor(Math.cos(angle) * length), 3, W - 4);
        const ey = clamp(ay + Math.floor(Math.sin(angle) * length), 3, H - 4);
        carveLine(ctx, ax, ay, ex, ey, 1, 0);
      }
    }

    applyPalette(ctx, {
      floor: '#cf8b63',
      wall: '#421f1b',
      accent: '#f7c78b',
      floorGradient: { start: '#8d4d34', end: '#f2b474', axis: 'y' },
      wallGradient: { start: '#311411', end: '#6f362c', axis: 'x' },
      floorBands: [
        { start: 0.25, end: 0.35, color: '#e39a68' },
        { start: 0.65, end: 0.78, color: '#b36443' },
      ],
    }, { accentChance: 0.05, accentStride: 9, noise: 0.05, wallNoise: 0.04 });

    for(const [ax, ay] of anchors){
      tintDisc(ctx, ax, ay, 2, '#f3cf9a');
    }
    ctx.ensureConnectivity();
  }

  function wagonYardSprawl(ctx){
    const { width: W, height: H, random } = ctx;
    fill(ctx, 1);

    const lanes = 5;
    for(let i = 0; i < lanes; i++){
      const laneY = clamp(3 + i * 5 + jitter(random, 0, 2), 2, H - 4);
      carveRect(ctx, 2, laneY, W - 3, laneY + 1, 0);
      if(random() < 0.7){
        carveRect(ctx, 3, laneY - 2, W - 4, laneY + 3, 0);
      }
    }

    for(let x = 4; x < W - 4; x += 6){
      carveRect(ctx, x, 2, x + 2, H - 3, 0);
      if(random() < 0.5){
        carveRect(ctx, x - 2, 2, x - 1, H - 3, 0);
      }
    }

    applyPalette(ctx, {
      floor: '#b88d5c',
      wall: '#3a2515',
      accent: '#d9b67a',
      floorGradient: { start: '#8f6a3f', end: '#e6c795', axis: 'x' },
      wallGradient: { start: '#2a190e', end: '#573820', axis: 'y' },
    }, { accentChance: 0.1, accentStride: 6, noise: 0.04, wallNoise: 0.03 });

    for(let x = 4; x < W - 4; x += 6){
      tintLine(ctx, x + 1, 2, x + 1, H - 3, 1, '#c9a46c');
    }
    ctx.ensureConnectivity();
  }

  function silverCreekCrossing(ctx){
    const { width: W, height: H, random } = ctx;
    fill(ctx, 1);

    const flows = 2;
    for(let f = 0; f < flows; f++){
      let x = 2;
      let y = clamp(jitter(random, Math.floor(H * (0.3 + 0.3 * f)), 4), 2, H - 3);
      const thickness = 3 + f;
      while(x < W - 2){
        const nx = x + jitter(random, 6, 4);
        const ny = clamp(y + jitter(random, 0, 6) - 3, 2, H - 3);
        carveLine(ctx, x, y, nx, ny, thickness, 0);
        x = nx;
        y = ny;
      }
    }

    const bridgeCount = 5;
    const cy = Math.floor(H / 2);
    for(let i = 0; i < bridgeCount; i++){
      const bx = clamp(3 + i * Math.floor((W - 6) / bridgeCount) + jitter(random, 0, 3), 3, W - 4);
      carveRect(ctx, bx - 1, cy - 3, bx + 1, cy + 3, 0);
    }

    applyPalette(ctx, {
      floor: '#9a7f5c',
      wall: '#2e1f16',
      accent: '#cbb38c',
      floorGradient: { start: '#70583a', end: '#d5bf97', axis: 'y' },
      wallGradient: { start: '#23160f', end: '#4d3325', axis: 'x' },
    }, { accentChance: 0.08, accentStride: 7, noise: 0.03, wallNoise: 0.03 });

    let x = 2;
    let y = Math.floor(H * 0.32);
    while(x < W - 2){
      const nx = Math.min(W - 3, x + 5);
      const ny = clamp(y + jitter(random, 0, 4) - 2, 2, H - 3);
      tintLine(ctx, x, y, nx, ny, 3, '#4f98a7');
      x = nx;
      y = ny;
    }

    x = 2;
    y = Math.floor(H * 0.62);
    while(x < W - 2){
      const nx = Math.min(W - 3, x + 5);
      const ny = clamp(y + jitter(random, 0, 4) - 2, 2, H - 3);
      tintLine(ctx, x, y, nx, ny, 4, '#377b8d');
      x = nx;
      y = ny;
    }
    ctx.ensureConnectivity();
  }

  function paintedSwitchbacks(ctx){
    const { width: W, height: H, random } = ctx;
    fill(ctx, 1);

    let y = 3;
    let left = 2;
    let right = W - 3;
    const shelves = [];
    while(y < H - 3){
      const topY = y;
      const bottomY = Math.min(H - 3, y + 2);
      carveRect(ctx, left, topY, right, bottomY, 0);
      shelves.push({ left, right, topY, bottomY });
      y += 5;
      const shift = jitter(random, Math.floor(W / 4), Math.floor(W / 6));
      if(random() < 0.5){
        left = clamp(2 + shift, 2, Math.floor(W / 2));
      } else {
        right = clamp(W - 3 - shift, Math.floor(W / 2), W - 3);
      }
      carveRect(ctx, left, y - 2, right, y - 1, 0);
    }

    for(let i = 0; i < 8; i++){
      const cx = clamp(jitter(random, Math.floor(W / 2), W / 3), 3, W - 4);
      const cy = clamp(jitter(random, Math.floor(H / 2), H / 3), 3, H - 4);
      carveDisc(ctx, cx, cy, random() < 0.5 ? 3 : 4, 0);
    }

    applyPalette(ctx, {
      floor: '#d28c5f',
      wall: '#462217',
      accent: '#f2c37c',
      floorGradient: { start: '#913f27', end: '#f5c681', axis: 'x' },
      wallGradient: { start: '#33170f', end: '#6b3624', axis: 'y' },
      floorBands: [
        { start: 0.1, end: 0.2, color: '#f0a968' },
        { start: 0.75, end: 0.88, color: '#b3603b' },
      ],
    }, { accentChance: 0.07, accentStride: 8, noise: 0.05, wallNoise: 0.04 });

    for(const shelf of shelves){
      tintRect(ctx, shelf.left, shelf.topY, shelf.right, shelf.bottomY - 1, '#f4c98a');
    }
    ctx.ensureConnectivity();
  }

  function coyoteDenNetwork(ctx){
    const { width: W, height: H, random } = ctx;
    fill(ctx, 1);

    const dens = [];
    const centerX = Math.floor(W / 2);
    const centerY = Math.floor(H / 2);
    carveDisc(ctx, centerX, centerY, 4, 0);
    dens.push([centerX, centerY]);

    for(let i = 0; i < 10; i++){
      const angle = random() * Math.PI * 2;
      const radius = 5 + Math.floor(random() * Math.min(centerX, centerY));
      const dx = clamp(centerX + Math.floor(Math.cos(angle) * radius), 3, W - 4);
      const dy = clamp(centerY + Math.floor(Math.sin(angle) * radius), 3, H - 4);
      carveDisc(ctx, dx, dy, random() < 0.5 ? 3 : 2, 0);
      dens.push([dx, dy]);
    }

    for(const [sx, sy] of dens){
      const branchCount = 2 + Math.floor(random() * 3);
      for(let b = 0; b < branchCount; b++){
        const target = dens[Math.floor(random() * dens.length)];
        carveLine(ctx, sx, sy, target[0], target[1], random() < 0.3 ? 3 : 2, 0);
      }
    }

    applyPalette(ctx, {
      floor: '#b99768',
      wall: '#4a3020',
      accent: '#e0c08c',
      floorGradient: { start: '#7d5d3c', end: '#d8ba8a', axis: 'radial' },
      wallGradient: { start: '#362214', end: '#6c432c', axis: 'y' },
    }, { accentChance: 0.09, accentStride: 7, noise: 0.04, wallNoise: 0.03 });

    for(const [dx, dy] of dens){
      tintDisc(ctx, dx, dy, 2, '#cfae77');
    }
    ctx.ensureConnectivity();
  }

  function mkGenerator(id, name, description, algorithm, mixin){
    return { id, name, description, algorithm, mixin };
  }

  const generators = [
    mkGenerator('frontier-main-street', 'フロンティア大通り', '酒場と交易所が並ぶ荒野の街道', frontierTown, { normalMixed: 0.55, blockDimMixed: 0.4, tags: ['town','frontier','western'] }),
    mkGenerator('canyon-meanders', 'メサ峡谷', '蛇行する峡谷と狭い通路が続く', canyonMeanders, { normalMixed: 0.35, blockDimMixed: 0.65, tags: ['canyon','maze','western'] }),
    mkGenerator('sunset-badlands', 'サンセット荒地', '夕陽に染まる段丘と蛇行する獣道', sunsetBadlands, { normalMixed: 0.45, blockDimMixed: 0.55, tags: ['badlands','layers','western'] }),
    mkGenerator('ghost-town-hollows', 'ゴーストタウンの空洞', '廃墟となった町並みに霧が漂う', ghostTown, { normalMixed: 0.45, blockDimMixed: 0.5, tags: ['town','ruin','haunted'] }),
    mkGenerator('railway-warrens', '鉄路の大坑道', '廃線となった鉱山の深部を開通させる', railwayWarrens, { normalMixed: 0.6, blockDimMixed: 0.3, tags: ['mineshaft','linear','western'] }),
    mkGenerator('sagebrush-basin', 'セージブラシ盆地', '灌漑盆地と灌木が織りなす輪状盆地', sagebrushBasin, { normalMixed: 0.5, blockDimMixed: 0.5, tags: ['basin','oasis','western'] }),
    mkGenerator('thunder-mesa', 'サンダーメサ', '雷鳴が轟く嵐の台地を突破する', thunderMesa, { normalMixed: 0.4, blockDimMixed: 0.6, tags: ['mesa','storm','western'] }),
    mkGenerator('stampede-ridge', 'スタンピード・リッジ', '大地が裂け獣の群れが駆け抜けた跡', stampedeRidge, { normalMixed: 0.4, blockDimMixed: 0.6, tags: ['field','ridge','western'] }),
    mkGenerator('salt-flat-ruins', '塩原の遺構', '干上がった塩原に散らばる遺跡が点在', saltFlatRuins, { normalMixed: 0.5, blockDimMixed: 0.45, tags: ['ruins','open','western'] }),
    mkGenerator('frontier-citadel', 'フロンティア砦の防衛線', 'バスティオンが連なる砦都市の内部', frontierCitadel, { normalMixed: 0.45, blockDimMixed: 0.55, tags: ['fort','town','western'] }),
    mkGenerator('hoodoo-needles', 'フードゥー石林', '尖塔のような岩柱が森のように連なる', hoodooNeedles, { normalMixed: 0.35, blockDimMixed: 0.65, tags: ['hoodoo','maze','western'] }),
    mkGenerator('wagon-yard-sprawl', 'ワゴンヤード迷宮', '倉庫と荷馬車が雑多に並ぶ物流拠点', wagonYardSprawl, { normalMixed: 0.55, blockDimMixed: 0.45, tags: ['depot','town','western'] }),
    mkGenerator('silver-creek-crossing', 'シルバークリーク渡河', '小川と桟橋が複雑に交差する渓谷道', silverCreekCrossing, { normalMixed: 0.5, blockDimMixed: 0.5, tags: ['creek','bridge','western'] }),
    mkGenerator('painted-switchbacks', '彩雲のスイッチバック', '色彩豊かな崖面を折り返しながら進む', paintedSwitchbacks, { normalMixed: 0.4, blockDimMixed: 0.6, tags: ['cliff','switchback','western'] }),
    mkGenerator('coyote-den-network', 'コヨーテの巣穴網', '獣道と巣穴が複雑に絡み合う地下網', coyoteDenNetwork, { normalMixed: 0.3, blockDimMixed: 0.7, tags: ['burrow','maze','western'] }),
  ];

  function mkBossFloors(depths){
    return depths.slice();
  }

  const blocks = {
    blocks1: [
      { key: 'western_story_01', name: 'Western Story I', level: -6, size: -1, depth: 0, chest: 'less', type: 'frontier-main-street', bossFloors: mkBossFloors([5]) },
      { key: 'western_story_02', name: 'Western Story II', level: -3, size: 0, depth: 0, chest: 'normal', type: 'frontier-main-street', bossFloors: mkBossFloors([5,10]) },
      { key: 'western_story_03', name: 'Western Story III', level: 0, size: 1, depth: 1, chest: 'more', type: 'frontier-main-street', bossFloors: mkBossFloors([10]) },
      { key: 'western_story_04', name: 'Western Story IV', level: 3, size: 1, depth: 1, chest: 'normal', type: 'frontier-main-street', bossFloors: mkBossFloors([15]) },
      { key: 'western_story_05', name: 'Western Story V', level: 6, size: 1, depth: 2, chest: 'less', type: 'frontier-main-street', bossFloors: mkBossFloors([20]) },
      { key: 'mesa_border_01', name: 'Mesa Border I', level: -4, size: 0, depth: 1, chest: 'normal', type: 'canyon-meanders', bossFloors: mkBossFloors([6]) },
      { key: 'mesa_border_02', name: 'Mesa Border II', level: 2, size: 0, depth: 1, chest: 'normal', type: 'canyon-meanders', bossFloors: mkBossFloors([12]) },
      { key: 'mesa_border_03', name: 'Mesa Border III', level: 8, size: 1, depth: 2, chest: 'more', type: 'canyon-meanders', bossFloors: mkBossFloors([18]) },
      { key: 'mesa_border_04', name: 'Mesa Border IV', level: 14, size: 1, depth: 2, chest: 'less', type: 'canyon-meanders', bossFloors: mkBossFloors([24]) },
      { key: 'ghost_hollow_01', name: 'Ghost Hollow I', level: -2, size: 0, depth: 1, chest: 'normal', type: 'ghost-town-hollows', bossFloors: mkBossFloors([7]) },
      { key: 'ghost_hollow_02', name: 'Ghost Hollow II', level: 4, size: 1, depth: 1, chest: 'less', type: 'ghost-town-hollows', bossFloors: mkBossFloors([14]) },
      { key: 'ghost_hollow_03', name: 'Ghost Hollow III', level: 10, size: 1, depth: 2, chest: 'more', type: 'ghost-town-hollows', bossFloors: mkBossFloors([21]) },
      { key: 'badlands_trail_01', name: 'Badlands Trail I', level: -3, size: 0, depth: 0, chest: 'normal', type: 'sunset-badlands', bossFloors: mkBossFloors([6]) },
      { key: 'badlands_trail_02', name: 'Badlands Trail II', level: 3, size: 1, depth: 1, chest: 'less', type: 'sunset-badlands', bossFloors: mkBossFloors([12]) },
      { key: 'badlands_trail_03', name: 'Badlands Trail III', level: 9, size: 1, depth: 1, chest: 'normal', type: 'sunset-badlands', bossFloors: mkBossFloors([18]) },
      { key: 'sagebrush_circle_01', name: 'Sagebrush Circle I', level: 1, size: 0, depth: 1, chest: 'normal', type: 'sagebrush-basin', bossFloors: mkBossFloors([8]) },
      { key: 'sagebrush_circle_02', name: 'Sagebrush Circle II', level: 7, size: 1, depth: 1, chest: 'more', type: 'sagebrush-basin', bossFloors: mkBossFloors([16]) },
      { key: 'thunderfront_01', name: 'Thunderfront I', level: 5, size: 1, depth: 1, chest: 'normal', type: 'thunder-mesa', bossFloors: mkBossFloors([10]) },
      { key: 'citadel_patrol_01', name: 'Citadel Patrol I', level: 2, size: 0, depth: 1, chest: 'normal', type: 'frontier-citadel', bossFloors: mkBossFloors([9]) },
      { key: 'hoodoo_column_01', name: 'Hoodoo Columns I', level: -1, size: 0, depth: 1, chest: 'less', type: 'hoodoo-needles', bossFloors: mkBossFloors([7]) },
      { key: 'wagon_depot_01', name: 'Wagon Depot I', level: 4, size: 1, depth: 1, chest: 'normal', type: 'wagon-yard-sprawl', bossFloors: mkBossFloors([12]) },
      { key: 'silver_crossing_01', name: 'Silver Crossing I', level: 1, size: 0, depth: 1, chest: 'more', type: 'silver-creek-crossing', bossFloors: mkBossFloors([11]) },
      { key: 'painted_switchbacks_01', name: 'Painted Switchbacks I', level: 6, size: 1, depth: 1, chest: 'less', type: 'painted-switchbacks', bossFloors: mkBossFloors([13]) },
      { key: 'coyote_den_01', name: 'Coyote Den I', level: -2, size: 0, depth: 1, chest: 'normal', type: 'coyote-den-network', bossFloors: mkBossFloors([6]) },
    ],
    blocks2: [
      { key: 'railspur_01', name: 'Railspur I', level: 0, size: 1, depth: 0, chest: 'normal', type: 'railway-warrens' },
      { key: 'railspur_02', name: 'Railspur II', level: 5, size: 1, depth: 1, chest: 'more', type: 'railway-warrens' },
      { key: 'railspur_03', name: 'Railspur III', level: 10, size: 2, depth: 1, chest: 'less', type: 'railway-warrens' },
      { key: 'railspur_04', name: 'Railspur IV', level: 15, size: 2, depth: 2, chest: 'normal', type: 'railway-warrens' },
      { key: 'railspur_05', name: 'Railspur V', level: 20, size: 3, depth: 2, chest: 'more', type: 'railway-warrens' },
      { key: 'stampede_pass_01', name: 'Stampede Pass I', level: -1, size: 0, depth: 1, chest: 'normal', type: 'stampede-ridge' },
      { key: 'stampede_pass_02', name: 'Stampede Pass II', level: 6, size: 1, depth: 1, chest: 'less', type: 'stampede-ridge' },
      { key: 'stampede_pass_03', name: 'Stampede Pass III', level: 12, size: 1, depth: 2, chest: 'normal', type: 'stampede-ridge' },
      { key: 'stampede_pass_04', name: 'Stampede Pass IV', level: 18, size: 2, depth: 2, chest: 'more', type: 'stampede-ridge' },
      { key: 'saltway_01', name: 'Saltway I', level: 2, size: 0, depth: 1, chest: 'normal', type: 'salt-flat-ruins' },
      { key: 'saltway_02', name: 'Saltway II', level: 8, size: 1, depth: 1, chest: 'less', type: 'salt-flat-ruins' },
      { key: 'saltway_03', name: 'Saltway III', level: 16, size: 1, depth: 2, chest: 'normal', type: 'salt-flat-ruins' },
      { key: 'saltway_04', name: 'Saltway IV', level: 24, size: 2, depth: 2, chest: 'more', type: 'salt-flat-ruins' },
      { key: 'badlands_trail_04', name: 'Badlands Trail IV', level: 18, size: 2, depth: 2, chest: 'more', type: 'sunset-badlands' },
      { key: 'sagebrush_circle_03', name: 'Sagebrush Circle III', level: 14, size: 1, depth: 2, chest: 'normal', type: 'sagebrush-basin' },
      { key: 'thunderfront_02', name: 'Thunderfront II', level: 20, size: 2, depth: 2, chest: 'less', type: 'thunder-mesa' },
      { key: 'citadel_patrol_02', name: 'Citadel Patrol II', level: 12, size: 1, depth: 2, chest: 'normal', type: 'frontier-citadel' },
      { key: 'hoodoo_column_02', name: 'Hoodoo Columns II', level: 8, size: 1, depth: 2, chest: 'less', type: 'hoodoo-needles' },
      { key: 'wagon_depot_02', name: 'Wagon Depot II', level: 15, size: 2, depth: 2, chest: 'more', type: 'wagon-yard-sprawl' },
      { key: 'silver_crossing_02', name: 'Silver Crossing II', level: 10, size: 1, depth: 2, chest: 'normal', type: 'silver-creek-crossing' },
      { key: 'painted_switchbacks_02', name: 'Painted Switchbacks II', level: 18, size: 2, depth: 2, chest: 'more', type: 'painted-switchbacks' },
      { key: 'coyote_den_02', name: 'Coyote Den II', level: 6, size: 1, depth: 2, chest: 'less', type: 'coyote-den-network' },
    ],
    blocks3: [
      { key: 'frontier_relic_01', name: 'Frontier Relic I', level: 4, size: 1, depth: 2, chest: 'more', type: 'ghost-town-hollows', bossFloors: mkBossFloors([10]) },
      { key: 'frontier_relic_02', name: 'Frontier Relic II', level: 11, size: 1, depth: 2, chest: 'normal', type: 'canyon-meanders', bossFloors: mkBossFloors([15]) },
      { key: 'frontier_relic_03', name: 'Frontier Relic III', level: 18, size: 2, depth: 3, chest: 'less', type: 'railway-warrens', bossFloors: mkBossFloors([20]) },
      { key: 'frontier_relic_04', name: 'Frontier Relic IV', level: 25, size: 2, depth: 3, chest: 'normal', type: 'frontier-main-street', bossFloors: mkBossFloors([25]) },
      { key: 'frontier_relic_05', name: 'Frontier Relic V', level: 30, size: 3, depth: 4, chest: 'more', type: 'salt-flat-ruins', bossFloors: mkBossFloors([30]) },
      { key: 'sheriff_legacy_01', name: 'Sheriff Legacy I', level: 7, size: 1, depth: 2, chest: 'normal', type: 'frontier-main-street', bossFloors: mkBossFloors([12]) },
      { key: 'sheriff_legacy_02', name: 'Sheriff Legacy II', level: 13, size: 1, depth: 3, chest: 'less', type: 'ghost-town-hollows', bossFloors: mkBossFloors([18]) },
      { key: 'sheriff_legacy_03', name: 'Sheriff Legacy III', level: 22, size: 2, depth: 3, chest: 'normal', type: 'stampede-ridge', bossFloors: mkBossFloors([22,28]) },
      { key: 'sheriff_legacy_04', name: 'Sheriff Legacy IV', level: 28, size: 2, depth: 4, chest: 'more', type: 'canyon-meanders', bossFloors: mkBossFloors([26,32]) },
      { key: 'badlands_legend_01', name: 'Badlands Legend I', level: 26, size: 2, depth: 3, chest: 'normal', type: 'sunset-badlands', bossFloors: mkBossFloors([24,30]) },
      { key: 'sagebrush_legacy_01', name: 'Sagebrush Legacy I', level: 32, size: 3, depth: 4, chest: 'more', type: 'sagebrush-basin', bossFloors: mkBossFloors([32]) },
      { key: 'thunderfront_legend', name: 'Thunderfront Legend', level: 34, size: 3, depth: 4, chest: 'more', type: 'thunder-mesa', bossFloors: mkBossFloors([34]) },
      { key: 'citadel_patrol_03', name: 'Citadel Patrol III', level: 24, size: 2, depth: 3, chest: 'normal', type: 'frontier-citadel', bossFloors: mkBossFloors([24,30]) },
      { key: 'hoodoo_column_03', name: 'Hoodoo Columns III', level: 20, size: 2, depth: 3, chest: 'less', type: 'hoodoo-needles', bossFloors: mkBossFloors([22,28]) },
      { key: 'wagon_depot_03', name: 'Wagon Depot III', level: 27, size: 2, depth: 3, chest: 'more', type: 'wagon-yard-sprawl', bossFloors: mkBossFloors([26,32]) },
      { key: 'silver_crossing_03', name: 'Silver Crossing III', level: 22, size: 2, depth: 3, chest: 'normal', type: 'silver-creek-crossing', bossFloors: mkBossFloors([22,30]) },
      { key: 'painted_switchbacks_03', name: 'Painted Switchbacks III', level: 29, size: 3, depth: 4, chest: 'more', type: 'painted-switchbacks', bossFloors: mkBossFloors([28,34]) },
      { key: 'coyote_den_03', name: 'Coyote Den III', level: 18, size: 2, depth: 3, chest: 'normal', type: 'coyote-den-network', bossFloors: mkBossFloors([20,26]) },
    ]
  };

  window.registerDungeonAddon({
    id: ADDON_ID,
    name: ADDON_NAME,
    version: VERSION,
    blocks,
    generators,
  });
})();

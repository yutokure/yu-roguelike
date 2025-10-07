// Addon: Visceral Crime Scene Pack - grotesque organic horror inspired by anatomy and forensic nightmares
(function(){
  const PACK_ID = 'visceral_crimescene_pack';
  const PACK_NAME = 'Visceral Crime Scene Pack';
  const PACK_VERSION = '2.0.0';

  function clamp(v, min, max){
    return v < min ? min : (v > max ? max : v);
  }

  function lerp(a, b, t){
    return a + (b - a) * t;
  }

  function mixColor(a, b, t){
    const ta = clamp(t, 0, 1);
    const pa = parseInt(a.slice(1), 16);
    const pb = parseInt(b.slice(1), 16);
    const ra = (pa >> 16) & 0xff, ga = (pa >> 8) & 0xff, ba = pa & 0xff;
    const rb = (pb >> 16) & 0xff, gb = (pb >> 8) & 0xff, bb = pb & 0xff;
    const r = Math.round(lerp(ra, rb, ta));
    const g = Math.round(lerp(ga, gb, ta));
    const blue = Math.round(lerp(ba, bb, ta));
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${blue.toString(16).padStart(2,'0')}`;
  }

  function fillWithWalls(ctx){
    const { width: W, height: H, map } = ctx;
    const clearer = ctx.clearTileMeta || (() => {});
    for(let y = 0; y < H; y++){
      for(let x = 0; x < W; x++){
        map[y][x] = 1;
        clearer(x, y);
      }
    }
  }

  function carveDisk(ctx, cx, cy, radius, opts = {}){
    const { width: W, height: H } = ctx;
    const rng = opts.random || ctx.random || Math.random;
    const jitter = opts.jitter || 0;
    const minX = Math.max(1, Math.floor(cx - radius - jitter - 2));
    const maxX = Math.min(W - 2, Math.ceil(cx + radius + jitter + 2));
    const minY = Math.max(1, Math.floor(cy - radius - jitter - 2));
    const maxY = Math.min(H - 2, Math.ceil(cy + radius + jitter + 2));
    for(let y = minY; y <= maxY; y++){
      for(let x = minX; x <= maxX; x++){
        const dist = Math.hypot(x - cx, y - cy);
        const wobble = jitter ? (rng() - 0.5) * jitter : 0;
        if(dist <= radius + wobble){
          ctx.set(x, y, 0);
          if(opts.floorColor){
            const color = typeof opts.floorColor === 'function'
              ? opts.floorColor(x, y, dist, radius, rng)
              : opts.floorColor;
            if(color) ctx.setFloorColor(x, y, color);
          }
          if(opts.onCarve) opts.onCarve(x, y, dist, radius, rng);
        }
      }
    }
  }

  function carveRect(ctx, x0, y0, x1, y1, opts = {}){
    const minX = clamp(Math.min(x0, x1), 1, ctx.width - 2);
    const maxX = clamp(Math.max(x0, x1), 1, ctx.width - 2);
    const minY = clamp(Math.min(y0, y1), 1, ctx.height - 2);
    const maxY = clamp(Math.max(y0, y1), 1, ctx.height - 2);
    const rng = opts.random || ctx.random || Math.random;
    for(let y = minY; y <= maxY; y++){
      for(let x = minX; x <= maxX; x++){
        ctx.set(x, y, 0);
        if(opts.floorColor){
          const color = typeof opts.floorColor === 'function'
            ? opts.floorColor(x, y, 0, 0, rng)
            : opts.floorColor;
          if(color) ctx.setFloorColor(x, y, color);
        }
        if(opts.onCarve) opts.onCarve(x, y, 0, 0, rng);
      }
    }
  }

  function carveLine(ctx, x0, y0, x1, y1, width = 1, opts = {}){
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    if(steps === 0){
      carveDisk(ctx, x0, y0, width, opts);
      return;
    }
    for(let i = 0; i <= steps; i++){
      const t = i / steps;
      const x = Math.round(lerp(x0, x1, t));
      const y = Math.round(lerp(y0, y1, t));
      carveDisk(ctx, x, y, width, opts);
    }
  }

  function paintWalls(ctx, painter){
    const { width: W, height: H, get } = ctx;
    for(let y = 0; y < H; y++){
      for(let x = 0; x < W; x++){
        if(get(x, y) === 1){
          const color = painter(x, y);
          if(color) ctx.setWallColor(x, y, color);
        }
      }
    }
  }

  function scatterFloorType(ctx, type, chance, predicate){
    const rng = ctx.random || Math.random;
    const { width: W, height: H } = ctx;
    for(let y = 1; y < H - 1; y++){
      for(let x = 1; x < W - 1; x++){
        if(ctx.get(x, y) === 0 && rng() < chance && (!predicate || predicate(x, y))){
          ctx.setFloorType(x, y, type);
        }
      }
    }
  }

  function visceralChambersAlgorithm(ctx){
    fillWithWalls(ctx);
    const rng = ctx.random || Math.random;
    const W = ctx.width, H = ctx.height;
    const cx = Math.floor(W / 2), cy = Math.floor(H / 2);
    const lobes = 6 + Math.floor(rng() * 3);
    const nodes = [];
    for(let i = 0; i < lobes; i++){
      const angle = (Math.PI * 2 * i) / lobes + rng() * 0.45;
      const dist = Math.min(W, H) * (0.18 + rng() * 0.22);
      const nx = clamp(Math.round(cx + Math.cos(angle) * dist), 3, W - 4);
      const ny = clamp(Math.round(cy + Math.sin(angle) * dist), 3, H - 4);
      const radius = 3 + Math.floor(rng() * 5);
      nodes.push({ x: nx, y: ny });
      carveDisk(ctx, nx, ny, radius + 1, {
        jitter: 1.4,
        floorColor: (x, y, distLocal, maxR, randomFn) => {
          const t = clamp(1 - distLocal / (maxR + 0.001) + (randomFn() - 0.5) * 0.25, 0, 1);
          return mixColor('#2b0205', '#ff6b6b', t);
        },
        onCarve: (x, y, distLocal, maxR, randomFn) => {
          if(distLocal < maxR * 0.4 && randomFn() < 0.18){
            ctx.setFloorType(x, y, 'poison');
          }
        }
      });
    }
    nodes.forEach((node, idx) => {
      const next = nodes[(idx + 1) % nodes.length];
      carveLine(ctx, node.x, node.y, next.x, next.y, 2, {
        floorColor: (x, y, distLocal, maxR, randomFn) => {
          const d = Math.hypot(x - cx, y - cy) / Math.max(1, Math.min(W, H) / 2);
          const t = clamp(1 - d + (randomFn() - 0.5) * 0.15, 0, 1);
          return mixColor('#3b0609', '#facc15', t);
        },
        onCarve: (x, y, distLocal, maxR, randomFn) => {
          if(randomFn() < 0.1) ctx.setFloorType(x, y, 'poison');
        }
      });
    });
    carveDisk(ctx, cx, cy, 4, {
      floorColor: (x, y, distLocal, maxR) => {
        const t = clamp(distLocal / (maxR + 0.001), 0, 1);
        return mixColor('#520611', '#fde68a', t);
      },
      onCarve: (x, y, distLocal, maxR, randomFn) => {
        if(randomFn() < 0.2) ctx.setFloorType(x, y, 'bomb');
      }
    });
    paintWalls(ctx, (x, y) => {
      const dist = Math.hypot(x - cx, y - cy) / Math.max(1, Math.min(W, H) / 2);
      const t = clamp(dist + (rng() - 0.5) * 0.18, 0, 1);
      return mixColor('#140104', '#7f1d1d', t);
    });
    ctx.ensureConnectivity();
  }

  function arterialSprawlAlgorithm(ctx){
    fillWithWalls(ctx);
    const rng = ctx.random || Math.random;
    const W = ctx.width, H = ctx.height;
    const center = { x: Math.floor(W / 2), y: Math.floor(H / 2) };
    carveDisk(ctx, center.x, center.y, 3, {
      floorColor: (x, y, distLocal, maxR) => mixColor('#2d0509', '#f87171', distLocal / Math.max(1, maxR))
    });
    const branchCount = 6 + Math.floor(rng() * 4);
    for(let i = 0; i < branchCount; i++){
      let angle = (Math.PI * 2 * i) / branchCount + rng() * 0.7;
      let x = center.x;
      let y = center.y;
      const length = 38 + Math.floor(rng() * 55);
      for(let step = 0; step < length; step++){
        const ix = clamp(Math.round(x), 2, W - 3);
        const iy = clamp(Math.round(y), 2, H - 3);
        carveDisk(ctx, ix, iy, 2, {
          jitter: 0.6,
          floorColor: (px, py, distLocal, maxR, randomFn) => {
            const swirl = Math.sin(px * 0.25) * Math.cos(py * 0.22);
            const t = clamp(0.55 + swirl * 0.25 + (randomFn() - 0.5) * 0.1, 0, 1);
            return mixColor('#36060a', '#f97316', t);
          },
          onCarve: (px, py, distLocal, maxR, randomFn) => {
            if(randomFn() < 0.12) ctx.setFloorType(px, py, 'bomb');
          }
        });
        if(ix <= 2 || ix >= W - 3 || iy <= 2 || iy >= H - 3) break;
        angle += (rng() - 0.5) * 0.4;
        const speed = 1 + rng() * 0.6;
        x += Math.cos(angle) * speed;
        y += Math.sin(angle) * speed;
      }
    }
    scatterFloorType(ctx, 'poison', 0.06, (x, y) => Math.sin(x * 0.5) * Math.cos(y * 0.5) > 0.3);
    paintWalls(ctx, (x, y) => {
      const t = clamp((Math.sin(x * 0.15) + Math.cos(y * 0.18)) * 0.25 + 0.5, 0, 1);
      return mixColor('#1b0306', '#991b1b', t);
    });
    ctx.ensureConnectivity();
  }

  function necroticWarrensAlgorithm(ctx){
    fillWithWalls(ctx);
    const rng = ctx.random || Math.random;
    const W = ctx.width, H = ctx.height;
    let grid = Array.from({ length: H }, () => Array(W).fill(1));
    for(let y = 1; y < H - 1; y++){
      for(let x = 1; x < W - 1; x++){
        grid[y][x] = rng() < 0.47 ? 0 : 1;
      }
    }
    const offsets = [-1, 0, 1];
    for(let iter = 0; iter < 3; iter++){
      const next = Array.from({ length: H }, () => Array(W).fill(1));
      for(let y = 1; y < H - 1; y++){
        for(let x = 1; x < W - 1; x++){
          let walls = 0;
          offsets.forEach(dy => {
            offsets.forEach(dx => {
              if(dx === 0 && dy === 0) return;
              if(grid[y + dy][x + dx] === 1) walls++;
            });
          });
          if(grid[y][x] === 1){
            next[y][x] = walls >= 4 ? 1 : 0;
          } else {
            next[y][x] = walls >= 6 ? 1 : 0;
          }
        }
      }
      grid = next;
    }
    for(let y = 1; y < H - 1; y++){
      for(let x = 1; x < W - 1; x++){
        if(grid[y][x] === 0){
          ctx.set(x, y, 0);
          const depth = Math.hypot(x - W / 2, y - H / 2) / Math.max(1, Math.min(W, H) / 2);
          const t = clamp(0.65 - depth * 0.4 + (rng() - 0.5) * 0.2, 0, 1);
          ctx.setFloorColor(x, y, mixColor('#2f0610', '#fca5a5', t));
          if(rng() < 0.08) ctx.setFloorType(x, y, 'poison');
        }
      }
    }
    paintWalls(ctx, (x, y) => {
      const bands = Math.sin(x * 0.3) * Math.sin(y * 0.24);
      const t = clamp(0.55 + bands * 0.3, 0, 1);
      return mixColor('#100207', '#6b1f1f', t);
    });
    ctx.ensureConnectivity();
  }

  function clottedCatacombsAlgorithm(ctx){
    fillWithWalls(ctx);
    const rng = ctx.random || Math.random;
    const W = ctx.width, H = ctx.height;
    const cols = 3, rows = 3;
    const rooms = [];
    for(let row = 0; row < rows; row++){
      for(let col = 0; col < cols; col++){
        const roomWidth = 6 + Math.floor(rng() * 5);
        const roomHeight = 5 + Math.floor(rng() * 4);
        const spacingX = W / cols;
        const spacingY = H / rows;
        const cx = Math.round(spacingX * (col + 0.5) + (rng() - 0.5) * 4);
        const cy = Math.round(spacingY * (row + 0.5) + (rng() - 0.5) * 4);
        const minX = clamp(cx - Math.floor(roomWidth / 2), 2, W - roomWidth - 2);
        const minY = clamp(cy - Math.floor(roomHeight / 2), 2, H - roomHeight - 2);
        carveRect(ctx, minX, minY, minX + roomWidth, minY + roomHeight, {
          floorColor: (x, y) => {
            const t = clamp((Math.sin(x * 0.3) + Math.cos(y * 0.25)) * 0.2 + 0.5, 0, 1);
            return mixColor('#310508', '#f87171', t);
          }
        });
        rooms.push({ x: Math.round(cx), y: Math.round(cy) });
      }
    }
    rooms.forEach((room, idx) => {
      const next = rooms[(idx + cols) % rooms.length];
      carveLine(ctx, room.x, room.y, next.x, next.y, 1, {
        jitter: 0.2,
        floorColor: (x, y, distLocal, maxR, randomFn) => {
          const t = clamp(Math.sin(x * 0.4) * 0.3 + 0.5 + (randomFn() - 0.5) * 0.15, 0, 1);
          return mixColor('#3f070c', '#f97316', t);
        },
        onCarve: (x, y, distLocal, maxR, randomFn) => {
          if(randomFn() < 0.1) ctx.setFloorType(x, y, 'bomb');
        }
      });
      const lateral = rooms[(idx + 1) % rooms.length];
      carveLine(ctx, room.x, room.y, lateral.x, lateral.y, 1, {
        jitter: 0.1,
        floorColor: '#4a0a0e'
      });
    });
    scatterFloorType(ctx, 'poison', 0.05, (x, y) => (x + y) % 3 === 0);
    paintWalls(ctx, (x, y) => {
      const gradient = (Math.abs(x - W / 2) + Math.abs(y - H / 2)) / Math.max(1, (W + H) / 2);
      return mixColor('#160205', '#7f1d1d', clamp(gradient, 0, 1));
    });
    ctx.ensureConnectivity();
  }

  function cadaverousLabyrinthAlgorithm(ctx){
    fillWithWalls(ctx);
    const rng = ctx.random || Math.random;
    const W = ctx.width, H = ctx.height;
    const anchors = [];
    for(let i = 0; i < 14; i++){
      anchors.push({
        x: clamp(3 + Math.floor(rng() * (W - 6)), 3, W - 4),
        y: clamp(3 + Math.floor(rng() * (H - 6)), 3, H - 4)
      });
    }
    anchors.forEach(pt => {
      carveDisk(ctx, pt.x, pt.y, 2 + Math.floor(rng() * 2), {
        floorColor: (x, y, distLocal, maxR, randomFn) => {
          const t = clamp(0.4 + (maxR - distLocal) / (maxR + 0.001) * 0.6 + (randomFn() - 0.5) * 0.1, 0, 1);
          return mixColor('#32080d', '#fca5a5', t);
        }
      });
    });
    anchors.forEach((pt, idx) => {
      const target = anchors[(idx + 3) % anchors.length];
      carveLine(ctx, pt.x, pt.y, target.x, target.y, 1, {
        floorColor: (x, y, distLocal, maxR, randomFn) => {
          const pulse = Math.sin((x + y) * 0.3);
          const t = clamp(0.5 + pulse * 0.25 + (randomFn() - 0.5) * 0.1, 0, 1);
          return mixColor('#41060c', '#fb7185', t);
        },
        onCarve: (x, y, distLocal, maxR, randomFn) => {
          if(randomFn() < 0.08) ctx.setFloorType(x, y, 'poison');
        }
      });
    });
    scatterFloorType(ctx, 'bomb', 0.05, () => rng() < 0.5);
    paintWalls(ctx, (x, y) => {
      const diag = Math.sin((x - y) * 0.2) * 0.5 + 0.5;
      return mixColor('#120206', '#5b1010', clamp(diag, 0, 1));
    });
    ctx.ensureConnectivity();
  }

  function surgicalTheatreAlgorithm(ctx){
    fillWithWalls(ctx);
    const rng = ctx.random || Math.random;
    const W = ctx.width, H = ctx.height;
    const cx = Math.floor(W / 2), cy = Math.floor(H / 2);
    const stageRadius = 4;
    carveDisk(ctx, cx, cy, stageRadius, {
      floorColor: (x, y, distLocal, maxR) => mixColor('#4d060c', '#fde68a', distLocal / Math.max(1, maxR)),
      onCarve: (x, y, distLocal, maxR, randomFn) => {
        if(randomFn() < 0.15) ctx.setFloorType(x, y, 'bomb');
      }
    });
    const rings = 2 + Math.floor(rng() * 2);
    for(let r = 1; r <= rings; r++){
      const rad = stageRadius + r * 3;
      carveDisk(ctx, cx, cy, rad, {
        jitter: 0.8,
        floorColor: (x, y, distLocal, maxR, randomFn) => {
          const t = clamp(distLocal / Math.max(1, maxR) + (randomFn() - 0.5) * 0.2, 0, 1);
          return mixColor('#32060a', '#ef4444', t);
        },
        onCarve: (x, y, distLocal, maxR, randomFn) => {
          if(Math.abs(distLocal - maxR) < 1.5 && randomFn() < 0.2){
            ctx.setFloorType(x, y, 'poison');
          }
        }
      });
    }
    const aisles = 6;
    for(let i = 0; i < aisles; i++){
      const angle = (Math.PI * 2 * i) / aisles;
      const ax = Math.round(cx + Math.cos(angle) * (stageRadius + rings * 3 + 1));
      const ay = Math.round(cy + Math.sin(angle) * (stageRadius + rings * 3 + 1));
      carveLine(ctx, cx, cy, ax, ay, 1, {
        floorColor: (x, y, distLocal, maxR) => mixColor('#3a070d', '#fb7185', distLocal / Math.max(1, maxR))
      });
    }
    paintWalls(ctx, (x, y) => {
      const dist = Math.hypot(x - cx, y - cy) / Math.max(1, Math.min(W, H) / 2);
      return mixColor('#140307', '#7f1d1d', clamp(dist, 0, 1));
    });
    ctx.ensureConnectivity();
  }

  function forensicGalleryAlgorithm(ctx){
    fillWithWalls(ctx);
    const rng = ctx.random || Math.random;
    const W = ctx.width, H = ctx.height;
    const galleryCount = 5;
    const rooms = [];
    for(let i = 0; i < galleryCount; i++){
      const width = 5 + Math.floor(rng() * 4);
      const height = 4 + Math.floor(rng() * 3);
      const x = clamp(3 + Math.floor(rng() * (W - width - 6)), 3, W - width - 3);
      const y = clamp(3 + Math.floor(rng() * (H - height - 6)), 3, H - height - 3);
      carveRect(ctx, x, y, x + width, y + height, {
        floorColor: (px, py) => ((px + py) % 2 === 0 ? '#451212' : '#6d1a1a'),
        onCarve: (px, py, distLocal, maxR, randomFn) => {
          if((px + py) % 4 === 0 && randomFn() < 0.2) ctx.setFloorType(px, py, 'poison');
        }
      });
      rooms.push({ x: x + Math.floor(width / 2), y: y + Math.floor(height / 2) });
    }
    for(let i = 0; i < rooms.length - 1; i++){
      carveLine(ctx, rooms[i].x, rooms[i].y, rooms[i + 1].x, rooms[i + 1].y, 1, {
        floorColor: (x, y) => mixColor('#3f080c', '#f87171', Math.abs(Math.sin((x + y) * 0.3)))
      });
    }
    scatterFloorType(ctx, 'bomb', 0.04, () => rng() < 0.6);
    paintWalls(ctx, (x, y) => {
      const t = clamp((Math.sin(x * 0.35) + Math.sin(y * 0.2)) * 0.25 + 0.5, 0, 1);
      return mixColor('#150205', '#5f0f0f', t);
    });
    ctx.ensureConnectivity();
  }

  function coagulatedPitsAlgorithm(ctx){
    fillWithWalls(ctx);
    const rng = ctx.random || Math.random;
    const W = ctx.width, H = ctx.height;
    const mainPath = [];
    let x = clamp(Math.floor(W / 2 + (rng() - 0.5) * 6), 3, W - 4);
    let y = 3;
    mainPath.push({ x, y });
    for(let i = 0; i < H - 8; i++){
      y += 1 + Math.floor(rng() * 2);
      x += Math.floor((rng() - 0.5) * 3);
      x = clamp(x, 3, W - 4);
      y = clamp(y, 3, H - 4);
      mainPath.push({ x, y });
    }
    for(let i = 0; i < mainPath.length - 1; i++){
      const a = mainPath[i], b = mainPath[i + 1];
      carveLine(ctx, a.x, a.y, b.x, b.y, 2, {
        jitter: 0.5,
        floorColor: (px, py, distLocal, maxR, randomFn) => {
          const t = clamp(Math.sin(px * 0.2) * 0.2 + 0.5 + (randomFn() - 0.5) * 0.15, 0, 1);
          return mixColor('#36080d', '#f87171', t);
        },
        onCarve: (px, py, distLocal, maxR, randomFn) => {
          if(randomFn() < 0.12) ctx.setFloorType(px, py, 'poison');
        }
      });
    }
    const pitCount = 12 + Math.floor(rng() * 5);
    for(let i = 0; i < pitCount; i++){
      const pit = mainPath[Math.floor(rng() * mainPath.length)] || mainPath[0];
      const angle = rng() * Math.PI * 2;
      const dist = 3 + rng() * 5;
      const px = clamp(Math.round(pit.x + Math.cos(angle) * dist), 3, W - 4);
      const py = clamp(Math.round(pit.y + Math.sin(angle) * dist), 3, H - 4);
      carveDisk(ctx, px, py, 2 + Math.floor(rng() * 2), {
        jitter: 1,
        floorColor: (x, y, distLocal, maxR, randomFn) => {
          const t = clamp(1 - distLocal / Math.max(1, maxR) + (randomFn() - 0.5) * 0.3, 0, 1);
          return mixColor('#2a0408', '#b91c1c', t);
        },
        onCarve: (x, y) => ctx.setFloorType(x, y, 'bomb')
      });
    }
    paintWalls(ctx, (x, y) => {
      const t = clamp((Math.cos(x * 0.2) + Math.sin(y * 0.18)) * 0.2 + 0.55, 0, 1);
      return mixColor('#120305', '#7f1d1d', t);
    });
    ctx.ensureConnectivity();
  }

  function morgueSilosAlgorithm(ctx){
    fillWithWalls(ctx);
    const rng = ctx.random || Math.random;
    const W = ctx.width, H = ctx.height;
    const siloCount = 4 + Math.floor(rng() * 2);
    const spacing = W / (siloCount + 1);
    const columns = [];
    for(let i = 0; i < siloCount; i++){
      const sx = clamp(Math.round(spacing * (i + 1) + (rng() - 0.5) * 3), 3, W - 4);
      columns.push(sx);
      carveLine(ctx, sx, 3, sx, H - 4, 1, {
        floorColor: (x, y) => mixColor('#3b070d', '#f87171', clamp((y - 3) / (H - 7), 0, 1)),
        onCarve: (x, y, distLocal, maxR, randomFn) => {
          if(randomFn() < 0.08) ctx.setFloorType(x, y, 'poison');
        }
      });
      const podCount = 4 + Math.floor(rng() * 3);
      for(let r = 0; r < podCount; r++){
        const oy = clamp(6 + Math.floor(rng() * (H - 12)), 4, H - 5);
        carveDisk(ctx, sx, oy, 2 + Math.floor(rng() * 2), {
          floorColor: (x, y, distLocal, maxR, randomFn) => {
            const t = clamp(1 - distLocal / Math.max(1, maxR) + (randomFn() - 0.5) * 0.2, 0, 1);
            return mixColor('#28050a', '#fb7185', t);
          }
        });
      }
    }
    for(let i = 0; i < columns.length - 1; i++){
      const ax = columns[i];
      const bx = columns[i + 1];
      const midY = clamp(6 + Math.floor(rng() * (H - 12)), 4, H - 4);
      carveLine(ctx, ax, midY, bx, midY, 1, {
        floorColor: (x, y, distLocal, maxR, randomFn) => {
          const t = clamp(0.45 + Math.sin(y * 0.25) * 0.3 + (randomFn() - 0.5) * 0.1, 0, 1);
          return mixColor('#3a060c', '#f97316', t);
        }
      });
      if(rng() < 0.5){
        const extraY = clamp(midY + (rng() < 0.5 ? -4 : 4), 4, H - 4);
        carveLine(ctx, ax, extraY, bx, extraY, 1, {
          floorColor: '#42060d'
        });
      }
    }
    scatterFloorType(ctx, 'bomb', 0.05, () => rng() < 0.4);
    paintWalls(ctx, (x, y) => {
      const t = clamp((x / Math.max(1, W - 1)) * 0.7 + Math.sin(y * 0.18) * 0.15, 0, 1);
      return mixColor('#110205', '#651616', t);
    });
    ctx.ensureConnectivity();
  }

  function thanatologySanctumAlgorithm(ctx){
    fillWithWalls(ctx);
    const rng = ctx.random || Math.random;
    const W = ctx.width, H = ctx.height;
    const cx = Math.floor(W / 2), cy = Math.floor(H / 2);
    const maxRadius = Math.floor(Math.min(W, H) / 2) - 3;
    for(let radius = 3; radius <= maxRadius; radius += 3){
      carveLine(ctx, cx - radius, cy, cx + radius, cy, 2, {
        floorColor: (x, y, distLocal, maxR, randomFn) => {
          const t = clamp(0.4 + (Math.abs(x - cx) / Math.max(1, radius)) * 0.5 + (randomFn() - 0.5) * 0.1, 0, 1);
          return mixColor('#36060c', '#fcd34d', t);
        },
        onCarve: (x, y, distLocal, maxR, randomFn) => {
          if(randomFn() < 0.1) ctx.setFloorType(x, y, 'bomb');
        }
      });
      carveLine(ctx, cx, cy - radius, cx, cy + radius, 2, {
        floorColor: (x, y, distLocal, maxR, randomFn) => {
          const t = clamp(0.4 + (Math.abs(y - cy) / Math.max(1, radius)) * 0.5 + (randomFn() - 0.5) * 0.1, 0, 1);
          return mixColor('#36060c', '#fcd34d', t);
        },
        onCarve: (x, y, distLocal, maxR, randomFn) => {
          if(randomFn() < 0.1) ctx.setFloorType(x, y, 'poison');
        }
      });
      carveDisk(ctx, cx + radius, cy + radius, 2, { floorColor: '#4a0810' });
      carveDisk(ctx, cx - radius, cy + radius, 2, { floorColor: '#4a0810' });
      carveDisk(ctx, cx + radius, cy - radius, 2, { floorColor: '#4a0810' });
      carveDisk(ctx, cx - radius, cy - radius, 2, { floorColor: '#4a0810' });
    }
    const diagonalReach = maxRadius - 2;
    carveLine(ctx, cx - diagonalReach, cy - diagonalReach, cx + diagonalReach, cy + diagonalReach, 1, {
      floorColor: '#43070d'
    });
    carveLine(ctx, cx - diagonalReach, cy + diagonalReach, cx + diagonalReach, cy - diagonalReach, 1, {
      floorColor: '#43070d'
    });
    carveDisk(ctx, cx, cy, 5, {
      floorColor: (x, y, distLocal, maxR, randomFn) => {
        const t = clamp(distLocal / Math.max(1, maxR) + (randomFn() - 0.5) * 0.2, 0, 1);
        return mixColor('#50070f', '#fde68a', t);
      },
      onCarve: (x, y, distLocal, maxR, randomFn) => {
        if(randomFn() < 0.2) ctx.setFloorType(x, y, 'bomb');
      }
    });
    scatterFloorType(ctx, 'poison', 0.05, (x, y) => ((x + y + cx + cy) % 5) === 0);
    paintWalls(ctx, (x, y) => {
      const dist = Math.hypot(x - cx, y - cy) / Math.max(1, maxRadius);
      const t = clamp(dist + (rng() - 0.5) * 0.15, 0, 1);
      return mixColor('#150205', '#991b1b', t);
    });
    ctx.ensureConnectivity();
  }

  const generators = [
    {
      id: 'visceral-chambers',
      name: '臓腑血溜り回廊',
      nameKey: "dungeon.types.visceral_chambers.name",
      description: '鼓動する肉腔が連結する血の池。拍動する管が冒険者を包囲する。',
      descriptionKey: "dungeon.types.visceral_chambers.description",
      algorithm: visceralChambersAlgorithm,
      mixin: { normalMixed: 0.32, blockDimMixed: 0.45, tags: ['organic','horror','pulse'] }
    },
    {
      id: 'arterial-sprawl',
      name: '動脈樹の腫瘍巣',
      nameKey: "dungeon.types.arterial_sprawl.name",
      description: '奔流する血管が網状に広がり、血栓の巣が点在する粘性ダンジョン。',
      descriptionKey: "dungeon.types.arterial_sprawl.description",
      algorithm: arterialSprawlAlgorithm,
      mixin: { normalMixed: 0.28, blockDimMixed: 0.4, tags: ['organic','network','hazard'] }
    },
    {
      id: 'necrotic-warrens',
      name: '壊死した蠢動坑',
      nameKey: "dungeon.types.necrotic_warrens.name",
      description: '壊死した肉塊が崩落し続ける洞穴。腐臭の靄が立ち込める。',
      descriptionKey: "dungeon.types.necrotic_warrens.description",
      algorithm: necroticWarrensAlgorithm,
      mixin: { normalMixed: 0.36, blockDimMixed: 0.42, tags: ['cavern','decay','maze'] }
    },
    {
      id: 'clotted-catacombs',
      name: '凝血の地下納骨堂',
      nameKey: "dungeon.types.clotted_catacombs.name",
      description: '凝り固まった血塊で形成された部屋と廊下が重層に交わる。',
      descriptionKey: "dungeon.types.clotted_catacombs.description",
      algorithm: clottedCatacombsAlgorithm,
      mixin: { normalMixed: 0.27, blockDimMixed: 0.36, tags: ['catacomb','grid','hazard'] }
    },
    {
      id: 'cadaverous-labyrinth',
      name: '屍迷の検死迷宮',
      nameKey: "dungeon.types.cadaverous_labyrinth.name",
      description: '収容された遺体の袋が通路を侵食し、恐怖の血路が迷走する。',
      descriptionKey: "dungeon.types.cadaverous_labyrinth.description",
      algorithm: cadaverousLabyrinthAlgorithm,
      mixin: { normalMixed: 0.33, blockDimMixed: 0.38, tags: ['maze','organic','ambient'] }
    },
    {
      id: 'surgical-theatre',
      name: '血濡れ手術劇場',
      nameKey: "dungeon.types.surgical_theatre.name",
      description: '円形の観覧席が血の舞台を囲い、焦げた鉄の匂いが漂う。',
      descriptionKey: "dungeon.types.surgical_theatre.description",
      algorithm: surgicalTheatreAlgorithm,
      mixin: { normalMixed: 0.24, blockDimMixed: 0.34, tags: ['arena','ritual','hazard'] }
    },
    {
      id: 'forensic-gallery',
      name: '検死標本ギャラリー',
      nameKey: "dungeon.types.forensic_gallery.name",
      description: '血で封じられた展示室が連なる。標本棚には凍った証拠が煌めく。',
      descriptionKey: "dungeon.types.forensic_gallery.description",
      algorithm: forensicGalleryAlgorithm,
      mixin: { normalMixed: 0.29, blockDimMixed: 0.37, tags: ['gallery','puzzle','organic'] }
    },
    {
      id: 'coagulated-pits',
      name: '血餅の落とし穴群',
      nameKey: "dungeon.types.coagulated_pits.name",
      description: '血餅だまりが底無しの落とし穴となり、噛み締めるように獲物を沈める。',
      descriptionKey: "dungeon.types.coagulated_pits.description",
      algorithm: coagulatedPitsAlgorithm,
      mixin: { normalMixed: 0.31, blockDimMixed: 0.41, tags: ['pit','hazard','organic'] }
    },
    {
      id: 'morgue-silos',
      name: '屍庫垂直筒',
      nameKey: "dungeon.types.morgue_silos.name",
      description: '垂直に伸びる収容筒と搬送路が格子状に組み合わさる冷たい死庫。',
      descriptionKey: "dungeon.types.morgue_silos.description",
      algorithm: morgueSilosAlgorithm,
      mixin: { normalMixed: 0.25, blockDimMixed: 0.33, tags: ['industrial','vertical','horror'] }
    },
    {
      id: 'thanatology-sanctum',
      name: '死生学の聖域',
      nameKey: "dungeon.types.thanatology_sanctum.name",
      description: '死を解析する祭壇が幾重にも広がる幾何学的な血の聖堂。',
      descriptionKey: "dungeon.types.thanatology_sanctum.description",
      algorithm: thanatologySanctumAlgorithm,
      mixin: { normalMixed: 0.22, blockDimMixed: 0.35, tags: ['ritual','sacred','labyrinth'] }
    }
  ];

  const blockBlueprints = [
    {
      generator: 'visceral-chambers',
      variants: [
        { tier: 1, key: 'visceral_gorecell_i', name: '臓膜膿槽 I: 滴り胞室', level: 0, size: 0, depth: 0, chest: 'normal', weight: 1.1 },
        { tier: 1, key: 'visceral_gorecell_ii', name: '臓膜膿槽 II: 拍動腔', level: 6, size: 1, depth: 0, chest: 'more', weight: 0.9 },
        { tier: 2, key: 'visceral_gorecell_reliquary', name: '臓膜膿槽・血栓保管室', level: 12, size: 1, depth: 1, chest: 'normal', weight: 1.0 },
        { tier: 3, key: 'visceral_gorecell_court', name: '臓膜膿槽宮廷', level: 20, size: 1, depth: 2, chest: 'less', bossFloors: [10, 15], weight: 0.8 }
      ]
    },
    {
      generator: 'arterial-sprawl',
      variants: [
        { tier: 1, key: 'arterial_tangle_i', name: '動脈瘤樹 I: 滲出路', level: 4, size: 0, depth: 0, chest: 'normal', weight: 1.0 },
        { tier: 1, key: 'arterial_tangle_ii', name: '動脈瘤樹 II: 血潮回廊', level: 9, size: 1, depth: 0, chest: 'more', weight: 0.95 },
        { tier: 2, key: 'arterial_tangle_spine', name: '動脈瘤樹脊索', level: 14, size: 1, depth: 1, chest: 'normal', weight: 0.9 },
        { tier: 3, key: 'arterial_tangle_nexus', name: '動脈瘤樹の核滞留', level: 22, size: 2, depth: 2, chest: 'less', bossFloors: [12, 18], weight: 0.75 }
      ]
    },
    {
      generator: 'necrotic-warrens',
      variants: [
        { tier: 1, key: 'necrotic_burrow_i', name: '壊死巣穴 I: 黒腐の溝', level: 3, size: 0, depth: 0, chest: 'normal', weight: 1.05 },
        { tier: 1, key: 'necrotic_burrow_ii', name: '壊死巣穴 II: 腐血斜坑', level: 8, size: 1, depth: 0, chest: 'less', weight: 0.9 },
        { tier: 2, key: 'necrotic_burrow_hatchery', name: '壊死巣穴・膿芽窟', level: 13, size: 1, depth: 2, chest: 'normal', weight: 0.85 },
        { tier: 3, key: 'necrotic_burrow_throne', name: '壊死巣穴王座', level: 23, size: 2, depth: 3, chest: 'more', bossFloors: [11, 17], weight: 0.7 }
      ]
    },
    {
      generator: 'clotted-catacombs',
      variants: [
        { tier: 1, key: 'clot_catacomb_i', name: '凝血納骨堂 I: 瘤室', level: 5, size: 0, depth: 0, chest: 'normal', weight: 1.0 },
        { tier: 1, key: 'clot_catacomb_ii', name: '凝血納骨堂 II: 凝滞廊', level: 10, size: 1, depth: 0, chest: 'more', weight: 0.95 },
        { tier: 2, key: 'clot_catacomb_ossuary', name: '凝血納骨堂・血骨庫', level: 16, size: 1, depth: 2, chest: 'less', weight: 0.88 },
        { tier: 3, key: 'clot_catacomb_basilica', name: '凝血納骨堂大聖血', level: 24, size: 2, depth: 3, chest: 'normal', bossFloors: [9, 15, 21], weight: 0.72 }
      ]
    },
    {
      generator: 'cadaverous-labyrinth',
      variants: [
        { tier: 1, key: 'cadaver_labyrinth_i', name: '屍迷宮 I: 包帯回廊', level: 6, size: 0, depth: 0, chest: 'normal', weight: 1.02 },
        { tier: 1, key: 'cadaver_labyrinth_ii', name: '屍迷宮 II: 解剖導線', level: 11, size: 1, depth: 0, chest: 'less', weight: 0.92 },
        { tier: 2, key: 'cadaver_labyrinth_archive', name: '屍迷宮・遺体保管庫', level: 17, size: 1, depth: 2, chest: 'normal', weight: 0.86 },
        { tier: 3, key: 'cadaver_labyrinth_cathedra', name: '屍迷宮血壇', level: 25, size: 2, depth: 3, chest: 'more', bossFloors: [10, 18], weight: 0.74 }
      ]
    },
    {
      generator: 'surgical-theatre',
      variants: [
        { tier: 1, key: 'surgical_theatre_i', name: '血劇場 I: 第一観血席', level: 7, size: 0, depth: 0, chest: 'normal', weight: 0.98 },
        { tier: 1, key: 'surgical_theatre_ii', name: '血劇場 II: 焦痕席', level: 12, size: 1, depth: 0, chest: 'more', weight: 0.9 },
        { tier: 2, key: 'surgical_theatre_gallery', name: '血劇場・解剖観覧廊', level: 18, size: 1, depth: 1, chest: 'normal', weight: 0.85 },
        { tier: 3, key: 'surgical_theatre_sanctum', name: '血劇場術者聖壇', level: 26, size: 2, depth: 2, chest: 'less', bossFloors: [13, 19], weight: 0.7 }
      ]
    },
    {
      generator: 'forensic-gallery',
      variants: [
        { tier: 1, key: 'forensic_vitrine_i', name: '検死標本陳列 I: 凍結棚', level: 5, size: 0, depth: 0, chest: 'normal', weight: 1.05 },
        { tier: 1, key: 'forensic_vitrine_ii', name: '検死標本陳列 II: 血浸室', level: 12, size: 1, depth: 0, chest: 'less', weight: 0.93 },
        { tier: 2, key: 'forensic_vitrine_archive', name: '検死標本保全庫', level: 19, size: 1, depth: 2, chest: 'normal', weight: 0.88 },
        { tier: 3, key: 'forensic_vitrine_court', name: '検死標本審問廷', level: 27, size: 2, depth: 3, chest: 'more', bossFloors: [12, 20], weight: 0.76 }
      ]
    },
    {
      generator: 'coagulated-pits',
      variants: [
        { tier: 1, key: 'coagulated_sink_i', name: '血餅沈溝 I: 粘稠路', level: 4, size: 0, depth: 0, chest: 'normal', weight: 1.1 },
        { tier: 1, key: 'coagulated_sink_ii', name: '血餅沈溝 II: 侵蝕堀', level: 10, size: 1, depth: 0, chest: 'less', weight: 0.96 },
        { tier: 2, key: 'coagulated_sink_well', name: '血餅沈溝・窖壺', level: 16, size: 1, depth: 2, chest: 'normal', weight: 0.9 },
        { tier: 3, key: 'coagulated_sink_maw', name: '血餅沈溝咬孔', level: 24, size: 2, depth: 3, chest: 'less', bossFloors: [11, 17, 23], weight: 0.78 }
      ]
    },
    {
      generator: 'morgue-silos',
      variants: [
        { tier: 1, key: 'morgue_silo_i', name: '屍庫筒 I: 下層搬入口', level: 6, size: 0, depth: 0, chest: 'normal', weight: 0.99 },
        { tier: 1, key: 'morgue_silo_ii', name: '屍庫筒 II: 吊架廊', level: 13, size: 1, depth: 0, chest: 'less', weight: 0.9 },
        { tier: 2, key: 'morgue_silo_stack', name: '屍庫筒・積層架', level: 20, size: 1, depth: 2, chest: 'normal', weight: 0.84 },
        { tier: 3, key: 'morgue_silo_chimney', name: '屍庫筒煙槽', level: 28, size: 2, depth: 3, chest: 'more', bossFloors: [14, 21], weight: 0.72 }
      ]
    },
    {
      generator: 'thanatology-sanctum',
      variants: [
        { tier: 1, key: 'thanatology_nave_i', name: '死生聖堂 I: 血碑廊', level: 8, size: 0, depth: 0, chest: 'normal', weight: 0.96 },
        { tier: 1, key: 'thanatology_nave_ii', name: '死生聖堂 II: 解剖翼', level: 15, size: 1, depth: 0, chest: 'more', weight: 0.88 },
        { tier: 2, key: 'thanatology_nave_sacrarium', name: '死生聖堂・供血室', level: 22, size: 1, depth: 2, chest: 'normal', weight: 0.82 },
        { tier: 3, key: 'thanatology_nave_reliquary', name: '死生聖堂血遺庫', level: 30, size: 2, depth: 3, chest: 'less', bossFloors: [15, 24], weight: 0.7 }
      ]
    }
  ];

  const blocks1 = [];
  const blocks2 = [];
  const blocks3 = [];
  blockBlueprints.forEach(entry => {
    entry.variants.forEach(variant => {
      const block = {
        key: variant.key,
        name: variant.name,
        level: variant.level,
        size: variant.size,
        depth: variant.depth,
        chest: variant.chest,
        type: entry.generator,
        weight: variant.weight
      };
      if(variant.bossFloors) block.bossFloors = variant.bossFloors.slice();
      if(variant.tier === 1) blocks1.push(block);
      else if(variant.tier === 2) blocks2.push(block);
      else blocks3.push(block);
    });
  });

  const dimensions = [
    { key: 'hemorrhage-depths', name: 'ヘモレージ血溜層', baseLevel: 32 },
    { key: 'autopsy-catacombs', name: '検視地下霊廟', baseLevel: 44 },
    { key: 'evidence-vitrines', name: '血染証拠標本界', baseLevel: 52 }
  ];

  const structures = [
    {
      id: 'visceral_autopsy_stage',
      name: '血濡れ解剖台',
      pattern: [
        '#######',
        '#..F..#',
        '#.#.#.#',
        '#..0..#',
        '#.#.#.#',
        '#..F..#',
        '#######'
      ],
      tags: ['ritual','boss','organic'],
      allowRotation: true
    },
    {
      id: 'visceral_evidence_row',
      name: '血証拠標本棚',
      pattern: [
        '#######',
        '#F...F#',
        '#-0-0-#',
        '#F...F#',
        '#######'
      ],
      tags: ['gallery','loot'],
      allowRotation: true
    },
    {
      id: 'visceral_storage_stack',
      name: '屍庫積層筒',
      pattern: [
        '#####',
        '#W.W#',
        '#.0.#',
        '#W.W#',
        '#####'
      ],
      tags: ['industrial','vertical'],
      allowRotation: true
    }
  ];

  window.registerDungeonAddon({
    id: PACK_ID,
    name: PACK_NAME,
    version: PACK_VERSION,
    generators,
    blocks: {
      dimensions,
      blocks1,
      blocks2,
      blocks3
    },
    structures
  });
})();


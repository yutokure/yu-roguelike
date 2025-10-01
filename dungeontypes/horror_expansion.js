// Addon: Haunted Horror Expansion Pack - unsettling biomes and nightmare architecture
(function(){
  function mixColor(a, b, t){
    const pa = parseInt(a.slice(1), 16);
    const pb = parseInt(b.slice(1), 16);
    const ra = (pa >> 16) & 0xff, ga = (pa >> 8) & 0xff, ba = pa & 0xff;
    const rb = (pb >> 16) & 0xff, gb = (pb >> 8) & 0xff, bb = pb & 0xff;
    const r = Math.round(ra + (rb - ra) * t);
    const g = Math.round(ga + (gb - ga) * t);
    const bch = Math.round(ba + (bb - ba) * t);
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${bch.toString(16).padStart(2,'0')}`;
  }

  function clamp(v, min, max){
    return Math.max(min, Math.min(max, v));
  }

  function pick(arr, rng){
    return arr[Math.floor(rng() * arr.length)];
  }

  function bloodVeinCatacombs(ctx){
    const { width: W, height: H, random, set, get, inBounds, setFloorColor, setWallColor, setFloorType, ensureConnectivity } = ctx;
    const center = { x: Math.floor(W / 2), y: Math.floor(H / 2) };
    for(let y = 0; y < H; y++){
      for(let x = 0; x < W; x++){
        set(x, y, 1);
      }
    }

    const walkers = Array.from({ length: 4 }, () => ({
      x: clamp(center.x + Math.floor((random() - 0.5) * W * 0.2), 2, W - 3),
      y: clamp(center.y + Math.floor((random() - 0.5) * H * 0.2), 2, H - 3),
      dir: pick([[1,0],[-1,0],[0,1],[0,-1]], random)
    }));

    const floorSet = new Set();
    const floorList = [];
    const maxSteps = Math.floor(W * H * 1.4);
    for(let step = 0; step < maxSteps; step++){
      walkers.forEach(w => {
        if(random() < 0.22){
          w.dir = pick([[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]], random);
        }
        const nx = clamp(w.x + w.dir[0], 1, W - 2);
        const ny = clamp(w.y + w.dir[1], 1, H - 2);
        w.x = nx; w.y = ny;
        for(let ry = -1; ry <= 1; ry++){
          for(let rx = -1; rx <= 1; rx++){
            const xx = nx + rx;
            const yy = ny + ry;
            if(inBounds(xx, yy) && !(xx === 0 || yy === 0 || xx === W-1 || yy === H-1)){
              set(xx, yy, 0);
              const key = yy * W + xx;
              if(!floorSet.has(key)){
                floorSet.add(key);
                floorList.push({ x: xx, y: yy });
              }
            }
          }
        }
      });
    }

    const maxDist = Math.hypot(center.x, center.y);
    floorList.forEach((tile, idx) => {
      const dist = Math.hypot(tile.x - center.x, tile.y - center.y) / maxDist;
      const pulse = Math.sin((tile.x + tile.y + idx * 0.7) * 0.35) * 0.15 + 0.45;
      const tint = clamp(dist * 0.7 + pulse * 0.3, 0, 1);
      const baseColor = mixColor('#2b0a12', '#7b0415', tint);
      setFloorColor(tile.x, tile.y, baseColor);
      if(random() < 0.09){
        setFloorType(tile.x, tile.y, 'poison');
        setFloorColor(tile.x, tile.y, mixColor('#7b0415', '#c81e3f', random() * 0.6 + 0.3));
      } else if(random() < 0.05){
        setFloorType(tile.x, tile.y, 'bomb');
        setFloorColor(tile.x, tile.y, mixColor('#441212', '#f97316', 0.4));
      }
    });

    for(let i = 0; i < Math.max(4, Math.floor(floorList.length / 90)); i++){
      const tile = floorList[Math.floor(random() * floorList.length)];
      if(!tile) continue;
      const radius = 2 + Math.floor(random() * 4);
      for(let y = tile.y - radius; y <= tile.y + radius; y++){
        for(let x = tile.x - radius; x <= tile.x + radius; x++){
          if(!inBounds(x,y)) continue;
          const dist = Math.hypot(x - tile.x, y - tile.y);
          if(dist <= radius){
            set(x, y, 0);
            const key = y * W + x;
            if(!floorSet.has(key)){
              floorSet.add(key);
              floorList.push({ x, y });
            }
            const glow = clamp(1 - dist / (radius + 0.01), 0, 1);
            setFloorColor(x, y, mixColor('#a10025', '#f43f5e', glow));
            if(glow > 0.6 && random() < 0.3) setFloorType(x, y, 'poison');
          }
        }
      }
    }

    for(let y = 0; y < H; y++){
      for(let x = 0; x < W; x++){
        if(get(x, y) === 1){
          const shade = Math.sin((x * 0.3) + (y * 0.17));
          const depth = clamp(0.35 + shade * 0.2, 0, 1);
          setWallColor(x, y, mixColor('#0b0506', '#2f0b15', depth));
        }
      }
    }

    ensureConnectivity();
  }

  function shatteredManor(ctx){
    const { width: W, height: H, random, set, get, inBounds, setFloorColor, setWallColor, setFloorType, ensureConnectivity } = ctx;
    for(let y = 0; y < H; y++){
      for(let x = 0; x < W; x++){
        set(x, y, 1);
      }
    }

    const rooms = [];
    const roomCount = 7 + Math.floor(random() * 4);
    for(let i = 0; i < roomCount; i++){
      const rw = 5 + Math.floor(random() * 7);
      const rh = 4 + Math.floor(random() * 5);
      const rx = clamp(2 + Math.floor(random() * (W - rw - 4)), 2, W - rw - 3);
      const ry = clamp(2 + Math.floor(random() * (H - rh - 4)), 2, H - rh - 3);
      rooms.push({ x: rx, y: ry, w: rw, h: rh });
      for(let y = ry; y < ry + rh; y++){
        for(let x = rx; x < rx + rw; x++){
          set(x, y, 0);
          const dx = (x - rx) / Math.max(1, rw - 1);
          const dy = (y - ry) / Math.max(1, rh - 1);
          const jitter = (Math.sin(x * 1.1 + y * 0.6) + 1) * 0.25;
          const tint = clamp((dx + dy) * 0.25 + jitter * 0.5, 0, 1);
          setFloorColor(x, y, mixColor('#111928', '#64748b', tint));
          if(random() < 0.04) setFloorType(x, y, 'poison');
        }
      }
    }

    function carveCorridor(ax, ay, bx, by, width){
      let x = ax, y = ay;
      while(x !== bx){
        const dir = x < bx ? 1 : -1;
        x += dir;
        for(let yy = -width; yy <= width; yy++){
          const ny = y + yy;
          if(inBounds(x, ny)){
            set(x, ny, 0);
            const mix = clamp(Math.abs(yy) / (width + 0.01), 0, 1);
            setFloorColor(x, ny, mixColor('#1f2937', '#475569', 1 - mix));
          }
        }
      }
      while(y !== by){
        const dir = y < by ? 1 : -1;
        y += dir;
        for(let xx = -width; xx <= width; xx++){
          const nx = x + xx;
          if(inBounds(nx, y)){
            set(nx, y, 0);
            const mix = clamp(Math.abs(xx) / (width + 0.01), 0, 1);
            setFloorColor(nx, y, mixColor('#1f2937', '#334155', 1 - mix));
          }
        }
      }
    }

    const centers = rooms.map(r => ({ x: Math.floor(r.x + r.w / 2), y: Math.floor(r.y + r.h / 2) }));
    centers.sort((a, b) => a.x - b.x + (a.y - b.y) * 0.2);
    for(let i = 0; i < centers.length - 1; i++){
      const a = centers[i];
      const b = centers[i + 1];
      carveCorridor(a.x, a.y, b.x, b.y, random() < 0.4 ? 2 : 1);
    }

    for(let i = 0; i < Math.max(3, Math.floor(centers.length / 2)); i++){
      const a = pick(centers, random);
      const b = pick(centers, random);
      carveCorridor(a.x, a.y, b.x, b.y, 1);
    }

    for(let y = 0; y < H; y++){
      for(let x = 0; x < W; x++){
        if(get(x, y) === 1){
          const gradient = (Math.sin(x * 0.2) + Math.cos(y * 0.3)) * 0.3 + 0.5;
          setWallColor(x, y, mixColor('#05060b', '#111827', clamp(gradient, 0, 1)));
        }
      }
    }

    ensureConnectivity();
  }

  function midnightCarnival(ctx){
    const { width: W, height: H, random, set, get, inBounds, setFloorColor, setWallColor, setFloorType, ensureConnectivity } = ctx;
    for(let y = 0; y < H; y++){
      for(let x = 0; x < W; x++){
        set(x, y, 1);
      }
    }

    const center = { x: Math.floor(W / 2), y: Math.floor(H / 2) };
    const maxRadius = Math.floor(Math.min(W, H) / 2) - 2;
    const rings = [];
    for(let r = 3; r <= maxRadius; r += 3){
      rings.push(r);
    }

    rings.forEach((radius, idx) => {
      const squish = 0.6 + Math.sin(idx * 0.6) * 0.15;
      for(let t = 0; t < Math.PI * 2; t += 0.05){
        const x = Math.round(center.x + Math.cos(t) * radius);
        const y = Math.round(center.y + Math.sin(t) * radius * squish);
        if(!inBounds(x, y)) continue;
        set(x, y, 0);
        const phase = (idx / rings.length) + (t / (Math.PI * 2));
        setFloorColor(x, y, mixColor('#1f1147', '#7c3aed', phase % 1));
      }
    });

    const spokes = 12;
    for(let i = 0; i < spokes; i++){
      const angle = (Math.PI * 2 * i) / spokes;
      for(let r = 0; r <= maxRadius; r++){
        const x = Math.round(center.x + Math.cos(angle) * r);
        const y = Math.round(center.y + Math.sin(angle) * r * 0.8);
        if(!inBounds(x, y)) break;
        set(x, y, 0);
        const glow = 0.2 + 0.8 * (r / Math.max(1, maxRadius));
        setFloorColor(x, y, mixColor('#0f172a', '#22d3ee', glow));
        if(r > 3 && random() < 0.03){
          setFloorType(x, y, 'bomb');
          setFloorColor(x, y, mixColor('#22d3ee', '#facc15', 0.6));
        }
      }
    }

    for(let y = 1; y < H - 1; y++){
      for(let x = 1; x < W - 1; x++){
        if(get(x, y) === 0){
          let neighbors = 0;
          for(let yy = -1; yy <= 1; yy++){
            for(let xx = -1; xx <= 1; xx++){
              if(xx === 0 && yy === 0) continue;
              if(get(x + xx, y + yy) === 0) neighbors++;
            }
          }
          if(neighbors <= 2 && random() < 0.5){
            setFloorColor(x, y, mixColor('#312e81', '#f472b6', random()));
          }
        }
      }
    }

    for(let y = 0; y < H; y++){
      for(let x = 0; x < W; x++){
        if(get(x, y) === 1){
          const ripple = Math.sin(Math.hypot(x - center.x, y - center.y) * 0.6 + (x + y) * 0.1);
          const tint = clamp(0.4 + ripple * 0.25, 0, 1);
          setWallColor(x, y, mixColor('#05020a', '#1f2933', tint));
        }
      }
    }

    ensureConnectivity();
  }

  function ashenAsylum(ctx){
    const { width: W, height: H, random, set, get, inBounds, setFloorColor, setWallColor, setFloorType, ensureConnectivity } = ctx;
    for(let y = 0; y < H; y++){
      for(let x = 0; x < W; x++){
        set(x, y, 1);
      }
    }

    const blockSize = 6;
    const wards = [];
    for(let gy = 1; gy < H - blockSize; gy += blockSize){
      for(let gx = 1; gx < W - blockSize; gx += blockSize){
        if(random() < 0.75){
          const w = 4 + Math.floor(random() * 4);
          const h = 4 + Math.floor(random() * 4);
          const px = clamp(gx + Math.floor(random() * 2), 1, W - w - 2);
          const py = clamp(gy + Math.floor(random() * 2), 1, H - h - 2);
          wards.push({ x: px, y: py, w, h });
          for(let y = py; y < py + h; y++){
            for(let x = px; x < px + w; x++){
              set(x, y, 0);
              const dx = (x - px) / Math.max(1, w - 1);
              const dy = (y - py) / Math.max(1, h - 1);
              const fade = clamp((dx * dy) * 0.7 + random() * 0.15, 0, 1);
              setFloorColor(x, y, mixColor('#1e293b', '#94a3b8', fade));
              if(random() < 0.06) setFloorType(x, y, 'poison');
            }
          }
        }
      }
    }

    const nodes = wards.map(w => ({ x: Math.floor(w.x + w.w / 2), y: Math.floor(w.y + w.h / 2) }));
    for(let i = 0; i < nodes.length; i++){
      const a = nodes[i];
      const b = nodes[(i + 1) % nodes.length];
      if(!b) continue;
      const mx = Math.min(a.x, b.x);
      const Mx = Math.max(a.x, b.x);
      for(let x = mx; x <= Mx; x++){
        const y = a.y;
        set(x, y, 0);
        setFloorColor(x, y, mixColor('#0f172a', '#475569', random() * 0.5 + 0.25));
      }
      const my = Math.min(a.y, b.y);
      const My = Math.max(a.y, b.y);
      for(let y = my; y <= My; y++){
        const x = b.x;
        set(x, y, 0);
        setFloorColor(x, y, mixColor('#111827', '#1f2937', random() * 0.5 + 0.25));
      }
    }

    for(let y = 0; y < H; y++){
      for(let x = 0; x < W; x++){
        if(get(x, y) === 1){
          const haze = Math.sin((x + y) * 0.21) * 0.2 + 0.5;
          setWallColor(x, y, mixColor('#020617', '#1e293b', clamp(haze, 0, 1)));
        } else if(random() < 0.02){
          setFloorType(x, y, 'bomb');
        }
      }
    }

    ensureConnectivity();
  }

  function wailingMire(ctx){
    const { width: W, height: H, random, set, get, inBounds, setFloorColor, setWallColor, setFloorType, ensureConnectivity } = ctx;
    for(let y = 0; y < H; y++){
      for(let x = 0; x < W; x++){
        set(x, y, 1);
      }
    }

    const startX = Math.floor(W / 2);
    const startY = Math.floor(H / 2);
    const steps = W * H * 1.2;
    let cx = startX, cy = startY;
    for(let i = 0; i < steps; i++){
      set(cx, cy, 0);
      const flood = Math.sin((cx * 0.33) + (cy * 0.41) + i * 0.02) * 0.5 + 0.5;
      setFloorColor(cx, cy, mixColor('#082f49', '#e11d48', flood));
      if(random() < 0.08) setFloorType(cx, cy, 'poison');
      const dir = pick([[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]], random);
      cx = clamp(cx + dir[0], 1, W - 2);
      cy = clamp(cy + dir[1], 1, H - 2);
    }

    const pools = 8 + Math.floor(random() * 6);
    for(let i = 0; i < pools; i++){
      const px = clamp(Math.floor(random() * W), 2, W - 3);
      const py = clamp(Math.floor(random() * H), 2, H - 3);
      const radius = 2 + Math.floor(random() * 5);
      for(let y = py - radius; y <= py + radius; y++){
        for(let x = px - radius; x <= px + radius; x++){
          if(!inBounds(x, y)) continue;
          const dist = Math.hypot(x - px, y - py);
          if(dist <= radius){
            set(x, y, 0);
            const depth = clamp(1 - dist / (radius + 0.01), 0, 1);
            setFloorColor(x, y, mixColor('#111827', '#38bdf8', depth));
            if(depth > 0.7 && random() < 0.4) setFloorType(x, y, 'poison');
          }
        }
      }
    }

    for(let y = 0; y < H; y++){
      for(let x = 0; x < W; x++){
        if(get(x, y) === 1){
          const mist = Math.cos(x * 0.17) * Math.sin(y * 0.19) * 0.3 + 0.4;
          setWallColor(x, y, mixColor('#020617', '#082f49', clamp(mist, 0, 1)));
        }
      }
    }

    ensureConnectivity();
  }

  function bellFoundry(ctx){
    const { width: W, height: H, random, set, get, inBounds, setFloorColor, setWallColor, setFloorType, ensureConnectivity } = ctx;
    for(let y = 0; y < H; y++){
      for(let x = 0; x < W; x++){
        set(x, y, 1);
      }
    }

    const center = { x: Math.floor(W / 2), y: Math.floor(H / 2) };
    const arms = 6 + Math.floor(random() * 4);
    const layers = Math.floor(Math.min(W, H) / 3);
    for(let layer = 0; layer < layers; layer++){
      const radius = 2 + layer;
      for(let t = 0; t < Math.PI * 2; t += Math.PI / 16){
        const x = Math.round(center.x + Math.cos(t) * radius);
        const y = Math.round(center.y + Math.sin(t) * radius);
        if(!inBounds(x, y)) continue;
        set(x, y, 0);
        const tone = clamp(layer / Math.max(1, layers - 1), 0, 1);
        setFloorColor(x, y, mixColor('#1f0a1a', '#f97316', tone));
        if(random() < 0.03) setFloorType(x, y, 'bomb');
      }
    }

    for(let arm = 0; arm < arms; arm++){
      const angle = (Math.PI * 2 * arm) / arms;
      for(let r = 0; r < Math.max(W, H); r++){
        const x = Math.round(center.x + Math.cos(angle) * r);
        const y = Math.round(center.y + Math.sin(angle) * r * 0.85);
        if(!inBounds(x, y)) break;
        set(x, y, 0);
        const t = clamp(r / Math.max(1, Math.max(W, H)), 0, 1);
        setFloorColor(x, y, mixColor('#33111a', '#fb7185', t));
        if(r % 4 === 0) setFloorType(x, y, 'normal');
      }
    }

    for(let y = 0; y < H; y++){
      for(let x = 0; x < W; x++){
        if(get(x, y) === 1){
          const glint = Math.sin((x - center.x) * 0.22) * Math.cos((y - center.y) * 0.17) * 0.3 + 0.5;
          setWallColor(x, y, mixColor('#12050a', '#3f0f1e', clamp(glint, 0, 1)));
        }
      }
    }

    ensureConnectivity();
  }

  function gallowsSpiral(ctx){
    const { width: W, height: H, random, set, get, inBounds, setFloorColor, setWallColor, setFloorType, ensureConnectivity } = ctx;
    for(let y = 0; y < H; y++){
      for(let x = 0; x < W; x++){
        set(x, y, 1);
      }
    }

    const center = { x: Math.floor(W / 2), y: Math.floor(H / 2) };
    let angle = 0;
    let radius = 1;
    const maxRadius = Math.min(center.x, center.y) - 2;
    while(radius < maxRadius){
      const x = Math.round(center.x + Math.cos(angle) * radius);
      const y = Math.round(center.y + Math.sin(angle) * radius);
      if(inBounds(x, y)){
        for(let yy = -1; yy <= 1; yy++){
          for(let xx = -1; xx <= 1; xx++){
            const nx = x + xx;
            const ny = y + yy;
            if(!inBounds(nx, ny)) continue;
            set(nx, ny, 0);
            const dist = Math.hypot(nx - center.x, ny - center.y) / Math.max(1, maxRadius);
            const phase = (angle / (Math.PI * 2)) % 1;
            setFloorColor(nx, ny, mixColor('#120617', '#c026d3', clamp(phase * 0.6 + dist * 0.4, 0, 1)));
            if(random() < 0.05) setFloorType(nx, ny, 'bomb');
          }
        }
      }
      angle += 0.25;
      radius += 0.12;
    }

    for(let i = 0; i < 18; i++){
      const t = i / 18;
      const a = t * Math.PI * 2;
      const r = maxRadius * (0.4 + 0.6 * t);
      const x = Math.round(center.x + Math.cos(a) * r);
      const y = Math.round(center.y + Math.sin(a) * r);
      if(!inBounds(x, y)) continue;
      const hook = 3 + Math.floor(random() * 3);
      for(let h = 0; h < hook; h++){
        const yy = y + h;
        if(!inBounds(x, yy)) break;
        set(x, yy, 0);
        const tint = clamp(1 - h / hook, 0, 1);
        setFloorColor(x, yy, mixColor('#0f172a', '#facc15', tint));
        if(h === hook - 1 && random() < 0.4) setFloorType(x, yy, 'poison');
      }
    }

    for(let y = 0; y < H; y++){
      for(let x = 0; x < W; x++){
        if(get(x, y) === 1){
          const gloom = Math.sin(Math.hypot(x - center.x, y - center.y) * 0.33 + angle) * 0.25 + 0.55;
          setWallColor(x, y, mixColor('#030712', '#1f1b2e', clamp(gloom, 0, 1)));
        }
      }
    }

    ensureConnectivity();
  }

  function phantomHauntedHouse(ctx){
    const { width: W, height: H, random, set, get, inBounds, setFloorColor, setWallColor, setFloorType, ensureConnectivity } = ctx;
    for(let y = 0; y < H; y++){
      for(let x = 0; x < W; x++){
        set(x, y, 1);
      }
    }

    const centralWidth = 3;
    const hallStart = Math.floor(W / 2) - Math.floor(centralWidth / 2);
    for(let y = 1; y < H - 1; y++){
      for(let x = hallStart; x < hallStart + centralWidth; x++){
        if(!inBounds(x, y)) continue;
        set(x, y, 0);
        const ripple = (Math.sin(y * 0.4) + 1) * 0.25;
        setFloorColor(x, y, mixColor('#140c24', '#6d28d9', clamp(ripple, 0, 1)));
        if(random() < 0.05) setFloorType(x, y, 'poison');
      }
    }

    const wings = [];
    for(let gy = 2; gy < H - 6; gy += 5){
      for(let gx = 2; gx < W - 6; gx += 6){
        if(random() < 0.85){
          const w = 4 + Math.floor(random() * 3);
          const h = 3 + Math.floor(random() * 3);
          const x0 = clamp(gx + Math.floor(random() * 2), 1, W - w - 2);
          const y0 = clamp(gy + Math.floor(random() * 2), 1, H - h - 2);
          wings.push({ x: x0, y: y0, w, h });
          for(let y = y0; y < y0 + h; y++){
            for(let x = x0; x < x0 + w; x++){
              set(x, y, 0);
              const fx = (x - x0) / Math.max(1, w - 1);
              const fy = (y - y0) / Math.max(1, h - 1);
              const fade = clamp((fx * 0.5 + fy * 0.5) + random() * 0.2, 0, 1);
              setFloorColor(x, y, mixColor('#1e1033', '#a855f7', fade));
              if(random() < 0.04) setFloorType(x, y, 'bomb');
            }
          }
        }
      }
    }

    wings.forEach(room => {
      const cx = Math.floor(room.x + room.w / 2);
      const cy = Math.floor(room.y + room.h / 2);
      const targetX = hallStart + Math.floor(centralWidth / 2);
      let x = cx;
      while(x !== targetX){
        x += x < targetX ? 1 : -1;
        for(let yy = -1; yy <= 1; yy++){
          const ny = cy + yy;
          if(!inBounds(x, ny)) continue;
          set(x, ny, 0);
          const mix = clamp(1 - Math.abs(yy) * 0.6, 0, 1);
          setFloorColor(x, ny, mixColor('#150b29', '#7c3aed', mix));
        }
      }
      let y = cy;
      while(y !== Math.floor(H / 2)){
        y += y < Math.floor(H / 2) ? 1 : -1;
        for(let xx = -1; xx <= 1; xx++){
          const nx = x + xx;
          if(!inBounds(nx, y)) continue;
          set(nx, y, 0);
          const glow = clamp(1 - Math.abs(xx) * 0.7, 0, 1);
          setFloorColor(nx, y, mixColor('#1a102d', '#9333ea', glow));
        }
      }
    });

    for(let i = 0; i < 6; i++){
      const room = wings[Math.floor(random() * wings.length)];
      if(!room) continue;
      const x = clamp(room.x + 1 + Math.floor(random() * Math.max(1, room.w - 2)), 1, W - 2);
      const y = clamp(room.y + 1 + Math.floor(random() * Math.max(1, room.h - 2)), 1, H - 2);
      const radius = 1 + Math.floor(random() * 2);
      for(let yy = -radius; yy <= radius; yy++){
        for(let xx = -radius; xx <= radius; xx++){
          const nx = x + xx;
          const ny = y + yy;
          if(!inBounds(nx, ny)) continue;
          const dist = Math.hypot(xx, yy);
          if(dist <= radius){
            set(nx, ny, 0);
            const pulse = clamp(1 - dist / (radius + 0.1), 0, 1);
            setFloorColor(nx, ny, mixColor('#2a0f3b', '#c084fc', pulse));
            if(pulse > 0.65 && random() < 0.35) setFloorType(nx, ny, 'poison');
          }
        }
      }
    }

    for(let y = 0; y < H; y++){
      for(let x = 0; x < W; x++){
        if(get(x, y) === 1){
          const flicker = Math.sin((x + y) * 0.27) * 0.2 + 0.6;
          setWallColor(x, y, mixColor('#05020b', '#1f0f31', clamp(flicker, 0, 1)));
        }
      }
    }

    ensureConnectivity();
  }

  function duskGraveyard(ctx){
    const { width: W, height: H, random, set, get, inBounds, setFloorColor, setWallColor, setFloorType, ensureConnectivity } = ctx;
    for(let y = 0; y < H; y++){
      for(let x = 0; x < W; x++){
        set(x, y, 1);
      }
    }

    const paths = [];
    const entryPoints = [
      { x: Math.floor(W / 2), y: 1 },
      { x: 1, y: Math.floor(H / 2) },
      { x: W - 2, y: Math.floor(H / 2) },
      { x: Math.floor(W / 2), y: H - 2 }
    ];
    entryPoints.forEach(pt => {
      let x = pt.x;
      let y = pt.y;
      for(let step = 0; step < Math.max(W, H) * 2; step++){
        if(!inBounds(x, y)) break;
        set(x, y, 0);
        const progress = step / Math.max(1, Math.max(W, H) * 2);
        setFloorColor(x, y, mixColor('#1b112d', '#8b5cf6', progress));
        if(random() < 0.03) setFloorType(x, y, 'poison');
        const dir = random() < 0.5 ? 0 : 1;
        if(dir === 0){
          x += Math.sign(Math.floor(W / 2) - x);
        } else {
          y += Math.sign(Math.floor(H / 2) - y);
        }
        paths.push({ x, y });
        if(x === Math.floor(W / 2) && y === Math.floor(H / 2)) break;
      }
    });

    const clearings = 6 + Math.floor(random() * 5);
    for(let i = 0; i < clearings; i++){
      const cx = clamp(2 + Math.floor(random() * (W - 4)), 2, W - 3);
      const cy = clamp(2 + Math.floor(random() * (H - 4)), 2, H - 3);
      const radius = 2 + Math.floor(random() * 3);
      for(let y = cy - radius; y <= cy + radius; y++){
        for(let x = cx - radius; x <= cx + radius; x++){
          if(!inBounds(x, y)) continue;
          const dist = Math.hypot(x - cx, y - cy);
          if(dist <= radius){
            set(x, y, 0);
            const tint = clamp(1 - dist / (radius + 0.1), 0, 1);
            setFloorColor(x, y, mixColor('#221335', '#6d28d9', tint));
            if(random() < 0.08) setFloorType(x, y, 'bomb');
          }
        }
      }
    }

    for(let i = 0; i < paths.length; i += Math.max(1, Math.floor(paths.length / 12))){
      const base = paths[i];
      if(!base) continue;
      const tombs = 4 + Math.floor(random() * 4);
      for(let t = 0; t < tombs; t++){
        const angle = random() * Math.PI * 2;
        const dist = 2 + Math.floor(random() * 4);
        const tx = Math.round(base.x + Math.cos(angle) * dist);
        const ty = Math.round(base.y + Math.sin(angle) * dist);
        if(!inBounds(tx, ty)) continue;
        set(tx, ty, 0);
        setFloorColor(tx, ty, mixColor('#2a153f', '#a855f7', random()));
        if(random() < 0.4) setFloorType(tx, ty, 'poison');
        for(let yy = -1; yy <= 1; yy++){
          for(let xx = -1; xx <= 1; xx++){
            const nx = tx + xx;
            const ny = ty + yy;
            if(!inBounds(nx, ny) || (xx === 0 && yy === 0)) continue;
            if(get(nx, ny) === 1 && Math.abs(xx) + Math.abs(yy) === 1){
              set(nx, ny, 0);
              setFloorColor(nx, ny, mixColor('#1d122f', '#4c1d95', random() * 0.6 + 0.2));
            }
          }
        }
      }
    }

    for(let y = 0; y < H; y++){
      for(let x = 0; x < W; x++){
        if(get(x, y) === 1){
          const mist = Math.sin((x * 0.21) + (y * 0.18)) * 0.25 + 0.5;
          setWallColor(x, y, mixColor('#080313', '#24113a', clamp(mist, 0, 1)));
        }
      }
    }

    ensureConnectivity();
  }

  const generators = [
    {
      id: 'blood-vein-catacombs',
      name: '血脈の地下納骨堂',
      description: '脈打つ血管のような通路が絡み合う、鉄錆と瘴気の迷宮。',
      dark: true,
      algorithm: bloodVeinCatacombs,
      mixin: { normalMixed: 0.62, blockDimMixed: 0.75, tags: ['horror','organic','maze'] }
    },
    {
      id: 'shattered-manor',
      name: '砕けたゴーストマナー',
      description: '崩壊した邸宅の残響が漂う、冷たい空間と鋭角な廊下。',
      dark: true,
      algorithm: shatteredManor,
      mixin: { normalMixed: 0.48, blockDimMixed: 0.66, tags: ['horror','rooms','trap'] }
    },
    {
      id: 'midnight-carnival',
      name: '真夜中カーニバル跡地',
      description: '歪んだ観覧輪と仮面の笑い声が残る霧の会場。',
      dark: true,
      algorithm: midnightCarnival,
      mixin: { normalMixed: 0.51, blockDimMixed: 0.7, tags: ['horror','festival','ring'] }
    },
    {
      id: 'ashen-asylum',
      name: '灰羽の収容院',
      description: '冷ややかな病棟と格子の廊下が交差する無機質な隔離施設。',
      dark: true,
      algorithm: ashenAsylum,
      mixin: { normalMixed: 0.45, blockDimMixed: 0.63, tags: ['horror','rooms','grid'] }
    },
    {
      id: 'phantom-haunted-house',
      name: '亡霊の大屋敷',
      description: '薄暗い紫の廊下と秘密部屋が連なるお化け屋敷。',
      dark: true,
      algorithm: phantomHauntedHouse,
      mixin: { normalMixed: 0.49, blockDimMixed: 0.65, tags: ['horror','rooms','haunted'] }
    },
    {
      id: 'dusk-graveyard',
      name: '薄暮の墓苑',
      description: '朽ちた墓標と霧の小径が絡む呪われた墓地。',
      dark: true,
      algorithm: duskGraveyard,
      mixin: { normalMixed: 0.53, blockDimMixed: 0.69, tags: ['horror','outdoor','graveyard'] }
    },
    {
      id: 'wailing-mire',
      name: '慟哭の泥溜り',
      description: '水気を帯びた赤い霧が漂う、底無しの沼地迷宮。',
      dark: true,
      algorithm: wailingMire,
      mixin: { normalMixed: 0.58, blockDimMixed: 0.7, tags: ['horror','organic','swamp'] }
    },
    {
      id: 'bell-foundry',
      name: '無鳴鐘の鋳造所',
      description: '血錆に染まった鐘楼と螺旋の足場が続く火葬工房。',
      dark: true,
      algorithm: bellFoundry,
      mixin: { normalMixed: 0.5, blockDimMixed: 0.68, tags: ['horror','industrial','radial'] }
    },
    {
      id: 'gallows-spiral',
      name: '吊環の大回廊',
      description: '吊るされた影と螺旋通路が絡む無限回廊。',
      dark: true,
      algorithm: gallowsSpiral,
      mixin: { normalMixed: 0.55, blockDimMixed: 0.72, tags: ['horror','spiral','vertical'] }
    }
  ];

  function mkBossFloors(depth){
    const floors = [];
    if(depth >= 5) floors.push(5);
    if(depth >= 9) floors.push(9);
    if(depth >= 13) floors.push(13);
    if(depth >= 17) floors.push(17);
    return floors;
  }

  const blocks = {
    dimensions: [
      { key: 'horror_depths', name: 'ホラー深層界', baseLevel: 32 },
      { key: 'scarlet_moon', name: '猩紅の月影界', baseLevel: 44 }
    ],
    blocks1: [
      { key: 'horror_theme_entrance', name: '血霧の門前', level: +6, size: 0, depth: +1, chest: 'less', type: 'blood-vein-catacombs', bossFloors: mkBossFloors(9), weight: 1.3 },
      { key: 'horror_theme_suture', name: '縫合回廊', level: +9, size: -1, depth: +2, chest: 'normal', type: 'blood-vein-catacombs', bossFloors: mkBossFloors(11), weight: 1.1 },
      { key: 'horror_theme_bloodlake', name: '赤沼バシリカ', level: +12, size: +1, depth: +2, chest: 'more', type: 'blood-vein-catacombs', bossFloors: mkBossFloors(14), weight: 1.4 },
      { key: 'horror_theme_manor', name: '幽霊館の奥庭', level: +15, size: 0, depth: +1, chest: 'normal', type: 'shattered-manor', bossFloors: mkBossFloors(12), weight: 1.2 },
      { key: 'horror_theme_chapel', name: '破戒礼拝堂', level: +18, size: +1, depth: +2, chest: 'more', type: 'shattered-manor', bossFloors: mkBossFloors(16), weight: 1.3 },
      { key: 'horror_theme_carnival', name: '月下カーニバル', level: +20, size: +2, depth: +2, chest: 'more', type: 'midnight-carnival', bossFloors: mkBossFloors(18), weight: 1.5 },
      { key: 'horror_theme_voidwheel', name: '虚空観覧輪', level: +24, size: +2, depth: +3, chest: 'less', type: 'midnight-carnival', bossFloors: mkBossFloors(20), weight: 0.9 },
      { key: 'horror_theme_asylum', name: '灰羽の隔離棟', level: +11, size: 0, depth: +1, chest: 'normal', type: 'ashen-asylum', bossFloors: mkBossFloors(12), weight: 1.0 },
      { key: 'horror_theme_haunt', name: '怨霊の回廊館', level: +17, size: +1, depth: +1, chest: 'normal', type: 'phantom-haunted-house', bossFloors: mkBossFloors(15), weight: 1.25 },
      { key: 'horror_theme_mire', name: '泣き淵の沼道', level: +13, size: +1, depth: +2, chest: 'less', type: 'wailing-mire', bossFloors: mkBossFloors(15), weight: 1.2 },
      { key: 'horror_theme_foundry', name: '血錆の鋳場', level: +19, size: +1, depth: +2, chest: 'normal', type: 'bell-foundry', bossFloors: mkBossFloors(18), weight: 1.1 },
      { key: 'horror_theme_graveyard', name: '朽ち墓の夜園', level: +14, size: 0, depth: +2, chest: 'less', type: 'dusk-graveyard', bossFloors: mkBossFloors(13), weight: 1.15 },
      { key: 'horror_theme_gallows', name: '連吊り大回廊', level: +22, size: +2, depth: +3, chest: 'more', type: 'gallows-spiral', bossFloors: mkBossFloors(21), weight: 1.0 }
    ],
    blocks2: [
      { key: 'horror_core_vein', name: '血脈中枢', level: +8, size: +1, depth: +1, chest: 'normal', type: 'blood-vein-catacombs', weight: 1.1 },
      { key: 'horror_core_crypt', name: '骨の心室', level: +11, size: 0, depth: +2, chest: 'less', type: 'blood-vein-catacombs', bossFloors: [9, 13], weight: 1.0 },
      { key: 'horror_core_gallery', name: '歪額の回廊', level: +14, size: +1, depth: +1, chest: 'normal', type: 'shattered-manor', weight: 1.3 },
      { key: 'horror_core_stage', name: '幻影ステージ', level: +17, size: +1, depth: +1, chest: 'more', type: 'midnight-carnival', bossFloors: [10, 15], weight: 1.4 },
      { key: 'horror_core_orbit', name: '月輪の心核', level: +22, size: +2, depth: +2, chest: 'more', type: 'midnight-carnival', weight: 1.2 },
      { key: 'horror_core_asylum', name: '隔離病棟核', level: +16, size: 0, depth: +1, chest: 'less', type: 'ashen-asylum', bossFloors: [12, 16], weight: 0.9 },
      { key: 'horror_core_mire', name: '慟哭沼の眼', level: +18, size: +1, depth: +2, chest: 'normal', type: 'wailing-mire', bossFloors: [13, 17], weight: 1.1 },
      { key: 'horror_core_foundry', name: '沈鐘炉心', level: +23, size: +2, depth: +2, chest: 'more', type: 'bell-foundry', bossFloors: [15, 19], weight: 1.2 },
      { key: 'horror_core_haunt', name: '怨影の心臓', level: +20, size: +1, depth: +1, chest: 'normal', type: 'phantom-haunted-house', bossFloors: [11, 15], weight: 1.05 },
      { key: 'horror_core_graveyard', name: '黄昏墓標核', level: +18, size: 0, depth: +2, chest: 'less', type: 'dusk-graveyard', bossFloors: [10, 14], weight: 1.1 },
      { key: 'horror_core_gallows', name: '吊環螺旋核', level: +26, size: +2, depth: +3, chest: 'less', type: 'gallows-spiral', bossFloors: [17, 21], weight: 0.85 }
    ],
    blocks3: [
      { key: 'horror_relic_fetish', name: '血誓の護符', level: +10, size: 0, depth: +3, chest: 'more', type: 'blood-vein-catacombs', bossFloors: [5, 11], weight: 1.5 },
      { key: 'horror_relic_lantern', name: '嘆きの提灯', level: +15, size: 0, depth: +2, chest: 'normal', type: 'shattered-manor', bossFloors: [9, 13], weight: 1.2 },
      { key: 'horror_relic_mask', name: '笑い哭く仮面', level: +18, size: +1, depth: +3, chest: 'more', type: 'midnight-carnival', bossFloors: [13, 17], weight: 1.4 },
      { key: 'horror_relic_redmoon', name: '赤月の彗核', level: +24, size: +1, depth: +4, chest: 'less', type: 'midnight-carnival', bossFloors: [17, 21], weight: 0.8 },
      { key: 'horror_relic_attic', name: '歪んだ屋根裏箱', level: +12, size: -1, depth: +1, chest: 'normal', type: 'shattered-manor', weight: 1.1 },
      { key: 'horror_relic_feather', name: '灰羽の束縛枷', level: +16, size: 0, depth: +2, chest: 'less', type: 'ashen-asylum', bossFloors: [9, 14], weight: 1.0 },
      { key: 'horror_relic_tear', name: '慟哭の滴瓶', level: +20, size: +1, depth: +3, chest: 'more', type: 'wailing-mire', bossFloors: [11, 16], weight: 1.3 },
      { key: 'horror_relic_bell', name: '静哀の鐘', level: +22, size: 0, depth: +3, chest: 'normal', type: 'bell-foundry', bossFloors: [13, 18], weight: 1.1 },
      { key: 'horror_relic_curtain', name: '幽紫の緞帳', level: +18, size: 0, depth: +3, chest: 'normal', type: 'phantom-haunted-house', bossFloors: [11, 15], weight: 1.2 },
      { key: 'horror_relic_urn', name: '薄暮の葬灰壺', level: +21, size: +1, depth: +3, chest: 'less', type: 'dusk-graveyard', bossFloors: [12, 17], weight: 1.1 },
      { key: 'horror_relic_spiral', name: '螺吊の指輪', level: +26, size: +1, depth: +4, chest: 'less', type: 'gallows-spiral', bossFloors: [15, 21], weight: 0.9 }
    ]
  };

  window.registerDungeonAddon({
    id: 'horror_expansion_pack',
    name: 'Haunted Horror Expansion Pack',
    version: '1.0.0',
    blocks,
    generators
  });
})();

// Addon: ファンタジカルと近未来をテーマにした夢の世界パック (拡張版)
(function(){
  const TWO_PI = Math.PI * 2;
  const HALF_PI = Math.PI / 2;

  function clamp(v, min, max){
    return v < min ? min : (v > max ? max : v);
  }
  function lerp(a, b, t){
    return a + (b - a) * t;
  }
  function easeInOutQuad(t){
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
  function choose(arr, rnd){
    return arr[Math.floor(rnd() * arr.length) % arr.length];
  }
  function weightedChoice(choices, rnd){
    const total = choices.reduce((acc, item) => acc + item.weight, 0);
    let r = rnd() * total;
    for(const item of choices){
      if((r -= item.weight) <= 0){
        return item.value;
      }
    }
    return choices[choices.length - 1].value;
  }
  function scatterNodes(ctx, amount, minDist, padding){
    const nodes = [];
    const minDistSq = (minDist || 0) * (minDist || 0);
    const pad = padding || 1;
    let guard = 0;
    while(nodes.length < amount && guard < amount * 200){
      const x = pad + Math.floor(ctx.random() * (ctx.width - pad * 2));
      const y = pad + Math.floor(ctx.random() * (ctx.height - pad * 2));
      let ok = true;
      for(const n of nodes){
        const dx = n.x - x;
        const dy = n.y - y;
        if(dx*dx + dy*dy < minDistSq){
          ok = false;
          break;
        }
      }
      if(ok){
        nodes.push({ x, y });
      }
      guard++;
    }
    return nodes;
  }
  function ringCarve(ctx, cx, cy, rInner, rOuter, opts){
    const { floorColor, wallColor, floorType, avoidExisting } = opts || {};
    const rOuterSq = rOuter * rOuter;
    const rInnerSq = rInner * rInner;
    for(let y = Math.max(1, cy - rOuter); y <= Math.min(ctx.height - 2, cy + rOuter); y++){
      for(let x = Math.max(1, cx - rOuter); x <= Math.min(ctx.width - 2, cx + rOuter); x++){
        const dx = x - cx;
        const dy = y - cy;
        const distSq = dx * dx + dy * dy;
        if(distSq > rOuterSq || distSq < rInnerSq) continue;
        if(avoidExisting && ctx.get(x, y) === 0) continue;
        ctx.set(x, y, 0);
        if(floorColor) ctx.setFloorColor(x, y, typeof floorColor === 'function' ? floorColor(x, y, distSq) : floorColor);
        if(wallColor) ctx.setWallColor(x, y, wallColor);
        if(floorType) ctx.setFloorType(x, y, typeof floorType === 'function' ? floorType(x, y, distSq) : floorType);
      }
    }
  }
  function carveSpline(ctx, points, thickness, palette, opts){
    const rnd = ctx.random;
    const steps = Math.max(ctx.width * ctx.height / 2, 120);
    const { floorType, jitter } = opts || {};
    for(let i = 0; i <= steps; i++){
      const t = i / steps;
      const omt = 1 - t;
      const x = omt * omt * omt * points[0].x + 3 * omt * omt * t * points[1].x + 3 * omt * t * t * points[2].x + t * t * t * points[3].x;
      const y = omt * omt * omt * points[0].y + 3 * omt * omt * t * points[1].y + 3 * omt * t * t * points[2].y + t * t * t * points[3].y;
      const cx = Math.round(x + (jitter ? (rnd() - 0.5) * jitter : 0));
      const cy = Math.round(y + (jitter ? (rnd() - 0.5) * jitter : 0));
      for(let oy = -thickness; oy <= thickness; oy++){
        for(let ox = -thickness; ox <= thickness; ox++){
          const tx = cx + ox;
          const ty = cy + oy;
          if(!ctx.inBounds(tx, ty)) continue;
          if(Math.abs(ox) + Math.abs(oy) > thickness + (rnd() < 0.4 ? 1 : 0)) continue;
          ctx.set(tx, ty, 0);
          ctx.setFloorColor(tx, ty, choose(palette, rnd));
          if(floorType){
            ctx.setFloorType(tx, ty, typeof floorType === 'function' ? floorType(tx, ty, t) : floorType);
          }
        }
      }
    }
  }
  function radiateSpears(ctx, origin, count, length, palette, opts){
    const rnd = ctx.random;
    const { floorType, typeInterval, setMeta } = opts || {};
    for(let i = 0; i < count; i++){
      const angle = rnd() * TWO_PI;
      let x = origin.x;
      let y = origin.y;
      const dx = Math.cos(angle);
      const dy = Math.sin(angle);
      for(let step = 0; step < length; step++){
        x += dx;
        y += dy;
        const tx = Math.round(x);
        const ty = Math.round(y);
        if(!ctx.inBounds(tx, ty)) break;
        ctx.set(tx, ty, 0);
        ctx.setFloorColor(tx, ty, choose(palette, rnd));
        if(typeInterval && step % typeInterval === 0){
          ctx.setFloorType(tx, ty, choose(['ice','fire','poison','normal'], rnd));
        } else if(floorType){
          ctx.setFloorType(tx, ty, typeof floorType === 'function' ? floorType(tx, ty, step) : floorType);
        }
        if(setMeta && step % 11 === 0){
          ctx.setTileMeta(tx, ty, { spearStep: step });
        }
      }
    }
  }
  function paintWarpedGradient(ctx, colA, colB, opts){
    const { turbulence = 0.8, rotation = 0 } = opts || {};
    const centerX = ctx.width / 2;
    const centerY = ctx.height / 2;
    const rotSin = Math.sin(rotation);
    const rotCos = Math.cos(rotation);
    for(let y = 1; y < ctx.height - 1; y++){
      for(let x = 1; x < ctx.width - 1; x++){
        if(ctx.get(x, y) !== 0) continue;
        const nx = (x - centerX) / centerX;
        const ny = (y - centerY) / centerY;
        const rx = nx * rotCos - ny * rotSin;
        const ry = nx * rotSin + ny * rotCos;
        const wave = Math.sin(rx * 5) + Math.cos(ry * 5);
        const turbulenceTerm = Math.sin((nx * nx + ny * ny) * 14);
        const t = clamp((wave * 0.5 + turbulenceTerm * turbulence * 0.5 + 1) / 2, 0, 1);
        const r = Math.floor(lerp(parseInt(colA.slice(1,3), 16), parseInt(colB.slice(1,3), 16), t));
        const g = Math.floor(lerp(parseInt(colA.slice(3,5), 16), parseInt(colB.slice(3,5), 16), t));
        const b = Math.floor(lerp(parseInt(colA.slice(5,7), 16), parseInt(colB.slice(5,7), 16), t));
        ctx.setFloorColor(x, y, `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`);
      }
    }
  }
  function floodChannel(ctx, start, palette, opts){
    const rnd = ctx.random;
    const { maxDepth = 400, width = 2, floorType } = opts || {};
    const frontier = [start];
    const visited = new Set();
    let depth = 0;
    while(frontier.length && depth < maxDepth){
      const current = frontier.shift();
      const key = `${current.x},${current.y}`;
      if(visited.has(key)) continue;
      visited.add(key);
      for(let oy = -width; oy <= width; oy++){
        for(let ox = -width; ox <= width; ox++){
          const tx = current.x + ox;
          const ty = current.y + oy;
          if(!ctx.inBounds(tx, ty)) continue;
          ctx.set(tx, ty, 0);
          ctx.setFloorColor(tx, ty, choose(palette, rnd));
          if(floorType){
            ctx.setFloorType(tx, ty, typeof floorType === 'function' ? floorType(tx, ty, depth) : floorType);
          }
        }
      }
      const dirs = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 }
      ];
      for(const dir of dirs){
        const nx = current.x + dir.x * (rnd() < 0.6 ? 1 : 2);
        const ny = current.y + dir.y * (rnd() < 0.6 ? 1 : 2);
        if(!ctx.inBounds(nx, ny)) continue;
        if(rnd() < 0.75){
          frontier.push({ x: nx, y: ny });
        }
      }
      depth++;
    }
  }
  function carveVoronoi(ctx, seeds, palette, opts){
    const { floorType, inset = 0 } = opts || {};
    for(let y = inset; y < ctx.height - inset; y++){
      for(let x = inset; x < ctx.width - inset; x++){
        let bestSeed = null;
        let bestDist = Infinity;
        for(const seed of seeds){
          const dx = seed.x - x;
          const dy = seed.y - y;
          const dist = dx*dx + dy*dy;
          if(dist < bestDist){
            bestDist = dist;
            bestSeed = seed;
          }
        }
        if(bestSeed){
          ctx.set(x, y, 0);
          ctx.setFloorColor(x, y, palette[bestSeed.paletteIndex % palette.length]);
          if(floorType){
            ctx.setFloorType(x, y, typeof floorType === 'function' ? floorType(x, y, bestSeed) : floorType);
          }
        }
      }
    }
  }
  function applyCheckerHighlights(ctx, palette, step){
    for(let y = 1; y < ctx.height - 1; y++){
      for(let x = 1; x < ctx.width - 1; x++){
        if(ctx.get(x, y) !== 0) continue;
        if(((x + y) % step) === 0){
          ctx.setFloorColor(x, y, palette[(x + y) % palette.length]);
        }
      }
    }
  }
  function drawGlyph(ctx, glyph, x, y, opts){
    const { floorColor = '#ffffff', wallColor, floorType } = opts || {};
    for(let gy = 0; gy < glyph.length; gy++){
      for(let gx = 0; gx < glyph[gy].length; gx++){
        const char = glyph[gy][gx];
        const tx = x + gx;
        const ty = y + gy;
        if(!ctx.inBounds(tx, ty)) continue;
        if(char === '0'){
          ctx.set(tx, ty, 0);
          ctx.setFloorColor(tx, ty, floorColor);
          if(floorType) ctx.setFloorType(tx, ty, floorType);
        } else if(char === '#'){
          ctx.set(tx, ty, 1);
          if(wallColor) ctx.setWallColor(tx, ty, wallColor);
        }
      }
    }
  }
  function connectNodes(ctx, nodes, palette, opts){
    const rnd = ctx.random;
    const { thickness = 1, floorType } = opts || {};
    for(let i = 0; i < nodes.length; i++){
      const a = nodes[i];
      const b = nodes[(i + 1) % nodes.length];
      const path = ctx.aStar(a, b, { allowDiagonals: true, heuristic: 'octile' });
      if(!path) continue;
      ctx.carvePath(path, thickness);
      for(const tile of path){
        ctx.setFloorColor(tile.x, tile.y, choose(palette, rnd));
        if(floorType){
          ctx.setFloorType(tile.x, tile.y, typeof floorType === 'function' ? floorType(tile, a, b) : floorType);
        }
      }
    }
  }
  function createFlowField(width, height){
    const field = new Array(width * height).fill(0).map(() => ({ dx: 0, dy: 0 }));
    const sample = (x, y) => {
      const seed = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      return seed - Math.floor(seed);
    };
    for(let y = 0; y < height; y++){
      for(let x = 0; x < width; x++){
        const index = x + y * width;
        const angle = sample(x, y) * TWO_PI;
        field[index].dx = Math.cos(angle);
        field[index].dy = Math.sin(angle);
      }
    }
    return field;
  }
  function followFlowField(ctx, field, iterations, palette, opts){
    const rnd = ctx.random;
    const { thickness = 1, floorType } = opts || {};
    for(let i = 0; i < iterations; i++){
      let x = Math.floor(rnd() * (ctx.width - 2)) + 1;
      let y = Math.floor(rnd() * (ctx.height - 2)) + 1;
      for(let steps = 0; steps < 180; steps++){
        const idx = x + y * ctx.width;
        const dir = field[idx];
        if(!dir) break;
        ctx.set(x, y, 0);
        ctx.setFloorColor(x, y, choose(palette, rnd));
        if(floorType){
          ctx.setFloorType(x, y, typeof floorType === 'function' ? floorType(x, y, steps) : floorType);
        }
        x += Math.round(dir.dx * (rnd() < 0.7 ? 1 : 2));
        y += Math.round(dir.dy * (rnd() < 0.7 ? 1 : 2));
        if(!ctx.inBounds(x, y)) break;
        for(let oy = -thickness; oy <= thickness; oy++){
          for(let ox = -thickness; ox <= thickness; ox++){
            const tx = x + ox;
            const ty = y + oy;
            if(!ctx.inBounds(tx, ty)) continue;
            if(Math.abs(ox) + Math.abs(oy) > thickness) continue;
            ctx.set(tx, ty, 0);
            ctx.setFloorColor(tx, ty, choose(palette, rnd));
          }
        }
      }
    }
  }
  function applyFog(ctx, color, density){
    for(let y = 1; y < ctx.height - 1; y++){
      for(let x = 1; x < ctx.width - 1; x++){
        if(ctx.get(x, y) !== 0) continue;
        if(((x * 928371 + y * 689287) % density) === 0){
          ctx.setFloorColor(x, y, color);
        }
      }
    }
  }
  function buildRadiantCores(ctx, nodes, radius, palette, opts){
    const rnd = ctx.random;
    const { floorType } = opts || {};
    nodes.forEach(node => {
      for(let ang = 0; ang < TWO_PI; ang += Math.PI / 10){
        const dx = Math.cos(ang);
        const dy = Math.sin(ang);
        let x = node.x;
        let y = node.y;
        for(let i = 0; i < radius; i++){
          x += dx;
          y += dy;
          const tx = Math.round(x);
          const ty = Math.round(y);
          if(!ctx.inBounds(tx, ty)) break;
          ctx.set(tx, ty, 0);
          ctx.setFloorColor(tx, ty, choose(palette, rnd));
          if(floorType) ctx.setFloorType(tx, ty, typeof floorType === 'function' ? floorType(tx, ty, i) : floorType);
        }
      }
    });
  }
  function markPerimeter(ctx, thickness, color){
    for(let y = thickness; y < ctx.height - thickness; y++){
      for(let x = thickness; x < ctx.width - thickness; x++){
        if(x === thickness || y === thickness || x === ctx.width - thickness - 1 || y === ctx.height - thickness - 1){
          ctx.set(x, y, 1);
          ctx.setWallColor(x, y, color);
        }
      }
    }
  }
  function scatterPlanetoids(ctx, amount, palette, opts){
    const rnd = ctx.random;
    const { radiusRange = [2, 5], floorType } = opts || {};
    for(let i = 0; i < amount; i++){
      const cx = Math.floor(rnd() * (ctx.width - 10)) + 5;
      const cy = Math.floor(rnd() * (ctx.height - 10)) + 5;
      const radius = Math.floor(lerp(radiusRange[0], radiusRange[1], rnd()));
      for(let y = -radius; y <= radius; y++){
        for(let x = -radius; x <= radius; x++){
          const tx = cx + x;
          const ty = cy + y;
          if(!ctx.inBounds(tx, ty)) continue;
          if(x*x + y*y <= radius * radius){
            ctx.set(tx, ty, 0);
            ctx.setFloorColor(tx, ty, choose(palette, rnd));
            if(floorType) ctx.setFloorType(tx, ty, typeof floorType === 'function' ? floorType(tx, ty, radius) : floorType);
          }
        }
      }
    }
  }
  function carveCircuit(ctx, nodes, width, palette, opts){
    const rnd = ctx.random;
    const { floorType } = opts || {};
    nodes.forEach((node, idx) => {
      const next = nodes[(idx + 1) % nodes.length];
      const path = ctx.aStar(node, next, { allowDiagonals: true, heuristic: 'euclidean' });
      if(!path) return;
      ctx.carvePath(path, width);
      for(const tile of path){
        ctx.setFloorColor(tile.x, tile.y, choose(palette, rnd));
        if(floorType){
          ctx.setFloorType(tile.x, tile.y, typeof floorType === 'function' ? floorType(tile, idx) : floorType);
        }
      }
    });
  }
  function setDiagonalStrips(ctx, palette, step){
    for(let y = 1; y < ctx.height - 1; y++){
      for(let x = 1; x < ctx.width - 1; x++){
        if(ctx.get(x, y) !== 0) continue;
        if(((x - y) % step) === 0){
          ctx.setFloorColor(x, y, palette[Math.abs(x - y) % palette.length]);
        }
      }
    }
  }
  function fillWithNoiseBands(ctx, palette, opts){
    const { scale = 12, influence = 0.4 } = opts || {};
    for(let y = 1; y < ctx.height - 1; y++){
      for(let x = 1; x < ctx.width - 1; x++){
        if(ctx.get(x, y) !== 0) continue;
        const value = Math.sin((x / scale) + Math.cos(y / scale));
        const idx = Math.floor(clamp((value * influence + 0.5) * palette.length, 0, palette.length - 1));
        ctx.setFloorColor(x, y, palette[idx]);
      }
    }
  }
  function carveLayeredSpirals(ctx, center, layers, palette, opts){
    const rnd = ctx.random;
    const { spacing = 1.5, floorType } = opts || {};
    let radius = Math.min(ctx.width, ctx.height) / 2 - 2;
    let rotation = 0;
    for(let layer = 0; layer < layers; layer++){
      const steps = Math.floor(TWO_PI * radius);
      for(let step = 0; step < steps; step++){
        const t = step / steps;
        const angle = rotation + t * TWO_PI;
        const x = Math.round(center.x + Math.cos(angle) * radius);
        const y = Math.round(center.y + Math.sin(angle) * radius);
        if(!ctx.inBounds(x, y)) continue;
        ctx.set(x, y, 0);
        ctx.setFloorColor(x, y, choose(palette, rnd));
        if(floorType){
          ctx.setFloorType(x, y, typeof floorType === 'function' ? floorType(x, y, layer) : floorType);
        }
      }
      radius -= spacing + rnd() * 1.2;
      rotation += rnd() * 0.8 + HALF_PI / (layer + 2);
    }
  }
  function weaveLattices(ctx, palette, opts){
    const rnd = ctx.random;
    const { spacing = 4, floorType } = opts || {};
    for(let y = 1; y < ctx.height - 1; y++){
      for(let x = 1; x < ctx.width - 1; x++){
        if(x % spacing === 0 || y % spacing === 0){
          ctx.set(x, y, 0);
          ctx.setFloorColor(x, y, palette[(x + y) % palette.length]);
          if(floorType){
            ctx.setFloorType(x, y, typeof floorType === 'function' ? floorType(x, y) : floorType);
          }
        } else if(rnd() < 0.04){
          ctx.set(x, y, 1);
          ctx.setWallColor(x, y, '#1b1b2f');
        }
      }
    }
  }
  function gradientFromSeeds(ctx, seeds, palette){
    for(let y = 1; y < ctx.height - 1; y++){
      for(let x = 1; x < ctx.width - 1; x++){
        if(ctx.get(x, y) !== 0) continue;
        let totalWeight = 0;
        let r = 0, g = 0, b = 0;
        for(const seed of seeds){
          const dx = seed.x - x;
          const dy = seed.y - y;
          const dist = Math.sqrt(dx*dx + dy*dy) + 1;
          const weight = 1 / (dist * dist);
          totalWeight += weight;
          const color = palette[seed.paletteIndex % palette.length];
          const cr = parseInt(color.slice(1,3), 16);
          const cg = parseInt(color.slice(3,5), 16);
          const cb = parseInt(color.slice(5,7), 16);
          r += cr * weight;
          g += cg * weight;
          b += cb * weight;
        }
        if(totalWeight === 0) continue;
        const color = `#${Math.round(r / totalWeight).toString(16).padStart(2,'0')}${Math.round(g / totalWeight).toString(16).padStart(2,'0')}${Math.round(b / totalWeight).toString(16).padStart(2,'0')}`;
        ctx.setFloorColor(x, y, color);
      }
    }
  }
  function multiLayerRipple(ctx, center, layers, palette){
    const rnd = ctx.random;
    for(let layer = 0; layer < layers; layer++){
      const radius = Math.min(ctx.width, ctx.height) / 2 - layer * 2;
      for(let angle = 0; angle < TWO_PI; angle += Math.PI / (6 + layer)){
        const x = Math.round(center.x + Math.cos(angle) * radius);
        const y = Math.round(center.y + Math.sin(angle) * radius);
        if(!ctx.inBounds(x, y)) continue;
        ctx.set(x, y, 0);
        ctx.setFloorColor(x, y, choose(palette, rnd));
      }
    }
  }
  function polarTunnel(ctx, center, arms, palette, opts){
    const rnd = ctx.random;
    const { floorType } = opts || {};
    for(let arm = 0; arm < arms; arm++){
      let angle = arm / arms * TWO_PI;
      for(let i = 0; i < Math.max(ctx.width, ctx.height); i++){
        const radius = i * 0.8;
        const x = Math.round(center.x + Math.cos(angle) * radius);
        const y = Math.round(center.y + Math.sin(angle) * radius);
        if(!ctx.inBounds(x, y)) break;
        ctx.set(x, y, 0);
        ctx.setFloorColor(x, y, choose(palette, rnd));
        if(floorType){
          ctx.setFloorType(x, y, typeof floorType === 'function' ? floorType(x, y, arm, i) : floorType);
        }
        angle += Math.sin(i / 3) * 0.05;
      }
    }
  }
  function carveNestedRectangles(ctx, palette, opts){
    const rnd = ctx.random;
    const { padding = 2, step = 4, floorType } = opts || {};
    for(let offset = padding; offset < Math.min(ctx.width, ctx.height) / 2; offset += step){
      for(let x = offset; x < ctx.width - offset; x++){
        const y1 = offset;
        const y2 = ctx.height - offset - 1;
        ctx.set(x, y1, 0);
        ctx.set(x, y2, 0);
        ctx.setFloorColor(x, y1, choose(palette, rnd));
        ctx.setFloorColor(x, y2, choose(palette, rnd));
        if(floorType){
          ctx.setFloorType(x, y1, floorType);
          ctx.setFloorType(x, y2, floorType);
        }
      }
      for(let y = offset; y < ctx.height - offset; y++){
        const x1 = offset;
        const x2 = ctx.width - offset - 1;
        ctx.set(x1, y, 0);
        ctx.set(x2, y, 0);
        ctx.setFloorColor(x1, y, choose(palette, rnd));
        ctx.setFloorColor(x2, y, choose(palette, rnd));
        if(floorType){
          ctx.setFloorType(x1, y, floorType);
          ctx.setFloorType(x2, y, floorType);
        }
      }
    }
  }
  function sprinklePortals(ctx, palette){
    const rnd = ctx.random;
    for(let i = 0; i < 16; i++){
      const x = 2 + Math.floor(rnd() * (ctx.width - 4));
      const y = 2 + Math.floor(rnd() * (ctx.height - 4));
      drawGlyph(ctx, [
        ' 0 ',
        '0 0',
        ' 0 '
      ], x - 1, y - 1, { floorColor: choose(palette, rnd), floorType: 'portal' });
    }
  }
  function crystalGrowth(ctx, seeds, palette, opts){
    const rnd = ctx.random;
    const { iterations = 80, branching = 4, floorType } = opts || {};
    seeds.forEach(seed => {
      let tips = [{ x: seed.x, y: seed.y }];
      const visited = new Set([`${seed.x},${seed.y}`]);
      for(let i = 0; i < iterations && tips.length > 0; i++){
        const nextTips = [];
        for(const tip of tips){
          for(let j = 0; j < branching; j++){
            const angle = rnd() * TWO_PI;
            const length = 2 + Math.floor(rnd() * 4);
            let x = tip.x;
            let y = tip.y;
            let lastValid = null;
            for(let step = 0; step < length; step++){
              const dx = Math.sign(Math.cos(angle + step * 0.1));
              const dy = Math.sign(Math.sin(angle + step * 0.1));
              if(dx === 0 && dy === 0) continue;
              const nx = x + dx;
              const ny = y + dy;
              if(!ctx.inBounds(nx, ny)) break;
              x = nx;
              y = ny;
              lastValid = { x, y };
              ctx.set(x, y, 0);
              ctx.setFloorColor(x, y, choose(palette, rnd));
              if(floorType) ctx.setFloorType(x, y, floorType);
            }
            if(lastValid){
              const key = `${lastValid.x},${lastValid.y}`;
              if(!visited.has(key)){
                visited.add(key);
                nextTips.push(lastValid);
              }
            }
          }
        }
        tips = nextTips;
      }
    });
  }
  function carveRadialStars(ctx, center, rays, palette, opts){
    const rnd = ctx.random;
    const { floorType } = opts || {};
    for(let i = 0; i < rays; i++){
      const angle = i / rays * TWO_PI;
      const length = Math.max(ctx.width, ctx.height);
      for(let step = 0; step < length; step++){
        const radius = step;
        const x = Math.round(center.x + Math.cos(angle) * radius);
        const y = Math.round(center.y + Math.sin(angle) * radius);
        if(!ctx.inBounds(x, y)) break;
        ctx.set(x, y, 0);
        ctx.setFloorColor(x, y, choose(palette, rnd));
        if(floorType){
          ctx.setFloorType(x, y, typeof floorType === 'function' ? floorType(x, y, step) : floorType);
        }
        if(step % 8 === 0){
          ctx.set(x, y, 1);
          ctx.setWallColor(x, y, '#100a1c');
        }
      }
    }
  }
  function carveHexGrid(ctx, palette, opts){
    const rnd = ctx.random;
    const { radius = 3, floorType } = opts || {};
    for(let y = radius; y < ctx.height - radius; y += radius + 1){
      for(let x = radius; x < ctx.width - radius; x += radius + 1){
        for(let oy = -radius; oy <= radius; oy++){
          for(let ox = -radius; ox <= radius; ox++){
            const tx = x + ox;
            const ty = y + oy;
            if(!ctx.inBounds(tx, ty)) continue;
            if(Math.abs(ox) + Math.abs(oy) + Math.abs(ox + oy) <= radius * 2){
              ctx.set(tx, ty, 0);
              ctx.setFloorColor(tx, ty, choose(palette, rnd));
              if(floorType) ctx.setFloorType(tx, ty, floorType);
            }
          }
        }
      }
    }
  }
  function linkClustersWithBridges(ctx, clusters, palette, opts){
    const rnd = ctx.random;
    const { floorType } = opts || {};
    for(let i = 0; i < clusters.length; i++){
      const a = clusters[i];
      const b = clusters[(i + 1) % clusters.length];
      const path = ctx.aStar(a, b, { allowDiagonals: true, heuristic: 'manhattan' });
      if(!path) continue;
      ctx.carvePath(path, 2);
      for(const tile of path){
        ctx.setFloorColor(tile.x, tile.y, choose(palette, rnd));
        if(floorType) ctx.setFloorType(tile.x, tile.y, typeof floorType === 'function' ? floorType(tile, a, b) : floorType);
      }
    }
  }
  function applyVerticalBands(ctx, palette, step){
    for(let x = 1; x < ctx.width - 1; x++){
      const color = palette[x % palette.length];
      for(let y = 1; y < ctx.height - 1; y++){
        if(ctx.get(x, y) !== 0) continue;
        if(x % step === 0) ctx.setFloorColor(x, y, color);
      }
    }
  }
  function createHeightMap(width, height, opts){
    const { frequency = 0.12, octaves = 3, persistence = 0.55, seed = 1337 } = opts || {};
    const map = new Array(height);
    for(let y = 0; y < height; y++){
      map[y] = new Array(width);
      for(let x = 0; x < width; x++){
        let amplitude = 1;
        let freq = frequency;
        let value = 0;
        for(let o = 0; o < octaves; o++){
          const sample = Math.sin((x + seed * 17) * freq) + Math.cos((y - seed * 13) * freq);
          value += sample * amplitude;
          amplitude *= persistence;
          freq *= 2;
        }
        map[y][x] = value;
      }
    }
    return map;
  }
  function applyHeightMapLayers(ctx, heightMap, palette, opts){
    const { floorTypes = ['normal'], carve = true } = opts || {};
    let min = Infinity;
    let max = -Infinity;
    for(let y = 0; y < heightMap.length; y++){
      for(let x = 0; x < heightMap[y].length; x++){
        const value = heightMap[y][x];
        if(value < min) min = value;
        if(value > max) max = value;
      }
    }
    const range = max - min || 1;
    const hasFloorTypes = Array.isArray(floorTypes) && floorTypes.length > 0;
    for(let y = 1; y < ctx.height - 1; y++){
      for(let x = 1; x < ctx.width - 1; x++){
        const normalized = clamp((heightMap[y][x] - min) / range, 0, 1);
        const colorIndex = Math.min(palette.length - 1, Math.floor(normalized * palette.length));
        const typeIndex = hasFloorTypes ? Math.min(floorTypes.length - 1, Math.floor(normalized * floorTypes.length)) : 0;
        if(carve) ctx.set(x, y, 0);
        ctx.setFloorColor(x, y, palette[colorIndex]);
        if(hasFloorTypes){
          const entry = floorTypes[typeIndex];
          if(typeof entry === 'function'){
            ctx.setFloorType(x, y, entry(x, y, normalized));
          } else {
            ctx.setFloorType(x, y, entry);
          }
        }
      }
    }
  }
  function fractalBloom(ctx, origin, depth, branches, palette, opts){
    const rnd = ctx.random;
    const { floorType, decay = 0.68 } = opts || {};
    function branch(x, y, level, length){
      if(level <= 0) return;
      for(let i = 0; i < branches; i++){
        const angle = rnd() * TWO_PI;
        let px = x;
        let py = y;
        const segmentLength = Math.max(2, Math.floor(length * (0.55 + rnd() * 0.45)));
        const bend = rnd() * 0.12;
        for(let step = 0; step < segmentLength; step++){
          px += Math.cos(angle + step * bend * (rnd() < 0.5 ? 1 : -1));
          py += Math.sin(angle + step * bend * (rnd() < 0.5 ? 1 : -1));
          const tx = Math.round(px);
          const ty = Math.round(py);
          if(!ctx.inBounds(tx, ty)) break;
          ctx.set(tx, ty, 0);
          ctx.setFloorColor(tx, ty, choose(palette, rnd));
          if(floorType){
            if(typeof floorType === 'function'){
              ctx.setFloorType(tx, ty, floorType(tx, ty, level, step));
            } else {
              ctx.setFloorType(tx, ty, floorType);
            }
          }
        }
        branch(px, py, level - 1, length * decay);
      }
    }
    branch(origin.x, origin.y, depth, Math.min(ctx.width, ctx.height) / 3);
  }
  function propagateWavefront(ctx, seeds, palette, opts){
    const rnd = ctx.random;
    const { iterations = 600, floorType, waveStep = 5 } = opts || {};
    const queue = seeds.map(seed => ({ ...seed, dist: 0 }));
    const visited = new Set();
    while(queue.length){
      const current = queue.shift();
      const key = `${current.x},${current.y}`;
      if(visited.has(key)) continue;
      if(!ctx.inBounds(current.x, current.y)) continue;
      visited.add(key);
      ctx.set(current.x, current.y, 0);
      const colorIndex = Math.floor(current.dist / waveStep) % palette.length;
      ctx.setFloorColor(current.x, current.y, palette[colorIndex]);
      if(floorType){
        if(typeof floorType === 'function'){
          ctx.setFloorType(current.x, current.y, floorType(current.x, current.y, current.dist));
        } else {
          ctx.setFloorType(current.x, current.y, floorType);
        }
      }
      if(visited.size >= iterations) break;
      const dirs = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 }
      ];
      dirs.forEach(dir => {
        const nx = current.x + dir.x;
        const ny = current.y + dir.y;
        if(!ctx.inBounds(nx, ny)) return;
        queue.push({ x: nx, y: ny, dist: current.dist + 1 });
      });
    }
  }
  function embedGlyphSequence(ctx, glyphs, nodes, opts){
    const { floorColor = '#ffffff', floorType } = opts || {};
    nodes.forEach((node, idx) => {
      const glyph = glyphs[idx % glyphs.length];
      if(!glyph || !glyph.length) return;
      const offsetX = node.x - Math.floor(glyph[0].length / 2);
      const offsetY = node.y - Math.floor(glyph.length / 2);
      drawGlyph(ctx, glyph, offsetX, offsetY, { floorColor, floorType });
    });
  }
  function ribbonStrandNetwork(ctx, nodes, palette, opts){
    const rnd = ctx.random;
    const { thickness = 1, floorType } = opts || {};
    for(let i = 0; i < nodes.length; i++){
      for(let j = i + 1; j < nodes.length; j++){
        if(rnd() > 0.35) continue;
        const path = ctx.aStar(nodes[i], nodes[j], { allowDiagonals: true, heuristic: 'octile' });
        if(!path) continue;
        ctx.carvePath(path, thickness);
        path.forEach((tile, idx) => {
          ctx.setFloorColor(tile.x, tile.y, palette[(idx + i) % palette.length]);
          if(floorType){
            if(typeof floorType === 'function'){
              ctx.setFloorType(tile.x, tile.y, floorType(tile, i, j));
            } else {
              ctx.setFloorType(tile.x, tile.y, floorType);
            }
          }
        });
      }
    }
  }
  function fractalWaves(ctx, palette, opts){
    const { frequency = 0.12, amplitude = 5, floorType } = opts || {};
    const rnd = ctx.random;
    for(let x = 1; x < ctx.width - 1; x++){
      const base = Math.sin(x * frequency) * amplitude + ctx.height / 2;
      for(let y = 1; y < ctx.height - 1; y++){
        const offset = Math.sin((y + x) * frequency * 0.7) * amplitude * 0.5;
        const threshold = base + offset;
        if(Math.abs(y - threshold) < 2 + rnd() * 2){
          ctx.set(x, y, 0);
          ctx.setFloorColor(x, y, choose(palette, rnd));
          if(floorType) ctx.setFloorType(x, y, floorType);
        }
      }
    }
  }
  function rippleIntersections(ctx, palette, opts){
    const rnd = ctx.random;
    const { rings = 6, spacing = 4 } = opts || {};
    const centers = scatterNodes(ctx, 7, 8, 4);
    centers.forEach(center => {
      for(let ring = 1; ring <= rings; ring++){
        const radius = ring * spacing + rnd() * 2;
        for(let angle = 0; angle < TWO_PI; angle += Math.PI / (6 + ring)){
          const x = Math.round(center.x + Math.cos(angle) * radius);
          const y = Math.round(center.y + Math.sin(angle) * radius);
          if(!ctx.inBounds(x, y)) continue;
          ctx.set(x, y, 0);
          ctx.setFloorColor(x, y, choose(palette, rnd));
        }
      }
    });
  }
  function applyCelestialRunes(ctx, palette){
    const rnd = ctx.random;
    for(let i = 0; i < 24; i++){
      const rune = choose([
        [' 0 ', '0 0', ' 0 '],
        ['0 0', ' 0 ', '0 0'],
        ['000', ' 0 ', '000'],
        [' 0 ', '000', ' 0 '],
        ['0 0', '000', '0 0']
      ], rnd);
      const x = 2 + Math.floor(rnd() * (ctx.width - 4));
      const y = 2 + Math.floor(rnd() * (ctx.height - 4));
      drawGlyph(ctx, rune, x - 1, y - 1, { floorColor: choose(palette, rnd), floorType: 'rune' });
    }
  }
  function carveFractalBranches(ctx, seeds, palette, opts){
    const rnd = ctx.random;
    const { depth = 4, branchFactor = 3, floorType } = opts || {};
    function recurse(point, level){
      if(level <= 0) return;
      for(let i = 0; i < branchFactor; i++){
        const angle = rnd() * TWO_PI;
        const length = 3 + Math.floor(rnd() * 4);
        let x = point.x;
        let y = point.y;
        for(let step = 0; step < length; step++){
          x += Math.round(Math.cos(angle + step * 0.15));
          y += Math.round(Math.sin(angle + step * 0.15));
          if(!ctx.inBounds(x, y)) break;
          ctx.set(x, y, 0);
          ctx.setFloorColor(x, y, choose(palette, rnd));
          if(floorType) ctx.setFloorType(x, y, floorType);
        }
        recurse({ x, y }, level - 1);
      }
    }
    seeds.forEach(seed => recurse(seed, depth));
  }
  function spiralPulse(ctx, center, radius, palette, opts){
    const rnd = ctx.random;
    const { floorType } = opts || {};
    for(let angle = 0; angle < TWO_PI * radius; angle += 0.35){
      const r = radius * angle / (TWO_PI * radius);
      const x = Math.round(center.x + Math.cos(angle) * r * 1.1);
      const y = Math.round(center.y + Math.sin(angle) * r * 1.1);
      if(!ctx.inBounds(x, y)) continue;
      ctx.set(x, y, 0);
      ctx.setFloorColor(x, y, choose(palette, rnd));
      if(floorType) ctx.setFloorType(x, y, typeof floorType === 'function' ? floorType(x, y, angle) : floorType);
    }
  }
  function applyRunwayLights(ctx, palette, spacing){
    for(let x = 2; x < ctx.width - 2; x += spacing){
      for(let y = 2; y < ctx.height - 2; y += spacing){
        ctx.setFloorColor(x, y, palette[(x + y) % palette.length]);
        ctx.setFloorType(x, y, 'light');
      }
    }
  }
  function tilingDiamond(ctx, palette, opts){
    const rnd = ctx.random;
    const { spacing = 3, floorType } = opts || {};
    for(let y = spacing; y < ctx.height - spacing; y += spacing){
      for(let x = spacing; x < ctx.width - spacing; x += spacing){
        for(let oy = -spacing; oy <= spacing; oy++){
          for(let ox = -spacing; ox <= spacing; ox++){
            if(Math.abs(ox) + Math.abs(oy) > spacing) continue;
            const tx = x + ox;
            const ty = y + oy;
            if(!ctx.inBounds(tx, ty)) continue;
            ctx.set(tx, ty, 0);
            ctx.setFloorColor(tx, ty, choose(palette, rnd));
            if(floorType) ctx.setFloorType(tx, ty, floorType);
          }
        }
      }
    }
  }
  function portalCross(ctx, center, palette){
    const arms = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 }
    ];
    arms.forEach((arm, idx) => {
      for(let i = 0; i < Math.max(ctx.width, ctx.height); i++){
        const x = center.x + arm.dx * i;
        const y = center.y + arm.dy * i;
        if(!ctx.inBounds(x, y)) break;
        ctx.set(x, y, 0);
        ctx.setFloorColor(x, y, palette[idx % palette.length]);
        if(i % 3 === 0) ctx.setFloorType(x, y, 'portal');
      }
    });
  }
  function quantumGrid(ctx, palette, opts){
    const rnd = ctx.random;
    const { spacing = 5, jitter = 1 } = opts || {};
    for(let y = spacing; y < ctx.height - spacing; y += spacing){
      for(let x = spacing; x < ctx.width - spacing; x += spacing){
        const tx = clamp(x + Math.round((rnd() - 0.5) * jitter), 1, ctx.width - 2);
        const ty = clamp(y + Math.round((rnd() - 0.5) * jitter), 1, ctx.height - 2);
        ctx.set(tx, ty, 0);
        ctx.setFloorColor(tx, ty, choose(palette, rnd));
        ctx.setFloorType(tx, ty, 'quantum');
      }
    }
  }
  function anchorSpiral(ctx, center, palette, opts){
    const rnd = ctx.random;
    const { turns = 5, floorType } = opts || {};
    const totalSteps = turns * 360;
    for(let step = 0; step < totalSteps; step++){
      const t = step / totalSteps;
      const radius = lerp(2, Math.min(ctx.width, ctx.height) / 2 - 2, easeInOutQuad(t));
      const angle = t * turns * TWO_PI;
      const x = Math.round(center.x + Math.cos(angle) * radius);
      const y = Math.round(center.y + Math.sin(angle) * radius);
      if(!ctx.inBounds(x, y)) continue;
      ctx.set(x, y, 0);
      ctx.setFloorColor(x, y, choose(palette, rnd));
      if(floorType) ctx.setFloorType(x, y, typeof floorType === 'function' ? floorType(x, y, t) : floorType);
    }
  }
  function scatterPylons(ctx, palette, opts){
    const rnd = ctx.random;
    const { amount = 30, floorType } = opts || {};
    for(let i = 0; i < amount; i++){
      const x = 2 + Math.floor(rnd() * (ctx.width - 4));
      const y = 2 + Math.floor(rnd() * (ctx.height - 4));
      ctx.set(x, y, 0);
      ctx.setFloorColor(x, y, choose(palette, rnd));
      if(floorType) ctx.setFloorType(x, y, floorType);
      ctx.set(x, y - 1, 1);
      ctx.setWallColor(x, y - 1, '#1b1f2e');
    }
  }
  function fillNebula(ctx, palette, opts){
    const { scale = 8, layers = 3 } = opts || {};
    for(let layer = 0; layer < layers; layer++){
      const influence = (layer + 1) / layers * 0.6;
      fillWithNoiseBands(ctx, palette, { scale: scale + layer * 3, influence });
    }
  }
  const sharedPalettes = {
    aurora: ['#f1f6ff','#c3ecff','#91d8ff','#f6d0ff','#ffe2a7'],
    neon: ['#81fef3','#7b89ff','#ff81ed','#ffe978','#8bffcf'],
    reef: ['#9afff6','#6dd5ff','#8ef6ff','#ffe6f2','#c6a8ff'],
    chrono: ['#ffd6a5','#ffeedd','#cdeaff','#ffb8b8','#b1ffe4'],
    dream: ['#ffe7ff','#d6f4ff','#f7ffd6','#ecddff','#c8fffb'],
    eclipse: ['#1f1537','#352658','#512f7a','#774e9a','#a36ec8'],
    verdant: ['#d2ffc8','#9fffd3','#6afff1','#ffe5d6','#d1c7ff'],
    forge: ['#ffb56b','#ff8a5b','#ffa4d0','#ffd3a5','#ffeea3'],
    astral: ['#f9f7ff','#dfe4ff','#bdc8ff','#ffe6f7','#c2ffe9'],
    cyber: ['#92fff2','#64f0ff','#a1a6ff','#ff73e0','#ffd37a'],
    obsidian: ['#14111f','#1d1a2c','#2a1d3b','#352449','#4d2f66'],
    ether: ['#dbf9ff','#d6d1ff','#ffcffa','#ffecc6','#c4ffee'],
    sand: ['#f7f1df','#f2d6b3','#f9c9a2','#f5e6c8','#fdf5ed'],
    midnight: ['#0a0713','#141425','#1f2138','#2d2f51','#44466b'],
    coral: ['#ffdbd6','#ffc0cb','#ff99c8','#ffa8a8','#ffdede'],
    prism: ['#fef3ff','#e5d4ff','#c7f0ff','#ffe2f0','#fce8d5'],
    lumen: ['#fff7ff','#e8ebff','#cde9ff','#fff1e2','#ffe3f3'],
    nova: ['#fef6dd','#ffd4f1','#c1f2ff','#ffeeff','#f7d8ff'],
    glacial: ['#f1fbff','#d6f2ff','#b9e3ff','#e8fff7','#fff7f1'],
    pulse: ['#ffeabf','#ffc0e8','#c5b9ff','#9fffe5','#ffefd8'],
    glyph: ['#fff8ff','#f0e5ff','#d7fff5','#ffe9cf','#fce3ff']
  };
  const glyphAtlas = {
    singularity: [
      [
        ' 000 ',
        '0   0',
        ' 0 0 ',
        '0   0',
        ' 000 '
      ],
      [
        '  0  ',
        ' 0 0 ',
        '0   0',
        ' 0 0 ',
        '  0  '
      ],
      [
        ' 000 ',
        '0 0 0',
        ' 000 ',
        '0 0 0',
        ' 000 '
      ]
    ],
    harmonic: [
      [
        '0 0 0',
        ' 000 ',
        '0 0 0',
        ' 000 ',
        '0 0 0'
      ],
      [
        '0   0',
        ' 0 0 ',
        '  0  ',
        ' 0 0 ',
        '0   0'
      ]
    ],
    turbines: [
      [
        ' 0 0 ',
        '00000',
        ' 0 0 ',
        '0   0',
        ' 0 0 '
      ],
      [
        '00000',
        '0   0',
        ' 000 ',
        '0   0',
        '00000'
      ]
    ]
  };
  const prismaticCities = {
    id: 'prismatic-cities',
    name: 'プリズマティック都市層',
    nameKey: "dungeon.types.prismatic_cities.name",
    description: '光の輪と浮遊都市が折り重なる幻想の大通り。虹色の軌道が多層構造を描く',
    descriptionKey: "dungeon.types.prismatic_cities.description",

    algorithm(ctx){
      const rnd = ctx.random;
      const center = { x: Math.floor(ctx.width / 2), y: Math.floor(ctx.height / 2) };
      ringCarve(ctx, center.x, center.y, 2, Math.floor(Math.min(ctx.width, ctx.height) / 4), { floorColor: '#f7f1ff' });
      ringCarve(ctx, center.x, center.y, Math.floor(Math.min(ctx.width, ctx.height) / 5), Math.floor(Math.min(ctx.width, ctx.height) / 3), { floorColor: '#fff2d1', floorType: 'ice' });
      carveLayeredSpirals(ctx, center, 10, sharedPalettes.prism, { floorType: (x, y, layer) => layer % 2 === 0 ? 'ice' : 'normal' });
      const nodes = scatterNodes(ctx, 18, 6, 4);
      connectNodes(ctx, nodes, sharedPalettes.neon, { thickness: 2, floorType: 'normal' });
      radiateSpears(ctx, center, 64, Math.max(ctx.width, ctx.height), sharedPalettes.aurora, { floorType: 'ice', typeInterval: 8 });
      paintWarpedGradient(ctx, '#98d4f9', '#f7c0ff', { turbulence: 0.9, rotation: Math.PI / 7 });
      applyCheckerHighlights(ctx, ['#ffefff','#c9f3ff','#fff1ce'], 5);
      sprinklePortals(ctx, ['#b7f9ff','#ffb9f4','#ffecce']);
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.6, blockDimMixed: 0.75, tags: ['city','ring','ice','light','portal'] }
  };

  const neonOrbitarium = {
    id: 'neon-orbitarium',
    name: 'ネオン軌道庭園',
    nameKey: "dungeon.types.neon_orbitarium.name",
    description: '重力がねじれた軌道庭園。プラズマの水路とホログラムが交差し惑星庭園が浮遊する',
    descriptionKey: "dungeon.types.neon_orbitarium.description",

    algorithm(ctx){
      const rnd = ctx.random;
      const palette = sharedPalettes.neon;
      const hubs = scatterNodes(ctx, 20, 5, 4);
      hubs.forEach(h => {
        ringCarve(ctx, h.x, h.y, 1, 3 + Math.floor(rnd() * 2), { floorColor: choose(palette, rnd), floorType: 'ice' });
      });
      connectNodes(ctx, hubs, palette, { thickness: 2, floorType: 'normal' });
      const field = createFlowField(ctx.width, ctx.height);
      followFlowField(ctx, field, 200, palette, { thickness: 1, floorType: (x, y, steps) => steps % 9 === 0 ? 'ice' : 'normal' });
      scatterPlanetoids(ctx, 24, ['#f5f8ff','#b6e6ff','#ffb0f5'], { radiusRange: [2, 6], floorType: 'normal' });
      applyFog(ctx, '#252040', 7);
      setDiagonalStrips(ctx, ['#fffbce','#b0fffd','#ffd7ff'], 6);
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.58, blockDimMixed: 0.8, tags: ['garden','orbit','gravity','plasma'] }
  };

  const lucidReef = {
    id: 'lucid-reef',
    name: 'ルシッドリーフ',
    nameKey: "dungeon.types.lucid_reef.name",
    description: '夢見のリーフ海底。睡蓮のようなプラズマが揺らぎ、潮流は極光に染まる',
    descriptionKey: "dungeon.types.lucid_reef.description",

    algorithm(ctx){
      const center = { x: Math.floor(ctx.width / 2), y: Math.floor(ctx.height / 2) };
      floodChannel(ctx, center, sharedPalettes.reef, { maxDepth: 720, width: 3, floorType: (x, y, depth) => depth % 5 === 0 ? 'water' : 'normal' });
      rippleIntersections(ctx, sharedPalettes.reef, { rings: 10, spacing: 3 });
      applyCelestialRunes(ctx, ['#b3f7ff','#fff4f9','#c4b8ff']);
      fillNebula(ctx, ['#6bd7ff','#b9f7ff','#f2efff'], { scale: 10, layers: 3 });
      applyFog(ctx, '#d8fff9', 9);
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.5, blockDimMixed: 0.6, tags: ['reef','water','dream','wave'] }
  };

  const chronoForge = {
    id: 'chrono-forge',
    name: 'クロノフォージ',
    nameKey: "dungeon.types.chrono_forge.name",
    description: '時間を鍛える時計仕掛けの工廠。時限炉心と回転式の路線が絡み合う',
    descriptionKey: "dungeon.types.chrono_forge.description",

    algorithm(ctx){
      carveHexGrid(ctx, sharedPalettes.chrono, { radius: 4, floorType: 'normal' });
      const nodes = scatterNodes(ctx, 18, 7, 4);
      carveCircuit(ctx, nodes, 3, sharedPalettes.forge, { floorType: (tile, idx) => idx % 3 === 0 ? 'fire' : 'normal' });
      crystalGrowth(ctx, nodes.slice(0, 6), ['#ffd0a3','#ffa7b9','#ffe8c9'], { iterations: 36, branching: 3, floorType: 'fire' });
      markPerimeter(ctx, 1, '#261620');
      applyVerticalBands(ctx, ['#ffe9cc','#ffdede','#dff0ff'], 3);
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.52, blockDimMixed: 0.68, tags: ['factory','time','fire','clockwork'] }
  };

  const dreamwaySpirals = {
    id: 'dreamway-spirals',
    name: 'ドリームウェイスパイラル',
    nameKey: "dungeon.types.dreamway_spirals.name",
    description: '多層の螺旋がどこまでも降りていく幻夢の通路。螺旋は別世界の入り口へ連結する',
    descriptionKey: "dungeon.types.dreamway_spirals.description",

    algorithm(ctx){
      const center = { x: Math.floor(ctx.width / 2), y: Math.floor(ctx.height / 2) };
      carveLayeredSpirals(ctx, center, 14, sharedPalettes.dream, { floorType: (x, y, layer) => layer % 3 === 0 ? 'portal' : 'normal' });
      const nodes = scatterNodes(ctx, 20, 6, 4);
      connectNodes(ctx, nodes, ['#ffd5f8','#d9f7ff','#ffeecf'], { thickness: 1, floorType: (tile, a, b) => (tile.x + tile.y) % 4 === 0 ? 'ice' : 'normal' });
      multiLayerRipple(ctx, center, 7, ['#fff1ff','#c5f7ff','#fff2d4']);
      paintWarpedGradient(ctx, '#f7d1ff', '#d1fff9', { turbulence: 0.6, rotation: Math.PI / 5 });
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.52, blockDimMixed: 0.66, tags: ['spiral','dream','portal','maze'] }
  };

  const astralSymbiosis = {
    id: 'astral-symbiosis',
    name: 'アストラル共鳴苑',
    nameKey: "dungeon.types.astral_symbiosis.name",
    description: '星屑樹とサイバーロータスが共存する庭園。軌跡と根が交互に織り込まれる',
    descriptionKey: "dungeon.types.astral_symbiosis.description",

    algorithm(ctx){
      const nodes = scatterNodes(ctx, 22, 5, 3);
      carveVoronoi(ctx, nodes.map((n, idx) => ({ ...n, paletteIndex: idx % sharedPalettes.astral.length })), sharedPalettes.astral, { floorType: (x, y, seed) => seed.paletteIndex % 2 === 0 ? 'normal' : 'ice' });
      buildRadiantCores(ctx, nodes.slice(0, 10), 12, sharedPalettes.cyber, { floorType: 'normal' });
      weaveLattices(ctx, sharedPalettes.aurora, { spacing: 5, floorType: 'normal' });
      applyFog(ctx, '#1e142d', 8);
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.55, blockDimMixed: 0.7, tags: ['garden','astral','cyber','growth'] }
  };

  const mirroredCitadel = {
    id: 'mirrored-citadel',
    name: '鏡映城郭界',
    nameKey: "dungeon.types.mirrored_citadel.name",
    description: '上下反転の城郭が重なり、鏡面軸が光る。重力に逆らう城壁が伸びる',
    descriptionKey: "dungeon.types.mirrored_citadel.description",

    algorithm(ctx){
      const rnd = ctx.random;
      carveNestedRectangles(ctx, ['#f8d6ff','#d0e4ff','#ffefd7'], { padding: 3, step: 3, floorType: 'normal' });
      const midX = Math.floor(ctx.width / 2);
      const midY = Math.floor(ctx.height / 2);
      carveRadialStars(ctx, { x: midX, y: midY }, 18, ['#ffe3ff','#c7e8ff','#fff5d0'], { floorType: (x, y, step) => step % 10 === 0 ? 'ice' : 'normal' });
      setDiagonalStrips(ctx, ['#f6f9ff','#dce1ff','#fff5df'], 5);
      portalCross(ctx, { x: midX, y: midY }, ['#f4faff','#ffdff5','#fff2d9']);
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.5, blockDimMixed: 0.65, tags: ['castle','mirror','gravity','ice'] }
  };

  const biotechSanctum = {
    id: 'biotech-sanctum',
    name: 'バイオテックの聖環',
    nameKey: "dungeon.types.biotech_sanctum.name",
    description: '有機機械と発光植物が共鳴する螺旋聖堂。生命と回路が絡み合う',
    descriptionKey: "dungeon.types.biotech_sanctum.description",

    algorithm(ctx){
      const seeds = scatterNodes(ctx, 24, 4, 3);
      carveVoronoi(ctx, seeds.map((s, idx) => ({ ...s, paletteIndex: idx })), sharedPalettes.verdant, { floorType: (x, y, seed) => seed.paletteIndex % 3 === 0 ? 'poison' : 'normal', inset: 1 });
      fractalWaves(ctx, ['#98ffc9','#74f5ff','#f9ffd6'], { frequency: 0.18, amplitude: 4, floorType: 'normal' });
      crystalGrowth(ctx, seeds.slice(0, 8), ['#9efff0','#ffe6f2','#d0ffc2'], { iterations: 26, branching: 5, floorType: 'poison' });
      quantumGrid(ctx, ['#e6ffe4','#c9ffe9','#f4fff2'], { spacing: 4, jitter: 2 });
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.58, blockDimMixed: 0.72, tags: ['bio','circuit','garden','poison'] }
  };
  const vaporwaveTransit = {
    id: 'vaporwave-transit',
    name: 'ヴェイパートランジット',
    nameKey: "dungeon.types.vaporwave_transit.name",
    description: '幻想都市を結ぶ浮遊鉄道。モジュラーな駅とチューブが滑らかに曲線を描く',
    descriptionKey: "dungeon.types.vaporwave_transit.description",

    algorithm(ctx){
      const stations = scatterNodes(ctx, 18, 6, 4);
      stations.forEach(station => {
        drawGlyph(ctx, [
          '00000',
          '0   0',
          '0 0 0',
          '0   0',
          '00000'
        ], station.x - 2, station.y - 2, { floorColor: '#ffeffe', wallColor: '#352c44', floorType: 'normal' });
      });
      stations.sort((a, b) => a.x - b.x);
      for(let i = 0; i < stations.length - 1; i++){
        const a = stations[i];
        const b = stations[i + 1];
        carveSpline(ctx, [
          { x: a.x, y: a.y },
          { x: lerp(a.x, b.x, 0.33), y: a.y - 4 },
          { x: lerp(a.x, b.x, 0.66), y: b.y + 4 },
          { x: b.x, y: b.y }
        ], 2, ['#ffe1ff','#c8f7ff','#fff2ce'], { floorType: 'normal', jitter: 1.5 });
      }
      applyFog(ctx, '#1d1427', 5);
      setDiagonalStrips(ctx, ['#f5d4ff','#d1f2ff','#ffefc7'], 7);
      applyRunwayLights(ctx, ['#fbd6ff','#d9f9ff','#fff6cc'], 6);
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.54, blockDimMixed: 0.74, tags: ['rail','tube','city','wave'] }
  };

  const abyssalAurora = {
    id: 'abyssal-aurora',
    name: 'アビサルオーロラ海淵',
    nameKey: "dungeon.types.abyssal_aurora.name",
    description: '深海と星霊が交わる海淵。極光が渦巻き、暗黒の柱が立ち上る',
    descriptionKey: "dungeon.types.abyssal_aurora.description",

    algorithm(ctx){
      floodChannel(ctx, { x: Math.floor(ctx.width / 2), y: 1 }, ['#0f172a','#111f3b','#152a55'], { maxDepth: 860, width: 3, floorType: 'water' });
      carveRadialStars(ctx, { x: Math.floor(ctx.width / 2), y: Math.floor(ctx.height / 2) }, 22, ['#70f0ff','#b3e8ff','#ffedf8'], { floorType: 'ice' });
      crystalGrowth(ctx, scatterNodes(ctx, 10, 9, 5), ['#8b8dff','#70f0ff','#ffd1ff'], { iterations: 32, branching: 4, floorType: 'normal' });
      paintWarpedGradient(ctx, '#101223', '#314163', { turbulence: 0.4, rotation: Math.PI / 3 });
      applyFog(ctx, '#0f1321', 11);
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.48, blockDimMixed: 0.66, tags: ['deepsea','aurora','dark','ice'] }
  };

  const quantumDunes = {
    id: 'quantum-dunes',
    name: '量子砂海',
    nameKey: "dungeon.types.quantum_dunes.name",
    description: '砂漠と量子回路が重なり合う砂海。砂粒が量子化され波打つ',
    descriptionKey: "dungeon.types.quantum_dunes.description",

    algorithm(ctx){
      carveVoronoi(ctx, scatterNodes(ctx, 20, 7, 4).map((n, idx) => ({ ...n, paletteIndex: idx })), sharedPalettes.sand, { floorType: 'normal' });
      fractalWaves(ctx, ['#f9d6aa','#fcebd2','#fff9ed'], { frequency: 0.09, amplitude: 6, floorType: 'normal' });
      applyVerticalBands(ctx, ['#ffe2b8','#fcdab2','#fff2d9'], 4);
      quantumGrid(ctx, ['#fdf0d5','#ffe8c0','#f6dcb4'], { spacing: 5, jitter: 2 });
      applyFog(ctx, '#f1d1aa', 6);
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.57, blockDimMixed: 0.7, tags: ['desert','quantum','circuit'] }
  };

  const chronoMirage = {
    id: 'chrono-mirage',
    name: 'クロノミラージュ回廊',
    nameKey: "dungeon.types.chrono_mirage.name",
    description: '時の蜃気楼が階層化した回廊を生む。時間差で異なる路線が交差する',
    descriptionKey: "dungeon.types.chrono_mirage.description",

    algorithm(ctx){
      const seeds = scatterNodes(ctx, 18, 8, 5);
      carveVoronoi(ctx, seeds.map((s, idx) => ({ ...s, paletteIndex: idx })), sharedPalettes.chrono, { floorType: 'normal', inset: 1 });
      const field = createFlowField(ctx.width, ctx.height);
      followFlowField(ctx, field, 150, sharedPalettes.forge, { thickness: 2, floorType: (x, y, steps) => steps % 12 === 0 ? 'fire' : 'normal' });
      applyCheckerHighlights(ctx, ['#ffe7cc','#ffd0d6','#dcecff'], 6);
      anchorSpiral(ctx, { x: Math.floor(ctx.width / 2), y: Math.floor(ctx.height / 2) }, ['#ffeecf','#ffd0f0','#cbe5ff'], { turns: 6, floorType: (x, y, t) => t > 0.7 ? 'portal' : 'normal' });
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.53, blockDimMixed: 0.67, tags: ['time','mirage','fire','loop'] }
  };

  const spectralArchive = {
    id: 'spectral-archive',
    name: 'スペクトラルアーカイブ',
    nameKey: "dungeon.types.spectral_archive.name",
    description: '霊光図書の回廊。資料を守るアーカイブサーバが星霊の階段と融合する',
    descriptionKey: "dungeon.types.spectral_archive.description",

    algorithm(ctx){
      carveHexGrid(ctx, sharedPalettes.astral, { radius: 5, floorType: 'normal' });
      const nodes = scatterNodes(ctx, 16, 7, 4);
      connectNodes(ctx, nodes, sharedPalettes.ether, { thickness: 1, floorType: (tile, a, b) => (tile.x + tile.y) % 4 === 0 ? 'ice' : 'normal' });
      applyCelestialRunes(ctx, ['#f1f0ff','#d6f1ff','#ffe9f7']);
      gradientFromSeeds(ctx, nodes.map((n, idx) => ({ ...n, paletteIndex: idx })), ['#fff7ff','#dce4ff','#ffeecf']);
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.49, blockDimMixed: 0.64, tags: ['library','spirit','stairs','ice'] }
  };

  const dreamMesa = {
    id: 'dream-mesa',
    name: '夢幻メサ浮島',
    nameKey: "dungeon.types.dream_mesa.name",
    description: '浮遊メサが光の橋で繋がり、夢幻の砂が空に舞う',
    descriptionKey: "dungeon.types.dream_mesa.description",

    algorithm(ctx){
      scatterPlanetoids(ctx, 28, ['#ffece0','#ffd0f5','#d1f6ff'], { radiusRange: [3, 7], floorType: 'normal' });
      const clusters = scatterNodes(ctx, 16, 8, 5);
      linkClustersWithBridges(ctx, clusters, ['#fff2dd','#ffcce9','#c8f7ff'], { floorType: 'normal' });
      applyFog(ctx, '#f0e1d1', 6);
      fillNebula(ctx, ['#fff4e2','#ffe3f1','#d6f8ff'], { scale: 12, layers: 2 });
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.6, blockDimMixed: 0.74, tags: ['floating','mesa','bridge','sand'] }
  };

  const starlitWorkshop = {
    id: 'starlit-workshop',
    name: '星灯りの工房軌道',
    nameKey: "dungeon.types.starlit_workshop.name",
    description: '星灯りが指す軌道工房。カラフルなラインが工作機械へ繋がる',
    descriptionKey: "dungeon.types.starlit_workshop.description",

    algorithm(ctx){
      const seeds = scatterNodes(ctx, 18, 6, 3);
      carveVoronoi(ctx, seeds.map((s, idx) => ({ ...s, paletteIndex: idx })), sharedPalettes.neon, { floorType: (x, y, seed) => seed.paletteIndex % 4 === 0 ? 'fire' : 'normal', inset: 2 });
      weaveLattices(ctx, sharedPalettes.forge, { spacing: 5, floorType: 'normal' });
      markPerimeter(ctx, 2, '#141325');
      scatterPylons(ctx, ['#ffe4cf','#ffd0ec','#c8f4ff'], { amount: 34, floorType: 'normal' });
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.55, blockDimMixed: 0.73, tags: ['forge','orbit','workshop','fire'] }
  };

  const orbitalRainforest = {
    id: 'orbital-rainforest',
    name: '軌道熱帯林居住層',
    nameKey: "dungeon.types.orbital_rainforest.name",
    description: '軌道上に建つ熱帯林居住区。水路と空中庭園が層を成す',
    descriptionKey: "dungeon.types.orbital_rainforest.description",

    algorithm(ctx){
      floodChannel(ctx, { x: Math.floor(ctx.width / 2), y: Math.floor(ctx.height / 2) }, ['#76ffc8','#abffd7','#d6ffe8'], { maxDepth: 520, width: 3, floorType: 'water' });
      const nodes = scatterNodes(ctx, 24, 5, 3);
      connectNodes(ctx, nodes, ['#ffe9c6','#fff4d7','#cff7ff'], { thickness: 1, floorType: 'normal' });
      crystalGrowth(ctx, nodes.slice(0, 10), ['#c4ffd6','#94ffe6','#fff4d3'], { iterations: 24, branching: 4, floorType: 'poison' });
      fillNebula(ctx, ['#d1ffd8','#afffed','#fff7dd'], { scale: 14, layers: 3 });
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.59, blockDimMixed: 0.71, tags: ['forest','water','orbit','bio'] }
  };

  const hypercubeAgora = {
    id: 'hypercube-agora',
    name: '超立方公共回廊',
    nameKey: "dungeon.types.hypercube_agora.name",
    description: '高次元の市場通り。超立方体のアーチが多次元路地を織る',
    descriptionKey: "dungeon.types.hypercube_agora.description",

    algorithm(ctx){
      carveNestedRectangles(ctx, ['#f2d9ff','#c9eaff','#fff2da'], { padding: 2, step: 2, floorType: 'normal' });
      const nodes = scatterNodes(ctx, 22, 4, 3);
      connectNodes(ctx, nodes, ['#fff5de','#ffe1ff','#c9f3ff'], { thickness: 2, floorType: (tile, a, b) => (tile.x + tile.y) % 6 === 0 ? 'portal' : 'normal' });
      applyCheckerHighlights(ctx, ['#fcdffd','#dcecff','#ffefd5'], 4);
      quantumGrid(ctx, ['#f6e2ff','#dee8ff','#ffe7d5'], { spacing: 3, jitter: 1 });
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.52, blockDimMixed: 0.69, tags: ['market','geometry','portal'] }
  };

  const chronoTideForge = {
    id: 'chrono-tide-forge',
    name: '潮汐クロノ鍛冶湾',
    nameKey: "dungeon.types.chrono_tide_forge.name",
    description: '潮汐エネルギーを利用した時間鍛冶湾。潮汐炉と時間射線が絡み合う',
    descriptionKey: "dungeon.types.chrono_tide_forge.description",

    algorithm(ctx){
      floodChannel(ctx, { x: 1, y: Math.floor(ctx.height / 2) }, ['#233a5e','#285d8c','#2d7ab2'], { maxDepth: 640, width: 2, floorType: 'water' });
      carveCircuit(ctx, scatterNodes(ctx, 16, 6, 4), 2, ['#ffd2aa','#ffb3c6','#ffe9c0'], { floorType: (tile, idx) => idx % 2 === 0 ? 'fire' : 'normal' });
      carveFractalBranches(ctx, scatterNodes(ctx, 8, 8, 5), ['#ffe1b5','#ffd0ce','#cbe7ff'], { depth: 5, branchFactor: 4, floorType: 'fire' });
      applyFog(ctx, '#142a3f', 9);
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.5, blockDimMixed: 0.68, tags: ['tide','forge','time','water'] }
  };
  const stellarBloom = {
    id: 'stellar-bloom',
    name: '星蓮の花苑軌道',
    nameKey: "dungeon.types.stellar_bloom.name",
    description: '星光が咲き広がる花苑軌道。フラクタル花弁が星籠を包み込む',
    descriptionKey: "dungeon.types.stellar_bloom.description",

    algorithm(ctx){
      const seeds = scatterNodes(ctx, 26, 5, 3);
      carveVoronoi(ctx, seeds.map((s, idx) => ({ ...s, paletteIndex: idx })), sharedPalettes.astral, { floorType: (x, y, seed) => seed.paletteIndex % 4 === 0 ? 'ice' : 'normal', inset: 1 });
      crystalGrowth(ctx, seeds.slice(0, 12), ['#ffe7ff','#f7d1ff','#d9f3ff'], { iterations: 28, branching: 4, floorType: 'ice' });
      spiralPulse(ctx, { x: Math.floor(ctx.width / 2), y: Math.floor(ctx.height / 2) }, Math.min(ctx.width, ctx.height) / 2, ['#ffe5f5','#c9f1ff','#fff4d9'], { floorType: (x, y, angle) => angle % (Math.PI / 2) < 0.1 ? 'portal' : 'normal' });
      applyFog(ctx, '#160f24', 10);
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.5, blockDimMixed: 0.7, tags: ['garden','fractal','portal','ice'] }
  };

  const cosmicLabyrinth = {
    id: 'cosmic-labyrinth',
    name: 'コズミックラビリンス',
    nameKey: "dungeon.types.cosmic_labyrinth.name",
    description: '宇宙航路が多層迷宮として折り畳まれる。星体通路が複数次元に絡まる',
    descriptionKey: "dungeon.types.cosmic_labyrinth.description",

    algorithm(ctx){
      const nodes = scatterNodes(ctx, 30, 5, 3);
      connectNodes(ctx, nodes, sharedPalettes.obsidian, { thickness: 1, floorType: (tile, a, b) => (tile.x + tile.y) % 5 === 0 ? 'portal' : 'normal' });
      tilingDiamond(ctx, ['#1c1a2e','#2a2348','#3c2f61','#51387b','#6d4b9f'], { spacing: 4, floorType: 'normal' });
      applyFog(ctx, '#0c0a16', 5);
      paintWarpedGradient(ctx, '#1d1635', '#2e2f5f', { turbulence: 0.5, rotation: Math.PI / 6 });
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.45, blockDimMixed: 0.6, tags: ['labyrinth','cosmic','dark','portal'] }
  };

  const luminalCascade = {
    id: 'luminal-cascade',
    name: 'ルミナルカスケード塔',
    nameKey: "dungeon.types.luminal_cascade.name",
    description: '光子の滝が垂直層を照らす塔。滝と光子梯子が多段レイヤーを形成',
    descriptionKey: "dungeon.types.luminal_cascade.description",

    algorithm(ctx){
      const center = { x: Math.floor(ctx.width / 2), y: Math.floor(ctx.height / 2) };
      floodChannel(ctx, center, ['#d7f4ff','#b7ddff','#f8faff'], { maxDepth: 540, width: 2, floorType: 'water' });
      anchorSpiral(ctx, center, ['#fff8d6','#ffdff0','#c8f5ff'], { turns: 7, floorType: (x, y, t) => t > 0.8 ? 'portal' : 'normal' });
      radiateSpears(ctx, center, 48, Math.max(ctx.width, ctx.height), ['#f9f9ff','#e0f7ff','#ffeef9'], { floorType: 'light', typeInterval: 9 });
      applyRunwayLights(ctx, ['#f3e7ff','#d7f0ff','#fff2de'], 5);
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.56, blockDimMixed: 0.7, tags: ['tower','water','light','portal'] }
  };

  const mythicOverpass = {
    id: 'mythic-overpass',
    name: '神話浮橋交差層',
    nameKey: "dungeon.types.mythic_overpass.name",
    description: '神話橋が空に重なる多層交差層。橋梁と神殿区画が相互に絡み合う',
    descriptionKey: "dungeon.types.mythic_overpass.description",

    algorithm(ctx){
      const bridges = scatterNodes(ctx, 20, 7, 4);
      linkClustersWithBridges(ctx, bridges, ['#f7e6d7','#ffe2f0','#d4f2ff'], { floorType: 'normal' });
      carveNestedRectangles(ctx, ['#f9dede','#e6f1ff','#fff6da'], { padding: 4, step: 5, floorType: 'normal' });
      carveRadialStars(ctx, { x: Math.floor(ctx.width / 2), y: Math.floor(ctx.height / 2) }, 16, ['#ffe8d7','#dce8ff','#ffeefa'], { floorType: 'ice' });
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.61, blockDimMixed: 0.76, tags: ['bridge','temple','sky','ice'] }
  };

  const etherealForge = {
    id: 'ethereal-forge',
    name: 'エーテルフォージ連星',
    nameKey: "dungeon.types.ethereal_forge.name",
    description: 'エーテル粒子を鍛える連星炉。エネルギー網と霊火が交互に脈動する',
    descriptionKey: "dungeon.types.ethereal_forge.description",

    algorithm(ctx){
      const nodes = scatterNodes(ctx, 24, 6, 3);
      carveCircuit(ctx, nodes, 2, ['#ffd0c0','#ffc4f2','#d7f3ff'], { floorType: (tile, idx) => idx % 4 === 0 ? 'fire' : 'normal' });
      carveFractalBranches(ctx, nodes.slice(0, 6), ['#ffe7d2','#ffd0f7','#c8f2ff'], { depth: 4, branchFactor: 5, floorType: 'fire' });
      applyFog(ctx, '#22112a', 7);
      gradientFromSeeds(ctx, nodes.map((n, idx) => ({ ...n, paletteIndex: idx })), ['#fff2e1','#ffd9f7','#c9f6ff']);
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.53, blockDimMixed: 0.7, tags: ['forge','ether','fire','network'] }
  };

  const holoMarsh = {
    id: 'holo-marsh',
    name: 'ホロ幻湿原',
    nameKey: "dungeon.types.holo_marsh.name",
    description: 'ホログラムが漂う湿原層。幻光の藻が地形を変化させる',
    descriptionKey: "dungeon.types.holo_marsh.description",

    algorithm(ctx){
      floodChannel(ctx, { x: Math.floor(ctx.width / 2), y: Math.floor(ctx.height / 2) }, ['#96ffe6','#c9fff2','#e4fffd'], { maxDepth: 500, width: 3, floorType: 'water' });
      carveVoronoi(ctx, scatterNodes(ctx, 18, 6, 4).map((s, idx) => ({ ...s, paletteIndex: idx })), sharedPalettes.cyber, { floorType: (x, y, seed) => seed.paletteIndex % 2 === 0 ? 'water' : 'normal' });
      applyCelestialRunes(ctx, ['#f0fff7','#e2f9ff','#ffeefb']);
      setDiagonalStrips(ctx, ['#c7fff2','#fff4f0','#d8f8ff'], 5);
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.58, blockDimMixed: 0.69, tags: ['marsh','hologram','water','bio'] }
  };

  const dreamParliament = {
    id: 'dream-parliament',
    name: '夢議会星殿',
    nameKey: "dungeon.types.dream_parliament.name",
    description: '星夢議会の議場。同心円と座席アーチが幾層にも重なり合う',
    descriptionKey: "dungeon.types.dream_parliament.description",

    algorithm(ctx){
      const center = { x: Math.floor(ctx.width / 2), y: Math.floor(ctx.height / 2) };
      ringCarve(ctx, center.x, center.y, 2, Math.floor(Math.min(ctx.width, ctx.height) / 3), { floorColor: '#fff0ff', floorType: 'normal' });
      carveLayeredSpirals(ctx, center, 12, ['#ffe6ff','#d9f5ff','#fff6d1'], { floorType: (x, y, layer) => layer % 4 === 0 ? 'portal' : 'normal' });
      applyCheckerHighlights(ctx, ['#f6e8ff','#d7eaff','#fff3df'], 6);
      sprinklePortals(ctx, ['#ffe1ff','#c8f3ff','#fff2d7']);
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.55, blockDimMixed: 0.72, tags: ['council','spiral','portal'] }
  };

  const warpGondola = {
    id: 'warp-gondola',
    name: 'ワープゴンドラ環道',
    nameKey: "dungeon.types.warp_gondola.name",
    description: 'ワープゴンドラが行き交う環状道。浮遊桟橋とゲートが連結する',
    descriptionKey: "dungeon.types.warp_gondola.description",

    algorithm(ctx){
      const ringCenter = { x: Math.floor(ctx.width / 2), y: Math.floor(ctx.height / 2) };
      ringCarve(ctx, ringCenter.x, ringCenter.y, 3, Math.min(ctx.width, ctx.height) / 2 - 3, { floorColor: '#f2e5ff', floorType: (x, y) => (x + y) % 4 === 0 ? 'portal' : 'normal' });
      const docks = scatterNodes(ctx, 18, 6, 3);
      connectNodes(ctx, docks, ['#ffe1ff','#c7f4ff','#fff1db'], { thickness: 1, floorType: 'normal' });
      sprinklePortals(ctx, ['#ffe8ff','#d0f6ff','#fff6d5']);
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.62, blockDimMixed: 0.78, tags: ['transport','ring','portal'] }
  };

  const chronoSanctuary = {
    id: 'chrono-sanctuary',
    name: 'クロノサンクチュアリ',
    nameKey: "dungeon.types.chrono_sanctuary.name",
    description: '時間を祀る聖域。多層時刻盤と鐘楼が共鳴する',
    descriptionKey: "dungeon.types.chrono_sanctuary.description",

    algorithm(ctx){
      carveNestedRectangles(ctx, ['#ffe1d6','#ffd4f2','#d7f6ff'], { padding: 3, step: 4, floorType: 'normal' });
      const nodes = scatterNodes(ctx, 18, 6, 4);
      connectNodes(ctx, nodes, sharedPalettes.chrono, { thickness: 1, floorType: (tile, a, b) => (tile.x + tile.y) % 5 === 0 ? 'fire' : 'normal' });
      radiateSpears(ctx, { x: Math.floor(ctx.width / 2), y: Math.floor(ctx.height / 2) }, 40, Math.max(ctx.width, ctx.height), ['#ffe8d8','#ffd5f5','#d8f4ff'], { floorType: 'normal', typeInterval: 10 });
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.51, blockDimMixed: 0.68, tags: ['temple','time','fire'] }
  };

  const nebulaDucts = {
    id: 'nebula-ducts',
    name: 'ネビュラ導管街',
    nameKey: "dungeon.types.nebula_ducts.name",
    description: '星雲導管が都市を巡る層。導管と噴出口が交差する霧街',
    descriptionKey: "dungeon.types.nebula_ducts.description",

    algorithm(ctx){
      const nodes = scatterNodes(ctx, 26, 5, 3);
      followFlowField(ctx, createFlowField(ctx.width, ctx.height), 220, ['#9bd9ff','#c5f1ff','#ffe8f8'], { thickness: 1, floorType: 'normal' });
      scatterPlanetoids(ctx, 20, ['#f0fbff','#d5efff','#ffe5fb'], { radiusRange: [2, 4], floorType: 'normal' });
      applyFog(ctx, '#122032', 6);
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.58, blockDimMixed: 0.73, tags: ['city','conduit','fog'] }
  };

  const singularityCanopy = {
    id: 'singularity-canopy',
    name: 'シンギュラリティ樹冠',
    nameKey: "dungeon.types.singularity_canopy.name",
    description: '重力が反転する樹冠都市。量子樹液が光路をつくり、樹冠に都市が編み込まれる',
    descriptionKey: "dungeon.types.singularity_canopy.description",

    algorithm(ctx){
      const seed = Math.floor(ctx.random() * 9000);
      const heightMap = createHeightMap(ctx.width, ctx.height, { frequency: 0.07 + ctx.random() * 0.05, octaves: 4, seed });
      applyHeightMapLayers(ctx, heightMap, sharedPalettes.lumen, {
        floorTypes: ['normal','normal',(x, y, n) => n > 0.62 ? 'ice' : 'normal',(x, y, n) => n > 0.82 ? 'portal' : 'ice']
      });
      const center = { x: Math.floor(ctx.width / 2), y: Math.floor(ctx.height / 2) };
      fractalBloom(ctx, center, 5, 4, sharedPalettes.obsidian, { floorType: (x, y, level) => level % 2 === 0 ? 'portal' : 'normal' });
      const nodes = scatterNodes(ctx, 18, 6, 4);
      ribbonStrandNetwork(ctx, nodes, sharedPalettes.neon, { thickness: 2, floorType: (tile, i, j) => (i + j) % 4 === 0 ? 'ice' : 'normal' });
      propagateWavefront(ctx, nodes.slice(0, 10), sharedPalettes.aurora, { waveStep: 4, iterations: 520, floorType: (x, y, dist) => dist % 9 === 0 ? 'portal' : 'normal' });
      embedGlyphSequence(ctx, glyphAtlas.singularity, nodes.slice(0, 6), { floorColor: '#ffffff', floorType: 'portal' });
      markPerimeter(ctx, 1, '#1c0f2d');
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.59, blockDimMixed: 0.83, tags: ['forest','singularity','portal','arcane'] }
  };

  const chronoPulseTransit = {
    id: 'chrono-pulse-transit',
    name: 'クロノパルス輸送環',
    nameKey: "dungeon.types.chrono_pulse_transit.name",
    description: '時間脈を滑るトラムと多層リング。脈動するホログラムが路線を導く',
    descriptionKey: "dungeon.types.chrono_pulse_transit.description",

    algorithm(ctx){
      const nodes = scatterNodes(ctx, 22, 5, 3);
      const field = createFlowField(ctx.width, ctx.height);
      followFlowField(ctx, field, 240, sharedPalettes.pulse, { thickness: 1, floorType: (x, y, steps) => steps % 12 === 0 ? 'portal' : 'normal' });
      carveCircuit(ctx, nodes, 2, sharedPalettes.chrono, { floorType: (tile, idx) => idx % 3 === 0 ? 'fire' : 'normal' });
      propagateWavefront(ctx, nodes.slice(0, 12), sharedPalettes.pulse, { waveStep: 3, iterations: 480, floorType: (x, y, dist) => dist % 10 === 0 ? 'ice' : 'normal' });
      embedGlyphSequence(ctx, glyphAtlas.harmonic, nodes.slice(0, 6), { floorColor: '#fef9ff', floorType: 'portal' });
      markPerimeter(ctx, 2, '#372d4f');
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.61, blockDimMixed: 0.79, tags: ['transport','time','rail','pulse'] }
  };

  const auroraManufactorum = {
    id: 'aurora-manufactorum',
    name: 'オーロラ製造都市',
    nameKey: "dungeon.types.aurora_manufactorum.name",
    description: '極光炉と浮遊クレーンが交差する製造層。彩光のラインが機構を結ぶ',
    descriptionKey: "dungeon.types.aurora_manufactorum.description",

    algorithm(ctx){
      const hubs = scatterNodes(ctx, 16, 6, 4);
      carveHexGrid(ctx, sharedPalettes.forge, { radius: 4, floorType: 'normal' });
      scatterPylons(ctx, ['#ffe2bd','#ffd8ff','#bff8ff'], { amount: 28, floorType: 'normal' });
      ribbonStrandNetwork(ctx, hubs, sharedPalettes.aurora, { thickness: 2, floorType: (tile, i, j) => (i + j) % 2 === 0 ? 'fire' : 'normal' });
      const pivot = hubs[Math.floor(ctx.random() * hubs.length)] || { x: Math.floor(ctx.width / 2), y: Math.floor(ctx.height / 2) };
      fractalBloom(ctx, pivot, 4, 3, sharedPalettes.cyber, { floorType: (x, y, level) => level % 2 === 0 ? 'fire' : 'normal' });
      embedGlyphSequence(ctx, glyphAtlas.turbines, hubs.slice(0, 5), { floorColor: '#fff5e6', floorType: 'fire' });
      applyVerticalBands(ctx, ['#ffe9d6','#ffe1ff','#c9f9ff'], 6);
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.64, blockDimMixed: 0.82, tags: ['factory','aurora','mechanical','fire'] }
  };

  const dreamTurbineGardens = {
    id: 'dream-turbine-gardens',
    name: '夢風タービン庭苑',
    nameKey: "dungeon.types.dream_turbine_gardens.name",
    description: '風夢タービンが浮遊花園を撹拌する。睡蓮の光と風洞が重なる庭苑層',
    descriptionKey: "dungeon.types.dream_turbine_gardens.description",

    algorithm(ctx){
      const map = createHeightMap(ctx.width, ctx.height, { frequency: 0.06 + ctx.random() * 0.03, octaves: 5, seed: Math.floor(ctx.random() * 1000) });
      applyHeightMapLayers(ctx, map, sharedPalettes.reef, {
        floorTypes: ['normal','water',(x, y, n) => n > 0.66 ? 'ice' : 'water',(x, y, n) => n > 0.85 ? 'portal' : 'ice']
      });
      const anchors = scatterNodes(ctx, 20, 5, 3);
      anchorSpiral(ctx, { x: Math.floor(ctx.width / 2), y: Math.floor(ctx.height / 2) }, sharedPalettes.dream, { turns: 6, floorType: (x, y, t) => t > 0.6 ? 'portal' : 'normal' });
      ribbonStrandNetwork(ctx, anchors, sharedPalettes.ether, { thickness: 1, floorType: (tile, i, j) => (i + j) % 5 === 0 ? 'ice' : 'normal' });
      embedGlyphSequence(ctx, glyphAtlas.turbines, anchors.slice(0, 6), { floorColor: '#ffffff', floorType: 'ice' });
      applyFog(ctx, '#dff9ff', 8);
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.52, blockDimMixed: 0.74, tags: ['garden','wind','dream','portal'] }
  };

  const prismOracleVault = {
    id: 'prism-oracle-vault',
    name: 'プリズム神託庫',
    nameKey: "dungeon.types.prism_oracle_vault.name",
    description: '光の神託を格納した聖蔵。屈折回廊と光の井戸が交差する',
    descriptionKey: "dungeon.types.prism_oracle_vault.description",

    algorithm(ctx){
      const center = { x: Math.floor(ctx.width / 2), y: Math.floor(ctx.height / 2) };
      carveNestedRectangles(ctx, ['#f0e8ff','#ffe8f2','#fff7d6'], { padding: 3, step: 3, floorType: 'normal' });
      carveRadialStars(ctx, center, 32, sharedPalettes.prism, { floorType: (x, y, step) => step % 6 === 0 ? 'portal' : 'normal' });
      const wells = scatterNodes(ctx, 14, 6, 4);
      propagateWavefront(ctx, wells, sharedPalettes.lumen, { waveStep: 5, iterations: 400, floorType: (x, y, dist) => dist % 8 === 0 ? 'ice' : 'normal' });
      embedGlyphSequence(ctx, glyphAtlas.singularity, wells.slice(0, 4), { floorColor: '#ffffff', floorType: 'portal' });
      applyCheckerHighlights(ctx, ['#fff1ff','#dceaff','#fff9d6'], 6);
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.56, blockDimMixed: 0.77, tags: ['vault','prism','oracle','portal'] }
  };

  const nebularCascadePlaza = {
    id: 'nebular-cascade-plaza',
    name: '星雲カスケード広場',
    nameKey: "dungeon.types.nebular_cascade_plaza.name",
    description: '星雲の滝と浮遊層が交差する広場都市。霧と水脈が多層に重なる',
    descriptionKey: "dungeon.types.nebular_cascade_plaza.description",

    algorithm(ctx){
      const map = createHeightMap(ctx.width, ctx.height, { frequency: 0.05 + ctx.random() * 0.03, octaves: 5, seed: Math.floor(ctx.random() * 500) });
      applyHeightMapLayers(ctx, map, sharedPalettes.nova, {
        floorTypes: ['normal','normal',(x, y, n) => n > 0.5 ? 'water' : 'normal',(x, y, n) => n > 0.75 ? 'portal' : 'water']
      });
      const cascades = scatterNodes(ctx, 18, 5, 3);
      const source = cascades[0] || { x: Math.floor(ctx.width / 2), y: 2 };
      floodChannel(ctx, source, sharedPalettes.reef, { maxDepth: 500, width: 2, floorType: (x, y, depth) => depth % 7 === 0 ? 'water' : 'normal' });
      ribbonStrandNetwork(ctx, cascades, sharedPalettes.aurora, { thickness: 1, floorType: (tile, i, j) => (i + j) % 6 === 0 ? 'ice' : 'normal' });
      fillNebula(ctx, ['#b4f6ff','#f0ddff','#ffe5f1'], { scale: 11, layers: 4 });
      applyFog(ctx, '#1d233a', 7);
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.54, blockDimMixed: 0.7, tags: ['city','cascade','water','nebula'] }
  };

  const astralChorusWells = {
    id: 'astral-chorus-wells',
    name: '星界合唱井戸',
    nameKey: "dungeon.types.astral_chorus_wells.name",
    description: '星界の歌声が反響する井戸群。波紋と共鳴が交差する聖域',
    descriptionKey: "dungeon.types.astral_chorus_wells.description",

    algorithm(ctx){
      const center = { x: Math.floor(ctx.width / 2), y: Math.floor(ctx.height / 2) };
      carveRadialStars(ctx, center, 48, sharedPalettes.astral, { floorType: (x, y, step) => step % 10 === 0 ? 'portal' : 'normal' });
      const wells = scatterNodes(ctx, 20, 5, 4);
      propagateWavefront(ctx, wells, sharedPalettes.ether, { waveStep: 6, iterations: 520, floorType: (x, y, dist) => dist % 7 === 0 ? 'ice' : 'normal' });
      embedGlyphSequence(ctx, glyphAtlas.harmonic, wells.slice(0, 8), { floorColor: '#fdfaff', floorType: 'portal' });
      rippleIntersections(ctx, sharedPalettes.aurora, { rings: 8, spacing: 4 });
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.6, blockDimMixed: 0.76, tags: ['temple','astral','sound','portal'] }
  };

  const mirroredSpireSanctum = {
    id: 'mirrored-spire-sanctum',
    name: '鏡晶尖塔聖堂',
    nameKey: "dungeon.types.mirrored_spire_sanctum.name",
    description: '鏡面尖塔が層をなす聖堂。光の回廊が反射し続ける',
    descriptionKey: "dungeon.types.mirrored_spire_sanctum.description",

    algorithm(ctx){
      const heightMap = createHeightMap(ctx.width, ctx.height, { frequency: 0.08, octaves: 4, seed: Math.floor(ctx.random() * 1200) });
      applyHeightMapLayers(ctx, heightMap, sharedPalettes.glacial, {
        floorTypes: ['normal','normal',(x, y, n) => n > 0.68 ? 'ice' : 'normal',(x, y, n) => n > 0.84 ? 'portal' : 'ice']
      });
      const center = { x: Math.floor(ctx.width / 2), y: Math.floor(ctx.height / 2) };
      anchorSpiral(ctx, center, sharedPalettes.prism, { turns: 7, floorType: (x, y, t) => t > 0.55 ? 'ice' : 'normal' });
      carveLayeredSpirals(ctx, center, 8, sharedPalettes.glyph, { floorType: (x, y, layer) => layer % 2 === 0 ? 'portal' : 'normal' });
      applyCheckerHighlights(ctx, ['#e2f1ff','#fff0ff','#fdfbe7'], 4);
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.57, blockDimMixed: 0.8, tags: ['temple','mirror','ice','portal'] }
  };

  const technoSylvanHelix = {
    id: 'techno-sylvan-helix',
    name: 'テクノ森螺旋',
    nameKey: "dungeon.types.techno_sylvan_helix.name",
    description: 'バイオルミナスの森と量子回路が螺旋を描く居住層',
    descriptionKey: "dungeon.types.techno_sylvan_helix.description",

    algorithm(ctx){
      const nodes = scatterNodes(ctx, 24, 5, 3);
      carveLayeredSpirals(ctx, { x: Math.floor(ctx.width / 2), y: Math.floor(ctx.height / 2) }, 9, sharedPalettes.verdant, { floorType: (x, y, layer) => layer % 3 === 0 ? 'poison' : 'normal' });
      ribbonStrandNetwork(ctx, nodes, sharedPalettes.cyber, { thickness: 1, floorType: (tile, i, j) => (i + j) % 4 === 0 ? 'ice' : 'normal' });
      quantumGrid(ctx, sharedPalettes.neon, { spacing: 6, jitter: 2 });
      propagateWavefront(ctx, nodes.slice(0, 10), sharedPalettes.verdant, { waveStep: 4, iterations: 520, floorType: (x, y, dist) => dist % 11 === 0 ? 'poison' : 'normal' });
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.58, blockDimMixed: 0.78, tags: ['forest','tech','spiral','poison'] }
  };

  const chronoRiftTramway = {
    id: 'chrono-rift-tramway',
    name: 'クロノリフト路線',
    nameKey: "dungeon.types.chrono_rift_tramway.name",
    description: '時間裂け目を縫う昇降トラム。リング状のゲートが上下階層を束ねる',
    descriptionKey: "dungeon.types.chrono_rift_tramway.description",

    algorithm(ctx){
      const rnd = ctx.random;
      const center = { x: Math.floor(ctx.width / 2), y: Math.floor(ctx.height / 2) };
      for(let r = 2; r < Math.min(ctx.width, ctx.height) / 2 - 1; r += 3){
        ringCarve(ctx, center.x, center.y, r, r + 1, { floorColor: choose(sharedPalettes.chrono, rnd), floorType: r % 2 === 0 ? 'portal' : 'normal' });
      }
      const nodes = scatterNodes(ctx, 16, 5, 3);
      ribbonStrandNetwork(ctx, nodes, sharedPalettes.pulse, { thickness: 1, floorType: (tile, i, j) => (i + j) % 3 === 0 ? 'portal' : 'normal' });
      propagateWavefront(ctx, nodes.slice(0, 8), sharedPalettes.chrono, { waveStep: 3, iterations: 360, floorType: (x, y, dist) => dist % 12 === 0 ? 'fire' : 'normal' });
      embedGlyphSequence(ctx, glyphAtlas.harmonic, nodes.slice(0, 5), { floorColor: '#fff3f3', floorType: 'portal' });
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.6, blockDimMixed: 0.78, tags: ['transport','ring','time','portal'] }
  };

  const voidglassEstuary = {
    id: 'voidglass-estuary',
    name: '虚玻の河口',
    nameKey: "dungeon.types.voidglass_estuary.name",
    description: '虚無と光の河口都市。透徹した水脈と浮遊堤が交わる',
    descriptionKey: "dungeon.types.voidglass_estuary.description",

    algorithm(ctx){
      const map = createHeightMap(ctx.width, ctx.height, { frequency: 0.05, octaves: 5, seed: Math.floor(ctx.random() * 3000) });
      applyHeightMapLayers(ctx, map, sharedPalettes.glacial, {
        floorTypes: ['normal','water',(x, y, n) => n > 0.6 ? 'ice' : 'water',(x, y, n) => n > 0.8 ? 'portal' : 'ice']
      });
      const planetoids = scatterNodes(ctx, 14, 6, 3);
      scatterPlanetoids(ctx, 18, ['#f2f8ff','#dceeff','#ffe6ff'], { radiusRange: [2, 4], floorType: 'normal' });
      propagateWavefront(ctx, planetoids, sharedPalettes.midnight, { waveStep: 4, iterations: 460, floorType: (x, y, dist) => dist % 13 === 0 ? 'portal' : 'normal' });
      sprinklePortals(ctx, ['#e4f3ff','#ffeaff','#fff5db']);
      applyFog(ctx, '#0c182b', 10);
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.53, blockDimMixed: 0.71, tags: ['water','void','city','portal'] }
  };

  const harmonicDreamArtery = {
    id: 'harmonic-dream-artery',
    name: '調律夢動脈',
    nameKey: "dungeon.types.harmonic_dream_artery.name",
    description: '夢動脈が共鳴し、音律が光と交差する調律回廊',
    descriptionKey: "dungeon.types.harmonic_dream_artery.description",

    algorithm(ctx){
      const splinePoints = [
        { x: 2, y: Math.floor(ctx.height / 2) },
        { x: Math.floor(ctx.width / 3), y: 2 },
        { x: Math.floor(ctx.width * 2 / 3), y: ctx.height - 3 },
        { x: ctx.width - 3, y: Math.floor(ctx.height / 2) }
      ];
      carveSpline(ctx, splinePoints, 2, sharedPalettes.dream, { floorType: 'normal', jitter: 1.5 });
      const nodes = scatterNodes(ctx, 24, 4, 3);
      ribbonStrandNetwork(ctx, nodes, sharedPalettes.glyph, { thickness: 1, floorType: (tile, i, j) => (i + j) % 4 === 0 ? 'portal' : 'normal' });
      propagateWavefront(ctx, nodes.slice(0, 12), sharedPalettes.ether, { waveStep: 5, iterations: 540, floorType: (x, y, dist) => dist % 9 === 0 ? 'ice' : 'normal' });
      embedGlyphSequence(ctx, glyphAtlas.harmonic, nodes.slice(0, 10), { floorColor: '#fff6ff', floorType: 'portal' });
      applyCheckerHighlights(ctx, ['#fdf2ff','#d8f7ff','#fff6d9'], 7);
      ctx.ensureConnectivity();
    },

    mixin: { normalMixed: 0.62, blockDimMixed: 0.8, tags: ['music','dream','artery','portal'] }
  };
  const addonId = 'fantasical-sci-fi-dream-pack';
  const generators = [
    prismaticCities,
    neonOrbitarium,
    lucidReef,
    chronoForge,
    dreamwaySpirals,
    astralSymbiosis,
    mirroredCitadel,
    biotechSanctum,
    vaporwaveTransit,
    abyssalAurora,
    quantumDunes,
    chronoMirage,
    spectralArchive,
    dreamMesa,
    starlitWorkshop,
    orbitalRainforest,
    hypercubeAgora,
    chronoTideForge,
    stellarBloom,
    cosmicLabyrinth,
    luminalCascade,
    mythicOverpass,
    etherealForge,
    holoMarsh,
    dreamParliament,
    warpGondola,
    chronoSanctuary,
    nebulaDucts,
    singularityCanopy,
    chronoPulseTransit,
    auroraManufactorum,
    dreamTurbineGardens,
    prismOracleVault,
    nebularCascadePlaza,
    astralChorusWells,
    mirroredSpireSanctum,
    technoSylvanHelix,
    chronoRiftTramway,
    voidglassEstuary,
    harmonicDreamArtery
  ];

  const blockThemes = [
    { prefix: 'prism_strider', name: 'Prism Strider', type: 'prismatic-cities', baseLevel: 10, sizeOffset: 0 },
    { prefix: 'orbit_gardener', name: 'Orbit Gardener', type: 'neon-orbitarium', baseLevel: 14, sizeOffset: 0 },
    { prefix: 'reef_phantom', name: 'Reef Phantom', type: 'lucid-reef', baseLevel: 12, sizeOffset: 0 },
    { prefix: 'chrono_mason', name: 'Chrono Mason', type: 'chrono-forge', baseLevel: 16, sizeOffset: 1 },
    { prefix: 'dream_weaver', name: 'Dream Weaver', type: 'dreamway-spirals', baseLevel: 11, sizeOffset: 0 },
    { prefix: 'symbiont_keeper', name: 'Symbiont Keeper', type: 'astral-symbiosis', baseLevel: 18, sizeOffset: 1 },
    { prefix: 'mirror_sentinel', name: 'Mirror Sentinel', type: 'mirrored-citadel', baseLevel: 15, sizeOffset: 0 },
    { prefix: 'bioengine_archon', name: 'Bioengine Archon', type: 'biotech-sanctum', baseLevel: 20, sizeOffset: 1 },
    { prefix: 'transit_conductor', name: 'Transit Conductor', type: 'vaporwave-transit', baseLevel: 22, sizeOffset: 1 },
    { prefix: 'abyssal_lantern', name: 'Abyssal Lantern', type: 'abyssal-aurora', baseLevel: 24, sizeOffset: 1 },
    { prefix: 'quantum_rider', name: 'Quantum Rider', type: 'quantum-dunes', baseLevel: 19, sizeOffset: 0 },
    { prefix: 'chrono_specter', name: 'Chrono Specter', type: 'chrono-mirage', baseLevel: 25, sizeOffset: 1 },
    { prefix: 'archive_curator', name: 'Archive Curator', type: 'spectral-archive', baseLevel: 21, sizeOffset: 0 },
    { prefix: 'mesa_walker', name: 'Mesa Walker', type: 'dream-mesa', baseLevel: 23, sizeOffset: 0 },
    { prefix: 'stellar_artisan', name: 'Stellar Artisan', type: 'starlit-workshop', baseLevel: 26, sizeOffset: 1 },
    { prefix: 'singularity_canopy', name: 'Singularity Canopy', type: 'singularity-canopy', baseLevel: 28, sizeOffset: 1 },
    { prefix: 'chrono_pulse_conductor', name: 'Chrono Pulse Conductor', type: 'chrono-pulse-transit', baseLevel: 30, sizeOffset: 1 },
    { prefix: 'aurora_fabricator', name: 'Aurora Fabricator', type: 'aurora-manufactorum', baseLevel: 32, sizeOffset: 1 },
    { prefix: 'dream_turbine', name: 'Dream Turbine Custodian', type: 'dream-turbine-gardens', baseLevel: 29, sizeOffset: 0 },
    { prefix: 'prism_oracle', name: 'Prism Oracle Keeper', type: 'prism-oracle-vault', baseLevel: 31, sizeOffset: 1 },
    { prefix: 'nebula_cascade', name: 'Nebula Cascade Marshal', type: 'nebular-cascade-plaza', baseLevel: 27, sizeOffset: 0 },
    { prefix: 'astral_chorus', name: 'Astral Chorus Cantor', type: 'astral-chorus-wells', baseLevel: 33, sizeOffset: 1 },
    { prefix: 'mirror_spire', name: 'Mirror Spire Warden', type: 'mirrored-spire-sanctum', baseLevel: 34, sizeOffset: 1 },
    { prefix: 'techno_helix', name: 'Techno Helix Ranger', type: 'techno-sylvan-helix', baseLevel: 29, sizeOffset: 0 },
    { prefix: 'chrono_rift_tram', name: 'Chrono Rift Tram Chief', type: 'chrono-rift-tramway', baseLevel: 35, sizeOffset: 1 },
    { prefix: 'voidglass_estuary', name: 'Voidglass Estuary Guide', type: 'voidglass-estuary', baseLevel: 28, sizeOffset: 0 },
    { prefix: 'harmonic_artery', name: 'Harmonic Artery Maestro', type: 'harmonic-dream-artery', baseLevel: 36, sizeOffset: 1 }
  ];

  const tierConfigs = [
    {
      key: 'blocks1',
      levelOffset: 0,
      levelStep: 5,
      sizeSeq: [0, 1, 0, 1, 1],
      depthSeq: [2, 2, 3, 2, 3],
      chestCycle: ['normal', 'more', 'less', 'more', 'normal'],
      weightBase: 1.45,
      weightStep: 0.07,
      includeBoss: true,
      bossBase: 5,
      bossSpacing: 5
    },
    {
      key: 'blocks2',
      levelOffset: 12,
      levelStep: 6,
      sizeSeq: [1, 1, 2, 1, 2],
      depthSeq: [2, 3, 3, 3, 4],
      chestCycle: ['normal', 'less', 'more', 'normal', 'less'],
      weightBase: 1.2,
      weightStep: 0.06,
      includeBoss: true,
      bossBase: 8,
      bossSpacing: 6
    },
    {
      key: 'blocks3',
      levelOffset: 26,
      levelStep: 7,
      sizeSeq: [1, 2, 2, 3, 2],
      depthSeq: [3, 4, 4, 5, 4],
      chestCycle: ['more', 'normal', 'less', 'normal', 'more'],
      weightBase: 1.05,
      weightStep: 0.05,
      includeBoss: true,
      bossBase: 12,
      bossSpacing: 6
    }
  ];

  const RANKS_PER_THEME = 5;

  function romanNumeral(n){
    const numerals = ['I','II','III','IV','V','VI','VII','VIII','IX','X'];
    return numerals[n - 1] || `${n}`;
  }

  function buildBlockEntry(theme, tier, index){
    const level = theme.baseLevel + tier.levelOffset + tier.levelStep * index;
    const size = theme.sizeOffset + tier.sizeSeq[index % tier.sizeSeq.length];
    const depth = tier.depthSeq[index % tier.depthSeq.length];
    const chest = tier.chestCycle[index % tier.chestCycle.length];
    const weight = Number((tier.weightBase - tier.weightStep * index).toFixed(2));
    const entry = {
      key: `${theme.prefix}_${tier.key}_${index + 1}`,
      name: `${theme.name} ${romanNumeral(index + 1)}`,
      level,
      size,
      depth,
      chest,
      type: theme.type,
      weight
    };
    if(tier.includeBoss){
      const start = tier.bossBase + index * 2;
      entry.bossFloors = [start, start + tier.bossSpacing, start + tier.bossSpacing * 2];
    }
    return entry;
  }

  const blockCatalog = tierConfigs.reduce((acc, tier) => {
    const collection = acc[tier.key];
    blockThemes.forEach(theme => {
      for(let i = 0; i < RANKS_PER_THEME; i++){
        collection.push(buildBlockEntry(theme, tier, i));
      }
    });
    return acc;
  }, { blocks1: [], blocks2: [], blocks3: [] });

  const blockDimensions = [
    { key: 'prismaverse', name: 'プリズマバース', baseLevel: 25 },
    { key: 'holoorbit', name: 'ホロオービット', baseLevel: 32 },
    { key: 'chronostream', name: 'クロノストリーム界', baseLevel: 38 },
    { key: 'dreamwell', name: 'ドリームウェル界層', baseLevel: 28 },
    { key: 'stellarforge', name: 'ステラフォージ界', baseLevel: 42 },
    { key: 'nebular_link', name: 'ネビュラリンク界', baseLevel: 36 },
    { key: 'singularity_arboria', name: 'シンギュラリティ樹冠界', baseLevel: 44 },
    { key: 'pulse_transit_loop', name: 'クロノパルス環界', baseLevel: 46 },
    { key: 'aurora_fabricarium', name: 'オーロラ製造界', baseLevel: 48 },
    { key: 'dream_turbine_biosphere', name: '夢風タービン圏', baseLevel: 40 },
    { key: 'astral_cantor_reach', name: '星界カントル界', baseLevel: 47 },
    { key: 'voidglass_delta', name: '虚玻デルタ界', baseLevel: 43 }
  ];

  const blocks = {
    dimensions: blockDimensions,
    blocks1: blockCatalog.blocks1,
    blocks2: blockCatalog.blocks2,
    blocks3: blockCatalog.blocks3
  };

  const blockTotals = blockThemes.length * RANKS_PER_THEME;
  if(blocks.blocks1.length !== blockTotals || blocks.blocks2.length !== blockTotals || blocks.blocks3.length !== blockTotals){
    console.warn('Unexpected block generation mismatch for Fantasical pack');
  }

  window.registerDungeonAddon({
    id: addonId,
    name: 'ファンタジカルと近未来をテーマにした夢の世界パック',
    nameKey: "dungeon.packs.fantasical_sci_fi_dream_pack.name",
    version: '3.0.0',
    blocks,
    generators
  });
})();

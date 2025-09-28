(function(){
  const addonId = 'fantasical_sci_fi_dream_pack';

  // ---------------------------------------------------------------------------
  // Utility helpers for large scale dreamscape generation
  // ---------------------------------------------------------------------------
  function shuffle(arr, rng){
    const a = arr.slice();
    for(let i=a.length-1;i>0;i--){
      const j = Math.floor(rng() * (i+1));
      [a[i],a[j]] = [a[j],a[i]];
    }
    return a;
  }

  function makeNoiseSampler(random, layers=5){
    const offsets = [];
    for(let i=0;i<layers;i++){
      offsets.push({
        ox: random()*1000,
        oy: random()*1000,
        freq: Math.pow(2,i) * 4,
        amp: 1 / Math.pow(1.8, i)
      });
    }
    return function(x,y){
      let value = 0;
      for(const o of offsets){
        value += Math.sin((x+o.ox)/o.freq) * Math.cos((y+o.oy)/o.freq) * o.amp;
      }
      return value / layers;
    };
  }

  function carveEllipse(ctx, cx, cy, rx, ry, opts={}){
    const { floorColor, wallColor, floorType } = opts;
    const rx2 = rx * rx;
    const ry2 = ry * ry;
    for(let y = Math.max(1, cy - ry - 2); y <= Math.min(ctx.height-2, cy + ry + 2); y++){
      for(let x = Math.max(1, cx - rx - 2); x <= Math.min(ctx.width-2, cx + rx + 2); x++){
        const dx = x - cx;
        const dy = y - cy;
        if((dx*dx)/rx2 + (dy*dy)/ry2 <= 1){
          ctx.set(x,y,0);
          if(floorColor) ctx.setFloorColor(x,y,floorColor);
          if(wallColor) ctx.setWallColor(x,y,wallColor);
          if(floorType) ctx.setFloorType(x,y,floorType);
        }
      }
    }
  }

  function carvePolygon(ctx, points, opts={}){
    const { floorColor='#fff', floorType='normal' } = opts;
    if(points.length < 3) return;
    let minX = ctx.width, maxX = 0, minY = ctx.height, maxY = 0;
    for(const p of points){
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    }
    for(let y=Math.max(1, Math.floor(minY)); y<=Math.min(ctx.height-2, Math.ceil(maxY)); y++){
      for(let x=Math.max(1, Math.floor(minX)); x<=Math.min(ctx.width-2, Math.ceil(maxX)); x++){
        let inside=false;
        for(let i=0,j=points.length-1; i<points.length; j=i++){
          const xi = points[i].x, yi = points[i].y;
          const xj = points[j].x, yj = points[j].y;
          const intersect = ((yi>y)!==(yj>y)) && (x < (xj-xi)*(y-yi)/(yj-yi+0.0001)+xi);
          if(intersect) inside = !inside;
        }
        if(inside){
          ctx.set(x,y,0);
          ctx.setFloorColor(x,y,floorColor);
          ctx.setFloorType(x,y,floorType);
        }
      }
    }
  }

  function carveSpline(ctx, pts, thickness, opts={}){
    const { floorColor, floorType } = opts;
    if(pts.length < 2) return;
    const samples = [];
    for(let i=0;i<pts.length-1;i++){
      const a = pts[i];
      const b = pts[i+1];
      const steps = Math.max(Math.abs(a.x-b.x), Math.abs(a.y-b.y)) * 2;
      for(let t=0;t<=steps;t++){
        const ratio = t/steps;
        const x = a.x + (b.x-a.x)*ratio;
        const y = a.y + (b.y-a.y)*ratio;
        samples.push({x,y});
      }
    }
    for(const s of samples){
      const radius = thickness/2;
      for(let y=Math.max(1, Math.floor(s.y-radius)); y<=Math.min(ctx.height-2, Math.ceil(s.y+radius)); y++){
        for(let x=Math.max(1, Math.floor(s.x-radius)); x<=Math.min(ctx.width-2, Math.ceil(s.x+radius)); x++){
          if(Math.hypot(x-s.x, y-s.y) <= radius){
            ctx.set(x,y,0);
            if(floorColor) ctx.setFloorColor(x,y,floorColor);
            if(floorType) ctx.setFloorType(x,y,floorType);
          }
        }
      }
    }
  }

  function sprinkleColors(ctx, points, colorA, colorB){
    for(const p of points){
      const radius = p.r;
      for(let y = Math.max(1, p.y - radius); y <= Math.min(ctx.height-2, p.y + radius); y++){
        for(let x = Math.max(1, p.x - radius); x <= Math.min(ctx.width-2, p.x + radius); x++){
          if(ctx.get(x,y)===0){
            const dist = Math.hypot(x-p.x, y-p.y);
            if(dist <= radius){
              const t = dist / radius;
              const color = blend(colorA, colorB, t);
              ctx.setFloorColor(x,y,color);
            }
          }
        }
      }
    }
  }

  function paintRadiance(ctx, regions, colors){
    const len = colors.length;
    for(let i=0;i<regions.length;i++){
      const reg = regions[i];
      const color = colors[i % len];
      for(let y=Math.max(1, reg.y-reg.r); y<=Math.min(ctx.height-2, reg.y+reg.r); y++){
        for(let x=Math.max(1, reg.x-reg.r); x<=Math.min(ctx.width-2, reg.x+reg.r); x++){
          if(ctx.get(x,y)===0 && Math.hypot(x-reg.x, y-reg.y) <= reg.r){
            ctx.setFloorColor(x,y, color);
          }
        }
      }
    }
  }

  function blend(c1, c2, t){
    const a = hexToRgb(c1);
    const b = hexToRgb(c2);
    const r = Math.round(a.r + (b.r - a.r) * t);
    const g = Math.round(a.g + (b.g - a.g) * t);
    const bl = Math.round(a.b + (b.b - a.b) * t);
    return `rgb(${r},${g},${bl})`;
  }

  function hexToRgb(hex){
    const h = hex.replace('#','');
    const bigint = parseInt(h, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255
    };
  }

  function createConnector(ctx, nodes, rng, opts={}){
    const { color='#eef', type='normal', thickness=1 } = opts;
    for(let i=0;i<nodes.length;i++){
      const a = nodes[i];
      const b = nodes[(i+1)%nodes.length];
      const path = ctx.aStar({x:a.x,y:a.y},{x:b.x,y:b.y},{ allowDiagonals:true, heuristic:'euclidean' });
      if(path && path.length){
        ctx.carvePath(path, thickness);
        for(const step of path){
          if(ctx.inBounds(step.x,step.y)){
            ctx.setFloorColor(step.x, step.y, color);
            ctx.setFloorType(step.x, step.y, type);
          }
        }
      }else{
        let x=a.x,y=a.y;
        while(x!==b.x || y!==b.y){
          if(ctx.inBounds(x,y)){
            ctx.set(x,y,0);
            ctx.setFloorColor(x,y,color);
            ctx.setFloorType(x,y,type);
          }
          if(rng()<0.5) x += Math.sign(b.x-x);
          else y += Math.sign(b.y-y);
        }
      }
    }
  }

  function branchWeave(ctx, origin, branchCount, rng, opts={}){
    const { floorColor='#fff', floorType='normal', length=20, drift=0.6 } = opts;
    const endpoints = [];
    for(let i=0;i<branchCount;i++){
      let x = origin.x;
      let y = origin.y;
      let dir = rng()*Math.PI*2;
      for(let step=0; step<length; step++){
        if(!ctx.inBounds(Math.round(x), Math.round(y))) break;
        const rx = Math.round(x);
        const ry = Math.round(y);
        ctx.set(rx, ry, 0);
        ctx.setFloorColor(rx, ry, floorColor);
        ctx.setFloorType(rx, ry, floorType);
        dir += (rng()-0.5) * drift;
        x += Math.cos(dir);
        y += Math.sin(dir);
      }
      endpoints.push({x:Math.round(x), y:Math.round(y)});
    }
    return endpoints;
  }

  function floodDreamMist(ctx, rng, colorPool){
    const seeds = [];
    const count = Math.max(6, Math.floor(ctx.width*ctx.height/120));
    for(let i=0;i<count;i++){
      seeds.push({
        x: 2 + Math.floor(rng()*(ctx.width-4)),
        y: 2 + Math.floor(rng()*(ctx.height-4)),
        color: colorPool[i % colorPool.length]
      });
    }
    for(const s of seeds){
      const queue = [{x:s.x,y:s.y}];
      const visited = new Set();
      while(queue.length){
        const node = queue.shift();
        const key = `${node.x},${node.y}`;
        if(visited.has(key)) continue;
        visited.add(key);
        if(ctx.inBounds(node.x,node.y) && ctx.get(node.x,node.y)===0){
          ctx.setFloorColor(node.x,node.y,s.color);
          ctx.setFloorType(node.x,node.y, rng()<0.15 ? 'poison' : 'normal');
          const dirs = shuffle([
            {x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}
          ], rng);
          for(const d of dirs){
            if(rng()<0.75) queue.push({x:node.x+d.x, y:node.y+d.y});
          }
        }
      }
    }
  }

  function distributeStructures(ctx, candidates, rng, options={}){
    const { maxCount=20, tags=[], radius=6 } = options;
    const placed=[];
    let tries = 0;
    while(placed.length<maxCount && tries<maxCount*15){
      tries++;
      const x = 2 + Math.floor(rng()*(ctx.width-4));
      const y = 2 + Math.floor(rng()*(ctx.height-4));
      if(ctx.get(x,y)!==0) continue;
      if(placed.some(p => Math.hypot(p.x-x, p.y-y) < radius)) continue;
      const structure = ctx.structures.pick({ addonId, tags }, rng);
      if(!structure) break;
      ctx.structures.place(structure, x, y, {
        rotation: rng()*360,
        flipH: rng()<0.5,
        flipV: rng()<0.5,
        strict: false,
        scale: 0.9 + rng()*0.6
      });
      placed.push({x,y});
    }
  }

  function applyWallHighlights(ctx, rng, colors){
    for(let y=1;y<ctx.height-1;y++){
      for(let x=1;x<ctx.width-1;x++){
        if(ctx.get(x,y)===1 && rng()<0.07){
          ctx.setWallColor(x,y, colors[Math.floor(rng()*colors.length)]);
        }
      }
    }
  }

  function runCellularAutomata(ctx, rng, options={}){
    const {
      fill=0.48,
      iterations=5,
      birth=5,
      surviveLow=4,
      surviveHigh=8,
      floorColor='#f8fafc',
      floorType='normal'
    } = options;
    const width = ctx.width-2;
    const height = ctx.height-2;
    const grid = Array.from({length:height}, () => Array(width).fill(0));
    for(let y=0;y<height;y++){
      for(let x=0;x<width;x++){
        grid[y][x] = rng()<fill ? 1 : 0;
      }
    }
    const dirs = [
      [-1,-1],[0,-1],[1,-1],
      [-1,0],        [1,0],
      [-1,1],[0,1],[1,1]
    ];
    for(let iter=0; iter<iterations; iter++){
      const next = Array.from({length:height}, () => Array(width).fill(0));
      for(let y=0;y<height;y++){
        for(let x=0;x<width;x++){
          let neighbors = 0;
          for(const d of dirs){
            const nx = x + d[0];
            const ny = y + d[1];
            if(nx>=0 && ny>=0 && nx<width && ny<height){
              neighbors += grid[ny][nx];
            }else{
              neighbors++;
            }
          }
          if(grid[y][x]){
            next[y][x] = neighbors>=surviveLow && neighbors<=surviveHigh ? 1 : 0;
          }else{
            next[y][x] = neighbors>birth ? 1 : 0;
          }
        }
      }
      for(let y=0;y<height;y++){
        for(let x=0;x<width;x++){
          grid[y][x] = next[y][x];
        }
      }
    }
    const carved = [];
    for(let y=0;y<height;y++){
      for(let x=0;x<width;x++){
        if(grid[y][x]){
          const gx = x+1;
          const gy = y+1;
          ctx.set(gx, gy, 0);
          ctx.setFloorColor(gx, gy, floorColor);
          ctx.setFloorType(gx, gy, floorType);
          carved.push({x:gx, y:gy});
        }
      }
    }
    return carved;
  }

  function generateFractalVeins(ctx, origin, rng, options={}){
    const {
      iterations=6,
      baseLength=16,
      spread=1.4,
      attenuation=0.72,
      floorColor='#f97316',
      floorType='normal'
    } = options;
    const branches = [];
    const queue = [{
      x: origin.x,
      y: origin.y,
      dir: rng()*Math.PI*2,
      length: baseLength,
      depth: 0
    }];
    while(queue.length){
      const node = queue.shift();
      let px = node.x;
      let py = node.y;
      for(let step=0; step<node.length; step++){
        const gx = Math.round(px);
        const gy = Math.round(py);
        if(!ctx.inBounds(gx, gy)) break;
        ctx.set(gx, gy, 0);
        ctx.setFloorColor(gx, gy, floorColor);
        ctx.setFloorType(gx, gy, floorType);
        px += Math.cos(node.dir);
        py += Math.sin(node.dir);
        node.dir += (rng()-0.5)*0.3;
      }
      branches.push({x:Math.round(px), y:Math.round(py)});
      if(node.depth < iterations){
        const children = 2 + Math.floor(rng()*2);
        for(let i=0;i<children;i++){
          queue.push({
            x: px,
            y: py,
            dir: node.dir + (rng()-0.5)*spread,
            length: node.length * attenuation,
            depth: node.depth + 1
          });
        }
      }
    }
    return branches;
  }

  function carveHexagon(ctx, cx, cy, radius, opts={}){
    const points = [];
    for(let i=0;i<6;i++){
      const angle = Math.PI/3*i + Math.PI/6;
      points.push({
        x: cx + Math.cos(angle)*radius,
        y: cy + Math.sin(angle)*radius
      });
    }
    carvePolygon(ctx, points, opts);
  }

  function applyHarmonicGradient(ctx, anchors, palette, power=0.9){
    if(!anchors || !anchors.length) return;
    const maxDistance = Math.sqrt(ctx.width*ctx.width + ctx.height*ctx.height);
    for(let y=1;y<ctx.height-1;y++){
      for(let x=1;x<ctx.width-1;x++){
        if(ctx.get(x,y)!==0) continue;
        let minDist = Infinity;
        for(const a of anchors){
          minDist = Math.min(minDist, Math.hypot(x-a.x, y-a.y));
        }
        const scaled = Math.pow(Math.min(1, minDist / maxDistance), power);
        const pos = scaled * (palette.length-1);
        const idx = Math.floor(pos);
        const frac = pos - idx;
        const color = idx >= palette.length-1 ? palette[palette.length-1] : blend(palette[idx], palette[idx+1], frac);
        ctx.setFloorColor(x,y,color);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Generator algorithms mixing fantastical and sci-fi motifs
  // ---------------------------------------------------------------------------
  function algorithmPrismaticNebulae(ctx){
    const { width:W, height:H, random } = ctx;
    const nebulae = [];
    const clusterCount = Math.max(12, Math.floor((W*H)/90));
    const palette = ['#c8f5ff','#9eb3ff','#e9a9ff','#fbd6ff','#ffe8c8','#d8fffb','#fab7ff'];

    for(let i=0;i<clusterCount;i++){
      const rx = Math.max(3, Math.floor(random()*Math.min(W,H)/5));
      const ry = Math.max(3, Math.floor(random()*Math.min(W,H)/5));
      const cx = 2 + rx + Math.floor(random()*(W-4-2*rx));
      const cy = 2 + ry + Math.floor(random()*(H-4-2*ry));
      const color = palette[i % palette.length];
      const floorType = (i%5===0) ? 'ice' : (i%7===0 ? 'poison' : 'normal');
      carveEllipse(ctx, cx, cy, rx, ry, { floorColor: color, floorType });
      nebulae.push({x:cx,y:cy,r:Math.max(rx,ry)});
    }

    const connectors = shuffle(nebulae, random).slice(0, Math.max(6, Math.floor(nebulae.length*0.9)));
    if(connectors.length >= 2){
      createConnector(ctx, connectors, random, { color:'#f0f6ff', type:'ice', thickness:2 });
    }

    sprinkleColors(ctx, nebulae, '#4f46e5', '#c084fc');

    const vortexCenters = [];
    for(let i=0;i<nebulae.length;i+=3){
      const a = nebulae[i];
      if(!a) continue;
      const center = branchWeave(ctx, a, 4 + Math.floor(random()*4), random, {
        floorColor: blend('#ffe66d', '#b5179e', random()),
        floorType: random()<0.5 ? 'ice' : 'normal',
        length: 12 + Math.floor(random()*20),
        drift: 1.2
      });
      vortexCenters.push(...center);
    }

    distributeStructures(ctx, nebulae, random, { maxCount: 28, tags:['spire','dream'] });
    paintRadiance(ctx, vortexCenters.map(p => ({x:p.x,y:p.y,r:4+Math.floor(random()*4)})), ['#ffe66d','#b5179e','#88f'] );
    applyWallHighlights(ctx, random, ['#1f1c2c', '#433d67', '#261447', '#130f40']);

    ctx.ensureConnectivity();
  }

  function algorithmChronoscape(ctx){
    const { width:W, height:H, random } = ctx;
    const gridSize = 4 + Math.floor(random()*4);
    const noise = makeNoiseSampler(random, 4);

    for(let gy=1; gy<H-1; gy+=gridSize){
      for(let gx=1; gx<W-1; gx+=gridSize){
        const w = Math.min(gridSize+2, W-2-gx);
        const h = Math.min(gridSize+2, H-2-gy);
        if(w<3 || h<3) continue;
        const centerX = gx + Math.floor(w/2);
        const centerY = gy + Math.floor(h/2);
        const cellNoise = noise(centerX, centerY);
        if(cellNoise > 0.25){
          carveEllipse(ctx, centerX, centerY, Math.floor(w/2), Math.floor(h/2), {
            floorColor: '#d1f5ff',
            floorType: (cellNoise > 0.55 ? 'ice' : 'normal')
          });
        }else if(cellNoise < -0.25){
          const pts = [];
          const sides = 4 + Math.floor(random()*4);
          for(let i=0;i<sides;i++){
            const angle = (Math.PI*2*i)/sides;
            const radius = Math.min(w,h)/2 - 1 + noise(centerX+i, centerY-i)*3;
            pts.push({
              x: centerX + Math.cos(angle)*radius,
              y: centerY + Math.sin(angle)*radius
            });
          }
          carvePolygon(ctx, pts, {
            floorColor: blend('#f5f3ff', '#ffe066', Math.abs(cellNoise)),
            floorType: (cellNoise<-0.6 ? 'poison' : 'normal')
          });
        }else{
          for(let y=gy;y<gy+h;y++){
            for(let x=gx;x<gx+w;x++){
              if((x-gx)%2===0 || (y-gy)%2===0){
                ctx.set(x,y,0);
                ctx.setFloorColor(x,y, '#f5f3ff');
                ctx.setFloorType(x,y, (x+y)%5===0 ? 'ice' : 'normal');
              }
            }
          }
        }
        if(random()<0.3){
          const struct = ctx.structures.pick({ tags:['mechanism','chrono'], addonId:addonId }, random);
          if(struct){
            ctx.structures.place(struct, centerX, centerY, {
              rotation: (Math.floor(random()*4)*90),
              strict: false
            });
          }
        }
      }
    }

    const anchorPoints = [];
    for(let i=0;i<12;i++){
      const x = 2 + Math.floor(random()*(W-4));
      const y = 2 + Math.floor(random()*(H-4));
      ctx.set(x,y,0);
      ctx.setFloorColor(x,y,'#ffe066');
      ctx.setFloorType(x,y, i%3===0 ? 'poison' : 'normal');
      anchorPoints.push({x,y});
    }
    createConnector(ctx, anchorPoints, random, { color:'#ffef9f', type:'normal', thickness:1 + Math.floor(random()*2) });

    for(let y=1;y<H-1;y++){
      for(let x=1;x<W-1;x++){
        if(ctx.get(x,y)===0 && random()<0.05) ctx.setFloorColor(x,y, blend('#ff6f91','#845ec2', random()));
      }
    }

    distributeStructures(ctx, anchorPoints, random, { maxCount: 24, tags:['mechanism','dream'] });
    applyWallHighlights(ctx, random, ['#0b132b','#1c2541','#3a506b']);

    ctx.ensureConnectivity();
  }

  function algorithmLucidCascade(ctx){
    const { width:W, height:H, random, fixedMaps } = ctx;

    if(fixedMaps.available && random()<0.35){
      if(fixedMaps.applyCurrent()){
        for(let y=1;y<H-1;y++){
          for(let x=1;x<W-1;x++){
            if(ctx.get(x,y)===0){
              if((x+y)%3===0) ctx.setFloorType(x,y,'poison');
              if((x*y)%7===0) ctx.setFloorColor(x,y,'#bbf7d0');
            }
          }
        }
        distributeStructures(ctx, [{x:W/2,y:H/2}], random, { maxCount: 12, tags:['garden','dream'] });
        applyWallHighlights(ctx, random, ['#14532d','#0f172a']);
        return;
      }
    }

    const strata = 6 + Math.floor(random()*5);
    const stepHeight = Math.max(2, Math.floor((H-2)/strata));
    const cascadeSeeds = [];
    for(let i=0;i<strata;i++){
      const yStart = 1 + i*stepHeight;
      const yEnd = Math.min(H-2, yStart + stepHeight + Math.floor(random()*3));
      const wave = 1 + Math.floor(random()*4);
      for(let y=yStart;y<=yEnd;y++){
        for(let x=1;x<W-1;x++){
          const threshold = Math.sin((x + i*4) / wave) * 0.5 + 0.5;
          if(random() < threshold){
            ctx.set(x,y,0);
            ctx.setFloorColor(x,y, blend('#0ea5e9','#f472b6', i/strata));
            if(i%2===0 && random()<0.3) ctx.setFloorType(x,y,'ice');
            if(i%3===0 && random()<0.2) ctx.setFloorType(x,y,'poison');
            cascadeSeeds.push({x,y,r:2+Math.floor(random()*4)});
          }
        }
      }
    }

    sprinkleColors(ctx, cascadeSeeds, '#99f6e4', '#f9a8d4');
    distributeStructures(ctx, cascadeSeeds, random, { maxCount: 32, tags:['garden','dream'] });
    applyWallHighlights(ctx, random, ['#0f172a','#1e293b','#334155']);

    ctx.ensureConnectivity();
  }
  function algorithmQuantumBloom(ctx){
    const { width:W, height:H, random } = ctx;
    const noise = makeNoiseSampler(random, 6);
    const petals = [];
    for(let y=2;y<H-2;y++){
      for(let x=2;x<W-2;x++){
        const n = noise(x,y);
        if(n > 0.4){
          ctx.set(x,y,0);
          ctx.setFloorColor(x,y, blend('#7c3aed','#f5d0fe', Math.min(1, n)));
          if(n>0.65) ctx.setFloorType(x,y,'ice');
          if(n>0.8) ctx.setFloorType(x,y,'poison');
          if((x+y)%9===0) petals.push({x,y,r:2+Math.floor(random()*3)});
        }
      }
    }
    sprinkleColors(ctx, petals, '#f0abfc', '#5eead4');
    const anchors = branchWeave(ctx, {x:Math.floor(W/2), y:Math.floor(H/2)}, 6, random, {
      floorColor: '#f9a8d4',
      floorType: 'normal',
      length: 25,
      drift: 0.9
    });
    createConnector(ctx, anchors, random, { color:'#fcd34d', type:'normal', thickness:2 });
    distributeStructures(ctx, petals, random, { maxCount: 30, tags:['garden','dream','quantum'] });
    applyWallHighlights(ctx, random, ['#4a044e','#312e81']);
    ctx.ensureConnectivity();
  }

  function algorithmMythicMachina(ctx){
    const { width:W, height:H, random } = ctx;
    const nodes = [];
    for(let i=0;i<18;i++){
      const x = 3 + Math.floor(random()*(W-6));
      const y = 3 + Math.floor(random()*(H-6));
      const size = 2 + Math.floor(random()*4);
      carveEllipse(ctx, x, y, size, size, {
        floorColor: blend('#22d3ee','#facc15', random()),
        floorType: (i%4===0 ? 'poison' : 'normal')
      });
      nodes.push({x,y});
    }
    createConnector(ctx, nodes, random, { color:'#fde68a', type:'ice', thickness:2 });

    const spline = [];
    const laneCount = 5 + Math.floor(random()*4);
    for(let i=0;i<laneCount;i++){
      spline.push({
        x: 2 + Math.floor((W-4) * (i/(laneCount-1))),
        y: 2 + Math.floor(random()*(H-4))
      });
    }
    carveSpline(ctx, spline, 4, { floorColor:'#a5f3fc', floorType:'normal' });

    distributeStructures(ctx, nodes, random, { maxCount: 26, tags:['mechanism','forge'] });
    floodDreamMist(ctx, random, ['#fcd34d','#bef264','#38bdf8']);
    applyWallHighlights(ctx, random, ['#172554','#312e81','#3730a3']);
    ctx.ensureConnectivity();
  }

  function algorithmAstralAtlantis(ctx){
    const { width:W, height:H, random } = ctx;
    const anchors = [];
    const ringCount = 4 + Math.floor(random()*4);
    const cx = Math.floor(W/2);
    const cy = Math.floor(H/2);
    for(let r=3; r<Math.min(cx,cy)-2; r+=Math.max(3, Math.floor(random()*4))){
      const points = [];
      const segments = 12 + Math.floor(random()*8);
      for(let i=0;i<segments;i++){
        const angle = (Math.PI*2*i)/segments;
        const jitter = 0.5 + random()*0.6;
        const x = cx + Math.cos(angle)*r*jitter;
        const y = cy + Math.sin(angle)*r*jitter;
        points.push({x,y});
      }
      carvePolygon(ctx, points, {
        floorColor: blend('#0ea5e9','#22d3ee', r / Math.min(cx,cy)),
        floorType: r%2===0 ? 'ice' : 'normal'
      });
      anchors.push(points[Math.floor(points.length/2)]);
    }
    createConnector(ctx, anchors, random, { color:'#bae6fd', type:'ice', thickness:3 });
    distributeStructures(ctx, anchors, random, { maxCount: 22, tags:['harbor','dream','spire'] });
    sprinkleColors(ctx, anchors.map(p=>({x:Math.floor(p.x),y:Math.floor(p.y),r:3+Math.floor(random()*3)})), '#1d4ed8', '#f472b6');
    applyWallHighlights(ctx, random, ['#0f172a','#082f49']);
    ctx.ensureConnectivity();
  }

  function algorithmGravitonRift(ctx){
    const { width:W, height:H, random } = ctx;
    const noise = makeNoiseSampler(random, 5);
    const pits = [];
    for(let y=2;y<H-2;y++){
      for(let x=2;x<W-2;x++){
        const n = noise(x*1.5, y*0.7);
        if(n < -0.4){
          ctx.set(x,y,0);
          ctx.setFloorColor(x,y, blend('#f0fdfa','#06b6d4', Math.abs(n)));
          if((x+y)%4===0) ctx.setFloorType(x,y, 'ice');
          if((x*y)%13===0) ctx.setFloorType(x,y, 'poison');
          if(random()<0.05) pits.push({x,y,r:2+Math.floor(random()*4)});
        }
      }
    }
    const core = {x:Math.floor(W/2), y:Math.floor(H/2)};
    const ends = branchWeave(ctx, core, 10, random, {
      floorColor:'#bef264',
      floorType:'normal',
      length: 22 + Math.floor(random()*15),
      drift: 1.5
    });
    createConnector(ctx, ends.concat([core]), random, { color:'#fef08a', type:'normal', thickness:3 });
    distributeStructures(ctx, pits.concat(ends), random, { maxCount: 34, tags:['gravity','mechanism','dream'] });
    applyWallHighlights(ctx, random, ['#111827','#1f2937','#312e81']);
    ctx.ensureConnectivity();
  }

  function algorithmEtherealBazaar(ctx){
    const { width:W, height:H, random } = ctx;
    const rows = 6 + Math.floor(random()*6);
    const cols = 6 + Math.floor(random()*6);
    const cellW = Math.max(3, Math.floor((W-4)/cols));
    const cellH = Math.max(3, Math.floor((H-4)/rows));
    const hubs = [];
    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        const x0 = 2 + c*cellW;
        const y0 = 2 + r*cellH;
        const x1 = Math.min(W-3, x0 + cellW - 1);
        const y1 = Math.min(H-3, y0 + cellH - 1);
        if((r+c)%3===0){
          for(let y=y0;y<=y1;y++){
            for(let x=x0;x<=x1;x++){
              if((x+y)%2===0){
                ctx.set(x,y,0);
                ctx.setFloorColor(x,y, blend('#fef08a','#fca5a5', (r+c)/(rows+cols)));
              }
            }
          }
        }else{
          carveEllipse(ctx, Math.floor((x0+x1)/2), Math.floor((y0+y1)/2), Math.floor((x1-x0)/2), Math.floor((y1-y0)/2), {
            floorColor: blend('#fde68a','#fcd34d', r/rows),
            floorType: (r%4===0 ? 'poison' : 'normal')
          });
        }
        hubs.push({ x:Math.floor((x0+x1)/2), y:Math.floor((y0+y1)/2) });
      }
    }
    createConnector(ctx, hubs, random, { color:'#f97316', type:'normal', thickness:1 });
    distributeStructures(ctx, hubs, random, { maxCount: 38, tags:['bazaar','dream','quantum'] });
    applyWallHighlights(ctx, random, ['#7c2d12','#451a03','#1c1917']);
    ctx.ensureConnectivity();
  }
  function algorithmAuroraLabyrinth(ctx){
    const { width:W, height:H, random } = ctx;
    const noise = makeNoiseSampler(random, 7);
    const visited = new Set();
    function key(x,y){ return `${x},${y}`; }
    const stack = [{x:Math.floor(W/2), y:Math.floor(H/2)}];
    while(stack.length){
      const node = stack.pop();
      const k = key(node.x,node.y);
      if(visited.has(k)) continue;
      visited.add(k);
      if(!ctx.inBounds(node.x,node.y)) continue;
      ctx.set(node.x,node.y,0);
      const n = noise(node.x,node.y);
      ctx.setFloorColor(node.x,node.y, blend('#22d3ee','#a855f7', (n+1)/2));
      if(Math.abs(n)>0.55) ctx.setFloorType(node.x,node.y,'ice');
      const dirs = shuffle([
        {x:2,y:0},{x:-2,y:0},{x:0,y:2},{x:0,y:-2}
      ], random);
      for(const d of dirs){
        const nx = node.x + d.x;
        const ny = node.y + d.y;
        if(nx<=1||ny<=1||nx>=W-2||ny>=H-2) continue;
        if(!visited.has(key(nx,ny))){
          ctx.set(node.x + d.x/2, node.y + d.y/2, 0);
          stack.push({x:nx,y:ny});
        }
      }
    }
    distributeStructures(ctx, [{x:Math.floor(W/2), y:Math.floor(H/2)}], random, { maxCount: 18, tags:['labyrinth','dream'] });
    applyWallHighlights(ctx, random, ['#0f172a','#4c1d95','#581c87']);
    ctx.ensureConnectivity();
  }

  function algorithmCelestialDynasty(ctx){
    const { width:W, height:H, random } = ctx;
    const rings = 3 + Math.floor(random()*5);
    const centers = [];
    for(let i=0;i<rings;i++){
      const rx = Math.max(3, Math.floor((W-4)/(rings+i)));
      const ry = Math.max(3, Math.floor((H-4)/(rings+i)));
      const x = 2 + Math.floor(random()*(W-4-rx*2)) + rx;
      const y = 2 + Math.floor(random()*(H-4-ry*2)) + ry;
      carveEllipse(ctx, x, y, rx, ry, {
        floorColor: blend('#fde68a','#fca5a5', i/rings),
        floorType: i%2===0 ? 'normal' : 'poison'
      });
      centers.push({x,y});
    }
    for(const c of centers){
      const arms = branchWeave(ctx, c, 3 + Math.floor(random()*4), random, {
        floorColor: '#facc15',
        floorType: 'normal',
        length: 15 + Math.floor(random()*10),
        drift: 1.1
      });
      createConnector(ctx, arms.concat([c]), random, { color:'#fb7185', type:'ice', thickness:2 });
    }
    distributeStructures(ctx, centers, random, { maxCount: 40, tags:['dynasty','dream','mechanism'] });
    applyWallHighlights(ctx, random, ['#3f1d38','#2a0a29','#431407']);
    ctx.ensureConnectivity();
  }

  function algorithmPhantomAurora(ctx){
    const { width:W, height:H, random } = ctx;
    const center = {x:Math.floor(W/2), y:Math.floor(H/2)};
    const noise = makeNoiseSampler(random, 5);
    const arcs = [];
    for(let theta=0; theta<Math.PI*2; theta+=Math.PI/24){
      const radius = Math.min(center.x, center.y) * (0.5 + noise(Math.cos(theta)*10, Math.sin(theta)*10));
      arcs.push({
        x: center.x + Math.cos(theta)*radius,
        y: center.y + Math.sin(theta)*radius
      });
    }
    carveSpline(ctx, [center].concat(arcs), 6, { floorColor:'#fef9c3', floorType:'ice' });
    floodDreamMist(ctx, random, ['#facc15','#f97316','#ef4444']);
    distributeStructures(ctx, arcs, random, { maxCount: 20, tags:['aurora','dream','quantum'] });
    applyWallHighlights(ctx, random, ['#1e293b','#0f172a','#111827']);
    ctx.ensureConnectivity();
  }

  function algorithmStarforgeBloom(ctx){
    const { width:W, height:H, random } = ctx;
    const petals = [];
    const forgeNodes = [];
    for(let i=0;i<8;i++){
      const angle = (Math.PI*2*i)/8;
      const radius = Math.min(W,H)/2 - 4;
      const px = Math.floor(W/2 + Math.cos(angle)*radius);
      const py = Math.floor(H/2 + Math.sin(angle)*radius);
      carveEllipse(ctx, px, py, 3+Math.floor(random()*4), 4+Math.floor(random()*5), {
        floorColor: blend('#fbbf24','#ea580c', i/8),
        floorType: i%2===0 ? 'normal' : 'ice'
      });
      petals.push({x:px,y:py,r:4});
      forgeNodes.push({x:px,y:py});
    }
    sprinkleColors(ctx, petals, '#f59e0b', '#34d399');
    createConnector(ctx, forgeNodes.concat([{x:Math.floor(W/2), y:Math.floor(H/2)}]), random, {
      color:'#a855f7',
      type:'normal',
      thickness:3
    });
    distributeStructures(ctx, forgeNodes, random, { maxCount: 28, tags:['forge','dream'] });
    applyWallHighlights(ctx, random, ['#431407','#713f12','#422006']);
    ctx.ensureConnectivity();
  }
  // ---------------------------------------------------------------------------
  // Generator registry
  // ---------------------------------------------------------------------------
  const generators = [
    { id: 'prismatic-nebulae', name: '虹彩星雲回廊', description: '色彩豊かな楕円洞を繋ぐ夢幻の浮遊回廊。氷路と毒路が交差する幻想世界。', algorithm: algorithmPrismaticNebulae, mixin: { normalMixed: 0.4, blockDimMixed: 0.65, tags:['nebula','floating','ice','poison'] } },
    { id: 'chrono-symmetric-grid', name: '時空配列迷宮', description: '幾何学的な配列と機巧ギミックが交差するクロノスケープ。', algorithm: algorithmChronoscape, mixin: { normalMixed: 0.25, blockDimMixed: 0.5, tags:['grid','mechanism','ice'] } },
    { id: 'lucid-waterfall', name: '夢幻流瀑界', description: '段階的な階層が水のように連なるルシッドカスケード。固定図面と揺らぎのハイブリッド。', algorithm: algorithmLucidCascade, mixin: { normalMixed: 0.3, blockDimMixed: 0.55, tags:['wave','cascade','poison'] } },
    { id: 'quantum-bloom', name: '量子花綻界', description: 'ノイズで咲く量子花が空間を侵食し、氷と毒の輝きが重なる万華鏡。', algorithm: algorithmQuantumBloom, mixin: { normalMixed: 0.35, blockDimMixed: 0.6, tags:['garden','quantum','ice'] } },
    { id: 'mythic-machina', name: '神話機構炉', description: '精密な分岐路とメカニズムが夢の鍛造炉を組み上げる超越領域。', algorithm: algorithmMythicMachina, mixin: { normalMixed: 0.3, blockDimMixed: 0.5, tags:['mechanism','forge','poison'] } },
    { id: 'astral-atlantis', name: '星海浮都アトランティス', description: '同心円状の浮都が集まり、潮光と星霧が交差する水界都市。', algorithm: algorithmAstralAtlantis, mixin: { normalMixed: 0.4, blockDimMixed: 0.7, tags:['water','floating','ice'] } },
    { id: 'graviton-rift', name: '重力裂隙網', description: '重力井戸と毒霧が交じる裂隙網を漂い、枝道が全域を繋ぐ。', algorithm: algorithmGravitonRift, mixin: { normalMixed: 0.28, blockDimMixed: 0.58, tags:['gravity','poison','ice'] } },
    { id: 'ethereal-bazaar', name: '星幻交易廊', description: '格子と楕円が交錯するバザール街区。色彩の市場が夢を売買する。', algorithm: algorithmEtherealBazaar, mixin: { normalMixed: 0.45, blockDimMixed: 0.62, tags:['bazaar','grid','garden'] } },
    { id: 'aurora-labyrinth', name: '極光の夢迷宮', description: '揺らぐノイズ迷宮が極光のように脈動し、氷路と幻想壁を描く。', algorithm: algorithmAuroraLabyrinth, mixin: { normalMixed: 0.22, blockDimMixed: 0.48, tags:['labyrinth','ice','dream'] } },
    { id: 'celestial-dynasty', name: '天星王朝宮', description: '王朝の輪郭が幾重にも重なり、枝道が星鎖を織り成す宮廷群。', algorithm: algorithmCelestialDynasty, mixin: { normalMixed: 0.32, blockDimMixed: 0.63, tags:['dynasty','garden','poison'] } },
    { id: 'phantom-aurora', name: '幻灯極彩界', description: '放射状の幻灯アーチが極彩色の霧を散布するシアター構造。', algorithm: algorithmPhantomAurora, mixin: { normalMixed: 0.38, blockDimMixed: 0.56, tags:['aurora','floating','quantum'] } },
    { id: 'starforge-bloom', name: '星鋳花輪域', description: '星型に広がる鍛造花弁が放射ネットワークを創出する。', algorithm: algorithmStarforgeBloom, mixin: { normalMixed: 0.31, blockDimMixed: 0.6, tags:['forge','garden','ice'] } },
    { id: 'mirage-symphony', name: '蜃気楼交響街', description: 'ヴォロノイの街区とリボン状の遊歩道が交差する音楽都市。', algorithm: algorithmMirageSymphony, mixin: { normalMixed: 0.42, blockDimMixed: 0.6, tags:['bazaar','aurora','dream'] } },
    { id: 'harmonic-forge', name: '調律鍛星域', description: '螺旋の炉心と放射花弁で構成された調律鍛冶の聖域。', algorithm: algorithmHarmonicForge, mixin: { normalMixed: 0.36, blockDimMixed: 0.58, tags:['forge','quantum','ice'] } },
    { id: 'celestial-lotus', name: '天蓮光苑', description: '多重の蓮華層が淡く発光し静謐な星庭を形作る。', algorithm: algorithmCelestialLotus, mixin: { normalMixed: 0.4, blockDimMixed: 0.68, tags:['garden','lotus','ice'] } },
    { id: 'rifted-megalith', name: '裂界巨石群', description: '裂け目から覗く巨石区画と重力回廊が連鎖する。', algorithm: algorithmRiftedMegalith, mixin: { normalMixed: 0.27, blockDimMixed: 0.57, tags:['megalith','gravity','poison'] } },
    { id: 'tesseract-bloom', name: '四次元開花群', description: 'テッセラクト格子が開閉し量子の花弁が連鎖する超次元回廊。', algorithm: algorithmTesseractBloom, mixin: { normalMixed: 0.33, blockDimMixed: 0.59, tags:['quantum','mirage','ice'] } },
    { id: 'nocturne-horizon', name: '夜想地平帯', description: '夜色の帯が水平に重なり極光リボンが流れる幻想地平。', algorithm: algorithmNocturneHorizon, mixin: { normalMixed: 0.3, blockDimMixed: 0.52, tags:['aurora','nocturne','poison'] } },
    { id: 'chrono-verdant', name: '時苑連環', description: '時間格子の庭園が発芽し多層の緑回路が構成される。', algorithm: algorithmChronoVerdant, mixin: { normalMixed: 0.37, blockDimMixed: 0.6, tags:['garden','chrono','poison'] } },
    { id: 'hyperion-helices', name: '超螺旋星炉帯', description: '螺旋束と分岐脈動が共鳴する重層の星炉回廊。CAとフラクタル導管が交差する。', algorithm: algorithmHyperionHelices, mixin: { normalMixed: 0.29, blockDimMixed: 0.55, tags:['helix','forge','ice','dream'] } },
    { id: 'lucid-dreamtide', name: 'ルシッド潮夢帯', description: '潮流のような帯が多層の滝を描き、量子霧が光の階を浸す。', algorithm: algorithmLucidDreamtide, mixin: { normalMixed: 0.34, blockDimMixed: 0.58, tags:['tidal','cascade','dream'] } },
    { id: 'chrono-spiral-array', name: '時螺旋配列域', description: '時間軌道が螺旋配列で重なり黄金色の導脈が群島状に展開する。', algorithm: algorithmChronoSpiralArray, mixin: { normalMixed: 0.32, blockDimMixed: 0.61, tags:['chrono','spiral','dream'] } },
    { id: 'astral-honeycomb', name: '星巣蜂巣界', description: '蜂巣状の星殿が立体格子を編み、放射した光路が幻想庭園を浮かべる。', algorithm: algorithmAstralHoneycomb, mixin: { normalMixed: 0.35, blockDimMixed: 0.63, tags:['honeycomb','astral','ice'] } },
    { id: 'mycelic-starways', name: '菌糸星径網', description: '菌糸状の枝道が星光を纏って広がる幻想の空庭。', algorithm: algorithmMycelicStarways, mixin: { normalMixed: 0.31, blockDimMixed: 0.57, tags:['mycelic','garden','poison'] } },
    { id: 'velvet-abyss', name: '緋紗深淵界', description: '緋紗の渦が深淵を照らし、螺旋門と晶簇が連鎖する夜想空間。', algorithm: algorithmVelvetAbyss, mixin: { normalMixed: 0.27, blockDimMixed: 0.54, tags:['abyss','nocturne','poison'] } },
    { id: 'gilded-paradox', name: '金紋逆理苑', description: '黄金の反転庭園が多重に重なり、螺旋回路と六角殿が共鳴する。', algorithm: algorithmGildedParadox, mixin: { normalMixed: 0.33, blockDimMixed: 0.6, tags:['paradox','forge','dream'] } },
    { id: 'stellar-harmonics', name: '星律共鳴界', description: '星律ノイズが煌めく共鳴層を刻み、残響橋が全域を繋ぐ。', algorithm: algorithmStellarHarmonics, mixin: { normalMixed: 0.36, blockDimMixed: 0.64, tags:['harmonic','nebula','ice'] } }
  ];
  // ---------------------------------------------------------------------------
  // Block lineup definition (massive roster for large add-on)
  // ---------------------------------------------------------------------------
  function mkBossFloors(depth){
    const arr=[];
    for(let i=5;i<=depth;i+=5) arr.push(i);
    return arr;
  }

  const blocks = {
    dimensions: [
      { key:'dream-orbit', name:'夢軌道界', baseLevel: 18 },
      { key:'luminous-forge', name:'光鍛星界', baseLevel: 26 },
      { key:'chromatic-abyss', name:'彩色深淵域', baseLevel: 34 },
      { key:'quantum-conflux', name:'量子融界', baseLevel: 42 },
      { key:'nebulae-palace', name:'星雲宮殿界', baseLevel: 48 },
      { key:'aurora-vault', name:'極光封庫界', baseLevel: 52 },
      { key:'chrono-dream', name:'時夢結界', baseLevel: 56 },
      { key:'mythic-axis', name:'神軸界', baseLevel: 60 },
      { key:'stellar-harbor', name:'星港海界', baseLevel: 64 },
      { key:'phantom-atrium', name:'幻灯中庭域', baseLevel: 70 },
      { key:'helix-forge', name:'螺旋鋳界', baseLevel: 74 },
      { key:'tidal-lyric', name:'潮詠界', baseLevel: 78 },
      { key:'paradox-plaza', name:'逆理広場界', baseLevel: 82 },
      { key:'abyssal-velvet', name:'緋紗深淵界', baseLevel: 86 },
      { key:'stellar-resonance', name:'星律共鳴界', baseLevel: 92 }
    ],
    blocks1: [
      { key:'dream_theme_01', name:'Dream Frontier', level:+0, size:0, depth:+1, chest:'more', type:'prismatic-nebulae', bossFloors: mkBossFloors(15) },
      { key:'dream_theme_02', name:'Orbital Mirage', level:+6, size:+1, depth:+1, chest:'normal', type:'prismatic-nebulae' },
      { key:'dream_theme_03', name:'Photon Drift', level:+12, size:+1, depth:+2, chest:'less', type:'chrono-symmetric-grid', bossFloors:[10,20] },
      { key:'dream_theme_04', name:'Neon Blossom', level:+18, size:+2, depth:+2, chest:'more', type:'lucid-waterfall', bossFloors:[15,25] },
      { key:'dream_theme_05', name:'Aurora Sanctum', level:+24, size:+2, depth:+3, chest:'normal', type:'prismatic-nebulae', bossFloors:[20,30] },
      { key:'dream_theme_06', name:'Temporal Estate', level:+30, size:+3, depth:+3, chest:'less', type:'chrono-symmetric-grid', bossFloors:[25,35] },
      { key:'dream_theme_07', name:'Cascade Eden', level:+36, size:+3, depth:+4, chest:'more', type:'lucid-waterfall', bossFloors:[30,40] },
      { key:'dream_theme_08', name:'Quantum Loom', level:+42, size:+3, depth:+4, chest:'normal', type:'quantum-bloom', bossFloors:[35,45] },
      { key:'dream_theme_09', name:'Nebular Bazaar', level:+48, size:+4, depth:+4, chest:'more', type:'ethereal-bazaar' },
      { key:'dream_theme_10', name:'Graviton Reach', level:+54, size:+4, depth:+5, chest:'less', type:'graviton-rift', bossFloors:[40,50] },
      { key:'dream_theme_11', name:'Aurora Strata', level:+60, size:+4, depth:+5, chest:'normal', type:'aurora-labyrinth', bossFloors:[45,55] },
      { key:'dream_theme_12', name:'Dynasty Reef', level:+66, size:+5, depth:+5, chest:'more', type:'celestial-dynasty', bossFloors:[50,60] },
      { key:'dream_theme_13', name:'Phantom Orchard', level:+72, size:+5, depth:+6, chest:'normal', type:'phantom-aurora' },
      { key:'dream_theme_14', name:'Starforge Corridor', level:+78, size:+5, depth:+6, chest:'less', type:'starforge-bloom', bossFloors:[55,65] },
      { key:'dream_theme_15', name:'Mythic Spindle', level:+84, size:+6, depth:+6, chest:'more', type:'mythic-machina', bossFloors:[60,70] },
      { key:'dream_theme_16', name:'Lucent Mosaica', level:+90, size:+6, depth:+7, chest:'normal', type:'chrono-symmetric-grid', bossFloors:[65,75] },
      { key:'dream_theme_17', name:'Chronicle Basin', level:+96, size:+6, depth:+7, chest:'less', type:'lucid-waterfall' },
      { key:'dream_theme_18', name:'Oracular Isles', level:+102, size:+7, depth:+7, chest:'more', type:'astral-atlantis', bossFloors:[70,80] },
      { key:'dream_theme_19', name:'Prismatic Orchard', level:+108, size:+7, depth:+8, chest:'normal', type:'prismatic-nebulae' },
      { key:'dream_theme_20', name:'Temporal Bazaar', level:+114, size:+7, depth:+8, chest:'less', type:'ethereal-bazaar' },
      { key:'dream_theme_21', name:'Cascade Helix', level:+120, size:+8, depth:+8, chest:'more', type:'lucid-waterfall', bossFloors:[75,85] },
      { key:'dream_theme_22', name:'Quantum Citadel', level:+126, size:+8, depth:+9, chest:'normal', type:'quantum-bloom', bossFloors:[80,90] },
      { key:'dream_theme_23', name:'Nebula Forge', level:+132, size:+8, depth:+9, chest:'less', type:'starforge-bloom' },
      { key:'dream_theme_24', name:'Auroral Rift', level:+138, size:+9, depth:+9, chest:'more', type:'graviton-rift', bossFloors:[85,95] },
      { key:'dream_theme_25', name:'Dynasty Nexus', level:+144, size:+9, depth:+10, chest:'normal', type:'celestial-dynasty', bossFloors:[90,100] },
      { key:'dream_theme_26', name:'Phantom Library', level:+150, size:+9, depth:+10, chest:'less', type:'phantom-aurora' },
      { key:'dream_theme_27', name:'Starforge Embrace', level:+156, size:+10, depth:+10, chest:'more', type:'starforge-bloom', bossFloors:[95,105] },
      { key:'dream_theme_28', name:'Mythic Weave', level:+162, size:+10, depth:+11, chest:'normal', type:'mythic-machina' },
      { key:'dream_theme_29', name:'Lucid Empyrean', level:+168, size:+10, depth:+11, chest:'less', type:'lucid-waterfall' },
      { key:'dream_theme_30', name:'Chrono Sovereign', level:+174, size:+11, depth:+11, chest:'more', type:'chrono-symmetric-grid', bossFloors:[100,110] },
      { key:'dream_theme_31', name:'Nebular Choir', level:+180, size:+11, depth:+12, chest:'normal', type:'prismatic-nebulae' },
      { key:'dream_theme_32', name:'Aurora Reliquary', level:+186, size:+11, depth:+12, chest:'less', type:'aurora-labyrinth', bossFloors:[105,115] },
      { key:'dream_theme_33', name:'Dynasty Prism', level:+192, size:+12, depth:+12, chest:'more', type:'celestial-dynasty' },
      { key:'dream_theme_34', name:'Phantom Pulse', level:+198, size:+12, depth:+13, chest:'normal', type:'phantom-aurora' },
      { key:'dream_theme_35', name:'Starforge Zenith', level:+204, size:+12, depth:+13, chest:'more', type:'starforge-bloom', bossFloors:[110,120] },
      { key:'dream_theme_36', name:'Mirage Concerto', level:+210, size:+13, depth:+13, chest:'normal', type:'mirage-symphony', bossFloors:[115,125] },
      { key:'dream_theme_37', name:'Harmonic Crucible', level:+216, size:+13, depth:+14, chest:'less', type:'harmonic-forge' },
      { key:'dream_theme_38', name:'Lotus Firmament', level:+222, size:+13, depth:+14, chest:'more', type:'celestial-lotus', bossFloors:[120,130] },
      { key:'dream_theme_39', name:'Megalith Rift', level:+228, size:+14, depth:+14, chest:'normal', type:'rifted-megalith' },
      { key:'dream_theme_40', name:'Symphonic Halo', level:+234, size:+14, depth:+15, chest:'more', type:'mirage-symphony', bossFloors:[125,135] },
      { key:'dream_theme_41', name:'Tesseract Glade', level:+240, size:+15, depth:+15, chest:'normal', type:'tesseract-bloom', bossFloors:[130,140] },
      { key:'dream_theme_42', name:'Nocturne Terrace', level:+246, size:+15, depth:+16, chest:'less', type:'nocturne-horizon' },
      { key:'dream_theme_43', name:'Chrono Grove', level:+252, size:+16, depth:+16, chest:'more', type:'chrono-verdant', bossFloors:[135,145] },
      { key:'dream_theme_44', name:'Helix Crucible', level:+258, size:+16, depth:+17, chest:'normal', type:'hyperion-helices', bossFloors:[140,150] },
      { key:'dream_theme_45', name:'Dreamtide Scriptorium', level:+264, size:+17, depth:+17, chest:'less', type:'lucid-dreamtide' },
      { key:'dream_theme_46', name:'Temporal Spiral Array', level:+270, size:+17, depth:+18, chest:'more', type:'chrono-spiral-array', bossFloors:[145,155] },
      { key:'dream_theme_47', name:'Honeycomb Citadel', level:+276, size:+17, depth:+18, chest:'normal', type:'astral-honeycomb' },
      { key:'dream_theme_48', name:'Mycelic Choir', level:+282, size:+18, depth:+18, chest:'more', type:'mycelic-starways', bossFloors:[150,160] },
      { key:'dream_theme_49', name:'Velvet Maw', level:+288, size:+18, depth:+19, chest:'less', type:'velvet-abyss' },
      { key:'dream_theme_50', name:'Paradox Crown', level:+294, size:+18, depth:+19, chest:'normal', type:'gilded-paradox', bossFloors:[155,165] },
      { key:'dream_theme_51', name:'Harmonic Veil', level:+300, size:+19, depth:+20, chest:'more', type:'stellar-harmonics', bossFloors:[160,170] },
      { key:'dream_theme_52', name:'Nebular Resonance Nexus', level:+306, size:+19, depth:+20, chest:'more', type:'stellar-harmonics', bossFloors:[165,175] }
    ],
    blocks2: [
      { key:'astral_bastion', name:'Astral Bastion', level:+4, size:+1, depth:0, chest:'normal', type:'prismatic-nebulae' },
      { key:'chrono_courtyard', name:'Chrono Courtyard', level:+10, size:+1, depth:+1, chest:'more', type:'chrono-symmetric-grid' },
      { key:'spiral_reactor', name:'Spiral Reactor', level:+16, size:+2, depth:+1, chest:'less', type:'prismatic-nebulae', bossFloors:[10,20] },
      { key:'lattice_asylum', name:'Lattice Asylum', level:+22, size:+2, depth:+2, chest:'normal', type:'chrono-symmetric-grid' },
      { key:'flux_garden', name:'Flux Garden', level:+28, size:+2, depth:+2, chest:'more', type:'lucid-waterfall' },
      { key:'zero_point_villa', name:'Zero-Point Villa', level:+34, size:+3, depth:+3, chest:'less', type:'chrono-symmetric-grid' },
      { key:'edenic_reservoir', name:'Edenic Reservoir', level:+40, size:+3, depth:+3, chest:'normal', type:'lucid-waterfall', bossFloors:[25,35,45] },
      { key:'nebula_foundry', name:'Nebula Foundry', level:+46, size:+3, depth:+4, chest:'more', type:'starforge-bloom', bossFloors:[30,40] },
      { key:'quantum_atrium', name:'Quantum Atrium', level:+52, size:+4, depth:+4, chest:'normal', type:'quantum-bloom' },
      { key:'gravity_orchard', name:'Gravity Orchard', level:+58, size:+4, depth:+4, chest:'less', type:'graviton-rift' },
      { key:'aurora_balcony', name:'Aurora Balcony', level:+64, size:+4, depth:+5, chest:'more', type:'aurora-labyrinth' },
      { key:'dynasty_aqueduct', name:'Dynasty Aqueduct', level:+70, size:+5, depth:+5, chest:'normal', type:'celestial-dynasty' },
      { key:'phantom_lounge', name:'Phantom Lounge', level:+76, size:+5, depth:+5, chest:'less', type:'phantom-aurora' },
      { key:'chrono_bazaar', name:'Chrono Bazaar', level:+82, size:+5, depth:+6, chest:'more', type:'ethereal-bazaar', bossFloors:[40,50] },
      { key:'dreamsmith_mill', name:'Dreamsmith Mill', level:+88, size:+5, depth:+6, chest:'normal', type:'mythic-machina' },
      { key:'lucid_conservatory', name:'Lucid Conservatory', level:+94, size:+6, depth:+6, chest:'less', type:'lucid-waterfall' },
      { key:'nebular_balustrade', name:'Nebular Balustrade', level:+100, size:+6, depth:+7, chest:'more', type:'prismatic-nebulae' },
      { key:'quantum_menagerie', name:'Quantum Menagerie', level:+106, size:+6, depth:+7, chest:'normal', type:'quantum-bloom' },
      { key:'gravity_coliseum', name:'Gravity Coliseum', level:+112, size:+7, depth:+7, chest:'less', type:'graviton-rift', bossFloors:[55,65] },
      { key:'aurora_throne', name:'Aurora Throne', level:+118, size:+7, depth:+8, chest:'more', type:'aurora-labyrinth' },
      { key:'dynasty_reserve', name:'Dynasty Reserve', level:+124, size:+7, depth:+8, chest:'normal', type:'celestial-dynasty' },
      { key:'phantom_gallery', name:'Phantom Gallery', level:+130, size:+8, depth:+8, chest:'less', type:'phantom-aurora' },
      { key:'starforge_opera', name:'Starforge Opera', level:+136, size:+8, depth:+8, chest:'more', type:'starforge-bloom' },
      { key:'mythic_loom', name:'Mythic Loom', level:+142, size:+8, depth:+9, chest:'normal', type:'mythic-machina', bossFloors:[60,70,80] },
      { key:'lucent_scriptorium', name:'Lucent Scriptorium', level:+148, size:+9, depth:+9, chest:'less', type:'chrono-symmetric-grid' },
      { key:'nebula_arboretum', name:'Nebula Arboretum', level:+154, size:+9, depth:+9, chest:'more', type:'prismatic-nebulae' },
      { key:'quantum_astralway', name:'Quantum Astralway', level:+160, size:+9, depth:+10, chest:'normal', type:'astral-atlantis' },
      { key:'gravity_bastille', name:'Gravity Bastille', level:+166, size:+9, depth:+10, chest:'less', type:'graviton-rift' },
      { key:'aurora_palais', name:'Aurora Palais', level:+172, size:+10, depth:+10, chest:'more', type:'aurora-labyrinth', bossFloors:[70,80,90] },
      { key:'dynasty_observatory', name:'Dynasty Observatory', level:+178, size:+10, depth:+11, chest:'normal', type:'celestial-dynasty' },
      { key:'phantom_museum', name:'Phantom Museum', level:+184, size:+10, depth:+11, chest:'less', type:'phantom-aurora' },
      { key:'starforge_gallery', name:'Starforge Gallery', level:+190, size:+11, depth:+11, chest:'more', type:'starforge-bloom' },
      { key:'mythic_sanctuary', name:'Mythic Sanctuary', level:+196, size:+11, depth:+12, chest:'normal', type:'mythic-machina' },
      { key:'lucid_meridian', name:'Lucid Meridian', level:+202, size:+11, depth:+12, chest:'less', type:'lucid-waterfall' },
      { key:'nebula_resonance', name:'Nebula Resonance', level:+208, size:+12, depth:+12, chest:'more', type:'prismatic-nebulae', bossFloors:[85,95,105] },
      { key:'mirage_colonnade', name:'Mirage Colonnade', level:+214, size:+12, depth:+12, chest:'normal', type:'mirage-symphony' },
      { key:'harmonic_forgeyard', name:'Harmonic Forgeyard', level:+220, size:+12, depth:+13, chest:'more', type:'harmonic-forge', bossFloors:[90,100,110] },
      { key:'lotus_resplendence', name:'Lotus Resplendence', level:+226, size:+13, depth:+13, chest:'normal', type:'celestial-lotus' },
      { key:'megalith_bay', name:'Megalith Bay', level:+232, size:+13, depth:+14, chest:'less', type:'rifted-megalith' },
      { key:'symphonic_escarpment', name:'Symphonic Escarpment', level:+238, size:+13, depth:+14, chest:'more', type:'mirage-symphony', bossFloors:[95,105,115] },
      { key:'tesseract_atrium', name:'Tesseract Atrium', level:+244, size:+13, depth:+15, chest:'normal', type:'tesseract-bloom' },
      { key:'nocturne_observatory', name:'Nocturne Observatory', level:+250, size:+14, depth:+15, chest:'less', type:'nocturne-horizon' },
      { key:'chrono_canopy', name:'Chrono Canopy', level:+256, size:+14, depth:+16, chest:'more', type:'chrono-verdant', bossFloors:[100,110,120] },
      { key:'helix_promenade', name:'Helix Promenade', level:+262, size:+15, depth:+16, chest:'normal', type:'hyperion-helices', bossFloors:[105,115] },
      { key:'dreamtide_palace', name:'Dreamtide Palace', level:+268, size:+15, depth:+17, chest:'more', type:'lucid-dreamtide' },
      { key:'spiral_array_ward', name:'Spiral Array Ward', level:+274, size:+15, depth:+17, chest:'less', type:'chrono-spiral-array', bossFloors:[110,120] },
      { key:'honeycomb_quarter', name:'Honeycomb Quarter', level:+280, size:+16, depth:+18, chest:'normal', type:'astral-honeycomb' },
      { key:'mycelic_reserve', name:'Mycelic Reserve', level:+286, size:+16, depth:+18, chest:'more', type:'mycelic-starways', bossFloors:[115,125] },
      { key:'velvet_courtyard', name:'Velvet Courtyard', level:+292, size:+16, depth:+19, chest:'less', type:'velvet-abyss' },
      { key:'paradox_colonnade', name:'Paradox Colonnade', level:+298, size:+17, depth:+19, chest:'normal', type:'gilded-paradox', bossFloors:[120,130] },
      { key:'harmonic_gallery', name:'Harmonic Gallery', level:+304, size:+17, depth:+20, chest:'more', type:'stellar-harmonics', bossFloors:[125,135] }
    ],
    blocks3: [
      { key:'prism_artifact', name:'Prism Artifact', level:+2, size:0, depth:+2, chest:'more', type:'prismatic-nebulae', bossFloors:[5,15] },
      { key:'tachyon_core', name:'Tachyon Core', level:+8, size:+1, depth:+2, chest:'less', type:'chrono-symmetric-grid', bossFloors:[10,20] },
      { key:'lucid_anemone', name:'Lucid Anemone', level:+14, size:+1, depth:+3, chest:'normal', type:'lucid-waterfall', bossFloors:[15,30] },
      { key:'stellar_helix', name:'Stellar Helix', level:+20, size:+2, depth:+3, chest:'more', type:'prismatic-nebulae' },
      { key:'chrono_orb', name:'Chrono Orb', level:+26, size:+2, depth:+4, chest:'less', type:'chrono-symmetric-grid', bossFloors:[20,30,40] },
      { key:'dream_lyre', name:'Dream Lyre', level:+32, size:+2, depth:+4, chest:'normal', type:'lucid-waterfall' },
      { key:'quantum_blossom', name:'Quantum Blossom', level:+38, size:+3, depth:+5, chest:'more', type:'prismatic-nebulae', bossFloors:[35,45] },
      { key:'astral_matrix', name:'Astral Matrix', level:+44, size:+3, depth:+5, chest:'normal', type:'astral-atlantis' },
      { key:'graviton_prism', name:'Graviton Prism', level:+50, size:+3, depth:+6, chest:'less', type:'graviton-rift' },
      { key:'aurora_signet', name:'Aurora Signet', level:+56, size:+3, depth:+6, chest:'more', type:'aurora-labyrinth' },
      { key:'dynasty_codex', name:'Dynasty Codex', level:+62, size:+4, depth:+6, chest:'normal', type:'celestial-dynasty' },
      { key:'phantom_diadem', name:'Phantom Diadem', level:+68, size:+4, depth:+7, chest:'less', type:'phantom-aurora' },
      { key:'starforge_mandala', name:'Starforge Mandala', level:+74, size:+4, depth:+7, chest:'more', type:'starforge-bloom' },
      { key:'mythic_cog', name:'Mythic Cog', level:+80, size:+4, depth:+8, chest:'normal', type:'mythic-machina' },
      { key:'lucid_calyx', name:'Lucid Calyx', level:+86, size:+4, depth:+8, chest:'less', type:'lucid-waterfall' },
      { key:'nebula_diagram', name:'Nebula Diagram', level:+92, size:+5, depth:+8, chest:'more', type:'prismatic-nebulae' },
      { key:'quantum_compass', name:'Quantum Compass', level:+98, size:+5, depth:+9, chest:'normal', type:'quantum-bloom' },
      { key:'gravity_spindle', name:'Gravity Spindle', level:+104, size:+5, depth:+9, chest:'less', type:'graviton-rift' },
      { key:'aurora_gem', name:'Aurora Gem', level:+110, size:+5, depth:+10, chest:'more', type:'aurora-labyrinth' },
      { key:'dynasty_diadem', name:'Dynasty Diadem', level:+116, size:+5, depth:+10, chest:'normal', type:'celestial-dynasty' },
      { key:'phantom_relic', name:'Phantom Relic', level:+122, size:+6, depth:+10, chest:'less', type:'phantom-aurora' },
      { key:'starforge_cradle', name:'Starforge Cradle', level:+128, size:+6, depth:+11, chest:'more', type:'starforge-bloom', bossFloors:[60,70] },
      { key:'mythic_crown', name:'Mythic Crown', level:+134, size:+6, depth:+11, chest:'normal', type:'mythic-machina' },
      { key:'lucid_corona', name:'Lucid Corona', level:+140, size:+6, depth:+12, chest:'less', type:'lucid-waterfall' },
      { key:'nebula_quadrant', name:'Nebula Quadrant', level:+146, size:+6, depth:+12, chest:'more', type:'prismatic-nebulae', bossFloors:[65,75] },
      { key:'quantum_vault', name:'Quantum Vault', level:+152, size:+7, depth:+12, chest:'normal', type:'quantum-bloom' },
      { key:'gravity_beacon', name:'Gravity Beacon', level:+158, size:+7, depth:+13, chest:'less', type:'graviton-rift' },
      { key:'aurora_veil', name:'Aurora Veil', level:+164, size:+7, depth:+13, chest:'more', type:'aurora-labyrinth', bossFloors:[70,80] },
      { key:'dynasty_signet', name:'Dynasty Signet', level:+170, size:+7, depth:+14, chest:'normal', type:'celestial-dynasty' },
      { key:'phantom_censer', name:'Phantom Censer', level:+176, size:+7, depth:+14, chest:'less', type:'phantom-aurora' },
      { key:'starforge_atrium', name:'Starforge Atrium', level:+182, size:+8, depth:+14, chest:'more', type:'starforge-bloom' },
      { key:'mythic_reliquary', name:'Mythic Reliquary', level:+188, size:+8, depth:+15, chest:'normal', type:'mythic-machina', bossFloors:[75,85] },
      { key:'lucid_eclipse', name:'Lucid Eclipse', level:+194, size:+8, depth:+15, chest:'less', type:'lucid-waterfall' },
      { key:'nebula_oracle', name:'Nebula Oracle', level:+200, size:+8, depth:+16, chest:'more', type:'prismatic-nebulae' },
      { key:'quantum_scepter', name:'Quantum Scepter', level:+206, size:+9, depth:+16, chest:'normal', type:'quantum-bloom' },
      { key:'gravity_crown', name:'Gravity Crown', level:+212, size:+9, depth:+16, chest:'less', type:'graviton-rift', bossFloors:[80,90] },
      { key:'mirage_ornament', name:'Mirage Ornament', level:+218, size:+9, depth:+16, chest:'normal', type:'mirage-symphony' },
      { key:'harmonic_keystone', name:'Harmonic Keystone', level:+224, size:+10, depth:+17, chest:'more', type:'harmonic-forge', bossFloors:[85,95] },
      { key:'lotus_diadem', name:'Lotus Diadem', level:+230, size:+10, depth:+17, chest:'less', type:'celestial-lotus' },
      { key:'megalith_talisman', name:'Megalith Talisman', level:+236, size:+10, depth:+18, chest:'normal', type:'rifted-megalith' },
      { key:'symphonic_glyph', name:'Symphonic Glyph', level:+242, size:+10, depth:+18, chest:'more', type:'mirage-symphony', bossFloors:[90,100] },
      { key:'tesseract_prism', name:'Tesseract Prism', level:+248, size:+11, depth:+18, chest:'normal', type:'tesseract-bloom', bossFloors:[95,105] },
      { key:'nocturne_amulet', name:'Nocturne Amulet', level:+254, size:+11, depth:+19, chest:'less', type:'nocturne-horizon' },
      { key:'chrono_bloom', name:'Chrono Bloom', level:+260, size:+11, depth:+19, chest:'more', type:'chrono-verdant' },
      { key:'helix_relic', name:'Helix Relic', level:+266, size:+11, depth:+20, chest:'normal', type:'hyperion-helices', bossFloors:[100,110,120] },
      { key:'dreamtide_compass', name:'Dreamtide Compass', level:+272, size:+12, depth:+20, chest:'less', type:'lucid-dreamtide' },
      { key:'spiral_codex', name:'Spiral Codex', level:+278, size:+12, depth:+21, chest:'more', type:'chrono-spiral-array', bossFloors:[105,115,125] },
      { key:'honeycomb_reliquary', name:'Honeycomb Reliquary', level:+284, size:+12, depth:+21, chest:'normal', type:'astral-honeycomb' },
      { key:'mycelic_marrow', name:'Mycelic Marrow', level:+290, size:+13, depth:+22, chest:'more', type:'mycelic-starways', bossFloors:[110,120,130] },
      { key:'velvet_lens', name:'Velvet Lens', level:+296, size:+13, depth:+22, chest:'less', type:'velvet-abyss' },
      { key:'paradox_icon', name:'Paradox Icon', level:+302, size:+13, depth:+23, chest:'normal', type:'gilded-paradox' },
      { key:'harmonic_astrolabe', name:'Harmonic Astrolabe', level:+308, size:+14, depth:+23, chest:'more', type:'stellar-harmonics', bossFloors:[115,125,135] }
    ]
  };
  const structures = [
    { id:'prism_spire', name:'Prism Spire', tags:['spire','dream'], pattern:['  #  ',' ### ','##.##',' ### ','  #  '], anchor:'center' },
    { id:'chrono_node', name:'Chrono Node', tags:['mechanism','dream','chrono'], allowRotation:true, pattern:['##X##','#...#','X...X','#...#','##X##'] },
    { id:'dream_petal', name:'Dream Petal', tags:['garden','dream'], allowRotation:true, pattern:['  .  ',' .. ',' .F. ',' .. ','  .  '] },
    { id:'gravity_dock', name:'Gravity Dock', tags:['mechanism','spire','gravity'], allowRotation:true, pattern:['  ###  ',' #...# ','#.....#','#.....#',' #...# ','  ###  '] },
    { id:'luminous_bridge', name:'Luminous Bridge', tags:['bridge','dream'], allowRotation:true, pattern:['###','...','###'] },
    { id:'quantum_market_stall', name:'Quantum Market Stall', tags:['bazaar','dream'], allowRotation:true, pattern:['###','#T#','###'] },
    { id:'aurora_totem', name:'Aurora Totem', tags:['aurora','dream'], allowRotation:true, pattern:[' . ','#F#',' . '] },
    { id:'dynasty_gate', name:'Dynasty Gate', tags:['dynasty','dream'], allowRotation:true, pattern:['##.##','#...#','##.##'] },
    { id:'phantom_stage', name:'Phantom Stage', tags:['aurora','floating'], allowRotation:true, pattern:['..#..','.###.','#####','.###.','..#..'] },
    { id:'starforge_anvil', name:'Starforge Anvil', tags:['forge','dream'], allowRotation:true, pattern:[' ### ','##.##','#...#','##.##',' ### '] },
    { id:'nebula_orchard', name:'Nebula Orchard', tags:['garden','nebula'], allowRotation:true, pattern:['.F.F.','F...F','.F.F.'] },
    { id:'chronos_engine', name:'Chronos Engine', tags:['mechanism','chrono'], allowRotation:true, pattern:['##X##','#...#','##.##','#...#','##X##'] },
    { id:'cascade_fountain', name:'Cascade Fountain', tags:['cascade','dream'], allowRotation:true, pattern:['  .  ',' . . ','..0..',' . . ','  .  '] },
    { id:'mythic_focus', name:'Mythic Focus', tags:['forge','mechanism'], allowRotation:true, pattern:['###','#X#','###'] },
    { id:'harbor_dock', name:'Harbor Dock', tags:['harbor','dream'], allowRotation:true, pattern:['~~~~','....','~~~~'] },
    { id:'bazaar_arch', name:'Bazaar Arch', tags:['bazaar','dream'], allowRotation:true, pattern:['#.#','...','#.#'] },
    { id:'aurora_pillar', name:'Aurora Pillar', tags:['aurora','ice'], allowRotation:true, pattern:[' # ','###',' # '] },
    { id:'quantum_beacon', name:'Quantum Beacon', tags:['quantum','dream'], allowRotation:true, pattern:['  #  ',' ### ','#...#',' ### ','  #  '] },
    { id:'gravity_anchor', name:'Gravity Anchor', tags:['gravity','mechanism'], allowRotation:true, pattern:['###','#X#','###'] },
    { id:'dynasty_treasury', name:'Dynasty Treasury', tags:['dynasty','dream'], allowRotation:true, pattern:['#####','#...#','#.$.#','#...#','#####'] },
    { id:'phantom_lantern', name:'Phantom Lantern', tags:['floating','dream'], allowRotation:true, pattern:['  #  ',' .#. ','#...#',' .#. ','  #  '] },
    { id:'starforge_petal', name:'Starforge Petal', tags:['forge','garden'], allowRotation:true, pattern:[' .. ','....','....',' .. '] },
    { id:'mirage_kiosk', name:'Mirage Kiosk', tags:['bazaar','mirage','dream'], allowRotation:true, pattern:['###','#.#','###'] },
    { id:'harmonic_resonator', name:'Harmonic Resonator', tags:['harmonic','forge','dream'], allowRotation:true, pattern:['#X#','XXX','#X#'] },
    { id:'lotus_altar', name:'Lotus Altar', tags:['lotus','garden','dream'], allowRotation:true, pattern:[' . ','#F#',' . '] },
    { id:'megalith_obelisk', name:'Megalith Obelisk', tags:['megalith','gravity','dream'], allowRotation:true, pattern:[' ### ',' #X# ',' ### '] },
    { id:'symphony_balcony', name:'Symphony Balcony', tags:['mirage','aurora','dream'], allowRotation:true, pattern:['..#..','#####','..#..'] },
    { id:'tesseract_gateway', name:'Tesseract Gateway', tags:['tesseract','quantum','mirage','dream'], allowRotation:true, pattern:['##.##','#...#','.X.X.','#...#','##.##'] },
    { id:'nocturne_beacon', name:'Nocturne Beacon', tags:['nocturne','aurora','dream'], allowRotation:true, pattern:[' ### ','#...#',' ### '] },
    { id:'chrono_arboretum', name:'Chrono Arboretum', tags:['garden','chrono','dream'], allowRotation:true, pattern:['##.##','#...#','..F..','#...#','##.##'] },
    { id:'helix_observatory', name:'Helix Observatory', tags:['helix','forge','dream'], allowRotation:true, pattern:['..#..','.#.#.','#X.X#','.#.#.','..#..'] },
    { id:'tidal_arcade', name:'Tidal Arcade', tags:['tidal','cascade','dream'], allowRotation:true, pattern:['~~~~~','..0..','~~~~~'] },
    { id:'spiral_altar', name:'Spiral Altar', tags:['spiral','chrono','dream'], allowRotation:true, pattern:[' . ',' .0. ','.....',' .0. ',' . '] },
    { id:'honeycomb_lattice', name:'Honeycomb Lattice', tags:['honeycomb','astral','dream'], allowRotation:true, pattern:['.#.#.','#...#','.###.','#...#','.#.#.'] },
    { id:'mycelic_spire', name:'Mycelic Spire', tags:['mycelic','garden','dream'], allowRotation:true, pattern:[' . ',' F ','# #',' F ',' . '] },
    { id:'velvet_gate', name:'Velvet Gate', tags:['abyss','nocturne','dream'], allowRotation:true, pattern:['###','#.#','0.0','#.#','###'] },
    { id:'paradox_dais', name:'Paradox Dais', tags:['paradox','forge','dream'], allowRotation:true, pattern:['##.##','#...#','.###.','#...#','##.##'] },
    { id:'harmonic_bridge', name:'Harmonic Bridge', tags:['harmonic','nebula','dream'], allowRotation:true, pattern:['###..','..#..','..#..','..#..','..###'] },
    { id:'abyssal_orchestra', name:'Abyssal Orchestra', tags:['abyss','nocturne','dream'], allowRotation:true, pattern:['..#..','.###.','#0#0#','.###.','..#..'] },
    { id:'dreamtide_gazebo', name:'Dreamtide Gazebo', tags:['tidal','garden','dream'], allowRotation:true, pattern:[' ### ','#...#','#0F0#','#...#',' ### '] },
    { id:'stellar_harp', name:'Stellar Harp', tags:['harmonic','nebula','dream'], allowRotation:true, pattern:['..#..','.F#F.','#...#','.F#F.','..#..'] }
  ];
  window.registerDungeonAddon({
    id: addonId,
    name: 'ファンタジカルと近未来をテーマにした夢の世界パック',
    version: '4.5.0',
    author: 'AI Generator',
    description: '幻想星雲・量子都市・神話機構・極光迷宮に加え、螺旋星炉や潮夢帯、蜂巣星殿、深淵回廊などが交差する超大規模ダンジョン生成セット。',
    api: '1',
    blocks,
    generators,
    structures
  });
  function generateVoronoiFields(ctx, seeds, rng, options={}){
    const { colors=['#fff'], floorType='normal', carveChance=0.6 } = options;
    const cells = [];
    for(const seed of seeds){
      const color = colors[seeds.indexOf(seed) % colors.length];
      cells.push({ x:seed.x, y:seed.y, color });
    }
    for(let y=1;y<ctx.height-1;y++){
      for(let x=1;x<ctx.width-1;x++){
        let nearest = null;
        let dist = Infinity;
        for(const c of cells){
          const d = Math.hypot(c.x-x, c.y-y);
          if(d < dist){
            dist = d;
            nearest = c;
          }
        }
        if(nearest && rng()<carveChance){
          ctx.set(x,y,0);
          ctx.setFloorColor(x,y, nearest.color);
          ctx.setFloorType(x,y, floorType);
        }
      }
    }
  }

  function weaveRibbon(ctx, path, opts={}){
    const { width=3, color='#fff', floorType='normal' } = opts;
    for(const p of path){
      for(let dy=-Math.floor(width/2); dy<=Math.floor(width/2); dy++){
        for(let dx=-Math.floor(width/2); dx<=Math.floor(width/2); dx++){
          const x = p.x + dx;
          const y = p.y + dy;
          if(ctx.inBounds(x,y)){
            ctx.set(x,y,0);
            ctx.setFloorColor(x,y,color);
            ctx.setFloorType(x,y,floorType);
          }
        }
      }
    }
  }

  function applyCelestialGlow(ctx, glowPoints, palette){
    for(const g of glowPoints){
      const radius = g.r || 4;
      for(let y=Math.max(1, g.y-radius); y<=Math.min(ctx.height-2, g.y+radius); y++){
        for(let x=Math.max(1, g.x-radius); x<=Math.min(ctx.width-2, g.x+radius); x++){
          if(ctx.get(x,y)===0){
            const t = Math.hypot(x-g.x, y-g.y)/radius;
            ctx.setFloorColor(x,y, palette[Math.min(palette.length-1, Math.floor(t*palette.length))]);
          }
        }
      }
    }
  }

  function carveSpiral(ctx, cx, cy, radius, arms, rng, opts={}){
    const { floorColor='#fff', floorType='normal' } = opts;
    const points = [];
    for(let i=0;i<radius*arms;i++){
      const angle = i/arms;
      const r = i/arms;
      const x = Math.round(cx + Math.cos(angle)*r);
      const y = Math.round(cy + Math.sin(angle)*r);
      if(ctx.inBounds(x,y)) points.push({x,y});
    }
    weaveRibbon(ctx, points, { width:3, color:floorColor, floorType });
  }
  function algorithmMirageSymphony(ctx){
    const { width:W, height:H, random } = ctx;
    const seeds = [];
    for(let i=0;i<14;i++){
      seeds.push({ x:2+Math.floor(random()*(W-4)), y:2+Math.floor(random()*(H-4)) });
    }
    generateVoronoiFields(ctx, seeds, random, {
      colors:['#fde68a','#fca5a5','#fcd34d','#fbbf24'],
      floorType:'normal',
      carveChance:0.55
    });
    const ribbons = [];
    for(const seed of seeds){
      const branch = branchWeave(ctx, seed, 2 + Math.floor(random()*3), random, {
        floorColor: blend('#f472b6','#22d3ee', random()),
        floorType: random()<0.4 ? 'ice' : 'normal',
        length: 10 + Math.floor(random()*12),
        drift: 0.7
      });
      ribbons.push(...branch);
    }
    applyCelestialGlow(ctx, ribbons.map(p=>({x:p.x,y:p.y,r:3})), ['#fff1f2','#fce7f3','#e0f2fe']);
    distributeStructures(ctx, seeds, random, { maxCount: 26, tags:['bazaar','dream','aurora'] });
    applyWallHighlights(ctx, random, ['#312e81','#1e1b4b','#4c1d95']);
    ctx.ensureConnectivity();
  }

  function algorithmHarmonicForge(ctx){
    const { width:W, height:H, random } = ctx;
    const core = { x:Math.floor(W/2), y:Math.floor(H/2) };
    carveSpiral(ctx, core.x, core.y, Math.floor(Math.min(W,H)/2), 6, random, {
      floorColor:'#f97316',
      floorType:'normal'
    });
    const petals = branchWeave(ctx, core, 12, random, {
      floorColor:'#fbbf24',
      floorType:'ice',
      length: 18 + Math.floor(random()*10),
      drift: 1.3
    });
    createConnector(ctx, petals.concat([core]), random, { color:'#facc15', type:'normal', thickness:2 });
    floodDreamMist(ctx, random, ['#fcd34d','#fde68a','#86efac']);
    distributeStructures(ctx, petals, random, { maxCount: 30, tags:['forge','dream','quantum'] });
    applyWallHighlights(ctx, random, ['#7c2d12','#451a03','#312e81']);
    ctx.ensureConnectivity();
  }

  function algorithmCelestialLotus(ctx){
    const { width:W, height:H, random } = ctx;
    const layers = 5 + Math.floor(random()*4);
    const glowPoints = [];
    for(let i=0;i<layers;i++){
      const rx = Math.floor((W-4)/(layers+1-i));
      const ry = Math.floor((H-4)/(layers+1-i));
      const cx = 2 + Math.floor(random()*(W-4-rx));
      const cy = 2 + Math.floor(random()*(H-4-ry));
      carveEllipse(ctx, cx, cy, Math.max(2, Math.floor(rx/3)), Math.max(2, Math.floor(ry/3)), {
        floorColor: blend('#cffafe','#f0abfc', i/layers),
        floorType: i%2===0 ? 'ice' : 'normal'
      });
      glowPoints.push({x:cx,y:cy,r:3+i});
    }
    applyCelestialGlow(ctx, glowPoints, ['#ecfeff','#f0f9ff','#fff7ed']);
    distributeStructures(ctx, glowPoints, random, { maxCount: 28, tags:['garden','lotus','dream'] });
    applyWallHighlights(ctx, random, ['#0f172a','#1d4ed8','#312e81']);
    ctx.ensureConnectivity();
  }

  function algorithmRiftedMegalith(ctx){
    const { width:W, height:H, random } = ctx;
    const slabs = [];
    const noise = makeNoiseSampler(random, 3);
    for(let y=2;y<H-2;y+=3){
      for(let x=2;x<W-2;x+=3){
        const n = noise(x,y);
        if(n > 0.15){
          carvePolygon(ctx, [
            {x:x-1,y:y-1},
            {x:x+1+random(),y:y-1+random()},
            {x:x+1+random(),y:y+1+random()},
            {x:x-1+random(),y:y+1+random()}
          ], {
            floorColor: blend('#22d3ee','#1d4ed8', (n+1)/2),
            floorType: (n>0.6 ? 'ice' : 'normal')
          });
          slabs.push({x,y});
        }
      }
    }
    const hub = {x:Math.floor(W/2), y:Math.floor(H/2)};
    const endpoints = branchWeave(ctx, hub, 8, random, {
      floorColor:'#38bdf8',
      floorType: random()<0.3 ? 'poison' : 'normal',
      length: 20,
      drift: 1.4
    });
    createConnector(ctx, endpoints.concat([hub]), random, { color:'#bae6fd', type:'ice', thickness:3 });
    distributeStructures(ctx, slabs, random, { maxCount: 36, tags:['megalith','mechanism','dream'] });
    applyWallHighlights(ctx, random, ['#082f49','#172554','#020617']);
    ctx.ensureConnectivity();
  }
  function scatterCrystals(ctx, points, rng, opts={}){
    const { colors=['#fff'], chance=0.4 } = opts;
    for(const p of points){
      for(let y=p.y-2; y<=p.y+2; y++){
        for(let x=p.x-2; x<=p.x+2; x++){
          if(!ctx.inBounds(x,y)) continue;
          if(ctx.get(x,y)===0 && rng()<chance){
            ctx.setFloorColor(x,y, colors[Math.floor(rng()*colors.length)]);
          }
        }
      }
    }
  }

  function placePortals(ctx, rng, count, options={}){
    const { floorType='normal', color='#fff' } = options;
    const portals = [];
    for(let i=0;i<count;i++){
      const x = 2 + Math.floor(rng()*(ctx.width-4));
      const y = 2 + Math.floor(rng()*(ctx.height-4));
      if(ctx.get(x,y)!==0) continue;
      portals.push({x,y});
      ctx.setFloorColor(x,y,color);
      ctx.setFloorType(x,y,floorType);
    }
    return portals;
  }
  function algorithmTesseractBloom(ctx){
    const { width:W, height:H, random } = ctx;
    const noise = makeNoiseSampler(random, 8);
    const portals = [];
    for(let y=2;y<H-2;y++){
      for(let x=2;x<W-2;x++){
        const value = noise(x,y);
        if(value > 0.5){
          ctx.set(x,y,0);
          ctx.setFloorColor(x,y, blend('#f5f3ff','#a855f7', value));
          if(value>0.75) ctx.setFloorType(x,y,'ice');
          if((x+y)%11===0) portals.push({x,y});
        }
      }
    }
    const placed = placePortals(ctx, random, Math.max(6, Math.floor(portals.length/20)), { floorType:'poison', color:'#a78bfa' });
    scatterCrystals(ctx, portals.concat(placed), random, { colors:['#fef3c7','#f9a8d4','#bbf7d0'], chance:0.6 });
    distributeStructures(ctx, portals, random, { maxCount: 24, tags:['quantum','dream','mirage'] });
    applyWallHighlights(ctx, random, ['#312e81','#4338ca','#1f2937']);
    ctx.ensureConnectivity();
  }

  function algorithmNocturneHorizon(ctx){
    const { width:W, height:H, random } = ctx;
    const beltCount = 7 + Math.floor(random()*5);
    const anchors = [];
    for(let i=0;i<beltCount;i++){
      const y = 2 + Math.floor((H-4) * (i/(beltCount-1)));
      for(let x=2;x<W-2;x++){
        if(random()<0.6){
          ctx.set(x,y,0);
          ctx.setFloorColor(x,y, blend('#0f172a','#94a3b8', i/beltCount));
          if(i%3===0 && random()<0.4) ctx.setFloorType(x,y,'poison');
          if(random()<0.1) anchors.push({x,y});
        }
      }
    }
    for(const anchor of anchors){
      const end = { x:Math.min(W-3, Math.max(2, anchor.x + Math.floor((random()-0.5)*20))), y:Math.min(H-3, Math.max(2, anchor.y + Math.floor((random()-0.5)*10))) };
      const path = ctx.aStar(anchor, end, { allowDiagonals:true, heuristic:'manhattan' });
      if(path) weaveRibbon(ctx, path, { width:3, color:'#38bdf8', floorType:'ice' });
    }
    distributeStructures(ctx, anchors, random, { maxCount: 32, tags:['aurora','nocturne','dream'] });
    applyWallHighlights(ctx, random, ['#020617','#111827','#1f2937']);
    ctx.ensureConnectivity();
  }
  function algorithmChronoVerdant(ctx){
    const { width:W, height:H, random } = ctx;
    const grid = 6 + Math.floor(random()*4);
    const seeds = [];
    for(let y=2;y<H-2;y+=grid){
      for(let x=2;x<W-2;x+=grid){
        const rx = Math.min(grid-1, W-3-x);
        const ry = Math.min(grid-1, H-3-y);
        carveEllipse(ctx, x+Math.floor(rx/2), y+Math.floor(ry/2), Math.max(1, Math.floor(rx/2)), Math.max(1, Math.floor(ry/2)), {
          floorColor: blend('#bbf7d0','#a7f3d0', random()),
          floorType: random()<0.3 ? 'poison' : 'normal'
        });
        seeds.push({x:x+Math.floor(rx/2), y:y+Math.floor(ry/2)});
      }
    }
    const connectors = branchWeave(ctx, {x:Math.floor(W/2), y:Math.floor(H/2)}, 8, random, {
      floorColor:'#4ade80',
      floorType:'normal',
      length: 18,
      drift: 0.8
    });
    createConnector(ctx, connectors, random, { color:'#34d399', type:'ice', thickness:2 });
    distributeStructures(ctx, seeds, random, { maxCount: 26, tags:['garden','chrono','dream'] });
    applyWallHighlights(ctx, random, ['#14532d','#052e16','#166534']);
    ctx.ensureConnectivity();
  }
  function algorithmHyperionHelices(ctx){
    const { width:W, height:H, random } = ctx;
    const carved = runCellularAutomata(ctx, random, {
      fill: 0.46,
      iterations: 6,
      birth: 5,
      surviveLow: 4,
      surviveHigh: 7,
      floorColor: '#fef9c3',
      floorType: 'ice'
    });
    const center = { x:Math.floor(W/2), y:Math.floor(H/2) };
    const helices = [];
    for(let ring=0; ring<4; ring++){
      const radius = Math.min(W,H)/2 - 4 - ring*2;
      const path = [];
      for(let theta=0; theta<Math.PI*2; theta+=Math.PI/48){
        const offset = Math.sin(theta*3 + ring)*3 + Math.cos(theta*2 - ring)*2;
        path.push({
          x: center.x + Math.cos(theta+ring)* (radius + offset),
          y: center.y + Math.sin(theta+ring)* (radius - offset)
        });
      }
      carveSpline(ctx, path, 3, {
        floorColor: blend('#fde68a','#fb7185', ring/4),
        floorType: ring%2===0 ? 'normal' : 'poison'
      });
      helices.push({
        x: Math.round(center.x + Math.cos(ring) * (radius/1.5)),
        y: Math.round(center.y + Math.sin(ring) * (radius/1.5))
      });
    }
    const veins = generateFractalVeins(ctx, center, random, {
      iterations: 7,
      baseLength: 18,
      spread: 1.9,
      attenuation: 0.7,
      floorColor: '#fcd34d',
      floorType: 'normal'
    });
    const anchors = carved.concat(veins).concat(helices);
    applyHarmonicGradient(ctx, anchors, ['#fff7ed','#fde68a','#fb7185','#a855f7']);
    distributeStructures(ctx, veins, random, { maxCount: 44, tags:['helix','forge','dream'] });
    applyWallHighlights(ctx, random, ['#1f2937','#0f172a','#312e81']);
    ctx.ensureConnectivity();
  }

  function algorithmLucidDreamtide(ctx){
    const { width:W, height:H, random } = ctx;
    const noise = makeNoiseSampler(random, 6);
    const flowCenters = [];
    const bands = 7;
    for(let band=0; band<bands; band++){
      const path = [];
      for(let x=2; x<W-2; x++){
        const baseY = 2 + (H-4) * (band/(bands-1));
        const offset = Math.sin(x/3 + band) * 2.4 + noise(x*1.2, band*13) * 4;
        const y = Math.min(H-3, Math.max(2, Math.round(baseY + offset)));
        path.push({x,y});
      }
      carveSpline(ctx, path, 4, {
        floorColor: blend('#bfdbfe','#c4b5fd', band/bands),
        floorType: band%3===0 ? 'poison' : 'normal'
      });
      flowCenters.push(path[Math.floor(path.length/2)]);
    }
    floodDreamMist(ctx, random, ['#bfdbfe','#c4b5fd','#a5f3fc','#bbf7d0']);
    const connectors = [];
    for(const center of flowCenters){
      const nodes = branchWeave(ctx, center, 3 + Math.floor(random()*3), random, {
        floorColor:'#38bdf8',
        floorType: random()<0.4 ? 'ice' : 'normal',
        length: 12 + Math.floor(random()*6),
        drift: 1.2
      });
      connectors.push(...nodes);
    }
    createConnector(ctx, connectors.slice(0, Math.max(3, Math.floor(connectors.length/2))), random, {
      color:'#f0f9ff',
      type:'ice',
      thickness:2
    });
    applyHarmonicGradient(ctx, flowCenters, ['#0ea5e9','#6366f1','#a855f7','#14b8a6'], 0.7);
    distributeStructures(ctx, flowCenters, random, { maxCount: 38, tags:['tidal','cascade','dream'] });
    applyWallHighlights(ctx, random, ['#082f49','#0f172a','#1e293b']);
    ctx.ensureConnectivity();
  }

  function algorithmChronoSpiralArray(ctx){
    const { width:W, height:H, random } = ctx;
    const center = { x:Math.floor(W/2), y:Math.floor(H/2) };
    const anchors = [center];
    const rings = 3 + Math.floor(random()*3);
    for(let r=1; r<=rings; r++){
      const radius = Math.min(W,H)/4 + r*4;
      const count = 6 + r*3;
      for(let i=0;i<count;i++){
        const angle = (Math.PI*2*i)/count;
        const cx = Math.round(center.x + Math.cos(angle)*radius);
        const cy = Math.round(center.y + Math.sin(angle)*radius);
        anchors.push({x:cx, y:cy});
        generateFractalVeins(ctx, {x:cx, y:cy}, random, {
          iterations: 4 + r,
          baseLength: 12 + r*3,
          spread: 1.2 + r*0.3,
          attenuation: 0.76,
          floorColor: blend('#bae6fd','#fbcfe8', r/(rings+1)),
          floorType: r%2===0 ? 'normal' : 'poison'
        });
      }
    }
    createConnector(ctx, anchors, random, { color:'#fde68a', type:'ice', thickness:2 });
    applyHarmonicGradient(ctx, anchors, ['#f8fafc','#fde68a','#fb7185','#f472b6','#38bdf8']);
    distributeStructures(ctx, anchors, random, { maxCount: 48, tags:['chrono','spiral','dream'] });
    applyWallHighlights(ctx, random, ['#1f2937','#111827','#082f49']);
    ctx.ensureConnectivity();
  }

  function algorithmAstralHoneycomb(ctx){
    const { width:W, height:H, random } = ctx;
    const radius = Math.max(3, Math.floor(Math.min(W,H)/14));
    const horizontal = Math.max(4, Math.floor(radius * 2.1));
    const vertical = Math.max(4, Math.floor(radius * 1.8));
    const centers = [];
    let row = 0;
    for(let y=2; y<H-2; y+=vertical){
      const offset = (row%2===0) ? 0 : Math.floor(horizontal/2);
      for(let x=2+offset; x<W-2; x+=horizontal){
        carveHexagon(ctx, x, y, radius, {
          floorColor: blend('#dbeafe','#c4b5fd', (row%6)/6),
          floorType: (row+x)%3===0 ? 'ice' : 'normal'
        });
        centers.push({x,y});
      }
      row++;
    }
    applyHarmonicGradient(ctx, centers, ['#dbeafe','#fcd34d','#f9a8d4','#c084fc']);
    distributeStructures(ctx, centers, random, { maxCount: 34, tags:['honeycomb','astral','dream'] });
    const weave = branchWeave(ctx, {x:Math.floor(W/2), y:Math.floor(H/2)}, 10, random, {
      floorColor:'#f472b6',
      floorType:'normal',
      length: 14,
      drift: 0.9
    });
    createConnector(ctx, weave, random, { color:'#fbcfe8', type:'ice', thickness:2 });
    applyWallHighlights(ctx, random, ['#312e81','#1f2937','#0f172a']);
    ctx.ensureConnectivity();
  }

  function algorithmMycelicStarways(ctx){
    const { width:W, height:H, random } = ctx;
    const carved = runCellularAutomata(ctx, random, {
      fill: 0.52,
      iterations: 5,
      birth: 4,
      surviveLow: 4,
      surviveHigh: 8,
      floorColor: '#bbf7d0',
      floorType: 'poison'
    });
    const spires = [];
    for(let i=0;i<6;i++){
      const seed = {
        x: 2 + Math.floor(random()*(W-4)),
        y: 2 + Math.floor(random()*(H-4))
      };
      spires.push(seed);
      generateFractalVeins(ctx, seed, random, {
        iterations: 5,
        baseLength: 12,
        spread: 1.6,
        attenuation: 0.68,
        floorColor: blend('#34d399','#a855f7', i/6),
        floorType: i%2===0 ? 'normal' : 'poison'
      });
    }
    floodDreamMist(ctx, random, ['#4ade80','#c084fc','#a855f7','#fef08a']);
    const anchors = carved.concat(spires);
    applyHarmonicGradient(ctx, anchors, ['#bbf7d0','#f0abfc','#c084fc','#f472b6'], 0.8);
    distributeStructures(ctx, spires, random, { maxCount: 40, tags:['mycelic','garden','dream'] });
    applyWallHighlights(ctx, random, ['#052e16','#1f2937','#2e1065']);
    ctx.ensureConnectivity();
  }

  function algorithmVelvetAbyss(ctx){
    const { width:W, height:H, random } = ctx;
    const caverns = runCellularAutomata(ctx, random, {
      fill: 0.42,
      iterations: 6,
      birth: 5,
      surviveLow: 3,
      surviveHigh: 7,
      floorColor: '#e0f2fe',
      floorType: 'normal'
    });
    const center = {x:Math.floor(W/2), y:Math.floor(H/2)};
    const spiral = [];
    const maxR = Math.min(W,H)/2 - 3;
    for(let i=0;i<maxR*3;i++){
      const angle = i/2.5;
      const radius = i/3;
      const x = Math.round(center.x + Math.cos(angle)*radius);
      const y = Math.round(center.y + Math.sin(angle)*radius);
      if(ctx.inBounds(x,y)) spiral.push({x,y});
    }
    weaveRibbon(ctx, spiral, { width:4, color:'#9333ea', floorType:'poison' });
    const portals = placePortals(ctx, random, Math.max(8, Math.floor(caverns.length/30)), { floorType:'poison', color:'#f472b6' });
    scatterCrystals(ctx, portals, random, { colors:['#c084fc','#f9a8d4','#fee2e2'], chance:0.7 });
    applyHarmonicGradient(ctx, caverns.concat(portals), ['#111827','#312e81','#6b21a8','#f472b6'], 0.6);
    distributeStructures(ctx, portals, random, { maxCount: 28, tags:['abyss','nocturne','dream'] });
    applyWallHighlights(ctx, random, ['#0f172a','#1e1b4b','#4c1d95']);
    ctx.ensureConnectivity();
  }

  function algorithmGildedParadox(ctx){
    const { width:W, height:H, random } = ctx;
    const hub = {x:Math.floor(W/2), y:Math.floor(H/2)};
    carveEllipse(ctx, hub.x, hub.y, Math.max(4, Math.floor(W/8)), Math.max(4, Math.floor(H/8)), {
      floorColor:'#facc15',
      floorType:'normal'
    });
    const prisms = [];
    for(let i=0;i<8;i++){
      const angle = (Math.PI*2*i)/8;
      const radius = Math.min(W,H)/2 - 4;
      const px = Math.round(hub.x + Math.cos(angle)*radius);
      const py = Math.round(hub.y + Math.sin(angle)*radius);
      carveHexagon(ctx, px, py, 4 + (i%3), {
        floorColor: blend('#fef3c7','#fbbf24', i/8),
        floorType: i%2===0 ? 'normal' : 'poison'
      });
      prisms.push({x:px,y:py});
    }
    const spirals = branchWeave(ctx, hub, 12, random, {
      floorColor:'#fde68a',
      floorType:'normal',
      length: 22,
      drift: 1.1
    });
    createConnector(ctx, prisms.concat(spirals), random, { color:'#fda4af', type:'ice', thickness:3 });
    applyHarmonicGradient(ctx, prisms, ['#fff7ed','#fde68a','#fb7185','#f472b6','#c084fc']);
    distributeStructures(ctx, prisms, random, { maxCount: 40, tags:['paradox','forge','dream'] });
    applyWallHighlights(ctx, random, ['#3f1d38','#451a03','#4c1d95']);
    ctx.ensureConnectivity();
  }

  function algorithmStellarHarmonics(ctx){
    const { width:W, height:H, random } = ctx;
    const noise = makeNoiseSampler(random, 8);
    const anchors = [];
    for(let y=2;y<H-2;y++){
      for(let x=2;x<W-2;x++){
        const v = noise(x*1.2, y*1.2);
        if(v > 0.35){
          ctx.set(x,y,0);
          ctx.setFloorColor(x,y, blend('#e0f2fe','#c4b5fd', (v+1)/2));
          if(v>0.7) ctx.setFloorType(x,y,'ice');
          if(v>0.85 && random()<0.3) anchors.push({x,y});
        }
      }
    }
    const hubs = shuffle(anchors, random).slice(0, Math.max(6, Math.floor(anchors.length/4)));
    createConnector(ctx, hubs, random, { color:'#f0f9ff', type:'ice', thickness:2 });
    applyHarmonicGradient(ctx, hubs, ['#bae6fd','#a5b4fc','#fbcfe8','#fef3c7']);
    distributeStructures(ctx, hubs, random, { maxCount: 36, tags:['harmonic','nebula','dream'] });
    applyWallHighlights(ctx, random, ['#1e293b','#312e81','#0f172a']);
    ctx.ensureConnectivity();
  }
})();

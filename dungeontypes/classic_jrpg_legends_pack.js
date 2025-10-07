// Addon: Classic JRPG Legends Pack - a variety of heroic fantasy dungeon generators
(function(){
  function fillAll(ctx, value){
    const { map, width, height } = ctx;
    for(let y=0;y<height;y++){
      for(let x=0;x<width;x++){
        map[y][x] = value;
      }
    }
  }
  function carveRect(ctx, x0, y0, x1, y1, opts){
    const { floorColor, floorType } = opts || {};
    for(let y=y0;y<=y1;y++){
      for(let x=x0;x<=x1;x++){
        if(!ctx.inBounds(x,y)) continue;
        ctx.set(x,y,0);
        if(floorColor) ctx.setFloorColor(x,y,floorColor);
        if(floorType) ctx.setFloorType(x,y,floorType);
      }
    }
  }
  function carveLine(ctx, x0, y0, x1, y1, opts){
    const { floorColor, floorType, width=1 } = opts || {};
    let x = x0, y = y0;
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    while(true){
      for(let oy=-Math.floor(width/2); oy<=Math.floor((width-1)/2); oy++){
        for(let ox=-Math.floor(width/2); ox<=Math.floor((width-1)/2); ox++){
          const nx = x + ox;
          const ny = y + oy;
          if(!ctx.inBounds(nx, ny)) continue;
          ctx.set(nx, ny, 0);
          if(floorColor) ctx.setFloorColor(nx, ny, floorColor);
          if(floorType) ctx.setFloorType(nx, ny, floorType);
        }
      }
      if(x === x1 && y === y1) break;
      const e2 = 2 * err;
      if(e2 > -dy){ err -= dy; x += sx; }
      if(e2 < dx){ err += dx; y += sy; }
    }
  }
  function carveCircle(ctx, cx, cy, r, opts){
    const { floorColor, floorType } = opts || {};
    const r2 = r * r;
    for(let y = cy - r - 1; y <= cy + r + 1; y++){
      for(let x = cx - r - 1; x <= cx + r + 1; x++){
        if(!ctx.inBounds(x,y)) continue;
        const dx = x - cx;
        const dy = y - cy;
        if(dx*dx + dy*dy <= r2){
          ctx.set(x,y,0);
          if(floorColor) ctx.setFloorColor(x,y,floorColor);
          if(floorType) ctx.setFloorType(x,y,floorType);
        }
      }
    }
  }
  function fillCircle(ctx, cx, cy, r, value){
    const r2 = r * r;
    for(let y = cy - r - 1; y <= cy + r + 1; y++){
      for(let x = cx - r - 1; x <= cx + r + 1; x++){
        if(!ctx.inBounds(x,y)) continue;
        const dx = x - cx;
        const dy = y - cy;
        if(dx*dx + dy*dy <= r2){
          ctx.set(x,y,value);
        }
      }
    }
  }
  function carveRing(ctx, cx, cy, outerR, innerR, optsOuter, optsInner){
    carveCircle(ctx, cx, cy, outerR, optsOuter);
    if(innerR > 0){
      fillCircle(ctx, cx, cy, innerR, 1);
      if(optsInner){
        carveCircle(ctx, cx, cy, innerR, optsInner);
      }
    }
  }
  function randomRange(ctx, min, max){
    return min + Math.floor(ctx.random() * (max - min + 1));
  }
  function paintWalls(ctx, color){
    const { width, height } = ctx;
    for(let y=0;y<height;y++){
      for(let x=0;x<width;x++){
        if(ctx.get(x,y) === 1){
          ctx.setWallColor(x,y,color);
        }
      }
    }
  }
  function scatterFloor(ctx, color, type, density){
    const { width, height, random } = ctx;
    for(let y=1;y<height-1;y++){
      for(let x=1;x<width-1;x++){
        if(ctx.get(x,y) === 0 && random() < density){
          if(color) ctx.setFloorColor(x,y,color);
          if(type) ctx.setFloorType(x,y,type);
        }
      }
    }
  }
  function scatterPalette(ctx, palette, type, density){
    const { width, height, random } = ctx;
    if(!palette || palette.length === 0) return;
    for(let y=1;y<height-1;y++){
      for(let x=1;x<width-1;x++){
        if(ctx.get(x,y) === 0 && random() < density){
          const color = palette[Math.floor(random() * palette.length)];
          if(color) ctx.setFloorColor(x,y,color);
          if(type) ctx.setFloorType(x,y,type);
        }
      }
    }
  }

  function royalKeepAlgorithm(ctx){
    const { width: W, height: H } = ctx;
    fillAll(ctx,1);

    const hallW = Math.max(8, Math.floor(W * 0.6));
    const hallH = Math.max(8, Math.floor(H * 0.55));
    const hallX = Math.floor((W - hallW) / 2);
    const hallY = Math.floor((H - hallH) / 2);
    carveRect(ctx, hallX, hallY, hallX + hallW - 1, hallY + hallH - 1, { floorColor:'#d8caa0', floorType:'stone' });

    const towerSize = Math.max(4, Math.floor(Math.min(W,H) * 0.18));
    const offsets = [
      [hallX - towerSize + 1, hallY - towerSize + 1],
      [hallX + hallW - 2, hallY - towerSize + 1],
      [hallX - towerSize + 1, hallY + hallH - 2],
      [hallX + hallW - 2, hallY + hallH - 2]
    ];
    offsets.forEach(([ox, oy]) => {
      carveRect(ctx, ox, oy, ox + towerSize - 1, oy + towerSize - 1, { floorColor:'#c8b690', floorType:'marble' });
    });

    carveLine(ctx, Math.floor(W/2), 1, Math.floor(W/2), H-2, { floorColor:'#ccb890', floorType:'stone', width:2 });
    carveLine(ctx, 1, Math.floor(H/2), W-2, Math.floor(H/2), { floorColor:'#ccb890', floorType:'stone', width:2 });

    for(let i=0;i<4;i++){
      const angle = (Math.PI/2) * i;
      const cx = Math.floor(W/2 + Math.cos(angle) * Math.floor(hallW/2));
      const cy = Math.floor(H/2 + Math.sin(angle) * Math.floor(hallH/2));
      carveCircle(ctx, cx, cy, Math.max(2, Math.floor(towerSize/3)), { floorColor:'#e6d2a8', floorType:'carpet' });
    }

    scatterFloor(ctx, '#e4d4aa', 'carpet', 0.12);
    paintWalls(ctx,'#7c5e3a');
    ctx.ensureConnectivity();
  }

  function mysticWoodAlgorithm(ctx){
    const { width: W, height: H, random } = ctx;
    fillAll(ctx,1);

    const gladeCount = 6 + Math.floor(random() * 4);
    const glades = [];
    for(let i=0;i<gladeCount;i++){
      const r = Math.max(3, Math.floor(random() * Math.min(W,H) * 0.12));
      const cx = 2 + Math.floor(random() * (W - 4));
      const cy = 2 + Math.floor(random() * (H - 4));
      glades.push({cx, cy, r});
      carveCircle(ctx, cx, cy, r, { floorColor:'#7bc47f', floorType:'moss' });
    }

    glades.sort((a,b)=>a.cx-b.cx);
    for(let i=1;i<glades.length;i++){
      const prev = glades[i-1];
      const cur = glades[i];
      carveLine(ctx, prev.cx, prev.cy, cur.cx, cur.cy, { floorColor:'#6ca966', floorType:'forest', width:2 });
    }

    for(let i=0;i<glades.length;i++){
      const other = glades[(i + 2) % glades.length];
      if(random() < 0.4){
        carveLine(ctx, glades[i].cx, glades[i].cy, other.cx, other.cy, { floorColor:'#6ca966', floorType:'forest', width:1 });
      }
    }

    scatterFloor(ctx, '#9bd18a', 'flower', 0.08);
    paintWalls(ctx,'#2f5c2c');
    ctx.ensureConnectivity();
  }

  function crystalDepthsAlgorithm(ctx){
    const { width: W, height: H, random } = ctx;
    fillAll(ctx,1);

    const target = Math.floor(W * H * 0.42);
    let carved = 0;
    let x = Math.floor(W/2);
    let y = Math.floor(H/2);
    while(carved < target){
      ctx.set(x,y,0);
      ctx.setFloorColor(x,y,'#7bd0ff');
      ctx.setFloorType(x,y,'crystal');
      carved++;
      switch(Math.floor(random()*4)){
        case 0: x++; break;
        case 1: x--; break;
        case 2: y++; break;
        case 3: y--; break;
      }
      if(x < 2) x = 2;
      if(y < 2) y = 2;
      if(x > W-3) x = W-3;
      if(y > H-3) y = H-3;
      if(random() < 0.05){
        carveCircle(ctx, x, y, 2 + Math.floor(random()*3), { floorColor:'#8ee4ff', floorType:'crystal' });
      }
    }

    scatterFloor(ctx, '#c9f1ff', 'ice', 0.15);
    paintWalls(ctx,'#3a4c72');
    ctx.ensureConnectivity();
  }

  function sanctumAlgorithm(ctx){
    const { width: W, height: H } = ctx;
    fillAll(ctx,1);

    const layers = 4;
    for(let i=0;i<layers;i++){
      const padding = 2 + i * 2;
      carveRect(ctx, padding, padding, W-1-padding, H-1-padding, { floorColor: i % 2 === 0 ? '#f5e6cc' : '#edd8b3', floorType: i % 2 === 0 ? 'marble' : 'tile' });
    }

    carveLine(ctx, Math.floor(W/2), 1, Math.floor(W/2), H-2, { floorColor:'#f5e6cc', floorType:'marble', width:2 });
    carveLine(ctx, 1, Math.floor(H/2), W-2, Math.floor(H/2), { floorColor:'#f5e6cc', floorType:'marble', width:2 });

    carveCircle(ctx, Math.floor(W/2), Math.floor(H/2), Math.floor(Math.min(W,H) * 0.18), { floorColor:'#fff4da', floorType:'holy' });

    scatterFloor(ctx, '#f8edce', 'holy', 0.1);
    paintWalls(ctx,'#8f6b3b');
    ctx.ensureConnectivity();
  }

  function dragonForgeAlgorithm(ctx){
    const { width: W, height: H, random } = ctx;
    fillAll(ctx,1);

    const lavaRivers = 3 + Math.floor(random()*2);
    for(let i=0;i<lavaRivers;i++){
      let x = 2 + Math.floor(random() * (W-4));
      let y = 1;
      let lastDx = 0;
      while(y < H-2){
        ctx.set(x,y,0);
        ctx.setFloorColor(x,y,'#f97b3d');
        ctx.setFloorType(x,y,'lava');
        if(random() < 0.3){
          carveRect(ctx, x-1, y, x+1, y+1, { floorColor:'#f0652b', floorType:'lava' });
        }
        const dir = random();
        if(dir < 0.33 || lastDx === 1){ x = Math.min(W-3, x+1); lastDx = 1; }
        else if(dir < 0.66 || lastDx === -1){ x = Math.max(2, x-1); lastDx = -1; }
        else { lastDx = 0; }
        y++;
      }
    }

    const chamberCount = 5 + Math.floor(random()*3);
    for(let i=0;i<chamberCount;i++){
      const r = 2 + Math.floor(random()*3);
      const cx = 2 + Math.floor(random() * (W-4));
      const cy = 3 + Math.floor(random() * (H-6));
      carveCircle(ctx, cx, cy, r, { floorColor:'#c94b2b', floorType:'forge' });
    }

    scatterFloor(ctx, '#d65f2b', 'ember', 0.18);
    paintWalls(ctx,'#4a1f1a');
    ctx.ensureConnectivity();
  }

  function celestialObservatoryAlgorithm(ctx){
    const { width: W, height: H } = ctx;
    fillAll(ctx,1);

    const centerX = Math.floor(W/2);
    const centerY = Math.floor(H/2);
    const outerR = Math.max(6, Math.floor(Math.min(W,H) * 0.35));
    const innerR = Math.max(3, Math.floor(outerR * 0.45));

    carveRing(ctx, centerX, centerY, outerR, innerR, { floorColor:'#cfd9ff', floorType:'celestial' }, { floorColor:'#e8f0ff', floorType:'celestial' });
    carveCircle(ctx, centerX, centerY, Math.floor(innerR * 0.6), { floorColor:'#f9f6ff', floorType:'ritual' });

    for(let i=0;i<8;i++){
      const angle = (Math.PI * 2 * i) / 8;
      const armLen = outerR + Math.floor(Math.min(W,H) * 0.08);
      const tx = centerX + Math.floor(Math.cos(angle) * armLen);
      const ty = centerY + Math.floor(Math.sin(angle) * armLen);
      carveLine(ctx, centerX, centerY, tx, ty, { floorColor:'#d9e4ff', floorType:'celestial', width:2 });
      carveCircle(ctx, tx, ty, Math.max(2, Math.floor(outerR * 0.18)), { floorColor:'#f2f6ff', floorType:'astral' });
    }

    for(let orbit=innerR + 3; orbit<outerR; orbit+=3){
      carveRing(ctx, centerX, centerY, orbit, orbit-1, { floorColor:'#d4dcff', floorType:'celestial' });
    }

    scatterFloor(ctx, '#f1f4ff', 'starlight', 0.14);
    paintWalls(ctx,'#394d8f');
    ctx.ensureConnectivity();
  }

  function ancientAqueductAlgorithm(ctx){
    const { width: W, height: H, random } = ctx;
    fillAll(ctx,1);

    const channelCount = 3 + Math.floor(random()*2);
    const spacing = Math.floor((H-4) / channelCount);
    for(let i=0;i<channelCount;i++){
      const y0 = 2 + i * spacing;
      carveRect(ctx, 2, y0, W-3, Math.min(H-3, y0 + 1), { floorColor:'#79b9d8', floorType:'water' });
    }

    const columnCount = 4 + Math.floor(W/10);
    for(let i=0;i<columnCount;i++){
      const x = 2 + Math.floor((i/(columnCount-1)) * (W-4));
      carveLine(ctx, x, 2, x, H-3, { floorColor:'#cfd4d8', floorType:'stone', width:1 });
    }

    for(let i=0;i<channelCount;i++){
      const y = 2 + i * spacing;
      for(let j=0;j<columnCount;j+=2){
        const x = 2 + Math.floor((j/(columnCount-1)) * (W-4));
        carveCircle(ctx, x, y, 2, { floorColor:'#8ecbe0', floorType:'pool' });
      }
    }

    carveLine(ctx, 2, Math.floor(H/2), W-3, Math.floor(H/2), { floorColor:'#a9c6d1', floorType:'stone', width:2 });
    scatterFloor(ctx, '#dde7ea', 'mist', 0.1);
    paintWalls(ctx,'#3b5d73');
    ctx.ensureConnectivity();
  }

  function mirrorCatacombAlgorithm(ctx){
    const { width: W, height: H } = ctx;
    fillAll(ctx,1);

    const cellSize = 4;
    for(let y=2; y<H-2; y+=cellSize){
      for(let x=2; x<W-2; x+=cellSize){
        const mirrorX = W - 3 - (x-2);
        const mirrorY = H - 3 - (y-2);
        carveRect(ctx, x, y, Math.min(x+1, W-3), Math.min(y+1, H-3), { floorColor:'#b6a798', floorType:'crypt' });
        carveRect(ctx, mirrorX-1, mirrorY-1, mirrorX, mirrorY, { floorColor:'#b6a798', floorType:'crypt' });
      }
    }

    carveLine(ctx, 2, 2, W-3, H-3, { floorColor:'#cbbbad', floorType:'corridor', width:1 });
    carveLine(ctx, W-3, 2, 2, H-3, { floorColor:'#cbbbad', floorType:'corridor', width:1 });
    carveLine(ctx, Math.floor(W/2), 1, Math.floor(W/2), H-2, { floorColor:'#d9cbb8', floorType:'crypt', width:2 });
    carveLine(ctx, 1, Math.floor(H/2), W-2, Math.floor(H/2), { floorColor:'#d9cbb8', floorType:'crypt', width:2 });

    scatterFloor(ctx, '#e0d5c7', 'urn', 0.12);
    paintWalls(ctx,'#5a4639');
    ctx.ensureConnectivity();
  }

  function floatingArchipelagoAlgorithm(ctx){
    const { width: W, height: H, random } = ctx;
    fillAll(ctx,1);

    const islandCount = 7 + Math.floor(random()*5);
    const islands = [];
    for(let i=0;i<islandCount;i++){
      const r = randomRange(ctx, 2, Math.floor(Math.min(W,H) * 0.12));
      const cx = randomRange(ctx, 3 + r, W - 4 - r);
      const cy = randomRange(ctx, 3 + r, H - 4 - r);
      islands.push({cx, cy, r});
      carveCircle(ctx, cx, cy, r, { floorColor:'#f0e4c7', floorType:'floating' });
      if(random() < 0.35){
        carveRing(ctx, cx, cy, r, Math.max(1, r-2), { floorColor:'#e7d7b0', floorType:'floating' }, { floorColor:'#f6edd7', floorType:'ritual' });
      }
    }

    islands.sort((a,b)=>a.cx-b.cx);
    for(let i=1;i<islands.length;i++){
      const prev = islands[i-1];
      const cur = islands[i];
      carveLine(ctx, prev.cx, prev.cy, cur.cx, cur.cy, { floorColor:'#d7cab0', floorType:'bridge', width:1 });
    }

    islands.forEach(island => {
      if(random() < 0.5){
        const angle = random() * Math.PI * 2;
        const length = Math.floor(Math.min(W,H) * 0.15);
        const ex = island.cx + Math.floor(Math.cos(angle) * length);
        const ey = island.cy + Math.floor(Math.sin(angle) * length);
        carveLine(ctx, island.cx, island.cy, ex, ey, { floorColor:'#d1c09e', floorType:'bridge', width:1 });
      }
    });

    scatterFloor(ctx, '#f9f1db', 'cloud', 0.15);
    paintWalls(ctx,'#987a55');
    ctx.ensureConnectivity();
  }

  function arcaneLibraryAlgorithm(ctx){
    const { width: W, height: H, random } = ctx;
    fillAll(ctx,1);

    const roomW = 5;
    const roomH = 4;
    for(let y=2; y<H-2; y+=roomH+1){
      for(let x=2; x<W-2; x+=roomW+1){
        carveRect(ctx, x, y, Math.min(x+roomW-1, W-3), Math.min(y+roomH-1, H-3), { floorColor:'#d5c6a8', floorType:'library' });
        if(random() < 0.4){
          carveLine(ctx, x, y, Math.min(x+roomW-1, W-3), Math.min(y+roomH-1, H-3), { floorColor:'#e2d4b4', floorType:'shelf', width:1 });
        }
      }
    }

    for(let y=2; y<H-2; y+=roomH+1){
      carveLine(ctx, 2, y, W-3, y, { floorColor:'#cbb997', floorType:'hall', width:1 });
    }
    for(let x=2; x<W-2; x+=roomW+1){
      carveLine(ctx, x, 2, x, H-3, { floorColor:'#cbb997', floorType:'hall', width:1 });
    }

    scatterFloor(ctx, '#efe0c1', 'scroll', 0.16);
    paintWalls(ctx,'#6b523a');
    ctx.ensureConnectivity();
  }

  function emberChasmAlgorithm(ctx){
    const { width: W, height: H, random } = ctx;
    fillAll(ctx,1);

    const perimeter = 2;
    carveRect(ctx, perimeter, perimeter, W-1-perimeter, H-1-perimeter, { floorColor:'#c74126', floorType:'basalt' });
    fillCircle(ctx, Math.floor(W/2), Math.floor(H/2), Math.floor(Math.min(W,H) * 0.18), 1);

    const bridgeCount = 4 + Math.floor(random()*3);
    for(let i=0;i<bridgeCount;i++){
      const angle = (Math.PI * 2 * i) / bridgeCount;
      const ex = Math.floor(W/2 + Math.cos(angle) * (Math.floor(Math.min(W,H)/2) - 3));
      const ey = Math.floor(H/2 + Math.sin(angle) * (Math.floor(Math.min(W,H)/2) - 3));
      carveLine(ctx, Math.floor(W/2), Math.floor(H/2), ex, ey, { floorColor:'#ef6a3a', floorType:'bridge', width:2 });
    }

    carveCircle(ctx, Math.floor(W/2), Math.floor(H/2), Math.floor(Math.min(W,H) * 0.12), { floorColor:'#f28b4c', floorType:'core' });
    scatterFloor(ctx, '#f6a35f', 'ember', 0.2);
    paintWalls(ctx,'#421b16');
    ctx.ensureConnectivity();
  }

  function glacialBastionAlgorithm(ctx){
    const { width: W, height: H, random } = ctx;
    fillAll(ctx,1);

    const centerX = Math.floor(W/2);
    const centerY = Math.floor(H/2);
    carveCircle(ctx, centerX, centerY, Math.floor(Math.min(W,H) * 0.22), { floorColor:'#b0d8f0', floorType:'ice' });

    const arms = 6;
    for(let i=0;i<arms;i++){
      const angle = (Math.PI * 2 * i) / arms;
      const length = Math.floor(Math.min(W,H) * 0.35);
      const ex = centerX + Math.floor(Math.cos(angle) * length);
      const ey = centerY + Math.floor(Math.sin(angle) * length);
      carveLine(ctx, centerX, centerY, ex, ey, { floorColor:'#9ccde8', floorType:'ice', width:2 });
      carveCircle(ctx, ex, ey, 2 + Math.floor(random()*2), { floorColor:'#c8e6f8', floorType:'frost' });
    }

    for(let ring=4; ring<Math.min(W,H)/2 - 2; ring+=4){
      carveRing(ctx, centerX, centerY, ring, ring-1, { floorColor:'#a3d3ec', floorType:'ice' });
    }

    scatterFloor(ctx, '#e8f7ff', 'snow', 0.18);
    paintWalls(ctx,'#2f4e6d');
    ctx.ensureConnectivity();
  }

  function radiantCitadelAlgorithm(ctx){
    const { width: W, height: H } = ctx;
    fillAll(ctx,1);

    const centerX = Math.floor(W/2);
    const centerY = Math.floor(H/2);
    const outerR = Math.max(6, Math.floor(Math.min(W,H) * 0.38));
    const innerR = Math.max(3, Math.floor(outerR * 0.5));
    const palette = ['#fce69b','#ffd17a','#f7b56f','#ffeac5'];

    carveRing(ctx, centerX, centerY, outerR, innerR, { floorColor:'#f9d67e', floorType:'radiant' }, { floorColor:'#fff4cf', floorType:'sanctum' });
    carveCircle(ctx, centerX, centerY, Math.floor(innerR * 0.55), { floorColor:'#fff7df', floorType:'altar' });

    const rays = 12;
    for(let i=0;i<rays;i++){
      const angle = (Math.PI * 2 * i) / rays;
      const length = outerR + Math.floor(Math.min(W,H) * 0.1);
      const tx = centerX + Math.floor(Math.cos(angle) * length);
      const ty = centerY + Math.floor(Math.sin(angle) * length);
      const color = palette[i % palette.length];
      carveLine(ctx, centerX, centerY, tx, ty, { floorColor:color, floorType:'radiant', width:3 });
      carveCircle(ctx, tx, ty, Math.max(2, Math.floor(outerR * 0.12)), { floorColor:'#ffe7b2', floorType:'spire' });
    }

    for(let orbit = innerR + 2; orbit <= outerR - 2; orbit += 3){
      carveRing(ctx, centerX, centerY, orbit, orbit-1, { floorColor:'#f8d08a', floorType:'halo' });
    }

    scatterPalette(ctx, ['#fff2c7','#ffe2a9','#ffd48f'], 'blessing', 0.2);
    paintWalls(ctx,'#b26d2f');
    ctx.ensureConnectivity();
  }

  function moonlitCloisterAlgorithm(ctx){
    const { width: W, height: H } = ctx;
    fillAll(ctx,1);

    const margin = 2;
    carveRect(ctx, margin, margin, W-1-margin, H-1-margin, { floorColor:'#c9d6f2', floorType:'marble' });

    const centerX = Math.floor(W/2);
    const centerY = Math.floor(H/2);
    carveRect(ctx, centerX-2, margin, centerX+2, H-1-margin, { floorColor:'#b7c8e8', floorType:'hall' });
    carveRect(ctx, margin, centerY-2, W-1-margin, centerY+2, { floorColor:'#b7c8e8', floorType:'hall' });

    carveCircle(ctx, centerX, centerY, Math.floor(Math.min(W,H) * 0.18), { floorColor:'#e6ecff', floorType:'ritual' });

    const cloisterPalette = ['#dbe5fb','#ccd7f1','#e9f1ff'];
    const gardens = [
      [margin+3, margin+3],
      [W-4, margin+3],
      [margin+3, H-4],
      [W-4, H-4]
    ];
    gardens.forEach(([gx, gy]) => {
      carveCircle(ctx, gx, gy, 3, { floorColor:'#a8c4e6', floorType:'garden' });
      carveCircle(ctx, gx, gy, 1, { floorColor:'#d8e6fb', floorType:'fountain' });
    });

    carveLine(ctx, margin, margin, W-1-margin, H-1-margin, { floorColor:'#a9bbdf', floorType:'passage', width:1 });
    carveLine(ctx, W-1-margin, margin, margin, H-1-margin, { floorColor:'#a9bbdf', floorType:'passage', width:1 });

    scatterPalette(ctx, cloisterPalette, 'lily', 0.16);
    paintWalls(ctx,'#3e4f7d');
    ctx.ensureConnectivity();
  }

  function verdantTerracesAlgorithm(ctx){
    const { width: W, height: H } = ctx;
    fillAll(ctx,1);

    const layers = 5;
    const palette = ['#89c48c','#7bb879','#6fab6d','#9ad49a','#aedfae'];
    for(let i=0;i<layers;i++){
      const padding = 2 + i * 2;
      const yOffset = i % 2 === 0 ? 0 : 1;
      const x0 = padding;
      const y0 = padding + yOffset;
      const x1 = W - 1 - padding;
      const y1 = Math.max(y0, H - 1 - padding - (yOffset ? 1 : 0));
      carveRect(ctx, x0, y0, x1, y1, { floorColor:palette[i % palette.length], floorType:'terrace' });
    }

    for(let step=3; step<W-3; step+=4){
      carveLine(ctx, step, 2, Math.max(2, step-2), H-3, { floorColor:'#74a86e', floorType:'canal', width:1 });
    }
    for(let step=3; step<H-3; step+=4){
      carveLine(ctx, 2, step, W-3, Math.max(2, step-2), { floorColor:'#6da064', floorType:'canal', width:1 });
    }

    scatterPalette(ctx, ['#b9e4b5','#c7efc3','#a1d69b'], 'flora', 0.2);
    paintWalls(ctx,'#375738');
    ctx.ensureConnectivity();
  }

  function tempestBastionAlgorithm(ctx){
    const { width: W, height: H } = ctx;
    fillAll(ctx,1);

    const centerX = Math.floor(W/2);
    const centerY = Math.floor(H/2);
    const maxRadius = Math.max(6, Math.floor(Math.min(W,H) * 0.4));
    let prevX = centerX;
    let prevY = centerY;
    for(let step=0; step<maxRadius * 6; step++){
      const angle = step * 0.38;
      const radius = maxRadius - step * 0.28;
      if(radius < 2) break;
      const x = centerX + Math.floor(Math.cos(angle) * radius);
      const y = centerY + Math.floor(Math.sin(angle) * radius);
      carveLine(ctx, prevX, prevY, x, y, { floorColor:'#84b8ff', floorType:'wind', width:2 });
      if(step % 5 === 0){
        carveCircle(ctx, x, y, 2, { floorColor:'#b7d9ff', floorType:'eye' });
      }
      prevX = x;
      prevY = y;
    }

    const anchorCount = 6;
    for(let i=0;i<anchorCount;i++){
      const angle = (Math.PI * 2 * i) / anchorCount;
      const tx = centerX + Math.floor(Math.cos(angle) * (maxRadius + 1));
      const ty = centerY + Math.floor(Math.sin(angle) * (maxRadius + 1));
      carveLine(ctx, centerX, centerY, tx, ty, { floorColor:'#9cc8ff', floorType:'storm', width:1 });
      carveCircle(ctx, tx, ty, 2, { floorColor:'#c7e3ff', floorType:'spire' });
    }

    scatterPalette(ctx, ['#cfe6ff','#a9ceff','#e1f0ff'], 'gust', 0.18);
    paintWalls(ctx,'#2f4774');
    ctx.ensureConnectivity();
  }

  function sunkenArcadiaAlgorithm(ctx){
    const { width: W, height: H } = ctx;
    fillAll(ctx,1);

    const innerPadding = 2;
    carveRect(ctx, innerPadding, innerPadding, W-1-innerPadding, H-1-innerPadding, { floorColor:'#5a8fae', floorType:'stone' });

    const cols = 3;
    const rows = 3;
    const cellW = Math.floor((W - innerPadding * 2 - (cols-1)) / cols);
    const cellH = Math.floor((H - innerPadding * 2 - (rows-1)) / rows);
    for(let r=0; r<rows; r++){
      for(let c=0; c<cols; c++){
        const x0 = innerPadding + c * (cellW + 1);
        const y0 = innerPadding + r * (cellH + 1);
        const x1 = Math.min(W-1-innerPadding, x0 + cellW - 1);
        const y1 = Math.min(H-1-innerPadding, y0 + cellH - 1);
        carveRect(ctx, x0, y0, x1, y1, { floorColor:'#3f6d88', floorType:'water' });
        carveRect(ctx, x0+1, y0+1, Math.max(x0+1, x1-1), Math.max(y0+1, y1-1), { floorColor:'#689eb9', floorType:'shallows' });
      }
    }

    carveRect(ctx, Math.floor(W/2)-2, innerPadding, Math.floor(W/2)+2, H-1-innerPadding, { floorColor:'#7aaec5', floorType:'pier' });
    carveRect(ctx, innerPadding, Math.floor(H/2)-2, W-1-innerPadding, Math.floor(H/2)+2, { floorColor:'#7aaec5', floorType:'pier' });

    for(let i=0;i<cols;i++){
      const x = innerPadding + i * (cellW + 1) + Math.floor(cellW/2);
      carveLine(ctx, x, innerPadding, x, H-1-innerPadding, { floorColor:'#87bfd3', floorType:'channel', width:1 });
    }
    for(let i=0;i<rows;i++){
      const y = innerPadding + i * (cellH + 1) + Math.floor(cellH/2);
      carveLine(ctx, innerPadding, y, W-1-innerPadding, y, { floorColor:'#87bfd3', floorType:'channel', width:1 });
    }

    scatterPalette(ctx, ['#9fd4e5','#b7e7f3','#83c4d7'], 'spray', 0.22);
    paintWalls(ctx,'#1f3a4d');
    ctx.ensureConnectivity();
  }

  const generators = [
    {
      id: 'royal-keep',
      name: '王都城郭',
      nameKey: "dungeon.types.royal_keep.name",
      description: '王城の大広間と城郭塔が広がるシンメトリなダンジョン',
      descriptionKey: "dungeon.types.royal_keep.description",
      algorithm: royalKeepAlgorithm,
      mixin: { normalMixed: 0.6, blockDimMixed: 0.55, tags: ['castle','symmetry','royal'] }
    },
    {
      id: 'mystic-wood',
      name: '精霊の森回廊',
      nameKey: "dungeon.types.mystic_wood.name",
      description: '複数の聖なる林と小道がつながる自然派ダンジョン',
      descriptionKey: "dungeon.types.mystic_wood.description",
      algorithm: mysticWoodAlgorithm,
      mixin: { normalMixed: 0.45, blockDimMixed: 0.5, tags: ['forest','organic','nature'] }
    },
    {
      id: 'crystal-depths',
      name: '星晶洞窟',
      nameKey: "dungeon.types.crystal_depths.name",
      description: '光る星晶の迷路を彷徨う王道ファンタジーの地下洞窟',
      descriptionKey: "dungeon.types.crystal_depths.description",
      algorithm: crystalDepthsAlgorithm,
      mixin: { normalMixed: 0.4, blockDimMixed: 0.55, tags: ['cave','crystal','mystic'] }
    },
    {
      id: 'sacred-sanctum',
      name: '聖堂回廊',
      nameKey: "dungeon.types.sacred_sanctum.name",
      description: '聖印が幾重にも刻まれた礼拝堂型迷宮',
      descriptionKey: "dungeon.types.sacred_sanctum.description",
      algorithm: sanctumAlgorithm,
      mixin: { normalMixed: 0.5, blockDimMixed: 0.6, tags: ['temple','holy','structured'] }
    },
    {
      id: 'dragon-forge',
      name: '竜骨熔鉱炉',
      nameKey: "dungeon.types.dragon_forge.name",
      description: '竜の息吹で灼けた熔鉱炉と溶岩の河が交差する灼熱ダンジョン',
      descriptionKey: "dungeon.types.dragon_forge.description",
      algorithm: dragonForgeAlgorithm,
      mixin: { normalMixed: 0.35, blockDimMixed: 0.5, tags: ['lava','forge','dragon'] }
    },
    {
      id: 'celestial-observatory',
      name: '天空観測塔',
      nameKey: "dungeon.types.celestial_observatory.name",
      description: '天体観測儀が巡る星環と星図の腕が伸びる天空迷宮',
      descriptionKey: "dungeon.types.celestial_observatory.description",
      algorithm: celestialObservatoryAlgorithm,
      mixin: { normalMixed: 0.55, blockDimMixed: 0.6, tags: ['sky','ritual','symmetry'] }
    },
    {
      id: 'ancient-aqueduct',
      name: '古代水路迷宮',
      nameKey: "dungeon.types.ancient_aqueduct.name",
      description: '水脈が幾重にも流れるアクアダクトを辿る迷宮都市',
      descriptionKey: "dungeon.types.ancient_aqueduct.description",
      algorithm: ancientAqueductAlgorithm,
      mixin: { normalMixed: 0.45, blockDimMixed: 0.5, tags: ['water','engineered','city'] }
    },
    {
      id: 'mirror-catacomb',
      name: '鏡写しの地下墓所',
      nameKey: "dungeon.types.mirror_catacomb.name",
      description: '鏡合わせの回廊が交差し霊廟が整然と並ぶ地下墓所',
      descriptionKey: "dungeon.types.mirror_catacomb.description",
      algorithm: mirrorCatacombAlgorithm,
      mixin: { normalMixed: 0.5, blockDimMixed: 0.55, tags: ['crypt','symmetry','labyrinth'] }
    },
    {
      id: 'floating-archipelago',
      name: '浮遊諸島遺跡',
      nameKey: "dungeon.types.floating_archipelago.name",
      description: '浮かぶ島々と雲橋を渡る空中遺跡の多島海ダンジョン',
      descriptionKey: "dungeon.types.floating_archipelago.description",
      algorithm: floatingArchipelagoAlgorithm,
      mixin: { normalMixed: 0.4, blockDimMixed: 0.45, tags: ['floating','bridge','open'] }
    },
    {
      id: 'arcane-library',
      name: '封印図書迷宮',
      nameKey: "dungeon.types.arcane_library.name",
      description: '無数の書庫と閲覧回廊が格子状に連なる魔導図書館',
      descriptionKey: "dungeon.types.arcane_library.description",
      algorithm: arcaneLibraryAlgorithm,
      mixin: { normalMixed: 0.6, blockDimMixed: 0.65, tags: ['library','grid','mystic'] }
    },
    {
      id: 'ember-chasm',
      name: '焔裂の深淵',
      nameKey: "dungeon.types.ember_chasm.name",
      description: '熾火の裂け目と火橋が放射状に伸びる火口迷宮',
      descriptionKey: "dungeon.types.ember_chasm.description",
      algorithm: emberChasmAlgorithm,
      mixin: { normalMixed: 0.35, blockDimMixed: 0.45, tags: ['lava','abyss','bridge'] }
    },
    {
      id: 'glacial-bastion',
      name: '氷晶の要塞',
      nameKey: "dungeon.types.glacial_bastion.name",
      description: '氷晶の輪郭が幾層にも重なる極寒の星型砦ダンジョン',
      descriptionKey: "dungeon.types.glacial_bastion.description",
      algorithm: glacialBastionAlgorithm,
      mixin: { normalMixed: 0.42, blockDimMixed: 0.5, tags: ['ice','fortress','radial'] }
    },
    {
      id: 'radiant-citadel',
      name: '光輝王城環',
      nameKey: "dungeon.types.radiant_citadel.name",
      description: '黄金の星環と光条が幾層に放たれる聖なる王城ダンジョン',
      descriptionKey: "dungeon.types.radiant_citadel.description",
      algorithm: radiantCitadelAlgorithm,
      mixin: { normalMixed: 0.55, blockDimMixed: 0.6, tags: ['holy','castle','radial'] }
    },
    {
      id: 'moonlit-cloister',
      name: '月影の回廊院',
      nameKey: "dungeon.types.moonlit_cloister.name",
      description: '月光が射す十字回廊と水鏡庭園が静かに連なる修道院迷宮',
      descriptionKey: "dungeon.types.moonlit_cloister.description",
      algorithm: moonlitCloisterAlgorithm,
      mixin: { normalMixed: 0.52, blockDimMixed: 0.58, tags: ['cloister','symmetric','water'] }
    },
    {
      id: 'verdant-terraces',
      name: '翠嶺段丘',
      nameKey: "dungeon.types.verdant_terraces.name",
      description: '段丘庭園と水路が縦横に巡る大地のテラス迷宮',
      descriptionKey: "dungeon.types.verdant_terraces.description",
      algorithm: verdantTerracesAlgorithm,
      mixin: { normalMixed: 0.48, blockDimMixed: 0.52, tags: ['garden','layered','nature'] }
    },
    {
      id: 'tempest-bastion',
      name: '嵐輪の城塞',
      nameKey: "dungeon.types.tempest_bastion.name",
      description: '旋風が描く螺旋導路と雷柱が交わる暴風城塞ダンジョン',
      descriptionKey: "dungeon.types.tempest_bastion.description",
      algorithm: tempestBastionAlgorithm,
      mixin: { normalMixed: 0.4, blockDimMixed: 0.48, tags: ['storm','spiral','fortress'] }
    },
    {
      id: 'sunken-arcadia',
      name: '沈瑠璃の古都',
      nameKey: "dungeon.types.sunken_arcadia.name",
      description: '水没した回廊都市と碧い水庭が格子状に広がる幻想水都',
      descriptionKey: "dungeon.types.sunken_arcadia.description",
      algorithm: sunkenArcadiaAlgorithm,
      mixin: { normalMixed: 0.47, blockDimMixed: 0.53, tags: ['water','city','ritual'] }
    }
  ];

  function mkBoss(depth){
    const floors = [];
    if(depth >= 5) floors.push(5);
    if(depth >= 10) floors.push(10);
    if(depth >= 15) floors.push(15);
    if(depth >= 20) floors.push(20);
    return floors;
  }

  const blocks = {
    blocks1: [
      {
        key:'jrpg_legends_story_01',
        name:'Legends Story I',
        nameKey: "dungeon.types.royal_keep.blocks.jrpg_legends_story_01.name",
        level:+0,
        size:0,
        depth:+1,
        chest:'normal',
        type:'royal-keep',
        bossFloors:mkBoss(6)
      },
      {
        key:'jrpg_legends_story_02',
        name:'Legends Story II',
        nameKey: "dungeon.types.mystic_wood.blocks.jrpg_legends_story_02.name",
        level:+6,
        size:+1,
        depth:+1,
        chest:'less',
        type:'mystic-wood',
        bossFloors:mkBoss(8)
      },
      {
        key:'jrpg_legends_story_03',
        name:'Legends Story III',
        nameKey: "dungeon.types.crystal_depths.blocks.jrpg_legends_story_03.name",
        level:+12,
        size:+1,
        depth:+2,
        chest:'more',
        type:'crystal-depths',
        bossFloors:mkBoss(10)
      },
      {
        key:'jrpg_legends_story_04',
        name:'Legends Story IV',
        nameKey: "dungeon.types.sacred_sanctum.blocks.jrpg_legends_story_04.name",
        level:+18,
        size:+2,
        depth:+2,
        chest:'normal',
        type:'sacred-sanctum',
        bossFloors:mkBoss(12)
      },
      {
        key:'jrpg_legends_story_05',
        name:'Legends Story V',
        nameKey: "dungeon.types.dragon_forge.blocks.jrpg_legends_story_05.name",
        level:+24,
        size:+2,
        depth:+3,
        chest:'less',
        type:'dragon-forge',
        bossFloors:mkBoss(15)
      },
      {
        key:'jrpg_legends_story_06',
        name:'Legends Story VI',
        nameKey: "dungeon.types.celestial_observatory.blocks.jrpg_legends_story_06.name",
        level:+30,
        size:+2,
        depth:+3,
        chest:'more',
        type:'celestial-observatory',
        bossFloors:mkBoss(18)
      },
      {
        key:'jrpg_legends_story_07',
        name:'Legends Story VII',
        nameKey: "dungeon.types.ancient_aqueduct.blocks.jrpg_legends_story_07.name",
        level:+36,
        size:+3,
        depth:+3,
        chest:'normal',
        type:'ancient-aqueduct',
        bossFloors:mkBoss(18)
      },
      {
        key:'jrpg_legends_story_08',
        name:'Legends Story VIII',
        nameKey: "dungeon.types.mirror_catacomb.blocks.jrpg_legends_story_08.name",
        level:+42,
        size:+3,
        depth:+4,
        chest:'more',
        type:'mirror-catacomb',
        bossFloors:mkBoss(20)
      },
      {
        key:'jrpg_legends_story_09',
        name:'Legends Story IX',
        nameKey: "dungeon.types.floating_archipelago.blocks.jrpg_legends_story_09.name",
        level:+48,
        size:+3,
        depth:+4,
        chest:'less',
        type:'floating-archipelago',
        bossFloors:mkBoss(20)
      },
      {
        key:'jrpg_legends_story_10',
        name:'Legends Story X',
        nameKey: "dungeon.types.arcane_library.blocks.jrpg_legends_story_10.name",
        level:+54,
        size:+4,
        depth:+5,
        chest:'legend',
        type:'arcane-library',
        bossFloors:mkBoss(20)
      },
      {
        key:'jrpg_legends_story_11',
        name:'Legends Story XI',
        nameKey: "dungeon.types.radiant_citadel.blocks.jrpg_legends_story_11.name",
        level:+60,
        size:+4,
        depth:+5,
        chest:'legend',
        type:'radiant-citadel',
        bossFloors:mkBoss(20)
      },
      {
        key:'jrpg_legends_story_12',
        name:'Legends Story XII',
        nameKey: "dungeon.types.moonlit_cloister.blocks.jrpg_legends_story_12.name",
        level:+66,
        size:+4,
        depth:+5,
        chest:'more',
        type:'moonlit-cloister',
        bossFloors:mkBoss(20)
      },
      {
        key:'jrpg_legends_story_13',
        name:'Legends Story XIII',
        nameKey: "dungeon.types.verdant_terraces.blocks.jrpg_legends_story_13.name",
        level:+72,
        size:+5,
        depth:+6,
        chest:'legend',
        type:'verdant-terraces',
        bossFloors:mkBoss(20)
      },
      {
        key:'jrpg_legends_story_14',
        name:'Legends Story XIV',
        nameKey: "dungeon.types.tempest_bastion.blocks.jrpg_legends_story_14.name",
        level:+78,
        size:+5,
        depth:+6,
        chest:'legend',
        type:'tempest-bastion',
        bossFloors:mkBoss(20)
      },
      {
        key:'jrpg_legends_story_15',
        name:'Legends Story XV',
        nameKey: "dungeon.types.sunken_arcadia.blocks.jrpg_legends_story_15.name",
        level:+84,
        size:+5,
        depth:+6,
        chest:'legend',
        type:'sunken-arcadia',
        bossFloors:mkBoss(20)
      }
    ],
    blocks2: [
      {
        key:'jrpg_legends_adventure_01',
        name:'Adventure I',
        nameKey: "dungeon.types.royal_keep.blocks.jrpg_legends_adventure_01.name",
        level:+0,
        size:+1,
        depth:0,
        chest:'normal',
        type:'royal-keep'
      },
      {
        key:'jrpg_legends_adventure_02',
        name:'Adventure II',
        nameKey: "dungeon.types.mystic_wood.blocks.jrpg_legends_adventure_02.name",
        level:+6,
        size:+1,
        depth:+1,
        chest:'more',
        type:'mystic-wood'
      },
      {
        key:'jrpg_legends_adventure_03',
        name:'Adventure III',
        nameKey: "dungeon.types.crystal_depths.blocks.jrpg_legends_adventure_03.name",
        level:+12,
        size:+2,
        depth:+1,
        chest:'less',
        type:'crystal-depths'
      },
      {
        key:'jrpg_legends_adventure_04',
        name:'Adventure IV',
        nameKey: "dungeon.types.sacred_sanctum.blocks.jrpg_legends_adventure_04.name",
        level:+18,
        size:+2,
        depth:+2,
        chest:'normal',
        type:'sacred-sanctum'
      },
      {
        key:'jrpg_legends_adventure_05',
        name:'Adventure V',
        nameKey: "dungeon.types.dragon_forge.blocks.jrpg_legends_adventure_05.name",
        level:+24,
        size:+3,
        depth:+2,
        chest:'more',
        type:'dragon-forge'
      },
      {
        key:'jrpg_legends_adventure_06',
        name:'Adventure VI',
        nameKey: "dungeon.types.celestial_observatory.blocks.jrpg_legends_adventure_06.name",
        level:+30,
        size:+3,
        depth:+3,
        chest:'normal',
        type:'celestial-observatory'
      },
      {
        key:'jrpg_legends_adventure_07',
        name:'Adventure VII',
        nameKey: "dungeon.types.ancient_aqueduct.blocks.jrpg_legends_adventure_07.name",
        level:+36,
        size:+3,
        depth:+3,
        chest:'more',
        type:'ancient-aqueduct'
      },
      {
        key:'jrpg_legends_adventure_08',
        name:'Adventure VIII',
        nameKey: "dungeon.types.mirror_catacomb.blocks.jrpg_legends_adventure_08.name",
        level:+42,
        size:+3,
        depth:+3,
        chest:'less',
        type:'mirror-catacomb'
      },
      {
        key:'jrpg_legends_adventure_09',
        name:'Adventure IX',
        nameKey: "dungeon.types.floating_archipelago.blocks.jrpg_legends_adventure_09.name",
        level:+48,
        size:+4,
        depth:+4,
        chest:'normal',
        type:'floating-archipelago'
      },
      {
        key:'jrpg_legends_adventure_10',
        name:'Adventure X',
        nameKey: "dungeon.types.arcane_library.blocks.jrpg_legends_adventure_10.name",
        level:+54,
        size:+4,
        depth:+4,
        chest:'more',
        type:'arcane-library'
      },
      {
        key:'jrpg_legends_adventure_11',
        name:'Adventure XI',
        nameKey: "dungeon.types.radiant_citadel.blocks.jrpg_legends_adventure_11.name",
        level:+60,
        size:+4,
        depth:+4,
        chest:'legend',
        type:'radiant-citadel'
      },
      {
        key:'jrpg_legends_adventure_12',
        name:'Adventure XII',
        nameKey: "dungeon.types.moonlit_cloister.blocks.jrpg_legends_adventure_12.name",
        level:+66,
        size:+4,
        depth:+5,
        chest:'normal',
        type:'moonlit-cloister'
      },
      {
        key:'jrpg_legends_adventure_13',
        name:'Adventure XIII',
        nameKey: "dungeon.types.verdant_terraces.blocks.jrpg_legends_adventure_13.name",
        level:+72,
        size:+5,
        depth:+5,
        chest:'more',
        type:'verdant-terraces'
      },
      {
        key:'jrpg_legends_adventure_14',
        name:'Adventure XIV',
        nameKey: "dungeon.types.tempest_bastion.blocks.jrpg_legends_adventure_14.name",
        level:+78,
        size:+5,
        depth:+5,
        chest:'legend',
        type:'tempest-bastion'
      },
      {
        key:'jrpg_legends_adventure_15',
        name:'Adventure XV',
        nameKey: "dungeon.types.sunken_arcadia.blocks.jrpg_legends_adventure_15.name",
        level:+84,
        size:+5,
        depth:+6,
        chest:'legend',
        type:'sunken-arcadia'
      }
    ],
    blocks3: [
      {
        key:'jrpg_legends_trial_01',
        name:'Trial I',
        nameKey: "dungeon.types.royal_keep.blocks.jrpg_legends_trial_01.name",
        level:+0,
        size:0,
        depth:+2,
        chest:'more',
        type:'royal-keep',
        bossFloors:[5]
      },
      {
        key:'jrpg_legends_trial_02',
        name:'Trial II',
        nameKey: "dungeon.types.mystic_wood.blocks.jrpg_legends_trial_02.name",
        level:+9,
        size:+1,
        depth:+2,
        chest:'normal',
        type:'mystic-wood',
        bossFloors:[10]
      },
      {
        key:'jrpg_legends_trial_03',
        name:'Trial III',
        nameKey: "dungeon.types.crystal_depths.blocks.jrpg_legends_trial_03.name",
        level:+18,
        size:+1,
        depth:+3,
        chest:'less',
        type:'crystal-depths',
        bossFloors:[15]
      },
      {
        key:'jrpg_legends_trial_04',
        name:'Trial IV',
        nameKey: "dungeon.types.sacred_sanctum.blocks.jrpg_legends_trial_04.name",
        level:+24,
        size:+2,
        depth:+3,
        chest:'more',
        type:'sacred-sanctum',
        bossFloors:[10,15]
      },
      {
        key:'jrpg_legends_trial_05',
        name:'Trial V',
        nameKey: "dungeon.types.dragon_forge.blocks.jrpg_legends_trial_05.name",
        level:+30,
        size:+2,
        depth:+4,
        chest:'normal',
        type:'dragon-forge',
        bossFloors:[5,10,15]
      },
      {
        key:'jrpg_legends_trial_06',
        name:'Trial VI',
        nameKey: "dungeon.types.celestial_observatory.blocks.jrpg_legends_trial_06.name",
        level:+36,
        size:+3,
        depth:+4,
        chest:'more',
        type:'celestial-observatory',
        bossFloors:[10,15,20]
      },
      {
        key:'jrpg_legends_trial_07',
        name:'Trial VII',
        nameKey: "dungeon.types.ancient_aqueduct.blocks.jrpg_legends_trial_07.name",
        level:+42,
        size:+3,
        depth:+4,
        chest:'normal',
        type:'ancient-aqueduct',
        bossFloors:[10,15,20]
      },
      {
        key:'jrpg_legends_trial_08',
        name:'Trial VIII',
        nameKey: "dungeon.types.mirror_catacomb.blocks.jrpg_legends_trial_08.name",
        level:+48,
        size:+3,
        depth:+5,
        chest:'more',
        type:'mirror-catacomb',
        bossFloors:[15,20]
      },
      {
        key:'jrpg_legends_trial_09',
        name:'Trial IX',
        nameKey: "dungeon.types.floating_archipelago.blocks.jrpg_legends_trial_09.name",
        level:+54,
        size:+4,
        depth:+5,
        chest:'legend',
        type:'floating-archipelago',
        bossFloors:[15,20]
      },
      {
        key:'jrpg_legends_trial_10',
        name:'Trial X',
        nameKey: "dungeon.types.ember_chasm.blocks.jrpg_legends_trial_10.name",
        level:+60,
        size:+4,
        depth:+6,
        chest:'legend',
        type:'ember-chasm',
        bossFloors:[10,15,20]
      },
      {
        key:'jrpg_legends_trial_11',
        name:'Trial XI',
        nameKey: "dungeon.types.radiant_citadel.blocks.jrpg_legends_trial_11.name",
        level:+66,
        size:+4,
        depth:+6,
        chest:'legend',
        type:'radiant-citadel',
        bossFloors:[10,15,20]
      },
      {
        key:'jrpg_legends_trial_12',
        name:'Trial XII',
        nameKey: "dungeon.types.moonlit_cloister.blocks.jrpg_legends_trial_12.name",
        level:+72,
        size:+4,
        depth:+6,
        chest:'legend',
        type:'moonlit-cloister',
        bossFloors:[10,15,20]
      },
      {
        key:'jrpg_legends_trial_13',
        name:'Trial XIII',
        nameKey: "dungeon.types.verdant_terraces.blocks.jrpg_legends_trial_13.name",
        level:+78,
        size:+5,
        depth:+7,
        chest:'legend',
        type:'verdant-terraces',
        bossFloors:[10,15,20]
      },
      {
        key:'jrpg_legends_trial_14',
        name:'Trial XIV',
        nameKey: "dungeon.types.tempest_bastion.blocks.jrpg_legends_trial_14.name",
        level:+84,
        size:+5,
        depth:+7,
        chest:'legend',
        type:'tempest-bastion',
        bossFloors:[15,20]
      },
      {
        key:'jrpg_legends_trial_15',
        name:'Trial XV',
        nameKey: "dungeon.types.sunken_arcadia.blocks.jrpg_legends_trial_15.name",
        level:+90,
        size:+5,
        depth:+7,
        chest:'legend',
        type:'sunken-arcadia',
        bossFloors:[15,20]
      }
    ],
    blocks4: [
      {
        key:'jrpg_legends_raid_01',
        name:'Raid I',
        nameKey: "dungeon.types.ember_chasm.blocks.jrpg_legends_raid_01.name",
        level:+45,
        size:+4,
        depth:+5,
        chest:'more',
        type:'ember-chasm',
        bossFloors:mkBoss(20)
      },
      {
        key:'jrpg_legends_raid_02',
        name:'Raid II',
        nameKey: "dungeon.types.glacial_bastion.blocks.jrpg_legends_raid_02.name",
        level:+48,
        size:+4,
        depth:+5,
        chest:'normal',
        type:'glacial-bastion',
        bossFloors:mkBoss(20)
      },
      {
        key:'jrpg_legends_raid_03',
        name:'Raid III',
        nameKey: "dungeon.types.celestial_observatory.blocks.jrpg_legends_raid_03.name",
        level:+51,
        size:+4,
        depth:+6,
        chest:'legend',
        type:'celestial-observatory',
        bossFloors:[10,15,20]
      },
      {
        key:'jrpg_legends_raid_04',
        name:'Raid IV',
        nameKey: "dungeon.types.floating_archipelago.blocks.jrpg_legends_raid_04.name",
        level:+54,
        size:+5,
        depth:+6,
        chest:'legend',
        type:'floating-archipelago',
        bossFloors:[15,20]
      },
      {
        key:'jrpg_legends_raid_05',
        name:'Raid V',
        nameKey: "dungeon.types.arcane_library.blocks.jrpg_legends_raid_05.name",
        level:+57,
        size:+5,
        depth:+6,
        chest:'more',
        type:'arcane-library',
        bossFloors:[10,15,20]
      },
      {
        key:'jrpg_legends_raid_06',
        name:'Raid VI',
        nameKey: "dungeon.types.glacial_bastion.blocks.jrpg_legends_raid_06.name",
        level:+60,
        size:+5,
        depth:+7,
        chest:'legend',
        type:'glacial-bastion',
        bossFloors:[15,20]
      },
      {
        key:'jrpg_legends_raid_07',
        name:'Raid VII',
        nameKey: "dungeon.types.mirror_catacomb.blocks.jrpg_legends_raid_07.name",
        level:+63,
        size:+5,
        depth:+7,
        chest:'legend',
        type:'mirror-catacomb',
        bossFloors:[10,15,20]
      },
      {
        key:'jrpg_legends_raid_08',
        name:'Raid VIII',
        nameKey: "dungeon.types.ember_chasm.blocks.jrpg_legends_raid_08.name",
        level:+66,
        size:+6,
        depth:+8,
        chest:'legend',
        type:'ember-chasm',
        bossFloors:[10,15,20]
      },
      {
        key:'jrpg_legends_raid_09',
        name:'Raid IX',
        nameKey: "dungeon.types.radiant_citadel.blocks.jrpg_legends_raid_09.name",
        level:+69,
        size:+6,
        depth:+8,
        chest:'legend',
        type:'radiant-citadel',
        bossFloors:[10,15,20]
      },
      {
        key:'jrpg_legends_raid_10',
        name:'Raid X',
        nameKey: "dungeon.types.moonlit_cloister.blocks.jrpg_legends_raid_10.name",
        level:+72,
        size:+6,
        depth:+8,
        chest:'legend',
        type:'moonlit-cloister',
        bossFloors:[15,20]
      },
      {
        key:'jrpg_legends_raid_11',
        name:'Raid XI',
        nameKey: "dungeon.types.verdant_terraces.blocks.jrpg_legends_raid_11.name",
        level:+75,
        size:+6,
        depth:+9,
        chest:'legend',
        type:'verdant-terraces',
        bossFloors:[10,15,20]
      },
      {
        key:'jrpg_legends_raid_12',
        name:'Raid XII',
        nameKey: "dungeon.types.tempest_bastion.blocks.jrpg_legends_raid_12.name",
        level:+78,
        size:+6,
        depth:+9,
        chest:'legend',
        type:'tempest-bastion',
        bossFloors:[10,15,20]
      },
      {
        key:'jrpg_legends_raid_13',
        name:'Raid XIII',
        nameKey: "dungeon.types.sunken_arcadia.blocks.jrpg_legends_raid_13.name",
        level:+81,
        size:+6,
        depth:+9,
        chest:'legend',
        type:'sunken-arcadia',
        bossFloors:[15,20]
      }
    ],
  };
  window.registerDungeonAddon({
    id:'classic_jrpg_legends_pack',
    name:'王道ファンタジーJRPGレジェンズパック',
    nameKey: "dungeon.packs.classic_jrpg_legends_pack.name",
    version:'3.0.0',
    blocks,
    generators
  });
})();

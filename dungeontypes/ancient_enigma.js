// Addon: Ancient Enigma Complex - ritual puzzle vaults with archaeological layers
(function(){
  const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2;

  function paintFloor(ctx, x, y, color){
    if(ctx.inBounds(x, y)){
      ctx.set(x, y, 0);
      if(color){
        ctx.setFloorColor(x, y, color);
      }
    }
  }

  function carveEllipseRoom(ctx, cx, cy, rx, ry, color){
    for(let y = -ry; y <= ry; y++){
      const nx = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))));
      for(let x = -nx; x <= nx; x++){
        paintFloor(ctx, cx + x, cy + y, color);
      }
    }
  }

  function carveRectLoop(ctx, x0, y0, x1, y1, thickness, color){
    for(let t = 0; t < thickness; t++){
      const minX = x0 + t;
      const maxX = x1 - t;
      const minY = y0 + t;
      const maxY = y1 - t;
      for(let x = minX; x <= maxX; x++){
        paintFloor(ctx, x, minY, color);
        paintFloor(ctx, x, maxY, color);
      }
      for(let y = minY; y <= maxY; y++){
        paintFloor(ctx, minX, y, color);
        paintFloor(ctx, maxX, y, color);
      }
    }
  }

  function bresenhamLine(x0, y0, x1, y1){
    const points = [];
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while(true){
      points.push([x0, y0]);
      if(x0 === x1 && y0 === y1) break;
      const e2 = err * 2;
      if(e2 > -dy){ err -= dy; x0 += sx; }
      if(e2 < dx){ err += dx; y0 += sy; }
    }
    return points;
  }

  function carveCorridor(ctx, from, to, palette, rng){
    const color = palette[Math.floor(rng() * palette.length)];
    let last = from;
    const segments = 2 + Math.floor(distance(from, to) / 6);
    const waypoints = [from];
    let angle = Math.atan2(to.y - from.y, to.x - from.x);
    for(let i = 1; i < segments; i++){
      const t = i / segments;
      const radius = lerp(3, 0.5, t);
      angle += (i % 2 === 0 ? 1 : -1) * (Math.PI / GOLDEN_RATIO) * 0.25;
      const px = Math.round(lerp(from.x, to.x, t) + Math.cos(angle) * radius);
      const py = Math.round(lerp(from.y, to.y, t) + Math.sin(angle) * radius);
      waypoints.push({ x: px, y: py });
    }
    waypoints.push(to);

    for(let i = 0; i < waypoints.length - 1; i++){
      const a = waypoints[i];
      const b = waypoints[i + 1];
      const points = bresenhamLine(a.x, a.y, b.x, b.y);
      points.forEach(([px, py]) => paintFloor(ctx, px, py, color));
      last = b;
    }
    return last;
  }

  function distance(a, b){
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function lerp(a, b, t){
    return a + (b - a) * t;
  }

  function clamp(value, min, max){
    return Math.max(min, Math.min(max, value));
  }

  function mirrorPoints(points, cx, cy){
    return points.map(pt => ({
      x: Math.round(cx * 2 - pt.x),
      y: Math.round(cy * 2 - pt.y)
    }));
  }

  function placeGlyphMosaic(ctx, center, radius, palette){
    const layers = Math.max(2, radius - 1);
    for(let r = 0; r <= layers; r++){
      const color = palette[r % palette.length];
      for(let a = 0; a < 360; a += 15){
        const rad = (a * Math.PI) / 180;
        const px = center.x + Math.round(Math.cos(rad) * r);
        const py = center.y + Math.round(Math.sin(rad) * r * 0.75);
        paintFloor(ctx, px, py, color);
      }
    }
  }

  function randomInt(random, max){
    return Math.floor(random() * max);
  }

  // --- Generator algorithms -------------------------------------------------
  function goldenArchiveAlgorithm(ctx){
    const W = ctx.width;
    const H = ctx.height;
    const random = ctx.random;
    const center = { x: Math.floor(W / 2), y: Math.floor(H / 2) };
    const paletteChamber = ['#c3a995', '#b08968', '#d4b483', '#cfc2a0'];
    const paletteCorridor = ['#a68a64', '#927e5a', '#d9c8a1'];
    const mosaicPalette = ['#f0ead2', '#b5e48c', '#ffd60a', '#faa307'];

    const anchors = [];
    const maxRadius = Math.min(W, H) / 2 - 3;
    let angle = random() * Math.PI * 2;
    let radius = 4;
    while(radius < maxRadius){
      const ax = Math.round(center.x + Math.cos(angle) * radius);
      const ay = Math.round(center.y + Math.sin(angle) * radius * 0.85);
      if(ctx.inBounds(ax, ay)){
        anchors.push({ x: ax, y: ay, radius: Math.max(2, Math.round(radius / 4)) });
      }
      angle += Math.PI / GOLDEN_RATIO;
      radius *= 1.25;
    }

    const mirrored = mirrorPoints(anchors, center.x, center.y).filter(pt => ctx.inBounds(pt.x, pt.y));
    mirrored.forEach(pt => anchors.push({ x: pt.x, y: pt.y, radius: 3 + Math.floor(random() * 2) }));

    [[4, 4], [W - 5, 4], [4, H - 5], [W - 5, H - 5]].forEach(([x, y]) => {
      anchors.push({ x, y, radius: 3 });
    });

    anchors.forEach(anchor => {
      carveEllipseRoom(ctx, anchor.x, anchor.y, anchor.radius + 2, Math.max(2, anchor.radius), paletteChamber[randomInt(random, paletteChamber.length)]);
      placeGlyphMosaic(ctx, anchor, Math.max(3, anchor.radius), mosaicPalette);
    });

    const connections = new Set();
    for(let i = 0; i < anchors.length; i++){
      const a = anchors[i];
      const neighbours = anchors
        .filter((_, idx) => idx !== i)
        .map(b => ({ anchor: b, dist: distance(a, b) }))
        .sort((p, q) => p.dist - q.dist)
        .slice(0, 4 + (i % 2));

      neighbours.forEach(({ anchor: b }, idx) => {
        const key = a.x < b.x || (a.x === b.x && a.y <= b.y)
          ? `${a.x},${a.y}-${b.x},${b.y}`
          : `${b.x},${b.y}-${a.x},${a.y}`;
        if(connections.has(key)) return;
        connections.add(key);
        const mid = carveCorridor(ctx, a, b, paletteCorridor, random);
        if(idx % 2 === 0){
          carveEllipseRoom(ctx, mid.x, mid.y, 2, 2, mosaicPalette[(idx + i) % mosaicPalette.length]);
        }
      });
    }

    for(let i = 0; i < anchors.length; i += 3){
      const current = anchors[i];
      const next = anchors[(i + 3) % anchors.length];
      carveCorridor(ctx, current, next, ['#e9c46a'], random);
    }

    for(let i = 0; i < 6; i++){
      const ax = 2 + Math.floor(random() * (W - 4));
      const ay = 2 + Math.floor(random() * (H - 4));
      for(let depth = 0; depth < 3; depth++){
        const px = clamp(ax + depth * (i % 2 === 0 ? 1 : -1), 1, W - 2);
        const py = clamp(ay + depth, 1, H - 2);
        paintFloor(ctx, px, py, '#e76f51');
      }
    }

    ctx.ensureConnectivity();
  }

  function cryptGalleryAlgorithm(ctx){
    const W = ctx.width;
    const H = ctx.height;
    const random = ctx.random;
    const center = { x: Math.floor(W / 2), y: Math.floor(H / 2) };
    const ringPalette = ['#d4c2aa', '#b8a48a', '#ede0d4'];
    const corridorPalette = ['#aa8f66', '#8b7058', '#e0c097'];
    const mosaicPalette = ['#fefae0', '#dda15e', '#bc6c25'];

    const ringCount = Math.max(3, Math.floor(Math.min(W, H) / 6));
    for(let i = 0; i < ringCount; i++){
      const inset = 2 + i * 3;
      const thickness = 2;
      const color = ringPalette[i % ringPalette.length];
      carveRectLoop(ctx, inset, inset, W - inset - 1, H - inset - 1, thickness, color);
      const alcoveRadius = 2 + (i % 3);
      const midPoints = [
        { x: inset, y: center.y },
        { x: W - inset - 1, y: center.y },
        { x: center.x, y: inset },
        { x: center.x, y: H - inset - 1 }
      ];
      midPoints.forEach(pt => placeGlyphMosaic(ctx, pt, alcoveRadius, mosaicPalette));
    }

    const axes = [
      { from: { x: 2, y: center.y }, to: { x: W - 3, y: center.y } },
      { from: { x: center.x, y: 2 }, to: { x: center.x, y: H - 3 } }
    ];
    axes.forEach(pair => carveCorridor(ctx, pair.from, pair.to, corridorPalette, random));

    const corners = [
      { x: 2, y: 2 },
      { x: W - 3, y: 2 },
      { x: W - 3, y: H - 3 },
      { x: 2, y: H - 3 }
    ];
    for(let i = 0; i < corners.length; i++){
      const a = corners[i];
      const b = corners[(i + 1) % corners.length];
      const line = bresenhamLine(a.x, a.y, b.x, b.y);
      line.forEach(([px, py]) => paintFloor(ctx, px, py, '#736357'));
    }

    for(let i = 0; i < 8; i++){
      const ox = 3 + Math.floor(random() * (W - 6));
      const oy = 3 + Math.floor(random() * (H - 6));
      carveEllipseRoom(ctx, ox, oy, 1 + (i % 2), 1, '#f6bd60');
    }

    carveEllipseRoom(ctx, center.x, center.y, Math.round(Math.min(W, H) / 6), Math.round(Math.min(W, H) / 8), '#ede0d4');
    placeGlyphMosaic(ctx, center, 5, mosaicPalette);

    ctx.ensureConnectivity();
  }

  function aquiferArchiveAlgorithm(ctx){
    const W = ctx.width;
    const H = ctx.height;
    const random = ctx.random;
    const center = { x: Math.floor(W / 2), y: Math.floor(H / 2) };
    const streamPalette = ['#74c69d', '#52b69a', '#34a0a4'];
    const walkwayPalette = ['#b08968', '#c19a6b', '#e6ccb2'];
    const relicPalette = ['#f4d58d', '#ffba08', '#f48c06'];

    carveEllipseRoom(ctx, center.x, center.y, Math.round(W / 6), Math.round(H / 6), '#d9c79e');
    placeGlyphMosaic(ctx, center, 4, relicPalette);

    const streamNodes = [];
    const streamCount = 3;
    for(let s = 0; s < streamCount; s++){
      const startY = 3 + Math.floor(random() * (H - 6));
      let last = { x: 1, y: startY };
      for(let seg = 1; seg <= 6; seg++){
        const t = seg / 6;
        const targetX = Math.round(lerp(2, W - 3, t));
        const amplitude = Math.max(2, Math.round((H / 6) + s));
        const wave = Math.sin((t * Math.PI * 2) + s) * amplitude * 0.6;
        const targetY = clamp(Math.round(startY + wave), 2, H - 3);
        const line = bresenhamLine(last.x, last.y, targetX, targetY);
        line.forEach(([px, py]) => paintFloor(ctx, px, py, streamPalette[s % streamPalette.length]));
        last = { x: targetX, y: targetY };
        streamNodes.push(last);
      }
      carveCorridor(ctx, last, center, walkwayPalette, random);
    }

    for(let i = 0; i < streamNodes.length - 3; i += 3){
      carveCorridor(ctx, streamNodes[i], streamNodes[i + 3], walkwayPalette, random);
    }

    streamNodes.forEach((pt, idx) => {
      if(idx % 2 === 0){
        carveEllipseRoom(ctx, pt.x, pt.y, 2, 1 + (idx % 3), '#f2cc8f');
        placeGlyphMosaic(ctx, pt, 2, relicPalette);
      }
    });

    for(let s = 0; s < 5; s++){
      const x = 3 + Math.floor(random() * (W - 6));
      const line = bresenhamLine(x, 2, x, H - 3);
      line.forEach(([px, py]) => {
        if((px + py + s) % 4 === 0){
          paintFloor(ctx, px, py, '#e9edc9');
        }
      });
    }

    ctx.ensureConnectivity();
  }

  const generators = [
    {
      id: 'ancient-enigma-strata',
      name: '古代謎跡複合遺跡：層状記録庫',
      nameKey: "dungeon.types.ancient_enigma_strata.name",
      description: '黄金比螺旋で接続された発掘層が交わる儀式性の高い記録庫',
      descriptionKey: "dungeon.types.ancient_enigma_strata.description",
      algorithm: goldenArchiveAlgorithm,
      mixin: { normalMixed: 0.55, blockDimMixed: 0.5, tags: ['puzzle', 'ancient', 'archaeology'] }
    },
    {
      id: 'ancient-enigma-crypt',
      name: '古代謎跡複合遺跡：墳墓回廊',
      nameKey: "dungeon.types.ancient_enigma_crypt.name",
      description: '石棺回廊と矩形環状路が幾重にも連なる考古学的地下廟',
      descriptionKey: "dungeon.types.ancient_enigma_crypt.description",
      algorithm: cryptGalleryAlgorithm,
      mixin: { normalMixed: 0.5, blockDimMixed: 0.6, tags: ['labyrinth', 'ancient', 'ritual'] }
    },
    {
      id: 'ancient-enigma-aquifer',
      name: '古代謎跡複合遺跡：水聖書庫',
      nameKey: "dungeon.types.ancient_enigma_aquifer.name",
      description: '蛇行する地下水脈と遺物庫を行き来する水文考古学的書庫',
      descriptionKey: "dungeon.types.ancient_enigma_aquifer.description",
      algorithm: aquiferArchiveAlgorithm,
      mixin: { normalMixed: 0.6, blockDimMixed: 0.45, tags: ['water', 'ancient', 'mystery'] }
    }
  ];

  const blocks = {
    // Strata expedition tiers
    blocks1: [
      {
        key: 'enigma_strata_01',
        name: 'Strata Expedition I',
        nameKey: "dungeon.types.ancient_enigma_strata.blocks.enigma_strata_01.name",
        level: +0,
        size: 0,
        depth: +1,
        chest: 'normal',
        type: 'ancient-enigma-strata',
        bossFloors: [4, 8]
      },
      {
        key: 'enigma_strata_02',
        name: 'Strata Expedition II',
        nameKey: "dungeon.types.ancient_enigma_strata.blocks.enigma_strata_02.name",
        level: +6,
        size: +1,
        depth: +1,
        chest: 'more',
        type: 'ancient-enigma-strata',
        bossFloors: [8, 12]
      },
      {
        key: 'enigma_strata_03',
        name: 'Strata Expedition III',
        nameKey: "dungeon.types.ancient_enigma_strata.blocks.enigma_strata_03.name",
        level: +12,
        size: +1,
        depth: +2,
        chest: 'less',
        type: 'ancient-enigma-strata',
        bossFloors: [12]
      },
      {
        key: 'enigma_strata_04',
        name: 'Strata Expedition IV',
        nameKey: "dungeon.types.ancient_enigma_strata.blocks.enigma_strata_04.name",
        level: +18,
        size: +2,
        depth: +2,
        chest: 'normal',
        type: 'ancient-enigma-strata',
        bossFloors: [16]
      },
      {
        key: 'enigma_strata_05',
        name: 'Strata Expedition V',
        nameKey: "dungeon.types.ancient_enigma_strata.blocks.enigma_strata_05.name",
        level: +24,
        size: +2,
        depth: +3,
        chest: 'more',
        type: 'ancient-enigma-strata',
        bossFloors: [20]
      },
      {
        key: 'enigma_strata_06',
        name: 'Strata Expedition VI',
        nameKey: "dungeon.types.ancient_enigma_strata.blocks.enigma_strata_06.name",
        level: +30,
        size: +3,
        depth: +3,
        chest: 'normal',
        type: 'ancient-enigma-strata',
        bossFloors: [24]
      },
      {
        key: 'enigma_strata_07',
        name: 'Strata Expedition VII',
        nameKey: "dungeon.types.ancient_enigma_strata.blocks.enigma_strata_07.name",
        level: +36,
        size: +3,
        depth: +4,
        chest: 'less',
        type: 'ancient-enigma-strata',
        bossFloors: [28]
      }
    ],
    // Strata glyph wards and puzzle locks
    blocks2: [
      {
        key: 'glyph_ward_01',
        name: 'Glyph Ward I',
        nameKey: "dungeon.types.ancient_enigma_strata.blocks.glyph_ward_01.name",
        level: +0,
        size: +1,
        depth: 0,
        chest: 'normal',
        type: 'ancient-enigma-strata'
      },
      {
        key: 'glyph_ward_02',
        name: 'Glyph Ward II',
        nameKey: "dungeon.types.ancient_enigma_strata.blocks.glyph_ward_02.name",
        level: +8,
        size: +1,
        depth: +1,
        chest: 'more',
        type: 'ancient-enigma-strata'
      },
      {
        key: 'glyph_ward_03',
        name: 'Glyph Ward III',
        nameKey: "dungeon.types.ancient_enigma_strata.blocks.glyph_ward_03.name",
        level: +16,
        size: +2,
        depth: +1,
        chest: 'less',
        type: 'ancient-enigma-strata'
      },
      {
        key: 'glyph_ward_04',
        name: 'Glyph Ward IV',
        nameKey: "dungeon.types.ancient_enigma_strata.blocks.glyph_ward_04.name",
        level: +24,
        size: +2,
        depth: +2,
        chest: 'normal',
        type: 'ancient-enigma-strata'
      },
      {
        key: 'glyph_ward_05',
        name: 'Glyph Ward V',
        nameKey: "dungeon.types.ancient_enigma_strata.blocks.glyph_ward_05.name",
        level: +30,
        size: +3,
        depth: +2,
        chest: 'more',
        type: 'ancient-enigma-strata'
      },
      {
        key: 'glyph_ward_06',
        name: 'Glyph Ward VI',
        nameKey: "dungeon.types.ancient_enigma_strata.blocks.glyph_ward_06.name",
        level: +36,
        size: +3,
        depth: +3,
        chest: 'less',
        type: 'ancient-enigma-strata'
      }
    ],
    // Crypt reliquary networks
    blocks3: [
      {
        key: 'crypt_reliquary_01',
        name: 'Reliquary Vault I',
        nameKey: "dungeon.types.ancient_enigma_crypt.blocks.crypt_reliquary_01.name",
        level: +0,
        size: 0,
        depth: +2,
        chest: 'more',
        type: 'ancient-enigma-crypt',
        bossFloors: [4]
      },
      {
        key: 'crypt_reliquary_02',
        name: 'Reliquary Vault II',
        nameKey: "dungeon.types.ancient_enigma_crypt.blocks.crypt_reliquary_02.name",
        level: +10,
        size: +1,
        depth: +2,
        chest: 'normal',
        type: 'ancient-enigma-crypt',
        bossFloors: [8]
      },
      {
        key: 'crypt_reliquary_03',
        name: 'Reliquary Vault III',
        nameKey: "dungeon.types.ancient_enigma_crypt.blocks.crypt_reliquary_03.name",
        level: +18,
        size: +1,
        depth: +3,
        chest: 'less',
        type: 'ancient-enigma-crypt',
        bossFloors: [12, 16]
      },
      {
        key: 'crypt_reliquary_04',
        name: 'Reliquary Vault IV',
        nameKey: "dungeon.types.ancient_enigma_crypt.blocks.crypt_reliquary_04.name",
        level: +26,
        size: +2,
        depth: +4,
        chest: 'more',
        type: 'ancient-enigma-crypt',
        bossFloors: [20]
      },
      {
        key: 'crypt_reliquary_05',
        name: 'Reliquary Vault V',
        nameKey: "dungeon.types.ancient_enigma_crypt.blocks.crypt_reliquary_05.name",
        level: +32,
        size: +2,
        depth: +4,
        chest: 'normal',
        type: 'ancient-enigma-crypt',
        bossFloors: [24]
      },
      {
        key: 'crypt_reliquary_06',
        name: 'Reliquary Vault VI',
        nameKey: "dungeon.types.ancient_enigma_crypt.blocks.crypt_reliquary_06.name",
        level: +38,
        size: +3,
        depth: +5,
        chest: 'more',
        type: 'ancient-enigma-crypt',
        bossFloors: [28]
      }
    ],
    // Ossuary corridors and catacomb studies
    blocks4: [
      {
        key: 'ossuary_route_01',
        name: 'Ossuary Route I',
        nameKey: "dungeon.types.ancient_enigma_crypt.blocks.ossuary_route_01.name",
        level: +2,
        size: 0,
        depth: +1,
        chest: 'normal',
        type: 'ancient-enigma-crypt'
      },
      {
        key: 'ossuary_route_02',
        name: 'Ossuary Route II',
        nameKey: "dungeon.types.ancient_enigma_crypt.blocks.ossuary_route_02.name",
        level: +12,
        size: +1,
        depth: +1,
        chest: 'more',
        type: 'ancient-enigma-crypt'
      },
      {
        key: 'ossuary_route_03',
        name: 'Ossuary Route III',
        nameKey: "dungeon.types.ancient_enigma_crypt.blocks.ossuary_route_03.name",
        level: +20,
        size: +1,
        depth: +2,
        chest: 'less',
        type: 'ancient-enigma-crypt'
      },
      {
        key: 'ossuary_route_04',
        name: 'Ossuary Route IV',
        nameKey: "dungeon.types.ancient_enigma_crypt.blocks.ossuary_route_04.name",
        level: +28,
        size: +2,
        depth: +2,
        chest: 'normal',
        type: 'ancient-enigma-crypt'
      },
      {
        key: 'ossuary_route_05',
        name: 'Ossuary Route V',
        nameKey: "dungeon.types.ancient_enigma_crypt.blocks.ossuary_route_05.name",
        level: +34,
        size: +3,
        depth: +3,
        chest: 'more',
        type: 'ancient-enigma-crypt'
      }
    ],
    // Aquifer caches and waterlogged dig sites
    blocks5: [
      {
        key: 'aquifer_cache_01',
        name: 'Aquifer Cache I',
        nameKey: "dungeon.types.ancient_enigma_aquifer.blocks.aquifer_cache_01.name",
        level: +0,
        size: 0,
        depth: +1,
        chest: 'more',
        type: 'ancient-enigma-aquifer'
      },
      {
        key: 'aquifer_cache_02',
        name: 'Aquifer Cache II',
        nameKey: "dungeon.types.ancient_enigma_aquifer.blocks.aquifer_cache_02.name",
        level: +8,
        size: +1,
        depth: +1,
        chest: 'normal',
        type: 'ancient-enigma-aquifer'
      },
      {
        key: 'aquifer_cache_03',
        name: 'Aquifer Cache III',
        nameKey: "dungeon.types.ancient_enigma_aquifer.blocks.aquifer_cache_03.name",
        level: +16,
        size: +1,
        depth: +2,
        chest: 'less',
        type: 'ancient-enigma-aquifer'
      },
      {
        key: 'aquifer_cache_04',
        name: 'Aquifer Cache IV',
        nameKey: "dungeon.types.ancient_enigma_aquifer.blocks.aquifer_cache_04.name",
        level: +24,
        size: +2,
        depth: +2,
        chest: 'more',
        type: 'ancient-enigma-aquifer'
      },
      {
        key: 'aquifer_cache_05',
        name: 'Aquifer Cache V',
        nameKey: "dungeon.types.ancient_enigma_aquifer.blocks.aquifer_cache_05.name",
        level: +32,
        size: +2,
        depth: +3,
        chest: 'normal',
        type: 'ancient-enigma-aquifer'
      },
      {
        key: 'aquifer_cache_06',
        name: 'Aquifer Cache VI',
        nameKey: "dungeon.types.ancient_enigma_aquifer.blocks.aquifer_cache_06.name",
        level: +38,
        size: +3,
        depth: +3,
        chest: 'more',
        type: 'ancient-enigma-aquifer'
      }
    ]
  };

  window.registerDungeonAddon({
    id: 'ancient_enigma_pack',
    name: 'Ancient Enigma Excavation Pack',
    nameKey: "dungeon.packs.ancient_enigma_pack.name",
    version: '1.1.0',
    blocks,
    generators
  });
})();

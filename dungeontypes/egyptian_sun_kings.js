// Addon: Sun-Kings Necropolis - Egyptian themed sandstone necropolis focusing on grand visuals
(function(){
  function fillSandstone(ctx, tintShift = 0) {
    const { width: W, height: H, set, setWallColor } = ctx;
    for (let y = 0; y < H; y++) {
      const verticalBlend = y / Math.max(1, H - 1);
      const baseTone = Math.floor(176 + tintShift + verticalBlend * 44);
      const hex = baseTone.toString(16).padStart(2, '0');
      for (let x = 0; x < W; x++) {
        set(x, y, 1);
        const hueShift = 140 + ((x + tintShift) % 5) * 10;
        setWallColor(x, y, `#${hex}${hueShift.toString(16).padStart(2, '0')}7a`);
      }
    }
  }

  function processionalNecropolis(ctx) {
    const { width: W, height: H, random, set, get, inBounds, ensureConnectivity, setFloorColor, setWallColor } = ctx;
    fillSandstone(ctx);

    // Central ceremonial axis (processional causeway)
    const axisWidth = Math.max(3, Math.floor(W / 8));
    const axisStartX = Math.floor((W - axisWidth) / 2);
    for (let y = 1; y < H - 1; y++) {
      for (let x = axisStartX; x < axisStartX + axisWidth; x++) {
        set(x, y, 0);
        setFloorColor(x, y, y % 4 === 0 ? '#e4c878' : '#d9b96a');
      }
    }

    // Step-pyramid terraces along the axis
    const terraceCount = 3 + Math.floor(W / 18);
    for (let i = 0; i < terraceCount; i++) {
      const tierHeight = 3 + Math.floor(random() * 4);
      const centerY = Math.floor((i + 1) * (H / (terraceCount + 1)));
      const halfWidth = Math.floor(axisWidth * (0.8 + random() * 0.6));
      for (let t = 0; t < tierHeight; t++) {
        const offset = t * 2;
        for (let x = axisStartX - halfWidth + offset; x < axisStartX + axisWidth + halfWidth - offset; x++) {
          const y = centerY + t;
          if (!inBounds(x, y)) continue;
          set(x, y, 0);
          const gradient = 0.65 + (t / Math.max(1, tierHeight - 1)) * 0.3;
          const tone = Math.floor(210 * gradient);
          const shade = tone.toString(16).padStart(2, '0');
          setFloorColor(x, y, `#${shade}c98f`);
        }
      }
    }

    // Burial chambers and side sanctuaries
    const chamberCount = Math.max(4, Math.floor(W / 10));
    for (let c = 0; c < chamberCount; c++) {
      const chamberWidth = 5 + Math.floor(random() * 6);
      const chamberHeight = 4 + Math.floor(random() * 5);
      const offsetX = random() < 0.5 ? axisStartX - chamberWidth - 1 : axisStartX + axisWidth + 1;
      const startY = 2 + Math.floor(random() * (H - chamberHeight - 4));
      for (let y = startY; y < startY + chamberHeight; y++) {
        for (let x = offsetX; x < offsetX + chamberWidth; x++) {
          if (!inBounds(x, y)) continue;
          set(x, y, 0);
          const gold = (180 + Math.floor(random() * 30)).toString(16).padStart(2, '0');
          setFloorColor(x, y, `#${gold}b86d`);
        }
      }

      // Entrance corridor
      const entranceY = startY + Math.floor(chamberHeight / 2);
      if (offsetX < axisStartX) {
        for (let x = offsetX + chamberWidth; x <= axisStartX; x++) {
          set(x, entranceY, 0);
          setFloorColor(x, entranceY, '#cfa667');
        }
      } else {
        for (let x = axisStartX + axisWidth - 1; x < offsetX; x++) {
          set(x, entranceY, 0);
          setFloorColor(x, entranceY, '#cfa667');
        }
      }
    }

    // Obelisk rows and statue alcoves along axis for visual silhouette
    const obeliskSpacing = 4;
    for (let y = 2; y < H - 2; y += obeliskSpacing) {
      const leftX = axisStartX - 2;
      const rightX = axisStartX + axisWidth + 1;
      if (inBounds(leftX, y)) {
        set(leftX, y, 1);
        setWallColor(leftX, y, '#c9a55a');
      }
      if (inBounds(rightX, y)) {
        set(rightX, y, 1);
        setWallColor(rightX, y, '#c9a55a');
      }
    }

    // Decorative inlays on floor with lapis and carnelian tones
    const inlayCount = Math.floor((W * H) / 120);
    for (let i = 0; i < inlayCount; i++) {
      const x = 1 + Math.floor(random() * (W - 2));
      const y = 1 + Math.floor(random() * (H - 2));
      if (get(x, y) === 0) {
        const palette = ['#1d5f8a', '#ce4a3a', '#f0d26a'];
        setFloorColor(x, y, palette[Math.floor(random() * palette.length)]);
      }
    }

    ensureConnectivity();
  }

  function terracedSolarCourt(ctx) {
    const { width: W, height: H, random, set, get, inBounds, ensureConnectivity, setFloorColor, setWallColor } = ctx;
    fillSandstone(ctx, 6);

    const centerX = Math.floor(W / 2);
    const centerY = Math.floor(H / 2);
    const baseRadiusX = Math.floor(Math.min(W, H) * 0.35);
    const baseRadiusY = Math.floor(Math.min(W, H) * 0.28);
    const tiers = 4;

    for (let t = 0; t < tiers; t++) {
      const shrinkX = t * 2;
      const shrinkY = Math.floor(t * 1.5);
      for (let y = centerY - baseRadiusY + shrinkY; y <= centerY + baseRadiusY - shrinkY; y++) {
        for (let x = centerX - baseRadiusX + shrinkX; x <= centerX + baseRadiusX - shrinkX; x++) {
          if (!inBounds(x, y)) continue;
          const dx = Math.abs(x - centerX);
          const dy = Math.abs(y - centerY);
          if (dx <= baseRadiusX - shrinkX && dy <= baseRadiusY - shrinkY) {
            set(x, y, 0);
            const tone = 220 - t * 18;
            setFloorColor(x, y, `#${tone.toString(16).padStart(2, '0')}d6a4`);
          }
        }
      }
    }

    // Processional ramps from four directions
    const rampLength = Math.floor(Math.min(W, H) * 0.35);
    for (let i = -2; i <= 2; i++) {
      const offset = i;
      for (let step = 0; step < rampLength; step++) {
        const northY = centerY - baseRadiusY - step;
        const southY = centerY + baseRadiusY + step;
        const eastX = centerX + baseRadiusX + step;
        const westX = centerX - baseRadiusX - step;
        const rampTone = step % 2 === 0 ? '#e5c880' : '#d9b268';
        const positions = [
          [centerX + offset, northY],
          [centerX + offset, southY],
          [eastX, centerY + offset],
          [westX, centerY + offset]
        ];
        for (const [x, y] of positions) {
          if (!inBounds(x, y)) continue;
          set(x, y, 0);
          setFloorColor(x, y, rampTone);
        }
      }
    }

    // Outer colonnade with alternating accents
    for (let y = 2; y < H - 2; y += 3) {
      for (let x = 2; x < W - 2; x += 3) {
        if (get(x, y) === 0) continue;
        set(x, y, 1);
        const color = (x + y) % 2 === 0 ? '#c3a059' : '#b78f43';
        setWallColor(x, y, color);
      }
    }

    // Reflecting pools in the corners
    const poolPalette = ['#4aaed0', '#3d9ac1', '#2c7fa5'];
    const poolRadius = 3;
    const corners = [
      [3 + poolRadius, 3 + poolRadius],
      [W - 4 - poolRadius, 3 + poolRadius],
      [3 + poolRadius, H - 4 - poolRadius],
      [W - 4 - poolRadius, H - 4 - poolRadius]
    ];
    for (const [cx, cy] of corners) {
      for (let y = -poolRadius; y <= poolRadius; y++) {
        for (let x = -poolRadius; x <= poolRadius; x++) {
          const nx = cx + x;
          const ny = cy + y;
          if (!inBounds(nx, ny)) continue;
          if (x * x + y * y <= poolRadius * poolRadius) {
            set(nx, ny, 0);
            const tone = poolPalette[Math.floor(random() * poolPalette.length)];
            setFloorColor(nx, ny, tone);
          }
        }
      }
    }

    ensureConnectivity();
  }

  function sunkenSanctumGalleries(ctx) {
    const { width: W, height: H, random, set, get, inBounds, ensureConnectivity, setFloorColor, setWallColor } = ctx;
    fillSandstone(ctx, -4);

    // Central sunken basin
    const basinWidth = Math.floor(W * 0.45);
    const basinHeight = Math.floor(H * 0.32);
    const basinX0 = Math.floor((W - basinWidth) / 2);
    const basinY0 = Math.floor((H - basinHeight) / 2);
    for (let y = basinY0; y < basinY0 + basinHeight; y++) {
      for (let x = basinX0; x < basinX0 + basinWidth; x++) {
        set(x, y, 0);
        const depthTint = Math.floor(180 - ((y - basinY0) / Math.max(1, basinHeight - 1)) * 30);
        setFloorColor(x, y, `#${depthTint.toString(16).padStart(2, '0')}93c2`);
      }
    }

    // Surrounding promenade
    const promenadeWidth = 3;
    for (let y = basinY0 - promenadeWidth; y < basinY0 + basinHeight + promenadeWidth; y++) {
      for (let x = basinX0 - promenadeWidth; x < basinX0 + basinWidth + promenadeWidth; x++) {
        if (!inBounds(x, y)) continue;
        if (x >= basinX0 && x < basinX0 + basinWidth && y >= basinY0 && y < basinY0 + basinHeight) continue;
        set(x, y, 0);
        const alternating = (x + y) % 2 === 0 ? '#e6c987' : '#dab871';
        setFloorColor(x, y, alternating);
      }
    }

    // Radial gallery corridors leading to hidden tombs
    const armLength = Math.floor(Math.min(W, H) * 0.28);
    const directions = [
      [1, 0], [-1, 0], [0, 1], [0, -1],
      [1, 1], [-1, 1], [1, -1], [-1, -1]
    ];
    for (const [dx, dy] of directions) {
      let x = Math.floor(W / 2);
      let y = Math.floor(H / 2);
      for (let step = 0; step < armLength; step++) {
        if (!inBounds(x, y)) break;
        set(x, y, 0);
        setFloorColor(x, y, step % 3 === 0 ? '#cfa667' : '#d8b774');
        x += dx;
        y += dy;
      }
    }

    // Chamber clusters at the ends of the galleries
    const chamberSize = 4;
    for (const [dx, dy] of directions) {
      const endX = Math.floor(W / 2) + dx * armLength;
      const endY = Math.floor(H / 2) + dy * armLength;
      for (let y = -chamberSize; y <= chamberSize; y++) {
        for (let x = -chamberSize; x <= chamberSize; x++) {
          const nx = endX + x;
          const ny = endY + y;
          if (!inBounds(nx, ny)) continue;
          if (Math.abs(x) + Math.abs(y) <= chamberSize) {
            set(nx, ny, 0);
            const jewelTone = ['#cfa667', '#b98950', '#d4b074'][Math.floor(random() * 3)];
            setFloorColor(nx, ny, jewelTone);
          }
        }
      }
    }

    // Pillars to emphasise depth perception
    for (let y = basinY0 - 1; y <= basinY0 + basinHeight; y += 3) {
      for (let x = basinX0 - 1; x <= basinX0 + basinWidth; x += 3) {
        if (!inBounds(x, y)) continue;
        if (get(x, y) !== 0) {
          set(x, y, 1);
          setWallColor(x, y, '#c1a05e');
        }
      }
    }

    ensureConnectivity();
  }

  const generators = [
    {
      id: 'sun-kings-processional',
      name: '太陽王の葬祭道',
      nameKey: "dungeon.types.sun_kings_processional.name",
      description: '中央の葬祭道が続く荘厳な地下墓所のレイアウト',
      descriptionKey: "dungeon.types.sun_kings_processional.description",
      dark: false,
      algorithm: processionalNecropolis,
      mixin: { normalMixed: 0.25, blockDimMixed: 0.35, tags: ['ruins', 'desert', 'ceremonial'] }
    },
    {
      id: 'sun-kings-terraced-courts',
      name: '階段式太陽庭園',
      nameKey: "dungeon.types.sun_kings_terraced_courts.name",
      description: '階段状の聖域と水鏡の庭を備えた視覚重視の複合寺院',
      descriptionKey: "dungeon.types.sun_kings_terraced_courts.description",
      dark: false,
      algorithm: terracedSolarCourt,
      mixin: { normalMixed: 0.28, blockDimMixed: 0.32, tags: ['ruins', 'desert', 'symmetry'] }
    },
    {
      id: 'sun-kings-sunken-sanctum',
      name: '沈みゆく聖域回廊',
      nameKey: "dungeon.types.sun_kings_sunken_sanctum.name",
      description: '青い沈殿池と放射状の回廊が広がる地下聖域',
      descriptionKey: "dungeon.types.sun_kings_sunken_sanctum.description",
      dark: false,
      algorithm: sunkenSanctumGalleries,
      mixin: { normalMixed: 0.3, blockDimMixed: 0.3, tags: ['ruins', 'desert', 'grand'] }
    }
  ];

  function mkBoss(depth) {
    const r = [];
    if (depth >= 6) r.push(6);
    if (depth >= 11) r.push(11);
    if (depth >= 15) r.push(15);
    return r;
  }

  const types = generators.map(g => g.id);
  const blocks = {
    blocks1: [
      { key: 'sun_king_theme_01', name: 'Sun King Theme I', level: +2, size: +0, depth: +1, chest: 'normal', type: types[0], bossFloors: mkBoss(7) },
      { key: 'sun_king_theme_02', name: 'Sun King Theme II', level: +10, size: +1, depth: +2, chest: 'more', type: types[1], bossFloors: mkBoss(12) },
      { key: 'sun_king_theme_03', name: 'Sun King Theme III', level: +14, size: +1, depth: +2, chest: 'more', type: types[2], bossFloors: mkBoss(15) }
    ],
    blocks2: [
      { key: 'sun_king_core_01', name: 'Necropolis Core', level: +6, size: +1, depth: +1, chest: 'normal', type: types[0] },
      { key: 'sun_king_core_02', name: 'Pyramid Court Core', level: +12, size: +1, depth: +1, chest: 'normal', type: types[1] },
      { key: 'sun_king_core_03', name: 'Sunken Sanctum Core', level: +18, size: +1, depth: +2, chest: 'more', type: types[2] }
    ],
    blocks3: [
      { key: 'sun_king_relic_01', name: 'Golden Sarcophagus', level: +16, size: +1, depth: +3, chest: 'more', type: types[2], bossFloors: [11, 15] }
    ]
  };

  window.registerDungeonAddon({
    id: 'sun_kings_necropolis_pack',
    name: 'Sun-Kings Necropolis Pack',
    nameKey: "dungeon.packs.sun_kings_necropolis_pack.name",
    version: '1.1.0',
    blocks,
    generators
  });
})();

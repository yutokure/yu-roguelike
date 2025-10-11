// Addon: Modern Metropolis Expansion Pack - contemporary city inspired dungeon generation
(function(){
  const ADDON_ID = 'modern_metropolis_pack';
  const ADDON_NAME = 'Modern Metropolis Expansion Pack';
  const VERSION = '1.0.0';

  const palettes = {
    arterial:   { floor: '#4a4f57', wall: '#1b1d21', accent: '#f7c948', neon: '#2ec4ff', park: '#3f8450', water: '#2a78b8' },
    downtown:   { floor: '#3f434b', wall: '#121317', accent: '#ff6b6b', neon: '#ffd93d', park: '#2f7d4f', water: '#1f6fb2' },
    campus:     { floor: '#4d5a4c', wall: '#1f271b', accent: '#a3de83', neon: '#ffd166', park: '#3c9d5d', water: '#2f8bc0' },
    civic:      { floor: '#5c5f66', wall: '#23252b', accent: '#f8961e', neon: '#ef476f', park: '#2f845b', water: '#118ab2' },
    medical:    { floor: '#4a5864', wall: '#1d232c', accent: '#73d2de', neon: '#ffe66d', park: '#3f8b65', water: '#2a6fb2' },
    leisure:    { floor: '#454056', wall: '#1a1028', accent: '#f72585', neon: '#4cc9f0', park: '#3a9d6d', water: '#4895ef' },
    heritage:   { floor: '#5b4c3f', wall: '#2b221b', accent: '#e9a64d', neon: '#f2c57c', park: '#42754f', water: '#33658a' }
  };

  function clamp(value, min, max){
    return value < min ? min : (value > max ? max : value);
  }

  function fillWalls(ctx, palette){
    for(let y = 0; y < ctx.height; y++){
      for(let x = 0; x < ctx.width; x++){
        ctx.set(x, y, 1);
        if(palette && palette.wall) ctx.setWallColor(x, y, palette.wall);
      }
    }
  }

  function carveFloor(ctx, x, y, color){
    if(!ctx.inBounds(x, y)) return;
    ctx.set(x, y, 0);
    if(color) ctx.setFloorColor(x, y, color);
  }

  function carveRect(ctx, x1, y1, x2, y2, color){
    const xa = Math.max(1, Math.min(x1, x2));
    const xb = Math.min(ctx.width - 2, Math.max(x1, x2));
    const ya = Math.max(1, Math.min(y1, y2));
    const yb = Math.min(ctx.height - 2, Math.max(y1, y2));
    for(let y = ya; y <= yb; y++){
      for(let x = xa; x <= xb; x++) carveFloor(ctx, x, y, color);
    }
  }

  function carveLine(ctx, x0, y0, x1, y1, width, color){
    const half = Math.max(0, Math.floor((width || 1) / 2));
    let dx = Math.abs(x1 - x0);
    let sx = x0 < x1 ? 1 : -1;
    let dy = -Math.abs(y1 - y0);
    let sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    while(true){
      for(let oy = -half; oy <= half; oy++){
        for(let ox = -half; ox <= half; ox++){
          carveFloor(ctx, x0 + ox, y0 + oy, color);
        }
      }
      if(x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if(e2 >= dy){
        err += dy;
        x0 += sx;
      }
      if(e2 <= dx){
        err += dx;
        y0 += sy;
      }
    }
  }

  function carveDisc(ctx, cx, cy, radius, color){
    const r = Math.max(1, radius);
    const r2 = r * r;
    for(let y = -r; y <= r; y++){
      for(let x = -r; x <= r; x++){
        if(x * x + y * y <= r2) carveFloor(ctx, cx + x, cy + y, color);
      }
    }
  }

  function sprinkleAccents(ctx, positions, color){
    if(!positions || !color) return;
    positions.forEach(([x, y]) => carveFloor(ctx, x, y, color));
  }

  function scatterLots(ctx, bounds, count, sizeRange, palette, options = {}){
    const [minSize, maxSize] = sizeRange;
    const [x1, y1, x2, y2] = bounds;
    const random = ctx.random;
    for(let i = 0; i < count; i++){
      const w = clamp(Math.floor(random() * (maxSize - minSize + 1)) + minSize, 2, 10);
      const h = clamp(Math.floor(random() * (maxSize - minSize + 1)) + minSize, 2, 10);
      const ox = clamp(Math.floor(random() * (x2 - x1 - w + 1)) + x1, x1, x2 - w);
      const oy = clamp(Math.floor(random() * (y2 - y1 - h + 1)) + y1, y1, y2 - h);
      carveRect(ctx, ox, oy, ox + w, oy + h, options.altColor || palette.accent);
    }
  }

  function weaveGreenbelts(ctx, margin, palette, options = {}){
    const random = ctx.random;
    const attempts = options.attempts ?? 6;
    const maxWidth = options.maxWidth ?? 4;
    for(let i = 0; i < attempts; i++){
      let x = Math.floor(random() * (ctx.width - margin * 2)) + margin;
      let y = Math.floor(random() * (ctx.height - margin * 2)) + margin;
      const steps = 20 + Math.floor(random() * 40);
      const width = 1 + Math.floor(random() * maxWidth);
      for(let s = 0; s < steps; s++){
        carveRect(ctx, x - width, y - width, x + width, y + width, palette.park);
        if(random() < 0.45) x += (random() < 0.5 ? -1 : 1) * (1 + Math.floor(random() * 2));
        if(random() < 0.45) y += (random() < 0.5 ? -1 : 1) * (1 + Math.floor(random() * 2));
        x = clamp(x, margin, ctx.width - margin - 1);
        y = clamp(y, margin, ctx.height - margin - 1);
      }
    }
  }

  function drawWaterfront(ctx, palette, options){
    const side = options.side || 'south';
    const depth = options.depth || 5;
    const color = palette.water;
    if(side === 'south'){
      carveRect(ctx, 1, ctx.height - depth - 1, ctx.width - 2, ctx.height - 2, color);
    }else if(side === 'north'){
      carveRect(ctx, 1, 1, ctx.width - 2, depth, color);
    }else if(side === 'west'){
      carveRect(ctx, 1, 1, depth, ctx.height - 2, color);
    }else{
      carveRect(ctx, ctx.width - depth - 1, 1, ctx.width - 2, ctx.height - 2, color);
    }
  }

  function createGridStyle(def){
    const {
      palette,
      blockSize = 6,
      roadWidth = 2,
      margin = 2,
      plazas = 1,
      diagonals = false,
      alleys = false,
      accentStripes = true,
      addLots = false,
      walkwayColor
    } = def;
    return function(ctx){
      fillWalls(ctx, palette);
      const step = Math.max(roadWidth + blockSize, 3);
      for(let y = margin; y < ctx.height - margin; y += step){
        carveRect(ctx, margin, y, ctx.width - margin - 1, y + roadWidth - 1, palette.floor);
      }
      for(let x = margin; x < ctx.width - margin; x += step){
        carveRect(ctx, x, margin, x + roadWidth - 1, ctx.height - margin - 1, palette.floor);
      }

      if(diagonals){
        carveLine(ctx, margin, margin, ctx.width - margin - 1, ctx.height - margin - 1, roadWidth, palette.floor);
        carveLine(ctx, margin, ctx.height - margin - 1, ctx.width - margin - 1, margin, roadWidth, palette.floor);
      }

      if(alleys){
        const altWidth = Math.max(1, roadWidth - 1);
        const offset = Math.floor(step / 2);
        for(let y = margin + offset; y < ctx.height - margin; y += step){
          carveRect(ctx, margin, y, ctx.width - margin - 1, y + altWidth - 1, palette.accent);
        }
        for(let x = margin + offset; x < ctx.width - margin; x += step){
          carveRect(ctx, x, margin, x + altWidth - 1, ctx.height - margin - 1, palette.accent);
        }
      }

      if(accentStripes){
        const lanes = Math.max(2, Math.floor((ctx.width + ctx.height) / 40));
        for(let i = 0; i < lanes; i++){
          const y = margin + i * step;
          if(y < ctx.height - margin) carveLine(ctx, margin, y, ctx.width - margin - 1, y, 1, palette.accent);
          const x = margin + i * step;
          if(x < ctx.width - margin) carveLine(ctx, x, margin, x, ctx.height - margin - 1, 1, palette.accent);
        }
      }

      const plazaCount = Math.max(0, plazas);
      const cx = Math.floor(ctx.width / 2);
      const cy = Math.floor(ctx.height / 2);
      for(let i = 0; i < plazaCount; i++){
        const radius = Math.max(2, Math.floor((Math.min(ctx.width, ctx.height) / 6) - i));
        carveDisc(ctx, cx, cy, radius, palette.neon);
      }

      if(addLots){
        scatterLots(ctx, [margin + 1, margin + 1, ctx.width - margin - 2, ctx.height - margin - 2], 12, [2, 4], palette, { altColor: palette.park });
      }

      if(walkwayColor){
        carveRect(ctx, margin, Math.floor(ctx.height / 2) - 1, ctx.width - margin - 1, Math.floor(ctx.height / 2) + 1, walkwayColor);
      }

      ctx.ensureConnectivity();
    };
  }

  function createRadialStyle(def){
    const { palette, rings = 2, spokes = 6, ringWidth = 2, hubRadius = 4, accentChords = true } = def;
    return function(ctx){
      fillWalls(ctx, palette);
      const cx = Math.floor(ctx.width / 2);
      const cy = Math.floor(ctx.height / 2);
      carveDisc(ctx, cx, cy, hubRadius, palette.floor);
      const spacing = Math.floor(Math.min(ctx.width, ctx.height) / (rings + 3));
      for(let r = 1; r <= rings; r++){
        const radius = hubRadius + spacing * r;
        carveDisc(ctx, cx, cy, radius, palette.floor);
        if(ringWidth > 1){
          const inner = Math.max(1, radius - ringWidth + 1);
          const step = Math.max(6, Math.floor(Math.PI * 2 * radius / 12));
          for(let angle = 0; angle < Math.PI * 2; angle += (Math.PI * 2) / step){
            const x = Math.round(cx + Math.cos(angle) * inner);
            const y = Math.round(cy + Math.sin(angle) * inner);
            carveFloor(ctx, x, y, palette.accent);
          }
        }
      }
      const totalSpokes = Math.max(3, spokes);
      for(let i = 0; i < totalSpokes; i++){
        const angle = (Math.PI * 2 * i) / totalSpokes;
        const x = Math.round(cx + Math.cos(angle) * (ctx.width));
        const y = Math.round(cy + Math.sin(angle) * (ctx.height));
        carveLine(ctx, cx, cy, x, y, ringWidth, palette.floor);
      }
      if(accentChords){
        for(let i = 0; i < totalSpokes; i++){
          const a1 = (Math.PI * 2 * i) / totalSpokes;
          const a2 = (Math.PI * 2 * (i + 1)) / totalSpokes;
          const r = hubRadius + spacing * Math.max(1, Math.floor(rings / 2));
          const x1 = Math.round(cx + Math.cos(a1) * r);
          const y1 = Math.round(cy + Math.sin(a1) * r);
          const x2 = Math.round(cx + Math.cos(a2) * r);
          const y2 = Math.round(cy + Math.sin(a2) * r);
          carveLine(ctx, x1, y1, x2, y2, 1, palette.accent);
        }
      }
      ctx.ensureConnectivity();
    };
  }

  function createCampusStyle(def){
    const { palette, clusters = 3, quadSize = 6, pathWidth = 2, courtyard = true, greens = true } = def;
    return function(ctx){
      fillWalls(ctx, palette);
      const usableWidth = ctx.width - 4;
      const usableHeight = ctx.height - 4;
      const cols = Math.max(2, Math.ceil(Math.sqrt(clusters)));
      const rows = Math.max(2, Math.ceil(clusters / cols));
      const cellWidth = Math.floor(usableWidth / cols);
      const cellHeight = Math.floor(usableHeight / rows);
      let index = 0;
      for(let row = 0; row < rows; row++){
        for(let col = 0; col < cols; col++){
          if(index >= clusters) break;
          const x1 = 2 + col * cellWidth + 1;
          const y1 = 2 + row * cellHeight + 1;
          const x2 = Math.min(ctx.width - 3, x1 + quadSize + Math.floor(cellWidth / 2));
          const y2 = Math.min(ctx.height - 3, y1 + quadSize + Math.floor(cellHeight / 2));
          carveRect(ctx, x1, y1, x2, y2, palette.floor);
          if(courtyard){
            const cx = Math.floor((x1 + x2) / 2);
            const cy = Math.floor((y1 + y2) / 2);
            carveRect(ctx, cx - 1, y1, cx + 1, y2, palette.accent);
            carveRect(ctx, x1, cy - 1, x2, cy + 1, palette.accent);
          }
          index++;
        }
      }
      const midY = Math.floor(ctx.height / 2);
      carveRect(ctx, 2, midY - pathWidth, ctx.width - 3, midY + pathWidth, palette.floor);
      const midX = Math.floor(ctx.width / 2);
      carveRect(ctx, midX - pathWidth, 2, midX + pathWidth, ctx.height - 3, palette.floor);
      if(greens){
        weaveGreenbelts(ctx, 3, palette, { attempts: 4, maxWidth: 2 });
      }
      ctx.ensureConnectivity();
    };
  }

  function createParkStyle(def){
    const { palette, margin = 3, ponds = 2, loops = 3, width = 2, plazas = 1 } = def;
    return function(ctx){
      fillWalls(ctx, palette);
      weaveGreenbelts(ctx, margin, palette, { attempts: loops, maxWidth: width + 1 });
      const random = ctx.random;
      const walkwayColor = palette.floor;
      for(let i = 0; i < loops; i++){
        let x = Math.floor(random() * (ctx.width - margin * 2)) + margin;
        let y = Math.floor(random() * (ctx.height - margin * 2)) + margin;
        const steps = 30 + Math.floor(random() * 40);
        for(let step = 0; step < steps; step++){
          carveRect(ctx, x - width, y - width, x + width, y + width, walkwayColor);
          if(random() < 0.5) x += random() < 0.5 ? -1 : 1;
          if(random() < 0.5) y += random() < 0.5 ? -1 : 1;
          x = clamp(x, margin, ctx.width - margin - 1);
          y = clamp(y, margin, ctx.height - margin - 1);
        }
      }
      for(let p = 0; p < ponds; p++){
        const cx = margin + Math.floor(random() * (ctx.width - margin * 2));
        const cy = margin + Math.floor(random() * (ctx.height - margin * 2));
        const r = 2 + Math.floor(random() * 3);
        carveDisc(ctx, cx, cy, r + 1, palette.water);
      }
      for(let i = 0; i < plazas; i++){
        const cx = Math.floor(ctx.width / 2);
        const cy = Math.floor(ctx.height / 2);
        carveDisc(ctx, cx, cy, 2 + i, palette.accent);
      }
      ctx.ensureConnectivity();
    };
  }

  function createFacilityStyle(def){
    const { palette, roomCount = 9, roomSize = [4, 6], corridorWidth = 2, centralHub = true, secureRings = 0 } = def;
    return function(ctx){
      fillWalls(ctx, palette);
      const random = ctx.random;
      const placed = [];
      for(let i = 0; i < roomCount; i++){
        const w = roomSize[0] + Math.floor(random() * (roomSize[1] - roomSize[0] + 1));
        const h = roomSize[0] + Math.floor(random() * (roomSize[1] - roomSize[0] + 1));
        const x = 2 + Math.floor(random() * (ctx.width - w - 4));
        const y = 2 + Math.floor(random() * (ctx.height - h - 4));
        carveRect(ctx, x, y, x + w, y + h, palette.floor);
        placed.push({ x: x + Math.floor(w / 2), y: y + Math.floor(h / 2) });
      }
      for(let i = 0; i < placed.length - 1; i++){
        const a = placed[i];
        const b = placed[i + 1];
        carveLine(ctx, a.x, a.y, b.x, b.y, corridorWidth, palette.accent);
      }
      if(centralHub){
        const cx = Math.floor(ctx.width / 2);
        const cy = Math.floor(ctx.height / 2);
        carveRect(ctx, cx - 2, cy - 2, cx + 2, cy + 2, palette.neon);
        placed.forEach(p => carveLine(ctx, p.x, p.y, cx, cy, 1, palette.neon));
      }
      for(let r = 1; r <= secureRings; r++){
        const offset = 3 * r;
        carveRect(ctx, 1 + offset, 1 + offset, ctx.width - 2 - offset, ctx.height - 2 - offset, palette.wall);
        carveRect(ctx, 2 + offset, 2 + offset, ctx.width - 3 - offset, ctx.height - 3 - offset, palette.floor);
      }
      ctx.ensureConnectivity();
    };
  }

  function createTransitStyle(def){
    const { palette, lanes = 3, laneWidth = 2, sidings = true, mezzanine = false, diagonal = false, sideWalk = true } = def;
    return function(ctx){
      fillWalls(ctx, palette);
      const margin = 2;
      const spacing = Math.floor((ctx.height - margin * 2) / (lanes + 1));
      for(let i = 0; i < lanes; i++){
        const y = margin + (i + 1) * spacing;
        carveRect(ctx, margin, y - Math.floor(laneWidth / 2), ctx.width - margin - 1, y + Math.ceil(laneWidth / 2), palette.floor);
        if(sidings){
          carveRect(ctx, margin, y - laneWidth, margin + 3, y + laneWidth, palette.accent);
          carveRect(ctx, ctx.width - margin - 4, y - laneWidth, ctx.width - margin - 1, y + laneWidth, palette.accent);
        }
      }
      if(mezzanine){
        const mid = Math.floor(ctx.height / 2);
        carveRect(ctx, margin, mid - laneWidth, ctx.width - margin - 1, mid + laneWidth, palette.neon);
      }
      if(diagonal){
        carveLine(ctx, margin, margin, ctx.width - margin - 1, ctx.height - margin - 1, laneWidth, palette.floor);
      }
      if(sideWalk){
        carveRect(ctx, margin, margin, ctx.width - margin - 1, margin + 1, palette.park);
        carveRect(ctx, margin, ctx.height - margin - 2, ctx.width - margin - 1, ctx.height - margin - 1, palette.park);
      }
      ctx.ensureConnectivity();
    };
  }

  function createWaterfrontStyle(def){
    const { palette, side = 'south', depth = 5, boardwalkWidth = 3, piers = 3 } = def;
    return function(ctx){
      fillWalls(ctx, palette);
      drawWaterfront(ctx, palette, { side, depth });
      const margin = 2;
      if(side === 'south'){
        carveRect(ctx, margin, ctx.height - depth - boardwalkWidth - 1, ctx.width - margin - 1, ctx.height - depth - 2, palette.floor);
        for(let i = 0; i < piers; i++){
          const x = margin + Math.floor((ctx.width - margin * 2) * (i + 0.5) / piers);
          carveRect(ctx, x - 1, ctx.height - depth - 2, x + 1, ctx.height - 2, palette.accent);
        }
      }else if(side === 'north'){
        carveRect(ctx, margin, depth + 1, ctx.width - margin - 1, depth + boardwalkWidth + 1, palette.floor);
      }else if(side === 'west'){
        carveRect(ctx, depth + 1, margin, depth + boardwalkWidth + 1, ctx.height - margin - 1, palette.floor);
      }else{
        carveRect(ctx, ctx.width - depth - boardwalkWidth - 1, margin, ctx.width - depth - 2, ctx.height - margin - 1, palette.floor);
      }
      ctx.ensureConnectivity();
    };
  }

  const styleFactories = {
    grid: createGridStyle,
    radial: createRadialStyle,
    campus: createCampusStyle,
    park: createParkStyle,
    facility: createFacilityStyle,
    transit: createTransitStyle,
    waterfront: createWaterfrontStyle
  };

  const generatorBlueprints = [
    {
      id: 'urban-crossroads',
      name: '都市交差点ネットワーク',
      description: '幹線道路と高架歩道が幾重にも交差する、都市の鼓動が集まる巨大交差点ハブ。',
      flavor: '雨粒を弾くアスファルトと信号の残光が交差する車線を照らし、プレイヤーをネオンの海へ誘う。',
      palette: palettes.arterial,
      style: 'grid',
      blockSize: 5,
      roadWidth: 3,
      plazas: 2,
      diagonals: true,
      mixin: { normalMixed: 0.45, blockDimMixed: 0.5, tags: ['urban', 'roads', 'intersection'] }
    },
    {
      id: 'arterial-avenues',
      name: '広域アベニュー',
      description: '複数の幹線道路が縦横無尽に走り抜ける多層アベニュー街区。',
      flavor: '中央分離帯の照明とビルの壁面広告が連なり、途切れることのない都市のスカイラインを描き出す。',
      palette: palettes.arterial,
      style: 'grid',
      blockSize: 7,
      roadWidth: 3,
      accentStripes: true,
      mixin: { normalMixed: 0.4, blockDimMixed: 0.45, tags: ['urban', 'roads'] }
    },
    {
      id: 'downtown-highrise',
      name: 'ビル街ストリート',
      description: '高層ビルと裏路地が交互に現れる密度の高いビル街ストリート。',
      flavor: 'ガラス張りの塔が昼夜を問わず光を反射し、路地裏のテラスから音楽と歓声がこぼれ落ちる。',
      palette: palettes.downtown,
      style: 'grid',
      blockSize: 6,
      roadWidth: 2,
      plazas: 1,
      alleys: true,
      mixin: { normalMixed: 0.35, blockDimMixed: 0.4, tags: ['urban', 'downtown', 'buildings'] }
    },
    {
      id: 'financial-plaza',
      name: '金融プラザ回廊',
      description: '証券取引所を思わせる円環状のプラザが幾重にも連なる金融街の回廊。',
      flavor: '吹き抜けのガレリアに響く電子ベルと取引ボードの明滅が、緊張感ある都市の午後を彩る。',
      palette: palettes.downtown,
      style: 'radial',
      rings: 3,
      spokes: 8,
      ringWidth: 2,
      mixin: { normalMixed: 0.3, blockDimMixed: 0.38, tags: ['urban', 'plaza'] }
    },
    {
      id: 'civic-center',
      name: 'シビックセンター',
      description: '市庁舎と記念広場を中心に行政棟が放射状に連なるシビックセンター。',
      flavor: '石畳の大広場に掲げられた旗と記念碑が、市民の誇りと歴史を静かに語る。',
      palette: palettes.civic,
      style: 'radial',
      rings: 2,
      spokes: 6,
      hubRadius: 5,
      mixin: { normalMixed: 0.32, blockDimMixed: 0.4, tags: ['urban', 'civic', 'plaza'] }
    },
    {
      id: 'riverfront-park',
      name: 'リバーフロントパーク',
      description: '河川沿いの遊歩道と庭園が交差する水辺のグリーンベルト。',
      flavor: '水面に映る夕焼けが桟橋を黄金色に染め、柔らかな芝生が川風にそよぐ。',
      palette: palettes.civic,
      style: 'park',
      ponds: 3,
      loops: 4,
      width: 2,
      plazas: 1,
      mixin: { normalMixed: 0.28, blockDimMixed: 0.35, tags: ['park', 'waterfront'] }
    },
    {
      id: 'harbor-gateway',
      name: '湾岸ゲートウェイ',
      description: '港湾と桟橋が折り重なるウォーターフロントゲートウェイ。',
      flavor: 'フォークリフトの警笛と波の音が混ざり合い、倉庫街のライトが岸壁を照らす。',
      palette: palettes.downtown,
      style: 'waterfront',
      side: 'south',
      depth: 5,
      boardwalkWidth: 3,
      piers: 4,
      mixin: { normalMixed: 0.26, blockDimMixed: 0.33, tags: ['waterfront', 'harbor'] }
    },
    {
      id: 'suburban-blocks',
      name: 'サバーバン街区',
      description: '低層住宅が穏やかに並ぶ郊外型の街区レイアウト。',
      flavor: '芝生の庭と郵便受けが規則正しく続き、夕暮れにはポーチライトが柔らかく灯る。',
      palette: palettes.campus,
      style: 'grid',
      blockSize: 8,
      roadWidth: 2,
      plazas: 0,
      alleys: false,
      addLots: true,
      mixin: { normalMixed: 0.34, blockDimMixed: 0.42, tags: ['suburb', 'residential', 'town'] }
    },
    {
      id: 'garden-township',
      name: '田園タウンシップ',
      description: '農道と小川が織りなす田舎町のガーデンタウンシップ。',
      flavor: '小さな農園と露店が風に揺れ、野花の香りが通りを満たす。',
      palette: palettes.heritage,
      style: 'park',
      ponds: 2,
      loops: 5,
      width: 1,
      plazas: 0,
      mixin: { normalMixed: 0.33, blockDimMixed: 0.38, tags: ['rural', 'park', 'town'] }
    },
    {
      id: 'city-campus',
      name: '都市キャンパス',
      description: '都市型キャンパスの校舎と歩廊が中庭を囲む学術ゾーン。',
      flavor: '芝生のクアッドに学生たちの足音とスピーカーのチャイムが響く。',
      palette: palettes.campus,
      style: 'campus',
      clusters: 4,
      quadSize: 5,
      courtyard: true,
      mixin: { normalMixed: 0.31, blockDimMixed: 0.37, tags: ['campus', 'education', 'school'] }
    },
    {
      id: 'modern-school',
      name: '近代学園',
      description: '体育館と学舎が整然と並ぶ近代的な学校区画。',
      flavor: '最新型のグラウンドライトと掲示板が、学園都市の朝を鮮やかに演出する。',
      palette: palettes.campus,
      style: 'campus',
      clusters: 3,
      quadSize: 6,
      courtyard: false,
      greens: true,
      mixin: { normalMixed: 0.29, blockDimMixed: 0.35, tags: ['school', 'education'] }
    },
    {
      id: 'urban-university',
      name: 'アーバン大学街',
      description: '研究棟と講義棟が連なる大都市の大学街。',
      flavor: 'ラボの換気音と図書館の静謐が同居し、学問都市の息遣いが流れる。',
      palette: palettes.campus,
      style: 'campus',
      clusters: 6,
      quadSize: 5,
      courtyard: true,
      greens: true,
      mixin: { normalMixed: 0.28, blockDimMixed: 0.36, tags: ['university', 'education', 'research'] }
    },
    {
      id: 'central-hospital',
      name: '中央メディカルコンプレックス',
      description: '中核病院の病棟と接続廊下が重層的に広がるメディカルコンプレックス。',
      flavor: '救急車のサイレンと電子カルテの通知音が遠くで重なり、緊張感ある静けさが漂う。',
      palette: palettes.medical,
      style: 'facility',
      roomCount: 10,
      roomSize: [4, 7],
      corridorWidth: 2,
      centralHub: true,
      secureRings: 1,
      mixin: { normalMixed: 0.27, blockDimMixed: 0.34, tags: ['medical', 'hospital', 'facility'] }
    },
    {
      id: 'medical-research',
      name: '医療研究ゾーン',
      description: 'バイオ研究棟とクリーンルームが絡み合う医療研究区。',
      flavor: 'バイオセーフティドアの開閉音と冷却装置の低い唸りが、先端医療の最前線を演出する。',
      palette: palettes.medical,
      style: 'facility',
      roomCount: 8,
      roomSize: [5, 7],
      corridorWidth: 2,
      centralHub: false,
      secureRings: 2,
      mixin: { normalMixed: 0.24, blockDimMixed: 0.32, tags: ['medical', 'research'] }
    },
    {
      id: 'corporate-offices',
      name: 'コーポレートオフィス',
      description: '会議室とコワーキングスペースが交差する企業オフィス街区。',
      flavor: 'ガラスウォールの奥でホログラム会議が進み、エスカレーターが絶えず人を運ぶ。',
      palette: palettes.downtown,
      style: 'facility',
      roomCount: 9,
      roomSize: [4, 6],
      corridorWidth: 2,
      centralHub: true,
      secureRings: 0,
      mixin: { normalMixed: 0.3, blockDimMixed: 0.36, tags: ['office', 'business'] }
    },
    {
      id: 'tech-research-core',
      name: 'テクノロジー研究核',
      description: '複数のイノベーション中枢がリング状に配置されたテクノロジー研究核。',
      flavor: '中央ハブでドローンが交差し、サーバーラックの光が脈動する未来都市のラボ。',
      palette: palettes.medical,
      style: 'radial',
      rings: 2,
      spokes: 7,
      ringWidth: 2,
      hubRadius: 4,
      mixin: { normalMixed: 0.25, blockDimMixed: 0.33, tags: ['research', 'technology'] }
    },
    {
      id: 'security-complex',
      name: 'セキュリティ施設',
      description: '警備棟と監視塔が層状に接続されたセキュリティ施設群。',
      flavor: 'バリアゲートの警告灯と監視ドローンの残響が、防衛拠点の緊張感を醸し出す。',
      palette: palettes.civic,
      style: 'facility',
      roomCount: 8,
      roomSize: [4, 6],
      corridorWidth: 2,
      centralHub: true,
      secureRings: 3,
      mixin: { normalMixed: 0.22, blockDimMixed: 0.32, tags: ['security', 'facility'] }
    },
    {
      id: 'metro-interchange',
      name: 'メトロハブ',
      description: '複数路線が乗り入れる巨大地下鉄ターミナル。',
      flavor: 'ホームに反響するアナウンスとレールの軋みが、絶え間ない都市輸送を体感させる。',
      palette: palettes.arterial,
      style: 'transit',
      lanes: 4,
      laneWidth: 3,
      sidings: true,
      mezzanine: true,
      diagonal: true,
      mixin: { normalMixed: 0.35, blockDimMixed: 0.4, tags: ['transit', 'underground', 'hub'] }
    },
    {
      id: 'subway-yards',
      name: 'サブウェイ車両基地',
      description: '整備ヤードと引き込み線が広がる地下鉄車両基地。',
      flavor: '車両整備用クレーンが行き交い、油と鉄の匂いが空気を満たす。',
      palette: palettes.arterial,
      style: 'transit',
      lanes: 3,
      laneWidth: 2,
      sidings: true,
      mezzanine: false,
      diagonal: false,
      mixin: { normalMixed: 0.3, blockDimMixed: 0.37, tags: ['transit', 'rail'] }
    },
    {
      id: 'elevated-highway',
      name: '高架ハイウェイ',
      description: '高速道路とジャンクションが交錯する立体高架ネットワーク。',
      flavor: '流線型のランプが高架下を縫い、ヘッドライトの軌跡が夜空に帯を描く。',
      palette: palettes.arterial,
      style: 'transit',
      lanes: 3,
      laneWidth: 3,
      sidings: false,
      mezzanine: true,
      diagonal: true,
      sideWalk: false,
      mixin: { normalMixed: 0.31, blockDimMixed: 0.37, tags: ['roads', 'highway'] }
    },
    {
      id: 'festival-promenade',
      name: 'フェスティバルプロムナード',
      description: 'イベント会場と歩行者天国が彩るフェスティバルプロムナード。',
      flavor: '屋台の香りとライブステージの歓声が交じり合い、色鮮やかな旗が風に踊る。',
      palette: palettes.leisure,
      style: 'radial',
      rings: 2,
      spokes: 5,
      hubRadius: 3,
      accentChords: true,
      mixin: { normalMixed: 0.27, blockDimMixed: 0.34, tags: ['festival', 'leisure', 'plaza'] }
    },
    {
      id: 'amusement-quarter',
      name: 'レジャークォーター',
      description: 'アトラクションと庭園が入り混じる都市型レジャークォーター。',
      flavor: 'ジェットコースターの軋む音と噴水の水しぶきが、遊興の夜をきらめかせる。',
      palette: palettes.leisure,
      style: 'park',
      ponds: 3,
      loops: 6,
      width: 2,
      plazas: 2,
      mixin: { normalMixed: 0.26, blockDimMixed: 0.33, tags: ['leisure', 'entertainment'] }
    },
    {
      id: 'tourist-promenade',
      name: '観光プロムナード',
      description: '観光名所を巡る遊歩道とギャラリーが連なる観光プロムナード。',
      flavor: '土産店の明かりと街路芸術が連なり、外国語の会話が絶えない。',
      palette: palettes.heritage,
      style: 'grid',
      blockSize: 5,
      roadWidth: 2,
      plazas: 2,
      accentStripes: false,
      walkwayColor: palettes.heritage.park,
      mixin: { normalMixed: 0.29, blockDimMixed: 0.36, tags: ['tourism', 'cultural'] }
    },
    {
      id: 'old-town-alleys',
      name: 'オールドタウン路地',
      description: '石畳の細路地が迷宮のように絡む歴史地区。',
      flavor: 'ガス灯が温かな光を落とし、古い木製の扉が時折きしむ。',
      palette: palettes.heritage,
      style: 'grid',
      blockSize: 4,
      roadWidth: 1,
      plazas: 1,
      alleys: true,
      accentStripes: false,
      mixin: { normalMixed: 0.28, blockDimMixed: 0.35, tags: ['historic', 'alley', 'tourism'] }
    },
    {
      id: 'library-archives',
      name: '大図書館アーカイブ',
      description: '書庫とアーカイブが同心円状に連なる大図書館アーカイブ。',
      flavor: '革装丁の香りと静かなページをめくる音が、知識の海へ誘う。',
      palette: palettes.heritage,
      style: 'radial',
      rings: 3,
      spokes: 6,
      hubRadius: 4,
      ringWidth: 1,
      mixin: { normalMixed: 0.24, blockDimMixed: 0.32, tags: ['library', 'knowledge', 'facility'] }
    }
  ];

  function createGenerators(){
    return generatorBlueprints.map(def => {
      const factory = styleFactories[def.style];
      const algorithm = factory ? factory(def) : () => {};
      return {
        id: def.id,
        name: def.name,
        description: def.description,
        mixin: def.mixin,
        algorithm,
        meta: {
          palette: def.palette,
          soundscape: def.soundscape || null,
          flavor: def.flavor || null,
          addonId: ADDON_ID
        }
      };
    });
  }

  function createBlocks(){
    const blocks1 = [];
    const blocks2 = [];
    const blocks3 = [];
    generatorBlueprints.forEach((def, index) => {
      const baseKey = def.id.replace(/[^a-z0-9]+/g, '_');
      const levelBase = 4 + index;
      blocks1.push({
        key: `${baseKey}_district`,
        name: `${def.name} District`,
        nameKey: `dungeon.types.${def.id}.blocks.district`,
        level: levelBase,
        size: 0,
        depth: 1,
        chest: 'normal',
        type: def.id,
        bossFloors: [5]
      });
      blocks2.push({
        key: `${baseKey}_complex`,
        name: `${def.name} Complex`,
        nameKey: `dungeon.types.${def.id}.blocks.complex`,
        level: levelBase + 6,
        size: 1,
        depth: 2,
        chest: index % 2 === 0 ? 'more' : 'less',
        type: def.id,
        bossFloors: [10]
      });
      blocks3.push({
        key: `${baseKey}_landmark`,
        name: `${def.name} Landmark`,
        nameKey: `dungeon.types.${def.id}.blocks.landmark`,
        level: levelBase + 12,
        size: 2,
        depth: 3,
        chest: 'normal',
        type: def.id,
        bossFloors: [15]
      });
    });
    return { blocks1, blocks2, blocks3 };
  }

  const addon = {
    id: ADDON_ID,
    name: ADDON_NAME,
    nameKey: 'dungeon.packs.modern_metropolis_pack.name',
    version: VERSION,
    api: '1.0.0',
    description: '現代都市をモチーフに、交差点やビル街、教育・医療機関、観光地までを臨場感豊かに描く25種類の大規模生成タイプを収録した拡張パック。',
    descriptionKey: 'dungeon.packs.modern_metropolis_pack.description',
    blocks: createBlocks(),
    generators: createGenerators()
  };

  window.registerDungeonAddon(addon);
})();

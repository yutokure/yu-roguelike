(function(){
  const ADDON_ID = 'neo_research_arcology_pack';
  const ADDON_NAME = 'ネオ・リサーチアーコロジー拡張';
  const VERSION = '1.0.0';

  const palettes = {
    atrium:   { floor: '#10152a', alt: '#182a55', accent: '#58d5ff', wall: '#070b16' },
    grid:     { floor: '#121216', alt: '#1b1f33', accent: '#ff6bd6', wall: '#07070d' },
    skyrail:  { floor: '#152232', alt: '#1c364b', accent: '#6ae9ff', wall: '#081018' },
    quantum:  { floor: '#161329', alt: '#231f4d', accent: '#d899ff', wall: '#0a0718' },
    biodome:  { floor: '#0c1f16', alt: '#164c34', accent: '#32ffa7', wall: '#06140d' },
    coolant:  { floor: '#0f1e2c', alt: '#1c3b57', accent: '#9cf6ff', wall: '#08101a' },
    holo:     { floor: '#141418', alt: '#22283b', accent: '#f5ff87', wall: '#07080d' }
  };

  function clamp(value, min, max){
    return Math.max(min, Math.min(max, value));
  }

  function mixColor(hex, ratio){
    if(!hex) return hex;
    const normalized = hex.replace(/^#/, '');
    if(normalized.length !== 6) return hex;
    const mixChannel = (index) => {
      const base = parseInt(normalized.slice(index, index + 2), 16);
      const mixed = Math.round(base + (255 - base) * ratio);
      return clamp(mixed, 0, 255).toString(16).padStart(2, '0');
    };
    return '#' + mixChannel(0) + mixChannel(2) + mixChannel(4);
  }

  function rand(ctx){
    return (typeof ctx.random === 'function') ? ctx.random() : Math.random();
  }

  function fillSolid(ctx, value){
    const { width, height } = ctx;
    for(let y = 0; y < height; y++){
      for(let x = 0; x < width; x++){
        if(x === 0 || y === 0 || x === width - 1 || y === height - 1){
          ctx.set(x, y, 1);
        } else {
          ctx.set(x, y, value);
        }
      }
    }
  }

  function carveRect(ctx, x0, y0, x1, y1){
    const minX = clamp(Math.min(x0, x1), 1, ctx.width - 2);
    const maxX = clamp(Math.max(x0, x1), 1, ctx.width - 2);
    const minY = clamp(Math.min(y0, y1), 1, ctx.height - 2);
    const maxY = clamp(Math.max(y0, y1), 1, ctx.height - 2);
    for(let y = minY; y <= maxY; y++){
      for(let x = minX; x <= maxX; x++){
        ctx.set(x, y, 0);
      }
    }
  }

  function carveDiscValue(ctx, cx, cy, radius, value){
    const r = Math.max(1, Math.floor(radius));
    const r2 = r * r;
    for(let y = cy - r; y <= cy + r; y++){
      for(let x = cx - r; x <= cx + r; x++){
        if(!ctx.inBounds(x, y)) continue;
        const dx = x - cx;
        const dy = y - cy;
        if(dx * dx + dy * dy <= r2){
          ctx.set(x, y, value);
        }
      }
    }
  }

  function carveDisc(ctx, cx, cy, radius){
    carveDiscValue(ctx, cx, cy, radius, 0);
  }

  function carveRing(ctx, cx, cy, outerRadius, innerRadius){
    carveDiscValue(ctx, cx, cy, outerRadius, 0);
    if(innerRadius > 0){
      carveDiscValue(ctx, cx, cy, innerRadius, 1);
    }
  }

  function carveLine(ctx, x0, y0, x1, y1, width = 1){
    let dx = Math.abs(x1 - x0);
    let sx = x0 < x1 ? 1 : -1;
    let dy = -Math.abs(y1 - y0);
    let sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    const half = Math.max(0, Math.floor(width / 2));
    while(true){
      for(let yy = -half; yy <= half; yy++){
        for(let xx = -half; xx <= half; xx++){
          const tx = x0 + xx;
          const ty = y0 + yy;
          if(ctx.inBounds(tx, ty)) ctx.set(tx, ty, 0);
        }
      }
      if(x0 === x1 && y0 === y1) break;
      const e2 = err * 2;
      if(e2 >= dy){ err += dy; x0 += sx; }
      if(e2 <= dx){ err += dx; y0 += sy; }
    }
  }

  function applyPalette(ctx, palette, options = {}){
    const stride = options.stride ?? 4;
    const accentChance = options.accentChance ?? 0.06;
    const altChance = options.altChance ?? 0.4;
    const altColor = palette.alt || palette.floor;
    const accent = palette.accent || altColor;
    const wall = palette.wall || mixColor(palette.floor, 0.15);
    for(let y = 1; y < ctx.height - 1; y++){
      for(let x = 1; x < ctx.width - 1; x++){
        if(ctx.get(x, y) === 0){
          let color = palette.floor;
          if(((x + y) % stride === 0) || rand(ctx) < altChance){
            color = altColor;
          }
          if(accent && (((x * 3 + y * 7) % (stride * 3) === 0) || rand(ctx) < accentChance)){
            color = accent;
          }
          ctx.setFloorColor(x, y, color);
        } else if(wall){
          ctx.setWallColor(x, y, wall);
        }
      }
    }
  }

  function accentNodes(ctx, nodes, palette){
    const accent = palette.accent;
    if(!accent) return;
    nodes.forEach(({ x, y, radius = 1 }) => {
      carveDisc(ctx, x, y, radius);
      for(let yy = y - radius; yy <= y + radius; yy++){
        for(let xx = x - radius; xx <= x + radius; xx++){
          if(!ctx.inBounds(xx, yy)) continue;
          if(ctx.get(xx, yy) === 0){
            ctx.setFloorColor(xx, yy, accent);
          }
        }
      }
    });
  }

  function researchAtriumAlgorithm(ctx){
    fillSolid(ctx, 1);
    const cx = Math.floor(ctx.width / 2);
    const cy = Math.floor(ctx.height / 2);
    const maxRadius = Math.min(cx, cy) - 2;
    const rings = 3 + Math.floor(rand(ctx) * 3);
    const ringStep = Math.max(3, Math.floor(maxRadius / (rings + 1)));
    for(let i = 1; i <= rings; i++){
      const outer = i * ringStep;
      const inner = Math.max(0, outer - Math.max(2, Math.floor(ringStep / 2)));
      carveRing(ctx, cx, cy, outer, inner);
    }
    const spokes = 6;
    for(let i = 0; i < spokes; i++){
      const angle = (Math.PI * 2 * i) / spokes;
      const px = cx + Math.round(Math.cos(angle) * (maxRadius - 1));
      const py = cy + Math.round(Math.sin(angle) * (maxRadius - 1));
      carveLine(ctx, cx, cy, px, py, 2);
    }
    const pods = [];
    const podRadius = Math.max(2, Math.floor(ringStep / 2));
    for(let i = 0; i < 10; i++){
      const angle = (Math.PI * 2 * i) / 10;
      const radius = podRadius * (1.8 + (rand(ctx) * 0.4));
      const px = cx + Math.round(Math.cos(angle) * (maxRadius - podRadius - 1));
      const py = cy + Math.round(Math.sin(angle) * (maxRadius - podRadius - 1));
      carveDisc(ctx, px, py, podRadius);
      pods.push({ x: px, y: py, radius: Math.max(1, podRadius - 1) });
    }
    accentNodes(ctx, pods, palettes.atrium);
    applyPalette(ctx, palettes.atrium, { stride: 5, accentChance: 0.12, altChance: 0.25 });
    ctx.ensureConnectivity();
  }

  function circuitGridAlgorithm(ctx){
    fillSolid(ctx, 1);
    const spacing = 4 + Math.floor(rand(ctx) * 3);
    for(let y = 2; y < ctx.height - 2; y += spacing){
      carveRect(ctx, 1, y - 1, ctx.width - 2, y + 1);
    }
    for(let x = 2; x < ctx.width - 2; x += spacing){
      carveRect(ctx, x - 1, 1, x + 1, ctx.height - 2);
    }
    for(let y = spacing; y < ctx.height - spacing; y += spacing){
      for(let x = spacing; x < ctx.width - spacing; x += spacing){
        const size = 1 + Math.floor(rand(ctx) * 2);
        carveRect(ctx, x - size, y - size, x + size, y + size);
      }
    }
    const diagonals = 3 + Math.floor(rand(ctx) * 3);
    for(let i = 0; i < diagonals; i++){
      const offset = Math.floor(rand(ctx) * spacing);
      carveLine(ctx, 1, 1 + offset, ctx.width - 2, ctx.height - 2 - offset, 1);
      carveLine(ctx, 1, ctx.height - 2 - offset, ctx.width - 2, 1 + offset, 1);
    }
    applyPalette(ctx, palettes.grid, { stride: 6, accentChance: 0.18, altChance: 0.3 });
    ctx.ensureConnectivity();
  }

  function skyrailTierAlgorithm(ctx){
    fillSolid(ctx, 1);
    const bands = 4 + Math.floor(rand(ctx) * 2);
    const bandHeight = Math.max(3, Math.floor((ctx.height - 4) / (bands + 1)));
    for(let i = 0; i < bands; i++){
      const y0 = 2 + i * (bandHeight + 1);
      const y1 = Math.min(ctx.height - 3, y0 + bandHeight - 1);
      carveRect(ctx, 2, y0, ctx.width - 3, y1);
      if(i % 2 === 0){
        carveRect(ctx, 2, y0 - 1, Math.floor(ctx.width / 3), y0 + 1);
        carveRect(ctx, Math.floor(ctx.width * 2 / 3), y1 - 1, ctx.width - 3, y1 + 1);
      }
    }
    const connectors = 5 + Math.floor(rand(ctx) * 4);
    for(let i = 0; i < connectors; i++){
      const x = 3 + Math.floor(rand(ctx) * (ctx.width - 6));
      carveRect(ctx, x - 1, 2, x + 1, ctx.height - 3);
    }
    carveRect(ctx, 2, Math.floor(ctx.height / 2) - 1, ctx.width - 3, Math.floor(ctx.height / 2) + 1);
    applyPalette(ctx, palettes.skyrail, { stride: 5, accentChance: 0.14, altChance: 0.25 });
    ctx.ensureConnectivity();
  }

  function quantumHelixAlgorithm(ctx){
    fillSolid(ctx, 1);
    const cx = Math.floor(ctx.width / 2);
    const cy = Math.floor(ctx.height / 2);
    const loops = 3 + Math.floor(rand(ctx) * 2);
    const maxRadius = Math.min(cx, cy) - 3;
    const steps = 420;
    let angle = 0;
    for(let i = 0; i < steps; i++){
      const t = i / steps;
      const radius = Math.max(2, maxRadius * t);
      const px = cx + Math.round(Math.cos(angle) * radius);
      const py = cy + Math.round(Math.sin(angle) * radius * 0.75);
      carveDisc(ctx, px, py, 2 + Math.floor(t * 3));
      angle += (Math.PI * 2 * loops) / steps;
    }
    const anchors = [];
    for(let i = 0; i < 6; i++){
      const theta = (Math.PI * 2 * i) / 6;
      const px = cx + Math.round(Math.cos(theta) * (maxRadius - 2));
      const py = cy + Math.round(Math.sin(theta) * (maxRadius - 2));
      carveRing(ctx, px, py, 5, 2);
      anchors.push({ x: px, y: py, radius: 2 });
      carveLine(ctx, px, py, cx, cy, 1 + (i % 2));
    }
    accentNodes(ctx, anchors, palettes.quantum);
    applyPalette(ctx, palettes.quantum, { stride: 7, accentChance: 0.16, altChance: 0.28 });
    ctx.ensureConnectivity();
  }

  function biodomeCascadeAlgorithm(ctx){
    fillSolid(ctx, 1);
    const clusters = 5 + Math.floor(rand(ctx) * 3);
    const positions = [];
    for(let i = 0; i < clusters; i++){
      const px = 3 + Math.floor(rand(ctx) * (ctx.width - 6));
      const py = 3 + Math.floor(rand(ctx) * (ctx.height - 6));
      const radius = 3 + Math.floor(rand(ctx) * 3);
      carveDisc(ctx, px, py, radius + 1);
      positions.push({ x: px, y: py, radius });
      const subPods = 2 + Math.floor(rand(ctx) * 3);
      for(let j = 0; j < subPods; j++){
        const angle = rand(ctx) * Math.PI * 2;
        const dist = radius + 2 + Math.floor(rand(ctx) * 3);
        const sx = clamp(px + Math.round(Math.cos(angle) * dist), 2, ctx.width - 3);
        const sy = clamp(py + Math.round(Math.sin(angle) * dist), 2, ctx.height - 3);
        carveDisc(ctx, sx, sy, Math.max(2, Math.floor(radius / 2)));
        carveLine(ctx, px, py, sx, sy, 1);
      }
    }
    for(let i = 0; i < positions.length; i++){
      for(let j = i + 1; j < positions.length; j++){
        if(rand(ctx) < 0.5){
          carveLine(ctx, positions[i].x, positions[i].y, positions[j].x, positions[j].y, 2);
        }
      }
    }
    accentNodes(ctx, positions, palettes.biodome);
    applyPalette(ctx, palettes.biodome, { stride: 4, accentChance: 0.22, altChance: 0.35 });
    ctx.ensureConnectivity();
  }

  function coolantVaultAlgorithm(ctx){
    fillSolid(ctx, 1);
    const margin = 3;
    carveRect(ctx, margin, margin, ctx.width - margin - 1, ctx.height - margin - 1);
    carveRect(ctx, margin + 3, margin + 3, ctx.width - margin - 4, ctx.height - margin - 4);
    carveRect(ctx, Math.floor(ctx.width / 2) - 2, margin, Math.floor(ctx.width / 2) + 2, ctx.height - margin - 1);
    carveRect(ctx, margin, Math.floor(ctx.height / 2) - 2, ctx.width - margin - 1, Math.floor(ctx.height / 2) + 2);
    const bays = 6;
    for(let i = 0; i < bays; i++){
      const x = margin + 2 + i * Math.floor((ctx.width - margin * 2 - 4) / bays);
      carveRect(ctx, x, margin + 1, x + 1, margin + 6);
      carveRect(ctx, x, ctx.height - margin - 6, x + 1, ctx.height - margin - 2);
    }
    const vents = [];
    for(let i = 0; i < 8; i++){
      const x = 4 + Math.floor(rand(ctx) * (ctx.width - 8));
      const y = 4 + Math.floor(rand(ctx) * (ctx.height - 8));
      carveRing(ctx, x, y, 3, 1);
      vents.push({ x, y, radius: 1 });
    }
    accentNodes(ctx, vents, palettes.coolant);
    applyPalette(ctx, palettes.coolant, { stride: 6, accentChance: 0.18, altChance: 0.3 });
    ctx.ensureConnectivity();
  }

  function holoDistrictAlgorithm(ctx){
    fillSolid(ctx, 1);
    const cx = Math.floor(ctx.width / 2);
    const cy = Math.floor(ctx.height / 2);
    const radius = Math.min(cx, cy) - 3;
    const points = [];
    const segments = 8;
    for(let i = 0; i < segments; i++){
      const angle = (Math.PI * 2 * i) / segments;
      const px = cx + Math.round(Math.cos(angle) * radius);
      const py = cy + Math.round(Math.sin(angle) * radius * (i % 2 === 0 ? 1 : 0.75));
      points.push({ x: px, y: py });
    }
    for(let i = 0; i < points.length; i++){
      const a = points[i];
      const b = points[(i + 1) % points.length];
      carveLine(ctx, a.x, a.y, b.x, b.y, 2);
    }
    carveRing(ctx, cx, cy, Math.floor(radius * 0.6), Math.floor(radius * 0.35));
    for(let i = 0; i < points.length; i++){
      carveLine(ctx, cx, cy, points[i].x, points[i].y, 1 + (i % 2));
    }
    const accents = points.map(pt => ({ x: pt.x, y: pt.y, radius: 1 }));
    accentNodes(ctx, accents, palettes.holo);
    applyPalette(ctx, palettes.holo, { stride: 5, accentChance: 0.2, altChance: 0.32 });
    ctx.ensureConnectivity();
  }

  function createGenerators(){
    return [
      {
        id: 'neo_research_atrium',
        name: 'シンセ研究アトリウム',
        description: '多層リングと研究ポッドが広がる中枢アトリウム区画。',
        algorithm: researchAtriumAlgorithm,
        mixin: { normalMixed: 0.55, blockDimMixed: 0.65, tags: ['futuristic', 'research', 'circular'] }
      },
      {
        id: 'neo_circuit_grid',
        name: '量子回路グリッド',
        description: '幾何学的な配線と交差ノードを持つ都市制御層。',
        algorithm: circuitGridAlgorithm,
        mixin: { normalMixed: 0.6, blockDimMixed: 0.7, tags: ['urban', 'lab', 'grid'] }
      },
      {
        id: 'neo_skyrail_tiered',
        name: '階層スカイレール',
        description: '空中回廊と垂直連絡路が縦横に走る都市交通層。',
        algorithm: skyrailTierAlgorithm,
        mixin: { normalMixed: 0.62, blockDimMixed: 0.68, tags: ['transport', 'future', 'open'] }
      },
      {
        id: 'neo_quantum_helix',
        name: '量子螺旋試験場',
        description: '螺旋加速路と収束ノードが絡み合う実験施設。',
        algorithm: quantumHelixAlgorithm,
        mixin: { normalMixed: 0.5, blockDimMixed: 0.72, tags: ['research', 'quantum', 'dynamic'] }
      },
      {
        id: 'neo_biodome_cascade',
        name: 'バイオドームカスケード',
        description: 'バイオ球体と生態廊が連なる多段アトリウム。',
        algorithm: biodomeCascadeAlgorithm,
        mixin: { normalMixed: 0.58, blockDimMixed: 0.66, tags: ['bio', 'garden', 'future'] }
      },
      {
        id: 'neo_coolant_vault',
        name: '冷却コア金庫',
        description: '複合制御層と冷却プールを備えた地下保守区画。',
        algorithm: coolantVaultAlgorithm,
        mixin: { normalMixed: 0.52, blockDimMixed: 0.74, tags: ['industrial', 'maintenance', 'lab'] }
      },
      {
        id: 'neo_holo_district',
        name: 'ホロシティ中枢',
        description: 'ホログラム広場と多角コアが点在する都市核。',
        algorithm: holoDistrictAlgorithm,
        mixin: { normalMixed: 0.57, blockDimMixed: 0.7, tags: ['urban', 'hologram', 'future'] }
      }
    ];
  }

  function createBlocks(){
    const dimensions = [
      { key: 'neo-crown-stratum', name: 'クラウン研究層', baseLevel: 95 },
      { key: 'neo-arcology-core', name: 'アーコロジー中枢層', baseLevel: 120 },
      { key: 'neo-horizon-tier', name: 'ホライズン高層帯', baseLevel: 145 },
      { key: 'neo-substrate-vault', name: 'サブストレート保守層', baseLevel: 110 }
    ];

    const blocks1 = [
      { key: 'neo-atrium-01', name: '実験アトリウム基層', level: +1, size: 0, depth: 0, chest: 'normal', type: 'neo_research_atrium' },
      { key: 'neo-atrium-02', name: 'ポッドラボ回廊', level: +2, size: +1, depth: 0, chest: 'more', type: 'neo_research_atrium' },
      { key: 'neo-grid-01', name: '都市基板グリッド', level: +1, size: 0, depth: 0, chest: 'normal', type: 'neo_circuit_grid' },
      { key: 'neo-grid-02', name: '監視ノード街区', level: +2, size: 0, depth: 0, chest: 'less', type: 'neo_circuit_grid' },
      { key: 'neo-skyrail-01', name: 'スカイレール回廊', level: +1, size: +1, depth: 0, chest: 'normal', type: 'neo_skyrail_tiered' },
      { key: 'neo-skyrail-02', name: '昇降連絡棟', level: +2, size: 0, depth: 0, chest: 'less', type: 'neo_skyrail_tiered' },
      { key: 'neo-helix-01', name: '螺旋試験フロア', level: +2, size: +1, depth: 0, chest: 'normal', type: 'neo_quantum_helix' },
      { key: 'neo-biodome-01', name: 'バイオアトリウム層', level: +1, size: 0, depth: 0, chest: 'more', type: 'neo_biodome_cascade' },
      { key: 'neo-biodome-02', name: '生態観測廊', level: +2, size: 0, depth: 0, chest: 'normal', type: 'neo_biodome_cascade' },
      { key: 'neo-coolant-01', name: '冷却整備区画', level: +1, size: 0, depth: 0, chest: 'normal', type: 'neo_coolant_vault' },
      { key: 'neo-holo-01', name: 'ホロシティ遊歩', level: +1, size: 0, depth: 0, chest: 'more', type: 'neo_holo_district' },
      { key: 'neo-holo-02', name: '投影交差コンコース', level: +2, size: 0, depth: 0, chest: 'normal', type: 'neo_holo_district' }
    ];

    const blocks2 = [
      { key: 'neo-atrium-advanced-01', name: '研究ドーム外郭', level: +3, size: +1, depth: +1, chest: 'normal', type: 'neo_research_atrium' },
      { key: 'neo-atrium-advanced-02', name: 'シンセ循環路', level: +4, size: +1, depth: +1, chest: 'less', type: 'neo_research_atrium' },
      { key: 'neo-grid-advanced-01', name: '統合制御街区', level: +3, size: +1, depth: +1, chest: 'normal', type: 'neo_circuit_grid' },
      { key: 'neo-grid-advanced-02', name: 'データセンタープラザ', level: +4, size: 0, depth: +1, chest: 'more', type: 'neo_circuit_grid' },
      { key: 'neo-skyrail-advanced-01', name: '上層トランジット網', level: +3, size: +1, depth: +1, chest: 'normal', type: 'neo_skyrail_tiered' },
      { key: 'neo-skyrail-advanced-02', name: 'ヘリックス連絡橋', level: +4, size: 0, depth: +1, chest: 'less', type: 'neo_skyrail_tiered' },
      { key: 'neo-helix-advanced-01', name: '量子束縛回廊', level: +4, size: +1, depth: +1, chest: 'normal', type: 'neo_quantum_helix' },
      { key: 'neo-helix-advanced-02', name: '収束パルサーハブ', level: +5, size: 0, depth: +1, chest: 'less', type: 'neo_quantum_helix' },
      { key: 'neo-biodome-advanced-01', name: '生態連結庭園', level: +3, size: +1, depth: +1, chest: 'more', type: 'neo_biodome_cascade' },
      { key: 'neo-coolant-advanced-01', name: '冷却配管制御層', level: +4, size: +1, depth: +1, chest: 'normal', type: 'neo_coolant_vault' },
      { key: 'neo-holo-advanced-01', name: 'ホログラム展望区', level: +3, size: 0, depth: +1, chest: 'more', type: 'neo_holo_district' },
      { key: 'neo-holo-advanced-02', name: '多角プラザ制御核', level: +4, size: +1, depth: +1, chest: 'less', type: 'neo_holo_district' }
    ];

    const blocks3 = [
      { key: 'neo-atrium-core', name: 'アトリウム主制御核', level: +5, size: +2, depth: +2, chest: 'normal', type: 'neo_research_atrium', bossFloors: [15, 25] },
      { key: 'neo-grid-core', name: '都市管制メッシュ核', level: +5, size: +1, depth: +2, chest: 'less', type: 'neo_circuit_grid', bossFloors: [18] },
      { key: 'neo-skyrail-core', name: 'スカイレール統括塔', level: +5, size: +2, depth: +2, chest: 'normal', type: 'neo_skyrail_tiered', bossFloors: [16, 22] },
      { key: 'neo-helix-core', name: '量子螺旋炉心', level: +6, size: +2, depth: +3, chest: 'less', type: 'neo_quantum_helix', bossFloors: [20] },
      { key: 'neo-biodome-core', name: 'バイオドーム母艦', level: +5, size: +2, depth: +2, chest: 'more', type: 'neo_biodome_cascade', bossFloors: [17, 23] },
      { key: 'neo-coolant-core', name: '冷却封鎖コア', level: +5, size: +1, depth: +3, chest: 'less', type: 'neo_coolant_vault', bossFloors: [19] },
      { key: 'neo-holo-core', name: 'ホロシティ統合核', level: +6, size: +1, depth: +2, chest: 'normal', type: 'neo_holo_district', bossFloors: [18, 26] },
      { key: 'neo-helix-singularity', name: 'シンギュラリティ観測室', level: +6, size: +2, depth: +3, chest: 'less', type: 'neo_quantum_helix', bossFloors: [24] },
      { key: 'neo-grid-overseer', name: 'オーバーシア制御床', level: +5, size: +1, depth: +2, chest: 'normal', type: 'neo_circuit_grid', bossFloors: [21] },
      { key: 'neo-biodome-warden', name: '遺伝子監視核', level: +5, size: +1, depth: +3, chest: 'less', type: 'neo_biodome_cascade', bossFloors: [22] },
      { key: 'neo-coolant-reactor', name: '冷却炉心制御座', level: +6, size: +2, depth: +3, chest: 'normal', type: 'neo_coolant_vault', bossFloors: [25] },
      { key: 'neo-holo-prism', name: 'ホロプリズム神殿', level: +6, size: +2, depth: +3, chest: 'more', type: 'neo_holo_district', bossFloors: [20, 28] }
    ];

    return { dimensions, blocks1, blocks2, blocks3 };
  }

  const addon = {
    id: ADDON_ID,
    name: ADDON_NAME,
    version: VERSION,
    api: '1.0.0',
    description: '未来研究都市アーコロジーを舞台に、多層リングや螺旋実験路、バイオドーム、冷却金庫、ホロシティなど7つの生成タイプと36ブロック、4次元帯を追加する大規模拡張。',
    blocks: createBlocks(),
    generators: createGenerators()
  };

  window.registerDungeonAddon(addon);
})();

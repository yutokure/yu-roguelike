(function(){
  const ADDON_ID = 'fairytale_wonderlands_pack';
  const ADDON_NAME = 'Fairytale Wonderlands Pack';
  const VERSION = '1.0.0';

  const palettes = {
    glimmer: ['#ecffcf', '#c4f5f2', '#ffe1ff', '#f9ffd7'],
    moonPumpkin: ['#ffe9b5', '#ffd4f0', '#c6b8ff', '#fff0c2'],
    candy: ['#ffb6c1', '#ffd9ec', '#fbe7a1', '#bdf0ff'],
    rose: ['#ffccd6', '#ffc0e6', '#ffe4f9', '#c7f1ff'],
    library: ['#efe7ff', '#d9caff', '#b5b8ff', '#fff9e3'],
    willow: ['#c6f9d5', '#b7e4ff', '#e9ffe7', '#def5ff'],
    snow: ['#edf5ff', '#d8f0ff', '#f5e7ff', '#c0e6ff'],
    toybox: ['#ffe3af', '#ffc4d6', '#d7c8ff', '#ffebc6'],
    rainbow: ['#ffd1f7', '#ffe1b5', '#c1f2ff', '#d6ffc7'],
    carriage: ['#e2ddff', '#f9dfff', '#ffeab8', '#d2f5ff'],
    bubble: ['#d3f7ff', '#e8fff6', '#ffeefc', '#c4f0ff'],
    marshmallow: ['#fff3f3', '#ffe1f0', '#fff9d8', '#e0f7ff'],
    dreamcatcher: ['#d5e1ff', '#f1d7ff', '#ffd8f5', '#e9f7ff'],
    moss: ['#e3ffd9', '#c9f7e0', '#e9ffe9', '#d8ffed'],
    cloudlace: ['#f4f8ff', '#e7f1ff', '#fdeaff', '#d8eaff'],
    peppermint: ['#e2fff6', '#c2ffe7', '#faffec', '#d2faff'],
    lantern: ['#fff1cf', '#ffe0cc', '#ffd0ea', '#d1f1ff'],
    gingerbread: ['#ffe4c4', '#ffd4a8', '#ffdeda', '#fff3e2'],
    lullaby: ['#def3ff', '#f1e0ff', '#fff4d9', '#cfefff'],
    aurora: ['#e3f4ff', '#e7dcff', '#ffe9ff', '#d4fbff']
  };

  function sanitizeKey(value){
    return (value || '').toString().trim().replace(/[^a-z0-9]+/gi, '_').toLowerCase();
  }

  function lerpColor(a, b, t){
    const pa = parseInt(a.slice(1), 16);
    const pb = parseInt(b.slice(1), 16);
    const r1 = (pa >> 16) & 0xff;
    const g1 = (pa >> 8) & 0xff;
    const b1 = pa & 0xff;
    const r2 = (pb >> 16) & 0xff;
    const g2 = (pb >> 8) & 0xff;
    const b2 = pb & 0xff;
    const mix = (x1, x2) => Math.round(x1 + (x2 - x1) * t)
      .toString(16)
      .padStart(2, '0');
    return `#${mix(r1, r2)}${mix(g1, g2)}${mix(b1, b2)}`;
  }

  function pick(arr, rnd){
    if(!arr || !arr.length) return '#ffffff';
    return arr[Math.floor(rnd() * arr.length) % arr.length];
  }

  function fillGradientWalls(ctx, top, bottom){
    const { width: W, height: H } = ctx;
    for(let y = 0; y < H; y++){
      const t = H <= 1 ? 0 : y / (H - 1);
      const tone = lerpColor(top, bottom, t);
      for(let x = 0; x < W; x++){
        ctx.set(x, y, 1);
        ctx.setWallColor(x, y, tone);
      }
    }
  }

  function fillFlatWalls(ctx, color){
    const { width: W, height: H } = ctx;
    for(let y = 0; y < H; y++){
      for(let x = 0; x < W; x++){
        ctx.set(x, y, 1);
        ctx.setWallColor(x, y, color);
      }
    }
  }

  function carveCircle(ctx, cx, cy, radius, palette){
    const { inBounds, random, set, setFloorColor } = ctx;
    const r2 = radius * radius;
    for(let y = -radius; y <= radius; y++){
      for(let x = -radius; x <= radius; x++){
        const nx = cx + x;
        const ny = cy + y;
        if(!inBounds(nx, ny)) continue;
        if(x * x + y * y <= r2){
          set(nx, ny, 0);
          setFloorColor(nx, ny, pick(palette, random));
        }
      }
    }
  }

  function carveEllipse(ctx, cx, cy, rx, ry, palette){
    const { inBounds, random, set, setFloorColor } = ctx;
    const rx2 = rx * rx;
    const ry2 = ry * ry;
    for(let y = -ry; y <= ry; y++){
      for(let x = -rx; x <= rx; x++){
        const nx = cx + x;
        const ny = cy + y;
        if(!inBounds(nx, ny)) continue;
        if((x * x) * ry2 + (y * y) * rx2 <= rx2 * ry2){
          set(nx, ny, 0);
          setFloorColor(nx, ny, pick(palette, random));
        }
      }
    }
  }

  function carvePath(ctx, a, b, opts){
    const { random } = ctx;
    const palette = opts.palette || palettes.glimmer;
    const width = Math.max(1, opts.width || 1);
    const jitter = opts.jitter || 0;
    const steps = Math.max(1, Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y)));
    for(let i = 0; i <= steps; i++){
      const t = steps === 0 ? 0 : i / steps;
      let px = a.x + (b.x - a.x) * t;
      let py = a.y + (b.y - a.y) * t;
      if(jitter){
        px += (random() - 0.5) * jitter;
        py += (random() - 0.5) * jitter;
      }
      const cx = Math.round(px);
      const cy = Math.round(py);
      for(let oy = -width; oy <= width; oy++){
        for(let ox = -width; ox <= width; ox++){
          const tx = cx + ox;
          const ty = cy + oy;
          if(!ctx.inBounds(tx, ty)) continue;
          ctx.set(tx, ty, 0);
          ctx.setFloorColor(tx, ty, pick(palette, random));
        }
      }
    }
  }

  function sprinkleFloor(ctx, palette, chance){
    const { width: W, height: H, random, get, setFloorColor } = ctx;
    for(let y = 1; y < H - 1; y++){
      for(let x = 1; x < W - 1; x++){
        if(get(x, y) === 0 && random() < chance){
          setFloorColor(x, y, pick(palette, random));
        }
      }
    }
  }

  function scatterStars(ctx, palette, count){
    const { width: W, height: H, random, inBounds, set, setFloorColor } = ctx;
    for(let i = 0; i < count; i++){
      const x = 1 + Math.floor(random() * (W - 2));
      const y = 1 + Math.floor(random() * (H - 2));
      const size = 1 + Math.floor(random() * 2);
      for(let oy = -size; oy <= size; oy++){
        for(let ox = -size; ox <= size; ox++){
          const tx = x + ox;
          const ty = y + oy;
          if(!inBounds(tx, ty)) continue;
          if(Math.abs(ox) + Math.abs(oy) <= size){
            set(tx, ty, 0);
            setFloorColor(tx, ty, pick(palette, random));
          }
        }
      }
    }
  }

  function gardenLayout(ctx, opts){
    const { width: W, height: H, random } = ctx;
    const nodes = [];
    const margin = opts.margin ?? 5;
    const nodeCount = opts.nodeCount ?? 6;
    const rMin = opts.radiusMin ?? 3;
    const rMax = opts.radiusMax ?? 6;
    for(let i = 0; i < nodeCount; i++){
      nodes.push({
        x: margin + Math.floor(random() * Math.max(1, W - margin * 2)),
        y: margin + Math.floor(random() * Math.max(1, H - margin * 2)),
        r: Math.floor(rMin + random() * (rMax - rMin + 1))
      });
    }
    nodes.forEach(node => carveCircle(ctx, node.x, node.y, node.r, opts.palette));
    for(let i = 1; i < nodes.length; i++){
      carvePath(ctx, nodes[i - 1], nodes[i], {
        width: opts.pathWidth || 2,
        palette: opts.pathPalette || opts.palette,
        jitter: opts.pathJitter || 1.5
      });
    }
    if(nodes.length >= 3){
      const hub = nodes[0];
      for(let i = 2; i < nodes.length; i += 2){
        carvePath(ctx, hub, nodes[i], {
          width: Math.max(1, (opts.pathWidth || 2) - 1),
          palette: opts.pathPalette || opts.palette,
          jitter: 1
        });
      }
    }
    if(opts.extra){
      opts.extra(ctx, nodes);
    }
    if(opts.sparkle){
      sprinkleFloor(ctx, opts.sparklePalette || opts.palette, opts.sparkle);
    }
  }

  function riverLayout(ctx, opts){
    const { width: W, height: H, random, setFloorColor, set } = ctx;
    const channels = opts.channels ?? 3;
    for(let i = 0; i < channels; i++){
      let x = 2 + Math.floor(random() * (W - 4));
      let y = 1;
      while(y < H - 2){
        const width = opts.width ?? 2;
        for(let oy = -width; oy <= width; oy++){
          for(let ox = -width; ox <= width; ox++){
            const tx = x + ox;
            const ty = y + oy;
            if(!ctx.inBounds(tx, ty)) continue;
            set(tx, ty, 0);
            setFloorColor(tx, ty, pick(opts.palette, random));
          }
        }
        if(random() < 0.3) x += random() < 0.5 ? -1 : 1;
        if(random() < 0.15) x += random() < 0.5 ? -1 : 1;
        x = Math.max(2, Math.min(W - 3, x));
        y += 1;
      }
    }
    if(opts.glades){
      const glades = opts.glades;
      for(let i = 0; i < glades.count; i++){
        carveCircle(ctx,
          2 + Math.floor(random() * (W - 4)),
          2 + Math.floor(random() * (H - 4)),
          glades.radius,
          glades.palette || opts.palette);
      }
    }
    if(opts.sparkle){
      sprinkleFloor(ctx, opts.sparklePalette || opts.palette, opts.sparkle);
    }
  }

  function spiralLayout(ctx, opts){
    const { width: W, height: H, random, setFloorColor, set } = ctx;
    const center = { x: Math.floor(W / 2), y: Math.floor(H / 2) };
    const maxR = Math.min(center.x, center.y) - 2;
    const turnStep = opts.turnStep || 3;
    const laneWidth = Math.max(1, opts.width || 1);
    let angle = 0;
    let radius = maxR;
    while(radius > 1){
      const steps = Math.floor(radius * Math.PI);
      for(let i = 0; i < steps; i++){
        const t = i / steps;
        const theta = angle + t * Math.PI * 2;
        const x = Math.round(center.x + Math.cos(theta) * radius);
        const y = Math.round(center.y + Math.sin(theta) * radius);
        for(let oy = -laneWidth; oy <= laneWidth; oy++){
          for(let ox = -laneWidth; ox <= laneWidth; ox++){
            const tx = x + ox;
            const ty = y + oy;
            if(!ctx.inBounds(tx, ty)) continue;
            set(tx, ty, 0);
            setFloorColor(tx, ty, pick(opts.palette, random));
          }
        }
      }
      radius -= turnStep;
      angle += opts.rotate || Math.PI / 4;
    }
    if(opts.sparkle){
      sprinkleFloor(ctx, opts.sparklePalette || opts.palette, opts.sparkle);
    }
  }

  function patchworkLayout(ctx, opts){
    const { width: W, height: H, random } = ctx;
    const cellW = opts.cellWidth || 8;
    const cellH = opts.cellHeight || 6;
    for(let cy = 1; cy < H - 1; cy += cellH){
      for(let cx = 1; cx < W - 1; cx += cellW){
        const roomW = Math.min(cellW - 1, W - cx - 2);
        const roomH = Math.min(cellH - 1, H - cy - 2);
        const palette = opts.paletteVariants ? pick(opts.paletteVariants, random) : opts.palette;
        carveEllipse(ctx,
          cx + Math.floor(roomW / 2),
          cy + Math.floor(roomH / 2),
          Math.max(2, Math.floor(roomW / 2) - 1),
          Math.max(2, Math.floor(roomH / 2) - 1),
          palette);
      }
    }
    const connectors = opts.connectors || 6;
    for(let i = 0; i < connectors; i++){
      const ax = 2 + Math.floor(random() * (W - 4));
      const ay = 2 + Math.floor(random() * (H - 4));
      const bx = 2 + Math.floor(random() * (W - 4));
      const by = 2 + Math.floor(random() * (H - 4));
      carvePath(ctx, { x: ax, y: ay }, { x: bx, y: by }, {
        width: opts.pathWidth || 1,
        palette: opts.pathPalette || opts.palette,
        jitter: 2
      });
    }
    if(opts.sparkle){
      sprinkleFloor(ctx, opts.sparklePalette || opts.palette, opts.sparkle);
    }
  }

  function mazeLayout(ctx, opts){
    const { width: W, height: H, random, setFloorColor, set } = ctx;
    const cellsW = Math.floor((W - 3) / 2);
    const cellsH = Math.floor((H - 3) / 2);
    const visited = new Set();
    function key(x, y){ return `${x},${y}`; }
    const start = { x: Math.floor(random() * cellsW), y: Math.floor(random() * cellsH) };
    const stack = [start];
    while(stack.length){
      const current = stack[stack.length - 1];
      visited.add(key(current.x, current.y));
      const dirs = [
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 }
      ];
      for(let i = dirs.length - 1; i > 0; i--){
        const j = Math.floor(random() * (i + 1));
        const tmp = dirs[i];
        dirs[i] = dirs[j];
        dirs[j] = tmp;
      }
      let carved = false;
      for(const dir of dirs){
        const nx = current.x + dir.x;
        const ny = current.y + dir.y;
        if(nx < 0 || ny < 0 || nx >= cellsW || ny >= cellsH) continue;
        if(visited.has(key(nx, ny))) continue;
        const wx = 2 + current.x * 2;
        const wy = 2 + current.y * 2;
        const ex = 2 + nx * 2;
        const ey = 2 + ny * 2;
        carvePath(ctx, { x: wx, y: wy }, { x: ex, y: ey }, {
          width: opts.width || 1,
          palette: opts.palette
        });
        carved = true;
        stack.push({ x: nx, y: ny });
        break;
      }
      if(!carved){
        stack.pop();
      }
    }
    sprinkleFloor(ctx, opts.sparklePalette || opts.palette, opts.sparkle || 0.1);
  }

  const generatorData = [
    {
      id: 'glimmering-meadow',
      name: 'きらめく妖精の草原',
      description: '妖精たちが輪を描く淡い草原。煌めく花園がなめらかに繋がる',
      wallGradient: ['#18253b', '#305c6b'],
      build(ctx){
        gardenLayout(ctx, {
          palette: palettes.glimmer,
          nodeCount: 7,
          radiusMin: 3,
          radiusMax: 6,
          sparkle: 0.18
        });
      },
      tags: ['fairytale','garden','organic']
    },
    {
      id: 'moonlit-pumpkin-festival',
      name: '月灯りパンプキン祭',
      description: '宵闇を照らすかぼちゃ灯籠の広場が小径で結ばれるお祭り会場',
      wallGradient: ['#1a142d', '#35265a'],
      build(ctx){
        gardenLayout(ctx, {
          palette: palettes.moonPumpkin,
          nodeCount: 6,
          radiusMin: 4,
          radiusMax: 7,
          pathWidth: 2,
          sparkle: 0.16
        });
        scatterStars(ctx, palettes.moonPumpkin, 4);
      },
      tags: ['festival','lantern','garden']
    },
    {
      id: 'candy-ribbon-caverns',
      name: 'キャンディリボン洞',
      description: '淡い飴色の洞窟がリボン状の通路で巡る甘い世界',
      wallGradient: ['#301824', '#502b47'],
      build(ctx){
        riverLayout(ctx, {
          palette: palettes.candy,
          channels: 4,
          width: 2,
          sparkle: 0.22
        });
      },
      tags: ['cave','sweet','river']
    },
    {
      id: 'crystalline-rose-palace',
      name: '水晶薔薇の宮殿',
      description: '薔薇の結晶が重なる宮殿回廊と庭園が幾層に輝く',
      wallGradient: ['#281021', '#653757'],
      build(ctx){
        patchworkLayout(ctx, {
          palette: palettes.rose,
          paletteVariants: [palettes.rose, ['#ffd5ec', '#ffe5f6', '#ffeef9']],
          connectors: 8,
          pathWidth: 2,
          sparkle: 0.12
        });
      },
      tags: ['palace','garden','luxury']
    },
    {
      id: 'enchanted-library-maze',
      name: '魔法書架の迷宮',
      description: '本棚の回廊が幾何学的に並ぶ魔法図書館の迷宮',
      wallGradient: ['#1a1e35', '#3c3c6e'],
      build(ctx){
        mazeLayout(ctx, {
          palette: palettes.library,
          width: 1,
          sparkle: 0.08
        });
      },
      tags: ['maze','library','arcane']
    },
    {
      id: 'whispering-willow-lanes',
      name: '囁き柳の小径',
      description: '柳が揺れる風の道と池が点在する静かな散歩道',
      wallGradient: ['#102926', '#285a52'],
      build(ctx){
        riverLayout(ctx, {
          palette: palettes.willow,
          channels: 3,
          width: 1,
          glades: { count: 5, radius: 3 },
          sparkle: 0.14
        });
      },
      tags: ['forest','river','serene']
    },
    {
      id: 'snowflake-carousel',
      name: '雪華の回転木馬',
      description: '雪の結晶が回転木馬のように連なる円環状の広場',
      wallGradient: ['#102540', '#2c5d82'],
      build(ctx){
        spiralLayout(ctx, {
          palette: palettes.snow,
          width: 1,
          turnStep: 2,
          rotate: Math.PI / 3,
          sparkle: 0.2
        });
      },
      tags: ['spiral','snow','festival']
    },
    {
      id: 'toybox-clocktower',
      name: 'おもちゃ時計塔',
      description: '玩具の歯車が並ぶ時計塔内部の段階的な回廊',
      wallGradient: ['#2b1e2b', '#543d5a'],
      build(ctx){
        patchworkLayout(ctx, {
          palette: palettes.toybox,
          cellWidth: 7,
          cellHeight: 7,
          connectors: 7,
          pathWidth: 1,
          sparkle: 0.1
        });
      },
      tags: ['mechanical','toy','tower']
    },
    {
      id: 'rainbow-fairy-circle',
      name: '虹精の舞踏輪',
      description: '妖精が舞う虹色の輪が幾重にも重なる祝祭の空間',
      wallGradient: ['#1c1d39', '#3f3d6b'],
      build(ctx){
        spiralLayout(ctx, {
          palette: palettes.rainbow,
          width: 2,
          turnStep: 3,
          rotate: Math.PI / 2.5,
          sparkle: 0.25
        });
      },
      tags: ['festival','spiral','fairy']
    },
    {
      id: 'starlit-carriageway',
      name: '星灯りの御者道',
      description: '星明かりに照らされた馬車道が滑らかに交差する夜の街路',
      wallGradient: ['#0f172c', '#1f3a5f'],
      build(ctx){
        gardenLayout(ctx, {
          palette: palettes.carriage,
          nodeCount: 5,
          radiusMin: 4,
          radiusMax: 7,
          pathWidth: 2,
          sparkle: 0.15
        });
        scatterStars(ctx, palettes.carriage, 5);
      },
      tags: ['road','night','royal']
    },
    {
      id: 'bubble-tea-grotto',
      name: 'タピオカ泡の洞',
      description: '泡がはじけるような丸い空洞が連なる甘い洞窟',
      wallGradient: ['#1a2334', '#3a4f62'],
      build(ctx){
        gardenLayout(ctx, {
          palette: palettes.bubble,
          nodeCount: 8,
          radiusMin: 3,
          radiusMax: 5,
          pathWidth: 1,
          sparkle: 0.2
        });
      },
      tags: ['cave','sweet','bubbles']
    },
    {
      id: 'marshmallow-bastion',
      name: 'マシュマロ砦',
      description: 'ふわふわの砦が層を成す柔らかな防壁ダンジョン',
      wallGradient: ['#332024', '#68464b'],
      build(ctx){
        patchworkLayout(ctx, {
          palette: palettes.marshmallow,
          cellWidth: 6,
          cellHeight: 6,
          connectors: 9,
          pathWidth: 2,
          sparkle: 0.18
        });
      },
      tags: ['fortress','sweet','structured']
    },
    {
      id: 'dreamcatcher-gallery',
      name: '夢捕りの回廊',
      description: '夢捕りが吊るされた回廊が円と線で繋がる幻想美術館',
      wallGradient: ['#1a1d3d', '#423c72'],
      build(ctx){
        gardenLayout(ctx, {
          palette: palettes.dreamcatcher,
          nodeCount: 6,
          radiusMin: 3,
          radiusMax: 6,
          pathWidth: 1,
          pathJitter: 2,
          sparkle: 0.2
        });
        scatterStars(ctx, palettes.dreamcatcher, 3);
      },
      tags: ['gallery','dream','circle']
    },
    {
      id: 'pastel-moss-garden',
      name: 'パステル苔の庭',
      description: '柔らかな苔が広がるテラス状の庭園が段々畑のように続く',
      wallGradient: ['#14221a', '#335b36'],
      build(ctx){
        patchworkLayout(ctx, {
          palette: palettes.moss,
          cellWidth: 8,
          cellHeight: 5,
          connectors: 5,
          pathWidth: 1,
          sparkle: 0.17
        });
      },
      tags: ['garden','terrace','nature']
    },
    {
      id: 'cloudlace-boulevard',
      name: '雲綾の大通り',
      description: 'レース状の雲が漂う大通りとサロンが続く空中街路',
      wallGradient: ['#12213c', '#2f4d77'],
      build(ctx){
        riverLayout(ctx, {
          palette: palettes.cloudlace,
          channels: 4,
          width: 1,
          sparkle: 0.19
        });
      },
      tags: ['sky','road','ethereal']
    },
    {
      id: 'peppermint-spiral-grove',
      name: 'ペパーミント螺旋林',
      description: '爽やかな螺旋状の林が交差する清涼な小径',
      wallGradient: ['#134234', '#2c7a5a'],
      build(ctx){
        spiralLayout(ctx, {
          palette: palettes.peppermint,
          width: 1,
          turnStep: 2,
          rotate: Math.PI / 2.2,
          sparkle: 0.23
        });
      },
      tags: ['forest','spiral','fresh']
    },
    {
      id: 'lantern-river-mosaic',
      name: '灯籠川のモザイク',
      description: '灯籠が浮かぶ川面がモザイク状に広がる水上迷宮',
      wallGradient: ['#1b1d35', '#3e456d'],
      build(ctx){
        riverLayout(ctx, {
          palette: palettes.lantern,
          channels: 5,
          width: 1,
          glades: { count: 4, radius: 2, palette: palettes.lantern },
          sparkle: 0.21
        });
      },
      tags: ['river','lantern','mosaic']
    },
    {
      id: 'gingerbread-fortress',
      name: 'ジンジャーブレッド要塞',
      description: '焼き菓子の塔と橋が積み木のように組み合わさる要塞都市',
      wallGradient: ['#331f12', '#6b4631'],
      build(ctx){
        patchworkLayout(ctx, {
          palette: palettes.gingerbread,
          cellWidth: 7,
          cellHeight: 7,
          connectors: 8,
          pathWidth: 2,
          sparkle: 0.13
        });
      },
      tags: ['fortress','sweet','city']
    },
    {
      id: 'lullaby-lilypad-lagoon',
      name: '子守唄の睡蓮潟',
      description: '睡蓮の浮かぶ潟と柔らかな水路が織りなす静寂の水庭',
      wallGradient: ['#14253a', '#27566c'],
      build(ctx){
        riverLayout(ctx, {
          palette: palettes.lullaby,
          channels: 3,
          width: 2,
          glades: { count: 6, radius: 3 },
          sparkle: 0.18
        });
      },
      tags: ['water','garden','serene']
    },
    {
      id: 'aurora-petal-cathedral',
      name: '暁光花弁の大聖堂',
      description: 'オーロラの花弁が天蓋に舞う光彩の大聖堂迷宮',
      wallGradient: ['#101730', '#28426d'],
      build(ctx){
        mazeLayout(ctx, {
          palette: palettes.aurora,
          width: 2,
          sparkle: 0.15
        });
      },
      tags: ['cathedral','maze','light']
    }
  ];

  function createGenerators(){
    return generatorData.map((def, index) => {
      return {
        id: def.id,
        name: def.name,
        nameKey: `dungeon.types.${sanitizeKey(def.id)}.name`,
        description: def.description,
        descriptionKey: `dungeon.types.${sanitizeKey(def.id)}.description`,
        algorithm(ctx){
          if(def.wallGradient){
            fillGradientWalls(ctx, def.wallGradient[0], def.wallGradient[1]);
          } else {
            fillFlatWalls(ctx, '#1b1b30');
          }
          def.build(ctx);
          ctx.ensureConnectivity();
        },
        mixin: {
          normalMixed: 0.7,
          blockDimMixed: 0.72,
          tags: def.tags || ['fairytale']
        }
      };
    });
  }

  function createBlocks(){
    const blocks1 = [];
    const blocks2 = [];
    const blocks3 = [];
    generatorData.forEach((def, index) => {
      const keyBase = sanitizeKey(def.id);
      const levelBase = index * 2;
      blocks1.push({
        key: `${keyBase}_pathway`,
        name: `${def.name}・遊歩`,
        nameKey: `dungeon.types.${keyBase}.blocks.${keyBase}_pathway.name`,
        level: levelBase,
        size: (index % 5) - 2,
        depth: 1 + (index % 3),
        chest: index % 2 === 0 ? 'normal' : 'more',
        type: def.id,
        bossFloors: [5, 10, 15].filter(v => v <= 15)
      });
      blocks2.push({
        key: `${keyBase}_heart`,
        name: `${def.name}・中枢`,
        nameKey: `dungeon.types.${keyBase}.blocks.${keyBase}_heart.name`,
        level: levelBase + 3,
        size: (index % 4) - 1,
        depth: 2 + (index % 4),
        chest: index % 3 === 0 ? 'more' : 'normal',
        type: def.id
      });
      blocks3.push({
        key: `${keyBase}_relic`,
        name: `${def.name}・秘宝`,
        nameKey: `dungeon.types.${keyBase}.blocks.${keyBase}_relic.name`,
        level: levelBase + 6,
        size: (index % 3),
        depth: 3 + (index % 5),
        chest: index % 4 === 0 ? 'less' : 'more',
        type: def.id,
        bossFloors: [10, 15, 20, 25].filter(v => v <= 25)
      });
    });

    const dimensions = [
      {
        key: 'fairytale_realm',
        name: 'メルヘン界層',
        nameKey: 'dungeon.dimensions.fairytale_realm.name',
        baseLevel: 24
      },
      {
        key: 'starlight_carnival',
        name: '星光カーニバル界',
        nameKey: 'dungeon.dimensions.starlight_carnival.name',
        baseLevel: 32
      }
    ];

    return { blocks1, blocks2, blocks3, dimensions };
  }

  const addon = {
    id: ADDON_ID,
    name: ADDON_NAME,
    nameKey: 'dungeon.packs.fairytale_wonderlands_pack.name',
    version: VERSION,
    api: '1.0.0',
    description: [
      'メルヘンな童話世界をモチーフに、花園や灯籠川、螺旋林、星灯りの街路など20種類の幻想的なダンジョン生成タイプと',
      '専用ブロック・次元を収録した大型追加パック。柔らかな色彩と祝祭感で既存の冒険に夢の彩りを添えます。'
    ].join(''),
    descriptionKey: 'dungeon.packs.fairytale_wonderlands_pack.description',
    generators: createGenerators(),
    blocks: createBlocks()
  };

  window.registerDungeonAddon(addon);
})();

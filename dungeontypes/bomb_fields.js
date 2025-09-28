// Addon: Bomb Hazard Pack - adds minefields and other explosive-heavy layouts
(function(){
  function fillSolid(ctx){
    const { width: W, height: H, set } = ctx;
    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        set(x, y, 1);
      }
    }
  }

  function carveRect(ctx, x0, y0, x1, y1, value){
    const { set, inBounds } = ctx;
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        if (inBounds(x, y)) set(x, y, value ? 1 : 0);
      }
    }
  }

  function placeBombCluster(ctx, cx, cy, radius, density){
    const { set, setFloorType, setFloorColor, inBounds, random } = ctx;
    for (let y = cy - radius; y <= cy + radius; y++) {
      for (let x = cx - radius; x <= cx + radius; x++) {
        if (!inBounds(x, y)) continue;
        const dx = x - cx;
        const dy = y - cy;
        const dist2 = dx * dx + dy * dy;
        if (dist2 > radius * radius) continue;
        if (random() < density) {
          set(x, y, 0);
          setFloorType(x, y, 'bomb');
          setFloorColor(x, y, '#ffccd5');
        }
      }
    }
  }

  function carveMinefield(ctx){
    const { width: W, height: H, set, random, setFloorType, setFloorColor, ensureConnectivity } = ctx;
    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        set(x, y, random() < 0.78 ? 0 : 1);
      }
    }

    // Create trenches as safe lanes
    for (let y = 3; y < H - 3; y += 5) {
      carveRect(ctx, 2, y, W - 3, y + 1, 0);
    }
    for (let x = 4; x < W - 4; x += 6) {
      carveRect(ctx, x, 2, x + 1, H - 3, 0);
    }

    // Seed bomb pockets
    const clusters = Math.max(4, Math.floor((W * H) / 120));
    for (let i = 0; i < clusters; i++) {
      const cx = 2 + Math.floor(random() * (W - 4));
      const cy = 2 + Math.floor(random() * (H - 4));
      const radius = 1 + Math.floor(random() * 3);
      placeBombCluster(ctx, cx, cy, radius, 0.75);
    }

    // Pepper stray bombs away from corridors
    for (let y = 2; y < H - 2; y++) {
      for (let x = 2; x < W - 2; x++) {
        if (Math.abs((y % 5) - 2) <= 1 || Math.abs((x % 6) - 3) <= 1) continue; // keep main lanes clean
        if (random() < 0.08) {
          set(x, y, 0);
          setFloorType(x, y, 'bomb');
          setFloorColor(x, y, '#ffe3e3');
        }
      }
    }

    ensureConnectivity();
  }

  function carveShrapnelRooms(ctx){
    const { width: W, height: H, set, random, setFloorType, setFloorColor, ensureConnectivity } = ctx;
    fillSolid(ctx);

    const roomCount = Math.max(4, Math.floor((W * H) / 220));
    const rooms = [];
    for (let i = 0; i < roomCount; i++) {
      const rw = 5 + Math.floor(random() * 6);
      const rh = 4 + Math.floor(random() * 5);
      const rx = 2 + Math.floor(random() * Math.max(1, W - rw - 3));
      const ry = 2 + Math.floor(random() * Math.max(1, H - rh - 3));
      rooms.push({ x: rx, y: ry, w: rw, h: rh });
      carveRect(ctx, rx, ry, rx + rw, ry + rh, 0);
    }

    // Connect rooms with straight corridors
    rooms.sort((a, b) => a.x - b.x);
    for (let i = 1; i < rooms.length; i++) {
      const prev = rooms[i - 1];
      const curr = rooms[i];
      const cx1 = prev.x + Math.floor(prev.w / 2);
      const cy1 = prev.y + Math.floor(prev.h / 2);
      const cx2 = curr.x + Math.floor(curr.w / 2);
      const cy2 = curr.y + Math.floor(curr.h / 2);
      for (let x = Math.min(cx1, cx2); x <= Math.max(cx1, cx2); x++) set(x, cy1, 0);
      for (let y = Math.min(cy1, cy2); y <= Math.max(cy1, cy2); y++) set(cx2, y, 0);
    }

    // Place bombs near doorways and inside choke points
    for (const room of rooms) {
      const doorCount = 2 + Math.floor(random() * 4);
      for (let d = 0; d < doorCount; d++) {
        const edge = random();
        let dx = room.x + 1 + Math.floor(random() * Math.max(1, room.w - 1));
        let dy = room.y + 1 + Math.floor(random() * Math.max(1, room.h - 1));
        if (edge < 0.25) dx = room.x;
        else if (edge < 0.5) dx = room.x + room.w;
        else if (edge < 0.75) dy = room.y;
        else dy = room.y + room.h;
        set(dx, dy, 0);
        setFloorType(dx, dy, 'bomb');
        setFloorColor(dx, dy, '#ffc9c9');
        if (random() < 0.5) {
          set(dx + (random() < 0.5 ? 1 : -1), dy, 0);
        }
        if (random() < 0.5) {
          set(dx, dy + (random() < 0.5 ? 1 : -1), 0);
        }
      }

      // Cluster bombs near treasure alcoves
      if (random() < 0.6) {
        const cx = room.x + Math.floor(room.w / 2);
        const cy = room.y + Math.floor(room.h / 2);
        placeBombCluster(ctx, cx, cy, 2, 0.6);
      }
    }

    ensureConnectivity();
  }

  function carveFuseMaze(ctx){
    const { width: W, height: H, set, random, setFloorType, setFloorColor, ensureConnectivity } = ctx;
    fillSolid(ctx);

    // Build a grid maze with depth-first backtracking
    const cellsW = Math.floor((W - 3) / 2);
    const cellsH = Math.floor((H - 3) / 2);
    const visited = Array.from({ length: cellsH }, () => Array(cellsW).fill(false));
    const stack = [];
    const startCell = { x: Math.floor(random() * cellsW), y: Math.floor(random() * cellsH) };
    stack.push(startCell);
    visited[startCell.y][startCell.x] = true;

    const DIRS = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 }
    ];

    function carveCell(cx, cy){
      const wx = 2 + cx * 2;
      const wy = 2 + cy * 2;
      set(wx, wy, 0);
    }

    carveCell(startCell.x, startCell.y);

    while (stack.length) {
      const current = stack[stack.length - 1];
      const neighbors = [];
      for (const dir of DIRS) {
        const nx = current.x + dir.dx;
        const ny = current.y + dir.dy;
        if (nx < 0 || ny < 0 || nx >= cellsW || ny >= cellsH) continue;
        if (!visited[ny][nx]) neighbors.push({ nx, ny, dir });
      }
      if (!neighbors.length) {
        stack.pop();
        continue;
      }
      const pick = neighbors[Math.floor(random() * neighbors.length)];
      const midX = 2 + current.x * 2 + pick.dir.dx;
      const midY = 2 + current.y * 2 + pick.dir.dy;
      set(midX, midY, 0);
      carveCell(pick.nx, pick.ny);
      visited[pick.ny][pick.nx] = true;
      stack.push({ x: pick.nx, y: pick.ny });
    }

    // Decorate intersections with bombs to create timing puzzles
    for (let y = 3; y < H - 3; y++) {
      for (let x = 3; x < W - 3; x++) {
        if (ctx.map[y][x] !== 0) continue;
        const open = (ctx.map[y][x - 1] === 0) + (ctx.map[y][x + 1] === 0) + (ctx.map[y - 1][x] === 0) + (ctx.map[y + 1][x] === 0);
        if (open >= 3 && random() < 0.65) {
          setFloorType(x, y, 'bomb');
          setFloorColor(x, y, '#ffd8d8');
        } else if (open === 2 && random() < 0.2) {
          setFloorType(x, y, 'bomb');
          setFloorColor(x, y, '#ffe5d9');
        }
      }
    }

    ensureConnectivity();
  }

  const generators = [
    {
      id: 'minefield-expanse',
      name: '地雷原の荒野',
      description: '縦横に走る塹壕と爆弾ポケットが散在する危険な平原',
      algorithm: carveMinefield,
      mixin: { normalMixed: 0.45, blockDimMixed: 0.55, tags: ['open-space', 'bomb'] }
    },
    {
      id: 'shrapnel-barracks',
      name: '破片兵舎',
      description: '部屋と廊下が連なる廃兵舎。扉周りには起爆装置が待ち構える',
      algorithm: carveShrapnelRooms,
      mixin: { normalMixed: 0.35, blockDimMixed: 0.5, tags: ['rooms', 'bomb'] }
    },
    {
      id: 'fuse-labyrinth',
      name: '導火線迷宮',
      description: '導火線のように複雑な迷路。交差点に爆弾が仕掛けられている',
      algorithm: carveFuseMaze,
      mixin: { normalMixed: 0.3, blockDimMixed: 0.45, tags: ['maze', 'bomb'] }
    }
  ];

  function mkBlocks(){
    const blocks1 = [
      { key:'minefield_theme_01', name:'Minefield Theme I', level:+0, size:0, depth:+1, chest:'less', type:'minefield-expanse', bossFloors:[5] },
      { key:'minefield_theme_02', name:'Minefield Theme II', level:+6, size:+1, depth:+1, chest:'normal', type:'minefield-expanse', bossFloors:[10] },
      { key:'minefield_theme_03', name:'Minefield Theme III', level:+12, size:+1, depth:+2, chest:'more', type:'minefield-expanse', bossFloors:[15] }
    ];
    const blocks2 = [
      { key:'barracks_core_01', name:'Barracks Core I', level:+0, size:0, depth:0, chest:'normal', type:'shrapnel-barracks' },
      { key:'barracks_core_02', name:'Barracks Core II', level:+8, size:+1, depth:+1, chest:'more', type:'shrapnel-barracks', bossFloors:[5] },
      { key:'barracks_core_03', name:'Barracks Core III', level:+16, size:+1, depth:+2, chest:'less', type:'shrapnel-barracks', bossFloors:[10] }
    ];
    const blocks3 = [
      { key:'fuse_relic_01', name:'Fuse Relic I', level:+0, size:0, depth:+2, chest:'more', type:'fuse-labyrinth', bossFloors:[5] },
      { key:'fuse_relic_02', name:'Fuse Relic II', level:+10, size:+1, depth:+3, chest:'normal', type:'fuse-labyrinth', bossFloors:[10] },
      { key:'fuse_relic_03', name:'Fuse Relic III', level:+20, size:+1, depth:+4, chest:'less', type:'fuse-labyrinth', bossFloors:[15] }
    ];
    return { blocks1, blocks2, blocks3 };
  }

  window.registerDungeonAddon({
    id: 'bomb_pack',
    name: 'Bomb Hazard Pack',
    version: '1.0.0',
    description: '爆弾ギミックに特化した生成タイプを追加するMOD。地雷原・兵舎・迷宮の3種類を収録。',
    generators,
    blocks: mkBlocks()
  });
})();

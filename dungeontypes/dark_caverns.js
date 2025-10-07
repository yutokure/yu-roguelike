// Addon: Shadowed Caverns - tight cave network with dim glow
(function(){
  function algorithm(ctx){
    const { width: W, height: H, random, set, inBounds, ensureConnectivity, setFloorColor, setWallColor } = ctx;

    // Start filled with walls
    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) set(x, y, 1);
    }

    // Carve using randomized cellular automata seed
    const carveChance = 0.43;
    const grid = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => {
      if (x === 0 || y === 0 || x === W - 1 || y === H - 1) return 1;
      return random() < carveChance ? 0 : 1;
    }));

    const dirs = [[1,0],[-1,0],[0,1],[0,-1],[-1,-1],[-1,1],[1,-1],[1,1]];
    const iterate = () => {
      const next = grid.map(row => row.slice());
      for (let y = 1; y < H - 1; y++) {
        for (let x = 1; x < W - 1; x++) {
          let walls = 0;
          for (const [dx, dy] of dirs) walls += grid[y + dy][x + dx];
          if (walls >= 5) next[y][x] = 1; else if (walls <= 2) next[y][x] = 0;
        }
      }
      for (let y = 1; y < H - 1; y++) {
        for (let x = 1; x < W - 1; x++) grid[y][x] = next[y][x];
      }
    };
    iterate();
    iterate();

    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        set(x, y, grid[y][x]);
        if (grid[y][x] === 0 && random() < 0.08) setFloorColor(x, y, '#374151');
        if (grid[y][x] === 1 && random() < 0.04) setWallColor(x, y, '#1f2937');
      }
    }

    // Place glowing mushrooms as landmarks
    const glowCount = Math.max(3, Math.floor((W * H) / 120));
    for (let i = 0; i < glowCount; i++) {
      const gx = 2 + Math.floor(random() * (W - 4));
      const gy = 2 + Math.floor(random() * (H - 4));
      if (!inBounds(gx, gy) || grid[gy][gx] === 1) continue;
      setFloorColor(gx, gy, '#60a5fa');
      for (const [dx, dy] of dirs) {
        const nx = gx + dx, ny = gy + dy;
        if (inBounds(nx, ny) && grid[ny][nx] === 0) setFloorColor(nx, ny, '#3b82f6');
      }
    }

    ensureConnectivity();
  }

  const gen = {
    id: 'shadowed-caverns',
    name: '暗い洞窟',
    nameKey: "dungeon.types.shadowed_caverns.name",
    description: '視界の効かない湿った洞窟網',
    descriptionKey: "dungeon.types.shadowed_caverns.description",
    dark: true,
    algorithm,
    mixin: { normalMixed: 0.45, blockDimMixed: 0.55, tags: ['cave','dark'] }
  };

  function mkBoss(depth) {
    const r = [];
    if (depth >= 5) r.push(5);
    if (depth >= 10) r.push(10);
    if (depth >= 15) r.push(15);
    return r;
  }

  const blocks = {
    blocks1: [
      {
        key:'shadow_cave_theme_01',
        name:'Shadow Caverns I',
        nameKey: "dungeon.types.shadowed_caverns.blocks.shadow_cave_theme_01.name",
        level:+0,
        size:0,
        depth:+1,
        chest:'normal',
        type:'shadowed-caverns',
        bossFloors:mkBoss(8)
      },
      {
        key:'shadow_cave_theme_02',
        name:'Shadow Caverns II',
        nameKey: "dungeon.types.shadowed_caverns.blocks.shadow_cave_theme_02.name",
        level:+8,
        size:+1,
        depth:+1,
        chest:'less',
        type:'shadowed-caverns',
        bossFloors:mkBoss(10)
      },
      {
        key:'shadow_cave_theme_03',
        name:'Shadow Caverns III',
        nameKey: "dungeon.types.shadowed_caverns.blocks.shadow_cave_theme_03.name",
        level:+16,
        size:+1,
        depth:+2,
        chest:'more',
        type:'shadowed-caverns',
        bossFloors:mkBoss(12)
      }
    ],
    blocks2: [
      {
        key:'shadow_cave_core_01',
        name:'Gloom Core I',
        nameKey: "dungeon.types.shadowed_caverns.blocks.shadow_cave_core_01.name",
        level:+0,
        size:+1,
        depth:0,
        chest:'normal',
        type:'shadowed-caverns'
      },
      {
        key:'shadow_cave_core_02',
        name:'Gloom Core II',
        nameKey: "dungeon.types.shadowed_caverns.blocks.shadow_cave_core_02.name",
        level:+10,
        size:+1,
        depth:+1,
        chest:'more',
        type:'shadowed-caverns'
      }
    ],
    blocks3: [
      {
        key:'shadow_cave_relic_01',
        name:'Luminous Relic',
        nameKey: "dungeon.types.shadowed_caverns.blocks.shadow_cave_relic_01.name",
        level:+0,
        size:0,
        depth:+2,
        chest:'more',
        type:'shadowed-caverns',
        bossFloors:[5,10]
      }
    ]
  };

  window.registerDungeonAddon({
    id:'shadowed_caverns_pack',
    name:'Shadowed Caverns Pack',
    nameKey: "dungeon.packs.shadowed_caverns_pack.name",
    version:'1.0.0',
    blocks,
    generators:[gen]
  });
})();

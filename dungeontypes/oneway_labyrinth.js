// Addon: One-Way Labyrinth - arrowed corridors that force navigation loops
(function(){
  function carveArrowMaze(ctx){
    const {
      width: W,
      height: H,
      set,
      setFloorType,
      setFloorColor,
      ensureConnectivity
    } = ctx;

    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        set(x, y, 0);
        setFloorColor(x, y, '#dfe4ff');
      }
    }

    const midX = Math.floor(W / 2);
    const midY = Math.floor(H / 2);
    for (let x = 1; x < W - 1; x++) {
      setFloorType(x, midY, 'normal');
      setFloorColor(x, midY, '#ccd5ff');
    }
    for (let y = 1; y < H - 1; y++) {
      setFloorType(midX, y, 'normal');
      setFloorColor(midX, y, '#ccd5ff');
    }

    const maxRings = Math.max(1, Math.floor(Math.min(W, H) / 6));
    for (let ring = 0; ring < maxRings; ring++) {
      const offset = 1 + ring * 2;
      const minX = offset;
      const maxX = W - 1 - offset;
      const minY = offset;
      const maxY = H - 1 - offset;
      if (minX >= maxX || minY >= maxY) break;
      const clockwise = ring % 2 === 0;

      const connectors = [
        { x: midX, y: minY },
        { x: maxX, y: midY },
        { x: midX, y: maxY },
        { x: minX, y: midY }
      ];

      for (let x = minX; x < maxX; x++) {
        if (x === midX) continue;
        const dir = clockwise ? 'right' : 'left';
        setFloorType(x, minY, { type: 'one-way', direction: dir });
        setFloorColor(x, minY, '#b197fc');
      }
      for (let y = minY; y < maxY; y++) {
        if (y === midY) continue;
        const dir = clockwise ? 'down' : 'up';
        setFloorType(maxX, y, { type: 'one-way', direction: dir });
        setFloorColor(maxX, y, '#b197fc');
      }
      for (let x = maxX; x > minX; x--) {
        if (x === midX) continue;
        const dir = clockwise ? 'left' : 'right';
        setFloorType(x, maxY, { type: 'one-way', direction: dir });
        setFloorColor(x, maxY, '#b197fc');
      }
      for (let y = maxY; y > minY; y--) {
        if (y === midY) continue;
        const dir = clockwise ? 'up' : 'down';
        setFloorType(minX, y, { type: 'one-way', direction: dir });
        setFloorColor(minX, y, '#b197fc');
      }

      connectors.forEach(({ x, y }) => {
        if (x <= minX || x >= maxX || y <= minY || y >= maxY) return;
        setFloorType(x, y, 'normal');
        setFloorColor(x, y, '#e5dbff');
      });
    }

    for (let y = 2; y < H - 2; y += 4) {
      for (let x = 2; x < W - 2; x += 4) {
        if (x === midX || y === midY) continue;
        setFloorType(x, y, { type: 'one-way', direction: (x + y) % 8 === 0 ? 'up' : 'down' });
        setFloorColor(x, y, '#c0aaff');
      }
    }

    ensureConnectivity();
  }

  const generator = {
    id: 'oneway-labyrinth',
    name: '矢印迷宮',
    nameKey: "dungeon.types.oneway_labyrinth.name",
    description: '一方通行の回廊が重なり合う複雑な迷宮',
    descriptionKey: "dungeon.types.oneway_labyrinth.description",
    recommendedLevel: 52,
    algorithm: carveArrowMaze,
    mixin: { normalMixed: 0.25, blockDimMixed: 0.5, tags: ['labyrinth', 'hazard'] }
  };

  const blocks = {
    blocks1: [
      {
        key: 'oneway_labyrinth_a',
        name: '矢印回廊',
        nameKey: "dungeon.types.oneway_labyrinth.blocks.oneway_labyrinth_a.name",
        level: +12,
        size: 0,
        depth: +1,
        chest: 'normal',
        type: 'oneway-labyrinth'
      },
      {
        key: 'oneway_labyrinth_b',
        name: '交差広間',
        nameKey: "dungeon.types.oneway_labyrinth.blocks.oneway_labyrinth_b.name",
        level: +20,
        size: +1,
        depth: +2,
        chest: 'more',
        type: 'oneway-labyrinth'
      },
      {
        key: 'oneway_labyrinth_c',
        name: '渦巻きの縁',
        nameKey: "dungeon.types.oneway_labyrinth.blocks.oneway_labyrinth_c.name",
        level: +24,
        size: +1,
        depth: +2,
        chest: 'normal',
        type: 'oneway-labyrinth'
      },
      {
        key: 'oneway_labyrinth_d',
        name: '順行の要塞',
        nameKey: "dungeon.types.oneway_labyrinth.blocks.oneway_labyrinth_d.name",
        level: +28,
        size: +2,
        depth: +3,
        chest: 'rich',
        type: 'oneway-labyrinth'
      }
    ],
    blocks2: [
      {
        key: 'oneway_labyrinth_core',
        name: '迷いの核',
        nameKey: "dungeon.types.oneway_labyrinth.blocks.oneway_labyrinth_core.name",
        level: +28,
        size: +1,
        depth: +2,
        chest: 'rich',
        type: 'oneway-labyrinth'
      },
      {
        key: 'oneway_labyrinth_cross',
        name: '矢路の交点',
        nameKey: "dungeon.types.oneway_labyrinth.blocks.oneway_labyrinth_cross.name",
        level: +32,
        size: +1,
        depth: +2,
        chest: 'rich',
        type: 'oneway-labyrinth'
      },
      {
        key: 'oneway_labyrinth_loop',
        name: '無限輪路',
        nameKey: "dungeon.types.oneway_labyrinth.blocks.oneway_labyrinth_loop.name",
        level: +34,
        size: +2,
        depth: +3,
        chest: 'rare',
        type: 'oneway-labyrinth'
      },
      {
        key: 'oneway_labyrinth_gate',
        name: '逆行の門',
        nameKey: "dungeon.types.oneway_labyrinth.blocks.oneway_labyrinth_gate.name",
        level: +36,
        size: +2,
        depth: +3,
        chest: 'rare',
        type: 'oneway-labyrinth'
      }
    ],
    blocks3: [
      {
        key: 'oneway_labyrinth_boss',
        name: '終端円環',
        nameKey: "dungeon.types.oneway_labyrinth.blocks.oneway_labyrinth_boss.name",
        level: +36,
        size: +2,
        depth: +3,
        chest: 'rich',
        type: 'oneway-labyrinth',
        bossFloors: [8, 16]
      },
      {
        key: 'oneway_labyrinth_relic',
        name: '矢導の聖所',
        nameKey: "dungeon.types.oneway_labyrinth.blocks.oneway_labyrinth_relic.name",
        level: +40,
        size: +2,
        depth: +3,
        chest: 'rich',
        type: 'oneway-labyrinth',
        bossFloors: [10, 18]
      },
      {
        key: 'oneway_labyrinth_sanctum',
        name: '方向の祭室',
        nameKey: "dungeon.types.oneway_labyrinth.blocks.oneway_labyrinth_sanctum.name",
        level: +44,
        size: +3,
        depth: +4,
        chest: 'rare',
        type: 'oneway-labyrinth',
        bossFloors: [12, 20]
      },
      {
        key: 'oneway_labyrinth_maestro',
        name: '迷宮指揮塔',
        nameKey: "dungeon.types.oneway_labyrinth.blocks.oneway_labyrinth_maestro.name",
        level: +48,
        size: +3,
        depth: +4,
        chest: 'legendary',
        type: 'oneway-labyrinth',
        bossFloors: [24]
      }
    ]
  };

  window.registerDungeonAddon({
    id: 'oneway_labyrinth_pack',
    name: 'One-Way Labyrinth Pack',
    nameKey: "dungeon.packs.oneway_labyrinth_pack.name",
    version: '1.0.0',
    generators: [generator],
    blocks
  });
})();

// Addon: Retro Overworld Pack - generates JRPG style field maps with multiple biomes
(function(){
  const WATER_COLOR_DEEP = '#2c5a9b';
  const WATER_COLOR_SHALLOW = '#3d7dc3';
  const ROAD_COLOR = '#caa36e';
  const BRIDGE_COLOR = '#d7cba1';
  const TOWN_COLOR = '#f4d6a0';
  const TOWN_RING_COLOR = '#d8b078';
  const BIOMES = {
    grass:  { floorColor:'#8ecf58', floorType:'grass' },
    forest: { floorColor:'#3a8b3a', floorType:'forest' },
    desert: { floorColor:'#e2c26a', floorType:'sand' },
    wasteland: { floorColor:'#b08b6d', floorType:'wasteland' },
    snow:   { floorColor:'#f2f4f8', floorType:'snow' },
    demon:  { floorColor:'#8c2f63', floorType:'cursed' },
    highland: { floorColor:'#c1aa7d', floorType:'stone' }
  };

  function clamp(v, min, max){
    return v < min ? min : (v > max ? max : v);
  }

  function hashNoise(x, y, seed){
    const s = Math.sin((x * 127.1 + y * 311.7 + seed * 74.7) * 12.9898) * 43758.5453;
    return s - Math.floor(s);
  }

  function valueNoise(x, y, seed){
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const v00 = hashNoise(xi, yi, seed);
    const v10 = hashNoise(xi + 1, yi, seed);
    const v01 = hashNoise(xi, yi + 1, seed);
    const v11 = hashNoise(xi + 1, yi + 1, seed);
    const i1 = v00 + (v10 - v00) * xf;
    const i2 = v01 + (v11 - v01) * xf;
    return i1 + (i2 - i1) * yf;
  }

  function layeredNoise(x, y, seed){
    let total = 0;
    total += valueNoise(x * 0.18, y * 0.18, seed);
    total += 0.5 * valueNoise(x * 0.36 + 200, y * 0.36 + 200, seed + 1);
    total += 0.25 * valueNoise(x * 0.72 + 400, y * 0.72 + 400, seed + 2);
    return total / 1.75;
  }

  function pickDifferent(random, items, existing, radius){
    let attempts = 0;
    while(attempts < 400){
      const candidate = items[Math.floor(random() * items.length)];
      if(!candidate) break;
      let valid = true;
      for(const other of existing){
        const dx = other.x - candidate.x;
        const dy = other.y - candidate.y;
        if(dx * dx + dy * dy < radius * radius){
          valid = false;
          break;
        }
      }
      if(valid) return candidate;
      attempts++;
    }
    return items.length ? items[Math.floor(random() * items.length)] : null;
  }

  function carveTown(ctx, terrain, x, y){
    for(let oy = -1; oy <= 1; oy++){
      for(let ox = -1; ox <= 1; ox++){
        const nx = x + ox;
        const ny = y + oy;
        if(!ctx.inBounds(nx, ny)) continue;
        ctx.set(nx, ny, 0);
        terrain[ny][nx] = 'town';
        if(Math.abs(ox) + Math.abs(oy) === 0){
          ctx.setFloorColor(nx, ny, TOWN_COLOR);
          ctx.setFloorType(nx, ny, 'town');
        } else {
          ctx.setFloorColor(nx, ny, TOWN_RING_COLOR);
          ctx.setFloorType(nx, ny, 'road');
        }
      }
    }
  }

  function carveRoad(ctx, terrain, start, end, random){
    const maxSteps = (ctx.width + ctx.height) * 8;
    let x = start.x;
    let y = start.y;
    let steps = 0;
    const visited = new Set();

    function markTile(tx, ty){
      if(!ctx.inBounds(tx, ty)) return;
      const key = `${tx},${ty}`;
      if(visited.has(key)) return;
      visited.add(key);
      const current = terrain[ty][tx];
      const isBridge = current === 'ocean';
      ctx.set(tx, ty, 0);
      ctx.setFloorColor(tx, ty, isBridge ? BRIDGE_COLOR : ROAD_COLOR);
      ctx.setFloorType(tx, ty, isBridge ? 'bridge' : 'road');
      terrain[ty][tx] = isBridge ? 'bridge' : 'road';
      if(isBridge){
        for(let oy = -1; oy <= 1; oy++){
          for(let ox = -1; ox <= 1; ox++){
            const nx = tx + ox;
            const ny = ty + oy;
            if(!ctx.inBounds(nx, ny)) continue;
            if(terrain[ny][nx] === 'ocean'){
              ctx.setWallColor(nx, ny, WATER_COLOR_SHALLOW);
            }
          }
        }
      }
    }

    while(steps < maxSteps && (x !== end.x || y !== end.y)){
      markTile(x, y);
      const dx = end.x - x;
      const dy = end.y - y;
      const horizontalFirst = random() < (Math.abs(dx) / (Math.abs(dx) + Math.abs(dy) || 1));
      if(horizontalFirst){
        if(dx !== 0){
          x += dx > 0 ? 1 : -1;
        } else if(dy !== 0){
          y += dy > 0 ? 1 : -1;
        }
      } else {
        if(dy !== 0){
          y += dy > 0 ? 1 : -1;
        } else if(dx !== 0){
          x += dx > 0 ? 1 : -1;
        }
      }
      if(random() < 0.18){
        const turn = random() < 0.5 ? 1 : -1;
        if(random() < 0.5){
          x += turn;
        } else {
          y += turn;
        }
      }
      x = clamp(x, 1, ctx.width - 2);
      y = clamp(y, 1, ctx.height - 2);
      steps++;
    }
    markTile(end.x, end.y);
  }

  function algorithm(ctx){
    const W = ctx.width;
    const H = ctx.height;
    const random = ctx.random;
    const terrain = Array.from({ length: H }, () => new Array(W).fill('ocean'));
    const landTiles = [];
    const continentTiles = [];

    for(let y = 0; y < H; y++){
      for(let x = 0; x < W; x++){
        ctx.set(x, y, 1);
        ctx.setWallColor(x, y, WATER_COLOR_DEEP);
      }
    }

    for(let y = 1; y < H - 1; y++){
      for(let x = 1; x < W - 1; x++){
        const nx = (x / W) * 2 - 1;
        const ny = (y / H) * 2 - 1;
        const falloff = Math.pow(Math.hypot(nx, ny), 1.2);
        const elevation = layeredNoise(x, y, 10) - falloff * 0.6 + 0.15;
        if(elevation > 0.05){
          const tempNoise = layeredNoise(x + 500, y + 500, 21);
          const moistNoise = layeredNoise(x + 1000, y + 1000, 32);
          const chaosNoise = layeredNoise(x + 1500, y + 1500, 43);
          const latitude = 1 - y / (H - 1);
          const temperature = tempNoise * 0.5 + latitude * 0.7 + elevation * 0.2;
          const moisture = moistNoise;

          let biome = 'grass';
          if(elevation > 0.55 && chaosNoise > 0.58){
            biome = 'demon';
          } else if(temperature < 0.28){
            biome = 'snow';
          } else if(moisture < 0.28 && temperature > 0.4){
            biome = 'desert';
          } else if(elevation > 0.52){
            biome = 'wasteland';
          } else if(moisture > 0.62){
            biome = 'forest';
          } else if(elevation > 0.46){
            biome = 'highland';
          }

          terrain[y][x] = biome;
          ctx.set(x, y, 0);
          const info = BIOMES[biome] || BIOMES.grass;
          ctx.setFloorColor(x, y, info.floorColor);
          ctx.setFloorType(x, y, info.floorType);
          landTiles.push({ x, y, biome, elevation });
          if(elevation > 0.12){
            continentTiles.push({ x, y, biome, elevation });
          }
        }
      }
    }

    for(let y = 1; y < H - 1; y++){
      for(let x = 1; x < W - 1; x++){
        if(terrain[y][x] === 'ocean'){
          let adjacentLand = 0;
          for(let oy = -1; oy <= 1; oy++){
            for(let ox = -1; ox <= 1; ox++){
              if(ox === 0 && oy === 0) continue;
              const nx = x + ox;
              const ny = y + oy;
              if(terrain[ny][nx] !== 'ocean') adjacentLand++;
            }
          }
          if(adjacentLand > 0){
            ctx.setWallColor(x, y, WATER_COLOR_SHALLOW);
          }
        }
      }
    }

    for(let y = 1; y < H - 1; y++){
      for(let x = 1; x < W - 1; x++){
        if(terrain[y][x] === 'ocean'){
          const leftLand = terrain[y][x - 1] !== 'ocean';
          const rightLand = terrain[y][x + 1] !== 'ocean';
          const upLand = terrain[y - 1][x] !== 'ocean';
          const downLand = terrain[y + 1][x] !== 'ocean';
          if(leftLand && rightLand && random() < 0.08){
            terrain[y][x] = 'bridge';
            ctx.set(x, y, 0);
            ctx.setFloorColor(x, y, BRIDGE_COLOR);
            ctx.setFloorType(x, y, 'bridge');
          } else if(upLand && downLand && random() < 0.08){
            terrain[y][x] = 'bridge';
            ctx.set(x, y, 0);
            ctx.setFloorColor(x, y, BRIDGE_COLOR);
            ctx.setFloorType(x, y, 'bridge');
          }
        }
      }
    }

    const settlementCandidates = continentTiles.filter(t => t.x > 2 && t.y > 2 && t.x < W - 3 && t.y < H - 3);
    const settlements = [];
    const settlementCount = clamp(4 + Math.floor(random() * 3), 3, 6);
    for(let i = 0; i < settlementCount; i++){
      const town = pickDifferent(random, settlementCandidates, settlements, 6);
      if(!town) break;
      settlements.push(town);
      carveTown(ctx, terrain, town.x, town.y);
    }

    if(settlements.length >= 2){
      const sorted = settlements.slice().sort((a, b) => a.x - b.x);
      for(let i = 1; i < sorted.length; i++){
        carveRoad(ctx, terrain, sorted[i - 1], sorted[i], random);
      }
      const randomConnections = Math.max(1, Math.floor(sorted.length / 2));
      for(let i = 0; i < randomConnections; i++){
        const a = settlements[Math.floor(random() * settlements.length)];
        const b = settlements[Math.floor(random() * settlements.length)];
        if(a && b && (a !== b)){
          carveRoad(ctx, terrain, a, b, random);
        }
      }
    }

    ctx.ensureConnectivity();
  }

  const generator = {
    id: 'retro-overworld',
    name: 'レトロ風フィールドマップ',
    nameKey: "dungeon.types.retro_overworld.name",
    description: '大陸や島々、橋や街道が広がる往年のJRPGフィールド風地形',
    descriptionKey: "dungeon.types.retro_overworld.description",
    algorithm,
    mixin: { normalMixed: 0.45, blockDimMixed: 0.5, tags: ['field','overworld','retro','biome'] }
  };

  function bossFloors(depth){
    const result = [];
    if(depth >= 5) result.push(5);
    if(depth >= 10) result.push(10);
    if(depth >= 15) result.push(15);
    return result;
  }

  const blocks = {
    blocks1: [
      {
        key:'retro_overworld_01',
        name:'Retro Overworld I',
        nameKey: "dungeon.types.retro_overworld.blocks.retro_overworld_01.name",
        level:+0,
        size:+0,
        depth:+1,
        chest:'normal',
        type:'retro-overworld',
        bossFloors:bossFloors(6)
      },
      {
        key:'retro_overworld_02',
        name:'Retro Overworld II',
        nameKey: "dungeon.types.retro_overworld.blocks.retro_overworld_02.name",
        level:+6,
        size:+1,
        depth:+1,
        chest:'less',
        type:'retro-overworld',
        bossFloors:bossFloors(8)
      },
      {
        key:'retro_overworld_03',
        name:'Retro Overworld III',
        nameKey: "dungeon.types.retro_overworld.blocks.retro_overworld_03.name",
        level:+12,
        size:+1,
        depth:+2,
        chest:'more',
        type:'retro-overworld',
        bossFloors:bossFloors(10)
      },
      {
        key:'retro_overworld_04',
        name:'Retro Overworld IV',
        nameKey: "dungeon.types.retro_overworld.blocks.retro_overworld_04.name",
        level:+18,
        size:+2,
        depth:+2,
        chest:'normal',
        type:'retro-overworld',
        bossFloors:bossFloors(12)
      },
      {
        key:'retro_overworld_05',
        name:'Retro Overworld V',
        nameKey: "dungeon.types.retro_overworld.blocks.retro_overworld_05.name",
        level:+26,
        size:+2,
        depth:+3,
        chest:'more',
        type:'retro-overworld',
        bossFloors:bossFloors(15)
      }
    ],
    blocks2: [
      {
        key:'retro_overworld_core_01',
        name:'Retro Overworld Core I',
        nameKey: "dungeon.types.retro_overworld.blocks.retro_overworld_core_01.name",
        level:+0,
        size:+1,
        depth:0,
        chest:'normal',
        type:'retro-overworld'
      },
      {
        key:'retro_overworld_core_02',
        name:'Retro Overworld Core II',
        nameKey: "dungeon.types.retro_overworld.blocks.retro_overworld_core_02.name",
        level:+8,
        size:+1,
        depth:+1,
        chest:'more',
        type:'retro-overworld'
      },
      {
        key:'retro_overworld_core_03',
        name:'Retro Overworld Core III',
        nameKey: "dungeon.types.retro_overworld.blocks.retro_overworld_core_03.name",
        level:+16,
        size:+2,
        depth:+1,
        chest:'less',
        type:'retro-overworld'
      },
      {
        key:'retro_overworld_core_04',
        name:'Retro Overworld Core IV',
        nameKey: "dungeon.types.retro_overworld.blocks.retro_overworld_core_04.name",
        level:+22,
        size:+2,
        depth:+2,
        chest:'normal',
        type:'retro-overworld'
      },
      {
        key:'retro_overworld_core_05',
        name:'Retro Overworld Core V',
        nameKey: "dungeon.types.retro_overworld.blocks.retro_overworld_core_05.name",
        level:+30,
        size:+3,
        depth:+2,
        chest:'more',
        type:'retro-overworld'
      }
    ],
    blocks3: [
      {
        key:'retro_overworld_relic_01',
        name:'Retro Overworld Relic I',
        nameKey: "dungeon.types.retro_overworld.blocks.retro_overworld_relic_01.name",
        level:+0,
        size:0,
        depth:+2,
        chest:'more',
        type:'retro-overworld',
        bossFloors:[5]
      },
      {
        key:'retro_overworld_relic_02',
        name:'Retro Overworld Relic II',
        nameKey: "dungeon.types.retro_overworld.blocks.retro_overworld_relic_02.name",
        level:+10,
        size:+1,
        depth:+2,
        chest:'normal',
        type:'retro-overworld',
        bossFloors:[10]
      },
      {
        key:'retro_overworld_relic_03',
        name:'Retro Overworld Relic III',
        nameKey: "dungeon.types.retro_overworld.blocks.retro_overworld_relic_03.name",
        level:+18,
        size:+1,
        depth:+3,
        chest:'less',
        type:'retro-overworld',
        bossFloors:[15]
      },
      {
        key:'retro_overworld_relic_04',
        name:'Retro Overworld Relic IV',
        nameKey: "dungeon.types.retro_overworld.blocks.retro_overworld_relic_04.name",
        level:+26,
        size:+2,
        depth:+3,
        chest:'more',
        type:'retro-overworld',
        bossFloors:[10,15]
      },
      {
        key:'retro_overworld_relic_05',
        name:'Retro Overworld Relic V',
        nameKey: "dungeon.types.retro_overworld.blocks.retro_overworld_relic_05.name",
        level:+32,
        size:+2,
        depth:+4,
        chest:'normal',
        type:'retro-overworld',
        bossFloors:[5,10,15]
      }
    ]
  };

  window.registerDungeonAddon({
    id:'retro_overworld_pack',
    name:'Retro Overworld Pack',
    nameKey: "dungeon.packs.retro_overworld_pack.name",
    version:'1.0.0',
    blocks,
    generators:[generator]
  });
})();

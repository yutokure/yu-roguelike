(function(){
  const ADDON_ID = 'star_wars_galactic_saga_pack';
  const ADDON_NAME = 'Galactic Saga: Star Wars Worlds';
  const VERSION = '1.0.0';

  function getRandom(ctx){
    return typeof ctx.random === 'function' ? ctx.random() : Math.random();
  }

  function randomInt(ctx, min, max){
    if(max <= min) return min;
    return Math.floor(getRandom(ctx) * (max - min + 1)) + min;
  }

  function fillWalls(ctx){
    for(let y = 0; y < ctx.height; y++){
      for(let x = 0; x < ctx.width; x++){
        ctx.set(x, y, 1);
      }
    }
  }

  function carveCircle(ctx, cx, cy, radius){
    const r = Math.max(1, radius);
    const r2 = r * r;
    for(let y = cy - r - 1; y <= cy + r + 1; y++){
      for(let x = cx - r - 1; x <= cx + r + 1; x++){
        if(!ctx.inBounds(x, y)) continue;
        const dx = x - cx;
        const dy = y - cy;
        if(dx * dx + dy * dy <= r2){
          ctx.set(x, y, 0);
        }
      }
    }
  }

  function carveRect(ctx, x0, y0, x1, y1){
    const minX = Math.max(1, Math.min(x0, x1));
    const maxX = Math.min(ctx.width - 2, Math.max(x0, x1));
    const minY = Math.max(1, Math.min(y0, y1));
    const maxY = Math.min(ctx.height - 2, Math.max(y0, y1));
    for(let y = minY; y <= maxY; y++){
      for(let x = minX; x <= maxX; x++){
        ctx.set(x, y, 0);
      }
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
      for(let oy = -half; oy <= half; oy++){
        for(let ox = -half; ox <= half; ox++){
          const tx = x0 + ox;
          const ty = y0 + oy;
          if(ctx.inBounds(tx, ty)) ctx.set(tx, ty, 0);
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

  function scatterCaves(ctx, count, radiusRange){
    const [minR, maxR] = radiusRange;
    for(let i = 0; i < count; i++){
      const rx = randomInt(ctx, 2, ctx.width - 3);
      const ry = randomInt(ctx, 2, ctx.height - 3);
      carveCircle(ctx, rx, ry, randomInt(ctx, minR, maxR));
    }
  }

  function carveRadial(ctx, options){
    const cx = Math.floor(ctx.width / 2);
    const cy = Math.floor(ctx.height / 2);
    const arms = Math.max(2, options.arms || 4);
    const length = options.length || Math.min(ctx.width, ctx.height) / 2;
    const width = options.width || 2;
    const startAngle = options.startAngle || 0;
    for(let i = 0; i < arms; i++){
      const theta = startAngle + (Math.PI * 2 * i) / arms;
      const tx = Math.round(cx + Math.cos(theta) * length);
      const ty = Math.round(cy + Math.sin(theta) * length);
      carveLine(ctx, cx, cy, tx, ty, width);
    }
  }

  function carveGrid(ctx, options){
    const spacingX = Math.max(3, options.spacingX || 6);
    const spacingY = Math.max(3, options.spacingY || 6);
    for(let x = 2; x < ctx.width - 2; x += spacingX){
      carveLine(ctx, x, 1, x, ctx.height - 2, options.width || 1);
    }
    for(let y = 2; y < ctx.height - 2; y += spacingY){
      carveLine(ctx, 1, y, ctx.width - 2, y, options.width || 1);
    }
  }

  function carveSpiral(ctx, turns, thickness){
    const cx = Math.floor(ctx.width / 2);
    const cy = Math.floor(ctx.height / 2);
    const maxRadius = Math.min(ctx.width, ctx.height) / 2 - 2;
    let angle = 0;
    const step = (Math.PI * 2 * turns) / (maxRadius * 2);
    let radius = 2;
    while(radius < maxRadius){
      const x = Math.round(cx + Math.cos(angle) * radius);
      const y = Math.round(cy + Math.sin(angle) * radius);
      carveCircle(ctx, x, y, thickness);
      angle += step;
      radius += 0.5;
    }
  }

  function carveWaves(ctx, bands){
    const amplitude = Math.max(2, bands.amplitude || 3);
    const frequency = Math.max(2, bands.frequency || 4);
    for(let x = 2; x < ctx.width - 2; x++){
      const wave = Math.sin((x / ctx.width) * Math.PI * frequency) * amplitude;
      const mid = Math.floor(ctx.height / 2 + wave);
      carveLine(ctx, x, mid - 1, x, mid + 1, bands.width || 2);
    }
  }

  function carveScatterLines(ctx, count, length, width){
    for(let i = 0; i < count; i++){
      const x0 = randomInt(ctx, 2, ctx.width - 3);
      const y0 = randomInt(ctx, 2, ctx.height - 3);
      const angle = getRandom(ctx) * Math.PI * 2;
      const x1 = Math.round(x0 + Math.cos(angle) * length);
      const y1 = Math.round(y0 + Math.sin(angle) * length);
      carveLine(ctx, x0, y0, x1, y1, width);
    }
  }

  function applyPalette(ctx, palette){
    if(!palette) return;
    const floor = palette.floor;
    const walls = palette.wall;
    const accent = palette.accent;
    const stride = Math.max(2, palette.accentStride || 6);
    const accentChance = typeof palette.accentChance === 'number' ? Math.max(0, Math.min(1, palette.accentChance)) : 0;
    for(let y = 1; y < ctx.height - 1; y++){
      for(let x = 1; x < ctx.width - 1; x++){
        if(ctx.get(x, y) === 0){
          if(accent && (((x + y) % stride === 0) || (accentChance > 0 && getRandom(ctx) < accentChance))){
            ctx.setFloorColor(x, y, accent);
          } else if(floor){
            ctx.setFloorColor(x, y, floor);
          }
        } else if(walls){
          ctx.setWallColor(x, y, walls);
        }
      }
    }
  }

  function sculptTheme(ctx, config){
    fillWalls(ctx);

    if(config.hub){
      carveCircle(ctx, Math.floor(ctx.width / 2), Math.floor(ctx.height / 2), config.hub.radius);
    }

    if(config.radial){
      carveRadial(ctx, config.radial);
    }

    if(config.grid){
      carveGrid(ctx, config.grid);
    }

    if(config.spiral){
      carveSpiral(ctx, config.spiral.turns, config.spiral.thickness);
    }

    if(config.waveBands){
      carveWaves(ctx, config.waveBands);
    }

    if(config.scatterCaves){
      scatterCaves(ctx, config.scatterCaves.count, config.scatterCaves.radiusRange);
    }

    if(config.scatterLines){
      carveScatterLines(ctx, config.scatterLines.count, config.scatterLines.length, config.scatterLines.width);
    }

    if(config.rings){
      const cx = Math.floor(ctx.width / 2);
      const cy = Math.floor(ctx.height / 2);
      for(let r = config.rings.start; r <= config.rings.end; r += config.rings.step){
        carveCircle(ctx, cx, cy, r);
      }
    }

    if(config.corridors){
      config.corridors.forEach(corr => {
        carveLine(ctx, corr[0], corr[1], corr[2], corr[3], corr[4] || 1);
      });
    }

    if(config.carveRectangles){
      config.carveRectangles.forEach(rect => {
        carveRect(ctx, rect[0], rect[1], rect[2], rect[3]);
      });
    }

    if(config.decorate){
      config.decorate(ctx);
    }

    if(config.palette){
      applyPalette(ctx, config.palette);
    }
  }

  function createGenerator(def){
    return {
      id: def.id,
      name: def.name,
      description: def.description,
      mixin: Object.assign({ normalMixed: def.normalWeight ?? 2, blockDimMixed: def.blockWeight ?? 2 }, def.mixin || {}),
      algorithm(ctx){
        sculptTheme(ctx, def.theme);
      }
    };
  }

  const generatorDefs = [
    {
      id: 'tatooine_dune_sea',
      name: 'Tatooine Dune Sea',
      description: 'Rolling dunes hide smugglers caverns and sun-blasted crawl tunnels.',
      normalWeight: 3,
      blockWeight: 2,
      theme: {
        waveBands: { amplitude: 4, frequency: 3, width: 3, accentStride: 5 },
        scatterCaves: { count: 20, radiusRange: [2, 4] },
        scatterLines: { count: 12, length: 8, width: 2 },
        palette: { floor: '#c7a96b', wall: '#8c6f32', accent: '#f6d279', accentStride: 6 }
      }
    },
    {
      id: 'hoth_rebel_outpost',
      name: 'Hoth Rebel Outpost',
      description: 'Frozen tunnels and blaster-scorched hangars beneath the ice plains.',
      normalWeight: 2,
      blockWeight: 2,
      theme: {
        hub: { radius: 5 },
        grid: { spacingX: 6, spacingY: 5, width: 2 },
        scatterLines: { count: 8, length: 10, width: 2 },
        scatterCaves: { count: 14, radiusRange: [2, 3] },
        palette: { floor: '#d9f1ff', wall: '#7a8da0', accent: '#ffffff', accentStride: 7 }
      }
    },
    {
      id: 'dagobah_swamp_hollows',
      name: 'Dagobah Swamp Hollows',
      description: 'Mist-choked sinkholes and root-wrapped grottoes.',
      theme: {
        scatterCaves: { count: 26, radiusRange: [2, 5] },
        scatterLines: { count: 10, length: 6, width: 1 },
        palette: { floor: '#4f6b3a', wall: '#2b3d21', accent: '#8dbf6d', accentStride: 5 }
      }
    },
    {
      id: 'endor_forest_bastion',
      name: 'Endor Forest Bastion',
      description: 'Massive trunks form a network of elevated clearings and walkways.',
      theme: {
        radial: { arms: 6, length: 18, width: 3, startAngle: Math.PI / 6 },
        rings: { start: 5, end: 14, step: 3 },
        scatterCaves: { count: 12, radiusRange: [2, 4] },
        palette: { floor: '#5e7c42', wall: '#2d1b0b', accent: '#9ac957', accentStride: 8 }
      }
    },
    {
      id: 'mustafar_lava_rivers',
      name: 'Mustafar Lava Rivers',
      description: 'Molten rivers cut labyrinthine channels through volcanic stone.',
      theme: {
        spiral: { turns: 3, thickness: 2 },
        scatterLines: { count: 16, length: 9, width: 2 },
        palette: { floor: '#ff4c1f', wall: '#2d0d05', accent: '#ffa23a', accentStride: 5 }
      }
    },
    {
      id: 'bespin_cloud_platforms',
      name: 'Bespin Cloud Platforms',
      description: 'Suspended walkways weaving between turbine platforms and vapor shafts.',
      theme: {
        grid: { spacingX: 7, spacingY: 7, width: 1 },
        radial: { arms: 4, length: 14, width: 2 },
        scatterCaves: { count: 10, radiusRange: [2, 3] },
        palette: { floor: '#f5f1ff', wall: '#9095b2', accent: '#c7d4ff', accentStride: 6 }
      }
    },
    {
      id: 'coruscant_underlevels',
      name: 'Coruscant Underlevels',
      description: 'Stacked megastructure hallways and forgotten service tunnels.',
      theme: {
        grid: { spacingX: 5, spacingY: 4, width: 2 },
        scatterLines: { count: 18, length: 7, width: 2 },
        carveRectangles: [ [3, 3, 12, 8], [15, 12, 26, 18], [6, 15, 20, 22] ],
        palette: { floor: '#5f6d83', wall: '#1f232d', accent: '#9bb1d9', accentStride: 5 }
      }
    },
    {
      id: 'jakku_salvage_fields',
      name: 'Jakku Salvage Fields',
      description: 'Half-buried wreck corridors and scavenger warrens.',
      theme: {
        scatterCaves: { count: 22, radiusRange: [2, 4] },
        scatterLines: { count: 14, length: 8, width: 2 },
        palette: { floor: '#d2b085', wall: '#6c4b2b', accent: '#efc47b', accentStride: 6 }
      }
    },
    {
      id: 'kamino_clone_atrium',
      name: 'Kamino Clone Atrium',
      description: 'Cyclonic walkways circle rain-battered cloning vats.',
      theme: {
        hub: { radius: 4 },
        rings: { start: 4, end: 16, step: 4 },
        scatterLines: { count: 10, length: 9, width: 2 },
        palette: { floor: '#c0e6ff', wall: '#4d6a7f', accent: '#7dd2ff', accentStride: 4 }
      }
    },
    {
      id: 'geonosis_forge_halls',
      name: 'Geonosis Forge Halls',
      description: 'Angular hives of chitinous causeways and factory pits.',
      theme: {
        radial: { arms: 8, length: 17, width: 2, startAngle: Math.PI / 8 },
        scatterCaves: { count: 18, radiusRange: [1, 3] },
        carveRectangles: [ [4, 4, 9, 9], [20, 5, 27, 10], [10, 16, 17, 22] ],
        palette: { floor: '#c96c36', wall: '#5b2a13', accent: '#f29b4b', accentStride: 5 }
      }
    },
    {
      id: 'kashyyyk_roots_maze',
      name: 'Kashyyyk Roots Maze',
      description: 'Wroshyr roots twist into natural tunnels and hidden hollows.',
      theme: {
        scatterLines: { count: 24, length: 10, width: 1 },
        scatterCaves: { count: 18, radiusRange: [2, 5] },
        palette: { floor: '#6d8f47', wall: '#2c1b0e', accent: '#b6d977', accentStride: 7 }
      }
    },
    {
      id: 'scarif_imperial_vault',
      name: 'Scarif Imperial Vault',
      description: 'Laser-trenched data vaults linked by precision-cut corridors.',
      theme: {
        grid: { spacingX: 5, spacingY: 5, width: 2 },
        carveRectangles: [ [5, 5, 10, 10], [15, 6, 20, 11], [10, 15, 22, 21] ],
        palette: { floor: '#8cbecf', wall: '#21394a', accent: '#d0f4ff', accentStride: 4 }
      }
    },
    {
      id: 'ahch_to_temple_steps',
      name: "Ahch-To Temple Steps",
      description: 'Cliffside terraces spiral around ancient meditation chambers.',
      theme: {
        spiral: { turns: 2.5, thickness: 2 },
        scatterCaves: { count: 12, radiusRange: [2, 4] },
        palette: { floor: '#9fa7a9', wall: '#3e4349', accent: '#c7d3d9', accentStride: 6 }
      }
    },
    {
      id: 'jedha_crystal_cavern',
      name: 'Jedha Crystal Cavern',
      description: 'Kyber-lined caverns refract light into crystalline halls.',
      theme: {
        radial: { arms: 7, length: 16, width: 2 },
        scatterCaves: { count: 20, radiusRange: [2, 4] },
        palette: { floor: '#d5d0ff', wall: '#564a7d', accent: '#f1f0ff', accentStride: 5 }
      }
    },
    {
      id: 'exegol_sith_sanctum',
      name: 'Exegol Sith Sanctum',
      description: 'Unearthly catacomb rings and lightning-carved trenches.',
      theme: {
        rings: { start: 3, end: 18, step: 3 },
        scatterLines: { count: 20, length: 11, width: 2 },
        palette: { floor: '#4d3c64', wall: '#140f1b', accent: '#7f5ab5', accentStride: 4 }
      }
    }
  ];

  const generators = generatorDefs.map(createGenerator);

  const dimensionEntries = [
    { key: 'outer_rim', name: 'Outer Rim Frontiers', baseLevel: 18 },
    { key: 'core_worlds', name: 'Core Worlds Nexus', baseLevel: 28 },
    { key: 'unknown_regions', name: 'Unknown Regions Shroud', baseLevel: 32 },
    { key: 'mid_rim', name: 'Mid Rim Corridors', baseLevel: 22 }
  ];

  const blocks1 = [
    { key: 'tatooine_spice_cache', level: 3, size: 1, depth: 5, chest: 'more', type: 'tatooine_dune_sea', weight: 3 },
    { key: 'hoth_hangar_entry', level: 6, size: 1, depth: 6, chest: 'normal', type: 'hoth_rebel_outpost', weight: 2 },
    { key: 'dagobah_force_glade', level: 5, size: 1, depth: 5, chest: 'less', type: 'dagobah_swamp_hollows', weight: 2 },
    { key: 'endor_shield_node', level: 7, size: 1, depth: 6, chest: 'normal', type: 'endor_forest_bastion', weight: 2 },
    { key: 'mustafar_flux_channel', level: 10, size: 1, depth: 7, chest: 'less', type: 'mustafar_lava_rivers', weight: 2 },
    { key: 'bespin_turbine_dock', level: 8, size: 1, depth: 6, chest: 'normal', type: 'bespin_cloud_platforms', weight: 2 },
    { key: 'coruscant_chute', level: 9, size: 1, depth: 6, chest: 'more', type: 'coruscant_underlevels', weight: 3 },
    { key: 'jakku_walker_grave', level: 4, size: 1, depth: 5, chest: 'normal', type: 'jakku_salvage_fields', weight: 2 },
    { key: 'kamino_production_ring', level: 11, size: 1, depth: 7, chest: 'less', type: 'kamino_clone_atrium', weight: 2 },
    { key: 'geonosis_drone_hive', level: 12, size: 1, depth: 7, chest: 'more', type: 'geonosis_forge_halls', weight: 2 },
    { key: 'kashyyyk_root_well', level: 6, size: 1, depth: 6, chest: 'normal', type: 'kashyyyk_roots_maze', weight: 2 },
    { key: 'scarif_data_node', level: 14, size: 1, depth: 8, chest: 'more', type: 'scarif_imperial_vault', weight: 3 },
    { key: 'ahchto_meditation_spire', level: 13, size: 1, depth: 7, chest: 'less', type: 'ahch_to_temple_steps', weight: 2 },
    { key: 'jedha_crystal_gallery', level: 15, size: 1, depth: 8, chest: 'normal', type: 'jedha_crystal_cavern', weight: 2 },
    { key: 'exegol_obelisk_chamber', level: 18, size: 1, depth: 9, chest: 'less', type: 'exegol_sith_sanctum', weight: 1 },
    { key: 'mandalore_ruined_forum', level: 16, size: 1, depth: 8, chest: 'normal', type: null, weight: 2 },
    { key: 'naboo_grotto', level: 5, size: 1, depth: 5, chest: 'more', type: null, weight: 3 }
  ];

  const blocks2 = [
    { key: 'tatooine_bantha_pass', level: 6, size: 2, depth: 6, chest: 'normal', type: 'tatooine_dune_sea', weight: 2 },
    { key: 'hoth_generator_core', level: 9, size: 2, depth: 7, chest: 'less', type: 'hoth_rebel_outpost', weight: 2 },
    { key: 'dagobah_dark_side_nexus', level: 8, size: 2, depth: 6, chest: 'more', type: 'dagobah_swamp_hollows', weight: 1 },
    { key: 'endor_ewok_village', level: 10, size: 2, depth: 7, chest: 'normal', type: 'endor_forest_bastion', weight: 2 },
    { key: 'mustafar_bridge_foundry', level: 13, size: 2, depth: 8, chest: 'less', type: 'mustafar_lava_rivers', weight: 2 },
    { key: 'bespin_central_plaza', level: 12, size: 2, depth: 7, chest: 'normal', type: 'bespin_cloud_platforms', weight: 2 },
    { key: 'coruscant_underworld_market', level: 14, size: 2, depth: 8, chest: 'more', type: 'coruscant_underlevels', weight: 2 },
    { key: 'jakku_sand_sunken', level: 7, size: 2, depth: 6, chest: 'normal', type: 'jakku_salvage_fields', weight: 2 },
    { key: 'kamino_spiral_vats', level: 15, size: 2, depth: 8, chest: 'less', type: 'kamino_clone_atrium', weight: 2 },
    { key: 'geonosis_arena_ring', level: 16, size: 2, depth: 8, chest: 'normal', type: 'geonosis_forge_halls', weight: 2 },
    { key: 'kashyyyk_shadow_tangle', level: 11, size: 2, depth: 7, chest: 'less', type: 'kashyyyk_roots_maze', weight: 2 },
    { key: 'scarif_landing_bay', level: 18, size: 2, depth: 9, chest: 'more', type: 'scarif_imperial_vault', weight: 2 },
    { key: 'ahchto_stone_circle', level: 17, size: 2, depth: 8, chest: 'less', type: 'ahch_to_temple_steps', weight: 2 },
    { key: 'jedha_khyber_spires', level: 19, size: 2, depth: 9, chest: 'normal', type: 'jedha_crystal_cavern', weight: 2 },
    { key: 'exegol_throne_approach', level: 22, size: 2, depth: 10, chest: 'less', type: 'exegol_sith_sanctum', weight: 1 },
    { key: 'alderaan_memory_hall', level: 9, size: 2, depth: 6, chest: 'more', type: null, weight: 3 },
    { key: 'corellia_shipyard_corridor', level: 13, size: 2, depth: 7, chest: 'normal', type: null, weight: 2 }
  ];

  const blocks3 = [
    { key: 'tatooine_krayt_lair', level: 12, size: 3, depth: 8, chest: 'more', type: 'tatooine_dune_sea', weight: 1 },
    { key: 'hoth_wampa_hollow', level: 15, size: 3, depth: 9, chest: 'normal', type: 'hoth_rebel_outpost', weight: 1 },
    { key: 'dagobah_ancient_tree', level: 14, size: 3, depth: 8, chest: 'less', type: 'dagobah_swamp_hollows', weight: 1 },
    { key: 'endor_sentinel_platform', level: 16, size: 3, depth: 9, chest: 'normal', type: 'endor_forest_bastion', weight: 1 },
    { key: 'mustafar_duel_crucible', level: 20, size: 3, depth: 10, chest: 'less', type: 'mustafar_lava_rivers', weight: 1 },
    { key: 'bespin_carbon_freeze_hall', level: 18, size: 3, depth: 9, chest: 'normal', type: 'bespin_cloud_platforms', weight: 1 },
    { key: 'coruscant_jedi_archive_vault', level: 21, size: 3, depth: 10, chest: 'more', type: 'coruscant_underlevels', weight: 1 },
    { key: 'jakku_star_destroyer_core', level: 17, size: 3, depth: 9, chest: 'more', type: 'jakku_salvage_fields', weight: 1 },
    { key: 'kamino_prime_chamber', level: 22, size: 3, depth: 10, chest: 'less', type: 'kamino_clone_atrium', weight: 1 },
    { key: 'geonosis_hive_throne', level: 23, size: 3, depth: 10, chest: 'less', type: 'geonosis_forge_halls', weight: 1 },
    { key: 'kashyyyk_wroshyr_crown', level: 18, size: 3, depth: 9, chest: 'normal', type: 'kashyyyk_roots_maze', weight: 1 },
    { key: 'scarif_data_core', level: 24, size: 3, depth: 11, chest: 'more', type: 'scarif_imperial_vault', weight: 1 },
    { key: 'ahchto_primal_chamber', level: 20, size: 3, depth: 9, chest: 'less', type: 'ahch_to_temple_steps', weight: 1 },
    { key: 'jedha_sacred_resonance', level: 25, size: 3, depth: 11, chest: 'normal', type: 'jedha_crystal_cavern', weight: 1 },
    { key: 'exegol_infinite_pit', level: 28, size: 3, depth: 12, chest: 'less', type: 'exegol_sith_sanctum', weight: 1 },
    { key: 'malachor_sith_holocron', level: 26, size: 3, depth: 11, chest: 'more', type: null, weight: 1 },
    { key: 'lothal_world_between', level: 24, size: 3, depth: 10, chest: 'normal', type: null, weight: 1 }
  ];

  const addonDefinition = {
    id: ADDON_ID,
    version: VERSION,
    name: ADDON_NAME,
    authors: ['Holocron Cartographers'],
    generators,
    blocks: {
      dimensions: dimensionEntries,
      blocks1,
      blocks2,
      blocks3
    }
  };

  if(typeof window !== 'undefined' && typeof window.registerDungeonAddon === 'function'){
    window.registerDungeonAddon(addonDefinition);
  } else {
    console.warn('[Star Wars Galactic Saga Pack] registerDungeonAddon is not available.');
  }
})();

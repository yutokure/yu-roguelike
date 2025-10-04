// Addon: Paddy Field Paths - lattice of rice paddies, levees, and irrigation canals
(function(){
  function randInt(random, min, max){
    return min + Math.floor(random() * (max - min + 1));
  }

  function clamp01(value){
    if(value < 0) return 0;
    if(value > 1) return 1;
    return value;
  }

  function tintColor(hex, amount){
    if(typeof hex !== 'string' || !/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)){
      return hex;
    }
    const normalized = hex.length === 4
      ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
      : hex;
    const intVal = parseInt(normalized.slice(1), 16);
    let r = (intVal >> 16) & 0xff;
    let g = (intVal >> 8) & 0xff;
    let b = intVal & 0xff;
    const adjust = (channel) => {
      if(amount >= 0){
        const delta = (255 - channel) * clamp01(amount);
        return Math.round(channel + delta);
      }
      const delta = channel * clamp01(-amount);
      return Math.round(channel - delta);
    };
    r = Math.max(0, Math.min(255, adjust(r)));
    g = Math.max(0, Math.min(255, adjust(g)));
    b = Math.max(0, Math.min(255, adjust(b)));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  function buildAxisArray(total, random){
    const arr = new Array(total);
    let pos = 0;
    while(pos < total){
      // Brown levee (path) strip
      let walkwayWidth = randInt(random, 1, 3);
      if(pos + walkwayWidth > total){
        walkwayWidth = total - pos;
      }
      let waterIndex = null;
      if(walkwayWidth >= 2){
        if(random() < 0.75){
          waterIndex = random() < 0.5 ? 0 : walkwayWidth - 1;
        } else if(walkwayWidth >= 3 && random() < 0.5){
          waterIndex = randInt(random, 0, walkwayWidth - 1);
        }
      }
      for(let i=0;i<walkwayWidth && pos < total;i++,pos++){
        arr[pos] = { kind: (waterIndex === i ? 'water' : 'path') };
      }
      if(pos >= total){
        break;
      }

      const remaining = total - pos;
      if(remaining <= 2){
        for(let i=0;i<remaining;i++,pos++){
          arr[pos] = { kind: 'path' };
        }
        break;
      }

      const fieldWidth = Math.min(randInt(random, 3, 6), remaining - 1);
      for(let i=0;i<fieldWidth && pos < total;i++,pos++){
        arr[pos] = { kind: 'field' };
      }
    }
    return arr;
  }

  function algorithm(ctx){
    const W = ctx.width;
    const H = ctx.height;
    const map = ctx.map;
    const random = ctx.random;

    const horizontal = buildAxisArray(H, random);
    const vertical = buildAxisArray(W, random);

    const fieldColorBase = '#b9e466';
    const waterColor = '#6fd3ff';
    const pathColor = '#8b6231';

    for(let y=0;y<H;y++){
      const h = horizontal[y];
      for(let x=0;x<W;x++){
        const v = vertical[x];
        const isField = h.kind === 'field' && v.kind === 'field';
        const isWater = h.kind === 'water' || v.kind === 'water';
        if(isField){
          map[y][x] = 1;
          const tint = 0.06 * (random() - 0.5);
          ctx.setWallColor(x, y, tintColor(fieldColorBase, tint));
        } else if(isWater){
          map[y][x] = 1;
          const tint = 0.08 * (random() - 0.5);
          ctx.setWallColor(x, y, tintColor(waterColor, tint));
        } else {
          map[y][x] = 0;
          const tint = 0.07 * (random() - 0.5);
          ctx.setFloorColor(x, y, tintColor(pathColor, tint));
        }
      }
    }

    // scatter small stepping stones along the levees to add variation
    for(let i=0;i<Math.floor((W*H) * 0.015);i++){
      const x = randInt(random, 1, W-2);
      const y = randInt(random, 1, H-2);
      if(map[y][x] === 0 && random() < 0.4){
        ctx.setFloorColor(x, y, tintColor('#a0723d', 0.05 * (random() - 0.5)));
      }
    }

    ctx.ensureConnectivity();
  }

  const gen = {
    id: 'paddy-field-paths',
    name: '田園あぜ道',
    description: '黄緑の田んぼと茶色のあぜ道、水色の水路が格子状に広がる農村の景観',
    algorithm,
    mixin: { normalMixed: 0.4, blockDimMixed: 0.4, tags: ['field','agriculture','rural'] }
  };

  function mkBoss(depth){
    const r = [];
    if(depth >= 4) r.push(5);
    if(depth >= 8) r.push(10);
    if(depth >= 12) r.push(15);
    return r;
  }

  const blocks = {
    blocks1: [
      { key:'paddy_paths_theme_01', name:'Paddy Paths Theme I', level:+0,  size:0,  depth:+1, chest:'normal', type:'paddy-field-paths', bossFloors:mkBoss(5) },
      { key:'paddy_paths_theme_02', name:'Paddy Paths Theme II', level:+6,  size:+1, depth:+1, chest:'less',   type:'paddy-field-paths', bossFloors:mkBoss(7) },
      { key:'paddy_paths_theme_03', name:'Paddy Paths Theme III',level:+12, size:+1, depth:+1, chest:'more',  type:'paddy-field-paths', bossFloors:mkBoss(9) },
      { key:'paddy_paths_theme_04', name:'Paddy Paths Theme IV', level:+18, size:+2, depth:+2, chest:'normal',type:'paddy-field-paths', bossFloors:mkBoss(11) },
      { key:'paddy_paths_theme_05', name:'Paddy Paths Theme V',  level:+24, size:+2, depth:+2, chest:'less',  type:'paddy-field-paths', bossFloors:mkBoss(13) }
    ],
    blocks2: [
      { key:'paddy_paths_core_01', name:'Paddy Paths Core I', level:+0,  size:+1, depth:0,  chest:'normal', type:'paddy-field-paths' },
      { key:'paddy_paths_core_02', name:'Paddy Paths Core II',level:+5,  size:+1, depth:+1, chest:'more',   type:'paddy-field-paths' },
      { key:'paddy_paths_core_03', name:'Paddy Paths Core III',level:+10, size:+2, depth:+1, chest:'less',  type:'paddy-field-paths' },
      { key:'paddy_paths_core_04', name:'Paddy Paths Core IV', level:+16, size:+2, depth:+2, chest:'normal',type:'paddy-field-paths' },
      { key:'paddy_paths_core_05', name:'Paddy Paths Core V',  level:+22, size:+3, depth:+2, chest:'more',  type:'paddy-field-paths' }
    ],
    blocks3: [
      { key:'paddy_paths_relic_01', name:'Paddy Paths Relic I', level:+0,  size:0,  depth:+2, chest:'more',   type:'paddy-field-paths', bossFloors:[5] },
      { key:'paddy_paths_relic_02', name:'Paddy Paths Relic II',level:+8,  size:+1, depth:+2, chest:'normal', type:'paddy-field-paths', bossFloors:[10] },
      { key:'paddy_paths_relic_03', name:'Paddy Paths Relic III',level:+16, size:+1, depth:+3, chest:'less',  type:'paddy-field-paths', bossFloors:[15] },
      { key:'paddy_paths_relic_04', name:'Paddy Paths Relic IV', level:+22, size:+2, depth:+3, chest:'more',  type:'paddy-field-paths', bossFloors:[10,15] },
      { key:'paddy_paths_relic_05', name:'Paddy Paths Relic V',  level:+28, size:+2, depth:+4, chest:'normal',type:'paddy-field-paths', bossFloors:[5,10,15] }
    ]
  };

  window.registerDungeonAddon({
    id:'paddy_azemichi_pack',
    name:'Paddy Terrace Paths Pack',
    version:'1.0.0',
    author:'modder-sample',
    blocks,
    generators:[gen]
  });
})();

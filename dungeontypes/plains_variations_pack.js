// Addon: Multicolor Plains Pack - diverse plains-themed dungeon generators
(function(){
  function clamp(value, min, max){
    return value < min ? min : (value > max ? max : value);
  }
  function hexToRgb(hex){
    const v = hex.replace('#','');
    return {
      r: parseInt(v.slice(0,2),16),
      g: parseInt(v.slice(2,4),16),
      b: parseInt(v.slice(4,6),16)
    };
  }
  function rgbToHex(rgb){
    return '#' + [rgb.r, rgb.g, rgb.b].map(c => clamp(Math.round(c),0,255).toString(16).padStart(2,'0')).join('');
  }
  function lerpColor(a, b, t){
    const ca = hexToRgb(a);
    const cb = hexToRgb(b);
    return rgbToHex({
      r: ca.r + (cb.r - ca.r) * t,
      g: ca.g + (cb.g - ca.g) * t,
      b: ca.b + (cb.b - ca.b) * t
    });
  }
  function randomChoice(random, array){
    return array[Math.floor(random() * array.length) % array.length];
  }
  function smoothMap(map, W, H){
    const next = map.map(row => row.slice());
    for(let y=1;y<H-1;y++){
      for(let x=1;x<W-1;x++){
        let walls = 0;
        for(let oy=-1;oy<=1;oy++){
          for(let ox=-1;ox<=1;ox++){
            if(ox===0 && oy===0) continue;
            if(map[y+oy][x+ox] === 1) walls++;
          }
        }
        if(walls >= 5){
          next[y][x] = 1;
        } else if(walls <= 3){
          next[y][x] = 0;
        }
      }
    }
    for(let y=1;y<H-1;y++){
      for(let x=1;x<W-1;x++){
        map[y][x] = next[y][x];
      }
    }
  }
  function createPlainAlgorithm(theme){
    return function(ctx){
      const W = ctx.width;
      const H = ctx.height;
      const map = ctx.map;
      const random = ctx.random;
      const density = theme.wallDensity != null ? theme.wallDensity : 0.035;
      const smoothingSteps = theme.smoothingSteps != null ? theme.smoothingSteps : 2;
      const keyFor = (x,y) => `${x},${y}`;
      const overrides = {
        floorColor: new Map(),
        floorType: new Map(),
        wallColor: new Map()
      };
      const state = {
        ctx,
        map,
        random,
        width: W,
        height: H,
        keyFor,
        overrides,
        paintCircle(cx, cy, radius, callback){
          const rSq = radius * radius;
          for(let y = Math.max(1, cy - radius); y <= Math.min(H - 2, cy + radius); y++){
            for(let x = Math.max(1, cx - radius); x <= Math.min(W - 2, cx + radius); x++){
              const dx = x - cx;
              const dy = y - cy;
              if(dx*dx + dy*dy <= rSq){
                callback(x, y);
              }
            }
          }
        },
        markFloorColor(x,y,color){ overrides.floorColor.set(keyFor(x,y), color); },
        markFloorType(x,y,type){ overrides.floorType.set(keyFor(x,y), type); },
        markWallColor(x,y,color){ overrides.wallColor.set(keyFor(x,y), color); },
        openTile(x,y){ if(x>0 && y>0 && x<W-1 && y<H-1) map[y][x] = 0; },
        wallTile(x,y){ if(x>0 && y>0 && x<W-1 && y<H-1) map[y][x] = 1; }
      };

      for(let y=0;y<H;y++){
        for(let x=0;x<W;x++){
          if(x===0 || y===0 || x===W-1 || y===H-1){
            map[y][x] = 1;
          } else {
            map[y][x] = random() < density ? 1 : 0;
          }
        }
      }

      for(let i=0;i<smoothingSteps;i++) smoothMap(map, W, H);

      if(theme.centralClearing !== false){
        const radius = Math.max(3, Math.floor(Math.min(W, H) * 0.18));
        state.paintCircle(Math.floor(W/2), Math.floor(H/2), radius, (x,y)=>{ map[y][x] = 0; });
      }

      if(theme.afterShape){
        theme.afterShape(state);
      }

      if(theme.decorate){
        theme.decorate(state);
      }

      for(let y=0;y<H;y++){
        for(let x=0;x<W;x++){
          const key = keyFor(x,y);
          if(map[y][x] === 0){
            let color = theme.floorColor;
            if(theme.floorColorFn){
              color = theme.floorColorFn(state, x, y, color);
            } else if(theme.accentColors && theme.accentColors.length && random() < (theme.accentChance || 0)){
              color = randomChoice(random, theme.accentColors);
            }
            if(overrides.floorColor.has(key)){
              color = overrides.floorColor.get(key);
            }
            ctx.setFloorColor(x, y, color);
            let type = theme.floorType || null;
            if(theme.floorTypeFn){
              type = theme.floorTypeFn(state, x, y, type);
            }
            if(overrides.floorType.has(key)){
              type = overrides.floorType.get(key);
            }
            if(type){
              ctx.setFloorType(x, y, type);
            }
          } else {
            let color = theme.wallColor;
            if(theme.wallColorFn){
              color = theme.wallColorFn(state, x, y, color);
            }
            if(overrides.wallColor.has(key)){
              color = overrides.wallColor.get(key);
            }
            ctx.setWallColor(x, y, color);
          }
        }
      }

      if(theme.afterColor){
        theme.afterColor(state);
      }

      ctx.ensureConnectivity();
    };
  }

  const themes = [
    {
      id:'emerald-meadow',
      name:'草原',
      description:'緑と花が彩る風そよぐ草原の平原',
      floorColor:'#8fcf6b',
      wallColor:'#3f6b2a',
      accentColors:['#bfe87f','#f6d860','#f1a7c5'],
      accentChance:0.08,
      floorType:'grass',
      tags:['field','plains','grass'],
      wallDensity:0.028,
      smoothingSteps:1,
      decorate(state){
        const patches = 4 + Math.floor(state.random() * 3);
        for(let i=0;i<patches;i++){
          const cx = 2 + Math.floor(state.random() * (state.width - 4));
          const cy = 2 + Math.floor(state.random() * (state.height - 4));
          const radius = 2 + Math.floor(state.random() * 2);
          state.paintCircle(cx, cy, radius, (x,y)=>{
            if(state.random() < 0.4){
              state.map[y][x] = 1;
            }
          });
        }
      }
    },
    {
      id:'earthen-expanse',
      name:'土の原',
      description:'乾いた大地が広がる素朴な平原',
      floorColor:'#cda980',
      wallColor:'#6d4931',
      accentColors:['#b5835a','#e0c59c'],
      accentChance:0.06,
      floorType:'earth',
      tags:['field','plains','earth'],
      wallDensity:0.04,
      smoothingSteps:2,
      decorate(state){
        const lines = 3 + Math.floor(state.random() * 3);
        for(let i=0;i<lines;i++){
          const startY = 2 + Math.floor(state.random() * (state.height - 4));
          for(let x=2;x<state.width-2;x++){
            if(state.random() < 0.1){
              state.map[startY][x] = 1;
            }
          }
        }
      }
    },
    {
      id:'windswept-badlands',
      name:'荒れ地',
      description:'風と砂が刻む切り立った荒地の平原',
      floorColor:'#d98c5f',
      wallColor:'#7a3f1a',
      accentColors:['#f0b489','#b9643c'],
      accentChance:0.07,
      floorType:'earth',
      tags:['field','plains','badlands'],
      wallDensity:0.055,
      smoothingSteps:3,
      afterShape(state){
        const ridges = 3 + Math.floor(state.random() * 3);
        for(let i=0;i<ridges;i++){
          const cx = 2 + Math.floor(state.random() * (state.width - 4));
          const cy = 2 + Math.floor(state.random() * (state.height - 4));
          const radius = 3 + Math.floor(state.random() * 3);
          state.paintCircle(cx, cy, radius, (x,y)=>{
            if(state.random() < 0.6) state.map[y][x] = 1;
          });
        }
      }
    },
    {
      id:'asphalt-flatlands',
      name:'アスファルト',
      description:'舗装路が続く人工的な平原。障害物は街路設備',
      floorColor:'#4a4a4a',
      wallColor:'#2c2c2c',
      floorType:'stone',
      tags:['field','urban','road'],
      wallDensity:0.02,
      smoothingSteps:1,
      decorate(state){
        const blocks = 5 + Math.floor(state.random() * 4);
        for(let i=0;i<blocks;i++){
          const w = 2 + Math.floor(state.random() * 3);
          const h = 1 + Math.floor(state.random() * 3);
          const sx = 2 + Math.floor(state.random() * (state.width - w - 3));
          const sy = 2 + Math.floor(state.random() * (state.height - h - 3));
          for(let y=sy;y<sy+h;y++){
            for(let x=sx;x<sx+w;x++){
              state.map[y][x] = 1;
            }
          }
        }
      },
      floorColorFn(state, x, y, base){
        if(y % 10 === 4 || y % 10 === 5){
          return '#f4f4f4';
        }
        if(y % 10 === 6){
          return '#ffc857';
        }
        if(state.random() < 0.03){
          return '#5b5b5b';
        }
        return base;
      }
    },
    {
      id:'voided-plain',
      name:'闇の大地',
      description:'紫紺に染まる闇のエネルギーが漂う平原',
      floorColor:'#5e3b76',
      wallColor:'#2a0d3a',
      accentColors:['#7c4ba2','#371852','#a566c2'],
      accentChance:0.1,
      floorType:'arcane',
      tags:['field','plains','dark'],
      wallDensity:0.045,
      smoothingSteps:2,
      floorColorFn(state, x, y, base){
        const nx = x / state.width - 0.5;
        const ny = y / state.height - 0.5;
        const dist = Math.sqrt(nx*nx + ny*ny);
        const swirl = Math.sin((nx - ny) * Math.PI * 4);
        const t = clamp(dist * 0.9 + swirl * 0.1, 0, 1);
        return lerpColor(base, '#230430', t * 0.6);
      }
    },
    {
      id:'radiant-plain',
      name:'光の大地',
      description:'光が降り注ぐ黄金色の聖なる平原',
      floorColor:'#f4f1bb',
      wallColor:'#d9c56b',
      accentColors:['#ffe066','#fff3bf','#ffd670'],
      accentChance:0.09,
      floorType:'holy',
      tags:['field','plains','light'],
      wallDensity:0.03,
      smoothingSteps:1,
      floorColorFn(state, x, y, base){
        const cx = state.width / 2;
        const cy = state.height / 2;
        const dx = (x - cx) / cx;
        const dy = (y - cy) / cy;
        const dist = Math.sqrt(dx*dx + dy*dy);
        return lerpColor(base, '#ffffff', clamp(1 - dist, 0, 1) * 0.5);
      }
    },
    {
      id:'shallow-shoals',
      name:'浅瀬',
      description:'澄んだ水面と砂の島が点在する浅瀬の平原',
      floorColor:'#7bdff2',
      wallColor:'#2a5d6f',
      floorType:'water',
      tags:['field','plains','water'],
      wallDensity:0.025,
      smoothingSteps:1,
      decorate(state){
        const sandIslands = 6 + Math.floor(state.random() * 4);
        for(let i=0;i<sandIslands;i++){
          const cx = 2 + Math.floor(state.random() * (state.width - 4));
          const cy = 2 + Math.floor(state.random() * (state.height - 4));
          const radius = 2 + Math.floor(state.random() * 3);
          state.paintCircle(cx, cy, radius, (x,y)=>{
            state.map[y][x] = 0;
            state.markFloorColor(x, y, '#ffe0ac');
            state.markFloorType(x, y, 'sand');
          });
        }
        const rocks = 8 + Math.floor(state.random() * 6);
        for(let i=0;i<rocks;i++){
          const x = 2 + Math.floor(state.random() * (state.width - 4));
          const y = 2 + Math.floor(state.random() * (state.height - 4));
          state.map[y][x] = 1;
          state.markWallColor(x, y, '#3a6f7f');
        }
      },
      floorColorFn(state, x, y, base){
        if(state.overrides.floorColor.has(state.keyFor(x,y))){
          return state.overrides.floorColor.get(state.keyFor(x,y));
        }
        const wave = Math.sin((x + y) * 0.4) * 0.05;
        return lerpColor(base, '#bdeffb', clamp(0.2 + wave, 0, 0.5));
      }
    },
    {
      id:'checker-plain',
      name:'チェッカー柄',
      description:'規則正しい模様が広がるチェッカー状の平原',
      floorColor:'#bdb2ff',
      wallColor:'#564592',
      floorType:'pattern',
      tags:['field','plains','pattern'],
      wallDensity:0.02,
      smoothingSteps:0,
      centralClearing:false,
      floorColorFn(state, x, y, base){
        const secondary = '#ffc6ff';
        return ((x + y) % 2 === 0) ? base : secondary;
      }
    },
    {
      id:'snowy-expanse',
      name:'雪原',
      description:'雪が降り積もり白銀に輝く静かな平原',
      floorColor:'#f4faff',
      wallColor:'#7b8ba3',
      accentColors:['#ffffff','#d9e6f2'],
      accentChance:0.05,
      floorType:'snow',
      tags:['field','plains','snow'],
      wallDensity:0.03,
      smoothingSteps:2,
      decorate(state){
        const icePatches = 5 + Math.floor(state.random() * 4);
        for(let i=0;i<icePatches;i++){
          const cx = 2 + Math.floor(state.random() * (state.width - 4));
          const cy = 2 + Math.floor(state.random() * (state.height - 4));
          const radius = 2 + Math.floor(state.random() * 3);
          state.paintCircle(cx, cy, radius, (x,y)=>{
            state.markFloorColor(x, y, '#c9e4ff');
            state.markFloorType(x, y, 'ice');
          });
        }
      },
      floorColorFn(state, x, y, base){
        if(state.overrides.floorColor.has(state.keyFor(x,y))){
          return state.overrides.floorColor.get(state.keyFor(x,y));
        }
        const noise = ((x * 131 + y * 73) % 97) / 97;
        return lerpColor(base, '#ffffff', noise * 0.25);
      }
    }
  ];

  const generators = themes.map(theme => ({
    id: theme.id,
    name: theme.name,
    description: theme.description,
    algorithm: createPlainAlgorithm(theme),
    mixin: {
      normalMixed: 0.5,
      blockDimMixed: 0.5,
      tags: theme.tags || ['field','plains']
    }
  }));

  function mkBoss(depth){
    const r = [];
    if(depth >= 5) r.push(5);
    if(depth >= 10) r.push(10);
    if(depth >= 15) r.push(15);
    return r;
  }

  const chestCycle = ['normal','less','more'];
  const blocks = { blocks1:[], blocks2:[], blocks3:[] };
  themes.forEach((theme, index) => {
    const levelBase = index * 4;
    blocks.blocks1.push({
      key:`plains_${theme.id}_expedition`,
      name:`${theme.name} 遠征`,
      level:+(levelBase),
      size:index % 3 === 0 ? 0 : (index % 3 === 1 ? +1 : +2),
      depth:+1 + (index % 2 === 0 ? 0 : +1),
      chest:chestCycle[index % chestCycle.length],
      type:theme.id,
      bossFloors: mkBoss(6 + index)
    });
    blocks.blocks2.push({
      key:`plains_${theme.id}_core`,
      name:`${theme.name} 核`,
      level:+(levelBase + 3),
      size:+1 + (index % 2 === 0 ? 0 : +1),
      depth:+(index % 3 === 0 ? 0 : 1),
      chest:chestCycle[(index + 1) % chestCycle.length],
      type:theme.id
    });
    const bossDepth = 7 + index;
    const floors = [];
    if(bossDepth >= 5) floors.push(5);
    if(bossDepth >= 9) floors.push(10);
    if(bossDepth >= 13) floors.push(15);
    blocks.blocks3.push({
      key:`plains_${theme.id}_relic`,
      name:`${theme.name} 遺構`,
      level:+(levelBase + 6),
      size:index % 2 === 0 ? 0 : +1,
      depth:+2 + (index % 3 === 2 ? +1 : 0),
      chest:chestCycle[(index + 2) % chestCycle.length],
      type:theme.id,
      bossFloors:floors.length ? floors : undefined
    });
  });

  window.registerDungeonAddon({
    id:'multicolor_plains_pack',
    name:'Multicolor Plains Pack',
    nameKey: "dungeon.packs.multicolor_plains_pack.name",
    version:'1.0.0',
    blocks,
    generators
  });
})();

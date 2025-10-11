// Addon: Enchanted Forest Realms Pack - adds 10 diverse forest dungeon generators
(function(){
  const PACK_ID = 'enchanted_forest_realms_pack';
  const PACK_NAME = 'Enchanted Forest Realms Pack';
  const VERSION = '1.0.0';

  function clamp(value, min, max){
    return value < min ? min : (value > max ? max : value);
  }

  function hexToRgb(hex){
    const normalized = (hex || '').toString().trim().replace(/^#/, '');
    if(!/^[0-9a-fA-F]{6}$/.test(normalized)){
      return { r: 0, g: 0, b: 0 };
    }
    return {
      r: parseInt(normalized.slice(0,2), 16),
      g: parseInt(normalized.slice(2,4), 16),
      b: parseInt(normalized.slice(4,6), 16)
    };
  }

  function rgbToHex(rgb){
    const toHex = (component) => clamp(Math.round(component), 0, 255).toString(16).padStart(2, '0');
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
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

  function lighten(hex, ratio){
    const rgb = hexToRgb(hex);
    return rgbToHex({
      r: rgb.r + (255 - rgb.r) * ratio,
      g: rgb.g + (255 - rgb.g) * ratio,
      b: rgb.b + (255 - rgb.b) * ratio
    });
  }

  function darken(hex, ratio){
    const rgb = hexToRgb(hex);
    return rgbToHex({
      r: rgb.r * (1 - ratio),
      g: rgb.g * (1 - ratio),
      b: rgb.b * (1 - ratio)
    });
  }

  function randomChoice(random, array){
    if(!array || !array.length) return null;
    return array[Math.floor(random() * array.length) % array.length];
  }

  function smoothMap(map, width, height, birthLimit, deathLimit){
    const next = map.map(row => row.slice());
    for(let y=1; y<height-1; y++){
      for(let x=1; x<width-1; x++){
        let walls = 0;
        for(let oy=-1; oy<=1; oy++){
          for(let ox=-1; ox<=1; ox++){
            if(ox === 0 && oy === 0) continue;
            if(map[y+oy][x+ox] === 1){
              walls++;
            }
          }
        }
        if(walls > birthLimit){
          next[y][x] = 1;
        } else if(walls < deathLimit){
          next[y][x] = 0;
        }
      }
    }
    for(let y=1; y<height-1; y++){
      for(let x=1; x<width-1; x++){
        map[y][x] = next[y][x];
      }
    }
  }

  function pseudoNoise(x, y, scale, offset){
    const nx = x * scale + offset * 1.37;
    const ny = y * scale - offset * 0.73;
    return (Math.sin(nx) + Math.cos(ny) + Math.sin(nx * 0.7 + ny * 1.1)) / 3 * 0.5 + 0.5;
  }

  function createForestAlgorithm(theme){
    return function(ctx){
      const W = ctx.width;
      const H = ctx.height;
      const map = ctx.map;
      const random = ctx.random;
      const density = clamp(theme.treeDensity != null ? theme.treeDensity : 0.42, 0.05, 0.8);
      const iterations = theme.smoothingSteps != null ? theme.smoothingSteps : 3;
      const birthLimit = theme.birthLimit != null ? theme.birthLimit : 5;
      const deathLimit = theme.deathLimit != null ? theme.deathLimit : 3;

      for(let y=0; y<H; y++){
        for(let x=0; x<W; x++){
          if(x === 0 || y === 0 || x === W-1 || y === H-1){
            map[y][x] = 1;
          } else {
            map[y][x] = random() < density ? 1 : 0;
          }
        }
      }

      for(let i=0; i<iterations; i++){
        smoothMap(map, W, H, birthLimit, deathLimit);
      }

      const keyFor = (x, y) => `${x},${y}`;
      const overrides = {
        floorColor: new Map(),
        wallColor: new Map(),
        floorType: new Map()
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
          for(let py=Math.max(1, cy - radius); py<=Math.min(H-2, cy + radius); py++){
            for(let px=Math.max(1, cx - radius); px<=Math.min(W-2, cx + radius); px++){
              const dx = px - cx;
              const dy = py - cy;
              if(dx*dx + dy*dy <= rSq){
                callback(px, py);
              }
            }
          }
        },
        paintEllipse(cx, cy, radiusX, radiusY, callback){
          const rx = Math.max(1, radiusX);
          const ry = Math.max(1, radiusY);
          for(let py=Math.max(1, cy - ry); py<=Math.min(H-2, cy + ry); py++){
            for(let px=Math.max(1, cx - rx); px<=Math.min(W-2, cx + rx); px++){
              const dx = (px - cx) / rx;
              const dy = (py - cy) / ry;
              if(dx*dx + dy*dy <= 1){
                callback(px, py);
              }
            }
          }
        },
        carvePath(points, radius){
          if(!Array.isArray(points) || points.length < 2) return;
          const r = Math.max(1, Math.floor(radius || 2));
          for(let i=0; i<points.length-1; i++){
            const [x1, y1] = points[i];
            const [x2, y2] = points[i+1];
            const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
            for(let step=0; step<=steps; step++){
              const t = steps ? step/steps : 0;
              const x = Math.round(x1 + (x2 - x1) * t);
              const y = Math.round(y1 + (y2 - y1) * t);
              this.paintCircle(x, y, r, (px, py)=>{ map[py][px] = 0; });
            }
          }
        },
        openTile(x, y){ if(x>0 && y>0 && x<W-1 && y<H-1) map[y][x] = 0; },
        wallTile(x, y){ if(x>0 && y>0 && x<W-1 && y<H-1) map[y][x] = 1; },
        markFloorColor(x, y, color){ overrides.floorColor.set(keyFor(x,y), color); },
        markWallColor(x, y, color){ overrides.wallColor.set(keyFor(x,y), color); },
        markFloorType(x, y, type){ overrides.floorType.set(keyFor(x,y), type); },
        noise(x, y, scale, offset){
          return pseudoNoise(x, y, scale != null ? scale : 0.12, offset != null ? offset : random() * 10);
        }
      };

      if(theme.clearingCount !== 0){
        const baseCount = theme.clearingCount != null ? theme.clearingCount : Math.max(2, Math.floor((W + H) / 30));
        for(let i=0; i<baseCount; i++){
          const radius = Math.max(2, Math.floor((theme.clearingRadiusMin || 3) + random() * ((theme.clearingRadiusMax || Math.min(W,H)/6) - (theme.clearingRadiusMin || 3))));
          const cx = 2 + Math.floor(random() * (W - 4));
          const cy = 2 + Math.floor(random() * (H - 4));
          state.paintCircle(cx, cy, radius, (px, py)=>{ map[py][px] = 0; });
        }
      }

      if(theme.path){
        const radius = theme.path.radius != null ? theme.path.radius : 2;
        const points = [];
        const segments = theme.path.segments != null ? theme.path.segments : 4;
        const margin = 4;
        let lastX = margin + Math.floor(random() * (W - margin*2));
        let lastY = margin;
        points.push([lastX, lastY]);
        for(let i=0; i<segments; i++){
          const targetX = margin + Math.floor(random() * (W - margin*2));
          const targetY = margin + Math.floor(((i+1)/segments) * (H - margin*2));
          points.push([targetX, targetY]);
        }
        points.push([margin + Math.floor(random() * (W - margin*2)), H - margin]);
        state.carvePath(points, radius);
      }

      if(typeof theme.afterShape === 'function'){
        theme.afterShape(state);
      }

      if(typeof theme.decorate === 'function'){
        theme.decorate(state);
      }

      for(let y=0; y<H; y++){
        for(let x=0; x<W; x++){
          const key = keyFor(x, y);
          if(map[y][x] === 0){
            let color = theme.floorColor || '#4d8a4a';
            if(typeof theme.floorColorFn === 'function'){
              color = theme.floorColorFn(state, x, y, color);
            }
            if(overrides.floorColor.has(key)){
              color = overrides.floorColor.get(key);
            }
            ctx.setFloorColor(x, y, color);
            let type = theme.floorType || 'forest';
            if(typeof theme.floorTypeFn === 'function'){
              type = theme.floorTypeFn(state, x, y, type);
            }
            if(overrides.floorType.has(key)){
              type = overrides.floorType.get(key);
            }
            if(type){
              ctx.setFloorType(x, y, type);
            }
          } else {
            let color = theme.wallColor || '#1f3d2a';
            if(typeof theme.wallColorFn === 'function'){
              color = theme.wallColorFn(state, x, y, color);
            }
            if(overrides.wallColor.has(key)){
              color = overrides.wallColor.get(key);
            }
            ctx.setWallColor(x, y, color);
          }
        }
      }

      if(typeof theme.afterColor === 'function'){
        theme.afterColor(state);
      }

      ctx.ensureConnectivity();
    };
  }

  const themes = [
    {
      id: 'fairy-glimmerwood',
      name: '妖精の森',
      description: '妖精が舞い、淡い光が差し込む幻想的な森。花畑の空き地が点在する。',
      floorColor: '#7bdc9c',
      wallColor: '#2e6b3b',
      floorType: 'fairy-forest',
      treeDensity: 0.34,
      smoothingSteps: 2,
      clearingCount: 5,
      clearingRadiusMin: 3,
      clearingRadiusMax: 6,
      decorate(state){
        const sparkles = 40 + Math.floor(state.random() * 30);
        for(let i=0; i<sparkles; i++){
          const x = 2 + Math.floor(state.random() * (state.width - 4));
          const y = 2 + Math.floor(state.random() * (state.height - 4));
          if(state.map[y][x] === 0){
            const color = randomChoice(state.random, ['#fff5ba', '#ffe3fa', '#c6f7ff']);
            state.markFloorColor(x, y, color);
          }
        }
      },
      floorColorFn(state, x, y, base){
        const noise = state.noise(x, y, 0.18, 1.2);
        return lerpColor(base, '#ffffff', noise * 0.2);
      },
      wallColorFn(state, x, y, base){
        const n = state.noise(x, y, 0.25, 2.5);
        return lerpColor(base, '#144d2e', n * 0.4);
      },
      tags: ['forest', 'fairy', 'light']
    },
    {
      id: 'mystic-veilwood',
      name: '神秘の森',
      description: '濃い霧と魔力が漂う神秘の森。曲がりくねった小径が奥へ誘う。',
      floorColor: '#5fb0a6',
      wallColor: '#1b5252',
      floorType: 'mystic-forest',
      treeDensity: 0.44,
      smoothingSteps: 3,
      path: { radius: 2.5, segments: 5 },
      decorate(state){
        const pillars = 16 + Math.floor(state.random() * 8);
        for(let i=0; i<pillars; i++){
          const x = 3 + Math.floor(state.random() * (state.width - 6));
          const y = 3 + Math.floor(state.random() * (state.height - 6));
          state.paintCircle(x, y, 1 + Math.floor(state.random() * 2), (px, py)=>{
            state.map[py][px] = 1;
            state.markWallColor(px, py, '#203a44');
          });
        }
      },
      floorColorFn(state, x, y, base){
        const n = state.noise(x, y, 0.09, 4.1);
        return lerpColor(base, '#3d7a83', n * 0.6);
      },
      tags: ['forest', 'arcane', 'fog']
    },
    {
      id: 'snowdrift-pines',
      name: '雪の森',
      description: '雪が積もった静寂の森。凍った池や氷の枝がきらめく。',
      floorColor: '#eff6ff',
      wallColor: '#5c7c99',
      floorType: 'snow-forest',
      treeDensity: 0.48,
      smoothingSteps: 3,
      clearingCount: 3,
      decorate(state){
        const frozenPonds = 3 + Math.floor(state.random() * 2);
        for(let i=0; i<frozenPonds; i++){
          const cx = 3 + Math.floor(state.random() * (state.width - 6));
          const cy = 3 + Math.floor(state.random() * (state.height - 6));
          const rx = 3 + Math.floor(state.random() * 4);
          const ry = 2 + Math.floor(state.random() * 3);
          state.paintEllipse(cx, cy, rx, ry, (px, py)=>{
            state.map[py][px] = 0;
            state.markFloorColor(px, py, '#cfe8ff');
            state.markFloorType(px, py, 'ice');
          });
        }
      },
      wallColorFn(state, x, y, base){
        const n = state.noise(x, y, 0.2, 6.5);
        return lerpColor(base, '#8fa9c4', n * 0.5);
      },
      floorColorFn(state, x, y, base){
        const shimmer = state.noise(x, y, 0.15, 3.8);
        return lerpColor(base, '#ffffff', shimmer * 0.3);
      },
      tags: ['forest', 'snow', 'cold']
    },
    {
      id: 'rugged-thornwood',
      name: '荒れた森',
      description: '棘だらけの倒木が覆う荒れ果てた森。道は険しく、岩が露出している。',
      floorColor: '#7c6d55',
      wallColor: '#3a2c1a',
      floorType: 'thorn-forest',
      treeDensity: 0.5,
      smoothingSteps: 4,
      clearingCount: 2,
      afterShape(state){
        const spines = 12 + Math.floor(state.random() * 8);
        for(let i=0; i<spines; i++){
          const x = 2 + Math.floor(state.random() * (state.width - 4));
          const y = 2 + Math.floor(state.random() * (state.height - 4));
          state.carvePath([[x, y], [x + Math.floor(state.random()*7-3), y + Math.floor(state.random()*7-3)]], 1);
        }
      },
      decorate(state){
        const rocks = 20 + Math.floor(state.random() * 15);
        for(let i=0; i<rocks; i++){
          const x = 2 + Math.floor(state.random() * (state.width - 4));
          const y = 2 + Math.floor(state.random() * (state.height - 4));
          if(state.random() < 0.5){
            state.map[y][x] = 1;
            state.markWallColor(x, y, '#2a1d11');
          }
        }
      },
      wallColorFn(state, x, y, base){
        const n = state.noise(x, y, 0.22, 2.2);
        return lerpColor(base, '#20150b', n * 0.6);
      },
      tags: ['forest', 'ruins', 'difficult']
    },
    {
      id: 'demon-hellgrove',
      name: '悪魔の森',
      description: '赤黒い瘴気が漂う悪魔の森。燃える根が蠢き、溶岩の裂け目が走る。',
      floorColor: '#a43b3b',
      wallColor: '#301112',
      floorType: 'infernal-forest',
      treeDensity: 0.46,
      smoothingSteps: 3,
      clearingCount: 1,
      decorate(state){
        const fissures = 5 + Math.floor(state.random() * 4);
        for(let i=0; i<fissures; i++){
          const startX = 2 + Math.floor(state.random() * (state.width - 4));
          const startY = 2 + Math.floor(state.random() * (state.height - 4));
          const endX = startX + Math.floor(state.random() * 8 - 4);
          const endY = startY + Math.floor(state.random() * 8 - 4);
          state.carvePath([[startX, startY], [endX, endY]], 1.5);
          state.carvePath([[startX, startY], [endX, endY]], 0.5);
          state.paintCircle(endX, endY, 2, (px, py)=>{
            state.map[py][px] = 0;
            state.markFloorColor(px, py, '#f06b37');
            state.markFloorType(px, py, 'lava');
          });
        }
        const embers = 30 + Math.floor(state.random() * 20);
        for(let i=0; i<embers; i++){
          const x = 2 + Math.floor(state.random() * (state.width - 4));
          const y = 2 + Math.floor(state.random() * (state.height - 4));
          if(state.map[y][x] === 0 && state.random() < 0.4){
            state.markFloorColor(x, y, randomChoice(state.random, ['#f65f4a', '#ffb347']));
          }
        }
      },
      wallColorFn(state, x, y, base){
        const n = state.noise(x, y, 0.3, 9.1);
        return lerpColor(base, '#1a0506', n * 0.7);
      },
      tags: ['forest', 'fire', 'demonic']
    },
    {
      id: 'ancient-giantwood',
      name: '古代巨木の森',
      description: '天を突く巨木が林立する原始の森。太い幹が迷路のように並ぶ。',
      floorColor: '#6fa167',
      wallColor: '#2d4b24',
      floorType: 'ancient-forest',
      treeDensity: 0.52,
      smoothingSteps: 4,
      clearingCount: 2,
      afterShape(state){
        const trunks = 6 + Math.floor(state.random() * 4);
        for(let i=0; i<trunks; i++){
          const cx = 3 + Math.floor(state.random() * (state.width - 6));
          const cy = 3 + Math.floor(state.random() * (state.height - 6));
          state.paintCircle(cx, cy, 2 + Math.floor(state.random() * 2), (px, py)=>{
            state.map[py][px] = 1;
            state.markWallColor(px, py, '#3f2b18');
          });
        }
      },
      decorate(state){
        const roots = 8 + Math.floor(state.random() * 6);
        for(let i=0; i<roots; i++){
          const x = 2 + Math.floor(state.random() * (state.width - 4));
          const y = 2 + Math.floor(state.random() * (state.height - 4));
          state.carvePath([[x, y], [x + Math.floor(state.random()*5-2), y + Math.floor(state.random()*5-2)]], 1);
        }
      },
      tags: ['forest', 'ancient', 'giant']
    },
    {
      id: 'luminous-fungal-wood',
      name: '発光キノコの森',
      description: '青白い光を放つキノコが繁る地下森。胞子の霞が漂う。',
      floorColor: '#5fa8d3',
      wallColor: '#1f2d4f',
      floorType: 'fungal-forest',
      treeDensity: 0.38,
      smoothingSteps: 2,
      clearingCount: 4,
      decorate(state){
        const clusters = 30 + Math.floor(state.random() * 20);
        for(let i=0; i<clusters; i++){
          const x = 2 + Math.floor(state.random() * (state.width - 4));
          const y = 2 + Math.floor(state.random() * (state.height - 4));
          if(state.map[y][x] === 0){
            state.markFloorColor(x, y, randomChoice(state.random, ['#9ce5ff', '#a99cff', '#78ffd6']));
          }
        }
      },
      wallColorFn(state, x, y, base){
        const n = state.noise(x, y, 0.16, 7.7);
        return lerpColor(base, '#0f162b', n * 0.6);
      },
      tags: ['forest', 'fungus', 'bioluminescent']
    },
    {
      id: 'tempest-boughs',
      name: '嵐の森',
      description: '雷鳴が木々を裂く嵐の森。稲妻が走った跡が地面を焦がす。',
      floorColor: '#65806f',
      wallColor: '#1f2e23',
      floorType: 'storm-forest',
      treeDensity: 0.47,
      smoothingSteps: 3,
      path: { radius: 1.6, segments: 3 },
      decorate(state){
        const strikes = 10 + Math.floor(state.random() * 8);
        for(let i=0; i<strikes; i++){
          const x = 2 + Math.floor(state.random() * (state.width - 4));
          const y = 2 + Math.floor(state.random() * (state.height - 4));
          state.paintCircle(x, y, 1, (px, py)=>{
            state.map[py][px] = 0;
            state.markFloorColor(px, py, '#f1f2f0');
            state.markFloorType(px, py, 'scorched');
          });
        }
      },
      wallColorFn(state, x, y, base){
        const n = state.noise(x, y, 0.21, 5.4);
        return lerpColor(base, '#101913', n * 0.7);
      },
      tags: ['forest', 'storm', 'weather']
    },
    {
      id: 'autumn-emberwood',
      name: '紅葉の森',
      description: '燃えるような紅葉が広がる秋の森。落ち葉が地面を覆う。',
      floorColor: '#d78b4a',
      wallColor: '#5c2e13',
      floorType: 'autumn-forest',
      treeDensity: 0.4,
      smoothingSteps: 3,
      clearingCount: 4,
      decorate(state){
        const leaves = 50 + Math.floor(state.random() * 30);
        for(let i=0; i<leaves; i++){
          const x = 2 + Math.floor(state.random() * (state.width - 4));
          const y = 2 + Math.floor(state.random() * (state.height - 4));
          if(state.map[y][x] === 0){
            state.markFloorColor(x, y, randomChoice(state.random, ['#ffb347', '#ff8360', '#ffd27f']));
          }
        }
      },
      floorColorFn(state, x, y, base){
        const n = state.noise(x, y, 0.12, 8.2);
        return lerpColor(base, '#f9c784', n * 0.5);
      },
      tags: ['forest', 'autumn', 'leafy']
    },
    {
      id: 'whispering-bamboo',
      name: '竹の森',
      description: '高く伸びる竹が風に揺れる静かな森。縦に伸びる小径が網の目を成す。',
      floorColor: '#9ac194',
      wallColor: '#2a5f3c',
      floorType: 'bamboo-forest',
      treeDensity: 0.36,
      smoothingSteps: 2,
      afterShape(state){
        const columns = 5 + Math.floor(state.random() * 3);
        for(let i=0; i<columns; i++){
          const x = 3 + Math.floor((state.width - 6) * (i + 0.5) / columns);
          state.carvePath([[x, 2], [x, state.height - 3]], 1.2);
        }
      },
      decorate(state){
        const clusters = 18 + Math.floor(state.random() * 10);
        for(let i=0; i<clusters; i++){
          const x = 2 + Math.floor(state.random() * (state.width - 4));
          const y = 2 + Math.floor(state.random() * (state.height - 4));
          if(state.map[y][x] === 0){
            state.markFloorColor(x, y, randomChoice(state.random, ['#b8e0a8', '#d3f6b6']));
          }
        }
      },
      tags: ['forest', 'bamboo', 'serene']
    },
    {
      id: 'twilight-shadowgrove',
      name: '黄昏の森',
      description: '夕暮れの光に包まれた薄暗い森。長い影が妖しく揺らめく。',
      floorColor: '#8d6aa1',
      wallColor: '#3b1f4f',
      floorType: 'twilight-forest',
      treeDensity: 0.42,
      smoothingSteps: 3,
      clearingCount: 3,
      decorate(state){
        const lights = 35 + Math.floor(state.random() * 20);
        for(let i=0; i<lights; i++){
          const x = 2 + Math.floor(state.random() * (state.width - 4));
          const y = 2 + Math.floor(state.random() * (state.height - 4));
          if(state.map[y][x] === 0){
            state.markFloorColor(x, y, randomChoice(state.random, ['#f1b1ff', '#f2d0ff', '#ffc857']));
          }
        }
      },
      floorColorFn(state, x, y, base){
        const n = state.noise(x, y, 0.14, 11.3);
        return lerpColor(base, '#513567', n * 0.6);
      },
      wallColorFn(state, x, y, base){
        const n = state.noise(x, y, 0.2, 4.4);
        return lerpColor(base, '#1d0f29', n * 0.5);
      },
      tags: ['forest', 'dusk', 'mystic']
    }
  ];

  const generators = themes.map(theme => ({
    id: theme.id,
    name: theme.name,
    description: theme.description,
    algorithm: createForestAlgorithm(theme),
    mixin: {
      normalMixed: 0.65,
      blockDimMixed: 0.7,
      tags: theme.tags || ['forest']
    }
  }));

  function computeBossFloors(depth){
    const floors = [];
    if(depth >= 4) floors.push(4);
    if(depth >= 7) floors.push(7);
    if(depth >= 10) floors.push(10);
    if(depth >= 14) floors.push(14);
    return floors;
  }

  const chestCycle = ['normal', 'less', 'more'];
  const blocks = { blocks1: [], blocks2: [], blocks3: [] };

  themes.forEach((theme, index) => {
    const levelBase = 6 + index * 3;
    blocks.blocks1.push({
      key: `forest_${theme.id}_expedition`,
      name: `${theme.name} 探索`,
      level: levelBase,
      size: index % 3 === 0 ? 0 : (index % 3 === 1 ? +1 : -1),
      depth: 4 + (index % 2),
      chest: chestCycle[index % chestCycle.length],
      type: theme.id,
      bossFloors: computeBossFloors(6 + index)
    });

    blocks.blocks2.push({
      key: `forest_${theme.id}_sanctum`,
      name: `${theme.name} 聖域`,
      level: levelBase + 3,
      size: index % 2 === 0 ? +1 : 0,
      depth: 6 + (index % 3),
      chest: chestCycle[(index + 1) % chestCycle.length],
      type: theme.id
    });

    blocks.blocks3.push({
      key: `forest_${theme.id}_heart`,
      name: `${theme.name} 深奥`,
      level: levelBase + 6,
      size: index % 2 === 0 ? +2 : +1,
      depth: 8 + (index % 4),
      chest: chestCycle[(index + 2) % chestCycle.length],
      type: theme.id,
      bossFloors: computeBossFloors(9 + index)
    });
  });

  window.registerDungeonAddon({
    id: PACK_ID,
    name: PACK_NAME,
    nameKey: `dungeon.packs.${PACK_ID}.name`,
    version: VERSION,
    blocks,
    generators
  });
})();

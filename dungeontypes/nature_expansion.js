// Addon: Nature Biome Expansion Pack - diverse natural landscape generators
(function(){
  const ADDON_ID = 'nature_expansion_pack';
  const ADDON_NAME = 'Nature Biome Expansion Pack';
  const VERSION = '2.1.0';

  function clamp(value, min, max){
    return value < min ? min : (value > max ? max : value);
  }

  function hexToRgb(hex){
    const normalized = (hex || '').toString().trim().replace(/^#/, '');
    if(!/^[0-9a-fA-F]{6}$/.test(normalized)){
      return { r: 0, g: 0, b: 0 };
    }
    return {
      r: parseInt(normalized.slice(0,2),16),
      g: parseInt(normalized.slice(2,4),16),
      b: parseInt(normalized.slice(4,6),16)
    };
  }

  function rgbToHex(rgb){
    const toHex = (v) => clamp(Math.round(v),0,255).toString(16).padStart(2,'0');
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

  function rgbToHsl(rgb){
    const r = clamp(rgb.r / 255, 0, 1);
    const g = clamp(rgb.g / 255, 0, 1);
    const b = clamp(rgb.b / 255, 0, 1);
    const max = Math.max(r,g,b);
    const min = Math.min(r,g,b);
    const l = (max + min) / 2;
    if(max === min){
      return { h: 0, s: 0, l };
    }
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = 0;
    switch(max){
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
    return { h, s, l };
  }

  function hslToRgb(h, s, l){
    const hue2rgb = (p, q, t) => {
      if(t < 0) t += 1;
      if(t > 1) t -= 1;
      if(t < 1/6) return p + (q - p) * 6 * t;
      if(t < 1/2) return q;
      if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    let r,g,b;
    if(s === 0){
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
  }

  function adjustHue(hex, degrees){
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb);
    hsl.h = (hsl.h + (degrees / 360)) % 1;
    if(hsl.h < 0) hsl.h += 1;
    return rgbToHex(hslToRgb(hsl.h, hsl.s, hsl.l));
  }

  function adjustSaturation(hex, ratio){
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb);
    hsl.s = clamp(hsl.s * ratio, 0, 1);
    return rgbToHex(hslToRgb(hsl.h, hsl.s, hsl.l));
  }

  function adjustLightness(hex, delta){
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb);
    hsl.l = clamp(hsl.l + delta, 0, 1);
    return rgbToHex(hslToRgb(hsl.h, hsl.s, hsl.l));
  }

  function gradientColor(stops, t){
    if(!Array.isArray(stops) || !stops.length){
      return '#000000';
    }
    const clampedT = clamp(t, 0, 1);
    if(stops.length === 1){
      return stops[0].color;
    }
    for(let i=0; i<stops.length-1; i++){
      const current = stops[i];
      const next = stops[i+1];
      if(clampedT >= current.at && clampedT <= next.at){
        const span = next.at - current.at || 1;
        const localT = (clampedT - current.at) / span;
        return lerpColor(current.color, next.color, localT);
      }
    }
    return stops[stops.length-1].color;
  }

  function layeredNoise(x, y, options){
    const opts = options || {};
    const scale = opts.scale != null ? opts.scale : 0.12;
    const octaves = opts.octaves != null ? opts.octaves : 3;
    const persistence = opts.persistence != null ? opts.persistence : 0.5;
    let amplitude = 1;
    let frequency = scale;
    let value = 0;
    let totalAmplitude = 0;
    for(let i=0; i<octaves; i++){
      const nx = x * frequency;
      const ny = y * frequency;
      const noise = Math.sin(nx) + Math.cos(ny) + Math.sin(nx + ny * 0.5);
      value += noise * amplitude;
      totalAmplitude += amplitude * 3;
      amplitude *= persistence;
      frequency *= 2;
    }
    return value / (totalAmplitude || 1) * 0.5 + 0.5;
  }

  function brighten(hex, ratio){
    const c = hexToRgb(hex);
    const mix = (channel) => clamp(channel + (255 - channel) * ratio, 0, 255);
    return rgbToHex({ r: mix(c.r), g: mix(c.g), b: mix(c.b) });
  }

  function countWalls(map, x, y, W, H){
    let total = 0;
    for(let oy=-1; oy<=1; oy++){
      for(let ox=-1; ox<=1; ox++){
        if(ox === 0 && oy === 0) continue;
        const nx = x + ox;
        const ny = y + oy;
        if(nx <= 0 || ny <= 0 || nx >= W-1 || ny >= H-1){
          total++;
        } else if(map[ny][nx] === 1){
          total++;
        }
      }
    }
    return total;
  }

  function smoothMap(state, steps, options){
    const iterations = Math.max(0, steps|0);
    if(!iterations) return;
    const birthLimit = options && options.birthLimit != null ? options.birthLimit : 4;
    const deathLimit = options && options.deathLimit != null ? options.deathLimit : 3;
    for(let iter=0; iter<iterations; iter++){
      const next = state.map.map(row => row.slice());
      for(let y=1; y<state.height-1; y++){
        for(let x=1; x<state.width-1; x++){
          const walls = countWalls(state.map, x, y, state.width, state.height);
          if(state.map[y][x] === 1){
            next[y][x] = walls >= birthLimit ? 1 : 0;
          } else {
            next[y][x] = walls > deathLimit ? 1 : 0;
          }
        }
      }
      for(let y=1; y<state.height-1; y++){
        for(let x=1; x<state.width-1; x++){
          state.map[y][x] = next[y][x];
        }
      }
    }
  }

  function createState(ctx){
    const map = ctx.map;
    const W = ctx.width;
    const H = ctx.height;
    const random = ctx.random;
    const keyFor = (x,y) => `${x},${y}`;
    const overrides = {
      floorColor:new Map(),
      wallColor:new Map(),
      floorType:new Map()
    };
    return {
      ctx,
      map,
      width:W,
      height:H,
      random,
      overrides,
      keyFor,
      clamp,
      inBounds(x,y){
        return x>0 && y>0 && x<W-1 && y<H-1;
      },
      open(x,y){ if(this.inBounds(x,y)) this.map[y][x] = 0; },
      wall(x,y){ if(this.inBounds(x,y)) this.map[y][x] = 1; },
      markFloorColor(x,y,color){ if(this.inBounds(x,y)) overrides.floorColor.set(keyFor(x,y), color); },
      markWallColor(x,y,color){ if(this.inBounds(x,y)) overrides.wallColor.set(keyFor(x,y), color); },
      markFloorType(x,y,type){ if(this.inBounds(x,y)) overrides.floorType.set(keyFor(x,y), type); },
      randomInt(min,max){
        const lo = Math.ceil(min);
        const hi = Math.floor(max);
        if(hi <= lo) return lo;
        return lo + Math.floor(random() * (hi - lo + 1));
      },
      randomChoice(array){
        if(!array || !array.length) return undefined;
        return array[Math.floor(random() * array.length) % array.length];
      },
      sampleNoise(x, y, options){
        return layeredNoise(x, y, options);
      },
      paintDisc(cx, cy, radius, callback){
        const r = Math.max(0, radius|0);
        const r2 = r * r;
        for(let y=Math.max(1, cy - r); y<=Math.min(this.height-2, cy + r); y++){
          for(let x=Math.max(1, cx - r); x<=Math.min(this.width-2, cx + r); x++){
            const dx = x - cx;
            const dy = y - cy;
            if(dx*dx + dy*dy <= r2){
              callback(x,y);
            }
          }
        }
      },
      paintRect(x0,y0,x1,y1,callback){
        const minX = Math.max(1, Math.min(x0,x1));
        const maxX = Math.min(this.width-2, Math.max(x0,x1));
        const minY = Math.max(1, Math.min(y0,y1));
        const maxY = Math.min(this.height-2, Math.max(y0,y1));
        for(let y=minY; y<=maxY; y++){
          for(let x=minX; x<=maxX; x++){
            callback(x,y);
          }
        }
      },
      carveRandomWalk(options){
        const opts = options || {};
        const steps = opts.steps != null ? Math.max(0, opts.steps|0) : (this.width + this.height);
        const width = opts.width != null ? Math.max(1, opts.width|0) : 1;
        let current = opts.start ? { x: clamp(opts.start.x, 1, this.width-2), y: clamp(opts.start.y, 1, this.height-2) }
          : { x: this.randomInt(2, this.width-3), y: this.randomInt(2, this.height-3) };
        const dirs = opts.allowDiagonals ? [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]] : [[1,0],[-1,0],[0,1],[0,-1]];
        for(let i=0; i<steps; i++){
          this.paintDisc(current.x, current.y, width, (x,y)=>{
            this.open(x,y);
            if(opts.floorColor){
              const value = typeof opts.floorColor === 'function' ? opts.floorColor(x,y,i,this) : opts.floorColor;
              this.markFloorColor(x,y,value);
            }
            if(opts.floorType){
              const value = typeof opts.floorType === 'function' ? opts.floorType(x,y,i,this) : opts.floorType;
              this.markFloorType(x,y,value);
            }
          });
          let dir = this.randomChoice(dirs) || [0,1];
          if(opts.bias && opts.bias.target){
            const strength = opts.bias.strength != null ? opts.bias.strength : 0.55;
            if(this.random() < strength){
              const dx = opts.bias.target.x - current.x;
              const dy = opts.bias.target.y - current.y;
              const sx = dx === 0 ? 0 : (dx > 0 ? 1 : -1);
              const sy = dy === 0 ? 0 : (dy > 0 ? 1 : -1);
              if(opts.allowDiagonals && sx !== 0 && sy !== 0){
                dir = [sx, sy];
              } else if(Math.abs(dx) > Math.abs(dy) && sx !== 0){
                dir = [sx, 0];
              } else if(sy !== 0){
                dir = [0, sy];
              }
            }
          }
          current = {
            x: clamp(current.x + dir[0], 1, this.width-2),
            y: clamp(current.y + dir[1], 1, this.height-2)
          };
        }
      },
      scatterClearings(countRange, radiusRange, options){
        const opts = options || {};
        const count = Array.isArray(countRange) ? this.randomInt(countRange[0], countRange[1]) : (countRange|0);
        const minR = Array.isArray(radiusRange) ? radiusRange[0] : radiusRange;
        const maxR = Array.isArray(radiusRange) ? radiusRange[1] : radiusRange;
        for(let i=0; i<count; i++){
          const radius = this.randomInt(minR, maxR);
          const cx = this.randomInt(2, this.width-3);
          const cy = this.randomInt(2, this.height-3);
          this.paintDisc(cx, cy, radius, (x,y)=>{
            this.open(x,y);
            if(opts.floorColor){
              const value = typeof opts.floorColor === 'function' ? opts.floorColor(x,y,this) : opts.floorColor;
              this.markFloorColor(x,y,value);
            }
            if(opts.floorType){
              const value = typeof opts.floorType === 'function' ? opts.floorType(x,y,this) : opts.floorType;
              this.markFloorType(x,y,value);
            }
            if(typeof opts.callback === 'function'){
              opts.callback(x,y,this);
            }
          });
        }
      }
    };
  }

  function initializeMap(state, theme){
    for(let y=0; y<state.height; y++){
      for(let x=0; x<state.width; x++){
        if(x===0 || y===0 || x===state.width-1 || y===state.height-1){
          state.map[y][x] = 1;
        } else {
          const chance = theme.baseWallChance != null ? theme.baseWallChance : 0.46;
          state.map[y][x] = state.random() < chance ? 1 : 0;
        }
      }
    }
    const smoothing = theme.smoothing || {};
    const steps = smoothing.steps != null ? smoothing.steps : (theme.smoothingSteps != null ? theme.smoothingSteps : 4);
    const birthLimit = smoothing.birthLimit != null ? smoothing.birthLimit : (theme.birthLimit != null ? theme.birthLimit : 4);
    const deathLimit = smoothing.deathLimit != null ? smoothing.deathLimit : (theme.deathLimit != null ? theme.deathLimit : 3);
    smoothMap(state, steps, { birthLimit, deathLimit });
    if(theme.centralClearing){
      const radius = theme.centralClearing.radius != null ? theme.centralClearing.radius : Math.floor(Math.min(state.width, state.height) * 0.2);
      const cx = theme.centralClearing.cx != null ? clamp(theme.centralClearing.cx, 2, state.width-3) : Math.floor(state.width/2);
      const cy = theme.centralClearing.cy != null ? clamp(theme.centralClearing.cy, 2, state.height-3) : Math.floor(state.height/2);
      state.paintDisc(cx, cy, radius, (x,y)=> state.open(x,y));
    }
  }

  function createBiomeAlgorithm(theme){
    return function(ctx){
      const state = createState(ctx);
      initializeMap(state, theme);

      if(typeof theme.afterShape === 'function'){
        theme.afterShape(state);
      }

      if(typeof theme.decorate === 'function'){
        theme.decorate(state);
      }

      for(let y=0; y<state.height; y++){
        for(let x=0; x<state.width; x++){
          const key = state.keyFor(x,y);
          if(state.map[y][x] === 0){
            let color = theme.floorColor;
            if(typeof theme.floorColorFn === 'function'){
              color = theme.floorColorFn(state, x, y, color);
            }
            if(theme.accentColors && theme.accentColors.length && theme.accentChance && state.random() < theme.accentChance){
              color = state.randomChoice(theme.accentColors);
            }
            if(state.overrides.floorColor.has(key)){
              color = state.overrides.floorColor.get(key);
            }
            if(color){
              ctx.setFloorColor(x,y,color);
            }
            let floorType = theme.floorType || null;
            if(typeof theme.floorTypeFn === 'function'){
              floorType = theme.floorTypeFn(state, x, y, floorType);
            }
            if(state.overrides.floorType.has(key)){
              floorType = state.overrides.floorType.get(key);
            }
            if(floorType){
              ctx.setFloorType(x, y, floorType);
            }
          } else {
            let color = theme.wallColor;
            if(typeof theme.wallColorFn === 'function'){
              color = theme.wallColorFn(state, x, y, color);
            }
            if(state.overrides.wallColor.has(key)){
              color = state.overrides.wallColor.get(key);
            }
            if(color){
              ctx.setWallColor(x,y,color);
            }
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
      id:'mist-rainforest',
      name:'霧雨熱帯林',
      description:'濃い霧と川筋が絡み合う湿潤な熱帯林の迷路。苔むした床と水路が交差する。',
      floorColor:'#386641',
      wallColor:'#081c15',
      accentColors:['#6a994e','#a7c957','#52b788'],
      accentChance:0.09,
      floorType:'moss',
      baseWallChance:0.52,
      smoothing:{ steps:5, birthLimit:4, deathLimit:3 },
      afterShape(state){
        const rivers = 2;
        for(let i=0;i<rivers;i++){
          const startX = state.randomInt(2, state.width-3);
          const endX = state.randomInt(2, state.width-3);
          state.carveRandomWalk({
            start:{ x:startX, y:2 },
            steps: state.height * 3,
            width:2,
            floorColor:'#2d6a4f',
            floorType:'water',
            bias:{ target:{ x:endX, y:state.height-3 }, strength:0.4 }
          });
        }
        state.scatterClearings([3,5], [2,4], {
          floorColor:'#52796f',
          floorType:'moss'
        });
      },
      decorate(state){
        const mistPockets = state.randomInt(3,5);
        for(let i=0;i<mistPockets;i++){
          const cx = state.randomInt(3, state.width-4);
          const cy = state.randomInt(3, state.height-4);
          state.paintDisc(cx, cy, state.randomInt(1,3), (x,y)=>{
            if(state.map[y][x] === 0 && state.random() < 0.6){
              state.markFloorColor(x,y, lerpColor('#52796f', '#74c69d', 0.4));
            }
          });
        }
      },
      floorColorFn(state, x, y, base){
        const humidity = Math.sin((x + y) * 0.15) * 0.1 + 0.15;
        return lerpColor(base, '#1b4332', clamp(humidity, 0, 0.4));
      },
      tags:['forest','water','nature']
    },
    {
      id:'blossom-valley',
      name:'花香る渓谷',
      description:'大地が花畑に覆われた渓谷。中央の草地を緩やかな小川が横切る。',
      floorColor:'#8ecae6',
      wallColor:'#31572c',
      accentColors:['#ffcbf2','#f9c74f','#ffafcc','#bde0fe'],
      accentChance:0.12,
      floorType:'grass',
      baseWallChance:0.38,
      smoothing:{ steps:3, birthLimit:4, deathLimit:3 },
      centralClearing:{},
      afterShape(state){
        const creekStart = { x: state.randomInt(2, state.width-3), y: 2 };
        const creekEnd = { x: state.randomInt(2, state.width-3), y: state.height-3 };
        state.carveRandomWalk({
          start: creekStart,
          steps: state.width + state.height,
          width:1,
          floorColor:'#4d908e',
          floorType:'water',
          bias:{ target: creekEnd, strength:0.6 }
        });
        state.scatterClearings([2,3], [3,5], {
          floorColor(x,y){
            return state.randomChoice(['#b7e4c7','#caffbf','#d8e2dc']);
          },
          floorType:'grass'
        });
      },
      decorate(state){
        const terraced = state.randomInt(1,2);
        for(let i=0;i<terraced;i++){
          const cy = state.randomInt(3, state.height-4);
          state.paintRect(2, cy-1, state.width-3, cy+1, (x,y)=>{
            if(state.map[y][x] === 0 && state.random() < 0.35){
              state.markFloorColor(x,y,'#fde2e4');
            }
          });
        }
      },
      floorColorFn(state, x, y, base){
        const valley = Math.abs(y - state.height/2) / (state.height/2);
        return lerpColor(base, '#b5e48c', clamp(1 - valley, 0, 0.6));
      },
      tags:['field','river','flowers','nature']
    },
    {
      id:'jade-terraces',
      name:'翡翠段丘',
      description:'棚田のように段々と連なる緑の段丘。斜面を繋ぐ水流が穏やかに流れる。',
      floorColor:'#74c69d',
      wallColor:'#2b9348',
      accentColors:['#95d5b2','#d9ed92'],
      accentChance:0.08,
      floorType:'earth',
      baseWallChance:0.5,
      smoothing:{ steps:4, birthLimit:4, deathLimit:4 },
      afterShape(state){
        const tiers = clamp(Math.floor(state.height / 6), 3, 6);
        const band = Math.max(3, Math.floor((state.height-4) / tiers));
        for(let t=0; t<tiers; t++){
          const yStart = 2 + t * band;
          const yEnd = Math.min(state.height-3, yStart + band - 1);
          state.paintRect(2, yStart, state.width-3, yEnd, (x,y)=>{
            if(state.random() < 0.78){
              state.open(x,y);
              if(state.random() < 0.1){
                state.markFloorColor(x,y,'#95d5b2');
              }
            }
          });
        }
        const streams = clamp(Math.floor(state.width / 14), 1, 3);
        for(let s=0; s<streams; s++){
          const start = { x: state.randomInt(3, state.width-4), y: 2 };
          const target = { x: state.randomInt(3, state.width-4), y: state.height-3 };
          state.carveRandomWalk({
            start,
            steps: state.height * 2,
            width:1,
            floorColor:'#52b788',
            floorType:'water',
            bias:{ target, strength:0.55 }
          });
        }
      },
      decorate(state){
        const cliffCount = state.randomInt(2,3);
        for(let i=0;i<cliffCount;i++){
          const x = state.randomInt(4, state.width-5);
          state.paintRect(x-1, 3, x+1, state.height-4, (px,py)=>{
            if(state.random() < 0.45){
              state.wall(px,py);
              state.markWallColor(px,py,'#2a6f4e');
            }
          });
        }
      },
      floorColorFn(state, x, y, base){
        const tierIndex = Math.floor((y / state.height) * 5) / 5;
        return lerpColor(base, '#55a630', tierIndex);
      },
      wallColorFn(state, x, y, base){
        if(state.overrides.wallColor.has(state.keyFor(x,y))){
          return state.overrides.wallColor.get(state.keyFor(x,y));
        }
        const gradient = y / state.height;
        return lerpColor(base, '#1b4332', gradient * 0.5);
      },
      tags:['terrace','agriculture','water','nature']
    },
    {
      id:'aurora-taiga',
      name:'オーロラ泰伽',
      description:'凍てついた大地にオーロラの光が揺らめく北方の針葉樹地帯。雪の回廊と氷の湖が点在する。',
      floorColor:'#e0fbfc',
      wallColor:'#1d3557',
      accentColors:['#a2d2ff','#bde0fe','#caf0f8'],
      accentChance:0.07,
      floorType:'snow',
      baseWallChance:0.55,
      smoothing:{ steps:5, birthLimit:5, deathLimit:4 },
      afterShape(state){
        const glacial = state.randomInt(2,3);
        for(let i=0;i<glacial;i++){
          const cx = state.randomInt(3, state.width-4);
          const cy = state.randomInt(3, state.height-4);
          const radius = state.randomInt(2,4);
          state.paintDisc(cx, cy, radius, (x,y)=>{
            state.open(x,y);
            if(state.random() < 0.85){
              state.markFloorColor(x,y,'#ade8f4');
              state.markFloorType(x,y,'ice');
            }
          });
        }
        const trails = 3 + Math.floor((state.width + state.height) / 30);
        for(let t=0;t<trails;t++){
          const start = { x: state.randomInt(2, state.width-3), y: state.randomInt(2, state.height-3) };
          const steps = state.randomInt(state.width, state.width + state.height);
          state.carveRandomWalk({
            start,
            steps,
            width:1,
            floorColor:'#edf6f9',
            floorType:'snow'
          });
        }
      },
      decorate(state){
        const firBands = state.randomInt(1,2);
        for(let i=0;i<firBands;i++){
          const y = state.randomInt(4, state.height-5);
          state.paintRect(2, y, state.width-3, y, (x,py)=>{
            if(state.random() < 0.4){
              state.wall(x,py);
              state.markWallColor(x,py, lerpColor('#1d3557', '#14213d', 0.4));
            }
          });
        }
      },
      floorColorFn(state, x, y, base){
        const t = y / state.height;
        const aurora = (Math.sin(x * 0.2) + 1) * 0.5;
        return lerpColor(base, '#90e0ef', clamp(aurora * 0.3 + t * 0.2, 0, 0.6));
      },
      tags:['snow','ice','forest','nature']
    },
    {
      id:'mangrove-delta',
      name:'マングローブ三角州',
      description:'複雑に分岐した水路と小島が点在する湿地帯。根が絡み合い、歩ける小道が浮かぶ。',
      floorColor:'#cad2c5',
      wallColor:'#344e41',
      accentColors:['#84a98c','#52796f','#354f52'],
      accentChance:0.1,
      floorType:'mud',
      baseWallChance:0.6,
      smoothing:{ steps:5, birthLimit:5, deathLimit:4 },
      afterShape(state){
        const channelCount = 4 + Math.floor((state.width + state.height) / 20);
        for(let i=0;i<channelCount;i++){
          const start = { x: state.randomInt(2, state.width-3), y: state.randomInt(2, state.height-3) };
          const target = { x: state.randomInt(2, state.width-3), y: state.randomInt(2, state.height-3) };
          state.carveRandomWalk({
            start,
            steps: state.randomInt(state.width * 2, state.width * 3),
            width:2,
            floorColor:'#74c69d',
            floorType:'water',
            bias:{ target, strength:0.35 }
          });
        }
        const islands = state.randomInt(5,8);
        for(let i=0;i<islands;i++){
          const cx = state.randomInt(3, state.width-4);
          const cy = state.randomInt(3, state.height-4);
          const radius = state.randomInt(1,3);
          state.paintDisc(cx, cy, radius, (x,y)=>{
            state.open(x,y);
            if(state.random() < 0.4){
              state.markFloorColor(x,y,'#b5c99a');
            }
          });
        }
      },
      decorate(state){
        const roots = state.randomInt(3,5);
        for(let i=0;i<roots;i++){
          const start = { x: state.randomInt(2, state.width-3), y: 2 };
          state.carveRandomWalk({
            start,
            steps: state.randomInt(state.height, state.height * 2),
            width:1,
            floorColor:'#b7b7a4',
            floorType:'plank'
          });
        }
      },
      floorColorFn(state, x, y, base){
        const mix = Math.sin((x + y) * 0.1) * 0.15 + 0.2;
        return lerpColor(base, '#52796f', clamp(mix, 0, 0.5));
      },
      tags:['water','swamp','roots','nature']
    },
    {
      id:'sunken-springs',
      name:'沈みし泉洞',
      description:'地底に湧き出る泉が複数湧く洞。青白く光る鉱石と静かな水面が広がる。',
      floorColor:'#d8f3dc',
      wallColor:'#2d6a4f',
      accentColors:['#b7e4c7','#95d5b2','#74c69d'],
      accentChance:0.08,
      floorType:'stone',
      baseWallChance:0.57,
      smoothing:{ steps:5, birthLimit:5, deathLimit:4 },
      afterShape(state){
        const pools = state.randomInt(4,6);
        for(let i=0;i<pools;i++){
          const cx = state.randomInt(3, state.width-4);
          const cy = state.randomInt(3, state.height-4);
          const radius = state.randomInt(2,4);
          state.paintDisc(cx, cy, radius, (x,y)=>{
            state.open(x,y);
            state.markFloorColor(x,y,'#99e2b4');
            state.markFloorType(x,y,'water');
          });
        }
        const corridors = 3 + Math.floor((state.width + state.height)/30);
        for(let c=0;c<corridors;c++){
          const start = { x: state.randomInt(2, state.width-3), y: state.randomInt(2, state.height-3) };
          state.carveRandomWalk({
            start,
            steps: state.randomInt(state.width + state.height, (state.width + state.height) * 2),
            width:1,
            floorColor:'#d8f3dc',
            floorType:'stone'
          });
        }
      },
      decorate(state){
        const crystals = state.randomInt(5,9);
        for(let i=0;i<crystals;i++){
          const cx = state.randomInt(3, state.width-4);
          const cy = state.randomInt(3, state.height-4);
          state.paintDisc(cx, cy, state.randomInt(1,2), (x,y)=>{
            if(state.random() < 0.6){
              state.markWallColor(x,y, brighten('#40916c', 0.2));
            }
          });
        }
      },
      floorColorFn(state, x, y, base){
        const depth = y / state.height;
        return lerpColor(base, '#52b69a', clamp(depth * 0.4, 0, 0.4));
      },
      wallColorFn(state, x, y, base){
        if(state.overrides.wallColor.has(state.keyFor(x,y))){
          return state.overrides.wallColor.get(state.keyFor(x,y));
        }
        const sparkle = (Math.sin(x * 0.4) + Math.cos(y * 0.4)) * 0.15 + 0.2;
        return lerpColor(base, '#1b4332', clamp(sparkle, 0, 0.5));
      },
      tags:['cave','water','crystal','nature']
    },
    {
      id:'crimson-ravine',
      name:'錦秋紅葉渓谷',
      description:'断崖に沿って紅葉が燃える秋の渓谷。落ち葉が敷き詰められ、裂け目を小川が縫う。',
      floorColor:'#d1495b',
      wallColor:'#432818',
      accentColors:['#f9844a','#f9c74f','#f8961e','#f94144'],
      accentChance:0.18,
      floorType:'leaf',
      baseWallChance:0.44,
      smoothing:{ steps:4, birthLimit:4, deathLimit:3 },
      afterShape(state){
        const gorgeStart = { x: 2, y: state.randomInt(2, state.height-3) };
        const gorgeEnd = { x: state.width-3, y: state.randomInt(2, state.height-3) };
        state.carveRandomWalk({
          start: gorgeStart,
          steps: state.width * 3,
          width:2,
          floorColor:'#f3722c',
          floorType:'soil',
          allowDiagonals:true,
          bias:{ target: gorgeEnd, strength:0.55 }
        });
        state.scatterClearings([4,6], [2,4], {
          floorColor:'#f8961e',
          floorType:'leaf'
        });
      },
      decorate(state){
        const cliffs = state.randomInt(2,4);
        for(let i=0;i<cliffs;i++){
          const cx = state.randomInt(3, state.width-4);
          const cy = state.randomInt(3, state.height-4);
          state.paintDisc(cx, cy, state.randomInt(1,2), (x,y)=>{
            if(state.map[y][x] === 1){
              state.markWallColor(x,y, adjustLightness('#432818', -0.1));
            }
          });
        }
      },
      floorColorFn(state, x, y, base){
        const valley = y / state.height;
        const noise = state.sampleNoise(x, y, { scale:0.08, octaves:4, persistence:0.6 });
        const blended = gradientColor([
          { at:0, color:'#432818' },
          { at:0.35, color:'#9c2f2f' },
          { at:0.65, color:'#f3722c' },
          { at:1, color:'#ffd166' }
        ], clamp(valley * 0.75 + noise * 0.25, 0, 1));
        return lerpColor(base, blended, 0.6);
      },
      wallColorFn(state, x, y, base){
        const ridge = Math.sin((x + y) * 0.15) * 0.15;
        return lerpColor(base, adjustSaturation('#331a0f', 0.7), clamp(0.3 + ridge, 0, 0.6));
      },
      tags:['forest','autumn','river','nature']
    },
    {
      id:'opaline-reef',
      name:'虹彩珊瑚礁',
      description:'澄んだ海中に浮かぶ珊瑚礁。虹色に輝く珊瑚帯が迷路状に広がる。',
      floorColor:'#90e0ef',
      wallColor:'#184e77',
      accentColors:['#ff9ecd','#ffd6ff','#72efdd','#80ffdb','#ffba08'],
      accentChance:0.2,
      floorType:'reef',
      baseWallChance:0.62,
      smoothing:{ steps:5, birthLimit:5, deathLimit:4 },
      afterShape(state){
        const lagoonRadius = Math.max(3, Math.floor(Math.min(state.width, state.height) * 0.18));
        state.paintDisc(Math.floor(state.width/2), Math.floor(state.height/2), lagoonRadius, (x,y)=>{
          state.open(x,y);
          state.markFloorColor(x,y,'#56cfe1');
          state.markFloorType(x,y,'water');
        });
        const channels = 3 + Math.floor(state.width / 12);
        for(let i=0;i<channels;i++){
          const start = { x: state.randomInt(2, state.width-3), y: 2 };
          state.carveRandomWalk({
            start,
            steps: state.randomInt(state.width * 2, state.width * 3),
            width:1,
            floorColor:'#64dfdf',
            floorType:'water',
            bias:{ target:{ x: state.randomInt(2, state.width-3), y: state.height-3 }, strength:0.45 }
          });
        }
      },
      decorate(state){
        const coralBeds = state.randomInt(6,10);
        for(let i=0;i<coralBeds;i++){
          const cx = state.randomInt(3, state.width-4);
          const cy = state.randomInt(3, state.height-4);
          state.paintDisc(cx, cy, state.randomInt(1,3), (x,y)=>{
            if(state.map[y][x] === 0){
              const hueShift = state.sampleNoise(x,y,{ scale:0.2, octaves:2 });
              const baseColor = state.randomChoice(['#f72585','#ff9ecd','#48bfe3','#4cc9f0']);
              state.markFloorColor(x,y, adjustHue(baseColor, (hueShift - 0.5) * 40));
            }
          });
        }
      },
      floorColorFn(state, x, y, base){
        const depth = y / state.height;
        const noise = state.sampleNoise(x, y, { scale:0.12, octaves:3, persistence:0.5 });
        const gradient = gradientColor([
          { at:0, color:'#caf0f8' },
          { at:0.4, color:'#90e0ef' },
          { at:0.75, color:'#48cae4' },
          { at:1, color:'#00b4d8' }
        ], clamp(depth * 0.8 + noise * 0.2, 0, 1));
        return lerpColor(base, gradient, 0.7);
      },
      wallColorFn(state, x, y, base){
        const glint = state.sampleNoise(x, y, { scale:0.25, octaves:1 });
        return lerpColor(base, '#03045e', clamp(glint * 0.5, 0, 0.5));
      },
      tags:['water','reef','ocean','nature']
    },
    {
      id:'sunset-savanna',
      name:'茜陽サバンナ',
      description:'夕焼け色に染まるサバンナ。草海の中に獣道が絡み、バオバブが点在する。',
      floorColor:'#ffb703',
      wallColor:'#6f4518',
      accentColors:['#fb8500','#f8961e','#ffd166','#8338ec'],
      accentChance:0.15,
      floorType:'dry_grass',
      baseWallChance:0.4,
      smoothing:{ steps:3, birthLimit:4, deathLimit:3 },
      afterShape(state){
        const migrationPaths = 3;
        for(let i=0;i<migrationPaths;i++){
          const start = { x: state.randomInt(2, state.width-3), y: state.randomInt(2, state.height-3) };
          state.carveRandomWalk({
            start,
            steps: state.randomInt(state.width * 2, state.width * 3),
            width:1,
            floorColor:'#f9c74f',
            floorType:'trail',
            bias:{ target:{ x: state.randomInt(2, state.width-3), y: state.randomInt(2, state.height-3) }, strength:0.35 }
          });
        }
        state.scatterClearings([3,5], [2,3], {
          floorColor:'#ffd166',
          floorType:'camp'
        });
      },
      decorate(state){
        const baobabs = state.randomInt(4,6);
        for(let i=0;i<baobabs;i++){
          const cx = state.randomInt(3, state.width-4);
          const cy = state.randomInt(3, state.height-4);
          state.paintDisc(cx, cy, 1, (x,y)=>{
            if(state.map[y][x] === 0){
              state.markFloorColor(x,y,'#dda15e');
              state.markFloorType(x,y,'tree');
            }
          });
        }
      },
      floorColorFn(state, x, y, base){
        const dusk = x / state.width;
        const shimmer = Math.sin(y * 0.25) * 0.15 + 0.2;
        const gradient = gradientColor([
          { at:0, color:'#8338ec' },
          { at:0.2, color:'#ff006e' },
          { at:0.55, color:'#ffb703' },
          { at:1, color:'#fb8500' }
        ], clamp(dusk * 0.85 + shimmer * 0.15, 0, 1));
        return lerpColor(base, gradient, 0.65);
      },
      wallColorFn(state, x, y, base){
        const baked = state.sampleNoise(x, y, { scale:0.18, octaves:2 });
        return lerpColor(base, '#432818', clamp(0.2 + baked * 0.4, 0, 0.6));
      },
      tags:['savanna','grassland','dusk','nature']
    },
    {
      id:'glacier-fjord',
      name:'蒼氷フィヨルド',
      description:'切り立つ氷壁と深い入江が連なるフィヨルド。氷河が削った溝に海水が満ちる。',
      floorColor:'#edf6f9',
      wallColor:'#14213d',
      accentColors:['#3a86ff','#a2d2ff','#8ecae6','#219ebc'],
      accentChance:0.1,
      floorType:'ice',
      baseWallChance:0.58,
      smoothing:{ steps:5, birthLimit:5, deathLimit:4 },
      afterShape(state){
        const fjords = 2 + Math.floor(state.width / 18);
        for(let i=0;i<fjords;i++){
          const start = { x: state.randomInt(2, state.width-3), y: 2 };
          state.carveRandomWalk({
            start,
            steps: state.height * 3,
            width:2,
            floorColor:'#8ecae6',
            floorType:'water',
            bias:{ target:{ x: state.randomInt(2, state.width-3), y: state.height-3 }, strength:0.6 }
          });
        }
        const glaciers = state.randomInt(3,4);
        for(let i=0;i<glaciers;i++){
          const cx = state.randomInt(3, state.width-4);
          const cy = state.randomInt(3, state.height-4);
          state.paintDisc(cx, cy, state.randomInt(2,3), (x,y)=>{
            state.open(x,y);
            state.markFloorColor(x,y,'#ade8f4');
            state.markFloorType(x,y,'ice');
          });
        }
      },
      decorate(state){
        const bergs = state.randomInt(5,7);
        for(let i=0;i<bergs;i++){
          const cx = state.randomInt(3, state.width-4);
          const cy = state.randomInt(3, state.height-4);
          state.paintDisc(cx, cy, state.randomInt(1,2), (x,y)=>{
            if(state.map[y][x] === 0){
              state.markFloorColor(x,y, brighten('#8ecae6', 0.25));
            }
          });
        }
      },
      floorColorFn(state, x, y, base){
        const chill = y / state.height;
        const noise = state.sampleNoise(x, y, { scale:0.1, octaves:3 });
        const gradient = gradientColor([
          { at:0, color:'#edf6f9' },
          { at:0.4, color:'#caf0f8' },
          { at:0.75, color:'#90e0ef' },
          { at:1, color:'#48cae4' }
        ], clamp(chill * 0.9 + noise * 0.1, 0, 1));
        return lerpColor(base, gradient, 0.7);
      },
      wallColorFn(state, x, y, base){
        const frost = Math.sin(x * 0.3) * Math.cos(y * 0.2) * 0.2 + 0.3;
        return lerpColor(base, '#03045e', clamp(frost, 0, 0.6));
      },
      tags:['ice','coast','mountain','nature']
    },
    {
      id:'luminous-lotus',
      name:'蛍光蓮湿原',
      description:'夜光を放つ蓮が水面を覆う湿原。薄霧に光が反射し幻想的な色彩を描く。',
      floorColor:'#caffbf',
      wallColor:'#22577a',
      accentColors:['#80ed99','#57cc99','#06d6a0','#ffcad4'],
      accentChance:0.16,
      floorType:'wetland',
      baseWallChance:0.54,
      smoothing:{ steps:4, birthLimit:4, deathLimit:3 },
      afterShape(state){
        const basins = state.randomInt(4,6);
        for(let i=0;i<basins;i++){
          const cx = state.randomInt(3, state.width-4);
          const cy = state.randomInt(3, state.height-4);
          const radius = state.randomInt(2,3);
          state.paintDisc(cx, cy, radius, (x,y)=>{
            state.open(x,y);
            state.markFloorColor(x,y,'#72efdd');
            state.markFloorType(x,y,'water');
          });
        }
      },
      decorate(state){
        const lotus = state.randomInt(8,12);
        for(let i=0;i<lotus;i++){
          const cx = state.randomInt(3, state.width-4);
          const cy = state.randomInt(3, state.height-4);
          state.paintDisc(cx, cy, 1, (x,y)=>{
            if(state.map[y][x] === 0){
              const pulse = state.sampleNoise(x, y, { scale:0.35, octaves:2 });
              const baseColor = state.randomChoice(['#ffcad4','#bde0fe','#80ffdb']);
              state.markFloorColor(x,y, adjustLightness(baseColor, clamp(pulse * 0.2, -0.1, 0.2)));
            }
          });
        }
      },
      floorColorFn(state, x, y, base){
        const mist = state.sampleNoise(x, y, { scale:0.15, octaves:3, persistence:0.55 });
        const gradient = gradientColor([
          { at:0, color:'#22577a' },
          { at:0.3, color:'#38a3a5' },
          { at:0.6, color:'#57cc99' },
          { at:1, color:'#c7f9cc' }
        ], clamp(mist, 0, 1));
        return lerpColor(base, gradient, 0.65);
      },
      wallColorFn(state, x, y, base){
        const glow = (Math.sin(x * 0.2) + Math.cos(y * 0.25)) * 0.1 + 0.25;
        return lerpColor(base, '#14213d', clamp(glow, 0, 0.5));
      },
      tags:['wetland','bioluminescent','water','nature']
    },
    {
      id:'azure-oasis',
      name:'蒼穹オアシス',
      description:'焼け付く砂丘に蒼い泉が散在する砂漠の安息地。砂紋が波打つ中に椰子が立つ。',
      floorColor:'#f1c27d',
      wallColor:'#8d5524',
      accentColors:['#e9c46a','#f4a261','#ffddc1','#2a9d8f'],
      accentChance:0.12,
      floorType:'sand',
      baseWallChance:0.53,
      smoothing:{ steps:4, birthLimit:4, deathLimit:3 },
      afterShape(state){
        const duneBands = clamp(Math.floor(state.height / 5), 3, 6);
        const bandHeight = Math.max(2, Math.floor((state.height-4) / duneBands));
        for(let b=0;b<duneBands;b++){
          const offset = state.randomInt(-1,1);
          const y0 = clamp(2 + b * bandHeight + offset, 2, state.height-4);
          const y1 = clamp(y0 + 1, 2, state.height-3);
          state.paintRect(2, y0, state.width-3, y1, (x,y)=>{
            if(state.random() < 0.68){
              state.wall(x,y);
              state.markWallColor(x,y, lerpColor('#8d5524', '#b08968', state.random() * 0.4));
            }
          });
        }
        const oasisCount = state.randomInt(2,3);
        for(let i=0;i<oasisCount;i++){
          const cx = state.randomInt(4, state.width-5);
          const cy = state.randomInt(4, state.height-5);
          const radius = state.randomInt(2,3);
          state.paintDisc(cx, cy, radius, (x,y)=>{
            state.open(x,y);
            state.markFloorColor(x,y,'#2a9d8f');
            state.markFloorType(x,y,'water');
          });
        }
      },
      decorate(state){
        const palms = state.randomInt(5,8);
        for(let i=0;i<palms;i++){
          const cx = state.randomInt(3, state.width-4);
          const cy = state.randomInt(3, state.height-4);
          state.paintDisc(cx, cy, 1, (x,y)=>{
            if(state.map[y][x] === 0 && state.random() < 0.65){
              state.markFloorColor(x,y,'#e9c46a');
              state.markFloorType(x,y,'palm');
            }
          });
        }
      },
      floorColorFn(state, x, y, base){
        const vertical = Math.abs(y - state.height/2) / (state.height/2);
        const mix = clamp(1 - vertical, 0, 1);
        const gradient = gradientColor([
          { at:0, color:'#f4a261' },
          { at:0.45, color:'#f1c27d' },
          { at:0.75, color:'#e9c46a' },
          { at:1, color:'#2a9d8f' }
        ], mix);
        const shimmer = state.sampleNoise(x, y, { scale:0.22, octaves:2, persistence:0.55 });
        return lerpColor(base, gradient, clamp(0.35 + shimmer * 0.35, 0.35, 0.7));
      },
      wallColorFn(state, x, y, base){
        const ripple = state.sampleNoise(x, y, { scale:0.18, octaves:1 });
        return lerpColor(base, '#b08968', clamp(0.2 + ripple * 0.3, 0, 0.5));
      },
      tags:['desert','oasis','sand','nature']
    },
    {
      id:'whispering-bamboo',
      name:'風鳴竹林',
      description:'風が囁く竹林に小川が流れる静謐な迷路。竹の幹が並び、苔の地面が柔らかい。',
      floorColor:'#a7c957',
      wallColor:'#283618',
      accentColors:['#ccd5ae','#d8f3dc','#80ed99','#6a994e'],
      accentChance:0.11,
      floorType:'moss',
      baseWallChance:0.48,
      smoothing:{ steps:4, birthLimit:4, deathLimit:3 },
      afterShape(state){
        const streamStart = { x: state.randomInt(2, state.width-3), y: 2 };
        state.carveRandomWalk({
          start: streamStart,
          steps: state.width * 2,
          width:1,
          floorColor:'#40916c',
          floorType:'water',
          bias:{ target:{ x: state.randomInt(2, state.width-3), y: state.height-3 }, strength:0.5 }
        });
        const lanes = clamp(Math.floor(state.width / 6), 3, 6);
        for(let i=0;i<lanes;i++){
          const laneX = clamp(Math.floor((i + 1) * state.width / (lanes + 1)), 2, state.width-3);
          state.paintRect(laneX-1, 2, laneX+1, state.height-3, (x,y)=>{
            if(state.random() < 0.8){
              state.open(x,y);
              if(state.random() < 0.15){
                state.markFloorColor(x,y,'#d8f3dc');
              }
            }
          });
        }
      },
      decorate(state){
        const groves = state.randomInt(6,9);
        for(let i=0;i<groves;i++){
          const cx = state.randomInt(3, state.width-4);
          const cy = state.randomInt(3, state.height-4);
          state.paintDisc(cx, cy, state.randomInt(1,2), (x,y)=>{
            if(state.map[y][x] === 0 && state.random() < 0.6){
              state.markFloorColor(x,y,'#ccd5ae');
              state.markFloorType(x,y,'bamboo');
            } else if(state.map[y][x] === 1 && state.random() < 0.4){
              state.markWallColor(x,y, lerpColor('#283618', '#1b4332', 0.3));
            }
          });
        }
      },
      floorColorFn(state, x, y, base){
        const sway = Math.sin((x + y) * 0.15) * 0.2 + 0.3;
        const mist = state.sampleNoise(x, y, { scale:0.16, octaves:3, persistence:0.5 });
        return lerpColor(base, '#74c69d', clamp(sway * 0.5 + mist * 0.3, 0, 0.6));
      },
      wallColorFn(state, x, y, base){
        const streak = (Math.sin(x * 0.3) + Math.cos(y * 0.25)) * 0.1 + 0.2;
        return lerpColor(base, '#1d2b1f', clamp(streak, 0, 0.4));
      },
      tags:['forest','bamboo','river','nature']
    },
    {
      id:'thunderhead-highlands',
      name:'雷雲高原',
      description:'切り立つ岩棚と稲妻に照らされた高原。窪地に雨水が溜まり、荒れた草が揺れる。',
      floorColor:'#ced4da',
      wallColor:'#2f3e46',
      accentColors:['#90e0ef','#dee2ff','#adb5bd','#f8f9fa'],
      accentChance:0.07,
      floorType:'stone',
      baseWallChance:0.51,
      smoothing:{ steps:4, birthLimit:4, deathLimit:4 },
      afterShape(state){
        const plateaus = state.randomInt(3,4);
        const heightBand = Math.max(3, Math.floor((state.height-4) / plateaus));
        for(let p=0;p<plateaus;p++){
          const y0 = 2 + p * heightBand;
          const y1 = Math.min(state.height-3, y0 + heightBand - 1);
          const shrink = state.randomInt(1,3);
          state.paintRect(2 + shrink, y0 + shrink, state.width-3 - shrink, y1 - shrink, (x,y)=>{
            if(state.random() < 0.8){
              state.open(x,y);
            }
          });
        }
        const basins = state.randomInt(2,3);
        for(let i=0;i<basins;i++){
          const cx = state.randomInt(3, state.width-4);
          const cy = state.randomInt(3, state.height-4);
          state.paintDisc(cx, cy, state.randomInt(1,2), (x,y)=>{
            state.open(x,y);
            state.markFloorColor(x,y,'#8ecae6');
            state.markFloorType(x,y,'water');
          });
        }
      },
      decorate(state){
        const scorch = state.randomInt(4,6);
        for(let i=0;i<scorch;i++){
          const cx = state.randomInt(3, state.width-4);
          const cy = state.randomInt(3, state.height-4);
          state.paintDisc(cx, cy, 1, (x,y)=>{
            if(state.map[y][x] === 0 && state.random() < 0.7){
              state.markFloorColor(x,y,'#ffd166');
            }
          });
        }
      },
      floorColorFn(state, x, y, base){
        const altitude = 1 - (y / state.height);
        const storm = state.sampleNoise(x, y, { scale:0.14, octaves:3, persistence:0.6 });
        const gradient = gradientColor([
          { at:0, color:'#495057' },
          { at:0.35, color:'#adb5bd' },
          { at:0.7, color:'#dee2ff' },
          { at:1, color:'#f8f9fa' }
        ], clamp(altitude, 0, 1));
        return lerpColor(base, gradient, clamp(0.4 + storm * 0.3, 0.3, 0.7));
      },
      wallColorFn(state, x, y, base){
        const rain = Math.sin((x + y) * 0.2) * 0.2 + 0.3;
        return lerpColor(base, '#1b263b', clamp(rain, 0, 0.5));
      },
      tags:['mountain','storm','plateau','nature']
    },
    {
      id:'crystal-cascades',
      name:'翠晶段瀑',
      description:'翡翠色の段瀑が幾重にも落ちる渓谷。水飛沫が光を乱反射し、水晶が岩壁を飾る。',
      floorColor:'#b2f7ef',
      wallColor:'#1b4965',
      accentColors:['#5fa8d3','#62b6cb','#bee9e8','#cae9ff'],
      accentChance:0.1,
      floorType:'stone',
      baseWallChance:0.56,
      smoothing:{ steps:5, birthLimit:5, deathLimit:4 },
      afterShape(state){
        const terraces = clamp(Math.floor(state.height / 6), 3, 5);
        const band = Math.max(3, Math.floor((state.height-4) / terraces));
        for(let t=0;t<terraces;t++){
          const yStart = 2 + t * band;
          const yEnd = Math.min(state.height-3, yStart + band - 2);
          state.paintRect(2, yStart, state.width-3, yEnd, (x,y)=>{
            if(state.random() < 0.7){
              state.open(x,y);
              if(state.random() < 0.1){
                state.markFloorColor(x,y,'#89c2d9');
              }
            }
          });
          state.paintRect(2, yEnd, state.width-3, Math.min(state.height-3, yEnd + 1), (x,y)=>{
            state.markFloorColor(x,y,'#48cae4');
            state.markFloorType(x,y,'water');
          });
        }
        const cascadeStart = { x: Math.floor(state.width/2), y: 2 };
        state.carveRandomWalk({
          start: cascadeStart,
          steps: state.height * 3,
          width:2,
          floorColor:'#56cfe1',
          floorType:'water',
          bias:{ target:{ x: Math.floor(state.width/2), y: state.height-3 }, strength:0.65 }
        });
      },
      decorate(state){
        const crystals = state.randomInt(6,10);
        for(let i=0;i<crystals;i++){
          const cx = state.randomInt(3, state.width-4);
          const cy = state.randomInt(3, state.height-4);
          state.paintDisc(cx, cy, 1, (x,y)=>{
            if(state.map[y][x] === 1 && state.random() < 0.7){
              state.markWallColor(x,y, brighten('#5fa8d3', 0.25));
            }
          });
        }
      },
      floorColorFn(state, x, y, base){
        const depth = y / state.height;
        const spray = state.sampleNoise(x, y, { scale:0.2, octaves:2, persistence:0.5 });
        const gradient = gradientColor([
          { at:0, color:'#caf0f8' },
          { at:0.45, color:'#90e0ef' },
          { at:0.75, color:'#48cae4' },
          { at:1, color:'#0096c7' }
        ], clamp(depth * 0.9 + spray * 0.1, 0, 1));
        return lerpColor(base, gradient, 0.7);
      },
      wallColorFn(state, x, y, base){
        const sheen = Math.sin(x * 0.25) * 0.15 + 0.25;
        return lerpColor(base, '#0d3b66', clamp(sheen, 0, 0.5));
      },
      tags:['waterfall','river','cliff','nature']
    },
    {
      id:'starfall-grotto',
      name:'星滴苔窟',
      description:'天井から滴る水滴が星のように輝く苔むした洞。静かな水盆が散在する。',
      floorColor:'#cfe1b9',
      wallColor:'#1b1b2f',
      accentColors:['#9a8c98','#9bf6ff','#e0afa0','#a3c4f3'],
      accentChance:0.09,
      floorType:'moss',
      baseWallChance:0.6,
      smoothing:{ steps:5, birthLimit:5, deathLimit:4 },
      afterShape(state){
        const chambers = state.randomInt(4,6);
        for(let i=0;i<chambers;i++){
          const cx = state.randomInt(3, state.width-4);
          const cy = state.randomInt(3, state.height-4);
          const radius = state.randomInt(2,4);
          state.paintDisc(cx, cy, radius, (x,y)=>{
            state.open(x,y);
            if(state.random() < 0.2){
              state.markFloorColor(x,y,'#80ed99');
            }
          });
        }
        const pools = state.randomInt(3,5);
        for(let i=0;i<pools;i++){
          const cx = state.randomInt(3, state.width-4);
          const cy = state.randomInt(3, state.height-4);
          state.paintDisc(cx, cy, state.randomInt(1,2), (x,y)=>{
            state.markFloorColor(x,y,'#74c69d');
            state.markFloorType(x,y,'water');
          });
        }
      },
      decorate(state){
        const glints = state.randomInt(8,12);
        for(let i=0;i<glints;i++){
          const x = state.randomInt(2, state.width-3);
          const y = state.randomInt(2, state.height-3);
          if(state.map[y][x] === 1 && state.random() < 0.5){
            state.markWallColor(x,y, adjustHue('#4cc9f0', (state.random() - 0.5) * 60));
          } else if(state.map[y][x] === 0 && state.random() < 0.4){
            state.markFloorColor(x,y, adjustLightness('#ffd6ff', state.random() * 0.2 - 0.1));
          }
        }
      },
      floorColorFn(state, x, y, base){
        const depth = y / state.height;
        const glow = state.sampleNoise(x, y, { scale:0.18, octaves:3, persistence:0.55 });
        const gradient = gradientColor([
          { at:0, color:'#1b4332' },
          { at:0.3, color:'#52b788' },
          { at:0.6, color:'#74c69d' },
          { at:1, color:'#d8f3dc' }
        ], clamp(glow, 0, 1));
        return lerpColor(base, gradient, clamp(0.45 + depth * 0.25, 0.45, 0.75));
      },
      wallColorFn(state, x, y, base){
        const sparkle = (Math.sin(x * 0.35) + Math.cos(y * 0.35)) * 0.1 + 0.25;
        return lerpColor(base, '#0f172a', clamp(sparkle, 0, 0.5));
      },
      tags:['cave','moss','water','nature']
    },
    {
      id:'spring-blossom-hills',
      name:'春霞桜丘',
      description:'霞む丘陵に桜が連なる春の迷路。花びらが舞い、段丘に小道が続く。',
      floorColor:'#ffd6ff',
      wallColor:'#5c5470',
      accentColors:['#ff9aa2','#fec5bb','#fde2e4','#cddafd'],
      accentChance:0.18,
      floorType:'petal',
      baseWallChance:0.42,
      smoothing:{ steps:3, birthLimit:4, deathLimit:3 },
      afterShape(state){
        const ridges = clamp(Math.floor(state.height / 7), 2, 4);
        for(let r=0;r<ridges;r++){
          const y = clamp(3 + Math.floor((r + 1) * state.height / (ridges + 2)), 3, state.height-4);
          state.paintRect(2, y-1, state.width-3, y+1, (x,y0)=>{
            state.open(x,y0);
            if(state.random() < 0.2){
              state.markFloorColor(x,y0,'#ffe5ec');
            }
          });
        }
        const springs = state.randomInt(2,3);
        for(let i=0;i<springs;i++){
          const cx = state.randomInt(3, state.width-4);
          const cy = state.randomInt(3, state.height-4);
          state.paintDisc(cx, cy, state.randomInt(1,2), (x,y)=>{
            state.open(x,y);
            state.markFloorColor(x,y,'#a5c9ca');
            state.markFloorType(x,y,'water');
          });
        }
      },
      decorate(state){
        const trees = state.randomInt(6,9);
        for(let i=0;i<trees;i++){
          const cx = state.randomInt(3, state.width-4);
          const cy = state.randomInt(3, state.height-4);
          state.paintDisc(cx, cy, 1, (x,y)=>{
            if(state.map[y][x] === 0 && state.random() < 0.7){
              state.markFloorColor(x,y,'#ffb5a7');
              state.markFloorType(x,y,'tree');
            } else if(state.map[y][x] === 1 && state.random() < 0.4){
              state.markWallColor(x,y, adjustLightness('#5c5470', -0.1));
            }
          });
        }
      },
      floorColorFn(state, x, y, base){
        const hill = Math.sin(x * 0.2) * 0.15 + Math.cos(y * 0.1) * 0.1 + 0.4;
        return lerpColor(base, '#fec5bb', clamp(hill, 0, 0.6));
      },
      wallColorFn(state, x, y, base){
        const bloom = state.sampleNoise(x, y, { scale:0.22, octaves:2 });
        return lerpColor(base, '#3d405b', clamp(0.2 + bloom * 0.4, 0, 0.5));
      },
      tags:['forest','spring','flower','nature']
    }
  ];

  const generators = themes.map(theme => ({
    id: theme.id,
    name: theme.name,
    description: theme.description,
    algorithm: createBiomeAlgorithm(theme),
    mixin: Object.assign({
      normalMixed: 0.45,
      blockDimMixed: 0.5,
      tags: theme.tags || ['nature']
    }, theme.mixinOverrides || {})
  }));

  const chestCycle = ['normal','more','less'];
  const blocks = { blocks1: [], blocks2: [], blocks3: [] };
  themes.forEach((theme, index) => {
    const levelBase = index * 6;
    blocks.blocks1.push({
      key:`nature_${theme.id}_theme`,
      name:`${theme.name} 探索`,
      level:+levelBase,
      size:index % 2 === 0 ? 0 : +1,
      depth:+1 + (index % 3 === 0 ? 0 : 1),
      chest:chestCycle[index % chestCycle.length],
      type:theme.id,
      bossFloors: index % 2 === 0 ? [5] : undefined
    });
    blocks.blocks2.push({
      key:`nature_${theme.id}_core`,
      name:`${theme.name} 中層`,
      level:+(levelBase + 4),
      size:+1 + (index % 2),
      depth:+1 + (index % 3 === 2 ? 1 : 0),
      chest:chestCycle[(index + 1) % chestCycle.length],
      type:theme.id
    });
    const bossFloors = [];
    if(levelBase >= 6) bossFloors.push(5);
    if(levelBase >= 12) bossFloors.push(10);
    if(levelBase >= 18) bossFloors.push(15);
    blocks.blocks3.push({
      key:`nature_${theme.id}_relic`,
      name:`${theme.name} 遺構`,
      level:+(levelBase + 8),
      size:index % 2 === 0 ? 0 : +1,
      depth:+2 + (index % 3 === 1 ? 1 : 0),
      chest:chestCycle[(index + 2) % chestCycle.length],
      type:theme.id,
      bossFloors: bossFloors.length ? bossFloors : undefined
    });
  });

  window.registerDungeonAddon({
    id: ADDON_ID,
    name: ADDON_NAME,
    nameKey: "dungeon.packs.nature_expansion_pack.name",
    version: VERSION,
    blocks,
    generators
  });
})();

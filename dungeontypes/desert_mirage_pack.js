// Addon: Desert Mirage Pack - adds 7 expressive desert dungeon generators
(function(){
  const PACK_ID = 'desert_mirage_pack';
  const PACK_NAME = 'Desert Mirage Pack';
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
      r: parseInt(normalized.slice(0, 2), 16),
      g: parseInt(normalized.slice(2, 4), 16),
      b: parseInt(normalized.slice(4, 6), 16)
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

  function pseudoNoise(x, y, scale, offset){
    const nx = x * scale + offset * 1.17;
    const ny = y * scale - offset * 0.83;
    return (Math.sin(nx) + Math.cos(ny) + Math.sin(nx * 0.7 + ny * 1.3)) / 3 * 0.5 + 0.5;
  }

  function randomChoice(random, array){
    if(!array || !array.length) return undefined;
    return array[Math.floor(random() * array.length) % array.length];
  }

  function createDesertAlgorithm(theme){
    return function(ctx){
      const W = ctx.width;
      const H = ctx.height;
      const map = ctx.map;
      const random = ctx.random;

      const keyFor = (x, y) => `${x},${y}`;
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
        seedA: random() * 997,
        seedB: random() * 577,
        inBounds(x, y){
          return x > 0 && y > 0 && x < W - 1 && y < H - 1;
        },
        openTile(x, y){
          if(this.inBounds(x, y)){
            map[y][x] = 0;
          }
        },
        wallTile(x, y){
          if(this.inBounds(x, y)){
            map[y][x] = 1;
          }
        },
        markFloorColor(x, y, color){
          if(this.inBounds(x, y)){
            overrides.floorColor.set(keyFor(x, y), color);
          }
        },
        markWallColor(x, y, color){
          if(this.inBounds(x, y)){
            overrides.wallColor.set(keyFor(x, y), color);
          }
        },
        markFloorType(x, y, type){
          if(this.inBounds(x, y)){
            overrides.floorType.set(keyFor(x, y), type);
          }
        },
        paintCircle(cx, cy, radius, callback){
          const rSq = radius * radius;
          for(let y = Math.max(1, cy - radius); y <= Math.min(H - 2, cy + radius); y++){
            for(let x = Math.max(1, cx - radius); x <= Math.min(W - 2, cx + radius); x++){
              const dx = x - cx;
              const dy = y - cy;
              if(dx * dx + dy * dy <= rSq){
                if(callback){
                  callback(x, y, this);
                } else {
                  map[y][x] = 0;
                }
              }
            }
          }
        },
        paintEllipse(cx, cy, radiusX, radiusY, callback){
          const rx = Math.max(1, radiusX);
          const ry = Math.max(1, radiusY);
          for(let y = Math.max(1, cy - ry); y <= Math.min(H - 2, cy + ry); y++){
            for(let x = Math.max(1, cx - rx); x <= Math.min(W - 2, cx + rx); x++){
              const dx = (x - cx) / rx;
              const dy = (y - cy) / ry;
              if(dx * dx + dy * dy <= 1){
                if(callback){
                  callback(x, y, this);
                } else {
                  map[y][x] = 0;
                }
              }
            }
          }
        },
        carvePath(points, radius, callback){
          if(!Array.isArray(points) || points.length < 2) return;
          for(let i = 0; i < points.length - 1; i++){
            const [x0, y0] = points[i];
            const [x1, y1] = points[i + 1];
            const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
            for(let s = 0; s <= steps; s++){
              const t = steps === 0 ? 0 : s / steps;
              const x = Math.round(x0 + (x1 - x0) * t);
              const y = Math.round(y0 + (y1 - y0) * t);
              this.paintCircle(x, y, radius, (px, py) => {
                if(callback){
                  callback(px, py, this);
                } else {
                  this.openTile(px, py);
                }
              });
            }
          }
        },
        scatter(count, handler){
          for(let i = 0; i < count; i++){
            const x = 1 + Math.floor(random() * (W - 2));
            const y = 1 + Math.floor(random() * (H - 2));
            handler(x, y, i, this);
          }
        }
      };

      for(let y = 0; y < H; y++){
        for(let x = 0; x < W; x++){
          if(x === 0 || y === 0 || x === W - 1 || y === H - 1){
            map[y][x] = 1;
          } else {
            map[y][x] = 0;
          }
        }
      }

      const offset = random() * Math.PI * 2;
      const scaleX = theme.noiseScaleX != null ? theme.noiseScaleX : 0.11;
      const scaleY = theme.noiseScaleY != null ? theme.noiseScaleY : 0.085;
      const threshold = theme.noiseThreshold != null ? theme.noiseThreshold : 0.42;
      const duneScale = theme.duneScale != null ? theme.duneScale : 5.6;
      const duneIntensity = theme.duneIntensity != null ? theme.duneIntensity : 0.28;
      const duneBias = theme.duneBias != null ? theme.duneBias : 0.12;

      for(let y = 1; y < H - 1; y++){
        const t = y / Math.max(1, H - 1);
        const band = Math.sin((t * Math.PI * (theme.duneWaves || 3)) + offset) * duneIntensity;
        const bias = Math.sin((y / (duneScale * 1.3)) + offset * 0.7) * duneBias;
        for(let x = 1; x < W - 1; x++){
          const baseNoise = Math.sin((x * scaleX) + offset) * 0.45 + Math.cos((y * scaleY) - offset) * 0.45;
          const diagNoise = Math.sin((x + y) * scaleX * 0.35 + offset * 0.5) * 0.25;
          const ridgeNoise = Math.sin((x - y) * 0.08 + offset * 0.3) * 0.18;
          const value = baseNoise + diagNoise + ridgeNoise + band + bias;
          if(value > threshold){
            map[y][x] = 1;
          }
        }
      }

      if(typeof theme.baseCarve === 'function'){
        theme.baseCarve(state);
      }

      if(typeof theme.features === 'function'){
        theme.features(state);
      }

      if(typeof theme.afterFeatures === 'function'){
        theme.afterFeatures(state);
      }

      for(let y = 0; y < H; y++){
        for(let x = 0; x < W; x++){
          const key = keyFor(x, y);
          if(map[y][x] === 0){
            let color;
            if(overrides.floorColor.has(key)){
              color = overrides.floorColor.get(key);
            } else {
              let base = theme.floorColor;
              if(theme.floorHighlight){
                const grad = y / Math.max(1, H - 1);
                base = lerpColor(theme.floorColor, theme.floorHighlight, grad);
              }
              if(typeof theme.floorColorFn === 'function'){
                base = theme.floorColorFn(state, x, y, base);
              }
              color = base;
            }
            ctx.setFloorColor(x, y, color);

            let type;
            if(overrides.floorType.has(key)){
              type = overrides.floorType.get(key);
            } else {
              type = theme.floorType || 'sand';
              if(typeof theme.floorTypeFn === 'function'){
                type = theme.floorTypeFn(state, x, y, type);
              }
            }
            if(type){
              ctx.setFloorType(x, y, type);
            }
          } else {
            let color;
            if(overrides.wallColor.has(key)){
              color = overrides.wallColor.get(key);
            } else {
              let base = theme.wallColor;
              if(theme.wallHighlight){
                const grad = y / Math.max(1, H - 1);
                base = lerpColor(theme.wallColor, theme.wallHighlight, grad);
              }
              if(typeof theme.wallColorFn === 'function'){
                base = theme.wallColorFn(state, x, y, base);
              }
              color = base;
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
      id: 'realistic-dunes',
      name: 'リアル砂漠',
      description: '風紋とワジが走る現実的な砂丘地帯',
      floorColor: '#d7b98c',
      floorHighlight: '#f5e2b8',
      wallColor: '#9f7b4f',
      wallHighlight: '#caa46a',
      floorType: 'sand',
      tags: ['field', 'desert', 'realistic'],
      duneScale: 5.2,
      duneIntensity: 0.32,
      noiseThreshold: 0.44,
      features(state){
        const wadiCount = 2 + Math.floor(state.random() * 2);
        for(let i = 0; i < wadiCount; i++){
          const startX = 2 + Math.floor(state.random() * (state.width - 4));
          const points = [];
          let x = startX;
          let y = 1;
          while(y < state.height - 2){
            points.push([x, y]);
            x += Math.floor(state.random() * 5) - 2;
            y += 1 + Math.floor(state.random() * 2);
            x = clamp(x, 2, state.width - 3);
          }
          points.push([x, state.height - 2]);
          state.carvePath(points, 2, (px, py, s) => {
            s.openTile(px, py);
            if(s.random() < 0.25){
              s.markFloorColor(px, py, '#dec891');
            }
          });
        }
        const rockClusters = 6 + Math.floor(state.random() * 5);
        for(let i = 0; i < rockClusters; i++){
          const cx = 2 + Math.floor(state.random() * (state.width - 4));
          const cy = 2 + Math.floor(state.random() * (state.height - 4));
          const radius = 1 + Math.floor(state.random() * 2);
          state.paintCircle(cx, cy, radius, (x, y, s) => {
            s.wallTile(x, y);
            s.markWallColor(x, y, '#b48e5f');
          });
        }
      },
      floorColorFn(state, x, y, base){
        const override = state.overrides.floorColor.get(state.keyFor(x, y));
        if(override) return override;
        const n = pseudoNoise(x, y, 0.07, state.seedA);
        return lerpColor(base, lighten(base, 0.18), n * 0.35);
      },
      wallColorFn(state, x, y, base){
        const override = state.overrides.wallColor.get(state.keyFor(x, y));
        if(override) return override;
        const n = pseudoNoise(x + 31, y, 0.09, state.seedB);
        return lerpColor(base, darken(base, 0.2), n * 0.4);
      }
    },
    {
      id: 'mirage-oasis',
      name: '美麗砂漠',
      description: '蜃気楼と花が彩る幻想的な砂漠のオアシス',
      floorColor: '#f6d9a9',
      floorHighlight: '#ffe8d0',
      wallColor: '#c6975c',
      wallHighlight: '#e7c89a',
      floorType: 'sand',
      tags: ['field', 'desert', 'beauty'],
      duneScale: 6.8,
      duneIntensity: 0.18,
      noiseThreshold: 0.46,
      features(state){
        const oasisCount = 3 + Math.floor(state.random() * 2);
        for(let i = 0; i < oasisCount; i++){
          const cx = 3 + Math.floor(state.random() * (state.width - 6));
          const cy = 3 + Math.floor(state.random() * (state.height - 6));
          const radius = 2 + Math.floor(state.random() * 2);
          state.paintCircle(cx, cy, radius + 1, (x, y, s) => {
            const dist = Math.hypot(x - cx, y - cy);
            if(dist <= radius - 0.5){
              s.openTile(x, y);
              s.markFloorColor(x, y, '#7cd8d1');
              s.markFloorType(x, y, 'water');
            } else if(dist <= radius + 0.5){
              s.openTile(x, y);
              s.markFloorColor(x, y, '#e3f6c3');
              s.markFloorType(x, y, 'grass');
            } else if(dist <= radius + 1.5 && s.random() < 0.25){
              s.wallTile(x, y);
              s.markWallColor(x, y, '#3f7f63');
            } else {
              s.openTile(x, y);
            }
          });
        }
        state.scatter(28, (x, y, i, s) => {
          if(s.map[y][x] === 0 && s.random() < 0.28){
            const blossom = randomChoice(s.random, ['#ffd1dc', '#ffe97d', '#d4f6ff']);
            s.markFloorColor(x, y, blossom);
          }
        });
      },
      floorColorFn(state, x, y, base){
        const override = state.overrides.floorColor.get(state.keyFor(x, y));
        if(override) return override;
        const wave = Math.sin((x + y) * 0.25 + state.seedA * 0.1) * 0.15;
        return lerpColor(base, lighten(base, 0.25), clamp(0.2 + wave, 0, 0.6));
      },
      wallColorFn(state, x, y, base){
        const override = state.overrides.wallColor.get(state.keyFor(x, y));
        if(override) return override;
        const shimmer = Math.sin(y * 0.3 + state.seedB * 0.2) * 0.1;
        return lerpColor(base, lighten(base, 0.18), clamp(0.3 + shimmer, 0, 0.6));
      }
    },
    {
      id: 'crimson-erg',
      name: '赤砂の大地',
      description: '赤い砂丘と断層が連なる灼熱の大地',
      floorColor: '#c86d4a',
      floorHighlight: '#f3a16d',
      wallColor: '#7b301e',
      wallHighlight: '#a74b34',
      floorType: 'sand',
      tags: ['field', 'desert', 'red'],
      duneScale: 4.6,
      duneIntensity: 0.42,
      noiseThreshold: 0.38,
      features(state){
        const ridges = 4 + Math.floor(state.random() * 3);
        for(let i = 0; i < ridges; i++){
          const startY = 2 + Math.floor(state.random() * (state.height - 4));
          const points = [];
          let x = 2;
          let y = startY;
          while(x < state.width - 2){
            points.push([x, y]);
            x += 1 + Math.floor(state.random() * 2);
            y += Math.floor(state.random() * 3) - 1;
            y = clamp(y, 2, state.height - 3);
          }
          state.carvePath(points, 1, (px, py, s) => {
            s.wallTile(px, py);
            s.markWallColor(px, py, '#8d3b27');
          });
        }
        const canyons = 2 + Math.floor(state.random() * 2);
        for(let i = 0; i < canyons; i++){
          const startX = 2 + Math.floor(state.random() * (state.width - 4));
          const points = [];
          let x = startX;
          let y = 1;
          while(y < state.height - 2){
            points.push([x, y]);
            x += Math.floor(state.random() * 5) - 2;
            y += 1 + Math.floor(state.random() * 2);
            x = clamp(x, 2, state.width - 3);
          }
          state.carvePath(points, 2, (px, py, s) => {
            s.openTile(px, py);
            if(s.random() < 0.18){
              s.markFloorColor(px, py, '#f3b38a');
            }
          });
        }
      },
      floorColorFn(state, x, y, base){
        const override = state.overrides.floorColor.get(state.keyFor(x, y));
        if(override) return override;
        const n = pseudoNoise(x + y, y, 0.09, state.seedA);
        return lerpColor(base, lighten(base, 0.22), clamp(n * 0.6, 0, 0.7));
      },
      wallColorFn(state, x, y, base){
        const override = state.overrides.wallColor.get(state.keyFor(x, y));
        if(override) return override;
        const n = pseudoNoise(x * 1.3, y * 0.8, 0.12, state.seedB);
        return lerpColor(base, darken(base, 0.25), clamp(n * 0.5, 0, 0.6));
      }
    },
    {
      id: 'stone-wastes',
      name: '岩石砂漠',
      description: '乾いた岩盤が露出した重厚な砂漠地帯',
      floorColor: '#d8c6ae',
      floorHighlight: '#f0e6d1',
      wallColor: '#6f5b4a',
      wallHighlight: '#8f7460',
      floorType: 'stone',
      tags: ['field', 'desert', 'rock'],
      duneIntensity: 0.2,
      noiseThreshold: 0.48,
      features(state){
        const mesas = 5 + Math.floor(state.random() * 4);
        for(let i = 0; i < mesas; i++){
          const cx = 3 + Math.floor(state.random() * (state.width - 6));
          const cy = 3 + Math.floor(state.random() * (state.height - 6));
          const radius = 2 + Math.floor(state.random() * 2);
          state.paintCircle(cx, cy, radius, (x, y, s) => {
            s.wallTile(x, y);
            s.markWallColor(x, y, '#7f6955');
          });
          state.paintCircle(cx, cy, Math.max(1, radius - 1), (x, y, s) => {
            s.openTile(x, y);
            s.markFloorColor(x, y, '#e4d6bd');
            s.markFloorType(x, y, 'sand');
          });
        }
        const fissures = 3 + Math.floor(state.random() * 2);
        for(let i = 0; i < fissures; i++){
          const startX = 2 + Math.floor(state.random() * (state.width - 4));
          const points = [];
          let x = startX;
          let y = 1;
          while(y < state.height - 2){
            points.push([x, y]);
            x += Math.floor(state.random() * 3) - 1;
            y += 1 + Math.floor(state.random() * 2);
            x = clamp(x, 2, state.width - 3);
          }
          state.carvePath(points, 1, (px, py, s) => {
            s.openTile(px, py);
            s.markFloorColor(px, py, '#d0c1a7');
            if(s.random() < 0.15){
              s.markFloorType(px, py, 'gravel');
            }
          });
        }
      },
      floorColorFn(state, x, y, base){
        const override = state.overrides.floorColor.get(state.keyFor(x, y));
        if(override) return override;
        const n = pseudoNoise(x * 0.9, y * 0.9, 0.06, state.seedA);
        return lerpColor(base, darken(base, 0.12), clamp(n * 0.5, 0, 0.5));
      },
      wallColorFn(state, x, y, base){
        const override = state.overrides.wallColor.get(state.keyFor(x, y));
        if(override) return override;
        const n = pseudoNoise(x, y, 0.08, state.seedB);
        return lerpColor(base, darken(base, 0.3), clamp(n * 0.6, 0, 0.7));
      }
    },
    {
      id: 'moonlit-sands',
      name: '月光砂漠',
      description: '夜風に揺れる砂丘と蒼白い光が漂う砂漠',
      floorColor: '#d8dbe8',
      floorHighlight: '#f2f5ff',
      wallColor: '#5d627f',
      wallHighlight: '#8e93b2',
      floorType: 'sand',
      tags: ['field', 'desert', 'night'],
      duneScale: 6.2,
      duneIntensity: 0.24,
      noiseThreshold: 0.45,
      dark: true,
      features(state){
        const shimmerPaths = 3 + Math.floor(state.random() * 2);
        for(let i = 0; i < shimmerPaths; i++){
          const startX = 2 + Math.floor(state.random() * (state.width - 4));
          const points = [];
          let x = startX;
          let y = 1;
          while(y < state.height - 2){
            points.push([x, y]);
            x += Math.floor(state.random() * 5) - 2;
            y += 1 + Math.floor(state.random() * 3);
            x = clamp(x, 2, state.width - 3);
          }
          state.carvePath(points, 2, (px, py, s) => {
            s.openTile(px, py);
            s.markFloorColor(px, py, '#b8c5ff');
          });
        }
        state.scatter(24, (x, y, i, s) => {
          if(s.map[y][x] === 1 && s.random() < 0.22){
            s.wallTile(x, y);
            s.markWallColor(x, y, '#3f4564');
          }
        });
      },
      floorColorFn(state, x, y, base){
        const override = state.overrides.floorColor.get(state.keyFor(x, y));
        if(override) return override;
        const dist = Math.sqrt(Math.pow(x - state.width / 2, 2) + Math.pow(y - state.height / 2, 2));
        const glow = clamp(1 - dist / (Math.min(state.width, state.height) * 0.7), 0, 1);
        const twinkle = Math.sin((x + y) * 0.35 + state.seedA * 0.2) * 0.2;
        return lerpColor(base, '#f8fbff', clamp(glow * 0.6 + twinkle * 0.3, 0, 0.8));
      },
      wallColorFn(state, x, y, base){
        const override = state.overrides.wallColor.get(state.keyFor(x, y));
        if(override) return override;
        const shimmer = Math.sin(y * 0.25 + state.seedB * 0.3) * 0.2;
        return lerpColor(base, '#3a3f58', clamp(shimmer * 0.5 + 0.4, 0, 0.8));
      }
    },
    {
      id: 'azure-salt-basin',
      name: '青晶砂漠',
      description: '塩湖と蒼い結晶がきらめく幻想的な砂漠盆地',
      floorColor: '#efe7db',
      floorHighlight: '#ffffff',
      wallColor: '#7f7260',
      wallHighlight: '#a89a82',
      floorType: 'sand',
      tags: ['field', 'desert', 'salt'],
      duneScale: 7.2,
      duneIntensity: 0.16,
      noiseThreshold: 0.5,
      features(state){
        const basins = 3 + Math.floor(state.random() * 2);
        for(let i = 0; i < basins; i++){
          const cx = 3 + Math.floor(state.random() * (state.width - 6));
          const cy = 3 + Math.floor(state.random() * (state.height - 6));
          const rx = 3 + Math.floor(state.random() * 3);
          const ry = 2 + Math.floor(state.random() * 3);
          state.paintEllipse(cx, cy, rx, ry, (x, y, s) => {
            s.openTile(x, y);
            const nx = (x - cx) / rx;
            const ny = (y - cy) / ry;
            const dist = Math.sqrt(nx * nx + ny * ny);
            if(dist < 0.7){
              s.markFloorColor(x, y, '#bfe8f7');
              s.markFloorType(x, y, 'water');
            } else if(dist < 0.95){
              s.markFloorColor(x, y, '#f6f4ec');
              s.markFloorType(x, y, 'sand');
            } else if(s.random() < 0.2){
              s.wallTile(x, y);
              s.markWallColor(x, y, '#6fb0c9');
            }
          });
        }
        state.scatter(20, (x, y, i, s) => {
          if(s.map[y][x] === 0 && s.random() < 0.18){
            s.markFloorColor(x, y, '#dff6ff');
          }
        });
      },
      floorColorFn(state, x, y, base){
        const override = state.overrides.floorColor.get(state.keyFor(x, y));
        if(override) return override;
        const n = pseudoNoise(x * 0.7, y * 0.7, 0.05, state.seedA);
        return lerpColor(base, '#f8ffff', clamp(0.3 + n * 0.5, 0, 0.8));
      },
      wallColorFn(state, x, y, base){
        const override = state.overrides.wallColor.get(state.keyFor(x, y));
        if(override) return override;
        const n = pseudoNoise(x + 91, y + 47, 0.1, state.seedB);
        return lerpColor(base, '#547a8a', clamp(0.4 + n * 0.4, 0, 0.8));
      }
    },
    {
      id: 'sunken-canyon',
      name: '峡谷砂漠',
      description: '深い浸食谷と岩棚が入り組む壮大な砂漠峡谷',
      floorColor: '#e0c79f',
      floorHighlight: '#f5e7c5',
      wallColor: '#8b5e38',
      wallHighlight: '#b88552',
      floorType: 'sand',
      tags: ['field', 'desert', 'canyon'],
      duneScale: 5.8,
      duneIntensity: 0.26,
      noiseThreshold: 0.43,
      features(state){
        const canyonCount = 3 + Math.floor(state.random() * 2);
        for(let i = 0; i < canyonCount; i++){
          const startX = 2 + Math.floor(state.random() * (state.width - 4));
          const points = [];
          let x = startX;
          let y = 1;
          while(y < state.height - 2){
            points.push([x, y]);
            x += Math.floor(state.random() * 5) - 2;
            y += 1 + Math.floor(state.random() * 3);
            x = clamp(x, 2, state.width - 3);
          }
          state.carvePath(points, 3, (px, py, s) => {
            s.openTile(px, py);
            s.markFloorColor(px, py, '#e8d7b1');
            if(s.random() < 0.2){
              s.markFloorType(px, py, 'stone');
            }
          });
        }
        const ledges = 5 + Math.floor(state.random() * 3);
        for(let i = 0; i < ledges; i++){
          const cx = 2 + Math.floor(state.random() * (state.width - 4));
          const cy = 2 + Math.floor(state.random() * (state.height - 4));
          state.paintCircle(cx, cy, 1 + Math.floor(state.random() * 2), (x, y, s) => {
            if(s.random() < 0.5){
              s.wallTile(x, y);
              s.markWallColor(x, y, '#a06c40');
            }
          });
        }
      },
      floorColorFn(state, x, y, base){
        const override = state.overrides.floorColor.get(state.keyFor(x, y));
        if(override) return override;
        const gradient = y / Math.max(1, state.height - 1);
        const n = pseudoNoise(x, y, 0.06, state.seedA);
        return lerpColor(base, darken(base, 0.18), clamp(gradient * 0.4 + n * 0.3, 0, 0.8));
      },
      wallColorFn(state, x, y, base){
        const override = state.overrides.wallColor.get(state.keyFor(x, y));
        if(override) return override;
        const n = pseudoNoise(x + 17, y + 53, 0.08, state.seedB);
        return lerpColor(base, darken(base, 0.22), clamp(n * 0.6, 0, 0.7));
      }
    }
  ];

  const generators = themes.map(theme => ({
    id: theme.id,
    name: theme.name,
    description: theme.description,
    algorithm: createDesertAlgorithm(theme),
    dark: !!theme.dark,
    mixin: {
      normalMixed: theme.normalMixed != null ? theme.normalMixed : 0.45,
      blockDimMixed: theme.blockDimMixed != null ? theme.blockDimMixed : 0.55,
      tags: theme.tags || ['field', 'desert']
    }
  }));

  function mkBoss(depth){
    const result = [];
    if(depth >= 5) result.push(5);
    if(depth >= 10) result.push(10);
    if(depth >= 15) result.push(15);
    return result;
  }

  const chestCycle = ['normal', 'less', 'more'];
  const blocks = { blocks1: [], blocks2: [], blocks3: [] };
  themes.forEach((theme, index) => {
    const levelBase = index * 4;
    blocks.blocks1.push({
      key: `desert_${theme.id}_expedition`,
      name: `${theme.name} 探検`,
      level: +(levelBase),
      size: index % 3 === 0 ? 0 : (index % 3 === 1 ? +1 : +2),
      depth: +1 + (index % 2 === 0 ? 0 : +1),
      chest: chestCycle[index % chestCycle.length],
      type: theme.id,
      bossFloors: mkBoss(6 + index)
    });
    blocks.blocks2.push({
      key: `desert_${theme.id}_core`,
      name: `${theme.name} 核`,
      level: +(levelBase + 3),
      size: +1 + (index % 2 === 0 ? 0 : +1),
      depth: +(index % 3 === 0 ? 0 : 1),
      chest: chestCycle[(index + 1) % chestCycle.length],
      type: theme.id
    });
    const bossDepth = 7 + index;
    const floors = [];
    if(bossDepth >= 5) floors.push(5);
    if(bossDepth >= 9) floors.push(9);
    if(bossDepth >= 13) floors.push(13);
    blocks.blocks3.push({
      key: `desert_${theme.id}_relic`,
      name: `${theme.name} 遺構`,
      level: +(levelBase + 6),
      size: index % 2 === 0 ? 0 : +1,
      depth: +2 + (index % 3 === 2 ? +1 : 0),
      chest: chestCycle[(index + 2) % chestCycle.length],
      type: theme.id,
      bossFloors: floors.length ? floors : undefined
    });
  });

  window.registerDungeonAddon({
    id: PACK_ID,
    name: PACK_NAME,
    nameKey: "dungeon.packs.desert_mirage_pack.name",
    version: VERSION,
    blocks,
    generators
  });
})();

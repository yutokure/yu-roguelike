// Addon: Traditional Japan Expansion Pack - rich variety of Japanese-inspired dungeon biomes
(function(){
  function sanitizeKey(value){
    return (value || '').toString().trim().replace(/[^a-z0-9]+/gi, '_').toLowerCase();
  }

  function applyThemeLocalization(theme){
    const typeKey = sanitizeKey(theme.id);
    const localized = Object.assign({}, theme);
    localized.nameKey = `dungeon.types.${typeKey}.name`;
    if(theme.description){
      localized.descriptionKey = `dungeon.types.${typeKey}.description`;
    }
    return localized;
  }

  function buildBlockEntry(config, data){
    if(!data || !data.key){
      throw new Error('Block entry requires a key');
    }
    const entry = Object.assign({ type: config.id }, data);
    const typeKey = sanitizeKey(config.id);
    entry.nameKey = `dungeon.types.${typeKey}.blocks.${data.key}.name`;
    if(entry.description){
      entry.descriptionKey = `dungeon.types.${typeKey}.blocks.${data.key}.description`;
    }
    return entry;
  }

  function createState(ctx){
    const { width, height, map, random } = ctx;
    const seedA = random() * Math.PI * 2;
    const seedB = random() * Math.PI * 2;
    const keyFor = (x,y) => `${x},${y}`;
    return {
      ctx,
      width,
      height,
      map,
      random,
      keyFor,
      floorColors: new Map(),
      floorTypes: new Map(),
      wallColors: new Map(),
      inBounds(x,y){
        return x > 0 && y > 0 && x < width - 1 && y < height - 1;
      },
      carveTile(x,y){
        if(this.inBounds(x,y)) this.map[y][x] = 0;
      },
      wallTile(x,y){
        if(this.inBounds(x,y)) this.map[y][x] = 1;
      },
      carveCircle(cx, cy, radius, callback){
        const r2 = radius * radius;
        for(let y = Math.max(1, cy - radius); y <= Math.min(this.height - 2, cy + radius); y++){
          for(let x = Math.max(1, cx - radius); x <= Math.min(this.width - 2, cx + radius); x++){
            const dx = x - cx;
            const dy = y - cy;
            if(dx*dx + dy*dy <= r2){
              this.carveTile(x,y);
              if(callback) callback(x,y);
            }
          }
        }
      },
      carveRect(x1, y1, x2, y2, callback){
        const minX = Math.max(1, Math.min(x1, x2));
        const maxX = Math.min(this.width - 2, Math.max(x1, x2));
        const minY = Math.max(1, Math.min(y1, y2));
        const maxY = Math.min(this.height - 2, Math.max(y1, y2));
        for(let y = minY; y <= maxY; y++){
          for(let x = minX; x <= maxX; x++){
            this.carveTile(x,y);
            if(callback) callback(x,y);
          }
        }
      },
      carvePath(points, radius, callback){
        if(!points || points.length < 2) return;
        const r = Math.max(1, radius || 1);
        for(let i=0;i<points.length-1;i++){
          const [x1,y1] = points[i];
          const [x2,y2] = points[i+1];
          const steps = Math.max(1, Math.max(Math.abs(x2-x1), Math.abs(y2-y1)) * 2);
          for(let s=0;s<=steps;s++){
            const t = s/steps;
            const x = Math.round(x1 + (x2 - x1) * t);
            const y = Math.round(y1 + (y2 - y1) * t);
            this.carveCircle(x,y,r,callback);
          }
        }
      },
      scatter(count, callback){
        for(let i=0;i<count;i++){
          const x = 1 + Math.floor(this.random() * (this.width - 2));
          const y = 1 + Math.floor(this.random() * (this.height - 2));
          callback(x,y);
        }
      },
      setFloorColor(x,y,color){
        if(color) this.floorColors.set(this.keyFor(x,y), color);
      },
      setFloorType(x,y,type){
        if(type) this.floorTypes.set(this.keyFor(x,y), type);
      },
      setWallColor(x,y,color){
        if(color) this.wallColors.set(this.keyFor(x,y), color);
      },
      noise(x,y,scale){
        const s = scale || 6;
        return Math.sin((x + seedA) / s) + Math.cos((y + seedB) / s);
      }
    };
  }

  function hexToRgb(hex){
    if(!hex) return { r: 0, g: 0, b: 0 };
    const normalized = hex.replace('#','');
    const full = normalized.length === 3 ? normalized.split('').map(c=>c+c).join('') : normalized.padEnd(6, '0');
    const value = parseInt(full, 16);
    return {
      r: (value >> 16) & 255,
      g: (value >> 8) & 255,
      b: value & 255
    };
  }

  function rgbToHex(r,g,b){
    const toHex = (v) => {
      const clamped = Math.max(0, Math.min(255, Math.round(v)));
      return clamped.toString(16).padStart(2, '0');
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  function blendHex(a, b, t){
    const mix = Math.max(0, Math.min(1, t));
    const ca = hexToRgb(a || '#000000');
    const cb = hexToRgb(b || '#000000');
    return rgbToHex(
      ca.r + (cb.r - ca.r) * mix,
      ca.g + (cb.g - ca.g) * mix,
      ca.b + (cb.b - ca.b) * mix
    );
  }

  function paletteGradient(palette, t){
    if(!palette || palette.length === 0) return '#ffffff';
    if(palette.length === 1) return palette[0];
    const range = Math.max(0, Math.min(1, t)) * (palette.length - 1);
    const idx = Math.floor(range);
    const nextIdx = Math.min(palette.length - 1, idx + 1);
    const localT = range - idx;
    return blendHex(palette[idx], palette[nextIdx], localT);
  }

  function jitterColor(color, amount, random){
    const base = hexToRgb(color || '#000000');
    const n = random ? random() : Math.random();
    const n2 = random ? random() : Math.random();
    const n3 = random ? random() : Math.random();
    return rgbToHex(
      base.r + (n - 0.5) * amount,
      base.g + (n2 - 0.5) * amount,
      base.b + (n3 - 0.5) * amount
    );
  }

  function smooth(map, W, H){
    const next = map.map(row => row.slice());
    for(let y=1;y<H-1;y++){
      for(let x=1;x<W-1;x++){
        let walls = 0;
        for(let oy=-1; oy<=1; oy++){
          for(let ox=-1; ox<=1; ox++){
            if(ox === 0 && oy === 0) continue;
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

  function createJapaneseAlgorithm(theme){
    return function(ctx){
      const { width: W, height: H, map, random } = ctx;

      for(let y=0;y<H;y++){
        for(let x=0;x<W;x++){
          if(x===0 || y===0 || x===W-1 || y===H-1){
            map[y][x] = 1;
          } else {
            map[y][x] = random() < (theme.baseDensity != null ? theme.baseDensity : 0.52) ? 1 : 0;
          }
        }
      }

      const smoothing = theme.smoothing != null ? theme.smoothing : 4;
      for(let i=0;i<smoothing;i++) smooth(map, W, H);

      const state = createState(ctx);

      if(theme.centralClearing){
        const margin = Math.max(2, Math.floor(Math.min(W, H) * theme.centralClearing));
        state.carveRect(margin, margin, W - 1 - margin, H - 1 - margin);
      }

      if(theme.sculpt){
        theme.sculpt(state);
      }

      if(theme.decorate){
        theme.decorate(state);
      }

      const floorDefault = theme.floorColor || '#d7cbb4';
      const wallDefault = theme.wallColor || '#3d2a1c';

      for(let y=0;y<H;y++){
        for(let x=0;x<W;x++){
          const key = state.keyFor(x,y);
          if(map[y][x] === 0){
            let color = floorDefault;
            if(theme.floorColorFn){
              color = theme.floorColorFn(state, x, y, color);
            }
            if(state.floorColors.has(key)){
              color = state.floorColors.get(key);
            }
            ctx.setFloorColor(x, y, color);
            let type = theme.floorType || null;
            if(theme.floorTypeFn){
              type = theme.floorTypeFn(state, x, y, type);
            }
            if(state.floorTypes.has(key)){
              type = state.floorTypes.get(key);
            }
            if(type){
              ctx.setFloorType(x, y, type);
            }
          } else {
            let color = wallDefault;
            if(theme.wallColorFn){
              color = theme.wallColorFn(state, x, y, color);
            }
            if(state.wallColors.has(key)){
              color = state.wallColors.get(key);
            }
            ctx.setWallColor(x, y, color);
          }
        }
      }

      if(theme.postProcess){
        theme.postProcess(state);
      }

      ctx.ensureConnectivity();
    };
  }

  const themes = [
    {
      id:'sakura-ravine',
      name:'桜渓谷',
      description:'桜花の舞い散る渓流と小橋が続く迷宮',
      baseDensity:0.54,
      smoothing:4,
      floorColor:'#f8d9e9',
      wallColor:'#5c3a3f',
      tags:['nature','sakura','river','japan'],
      sculpt(state){
        const amplitude = Math.max(3, Math.floor(state.height * 0.18));
        const segments = Math.max(6, Math.floor(state.width / 4));
        const points = [];
        for(let i=0;i<=segments;i++){
          const t = i / segments;
          const x = 1 + Math.floor((state.width - 2) * t);
          const sway = Math.sin(t * Math.PI * 2 + state.random() * 0.6) * amplitude;
          const y = Math.max(2, Math.min(state.height - 3, Math.floor(state.height / 2 + sway)));
          points.push([x,y]);
        }
        state.carvePath(points, 2, (x,y)=>{
          const petal = state.random() < 0.5 ? '#f7cfe1' : '#ffe6f5';
          state.setFloorColor(x,y,petal);
          if(state.random() < 0.1) state.setFloorType(x,y,'petal_carpet');
        });
        state.scatter(5, (cx,cy)=>{
          const radius = 2 + Math.floor(state.random() * 2);
          state.carveCircle(cx, cy, radius, (x,y)=>{
            state.setFloorColor(x,y, state.random() < 0.6 ? '#7fc8f7' : '#a1dcff');
            state.setFloorType(x,y,'stream');
          });
        });
      },
      decorate(state){
        const petals = Math.floor(state.width * state.height * 0.03);
        state.scatter(petals, (x,y)=>{
          if(state.map[y][x] === 0 && state.random() < 0.7){
            const tint = state.random() < 0.5 ? '#fbd5eb' : '#ffeaf4';
            state.setFloorColor(x,y,tint);
            if(state.random() < 0.04) state.setFloorType(x,y,'petal');
          }
        });
      }
    },
    {
      id:'zen-garden',
      name:'枯山水庭苑',
      description:'白砂を波紋状に引き整えた静謐な庭園',
      baseDensity:0.6,
      smoothing:5,
      floorColor:'#e7decd',
      wallColor:'#4a3c2c',
      tags:['culture','garden','minimal','japan'],
      sculpt(state){
        state.carveRect(2,2,state.width-3,state.height-3);
        state.scatter(4, (cx,cy)=>{
          const radius = 2 + Math.floor(state.random()*2);
          for(let y=cy-radius; y<=cy+radius; y++){
            for(let x=cx-radius; x<=cx+radius; x++){
              if(!state.inBounds(x,y)) continue;
              const dx = x - cx;
              const dy = y - cy;
              const dist = Math.sqrt(dx*dx + dy*dy);
              if(dist <= radius){
                if(dist >= radius - 1){
                  state.wallTile(x,y);
                  state.setWallColor(x,y,'#8b7760');
                } else {
                  state.carveTile(x,y);
                  state.setFloorColor(x,y,'#d6c6ad');
                }
              }
            }
          }
        });
      },
      decorate(state){
        state.scatter(18, (x,y)=>{
          if(state.map[y][x] === 0 && state.random() < 0.15){
            state.setFloorColor(x,y,'#c7b79d');
            state.setFloorType(x,y,'stone');
          }
        });
      },
      floorColorFn(state,x,y,base){
        const waves = Math.sin((x + y * 0.5) * 0.6) + Math.cos((y - x * 0.3) * 0.4);
        const t = (waves + 2) / 4;
        const c1 = [231, 222, 205];
        const c2 = [214, 198, 167];
        const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
        const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
        const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
        return `rgb(${r}, ${g}, ${b})`;
      }
    },
    {
      id:'pagoda-quarter',
      name:'塔郭街区',
      description:'多層の塔と瓦屋根が並ぶ古都の街並み',
      baseDensity:0.62,
      smoothing:4,
      floorColor:'#ce8a58',
      wallColor:'#4c2818',
      tags:['city','architecture','pagoda','japan'],
      sculpt(state){
        const spacingX = 4 + Math.floor(state.width / 10);
        const spacingY = 4 + Math.floor(state.height / 10);
        for(let x=2; x<state.width-2; x+=spacingX){
          state.carveRect(x-1, 1, x+1, state.height-2);
        }
        for(let y=2; y<state.height-2; y+=spacingY){
          state.carveRect(1, y-1, state.width-2, y+1);
        }
        state.scatter(6, (cx,cy)=>{
          const w = 2 + Math.floor(state.random()*2);
          const h = 2 + Math.floor(state.random()*2);
          for(let y=cy-h; y<=cy+h; y++){
            for(let x=cx-w; x<=cx+w; x++){
              if(!state.inBounds(x,y)) continue;
              if(x===cx-w || x===cx+w || y===cy-h || y===cy+h){
                state.wallTile(x,y);
                state.setWallColor(x,y,'#3b1c10');
              } else {
                state.carveTile(x,y);
                state.setFloorColor(x,y,state.random()<0.4?'#f0c978':'#dca15c');
              }
            }
          }
        });
      },
      decorate(state){
        state.scatter(30, (x,y)=>{
          if(state.map[y][x] === 0 && state.random() < 0.12){
            state.setFloorColor(x,y,state.random()<0.5?'#f5d2a2':'#d48f5b');
            if(state.random() < 0.1) state.setFloorType(x,y,'market');
          }
        });
      }
    },
    {
      id:'lantern-festival',
      name:'灯篭祭市場',
      description:'灯篭が揺らめく夜祭の回廊',
      baseDensity:0.5,
      smoothing:3,
      floorColor:'#eadbb5',
      wallColor:'#362114',
      tags:['festival','city','culture','japan'],
      sculpt(state){
        const strands = 3 + Math.floor(state.random()*2);
        for(let i=0;i<strands;i++){
          const points = [];
          const startY = 2 + Math.floor(state.random() * (state.height - 4));
          points.push([1,startY]);
          const steps = 4 + Math.floor(state.random()*4);
          for(let s=1;s<steps;s++){
            const x = Math.floor((state.width-2) * (s/steps));
            const offset = Math.sin((s/steps) * Math.PI * 2 + i) * 3;
            const y = Math.max(2, Math.min(state.height-3, Math.floor(startY + offset)));
            points.push([x,y]);
          }
          points.push([state.width-2, startY + Math.floor(state.random()*3)-1]);
          state.carvePath(points, 2, (x,y)=>{
            if(state.random() < 0.1) state.setFloorType(x,y,'lantern_path');
          });
        }
      },
      decorate(state){
        const lanterns = 12 + Math.floor(state.random()*6);
        state.scatter(lanterns, (x,y)=>{
          if(state.map[y][x] === 0){
            state.setFloorColor(x,y,'#ffb040');
            state.setFloorType(x,y,'lantern');
            state.carveCircle(x, y, 1, (ix,iy)=>{
              if(state.map[iy][ix] === 0 && !(ix===x && iy===y)){
                state.setFloorColor(ix,iy,'#f5cf7f');
              }
            });
          }
        });
      },
      floorColorFn(state,x,y,base){
        const stripe = (x + y) % 6;
        if(stripe === 0) return '#f3e3c8';
        if(stripe === 3) return '#e7d1a4';
        return base;
      }
    },
    {
      id:'shogun-keep',
      name:'将軍居城',
      description:'堀と石垣で守られた堅牢な城郭',
      baseDensity:0.65,
      smoothing:5,
      floorColor:'#d0c6b0',
      wallColor:'#2b2622',
      tags:['fortress','architecture','castle','japan'],
      sculpt(state){
        const innerMarginX = Math.floor(state.width * 0.25);
        const innerMarginY = Math.floor(state.height * 0.25);
        const x1 = innerMarginX;
        const y1 = innerMarginY;
        const x2 = state.width - innerMarginX - 1;
        const y2 = state.height - innerMarginY - 1;
        for(let y=y1; y<=y2; y++){
          for(let x=x1; x<=x2; x++){
            if(x===x1 || x===x2 || y===y1 || y===y2){
              state.wallTile(x,y);
              state.setWallColor(x,y,'#3a3936');
            } else {
              state.carveTile(x,y);
              state.setFloorColor(x,y,'#c9c0a8');
              if((x+y) % 5 === 0) state.setFloorType(x,y,'tatami');
            }
          }
        }
        const moatMargin = 2;
        state.carveRect(x1-moatMargin, y1-moatMargin, x2+moatMargin, y2+moatMargin, (x,y)=>{
          if(!(x>=x1 && x<=x2 && y>=y1 && y<=y2)){
            state.setFloorColor(x,y,'#6c8ea6');
            state.setFloorType(x,y,'moat');
          }
        });
        const gates = [
          [Math.floor((x1+x2)/2), y1-1],
          [Math.floor((x1+x2)/2), y2+1],
          [x1-1, Math.floor((y1+y2)/2)],
          [x2+1, Math.floor((y1+y2)/2)]
        ];
        gates.forEach(([gx,gy])=>{
          state.carveCircle(gx, gy, 1, (x,y)=>{
            state.setFloorColor(x,y,'#d7cba8');
            state.setFloorType(x,y,'gate');
          });
        });
      }
    },
    {
      id:'tea-house-lanes',
      name:'茶屋小路',
      description:'茶屋が点在する石畳の横丁',
      baseDensity:0.48,
      smoothing:3,
      floorColor:'#d8c7a4',
      wallColor:'#3b2a20',
      tags:['town','culture','tea','japan'],
      sculpt(state){
        const lanes = 3 + Math.floor(state.random()*3);
        for(let i=0;i<lanes;i++){
          const start = 2 + Math.floor(state.random() * (state.height - 4));
          const points = [[1,start]];
          const segments = 5 + Math.floor(state.random()*3);
          for(let s=1;s<segments;s++){
            const x = Math.floor((state.width-2) * (s/segments));
            const offset = (state.random() - 0.5) * 4;
            const y = Math.max(2, Math.min(state.height-3, Math.floor(start + offset)));
            points.push([x,y]);
          }
          points.push([state.width-2, start + Math.floor(state.random()*3)-1]);
          state.carvePath(points, 1, (x,y)=>{
            state.setFloorColor(x,y, (x+y)%2===0 ? '#d9c4a0' : '#c7b28d');
            state.setFloorType(x,y,'cobble');
          });
        }
      },
      decorate(state){
        state.scatter(15, (cx,cy)=>{
          if(state.map[cy][cx] === 0 && state.random() < 0.2){
            for(let y=cy-1; y<=cy+1; y++){
              for(let x=cx-1; x<=cx+1; x++){
                if(!state.inBounds(x,y)) continue;
                if(x===cx-1 || x===cx+1 || y===cy-1 || y===cy+1){
                  state.wallTile(x,y);
                  state.setWallColor(x,y,'#4e2f1e');
                } else {
                  state.carveTile(x,y);
                  state.setFloorColor(x,y,'#f1d9a5');
                  state.setFloorType(x,y,'tea_house');
                }
              }
            }
          }
        });
      }
    },
    {
      id:'torii-ridge',
      name:'鳥居の尾根道',
      description:'朱塗りの鳥居が連なる山道',
      baseDensity:0.57,
      smoothing:4,
      floorColor:'#e4cdb6',
      wallColor:'#463322',
      tags:['mountain','culture','path','japan'],
      sculpt(state){
        const points = [];
        const segments = 6 + Math.floor(state.random()*3);
        for(let i=0;i<=segments;i++){
          const t = i/segments;
          const x = Math.floor(state.width/2 + Math.sin(t * Math.PI * 1.5) * (state.width * 0.2));
          const y = 1 + Math.floor((state.height-2) * t);
          points.push([x,y]);
        }
        state.carvePath(points, 1, (x,y)=>{
          state.setFloorColor(x,y,'#e9d3b9');
          if(state.random() < 0.15) state.setFloorType(x,y,'path');
        });
        let step = 0;
        state.carvePath(points, 0, (x,y)=>{
          if(step % 3 === 0){
            const offsets = [[-1,0],[1,0]];
            offsets.forEach(([ox,oy])=>{
              const wx = x + ox;
              const wy = y + oy;
              if(state.inBounds(wx,wy)){
                state.wallTile(wx,wy);
                state.setWallColor(wx,wy,'#b8402a');
              }
            });
          }
          step++;
        });
      },
      decorate(state){
        state.scatter(20, (x,y)=>{
          if(state.map[y][x] === 0 && state.random() < 0.1){
            state.setFloorColor(x,y,'#f0dcbf');
          }
        });
      }
    },
    {
      id:'koi-garden',
      name:'錦鯉庭園',
      description:'池と太鼓橋が彩る庭園迷宮',
      baseDensity:0.5,
      smoothing:3,
      floorColor:'#d4cfb5',
      wallColor:'#324138',
      tags:['water','garden','nature','japan'],
      sculpt(state){
        const pools = 4 + Math.floor(state.random()*3);
        state.scatter(pools, (cx,cy)=>{
          const radius = 2 + Math.floor(state.random()*2);
          state.carveCircle(cx, cy, radius, (x,y)=>{
            state.setFloorColor(x,y, state.random()<0.5 ? '#7bc7d7' : '#5faebf');
            state.setFloorType(x,y,'water');
          });
          const bridgePoints = [[cx-radius-1, cy], [cx+radius+1, cy]];
          state.carvePath(bridgePoints, 1, (x,y)=>{
            state.setFloorColor(x,y,'#d9b899');
            state.setFloorType(x,y,'bridge');
          });
        });
      },
      decorate(state){
        state.scatter(25, (x,y)=>{
          if(state.map[y][x] === 0 && state.random() < 0.15){
            state.setFloorColor(x,y,state.random()<0.5?'#f0d4a3':'#c8e0a8');
            if(state.random() < 0.1) state.setFloorType(x,y,'shrub');
          }
        });
      }
    },
    {
      id:'onsen-terraces',
      name:'温泉段丘',
      description:'湯煙が立ち昇る段丘状の温泉郷',
      baseDensity:0.56,
      smoothing:4,
      floorColor:'#e1d4be',
      wallColor:'#3d352c',
      tags:['nature','onsen','steam','japan'],
      sculpt(state){
        const terraces = 3 + Math.floor(state.random()*2);
        for(let t=0; t<terraces; t++){
          const yStart = Math.floor((state.height / terraces) * t) + 1;
          const yEnd = Math.floor((state.height / terraces) * (t+1)) - 2;
          state.carveRect(2, yStart, state.width-3, yEnd, (x,y)=>{
            if((y - yStart) % 4 === 0){
              state.setFloorType(x,y,'wooden_walk');
            }
          });
          const centerY = Math.floor((yStart + yEnd) / 2);
          const centerX = Math.floor(state.width / 2 + (t - terraces/2) * 2);
          state.carveCircle(centerX, centerY, 2, (x,y)=>{
            state.setFloorColor(x,y,state.random()<0.5?'#8fd3c8':'#a7e1d5');
            state.setFloorType(x,y,'hot_spring');
          });
        }
      },
      decorate(state){
        state.scatter(12, (x,y)=>{
          if(state.map[y][x] === 0 && state.random()<0.2){
            state.setFloorColor(x,y,'#f5e4ca');
          }
        });
      }
    },
    {
      id:'rice-terraces',
      name:'棚田山里',
      description:'段々に広がる棚田と山里の迷路',
      baseDensity:0.58,
      smoothing:4,
      floorColor:'#dfe4b3',
      wallColor:'#3a4028',
      tags:['agriculture','nature','village','japan'],
      sculpt(state){
        const bands = 4 + Math.floor(state.random()*2);
        for(let b=0;b<bands;b++){
          const yStart = Math.floor((state.height / bands) * b) + 1;
          const yEnd = Math.floor((state.height / bands) * (b+1));
          for(let y=yStart; y<yEnd; y++){
            for(let x=1; x<state.width-1; x++){
              if(y % 2 === 0){
                state.carveTile(x,y);
                state.setFloorColor(x,y, (x + b) % 2 === 0 ? '#d2e095' : '#c4da7d');
                state.setFloorType(x,y,'paddy');
              }
            }
          }
          const pathY = Math.min(state.height-3, yEnd - 1);
          state.carveRect(1, pathY-1, state.width-2, pathY+1, (x,y)=>{
            state.setFloorColor(x,y,'#b99b71');
            state.setFloorType(x,y,'levee');
          });
        }
        state.scatter(6, (cx,cy)=>{
          const size = 1 + Math.floor(state.random()*2);
          for(let y=cy-size; y<=cy+size; y++){
            for(let x=cx-size; x<=cx+size; x++){
              if(!state.inBounds(x,y)) continue;
              state.wallTile(x,y);
              state.setWallColor(x,y,'#6b4f36');
            }
          }
        });
      }
    },
    {
      id:'momiji-cliffs',
      name:'紅葉断崖',
      description:'燃える紅葉と苔むした断崖が交差する峡谷迷路',
      baseDensity:0.61,
      smoothing:4,
      floorColor:'#f5c48a',
      wallColor:'#402018',
      tags:['nature','autumn','foliage','japan'],
      sculpt(state){
        const ridgePoints = [];
        const segments = 8 + Math.floor(state.random() * 4);
        for(let i=0;i<=segments;i++){
          const t = i / segments;
          const x = 1 + Math.floor((state.width - 2) * t);
          const sway = Math.sin(t * Math.PI * 1.4 + state.random() * 0.4) * (state.height * 0.22);
          const y = Math.max(2, Math.min(state.height - 3, Math.floor(state.height / 2 + sway)));
          ridgePoints.push([x,y]);
        }
        state.carvePath(ridgePoints, 2, (x,y)=>{
          const vertical = y / (state.height - 1);
          const undulation = (Math.sin(x * 0.35) + 1) / 2;
          const noise = (state.noise(x,y,8) + 2) / 4;
          const t = Math.max(0, Math.min(1, vertical * 0.6 + undulation * 0.25 + noise * 0.15));
          state.setFloorColor(x,y, paletteGradient(['#f6d9a8','#f08b3e','#a6352c'], t));
          if(state.random() < 0.2) state.setFloorType(x,y,'leaf_trail');
        });
        state.scatter(7, (cx,cy)=>{
          const radius = 2 + Math.floor(state.random() * 2);
          state.carveCircle(cx, cy, radius, (x,y)=>{
            const moss = (state.noise(x,y,5) + 1) / 2;
            state.setFloorColor(x,y, blendHex('#608048', '#92a85e', moss));
            if(state.random() < 0.2) state.setFloorType(x,y,'moss');
          });
        });
      },
      decorate(state){
        const leaves = Math.floor(state.width * state.height * 0.05);
        state.scatter(leaves, (x,y)=>{
          if(state.map[y][x] === 0 && state.random() < 0.55){
            const swirl = (state.noise(x,y,6) + 1) / 2;
            const palette = ['#f3a466','#f57b4b','#d84a3b','#a9352e'];
            state.setFloorColor(x,y, paletteGradient(palette, swirl));
            if(state.random() < 0.08) state.setFloorType(x,y,'fallen_leaf');
          }
        });
      },
      wallColorFn(state,x,y,base){
        const moss = Math.max(0, Math.min(1, (state.noise(x,y,7) + 1) / 2));
        return blendHex(base, '#55654a', moss * 0.7);
      }
    },
    {
      id:'moonlit-bamboo',
      name:'月竹幽境',
      description:'月光と蛍が揺らめく竹林の秘境',
      baseDensity:0.57,
      smoothing:5,
      floorColor:'#1b2420',
      wallColor:'#0c140f',
      tags:['nature','bamboo','night','japan'],
      sculpt(state){
        const ribbons = 3 + Math.floor(state.random() * 2);
        for(let r=0; r<ribbons; r++){
          const points = [];
          const startX = 2 + Math.floor(state.random() * (state.width - 4));
          points.push([startX,1]);
          const segments = 5 + Math.floor(state.random() * 3);
          for(let s=1; s<segments; s++){
            const t = s / segments;
            const x = Math.max(2, Math.min(state.width - 3, Math.floor(startX + Math.sin(t * Math.PI + r) * 5)));
            const y = Math.floor((state.height - 2) * t) + 1;
            points.push([x,y]);
          }
          points.push([Math.max(2, Math.min(state.width - 3, startX + Math.floor(state.random()*5) - 2)), state.height - 2]);
          state.carvePath(points, 1, (x,y)=>{
            const glow = Math.max(0, Math.min(1, (state.noise(x,y,7) + 1) / 2));
            state.setFloorColor(x,y, paletteGradient(['#22332c','#2f5b4d','#7fd7b8'], glow));
            if(state.random() < 0.18) state.setFloorType(x,y,'stone_step');
          });
        }
        state.scatter(5, (cx,cy)=>{
          const radius = 2;
          state.carveCircle(cx, cy, radius, (x,y)=>{
            const t = Math.max(0, Math.min(1, (state.noise(x,y,5) + 1) / 2));
            state.setFloorColor(x,y, paletteGradient(['#21382f','#2f6553','#94f0d0'], t));
            if(state.random() < 0.25) state.setFloorType(x,y,'bamboo_grove');
          });
        });
      },
      decorate(state){
        const fireflies = 18 + Math.floor(state.random() * 8);
        state.scatter(fireflies, (x,y)=>{
          if(state.map[y][x] === 0 && state.random() < 0.6){
            const flicker = (state.noise(x,y,4) + 1) / 2;
            state.setFloorColor(x,y, blendHex('#c9ff7a', '#83f3ff', flicker));
            if(state.random() < 0.15) state.setFloorType(x,y,'firefly');
          }
        });
      },
      wallColorFn(state,x,y,base){
        const highlight = Math.max(0, Math.min(1, (state.noise(x*1.2,y*0.8,6) + 1) / 2));
        return blendHex(base, '#1f3a32', highlight * 0.5);
      }
    },
    {
      id:'snow-view-shrine',
      name:'雪見神苑',
      description:'雪灯籠と社殿が静かに佇む冬の神苑',
      baseDensity:0.63,
      smoothing:5,
      floorColor:'#f4f6fb',
      wallColor:'#2d3649',
      tags:['culture','winter','shrine','japan'],
      sculpt(state){
        const margin = Math.floor(Math.min(state.width, state.height) * 0.2);
        state.carveRect(margin, margin, state.width - margin - 1, state.height - margin - 1, (x,y)=>{
          if((x + y) % 4 === 0){
            state.setFloorType(x,y,'shovel_path');
          }
        });
        const innerMargin = Math.floor(margin * 0.6);
        const x1 = margin + innerMargin;
        const y1 = margin + innerMargin;
        const x2 = state.width - margin - innerMargin - 1;
        const y2 = state.height - margin - innerMargin - 1;
        for(let y=y1; y<=y2; y++){
          for(let x=x1; x<=x2; x++){
            if(x===x1 || x===x2 || y===y1 || y===y2){
              state.wallTile(x,y);
              state.setWallColor(x,y,'#3a455b');
            } else {
              state.carveTile(x,y);
              state.setFloorColor(x,y,'#f9fbff');
              if((x+y)%5===0) state.setFloorType(x,y,'tatami');
            }
          }
        }
        state.carveCircle(Math.floor(state.width/2), Math.floor(state.height/2), 2, (x,y)=>{
          state.setFloorColor(x,y,'#fef6d0');
          state.setFloorType(x,y,'shrine_altar');
        });
      },
      decorate(state){
        const lanterns = 10 + Math.floor(state.random() * 6);
        state.scatter(lanterns, (x,y)=>{
          if(state.map[y][x] === 0 && state.random() < 0.5){
            state.setFloorColor(x,y,'#ffe3a0');
            state.setFloorType(x,y,'snow_lantern');
          }
        });
        const drifts = Math.floor(state.width * state.height * 0.03);
        state.scatter(drifts, (x,y)=>{
          if(state.map[y][x] === 0 && state.random() < 0.7){
            state.setFloorColor(x,y, blendHex('#f4f6fb','#dfe8f9', state.random() * 0.5));
            if(state.random() < 0.05) state.setFloorType(x,y,'snow_drift');
          }
        });
      },
      floorColorFn(state,x,y,base){
        const depth = Math.max(0, Math.min(1, (state.noise(x,y,7) + 1) / 2));
        return blendHex(base, '#d2e1f4', depth * 0.6);
      },
      wallColorFn(state,x,y,base){
        const frost = Math.max(0, Math.min(1, (state.noise(x+5,y,9) + 1) / 2));
        return blendHex(base, '#4d5d78', frost * 0.5);
      }
    },
    {
      id:'ukiyo-district',
      name:'浮世絵長屋',
      description:'色鮮やかな暖簾と格子が並ぶ町人街の迷廊',
      baseDensity:0.6,
      smoothing:4,
      floorColor:'#f7d8b5',
      wallColor:'#341b15',
      tags:['city','culture','ukiyo-e','japan'],
      sculpt(state){
        const blockWidth = 5 + Math.floor(state.random()*3);
        for(let x=2; x<state.width-2; x+=blockWidth){
          state.carveRect(x-1, 1, x+1, state.height-2, (ix,iy)=>{
            state.setFloorType(ix,iy,'merchant_lane');
          });
        }
        const blockHeight = 5 + Math.floor(state.random()*3);
        for(let y=2; y<state.height-2; y+=blockHeight){
          state.carveRect(1, y-1, state.width-2, y+1, (ix,iy)=>{
            state.setFloorType(ix,iy,'avenue');
          });
        }
        state.scatter(6, (cx,cy)=>{
          const w = 2 + Math.floor(state.random()*2);
          const h = 2 + Math.floor(state.random()*2);
          for(let y=cy-h; y<=cy+h; y++){
            for(let x=cx-w; x<=cx+w; x++){
              if(!state.inBounds(x,y)) continue;
              if(x===cx-w || x===cx+w || y===cy-h || y===cy+h){
                state.wallTile(x,y);
                state.setWallColor(x,y, paletteGradient(['#441f15','#6c2b1c','#8b3a22'], ((x+y) % 3) / 2));
              } else {
                state.carveTile(x,y);
                state.setFloorColor(x,y, paletteGradient(['#f5c381','#f9b764','#f77464'], ((x+y) % 5) / 4));
                if(state.random() < 0.4) state.setFloorType(x,y,'merchant_house');
              }
            }
          }
        });
      },
      decorate(state){
        const banners = Math.floor(state.width * 0.8);
        state.scatter(banners, (x,y)=>{
          if(state.map[y][x] === 0 && state.random() < 0.3){
            const palette = ['#ffb347','#ff6f69','#ffcc5c','#88d8b0'];
            const tint = palette[Math.floor(state.random() * palette.length)];
            state.setFloorColor(x,y, tint);
            if(state.random() < 0.1) state.setFloorType(x,y,'norene');
          }
        });
      },
      floorColorFn(state,x,y,base){
        const t = ((x / state.width) + (Math.sin(y * 0.6) * 0.2)) % 1;
        const palette = ['#f6cf9a','#f6a86b','#ef7561','#c34b64'];
        return paletteGradient(palette, (t + 1) % 1);
      },
      wallColorFn(state,x,y,base){
        const highlight = Math.max(0, Math.min(1, (state.noise(x,y,6) + 1) / 2));
        return blendHex(base, '#5b2f24', highlight * 0.6);
      }
    },
    {
      id:'nebuta-floats',
      name:'ねぶた行列',
      description:'巨大な灯籠山車が進む祭列の大路',
      baseDensity:0.5,
      smoothing:3,
      floorColor:'#f1e1c0',
      wallColor:'#2f1a13',
      tags:['festival','culture','lantern','japan'],
      sculpt(state){
        const parade = [];
        const segments = 6 + Math.floor(state.random()*3);
        for(let i=0;i<=segments;i++){
          const t = i/segments;
          const x = Math.floor(1 + (state.width-2) * t);
          const y = Math.floor(state.height/2 + Math.sin(t * Math.PI * 1.8) * 3);
          parade.push([x,y]);
        }
        state.carvePath(parade, 2, (x,y)=>{
          const pulse = (Math.sin((x + y) * 0.3) + 1) / 2;
          state.setFloorColor(x,y, paletteGradient(['#fde8c4','#ffd05b','#ff8652','#fe4a67'], pulse));
          if(state.random() < 0.2) state.setFloorType(x,y,'parade_route');
        });
        state.scatter(5, (cx,cy)=>{
          const radius = 2 + Math.floor(state.random()*2);
          state.carveCircle(cx, cy, radius, (x,y)=>{
            state.setFloorColor(x,y, blendHex('#fbe3a2','#ff8d73', state.random()));
            if(state.random() < 0.3) state.setFloorType(x,y,'float_stage');
          });
        });
      },
      decorate(state){
        const floats = 10 + Math.floor(state.random() * 6);
        state.scatter(floats, (x,y)=>{
          if(state.map[y][x] === 0 && state.random() < 0.5){
            const palette = ['#ffef7b','#ffbe3c','#ff6f61','#4eb1ff','#8b5cf6'];
            state.setFloorColor(x,y, palette[Math.floor(state.random()*palette.length)]);
            state.setFloorType(x,y,'nebuta_float');
          }
        });
        const lanternRows = 4 + Math.floor(state.random()*3);
        for(let r=0; r<lanternRows; r++){
          const y = 2 + Math.floor((state.height-4) * (r / (lanternRows-1 || 1)));
          for(let x=2; x<state.width-2; x+=3){
            if(state.map[y][x] === 1) continue;
            state.setFloorColor(x,y, blendHex('#ffe07a','#ff9a5f', (r % 2) * 0.6));
            if(state.random() < 0.3) state.setFloorType(x,y,'lantern');
          }
        }
      },
      wallColorFn(state,x,y,base){
        const glow = Math.max(0, Math.min(1, (state.noise(x*0.7,y*0.9,5) + 1) / 2));
        return blendHex(base, '#5c2a1f', glow * 0.7);
      }
    },
    {
      id:'wisteria-veil',
      name:'藤花回廊',
      description:'藤棚が紫の幕を垂らす幻想的な回廊庭園',
      baseDensity:0.55,
      smoothing:4,
      floorColor:'#e5d7f3',
      wallColor:'#322133',
      tags:['garden','nature','wisteria','japan'],
      sculpt(state){
        const rings = 3 + Math.floor(state.random()*2);
        for(let r=0;r<rings;r++){
          const radius = Math.floor(Math.min(state.width, state.height) / (4 + r));
          const cx = Math.floor(state.width/2 + Math.sin(r) * 2);
          const cy = Math.floor(state.height/2 + Math.cos(r) * 2);
          state.carveCircle(cx, cy, radius, (x,y)=>{
            const ripple = Math.max(0, Math.min(1, (state.noise(x,y,6) + 1) / 2));
            state.setFloorColor(x,y, paletteGradient(['#f6e9ff','#d9b7f9','#b789f2'], ripple));
            if(state.random() < 0.15) state.setFloorType(x,y,'garden_walk');
          });
        }
        const streamPoints = [];
        const segments = 6 + Math.floor(state.random()*3);
        for(let i=0;i<=segments;i++){
          const t = i/segments;
          const x = Math.floor(state.width/2 + Math.sin(t * Math.PI * 1.6) * (state.width * 0.25));
          const y = 1 + Math.floor((state.height-2) * t);
          streamPoints.push([x,y]);
        }
        state.carvePath(streamPoints, 1, (x,y)=>{
          state.setFloorColor(x,y, blendHex('#9cd5ff','#6f9ad8', (state.noise(x,y,5)+1)/2));
          state.setFloorType(x,y,'water_rill');
        });
      },
      decorate(state){
        const blossoms = Math.floor(state.width * state.height * 0.04);
        state.scatter(blossoms, (x,y)=>{
          if(state.map[y][x] === 0 && state.random() < 0.6){
            const palette = ['#f6e1ff','#d7aef5','#b07be6','#8455c9'];
            const c = palette[Math.floor(state.random()*palette.length)];
            state.setFloorColor(x,y, jitterColor(c, 24, state.random));
            if(state.random() < 0.12) state.setFloorType(x,y,'wisteria_petals');
          }
        });
      },
      wallColorFn(state,x,y,base){
        const vine = Math.max(0, Math.min(1, (state.noise(x*0.9,y*0.9,7) + 1) / 2));
        return blendHex(base, '#4a3152', vine * 0.6);
      }
    },
    {
      id:'grand-shrine-precincts',
      name:'大神社境内',
      description:'朱塗りの鳥居と拝殿が連なる厳かな神社の境内',
      baseDensity:0.6,
      smoothing:4,
      floorColor:'#f4e8d1',
      wallColor:'#3f2a1d',
      tags:['culture','shrine','sacred','architecture','japan'],
      sculpt(state){
        const axis = [];
        const segments = 5 + Math.floor(state.random() * 4);
        for(let i=0;i<=segments;i++){
          const t = i / segments;
          const x = Math.floor(state.width / 2 + Math.sin(t * Math.PI * 1.2) * 2);
          const y = Math.floor(2 + (state.height - 4) * t);
          axis.push([x,y]);
        }
        state.carvePath(axis, 2, (x,y)=>{
          const grad = Math.max(0, Math.min(1, (y / state.height)));
          state.setFloorColor(x,y, paletteGradient(['#f7e3c4','#f6d094','#f27957'], grad * 0.7));
          state.setFloorType(x,y,'approach_stone');
        });
        const courtyardWidth = Math.floor(Math.min(state.width, state.height) * 0.5);
        const cx = Math.floor(state.width / 2);
        const cy = Math.floor(state.height * 0.65);
        state.carveRect(cx - Math.floor(courtyardWidth/2), cy - 3, cx + Math.floor(courtyardWidth/2), cy + 3, (x,y)=>{
          state.setFloorColor(x,y, blendHex('#f7e7c2','#f0c284', (state.noise(x,y,7)+1)/2));
          if(state.random() < 0.25) state.setFloorType(x,y,'courtyard_gravel');
        });
        state.carveRect(cx - 2, cy - 1, cx + 2, cy + 2, (x,y)=>{
          state.setFloorColor(x,y, blendHex('#f7c08d','#e26a40', 0.4 + state.random()*0.4));
          state.setFloorType(x,y,'honden_floor');
        });
      },
      decorate(state){
        const toriiRow = 6 + Math.floor(state.random() * 4);
        const offsetY = Math.floor(state.height * 0.25);
        for(let i=0;i<toriiRow;i++){
          const y = offsetY + Math.floor((state.height * 0.35) * (i / Math.max(1, toriiRow - 1)));
          const left = Math.floor(state.width / 2 - 2.5);
          const right = Math.floor(state.width / 2 + 2.5);
          for(let x=left; x<=right; x+=Math.max(1, right-left)){
            if(state.inBounds(x,y)){
              state.setFloorColor(x,y, blendHex('#f6b39a','#e74d2d', 0.5 + state.random() * 0.4));
              state.setFloorType(x,y,'torii_gate');
            }
          }
        }
        state.scatter(18, (x,y)=>{
          if(state.map[y][x] === 0 && state.random() < 0.4){
            const choices = ['sacred_tree','shimenawa','stone_lantern'];
            state.setFloorType(x,y, choices[Math.floor(state.random()*choices.length)]);
            state.setFloorColor(x,y, jitterColor('#f7e3c4', 18, state.random));
          }
        });
      },
      wallColorFn(state,x,y,base){
        const patina = Math.max(0, Math.min(1, (state.noise(x,y,8)+1)/2));
        return blendHex(base, '#5a2a1f', patina * 0.7);
      }
    },
    {
      id:'mountain-temple-terraces',
      name:'山寺石段',
      description:'山肌に沿って石段と堂宇が連なる静謐な山寺',
      baseDensity:0.63,
      smoothing:5,
      floorColor:'#d9d5c2',
      wallColor:'#3a3730',
      tags:['culture','temple','mountain','architecture','japan'],
      sculpt(state){
        const terraces = 4 + Math.floor(state.random() * 3);
        for(let i=0;i<terraces;i++){
          const y = Math.floor(state.height * (0.15 + (i/terraces) * 0.7));
          const inset = Math.floor(2 + i * 2);
          state.carveRect(inset, y - 1, state.width - 1 - inset, y + 1, (x,y2)=>{
            const t = (i / Math.max(1, terraces-1));
            state.setFloorColor(x,y2, paletteGradient(['#dfdac7','#c9c3a5','#9a8860'], t));
            state.setFloorType(x,y2,'stone_step');
          });
          if(i % 2 === 0){
            const hallWidth = Math.floor(state.width * 0.3);
            const cx = Math.floor(state.width / 2);
            state.carveRect(cx - Math.floor(hallWidth/2), y - 2, cx + Math.floor(hallWidth/2), y + 2, (x,y2)=>{
              state.setFloorColor(x,y2, blendHex('#d0c6a2','#9f8057', 0.5 + state.random()*0.3));
              if(state.random() < 0.2) state.setFloorType(x,y2,'temple_floor');
            });
          }
        }
        const stair = [];
        const steps = 10 + Math.floor(state.random() * 6);
        for(let i=0;i<=steps;i++){
          const t = i / steps;
          const x = Math.floor(state.width/2 + Math.sin(t*Math.PI)*2);
          const y = Math.floor(1 + (state.height-2) * t);
          stair.push([x,y]);
        }
        state.carvePath(stair, 1, (x,y)=>{
          state.setFloorColor(x,y, blendHex('#d0cbb3','#a49a7a', (state.noise(x,y,5)+1)/2));
          state.setFloorType(x,y,'stone_path');
        });
      },
      decorate(state){
        state.scatter(24, (x,y)=>{
          if(state.map[y][x] === 0 && state.random() < 0.35){
            const choices = ['stone_lantern','sutra_pole','bell'];
            state.setFloorType(x,y, choices[Math.floor(state.random()*choices.length)]);
            state.setFloorColor(x,y, jitterColor('#d8d1ba', 16, state.random));
          }
        });
      },
      wallColorFn(state,x,y,base){
        const moss = Math.max(0, Math.min(1, (state.noise(x*0.8,y*0.8,6)+1)/2));
        return blendHex(base, '#2f3827', moss * 0.6);
      }
    },
    {
      id:'sunrise-bamboo-sea',
      name:'朝霧竹海',
      description:'朝霧の差し込む竹林を縫う爽やかな小径',
      baseDensity:0.5,
      smoothing:3,
      floorColor:'#e0f0d0',
      wallColor:'#2f3b24',
      tags:['nature','bamboo','forest','japan'],
      sculpt(state){
        const meanders = [];
        const segments = 7 + Math.floor(state.random()*4);
        for(let i=0;i<=segments;i++){
          const t = i/segments;
          const x = Math.floor(2 + (state.width-4) * t);
          const y = Math.floor(state.height/2 + Math.sin(t*Math.PI*1.8) * (state.height*0.3));
          meanders.push([x,y]);
        }
        state.carvePath(meanders, 1, (x,y)=>{
          state.setFloorColor(x,y, blendHex('#d5edc4','#9ccf83', (state.noise(x,y,4)+1)/2));
          state.setFloorType(x,y,'bamboo_path');
        });
        const clearings = 3 + Math.floor(state.random()*3);
        for(let i=0;i<clearings;i++){
          const cx = 3 + Math.floor(state.random() * (state.width-6));
          const cy = 3 + Math.floor(state.random() * (state.height-6));
          const radius = 2 + Math.floor(state.random()*2);
          state.carveCircle(cx, cy, radius, (x,y)=>{
            state.setFloorColor(x,y, blendHex('#f2f7e6','#cbe6b1', state.random()));
            if(state.random() < 0.2) state.setFloorType(x,y,'tea_rest');
          });
        }
      },
      decorate(state){
        const culms = Math.floor(state.width * state.height * 0.08);
        state.scatter(culms, (x,y)=>{
          if(state.map[y][x] === 0 && state.random() < 0.7){
            const palette = ['#9ed37b','#6fb25d','#4b8a45'];
            state.setFloorColor(x,y, palette[Math.floor(state.random()*palette.length)]);
            state.setFloorType(x,y,'bamboo_culm');
          }
        });
        state.scatter(10, (x,y)=>{
          if(state.map[y][x] === 0 && state.random() < 0.3){
            state.setFloorType(x,y,'morning_mist');
            state.setFloorColor(x,y, blendHex('#e2f2da','#c4e9f2', state.random()*0.6));
          }
        });
      },
      wallColorFn(state,x,y,base){
        const dapple = Math.max(0, Math.min(1, (state.noise(x*0.7,y*0.6,5)+1)/2));
        return blendHex(base, '#264321', dapple * 0.5);
      }
    },
    {
      id:'solitary-farmstead',
      name:'山里一軒家',
      description:'山里にぽつんと佇む茅葺きの一軒家と畑',
      baseDensity:0.57,
      smoothing:4,
      floorColor:'#e8dfc7',
      wallColor:'#43382c',
      tags:['rural','homestead','nature','japan'],
      sculpt(state){
        const clearingRadius = Math.floor(Math.min(state.width, state.height) * 0.25);
        const cx = Math.floor(state.width/2);
        const cy = Math.floor(state.height/2);
        state.carveCircle(cx, cy, clearingRadius, (x,y)=>{
          state.setFloorColor(x,y, blendHex('#f2e9d0','#d1c7a0', (state.noise(x,y,6)+1)/2));
          if(state.random() < 0.2) state.setFloorType(x,y,'trampled_grass');
        });
        state.carveRect(cx-2, cy-1, cx+2, cy+2, (x,y)=>{
          state.setFloorColor(x,y, blendHex('#d8c395','#8d6c3b', 0.6));
          state.setFloorType(x,y,'farmhouse_floor');
        });
        const fields = 4 + Math.floor(state.random()*3);
        for(let i=0;i<fields;i++){
          const angle = (Math.PI * 2 * i) / fields;
          const fx = cx + Math.floor(Math.cos(angle) * (clearingRadius - 2));
          const fy = cy + Math.floor(Math.sin(angle) * (clearingRadius - 2));
          state.carveRect(fx-2, fy-1, fx+2, fy+1, (x,y)=>{
            state.setFloorColor(x,y, blendHex('#e7c97a','#b68a3d', state.random()));
            if(state.random() < 0.4) state.setFloorType(x,y,'field_ridge');
          });
        }
      },
      decorate(state){
        state.scatter(20, (x,y)=>{
          if(state.map[y][x] === 0 && state.random() < 0.35){
            const choices = ['storage_bin','firewood_stack','well'];
            state.setFloorType(x,y, choices[Math.floor(state.random()*choices.length)]);
            state.setFloorColor(x,y, jitterColor('#e8dfc7', 20, state.random));
          }
        });
        const fenceRadius = Math.floor(Math.min(state.width, state.height) * 0.3);
        state.carveCircle(Math.floor(state.width/2), Math.floor(state.height/2), fenceRadius, (x,y)=>{
          if(Math.abs(state.noise(x,y,3)) > 0.6){
            state.setFloorType(x,y,'country_fence');
            state.setFloorColor(x,y, blendHex('#d0b48a','#7b5a2e', 0.5 + state.random()*0.3));
          }
        });
      },
      wallColorFn(state,x,y,base){
        const soil = Math.max(0, Math.min(1, (state.noise(x,y,5)+1)/2));
        return blendHex(base, '#55402e', soil * 0.5);
      }
    },
    {
      id:'mountain-pass-trail',
      name:'峠山道',
      description:'崖と樹林の間を縫う細い山道と茶屋の跡',
      baseDensity:0.65,
      smoothing:5,
      floorColor:'#d4c5b0',
      wallColor:'#362b24',
      tags:['nature','mountain','path','japan'],
      sculpt(state){
        const trail = [];
        const points = 9 + Math.floor(state.random()*4);
        for(let i=0;i<=points;i++){
          const t = i/points;
          const x = Math.floor(1 + (state.width-2) * t);
          const y = Math.floor(2 + (state.height-4) * Math.pow(t, 0.9) + Math.sin(t*Math.PI*2) * 2);
          trail.push([x,y]);
        }
        state.carvePath(trail, 1, (x,y)=>{
          state.setFloorColor(x,y, blendHex('#d6cbb4','#9d8a6a', (state.noise(x,y,6)+1)/2));
          state.setFloorType(x,y,'mountain_trail');
        });
        state.scatter(5, (x,y)=>{
          const radius = 2 + Math.floor(state.random()*2);
          state.carveCircle(x,y,radius,(px,py)=>{
            state.setFloorColor(px,py, blendHex('#cdbca0','#8f7a58', state.random()));
            if(state.random() < 0.2) state.setFloorType(px,py,'rest_stop');
          });
        });
      },
      decorate(state){
        const cliffs = Math.floor(state.width * 0.6);
        for(let i=0;i<cliffs;i++){
          const x = Math.floor(state.random() * state.width);
          const y = Math.floor(state.random() * state.height);
          if(state.map[y][x] === 1 && state.random() < 0.35){
            state.setWallColor(x,y, blendHex('#46362e','#211915', state.random()*0.5));
          }
        }
        state.scatter(16, (x,y)=>{
          if(state.map[y][x] === 0 && state.random() < 0.3){
            const deco = ['waystone','tea_stall','mountain_pine'];
            state.setFloorType(x,y, deco[Math.floor(state.random()*deco.length)]);
            state.setFloorColor(x,y, jitterColor('#d4c5b0', 18, state.random));
          }
        });
      },
      wallColorFn(state,x,y,base){
        const strata = Math.max(0, Math.min(1, (state.noise(x*0.6,y*0.9,4)+1)/2));
        return blendHex(base, '#43362d', strata * 0.6);
      }
    },
    {
      id:'ancestral-graveyard',
      name:'里山墓地',
      description:'苔むした石塔と供養灯籠が並ぶ静かな墓地',
      baseDensity:0.62,
      smoothing:5,
      floorColor:'#d9d8d1',
      wallColor:'#2f2f31',
      tags:['culture','graveyard','ancestral','japan'],
      sculpt(state){
        const gridCols = 5 + Math.floor(state.random()*2);
        const gridRows = 4 + Math.floor(state.random()*2);
        const cellW = Math.floor((state.width - 4) / gridCols);
        const cellH = Math.floor((state.height - 4) / gridRows);
        for(let gy=0; gy<gridRows; gy++){
          for(let gx=0; gx<gridCols; gx++){
            const left = 2 + gx * cellW;
            const right = Math.min(state.width - 3, left + cellW - 2);
            const top = 2 + gy * cellH;
            const bottom = Math.min(state.height - 3, top + cellH - 2);
            state.carveRect(left, top, right, bottom, (x,y)=>{
              state.setFloorColor(x,y, blendHex('#dcdad2','#b0b0a8', (state.noise(x,y,8)+1)/2));
              if(state.random() < 0.15) state.setFloorType(x,y,'moss_flagstone');
            });
          }
        }
        const avenue = [];
        const steps = 6 + Math.floor(state.random()*3);
        for(let i=0;i<=steps;i++){
          const t = i/steps;
          const x = Math.floor(state.width/2 + Math.sin(t*Math.PI*1.2)*2);
          const y = Math.floor(1 + (state.height-2) * t);
          avenue.push([x,y]);
        }
        state.carvePath(avenue, 1, (x,y)=>{
          state.setFloorColor(x,y, blendHex('#dedbd4','#9da09a', (state.noise(x,y,6)+1)/2));
          state.setFloorType(x,y,'stone_avenue');
        });
      },
      decorate(state){
        const memorials = Math.floor(state.width * state.height * 0.05);
        state.scatter(memorials, (x,y)=>{
          if(state.map[y][x] === 0 && state.random() < 0.6){
            const types = ['stone_stupa','family_obelisk','offering_table'];
            state.setFloorType(x,y, types[Math.floor(state.random()*types.length)]);
            state.setFloorColor(x,y, jitterColor('#d0d0c6', 14, state.random));
          }
        });
        state.scatter(14, (x,y)=>{
          if(state.map[y][x] === 0 && state.random() < 0.25){
            state.setFloorType(x,y,'spirit_lantern');
            state.setFloorColor(x,y, blendHex('#f0e7c8','#f2bf66', 0.5 + state.random()*0.4));
          }
        });
      },
      wallColorFn(state,x,y,base){
        const lichen = Math.max(0, Math.min(1, (state.noise(x*0.9,y*0.9,7)+1)/2));
        return blendHex(base, '#3e433b', lichen * 0.6);
      }
    }
  ].map(applyThemeLocalization);

  const generators = themes.map(theme => ({
    id: theme.id,
    name: theme.name,
    nameKey: theme.nameKey,
    description: theme.description,
    descriptionKey: theme.descriptionKey,
    algorithm: createJapaneseAlgorithm(theme),
    mixin: {
      normalMixed: 0.5,
      blockDimMixed: 0.5,
      tags: (theme.tags || []).concat(['traditional-japan'])
    }
  }));

  function bossFloorsForTier(tier){
    const floors = [];
    if(tier >= 1) floors.push(4);
    if(tier >= 2) floors.push(9);
    if(tier >= 3) floors.push(13);
    if(tier >= 4) floors.push(18);
    return floors;
  }

  const blocks = { blocks1: [], blocks2: [], blocks3: [] };
  generators.forEach((gen, idx)=>{
    const levelBase = idx * 4;
    const size = Math.min(3, Math.floor(idx / 3));
    const depth = 1 + Math.floor(idx / 2);
    const chestOptions = ['normal','more','less'];
    const chest = chestOptions[idx % chestOptions.length];
    blocks.blocks1.push(buildBlockEntry(gen, {
      key: `jp_${gen.id}_journey`,
      name: `${gen.name} 逍遥`,
      level: levelBase,
      size,
      depth,
      chest,
      bossFloors: bossFloorsForTier(Math.floor(idx/3)+1)
    }));

    blocks.blocks2.push(buildBlockEntry(gen, {
      key: `jp_${gen.id}_core`,
      name: `${gen.name} 中核`,
      level: levelBase + 3,
      size: Math.min(4, size + 1),
      depth: depth + 1,
      chest: chest === 'less' ? 'normal' : 'more',
      bossFloors: bossFloorsForTier(Math.floor(idx/2)+1)
    }));

    const legendary = idx % 2 === 0 ? '伝承' : '祭事';
    blocks.blocks3.push(buildBlockEntry(gen, {
      key: `jp_${gen.id}_legend`,
      name: `${gen.name} ${legendary}`,
      level: levelBase + 6,
      size: Math.min(5, size + 2),
      depth: depth + 2,
      chest: idx % 2 === 0 ? 'more' : 'normal',
      bossFloors: bossFloorsForTier(Math.floor(idx/2)+2)
    }));
  });

  window.registerDungeonAddon({
    id: 'traditional_japan_expansion_pack',
    name: 'Traditional Japan Expansion Pack',
    nameKey: "dungeon.packs.traditional_japan_expansion_pack.name",
    version: '1.2.0',
    blocks,
    generators
  });
})();

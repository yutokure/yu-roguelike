// Addon: Emberglass Caverns - volcanic glass tubes cooled into shimmering hollows
(function(){
  function carveSpiral(ctx, grid, center, maxRadius, step, colorA, colorB){
    const { set, setFloorColor, setFloorType, inBounds, random } = ctx;
    let angle = 0;
    for(let r=1; r<=maxRadius; r+=step){
      angle += Math.PI/6;
      const loops = Math.floor((Math.PI*2*r)/step);
      for(let i=0;i<loops;i++){
        const t = i/Math.max(1,loops-1);
        const theta = angle + i*(step/r);
        const x = center.x + Math.round(Math.cos(theta)*r);
        const y = center.y + Math.round(Math.sin(theta)*r*0.75);
        if(inBounds(x,y)){
          set(x,y,0);
          if(grid) grid[y][x] = 0;
          const color = mixColor(colorA, colorB, t);
          setFloorColor(x,y,color);
          if(random()<0.1) setFloorType(x,y,'glass_shard');
        }
      }
    }
  }

  function mixColor(a,b,t){
    const pa = parseInt(a.slice(1),16);
    const pb = parseInt(b.slice(1),16);
    const ra=(pa>>16)&0xff, ga=(pa>>8)&0xff, ba=pa&0xff;
    const rb=(pb>>16)&0xff, gb=(pb>>8)&0xff, bb=pb&0xff;
    const r=Math.round(ra+(rb-ra)*t);
    const g=Math.round(ga+(gb-ga)*t);
    const blue=Math.round(ba+(bb-ba)*t);
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${blue.toString(16).padStart(2,'0')}`;
  }

  function algorithm(ctx){
    const { width:W, height:H, set, setFloorColor, setWallColor, setFloorType, random, inBounds, ensureConnectivity } = ctx;
    const grid = Array.from({length:H}, () => Array(W).fill(1));

    for(let y=0;y<H;y++){
      for(let x=0;x<W;x++){
        set(x,y,1);
        grid[y][x] = 1;
      }
    }

    const vents = [];
    const ventCount = Math.max(3, Math.floor(Math.min(W,H)/6));
    for(let i=0;i<ventCount;i++){
      const cx = 2 + Math.floor(random()*(W-4));
      const cy = 2 + Math.floor(random()*(H-4));
      const radius = 2 + Math.floor(random()*3);
      vents.push({x:cx,y:cy,r:radius});
      for(let y=cy-radius; y<=cy+radius; y++){
        for(let x=cx-radius; x<=cx+radius; x++){
          const dx=x-cx, dy=y-cy;
          if(dx*dx + dy*dy <= radius*radius && inBounds(x,y)){
            set(x,y,0);
            grid[y][x] = 0;
            setFloorColor(x,y,'#f97316');
            setFloorType(x,y,'magma_vent');
          }
        }
      }
    }

    const center = { x: Math.floor(W/2), y: Math.floor(H/2) };
    carveSpiral(ctx, grid, center, Math.floor(Math.min(W,H)/2), 2.2, '#fb923c', '#fcd34d');

    vents.forEach((vent, idx) => {
      const pathLength = Math.floor(W+H);
      let angle = random()*Math.PI*2;
      let x = vent.x;
      let y = vent.y;
      let width = 2 + (idx % 2);
      for(let step=0; step<pathLength; step++){
        if(!inBounds(x,y)) break;
        for(let yy=y-width; yy<=y+width; yy++){
          for(let xx=x-width; xx<=x+width; xx++){
            const dx=xx-x, dy=yy-y;
            if(dx*dx + dy*dy <= width*width && inBounds(xx,yy)){
              set(xx,yy,0);
              grid[yy][xx] = 0;
              const heat = Math.max(0, 1 - (Math.sqrt(dx*dx+dy*dy)/Math.max(1,width)));
              const color = mixColor('#f97316','#facc15', heat);
              setFloorColor(xx,yy,color);
              if(random()<0.08) setFloorType(xx,yy,'glass_ripple');
            }
          }
        }
        if(random()<0.3) angle += (random()<0.5?-1:1) * Math.PI/6;
        x += Math.round(Math.cos(angle));
        y += Math.round(Math.sin(angle));
        width = clamp(width + (random()<0.4 ? (random()<0.5?-1:1) : 0), 1, 3);
      }
    });

    for(let y=0;y<H;y++){
      for(let x=0;x<W;x++){
        if(grid[y][x] === 1){
          const glow = Math.sin((x+y)*0.2)*0.15 + 0.5;
          const shade = Math.floor(lerp(20, 90, glow));
          setWallColor(x,y,`rgb(${shade+30},${shade},${shade})`);
        } else {
          const temper = Math.sin(x*0.3)+Math.cos(y*0.2);
          setFloorColor(x,y, temper>0 ? '#fde68a' : '#fb923c');
        }
      }
    }

    ensureConnectivity();
  }

  function clamp(v,min,max){ return Math.max(min, Math.min(max,v)); }
  function lerp(a,b,t){ return a + (b-a)*t; }

  const gen = {
    id: 'emberglass-caverns',
    name: '灼輝硝洞',
    nameKey: "dungeon.types.emberglass_caverns.name",
    description: '灼熱の溶岩流が固まり硝子となった螺旋洞。余熱が揺らめく。',
    descriptionKey: "dungeon.types.emberglass_caverns.description",
    algorithm,
    mixin: { normalMixed: 0.42, blockDimMixed: 0.55, tags: ['cave','lava','crystal'] }
  };

  function mkBoss(depth){ const floors=[]; if(depth>=7) floors.push(7); if(depth>=13) floors.push(13); if(depth>=19) floors.push(19); return floors; }

  const blocks = {
    blocks1:[
      {
        key:'emberglass_theme_01',
        name:'Emberglass I',
        nameKey: "dungeon.types.emberglass_caverns.blocks.emberglass_theme_01.name",
        level:+0,
        size:0,
        depth:+1,
        chest:'normal',
        type:'emberglass-caverns',
        bossFloors:mkBoss(9)
      },
      {
        key:'emberglass_theme_02',
        name:'Emberglass II',
        nameKey: "dungeon.types.emberglass_caverns.blocks.emberglass_theme_02.name",
        level:+9,
        size:+1,
        depth:+1,
        chest:'more',
        type:'emberglass-caverns',
        bossFloors:mkBoss(13)
      },
      {
        key:'emberglass_theme_03',
        name:'Emberglass III',
        nameKey: "dungeon.types.emberglass_caverns.blocks.emberglass_theme_03.name",
        level:+18,
        size:+1,
        depth:+2,
        chest:'less',
        type:'emberglass-caverns',
        bossFloors:mkBoss(17)
      }
    ],
    blocks2:[
      {
        key:'ember_core_01',
        name:'Ember Core I',
        nameKey: "dungeon.types.emberglass_caverns.blocks.ember_core_01.name",
        level:+0,
        size:+1,
        depth:0,
        chest:'normal',
        type:'emberglass-caverns'
      },
      {
        key:'ember_core_02',
        name:'Ember Core II',
        nameKey: "dungeon.types.emberglass_caverns.blocks.ember_core_02.name",
        level:+8,
        size:+1,
        depth:+1,
        chest:'more',
        type:'emberglass-caverns'
      },
      {
        key:'ember_core_03',
        name:'Ember Core III',
        nameKey: "dungeon.types.emberglass_caverns.blocks.ember_core_03.name",
        level:+16,
        size:+2,
        depth:+1,
        chest:'less',
        type:'emberglass-caverns'
      }
    ],
    blocks3:[
      {
        key:'ember_relic_01',
        name:'Ember Relic I',
        nameKey: "dungeon.types.emberglass_caverns.blocks.ember_relic_01.name",
        level:+0,
        size:0,
        depth:+2,
        chest:'more',
        type:'emberglass-caverns',
        bossFloors:[7]
      },
      {
        key:'ember_relic_02',
        name:'Ember Relic II',
        nameKey: "dungeon.types.emberglass_caverns.blocks.ember_relic_02.name",
        level:+12,
        size:+1,
        depth:+3,
        chest:'normal',
        type:'emberglass-caverns',
        bossFloors:[13]
      },
      {
        key:'ember_relic_03',
        name:'Ember Relic III',
        nameKey: "dungeon.types.emberglass_caverns.blocks.ember_relic_03.name",
        level:+20,
        size:+1,
        depth:+4,
        chest:'less',
        type:'emberglass-caverns',
        bossFloors:[19]
      }
    ]
  };

  window.registerDungeonAddon({
    id:'emberglass_caverns_pack',
    name:'Emberglass Caverns Pack',
    nameKey: "dungeon.packs.emberglass_caverns_pack.name",
    version:'1.0.0',
    blocks,
    generators:[gen]
  });
})();

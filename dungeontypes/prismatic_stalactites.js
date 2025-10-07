// Addon: Prismatic Stalactites - iridescent dripstone chambers with layered light refraction
(function(){
  function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }
  function lerp(a, b, t){ return a + (b - a) * t; }
  function mixColor(a, b, t){
    const pa = parseInt(a.slice(1), 16);
    const pb = parseInt(b.slice(1), 16);
    const ra = (pa >> 16) & 0xff, ga = (pa >> 8) & 0xff, ba = pa & 0xff;
    const rb = (pb >> 16) & 0xff, gb = (pb >> 8) & 0xff, bb = pb & 0xff;
    const r = Math.round(lerp(ra, rb, t));
    const g = Math.round(lerp(ga, gb, t));
    const blue = Math.round(lerp(ba, bb, t));
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${blue.toString(16).padStart(2,'0')}`;
  }

  function algorithm(ctx){
    const { width: W, height: H, set, setFloorColor, setWallColor, setFloorType, random, inBounds, ensureConnectivity } = ctx;

    for(let y=0;y<H;y++){
      for(let x=0;x<W;x++) set(x,y,1);
    }

    const ceiling = new Array(W);
    const floor = new Array(W);
    const ceilingBase = Math.max(1, Math.floor(H * 0.18));
    const floorBase = Math.max(H - Math.floor(H * 0.2), ceilingBase + 4);
    ceiling[0] = ceilingBase;
    floor[0] = floorBase;
    for(let x=1;x<W;x++){
      ceiling[x] = clamp(ceiling[x-1] + (random()<0.55 ? 0 : (random()<0.5?-1:1)), 1, Math.floor(H*0.35));
      floor[x] = clamp(floor[x-1] + (random()<0.55 ? 0 : (random()<0.5?-1:1)), Math.floor(H*0.55), H-2);
      if(floor[x] - ceiling[x] < 5) floor[x] = clamp(ceiling[x] + 5 + Math.floor(random()*3), ceiling[x]+5, H-2);
    }

    const wallPalette = ['#0f172a','#111827','#1e293b','#0b1120'];
    for(let x=1;x<W-1;x++){
      for(let y=ceiling[x]; y<=floor[x]; y++){
        set(x,y,0);
        const t = (y - ceiling[x]) / Math.max(1, floor[x] - ceiling[x]);
        const color = mixColor('#1d4ed8', '#a855f7', Math.pow(t, 0.7));
        setFloorColor(x,y,color);
      }
      for(let y=0;y<H;y++){
        if(y < ceiling[x] || y > floor[x]){
          const idx = (y + Math.floor(Math.sin(x*0.2)*2)) % wallPalette.length;
          setWallColor(x,y, wallPalette[(idx+wallPalette.length)%wallPalette.length]);
        }
      }
    }

    const dripCount = Math.max(6, Math.floor(W/4));
    for(let i=0;i<dripCount;i++){
      const x = 2 + Math.floor(random()*(W-4));
      const length = 2 + Math.floor(random()*Math.max(3, H/6));
      const width = random()<0.35 ? 2 : 1;
      for(let dy=0; dy<length; dy++){
        const y = ceiling[x] + dy;
        for(let wx = -width; wx<=width; wx++){
          const nx = x+wx;
          if(inBounds(nx,y)){
            set(nx,y,0);
            setFloorColor(nx,y, mixColor('#22d3ee','#a855f7', dy/Math.max(1,length)));
            if(dy === length-1 && random()<0.4) setFloorType(nx,y,'crystal_shard');
          }
        }
      }
    }

    const prismBloom = Math.floor((W*H)/90);
    for(let i=0;i<prismBloom;i++){
      const cx = 2 + Math.floor(random()*(W-4));
      const cy = ceiling[cx] + 2 + Math.floor(random()*(Math.max(4, floor[cx]-ceiling[cx]-4)));
      const radius = 1 + Math.floor(random()*2);
      for(let y=cy-radius; y<=cy+radius; y++){
        for(let x=cx-radius; x<=cx+radius; x++){
          const dx=x-cx, dy=y-cy;
          if(dx*dx + dy*dy <= radius*radius && inBounds(x,y)){
            set(x,y,0);
            const gradient = Math.abs(dy)/(radius||1);
            setFloorColor(x,y, mixColor('#38bdf8','#f472b6', gradient));
            if(random()<0.15) setFloorType(x,y,'prism_bloom');
          }
        }
      }
    }

    ensureConnectivity();
  }

  const gen = {
    id: 'prismatic-stalactites',
    name: '虹晶鍾乳洞',
    nameKey: "dungeon.types.prismatic_stalactites.name",
    description: '虹彩の鍾乳石が連なる光屈折の洞窟',
    descriptionKey: "dungeon.types.prismatic_stalactites.description",
    algorithm,
    mixin: { normalMixed: 0.4, blockDimMixed: 0.55, tags: ['cave','crystal','light'] }
  };

  function mkBoss(depth){ const floors=[]; if(depth>=6) floors.push(6); if(depth>=11) floors.push(11); if(depth>=16) floors.push(16); return floors; }

  const blocks = {
    blocks1:[
      {
        key:'prism_stal_theme_01',
        name:'Prism Stalactites I',
        nameKey: "dungeon.types.prismatic_stalactites.blocks.prism_stal_theme_01.name",
        level:+0,
        size:0,
        depth:+1,
        chest:'normal',
        type:'prismatic-stalactites',
        bossFloors:mkBoss(7)
      },
      {
        key:'prism_stal_theme_02',
        name:'Prism Stalactites II',
        nameKey: "dungeon.types.prismatic_stalactites.blocks.prism_stal_theme_02.name",
        level:+7,
        size:+1,
        depth:+1,
        chest:'more',
        type:'prismatic-stalactites',
        bossFloors:mkBoss(10)
      },
      {
        key:'prism_stal_theme_03',
        name:'Prism Stalactites III',
        nameKey: "dungeon.types.prismatic_stalactites.blocks.prism_stal_theme_03.name",
        level:+14,
        size:+1,
        depth:+2,
        chest:'less',
        type:'prismatic-stalactites',
        bossFloors:mkBoss(13)
      },
      {
        key:'prism_stal_theme_04',
        name:'Prism Stalactites IV',
        nameKey: "dungeon.types.prismatic_stalactites.blocks.prism_stal_theme_04.name",
        level:+20,
        size:+2,
        depth:+2,
        chest:'normal',
        type:'prismatic-stalactites',
        bossFloors:mkBoss(16)
      }
    ],
    blocks2:[
      {
        key:'prism_core_01',
        name:'Prism Core I',
        nameKey: "dungeon.types.prismatic_stalactites.blocks.prism_core_01.name",
        level:+0,
        size:+1,
        depth:0,
        chest:'normal',
        type:'prismatic-stalactites'
      },
      {
        key:'prism_core_02',
        name:'Prism Core II',
        nameKey: "dungeon.types.prismatic_stalactites.blocks.prism_core_02.name",
        level:+6,
        size:+1,
        depth:+1,
        chest:'more',
        type:'prismatic-stalactites'
      },
      {
        key:'prism_core_03',
        name:'Prism Core III',
        nameKey: "dungeon.types.prismatic_stalactites.blocks.prism_core_03.name",
        level:+12,
        size:+2,
        depth:+1,
        chest:'less',
        type:'prismatic-stalactites'
      },
      {
        key:'prism_core_04',
        name:'Prism Core IV',
        nameKey: "dungeon.types.prismatic_stalactites.blocks.prism_core_04.name",
        level:+18,
        size:+2,
        depth:+2,
        chest:'normal',
        type:'prismatic-stalactites'
      }
    ],
    blocks3:[
      {
        key:'prism_relic_01',
        name:'Prism Relic I',
        nameKey: "dungeon.types.prismatic_stalactites.blocks.prism_relic_01.name",
        level:+0,
        size:0,
        depth:+2,
        chest:'more',
        type:'prismatic-stalactites',
        bossFloors:[6]
      },
      {
        key:'prism_relic_02',
        name:'Prism Relic II',
        nameKey: "dungeon.types.prismatic_stalactites.blocks.prism_relic_02.name",
        level:+10,
        size:+1,
        depth:+2,
        chest:'normal',
        type:'prismatic-stalactites',
        bossFloors:[11]
      },
      {
        key:'prism_relic_03',
        name:'Prism Relic III',
        nameKey: "dungeon.types.prismatic_stalactites.blocks.prism_relic_03.name",
        level:+18,
        size:+1,
        depth:+3,
        chest:'less',
        type:'prismatic-stalactites',
        bossFloors:[16]
      }
    ]
  };

  window.registerDungeonAddon({
    id:'prismatic_stalactites_pack',
    name:'Prismatic Stalactites Pack',
    nameKey: "dungeon.packs.prismatic_stalactites_pack.name",
    version:'1.0.0',
    blocks,
    generators:[gen]
  });
})();

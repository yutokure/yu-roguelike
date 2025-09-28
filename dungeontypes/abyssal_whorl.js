// Addon: Abyssal Whorl - spiraling abyss traced by subterranean jet streams
(function(){
  function carveDisk(ctx, grid, cx, cy, r, color){
    for(let y=cy-r; y<=cy+r; y++){
      for(let x=cx-r; x<=cx+r; x++){
        const dx = x-cx, dy=y-cy;
        if(dx*dx + dy*dy <= r*r && ctx.inBounds(x,y)){
          ctx.set(x,y,0);
          if(grid) grid[y][x] = 0;
          if(color) ctx.setFloorColor(x,y,color);
        }
      }
    }
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

    const center = { x: Math.floor(W/2), y: Math.floor(H/2) };
    let radius = 2;
    let angle = random()*Math.PI*2;
    const maxRadius = Math.min(W,H)/2;
    const pathSteps = Math.floor(W*H/3);
    const carvedPoints = [];

    for(let step=0; step<pathSteps; step++){
      const x = center.x + Math.round(Math.cos(angle)*radius);
      const y = center.y + Math.round(Math.sin(angle)*radius*0.75);
      if(inBounds(x,y)){
        const swirlColor = mixColor('#0f172a','#0ea5e9', Math.min(1, Math.max(0, radius/maxRadius)));
        carveDisk(ctx, grid, x, y, 2 + (step%3===0?1:0), swirlColor);
        setFloorType(x,y,'whorl_current');
        carvedPoints.push({x,y});
      }
      radius += 0.05 + random()*0.04;
      angle += 0.35 + random()*0.15;
      if(radius > maxRadius){ radius = 1 + random()*2; angle += Math.PI/3; }
    }

    const sinkholeCount = Math.max(4, Math.floor((W+H)/12));
    for(let i=0;i<sinkholeCount;i++){
      const idx = Math.floor(random()*carvedPoints.length);
      const node = carvedPoints[idx] || center;
      const depth = 2 + Math.floor(random()*3);
      for(let r=0;r<=depth;r++){
        const color = mixColor('#082f49','#67e8f9', r/Math.max(1,depth));
        carveDisk(ctx, grid, node.x, node.y, depth-r, color);
      }
      setFloorType(node.x,node.y,'abyssal_eye');
    }

    carvedPoints.forEach((pt, idx) => {
      if(idx % 12 !== 0) return;
      const len = 4 + Math.floor(random()*5);
      let dir = random()<0.5 ? [1,0] : [0,1];
      if(random()<0.5) dir = [-dir[0],-dir[1]];
      let x = pt.x, y = pt.y;
      for(let i=0;i<len;i++){
        x += dir[0];
        y += dir[1];
        if(!inBounds(x,y)) break;
        ctx.set(x,y,0);
        grid[y][x] = 0;
        setFloorColor(x,y,'#1f2937');
        if(random()<0.2) setFloorType(x,y,'collapsed_fissure');
      }
    });

    for(let y=0;y<H;y++){
      for(let x=0;x<W;x++){
        if(grid[y][x] === 1){
          const depth = Math.sqrt((x-center.x)**2 + (y-center.y)**2)/Math.max(1,maxRadius);
          const shade = Math.floor(lerp(15,80, Math.pow(depth,0.7)));
          setWallColor(x,y,`rgb(${shade},${shade+10},${shade+25})`);
        }
      }
    }

    ensureConnectivity();
  }

  function lerp(a,b,t){ return a + (b-a)*t; }
  function mixColor(a,b,t){
    const pa = parseInt(a.slice(1),16);
    const pb = parseInt(b.slice(1),16);
    const ra=(pa>>16)&0xff, ga=(pa>>8)&0xff, ba=pa&0xff;
    const rb=(pb>>16)&0xff, gb=(pb>>8)&0xff, bb=pb&0xff;
    const r=Math.round(ra+(rb-ra)*t);
    const g=Math.round(ga+(gb-ga)*t);
    const b=Math.round(ba+(bb-ba)*t);
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  }

  const gen = {
    id: 'abyssal-whorl',
    name: '渦穿深淵洞',
    description: '地下噴流が掘り抜いた渦巻状の深淵。螺旋の底で青白い光が揺れる。',
    algorithm,
    mixin: { normalMixed: 0.43, blockDimMixed: 0.52, tags: ['cave','abyss','wind'] }
  };

  function mkBoss(depth){ const floors=[]; if(depth>=6) floors.push(6); if(depth>=11) floors.push(11); if(depth>=17) floors.push(17); return floors; }

  const blocks = {
    blocks1:[
      { key:'whorl_theme_01', name:'Abyssal Whorl I', level:+0,  size:0,  depth:+1, chest:'normal', type:'abyssal-whorl', bossFloors:mkBoss(7) },
      { key:'whorl_theme_02', name:'Abyssal Whorl II', level:+7,  size:+1, depth:+1, chest:'more',   type:'abyssal-whorl', bossFloors:mkBoss(11) },
      { key:'whorl_theme_03', name:'Abyssal Whorl III',level:+15, size:+1, depth:+2, chest:'less',   type:'abyssal-whorl', bossFloors:mkBoss(15) }
    ],
    blocks2:[
      { key:'whorl_core_01', name:'Whorl Core I', level:+0,  size:+1, depth:0,  chest:'normal', type:'abyssal-whorl' },
      { key:'whorl_core_02', name:'Whorl Core II',level:+6,  size:+1, depth:+1, chest:'more',   type:'abyssal-whorl' },
      { key:'whorl_core_03', name:'Whorl Core III',level:+12, size:+2, depth:+1, chest:'less',   type:'abyssal-whorl' }
    ],
    blocks3:[
      { key:'whorl_relic_01', name:'Whorl Relic I', level:+0,  size:0,  depth:+2, chest:'more',   type:'abyssal-whorl', bossFloors:[6] },
      { key:'whorl_relic_02', name:'Whorl Relic II',level:+10, size:+1, depth:+3, chest:'normal', type:'abyssal-whorl', bossFloors:[11] },
      { key:'whorl_relic_03', name:'Whorl Relic III',level:+18, size:+1, depth:+4, chest:'less',   type:'abyssal-whorl', bossFloors:[17] }
    ]
  };

  window.registerDungeonAddon({ id:'abyssal_whorl_pack', name:'Abyssal Whorl Pack', version:'1.0.0', blocks, generators:[gen] });
})();

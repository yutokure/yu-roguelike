// Addon: Grand Medieval City (荘厳なる中世都市) - sprawling walled city with plazas and boulevards
(function(){
  function carveRect(ctx,x1,y1,x2,y2){
    const xa=Math.max(0,Math.min(x1,x2)), xb=Math.min(ctx.width-1,Math.max(x1,x2));
    const ya=Math.max(0,Math.min(y1,y2)), yb=Math.min(ctx.height-1,Math.max(y1,y2));
    for(let y=ya;y<=yb;y++){
      for(let x=xa;x<=xb;x++) ctx.set(x,y,0);
    }
  }
  function carveFrame(ctx,x1,y1,x2,y2,width){
    for(let w=0; w<width; w++){
      const xa=x1+w, xb=x2-w, ya=y1+w, yb=y2-w;
      for(let x=xa;x<=xb;x++){ if(ctx.inBounds(x,ya)) ctx.set(x,ya,0); if(ctx.inBounds(x,yb)) ctx.set(x,yb,0); }
      for(let y=ya;y<=yb;y++){ if(ctx.inBounds(xa,y)) ctx.set(xa,y,0); if(ctx.inBounds(xb,y)) ctx.set(xb,y,0); }
    }
  }
  function carveOrthPath(ctx,from,to,width){
    const half=Math.floor(width/2);
    let cx=from.x, cy=from.y;
    const pushColumn=(x,y)=>{ for(let dx=-half;dx<=half;dx++) if(ctx.inBounds(x+dx,y)) ctx.set(x+dx,y,0); };
    const pushRow=(x,y)=>{ for(let dy=-half;dy<=half;dy++) if(ctx.inBounds(x,y+dy)) ctx.set(x,y+dy,0); };
    while(cy!==to.y){
      pushColumn(cx,cy);
      cy += (to.y>cy)?1:-1;
    }
    pushColumn(cx,cy);
    while(cx!==to.x){
      pushRow(cx,cy);
      cx += (to.x>cx)?1:-1;
    }
    pushRow(cx,cy);
  }
  function carveDiamond(ctx,cx,cy,r){
    for(let y=-r;y<=r;y++){
      const span=r-Math.abs(y);
      for(let x=-span;x<=span;x++) if(ctx.inBounds(cx+x,cy+y)) ctx.set(cx+x,cy+y,0);
    }
  }
  function carveCircle(ctx,cx,cy,r){
    const rr=r*r;
    for(let y=-r;y<=r;y++){
      for(let x=-r;x<=r;x++){
        if(x*x+y*y<=rr && ctx.inBounds(cx+x,cy+y)) ctx.set(cx+x,cy+y,0);
      }
    }
  }
  function spanAround(center,width){
    const half=Math.floor(width/2);
    const start=center-half;
    return [start,start+width-1];
  }
  function carveWavyPath(ctx,start,end,width,segments,wiggle){
    const pts=[start];
    const segs=Math.max(0,segments||0);
    const wig=wiggle==null?1:wiggle;
    for(let i=0;i<segs;i++){
      const t=(i+1)/(segs+1);
      const px=start.x+(end.x-start.x)*t;
      const py=start.y+(end.y-start.y)*t;
      const rx=Math.round(px+(ctx.random()*2-1)*wig);
      const ry=Math.round(py+(ctx.random()*2-1)*wig);
      pts.push({x:rx,y:ry});
    }
    pts.push(end);
    for(let i=0;i<pts.length-1;i++) carveOrthPath(ctx,pts[i],pts[i+1],width);
  }
  function relative(layout,fx,fy){
    const innerW=layout.innerX2-layout.innerX1;
    const innerH=layout.innerY2-layout.innerY1;
    return {
      x: Math.round(layout.center.x + innerW*fx),
      y: Math.round(layout.center.y + innerH*fy)
    };
  }
  function resolvePoint(source,layout,ctx){
    if(typeof source==='function') return source(layout,ctx);
    return source;
  }
  function createCityAlgorithm(config){
    const cfg=Object.assign({
      wallThickness:2,
      marginDiv:12,
      crossBoulevard:true,
      crossWidth:3,
      ringCount:2,
      ringSpacingDiv:8,
      diagonalSpokes:true,
      diagonalWidth:2,
      centralDiamond:true,
      centralRadiusFactor:0.12,
      plazaConnectors:true,
      connectorWidth:2,
      connectorStyle:'orth',
      estateCourts:{ count:6, sizeRange:[2,4], margin:3 }
    },config||{});
    return function(ctx){
      const W=ctx.width, H=ctx.height;
      if(W<8 || H<8){ ctx.ensureConnectivity(); return; }
      const margin=Math.max(cfg.minMargin||2,Math.floor(Math.min(W,H)/(cfg.marginDiv||12)));
      const innerX1=margin, innerY1=margin;
      const innerX2=W-margin-1, innerY2=H-margin-1;
      const cx=Math.floor((innerX1+innerX2)/2);
      const cy=Math.floor((innerY1+innerY2)/2);
      const layout={
        innerX1,innerY1,innerX2,innerY2,
        innerWidth:innerX2-innerX1,
        innerHeight:innerY2-innerY1,
        width:W,height:H,
        center:{x:cx,y:cy}
      };

      carveFrame(ctx,innerX1,innerY1,innerX2,innerY2,cfg.wallThickness);

      const gateWidth=cfg.gateWidth||Math.max(3,Math.floor(Math.min(W,H)/10));
      const gates=Array.isArray(cfg.gates)?cfg.gates:[
        { axis:'horizontal', coordinate:cx, side:'north' },
        { axis:'horizontal', coordinate:cx, side:'south' },
        { axis:'vertical', coordinate:cy, side:'west' },
        { axis:'vertical', coordinate:cy, side:'east' }
      ];
      gates.forEach(rawGate=>{
        const gate=Object.assign({ width:gateWidth }, rawGate||{});
        if(gate.axis==='horizontal'){
          const y = gate.side==='north'?innerY1:innerY2;
          const [start,end]=spanAround(gate.coordinate,gate.width);
          for(let x=start;x<=end;x++){
            for(let t=0;t<cfg.wallThickness;t++){
              const yy=gate.side==='north'?y+t:y-t;
              if(ctx.inBounds(x,yy)) ctx.set(x,yy,0);
            }
          }
        }else if(gate.axis==='vertical'){
          const x = gate.side==='west'?innerX1:innerX2;
          const [start,end]=spanAround(gate.coordinate,gate.width);
          for(let y=start;y<=end;y++){
            for(let t=0;t<cfg.wallThickness;t++){
              const xx=gate.side==='west'?x+t:x-t;
              if(ctx.inBounds(xx,y)) ctx.set(xx,y,0);
            }
          }
        }
      });

      if(cfg.crossBoulevard){
        const [vx1,vx2]=spanAround(cx,cfg.crossWidth);
        carveRect(ctx,vx1,innerY1,vx2,innerY2);
        const [hy1,hy2]=spanAround(cy,cfg.crossWidth);
        carveRect(ctx,innerX1,hy1,innerX2,hy2);
      }

      if(cfg.extraAxisBoulevards){
        const extra=cfg.extraAxisBoulevards;
        const width=extra.width||cfg.crossWidth||3;
        (extra.vertical||[]).forEach(v=>{
          const resolved=resolvePoint(v,layout,ctx);
          const coord=resolved&&typeof resolved==='object'&&resolved.x!=null?resolved.x:resolved;
          if(coord==null) return;
          const [sx,ex]=spanAround(coord,width);
          carveRect(ctx,sx,innerY1,ex,innerY2);
        });
        (extra.horizontal||[]).forEach(h=>{
          const resolved=resolvePoint(h,layout,ctx);
          const coord=resolved&&typeof resolved==='object'&&resolved.y!=null?resolved.y:resolved;
          if(coord==null) return;
          const [sy,ey]=spanAround(coord,width);
          carveRect(ctx,innerX1,sy,innerX2,ey);
        });
      }

      if(cfg.marketLattice){
        const step=Math.max(4,Math.floor(cfg.marketLattice.step||5));
        const width=cfg.marketLattice.width||2;
        for(let x=innerX1+step;x<innerX2;x+=step){
          const [sx,ex]=spanAround(x,width);
          carveRect(ctx,sx,innerY1,ex,innerY2);
        }
        for(let y=innerY1+step;y<innerY2;y+=step){
          const [sy,ey]=spanAround(y,width);
          carveRect(ctx,innerX1,sy,innerX2,ey);
        }
      }

      const ringCount=cfg.ringCount||0;
      if(ringCount>0){
        const innerSpan=Math.min(layout.innerWidth,layout.innerHeight);
        const spacing=Math.max(3,Math.floor(innerSpan/((cfg.ringSpacingDiv||8)+(ringCount-1))));
        for(let i=1;i<=ringCount;i++){
          const inset=i*spacing;
          const rx1=innerX1+inset, ry1=innerY1+inset;
          const rx2=innerX2-inset, ry2=innerY2-inset;
          if(rx2-rx1>6 && ry2-ry1>6) carveFrame(ctx,rx1,ry1,rx2,ry2,1);
        }
      }

      if(cfg.cornerBastions){
        const radius=Math.max(1,cfg.cornerBastions.radius||2);
        const offset=Math.max(1,cfg.cornerBastions.offset||2);
        [
          {x:innerX1+offset,y:innerY1+offset},
          {x:innerX2-offset,y:innerY1+offset},
          {x:innerX1+offset,y:innerY2-offset},
          {x:innerX2-offset,y:innerY2-offset}
        ].forEach(pt=>carveDiamond(ctx,pt.x,pt.y,radius));
      }

      if(cfg.innerCitadel){
        const def=Object.assign({ sizeFactor:0.35, wallThickness:2, keep:true },cfg.innerCitadel);
        const innerWidth=Math.max(6,Math.floor(layout.innerWidth*def.sizeFactor));
        const innerHeight=Math.max(6,Math.floor(layout.innerHeight*def.sizeFactor));
        const x1=Math.max(innerX1+2,cx-Math.floor(innerWidth/2));
        const y1=Math.max(innerY1+2,cy-Math.floor(innerHeight/2));
        const x2=Math.min(innerX2-2,x1+innerWidth-1);
        const y2=Math.min(innerY2-2,y1+innerHeight-1);
        carveFrame(ctx,x1,y1,x2,y2,def.wallThickness||2);
        if(def.keep!==false){
          const inset=def.keepMargin!=null?def.keepMargin:Math.max(1,Math.floor(Math.min(innerWidth,innerHeight)/6));
          carveRect(ctx,x1+inset,y1+inset,x2-inset,y2-inset);
        }
      }

      if(cfg.harborPromenade){
        const hp=cfg.harborPromenade;
        const width=Math.max(2,hp.width||4);
        const offset=Math.max(0,hp.offset||0);
        if(hp.side==='south'){
          const y2=innerY2-offset;
          carveRect(ctx,innerX1+1,y2-width+1,innerX2-1,y2);
        }else if(hp.side==='north'){
          const y1=innerY1+offset;
          carveRect(ctx,innerX1+1,y1,innerX2-1,y1+width-1);
        }else if(hp.side==='west'){
          const x1=innerX1+offset;
          carveRect(ctx,x1,innerY1+1,x1+width-1,innerY2-1);
        }else if(hp.side==='east'){
          const x2=innerX2-offset;
          carveRect(ctx,x2-width+1,innerY1+1,x2,innerY2-1);
        }
      }

      const plazas=[];
      const addPlaza=(def)=>{
        const center=resolvePoint(def.center||((l)=>l.center),layout,ctx)||layout.center;
        const radius=def.radius||Math.max(2,Math.floor(Math.min(layout.innerWidth,layout.innerHeight)*(def.radiusFactor||0.1)));
        const width=def.width||radius*2;
        const height=def.height||radius*2;
        const shape=def.shape||'diamond';
        if(shape==='circle'){
          carveCircle(ctx,center.x,center.y,radius);
        }else if(shape==='rectangle'){
          const x1=center.x-Math.floor(width/2);
          const y1=center.y-Math.floor(height/2);
          carveRect(ctx,x1,y1,x1+width-1,y1+height-1);
        }else{
          carveDiamond(ctx,center.x,center.y,radius);
        }
        plazas.push(center);
      };

      if(cfg.centralDiamond){
        addPlaza({ radiusFactor:cfg.centralRadiusFactor||0.12, shape:cfg.centralShape||'diamond' });
      }
      if(Array.isArray(cfg.plazas)) cfg.plazas.forEach(addPlaza);
      if(cfg.randomMiniPlazas){
        const count=cfg.randomMiniPlazas.count||cfg.randomMiniPlazas;
        const radius=Math.max(2,cfg.randomMiniPlazas.radius||Math.floor(Math.min(W,H)*(cfg.randomMiniPlazas.radiusFactor||0.08)));
        const shape=(cfg.randomMiniPlazas.shape==='circle')?'circle':'diamond';
        for(let i=0;i<count;i++){
          const px=innerX1+2+Math.floor(ctx.random()*(innerX2-innerX1-4));
          const py=innerY1+2+Math.floor(ctx.random()*(innerY2-innerY1-4));
          addPlaza({ center:{x:px,y:py}, radius, shape });
        }
      }

      const defaultAnchors=[
        {x:cx,y:innerY1+1},
        {x:cx,y:innerY2-1},
        {x:innerX1+1,y:cy},
        {x:innerX2-1,y:cy},
        {x:cx,y:cy}
      ];
      const rawAnchors=cfg.anchorPoints?cfg.anchorPoints(layout,ctx):defaultAnchors;
      const anchors=Array.isArray(rawAnchors)&&rawAnchors.length?rawAnchors:defaultAnchors;

      const connect=(from,to,width,style,segments,wiggle)=>{
        if(!from||!to) return;
        if(style==='wavy') carveWavyPath(ctx,from,to,width,segments||2,wiggle);
        else carveOrthPath(ctx,from,to,width);
      };

      if(cfg.plazaConnectors && plazas.length && anchors && anchors.length){
        plazas.forEach((plaza,idx)=>{
          if(idx===0 && cfg.skipCentralConnector) return;
          const target=anchors[(idx+Math.floor(ctx.random()*anchors.length))%anchors.length];
          connect(plaza,target,cfg.connectorWidth||2,cfg.connectorStyle,cfg.connectorSegments,cfg.connectorWiggle);
        });
      }

      if(Array.isArray(cfg.additionalConnectors)){
        cfg.additionalConnectors.forEach(con=>{
          const from=resolvePoint(con.from,layout,ctx);
          const to=resolvePoint(con.to,layout,ctx);
          const width=con.width||cfg.connectorWidth||2;
          connect(from,to,width,con.style||cfg.connectorStyle,con.segments,con.wiggle);
        });
      }

      if(cfg.randomAlleys && plazas.length && anchors && anchors.length){
        const count=cfg.randomAlleys.count||Math.max(4,plazas.length);
        for(let i=0;i<count;i++){
          const from=plazas[Math.floor(ctx.random()*plazas.length)];
          const to=anchors[Math.floor(ctx.random()*anchors.length)];
          connect(from,to,cfg.randomAlleys.width||2,cfg.randomAlleys.style||cfg.connectorStyle,cfg.randomAlleys.segments||2,cfg.randomAlleys.wiggle||1);
        }
      }

      if(cfg.diagonalSpokes){
        const diagPoints=Array.isArray(cfg.diagonalSpokes)?cfg.diagonalSpokes:[
          {x:innerX1+2,y:innerY1+2},
          {x:innerX2-2,y:innerY1+2},
          {x:innerX1+2,y:innerY2-2},
          {x:innerX2-2,y:innerY2-2}
        ];
        diagPoints.map(pt=>resolvePoint(pt,layout,ctx)).forEach(pt=>{
          connect(pt,{x:cx,y:cy},cfg.diagonalWidth||2,cfg.diagonalStyle||'orth',cfg.diagonalSegments,cfg.diagonalWiggle);
        });
      }

      if(Array.isArray(cfg.canals)){
        cfg.canals.forEach(canal=>{
          const from=resolvePoint(canal.from,layout,ctx);
          const to=resolvePoint(canal.to,layout,ctx);
          if(!from||!to) return;
          carveWavyPath(ctx,from,to,canal.width||3,canal.segments||3,canal.wiggle||1.5);
        });
      }

      const estateDef=cfg.estateCourts;
      if(estateDef){
        const count=estateDef.count!=null?estateDef.count:Math.max(4,Math.floor(Math.min(W,H)/6));
        const minSize=Math.max(2,estateDef.sizeRange?estateDef.sizeRange[0]:2);
        const maxSize=Math.max(minSize,estateDef.sizeRange?estateDef.sizeRange[1]:minSize+2);
        const pad=Math.max(2,estateDef.margin||3);
        for(let i=0;i<count;i++){
          const ex=innerX1+pad+Math.floor(ctx.random()*(Math.max(1,innerX2-innerX1-pad*2)));
          const ey=innerY1+pad+Math.floor(ctx.random()*(Math.max(1,innerY2-innerY1-pad*2)));
          const ew=minSize+Math.floor(ctx.random()*(maxSize-minSize+1));
          const eh=minSize+Math.floor(ctx.random()*(maxSize-minSize+1));
          carveRect(ctx,ex,ey,ex+ew,ey+eh);
        }
      }

      ctx.ensureConnectivity();
    };
  }

  const baseMixin={ normalMixed:0.4, blockDimMixed:0.6, tags:['structured','rooms','city'] };

  const generators=[
    {
      id:'grand-medieval-city',
      name:'荘厳なる中世都市',
      nameKey: "dungeon.types.grand_medieval_city.name",
      description:'巨大な城壁と大通りが張り巡らされた中世ヨーロッパ風の街区',
      descriptionKey: "dungeon.types.grand_medieval_city.description",

      algorithm:createCityAlgorithm({
        ringCount:2,
        plazas:[
          { center:(layout)=>relative(layout,-0.3,-0.3), radiusFactor:0.11 },
          { center:(layout)=>relative(layout,0.3,-0.3), radiusFactor:0.11 },
          { center:(layout)=>relative(layout,-0.3,0.3), radiusFactor:0.11 },
          { center:(layout)=>relative(layout,0.3,0.3), radiusFactor:0.11 }
        ],
        randomMiniPlazas:{ count:3, radiusFactor:0.06 },
        estateCourts:{ count:8, sizeRange:[2,4], margin:3 },
        randomAlleys:{ count:6, width:2, segments:1, wiggle:1 }
      }),

      mixin:baseMixin
    },
    {
      id:'grand-medieval-city-canals',
      name:'荘厳なる中世都市：水路と港湾',
      nameKey: "dungeon.types.grand_medieval_city_canals.name",
      description:'運河と港湾地区が交差する水辺の中世都市区画',
      descriptionKey: "dungeon.types.grand_medieval_city_canals.description",

      algorithm:createCityAlgorithm({
        ringCount:2,
        diagonalStyle:'wavy',
        diagonalWidth:3,
        diagonalSegments:3,
        diagonalWiggle:2,
        connectorStyle:'wavy',
        connectorWidth:3,
        connectorWiggle:2,
        plazas:[
          { center:(layout)=>relative(layout,0,-0.35), radiusFactor:0.1, shape:'circle' },
          { center:(layout)=>relative(layout,-0.25,0.25), radiusFactor:0.09 },
          { center:(layout)=>relative(layout,0.25,0.25), radiusFactor:0.09 }
        ],
        harborPromenade:{ side:'south', width:4, offset:1 },
        canals:[
          {
            from:(layout)=>({ x:layout.innerX1+3, y:layout.innerY1+Math.floor(layout.innerHeight*0.35) }),
            to:(layout)=>({ x:layout.innerX2-3, y:layout.innerY2-Math.floor(layout.innerHeight*0.25) }),
            width:3, segments:4, wiggle:2
          },
          {
            from:(layout)=>({ x:layout.innerX1+4, y:layout.innerY2-Math.floor(layout.innerHeight*0.2) }),
            to:(layout)=>({ x:layout.innerX2-2, y:layout.innerY1+Math.floor(layout.innerHeight*0.25) }),
            width:2, segments:3, wiggle:1.5
          }
        ],
        additionalConnectors:[
          { from:(layout)=>relative(layout,0,-0.35), to:(layout)=>({x:layout.center.x,y:layout.innerY1+1}), width:3, style:'wavy', segments:3, wiggle:1.5 },
          { from:(layout)=>relative(layout,0.25,0.25), to:(layout)=>({x:layout.innerX2-2,y:layout.center.y}), width:2 },
          { from:(layout)=>relative(layout,-0.25,0.25), to:(layout)=>({x:layout.innerX1+2,y:layout.center.y}), width:2 }
        ],
        estateCourts:{ count:6, sizeRange:[2,3], margin:4 },
        randomAlleys:{ count:8, width:2, style:'wavy', segments:2, wiggle:2 }
      }),

      mixin:Object.assign({},baseMixin,{ tags:['structured','rooms','city','waterway'] })
    },
    {
      id:'grand-medieval-city-hill',
      name:'荘厳なる中世都市：城塞丘陵',
      nameKey: "dungeon.types.grand_medieval_city_hill.name",
      description:'段丘状に城塞がそびえる丘陵の王城地区',
      descriptionKey: "dungeon.types.grand_medieval_city_hill.description",

      algorithm:createCityAlgorithm({
        ringCount:3,
        centralShape:'circle',
        centralRadiusFactor:0.1,
        diagonalSpokes:[
          (layout)=>({ x:layout.innerX1+3, y:layout.center.y-4 }),
          (layout)=>({ x:layout.innerX2-3, y:layout.center.y-4 }),
          (layout)=>({ x:layout.center.x-4, y:layout.innerY1+3 }),
          (layout)=>({ x:layout.center.x+4, y:layout.innerY2-3 })
        ],
        connectorWidth:3,
        skipCentralConnector:true,
        extraAxisBoulevards:{
          width:3,
          vertical:[(layout)=>layout.center.x-6,(layout)=>layout.center.x+6],
          horizontal:[(layout)=>layout.center.y-6,(layout)=>layout.center.y+6]
        },
        cornerBastions:{ radius:2, offset:3 },
        innerCitadel:{ sizeFactor:0.32, wallThickness:2, keep:true, keepMargin:2 },
        plazas:[
          { center:(layout)=>relative(layout,-0.32,0), radiusFactor:0.08 },
          { center:(layout)=>relative(layout,0.32,0), radiusFactor:0.08 },
          { center:(layout)=>relative(layout,0,0.32), radiusFactor:0.08 }
        ],
        randomMiniPlazas:{ count:2, radiusFactor:0.05, shape:'circle' },
        estateCourts:{ count:5, sizeRange:[2,3], margin:4 },
        randomAlleys:{ count:5, width:2, segments:2 }
      }),

      mixin:Object.assign({},baseMixin,{ tags:['structured','rooms','city','fortress'] })
    },
    {
      id:'grand-medieval-city-markets',
      name:'荘厳なる中世都市：商人ギルド街',
      nameKey: "dungeon.types.grand_medieval_city_markets.name",
      description:'ギルド街と市場が格子状に連なる商業区画',
      descriptionKey: "dungeon.types.grand_medieval_city_markets.description",

      algorithm:createCityAlgorithm({
        ringCount:1,
        crossWidth:4,
        marketLattice:{ step:5, width:2 },
        extraAxisBoulevards:{
          width:2,
          vertical:[(layout)=>layout.center.x-4,(layout)=>layout.center.x+4],
          horizontal:[(layout)=>layout.center.y-4,(layout)=>layout.center.y+4]
        },
        plazas:[
          { center:(layout)=>relative(layout,-0.35,-0.35), radiusFactor:0.07, shape:'rectangle', width:7, height:5 },
          { center:(layout)=>relative(layout,0.35,-0.35), radiusFactor:0.07, shape:'rectangle', width:7, height:5 },
          { center:(layout)=>relative(layout,-0.35,0.35), radiusFactor:0.07, shape:'rectangle', width:7, height:5 },
          { center:(layout)=>relative(layout,0.35,0.35), radiusFactor:0.07, shape:'rectangle', width:7, height:5 }
        ],
        randomMiniPlazas:{ count:4, radiusFactor:0.05 },
        randomAlleys:{ count:10, width:2, segments:1 },
        estateCourts:{ count:7, sizeRange:[2,3], margin:3 }
      }),

      mixin:Object.assign({},baseMixin,{ tags:['structured','rooms','city','market'] })
    }
  ];

  function mkBoss(depth){
    const r=[];
    if(depth>=5) r.push(5);
    if(depth>=10) r.push(10);
    if(depth>=15) r.push(15);
    if(depth>=20) r.push(20);
    return r;
  }

  const blocks={
    blocks1:[
      {
        key:'grand_city_theme_01',
        name:'Grand City Theme I',
        nameKey: "dungeon.types.grand_medieval_city.blocks.grand_city_theme_01.name",
        level:+0,
        size:+1,
        depth:+1,
        chest:'normal',
        type:'grand-medieval-city',
        bossFloors:mkBoss(6)
      },
      {
        key:'grand_city_theme_02',
        name:'Grand City Theme II',
        nameKey: "dungeon.types.grand_medieval_city.blocks.grand_city_theme_02.name",
        level:+8,
        size:+1,
        depth:+1,
        chest:'more',
        type:'grand-medieval-city',
        bossFloors:mkBoss(8)
      },
      {
        key:'grand_city_theme_03',
        name:'Grand City Theme III',
        nameKey: "dungeon.types.grand_medieval_city.blocks.grand_city_theme_03.name",
        level:+16,
        size:+2,
        depth:+2,
        chest:'less',
        type:'grand-medieval-city',
        bossFloors:mkBoss(10)
      },
      {
        key:'grand_city_theme_04',
        name:'Grand City Theme IV',
        nameKey: "dungeon.types.grand_medieval_city.blocks.grand_city_theme_04.name",
        level:+24,
        size:+2,
        depth:+2,
        chest:'normal',
        type:'grand-medieval-city',
        bossFloors:mkBoss(12)
      },
      {
        key:'grand_city_theme_05',
        name:'Grand City Theme V',
        nameKey: "dungeon.types.grand_medieval_city.blocks.grand_city_theme_05.name",
        level:+32,
        size:+3,
        depth:+3,
        chest:'more',
        type:'grand-medieval-city',
        bossFloors:mkBoss(15)
      },
      {
        key:'grand_city_theme_06',
        name:'Grand City Theme VI',
        nameKey: "dungeon.types.grand_medieval_city.blocks.grand_city_theme_06.name",
        level:+40,
        size:+3,
        depth:+3,
        chest:'normal',
        type:'grand-medieval-city',
        bossFloors:mkBoss(18)
      },
      {
        key:'grand_city_theme_07',
        name:'Grand City Theme VII',
        nameKey: "dungeon.types.grand_medieval_city.blocks.grand_city_theme_07.name",
        level:+48,
        size:+4,
        depth:+4,
        chest:'more',
        type:'grand-medieval-city',
        bossFloors:mkBoss(20)
      }
    ],
    blocks2:[
      {
        key:'guild_row_01',
        name:'Guild Row I',
        nameKey: "dungeon.types.grand_medieval_city.blocks.guild_row_01.name",
        level:+0,
        size:+1,
        depth:0,
        chest:'normal',
        type:'grand-medieval-city'
      },
      {
        key:'guild_row_02',
        name:'Guild Row II',
        nameKey: "dungeon.types.grand_medieval_city.blocks.guild_row_02.name",
        level:+7,
        size:+1,
        depth:+1,
        chest:'more',
        type:'grand-medieval-city'
      },
      {
        key:'guild_row_03',
        name:'Guild Row III',
        nameKey: "dungeon.types.grand_medieval_city.blocks.guild_row_03.name",
        level:+14,
        size:+2,
        depth:+1,
        chest:'less',
        type:'grand-medieval-city'
      },
      {
        key:'guild_row_04',
        name:'Guild Row IV',
        nameKey: "dungeon.types.grand_medieval_city.blocks.guild_row_04.name",
        level:+21,
        size:+2,
        depth:+2,
        chest:'normal',
        type:'grand-medieval-city'
      },
      {
        key:'guild_row_05',
        name:'Guild Row V',
        nameKey: "dungeon.types.grand_medieval_city.blocks.guild_row_05.name",
        level:+28,
        size:+3,
        depth:+2,
        chest:'more',
        type:'grand-medieval-city'
      },
      {
        key:'guild_row_06',
        name:'Guild Row VI',
        nameKey: "dungeon.types.grand_medieval_city.blocks.guild_row_06.name",
        level:+35,
        size:+3,
        depth:+3,
        chest:'normal',
        type:'grand-medieval-city'
      },
      {
        key:'guild_row_07',
        name:'Guild Row VII',
        nameKey: "dungeon.types.grand_medieval_city.blocks.guild_row_07.name",
        level:+42,
        size:+3,
        depth:+3,
        chest:'more',
        type:'grand-medieval-city'
      }
    ],
    blocks3:[
      {
        key:'cathedral_01',
        name:'Cathedral I',
        nameKey: "dungeon.types.grand_medieval_city.blocks.cathedral_01.name",
        level:+0,
        size:+1,
        depth:+2,
        chest:'more',
        type:'grand-medieval-city',
        bossFloors:[5]
      },
      {
        key:'cathedral_02',
        name:'Cathedral II',
        nameKey: "dungeon.types.grand_medieval_city.blocks.cathedral_02.name",
        level:+8,
        size:+1,
        depth:+2,
        chest:'normal',
        type:'grand-medieval-city',
        bossFloors:[10]
      },
      {
        key:'cathedral_03',
        name:'Cathedral III',
        nameKey: "dungeon.types.grand_medieval_city.blocks.cathedral_03.name",
        level:+16,
        size:+2,
        depth:+3,
        chest:'less',
        type:'grand-medieval-city',
        bossFloors:[15]
      },
      {
        key:'cathedral_04',
        name:'Cathedral IV',
        nameKey: "dungeon.types.grand_medieval_city.blocks.cathedral_04.name",
        level:+24,
        size:+2,
        depth:+3,
        chest:'more',
        type:'grand-medieval-city',
        bossFloors:[10,15]
      },
      {
        key:'cathedral_05',
        name:'Cathedral V',
        nameKey: "dungeon.types.grand_medieval_city.blocks.cathedral_05.name",
        level:+32,
        size:+3,
        depth:+4,
        chest:'normal',
        type:'grand-medieval-city',
        bossFloors:[5,10,15]
      },
      {
        key:'cathedral_06',
        name:'Cathedral VI',
        nameKey: "dungeon.types.grand_medieval_city.blocks.cathedral_06.name",
        level:+40,
        size:+3,
        depth:+4,
        chest:'more',
        type:'grand-medieval-city',
        bossFloors:[15,20]
      }
    ],
    blocks4:[
      {
        key:'harbor_quarter_01',
        name:'Harbor Quarter I',
        nameKey: "dungeon.types.grand_medieval_city.blocks.harbor_quarter_01.name",
        level:+0,
        size:+1,
        depth:+1,
        chest:'normal',
        type:'grand-medieval-city'
      },
      {
        key:'harbor_quarter_02',
        name:'Harbor Quarter II',
        nameKey: "dungeon.types.grand_medieval_city.blocks.harbor_quarter_02.name",
        level:+9,
        size:+1,
        depth:+1,
        chest:'more',
        type:'grand-medieval-city'
      },
      {
        key:'harbor_quarter_03',
        name:'Harbor Quarter III',
        nameKey: "dungeon.types.grand_medieval_city.blocks.harbor_quarter_03.name",
        level:+18,
        size:+2,
        depth:+2,
        chest:'normal',
        type:'grand-medieval-city'
      },
      {
        key:'harbor_quarter_04',
        name:'Harbor Quarter IV',
        nameKey: "dungeon.types.grand_medieval_city.blocks.harbor_quarter_04.name",
        level:+27,
        size:+2,
        depth:+2,
        chest:'more',
        type:'grand-medieval-city',
        bossFloors:[10]
      },
      {
        key:'harbor_quarter_05',
        name:'Harbor Quarter V',
        nameKey: "dungeon.types.grand_medieval_city.blocks.harbor_quarter_05.name",
        level:+36,
        size:+3,
        depth:+3,
        chest:'more',
        type:'grand-medieval-city',
        bossFloors:[15]
      }
    ],
    blocks5:[
      {
        key:'artisan_quarter_01',
        name:'Artisan Quarter I',
        nameKey: "dungeon.types.grand_medieval_city.blocks.artisan_quarter_01.name",
        level:+0,
        size:+1,
        depth:0,
        chest:'normal',
        type:'grand-medieval-city'
      },
      {
        key:'artisan_quarter_02',
        name:'Artisan Quarter II',
        nameKey: "dungeon.types.grand_medieval_city.blocks.artisan_quarter_02.name",
        level:+6,
        size:+1,
        depth:+1,
        chest:'more',
        type:'grand-medieval-city'
      },
      {
        key:'artisan_quarter_03',
        name:'Artisan Quarter III',
        nameKey: "dungeon.types.grand_medieval_city.blocks.artisan_quarter_03.name",
        level:+12,
        size:+2,
        depth:+1,
        chest:'normal',
        type:'grand-medieval-city'
      },
      {
        key:'artisan_quarter_04',
        name:'Artisan Quarter IV',
        nameKey: "dungeon.types.grand_medieval_city.blocks.artisan_quarter_04.name",
        level:+18,
        size:+2,
        depth:+2,
        chest:'more',
        type:'grand-medieval-city'
      },
      {
        key:'artisan_quarter_05',
        name:'Artisan Quarter V',
        nameKey: "dungeon.types.grand_medieval_city.blocks.artisan_quarter_05.name",
        level:+24,
        size:+2,
        depth:+2,
        chest:'less',
        type:'grand-medieval-city'
      }
    ],
    blocks6:[
      {
        key:'commons_plaza_01',
        name:'Commons Plaza I',
        nameKey: "dungeon.types.grand_medieval_city.blocks.commons_plaza_01.name",
        level:+0,
        size:+1,
        depth:0,
        chest:'normal',
        type:'grand-medieval-city'
      },
      {
        key:'commons_plaza_02',
        name:'Commons Plaza II',
        nameKey: "dungeon.types.grand_medieval_city.blocks.commons_plaza_02.name",
        level:+5,
        size:+1,
        depth:+1,
        chest:'more',
        type:'grand-medieval-city'
      },
      {
        key:'commons_plaza_03',
        name:'Commons Plaza III',
        nameKey: "dungeon.types.grand_medieval_city.blocks.commons_plaza_03.name",
        level:+10,
        size:+2,
        depth:+1,
        chest:'normal',
        type:'grand-medieval-city'
      },
      {
        key:'commons_plaza_04',
        name:'Commons Plaza IV',
        nameKey: "dungeon.types.grand_medieval_city.blocks.commons_plaza_04.name",
        level:+15,
        size:+2,
        depth:+2,
        chest:'more',
        type:'grand-medieval-city'
      },
      {
        key:'commons_plaza_05',
        name:'Commons Plaza V',
        nameKey: "dungeon.types.grand_medieval_city.blocks.commons_plaza_05.name",
        level:+20,
        size:+3,
        depth:+2,
        chest:'normal',
        type:'grand-medieval-city'
      }
    ],
    blocks7:[
      {
        key:'garden_court_01',
        name:'Garden Court I',
        nameKey: "dungeon.types.grand_medieval_city.blocks.garden_court_01.name",
        level:+0,
        size:+1,
        depth:0,
        chest:'normal',
        type:'grand-medieval-city'
      },
      {
        key:'garden_court_02',
        name:'Garden Court II',
        nameKey: "dungeon.types.grand_medieval_city.blocks.garden_court_02.name",
        level:+8,
        size:+1,
        depth:+1,
        chest:'less',
        type:'grand-medieval-city'
      },
      {
        key:'garden_court_03',
        name:'Garden Court III',
        nameKey: "dungeon.types.grand_medieval_city.blocks.garden_court_03.name",
        level:+16,
        size:+2,
        depth:+1,
        chest:'normal',
        type:'grand-medieval-city'
      },
      {
        key:'garden_court_04',
        name:'Garden Court IV',
        nameKey: "dungeon.types.grand_medieval_city.blocks.garden_court_04.name",
        level:+24,
        size:+2,
        depth:+2,
        chest:'more',
        type:'grand-medieval-city'
      }
    ]
  };

  window.registerDungeonAddon({
    id:'grand_medieval_city_pack',
    name:'Grand Medieval City Pack',
    nameKey: "dungeon.packs.grand_medieval_city_pack.name",
    version:'1.1.0',
    blocks,
    generators
  });
})();

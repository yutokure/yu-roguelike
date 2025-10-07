// Addon: Medieval Stronghold - fortified castle complex with rich color accents
(function(){
  function initTheme(width,height,fill){
    const arr=new Array(height);
    for(let y=0;y<height;y++){
      arr[y]=new Array(width).fill(fill);
    }
    return arr;
  }

  function fillWithWalls(ctx,width,height,theme){
    for(let y=0;y<height;y++){
      for(let x=0;x<width;x++){
        ctx.set(x,y,1);
        theme[y][x]='wall';
      }
    }
  }

  function carveRect(ctx,theme,x1,y1,x2,y2,type){
    const xa=Math.max(0,Math.min(x1,x2));
    const xb=Math.min(ctx.width-1,Math.max(x1,x2));
    const ya=Math.max(0,Math.min(y1,y2));
    const yb=Math.min(ctx.height-1,Math.max(y1,y2));
    for(let y=ya;y<=yb;y++){
      for(let x=xa;x<=xb;x++){
        ctx.set(x,y,0);
        theme[y][x]=type;
      }
    }
  }

  function carveCrossHall(ctx,theme,cx,cy,length,width,type){
    const half=Math.floor(width/2);
    for(let x=cx-length;x<=cx+length;x++){
      for(let dy=-half;dy<=half;dy++){
        if(ctx.inBounds(x,cy+dy)){
          ctx.set(x,cy+dy,0);
          theme[cy+dy][x]=type;
        }
      }
    }
    for(let y=cy-length;y<=cy+length;y++){
      for(let dx=-half;dx<=half;dx++){
        if(ctx.inBounds(cx+dx,y)){
          ctx.set(cx+dx,y,0);
          theme[y][cx+dx]=type;
        }
      }
    }
  }

  function carveCorridor(ctx,theme,x1,y1,x2,y2,width,type){
    const half=Math.floor(width/2);
    let cx=x1, cy=y1;
    while(cx!==x2){
      for(let dy=-half;dy<=half;dy++) if(ctx.inBounds(cx,cy+dy)){ ctx.set(cx,cy+dy,0); theme[cy+dy][cx]=type; }
      cx += (x2>cx)?1:-1;
    }
    while(cy!==y2){
      for(let dx=-half;dx<=half;dx++) if(ctx.inBounds(cx+dx,cy)){ ctx.set(cx+dx,cy,0); theme[cy][cx+dx]=type; }
      cy += (y2>cy)?1:-1;
    }
    for(let dy=-half;dy<=half;dy++) if(ctx.inBounds(cx,cy+dy)){ ctx.set(cx,cy+dy,0); theme[cy+dy][cx]=type; }
  }

  function carveTower(ctx,theme,cx,cy,radius,type){
    for(let y=-radius;y<=radius;y++){
      for(let x=-radius;x<=radius;x++){
        if(x*x+y*y<=radius*radius && ctx.inBounds(cx+x,cy+y)){
          ctx.set(cx+x,cy+y,0);
          theme[cy+y][cx+x]=type;
        }
      }
    }
  }

  function assignColors(ctx,theme){
    const W=ctx.width, H=ctx.height;
    const floorPalette={
      keep:'#d4c2a8',
      hall:'#cbb279',
      chapel:'#d9c6ff',
      courtyard:'#4f772d',
      barracks:'#b08968',
      market:'#e8a598',
      garden:'#76c893',
      walkway:'#c9ada7',
      tower:'#bfae9d',
      moat:'#497174'
    };
    const wallPalette={
      default:'#5a5353',
      chapel:'#6d597a',
      courtyard:'#386641',
      market:'#b56576'
    };

    for(let y=0;y<H;y++){
      for(let x=0;x<W;x++){
        if(ctx.map[y][x]===0){
          let color=floorPalette[theme[y][x]] || '#e0d4b0';
          if(theme[y][x]==='walkway' && (x+y)%6===0) color='#a4161a';
          if(theme[y][x]==='chapel' && (x+y)%4===0) color='#f7e1ff';
          ctx.setFloorColor(x,y,color);
        }else{
          let chosen=wallPalette.default;
          const neighbors=[
            theme[y][x-1], theme[y][x+1],
            theme[y-1]?theme[y-1][x]:undefined,
            theme[y+1]?theme[y+1][x]:undefined
          ];
          if(neighbors.some(t=>t==='chapel')) chosen=wallPalette.chapel;
          else if(neighbors.some(t=>t==='courtyard')) chosen=wallPalette.courtyard;
          else if(neighbors.some(t=>t==='market')) chosen=wallPalette.market;
          ctx.setWallColor(x,y,chosen);
        }
      }
    }
  }

  function algorithm(ctx){
    const W=ctx.width, H=ctx.height;
    const theme=initTheme(W,H,'wall');
    fillWithWalls(ctx,W,H,theme);

    const margin=2;
    const innerX1=margin, innerY1=margin;
    const innerX2=W-margin-1, innerY2=H-margin-1;

    carveRect(ctx,theme,innerX1,innerY1,innerX2,innerY2,'walkway');

    const keepWidth=Math.max(6,Math.floor(W*0.28));
    const keepHeight=Math.max(6,Math.floor(H*0.32));
    const keepX1=Math.floor((W-keepWidth)/2);
    const keepY1=Math.floor((H-keepHeight)/2)-1;
    carveRect(ctx,theme,keepX1,keepY1,keepX1+keepWidth,keepY1+keepHeight,'keep');

    const hallWidth=Math.max(4,Math.floor(W*0.16));
    const hallX1=innerX1+2;
    const hallX2=hallX1+hallWidth;
    carveRect(ctx,theme,hallX1,keepY1+2,hallX2,keepY1+keepHeight-2,'hall');

    const barracksX2=innerX2-2;
    const barracksX1=barracksX2-hallWidth;
    carveRect(ctx,theme,barracksX1,keepY1+2,barracksX2,keepY1+keepHeight-2,'barracks');

    const chapelHeight=Math.max(5,Math.floor(H*0.18));
    const chapelY1=innerY1+2;
    const chapelY2=chapelY1+chapelHeight;
    carveRect(ctx,theme,keepX1+Math.floor(keepWidth/3),chapelY1,keepX1+Math.floor(keepWidth*2/3),chapelY2,'chapel');

    const courtyardY1=keepY1+keepHeight+2;
    carveRect(ctx,theme,keepX1-2,courtyardY1,keepX1+keepWidth+2,Math.min(innerY2-2,courtyardY1+Math.floor(H*0.18)),'courtyard');

    const marketX1=innerX1+3;
    const marketX2=keepX1-4;
    if(marketX2>marketX1+3){
      carveRect(ctx,theme,marketX1,courtyardY1,marketX2,Math.min(innerY2-3,courtyardY1+Math.floor(H*0.16)),'market');
    }

    const gardenX1=keepX1+keepWidth+4;
    if(gardenX1<innerX2-3){
      carveRect(ctx,theme,gardenX1,courtyardY1,innerX2-3,Math.min(innerY2-3,courtyardY1+Math.floor(H*0.16)),'garden');
    }

    const center={ x:Math.floor(W/2), y:Math.floor(H/2) };
    carveCrossHall(ctx,theme,center.x,center.y,Math.floor(Math.min(W,H)/3),3,'walkway');

    carveCorridor(ctx,theme,center.x,center.y,center.x,innerY1+1,3,'walkway');
    carveCorridor(ctx,theme,center.x,center.y,center.x,innerY2-1,3,'walkway');
    carveCorridor(ctx,theme,center.x,center.y,innerX1+1,center.y,3,'walkway');
    carveCorridor(ctx,theme,center.x,center.y,innerX2-1,center.y,3,'walkway');

    carveTower(ctx,theme,innerX1+2,innerY1+2,2,'tower');
    carveTower(ctx,theme,innerX2-2,innerY1+2,2,'tower');
    carveTower(ctx,theme,innerX1+2,innerY2-2,2,'tower');
    carveTower(ctx,theme,innerX2-2,innerY2-2,2,'tower');

    assignColors(ctx,theme);
    ctx.ensureConnectivity();
  }

  const gen={
    id:'medieval-stronghold',
    name:'中世要塞都市',
    nameKey: "dungeon.types.medieval_stronghold.name",
    description:'城郭、礼拝堂、市場が彩る中世の要塞都市を生成する。彩り豊かな床や壁で雰囲気を強調。',
    descriptionKey: "dungeon.types.medieval_stronghold.description",
    algorithm,
    mixin:{ normalMixed:0.6, blockDimMixed:0.5, tags:['castle','city','medieval'] }
  };

  function mkBoss(depth){
    const res=[];
    if(depth>=5) res.push(5);
    if(depth>=10) res.push(10);
    if(depth>=15) res.push(15);
    return res;
  }

  const blocks={
    blocks1:[
      {
        key:'medieval_story_01',
        name:'Stronghold Frontier',
        nameKey: "dungeon.types.medieval_stronghold.blocks.medieval_story_01.name",
        level:+0,
        size:0,
        depth:+1,
        chest:'normal',
        type:'medieval-stronghold',
        bossFloors:mkBoss(6)
      },
      {
        key:'medieval_story_02',
        name:'Stronghold Artery',
        nameKey: "dungeon.types.medieval_stronghold.blocks.medieval_story_02.name",
        level:+7,
        size:+1,
        depth:+1,
        chest:'more',
        type:'medieval-stronghold',
        bossFloors:mkBoss(9)
      },
      {
        key:'medieval_story_03',
        name:'Stronghold Citadel',
        nameKey: "dungeon.types.medieval_stronghold.blocks.medieval_story_03.name",
        level:+14,
        size:+1,
        depth:+2,
        chest:'less',
        type:'medieval-stronghold',
        bossFloors:mkBoss(12)
      },
      {
        key:'medieval_story_04',
        name:'Stronghold Crown',
        nameKey: "dungeon.types.medieval_stronghold.blocks.medieval_story_04.name",
        level:+21,
        size:+2,
        depth:+2,
        chest:'normal',
        type:'medieval-stronghold',
        bossFloors:mkBoss(15)
      },
      {
        key:'medieval_story_05',
        name:'Stronghold Heart',
        nameKey: "dungeon.types.medieval_stronghold.blocks.medieval_story_05.name",
        level:+28,
        size:+2,
        depth:+3,
        chest:'more',
        type:'medieval-stronghold',
        bossFloors:[15]
      }
    ],
    blocks2:[
      {
        key:'medieval_core_01',
        name:'Keep Quarter',
        nameKey: "dungeon.types.medieval_stronghold.blocks.medieval_core_01.name",
        level:+0,
        size:+1,
        depth:0,
        chest:'normal',
        type:'medieval-stronghold'
      },
      {
        key:'medieval_core_02',
        name:'Noble Quarter',
        nameKey: "dungeon.types.medieval_stronghold.blocks.medieval_core_02.name",
        level:+6,
        size:+1,
        depth:+1,
        chest:'more',
        type:'medieval-stronghold'
      },
      {
        key:'medieval_core_03',
        name:'Sacred Quarter',
        nameKey: "dungeon.types.medieval_stronghold.blocks.medieval_core_03.name",
        level:+12,
        size:+2,
        depth:+1,
        chest:'less',
        type:'medieval-stronghold'
      },
      {
        key:'medieval_core_04',
        name:'Guild Quarter',
        nameKey: "dungeon.types.medieval_stronghold.blocks.medieval_core_04.name",
        level:+18,
        size:+2,
        depth:+2,
        chest:'normal',
        type:'medieval-stronghold'
      },
      {
        key:'medieval_core_05',
        name:'Royal Quarter',
        nameKey: "dungeon.types.medieval_stronghold.blocks.medieval_core_05.name",
        level:+24,
        size:+3,
        depth:+2,
        chest:'more',
        type:'medieval-stronghold'
      }
    ],
    blocks3:[
      {
        key:'medieval_relic_01',
        name:'Relic Ward',
        nameKey: "dungeon.types.medieval_stronghold.blocks.medieval_relic_01.name",
        level:+0,
        size:0,
        depth:+2,
        chest:'more',
        type:'medieval-stronghold',
        bossFloors:[5]
      },
      {
        key:'medieval_relic_02',
        name:'Banner Ward',
        nameKey: "dungeon.types.medieval_stronghold.blocks.medieval_relic_02.name",
        level:+9,
        size:+1,
        depth:+2,
        chest:'normal',
        type:'medieval-stronghold',
        bossFloors:[10]
      },
      {
        key:'medieval_relic_03',
        name:'Sanctum Ward',
        nameKey: "dungeon.types.medieval_stronghold.blocks.medieval_relic_03.name",
        level:+18,
        size:+1,
        depth:+3,
        chest:'less',
        type:'medieval-stronghold',
        bossFloors:[15]
      },
      {
        key:'medieval_relic_04',
        name:'Knightly Ward',
        nameKey: "dungeon.types.medieval_stronghold.blocks.medieval_relic_04.name",
        level:+24,
        size:+2,
        depth:+3,
        chest:'more',
        type:'medieval-stronghold',
        bossFloors:[10,15]
      },
      {
        key:'medieval_relic_05',
        name:'Dynasty Ward',
        nameKey: "dungeon.types.medieval_stronghold.blocks.medieval_relic_05.name",
        level:+30,
        size:+2,
        depth:+4,
        chest:'normal',
        type:'medieval-stronghold',
        bossFloors:[5,10,15]
      }
    ]
  };

  window.registerDungeonAddon({
    id:'medieval_stronghold_pack',
    name:'Medieval Stronghold Pack',
    nameKey: "dungeon.packs.medieval_stronghold_pack.name",
    version:'1.0.0',
    blocks,
    generators:[gen]
  });
})();

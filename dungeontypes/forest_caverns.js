// Addon: Verdant Forest - cave-like generation with lush colors
(function(){
  function countWalls(map,x,y,W,H){
    let c=0;
    for(let yy=y-1;yy<=y+1;yy++){
      for(let xx=x-1;xx<=x+1;xx++){
        if(xx===x && yy===y) continue;
        if(xx<0 || yy<0 || xx>=W || yy>=H){ c++; continue; }
        if(map[yy][xx] === 1) c++;
      }
    }
    return c;
  }
  function algorithm(ctx){
    const W=ctx.width, H=ctx.height;
    const map = ctx.map;

    for(let y=1;y<H-1;y++)
      for(let x=1;x<W-1;x++)
        map[y][x] = (ctx.random() < 0.55 ? 1 : 0);

    for(let iter=0; iter<5; iter++){
      const next = map.map(row => row.slice());
      for(let y=1;y<H-1;y++){
        for(let x=1;x<W-1;x++){
          const walls = countWalls(map,x,y,W,H);
          const thresh = iter < 2 ? 4 : 5;
          next[y][x] = walls > thresh ? 1 : 0;
        }
      }
      for(let y=1;y<H-1;y++)
        for(let x=1;x<W-1;x++) map[y][x] = next[y][x];
    }

    for(let y=0;y<H;y++){
      for(let x=0;x<W;x++){
        if(map[y][x] === 0){
          ctx.setFloorColor(x,y,'#99d98c');
        } else {
          ctx.setWallColor(x,y,'#2b9348');
        }
      }
    }

    ctx.ensureConnectivity();
  }

  const gen = {
    id: 'verdant-forest',
    name: '森林洞窟',
    description: '苔むした森林の洞窟。緑濃い壁と黄緑の床が続く',
    algorithm,
    mixin: { normalMixed: 0.5, blockDimMixed: 0.55, tags: ['cave','forest'] }
  };

  function mkBoss(depth){ const r=[]; if(depth>=5) r.push(5); if(depth>=10) r.push(10); if(depth>=15) r.push(15); return r; }
  const blocks = {
    blocks1:[
      { key:'forest_theme_01', name:'Forest Theme I', level:+0,  size:0,  depth:+1, chest:'normal', type:'verdant-forest', bossFloors:mkBoss(6) },
      { key:'forest_theme_02', name:'Forest Theme II',level:+7,  size:+1, depth:+1, chest:'less',   type:'verdant-forest', bossFloors:mkBoss(8) },
      { key:'forest_theme_03', name:'Forest Theme III',level:+14, size:+1, depth:+2, chest:'more',  type:'verdant-forest', bossFloors:mkBoss(10) },
      { key:'forest_theme_04', name:'Forest Theme IV', level:+21, size:+2, depth:+2, chest:'normal',type:'verdant-forest', bossFloors:mkBoss(12) },
      { key:'forest_theme_05', name:'Forest Theme V',  level:+28, size:+2, depth:+3, chest:'less',  type:'verdant-forest', bossFloors:mkBoss(15) },
    ],
    blocks2:[
      { key:'forest_core_01', name:'Forest Core I', level:+0,  size:+1, depth:0, chest:'normal', type:'verdant-forest' },
      { key:'forest_core_02', name:'Forest Core II',level:+6,  size:+1, depth:+1, chest:'more',  type:'verdant-forest' },
      { key:'forest_core_03', name:'Forest Core III',level:+12, size:+2, depth:+1, chest:'less', type:'verdant-forest' },
      { key:'forest_core_04', name:'Forest Core IV',level:+18, size:+2, depth:+2, chest:'normal',type:'verdant-forest' },
      { key:'forest_core_05', name:'Forest Core V', level:+24, size:+3, depth:+2, chest:'more',  type:'verdant-forest' },
    ],
    blocks3:[
      { key:'forest_relic_01', name:'Forest Relic I', level:+0,  size:0,  depth:+2, chest:'more',   type:'verdant-forest', bossFloors:[5] },
      { key:'forest_relic_02', name:'Forest Relic II',level:+9,  size:+1, depth:+2, chest:'normal', type:'verdant-forest', bossFloors:[10] },
      { key:'forest_relic_03', name:'Forest Relic III',level:+18, size:+1, depth:+3, chest:'less', type:'verdant-forest', bossFloors:[15] },
      { key:'forest_relic_04', name:'Forest Relic IV', level:+24, size:+2, depth:+3, chest:'more', type:'verdant-forest', bossFloors:[10,15] },
      { key:'forest_relic_05', name:'Forest Relic V',  level:+30, size:+2, depth:+4, chest:'normal',type:'verdant-forest', bossFloors:[5,10,15] },
    ]
  };

  window.registerDungeonAddon({ id:'forest_pack', name:'Verdant Forest Pack', version:'1.0.0', blocks, generators:[gen] });
})();

// Addon: Tidal Catacombs - terraced caverns shaped by ebb and flow
(function(){
  function fillBand(ctx, x1,y1,x2,y2,color){
    for(let y=y1; y<=y2; y++){
      for(let x=x1; x<=x2; x++){
        if(ctx.inBounds(x,y)){
          ctx.set(x,y,0);
          ctx.setFloorColor(x,y,color);
        }
      }
    }
  }
  function carvePool(ctx, cx, cy, r, color){
    const r2 = r*r;
    for(let y=cy-r; y<=cy+r; y++){
      for(let x=cx-r; x<=cx+r; x++){
        const dx=x-cx, dy=y-cy;
        if(dx*dx + dy*dy <= r2 && ctx.inBounds(x,y)){
          ctx.set(x,y,0);
          ctx.setFloorColor(x,y,color);
        }
      }
    }
  }
  function algorithm(ctx){
    const W = ctx.width, H = ctx.height;
    const random = ctx.random;
    const tiers = Math.max(4, Math.floor(H / 8));
    const bandHeight = Math.max(3, Math.floor((H-4) / tiers));
    const terraceColors = ['#f8f9fa','#f1f3f5','#e9ecef','#dee2e6'];

    for(let t=0; t<tiers; t++){
      const yStart = 2 + t * bandHeight;
      const yEnd = Math.min(H-3, yStart + bandHeight - 1);
      const color = terraceColors[t % terraceColors.length];
      fillBand(ctx, 2, yStart, W-3, yEnd, color);

      const poolChance = Math.max(1, Math.floor(W/15));
      for(let p=0; p<poolChance; p++){
        if(random() < 0.45){
          const px = 3 + Math.floor(random()*(W-6));
          const py = Math.max(yStart+1, Math.min(yEnd-1, yStart + Math.floor(random()*(bandHeight))));
          const radius = 1 + Math.floor(random()*3);
          carvePool(ctx, px, py, radius, '#74c0fc');
        }
      }
    }

    // Gentle ramps between tiers
    for(let t=0; t<tiers-1; t++){
      const y = 2 + (t+1)*bandHeight - 1;
      const rampCount = 2 + Math.floor(W / 20);
      for(let r=0; r<rampCount; r++){
        const x = 3 + Math.floor(random()*(W-6));
        for(let k=0;k<4;k++){
          const rx = x + k;
          const ry = y + k;
          if(ctx.inBounds(rx, ry)){
            ctx.set(rx, ry, 0);
            ctx.setFloorColor(rx, ry, '#adb5bd');
          }
        }
      }
    }

    // Channel-like corridors connecting extremes
    const leftChannel = ctx.aStar({x:3,y:3},{x:3,y:H-4},{wallCost:1.0,floorCost:0.2});
    ctx.carvePath(leftChannel,2);
    leftChannel.forEach(p=>ctx.setFloorColor(p.x,p.y,'#ced4da'));
    const rightChannel = ctx.aStar({x:W-4,y:3},{x:W-4,y:H-4},{wallCost:1.0,floorCost:0.2});
    ctx.carvePath(rightChannel,2);
    rightChannel.forEach(p=>ctx.setFloorColor(p.x,p.y,'#ced4da'));

    ctx.ensureConnectivity();
  }

  const gen = {
    id: 'tidal-catacombs',
    name: '潮汐墓所',
    nameKey: "dungeon.types.tidal_catacombs.name",
    description: '潮の干満で削れた階段状の洞窟と潮溜まり',
    descriptionKey: "dungeon.types.tidal_catacombs.description",
    algorithm,
    mixin: { normalMixed: 0.4, blockDimMixed: 0.45, tags: ['water','tiered'] }
  };

  function mkBoss(depth){ const r=[]; if(depth>=5) r.push(5); if(depth>=10) r.push(10); if(depth>=15) r.push(15); return r; }
  const blocks = {
    blocks1:[
      {
        key:'tidal_theme_01',
        name:'Tidal Theme I',
        nameKey: "dungeon.types.tidal_catacombs.blocks.tidal_theme_01.name",
        level:+0,
        size:0,
        depth:+1,
        chest:'normal',
        type:'tidal-catacombs',
        bossFloors:mkBoss(6)
      },
      {
        key:'tidal_theme_02',
        name:'Tidal Theme II',
        nameKey: "dungeon.types.tidal_catacombs.blocks.tidal_theme_02.name",
        level:+7,
        size:+1,
        depth:+1,
        chest:'less',
        type:'tidal-catacombs',
        bossFloors:mkBoss(8)
      },
      {
        key:'tidal_theme_03',
        name:'Tidal Theme III',
        nameKey: "dungeon.types.tidal_catacombs.blocks.tidal_theme_03.name",
        level:+14,
        size:+1,
        depth:+2,
        chest:'more',
        type:'tidal-catacombs',
        bossFloors:mkBoss(10)
      },
      {
        key:'tidal_theme_04',
        name:'Tidal Theme IV',
        nameKey: "dungeon.types.tidal_catacombs.blocks.tidal_theme_04.name",
        level:+21,
        size:+2,
        depth:+2,
        chest:'normal',
        type:'tidal-catacombs',
        bossFloors:mkBoss(12)
      },
      {
        key:'tidal_theme_05',
        name:'Tidal Theme V',
        nameKey: "dungeon.types.tidal_catacombs.blocks.tidal_theme_05.name",
        level:+28,
        size:+2,
        depth:+3,
        chest:'less',
        type:'tidal-catacombs',
        bossFloors:mkBoss(15)
      },
    ],
    blocks2:[
      {
        key:'tidal_core_01',
        name:'Tidal Core I',
        nameKey: "dungeon.types.tidal_catacombs.blocks.tidal_core_01.name",
        level:+0,
        size:+1,
        depth:0,
        chest:'normal',
        type:'tidal-catacombs'
      },
      {
        key:'tidal_core_02',
        name:'Tidal Core II',
        nameKey: "dungeon.types.tidal_catacombs.blocks.tidal_core_02.name",
        level:+6,
        size:+1,
        depth:+1,
        chest:'more',
        type:'tidal-catacombs'
      },
      {
        key:'tidal_core_03',
        name:'Tidal Core III',
        nameKey: "dungeon.types.tidal_catacombs.blocks.tidal_core_03.name",
        level:+12,
        size:+2,
        depth:+1,
        chest:'less',
        type:'tidal-catacombs'
      },
      {
        key:'tidal_core_04',
        name:'Tidal Core IV',
        nameKey: "dungeon.types.tidal_catacombs.blocks.tidal_core_04.name",
        level:+18,
        size:+2,
        depth:+2,
        chest:'normal',
        type:'tidal-catacombs'
      },
      {
        key:'tidal_core_05',
        name:'Tidal Core V',
        nameKey: "dungeon.types.tidal_catacombs.blocks.tidal_core_05.name",
        level:+24,
        size:+3,
        depth:+2,
        chest:'more',
        type:'tidal-catacombs'
      },
    ],
    blocks3:[
      {
        key:'tidal_relic_01',
        name:'Tidal Relic I',
        nameKey: "dungeon.types.tidal_catacombs.blocks.tidal_relic_01.name",
        level:+0,
        size:0,
        depth:+2,
        chest:'more',
        type:'tidal-catacombs',
        bossFloors:[5]
      },
      {
        key:'tidal_relic_02',
        name:'Tidal Relic II',
        nameKey: "dungeon.types.tidal_catacombs.blocks.tidal_relic_02.name",
        level:+9,
        size:+1,
        depth:+2,
        chest:'normal',
        type:'tidal-catacombs',
        bossFloors:[10]
      },
      {
        key:'tidal_relic_03',
        name:'Tidal Relic III',
        nameKey: "dungeon.types.tidal_catacombs.blocks.tidal_relic_03.name",
        level:+18,
        size:+1,
        depth:+3,
        chest:'less',
        type:'tidal-catacombs',
        bossFloors:[15]
      },
      {
        key:'tidal_relic_04',
        name:'Tidal Relic IV',
        nameKey: "dungeon.types.tidal_catacombs.blocks.tidal_relic_04.name",
        level:+24,
        size:+2,
        depth:+3,
        chest:'more',
        type:'tidal-catacombs',
        bossFloors:[10,15]
      },
      {
        key:'tidal_relic_05',
        name:'Tidal Relic V',
        nameKey: "dungeon.types.tidal_catacombs.blocks.tidal_relic_05.name",
        level:+30,
        size:+2,
        depth:+4,
        chest:'normal',
        type:'tidal-catacombs',
        bossFloors:[5,10,15]
      },
    ]
  };

  window.registerDungeonAddon({
    id:'tidal_pack',
    name:'Tidal Catacombs Pack',
    nameKey: "dungeon.packs.tidal_pack.name",
    version:'1.0.0',
    blocks,
    generators:[gen]
  });
})();

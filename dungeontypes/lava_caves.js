// Sample Dungeon Addon: Lava Caves
(function(){
  function algo(ctx){
    const {width:W,height:H,map,set,inBounds,ensureConnectivity} = ctx;
    const random = ctx.random;
    const area=(W-2)*(H-2); const target=Math.floor(area*0.42);
    let dug=0;

    // 複数ドリフター＋慣性・分岐
    const maxWalkers = 4;
    const walkerCount = 2 + Math.floor(random()*3); // 2..4
    const DIRS = [[1,0],[-1,0],[0,1],[0,-1]];
    const walkers = [];
    for(let i=0;i<walkerCount;i++){
      const p = { x: 1+Math.floor(random()*(W-2)), y: 1+Math.floor(random()*(H-2)), dir: DIRS[Math.floor(random()*4)] };
      walkers.push(p);
    }
    const turnRate = 0.2;   // 曲がりやすさ
    const branchRate = 0.02; // 分岐の発生率

    let guard=0;
    while(dug<target && guard++ < target*10){
      for(let w=0; w<walkers.length && dug<target; w++){
        const wk = walkers[w];
        if(inBounds(wk.x,wk.y) && map[wk.y][wk.x]===1){ set(wk.x,wk.y,0); dug++; }

        if(random() < turnRate){
          // 直進寄りにしつつ±90°を好む
          if(random() < 0.7){
            const left=[-wk.dir[1], wk.dir[0]]; const right=[wk.dir[1], -wk.dir[0]];
            wk.dir = (random()<0.5?left:right);
          } else {
            wk.dir = DIRS[Math.floor(random()*4)];
          }
        }

        if(walkers.length < maxWalkers && random() < branchRate){
          const ndir = (random()<0.5 ? [-wk.dir[1], wk.dir[0]] : [wk.dir[1], -wk.dir[0]]);
          walkers.push({ x:wk.x, y:wk.y, dir: ndir });
        }

        wk.x += wk.dir[0]; wk.y += wk.dir[1];
        if(wk.x<1) wk.x=1; if(wk.x>W-2) wk.x=W-2; if(wk.y<1) wk.y=1; if(wk.y>H-2) wk.y=H-2;
      }
    }

    // 軽い後処理：孤立/突起の除去
    function floorNeighbors4(x,y){ let c=0; if(map[y][x+1]===0)c++; if(map[y][x-1]===0)c++; if(map[y+1][x]===0)c++; if(map[y-1][x]===0)c++; return c; }
    const next = map.map(row=>row.slice());
    for(let y=1;y<H-1;y++){
      for(let x=1;x<W-1;x++){
        if(map[y][x]===0 && floorNeighbors4(x,y)<=1){ next[y][x]=1; }
      }
    }
    for(let y=1;y<H-1;y++) for(let x=1;x<W-1;x++) map[y][x]=next[y][x];

    ensureConnectivity();
  }

  const gen = {
    id:'lava-caves',
    name:'Lava Caves',
    nameKey: "dungeon.types.lava_caves.name",
    description:'溶岩地形',
    descriptionKey: "dungeon.types.lava_caves.description",
    algorithm:algo,
    mixin:{ normalMixed:0.6, blockDimMixed:0.7, tags:['cave'] }
  };

  // いろんなレベル帯向けに 1st/2nd/3rd を各10種ずつ
  const mkBoss = (depth) => {
    // 深さに応じて 1..depth の範囲で代表階を返す
    const list = [];
    if (depth >= 5) list.push(5);
    if (depth >= 10) list.push(10);
    if (depth >= 15) list.push(15);
    return list;
  };

  const blocks = {
    // 1st: Theme（サイズ控えめ、深さや宝箱バイアスで特徴付け）
    blocks1:[
      {
        key:'lava_theme_01',
        name:'Lava Theme I',
        nameKey: "dungeon.types.lava_caves.blocks.lava_theme_01.name",
        level:+0,
        size:0,
        depth:+1,
        chest:'normal',
        type:'lava-caves',
        bossFloors:mkBoss(6)
      },
      {
        key:'lava_theme_02',
        name:'Lava Theme II',
        nameKey: "dungeon.types.lava_caves.blocks.lava_theme_02.name",
        level:+5,
        size:0,
        depth:+1,
        chest:'less',
        type:'lava-caves',
        bossFloors:mkBoss(7)
      },
      {
        key:'lava_theme_03',
        name:'Lava Theme III',
        nameKey: "dungeon.types.lava_caves.blocks.lava_theme_03.name",
        level:+10,
        size:+1,
        depth:+1,
        chest:'more',
        type:'lava-caves',
        bossFloors:mkBoss(8)
      },
      {
        key:'lava_theme_04',
        name:'Lava Theme IV',
        nameKey: "dungeon.types.lava_caves.blocks.lava_theme_04.name",
        level:+15,
        size:+1,
        depth:+2,
        chest:'normal',
        type:'lava-caves',
        bossFloors:mkBoss(9)
      },
      {
        key:'lava_theme_05',
        name:'Lava Theme V',
        nameKey: "dungeon.types.lava_caves.blocks.lava_theme_05.name",
        level:+20,
        size:+1,
        depth:+2,
        chest:'less',
        type:'lava-caves',
        bossFloors:mkBoss(10)
      },
      {
        key:'lava_theme_06',
        name:'Lava Theme VI',
        nameKey: "dungeon.types.lava_caves.blocks.lava_theme_06.name",
        level:+25,
        size:+2,
        depth:+2,
        chest:'more',
        type:'lava-caves',
        bossFloors:mkBoss(12)
      },
      {
        key:'lava_theme_07',
        name:'Lava Theme VII',
        nameKey: "dungeon.types.lava_caves.blocks.lava_theme_07.name",
        level:+30,
        size:+2,
        depth:+3,
        chest:'normal',
        type:'lava-caves',
        bossFloors:mkBoss(13)
      },
      {
        key:'lava_theme_08',
        name:'Lava Theme VIII',
        nameKey: "dungeon.types.lava_caves.blocks.lava_theme_08.name",
        level:+35,
        size:+2,
        depth:+3,
        chest:'less',
        type:'lava-caves',
        bossFloors:mkBoss(14)
      },
      {
        key:'lava_theme_09',
        name:'Lava Theme IX',
        nameKey: "dungeon.types.lava_caves.blocks.lava_theme_09.name",
        level:+40,
        size:+2,
        depth:+3,
        chest:'more',
        type:'lava-caves',
        bossFloors:mkBoss(15)
      },
      {
        key:'lava_theme_10',
        name:'Lava Theme X',
        nameKey: "dungeon.types.lava_caves.blocks.lava_theme_10.name",
        level:+50,
        size:+2,
        depth:+4,
        chest:'normal',
        type:'lava-caves',
        bossFloors:mkBoss(15)
      },
    ],
    // 2nd: Basalt（サイズやレベル寄与が大きめ）
    blocks2:[
      {
        key:'basalt_01',
        name:'Basalt I',
        nameKey: "dungeon.types.lava_caves.blocks.basalt_01.name",
        level:+0,
        size:0,
        depth:0,
        chest:'normal',
        type:'lava-caves'
      },
      {
        key:'basalt_02',
        name:'Basalt II',
        nameKey: "dungeon.types.lava_caves.blocks.basalt_02.name",
        level:+5,
        size:+1,
        depth:0,
        chest:'less',
        type:'lava-caves'
      },
      {
        key:'basalt_03',
        name:'Basalt III',
        nameKey: "dungeon.types.lava_caves.blocks.basalt_03.name",
        level:+10,
        size:+1,
        depth:+1,
        chest:'more',
        type:'lava-caves'
      },
      {
        key:'basalt_04',
        name:'Basalt IV',
        nameKey: "dungeon.types.lava_caves.blocks.basalt_04.name",
        level:+15,
        size:+1,
        depth:+1,
        chest:'normal',
        type:'lava-caves'
      },
      {
        key:'basalt_05',
        name:'Basalt V',
        nameKey: "dungeon.types.lava_caves.blocks.basalt_05.name",
        level:+20,
        size:+2,
        depth:+1,
        chest:'less',
        type:'lava-caves'
      },
      {
        key:'basalt_06',
        name:'Basalt VI',
        nameKey: "dungeon.types.lava_caves.blocks.basalt_06.name",
        level:+25,
        size:+2,
        depth:+1,
        chest:'more',
        type:'lava-caves'
      },
      {
        key:'basalt_07',
        name:'Basalt VII',
        nameKey: "dungeon.types.lava_caves.blocks.basalt_07.name",
        level:+30,
        size:+2,
        depth:+2,
        chest:'normal',
        type:'lava-caves'
      },
      {
        key:'basalt_08',
        name:'Basalt VIII',
        nameKey: "dungeon.types.lava_caves.blocks.basalt_08.name",
        level:+35,
        size:+2,
        depth:+2,
        chest:'less',
        type:'lava-caves'
      },
      {
        key:'basalt_09',
        name:'Basalt IX',
        nameKey: "dungeon.types.lava_caves.blocks.basalt_09.name",
        level:+40,
        size:+3,
        depth:+2,
        chest:'more',
        type:'lava-caves'
      },
      {
        key:'basalt_10',
        name:'Basalt X',
        nameKey: "dungeon.types.lava_caves.blocks.basalt_10.name",
        level:+50,
        size:+3,
        depth:+2,
        chest:'normal',
        type:'lava-caves'
      },
    ],
    // 3rd: Magma（深さ・ボス階寄与が大きめ）
    blocks3:[
      {
        key:'magma_01',
        name:'Magma I',
        nameKey: "dungeon.types.lava_caves.blocks.magma_01.name",
        level:+0,
        size:0,
        depth:+2,
        chest:'more',
        type:'lava-caves',
        bossFloors:[5]
      },
      {
        key:'magma_02',
        name:'Magma II',
        nameKey: "dungeon.types.lava_caves.blocks.magma_02.name",
        level:+5,
        size:0,
        depth:+2,
        chest:'normal',
        type:'lava-caves',
        bossFloors:[5,10]
      },
      {
        key:'magma_03',
        name:'Magma III',
        nameKey: "dungeon.types.lava_caves.blocks.magma_03.name",
        level:+10,
        size:0,
        depth:+3,
        chest:'less',
        type:'lava-caves',
        bossFloors:[10]
      },
      {
        key:'magma_04',
        name:'Magma IV',
        nameKey: "dungeon.types.lava_caves.blocks.magma_04.name",
        level:+15,
        size:+1,
        depth:+3,
        chest:'more',
        type:'lava-caves',
        bossFloors:[10,15]
      },
      {
        key:'magma_05',
        name:'Magma V',
        nameKey: "dungeon.types.lava_caves.blocks.magma_05.name",
        level:+20,
        size:+1,
        depth:+3,
        chest:'normal',
        type:'lava-caves',
        bossFloors:[15]
      },
      {
        key:'magma_06',
        name:'Magma VI',
        nameKey: "dungeon.types.lava_caves.blocks.magma_06.name",
        level:+25,
        size:+1,
        depth:+3,
        chest:'less',
        type:'lava-caves',
        bossFloors:[5,15]
      },
      {
        key:'magma_07',
        name:'Magma VII',
        nameKey: "dungeon.types.lava_caves.blocks.magma_07.name",
        level:+30,
        size:+1,
        depth:+4,
        chest:'more',
        type:'lava-caves',
        bossFloors:[5,10,15]
      },
      {
        key:'magma_08',
        name:'Magma VIII',
        nameKey: "dungeon.types.lava_caves.blocks.magma_08.name",
        level:+35,
        size:+2,
        depth:+4,
        chest:'normal',
        type:'lava-caves',
        bossFloors:[10,15]
      },
      {
        key:'magma_09',
        name:'Magma IX',
        nameKey: "dungeon.types.lava_caves.blocks.magma_09.name",
        level:+40,
        size:+2,
        depth:+4,
        chest:'less',
        type:'lava-caves',
        bossFloors:[15]
      },
      {
        key:'magma_10',
        name:'Magma X',
        nameKey: "dungeon.types.lava_caves.blocks.magma_10.name",
        level:+50,
        size:+2,
        depth:+4,
        chest:'more',
        type:'lava-caves',
        bossFloors:[5,10,15]
      },
    ]
  };

  window.registerDungeonAddon({
    id:'lava_pack',
    name:'Lava Pack',
    nameKey: "dungeon.packs.lava_pack.name",
    version:'1.0.0',
    blocks,
    generators:[gen]
  });
})();

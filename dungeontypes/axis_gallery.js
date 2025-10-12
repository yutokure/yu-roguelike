// Addon: Axis Gallery - directional halls that separate vertical and horizontal travel
(function(){
  function carveAxisGalleries(ctx){
    const {
      width: W,
      height: H,
      set,
      setFloorType,
      setFloorColor,
      setWallColor,
      getTileMeta,
      ensureConnectivity,
      random,
      inBounds
    } = ctx;

    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        set(x, y, 0);
        setFloorColor(x, y, '#f1f3f5');
      }
    }

    const hubSpacing = 5;
    const midX = Math.floor(W / 2);
    const midY = Math.floor(H / 2);

    for (let x = 2; x < W - 2; x += 4) {
      for (let y = 1; y < H - 1; y++) {
        if (x % hubSpacing === 0 || y % hubSpacing === 0 || x === midX || y === midY) continue;
        setFloorType(x, y, { type: 'vertical' });
        setFloorColor(x, y, '#63e6be');
      }
    }

    for (let y = 2; y < H - 2; y += 4) {
      for (let x = 1; x < W - 1; x++) {
        if (x % hubSpacing === 0 || y % hubSpacing === 0 || x === midX || y === midY) continue;
        const meta = getTileMeta(x, y);
        if (meta && meta.floorType === 'vertical') {
          setFloorType(x, y, 'normal');
          setFloorColor(x, y, '#dee2ff');
          continue;
        }
        setFloorType(x, y, { type: 'horizontal' });
        setFloorColor(x, y, '#ffa94d');
      }
    }

    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        if ((x % hubSpacing === 0 && y % hubSpacing === 0) || x === midX || y === midY) {
          setFloorType(x, y, 'normal');
          setFloorColor(x, y, '#e5dbff');
        }
      }
    }

    for (let y = 3; y < H - 3; y += hubSpacing) {
      for (let x = 3; x < W - 3; x += hubSpacing) {
        if (random() < 0.5) continue;
        for (let dy = 0; dy < 2; dy++) {
          for (let dx = 0; dx < 2; dx++) {
            const tx = x + dx;
            const ty = y + dy;
            if (!inBounds(tx, ty)) continue;
            set(tx, ty, 1);
            setWallColor(tx, ty, '#868e96');
          }
        }
      }
    }

    ensureConnectivity();
  }

  const generator = {
    id: 'axis-gallery',
    name: '軸路の回廊',
    nameKey: "dungeon.types.axis_gallery.name",
    description: '縦横に分かたれた通路が交差する静寂の展示廊',
    descriptionKey: "dungeon.types.axis_gallery.description",
    recommendedLevel: 48,
    algorithm: carveAxisGalleries,
    mixin: { normalMixed: 0.3, blockDimMixed: 0.5, tags: ['gallery', 'hazard'] }
  };

  // Chest bias mapping note: legacy labels mapped as 'rich'→'more', 'rare'→'less', 'legendary'→'more'
  const blocks = {
    blocks1: [
      {
        key: 'axis_gallery_a',
        name: '軸路の玄関',
        nameKey: "dungeon.types.axis_gallery.blocks.axis_gallery_a.name",
        level: +10,
        size: 0,
        depth: +1,
        chest: 'normal',
        type: 'axis-gallery'
      },
      {
        key: 'axis_gallery_b',
        name: '展示列柱',
        nameKey: "dungeon.types.axis_gallery.blocks.axis_gallery_b.name",
        level: +18,
        size: +1,
        depth: +2,
        chest: 'more',
        type: 'axis-gallery'
      },
      {
        key: 'axis_gallery_c',
        name: '方位の回廊',
        nameKey: "dungeon.types.axis_gallery.blocks.axis_gallery_c.name",
        level: +22,
        size: +1,
        depth: +2,
        chest: 'normal',
        type: 'axis-gallery'
      },
      {
        key: 'axis_gallery_d',
        name: '均衡展示室',
        nameKey: "dungeon.types.axis_gallery.blocks.axis_gallery_d.name",
        level: +26,
        size: +2,
        depth: +3,
        chest: 'more',
        type: 'axis-gallery'
      }
    ],
    blocks2: [
      {
        key: 'axis_gallery_core',
        name: '軸交差中庭',
        nameKey: "dungeon.types.axis_gallery.blocks.axis_gallery_core.name",
        level: +26,
        size: +1,
        depth: +2,
        chest: 'more',
        type: 'axis-gallery'
      },
      {
        key: 'axis_gallery_cross',
        name: '交差展示廊',
        nameKey: "dungeon.types.axis_gallery.blocks.axis_gallery_cross.name",
        level: +30,
        size: +1,
        depth: +2,
        chest: 'more',
        type: 'axis-gallery'
      },
      {
        key: 'axis_gallery_hub',
        name: '連結の中心',
        nameKey: "dungeon.types.axis_gallery.blocks.axis_gallery_hub.name",
        level: +32,
        size: +2,
        depth: +3,
        chest: 'more',
        type: 'axis-gallery'
      },
      {
        key: 'axis_gallery_reflect',
        name: '鏡写しの回廊',
        nameKey: "dungeon.types.axis_gallery.blocks.axis_gallery_reflect.name",
        level: +34,
        size: +2,
        depth: +3,
        chest: 'less',
        type: 'axis-gallery'
      }
    ],
    blocks3: [
      {
        key: 'axis_gallery_boss',
        name: '双軸の祭壇',
        nameKey: "dungeon.types.axis_gallery.blocks.axis_gallery_boss.name",
        level: +34,
        size: +2,
        depth: +3,
        chest: 'more',
        type: 'axis-gallery',
        bossFloors: [7, 14]
      },
      {
        key: 'axis_gallery_relic',
        name: '軸心の聖遺',
        nameKey: "dungeon.types.axis_gallery.blocks.axis_gallery_relic.name",
        level: +38,
        size: +2,
        depth: +3,
        chest: 'more',
        type: 'axis-gallery',
        bossFloors: [10, 18]
      },
      {
        key: 'axis_gallery_sanctum',
        name: '静謐の至堂',
        nameKey: "dungeon.types.axis_gallery.blocks.axis_gallery_sanctum.name",
        level: +42,
        size: +3,
        depth: +4,
        chest: 'less',
        type: 'axis-gallery',
        bossFloors: [14]
      },
      {
        key: 'axis_gallery_vault',
        name: '軸封の宝庫',
        nameKey: "dungeon.types.axis_gallery.blocks.axis_gallery_vault.name",
        level: +46,
        size: +3,
        depth: +4,
        chest: 'more',
        type: 'axis-gallery',
        bossFloors: [21]
      }
    ]
  };

  window.registerDungeonAddon({
    id: 'axis_gallery_pack',
    name: 'Axis Gallery Pack',
    nameKey: "dungeon.packs.axis_gallery_pack.name",
    version: '1.0.0',
    generators: [generator],
    blocks
  });
})();

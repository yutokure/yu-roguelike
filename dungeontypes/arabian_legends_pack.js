(function(){
  const ADDON_ID = 'arabian_legends_pack';
  const ADDON_NAME = 'Arabian Legends Pack';
  const VERSION = '1.2.0';

  const palettes = {
    duskMirage: ['#4a2d1f', '#8c4f2b', '#c98646', '#f4d79c'],
    moonlitOasis: ['#112031', '#1e3554', '#3d7891', '#8fd4d1'],
    saffronCitadel: ['#4f260b', '#8d4f1c', '#c68032', '#f5cf87'],
    azureMinaret: ['#1a374f', '#2f5f75', '#66a9b6', '#d0f2ff'],
    emeraldQanat: ['#0f2c28', '#1f4e44', '#3f8e7a', '#a3ead3'],
    auroraDunes: ['#26182b', '#56356f', '#a95f86', '#f6d6a8'],
    sapphireMadrasa: ['#0f1f2b', '#123d47', '#3f7f88', '#9de1e3'],
    lanternSouk: ['#36191a', '#602c1f', '#b55a29', '#ffd27a'],
    celestialNadir: ['#12131c', '#2b3140', '#555f7d', '#cfcde2'],
    prismaticCarpet: ['#32111f', '#722b45', '#c85a7e', '#ffd6e8'],
    hangingGardens: ['#16311c', '#245132', '#438c59', '#c4f2b8'],
    emberSanctum: ['#180f12', '#462020', '#9c3f2c', '#f6a15b'],
    astralMirage: ['#141824', '#2e2e4f', '#5c5eb0', '#d1d3ff']
  };

  function paletteColor(palette, t) {
    if (!Array.isArray(palette) || palette.length === 0) return '#ffffff';
    if (palette.length === 1) return palette[0];
    const scaled = t * (palette.length - 1);
    const idx = Math.min(palette.length - 2, Math.max(0, Math.floor(scaled)));
    const localT = Math.min(1, Math.max(0, scaled - idx));
    return lerpColor(palette[idx], palette[idx + 1], localT);
  }

  function lerpColor(top, bottom, t) {
    const parse = (hex) => {
      const v = hex.replace('#', '');
      return [
        parseInt(v.slice(0, 2), 16),
        parseInt(v.slice(2, 4), 16),
        parseInt(v.slice(4, 6), 16)
      ];
    };
    const [r1, g1, b1] = parse(top);
    const [r2, g2, b2] = parse(bottom);
    const mix = (a, b) => Math.round(a + (b - a) * t)
      .toString(16)
      .padStart(2, '0');
    return `#${mix(r1, r2)}${mix(g1, g2)}${mix(b1, b2)}`;
  }

  function fillGradientWalls(ctx, top, bottom) {
    const { width: W, height: H, set, setWallColor } = ctx;
    for (let y = 0; y < H; y++) {
      const blend = y / Math.max(1, H - 1);
      const tone = lerpColor(top, bottom, blend);
      for (let x = 0; x < W; x++) {
        set(x, y, 1);
        setWallColor(x, y, tone);
      }
    }
  }

  function fillPaletteWalls(ctx, palette) {
    const { width: W, height: H, set, setWallColor } = ctx;
    for (let y = 0; y < H; y++) {
      const blend = y / Math.max(1, H - 1);
      const tone = paletteColor(palette, blend);
      for (let x = 0; x < W; x++) {
        set(x, y, 1);
        setWallColor(x, y, tone);
      }
    }
  }

  function scatterPalette(ctx, count, palette, filter) {
    const { width: W, height: H, random, get, setWallColor, setFloorColor } = ctx;
    for (let i = 0; i < count; i++) {
      const x = 1 + Math.floor(random() * (W - 2));
      const y = 1 + Math.floor(random() * (H - 2));
      if (filter && !filter(x, y, get(x, y))) continue;
      const tone = paletteColor(palette, random());
      if (get(x, y) === 0) {
        setFloorColor(x, y, tone);
      } else {
        setWallColor(x, y, tone);
      }
    }
  }

  function carveEllipse(ctx, cx, cy, rx, ry, floorColor) {
    const { set, inBounds, setFloorColor } = ctx;
    const rxs = rx * rx;
    const rys = ry * ry;
    for (let y = -ry; y <= ry; y++) {
      for (let x = -rx; x <= rx; x++) {
        const nx = cx + x;
        const ny = cy + y;
        if (!inBounds(nx, ny)) continue;
        if ((x * x) * rys + (y * y) * rxs <= rxs * rys) {
          set(nx, ny, 0);
          if (floorColor) setFloorColor(nx, ny, floorColor);
        }
      }
    }
  }

  function carveRing(ctx, cx, cy, radius, thickness, floorColor) {
    const { set, inBounds, setFloorColor } = ctx;
    const outer2 = radius * radius;
    const inner = Math.max(0, radius - thickness);
    const inner2 = inner * inner;
    for (let y = -radius; y <= radius; y++) {
      for (let x = -radius; x <= radius; x++) {
        const nx = cx + x;
        const ny = cy + y;
        if (!inBounds(nx, ny)) continue;
        const d2 = x * x + y * y;
        if (d2 <= outer2 && d2 >= inner2) {
          set(nx, ny, 0);
          if (floorColor) setFloorColor(nx, ny, floorColor);
        }
      }
    }
  }

  function carveLine(ctx, x0, y0, x1, y1, width, floorColor) {
    const { set, inBounds, setFloorColor } = ctx;
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    const half = Math.max(0, Math.floor(width / 2));
    while (true) {
      for (let ox = -half; ox <= half; ox++) {
        for (let oy = -half; oy <= half; oy++) {
          const nx = x0 + ox;
          const ny = y0 + oy;
          if (!inBounds(nx, ny)) continue;
          ctx.set(nx, ny, 0);
          if (floorColor) setFloorColor(nx, ny, floorColor);
        }
      }
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }
  }

  function scatter(ctx, count, callback) {
    const { width: W, height: H, random } = ctx;
    for (let i = 0; i < count; i++) {
      const x = 1 + Math.floor(random() * (W - 2));
      const y = 1 + Math.floor(random() * (H - 2));
      callback(x, y, i);
    }
  }

  function mirageCaravan(ctx) {
    const { width: W, height: H, random, setFloorColor, ensureConnectivity } = ctx;
    fillPaletteWalls(ctx, palettes.duskMirage);

    const trackCount = 4 + Math.floor(random() * 3);
    for (let i = 0; i < trackCount; i++) {
      let x = 2 + Math.floor(random() * (W - 4));
      let y = 1;
      const tone = random() < 0.5 ? '#e3c182' : '#d9b06c';
      while (y < H - 2) {
        if (ctx.inBounds(x, y)) {
          ctx.set(x, y, 0);
          setFloorColor(x, y, tone);
        }
        if (random() < 0.4) x += random() < 0.5 ? -1 : 1;
        y += 1;
        x = Math.max(1, Math.min(W - 2, x));
      }
    }

    scatter(ctx, Math.floor((W * H) / 90), (x, y) => {
      if (random() < 0.2) {
        carveEllipse(ctx, x, y, 2, 2, '#7ec5b3');
      } else if (random() < 0.45) {
        carveEllipse(ctx, x, y, 1, 1, '#d9a658');
      }
    });

    ensureConnectivity();
  }

  function moonlitOasis(ctx) {
    const { width: W, height: H, random, ensureConnectivity, setFloorColor, setWallColor } = ctx;
    fillPaletteWalls(ctx, palettes.moonlitOasis);

    carveEllipse(ctx, Math.floor(W / 2), Math.floor(H / 2), Math.floor(W / 4), Math.floor(H / 4), '#4fb3a8');

    const moonGlow = ['#83d8cf', '#9fe5da', '#72c7c0'];
    scatter(ctx, 25, (x, y) => {
      if (ctx.get(x, y) === 0) setFloorColor(x, y, moonGlow[Math.floor(random() * moonGlow.length)]);
    });

    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
      const radius = Math.min(W, H) / 2 - 2;
      const cx = Math.floor(W / 2 + Math.cos(angle) * radius);
      const cy = Math.floor(H / 2 + Math.sin(angle) * radius);
      carveLine(ctx, Math.floor(W / 2), Math.floor(H / 2), cx, cy, 2, '#7ddfd5');
    }

    scatter(ctx, 16, (x, y) => {
      if (ctx.get(x, y) === 1) setWallColor(x, y, random() < 0.5 ? '#f7e6b7' : '#c9b48a');
    });

    ensureConnectivity();
  }

  function saffronCitadel(ctx) {
    const { width: W, height: H, random, setFloorColor, ensureConnectivity } = ctx;
    fillPaletteWalls(ctx, palettes.saffronCitadel);

    const tiers = 4;
    const margin = 2;
    for (let t = 0; t < tiers; t++) {
      const inset = margin + t * 2;
      const color = t % 2 === 0 ? '#cc8a32' : '#e1a24a';
      for (let y = inset; y < H - inset; y++) {
        for (let x = inset; x < W - inset; x++) {
          ctx.set(x, y, 0);
          if (x === inset || x === W - inset - 1 || y === inset || y === H - inset - 1) {
            setFloorColor(x, y, '#f0c46d');
          } else if (t === tiers - 1 || random() < 0.15) {
            setFloorColor(x, y, color);
          }
        }
      }
    }

    scatter(ctx, Math.floor(W / 3), (x, y) => {
      if (ctx.get(x, y) === 0 && random() < 0.2) setFloorColor(x, y, '#f6d89a');
    });

    ensureConnectivity();
  }

  function labyrinthineSouk(ctx) {
    const { width: W, height: H, random, ensureConnectivity, setFloorColor, setWallColor, get } = ctx;
    fillPaletteWalls(ctx, palettes.lanternSouk);

    const cellSize = 4;
    for (let y = 1; y < H - 1; y += cellSize) {
      for (let x = 1; x < W - 1; x += cellSize) {
        const blockWidth = Math.min(cellSize - 1, W - 2 - x);
        const blockHeight = Math.min(cellSize - 1, H - 2 - y);
        for (let by = 0; by <= blockHeight; by++) {
          for (let bx = 0; bx <= blockWidth; bx++) {
            const nx = x + bx;
            const ny = y + by;
            ctx.set(nx, ny, 0);
            setFloorColor(nx, ny, '#d39f6a');
          }
        }
        const openNorth = y > 2 ? Math.floor(x + random() * blockWidth) : null;
        const openWest = x > 2 ? Math.floor(y + random() * blockHeight) : null;
        if (openNorth !== null) carveLine(ctx, openNorth, y - 1, openNorth, y, 1, '#c88f59');
        if (openWest !== null) carveLine(ctx, x - 1, openWest, x, openWest, 1, '#c88f59');
      }
    }

    scatter(ctx, Math.floor(W / 2), (x, y) => {
      if (get(x, y) === 0 && random() < 0.1) setFloorColor(x, y, '#f2d3a0');
      if (get(x, y) === 1 && random() < 0.05) setWallColor(x, y, '#cf945b');
    });

    ensureConnectivity();
  }

  function windspireMinarets(ctx) {
    const { width: W, height: H, random, ensureConnectivity, setFloorColor, setWallColor, inBounds } = ctx;
    fillPaletteWalls(ctx, palettes.azureMinaret);

    const spireCount = Math.max(6, Math.floor((W * H) / 120));
    scatter(ctx, spireCount, (x, y) => {
      carveEllipse(ctx, x, y, 1, 2, '#9ccad5');
      carveEllipse(ctx, x, y - 2, 1, 1, '#b6dbe5');
      if (inBounds(x, y - 3)) {
        ctx.set(x, y - 3, 1);
        setWallColor(x, y - 3, '#e4efe8');
      }
    });

    for (let i = 0; i < spireCount; i++) {
      const angle = random() * Math.PI * 2;
      const cx = Math.floor(W / 2 + Math.cos(angle) * (W / 3));
      const cy = Math.floor(H / 2 + Math.sin(angle) * (H / 3));
      carveLine(ctx, Math.floor(W / 2), Math.floor(H / 2), cx, cy, 1, '#bcdde6');
    }

    scatter(ctx, Math.floor((W * H) / 80), (x, y) => {
      if (ctx.get(x, y) === 0 && random() < 0.1) setFloorColor(x, y, '#d4f0f9');
    });

    ensureConnectivity();
  }

  function sunkenQanat(ctx) {
    const { width: W, height: H, random, ensureConnectivity, setFloorColor, get } = ctx;
    fillPaletteWalls(ctx, palettes.emeraldQanat);

    const nodes = 6 + Math.floor(random() * 4);
    const points = [];
    for (let i = 0; i < nodes; i++) {
      const x = 2 + Math.floor(random() * (W - 4));
      const y = 2 + Math.floor(random() * (H - 4));
      carveEllipse(ctx, x, y, 2, 2, '#4fa89b');
      points.push([x, y]);
    }

    for (let i = 0; i < points.length; i++) {
      const [x0, y0] = points[i];
      const [x1, y1] = points[(i + 1) % points.length];
      carveLine(ctx, x0, y0, x1, y1, 2, '#3c8b7b');
    }

    scatter(ctx, Math.floor((W * H) / 70), (x, y) => {
      if (get(x, y) === 0 && random() < 0.2) setFloorColor(x, y, '#6ec5b9');
    });

    ensureConnectivity();
  }

  function starSandGarden(ctx) {
    const { width: W, height: H, random, ensureConnectivity, setFloorColor, setWallColor } = ctx;
    fillPaletteWalls(ctx, palettes.duskMirage);

    const cx = Math.floor(W / 2);
    const cy = Math.floor(H / 2);
    const radius = Math.min(W, H) / 2 - 2;
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const tx = Math.floor(cx + Math.cos(angle) * radius);
      const ty = Math.floor(cy + Math.sin(angle) * radius);
      carveLine(ctx, cx, cy, tx, ty, 1, '#f0d6a2');
    }

    carveRing(ctx, cx, cy, Math.floor(radius * 0.6), 2, '#e6c98b');
    carveRing(ctx, cx, cy, Math.floor(radius * 0.35), 2, '#d4b06c');
    carveEllipse(ctx, cx, cy, 2, 2, '#b57b3d');

    scatter(ctx, Math.floor((W * H) / 60), (x, y) => {
      if (ctx.get(x, y) === 0 && random() < 0.15) setFloorColor(x, y, '#f7dfb6');
      if (ctx.get(x, y) === 1 && random() < 0.08) setWallColor(x, y, '#d0a062');
    });

    ensureConnectivity();
  }

  function gildedTombs(ctx) {
    const { width: W, height: H, random, ensureConnectivity, setFloorColor } = ctx;
    fillGradientWalls(ctx, '#2a2018', '#9c7c52');

    const chamberCount = Math.max(6, Math.floor((W * H) / 120));
    scatter(ctx, chamberCount, (x, y) => {
      const w = 2 + Math.floor(random() * 2);
      const h = 2 + Math.floor(random() * 2);
      carveEllipse(ctx, x, y, w, h, '#cbb078');
      if (random() < 0.3) carveEllipse(ctx, x, y, Math.max(1, w - 1), Math.max(1, h - 1), '#ab8c55');
    });

    scatter(ctx, Math.floor((W * H) / 90), (x, y) => {
      if (ctx.get(x, y) === 0 && random() < 0.1) setFloorColor(x, y, '#f4e0a8');
    });

    ensureConnectivity();
  }

  function stormDjinnForge(ctx) {
    const { width: W, height: H, random, ensureConnectivity, setFloorColor, setWallColor } = ctx;
    fillPaletteWalls(ctx, palettes.celestialNadir);

    const swirls = 6 + Math.floor(random() * 4);
    for (let i = 0; i < swirls; i++) {
      let angle = random() * Math.PI * 2;
      let radius = Math.min(W, H) / 2 - 3;
      const centerX = Math.floor(W / 2 + Math.cos(angle) * 2);
      const centerY = Math.floor(H / 2 + Math.sin(angle) * 2);
      for (let step = 0; step < radius; step++) {
        const x = Math.floor(centerX + Math.cos(angle) * step);
        const y = Math.floor(centerY + Math.sin(angle) * step);
        if (ctx.inBounds(x, y)) {
          ctx.set(x, y, 0);
          setFloorColor(x, y, step % 2 === 0 ? '#f3b96a' : '#d88f3d');
        }
        angle += 0.12;
      }
    }

    scatter(ctx, Math.floor((W * H) / 75), (x, y) => {
      if (ctx.get(x, y) === 1 && random() < 0.15) setWallColor(x, y, '#f8e2b2');
    });

    ensureConnectivity();
  }

  function celestialAstrolabe(ctx) {
    const { width: W, height: H, ensureConnectivity, random, setFloorColor } = ctx;
    fillPaletteWalls(ctx, palettes.celestialNadir);

    const cx = Math.floor(W / 2);
    const cy = Math.floor(H / 2);
    const rings = 4;
    for (let r = 1; r <= rings; r++) {
      const radius = Math.floor((Math.min(W, H) / 2 - 2) * (r / rings));
      carveRing(ctx, cx, cy, radius, 2, r % 2 === 0 ? '#d8c593' : '#bba36d');
    }

    const spokes = 6;
    for (let i = 0; i < spokes; i++) {
      const angle = (Math.PI * 2 * i) / spokes;
      const tx = Math.floor(cx + Math.cos(angle) * (Math.min(W, H) / 2 - 2));
      const ty = Math.floor(cy + Math.sin(angle) * (Math.min(W, H) / 2 - 2));
      carveLine(ctx, cx, cy, tx, ty, 1, '#f1d9a0');
    }

    scatter(ctx, Math.floor((W * H) / 80), (x, y) => {
      if (ctx.get(x, y) === 0 && random() < 0.2) setFloorColor(x, y, '#fff2ce');
    });

    ensureConnectivity();
  }

  function auroraDuneSea(ctx) {
    const { width: W, height: H, random, ensureConnectivity, setFloorColor, inBounds } = ctx;
    fillPaletteWalls(ctx, palettes.auroraDunes);

    const duneCount = 5 + Math.floor(random() * 4);
    for (let d = 0; d < duneCount; d++) {
      const baseline = 2 + Math.floor(random() * (H - 6));
      const amplitude = 1 + Math.floor(random() * 3);
      const freq = 0.05 + random() * 0.05;
      const offset = random() * Math.PI * 2;
      for (let x = 1; x < W - 1; x++) {
        const wave = baseline + Math.sin(x * freq + offset) * amplitude;
        for (let t = -1; t <= 1; t++) {
          const ny = Math.floor(wave + t);
          if (!inBounds(x, ny)) continue;
          ctx.set(x, ny, 0);
          const tone = paletteColor(palettes.auroraDunes, Math.min(1, Math.max(0, (ny + H) / (2 * H))));
          setFloorColor(x, ny, tone);
        }
      }
    }

    scatterPalette(ctx, Math.floor((W * H) / 60), palettes.auroraDunes, (x, y, tile) => tile === 0);

    ensureConnectivity();
  }

  function sapphireMadrasa(ctx) {
    const { width: W, height: H, ensureConnectivity, setFloorColor, get } = ctx;
    fillPaletteWalls(ctx, palettes.sapphireMadrasa);

    const cx = Math.floor(W / 2);
    const cy = Math.floor(H / 2);
    const armThickness = 2;

    for (let y = 1; y < H - 1; y++) {
      for (let dx = -armThickness; dx <= armThickness; dx++) {
        const nx = cx + dx;
        if (nx > 0 && nx < W - 1) {
          ctx.set(nx, y, 0);
          setFloorColor(nx, y, paletteColor(palettes.sapphireMadrasa, (y / H)));
        }
      }
    }

    for (let x = 1; x < W - 1; x++) {
      for (let dy = -armThickness; dy <= armThickness; dy++) {
        const ny = cy + dy;
        if (ny > 0 && ny < H - 1) {
          ctx.set(x, ny, 0);
          setFloorColor(x, ny, paletteColor(palettes.sapphireMadrasa, (x / W)));
        }
      }
    }

    carveEllipse(ctx, cx, cy, Math.floor(W / 6), Math.floor(H / 6), paletteColor(palettes.sapphireMadrasa, 0.7));

    for (let radius = Math.min(cx, cy) - 3; radius > 2; radius -= 3) {
      carveRing(ctx, cx, cy, radius, 1, paletteColor(palettes.sapphireMadrasa, radius / Math.max(cx, cy)));
    }

    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        if (get(x, y) === 0 && (x + y) % 4 === 0) {
          setFloorColor(x, y, paletteColor(palettes.sapphireMadrasa, (x + y) / (W + H)));
        }
      }
    }

    ensureConnectivity();
  }

  function prismaticCarpetGallery(ctx) {
    const { width: W, height: H, random, ensureConnectivity, setFloorColor } = ctx;
    fillPaletteWalls(ctx, palettes.prismaticCarpet);

    for (let band = 2; band < H - 2; band += 3) {
      const hue = paletteColor(palettes.prismaticCarpet, band / H);
      carveLine(ctx, 1, band, W - 2, band, 2, hue);
    }

    for (let x = 2; x < W - 2; x += 4) {
      const hue = paletteColor(palettes.prismaticCarpet, x / W);
      carveLine(ctx, x, 1, x, H - 2, 1, hue);
    }

    scatterPalette(ctx, Math.floor((W * H) / 70), palettes.prismaticCarpet, () => true);

    scatter(ctx, Math.floor((W * H) / 90), (x, y) => {
      if (ctx.get(x, y) === 0 && random() < 0.2) {
        setFloorColor(x, y, paletteColor(palettes.prismaticCarpet, (x % 6) / 6));
      }
    });

    ensureConnectivity();
  }

  function hangingGardenTerraces(ctx) {
    const { width: W, height: H, ensureConnectivity, random, setFloorColor } = ctx;
    fillPaletteWalls(ctx, palettes.hangingGardens);

    const tiers = 5;
    for (let tier = 0; tier < tiers; tier++) {
      const inset = 2 + tier * 2;
      if (inset >= Math.min(W, H) / 2) break;
      for (let y = inset; y < H - inset; y++) {
        for (let x = inset; x < W - inset; x++) {
          ctx.set(x, y, 0);
          if ((x + y + tier) % 3 === 0) {
            setFloorColor(x, y, paletteColor(palettes.hangingGardens, tier / tiers));
          } else if (random() < 0.05) {
            setFloorColor(x, y, paletteColor(palettes.hangingGardens, random()));
          }
        }
      }
    }

    scatter(ctx, Math.floor((W * H) / 80), (x, y) => {
      if (ctx.get(x, y) === 0 && random() < 0.25) {
        setFloorColor(x, y, paletteColor(palettes.hangingGardens, (y / H)));
      }
    });

    ensureConnectivity();
  }

  function emberglassSanctum(ctx) {
    const { width: W, height: H, ensureConnectivity, random, setFloorColor } = ctx;
    fillPaletteWalls(ctx, palettes.emberSanctum);

    const cx = Math.floor(W / 2);
    const cy = Math.floor(H / 2);
    const arms = 8;
    for (let i = 0; i < arms; i++) {
      const angle = (Math.PI * 2 * i) / arms;
      const length = Math.min(W, H) / 2 - 2;
      const tx = Math.floor(cx + Math.cos(angle) * length);
      const ty = Math.floor(cy + Math.sin(angle) * length);
      carveLine(ctx, cx, cy, tx, ty, 2, paletteColor(palettes.emberSanctum, i / arms));
    }

    for (let r = 2; r < Math.min(cx, cy); r += 3) {
      carveRing(ctx, cx, cy, r, 1, paletteColor(palettes.emberSanctum, r / Math.min(cx, cy)));
    }

    scatter(ctx, Math.floor((W * H) / 80), (x, y) => {
      if (ctx.get(x, y) === 0 && random() < 0.2) {
        setFloorColor(x, y, paletteColor(palettes.emberSanctum, ((x * y) % 12) / 12));
      }
    });

    ensureConnectivity();
  }

  function astralMirageArchive(ctx) {
    const { width: W, height: H, ensureConnectivity, random, setFloorColor } = ctx;
    fillPaletteWalls(ctx, palettes.astralMirage);

    const cx = Math.floor(W / 2);
    const cy = Math.floor(H / 2);
    const spiralTurns = 3 + Math.floor(random() * 2);
    let angle = 0;
    let radius = 1;
    const maxRadius = Math.min(cx, cy) - 2;
    while (radius < maxRadius) {
      const tx = Math.floor(cx + Math.cos(angle) * radius);
      const ty = Math.floor(cy + Math.sin(angle) * radius);
      carveLine(ctx, cx, cy, tx, ty, 1, paletteColor(palettes.astralMirage, radius / maxRadius));
      angle += (Math.PI * 2 * spiralTurns) / (maxRadius * 2);
      radius += 0.75;
    }

    scatterPalette(ctx, Math.floor((W * H) / 65), palettes.astralMirage, (x, y, tile) => tile === 0);

    ensureConnectivity();
  }

  function createGenerators() {
    return [
      {
        id: 'mirage-caravan',
        name: '蜃気楼の隊商路',
        nameKey: "dungeon.types.mirage_caravan.name",
        description: '砂漠の商隊跡とオアシスが点在するゆらめく回廊。',
        descriptionKey: "dungeon.types.mirage_caravan.description",
        algorithm: mirageCaravan,
        mixin: { normalMixed: 0.5, blockDimMixed: 0.4, tags: ['desert', 'field', 'maze'] }
      },
      {
        id: 'moonlit-oasis',
        name: '月影のオアシス',
        nameKey: "dungeon.types.moonlit_oasis.name",
        description: '月光が照らす泉と運河が広がる静かな夜の砂漠。',
        descriptionKey: "dungeon.types.moonlit_oasis.description",
        dark: true,
        algorithm: moonlitOasis,
        mixin: { normalMixed: 0.35, blockDimMixed: 0.55, tags: ['water', 'desert', 'ritual'] }
      },
      {
        id: 'saffron-citadel',
        name: 'サフランの城砦',
        nameKey: "dungeon.types.saffron_citadel.name",
        description: '金砂の層が重なる階段状の防衛拠点。',
        descriptionKey: "dungeon.types.saffron_citadel.description",
        algorithm: saffronCitadel,
        mixin: { normalMixed: 0.6, blockDimMixed: 0.35, tags: ['fortress', 'desert'] }
      },
      {
        id: 'labyrinthine-souk',
        name: '迷宮のスーク',
        nameKey: "dungeon.types.labyrinthine_souk.name",
        description: '露店がひしめく複雑な市場の路地裏。',
        descriptionKey: "dungeon.types.labyrinthine_souk.description",
        algorithm: labyrinthineSouk,
        mixin: { normalMixed: 0.45, blockDimMixed: 0.45, tags: ['maze', 'urban', 'market'] }
      },
      {
        id: 'windspire-minarets',
        name: '風塔ミナレット',
        nameKey: "dungeon.types.windspire_minarets.name",
        description: '高くそびえるミナレットと気流の回廊。',
        descriptionKey: "dungeon.types.windspire_minarets.description",
        algorithm: windspireMinarets,
        mixin: { normalMixed: 0.4, blockDimMixed: 0.5, tags: ['vertical', 'sky', 'desert'] }
      },
      {
        id: 'sunken-qanat',
        name: '地底カナート',
        nameKey: "dungeon.types.sunken_qanat.name",
        description: '地下水路が結ぶオアシス群と涼しい風穴。',
        descriptionKey: "dungeon.types.sunken_qanat.description",
        algorithm: sunkenQanat,
        mixin: { normalMixed: 0.5, blockDimMixed: 0.45, tags: ['water', 'underground'] }
      },
      {
        id: 'star-sand-garden',
        name: '星砂の庭園',
        nameKey: "dungeon.types.star_sand_garden.name",
        description: '星型の回廊と幾何学紋様が広がる砂庭。',
        descriptionKey: "dungeon.types.star_sand_garden.description",
        algorithm: starSandGarden,
        mixin: { normalMixed: 0.55, blockDimMixed: 0.35, tags: ['ritual', 'desert'] }
      },
      {
        id: 'gilded-tombs',
        name: '黄金の墳墓街',
        nameKey: "dungeon.types.gilded_tombs.name",
        description: '砂の下に眠る王族の墓室群。',
        descriptionKey: "dungeon.types.gilded_tombs.description",
        algorithm: gildedTombs,
        mixin: { normalMixed: 0.4, blockDimMixed: 0.5, tags: ['crypt', 'desert'] }
      },
      {
        id: 'storm-djinn-forge',
        name: '嵐精の炉',
        nameKey: "dungeon.types.storm_djinn_forge.name",
        description: 'ジンが鍛造した嵐の導線が渦巻く魔鍛冶場。',
        descriptionKey: "dungeon.types.storm_djinn_forge.description",
        dark: true,
        algorithm: stormDjinnForge,
        mixin: { normalMixed: 0.3, blockDimMixed: 0.55, tags: ['forge', 'arcane', 'storm'] }
      },
      {
        id: 'celestial-astrolabe',
        name: '天球アストロラーベ',
        nameKey: "dungeon.types.celestial_astrolabe.name",
        description: '星の軌跡を刻む円環と星図の聖堂。',
        descriptionKey: "dungeon.types.celestial_astrolabe.description",
        algorithm: celestialAstrolabe,
        mixin: { normalMixed: 0.35, blockDimMixed: 0.55, tags: ['ritual', 'astral'] }
      },
      {
        id: 'aurora-dune-sea',
        name: '黎明の砂海',
        nameKey: "dungeon.types.aurora_dune_sea.name",
        description: 'オーロラが揺らめく砂丘が幾重にも波打つ幻彩の海。',
        descriptionKey: "dungeon.types.aurora_dune_sea.description",
        algorithm: auroraDuneSea,
        mixin: { normalMixed: 0.5, blockDimMixed: 0.4, tags: ['desert', 'mirage', 'open-space'] }
      },
      {
        id: 'sapphire-madrasa',
        name: '蒼瑠璃のマドラサ',
        nameKey: "dungeon.types.sapphire_madrasa.name",
        description: '幾何学タイルが輝く左右対称の学術庭園。',
        descriptionKey: "dungeon.types.sapphire_madrasa.description",
        algorithm: sapphireMadrasa,
        mixin: { normalMixed: 0.45, blockDimMixed: 0.45, tags: ['ritual', 'urban', 'sacred'] }
      },
      {
        id: 'prismatic-carpet-gallery',
        name: '虹織の絨毯回廊',
        nameKey: "dungeon.types.prismatic_carpet_gallery.name",
        description: '織機のように色帯が交差する華やかな展示街路。',
        descriptionKey: "dungeon.types.prismatic_carpet_gallery.description",
        algorithm: prismaticCarpetGallery,
        mixin: { normalMixed: 0.55, blockDimMixed: 0.35, tags: ['market', 'maze', 'festival'] }
      },
      {
        id: 'hanging-garden-terraces',
        name: '宙庭の段丘',
        nameKey: "dungeon.types.hanging_garden_terraces.name",
        description: '空に浮かぶ庭園が段状に連なる翠の聖域。',
        descriptionKey: "dungeon.types.hanging_garden_terraces.description",
        algorithm: hangingGardenTerraces,
        mixin: { normalMixed: 0.6, blockDimMixed: 0.3, tags: ['garden', 'fortress'] }
      },
      {
        id: 'emberglass-sanctum',
        name: '熾砂の聖室',
        nameKey: "dungeon.types.emberglass_sanctum.name",
        description: '赤熱するガラス円環が連なる魔術の炉心。',
        descriptionKey: "dungeon.types.emberglass_sanctum.description",
        dark: true,
        algorithm: emberglassSanctum,
        mixin: { normalMixed: 0.3, blockDimMixed: 0.6, tags: ['forge', 'ritual', 'heat'] }
      },
      {
        id: 'astral-mirage-archive',
        name: '星幻の書架',
        nameKey: "dungeon.types.astral_mirage_archive.name",
        description: '星砂を編んだ螺旋回廊に記憶の書が漂う資料庫。',
        descriptionKey: "dungeon.types.astral_mirage_archive.description",
        algorithm: astralMirageArchive,
        mixin: { normalMixed: 0.35, blockDimMixed: 0.6, tags: ['astral', 'library', 'ritual'] }
      }
    ];
  }

  function createBlocks() {
    const blocks1 = [
      {
        key: 'arabia-mirage-path',
        name: 'طريق السراب',
        nameKey: "dungeon.types.mirage_caravan.blocks.arabia-mirage-path.name",
        level: +1,
        size: 0,
        depth: +1,
        chest: 'normal',
        type: 'mirage-caravan'
      },
      {
        key: 'arabia-caravan-camp',
        name: 'معسكر القافلة',
        nameKey: "dungeon.types.mirage_caravan.blocks.arabia-caravan-camp.name",
        level: +2,
        size: +1,
        depth: +1,
        chest: 'more',
        type: 'mirage-caravan'
      },
      {
        key: 'arabia-oasis-heart',
        name: 'قلب الواحة',
        nameKey: "dungeon.types.moonlit_oasis.blocks.arabia-oasis-heart.name",
        level: +1,
        size: 0,
        depth: +1,
        chest: 'normal',
        type: 'moonlit-oasis'
      },
      {
        key: 'arabia-saffron-terrace',
        name: 'شرفة الزعفران',
        nameKey: "dungeon.types.saffron_citadel.blocks.arabia-saffron-terrace.name",
        level: +2,
        size: +1,
        depth: +1,
        chest: 'normal',
        type: 'saffron-citadel'
      },
      {
        key: 'arabia-souk-arcade',
        name: 'أروقة السوق',
        nameKey: "dungeon.types.labyrinthine_souk.blocks.arabia-souk-arcade.name",
        level: +1,
        size: 0,
        depth: 0,
        chest: 'normal',
        type: 'labyrinthine-souk'
      },
      {
        key: 'arabia-minaret-walk',
        name: 'ممر المئذنة',
        nameKey: "dungeon.types.windspire_minarets.blocks.arabia-minaret-walk.name",
        level: +2,
        size: 0,
        depth: +1,
        chest: 'less',
        type: 'windspire-minarets'
      },
      {
        key: 'arabia-qanat-channel',
        name: 'قناة القنوات',
        nameKey: "dungeon.types.sunken_qanat.blocks.arabia-qanat-channel.name",
        level: +1,
        size: 0,
        depth: +1,
        chest: 'less',
        type: 'sunken-qanat'
      },
      {
        key: 'arabia-star-garden',
        name: 'حديقة النجوم',
        nameKey: "dungeon.types.star_sand_garden.blocks.arabia-star-garden.name",
        level: +2,
        size: +1,
        depth: +1,
        chest: 'normal',
        type: 'star-sand-garden'
      },
      {
        key: 'arabia-golden-crypt',
        name: 'سرداب الذهب',
        nameKey: "dungeon.types.gilded_tombs.blocks.arabia-golden-crypt.name",
        level: +3,
        size: 0,
        depth: +1,
        chest: 'more',
        type: 'gilded-tombs'
      },
      {
        key: 'arabia-djinn-furnace',
        name: 'فرن الجن',
        nameKey: "dungeon.types.storm_djinn_forge.blocks.arabia-djinn-furnace.name",
        level: +3,
        size: 0,
        depth: +2,
        chest: 'less',
        type: 'storm-djinn-forge',
        meta: { hazard: 'ember-gust' }
      },
      {
        key: 'arabia-astrolabe-ring',
        name: 'حلقة النجوم',
        nameKey: "dungeon.types.celestial_astrolabe.blocks.arabia-astrolabe-ring.name",
        level: +2,
        size: +1,
        depth: +1,
        chest: 'normal',
        type: 'celestial-astrolabe'
      },
      {
        key: 'arabia-aurora-dune',
        name: 'كثبان الفجر',
        nameKey: "dungeon.types.aurora_dune_sea.blocks.arabia-aurora-dune.name",
        level: +2,
        size: 0,
        depth: +1,
        chest: 'normal',
        type: 'aurora-dune-sea'
      },
      {
        key: 'arabia-madrasa-court',
        name: 'فناء المدرسة',
        nameKey: "dungeon.types.sapphire_madrasa.blocks.arabia-madrasa-court.name",
        level: +1,
        size: 0,
        depth: 0,
        chest: 'normal',
        type: 'sapphire-madrasa'
      },
      {
        key: 'arabia-carpet-corridor',
        name: 'ممر السجاد',
        nameKey: "dungeon.types.prismatic_carpet_gallery.blocks.arabia-carpet-corridor.name",
        level: +2,
        size: 0,
        depth: +1,
        chest: 'normal',
        type: 'prismatic-carpet-gallery'
      },
      {
        key: 'arabia-garden-ledge',
        name: 'شرفة الحدائق',
        nameKey: "dungeon.types.hanging_garden_terraces.blocks.arabia-garden-ledge.name",
        level: +2,
        size: +1,
        depth: +1,
        chest: 'more',
        type: 'hanging-garden-terraces'
      },
      {
        key: 'arabia-ember-hall',
        name: 'قاعة الجمرة',
        nameKey: "dungeon.types.emberglass_sanctum.blocks.arabia-ember-hall.name",
        level: +3,
        size: 0,
        depth: +2,
        chest: 'less',
        type: 'emberglass-sanctum',
        meta: { hazard: 'pyre-surge' }
      },
      {
        key: 'arabia-astral-script',
        name: 'مخطوط النجوم',
        nameKey: "dungeon.types.astral_mirage_archive.blocks.arabia-astral-script.name",
        level: +2,
        size: 0,
        depth: +1,
        chest: 'normal',
        type: 'astral-mirage-archive'
      },
      {
        key: 'arabia-sandalwood-vault',
        name: 'خزينة العود',
        nameKey: "dungeon.types.labyrinthine_souk.blocks.arabia-sandalwood-vault.name",
        level: +3,
        size: 0,
        depth: +1,
        chest: 'more',
        type: 'labyrinthine-souk',
        bossFloors: [8, 12]
      }
    ];

    const blocks2 = [
      {
        key: 'arabia-mirage-gate',
        name: 'بوابة السراب',
        nameKey: "dungeon.types.mirage_caravan.blocks.arabia-mirage-gate.name",
        level: +4,
        size: +1,
        depth: +2,
        chest: 'normal',
        type: 'mirage-caravan',
        bossFloors: [10, 15]
      },
      {
        key: 'arabia-oasis-sanctum',
        name: 'محراب الواحة',
        nameKey: "dungeon.types.moonlit_oasis.blocks.arabia-oasis-sanctum.name",
        level: +4,
        size: +1,
        depth: +2,
        chest: 'more',
        type: 'moonlit-oasis',
        bossFloors: [12],
        meta: { blessing: 'lunar-tide' }
      },
      {
        key: 'arabia-citadel-throne',
        name: 'عرش القلعة',
        nameKey: "dungeon.types.saffron_citadel.blocks.arabia-citadel-throne.name",
        level: +5,
        size: +1,
        depth: +2,
        chest: 'more',
        type: 'saffron-citadel',
        bossFloors: [14, 18]
      },
      {
        key: 'arabia-souk-maze-core',
        name: 'متاهة السوق',
        nameKey: "dungeon.types.labyrinthine_souk.blocks.arabia-souk-maze-core.name",
        level: +4,
        size: 0,
        depth: +2,
        chest: 'normal',
        type: 'labyrinthine-souk',
        meta: { hazard: 'thief-ambush' }
      },
      {
        key: 'arabia-minaret-summit',
        name: 'قمة المئذنة',
        nameKey: "dungeon.types.windspire_minarets.blocks.arabia-minaret-summit.name",
        level: +4,
        size: 0,
        depth: +2,
        chest: 'less',
        type: 'windspire-minarets',
        bossFloors: [11]
      },
      {
        key: 'arabia-qanat-reservoir',
        name: 'خزان القنوات',
        nameKey: "dungeon.types.sunken_qanat.blocks.arabia-qanat-reservoir.name",
        level: +4,
        size: +1,
        depth: +2,
        chest: 'more',
        type: 'sunken-qanat'
      },
      {
        key: 'arabia-star-sigil',
        name: 'ختم النجمة',
        nameKey: "dungeon.types.star_sand_garden.blocks.arabia-star-sigil.name",
        level: +4,
        size: 0,
        depth: +2,
        chest: 'normal',
        type: 'star-sand-garden',
        meta: { hazard: 'sand-ward' }
      },
      {
        key: 'arabia-gilded-sarcophagus',
        name: 'تابوت مرصع',
        nameKey: "dungeon.types.gilded_tombs.blocks.arabia-gilded-sarcophagus.name",
        level: +5,
        size: +1,
        depth: +2,
        chest: 'more',
        type: 'gilded-tombs',
        bossFloors: [13]
      },
      {
        key: 'arabia-djinn-reactor',
        name: 'مفاعل العاصفة',
        nameKey: "dungeon.types.storm_djinn_forge.blocks.arabia-djinn-reactor.name",
        level: +5,
        size: +1,
        depth: +3,
        chest: 'less',
        type: 'storm-djinn-forge',
        meta: { hazard: 'ion-tempest' }
      },
      {
        key: 'arabia-astral-dome',
        name: 'قبة فلكية',
        nameKey: "dungeon.types.celestial_astrolabe.blocks.arabia-astral-dome.name",
        level: +4,
        size: +1,
        depth: +2,
        chest: 'normal',
        type: 'celestial-astrolabe',
        bossFloors: [12, 17]
      },
      {
        key: 'arabia-aurora-amphitheatre',
        name: 'مدرج الشفق',
        nameKey: "dungeon.types.aurora_dune_sea.blocks.arabia-aurora-amphitheatre.name",
        level: +4,
        size: +1,
        depth: +2,
        chest: 'more',
        type: 'aurora-dune-sea',
        bossFloors: [14]
      },
      {
        key: 'arabia-madrasa-vault',
        name: 'خزينة المعارف',
        nameKey: "dungeon.types.sapphire_madrasa.blocks.arabia-madrasa-vault.name",
        level: +4,
        size: 0,
        depth: +2,
        chest: 'normal',
        type: 'sapphire-madrasa',
        meta: { blessing: 'scholar-light' }
      },
      {
        key: 'arabia-carpet-loom',
        name: 'منسج الألوان',
        nameKey: "dungeon.types.prismatic_carpet_gallery.blocks.arabia-carpet-loom.name",
        level: +4,
        size: +1,
        depth: +2,
        chest: 'more',
        type: 'prismatic-carpet-gallery'
      },
      {
        key: 'arabia-garden-aerial',
        name: 'حديقة المعلّقات',
        nameKey: "dungeon.types.hanging_garden_terraces.blocks.arabia-garden-aerial.name",
        level: +4,
        size: +1,
        depth: +2,
        chest: 'normal',
        type: 'hanging-garden-terraces',
        bossFloors: [16]
      },
      {
        key: 'arabia-ember-altar',
        name: 'مذبح الجمرة',
        nameKey: "dungeon.types.emberglass_sanctum.blocks.arabia-ember-altar.name",
        level: +5,
        size: 0,
        depth: +3,
        chest: 'less',
        type: 'emberglass-sanctum',
        meta: { hazard: 'glass-scorch' }
      },
      {
        key: 'arabia-astral-orrery',
        name: 'مدار المخطوط',
        nameKey: "dungeon.types.astral_mirage_archive.blocks.arabia-astral-orrery.name",
        level: +5,
        size: +1,
        depth: +3,
        chest: 'normal',
        type: 'astral-mirage-archive',
        bossFloors: [18]
      }
    ];

    const blocks3 = [
      {
        key: 'arabia-mirage-lord',
        name: 'سيد السراب',
        nameKey: "dungeon.types.mirage_caravan.blocks.arabia-mirage-lord.name",
        level: +6,
        size: +2,
        depth: +3,
        chest: 'more',
        type: 'mirage-caravan',
        bossFloors: [18, 24]
      },
      {
        key: 'arabia-oasis-oracle',
        name: 'عرّافة الواحة',
        nameKey: "dungeon.types.moonlit_oasis.blocks.arabia-oasis-oracle.name",
        level: +6,
        size: +1,
        depth: +3,
        chest: 'more',
        type: 'moonlit-oasis',
        bossFloors: [20]
      },
      {
        key: 'arabia-saffron-emperor',
        name: 'إمبراطور الزعفران',
        nameKey: "dungeon.types.saffron_citadel.blocks.arabia-saffron-emperor.name",
        level: +6,
        size: +2,
        depth: +3,
        chest: 'less',
        type: 'saffron-citadel',
        bossFloors: [22]
      },
      {
        key: 'arabia-souk-sultana',
        name: 'سلطانة السوق',
        nameKey: "dungeon.types.labyrinthine_souk.blocks.arabia-souk-sultana.name",
        level: +6,
        size: +1,
        depth: +3,
        chest: 'more',
        type: 'labyrinthine-souk',
        bossFloors: [19]
      },
      {
        key: 'arabia-minaret-windlord',
        name: 'سيد الرياح',
        nameKey: "dungeon.types.windspire_minarets.blocks.arabia-minaret-windlord.name",
        level: +6,
        size: +1,
        depth: +3,
        chest: 'less',
        type: 'windspire-minarets',
        bossFloors: [21]
      },
      {
        key: 'arabia-qanat-guardian',
        name: 'حارس القنوات',
        nameKey: "dungeon.types.sunken_qanat.blocks.arabia-qanat-guardian.name",
        level: +6,
        size: +2,
        depth: +3,
        chest: 'normal',
        type: 'sunken-qanat',
        bossFloors: [20]
      },
      {
        key: 'arabia-star-astromancer',
        name: 'عراف النجوم',
        nameKey: "dungeon.types.star_sand_garden.blocks.arabia-star-astromancer.name",
        level: +6,
        size: +2,
        depth: +3,
        chest: 'more',
        type: 'star-sand-garden',
        bossFloors: [23]
      },
      {
        key: 'arabia-gilded-pharaoh',
        name: 'فرعون مذهب',
        nameKey: "dungeon.types.gilded_tombs.blocks.arabia-gilded-pharaoh.name",
        level: +6,
        size: +2,
        depth: +3,
        chest: 'more',
        type: 'gilded-tombs',
        bossFloors: [24]
      },
      {
        key: 'arabia-djinn-king',
        name: 'ملك الجن',
        nameKey: "dungeon.types.storm_djinn_forge.blocks.arabia-djinn-king.name",
        level: +7,
        size: +2,
        depth: +4,
        chest: 'less',
        type: 'storm-djinn-forge',
        bossFloors: [25]
      },
      {
        key: 'arabia-astral-caliph',
        name: 'خليفة النجوم',
        nameKey: "dungeon.types.celestial_astrolabe.blocks.arabia-astral-caliph.name",
        level: +7,
        size: +2,
        depth: +4,
        chest: 'normal',
        type: 'celestial-astrolabe',
        bossFloors: [26]
      },
      {
        key: 'arabia-aurora-sovereign',
        name: 'سيّد الشفق',
        nameKey: "dungeon.types.aurora_dune_sea.blocks.arabia-aurora-sovereign.name",
        level: +7,
        size: +2,
        depth: +4,
        chest: 'more',
        type: 'aurora-dune-sea',
        bossFloors: [27]
      },
      {
        key: 'arabia-madrasa-archsage',
        name: 'حكيم اللازوردي',
        nameKey: "dungeon.types.sapphire_madrasa.blocks.arabia-madrasa-archsage.name",
        level: +7,
        size: +2,
        depth: +4,
        chest: 'more',
        type: 'sapphire-madrasa',
        bossFloors: [28]
      },
      {
        key: 'arabia-carpet-paragon',
        name: 'معلّم النسيج',
        nameKey: "dungeon.types.prismatic_carpet_gallery.blocks.arabia-carpet-paragon.name",
        level: +7,
        size: +2,
        depth: +4,
        chest: 'more',
        type: 'prismatic-carpet-gallery',
        bossFloors: [29]
      },
      {
        key: 'arabia-garden-seraph',
        name: 'حارس المعلقات',
        nameKey: "dungeon.types.hanging_garden_terraces.blocks.arabia-garden-seraph.name",
        level: +7,
        size: +2,
        depth: +4,
        chest: 'normal',
        type: 'hanging-garden-terraces',
        bossFloors: [30]
      },
      {
        key: 'arabia-ember-avatar',
        name: 'تجسيد الجمرة',
        nameKey: "dungeon.types.emberglass_sanctum.blocks.arabia-ember-avatar.name",
        level: +8,
        size: +2,
        depth: +4,
        chest: 'less',
        type: 'emberglass-sanctum',
        bossFloors: [31]
      },
      {
        key: 'arabia-astral-archivist',
        name: 'أمين السجلات النجمية',
        nameKey: "dungeon.types.astral_mirage_archive.blocks.arabia-astral-archivist.name",
        level: +8,
        size: +2,
        depth: +4,
        chest: 'normal',
        type: 'astral-mirage-archive',
        bossFloors: [32]
      }
    ];

    return { blocks1, blocks2, blocks3 };
  }

  const addon = {
    id: ADDON_ID,
    name: ADDON_NAME,
    nameKey: "dungeon.packs.arabian_legends_pack.name",
    version: VERSION,
    api: '1.0.0',
    description: [
      '砂海に眠る伝承と幻影をテーマに、オアシス、城砦、市場、宙庭、星図聖堂など16種類のダンジョン生成アルゴリズムと',
      '50種以上のアラビア語ブロックを鮮やかな色彩表現で追加する大型パック。'
    ].join(''),
    descriptionKey: "dungeon.packs.arabian_legends_pack.description",
    generators: createGenerators(),
    blocks: createBlocks()
  };

  window.registerDungeonAddon(addon);
})();

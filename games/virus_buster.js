(function(){
  /** MiniExp: Virus Buster (ドクターマリオ風) */
  function create(root, awardXp, opts){
    const difficulty = (opts && opts.difficulty) || 'NORMAL';
    const shortcuts = opts?.shortcuts;
    const config = {
      EASY:   { fall: 0.9, lockDelay: 0.65, startViruses: 10, virusStep: 2 },
      NORMAL: { fall: 0.7, lockDelay: 0.5, startViruses: 14, virusStep: 3 },
      HARD:   { fall: 0.5, lockDelay: 0.4, startViruses: 18, virusStep: 4 },
    }[difficulty] || { fall: 0.7, lockDelay: 0.5, startViruses: 14, virusStep: 3 };

    const COLS = 8;
    const ROWS = 16;
    const COLORS = [
      { fill: '#f97316', bright: '#fdba74' },
      { fill: '#38bdf8', bright: '#bae6fd' },
      { fill: '#a855f7', bright: '#d8b4fe' },
    ];

    const ORIENT = [
      [0, 0, 1, 0],  // right
      [0, 0, 0, 1],  // down
      [0, 0, -1, 0], // left
      [0, 0, 0, -1], // up
    ];

    const canvas = document.createElement('canvas');
    const W = Math.max(360, Math.min(520, root.clientWidth || 400));
    const H = Math.max(520, Math.min(620, root.clientHeight || 560));
    canvas.width = W;
    canvas.height = H;
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    canvas.style.borderRadius = '12px';
    canvas.style.background = 'linear-gradient(180deg,#020617,#0f172a)';
    canvas.style.boxShadow = '0 18px 38px rgba(8,15,30,0.55)';
    root.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    let current = null;
    let nextQueue = [];
    let fallTimer = 0;
    let lockTimer = 0;
    let running = false;
    let ended = false;
    let raf = 0;
    let lastTime = 0;
    let softDropHold = false;
    let level = 1;
    let remainingViruses = 0;
    let totalVirusCleared = 0;
    let chainFlash = null;
    let chainFlashTimer = 0;
    let stageClearTimer = 0;
    let capsuleIdSeq = 1;
    let effects = [];
    let floatingTexts = [];
    let boardPulse = 0;

    function disableHostRestart(){
      shortcuts?.disableKey('r');
    }

    function enableHostRestart(){
      shortcuts?.enableKey('r');
    }

    function randColorIndex(){
      return (Math.random() * COLORS.length) | 0;
    }

    function makeCapsuleColors(){
      return [randColorIndex(), randColorIndex()];
    }

    function refillQueue(){
      while (nextQueue.length < 3){
        nextQueue.push(makeCapsuleColors());
      }
    }

    function clearGrid(){
      grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    }

    function placeViruses(count){
      const bottomStart = Math.floor(ROWS * 0.5);
      let placed = 0;
      let attempts = 0;
      while (placed < count && attempts < 400){
        attempts++;
        const x = (Math.random() * COLS) | 0;
        const y = bottomStart + ((Math.random() * (ROWS - bottomStart)) | 0);
        if (grid[y][x]) continue;
        const color = randColorIndex();
        grid[y][x] = { type: 'virus', color, id: null, link: null };
        placed++;
      }
      remainingViruses = placed;
    }

    function reset(){
      stop();
      ended = false;
      level = 1;
      totalVirusCleared = 0;
      chainFlash = null;
      chainFlashTimer = 0;
      stageClearTimer = 0;
      capsuleIdSeq = 1;
      effects = [];
      floatingTexts = [];
      boardPulse = 0;
      clearGrid();
      placeViruses(config.startViruses);
      nextQueue = [];
      refillQueue();
      current = null;
      fallTimer = 0;
      lockTimer = 0;
      spawnCapsule();
      start();
    }

    function spawnCapsule(){
      if (remainingViruses <= 0){
        handleStageClear();
        return;
      }
      refillQueue();
      const colors = nextQueue.shift();
      current = {
        id: capsuleIdSeq++,
        x: Math.floor(COLS / 2),
        y: -1,
        dir: 1,
        colors: colors.slice()
      };
      fallTimer = 0;
      lockTimer = 0;
      if (collides(current.x, current.y, current.dir)){
        current.y -= 1;
        if (collides(current.x, current.y, current.dir)){
          gameOver();
        }
      }
    }

    function collides(px, py, dir){
      if (!current) return false;
      const offsets = getOffsets(dir);
      for (const [dx, dy] of offsets){
        const gx = px + dx;
        const gy = py + dy;
        if (gx < 0 || gx >= COLS || gy >= ROWS) return true;
        if (gy >= 0 && grid[gy][gx] != null) return true;
      }
      return false;
    }

    function getOffsets(dir){
      const [ax, ay, bx, by] = ORIENT[dir];
      return [
        [ax, ay],
        [ax + bx, ay + by],
      ];
    }

    function forEachCurrent(cb){
      if (!current) return;
      const offsets = getOffsets(current.dir);
      const cols = current.colors;
      offsets.forEach(([dx, dy], idx) => {
        cb({ x: current.x + dx, y: current.y + dy, color: cols[idx], part: idx });
      });
    }

    function move(dx){
      if (!current || ended) return;
      const nx = current.x + dx;
      if (!collides(nx, current.y, current.dir)){
        current.x = nx;
        if (!collides(current.x, current.y + 1, current.dir)) lockTimer = 0;
      }
    }

    function rotate(dirDelta){
      if (!current || ended) return;
      const ndir = (current.dir + dirDelta + 4) % 4;
      const kicks = [[0,0],[1,0],[-1,0],[0,-1],[1,-1],[-1,-1]];
      const prev = { x: current.x, y: current.y, dir: current.dir };
      for (const [kx, ky] of kicks){
        if (!collides(current.x + kx, current.y + ky, ndir)){
          current.x += kx;
          current.y += ky;
          current.dir = ndir;
          if (!collides(current.x, current.y + 1, current.dir)) lockTimer = 0;
          return;
        }
      }
      current.x = prev.x;
      current.y = prev.y;
      current.dir = prev.dir;
    }

    function moveDown(fromSoft){
      if (!current || ended) return false;
      if (!collides(current.x, current.y + 1, current.dir)){
        current.y += 1;
        if (fromSoft && awardXp) awardXp(0.05, { type: 'softdrop' });
        return true;
      }
      return false;
    }

    function hardDrop(){
      if (!current || ended) return;
      let dist = 0;
      while (!collides(current.x, current.y + 1, current.dir)){
        current.y += 1;
        dist++;
      }
      if (dist > 0){
        boardPulse = Math.max(boardPulse, 0.24 + Math.min(0.16, dist * 0.02));
        if (awardXp) awardXp(dist * 0.2, { type: 'harddrop' });
        addFloatingText('DROP!', { color: '#bae6fd', jitter: true, duration: 0.9, y: 1.5 });
      }
      lockPiece();
    }

    function lockPiece(){
      if (!current) return;
      let hasVisible = false;
      const landingCells = [];
      forEachCurrent(cell => {
        if (cell.y >= 0){
          hasVisible = true;
          const palette = COLORS[cell.color % COLORS.length];
          landingCells.push({ x: cell.x, y: cell.y, color: palette.fill });
        }
      });
      if (!hasVisible){
        current = null;
        spawnCapsule();
        return;
      }
      const id = current.id;
      const offsets = getOffsets(current.dir);
      forEachCurrent(cell => {
        if (cell.y < 0) return;
        const { dirSelf, dirPartner } = resolveLinks(offsets, cell.part);
        grid[cell.y][cell.x] = {
          type: 'pill',
          color: cell.color,
          id,
          link: dirSelf,
        };
        // set partner link after both placed
      });
      // After placement ensure partner links
      forEachCurrent(cell => {
        if (cell.y < 0) return;
        const { dirSelf, dirPartner } = resolveLinks(offsets, cell.part);
        if (!dirSelf) return;
        const [dx, dy] = dirVector(dirSelf);
        const nx = cell.x + dx;
        const ny = cell.y + dy;
        if (inside(nx, ny) && grid[ny][nx] && grid[ny][nx].id === id){
          grid[cell.y][cell.x].link = dirSelf;
          grid[ny][nx].link = dirPartner;
        }
      });
      if (landingCells.length) createLandingEffect(landingCells);
      current = null;
      fallTimer = 0;
      lockTimer = 0;
      settleAfterLock();
      if (!ended){
        spawnCapsule();
      }
    }

    function resolveLinks(offsets, partIdx){
      const [pa, pb] = offsets;
      if (partIdx === 0){
        const dir = directionFromOffset(pb[0], pb[1]);
        return { dirSelf: dir, dirPartner: oppositeDir(dir) };
      } else {
        const dir = directionFromOffset(-pb[0], -pb[1]);
        return { dirSelf: dir, dirPartner: oppositeDir(dir) };
      }
    }

    function directionFromOffset(dx, dy){
      if (dx === 1 && dy === 0) return 'right';
      if (dx === -1 && dy === 0) return 'left';
      if (dx === 0 && dy === 1) return 'down';
      if (dx === 0 && dy === -1) return 'up';
      return null;
    }

    function dirVector(dir){
      switch (dir){
        case 'left': return [-1, 0];
        case 'right': return [1, 0];
        case 'up': return [0, -1];
        case 'down': return [0, 1];
        default: return [0, 0];
      }
    }

    function oppositeDir(dir){
      switch (dir){
        case 'left': return 'right';
        case 'right': return 'left';
        case 'up': return 'down';
        case 'down': return 'up';
        default: return null;
      }
    }

    function inside(x, y){
      return x >= 0 && x < COLS && y >= 0 && y < ROWS;
    }

    function settleAfterLock(){
      cleanupLinks();
      let chain = 0;
      let totalRemoved = 0;
      let totalVirusRemoved = 0;
      let xpGain = 0;
      while (true){
        const matches = findMatches();
        if (!matches.length) break;
        chain++;
        triggerClearEffects(matches, { chain });
        let removedThis = 0;
        let virusRemovedThis = 0;
        matches.forEach(({ x, y }) => {
          const cell = grid[y][x];
          if (!cell) return;
          if (cell.type === 'virus') virusRemovedThis++;
          if (cell.type === 'pill' && cell.link){
            const [dx, dy] = dirVector(cell.link);
            const nx = x + dx;
            const ny = y + dy;
            if (inside(nx, ny) && grid[ny][nx] && grid[ny][nx].id === cell.id){
              if (grid[ny][nx].link === oppositeDir(cell.link)){
                grid[ny][nx].link = null;
              }
            }
          }
          grid[y][x] = null;
          removedThis++;
        });
        cleanupLinks();
        applyGravity();
        totalRemoved += removedThis;
        totalVirusRemoved += virusRemovedThis;
        if (removedThis > 0){
          const base = removedThis * 0.6 + virusRemovedThis * 3;
          const multiplier = 1 + (chain - 1) * 0.5;
          xpGain += base * multiplier;
          boardPulse = Math.max(boardPulse, 0.26 + chain * 0.06);
          if (chain >= 2) addFloatingText(`${chain} Chain!`, { color: '#fbbf24', jitter: true, y: 1.2, duration: 1.4 });
        }
      }
      if (xpGain > 0 && awardXp){
        awardXp(xpGain, { type: 'clear', chain, virus: totalVirusRemoved });
      }
      if (totalVirusRemoved > 0){
        remainingViruses = Math.max(0, remainingViruses - totalVirusRemoved);
        totalVirusCleared += totalVirusRemoved;
        chainFlash = { chain, removed: totalVirusRemoved };
        chainFlashTimer = 2.0;
        addFloatingText(`Virus x${totalVirusRemoved}`, { color: '#f97316', jitter: true, duration: 1.4, y: 2.0 });
      }
      if (remainingViruses <= 0 && !ended){
        stageClearTimer = 2.5;
      }
    }

    function findMatches(){
      const toRemove = [];
      // horizontal
      for (let y = 0; y < ROWS; y++){
        let x = 0;
        while (x < COLS){
          const cell = grid[y][x];
          if (!cell){ x++; continue; }
          const color = cell.color;
          let len = 1;
          while (x + len < COLS && grid[y][x + len] && grid[y][x + len].color === color){
            len++;
          }
          if (len >= 4){
            for (let i = 0; i < len; i++){
              toRemove.push({ x: x + i, y });
            }
          }
          x += len;
        }
      }
      // vertical
      for (let x = 0; x < COLS; x++){
        let y = 0;
        while (y < ROWS){
          const cell = grid[y][x];
          if (!cell){ y++; continue; }
          const color = cell.color;
          let len = 1;
          while (y + len < ROWS && grid[y + len][x] && grid[y + len][x].color === color){
            len++;
          }
          if (len >= 4){
            for (let i = 0; i < len; i++){
              toRemove.push({ x, y: y + i });
            }
          }
          y += len;
        }
      }
      if (!toRemove.length) return [];
      const seen = new Set();
      const uniq = [];
      toRemove.forEach(pos => {
        const key = pos.x + ',' + pos.y;
        if (!seen.has(key)){
          seen.add(key);
          uniq.push(pos);
        }
      });
      return uniq;
    }

    function applyGravity(){
      let moved = false;
      do {
        moved = false;
        for (let y = ROWS - 2; y >= 0; y--){
          for (let x = 0; x < COLS; x++){
            const cell = grid[y][x];
            if (!cell || cell.type !== 'pill') continue;
            if (cell.link === 'up') continue; // handled by partner
            if (cell.link === 'down'){
              const below = grid[y + 1][x];
              if (!below || below.id !== cell.id){
                cell.link = null;
                continue;
              }
              if (y + 2 < ROWS && !grid[y + 2][x]){
                const top = cell;
                const bottom = below;
                grid[y][x] = null;
                grid[y + 1][x] = null;
                grid[y + 1][x] = top;
                grid[y + 2][x] = bottom;
                moved = true;
              }
            } else {
              if (!grid[y + 1][x]){
                grid[y + 1][x] = cell;
                grid[y][x] = null;
                moved = true;
              }
            }
          }
        }
        if (moved) cleanupLinks();
      } while (moved);
    }

    function cleanupLinks(){
      for (let y = 0; y < ROWS; y++){
        for (let x = 0; x < COLS; x++){
          const cell = grid[y][x];
          if (!cell || cell.type !== 'pill') continue;
          if (!cell.link) continue;
          const [dx, dy] = dirVector(cell.link);
          const nx = x + dx;
          const ny = y + dy;
          if (!inside(nx, ny)){
            cell.link = null;
            continue;
          }
          const partner = grid[ny][nx];
          if (!partner || partner.type !== 'pill' || partner.id !== cell.id){
            cell.link = null;
            continue;
          }
          if (partner.link !== oppositeDir(cell.link)){
            partner.link = oppositeDir(cell.link);
          }
        }
      }
    }

    function handleStageClear(){
      level++;
      const newVirusCount = Math.min(COLS * ROWS - 4, config.startViruses + (level - 1) * config.virusStep);
      stageClearTimer = 2.5;
      if (awardXp) awardXp(25 + (level - 1) * 5, { type: 'stage' });
      addFloatingText('STAGE CLEAR!', { color: '#34d399', jitter: true, duration: 2.0, y: 2.4 });
      clearGrid();
      placeViruses(newVirusCount);
      nextQueue = [];
      refillQueue();
      current = null;
      fallTimer = 0;
      lockTimer = 0;
      spawnCapsule();
    }

    function gameOver(){
      ended = true;
      running = false;
      enableHostRestart();
    }

    function start(){
      if (running) return;
      disableHostRestart();
      running = true;
      lastTime = performance.now();
      raf = requestAnimationFrame(tick);
    }

    function stop(){
      running = false;
      if (raf){
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }

    function tick(now){
      if (!running){
        draw();
        return;
      }
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;
      update(dt);
      updateEffects(dt);
      draw();
      raf = requestAnimationFrame(tick);
    }

    function update(dt){
      if (chainFlashTimer > 0){
        chainFlashTimer = Math.max(0, chainFlashTimer - dt);
      }
      if (stageClearTimer > 0){
        stageClearTimer = Math.max(0, stageClearTimer - dt);
      }
      if (!current) return;
      const fallInterval = config.fall;
      if (softDropHold){
        if (!moveDown(true)){
          lockTimer += dt;
          if (lockTimer >= config.lockDelay){
            lockPiece();
          }
        } else {
          fallTimer = 0;
          lockTimer = 0;
        }
      } else {
        fallTimer += dt;
        if (fallTimer >= fallInterval){
          fallTimer -= fallInterval;
          if (!moveDown(false)){
            lockTimer += dt;
            if (lockTimer >= config.lockDelay){
              lockPiece();
            }
          } else {
            lockTimer = 0;
          }
        } else if (collides(current.x, current.y + 1, current.dir)){
          lockTimer += dt;
          if (lockTimer >= config.lockDelay){
            lockPiece();
          }
        } else {
          lockTimer = 0;
        }
      }
    }

    function draw(){
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle = '#0b1120';
      ctx.fillRect(0,0,W,H);
      const margin = 20;
      const cellSize = Math.floor((W * 0.55 - margin*2) / COLS);
      const gridW = cellSize * COLS;
      const gridH = cellSize * ROWS;
      const ox = margin;
      const oy = 30;
      ctx.save();
      ctx.translate(ox, oy);
      ctx.fillStyle = 'rgba(15,23,42,0.85)';
      ctx.fillRect(-6, -6, gridW + 12, gridH + 12);
      if (boardPulse > 0){
        const glow = Math.min(1, boardPulse * 2.0);
        const grad = ctx.createRadialGradient(gridW / 2, gridH / 2, cellSize * 1.2, gridW / 2, gridH / 2, Math.max(gridW, gridH));
        grad.addColorStop(0, `rgba(56,189,248,${0.18 * glow})`);
        grad.addColorStop(1, 'rgba(56,189,248,0)');
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = grad;
        ctx.fillRect(-6, -6, gridW + 12, gridH + 12);
        ctx.restore();
      }
      for (let y = 0; y < ROWS; y++){
        for (let x = 0; x < COLS; x++){
          ctx.strokeStyle = 'rgba(148,163,184,0.12)';
          ctx.strokeRect(x * cellSize + 0.5, y * cellSize + 0.5, cellSize - 1, cellSize - 1);
        }
      }
      // draw placed cells
      for (let y = 0; y < ROWS; y++){
        for (let x = 0; x < COLS; x++){
          const cell = grid[y][x];
          if (!cell) continue;
          if (cell.type === 'pill' && (cell.link === 'right' || cell.link === 'down')){
            const [dx, dy] = dirVector(cell.link);
            const nx = x + dx;
            const ny = y + dy;
            if (inside(nx, ny) && grid[ny][nx] && grid[ny][nx].id === cell.id){
              drawConnector(x, y, nx, ny, cellSize, COLORS[cell.color], COLORS[grid[ny][nx].color]);
            }
          }
        }
      }
      for (let y = 0; y < ROWS; y++){
        for (let x = 0; x < COLS; x++){
          const cell = grid[y][x];
          if (!cell) continue;
          drawCell(x, y, cell, cellSize);
        }
      }
      drawEffects(ox, oy, cellSize);
      // draw current
      if (current && !ended){
        const offsets = getOffsets(current.dir);
        const [a, b] = offsets;
        const ax = current.x + a[0];
        const ay = current.y + a[1];
        const bx = current.x + a[0] + b[0];
        const by = current.y + a[1] + b[1];
        if (ay >= 0 && by >= 0){
          drawConnector(ax, ay, bx, by, cellSize, COLORS[current.colors[0]], COLORS[current.colors[1]]);
        }
        forEachCurrent(({ x, y, color }) => {
          if (y < 0) return;
          drawCell(x, y, { type:'pill', color, id: current.id, link: null }, cellSize);
        });
      }
      ctx.restore();

      drawSidePanel(margin + gridW + 20, oy, W - (margin + gridW + 40));
      drawFloatingTexts(ox, oy, cellSize);

      if (ended){
        ctx.fillStyle = 'rgba(8,11,19,0.75)';
        ctx.fillRect(0,0,W,H);
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 28px "M PLUS Rounded 1c", system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', W/2, H/2 - 10);
        ctx.font = '14px "M PLUS Rounded 1c", system-ui';
        ctx.fillText('Rでリスタート', W/2, H/2 + 18);
        ctx.textAlign = 'start';
      }
    }

    function drawCell(x, y, cell, size){
      const cx = x * size;
      const cy = y * size;
      const palette = COLORS[cell.color % COLORS.length];
      const base = palette.fill;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.fillStyle = base;
      if (ctx.roundRect){
        ctx.beginPath();
        ctx.roundRect(2, 2, size - 4, size - 4, size * 0.25);
        ctx.fill();
      } else {
        ctx.fillRect(2, 2, size - 4, size - 4);
      }
      ctx.fillStyle = palette.bright;
      if (ctx.roundRect){
        ctx.beginPath();
        ctx.roundRect(4, 4, size - 8, (size - 8) * 0.45, size * 0.2);
        ctx.fill();
      } else {
        ctx.fillRect(4, 4, size - 8, (size - 8) * 0.45);
      }
      if (cell.type === 'virus'){
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(size / 2 - size * 0.1, size / 2 - size * 0.05, size * 0.07, 0, Math.PI * 2);
        ctx.arc(size / 2 + size * 0.15, size / 2 - size * 0.02, size * 0.07, 0, Math.PI * 2);
        ctx.fill('evenodd');
      }
      ctx.restore();
    }

    function drawConnector(ax, ay, bx, by, size, paletteA, paletteB){
      if (!paletteA || !paletteB) return;
      const horizontal = ay === by;
      const thickness = Math.max(6, Math.floor(size * 0.35));
      if (horizontal){
        const minX = Math.min(ax, bx);
        const baseX = minX * size + size - 4;
        const baseY = ay * size + (size - thickness) / 2;
        const mid = Math.floor((thickness + 4) / 2);
        const leftPalette = ax <= bx ? paletteA : paletteB;
        const rightPalette = ax <= bx ? paletteB : paletteA;
        ctx.fillStyle = leftPalette.fill;
        ctx.fillRect(baseX, baseY, mid, thickness);
        ctx.fillStyle = rightPalette.fill;
        ctx.fillRect(baseX + mid, baseY, mid, thickness);
      } else {
        const minY = Math.min(ay, by);
        const baseY = minY * size + size - 4;
        const baseX = Math.min(ax, bx) * size + (size - thickness) / 2;
        const mid = Math.floor((thickness + 4) / 2);
        const topPalette = ay <= by ? paletteA : paletteB;
        const bottomPalette = ay <= by ? paletteB : paletteA;
        ctx.fillStyle = topPalette.fill;
        ctx.fillRect(baseX, baseY, thickness, mid);
        ctx.fillStyle = bottomPalette.fill;
        ctx.fillRect(baseX, baseY + mid, thickness, mid);
      }
    }

    function drawSidePanel(x, y, width){
      const panelX = x;
      const panelW = Math.max(120, width);
      ctx.save();
      ctx.translate(panelX, y);
      ctx.fillStyle = 'rgba(15,23,42,0.85)';
      ctx.fillRect(0, 0, panelW, H - y - 30);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '16px "M PLUS Rounded 1c", system-ui';
      ctx.fillText('VIRUS BUSTER', 16, 28);
      ctx.font = '12px "M PLUS Rounded 1c", system-ui';
      ctx.fillText(`Level ${level}`, 16, 56);
      ctx.fillText(`Viruses ${remainingViruses}`, 16, 74);
      ctx.fillText(`Cleared ${totalVirusCleared}`, 16, 92);
      if (chainFlash && chainFlashTimer > 0){
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 14px "M PLUS Rounded 1c", system-ui';
        const chainText = chainFlash.chain > 1 ? `${chainFlash.chain} Chain!` : 'Nice!';
        ctx.fillText(chainText, 16, 122);
        ctx.fillStyle = '#fde68a';
        ctx.fillText(`Virus x${chainFlash.removed}`, 16, 142);
      }
      if (stageClearTimer > 0){
        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 16px "M PLUS Rounded 1c", system-ui';
        ctx.fillText('Stage Clear!', 16, 178);
      }
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px "M PLUS Rounded 1c", system-ui';
      ctx.fillText('操作: ←→移動 / ↓ソフトドロップ / ↑orX回転 / Spaceハードドロップ / Rリセット', 16, H - y - 40);
      ctx.restore();
    }

    function createLandingEffect(cells){
      cells.forEach(cell => {
        effects.push({
          type: 'landing',
          x: cell.x,
          y: cell.y,
          color: cell.color || '#38bdf8',
          time: 0,
          duration: 0.28,
        });
      });
    }

    function triggerClearEffects(matches, meta = {}){
      const burstCells = [];
      matches.forEach(({ x, y }) => {
        if (y < 0 || y >= ROWS) return;
        const cell = grid[y]?.[x];
        if (!cell) return;
        const palette = COLORS[(cell.color ?? 0) % COLORS.length];
        burstCells.push({ x, y, color: palette.fill });
      });
      if (!burstCells.length) return;
      effects.push({ type: 'burst', cells: burstCells, time: 0, duration: 0.4 });
      const count = burstCells.length;
      if (count){
        const center = burstCells.reduce((acc, cell) => {
          acc.x += cell.x;
          acc.y += cell.y;
          return acc;
        }, { x: 0, y: 0 });
        const chainLevel = Math.max(1, meta.chain || 1);
        const color = chainLevel >= 3 ? 'rgba(34,197,94,0.9)' : chainLevel === 2 ? 'rgba(96,165,250,0.85)' : 'rgba(248,250,252,0.75)';
        effects.push({
          type: 'shockwave',
          x: center.x / count,
          y: center.y / count,
          time: 0,
          duration: 0.48,
          color,
          strength: Math.min(1.4, 0.6 + chainLevel * 0.22 + Math.min(0.45, count * 0.035)),
        });
      }
    }

    function addFloatingText(text, opts = {}){
      const jitterX = opts.jitter ? (Math.random() * 0.6 - 0.3) : 0;
      const jitterY = opts.jitter ? (Math.random() * 0.4 - 0.2) : 0;
      floatingTexts.push({
        text,
        x: (opts.x ?? COLS / 2 - 0.5) + jitterX,
        y: (opts.y ?? 1.2) + jitterY,
        color: opts.color || '#f8fafc',
        duration: opts.duration || 1.2,
        time: 0,
      });
    }

    function drawEffects(ox, oy, cellSize){
      effects.forEach(effect => {
        const progress = effect.time / effect.duration;
        if (progress >= 1) return;
        if (effect.type === 'burst'){
          const alpha = 1 - progress;
          const scale = 1 + progress * 0.4;
          effect.cells.forEach(cell => {
            const px = ox + cell.x * cellSize + cellSize / 2;
            const py = oy + cell.y * cellSize + cellSize / 2;
            const radius = Math.max(4, (cellSize - 4) * scale / 2);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = cell.color || '#fde68a';
            ctx.beginPath();
            ctx.arc(px, py, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          });
        } else if (effect.type === 'landing'){
          const alpha = 1 - progress;
          const px = ox + effect.x * cellSize + cellSize / 2;
          const py = oy + effect.y * cellSize + cellSize / 2;
          const radius = cellSize * (0.35 + progress * 0.7);
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = effect.color || 'rgba(148,197,255,0.9)';
          ctx.lineWidth = Math.max(1.2, cellSize * 0.12);
          ctx.beginPath();
          ctx.arc(px, py, radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        } else if (effect.type === 'shockwave'){
          const alpha = Math.max(0, 1 - progress);
          const px = ox + (effect.x + 0.5) * cellSize;
          const py = oy + (effect.y + 0.5) * cellSize;
          const radius = cellSize * (0.9 + progress * 3 * (effect.strength || 1));
          ctx.save();
          ctx.globalAlpha = alpha * 0.6;
          ctx.globalCompositeOperation = 'lighter';
          ctx.strokeStyle = effect.color || 'rgba(96,165,250,0.8)';
          ctx.lineWidth = Math.max(1.4, cellSize * 0.16 * (1 - progress * 0.5));
          ctx.beginPath();
          ctx.arc(px, py, radius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }
      });
    }

    function drawFloatingTexts(ox, oy, cellSize){
      floatingTexts.forEach(text => {
        const progress = text.time / text.duration;
        if (progress >= 1) return;
        const alpha = 1 - progress;
        const px = ox + (text.x + 0.5) * cellSize;
        const py = oy + text.y * cellSize - progress * cellSize * 0.9;
        ctx.save();
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.fillStyle = text.color;
        ctx.font = 'bold 18px "M PLUS Rounded 1c", system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(text.text, px, py);
        ctx.textAlign = 'start';
        ctx.restore();
      });
    }

    function updateEffects(dt){
      boardPulse = Math.max(0, boardPulse - dt * 1.6);
      effects = effects.filter(effect => {
        effect.time += dt;
        return effect.time < effect.duration;
      });
      floatingTexts = floatingTexts.filter(text => {
        text.time += dt;
        return text.time < text.duration;
      });
    }

    function keydown(e){
      if (ended && e.code !== 'KeyR') return;
      if (['ArrowLeft','ArrowRight','ArrowDown','ArrowUp','Space','KeyZ','KeyX','KeyR'].includes(e.code)){
        e.preventDefault();
      }
      if (e.code === 'ArrowLeft') move(-1);
      else if (e.code === 'ArrowRight') move(1);
      else if (e.code === 'ArrowDown') { softDropHold = true; moveDown(true); }
      else if (e.code === 'ArrowUp' || e.code === 'KeyX') rotate(1);
      else if (e.code === 'KeyZ') rotate(-1);
      else if (e.code === 'Space') hardDrop();
      else if (e.code === 'KeyR') reset();
    }

    function keyup(e){
      if (e.code === 'ArrowDown') softDropHold = false;
    }

    function blur(){ softDropHold = false; }

    window.addEventListener('keydown', keydown, { passive: false });
    window.addEventListener('keyup', keyup);
    window.addEventListener('blur', blur);

    reset();

    function destroy(){
      stop();
      enableHostRestart();
      window.removeEventListener('keydown', keydown);
      window.removeEventListener('keyup', keyup);
      window.removeEventListener('blur', blur);
      try { root && root.removeChild(canvas); } catch {}
    }

    function getScore(){
      return { level, virusesLeft: remainingViruses, cleared: totalVirusCleared };
    }

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({
    id: 'virus_buster',
    name: 'ドクターマリオ風', nameKey: 'selection.miniexp.games.virus_buster.name',
    description: 'カプセルで4つ揃え！ウイルス退治でEXP獲得', descriptionKey: 'selection.miniexp.games.virus_buster.description', categoryIds: ['puzzle'],
    version: '0.1.0',
    category: 'パズル',
    create,
  });
})();

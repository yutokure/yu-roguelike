(function(){
  /** MiniExp: Falling 2048 */
  function create(root, awardXp, opts){
    const shortcuts = opts?.shortcuts;
    const localization = opts?.localization || (typeof window !== 'undefined' && typeof window.createMiniGameLocalization === 'function'
      ? window.createMiniGameLocalization({ id: 'falling2048', textKeyPrefix: 'miniexp.games.falling2048' })
      : null);
    const text = (key, fallback, params) => {
      if (localization && typeof localization.t === 'function') {
        return localization.t(key, fallback, params);
      }
      if (typeof fallback === 'function') return fallback();
      return fallback ?? '';
    };
    const formatNumber = (value, options) => {
      if (localization && typeof localization.formatNumber === 'function') {
        try { return localization.formatNumber(value, options); } catch {}
      }
      try {
        const locale = localization && typeof localization.getLocale === 'function'
          ? localization.getLocale()
          : undefined;
        return new Intl.NumberFormat(locale, options).format(value);
      } catch {
        if (value == null || Number.isNaN(value)) return '0';
        if (typeof value === 'number') return value.toString();
        return String(value ?? '');
      }
    };

    let detachLocale = localization && typeof localization.onChange === 'function'
      ? localization.onChange(() => {
          try { updateLocaleTexts(); } catch {}
          try { draw(); } catch {}
        })
      : null;

    const panel = document.createElement('div');
    panel.className = 'falling2048-panel';
    const setup = document.createElement('div');
    setup.className = 'falling2048-setup';
    const selectId = `falling2048-size-${Math.random().toString(36).slice(2)}`;
    const label = document.createElement('label');
    label.setAttribute('for', selectId);
    const select = document.createElement('select');
    select.id = selectId;
    for (let n = 4; n <= 12; n++) {
      const opt = document.createElement('option');
      opt.value = String(n);
      opt.dataset.size = String(n);
      if (n === 6) opt.selected = true;
      select.appendChild(opt);
    }
    const startBtn = document.createElement('button');
    startBtn.type = 'button';
    setup.appendChild(label);
    setup.appendChild(select);
    setup.appendChild(startBtn);
    panel.appendChild(setup);
    root.appendChild(panel);

    const canvas = document.createElement('canvas');
    canvas.style.display = 'none';
    canvas.style.margin = '0 auto';
    canvas.style.background = '#020617';
    canvas.style.borderRadius = '10px';
    canvas.style.boxShadow = '0 10px 26px rgba(8,15,30,0.45)';
    panel.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let N = 6;
    let board = null;
    let running = false;
    let ended = false;
    let maxTile = 2;
    let awarded2048 = false;

    let current = null; // { x, y, value, displayX, displayY }
    let fallTimer = 0;
    let currentDelay = 0.6;
    let lockTimer = 0;
    let softDrop = false;
    let lastTime = 0;
    let raf = 0;
    let boardPulse = 0;

    function disableHostRestart(){ shortcuts?.disableKey('r'); }
    function enableHostRestart(){ shortcuts?.enableKey('r'); }

    function updateLocaleTexts(){
      label.textContent = text('setup.sizeLabel', '盤面サイズ: ');
      startBtn.textContent = text('setup.startButton', '開始');
      Array.from(select.options).forEach(opt => {
        const size = Number(opt.dataset.size || opt.value || 0) || 0;
        opt.textContent = text('setup.boardSizeOption', () => `${size}×${size}`, { size });
      });
    }
    updateLocaleTexts();

    function resize(){
      const W = Math.min(520, Math.max(320, root.clientWidth || 520));
      const infoHeight = Math.max(100, Math.floor(W * 0.28));
      canvas.width = W;
      canvas.height = W + infoHeight;
    }

    function randomTile(){
      const r = Math.random();
      if (r < 0.02) return 8;
      if (r < 0.15) return 4;
      return 2;
    }

    function resetState(){
      board = Array.from({ length: N }, () => Array(N).fill(0));
      current = null;
      fallTimer = 0;
      lockTimer = 0;
      softDrop = false;
      lastTime = 0;
      maxTile = 2;
      awarded2048 = false;
      ended = false;
      boardPulse = 0;
      heldKeys.clear();
      moveRepeatTimer = 0;
    }

    function startGame(){
      resize();
      canvas.style.display = 'block';
      setup.style.display = 'none';
      resetState();
      running = true;
      ended = false;
      disableHostRestart();
      spawnTile();
      lastTime = performance.now();
      raf = requestAnimationFrame(loop);
      document.addEventListener('keydown', onKeyDown, { passive: false });
      document.addEventListener('keyup', onKeyUp, { passive: false });
    }

    function stopGame(opts = {}){
      running = false;
      if (raf){
        cancelAnimationFrame(raf);
        raf = 0;
      }
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      if (!opts.keepShortcutsDisabled) enableHostRestart();
    }

    function destroy(){
      try { stopGame(); } catch {}
      try { if (detachLocale) { detachLocale(); detachLocale = null; } } catch {}
      try { panel.remove(); } catch {}
    }

    function restart(){
      stopGame();
      setup.style.display = 'block';
      canvas.style.display = 'none';
    }

    function collides(x, y){
      if (x < 0 || x >= N) return true;
      if (y >= N) return true;
      if (y >= 0 && board[y][x] !== 0) return true;
      return false;
    }

    function canEnterFromSpawn(){
      if (!board || board.length === 0) return true;
      const topRow = board[0];
      if (!topRow) return true;
      for (let x = 0; x < N; x++){
        if (topRow[x] === 0) return true;
      }
      return false;
    }

    function spawnTile(){
      const startX = Math.floor(N / 2);
      const startY = -1;
      const tile = { x: startX, y: startY, value: randomTile(), displayX: startX, displayY: startY, entered: false };
      current = tile;
      fallTimer = 0;
      lockTimer = 0;
      currentDelay = baseFallDelay();
      if (!canEnterFromSpawn()){
        settleCurrent();
      }
    }

    function settleCurrent(){
      if (!current) return;
      if (current.y < 0){
        current = null;
        gameOver();
        return;
      }
      board[current.y][current.x] = current.value;
      current = null;
      resolveBoard();
      if (!ended){
        spawnTile();
      }
    }

    function resolveBoard(){
      let mergedAny = false;
      let xpToAward = 0;
      applyGravity();
      while (true){
        let merged = false;
        for (let x = 0; x < N; x++){
          for (let y = N - 1; y > 0; y--){
            const v = board[y][x];
            if (v !== 0 && board[y - 1][x] === v){
              const nv = v * 2;
              board[y][x] = nv;
              board[y - 1][x] = 0;
              merged = true;
              mergedAny = true;
              xpToAward += Math.log2(nv);
              maxTile = Math.max(maxTile, nv);
            }
          }
        }
        if (!merged) break;
        applyGravity();
      }
      if (xpToAward > 0 && typeof awardXp === 'function'){
        awardXp(xpToAward, { type: 'merge' });
      }
      if (!awarded2048 && maxTile >= 2048){
        if (N === 4){
          if (typeof awardXp === 'function'){
            awardXp(777, { type: '2048', boardSize: N });
          }
          awarded2048 = true;
          finishGame();
          return;
        }
        awarded2048 = true;
      }
      if (mergedAny){
        boardPulse = Math.max(boardPulse, 0.18);
      }
    }

    function applyGravity(){
      for (let x = 0; x < N; x++){
        let write = N - 1;
        for (let y = N - 1; y >= 0; y--){
          const v = board[y][x];
          if (v !== 0){
            if (write !== y){
              board[write][x] = v;
              board[y][x] = 0;
            }
            write--;
          }
        }
        for (let y = write; y >= 0; y--){
          board[y][x] = 0;
        }
      }
    }

    function baseFallDelay(){
      const base = Math.max(0.2, 0.8 - (N - 4) * 0.04);
      return base;
    }

    function currentFallDelay(){
      return softDrop ? Math.max(0.05, baseFallDelay() * 0.12) : baseFallDelay();
    }

    function moveCurrent(dx){
      if (!current) return;
      const nx = current.x + dx;
      if (!collides(nx, current.y)){
        current.x = nx;
      }
    }

    function tryMoveDown(){
      if (!current) return false;
      const ny = current.y + 1;
      if (collides(current.x, ny)){
        return false;
      }
      current.y = ny;
      if (!current.entered && current.y >= 0){
        current.entered = true;
      }
      return true;
    }

    function hardDrop(){
      if (!current) return;
      let dist = 0;
      while (!collides(current.x, current.y + 1)){
        current.y += 1;
        dist++;
      }
      if (!current.entered && current.y >= 0){
        current.entered = true;
      }
      if (dist > 0 && typeof awardXp === 'function'){
        awardXp(dist * 0.2, { type: 'harddrop' });
        boardPulse = Math.max(boardPulse, 0.15 + Math.min(0.1, dist * 0.01));
      }
      settleCurrent();
    }

    const heldKeys = new Set();
    let moveRepeatTimer = 0;

    function onKeyDown(e){
      if (e.code === 'KeyR' && ended){
        e.preventDefault();
        restart();
        return;
      }
      if (!running || ended) return;
      if (['ArrowLeft','ArrowRight','ArrowDown','Space','KeyA','KeyD','KeyQ','KeyE','KeyS'].includes(e.code)){
        e.preventDefault();
      }
      if (heldKeys.has(e.code)){
        if (e.code === 'ArrowDown' || e.code === 'KeyS'){ softDrop = true; }
        return;
      }
      heldKeys.add(e.code);
      if (e.code === 'ArrowLeft' || e.code === 'KeyA'){
        moveCurrent(-1);
        moveRepeatTimer = 0;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD'){
        moveCurrent(1);
        moveRepeatTimer = 0;
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS'){
        softDrop = true;
      } else if (e.code === 'Space'){
        hardDrop();
      }
    }

    function onKeyUp(e){
      heldKeys.delete(e.code);
      if (e.code === 'ArrowDown' || e.code === 'KeyS'){
        softDrop = false;
      }
    }

    function handleHeldMovement(dt){
      if (!current) return;
      const leftHeld = heldKeys.has('ArrowLeft') || heldKeys.has('KeyA');
      const rightHeld = heldKeys.has('ArrowRight') || heldKeys.has('KeyD');
      if (!leftHeld && !rightHeld){ moveRepeatTimer = 0; return; }
      moveRepeatTimer += dt;
      const threshold = 0.15;
      if (moveRepeatTimer >= threshold){
        moveRepeatTimer -= threshold;
        if (leftHeld && !rightHeld){
          moveCurrent(-1);
        } else if (rightHeld && !leftHeld){
          moveCurrent(1);
        }
      }
    }

    function gameOver(){
      ended = true;
      running = false;
      softDrop = false;
      heldKeys.clear();
      enableHostRestart();
    }

    function finishGame(){
      if (!ended){
        ended = true;
        running = false;
        softDrop = false;
        heldKeys.clear();
        enableHostRestart();
      }
    }

    function loop(now){
      if (!running){
        draw();
        return;
      }
      if (!lastTime) lastTime = now;
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;
      handleHeldMovement(dt);
      currentDelay = currentFallDelay();
      fallTimer += dt;
      if (current){
        if (current.displayX == null) current.displayX = current.x;
        if (current.displayY == null) current.displayY = current.y;
        const lerp = (target, currentValue) => currentValue + (target - currentValue) * Math.min(1, dt * 18);
        current.displayX = lerp(current.x, current.displayX);
        current.displayY = lerp(current.y, current.displayY);
      }
      boardPulse = Math.max(0, boardPulse - dt * 1.2);
      if (current){
        if (fallTimer >= currentDelay){
          fallTimer -= currentDelay;
          if (tryMoveDown()){
            lockTimer = 0;
          } else {
            const awaitingEntry = (!current.entered && current.y < 0 && canEnterFromSpawn());
            if (awaitingEntry){
              lockTimer = 0;
            } else {
              lockTimer += currentDelay;
              if (lockTimer >= 0.5){
                settleCurrent();
              }
            }
          }
        }
      }
      draw();
      if (running){
        raf = requestAnimationFrame(loop);
      }
    }

    function tileColor(v){
      const palette = ['#1f2937','#64748b','#60a5fa','#34d399','#f59e0b','#ef4444','#a855f7','#22d3ee','#fb7185','#84cc16'];
      const idx = Math.max(0, Math.min(palette.length - 1, (Math.log2(v) | 0)));
      return palette[idx % palette.length];
    }

    function draw(){
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, W, H);

      const grid = board || Array.from({ length: N }, () => Array(N).fill(0));

      const infoHeight = H - W;
      const boardSize = W * 0.9;
      const offsetX = (W - boardSize) / 2;
      const offsetY = infoHeight + (W - boardSize) / 2;
      const cell = boardSize / N;
      const padding = Math.max(2, cell * 0.06);

      ctx.save();
      ctx.translate(0, infoHeight * 0.2);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = `${Math.max(18, Math.floor(W * 0.05))}px system-ui, sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      const title = text('ui.title', '落下式2048');
      ctx.fillText(title, offsetX, 0);
      ctx.font = `${Math.max(12, Math.floor(W * 0.032))}px system-ui, sans-serif`;
      const maxText = text('ui.maxTile', () => `最大タイル: ${formatNumber(maxTile)}`, { value: maxTile, formatted: formatNumber(maxTile) });
      ctx.fillText(maxText, offsetX, Math.max(28, Math.floor(W * 0.07)));
      const hint = text('ui.hint', '←→で移動 / ↓でソフトドロップ / Spaceで即落下');
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(hint, offsetX, Math.max(56, Math.floor(W * 0.12)));
      ctx.restore();

      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.fillStyle = '#111827';
      ctx.fillRect(-padding, -padding, boardSize + padding * 2, boardSize + padding * 2);
      if (boardPulse > 0){
        const glow = Math.floor(30 * boardPulse);
        ctx.shadowColor = `rgba(96, 165, 250, ${0.4 * boardPulse})`;
        ctx.shadowBlur = glow;
      } else {
        ctx.shadowBlur = 0;
      }
      for (let y = 0; y < N; y++){
        for (let x = 0; x < N; x++){
          const v = grid[y][x];
          const px = x * cell;
          const py = y * cell;
          ctx.fillStyle = v ? tileColor(v) : '#0f172a';
          ctx.fillRect(px + padding, py + padding, cell - padding * 2, cell - padding * 2);
          if (v){
            ctx.fillStyle = v >= 8 ? '#f8fafc' : '#e5e7eb';
            ctx.font = `${Math.max(12, Math.floor(cell * 0.45))}px system-ui, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(String(v), px + cell / 2, py + cell / 2);
          }
        }
      }
      if (current){
        const drawX = (current.displayX ?? current.x) * cell;
        const drawY = (current.displayY ?? current.y) * cell;
        ctx.fillStyle = tileColor(current.value);
        ctx.fillRect(drawX + padding, drawY + padding, cell - padding * 2, cell - padding * 2);
        ctx.fillStyle = current.value >= 8 ? '#f8fafc' : '#e5e7eb';
        ctx.font = `${Math.max(12, Math.floor(cell * 0.45))}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(current.value), drawX + cell / 2, drawY + cell / 2);
      }
      ctx.restore();

      if (ended){
        ctx.save();
        ctx.fillStyle = 'rgba(2,6,23,0.78)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#f1f5f9';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `${Math.max(24, Math.floor(W * 0.07))}px system-ui, sans-serif`;
        ctx.fillText(text('ui.gameOver', 'ゲームオーバー'), W / 2, H / 2 - 20);
        ctx.font = `${Math.max(14, Math.floor(W * 0.04))}px system-ui, sans-serif`;
        ctx.fillText(text('ui.restartHint', 'Rキーでリスタート'), W / 2, H / 2 + 20);
        ctx.restore();
      }
    }

    startBtn.addEventListener('click', () => {
      const size = parseInt(select.value, 10);
      if (Number.isFinite(size) && size >= 4 && size <= 12){
        N = size;
        startGame();
      }
    });

    function start(){ /* waiting for user */ }

    return { start, stop: stopGame, destroy, restart, getScore: () => maxTile };
  }

  window.registerMiniGame({
    id: 'falling_2048',
    name: '落下式2048',
    nameKey: 'selection.miniexp.games.falling_2048.name',
    description: '2048タイルが落下するテトリス風モード。合成でEXP',
    descriptionKey: 'selection.miniexp.games.falling_2048.description',
    categoryIds: ['puzzle'],
    create
  });
})();

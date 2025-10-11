(function(){
  const GLOBAL = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null);
  const CANVAS_CFG = { width: 640, height: 420, margin: 40 };
  const DIFFICULTY_CFG = {
    EASY:   { corridor: 88, checkpointXp: 4, finishXp: 24, jitter: 60, keyboardSpeed: 180 },
    NORMAL: { corridor: 62, checkpointXp: 6, finishXp: 36, jitter: 74, keyboardSpeed: 210 },
    HARD:   { corridor: 44, checkpointXp: 9, finishXp: 52, jitter: 86, keyboardSpeed: 240 }
  };
  const CHECKPOINTS = [0.2, 0.4, 0.6, 0.8];

  function clamp(v, min, max){
    return Math.min(max, Math.max(min, v));
  }

  function distancePointToSegment(px, py, ax, ay, bx, by){
    const vx = bx - ax;
    const vy = by - ay;
    const wx = px - ax;
    const wy = py - ay;
    const lenSq = vx * vx + vy * vy;
    let t = 0;
    if (lenSq > 0){
      t = (vx * wx + vy * wy) / lenSq;
      t = clamp(t, 0, 1);
    }
    const cx = ax + vx * t;
    const cy = ay + vy * t;
    const dx = px - cx;
    const dy = py - cy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function generatePath(cfg, diffCfg){
    const margin = CANVAS_CFG.margin;
    const startX = margin;
    const endX = cfg.width - margin;
    let x = startX;
    let y = cfg.height / 2;
    const points = [{ x, y }];
    while (x < endX - 60){
      const step = 70 + Math.random() * 80;
      x = Math.min(endX - 12, x + step);
      const swing = diffCfg.jitter;
      const delta = (Math.random() * 2 - 1) * swing;
      y = clamp(y + delta, margin, cfg.height - margin);
      points.push({ x, y });
    }
    points.push({ x: endX, y });
    return points;
  }

  function drawPath(ctx, points, corridor){
    if (!points.length) return;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = corridor + 18;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++){
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = corridor + 8;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++){
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = corridor;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++){
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  }

  function create(root, awardXp, opts){
    const localization = opts?.localization || (GLOBAL && typeof GLOBAL.createMiniGameLocalization === 'function'
      ? GLOBAL.createMiniGameLocalization({ id: 'steady_wire' })
      : null);
    const text = (key, fallback, params) => {
      if (localization && typeof localization.t === 'function'){
        return localization.t(key, fallback, params);
      }
      if (typeof fallback === 'function') return fallback();
      return fallback ?? '';
    };
    let detachLocale = localization && typeof localization.onChange === 'function'
      ? localization.onChange(() => {
          try { updateLocaleTexts(); } catch {}
          try { draw(); } catch {}
        })
      : null;

    const difficulty = (opts && opts.difficulty) || 'NORMAL';
    const baseDiff = DIFFICULTY_CFG[difficulty] || DIFFICULTY_CFG.NORMAL;
    const diffCfg = { ...baseDiff };
    const cfg = { ...CANVAS_CFG };

    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.maxWidth = cfg.width + 'px';
    wrapper.style.margin = '0 auto';
    wrapper.style.background = '#0f172a';
    wrapper.style.borderRadius = '12px';
    wrapper.style.padding = '16px';
    wrapper.style.boxShadow = '0 10px 30px rgba(15,23,42,0.35)';

    const infoBar = document.createElement('div');
    infoBar.style.display = 'flex';
    infoBar.style.alignItems = 'center';
    infoBar.style.justifyContent = 'space-between';
    infoBar.style.marginBottom = '12px';
    infoBar.style.color = '#e2e8f0';
    infoBar.style.fontFamily = 'system-ui, sans-serif';

    const statusEl = document.createElement('div');
    statusEl.textContent = text('status.selectControl', '操作方法を選択してください');
    statusEl.style.fontSize = '14px';
    statusEl.style.flex = '1 1 auto';

    const progressWrap = document.createElement('div');
    progressWrap.style.flex = '0 0 180px';
    progressWrap.style.marginLeft = '12px';
    progressWrap.style.background = 'rgba(15,23,42,0.6)';
    progressWrap.style.borderRadius = '999px';
    progressWrap.style.height = '10px';
    progressWrap.style.position = 'relative';

    const progressBar = document.createElement('div');
    progressBar.style.height = '100%';
    progressBar.style.width = '0%';
    progressBar.style.borderRadius = '999px';
    progressBar.style.background = 'linear-gradient(90deg,#38bdf8,#22d3ee)';

    const progressLabel = document.createElement('span');
    progressLabel.style.position = 'absolute';
    progressLabel.style.right = '-64px';
    progressLabel.style.top = '-4px';
    progressLabel.style.fontSize = '12px';
    progressLabel.style.color = '#94a3b8';
    progressLabel.textContent = '0%';

    progressWrap.appendChild(progressBar);
    progressWrap.appendChild(progressLabel);
    infoBar.appendChild(statusEl);
    infoBar.appendChild(progressWrap);

    const canvas = document.createElement('canvas');
    canvas.width = cfg.width;
    canvas.height = cfg.height;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.borderRadius = '10px';
    canvas.style.background = '#020617';
    canvas.style.cursor = 'crosshair';

    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.left = '16px';
    overlay.style.right = '16px';
    overlay.style.top = '16px';
    overlay.style.bottom = '16px';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.background = 'rgba(2,6,23,0.72)';
    overlay.style.color = '#f8fafc';
    overlay.style.fontFamily = 'system-ui, sans-serif';
    overlay.style.borderRadius = '10px';
    overlay.style.textAlign = 'center';
    overlay.style.padding = '20px';

    const overlayInner = document.createElement('div');
    overlayInner.style.maxWidth = '420px';

    const overlayMessage = document.createElement('div');
    overlayMessage.style.fontSize = '16px';
    overlayMessage.style.marginBottom = '14px';
    overlayMessage.textContent = text('overlay.modePrompt', '操作方法を選んでスタート！');

    const overlayButtons = document.createElement('div');
    overlayButtons.style.display = 'flex';
    overlayButtons.style.flexWrap = 'wrap';
    overlayButtons.style.gap = '10px';
    overlayButtons.style.justifyContent = 'center';

    function createButton(label){
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.style.padding = '10px 16px';
      btn.style.background = 'linear-gradient(135deg,#2563eb,#38bdf8)';
      btn.style.border = 'none';
      btn.style.borderRadius = '999px';
      btn.style.color = '#f8fafc';
      btn.style.fontSize = '14px';
      btn.style.cursor = 'pointer';
      btn.style.fontWeight = '600';
      btn.style.boxShadow = '0 6px 16px rgba(37,99,235,0.35)';
      btn.onmouseenter = () => btn.style.filter = 'brightness(1.1)';
      btn.onmouseleave = () => btn.style.filter = '';
      return btn;
    }

    const mouseBtn = createButton(text('buttons.startMouse', 'マウスモードで開始'));
    const keyboardBtn = createButton(text('buttons.startKeyboard', 'キーボードモードで開始'));
    const retryBtn = createButton(text('buttons.retrySameMode', '同じモードで再挑戦'));

    overlayButtons.appendChild(mouseBtn);
    overlayButtons.appendChild(keyboardBtn);
    overlayButtons.appendChild(retryBtn);

    overlayInner.appendChild(overlayMessage);
    overlayInner.appendChild(overlayButtons);
    overlay.appendChild(overlayInner);

    wrapper.appendChild(infoBar);
    wrapper.appendChild(canvas);
    wrapper.appendChild(overlay);

    root.appendChild(wrapper);

    const ctx = canvas.getContext('2d');

    let path = [];
    let startPoint = { x: 0, y: 0 };
    let finishPoint = { x: 0, y: 0 };
    let finishRadius = 30;
    let player = { x: 0, y: 0, r: 10 };
    let controlMode = null;
    let running = false;
    let ended = false;
    let mouseActive = false;
    let keys = { up: false, down: false, left: false, right: false };
    let raf = 0;
    let lastTs = 0;
    let checkpointsAwarded = 0;
    let progressValue = 0;
    let runStartTime = 0;
    let lastStatus = null;
    let lastOverlayConfig = null;

    function updateStatus(key, fallback, params){
      lastStatus = key ? { key, fallback, params } : null;
      const value = key ? text(key, fallback, params) : (typeof fallback === 'function' ? fallback() : (fallback ?? ''));
      statusEl.textContent = value;
    }

    function updateProgress(progress){
      progressValue = Math.max(0, Math.min(1, progress));
      progressBar.style.width = Math.round(progressValue * 100) + '%';
      progressLabel.textContent = Math.round(progressValue * 100) + '%';
    }

    function showOverlay(opts){
      if (!opts){
        lastOverlayConfig = null;
        overlay.style.display = 'none';
        return;
      }
      lastOverlayConfig = { ...opts };
      const message = opts.messageKey
        ? text(opts.messageKey, opts.messageFallback, opts.messageParams)
        : (typeof opts.message === 'function' ? opts.message() : (opts.message || ''));
      overlayMessage.textContent = message;
      overlay.style.display = 'flex';
      mouseBtn.style.display = opts.showModeButtons ? 'inline-flex' : 'none';
      keyboardBtn.style.display = opts.showModeButtons ? 'inline-flex' : 'none';
      retryBtn.style.display = opts.showRetry ? 'inline-flex' : 'none';
    }

    function hideOverlay(){
      overlay.style.display = 'none';
      lastOverlayConfig = null;
    }

    function resetPath(){
      path = generatePath(cfg, diffCfg);
      startPoint = path[0];
      finishPoint = path[path.length - 1];
      finishRadius = Math.max(diffCfg.corridor * 0.65, 26);
      player = {
        x: startPoint.x,
        y: startPoint.y,
        r: Math.max(6, Math.floor(diffCfg.corridor / 4))
      };
      checkpointsAwarded = 0;
      progressValue = 0;
      keys = { up: false, down: false, left: false, right: false };
      mouseActive = controlMode === 'keyboard';
      updateProgress(0);
      ended = false;
      draw();
    }

    function awardCheckpoint(){
      if (!awardXp) return;
      const amount = diffCfg.checkpointXp;
      awardXp(amount, { type: 'checkpoint', index: checkpointsAwarded, difficulty, mode: controlMode });
      if (window.showTransientPopupAt){
        try {
          const rect = canvas.getBoundingClientRect();
          const wrapperRect = wrapper.getBoundingClientRect();
          const x = rect.left + player.x - wrapperRect.left;
          const y = rect.top + player.y - wrapperRect.top;
          window.showTransientPopupAt(x, y, '+' + amount, { variant: 'combo', level: Math.min(5, checkpointsAwarded + 1) });
        } catch {}
      }
    }

    function awardFinish(totalTime){
      if (!awardXp) return;
      const amount = diffCfg.finishXp;
      const meta = { type: 'clear', difficulty, mode: controlMode };
      if (typeof totalTime === 'number' && isFinite(totalTime)){
        meta.time = totalTime;
      }
      awardXp(amount, meta);
      if (window.showTransientPopupAt){
        try {
          const rect = canvas.getBoundingClientRect();
          const wrapperRect = wrapper.getBoundingClientRect();
          const x = rect.left + finishPoint.x - wrapperRect.left;
          const y = rect.top + finishPoint.y - wrapperRect.top;
          window.showTransientPopupAt(x, y, '+' + amount, { variant: 'win' });
        } catch {}
      }
    }

    function awardFail(progress){
      if (!awardXp) return;
      const amount = Math.max(0, Math.round(diffCfg.finishXp * 0.35 * progress));
      if (amount <= 0) return;
      awardXp(amount, { type: 'fail', progress, difficulty, mode: controlMode });
    }

    function progressFromPlayer(){
      const span = finishPoint.x - startPoint.x;
      if (span <= 0) return 0;
      return (player.x - startPoint.x) / span;
    }

    function isInsidePath(px, py){
      if (!path.length) return false;
      let minDist = Infinity;
      for (let i = 0; i < path.length - 1; i++){
        const a = path[i];
        const b = path[i + 1];
        const dist = distancePointToSegment(px, py, a.x, a.y, b.x, b.y);
        if (dist < minDist) minDist = dist;
      }
      return minDist <= diffCfg.corridor / 2;
    }

    function fail(reason){
      if (ended) return;
      ended = true;
      running = false;
      mouseActive = false;
      cancelAnimationFrame(raf);
      const progress = clamp(progressFromPlayer(), 0, 1);
      awardFail(progress);
      if (reason && typeof reason === 'object'){
        updateStatus(reason.key, reason.fallback, reason.params);
      } else if (typeof reason === 'string'){
        updateStatus(null, reason);
      } else {
        updateStatus('status.hitObstacle', 'ぶつかってしまった…');
      }
      showOverlay({
        messageKey: 'overlay.retryPrompt',
        messageFallback: 'ぶつかってしまった！再挑戦しますか？',
        showModeButtons: true,
        showRetry: !!controlMode
      });
    }

    function win(totalTime){
      if (ended) return;
      ended = true;
      running = false;
      mouseActive = false;
      cancelAnimationFrame(raf);
      awardFinish(totalTime);
      updateProgress(1);
      const timeText = (typeof totalTime === 'number' && isFinite(totalTime)) ? totalTime.toFixed(2) : null;
      const difficultyLabel = text(`difficulty.label.${String(difficulty).toLowerCase()}`, () => {
        if (difficulty === 'EASY') return 'かんたん';
        if (difficulty === 'HARD') return 'むずかしい';
        return 'ふつう';
      });
      if (timeText){
        updateStatus('status.clearedWithTime', () => `クリア！おめでとう (${timeText}s)`, { time: timeText });
        showOverlay({
          messageKey: 'overlay.clearedWithTime',
          messageFallback: () => `クリア！難易度 ${difficultyLabel} を ${timeText} 秒で突破しました！`,
          messageParams: { difficulty: difficultyLabel, time: timeText },
          showModeButtons: true,
          showRetry: !!controlMode
        });
      } else {
        updateStatus('status.cleared', 'クリア！おめでとう！');
        showOverlay({
          messageKey: 'overlay.cleared',
          messageFallback: () => `クリア！難易度 ${difficultyLabel} を突破しました！`,
          messageParams: { difficulty: difficultyLabel },
          showModeButtons: true,
          showRetry: !!controlMode
        });
      }
    }

    function update(dt){
      if (ended) return;
      if (controlMode === 'keyboard'){
        let vx = 0;
        let vy = 0;
        if (keys.left) vx -= 1;
        if (keys.right) vx += 1;
        if (keys.up) vy -= 1;
        if (keys.down) vy += 1;
        if (vx !== 0 || vy !== 0){
          const len = Math.hypot(vx, vy) || 1;
          vx /= len;
          vy /= len;
          player.x += vx * diffCfg.keyboardSpeed * dt;
          player.y += vy * diffCfg.keyboardSpeed * dt;
          player.x = clamp(player.x, CANVAS_CFG.margin / 2, cfg.width - CANVAS_CFG.margin / 2);
          player.y = clamp(player.y, CANVAS_CFG.margin / 2, cfg.height - CANVAS_CFG.margin / 2);
        }
      }

      const inside = isInsidePath(player.x, player.y);
      if (!inside){
        fail({ key: 'status.leftCourse', fallback: 'コースから外れてしまった…' });
        return;
      }

      const distToGoal = Math.hypot(player.x - finishPoint.x, player.y - finishPoint.y);
      if (distToGoal <= finishRadius * 0.8){
        const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        const elapsed = runStartTime ? (now - runStartTime) / 1000 : null;
        win(elapsed);
        return;
      }

      const progress = clamp(progressFromPlayer(), 0, 1);
      updateProgress(progress);
      if (checkpointsAwarded < CHECKPOINTS.length && progress >= CHECKPOINTS[checkpointsAwarded]){
        awardCheckpoint();
        checkpointsAwarded += 1;
      }
    }

    function draw(){
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawPath(ctx, path, diffCfg.corridor);

      // finish area
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(finishPoint.x, finishPoint.y, finishRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(34,197,94,0.35)';
      ctx.beginPath();
      ctx.arc(finishPoint.x, finishPoint.y, finishRadius + 10, 0, Math.PI * 2);
      ctx.fill();

      // start area
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(startPoint.x, startPoint.y, diffCfg.corridor / 2.3, 0, Math.PI * 2);
      ctx.fill();

      // player
      ctx.fillStyle = ended ? '#94a3b8' : '#f87171';
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
      ctx.fill();

      // Outline for player for visibility
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
      ctx.stroke();

      // text overlays
      ctx.fillStyle = 'rgba(148,163,184,0.5)';
      ctx.font = '12px system-ui';
      ctx.fillText(getStartLabel(), startPoint.x - 20, startPoint.y - diffCfg.corridor * 0.6);
      ctx.fillText(getGoalLabel(), finishPoint.x - 16, finishPoint.y - finishRadius - 14);
    }

    function loop(ts){
      if (!running) return;
      if (!lastTs) lastTs = ts;
      const dt = Math.min(64, ts - lastTs) / 1000;
      lastTs = ts;
      update(dt);
      draw();
      raf = requestAnimationFrame(loop);
    }

    function startRun(){
      running = true;
      ended = false;
      lastTs = 0;
      runStartTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      raf = requestAnimationFrame(loop);
      draw();
    }

    function externalStart(){
      if (running || ended) return;
      if (!path.length) return;
      if (!controlMode) return;
      startRun();
    }

    function startGame(mode){
      controlMode = mode;
      stop();
      ended = false;
      resetPath();
      hideOverlay();
      if (mode === 'mouse'){
        mouseActive = false;
        updateStatus('status.mouseInstructions', 'マウスで操作: スタート円をクリックして進もう');
      } else {
        mouseActive = true;
        updateStatus('status.keyboardInstructions', 'キーボードで操作: 矢印 / WASD で移動');
      }
      startRun();
    }

    mouseBtn.addEventListener('click', () => {
      startGame('mouse');
    });
    keyboardBtn.addEventListener('click', () => {
      startGame('keyboard');
    });
    retryBtn.addEventListener('click', () => {
      if (!controlMode){
        showOverlay({ messageKey: 'overlay.selectControlFirst', messageFallback: 'まず操作方法を選んでください', showModeButtons: true, showRetry: false });
        return;
      }
      startGame(controlMode);
    });

    function getCanvasPos(e){
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
      };
    }

    function onPointerDown(e){
      if (controlMode !== 'mouse' || ended) return;
      const pos = getCanvasPos(e);
      const dist = Math.hypot(pos.x - startPoint.x, pos.y - startPoint.y);
      if (!mouseActive && dist <= diffCfg.corridor / 2.1){
        mouseActive = true;
        player.x = pos.x;
        player.y = pos.y;
        if (canvas.setPointerCapture){
          try { canvas.setPointerCapture(e.pointerId); } catch {}
        }
        updateStatus('status.mouseDrag', 'マウスで●をコースから外さないように進もう');
        draw();
      }
    }

    function onPointerMove(e){
      if (controlMode !== 'mouse' || !mouseActive || ended) return;
      const pos = getCanvasPos(e);
      player.x = pos.x;
      player.y = pos.y;
      draw();
    }

    function onPointerUp(e){
      if (controlMode !== 'mouse') return;
      if (canvas.releasePointerCapture){
        try { canvas.releasePointerCapture(e.pointerId); } catch {}
      }
    }

    function onPointerLeave(e){
      if (controlMode !== 'mouse') return;
      if (!ended && mouseActive){
        fail({ key: 'status.pointerLeft', fallback: 'コースから出てしまった…' });
      }
      if (e && canvas.releasePointerCapture){
        try { canvas.releasePointerCapture(e.pointerId); } catch {}
      }
    }

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointerleave', onPointerLeave);
    canvas.addEventListener('pointercancel', onPointerLeave);

    function onKeyDown(e){
      if (controlMode !== 'keyboard' || ended) return;
      const k = e.key;
      if (k === 'ArrowUp' || k === 'w' || k === 'W') { keys.up = true; e.preventDefault(); }
      if (k === 'ArrowDown' || k === 's' || k === 'S') { keys.down = true; e.preventDefault(); }
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') { keys.left = true; e.preventDefault(); }
      if (k === 'ArrowRight' || k === 'd' || k === 'D') { keys.right = true; e.preventDefault(); }
    }

    function onKeyUp(e){
      if (controlMode !== 'keyboard') return;
      const k = e.key;
      if (k === 'ArrowUp' || k === 'w' || k === 'W') { keys.up = false; e.preventDefault(); }
      if (k === 'ArrowDown' || k === 's' || k === 'S') { keys.down = false; e.preventDefault(); }
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') { keys.left = false; e.preventDefault(); }
      if (k === 'ArrowRight' || k === 'd' || k === 'D') { keys.right = false; e.preventDefault(); }
    }

    document.addEventListener('keydown', onKeyDown, { passive: false });
    document.addEventListener('keyup', onKeyUp, { passive: false });

    function updateLocaleTexts(){
      mouseBtn.textContent = text('buttons.startMouse', 'マウスモードで開始');
      keyboardBtn.textContent = text('buttons.startKeyboard', 'キーボードモードで開始');
      retryBtn.textContent = text('buttons.retrySameMode', '同じモードで再挑戦');
      if (lastStatus){
        statusEl.textContent = text(lastStatus.key, lastStatus.fallback, lastStatus.params);
      } else {
        statusEl.textContent = text('status.selectControl', '操作方法を選択してください');
      }
      if (overlay.style.display !== 'none' && lastOverlayConfig){
        const cfg = { ...lastOverlayConfig };
        showOverlay(cfg);
      }
    }

    function getStartLabel(){
      return text('canvas.startLabel', 'START');
    }

    function getGoalLabel(){
      return text('canvas.goalLabel', 'GOAL');
    }

    updateStatus('status.selectControl', '操作方法を選択してください');
    updateLocaleTexts();

    resetPath();
    showOverlay({
      messageKey: 'overlay.welcome',
      messageFallback: 'イライラ棒ミニゲームへようこそ！\nマウスまたはキーボード操作を選んでください。\nコースから外れずに右端のゴールまで進みましょう。',
      showModeButtons: true,
      showRetry: false
    });

    function stop(){
      running = false;
      cancelAnimationFrame(raf);
    }

    function destroy(){
      stop();
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('pointercancel', onPointerLeave);
      if (detachLocale){
        try { detachLocale(); } catch {}
        detachLocale = null;
      }
      wrapper.remove();
    }

    return { start: externalStart, stop, destroy };
  }

  window.registerMiniGame({
    id: 'steady_wire',
    name: 'イライラ棒', nameKey: 'selection.miniexp.games.steady_wire.name',
    description: '狭いコースを進むワイヤーループ。難易度で幅が変化＆操作方法選択', descriptionKey: 'selection.miniexp.games.steady_wire.description', categoryIds: ['action'],
    category: 'アクション',
    create
  });
})();

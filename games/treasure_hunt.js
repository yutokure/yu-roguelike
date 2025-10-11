(function(){
  /** MiniExp: Treasure Hunt Dungeon
   *  - Generates a mixed-type dungeon stage each round using the MiniExp stage API
   *  - Camera-follow system plus minimap rendering of the whole floor
   *  - Find a randomly placed treasure reachable from the player spawn before time runs out to maximize EXP
   */
  function create(root, awardXp, opts){
    const shortcuts = opts?.shortcuts;
    const dungeonApi = opts?.dungeon;
    const i18n = window?.I18n;
    const difficultyRaw = opts?.difficulty || 'NORMAL';
    const difficulty = typeof difficultyRaw === 'string' ? difficultyRaw.toUpperCase() : 'NORMAL';
    const DIFFICULTY_CONFIG = {
      EASY: { mapEnabled: true, stageScale: 1, cameraZoom: 1 },
      NORMAL: { mapEnabled: false, stageScale: 1.5, cameraZoom: 2 },
      HARD: { mapEnabled: false, stageScale: 4, cameraZoom: 2 }
    };
    const difficultyConfig = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.NORMAL;
    const BASE_STAGE_SIZE = { tilesX: 44, tilesY: 32 };
    const BASE_CAMERA_VIEW = { tilesX: 24, tilesY: 18 };
    const XP_BASE_MULTIPLIER = 0.25;

    function translate(key, fallback, params){
      const computeFallback = () => {
        if (typeof fallback === 'function'){
          try {
            const result = fallback();
            return typeof result === 'string' ? result : (result ?? '');
          } catch (error) {
            console.warn('[treasure_hunt] Failed to evaluate fallback text:', error);
            return '';
          }
        }
        return fallback ?? '';
      };
      if (!key){
        return computeFallback();
      }
      const translator = i18n?.t;
      if (typeof translator === 'function'){
        try {
          const translated = translator.call(i18n, key, params);
          if (typeof translated === 'string' && translated !== key) return translated;
        } catch (error) {
          console.warn('[treasure_hunt] Failed to translate key:', key, error);
        }
      }
      return computeFallback();
    }

    function formatNumberLocalized(value, options){
      const formatter = i18n?.formatNumber;
      if (typeof formatter === 'function'){
        try {
          return formatter.call(i18n, value, options);
        } catch (error) {
          console.warn('[treasure_hunt] Failed to format number:', value, options, error);
        }
      }
      try {
        const locale = typeof i18n?.getLocale === 'function' ? i18n.getLocale() : undefined;
        return new Intl.NumberFormat(locale, options).format(value);
      } catch (error) {
        console.warn('[treasure_hunt] Intl number formatting failed:', value, options, error);
        return value == null ? '' : String(value);
      }
    }

    const showMiniMap = difficultyConfig.mapEnabled;

    const wrapper = document.createElement('div');
    wrapper.className = 'mini-treasure-hunt';
    wrapper.style.display = 'grid';
    wrapper.style.gridTemplateColumns = 'minmax(320px, 1fr)';
    wrapper.style.gap = '10px';
    wrapper.style.fontFamily = 'system-ui, sans-serif';

    const infoPanel = document.createElement('div');
    infoPanel.style.display = 'grid';
    infoPanel.style.gridTemplateColumns = 'repeat(4, minmax(0, 1fr))';
    infoPanel.style.gap = '8px';
    infoPanel.style.background = 'rgba(15,23,42,0.9)';
    infoPanel.style.color = '#e2e8f0';
    infoPanel.style.padding = '8px 12px';
    infoPanel.style.borderRadius = '10px';

    const roundLabel = document.createElement('div');
    const timerLabel = document.createElement('div');
    const distanceLabel = document.createElement('div');
    const expLabel = document.createElement('div');
    for (const el of [roundLabel, timerLabel, distanceLabel, expLabel]){
      el.style.fontVariantNumeric = 'tabular-nums';
      el.style.fontSize = '0.95rem';
    }

    infoPanel.appendChild(roundLabel);
    infoPanel.appendChild(timerLabel);
    infoPanel.appendChild(distanceLabel);
    infoPanel.appendChild(expLabel);

    const canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    canvas.style.borderRadius = '10px';
    canvas.style.boxShadow = '0 14px 32px rgba(15,23,42,0.42)';

    const lowerPanel = document.createElement('div');
    lowerPanel.style.display = 'grid';
    lowerPanel.style.gridTemplateColumns = 'minmax(180px, 1fr) minmax(200px, 1fr)';
    lowerPanel.style.gap = '10px';

    const miniMapWrapper = document.createElement('div');
    miniMapWrapper.style.background = 'rgba(15,23,42,0.88)';
    miniMapWrapper.style.padding = '8px';
    miniMapWrapper.style.borderRadius = '10px';
    miniMapWrapper.style.display = 'grid';
    miniMapWrapper.style.gridTemplateRows = 'auto 1fr';
    miniMapWrapper.style.gap = '6px';

    const miniMapTitle = document.createElement('div');
    miniMapTitle.textContent = '';
    miniMapTitle.style.color = '#cbd5f5';
    miniMapTitle.style.fontSize = '0.9rem';

    const miniMapCanvas = document.createElement('canvas');
    miniMapCanvas.width = 200;
    miniMapCanvas.height = 150;
    miniMapCanvas.style.width = '100%';
    miniMapCanvas.style.height = 'auto';
    miniMapCanvas.style.borderRadius = '8px';
    miniMapCanvas.style.background = '#020617';

    miniMapWrapper.appendChild(miniMapTitle);
    miniMapWrapper.appendChild(miniMapCanvas);

    const controlPanel = document.createElement('div');
    controlPanel.style.background = 'rgba(15,23,42,0.88)';
    controlPanel.style.padding = '10px';
    controlPanel.style.borderRadius = '10px';
    controlPanel.style.display = 'grid';
    controlPanel.style.gap = '8px';

    const buttonRow = document.createElement('div');
    buttonRow.style.display = 'flex';
    buttonRow.style.gap = '8px';

    const startBtn = document.createElement('button');
    startBtn.type = 'button';
    startBtn.textContent = '';
    startBtn.style.padding = '8px 14px';
    startBtn.style.borderRadius = '8px';
    startBtn.style.border = 'none';
    startBtn.style.cursor = 'pointer';
    startBtn.style.background = '#38bdf8';
    startBtn.style.color = '#0f172a';
    startBtn.style.fontWeight = '600';

    const stopBtn = document.createElement('button');
    stopBtn.type = 'button';
    stopBtn.textContent = '';
    stopBtn.style.padding = '8px 14px';
    stopBtn.style.borderRadius = '8px';
    stopBtn.style.border = 'none';
    stopBtn.style.cursor = 'pointer';
    stopBtn.style.background = '#64748b';
    stopBtn.style.color = '#e2e8f0';
    stopBtn.style.fontWeight = '600';

    buttonRow.appendChild(startBtn);
    buttonRow.appendChild(stopBtn);

    const statusLabel = document.createElement('div');
    statusLabel.style.color = '#f8fafc';
    statusLabel.style.fontSize = '0.95rem';

    const hintLabel = document.createElement('div');
    hintLabel.style.color = '#cbd5f5';
    hintLabel.style.fontSize = '0.85rem';
    hintLabel.textContent = '';

    const lastResultLabel = document.createElement('div');
    lastResultLabel.style.color = '#fcd34d';
    lastResultLabel.style.fontSize = '0.9rem';

    controlPanel.appendChild(buttonRow);
    controlPanel.appendChild(statusLabel);
    controlPanel.appendChild(lastResultLabel);
    controlPanel.appendChild(hintLabel);

    if (showMiniMap){
      lowerPanel.appendChild(miniMapWrapper);
      lowerPanel.appendChild(controlPanel);
    } else {
      lowerPanel.style.gridTemplateColumns = 'minmax(200px, 1fr)';
      lowerPanel.appendChild(controlPanel);
    }

    wrapper.appendChild(infoPanel);
    wrapper.appendChild(canvas);
    wrapper.appendChild(lowerPanel);
    root.appendChild(wrapper);

    const pressedKeys = new Set();
    const player = { x: 0, y: 0, radius: 10, speed: 90 };
    const treasure = { x: 0, y: 0, radius: 10, visible: false };

    const integerFormatOptions = { maximumFractionDigits: 0 };
    const timeFormatOptions = { minimumFractionDigits: 1, maximumFractionDigits: 1 };

    let stage = null;
    let background = null;
    let camera = null;
    let stageReady = false;
    let runInitialized = false;
    let running = false;
    let pendingStart = false;
    let raf = 0;
    let lastTs = 0;
    let roundNumber = 0;
    let roundTime = 0;
    let totalExp = 0;
    let treasureDistanceTiles = 0;
    let bestTime = null;
    let treasurePulse = 0;
    let generating = false;
    let currentStatus = { type: null, data: null };
    let lastResultState = null;
    let localeUnsubscribe = null;

    function disableHost(){
      shortcuts?.disableKey?.('r');
      shortcuts?.disableKey?.('p');
    }
    function enableHost(){
      shortcuts?.enableKey?.('r');
      shortcuts?.enableKey?.('p');
    }

    function formatRoundValue(value){
      return formatNumberLocalized(value, integerFormatOptions);
    }

    function formatTimeValue(value){
      const formatted = formatNumberLocalized(value, timeFormatOptions);
      return translate('games.treasureHunt.labels.timeValue', () => `${formatted}s`, { value: formatted });
    }

    function formatDistanceValue(value){
      const formatted = formatNumberLocalized(value, integerFormatOptions);
      return translate('games.treasureHunt.labels.distanceValue', () => `${formatted}マス`, { value: formatted });
    }

    function renderStatus(){
      if (!currentStatus){
        statusLabel.textContent = '';
        return;
      }
      const { type, data } = currentStatus;
      switch (type){
        case 'preparing':
          statusLabel.textContent = translate('games.treasureHunt.status.preparing', 'ステージを生成します…');
          break;
        case 'generating':
          statusLabel.textContent = translate('games.treasureHunt.status.generating', 'ステージ生成中…');
          break;
        case 'generateFailed':
          statusLabel.textContent = translate('games.treasureHunt.status.generateFailed', 'ステージ生成に失敗しました');
          break;
        case 'noApi':
          statusLabel.textContent = translate('games.treasureHunt.status.noApi', 'ダンジョンAPIが利用できません');
          break;
        case 'placingFailed':
          statusLabel.textContent = translate('games.treasureHunt.status.placingFailed', '生成したマップで宝配置に失敗…再生成します');
          break;
        case 'ready': {
          const roundValue = formatRoundValue(data?.round ?? roundNumber);
          statusLabel.textContent = translate('games.treasureHunt.status.ready', () => `ラウンド${roundValue} 開始位置に移動しました`, { round: roundValue });
          break;
        }
        case 'running': {
          const roundValue = formatRoundValue(data?.round ?? roundNumber);
          statusLabel.textContent = translate('games.treasureHunt.status.running', () => `ラウンド${roundValue} 探索中…`, { round: roundValue });
          break;
        }
        case 'paused':
          statusLabel.textContent = translate('games.treasureHunt.status.paused', '一時停止中');
          break;
        case 'found':
          statusLabel.textContent = translate('games.treasureHunt.status.found', '宝を発見！次のラウンドを生成中…');
          break;
        case 'custom':
          statusLabel.textContent = typeof data?.text === 'string' ? data.text : '';
          break;
        default:
          statusLabel.textContent = '';
      }
    }

    function setStatusState(type, data = null){
      currentStatus = type ? { type, data: data || null } : { type: null, data: null };
      renderStatus();
    }

    function applyStaticTexts(){
      startBtn.textContent = translate('games.treasureHunt.ui.start', '探索開始');
      stopBtn.textContent = translate('games.treasureHunt.ui.pause', '一時停止');
      miniMapTitle.textContent = translate('games.treasureHunt.ui.mapTitle', 'マップ');
      const hintKey = showMiniMap ? 'games.treasureHunt.ui.hint' : 'games.treasureHunt.ui.hintNoMap';
      const hintFallback = showMiniMap
        ? 'WASD/矢印で移動。宝箱と自分の距離が遠いほど基礎EXPが増え、素早く拾うほど倍率が上がります。'
        : 'WASD/矢印で移動。宝箱と自分の距離が遠いほど基礎EXPが増えます。NORMAL以上ではマップ非表示なので手がかりを頼りに探索しましょう。';
      hintLabel.textContent = translate(hintKey, hintFallback);
    }

    function renderLastResult(){
      if (!lastResultState){
        lastResultLabel.textContent = '';
        return;
      }
      const { timeSeconds, expGained } = lastResultState;
      const timeText = formatTimeValue(timeSeconds);
      const expText = formatNumberLocalized(expGained, integerFormatOptions);
      const bestSuffix = bestTime == null
        ? ''
        : translate('games.treasureHunt.labels.bestSuffix', () => ` / ベスト ${formatTimeValue(bestTime)}`, { time: formatTimeValue(bestTime) });
      lastResultLabel.textContent = translate(
        'games.treasureHunt.labels.lastResult',
        () => `前回 ${timeText} で ${expText}EXP 獲得${bestSuffix}`,
        { time: timeText, exp: expText, best: bestSuffix }
      );
    }

    function updateLabels(){
      const noneText = translate('games.treasureHunt.labels.none', '-');
      const roundValue = roundNumber > 0 ? formatRoundValue(roundNumber) : noneText;
      const timeBase = (roundNumber > 0 && runInitialized) ? roundTime : 0;
      const timeValue = formatTimeValue(timeBase);
      const distanceValue = treasureDistanceTiles > 0 ? formatDistanceValue(treasureDistanceTiles) : noneText;
      const expValue = formatNumberLocalized(totalExp, integerFormatOptions);
      roundLabel.textContent = translate('games.treasureHunt.labels.round', () => `ラウンド: ${roundValue}`, { value: roundValue });
      timerLabel.textContent = translate('games.treasureHunt.labels.time', () => `タイム: ${timeValue}`, { value: timeValue });
      distanceLabel.textContent = translate('games.treasureHunt.labels.distance', () => `距離: ${distanceValue}`, { value: distanceValue });
      expLabel.textContent = translate('games.treasureHunt.labels.totalExp', () => `合計EXP: ${expValue}`, { value: expValue });
    }

    function updateLastResult(timeSeconds, expGained){
      if (timeSeconds == null || expGained == null){
        lastResultState = null;
      } else {
        lastResultState = { timeSeconds, expGained };
      }
      renderLastResult();
    }

    function readInputVector(){
      let dx = 0;
      let dy = 0;
      if (pressedKeys.has('arrowup') || pressedKeys.has('w')) dy -= 1;
      if (pressedKeys.has('arrowdown') || pressedKeys.has('s')) dy += 1;
      if (pressedKeys.has('arrowleft') || pressedKeys.has('a')) dx -= 1;
      if (pressedKeys.has('arrowright') || pressedKeys.has('d')) dx += 1;
      if (dx === 0 && dy === 0) return { dx: 0, dy: 0 };
      const len = Math.hypot(dx, dy);
      return { dx: dx / len, dy: dy / len };
    }

    function moveCircle(entity, deltaX, deltaY, radius){
      if (!stage) return;
      const maxDelta = Math.max(Math.abs(deltaX), Math.abs(deltaY));
      const steps = Math.max(1, Math.ceil(maxDelta / Math.max(1, radius * 0.45)));
      let x = entity.x;
      let y = entity.y;
      const stepX = deltaX / steps;
      const stepY = deltaY / steps;
      for (let i = 0; i < steps; i++){
        if (stepX !== 0){
          const nx = x + stepX;
          if (!stage.collidesCircle(nx, y, radius)) x = nx;
        }
        if (stepY !== 0){
          const ny = y + stepY;
          if (!stage.collidesCircle(x, ny, radius)) y = ny;
        }
      }
      const clamped = stage.clampPosition(x, y, radius);
      entity.x = clamped.x;
      entity.y = clamped.y;
    }

    function computeReachable(stageInstance, startTile){
      const width = stageInstance.width;
      const height = stageInstance.height;
      const tiles = stageInstance.tiles;
      const total = width * height;
      const visited = new Uint8Array(total);
      const distance = new Uint16Array(total);
      const queue = new Array(total);
      const idx = (x, y) => y * width + x;
      let head = 0;
      let tail = 0;
      queue[tail++] = { x: startTile.x, y: startTile.y };
      visited[idx(startTile.x, startTile.y)] = 1;
      const reachable = [];
      const dirs = [ [1,0], [-1,0], [0,1], [0,-1] ];
      while (head < tail){
        const cell = queue[head++];
        reachable.push(cell);
        const baseIndex = idx(cell.x, cell.y);
        for (const [dx, dy] of dirs){
          const nx = cell.x + dx;
          const ny = cell.y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          if (tiles[ny]?.[nx] !== 0) continue;
          const id = idx(nx, ny);
          if (visited[id]) continue;
          visited[id] = 1;
          distance[id] = distance[baseIndex] + 1;
          queue[tail++] = { x: nx, y: ny };
        }
      }
      return { reachable, distance, idx };
    }

    function pickStartAndTreasure(){
      if (!stage) return false;
      const attempts = 18;
      for (let attempt = 0; attempt < attempts; attempt++){
        const startTile = stage.pickFloorPosition({ minDistance: 4 });
        if (!startTile) continue;
        const { reachable, distance, idx } = computeReachable(stage, startTile);
        const candidates = [];
        for (const cell of reachable){
          const dist = distance[idx(cell.x, cell.y)];
          if (dist > 0) candidates.push({ cell, dist });
        }
        let filtered = candidates.filter((entry) => entry.dist >= 5);
        if (filtered.length === 0) filtered = candidates.filter((entry) => entry.dist >= 3);
        if (filtered.length === 0) filtered = candidates;
        if (filtered.length === 0) continue;
        const chosen = filtered[Math.floor(Math.random() * filtered.length)];
        const startCenter = stage.tileCenter(startTile.x, startTile.y);
        const treasureCenter = stage.tileCenter(chosen.cell.x, chosen.cell.y);
        player.x = startCenter.x;
        player.y = startCenter.y;
        treasure.x = treasureCenter.x;
        treasure.y = treasureCenter.y;
        treasure.radius = Math.max(6, stage.tileSize * 0.35);
        player.radius = Math.max(7, stage.tileSize * 0.35);
        player.speed = Math.max(60, stage.tileSize * 4.8);
        treasure.visible = true;
        treasureDistanceTiles = chosen.dist;
        return true;
      }
      return false;
    }

    function draw(){
      if (!stage || !background) return;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (camera){
        const bounds = camera.getBounds();
        ctx.drawImage(background.canvas, bounds.x, bounds.y, bounds.width, bounds.height, 0, 0, canvas.width, canvas.height);
      } else {
        ctx.drawImage(background.canvas, 0, 0, canvas.width, canvas.height);
      }
      if (treasure.visible){
        const target = camera ? camera.project(treasure.x, treasure.y) : { x: treasure.x, y: treasure.y };
        const pulse = 1 + Math.sin(treasurePulse * 2 * Math.PI) * 0.15;
        const r = treasure.radius * pulse;
        ctx.fillStyle = 'rgba(250, 204, 21, 0.85)';
        ctx.beginPath();
        ctx.moveTo(target.x, target.y - r);
        ctx.lineTo(target.x + r, target.y);
        ctx.lineTo(target.x, target.y + r);
        ctx.lineTo(target.x - r, target.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(249, 250, 199, 0.9)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      const playerScreen = camera ? camera.project(player.x, player.y) : { x: player.x, y: player.y };
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(playerScreen.x, playerScreen.y, player.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawMiniMap(){
      if (!showMiniMap) return;
      const ctx = miniMapCanvas.getContext('2d');
      ctx.clearRect(0, 0, miniMapCanvas.width, miniMapCanvas.height);
      if (!stage || !background){
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, miniMapCanvas.width, miniMapCanvas.height);
        return;
      }
      ctx.drawImage(background.canvas, 0, 0, miniMapCanvas.width, miniMapCanvas.height);
      const scaleX = miniMapCanvas.width / background.canvas.width;
      const scaleY = miniMapCanvas.height / background.canvas.height;
      if (camera){
        const bounds = camera.getBounds();
        ctx.strokeStyle = 'rgba(148,163,184,0.9)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bounds.x * scaleX, bounds.y * scaleY, bounds.width * scaleX, bounds.height * scaleY);
      }
      if (treasure.visible){
        ctx.fillStyle = '#facc15';
        const r = Math.max(3, treasure.radius * scaleX * 0.9);
        ctx.beginPath();
        ctx.arc(treasure.x * scaleX, treasure.y * scaleY, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      const pr = Math.max(3, player.radius * scaleX);
      ctx.arc(player.x * scaleX, player.y * scaleY, pr, 0, Math.PI * 2);
      ctx.fill();
    }

    function loop(ts){
      if (!running){
        lastTs = 0;
        return;
      }
      if (!stageReady || !runInitialized){
        lastTs = 0;
        raf = requestAnimationFrame(loop);
        return;
      }
      const delta = lastTs ? (ts - lastTs) / 1000 : 0;
      lastTs = ts;
      const input = readInputVector();
      if (input.dx !== 0 || input.dy !== 0){
        const step = player.speed * delta;
        moveCircle(player, input.dx * step, input.dy * step, player.radius);
      }
      roundTime += delta;
      treasurePulse = (treasurePulse + delta) % 1;
      if (camera) camera.setCenter(player.x, player.y);
      if (treasure.visible){
        const dist = Math.hypot(player.x - treasure.x, player.y - treasure.y);
        if (dist <= player.radius + treasure.radius * 0.8){
          handleTreasurePickup();
        }
      }
      updateLabels();
      draw();
      drawMiniMap();
      raf = requestAnimationFrame(loop);
    }

    function handleTreasurePickup(){
      treasure.visible = false;
      const timeSpent = Math.max(0.5, roundTime);
      const base = 10 * Math.max(1, treasureDistanceTiles);
      const xpGain = Math.max(1, Math.round(base * (60 / timeSpent) * XP_BASE_MULTIPLIER));
      totalExp += xpGain;
      awardXp?.(xpGain);
      if (bestTime == null || roundTime < bestTime) bestTime = roundTime;
      updateLastResult(roundTime, xpGain);
      setStatusState('found');
      roundTime = 0;
      treasureDistanceTiles = 0;
      updateLabels();
      runInitialized = false;
      stageReady = false;
      generateStage();
    }

    function generateStage(){
      if (!dungeonApi || typeof dungeonApi.generateStage !== 'function'){
        setStatusState('noApi');
        return;
      }
      if (generating) return;
      generating = true;
      setStatusState('generating');
      const stageTilesX = Math.max(8, Math.round(BASE_STAGE_SIZE.tilesX * difficultyConfig.stageScale));
      const stageTilesY = Math.max(8, Math.round(BASE_STAGE_SIZE.tilesY * difficultyConfig.stageScale));
      const cameraViewX = Math.max(8, Math.round(BASE_CAMERA_VIEW.tilesX / Math.max(1, difficultyConfig.cameraZoom)));
      const cameraViewY = Math.max(8, Math.round(BASE_CAMERA_VIEW.tilesY / Math.max(1, difficultyConfig.cameraZoom)));
      dungeonApi.generateStage({ type: 'mixed', tilesX: stageTilesX, tilesY: stageTilesY, tileSize: 18 }).then((generated) => {
        stage = generated;
        background = dungeonApi.renderStage(stage, { tileSize: stage.tileSize, showGrid: false });
        camera = stage.createCamera({ viewTilesX: cameraViewX, viewTilesY: cameraViewY });
        if (camera){
          const zoomScale = Math.max(1, difficultyConfig.cameraZoom || 1);
          canvas.width = camera.width;
          canvas.height = camera.height;
          canvas.style.width = `${camera.width * zoomScale}px`;
          canvas.style.height = `${camera.height * zoomScale}px`;
        } else if (background){
          canvas.width = background.canvas.width;
          canvas.height = background.canvas.height;
          canvas.style.width = `${background.canvas.width}px`;
          canvas.style.height = `${background.canvas.height}px`;
        }
        if (showMiniMap){
          miniMapCanvas.width = Math.min(240, Math.max(160, Math.floor(stage.width * 4)));
          miniMapCanvas.height = Math.min(200, Math.max(120, Math.floor(stage.height * 4)));
        }
        if (!pickStartAndTreasure()){
          setStatusState('placingFailed');
          generating = false;
          stageReady = false;
          runInitialized = false;
          setTimeout(generateStage, 100);
          return;
        }
        roundNumber += 1;
        roundTime = 0;
        stageReady = true;
        runInitialized = true;
        treasure.visible = true;
        if (camera) camera.setCenter(player.x, player.y);
        updateLabels();
        draw();
        drawMiniMap();
        setStatusState('ready', { round: roundNumber });
        generating = false;
        if (pendingStart) startLoop();
      }).catch((error) => {
        console.error(error);
        setStatusState('generateFailed');
        generating = false;
      });
    }

    function startLoop(){
      if (running) return;
      pendingStart = true;
      if (!stageReady || !runInitialized){
        if (!generating) generateStage();
        return;
      }
      running = true;
      disableHost();
      lastTs = 0;
      setStatusState('running', { round: roundNumber });
      raf = requestAnimationFrame(loop);
    }

    function stopLoop(){
      pendingStart = false;
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
      enableHost();
      setStatusState('paused');
    }

    function reset(){
      running = false;
      pendingStart = false;
      stageReady = false;
      runInitialized = false;
      roundNumber = 0;
      roundTime = 0;
      totalExp = 0;
      treasureDistanceTiles = 0;
      bestTime = null;
      treasure.visible = false;
      updateLabels();
      updateLastResult(null, null);
      drawMiniMap();
      setStatusState('preparing');
    }

    function destroy(){
      cancelAnimationFrame(raf);
      enableHost();
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      startBtn.removeEventListener('click', onStart);
      stopBtn.removeEventListener('click', onStop);
      try { localeUnsubscribe?.(); } catch (error) { console.warn('[treasure_hunt] Failed to unsubscribe locale listener:', error); }
      localeUnsubscribe = null;
      try { wrapper.remove(); } catch{}
    }

    function getScore(){ return totalExp; }

    function onStart(){ startLoop(); }
    function onStop(){ stopLoop(); }

    function onKeyDown(event){
      const key = event.key?.toLowerCase();
      if (!key) return;
      if (['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(key)){
        pressedKeys.add(key);
        event.preventDefault();
      }
      if (key === ' ' && !running){
        startLoop();
        event.preventDefault();
      }
    }

    function onKeyUp(event){
      const key = event.key?.toLowerCase();
      if (!key) return;
      pressedKeys.delete(key);
    }

    startBtn.addEventListener('click', onStart);
    stopBtn.addEventListener('click', onStop);
    document.addEventListener('keydown', onKeyDown, { passive: false });
    document.addEventListener('keyup', onKeyUp, { passive: true });

    const handleLocaleChanged = () => {
      applyStaticTexts();
      updateLabels();
      renderLastResult();
      renderStatus();
    };
    if (typeof i18n?.onLocaleChanged === 'function'){
      localeUnsubscribe = i18n.onLocaleChanged(handleLocaleChanged);
    }

    reset();
    handleLocaleChanged();
    generateStage();

    return { start: startLoop, stop: stopLoop, destroy, getScore };
  }

  window.registerMiniGame({
    id: 'treasure_hunt',
    name: '宝探しダンジョン',
    nameKey: 'selection.miniexp.games.treasure_hunt.name',
    description: '混合ダンジョンで宝を探し、距離とタイムで指数的にEXPボーナス',
    descriptionKey: 'selection.miniexp.games.treasure_hunt.description',
    categoryIds: ['action'],
    create
  });
})();

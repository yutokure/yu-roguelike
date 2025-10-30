(function(){
  /** MiniExp: Sanpo (散歩)
   *  - Generates a fully random dungeon layout using the MiniExp stage API
   *  - Smooth WASD/arrow-key movement with camera follow and optional minimap
   *  - Adjustable smooth zoom and +1 EXP for every traversed tile
   */
  function create(root, awardXp, opts){
    const shortcuts = opts?.shortcuts;
    const dungeonApi = opts?.dungeon;
    const localization = opts?.localization
      || (typeof window !== 'undefined' && typeof window.createMiniGameLocalization === 'function'
        ? window.createMiniGameLocalization({ id: 'sanpo' })
        : null);

    const text = (key, fallback, params) => {
      if (key && localization && typeof localization.t === 'function'){
        try {
          const localized = localization.t(key, fallback, params);
          if (localized != null) {
            return localized;
          }
        } catch (error) {
          console.warn('[MiniExp][Sanpo] Failed to translate key:', key, error);
        }
      }
      if (typeof fallback === 'function'){
        try {
          return fallback(params);
        } catch (error) {
          console.warn('[MiniExp][Sanpo] Failed to compute fallback text for key:', key, error);
          return '';
        }
      }
      return fallback ?? '';
    };

    const wrapper = document.createElement('div');
    wrapper.className = 'mini-sanpo';
    wrapper.style.display = 'grid';
    wrapper.style.gridTemplateColumns = 'minmax(320px, 1fr)';
    wrapper.style.gap = '12px';
    wrapper.style.fontFamily = 'system-ui, sans-serif';

    const infoPanel = document.createElement('div');
    infoPanel.style.display = 'grid';
    infoPanel.style.gridTemplateColumns = 'repeat(auto-fit, minmax(150px, 1fr))';
    infoPanel.style.gap = '8px';
    infoPanel.style.background = 'rgba(15,23,42,0.92)';
    infoPanel.style.color = '#e2e8f0';
    infoPanel.style.padding = '10px 12px';
    infoPanel.style.borderRadius = '12px';

    const stageInfo = document.createElement('div');
    const seedInfo = document.createElement('div');
    const zoomInfo = document.createElement('div');
    const stepsInfo = document.createElement('div');
    stageInfo.style.fontVariantNumeric = 'tabular-nums';
    seedInfo.style.fontVariantNumeric = 'tabular-nums';
    zoomInfo.style.fontVariantNumeric = 'tabular-nums';
    stepsInfo.style.fontVariantNumeric = 'tabular-nums';

    infoPanel.appendChild(stageInfo);
    infoPanel.appendChild(seedInfo);
    infoPanel.appendChild(zoomInfo);
    infoPanel.appendChild(stepsInfo);

    const controlPanel = document.createElement('div');
    controlPanel.style.display = 'flex';
    controlPanel.style.flexWrap = 'wrap';
    controlPanel.style.gap = '8px';

    const regenerateBtn = document.createElement('button');
    regenerateBtn.type = 'button';
    regenerateBtn.textContent = text('games.sanpo.ui.regenerate', 'ステージ再生成');
    regenerateBtn.style.padding = '8px 14px';
    regenerateBtn.style.borderRadius = '8px';
    regenerateBtn.style.border = 'none';
    regenerateBtn.style.cursor = 'pointer';
    regenerateBtn.style.background = '#38bdf8';
    regenerateBtn.style.color = '#0f172a';
    regenerateBtn.style.fontWeight = '600';

    const toggleMapBtn = document.createElement('button');
    toggleMapBtn.type = 'button';
    toggleMapBtn.style.padding = '8px 14px';
    toggleMapBtn.style.borderRadius = '8px';
    toggleMapBtn.style.border = 'none';
    toggleMapBtn.style.cursor = 'pointer';
    toggleMapBtn.style.background = '#1e293b';
    toggleMapBtn.style.color = '#e2e8f0';
    toggleMapBtn.style.fontWeight = '600';

    const zoomLabel = document.createElement('label');
    zoomLabel.style.display = 'grid';
    zoomLabel.style.gap = '4px';
    zoomLabel.style.alignItems = 'center';
    zoomLabel.style.color = '#cbd5f5';
    zoomLabel.textContent = text('games.sanpo.ui.zoomLabel', 'ズーム');

    const zoomSlider = document.createElement('input');
    zoomSlider.type = 'range';
    zoomSlider.min = '0.6';
    zoomSlider.max = '2.5';
    zoomSlider.step = '0.01';
    zoomSlider.value = '1';
    zoomSlider.style.width = '160px';

    const zoomValue = document.createElement('div');
    zoomValue.style.fontSize = '0.9rem';
    zoomValue.style.textAlign = 'center';
    zoomValue.style.color = '#94a3b8';
    zoomValue.textContent = '1.00x';

    zoomLabel.appendChild(zoomSlider);
    zoomLabel.appendChild(zoomValue);

    controlPanel.appendChild(regenerateBtn);
    controlPanel.appendChild(toggleMapBtn);
    controlPanel.appendChild(zoomLabel);

    const slideshowLabel = document.createElement('label');
    slideshowLabel.style.display = 'flex';
    slideshowLabel.style.alignItems = 'center';
    slideshowLabel.style.gap = '6px';
    slideshowLabel.style.color = '#cbd5f5';
    slideshowLabel.style.fontWeight = '600';

    const slideshowCheckbox = document.createElement('input');
    slideshowCheckbox.type = 'checkbox';
    slideshowCheckbox.style.width = '18px';
    slideshowCheckbox.style.height = '18px';
    slideshowCheckbox.title = text('games.sanpo.ui.slideshowLabel', 'スライドショーモード');

    const slideshowText = document.createElement('span');
    slideshowText.textContent = text('games.sanpo.ui.slideshowLabel', 'スライドショーモード');

    slideshowLabel.appendChild(slideshowCheckbox);
    slideshowLabel.appendChild(slideshowText);

    controlPanel.appendChild(slideshowLabel);

    const VIEWPORT_RENDER_SIZE = 640;
    const MINIMAP_RENDER_SIZE = 220;

    const canvas = document.createElement('canvas');
    canvas.width = VIEWPORT_RENDER_SIZE;
    canvas.height = VIEWPORT_RENDER_SIZE;
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    canvas.style.borderRadius = '12px';
    canvas.style.boxShadow = '0 18px 34px rgba(15,23,42,0.45)';
    canvas.style.background = '#020617';
    canvas.style.maxWidth = `${VIEWPORT_RENDER_SIZE}px`;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';

    const miniMapContainer = document.createElement('div');
    miniMapContainer.style.background = 'rgba(15,23,42,0.9)';
    miniMapContainer.style.padding = '8px';
    miniMapContainer.style.borderRadius = '12px';
    miniMapContainer.style.display = 'grid';
    miniMapContainer.style.gridTemplateRows = 'auto 1fr';
    miniMapContainer.style.gap = '6px';

    const miniMapTitle = document.createElement('div');
    miniMapTitle.textContent = text('games.sanpo.ui.minimapTitle', 'ミニマップ');
    miniMapTitle.style.color = '#cbd5f5';
    miniMapTitle.style.fontSize = '0.9rem';

    const miniMapCanvas = document.createElement('canvas');
    miniMapCanvas.width = MINIMAP_RENDER_SIZE;
    miniMapCanvas.height = MINIMAP_RENDER_SIZE;
    miniMapCanvas.style.width = '100%';
    miniMapCanvas.style.height = 'auto';
    miniMapCanvas.style.maxWidth = `${MINIMAP_RENDER_SIZE}px`;
    miniMapCanvas.style.borderRadius = '10px';
    miniMapCanvas.style.background = '#020617';

    miniMapContainer.appendChild(miniMapTitle);
    miniMapContainer.appendChild(miniMapCanvas);

    const statusLabel = document.createElement('div');
    statusLabel.style.color = '#94a3b8';
    statusLabel.style.fontSize = '0.9rem';

    wrapper.appendChild(infoPanel);
    wrapper.appendChild(controlPanel);
    wrapper.appendChild(canvas);
    wrapper.appendChild(miniMapContainer);
    wrapper.appendChild(statusLabel);

    root.appendChild(wrapper);

    const pressedKeys = new Set();
    const typeFallbacks = ['field', 'cave', 'maze', 'rooms', 'mixed', 'open-space', 'circle'];

    let stage = null;
    let background = null;
    let running = false;
    let pendingStart = false;
    let raf = 0;
    let lastTs = 0;
    let stageReady = false;
    let stageSeed = 0;
    let stepsTaken = 0;
    let lastTile = null;
    let showMiniMap = true;
    let targetZoom = 1;
    let currentZoom = 1;
    let cameraBaseWidth = VIEWPORT_RENDER_SIZE;
    let cameraBaseHeight = VIEWPORT_RENDER_SIZE;
    let preparingStage = false;

    let slideshowEnabled = false;
    let slideshowDirection = null;
    let slideshowElapsed = 0;
    let slideshowNextRegen = 0;
    let slideshowPendingRegen = false;

    const SLIDESHOW_MIN_REGEN = 18;
    const SLIDESHOW_MAX_REGEN = 32;

    const player = {
      x: 0,
      y: 0,
      radius: 10,
      speed: 90
    };

    function clamp(value, min, max){
      return Math.min(max, Math.max(min, value));
    }

    function formatSeed(seed){
      const value = Number.isFinite(seed) ? seed >>> 0 : 0;
      return `0x${value.toString(16).padStart(8, '0')}`;
    }

    function pickRandomType(){
      try {
        if (dungeonApi && typeof dungeonApi.listTypes === 'function'){
          const types = dungeonApi.listTypes();
          if (Array.isArray(types) && types.length > 0){
            const idx = Math.floor(Math.random() * types.length);
            return types[idx] || 'mixed';
          }
        }
      } catch {}
      const idx = Math.floor(Math.random() * typeFallbacks.length);
      return typeFallbacks[idx] || 'field';
    }

    function randomStageOptions(){
      const tilesX = clamp(Math.floor(24 + Math.random() * 48), 16, 100);
      const tilesY = clamp(Math.floor(18 + Math.random() * 42), 12, 90);
      const tileSize = clamp(Math.floor(14 + Math.random() * 10), 10, 26);
      const type = pickRandomType();
      stageSeed = Math.floor(Math.random() * 0xffffffff) >>> 0;
      return { type, tilesX, tilesY, tileSize };
    }

    function updateStageInfo(){
      if (stage){
        const typeName = stage.type || stage.requestedType || 'unknown';
        const sizeText = `${stage.width}×${stage.height}`;
        const tileSizeText = `${stage.tileSize}px`;
        const stageParams = { type: typeName, size: sizeText, tileSize: tileSizeText };
        stageInfo.textContent = text(
          'games.sanpo.ui.stageInfo',
          (params = {}) => {
            const type = params.type ?? typeName;
            const size = params.size ?? sizeText;
            const tile = params.tileSize ?? tileSizeText;
            return `タイプ: ${type} / サイズ: ${size} / タイル: ${tile}`;
          },
          stageParams
        );
        const seedText = formatSeed(stageSeed);
        seedInfo.textContent = text(
          'games.sanpo.ui.seedInfo',
          (params = {}) => `シード: ${params.seed ?? seedText}`,
          { seed: seedText }
        );
        stepsInfo.textContent = text(
          'games.sanpo.ui.stepsInfo',
          (params = {}) => `歩数: ${params.steps ?? stepsTaken}`,
          { steps: stepsTaken }
        );
      } else {
        stageInfo.textContent = text('games.sanpo.ui.stageInfoEmpty', 'タイプ: -');
        seedInfo.textContent = text('games.sanpo.ui.seedInfoEmpty', 'シード: -');
        stepsInfo.textContent = text('games.sanpo.ui.stepsInfoEmpty', '歩数: 0');
      }
      const zoomText = currentZoom.toFixed(2);
      zoomInfo.textContent = text(
        'games.sanpo.ui.zoomInfo',
        (params = {}) => `ズーム: ${(params.value ?? zoomText)}x`,
        { value: zoomText }
      );
    }

    function updateStatus(message){
      statusLabel.textContent = message;
    }

    function updateMiniMapVisibility(){
      miniMapContainer.style.display = showMiniMap ? 'grid' : 'none';
      toggleMapBtn.textContent = showMiniMap
        ? text('games.sanpo.ui.hideMap', 'ミニマップOFF')
        : text('games.sanpo.ui.showMap', 'ミニマップON');
    }

    function updateZoomFromSlider(){
      const value = Number(zoomSlider.value);
      if (Number.isFinite(value)){
        targetZoom = clamp(value, Number(zoomSlider.min), Number(zoomSlider.max));
      }
    }

    function adjustZoom(delta){
      const currentValue = Number(zoomSlider.value);
      const next = clamp(currentValue + delta, Number(zoomSlider.min), Number(zoomSlider.max));
      zoomSlider.value = next.toFixed(2);
      updateZoomFromSlider();
    }

    function readInputVector(){
      let dx = 0;
      let dy = 0;
      if (pressedKeys.has('arrowup') || pressedKeys.has('w')) dy -= 1;
      if (pressedKeys.has('arrowdown') || pressedKeys.has('s')) dy += 1;
      if (pressedKeys.has('arrowleft') || pressedKeys.has('a')) dx -= 1;
      if (pressedKeys.has('arrowright') || pressedKeys.has('d')) dx += 1;
      if (dx === 0 && dy === 0) return { dx: 0, dy: 0 };
      const len = Math.hypot(dx, dy) || 1;
      return { dx: dx / len, dy: dy / len };
    }

    function moveCircle(entity, deltaX, deltaY, radius){
      if (!stage) return;
      const maxDelta = Math.max(Math.abs(deltaX), Math.abs(deltaY));
      const stepCount = Math.max(1, Math.ceil(maxDelta / Math.max(1, radius * 0.45)));
      const stepX = deltaX / stepCount;
      const stepY = deltaY / stepCount;
      let x = entity.x;
      let y = entity.y;
      let blockedX = false;
      let blockedY = false;
      for (let i = 0; i < stepCount; i++){
        if (!blockedX && stepX !== 0){
          const nextX = x + stepX;
          if (!stage.collidesCircle(nextX, y, radius)) x = nextX;
          else blockedX = true;
        }
        if (!blockedY && stepY !== 0){
          const nextY = y + stepY;
          if (!stage.collidesCircle(x, nextY, radius)) y = nextY;
          else blockedY = true;
        }
        if (blockedX && blockedY) break;
      }
      const clamped = stage.clampPosition(x, y, radius);
      entity.x = clamped.x;
      entity.y = clamped.y;
    }

    function draw(){
      if (!stage || !background) return;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const zoomText = currentZoom.toFixed(2);
      zoomValue.textContent = text(
        'games.sanpo.ui.zoomDisplay',
        (params = {}) => `${params.value ?? zoomText}x`,
        { value: zoomText }
      );
      zoomInfo.textContent = text(
        'games.sanpo.ui.zoomInfo',
        (params = {}) => `ズーム: ${(params.value ?? zoomText)}x`,
        { value: zoomText }
      );

      const maxWidth = stage.pixelWidth || (stage.width * stage.tileSize);
      const maxHeight = stage.pixelHeight || (stage.height * stage.tileSize);
      const minWidth = Math.max(stage.tileSize * 6, cameraBaseWidth / 3);
      const minHeight = Math.max(stage.tileSize * 6, cameraBaseHeight / 3);
      const cameraWidth = clamp(cameraBaseWidth / currentZoom, minWidth, maxWidth);
      const cameraHeight = clamp(cameraBaseHeight / currentZoom, minHeight, maxHeight);
      const halfW = cameraWidth / 2;
      const halfH = cameraHeight / 2;
      let camX = (player.x || 0) - halfW;
      let camY = (player.y || 0) - halfH;
      camX = clamp(camX, 0, maxWidth - cameraWidth);
      camY = clamp(camY, 0, maxHeight - cameraHeight);

      ctx.drawImage(background.canvas, camX, camY, cameraWidth, cameraHeight, 0, 0, canvas.width, canvas.height);

      const scaleX = canvas.width / cameraWidth;
      const scaleY = canvas.height / cameraHeight;
      const screenX = (player.x - camX) * scaleX;
      const screenY = (player.y - camY) * scaleY;
      const radius = Math.max(4, player.radius * (scaleX + scaleY) * 0.5);

      ctx.fillStyle = '#38bdf8';
      ctx.strokeStyle = 'rgba(15,23,42,0.8)';
      ctx.lineWidth = Math.max(2, radius * 0.2);
      ctx.beginPath();
      ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      if (showMiniMap){
        const miniCtx = miniMapCanvas.getContext('2d');
        miniCtx.clearRect(0, 0, miniMapCanvas.width, miniMapCanvas.height);
        miniCtx.drawImage(background.canvas, 0, 0, miniMapCanvas.width, miniMapCanvas.height);
        const px = (player.x / maxWidth) * miniMapCanvas.width;
        const py = (player.y / maxHeight) * miniMapCanvas.height;
        const miniR = Math.max(3, player.radius * Math.min(miniMapCanvas.width, miniMapCanvas.height) / Math.max(maxWidth, maxHeight));
        miniCtx.fillStyle = '#facc15';
        miniCtx.beginPath();
        miniCtx.arc(px, py, miniR, 0, Math.PI * 2);
        miniCtx.fill();
      }
    }

    function randomSlideshowDirection(){
      const angle = Math.random() * Math.PI * 2;
      return { dx: Math.cos(angle), dy: Math.sin(angle) };
    }

    function resetSlideshowCycle(){
      if (!stage){
        slideshowDirection = null;
        slideshowElapsed = 0;
        slideshowNextRegen = 0;
        slideshowPendingRegen = false;
        return;
      }
      slideshowDirection = randomSlideshowDirection();
      slideshowElapsed = 0;
      slideshowPendingRegen = false;
      slideshowNextRegen = SLIDESHOW_MIN_REGEN + Math.random() * (SLIDESHOW_MAX_REGEN - SLIDESHOW_MIN_REGEN);
    }

    function applyRunningStatus(){
      if (!running) return;
      updateStatus(
        slideshowEnabled
          ? text('games.sanpo.ui.status.slideshow', 'スライドショー中… 自動でカメラが散歩します。')
          : text('games.sanpo.ui.status.walk', '散歩中… WASD/矢印キーで移動。Mでミニマップ切替、[ / ] でズーム。')
      );
    }

    function setSlideshowEnabled(enabled){
      slideshowEnabled = enabled;
      slideshowCheckbox.checked = enabled;
      if (enabled){
        pressedKeys.clear();
        pendingStart = true;
        if (stageReady){
          resetPlayer();
          resetSlideshowCycle();
          draw();
          if (!running){
            updateStatus(text('games.sanpo.ui.status.readySlideshow', '準備完了！開始するとスライドショーが始まります'));
          }
        }
        if (stageReady && !running){
          startLoop();
        } else if (!stageReady && !preparingStage){
          prepareStage();
        }
      } else {
        slideshowPendingRegen = false;
        slideshowDirection = null;
        if (!running){
          pendingStart = false;
          if (stageReady){
            updateStatus(text('games.sanpo.ui.status.ready', '準備完了！開始ボタンで散歩を始めよう'));
          }
        }
      }
      applyRunningStatus();
    }

    function loop(ts){
      if (!running) return;
      if (!lastTs) lastTs = ts;
      const delta = Math.min(0.05, Math.max(0, (ts - lastTs) / 1000));
      lastTs = ts;

      if (slideshowEnabled && stage && !slideshowDirection){
        resetSlideshowCycle();
      }

      let dx = 0;
      let dy = 0;

      if (slideshowEnabled && stage){
        dx = slideshowDirection?.dx ?? 0;
        dy = slideshowDirection?.dy ?? 0;
        slideshowElapsed += delta;
        if (!slideshowPendingRegen && slideshowNextRegen > 0 && slideshowElapsed >= slideshowNextRegen){
          slideshowPendingRegen = true;
        }
      } else {
        ({ dx, dy } = readInputVector());
      }

      if (slideshowEnabled && slideshowPendingRegen && !preparingStage){
        slideshowPendingRegen = false;
        slideshowElapsed = 0;
        pendingStart = true;
        prepareStage();
        return;
      }

      if ((dx !== 0 || dy !== 0) && stage){
        const speed = player.speed;
        const prevX = player.x;
        const prevY = player.y;
        moveCircle(player, dx * speed * delta, dy * speed * delta, player.radius);
        if (slideshowEnabled){
          const moved = Math.hypot(player.x - prevX, player.y - prevY);
          if (moved < 0.5){
            slideshowDirection = randomSlideshowDirection();
          }
        }
        const tile = stage.toTile(player.x, player.y);
        if (tile && (lastTile == null || tile.x !== lastTile.x || tile.y !== lastTile.y)){
          if (lastTile !== null){
            stepsTaken += 1;
            awardXp(1, { reason: 'step', gameId: 'sanpo' });
            stepsInfo.textContent = text(
              'games.sanpo.ui.stepsInfo',
              (params = {}) => `歩数: ${params.steps ?? stepsTaken}`,
              { steps: stepsTaken }
            );
          }
          lastTile = tile;
        }
      }

      const minZoom = Number(zoomSlider.min);
      const maxZoom = Number(zoomSlider.max);
      const smoothing = clamp(delta * 6, 0, 1);
      currentZoom = clamp(currentZoom + (targetZoom - currentZoom) * smoothing, minZoom, maxZoom);

      draw();
      raf = requestAnimationFrame(loop);
    }

    function stopLoop(){
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
      shortcuts?.enableKey?.('r');
      shortcuts?.enableKey?.('p');
      updateStatus(
        slideshowEnabled
          ? text('games.sanpo.ui.status.slideshowPaused', 'スライドショー一時停止中')
          : text('games.sanpo.ui.status.paused', '一時停止中')
      );
    }

    function startLoop(){
      if (!stageReady || running) return;
      running = true;
      shortcuts?.disableKey?.('r');
      shortcuts?.disableKey?.('p');
      lastTs = 0;
      applyRunningStatus();
      raf = requestAnimationFrame(loop);
    }

    function resetPlayer(){
      if (!stage) return;
      const spawn = stage.pickFloorPositionPixel({}) || { x: stage.tileSize * 2, y: stage.tileSize * 2 };
      player.x = spawn.x;
      player.y = spawn.y;
      player.radius = Math.max(6, Math.round(stage.tileSize * 0.4));
      player.speed = Math.max(60, stage.tileSize * 5.2);
      lastTile = stage.toTile(player.x, player.y);
      stepsTaken = 0;
      stepsInfo.textContent = text('games.sanpo.ui.stepsInfoEmpty', '歩数: 0');
    }

    function configureCanvas(){
      if (!stage) return;
      const pixelWidth = stage.pixelWidth || (stage.width * stage.tileSize);
      const pixelHeight = stage.pixelHeight || (stage.height * stage.tileSize);
      canvas.width = VIEWPORT_RENDER_SIZE;
      canvas.height = VIEWPORT_RENDER_SIZE;
      cameraBaseWidth = Math.min(pixelWidth, VIEWPORT_RENDER_SIZE);
      cameraBaseHeight = Math.min(pixelHeight, VIEWPORT_RENDER_SIZE);
      currentZoom = 1;
      targetZoom = 1;
      zoomSlider.value = '1';
      zoomValue.textContent = text('games.sanpo.ui.zoomDisplay', (params = {}) => `${params.value ?? '1.00'}x`, { value: '1.00' });
      miniMapCanvas.width = MINIMAP_RENDER_SIZE;
      miniMapCanvas.height = MINIMAP_RENDER_SIZE;
    }

    async function prepareStage(){
      if (preparingStage) return;
      if (!dungeonApi || typeof dungeonApi.generateStage !== 'function'){
        updateStatus(text('games.sanpo.ui.status.noApi', 'ダンジョンAPIが利用できません'));
        stageReady = false;
        return;
      }
      preparingStage = true;
      try {
        stopLoop();
        stageReady = false;
        stage = null;
        background = null;
        updateStageInfo();
        updateStatus(text('games.sanpo.ui.status.generating', 'ステージ生成中…'));
        const options = randomStageOptions();
        const prevRandom = Math.random;
        const setSeededRandom = typeof window !== 'undefined' ? window.setSeededRandom : null;
        const restoreRandom = typeof window !== 'undefined' ? window.restoreRandom : null;
        let generated = null;
        try {
          if (typeof setSeededRandom === 'function') setSeededRandom(stageSeed);
          generated = await dungeonApi.generateStage(options);
        } catch (error){
          console.warn('[sanpo] Failed to generate stage', error);
          updateStatus(text('games.sanpo.ui.status.failed', 'ステージ生成に失敗しました'));
          updateStageInfo();
          return;
        } finally {
          if (typeof restoreRandom === 'function') restoreRandom();
          else Math.random = prevRandom;
        }
        if (!generated) return;
        stage = generated;
        background = dungeonApi.renderStage(stage, { tileSize: stage.tileSize, showGrid: false });
        configureCanvas();
        resetPlayer();
        if (slideshowEnabled){
          resetSlideshowCycle();
        } else {
          slideshowDirection = null;
        }
        updateStageInfo();
        stageReady = true;
        updateStatus(
          slideshowEnabled
            ? text('games.sanpo.ui.status.readySlideshow', '準備完了！開始するとスライドショーが始まります')
            : text('games.sanpo.ui.status.ready', '準備完了！開始ボタンで散歩を始めよう')
        );
        if (pendingStart) startLoop();
        draw();
      } finally {
        preparingStage = false;
      }
    }

    function start(){
      pendingStart = true;
      if (stageReady) startLoop();
    }

    function stop(){
      pendingStart = false;
      stopLoop();
    }

    function destroy(){
      stopLoop();
      document.removeEventListener('keydown', keyDownHandler);
      document.removeEventListener('keyup', keyUpHandler);
      regenerateBtn.removeEventListener('click', regenerateHandler);
      toggleMapBtn.removeEventListener('click', toggleMapHandler);
      zoomSlider.removeEventListener('input', zoomInputHandler);
      slideshowCheckbox.removeEventListener('change', slideshowChangeHandler);
      try { wrapper.remove(); } catch {}
    }

    function getScore(){
      return stepsTaken;
    }

    function toggleMapHandler(){
      showMiniMap = !showMiniMap;
      updateMiniMapVisibility();
      draw();
    }

    function regenerateHandler(){
      if (preparingStage) return;
      const shouldResume = slideshowEnabled ? true : (running || pendingStart);
      pendingStart = shouldResume;
      prepareStage();
    }

    function zoomInputHandler(){
      updateZoomFromSlider();
    }

    function slideshowChangeHandler(){
      setSlideshowEnabled(slideshowCheckbox.checked);
    }

    function keyDownHandler(e){
      if (e.repeat) return;
      const rawKey = e.key || '';
      const key = rawKey.toLowerCase();
      if ([ 'arrowup','arrowdown','arrowleft','arrowright','w','a','s','d' ].includes(key)){
        e.preventDefault();
        pressedKeys.add(key);
      } else if (key === 'm'){
        e.preventDefault();
        toggleMapHandler();
      } else if (rawKey === '['){
        e.preventDefault();
        adjustZoom(-0.1);
      } else if (rawKey === ']'){
        e.preventDefault();
        adjustZoom(0.1);
      }
    }

    function keyUpHandler(e){
      const key = (e.key || '').toLowerCase();
      if ([ 'arrowup','arrowdown','arrowleft','arrowright','w','a','s','d' ].includes(key)){
        pressedKeys.delete(key);
      }
    }

    updateMiniMapVisibility();
    updateStageInfo();
    updateStatus(text('games.sanpo.ui.status.initializing', 'ロード中…'));

    regenerateBtn.addEventListener('click', regenerateHandler);
    toggleMapBtn.addEventListener('click', toggleMapHandler);
    zoomSlider.addEventListener('input', zoomInputHandler);
    slideshowCheckbox.addEventListener('change', slideshowChangeHandler);
    document.addEventListener('keydown', keyDownHandler, { passive: false });
    document.addEventListener('keyup', keyUpHandler, { passive: true });

    prepareStage();

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({
    id: 'sanpo',
    name: '散歩',
    nameKey: 'selection.miniexp.games.sanpo.name',
    description: 'ランダム生成ダンジョンを散歩して歩数×1EXP',
    descriptionKey: 'selection.miniexp.games.sanpo.description',
    categoryIds: ['toy'],
    create
  });
})();

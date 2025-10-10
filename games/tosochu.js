(function(){
  /** MiniExp: 逃走中シミュレーター
   *  - Survive mixed-type dungeon hunters for full reward
   *  - 10EXP accumulates per second survived
   *  - Escape for +10000EXP, surrender to keep accumulated EXP, capture = 0
   */
  function create(root, awardXp, opts){
    const shortcuts = opts?.shortcuts;
    const dungeonApi = opts?.dungeon;
    const difficulty = opts?.difficulty || 'NORMAL';
    const i18n = window.I18n;

    const textBindings = new Map();
    let detachLocale = null;

    function translateText(key, fallback, params){
      if (key && i18n && typeof i18n.t === 'function'){
        try {
          const result = i18n.t(key, params);
          if (typeof result === 'string' && result !== key){
            return result;
          }
        } catch (err) {
          // ignore translation failures and fall back
        }
      }
      if (typeof fallback === 'function'){
        try {
          return fallback(params);
        } catch (err) {
          return '';
        }
      }
      return fallback ?? '';
    }

    function bindText(element, key, fallback, paramsBuilder){
      if (!element) return;
      const builder = typeof paramsBuilder === 'function' ? paramsBuilder : () => (paramsBuilder || {});
      textBindings.set(element, { key, fallback, builder });
      const params = builder() || {};
      element.textContent = translateText(key, fallback, params);
    }

    function refreshBindings(){
      for (const [element, binding] of textBindings.entries()){
        if (!element || !binding) continue;
        const params = (binding.builder && binding.builder()) || {};
        element.textContent = translateText(binding.key, binding.fallback, params);
      }
    }

    function formatNumber(value, options){
      if (typeof value !== 'number' || Number.isNaN(value)) return '';
      if (i18n && typeof i18n.formatNumber === 'function'){
        try {
          return i18n.formatNumber(value, options);
        } catch (err) {
          // ignore formatting failures and fall back
        }
      }
      try {
        return new Intl.NumberFormat(undefined, options).format(value);
      } catch (err) {
        return value.toLocaleString();
      }
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'mini-tosochu';
    wrapper.style.display = 'grid';
    wrapper.style.gap = '8px';
    wrapper.style.fontFamily = 'system-ui, sans-serif';
    wrapper.style.color = '#e2e8f0';

    const infoBar = document.createElement('div');
    infoBar.style.display = 'flex';
    infoBar.style.gap = '12px';
    infoBar.style.alignItems = 'center';
    infoBar.style.background = 'rgba(15,23,42,0.85)';
    infoBar.style.padding = '8px 12px';
    infoBar.style.borderRadius = '10px';

    const timerLabel = document.createElement('span');
    timerLabel.style.fontWeight = '600';
    const expLabel = document.createElement('span');
    const statusLabel = document.createElement('span');
    statusLabel.style.marginLeft = 'auto';

    infoBar.appendChild(timerLabel);
    infoBar.appendChild(expLabel);
    infoBar.appendChild(statusLabel);

    const missionPanel = document.createElement('div');
    missionPanel.style.background = 'rgba(15,23,42,0.8)';
    missionPanel.style.borderRadius = '8px';
    missionPanel.style.padding = '8px 10px';
    missionPanel.style.fontSize = '0.9rem';
    setMissionPanel('miniexp.games.tosochu.ui.missionNotReady', 'ミッション: まだ発動していません');

    const canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    canvas.style.borderRadius = '10px';
    canvas.style.boxShadow = '0 12px 24px rgba(15,23,42,0.35)';

    const controlRow = document.createElement('div');
    controlRow.style.display = 'flex';
    controlRow.style.gap = '8px';

    const surrenderBtn = document.createElement('button');
    surrenderBtn.type = 'button';
    setSurrenderButton('miniexp.games.tosochu.ui.surrender', '自首する');
    surrenderBtn.style.padding = '8px 12px';
    surrenderBtn.style.borderRadius = '8px';
    surrenderBtn.style.border = 'none';
    surrenderBtn.style.cursor = 'pointer';
    surrenderBtn.style.background = '#fbbf24';
    surrenderBtn.style.color = '#1f2937';

    controlRow.appendChild(surrenderBtn);

    function setStatus(key, fallback, paramsBuilder){
      bindText(statusLabel, key, fallback, paramsBuilder);
    }

    function setMissionPanel(key, fallback, paramsBuilder){
      bindText(missionPanel, key, fallback, paramsBuilder);
    }

    function setSurrenderButton(key, fallback, paramsBuilder){
      bindText(surrenderBtn, key, fallback, paramsBuilder);
    }

    function translateMissionLabel(mission){
      if (!mission) return '';
      return translateText(mission.labelKey, mission.labelFallback);
    }

    function missionOptionalSuffix(mission){
      if (!mission?.optional) return '';
      return translateText('miniexp.games.tosochu.missions.optionalSuffix', '（任意）');
    }

    wrapper.appendChild(infoBar);
    wrapper.appendChild(missionPanel);
    wrapper.appendChild(canvas);
    wrapper.appendChild(controlRow);
    root.appendChild(wrapper);

    let stage = null;
    let background = null;
    let stageReady = false;
    let camera = null;

    const player = { px: 0, py: 0, speed: 0, radius: 0 };
    const hunters = [];
    const pressed = new Set();

    const missions = [];
    const hunterBoxes = [];

    let surrenderZone = null;
    let surrenderCountdown = null;

    let running = false;
    let pendingStart = false;
    let raf = 0;
    let lastTs = 0;
    let elapsed = 0;
    let remaining = 0;
    let accumulator = 0;
    let pendingExp = 0;
    let finished = false;
    let runInitialized = false;

    const TOTAL_DURATION = difficulty === 'HARD' ? 210 : difficulty === 'EASY' ? 150 : 180;
    const PER_SECOND_EXP = 10;
    const ESCAPE_BONUS = 10000;

    const CAMERA_TILES_X = 19;
    const CAMERA_TILES_Y = 15;
    const PLAYER_SPEED_TPS = difficulty === 'HARD' ? 3.6 : difficulty === 'EASY' ? 2.8 : 3.2;
    const HUNTER_IDLE_SPEED = PLAYER_SPEED_TPS * 0.55;
    const HUNTER_CHASE_SPEED = PLAYER_SPEED_TPS * (difficulty === 'HARD' ? 1.22 : 1.12);
    const HUNTER_ALERT_DURATION = 5;
    const HUNTER_WANDER_COOLDOWN = 3.5;
    const SURRENDER_DURATION = 5;

    function disableHost(){ shortcuts?.disableKey?.('r'); shortcuts?.disableKey?.('p'); }
    function enableHost(){ shortcuts?.enableKey?.('r'); shortcuts?.enableKey?.('p'); }

    function updateLabels(){
      bindText(
        timerLabel,
        'miniexp.games.tosochu.ui.timer',
        params => `残り ${params.seconds}s`,
        () => ({
          seconds: formatNumber(Math.max(0, remaining), { minimumFractionDigits: 1, maximumFractionDigits: 1 })
        })
      );
      bindText(
        expLabel,
        'miniexp.games.tosochu.ui.exp',
        params => `蓄積EXP ${params.exp}`,
        () => ({ exp: formatNumber(Math.floor(pendingExp)) })
      );
    }

    function keyDown(e){
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      if ([ 'arrowup','arrowdown','arrowleft','arrowright','w','a','s','d' ].includes(key)){
        e.preventDefault();
        pressed.add(key);
      }
    }

    function keyUp(e){
      const key = e.key.toLowerCase();
      if ([ 'arrowup','arrowdown','arrowleft','arrowright','w','a','s','d' ].includes(key)){
        pressed.delete(key);
      }
    }

    function pickDirection(){
      let dx = 0;
      let dy = 0;
      if (pressed.has('arrowup') || pressed.has('w')) dy -= 1;
      if (pressed.has('arrowdown') || pressed.has('s')) dy += 1;
      if (pressed.has('arrowleft') || pressed.has('a')) dx -= 1;
      if (pressed.has('arrowright') || pressed.has('d')) dx += 1;
      if (dx === 0 && dy === 0) return null;
      const length = Math.hypot(dx, dy) || 1;
      return { dx: dx / length, dy: dy / length };
    }

    function moveEntity(entity, dir, speed, dt){
      if (!dir || !stage || speed <= 0 || dt <= 0) return;
      const tileSize = stage.tileSize;
      const step = speed * tileSize * dt;
      const radius = entity.radius ?? tileSize * 0.3;
      const moveX = dir.dx * step;
      const moveY = dir.dy * step;
      const nextX = entity.px + moveX;
      if (!stage.collidesCircle(nextX, entity.py, radius)){
        entity.px = nextX;
      }
      const nextY = entity.py + moveY;
      if (!stage.collidesCircle(entity.px, nextY, radius)){
        entity.py = nextY;
      }
      const clamped = stage.clampPosition(entity.px, entity.py, radius);
      entity.px = clamped.x;
      entity.py = clamped.y;
    }

    function bfsNext(start, goal){
      if (!stage) return null;
      if (start.x === goal.x && start.y === goal.y) return { x: goal.x, y: goal.y };
      const w = stage.width;
      const h = stage.height;
      const queue = [];
      const visited = new Uint8Array(w * h);
      const parent = new Map();
      const idx = (x, y) => y * w + x;
      queue.push(start);
      visited[idx(start.x, start.y)] = 1;
      const dirs = [ [1,0], [-1,0], [0,1], [0,-1] ];
      while (queue.length){
        const node = queue.shift();
        if (node.x === goal.x && node.y === goal.y) break;
        for (const [dx, dy] of dirs){
          const nx = node.x + dx;
          const ny = node.y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          if (stage.tiles[ny]?.[nx] !== 0) continue;
          const id = idx(nx, ny);
          if (visited[id]) continue;
          visited[id] = 1;
          parent.set(id, node);
          queue.push({ x: nx, y: ny });
        }
      }
      const goalIdx = idx(goal.x, goal.y);
      if (!visited[goalIdx]) return null;
      let cur = { x: goal.x, y: goal.y };
      while (true){
        const prev = parent.get(idx(cur.x, cur.y));
        if (!prev) break;
        if (prev.x === start.x && prev.y === start.y) return cur;
        cur = prev;
      }
      return cur;
    }

    function toTileFromPixel(px, py){
      if (!stage) return { x: 0, y: 0 };
      const tileSize = stage.tileSize || 1;
      const tx = Math.max(0, Math.min(stage.width - 1, Math.floor(px / tileSize)));
      const ty = Math.max(0, Math.min(stage.height - 1, Math.floor(py / tileSize)));
      return { x: tx, y: ty };
    }

    function entityTile(entity){
      return toTileFromPixel(entity.px, entity.py);
    }

    function randomUnitDirection(){
      const angle = Math.random() * Math.PI * 2;
      return { dx: Math.cos(angle), dy: Math.sin(angle) };
    }

    function createHunter(px, py){
      const radius = stage ? stage.tileSize * 0.28 : 6;
      return {
        px,
        py,
        radius,
        state: 'idle',
        dir: randomUnitDirection(),
        speed: HUNTER_IDLE_SPEED,
        alertTimer: 0,
        wanderTimer: Math.random() * HUNTER_WANDER_COOLDOWN,
        chaseTarget: null
      };
    }

    function distancePx(a, b){
      return Math.hypot(a.x - b.x, a.y - b.y);
    }

    function hasLineOfSight(from, to){
      if (!stage) return false;
      const start = entityTile(from);
      const goal = entityTile(to);
      let x0 = start.x;
      let y0 = start.y;
      const x1 = goal.x;
      const y1 = goal.y;
      const dx = Math.abs(x1 - x0);
      const dy = Math.abs(y1 - y0);
      const sx = x0 < x1 ? 1 : -1;
      const sy = y0 < y1 ? 1 : -1;
      let err = dx - dy;
      while (true){
        if (stage.tiles[y0]?.[x0] !== 0 && !(x0 === start.x && y0 === start.y)) return false;
        if (x0 === x1 && y0 === y1) break;
        const e2 = err * 2;
        if (e2 > -dy){ err -= dy; x0 += sx; }
        if (e2 < dx){ err += dx; y0 += sy; }
      }
      return true;
    }

    function checkCaught(){
      if (!stage) return false;
      const captureRadius = (player.radius || stage.tileSize * 0.32) + stage.tileSize * 0.1;
      return hunters.some(h => distancePx({ x: h.px, y: h.py }, { x: player.px, y: player.py }) <= captureRadius);
    }

    function spawnHunter(pos){
      if (!pos || !stage) return;
      const tile = pos.tile ? pos.tile : pos;
      const center = stage.tileCenter(tile.x, tile.y);
      hunters.push(createHunter(center.x, center.y));
      setStatus('miniexp.games.tosochu.status.hunterAdded', 'ハンターが追加投入された！');
    }

    function removeNearestHunter(){
      if (!hunters.length) return;
      let bestIdx = 0;
      let bestDist = Infinity;
      for (let i = 0; i < hunters.length; i++){
        const h = hunters[i];
        const d = distancePx({ x: h.px, y: h.py }, { x: player.px, y: player.py });
        if (d < bestDist){ bestDist = d; bestIdx = i; }
      }
      hunters.splice(bestIdx, 1);
      setStatus('miniexp.games.tosochu.status.hunterRetreat', 'ミッション成功！ハンター1体が撤退');
    }

    function processMissions(dt){
      for (const mission of missions){
        if (mission.state === 'pending' && elapsed >= mission.triggerAt){
          mission.state = 'active';
          mission.timeLeft = mission.timeLimit;
          const targetTile = stage.pickFloorPosition({ minDistance: 6 }) || { x: Math.floor(stage.width / 2), y: Math.floor(stage.height / 2) };
          const center = stage.tileCenter(targetTile.x, targetTile.y);
          mission.target = { tile: targetTile, x: center.x, y: center.y };
          setStatus(
            'miniexp.games.tosochu.status.missionActivated',
            params => `ミッション発動：${params.label}`,
            () => ({ label: translateMissionLabel(mission) })
          );
        }
        if (mission.state === 'active'){
          mission.timeLeft -= dt;
          if (distancePx({ x: player.px, y: player.py }, mission.target) <= stage.tileSize * 0.5){
            mission.state = 'success';
            setMissionPanel(
              'miniexp.games.tosochu.ui.missionSuccess',
              params => `${params.label}：成功！`,
              () => ({ label: translateMissionLabel(mission) })
            );
            mission.onSuccess();
            continue;
          }
          if (mission.timeLeft <= 0){
            mission.state = 'failed';
            setMissionPanel(
              'miniexp.games.tosochu.ui.missionFailed',
              params => `${params.label}：失敗…`,
              () => ({ label: translateMissionLabel(mission) })
            );
            mission.onFail();
            continue;
          }
        }
      }
      const active = missions.find(m => m.state === 'active');
      if (active){
        const coords = `${active.target.tile.x},${active.target.tile.y}`;
        setMissionPanel(
          'miniexp.games.tosochu.ui.missionActive',
          params => `ミッション: ${params.label}${params.optionalSuffix}：残り${params.seconds}s (地点: ${params.coords})`,
          () => ({
            label: translateMissionLabel(active),
            optionalSuffix: missionOptionalSuffix(active),
            seconds: formatNumber(Math.max(0, Math.ceil(active.timeLeft))),
            coords
          })
        );
      } else if (!missions.some(m => m.state === 'pending')){
        const successCount = missions.filter(m => m.state === 'success').length;
        setMissionPanel(
          'miniexp.games.tosochu.ui.missionComplete',
          params => `ミッション完了：成功${params.success}/${params.total}`,
          () => ({
            success: formatNumber(successCount),
            total: formatNumber(missions.length)
          })
        );
      }
    }

    function processBoxes(){
      for (const box of hunterBoxes){
        if (box.opened) continue;
        if (elapsed >= box.triggerAt){
          box.opened = true;
          spawnHunter(box.position);
        }
      }
    }

    function playerInSurrenderZone(){
      if (!surrenderZone) return false;
      const dist = distancePx({ x: player.px, y: player.py }, surrenderZone);
      return dist <= Math.max(0, surrenderZone.radius - player.radius * 0.1);
    }

    function cancelSurrender(statusKey, fallback, paramsBuilder){
      if (!surrenderCountdown) return;
      surrenderCountdown = null;
      surrenderBtn.disabled = false;
      setSurrenderButton('miniexp.games.tosochu.ui.surrender', '自首する');
      if (statusKey || fallback){
        setStatus(statusKey, fallback, paramsBuilder);
      }
    }

    function updateSurrender(dt){
      if (!surrenderCountdown) return;
      if (!playerInSurrenderZone()){
        cancelSurrender('miniexp.games.tosochu.status.surrenderCancelled', '自首を中断しました');
        return;
      }
      surrenderCountdown.timeLeft -= dt;
      const remainingTime = Math.max(0, surrenderCountdown.timeLeft);
      setSurrenderButton(
        'miniexp.games.tosochu.ui.surrenderCountdown',
        params => `自首中...${params.seconds}s`,
        () => ({
          seconds: formatNumber(remainingTime, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
        })
      );
      if (surrenderCountdown.timeLeft <= 0){
        endGame('surrender');
      }
    }

    function updateHunterState(hunter, dt){
      if (!stage) return;
      const inView = camera ? camera.contains(hunter.px, hunter.py, stage.tileSize) : false;
      const seesPlayer = inView && hasLineOfSight(hunter, player);
      if (seesPlayer){
        hunter.alertTimer = HUNTER_ALERT_DURATION;
      } else if (hunter.alertTimer > 0){
        hunter.alertTimer = Math.max(0, hunter.alertTimer - dt);
      }

      const shouldChase = hunter.alertTimer > 0;
      if (shouldChase){
        hunter.state = 'chase';
        const startTile = entityTile(hunter);
        const goalTile = entityTile(player);
        const targetTile = bfsNext(startTile, goalTile);
        if (!targetTile){
          hunter.dir = randomUnitDirection();
          moveEntity(hunter, hunter.dir, HUNTER_IDLE_SPEED, dt);
          return;
        }
        const targetCenter = stage.tileCenter(targetTile.x, targetTile.y);
        const dir = { dx: targetCenter.x - hunter.px, dy: targetCenter.y - hunter.py };
        const len = Math.hypot(dir.dx, dir.dy) || 1;
        dir.dx /= len;
        dir.dy /= len;
        moveEntity(hunter, dir, HUNTER_CHASE_SPEED, dt);
      } else {
        hunter.state = 'idle';
        hunter.wanderTimer -= dt;
        if (hunter.wanderTimer <= 0){
          hunter.dir = randomUnitDirection();
          hunter.wanderTimer = HUNTER_WANDER_COOLDOWN + Math.random() * 2.5;
        }
        moveEntity(hunter, hunter.dir, HUNTER_IDLE_SPEED, dt);
      }
    }

    function updateHunters(dt){
      for (const hunter of hunters){
        updateHunterState(hunter, dt);
      }
    }

    function draw(){
      if (!stage || !background || !camera) return;
      const ctx = canvas.getContext('2d');
      const bounds = camera.getBounds();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(background.canvas, bounds.x, bounds.y, bounds.width, bounds.height, 0, 0, canvas.width, canvas.height);
      const tile = stage.tileSize;

      // Draw surrender zone
      if (surrenderZone && camera.contains(surrenderZone.x, surrenderZone.y, surrenderZone.radius)){
        const center = camera.project(surrenderZone.x, surrenderZone.y);
        ctx.fillStyle = 'rgba(250,204,21,0.18)';
        ctx.strokeStyle = 'rgba(250,204,21,0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(center.x, center.y, surrenderZone.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Draw mission targets
      for (const mission of missions){
        if (mission.state === 'active' && mission.target){
          if (camera.contains(mission.target.x, mission.target.y, tile)){
            const topLeft = camera.project(mission.target.x - tile / 2, mission.target.y - tile / 2);
            ctx.fillStyle = 'rgba(56,189,248,0.5)';
            ctx.fillRect(topLeft.x, topLeft.y, tile, tile);
          }
        }
      }

      // Draw hunter boxes
      ctx.lineWidth = 2;
      for (const box of hunterBoxes){
        const alpha = box.opened ? 0.2 : 0.6;
        const worldCenter = stage.tileCenter(box.position.x, box.position.y);
        if (!camera.contains(worldCenter.x, worldCenter.y, tile)) continue;
        const screen = camera.project(worldCenter.x, worldCenter.y);
        const px = screen.x - tile / 2;
        const py = screen.y - tile / 2;
        ctx.strokeStyle = `rgba(248,113,113,${alpha})`;
        ctx.strokeRect(px + 2, py + 2, tile - 4, tile - 4);
      }

      // Player
      const playerScreen = camera.project(player.px, player.py);
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.arc(playerScreen.x, playerScreen.y, player.radius, 0, Math.PI * 2);
      ctx.fill();

      // Hunters
      for (const h of hunters){
        if (!camera.contains(h.px, h.py, h.radius * 1.5)) continue;
        const screen = camera.project(h.px, h.py);
        ctx.fillStyle = h.state === 'alert' || h.state === 'chase' ? '#f87171' : '#ef4444';
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, h.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function endGame(result){
      if (finished) return;
      finished = true;
      running = false;
      cancelAnimationFrame(raf);
      enableHost();
      pressed.clear();
      cancelSurrender();
      surrenderBtn.disabled = true;
      setSurrenderButton('miniexp.games.tosochu.ui.surrender', '自首する');
      if (result === 'escape'){
        const total = pendingExp + ESCAPE_BONUS;
        awardXp(total, { reason: 'escape', gameId: 'tosochu' });
        setStatus(
          'miniexp.games.tosochu.status.escapeSuccess',
          params => `逃走成功！+${params.total} EXP (内訳 ${params.base}+${params.bonus})`,
          () => ({
            total: formatNumber(total),
            base: formatNumber(pendingExp),
            bonus: formatNumber(ESCAPE_BONUS)
          })
        );
      } else if (result === 'surrender'){
        awardXp(pendingExp, { reason: 'surrender', gameId: 'tosochu' });
        setStatus(
          'miniexp.games.tosochu.status.surrenderSuccess',
          params => `自首。蓄積${params.exp}EXPを獲得`,
          () => ({ exp: formatNumber(pendingExp) })
        );
      } else if (result === 'caught'){
        setStatus('miniexp.games.tosochu.status.caught', '捕まってしまった…獲得EXPなし');
      }
    }

    function step(dt){
      if (!running || !stageReady) return;
      elapsed += dt;
      remaining = Math.max(0, TOTAL_DURATION - elapsed);
      accumulator += dt;
      while (accumulator >= 1){
        accumulator -= 1;
        pendingExp += PER_SECOND_EXP;
      }

      const dir = pickDirection();
      if (dir){
        moveEntity(player, dir, player.speed, dt);
      }

      updateHunters(dt);
      updateSurrender(dt);
      processMissions(dt);
      processBoxes();
      if (camera) camera.setCenter(player.px, player.py);
      updateLabels();
      draw();

      if (checkCaught()){
        endGame('caught');
        return;
      }

      if (remaining <= 0){
        endGame('escape');
      }
    }

    function loop(ts){
      const now = ts * 0.001;
      if (!lastTs) lastTs = now;
      const dt = Math.min(0.2, now - lastTs);
      lastTs = now;
      step(dt);
      if (running) raf = requestAnimationFrame(loop);
    }

    function reset(){
      pendingExp = 0;
      accumulator = 0;
      elapsed = 0;
      remaining = TOTAL_DURATION;
      hunters.length = 0;
      missions.length = 0;
      hunterBoxes.length = 0;
      finished = false;
      surrenderCountdown = null;
      surrenderZone = null;
      surrenderBtn.disabled = false;
      setSurrenderButton('miniexp.games.tosochu.ui.surrender', '自首する');
      setStatus('miniexp.games.tosochu.status.standby', '逃走中スタンバイ');
      setMissionPanel('miniexp.games.tosochu.ui.missionNotReady', 'ミッション: まだ発動していません');
      runInitialized = false;
      pressed.clear();
    }

    function setupRun(){
      if (!stage) return;
      reset();
      const spawns = stage.pickFloorPositions(4, { minDistance: 6 });
      const [playerSpawn, ...hunterSpawns] = spawns;
      const playerTile = playerSpawn || { x: 2, y: 2 };
      const playerCenter = stage.tileCenter(playerTile.x, playerTile.y);
      player.px = playerCenter.x;
      player.py = playerCenter.y;
      player.speed = PLAYER_SPEED_TPS;
      player.radius = stage.tileSize * 0.33;
      const takenTiles = [playerTile];
      const hunterCount = difficulty === 'HARD' ? 4 : difficulty === 'EASY' ? 2 : 3;
      for (let i = 0; i < hunterCount; i++){
        const spawnTile = hunterSpawns[i] || stage.pickFloorPosition({ minDistance: 6, exclude: takenTiles }) || { x: stage.width - 2, y: stage.height - 2 };
        takenTiles.push(spawnTile);
        const center = stage.tileCenter(spawnTile.x, spawnTile.y);
        hunters.push(createHunter(center.x, center.y));
      }

      missions.push(
        {
          id: 'beacon',
          labelKey: 'miniexp.games.tosochu.missions.beacon.label',
          labelFallback: 'ビーコンに接触せよ',
          triggerAt: 30,
          timeLimit: 35,
          state: 'pending',
          onSuccess(){
            removeNearestHunter();
            pendingExp += 200;
            setStatus('miniexp.games.tosochu.status.beaconSuccess', 'ビーコン成功！電波妨害を強化');
          },
          onFail(){
            setStatus('miniexp.games.tosochu.status.beaconFail', 'ビーコン失敗…ハンターが警戒強化');
            spawnHunter(stage.pickFloorPosition({ minDistance: 4, exclude: takenTiles }));
          }
        },
        {
          id: 'data',
          labelKey: 'miniexp.games.tosochu.missions.data.label',
          labelFallback: '情報端末をハック',
          triggerAt: 55,
          timeLimit: 25,
          state: 'pending',
          onSuccess(){
            pendingExp += 800;
            setStatus('miniexp.games.tosochu.status.dataSuccess', '極秘情報を確保！報酬が増加');
          },
          onFail(){
            setStatus('miniexp.games.tosochu.status.dataFail', '警報が鳴った！高速ハンターが出現');
            spawnHunter(stage.pickFloorPosition({ minDistance: 5, exclude: takenTiles }));
          }
        },
        {
          id: 'box',
          labelKey: 'miniexp.games.tosochu.missions.box.label',
          labelFallback: 'ハンターボックスを解除',
          triggerAt: 80,
          timeLimit: 30,
          state: 'pending',
          onSuccess(){
            setStatus('miniexp.games.tosochu.status.boxSuccess', '解除成功！ハンターボックスの発動が遅延');
            hunterBoxes.forEach(b => b.triggerAt += 20);
          },
          onFail(){
            setStatus('miniexp.games.tosochu.status.boxFail', '解除失敗…ハンターが追加投入');
            spawnHunter(stage.pickFloorPosition({ minDistance: 5, exclude: takenTiles }));
          }
        },
        {
          id: 'vault',
          labelKey: 'miniexp.games.tosochu.missions.vault.label',
          labelFallback: 'ハイリスク金庫を解錠',
          triggerAt: 120,
          timeLimit: 30,
          state: 'pending',
          optional: true,
          onSuccess(){
            pendingExp += 2000;
            setStatus('miniexp.games.tosochu.status.vaultSuccess', '大金獲得！しかし狙われやすくなった');
          },
          onFail(){
            setStatus('miniexp.games.tosochu.status.vaultFail', '金庫防衛が発動…ハンターが二体解放');
            spawnHunter(stage.pickFloorPosition({ minDistance: 6, exclude: takenTiles }));
            spawnHunter(stage.pickFloorPosition({ minDistance: 6, exclude: takenTiles }));
          }
        }
      );

      hunterBoxes.push(
        { position: stage.pickFloorPosition({ minDistance: 5, exclude: takenTiles }) || { x: 3, y: 3 }, triggerAt: 90, opened: false },
        { position: stage.pickFloorPosition({ minDistance: 5, exclude: takenTiles }) || { x: stage.width - 4, y: stage.height - 4 }, triggerAt: 130, opened: false }
      );

      const surrenderTile = stage.pickFloorPosition({ minDistance: 5, exclude: takenTiles }) || { x: playerTile.x + 2, y: playerTile.y + 2 };
      const surrenderCenter = stage.tileCenter(surrenderTile.x, surrenderTile.y);
      surrenderZone = { x: surrenderCenter.x, y: surrenderCenter.y, radius: stage.tileSize };

      if (camera) camera.setCenter(player.px, player.py);

      draw();
      updateLabels();
      runInitialized = true;
    }

    function initStage(){
      if (!dungeonApi?.generateStage){
        setStatus('miniexp.games.tosochu.status.dungeonUnavailable', 'ダンジョンAPI利用不可');
        return;
      }
      dungeonApi.generateStage({ type: 'mixed', tilesX: 48, tilesY: 36, tileSize: 17 }).then((generated) => {
        stage = generated;
        camera = stage.createCamera({ viewTilesX: CAMERA_TILES_X, viewTilesY: CAMERA_TILES_Y });
        background = dungeonApi.renderStage(stage, { tileSize: stage.tileSize, showGrid: false });
        if (camera){
          canvas.width = camera.width;
          canvas.height = camera.height;
          canvas.style.width = `${camera.width}px`;
          canvas.style.height = `${camera.height}px`;
        } else {
          canvas.width = background.canvas.width;
          canvas.height = background.canvas.height;
          canvas.style.width = `${background.canvas.width}px`;
          canvas.style.height = `${background.canvas.height}px`;
        }
        stageReady = true;
        setupRun();
        if (pendingStart) startLoop();
      }).catch(() => {
        setStatus('miniexp.games.tosochu.status.stageGenerationFailed', 'ステージ生成に失敗しました');
      });
    }

    function startLoop(){
      if (!stageReady || running || finished) return;
      running = true;
      disableHost();
      lastTs = 0;
      if (camera) camera.setCenter(player.px, player.py);
      updateLabels();
      raf = requestAnimationFrame(loop);
      setStatus('miniexp.games.tosochu.status.runStart', '逃走開始！');
    }

    function stopLoop(){
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
      enableHost();
      setStatus('miniexp.games.tosochu.status.runPaused', '一時停止中');
    }

    function start(){
      pendingStart = true;
      if (!stageReady){
        initStage();
      } else {
        if (!runInitialized || finished) setupRun();
        startLoop();
      }
    }

    function stop(){
      pendingStart = false;
      stopLoop();
    }

    function destroy(){
      cancelAnimationFrame(raf);
      enableHost();
      cancelSurrender();
      if (typeof detachLocale === 'function'){
        try { detachLocale(); } catch (err) {}
      }
      textBindings.clear();
      document.removeEventListener('keydown', keyDown);
      document.removeEventListener('keyup', keyUp);
      surrenderBtn.removeEventListener('click', onSurrender);
      try { wrapper.remove(); } catch {}
    }

    function getScore(){ return pendingExp + (finished && remaining <= 0 ? ESCAPE_BONUS : 0); }

    function onSurrender(){
      if (!stageReady || finished || surrenderCountdown) return;
      if (!playerInSurrenderZone()){
        setStatus('miniexp.games.tosochu.status.surrenderZoneHint', '自首ゾーンに入ってからボタンを押してください');
        return;
      }
      surrenderCountdown = { timeLeft: SURRENDER_DURATION };
      surrenderBtn.disabled = true;
      setSurrenderButton(
        'miniexp.games.tosochu.ui.surrenderCountdown',
        params => `自首中...${params.seconds}s`,
        () => ({
          seconds: formatNumber(SURRENDER_DURATION, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
        })
      );
      setStatus(
        'miniexp.games.tosochu.status.surrenderAttempt',
        params => `自首を試みています…${params.duration}s耐え抜け！`,
        () => ({
          duration: formatNumber(SURRENDER_DURATION, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
        })
      );
    }

    if (typeof i18n?.onLocaleChanged === 'function'){
      detachLocale = i18n.onLocaleChanged(() => {
        updateLabels();
        refreshBindings();
      });
    }

    surrenderBtn.addEventListener('click', onSurrender);
    document.addEventListener('keydown', keyDown, { passive: false });
    document.addEventListener('keyup', keyUp, { passive: true });

    reset();
    initStage();

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({ id: 'tosochu', name: '逃走中', nameKey: 'selection.miniexp.games.tosochu.name', description: '逃げ切れば+10000EXP、1秒ごとに10EXP蓄積', descriptionKey: 'selection.miniexp.games.tosochu.description', categoryIds: ['action'], create });
})();

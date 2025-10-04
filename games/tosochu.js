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
    missionPanel.textContent = 'ミッション: まだ発動していません';

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
    surrenderBtn.textContent = '自首する';
    surrenderBtn.style.padding = '8px 12px';
    surrenderBtn.style.borderRadius = '8px';
    surrenderBtn.style.border = 'none';
    surrenderBtn.style.cursor = 'pointer';
    surrenderBtn.style.background = '#fbbf24';
    surrenderBtn.style.color = '#1f2937';

    controlRow.appendChild(surrenderBtn);

    wrapper.appendChild(infoBar);
    wrapper.appendChild(missionPanel);
    wrapper.appendChild(canvas);
    wrapper.appendChild(controlRow);
    root.appendChild(wrapper);

    let stage = null;
    let background = null;
    let stageReady = false;

    const player = { x: 0, y: 0 };
    const hunters = [];
    const hunterTimers = [];
    const pressed = new Set();

    const missions = [];
    const hunterBoxes = [];

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

    const PLAYER_STEP_INTERVAL = 0.16;
    const HUNTER_STEP_INTERVAL = difficulty === 'HARD' ? 0.24 : 0.3;

    const moveCooldown = { player: 0, hunter: 0 };

    function disableHost(){ shortcuts?.disableKey?.('r'); shortcuts?.disableKey?.('p'); }
    function enableHost(){ shortcuts?.enableKey?.('r'); shortcuts?.enableKey?.('p'); }

    function updateLabels(){
      timerLabel.textContent = `残り ${Math.max(0, remaining).toFixed(1)}s`;
      expLabel.textContent = `蓄積EXP ${Math.floor(pendingExp)}`;
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
      if (pressed.has('arrowup') || pressed.has('w')) return { dx: 0, dy: -1 };
      if (pressed.has('arrowdown') || pressed.has('s')) return { dx: 0, dy: 1 };
      if (pressed.has('arrowleft') || pressed.has('a')) return { dx: -1, dy: 0 };
      if (pressed.has('arrowright') || pressed.has('d')) return { dx: 1, dy: 0 };
      return null;
    }

    function attemptMove(entity, dir){
      if (!dir || !stage) return false;
      const nx = entity.x + dir.dx;
      const ny = entity.y + dir.dy;
      if (nx < 0 || ny < 0 || nx >= stage.width || ny >= stage.height) return false;
      if (stage.tiles[ny]?.[nx] !== 0) return false;
      entity.x = nx; entity.y = ny; return true;
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

    function checkCaught(){
      return hunters.some(h => h.x === player.x && h.y === player.y);
    }

    function spawnHunter(pos){
      if (!pos) return;
      hunters.push({ x: pos.x, y: pos.y });
      hunterTimers.push(0);
      statusLabel.textContent = 'ハンターが追加投入された！';
    }

    function removeNearestHunter(){
      if (!hunters.length) return;
      let bestIdx = 0;
      let bestDist = Infinity;
      for (let i = 0; i < hunters.length; i++){
        const h = hunters[i];
        const d = Math.abs(h.x - player.x) + Math.abs(h.y - player.y);
        if (d < bestDist){ bestDist = d; bestIdx = i; }
      }
      hunters.splice(bestIdx, 1);
      hunterTimers.splice(bestIdx, 1);
      statusLabel.textContent = 'ミッション成功！ハンター1体が撤退';
    }

    function processMissions(dt){
      for (const mission of missions){
        if (mission.state === 'pending' && elapsed >= mission.triggerAt){
          mission.state = 'active';
          mission.timeLeft = mission.timeLimit;
          mission.target = stage.pickFloorPosition({ minDistance: 6, exclude: [player] }) || { x: Math.floor(stage.width / 2), y: Math.floor(stage.height / 2) };
          statusLabel.textContent = `ミッション発動：${mission.label}`;
        }
        if (mission.state === 'active'){
          mission.timeLeft -= dt;
          if (player.x === mission.target.x && player.y === mission.target.y){
            mission.state = 'success';
            missionPanel.textContent = `${mission.label}：成功！`;
            mission.onSuccess();
            continue;
          }
          if (mission.timeLeft <= 0){
            mission.state = 'failed';
            missionPanel.textContent = `${mission.label}：失敗…`;
            mission.onFail();
            continue;
          }
        }
      }
      const active = missions.find(m => m.state === 'active');
      if (active){
        missionPanel.textContent = `${active.label}：残り${Math.ceil(active.timeLeft)}s (地点: ${active.target.x},${active.target.y})`;
      } else if (!missions.some(m => m.state === 'pending')){
        const successCount = missions.filter(m => m.state === 'success').length;
        missionPanel.textContent = `ミッション完了：成功${successCount}/${missions.length}`;
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

    function draw(){
      if (!stage || !background) return;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(background.canvas, 0, 0);
      const tile = stage.tileSize;

      // Draw mission targets
      for (const mission of missions){
        if (mission.state === 'active' && mission.target){
          ctx.fillStyle = 'rgba(56,189,248,0.5)';
          ctx.fillRect(mission.target.x * tile, mission.target.y * tile, tile, tile);
        }
      }

      // Draw hunter boxes
      ctx.strokeStyle = 'rgba(248,113,113,0.6)';
      ctx.lineWidth = 2;
      for (const box of hunterBoxes){
        const alpha = box.opened ? 0.2 : 0.6;
        ctx.strokeStyle = `rgba(248,113,113,${alpha})`;
        ctx.strokeRect(box.position.x * tile + 2, box.position.y * tile + 2, tile - 4, tile - 4);
      }

      // Player
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.arc(player.x * tile + tile / 2, player.y * tile + tile / 2, tile * 0.35, 0, Math.PI * 2);
      ctx.fill();

      // Hunters
      ctx.fillStyle = '#ef4444';
      for (const h of hunters){
        ctx.beginPath();
        ctx.arc(h.x * tile + tile / 2, h.y * tile + tile / 2, tile * 0.32, 0, Math.PI * 2);
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
      surrenderBtn.disabled = true;
      if (result === 'escape'){
        const total = pendingExp + ESCAPE_BONUS;
        awardXp(total, { reason: 'escape', gameId: 'tosochu' });
        statusLabel.textContent = `逃走成功！+${total} EXP (内訳 ${pendingExp}+${ESCAPE_BONUS})`;
      } else if (result === 'surrender'){
        awardXp(pendingExp, { reason: 'surrender', gameId: 'tosochu' });
        statusLabel.textContent = `自首。蓄積${pendingExp}EXPを獲得`;
      } else if (result === 'caught'){
        statusLabel.textContent = '捕まってしまった…獲得EXPなし';
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
      moveCooldown.player = Math.max(0, moveCooldown.player - dt);
      moveCooldown.hunter = Math.max(0, moveCooldown.hunter - dt);

      if (moveCooldown.player <= 0){
        const dir = pickDirection();
        if (dir && attemptMove(player, dir)) moveCooldown.player = PLAYER_STEP_INTERVAL;
      }

      if (moveCooldown.hunter <= 0){
        for (let i = 0; i < hunters.length; i++){
          const hunter = hunters[i];
          const next = bfsNext({ x: hunter.x, y: hunter.y }, player);
          if (next) { hunter.x = next.x; hunter.y = next.y; }
        }
        moveCooldown.hunter = HUNTER_STEP_INTERVAL;
      }

      processMissions(dt);
      processBoxes();
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
      moveCooldown.player = 0;
      moveCooldown.hunter = 0;
      hunters.length = 0;
      hunterTimers.length = 0;
      missions.length = 0;
      hunterBoxes.length = 0;
      finished = false;
      surrenderBtn.disabled = false;
      statusLabel.textContent = '逃走中スタンバイ';
      missionPanel.textContent = 'ミッション: まだ発動していません';
      runInitialized = false;
    }

    function setupRun(){
      if (!stage) return;
      reset();
      const spawns = stage.pickFloorPositions(4, { minDistance: 6 });
      const [playerSpawn, ...hunterSpawns] = spawns;
      player.x = playerSpawn?.x ?? 2;
      player.y = playerSpawn?.y ?? 2;
      const hunterCount = difficulty === 'HARD' ? 4 : difficulty === 'EASY' ? 2 : 3;
      for (let i = 0; i < hunterCount; i++){
        const spawn = hunterSpawns[i] || stage.pickFloorPosition({ minDistance: 6, exclude: [player] }) || { x: stage.width - 2, y: stage.height - 2 };
        hunters.push({ x: spawn.x, y: spawn.y });
        hunterTimers.push(0);
      }

      missions.push(
        {
          id: 'beacon', label: 'ビーコンに接触せよ', triggerAt: 30, timeLimit: 35, state: 'pending',
          onSuccess(){ removeNearestHunter(); },
          onFail(){ spawnHunter(stage.pickFloorPosition({ minDistance: 4, exclude: [player] })); }
        },
        {
          id: 'box', label: 'ハンターボックスを解除', triggerAt: 80, timeLimit: 30, state: 'pending',
          onSuccess(){ statusLabel.textContent = '解除成功！ハンターボックスの発動が遅延'; hunterBoxes.forEach(b => b.triggerAt += 20); },
          onFail(){ statusLabel.textContent = '解除失敗…ハンターが追加投入'; spawnHunter(stage.pickFloorPosition({ minDistance: 5 })); }
        }
      );

      hunterBoxes.push(
        { position: stage.pickFloorPosition({ minDistance: 5 }) || { x: 3, y: 3 }, triggerAt: 90, opened: false },
        { position: stage.pickFloorPosition({ minDistance: 5, exclude: [player] }) || { x: stage.width - 4, y: stage.height - 4 }, triggerAt: 130, opened: false }
      );

      draw();
      updateLabels();
      runInitialized = true;
    }

    function initStage(){
      if (!dungeonApi?.generateStage){
        statusLabel.textContent = 'ダンジョンAPI利用不可';
        return;
      }
      dungeonApi.generateStage({ type: 'mixed', tilesX: 48, tilesY: 36, tileSize: 17 }).then((generated) => {
        stage = generated;
        background = dungeonApi.renderStage(stage, { tileSize: stage.tileSize, showGrid: false });
        canvas.width = background.canvas.width;
        canvas.height = background.canvas.height;
        stageReady = true;
        setupRun();
        if (pendingStart) startLoop();
      }).catch(() => {
        statusLabel.textContent = 'ステージ生成に失敗しました';
      });
    }

    function startLoop(){
      if (!stageReady || running || finished) return;
      running = true;
      disableHost();
      lastTs = 0;
      updateLabels();
      raf = requestAnimationFrame(loop);
      statusLabel.textContent = '逃走開始！';
    }

    function stopLoop(){
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
      enableHost();
      statusLabel.textContent = '一時停止中';
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
      document.removeEventListener('keydown', keyDown);
      document.removeEventListener('keyup', keyUp);
      surrenderBtn.removeEventListener('click', onSurrender);
      try { wrapper.remove(); } catch {}
    }

    function getScore(){ return pendingExp + (finished && remaining <= 0 ? ESCAPE_BONUS : 0); }

    function onSurrender(){
      if (!stageReady || finished) return;
      endGame('surrender');
    }

    surrenderBtn.addEventListener('click', onSurrender);
    document.addEventListener('keydown', keyDown, { passive: false });
    document.addEventListener('keyup', keyUp, { passive: true });

    reset();
    initStage();

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({ id: 'tosochu', name: '逃走中', description: '逃げ切れば+10000EXP、1秒ごとに10EXP蓄積', create });
})();

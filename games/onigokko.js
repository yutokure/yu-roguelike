(function(){
  /** MiniExp: Dungeon Tag (Onigokko)
   *  - Generates a mixed-type dungeon stage via MiniExp dungeon API
   *  - Player moves tile-by-tile with arrow keys, avoiding chasers
   *  - Survive the timer for bonus EXP; survival also grants drip EXP
   */
  function create(root, awardXp, opts){
    const shortcuts = opts?.shortcuts;
    const dungeonApi = opts?.dungeon;
    const difficulty = opts?.difficulty || 'NORMAL';

    const wrapper = document.createElement('div');
    wrapper.className = 'mini-onigokko';
    wrapper.style.display = 'grid';
    wrapper.style.gridTemplateColumns = 'minmax(280px, 1fr)';
    wrapper.style.gap = '8px';

    const infoPanel = document.createElement('div');
    infoPanel.style.background = 'rgba(15,23,42,0.9)';
    infoPanel.style.color = '#e2e8f0';
    infoPanel.style.fontFamily = 'system-ui, sans-serif';
    infoPanel.style.padding = '8px 12px';
    infoPanel.style.borderRadius = '8px';
    infoPanel.style.display = 'flex';
    infoPanel.style.justifyContent = 'space-between';
    infoPanel.style.alignItems = 'center';
    const timerLabel = document.createElement('span');
    const statusLabel = document.createElement('span');
    statusLabel.textContent = 'ステージ読み込み中…';
    infoPanel.appendChild(timerLabel);
    infoPanel.appendChild(statusLabel);

    const canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    canvas.style.borderRadius = '8px';
    canvas.style.boxShadow = '0 10px 20px rgba(15,23,42,0.35)';

    wrapper.appendChild(infoPanel);
    wrapper.appendChild(canvas);
    root.appendChild(wrapper);

    let background = null;
    let stage = null;
    let stageReady = false;
    let running = false;
    let pendingStart = false;
    let raf = 0;
    let lastTs = 0;
    let elapsed = 0;
    let survivalAccumulator = 0;
    let victoryGranted = false;

    const baseDuration = difficulty === 'HARD' ? 75 : difficulty === 'EASY' ? 55 : 65;
    let remaining = baseDuration;

    const player = { x: 0, y: 0 };
    const chasers = [];
    const pressedKeys = new Set();
    const moveCooldown = { player: 0, chaser: 0 };
    const PLAYER_STEP_INTERVAL = 0.18;
    const CHASER_STEP_INTERVAL = difficulty === 'HARD' ? 0.25 : 0.33;
    const SURVIVAL_EXP_PER_SECOND = 3;
    const SURVIVAL_BONUS = difficulty === 'HARD' ? 180 : difficulty === 'EASY' ? 110 : 140;

    function setStatus(text){ statusLabel.textContent = text; }
    function updateTimer(){ timerLabel.textContent = `残り ${Math.max(0, remaining).toFixed(1)}s`; }

    function disableHostShortcuts(){ shortcuts?.disableKey?.('r'); shortcuts?.disableKey?.('p'); }
    function enableHostShortcuts(){ shortcuts?.enableKey?.('r'); shortcuts?.enableKey?.('p'); }

    function keyHandlerDown(e){
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      if ([ 'arrowup','arrowdown','arrowleft','arrowright','w','a','s','d' ].includes(key)){
        e.preventDefault();
        pressedKeys.add(key);
      }
    }

    function keyHandlerUp(e){
      const key = e.key.toLowerCase();
      if ([ 'arrowup','arrowdown','arrowleft','arrowright','w','a','s','d' ].includes(key)){
        pressedKeys.delete(key);
      }
    }

    function pickDirection(){
      if (pressedKeys.has('arrowup') || pressedKeys.has('w')) return { dx: 0, dy: -1 };
      if (pressedKeys.has('arrowdown') || pressedKeys.has('s')) return { dx: 0, dy: 1 };
      if (pressedKeys.has('arrowleft') || pressedKeys.has('a')) return { dx: -1, dy: 0 };
      if (pressedKeys.has('arrowright') || pressedKeys.has('d')) return { dx: 1, dy: 0 };
      return null;
    }

    function bfsNextStep(start, goal){
      if (!stage) return null;
      if (start.x === goal.x && start.y === goal.y) return { x: goal.x, y: goal.y };
      const w = stage.width;
      const h = stage.height;
      const queue = [];
      const visited = new Uint8Array(w * h);
      const parent = new Map();
      const idx = (x,y) => y * w + x;
      queue.push(start);
      visited[idx(start.x, start.y)] = 1;
      const dirs = [ [1,0], [-1,0], [0,1], [0,-1] ];
      while (queue.length){
        const current = queue.shift();
        if (current.x === goal.x && current.y === goal.y) break;
        for (const [dx, dy] of dirs){
          const nx = current.x + dx;
          const ny = current.y + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          if (stage.tiles[ny]?.[nx] !== 0) continue;
          const id = idx(nx, ny);
          if (visited[id]) continue;
          visited[id] = 1;
          parent.set(id, current);
          queue.push({ x: nx, y: ny });
        }
      }
      const goalIdx = idx(goal.x, goal.y);
      if (!visited[goalIdx]) return null;
      let current = { x: goal.x, y: goal.y };
      while (true){
        const prev = parent.get(idx(current.x, current.y));
        if (!prev) break;
        if (prev.x === start.x && prev.y === start.y) return current;
        current = prev;
      }
      return current;
    }

    function attemptMove(entity, dir){
      if (!stage || !dir) return false;
      const nx = entity.x + dir.dx;
      const ny = entity.y + dir.dy;
      if (nx < 0 || ny < 0 || nx >= stage.width || ny >= stage.height) return false;
      if (stage.tiles[ny]?.[nx] !== 0) return false;
      entity.x = nx; entity.y = ny; return true;
    }

    function checkCaught(){
      return chasers.some(c => c.x === player.x && c.y === player.y);
    }

    function endGame(result){
      if (!running) return;
      running = false;
      pendingStart = false;
      cancelAnimationFrame(raf);
      enableHostShortcuts();
      if (result === 'caught'){
        setStatus('捕まってしまった！獲得EXPなし');
      } else if (result === 'escaped'){
        if (!victoryGranted){
          awardXp(SURVIVAL_BONUS, { reason: 'clear', gameId: 'onigokko' });
          victoryGranted = true;
        }
        setStatus('見事逃げ切った！');
      }
    }

    function draw(){
      if (!stage || !background) return;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(background.canvas, 0, 0);
      const tile = stage.tileSize;
      // draw safe area shading
      ctx.fillStyle = 'rgba(15,23,42,0.15)';
      ctx.fillRect(0, 0, canvas.width, tile * 2);
      // player
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(player.x * tile + tile / 2, player.y * tile + tile / 2, tile * 0.35, 0, Math.PI * 2);
      ctx.fill();
      // chasers
      ctx.fillStyle = '#ef4444';
      for (const c of chasers){
        ctx.beginPath();
        ctx.arc(c.x * tile + tile / 2, c.y * tile + tile / 2, tile * 0.33, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function step(dt){
      if (!running || !stageReady) return;
      remaining = Math.max(0, remaining - dt);
      elapsed += dt;
      survivalAccumulator += dt;
      if (survivalAccumulator >= 1){
        const whole = Math.floor(survivalAccumulator);
        survivalAccumulator -= whole;
        const gain = whole * SURVIVAL_EXP_PER_SECOND;
        if (gain > 0){
          awardXp(gain, { reason: 'survive', gameId: 'onigokko' });
        }
      }
      moveCooldown.player = Math.max(0, moveCooldown.player - dt);
      moveCooldown.chaser = Math.max(0, moveCooldown.chaser - dt);

      if (moveCooldown.player <= 0){
        const dir = pickDirection();
        if (dir && attemptMove(player, dir)){
          moveCooldown.player = PLAYER_STEP_INTERVAL;
        }
      }

      if (moveCooldown.chaser <= 0){
        for (const c of chasers){
          const next = bfsNextStep({ x: c.x, y: c.y }, player);
          if (next) { c.x = next.x; c.y = next.y; }
        }
        moveCooldown.chaser = CHASER_STEP_INTERVAL;
      }

      updateTimer();
      draw();

      if (checkCaught()){
        setStatus('捕まった！');
        endGame('caught');
        return;
      }
      if (remaining <= 0){
        setStatus('逃げ切り成功！');
        endGame('escaped');
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

    function startLoop(){
      if (!stageReady || running) return;
      running = true;
      victoryGranted = false;
      survivalAccumulator = 0;
      remaining = baseDuration;
      elapsed = 0;
      lastTs = 0;
      updateTimer();
      setStatus('鬼ごっこ開始！矢印キー/WASDで移動');
      disableHostShortcuts();
      raf = requestAnimationFrame(loop);
    }

    function stopLoop(){
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
      enableHostShortcuts();
    }

    function resetPositions(){
      if (!stage) return;
      const spawns = stage.pickFloorPositions(1 + (difficulty === 'HARD' ? 3 : 2), { minDistance: 8 });
      const [playerSpawn, ...hunterSpawns] = spawns.length ? spawns : [{ x: 2, y: 2 }];
      player.x = playerSpawn?.x ?? 2;
      player.y = playerSpawn?.y ?? 2;
      chasers.length = 0;
      const hunterCount = difficulty === 'HARD' ? 3 : (difficulty === 'EASY' ? 2 : 3);
      for (let i = 0; i < hunterCount; i++){
        const spawn = hunterSpawns[i] || stage.pickFloorPosition({ minDistance: 4, exclude: [player] }) || { x: stage.width - 2, y: stage.height - 2 };
        chasers.push({ x: spawn.x, y: spawn.y });
      }
      draw();
    }

    function prepareStage(){
      if (!dungeonApi || typeof dungeonApi.generateStage !== 'function'){
        setStatus('ダンジョンAPIが利用できません');
        stageReady = false;
        return;
      }
      dungeonApi.generateStage({ type: 'mixed', tilesX: 40, tilesY: 30, tileSize: 18 }).then((generated) => {
        stage = generated;
        background = dungeonApi.renderStage(stage, { tileSize: stage.tileSize, showGrid: false });
        canvas.width = background.canvas.width;
        canvas.height = background.canvas.height;
        stageReady = true;
        resetPositions();
        updateTimer();
        setStatus('準備完了！開始で鬼ごっこスタート');
        if (pendingStart) startLoop();
      }).catch(() => {
        setStatus('ステージ生成に失敗しました');
      });
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
      document.removeEventListener('keydown', keyHandlerDown);
      document.removeEventListener('keyup', keyHandlerUp);
      try { wrapper.remove(); } catch {}
    }

    function getScore(){
      return Math.floor(elapsed || 0);
    }

    document.addEventListener('keydown', keyHandlerDown, { passive: false });
    document.addEventListener('keyup', keyHandlerUp, { passive: false });
    prepareStage();

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({ id: 'onigokko', name: '鬼ごっこ', description: '混合型ダンジョンで鬼から逃げ切ろう！', create });
})();

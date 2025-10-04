(function(){
  /** MiniExp: Dungeon Tag (Onigokko)
   *  - Generates a mixed-type dungeon stage via MiniExp dungeon API
   *  - Smooth movement with pixel-perfect collision against dungeon walls
   *  - Survive the timer to earn drip EXP and escape bonus
   */
  function create(root, awardXp, opts){
    const shortcuts = opts?.shortcuts;
    const dungeonApi = opts?.dungeon;
    const difficulty = opts?.difficulty || 'NORMAL';

    const wrapper = document.createElement('div');
    wrapper.className = 'mini-onigokko';
    wrapper.style.display = 'grid';
    wrapper.style.gridTemplateColumns = 'minmax(300px, 1fr)';
    wrapper.style.gap = '8px';
    wrapper.style.fontFamily = 'system-ui, sans-serif';

    const infoPanel = document.createElement('div');
    infoPanel.style.background = 'rgba(15,23,42,0.9)';
    infoPanel.style.color = '#e2e8f0';
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
    canvas.style.boxShadow = '0 12px 24px rgba(15,23,42,0.36)';

    wrapper.appendChild(infoPanel);
    wrapper.appendChild(canvas);
    root.appendChild(wrapper);

    const pressedKeys = new Set();
    const SURVIVAL_EXP_PER_SECOND = 3;
    const SURVIVAL_BONUS = difficulty === 'HARD' ? 180 : difficulty === 'EASY' ? 110 : 140;
    const baseDuration = difficulty === 'HARD' ? 75 : difficulty === 'EASY' ? 55 : 65;

    const player = { x: 0, y: 0, radius: 10, speed: 80 };
    const chasers = [];

    let stage = null;
    let background = null;
    let running = false;
    let pendingStart = false;
    let raf = 0;
    let lastTs = 0;
    let elapsed = 0;
    let remaining = baseDuration;
    let survivalAccumulator = 0;
    let victoryGranted = false;
    let stageReady = false;
    let tileSize = 18;
    let hunterRadius = 9;
    let hunterSpeed = 70;
    let hunterPathInterval = 0.35;

    function setStatus(text){ statusLabel.textContent = text; }
    function updateTimer(){ timerLabel.textContent = `残り ${Math.max(0, remaining).toFixed(1)}s`; }

    function disableHostShortcuts(){ shortcuts?.disableKey?.('r'); shortcuts?.disableKey?.('p'); }
    function enableHostShortcuts(){ shortcuts?.enableKey?.('r'); shortcuts?.enableKey?.('p'); }

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

    function bfsNextStep(startTile, goalTile){
      if (!stage) return null;
      if (startTile.x === goalTile.x && startTile.y === goalTile.y) return { x: goalTile.x, y: goalTile.y };
      const w = stage.width;
      const h = stage.height;
      const queue = [];
      const visited = new Uint8Array(w * h);
      const parent = new Map();
      const idx = (x, y) => y * w + x;
      queue.push(startTile);
      visited[idx(startTile.x, startTile.y)] = 1;
      const dirs = [ [1,0], [-1,0], [0,1], [0,-1] ];
      while (queue.length){
        const node = queue.shift();
        if (node.x === goalTile.x && node.y === goalTile.y) break;
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
      const goalIdx = idx(goalTile.x, goalTile.y);
      if (!visited[goalIdx]) return null;
      let current = { x: goalTile.x, y: goalTile.y };
      while (true){
        const prev = parent.get(idx(current.x, current.y));
        if (!prev) break;
        if (prev.x === startTile.x && prev.y === startTile.y) return current;
        current = prev;
      }
      return current;
    }

    function updateChasers(dt){
      if (!stage) return;
      for (const chaser of chasers){
        chaser.pathTimer -= dt;
        if (chaser.pathTimer <= 0){
          chaser.pathTimer = hunterPathInterval;
          const startTile = stage.toTile(chaser.x, chaser.y);
          const goalTile = stage.toTile(player.x, player.y);
          const nextTile = bfsNextStep(startTile, goalTile);
          if (nextTile){
            const center = stage.tileCenter(nextTile.x, nextTile.y);
            chaser.seekTarget = center;
          } else {
            chaser.seekTarget = null;
          }
        }
        const target = chaser.seekTarget || { x: player.x, y: player.y };
        const dx = target.x - chaser.x;
        const dy = target.y - chaser.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 1e-3){
          const step = Math.min(dist, hunterSpeed * dt);
          const vx = dx / dist * step;
          const vy = dy / dist * step;
          moveCircle(chaser, vx, vy, chaser.radius);
          if (chaser.seekTarget && Math.hypot(chaser.seekTarget.x - chaser.x, chaser.seekTarget.y - chaser.y) <= chaser.radius * 0.6){
            chaser.seekTarget = null;
          }
        }
      }
    }

    function checkCaught(){
      for (const chaser of chasers){
        const dist = Math.hypot(player.x - chaser.x, player.y - chaser.y);
        if (dist <= player.radius + chaser.radius) return true;
      }
      return false;
    }

    function draw(){
      if (!stage || !background) return;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(background.canvas, 0, 0);
      // soft safe-zone tint near start
      ctx.fillStyle = 'rgba(15,23,42,0.14)';
      ctx.fillRect(0, 0, canvas.width, tileSize * 2);
      // player
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
      ctx.fill();
      // chasers
      ctx.fillStyle = '#ef4444';
      for (const chaser of chasers){
        ctx.beginPath();
        ctx.arc(chaser.x, chaser.y, chaser.radius, 0, Math.PI * 2);
        ctx.fill();
      }
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

    function step(dt){
      if (!running || !stageReady) return;
      remaining = Math.max(0, remaining - dt);
      elapsed += dt;
      survivalAccumulator += dt;
      if (survivalAccumulator >= 1){
        const wholeSeconds = Math.floor(survivalAccumulator);
        survivalAccumulator -= wholeSeconds;
        const gain = wholeSeconds * SURVIVAL_EXP_PER_SECOND;
        if (gain > 0) awardXp(gain, { reason: 'survive', gameId: 'onigokko' });
      }

      const input = readInputVector();
      if (input.dx !== 0 || input.dy !== 0){
        const speed = player.speed * dt;
        moveCircle(player, input.dx * speed, input.dy * speed, player.radius);
      }

      updateChasers(dt);
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

    function configureStageMetrics(){
      tileSize = stage?.tileSize || tileSize;
      player.radius = tileSize * 0.34;
      const speedTileMultiplier = difficulty === 'HARD' ? 4.6 : difficulty === 'EASY' ? 3.6 : 4.0;
      player.speed = tileSize * speedTileMultiplier;
      hunterRadius = tileSize * 0.30;
      const hunterSpeedMultiplier = difficulty === 'HARD' ? 3.7 : difficulty === 'EASY' ? 2.9 : 3.3;
      hunterSpeed = tileSize * hunterSpeedMultiplier;
      hunterPathInterval = difficulty === 'HARD' ? 0.28 : difficulty === 'EASY' ? 0.42 : 0.34;
    }

    function resetEntities(){
      if (!stage) return;
      const spawnCount = 1 + (difficulty === 'HARD' ? 3 : 2);
      const spawns = stage.pickFloorPositionsPixel(spawnCount, { minDistance: 8 }) || [];
      const playerSpawn = spawns[0] || stage.pickFloorPositionPixel({ exclude: [] }) || { x: tileSize * 2, y: tileSize * 2 };
      player.x = playerSpawn.x;
      player.y = playerSpawn.y;
      const usedTiles = playerSpawn.tile ? [playerSpawn.tile] : [];
      chasers.length = 0;
      const hunterCount = difficulty === 'HARD' ? 3 : (difficulty === 'EASY' ? 2 : 3);
      for (let i = 0; i < hunterCount; i++){
        let spawn = spawns[i + 1];
        if (!spawn){
          spawn = stage.pickFloorPositionPixel({ minDistance: 5, exclude: usedTiles }) || stage.pickFloorPositionPixel({}) || { x: tileSize * (stage.width - 2), y: tileSize * (stage.height - 2) };
        }
        if (spawn?.tile) usedTiles.push(spawn.tile);
        chasers.push({
          x: spawn?.x ?? tileSize * (stage.width - 2),
          y: spawn?.y ?? tileSize * (stage.height - 2),
          radius: hunterRadius,
          pathTimer: Math.random() * hunterPathInterval,
          seekTarget: null
        });
      }
      draw();
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
      setStatus('一時停止中');
    }

    function prepareStage(){
      if (!dungeonApi || typeof dungeonApi.generateStage !== 'function'){
        setStatus('ダンジョンAPIが利用できません');
        stageReady = false;
        return;
      }
      dungeonApi.generateStage({ type: 'mixed', tilesX: 40, tilesY: 30, tileSize: 18 }).then((generated) => {
        stage = generated;
        configureStageMetrics();
        background = dungeonApi.renderStage(stage, { tileSize: stage.tileSize, showGrid: false });
        canvas.width = background.canvas.width;
        canvas.height = background.canvas.height;
        stageReady = true;
        resetEntities();
        updateTimer();
        setStatus('準備完了！開始で鬼ごっこスタート');
        if (pendingStart) startLoop();
      }).catch(() => {
        setStatus('ステージ生成に失敗しました');
      });
    }

    function start(){
      pendingStart = true;
      if (stageReady){
        resetEntities();
        startLoop();
      }
    }

    function stop(){
      pendingStart = false;
      stopLoop();
    }

    function destroy(){
      stopLoop();
      document.removeEventListener('keydown', keyDownHandler);
      document.removeEventListener('keyup', keyUpHandler);
      try { wrapper.remove(); } catch {}
    }

    function getScore(){
      return Math.floor(elapsed || 0);
    }

    function keyDownHandler(e){
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      if ([ 'arrowup','arrowdown','arrowleft','arrowright','w','a','s','d' ].includes(key)){
        e.preventDefault();
        pressedKeys.add(key);
      }
    }

    function keyUpHandler(e){
      const key = e.key.toLowerCase();
      if ([ 'arrowup','arrowdown','arrowleft','arrowright','w','a','s','d' ].includes(key)){
        pressedKeys.delete(key);
      }
    }

    document.addEventListener('keydown', keyDownHandler, { passive: false });
    document.addEventListener('keyup', keyUpHandler, { passive: true });

    prepareStage();

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({ id: 'onigokko', name: '鬼ごっこ', description: '混合型ダンジョンで鬼から逃げ切ろう！', create });
})();

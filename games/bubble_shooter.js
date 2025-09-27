(function(){
  function create(root, awardXp, opts){
    const shortcuts = opts?.shortcuts;
    const diff = (opts && opts.difficulty) || 'NORMAL';
    const cfg = {
      EASY:   { colors: 5, startRows: 5, shotsCycle: 8 },
      NORMAL: { colors: 6, startRows: 5, shotsCycle: 6 },
      HARD:   { colors: 7, startRows: 6, shotsCycle: 5 }
    }[diff] || { colors: 6, startRows: 5, shotsCycle: 6 };

    const palette = ['#f97316','#ef4444','#22c55e','#0ea5e9','#a855f7','#facc15','#14b8a6','#fb7185'];
    const COLS = 12;
    const R = 18;
    const DX = R * 2;
    const DY = Math.round(R * Math.sqrt(3));
    const PAD = 30;
    const MAX_ROWS = 18;
    const HUD_H = 40;
    const SHOOTER_SPACE = 120;
    const WIDTH = PAD * 2 + DX * COLS + R;
    const HEIGHT = PAD * 2 + DY * MAX_ROWS + SHOOTER_SPACE + HUD_H;
    const TOP_BOUND = PAD + HUD_H;
    const LEFT_BOUND = PAD + R;
    const RIGHT_BOUND = WIDTH - PAD - R;
    const SHOOTER_X = WIDTH / 2;
    const SHOOTER_Y = HEIGHT - PAD - SHOOTER_SPACE / 2;
    const FAIL_LINE = SHOOTER_Y - R * 2.2;
    const SPEED = 420;
    const GRAVITY = 820;

    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    canvas.style.background = '#0f172a';
    canvas.style.borderRadius = '12px';
    root.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let grid = [];
    let floating = [];
    let popFx = [];
    let queue = [];
    let loadedColor = 0;
    let current = null; // {x,y,vx,vy,color}
    let shotsLeft = cfg.shotsCycle;
    let totalCleared = 0;
    let totalDropped = 0;
    let running = true;
    let gameOver = false;
    let loopActive = true;
    let animationId = null;
    let lastTime = null;
    const pointer = { x: SHOOTER_X, y: SHOOTER_Y - 120 };

    function isCellValid(row, col){
      return col >= 0 && col < COLS;
    }

    function ensureRow(row){
      while (grid.length <= row) {
        grid.push(Array.from({ length: COLS }, () => null));
      }
    }

    function cellCenter(row, col){
      const offset = (row % 2 === 1) ? R : 0;
      const x = PAD + R + col * DX + offset;
      const y = TOP_BOUND + R + row * DY;
      return { x, y };
    }

    function neighbors(row, col){
      const list = [];
      const parity = row % 2;
      const deltas = parity === 0
        ? [[0,-1],[0,1],[-1,-1],[-1,0],[1,-1],[1,0]]
        : [[0,-1],[0,1],[-1,0],[-1,1],[1,0],[1,1]];
      for (const [dr, dc] of deltas) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr < 0) continue;
        ensureRow(nr);
        if (!isCellValid(nr, nc)) continue;
        list.push([nr, nc]);
      }
      return list;
    }

    function randomColor(){
      return Math.floor(Math.random() * cfg.colors);
    }

    function refillQueue(){
      while (queue.length < 2) queue.push(randomColor());
    }

    function disableHostRestart(){
      shortcuts?.disableKey('r');
    }

    function enableHostRestart(){
      shortcuts?.enableKey('r');
    }

    function reset(){
      grid = [];
      floating = [];
      popFx = [];
      queue = [];
      loadedColor = randomColor();
      current = null;
      shotsLeft = cfg.shotsCycle;
      totalCleared = 0;
      totalDropped = 0;
      gameOver = false;
      running = true;
      lastTime = null;
      disableHostRestart();
      for (let r = 0; r < cfg.startRows; r++) {
        ensureRow(r);
        for (let c = 0; c < COLS; c++) {
          grid[r][c] = { color: randomColor() };
        }
      }
      for (let r = cfg.startRows; r < MAX_ROWS; r++) ensureRow(r);
      refillQueue();
    }

    reset();

    function lineAngle(){
      let angle = Math.atan2(pointer.y - SHOOTER_Y, pointer.x - SHOOTER_X);
      if (angle > -0.15) angle = -0.15;
      if (angle < (-Math.PI + 0.15)) angle = -Math.PI + 0.15;
      return angle;
    }

    function shoot(){
      if (!running || gameOver) return;
      if (current) return;
      const angle = lineAngle();
      current = {
        x: SHOOTER_X,
        y: SHOOTER_Y,
        vx: Math.cos(angle) * SPEED,
        vy: Math.sin(angle) * SPEED,
        color: loadedColor
      };
      loadedColor = queue.shift();
      refillQueue();
    }

    function attachAt(row, col, color){
      ensureRow(row);
      if (grid[row][col] && grid[row][col].color !== undefined) {
        // choose nearest empty neighbor
        const neigh = neighbors(row, col);
        let best = null;
        let bestDist = Infinity;
        for (const [nr, nc] of neigh) {
          if (grid[nr][nc]) continue;
          const { x, y } = cellCenter(nr, nc);
          const d = (x - current.x) ** 2 + (y - current.y) ** 2;
          if (d < bestDist) { bestDist = d; best = [nr, nc]; }
        }
        if (best) {
          row = best[0]; col = best[1];
        } else {
          let fallback = null;
          let fallbackDist = Infinity;
          for (let r = 0; r < grid.length; r++) {
            for (let c = 0; c < COLS; c++) {
              if (grid[r][c]) continue;
              const { x, y } = cellCenter(r, c);
              const d = (x - current.x) ** 2 + (y - current.y) ** 2;
              if (d < fallbackDist) {
                fallbackDist = d;
                fallback = [r, c];
              }
            }
          }
          if (fallback) {
            row = fallback[0];
            col = fallback[1];
          } else {
            current = null;
            finishGame();
            return;
          }
        }
      }
      grid[row][col] = { color };
      const { x, y } = cellCenter(row, col);
      popFx.push({ x, y, life: 0, type: 'place', color });
      current = null;
      shotsLeft--;
      resolveAfterPlacement(row, col);
      if (shotsLeft <= 0) {
        pushNewRow();
        shotsLeft = cfg.shotsCycle;
        awardXp && awardXp(1, { type: 'survive' });
      }
      trimEmptyRows();
      checkGameOver();
    }

    function resolveAfterPlacement(row, col){
      const cluster = collectCluster(row, col);
      if (cluster.length >= 3) {
        const placed = grid[row][col];
        const color = placed ? placed.color : null;
        for (const [r, c] of cluster) {
          const { x, y } = cellCenter(r, c);
          const cell = grid[r][c];
          const cColor = cell ? cell.color : color;
          popFx.push({ x, y, life: 0, type: 'pop', color: cColor });
          grid[r][c] = null;
        }
        const baseExp = cluster.length;
        const bonus = Math.max(0, cluster.length - 3) * 0.5;
        const exp = baseExp + bonus;
        totalCleared += cluster.length;
        awardXp && awardXp(exp, { type: 'clear', amount: cluster.length, color });
        resolveFloating();
      }
    }

    function collectCluster(row, col){
      ensureRow(row);
      if (!isCellValid(row, col)) return [];
      const target = grid[row][col];
      if (!target) return [];
      const color = target.color;
      const stack = [[row, col]];
      const visited = new Set();
      visited.add(`${row},${col}`);
      const res = [];
      while (stack.length) {
        const [r, c] = stack.pop();
        const cell = grid[r][c];
        if (!cell || cell.color !== color) continue;
        res.push([r, c]);
        for (const [nr, nc] of neighbors(r, c)) {
          const key = `${nr},${nc}`;
          if (visited.has(key)) continue;
          visited.add(key);
          if (grid[nr][nc] && grid[nr][nc].color === color) stack.push([nr, nc]);
        }
      }
      return res;
    }

    function resolveFloating(){
      const visited = new Set();
      const stack = [];
      if (grid.length === 0) return;
      for (let c = 0; c < COLS; c++) {
        if (grid[0][c]) {
          stack.push([0, c]);
          visited.add(`0,${c}`);
        }
      }
      while (stack.length) {
        const [r, c] = stack.pop();
        for (const [nr, nc] of neighbors(r, c)) {
          const key = `${nr},${nc}`;
          if (visited.has(key)) continue;
          if (grid[nr][nc]) {
            visited.add(key);
            stack.push([nr, nc]);
          }
        }
      }
      let dropped = 0;
      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < COLS; c++) {
          const cell = grid[r][c];
          if (!cell) continue;
          const key = `${r},${c}`;
          if (visited.has(key)) continue;
          grid[r][c] = null;
          const center = cellCenter(r, c);
          floating.push({ x: center.x, y: center.y, color: cell.color, vy: -60, alpha: 1 });
          dropped++;
        }
      }
      if (dropped > 0) {
        totalDropped += dropped;
        const exp = dropped * 1.5;
        awardXp && awardXp(exp, { type: 'drop', amount: dropped });
      }
    }

    function trimEmptyRows(){
      for (let r = grid.length - 1; r >= cfg.startRows; r--) {
        let has = false;
        for (let c = 0; c < COLS; c++) {
          if (grid[r][c]) { has = true; break; }
        }
        if (!has) grid.pop(); else break;
      }
      while (grid.length < MAX_ROWS) ensureRow(grid.length);
    }

    function pushNewRow(){
      const arr = Array.from({ length: COLS }, () => ({ color: randomColor() }));
      grid.unshift(arr);
      if (grid.length > MAX_ROWS) {
        grid.pop();
      }
    }

    function checkGameOver(){
      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < COLS; c++) {
          if (!grid[r][c]) continue;
          const { y } = cellCenter(r, c);
          if (y + R >= FAIL_LINE) {
            current = null;
            finishGame();
            return;
          }
        }
      }
    }

    function finishGame(){
      if (!gameOver) {
        gameOver = true;
      }
      running = false;
      enableHostRestart();
    }

    function update(dt){
      if (current) {
        current.x += current.vx * dt;
        current.y += current.vy * dt;
        if (current.x <= LEFT_BOUND) {
          current.x = LEFT_BOUND;
          current.vx *= -1;
        }
        if (current.x >= RIGHT_BOUND) {
          current.x = RIGHT_BOUND;
          current.vx *= -1;
        }
        if (current.y <= TOP_BOUND + R) {
          let col = Math.round((current.x - (PAD + R)) / DX);
          if (col < 0) col = 0;
          if (col >= COLS) col = COLS - 1;
          attachAt(0, col, current.color);
        } else {
          let hitRow = null;
          let hitCol = null;
          let minDist = Infinity;
          for (let r = 0; r < grid.length; r++) {
          for (let c = 0; c < COLS; c++) {
              const cell = grid[r][c];
              if (!cell) continue;
              const center = cellCenter(r, c);
              const dx = center.x - current.x;
              const dy = center.y - current.y;
              const distSq = dx * dx + dy * dy;
              if (distSq <= (R * 2 - 2) ** 2) {
                const dist = Math.sqrt(distSq);
                if (dist < minDist) {
                  minDist = dist;
                  hitRow = r;
                  hitCol = c;
                }
              }
            }
          }
          if (hitRow !== null) {
            const neigh = neighbors(hitRow, hitCol).filter(([nr, nc]) => !grid[nr][nc]);
            if (neigh.length) {
              let best = neigh[0];
              let bestDist = Infinity;
              for (const [nr, nc] of neigh) {
                const { x, y } = cellCenter(nr, nc);
                const d = (x - current.x) ** 2 + (y - current.y) ** 2;
                if (d < bestDist) { bestDist = d; best = [nr, nc]; }
              }
              attachAt(best[0], best[1], current.color);
            } else {
              attachAt(hitRow, hitCol, current.color);
            }
          }
        }
      }

      for (let i = floating.length - 1; i >= 0; i--) {
        const f = floating[i];
        f.vy += GRAVITY * dt;
        f.y += f.vy * dt;
        f.alpha -= dt * 0.6;
        if (f.y > HEIGHT + R * 2 || f.alpha <= 0) {
          floating.splice(i, 1);
        }
      }

      for (let i = popFx.length - 1; i >= 0; i--) {
        const fx = popFx[i];
        fx.life += dt;
        if (fx.life > 0.35) popFx.splice(i, 1);
      }
    }

    function drawBubble(x, y, color, scale = 1, alpha = 1){
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.fillStyle = palette[color % palette.length] || '#e5e7eb';
      ctx.arc(x, y, R * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(15,23,42,0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = alpha * 0.4;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x - R * 0.4 * scale, y - R * 0.4 * scale, R * 0.35 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function draw(){
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '16px "Segoe UI", sans-serif';
      ctx.fillText(`Bubble Shooter | ${diff} | Cleared: ${totalCleared} | Dropped: ${totalDropped}`, PAD, PAD + 18);
      ctx.fillText(`Shots: ${shotsLeft}/${cfg.shotsCycle}`, PAD, PAD + 36);

      // draw fail line indicator
      ctx.strokeStyle = 'rgba(248,113,113,0.35)';
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(PAD, FAIL_LINE);
      ctx.lineTo(WIDTH - PAD, FAIL_LINE);
      ctx.stroke();
      ctx.setLineDash([]);

      // grid area background
      ctx.fillStyle = 'rgba(15, 23, 42, 0.5)';
      ctx.fillRect(PAD / 2, TOP_BOUND - R, WIDTH - PAD, FAIL_LINE - (TOP_BOUND - R) + R);

      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < COLS; c++) {
          if (!isCellValid(r, c)) continue;
          const cell = grid[r][c];
          if (!cell) continue;
          const { x, y } = cellCenter(r, c);
          drawBubble(x, y, cell.color);
        }
      }

      for (const fx of popFx) {
        const scale = fx.type === 'pop' ? Math.max(0, 1.3 - fx.life * 2.5) : 0.3 + fx.life * 1.2;
        const alpha = fx.type === 'pop' ? Math.max(0, 1 - fx.life * 2.2) : 0.4;
        const color = fx.color != null ? fx.color : loadedColor;
        drawBubble(fx.x, fx.y, color, scale, alpha);
      }

      for (const f of floating) drawBubble(f.x, f.y, f.color, 0.95, Math.max(0, f.alpha));

      // aim line
      const angle = lineAngle();
      const len = 420;
      const ax = SHOOTER_X + Math.cos(angle) * len;
      const ay = SHOOTER_Y + Math.sin(angle) * len;
      ctx.save();
      ctx.strokeStyle = 'rgba(148,163,184,0.5)';
      ctx.setLineDash([10, 6]);
      ctx.beginPath();
      ctx.moveTo(SHOOTER_X, SHOOTER_Y);
      ctx.lineTo(ax, ay);
      ctx.stroke();
      ctx.restore();

      // shooter base
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.arc(SHOOTER_X, SHOOTER_Y + 6, R * 1.6, Math.PI * 0.9, Math.PI * 0.1, false);
      ctx.fill();
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(SHOOTER_X, SHOOTER_Y, R * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // loaded bubble
      drawBubble(SHOOTER_X, SHOOTER_Y, loadedColor, 1.05);

      // next queue display
      const queueBaseX = WIDTH - PAD - 80;
      const queueBaseY = HEIGHT - PAD - 60;
      ctx.fillStyle = '#cbd5f5';
      ctx.font = '14px "Segoe UI", sans-serif';
      ctx.fillText('Next', queueBaseX - 10, queueBaseY - 36);
      for (let i = 0; i < queue.length; i++) {
        drawBubble(queueBaseX + i * 40, queueBaseY, queue[i], 0.75);
      }

      if (current) {
        drawBubble(current.x, current.y, current.color);
      }

      if (gameOver) {
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = '#f8fafc';
        ctx.font = '28px "Segoe UI", sans-serif';
        ctx.fillText('Game Over', WIDTH / 2 - 82, HEIGHT / 2 - 10);
        ctx.font = '18px "Segoe UI", sans-serif';
        ctx.fillText('Rキーでリスタート', WIDTH / 2 - 92, HEIGHT / 2 + 22);
        ctx.restore();
      }
    }

    function step(timestamp){
      if (!running && !gameOver) {
        if (loopActive) {
          animationId = requestAnimationFrame(step);
        } else {
          animationId = null;
        }
        draw();
        return;
      }
      if (lastTime == null) lastTime = timestamp;
      const dt = Math.min(0.033, (timestamp - lastTime) / 1000);
      lastTime = timestamp;
      if (running && !gameOver) update(dt);
      draw();
      if (loopActive) {
        animationId = requestAnimationFrame(step);
      } else {
        animationId = null;
      }
    }

    function onMouseMove(ev){
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      pointer.x = (ev.clientX - rect.left) * scaleX;
      pointer.y = (ev.clientY - rect.top) * scaleY;
    }

    function onTouch(ev){
      if (!ev.touches.length) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      pointer.x = (ev.touches[0].clientX - rect.left) * scaleX;
      pointer.y = (ev.touches[0].clientY - rect.top) * scaleY;
      ev.preventDefault();
      shoot();
    }

    function onKey(ev){
      if (ev.key === ' ' || ev.key === 'Spacebar') {
        ev.preventDefault();
        shoot();
      } else if (ev.key === 'r' || ev.key === 'R') {
        reset();
      }
    }

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousedown', shoot);
    canvas.addEventListener('touchstart', onTouch, { passive: false });
    window.addEventListener('keydown', onKey);

    animationId = requestAnimationFrame(step);

    function start(){
      loopActive = true;
      disableHostRestart();
      if (!animationId) {
        animationId = requestAnimationFrame(step);
      }
      running = true;
    }

    function stop(opts = {}){
      const { keepShortcutsDisabled = false } = opts;
      loopActive = false;
      running = false;
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      if (!keepShortcutsDisabled) {
        enableHostRestart();
      }
    }

    function destroy(){
      stop();
      gameOver = true;
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mousedown', shoot);
      canvas.removeEventListener('touchstart', onTouch);
      window.removeEventListener('keydown', onKey);
      canvas.remove();
    }

    return {
      start,
      stop,
      destroy
    };
  }

  if (!window.MiniGameMods) window.MiniGameMods = {};
  window.MiniGameMods.bubbleShooter = { create };
  if (window.registerMiniGame) {
    window.registerMiniGame({
      id: 'bubble_shooter',
      name: 'バブルシューター',
      description: 'バブルを撃って3つ揃えで消すカジュアルパズル。浮いたバブルはまとめて落下！',
      create
    });
  }
})();

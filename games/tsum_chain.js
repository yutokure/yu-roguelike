(function(){
  function create(root, awardXp, opts){
    const diff = opts?.difficulty || 'NORMAL';
    const localization = opts?.localization || (typeof window !== 'undefined' && typeof window.createMiniGameLocalization === 'function'
      ? window.createMiniGameLocalization({ id: 'tsum_chain', textKeyPrefix: 'miniexp.games.tsum_chain' })
      : null);
    const text = (key, fallback, params) => {
      if (localization && typeof localization.t === 'function') {
        return localization.t(key, fallback, params);
      }
      if (typeof fallback === 'function') return fallback();
      return fallback ?? '';
    };

    const cfg = {
      EASY:   { cols: 6, rows: 9, colors: 4, time: 75 },
      NORMAL: { cols: 6, rows: 10, colors: 5, time: 60 },
      HARD:   { cols: 7, rows: 11, colors: 6, time: 45 }
    }[diff] || { cols: 6, rows: 10, colors: 5, time: 60 };

    const CELL = 64;
    const PAD = 16;
    const HEADER = 48;
    const W = cfg.cols * CELL + PAD * 2;
    const H = cfg.rows * CELL + PAD * 2 + HEADER;

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    canvas.style.background = '#0f172a';
    canvas.style.borderRadius = '10px';
    canvas.style.touchAction = 'none';
    root.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const COLS = cfg.cols;
    const ROWS = cfg.rows;
    const COLORS = cfg.colors;

    const board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    let running = false;
    let detachLocale = localization && typeof localization.onChange === 'function'
      ? localization.onChange(() => {
          try { draw(); } catch {}
        })
      : null;

    let selection = [];
    let selectionColor = null;
    let pointerActive = false;
    let totalCleared = 0;
    let timerId = null;
    let remaining = cfg.time;
    let lastFrame = null;
    let lastNow = 0;
    let comboLevel = 0;
    let lastClearTime = 0;
    let inputLocked = false;

    let clearAnimations = [];
    let fallAnimations = [];
    let particles = [];

    const nowMs = () => {
      try {
        if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
          return performance.now();
        }
      } catch {}
      return Date.now();
    };

    const hue = (i) => `hsl(${(i * 58) % 360} 75% 62%)`;
    const newColor = () => (Math.random() * COLORS) | 0;

    function drawRoundedRect(x, y, w, h, r){
      const radius = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.arcTo(x + w, y, x + w, y + radius, radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
      ctx.lineTo(x + radius, y + h);
      ctx.arcTo(x, y + h, x, y + h - radius, radius);
      ctx.lineTo(x, y + radius);
      ctx.arcTo(x, y, x + radius, y, radius);
      ctx.closePath();
    }

    function resetBoard(){
      for(let y=0;y<ROWS;y++){
        for(let x=0;x<COLS;x++){
          board[y][x] = newColor();
        }
      }
    }

    function inBounds(x, y){
      return x >= 0 && x < COLS && y >= 0 && y < ROWS;
    }

    function cellFromPoint(clientX, clientY){
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left - PAD;
      const y = clientY - rect.top - PAD - HEADER;
      if (x < 0 || y < 0) return null;
      const cx = Math.floor(x / CELL);
      const cy = Math.floor(y / CELL);
      if (!inBounds(cx, cy)) return null;
      return { x: cx, y: cy };
    }

    function isAdjacent(a, b){
      const dx = Math.abs(a.x - b.x);
      const dy = Math.abs(a.y - b.y);
      return dx <= 1 && dy <= 1 && (dx + dy) > 0;
    }

    function containsCell(list, cell){
      return list.some((p) => p.x === cell.x && p.y === cell.y);
    }

    function startSelection(ev){
      if (!running || inputLocked) return;
      const cell = cellFromPoint(ev.clientX, ev.clientY);
      if (!cell) return;
      selection = [cell];
      selectionColor = board[cell.y][cell.x];
      pointerActive = true;
      draw();
    }

    function updateSelection(ev){
      if (!pointerActive || !running) return;
      const cell = cellFromPoint(ev.clientX, ev.clientY);
      if (!cell) return;
      const current = selection[selection.length - 1];
      if (current && cell.x === current.x && cell.y === current.y) return;
      if (selection.length >= 2){
        const prev = selection[selection.length - 2];
        if (prev && cell.x === prev.x && cell.y === prev.y){
          selection.pop();
          draw();
          return;
        }
      }
      if (board[cell.y][cell.x] !== selectionColor) return;
      if (!isAdjacent(current, cell)) return;
      if (containsCell(selection, cell)) return;
      selection.push(cell);
      draw();
    }

    function endSelection(){
      if (!pointerActive) return;
      pointerActive = false;
      if (selection.length >= 3){
        clearSelection();
      }
      selection = [];
      selectionColor = null;
      draw();
    }

    function clearSelection(){
      const count = selection.length;
      const set = new Set(selection.map(({ x, y }) => `${x},${y}`));
      if (count < 3) return;
      inputLocked = true;
      const now = nowMs();
      for(const key of set){
        const [xStr, yStr] = key.split(',');
        const x = Number(xStr);
        const y = Number(yStr);
        const colorIndex = board[y][x];
        if (colorIndex >= 0){
          clearAnimations.push({
            x,
            y,
            colorIndex,
            start: now,
            duration: 260
          });
          const centerX = PAD + x * CELL + CELL / 2;
          const centerY = PAD + HEADER + y * CELL + CELL / 2;
          const particleCount = 10 + Math.min(10, count * 2);
          for(let i=0;i<particleCount;i++){
            const angle = Math.random() * Math.PI * 2;
            const speed = 60 + Math.random() * 140;
            particles.push({
              x: centerX,
              y: centerY,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - 40,
              radius: 2.5 + Math.random() * 2.5,
              life: 0.45 + Math.random() * 0.35,
              maxLife: 0.8,
              colorIndex
            });
          }
        }
        board[y][x] = -1;
      }
      const moves = collapseBoard();
      const spawns = refillBoard();
      const baseFallDuration = 240;
      const perCellFall = 55;
      for(const move of moves){
        const distance = Math.max(1, Math.abs(move.toY - move.fromY));
        fallAnimations.push({
          x: move.x,
          fromRow: move.fromY,
          toRow: move.toY,
          colorIndex: move.colorIndex,
          start: now,
          duration: baseFallDuration + distance * perCellFall
        });
      }
      for(const spawn of spawns){
        const fromRow = -1 - Math.floor(Math.random() * 3);
        const distance = spawn.y - fromRow;
        fallAnimations.push({
          x: spawn.x,
          fromRow,
          toRow: spawn.y,
          colorIndex: spawn.colorIndex,
          start: now,
          duration: baseFallDuration + distance * perCellFall
        });
      }
      totalCleared += count;
      if (now - lastClearTime <= 2600) {
        comboLevel += 1;
      } else {
        comboLevel = 1;
      }
      lastClearTime = now;
      const baseExp = Math.pow(count - 2, 2);
      const comboBonus = comboLevel > 1 ? comboLevel : 0;
      const exp = Math.max(1, baseExp + comboBonus);
      try {
        if (comboLevel > 1 && typeof window !== 'undefined' && window?.showTransientPopupAt) {
          const message = text('popup.combo', () => `${comboLevel} Combo!`, { combo: comboLevel });
          const rect = canvas.getBoundingClientRect();
          window.showTransientPopupAt(rect.left + rect.width / 2, rect.top + HEADER / 2, message, { variant: 'combo', level: comboLevel });
        }
      } catch {}
      awardXp && awardXp(exp, { tiles: count, combo: comboLevel, base: baseExp });
    }

    function collapseBoard(){
      const moves = [];
      for(let x=0;x<COLS;x++){
        let write = ROWS - 1;
        for(let y=ROWS-1;y>=0;y--){
          if (board[y][x] >= 0){
            if (write !== y){
              moves.push({
                x,
                fromY: y,
                toY: write,
                colorIndex: board[y][x]
              });
            }
            board[write][x] = board[y][x];
            if (write !== y) board[y][x] = -1;
            write--;
          }
        }
        for(let y=write;y>=0;y--){
          board[y][x] = -1;
        }
      }
      return moves;
    }

    function refillBoard(){
      const spawns = [];
      for(let x=0;x<COLS;x++){
        for(let y=0;y<ROWS;y++){
          if (board[y][x] === -1){
            const colorIndex = newColor();
            board[y][x] = colorIndex;
            spawns.push({ x, y, colorIndex });
          }
        }
      }
      return spawns;
    }

    function hasActiveAnimations(){
      return clearAnimations.length > 0 || fallAnimations.length > 0 || particles.length > 0;
    }

    function updateAnimations(dt){
      const now = nowMs();
      clearAnimations = clearAnimations.filter((anim) => {
        const t = (now - anim.start) / anim.duration;
        return t < 1;
      });
      fallAnimations = fallAnimations.filter((anim) => {
        const t = (now - anim.start) / anim.duration;
        return t < 1;
      });
      particles = particles.filter((p) => {
        p.life -= dt;
        if (p.life <= 0) return false;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += (120 * dt);
        return true;
      });
      if (!hasActiveAnimations()){
        inputLocked = false;
      }
    }

    function draw(){
      if (!lastNow){
        lastNow = nowMs();
      }
      const animNow = lastNow;
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0,0,W,H);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(PAD, PAD, W - PAD * 2, HEADER - PAD / 2);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '20px "Noto Sans JP", system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const timerText = text('ui.timer', () => `Time: ${Math.max(0, Math.ceil(remaining))}s`, { seconds: Math.max(0, Math.ceil(remaining)) });
      ctx.fillText(timerText, PAD + 12, PAD + (HEADER - PAD / 2) / 2);
      const scoreText = text('ui.score', () => `Cleared: ${totalCleared}`, { score: totalCleared });
      ctx.textAlign = 'right';
      ctx.fillText(scoreText, W - PAD - 12, PAD + (HEADER - PAD / 2) / 2);

      const fallingTargets = new Set();
      for (const anim of fallAnimations){
        const t = Math.min(1, (animNow - anim.start) / anim.duration);
        if (t < 1){
          fallingTargets.add(`${anim.x},${anim.toRow}`);
        }
      }

      for(let y=0;y<ROWS;y++){
        for(let x=0;x<COLS;x++){
          const px = PAD + x * CELL;
          const py = PAD + HEADER + y * CELL;
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(px + 2, py + 2, CELL - 4, CELL - 4);
          const v = board[y][x];
          if (v >= 0 && !fallingTargets.has(`${x},${y}`)){
            ctx.fillStyle = hue(v);
            drawRoundedRect(px + 6, py + 6, CELL - 12, CELL - 12, 16);
            ctx.fill();
          }
      }
    }

      if (clearAnimations.length > 0){
        ctx.save();
        for (const anim of clearAnimations){
          const tRaw = (animNow - anim.start) / anim.duration;
          if (tRaw <= 0) continue;
          const t = Math.min(1, tRaw);
          const ease = t * t * (3 - 2 * t);
          const scale = 1 - ease;
          if (scale <= 0.02) continue;
          const alpha = 1 - ease * 0.8;
          const cx = PAD + anim.x * CELL + CELL / 2;
          const cy = PAD + HEADER + anim.y * CELL + CELL / 2;
          const w = (CELL - 12) * scale;
          const h = (CELL - 12) * scale;
          ctx.globalAlpha = alpha;
          ctx.fillStyle = hue(anim.colorIndex);
          drawRoundedRect(cx - w / 2, cy - h / 2, w, h, 16 * scale);
          ctx.fill();
        }
        ctx.restore();
      }

      if (fallAnimations.length > 0){
        ctx.save();
        for (const anim of fallAnimations){
          const tRaw = (animNow - anim.start) / anim.duration;
          if (tRaw <= 0) continue;
          const t = Math.min(1, tRaw);
          const ease = 1 - Math.pow(1 - t, 3);
          const row = anim.fromRow + (anim.toRow - anim.fromRow) * ease;
          const px = PAD + anim.x * CELL;
          const py = PAD + HEADER + row * CELL;
          const centerX = px + CELL / 2;
          const centerY = py + CELL / 2;
          const wobble = Math.sin(t * Math.PI) * 3;
          ctx.save();
          ctx.translate(centerX + wobble, centerY);
          ctx.fillStyle = hue(anim.colorIndex);
          drawRoundedRect(- (CELL - 12) / 2, - (CELL - 12) / 2, CELL - 12, CELL - 12, 16);
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();
      }

      if (particles.length > 0){
        ctx.save();
        for (const p of particles){
          const lifeRatio = Math.max(0, Math.min(1, p.life / p.maxLife));
          if (lifeRatio <= 0) continue;
          ctx.globalAlpha = lifeRatio;
          ctx.fillStyle = hue(p.colorIndex);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      if (selection.length > 0){
        ctx.save();
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        for(let i=0;i<selection.length;i++){
          const { x, y } = selection[i];
          const cx = PAD + x * CELL + CELL / 2;
          const cy = PAD + HEADER + y * CELL + CELL / 2;
          if (i === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
        }
        ctx.stroke();
        for(const { x, y } of selection){
          const cx = PAD + x * CELL + CELL / 2;
          const cy = PAD + HEADER + y * CELL + CELL / 2;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
          ctx.beginPath();
          ctx.arc(cx, cy, CELL * 0.28, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      if (!running){
        ctx.fillStyle = 'rgba(15, 23, 42, 0.74)';
        ctx.fillRect(0,0,W,H);
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'center';
        ctx.font = '28px "Noto Sans JP", system-ui, sans-serif';
        ctx.fillText(text('ui.finished', () => 'Time Up!'), W/2, H/2 - 14);
        ctx.font = '18px "Noto Sans JP", system-ui, sans-serif';
        ctx.fillText(text('ui.total', () => `Total Cleared: ${totalCleared}`, { score: totalCleared }), W/2, H/2 + 18);
      }
    }

    function tick(now){
      if (!lastFrame) lastFrame = now;
      const dt = (now - lastFrame) / 1000;
      lastFrame = now;
      lastNow = now;
      if (running){
        remaining -= dt;
        if (remaining <= 0){
          remaining = 0;
          running = false;
          removeListeners();
          pointerActive = false;
          selection = [];
        }
      }
      updateAnimations(dt);
      draw();
      if (running || hasActiveAnimations()) {
        timerId = window.requestAnimationFrame(tick);
      } else {
        timerId = null;
      }
    }

    function startTimer(){
      stopTimer();
      lastFrame = null;
      timerId = window.requestAnimationFrame(tick);
    }

    function stopTimer(){
      if (timerId){
        window.cancelAnimationFrame(timerId);
        timerId = null;
      }
    }

    function start(){
      if (running) return;
      resetBoard();
      remaining = cfg.time;
      totalCleared = 0;
      comboLevel = 0;
      lastClearTime = 0;
      clearAnimations = [];
      fallAnimations = [];
      particles = [];
      inputLocked = false;
      running = true;
      addListeners();
      draw();
      startTimer();
    }

    function stop(){
      if (!running) return;
      running = false;
      pointerActive = false;
      stopTimer();
      removeListeners();
      draw();
    }

    function destroy(){
      try { stop(); } catch {}
      try { root && root.removeChild(canvas); } catch {}
      if (detachLocale){
        try { detachLocale(); } catch {}
        detachLocale = null;
      }
    }

    function addListeners(){
      canvas.addEventListener('pointerdown', startSelection);
      canvas.addEventListener('pointermove', updateSelection);
      canvas.addEventListener('pointerup', endSelection);
      canvas.addEventListener('pointerleave', endSelection);
    }

    function removeListeners(){
      canvas.removeEventListener('pointerdown', startSelection);
      canvas.removeEventListener('pointermove', updateSelection);
      canvas.removeEventListener('pointerup', endSelection);
      canvas.removeEventListener('pointerleave', endSelection);
    }

    function getScore(){
      return totalCleared;
    }

    resetBoard();
    draw();

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({
    id: 'tsum_chain',
    name: 'チェインツム',
    nameKey: 'selection.miniexp.games.tsum_chain.name',
    description: '同色を線でなぞって消す60秒チャレンジ。長いチェインと連続コンボで高EXP',
    descriptionKey: 'selection.miniexp.games.tsum_chain.description',
    categoryIds: ['puzzle'],
    create
  });
})();

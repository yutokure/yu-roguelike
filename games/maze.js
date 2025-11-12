(function(){
  const STYLE_ID = 'maze-mod-style';
  const CELL_SIZE = 24;
  const DIFFICULTIES = {
    EASY: { width: 15, height: 11, loops: 0.35, label: 'EASY', xp: 50 },
    NORMAL: { width: 21, height: 17, loops: 0.18, label: 'NORMAL', xp: 90 },
    HARD: { width: 27, height: 23, loops: 0.08, label: 'HARD', xp: 140 }
  };

  function create(root, awardXp, opts){
    const difficultyKey = (opts && opts.difficulty) || 'NORMAL';
    const difficulty = DIFFICULTIES[difficultyKey] || DIFFICULTIES.NORMAL;
    ensureStyles();

    const wrapper = document.createElement('div');
    wrapper.className = 'maze-mod-wrapper';

    const header = document.createElement('div');
    header.className = 'maze-mod-header';

    const title = document.createElement('h2');
    title.textContent = '迷路ウォーク';
    header.appendChild(title);

    const difficultyTag = document.createElement('span');
    difficultyTag.textContent = `難易度: ${difficulty.label}`;
    difficultyTag.className = 'maze-mod-difficulty';
    header.appendChild(difficultyTag);
    wrapper.appendChild(header);

    const description = document.createElement('p');
    description.className = 'maze-mod-description';
    description.textContent = '矢印キーまたは WASD で探検家を操作し、出口へ到達しましょう。難易度に応じて迷路の広さと複雑さが変化します。';
    wrapper.appendChild(description);

    const infoBar = document.createElement('div');
    infoBar.className = 'maze-mod-info';
    wrapper.appendChild(infoBar);

    const canvas = document.createElement('canvas');
    canvas.className = 'maze-mod-canvas';
    wrapper.appendChild(canvas);

    const controls = document.createElement('div');
    controls.className = 'maze-mod-controls';

    const regenerateButton = document.createElement('button');
    regenerateButton.textContent = '迷路を更新';
    regenerateButton.className = 'maze-mod-button';
    controls.appendChild(regenerateButton);

    const resetButton = document.createElement('button');
    resetButton.textContent = 'スタートに戻る';
    resetButton.className = 'maze-mod-button secondary';
    controls.appendChild(resetButton);

    wrapper.appendChild(controls);
    root.appendChild(wrapper);

    const ctx = canvas.getContext('2d');
    let mazeState = null;
    let running = false;
    let completedRuns = 0;

    function ensureCanvasSize(){
      canvas.width = difficulty.width * CELL_SIZE;
      canvas.height = difficulty.height * CELL_SIZE;
    }

    function ensureStyles(){
      if (typeof document === 'undefined') return;
      if (document.getElementById(STYLE_ID)) return;
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = `
        .maze-mod-wrapper {
          width: 100%;
          max-width: 720px;
          margin: 0 auto;
          padding: 16px 18px 20px;
          background: radial-gradient(circle at top, #111827 0%, #030712 70%);
          border-radius: 16px;
          color: #e2e8f0;
          font-family: 'Segoe UI', system-ui, sans-serif;
          box-shadow: 0 16px 32px rgba(2, 6, 23, 0.55);
          box-sizing: border-box;
        }
        .maze-mod-header {
          display: flex;
          align-items: baseline;
          gap: 12px;
          margin-bottom: 8px;
        }
        .maze-mod-header h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
          letter-spacing: 0.04em;
        }
        .maze-mod-difficulty {
          font-size: 12px;
          padding: 2px 10px;
          border-radius: 999px;
          background: rgba(59, 130, 246, 0.15);
          border: 1px solid rgba(59, 130, 246, 0.45);
          color: #93c5fd;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .maze-mod-description {
          margin: 0 0 12px;
          font-size: 14px;
          line-height: 1.6;
          color: rgba(226, 232, 240, 0.85);
        }
        .maze-mod-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          padding: 8px 10px;
          background: rgba(30, 41, 59, 0.55);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 10px;
          margin-bottom: 12px;
          font-variant-numeric: tabular-nums;
        }
        .maze-mod-canvas {
          width: 100%;
          display: block;
          background: #020617;
          border-radius: 12px;
          border: 1px solid rgba(148, 163, 184, 0.25);
          box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.15);
        }
        .maze-mod-controls {
          display: flex;
          gap: 8px;
          margin-top: 14px;
          flex-wrap: wrap;
        }
        .maze-mod-button {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 8px 14px;
          font-size: 13px;
          cursor: pointer;
          transition: transform 0.1s ease, box-shadow 0.1s ease;
          box-shadow: 0 6px 12px rgba(37, 99, 235, 0.35);
        }
        .maze-mod-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 16px rgba(37, 99, 235, 0.45);
        }
        .maze-mod-button.secondary {
          background: rgba(15, 23, 42, 0.75);
          border: 1px solid rgba(148, 163, 184, 0.3);
          color: rgba(226, 232, 240, 0.9);
          box-shadow: none;
        }
        .maze-mod-button.secondary:hover {
          transform: none;
          box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.35);
        }
      `;
      document.head.appendChild(style);
    }

    function initialize(){
      ensureCanvasSize();
      mazeState = createMazeState(difficulty.width, difficulty.height, difficulty.loops);
      draw();
      updateInfo();
    }

    function createMazeState(width, height, loopFactor){
      const grid = Array.from({ length: height }, () => Array(width).fill(1));
      const stack = [];
      const start = { x: 1, y: 1 };
      const goal = { x: width - 2, y: height - 2 };
      grid[start.y][start.x] = 0;
      stack.push({ x: start.x, y: start.y });
      const directions = [
        { dx: 2, dy: 0 },
        { dx: -2, dy: 0 },
        { dx: 0, dy: 2 },
        { dx: 0, dy: -2 }
      ];

      while (stack.length) {
        const current = stack[stack.length - 1];
        const candidates = directions
          .map(d => ({ x: current.x + d.dx, y: current.y + d.dy, between: { x: current.x + d.dx / 2, y: current.y + d.dy / 2 } }))
          .filter(n => n.x > 0 && n.x < width - 1 && n.y > 0 && n.y < height - 1 && grid[n.y][n.x] === 1);
        if (candidates.length === 0) {
          stack.pop();
          continue;
        }
        const next = candidates[Math.floor(Math.random() * candidates.length)];
        grid[next.between.y][next.between.x] = 0;
        grid[next.y][next.x] = 0;
        stack.push({ x: next.x, y: next.y });
      }

      const connectors = [];
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          if (grid[y][x] === 1) {
            const horizontal = grid[y][x - 1] === 0 && grid[y][x + 1] === 0;
            const vertical = grid[y - 1][x] === 0 && grid[y + 1][x] === 0;
            if (horizontal || vertical) connectors.push({ x, y });
          }
        }
      }
      const extraOpens = Math.floor(connectors.length * loopFactor);
      for (let i = 0; i < extraOpens; i++) {
        if (connectors.length === 0) break;
        const index = Math.floor(Math.random() * connectors.length);
        const cell = connectors.splice(index, 1)[0];
        grid[cell.y][cell.x] = 0;
      }

      grid[start.y][start.x] = 0;
      grid[goal.y][goal.x] = 0;

      return {
        grid,
        width,
        height,
        start,
        goal,
        player: { x: start.x, y: start.y },
        steps: 0,
        completed: false,
        message: 'スタート地点にいます。ゴールを目指しましょう！'
      };
    }

    function draw(){
      if (!mazeState) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let y = 0; y < mazeState.height; y++) {
        for (let x = 0; x < mazeState.width; x++) {
          const cell = mazeState.grid[y][x];
          if (cell === 1) {
            ctx.fillStyle = '#111827';
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            ctx.fillStyle = 'rgba(30, 41, 59, 0.75)';
            ctx.fillRect(x * CELL_SIZE + 4, y * CELL_SIZE + 4, CELL_SIZE - 8, CELL_SIZE - 8);
          }
        }
      }

      drawCell(mazeState.start.x, mazeState.start.y, '#0ea5e9', '#38bdf8');
      drawCell(mazeState.goal.x, mazeState.goal.y, '#f97316', '#fb923c');
      drawPlayer();
    }

    function drawCell(x, y, outer, inner){
      ctx.fillStyle = outer;
      ctx.fillRect(x * CELL_SIZE + 3, y * CELL_SIZE + 3, CELL_SIZE - 6, CELL_SIZE - 6);
      ctx.fillStyle = inner;
      ctx.fillRect(x * CELL_SIZE + 6, y * CELL_SIZE + 6, CELL_SIZE - 12, CELL_SIZE - 12);
    }

    function drawPlayer(){
      ctx.save();
      ctx.translate(mazeState.player.x * CELL_SIZE + CELL_SIZE / 2, mazeState.player.y * CELL_SIZE + CELL_SIZE / 2);
      ctx.fillStyle = mazeState.completed ? '#22c55e' : '#f43f5e';
      ctx.beginPath();
      ctx.arc(0, 0, CELL_SIZE * 0.32, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.beginPath();
      ctx.arc(0, -CELL_SIZE * 0.1, CELL_SIZE * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function updateInfo(){
      if (!mazeState) return;
      const progress = mazeState.completed
        ? `ゴール！ (${mazeState.steps} 歩 / クリア ${completedRuns} 回)`
        : `歩数: ${mazeState.steps}　ゴールまであと少し！`;
      infoBar.textContent = `${progress}　${mazeState.message}`;
    }

    function handleMove(dx, dy){
      if (!mazeState || mazeState.completed) return;
      const nx = mazeState.player.x + dx;
      const ny = mazeState.player.y + dy;
      if (nx < 0 || ny < 0 || nx >= mazeState.width || ny >= mazeState.height) return;
      if (mazeState.grid[ny][nx] === 1) {
        mazeState.message = '壁にぶつかりました。別の道を探しましょう。';
        updateInfo();
        return;
      }
      mazeState.player = { x: nx, y: ny };
      mazeState.steps += 1;
      mazeState.message = '順調に進んでいます。';
      if (nx === mazeState.goal.x && ny === mazeState.goal.y) {
        mazeState.completed = true;
        completedRuns += 1;
        mazeState.message = '出口に到達しました！おめでとう！';
        awardXp && awardXp(difficulty.xp, { type: 'clear', difficulty: difficultyKey, steps: mazeState.steps });
      }
      draw();
      updateInfo();
    }

    const KEY_MAP = {
      ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
      w: [0, -1], W: [0, -1], s: [0, 1], S: [0, 1], a: [-1, 0], A: [-1, 0], d: [1, 0], D: [1, 0]
    };

    function keydown(e){
      const move = KEY_MAP[e.key];
      if (!move) return;
      e.preventDefault();
      handleMove(move[0], move[1]);
    }

    function regenerate(){
      mazeState = createMazeState(difficulty.width, difficulty.height, difficulty.loops);
      draw();
      updateInfo();
    }

    function reset(){
      if (!mazeState) return;
      mazeState.player = { x: mazeState.start.x, y: mazeState.start.y };
      mazeState.steps = 0;
      mazeState.completed = false;
      mazeState.message = 'スタートに戻りました。別のルートを試しましょう。';
      draw();
      updateInfo();
    }

    regenerateButton.addEventListener('click', regenerate);
    resetButton.addEventListener('click', reset);

    function start(){
      if (running) return;
      running = true;
      initialize();
      window.addEventListener('keydown', keydown, { passive: false });
    }

    function stop(){
      if (!running) return;
      running = false;
      window.removeEventListener('keydown', keydown, { passive: false });
    }

    function destroy(){
      stop();
      regenerateButton.removeEventListener('click', regenerate);
      resetButton.removeEventListener('click', reset);
      try { root.removeChild(wrapper); } catch {}
    }

    function getScore(){
      return completedRuns;
    }

    return { start, stop, destroy, getScore };
  }

  if (typeof window !== 'undefined' && typeof window.registerMiniGame === 'function'){
    window.registerMiniGame({
      id: 'maze',
      name: '迷路ウォーク',
      nameKey: 'selection.miniexp.games.maze.name',
      description: '迷路を探索して出口を目指すミニゲーム。難易度で迷路サイズが変化。',
      descriptionKey: 'selection.miniexp.games.maze.description',
      categoryIds: ['puzzle'],
      create
    });
  }
})();

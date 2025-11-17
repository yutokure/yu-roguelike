(function(){
  const STYLE_ID = 'slitherlink-mod-style';
  const CELL_SIZE = 56;
  const DOT_SIZE = 12;
  const EDGE_THICKNESS = 10;
  const BOARD_PADDING = 18;

  const difficultyMap = {
    EASY: { label: 'EASY', xp: 90 },
    NORMAL: { label: 'NORMAL', xp: 150 },
    HARD: { label: 'HARD', xp: 260 }
  };

  const puzzlePools = {
    EASY: [
      {
        width: 5,
        height: 5,
        clues: [
          [2, 1, 1, 1, 2],
          [0, 0, 0, 0, 1],
          [0, 0, 0, 0, 1],
          [0, 0, 0, 0, 1],
          [1, 0, 0, 0, 1]
        ]
      },
      {
        width: 5,
        height: 5,
        clues: [
          [1, 3, 1, 1, 2],
          [0, 2, 1, 1, 1],
          [1, 1, 1, 2, 0],
          [2, 1, 1, 2, 1],
          [1, 0, 0, 1, 2]
        ]
      }
    ],
    NORMAL: [
      {
        width: 6,
        height: 6,
        clues: [
          [3, 1, 1, 1, 1, 2],
          [1, 1, 1, 0, 1, 1],
          [0, 0, 0, 1, 2, 0],
          [1, 1, 0, 1, 2, 1],
          [2, 1, 1, 0, 1, 2],
          [1, 1, 3, 2, 0, 1]
        ]
      }
    ],
    HARD: [
      {
        width: 8,
        height: 6,
        clues: [
          [2, 1, 1, 1, 1, 1, 1, 2],
          [1, 0, 0, 0, 0, 0, 1, 1],
          [1, 0, 1, 1, 0, 1, 2, 0],
          [0, 0, 1, 0, 0, 1, 2, 1],
          [0, 1, 2, 0, 1, 0, 1, 2],
          [0, 0, 1, 1, 3, 2, 0, 1]
        ]
      }
    ]
  };

  function ensureStyles(){
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .slitherlink-wrapper {
        width: 100%;
        max-width: 760px;
        margin: 0 auto;
        padding: 18px 20px 24px;
        background: radial-gradient(circle at top, #0f172a 0%, #020617 65%);
        border-radius: 20px;
        color: #f8fafc;
        font-family: 'Segoe UI', system-ui, sans-serif;
        box-shadow: 0 20px 36px rgba(3, 7, 18, 0.65);
        box-sizing: border-box;
      }
      .slitherlink-header {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 12px;
      }
      .slitherlink-header h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 700;
        letter-spacing: 0.04em;
      }
      .slitherlink-description {
        margin: 6px 0 14px;
        line-height: 1.6;
        font-size: 13px;
        opacity: 0.9;
      }
      .slitherlink-controls {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        align-items: center;
        margin-bottom: 12px;
      }
      .slitherlink-controls select,
      .slitherlink-controls button {
        border-radius: 999px;
        border: none;
        padding: 10px 16px;
        font-weight: 600;
        font-size: 13px;
      }
      .slitherlink-controls select {
        background: rgba(15, 23, 42, 0.7);
        color: #f8fafc;
      }
      .slitherlink-button-primary {
        background: linear-gradient(135deg, #22d3ee, #6366f1);
        color: #0f172a;
        cursor: pointer;
        box-shadow: 0 12px 24px rgba(99, 102, 241, 0.4);
        transition: transform 0.18s ease;
      }
      .slitherlink-button-secondary {
        background: rgba(148, 163, 184, 0.2);
        color: #f8fafc;
        cursor: pointer;
      }
      .slitherlink-button-primary:hover {
        transform: translateY(-1px);
      }
      .slitherlink-info {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 12px;
        background: rgba(15, 23, 42, 0.55);
        border-radius: 16px;
        padding: 12px 16px;
        margin-bottom: 16px;
        font-size: 13px;
      }
      .slitherlink-info span {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      .slitherlink-info label {
        opacity: 0.7;
        font-size: 12px;
      }
      .slitherlink-board {
        position: relative;
        margin: 0 auto;
        background: radial-gradient(circle at center, rgba(15,23,42,0.95), rgba(2,6,23,0.95));
        border-radius: 18px;
        box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.7) inset, 0 25px 40px rgba(2, 6, 23, 0.7);
        user-select: none;
        touch-action: none;
      }
      .slitherlink-dot {
        position: absolute;
        width: ${DOT_SIZE}px;
        height: ${DOT_SIZE}px;
        margin-left: -${DOT_SIZE / 2}px;
        margin-top: -${DOT_SIZE / 2}px;
        border-radius: 50%;
        background: #f8fafc;
        box-shadow: 0 0 6px rgba(248, 250, 252, 0.5);
        pointer-events: none;
      }
      .slitherlink-edge {
        position: absolute;
        border-radius: 6px;
        background: rgba(248, 250, 252, 0.18);
        transition: background 0.2s ease, box-shadow 0.2s ease;
        cursor: pointer;
      }
      .slitherlink-edge.horizontal {
        height: ${EDGE_THICKNESS}px;
        margin-top: -${EDGE_THICKNESS / 2}px;
      }
      .slitherlink-edge.vertical {
        width: ${EDGE_THICKNESS}px;
        margin-left: -${EDGE_THICKNESS / 2}px;
      }
      .slitherlink-edge.line {
        background: linear-gradient(90deg, #38bdf8, #a855f7);
        box-shadow: 0 0 8px rgba(59, 130, 246, 0.65);
      }
      .slitherlink-edge.cross {
        background: rgba(248, 113, 113, 0.2);
      }
      .slitherlink-edge.cross::after {
        content: '×';
        color: rgba(248, 113, 113, 0.95);
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -55%);
        font-weight: 600;
        font-size: 16px;
        pointer-events: none;
      }
      .slitherlink-clue {
        position: absolute;
        width: ${CELL_SIZE - 16}px;
        height: ${CELL_SIZE - 16}px;
        margin-left: -${(CELL_SIZE - 16) / 2}px;
        margin-top: -${(CELL_SIZE - 16) / 2}px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 18px;
        color: #cbd5f5;
        transition: background 0.2s ease, color 0.2s ease;
      }
      .slitherlink-clue.match {
        background: rgba(45, 212, 191, 0.14);
        color: #5eead4;
      }
      .slitherlink-clue.over {
        background: rgba(248, 113, 113, 0.18);
        color: #fecaca;
      }
      .slitherlink-status {
        margin-top: 12px;
        padding: 10px 14px;
        border-radius: 12px;
        background: rgba(15, 23, 42, 0.6);
        font-size: 13px;
      }
    `;
    document.head.appendChild(style);
  }

  function create(root, awardXp, opts){
    ensureStyles();
    const localization = opts?.localization || (typeof window !== 'undefined' && typeof window.createMiniGameLocalization === 'function'
      ? window.createMiniGameLocalization({ id: 'slitherlink' })
      : null);
    const text = (key, fallback, params) => {
      if (localization && typeof localization.t === 'function'){
        return localization.t(key, fallback, params);
      }
      if (typeof fallback === 'function') return fallback(params);
      return fallback ?? '';
    };

    const wrapper = document.createElement('div');
    wrapper.className = 'slitherlink-wrapper';

    const header = document.createElement('div');
    header.className = 'slitherlink-header';
    const title = document.createElement('h2');
    title.textContent = text('.title', 'スリザーリンクラボ');
    header.appendChild(title);
    const subtitle = document.createElement('span');
    subtitle.textContent = text('.subtitle', '数字通りに線を引いて閉じたループを作りましょう');
    subtitle.style.fontSize = '13px';
    subtitle.style.opacity = '0.75';
    header.appendChild(subtitle);
    wrapper.appendChild(header);

    const description = document.createElement('p');
    description.className = 'slitherlink-description';
    description.textContent = text(
      '.description',
      '数字は周囲の線の本数を表します。左クリックで線を置き、右クリックまたはAlt+クリックで×マーカーを切り替えられます。'
    );
    wrapper.appendChild(description);

    const controls = document.createElement('div');
    controls.className = 'slitherlink-controls';

    const difficultyLabel = document.createElement('label');
    difficultyLabel.textContent = text('.controls.difficulty', '難易度:');
    controls.appendChild(difficultyLabel);

    const difficultySelect = document.createElement('select');
    Object.keys(difficultyMap).forEach(key => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = `${difficultyMap[key].label}`;
      difficultySelect.appendChild(opt);
    });
    controls.appendChild(difficultySelect);

    const newButton = document.createElement('button');
    newButton.className = 'slitherlink-button-primary';
    newButton.textContent = text('.controls.new', '新しい盤面');

    const resetButton = document.createElement('button');
    resetButton.className = 'slitherlink-button-secondary';
    resetButton.textContent = text('.controls.reset', 'リセット');

    controls.appendChild(newButton);
    controls.appendChild(resetButton);
    wrapper.appendChild(controls);

    const infoBar = document.createElement('div');
    infoBar.className = 'slitherlink-info';
    const infoDifficulty = document.createElement('span');
    const infoDifficultyLabel = document.createElement('label');
    infoDifficultyLabel.textContent = text('.info.difficulty', '現在の難易度');
    const infoDifficultyValue = document.createElement('strong');
    infoDifficulty.appendChild(infoDifficultyLabel);
    infoDifficulty.appendChild(infoDifficultyValue);

    const infoProgress = document.createElement('span');
    const infoProgressLabel = document.createElement('label');
    infoProgressLabel.textContent = text('.info.progress', '一致した数字');
    const infoProgressValue = document.createElement('strong');
    infoProgress.appendChild(infoProgressLabel);
    infoProgress.appendChild(infoProgressValue);

    const infoLines = document.createElement('span');
    const infoLinesLabel = document.createElement('label');
    infoLinesLabel.textContent = text('.info.lines', '配置した線');
    const infoLinesValue = document.createElement('strong');
    infoLines.appendChild(infoLinesLabel);
    infoLines.appendChild(infoLinesValue);

    infoBar.appendChild(infoDifficulty);
    infoBar.appendChild(infoProgress);
    infoBar.appendChild(infoLines);
    wrapper.appendChild(infoBar);

    const board = document.createElement('div');
    board.className = 'slitherlink-board';
    wrapper.appendChild(board);

    const status = document.createElement('div');
    status.className = 'slitherlink-status';
    status.textContent = text('.status.ready', '好きなマスから推理を始めてください。');
    wrapper.appendChild(status);

    root.appendChild(wrapper);

    let currentDifficulty = (opts && opts.difficulty) || 'NORMAL';
    if (!difficultyMap[currentDifficulty]) currentDifficulty = 'NORMAL';
    difficultySelect.value = currentDifficulty;

    let currentPuzzle = null;
    let solved = false;
    let rewardGiven = false;
    let hState = [];
    let vState = [];
    let hEdges = [];
    let vEdges = [];
    let clueRefs = [];

    function createMatrix(rows, cols, fill){
      return Array.from({ length: rows }, () => Array(cols).fill(fill));
    }

    function pickPuzzle(diff){
      const pool = puzzlePools[diff] || puzzlePools.NORMAL;
      return pool[Math.floor(Math.random() * pool.length)];
    }

    function rebuildBoard(){
      if (!currentPuzzle) return;
      const { width, height, clues } = currentPuzzle;
      board.innerHTML = '';
      const boardWidth = width * CELL_SIZE + BOARD_PADDING * 2;
      const boardHeight = height * CELL_SIZE + BOARD_PADDING * 2;
      board.style.width = `${boardWidth}px`;
      board.style.height = `${boardHeight}px`;

      hState = createMatrix(height + 1, width, 0);
      vState = createMatrix(height, width + 1, 0);
      hEdges = createMatrix(height + 1, width, null);
      vEdges = createMatrix(height, width + 1, null);
      clueRefs = createMatrix(height, width, null);

      for (let y = 0; y <= height; y++){
        for (let x = 0; x <= width; x++){
          const dot = document.createElement('div');
          dot.className = 'slitherlink-dot';
          dot.style.left = `${BOARD_PADDING + x * CELL_SIZE}px`;
          dot.style.top = `${BOARD_PADDING + y * CELL_SIZE}px`;
          board.appendChild(dot);
        }
      }

      for (let y = 0; y <= height; y++){
        for (let x = 0; x < width; x++){
          const edge = document.createElement('div');
          edge.className = 'slitherlink-edge horizontal';
          edge.style.width = `${CELL_SIZE}px`;
          edge.style.left = `${BOARD_PADDING + x * CELL_SIZE + CELL_SIZE / 2}px`;
          edge.style.top = `${BOARD_PADDING + y * CELL_SIZE}px`;
          setupEdgeInteraction(edge, 'h', y, x);
          hEdges[y][x] = edge;
          board.appendChild(edge);
        }
      }

      for (let y = 0; y < height; y++){
        for (let x = 0; x <= width; x++){
          const edge = document.createElement('div');
          edge.className = 'slitherlink-edge vertical';
          edge.style.height = `${CELL_SIZE}px`;
          edge.style.left = `${BOARD_PADDING + x * CELL_SIZE}px`;
          edge.style.top = `${BOARD_PADDING + y * CELL_SIZE + CELL_SIZE / 2}px`;
          setupEdgeInteraction(edge, 'v', y, x);
          vEdges[y][x] = edge;
          board.appendChild(edge);
        }
      }

      for (let y = 0; y < height; y++){
        for (let x = 0; x < width; x++){
          const clue = document.createElement('div');
          clue.className = 'slitherlink-clue';
          clue.textContent = clues[y][x] ?? '';
          clue.style.left = `${BOARD_PADDING + x * CELL_SIZE + CELL_SIZE / 2}px`;
          clue.style.top = `${BOARD_PADDING + y * CELL_SIZE + CELL_SIZE / 2}px`;
          clueRefs[y][x] = clue;
          board.appendChild(clue);
        }
      }
    }

    function setupEdgeInteraction(edge, type, y, x){
      edge.addEventListener('pointerdown', ev => {
        ev.preventDefault();
        const markMode = ev.button === 2 || ev.altKey;
        handleEdgeInput(type, y, x, markMode);
      });
      edge.addEventListener('contextmenu', ev => ev.preventDefault());
    }

    function handleEdgeInput(type, y, x, markMode){
      if (!currentPuzzle) return;
      const matrix = type === 'h' ? hState : vState;
      const prev = matrix[y][x];
      let next = prev;
      if (markMode){
        next = prev === 2 ? 0 : 2;
      } else {
        next = prev === 1 ? 0 : 1;
      }
      matrix[y][x] = next;
      updateEdgeVisual(type, y, x);
      updateClues();
      updateInfo();
      checkSolved();
    }

    function updateEdgeVisual(type, y, x){
      const matrix = type === 'h' ? hState : vState;
      const refs = type === 'h' ? hEdges : vEdges;
      const el = refs[y][x];
      if (!el) return;
      const state = matrix[y][x];
      el.classList.toggle('line', state === 1);
      el.classList.toggle('cross', state === 2);
    }

    function countLines(){
      let total = 0;
      for (let y = 0; y < hState.length; y++){
        for (let x = 0; x < hState[0].length; x++){
          if (hState[y][x] === 1) total++;
        }
      }
      for (let y = 0; y < vState.length; y++){
        for (let x = 0; x < vState[0].length; x++){
          if (vState[y][x] === 1) total++;
        }
      }
      return total;
    }

    function countAroundCell(x, y){
      const { width, height } = currentPuzzle;
      if (x < 0 || y < 0 || x >= width || y >= height) return 0;
      return (
        hState[y][x] +
        hState[y + 1][x] +
        vState[y][x] +
        vState[y][x + 1]
      );
    }

    function updateClues(){
      const { width, height, clues } = currentPuzzle;
      for (let y = 0; y < height; y++){
        for (let x = 0; x < width; x++){
          const ref = clueRefs[y][x];
          if (!ref) continue;
          const clue = clues[y][x];
          if (clue == null){
            ref.textContent = '';
            continue;
          }
          const around = countAroundCell(x, y);
          ref.classList.toggle('match', around === clue);
          ref.classList.toggle('over', around > clue);
        }
      }
    }

    function updateInfo(){
      const { width, height, clues } = currentPuzzle;
      const totalCells = width * height;
      let satisfied = 0;
      let clueCells = 0;
      for (let y = 0; y < height; y++){
        for (let x = 0; x < width; x++){
          if (clues[y][x] == null) continue;
          clueCells++;
          if (countAroundCell(x, y) === clues[y][x]) satisfied++;
        }
      }
      infoDifficultyValue.textContent = `${difficultyMap[currentDifficulty].label} / ${difficultyMap[currentDifficulty].xp}XP`;
      infoProgressValue.textContent = `${satisfied} / ${clueCells || totalCells}`;
      infoLinesValue.textContent = `${countLines()} ${text('.info.lines.unit', '本')}`;
    }

    function vertexIndex(x, y, width){
      return y * (width + 1) + x;
    }

    function checkSolved(){
      if (!currentPuzzle) return false;
      const { width, height, clues } = currentPuzzle;
      for (let y = 0; y < height; y++){
        for (let x = 0; x < width; x++){
          const clue = clues[y][x];
          if (clue == null) continue;
          if (countAroundCell(x, y) !== clue){
            if (solved){
              solved = false;
            }
            return false;
          }
        }
      }
      const vertexCount = (width + 1) * (height + 1);
      const degrees = new Array(vertexCount).fill(0);
      const adjacency = Array.from({ length: vertexCount }, () => []);
      let lineSegments = 0;
      for (let y = 0; y < hState.length; y++){
        for (let x = 0; x < hState[0].length; x++){
          if (hState[y][x] === 1){
            lineSegments++;
            const v1 = vertexIndex(x, y, width);
            const v2 = vertexIndex(x + 1, y, width);
            degrees[v1]++;
            degrees[v2]++;
            adjacency[v1].push(v2);
            adjacency[v2].push(v1);
          }
        }
      }
      for (let y = 0; y < vState.length; y++){
        for (let x = 0; x < vState[0].length; x++){
          if (vState[y][x] === 1){
            lineSegments++;
            const v1 = vertexIndex(x, y, width);
            const v2 = vertexIndex(x, y + 1, width);
            degrees[v1]++;
            degrees[v2]++;
            adjacency[v1].push(v2);
            adjacency[v2].push(v1);
          }
        }
      }
      if (lineSegments === 0) return false;
      for (let i = 0; i < degrees.length; i++){
        if (degrees[i] === 1 || degrees[i] > 2) return false;
      }
      let start = degrees.findIndex(v => v > 0);
      if (start === -1) return false;
      const visited = new Array(vertexCount).fill(false);
      const stack = [start];
      visited[start] = true;
      while (stack.length){
        const v = stack.pop();
        for (const next of adjacency[v]){
          if (!visited[next]){
            visited[next] = true;
            stack.push(next);
          }
        }
      }
      for (let i = 0; i < degrees.length; i++){
        if (degrees[i] > 0 && !visited[i]){
          return false;
        }
      }

      if (!rewardGiven){
        solved = true;
        rewardGiven = true;
        const reward = difficultyMap[currentDifficulty]?.xp || 120;
        if (typeof awardXp === 'function'){
          try { awardXp(reward); } catch {}
        }
        status.textContent = text('.status.solved', `完全なループ！ +${reward}EXP`);
      }
      return true;
    }

    function refreshPuzzle(){
      currentPuzzle = pickPuzzle(currentDifficulty);
      solved = false;
      rewardGiven = false;
      status.textContent = text('.status.new', '新しい盤面を読み込みました。');
      rebuildBoard();
      updateClues();
      updateInfo();
    }

    function resetBoard(){
      if (!currentPuzzle) return;
      const { width, height } = currentPuzzle;
      for (let y = 0; y <= height; y++){
        for (let x = 0; x < width; x++){
          hState[y][x] = 0;
          updateEdgeVisual('h', y, x);
        }
      }
      for (let y = 0; y < height; y++){
        for (let x = 0; x <= width; x++){
          vState[y][x] = 0;
          updateEdgeVisual('v', y, x);
        }
      }
      solved = false;
      rewardGiven = false;
      status.textContent = text('.status.reset', '盤面をリセットしました。');
      updateClues();
      updateInfo();
    }

    difficultySelect.addEventListener('change', () => {
      const next = difficultySelect.value;
      if (difficultyMap[next]){
        currentDifficulty = next;
        refreshPuzzle();
      }
    });

    newButton.addEventListener('click', () => {
      refreshPuzzle();
    });

    resetButton.addEventListener('click', () => {
      resetBoard();
    });

    refreshPuzzle();

    return {
      destroy(){
        wrapper.remove();
      }
    };
  }

  if (typeof window !== 'undefined' && typeof window.registerMiniGame === 'function'){
    window.registerMiniGame({
      id: 'slitherlink',
      name: 'スリザーリンク',
      nameKey: 'selection.miniexp.games.slitherlink.name',
      description: '数字に沿って線を引いて閉じたループを完成させよう。完成時に難易度別EXPを授与',
      descriptionKey: 'selection.miniexp.games.slitherlink.description',
      categoryIds: ['puzzle'],
      categories: ['パズル'],
      create
    });
  }
})();

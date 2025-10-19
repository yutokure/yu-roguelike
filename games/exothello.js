(function(){
  const EMPTY = 0;
  const BLACK = 1;
  const WHITE = -1;
  const WALL = 2;
  const DIRS = [
    [1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]
  ];

  const MODE_CONFIGS = [
    {
      id: 'normal',
      defaultSize: { width: 8, height: 8 },
      allowSizeChange: true,
      descriptionKey: 'miniexp.games.exothello.modes.normal',
      labelKey: 'miniexp.games.exothello.modes.normal.short',
      setup(state) {
        const width = clampSize(state.settings.width, 4, 32);
        const height = clampSize(state.settings.height, 4, 32);
        const board = createBoard(width, height, EMPTY);
        placeStandardOpening(board);
        return Promise.resolve({ board, victory: 'most' });
      }
    },
    {
      id: 'corner_walls',
      defaultSize: { width: 8, height: 8 },
      allowSizeChange: true,
      descriptionKey: 'miniexp.games.exothello.modes.cornerWalls',
      labelKey: 'miniexp.games.exothello.modes.cornerWalls.short',
      setup(state) {
        const width = clampSize(state.settings.width, 6, 32);
        const height = clampSize(state.settings.height, 6, 32);
        const board = createBoard(width, height, EMPTY);
        placeStandardOpening(board);
        board[0][0] = WALL;
        board[0][width-1] = WALL;
        board[height-1][0] = WALL;
        board[height-1][width-1] = WALL;
        return Promise.resolve({ board, victory: state.settings.victory });
      }
    },
    {
      id: 'least',
      defaultSize: { width: 8, height: 8 },
      allowSizeChange: true,
      descriptionKey: 'miniexp.games.exothello.modes.least',
      labelKey: 'miniexp.games.exothello.modes.least.short',
      setup(state) {
        const width = clampSize(state.settings.width, 6, 32);
        const height = clampSize(state.settings.height, 6, 32);
        const board = createBoard(width, height, EMPTY);
        placeStandardOpening(board);
        return Promise.resolve({ board, victory: 'least' });
      }
    },
    {
      id: 'river64',
      defaultSize: { width: 64, height: 32 },
      allowSizeChange: false,
      descriptionKey: 'miniexp.games.exothello.modes.river',
      labelKey: 'miniexp.games.exothello.modes.river.short',
      setup(){
        const width = 64;
        const height = 32;
        const board = createBoard(width, height, WALL);
        const channelWidth = 8;
        const margin = Math.floor((height - channelWidth) / 2);
        for (let y = margin; y < margin + channelWidth; y++){
          for (let x = 0; x < width; x++){
            board[y][x] = EMPTY;
          }
        }
        placeStandardOpening(board);
        return Promise.resolve({ board, victory: 'most' });
      }
    },
    {
      id: 'sandbox',
      defaultSize: { width: 8, height: 8 },
      allowSizeChange: true,
      descriptionKey: 'miniexp.games.exothello.modes.sandbox',
      labelKey: 'miniexp.games.exothello.modes.sandbox.short',
      setup(state){
        const width = clampSize(state.settings.width, 4, 32);
        const height = clampSize(state.settings.height, 4, 32);
        const board = createBoard(width, height, EMPTY);
        return Promise.resolve({ board, victory: state.settings.victory, sandbox: true });
      }
    },
    {
      id: 'dungeon',
      defaultSize: { width: 16, height: 16 },
      allowSizeChange: true,
      descriptionKey: 'miniexp.games.exothello.modes.dungeon',
      labelKey: 'miniexp.games.exothello.modes.dungeon.short',
      async setup(state){
        const dungeonApi = state.opts?.dungeon;
        const width = clampSize(state.settings.width, 8, 40);
        const height = clampSize(state.settings.height, 8, 40);
        if (!dungeonApi || typeof dungeonApi.generateStage !== 'function'){
          const board = createBoard(width, height, EMPTY);
          placeRandomWalls(board, Math.floor(width * height * 0.12));
          randomOpening(board);
          return { board, victory: state.settings.victory };
        }
        const generated = await dungeonApi.generateStage({
          type: 'mixed',
          tilesX: width,
          tilesY: height,
          tileSize: 18
        });
        const board = createBoard(width, height, WALL);
        const floors = [];
        for (let y = 0; y < height; y++){
          for (let x = 0; x < width; x++){
            const tile = generated?.tiles?.[y]?.[x];
            if (tile && tile.type !== 'wall'){
              board[y][x] = EMPTY;
              floors.push({ x, y });
            }
          }
        }
        if (floors.length === 0){
          for (let y = 0; y < height; y++){
            for (let x = 0; x < width; x++){
              board[y][x] = EMPTY;
            }
          }
        }
        randomOpening(board);
        return { board, victory: state.settings.victory };
      }
    }
  ];

  function clampSize(value, min, max){
    if (typeof value !== 'number' || Number.isNaN(value)) return min;
    return Math.min(Math.max(Math.floor(value), min), max);
  }

  function createBoard(width, height, fill){
    return Array.from({ length: height }, () => Array(width).fill(fill));
  }

  function placeStandardOpening(board){
    const height = board.length;
    const width = board[0].length;
    const midX = Math.floor(width / 2);
    const midY = Math.floor(height / 2);
    if (width < 2 || height < 2) return;
    board[midY-1]?.[midX-1] = WHITE;
    board[midY]?.[midX] = WHITE;
    board[midY-1]?.[midX] = BLACK;
    board[midY]?.[midX-1] = BLACK;
  }

  function placeRandomWalls(board, count){
    const height = board.length;
    const width = board[0].length;
    let placed = 0;
    while (placed < count){
      const x = (Math.random() * width) | 0;
      const y = (Math.random() * height) | 0;
      if (board[y][x] === EMPTY){
        board[y][x] = WALL;
        placed++;
      }
    }
  }

  function randomOpening(board){
    const height = board.length;
    const width = board[0].length;
    const emptyCells = [];
    for (let y = 0; y < height; y++){
      for (let x = 0; x < width; x++){
        if (board[y][x] === EMPTY){ emptyCells.push({ x, y }); }
      }
    }
    shuffle(emptyCells);
    const placements = emptyCells.slice(0, 4);
    for (const { x, y } of placements){
      board[y][x] = BLACK;
    }
    const placementsWhite = emptyCells.slice(4, 8);
    for (const { x, y } of placementsWhite){
      if (x != null && y != null) board[y][x] = WHITE;
    }
  }

  function shuffle(arr){
    for (let i = arr.length - 1; i > 0; i--){
      const j = (Math.random() * (i + 1)) | 0;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  function legalMoves(board, color){
    const height = board.length;
    const width = board[0].length;
    const moves = [];
    for (let y = 0; y < height; y++){
      for (let x = 0; x < width; x++){
        const flips = flipsAt(board, x, y, color);
        if (flips.length > 0){
          moves.push({ x, y, flips });
        }
      }
    }
    return moves;
  }

  function flipsAt(board, x, y, color){
    const height = board.length;
    const width = board[0].length;
    if (x < 0 || y < 0 || x >= width || y >= height) return [];
    if (board[y][x] !== EMPTY) return [];
    const flips = [];
    for (const [dx, dy] of DIRS){
      let cx = x + dx;
      let cy = y + dy;
      const line = [];
      while (cx >= 0 && cy >= 0 && cx < width && cy < height){
        const cell = board[cy][cx];
        if (cell === WALL || cell === EMPTY){
          line.length = 0;
          break;
        }
        if (cell === color){
          if (line.length > 0){ flips.push(...line); }
          break;
        }
        line.push([cx, cy]);
        cx += dx;
        cy += dy;
      }
    }
    return flips;
  }

  function applyMove(board, move, color){
    board[move.y][move.x] = color;
    for (const [fx, fy] of move.flips){
      board[fy][fx] = color;
    }
  }

  function countPieces(board){
    const counts = { black: 0, white: 0, empty: 0, wall: 0 };
    for (const row of board){
      for (const cell of row){
        if (cell === BLACK) counts.black++;
        else if (cell === WHITE) counts.white++;
        else if (cell === EMPTY) counts.empty++;
        else if (cell === WALL) counts.wall++;
      }
    }
    return counts;
  }

  function createWeights(width, height){
    const weights = Array.from({ length: height }, () => Array(width).fill(4));
    const maxEdge = Math.max(width, height);
    const edgeBonus = Math.max(6, Math.floor(maxEdge / 3));
    const cornerBonus = edgeBonus * 4;
    for (let y = 0; y < height; y++){
      for (let x = 0; x < width; x++){
        let value = 2;
        const minDistX = Math.min(x, width - 1 - x);
        const minDistY = Math.min(y, height - 1 - y);
        const dist = Math.min(minDistX, minDistY);
        value += dist;
        if (x === 0 || y === 0 || x === width - 1 || y === height - 1){
          value += edgeBonus;
        }
        if ((x === 0 || x === width - 1) && (y === 0 || y === height - 1)){
          value += cornerBonus;
        }
        if (minDistX <= 1 && minDistY <= 1 && dist === 0){
          value -= Math.floor(edgeBonus / 2);
        }
        weights[y][x] = value;
      }
    }
    return weights;
  }

  function evaluateBoard(board, weights, victoryCondition){
    const counts = { black: 0, white: 0 };
    let score = 0;
    for (let y = 0; y < board.length; y++){
      for (let x = 0; x < board[0].length; x++){
        const cell = board[y][x];
        if (cell === WHITE){
          score += weights[y][x];
          counts.white++;
        } else if (cell === BLACK){
          score -= weights[y][x];
          counts.black++;
        }
      }
    }
    const diff = counts.white - counts.black;
    const diffWeight = victoryCondition === 'least' ? -3 : 3;
    score += diff * diffWeight;
    return score;
  }

  function cloneBoard(board){
    return board.map(row => row.slice());
  }

  function minimax(board, depth, isWhiteTurn, weights, victoryCondition, alpha, beta){
    if (depth === 0){
      return evaluateBoard(board, weights, victoryCondition);
    }
    const color = isWhiteTurn ? WHITE : BLACK;
    const moves = legalMoves(board, color);
    if (moves.length === 0){
      const other = legalMoves(board, -color);
      if (other.length === 0){
        return evaluateBoard(board, weights, victoryCondition);
      }
      return minimax(board, depth - 1, !isWhiteTurn, weights, victoryCondition, alpha, beta);
    }
    if (isWhiteTurn){
      let best = -Infinity;
      for (const mv of moves){
        const next = cloneBoard(board);
        applyMove(next, mv, WHITE);
        const val = minimax(next, depth - 1, false, weights, victoryCondition, alpha, beta);
        best = Math.max(best, val);
        alpha = Math.max(alpha, val);
        if (beta <= alpha) break;
      }
      return best;
    }
    let best = Infinity;
    for (const mv of moves){
      const next = cloneBoard(board);
      applyMove(next, mv, BLACK);
      const val = minimax(next, depth - 1, true, weights, victoryCondition, alpha, beta);
      best = Math.min(best, val);
      beta = Math.min(beta, val);
      if (beta <= alpha) break;
    }
    return best;
  }

  function pickAIMove(board, weights, victoryCondition, difficulty){
    const moves = legalMoves(board, WHITE);
    if (moves.length === 0) return null;
    const maxDim = Math.max(board.length, board[0].length);
    const baseDepth = difficulty === 'HARD' ? 3 : difficulty === 'NORMAL' ? 2 : 1;
    const depth = Math.max(1, Math.min(baseDepth, Math.floor(12 / Math.log2(maxDim + 2))));
    let bestMove = moves[0];
    let bestScore = -Infinity;
    for (const mv of moves){
      const next = cloneBoard(board);
      applyMove(next, mv, WHITE);
      const score = minimax(next, depth - 1, false, weights, victoryCondition, -Infinity, Infinity);
      if (score > bestScore){
        bestScore = score;
        bestMove = mv;
      }
    }
    return bestMove;
  }

  function create(root, awardXp, opts){
    const localization = (opts && opts.localization) || (typeof window !== 'undefined' && typeof window.createMiniGameLocalization
      === 'function'
      ? window.createMiniGameLocalization({ id: 'exothello' })
      : null);
    const formatText = (value, params) => {
      if (!params || typeof value !== 'string') return value;
      let formatted = value;
      if (Object.prototype.hasOwnProperty.call(params, 'value')){
        const replaceValue = params.value ?? '';
        formatted = formatted.replace(/\$\{0\}/g, String(replaceValue));
      }
      for (const keyParam of Object.keys(params)){
        const replaceValue = params[keyParam] ?? '';
        const pattern = new RegExp(`\\$\\{${keyParam}\\}`, 'g');
        formatted = formatted.replace(pattern, String(replaceValue));
      }
      return formatted;
    };
    const text = (key, fallback, params) => {
      if (localization && typeof localization.t === 'function'){
        const localized = localization.t(key, fallback, params);
        if (typeof localized === 'string'){
          return formatText(localized, params);
        }
        return localized;
      }
      if (typeof fallback === 'function') return fallback();
      if (typeof fallback === 'string'){
        return formatText(fallback, params) ?? '';
      }
      return fallback ?? '';
    };
    const detachLocale = localization && typeof localization.onChange === 'function'
      ? localization.onChange(() => { try { draw(); } catch {} })
      : null;

    const wrapper = document.createElement('div');
    wrapper.className = 'exothello-wrapper';
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.alignItems = 'stretch';
    wrapper.style.gap = '12px';
    wrapper.style.maxWidth = '960px';
    wrapper.style.margin = '0 auto';
    root.appendChild(wrapper);

    const controlPanel = document.createElement('div');
    controlPanel.style.display = 'flex';
    controlPanel.style.flexWrap = 'wrap';
    controlPanel.style.gap = '8px';
    controlPanel.style.alignItems = 'flex-end';
    wrapper.appendChild(controlPanel);

    const modeSelect = document.createElement('select');
    modeSelect.style.flex = '1 1 180px';
    for (const mode of MODE_CONFIGS){
      const option = document.createElement('option');
      option.value = mode.id;
      option.textContent = text(mode.labelKey, mode.id);
      modeSelect.appendChild(option);
    }
    controlPanel.appendChild(labeled(text('miniexp.games.exothello.controls.mode', 'Mode'), modeSelect));

    const widthInput = document.createElement('input');
    widthInput.type = 'number';
    widthInput.min = '4';
    widthInput.max = '64';
    widthInput.value = '8';
    widthInput.style.width = '72px';
    const heightInput = document.createElement('input');
    heightInput.type = 'number';
    heightInput.min = '4';
    heightInput.max = '64';
    heightInput.value = '8';
    heightInput.style.width = '72px';
    const sizeContainer = document.createElement('div');
    sizeContainer.style.display = 'flex';
    sizeContainer.style.gap = '4px';
    sizeContainer.style.alignItems = 'center';
    sizeContainer.appendChild(widthInput);
    const mul = document.createElement('span');
    mul.textContent = '×';
    sizeContainer.appendChild(mul);
    sizeContainer.appendChild(heightInput);
    controlPanel.appendChild(labeled(text('miniexp.games.exothello.controls.size', 'Size'), sizeContainer));

    const victorySelect = document.createElement('select');
    victorySelect.appendChild(new Option(text('miniexp.games.exothello.controls.victoryMost', 'Most discs'), 'most'));
    victorySelect.appendChild(new Option(text('miniexp.games.exothello.controls.victoryLeast', 'Least discs'), 'least'));
    controlPanel.appendChild(labeled(text('miniexp.games.exothello.controls.victoryLabel', 'Victory'), victorySelect));

    const difficultySelect = document.createElement('select');
    difficultySelect.appendChild(new Option(text('miniexp.games.exothello.controls.difficultyEasy', 'Easy'), 'EASY'));
    difficultySelect.appendChild(new Option(text('miniexp.games.exothello.controls.difficultyNormal', 'Normal'), 'NORMAL'));
    difficultySelect.appendChild(new Option(text('miniexp.games.exothello.controls.difficultyHard', 'Hard'), 'HARD'));
    controlPanel.appendChild(labeled(text('miniexp.games.exothello.controls.difficultyLabel', 'Difficulty'), difficultySelect));

    const startButton = document.createElement('button');
    startButton.textContent = text('miniexp.games.exothello.controls.start', 'Start Game');
    startButton.style.padding = '8px 16px';
    startButton.style.cursor = 'pointer';
    controlPanel.appendChild(startButton);

    const resetButton = document.createElement('button');
    resetButton.textContent = text('miniexp.games.exothello.controls.reset', 'Reset');
    resetButton.style.padding = '8px 12px';
    resetButton.style.cursor = 'pointer';
    resetButton.disabled = true;
    controlPanel.appendChild(resetButton);

    const statusBox = document.createElement('div');
    statusBox.style.minHeight = '24px';
    statusBox.style.fontSize = '14px';
    wrapper.appendChild(statusBox);

    const canvas = document.createElement('canvas');
    canvas.style.borderRadius = '8px';
    canvas.style.background = '#0b6623';
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    canvas.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
    wrapper.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const infoBox = document.createElement('div');
    infoBox.style.fontSize = '13px';
    infoBox.style.textAlign = 'center';
    wrapper.appendChild(infoBox);

    const state = {
      opts,
      board: createBoard(8, 8, EMPTY),
      weights: createWeights(8, 8),
      turn: BLACK,
      running: false,
      ended: false,
      sandboxEditing: false,
      lastMove: null,
      legal: [],
      settings: { width: 8, height: 8, victory: 'most' },
      modeId: 'normal',
      difficulty: 'NORMAL',
      victory: 'most'
    };

    function labeled(labelText, element){
      const wrapper = document.createElement('label');
      wrapper.style.display = 'flex';
      wrapper.style.flexDirection = 'column';
      wrapper.style.fontSize = '12px';
      wrapper.style.gap = '4px';
      const span = document.createElement('span');
      span.textContent = labelText;
      wrapper.appendChild(span);
      wrapper.appendChild(element);
      return wrapper;
    }

    function syncControlsWithMode(){
      const mode = MODE_CONFIGS.find(m => m.id === state.modeId) || MODE_CONFIGS[0];
      const sizeDisabled = !mode.allowSizeChange;
      widthInput.disabled = sizeDisabled;
      heightInput.disabled = sizeDisabled;
      if (sizeDisabled){
        widthInput.value = mode.defaultSize.width;
        heightInput.value = mode.defaultSize.height;
      }
      if (mode.id === 'least'){
        victorySelect.value = 'least';
      }
      victorySelect.disabled = mode.id === 'least';
      if (mode.id === 'sandbox'){
        statusBox.textContent = text('miniexp.games.exothello.status.sandboxHint', 'Sandbox: click cells to cycle Empty → Black → White → Wall. Start when ready.');
      } else {
        statusBox.textContent = text(mode.descriptionKey, '');
      }
    }

    function setStatus(key, fallback){
      statusBox.textContent = text(key, fallback);
    }

    function updateSettingsFromControls(){
      state.modeId = modeSelect.value;
      state.settings.width = parseInt(widthInput.value, 10) || 8;
      state.settings.height = parseInt(heightInput.value, 10) || 8;
      state.settings.victory = victorySelect.value === 'least' ? 'least' : 'most';
      state.difficulty = difficultySelect.value;
    }

    function updateLegalMoves(){
      if (!state.running || state.ended){
        state.legal = [];
        return;
      }
      if (state.turn === BLACK){
        state.legal = legalMoves(state.board, BLACK);
      } else {
        state.legal = [];
      }
    }

    function resizeCanvas(){
      const width = state.board[0].length;
      const height = state.board.length;
      const maxPixel = 640;
      const size = Math.max(6, Math.floor(Math.min(maxPixel / width, maxPixel / height)));
      canvas.width = width * size;
      canvas.height = height * size;
      canvas.style.width = canvas.width + 'px';
      canvas.style.height = canvas.height + 'px';
      draw();
    }

    function draw(){
      if (!ctx) return;
      const width = state.board[0].length;
      const height = state.board.length;
      const cellSize = canvas.width / width;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0b6623';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(0,0,0,0.35)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= width; x++){
        ctx.beginPath();
        ctx.moveTo(x * cellSize + 0.5, 0);
        ctx.lineTo(x * cellSize + 0.5, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y++){
        ctx.beginPath();
        ctx.moveTo(0, y * cellSize + 0.5);
        ctx.lineTo(canvas.width, y * cellSize + 0.5);
        ctx.stroke();
      }
      const legalSet = new Set(state.legal.map(mv => `${mv.x},${mv.y}`));
      for (let y = 0; y < height; y++){
        for (let x = 0; x < width; x++){
          const cell = state.board[y][x];
          const px = x * cellSize;
          const py = y * cellSize;
          if (cell === WALL){
            ctx.fillStyle = '#2d2d2d';
            ctx.fillRect(px, py, cellSize, cellSize);
            ctx.strokeStyle = '#555';
            ctx.strokeRect(px + 1, py + 1, cellSize - 2, cellSize - 2);
            continue;
          }
          if (legalSet.has(`${x},${y}`) && state.turn === BLACK && state.running){
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.arc(px + cellSize / 2, py + cellSize / 2, cellSize * 0.28, 0, Math.PI * 2);
            ctx.fill();
          }
          if (cell === EMPTY) continue;
          ctx.beginPath();
          ctx.fillStyle = cell === BLACK ? '#111' : '#f5f5f5';
          ctx.strokeStyle = '#000';
          ctx.lineWidth = cellSize * 0.05;
          ctx.arc(px + cellSize / 2, py + cellSize / 2, cellSize * 0.38, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          if (state.lastMove && state.lastMove.x === x && state.lastMove.y === y){
            ctx.beginPath();
            ctx.strokeStyle = '#ffde59';
            ctx.lineWidth = cellSize * 0.07;
            ctx.arc(px + cellSize / 2, py + cellSize / 2, cellSize * 0.18, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }
      const counts = countPieces(state.board);
      const turnText = state.ended ? text('miniexp.games.exothello.turn.ended', 'Game over')
        : state.turn === BLACK
          ? text('miniexp.games.exothello.turn.player', 'Your turn')
          : text('miniexp.games.exothello.turn.ai', 'AI thinking');
      const victoryKey = state.victory === 'least'
        ? 'miniexp.games.exothello.victoryCondition.least'
        : 'miniexp.games.exothello.victoryCondition.most';
      const countsText = `${text('miniexp.games.exothello.counts.black', 'Black: ${0}', { value: counts.black })}` +
        ` · ${text('miniexp.games.exothello.counts.white', 'White: ${0}', { value: counts.white })}`;
      infoBox.textContent = `${turnText} / ${text(victoryKey, state.victory)} · ${countsText}`;
    }

    function findMove(x, y){
      return state.legal.find(mv => mv.x === x && mv.y === y) || null;
    }

    function handleCanvasClick(event){
      const rect = canvas.getBoundingClientRect();
      const width = state.board[0].length;
      const height = state.board.length;
      const cellSizeX = canvas.width / width;
      const cellSizeY = canvas.height / height;
      const x = Math.floor((event.clientX - rect.left) / cellSizeX);
      const y = Math.floor((event.clientY - rect.top) / cellSizeY);
      if (x < 0 || y < 0 || x >= width || y >= height) return;
      if (state.sandboxEditing){
        const current = state.board[y][x];
        let next = EMPTY;
        if (current === EMPTY) next = BLACK;
        else if (current === BLACK) next = WHITE;
        else if (current === WHITE) next = WALL;
        else next = EMPTY;
        state.board[y][x] = next;
        draw();
        return;
      }
      if (!state.running || state.turn !== BLACK || state.ended) return;
      const mv = findMove(x, y);
      if (!mv) return;
      applyMove(state.board, mv, BLACK);
      state.lastMove = { x, y, color: BLACK };
      state.turn = WHITE;
      updateLegalMoves();
      draw();
      setTimeout(() => {
        processAIMove();
      }, 150);
    }

    function processAIMove(){
      if (state.ended || !state.running || state.turn !== WHITE) return;
      const moves = legalMoves(state.board, WHITE);
      if (moves.length === 0){
        state.turn = BLACK;
        updateLegalMoves();
        checkEnd();
        draw();
        checkEnd();
        return;
      }
      const move = pickAIMove(state.board, state.weights, state.victory, state.difficulty);
      if (!move){
        state.turn = BLACK;
        updateLegalMoves();
        draw();
        checkEnd();
        return;
      }
      applyMove(state.board, move, WHITE);
      state.lastMove = { x: move.x, y: move.y, color: WHITE };
      state.turn = BLACK;
      updateLegalMoves();
      draw();
      checkEnd();
    }

    function checkEnd(){
      const playerMoves = legalMoves(state.board, BLACK);
      const aiMoves = legalMoves(state.board, WHITE);
      if (playerMoves.length === 0 && aiMoves.length === 0){
        state.ended = true;
        state.running = false;
        const counts = countPieces(state.board);
        const playerScore = counts.black;
        const aiScore = counts.white;
        let playerWins;
        if (state.victory === 'least'){
          playerWins = playerScore < aiScore;
        } else {
          playerWins = playerScore > aiScore;
        }
        const resultKey = playerWins
          ? 'miniexp.games.exothello.result.win'
          : playerScore === aiScore
            ? 'miniexp.games.exothello.result.draw'
            : 'miniexp.games.exothello.result.lose';
        setStatus(resultKey, playerWins ? 'You win!' : playerScore === aiScore ? 'Draw' : 'You lose');
        const baseXp = Math.max(80, Math.floor(state.board.length * state.board[0].length / 4));
        const difficultyBonus = state.difficulty === 'HARD' ? 2 : state.difficulty === 'NORMAL' ? 1.4 : 1;
        const victoryBonus = state.victory === 'least' ? 1.5 : 1;
        if (playerWins){
          awardXp(Math.floor(baseXp * difficultyBonus * victoryBonus), { reason: 'win', gameId: 'exothello', mode: state.modeId });
        } else if (playerScore === aiScore){
          awardXp(Math.floor(baseXp * 0.3), { reason: 'draw', gameId: 'exothello', mode: state.modeId });
        }
        resetButton.disabled = false;
        draw();
      } else if (playerMoves.length === 0){
        state.turn = WHITE;
        setStatus('miniexp.games.exothello.status.pass', 'No moves. Turn passes.');
        setTimeout(() => processAIMove(), 160);
      } else {
        setStatus('miniexp.games.exothello.status.continue', 'Game in progress');
        state.turn = BLACK;
        updateLegalMoves();
        draw();
      }
    }

    async function startGame(){
      updateSettingsFromControls();
      const mode = MODE_CONFIGS.find(m => m.id === state.modeId) || MODE_CONFIGS[0];
      state.running = false;
      state.ended = false;
      state.sandboxEditing = false;
      setStatus('miniexp.games.exothello.status.preparing', 'Preparing board...');
      try {
        const setupResult = await mode.setup(state);
        state.board = setupResult.board;
        state.victory = setupResult.victory || state.settings.victory || 'most';
        state.weights = createWeights(state.board[0].length, state.board.length);
        state.turn = BLACK;
        state.lastMove = null;
        state.running = true;
        state.ended = false;
        state.sandboxEditing = !!setupResult.sandbox;
        if (state.sandboxEditing){
          state.running = false;
          setStatus('miniexp.games.exothello.status.sandboxEditing', 'Sandbox editing: click cells to change. Start again when done.');
        } else {
          setStatus(mode.descriptionKey, '');
        }
        state.modeId = mode.id;
        state.difficulty = difficultySelect.value;
        state.settings.victory = state.victory;
        state.legal = [];
        resizeCanvas();
        updateLegalMoves();
        checkEnd();
        draw();
        resetButton.disabled = false;
        if (state.sandboxEditing){
          state.running = false;
        }
      } catch (error){
        console.error('[exothello] Failed to prepare mode', error);
        setStatus('miniexp.games.exothello.status.error', 'Failed to prepare board.');
      }
    }

    function resetGame(){
      state.running = false;
      state.ended = false;
      state.board = createBoard(8, 8, EMPTY);
      placeStandardOpening(state.board);
      state.weights = createWeights(8, 8);
      state.turn = BLACK;
      state.victory = 'most';
      state.lastMove = null;
      state.legal = [];
      state.sandboxEditing = false;
      widthInput.value = '8';
      heightInput.value = '8';
      victorySelect.value = 'most';
      difficultySelect.value = 'NORMAL';
      modeSelect.value = 'normal';
      resetButton.disabled = true;
      setStatus('miniexp.games.exothello.status.reset', 'Select a mode to begin.');
      resizeCanvas();
      draw();
    }

    function confirmSandboxAndStart(){
      if (!state.sandboxEditing) return;
      if (!legalMoves(state.board, BLACK).length && !legalMoves(state.board, WHITE).length){
        setStatus('miniexp.games.exothello.status.invalidSandbox', 'No possible moves for either side. Edit again.');
        return;
      }
      state.sandboxEditing = false;
      state.running = true;
      state.turn = BLACK;
      setStatus('miniexp.games.exothello.status.continue', 'Game in progress');
      updateLegalMoves();
      checkEnd();
      draw();
    }

    const handleStartClick = () => {
      if (state.sandboxEditing){
        confirmSandboxAndStart();
      } else {
        startGame();
      }
    };
    const handleModeChange = () => {
      updateSettingsFromControls();
      syncControlsWithMode();
    };
    startButton.addEventListener('click', handleStartClick);
    resetButton.addEventListener('click', resetGame);
    modeSelect.addEventListener('change', handleModeChange);
    widthInput.addEventListener('change', updateSettingsFromControls);
    heightInput.addEventListener('change', updateSettingsFromControls);
    victorySelect.addEventListener('change', updateSettingsFromControls);
    difficultySelect.addEventListener('change', updateSettingsFromControls);
    canvas.addEventListener('click', handleCanvasClick);

    syncControlsWithMode();
    resizeCanvas();
    draw();
    setStatus('miniexp.games.exothello.status.ready', 'Choose a mode and press Start.');

    return {
      destroy(){
        try { canvas.removeEventListener('click', handleCanvasClick); } catch {}
        try { startButton.removeEventListener('click', handleStartClick); } catch {}
        try { resetButton.removeEventListener('click', resetGame); } catch {}
        try { modeSelect.removeEventListener('change', handleModeChange); } catch {}
        try { widthInput.removeEventListener('change', updateSettingsFromControls); } catch {}
        try { heightInput.removeEventListener('change', updateSettingsFromControls); } catch {}
        try { victorySelect.removeEventListener('change', updateSettingsFromControls); } catch {}
        try { difficultySelect.removeEventListener('change', updateSettingsFromControls); } catch {}
        if (detachLocale){
          try { detachLocale(); } catch (error){ console.warn('[exothello] Failed to detach locale listener', error); }
        }
        try { root.removeChild(wrapper); } catch {}
      }
    };
  }

  if (typeof window !== 'undefined' && typeof window.registerMiniGame === 'function'){
    window.registerMiniGame('exothello', create, {
      category: 'board',
      name: 'Ex-Othello',
      author: 'AI Generated',
      icon: '🀄'
    });
  }

  if (typeof module !== 'undefined'){
    module.exports = { create };
  }
})();

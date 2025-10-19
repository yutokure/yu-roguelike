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
          placeClusterOpening(board);
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
        placeClusterOpening(board, { floors });
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
    const upperRow = board[midY - 1];
    const lowerRow = board[midY];

    if (upperRow){
      if (midX - 1 >= 0 && midX - 1 < upperRow.length) upperRow[midX - 1] = WHITE;
      if (midX >= 0 && midX < upperRow.length) upperRow[midX] = BLACK;
    }

    if (lowerRow){
      if (midX >= 0 && midX < lowerRow.length) lowerRow[midX] = WHITE;
      if (midX - 1 >= 0 && midX - 1 < lowerRow.length) lowerRow[midX - 1] = BLACK;
    }
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

  function placeClusterOpening(board, options = {}){
    const height = board.length;
    const width = board[0].length;
    const origins = [];
    const allowedOrigins = Array.isArray(options.floors) && options.floors.length
      ? options.floors
      : null;
    const tryPushOrigin = (x, y) => {
      if (x < 0 || y < 0 || x + 1 >= width || y + 1 >= height) return;
      const cells = [
        board[y][x], board[y][x + 1],
        board[y + 1][x], board[y + 1][x + 1]
      ];
      if (cells.every(cell => cell === EMPTY)){
        origins.push({ x, y });
      }
    };
    if (allowedOrigins){
      for (const { x, y } of allowedOrigins){
        tryPushOrigin(x, y);
      }
    }
    if (!origins.length){
      for (let y = 0; y < height - 1; y++){
        for (let x = 0; x < width - 1; x++){
          tryPushOrigin(x, y);
        }
      }
    }
    shuffle(origins);
    const origin = origins[0];
    if (!origin){
      placeStandardOpening(board);
      return;
    }
    const { x, y } = origin;
    board[y][x] = WHITE;
    board[y][x + 1] = BLACK;
    board[y + 1][x] = BLACK;
    board[y + 1][x + 1] = WHITE;
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

  function evaluateBoardForColor(board, weights, victoryCondition, color){
    const baseScore = evaluateBoard(board, weights, victoryCondition);
    return color === WHITE ? baseScore : -baseScore;
  }

  function cloneBoard(board){
    return board.map(row => row.slice());
  }

  function minimax(board, depth, currentColor, maximizingColor, weights, victoryCondition, alpha, beta){
    if (depth === 0){
      return evaluateBoardForColor(board, weights, victoryCondition, maximizingColor);
    }
    const moves = legalMoves(board, currentColor);
    if (moves.length === 0){
      const other = legalMoves(board, -currentColor);
      if (other.length === 0){
        return evaluateBoardForColor(board, weights, victoryCondition, maximizingColor);
      }
      return minimax(board, depth - 1, -currentColor, maximizingColor, weights, victoryCondition, alpha, beta);
    }
    if (currentColor === maximizingColor){
      let best = -Infinity;
      for (const mv of moves){
        const next = cloneBoard(board);
        applyMove(next, mv, currentColor);
        const val = minimax(next, depth - 1, -currentColor, maximizingColor, weights, victoryCondition, alpha, beta);
        best = Math.max(best, val);
        alpha = Math.max(alpha, val);
        if (beta <= alpha) break;
      }
      return best;
    }
    let best = Infinity;
    for (const mv of moves){
      const next = cloneBoard(board);
      applyMove(next, mv, currentColor);
      const val = minimax(next, depth - 1, -currentColor, maximizingColor, weights, victoryCondition, alpha, beta);
      best = Math.min(best, val);
      beta = Math.min(beta, val);
      if (beta <= alpha) break;
    }
    return best;
  }

  function pickAIMove(board, weights, victoryCondition, difficulty, aiColor){
    const moves = legalMoves(board, aiColor);
    if (moves.length === 0) return null;
    const maxDim = Math.max(board.length, board[0].length);
    const baseDepth = difficulty === 'HARD' ? 3 : difficulty === 'NORMAL' ? 2 : 1;
    const depth = Math.max(1, Math.min(baseDepth, Math.floor(12 / Math.log2(maxDim + 2))));
    let bestMove = moves[0];
    let bestScore = -Infinity;
    for (const mv of moves){
      const next = cloneBoard(board);
      applyMove(next, mv, aiColor);
      const score = minimax(next, depth - 1, -aiColor, aiColor, weights, victoryCondition, -Infinity, Infinity);
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
    wrapper.style.gap = '16px';
    wrapper.style.maxWidth = '960px';
    wrapper.style.margin = '0 auto';
    wrapper.style.padding = '16px 24px 32px';
    root.appendChild(wrapper);

    const heading = document.createElement('div');
    heading.textContent = text('miniexp.games.exothello.title', 'Ex-Othello');
    heading.style.fontSize = '24px';
    heading.style.fontWeight = '600';
    heading.style.textAlign = 'center';
    heading.style.color = '#0d301a';
    wrapper.appendChild(heading);

    const controlPanel = document.createElement('div');
    controlPanel.style.display = 'flex';
    controlPanel.style.flexWrap = 'wrap';
    controlPanel.style.gap = '12px';
    controlPanel.style.alignItems = 'flex-end';
    controlPanel.style.background = 'linear-gradient(135deg, rgba(11,102,35,0.08), rgba(11,102,35,0.16))';
    controlPanel.style.padding = '16px';
    controlPanel.style.borderRadius = '12px';
    controlPanel.style.boxShadow = '0 6px 18px rgba(0,0,0,0.12)';
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

    const playerColorSelect = document.createElement('select');
    playerColorSelect.appendChild(new Option(text('miniexp.games.exothello.controls.playerBlack', 'Play Black (First)'), 'black'));
    playerColorSelect.appendChild(new Option(text('miniexp.games.exothello.controls.playerWhite', 'Play White (Second)'), 'white'));
    controlPanel.appendChild(labeled(text('miniexp.games.exothello.controls.playerColor', 'Turn Order'), playerColorSelect));

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
    statusBox.style.minHeight = '28px';
    statusBox.style.fontSize = '14px';
    statusBox.style.padding = '10px 14px';
    statusBox.style.borderRadius = '10px';
    statusBox.style.background = 'rgba(13, 48, 26, 0.08)';
    wrapper.appendChild(statusBox);

    const boardContainer = document.createElement('div');
    boardContainer.style.padding = '16px';
    boardContainer.style.borderRadius = '16px';
    boardContainer.style.background = '#f2f8f1';
    boardContainer.style.boxShadow = '0 10px 22px rgba(0,0,0,0.18)';
    boardContainer.style.display = 'flex';
    boardContainer.style.justifyContent = 'center';
    boardContainer.style.alignItems = 'center';
    wrapper.appendChild(boardContainer);

    const canvas = document.createElement('canvas');
    canvas.style.borderRadius = '12px';
    canvas.style.background = '#0b6623';
    canvas.style.display = 'block';
    canvas.style.boxShadow = 'inset 0 0 18px rgba(0,0,0,0.35)';
    canvas.style.touchAction = 'none';
    boardContainer.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const infoBox = document.createElement('div');
    infoBox.style.fontSize = '13px';
    infoBox.style.textAlign = 'center';
    infoBox.style.fontWeight = '500';
    infoBox.style.padding = '6px 0 0';
    wrapper.appendChild(infoBox);

    const sandboxControls = document.createElement('div');
    sandboxControls.style.display = 'none';
    sandboxControls.style.flexDirection = 'column';
    sandboxControls.style.gap = '10px';
    sandboxControls.style.padding = '14px 18px';
    sandboxControls.style.borderRadius = '12px';
    sandboxControls.style.background = 'rgba(255,255,255,0.9)';
    sandboxControls.style.boxShadow = '0 8px 18px rgba(0,0,0,0.18)';
    sandboxControls.style.transition = 'opacity 120ms ease-out';
    wrapper.appendChild(sandboxControls);

    const sandboxModeLabel = document.createElement('div');
    sandboxModeLabel.textContent = text('miniexp.games.exothello.sandbox.modeLabel', 'Sandbox modes');
    sandboxModeLabel.style.fontSize = '12px';
    sandboxModeLabel.style.fontWeight = '600';
    sandboxControls.appendChild(sandboxModeLabel);

    const sandboxModeRow = document.createElement('div');
    sandboxModeRow.style.display = 'flex';
    sandboxModeRow.style.gap = '8px';
    sandboxControls.appendChild(sandboxModeRow);

    const sandboxEditButton = document.createElement('button');
    sandboxEditButton.type = 'button';
    sandboxEditButton.textContent = text('miniexp.games.exothello.sandbox.edit', 'Edit board');
    sandboxEditButton.style.padding = '6px 12px';
    sandboxEditButton.style.borderRadius = '8px';
    sandboxEditButton.style.border = '1px solid rgba(13,102,35,0.45)';
    sandboxEditButton.style.cursor = 'pointer';
    sandboxModeRow.appendChild(sandboxEditButton);

    const sandboxPlayButton = document.createElement('button');
    sandboxPlayButton.type = 'button';
    sandboxPlayButton.textContent = text('miniexp.games.exothello.sandbox.play', 'Play test');
    sandboxPlayButton.style.padding = '6px 12px';
    sandboxPlayButton.style.borderRadius = '8px';
    sandboxPlayButton.style.border = '1px solid rgba(13,102,35,0.45)';
    sandboxPlayButton.style.cursor = 'pointer';
    sandboxModeRow.appendChild(sandboxPlayButton);

    const sandboxPaletteLabel = document.createElement('div');
    sandboxPaletteLabel.textContent = text('miniexp.games.exothello.sandbox.paletteLabel', 'Paint tools');
    sandboxPaletteLabel.style.fontSize = '12px';
    sandboxPaletteLabel.style.fontWeight = '600';
    sandboxControls.appendChild(sandboxPaletteLabel);

    const sandboxPaletteRow = document.createElement('div');
    sandboxPaletteRow.style.display = 'flex';
    sandboxPaletteRow.style.gap = '8px';
    sandboxPaletteRow.style.flexWrap = 'wrap';
    sandboxControls.appendChild(sandboxPaletteRow);

    const sandboxToolButtons = new Map();
    const sandboxTools = [
      { id: 'empty', label: text('miniexp.games.exothello.sandbox.tool.empty', 'Erase'), preview: '#d3e8d0' },
      { id: 'black', label: text('miniexp.games.exothello.sandbox.tool.black', 'Black stone'), preview: '#0f0f0f' },
      { id: 'white', label: text('miniexp.games.exothello.sandbox.tool.white', 'White stone'), preview: '#f5f5f5' },
      { id: 'wall', label: text('miniexp.games.exothello.sandbox.tool.wall', 'Wall'), preview: '#3a3a3a' }
    ];

    for (const tool of sandboxTools){
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = tool.label;
      button.dataset.tool = tool.id;
      button.style.display = 'flex';
      button.style.alignItems = 'center';
      button.style.gap = '6px';
      button.style.padding = '6px 10px';
      button.style.borderRadius = '20px';
      button.style.border = '1px solid rgba(13,102,35,0.35)';
      button.style.cursor = 'pointer';
      button.style.background = 'rgba(255,255,255,0.6)';
      const swatch = document.createElement('span');
      swatch.style.display = 'inline-block';
      swatch.style.width = '18px';
      swatch.style.height = '18px';
      swatch.style.borderRadius = tool.id === 'wall' ? '4px' : '50%';
      swatch.style.border = '1px solid rgba(0,0,0,0.4)';
      swatch.style.background = tool.preview;
      button.prepend(swatch);
      sandboxPaletteRow.appendChild(button);
      sandboxToolButtons.set(tool.id, button);
      button.addEventListener('click', () => {
        state.sandboxTool = tool.id;
        updateSandboxToolButtons();
      });
    }

    const state = {
      opts,
      board: createBoard(8, 8, EMPTY),
      weights: createWeights(8, 8),
      turn: BLACK,
      running: false,
      ended: false,
      isSandbox: false,
      sandboxMode: null,
      sandboxTool: 'black',
      isPainting: false,
      lastMove: null,
      legal: [],
      settings: { width: 8, height: 8, victory: 'most' },
      modeId: 'normal',
      difficulty: 'NORMAL',
      victory: 'most',
      playerColor: BLACK,
      aiColor: WHITE
    };

    const describeColor = color => color === BLACK
      ? text('miniexp.games.exothello.color.black', 'Black')
      : text('miniexp.games.exothello.color.white', 'White');

    function setButtonActive(button, active){
      if (!button) return;
      button.style.background = active ? 'rgba(11,102,35,0.85)' : 'rgba(255,255,255,0.6)';
      button.style.color = active ? '#f5fff5' : '#0b3418';
      button.style.boxShadow = active ? '0 0 0 2px rgba(255,255,255,0.5)' : 'none';
    }

    function updateSandboxToolButtons(){
      for (const [toolId, button] of sandboxToolButtons.entries()){
        setButtonActive(button, state.sandboxTool === toolId);
      }
    }

    function updateSandboxModeButtons(){
      setButtonActive(sandboxEditButton, state.sandboxMode === 'edit');
      setButtonActive(sandboxPlayButton, state.sandboxMode === 'play');
    }

    function updateSandboxControls(){
      if (state.isSandbox){
        sandboxControls.style.display = 'flex';
        sandboxControls.style.opacity = '1';
      } else {
        sandboxControls.style.display = 'none';
        return;
      }
      sandboxPaletteLabel.style.opacity = state.sandboxMode === 'edit' ? '1' : '0.75';
      sandboxPaletteRow.style.opacity = state.sandboxMode === 'edit' ? '1' : '0.55';
      sandboxPaletteRow.style.pointerEvents = state.sandboxMode === 'edit' ? 'auto' : 'none';
      updateSandboxToolButtons();
      updateSandboxModeButtons();
    }

    function isSandboxEditing(){
      return state.isSandbox && state.sandboxMode === 'edit';
    }

    function setSandboxMode(mode){
      if (!state.isSandbox) return;
      if (mode !== 'edit' && mode !== 'play') return;
      if (state.sandboxMode === mode) return;
      if (mode === 'edit'){
        state.sandboxMode = 'edit';
        state.running = false;
        state.ended = false;
        state.lastMove = null;
        state.legal = [];
        state.isPainting = false;
        setStatus('miniexp.games.exothello.status.sandboxEditing', 'Sandbox edit: choose a tool and drag to paint the board.');
        updateSandboxControls();
        draw();
        return;
      }
      const hasBlackMove = legalMoves(state.board, BLACK).length > 0;
      const hasWhiteMove = legalMoves(state.board, WHITE).length > 0;
      if (!hasBlackMove && !hasWhiteMove){
        setStatus('miniexp.games.exothello.status.invalidSandbox', 'No valid moves for either side. Edit again.');
        return;
      }
      state.sandboxMode = 'play';
      state.running = true;
      state.ended = false;
      state.lastMove = null;
      state.playerColor = playerColorSelect.value === 'white' ? WHITE : BLACK;
      state.aiColor = -state.playerColor;
      state.settings.victory = victorySelect.value === 'least' ? 'least' : 'most';
      state.victory = state.settings.victory;
      state.difficulty = difficultySelect.value;
      state.settings.width = state.board[0].length;
      state.settings.height = state.board.length;
      state.turn = state.playerColor;
      state.isPainting = false;
      updateSandboxControls();
      setStatus('miniexp.games.exothello.status.continue', 'Game in progress');
      updateLegalMoves();
      draw();
      checkEnd();
      if (!state.ended && state.turn === state.aiColor){
        setTimeout(() => processAIMove(), 160);
      }
    }

    function sandboxToolValue(){
      switch (state.sandboxTool){
      case 'black': return BLACK;
      case 'white': return WHITE;
      case 'wall': return WALL;
      default: return EMPTY;
      }
    }

    function paintSandboxCell(x, y){
      if (!isSandboxEditing()) return;
      const height = state.board.length;
      const width = state.board[0].length;
      if (x < 0 || y < 0 || x >= width || y >= height) return;
      const targetValue = sandboxToolValue();
      if (state.board[y][x] !== targetValue){
        state.board[y][x] = targetValue;
        state.lastMove = null;
        draw();
      }
    }

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
        statusBox.textContent = text('miniexp.games.exothello.status.sandboxHint', 'Sandbox: paint walls and stones in Edit mode, then switch to Play to test.');
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
      state.playerColor = playerColorSelect.value === 'white' ? WHITE : BLACK;
      state.aiColor = -state.playerColor;
      updateSandboxControls();
    }

    function updateLegalMoves(){
      if (!state.running || state.ended){
        state.legal = [];
        return;
      }
      if (state.turn === state.playerColor){
        state.legal = legalMoves(state.board, state.playerColor);
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
          if (legalSet.has(`${x},${y}`) && state.turn === state.playerColor && state.running){
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
      const playerScore = state.playerColor === BLACK ? counts.black : counts.white;
      const aiScore = state.aiColor === BLACK ? counts.black : counts.white;
      const isPlayerTurn = state.running && !state.ended && state.turn === state.playerColor;
      const isAiTurn = state.running && !state.ended && state.turn === state.aiColor;
      const turnText = state.ended
        ? text('miniexp.games.exothello.turn.ended', 'Game over')
        : isPlayerTurn
          ? text('miniexp.games.exothello.turn.player', 'Your turn')
          : isAiTurn
            ? text('miniexp.games.exothello.turn.ai', 'AI thinking')
            : text('miniexp.games.exothello.turn.waiting', 'Waiting');
      const victoryKey = state.victory === 'least'
        ? 'miniexp.games.exothello.victoryCondition.least'
        : 'miniexp.games.exothello.victoryCondition.most';
      const infoSegments = [
        turnText,
        text(victoryKey, state.victory),
        text('miniexp.games.exothello.info.player', 'You (${color}): ${count}', {
          color: describeColor(state.playerColor),
          count: playerScore
        }),
        text('miniexp.games.exothello.info.ai', 'AI (${color}): ${count}', {
          color: describeColor(state.aiColor),
          count: aiScore
        }),
        text('miniexp.games.exothello.info.totals', 'Totals — Black: ${black}, White: ${white}', {
          black: counts.black,
          white: counts.white
        })
      ];
      infoBox.textContent = infoSegments.join(' · ');
    }

    function findMove(x, y){
      return state.legal.find(mv => mv.x === x && mv.y === y) || null;
    }

    function getCellFromEvent(event){
      const rect = canvas.getBoundingClientRect();
      const width = state.board[0].length;
      const height = state.board.length;
      const cellSizeX = canvas.width / width;
      const cellSizeY = canvas.height / height;
      const x = Math.floor((event.clientX - rect.left) / cellSizeX);
      const y = Math.floor((event.clientY - rect.top) / cellSizeY);
      if (x < 0 || y < 0 || x >= width || y >= height) return null;
      return { x, y };
    }

    function handleCanvasClick(event){
      const cell = getCellFromEvent(event);
      if (!cell) return;
      if (isSandboxEditing()){
        paintSandboxCell(cell.x, cell.y);
        return;
      }
      if (!state.running || state.turn !== state.playerColor || state.ended) return;
      const mv = findMove(cell.x, cell.y);
      if (!mv) return;
      applyMove(state.board, mv, state.playerColor);
      state.lastMove = { x: cell.x, y: cell.y, color: state.playerColor };
      state.turn = state.aiColor;
      updateLegalMoves();
      draw();
      checkEnd();
      if (!state.ended){
        setTimeout(() => {
          processAIMove();
        }, 150);
      }
    }

    function handlePointerDown(event){
      if (!isSandboxEditing()) return;
      if (typeof event.button === 'number' && event.button !== 0) return;
      const cell = getCellFromEvent(event);
      if (!cell) return;
      state.isPainting = true;
      if (typeof event.pointerId === 'number' && typeof canvas.setPointerCapture === 'function'){
        try { canvas.setPointerCapture(event.pointerId); } catch {}
      }
      paintSandboxCell(cell.x, cell.y);
      event.preventDefault();
    }

    function handlePointerMove(event){
      if (!state.isPainting) return;
      const cell = getCellFromEvent(event);
      if (!cell) return;
      paintSandboxCell(cell.x, cell.y);
      event.preventDefault();
    }

    function stopPainting(event){
      if (event && typeof event.pointerId === 'number' && typeof canvas.releasePointerCapture === 'function'){
        try { canvas.releasePointerCapture(event.pointerId); } catch {}
      }
      state.isPainting = false;
    }

    function handleSandboxEditClick(){
      setSandboxMode('edit');
    }

    function handleSandboxPlayClick(){
      setSandboxMode('play');
    }

    function processAIMove(){
      if (state.ended || !state.running || state.turn !== state.aiColor) return;
      const moves = legalMoves(state.board, state.aiColor);
      if (moves.length === 0){
        state.turn = state.playerColor;
        updateLegalMoves();
        draw();
        checkEnd();
        return;
      }
      const move = pickAIMove(state.board, state.weights, state.victory, state.difficulty, state.aiColor);
      if (!move){
        state.turn = state.playerColor;
        updateLegalMoves();
        draw();
        checkEnd();
        return;
      }
      applyMove(state.board, move, state.aiColor);
      state.lastMove = { x: move.x, y: move.y, color: state.aiColor };
      state.turn = state.playerColor;
      updateLegalMoves();
      draw();
      checkEnd();
    }

    function checkEnd(){
      const playerMoves = legalMoves(state.board, state.playerColor);
      const aiMoves = legalMoves(state.board, state.aiColor);
      if (playerMoves.length === 0 && aiMoves.length === 0){
        state.ended = true;
        state.running = false;
        const counts = countPieces(state.board);
        const playerScore = state.playerColor === BLACK ? counts.black : counts.white;
        const aiScore = state.aiColor === BLACK ? counts.black : counts.white;
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
        return;
      }
      if (state.turn === state.playerColor && playerMoves.length === 0){
        state.turn = state.aiColor;
        updateLegalMoves();
        draw();
        setStatus('miniexp.games.exothello.status.pass', 'No moves. Turn passes.');
        setTimeout(() => processAIMove(), 160);
        return;
      }
      if (state.turn === state.aiColor && aiMoves.length === 0){
        state.turn = state.playerColor;
        updateLegalMoves();
        draw();
        setStatus('miniexp.games.exothello.status.pass', 'No moves. Turn passes.');
        return;
      }
      setStatus('miniexp.games.exothello.status.continue', 'Game in progress');
      updateLegalMoves();
      draw();
    }

    async function startGame(){
      updateSettingsFromControls();
      const mode = MODE_CONFIGS.find(m => m.id === state.modeId) || MODE_CONFIGS[0];
      state.running = false;
      state.ended = false;
      state.isSandbox = false;
      state.sandboxMode = null;
      state.isPainting = false;
      updateSandboxControls();
      setStatus('miniexp.games.exothello.status.preparing', 'Preparing board...');
      try {
        const setupResult = await mode.setup(state);
        state.board = setupResult.board;
        state.victory = setupResult.victory || state.settings.victory || 'most';
        state.weights = createWeights(state.board[0].length, state.board.length);
        state.turn = BLACK;
        state.lastMove = null;
        state.ended = false;
        state.modeId = mode.id;
        state.difficulty = difficultySelect.value;
        state.settings.victory = state.victory;
        state.legal = [];
        resizeCanvas();
        state.isSandbox = !!setupResult.sandbox;
        if (state.isSandbox){
          state.sandboxMode = 'edit';
          state.running = false;
          state.isPainting = false;
          state.sandboxTool = state.sandboxTool || 'black';
          setStatus('miniexp.games.exothello.status.sandboxEditing', 'Sandbox edit: choose a tool and drag to paint the board.');
          updateSandboxControls();
          draw();
        } else {
          state.running = true;
          setStatus(mode.descriptionKey, '');
          updateSandboxControls();
          updateLegalMoves();
          checkEnd();
          if (!state.ended && state.turn === state.aiColor){
            setTimeout(() => processAIMove(), 220);
          }
        }
        resetButton.disabled = false;
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
      state.isSandbox = false;
      state.sandboxMode = null;
      state.isPainting = false;
      state.sandboxTool = 'black';
      state.playerColor = BLACK;
      state.aiColor = WHITE;
      widthInput.value = '8';
      heightInput.value = '8';
      victorySelect.value = 'most';
      difficultySelect.value = 'NORMAL';
      modeSelect.value = 'normal';
      playerColorSelect.value = 'black';
      resetButton.disabled = true;
      setStatus('miniexp.games.exothello.status.reset', 'Select a mode to begin.');
      resizeCanvas();
      updateSandboxControls();
      draw();
    }

    const handleStartClick = () => {
      startGame();
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
    playerColorSelect.addEventListener('change', updateSettingsFromControls);
    sandboxEditButton.addEventListener('click', handleSandboxEditClick);
    sandboxPlayButton.addEventListener('click', handleSandboxPlayClick);
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', stopPainting);
    canvas.addEventListener('pointercancel', stopPainting);
    canvas.addEventListener('pointerleave', stopPainting);

    updateSettingsFromControls();
    syncControlsWithMode();
    resizeCanvas();
    draw();
    setStatus('miniexp.games.exothello.status.ready', 'Choose a mode and press Start.');

    return {
      destroy(){
        try { canvas.removeEventListener('click', handleCanvasClick); } catch {}
        try { canvas.removeEventListener('pointerdown', handlePointerDown); } catch {}
        try { canvas.removeEventListener('pointermove', handlePointerMove); } catch {}
        try { canvas.removeEventListener('pointerup', stopPainting); } catch {}
        try { canvas.removeEventListener('pointercancel', stopPainting); } catch {}
        try { canvas.removeEventListener('pointerleave', stopPainting); } catch {}
        try { startButton.removeEventListener('click', handleStartClick); } catch {}
        try { resetButton.removeEventListener('click', resetGame); } catch {}
        try { modeSelect.removeEventListener('change', handleModeChange); } catch {}
        try { widthInput.removeEventListener('change', updateSettingsFromControls); } catch {}
        try { heightInput.removeEventListener('change', updateSettingsFromControls); } catch {}
        try { victorySelect.removeEventListener('change', updateSettingsFromControls); } catch {}
        try { difficultySelect.removeEventListener('change', updateSettingsFromControls); } catch {}
        try { playerColorSelect.removeEventListener('change', updateSettingsFromControls); } catch {}
        try { sandboxEditButton.removeEventListener('click', handleSandboxEditClick); } catch {}
        try { sandboxPlayButton.removeEventListener('click', handleSandboxPlayClick); } catch {}
        if (detachLocale){
          try { detachLocale(); } catch (error){ console.warn('[exothello] Failed to detach locale listener', error); }
        }
        try { root.removeChild(wrapper); } catch {}
      }
    };
  }

  if (typeof window !== 'undefined' && typeof window.registerMiniGame === 'function'){
    window.registerMiniGame({
      id: 'exothello',
      name: 'Ex-Othello',
      nameKey: 'selection.miniexp.games.exothello.name',
      description: '可変サイズ・壁・特殊勝利条件を選べる拡張オセロ',
      descriptionKey: 'selection.miniexp.games.exothello.description',
      categoryIds: ['board'],
      author: 'AI Generated',
      icon: '🀄',
      create
    });
  }

  if (typeof module !== 'undefined'){
    module.exports = { create };
  }
})();

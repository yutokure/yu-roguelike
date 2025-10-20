(function(){
  const EMPTY = 0;
  const BLACK = 1;
  const WHITE = -1;
  const WALL = 2;
  const DIRS = [
    [1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]
  ];

  const STYLE_ID = 'exothello-inline-style';

  function ensureInlineStyles(){
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
/* Ex-Othello mini game */
.exothello-wrapper {
    display: flex;
    flex-direction: column;
    gap: 24px;
    width: min(960px, 100%);
    margin: 0 auto;
    padding: 24px 28px 40px;
    border-radius: 22px;
    background: linear-gradient(135deg, rgba(236, 253, 245, 0.92), rgba(219, 234, 254, 0.88));
    box-shadow: 0 30px 70px rgba(22, 101, 52, 0.22);
    border: 1px solid rgba(13, 148, 136, 0.18);
    backdrop-filter: blur(14px);
}

.exothello-heading {
    text-align: center;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: 0.04em;
    color: #064e3b;
    margin: 0;
}

.exothello-subtitle {
    margin: -6px auto 4px;
    text-align: center;
    max-width: 640px;
    color: rgba(4, 47, 46, 0.72);
    font-size: 0.95rem;
    line-height: 1.6;
}

.exothello-control-card {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 22px 24px 26px;
    border-radius: 18px;
    background: linear-gradient(140deg, rgba(13, 148, 136, 0.12), rgba(59, 130, 246, 0.08));
    box-shadow: 0 24px 50px rgba(15, 118, 110, 0.18);
    border: 1px solid rgba(14, 116, 144, 0.18);
}

.exothello-section-title {
    font-size: 1.05rem;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

.exothello-section-description {
    margin: -8px 0 8px;
    color: rgba(15, 23, 42, 0.7);
    font-size: 0.9rem;
}

.exothello-control-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 18px;
}

.exothello-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.exothello-field__label {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(15, 23, 42, 0.68);
}

.exothello-field__control {
    width: 100%;
}

.exothello-input {
    appearance: none;
    border-radius: 14px;
    border: 1px solid rgba(14, 116, 144, 0.28);
    background: rgba(255, 255, 255, 0.92);
    color: #0f2f21;
    font-size: 0.95rem;
    font-weight: 600;
    padding: 10px 14px;
    box-shadow: 0 10px 26px rgba(15, 118, 110, 0.16);
    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.exothello-input:focus {
    outline: none;
    border-color: rgba(15, 118, 110, 0.6);
    box-shadow: 0 12px 30px rgba(15, 118, 110, 0.26);
    transform: translateY(-1px);
}

.exothello-input--compact {
    max-width: 92px;
    text-align: center;
}

.exothello-size-control {
    display: flex;
    align-items: center;
    gap: 8px;
}

.exothello-size-multiply {
    font-weight: 700;
    color: rgba(15, 23, 42, 0.6);
}

.exothello-action-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
}

.exothello-action-bar__group {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.exothello-inline-control {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.85rem;
    font-weight: 600;
    color: rgba(15, 23, 42, 0.75);
}

.exothello-primary {
    appearance: none;
    border: none;
    border-radius: 999px;
    padding: 12px 26px;
    font-weight: 700;
    font-size: 1rem;
    letter-spacing: 0.04em;
    color: #ecfdf5;
    background: linear-gradient(130deg, rgba(15, 118, 110, 0.95), rgba(14, 165, 233, 0.95));
    box-shadow: 0 16px 38px rgba(14, 165, 233, 0.3);
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.exothello-primary:hover,
.exothello-primary:focus-visible {
    transform: translateY(-1px);
    box-shadow: 0 20px 44px rgba(14, 165, 233, 0.38);
    outline: none;
}

.exothello-secondary {
    appearance: none;
    border-radius: 999px;
    padding: 10px 22px;
    font-weight: 600;
    font-size: 0.95rem;
    letter-spacing: 0.03em;
    color: #0f172a;
    background: rgba(255, 255, 255, 0.86);
    border: 1px solid rgba(14, 116, 144, 0.34);
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.exothello-secondary:hover,
.exothello-secondary:focus-visible {
    transform: translateY(-1px);
    background: rgba(14, 116, 144, 0.14);
    box-shadow: 0 12px 30px rgba(14, 116, 144, 0.22);
    outline: none;
}

.exothello-status {
    min-height: 32px;
    padding: 12px 18px;
    border-radius: 14px;
    background: linear-gradient(120deg, rgba(56, 189, 248, 0.12), rgba(16, 185, 129, 0.12));
    border: 1px solid rgba(13, 148, 136, 0.24);
    font-size: 0.95rem;
    font-weight: 600;
    color: #0f172a;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.exothello-board-shell {
    padding: 24px;
    border-radius: 20px;
    background: radial-gradient(circle at top left, rgba(16, 185, 129, 0.2), rgba(13, 148, 136, 0.18));
    box-shadow: 0 32px 64px rgba(15, 118, 110, 0.28);
    display: flex;
    justify-content: center;
    align-items: center;
}

.exothello-board {
    display: block;
    border-radius: 14px;
    background: #0b6623;
    box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.3);
}

.exothello-info {
    text-align: center;
    font-size: 0.85rem;
    color: rgba(15, 23, 42, 0.75);
    font-weight: 600;
    margin: 0;
}

.exothello-sandbox-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 18px 22px;
    border-radius: 16px;
    background: linear-gradient(135deg, rgba(14, 165, 233, 0.12), rgba(99, 102, 241, 0.1));
    box-shadow: 0 22px 40px rgba(59, 130, 246, 0.18);
    border: 1px solid rgba(59, 130, 246, 0.24);
}

.exothello-subheading {
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(15, 23, 42, 0.64);
}

.exothello-sandbox-mode-row {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.exothello-sandbox-tools {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.exothello-chip-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 999px;
    border: 1px solid rgba(14, 116, 144, 0.3);
    background: rgba(255, 255, 255, 0.78);
    font-weight: 600;
    color: #0f2f21;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.exothello-chip-button:hover,
.exothello-chip-button:focus-visible {
    transform: translateY(-1px);
    box-shadow: 0 14px 28px rgba(15, 118, 110, 0.22);
    outline: none;
}

.exothello-chip-button--active {
    background: linear-gradient(130deg, rgba(15, 118, 110, 0.92), rgba(14, 165, 233, 0.9));
    color: #ecfdf5;
    box-shadow: 0 16px 34px rgba(15, 118, 110, 0.3);
    border-color: transparent;
}

.exothello-chip-button--tool {
    font-size: 0.85rem;
    padding: 8px 14px;
}

.exothello-tool-swatch {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1px solid rgba(15, 23, 42, 0.35);
    display: inline-block;
}

.exothello-tool-swatch--square {
    border-radius: 4px;
}

@media (max-width: 640px) {
    .exothello-wrapper {
        padding: 20px 16px 32px;
        border-radius: 18px;
    }

    .exothello-control-card {
        padding: 18px 16px 22px;
    }

    .exothello-control-grid {
        grid-template-columns: 1fr;
    }

    .exothello-action-bar {
        justify-content: center;
    }
}
`;
    document.head.appendChild(style);
  }

  function isDungeonFloor(tile){
    if (tile === 0) return true;
    if (tile === null || tile === undefined) return false;
    if (typeof tile === 'number') return tile === 0;
    if (typeof tile === 'string'){
      const normalized = tile.trim().toLowerCase();
      if (!normalized) return false;
      if (normalized === '0') return true;
      if (normalized === 'wall' || normalized === 'solid' || normalized === 'void' || normalized === 'blocked'){
        return false;
      }
      if (normalized === 'floor' || normalized === 'room' || normalized === 'path' || normalized === 'corridor' || normalized === 'hall' || normalized === 'hallway'){
        return true;
      }
      const numeric = Number(normalized);
      if (!Number.isNaN(numeric)) return numeric === 0;
      return false;
    }
    if (typeof tile === 'object'){
      if ('walkable' in tile && tile.walkable != null){
        return !!tile.walkable;
      }
      if ('passable' in tile && tile.passable != null){
        return !!tile.passable;
      }
      if ('solid' in tile && tile.solid != null){
        return !tile.solid;
      }
      if ('type' in tile && tile.type != null){
        return isDungeonFloor(tile.type);
      }
      if ('id' in tile && tile.id != null){
        return isDungeonFloor(tile.id);
      }
      if ('value' in tile && tile.value != null){
        return isDungeonFloor(tile.value);
      }
    }
    return false;
  }

  const MODE_CONFIGS = [
    {
      id: 'normal',
      defaultSize: { width: 8, height: 8 },
      allowSizeChange: true,
      descriptionKey: 'miniexp.games.exothello.modes.normal',
      descriptionDefault: 'Classic Othello rules on a flexible board size.',
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
      descriptionDefault: 'Corner squares are locked as walls, reshaping opening play.',
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
      descriptionDefault: 'Aim for the fewest discs to win instead of the most.',
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
      descriptionDefault: 'Fight along a 64×32 river channel carved through solid walls.',
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
      descriptionDefault: 'Free-build board editor for crafting and testing layouts.',
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
      descriptionDefault: 'Battle through a procedurally carved dungeon of rooms and corridors.',
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
            if (isDungeonFloor(tile)){
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

  function countWallNeighbors(board, x, y){
    let count = 0;
    for (const [dx, dy] of DIRS){
      const nx = x + dx;
      const ny = y + dy;
      if (ny < 0 || ny >= board.length || nx < 0 || nx >= board[0].length){
        count++;
        continue;
      }
      if (board[ny][nx] === WALL){
        count++;
      }
    }
    return count;
  }

  function stabilityScore(board, x, y, color){
    let score = 0;
    for (const [dx, dy] of DIRS){
      const nx = x + dx;
      const ny = y + dy;
      if (ny < 0 || ny >= board.length || nx < 0 || nx >= board[0].length){
        score += 0.5;
        continue;
      }
      const cell = board[ny][nx];
      if (cell === color){
        score += 0.75;
      } else if (cell === WALL){
        score += 0.5;
      }
    }
    return score;
  }

  function createWeights(width, height, board){
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
        if (board && board[y] && board[y][x] === WALL){
          value = -Infinity;
        } else if (board){
          const walls = countWallNeighbors(board, x, y);
          value += walls * 2;
        }
        weights[y][x] = value;
      }
    }
    return weights;
  }

  function evaluateBoard(board, weights, victoryCondition){
    let score = 0;
    let whiteCount = 0;
    let blackCount = 0;
    let whiteStability = 0;
    let blackStability = 0;
    const ruleSign = victoryCondition === 'least' ? -1 : 1;
    for (let y = 0; y < board.length; y++){
      for (let x = 0; x < board[0].length; x++){
        const cell = board[y][x];
        if (cell === WHITE){
          const weight = weights?.[y]?.[x] ?? 0;
          score += ruleSign * weight;
          whiteCount++;
          whiteStability += stabilityScore(board, x, y, WHITE);
        } else if (cell === BLACK){
          const weight = weights?.[y]?.[x] ?? 0;
          score -= ruleSign * weight;
          blackCount++;
          blackStability += stabilityScore(board, x, y, BLACK);
        }
      }
    }
    const mobilityWhite = legalMoves(board, WHITE).length;
    const mobilityBlack = legalMoves(board, BLACK).length;
    const countDiff = (whiteCount - blackCount) * ruleSign * 6;
    const mobilityDiff = (mobilityWhite - mobilityBlack) * 3;
    const stabilityDiff = (whiteStability - blackStability) * ruleSign * 1.5;
    score += countDiff + mobilityDiff + stabilityDiff;
    return score;
  }

  function evaluateBoardForColor(board, weights, victoryCondition, color){
    const baseScore = evaluateBoard(board, weights, victoryCondition);
    return color === WHITE ? baseScore : -baseScore;
  }

  function compareScores(playerScore, opponentScore, victoryCondition){
    if (victoryCondition === 'least'){
      if (playerScore < opponentScore) return 1;
      if (playerScore > opponentScore) return -1;
      return 0;
    }
    if (playerScore > opponentScore) return 1;
    if (playerScore < opponentScore) return -1;
    return 0;
  }

  function evaluateMoveHeuristic(board, move, color, victoryCondition, weights){
    const next = cloneBoard(board);
    applyMove(next, move, color);
    const ruleSign = victoryCondition === 'least' ? -1 : 1;
    const cellWeight = weights?.[move.y]?.[move.x] ?? 0;
    const flips = move.flips.length;
    const wallInfluence = countWallNeighbors(board, move.x, move.y);
    const mobilityAfter = legalMoves(next, color).length - legalMoves(next, -color).length;
    const positionalScore = cellWeight * ruleSign;
    const flipWeight = victoryCondition === 'least' ? -4 : 4;
    const mobilityScore = mobilityAfter * 2;
    const wallScore = wallInfluence;
    return positionalScore + flips * flipWeight + mobilityScore + wallScore;
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
    const scored = moves.map(move => ({
      move,
      score: evaluateMoveHeuristic(board, move, aiColor, victoryCondition, weights)
    }));
    scored.sort((a, b) => b.score - a.score);
    if (difficulty === 'EASY'){
      const candidateCount = Math.max(1, Math.ceil(scored.length / 3));
      const candidates = scored.slice(0, candidateCount);
      const minScore = candidates.reduce((min, entry) => Math.min(min, entry.score), Infinity);
      const weights = candidates.map(entry => {
        if (!Number.isFinite(entry.score) || !Number.isFinite(minScore)) return 1;
        const normalized = entry.score - minScore;
        return Math.max(1, Math.floor(normalized) + 1);
      });
      const total = weights.reduce((sum, value) => sum + value, 0) || 1;
      let roll = Math.random() * total;
      for (let i = 0; i < candidates.length; i++){
        const entry = candidates[i];
        const weight = weights[i] || 1;
        if ((roll -= weight) <= 0){
          return entry.move;
        }
      }
      return candidates[0].move;
    }
    const maxDim = Math.max(board.length, board[0].length);
    const depthBoost = difficulty === 'HARD' ? 1 : 0;
    const baseDepth = difficulty === 'HARD' ? 4 : 2;
    const depth = Math.max(1, Math.min(baseDepth + depthBoost, Math.floor(14 / Math.log2(maxDim + 2))));
    let bestMove = scored[0].move;
    let bestScore = -Infinity;
    for (const { move, score: heuristicScore } of scored){
      const next = cloneBoard(board);
      applyMove(next, move, aiColor);
      const lookahead = minimax(next, depth - 1, -aiColor, aiColor, weights, victoryCondition, -Infinity, Infinity);
      const combined = lookahead + heuristicScore * 0.05;
      if (combined > bestScore){
        bestScore = combined;
        bestMove = move;
      }
    }
    return bestMove;
  }

  function create(root, awardXp, opts){
    ensureInlineStyles();
    const localization = (opts && opts.localization) || (typeof window !== 'undefined' && typeof window.createMiniGameLocalization
      === 'function'
      ? window.createMiniGameLocalization({ id: 'exothello' })
      : null);
    const formatText = (value, params) => {
      if (!params) return value;
      return value;
    };

    const text = (key, fallback, params) => {
      if (localization && typeof localization.t === 'function') {
        return localization.t(key, fallback, params);
      }

      let result = (typeof fallback === 'function') ? fallback() : fallback;
      if (typeof result === 'string' && params) {
        result = result.replace(/\$\{?(\w+)\}?/g, (match, token) => {
          const value = params[token];
          return value !== undefined ? String(value) : match;
        });
      }
      return result ?? '';
    };
    const detachLocale = localization && typeof localization.onChange === 'function'
      ? localization.onChange(() => { try { draw(); } catch {} })
      : null;

    const wrapper = document.createElement('div');
    wrapper.className = 'exothello-wrapper';
    root.appendChild(wrapper);

    const heading = document.createElement('div');
    heading.className = 'exothello-heading';
    heading.textContent = text('miniexp.games.exothello.title', 'Ex-Othello');
    wrapper.appendChild(heading);

    const headingNote = document.createElement('p');
    headingNote.className = 'exothello-subtitle';
    headingNote.textContent = text(
      'miniexp.games.exothello.subtitle',
      'Assemble your ideal ruleset and dive into a tactical Othello duel.'
    );
    wrapper.appendChild(headingNote);

    const controlPanel = document.createElement('section');
    controlPanel.className = 'exothello-control-card';
    wrapper.appendChild(controlPanel);

    const controlHeading = document.createElement('div');
    controlHeading.className = 'exothello-section-title';
    controlHeading.textContent = text('miniexp.games.exothello.controls.sectionTitle', 'Match setup');
    controlPanel.appendChild(controlHeading);

    const controlDescription = document.createElement('p');
    controlDescription.className = 'exothello-section-description';
    controlDescription.textContent = text(
      'miniexp.games.exothello.controls.sectionDescription',
      'Choose a mode, tweak the board, and set the win conditions before starting.'
    );
    controlPanel.appendChild(controlDescription);

    const controlGrid = document.createElement('div');
    controlGrid.className = 'exothello-control-grid';
    controlPanel.appendChild(controlGrid);

    const modeSelect = document.createElement('select');
    modeSelect.className = 'exothello-input';
    for (const mode of MODE_CONFIGS){
      const option = document.createElement('option');
      option.value = mode.id;
      option.textContent = text(mode.labelKey, mode.id);
      modeSelect.appendChild(option);
    }
    controlGrid.appendChild(labeled(text('miniexp.games.exothello.controls.mode', 'Mode'), modeSelect));

    const widthInput = document.createElement('input');
    widthInput.type = 'number';
    widthInput.min = '4';
    widthInput.max = '64';
    widthInput.value = '8';
    widthInput.className = 'exothello-input exothello-input--compact';
    const heightInput = document.createElement('input');
    heightInput.type = 'number';
    heightInput.min = '4';
    heightInput.max = '64';
    heightInput.value = '8';
    heightInput.className = 'exothello-input exothello-input--compact';
    const sizeContainer = document.createElement('div');
    sizeContainer.className = 'exothello-size-control';
    sizeContainer.appendChild(widthInput);
    const mul = document.createElement('span');
    mul.textContent = '×';
    mul.className = 'exothello-size-multiply';
    sizeContainer.appendChild(mul);
    sizeContainer.appendChild(heightInput);
    controlGrid.appendChild(labeled(text('miniexp.games.exothello.controls.size', 'Size'), sizeContainer));

    const victorySelect = document.createElement('select');
    victorySelect.className = 'exothello-input';
    victorySelect.appendChild(new Option(text('miniexp.games.exothello.controls.victoryMost', 'Most discs'), 'most'));
    victorySelect.appendChild(new Option(text('miniexp.games.exothello.controls.victoryLeast', 'Least discs'), 'least'));
    controlGrid.appendChild(labeled(text('miniexp.games.exothello.controls.victoryLabel', 'Victory'), victorySelect));

    const playerColorSelect = document.createElement('select');
    playerColorSelect.className = 'exothello-input';
    playerColorSelect.appendChild(new Option(text('miniexp.games.exothello.controls.playerBlack', 'Play Black (First)'), 'black'));
    playerColorSelect.appendChild(new Option(text('miniexp.games.exothello.controls.playerWhite', 'Play White (Second)'), 'white'));
    controlGrid.appendChild(labeled(text('miniexp.games.exothello.controls.playerColor', 'Turn Order'), playerColorSelect));

    const difficultySelect = document.createElement('select');
    difficultySelect.className = 'exothello-input';
    difficultySelect.appendChild(new Option(text('miniexp.games.exothello.controls.difficultyEasy', 'Easy'), 'EASY'));
    difficultySelect.appendChild(new Option(text('miniexp.games.exothello.controls.difficultyNormal', 'Normal'), 'NORMAL'));
    difficultySelect.appendChild(new Option(text('miniexp.games.exothello.controls.difficultyHard', 'Hard'), 'HARD'));
    controlGrid.appendChild(labeled(text('miniexp.games.exothello.controls.difficultyLabel', 'Difficulty'), difficultySelect));

    const startButton = document.createElement('button');
    startButton.textContent = text('miniexp.games.exothello.controls.start', 'Start Game');
    startButton.className = 'exothello-button exothello-button--primary';

    const resetButton = document.createElement('button');
    resetButton.textContent = text('miniexp.games.exothello.controls.reset', 'Reset');
    resetButton.className = 'exothello-button exothello-button--ghost';
    resetButton.disabled = true;

    const actionBar = document.createElement('div');
    actionBar.className = 'exothello-action-bar';
    actionBar.appendChild(startButton);
    actionBar.appendChild(resetButton);
    controlPanel.appendChild(actionBar);

    const statusBox = document.createElement('div');
    statusBox.className = 'exothello-status';
    wrapper.appendChild(statusBox);

    const boardContainer = document.createElement('div');
    boardContainer.className = 'exothello-board-shell';
    wrapper.appendChild(boardContainer);

    const canvas = document.createElement('canvas');
    canvas.className = 'exothello-board';
    canvas.style.touchAction = 'none';
    boardContainer.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const infoBox = document.createElement('div');
    infoBox.className = 'exothello-info';
    wrapper.appendChild(infoBox);

    const sandboxControls = document.createElement('div');
    sandboxControls.className = 'exothello-sandbox-card';
    sandboxControls.style.display = 'none';
    wrapper.appendChild(sandboxControls);

    const sandboxModeLabel = document.createElement('div');
    sandboxModeLabel.textContent = text('miniexp.games.exothello.sandbox.modeLabel', 'Sandbox modes');
    sandboxModeLabel.className = 'exothello-subheading';
    sandboxControls.appendChild(sandboxModeLabel);

    const sandboxModeRow = document.createElement('div');
    sandboxModeRow.className = 'exothello-sandbox-mode-row';
    sandboxControls.appendChild(sandboxModeRow);

    const sandboxEditButton = document.createElement('button');
    sandboxEditButton.type = 'button';
    sandboxEditButton.textContent = text('miniexp.games.exothello.sandbox.edit', 'Edit board');
    sandboxEditButton.className = 'exothello-chip-button';
    sandboxModeRow.appendChild(sandboxEditButton);

    const sandboxPlayButton = document.createElement('button');
    sandboxPlayButton.type = 'button';
    sandboxPlayButton.textContent = text('miniexp.games.exothello.sandbox.play', 'Play test');
    sandboxPlayButton.className = 'exothello-chip-button';
    sandboxModeRow.appendChild(sandboxPlayButton);

    const sandboxPaletteLabel = document.createElement('div');
    sandboxPaletteLabel.textContent = text('miniexp.games.exothello.sandbox.paletteLabel', 'Paint tools');
    sandboxPaletteLabel.className = 'exothello-subheading';
    sandboxControls.appendChild(sandboxPaletteLabel);

    const sandboxPaletteRow = document.createElement('div');
    sandboxPaletteRow.className = 'exothello-sandbox-tools';
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
      button.className = 'exothello-chip-button exothello-chip-button--tool';
      const swatch = document.createElement('span');
      swatch.className = 'exothello-tool-swatch';
      if (tool.id === 'wall'){
        swatch.classList.add('exothello-tool-swatch--square');
      }
      swatch.style.background = tool.preview;
      button.prepend(swatch);
      sandboxPaletteRow.appendChild(button);
      sandboxToolButtons.set(tool.id, button);
      button.addEventListener('click', () => {
        state.sandboxTool = tool.id;
        updateSandboxToolButtons();
      });
    }

    const initialBoard = createBoard(8, 8, EMPTY);

    const state = {
      opts,
      board: initialBoard,
      weights: createWeights(8, 8, initialBoard),
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
      button.classList.toggle('exothello-chip-button--active', !!active);
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
      state.weights = createWeights(state.board[0].length, state.board.length, state.board);
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
      wrapper.className = 'exothello-field';
      const span = document.createElement('span');
      span.className = 'exothello-field__label';
      span.textContent = labelText;
      wrapper.appendChild(span);
      if (element && element.classList){
        element.classList.add('exothello-field__control');
      }
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
        statusBox.textContent = text(mode.descriptionKey, mode.descriptionDefault);
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
        text('miniexp.games.exothello.info.player', 'You ({color}): {count}', {
          color: describeColor(state.playerColor),
          count: playerScore
        }),
        text('miniexp.games.exothello.info.ai', 'AI ({color}): {count}', {
          color: describeColor(state.aiColor),
          count: aiScore
        }),
        text('miniexp.games.exothello.info.totals', 'Totals — Black: {black}, White: {white}', {
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
        const comparison = compareScores(playerScore, aiScore, state.victory);
        const playerWins = comparison > 0;
        const isDraw = comparison === 0;
        const resultKey = playerWins
          ? 'miniexp.games.exothello.result.win'
          : isDraw
            ? 'miniexp.games.exothello.result.draw'
            : 'miniexp.games.exothello.result.lose';
        setStatus(resultKey, playerWins ? 'You win!' : isDraw ? 'Draw' : 'You lose');
        const baseXp = Math.max(80, Math.floor(state.board.length * state.board[0].length / 4));
        const difficultyBonus = state.difficulty === 'HARD' ? 2 : state.difficulty === 'NORMAL' ? 1.4 : 1;
        const victoryBonus = state.victory === 'least' ? 1.5 : 1;
        if (playerWins){
          awardXp(Math.floor(baseXp * difficultyBonus * victoryBonus), { reason: 'win', gameId: 'exothello', mode: state.modeId });
        } else if (isDraw){
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
        state.weights = createWeights(state.board[0].length, state.board.length, state.board);
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
          setStatus(mode.descriptionKey, mode.descriptionDefault);
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
      state.weights = createWeights(8, 8, state.board);
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

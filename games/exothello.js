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
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px 18px;
    border-radius: 16px;
    background: linear-gradient(120deg, rgba(56, 189, 248, 0.14), rgba(16, 185, 129, 0.16));
    border: 1px solid rgba(13, 148, 136, 0.24);
    color: #0f172a;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45);
}

.exothello-status__message {
    font-size: 1.05rem;
    font-weight: 700;
    letter-spacing: 0.01em;
}

.exothello-status__description {
    font-size: 0.9rem;
    font-weight: 500;
    color: rgba(15, 23, 42, 0.75);
    line-height: 1.5;
}

.exothello-status__meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.exothello-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 999px;
    background: rgba(236, 254, 255, 0.9);
    border: 1px solid rgba(13, 148, 136, 0.3);
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: rgba(4, 47, 46, 0.9);
}

.exothello-scoreboard {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.exothello-scoreboard__labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.84rem;
    font-weight: 600;
    color: rgba(15, 23, 42, 0.8);
}

.exothello-scoreboard__label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.exothello-scoreboard__label--black::before,
.exothello-scoreboard__label--white::before {
    content: '';
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 1px solid rgba(15, 23, 42, 0.4);
}

.exothello-scoreboard__label--black::before {
    background: #111;
}

.exothello-scoreboard__label--white::before {
    background: #f5f5f5;
}

.exothello-scoreboard__bar {
    position: relative;
    height: 12px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.72);
    overflow: hidden;
    box-shadow: inset 0 1px 4px rgba(31, 64, 55, 0.28);
}

.exothello-scoreboard__fill {
    position: absolute;
    top: 0;
    height: 100%;
    transition: width 0.24s ease;
}

.exothello-scoreboard__fill--black {
    left: 0;
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 64, 175, 0.85));
}

.exothello-scoreboard__fill--white {
    right: 0;
    background: linear-gradient(135deg, rgba(248, 250, 252, 0.96), rgba(226, 232, 240, 0.88));
}

.exothello-scoreboard__note {
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.01em;
    color: rgba(15, 23, 42, 0.7);
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

    .exothello-status {
        padding: 14px 16px;
        gap: 6px;
    }

    .exothello-status__meta {
        gap: 4px;
    }

    .exothello-scoreboard__labels {
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;
    }
}
`;
    document.head.appendChild(style);
  }

  const MODE_TEXT = {
    normal: {
      label: { ja: '通常', en: 'Standard' },
      description: {
        ja: '基本のオセロルール。盤面サイズを自由にカスタマイズできます。',
        en: 'Classic Othello rules on a flexible board size.'
      }
    },
    corner_walls: {
      label: { ja: '角壁', en: 'Corner Walls' },
      description: {
        ja: '四隅が固定の壁。序盤の定石が変わるステージです。',
        en: 'Corner squares are locked as walls, reshaping opening play.'
      }
    },
    least: {
      label: { ja: '少ない方が勝ち', en: 'Low Count' },
      description: {
        ja: '最終的に石が少ないプレイヤーが勝利する変則ルールです。',
        en: 'Aim for the fewest discs to win instead of the most.'
      }
    },
    river64: {
      label: { ja: 'リバー 64×32', en: 'River 64×32' },
      description: {
        ja: '壁に挟まれた64×32の水路で長期戦を戦います。',
        en: 'Fight along a 64×32 river channel carved through solid walls.'
      }
    },
    sandbox: {
      label: { ja: 'サンドボックス', en: 'Sandbox' },
      description: {
        ja: '盤面を自由に編集して、オリジナルの局面を試せます。',
        en: 'Free-build board editor for crafting and testing layouts.'
      }
    },
    dungeon: {
      label: { ja: 'ダンジョン', en: 'Dungeon' },
      description: {
        ja: 'ランダム生成されたダンジョンで通路と部屋を制圧しましょう。',
        en: 'Battle through a procedurally carved dungeon of rooms and corridors.'
      }
    }
  };

  const VICTORY_TEXT = {
    most: { ja: '石が多い方が勝ち', en: 'Most discs win' },
    least: { ja: '石が少ない方が勝ち', en: 'Fewest discs win' }
  };

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
        const victory = state.settings.victory === 'least' ? 'least' : 'most';
        return Promise.resolve({ board, victory });
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

  const AXIS_PAIRS = [
    [0, 1],
    [2, 3],
    [4, 7],
    [5, 6]
  ];

  function analyzeDirection(board, x, y, dx, dy, color){
    const height = board.length;
    const width = board[0].length;
    let steps = 0;
    let opponentCount = 0;
    let nx = x + dx;
    let ny = y + dy;
    while (ny >= 0 && ny < height && nx >= 0 && nx < width){
      steps++;
      const cell = board[ny][nx];
      if (cell === WALL){
        return { status: 'blocked', steps, opponentCount };
      }
      if (cell === EMPTY){
        return { status: 'open', steps, opponentCount };
      }
      if (cell === color){
        return { status: opponentCount > 0 ? 'anchored' : 'ally', steps, opponentCount };
      }
      opponentCount++;
      nx += dx;
      ny += dy;
    }
    return { status: 'blocked', steps, opponentCount };
  }

  function directionSafetyScore(info){
    switch (info.status){
      case 'blocked':
        return 1.1 + Math.max(0, 0.35 - 0.08 * Math.max(0, info.steps - 1));
      case 'ally':
        return 0.9 - Math.min(0.5, 0.07 * Math.max(0, info.steps - 1));
      case 'anchored':
        return 1.25 - Math.min(0.45, 0.06 * Math.max(0, info.steps - 1)) + Math.min(0.9, info.opponentCount * 0.25);
      case 'open':
        return -0.95 - Math.min(0.75, 0.18 * Math.max(0, info.steps - 1));
      default:
        return 0;
    }
  }

  function scoreAxisPair(infoA, infoB){
    const safeA = infoA.status !== 'open';
    const safeB = infoB.status !== 'open';
    let score = directionSafetyScore(infoA) + directionSafetyScore(infoB);
    if (safeA && safeB){
      score += 1.2;
      if (infoA.status === 'blocked' && infoB.status === 'blocked'){
        score += 1.1;
      } else if ((infoA.status === 'anchored' || infoA.status === 'ally') && (infoB.status === 'anchored' || infoB.status === 'ally')){
        score += 0.7;
      }
    } else if (!safeA && !safeB){
      score -= 1.1;
    }
    return score;
  }

  function computeLocalSurroundStrength(board, x, y, color){
    if (!board[y] || board[y][x] !== color){
      return 0;
    }
    const height = board.length;
    const width = board[0].length;
    let wallNeighbors = 0;
    let friendlyNeighbors = 0;
    let openNeighbors = 0;
    let opponentNeighbors = 0;
    let adjacencyScore = 0;

    for (const [dx, dy] of DIRS){
      const nx = x + dx;
      const ny = y + dy;
      if (ny < 0 || ny >= height || nx < 0 || nx >= width){
        wallNeighbors++;
        adjacencyScore += 1.3;
        continue;
      }
      const cell = board[ny][nx];
      if (cell === WALL){
        wallNeighbors++;
        adjacencyScore += 1.15;
      } else if (cell === color){
        friendlyNeighbors++;
        adjacencyScore += 0.85;
      } else if (cell === -color){
        opponentNeighbors++;
        adjacencyScore -= 0.95;
      } else {
        openNeighbors++;
        adjacencyScore -= 0.55;
      }
    }

    const directionInfos = DIRS.map(([dx, dy]) => analyzeDirection(board, x, y, dx, dy, color));
    let axisScore = 0;
    let fullyClosedAxes = 0;
    let anchoredAxes = 0;
    let looseAxes = 0;

    for (const [aIndex, bIndex] of AXIS_PAIRS){
      const infoA = directionInfos[aIndex];
      const infoB = directionInfos[bIndex];
      axisScore += scoreAxisPair(infoA, infoB);
      const safeA = infoA.status !== 'open';
      const safeB = infoB.status !== 'open';
      if (safeA && safeB){
        if (infoA.status === 'blocked' && infoB.status === 'blocked'){
          fullyClosedAxes++;
        } else {
          anchoredAxes++;
        }
      } else if (!safeA || !safeB){
        looseAxes++;
      }
    }

    let surroundScore = adjacencyScore + axisScore;
    surroundScore += fullyClosedAxes * 2.2;
    surroundScore += anchoredAxes * 1.1;
    surroundScore -= looseAxes * 0.7;
    surroundScore += Math.max(0, wallNeighbors - 1) * 0.8;
    surroundScore += Math.max(0, friendlyNeighbors - 2) * 0.5;
    surroundScore -= openNeighbors * 0.4;
    surroundScore -= opponentNeighbors * 0.5;

    if (wallNeighbors >= 4){
      surroundScore += 2;
    } else if (wallNeighbors >= 3 && friendlyNeighbors >= 2){
      surroundScore += 1.5;
    }
    if (openNeighbors === 0){
      surroundScore += 1.8;
    }

    return Math.max(-12, Math.min(18, surroundScore));
  }

  function computeSurroundDelta(before, after, move, color){
    const affected = new Set();
    const add = (x, y) => {
      if (y < 0 || y >= after.length || x < 0 || x >= after[0].length) return;
      affected.add(`${x},${y}`);
    };
    add(move.x, move.y);
    for (const [fx, fy] of move.flips){
      add(fx, fy);
    }
    for (const entry of Array.from(affected)){
      const [cx, cy] = entry.split(',').map(Number);
      for (const [dx, dy] of DIRS){
        add(cx + dx, cy + dy);
      }
    }
    const beforeCache = new Map();
    const afterCache = new Map();
    const read = (cache, boardSource, x, y, pieceColor) => {
      const key = `${pieceColor}:${x},${y}`;
      if (cache.has(key)) return cache.get(key);
      const value = computeLocalSurroundStrength(boardSource, x, y, pieceColor);
      cache.set(key, value);
      return value;
    };
    let delta = 0;
    for (const entry of affected){
      const [x, y] = entry.split(',').map(Number);
      const beforeCell = before[y]?.[x];
      if (beforeCell === color){
        delta -= read(beforeCache, before, x, y, color);
      } else if (beforeCell === -color){
        delta += read(beforeCache, before, x, y, -color);
      }
      const afterCell = after[y]?.[x];
      if (afterCell === color){
        delta += read(afterCache, after, x, y, color);
      } else if (afterCell === -color){
        delta -= read(afterCache, after, x, y, -color);
      }
    }
    return delta;
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
    const height = board.length;
    const width = board[0].length;

    let whiteCount = 0;
    let blackCount = 0;
    let whiteStability = 0;
    let blackStability = 0;
    let whiteFrontier = 0;
    let blackFrontier = 0;
    let whitePotential = 0;
    let blackPotential = 0;
    let emptyCount = 0;
    let playableCount = 0;

    for (let y = 0; y < height; y++){
      for (let x = 0; x < width; x++){
        const cell = board[y][x];
        if (cell === WALL){
          continue;
        }
        playableCount++;
        if (cell === WHITE){
          const weight = weights?.[y]?.[x] ?? 0;
          score += weight;
          whiteCount++;
          whiteStability += stabilityScore(board, x, y, WHITE);
          if (isFrontierCell(board, x, y)){
            whiteFrontier++;
          }
        } else if (cell === BLACK){
          const weight = weights?.[y]?.[x] ?? 0;
          score -= weight;
          blackCount++;
          blackStability += stabilityScore(board, x, y, BLACK);
          if (isFrontierCell(board, x, y)){
            blackFrontier++;
          }
        } else if (cell === EMPTY){
          emptyCount++;
          const potential = potentialMobilityAt(board, x, y);
          whitePotential += potential.white;
          blackPotential += potential.black;
        }
      }
    }

    const phase = playableCount > 0 ? 1 - (emptyCount / playableCount) : 1;
    const mobilityWhite = legalMoves(board, WHITE).length;
    const mobilityBlack = legalMoves(board, BLACK).length;

    const discWeight = 2 + 8 * phase;
    const mobilityWeight = 3 + 6 * (1 - phase);
    const stabilityWeight = 1.5 + 6.5 * phase;
    const frontierWeight = 1 + 4 * (1 - phase);
    const potentialWeight = 1 + 3 * (1 - phase);

    const countDiff = (whiteCount - blackCount) * discWeight;
    const mobilityDiff = (mobilityWhite - mobilityBlack) * mobilityWeight;
    const stabilityDiff = (whiteStability - blackStability) * stabilityWeight;
    const frontierDiff = (blackFrontier - whiteFrontier) * frontierWeight;
    const potentialDiff = (whitePotential - blackPotential) * potentialWeight;

    score += countDiff + mobilityDiff + stabilityDiff + frontierDiff + potentialDiff;
    return score;
  }

  function evaluateBoardForColor(board, weights, victoryCondition, color){
    const baseScore = evaluateBoard(board, weights, victoryCondition);
    return color === WHITE ? baseScore : -baseScore;
  }

  function computeStageFromCounts(counts){
    const playable = counts.black + counts.white + counts.empty;
    if (playable <= 0) return 1;
    return (playable - counts.empty) / playable;
  }

  function updateCountsAfterMove(counts, move, color){
    const flipCount = move.flips.length;
    return {
      black: counts.black + (color === BLACK ? 1 + flipCount : -flipCount),
      white: counts.white + (color === WHITE ? 1 + flipCount : -flipCount),
      empty: Math.max(0, counts.empty - 1),
      wall: counts.wall
    };
  }

  function isFrontierCell(board, x, y){
    for (const [dx, dy] of DIRS){
      const nx = x + dx;
      const ny = y + dy;
      if (ny < 0 || ny >= board.length || nx < 0 || nx >= board[0].length) continue;
      if (board[ny][nx] === EMPTY) return true;
    }
    return false;
  }

  function potentialMobilityAt(board, x, y){
    let white = 0;
    let black = 0;
    for (const [dx, dy] of DIRS){
      const nx = x + dx;
      const ny = y + dy;
      if (ny < 0 || ny >= board.length || nx < 0 || nx >= board[0].length) continue;
      const cell = board[ny][nx];
      if (cell === WHITE){
        black++;
      } else if (cell === BLACK){
        white++;
      }
    }
    return { white, black };
  }

  function oppositeColor(color){
    return color === BLACK ? WHITE : BLACK;
  }

  function weightedRandomChoice(entries, weights){
    let total = 0;
    for (const weight of weights){
      total += weight;
    }
    if (total <= 0 || !Number.isFinite(total)){
      return entries[0];
    }
    let roll = Math.random() * total;
    for (let i = 0; i < entries.length; i++){
      roll -= weights[i];
      if (roll <= 0){
        return entries[i];
      }
    }
    return entries[0];
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

  function evaluateMoveHeuristic(board, nextBoard, move, color, victoryCondition, weights, postCounts, heuristicProfile){
    const profile = heuristicProfile || HEURISTIC_PROFILES.DEFAULT;
    const stage = computeStageFromCounts(postCounts);
    const cellWeight = weights?.[move.y]?.[move.x] ?? 0;
    const flipCount = move.flips.length;
    const stabilityGain = stabilityScore(nextBoard, move.x, move.y, color);
    const wallInfluence = countWallNeighbors(board, move.x, move.y);
    const myNextMoves = legalMoves(nextBoard, color).length;
    const opponentNextMoves = legalMoves(nextBoard, -color).length;
    const mobilityDelta = myNextMoves - opponentNextMoves;
    const frontierPenaltyBase = isFrontierCell(nextBoard, move.x, move.y) ? -3.5 + stage * 2 : 0;
    const discBalance = color === BLACK
      ? postCounts.black - postCounts.white
      : postCounts.white - postCounts.black;
    const surroundDelta = computeSurroundDelta(board, nextBoard, move, color);
    const surroundWeight = (profile.surroundMultiplier ?? 1) * (3.2 + stage * 5.3);
    const surroundScore = surroundDelta * surroundWeight;
    const objectiveScore = (
      cellWeight * (4 + stage * 3) * (profile.positionWeight ?? 1) +
      stabilityGain * (3 + stage * 2) * (profile.stabilityFactor ?? 1) +
      discBalance * (stage * 5 - 2) * (profile.discFactor ?? 1)
    );
    const mobilityScore = mobilityDelta * (3.5 + (1 - stage) * 2.2) * (profile.mobilityScale ?? 1);
    const wallScore = wallInfluence * (1.2 + stage * 0.5) * (profile.wallFactor ?? 1);
    const flipScore = flipCount * (2 + stage * 2.5) * (profile.flipFactor ?? 1);
    const frontierPenalty = frontierPenaltyBase * (profile.frontierFactor ?? 1);
    return objectiveScore + mobilityScore + wallScore + frontierPenalty + flipScore + surroundScore;
  }

  const HEURISTIC_PROFILES = {
    DEFAULT: {
      heuristicWeight: 0.65,
      staticWeight: 0.35,
      surroundMultiplier: 1.15,
      mobilityScale: 1,
      frontierFactor: 1,
      flipFactor: 1,
      wallFactor: 1,
      stabilityFactor: 1.05,
      positionWeight: 1,
      discFactor: 1
    },
    VERY_EASY: {
      heuristicWeight: 0.4,
      staticWeight: 0.6,
      surroundMultiplier: 0.6,
      mobilityScale: 0.6,
      frontierFactor: 0.5,
      flipFactor: 0.5,
      wallFactor: 0.8,
      stabilityFactor: 0.7,
      positionWeight: 0.8,
      discFactor: 0.5
    },
    EASY: {
      heuristicWeight: 0.55,
      staticWeight: 0.45,
      surroundMultiplier: 0.85,
      mobilityScale: 0.85,
      frontierFactor: 0.85,
      flipFactor: 0.85,
      wallFactor: 0.95,
      stabilityFactor: 0.9,
      positionWeight: 0.9,
      discFactor: 0.8
    },
    NORMAL: {
      heuristicWeight: 0.65,
      staticWeight: 0.35,
      surroundMultiplier: 1.2,
      mobilityScale: 1,
      frontierFactor: 1.05,
      flipFactor: 1,
      wallFactor: 1.05,
      stabilityFactor: 1.1,
      positionWeight: 1,
      discFactor: 1
    },
    HARD: {
      heuristicWeight: 0.72,
      staticWeight: 0.28,
      surroundMultiplier: 1.35,
      mobilityScale: 1.12,
      frontierFactor: 1.2,
      flipFactor: 1.1,
      wallFactor: 1.15,
      stabilityFactor: 1.25,
      positionWeight: 1.1,
      discFactor: 1.1
    },
    VERY_HARD: {
      heuristicWeight: 0.75,
      staticWeight: 0.25,
      surroundMultiplier: 1.5,
      mobilityScale: 1.22,
      frontierFactor: 1.3,
      flipFactor: 1.18,
      wallFactor: 1.22,
      stabilityFactor: 1.4,
      positionWeight: 1.15,
      discFactor: 1.15
    }
  };

  function cloneBoard(board){
    return board.map(row => row.slice());
  }

  function buildOrderedMoves(board, counts, moves, color, victoryCondition, weights, heuristicProfile){
    const entries = [];
    const profile = heuristicProfile || HEURISTIC_PROFILES.DEFAULT;
    const heuristicWeight = profile.heuristicWeight ?? 0.6;
    const staticWeight = profile.staticWeight ?? 0.4;
    const weightSum = heuristicWeight + staticWeight;
    const normalizedHeuristicWeight = weightSum > 0 ? heuristicWeight / weightSum : 0.6;
    const normalizedStaticWeight = weightSum > 0 ? staticWeight / weightSum : 0.4;
    for (const move of moves){
      const nextBoard = cloneBoard(board);
      applyMove(nextBoard, move, color);
      const postCounts = updateCountsAfterMove(counts, move, color);
      const heuristicScore = evaluateMoveHeuristic(
        board,
        nextBoard,
        move,
        color,
        victoryCondition,
        weights,
        postCounts,
        profile
      );
      const staticScore = evaluateBoardForColor(nextBoard, weights, victoryCondition, color);
      const combinedScore = heuristicScore * normalizedHeuristicWeight + staticScore * normalizedStaticWeight;
      entries.push({ move, nextBoard, counts: postCounts, heuristicScore, staticScore, combinedScore });
    }
    entries.sort((a, b) => b.combinedScore - a.combinedScore);
    return entries;
  }

  function createTranspositionKey(board, color, depth, victoryCondition){
    let key = `${color}|${depth}|${victoryCondition}|`;
    for (let y = 0; y < board.length; y++){
      const row = board[y];
      for (let x = 0; x < row.length; x++){
        key += String.fromCharCode(row[x] + 3 + 48);
      }
      key += ':';
    }
    return key;
  }

  function negamaxRecursive(board, counts, depth, currentColor, aiColor, weights, victoryCondition, alpha, beta, deadline, transposition, heuristicProfile){
    const profile = heuristicProfile || HEURISTIC_PROFILES.DEFAULT;
    if (deadline && Date.now() >= deadline){
      return { value: evaluateBoardForColor(board, weights, victoryCondition, aiColor), timeout: true };
    }
    if (depth === 0 || counts.empty === 0){
      return { value: evaluateBoardForColor(board, weights, victoryCondition, aiColor), timeout: false };
    }
    const key = transposition ? createTranspositionKey(board, currentColor, depth, victoryCondition) : null;
    if (key && transposition?.has(key)){
      const cached = transposition.get(key);
      if (cached.depth >= depth){
        return { value: cached.value, timeout: false };
      }
    }
    const moves = legalMoves(board, currentColor);
    if (moves.length === 0){
      const opponentMoves = legalMoves(board, -currentColor);
      if (opponentMoves.length === 0){
        return { value: evaluateBoardForColor(board, weights, victoryCondition, aiColor), timeout: false };
      }
      const passResult = negamaxRecursive(
        board,
        counts,
        Math.max(0, depth - 1),
        -currentColor,
        aiColor,
        weights,
        victoryCondition,
        -beta,
        -alpha,
        deadline,
        transposition,
        profile
      );
      if (passResult.timeout) return passResult;
      const passValue = -passResult.value;
      if (key && transposition){
        transposition.set(key, { depth, value: passValue });
      }
      return { value: passValue, timeout: false };
    }
    const ordered = buildOrderedMoves(board, counts, moves, currentColor, victoryCondition, weights, profile);
    let bestValue = -Infinity;
    let localAlpha = alpha;
    for (const entry of ordered){
      const child = negamaxRecursive(
        entry.nextBoard,
        entry.counts,
        depth - 1,
        -currentColor,
        aiColor,
        weights,
        victoryCondition,
        -beta,
        -localAlpha,
        deadline,
        transposition,
        profile
      );
      if (child.timeout) return child;
      const value = -child.value;
      if (value > bestValue){
        bestValue = value;
      }
      if (value > localAlpha){
        localAlpha = value;
      }
      if (localAlpha >= beta){
        break;
      }
      if (deadline && Date.now() >= deadline){
        break;
      }
    }
    if (key && transposition){
      transposition.set(key, { depth, value: bestValue });
    }
    return { value: bestValue, timeout: false };
  }

  function negamaxRoot(board, counts, depth, aiColor, weights, victoryCondition, deadline, transposition, orderedMoves, heuristicProfile){
    const profile = heuristicProfile || HEURISTIC_PROFILES.DEFAULT;
    const moves = orderedMoves ?? buildOrderedMoves(
      board,
      counts,
      legalMoves(board, aiColor),
      aiColor,
      victoryCondition,
      weights,
      profile
    );
    if (!moves.length){
      return { move: null, value: evaluateBoardForColor(board, weights, victoryCondition, aiColor), timeout: false };
    }
    let bestMove = moves[0].move;
    let bestValue = -Infinity;
    let alpha = -Infinity;
    const beta = Infinity;
    for (const entry of moves){
      const child = negamaxRecursive(
        entry.nextBoard,
        entry.counts,
        depth - 1,
        oppositeColor(aiColor),
        aiColor,
        weights,
        victoryCondition,
        -beta,
        -alpha,
        deadline,
        transposition,
        profile
      );
      if (child.timeout){
        return {
          move: bestMove,
          value: bestValue === -Infinity ? entry.combinedScore : bestValue,
          timeout: true
        };
      }
      const value = -child.value;
      if (value > bestValue || bestMove == null){
        bestValue = value;
        bestMove = entry.move;
      }
      if (value > alpha){
        alpha = value;
      }
      if (alpha >= beta){
        break;
      }
      if (deadline && Date.now() >= deadline){
        break;
      }
    }
    if (transposition){
      const key = createTranspositionKey(board, aiColor, depth, victoryCondition);
      transposition.set(key, { depth, value: bestValue });
    }
    return { move: bestMove, value: bestValue, timeout: false };
  }

  function adjustSearchDepth(config, board, counts){
    const baseDepth = Math.max(1, config.baseDepth || 2);
    const area = board.length * board[0].length;
    const empties = counts.empty;
    let depth = baseDepth;
    if (area > 196){
      depth = Math.max(2, depth - 1);
    }
    if (area > 256){
      depth = Math.max(2, depth - 2);
    }
    if (empties >= 40){
      depth = Math.max(1, depth - 1);
    }
    const bonus = config.endgameBonus ?? 0;
    if (empties <= 10){
      depth += bonus + 1;
    } else if (empties <= 18){
      depth += Math.max(1, Math.ceil(bonus / 2));
    }
    return Math.max(1, depth);
  }

  function chooseDeliberateMistakeMove(orderedMoves, config, aiColor, weights, victoryCondition, heuristicProfile){
    const poolRatio = Math.min(1, Math.max(0.2, config.poolRatio ?? 0.6));
    const poolSize = Math.max(1, Math.ceil(orderedMoves.length * poolRatio));
    const worstCandidates = orderedMoves.slice(-poolSize);
    let selected = worstCandidates[0] ?? orderedMoves[orderedMoves.length - 1];
    const lookahead = Math.max(0, config.lookaheadDepth | 0);
    const horizonDeadline = Date.now() + (config.timeBudgetMs ?? 160);
    if (lookahead > 0 && worstCandidates.length){
      let worstValue = Infinity;
      const sampleSize = Math.max(1, Math.min(worstCandidates.length, config.sampleSize ?? 5));
      const sample = worstCandidates.slice(0, sampleSize);
      for (const entry of sample){
        const result = negamaxRecursive(
          entry.nextBoard,
          entry.counts,
          lookahead - 1,
          oppositeColor(aiColor),
          aiColor,
          weights,
          victoryCondition,
          -Infinity,
          Infinity,
          horizonDeadline,
          null,
          heuristicProfile
        );
        const value = (result.timeout ? 0 : -result.value) + (Math.random() - 0.5) * 0.1;
        if (value < worstValue){
          worstValue = value;
          selected = entry;
        }
      }
    }
    if (Math.random() < (config.randomness ?? 0.35) && worstCandidates.length > 1){
      selected = worstCandidates[(Math.random() * worstCandidates.length) | 0];
    }
    return selected.move;
  }

  function chooseHeuristicMove(orderedMoves, config){
    if (!orderedMoves.length) return null;
    const ratio = Math.min(1, Math.max(0.1, config.candidateRatio ?? 0.4));
    const candidateCount = Math.max(1, Math.round(orderedMoves.length * ratio));
    const pickWorst = config.pickFrom === 'worst';
    const candidates = pickWorst
      ? orderedMoves.slice(-candidateCount).reverse()
      : orderedMoves.slice(0, candidateCount);
    if (candidates.length === 1 || (config.randomness ?? 0) <= 0){
      return candidates[0].move;
    }
    const exponent = 1 / (1 + (config.randomness ?? 0) * 4);
    let weights;
    if (pickWorst){
      const maxScore = candidates.reduce((max, entry) => Math.max(max, entry.combinedScore), -Infinity);
      weights = candidates.map(entry => {
        const normalized = maxScore - entry.combinedScore + 1;
        return Math.pow(Math.max(1e-6, normalized), exponent);
      });
    } else {
      const minScore = candidates.reduce((min, entry) => Math.min(min, entry.combinedScore), Infinity);
      weights = candidates.map(entry => {
        const normalized = entry.combinedScore - minScore + 1;
        return Math.pow(Math.max(1e-6, normalized), exponent);
      });
    }
    const selection = weightedRandomChoice(candidates, weights);
    return selection.move;
  }

  function chooseSearchMove(board, counts, orderedMoves, config, aiColor, weights, victoryCondition, heuristicProfile){
    const transposition = config.useTransposition ? new Map() : null;
    const depth = adjustSearchDepth(config, board, counts);
    const deadline = config.timeLimitMs ? Date.now() + config.timeLimitMs : null;
    const result = negamaxRoot(board, counts, depth, aiColor, weights, victoryCondition, deadline, transposition, orderedMoves, heuristicProfile);
    let move = result.move ?? orderedMoves[0].move;
    if (config.randomness && Math.random() < config.randomness && orderedMoves.length > 1){
      move = orderedMoves[1].move;
    }
    return move;
  }

  function chooseIterativeMove(board, counts, orderedMoves, config, aiColor, weights, victoryCondition, heuristicProfile){
    const transposition = config.useTransposition ? new Map() : null;
    const targetDepth = adjustSearchDepth(config, board, counts);
    const maxDepth = Math.max(targetDepth, config.maxDepth || targetDepth);
    const deadline = config.timeLimitMs ? Date.now() + config.timeLimitMs : null;
    let bestMove = orderedMoves[0].move;
    for (let depth = 1; depth <= maxDepth; depth++){
      const result = negamaxRoot(board, counts, depth, aiColor, weights, victoryCondition, deadline, transposition, orderedMoves, heuristicProfile);
      if (result.move){
        bestMove = result.move;
      }
      if (result.timeout){
        break;
      }
      if (deadline && Date.now() >= deadline){
        break;
      }
    }
    if (config.randomness && Math.random() < config.randomness && orderedMoves.length > 1){
      bestMove = orderedMoves[1].move;
    }
    return bestMove;
  }

  const MISERE_DIFFICULTY_ROUTING = {
    VERY_EASY: 'VERY_HARD',
    EASY: 'HARD',
    NORMAL: 'NORMAL',
    HARD: 'EASY',
    VERY_HARD: 'VERY_EASY'
  };

  function resolveEffectiveDifficulty(displayDifficulty, victoryCondition){
    if (victoryCondition !== 'least') return displayDifficulty;
    return MISERE_DIFFICULTY_ROUTING[displayDifficulty] || displayDifficulty;
  }

  const DIFFICULTY_CONFIG = {
    VERY_EASY: {
      type: 'deliberate',
      lookaheadDepth: 1,
      poolRatio: 0.9,
      sampleSize: 6,
      randomness: 0.7,
      timeBudgetMs: 160
    },
    EASY: {
      type: 'heuristic',
      candidateRatio: 0.3,
      pickFrom: 'worst',
      randomness: 0.45
    },
    NORMAL: {
      type: 'search',
      baseDepth: 3,
      endgameBonus: 1,
      timeLimitMs: 320,
      useTransposition: true,
      randomness: 0.04
    },
    HARD: {
      type: 'search',
      baseDepth: 5,
      endgameBonus: 3,
      timeLimitMs: 650,
      useTransposition: true,
      randomness: 0
    },
    VERY_HARD: {
      type: 'iterative',
      baseDepth: 5,
      maxDepth: 8,
      timeLimitMs: 1200,
      useTransposition: true,
      randomness: 0
    }
  };

  function pickAIMove(board, weights, victoryCondition, difficulty, aiColor){
    const moves = legalMoves(board, aiColor);
    if (moves.length === 0) return null;
    const counts = countPieces(board);
    const effectiveDifficulty = resolveEffectiveDifficulty(difficulty, victoryCondition);
    const config = DIFFICULTY_CONFIG[effectiveDifficulty] || DIFFICULTY_CONFIG.NORMAL;
    const heuristicProfile = HEURISTIC_PROFILES[effectiveDifficulty] || HEURISTIC_PROFILES.DEFAULT;
    const ordered = buildOrderedMoves(board, counts, moves, aiColor, victoryCondition, weights, heuristicProfile);
    if (!ordered.length) return null;

    switch (config.type){
      case 'deliberate':
        return chooseDeliberateMistakeMove(ordered, config, aiColor, weights, victoryCondition, heuristicProfile);
      case 'heuristic': {
        const move = chooseHeuristicMove(ordered, config);
        return move ?? ordered[0].move;
      }
      case 'search':
        return chooseSearchMove(board, counts, ordered, config, aiColor, weights, victoryCondition, heuristicProfile);
      case 'iterative':
        return chooseIterativeMove(board, counts, ordered, config, aiColor, weights, victoryCondition, heuristicProfile);
      default:
        return ordered[0].move;
    }
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

    const getLocaleCode = () => {
      const raw = localization?.getLocale?.();
      if (typeof raw === 'string' && raw) return raw.toLowerCase();
      return 'ja';
    };

    const pickLocalized = (entry, fallbackValue) => {
      if (!entry || typeof entry !== 'object') return fallbackValue;
      const locale = getLocaleCode();
      if (locale.startsWith('ja') && entry.ja) return entry.ja;
      if (locale.startsWith('en') && entry.en) return entry.en;
      const base = locale.split('-')[0];
      if (base && entry[base]) return entry[base];
      return entry.en || entry.ja || fallbackValue;
    };

    const getModeLabelFallback = (modeId) => {
      const entry = MODE_TEXT[modeId]?.label;
      const defaultLabel = MODE_TEXT[modeId]?.label?.en || modeId;
      return pickLocalized(entry, defaultLabel);
    };

    const getModeDescriptionFallback = (modeId) => {
      const entry = MODE_TEXT[modeId]?.description;
      const defaultDescription = MODE_TEXT[modeId]?.description?.en
        || MODE_TEXT.normal.description.en;
      return pickLocalized(entry, defaultDescription);
    };

    const getVictoryLabelFallback = (victory) => {
      const entry = VICTORY_TEXT[victory];
      const defaultLabel = VICTORY_TEXT[victory]?.en || victory;
      return pickLocalized(entry, defaultLabel);
    };

    const getColorLabelFallback = (color) => {
      const locale = getLocaleCode();
      const isBlack = color === BLACK ? 'black' : 'white';
      if (locale.startsWith('ja')) return isBlack === 'black' ? '黒' : '白';
      return isBlack === 'black' ? 'Black' : 'White';
    };

    const getParticipantLabel = (participant) => {
      const locale = getLocaleCode();
      if (participant === 'player') return locale.startsWith('ja') ? 'あなた' : 'You';
      return locale.startsWith('ja') ? 'AI' : 'AI';
    };

    const formatScoreLabel = (color, count) => {
      const locale = getLocaleCode();
      const name = getColorLabelFallback(color);
      const sep = locale.startsWith('ja') ? '：' : ': ';
      return `${name}${sep}${count}`;
    };

    let statusMessageState = { key: null, fallback: null };
    let statusDescriptionState = { key: null, fallback: null };

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
      option.textContent = text(mode.labelKey, () => getModeLabelFallback(mode.id));
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
    victorySelect.appendChild(new Option(
      text('miniexp.games.exothello.controls.victoryMost', () => getVictoryLabelFallback('most')),
      'most'
    ));
    victorySelect.appendChild(new Option(
      text('miniexp.games.exothello.controls.victoryLeast', () => getVictoryLabelFallback('least')),
      'least'
    ));
    controlGrid.appendChild(labeled(text('miniexp.games.exothello.controls.victoryLabel', 'Victory'), victorySelect));

    const playerColorSelect = document.createElement('select');
    playerColorSelect.className = 'exothello-input';
    playerColorSelect.appendChild(new Option(text('miniexp.games.exothello.controls.playerBlack', 'Play Black (First)'), 'black'));
    playerColorSelect.appendChild(new Option(text('miniexp.games.exothello.controls.playerWhite', 'Play White (Second)'), 'white'));
    controlGrid.appendChild(labeled(text('miniexp.games.exothello.controls.playerColor', 'Turn Order'), playerColorSelect));

    const difficultySelect = document.createElement('select');
    difficultySelect.className = 'exothello-input';
    const difficultyOptions = [
      { value: 'VERY_EASY', key: 'miniexp.games.exothello.controls.difficultyVeryEasy', fallback: 'Very Easy' },
      { value: 'EASY', key: 'miniexp.games.exothello.controls.difficultyEasy', fallback: 'Easy' },
      { value: 'NORMAL', key: 'miniexp.games.exothello.controls.difficultyNormal', fallback: 'Normal' },
      { value: 'HARD', key: 'miniexp.games.exothello.controls.difficultyHard', fallback: 'Hard' },
      { value: 'VERY_HARD', key: 'miniexp.games.exothello.controls.difficultyVeryHard', fallback: 'Very Hard' }
    ];
    for (const optionDef of difficultyOptions){
      difficultySelect.appendChild(new Option(text(optionDef.key, optionDef.fallback), optionDef.value));
    }
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
    const statusMessageEl = document.createElement('div');
    statusMessageEl.className = 'exothello-status__message';
    statusBox.appendChild(statusMessageEl);
    const statusDescriptionEl = document.createElement('div');
    statusDescriptionEl.className = 'exothello-status__description';
    statusBox.appendChild(statusDescriptionEl);
    const statusMetaEl = document.createElement('div');
    statusMetaEl.className = 'exothello-status__meta';
    const modeBadgeEl = document.createElement('span');
    modeBadgeEl.className = 'exothello-badge exothello-badge--mode';
    statusMetaEl.appendChild(modeBadgeEl);
    const victoryBadgeEl = document.createElement('span');
    victoryBadgeEl.className = 'exothello-badge exothello-badge--victory';
    statusMetaEl.appendChild(victoryBadgeEl);
    statusBox.appendChild(statusMetaEl);
    const scoreboardEl = document.createElement('div');
    scoreboardEl.className = 'exothello-scoreboard';
    const scoreboardLabelsEl = document.createElement('div');
    scoreboardLabelsEl.className = 'exothello-scoreboard__labels';
    const blackLabelEl = document.createElement('span');
    blackLabelEl.className = 'exothello-scoreboard__label exothello-scoreboard__label--black';
    const whiteLabelEl = document.createElement('span');
    whiteLabelEl.className = 'exothello-scoreboard__label exothello-scoreboard__label--white';
    scoreboardLabelsEl.appendChild(blackLabelEl);
    scoreboardLabelsEl.appendChild(whiteLabelEl);
    const scoreboardBarEl = document.createElement('div');
    scoreboardBarEl.className = 'exothello-scoreboard__bar';
    const blackFillEl = document.createElement('div');
    blackFillEl.className = 'exothello-scoreboard__fill exothello-scoreboard__fill--black';
    const whiteFillEl = document.createElement('div');
    whiteFillEl.className = 'exothello-scoreboard__fill exothello-scoreboard__fill--white';
    scoreboardBarEl.appendChild(blackFillEl);
    scoreboardBarEl.appendChild(whiteFillEl);
    const scoreboardNoteEl = document.createElement('div');
    scoreboardNoteEl.className = 'exothello-scoreboard__note';
    scoreboardEl.appendChild(scoreboardLabelsEl);
    scoreboardEl.appendChild(scoreboardBarEl);
    scoreboardEl.appendChild(scoreboardNoteEl);
    statusBox.appendChild(scoreboardEl);
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

    const describeColor = (color) => {
      const key = color === BLACK
        ? 'miniexp.games.exothello.color.black'
        : 'miniexp.games.exothello.color.white';
      return text(key, () => getColorLabelFallback(color));
    };

    const resolveLocalized = (key, fallback, params) => {
      if (key) return text(key, fallback, params);
      if (typeof fallback === 'function') {
        try {
          return fallback(params);
        } catch {
          return '';
        }
      }
      return fallback ?? '';
    };

    function setStatus(key, fallback){
      statusMessageState = { key: key ?? null, fallback: fallback ?? null };
      statusMessageEl.textContent = resolveLocalized(statusMessageState.key, statusMessageState.fallback);
    }

    function setStatusDescription(key, fallback){
      statusDescriptionState = { key: key ?? null, fallback: fallback ?? null };
      statusDescriptionEl.textContent = resolveLocalized(statusDescriptionState.key, statusDescriptionState.fallback);
    }

    function refreshStatusTexts(){
      statusMessageEl.textContent = resolveLocalized(statusMessageState.key, statusMessageState.fallback);
      statusDescriptionEl.textContent = resolveLocalized(statusDescriptionState.key, statusDescriptionState.fallback);
    }

    function updateRuleBadges(){
      const mode = MODE_CONFIGS.find(m => m.id === state.modeId) || MODE_CONFIGS[0];
      const currentVictory = state.running || state.ended ? state.victory : state.settings.victory;
      const modeLabel = text(mode.labelKey, () => getModeLabelFallback(mode.id));
      modeBadgeEl.textContent = text(
        'miniexp.games.exothello.badge.mode',
        () => {
          const locale = getLocaleCode();
          return locale.startsWith('ja') ? `モード: ${modeLabel}` : `Mode: ${modeLabel}`;
        },
        { mode: modeLabel }
      );
      const victoryKeyLabel = currentVictory === 'least'
        ? 'miniexp.games.exothello.badge.victoryLeast'
        : 'miniexp.games.exothello.badge.victoryMost';
      victoryBadgeEl.textContent = text(
        victoryKeyLabel,
        () => {
          const locale = getLocaleCode();
          const label = getVictoryLabelFallback(currentVictory);
          return locale.startsWith('ja') ? `勝利条件: ${label}` : `Win: ${label}`;
        },
        { victory: getVictoryLabelFallback(currentVictory) }
      );
    }

    function updateScoreboard(counts, playerScore, aiScore){
      const total = counts.black + counts.white;
      const blackPercent = total > 0 ? Math.max(0, Math.min(100, (counts.black / total) * 100)) : 50;
      const whitePercent = 100 - blackPercent;
      blackFillEl.style.width = `${blackPercent.toFixed(1)}%`;
      whiteFillEl.style.width = `${whitePercent.toFixed(1)}%`;
      blackLabelEl.textContent = text(
        'miniexp.games.exothello.score.blackLabel',
        () => formatScoreLabel(BLACK, counts.black),
        { count: counts.black }
      );
      whiteLabelEl.textContent = text(
        'miniexp.games.exothello.score.whiteLabel',
        () => formatScoreLabel(WHITE, counts.white),
        { count: counts.white }
      );
      let note;
      if (playerScore === aiScore){
        note = text(
          'miniexp.games.exothello.score.note.tie',
          () => {
            const locale = getLocaleCode();
            return locale.startsWith('ja') ? '現在は同点です。' : 'The game is currently tied.';
          }
        );
      } else if (playerScore > aiScore){
        const diff = playerScore - aiScore;
        const playerColorName = describeColor(state.playerColor);
        note = text(
          'miniexp.games.exothello.score.note.youLead',
          () => {
            const locale = getLocaleCode();
            return locale.startsWith('ja')
              ? `${getParticipantLabel('player')}（${playerColorName}）が${diff}枚リード`
              : `${getParticipantLabel('player')} (${playerColorName}) leads by ${diff}`;
          },
          { diff, color: playerColorName }
        );
      } else {
        const diff = aiScore - playerScore;
        const aiColorName = describeColor(state.aiColor);
        note = text(
          'miniexp.games.exothello.score.note.aiLead',
          () => {
            const locale = getLocaleCode();
            return locale.startsWith('ja')
              ? `${getParticipantLabel('ai')}（${aiColorName}）が${diff}枚リード`
              : `${getParticipantLabel('ai')} (${aiColorName}) leads by ${diff}`;
          },
          { diff, color: aiColorName }
        );
      }
      scoreboardNoteEl.textContent = note;
    }

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
        setStatus(
          'miniexp.games.exothello.status.sandboxEditing',
          () => {
            const locale = getLocaleCode();
            return locale.startsWith('ja')
              ? 'サンドボックス編集モード: ツールを選んで盤面をドラッグで塗りましょう。'
              : 'Sandbox edit: choose a tool and drag to paint the board.';
          }
        );
        updateSandboxControls();
        draw();
        return;
      }
      const hasBlackMove = legalMoves(state.board, BLACK).length > 0;
      const hasWhiteMove = legalMoves(state.board, WHITE).length > 0;
      if (!hasBlackMove && !hasWhiteMove){
        setStatus(
          'miniexp.games.exothello.status.invalidSandbox',
          () => {
            const locale = getLocaleCode();
            return locale.startsWith('ja')
              ? 'どちらの手番にも合法手がありません。もう一度編集してください。'
              : 'No valid moves for either side. Edit again.';
          }
        );
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
      updateRuleBadges();
      state.difficulty = difficultySelect.value;
      state.settings.width = state.board[0].length;
      state.settings.height = state.board.length;
      state.weights = createWeights(state.board[0].length, state.board.length, state.board);
      state.turn = state.playerColor;
      state.isPainting = false;
      updateSandboxControls();
      setStatus(
        'miniexp.games.exothello.status.continue',
        () => {
          const locale = getLocaleCode();
          return locale.startsWith('ja') ? '対局中です。' : 'Game in progress.';
        }
      );
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
        setStatusDescription(
          'miniexp.games.exothello.status.sandboxHint',
          () => {
            const locale = getLocaleCode();
            return locale.startsWith('ja')
              ? 'サンドボックス: 編集モードで盤面をペイントし、プレイモードでテストできます。'
              : 'Sandbox: paint walls and stones in Edit mode, then switch to Play to test.';
          }
        );
      } else {
        setStatusDescription(mode.descriptionKey, () => getModeDescriptionFallback(mode.id));
      }
      updateRuleBadges();
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
      updateRuleBadges();
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
      updateScoreboard(counts, playerScore, aiScore);
      const victoryLabel = text(victoryKey, () => getVictoryLabelFallback(state.victory));
      const locale = getLocaleCode();
      const separator = locale.startsWith('ja') ? ' ｜ ' : ' · ';
      const colon = locale.startsWith('ja') ? '：' : ': ';
      const playerSegment = text(
        'miniexp.games.exothello.info.player',
        () => `${getParticipantLabel('player')} (${describeColor(state.playerColor)})${colon}${playerScore}`,
        {
          color: describeColor(state.playerColor),
          count: playerScore
        }
      );
      const aiSegment = text(
        'miniexp.games.exothello.info.ai',
        () => `${getParticipantLabel('ai')} (${describeColor(state.aiColor)})${colon}${aiScore}`,
        {
          color: describeColor(state.aiColor),
          count: aiScore
        }
      );
      const totalsSegment = text(
        'miniexp.games.exothello.info.totals',
        () => `${formatScoreLabel(BLACK, counts.black)} / ${formatScoreLabel(WHITE, counts.white)}`,
        {
          black: counts.black,
          white: counts.white
        }
      );
      const victorySegment = text(
        'miniexp.games.exothello.info.victory',
        () => (locale.startsWith('ja') ? `勝利条件${colon}${victoryLabel}` : `Win${colon}${victoryLabel}`),
        { victory: victoryLabel }
      );
      infoBox.textContent = [turnText, victorySegment, playerSegment, aiSegment, totalsSegment].join(separator);
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
        setStatus(resultKey, () => {
          const locale = getLocaleCode();
          if (playerWins) return locale.startsWith('ja') ? 'あなたの勝ち！' : 'You win!';
          if (isDraw) return locale.startsWith('ja') ? '引き分けです。' : 'Draw.';
          return locale.startsWith('ja') ? 'あなたの負け…' : 'You lose.';
        });
        const baseXp = Math.max(80, Math.floor(state.board.length * state.board[0].length / 4));
        const difficultyXpMap = {
          VERY_EASY: 0.5,
          EASY: 1,
          NORMAL: 1.4,
          HARD: 2,
          VERY_HARD: 3
        };
        const difficultyBonus = difficultyXpMap[state.difficulty] ?? 1;
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
        setStatus(
          'miniexp.games.exothello.status.pass',
          () => {
            const locale = getLocaleCode();
            return locale.startsWith('ja') ? '打てる場所がありません。手番をパスします。' : 'No moves available. Turn passes.';
          }
        );
        setTimeout(() => processAIMove(), 160);
        return;
      }
      if (state.turn === state.aiColor && aiMoves.length === 0){
        state.turn = state.playerColor;
        updateLegalMoves();
        draw();
        setStatus(
          'miniexp.games.exothello.status.pass',
          () => {
            const locale = getLocaleCode();
            return locale.startsWith('ja') ? '打てる場所がありません。手番をパスします。' : 'No moves available. Turn passes.';
          }
        );
        return;
      }
      setStatus(
        'miniexp.games.exothello.status.continue',
        () => {
          const locale = getLocaleCode();
          return locale.startsWith('ja') ? '対局中です。' : 'Game in progress.';
        }
      );
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
      setStatus(
        'miniexp.games.exothello.status.preparing',
        () => {
          const locale = getLocaleCode();
          return locale.startsWith('ja') ? '盤面を準備しています…' : 'Preparing the board...';
        }
      );
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
        updateRuleBadges();
        state.legal = [];
        resizeCanvas();
        state.isSandbox = !!setupResult.sandbox;
        if (state.isSandbox){
          state.sandboxMode = 'edit';
          state.running = false;
          state.isPainting = false;
          state.sandboxTool = state.sandboxTool || 'black';
          setStatus(
            'miniexp.games.exothello.status.sandboxEditing',
            () => {
              const locale = getLocaleCode();
              return locale.startsWith('ja')
                ? 'サンドボックス編集モード: ツールを選んで盤面をドラッグで塗りましょう。'
                : 'Sandbox edit: choose a tool and drag to paint the board.';
            }
          );
          updateSandboxControls();
          draw();
        } else {
          state.running = true;
          setStatus(mode.descriptionKey, () => getModeDescriptionFallback(mode.id));
          updateRuleBadges();
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
        setStatus(
          'miniexp.games.exothello.status.error',
          () => {
            const locale = getLocaleCode();
            return locale.startsWith('ja') ? '盤面の準備に失敗しました。' : 'Failed to prepare the board.';
          }
        );
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
      updateRuleBadges();
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
      setStatus(
        'miniexp.games.exothello.status.reset',
        () => {
          const locale = getLocaleCode();
          return locale.startsWith('ja') ? 'モードを選んで対局を始めましょう。' : 'Select a mode to begin.';
        }
      );
      updateSettingsFromControls();
      syncControlsWithMode();
      resizeCanvas();
      updateSandboxControls();
      draw();
    }

    const detachLocale = localization && typeof localization.onChange === 'function'
      ? localization.onChange(() => {
        try {
          refreshStatusTexts();
          updateRuleBadges();
          draw();
        } catch {}
      })
      : null;

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
    setStatus(
      'miniexp.games.exothello.status.ready',
      () => {
        const locale = getLocaleCode();
        return locale.startsWith('ja') ? 'モードを選んでスタートを押してください。' : 'Choose a mode and press Start.';
      }
    );

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

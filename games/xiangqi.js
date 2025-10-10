(function(){
  'use strict';

  const BOARD_WIDTH = 9;
  const BOARD_HEIGHT = 10;
  const TILE_SIZE = 60;
  const LIGHT_COLOR = '#fef3c7';
  const DARK_COLOR = '#fde68a';
  const GRID_COLOR = '#b45309';
  const SELECT_COLOR = 'rgba(234, 179, 8, 0.55)';
  const MOVE_COLOR = 'rgba(34, 197, 94, 0.45)';
  const CAPTURE_COLOR = 'rgba(220, 38, 38, 0.45)';
  const CHECK_COLOR = 'rgba(248, 113, 113, 0.65)';

  const PIECE_GLYPHS = {
    'K': '帥', 'A': '仕', 'E': '相', 'H': '傌', 'R': '俥', 'C': '炮', 'S': '兵',
    'k': '將', 'a': '士', 'e': '象', 'h': '馬', 'r': '車', 'c': '砲', 's': '卒'
  };

  const GLOBAL_SCOPE = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null);
  const BASE_I18N = GLOBAL_SCOPE && GLOBAL_SCOPE.I18n ? GLOBAL_SCOPE.I18n : null;

  const PIECE_NAME_KEYS = {
    k: 'minigame.xiangqi.pieces.general',
    a: 'minigame.xiangqi.pieces.advisor',
    e: 'minigame.xiangqi.pieces.elephant',
    h: 'minigame.xiangqi.pieces.horse',
    r: 'minigame.xiangqi.pieces.chariot',
    c: 'minigame.xiangqi.pieces.cannon',
    s: 'minigame.xiangqi.pieces.soldier'
  };

  const PIECE_NAME_DEFAULTS = {
    k: '将',
    a: '士',
    e: '象',
    h: '馬',
    r: '車',
    c: '砲',
    s: '卒'
  };

  const COLOR_NAME_KEYS = { red: 'minigame.xiangqi.color.red', black: 'minigame.xiangqi.color.black' };
  const COLOR_NAME_DEFAULTS = { red: '赤', black: '黒' };

  const PLAYER_LABEL_KEYS = { red: 'minigame.xiangqi.color.redPlayer', black: 'minigame.xiangqi.color.blackPlayer' };
  const PLAYER_LABEL_DEFAULTS = { red: '赤（下）', black: '黒（上）' };

  const PIECE_VALUES = { k: 0, a: 2, e: 2, h: 4, r: 9, c: 6, s: 1 };
  const CAPTURE_EXP = { k: 400, a: 55, e: 55, h: 85, r: 130, c: 110, s: 40 };
  const CHECK_EXP = 35;
  const STALEMATE_EXP = 80;
  const WIN_EXP = { EASY: 260, NORMAL: 420, HARD: 640 };

  const START_POSITION = [
    ['r','h','e','a','k','a','e','h','r'],
    [null,null,null,null,null,null,null,null,null],
    [null,'c',null,null,null,null,null,'c',null],
    ['s',null,'s',null,'s',null,'s',null,'s'],
    [null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null],
    ['S',null,'S',null,'S',null,'S',null,'S'],
    [null,'C',null,null,null,null,null,'C',null],
    [null,null,null,null,null,null,null,null,null],
    ['R','H','E','A','K','A','E','H','R']
  ];

  const HORSE_MOVES = [
    { dx: 1, dy: 2, leg: { dx: 0, dy: 1 } },
    { dx: -1, dy: 2, leg: { dx: 0, dy: 1 } },
    { dx: 1, dy: -2, leg: { dx: 0, dy: -1 } },
    { dx: -1, dy: -2, leg: { dx: 0, dy: -1 } },
    { dx: 2, dy: 1, leg: { dx: 1, dy: 0 } },
    { dx: 2, dy: -1, leg: { dx: 1, dy: 0 } },
    { dx: -2, dy: 1, leg: { dx: -1, dy: 0 } },
    { dx: -2, dy: -1, leg: { dx: -1, dy: 0 } }
  ];

  function getActiveI18n(){
    const scope = typeof window !== 'undefined' ? window : GLOBAL_SCOPE;
    return scope && scope.I18n ? scope.I18n : BASE_I18N;
  }

  function evaluateFallback(fallback, params){
    if (typeof fallback === 'function'){
      try {
        const result = fallback(params || {});
        if (result == null) return '';
        return String(result);
      } catch (error){
        console.warn('[xiangqi] Failed to evaluate fallback text:', error);
        return '';
      }
    }
    return fallback ?? '';
  }

  function text(key, fallback, params){
    const activeI18n = getActiveI18n();
    if (key && activeI18n && typeof activeI18n.t === 'function'){
      try {
        const translated = activeI18n.t(key, params);
        if (typeof translated === 'string' && translated !== key){
          return translated;
        }
        if (translated !== undefined && translated !== null && translated !== key){
          return translated;
        }
      } catch (error){
        console.warn('[xiangqi] Failed to translate key:', key, error);
      }
    }
    return evaluateFallback(fallback, params);
  }

  function formatLocalizedNumber(value, options){
    const activeI18n = getActiveI18n();
    const numeric = Number(value);
    if (Number.isFinite(numeric)){
      if (typeof activeI18n?.formatNumber === 'function'){
        try {
          return activeI18n.formatNumber(numeric, options);
        } catch (error){
          console.warn('[xiangqi] Failed to format number via i18n:', error);
        }
      }
      try {
        return new Intl.NumberFormat(activeI18n?.getLocale?.() || undefined, options).format(numeric);
      } catch (error){
        console.warn('[xiangqi] Failed to format number via Intl:', error);
      }
    }
    return String(value ?? '');
  }

  function ensureStyle(){
    if (document.getElementById('mini-xiangqi-style')) return;
    const style = document.createElement('style');
    style.id = 'mini-xiangqi-style';
    style.textContent = `
      .mini-xiangqi-root { display: flex; flex-direction: column; gap: 8px; align-items: center; font-family: 'Noto Sans JP', 'Segoe UI', sans-serif; }
      .mini-xiangqi-info { background: #fefce8; color: #78350f; padding: 10px 14px; border-radius: 10px; box-shadow: 0 6px 18px rgba(146, 64, 14, 0.25); min-width: 320px; }
      .mini-xiangqi-info h2 { margin: 0 0 6px; font-size: 1rem; display: flex; justify-content: space-between; align-items: center; }
      .mini-xiangqi-info .status-line { font-size: 0.9rem; margin-bottom: 4px; }
      .mini-xiangqi-board { position: relative; display: grid; grid-template-columns: repeat(9, ${TILE_SIZE}px); grid-template-rows: repeat(10, ${TILE_SIZE}px); gap: 0; border: 4px solid ${GRID_COLOR}; border-radius: 12px; box-shadow: 0 10px 24px rgba(124, 45, 18, 0.35); background: linear-gradient(180deg, ${LIGHT_COLOR} 0%, ${DARK_COLOR} 100%); overflow: hidden; }
      .mini-xiangqi-cell { position: relative; width: ${TILE_SIZE}px; height: ${TILE_SIZE}px; display: flex; align-items: center; justify-content: center; cursor: pointer; user-select: none; font-size: 28px; font-weight: 600; transition: background-color 0.15s ease; }
      .mini-xiangqi-cell:nth-child(odd) { background: rgba(255,255,255,0.05); }
      .mini-xiangqi-cell:nth-child(even) { background: rgba(0,0,0,0.03); }
      .mini-xiangqi-cell[data-river='true']::after { content: attr(data-river-label); position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 22px; letter-spacing: 6px; color: rgba(120, 53, 15, 0.35); pointer-events: none; }
      .mini-xiangqi-cell span { width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(254, 249, 195, 0.9); border: 2px solid rgba(234, 179, 8, 0.85); box-shadow: inset 0 2px 6px rgba(0,0,0,0.2); color: #b91c1c; text-shadow: 0 1px 1px rgba(255,255,255,0.6); transition: transform 0.12s ease; }
      .mini-xiangqi-cell span[data-color='black'] { background: rgba(248, 250, 252, 0.92); border-color: rgba(30, 64, 175, 0.75); color: #1f2937; text-shadow: none; }
      .mini-xiangqi-cell span[data-moved='true'] { transform: scale(1.04); }
      .mini-xiangqi-cell[data-highlight='select'] { background-color: ${SELECT_COLOR}; }
      .mini-xiangqi-cell[data-highlight='move'] { background-color: ${MOVE_COLOR}; }
      .mini-xiangqi-cell[data-highlight='capture'] { background-color: ${CAPTURE_COLOR}; }
      .mini-xiangqi-cell[data-highlight='check'] { box-shadow: inset 0 0 0 3px ${CHECK_COLOR}; }
      .mini-xiangqi-controls { display: flex; gap: 8px; }
      .mini-xiangqi-controls button { background: #f97316; border: none; color: #fff7ed; font-weight: 600; padding: 6px 18px; border-radius: 999px; cursor: pointer; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.35); }
      .mini-xiangqi-controls button:hover { background: #ea580c; }
      .mini-xiangqi-controls button:disabled { background: #fed7aa; color: #7c2d12; cursor: not-allowed; box-shadow: none; }
    `;
    document.head.appendChild(style);
  }

  function cloneBoard(board){
    return board.map(row => row.slice());
  }

  function inBounds(x, y){
    return x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT;
  }

  function pieceColor(piece){
    if (!piece) return null;
    return piece === piece.toUpperCase() ? 'red' : 'black';
  }

  function opposite(color){
    return color === 'red' ? 'black' : 'red';
  }

  function isInsidePalace(x, y, color){
    if (color === 'red'){
      return x >= 3 && x <= 5 && y >= 7 && y <= 9;
    }
    return x >= 3 && x <= 5 && y >= 0 && y <= 2;
  }

  function hasCrossedRiver(y, color){
    if (color === 'red'){
      return y <= 4;
    }
    return y >= 5;
  }

  function findGeneral(board, color){
    const target = color === 'red' ? 'K' : 'k';
    for (let y = 0; y < BOARD_HEIGHT; y++){
      for (let x = 0; x < BOARD_WIDTH; x++){
        if (board[y][x] === target){
          return [x, y];
        }
      }
    }
    return null;
  }

  function generalsFacing(board){
    const red = findGeneral(board, 'red');
    const black = findGeneral(board, 'black');
    if (!red || !black) return false;
    if (red[0] !== black[0]) return false;
    const file = red[0];
    const [ry, by] = [red[1], black[1]];
    const top = Math.min(ry, by) + 1;
    const bottom = Math.max(ry, by);
    for (let y = top; y < bottom; y++){
      if (board[y][file]) return false;
    }
    return true;
  }

  function isSoldierThreat(board, gx, gy, color){
    const enemy = opposite(color);
    if (enemy === 'red'){
      const forward = gy + 1;
      if (forward < BOARD_HEIGHT && board[forward][gx] === 'S') return true;
      if (gy >= 0){
        if (gx > 0){
          const piece = board[gy][gx - 1];
          if (piece === 'S' && hasCrossedRiver(gy, 'red')) return true;
        }
        if (gx < BOARD_WIDTH - 1){
          const piece = board[gy][gx + 1];
          if (piece === 'S' && hasCrossedRiver(gy, 'red')) return true;
        }
      }
    } else {
      const forward = gy - 1;
      if (forward >= 0 && board[forward][gx] === 's') return true;
      if (gy >= 0){
        if (gx > 0){
          const piece = board[gy][gx - 1];
          if (piece === 's' && hasCrossedRiver(gy, 'black')) return true;
        }
        if (gx < BOARD_WIDTH - 1){
          const piece = board[gy][gx + 1];
          if (piece === 's' && hasCrossedRiver(gy, 'black')) return true;
        }
      }
    }
    return false;
  }

  function isHorseThreat(board, gx, gy, color){
    const enemy = opposite(color);
    for (const move of HORSE_MOVES){
      const hx = gx + move.dx;
      const hy = gy + move.dy;
      if (!inBounds(hx, hy)) continue;
      const legX = gx + move.leg.dx;
      const legY = gy + move.leg.dy;
      if (!inBounds(legX, legY)) continue;
      if (board[legY][legX]) continue;
      const piece = board[hy][hx];
      if (piece && pieceColor(piece) === enemy && piece.toLowerCase() === 'h'){
        return true;
      }
    }
    return false;
  }

  function isRookOrCannonThreat(board, gx, gy, color){
    const enemy = opposite(color);
    const directions = [ [1,0], [-1,0], [0,1], [0,-1] ];
    for (const [dx, dy] of directions){
      let x = gx + dx;
      let y = gy + dy;
      let seen = false;
      while (inBounds(x, y)){
        const cell = board[y][x];
        if (!cell){
          x += dx;
          y += dy;
          continue;
        }
        if (!seen){
          if (pieceColor(cell) === color){
            seen = true;
            x += dx;
            y += dy;
            continue;
          }
          const lower = cell.toLowerCase();
          if (pieceColor(cell) === enemy){
            if (lower === 'r' || lower === 'k'){
              return true;
            }
            if (lower === 'c'){
              seen = true;
              x += dx;
              y += dy;
              continue;
            }
          }
          break;
        } else {
          if (pieceColor(cell) === enemy && cell.toLowerCase() === 'c'){
            return true;
          }
          break;
        }
      }
    }
    return false;
  }

  function isInCheck(board, color){
    const general = findGeneral(board, color);
    if (!general) return false;
    const [gx, gy] = general;
    if (generalsFacing(board)) return true;
    if (isSoldierThreat(board, gx, gy, color)) return true;
    if (isHorseThreat(board, gx, gy, color)) return true;
    if (isRookOrCannonThreat(board, gx, gy, color)) return true;
    return false;
  }

  function simulateMove(board, move){
    const next = cloneBoard(board);
    const piece = next[move.fromY][move.fromX];
    next[move.fromY][move.fromX] = null;
    next[move.toY][move.toX] = piece;
    return next;
  }

  function pushIfValid(board, moves, fromX, fromY, toX, toY, color){
    if (!inBounds(toX, toY)) return;
    const target = board[toY][toX];
    if (target && pieceColor(target) === color) return;
    moves.push({ fromX, fromY, toX, toY, capture: !!target, capturedPiece: target });
  }

  function generatePseudoMoves(board, x, y){
    const piece = board[y][x];
    if (!piece) return [];
    const color = pieceColor(piece);
    const lower = piece.toLowerCase();
    const moves = [];
    if (lower === 'k'){
      const steps = [ [1,0], [-1,0], [0,1], [0,-1] ];
      for (const [dx, dy] of steps){
        const nx = x + dx;
        const ny = y + dy;
        if (!inBounds(nx, ny)) continue;
        if (!isInsidePalace(nx, ny, color)) continue;
        const target = board[ny][nx];
        if (target && pieceColor(target) === color) continue;
        moves.push({ fromX: x, fromY: y, toX: nx, toY: ny, capture: !!target, capturedPiece: target });
      }
      // capture enemy general if facing with no pieces in between
      const dir = color === 'red' ? -1 : 1;
      let ny = y + dir;
      while (inBounds(x, ny)){
        const cell = board[ny][x];
        if (!cell){
          ny += dir;
          continue;
        }
        if (cell.toLowerCase() === 'k' && pieceColor(cell) !== color){
          if (isInsidePalace(x, ny, opposite(color))){
            moves.push({ fromX: x, fromY: y, toX: x, toY: ny, capture: true, capturedPiece: cell });
          }
        }
        break;
      }
      return moves;
    }
    if (lower === 'a'){
      const steps = [ [1,1], [1,-1], [-1,1], [-1,-1] ];
      for (const [dx, dy] of steps){
        const nx = x + dx;
        const ny = y + dy;
        if (!inBounds(nx, ny) || !isInsidePalace(nx, ny, color)) continue;
        pushIfValid(board, moves, x, y, nx, ny, color);
      }
      return moves;
    }
    if (lower === 'e'){
      const steps = [ [2,2], [2,-2], [-2,2], [-2,-2] ];
      for (const [dx, dy] of steps){
        const nx = x + dx;
        const ny = y + dy;
        if (!inBounds(nx, ny)) continue;
        if (color === 'red' && ny <= 4) continue;
        if (color === 'black' && ny >= 5) continue;
        const legX = x + dx / 2;
        const legY = y + dy / 2;
        if (board[legY][legX]) continue;
        pushIfValid(board, moves, x, y, nx, ny, color);
      }
      return moves;
    }
    if (lower === 'h'){
      for (const move of HORSE_MOVES){
        const nx = x + move.dx;
        const ny = y + move.dy;
        if (!inBounds(nx, ny)) continue;
        const legX = x + move.leg.dx;
        const legY = y + move.leg.dy;
        if (!inBounds(legX, legY)) continue;
        if (board[legY][legX]) continue;
        pushIfValid(board, moves, x, y, nx, ny, color);
      }
      return moves;
    }
    if (lower === 'r'){
      const dirs = [ [1,0], [-1,0], [0,1], [0,-1] ];
      for (const [dx, dy] of dirs){
        let nx = x + dx;
        let ny = y + dy;
        while (inBounds(nx, ny)){
          const target = board[ny][nx];
          if (!target){
            moves.push({ fromX: x, fromY: y, toX: nx, toY: ny, capture: false, capturedPiece: null });
          } else {
            if (pieceColor(target) !== color){
              moves.push({ fromX: x, fromY: y, toX: nx, toY: ny, capture: true, capturedPiece: target });
            }
            break;
          }
          nx += dx;
          ny += dy;
        }
      }
      return moves;
    }
    if (lower === 'c'){
      const dirs = [ [1,0], [-1,0], [0,1], [0,-1] ];
      for (const [dx, dy] of dirs){
        let nx = x + dx;
        let ny = y + dy;
        let jumped = false;
        while (inBounds(nx, ny)){
          const target = board[ny][nx];
          if (!jumped){
            if (!target){
              moves.push({ fromX: x, fromY: y, toX: nx, toY: ny, capture: false, capturedPiece: null });
            } else {
              jumped = true;
            }
          } else {
            if (target){
              if (pieceColor(target) !== color){
                moves.push({ fromX: x, fromY: y, toX: nx, toY: ny, capture: true, capturedPiece: target });
              }
              break;
            }
          }
          nx += dx;
          ny += dy;
        }
      }
      return moves;
    }
    if (lower === 's'){
      const dir = color === 'red' ? -1 : 1;
      const forwardY = y + dir;
      if (inBounds(x, forwardY)){
        pushIfValid(board, moves, x, y, x, forwardY, color);
      }
      if (hasCrossedRiver(y, color)){
        if (inBounds(x + 1, y)) pushIfValid(board, moves, x, y, x + 1, y, color);
        if (inBounds(x - 1, y)) pushIfValid(board, moves, x, y, x - 1, y, color);
      }
      return moves;
    }
    return moves;
  }

  function generateLegalMoves(board, x, y){
    const piece = board[y][x];
    if (!piece) return [];
    const color = pieceColor(piece);
    const pseudo = generatePseudoMoves(board, x, y);
    const legal = [];
    for (const move of pseudo){
      const next = simulateMove(board, move);
      if (generalsFacing(next)) continue;
      if (isInCheck(next, color)) continue;
      legal.push(move);
    }
    return legal;
  }

  function generateAllLegalMoves(board, color){
    const moves = [];
    for (let y = 0; y < BOARD_HEIGHT; y++){
      for (let x = 0; x < BOARD_WIDTH; x++){
        const piece = board[y][x];
        if (!piece || pieceColor(piece) !== color) continue;
        const legal = generateLegalMoves(board, x, y);
        for (const move of legal){
          moves.push(move);
        }
      }
    }
    return moves;
  }

  function create(root, awardXp = () => {}, options = {}){
    ensureStyle();
    const difficulty = (options && options.difficulty) || 'NORMAL';

    const container = document.createElement('div');
    container.className = 'mini-xiangqi-root';

    const info = document.createElement('div');
    info.className = 'mini-xiangqi-info';
    const header = document.createElement('h2');
    const headerTitle = document.createElement('span');
    const headerSubtitle = document.createElement('span');
    header.appendChild(headerTitle);
    header.appendChild(headerSubtitle);
    info.appendChild(header);

    const turnLine = document.createElement('div');
    turnLine.className = 'status-line';
    const messageLine = document.createElement('div');
    messageLine.className = 'status-line';
    const scoreLine = document.createElement('div');
    scoreLine.className = 'status-line';

    info.appendChild(turnLine);
    info.appendChild(messageLine);
    info.appendChild(scoreLine);

    const boardEl = document.createElement('div');
    boardEl.className = 'mini-xiangqi-board';

    const controls = document.createElement('div');
    controls.className = 'mini-xiangqi-controls';
    const resetBtn = document.createElement('button');
    resetBtn.textContent = '初期配置に戻す';
    controls.appendChild(resetBtn);

    container.appendChild(info);
    container.appendChild(boardEl);
    container.appendChild(controls);

    root.appendChild(container);

    const cells = [];
    const riverCells = [];
    for (let y = 0; y < BOARD_HEIGHT; y++){
      const row = [];
      for (let x = 0; x < BOARD_WIDTH; x++){
        const cell = document.createElement('div');
        cell.className = 'mini-xiangqi-cell';
        if (y === 4){
          cell.dataset.river = 'true';
          cell.dataset.riverLabel = '楚河　漢界';
          riverCells.push(cell);
        }
        cell.dataset.x = String(x);
        cell.dataset.y = String(y);
        boardEl.appendChild(cell);
        row.push(cell);
      }
      cells.push(row);
    }

    let board = cloneBoard(START_POSITION);
    let turn = 'red';
    let selected = null;
    let legalMoves = [];
    let running = false;
    let ended = false;
    let lastMove = null;
    let playerScore = 0;
    let lastMessageSpec = null;
    let detachLocaleListener = null;

    function resetState(){
      board = cloneBoard(START_POSITION);
      turn = 'red';
      selected = null;
      legalMoves = [];
      ended = false;
      lastMove = null;
      playerScore = 0;
      updateBoard();
      updateInfo(null);
    }

    function evaluateSpec(spec, fallbackValue){
      if (!spec){
        return evaluateFallback(fallbackValue);
      }
      if (typeof spec === 'string'){
        return spec;
      }
      const params = typeof spec.params === 'function' ? spec.params() : spec.params;
      const fallback = spec.fallback !== undefined ? spec.fallback : fallbackValue;
      if (spec.key){
        return text(spec.key, fallback, params);
      }
      return evaluateFallback(fallback, params);
    }

    function getColorName(color){
      const key = COLOR_NAME_KEYS[color];
      const fallback = COLOR_NAME_DEFAULTS[color];
      return text(key, fallback !== undefined ? fallback : (color == null ? '' : String(color)));
    }

    function getPlayerLabel(color){
      const key = PLAYER_LABEL_KEYS[color];
      const fallback = PLAYER_LABEL_DEFAULTS[color];
      return text(key, fallback !== undefined ? fallback : getColorName(color));
    }

    function getPieceName(piece){
      if (!piece) return text(null, '駒');
      const lower = piece.toLowerCase();
      const key = PIECE_NAME_KEYS[lower];
      const fallback = PIECE_NAME_DEFAULTS[lower] || '駒';
      return text(key, fallback);
    }

    function getExpLabel(){
      return text('minigame.xiangqi.expLabel', 'EXP');
    }

    function describePiece(piece){
      if (!piece) return '';
      const color = pieceColor(piece);
      const colorName = getColorName(color);
      const name = getPieceName(piece);
      return text('minigame.xiangqi.piece.description', ({ color: c, piece: p }) => `${c}の${p}`, {
        color: colorName,
        piece: name
      });
    }

    function renderInfo(){
      const turnLabel = getPlayerLabel(turn);
      turnLine.textContent = text('minigame.xiangqi.status.turnLine', ({ turn: t }) => `手番: ${t}`, { turn: turnLabel });

      const defaultMessageSpec = {
        key: turn === 'red' ? 'minigame.xiangqi.status.turn.red' : 'minigame.xiangqi.status.turn.black',
        fallback: ({ color }) => `${color}の番です`,
        params: () => ({ color: getColorName(turn) })
      };
      const defaultMessageText = evaluateSpec(defaultMessageSpec);
      const messageText = lastMessageSpec ? evaluateSpec(lastMessageSpec, defaultMessageText) : defaultMessageText;
      messageLine.textContent = messageText;

      const roundedScore = Math.round(playerScore);
      const formattedScore = formatLocalizedNumber(roundedScore);
      scoreLine.textContent = text('minigame.xiangqi.status.scoreLine', ({ score }) => `合計スコア: ${score}`, {
        score: formattedScore,
        rawScore: roundedScore
      });
    }

    function updateInfo(messageSpec){
      lastMessageSpec = messageSpec || null;
      renderInfo();
    }

    function updateBoard(){
      for (let y = 0; y < BOARD_HEIGHT; y++){
        for (let x = 0; x < BOARD_WIDTH; x++){
          const cell = cells[y][x];
          cell.dataset.highlight = '';
          const piece = board[y][x];
          cell.innerHTML = '';
          if (piece){
            const span = document.createElement('span');
            span.textContent = PIECE_GLYPHS[piece] || '?';
            span.dataset.color = pieceColor(piece);
            if (lastMove && lastMove.toX === x && lastMove.toY === y){
              span.dataset.moved = 'true';
            }
            cell.appendChild(span);
          }
          if (selected && selected.x === x && selected.y === y){
            cell.dataset.highlight = 'select';
          }
        }
      }
      for (const move of legalMoves){
        const cell = cells[move.toY][move.toX];
        if (move.capture){
          cell.dataset.highlight = 'capture';
        } else {
          cell.dataset.highlight = 'move';
        }
      }
      const checkedColor = turn;
      if (isInCheck(board, checkedColor)){
        const pos = findGeneral(board, checkedColor);
        if (pos){
          cells[pos[1]][pos[0]].dataset.highlight = 'check';
        }
      }
    }

    function refreshStaticTexts(){
      headerTitle.textContent = text('minigame.xiangqi.header.title', 'シャンチー');
      headerSubtitle.textContent = text('minigame.xiangqi.header.subtitle', ({ color }) => `${color}が先手`, {
        color: getColorName('red')
      });
      resetBtn.textContent = text('minigame.xiangqi.controls.reset', '初期配置に戻す');
      const riverLabel = text('minigame.xiangqi.board.riverLabel', '楚河　漢界');
      for (const cell of riverCells){
        cell.dataset.riverLabel = riverLabel;
      }
    }

    function handleLocaleChange(){
      refreshStaticTexts();
      renderInfo();
    }

    function handleMove(move){
      const piece = board[move.fromY][move.fromX];
      const captured = board[move.toY][move.toX];
      board[move.fromY][move.fromX] = null;
      board[move.toY][move.toX] = piece;
      lastMove = { fromX: move.fromX, fromY: move.fromY, toX: move.toX, toY: move.toY };
      selected = null;
      legalMoves = [];

      if (captured){
        const type = captured.toLowerCase();
        const exp = CAPTURE_EXP[type] || 40;
        playerScore += PIECE_VALUES[type] || 1;
        awardXp(exp, { reason: 'capture', piece: type, color: pieceColor(piece) });
        updateInfo({
          key: 'minigame.xiangqi.status.capture',
          fallback: ({ actor, target, exp: value, expLabel }) => `${actor}が${target}を取りました (+${value}${expLabel})`,
          params: () => ({
            actor: describePiece(piece),
            target: describePiece(captured),
            exp: formatLocalizedNumber(exp),
            expRaw: exp,
            expLabel: getExpLabel()
          })
        });
      } else {
        updateInfo({
          key: 'minigame.xiangqi.status.move',
          fallback: ({ piece: p }) => `${p}が移動しました`,
          params: () => ({ piece: describePiece(piece) })
        });
      }

      const nextTurn = opposite(turn);
      turn = nextTurn;

      const opponentInCheck = isInCheck(board, turn);
      if (opponentInCheck){
        awardXp(CHECK_EXP, { reason: 'check', against: turn });
      }

      const nextMoves = generateAllLegalMoves(board, turn);
      if (nextMoves.length === 0){
        ended = true;
        if (opponentInCheck){
          const winner = opposite(turn);
          awardXp(WIN_EXP[difficulty] || WIN_EXP.NORMAL, { reason: 'win' });
          updateInfo({
            key: 'minigame.xiangqi.status.win',
            fallback: ({ loser, winner: w }) => `${loser}が詰みました。${w}の勝利！`,
            params: () => ({
              winner: getColorName(winner),
              loser: getColorName(turn)
            })
          });
        } else {
          awardXp(STALEMATE_EXP, { reason: 'stalemate' });
          updateInfo({
            key: 'minigame.xiangqi.status.stalemate',
            fallback: '持将軍（合法手がありません）'
          });
        }
      } else {
        if (opponentInCheck){
          updateInfo({
            key: 'minigame.xiangqi.status.check',
            fallback: ({ defender, exp: value, expLabel }) => `${defender}が王手を受けています (+${value}${expLabel})`,
            params: () => ({
              defender: getColorName(turn),
              exp: formatLocalizedNumber(CHECK_EXP),
              expRaw: CHECK_EXP,
              expLabel: getExpLabel()
            })
          });
        } else {
          updateInfo(null);
        }
      }

      updateBoard();
    }

    function handleCellClick(event){
      if (!running || ended) return;
      const cell = event.currentTarget;
      const x = Number(cell.dataset.x);
      const y = Number(cell.dataset.y);
      const existingMove = legalMoves.find(m => m.toX === x && m.toY === y);
      if (existingMove){
        handleMove(existingMove);
        return;
      }
      const piece = board[y][x];
      if (piece && pieceColor(piece) === turn){
        selected = { x, y };
        legalMoves = generateLegalMoves(board, x, y);
      } else {
        selected = null;
        legalMoves = [];
      }
      updateBoard();
    }

    refreshStaticTexts();
    renderInfo();

    const activeI18n = getActiveI18n();
    if (typeof activeI18n?.onLocaleChanged === 'function'){
      try {
        detachLocaleListener = activeI18n.onLocaleChanged(() => handleLocaleChange());
      } catch (error){
        console.warn('[xiangqi] Failed to attach i18n locale listener:', error);
      }
    }
    document.addEventListener('i18n:locale-changed', handleLocaleChange);

    function start(){
      if (running) return;
      running = true;
      for (let y = 0; y < BOARD_HEIGHT; y++){
        for (let x = 0; x < BOARD_WIDTH; x++){
          cells[y][x].addEventListener('click', handleCellClick);
        }
      }
      resetBtn.addEventListener('click', resetState);
      resetState();
    }

    function stop(){
      if (!running) return;
      running = false;
      for (let y = 0; y < BOARD_HEIGHT; y++){
        for (let x = 0; x < BOARD_WIDTH; x++){
          cells[y][x].removeEventListener('click', handleCellClick);
        }
      }
      resetBtn.removeEventListener('click', resetState);
    }

    function destroy(){
      stop();
      document.removeEventListener('i18n:locale-changed', handleLocaleChange);
      if (typeof detachLocaleListener === 'function'){
        try { detachLocaleListener(); } catch {}
        detachLocaleListener = null;
      }
      try { root.removeChild(container); } catch {}
    }

    function getScore(){
      return Math.round(playerScore);
    }

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({
    id: 'xiangqi',
    name: 'シャンチー', nameKey: 'selection.miniexp.games.xiangqi.name',
    description: '中国の将棋・象棋。駒取り・王手・詰みでEXPを獲得', descriptionKey: 'selection.miniexp.games.xiangqi.description', categoryIds: ['board'],
    create
  });
})();

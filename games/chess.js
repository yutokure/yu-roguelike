(function(){
  'use strict';

  const BOARD_SIZE = 8;
  const TILE_SIZE = 64;
  const LIGHT_COLOR = '#f0d9b5';
  const DARK_COLOR = '#b58863';
  const SELECT_COLOR = 'rgba(250, 204, 21, 0.55)';
  const MOVE_COLOR = 'rgba(34, 197, 94, 0.4)';
  const CAPTURE_COLOR = 'rgba(220, 38, 38, 0.45)';
  const LAST_MOVE_COLOR = 'rgba(59, 130, 246, 0.35)';
  const CHECK_COLOR = 'rgba(248, 113, 113, 0.6)';

  const PIECE_GLYPHS = {
    'P': '♙', 'N': '♘', 'B': '♗', 'R': '♖', 'Q': '♕', 'K': '♔',
    'p': '♟', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛', 'k': '♚'
  };

  const PIECE_VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
  const CAPTURE_EXP = { p: 25, n: 60, b: 60, r: 110, q: 160, k: 400 };
  const CHECK_EXP = 25;
  const PROMOTE_EXP = 120;
  const WIN_EXP = { EASY: 260, NORMAL: 420, HARD: 650 };
  const DRAW_EXP = 60;

  const START_POSITION = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
  ];

  function ensureStyle(){
    if (document.getElementById('mini-chess-style')) return;
    const style = document.createElement('style');
    style.id = 'mini-chess-style';
    style.textContent = `
      .mini-chess-root { display: flex; flex-direction: column; gap: 8px; align-items: center; font-family: 'Segoe UI', 'Hiragino Sans', sans-serif; }
      .mini-chess-board { box-shadow: 0 6px 16px rgba(15, 23, 42, 0.25); border-radius: 8px; overflow: hidden; background: #111827; }
      .mini-chess-info { width: 100%; max-width: 512px; color: #111827; background: #f8fafc; border-radius: 8px; padding: 12px 16px; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2); }
      .mini-chess-info h2 { margin: 0 0 6px; font-size: 1rem; display: flex; justify-content: space-between; align-items: center; }
      .mini-chess-info .status-line { font-size: 0.9rem; margin-bottom: 4px; }
      .mini-chess-info .status-line strong { color: #1f2937; }
      .mini-chess-info .message { font-size: 0.85rem; color: #1e3a8a; }
      .mini-chess-controls { display: flex; gap: 8px; justify-content: center; }
      .mini-chess-controls button { background: #2563eb; color: #f8fafc; border: none; padding: 6px 12px; border-radius: 999px; font-weight: 600; cursor: pointer; }
      .mini-chess-controls button:hover { background: #1d4ed8; }
      .mini-chess-controls button:disabled { background: #93c5fd; cursor: not-allowed; }
    `;
    document.head.appendChild(style);
  }

  function boardCells(board){
    return board && board.cells ? board.cells : board;
  }

  function cloneBoard(board){
    const cells = boardCells(board);
    const clone = cells.map(row => row.slice());
    if (board && board.cells){
      return {
        cells: clone,
        castling: {
          w: { kingSide: !!board.castling?.w?.kingSide, queenSide: !!board.castling?.w?.queenSide },
          b: { kingSide: !!board.castling?.b?.kingSide, queenSide: !!board.castling?.b?.queenSide }
        },
        enPassant: board.enPassant ? { x: board.enPassant.x, y: board.enPassant.y } : null
      };
    }
    return clone;
  }

  function inBounds(x, y){
    return x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;
  }

  function pieceColor(piece){
    if (!piece) return null;
    return piece === piece.toUpperCase() ? 'w' : 'b';
  }

  function opposite(color){
    return color === 'w' ? 'b' : 'w';
  }

  function createMove(fromX, fromY, toX, toY, options = {}){
    return {
      fromX, fromY, toX, toY,
      piece: options.piece || null,
      captured: options.captured || null,
      promote: options.promote || false,
      promoteTo: options.promoteTo || null,
      castle: options.castle || null,
      enPassant: options.enPassant || false
    };
  }

  function promotionPieceFor(piece, desired){
    const color = pieceColor(piece);
    if (!desired){
      return color === 'w' ? 'Q' : 'q';
    }
    const lower = desired.toString().toLowerCase();
    const mapped = lower === 'r' ? 'r' : lower === 'b' ? 'b' : lower === 'n' ? 'n' : 'q';
    return color === 'w' ? mapped.toUpperCase() : mapped;
  }

  function applyMoveOn(board, move){
    const next = cloneBoard(board);
    const cells = boardCells(next);
    const piece = cells[move.fromY][move.fromX];
    const color = pieceColor(piece);
    cells[move.fromY][move.fromX] = null;
    let placed = piece;

    if (!next.castling){
      next.castling = {
        w: { kingSide: false, queenSide: false },
        b: { kingSide: false, queenSide: false }
      };
    }
    if (!next.castling[color]){
      next.castling[color] = { kingSide: false, queenSide: false };
    }
    const opponentColor = opposite(color);
    if (!next.castling[opponentColor]){
      next.castling[opponentColor] = { kingSide: false, queenSide: false };
    }

    next.enPassant = null;

    if (move.castle){
      const isKingSide = move.toX > move.fromX;
      const rookFromX = isKingSide ? move.toX + 1 : move.toX - 2;
      const rookToX = isKingSide ? move.toX - 1 : move.toX + 1;
      cells[move.toY][rookFromX] = null;
      cells[move.toY][rookToX] = color === 'w' ? 'R' : 'r';
      next.castling[color].kingSide = false;
      next.castling[color].queenSide = false;
    } else if (piece.toLowerCase() === 'k'){
      next.castling[color].kingSide = false;
      next.castling[color].queenSide = false;
    }

    if (piece.toLowerCase() === 'r'){
      if (color === 'w'){
        if (move.fromX === 0 && move.fromY === 7) next.castling.w.queenSide = false;
        if (move.fromX === 7 && move.fromY === 7) next.castling.w.kingSide = false;
      } else {
        if (move.fromX === 0 && move.fromY === 0) next.castling.b.queenSide = false;
        if (move.fromX === 7 && move.fromY === 0) next.castling.b.kingSide = false;
      }
    }

    if (move.enPassant){
      const captureY = move.toY + (color === 'w' ? 1 : -1);
      if (inBounds(move.toX, captureY)){
        cells[captureY][move.toX] = null;
      }
    }

    if (move.promote){
      placed = promotionPieceFor(piece, move.promoteTo);
    }

    cells[move.toY][move.toX] = placed;

    if (move.captured && move.captured.toLowerCase() === 'r'){
      const opponent = opposite(color);
      if (move.toX === 0 && move.toY === (opponent === 'w' ? 7 : 0)){
        next.castling[opponent].queenSide = false;
      } else if (move.toX === 7 && move.toY === (opponent === 'w' ? 7 : 0)){
        next.castling[opponent].kingSide = false;
      }
    }

    if (piece.toLowerCase() === 'p' && Math.abs(move.toY - move.fromY) === 2){
      const dir = color === 'w' ? -1 : 1;
      next.enPassant = { x: move.fromX, y: move.fromY + dir };
    }

    return next;
  }

  function findKing(board, color){
    const cells = boardCells(board);
    const target = color === 'w' ? 'K' : 'k';
    for (let y = 0; y < BOARD_SIZE; y++){
      for (let x = 0; x < BOARD_SIZE; x++){
        if (cells[y][x] === target) return { x, y };
      }
    }
    return null;
  }

  function isSquareAttacked(board, x, y, byColor){
    const cells = boardCells(board);
    const forward = byColor === 'w' ? -1 : 1;
    const pawnRow = y + forward;
    if (inBounds(x - 1, pawnRow) && cells[pawnRow][x - 1] === (byColor === 'w' ? 'P' : 'p')) return true;
    if (inBounds(x + 1, pawnRow) && cells[pawnRow][x + 1] === (byColor === 'w' ? 'P' : 'p')) return true;

    const knightMoves = [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]];
    for (const [dx, dy] of knightMoves){
      const nx = x + dx;
      const ny = y + dy;
      if (!inBounds(nx, ny)) continue;
      const p = cells[ny][nx];
      if (p && pieceColor(p) === byColor && p.toLowerCase() === 'n') return true;
    }

    const directions = [[1,0],[-1,0],[0,1],[0,-1]];
    for (const [dx, dy] of directions){
      let nx = x + dx;
      let ny = y + dy;
      while (inBounds(nx, ny)){
        const p = cells[ny][nx];
        if (p){
          if (pieceColor(p) === byColor){
            const lower = p.toLowerCase();
            if (lower === 'r' || lower === 'q') return true;
            if (lower === 'k' && Math.abs(nx - x) <= 1 && Math.abs(ny - y) <= 1) return true;
          }
          break;
        }
        nx += dx;
        ny += dy;
      }
    }

    const diagonals = [[1,1],[-1,1],[1,-1],[-1,-1]];
    for (const [dx, dy] of diagonals){
      let nx = x + dx;
      let ny = y + dy;
      while (inBounds(nx, ny)){
        const p = cells[ny][nx];
        if (p){
          if (pieceColor(p) === byColor){
            const lower = p.toLowerCase();
            if (lower === 'b' || lower === 'q') return true;
            if (lower === 'k' && Math.abs(nx - x) <= 1 && Math.abs(ny - y) <= 1) return true;
          }
          break;
        }
        nx += dx;
        ny += dy;
      }
    }

    const king = byColor === 'w' ? 'K' : 'k';
    for (let dx = -1; dx <= 1; dx++){
      for (let dy = -1; dy <= 1; dy++){
        if (!dx && !dy) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (!inBounds(nx, ny)) continue;
        if (cells[ny][nx] === king) return true;
      }
    }
    return false;
  }

  function isKingInCheck(board, color){
    const king = findKing(board, color);
    if (!king) return true;
    return isSquareAttacked(board, king.x, king.y, opposite(color));
  }

  function generatePseudoMoves(board, x, y){
    const cells = boardCells(board);
    const piece = cells[y][x];
    if (!piece) return [];
    const color = pieceColor(piece);
    const lower = piece.toLowerCase();
    const moves = [];
    if (lower === 'p'){
      const dir = color === 'w' ? -1 : 1;
      const startRow = color === 'w' ? 6 : 1;
      const nextY = y + dir;
      if (inBounds(x, nextY) && !cells[nextY][x]){
        const promote = (color === 'w' && nextY === 0) || (color === 'b' && nextY === BOARD_SIZE - 1);
        moves.push(createMove(x, y, x, nextY, { piece, promote }));
        const jumpY = y + dir * 2;
        if (y === startRow && !cells[jumpY][x] && !cells[nextY][x]){
          moves.push(createMove(x, y, x, jumpY, { piece }));
        }
      }
      for (const dx of [-1, 1]){
        const nx = x + dx;
        const ny = y + dir;
        if (!inBounds(nx, ny)) continue;
        const target = cells[ny][nx];
        if (target && pieceColor(target) !== color){
          const promote = (color === 'w' && ny === 0) || (color === 'b' && ny === BOARD_SIZE - 1);
          moves.push(createMove(x, y, nx, ny, { piece, captured: target, promote }));
        } else if (board.enPassant && board.enPassant.x === nx && board.enPassant.y === ny){
          const captured = cells[y][nx];
          if (captured && pieceColor(captured) !== color && captured.toLowerCase() === 'p'){
            moves.push(createMove(x, y, nx, ny, { piece, captured, enPassant: true }));
          }
        }
      }
    } else if (lower === 'n'){
      const steps = [[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]];
      for (const [dx, dy] of steps){
        const nx = x + dx;
        const ny = y + dy;
        if (!inBounds(nx, ny)) continue;
        const target = cells[ny][nx];
        if (!target || pieceColor(target) !== color){
          moves.push(createMove(x, y, nx, ny, { piece, captured: target || null }));
        }
      }
    } else if (lower === 'b' || lower === 'r' || lower === 'q'){
      const dirs = [];
      if (lower !== 'b') dirs.push([1,0],[-1,0],[0,1],[0,-1]);
      if (lower !== 'r') dirs.push([1,1],[-1,1],[1,-1],[-1,-1]);
      for (const [dx, dy] of dirs){
        let nx = x + dx;
        let ny = y + dy;
        while (inBounds(nx, ny)){
          const target = cells[ny][nx];
          if (!target){
            moves.push(createMove(x, y, nx, ny, { piece }));
          } else {
            if (pieceColor(target) !== color){
              moves.push(createMove(x, y, nx, ny, { piece, captured: target }));
            }
            break;
          }
          nx += dx;
          ny += dy;
        }
      }
    } else if (lower === 'k'){
      for (let dx = -1; dx <= 1; dx++){
        for (let dy = -1; dy <= 1; dy++){
          if (!dx && !dy) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (!inBounds(nx, ny)) continue;
          const target = cells[ny][nx];
          if (!target || pieceColor(target) !== color){
            moves.push(createMove(x, y, nx, ny, { piece, captured: target || null }));
          }
        }
      }
      const rights = board.castling ? board.castling[color] : null;
      if (rights && rights.kingSide && !isKingInCheck(board, color)){
        const squares = [x + 1, x + 2];
        if (squares.every(nx => inBounds(nx, y) && !cells[y][nx])){
          if (!isSquareAttacked(board, x + 1, y, opposite(color)) && !isSquareAttacked(board, x + 2, y, opposite(color))){
            const rookSquare = x + 3;
            if (inBounds(rookSquare, y)){
              const rook = cells[y][rookSquare];
              if (rook && pieceColor(rook) === color && rook.toLowerCase() === 'r'){
                moves.push(createMove(x, y, x + 2, y, { piece, castle: { side: 'king' } }));
              }
            }
          }
        }
      }
      if (rights && rights.queenSide && !isKingInCheck(board, color)){
        const path = [x - 1, x - 2];
        const betweenClear = path.every(nx => inBounds(nx, y) && !cells[y][nx]);
        const bSquare = x - 3;
        if (betweenClear && inBounds(bSquare, y) && !cells[y][bSquare]){
          if (!isSquareAttacked(board, x - 1, y, opposite(color)) && !isSquareAttacked(board, x - 2, y, opposite(color))){
            const rookSquare = x - 4;
            if (inBounds(rookSquare, y)){
              const rook = cells[y][rookSquare];
              if (rook && pieceColor(rook) === color && rook.toLowerCase() === 'r'){
                moves.push(createMove(x, y, x - 2, y, { piece, castle: { side: 'queen' } }));
              }
            }
          }
        }
      }
    }
    return moves;
  }

  function generateLegalMoves(board, color){
    const moves = [];
    const cells = boardCells(board);
    for (let y = 0; y < BOARD_SIZE; y++){
      for (let x = 0; x < BOARD_SIZE; x++){
        const piece = cells[y][x];
        if (!piece || pieceColor(piece) !== color) continue;
        const pseudo = generatePseudoMoves(board, x, y);
        for (const move of pseudo){
          const next = applyMoveOn(board, move);
          if (!isKingInCheck(next, color)){
            moves.push({ ...move, piece });
          }
        }
      }
    }
    return moves;
  }

  function evaluateBoard(board){
    let score = 0;
    const cells = boardCells(board);
    for (let y = 0; y < BOARD_SIZE; y++){
      for (let x = 0; x < BOARD_SIZE; x++){
        const piece = cells[y][x];
        if (!piece) continue;
        const value = PIECE_VALUES[piece.toLowerCase()] || 0;
        if (pieceColor(piece) === 'b') score += value;
        else score -= value;
      }
    }
    return score;
  }

  function minimax(board, depth, turn, alpha, beta){
    if (depth === 0) return evaluateBoard(board);
    const moves = generateLegalMoves(board, turn);
    if (moves.length === 0){
      if (isKingInCheck(board, turn)){
        return turn === 'b' ? -10000 - depth : 10000 + depth;
      }
      return 0;
    }
    if (turn === 'b'){
      let value = -Infinity;
      for (const move of moves){
        const next = applyMoveOn(board, move);
        const result = minimax(next, depth - 1, 'w', alpha, beta);
        value = Math.max(value, result);
        alpha = Math.max(alpha, value);
        if (alpha >= beta) break;
      }
      return value;
    } else {
      let value = Infinity;
      for (const move of moves){
        const next = applyMoveOn(board, move);
        const result = minimax(next, depth - 1, 'b', alpha, beta);
        value = Math.min(value, result);
        beta = Math.min(beta, value);
        if (alpha >= beta) break;
      }
      return value;
    }
  }

  function chooseAiMove(board, depth){
    const moves = generateLegalMoves(board, 'b');
    if (moves.length === 0) return null;
    let bestScore = -Infinity;
    let bestMoves = [];
    for (const move of moves){
      const next = applyMoveOn(board, move);
      const score = minimax(next, depth - 1, 'w', -Infinity, Infinity);
      if (score > bestScore + 1e-3){
        bestScore = score;
        bestMoves = [move];
      } else if (Math.abs(score - bestScore) <= 1e-3){
        bestMoves.push(move);
      }
    }
    if (!bestMoves.length) return moves[Math.floor(Math.random() * moves.length)];
    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
  }

  function insufficientMaterial(board){
    const cells = boardCells(board);
    let minors = [];
    for (let y = 0; y < BOARD_SIZE; y++){
      for (let x = 0; x < BOARD_SIZE; x++){
        const piece = cells[y][x];
        if (!piece) continue;
        const lower = piece.toLowerCase();
        if (lower === 'p' || lower === 'q' || lower === 'r') return false;
        if (lower !== 'k'){
          minors.push({ piece, squareColor: (x + y) % 2 });
        }
      }
    }
    if (minors.length === 0) return true;
    if (minors.length === 1){
      const lower = minors[0].piece.toLowerCase();
      return lower === 'b' || lower === 'n';
    }
    if (minors.length === 2){
      const [a, b] = minors;
      const lowerA = a.piece.toLowerCase();
      const lowerB = b.piece.toLowerCase();
      if (lowerA === 'n' && lowerB === 'n') return true;
      if (lowerA === 'b' && lowerB === 'b' && a.squareColor === b.squareColor) return true;
    }
    return false;
  }

  function createInitialBoard(){
    return {
      cells: START_POSITION.map(row => row.slice()),
      castling: {
        w: { kingSide: true, queenSide: true },
        b: { kingSide: true, queenSide: true }
      },
      enPassant: null
    };
  }

  function create(root, awardXp = () => {}, options = {}){
    ensureStyle();

    const difficulty = (options.difficulty || 'NORMAL').toUpperCase();
    const depth = difficulty === 'HARD' ? 3 : difficulty === 'EASY' ? 1 : 2;
    const aiDelay = difficulty === 'HARD' ? 240 : difficulty === 'EASY' ? 420 : 320;

    const container = document.createElement('div');
    container.className = 'mini-chess-root';

    const infoBox = document.createElement('div');
    infoBox.className = 'mini-chess-info';

    const heading = document.createElement('h2');
    const title = document.createElement('span');
    title.textContent = 'チェス';
    const diffTag = document.createElement('span');
    diffTag.textContent = `難易度: ${difficulty}`;
    heading.appendChild(title);
    heading.appendChild(diffTag);

    const turnLine = document.createElement('div');
    turnLine.className = 'status-line';
    const scoreLine = document.createElement('div');
    scoreLine.className = 'status-line';
    const messageLine = document.createElement('div');
    messageLine.className = 'message';

    infoBox.appendChild(heading);
    infoBox.appendChild(turnLine);
    infoBox.appendChild(scoreLine);
    infoBox.appendChild(messageLine);

    const controls = document.createElement('div');
    controls.className = 'mini-chess-controls';
    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'リスタート';
    controls.appendChild(resetBtn);
    infoBox.appendChild(controls);

    const canvas = document.createElement('canvas');
    canvas.width = TILE_SIZE * BOARD_SIZE;
    canvas.height = TILE_SIZE * BOARD_SIZE;
    canvas.className = 'mini-chess-board';
    canvas.style.maxWidth = 'min(100%, 512px)';
    canvas.style.touchAction = 'manipulation';

    container.appendChild(infoBox);
    container.appendChild(canvas);
    root.appendChild(container);

    const ctx = canvas.getContext('2d');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let board = createInitialBoard();
    let turn = 'w';
    let running = false;
    let selected = null;
    let legalMoves = [];
    let lastMove = null;
    let aiTimer = null;
    let message = '';
    let playerScore = 0;
    let halfMoveClock = 0;
    let totalMoves = 0;

    function updateInfo(){
      if (!running){
        turnLine.innerHTML = '<strong>停止中</strong>';
      } else {
        const t = turn === 'w' ? 'あなたの番です' : 'AIの思考中…';
        turnLine.innerHTML = `<strong>手番:</strong> ${t}`;
      }
      scoreLine.innerHTML = `<strong>スコア:</strong> ${playerScore}`;
      messageLine.textContent = message || '';
    }

    function setMessage(text){
      message = text || '';
      updateInfo();
    }

    function resetSelection(){
      selected = null;
      legalMoves = [];
    }

    function drawBoard(){
      const cells = boardCells(board);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let y = 0; y < BOARD_SIZE; y++){
        for (let x = 0; x < BOARD_SIZE; x++){
          const isLight = (x + y) % 2 === 0;
          ctx.fillStyle = isLight ? LIGHT_COLOR : DARK_COLOR;
          ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }

      if (lastMove){
        ctx.fillStyle = LAST_MOVE_COLOR;
        ctx.fillRect(lastMove.fromX * TILE_SIZE, lastMove.fromY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        ctx.fillRect(lastMove.toX * TILE_SIZE, lastMove.toY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }

      const whiteKing = findKing(board, 'w');
      if (whiteKing && isSquareAttacked(board, whiteKing.x, whiteKing.y, 'b')){
        ctx.fillStyle = CHECK_COLOR;
        ctx.fillRect(whiteKing.x * TILE_SIZE, whiteKing.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
      const blackKing = findKing(board, 'b');
      if (blackKing && isSquareAttacked(board, blackKing.x, blackKing.y, 'w')){
        ctx.fillStyle = CHECK_COLOR;
        ctx.fillRect(blackKing.x * TILE_SIZE, blackKing.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }

      if (selected){
        ctx.fillStyle = SELECT_COLOR;
        ctx.fillRect(selected.x * TILE_SIZE, selected.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        for (const move of legalMoves){
          ctx.fillStyle = move.captured ? CAPTURE_COLOR : MOVE_COLOR;
          ctx.beginPath();
          ctx.arc((move.toX + 0.5) * TILE_SIZE, (move.toY + 0.5) * TILE_SIZE, move.captured ? 20 : 12, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.font = '42px "Segoe UI Symbol", "Noto Sans Symbols2", sans-serif';
      for (let y = 0; y < BOARD_SIZE; y++){
        for (let x = 0; x < BOARD_SIZE; x++){
          const piece = cells[y][x];
          if (!piece) continue;
          ctx.fillStyle = pieceColor(piece) === 'w' ? '#1f2937' : '#0f172a';
          ctx.fillText(PIECE_GLYPHS[piece] || '?', (x + 0.5) * TILE_SIZE, (y + 0.5) * TILE_SIZE + 3);
        }
      }
    }

    function startAiTurn(){
      if (aiTimer) clearTimeout(aiTimer);
      if (!running) return;
      aiTimer = setTimeout(() => {
        aiTimer = null;
        if (!running) return;
        const move = chooseAiMove(board, Math.max(1, depth));
        if (!move){
          evaluateGameEnd('w');
          return;
        }
        executeMove(move, 'b');
        drawBoard();
        updateInfo();
      }, aiDelay);
    }

    function evaluateGameEnd(lastMover){
      const opponent = opposite(lastMover);
      const moves = generateLegalMoves(board, opponent);
      const inCheck = isKingInCheck(board, opponent);
      if (moves.length === 0){
        if (inCheck){
          if (opponent === 'b'){
            awardXp(WIN_EXP[difficulty] || WIN_EXP.NORMAL, { reason: 'checkmate' });
            setMessage('チェックメイト！勝利しました。');
          } else {
            setMessage('チェックメイトを受けました…');
          }
        } else {
          awardXp(DRAW_EXP, { reason: 'draw' });
          setMessage('ステイルメイト。引き分けです。');
        }
        running = false;
        resetSelection();
        updateInfo();
        return true;
      }
      if (halfMoveClock >= 100 || totalMoves >= 200 || insufficientMaterial(board)){
        awardXp(DRAW_EXP, { reason: 'draw' });
        setMessage('引き分け扱いになりました。');
        running = false;
        updateInfo();
        return true;
      }
      return false;
    }

    function executeMove(move, mover){
      const cells = boardCells(board);
      const piece = cells[move.fromY][move.fromX];
      const captured = move.captured || cells[move.toY][move.toX] || null;

      if (move.promote && mover === 'w'){
        awardXp(PROMOTE_EXP, { reason: 'promotion' });
        playerScore += 9;
      }

      board = applyMoveOn(board, move);
      lastMove = { ...move };
      resetSelection();

      if (captured){
        halfMoveClock = 0;
        if (mover === 'w'){
          const lower = captured.toLowerCase();
          const exp = CAPTURE_EXP[lower] || 40;
          awardXp(exp, { reason: 'capture' });
          playerScore += (PIECE_VALUES[lower] || 0) / 100 * 10;
        }
      } else if (piece.toLowerCase() === 'p'){
        halfMoveClock = 0;
      } else {
        halfMoveClock++;
      }

      totalMoves++;
      turn = opposite(mover);

      const opponent = turn;
      const moverColor = mover;
      const king = findKing(board, opponent);
      const attacker = opposite(opponent);
      const inCheck = king && isSquareAttacked(board, king.x, king.y, attacker);
      if (inCheck){
        if (moverColor === 'w'){
          awardXp(CHECK_EXP, { reason: 'check' });
          setMessage('チェック！');
        } else {
          setMessage('チェックされています！');
        }
      } else if (moverColor === 'w'){
        setMessage('');
      } else {
        setMessage('');
      }

      if (!evaluateGameEnd(mover)){
        updateInfo();
        if (turn === 'b'){
          startAiTurn();
        }
      }
    }

    function handleClick(ev){
      if (!running || turn !== 'w') return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = Math.floor((ev.clientX - rect.left) * scaleX / TILE_SIZE);
      const y = Math.floor((ev.clientY - rect.top) * scaleY / TILE_SIZE);
      if (!inBounds(x, y)) return;
      const cells = boardCells(board);
      const piece = cells[y][x];
      if (selected){
        const move = legalMoves.find(m => m.toX === x && m.toY === y);
        if (move){
          if (move.promote){
            const choice = window.prompt('昇格する駒を選んでください (Q/R/B/N)', 'Q');
            if (choice){
              const trimmed = choice.trim();
              move.promoteTo = (trimmed.charAt(0) || 'Q').toUpperCase();
            } else {
              move.promoteTo = 'Q';
            }
          }
          executeMove(move, 'w');
          drawBoard();
          return;
        }
      }
      if (piece && pieceColor(piece) === 'w'){
        selected = { x, y };
        legalMoves = generateLegalMoves(board, 'w').filter(m => m.fromX === x && m.fromY === y);
        setMessage('移動するマスを選択してください');
      } else {
        resetSelection();
      }
      drawBoard();
      updateInfo();
    }

    function resetGameState(){
      if (aiTimer){
        clearTimeout(aiTimer);
        aiTimer = null;
      }
      board = createInitialBoard();
      turn = 'w';
      lastMove = null;
      resetSelection();
      message = '';
      playerScore = 0;
      halfMoveClock = 0;
      totalMoves = 0;
      drawBoard();
      updateInfo();
    }

    function handleResetClick(){
      resetGameState();
      updateInfo();
    }

    function start(){
      if (running) return;
      resetGameState();
      running = true;
      canvas.addEventListener('click', handleClick);
      resetBtn.addEventListener('click', handleResetClick);
      updateInfo();
    }

    function stop(){
      if (!running) return;
      running = false;
      canvas.removeEventListener('click', handleClick);
      resetBtn.removeEventListener('click', handleResetClick);
      if (aiTimer){
        clearTimeout(aiTimer);
        aiTimer = null;
      }
      updateInfo();
    }

    function destroy(){
      stop();
      try { root.removeChild(container); } catch {}
    }

    function getScore(){
      return Math.round(playerScore);
    }

    resetGameState();

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({
    id: 'chess',
    name: 'チェス',
    description: '本格チェス。駒取りとチェックでEXPを得て、詰ませて勝利しよう',
    create
  });
})();

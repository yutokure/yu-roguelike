(function(){
  'use strict';

  const BOARD_SIZE = 9;
  const TILE_SIZE = 64;
  const BOARD_MARGIN = 24;
  const LIGHT_COLOR = '#f5f5f4';
  const DARK_COLOR = '#e2e8f0';
  const GRID_COLOR = '#94a3b8';
  const SELECT_COLOR = 'rgba(234, 179, 8, 0.55)';
  const MOVE_COLOR = 'rgba(56, 189, 248, 0.35)';
  const CAPTURE_COLOR = 'rgba(248, 113, 113, 0.45)';
  const LAST_MOVE_COLOR = 'rgba(96, 165, 250, 0.35)';
  const CHECK_COLOR = 'rgba(248, 113, 113, 0.6)';

  const PIECE_NAMES = { P: '歩', L: '香', N: '桂', S: '銀', G: '金', B: '角', R: '飛', K: '玉' };
  const PROMOTED_NAMES = { P: 'と', L: '成香', N: '成桂', S: '成銀', B: '馬', R: '龍' };
  const HAND_ORDER = ['R', 'B', 'G', 'S', 'N', 'L', 'P'];

  const PIECE_VALUES = { P: 100, L: 240, N: 260, S: 320, G: 360, B: 540, R: 650, K: 12000 };
  const CAPTURE_EXP = { P: 8, L: 12, N: 14, S: 16, G: 18, B: 28, R: 34, K: 200 };
  const PROMOTE_EXP = 18;
  const CHECK_EXP = 14;
  const MOVE_EXP = 1;
  const DROP_EXP = 1;
  const WIN_EXP = { EASY: 260, NORMAL: 420, HARD: 700 };
  const DRAW_EXP = 120;

  const START_POSITION = [
    ['l','n','s','g','k','g','s','n','l'],
    [null,'r',null,null,null,null,null,'b',null],
    ['p','p','p','p','p','p','p','p','p'],
    [null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null,null],
    ['P','P','P','P','P','P','P','P','P'],
    [null,'B',null,null,null,null,null,'R',null],
    ['L','N','S','G','K','G','S','N','L']
  ];

  function ensureStyle(){
    if (document.getElementById('mini-shogi-style')) return;
    const style = document.createElement('style');
    style.id = 'mini-shogi-style';
    style.textContent = `
      .mini-shogi-root { display: flex; flex-direction: column; gap: 12px; align-items: center; font-family: 'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic UI', sans-serif; }
      .mini-shogi-info { background: #0f172a; color: #f8fafc; padding: 12px 16px; border-radius: 12px; box-shadow: 0 8px 22px rgba(15,23,42,0.35); width: min(560px, 92vw); }
      .mini-shogi-info h2 { margin: 0 0 6px; font-size: 1.1rem; display: flex; justify-content: space-between; align-items: baseline; }
      .mini-shogi-info p { margin: 4px 0; font-size: 0.9rem; line-height: 1.4; }
      .mini-shogi-hands { display: flex; gap: 12px; width: min(560px, 92vw); }
      .mini-shogi-hand { flex: 1; background: #f8fafc; color: #0f172a; border-radius: 12px; box-shadow: 0 8px 20px rgba(15,23,42,0.2); padding: 10px 12px; display: flex; flex-direction: column; gap: 6px; }
      .mini-shogi-hand h3 { margin: 0; font-size: 0.95rem; display: flex; justify-content: space-between; align-items: center; }
      .mini-shogi-hand .pieces { display: flex; flex-wrap: wrap; gap: 6px; }
      .mini-shogi-chip { display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; padding: 4px 10px; font-size: 0.85rem; font-weight: 600; background: #e2e8f0; color: #0f172a; cursor: default; }
      .mini-shogi-chip.selectable { cursor: pointer; background: #fee2e2; color: #991b1b; box-shadow: inset 0 0 0 2px rgba(220,38,38,0.45); }
      .mini-shogi-chip.active { background: #f97316; color: #fff; box-shadow: 0 0 0 2px rgba(124,45,18,0.4); }
      .mini-shogi-board { box-shadow: 0 18px 32px rgba(15,23,42,0.35); border-radius: 16px; overflow: hidden; background: #fefce8; position: relative; }
      .mini-shogi-legend { font-size: 0.8rem; color: #334155; text-align: center; }
      .mini-shogi-actions { display: flex; gap: 12px; }
      .mini-shogi-actions button { border: none; border-radius: 999px; padding: 6px 18px; font-weight: 600; font-size: 0.9rem; cursor: pointer; background: #2563eb; color: #f8fafc; }
      .mini-shogi-actions button:hover { background: #1d4ed8; }
      .mini-shogi-actions button:disabled { background: #94a3b8; cursor: not-allowed; }
    `;
    document.head.appendChild(style);
  }

  function createPiece(type, owner, promoted){
    return { type, owner, promoted: !!promoted };
  }

  function cloneBoard(board){
    return board.map(row => row.map(cell => cell ? { type: cell.type, owner: cell.owner, promoted: cell.promoted } : null));
  }

  function cloneHands(hands){
    return {
      w: { P: hands.w.P, L: hands.w.L, N: hands.w.N, S: hands.w.S, G: hands.w.G, B: hands.w.B, R: hands.w.R },
      b: { P: hands.b.P, L: hands.b.L, N: hands.b.N, S: hands.b.S, G: hands.b.G, B: hands.b.B, R: hands.b.R }
    };
  }

  function opposite(color){
    return color === 'w' ? 'b' : 'w';
  }

  function isInBounds(x, y){
    return x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;
  }

  function isPromotionZone(color, y){
    return color === 'w' ? y <= 2 : y >= BOARD_SIZE - 3;
  }

  function pieceCanPromote(type){
    return type !== 'K' && type !== 'G';
  }

  function promotionForced(type, color, toY){
    if (type === 'P' || type === 'L'){
      return (color === 'w' && toY === 0) || (color === 'b' && toY === BOARD_SIZE - 1);
    }
    if (type === 'N'){
      return (color === 'w' && toY <= 1) || (color === 'b' && toY >= BOARD_SIZE - 2);
    }
    return false;
  }

  function direction(color){
    return color === 'w' ? -1 : 1;
  }

  function goldSteps(color){
    return color === 'w'
      ? [[0,-1],[-1,-1],[1,-1],[-1,0],[1,0],[0,1]]
      : [[0,1],[-1,1],[1,1],[-1,0],[1,0],[0,-1]];
  }

  function silverSteps(color){
    return color === 'w'
      ? [[-1,-1],[0,-1],[1,-1],[-1,1],[1,1]]
      : [[-1,1],[0,1],[1,1],[-1,-1],[1,-1]];
  }

  function kingSteps(){
    return [[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];
  }

  function generatePieceMoves(board, x, y){
    const piece = board[y][x];
    if (!piece) return [];
    const color = piece.owner;
    const dir = direction(color);
    const moves = [];

    const addStep = (dx, dy) => {
      const nx = x + dx;
      const ny = y + dy;
      if (!isInBounds(nx, ny)) return;
      const target = board[ny][nx];
      if (!target || target.owner !== color){
        moves.push({ from: { x, y }, to: { x: nx, y: ny }, capture: target ? target.type : null });
      }
    };

    const addSlide = (dx, dy) => {
      let nx = x + dx;
      let ny = y + dy;
      while (isInBounds(nx, ny)){
        const target = board[ny][nx];
        if (!target){
          moves.push({ from: { x, y }, to: { x: nx, y: ny }, capture: null });
        } else {
          if (target.owner !== color){
            moves.push({ from: { x, y }, to: { x: nx, y: ny }, capture: target.type });
          }
          break;
        }
        nx += dx;
        ny += dy;
      }
    };

    if (piece.promoted){
      if (piece.type === 'B'){
        [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([dx,dy]) => addSlide(dx,dy));
        [[0,-1],[0,1],[-1,0],[1,0]].forEach(([dx,dy]) => addStep(dx,dy));
        return moves;
      }
      if (piece.type === 'R'){
        [[0,-1],[0,1],[-1,0],[1,0]].forEach(([dx,dy]) => addSlide(dx,dy));
        [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([dx,dy]) => addStep(dx,dy));
        return moves;
      }
      goldSteps(color).forEach(([dx,dy]) => addStep(dx,dy));
      return moves;
    }

    switch (piece.type){
      case 'P':
        addStep(0, dir);
        break;
      case 'L':
        addSlide(0, dir);
        break;
      case 'N':
        addStep(-1, dir * 2);
        addStep(1, dir * 2);
        break;
      case 'S':
        silverSteps(color).forEach(([dx,dy]) => addStep(dx,dy));
        break;
      case 'G':
        goldSteps(color).forEach(([dx,dy]) => addStep(dx,dy));
        break;
      case 'B':
        [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([dx,dy]) => addSlide(dx,dy));
        break;
      case 'R':
        [[0,-1],[0,1],[-1,0],[1,0]].forEach(([dx,dy]) => addSlide(dx,dy));
        break;
      case 'K':
        kingSteps().forEach(([dx,dy]) => addStep(dx,dy));
        break;
    }

    return moves;
  }
  function generatePseudoMoves(board, hands, color){
    const moves = [];
    for (let y = 0; y < BOARD_SIZE; y++){
      for (let x = 0; x < BOARD_SIZE; x++){
        const piece = board[y][x];
        if (!piece || piece.owner !== color) continue;
        const pieceMoves = generatePieceMoves(board, x, y);
        for (const mv of pieceMoves){
          const fromPiece = board[y][x];
          const promoteCandidates = [];
          if (fromPiece.promoted || !pieceCanPromote(fromPiece.type)){
            promoteCandidates.push(false);
          } else {
            const inZone = isPromotionZone(color, y) || isPromotionZone(color, mv.to.y);
            if (inZone){
              if (promotionForced(fromPiece.type, color, mv.to.y)){
                promoteCandidates.push(true);
              } else {
                promoteCandidates.push(false, true);
              }
            } else {
              promoteCandidates.push(false);
            }
          }
          for (const promote of promoteCandidates){
            moves.push({
              from: { x, y },
              to: { x: mv.to.x, y: mv.to.y },
              piece: fromPiece.type,
              promote,
              capture: mv.capture,
              drop: false
            });
          }
        }
      }
    }

    for (const type of HAND_ORDER){
      const count = hands[color][type];
      if (!count) continue;
      for (let y = 0; y < BOARD_SIZE; y++){
        for (let x = 0; x < BOARD_SIZE; x++){
          if (board[y][x]) continue;
          if (!dropAllowed(board, color, type, x, y)) continue;
          moves.push({
            from: null,
            to: { x, y },
            piece: type,
            promote: false,
            capture: null,
            drop: true
          });
        }
      }
    }

    return moves;
  }

  function dropAllowed(board, color, type, x, y){
    if (type === 'P'){
      if ((color === 'w' && y === 0) || (color === 'b' && y === BOARD_SIZE - 1)) return false;
      for (let yy = 0; yy < BOARD_SIZE; yy++){
        const cell = board[yy][x];
        if (cell && cell.owner === color && cell.type === 'P' && !cell.promoted){
          return false;
        }
      }
    }
    if (type === 'L'){
      if ((color === 'w' && y === 0) || (color === 'b' && y === BOARD_SIZE - 1)) return false;
    }
    if (type === 'N'){
      if ((color === 'w' && y <= 1) || (color === 'b' && y >= BOARD_SIZE - 2)) return false;
    }
    return true;
  }

  function findKing(board, color){
    for (let y = 0; y < BOARD_SIZE; y++){
      for (let x = 0; x < BOARD_SIZE; x++){
        const piece = board[y][x];
        if (piece && piece.owner === color && piece.type === 'K'){
          return { x, y };
        }
      }
    }
    return null;
  }

  function isSquareAttacked(board, attackerColor, x, y){
    for (let yy = 0; yy < BOARD_SIZE; yy++){
      for (let xx = 0; xx < BOARD_SIZE; xx++){
        const piece = board[yy][xx];
        if (!piece || piece.owner !== attackerColor) continue;
        const moves = generatePieceMoves(board, xx, yy);
        for (const mv of moves){
          if (mv.to.x === x && mv.to.y === y){
            return true;
          }
        }
      }
    }
    return false;
  }

  function isKingInCheck(board, color){
    const king = findKing(board, color);
    if (!king) return true;
    return isSquareAttacked(board, opposite(color), king.x, king.y);
  }

  function applyMove(board, hands, color, move){
    const nextBoard = cloneBoard(board);
    const nextHands = cloneHands(hands);
    let capturedType = null;
    if (move.drop){
      if (nextHands[color][move.piece] <= 0) return { board: board, hands, capturedType: null };
      nextHands[color][move.piece]--;
      nextBoard[move.to.y][move.to.x] = createPiece(move.piece, color, false);
    } else {
      const moving = nextBoard[move.from.y][move.from.x];
      if (!moving || moving.owner !== color) return { board, hands, capturedType: null };
      const target = nextBoard[move.to.y][move.to.x];
      if (target){
        capturedType = target.type;
        nextHands[color][capturedType] = (nextHands[color][capturedType] || 0) + 1;
      }
      nextBoard[move.from.y][move.from.x] = null;
      const placed = createPiece(moving.type, color, moving.promoted);
      if (move.promote){
        placed.promoted = true;
      }
      nextBoard[move.to.y][move.to.x] = placed;
    }
    return { board: nextBoard, hands: nextHands, capturedType };
  }

  function generateLegalMoves(board, hands, color){
    const pseudo = generatePseudoMoves(board, hands, color);
    const legal = [];
    for (const move of pseudo){
      const { board: nextBoard, hands: nextHands } = applyMove(board, hands, color, move);
      if (!isKingInCheck(nextBoard, color)){
        legal.push(move);
      }
    }
    return legal;
  }

  function evaluateBoard(board, hands){
    let score = 0;
    for (let y = 0; y < BOARD_SIZE; y++){
      for (let x = 0; x < BOARD_SIZE; x++){
        const piece = board[y][x];
        if (!piece) continue;
        let value = PIECE_VALUES[piece.type] || 0;
        if (piece.promoted) value += 120;
        score += piece.owner === 'b' ? value : -value;
      }
    }
    for (const color of ['w','b']){
      for (const type of HAND_ORDER){
        const count = hands[color][type];
        if (!count) continue;
        const value = (PIECE_VALUES[type] || 0) * 0.9 * count;
        score += color === 'b' ? value : -value;
      }
    }
    return score;
  }

  function minimax(board, hands, depth, maximizing, alpha, beta){
    const color = maximizing ? 'b' : 'w';
    if (depth === 0){
      return evaluateBoard(board, hands);
    }
    const moves = generateLegalMoves(board, hands, color);
    if (moves.length === 0){
      const inCheck = isKingInCheck(board, color);
      if (maximizing){
        return inCheck ? -99999 + depth : 0;
      }
      return inCheck ? 99999 - depth : 0;
    }
    if (maximizing){
      let best = -Infinity;
      for (const mv of moves){
        const { board: nextBoard, hands: nextHands } = applyMove(board, hands, color, mv);
        const evalScore = minimax(nextBoard, nextHands, depth - 1, false, alpha, beta);
        best = Math.max(best, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (alpha >= beta) break;
      }
      return best;
    }
    let best = Infinity;
    for (const mv of moves){
      const { board: nextBoard, hands: nextHands } = applyMove(board, hands, color, mv);
      const evalScore = minimax(nextBoard, nextHands, depth - 1, true, alpha, beta);
      best = Math.min(best, evalScore);
      beta = Math.min(beta, evalScore);
      if (alpha >= beta) break;
    }
    return best;
  }
  function create(root, awardXp, opts){
    ensureStyle();
    const difficulty = (opts && opts.difficulty) || 'NORMAL';

    const container = document.createElement('div');
    container.className = 'mini-shogi-root';

    const info = document.createElement('div');
    info.className = 'mini-shogi-info';
    info.innerHTML = `
      <h2>将棋 <span>MiniExp版</span></h2>
      <p class="status-line">あなたの番です。駒を選択するか持ち駒をクリックしてください。</p>
      <p class="message"></p>
    `;
    container.appendChild(info);
    const statusLine = info.querySelector('.status-line');
    const messageLine = info.querySelector('.message');

    const handsWrap = document.createElement('div');
    handsWrap.className = 'mini-shogi-hands';

    const aiHandBox = document.createElement('div');
    aiHandBox.className = 'mini-shogi-hand';
    aiHandBox.innerHTML = `<h3>先手 (CPU)<span class="count"></span></h3><div class="pieces"></div>`;
    const aiPieces = aiHandBox.querySelector('.pieces');
    const aiCountLabel = aiHandBox.querySelector('.count');

    const playerHandBox = document.createElement('div');
    playerHandBox.className = 'mini-shogi-hand';
    playerHandBox.innerHTML = `<h3>後手 (あなた)<span class="count"></span></h3><div class="pieces"></div>`;
    const playerPieces = playerHandBox.querySelector('.pieces');
    const playerCountLabel = playerHandBox.querySelector('.count');

    handsWrap.appendChild(aiHandBox);
    handsWrap.appendChild(playerHandBox);
    container.appendChild(handsWrap);

    const boardHolder = document.createElement('div');
    boardHolder.className = 'mini-shogi-board';
    const canvas = document.createElement('canvas');
    const canvasSize = TILE_SIZE * BOARD_SIZE + BOARD_MARGIN * 2;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    canvas.style.display = 'block';
    canvas.style.maxWidth = '95vw';
    boardHolder.appendChild(canvas);
    container.appendChild(boardHolder);

    const legend = document.createElement('div');
    legend.className = 'mini-shogi-legend';
    legend.textContent = '指し手:+1EXP / 持ち駒投入:+1EXP / 捕獲でボーナス / 成り:+18EXP / 王手:+14EXP / 勝利ボーナスあり';
    container.appendChild(legend);

    const actions = document.createElement('div');
    actions.className = 'mini-shogi-actions';
    const restartBtn = document.createElement('button');
    restartBtn.textContent = 'リスタート';
    actions.appendChild(restartBtn);
    container.appendChild(actions);

    root.appendChild(container);

    const ctx = canvas.getContext('2d');

    let board = START_POSITION.map(row => row.map(cell => {
      if (!cell) return null;
      const lower = cell === cell.toLowerCase();
      return createPiece(cell.toUpperCase(), lower ? 'b' : 'w', false);
    }));
    let hands = {
      w: { P:0, L:0, N:0, S:0, G:0, B:0, R:0 },
      b: { P:0, L:0, N:0, S:0, G:0, B:0, R:0 }
    };
    let turn = 'w';
    let running = false;
    let ended = false;
    let resultText = '';
    let legalMoves = [];
    let selected = null;
    let selectedDrop = null;
    let availableMoves = [];
    let hover = null;
    let lastMove = null;

    function setup(){
      board = START_POSITION.map(row => row.map(cell => {
        if (!cell) return null;
        const lower = cell === cell.toLowerCase();
        return createPiece(cell.toUpperCase(), lower ? 'b' : 'w', false);
      }));
      hands = {
        w: { P:0, L:0, N:0, S:0, G:0, B:0, R:0 },
        b: { P:0, L:0, N:0, S:0, G:0, B:0, R:0 }
      };
      turn = 'w';
      ended = false;
      resultText = '';
      legalMoves = generateLegalMoves(board, hands, 'w');
      selected = null;
      selectedDrop = null;
      availableMoves = [];
      hover = null;
      lastMove = null;
      updateStatus();
      renderHands();
      draw();
    }

    function pieceGlyph(piece){
      if (!piece) return '';
      if (piece.promoted && PROMOTED_NAMES[piece.type]){
        return PROMOTED_NAMES[piece.type];
      }
      return PIECE_NAMES[piece.type] || piece.type;
    }

    function draw(){
      const size = canvas.width;
      ctx.clearRect(0,0,size,size);
      ctx.fillStyle = '#fefce8';
      ctx.fillRect(0,0,size,size);
      const offset = BOARD_MARGIN;
      for (let y = 0; y < BOARD_SIZE; y++){
        for (let x = 0; x < BOARD_SIZE; x++){
          ctx.fillStyle = (x + y) % 2 === 0 ? LIGHT_COLOR : DARK_COLOR;
          ctx.fillRect(offset + x * TILE_SIZE, offset + y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }

      if (lastMove){
        ctx.fillStyle = LAST_MOVE_COLOR;
        ctx.fillRect(offset + lastMove.to.x * TILE_SIZE, offset + lastMove.to.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        if (!lastMove.drop){
          ctx.fillRect(offset + lastMove.from.x * TILE_SIZE, offset + lastMove.from.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }

      if (selected){
        ctx.fillStyle = SELECT_COLOR;
        ctx.fillRect(offset + selected.x * TILE_SIZE, offset + selected.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }

      if (availableMoves.length){
        for (const mv of availableMoves){
          ctx.fillStyle = mv.capture ? CAPTURE_COLOR : MOVE_COLOR;
          ctx.fillRect(offset + mv.to.x * TILE_SIZE, offset + mv.to.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }

      if (!ended){
        const inCheck = isKingInCheck(board, turn);
        if (inCheck){
          const king = findKing(board, turn);
          if (king){
            ctx.fillStyle = CHECK_COLOR;
            ctx.fillRect(offset + king.x * TILE_SIZE, offset + king.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          }
        }
      }

      ctx.strokeStyle = GRID_COLOR;
      ctx.lineWidth = 1.5;
      const boardSize = TILE_SIZE * BOARD_SIZE;
      for (let i = 0; i <= BOARD_SIZE; i++){
        const line = offset + i * TILE_SIZE;
        ctx.beginPath();
        ctx.moveTo(offset, line);
        ctx.lineTo(offset + boardSize, line);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(line, offset);
        ctx.lineTo(line, offset + boardSize);
        ctx.stroke();
      }

      for (let y = 0; y < BOARD_SIZE; y++){
        for (let x = 0; x < BOARD_SIZE; x++){
          const piece = board[y][x];
          if (!piece) continue;
          const cx = offset + x * TILE_SIZE + TILE_SIZE / 2;
          const cy = offset + y * TILE_SIZE + TILE_SIZE / 2;
          ctx.save();
          if (piece.owner === 'b'){
            ctx.translate(cx, cy);
            ctx.rotate(Math.PI);
            ctx.translate(-cx, -cy);
          }
          ctx.fillStyle = '#111827';
          ctx.font = `${Math.floor(TILE_SIZE * 0.55)}px 'Noto Sans JP', 'Hiragino Sans', sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(pieceGlyph(piece), cx, cy + 2);
          ctx.restore();
        }
      }

      if (hover){
        ctx.strokeStyle = 'rgba(30,64,175,0.85)';
        ctx.lineWidth = 2;
        ctx.strokeRect(offset + hover.x * TILE_SIZE + 2, offset + hover.y * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);
      }
    }

    function renderHands(){
      aiPieces.innerHTML = '';
      playerPieces.innerHTML = '';
      let aiTotal = 0;
      let playerTotal = 0;
      for (const type of HAND_ORDER){
        const aiCount = hands.b[type];
        if (aiCount){
          aiTotal += aiCount;
          const chip = document.createElement('div');
          chip.className = 'mini-shogi-chip';
          chip.textContent = `${PIECE_NAMES[type]}×${aiCount}`;
          aiPieces.appendChild(chip);
        }
        const playerCount = hands.w[type];
        if (playerCount){
          playerTotal += playerCount;
          const chip = document.createElement('div');
          chip.className = 'mini-shogi-chip selectable';
          chip.dataset.type = type;
          chip.textContent = `${PIECE_NAMES[type]}×${playerCount}`;
          if (selectedDrop === type){
            chip.classList.add('active');
          }
          chip.addEventListener('click', () => {
            if (turn !== 'w' || ended) return;
            if (selectedDrop === type){
              selectedDrop = null;
              availableMoves = [];
            } else {
              selected = null;
              selectedDrop = type;
              availableMoves = legalMoves.filter(m => m.drop && m.piece === type);
            }
            renderHands();
            draw();
          });
          playerPieces.appendChild(chip);
        }
      }
      if (!aiPieces.childElementCount){
        const empty = document.createElement('div');
        empty.className = 'mini-shogi-chip';
        empty.textContent = 'なし';
        aiPieces.appendChild(empty);
      }
      if (!playerPieces.childElementCount){
        const empty = document.createElement('div');
        empty.className = 'mini-shogi-chip';
        empty.textContent = 'なし';
        playerPieces.appendChild(empty);
      }
      aiCountLabel.textContent = aiTotal ? `${aiTotal}枚` : 'なし';
      playerCountLabel.textContent = playerTotal ? `${playerTotal}枚` : 'なし';
    }

    function updateStatus(){
      if (ended){
        statusLine.textContent = resultText;
        messageLine.textContent = '';
        return;
      }
      statusLine.textContent = turn === 'w' ? 'あなたの番です。駒または持ち駒を選んでください。' : 'CPUが指し手を検討中…';
      if (turn === 'w' && isKingInCheck(board, 'w')){
        messageLine.textContent = '王手を受けています！対応してください。';
      } else if (turn === 'b' && isKingInCheck(board, 'b')){
        messageLine.textContent = '王手！決め手を狙いましょう。';
      } else {
        messageLine.textContent = '';
      }
    }

    function pickMoveFromCell(cell){
      const matches = availableMoves.filter(m => m.to.x === cell.x && m.to.y === cell.y);
      if (!matches.length) return null;
      if (matches.length === 1) return matches[0];
      const promote = matches.find(m => m.promote);
      const normal = matches.find(m => !m.promote);
      if (promote && normal){
        const answer = window.confirm('成りますか？');
        return answer ? promote : normal;
      }
      return matches[0];
    }

    function applyMoveAndAward(move, color, award){
      const { board: nextBoard, hands: nextHands, capturedType } = applyMove(board, hands, color, move);
      board = nextBoard;
      hands = nextHands;
      lastMove = move.drop ? { from: move.to, to: move.to, drop: true } : { from: move.from, to: move.to, drop: false };
      if (award){
        awardXp(move.drop ? DROP_EXP : MOVE_EXP, { type: move.drop ? 'drop' : 'move' });
        if (capturedType){
          awardXp(CAPTURE_EXP[capturedType] || 14, { type: 'capture', piece: capturedType });
        }
        if (!move.drop && move.promote){
          awardXp(PROMOTE_EXP, { type: 'promote' });
        }
        const opponent = opposite(color);
        if (isKingInCheck(board, opponent)){
          awardXp(CHECK_EXP, { type: 'check' });
        }
      }
    }

    function checkForEnd(afterMoveColor){
      const opponent = opposite(afterMoveColor);
      const opponentMoves = generateLegalMoves(board, hands, opponent);
      const opponentInCheck = isKingInCheck(board, opponent);
      if (opponentMoves.length === 0){
        ended = true;
        if (opponentInCheck){
          if (afterMoveColor === 'w'){
            resultText = '詰み！あなたの勝利';
            awardXp(WIN_EXP[difficulty] || 420, { type: 'win' });
          } else {
            resultText = '詰まされました…敗北';
          }
        } else {
          resultText = '持将棋 / 千日手で引き分け';
          awardXp(DRAW_EXP, { type: 'draw' });
        }
        updateStatus();
        draw();
        return true;
      }
      return false;
    }

    function aiChooseMove(){
      const moves = generateLegalMoves(board, hands, 'b');
      if (!moves.length) return null;
      if (difficulty === 'EASY'){
        return moves[(Math.random() * moves.length) | 0];
      }
      if (difficulty === 'NORMAL'){
        let bestScore = -Infinity;
        let bestMove = moves[0];
        for (const mv of moves){
          const { board: nextBoard, hands: nextHands, capturedType } = applyMove(board, hands, 'b', mv);
          let score = evaluateBoard(nextBoard, nextHands);
          if (capturedType){
            score += (PIECE_VALUES[capturedType] || 120) * 0.4;
          }
          if (!mv.drop && mv.promote){
            score += 90;
          }
          if (isKingInCheck(nextBoard, 'w')){
            score += 120;
          }
          score += Math.random() * 20;
          if (score > bestScore){
            bestScore = score;
            bestMove = mv;
          }
        }
        return bestMove;
      }
      let bestScore = -Infinity;
      let bestMove = moves[0];
      const depth = 3;
      for (const mv of moves){
        const { board: nextBoard, hands: nextHands } = applyMove(board, hands, 'b', mv);
        const score = minimax(nextBoard, nextHands, depth - 1, false, -Infinity, Infinity);
        if (score > bestScore){
          bestScore = score;
          bestMove = mv;
        }
      }
      return bestMove;
    }

    function aiTurn(){
      if (ended) return;
      const move = aiChooseMove();
      if (!move){
        ended = true;
        resultText = '詰み！あなたの勝利';
        awardXp(WIN_EXP[difficulty] || 420, { type: 'win' });
        updateStatus();
        draw();
        return;
      }
      applyMoveAndAward(move, 'b', false);
      if (checkForEnd('b')){
        renderHands();
        return;
      }
      turn = 'w';
      legalMoves = generateLegalMoves(board, hands, 'w');
      selected = null;
      selectedDrop = null;
      availableMoves = [];
      renderHands();
      updateStatus();
      draw();
    }

    function handleClick(event){
      if (!running || ended) return;
      if (turn !== 'w') return;
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((event.clientX - rect.left - BOARD_MARGIN) / TILE_SIZE);
      const y = Math.floor((event.clientY - rect.top - BOARD_MARGIN) / TILE_SIZE);
      if (!isInBounds(x, y)) return;

      const picked = pickMoveFromCell({ x, y });
      if (picked){
        applyMoveAndAward(picked, 'w', true);
        renderHands();
        if (checkForEnd('w')){
          return;
        }
        turn = 'b';
        legalMoves = [];
        selected = null;
        selectedDrop = null;
        availableMoves = [];
        updateStatus();
        draw();
        setTimeout(() => {
          if (!ended){
            updateStatus();
            draw();
            aiTurn();
          }
        }, difficulty === 'HARD' ? 500 : 320);
        return;
      }

      const piece = board[y][x];
      if (piece && piece.owner === 'w'){
        selected = { x, y };
        selectedDrop = null;
        availableMoves = legalMoves.filter(m => !m.drop && m.from.x === x && m.from.y === y);
      } else {
        selected = null;
        availableMoves = [];
        selectedDrop = null;
      }
      draw();
    }

    function handleMove(event){
      if (!running) return;
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((event.clientX - rect.left - BOARD_MARGIN) / TILE_SIZE);
      const y = Math.floor((event.clientY - rect.top - BOARD_MARGIN) / TILE_SIZE);
      if (!isInBounds(x, y)){
        if (hover){
          hover = null;
          draw();
        }
        return;
      }
      if (!hover || hover.x !== x || hover.y !== y){
        hover = { x, y };
        draw();
      }
    }

    function handleLeave(){
      if (hover){
        hover = null;
        draw();
      }
    }

    function handleRestart(){
      setup();
    }

    function start(){
      if (running) return;
      running = true;
      setup();
      canvas.addEventListener('click', handleClick);
      canvas.addEventListener('mousemove', handleMove);
      canvas.addEventListener('mouseleave', handleLeave);
      restartBtn.addEventListener('click', handleRestart);
    }

    function stop(){
      if (!running) return;
      running = false;
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('mouseleave', handleLeave);
      restartBtn.removeEventListener('click', handleRestart);
    }

    function destroy(){
      try { stop(); } catch (err){}
      if (container.parentNode){
        container.parentNode.removeChild(container);
      }
    }

    function getScore(){
      let score = 0;
      for (let y = 0; y < BOARD_SIZE; y++){
        for (let x = 0; x < BOARD_SIZE; x++){
          const piece = board[y][x];
          if (!piece) continue;
          const value = (PIECE_VALUES[piece.type] || 0) + (piece.promoted ? 120 : 0);
          score += piece.owner === 'w' ? value : -value;
        }
      }
      for (const type of HAND_ORDER){
        score += (PIECE_VALUES[type] || 0) * hands.w[type];
        score -= (PIECE_VALUES[type] || 0) * hands.b[type];
      }
      return Math.max(0, Math.floor(score / 100));
    }

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({
    id: 'shogi',
    name: '将棋',
    description: '本格将棋。成りと持ち駒を駆使して詰みを狙おう',
    create
  });
})();

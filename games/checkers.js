(function(){
  'use strict';

  const SIZE = 8;
  const PLAYER_MAN = 1;
  const PLAYER_KING = 2;
  const AI_MAN = -1;
  const AI_KING = -2;
  const LIGHT_COLOR = '#f3f4f6';
  const DARK_COLOR = '#1f2937';
  const HIGHLIGHT_COLOR = 'rgba(59, 130, 246, 0.35)';
  const SELECT_COLOR = 'rgba(250, 204, 21, 0.55)';
  const MOVE_HINT_COLOR = 'rgba(236, 72, 153, 0.45)';
  const PIECE_COLORS = {
    [PLAYER_MAN]: '#dc2626',
    [PLAYER_KING]: '#b91c1c',
    [AI_MAN]: '#2563eb',
    [AI_KING]: '#1d4ed8'
  };
  const TEXT_COLOR = '#f8fafc';

  const PLAYER = 1;
  const AI = -1;

  const WIN_EXP = { EASY: 70, NORMAL: 160, HARD: 360 };

  const PLAYER_DIRS = [[-1, -1], [1, -1]];
  const AI_DIRS = [[-1, 1], [1, 1]];
  const KING_DIRS = [[-1, -1], [1, -1], [-1, 1], [1, 1]];

  function inBounds(x, y){
    return x >= 0 && x < SIZE && y >= 0 && y < SIZE;
  }

  function cloneBoard(board){
    return board.map(row => row.slice());
  }

  function countPieces(board, color){
    let n = 0;
    for (let y = 0; y < SIZE; y++){
      for (let x = 0; x < SIZE; x++){
        const v = board[y][x];
        if (Math.sign(v) === color) n++;
      }
    }
    return n;
  }

  function dirsForPiece(piece){
    const abs = Math.abs(piece);
    if (abs === 2) return KING_DIRS;
    return piece > 0 ? PLAYER_DIRS : AI_DIRS;
  }

  function promoteValue(piece){
    if (piece > 0) return PLAYER_KING;
    if (piece < 0) return AI_KING;
    return piece;
  }

  function generateCaptureMoves(board, x, y){
    const piece = board[y][x];
    if (piece === 0) return [];
    const color = Math.sign(piece);
    const moves = [];

    function backtrack(cx, cy, currentPiece, captured, landings, promoted){
      let branched = false;
      const dirs = dirsForPiece(currentPiece);
      for (const [dx, dy] of dirs){
        const mx = cx + dx;
        const my = cy + dy;
        const jx = cx + dx * 2;
        const jy = cy + dy * 2;
        if (!inBounds(mx, my) || !inBounds(jx, jy)) continue;
        const mid = board[my][mx];
        if (mid === 0 || Math.sign(mid) === color) continue;
        if (board[jy][jx] !== 0) continue;

        const savedFrom = board[cy][cx];
        const savedMid = board[my][mx];
        const savedDest = board[jy][jx];
        board[cy][cx] = 0;
        board[my][mx] = 0;
        let newPiece = currentPiece;
        let promotedNow = false;
        if (color === PLAYER && jy === 0 && Math.abs(currentPiece) === 1){
          newPiece = PLAYER_KING;
          promotedNow = true;
        } else if (color === AI && jy === SIZE - 1 && Math.abs(currentPiece) === 1){
          newPiece = AI_KING;
          promotedNow = true;
        }
        board[jy][jx] = newPiece;

        captured.push({ x: mx, y: my });
        landings.push({ x: jx, y: jy });
        branched = true;
        backtrack(jx, jy, newPiece, captured, landings, promoted || promotedNow);
        landings.pop();
        captured.pop();
        board[jy][jx] = savedDest;
        board[cy][cx] = savedFrom;
        board[my][mx] = savedMid;
      }
      if (!branched && captured.length > 0){
        const lastLanding = landings[landings.length - 1];
        moves.push({
          from: { x, y },
          to: { x: lastLanding.x, y: lastLanding.y },
          captures: captured.map(c => ({ x: c.x, y: c.y })),
          path: landings.map(p => ({ x: p.x, y: p.y })),
          promote: promoted
        });
      }
    }

    backtrack(x, y, piece, [], [], false);
    return moves;
  }

  function generateSimpleMoves(board, x, y){
    const piece = board[y][x];
    if (piece === 0) return [];
    const color = Math.sign(piece);
    const dirs = dirsForPiece(piece);
    const moves = [];
    for (const [dx, dy] of dirs){
      const nx = x + dx;
      const ny = y + dy;
      if (!inBounds(nx, ny)) continue;
      if (board[ny][nx] !== 0) continue;
      const promote = (Math.abs(piece) === 1) && ((color === PLAYER && ny === 0) || (color === AI && ny === SIZE - 1));
      moves.push({
        from: { x, y },
        to: { x: nx, y: ny },
        captures: [],
        path: [{ x: nx, y: ny }],
        promote
      });
    }
    return moves;
  }

  function getAllMoves(color, board){
    let captures = [];
    let normals = [];
    for (let y = 0; y < SIZE; y++){
      for (let x = 0; x < SIZE; x++){
        if (Math.sign(board[y][x]) !== color) continue;
        const caps = generateCaptureMoves(board, x, y);
        if (caps.length > 0){
          captures = captures.concat(caps);
        } else {
          normals = normals.concat(generateSimpleMoves(board, x, y));
        }
      }
    }
    return captures.length > 0 ? captures : normals;
  }

  function applyMoveToBoard(board, move){
    const next = cloneBoard(board);
    const piece = next[move.from.y][move.from.x];
    next[move.from.y][move.from.x] = 0;
    for (const c of move.captures){
      next[c.y][c.x] = 0;
    }
    let placed = piece;
    if (move.promote && Math.abs(piece) === 1){
      placed = promoteValue(piece);
    }
    next[move.to.y][move.to.x] = placed;
    return next;
  }

  function evaluateBoard(board){
    let score = 0;
    for (let y = 0; y < SIZE; y++){
      for (let x = 0; x < SIZE; x++){
        const v = board[y][x];
        if (v === 0) continue;
        const weight = Math.abs(v) === 2 ? 1.6 : 1;
        const bonus = (3.5 - Math.abs(x - 3.5)) * 0.05;
        score += Math.sign(v) === AI ? (weight + bonus) : -(weight + bonus);
      }
    }
    return score;
  }

  function minimax(board, depth, maximizing, alpha, beta){
    if (depth === 0) return evaluateBoard(board);
    const color = maximizing ? AI : PLAYER;
    const moves = getAllMoves(color, board);
    if (moves.length === 0){
      return maximizing ? -1000 - depth : 1000 + depth;
    }
    if (maximizing){
      let value = -Infinity;
      for (const mv of moves){
        const child = applyMoveToBoard(board, mv);
        const evalScore = minimax(child, depth - 1, false, alpha, beta);
        value = Math.max(value, evalScore);
        alpha = Math.max(alpha, value);
        if (alpha >= beta) break;
      }
      return value;
    } else {
      let value = Infinity;
      for (const mv of moves){
        const child = applyMoveToBoard(board, mv);
        const evalScore = minimax(child, depth - 1, true, alpha, beta);
        value = Math.min(value, evalScore);
        beta = Math.min(beta, value);
        if (beta <= alpha) break;
      }
      return value;
    }
  }

  function create(root, awardXp, opts){
    const difficulty = (opts && opts.difficulty) || 'NORMAL';
    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 520;
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    canvas.style.maxWidth = '100%';
    canvas.style.borderRadius = '8px';
    canvas.style.boxShadow = '0 6px 18px rgba(0,0,0,0.25)';
    root.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
    let turn = PLAYER;
    let running = false;
    let ended = false;
    let resultText = '';
    let selected = null;
    let availableMoves = [];
    let legalMoves = [];
    let hover = null;

    function setupBoard(){
      for (let y = 0; y < SIZE; y++){
        for (let x = 0; x < SIZE; x++){
          board[y][x] = 0;
        }
      }
      for (let y = 0; y < 3; y++){
        for (let x = 0; x < SIZE; x++){
          if ((x + y) % 2 === 1){
            board[y][x] = AI_MAN;
          }
        }
      }
      for (let y = SIZE - 3; y < SIZE; y++){
        for (let x = 0; x < SIZE; x++){
          if ((x + y) % 2 === 1){
            board[y][x] = PLAYER_MAN;
          }
        }
      }
      turn = PLAYER;
      ended = false;
      resultText = '';
      selected = null;
      availableMoves = [];
      legalMoves = getAllMoves(PLAYER, board);
    }

    function drawBoard(){
      const w = canvas.width;
      const h = canvas.height;
      const boardSize = Math.min(w, h - 60);
      const cell = boardSize / SIZE;
      const offsetX = (w - boardSize) / 2;
      const offsetY = 40;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, w, h);

      for (let y = 0; y < SIZE; y++){
        for (let x = 0; x < SIZE; x++){
          const color = (x + y) % 2 === 0 ? LIGHT_COLOR : DARK_COLOR;
          ctx.fillStyle = color;
          ctx.fillRect(offsetX + x * cell, offsetY + y * cell, cell, cell);
        }
      }

      if (hover && !ended){
        ctx.fillStyle = HIGHLIGHT_COLOR;
        ctx.fillRect(offsetX + hover.x * cell, offsetY + hover.y * cell, cell, cell);
      }

      if (selected){
        ctx.fillStyle = SELECT_COLOR;
        ctx.fillRect(offsetX + selected.x * cell, offsetY + selected.y * cell, cell, cell);
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.9)';
        ctx.lineWidth = 2;
        ctx.strokeRect(offsetX + selected.x * cell + 2, offsetY + selected.y * cell + 2, cell - 4, cell - 4);
      }

      if (availableMoves.length > 0){
        ctx.fillStyle = MOVE_HINT_COLOR;
        for (const mv of availableMoves){
          ctx.fillRect(offsetX + mv.to.x * cell, offsetY + mv.to.y * cell, cell, cell);
          ctx.strokeStyle = 'rgba(236, 72, 153, 0.9)';
          ctx.lineWidth = 2;
          ctx.strokeRect(offsetX + mv.to.x * cell + 4, offsetY + mv.to.y * cell + 4, cell - 8, cell - 8);
        }
      }

      for (let y = 0; y < SIZE; y++){
        for (let x = 0; x < SIZE; x++){
          const v = board[y][x];
          if (v === 0) continue;
          const color = PIECE_COLORS[v];
          const cx = offsetX + (x + 0.5) * cell;
          const cy = offsetY + (y + 0.5) * cell;
          const radius = cell * 0.38;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fillStyle = color || '#f97316';
          ctx.fill();
          ctx.strokeStyle = 'rgba(17, 24, 39, 0.75)';
          ctx.lineWidth = 2;
          ctx.stroke();
          if (Math.abs(v) === 2){
            ctx.fillStyle = 'rgba(255,255,255,0.85)';
            ctx.font = `${Math.floor(cell * 0.36)}px "Segoe UI", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('K', cx, cy);
          }
        }
      }

      ctx.fillStyle = TEXT_COLOR;
      ctx.textAlign = 'center';
      ctx.font = '20px system-ui, sans-serif';
      const turnText = ended ? resultText : (turn === PLAYER ? 'あなたの番 - 駒を選択して移動' : 'AI思考中...');
      ctx.fillText(turnText, w / 2, 24);
      ctx.font = '14px system-ui, sans-serif';
      ctx.fillText('移動: +1EXP / 捕獲: +6EXP×駒 / 王冠昇格: +12EXP', w / 2, h - 18);

      if (ended){
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = TEXT_COLOR;
        ctx.font = 'bold 30px system-ui, sans-serif';
        ctx.fillText(resultText, w / 2, h / 2 - 10);
        ctx.font = '16px system-ui, sans-serif';
        ctx.fillText('Rキーでリスタート', w / 2, h / 2 + 20);
      }
    }

    function screenToCell(e){
      const rect = canvas.getBoundingClientRect();
      const boardSize = Math.min(canvas.width, canvas.height - 60);
      const cell = boardSize / SIZE;
      const offsetX = (canvas.width - boardSize) / 2;
      const offsetY = 40;
      const x = Math.floor((e.clientX - rect.left - offsetX) / cell);
      const y = Math.floor((e.clientY - rect.top - offsetY) / cell);
      if (!inBounds(x, y)) return null;
      return { x, y };
    }

    function applyMove(move, color, award){
      const piece = board[move.from.y][move.from.x];
      board[move.from.y][move.from.x] = 0;
      for (const c of move.captures){
        board[c.y][c.x] = 0;
      }
      let placed = piece;
      if (move.promote && Math.abs(piece) === 1){
        placed = promoteValue(piece);
      }
      board[move.to.y][move.to.x] = placed;
      if (color === PLAYER && award){
        if (move.captures.length > 0){
          awardXp(move.captures.length * 6, { type: 'capture' });
        } else {
          awardXp(1, { type: 'move' });
        }
        if (move.promote){
          awardXp(12, { type: 'promote' });
        }
      }
    }

    function checkForEnd(){
      const playerPieces = countPieces(board, PLAYER);
      const aiPieces = countPieces(board, AI);
      if (playerPieces === 0 || getAllMoves(PLAYER, board).length === 0){
        ended = true;
        resultText = '敗北...';
        return true;
      }
      if (aiPieces === 0 || getAllMoves(AI, board).length === 0){
        ended = true;
        resultText = '勝利！';
        awardXp(WIN_EXP[difficulty] || 160, { type: 'win' });
        return true;
      }
      return false;
    }

    function aiChooseMove(){
      const moves = getAllMoves(AI, board);
      if (moves.length === 0) return null;
      if (difficulty === 'EASY'){
        return moves[(Math.random() * moves.length) | 0];
      }
      if (difficulty === 'NORMAL'){
        let best = -Infinity;
        let choice = moves[0];
        for (const mv of moves){
          let score = mv.captures.length * 4;
          if (mv.promote) score += 8;
          score += (3.5 - Math.abs(mv.to.x - 3.5)) * 0.3;
          score += Math.random() * 0.05;
          if (score > best){
            best = score;
            choice = mv;
          }
        }
        return choice;
      }
      let bestScore = -Infinity;
      let bestMove = moves[0];
      const depth = 4;
      for (const mv of moves){
        const next = applyMoveToBoard(board, mv);
        const score = minimax(next, depth - 1, false, -Infinity, Infinity);
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
        resultText = '勝利！';
        awardXp(WIN_EXP[difficulty] || 160, { type: 'win' });
        drawBoard();
        return;
      }
      applyMove(move, AI, false);
      turn = PLAYER;
      legalMoves = getAllMoves(PLAYER, board);
      checkForEnd();
      drawBoard();
    }

    function handleClick(e){
      if (ended || turn !== PLAYER) return;
      const cell = screenToCell(e);
      if (!cell) return;
      const movesFromCell = legalMoves.filter(m => m.from.x === cell.x && m.from.y === cell.y);
      const moveToCell = availableMoves.find(m => m.to.x === cell.x && m.to.y === cell.y);
      if (moveToCell){
        applyMove(moveToCell, PLAYER, true);
        selected = null;
        availableMoves = [];
        legalMoves = [];
        if (!checkForEnd()){
          turn = AI;
          drawBoard();
          setTimeout(aiTurn, difficulty === 'HARD' ? 320 : 180);
        } else {
          drawBoard();
        }
        return;
      }
      if (movesFromCell.length > 0){
        selected = cell;
        availableMoves = movesFromCell;
        drawBoard();
      } else if (Math.sign(board[cell.y][cell.x]) === PLAYER){
        // Clicking a piece without legal moves deselects
        selected = null;
        availableMoves = [];
        drawBoard();
      }
    }

    function handleMove(e){
      const cell = screenToCell(e);
      hover = cell;
      drawBoard();
    }

    function handleLeave(){
      hover = null;
      drawBoard();
    }

    function handleKey(e){
      if (e.key === 'r' || e.key === 'R'){
        setupBoard();
        drawBoard();
        if (turn === AI){
          setTimeout(aiTurn, 200);
        }
      }
    }

    function start(){
      if (running) return;
      running = true;
      setupBoard();
      drawBoard();
      canvas.addEventListener('click', handleClick);
      canvas.addEventListener('mousemove', handleMove);
      canvas.addEventListener('mouseleave', handleLeave);
      window.addEventListener('keydown', handleKey);
    }

    function stop(){
      if (!running) return;
      running = false;
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('mouseleave', handleLeave);
      window.removeEventListener('keydown', handleKey);
    }

    function destroy(){
      try { stop(); } catch {}
      try { root && root.removeChild(canvas); } catch {}
    }

    function getScore(){
      let playerKings = 0;
      let playerMen = 0;
      for (let y = 0; y < SIZE; y++){
        for (let x = 0; x < SIZE; x++){
          const v = board[y][x];
          if (Math.sign(v) !== PLAYER) continue;
          if (Math.abs(v) === 2) playerKings++;
          else playerMen++;
        }
      }
      return playerMen + playerKings * 2;
    }

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({
    id: 'checkers',
    name: 'チェッカー',
    description: 'ジャンプで駒取りして勝利を目指すボードゲーム',
    create
  });
})();

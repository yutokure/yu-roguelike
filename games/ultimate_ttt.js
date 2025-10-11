(function(){
  'use strict';

  const PLAYER = 1;
  const AI = -1;
  const EMPTY = 0;
  const DRAW = 2;
  const SUB_SIZE = 3;
  const MACRO_SIZE = 3;
  const XP_WIN = { EASY: 50, NORMAL: 100, HARD: 250 };
  const SUB_WIN_REWARD = 25;

  const baseI18n = typeof window !== 'undefined' ? window.I18n : null;

  function getI18nInstance(){
    if (typeof window !== 'undefined' && window.I18n) return window.I18n;
    return baseI18n;
  }

  function formatWithParams(text, params){
    if (typeof text !== 'string') return text ?? '';
    if (!params) return text;
    return text.replace(/\{([^{}]+)\}/g, (match, token) => {
      const key = token.trim();
      if (!key) return match;
      const value = params[key];
      return value === undefined || value === null ? match : String(value);
    });
  }

  function evaluateFallback(fallback, params){
    if (typeof fallback === 'function'){
      try {
        const value = fallback(params);
        if (value !== undefined && value !== null) return value;
      } catch (error){
        console.warn('[UltimateTTT] Failed to evaluate fallback text:', error);
      }
      return '';
    }
    return fallback ?? '';
  }

  function translateEntry(entry, params){
    if (entry === null || entry === undefined) return '';
    if (typeof entry === 'string'){
      return formatWithParams(entry, params);
    }
    const key = entry?.key;
    const fallback = entry?.fallback;
    const combinedParams = params || entry?.params;
    const i18n = getI18nInstance();
    if (key && i18n && typeof i18n.t === 'function'){
      try {
        const result = i18n.t(key, combinedParams);
        if (result !== undefined && result !== null && result !== key){
          return typeof result === 'string' ? result : formatWithParams(result, combinedParams);
        }
      } catch (error){
        console.warn('[UltimateTTT] Failed to translate key:', key, error);
      }
    }
    const fallbackValue = evaluateFallback(fallback, combinedParams);
    return typeof fallbackValue === 'string' ? formatWithParams(fallbackValue, combinedParams) : (fallbackValue ?? '');
  }

  function message(key, fallback){
    return { key, fallback };
  }

  const TEXT = {
    statusPlayer: message('game.miniExp.ultimateTtt.status.player', 'あなたの番'),
    statusAi: message('game.miniExp.ultimateTtt.status.ai', 'AIの番'),
    statusEnded: message('game.miniExp.ultimateTtt.status.ended', 'ゲーム終了'),
    activeBoard: message('game.miniExp.ultimateTtt.activeBoard', '指定盤: ({x}, {y})'),
    restartHint: message('game.miniExp.ultimateTtt.overlay.restartHint', 'Rキーで再開できます'),
    resultPlayerWin: message('game.miniExp.ultimateTtt.result.playerWin', 'あなたの勝ち！'),
    resultAiWin: message('game.miniExp.ultimateTtt.result.aiWin', 'AIの勝ち…'),
    resultDraw: message('game.miniExp.ultimateTtt.result.draw', '引き分け'),
  };

  function lineThreat(values, color){
    let count = 0, empties = 0;
    for (const v of values){
      if (v === color) count++;
      else if (v === EMPTY) empties++;
      else return false;
    }
    return count === values.length - 1 && empties === 1;
  }

  function localWinner(cells){
    for (let i=0;i<SUB_SIZE;i++){
      if (cells[i][0] && cells[i][0] === cells[i][1] && cells[i][1] === cells[i][2]) return cells[i][0];
      if (cells[0][i] && cells[0][i] === cells[1][i] && cells[1][i] === cells[2][i]) return cells[0][i];
    }
    if (cells[0][0] && cells[0][0] === cells[1][1] && cells[1][1] === cells[2][2]) return cells[0][0];
    if (cells[0][2] && cells[0][2] === cells[1][1] && cells[1][1] === cells[2][0]) return cells[0][2];
    return 0;
  }

  function localReach(cells, color){
    for (let i=0;i<SUB_SIZE;i++){
      if (lineThreat([cells[i][0], cells[i][1], cells[i][2]], color)) return true;
      if (lineThreat([cells[0][i], cells[1][i], cells[2][i]], color)) return true;
    }
    if (lineThreat([cells[0][0], cells[1][1], cells[2][2]], color)) return true;
    if (lineThreat([cells[0][2], cells[1][1], cells[2][0]], color)) return true;
    return false;
  }

  function buildMacroGrid(boards){
    const grid = Array.from({length:MACRO_SIZE}, () => Array(MACRO_SIZE).fill(0));
    for (let i=0;i<boards.length;i++){
      const b = boards[i];
      const x = i % MACRO_SIZE;
      const y = (i / MACRO_SIZE) | 0;
      grid[y][x] = (b.winner === PLAYER || b.winner === AI) ? b.winner : 0;
    }
    return grid;
  }

  function macroWinner(boards, color){
    const grid = buildMacroGrid(boards);
    for (let i=0;i<MACRO_SIZE;i++){
      if (grid[i][0] === color && grid[i][1] === color && grid[i][2] === color) return true;
      if (grid[0][i] === color && grid[1][i] === color && grid[2][i] === color) return true;
    }
    if (grid[0][0] === color && grid[1][1] === color && grid[2][2] === color) return true;
    if (grid[0][2] === color && grid[1][1] === color && grid[2][0] === color) return true;
    return false;
  }

  function macroReach(boards, color){
    const grid = buildMacroGrid(boards);
    for (let i=0;i<MACRO_SIZE;i++){
      if (lineThreat([grid[i][0], grid[i][1], grid[i][2]], color)) return true;
      if (lineThreat([grid[0][i], grid[1][i], grid[2][i]], color)) return true;
    }
    if (lineThreat([grid[0][0], grid[1][1], grid[2][2]], color)) return true;
    if (lineThreat([grid[0][2], grid[1][1], grid[2][0]], color)) return true;
    return false;
  }

  function boardsRemaining(boards){
    for (const b of boards){
      if (b.winner === 0 && b.filled < SUB_SIZE * SUB_SIZE) return true;
    }
    return false;
  }

  function legalMoves(boards, active){
    const moves = [];
    const targets = (active !== null) ? [active] : boards.map((_, idx) => idx).filter(i => boards[i].winner === 0 && boards[i].filled < 9);
    for (const idx of targets){
      const board = boards[idx];
      if (board.winner !== 0) continue;
      for (let y=0;y<SUB_SIZE;y++) for (let x=0;x<SUB_SIZE;x++) if (board.cells[y][x] === EMPTY) moves.push({ board: idx, x, y });
    }
    return moves;
  }

  function computeNextActive(move, boards){
    const next = move.y * SUB_SIZE + move.x;
    const target = boards[next];
    if (!target || target.winner !== 0 || target.filled >= SUB_SIZE*SUB_SIZE) return null;
    return next;
  }

  function simulateMove(boards, move, color, fn){
    const board = boards[move.board];
    const prevCell = board.cells[move.y][move.x];
    const prevFilled = board.filled;
    const prevWinner = board.winner;
    board.cells[move.y][move.x] = color;
    board.filled = prevFilled + 1;
    const justWon = localWinner(board.cells);
    if (justWon){
      board.winner = justWon;
    } else if (board.filled >= SUB_SIZE*SUB_SIZE){
      board.winner = board.winner || DRAW;
    }
    const res = fn({ board, justWon, boardWin: justWon === color, nextActive: computeNextActive(move, boards) });
    board.cells[move.y][move.x] = prevCell;
    board.filled = prevFilled;
    board.winner = prevWinner;
    return res;
  }

  function chooseAiMove(boards, active, difficulty){
    const moves = legalMoves(boards, active);
    if (moves.length === 0) return null;
    const playerLegal = legalMoves(boards, active);

    // Immediate macro victory for AI
    for (const mv of moves){
      const winsMacro = simulateMove(boards, mv, AI, ({ boardWin }) => boardWin && macroWinner(boards, AI));
      if (winsMacro) return mv;
    }

    // Player's immediate macro threats
    const playerMacroThreats = playerLegal.filter(mv => simulateMove(boards, mv, PLAYER, ({ boardWin }) => boardWin && macroWinner(boards, PLAYER)));
    if (playerMacroThreats.length){
      const block = moves.find(mv => playerMacroThreats.some(pm => pm.board === mv.board && pm.x === mv.x && pm.y === mv.y));
      if (block) return block;
    }

    // Finish local board if possible
    for (const mv of moves){
      const winLocal = simulateMove(boards, mv, AI, ({ justWon }) => justWon === AI);
      if (winLocal) return mv;
    }

    // Block player's local win
    const playerLocalThreats = playerLegal.filter(mv => simulateMove(boards, mv, PLAYER, ({ justWon }) => justWon === PLAYER));
    if (playerLocalThreats.length){
      const block = moves.find(mv => playerLocalThreats.some(pm => pm.board === mv.board && pm.x === mv.x && pm.y === mv.y));
      if (block) return block;
    }

    if (difficulty === 'EASY'){
      return moves[Math.floor(Math.random()*moves.length)];
    }
    function scoreMove(move){
      return simulateMove(boards, move, AI, ({ board, boardWin, nextActive }) => {
        let score = 0;
        if (boardWin) score += 40;
        else if (localReach(board.cells, AI)) score += 14;
        if (macroReach(boards, AI)) score += 18;
        if (macroWinner(boards, AI)) score += 100;
        // Prefer center positions
        const bx = move.x - 1;
        const by = move.y - 1;
        score += (3 - (Math.abs(bx) + Math.abs(by))) * 2;
        // Steer opponent to awkward boards
        if (nextActive === null) score += 6;
        else {
          const target = boards[nextActive];
          if (target.winner === AI) score += 12;
          else if (target.winner === PLAYER) score -= 12;
          else if (localReach(target.cells, AI)) score += 8;
        }
        // Reduce player's immediate threats
        const playerThreats = localReach(board.cells, PLAYER) ? 10 : 0;
        score -= playerThreats;
        return score;
      });
    }
    let best = null;
    let bestScore = -Infinity;
    for (const mv of moves){
      let sc = scoreMove(mv);
      if (difficulty === 'HARD'){
        const counter = simulateMove(boards, mv, AI, ({ nextActive }) => {
          const replies = legalMoves(boards, nextActive);
          if (replies.length === 0) return -Infinity;
          let bestReply = -Infinity;
          for (const rep of replies){
            const val = simulateMove(boards, rep, PLAYER, ({ boardWin, nextActive: oppNext, board: oppBoard }) => {
              let score = 0;
              if (boardWin) score += 80;
              if (macroWinner(boards, PLAYER)) score += 220;
              else if (macroReach(boards, PLAYER)) score += 60;
              if (localReach(oppBoard.cells, PLAYER)) score += 18;
              if (oppNext === null) score += 6;
              else {
                const target = boards[oppNext];
                if (target){
                  if (target.winner === PLAYER) score += 14;
                  else if (target.winner === AI) score -= 20;
                  else if (localReach(target.cells, PLAYER)) score += 10;
                }
              }
              return score;
            });
            if (val > bestReply) bestReply = val;
          }
          return bestReply;
        });
        if (counter !== -Infinity){
          sc -= counter * 0.65;
        }
      }
      if (sc > bestScore){ bestScore = sc; best = mv; }
    }
    if (!best) best = moves[Math.floor(Math.random()*moves.length)];
    return best;
  }

  function create(root, awardXp, opts){
    const difficulty = opts?.difficulty || 'NORMAL';
    const shortcuts = opts?.shortcuts;
    const xpWin = XP_WIN[difficulty] ?? XP_WIN.NORMAL;

    const canvas = document.createElement('canvas');
    canvas.width = 540;
    canvas.height = 540;
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    canvas.style.borderRadius = '12px';
    canvas.style.background = '#0f172a';
    root.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const boards = Array.from({length: MACRO_SIZE * MACRO_SIZE}, () => ({
      cells: Array.from({length: SUB_SIZE}, () => Array(SUB_SIZE).fill(EMPTY)),
      winner: 0,
      filled: 0
    }));

    let activeBoard = null;
    let turn = PLAYER;
    let running = false;
    let ended = false;
    let resultMessage = null;
    let lastMove = null;
    let hover = null; // { board, x, y }
    let detachLocale = null;

    function disableHostRestart(){
      shortcuts?.disableKey('r');
    }

    function enableHostRestart(){
      shortcuts?.enableKey('r');
    }

    function draw(){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0,0,canvas.width,canvas.height);
      const cellSize = canvas.width / (SUB_SIZE * MACRO_SIZE);
      const boardSize = cellSize * SUB_SIZE;

      // Highlight active board
      if (activeBoard !== null && !ended){
        const bx = activeBoard % MACRO_SIZE;
        const by = (activeBoard / MACRO_SIZE) | 0;
        ctx.fillStyle = 'rgba(56,189,248,0.18)';
        ctx.fillRect(bx * boardSize, by * boardSize, boardSize, boardSize);
      }

      if (hover && !ended){
        const bx = hover.board % MACRO_SIZE;
        const by = (hover.board / MACRO_SIZE) | 0;
        ctx.fillStyle = 'rgba(253,224,71,0.25)';
        ctx.fillRect(bx * boardSize + hover.x * cellSize, by * boardSize + hover.y * cellSize, cellSize, cellSize);
      }

      ctx.strokeStyle = 'rgba(71,85,105,0.8)';
      ctx.lineWidth = 1;
      for (let i=0;i<=SUB_SIZE*MACRO_SIZE;i++){
        const pos = i * cellSize + 0.5;
        ctx.beginPath(); ctx.moveTo(pos, 0); ctx.lineTo(pos, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, pos); ctx.lineTo(canvas.width, pos); ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(248,250,252,0.6)';
      ctx.lineWidth = 4;
      for (let i=1;i<MACRO_SIZE;i++){
        const pos = i * boardSize;
        ctx.beginPath(); ctx.moveTo(pos, 0); ctx.lineTo(pos, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, pos); ctx.lineTo(canvas.width, pos); ctx.stroke();
      }

      // Draw marks and board winners
      for (let bi=0; bi<boards.length; bi++){
        const board = boards[bi];
        const bx = bi % MACRO_SIZE;
        const by = (bi / MACRO_SIZE) | 0;
        for (let y=0;y<SUB_SIZE;y++){
          for (let x=0;x<SUB_SIZE;x++){
            const v = board.cells[y][x];
            if (!v) continue;
            const cx = bx * boardSize + x * cellSize;
            const cy = by * boardSize + y * cellSize;
            ctx.save();
            ctx.translate(cx + cellSize/2, cy + cellSize/2);
            ctx.lineWidth = Math.max(2, cellSize * 0.14);
            if (v === PLAYER){
              ctx.strokeStyle = '#38bdf8';
              ctx.beginPath();
              const r = cellSize*0.3;
              ctx.moveTo(-r, -r); ctx.lineTo(r, r);
              ctx.moveTo(-r, r); ctx.lineTo(r, -r);
              ctx.stroke();
            } else {
              ctx.strokeStyle = '#fcd34d';
              ctx.beginPath();
              ctx.arc(0,0, cellSize*0.36, 0, Math.PI*2);
              ctx.stroke();
            }
            ctx.restore();
          }
        }
        if (board.winner === PLAYER || board.winner === AI){
          ctx.save();
          ctx.translate(bx * boardSize + boardSize/2, by * boardSize + boardSize/2);
          ctx.fillStyle = board.winner === PLAYER ? 'rgba(56,189,248,0.12)' : 'rgba(248,113,162,0.12)';
          ctx.fillRect(-boardSize/2, -boardSize/2, boardSize, boardSize);
          ctx.strokeStyle = board.winner === PLAYER ? '#38bdf8' : '#f472b6';
          ctx.lineWidth = 5;
          ctx.beginPath();
          if (board.winner === PLAYER){
            const r = boardSize*0.32;
            ctx.moveTo(-r, -r); ctx.lineTo(r, r);
            ctx.moveTo(-r, r); ctx.lineTo(r, -r);
          } else {
            ctx.arc(0, 0, boardSize*0.38, 0, Math.PI*2);
          }
          ctx.stroke();
          ctx.restore();
        } else if (board.winner === DRAW){
          ctx.fillStyle = 'rgba(148,163,184,0.12)';
          ctx.fillRect(bx * boardSize, by * boardSize, boardSize, boardSize);
        }
      }

      if (lastMove){
        const bx = lastMove.board % MACRO_SIZE;
        const by = (lastMove.board / MACRO_SIZE) | 0;
        ctx.strokeStyle = 'rgba(253,224,71,0.9)';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          bx * boardSize + lastMove.x * cellSize + 4,
          by * boardSize + lastMove.y * cellSize + 4,
          cellSize - 8,
          cellSize - 8
        );
      }

      ctx.fillStyle = '#f8fafc';
      ctx.font = '16px system-ui, sans-serif';
      ctx.textAlign = 'left';
      const statusEntry = ended ? TEXT.statusEnded : (turn === PLAYER ? TEXT.statusPlayer : TEXT.statusAi);
      ctx.fillText(translateEntry(statusEntry), 12, 20);
      if (activeBoard !== null && !ended){
        ctx.font = '12px system-ui, sans-serif';
        ctx.fillText(translateEntry(TEXT.activeBoard, {
          x: (activeBoard % MACRO_SIZE) + 1,
          y: ((activeBoard / MACRO_SIZE) | 0) + 1,
        }), 12, 38);
      }
      if (ended){
        ctx.fillStyle = 'rgba(15,23,42,0.75)';
        ctx.fillRect(0, canvas.height/2 - 48, canvas.width, 96);
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 28px system-ui, sans-serif';
        ctx.textAlign = 'center';
        const overlayMessage = resultMessage || TEXT.statusEnded;
        ctx.fillText(translateEntry(overlayMessage), canvas.width/2, canvas.height/2);
        ctx.font = '12px system-ui, sans-serif';
        ctx.fillText(translateEntry(TEXT.restartHint), canvas.width/2, canvas.height/2 + 24);
        ctx.textAlign = 'left';
      }
    }

    function reset(){
      disableHostRestart();
      for (const b of boards){
        for (let y=0;y<SUB_SIZE;y++) b.cells[y].fill(EMPTY);
        b.winner = 0; b.filled = 0;
      }
      activeBoard = null;
      turn = PLAYER;
      ended = false;
      resultMessage = null;
      lastMove = null;
      hover = null;
      draw();
    }

    function normalizeMessage(message){
      if (!message && message !== 0) return null;
      if (typeof message === 'string'){
        return { key: null, fallback: message };
      }
      if (typeof message === 'object' && message){
        if ('key' in message || 'fallback' in message || 'params' in message){
          return message;
        }
        return { key: null, fallback: String(message) };
      }
      return { key: null, fallback: String(message) };
    }

    function finish(message){
      ended = true;
      resultMessage = normalizeMessage(message);
      draw();
      enableHostRestart();
    }

    function applyMove(move, color){
      const board = boards[move.board];
      if (board.cells[move.y][move.x] !== EMPTY) return false;
      board.cells[move.y][move.x] = color;
      board.filled++;
      lastMove = { board: move.board, x: move.x, y: move.y, color };
      const prevWinner = board.winner;
      const wonLocal = localWinner(board.cells);
      if (wonLocal){
        board.winner = wonLocal;
      } else if (board.filled >= SUB_SIZE*SUB_SIZE && board.winner === 0){
        board.winner = DRAW;
      }
      const next = computeNextActive(move, boards);
      activeBoard = next;
      return { wonLocal, prevWinner };
    }

    function handlePlayerMove(move){
      if (ended || turn !== PLAYER) return;
      const { wonLocal, prevWinner } = applyMove(move, PLAYER) || {};
      if (!wonLocal && prevWinner === undefined) return; // illegal
      awardXp(1, { type:'place', game:'ultimate_ttt' });
      if (wonLocal === PLAYER && prevWinner !== PLAYER){
        awardXp(SUB_WIN_REWARD, { type:'sub_board', game:'ultimate_ttt' });
      }
      const wonMacro = macroWinner(boards, PLAYER);
      if (wonMacro){
        awardXp(xpWin, { type:'win', game:'ultimate_ttt' });
        finish(TEXT.resultPlayerWin);
        return;
      }
      if (!wonLocal){
        const reach = (localReach(boards[move.board].cells, PLAYER) || macroReach(boards, PLAYER));
        if (reach){
          awardXp(10, { type:'reach', game:'ultimate_ttt' });
        }
      }
      if (!boardsRemaining(boards)){
        finish(TEXT.resultDraw);
        return;
      }
      turn = AI;
      draw();
      setTimeout(aiTurn, difficulty === 'HARD' ? 90 : 160);
    }

    function aiTurn(){
      if (ended || turn !== AI) return;
      const mv = chooseAiMove(boards, activeBoard, difficulty);
      if (!mv){
        finish(TEXT.resultDraw);
        return;
      }
      applyMove(mv, AI);
      if (macroWinner(boards, AI)){
        finish(TEXT.resultAiWin);
        return;
      }
      if (!boardsRemaining(boards)){
        finish(TEXT.resultDraw);
        return;
      }
      turn = PLAYER;
      draw();
    }

    function posToMove(e){
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const boardSize = canvas.width / MACRO_SIZE;
      const cellSize = boardSize / SUB_SIZE;
      const bx = Math.floor(x / boardSize);
      const by = Math.floor(y / boardSize);
      if (bx < 0 || bx >= MACRO_SIZE || by < 0 || by >= MACRO_SIZE) return null;
      const boardIndex = by * MACRO_SIZE + bx;
      if (activeBoard !== null && boardIndex !== activeBoard) return null;
      const board = boards[boardIndex];
      if (board.winner !== 0) return null;
      const lx = Math.floor((x - bx * boardSize) / cellSize);
      const ly = Math.floor((y - by * boardSize) / cellSize);
      if (lx < 0 || lx >= SUB_SIZE || ly < 0 || ly >= SUB_SIZE) return null;
      if (board.cells[ly][lx] !== EMPTY) return null;
      return { board: boardIndex, x: lx, y: ly };
    }

    function handleClick(e){
      if (turn !== PLAYER || ended) return;
      const move = posToMove(e);
      if (move) handlePlayerMove(move);
    }

    function handleMove(e){
      if (ended){ hover = null; draw(); return; }
      const move = posToMove(e);
      hover = move;
      draw();
    }

    function handleLeave(){ hover = null; draw(); }
    function handleKey(e){ if (e.key === 'r' || e.key === 'R') reset(); }

    const i18nInstance = getI18nInstance();
    if (typeof i18nInstance?.onLocaleChanged === 'function'){
      detachLocale = i18nInstance.onLocaleChanged(() => { draw(); });
    } else if (typeof document !== 'undefined' && typeof document.addEventListener === 'function'){
      const handler = () => draw();
      document.addEventListener('i18n:locale-changed', handler);
      detachLocale = () => document.removeEventListener('i18n:locale-changed', handler);
    }

    function start(){ if (running) return; running = true; disableHostRestart(); canvas.addEventListener('click', handleClick); canvas.addEventListener('mousemove', handleMove); canvas.addEventListener('mouseleave', handleLeave); window.addEventListener('keydown', handleKey); draw(); if (turn === AI) setTimeout(aiTurn, 200); }
    function stop(opts = {}){ if (!running) return; running = false; canvas.removeEventListener('click', handleClick); canvas.removeEventListener('mousemove', handleMove); canvas.removeEventListener('mouseleave', handleLeave); window.removeEventListener('keydown', handleKey); if (!opts.keepShortcutsDisabled){ enableHostRestart(); } }
    function destroy(){ try { stop(); detachLocale && detachLocale(); detachLocale = null; root.removeChild(canvas); } catch {} }
    function getScore(){
      let playerBoards = 0, aiBoards = 0;
      for (const b of boards){ if (b.winner === PLAYER) playerBoards++; else if (b.winner === AI) aiBoards++; }
      return playerBoards - aiBoards;
    }

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({ id:'ultimate_ttt', name:'スーパー三目並べ', nameKey: 'selection.miniexp.games.ultimate_ttt.name', description:'Ultimate三目並べ。配置+1/リーチ+10、小盤制覇+25、勝利は50/100/250EXP', descriptionKey: 'selection.miniexp.games.ultimate_ttt.description', categoryIds: ['board'], create });
})();

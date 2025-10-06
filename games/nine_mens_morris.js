(function(){
  'use strict';

  const PLAYER = 1;
  const AI = -1;
  const EMPTY = 0;

  const POINT_COORDS = [
    [0,0],[3,0],[6,0],[6,3],[6,6],[3,6],[0,6],[0,3],
    [1,1],[3,1],[5,1],[5,3],[5,5],[3,5],[1,5],[1,3],
    [2,2],[3,2],[4,2],[4,3],[4,4],[3,4],[2,4],[2,3]
  ];

  const ADJACENT = [
    [1,7],[0,2,9],[1,3],[2,4,11],[3,5],[4,6,13],[5,7],[6,0,15],
    [9,15],[8,10,1,17],[9,11],[10,12,3,19],[11,13],[12,14,5,21],[13,15],[14,7,8,23],
    [17,23],[16,18,9],[17,19],[18,20,11],[19,21],[20,22,13],[21,23],[22,15,16]
  ];

  const MILL_LINES = [
    [0,1,2],[2,3,4],[4,5,6],[6,7,0],
    [8,9,10],[10,11,12],[12,13,14],[14,15,8],
    [16,17,18],[18,19,20],[20,21,22],[22,23,16],
    [0,8,16],[1,9,17],[2,10,18],[3,11,19],
    [4,12,20],[5,13,21],[6,14,22],[7,15,23]
  ];

  const LINE_MAP = (() => {
    const map = Array.from({ length: POINT_COORDS.length }, () => []);
    for (const line of MILL_LINES){
      for (const idx of line){ map[idx].push(line); }
    }
    return map;
  })();

  const EDGE_LIST = (() => {
    const edges = [];
    for (let i = 0; i < ADJACENT.length; i++){
      for (const j of ADJACENT[i]){
        if (j > i){ edges.push([i,j]); }
      }
    }
    return edges;
  })();

  const WIN_EXP = { EASY: 80, NORMAL: 150, HARD: 260 };
  const PLACE_XP = 1;
  const MOVE_XP = 1;
  const MILL_XP = 15;
  const CAPTURE_XP = 6;

  const DIFF_DEPTH = { EASY: 1, NORMAL: 2, HARD: 3 };
  const DIFF_BRANCH = { EASY: 8, NORMAL: 8, HARD: 6 };

  function cloneBoard(board){ return board.slice(); }
  function clonePlaced(placed){ return { [PLAYER]: placed[PLAYER], [AI]: placed[AI] }; }

  function countPieces(board, color){
    let n = 0;
    for (const cell of board){ if (cell === color) n++; }
    return n;
  }

  function emptyIndices(board){
    const res = [];
    for (let i = 0; i < board.length; i++) if (board[i] === EMPTY) res.push(i);
    return res;
  }

  function formsMill(board, index, color){
    const lines = LINE_MAP[index];
    for (const line of lines){
      let ok = true;
      for (const pos of line){ if (board[pos] !== color) { ok = false; break; } }
      if (ok) return true;
    }
    return false;
  }

  function isInMill(board, index, color){
    for (const line of LINE_MAP[index]){
      let ok = true;
      for (const pos of line){ if (board[pos] !== color) { ok = false; break; } }
      if (ok) return true;
    }
    return false;
  }

  function getRemovalCandidates(board, opponent){
    const res = [];
    for (let i = 0; i < board.length; i++){
      if (board[i] === opponent && !isInMill(board, i, opponent)) res.push(i);
    }
    if (res.length > 0) return res;
    const fallback = [];
    for (let i = 0; i < board.length; i++) if (board[i] === opponent) fallback.push(i);
    return fallback;
  }

  function countMills(board, color){
    let count = 0;
    for (const line of MILL_LINES){
      if (board[line[0]] === color && board[line[1]] === color && board[line[2]] === color){ count++; }
    }
    return count;
  }

  function countPotentialMills(board, color){
    let count = 0;
    for (const line of MILL_LINES){
      let mine = 0, empty = 0, opp = 0;
      for (const pos of line){
        const cell = board[pos];
        if (cell === color) mine++;
        else if (cell === EMPTY) empty++;
        else opp++;
      }
      if (opp === 0 && mine === 2 && empty === 1) count++;
    }
    return count;
  }

  function willBlockOpponent(board, index, opponent){
    for (const line of LINE_MAP[index]){
      let opp = 0, empty = 0;
      for (const pos of line){
        const cell = board[pos];
        if (cell === opponent) opp++;
        else if (cell === EMPTY) empty++;
      }
      if (opp === 2 && empty === 1) return true;
    }
    return false;
  }

  function getPhase(board, placed, color){
    if (placed[color] < 9) return 'place';
    const pieces = countPieces(board, color);
    return pieces > 3 ? 'slide' : 'fly';
  }

  function simulateMove(board, placed, move, color, removal){
    const nextBoard = cloneBoard(board);
    const nextPlaced = clonePlaced(placed);
    if (move.type === 'place'){
      nextBoard[move.to] = color;
      nextPlaced[color]++;
    } else {
      nextBoard[move.from] = EMPTY;
      nextBoard[move.to] = color;
    }
    if (removal != null){
      nextBoard[removal] = EMPTY;
    }
    return { board: nextBoard, placed: nextPlaced };
  }

  function simulateWithoutRemoval(board, move, color){
    const next = cloneBoard(board);
    if (move.type === 'place'){
      next[move.to] = color;
    } else {
      next[move.from] = EMPTY;
      next[move.to] = color;
    }
    return next;
  }

  function evaluateState(board, placed){
    const myPieces = countPieces(board, AI);
    const oppPieces = countPieces(board, PLAYER);
    const pieceDiff = (myPieces - oppPieces) * 20;
    const millDiff = (countMills(board, AI) - countMills(board, PLAYER)) * 18;
    const potDiff = (countPotentialMills(board, AI) - countPotentialMills(board, PLAYER)) * 10;

    const myPhase = getPhase(board, placed, AI);
    const oppPhase = getPhase(board, placed, PLAYER);

    let mobilityDiff = 0;
    if (myPhase !== 'place'){ mobilityDiff += countMobility(board, placed, AI); }
    if (oppPhase !== 'place'){ mobilityDiff -= countMobility(board, placed, PLAYER); }
    mobilityDiff *= 4;

    let winBonus = 0;
    if (placed[PLAYER] >= 9 && oppPieces <= 2) winBonus += 300;
    if (placed[AI] >= 9 && myPieces <= 2) winBonus -= 300;

    return pieceDiff + millDiff + potDiff + mobilityDiff + winBonus;
  }

  function countMobility(board, placed, color){
    const phase = getPhase(board, placed, color);
    if (phase === 'place'){
      return emptyIndices(board).length;
    }
    const mine = [];
    for (let i = 0; i < board.length; i++) if (board[i] === color) mine.push(i);
    if (phase === 'fly'){
      const empties = emptyIndices(board);
      return mine.length * empties.length;
    }
    let moves = 0;
    for (const idx of mine){
      for (const adj of ADJACENT[idx]) if (board[adj] === EMPTY) moves++;
    }
    return moves;
  }

  function generateMoves(board, placed, color){
    const moves = [];
    const phase = getPhase(board, placed, color);
    const opponent = -color;
    if (phase === 'place'){
      for (const idx of emptyIndices(board)){
        const base = { type: 'place', from: null, to: idx };
        const temp = simulateWithoutRemoval(board, base, color);
        const createsMill = formsMill(temp, idx, color);
        if (createsMill){
          const removals = getRemovalCandidates(temp, opponent);
          if (removals.length === 0){
            const sim = simulateMove(board, placed, base, color, null);
            moves.push(Object.assign({ remove: null, formsMill: true, scoreHint: evaluateState(sim.board, sim.placed) }, base));
          } else {
            for (const rem of removals){
              const sim = simulateMove(board, placed, base, color, rem);
              moves.push(Object.assign({ remove: rem, formsMill: true, scoreHint: evaluateState(sim.board, sim.placed) }, base));
            }
          }
        } else {
          const sim = simulateMove(board, placed, base, color, null);
          let scoreHint = evaluateState(sim.board, sim.placed);
          if (!createsMill && color === AI && willBlockOpponent(board, idx, opponent)) scoreHint += 30;
          moves.push(Object.assign({ remove: null, formsMill: false, scoreHint }, base));
        }
      }
      return moves;
    }
    const myPieces = [];
    for (let i = 0; i < board.length; i++) if (board[i] === color) myPieces.push(i);
    const empties = emptyIndices(board);
    for (const from of myPieces){
      const destinations = phase === 'fly' ? empties : ADJACENT[from];
      for (const to of destinations){
        if (board[to] !== EMPTY) continue;
        const base = { type: phase === 'fly' ? 'fly' : 'slide', from, to };
        const temp = simulateWithoutRemoval(board, base, color);
        const createsMill = formsMill(temp, to, color);
        if (createsMill){
          const removals = getRemovalCandidates(temp, opponent);
          if (removals.length === 0){
            const sim = simulateMove(board, placed, base, color, null);
            moves.push(Object.assign({ remove: null, formsMill: true, scoreHint: evaluateState(sim.board, sim.placed) }, base));
          } else {
            for (const rem of removals){
              const sim = simulateMove(board, placed, base, color, rem);
              moves.push(Object.assign({ remove: rem, formsMill: true, scoreHint: evaluateState(sim.board, sim.placed) }, base));
            }
          }
        } else {
          const sim = simulateMove(board, placed, base, color, null);
          moves.push(Object.assign({ remove: null, formsMill: false, scoreHint: evaluateState(sim.board, sim.placed) }, base));
        }
      }
    }
    return moves;
  }

  function mobilityCount(board, placed, color){
    const phase = getPhase(board, placed, color);
    if (phase === 'place') return emptyIndices(board).length;
    const pieces = [];
    for (let i = 0; i < board.length; i++) if (board[i] === color) pieces.push(i);
    if (phase === 'fly'){
      return pieces.length > 0 && emptyIndices(board).length > 0 ? pieces.length * emptyIndices(board).length : 0;
    }
    let count = 0;
    for (const idx of pieces){
      for (const adj of ADJACENT[idx]) if (board[adj] === EMPTY) count++;
    }
    return count;
  }

  function minimax(board, placed, depth, color, alpha, beta, branchLimit){
    if (depth === 0){
      return evaluateState(board, placed);
    }
    const moves = generateMoves(board, placed, color);
    if (moves.length === 0){
      if (color === AI) return -900 - depth;
      return 900 + depth;
    }
    moves.sort((a,b) => color === AI ? b.scoreHint - a.scoreHint : a.scoreHint - b.scoreHint);
    const limit = Math.max(1, branchLimit || DIFF_BRANCH.HARD);
    const slice = moves.slice(0, limit);
    if (color === AI){
      let best = -Infinity;
      for (const mv of slice){
        const sim = simulateMove(board, placed, mv, color, mv.remove);
        const val = minimax(sim.board, sim.placed, depth-1, -color, alpha, beta, branchLimit);
        if (val > best) best = val;
        if (best > alpha) alpha = best;
        if (beta <= alpha) break;
      }
      return best;
    } else {
      let best = Infinity;
      for (const mv of slice){
        const sim = simulateMove(board, placed, mv, color, mv.remove);
        const val = minimax(sim.board, sim.placed, depth-1, -color, alpha, beta, branchLimit);
        if (val < best) best = val;
        if (best < beta) beta = best;
        if (beta <= alpha) break;
      }
      return best;
    }
  }

  function chooseAiMove(board, placed, difficulty){
    const moves = generateMoves(board, placed, AI);
    if (moves.length === 0) return null;
    moves.sort((a,b) => b.scoreHint - a.scoreHint);
    const branchLimit = DIFF_BRANCH[difficulty] || 6;
    if (difficulty === 'EASY'){
      const pool = moves.slice(0, branchLimit);
      return pool[Math.floor(Math.random() * pool.length)];
    }
    const depth = DIFF_DEPTH[difficulty] || 2;
    let bestMove = moves[0];
    let bestScore = -Infinity;
    let alpha = -Infinity, beta = Infinity;
    const considered = moves.slice(0, branchLimit);
    for (const mv of considered){
      const sim = simulateMove(board, placed, mv, AI, mv.remove);
      const score = minimax(sim.board, sim.placed, depth-1, PLAYER, alpha, beta, branchLimit);
      if (score > bestScore){
        bestScore = score;
        bestMove = mv;
      }
      if (bestScore > alpha) alpha = bestScore;
      if (beta <= alpha) break;
    }
    return bestMove;
  }

  function create(root, awardXp, opts){
    const difficulty = (opts && opts.difficulty) || 'NORMAL';

    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.gap = '16px';
    container.style.alignItems = 'flex-start';
    container.style.justifyContent = 'center';
    container.style.padding = '12px';
    container.style.color = '#f8fafc';
    container.style.fontFamily = "'Segoe UI', 'Hiragino Sans', sans-serif";

    const boardWrap = document.createElement('div');
    boardWrap.style.display = 'flex';
    boardWrap.style.flexDirection = 'column';
    boardWrap.style.alignItems = 'center';
    boardWrap.style.gap = '8px';

    const title = document.createElement('div');
    title.textContent = 'ナイン・メンズ・モリス — あなたが先手';
    title.style.fontSize = '18px';
    title.style.fontWeight = '600';
    boardWrap.appendChild(title);

    const canvas = document.createElement('canvas');
    canvas.width = 520;
    canvas.height = 520;
    canvas.style.borderRadius = '12px';
    canvas.style.boxShadow = '0 10px 24px rgba(0,0,0,0.45)';
    canvas.style.background = 'linear-gradient(135deg,#4f3720,#2b1d12)';
    canvas.style.cursor = 'pointer';
    canvas.style.touchAction = 'manipulation';
    boardWrap.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    const status = document.createElement('div');
    status.style.fontSize = '16px';
    status.style.minHeight = '24px';
    boardWrap.appendChild(status);

    const panel = document.createElement('div');
    panel.style.background = 'rgba(15,23,42,0.55)';
    panel.style.borderRadius = '12px';
    panel.style.padding = '12px 16px';
    panel.style.width = '220px';
    panel.style.display = 'flex';
    panel.style.flexDirection = 'column';
    panel.style.gap = '12px';

    const info = document.createElement('div');
    info.style.fontSize = '15px';

    const phaseInfo = document.createElement('div');
    phaseInfo.style.fontSize = '14px';
    phaseInfo.style.lineHeight = '1.6';

    const tips = document.createElement('div');
    tips.style.fontSize = '13px';
    tips.style.lineHeight = '1.6';
    tips.style.color = 'rgba(226,232,240,0.85)';
    tips.innerHTML = '操作: 盤上をクリックして配置 / 駒→移動先をクリックして移動。<br>ミル成立時は赤枠の相手駒を選択して除去。';

    panel.appendChild(info);
    panel.appendChild(phaseInfo);
    panel.appendChild(tips);

    container.appendChild(boardWrap);
    container.appendChild(panel);

    root.appendChild(container);

    let board = Array(POINT_COORDS.length).fill(EMPTY);
    let placed = { [PLAYER]: 0, [AI]: 0 };
    let captured = { [PLAYER]: 0, [AI]: 0 };
    let turn = PLAYER;
    let running = false;
    let ended = false;
    let thinking = false;
    let removalPending = false;
    let removalTargets = [];
    let selected = null;
    let hoverIndex = null;
    let lastMove = null;
    let aiTimer = null;

    function pointToPixel(index){
      const [gx, gy] = POINT_COORDS[index];
      const padding = 40;
      const unit = (canvas.width - padding * 2) / 6;
      return {
        x: padding + gx * unit,
        y: padding + gy * unit,
        unit
      };
    }

    function showPopup(index, text, options){
      if (typeof window.showTransientPopupAt !== 'function') return;
      const rect = canvas.getBoundingClientRect();
      const pt = pointToPixel(index);
      try {
        window.showTransientPopupAt(rect.left + pt.x, rect.top + pt.y, text, options || {});
      } catch (err) {}
    }

    function updateInfo(){
      const playerPieces = countPieces(board, PLAYER);
      const aiPieces = countPieces(board, AI);
      const playerPhase = getPhase(board, placed, PLAYER);
      const aiPhase = getPhase(board, placed, AI);
      info.innerHTML = `プレイヤー駒: <strong>${playerPieces}</strong> / 捕獲: ${captured[PLAYER]}<br>` +
        `AI駒: <strong>${aiPieces}</strong> / 捕獲: ${captured[AI]}`;
      const phaseLabel = phase => phase === 'place' ? '配置フェーズ' : phase === 'slide' ? '移動フェーズ' : 'フライトモード';
      phaseInfo.innerHTML = `あなた: ${phaseLabel(playerPhase)}（残り配置 ${Math.max(0, 9 - placed[PLAYER])}）<br>` +
        `AI: ${phaseLabel(aiPhase)}（残り配置 ${Math.max(0, 9 - placed[AI])}）`;
      if (ended){
        return;
      }
      if (removalPending){
        status.textContent = 'ミル成立！除去する相手駒を選んでください。';
      } else if (thinking){
        status.textContent = 'AIが思考中…';
      } else {
        status.textContent = turn === PLAYER ? 'あなたの番です。' : 'AIの番です…';
      }
    }

    function draw(){
      const padding = 40;
      const unit = (canvas.width - padding * 2) / 6;
      ctx.clearRect(0,0,canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(248,250,252,0.8)';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      for (const [from, to] of EDGE_LIST){
        const pf = pointToPixel(from);
        const pt = pointToPixel(to);
        ctx.beginPath();
        ctx.moveTo(pf.x, pf.y);
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
      }

      if (lastMove && lastMove.formsMill){
        ctx.save();
        ctx.strokeStyle = 'rgba(249, 168, 212, 0.55)';
        ctx.lineWidth = 8;
        for (const line of LINE_MAP[lastMove.to]){
          if (line.every(idx => board[idx] === lastMove.color)){
            const [a,b,c] = line;
            const p1 = pointToPixel(a);
            const p2 = pointToPixel(b);
            const p3 = pointToPixel(c);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineTo(p3.x, p3.y);
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      for (let i = 0; i < board.length; i++){
        const cell = board[i];
        const pt = pointToPixel(i);
        const radius = unit * 0.38;
        const highlight = removalPending && removalTargets.includes(i);
        const isSelected = selected === i;
        const isHover = hoverIndex === i;
        const lastFrom = lastMove && lastMove.from === i;
        const lastTo = lastMove && lastMove.to === i;

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
        if (cell === PLAYER){
          ctx.fillStyle = '#facc15';
        } else if (cell === AI){
          ctx.fillStyle = '#60a5fa';
        } else {
          ctx.fillStyle = 'rgba(15,23,42,0.45)';
        }
        ctx.fill();

        ctx.lineWidth = 3;
        if (highlight){
          ctx.strokeStyle = 'rgba(248,113,113,0.85)';
          ctx.stroke();
        } else if (isSelected){
          ctx.strokeStyle = 'rgba(250,204,21,0.85)';
          ctx.stroke();
        } else if (lastTo){
          ctx.strokeStyle = 'rgba(190,242,100,0.8)';
          ctx.stroke();
        } else if (lastFrom){
          ctx.strokeStyle = 'rgba(96,165,250,0.6)';
          ctx.stroke();
        } else if (cell === EMPTY && isHover && turn === PLAYER && !thinking && !removalPending){
          ctx.strokeStyle = 'rgba(129, 140, 248, 0.6)';
          ctx.stroke();
        }

        if (cell === EMPTY && turn === PLAYER && !removalPending){
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, radius * 0.25, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(226,232,240,0.25)';
          ctx.fill();
        }
      }

      if (selected != null && !removalPending){
        const phase = getPhase(board, placed, PLAYER);
        const destinations = phase === 'fly' ? emptyIndices(board) : ADJACENT[selected];
        ctx.save();
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(59,130,246,0.55)';
        for (const dest of destinations){
          if (board[dest] !== EMPTY) continue;
          const pt = pointToPixel(dest);
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pointToPixel(dest).unit * 0.42, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    function concludePlayerWin(){
      ended = true;
      thinking = false;
      status.textContent = 'あなたの勝ち！AIの駒を封じました。';
      if (typeof awardXp === 'function'){
        const xp = WIN_EXP[difficulty] || WIN_EXP.NORMAL;
        try { awardXp(xp, { type: 'win', game: 'nine_mens_morris', difficulty }); } catch (err) {}
      }
    }

    function concludePlayerLose(){
      ended = true;
      thinking = false;
      status.textContent = '敗北… AIに駒を封じられました。';
    }

    function checkEndAfterMove(color){
      const opponent = -color;
      const oppPieces = countPieces(board, opponent);
      if (placed[opponent] >= 9 && oppPieces <= 2){
        if (color === PLAYER) concludePlayerWin(); else concludePlayerLose();
        return true;
      }
      if (placed[opponent] >= 9){
        if (mobilityCount(board, placed, opponent) === 0){
          if (color === PLAYER) concludePlayerWin(); else concludePlayerLose();
          return true;
        }
      }
      if (oppPieces === 0){
        if (color === PLAYER) concludePlayerWin(); else concludePlayerLose();
        return true;
      }
      return false;
    }

    function startAiTurn(){
      if (ended) return;
      thinking = true;
      updateInfo();
      draw();
      aiTimer = setTimeout(() => {
        if (ended) return;
        const move = chooseAiMove(board, placed, difficulty);
        if (!move){
          concludePlayerWin();
          updateInfo();
          draw();
          return;
        }
        if (move.type === 'place'){
          board[move.to] = AI;
          placed[AI]++;
        } else {
          board[move.from] = EMPTY;
          board[move.to] = AI;
        }
        if (move.formsMill){
          if (move.remove != null){
            board[move.remove] = EMPTY;
            captured[AI]++;
          }
        }
        lastMove = { from: move.from, to: move.to, color: AI, formsMill: move.formsMill };
        thinking = false;
        if (move.formsMill && move.remove != null){
          lastMove.removed = move.remove;
        }
        if (checkEndAfterMove(AI)){
          updateInfo();
          draw();
          return;
        }
        turn = PLAYER;
        updateInfo();
        draw();
      }, difficulty === 'HARD' ? 450 : 320);
    }

    function beginRemoval(){
      removalPending = true;
      removalTargets = getRemovalCandidates(board, AI);
      if (removalTargets.length === 0){
        removalPending = false;
        if (!checkEndAfterMove(PLAYER)){
          turn = AI;
          updateInfo();
          draw();
          startAiTurn();
        }
        return;
      }
      updateInfo();
      draw();
    }

    function handleRemoval(index){
      if (!removalTargets.includes(index)) return;
      board[index] = EMPTY;
      captured[PLAYER]++;
      removalPending = false;
      removalTargets = [];
      if (typeof awardXp === 'function'){
        try { awardXp(CAPTURE_XP, { type: 'capture', game: 'nine_mens_morris' }); } catch (err) {}
      }
      showPopup(index, `+${CAPTURE_XP}`);
      if (checkEndAfterMove(PLAYER)){
        updateInfo();
        draw();
        return;
      }
      turn = AI;
      updateInfo();
      draw();
      startAiTurn();
    }

    function pointFromEvent(e){
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const padding = 40;
      const unit = (canvas.width - padding * 2) / 6;
      let best = null;
      let bestDist = unit * 0.5;
      for (let i = 0; i < POINT_COORDS.length; i++){
        const pt = pointToPixel(i);
        const d = Math.hypot(pt.x - x, pt.y - y);
        if (d < bestDist){ bestDist = d; best = i; }
      }
      return best;
    }

    function handleClick(e){
      if (!running || ended || thinking) return;
      const idx = pointFromEvent(e);
      if (idx == null) return;
      if (removalPending){
        handleRemoval(idx);
        return;
      }
      if (turn !== PLAYER) return;
      const phase = getPhase(board, placed, PLAYER);
      if (phase === 'place'){
        if (board[idx] !== EMPTY) return;
        board[idx] = PLAYER;
        placed[PLAYER]++;
        lastMove = { from: null, to: idx, color: PLAYER, formsMill: false };
        if (typeof awardXp === 'function'){
          try { awardXp(PLACE_XP, { type: 'place', game: 'nine_mens_morris' }); } catch (err) {}
        }
        showPopup(idx, `+${PLACE_XP}`);
        if (formsMill(board, idx, PLAYER)){
          lastMove.formsMill = true;
          if (typeof awardXp === 'function'){
            try { awardXp(MILL_XP, { type: 'mill', game: 'nine_mens_morris' }); } catch (err) {}
          }
          showPopup(idx, `+${MILL_XP}`, { variant: 'combo' });
          beginRemoval();
        } else {
          if (checkEndAfterMove(PLAYER)){
            updateInfo();
            draw();
            return;
          }
          turn = AI;
          updateInfo();
          draw();
          startAiTurn();
        }
        return;
      }
      if (board[idx] === PLAYER){
        selected = selected === idx ? null : idx;
        draw();
        return;
      }
      if (selected == null) return;
      if (board[idx] !== EMPTY) return;
      const destinations = phase === 'fly' ? emptyIndices(board) : ADJACENT[selected];
      if (phase !== 'fly' && !destinations.includes(idx)) return;
      board[selected] = EMPTY;
      board[idx] = PLAYER;
      lastMove = { from: selected, to: idx, color: PLAYER, formsMill: false };
      selected = null;
      if (typeof awardXp === 'function'){
        try { awardXp(MOVE_XP, { type: 'move', game: 'nine_mens_morris', phase }); } catch (err) {}
      }
      showPopup(idx, `+${MOVE_XP}`);
      if (formsMill(board, idx, PLAYER)){
        lastMove.formsMill = true;
        if (typeof awardXp === 'function'){
          try { awardXp(MILL_XP, { type: 'mill', game: 'nine_mens_morris' }); } catch (err) {}
        }
        showPopup(idx, `+${MILL_XP}`, { variant: 'combo' });
        beginRemoval();
      } else {
        if (checkEndAfterMove(PLAYER)){
          updateInfo();
          draw();
          return;
        }
        turn = AI;
        updateInfo();
        draw();
        startAiTurn();
      }
    }

    function handleMouseMove(e){
      if (!running || ended) return;
      const idx = pointFromEvent(e);
      if (hoverIndex !== idx){
        hoverIndex = idx;
        draw();
      }
    }

    function handleMouseLeave(){
      if (!running || ended) return;
      hoverIndex = null;
      draw();
    }

    function start(){
      if (running) return;
      running = true;
      canvas.addEventListener('click', handleClick);
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseleave', handleMouseLeave);
      updateInfo();
      draw();
    }

    function stop(){
      if (!running) return;
      running = false;
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      if (aiTimer) {
        clearTimeout(aiTimer);
        aiTimer = null;
      }
    }

    function destroy(){
      try { stop(); } catch (err) {}
      try { root && root.removeChild(container); } catch (err) {}
    }

    function getScore(){
      return countPieces(board, PLAYER) - countPieces(board, AI);
    }

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({
    id: 'nine_mens_morris',
    name: 'ナイン・メンズ・モリス', nameKey: 'selection.miniexp.games.nine_mens_morris.name',
    description: '配置+1 / ミル+15 / 勝利ボーナス', descriptionKey: 'selection.miniexp.games.nine_mens_morris.description', categoryIds: ['board'],
    create
  });
})();

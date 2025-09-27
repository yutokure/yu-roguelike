(function(){
  'use strict';

  const PLAYER = 1;
  const AI = -1;
  const EMPTY = 0;
  const DIRS = [
    [1,0], [0,1], [1,1], [1,-1]
  ];

  const GAME_CONFIGS = [
    {
      id: 'connect6',
      name: 'コネクトシックス',
      description: '六目並べ。配置+1EXP/リーチ+10、勝利は難易度別に高EXP',
      cols: 15,
      rows: 15,
      winLength: 6,
      dropMode: false,
      xpWin: { EASY: 35, NORMAL: 140, HARD: 320 },
      aiBias: { centerWeight: 4, reachWeight: 16, forkWeight: 10 }
    },
    {
      id: 'gomoku',
      name: '五目並べ',
      description: '五目並べ。配置+1EXP/リーチ+10、勝利で高EXP',
      cols: 15,
      rows: 15,
      winLength: 5,
      dropMode: false,
      xpWin: { EASY: 28, NORMAL: 110, HARD: 260 },
      aiBias: { centerWeight: 3, reachWeight: 14, forkWeight: 8 }
    },
    {
      id: 'connect4',
      name: '四目並べ',
      description: 'コマが落下する四目並べ。配置+1EXP/リーチ+10、勝利で難易度別EXP',
      cols: 7,
      rows: 6,
      winLength: 4,
      dropMode: true,
      xpWin: { EASY: 20, NORMAL: 80, HARD: 200 },
      aiBias: { centerWeight: 5, reachWeight: 18, forkWeight: 12 }
    },
    {
      id: 'tic_tac_toe',
      name: '三目並べ',
      description: '三目並べ。配置+1EXP/リーチ+10、勝利で控えめEXP',
      cols: 3,
      rows: 3,
      winLength: 3,
      dropMode: false,
      xpWin: { EASY: 12, NORMAL: 48, HARD: 120 },
      aiBias: { centerWeight: 2, reachWeight: 20, forkWeight: 12 }
    }
  ];

  function inBounds(cols, rows, x, y){
    return x >= 0 && x < cols && y >= 0 && y < rows;
  }

  function checkWin(board, cols, rows, x, y, color, winLength){
    for (const [dx,dy] of DIRS){
      let count = 1;
      let nx = x + dx, ny = y + dy;
      while(inBounds(cols, rows, nx, ny) && board[ny][nx] === color){ count++; nx += dx; ny += dy; }
      nx = x - dx; ny = y - dy;
      while(inBounds(cols, rows, nx, ny) && board[ny][nx] === color){ count++; nx -= dx; ny -= dy; }
      if (count >= winLength) return true;
    }
    return false;
  }

  function wouldWin(board, cols, rows, x, y, color, winLength){
    board[y][x] = color;
    const res = checkWin(board, cols, rows, x, y, color, winLength);
    board[y][x] = EMPTY;
    return res;
  }

  function createsReach(board, cols, rows, x, y, color, winLength){
    // A move creates reach if it produces a line with winLength-1 stones and a free extension spot.
    const target = winLength - 1;
    for (const [dx,dy] of DIRS){
      let posCount = 0;
      let nx = x + dx, ny = y + dy;
      while(inBounds(cols, rows, nx, ny) && board[ny][nx] === color){ posCount++; nx += dx; ny += dy; }
      const forwardEmpty = inBounds(cols, rows, nx, ny) && board[ny][nx] === EMPTY;

      let negCount = 0;
      nx = x - dx; ny = y - dy;
      while(inBounds(cols, rows, nx, ny) && board[ny][nx] === color){ negCount++; nx -= dx; ny -= dy; }
      const backwardEmpty = inBounds(cols, rows, nx, ny) && board[ny][nx] === EMPTY;

      const total = posCount + negCount + 1;
      if (total === target && (forwardEmpty || backwardEmpty)) return true;
    }
    return false;
  }

  function boardFull(board, cols, rows){
    for (let y=0;y<rows;y++) for (let x=0;x<cols;x++) if (board[y][x] === EMPTY) return false;
    return true;
  }

  function boardHasWin(board, cfg, color){
    for (let y=0;y<cfg.rows;y++){
      for (let x=0;x<cfg.cols;x++){
        if (board[y][x] === color && checkWin(board, cfg.cols, cfg.rows, x, y, color, cfg.winLength)){
          return true;
        }
      }
    }
    return false;
  }

  function collectMoves(board, cfg){
    const moves = [];
    if (cfg.dropMode){
      for (let x=0;x<cfg.cols;x++){
        for (let y=cfg.rows-1; y>=0; y--){
          if (board[y][x] === EMPTY){
            moves.push({ x, y });
            break;
          }
        }
      }
    } else {
      for (let y=0;y<cfg.rows;y++) for (let x=0;x<cfg.cols;x++) if (board[y][x] === EMPTY) moves.push({x,y});
    }
    return moves;
  }

  function immediateWinCount(board, cfg, color){
    const moves = collectMoves(board, cfg);
    let count = 0;
    for (const mv of moves){
      if (wouldWin(board, cfg.cols, cfg.rows, mv.x, mv.y, color, cfg.winLength)){
        count++;
        if (count >= 3) break;
      }
    }
    return count;
  }

  function prioritizeMovesForColor(board, cfg, color, limit){
    const moves = collectMoves(board, cfg);
    if (!limit || moves.length <= limit) return moves;
    const immediate = [];
    const scored = [];
    for (const mv of moves){
      if (wouldWin(board, cfg.cols, cfg.rows, mv.x, mv.y, color, cfg.winLength)){
        immediate.push(mv);
      } else {
        const score = evaluateMove(board, cfg, mv, color);
        scored.push({ mv, score });
      }
    }
    if (immediate.length >= limit) return immediate;
    scored.sort((a, b) => b.score - a.score);
    const needed = limit - immediate.length;
    return immediate.concat(scored.slice(0, needed).map(entry => entry.mv));
  }

  function ticTacToeBestMove(board, cfg){
    const empties = collectMoves(board, cfg);
    if (empties.length === 0) return null;

    function minimax(turn){
      if (boardHasWin(board, cfg, AI)) return 1;
      if (boardHasWin(board, cfg, PLAYER)) return -1;
      if (boardFull(board, cfg.cols, cfg.rows)) return 0;
      const moves = collectMoves(board, cfg);
      if (moves.length === 0) return 0;
      if (turn === AI){
        let best = -Infinity;
        for (const mv of moves){
          board[mv.y][mv.x] = AI;
          const val = minimax(PLAYER);
          board[mv.y][mv.x] = EMPTY;
          if (val > best) best = val;
          if (best === 1) break;
        }
        return best;
      } else {
        let best = Infinity;
        for (const mv of moves){
          board[mv.y][mv.x] = PLAYER;
          const val = minimax(AI);
          board[mv.y][mv.x] = EMPTY;
          if (val < best) best = val;
          if (best === -1) break;
        }
        return best;
      }
    }

    let bestScore = -Infinity;
    let bestMoves = [];
    for (const mv of empties){
      board[mv.y][mv.x] = AI;
      const score = minimax(PLAYER);
      board[mv.y][mv.x] = EMPTY;
      if (score > bestScore){
        bestScore = score;
        bestMoves = [mv];
      } else if (score === bestScore){
        bestMoves.push(mv);
      }
    }
    if (bestMoves.length === 0) return empties[0];
    // Prefer center, then corners, then edges
    bestMoves.sort((a,b)=>{
      const pref = (mv)=>{
        const center = (cfg.cols-1)/2;
        const isCenter = (Math.abs(mv.x-center)<0.1 && Math.abs(mv.y-center)<0.1) ? 2 : 0;
        const isCorner = ((mv.x===0||mv.x===cfg.cols-1) && (mv.y===0||mv.y===cfg.rows-1)) ? 1 : 0;
        return isCenter*3 + isCorner*2;
      };
      return pref(b) - pref(a);
    });
    return bestMoves[0];
  }

  function gatherOpenSequencesAt(board, cfg, color, x, y){
    const sequences = [];
    for (const [dx,dy] of DIRS){
      const forward = [];
      let nx = x + dx, ny = y + dy;
      while(inBounds(cfg.cols, cfg.rows, nx, ny) && board[ny][nx] === color){ forward.push({ x:nx, y:ny }); nx += dx; ny += dy; }
      let posEmpty = null;
      if (inBounds(cfg.cols, cfg.rows, nx, ny) && board[ny][nx] === EMPTY) posEmpty = { x:nx, y:ny };

      const backward = [];
      nx = x - dx; ny = y - dy;
      while(inBounds(cfg.cols, cfg.rows, nx, ny) && board[ny][nx] === color){ backward.push({ x:nx, y:ny }); nx -= dx; ny -= dy; }
      let negEmpty = null;
      if (inBounds(cfg.cols, cfg.rows, nx, ny) && board[ny][nx] === EMPTY) negEmpty = { x:nx, y:ny };

      const stones = backward.slice().reverse().concat([{ x, y }], forward);
      const cellsWithEnds = [];
      if (negEmpty) cellsWithEnds.push(negEmpty);
      cellsWithEnds.push(...stones);
      if (posEmpty) cellsWithEnds.push(posEmpty);
      sequences.push({
        dir:[dx,dy],
        len: stones.length,
        stones,
        negEmpty,
        posEmpty,
        openNeg: !!negEmpty,
        openPos: !!posEmpty,
        cellsWithEnds
      });
    }
    return sequences;
  }

  function addThreat(threats, seen, threat){
    if (!threat || !threat.cells || !threat.cells.length) return;
    const cellSet = new Set();
    const uniqCells = [];
    for (const c of threat.cells){
      if (!c) continue;
      const key = `${c.x},${c.y}`;
      if (cellSet.has(key)) continue;
      cellSet.add(key);
      uniqCells.push({ x:c.x, y:c.y });
    }
    if (!uniqCells.length) return;
    const hash = `${threat.type}|${threat.color}|${uniqCells.map(c=>`${c.x},${c.y}`).sort().join(';')}`;
    if (seen.has(hash)) return;
    seen.add(hash);
    const segments = (threat.segments||[]).map(seg => {
      if (!seg || !seg.from || !seg.to) return null;
      return {
        from: { x: seg.from.x, y: seg.from.y },
        to: { x: seg.to.x, y: seg.to.y }
      };
    }).filter(Boolean);
    threats.push({ type: threat.type, severity: threat.severity, color: threat.color, cells: uniqCells, segments });
  }

  function evaluateThreatWindow(values, coords, color, cfg, flags, threats, seen){
    if (!values.length) return;
    if (flags.isTtt && values.length === 3){
      const str = values.join('');
      if (str === '010'){
        addThreat(threats, seen, {
          type:'tic_open_one', severity:'warning', color,
          cells: coords,
          segments:[{ from: coords[0], to: coords[coords.length-1] }]
        });
      } else if (str === '110' || str === '011'){
        addThreat(threats, seen, {
          type:'tic_two_in_row', severity:'warning', color,
          cells: coords,
          segments:[{ from: coords[0], to: coords[coords.length-1] }]
        });
      }
      return;
    }
    if (flags.isConnect4 && values.length === 4){
      const str = values.join('');
      if (str === '0110'){
        addThreat(threats, seen, {
          type:'connect4_open_two', severity:'warning', color,
          cells: coords,
          segments:[{ from: coords[0], to: coords[coords.length-1] }]
        });
      } else if (str === '1110' || str === '0111'){
        addThreat(threats, seen, {
          type:'connect4_three', severity:'warning', color,
          cells: coords,
          segments:[{ from: coords[0], to: coords[coords.length-1] }]
        });
      }
      return;
    }
    if (flags.isGomoku){
      const str = values.join('');
      if (values.length === 5){
        if (str === '01110'){
          addThreat(threats, seen, {
            type:'gomoku_open_three', severity:'warning', color,
            cells: coords,
            segments:[{ from: coords[0], to: coords[coords.length-1] }]
          });
        } else if (str === '11110' || str === '01111'){
          addThreat(threats, seen, {
            type:'gomoku_closed_four', severity:'warning', color,
            cells: coords,
            segments:[{ from: coords[0], to: coords[coords.length-1] }]
          });
        }
      } else if (values.length === 6 && str === '011110'){
        addThreat(threats, seen, {
          type:'gomoku_open_four', severity:'critical', color,
          cells: coords,
          segments:[{ from: coords[0], to: coords[coords.length-1] }]
        });
      }
      return;
    }
    if (flags.isConnect6 && values.length === 6){
      const str = values.join('');
      if (str === '011110'){
        addThreat(threats, seen, {
          type:'connect6_open_four', severity:'warning', color,
          cells: coords,
          segments:[{ from: coords[0], to: coords[coords.length-1] }]
        });
      } else if (str === '111110' || str === '011111'){
        addThreat(threats, seen, {
          type:'connect6_closed_five', severity:'critical', color,
          cells: coords,
          segments:[{ from: coords[0], to: coords[coords.length-1] }]
        });
      }
    }
  }

  function evaluateLineThreats(values, coords, color, cfg, flags, threats, seen){
    const lengths = flags.isTtt ? [3] :
                     flags.isConnect4 ? [4] :
                     flags.isGomoku ? [5,6] :
                     flags.isConnect6 ? [6] : [cfg.winLength];
    for (const len of lengths){
      if (coords.length < len) continue;
      for (let i=0;i<=coords.length - len;i++){
        const sliceVals = values.slice(i, i+len);
        if (sliceVals.includes(-1)) continue;
        const sliceCoords = coords.slice(i, i+len);
        evaluateThreatWindow(sliceVals, sliceCoords, color, cfg, flags, threats, seen);
      }
    }
  }

  function scanLinesForThreats(board, cfg, color, flags, threats, seen){
    for (let y=0;y<cfg.rows;y++){
      for (let x=0;x<cfg.cols;x++){
        for (const [dx,dy] of DIRS){
          const prevX = x - dx, prevY = y - dy;
          if (inBounds(cfg.cols, cfg.rows, prevX, prevY)) continue;
          const coords = [];
          let nx = x, ny = y;
          while(inBounds(cfg.cols, cfg.rows, nx, ny)){
            coords.push({ x:nx, y:ny });
            nx += dx; ny += dy;
          }
          if (!coords.length) continue;
          const values = coords.map(c => board[c.y][c.x] === color ? 1 : board[c.y][c.x] === EMPTY ? 0 : -1);
          evaluateLineThreats(values, coords, color, cfg, flags, threats, seen);
        }
      }
    }
  }

  function detectCompositeThreats(board, cfg, color, flags, threats, seen){
    if (!flags.isGomoku) return;
    const empties = [];
    for (let y=0;y<cfg.rows;y++){
      for (let x=0;x<cfg.cols;x++) if (board[y][x] === EMPTY) empties.push({ x, y });
    }
    for (const cell of empties){
      board[cell.y][cell.x] = color;
      if (checkWin(board, cfg.cols, cfg.rows, cell.x, cell.y, color, cfg.winLength)){
        board[cell.y][cell.x] = EMPTY;
        continue;
      }
      const sequences = gatherOpenSequencesAt(board, cfg, color, cell.x, cell.y);
      const openThrees = sequences.filter(seq => seq.len === 3 && seq.openNeg && seq.openPos);
      const openFours = sequences.filter(seq => seq.len === 4 && seq.openNeg && seq.openPos);
      if (openThrees.length >= 2){
        const cells = [{ x:cell.x, y:cell.y }];
        const segments = [];
        for (const seq of openThrees){
          cells.push(...seq.cellsWithEnds);
          const from = seq.negEmpty || seq.stones[0];
          const to = seq.posEmpty || seq.stones[seq.stones.length-1];
          segments.push({ from, to });
        }
        addThreat(threats, seen, {
          type:'gomoku_double_three', severity:'critical', color,
          cells,
          segments
        });
      }
      if (openFours.length >= 1 && openThrees.length >= 1){
        const cells = [{ x:cell.x, y:cell.y }];
        const segments = [];
        for (const seq of openFours){
          cells.push(...seq.cellsWithEnds);
          const from = seq.negEmpty || seq.stones[0];
          const to = seq.posEmpty || seq.stones[seq.stones.length-1];
          segments.push({ from, to });
        }
        for (const seq of openThrees){
          cells.push(...seq.cellsWithEnds);
          const from = seq.negEmpty || seq.stones[0];
          const to = seq.posEmpty || seq.stones[seq.stones.length-1];
          segments.push({ from, to });
        }
        addThreat(threats, seen, {
          type:'gomoku_four_three', severity:'critical', color,
          cells,
          segments
        });
      }
      board[cell.y][cell.x] = EMPTY;
    }
  }

  function computeThreats(board, cfg){
    const flags = {
      isTtt: cfg.winLength === 3 && cfg.cols === 3 && cfg.rows === 3 && !cfg.dropMode,
      isConnect4: cfg.id === 'connect4' || (cfg.winLength === 4 && cfg.dropMode),
      isGomoku: cfg.id === 'gomoku' || cfg.winLength === 5,
      isConnect6: cfg.id === 'connect6' || cfg.winLength === 6
    };
    const threats = [];
    const seen = new Set();
    for (const color of [PLAYER, AI]){
      scanLinesForThreats(board, cfg, color, flags, threats, seen);
      detectCompositeThreats(board, cfg, color, flags, threats, seen);
    }
    return threats;
  }

  function evaluateMove(board, cfg, move, color){
    const { cols, rows, winLength } = cfg;
    const { x, y } = move;
    board[y][x] = color;
    let score = 0;
    const centerX = (cols - 1) / 2;
    const centerY = (rows - 1) / 2;
    const dist = Math.abs(centerX - x) + Math.abs(centerY - y);
    score += Math.max(0, (cfg.aiBias.centerWeight||0) - dist * 0.7);
    for (const [dx,dy] of DIRS){
      let chain = 1;
      let gaps = 0;
      let nx = x + dx, ny = y + dy;
      while(inBounds(cols, rows, nx, ny) && board[ny][nx] === color){ chain++; nx += dx; ny += dy; }
      if (inBounds(cols, rows, nx, ny) && board[ny][nx] === EMPTY) gaps++;
      nx = x - dx; ny = y - dy;
      while(inBounds(cols, rows, nx, ny) && board[ny][nx] === color){ chain++; nx -= dx; ny -= dy; }
      if (inBounds(cols, rows, nx, ny) && board[ny][nx] === EMPTY) gaps++;
      if (chain >= winLength) score += 1000;
      else if (chain === winLength - 1 && gaps > 0) score += (cfg.aiBias.reachWeight||12);
      else if (chain === winLength - 2 && gaps > 1) score += (cfg.aiBias.forkWeight||6);
    }
    board[y][x] = EMPTY;
    return score;
  }

  function chooseAiMove(board, cfg, difficulty){
    const moves = collectMoves(board, cfg);
    if (moves.length === 0) return null;
    const { cols, rows, winLength } = cfg;
    // Immediate win
    for (const mv of moves){
      if (wouldWin(board, cols, rows, mv.x, mv.y, AI, winLength)) return mv;
    }
    if (difficulty !== 'EASY'){
      // Block imminent player win
      for (const mv of moves){
        if (wouldWin(board, cols, rows, mv.x, mv.y, PLAYER, winLength)) return mv;
      }
    }
    if (difficulty === 'EASY'){
      return moves[Math.floor(Math.random()*moves.length)];
    }
    const isPerfectTtt = cfg.winLength === 3 && cfg.cols === 3 && cfg.rows === 3 && !cfg.dropMode;
    if (difficulty === 'HARD' && isPerfectTtt){
      const mv = ticTacToeBestMove(board, cfg);
      if (mv) return mv;
    }
    // Score moves
    let best = null;
    let bestScore = -Infinity;
    for (const mv of moves){
      let score = evaluateMove(board, cfg, mv, AI);
      if (difficulty === 'HARD'){
        board[mv.y][mv.x] = AI;
        const branchLimit = cfg.dropMode ? 5 : 6;
        const replies = prioritizeMovesForColor(board, cfg, PLAYER, branchLimit);
        let worstThreat = 0;
        for (const rep of replies){
          board[rep.y][rep.x] = PLAYER;
          let threat = 0;
          if (checkWin(board, cols, rows, rep.x, rep.y, PLAYER, winLength)) {
            threat = 1000;
          } else {
            const winCount = immediateWinCount(board, cfg, PLAYER);
            if (winCount >= 2) threat += 420 + winCount * 40;
            else if (winCount === 1) threat += 180;
            if (createsReach(board, cols, rows, rep.x, rep.y, PLAYER, winLength)) threat += 80;

            const followLimit = cfg.dropMode ? 4 : 5;
            const followMoves = prioritizeMovesForColor(board, cfg, PLAYER, followLimit);
            let bestPlayerFollow = 0;
            for (const fm of followMoves){
              const val = evaluateMove(board, cfg, fm, PLAYER);
              if (val > bestPlayerFollow) bestPlayerFollow = val;
            }
            threat += bestPlayerFollow * 0.6;

            let bestCounter = 0;
            const counterMoves = prioritizeMovesForColor(board, cfg, AI, followLimit);
            for (const counter of counterMoves){
              board[counter.y][counter.x] = AI;
              let counterScore = 0;
              if (checkWin(board, cols, rows, counter.x, counter.y, AI, winLength)) counterScore = 900;
              else counterScore = evaluateMove(board, cfg, counter, AI);
              board[counter.y][counter.x] = EMPTY;
              if (counterScore > bestCounter) bestCounter = counterScore;
            }
            threat = Math.max(0, threat - bestCounter * 0.35);
          }
          board[rep.y][rep.x] = EMPTY;
          if (threat > worstThreat) worstThreat = threat;
        }
        board[mv.y][mv.x] = EMPTY;
        if (worstThreat > 0) score -= worstThreat * 0.5;
      } else {
        score -= evaluateMove(board, cfg, mv, PLAYER) * 0.25;
      }
      if (score > bestScore){ bestScore = score; best = mv; }
    }
    if (!best) best = moves[Math.floor(Math.random()*moves.length)];
    return best;
  }

  function createStoneGame(cfg){
    return function(root, awardXp, opts){
      const difficulty = opts?.difficulty || 'NORMAL';
      const shortcuts = opts?.shortcuts;
      const xpWin = cfg.xpWin?.[difficulty] ?? cfg.xpWin?.NORMAL ?? 100;

      const canvas = document.createElement('canvas');
      canvas.width = cfg.dropMode ? 460 : 520;
      canvas.height = 520;
      canvas.style.display = 'block';
      canvas.style.margin = '0 auto';
      canvas.style.borderRadius = '12px';
      canvas.style.background = cfg.dropMode ? '#1e3a8a' : '#fef3c7';
      root.appendChild(canvas);
      const ctx = canvas.getContext('2d');

      const board = Array.from({ length: cfg.rows }, () => Array(cfg.cols).fill(EMPTY));
      let turn = PLAYER;
      let running = false;
      let ended = false;
      let lastMove = null;
      let resultText = '';
      let hover = null; // {x,y} or {col}
      let threats = [];
      let blinkPhase = 0;
      let blinkRaf = 0;
      const PLAYER_POPUP_COLOR = '#38bdf8';
      const AI_POPUP_COLOR = '#ef4444';

      function emptySummary(){
        return {
          player: new Map(),
          ai: new Map(),
          criticalPlayer: new Map(),
          criticalAi: new Map()
        };
      }

      let lastThreatSummary = emptySummary();

      function layout(){
        const cell = Math.min(canvas.width / cfg.cols, canvas.height / cfg.rows);
        const offsetX = (canvas.width - cell * cfg.cols) / 2;
        const offsetY = (canvas.height - cell * cfg.rows) / 2;
        return { cell, offsetX, offsetY };
      }

      function ensureRootPositioned(){
        if (!root) return;
        try {
          const style = window.getComputedStyle(root);
          if (style.position === 'static') root.style.position = 'relative';
        } catch {}
      }

      function showPopupForCells(cells, text, color){
        if (!root || !canvas) return;
        try {
          ensureRootPositioned();
          const { cell, offsetX, offsetY } = layout();
          const rect = canvas.getBoundingClientRect();
          const containerRect = root.getBoundingClientRect();
          const points = (cells && cells.length) ? cells : (lastMove ? [lastMove] : [{ x:0, y:0 }]);
          let sx = 0, sy = 0;
          for (const c of points){
            sx += offsetX + (c.x + 0.5) * cell;
            sy += offsetY + (c.y + 0.5) * cell;
          }
          const px = rect.left + (sx / points.length);
          const py = rect.top + (sy / points.length);
          const node = document.createElement('div');
          node.textContent = text;
          node.style.position = 'absolute';
          node.style.left = `${px - containerRect.left}px`;
          node.style.top = `${py - containerRect.top}px`;
          node.style.transform = 'translate(-50%, -120%)';
          node.style.padding = '4px 8px';
          node.style.borderRadius = '6px';
          node.style.fontSize = '14px';
          node.style.background = 'rgba(15,23,42,0.88)';
          node.style.color = color;
          node.style.fontWeight = 'bold';
          node.style.pointerEvents = 'none';
          node.style.boxShadow = '0 3px 8px rgba(0,0,0,0.35)';
          node.style.zIndex = 10;
          root.appendChild(node);
          setTimeout(() => { try { node.remove(); } catch {} }, 1500);
        } catch {}
      }

      function showPopupAtCell(cell, text, color){
        showPopupForCells(cell ? [cell] : [], text, color);
      }

      function threatKey(threat){
        const cells = threat.cells?.map(c => `${c.x},${c.y}`).sort().join('|') || '';
        return `${threat.color}:${threat.severity}:${threat.type}:${cells}`;
      }

      function summarizeThreats(list){
        const summary = emptySummary();
        for (const threat of list){
          const key = threatKey(threat);
          if (threat.color === PLAYER){
            summary.player.set(key, threat);
            if (threat.severity === 'critical') summary.criticalPlayer.set(key, threat);
          } else if (threat.color === AI){
            summary.ai.set(key, threat);
            if (threat.severity === 'critical') summary.criticalAi.set(key, threat);
          }
        }
        return summary;
      }

      function cancelThreatAnimation(){ if (blinkRaf){ cancelAnimationFrame(blinkRaf); blinkRaf = 0; } }

      function clearThreats(){ threats = []; cancelThreatAnimation(); lastThreatSummary = emptySummary(); }

      function ensureBlink(){
        if (blinkRaf) return;
        const step = (ts)=>{
          if (!threats.length){ blinkRaf = 0; return; }
          blinkPhase = ts;
          draw(true);
          blinkRaf = requestAnimationFrame(step);
        };
        blinkRaf = requestAnimationFrame(step);
      }

      function refreshThreats(meta = null){
        if (ended){ clearThreats(); return; }
        const prevSummary = lastThreatSummary;
        const newThreats = computeThreats(board, cfg);
        threats = newThreats;
        const summary = summarizeThreats(newThreats);
        lastThreatSummary = summary;

        if (threats.length) ensureBlink();
        else cancelThreatAnimation();

        const prevAiKeys = new Set(prevSummary.ai.keys());
        const prevPlayerKeys = new Set(prevSummary.player.keys());
        const newAiKeys = new Set(summary.ai.keys());
        const newPlayerKeys = new Set(summary.player.keys());

        const newAiCritical = [];
        const newAiWarnings = [];
        summary.ai.forEach((threat, key) => {
          if (!prevAiKeys.has(key)){
            if (threat.severity === 'critical') newAiCritical.push(threat);
            else newAiWarnings.push(threat);
          }
        });

        const newPlayerCritical = [];
        const newPlayerWarnings = [];
        summary.player.forEach((threat, key) => {
          if (!prevPlayerKeys.has(key)){
            if (threat.severity === 'critical') newPlayerCritical.push(threat);
            else newPlayerWarnings.push(threat);
          }
        });

        let popup = null;
        const schedulePopup = (text, cells, color, priority) => {
          if (!popup || priority > popup.priority){
            popup = { text, cells, color, priority };
          }
        };

        if (meta && meta.trigger === 'playerMove' && meta.move){
          let resolved = false;
          for (const key of prevAiKeys){ if (!newAiKeys.has(key)) { resolved = true; break; } }
          if (resolved){ schedulePopup('防手', [{ x: meta.move.x, y: meta.move.y }], PLAYER_POPUP_COLOR, 3); }
        }

        if (newAiCritical.length){
          schedulePopup('詰み手', newAiCritical[0].cells, AI_POPUP_COLOR, 5);
        }
        if (newPlayerCritical.length){
          schedulePopup('勝ち手', newPlayerCritical[0].cells, PLAYER_POPUP_COLOR, 4);
        }
        if (newAiWarnings.length){
          schedulePopup('追われ手', newAiWarnings[0].cells, AI_POPUP_COLOR, 2);
        }
        if (newPlayerWarnings.length){
          schedulePopup('追い手', newPlayerWarnings[0].cells, PLAYER_POPUP_COLOR, 1);
        }

        if (popup){
          const cells = popup.cells && popup.cells.length ? popup.cells : (meta?.move ? [meta.move] : null);
          showPopupForCells(cells||[], popup.text, popup.color);
        }
      }

      function draw(fromAnimation = false){
        const { cell, offsetX, offsetY } = layout();
        ctx.clearRect(0,0,canvas.width,canvas.height);
        if (!cfg.dropMode){
          ctx.fillStyle = '#fef3c7';
          ctx.fillRect(0,0,canvas.width,canvas.height);
          ctx.strokeStyle = 'rgba(100,100,80,0.4)';
          for (let x=0;x<=cfg.cols;x++){
            const px = offsetX + x*cell + 0.5;
            ctx.beginPath(); ctx.moveTo(px, offsetY); ctx.lineTo(px, offsetY + cfg.rows * cell); ctx.stroke();
          }
          for (let y=0;y<=cfg.rows;y++){
            const py = offsetY + y*cell + 0.5;
            ctx.beginPath(); ctx.moveTo(offsetX, py); ctx.lineTo(offsetX + cfg.cols * cell, py); ctx.stroke();
          }
        } else {
          ctx.fillStyle = '#1e3a8a';
          ctx.fillRect(0,0,canvas.width,canvas.height);
          ctx.fillStyle = 'rgba(15,23,42,0.25)';
          for (let x=0;x<cfg.cols;x++) for (let y=0;y<cfg.rows;y++){
            const cx = offsetX + (x+0.5)*cell;
            const cy = offsetY + (y+0.5)*cell;
            ctx.beginPath(); ctx.arc(cx, cy, cell*0.46, 0, Math.PI*2); ctx.fill();
          }
        }
        if (hover && !ended){
          ctx.save();
          ctx.fillStyle = 'rgba(253,224,71,0.3)';
          if (cfg.dropMode){
            const x = hover.col;
            const rectX = offsetX + x*cell;
            ctx.fillRect(rectX, offsetY, cell, cell*cfg.rows);
          } else {
            const x = hover.x, y = hover.y;
            ctx.beginPath();
            ctx.arc(offsetX + (x+0.5)*cell, offsetY + (y+0.5)*cell, cell*0.4, 0, Math.PI*2);
            ctx.fill();
          }
          ctx.restore();
        }
        for (let y=0;y<cfg.rows;y++){
          for (let x=0;x<cfg.cols;x++){
            const v = board[y][x]; if (!v) continue;
            const cx = offsetX + (x+0.5)*cell;
            const cy = offsetY + (y+0.5)*cell;
            ctx.beginPath();
            ctx.arc(cx, cy, cell*0.38, 0, Math.PI*2);
            if (v === PLAYER){ ctx.fillStyle = '#0f172a'; }
            else { ctx.fillStyle = cfg.dropMode ? '#94a3b8' : '#e5e7eb'; }
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.25)';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }

        if (threats.length){
          const pulse = 0.45 + 0.35 * Math.sin((blinkPhase||0) / 200);
          for (const threat of threats){
            const base = threat.severity === 'critical' ? [239,68,68] : [249,115,22];
            const fillAlpha = 0.18 + pulse * 0.22;
            const strokeAlpha = 0.55 + pulse * 0.35;
            const colorFill = `rgba(${base[0]},${base[1]},${base[2]},${fillAlpha.toFixed(3)})`;
            const colorStroke = `rgba(${base[0]},${base[1]},${base[2]},${strokeAlpha.toFixed(3)})`;
            for (const cellPos of threat.cells){
              const cx = offsetX + (cellPos.x + 0.5) * cell;
              const cy = offsetY + (cellPos.y + 0.5) * cell;
              ctx.beginPath();
              ctx.arc(cx, cy, cell * 0.42, 0, Math.PI * 2);
              ctx.strokeStyle = colorStroke;
              ctx.lineWidth = 3;
              ctx.setLineDash([6,4]);
              ctx.stroke();
              ctx.setLineDash([]);
              ctx.fillStyle = colorFill;
              ctx.fill();
            }
            ctx.strokeStyle = colorStroke;
            ctx.lineWidth = threat.severity === 'critical' ? 4 : 3;
            for (const seg of threat.segments){
              if (!seg || !seg.from || !seg.to) continue;
              const fx = offsetX + (seg.from.x + 0.5) * cell;
              const fy = offsetY + (seg.from.y + 0.5) * cell;
              const tx = offsetX + (seg.to.x + 0.5) * cell;
              const ty = offsetY + (seg.to.y + 0.5) * cell;
              if (Math.abs(fx - tx) < 0.01 && Math.abs(fy - ty) < 0.01) continue;
              ctx.beginPath();
              ctx.moveTo(fx, fy);
              ctx.lineTo(tx, ty);
              ctx.stroke();
            }
          }
        }
        if (lastMove){
          ctx.strokeStyle = 'rgba(253,224,71,0.9)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(offsetX + (lastMove.x+0.5)*cell, offsetY + (lastMove.y+0.5)*cell, cell*0.44, 0, Math.PI*2);
          ctx.stroke();
        }
        ctx.fillStyle = '#f8fafc';
        ctx.font = '16px system-ui, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(ended ? 'ゲーム終了' : (turn === PLAYER ? 'あなたの番' : 'AIの番'), offsetX + 8, offsetY - 12);
        if (ended){
          ctx.fillStyle = 'rgba(15,23,42,0.7)';
          ctx.fillRect(0, canvas.height/2 - 40, canvas.width, 80);
          ctx.fillStyle = '#f8fafc';
          ctx.font = 'bold 28px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(resultText || 'ゲーム終了', canvas.width/2, canvas.height/2);
          ctx.font = '12px system-ui, sans-serif';
          ctx.fillText('Rキーでリセットできます', canvas.width/2, canvas.height/2 + 22);
          ctx.textAlign = 'left';
        }
      }

      function disableHostRestart(){
        shortcuts?.disableKey('r');
      }

      function enableHostRestart(){
        shortcuts?.enableKey('r');
      }

      function reset(){
        disableHostRestart();
        cancelAiTimer();
        for (let y=0;y<cfg.rows;y++) board[y].fill(EMPTY);
        turn = PLAYER;
        ended = false;
        resultText = '';
        lastMove = null;
        hover = null;
        clearThreats();
        refreshThreats({ trigger: 'reset' });
        draw();
      }

      function finish(text){
        cancelAiTimer();
        ended = true;
        resultText = text;
        clearThreats();
        draw();
        enableHostRestart();
      }

      function processPlayerMove(x, y){
        if (ended || turn !== PLAYER) return;
        if (!inBounds(cfg.cols, cfg.rows, x, y)) return;
        if (board[y][x] !== EMPTY) return;
        board[y][x] = PLAYER;
        lastMove = { x, y, color: PLAYER };
        awardXp(1, { type: 'place', game: cfg.id });
        const reached = createsReach(board, cfg.cols, cfg.rows, x, y, PLAYER, cfg.winLength);
        const won = checkWin(board, cfg.cols, cfg.rows, x, y, PLAYER, cfg.winLength);
        if (!won && reached){ awardXp(10, { type:'reach', game: cfg.id }); }
        if (won){
          awardXp(xpWin, { type:'win', game: cfg.id });
          finish('あなたの勝ち！');
          return;
        }
        if (boardFull(board, cfg.cols, cfg.rows)){
          finish('引き分け');
          return;
        }
        turn = AI;
        refreshThreats({ trigger: 'playerMove', move: { x, y } });
        draw();
        scheduleAiTurn(difficulty === 'HARD' ? 80 : 160);
      }

      function aiTurn(){
        aiTimer = null;
        if (!running || ended || turn !== AI) return;
        const mv = chooseAiMove(board, cfg, difficulty);
        if (!mv){ finish('引き分け'); return; }
        board[mv.y][mv.x] = AI;
        lastMove = { x: mv.x, y: mv.y, color: AI };
        const win = checkWin(board, cfg.cols, cfg.rows, mv.x, mv.y, AI, cfg.winLength);
        if (win){ finish('AIの勝ち…'); return; }
        if (boardFull(board, cfg.cols, cfg.rows)){ finish('引き分け'); return; }
        turn = PLAYER;
        refreshThreats({ trigger: 'aiMove', move: mv });
        draw();
      }

      function canvasPosToCell(e){
        const rect = canvas.getBoundingClientRect();
        const { cell, offsetX, offsetY } = layout();
        const px = e.clientX - rect.left;
        const py = e.clientY - rect.top;
        const gx = Math.floor((px - offsetX) / cell);
        const gy = Math.floor((py - offsetY) / cell);
        return { x: gx, y: gy };
      }

      function handleClick(e){
        if (ended || turn !== PLAYER) return;
        if (cfg.dropMode){
          let col = hover?.col;
          if (col == null){
            const { x } = canvasPosToCell(e);
            if (Number.isFinite(x) && x >= 0 && x < cfg.cols) col = x;
          }
          if (col == null || !columnHasSpace(col)) return;
          for (let y = cfg.rows - 1; y >= 0; y--){
            if (board[y][col] === EMPTY){ processPlayerMove(col, y); return; }
          }
        } else {
          const { x, y } = canvasPosToCell(e);
          processPlayerMove(x, y);
        }
      }

      function columnHasSpace(col){
        for (let y = 0; y < cfg.rows; y++) if (board[y][col] === EMPTY) return true;
        return false;
      }

      function handleMove(e){
        if (ended) { hover = null; draw(); return; }
        if (cfg.dropMode){
          const { x } = canvasPosToCell(e);
          if (x >= 0 && x < cfg.cols && columnHasSpace(x)) hover = { col: x };
          else hover = null;
        } else {
          const { x, y } = canvasPosToCell(e);
          if (inBounds(cfg.cols, cfg.rows, x, y) && board[y][x] === EMPTY) hover = { x, y };
          else hover = null;
        }
        draw();
      }

      function handleLeave(){ hover = null; draw(); }

      function handleKey(e){ if (e.key === 'r' || e.key === 'R') { reset(); } }

      let aiTimer = null;
      function cancelAiTimer(){ if (aiTimer){ clearTimeout(aiTimer); aiTimer = null; } }
      function scheduleAiTurn(delay){ cancelAiTimer(); aiTimer = setTimeout(aiTurn, delay); }

      function start(){ if (running) return; running = true; disableHostRestart(); canvas.addEventListener('click', handleClick); canvas.addEventListener('mousemove', handleMove); canvas.addEventListener('mouseleave', handleLeave); window.addEventListener('keydown', handleKey); refreshThreats({ trigger: 'start' }); draw(); if (turn === AI) scheduleAiTurn(200); }
      function stop(opts = {}){ if (!running) return; running = false; cancelAiTimer(); canvas.removeEventListener('click', handleClick); canvas.removeEventListener('mousemove', handleMove); canvas.removeEventListener('mouseleave', handleLeave); window.removeEventListener('keydown', handleKey); if (!opts.keepShortcutsDisabled){ enableHostRestart(); } }
      function destroy(){ try { stop(); clearThreats(); root.removeChild(canvas); } catch {} }
      function getScore(){ let player=0, ai=0; for (let y=0;y<cfg.rows;y++) for (let x=0;x<cfg.cols;x++){ if(board[y][x]===PLAYER) player++; else if(board[y][x]===AI) ai++; } return player - ai; }

      return { start, stop, destroy, getScore };
    };
  }

  for (const cfg of GAME_CONFIGS){
    const create = createStoneGame(cfg);
    window.registerMiniGame({ id: cfg.id, name: cfg.name, description: cfg.description, create });
  }
})();

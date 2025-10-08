(function(){
  const SIZE = 9;
  const EMPTY = 0;
  const BLACK = 1; // player
  const WHITE = -1; // ai
  const GRID_COLOR = '#4b5563';
  const BOARD_COLOR = '#f1c232';
  const STAR_POINTS = [
    [2,2],[6,2],[2,6],[6,6],[4,4]
  ];
  const KOMI = 6.5;
  const XP_WIN = { EASY: 90, NORMAL: 180, HARD: 320 };
  const CAPTURE_MULT = { EASY: 2, NORMAL: 2.5, HARD: 3 };

  function create(root, awardXp, opts){
    const difficulty = (opts && opts.difficulty) || 'NORMAL';

    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.gap = '8px';
    container.style.padding = '8px';

    const infoCard = document.createElement('div');
    infoCard.style.display = 'flex';
    infoCard.style.justifyContent = 'center';
    infoCard.style.alignItems = 'center';
    infoCard.style.padding = '10px 18px';
    infoCard.style.borderRadius = '12px';
    infoCard.style.background = 'rgba(15,23,42,0.9)';
    infoCard.style.border = '1px solid rgba(148,163,184,0.4)';
    infoCard.style.width = '100%';
    infoCard.style.maxWidth = '420px';
    infoCard.style.boxShadow = '0 10px 24px rgba(15,23,42,0.35)';

    const info = document.createElement('div');
    info.style.color = '#f8fafc';
    info.style.fontSize = '16px';
    info.style.textAlign = 'center';
    info.textContent = '囲碁 9×9 — あなたが先手 (黒)';
    infoCard.appendChild(info);

    container.appendChild(infoCard);

    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 480;
    canvas.style.background = BOARD_COLOR;
    canvas.style.borderRadius = '10px';
    canvas.style.boxShadow = '0 6px 14px rgba(0,0,0,0.35)';
    canvas.style.touchAction = 'manipulation';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const buttons = document.createElement('div');
    buttons.style.display = 'flex';
    buttons.style.gap = '12px';

    const passBtn = document.createElement('button');
    passBtn.textContent = 'パス';
    passBtn.style.padding = '6px 18px';
    passBtn.style.borderRadius = '999px';
    passBtn.style.border = 'none';
    passBtn.style.background = '#1d4ed8';
    passBtn.style.color = '#f8fafc';
    passBtn.style.cursor = 'pointer';
    passBtn.style.fontSize = '15px';

    const resignBtn = document.createElement('button');
    resignBtn.textContent = '投了';
    resignBtn.style.padding = '6px 18px';
    resignBtn.style.borderRadius = '999px';
    resignBtn.style.border = 'none';
    resignBtn.style.background = '#b91c1c';
    resignBtn.style.color = '#f8fafc';
    resignBtn.style.cursor = 'pointer';
    resignBtn.style.fontSize = '15px';

    buttons.appendChild(passBtn);
    buttons.appendChild(resignBtn);
    container.appendChild(buttons);

    root.appendChild(container);

    let board = Array.from({length: SIZE}, () => Array(SIZE).fill(EMPTY));
    let running = false;
    let ended = false;
    let turn = BLACK;
    let hover = null;
    let lastMove = null; // {x,y,color}
    let consecutivePasses = 0;
    let blackCaptures = 0;
    let whiteCaptures = 0;
    let thinking = false;
    let history = new Set([boardHash(board)]);

    function inBounds(x,y){ return x>=0 && x<SIZE && y>=0 && y<SIZE; }
    const neighbors = [[1,0],[-1,0],[0,1],[0,-1]];

    function cloneBoard(src){ return src.map(row => row.slice()); }

    function boardHash(target){
      return target.map(row => row.join(',')).join('|');
    }

    function isKoViolation(simBoard){
      return history.has(boardHash(simBoard));
    }

    function collectGroup(target, sx, sy){
      const color = target[sy][sx];
      if (color === EMPTY) return { stones: [], liberties: 0 };
      const stack = [[sx, sy]];
      const seen = new Set([`${sx},${sy}`]);
      const stones = [];
      const liberties = new Set();
      while(stack.length){
        const [x,y] = stack.pop();
        stones.push([x,y]);
        for (const [dx,dy] of neighbors){
          const nx = x+dx, ny = y+dy;
          if (!inBounds(nx,ny)) continue;
          const cell = target[ny][nx];
          if (cell === EMPTY){ liberties.add(`${nx},${ny}`); }
          else if (cell === color){
            const key = `${nx},${ny}`;
            if (!seen.has(key)){ seen.add(key); stack.push([nx,ny]); }
          }
        }
      }
      return { stones, liberties: liberties.size };
    }

    function simulateMove(baseBoard, x, y, color){
      if (baseBoard[y][x] !== EMPTY) return null;
      const next = cloneBoard(baseBoard);
      next[y][x] = color;
      let captured = 0;
      for (const [dx,dy] of neighbors){
        const nx = x+dx, ny = y+dy;
        if (!inBounds(nx,ny)) continue;
        if (next[ny][nx] === -color){
          const grp = collectGroup(next, nx, ny);
          if (grp.liberties === 0){
            for (const [gx,gy] of grp.stones){ next[gy][gx] = EMPTY; captured++; }
          }
        }
      }
      const myGroup = collectGroup(next, x, y);
      if (myGroup.liberties === 0 && captured === 0){
        return null;
      }
      return { board: next, captured, liberties: myGroup.liberties };
    }

    function generateLegalMoves(color){
      const moves = [];
      for (let y=0;y<SIZE;y++){
        for (let x=0;x<SIZE;x++){
          if (board[y][x] !== EMPTY) continue;
          const sim = simulateMove(board, x, y, color);
          if (!sim) continue;
          if (isKoViolation(sim.board)) continue;
          let friendAdj = 0, enemyAdj = 0;
          for (const [dx,dy] of neighbors){
            const nx = x+dx, ny = y+dy;
            if (!inBounds(nx,ny)) continue;
            const cell = board[ny][nx];
            if (cell === color) friendAdj++;
            else if (cell === -color) enemyAdj++;
          }
          moves.push({ x, y, captured: sim.captured, liberties: sim.liberties, friendAdj, enemyAdj, simBoard: sim.board });
        }
      }
      return moves;
    }

    function territoryScore(target){
      const visited = Array.from({length: SIZE}, () => Array(SIZE).fill(false));
      let black = 0, white = 0;
      for (let y=0;y<SIZE;y++){
        for (let x=0;x<SIZE;x++){
          if (target[y][x] !== EMPTY || visited[y][x]) continue;
          const queue = [[x,y]];
          visited[y][x] = true;
          const region = [];
          const borders = new Set();
          while(queue.length){
            const [cx,cy] = queue.shift();
            region.push([cx,cy]);
            for (const [dx,dy] of neighbors){
              const nx = cx+dx, ny = cy+dy;
              if (!inBounds(nx,ny)) continue;
              const cell = target[ny][nx];
              if (cell === EMPTY){
                if (!visited[ny][nx]){ visited[ny][nx] = true; queue.push([nx,ny]); }
              } else {
                borders.add(cell);
              }
            }
          }
          if (borders.size === 1){
            const owner = borders.has(BLACK) ? BLACK : WHITE;
            const size = region.length;
            if (owner === BLACK) black += size;
            else white += size;
          }
        }
      }
      return { black, white };
    }

    function computeScore(target){
      let blackStones = 0, whiteStones = 0;
      for (let y=0;y<SIZE;y++){
        for (let x=0;x<SIZE;x++){
          if (target[y][x] === BLACK) blackStones++;
          else if (target[y][x] === WHITE) whiteStones++;
        }
      }
      const terr = territoryScore(target);
      return {
        black: blackStones + terr.black + blackCaptures,
        white: whiteStones + terr.white + whiteCaptures + KOMI
      };
    }

    function updateInfo(text){
      if (text){ info.textContent = text; return; }
      if (ended){ return; }
      const turnText = turn === BLACK ? 'あなたの番 (黒)' : 'AIの番 (白)';
      info.textContent = `${turnText} ｜ 黒 捕獲:${blackCaptures} ｜ 白 捕獲:${whiteCaptures} (コミ+${KOMI})`;
    }

    function draw(){
      const w = canvas.width;
      const cell = w / (SIZE + 1);
      ctx.clearRect(0,0,w,w);
      ctx.fillStyle = BOARD_COLOR;
      ctx.fillRect(0,0,w,w);
      ctx.strokeStyle = GRID_COLOR;
      ctx.lineWidth = 1.2;
      for (let i=1;i<=SIZE;i++){
        ctx.beginPath();
        ctx.moveTo(cell, i*cell);
        ctx.lineTo(SIZE*cell, i*cell);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(i*cell, cell);
        ctx.lineTo(i*cell, SIZE*cell);
        ctx.stroke();
      }
      ctx.fillStyle = '#111827';
      for (const [sx,sy] of STAR_POINTS){
        ctx.beginPath();
        ctx.arc((sx+1)*cell, (sy+1)*cell, cell*0.1, 0, Math.PI*2);
        ctx.fill();
      }
      for (let y=0;y<SIZE;y++){
        for (let x=0;x<SIZE;x++){
          const v = board[y][x];
          if (v === EMPTY) continue;
          ctx.beginPath();
          ctx.arc((x+1)*cell, (y+1)*cell, cell*0.45, 0, Math.PI*2);
          const grad = ctx.createRadialGradient((x+1)*cell - cell*0.18, (y+1)*cell - cell*0.18, cell*0.05, (x+1)*cell, (y+1)*cell, cell*0.45);
          if (v === BLACK){
            grad.addColorStop(0, '#f9fafb');
            grad.addColorStop(1, '#111827');
          } else {
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(1, '#cbd5f5');
          }
          ctx.fillStyle = grad;
          ctx.fill();
          ctx.strokeStyle = 'rgba(0,0,0,0.4)';
          ctx.stroke();
        }
      }
      if (hover && !ended){
        ctx.beginPath();
        ctx.arc((hover.x+1)*cell, (hover.y+1)*cell, cell*0.18, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(15,23,42,0.35)';
        ctx.fill();
      }
      if (lastMove){
        ctx.beginPath();
        ctx.arc((lastMove.x+1)*cell, (lastMove.y+1)*cell, cell*0.52, 0, Math.PI*2);
        ctx.strokeStyle = lastMove.color === BLACK ? 'rgba(148,163,184,0.8)' : 'rgba(15,23,42,0.8)';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }

    function applyMove(x, y, color, isPlayer){
      const sim = simulateMove(board, x, y, color);
      if (!sim) return false;
      if (isKoViolation(sim.board)){
        if (isPlayer) updateInfo('その手はコウで禁じられています');
        return false;
      }
      board = sim.board;
      lastMove = { x, y, color };
      if (color === BLACK) blackCaptures += sim.captured;
      else whiteCaptures += sim.captured;
      consecutivePasses = 0;
      history.add(boardHash(board));
      if (awardXp){
        awardXp(1, { type:'place', game:'go' });
        if (sim.captured > 0){
          const base = CAPTURE_MULT[difficulty] || 2;
          const gained = Math.max(1, Math.round(sim.captured * base));
          awardXp(gained, { type:'capture', game:'go', stones: sim.captured });
        }
      }
      draw();
      updateInfo();
      return true;
    }

    function endGame(reason, winner){
      if (ended) return;
      ended = true;
      const resolution = resolveDeadGroups(board);
      board = resolution.board;
      if (resolution.captures.black) blackCaptures += resolution.captures.black;
      if (resolution.captures.white) whiteCaptures += resolution.captures.white;
      draw();
      const finalScore = computeScore(board);
      const diff = finalScore.black - finalScore.white;
      let msg;
      if (winner){
        msg = winner === BLACK ? 'あなたの勝ち！' : 'AIの勝ち…';
      } else {
        if (diff > 0) winner = BLACK;
        else if (diff < 0) winner = WHITE;
        else winner = 0;
        msg = diff === 0 ? '持碁 (引き分け)' : (winner === BLACK ? 'あなたの勝ち！' : 'AIの勝ち…');
      }
      msg += ` ｜ 黒 ${formatScore(finalScore.black)} - 白 ${formatScore(finalScore.white)}`;
      updateInfo(msg);
      if (winner === BLACK && awardXp){
        const xp = XP_WIN[difficulty] || XP_WIN.NORMAL;
        awardXp(xp, { type:'win', game:'go', reason });
      }
    }

    function handlePass(isAi){
      if (ended || thinking) return;
      consecutivePasses++;
      lastMove = null;
      const who = isAi ? 'AI' : 'あなた';
      updateInfo(`${who}がパスしました (連続${consecutivePasses})`);
      if (consecutivePasses >= 2){
        endGame('pass', null);
        draw();
        return;
      }
      turn = -turn;
      draw();
      if (!isAi && turn === WHITE) setTimeout(aiMove, 220);
      else updateInfo();
    }

    function aiMove(){
      if (ended) return;
      thinking = true;
      updateInfo('AIが思考中…');
      const moves = generateLegalMoves(WHITE);
      let choice = null;
      if (moves.length > 0){
        let best = -Infinity;
        for (const mv of moves){
          const centerBias = -Math.hypot(mv.x - (SIZE-1)/2, mv.y - (SIZE-1)/2);
          let score = mv.captured * 12 + mv.friendAdj * 1.2 - mv.enemyAdj * 0.5 + mv.liberties * 0.3 + centerBias * 0.8;
          if (difficulty === 'EASY') score += Math.random() * 8 - 4;
          else if (difficulty === 'NORMAL') score += Math.random() * 4 - 2;
          else {
            // Hard: evaluate opponent reply by simple heuristic
            const replyMoves = generateRepliesForBoard(mv.simBoard, BLACK);
            if (replyMoves.length > 0){
              const worst = Math.max(...replyMoves.map(r => r));
              score -= worst * 0.6;
            }
          }
          if (score > best){ best = score; choice = mv; }
        }
      }
      if (!choice){
        thinking = false;
        handlePass(true);
        return;
      }
      setTimeout(() => {
        applyMove(choice.x, choice.y, WHITE, false);
        thinking = false;
        turn = BLACK;
        updateInfo();
      }, difficulty === 'HARD' ? 160 : 100);
    }

    function generateRepliesForBoard(targetBoard, color){
      const replies = [];
      for (let y=0;y<SIZE;y++){
        for (let x=0;x<SIZE;x++){
          if (targetBoard[y][x] !== EMPTY) continue;
          const sim = simulateMove(targetBoard, x, y, color);
          if (!sim) continue;
          if (isKoViolation(sim.board)) continue;
          replies.push(sim.captured * 6 + sim.liberties * 0.4);
        }
      }
      return replies;
    }

    function click(e){
      if (!running || ended || thinking) return;
      if (turn !== BLACK) return;
      const rect = canvas.getBoundingClientRect();
      const cell = canvas.width / (SIZE + 1);
      const x = Math.round((e.clientX - rect.left) / cell - 1);
      const y = Math.round((e.clientY - rect.top) / cell - 1);
      if (!inBounds(x,y)) return;
      if (!applyMove(x, y, BLACK, true)) return;
      turn = WHITE;
      draw();
      updateInfo();
      setTimeout(aiMove, 200);
    }

    function mousemove(e){
      if (ended || thinking || turn !== BLACK){ hover = null; draw(); return; }
      const rect = canvas.getBoundingClientRect();
      const cell = canvas.width / (SIZE + 1);
      const x = Math.round((e.clientX - rect.left) / cell - 1);
      const y = Math.round((e.clientY - rect.top) / cell - 1);
      if (!inBounds(x,y) || board[y][x] !== EMPTY){
        if (hover){ hover = null; draw(); }
        return;
      }
      const sim = simulateMove(board, x, y, BLACK);
      if (!sim || isKoViolation(sim.board)){ if (hover){ hover = null; draw(); } return; }
      if (!hover || hover.x !== x || hover.y !== y){
        hover = { x, y };
        draw();
      }
    }

    function mouseleave(){ if (hover){ hover = null; draw(); } }

    function start(){
      if (running) return;
      running = true;
      ended = false;
      updateInfo();
      draw();
      canvas.addEventListener('click', click);
      canvas.addEventListener('mousemove', mousemove);
      canvas.addEventListener('mouseleave', mouseleave);
      passBtn.addEventListener('click', onPass);
      resignBtn.addEventListener('click', onResign);
    }

    function stop(){
      if (!running) return;
      running = false;
      canvas.removeEventListener('click', click);
      canvas.removeEventListener('mousemove', mousemove);
      canvas.removeEventListener('mouseleave', mouseleave);
      passBtn.removeEventListener('click', onPass);
      resignBtn.removeEventListener('click', onResign);
    }

    function destroy(){
      try { stop(); root.removeChild(container); } catch {}
    }

    function reset(){
      board = Array.from({length: SIZE}, () => Array(SIZE).fill(EMPTY));
      ended = false;
      turn = BLACK;
      hover = null;
      lastMove = null;
      consecutivePasses = 0;
      blackCaptures = 0;
      whiteCaptures = 0;
      thinking = false;
      history = new Set([boardHash(board)]);
      updateInfo('囲碁 9×9 — あなたが先手 (黒)');
      draw();
    }

    function onPass(){
      if (!running || ended || thinking) return;
      if (turn !== BLACK) return;
      handlePass(false);
    }

    function onResign(){
      if (!running || ended) return;
      endGame('resign', WHITE);
    }

    function getScore(){
      const final = computeScore(board);
      return final.black - final.white;
    }

    function formatScore(value){
      const rounded = Math.round(value * 10) / 10;
      return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(1);
    }

    function resolveDeadGroups(base){
      const working = cloneBoard(base);
      const regionId = Array.from({length: SIZE}, () => Array(SIZE).fill(-1));
      const regionOwner = [];
      let regionIndex = 0;

      for (let y=0;y<SIZE;y++){
        for (let x=0;x<SIZE;x++){
          if (working[y][x] !== EMPTY || regionId[y][x] !== -1) continue;
          const queue = [[x,y]];
          regionId[y][x] = regionIndex;
          const borders = new Set();
          while(queue.length){
            const [cx,cy] = queue.shift();
            for (const [dx,dy] of neighbors){
              const nx = cx+dx, ny = cy+dy;
              if (!inBounds(nx,ny)) continue;
              const cell = working[ny][nx];
              if (cell === EMPTY){
                if (regionId[ny][nx] === -1){
                  regionId[ny][nx] = regionIndex;
                  queue.push([nx,ny]);
                }
              } else {
                borders.add(cell);
              }
            }
          }
          let owner = 0;
          if (borders.size === 1){
            owner = borders.has(BLACK) ? BLACK : WHITE;
          }
          regionOwner[regionIndex] = owner;
          regionIndex++;
        }
      }

      const captures = { black: 0, white: 0 };
      const visited = Array.from({length: SIZE}, () => Array(SIZE).fill(false));
      for (let y=0;y<SIZE;y++){
        for (let x=0;x<SIZE;x++){
          if (working[y][x] === EMPTY || visited[y][x]) continue;
          const color = working[y][x];
          const stack = [[x,y]];
          const stones = [];
          const libertyRegions = new Set();
          visited[y][x] = true;
          while(stack.length){
            const [cx,cy] = stack.pop();
            stones.push([cx,cy]);
            for (const [dx,dy] of neighbors){
              const nx = cx+dx, ny = cy+dy;
              if (!inBounds(nx,ny)) continue;
              const cell = working[ny][nx];
              if (cell === EMPTY){
                const rid = regionId[ny][nx];
                if (rid !== -1) libertyRegions.add(rid);
              } else if (cell === color && !visited[ny][nx]){
                visited[ny][nx] = true;
                stack.push([nx,ny]);
              }
            }
          }
          let alive = false;
          if (libertyRegions.size === 0){
            alive = false;
          } else {
            for (const rid of libertyRegions){
              const owner = regionOwner[rid];
              if (owner === 0 || owner === color){
                alive = true;
                break;
              }
            }
          }
          if (!alive){
            for (const [sx,sy] of stones){
              working[sy][sx] = EMPTY;
            }
            if (color === BLACK) captures.white += stones.length;
            else captures.black += stones.length;
          }
        }
      }

      return { board: working, captures };
    }

    // expose restart via pause menu if needed
    container.resetGame = reset;

    start();

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({
    id: 'go',
    name: '囲碁', nameKey: 'selection.miniexp.games.go.name',
    description: '配置+1 / 捕獲ボーナス / 勝利EXP', descriptionKey: 'selection.miniexp.games.go.description', categoryIds: ['board'],
    create
  });
})();

(function(){
  const SIZE = 8;
  const EMPTY = 0, BLACK = 1, WHITE = -1; // BLACK=player, WHITE=ai
  const DIRS = [
    [1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]
  ];
  const POSITION_WEIGHTS = [
    [120,-25, 20,  5,  5, 20,-25,120],
    [-25,-40, -5, -5, -5, -5,-40,-25],
    [ 20, -5, 10,  2,  2, 10, -5, 20],
    [  5, -5,  2,  1,  1,  2, -5,  5],
    [  5, -5,  2,  1,  1,  2, -5,  5],
    [ 20, -5, 10,  2,  2, 10, -5, 20],
    [-25,-40, -5, -5, -5, -5,-40,-25],
    [120,-25, 20,  5,  5, 20,-25,120]
  ];
  const HARD_DEPTH = 4;
  const EASY_WEAKNESS_EXPONENT = 5;

  function create(root, awardXp, opts){
    const difficulty = (opts && opts.difficulty)||'NORMAL';
    const bonus = difficulty==='HARD'?600 : difficulty==='NORMAL'?150 : 10;

    const localization = (opts && opts.localization) || (typeof window !== 'undefined' && typeof window.createMiniGameLocalization === 'function'
      ? window.createMiniGameLocalization({ id: 'othello' })
      : null);
    const text = (key, fallback, params) => {
      if (localization && typeof localization.t === 'function') {
        return localization.t(key, fallback, params);
      }
      if (typeof fallback === 'function') return fallback();
      return fallback ?? '';
    };
    const detachLocale = localization && typeof localization.onChange === 'function'
      ? localization.onChange(() => { try { draw(); } catch {} })
      : null;

    const canvas = document.createElement('canvas');
    canvas.width = 480; canvas.height = 480;
    canvas.style.display='block'; canvas.style.margin='0 auto';
    canvas.style.borderRadius = '8px';
    root.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let board = Array.from({length:SIZE},()=>Array(SIZE).fill(EMPTY));
    let turn = BLACK;
    let running = false;
    let ended = false;
    let resultState = { key: null, fallback: '' };
    let lastMove = null; // {x,y,color}
    let hover = null;    // {x,y}
    let anims = [];      // flip animations {x,y,t:0..1,color}
    let rafId=0;

    // init center
    board[3][3]=WHITE; board[4][4]=WHITE; board[3][4]=BLACK; board[4][3]=BLACK;

    function inb(x,y){ return x>=0 && x<SIZE && y>=0 && y<SIZE; }
    function flipsAt(x,y,color, targetBoard=board){
      if (targetBoard[y][x] !== EMPTY) return [];
      const flips = [];
      for (const [dx,dy] of DIRS){
        let cx=x+dx, cy=y+dy; const line=[];
        while(inb(cx,cy) && targetBoard[cy][cx] === -color){ line.push([cx,cy]); cx+=dx; cy+=dy; }
        if (inb(cx,cy) && targetBoard[cy][cx] === color && line.length>0){ flips.push(...line); }
      }
      return flips;
    }
    function legalMoves(color, targetBoard=board){
      const mv=[]; for(let y=0;y<SIZE;y++) for(let x=0;x<SIZE;x++){ const f=flipsAt(x,y,color,targetBoard); if (f.length>0) mv.push({x,y,flips:f}); }
      return mv;
    }

    function applyMoveOnBoard(srcBoard, mv, color){
      const next = srcBoard.map(row=>row.slice());
      next[mv.y][mv.x] = color;
      for (const [fx,fy] of mv.flips){ next[fy][fx] = color; }
      return next;
    }

    function isAdjacentToEmptyCorner(x,y,targetBoard){
      const corners = [[0,0],[0,SIZE-1],[SIZE-1,0],[SIZE-1,SIZE-1]];
      for (const [cx,cy] of corners){
        if (targetBoard[cy][cx] !== EMPTY) continue;
        if (Math.abs(cx-x) <= 1 && Math.abs(cy-y) <= 1 && (cx !== x || cy !== y)){
          return true;
        }
      }
      return false;
    }

    function evaluateMoveNormal(mv){
      let score = mv.flips.length * 1.6;
      score += POSITION_WEIGHTS[mv.y][mv.x];
      if (isAdjacentToEmptyCorner(mv.x, mv.y, board)) score -= 15;
      const simulated = applyMoveOnBoard(board, mv, WHITE);
      const myFollow = legalMoves(WHITE, simulated).length;
      const oppMoves = legalMoves(BLACK, simulated).length;
      score += (myFollow - oppMoves) * 1.2;
      return score;
    }

    function countDiscsOnBoard(targetBoard){
      let white = 0, black = 0, empty = 0;
      for (let y = 0; y < SIZE; y++){
        for (let x = 0; x < SIZE; x++){
          const cell = targetBoard[y][x];
          if (cell === WHITE) white++;
          else if (cell === BLACK) black++;
          else empty++;
        }
      }
      return { white, black, empty };
    }

    function isCorner(x, y){
      return (x === 0 || x === SIZE-1) && (y === 0 || y === SIZE-1);
    }

    function isEdge(x, y){
      return x === 0 || x === SIZE-1 || y === 0 || y === SIZE-1;
    }

    function evaluateMoveSabotage(mv){
      const simulated = applyMoveOnBoard(board, mv, WHITE);
      const counts = countDiscsOnBoard(simulated);
      const oppMoves = legalMoves(BLACK, simulated);
      const myMoves = legalMoves(WHITE, simulated);
      let value = 0;
      if (isCorner(mv.x, mv.y)) value -= 250;
      else if (isEdge(mv.x, mv.y)) value -= 15;
      if (isAdjacentToEmptyCorner(mv.x, mv.y, board)) value += 80;
      const oppCornerChances = oppMoves.filter(m => isCorner(m.x, m.y)).length;
      value += oppCornerChances * 140;
      if (oppMoves.length === 0) value -= 40;
      if (myMoves.length === 0 && oppMoves.length > 0) value += 60;
      value += (oppMoves.length - myMoves.length) * 10;
      value += (counts.black - counts.white) * 6;
      value -= mv.flips.length * 3;
      value += Math.random();
      return value;
    }

    function pickWeakMove(moves, exponent = EASY_WEAKNESS_EXPONENT, options = {}){
      if (moves.length === 0) return null;
      const { randomBlunderChance = 0, preferSecondWhenLimited = false } = options;
      if (randomBlunderChance > 0 && Math.random() < randomBlunderChance){
        return moves[(Math.random()*moves.length)|0];
      }
      if (preferSecondWhenLimited && moves.length <= 2){
        return moves[1 % moves.length];
      }
      const scored = moves.map(mv => ({ mv, value: evaluateMoveNormal(mv) }));
      scored.sort((a,b)=>a.value - b.value);
      const exp = exponent ?? EASY_WEAKNESS_EXPONENT;
      let totalWeight = 0;
      const weights = [];
      for (let i=0;i<scored.length;i++){
        const w = Math.pow(scored.length - i, exp);
        weights.push(w);
        totalWeight += w;
      }
      let r = Math.random() * totalWeight;
      for (let i=0;i<scored.length;i++){
        r -= weights[i];
        if (r <= 0){
          return scored[i].mv;
        }
      }
      return scored[0].mv;
    }

    function evaluateBoard(targetBoard){
      let value = 0;
      let whiteCount = 0, blackCount = 0;
      for (let y=0;y<SIZE;y++) for (let x=0;x<SIZE;x++){
        const cell = targetBoard[y][x];
        if (cell === WHITE){ value += POSITION_WEIGHTS[y][x]; whiteCount++; }
        else if (cell === BLACK){ value -= POSITION_WEIGHTS[y][x]; blackCount++; }
      }
      const mobility = legalMoves(WHITE, targetBoard).length - legalMoves(BLACK, targetBoard).length;
      value += mobility * 5;
      value += (whiteCount - blackCount) * 1.5;
      return value;
    }

    function minimax(targetBoard, depth, isWhiteTurn, alpha, beta){
      if (depth === 0){ return evaluateBoard(targetBoard); }
      const color = isWhiteTurn ? WHITE : BLACK;
      const moves = legalMoves(color, targetBoard);
      if (moves.length === 0){
        const oppMoves = legalMoves(-color, targetBoard);
        if (oppMoves.length === 0) return evaluateBoard(targetBoard);
        return minimax(targetBoard, depth-1, !isWhiteTurn, alpha, beta);
      }
      if (isWhiteTurn){
        let best = -Infinity;
        for (const mv of moves){
          const next = applyMoveOnBoard(targetBoard, mv, WHITE);
          const val = minimax(next, depth-1, false, alpha, beta);
          if (val > best) best = val;
          if (best > alpha) alpha = best;
          if (beta <= alpha) break;
        }
        return best;
      } else {
        let best = Infinity;
        for (const mv of moves){
          const next = applyMoveOnBoard(targetBoard, mv, BLACK);
          const val = minimax(next, depth-1, true, alpha, beta);
          if (val < best) best = val;
          if (best < beta) beta = best;
          if (beta <= alpha) break;
        }
        return best;
      }
    }

    function draw(){
      const w = canvas.width, h=canvas.height; const cs = Math.min(w,h)/SIZE;
      ctx.fillStyle = '#065f46'; ctx.fillRect(0,0,w,h);
      ctx.strokeStyle='#064e3b';
      for(let i=0;i<=SIZE;i++){ ctx.beginPath(); ctx.moveTo(0,i*cs+0.5); ctx.lineTo(w,i*cs+0.5); ctx.stroke(); }
      for(let i=0;i<=SIZE;i++){ ctx.beginPath(); ctx.moveTo(i*cs+0.5,0); ctx.lineTo(i*cs+0.5,h); ctx.stroke(); }
      for(let y=0;y<SIZE;y++) for(let x=0;x<SIZE;x++){
        const v = board[y][x]; if (v===EMPTY) continue;
        ctx.beginPath(); ctx.arc((x+0.5)*cs,(y+0.5)*cs, cs*0.38, 0, Math.PI*2);
        ctx.fillStyle = (v===BLACK)?'#111827':'#e5e7eb';
        ctx.fill(); ctx.strokeStyle='rgba(0,0,0,0.25)'; ctx.stroke();
        // flip animation overlay
        const a = anims.find(a=>a.x===x && a.y===y);
        if (a){
          const prog = a.t; // 0..1
          ctx.save();
          ctx.beginPath(); ctx.arc((x+0.5)*cs,(y+0.5)*cs, cs*0.38, 0, Math.PI*2);
          ctx.clip();
          ctx.fillStyle = a.color===BLACK?'#111827':'#e5e7eb';
          const hh = cs*0.76 * (1 - Math.abs(0.5 - prog)*2); // horizontal band
          ctx.fillRect(x*cs, (y+0.5)*cs - hh/2, cs, hh);
          ctx.restore();
        }
      }
      // turn indicator text
      ctx.fillStyle = '#f8fafc'; ctx.font='16px sans-serif';
      const statusKey = ended ? 'hud.status.ended' : (turn===BLACK ? 'hud.status.playerTurn' : 'hud.status.aiTurn');
      const statusFallback = ended ? 'Game Over' : (turn===BLACK ? 'Your turn (click to place)' : 'AI turn');
      const statusText = text(statusKey, statusFallback);
      ctx.fillText(statusText, 8, 20);
      if (lastMove){ ctx.strokeStyle='rgba(253,224,71,0.9)'; ctx.lineWidth=2; ctx.strokeRect(lastMove.x*cs+3,lastMove.y*cs+3, cs-6, cs-6); }
      // legal move hints
      const hints = legalMoves(turn);
      ctx.fillStyle='rgba(255,255,255,0.35)';
      for(const m of hints){ ctx.beginPath(); ctx.arc((m.x+0.5)*cs,(m.y+0.5)*cs, cs*0.08, 0, Math.PI*2); ctx.fill(); }
      // hover ghost + flip preview rings
      if (hover && hints.find(m=>m.x===hover.x && m.y===hover.y)){
        ctx.beginPath(); ctx.arc((hover.x+0.5)*cs,(hover.y+0.5)*cs, cs*0.36, 0, Math.PI*2);
        ctx.strokeStyle='rgba(255,255,255,0.6)'; ctx.setLineDash([4,4]); ctx.stroke(); ctx.setLineDash([]);
        // flip preview rings on affected stones
        const flips = (turn===BLACK && !ended) ? flipsAt(hover.x, hover.y, BLACK) : [];
        ctx.strokeStyle='rgba(253,224,71,0.9)'; ctx.lineWidth = 2;
        for (const [fx,fy] of flips){
          ctx.beginPath(); ctx.arc((fx+0.5)*cs,(fy+0.5)*cs, cs*0.32, 0, Math.PI*2); ctx.stroke();
        }
      }
      if (ended) {
        ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(0,0,w,h);
        ctx.fillStyle = '#f8fafc'; ctx.font='bold 28px system-ui,sans-serif'; ctx.textAlign='center';
        const overlayText = text(resultState.key || 'overlay.title', resultState.fallback || 'Game Over');
        ctx.fillText(overlayText, w/2, h/2 - 6);
        ctx.font='12px system-ui,sans-serif';
        ctx.fillText(text('overlay.restartHint', 'Press R to restart'), w/2, h/2 + 18);
        ctx.textAlign='start';
      }
    }

    function applyMove(mv, color, isPlayer){
      board[mv.y][mv.x]=color;
      // animation enqueue and logical flip
      for (const [fx,fy] of mv.flips){ board[fy][fx]=color; anims.push({ x:fx, y:fy, t:0, color }); }
      if (isPlayer && mv.flips.length>0){ awardXp(mv.flips.length * 0.5, { type:'flip' }); }
      lastMove = { x: mv.x, y: mv.y, color };
    }

    function score(){
      let b=0,w=0; for(let y=0;y<SIZE;y++) for(let x=0;x<SIZE;x++){ if(board[y][x]===BLACK)b++; else if(board[y][x]===WHITE) w++; }
      return { b, w };
    }

    function endIfNoMoves(){
      const currentMoves = legalMoves(turn);
      if (currentMoves.length>0) { resultState = { key: null, fallback: '' }; return 'turn_has_moves'; }
      const passedColor = turn;
      turn = -turn;
      const nextMoves = legalMoves(turn);
      if (nextMoves.length>0){
        return passedColor === BLACK ? 'player_passed' : 'ai_passed';
      }
      ended = true; running=false;
      const s = score();
      if (s.b > s.w){
        resultState = { key: 'overlay.result.win', fallback: 'You win!' };
        awardXp(bonus, { type:'win' });
      }
      else if (s.b < s.w){
        resultState = { key: 'overlay.result.loss', fallback: 'You lose…' };
      }
      else {
        resultState = { key: 'overlay.result.draw', fallback: 'Draw' };
      }
      draw();
      return 'ended';
    }

    function aiMove(){
      const moves = legalMoves(WHITE);
      if (moves.length===0){
        const state = endIfNoMoves();
        draw();
        if (state === 'player_passed'){
          setTimeout(()=>{ if (!ended) aiMove(); }, 240);
        }
        return;
      }
      let choice = null;
      if (difficulty==='EASY'){
        const sabotage = moves.map(mv => ({ mv, value: evaluateMoveSabotage(mv) }));
        sabotage.sort((a,b)=>b.value - a.value);
        const topValue = sabotage[0]?.value ?? -Infinity;
        const topCandidates = sabotage.filter(s => (topValue - s.value) <= 20);
        if (topCandidates.length>0){
          choice = topCandidates[(Math.random()*topCandidates.length)|0].mv;
        }
        if (!choice){
          choice = sabotage[0]?.mv || pickWeakMove(moves, EASY_WEAKNESS_EXPONENT, { preferSecondWhenLimited: true });
        }
      } else {
        if (difficulty === 'NORMAL'){
          let best = -Infinity;
          for (const m of moves){
            const score = evaluateMoveNormal(m);
            if (score > best){ best = score; choice = m; }
          }
        } else {
          let best = -Infinity;
          let maxDepth = HARD_DEPTH;
          const emptyCount = board.flat().filter(v=>v===EMPTY).length;
          if (emptyCount <= 10) maxDepth = HARD_DEPTH + 1;
          for (const m of moves){
            const next = applyMoveOnBoard(board, m, WHITE);
            const score = minimax(next, maxDepth-1, false, -Infinity, Infinity);
            if (score > best){ best = score; choice = m; }
          }
        }
      }
      applyMove(choice, WHITE, false);
      turn = BLACK;
      const state = endIfNoMoves();
      draw();
      if (state === 'player_passed'){
        setTimeout(()=>{ if (!ended) aiMove(); }, 240);
      }
    }

    let lastHoverKey = '';
    function mousemove(e){
      const rect = canvas.getBoundingClientRect(); const cs = canvas.width/SIZE; const x = Math.floor((e.clientX-rect.left)/cs); const y = Math.floor((e.clientY-rect.top)/cs); hover = {x,y};
      if (turn===BLACK && !ended) {
        const mv = legalMoves(BLACK).find(m=>m.x===x && m.y===y);
        if (mv) {
          const n = mv.flips.length;
          const exp = Math.floor(n * 0.5);
          const cx = (x+0.5)*cs + rect.left - root.getBoundingClientRect().left;
          const cy = (y+0.2)*cs + rect.top - root.getBoundingClientRect().top;
          const key = `${x},${y},${n}`;
          if (key !== lastHoverKey) {
            lastHoverKey = key;
            try {
              if (window.showTransientPopupAt) {
                const previewText = text('popup.movePreview', () => `${n} flips / approx +${exp} EXP`, { flips: n, xp: exp });
                window.showTransientPopupAt(cx, cy, previewText);
              }
            } catch {}
          }
        }
      }
    }
    function click(e){ if (ended || turn!==BLACK) return; const rect = canvas.getBoundingClientRect(); const cs = canvas.width/SIZE; const x = Math.floor((e.clientX-rect.left)/cs); const y = Math.floor((e.clientY-rect.top)/cs); const mv = legalMoves(BLACK).find(m=>m.x===x && m.y===y); if (!mv) return; applyMove(mv, BLACK, true); turn = WHITE; animate(); setTimeout(()=>{ const state = endIfNoMoves(); if (state === 'turn_has_moves') aiMove(); }, 120); }

    function animate(){ cancelAnimationFrame(rafId); const step=()=>{ let done=true; for(const a of anims){ a.t = Math.min(1, a.t + 0.12); if (a.t<1) done=false; } draw(); if(!done) rafId=requestAnimationFrame(step); else anims.length=0; }; rafId=requestAnimationFrame(step); }
    function start(){
      if (!running){
        running=true;
        canvas.addEventListener('click', click);
        canvas.addEventListener('mousemove', mousemove);
        draw();
        const state = endIfNoMoves();
        if (state === 'ended') return;
        if (state === 'player_passed'){
          setTimeout(()=>{ if (!ended) aiMove(); }, 240);
        } else if (turn===WHITE){
          aiMove();
        }
      }
    }
    function stop(){ if (running){ running=false; canvas.removeEventListener('click', click); canvas.removeEventListener('mousemove', mousemove); cancelAnimationFrame(rafId); } }
    function destroy(){ try{ stop(); root && root.removeChild(canvas); }catch{} finally { try { detachLocale && detachLocale(); } catch {} } }
    function getScore(){ const s=score(); return s.b - s.w; }

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({ id:'othello', name:'Othello', nameKey: 'selection.miniexp.games.othello.name', description:'Gain XP from flips with a victory bonus', descriptionKey: 'selection.miniexp.games.othello.description', categoryIds: ['board'], create });
})();

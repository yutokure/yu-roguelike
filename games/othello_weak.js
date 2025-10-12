(function(){
  const GAME_ID = 'othello_weak';
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
  const WEAKNESS_EXPONENT = { EASY: 1.2, NORMAL: 2.4, HARD: 5 };

  function create(root, awardXp, opts){
    const difficulty = (opts && opts.difficulty) || 'NORMAL';
    const bonus = difficulty==='HARD'?600 : difficulty==='NORMAL'?150 : 10;

    const localization = opts?.localization || (typeof window !== 'undefined' && typeof window.createMiniGameLocalization === 'function'
      ? window.createMiniGameLocalization({ id: GAME_ID })
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

    function pickWeakMove(moves, exponent, options = {}){
      if (moves.length === 0) return null;
      const { randomBlunderChance = 0, preferSecondWhenLimited = false } = options;
      if (randomBlunderChance > 0 && Math.random() < randomBlunderChance){
        return moves[(Math.random()*moves.length)|0];
      }
      if (preferSecondWhenLimited && moves.length <= 2){
        return moves[1 % moves.length];
      }
      const scored = moves.map(mv => ({ mv, value: evaluateMoveNormal(mv) }));
      scored.sort((a,b)=>a.value - b.value); // smaller value = worse for AI
      const exp = exponent ?? WEAKNESS_EXPONENT[difficulty] ?? WEAKNESS_EXPONENT.NORMAL;
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

    function draw(){
      const w = canvas.width, h=canvas.height; const cs = Math.min(w,h)/SIZE;
      ctx.fillStyle = '#1d4ed8'; ctx.fillRect(0,0,w,h);
      ctx.strokeStyle='#1e3a8a';
      for(let i=0;i<=SIZE;i++){ ctx.beginPath(); ctx.moveTo(0,i*cs+0.5); ctx.lineTo(w,i*cs+0.5); ctx.stroke(); }
      for(let i=0;i<=SIZE;i++){ ctx.beginPath(); ctx.moveTo(i*cs+0.5,0); ctx.lineTo(i*cs+0.5,h); ctx.stroke(); }
      for(let y=0;y<SIZE;y++) for(let x=0;x<SIZE;x++){
        const v = board[y][x]; if (v===EMPTY) continue;
        ctx.beginPath(); ctx.arc((x+0.5)*cs,(y+0.5)*cs, cs*0.38, 0, Math.PI*2);
        ctx.fillStyle = (v===BLACK)?'#0f172a':'#e2e8f0';
        ctx.fill(); ctx.strokeStyle='rgba(0,0,0,0.25)'; ctx.stroke();
        const a = anims.find(a=>a.x===x && a.y===y);
        if (a){
          const prog = a.t;
          ctx.save();
          ctx.beginPath(); ctx.arc((x+0.5)*cs,(y+0.5)*cs, cs*0.38, 0, Math.PI*2);
          ctx.clip();
          ctx.fillStyle = a.color===BLACK?'#0f172a':'#e2e8f0';
          const hh = cs*0.76 * (1 - Math.abs(0.5 - prog)*2);
          ctx.fillRect(x*cs, (y+0.5)*cs - hh/2, cs, hh);
          ctx.restore();
        }
      }
      ctx.fillStyle = '#f8fafc'; ctx.font='16px sans-serif';
      const statusKey = ended ? 'hud.status.ended' : (turn===BLACK ? 'hud.status.playerTurn' : 'hud.status.aiTurn');
      const statusFallback = ended ? 'Game Over' : (turn===BLACK ? 'Your turn (click to place)' : 'AI turn');
      const statusText = text(statusKey, statusFallback);
      ctx.fillText(statusText, 8, 20);
      const counts = score();
      ctx.fillText(text('hud.discCount', () => `You: ${counts.b} / AI: ${counts.w}`, { player: counts.b, ai: counts.w }), 8, 40);
      ctx.fillText(text('hud.rule', 'Goal: finish with fewer discs'), 8, 60);
      if (lastMove){ ctx.strokeStyle='rgba(253,224,71,0.9)'; ctx.lineWidth=2; ctx.strokeRect(lastMove.x*cs+3,lastMove.y*cs+3, cs-6, cs-6); }
      const hints = legalMoves(turn);
      ctx.fillStyle='rgba(255,255,255,0.35)';
      for(const m of hints){ ctx.beginPath(); ctx.arc((m.x+0.5)*cs,(m.y+0.5)*cs, cs*0.08, 0, Math.PI*2); ctx.fill(); }
      if (hover && hints.find(m=>m.x===hover.x && m.y===hover.y)){
        ctx.beginPath(); ctx.arc((hover.x+0.5)*cs,(hover.y+0.5)*cs, cs*0.36, 0, Math.PI*2);
        ctx.strokeStyle='rgba(255,255,255,0.6)'; ctx.setLineDash([4,4]); ctx.stroke(); ctx.setLineDash([]);
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
        ctx.fillText(overlayText, w/2, h/2 - 28);
        const summaryFallback = () => `You ${counts.b} • AI ${counts.w}`;
        ctx.font='18px system-ui,sans-serif';
        ctx.fillText(text('overlay.summary', summaryFallback, { player: counts.b, ai: counts.w }), w/2, h/2);
        ctx.font='12px system-ui,sans-serif';
        ctx.fillText(text('overlay.restartHint', 'Press R to restart'), w/2, h/2 + 26);
        ctx.textAlign='start';
      }
    }

    function applyMove(mv, color, isPlayer){
      board[mv.y][mv.x]=color;
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
      if (s.b < s.w){
        resultState = { key: 'overlay.result.win', fallback: 'Fewer discs — you win!' };
        awardXp(bonus, { type:'win' });
      }
      else if (s.b > s.w){
        resultState = { key: 'overlay.result.loss', fallback: 'Too many discs — you lose…' };
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
        choice = pickWeakMove(moves, WEAKNESS_EXPONENT.EASY, { randomBlunderChance: 0.3 });
      } else if (difficulty === 'NORMAL'){
        if (moves.length <= 3 && Math.random() < 0.25){
          choice = moves[(Math.random()*moves.length)|0];
        } else {
          choice = pickWeakMove(moves, WEAKNESS_EXPONENT.NORMAL);
        }
      } else {
        const scored = moves.map(mv => ({ mv, value: evaluateMoveNormal(mv) }));
        scored.sort((a,b)=>a.value - b.value);
        const worst = scored[0];
        const consider = scored.slice(0, Math.min(3, scored.length));
        let bestVal = Infinity;
        for (const cand of consider){
          const next = applyMoveOnBoard(board, cand.mv, WHITE);
          const val = minimax(next, HARD_DEPTH-1, false, -Infinity, Infinity);
          if (val < bestVal){
            bestVal = val;
            choice = cand.mv;
          }
        }
        if (!choice) choice = pickWeakMove(moves, WEAKNESS_EXPONENT.HARD, { preferSecondWhenLimited: true }) || worst.mv;
      }
      if (!choice) choice = moves[(Math.random()*moves.length)|0];
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
    function getScore(){ const s=score(); return s.w - s.b; }

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({ id: GAME_ID, name: 'Weakest Othello', nameKey: 'selection.miniexp.games.othello_weak.name', description: 'Win by ending with fewer discs while the AI misplays for you', descriptionKey: 'selection.miniexp.games.othello_weak.description', categoryIds: ['board'], create });
})();

(function(){
  const SIZE = 8;
  const EMPTY = 0, BLACK = 1, WHITE = -1; // BLACK=player, WHITE=ai
  const DIRS = [
    [1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]
  ];

  function create(root, awardXp, opts){
    const difficulty = (opts && opts.difficulty)||'NORMAL';
    const bonus = difficulty==='HARD'?600 : difficulty==='NORMAL'?150 : 10;

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
    let resultText = '';
    let lastMove = null; // {x,y,color}
    let hover = null;    // {x,y}
    let anims = [];      // flip animations {x,y,t:0..1,color}
    let rafId=0;

    // init center
    board[3][3]=WHITE; board[4][4]=WHITE; board[3][4]=BLACK; board[4][3]=BLACK;

    function inb(x,y){ return x>=0 && x<SIZE && y>=0 && y<SIZE; }
    function flipsAt(x,y,color){
      if (board[y][x] !== EMPTY) return [];
      const flips = [];
      for (const [dx,dy] of DIRS){
        let cx=x+dx, cy=y+dy; const line=[];
        while(inb(cx,cy) && board[cy][cx] === -color){ line.push([cx,cy]); cx+=dx; cy+=dy; }
        if (inb(cx,cy) && board[cy][cx] === color && line.length>0){ flips.push(...line); }
      }
      return flips;
    }
    function legalMoves(color){
      const mv=[]; for(let y=0;y<SIZE;y++) for(let x=0;x<SIZE;x++){ const f=flipsAt(x,y,color); if (f.length>0) mv.push({x,y,flips:f}); }
      return mv;
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
      const t = ended? 'ゲーム終了' : (turn===BLACK? 'あなたの番 (クリックで配置)' : 'AIの番');
      ctx.fillText(t, 8, 20);
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
        ctx.fillText(resultText || 'ゲーム終了', w/2, h/2 - 6);
        ctx.font='12px system-ui,sans-serif'; ctx.fillText('Rで再開 / 再起動できます', w/2, h/2 + 18);
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
      const m1 = legalMoves(turn);
      if (m1.length>0) return false;
      // pass
      turn = -turn;
      const m2 = legalMoves(turn);
      if (m2.length>0) return false;
      // both no moves => end
      ended = true; running=false;
      const s = score();
      if (s.b > s.w){ resultText = 'あなたの勝ち！'; awardXp(bonus, { type:'win' }); }
      else if (s.b < s.w){ resultText = 'あなたの負け…'; }
      else { resultText = '引き分け'; }
      draw();
      return true;
    }

    function aiMove(){
      const moves = legalMoves(WHITE);
      if (moves.length===0){ turn = BLACK; endIfNoMoves(); draw(); return; }
      let choice = null;
      if (difficulty==='EASY'){
        choice = moves[(Math.random()*moves.length)|0];
      } else {
        // NORMAL/HARD: greedy + corner weight
        const corner = (x,y)=> ( (x===0||x===SIZE-1) && (y===0||y===SIZE-1) ) ? 5 : 0;
        let best=-1e9;
        for (const m of moves){
          let score = m.flips.length;
          score += corner(m.x,m.y)*2;
          if (difficulty==='HARD'){
            // mobility heuristic: reduce player's next legal moves
            const tmp = cloneBoard(board); applyMove({x:m.x,y:m.y,flips:m.flips}, WHITE, false);
            const opp = legalMoves(BLACK).length; score -= opp*0.2; board = tmp; // revert via clone
          }
          if (score>best){ best=score; choice=m; }
        }
      }
      applyMove(choice, WHITE, false);
      turn = BLACK;
      endIfNoMoves();
      draw();
    }

    function cloneBoard(src){ return src.map(row=>row.slice()); }

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
            try { if (window.showTransientPopupAt) window.showTransientPopupAt(cx, cy, `${n}枚 / 予想+${exp}EXP`); } catch {}
          }
        }
      }
    }
    function click(e){ if (ended || turn!==BLACK) return; const rect = canvas.getBoundingClientRect(); const cs = canvas.width/SIZE; const x = Math.floor((e.clientX-rect.left)/cs); const y = Math.floor((e.clientY-rect.top)/cs); const mv = legalMoves(BLACK).find(m=>m.x===x && m.y===y); if (!mv) return; applyMove(mv, BLACK, true); turn = WHITE; animate(); setTimeout(()=>{ if (!endIfNoMoves()) aiMove(); }, 120); }

    function animate(){ cancelAnimationFrame(rafId); const step=()=>{ let done=true; for(const a of anims){ a.t = Math.min(1, a.t + 0.12); if (a.t<1) done=false; } draw(); if(!done) rafId=requestAnimationFrame(step); else anims.length=0; }; rafId=requestAnimationFrame(step); }
    function start(){ if (!running){ running=true; canvas.addEventListener('click', click); canvas.addEventListener('mousemove', mousemove); draw(); if (endIfNoMoves()) return; if (turn===WHITE) aiMove(); } }
    function stop(){ if (running){ running=false; canvas.removeEventListener('click', click); canvas.removeEventListener('mousemove', mousemove); cancelAnimationFrame(rafId); } }
    function destroy(){ try{ stop(); root && root.removeChild(canvas); }catch{} }
    function getScore(){ const s=score(); return s.b - s.w; }

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({ id:'othello', name:'オセロ', description:'反転×0.5 + 勝利ボーナス', create });
})();

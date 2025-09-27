(function(){
  /** MiniExp: Whack-a-Mole (v0.1.0)
   *  - Click moles quickly to earn EXP
   *  - Timed round, combo bonus for streaks
   */
  function create(root, awardXp, opts){
    const difficulty = (opts && opts.difficulty) || 'NORMAL';
    const shortcuts = opts?.shortcuts;
    const cfg = (
      difficulty==='HARD' ? { rows:3, cols:4, round:45, popMs:[450, 900], comboMs:900 } :
      difficulty==='EASY' ? { rows:3, cols:3, round:45, popMs:[700,1200], comboMs:1200 } :
                            { rows:3, cols:4, round:45, popMs:[550,1000], comboMs:1050 }
    );
    const CELL = 90; const COLS = cfg.cols; const ROWS = cfg.rows;
    const W = COLS*CELL; const H = ROWS*CELL + 30; // scoreboard on top
    const canvas = document.createElement('canvas'); canvas.width=W; canvas.height=H; canvas.style.display='block'; canvas.style.margin='0 auto'; canvas.style.borderRadius='8px'; canvas.style.background='#0b1220';
    root.appendChild(canvas); const ctx = canvas.getContext('2d');

    let running=false, ended=false, raf=0, last=0;
    let timeLeft = cfg.round; // sec
    const holes = []; // grid of holes positions
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){ holes.push({ c, r, x: c*CELL + CELL/2, y: r*CELL + 30 + CELL/2, up:false, ttl:0 }); }
    let score=0, hits=0, clicks=0, combo=0, lastHitAt=0;

    function disableHostRestart(){
      shortcuts?.disableKey('r');
    }

    function enableHostRestart(){
      shortcuts?.enableKey('r');
    }

    function popRandom(){
      const idx = (Math.random()*holes.length)|0; const h = holes[idx]; if(h.up) return; const dur = (cfg.popMs[0] + Math.random()*(cfg.popMs[1]-cfg.popMs[0]))*0.001; h.up = true; h.ttl = dur; }

    function draw(){
      ctx.clearRect(0,0,W,H);
      // HUD
      ctx.fillStyle='#0b1020'; ctx.fillRect(0,0,W,30);
      ctx.fillStyle='#cbd5e1'; ctx.font='bold 14px system-ui,sans-serif'; ctx.fillText(`TIME: ${Math.max(0,Math.ceil(timeLeft))}  HITS: ${hits}  ACC: ${clicks?Math.round(hits/clicks*100):0}%  COMBO:${combo>1?('x'+combo):'-'}`, 8, 20);
      // field
      ctx.fillStyle='#111827'; ctx.fillRect(0,30,W,H-30);
      // holes
      for (const h of holes){
        // hole
        ctx.fillStyle='#1f2937'; ctx.beginPath(); ctx.arc(h.x, h.y+18, CELL*0.36, 0, Math.PI*2); ctx.fill();
        // mole
        if (h.up){ ctx.fillStyle='#a16207'; ctx.beginPath(); ctx.arc(h.x, h.y, CELL*0.28, 0, Math.PI*2); ctx.fill(); ctx.fillStyle='#f8fafc'; ctx.beginPath(); ctx.arc(h.x-8, h.y-6, 4, 0, Math.PI*2); ctx.arc(h.x+8, h.y-6, 4, 0, Math.PI*2); ctx.fill(); }
      }
      if (ended){ ctx.fillStyle='rgba(0,0,0,0.45)'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#f8fafc'; ctx.font='bold 22px system-ui,sans-serif'; ctx.textAlign='center'; ctx.fillText('Time Up', W/2, H/2-6); ctx.font='12px system-ui,sans-serif'; ctx.fillText('Rで再開/再起動', W/2, H/2+16); ctx.textAlign='start'; }
    }

    function step(dt){
      timeLeft -= dt; if (timeLeft<=0){ timeLeft=0; finishGame(); }
      // decay moles, and randomly pop
      for (const h of holes){ if(h.up){ h.ttl-=dt; if(h.ttl<=0){ h.up=false; h.ttl=0; } } }
      if (Math.random() < dt * (2 + holes.filter(h=>!h.up).length*0.03)) popRandom();
    }

    function finishGame(){
      if (!ended){
        ended = true;
        enableHostRestart();
      }
      running = false;
    }

    function hitAt(px, py){
      clicks++;
      for (const h of holes){ if (!h.up) continue; const d = Math.hypot(px - h.x, py - h.y); if (d <= CELL*0.28){ h.up=false; h.ttl=0; hits++; score+=10; const now=performance.now(); combo = (now-lastHitAt<=cfg.comboMs) ? (combo+1) : 1; lastHitAt=now; const gained = Math.max(1, Math.floor(1 + (combo-1)*0.25)); awardXp(gained, { type:'hit', combo }); if(window.showTransientPopupAt) window.showTransientPopupAt(h.x, h.y, `+${gained}`, { variant:'combo', level:combo }); return; } }
      combo=0; // miss
    }

    function onClick(e){ const rect = canvas.getBoundingClientRect(); hitAt(e.clientX-rect.left, e.clientY-rect.top); }
    function onKey(e){ if((e.key==='r'||e.key==='R')&&ended){ e.preventDefault(); reset(); start(); } }

    function loop(ts){ const now=ts*0.001; const dt=Math.min(0.033, now-(last||now)); last=now; if(running){ step(dt); draw(); raf=requestAnimationFrame(loop); } }
    function start(){ if(running) return; running=true; ended=false; disableHostRestart(); last=0; raf=requestAnimationFrame(loop); }
    function stop(opts = {}){ if(!running) return; running=false; cancelAnimationFrame(raf); if(!opts.keepShortcutsDisabled){ enableHostRestart(); } }
    function destroy(){ try{ stop(); canvas.remove(); canvas.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey); }catch{} }
    function getScore(){ return hits*10; }

    function reset(){ timeLeft=cfg.round; ended=false; running=false; last=0; score=0; hits=0; clicks=0; combo=0; holes.forEach(h=>{h.up=false;h.ttl=0;}); disableHostRestart(); draw(); }

    canvas.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey, { passive:false });
    reset();
    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({ id:'whack_a_mole', name:'モグラたたき', description:'命中で1〜EXP／連続命中でボーナス', create });
})();


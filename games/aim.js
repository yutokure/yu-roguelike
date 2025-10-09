(function(){
  /** MiniExp: Aim Trainer (v0.1.0)
   *  - Click targets to earn EXP
   *  - Timed round, combo bonus for quick consecutive hits
   */
  function create(root, awardXp, opts){
    const difficulty = (opts && opts.difficulty) || 'NORMAL';
    const shortcuts = opts?.shortcuts;
    const localization = opts?.localization || (typeof window !== 'undefined' && typeof window.createMiniGameLocalization === 'function'
      ? window.createMiniGameLocalization({ id: 'aim' })
      : null);
    const text = (key, fallback, params) => {
      if (localization && typeof localization.t === 'function') {
        return localization.t(key, fallback, params);
      }
      if (typeof fallback === 'function') return fallback();
      return fallback ?? '';
    };
    const formatInteger = (value) => {
      const numeric = Number.isFinite(value) ? Math.round(value) : 0;
      if (localization && typeof localization.formatNumber === 'function') {
        try {
          return localization.formatNumber(numeric, { maximumFractionDigits: 0 });
        } catch {}
      }
      return String(numeric);
    };
    const cfg = (
      difficulty==='HARD' ? { duration:60, spawn:0.75, minR:10, maxR:20, speed:80, comboMs:900 } :
      difficulty==='EASY' ? { duration:60, spawn:1.4,  minR:18, maxR:30, speed:50, comboMs:1300 } :
                            { duration:60, spawn:1.0,  minR:14, maxR:24, speed:65, comboMs:1100 }
    );
    const W = Math.max(480, Math.min(720, root.clientWidth||600));
    const H = Math.round(W*0.66);
    const canvas = document.createElement('canvas'); canvas.width=W; canvas.height=H; canvas.style.display='block'; canvas.style.margin='0 auto'; canvas.style.borderRadius='8px'; canvas.style.background='#0b1220';
    root.appendChild(canvas); const ctx = canvas.getContext('2d');

    let running=false, ended=false, raf=0, last=0;
    let timeLeft = cfg.duration; // sec
    let targets = []; // {x,y,r,vx,vy,life,ttl}
    let mx=W/2, my=H/2; // cursor
    let clicks=0, hits=0, score=0;
    let lastHitAt = 0; let combo=0; // combo increases when hits within comboMs

    function spawnTarget(){
      const r = cfg.minR + Math.random()*(cfg.maxR-cfg.minR);
      const margin = 24;
      const x = margin + r + Math.random()*(W - margin*2 - r*2);
      const y = margin + r + Math.random()*(H - margin*2 - r*2);
      const ang = Math.random()*Math.PI*2; const sp = cfg.speed * (0.7 + Math.random()*0.6);
      targets.push({ x, y, r, vx: Math.cos(ang)*sp, vy: Math.sin(ang)*sp, ttl: 3.0 + Math.random()*2.0 });
    }

    function updateTargets(dt){
      // spawn probabilistically
      if (Math.random() < dt * cfg.spawn) spawnTarget();
      for (const t of targets){
        t.x += t.vx * dt; t.y += t.vy * dt; t.ttl -= dt;
        // bounce on walls
        if (t.x < t.r){ t.x=t.r; t.vx = Math.abs(t.vx); }
        if (t.x > W-t.r){ t.x=W-t.r; t.vx = -Math.abs(t.vx); }
        if (t.y < t.r){ t.y=t.r; t.vy = Math.abs(t.vy); }
        if (t.y > H-t.r){ t.y=H-t.r; t.vy = -Math.abs(t.vy); }
      }
      targets = targets.filter(t => t.ttl > 0);
    }

    function draw(){
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle='#0b1220'; ctx.fillRect(0,0,W,H);
      // targets
      for (const t of targets){
        const grd = ctx.createRadialGradient(t.x, t.y, t.r*0.2, t.x, t.y, t.r);
        grd.addColorStop(0, '#22d3ee'); grd.addColorStop(1, '#075985');
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, Math.PI*2); ctx.fill();
        // inner ring
        ctx.strokeStyle='rgba(255,255,255,0.4)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(t.x, t.y, t.r*0.6, 0, Math.PI*2); ctx.stroke();
      }
      // UI
      const timeValue = Math.max(0, Math.ceil(timeLeft));
      const hitsValue = hits;
      const accuracyValue = clicks ? Math.round(hits / clicks * 100) : 0;
      const comboValue = combo;
      const timeText = formatInteger(timeValue);
      const hitsText = formatInteger(hitsValue);
      const accuracyText = formatInteger(accuracyValue);
      const comboText = formatInteger(comboValue);
      ctx.fillStyle='#cbd5e1'; ctx.font='bold 14px system-ui,sans-serif';
      ctx.fillText(text('.hud.time', () => `TIME: ${timeText}`, { time: timeText }), 8, 18);
      ctx.fillText(text('.hud.hitsAccuracy', () => `HITS: ${hitsText}  ACC: ${accuracyText}%`, { hits: hitsText, accuracy: accuracyText }), 8, 36);
      if (combo>1){ ctx.fillStyle='#f59e0b'; ctx.fillText(text('.hud.combo', () => `COMBO x${comboText}`, { combo: comboText }), 8, 54); }
      if (ended){
        ctx.fillStyle='rgba(0,0,0,0.45)'; ctx.fillRect(0,0,W,H);
        ctx.fillStyle='#f8fafc'; ctx.font='bold 22px system-ui,sans-serif'; ctx.textAlign='center';
        ctx.fillText(text('.overlay.timeUp', 'Time Up'), W/2, H/2-6);
        ctx.font='12px system-ui,sans-serif'; ctx.fillText(text('.overlay.restartHint', 'Press R to restart'), W/2, H/2+16);
        ctx.textAlign='start';
      }

      // crosshair
      ctx.strokeStyle='rgba(248,250,252,0.9)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(mx-8,my); ctx.lineTo(mx+8,my); ctx.moveTo(mx,my-8); ctx.lineTo(mx,my+8); ctx.stroke();
      ctx.beginPath(); ctx.arc(mx,my,10,0,Math.PI*2); ctx.stroke();
    }

    function tryHit(x, y){
      let hitIndex = -1; let bestDist = 1e9;
      for (let i=0;i<targets.length;i++){
        const t = targets[i]; const d = Math.hypot(x - t.x, y - t.y);
        if (d <= t.r && d < bestDist){ bestDist = d; hitIndex = i; }
      }
      clicks++;
      if (hitIndex >= 0){
        const t = targets[hitIndex];
        targets.splice(hitIndex, 1); hits++; score += 10;
        // accuracy-based EXP: closer to center => more EXP
        const acc = 1 - (bestDist / Math.max(1, t.r)); // 0..1
        const base = acc >= 0.85 ? 3 : acc >= 0.6 ? 2 : 1;
        // combo check
        const now = performance.now();
        if (now - lastHitAt <= cfg.comboMs) combo++; else combo = 1;
        lastHitAt = now;
        const bonus = Math.max(0, combo-1) * 0.25; // +25% per chain
        const gained = Math.max(1, Math.floor(base * (1 + bonus)));
        awardXp(gained, { type:'hit', combo });
        if (window.showTransientPopupAt) window.showTransientPopupAt(x, y, `+${gained}`, { variant:'combo', level: combo });
      } else {
        combo = 0;
      }
    }

    function onMove(e){ const rect = canvas.getBoundingClientRect(); mx = e.clientX - rect.left; my = e.clientY - rect.top; }
    function onClick(e){ const rect = canvas.getBoundingClientRect(); const x = e.clientX - rect.left; const y = e.clientY - rect.top; tryHit(x,y); }
    function onKey(e){ if ((e.key==='r'||e.key==='R') && ended){ e.preventDefault(); reset(); start(); } }

    function disableHostRestart(){
      shortcuts?.disableKey('r');
    }

    function enableHostRestart(){
      shortcuts?.enableKey('r');
    }

    function reset(){
      disableHostRestart();
      timeLeft = cfg.duration; ended=false; running=false; last=0; targets.length=0; hits=0; clicks=0; score=0; combo=0; lastHitAt=0;
      for(let i=0;i<3;i++) spawnTarget();
      draw();
    }

    function step(dt){
      timeLeft -= dt; if (timeLeft<=0){ timeLeft=0; finishGame(); }
      if (!ended) updateTargets(dt);
    }
    function finishGame(){
      if (!ended){
        ended = true;
        enableHostRestart();
      }
      running = false;
    }
    function loop(ts){ const now = ts*0.001; const dt = Math.min(0.033, now-(last||now)); last=now; if(running){ step(dt); draw(); raf=requestAnimationFrame(loop); } }
    function start(){ if(running) return; running=true; ended=false; disableHostRestart(); last=0; raf=requestAnimationFrame(loop); }
    function stop(opts = {}){ if(!running) return; running=false; cancelAnimationFrame(raf); if(!opts.keepShortcutsDisabled){ enableHostRestart(); } }
    const detachLocale = localization && typeof localization.onChange === 'function'
      ? localization.onChange(() => { try { draw(); } catch {} })
      : null;

    function destroy(){
      try{ stop(); canvas.remove(); canvas.removeEventListener('mousemove', onMove); canvas.removeEventListener('mousedown', onClick); document.removeEventListener('keydown', onKey); }catch{}
      try{ detachLocale && detachLocale(); }catch{}
    }
    function getScore(){ return hits*10; }

    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey, { passive:false });
    reset();
    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({ id:'aim', name:'的あて（エイム）', nameKey: 'selection.miniexp.games.aim.name', description:'命中で1〜3EXP／連続命中でボーナス', descriptionKey: 'selection.miniexp.games.aim.description', categoryIds: ['shooting'], create });
})();


(function(){
  /** MiniExp: Simple Dodge Race (v0.2.0, grid-based)
   *  - レーン×行のタイル世界。障害物はティックごとに1セル下降。
   */
  function create(root, awardXp, opts){
    const difficulty = (opts && opts.difficulty) || 'NORMAL';
    const cfg = (
      difficulty==='HARD' ? { tickMs:70,  lanes:5, spawnChance:0.5,  tickXp:0.18, cpTicks:26 } :
      difficulty==='EASY' ? { tickMs:250, lanes:4, spawnChance:0.28, tickXp:0.12, cpTicks:50 } :
                            { tickMs:140, lanes:5, spawnChance:0.38, tickXp:0.15, cpTicks:36 }
    );
    const turboTickXp = { EASY:0.5, NORMAL:1, HARD:2 };
    const checkpointBase = { EASY:5, NORMAL:7, HARD:15 };
    const xpGraceMs = { EASY:0, NORMAL:1000, HARD:2000 };
    const turboMultiplier = 1.5;

    // grid
    const baseW = Math.max(420, Math.min(720, root.clientWidth||600));
    const CELL = 28; const COLS = cfg.lanes; const ROWS = Math.max(14, Math.floor((baseW*0.6)/CELL));
    const W = COLS*CELL; const H = ROWS*CELL;
    const canvas = document.createElement('canvas'); canvas.width=W; canvas.height=H; canvas.style.display='block'; canvas.style.margin='0 auto'; canvas.style.borderRadius='8px'; canvas.style.background='#0b1220';
    root.appendChild(canvas); const ctx = canvas.getContext('2d');

    let running=false, ended=false, raf=0, last=0, acc=0, ticks=0;
    let turboActive=false;
    let xpLockMs = xpGraceMs[difficulty] ?? xpGraceMs.NORMAL;
    const player = { lane: Math.floor(COLS/2), row: ROWS-2 };
    const hazards = []; // { lane:int, row:int }

    function spawnHazard(){ hazards.push({ lane: (Math.random()*COLS)|0, row: 0 }); }

    function draw(){
      ctx.clearRect(0,0,W,H);
      // road lanes
      ctx.fillStyle='#111827'; ctx.fillRect(0,0,W,H);
      ctx.strokeStyle='rgba(148,163,184,0.25)'; ctx.lineWidth=1; for(let i=1;i<COLS;i++){ const x=i*CELL+0.5; ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
      // hazards
      ctx.fillStyle='#f87171'; for(const o of hazards){ ctx.fillRect(o.lane*CELL+4, o.row*CELL+6, CELL-8, CELL-12); }
      // player
      ctx.fillStyle='#22d3ee'; ctx.fillRect(player.lane*CELL+4, player.row*CELL+6, CELL-8, CELL-12);
      if (ended){ ctx.fillStyle='rgba(0,0,0,0.45)'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#f8fafc'; ctx.font='bold 20px system-ui,sans-serif'; ctx.textAlign='center'; ctx.fillText('Crash!', W/2, H/2-6); ctx.font='12px system-ui,sans-serif'; ctx.fillText('Rで再開/再起動', W/2, H/2+16); ctx.textAlign='start'; }
    }

    function tick(dtMs){
      ticks++;
      if (Math.random() < cfg.spawnChance) spawnHazard();
      // move hazards
      for (const o of hazards) o.row += 1;
      // collision
      for (const o of hazards){
        if (o.row === player.row && o.lane === player.lane){
          ended=true; running=false; break;
        }
      }
      // cleanup
      for (let i=hazards.length-1;i>=0;i--) if (hazards[i].row >= ROWS) hazards.splice(i,1);
      // EXP: tiny per tick + checkpoint bonus
      if (xpLockMs > 0){
        xpLockMs = Math.max(0, xpLockMs - dtMs);
      }
      if (xpLockMs <= 0){
        if (turboActive){
          const add = turboTickXp[difficulty] || turboTickXp.NORMAL;
          awardXp(add, { type:'tick', turbo:true });
        } else if (Math.random() < 0.35){
          awardXp(cfg.tickXp, { type:'tick' });
        }
        if (ticks % cfg.cpTicks === 0){
          const base = checkpointBase[difficulty] || checkpointBase.NORMAL;
          const add = turboActive ? base * 2 : base;
          awardXp(add, { type:'checkpoint', turbo:turboActive });
          if (window.showTransientPopupAt) window.showTransientPopupAt(W-80, 30, `+${add}`, { variant:'combo', level: turboActive ? 2 : 1 });
        }
      }
    }

    function loop(ts){
      const now=ts*0.001; const dt=Math.min(0.05, now-(last||now)); last=now;
      if(running){
        acc += dt*1000;
        while(true){
          const tickMs = turboActive ? cfg.tickMs / turboMultiplier : cfg.tickMs;
          if (acc < tickMs) break;
          acc -= tickMs;
          tick(tickMs);
        }
        draw();
        raf=requestAnimationFrame(loop);
      }
    }
    function start(){ if(running) return; running=true; ended=false; last=0; acc=0; raf=requestAnimationFrame(loop); }
    function stop(){ if(!running) return; running=false; cancelAnimationFrame(raf); }
    function destroy(){ try{ stop(); canvas.remove(); document.removeEventListener('keydown', onKeyDown); document.removeEventListener('keyup', onKeyUp); }catch{} }
    function getScore(){ return ticks; }

    function onKeyDown(e){
      const k=e.key;
      if(k==='ArrowLeft'||k==='a'||k==='A'){
        e.preventDefault();
        player.lane=Math.max(0, player.lane-1);
      } else if(k==='ArrowRight'||k==='d'||k==='D'){
        e.preventDefault();
        player.lane=Math.min(COLS-1, player.lane+1);
      } else if((k==='r'||k==='R')&&ended){
        e.preventDefault(); reset(); start();
      } else if(k===' '||k==='Space'||e.code==='Space'){
        e.preventDefault();
        turboActive=true;
      }
    }

    function onKeyUp(e){
      const k=e.key;
      if(k===' '||k==='Space'||e.code==='Space'){
        e.preventDefault();
        turboActive=false;
      }
    }

    function reset(){ hazards.length=0; ticks=0; ended=false; running=false; last=0; acc=0; turboActive=false; xpLockMs = xpGraceMs[difficulty] ?? xpGraceMs.NORMAL; player.lane=Math.floor(COLS/2); player.row=ROWS-2; draw(); }

    document.addEventListener('keydown', onKeyDown, { passive:false });
    document.addEventListener('keyup', onKeyUp, { passive:false });
    reset();
    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({ id:'dodge_race', name:'回避レース', nameKey: 'selection.miniexp.games.dodge_race.name', description:'グリッドで障害回避。距離でEXP', descriptionKey: 'selection.miniexp.games.dodge_race.description', categoryIds: ['action'], create });
})();

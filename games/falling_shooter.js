(function(){
  /** MiniExp: Falling Blocks Shooter (v0.2.0, grid-based)
   *  - すべてタイル単位（LSI風）。自機/弾/ブロックは1ティック=1セル移動。
   */
  function create(root, awardXp, opts){
    const difficulty = (opts && opts.difficulty) || 'NORMAL';
    const cfg = (
      difficulty==='HARD' ? { tickMs:300, bulletSpeed:10, widthScale:0.28, shotCooldownMs:30 } :
      difficulty==='EASY' ? { tickMs:1000, bulletSpeed:10, widthScale:0.38, shotCooldownMs:100 } :
                            { tickMs:500, bulletSpeed:10, widthScale:0.33, shotCooldownMs:50 }
    );

    const allowAutoFire = difficulty==='EASY';
    const bulletSpeed = Math.max(1, cfg.bulletSpeed||1);
    const bulletStepMs = Math.max(16, Math.floor(cfg.tickMs / bulletSpeed));
    const shotCooldownMs = Math.max(0, cfg.shotCooldownMs ?? Math.floor(cfg.tickMs / bulletSpeed));

    // Grid size from container
    const baseW = Math.max(480, Math.min(720, root.clientWidth||600));
    const CELL = 24; // px
    const targetW = Math.max(CELL*4, Math.floor(baseW * (cfg.widthScale||0.33)));
    const COLS = Math.max(4, Math.floor(targetW / CELL));
    const W = COLS*CELL;
    const ROWS = Math.max(14, Math.floor((W*0.75) / CELL));
    const H = ROWS*CELL;
    const canvas = document.createElement('canvas'); canvas.width=W; canvas.height=H; canvas.style.display='block'; canvas.style.margin='0 auto'; canvas.style.borderRadius='8px'; canvas.style.background='#0b1220';
    root.appendChild(canvas); const ctx = canvas.getContext('2d');

    let running=false, ended=false, raf=0, last=0, acc=0, bulletAcc=0;
    let shotCd = 0; // ms
    let fireHeld = false;
    const ship = { x: (COLS/2)|0, y: ROWS-2 };
    const bullets = []; // {x,y}
    const blocks = [];  // {x,y,w,hp,maxHp}

    function spawnRow(){
      const minBlocks = Math.max(1, Math.ceil(COLS * 0.7));
      const maxBlocks = Math.max(minBlocks, Math.floor(COLS * 0.9));
      const count = minBlocks + ((Math.random() * (maxBlocks - minBlocks + 1))|0);
      const lanes = Array.from({ length: COLS }, (_, i) => i);
      for (let i=lanes.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; const tmp=lanes[i]; lanes[i]=lanes[j]; lanes[j]=tmp; }
      for (let i=0;i<count;i++){ const x = lanes[i]; blocks.push({ x, y: 0, w: 1, hp: 1, maxHp: 1 }); }
    }

    function fireBullet(){
      bullets.push({ x: ship.x, y: ship.y-1 });
      shotCd = shotCooldownMs;
    }

    function damageBlockAt(bullet){
      for (const b of blocks){
        if (bullet.y === b.y && bullet.x >= b.x && bullet.x < b.x + b.w){
          bullet.y = -999;
          b.hp -= 1;
          if (b.hp<=0){
            const popX = b.x;
            const popY = b.y;
            b.y = ROWS+999;
            const g = Math.max(1, Math.round(1 + (b.maxHp-1)*0.6));
            awardXp(g, { type:'destroy' });
            if (window.showTransientPopupAt) window.showTransientPopupAt((popX+Math.floor(b.w/2))*CELL+CELL/2, popY*CELL+CELL/2, `+${g}`);
          }
          return true;
        }
      }
      return false;
    }

    function cleanupBullets(){
      for (let i=bullets.length-1;i>=0;i--){ if (bullets[i].y < 0) bullets.splice(i,1); }
    }

    function cleanupBlocks(){
      for (let i=blocks.length-1;i>=0;i--){ const b=blocks[i]; if (b.y >= ROWS || b.hp<=0) blocks.splice(i,1); }
    }

    function stepBullets(){
      if (bullets.length===0) return;
      for (const bu of bullets){
        if (bu.y < 0) continue;
        bu.y -= 1;
        if (bu.y < 0) continue;
        if (damageBlockAt(bu)) continue;
      }
      cleanupBullets();
      cleanupBlocks();
    }

    function draw(){
      ctx.clearRect(0,0,W,H);
      // subtle grid
      ctx.strokeStyle='rgba(148,163,184,0.12)'; ctx.lineWidth=1; ctx.beginPath();
      for(let x=0;x<=COLS;x++){ ctx.moveTo(x*CELL+0.5, 0); ctx.lineTo(x*CELL+0.5, H); }
      for(let y=0;y<=ROWS;y++){ ctx.moveTo(0, y*CELL+0.5); ctx.lineTo(W, y*CELL+0.5); }
      ctx.stroke();
      // blocks
      for (const b of blocks){
        ctx.fillStyle='#f59e0b'; ctx.fillRect(b.x*CELL+2, b.y*CELL+2, b.w*CELL-4, CELL-4);
        // hp bar
        const pct = Math.max(0, Math.min(1, b.hp / (b.maxHp||1)));
        ctx.fillStyle='#111827'; ctx.fillRect(b.x*CELL+2, b.y*CELL+2, b.w*CELL-4, 4);
        ctx.fillStyle='#84cc16'; ctx.fillRect(b.x*CELL+2, b.y*CELL+2, (b.w*CELL-4)*pct, 4);
      }
      // ship
      ctx.fillStyle='#22d3ee'; ctx.fillRect(ship.x*CELL+4, ship.y*CELL+6, CELL-8, CELL-12);
      // bullets
      ctx.fillStyle='#e5e7eb'; for(const bu of bullets){ ctx.fillRect(bu.x*CELL + CELL/2 - 2, bu.y*CELL + 4, 4, CELL-8); }
      // UI
      if (ended){ ctx.fillStyle='rgba(0,0,0,0.45)'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#f8fafc'; ctx.font='bold 20px system-ui,sans-serif'; ctx.textAlign='center'; ctx.fillText('Game Over', W/2, H/2-6); ctx.font='12px system-ui,sans-serif'; ctx.fillText('Rで再開/再起動', W/2, H/2+16); ctx.textAlign='start'; }
    }

    function tick(){
      for (const b of blocks) b.y += 1;

      for (const bu of bullets){
        if (bu.y < 0) continue;
        damageBlockAt(bu);
      }

      cleanupBullets();
      cleanupBlocks();

      for (const b of blocks){
        if (b.y === ship.y && ship.x >= b.x && ship.x < b.x + b.w){ ended=true; running=false; break; }
        if (b.y >= ROWS-1){ ended=true; running=false; break; }
      }

      if (ended){
        fireHeld = false;
        return;
      }

      spawnRow();
    }

    function loop(ts){
      const now = ts*0.001;
      const dt = Math.min(0.05, now-(last||now));
      last = now;
      if(running){
        const dtMs = dt*1000;
        acc += dtMs;
        bulletAcc += dtMs;
        if (shotCd > 0) shotCd = Math.max(0, shotCd - dtMs);
        if (!ended && allowAutoFire && fireHeld && shotCd<=0) fireBullet();
        while(bulletAcc >= bulletStepMs){
          bulletAcc -= bulletStepMs;
          stepBullets();
        }
        while(acc >= cfg.tickMs){
          acc -= cfg.tickMs;
          tick();
        }
        draw();
        raf=requestAnimationFrame(loop);
      }
    }
    function start(){ if(running) return; running=true; ended=false; last=0; acc=0; bulletAcc=0; raf=requestAnimationFrame(loop); }
    function stop(){ if(!running) return; running=false; cancelAnimationFrame(raf); }
    function destroy(){ try{ stop(); canvas.remove(); document.removeEventListener('keydown', onKeyDown); document.removeEventListener('keyup', onKeyUp); }catch{} }
    function getScore(){ return 0; }

    function onKeyDown(e){
      const k=e.key;
      if(k==='ArrowLeft'||k==='a'||k==='A'){
        e.preventDefault();
        ship.x=Math.max(0, ship.x-1);
      } else if(k==='ArrowRight'||k==='d'||k==='D'){
        e.preventDefault();
        ship.x=Math.min(COLS-1, ship.x+1);
      } else if(k===' '||k==='Spacebar'||k==='Space'){
        e.preventDefault();
        fireHeld = allowAutoFire;
        if(shotCd<=0 && !ended) fireBullet();
      } else if((k==='r'||k==='R')&&ended){
        e.preventDefault();
        reset();
        start();
      }
    }

    function onKeyUp(e){ const k=e.key; if(k===' '||k==='Spacebar'||k==='Space') fireHeld=false; }

    function reset(){ bullets.length=0; blocks.length=0; ship.x=(COLS/2)|0; ship.y=ROWS-2; shotCd=0; ended=false; running=false; last=0; acc=0; bulletAcc=0; fireHeld=false; draw(); }

    document.addEventListener('keydown', onKeyDown, { passive:false });
    document.addEventListener('keyup', onKeyUp);
    reset();
    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({ id:'falling_shooter', name:'落下ブロック・シューター', description:'グリッド落下ブロックを射撃してEXP', create });
})();

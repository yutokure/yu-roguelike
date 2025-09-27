(function(){
  /** MiniExp: Invaders-like (v0.1.0) */
  function create(root, awardXp, opts){
    const difficulty = (opts && opts.difficulty) || 'NORMAL';
    const shortcuts = opts?.shortcuts;
    const cfg = (
      difficulty==='HARD' ? { rows:6, cols:11, enemyShot:0.02, speed:1.4, lives:2 } :
      difficulty==='EASY' ? { rows:4, cols:6,  enemyShot:0.00, speed:0.9, lives:3 } :
                            { rows:5, cols:8,  enemyShot:0.01, speed:1.1, lives:3 }
    );
    const W = Math.max(480, Math.min(720, root.clientWidth||600));
    const H = Math.round(W*0.66);
    const canvas = document.createElement('canvas'); canvas.width=W; canvas.height=H; canvas.style.display='block'; canvas.style.margin='0 auto'; canvas.style.borderRadius='6px';
    root.appendChild(canvas); const ctx = canvas.getContext('2d');

    let running=false, ended=false;
    let keys = new Set();
    let raf=0, last=0;
    let lives = cfg.lives;
    let kills = 0, waveClears = 0;
    let player = { x: W/2, y: H-36, w: 28, h: 12, cd: 0 };
    let bullets = []; // {x,y,v}
    let ebullets = []; // {x,y,v}
    let fleet = null;
    let fleetDir = 1; // 1 right, -1 left
    let fleetX = 60, fleetY = 60, fleetVX = 26 * cfg.speed, fleetStepY = 18;

    function disableHostRestart(){
      shortcuts?.disableKey('r');
    }

    function enableHostRestart(){
      shortcuts?.enableKey('r');
    }

    function mkFleet(){
      const a=[]; for(let r=0;r<cfg.rows;r++){ const row=[]; for(let c=0;c<cfg.cols;c++){ row.push({ alive:true }); } a.push(row); }
      fleet = a; fleetX = 60; fleetY = 60; fleetDir = 1;
    }
    mkFleet();

    function draw(){
      ctx.fillStyle='#0b1020'; ctx.fillRect(0,0,W,H);
      // player
      ctx.fillStyle='#22d3ee'; ctx.fillRect(player.x-player.w/2, player.y-player.h/2, player.w, player.h);
      // bullets
      ctx.fillStyle='#e5e7eb'; bullets.forEach(b=>ctx.fillRect(b.x-2,b.y-6,4,6));
      ctx.fillStyle='#fb7185'; ebullets.forEach(b=>ctx.fillRect(b.x-2,b.y,4,6));
      // fleet
      if (fleet){
        for(let r=0;r<cfg.rows;r++){
          for(let c=0;c<cfg.cols;c++){
            const f = fleet[r][c]; if(!f.alive) continue; const x = fleetX + c*34; const y = fleetY + r*26; ctx.fillStyle='#a3e635'; ctx.fillRect(x-10,y-7,20,14);
          }
        }
      }
      // UI
      ctx.fillStyle='#cbd5e1'; ctx.font='14px system-ui,sans-serif'; ctx.fillText(`LIVES:${lives}  KILLS:${kills}  WAVE:${waveClears+1}`, 8, 18);
      if (ended){ ctx.fillStyle='rgba(0,0,0,0.45)'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#f8fafc'; ctx.font='bold 24px system-ui,sans-serif'; ctx.textAlign='center'; ctx.fillText('Game Over', W/2, H/2-6); ctx.font='12px system-ui,sans-serif'; ctx.fillText('Rで再開/再起動', W/2, H/2+16); ctx.textAlign='start'; }
    }

    function anyAlive(){ for(let r=0;r<cfg.rows;r++) for(let c=0;c<cfg.cols;c++) if(fleet[r][c].alive) return true; return false; }
    function fleetBounds(){ let minC=1e9,maxC=-1e9,minR=1e9,maxR=-1e9; for(let r=0;r<cfg.rows;r++) for(let c=0;c<cfg.cols;c++){ if(!fleet[r][c].alive) continue; minC=Math.min(minC,c); maxC=Math.max(maxC,c); minR=Math.min(minR,r); maxR=Math.max(maxR,r);} if(maxC<0) return null; return { minC,maxC,minR,maxR }; }

    function step(dt){
      // input
      const spd = 200; if(keys.has('ArrowLeft')) player.x-=spd*dt; if(keys.has('ArrowRight')) player.x+=spd*dt; player.x=Math.max(20,Math.min(W-20,player.x));
      player.cd = Math.max(0, player.cd - dt);
      if(keys.has(' ') && player.cd<=0){ bullets.push({ x:player.x, y:player.y-10, v:-360 }); player.cd = 0.22; }

      // bullets move
      bullets.forEach(b=>b.y += b.v*dt); bullets = bullets.filter(b=>b.y>-20);
      ebullets.forEach(b=>b.y += b.v*dt); ebullets = ebullets.filter(b=>b.y<H+20);

      // fleet move
      const b = fleetBounds(); if (b){
        const left = fleetX + b.minC*34 - 14; const right = fleetX + b.maxC*34 + 14;
        fleetX += fleetDir * fleetVX * dt;
        if (right >= W-20 && fleetDir>0) { fleetDir=-1; fleetY += fleetStepY; }
        if (left <= 20 && fleetDir<0) { fleetDir=1; fleetY += fleetStepY; }
        if (fleetY + b.maxR*26 + 10 >= player.y-10) { // reached bottom
          lives=0; finishGame(); }
      }

      // enemy fire
      if (!ended && Math.random()<cfg.enemyShot){ // choose random alive in bottom-most columns
        const shooters=[]; for(let c=0;c<cfg.cols;c++){ for(let r=cfg.rows-1;r>=0;r--){ if(fleet[r][c].alive){ shooters.push({r,c}); break; } } }
        if (shooters.length){ const s=shooters[(Math.random()*shooters.length)|0]; const x=fleetX + s.c*34; const y=fleetY + s.r*26 + 8; ebullets.push({x,y,v:180+60*Math.random()}); }
      }

      // collisions: player bullets vs enemies
      for (const b of bullets){ for(let r=0;r<cfg.rows;r++) for(let c=0;c<cfg.cols;c++){ const f=fleet[r][c]; if(!f.alive) continue; const x=fleetX + c*34, y=fleetY + r*26; if (Math.abs(b.x-x)<13 && Math.abs(b.y-y)<10){ f.alive=false; b.y=-9999; kills++; awardXp(1, { type:'kill' }); } } }
      bullets = bullets.filter(b=>b.y>-900);

      // collisions: enemy bullets vs player
      for (const eb of ebullets){ if (Math.abs(eb.x - player.x) < (player.w/2) && Math.abs(eb.y - player.y) < (player.h/2)) { eb.y=H+999; lives--; if(lives<=0){ finishGame(); } } }
      ebullets = ebullets.filter(b=>b.y<H+800);

      // wave clear
      if (!ended && !anyAlive()){
        waveClears++; awardXp(50, { type:'wave-clear' }); mkFleet(); // speed up slightly
        fleetVX *= 1.05; if (player.cd>0.12) player.cd *= 0.96;
      }
    }

    function finishGame(){
      if (!ended){
        ended = true;
        enableHostRestart();
      }
      running = false;
    }

    function loop(t){ const now=t*0.001; const dt=Math.min(0.033, now-(last||now)); last=now; if(running){ step(dt); draw(); raf=requestAnimationFrame(loop); } }
    function start(){ if(running) return; running=true; ended=false; disableHostRestart(); last=0; raf=requestAnimationFrame(loop); }
    function stop(opts = {}){ if(!running) return; running=false; cancelAnimationFrame(raf); if(!opts.keepShortcutsDisabled){ enableHostRestart(); } }
    function destroy(){ try{ stop(); canvas.remove(); document.removeEventListener('keydown', onKeyDown); document.removeEventListener('keyup', onKeyUp); }catch{} }
    function onKeyDown(e){ if(e.code==='ArrowLeft'||e.code==='ArrowRight'||e.code==='Space'){ e.preventDefault(); } keys.add(e.code==='Space'?' ':e.code); if((e.key==='r'||e.key==='R') && !running) { // restart
        kills=0; waveClears=0; lives=cfg.lives; bullets.length=0; ebullets.length=0; mkFleet(); ended=false; start(); }
    }
    function onKeyUp(e){ keys.delete(e.code==='Space'?' ':e.code); }

    document.addEventListener('keydown', onKeyDown, { passive:false });
    document.addEventListener('keyup', onKeyUp, { passive:false });

    function getScore(){ return kills + waveClears*50; }
    draw();
    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({ id:'invaders', name:'インベーダー風', description:'撃破+1/全滅+50', create });
})();


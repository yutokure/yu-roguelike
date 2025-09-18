(function(){
  /** MiniExp: River Crossing (Frogger-like, v0.2.0, grid-based)
   *  - Grid movement only（LSI風ブロック表現）
   *  - 川の丸太は1ティックごとに1セル移動。カエルも1セルずつ移動。
   *  - 上へ1段で+1EXP、最上段到達で+50EXP
   */
  function create(root, awardXp, opts){
    const difficulty = (opts && opts.difficulty) || 'NORMAL';
    const cfg = (
      difficulty==='HARD' ? { rows:11, cols:15, baseTickMs:200, lanes:7, lives:3 } :
      difficulty==='EASY' ? { rows:9,  cols:13, baseTickMs:300, lanes:5, lives:4 } :
                            { rows:10, cols:14, baseTickMs:240, lanes:6, lives:3 }
    );
    const CELL = 28;
    const COLS = cfg.cols; const ROWS = cfg.rows;
    const W = COLS*CELL; const H = ROWS*CELL;
    const canvas = document.createElement('canvas'); canvas.width=W; canvas.height=H; canvas.style.display='block'; canvas.style.margin='0 auto'; canvas.style.borderRadius='8px'; canvas.style.background='#0b1220';
    root.appendChild(canvas); const ctx = canvas.getContext('2d');

    let running=false, ended=false, raf=0, last=0;
    let lives = cfg.lives; let score = 0;
    const startPos = { x: Math.floor(COLS/2), y: ROWS-1 };
    let frog = { x: startPos.x, y: startPos.y };
    // water lanes from y=1..ROWS-2（y=0=goal, y=ROWS-1=start は陸）
    const lanes = [];
    for (let y=1; y<ROWS-1; y++){
      const dir = (y%2===0) ? 1 : -1; // 交互に流れ方向を変える
      const count = 2 + ((Math.random()*2)|0);
      const periodMs = Math.round(cfg.baseTickMs * (0.9 + (y/ROWS)*0.6)); // 上段ほど速め
      const logs = [];
      for (let i=0;i<count;i++){
        const len = 2 + ((Math.random()*3)|0);  // 2..4セル
        const start = (i * Math.ceil(COLS/count) + ((Math.random()*3)|0)) % COLS;
        logs.push({ x: start, len });
      }
      lanes.push({ dir, periodMs, timer: 0, logs });
    }

    function draw(){
      ctx.clearRect(0,0,W,H);
      // rows
      for(let y=0;y<ROWS;y++){
        if (y===0){ ctx.fillStyle='#064e3b'; }
        else if (y===ROWS-1){ ctx.fillStyle='#14532d'; }
        else { ctx.fillStyle='#0ea5e9'; }
        ctx.fillRect(0,y*CELL, W, CELL);
      }
      // logs
      ctx.fillStyle='#f59e0b';
      for(let y=1;y<ROWS-1;y++){
        const lane = lanes[y-1];
        for (const log of lane.logs){
          const px = ((log.x%COLS)+COLS)%COLS; // wrap
          const w = log.len*CELL;
          // piecewise draw to handle wrap visually
          const left = px*CELL;
          const right = left + w;
          if (right <= W) ctx.fillRect(left, y*CELL+4, w, CELL-8);
          else { const first = W-left; ctx.fillRect(left, y*CELL+4, first, CELL-8); ctx.fillRect(0, y*CELL+4, w-first, CELL-8); }
        }
      }
      // frog
      ctx.fillStyle='#22c55e'; ctx.fillRect(frog.x*CELL+6, frog.y*CELL+6, CELL-12, CELL-12);
      // UI
      ctx.fillStyle='#cbd5e1'; ctx.font='bold 14px system-ui,sans-serif'; ctx.fillText(`LIVES:${lives}`, 8, 18);
      if (ended){ ctx.fillStyle='rgba(0,0,0,0.45)'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#f8fafc'; ctx.font='bold 22px system-ui,sans-serif'; ctx.textAlign='center'; ctx.fillText('Game Over', W/2, H/2-6); ctx.font='12px system-ui,sans-serif'; ctx.fillText('Rで再開/再起動', W/2, H/2+16); ctx.textAlign='start'; }
    }

    function move(dx, dy){
      if (ended) return;
      const nx = clamp(0, COLS-1, frog.x + dx);
      const ny = clamp(0, ROWS-1, frog.y + dy);
      if (ny !== frog.y){
        const delta = frog.y - ny; // moving up => positive
        if (delta>0) { awardXp(1, { type:'step' }); if (window.showTransientPopupAt) window.showTransientPopupAt(frog.x*CELL+CELL/2, ny*CELL+CELL/2, `+1`); }
      }
      frog.x = nx; frog.y = ny;
      // reached top
      if (frog.y === 0){ awardXp(50, { type:'goal' }); resetFrog(true); }
    }

    function clamp(a,b,v){ return Math.max(a, Math.min(b, v)); }

    function isOnLogAt(rowY, x){
      if (rowY<=0 || rowY>=ROWS-1) return true; // 陸扱い
      const lane = lanes[rowY-1];
      for (const log of lane.logs){
        const base = ((log.x % COLS) + COLS) % COLS;
        for (let i=0;i<log.len;i++) if (((base+i)%COLS) === x) return true;
      }
      return false;
    }

    function tickLane(rowY, lane){
      const frogOnThisLane = (frog.y === rowY);
      const wasOn = frogOnThisLane ? isOnLogAt(rowY, frog.x) : false;
      // move logs 1セル
      for (const log of lane.logs){ log.x = (log.x + lane.dir + COLS) % COLS; }
      if (!frogOnThisLane) return;
      if (wasOn){
        // 丸太に乗っていたら一緒に1セル流される
        frog.x = (frog.x + lane.dir + COLS) % COLS;
        return; // 乗っているので安全
      }
      // 乗っていなかった場合、移動後に下に丸太が来ていれば助かる
      if (!isOnLogAt(rowY, frog.x)) loseLife();
    }

    function step(dt){
      // 各レーンは固有のティック周期で1セルずつ移動
      const ms = dt * 1000;
      for (let y=1; y<ROWS-1; y++){
        const lane = lanes[y-1];
        lane.timer += ms;
        while (lane.timer >= lane.periodMs){
          lane.timer -= lane.periodMs;
          tickLane(y, lane);
          if (ended) return; // Game Over で中断
        }
      }
    }

    function loseLife(){ lives--; if (lives<=0){ ended=true; running=false; } resetFrog(); }
    function resetFrog(){ frog.x = startPos.x; frog.y = startPos.y; }

    function loop(ts){ const now=ts*0.001; const dt=Math.min(0.033, now-(last||now)); last=now; if(running){ step(dt); draw(); raf=requestAnimationFrame(loop); } }
    function start(){ if(running) return; running=true; ended=false; last=0; raf=requestAnimationFrame(loop); }
    function stop(){ if(!running) return; running=false; cancelAnimationFrame(raf); }
    function destroy(){ try{ stop(); canvas.remove(); document.removeEventListener('keydown', onKey); }catch{} }
    function getScore(){ return Math.max(0, (cfg.rows-1) - frog.y); }

    function onKey(e){ const k=e.key; if(k==='ArrowUp'||k==='w'||k==='W'){ e.preventDefault(); move(0,-1); } else if(k==='ArrowDown'||k==='s'||k==='S'){ e.preventDefault(); move(0,1); } else if(k==='ArrowLeft'||k==='a'||k==='A'){ e.preventDefault(); move(-1,0); } else if(k==='ArrowRight'||k==='d'||k==='D'){ e.preventDefault(); move(1,0); } else if((k==='r'||k==='R')&&ended){ e.preventDefault(); resetGame(); start(); } }

    function resetGame(){ lives=cfg.lives; frog={x:startPos.x,y:startPos.y}; ended=false; running=false; last=0; // レーンのタイマーも初期化
      for (const lane of lanes){ lane.timer = 0; }
      draw(); }

    document.addEventListener('keydown', onKey, { passive:false });
    resetGame();
    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({ id:'river_crossing', name:'川渡り', description:'上段到達+50／1段前進ごとに+1', create });
})();

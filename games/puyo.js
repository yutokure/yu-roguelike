(function(){
  /** MiniExp: Falling Puyos (ぷよぷよ風) */
  function create(root, awardXp, opts){
    const difficulty = (opts && opts.difficulty) || 'NORMAL';
    const config = {
      EASY:  { fall: 0.8, colors: 3 },
      NORMAL:{ fall: 0.6, colors: 4 },
      HARD:  { fall: 0.4, colors: 5 },
    }[difficulty] || { fall: 0.6, colors: 4 };

    const COLS = 6;
    const ROWS = 12;
    const LOCK_DELAY = 0.5;
    const COLORS = ['#ef4444','#38bdf8','#a855f7','#facc15','#22c55e'];
    const ORIENT = [ [0,-1], [1,0], [0,1], [-1,0] ]; // child offset relative to pivot

    const canvas = document.createElement('canvas');
    const W = Math.max(360, Math.min(520, root.clientWidth || 420));
    const H = Math.max(480, Math.min(620, root.clientHeight || 540));
    canvas.width = W;
    canvas.height = H;
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    canvas.style.borderRadius = '10px';
    canvas.style.background = '#020617';
    canvas.style.boxShadow = '0 12px 28px rgba(8,15,30,0.5)';
    root.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let grid = Array.from({length: ROWS}, () => Array(COLS).fill(null));
    let current = null;
    let nextQueue = [];
    let fallTimer = 0;
    let lockTimer = 0;
    let running = false;
    let ended = false;
    let raf = 0;
    let lastTime = 0;
    let softDropHold = false;
    let totalCleared = 0;
    let maxChain = 0;
    let lastChainCleared = 0;

    function randColor(){ return Math.floor(Math.random() * config.colors); }

    function makePair(){ return [ randColor(), randColor() ]; }

    function refillQueue(){ while(nextQueue.length < 3){ nextQueue.push(makePair()); } }

    function collides(px, py, dir){
      if (!current) return false;
      const [odx, ody] = ORIENT[dir];
      const cells = [ [px, py], [px + odx, py + ody] ];
      for (const [cx, cy] of cells){
        if (cx < 0 || cx >= COLS || cy >= ROWS) return true;
        if (cy >= 0 && grid[cy][cx] != null) return true;
      }
      return false;
    }

    function spawn(){
      refillQueue();
      const colors = nextQueue.shift();
      current = { x: Math.floor(COLS/2), y: -1, dir: 2, colors: colors.slice() };
      refillQueue();
      fallTimer = 0;
      lockTimer = 0;
      if (collides(current.x, current.y, current.dir)){
        current.y -= 1;
        if (collides(current.x, current.y, current.dir)){
          gameOver();
        }
      }
    }

    function forEachCurrent(cb){
      if (!current) return;
      const [odx, ody] = ORIENT[current.dir];
      const cells = [ { x: current.x, y: current.y, color: current.colors[0] },
                      { x: current.x + odx, y: current.y + ody, color: current.colors[1] } ];
      cells.forEach(cb);
    }

    function move(dx){
      if (!current || ended) return;
      const nx = current.x + dx;
      if (!collides(nx, current.y, current.dir)){
        current.x = nx;
        if (!collides(current.x, current.y + 1, current.dir)) lockTimer = 0;
      }
    }

    function rotate(dirDelta){
      if (!current || ended) return;
      const ndir = (current.dir + dirDelta + 4) % 4;
      const kicks = [ [0,0], [1,0], [-1,0], [0,-1], [1,-1], [-1,-1] ];
      for (const [kx, ky] of kicks){
        if (!collides(current.x + kx, current.y + ky, ndir)){
          current.x += kx;
          current.y += ky;
          current.dir = ndir;
          if (!collides(current.x, current.y + 1, current.dir)) lockTimer = 0;
          return;
        }
      }
    }

    function moveDown(fromSoft){
      if (!current || ended) return false;
      if (!collides(current.x, current.y + 1, current.dir)){
        current.y += 1;
        if (fromSoft && awardXp) awardXp(0.05, { type:'softdrop' });
        return true;
      }
      return false;
    }

    function hardDrop(){
      if (!current || ended) return;
      let dist = 0;
      while(!collides(current.x, current.y + 1, current.dir)){
        current.y += 1;
        dist++;
      }
      if (dist > 0 && awardXp) awardXp(dist * 0.1, { type:'harddrop' });
      lockPiece();
    }

    function placeCurrent(){
      if (!current) return;
      forEachCurrent(cell => {
        if (cell.y >= 0){ grid[cell.y][cell.x] = cell.color; }
      });
    }

    function lockPiece(){
      placeCurrent();
      current = null;
      fallTimer = 0;
      lockTimer = 0;
      const cleared = resolveMatches();
      lastChainCleared = cleared.lastCleared;
      if (!ended){
        spawn();
      }
    }

    function resolveMatches(){
      let chain = 0;
      let lastCleared = 0;
      while(true){
        const visited = Array.from({length: ROWS}, () => Array(COLS).fill(false));
        const toClear = [];
        for (let y=0;y<ROWS;y++){
          for (let x=0;x<COLS;x++){
            const color = grid[y][x];
            if (color == null || visited[y][x]) continue;
            const cluster = [];
            const stack = [[x,y]];
            visited[y][x] = true;
            while(stack.length){
              const [cx,cy] = stack.pop();
              cluster.push([cx,cy]);
              const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
              for(const [dx,dy] of dirs){
                const nx = cx + dx, ny = cy + dy;
                if (nx<0||nx>=COLS||ny<0||ny>=ROWS) continue;
                if (!visited[ny][nx] && grid[ny][nx] === color){
                  visited[ny][nx] = true;
                  stack.push([nx,ny]);
                }
              }
            }
            if (cluster.length >= 4){
              toClear.push({ color, cells: cluster });
            }
          }
        }
        if (!toClear.length) break;
        chain++;
        let removed = 0;
        toClear.forEach(group => {
          group.cells.forEach(([cx,cy]) => {
            if (grid[cy][cx] != null){
              grid[cy][cx] = null;
              removed++;
            }
          });
        });
        lastCleared = removed;
        totalCleared += removed;
        const base = removed * 0.5;
        const mult = 1 + (chain - 1) * 0.5;
        if (awardXp) awardXp(base * mult, { type:'clear', chain, removed });
        if (chain >= 2) showChainBadge(chain);
        if (chain > maxChain) maxChain = chain;
        applyGravity();
      }
      return { chain, lastCleared };
    }

    function applyGravity(){
      for (let x=0;x<COLS;x++){
        let write = ROWS - 1;
        for (let y=ROWS-1;y>=0;y--){
          const color = grid[y][x];
          if (color != null){
            if (write !== y){
              grid[write][x] = color;
              grid[y][x] = null;
            }
            write--;
          }
        }
        for (let y=write;y>=0;y--){ grid[y][x] = null; }
      }
    }

    function isGrounded(){
      return current ? collides(current.x, current.y + 1, current.dir) : false;
    }

    function step(dt){
      if (!current || ended) return;
      fallTimer += dt;
      const interval = config.fall / (softDropHold ? 4 : 1);
      while (fallTimer >= interval){
        fallTimer -= interval;
        if (!moveDown(softDropHold)){
          fallTimer = 0;
          break;
        }
      }
      if (isGrounded()){
        lockTimer += dt;
        if (lockTimer >= LOCK_DELAY){
          lockTimer = 0;
          lockPiece();
        }
      } else {
        lockTimer = 0;
      }
    }

    function draw(){
      ctx.fillStyle = '#0b1120';
      ctx.fillRect(0,0,W,H);
      const margin = 24;
      const baseCell = Math.floor((W - margin*2 - 140) / COLS);
      const cell = Math.max(12, Math.floor(baseCell * 0.5));
      const gridW = cell * COLS;
      const gridH = cell * ROWS;
      const ox = margin;
      const oy = 40;
      ctx.strokeStyle = 'rgba(148,163,184,0.18)';
      ctx.lineWidth = 1;
      for (let y=0;y<=ROWS;y++){
        ctx.beginPath();
        ctx.moveTo(ox+0.5, oy + y*cell + 0.5);
        ctx.lineTo(ox + gridW - 0.5, oy + y*cell + 0.5);
        ctx.stroke();
      }
      for (let x=0;x<=COLS;x++){
        ctx.beginPath();
        ctx.moveTo(ox + x*cell + 0.5, oy + 0.5);
        ctx.lineTo(ox + x*cell + 0.5, oy + gridH - 0.5);
        ctx.stroke();
      }
      for (let y=0;y<ROWS;y++){
        for (let x=0;x<COLS;x++){
          const color = grid[y][x];
          if (color == null) continue;
          drawBlob(ox + x*cell, oy + y*cell, cell, COLORS[color]);
        }
      }
      if (current){
        forEachCurrent(({x,y,color}) => {
          if (y < 0) return;
          drawBlob(ox + x*cell, oy + y*cell, cell, COLORS[color]);
        });
      }
      // preview panel
      const panelX = ox + gridW + 24;
      const panelY = oy;
      const panelW = Math.max(120, W - panelX - margin);
      ctx.fillStyle = '#cbd5f5';
      ctx.font = '14px "Segoe UI", system-ui, sans-serif';
      ctx.fillText(`難易度: ${difficulty}`, margin, 24);
      ctx.fillText(`消去数: ${totalCleared}`, margin, 44);
      ctx.fillText(`最大連鎖: ${maxChain}`, margin, 64);
      if (lastChainCleared > 0){
        ctx.fillText(`直近消去: ${lastChainCleared}`, margin, 84);
      }
      ctx.fillStyle = 'rgba(148,163,184,0.2)';
      ctx.fillRect(panelX, panelY, panelW, gridH);
      ctx.strokeStyle = 'rgba(148,163,184,0.35)';
      ctx.strokeRect(panelX+0.5, panelY+0.5, panelW-1, gridH-1);
      ctx.fillStyle = '#cbd5f5';
      ctx.font = '13px "Segoe UI", system-ui, sans-serif';
      ctx.fillText('NEXT', panelX + 16, panelY + 20);
      let previewY = panelY + 44;
      const previewCell = Math.max(12, Math.floor((panelW - 40) / 3));
      nextQueue.forEach((pair, idx) => {
        if (idx >= 3) return;
        const baseX = panelX + 32;
        const baseY = previewY + idx * (previewCell*2 + 12);
        drawBlob(baseX, baseY, previewCell, COLORS[pair[0]]);
        drawBlob(baseX, baseY + previewCell, previewCell, COLORS[pair[1]]);
      });

      if (ended){
        ctx.fillStyle = 'rgba(2,6,14,0.65)';
        ctx.fillRect(0,0,W,H);
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 28px "Segoe UI", system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', W/2, H/2 - 10);
        ctx.font = '14px "Segoe UI", system-ui';
        ctx.fillText('Rで再開 / 再挑戦', W/2, H/2 + 18);
        ctx.textAlign = 'start';
      }
    }

    function drawBlob(px, py, size, color){
      const r = Math.floor(size * 0.18);
      ctx.fillStyle = color;
      if (ctx.roundRect){
        ctx.beginPath();
        ctx.roundRect(px + 2, py + 2, size - 4, size - 4, r);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.beginPath();
        ctx.roundRect(px + 4, py + 4, size * 0.4, size * 0.4, r);
        ctx.fill();
      } else {
        ctx.fillRect(px + 2, py + 2, size - 4, size - 4);
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.fillRect(px + 4, py + 4, size * 0.4, size * 0.4);
      }
    }

    function showChainBadge(chain){
      try{
        if (window && window.showMiniExpBadge){
          window.showMiniExpBadge(`${chain}連鎖!`, { variant:'combo', level: chain });
        }
      }catch{}
    }

    function gameOver(){
      ended = true;
      running = false;
      cancelLoop();
      draw();
    }

    function reset(){
      grid = Array.from({length: ROWS}, () => Array(COLS).fill(null));
      nextQueue = [];
      current = null;
      fallTimer = 0;
      lockTimer = 0;
      totalCleared = 0;
      maxChain = 0;
      lastChainCleared = 0;
      ended = false;
      refillQueue();
      spawn();
      draw();
    }

    function loop(ts){
      if (!running){ return; }
      if (!lastTime) lastTime = ts;
      const dt = Math.min(0.12, (ts - lastTime) / 1000);
      lastTime = ts;
      step(dt);
      draw();
      raf = requestAnimationFrame(loop);
    }

    function start(){
      if (running) return;
      running = true;
      ended = false;
      lastTime = 0;
      raf = requestAnimationFrame(loop);
    }

    function stop(){
      if (!running) return;
      running = false;
      cancelLoop();
    }

    function cancelLoop(){
      if (raf){ cancelAnimationFrame(raf); raf = 0; }
    }

    function keydown(e){
      if (ended) {
        if (e.code === 'KeyR'){ e.preventDefault(); reset(); start(); }
        return;
      }
      if (['ArrowLeft','ArrowRight','ArrowDown','ArrowUp','Space','KeyZ','KeyX','KeyR'].includes(e.code)) e.preventDefault();
      if (!current) return;
      if (e.code === 'ArrowLeft') move(-1);
      else if (e.code === 'ArrowRight') move(1);
      else if (e.code === 'ArrowDown'){ softDropHold = true; moveDown(true); }
      else if (e.code === 'KeyZ') rotate(-1);
      else if (e.code === 'KeyX') rotate(1);
      else if (e.code === 'ArrowUp' || e.code === 'Space') hardDrop();
      else if (e.code === 'KeyR'){ reset(); }
    }

    function keyup(e){
      if (e.code === 'ArrowDown') softDropHold = false;
    }

    function blur(){ softDropHold = false; }

    window.addEventListener('keydown', keydown, { passive:false });
    window.addEventListener('keyup', keyup);
    window.addEventListener('blur', blur);

    reset();
    start();

    function destroy(){
      stop();
      window.removeEventListener('keydown', keydown);
      window.removeEventListener('keyup', keyup);
      window.removeEventListener('blur', blur);
      try { root && root.removeChild(canvas); } catch{}
    }

    function getScore(){ return { cleared: totalCleared, maxChain }; }

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({
    id: 'falling_puyos',
    name: 'ぷよぷよ風',
    description: '4つ以上で消去＆連鎖でボーナス',
    version: '0.1.0',
    category: 'パズル',
    create
  });
})();

(function(){
  /** MiniExp: Tetris-like (v0.1.0) */
  function create(root, awardXp, opts){
    const difficulty = (opts && opts.difficulty) || 'NORMAL';
    const shortcuts = opts?.shortcuts;
    const COLS=10, ROWS=20; const W = Math.max(320, Math.min(480, root.clientWidth||480)), H = Math.round(W + 40);
    const canvas=document.createElement('canvas'); canvas.width=W; canvas.height=H; canvas.style.display='block'; canvas.style.margin='0 auto'; canvas.style.borderRadius='6px'; root.appendChild(canvas); const ctx=canvas.getContext('2d');

    const shapes = {
      I: [[1,1,1,1]],
      O: [[1,1],[1,1]],
      T: [[0,1,0],[1,1,1]],
      S: [[0,1,1],[1,1,0]],
      Z: [[1,1,0],[0,1,1]],
      J: [[1,0,0],[1,1,1]],
      L: [[0,0,1],[1,1,1]],
    };
    const bagKeys = ['I','O','T','S','Z','J','L'];
    const colors = { I:'#67e8f9', O:'#fde68a', T:'#c4b5fd', S:'#86efac', Z:'#fca5a5', J:'#93c5fd', L:'#fcd34d' };

    let grid = Array.from({length:ROWS},()=>Array(COLS).fill(null));
    let bag=[]; function refillBag(){ bag = bagKeys.slice(); for(let i=bag.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [bag[i],bag[j]]=[bag[j],bag[i]]; } }
    refillBag();

    function newPiece(){ const k = (bag.length?bag:refillBag(), bag.pop()); const mat = shapes[k].map(r=>r.slice()); return { k, mat, x: Math.floor((COLS - mat[0].length)/2), y: -2, rotated:false, lastAction:'spawn' } }
    let cur = newPiece(); let hold=null, holdUsed=false;
    let nextQ=[newPiece(), newPiece(), newPiece()];
    let last=0, raf=0, running=false, ended=false;
    // gravity/lock
    let fallInterval = (difficulty==='HARD'? 0.25 : difficulty==='EASY'? 0.8 : 0.5); // seconds per cell
    let fallAcc=0; let lockAcc=0; let LOCK_DELAY= (difficulty==='HARD'?0.35:(difficulty==='EASY'?0.8:0.5));
    let totalLines=0, ren=-1; // -1 means not started
    let tspinFlag = null; // 'T' when last rotate successful on T piece
    let lineBursts = [];
    let landingRipples = [];
    let particles = [];
    let floatingTexts = [];
    let boardShockwaves = [];
    let boardPulse = 0;

    function disableHostRestart(){
      shortcuts?.disableKey('r');
    }

    function enableHostRestart(){
      shortcuts?.enableKey('r');
    }

    function cloneMat(m){ return m.map(r=>r.slice()); }
    function rotate(mat, dir){ const h=mat.length,w=mat[0].length; const r=Array.from({length:w},()=>Array(h).fill(0)); for(let y=0;y<h;y++) for(let x=0;x<w;x++){ if(dir>0) r[x][h-1-y]=mat[y][x]; else r[w-1-x][y]=mat[y][x]; } return r; }
    function collides(px,py,mat){ const h=mat.length,w=mat[0].length; for(let y=0;y<h;y++) for(let x=0;x<w;x++){ if(!mat[y][x]) continue; const gx=px+x, gy=py+y; if(gx<0||gx>=COLS||gy>=ROWS) return true; if(gy>=0 && grid[gy][gx]) return true; } return false; }
    function merge(){ const h=cur.mat.length,w=cur.mat[0].length; for(let y=0;y<h;y++) for(let x=0;x<w;x++){ if(!cur.mat[y][x]) continue; const gx=cur.x+x, gy=cur.y+y; if(gy>=0) grid[gy][gx]={k:cur.k,c:colors[cur.k]}; } }
    function hardDropDist(){ let d=0; while(!collides(cur.x, cur.y+d+1, cur.mat)) d++; return d; }

    function finishGame(){
      if (!ended){
        ended = true;
        enableHostRestart();
      }
      running = false;
    }

    function draw(){
      ctx.fillStyle = '#050b16';
      ctx.fillRect(0,0,W,H);
      const margin = 14;
      const cw = Math.max(12, Math.floor(W / (COLS * 2.1)));
      const ch = cw;
      const gridW = cw * COLS;
      const gridH = ch * ROWS;
      const ox = margin;
      const oy = 28;
      const panelX = ox + gridW + 20;
      const panelW = Math.max(96, W - panelX - margin);

      // board panel background
      ctx.save();
      ctx.fillStyle = 'rgba(12,21,38,0.95)';
      ctx.fillRect(ox - 10, oy - 12, gridW + 20, gridH + 20);
      if (boardPulse > 0){
        const glow = Math.min(1, boardPulse * 2.2);
        const grad = ctx.createRadialGradient(
          ox + gridW / 2,
          oy + gridH / 2,
          Math.max(30, cw * 2),
          ox + gridW / 2,
          oy + gridH / 2,
          Math.max(gridW, gridH)
        );
        grad.addColorStop(0, `rgba(96,165,250,${0.16 * glow})`);
        grad.addColorStop(1, 'rgba(96,165,250,0)');
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = grad;
        ctx.fillRect(ox - 10, oy - 12, gridW + 20, gridH + 20);
      }
      ctx.restore();

      ctx.strokeStyle = 'rgba(15,23,42,0.35)';
      for (let y = 0; y <= ROWS; y++){
        ctx.beginPath();
        ctx.moveTo(ox + 0.5, oy + y * ch + 0.5);
        ctx.lineTo(ox + gridW - 0.5, oy + y * ch + 0.5);
        ctx.stroke();
      }
      for (let x = 0; x <= COLS; x++){
        ctx.beginPath();
        ctx.moveTo(ox + x * cw + 0.5, oy + 0.5);
        ctx.lineTo(ox + x * cw + 0.5, oy + gridH - 0.5);
        ctx.stroke();
      }

      for (let y = 0; y < ROWS; y++){
        for (let x = 0; x < COLS; x++){
          const cell = grid[y][x];
          if (cell) drawBlock(x, y, cell.c);
        }
      }

      // ghost & current piece
      const dd = hardDropDist();
      drawPiece(cur.x, cur.y + dd, cur.mat, '#94a3b8', 0.28);
      drawPiece(cur.x, cur.y, cur.mat, colors[cur.k]);

      drawLineBursts(ox, oy, gridW, ch);
      drawBoardShockwaves(ox, oy, gridW, gridH);
      drawLandingRipples(ox, oy, cw, ch);
      drawParticles(ox, oy, cw, ch);
      drawFloatingTexts(ox, oy, cw, ch);

      // HUD text
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '600 16px system-ui, sans-serif';
      ctx.fillText('TETRIS TRAINING', margin, 18);
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(`LINES: ${totalLines}`, margin, 38);
      ctx.fillText(`REN: ${Math.max(0, ren)}`, margin + 120, 38);

      // Hold panel
      const boxH = 120;
      const holdY = oy;
      const nextY = holdY + boxH + 16;
      drawBox(panelX, holdY, panelW, boxH, 'HOLD');
      if (hold) drawMini(hold.k, panelX + panelW / 2, holdY + boxH * 0.58, Math.min(1.0, panelW / (cw * 4)) * 0.75);

      // Next queue
      const nextBoxH = Math.max(140, H - nextY - margin);
      drawBox(panelX, nextY, panelW, nextBoxH, 'NEXT');
      const showN = Math.min(5, nextQ.length);
      for (let i = 0; i < showN; i++){
        const cy = nextY + 32 + i * 64;
        drawMini(nextQ[i].k, panelX + panelW / 2, cy, Math.min(1.0, panelW / (cw * 4)) * 0.68);
      }

      if (ended){
        ctx.fillStyle='rgba(5,8,14,0.62)'; ctx.fillRect(0,0,W,H);
        ctx.fillStyle='#f8fafc'; ctx.font='bold 24px system-ui,sans-serif'; ctx.textAlign='center';
        ctx.fillText('Game Over', W/2, H/2-6);
        ctx.font='13px system-ui,sans-serif'; ctx.fillText('Rで再開/再起動', W/2, H/2+18);
        ctx.textAlign='start';
      }

      function drawPiece(px, py, mat, col, alpha = 1){
        const h = mat.length, w = mat[0].length;
        for (let y = 0; y < h; y++){
          for (let x = 0; x < w; x++){
            if (!mat[y][x]) continue;
            const gx = px + x;
            const gy = py + y;
            if (gy < 0) continue;
            drawBlock(gx, gy, col, alpha);
          }
        }
      }

      function drawBlock(x, y, color, alpha = 1){
        if (y < 0) return;
        const px = ox + x * cw;
        const py = oy + y * ch;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.fillRect(px + 2, py + 2, cw - 4, ch - 4);
        ctx.fillStyle = 'rgba(255,255,255,0.16)';
        ctx.fillRect(px + 3, py + 3, cw - 6, Math.max(2, (ch - 6) * 0.4));
        ctx.strokeStyle = 'rgba(15,23,42,0.6)';
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 2.5, py + 2.5, cw - 5, ch - 5);
        ctx.restore();
      }

      function drawBox(x, y, w, h, title){
        ctx.save();
        ctx.fillStyle = 'rgba(15,23,42,0.88)';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = 'rgba(148,163,184,0.35)';
        ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '600 12px system-ui, sans-serif';
        ctx.fillText(title, x + 10, y + 18);
        ctx.restore();
      }

      function drawMini(k, cx, cy, scale){
        const mat = shapes[k];
        const cell = Math.max(6, Math.floor(cw * scale));
        const mh = mat.length, mw = mat[0].length;
        const wpx = mw * cell;
        const hpx = mh * cell;
        const sx = Math.floor(cx - wpx / 2);
        const sy = Math.floor(cy - hpx / 2);
        for (let y = 0; y < mh; y++){
          for (let x = 0; x < mw; x++){
            if (!mat[y][x]) continue;
            const px = sx + x * cell;
            const py = sy + y * cell;
            ctx.fillStyle = colors[k];
            ctx.fillRect(px + 1, py + 1, cell - 2, cell - 2);
            ctx.fillStyle = 'rgba(255,255,255,0.18)';
            ctx.fillRect(px + 2, py + 2, cell - 4, Math.max(1, (cell - 4) * 0.4));
          }
        }
      }
    }

    function spawn(){ cur = nextQ.shift(); nextQ.push(newPiece()); holdUsed=false; if (collides(cur.x, cur.y, cur.mat)){ finishGame(); }
      fallAcc=0; lockAcc=0; tspinFlag=null; }

    function softDrop(){ if(!collides(cur.x, cur.y+1, cur.mat)) { cur.y++; cur.lastAction='drop'; lockAcc=0; } else { lockAcc += 1/60; } }
    function move(dx){ if(!collides(cur.x+dx, cur.y, cur.mat)) { cur.x+=dx; cur.lastAction='move'; if(collides(cur.x, cur.y+1, cur.mat)) lockAcc=0; } }
    function rotatePiece(dir){ const r=rotate(cur.mat,dir); // simplistic wall-kick: try few offsets
      const kicks=[[0,0], [1,0], [-1,0], [0,-1], [2,0], [-2,0]]; for(const [kx,ky] of kicks){ if(!collides(cur.x+kx, cur.y+ky, r)){ cur.mat=r; cur.x+=kx; cur.y+=ky; cur.lastAction='rotate'; if(cur.k==='T') tspinFlag='T'; if(collides(cur.x, cur.y+1, cur.mat)) lockAcc=0; return; } } }

        function lock(){
      const landingCells = [];
      const h = cur.mat.length, w = cur.mat[0].length;
      for (let y = 0; y < h; y++){
        for (let x = 0; x < w; x++){
          if (!cur.mat[y][x]) continue;
          const gx = cur.x + x;
          const gy = cur.y + y;
          if (gy < 0) continue;
          landingCells.push({ x: gx, y: gy, color: colors[cur.k] });
        }
      }
      merge();
      if (landingCells.length) createLandingRipples(landingCells);
      const clearedRows = lineClear();
      const cleared = clearedRows.length;
      let gained = 0;
      if (cleared > 0){
        totalLines += cleared;
        ren = (ren < 0 ? 1 : ren + 1);
        const tsp = isTSpin();
        if (tsp){
          gained += (cleared === 1 ? 4 : cleared === 2 ? 15 : cleared === 3 ? 75 : 90);
          const label = cleared === 1 ? 'T-SPIN SINGLE!' : cleared === 2 ? 'T-SPIN DOUBLE!' : 'T-SPIN TRIPLE!';
          showCombo(label);
        } else {
          gained += (cleared === 1 ? 2 : cleared === 2 ? 5 : cleared === 3 ? 10 : 25);
        }
        const renMul = Math.pow(1.5, Math.max(0, ren - 1));
        gained *= renMul;
        awardXp(gained, { type: tsp ? 'tspin' : 'line', ren: Math.max(0, ren - 1) });
        addLineClearEffects(clearedRows);
        const shockRgb = tsp ? '196,181,253' : (cleared >= 4 ? '250,204,21' : cleared === 3 ? '248,113,113' : cleared === 2 ? '96,165,250' : '148,163,184');
        const renBoost = Math.max(0, ren - 1) * 0.08;
        addBoardShockwave(0.7 + cleared * 0.2 + renBoost, shockRgb);
        announceClear(cleared, tsp);
      } else {
        ren = -1;
      }
      spawn();
    }

    function isTSpin(){ if (cur.k!=='T' || cur.lastAction!=='rotate' || tspinFlag!=='T') return false; // corner check around T center
      // center cell of T relative to cur is (1,1) in default orientation; approximate by testing 4 corners around cur position+1,1
      const cx = cur.x+1, cy = cur.y+1; const corners=[[0,0],[2,0],[0,2],[2,2]]; let filled=0; for(const [dx,dy] of corners){ const gx=cx+dx-1, gy=cy+dy-1; if (gy<0||gx<0||gx>=COLS||gy>=ROWS || grid[gy][gx]) filled++; } return filled>=3; }

    function lineClear(){
      const clearedRows = [];
      for (let y = ROWS - 1; y >= 0; y--){
        if (grid[y].every(c => !!c)){
          clearedRows.push(y);
          grid.splice(y, 1);
          grid.unshift(Array(COLS).fill(null));
          y++;
        }
      }
      return clearedRows;
    }

    function hardDrop(){
      const d = hardDropDist();
      cur.y += d;
      boardPulse = Math.max(boardPulse, 0.22 + Math.min(0.18, d * 0.02));
      awardXp(1, { type:'harddrop' });
      if (d > 0){
        addFloatingText('DROP!', { color: '#bae6fd', duration: 0.8, jitter: true, y: 4.5 });
        addBoardShockwave(0.55 + Math.min(0.25, d * 0.03), '148,197,255');
      }
      lock();
    }

    function createLandingRipples(cells){
      const seen = new Set();
      cells.forEach(cell => {
        const key = `${cell.x}:${cell.y}`;
        if (seen.has(key)) return;
        seen.add(key);
        landingRipples.push({ x: cell.x, y: cell.y, color: cell.color, time: 0, duration: 0.3 });
      });
      boardPulse = Math.max(boardPulse, 0.2);
    }

    function addLineClearEffects(rows){
      if (!rows.length) return;
      rows.forEach(row => {
        lineBursts.push({ row, time: 0, duration: 0.35 });
        spawnRowParticles(row);
      });
      boardPulse = Math.max(boardPulse, 0.32 + rows.length * 0.08);
    }

    function addBoardShockwave(strength, rgb){
      boardShockwaves.push({
        time: 0,
        duration: 0.6,
        strength: strength || 1,
        rgb: rgb || '96,165,250',
      });
    }

    function spawnRowParticles(row){
      const count = 12;
      for (let i = 0; i < count; i++){
        particles.push({
          x: Math.random() * COLS,
          y: row + Math.random(),
          vx: (Math.random() - 0.5) * 6,
          vy: -2.8 - Math.random() * 1.6,
          time: 0,
          duration: 0.6 + Math.random() * 0.4,
          color: 'rgba(248,250,252,0.95)'
        });
      }
    }

    function addFloatingText(text, opts = {}){
      const jitterX = opts.jitter ? (Math.random() * 0.6 - 0.3) : 0;
      const jitterY = opts.jitter ? (Math.random() * 0.4 - 0.2) : 0;
      floatingTexts.push({
        text,
        x: (opts.x ?? COLS / 2 - 0.5) + jitterX,
        y: (opts.y ?? 2.5) + jitterY,
        color: opts.color || '#f8fafc',
        duration: opts.duration || 1.2,
        time: 0,
      });
    }

    function announceClear(count, tsp){
      if (count <= 0) return;
      if (tsp){
        const label = count === 1 ? 'T-SPIN SINGLE!' : count === 2 ? 'T-SPIN DOUBLE!' : 'T-SPIN TRIPLE!';
        addFloatingText(label, { color: '#f5d0fe', duration: 1.4, jitter: true });
        return;
      }
      const labels = ['SINGLE', 'DOUBLE', 'TRIPLE', 'TETRIS!!'];
      const colorsFx = ['#dbeafe', '#c4b5fd', '#facc15', '#facc15'];
      const text = labels[count - 1] || `${count} LINES`;
      const color = colorsFx[count - 1] || '#e2e8f0';
      addFloatingText(text, { color, duration: 1.2, jitter: true });
    }

    function drawLineBursts(ox, oy, gridW, cellH){
      lineBursts.forEach(effect => {
        const progress = effect.time / effect.duration;
        if (progress >= 1) return;
        const alpha = 1 - progress;
        const y = oy + effect.row * cellH;
        const grad = ctx.createLinearGradient(ox, y, ox + gridW, y);
        grad.addColorStop(0, 'rgba(148,197,255,0)');
        grad.addColorStop(0.5, `rgba(244,244,255,${0.65 * alpha})`);
        grad.addColorStop(1, 'rgba(148,197,255,0)');
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = grad;
        ctx.fillRect(ox, y, gridW, cellH);
        ctx.restore();
      });
    }

    function drawBoardShockwaves(ox, oy, gridW, gridH){
      boardShockwaves.forEach(effect => {
        const progress = effect.time / effect.duration;
        if (progress >= 1) return;
        const cx = ox + gridW / 2;
        const cy = oy + gridH / 2;
        const diag = Math.sqrt(gridW * gridW + gridH * gridH);
        const strength = effect.strength || 1;
        const radius = diag * (0.18 + progress * 0.55 * strength);
        const alpha = Math.max(0, 1 - progress);
        ctx.save();
        ctx.globalAlpha = alpha * 0.65;
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = `rgba(${effect.rgb || '96,165,250'},1)`;
        ctx.lineWidth = Math.max(2, Math.min(10, 6 * strength * (1 - progress * 0.6)));
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });
    }

    function drawLandingRipples(ox, oy, cw, ch){
      landingRipples.forEach(effect => {
        const progress = effect.time / effect.duration;
        if (progress >= 1) return;
        const alpha = 1 - progress;
        const radius = (cw / 2) + progress * cw * 0.9;
        const cx = ox + (effect.x + 0.5) * cw;
        const cy = oy + (effect.y + 0.5) * ch;
        ctx.save();
        ctx.globalAlpha = alpha * 0.9;
        ctx.strokeStyle = effect.color || 'rgba(148,197,255,0.85)';
        ctx.lineWidth = Math.max(1.2, cw * 0.12);
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });
    }

    function drawParticles(ox, oy, cw, ch){
      particles.forEach(p => {
        const progress = p.time / p.duration;
        if (progress >= 1) return;
        const px = ox + p.x * cw;
        const py = oy + p.y * ch;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - progress);
        ctx.fillStyle = p.color;
        ctx.fillRect(px - 2, py - 2, 4, 4);
        ctx.restore();
      });
    }

    function drawFloatingTexts(ox, oy, cw, ch){
      floatingTexts.forEach(text => {
        const progress = text.time / text.duration;
        if (progress >= 1) return;
        const alpha = 1 - progress;
        const px = ox + (text.x + 0.5) * cw;
        const py = oy + (text.y - progress * 1.2) * ch;
        ctx.save();
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.fillStyle = text.color;
        ctx.font = 'bold 18px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(text.text, px, py);
        ctx.textAlign = 'start';
        ctx.restore();
      });
    }

    function updateVisuals(dt){
      boardPulse = Math.max(0, boardPulse - dt * 2.1);
      lineBursts = lineBursts.filter(effect => {
        effect.time += dt;
        return effect.time < effect.duration;
      });
      landingRipples = landingRipples.filter(effect => {
        effect.time += dt;
        return effect.time < effect.duration;
      });
      floatingTexts = floatingTexts.filter(text => {
        text.time += dt;
        return text.time < text.duration;
      });
      boardShockwaves = boardShockwaves.filter(effect => {
        effect.time += dt;
        return effect.time < effect.duration;
      });
      particles = particles.filter(p => {
        p.time += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 9 * dt;
        return p.time < p.duration;
      });
    }

    function onKey(e){ if(['ArrowLeft','ArrowRight','ArrowDown','ArrowUp','Space','KeyZ','KeyX','KeyC','KeyR'].some(k=>k===e.code)) e.preventDefault();
      if(e.code==='ArrowLeft') move(-1);
      else if(e.code==='ArrowRight') move(1);
      else if(e.code==='ArrowDown') softDrop();
      else if(e.code==='ArrowUp' || e.code==='KeyX') rotatePiece(1);
      else if(e.code==='KeyZ') rotatePiece(-1);
      else if(e.code==='Space') hardDrop();
      else if(e.code==='KeyC' && !holdUsed){ const tmp=hold; hold={k:cur.k,mat:cloneMat(cur.mat)}; if(tmp){ cur={k:tmp.k,mat:cloneMat(tmp.mat),x:Math.floor((COLS-tmp.mat[0].length)/2),y:-2,lastAction:'hold'}; } else { cur = nextQ.shift(); nextQ.push(newPiece()); } holdUsed=true; }
      else if(e.code==='KeyR'){ restart(); }
    }

    function showCombo(text){ addFloatingText(text, { color: '#facc15', duration: 1.4, jitter: true }); try{ if(window && window.showMiniExpBadge) window.showMiniExpBadge(text, { variant:'combo', level: Math.max(1, ren) }); }catch{} }

    function step(dt){ // gravity + lock
      fallAcc += dt;
      if (fallAcc >= fallInterval){
        if (!collides(cur.x, cur.y+1, cur.mat)) { cur.y++; cur.lastAction='grav'; lockAcc=0; }
        else { lockAcc += fallAcc; }
        fallAcc = 0;
      }
      if (collides(cur.x, cur.y+1, cur.mat)){
        lockAcc += dt;
        if (lockAcc >= LOCK_DELAY) { lockAcc = 0; lock(); }
      }
    }
    function loop(t){
      const now = t * 0.001;
      const dt = Math.min(0.033, now - (last || now));
      last = now;
      if (running){
        step(dt);
        updateVisuals(dt);
        draw();
        raf = requestAnimationFrame(loop);
      }
    }
    function start(){ if(running) return; running=true; disableHostRestart(); raf=requestAnimationFrame(loop); }
    function stop(opts = {}){ if(!running) return; running=false; cancelAnimationFrame(raf); if(!opts.keepShortcutsDisabled){ enableHostRestart(); } }
    function destroy(){ try{ stop(); canvas.remove(); document.removeEventListener('keydown', onKey); }catch{} }
    function restart(){ stop({ keepShortcutsDisabled: true }); grid=Array.from({length:ROWS},()=>Array(COLS).fill(null)); refillBag(); cur=newPiece(); nextQ=[newPiece(),newPiece(),newPiece()]; hold=null; holdUsed=false; totalLines=0; ren=-1; tspinFlag=null; ended=false; lineBursts=[]; landingRipples=[]; particles=[]; floatingTexts=[]; boardShockwaves=[]; boardPulse=0; start(); }
    function getScore(){ return totalLines; }

    document.addEventListener('keydown', onKey, { passive:false });
    draw();
    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({ id:'tetris', name:'テトリス風', nameKey: 'selection.miniexp.games.tetris.name', description:'REN/T-Spin対応', descriptionKey: 'selection.miniexp.games.tetris.description', categoryIds: ['puzzle'], create });
})();

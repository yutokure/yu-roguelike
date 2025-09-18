(function(){
  /** MiniExp: Tetris-like (v0.1.0) */
  function create(root, awardXp, opts){
    const difficulty = (opts && opts.difficulty) || 'NORMAL';
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

    function cloneMat(m){ return m.map(r=>r.slice()); }
    function rotate(mat, dir){ const h=mat.length,w=mat[0].length; const r=Array.from({length:w},()=>Array(h).fill(0)); for(let y=0;y<h;y++) for(let x=0;x<w;x++){ if(dir>0) r[x][h-1-y]=mat[y][x]; else r[w-1-x][y]=mat[y][x]; } return r; }
    function collides(px,py,mat){ const h=mat.length,w=mat[0].length; for(let y=0;y<h;y++) for(let x=0;x<w;x++){ if(!mat[y][x]) continue; const gx=px+x, gy=py+y; if(gx<0||gx>=COLS||gy>=ROWS) return true; if(gy>=0 && grid[gy][gx]) return true; } return false; }
    function merge(){ const h=cur.mat.length,w=cur.mat[0].length; for(let y=0;y<h;y++) for(let x=0;x<w;x++){ if(!cur.mat[y][x]) continue; const gx=cur.x+x, gy=cur.y+y; if(gy>=0) grid[gy][gx]={k:cur.k,c:colors[cur.k]}; } }
    function hardDropDist(){ let d=0; while(!collides(cur.x, cur.y+d+1, cur.mat)) d++; return d; }

    function draw(){
      ctx.fillStyle='#0b1020'; ctx.fillRect(0,0,W,H);
      // smaller blocks: 以前の1/2サイズ
      const margin = 12;
      const cw = Math.floor(W/(COLS*2)); // 横幅ベースで半分のセルサイズ
      const ch = cw;
      const gridW = cw*COLS, gridH = ch*ROWS;
      const ox = margin; // 左寄せで描画
      const oy = 24;
      const panelX = ox + gridW + 16;
      const panelW = Math.max(80, W - panelX - margin);

      // grid
      for(let y=0;y<ROWS;y++){
        for(let x=0;x<COLS;x++){
          ctx.strokeStyle='#1f2937';
          ctx.strokeRect(ox+x*cw+0.5, oy+y*ch+0.5, cw-1, ch-1);
          const cell=grid[y][x];
          if(cell){ ctx.fillStyle=cell.c; ctx.fillRect(ox+x*cw+1, oy+y*ch+1, cw-2, ch-2); }
        }
      }
      // ghost & current
      const dd = hardDropDist();
      ctx.globalAlpha=0.3; drawPiece(cur.x, cur.y+dd, cur.mat, '#94a3b8'); ctx.globalAlpha=1;
      drawPiece(cur.x, cur.y, cur.mat, colors[cur.k]);

      // side panel: HOLD & NEXT
      ctx.fillStyle='#cbd5e1'; ctx.font='12px system-ui,sans-serif';
      ctx.fillText(`LINES:${totalLines}  REN:${Math.max(0,ren)}`, 8, 14);

      // Hold box
      const boxH = 110; const holdY = oy; const nextY = holdY + boxH + 12;
      drawBox(panelX, holdY, panelW, boxH, 'HOLD');
      if (hold) drawMini(hold.k, panelX + Math.floor(panelW/2), holdY + Math.floor(boxH*0.6), Math.min(1.0, panelW/(cw*4)) * 0.7);

      // Next box (queue 5)
      const nextBoxH = H - nextY - margin;
      drawBox(panelX, nextY, panelW, nextBoxH, 'NEXT');
      const showN = Math.min(5, nextQ.length);
      for(let i=0;i<showN;i++){
        const cy = nextY + 26 + i * 64; // spacing
        drawMini(nextQ[i].k, panelX + Math.floor(panelW/2), cy, Math.min(1.0, panelW/(cw*4)) * 0.6);
      }

      if(ended){
        ctx.fillStyle='rgba(0,0,0,0.45)'; ctx.fillRect(0,0,W,H);
        ctx.fillStyle='#f8fafc'; ctx.font='bold 22px system-ui,sans-serif'; ctx.textAlign='center';
        ctx.fillText('Game Over', W/2, H/2-6);
        ctx.font='12px system-ui,sans-serif'; ctx.fillText('Rで再開/再起動', W/2, H/2+16);
        ctx.textAlign='start';
      }

      // helpers scoped in draw
      function drawPiece(px,py,mat,col){
        ctx.fillStyle=col; const h=mat.length,w=mat[0].length;
        for(let y=0;y<h;y++) for(let x=0;x<w;x++){
          if(!mat[y][x]) continue; const gx=px+x, gy=py+y; if(gy<0) continue;
          ctx.fillRect(ox+gx*cw+1, oy+gy*ch+1, cw-2, ch-2);
        }
      }
      function drawBox(x,y,w,h,title){
        ctx.strokeStyle='#1f2937'; ctx.strokeRect(x+0.5,y+0.5,w-1,h-1);
        ctx.fillStyle='#cbd5e1'; ctx.font='12px system-ui,sans-serif'; ctx.fillText(title, x+6, y+14);
      }
      function drawMini(k, cx, cy, scale){
        const mat = shapes[k]; const cell = Math.max(6, Math.floor(cw*scale));
        const mh = mat.length, mw = mat[0].length; const wpx = mw*cell, hpx = mh*cell;
        const sx = Math.floor(cx - wpx/2), sy = Math.floor(cy - hpx/2);
        ctx.fillStyle = colors[k];
        for(let y=0;y<mh;y++) for(let x=0;x<mw;x++) if(mat[y][x]) ctx.fillRect(sx+x*cell+1, sy+y*cell+1, cell-2, cell-2);
      }
    }

    function spawn(){ cur = nextQ.shift(); nextQ.push(newPiece()); holdUsed=false; if (collides(cur.x, cur.y, cur.mat)){ ended=true; running=false; }
      fallAcc=0; lockAcc=0; tspinFlag=null; }

    function softDrop(){ if(!collides(cur.x, cur.y+1, cur.mat)) { cur.y++; cur.lastAction='drop'; lockAcc=0; } else { lockAcc += 1/60; } }
    function move(dx){ if(!collides(cur.x+dx, cur.y, cur.mat)) { cur.x+=dx; cur.lastAction='move'; if(collides(cur.x, cur.y+1, cur.mat)) lockAcc=0; } }
    function rotatePiece(dir){ const r=rotate(cur.mat,dir); // simplistic wall-kick: try few offsets
      const kicks=[[0,0], [1,0], [-1,0], [0,-1], [2,0], [-2,0]]; for(const [kx,ky] of kicks){ if(!collides(cur.x+kx, cur.y+ky, r)){ cur.mat=r; cur.x+=kx; cur.y+=ky; cur.lastAction='rotate'; if(cur.k==='T') tspinFlag='T'; if(collides(cur.x, cur.y+1, cur.mat)) lockAcc=0; return; } } }

    function lock(){ merge(); const cleared = lineClear(); let gained=0; if (cleared>0){ totalLines += cleared; // REN
        ren = (ren<0?1:ren+1);
        // T-Spin detection: if last was rotate, piece is T, and 3 of 4 corners filled
        const tsp = isTSpin(); if (tsp){ gained += (cleared===1?4:cleared===2?15:cleared===3?75:0); showCombo('T-Spin'+(cleared===1? ' Single':' Double')); }
        else { gained += (cleared===1?2 : cleared===2?5 : cleared===3?10 : 25); }
        const renMul = Math.pow(1.5, Math.max(0, ren-1)); gained *= renMul; awardXp(gained, { type: tsp?'tspin':'line', ren: Math.max(0,ren-1) });
      } else { ren = -1; }
      spawn(); }

    function isTSpin(){ if (cur.k!=='T' || cur.lastAction!=='rotate' || tspinFlag!=='T') return false; // corner check around T center
      // center cell of T relative to cur is (1,1) in default orientation; approximate by testing 4 corners around cur position+1,1
      const cx = cur.x+1, cy = cur.y+1; const corners=[[0,0],[2,0],[0,2],[2,2]]; let filled=0; for(const [dx,dy] of corners){ const gx=cx+dx-1, gy=cy+dy-1; if (gy<0||gx<0||gx>=COLS||gy>=ROWS || grid[gy][gx]) filled++; } return filled>=3; }

    function lineClear(){ let count=0; for(let y=ROWS-1;y>=0;y--){ if(grid[y].every(c=>!!c)){ grid.splice(y,1); grid.unshift(Array(COLS).fill(null)); count++; y++; } } return count; }

    function hardDrop(){ const d = hardDropDist(); cur.y += d; awardXp(1, { type:'harddrop' }); lock(); }

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

    function showCombo(text){ try{ if(window && window.showMiniExpBadge) window.showMiniExpBadge(text, { variant:'combo', level: Math.max(1, ren) }); }catch{} }

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
    function loop(t){ const now=t*0.001; const dt=Math.min(0.033, now-(last||now)); last=now; if(running){ step(dt); draw(); raf=requestAnimationFrame(loop); } }
    function start(){ if(running) return; running=true; raf=requestAnimationFrame(loop); }
    function stop(){ if(!running) return; running=false; cancelAnimationFrame(raf); }
    function destroy(){ try{ stop(); canvas.remove(); document.removeEventListener('keydown', onKey); }catch{} }
    function restart(){ grid=Array.from({length:ROWS},()=>Array(COLS).fill(null)); refillBag(); cur=newPiece(); nextQ=[newPiece(),newPiece(),newPiece()]; hold=null; holdUsed=false; totalLines=0; ren=-1; tspinFlag=null; ended=false; start(); }
    function getScore(){ return totalLines; }

    document.addEventListener('keydown', onKey, { passive:false });
    draw();
    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({ id:'tetris', name:'テトリス風', description:'REN/T-Spin対応', create });
})();

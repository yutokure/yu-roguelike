(function(){
  function create(root, awardXp, opts){
    const W = 560, H = 420;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    canvas.style.display='block'; canvas.style.margin='0 auto'; canvas.style.background='#0b1220'; canvas.style.borderRadius='8px';
    root.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const diff = (opts && opts.difficulty) || 'NORMAL';
    const cfg = {
      EASY:   { cols: 10, rows: 12, colors: 4, refill: true },
      NORMAL: { cols: 12, rows: 14, colors: 5, refill: true },
      HARD:   { cols: 12, rows: 16, colors: 6, refill: true }
    }[diff];

    const COLS = cfg.cols, ROWS = cfg.rows;
    const PAD = 6;
    const CELL = Math.min( Math.floor((W - PAD*2) / COLS), Math.floor((H - PAD*2) / ROWS) );
    const ORGX = Math.floor((W - CELL*COLS)/2), ORGY = Math.floor((H - CELL*ROWS)/2);

    // grid: -1 empty, 0..(colors-1)
    let grid = Array.from({length:ROWS}, ()=>Array(COLS).fill(0));
    function rnd(n){ return (Math.random()*n)|0; }
    function newColor(){ return rnd(cfg.colors); }
    function refillAll(){ for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++) grid[y][x] = newColor(); }
    refillAll();

    let running=false, hoverGroup=null; // group: array of [x,y]
    let lastHintKey = '';
    const pops=[]; // pop ring animations {x,y,t}
    let totalRemoved = 0;

    const pal = (idx)=>`hsl(${(idx*57)%360} 72% 58%)`;

    function inb(x,y){ return x>=0 && x<COLS && y>=0 && y<ROWS; }
    function floodGroup(sx,sy){
      const c = grid[sy][sx]; if (c<0) return [];
      const vis = Array.from({length:ROWS},()=>Array(COLS).fill(false));
      const q=[[sx,sy]]; vis[sy][sx]=true; const out=[[sx,sy]];
      const D = [[1,0],[-1,0],[0,1],[0,-1]];
      while(q.length){
        const [x,y]=q.pop();
        for(const [dx,dy] of D){ const nx=x+dx, ny=y+dy; if(!inb(nx,ny)||vis[ny][nx]||grid[ny][nx]!==c) continue; vis[ny][nx]=true; q.push([nx,ny]); out.push([nx,ny]); }
      }
      return out;
    }

    function removeGroup(g){ if(!g || g.length<2) return false; // size>=2 only
      // set empty
      for(const [x,y] of g) grid[y][x] = -1;
      totalRemoved += g.length;
      const base = g.length * 0.5;
      const mult = 1 + 0.5 * Math.floor(g.length / 5);
      awardXp && awardXp(base * mult, { size:g.length, mult });
      // collapse down
      for(let x=0;x<COLS;x++){
        let wr = ROWS-1;
        for(let y=ROWS-1;y>=0;y--){ if(grid[y][x]>=0){ grid[wr][x]=grid[y][x]; wr--; } }
        while(wr>=0){ grid[wr][x]= -1; wr--; }
      }
      // shift left if column empty
      let write = 0;
      for(let x=0;x<COLS;x++){
        let emptyCol = true; for(let y=0;y<ROWS;y++) if(grid[y][x]>=0){ emptyCol=false; break; }
        if(!emptyCol){ if(write!==x){ for(let y=0;y<ROWS;y++){ grid[y][write]=grid[y][x]; grid[y][x]=-1; } } write++; }
      }
      // refill top (if enabled)
      if (cfg.refill){
        for(let x=0;x<COLS;x++) for(let y=0;y<ROWS;y++) if(grid[y][x]<0) grid[y][x]=newColor();
      }
      return true;
    }

    function draw(){
      ctx.fillStyle = '#0b1220'; ctx.fillRect(0,0,W,H);
      // title
      ctx.fillStyle='#e2e8f0'; ctx.font='12px sans-serif'; ctx.fillText(`Same Game | ${diff} | Removed: ${totalRemoved}`, 8, 18);
      for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++){
        const val = grid[y][x];
        const px = ORGX + x*CELL, py = ORGY + y*CELL;
        if (val<0){ ctx.fillStyle = 'rgba(148,163,184,0.15)'; ctx.fillRect(px+2,py+2, CELL-4, CELL-4); continue; }
        ctx.fillStyle = pal(val);
        ctx.fillRect(px+3, py+3, CELL-6, CELL-6);
      }
      // hover highlight
      if (hoverGroup && hoverGroup.length>=2){
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        for(const [x,y] of hoverGroup){ const px=ORGX+x*CELL, py=ORGY+y*CELL; ctx.fillRect(px+3, py+3, CELL-6, CELL-6); }
      }
      // pop rings
      for(let i=pops.length-1;i>=0;i--){ const p=pops[i]; const px=ORGX+p.x*CELL+CELL/2, py=ORGY+p.y*CELL+CELL/2; const r=(CELL/2-4)*(1 - p.t/12); ctx.strokeStyle=`rgba(248,250,252,${p.t/12})`; ctx.beginPath(); ctx.arc(px,py, Math.max(0,r), 0, Math.PI*2); ctx.stroke(); p.t--; if(p.t<=0) pops.splice(i,1); }
    }

    function toCell(mx,my){ const x = Math.floor((mx-ORGX)/CELL), y = Math.floor((my-ORGY)/CELL); if(!inb(x,y)) return null; return [x,y]; }

    function onMove(e){
      const r=canvas.getBoundingClientRect();
      const p=toCell(e.clientX-r.left, e.clientY-r.top);
      if(!p){ hoverGroup=null; draw(); return; }
      const [x,y]=p; const g=floodGroup(x,y); hoverGroup = (g.length>=2)? g : null; draw();
      if (hoverGroup && hoverGroup.length>=2) {
        const size = hoverGroup.length;
        const base = size * 0.5;
        const mult = 1 + 0.5 * Math.floor(size / 5);
        const exp = Math.floor(base * mult);
        const cx = e.clientX - r.left + 12;
        const cy = e.clientY - r.top - 8;
        const key = `${x},${y},${size}`;
        if (key !== lastHintKey) {
          lastHintKey = key;
          try { if (window.showTransientPopupAt) window.showTransientPopupAt(cx, cy, `${size}個 / 予想+${exp}EXP`); } catch {}
        }
      }
    }
    function onClick(e){ if(!hoverGroup){ return; } for(const [x,y] of hoverGroup){ pops.push({ x,y,t:12 }); } const g=hoverGroup; hoverGroup=null; draw(); setTimeout(()=>{ removeGroup(g); draw(); }, 90); }

    function start(){ if(!running){ running=true; canvas.addEventListener('mousemove',onMove); canvas.addEventListener('click',onClick); draw(); } }
    function stop(){ if(running){ running=false; canvas.removeEventListener('mousemove',onMove); canvas.removeEventListener('click',onClick); } }
    function destroy(){ try{ stop(); root && root.removeChild(canvas); }catch{} }
    function getScore(){ return totalRemoved; }

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({ id:'same', name:'セイムゲーム', nameKey: 'selection.miniexp.games.same.name', description:'同色まとめ消し×0.5EXP', descriptionKey: 'selection.miniexp.games.same.description', categoryIds: ['puzzle'], create });
})();

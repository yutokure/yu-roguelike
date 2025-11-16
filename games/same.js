(function(){
  function create(root, awardXp, opts){
    const W = 560, H = 420;
    const localization = opts?.localization || (typeof window !== 'undefined' && typeof window.createMiniGameLocalization === 'function'
      ? window.createMiniGameLocalization({ id: 'same' })
      : null);
    const text = (key, fallback, params) => {
      if (localization && typeof localization.t === 'function') {
        return localization.t(key, fallback, params);
      }
      if (typeof fallback === 'function') return fallback();
      return fallback ?? '';
    };
    const formatNumber = (value, options) => {
      try {
        if (localization && typeof localization.formatNumber === 'function') {
          return localization.formatNumber(value, options);
        }
      } catch {}
      try {
        return new Intl.NumberFormat(undefined, options).format(value);
      } catch {}
      return `${value}`;
    };

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
    let detachLocale = null;
    let lastHintKey = '';
    const pops=[]; // pop ring animations {x,y,t}
    let clearBursts = []; // { cells:[{x,y}], t, duration }
    let fallTrails = [];  // { from:{x,y}, to:{x,y}, t, duration, color }
    let particles = [];   // { x,y,vx,vy,life,maxLife,color }
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
      const cells = g.map(([x,y]) => ({ x, y }));
      // set empty & spawn particles
      cells.forEach(({ x, y }) => {
        const val = grid[y][x];
        grid[y][x] = -1;
        const px = ORGX + x*CELL + CELL/2;
        const py = ORGY + y*CELL + CELL/2;
        const count = 12 + Math.min(18, g.length * 2);
        for(let i=0;i<count;i++){
          const ang = Math.random()*Math.PI*2;
          const spd = 80 + Math.random()*160;
          particles.push({
            x: px,
            y: py,
            vx: Math.cos(ang)*spd,
            vy: Math.sin(ang)*spd - 40,
            life: 0.5 + Math.random()*0.4,
            maxLife: 0.9,
            color: pal(val),
          });
        }
      });
      if (cells.length){
        clearBursts.push({ cells, t:0, duration:0.35 });
      }
      totalRemoved += g.length;
      const base = g.length * 0.5;
      const mult = 1 + 0.5 * Math.floor(g.length / 5);
      awardXp && awardXp(base * mult, { size:g.length, mult });
      // collapse down (track fall trails)
      const newGrid = Array.from({length:ROWS}, ()=>Array(COLS).fill(-1));
      const newTrails = [];
      for(let x=0;x<COLS;x++){
        let wr = ROWS-1;
        for(let y=ROWS-1;y>=0;y--){
          if(grid[y][x]>=0){
            const val = grid[y][x];
            newGrid[wr][x] = val;
            if (wr !== y){
              newTrails.push({
                from:{ x, y },
                to:{ x, y:wr },
                t:0,
                duration:0.22 + (y-wr)*0.03,
                color: pal(val),
              });
            }
            wr--;
          }
        }
        while(wr>=0){ newGrid[wr][x]= -1; wr--; }
      }
      grid = newGrid;
      fallTrails.push(...newTrails);
      // shift left if column empty
      let write = 0;
      for(let x=0;x<COLS;x++){
        let emptyCol = true; for(let y=0;y<ROWS;y++) if(grid[y][x]>=0){ emptyCol=false; break; }
        if(!emptyCol){ if(write!==x){ for(let y=0;y<ROWS;y++){ grid[y][write]=grid[y][x]; grid[y][x]=-1; } } write++; }
      }
      // refill top (if enabled)
      if (cfg.refill){
        for(let x=0;x<COLS;x++) for(let y=0;y<ROWS;y++) if(grid[y][x]<0){
          const val = newColor();
          grid[y][x]=val;
          const spawnFromY = -1 - (Math.random()*2|0);
          fallTrails.push({
            from:{ x, y:spawnFromY },
            to:{ x, y },
            t:0,
            duration:0.28 + (y-spawnFromY)*0.035,
            color: pal(val),
          });
        }
      }
      return true;
    }

    function draw(){
      ctx.fillStyle = '#0b1220'; ctx.fillRect(0,0,W,H);
      // title
      ctx.fillStyle='#e2e8f0'; ctx.font='12px sans-serif';
      const titleLabel = text('.hud.title', 'Same Game');
      const difficultyLabel = text(`difficulty.${diff.toLowerCase()}`, () => diff, { difficulty: diff });
      const removedLabel = text('.hud.removed', 'Removed');
      const removedValue = formatNumber(totalRemoved, { maximumFractionDigits: 0 });
      const statusText = text('.hud.status', () => `${titleLabel} | ${difficultyLabel} | ${removedLabel}: ${removedValue}`, {
        title: titleLabel,
        difficulty: difficultyLabel,
        difficultyKey: diff,
        removedLabel,
        removed: removedValue,
        rawRemoved: totalRemoved,
      });
      ctx.fillText(statusText, 8, 18);
      for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++){
        const val = grid[y][x];
        const px = ORGX + x*CELL, py = ORGY + y*CELL;
        if (val<0){ ctx.fillStyle = 'rgba(148,163,184,0.12)'; ctx.fillRect(px+2,py+2, CELL-4, CELL-4); continue; }
        ctx.fillStyle = pal(val);
        ctx.fillRect(px+3, py+3, CELL-6, CELL-6);
      }
      // hover highlight
      if (hoverGroup && hoverGroup.length>=2){
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        for(const [x,y] of hoverGroup){ const px=ORGX+x*CELL, py=ORGY+y*CELL; ctx.fillRect(px+3, py+3, CELL-6, CELL-6); }
      }
      // falling trails
      for (let i=fallTrails.length-1;i>=0;i--){
        const f = fallTrails[i];
        f.t += 0.016;
        const prog = f.t / f.duration;
        if (prog >= 1){ fallTrails.splice(i,1); continue; }
        const ease = 1 - Math.pow(1-prog,3);
        const iy = f.from.y + (f.to.y - f.from.y)*ease;
        const px = ORGX + f.to.x*CELL;
        const py = ORGY + iy*CELL;
        const alpha = 0.3 + 0.5*(1-prog);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = f.color;
        ctx.fillRect(px+5, py+5, CELL-10, CELL-10);
        ctx.restore();
      }

      // clear bursts
      for (let i=clearBursts.length-1;i>=0;i--){
        const b = clearBursts[i];
        b.t += 0.016;
        const prog = b.t / b.duration;
        if (prog >= 1){ clearBursts.splice(i,1); continue; }
        const alpha = 1 - prog;
        const scale = 1 + prog*0.6;
        ctx.save();
        ctx.globalAlpha = alpha*0.9;
        b.cells.forEach(c=>{
          const px = ORGX + c.x*CELL + CELL/2;
          const py = ORGY + c.y*CELL + CELL/2;
          ctx.beginPath();
          ctx.arc(px,py,(CELL/2-6)*scale,0,Math.PI*2);
          ctx.strokeStyle = 'rgba(248,250,252,0.9)';
          ctx.lineWidth = 2;
          ctx.stroke();
        });
        ctx.restore();
      }

      // particles
      for (let i=particles.length-1;i>=0;i--){
        const p = particles[i];
        p.life -= 0.016;
        if (p.life <= 0){ particles.splice(i,1); continue; }
        const ratio = p.life / p.maxLife;
        p.x += p.vx * 0.016;
        p.y += p.vy * 0.016;
        p.vy += 200 * 0.016;
        ctx.save();
        ctx.globalAlpha = Math.max(0, ratio);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2 + (1-ratio)*2, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
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
          try {
            if (window.showTransientPopupAt) {
              const expValue = formatNumber(exp, { maximumFractionDigits: 0 });
              const popupText = text('.hint.popup', () => `${size}個 / 予想+${expValue}EXP`, {
                size,
                removed: size,
                exp,
                expFormatted: expValue,
              });
              window.showTransientPopupAt(cx, cy, popupText);
            }
          } catch {}
        }
      }
    }
    function onClick(e){
      if(!hoverGroup){ return; }
      for(const [x,y] of hoverGroup){ pops.push({ x,y,t:12 }); }
      const g=hoverGroup;
      hoverGroup=null;
      draw();
      setTimeout(()=>{ removeGroup(g); draw(); }, 60);
    }

    if (!detachLocale && localization && typeof localization.onChange === 'function'){
      detachLocale = localization.onChange(() => { try { draw(); } catch {} });
    }

    function start(){ if(!running){ running=true; canvas.addEventListener('mousemove',onMove); canvas.addEventListener('click',onClick); draw(); } }
    function stop(){ if(running){ running=false; canvas.removeEventListener('mousemove',onMove); canvas.removeEventListener('click',onClick); } }
    function destroy(){ try{ stop(); detachLocale && detachLocale(); detachLocale=null; root && root.removeChild(canvas); }catch{} }
    function getScore(){ return totalRemoved; }

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({ id:'same', name:'セイムゲーム', nameKey: 'selection.miniexp.games.same.name', description:'同色まとめ消し×0.5EXP', descriptionKey: 'selection.miniexp.games.same.description', categoryIds: ['puzzle'], create });
})();

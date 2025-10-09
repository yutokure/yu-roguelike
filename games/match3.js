(function(){
  function create(root, awardXp, opts){
    const diff = (opts && opts.difficulty) || 'NORMAL';

    const localization = (opts && opts.localization) || (typeof window !== 'undefined' && typeof window.createMiniGameLocalization === 'function'
      ? window.createMiniGameLocalization({ id: 'match3' })
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
    const cfg = {
      EASY:   { cols: 8,  rows: 8,  colors: 5 },
      NORMAL: { cols: 8,  rows: 10, colors: 6 },
      HARD:   { cols: 9,  rows: 12, colors: 7 }
    }[diff];

    const CELL = 44; const PAD = 10;
    const W = cfg.cols*CELL + PAD*2; const H = cfg.rows*CELL + PAD*2 + 24;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    canvas.style.display='block'; canvas.style.margin='0 auto'; canvas.style.background='#0b1220'; canvas.style.borderRadius='8px';
    root.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const COLS = cfg.cols, ROWS = cfg.rows, COLORS = cfg.colors;
    const board = Array.from({length:ROWS}, ()=>Array(COLS).fill(0));
    let detachLocale = null;
    let lastClickPos = { x: W/2, y: H/2 };
    let sel = null; // {x,y}
    let running = false;
    let totalCleared = 0; // score

    const hue = (i)=> `hsl(${(i*57)%360} 70% 60%)`;
    const rnd = (n)=> (Math.random()*n)|0;
    const newColor = ()=> rnd(COLORS);
    const inb = (x,y)=> x>=0 && x<COLS && y>=0 && y<ROWS;
    function swap(a,b){ const t = board[a.y][a.x]; board[a.y][a.x] = board[b.y][b.x]; board[b.y][b.x] = t; }

    // Initialize without immediate matches
    function fillInitial(){
      for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++){
        do { board[y][x] = newColor(); } while (formsMatchAt(x,y));
      }
    }

    function formsMatchAt(x,y){
      const c = board[y][x];
      // horizontal
      let run=1; for(let i=x-1;i>=0 && board[y][i]===c;i--) run++; for(let i=x+1;i<COLS && board[y][i]===c;i++) run++; if (run>=3) return true;
      // vertical
      run=1; for(let j=y-1;j>=0 && board[j][x]===c;j--) run++; for(let j=y+1;j<ROWS && board[j][x]===c;j++) run++; if (run>=3) return true;
      return false;
    }

    function anyPossibleMove(){
      // Test adjacent swaps for potential match
      for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++){
        const cur={x,y};
        const neigh=[[1,0],[0,1]]; // right and down
        for(const [dx,dy] of neigh){ const nx=x+dx, ny=y+dy; if(!inb(nx,ny)) continue; const nb={x:nx,y:ny}; swap(cur,nb); const ok = formsMatchAt(x,y)||formsMatchAt(nx,ny); swap(cur,nb); if(ok) return true; }
      }
      return false;
    }

    function findMatches(){
      const mark = Array.from({length:ROWS}, ()=>Array(COLS).fill(false));
      const groups = []; // [{cells:[[x,y],...], len}]
      // horizontal
      for(let y=0;y<ROWS;y++){
        let x=0; while(x<COLS){
          const c = board[y][x]; let k=x+1; while(k<COLS && board[y][k]===c) k++;
          const len = k-x; if (len>=3){ for(let i=x;i<k;i++) mark[y][i]=true; groups.push({ len, dir:'h', y, x0:x, x1:k-1 }); }
          x = k;
        }
      }
      // vertical
      for(let x=0;x<COLS;x++){
        let y=0; while(y<ROWS){
          const c = board[y][x]; let k=y+1; while(k<ROWS && board[k][x]===c) k++;
          const len = k-y; if (len>=3){ for(let j=y;j<k;j++) mark[j][x]=true; groups.push({ len, dir:'v', x, y0:y, y1:k-1 }); }
          y = k;
        }
      }
      // collect cells marked
      const cells = [];
      for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++) if(mark[y][x]) cells.push([x,y]);
      return { cells, groups };
    }

    const baseExp = (len)=> (len>=5?10 : len===4?3 : 1);

    function delay(ms){ return new Promise(res=>setTimeout(res,ms)); }
    async function resolveChains(){
      let chain = 0; let awardedTotal = 0; let clearedTotal=0;
      while(true){
        const {cells, groups} = findMatches();
        if (cells.length===0) break;
        chain++;
        // chain popup near cursor (or last click)
        const chainText = text('popup.chain', () => `${chain}連鎖！`, { chain });
        try {
          if (window && window.showTransientPopupAt) window.showTransientPopupAt(lastClickPos.x, lastClickPos.y, chainText, { variant:'combo', level: chain });
          else if (window && window.showMiniExpBadge) window.showMiniExpBadge(chainText, { variant:'combo', level: chain });
        } catch {}
        // flash highlight
        ctx.save(); ctx.globalAlpha=0.35; ctx.fillStyle='#fde68a';
        for(const [x,y] of cells){ const px=PAD+x*CELL, py=PAD+24+y*CELL; ctx.fillRect(px+2,py+2,CELL-4,CELL-4); }
        ctx.restore();
        await delay(90);
        // award EXP per chain with 1.5^(chain-1)
        let base = 0; for(const g of groups) base += baseExp(g.len);
        const mult = Math.pow(1.5, chain-1);
        const exp = base * mult;
        awardXp && awardXp(exp, { chain, base }); awardedTotal += exp;
        // shrink animation before clear
        const set = new Set(cells.map(([x,y])=>`${x},${y}`));
        for (let t=0;t<=1.001;t+=0.16){
          ctx.fillStyle = '#0b1220'; ctx.fillRect(0,0,W,H); draw();
          const s = 1 - t;
          for(const [x,y] of cells){ const px=PAD+x*CELL, py=PAD+24+y*CELL; const cx=px+CELL/2, cy=py+CELL/2; ctx.save(); ctx.translate(cx,cy); ctx.scale(s,s); ctx.translate(-cx,-cy); ctx.fillStyle='#94a3b8'; ctx.fillRect(px+4,py+4,CELL-8,CELL-8); ctx.restore(); }
          await delay(28);
        }
        // clear
        for(const [x,y] of cells) { board[y][x] = -1; }
        clearedTotal += cells.length;
        draw();
        await delay(60);
        // collapse columns
        // compute moves and animate falling
        const moves=[]; // {color, fromY, toY, x}
        for(let x=0;x<COLS;x++){
          let write = ROWS-1;
          for(let y=ROWS-1;y>=0;y--){
            if(board[y][x]>=0){ if (write!==y){ moves.push({ color: board[y][x], x, fromY: y, toY: write }); } board[write][x]=board[y][x]; write--; }
          }
          for(let y=write;y>=0;y--) board[y][x] = -1;
        }
        // fall animation
        const frames=8; for(let f=1; f<=frames; f++){
          draw();
          const p = f/frames;
          for(const m of moves){ const px=PAD+m.x*CELL, sy=PAD+24+m.fromY*CELL, ty=PAD+24+m.toY*CELL; const y = sy + (ty-sy)*p; ctx.fillStyle = hue(m.color); ctx.fillRect(px+4, y+4, CELL-8, CELL-8); }
          await delay(20);
        }
        draw(); await delay(60);
        // refill
        const drops=[]; // {color,x, fromY, toY}
        for(let x=0;x<COLS;x++) for(let y=0;y<ROWS;y++) if(board[y][x]<0){ const c=newColor(); board[y][x]=c; drops.push({ color:c, x, fromY: -rnd(3)-1, toY: y }); }
        const frames2=10; for(let f=1; f<=frames2; f++){
          draw();
          const p=f/frames2;
          for(const d of drops){ const px=PAD+d.x*CELL, sy=PAD+24+d.fromY*CELL, ty=PAD+24+d.toY*CELL; const y = sy + (ty-sy)*p; ctx.fillStyle=hue(d.color); ctx.fillRect(px+4, y+4, CELL-8, CELL-8); }
          await delay(18);
        }
        draw(); await delay(60);
      }
      totalCleared += clearedTotal;
      return { chains: chain, exp: awardedTotal, tiles: clearedTotal };
    }

    function draw(){
      ctx.fillStyle = '#0b1220'; ctx.fillRect(0,0,W,H);
      ctx.fillStyle = '#e2e8f0'; ctx.font='12px system-ui,sans-serif';
      const titleLabel = text('hud.title', 'Match-3');
      const difficultyLabel = text(`difficulty.${diff.toLowerCase()}`, () => diff, { difficulty: diff });
      const clearedLabel = text('hud.cleared', 'Cleared');
      const clearedValue = formatNumber(totalCleared, { maximumFractionDigits: 0 });
      const statusText = text('hud.status', () => `${titleLabel} | ${difficultyLabel} | ${clearedLabel}: ${clearedValue}`, {
        title: titleLabel,
        difficulty: difficultyLabel,
        difficultyKey: diff,
        clearedLabel,
        tiles: clearedValue,
        rawTiles: totalCleared,
      });
      ctx.fillText(statusText, 8, 18);
      for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++){
        const val = board[y][x]; const px = PAD + x*CELL; const py = PAD + 24 + y*CELL;
        if (val<0) { ctx.fillStyle='rgba(148,163,184,0.2)'; ctx.fillRect(px+4,py+4,CELL-8,CELL-8); continue; }
        ctx.fillStyle = hue(val);
        ctx.fillRect(px+4, py+4, CELL-8, CELL-8);
      }
      if (sel){
        const px = PAD + sel.x*CELL; const py = PAD + 24 + sel.y*CELL;
        ctx.strokeStyle='#fde68a'; ctx.lineWidth=3; ctx.strokeRect(px+2,py+2,CELL-4,CELL-4);
      }
    }

    if (!detachLocale && localization && typeof localization.onChange === 'function'){
      detachLocale = localization.onChange(() => {
        try { draw(); } catch {}
      });
    }

    function cellAt(mx,my){
      const x = Math.floor((mx - PAD) / CELL);
      const y = Math.floor((my - PAD - 24) / CELL);
      if (!inb(x,y)) return null; return {x,y};
    }

    function trySwap(a,b){
      swap(a,b);
      const ok = findMatches().cells.length>0;
      if (!ok) swap(a,b);
      return ok;
    }

    async function onClick(e){
      const r = canvas.getBoundingClientRect(); const p = cellAt(e.clientX - r.left, e.clientY - r.top);
      if (!p) return; e.preventDefault();
      lastClickPos = { x: e.clientX - r.left, y: e.clientY - r.top };
      if (!sel){ sel = p; draw(); return; }
      const dx = Math.abs(p.x - sel.x), dy = Math.abs(p.y - sel.y);
      if (dx + dy !== 1){ sel = p; draw(); return; }
      // attempt swap
      const a = sel, b = p; sel = null;
      if (trySwap(a,b)){
        draw();
        await resolveChains();
        // ensure at least one move exists; if not, reshuffle
        if (!anyPossibleMove()){ reshuffle(); }
      }
      draw();
    }

    function reshuffle(){
      // naive reshuffle until there is a move and no immediate matches
      let tries = 0;
      do {
        for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++) board[y][x]=newColor();
        tries++;
        if (tries>200) break;
      } while(findMatches().cells.length>0 || !anyPossibleMove());
    }

    function start(){ if (!running){ running=true; fillInitial(); if(!anyPossibleMove()) reshuffle(); canvas.addEventListener('click', onClick, { passive:false }); draw(); } }
    function stop(){ if (running){ running=false; canvas.removeEventListener('click', onClick); } }
    function destroy(){
      try{ stop(); root && root.removeChild(canvas); }catch{}
      if (detachLocale){
        try { detachLocale(); } catch {}
        detachLocale = null;
      }
    }
    function getScore(){ return totalCleared; }

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({ id:'match3', name:'マッチ3', nameKey: 'selection.miniexp.games.match3.name', description:'3:+1 / 4:+3 / 5:+10、連鎖×1.5', descriptionKey: 'selection.miniexp.games.match3.description', categoryIds: ['puzzle'], create });
})();

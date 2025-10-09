(function(){
  /** MiniExp: Pacman-like (v0.1.0) */
  function create(root, awardXp, opts){
    const difficulty = (opts && opts.difficulty) || 'NORMAL';
    const shortcuts = opts?.shortcuts;
    const localization = opts?.localization || (typeof window !== 'undefined' && typeof window.createMiniGameLocalization === 'function'
      ? window.createMiniGameLocalization({ id: 'pacman' })
      : null);
    const text = (key, fallback, params) => {
      if (localization && typeof localization.t === 'function') {
        return localization.t(key, fallback, params);
      }
      if (typeof fallback === 'function') return fallback();
      return fallback ?? '';
    };
    const detachLocale = localization && typeof localization.onChange === 'function'
      ? localization.onChange(() => { try { draw(); } catch {} })
      : null;
    const G = 18; // tile size px (scaled later)
    const layout = [
      '#####################',
      '#.........#.........#',
      '#.###.###.#.###.###.#',
      '#o###.###.#.###.###o#',
      '#...................#',
      '#.###.#.#####.#.###.#',
      '#.....#...#...#.....#',
      '#####.### # ###.#####',
      '    #.#   G   #.#    ',
      '#####.# ## ## #.#####',
      '#.........#.........#',
      '#.###.###.#.###.###.#',
      '#o..#.....P.....#..o#',
      '###.#.#.#####.#.#.###',
      '#.....#...#...#.....#',
      '#.#######.#.#######.#',
      '#...................#',
      '#####################'
    ];
    const H = layout.length, W = layout[0].length;
    const canvas = document.createElement('canvas');
    const scale = Math.max(1, Math.floor(Math.min((root.clientWidth||600)/ (W*G), 2)));
    canvas.width = W*G*scale; canvas.height = H*G*scale; canvas.style.display='block'; canvas.style.margin='0 auto'; canvas.style.borderRadius='6px';
    root.appendChild(canvas); const ctx = canvas.getContext('2d'); ctx.imageSmoothingEnabled=false;

    let pellets = new Set();
    let ghosts = []; // {x,y,dir}
    let pac = { x:0, y:0, dir: {x:1,y:0}, next:{x:1,y:0}, speed: 4.0 };
    let lives = (difficulty==='HARD'?2:3);
    let running=false, ended=false, raf=0, last=0;
    let eaten = 0; // for score

    function disableHostRestart(){
      shortcuts?.disableKey('r');
    }

    function enableHostRestart(){
      shortcuts?.enableKey('r');
    }

    // parse map
    function isWall(x,y){ if(x<0||x>=W||y<0||y>=H) return true; return layout[y][x]==='#'; }
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){
      const ch = layout[y][x];
      if (ch==='.'||ch==='o') pellets.add(`${x},${y}`);
      if (ch==='P'){ pac.x=x+0.5; pac.y=y+0.5; }
      if (ch==='G'){ ghosts.push({ x:x+0.5, y:y+0.5, dir:{x:0,y:1}, speed:(difficulty==='HARD'?3.6:(difficulty==='EASY'?2.8:3.2)) }); }
    }

    function draw(){
      ctx.fillStyle='#0b1020'; ctx.fillRect(0,0,canvas.width,canvas.height);
      const s = G*scale;
      // draw walls and pellets
      for(let y=0;y<H;y++) for(let x=0;x<W;x++){
        if(layout[y][x]==='#'){ ctx.fillStyle='#1f2937'; ctx.fillRect(x*s,y*s,s,s); }
      }
      ctx.fillStyle='#fde68a'; pellets.forEach(key=>{ const [x,y]=key.split(',').map(Number); ctx.beginPath(); ctx.arc((x+0.5)*s,(y+0.5)*s, s*0.07, 0, Math.PI*2); ctx.fill(); });
      // pac
      ctx.fillStyle='#facc15'; ctx.beginPath(); ctx.arc(pac.x*s, pac.y*s, s*0.35, 0, Math.PI*2); ctx.fill();
      // ghosts
      ctx.fillStyle='#f87171'; ghosts.forEach(g=>{ ctx.fillRect((g.x-0.4)*s,(g.y-0.4)*s,s*0.8,s*0.8); });
      // UI
      const livesLabel = text('hud.livesLabel', 'LIVES');
      const pelletsLabel = text('hud.pelletsLabel', 'PELLETS');
      const statusText = text(
        'hud.statusTemplate',
        () => `${livesLabel}:${lives}  ${pelletsLabel}:${eaten}/${pellets.size+eaten}`,
        {
          livesLabel,
          pelletsLabel,
          lives,
          pelletsCollected: eaten,
          pelletsRemaining: pellets.size,
          pelletsTotal: pellets.size + eaten,
        }
      );
      ctx.fillStyle='#cbd5e1'; ctx.font=`${Math.floor(12*scale)}px system-ui,sans-serif`; ctx.fillText(statusText, 6, 12*scale);
      if (ended){
        const overlayTitle = text('overlay.title', 'Game Over');
        const restartHint = text('overlay.restartHint', 'Rで再開/再起動');
        ctx.fillStyle='rgba(0,0,0,0.45)'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.fillStyle='#f8fafc'; ctx.font=`bold ${18*scale}px system-ui,sans-serif`; ctx.textAlign='center'; ctx.fillText(overlayTitle, canvas.width/2, canvas.height/2-6*scale); ctx.font=`${10*scale}px system-ui,sans-serif`; ctx.fillText(restartHint, canvas.width/2, canvas.height/2+12*scale); ctx.textAlign='start';
      }
    }

    function step(dt){
      const s = pac.speed * dt;
      // try turn
      if (!blocked(pac.x, pac.y, pac.next)) pac.dir = pac.next;
      // move step on grid with collision
      const nx = pac.x + pac.dir.x * s; const ny = pac.y + pac.dir.y * s;
      if (!blocked(nx, ny, {x:0,y:0})) { pac.x=wrapX(nx); pac.y=ny; }
      // pellet check
      const tx = Math.floor(pac.x), ty = Math.floor(pac.y); const key=`${tx},${ty}`; if (pellets.has(key)){ pellets.delete(key); eaten++; awardXp(0.5, { type:'pellet' }); if (pellets.size===0){ awardXp(100, { type:'clear' }); finishGame(); } }
      // ghosts movement: chase or random at intersections
      ghosts.forEach(g=>{
        const sp = g.speed * dt; const choices = dirs().filter(d=>!isWall(Math.floor(g.x + d.x*0.51), Math.floor(g.y + d.y*0.51)));
        if (Math.random()<0.1 || choices.length>2){ // retarget sometimes or at junction
          // simple chase: choose dir minimizing distance to pac
          let best=g.dir, bestd=1e9; choices.forEach(d=>{ const dx=(g.x + d.x - pac.x), dy=(g.y + d.y - pac.y); const dd=dx*dx+dy*dy; if (dd<bestd) {bestd=dd; best=d;} }); g.dir = best;
        } else if (isWall(Math.floor(g.x + g.dir.x*0.51), Math.floor(g.y + g.dir.y*0.51))) {
          g.dir = choices[(Math.random()*choices.length)|0] || {x:0,y:0};
        }
        g.x = wrapX(g.x + g.dir.x * sp); g.y += g.dir.y * sp;
      });
      // collision pac-ghost
      for(const g of ghosts){ if (Math.abs(g.x - pac.x) < 0.6 && Math.abs(g.y - pac.y) < 0.6){ lives--; if(lives<=0){ finishGame(); } else { resetToStart(); } break; } }
    }

    function wrapX(x){ if (x<0) return W+x; if (x>W) return x-W; return x; }
    function dirs(){ return [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}]; }
    function blocked(x,y,dir){ const nx = x + dir.x*0.51, ny = y + dir.y*0.51; return isWall(Math.floor(nx), Math.floor(ny)); }
    function resetToStart(){ for(let y=0;y<H;y++) for(let x=0;x<W;x++){ if(layout[y][x]==='P'){ pac.x=x+0.5; pac.y=y+0.5; pac.dir={x:1,y:0}; pac.next={x:1,y:0}; } if(layout[y][x]==='G'){ ghosts.forEach((g,i)=>{ if(i===0){ g.x=x+0.5; g.y=y+0.5; g.dir={x:0,y:1}; }}); } } }

    function finishGame(){
      if (!ended){
        ended = true;
        enableHostRestart();
      }
      running = false;
    }

    function onKey(e){ if(e.code.startsWith('Arrow')){ e.preventDefault(); const m = {ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0},ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1}}[e.code]; pac.next=m; } if((e.key==='r'||e.key==='R') && !running){ restart(); } }
    function loop(t){ const now=t*0.001; const dt=Math.min(0.033, now-(last||now)); last=now; if(running){ step(dt); draw(); raf=requestAnimationFrame(loop);} }
    function start(){ if(running) return; running=true; disableHostRestart(); raf=requestAnimationFrame(loop); }
    function stop(opts = {}){ if(!running) return; running=false; cancelAnimationFrame(raf); if(!opts.keepShortcutsDisabled){ enableHostRestart(); } }
    function destroy(){ try{ stop(); canvas.remove(); document.removeEventListener('keydown', onKey); detachLocale && detachLocale(); }catch{} }
    function restart(){ stop({ keepShortcutsDisabled: true }); // rebuild pellets
      pellets.clear(); eaten=0; ghosts.length=0; for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const ch = layout[y][x]; if(ch==='.'||ch==='o') pellets.add(`${x},${y}`); if (ch==='G') ghosts.push({ x:x+0.5, y:y+0.5, dir:{x:0,y:1}, speed:(difficulty==='HARD'?3.6:(difficulty==='EASY'?2.8:3.2)) }); if(ch==='P'){ pac.x=x+0.5; pac.y=y+0.5; pac.dir={x:1,y:0}; pac.next={x:1,y:0}; }} lives=(difficulty==='HARD'?2:3); ended=false; start(); }
    function getScore(){ return eaten; }

    document.addEventListener('keydown', onKey, { passive:false });
    draw();
    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({ id:'pacman', name:'パックマン風', nameKey: 'selection.miniexp.games.pacman.name', description:'餌+0.5 / 全取得+100', descriptionKey: 'selection.miniexp.games.pacman.description', categoryIds: ['action'], create });
})();


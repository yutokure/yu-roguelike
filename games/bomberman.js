(function(){
  /** MiniExp: Bomberman-like (v0.1.0) */
  function create(root, awardXp, opts){
    const difficulty = (opts && opts.difficulty) || 'NORMAL';
    const shortcuts = opts?.shortcuts;
    const localization = opts?.localization || (typeof window !== 'undefined' && typeof window.createMiniGameLocalization === 'function'
      ? window.createMiniGameLocalization({ id: 'bomberman' })
      : null);
    const text = (key, fallback, params) => {
      if (localization && typeof localization.t === 'function') {
        return localization.t(key, fallback, params);
      }
      if (typeof fallback === 'function') return fallback();
      return fallback ?? '';
    };
    const formatNumber = (value, options) => {
      if (localization && typeof localization.formatNumber === 'function') {
        try { return localization.formatNumber(value, options); } catch {}
      }
      if (typeof Intl !== 'undefined' && typeof Intl.NumberFormat === 'function') {
        try { return new Intl.NumberFormat(undefined, options).format(value); } catch {}
      }
      if (value && typeof value.toLocaleString === 'function') {
        try { return value.toLocaleString(); } catch {}
      }
      return String(value ?? '');
    };
    const detachLocale = localization && typeof localization.onChange === 'function'
      ? localization.onChange(() => { try { draw(); } catch {} })
      : null;
    const TILE = 36; // base tile px before scaling
    const layout = [
      '#############',
      '#...........#',
      '#.#.#.#.#.#.#',
      '#...........#',
      '#.#.#.#.#.#.#',
      '#...........#',
      '#.#.#.#.#.#.#',
      '#...........#',
      '#.#.#.#.#.#.#',
      '#...........#',
      '#############',
    ];
    const H = layout.length, W = layout[0].length;

    const canvas = document.createElement('canvas');
    const scale = Math.max(1, Math.floor(Math.min((root.clientWidth||640) / (W*TILE), 1.5)));
    canvas.width = W*TILE*scale; canvas.height = H*TILE*scale;
    canvas.style.display='block'; canvas.style.margin='0 auto'; canvas.style.borderRadius='8px';
    root.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const rand = mulberry32(Date.now() & 0xffffffff);
    const softBlocks = new Set();
    // Fill random destructible blocks except safe spawn area
    for(let y=1;y<H-1;y++){
      for(let x=1;x<W-1;x++){
        if(layout[y][x]==='.' && !isSafe(x,y)){
          if(rand() < (difficulty==='HARD'?0.75:(difficulty==='EASY'?0.45:0.6))){
            softBlocks.add(key(x,y));
          }
        }
      }
    }

    const players = [{
      x:1, y:1, dir:{x:0,y:0}, speed: (difficulty==='HARD'?3.1:(difficulty==='EASY'?2.4:2.7)),
      bombs: (difficulty==='HARD'?1:2), maxRange: (difficulty==='EASY'?3:2), alive:true,
    }];
    const enemies = [];
    spawnEnemies(difficulty);

    const bombs = [];
    const blasts = [];

    let lives = (difficulty==='HARD'?2:3);
    let running = false, ended=false, raf=0, last=0;
    let score = 0;

    const keyState = new Set();
    document.addEventListener('keydown', onKeyDown, { passive:false });
    document.addEventListener('keyup', onKeyUp);

    draw();

    function disableHostRestart(){
      shortcuts?.disableKey('r');
    }
    function enableHostRestart(){
      shortcuts?.enableKey('r');
    }

    function onKeyDown(e){
      if(e.code.startsWith('Arrow') || e.code==='Space') e.preventDefault();
      keyState.add(e.code);
      if((e.code==='KeyR' || e.key==='r' || e.key==='R') && !running){ restart(); }
      if(e.code==='Space' || e.key===' '){ placeBomb(players[0]); }
    }
    function onKeyUp(e){ keyState.delete(e.code); }

    function placeBomb(p){
      if(!p.alive) return;
      const active = bombs.filter(b=>b.owner===p).length;
      if(active >= p.bombs) return;
      const bx = Math.round(p.x);
      const by = Math.round(p.y);
      if(isBlockedForBomb(bx,by)) return;
      bombs.push({ x:bx, y:by, timer:2.3, owner:p, passThrough:0.25, range:p.maxRange });
    }

    function spawnEnemies(level){
      const count = level==='HARD'?5:(level==='EASY'?3:4);
      const speed = level==='HARD'?1.8:(level==='EASY'?1.2:1.4);
      let placed=0; let tries=0;
      while(placed<count && tries<200){
        tries++;
        const x = 1 + (rand()*(W-2))|0;
        const y = 1 + (rand()*(H-2))|0;
        if(isBlocked(x,y) || softBlocks.has(key(x,y)) || distance(x,y,players[0].x,players[0].y)<3) continue;
        enemies.push({ x:x+0.5, y:y+0.5, dir:randomDir(), speed:speed*(0.8+rand()*0.4), alive:true });
        placed++;
      }
    }

    function isWall(x,y){ if(x<0||y<0||x>=W||y>=H) return true; return layout[y][x]==='#'; }
    function isSolid(x,y){ return isWall(x,y) || softBlocks.has(key(x,y)); }
    function isBlocked(x,y){
      return isSolid(Math.floor(x), Math.floor(y));
    }
    function isBlockedForBomb(x,y){
      if(isWall(x,y)) return true;
      if(softBlocks.has(key(x,y))) return true;
      return bombs.some(b=>b.x===x && b.y===y);
    }
    function key(x,y){ return `${x},${y}`; }
    function isSafe(x,y){
      if((x===1&&y===1)||(x===1&&y===2)||(x===2&&y===1)) return true;
      if((x===W-2&&y===H-2)||(x===W-2&&y===H-3)||(x===W-3&&y===H-2)) return true;
      return false;
    }
    function distance(ax,ay,bx,by){ const dx=ax-bx, dy=ay-by; return Math.sqrt(dx*dx+dy*dy); }
    function randomDir(){ return [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}][(rand()*4)|0]; }

    function update(dt){
      const player = players[0];
      if(player.alive){
        let dir = {x:0,y:0};
        if(keyState.has('ArrowLeft')) dir.x -= 1;
        if(keyState.has('ArrowRight')) dir.x += 1;
        if(keyState.has('ArrowUp')) dir.y -= 1;
        if(keyState.has('ArrowDown')) dir.y += 1;
        const len = Math.hypot(dir.x, dir.y);
        if(len>0){ dir.x/=len; dir.y/=len; }
        const sp = player.speed * dt;
        const nx = player.x + dir.x * sp;
        const ny = player.y + dir.y * sp;
        if(!collides(nx, player.y, player)) player.x = clamp(nx, 0.5, W-1.5);
        if(!collides(player.x, ny, player)) player.y = clamp(ny, 0.5, H-1.5);
        player.dir = dir;
      }

      bombs.forEach(b=>{
        b.timer -= dt;
        b.passThrough -= dt;
      });
      for(let i=bombs.length-1;i>=0;i--){
        if(bombs[i].timer<=0){
          triggerExplosion(bombs[i]);
          bombs.splice(i,1);
        }
      }

      for(let i=blasts.length-1;i>=0;i--){
        blasts[i].timer -= dt;
        if(blasts[i].timer<=0){ blasts.splice(i,1); }
      }

      enemies.forEach(enemy=>{
        if(!enemy.alive) return;
        const sp = enemy.speed * dt;
        const nx = enemy.x + enemy.dir.x * sp;
        const ny = enemy.y + enemy.dir.y * sp;
        if(collides(nx, enemy.y, enemy)){ enemy.dir = chooseEnemyDir(enemy); }
        else enemy.x = nx;
        if(collides(enemy.x, ny, enemy)){ enemy.dir = chooseEnemyDir(enemy); }
        else enemy.y = ny;
      });

      handleInteractions();
    }

    function chooseEnemyDir(enemy){
      const options = [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}].filter(d=>{
        const nx = enemy.x + d.x*0.6;
        const ny = enemy.y + d.y*0.6;
        return !collides(nx, ny, enemy);
      });
      if(options.length===0) return {x:0,y:0};
      return options[(rand()*options.length)|0];
    }

    function clamp(v,min,max){ return Math.max(min, Math.min(max,v)); }

    function collides(x, y, entity){
      const half = 0.35;
      const left = Math.floor(x-half), right=Math.floor(x+half);
      const top = Math.floor(y-half), bottom=Math.floor(y+half);
      for(let yy=top; yy<=bottom; yy++){
        for(let xx=left; xx<=right; xx++){
          if(isWall(xx,yy)) return true;
          if(softBlocks.has(key(xx,yy))) return true;
          if(bombs.some(b=>b.x===xx && b.y===yy && !(entity===b.owner && b.passThrough>0))) return true;
        }
      }
      return false;
    }

    function triggerExplosion(bomb){
      const dirs = [{x:0,y:0},{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}];
      dirs.forEach(dir=>{
        for(let r=0;r<=bomb.range;r++){
          const tx = bomb.x + dir.x * r;
          const ty = bomb.y + dir.y * r;
          if(isWall(tx,ty)) break;
          blasts.push({ x:tx, y:ty, timer:0.35 });
          const k = key(tx,ty);
          if(softBlocks.has(k)){
            softBlocks.delete(k);
            awardXp(3, { type:'block' });
            score += 3;
            break;
          }
          // chain reaction
          for(let i=bombs.length-1;i>=0;i--){
            const other=bombs[i];
            if(other!==bomb && other.x===tx && other.y===ty){
              triggerExplosion(other);
              bombs.splice(i,1);
            }
          }
        }
      });
    }

    function handleInteractions(){
      const player = players[0];
      if(player.alive){
        if(isHitByBlast(player.x, player.y)){
          player.alive=false; loseLife();
        }
        enemies.forEach(enemy=>{
          if(enemy.alive && Math.abs(enemy.x-player.x)<0.6 && Math.abs(enemy.y-player.y)<0.6){
            player.alive=false; loseLife();
          }
        });
      }

      enemies.forEach(enemy=>{
        if(!enemy.alive) return;
        if(isHitByBlast(enemy.x, enemy.y)){
          enemy.alive=false;
          awardXp(12, { type:'enemy' });
          score += 12;
        }
      });

      if(enemies.every(e=>!e.alive) && !ended){
        awardXp(75, { type:'clear' });
        score += 75;
        finishGame();
      }
    }

    function isHitByBlast(x,y){
      return blasts.some(blast=>Math.abs(blast.x - Math.round(x))<0.51 && Math.abs(blast.y - Math.round(y))<0.51);
    }

    function loseLife(){
      lives--;
      if(lives<=0){ finishGame(); }
      else{ resetPositions(); }
    }

    function resetPositions(){
      const player = players[0];
      player.x=1; player.y=1; player.alive=true; player.dir={x:0,y:0};
      bombs.length=0; blasts.length=0;
      enemies.forEach(e=>{ e.x=Math.floor(e.x)+0.5; e.y=Math.floor(e.y)+0.5; e.dir=randomDir(); e.alive=true; });
    }

    function draw(){
      ctx.fillStyle='#111827';
      ctx.fillRect(0,0,canvas.width,canvas.height);
      const s = TILE*scale;

      for(let y=0;y<H;y++){
        for(let x=0;x<W;x++){
          const px = x*s, py=y*s;
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(px,py,s,s);
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = Math.max(1, s*0.05);
          ctx.strokeRect(px+0.5,py+0.5,s-1,s-1);
          if(layout[y][x]==='#'){
            ctx.fillStyle='#475569';
            ctx.fillRect(px+2*scale,py+2*scale,s-4*scale,s-4*scale);
          } else if(softBlocks.has(key(x,y))){
            ctx.fillStyle='#b45309';
            ctx.fillRect(px+4*scale,py+4*scale,s-8*scale,s-8*scale);
          }
        }
      }

      blasts.forEach(blast=>{
        ctx.fillStyle='rgba(248,250,252,0.8)';
        ctx.fillRect(blast.x*s+2*scale, blast.y*s+2*scale, s-4*scale, s-4*scale);
      });

      bombs.forEach(b=>{
        ctx.fillStyle='#facc15';
        ctx.beginPath();
        ctx.arc((b.x+0.5)*s, (b.y+0.5)*s, s*0.25, 0, Math.PI*2);
        ctx.fill();
        ctx.strokeStyle='#f97316';
        ctx.lineWidth = 2*scale;
        ctx.beginPath();
        ctx.arc((b.x+0.5)*s, (b.y+0.5)*s, s*0.32, -Math.PI/2, -Math.PI/2 + (Math.max(0,b.timer)/2.3)*Math.PI*2);
        ctx.stroke();
      });

      enemies.forEach(enemy=>{
        if(!enemy.alive) return;
        ctx.fillStyle='#ef4444';
        ctx.beginPath();
        ctx.arc(enemy.x*s, enemy.y*s, s*0.28, 0, Math.PI*2);
        ctx.fill();
      });

      const player = players[0];
      if(player.alive){
        ctx.fillStyle='#22d3ee';
        ctx.beginPath();
        ctx.arc(player.x*s, player.y*s, s*0.3, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle='#0f172a';
        ctx.beginPath();
        ctx.arc(player.x*s - s*0.08, player.y*s - s*0.05, s*0.05, 0, Math.PI*2);
        ctx.arc(player.x*s + s*0.08, player.y*s - s*0.05, s*0.05, 0, Math.PI*2);
        ctx.fill();
      }

      ctx.fillStyle='#f8fafc';
      ctx.font=`bold ${12*scale}px system-ui, sans-serif`;
      ctx.textAlign='left';
      const aliveEnemies = enemies.filter(e=>e.alive).length;
      const statusText = text('minigame.bomberman.hud.status', () => `LIVES: ${Math.max(0,lives)}  SCORE: ${score}  ENEMIES: ${aliveEnemies}`, {
        lives: formatNumber(Math.max(0,lives)),
        score: formatNumber(score),
        enemies: formatNumber(aliveEnemies),
      });
      ctx.fillText(statusText, 8*scale, 14*scale);
      ctx.font=`${10*scale}px system-ui, sans-serif`;
      const controlsText = text('minigame.bomberman.hud.controls', '操作: 矢印キーで移動 / SPACEで爆弾 / Rで再開');
      ctx.fillText(controlsText, 8*scale, canvas.height-6*scale);

      if(ended){
        ctx.fillStyle='rgba(15,23,42,0.6)';
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle='#f8fafc';
        ctx.textAlign='center';
        ctx.font=`bold ${20*scale}px system-ui, sans-serif`;
        const endTitle = enemies.every(e=>!e.alive)
          ? text('minigame.bomberman.overlay.cleared', 'ステージクリア!')
          : text('minigame.bomberman.overlay.gameOver', 'ゲームオーバー');
        ctx.fillText(endTitle, canvas.width/2, canvas.height/2 - 10*scale);
        ctx.font=`${12*scale}px system-ui, sans-serif`;
        ctx.fillText(text('minigame.bomberman.overlay.restartHint', 'Rで再スタート'), canvas.width/2, canvas.height/2 + 10*scale);
        ctx.textAlign='left';
      }
    }

    function loop(t){
      const now = t*0.001;
      const dt = Math.min(0.033, now - (last||now));
      last = now;
      if(running){
        update(dt);
        draw();
        raf = requestAnimationFrame(loop);
      }
    }

    function start(){ if(running) return; running=true; disableHostRestart(); raf=requestAnimationFrame(loop); }
    function stop(opts={}){ if(!running) return; running=false; cancelAnimationFrame(raf); if(!opts.keepShortcutsDisabled) enableHostRestart(); }
    function destroy(){
      try{
        stop();
        document.removeEventListener('keydown', onKeyDown);
        document.removeEventListener('keyup', onKeyUp);
        canvas.remove();
      }catch{}
      finally {
        try { detachLocale && detachLocale(); } catch {}
      }
    }

    function finishGame(){ if(!ended){ ended=true; enableHostRestart(); } running=false; }

    function restart(){
      stop({ keepShortcutsDisabled: true });
      bombs.length=0; blasts.length=0; score=0; ended=false; lives=(difficulty==='HARD'?2:3);
      players[0].x=1; players[0].y=1; players[0].alive=true;
      softBlocks.clear();
      for(let y=1;y<H-1;y++){
        for(let x=1;x<W-1;x++){
          if(layout[y][x]==='.' && !isSafe(x,y) && rand()< (difficulty==='HARD'?0.75:(difficulty==='EASY'?0.45:0.6))){
            softBlocks.add(key(x,y));
          }
        }
      }
      enemies.length=0; spawnEnemies(difficulty);
      start();
    }

    function getScore(){ return score; }

    return { start, stop, destroy, getScore };
  }

  function mulberry32(a){
    return function(){
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  window.registerMiniGame({ id:'bomberman', name:'ボンバーマン風', nameKey: 'selection.miniexp.games.bomberman.name', description:'ソフトブロック破壊+3 / 敵撃破+12 / 全滅+75', descriptionKey: 'selection.miniexp.games.bomberman.description', categoryIds: ['action'], create });
})();

(function(){
  /** MiniExp: Flappy-style side scroller */
  const BASE_CFG = {
    width: 360,
    height: 480,
    pipeWidth: 60,
    groundHeight: 56,
    gapMargins: 60
  };

  const DIFFICULTY_CFG = {
    EASY:   { gravity: 750, flap: 260, maxFall: 420, scroll: 120, gap: 150, spawnMs: 1600, passXp: 6, comboBonus: 1.5 },
    NORMAL: { gravity: 820, flap: 280, maxFall: 440, scroll: 150, gap: 135, spawnMs: 1450, passXp: 8, comboBonus: 2 },
    HARD:   { gravity: 900, flap: 300, maxFall: 470, scroll: 180, gap: 120, spawnMs: 1250, passXp: 11, comboBonus: 2.5 }
  };

  const warnedTranslationKeys = new Set();

  function translateUi(key, fallbackText, params){
    const computeFallback = () => {
      if (typeof fallbackText === 'function'){
        try {
          const result = fallbackText();
          return typeof result === 'string' ? result : (result ?? '');
        } catch (error){
          if (key && !warnedTranslationKeys.has(key)){
            warnedTranslationKeys.add(key);
            console.warn('[flappy_bird] Failed to evaluate fallback text for', key, error);
          }
          return '';
        }
      }
      return typeof fallbackText === 'string' ? fallbackText : (fallbackText ?? '');
    };

    const i18n = window.I18n;
    if (key && i18n && typeof i18n.t === 'function'){
      try {
        const translated = i18n.t(key, params);
        if (typeof translated === 'string' && translated !== key){
          return translated;
        }
      } catch (error){
        if (!warnedTranslationKeys.has(key)){
          warnedTranslationKeys.add(key);
          console.warn('[flappy_bird] Failed to translate key', key, error);
        }
      }
    }
    return computeFallback();
  }

  function create(root, awardXp, opts){
    const difficulty = (opts && opts.difficulty) || 'NORMAL';
    const cfg = { ...BASE_CFG, ...(DIFFICULTY_CFG[difficulty] || DIFFICULTY_CFG.NORMAL) };

    const canvas = document.createElement('canvas');
    canvas.width = cfg.width;
    canvas.height = cfg.height;
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    canvas.style.borderRadius = '10px';
    canvas.style.background = 'linear-gradient(180deg, #1d4ed8 0%, #0f172a 100%)';
    root.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const bird = { x: cfg.width * 0.28, y: cfg.height * 0.4, vy: 0, w: 34, h: 24 };
    const pipes = [];
    let running = false;
    let ended = false;
    let raf = 0;
    let lastTs = 0;
    let spawnTimer = 0;
    let score = 0;
    let combo = 0;

    function spawnPipe(forceX){
      const range = cfg.height - cfg.groundHeight - cfg.gapMargins * 2 - cfg.gap;
      const gapCenter = cfg.gapMargins + cfg.gap / 2 + Math.random() * Math.max(0, range);
      const posX = forceX != null ? forceX : cfg.width + cfg.pipeWidth;
      pipes.push({ x: posX, gapY: gapCenter, scored:false });
    }

    function awardPassXp(){
      if (!awardXp) return;
      const add = cfg.passXp + Math.max(0, combo - 1) * cfg.comboBonus;
      awardXp(add, { type: 'pass', combo });
      if (window.showTransientPopupAt){
        window.showTransientPopupAt(canvas.width - 70, 50, `+${Math.round(add)}`, { variant:'combo', level: Math.min(6, combo) });
      }
    }

    function fail(){
      if (ended) return;
      ended = true;
      running = false;
      cancelAnimationFrame(raf);
      if (awardXp && score>0){
        awardXp(Math.max(2, Math.round(score * 0.6)), { type:'fail', score });
      }
      draw();
    }

    function update(dtMs){
      const dt = dtMs / 1000;
      bird.vy += cfg.gravity * dt;
      if (bird.vy > cfg.maxFall) bird.vy = cfg.maxFall;
      bird.y += bird.vy * dt;

      if (bird.y + bird.h/2 >= cfg.height - cfg.groundHeight){
        bird.y = cfg.height - cfg.groundHeight - bird.h/2;
        fail();
      }
      if (bird.y - bird.h/2 <= 0){
        bird.y = bird.h/2;
        bird.vy = 0;
      }

      spawnTimer += dtMs;
      if (spawnTimer >= cfg.spawnMs){
        spawnTimer -= cfg.spawnMs;
        spawnPipe();
      }

      const pipeSpeed = cfg.scroll * dt;
      for (let i=pipes.length-1;i>=0;i--){
        const p = pipes[i];
        p.x -= pipeSpeed;
        const pipeLeft = p.x - cfg.pipeWidth / 2;
        const pipeRight = p.x + cfg.pipeWidth / 2;
        if (!p.scored && pipeRight < bird.x - bird.w/2){
          p.scored = true;
          score += 1;
          combo = Math.min(combo + 1, 9);
          awardPassXp();
        }
        const gapTop = p.gapY - cfg.gap / 2;
        const gapBottom = p.gapY + cfg.gap / 2;
        const birdLeft = bird.x - bird.w/2;
        const birdRight = bird.x + bird.w/2;
        const birdTop = bird.y - bird.h/2;
        const birdBottom = bird.y + bird.h/2;
        const intersects = birdRight > pipeLeft && birdLeft < pipeRight && (birdTop < gapTop || birdBottom > gapBottom);
        if (intersects){
          fail();
        }
        if (pipeRight <= -cfg.pipeWidth){
          pipes.splice(i,1);
        }
      }
    }

    function draw(){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      // sky already set by background; draw soft clouds
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      for (let i=0;i<3;i++){
        const x = (i*140 + (Date.now()/25)%140) % canvas.width;
        ctx.beginPath();
        ctx.ellipse(x, 80 + i*40, 42, 18, 0, 0, Math.PI*2);
        ctx.fill();
      }
      // pipes
      ctx.fillStyle = '#16a34a';
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 4;
      for (const p of pipes){
        const x = p.x - cfg.pipeWidth/2;
        const gapTop = p.gapY - cfg.gap / 2;
        const gapBottom = p.gapY + cfg.gap / 2;
        ctx.fillRect(x, 0, cfg.pipeWidth, gapTop);
        ctx.strokeRect(x, 0, cfg.pipeWidth, gapTop);
        const bottomHeight = canvas.height - cfg.groundHeight - gapBottom;
        ctx.fillRect(x, gapBottom, cfg.pipeWidth, bottomHeight);
        ctx.strokeRect(x, gapBottom, cfg.pipeWidth, bottomHeight);
      }
      // bird body
      ctx.save();
      ctx.translate(bird.x, bird.y);
      ctx.rotate(Math.max(-0.5, Math.min(0.6, bird.vy / 400)));
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.ellipse(0, 0, bird.w/2, bird.h/2, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.moveTo(bird.w/2, 0);
      ctx.lineTo(bird.w/2 + 10, -4);
      ctx.lineTo(bird.w/2 + 10, 4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(6, -5, 3, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
      // ground
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, canvas.height - cfg.groundHeight, canvas.width, cfg.groundHeight);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(0, canvas.height - cfg.groundHeight, canvas.width, 6);
      // score
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 32px system-ui, sans-serif';
      ctx.textAlign = 'center';
      const i18n = window.I18n;
      let scoreText = score.toString();
      if (i18n && typeof i18n.formatNumber === 'function'){
        try {
          scoreText = i18n.formatNumber(score);
        } catch {}
      }
      ctx.fillText(scoreText, canvas.width/2, 58);
      ctx.font = '12px system-ui, sans-serif';
      ctx.textAlign = 'left';
      const comboLabel = translateUi(
        'selection.miniexp.games.flappy_bird.ui.combo',
        () => `COMBO ${combo}`,
        { combo }
      );
      ctx.fillText(comboLabel, 16, 28);
      if (!running && !ended){
        ctx.textAlign = 'center';
        const startText = translateUi(
          'selection.miniexp.games.flappy_bird.ui.start',
          'スペース / クリックで開始'
        );
        ctx.fillText(startText, canvas.width/2, canvas.height/2 - 24);
      }
      if (ended){
        ctx.fillStyle = 'rgba(15,23,42,0.58)';
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 26px system-ui, sans-serif';
        const gameOverText = translateUi(
          'selection.miniexp.games.flappy_bird.ui.gameOver',
          'GAME OVER'
        );
        ctx.fillText(gameOverText, canvas.width/2, canvas.height/2 - 12);
        ctx.font = '14px system-ui, sans-serif';
        const restartText = translateUi(
          'selection.miniexp.games.flappy_bird.ui.restart',
          'スペース / R でリスタート'
        );
        ctx.fillText(restartText, canvas.width/2, canvas.height/2 + 16);
        const finalScoreText = translateUi(
          'selection.miniexp.games.flappy_bird.ui.finalScore',
          () => `SCORE ${scoreText}`,
          { score, formattedScore: scoreText }
        );
        ctx.fillText(finalScoreText, canvas.width/2, canvas.height/2 + 40);
      }
    }

    function loop(ts){
      if (!running) return;
      const now = ts;
      if (lastTs === 0) lastTs = now;
      const dt = Math.min(48, now - lastTs);
      lastTs = now;
      update(dt);
      draw();
      raf = requestAnimationFrame(loop);
    }

    function start(){
      if (running) return;
      if (ended) reset(false);
      running = true;
      lastTs = 0;
      raf = requestAnimationFrame(loop);
    }

    function stop(){
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    }

    function reset(drawOnly){
      pipes.length = 0;
      score = 0;
      combo = 0;
      bird.y = cfg.height * 0.4;
      bird.vy = 0;
      ended = false;
      running = false;
      lastTs = 0;
      const spacing = cfg.scroll * (cfg.spawnMs / 1000);
      for (let i=0;i<3;i++){
        const offset = cfg.width + cfg.pipeWidth + i * spacing;
        spawnPipe(offset);
      }
      spawnTimer = 0;
      if (!drawOnly) draw();
    }

    function flap(){
      if (ended){
        reset();
        start();
        return;
      }
      if (!running){
        start();
      }
      bird.vy = -cfg.flap;
    }

    function onKeyDown(e){
      const code = e.code || e.key;
      if (code === 'Space' || e.key === ' '){
        e.preventDefault();
        flap();
      } else if (ended && (e.key === 'r' || e.key === 'R')){
        e.preventDefault();
        reset();
        start();
      }
    }

    function onPointerDown(e){
      e.preventDefault();
      flap();
    }

    document.addEventListener('keydown', onKeyDown, { passive:false });
    canvas.addEventListener('pointerdown', onPointerDown, { passive:false });

    const i18n = window.I18n;
    const detachLocaleListener = (i18n && typeof i18n.onLocaleChanged === 'function')
      ? i18n.onLocaleChanged(() => {
          draw();
        })
      : null;

    function destroy(){
      try {
        stop();
        document.removeEventListener('keydown', onKeyDown);
        canvas.removeEventListener('pointerdown', onPointerDown);
        if (typeof detachLocaleListener === 'function'){
          detachLocaleListener();
        }
        canvas.remove();
      } catch {}
    }

    function getScore(){ return score; }

    reset(true);
    draw();

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({ id:'flappy_bird', name:'フラッピーバード風', nameKey: 'selection.miniexp.games.flappy_bird.name', description:'パイプを抜けるたびにEXP。連続成功でボーナス', descriptionKey: 'selection.miniexp.games.flappy_bird.description', categoryIds: ['action'], create });
})();

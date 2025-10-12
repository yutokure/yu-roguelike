(function(){
  /** MiniExp: Floor Descent Survival (Ceiling chase platformer) */
  const BASE_CFG = {
    width: 480,
    height: 640,
    gravity: 1900,
    moveAcceleration: 1400,
    airAcceleration: 900,
    maxMoveSpeed: 220,
    groundFriction: 0.80,
    airFriction: 0.94,
    jumpVelocity: -660,
    springVelocity: -900,
    maxFallSpeed: 980,
    hitInvuln: 0.6,
    floorHeight: 120,
    conveyorForce: 180,
    conveyorCarry: 42,
    spawnXMargin: 36,
    platformMinWidth: 120,
    platformMaxWidth: 240,
    gapMin: 90,
    gapMax: 150,
    scrollBaseSpeed: 70,
    scrollMaxSpeed: 200,
    scrollAccel: 0.028,
    jumpBuffer: 0.14,
    coyoteTime: 0.12,
    spikeChance: 0.16
  };

  const DIFFICULTY_MODS = {
    EASY:   { scrollBaseSpeed: 58, scrollAccel: 0.018, gapMin: 70, gapMax: 120, conveyorForce: 140, springChance: 0.18, conveyorChance: 0.22, spikeChance: 0.12, xpScale: 0.8 },
    NORMAL: { scrollBaseSpeed: 70, scrollAccel: 0.028, gapMin: 90, gapMax: 150, conveyorForce: 180, springChance: 0.24, conveyorChance: 0.26, spikeChance: 0.16, xpScale: 1.0 },
    HARD:   { scrollBaseSpeed: 82, scrollAccel: 0.036, gapMin: 110, gapMax: 170, conveyorForce: 210, springChance: 0.3, conveyorChance: 0.3, spikeChance: 0.2, xpScale: 1.25 }
  };

  const COLORS = {
    background: '#0f172a',
    platform: '#475569',
    conveyor: '#ea580c',
    spring: '#22d3ee',
    spikePlatform: '#f87171',
    playerBody: '#f97316',
    playerOutline: '#0f172a',
    ceiling: '#cbd5f5',
    ceilingSpikes: '#94a3b8',
    hudText: '#e2e8f0'
  };

  function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }

  function randRange(min, max){ return min + Math.random() * (max - min); }

  function create(root, awardXp, opts){
    const difficulty = (opts && opts.difficulty) || 'NORMAL';
    const cfg = { ...BASE_CFG, ...(DIFFICULTY_MODS[difficulty] || DIFFICULTY_MODS.NORMAL) };

    const i18n = window.I18n;
    function translate(key, fallback, params){
      if (i18n && typeof i18n.t === 'function'){
        try {
          const result = i18n.t(key, params);
          if (typeof result === 'string' && result !== key){
            return result;
          }
        } catch (err) {
          // ignore translation errors and fall back
        }
      }
      if (typeof fallback === 'function'){
        try {
          return fallback();
        } catch (err) {
          return '';
        }
      }
      return fallback ?? '';
    }

    function translateHud(key, fallback, params){
      return translate(`miniexp.games.floor_descent.hud.${key}`, fallback, params);
    }

    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.width = cfg.width + 'px';
    container.style.margin = '0 auto';
    container.style.userSelect = 'none';
    root.appendChild(container);

    const canvas = document.createElement('canvas');
    canvas.width = cfg.width;
    canvas.height = cfg.height;
    canvas.style.display = 'block';
    canvas.style.background = COLORS.background;
    canvas.style.borderRadius = '12px';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const touchPad = document.createElement('div');
    touchPad.style.position = 'absolute';
    touchPad.style.bottom = '8px';
    touchPad.style.left = '0';
    touchPad.style.right = '0';
    touchPad.style.display = 'flex';
    touchPad.style.justifyContent = 'space-around';
    touchPad.style.gap = '12px';
    touchPad.style.pointerEvents = 'none';
    touchPad.style.padding = '0 16px';
    container.appendChild(touchPad);

    function createPadButton(label){
      const btn = document.createElement('div');
      btn.textContent = label;
      btn.style.flex = '1';
      btn.style.maxWidth = '120px';
      btn.style.height = '64px';
      btn.style.borderRadius = '32px';
      btn.style.background = 'rgba(15, 23, 42, 0.55)';
      btn.style.color = '#e2e8f0';
      btn.style.fontWeight = 'bold';
      btn.style.display = 'flex';
      btn.style.alignItems = 'center';
      btn.style.justifyContent = 'center';
      btn.style.fontFamily = 'sans-serif';
      btn.style.fontSize = '18px';
      btn.style.touchAction = 'none';
      btn.style.pointerEvents = 'auto';
      return btn;
    }

    const leftPad = createPadButton('◀');
    const jumpPad = createPadButton('⟳');
    const rightPad = createPadButton('▶');
    touchPad.appendChild(leftPad);
    touchPad.appendChild(jumpPad);
    touchPad.appendChild(rightPad);

    const state = {
      running: false,
      ended: false,
      raf: 0,
      lastTs: 0,
      cameraY: 0,
      depth: 0,
      bestDepth: 0,
      floor: 0,
      bestFloor: 0,
      nextFloorDepth: cfg.floorHeight,
      lives: 5,
      flash: 0,
      springPending: false,
      springBonusChain: 0,
      ceilingY: 40,
      scrollSpeed: cfg.scrollBaseSpeed,
      platforms: [],
      nextPlatformY: 160,
      pendingEvents: [],
      jumpBuffer: 0,
      pause: false
    };

    const player = {
      x: cfg.width * 0.5,
      y: 140,
      w: 32,
      h: 38,
      vx: 0,
      vy: 0,
      onGround: false,
      coyote: 0,
      invuln: 0,
      lastPlatform: null
    };

    const keys = { left:false, right:false, jump:false, jumpPressed:false };

    function reset(){
      state.running = false;
      state.ended = false;
      state.ceilingY = 40;
      state.depth = 0;
      state.floor = 0;
      state.nextFloorDepth = cfg.floorHeight;
      state.lives = 5;
      state.flash = 0;
      state.springPending = false;
      state.springBonusChain = 0;
      state.platforms.length = 0;
      state.pendingEvents.length = 0;
      state.cameraY = 0;
      state.nextPlatformY = 160;
      state.scrollSpeed = cfg.scrollBaseSpeed;
      player.x = cfg.width * 0.5;
      player.y = 140;
      player.vx = 0;
      player.vy = 0;
      player.onGround = false;
      player.coyote = 0;
      player.invuln = 0;
      player.lastPlatform = null;
      spawnInitialPlatforms();
      draw();
    }

    function spawnInitialPlatforms(){
      state.platforms.push({ x: cfg.width * 0.5 - 160, y: 200, width: 320, type: 'solid' });
      state.platforms.push({ x: cfg.width * 0.5 - 180, y: 340, width: 360, type: 'solid' });
      state.nextPlatformY = 460;
      ensurePlatformsAhead();
    }

    function ensurePlatformsAhead(){
      const margin = cfg.height + 160;
      while (state.nextPlatformY < state.cameraY + margin){
        const width = randRange(cfg.platformMinWidth, cfg.platformMaxWidth);
        const x = randRange(cfg.spawnXMargin, cfg.width - cfg.spawnXMargin - width);
        const roll = Math.random();
        let type = 'solid';
        const spikeChance = cfg.spikeChance || 0.16;
        const springChance = cfg.springChance || 0.24;
        const conveyorChance = cfg.conveyorChance || 0.26;
        if (roll < spikeChance){
          type = 'spike';
        } else if (roll < spikeChance + springChance){
          type = 'spring';
        } else if (roll < spikeChance + springChance + conveyorChance) {
          type = 'conveyor';
        }
        const dir = type === 'conveyor' ? (Math.random() < 0.5 ? -1 : 1) : 0;
        state.platforms.push({ x, y: state.nextPlatformY, width, type, dir, phase: 0 });
        state.nextPlatformY += randRange(cfg.gapMin, cfg.gapMax);
      }
    }

    function clearOldPlatforms(){
      const limit = state.cameraY - 200;
      while (state.platforms.length && state.platforms[0].y < limit){
        state.platforms.shift();
      }
    }

    function awardFloorXp(floorNumber){
      if (!awardXp) return;
      const base = 6 + floorNumber * 0.8;
      const gained = base * (cfg.xpScale || 1.0);
      try {
        awardXp(gained, { type: 'floor', floor: floorNumber, difficulty });
        state.pendingEvents.push({ kind: 'xp', value: `+${Math.round(gained)}` });
      } catch {}
    }

    function awardSpringBonus(){
      if (!awardXp) return;
      const chain = state.springBonusChain;
      const bonus = 8 + chain * 2;
      try {
        awardXp(bonus, { type: 'spring_chain', chain: chain + 1, difficulty });
        state.pendingEvents.push({ kind: 'xp', value: `+${Math.round(bonus)}` });
        state.springBonusChain = Math.min(chain + 1, 5);
      } catch {}
    }

    function awardLifeBonus(){
      if (!awardXp) return;
      const bonus = state.lives * 5;
      if (bonus <= 0) return;
      try {
        awardXp(bonus, { type: 'life_bonus', lives: state.lives, difficulty });
      } catch {}
    }

    function start(){
      if (state.running) return;
      state.running = true;
      state.pause = false;
      state.lastTs = performance.now();
      state.raf = requestAnimationFrame(loop);
    }

    function stop(){
      state.running = false;
      cancelAnimationFrame(state.raf);
    }

    function loop(ts){
      if (!state.running) return;
      let dt = (ts - state.lastTs) / 1000;
      if (dt > 0.1) dt = 0.1;
      state.lastTs = ts;
      update(dt);
      draw();
      state.raf = requestAnimationFrame(loop);
    }

    function update(dt){
      state.flash = Math.max(0, state.flash - dt);
      if (player.invuln > 0){
        player.invuln -= dt;
      }

      const steps = Math.max(1, Math.ceil(dt / 0.016));
      const stepDt = dt / steps;

      for (let s = 0; s < steps; s++){
        simStep(stepDt);
      }

      const targetScroll = Math.min(cfg.scrollMaxSpeed, cfg.scrollBaseSpeed + state.depth * (cfg.scrollAccel || 0));
      state.scrollSpeed += (targetScroll - state.scrollSpeed) * Math.min(1, dt * 2.5);
      state.cameraY += state.scrollSpeed * dt;
      state.depth = Math.max(state.depth, player.y - 140);
      state.bestDepth = Math.max(state.bestDepth, state.depth);
      state.floor = Math.max(0, Math.floor(state.depth / cfg.floorHeight));
      state.bestFloor = Math.max(state.bestFloor, state.floor);

      while (state.depth >= state.nextFloorDepth){
        const floorNumber = Math.round(state.nextFloorDepth / cfg.floorHeight);
        awardFloorXp(floorNumber);
        state.nextFloorDepth += cfg.floorHeight;
      }

      ensurePlatformsAhead();
      clearOldPlatforms();
    }

    function simStep(dt){
      const wasOnGround = player.onGround;
      player.onGround = false;
      const accel = keys.left ? -1 : keys.right ? 1 : 0;
      if (accel !== 0){
        const a = (wasOnGround ? cfg.moveAcceleration : cfg.airAcceleration) * accel;
        player.vx += a * dt;
      } else {
        if (wasOnGround){
          player.vx *= Math.pow(cfg.groundFriction, dt * 60);
        } else {
          player.vx *= Math.pow(cfg.airFriction, dt * 60);
        }
      }
      player.vx = clamp(player.vx, -cfg.maxMoveSpeed, cfg.maxMoveSpeed);

      player.vy += cfg.gravity * dt;
      if (player.vy > cfg.maxFallSpeed) player.vy = cfg.maxFallSpeed;

      if (keys.jumpPressed){
        state.jumpBuffer = cfg.jumpBuffer;
        keys.jumpPressed = false;
      } else if (state.jumpBuffer > 0){
        state.jumpBuffer -= dt;
      }

      if (player.onGround){
        player.coyote = cfg.coyoteTime;
      } else if (player.coyote > 0){
        player.coyote -= dt;
      }

      if (state.jumpBuffer > 0 && (player.onGround || player.coyote > 0)){
        player.vy = cfg.jumpVelocity;
        player.onGround = false;
        player.coyote = 0;
        state.jumpBuffer = 0;
      }

      const prevX = player.x;
      const prevY = player.y;
      player.x += player.vx * dt;
      player.y += player.vy * dt;

      if (player.x < player.w / 2){
        player.x = player.w / 2;
        player.vx = 0;
      } else if (player.x > cfg.width - player.w / 2){
        player.x = cfg.width - player.w / 2;
        player.vx = 0;
      }

      const prevBottom = prevY + player.h / 2;
      const currentBottom = player.y + player.h / 2;

      let landedPlatform = null;
      if (player.vy >= 0){
        for (let i = 0; i < state.platforms.length; i++){
          const plat = state.platforms[i];
          const platLeft = plat.x;
          const platRight = plat.x + plat.width;
          const platTop = plat.y;
          if (prevBottom <= platTop && currentBottom >= platTop && player.x + player.w/2 > platLeft && player.x - player.w/2 < platRight){
            landedPlatform = plat;
            player.y = platTop - player.h / 2;
            player.vy = 0;
            player.onGround = plat.type !== 'spring';
            player.coyote = cfg.coyoteTime;
            if (plat.type === 'conveyor'){
              player.vx += plat.dir * (cfg.conveyorForce * dt);
              player.x += plat.dir * cfg.conveyorCarry * dt;
            }
            break;
          }
        }
      }

      if (landedPlatform){
        if (landedPlatform.type === 'spring'){
          player.vy = cfg.springVelocity;
          state.springPending = true;
          state.springBonusChain = 0;
          player.onGround = false;
        } else if (landedPlatform.type === 'spike'){
          if (applyDamage('spike_platform')){
            player.y = landedPlatform.y - player.h / 2;
            player.vy = 240;
            player.onGround = false;
            player.lastPlatform = null;
          }
        } else {
          if (state.springPending){
            awardSpringBonus();
            state.springPending = false;
          }
          player.lastPlatform = landedPlatform;
        }
      }

      state.ceilingY = state.cameraY + 40;
      if (player.y - player.h / 2 <= state.ceilingY + 4){
        if (applyDamage('ceiling')){
          dropToNearestPlatform();
        }
      }

      const topVisible = state.cameraY;
      const bottomVisible = state.cameraY + cfg.height;
      if (player.y + player.h / 2 < topVisible || player.y - player.h / 2 > bottomVisible){
        endGame('scroll');
      }
    }

    function applyDamage(){
      if (player.invuln > 0 || state.ended) return false;
      state.lives -= 1;
      state.flash = 0.4;
      player.invuln = cfg.hitInvuln;
      state.springPending = false;
      player.lastPlatform = null;
      if (state.lives <= 0){
        endGame('damage');
        return false;
      }
      return true;
    }

    function dropToNearestPlatform(){
      let target = null;
      for (const plat of state.platforms){
        if (plat.y > player.y + 10 && player.x + player.w / 2 > plat.x && player.x - player.w / 2 < plat.x + plat.width){
          target = plat;
          break;
        }
      }
      if (target){
        player.y = target.y - player.h / 2 - 1;
        player.vy = 160;
        player.onGround = false;
        if (target.type === 'spring'){
          player.vy = Math.max(player.vy, cfg.springVelocity * -0.25);
        }
      } else {
        player.y += 90;
        player.vy = 220;
        player.onGround = false;
      }
    }

    function endGame(reason){
      if (state.ended) return;
      state.ended = true;
      stop();
      if (state.lives > 0){
        awardLifeBonus();
      }
      draw();
    }

    function draw(){
      ctx.clearRect(0, 0, cfg.width, cfg.height);
      ctx.save();
      ctx.translate(0, -state.cameraY);

      // draw background gradient
      const grad = ctx.createLinearGradient(0, state.cameraY, 0, state.cameraY + cfg.height);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#1e293b');
      ctx.fillStyle = grad;
      ctx.fillRect(0, state.cameraY, cfg.width, cfg.height);

      // draw platforms
      for (const plat of state.platforms){
        const top = plat.y - 12;
        let fill = COLORS.platform;
        if (plat.type === 'conveyor') fill = COLORS.conveyor;
        else if (plat.type === 'spring') fill = COLORS.spring;
        else if (plat.type === 'spike') fill = COLORS.spikePlatform;
        ctx.fillStyle = fill;
        if (ctx.roundRect){
          ctx.beginPath();
          ctx.roundRect(plat.x, plat.y - 12, plat.width, 20, 6);
          ctx.fill();
        } else {
          ctx.fillRect(plat.x, plat.y - 12, plat.width, 20);
        }
        if (plat.type === 'spike'){
          ctx.fillStyle = '#fed7aa';
          const spikes = Math.max(3, Math.floor(plat.width / 22));
          const spikeWidth = plat.width / spikes;
          for (let i = 0; i < spikes; i++){
            const sx = plat.x + i * spikeWidth;
            ctx.beginPath();
            ctx.moveTo(sx, plat.y - 12);
            ctx.lineTo(sx + spikeWidth / 2, plat.y - 2);
            ctx.lineTo(sx + spikeWidth, plat.y - 12);
            ctx.fill();
          }
        }
        if (plat.type === 'conveyor'){
          ctx.strokeStyle = 'rgba(15,23,42,0.35)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          const arrowCount = Math.max(3, Math.floor(plat.width / 40));
          const dir = plat.dir || 1;
          for (let i = 0; i < arrowCount; i++){
            const cx = plat.x + (i + 0.5) * (plat.width / arrowCount);
            const cy = plat.y - 2;
            ctx.moveTo(cx - 10 * dir, cy - 6);
            ctx.lineTo(cx + 10 * dir, cy);
            ctx.lineTo(cx - 10 * dir, cy + 6);
          }
          ctx.stroke();
        } else if (plat.type === 'spring'){
          ctx.strokeStyle = '#0e7490';
          ctx.lineWidth = 3;
          ctx.beginPath();
          const coils = Math.max(3, Math.floor(plat.width / 30));
          const spacing = plat.width / coils;
          for (let i = 0; i < coils; i++){
            const x = plat.x + i * spacing + spacing / 2;
            ctx.moveTo(x - spacing / 2 + 4, plat.y);
            ctx.lineTo(x, plat.y - 8);
            ctx.lineTo(x + spacing / 2 - 4, plat.y);
          }
          ctx.stroke();
        }
      }

      // draw player
      ctx.save();
      ctx.translate(player.x, player.y);
      if (player.invuln > 0){
        const t = (player.invuln * 10) % 1;
        if (t < 0.5) ctx.globalAlpha = 0.5;
      }
      ctx.fillStyle = COLORS.playerBody;
      ctx.strokeStyle = COLORS.playerOutline;
      ctx.lineWidth = 3;
      if (ctx.roundRect){
        ctx.beginPath();
        ctx.roundRect(-player.w/2, -player.h/2, player.w, player.h, 8);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(-player.w/2, -player.h/2, player.w, player.h);
        ctx.strokeRect(-player.w/2, -player.h/2, player.w, player.h);
      }
      ctx.restore();

      // draw ceiling
      ctx.fillStyle = COLORS.ceiling;
      ctx.fillRect(0, state.ceilingY - 14, cfg.width, 30);
      ctx.fillStyle = COLORS.ceilingSpikes;
      const spikeWidth = 32;
      for (let x = 0; x < cfg.width; x += spikeWidth){
        ctx.beginPath();
        ctx.moveTo(x, state.ceilingY - 14);
        ctx.lineTo(x + spikeWidth * 0.5, state.ceilingY + 10);
        ctx.lineTo(x + spikeWidth, state.ceilingY - 14);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();

      // HUD
      ctx.save();
      ctx.fillStyle = state.flash > 0 ? `rgba(220,38,38,${state.flash * 1.8})` : 'transparent';
      if (state.flash > 0){
        ctx.fillRect(0, 0, cfg.width, cfg.height);
      }
      ctx.restore();

      ctx.fillStyle = COLORS.hudText;
      ctx.font = '16px "Segoe UI", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(translateHud('life', 'LIFE'), 16, 16);
      for (let i = 0; i < 5; i++){
        const filled = i < state.lives;
        ctx.fillStyle = filled ? '#f87171' : '#64748b';
        drawHeart(ctx, 16 + i * 24, 36, 10);
      }

      ctx.textAlign = 'right';
      ctx.fillStyle = COLORS.hudText;
      ctx.fillText(
        translateHud('floor', () => `Floor ${state.floor}`, { floor: state.floor }),
        cfg.width - 16,
        16
      );
      ctx.fillText(
        translateHud('best', () => `Best ${state.bestFloor}`, { floor: state.bestFloor }),
        cfg.width - 16,
        36
      );

      // ceiling gauge
      const dist = Math.max(0, (player.y - player.h / 2) - state.ceilingY);
      const gaugeWidth = 160;
      const gaugeX = cfg.width * 0.5 - gaugeWidth / 2;
      const gaugeY = 16;
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.strokeRect(gaugeX, gaugeY, gaugeWidth, 12);
      const ratio = clamp(dist / 180, 0, 1);
      ctx.fillStyle = ratio < 0.33 ? '#f97316' : ratio < 0.66 ? '#facc15' : '#4ade80';
      ctx.fillRect(gaugeX + 1, gaugeY + 1, (gaugeWidth - 2) * ratio, 12 - 2);

      if (state.pendingEvents.length){
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fbbf24';
        let y = 56;
        for (const evt of state.pendingEvents){
          ctx.fillText(evt.value, cfg.width / 2, y);
          y += 18;
        }
        state.pendingEvents.length = 0;
      }

      if (state.ended){
        ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
        ctx.fillRect(0, 0, cfg.width, cfg.height);
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'center';
        ctx.font = '28px "Segoe UI", sans-serif';
        ctx.fillText(
          translateHud('gameOver', 'Game Over'),
          cfg.width / 2,
          cfg.height / 2 - 40
        );
        ctx.font = '18px "Segoe UI", sans-serif';
        ctx.fillText(
          translateHud('reachedFloor', () => `Reached Floor ${state.floor}`, { floor: state.floor }),
          cfg.width / 2,
          cfg.height / 2
        );
        ctx.fillText(
          translateHud('retryHint', 'Press Space to retry'),
          cfg.width / 2,
          cfg.height / 2 + 40
        );
      }
    }

    function drawHeart(ctx, x, y, size){
      ctx.beginPath();
      const topCurveHeight = size * 0.3;
      ctx.moveTo(x, y + topCurveHeight);
      ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
      ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + (size + topCurveHeight) / 1.1, x, y + size);
      ctx.bezierCurveTo(x, y + (size + topCurveHeight) / 1.1, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
      ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
      ctx.fill();
    }

    function onKeyDown(e){
      if (e.repeat) return;
      switch (e.key){
        case 'ArrowLeft': case 'a': case 'A': keys.left = true; break;
        case 'ArrowRight': case 'd': case 'D': keys.right = true; break;
        case 'ArrowUp': case 'w': case 'W': case ' ': keys.jump = true; keys.jumpPressed = true; break;
        case 'Escape':
          if (!state.ended){
            if (state.running){
              stop();
            } else {
              start();
            }
          }
          break;
      }
    }

    function onKeyUp(e){
      switch (e.key){
        case 'ArrowLeft': case 'a': case 'A': keys.left = false; break;
        case 'ArrowRight': case 'd': case 'D': keys.right = false; break;
        case 'ArrowUp': case 'w': case 'W': case ' ': keys.jump = false; break;
      }
      if (state.ended && (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W')){
        reset();
        start();
      }
    }

    function onPointerDown(e){
      e.preventDefault();
      keys.jumpPressed = true;
    }

    function bindPad(btn, key){
      const down = (e)=>{ e.preventDefault(); e.stopPropagation(); keys[key] = true; if (key === 'jump') keys.jumpPressed = true; };
      const up = (e)=>{ e.preventDefault(); e.stopPropagation(); keys[key] = false; };
      btn.addEventListener('pointerdown', down, { passive:false });
      btn.addEventListener('pointerup', up, { passive:false });
      btn.addEventListener('pointerleave', up, { passive:false });
      btn.addEventListener('pointercancel', up, { passive:false });
    }

    bindPad(leftPad, 'left');
    bindPad(jumpPad, 'jump');
    bindPad(rightPad, 'right');

    document.addEventListener('keydown', onKeyDown, { passive:false });
    document.addEventListener('keyup', onKeyUp, { passive:false });
    canvas.addEventListener('pointerdown', onPointerDown, { passive:false });

    function destroy(){
      stop();
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('pointerdown', onPointerDown);
      touchPad.remove();
      canvas.remove();
      container.remove();
    }

    function getScore(){
      return state.floor;
    }

    reset();
    start();

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({ id: 'floor_descent', name: 'フロア降りサバイバル', nameKey: 'selection.miniexp.games.floor_descent.name', description: '迫る針天井から逃げながら下へ進むアクション', descriptionKey: 'selection.miniexp.games.floor_descent.description', categoryIds: ['action'], create });
})();

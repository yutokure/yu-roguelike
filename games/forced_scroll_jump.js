(function(){
  /** MiniExp: 強制横スクロールジャンプゲーム (Forced scroll jumper) */
  const CFG = {
    width: 720,
    height: 360,
    scrollSpeed: 150,
    gravity: 1800,
    jumpVelocity: -640,
    airControl: 0.12,
    groundControl: 0.32,
    groundFriction: 0.86,
    airFriction: 0.96,
    moveSpeed: 220,
    playerWidth: 34,
    playerHeight: 46,
    platformThickness: 22,
    minPlatformLength: 160,
    maxPlatformLength: 280,
    minGap: 70,
    maxGap: 150,
    maxHeightDelta: 70,
    minPlatformY: 150,
    maxPlatformY: 300,
    crumbleChance: 0.18,
    crumbleTime: 1.4,
    crumbleFallSpeed: 280,
    hazardChance: 0.22,
    coinChance: 0.65,
    coinsPerSegment: [1,3],
    happySpawnOffset: [380, 520],
    leftSafeMargin: 90
  };

  const DIFFICULTY_MODS = {
    EASY:   { scrollSpeed: 135, hazardChance: 0.18, crumbleChance: 0.14 },
    NORMAL: { scrollSpeed: 150, hazardChance: 0.22, crumbleChance: 0.18 },
    HARD:   { scrollSpeed: 168, hazardChance: 0.26, crumbleChance: 0.22 }
  };

  const RANKS = [
    { min: 50010, max: Infinity, name: '極めて', bonusXp: 1500 },
    { min: 40010, max: 50000, name: '非常に', bonusXp: 750 },
    { min: 20010, max: 40000, name: 'すごい', bonusXp: 500 },
    { min: 10010, max: 20000, name: 'かなり', bonusXp: 400 },
    { min:  5010, max: 10000, name: 'わりと', bonusXp: 300 },
    { min:  2010, max:  5000, name: 'そこそこ', bonusXp: 200 },
    { min:     0, max:  2000, name: 'まあまあ', bonusXp: 100 }
  ];

  function clamp(v, min, max){
    return Math.max(min, Math.min(max, v));
  }

  function randRange(min, max){
    return min + Math.random() * (max - min);
  }

  function create(root, awardXp, opts){
    const difficulty = (opts && opts.difficulty) || 'NORMAL';
    const cfg = { ...CFG, ...(DIFFICULTY_MODS[difficulty] || DIFFICULTY_MODS.NORMAL) };

    const canvas = document.createElement('canvas');
    canvas.width = cfg.width;
    canvas.height = cfg.height;
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    canvas.style.borderRadius = '12px';
    canvas.style.background = '#020617';
    root.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const state = {
      running: false,
      ended: false,
      raf: 0,
      lastTs: 0,
      cameraX: 0,
      segments: [],
      hazards: [],
      collectibles: [],
      nextSegmentStart: 0,
      lives: 3,
      score: 0,
      scoreXpCursor: 0,
      coinStreak: 0,
      happyPending: false,
      failFlash: 0,
      respawnCooldown: 0
    };

    const player = {
      x: 60,
      y: cfg.minPlatformY - cfg.playerHeight / 2,
      vx: 0,
      vy: 0,
      onGround: false,
      grace: 0,
      animTime: 0
    };

    const keys = { left:false, right:false, jump:false, jumpConsumed:false };

    function reset(){
      state.running = false;
      state.ended = false;
      state.cameraX = 0;
      state.segments.length = 0;
      state.hazards.length = 0;
      state.collectibles.length = 0;
      state.nextSegmentStart = 0;
      state.lives = 3;
      state.score = 0;
      state.scoreXpCursor = 0;
      state.coinStreak = 0;
      state.happyPending = false;
      state.failFlash = 0;
      state.respawnCooldown = 0;
      player.x = 90;
      player.y = cfg.minPlatformY - cfg.playerHeight / 2;
      player.vx = 0;
      player.vy = 0;
      player.onGround = false;
      player.grace = 0;
      player.animTime = 0;
      generateInitialSegments();
      ensureAhead();
      draw();
    }

    function generateInitialSegments(){
      const baseLen = 400;
      const seg = {
        type: 'solid',
        start: 0,
        length: baseLen,
        y: cfg.maxPlatformY,
        thickness: cfg.platformThickness
      };
      state.segments.push(seg);
      state.nextSegmentStart = baseLen;
    }

    function ensureAhead(){
      while (state.nextSegmentStart < state.cameraX + cfg.width * 2){
        const lastSeg = state.segments[state.segments.length-1];
        const createGap = Math.random() < 0.28 && (!lastSeg || lastSeg.type !== 'gap');
        if (createGap){
          const gapLen = randRange(cfg.minGap, cfg.maxGap);
          state.segments.push({ type:'gap', start: state.nextSegmentStart, length: gapLen });
          state.nextSegmentStart += gapLen;
          continue;
        }
        const length = randRange(cfg.minPlatformLength, cfg.maxPlatformLength);
        const prev = getLastPlatform();
        const prevY = prev ? prev.y : cfg.maxPlatformY;
        const y = clamp(prevY + randRange(-cfg.maxHeightDelta, cfg.maxHeightDelta), cfg.minPlatformY, cfg.maxPlatformY);
        const isCrumble = Math.random() < cfg.crumbleChance;
        const seg = {
          type: isCrumble ? 'crumble' : 'solid',
          start: state.nextSegmentStart,
          length,
          y,
          thickness: cfg.platformThickness,
          timer: 0,
          falling: false,
          fallOffset: 0
        };
        state.segments.push(seg);
        spawnHazardsAndCoins(seg);
        state.nextSegmentStart += length;
      }
    }

    function getLastPlatform(){
      for (let i=state.segments.length-1;i>=0;i--){
        if (state.segments[i].type !== 'gap') return state.segments[i];
      }
      return null;
    }

    function spawnHazardsAndCoins(seg){
      const platformTop = seg.y;
      // hazards
      if (Math.random() < cfg.hazardChance){
        const radius = randRange(16, 20);
        const anchorY = platformTop - randRange(60, 110);
        const amplitude = randRange(18, 46);
        const hazard = {
          type: 'ball',
          x: seg.start + randRange(40, Math.max(50, seg.length - 40)),
          baseY: anchorY,
          amp: amplitude,
          phase: Math.random() * Math.PI * 2,
          speed: randRange(1.6, 2.8),
          radius
        };
        state.hazards.push(hazard);
      }
      // coins (CX marks)
      if (Math.random() < cfg.coinChance){
        const count = Math.max(1, Math.round(randRange(cfg.coinsPerSegment[0], cfg.coinsPerSegment[1])));
        for (let i=0;i<count;i++){
          const x = seg.start + randRange(40, Math.max(60, seg.length - 40));
          const y = platformTop - randRange(36, 72);
          state.collectibles.push({ type:'coin', x, y, radius: 14, taken:false });
        }
      }
      if (state.happyPending){
        const offset = randRange(cfg.happySpawnOffset[0], cfg.happySpawnOffset[1]);
        const x = seg.start + Math.min(seg.length - 60, offset);
        if (x > seg.start + 40){
          const y = platformTop - 64;
          state.collectibles.push({ type:'happy', x, y, radius: 20, taken:false });
          state.happyPending = false;
        }
      }
    }

    function updateCollectibles(dt, cameraLeft){
      for (let i=state.collectibles.length-1;i>=0;i--){
        const c = state.collectibles[i];
        if (c.taken){
          state.collectibles.splice(i,1);
          continue;
        }
        if (c.x + 30 < cameraLeft){
          if (c.type === 'coin'){
            state.coinStreak = 0;
          }
          state.collectibles.splice(i,1);
        }
      }
    }

    function updateHazards(dt){
      for (const h of state.hazards){
        if (h.type === 'ball'){
          h.phase += h.speed * dt;
        }
      }
      for (let i=state.hazards.length-1;i>=0;i--){
        const h = state.hazards[i];
        if (h.x + h.radius < state.cameraX - 80){
          state.hazards.splice(i,1);
        }
      }
    }

    function applyScore(delta, reason){
      state.score += delta;
      if (!awardXp) return;
      state.scoreXpCursor += delta;
      const xpGain = Math.floor(state.scoreXpCursor / 10);
      if (xpGain > 0){
        state.scoreXpCursor -= xpGain * 10;
        awardXp(xpGain, { type: 'score', reason });
      }
    }

    function awardBonus(delta, info){
      state.score += delta;
      if (awardXp){
        awardXp(delta / 10, info);
      }
    }

    function playerRect(){
      return {
        left: player.x - cfg.playerWidth / 2,
        right: player.x + cfg.playerWidth / 2,
        top: player.y - cfg.playerHeight / 2,
        bottom: player.y + cfg.playerHeight / 2
      };
    }

    function fail(reason){
      if (state.ended || state.respawnCooldown > 0) return;
      state.lives -= 1;
      state.failFlash = 0.5;
      state.coinStreak = 0;
      state.happyPending = false;
      if (awardXp){
        awardXp( Math.max(1, Math.round(state.score * 0.01)), { type:'miss', reason });
      }
      if (state.lives <= 0){
        endGame();
      } else {
        state.respawnCooldown = 0.8;
        respawnOnSafePlatform();
      }
    }

    function respawnOnSafePlatform(){
      const targetX = state.cameraX + cfg.width * 0.35;
      let seg = findPlatformAt(targetX);
      if (!seg){
        ensureAhead();
        seg = findPlatformAhead(targetX);
      }
      if (!seg){
        player.x = targetX;
        player.y = cfg.minPlatformY - cfg.playerHeight / 2;
      } else {
        player.x = clamp(seg.start + seg.length * 0.3, seg.start + 20, seg.start + seg.length - 20);
        player.y = seg.y - cfg.playerHeight / 2 - (seg.fallOffset || 0);
      }
      player.vx = 0;
      player.vy = 0;
      player.onGround = true;
      player.grace = 0.1;
    }

    function findPlatformAt(x){
      for (const seg of state.segments){
        if (seg.type === 'gap') continue;
        if (x >= seg.start && x <= seg.start + seg.length){
          return seg;
        }
      }
      return null;
    }

    function findPlatformAhead(x){
      let best = null;
      for (const seg of state.segments){
        if (seg.type === 'gap') continue;
        if (seg.start > x){
          best = seg;
          break;
        }
      }
      return best;
    }

    function endGame(){
      state.ended = true;
      state.running = false;
      cancelAnimationFrame(state.raf);
      const result = determineRank(state.score);
      if (awardXp && result){
        awardXp(result.bonusXp, { type:'rank', rank: result.name, score: Math.round(state.score) });
      }
      draw();
    }

    function determineRank(score){
      for (const rank of RANKS){
        if (score >= rank.min && score <= rank.max){
          return rank;
        }
        if (rank.max === Infinity && score >= rank.min){
          return rank;
        }
      }
      return RANKS[RANKS.length-1];
    }

    function update(dtMs){
      const dt = dtMs / 1000;
      state.cameraX += cfg.scrollSpeed * dt;
      state.failFlash = Math.max(0, state.failFlash - dt);
      if (state.respawnCooldown > 0){
        state.respawnCooldown = Math.max(0, state.respawnCooldown - dt);
      }

      ensureAhead();
      updateHazards(dt);
      updateCollectibles(dt, state.cameraX - 40);

      const prevRect = playerRect();

      // controls and physics
      const moveInput = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
      const control = player.onGround ? cfg.groundControl : cfg.airControl;
      const maxSpeed = cfg.moveSpeed;
      const desired = moveInput * maxSpeed;
      player.vx += (desired - player.vx) * control;
      const friction = player.onGround ? cfg.groundFriction : cfg.airFriction;
      player.vx *= friction;

      if (player.onGround){
        player.grace = 0.15;
      } else {
        player.grace = Math.max(0, player.grace - dt);
      }

      if (keys.jump && !keys.jumpConsumed && (player.onGround || player.grace > 0)){
        player.vy = cfg.jumpVelocity;
        player.onGround = false;
        player.grace = 0;
        keys.jumpConsumed = true;
      }

      if (!keys.jump) keys.jumpConsumed = false;

      player.vy += cfg.gravity * dt;
      if (player.vy > 860) player.vy = 860;

      player.x += player.vx * dt;
      player.y += player.vy * dt;
      player.animTime += dt;

      const cameraLeft = state.cameraX - cfg.leftSafeMargin;
      const cameraRight = state.cameraX + cfg.width - 60;

      if (player.x + cfg.playerWidth/2 < cameraLeft){
        fail('scroll_out');
      }

      if (player.x > cameraRight){
        player.x = cameraRight;
        player.vx = Math.min(player.vx, 0);
      }

      player.onGround = false;
      handlePlatforms(prevRect, dt);

      if (player.y - cfg.playerHeight/2 > cfg.height + 80){
        fail('fall');
      }

      handleCollectibleCollisions();
      handleHazardCollisions();

      applyScore(10 * dt, 'time');
    }

    function handlePlatforms(prevRect, dt){
      for (const seg of state.segments){
        if (seg.type === 'gap') continue;
        const segStart = seg.start;
        const segEnd = seg.start + seg.length;
        const segTop = seg.y - (seg.fallOffset || 0);
        if (player.x + cfg.playerWidth/2 < segStart - 20 || player.x - cfg.playerWidth/2 > segEnd + 20){
          continue;
        }
        if (seg.type === 'crumble'){
          if (seg.falling){
            seg.fallOffset += cfg.crumbleFallSpeed * dt;
          }
        }
        const prevBottom = prevRect.bottom;
        const currBottom = player.y + cfg.playerHeight/2;
        if (prevBottom <= segTop && currBottom >= segTop && player.vy >= 0){
          player.y = segTop - cfg.playerHeight/2;
          player.vy = 0;
          player.onGround = true;
          if (seg.type === 'crumble'){
            seg.timer += dt;
            if (seg.timer >= cfg.crumbleTime){
              seg.falling = true;
              seg.timer = cfg.crumbleTime;
              player.onGround = false;
            }
          } else if (seg.timer){
            seg.timer = 0;
          }
        } else if (seg.type === 'crumble'){
          seg.timer = Math.max(0, seg.timer - dt * 0.6);
        }
      }

      for (let i=state.segments.length-1;i>=0;i--){
        const seg = state.segments[i];
        if (seg.start + seg.length < state.cameraX - 200){
          state.segments.splice(i,1);
        }
      }
    }

    function handleCollectibleCollisions(){
      const rect = playerRect();
      for (const c of state.collectibles){
        if (c.taken) continue;
        const dx = (rect.left + rect.right)/2 - c.x;
        const dy = (rect.top + rect.bottom)/2 - c.y;
        const distSq = dx*dx + dy*dy;
        const rad = c.radius + Math.max(cfg.playerWidth, cfg.playerHeight) * 0.25;
        if (distSq <= rad * rad){
          c.taken = true;
          if (c.type === 'coin'){
            state.coinStreak += 1;
            awardBonus(100, { type:'bonus', item:'cx_mark', streak: state.coinStreak });
            if (state.coinStreak >= 30){
              state.happyPending = true;
            }
          } else if (c.type === 'happy'){
            awardBonus(7650, { type:'bonus', item:'happy_man' });
            state.coinStreak = 0;
          }
          if (window.showTransientPopupAt){
            const localX = c.x - state.cameraX;
            window.showTransientPopupAt(localX, Math.max(30, c.y - 20), `+${c.type === 'happy' ? 7650 : 100}`, { variant: c.type === 'happy' ? 'burst' : 'combo', level: Math.min(6, state.coinStreak % 6) });
          }
        }
      }
    }

    function handleHazardCollisions(){
      if (state.respawnCooldown > 0) return;
      const rect = playerRect();
      const centerX = (rect.left + rect.right) / 2;
      const centerY = (rect.top + rect.bottom) / 2;
      for (const h of state.hazards){
        if (h.type === 'ball'){
          const hx = h.x;
          const hy = h.baseY + Math.sin(h.phase) * h.amp;
          const dx = centerX - hx;
          const dy = centerY - hy;
          const distSq = dx*dx + dy*dy;
          const rad = h.radius + Math.max(cfg.playerWidth, cfg.playerHeight) * 0.3;
          if (distSq <= rad * rad){
            fail('hazard');
            break;
          }
        }
      }
    }

    function draw(){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      // background gradient
      const grad = ctx.createLinearGradient(0,0,0,canvas.height);
      grad.addColorStop(0,'#0f172a');
      grad.addColorStop(1,'#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0,0,canvas.width,canvas.height);

      drawStars();
      drawSegments();
      drawHazards();
      drawCollectibles();
      drawPlayer();
      drawHud();

      if (state.ended){
        drawResultOverlay();
      }
    }

    function drawStars(){
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      for (let i=0;i<canvas.width;i+=40){
        const y = (i * 37) % canvas.height;
        ctx.fillRect((i + Math.floor(state.cameraX*0.05)) % canvas.width, y, 2,2);
      }
    }

    function drawSegments(){
      ctx.save();
      const offsetX = state.cameraX;
      for (const seg of state.segments){
        if (seg.type === 'gap') continue;
        const x = seg.start - offsetX;
        const y = seg.y - (seg.fallOffset || 0);
        const w = seg.length;
        const h = seg.thickness;
        ctx.fillStyle = seg.type === 'crumble' ? '#facc15' : '#1e293b';
        ctx.fillRect(x, y, w, h);
        if (seg.type === 'crumble'){
          ctx.fillStyle = '#b45309';
          ctx.fillRect(x, y, w, 4);
        } else {
          ctx.fillStyle = '#0f172a';
          for (let ix=0; ix<w; ix+=22){
            ctx.fillRect(x + ix, y, 12, 4);
          }
        }
      }
      ctx.restore();
    }

    function drawHazards(){
      ctx.save();
      const offsetX = state.cameraX;
      for (const h of state.hazards){
        const hx = h.x - offsetX;
        const hy = h.baseY + Math.sin(h.phase) * h.amp;
        ctx.strokeStyle = 'rgba(148,163,184,0.55)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(hx, hy - h.radius - 28);
        ctx.lineTo(hx, hy - h.radius);
        ctx.stroke();
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(hx, hy, h.radius, 0, Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawCollectibles(){
      ctx.save();
      const offsetX = state.cameraX;
      for (const c of state.collectibles){
        if (c.taken) continue;
        const cx = c.x - offsetX;
        const cy = c.y;
        if (c.type === 'coin'){
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(cx, cy, c.radius, 0, Math.PI*2);
          ctx.fill();
          ctx.strokeStyle = '#fde68a';
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.fillStyle = '#78350f';
          ctx.font = 'bold 14px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('CX', cx, cy);
        } else {
          ctx.fillStyle = '#22d3ee';
          ctx.beginPath();
          ctx.arc(cx, cy, c.radius, 0, Math.PI*2);
          ctx.fill();
          ctx.strokeStyle = '#0ea5e9';
          ctx.lineWidth = 4;
          ctx.stroke();
          ctx.fillStyle = '#f8fafc';
          ctx.font = 'bold 18px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('H', cx, cy);
        }
      }
      ctx.restore();
    }

    function drawPlayer(){
      ctx.save();
      const offsetX = state.cameraX;
      const px = player.x - offsetX;
      const py = player.y;
      const bounce = Math.sin(player.animTime * (player.onGround ? 12 : 6)) * (player.onGround ? 3 : 1);
      ctx.translate(px, py + bounce);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-cfg.playerWidth/2, -cfg.playerHeight/2, cfg.playerWidth, cfg.playerHeight);
      ctx.fillStyle = '#0ea5e9';
      ctx.fillRect(-cfg.playerWidth/2 + 6, -cfg.playerHeight/2 + 8, cfg.playerWidth - 12, cfg.playerHeight - 16);
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(-cfg.playerWidth/2 + 10, -cfg.playerHeight/2 + 12, 10, 10);
      ctx.restore();
      if (state.failFlash > 0){
        ctx.fillStyle = `rgba(239,68,68,${state.failFlash})`;
        ctx.fillRect(0,0,canvas.width,canvas.height);
      }
    }

    function drawHud(){
      ctx.fillStyle = 'rgba(15,23,42,0.75)';
      ctx.fillRect(12, 12, 220, 84);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`スコア: ${Math.floor(state.score)}`, 22, 20);
      ctx.fillText(`CX連続: ${state.coinStreak}`, 22, 44);
      ctx.fillText(`ライフ: ${state.lives}`, 22, 68);
    }

    function drawResultOverlay(){
      const rank = determineRank(state.score);
      ctx.fillStyle = 'rgba(2,6,23,0.78)';
      ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ゲームオーバー', canvas.width/2, canvas.height/2 - 70);
      ctx.font = '24px sans-serif';
      ctx.fillText(`ランク: ${rank.name}`, canvas.width/2, canvas.height/2 - 20);
      ctx.font = '20px sans-serif';
      ctx.fillText(`スコア ${Math.floor(state.score)} / ボーナスXP +${rank.bonusXp}`, canvas.width/2, canvas.height/2 + 20);
      ctx.fillText('スペースかクリックでリスタート', canvas.width/2, canvas.height/2 + 70);
    }

    function gameLoop(ts){
      if (!state.running) return;
      if (!state.lastTs) state.lastTs = ts;
      const dt = Math.min(64, ts - state.lastTs);
      state.lastTs = ts;
      update(dt);
      draw();
      state.raf = requestAnimationFrame(gameLoop);
    }

    function start(){
      if (state.running) return;
      if (state.ended){
        reset();
      }
      state.running = true;
      state.lastTs = 0;
      state.raf = requestAnimationFrame(gameLoop);
    }

    function stop(){
      state.running = false;
      cancelAnimationFrame(state.raf);
    }

    function destroy(){
      stop();
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.remove();
    }

    function getScore(){
      return Math.floor(state.score);
    }

    function onKeyDown(ev){
      if (ev.code === 'ArrowLeft' || ev.code === 'KeyA'){ keys.left = true; }
      if (ev.code === 'ArrowRight' || ev.code === 'KeyD'){ keys.right = true; }
      if (ev.code === 'Space' || ev.code === 'ArrowUp' || ev.code === 'KeyW'){ keys.jump = true; }
      if (!state.running && !state.ended){ start(); }
      if (state.ended && (ev.code === 'Space' || ev.code === 'Enter')){
        reset();
        start();
      }
    }

    function onKeyUp(ev){
      if (ev.code === 'ArrowLeft' || ev.code === 'KeyA'){ keys.left = false; }
      if (ev.code === 'ArrowRight' || ev.code === 'KeyD'){ keys.right = false; }
      if (ev.code === 'Space' || ev.code === 'ArrowUp' || ev.code === 'KeyW'){ keys.jump = false; }
    }

    function onPointerDown(){
      keys.jump = true;
      if (!state.running && !state.ended){
        start();
      } else if (state.ended){
        reset();
        start();
      }
    }

    function onPointerUp(){
      keys.jump = false;
    }

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup', onPointerUp);

    reset();
    draw();

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({
    id: 'forced_scroll_jump',
    name: '強制スクロールジャンプ', nameKey: 'selection.miniexp.games.forced_scroll_jump.name',
    description: '強制横スクロールで穴や鉄球を回避しつつCXマークを集める3ライフゲーム', descriptionKey: 'selection.miniexp.games.forced_scroll_jump.description', categoryIds: ['action'],
    create
  });
})();

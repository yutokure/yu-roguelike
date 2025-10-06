(function(){
  /**
   * MiniExp Mod: XP Crane Catcher (v0.1.0)
   * - Canvas based crane game that scoops XP capsules.
   * - Keyboard (←→/A,D + SPACE) and pointer/touch controls.
   */
  function create(root, awardXp, opts){
    const difficulty = (opts && opts.difficulty) || 'NORMAL';
    const shortcuts = opts?.shortcuts;
    const cfg = (
      difficulty === 'HARD' ? { time:60, spawn:1.35, fallSpeed:1.15, gripRecover:6, density:0.55, maxCaps:26, grip:82 } :
      difficulty === 'EASY' ? { time:70, spawn:0.9, fallSpeed:0.85, gripRecover:10, density:0.8, maxCaps:32, grip:94 } :
                               { time:65, spawn:1.05, fallSpeed:1.0, gripRecover:8, density:0.68, maxCaps:30, grip:88 }
    );
    const W = 420;
    const H = 520;
    const TOP = 70;
    const FLOOR = 460;
    const DROP_X = W - 70;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    canvas.style.touchAction = 'none';
    canvas.style.background = '#0f172a';
    root.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const capsules = [];
    const particles = [];
    const heldCaps = [];
    const largeHistory = [];
    const keys = { left:false, right:false };
    let pointerTarget = null;
    let pointerDown = false;
    let lastSpawn = 0;
    let accumulator = 0;
    let raf = 0;
    let running = false;
    let ended = false;

    let timeLeft = cfg.time;
    let totalXp = 0;
    let combo = 0;
    let grip = cfg.grip;
    let resultInfo = null;
    let totalSuccess = 0;
    let failedGrabs = 0;
    let rainbowBonusTriggered = 0;
    let secretAwarded = false;

    let craneX = W * 0.3;
    let craneTargetX = craneX;
    let clawY = TOP;
    let cranePhase = 'idle';
    let grabCandidate = null;
    let returningX = craneX;
    let dropTimer = 0;
    let magnetized = [];

    const capsuleDefs = [
      { type:'small', radius:14, baseXp:3, color:'#38bdf8', weight:1.0 },
      { type:'medium', radius:19, baseXp:7, color:'#f97316', weight:1.6 },
      { type:'large', radius:25, baseXp:15, color:'#facc15', weight:2.3 },
      { type:'rainbow', radius:21, baseXp:20, color:'#ec4899', weight:1.8 }
    ];

    function disableHostRestart(){
      shortcuts?.disableKey('r');
    }

    function enableHostRestart(){
      shortcuts?.enableKey('r');
    }

    function rand(){
      return Math.random();
    }

    function spawnCapsule(){
      let active = 0;
      for (const c of capsules){ if (!c.removed) active++; }
      if (active >= cfg.maxCaps) return;
      const pool = (
        difficulty === 'HARD' ? [0,0,1,1,1,2,3] :
        difficulty === 'EASY' ? [0,0,0,0,1,1,1,2] :
                                 [0,0,0,1,1,1,2]
      );
      const def = capsuleDefs[ pool[(rand()*pool.length)|0] ];
      const capsule = {
        def,
        x: 60 + rand()*(W-120),
        y: 90,
        vx: (rand()*60-30) * cfg.fallSpeed,
        vy: 40 * cfg.fallSpeed,
        grabbed: false,
        removed: false,
        magnet: false,
      };
      capsules.push(capsule);
    }

    function updateCapsules(dt){
      const gravity = 460 * cfg.fallSpeed;
      const friction = 0.92;
      const wallLeft = 24;
      const wallRight = W - 24;
      magnetized.length = 0;
      for (const c of capsules){
        if (c.removed || c.grabbed) continue;
        if (c.magnet){
          const dx = DROP_X - c.x;
          const dy = (FLOOR-40) - c.y;
          const dist = Math.hypot(dx, dy) || 1;
          const pull = 220;
          c.vx += (dx/dist) * pull * dt;
          c.vy += (dy/dist) * pull * dt;
        } else {
          c.vy += gravity * dt;
        }
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        if (c.x - c.def.radius < wallLeft){ c.x = wallLeft + c.def.radius; c.vx = -c.vx * 0.35; }
        if (c.x + c.def.radius > wallRight){ c.x = wallRight - c.def.radius; c.vx = -c.vx * 0.35; }
        if (c.y + c.def.radius >= FLOOR){
          c.y = FLOOR - c.def.radius;
          if (Math.abs(c.vy) > 60){
            c.vy = -c.vy * 0.25;
          } else {
            c.vy = 0;
            c.vx *= friction;
            if (Math.abs(c.vx) < 2) c.vx = 0;
          }
        }
        if (c.magnet){
          magnetized.push(c);
        }
      }
      for (let i=capsules.length-1;i>=0;i--){ if (capsules[i].removed) capsules.splice(i,1); }
    }

    function updateParticles(dt){
      for (const p of particles){
        p.life -= dt;
        p.y += p.vy * dt;
        p.alpha = Math.max(0, p.life / p.maxLife);
      }
      for (let i=particles.length-1;i>=0;i--){ if(particles[i].life<=0) particles.splice(i,1); }
    }

    function drawBackground(){
      const grad = ctx.createLinearGradient(0,0,0,H);
      grad.addColorStop(0,'#0b1220');
      grad.addColorStop(1,'#111827');
      ctx.fillStyle = grad;
      ctx.fillRect(0,0,W,H);
      // glass
      ctx.fillStyle = 'rgba(30,58,138,0.15)';
      ctx.fillRect(18, TOP-30, W-36, FLOOR-TOP+90);
      ctx.strokeStyle = 'rgba(148,163,184,0.35)';
      ctx.lineWidth = 3;
      ctx.strokeRect(18, TOP-30, W-36, FLOOR-TOP+90);
      // floor
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(18, FLOOR, W-36, 50);
      // chute
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(DROP_X-40, FLOOR);
      ctx.lineTo(W-36, FLOOR-24);
      ctx.lineTo(W-36, FLOOR+50);
      ctx.lineTo(DROP_X-40, FLOOR+50);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(DROP_X-12, FLOOR-18, 24, 18);
    }

    function drawCapsules(){
      for (const c of capsules){
        if (c.removed) continue;
        const { radius, color, type } = c.def;
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.beginPath();
        const grad = ctx.createRadialGradient(0,-radius*0.4, radius*0.2, 0,0,radius);
        if (type==='rainbow'){
          grad.addColorStop(0, '#f472b6');
          grad.addColorStop(0.5, '#a855f7');
          grad.addColorStop(1, '#38bdf8');
        } else {
          grad.addColorStop(0, '#f8fafc');
          grad.addColorStop(1, color);
        }
        ctx.fillStyle = grad;
        ctx.arc(0,0,radius,0,Math.PI*2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(15,23,42,0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
        if (c.grabbed){
          ctx.strokeStyle = 'rgba(248,250,252,0.6)';
          ctx.setLineDash([4,4]);
          ctx.beginPath();
          ctx.arc(0,0,radius+6,0,Math.PI*2);
          ctx.stroke();
        }
        if (c.magnet){
          ctx.strokeStyle = 'rgba(96,165,250,0.7)';
          ctx.setLineDash([6,6]);
          ctx.beginPath();
          ctx.arc(0,0,radius+12,0,Math.PI*2);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    function drawParticles(){
      ctx.font = 'bold 16px "Segoe UI", system-ui';
      ctx.textAlign = 'center';
      for (const p of particles){
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillText(p.text, p.x, p.y);
      }
      ctx.globalAlpha = 1;
    }

    function drawCrane(){
      ctx.strokeStyle = '#93c5fd';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(18, TOP-32);
      ctx.lineTo(W-18, TOP-32);
      ctx.stroke();
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(craneX, TOP-32);
      ctx.lineTo(craneX, clawY-12);
      ctx.stroke();
      const clawRadius = 30;
      ctx.fillStyle = '#1e40af';
      ctx.beginPath();
      ctx.arc(craneX, clawY, clawRadius, Math.PI*0.2, Math.PI*0.8);
      ctx.arc(craneX, clawY, clawRadius, Math.PI*1.2, Math.PI*1.8, true);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#60a5fa';
      ctx.stroke();
      ctx.fillStyle = cranePhase === 'descending' ? 'rgba(59,130,246,0.15)' : 'rgba(148,163,184,0.18)';
      ctx.beginPath();
      ctx.arc(craneX, clawY+10, 36, 0, Math.PI*2);
      ctx.fill();
    }

    function drawHUD(){
      ctx.fillStyle = '#0b1220';
      ctx.fillRect(0,0,W,TOP-34);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '14px "Segoe UI", system-ui';
      ctx.fillText(`TIME ${Math.max(0, timeLeft).toFixed(1)}s`, 16, 22);
      ctx.fillText(`XP ${totalXp}`, 150, 22);
      ctx.fillText(`COMBO ${combo>1?'x'+combo:'-'}`, 250, 22);
      ctx.fillText('GRIP', 320, 22);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(350, 12, 54, 10);
      ctx.fillStyle = grip>60?'#34d399':grip>40?'#f59e0b':'#f87171';
      ctx.fillRect(350, 12, Math.max(0, Math.min(1, grip/100))*54, 10);
    }

    function drawResult(){
      if (!ended || !resultInfo) return;
      ctx.fillStyle = 'rgba(15,23,42,0.78)';
      ctx.fillRect(40, 120, W-80, 260);
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 120, W-80, 260);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 20px "Segoe UI", system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('RESULT', W/2, 150);
      ctx.font = '15px "Segoe UI", system-ui';
      ctx.fillText(`獲得EXP ${resultInfo.totalXp}`, W/2, 190);
      ctx.fillText(`成功 ${resultInfo.successes} / 失敗 ${resultInfo.failures}`, W/2, 220);
      ctx.fillText(`タイムボーナス +${resultInfo.timeBonus}`, W/2, 250);
      if (resultInfo.secret){
        ctx.fillStyle = '#f472b6';
        ctx.fillText('シークレットボーナス +10', W/2, 280);
        ctx.fillStyle = '#f8fafc';
      }
      if (resultInfo.rainbow > 0){
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`虹吸引ボーナス +${resultInfo.rainbow}`, W/2, 310);
        ctx.fillStyle = '#f8fafc';
      }
      ctx.font = '14px "Segoe UI", system-ui';
      ctx.fillText('Rキー / 再スタート クリック', W/2, 338);
      ctx.textAlign = 'start';
    }

    function createPopup(x, y, text, color){
      particles.push({ x, y, text, color, vy:-40, life:0.8, maxLife:0.8, alpha:1 });
    }

    function tryStartGrab(){
      if (!running || ended) return;
      if (cranePhase !== 'idle') return;
      cranePhase = 'descending';
      grabCandidate = null;
      disableHostRestart();
    }

    function updateCrane(dt){
      const moveSpeed = 150;
      if (cranePhase === 'idle'){
        if (pointerTarget != null){
          const dir = pointerTarget > craneX ? 1 : -1;
          if (Math.abs(pointerTarget - craneX) < moveSpeed*dt){ craneX = pointerTarget; }
          else craneX += dir * moveSpeed * dt;
        } else {
          let dx = 0;
          if (keys.left) dx -= 1;
          if (keys.right) dx += 1;
          craneX += dx * moveSpeed * dt;
        }
        craneX = Math.max(48, Math.min(W-48, craneX));
        clawY = Math.max(clawY - 120*dt, TOP);
      } else {
        if (pointerTarget != null){
          craneTargetX = pointerTarget;
        }
      }
      switch (cranePhase){
        case 'descending': {
          clawY += 260 * dt;
          if (!grabCandidate){
            let best = null;
            let bestDist = 9999;
            for (const c of capsules){
              if (c.removed || c.grabbed) continue;
              const dist = Math.hypot(c.x - craneX, c.y - (clawY+10));
              if (dist < 34 && dist < bestDist){ best = c; bestDist = dist; }
            }
            grabCandidate = best;
          }
          if (clawY >= FLOOR - 28){
            clawY = FLOOR - 28;
            cranePhase = 'grabbing';
            dropTimer = 0;
          }
          break;
        }
        case 'grabbing': {
          dropTimer += dt;
          if (dropTimer >= 0.18){
            dropTimer = 0;
            let success = false;
            if (grabCandidate){
              const baseChance = Math.max(0.2, Math.min(0.95, (grip/100) - (grabCandidate.def.weight-1)*0.12));
              success = rand() <= baseChance;
            }
            if (success){
              const cap = grabCandidate;
              cap.grabbed = true;
              heldCaps.length = 0;
              heldCaps.push(cap);
              combo = Math.min(combo+1, 99);
              totalSuccess++;
              grip = Math.max(12, grip - grabCandidate.def.weight*8);
              if (grabCandidate.def.type === 'large'){
                const now = performance.now()*0.001;
                largeHistory.push(now);
                while (largeHistory.length && now - largeHistory[0] > 30) largeHistory.shift();
                if (!secretAwarded && largeHistory.length >= 3){
                  secretAwarded = true;
                  totalXp += 10;
                  awardXp(10, { type:'secret_bonus' });
                  createPopup(DROP_X-20, FLOOR-40, '+10 SECRET', '#f472b6');
                }
              }
              if (grabCandidate.def.type === 'rainbow'){
                triggerRainbowMagnet(grabCandidate);
              }
            } else {
              combo = 0;
              grabCandidate = null;
              failedGrabs++;
              grip = Math.max(5, grip - 6);
            }
            cranePhase = 'lifting';
          }
          break;
        }
        case 'lifting': {
          clawY -= 260 * dt;
          if (heldCaps.length){
            const cap = heldCaps[0];
            cap.x = craneX;
            cap.y = clawY + 30;
            cap.vx = 0; cap.vy = 0;
          }
          if (clawY <= TOP){
            clawY = TOP;
            if (heldCaps.length){
              cranePhase = 'moving_to_drop';
              returningX = craneTargetX ?? craneX;
            } else {
              cranePhase = 'returning';
            }
          }
          break;
        }
        case 'moving_to_drop': {
          const targetX = DROP_X - 12;
          const dir = targetX > craneX ? 1 : -1;
          if (Math.abs(targetX - craneX) < 200*dt){ craneX = targetX; }
          else craneX += dir * 200 * dt;
          for (const cap of heldCaps){
            cap.x = craneX;
            cap.y = clawY + 30;
          }
          if (Math.abs(targetX - craneX) < 3){
            cranePhase = 'releasing';
            dropTimer = 0;
          }
          break;
        }
        case 'releasing': {
          dropTimer += dt;
          if (dropTimer >= 0.2){
            releaseHeldCaps();
            cranePhase = 'returning';
            heldCaps.length = 0;
            grabCandidate = null;
          }
          break;
        }
        case 'returning': {
          clawY = Math.max(TOP, clawY - 200*dt);
          let target = craneTargetX ?? returningX ?? (W*0.3);
          const dir = target > craneX ? 1 : -1;
          if (Math.abs(target - craneX) < 160*dt){ craneX = target; }
          else craneX += dir * 160 * dt;
          if (Math.abs(target - craneX) < 2 && clawY <= TOP+1){
            cranePhase = 'idle';
            enableHostRestart();
          }
          break;
        }
      }
      grip = Math.min(100, grip + cfg.gripRecover * dt);
    }

    function triggerRainbowMagnet(source){
      for (const c of capsules){
        if (c === source || c.removed || c.grabbed) continue;
        const dist = Math.hypot(c.x - source.x, c.y - source.y);
        if (dist <= 60){
          c.magnet = true;
          magnetized.push(c);
        }
      }
    }

    function releaseHeldCaps(){
      let gained = 0;
      let details = [];
      for (const cap of heldCaps){
        if (!cap) continue;
        cap.removed = true;
        cap.magnet = false;
        cap.grabbed = false;
        const base = cap.def.baseXp;
        const bonusCombo = combo>1 ? combo*2 : 0;
        gained += base + bonusCombo;
        details.push(`${cap.def.type}+${base}`);
        createPopup(DROP_X-20, FLOOR-30, `+${base + bonusCombo}`, '#fbbf24');
      }
      if (magnetized.length){
        for (const cap of magnetized){
          if (cap.removed || cap.grabbed) continue;
          cap.removed = true;
          cap.magnet = false;
          cap.grabbed = false;
          const extra = Math.max(1, Math.round(cap.def.baseXp * 0.6));
          gained += extra;
          details.push(`mag${extra}`);
          createPopup(DROP_X-20, FLOOR-34, `+${extra}`, '#38bdf8');
          rainbowBonusTriggered += extra;
        }
        magnetized.length = 0;
      }
      if (gained>0){
        totalXp += gained;
        awardXp(gained, { type:'capsule', combo, detail:details.join(',') });
      } else {
        combo = 0;
      }
      returningX = craneTargetX ?? craneX;
    }

    function finishGame(){
      if (ended) return;
      ended = true;
      running = false;
      enableHostRestart();
      const timeBonus = Math.round(Math.max(0, timeLeft) * 0.2);
      if (timeBonus>0){
        totalXp += timeBonus;
        awardXp(timeBonus, { type:'time_bonus' });
      }
      resultInfo = {
        totalXp,
        successes: totalSuccess,
        failures: failedGrabs,
        timeBonus,
        rainbow: rainbowBonusTriggered,
        secret: secretAwarded,
      };
    }

    function reset(){
      running = false;
      ended = false;
      timeLeft = cfg.time;
      totalXp = 0;
      combo = 0;
      grip = cfg.grip;
      resultInfo = null;
      totalSuccess = 0;
      failedGrabs = 0;
      rainbowBonusTriggered = 0;
      secretAwarded = false;
      largeHistory.length = 0;
      capsules.length = 0;
      particles.length = 0;
      heldCaps.length = 0;
      magnetized.length = 0;
      keys.left = false;
      keys.right = false;
      pointerDown = false;
      pointerTarget = null;
      craneX = W*0.3;
      craneTargetX = craneX;
      clawY = TOP;
      cranePhase = 'idle';
      grabCandidate = null;
      returningX = craneX;
      lastSpawn = 0;
      accumulator = 0;
      disableHostRestart();
      for (let i=0;i<5;i++) spawnCapsule();
    }

    function step(dt){
      if (!running) return;
      timeLeft -= dt;
      if (timeLeft <= 0){ timeLeft = 0; finishGame(); return; }
      accumulator += dt;
      if (accumulator >= cfg.spawn){
        if (rand() <= cfg.density){
          spawnCapsule();
        }
        accumulator = 0;
      }
      updateCrane(dt);
      updateCapsules(dt);
      updateParticles(dt);
    }

    function draw(){
      drawBackground();
      drawCapsules();
      drawCrane();
      drawParticles();
      drawHUD();
      if (ended){ drawResult(); }
    }

    function loop(ts){
      const now = ts*0.001;
      if (!lastSpawn) lastSpawn = now;
      let dt = now - lastSpawn;
      lastSpawn = now;
      dt = Math.min(dt, 0.033 * 2);
      step(dt);
      draw();
      if (running) raf = requestAnimationFrame(loop);
    }

    function onKeyDown(e){
      if (ended){
        if (e.key === 'r' || e.key === 'R'){ e.preventDefault(); reset(); start(); }
        return;
      }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A'){ keys.left = true; }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D'){ keys.right = true; }
      if (e.key === ' '){ e.preventDefault(); tryStartGrab(); }
    }
    function onKeyUp(e){
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A'){ keys.left = false; }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D'){ keys.right = false; }
    }

    function setPointerTarget(clientX){
      const rect = canvas.getBoundingClientRect();
      pointerTarget = Math.max(48, Math.min(W-48, clientX - rect.left));
      craneTargetX = pointerTarget;
    }

    function onPointerDown(e){
      if (ended){ reset(); start(); }
      pointerDown = true;
      setPointerTarget(e.clientX);
    }

    function onPointerMove(e){
      if (!pointerDown && cranePhase !== 'idle') return;
      setPointerTarget(e.clientX);
    }

    function onPointerUp(){
      if (ended) return;
      pointerDown = false;
      pointerTarget = null;
      tryStartGrab();
    }

    function onTouchStart(e){
      if (!e.changedTouches.length) return;
      const t = e.changedTouches[0];
      onPointerDown({ clientX:t.clientX });
      e.preventDefault();
    }
    function onTouchMove(e){
      if (!e.changedTouches.length) return;
      const t = e.changedTouches[0];
      onPointerMove({ clientX:t.clientX });
      e.preventDefault();
    }
    function onTouchEnd(e){
      onPointerUp();
      e.preventDefault();
    }

    canvas.addEventListener('mousedown', onPointerDown);
    canvas.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    canvas.addEventListener('touchstart', onTouchStart, { passive:false });
    canvas.addEventListener('touchmove', onTouchMove, { passive:false });
    canvas.addEventListener('touchend', onTouchEnd, { passive:false });
    document.addEventListener('keydown', onKeyDown, { passive:false });
    document.addEventListener('keyup', onKeyUp);

    function start(){
      if (running) return;
      running = true;
      ended = false;
      disableHostRestart();
      lastSpawn = 0;
      raf = requestAnimationFrame(loop);
    }

    function stop(){
      running = false;
      cancelAnimationFrame(raf);
    }

    function destroy(){
      try{ stop(); } catch{}
      canvas.removeEventListener('mousedown', onPointerDown);
      canvas.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      enableHostRestart();
      canvas.remove();
    }

    reset();
    start();

    return { start, stop, destroy };
  }

  window.registerMiniGame({
    id: 'xp_crane',
    name: 'XPクレーンキャッチャー', nameKey: 'selection.miniexp.games.xp_crane.name',
    description: 'クレーンで経験値カプセルを掬い上げてEXP獲得', descriptionKey: 'selection.miniexp.games.xp_crane.description', categoryIds: ['action'],
    create,
  });
})();

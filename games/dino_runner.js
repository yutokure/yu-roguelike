(function(){
  /** MiniExp: Dinosaur Runner (Chrome offline風ジャンプゲーム) */
  const BASE_CFG = {
    width: 640,
    height: 240,
    groundHeight: 32
  };

  const DIFFICULTY_CFG = {
    EASY:   { speed: 280, accel: 0.018, gravity: 1800, jump: 640, maxFall: 980, spawnMin: 1100, spawnMax: 1700, passXp: 4, distanceXp: 60 },
    NORMAL: { speed: 340, accel: 0.022, gravity: 1900, jump: 700, maxFall: 1020, spawnMin: 900,  spawnMax: 1500, passXp: 6, distanceXp: 45 },
    HARD:   { speed: 400, accel: 0.028, gravity: 2050, jump: 770, maxFall: 1100, spawnMin: 750,  spawnMax: 1300, passXp: 9, distanceXp: 36 }
  };

  function create(root, awardXp, opts){
    const difficulty = (opts && opts.difficulty) || 'NORMAL';
    const cfg = { ...BASE_CFG, ...(DIFFICULTY_CFG[difficulty] || DIFFICULTY_CFG.NORMAL) };

    const canvas = document.createElement('canvas');
    canvas.width = cfg.width;
    canvas.height = cfg.height;
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    canvas.style.borderRadius = '8px';
    canvas.style.background = '#0f172a';
    root.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const groundY = cfg.height - cfg.groundHeight;
    const dino = {
      x: cfg.width * 0.18,
      y: groundY,
      w: 38,
      h: 44,
      vy: 0,
      state: 'idle', // idle | run | jump | duck
      legsPhase: 0
    };
    const obstacles = [];
    const clouds = new Array(4).fill(0).map((_,i)=>({ x: 120 + i*160, y: 50 + (i%2)*24 }));

    let running = false;
    let ended = false;
    let raf = 0;
    let lastTs = 0;
    let distance = 0;
    let combo = 0;
    let spawnTimer = 0;
    let spawnInterval = randRange(cfg.spawnMin, cfg.spawnMax);
    let lastAwardDistance = 0;

    function randRange(min, max){
      return min + Math.random() * (max - min);
    }

    function spawnObstacle(){
      const type = Math.random() < 0.75 ? 'cactus' : 'double';
      const width = type === 'double' ? 52 : 28;
      const height = type === 'double' ? 56 : 46;
      obstacles.push({ x: cfg.width + width, w: width, h: height, type, scored:false });
    }

    function awardPass(){
      if (!awardXp) return;
      const base = cfg.passXp;
      const add = base + Math.max(0, combo-1) * 1.8;
      awardXp(add, { type:'pass', combo, distance: Math.floor(distance) });
      if (window.showTransientPopupAt){
        window.showTransientPopupAt(canvas.width - 90, 36, `+${Math.round(add)}`, { variant:'combo', level: Math.min(5, combo) });
      }
    }

    function awardDistance(){
      if (!awardXp) return;
      awardXp(cfg.distanceXp / 10, { type:'distance', distance: Math.floor(distance) });
    }

    function fail(){
      if (ended) return;
      ended = true;
      running = false;
      cancelAnimationFrame(raf);
      if (awardXp){
        const bonus = Math.max(2, Math.round(distance / cfg.distanceXp));
        awardXp(bonus, { type:'fail', distance: Math.floor(distance) });
      }
      draw();
    }

    function update(dtMs){
      const dt = dtMs / 1000;
      const baseSpeed = cfg.speed + distance * cfg.accel;
      const move = baseSpeed * dt;
      distance += move * 0.1; // scaled distance (roughly 1 per 10px)

      // background clouds parallax
      for (const cloud of clouds){
        cloud.x -= move * 0.3;
        if (cloud.x < -80){
          cloud.x = cfg.width + 60;
          cloud.y = 40 + Math.random() * 60;
        }
      }

      spawnTimer += dtMs;
      if (spawnTimer >= spawnInterval){
        spawnTimer -= spawnInterval;
        spawnInterval = randRange(Math.max(400, cfg.spawnMin - distance * 0.5), cfg.spawnMax);
        spawnObstacle();
      }

      // dino physics
      dino.legsPhase += dt * (ended ? 0 : 10 + baseSpeed * 0.01);
      if (dino.state === 'jump' || dino.y < groundY){
        dino.vy += cfg.gravity * dt;
        if (dino.vy > cfg.maxFall) dino.vy = cfg.maxFall;
        dino.y += dino.vy * dt;
        if (dino.y >= groundY){
          dino.y = groundY;
          dino.vy = 0;
          dino.state = 'run';
        }
      }

      for (let i=obstacles.length-1; i>=0; i--){
        const obs = obstacles[i];
        obs.x -= move;
        if (!obs.scored && obs.x + obs.w < dino.x - dino.w/2){
          obs.scored = true;
          combo = Math.min(combo + 1, 9);
          awardPass();
        }
        const dinoHitbox = getHitbox();
        const obsBox = { x: obs.x - obs.w/2, y: groundY - obs.h, w: obs.w, h: obs.h };
        if (intersects(dinoHitbox, obsBox)){
          fail();
        }
        if (obs.x < -obs.w){
          obstacles.splice(i,1);
        }
      }

      if (distance - lastAwardDistance >= cfg.distanceXp){
        lastAwardDistance += cfg.distanceXp;
        awardDistance();
      }
    }

    function getHitbox(){
      if (dino.state === 'duck'){
        return { x: dino.x - dino.w/2, y: groundY - 26, w: dino.w, h: 26 };
      }
      return { x: dino.x - dino.w/2, y: dino.y - dino.h, w: dino.w, h: dino.h };
    }

    function intersects(a, b){
      return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    function draw(){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      // background gradient
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0,0,canvas.width,canvas.height*0.55);

      // clouds
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      for (const c of clouds){
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, 34, 14, 0, 0, Math.PI*2);
        ctx.fill();
      }

      // ground line
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, groundY, canvas.width, cfg.groundHeight);
      ctx.fillStyle = '#475569';
      for (let i=0;i<canvas.width;i+=28){
        ctx.fillRect(i, groundY, 16, 4);
      }

      // obstacles
      for (const obs of obstacles){
        const x = obs.x - obs.w/2;
        const y = groundY - obs.h;
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x, y, obs.w, obs.h);
        ctx.fillStyle = '#15803d';
        ctx.fillRect(x + obs.w * 0.2, y + 4, 4, obs.h - 8);
        ctx.fillRect(x + obs.w * 0.56, y + 2, 4, obs.h - 6);
      }

      // dino
      ctx.save();
      ctx.translate(dino.x, dino.y);
      const legCycle = Math.sin(dino.legsPhase);
      const bodyH = dino.state === 'duck' ? dino.h * 0.65 : dino.h;
      const bodyY = dino.state === 'duck' ? -bodyH + 12 : -bodyH;
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-dino.w/2, bodyY, dino.w, bodyH);
      ctx.fillStyle = '#000';
      ctx.fillRect(6, bodyY + 8, 6, 6); // eye
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-dino.w/2 + 4, bodyY + 14, dino.w - 12, 6);
      // legs
      const legOffset = dino.state === 'duck' ? 6 : 0;
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-6, legOffset);
      ctx.lineTo(-6, legOffset + 12 + legCycle * 6);
      ctx.moveTo(6, legOffset);
      ctx.lineTo(6, legOffset + 12 - legCycle * 6);
      ctx.stroke();
      ctx.restore();

      // UI
      ctx.fillStyle = '#f1f5f9';
      ctx.font = 'bold 26px system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(Math.floor(distance).toString().padStart(5,'0'), canvas.width - 16, 38);
      ctx.font = '12px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`COMBO ${combo}`, 16, 28);
      if (!running && !ended){
        ctx.textAlign = 'center';
        ctx.fillText('スペース / クリックでスタート', canvas.width/2, canvas.height/2 - 18);
        ctx.fillText('↑またはスペースでジャンプ、↓でしゃがみ', canvas.width/2, canvas.height/2 + 4);
      }
      if (ended){
        ctx.fillStyle = 'rgba(15,23,42,0.6)';
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 24px system-ui, sans-serif';
        ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 10);
        ctx.font = '13px system-ui, sans-serif';
        ctx.fillText('スペース / R でリスタート', canvas.width/2, canvas.height/2 + 16);
        ctx.fillText(`DIST ${Math.floor(distance)}`, canvas.width/2, canvas.height/2 + 40);
      }
    }

    function loop(ts){
      if (!running) return;
      const now = ts;
      if (lastTs === 0) lastTs = now;
      const dt = Math.min(50, now - lastTs);
      lastTs = now;
      update(dt);
      draw();
      raf = requestAnimationFrame(loop);
    }

    function start(){
      if (running) return;
      if (ended) reset(false);
      running = true;
      if (dino.state === 'idle') dino.state = 'run';
      lastTs = 0;
      raf = requestAnimationFrame(loop);
    }

    function stop(){
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
    }

    function reset(drawOnly){
      obstacles.length = 0;
      distance = 0;
      combo = 0;
      dino.y = groundY;
      dino.vy = 0;
      dino.state = 'idle';
      dino.legsPhase = 0;
      spawnTimer = 0;
      spawnInterval = randRange(cfg.spawnMin, cfg.spawnMax);
      lastAwardDistance = 0;
      ended = false;
      running = false;
      lastTs = 0;
      if (!drawOnly) draw();
    }

    function jump(){
      if (ended){
        reset();
        start();
        return;
      }
      if (!running){
        start();
      }
      if (dino.y >= groundY - 1){
        dino.vy = -cfg.jump;
        dino.state = 'jump';
      }
    }

    function duck(on){
      if (dino.state === 'jump') return;
      dino.state = on ? 'duck' : (running ? 'run' : 'idle');
    }

    function onKeyDown(e){
      const key = e.key;
      if (key === ' ' || key === 'ArrowUp' || key === 'w' || key === 'W'){
        e.preventDefault();
        jump();
      } else if (key === 'ArrowDown' || key === 's' || key === 'S'){
        e.preventDefault();
        duck(true);
      } else if (ended && (key === 'r' || key === 'R')){
        e.preventDefault();
        reset();
        start();
      }
    }

    function onKeyUp(e){
      const key = e.key;
      if (key === 'ArrowDown' || key === 's' || key === 'S'){
        duck(false);
      }
    }

    function onPointerDown(e){
      e.preventDefault();
      jump();
    }

    document.addEventListener('keydown', onKeyDown, { passive:false });
    document.addEventListener('keyup', onKeyUp, { passive:false });
    canvas.addEventListener('pointerdown', onPointerDown, { passive:false });

    function destroy(){
      try {
        stop();
        document.removeEventListener('keydown', onKeyDown);
        document.removeEventListener('keyup', onKeyUp);
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.remove();
      } catch {}
    }

    function getScore(){
      return Math.floor(distance);
    }

    reset(true);
    draw();

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({ id:'dino_runner', name:'ダイノランナー', nameKey: 'selection.miniexp.games.dino_runner.name', description:'恐竜で障害物をジャンプ回避。距離と連続回避でEXP', descriptionKey: 'selection.miniexp.games.dino_runner.description', categoryIds: ['action'], create });
})();

(function(){
  /** MiniExp: Watermelon Stack (Suika-like) */
  function create(root, awardXp, opts){
    const shortcuts = opts?.shortcuts;
    const difficulty = opts?.difficulty || 'NORMAL';
    const localization = opts?.localization || (typeof window !== 'undefined' && typeof window.createMiniGameLocalization === 'function'
      ? window.createMiniGameLocalization({ id: 'watermelon_stack' })
      : null);
    const text = (key, fallback, params) => {
      if (localization && typeof localization.t === 'function') {
        return localization.t(key, fallback, params);
      }
      if (typeof fallback === 'function') return fallback();
      return fallback ?? '';
    };

    const configs = {
      EASY:   { gravity: 1180, cooldown: 0.34, moveStep: 28, distribution: [0,0,0,1,1,1,2,2,3], topTolerance: 18 },
      NORMAL: { gravity: 1320, cooldown: 0.30, moveStep: 26, distribution: [0,0,0,1,1,1,2,2,3,3,4], topTolerance: 14 },
      HARD:   { gravity: 1450, cooldown: 0.27, moveStep: 24, distribution: [0,0,1,1,2,2,3,3,4,4,5], topTolerance: 10 }
    };
    const cfg = configs[difficulty] || configs.NORMAL;

    const FRUITS = [
      { radius: 18, color: '#fb7185', xp: 1 },
      { radius: 24, color: '#f97316', xp: 2 },
      { radius: 30, color: '#facc15', xp: 3 },
      { radius: 38, color: '#4ade80', xp: 5 },
      { radius: 46, color: '#22d3ee', xp: 8 },
      { radius: 56, color: '#38bdf8', xp: 12 },
      { radius: 68, color: '#c084fc', xp: 18 },
      { radius: 82, color: '#f472b6', xp: 26 },
      { radius: 98, color: '#16a34a', xp: 38 },
      { radius: 116, color: '#0ea5e9', xp: 54 }
    ];

    const WIDTH = 420;
    const HEIGHT = 640;
    const HUD_HEIGHT = 80;
    const BOARD = {
      left: 60,
      right: WIDTH - 60,
      top: HUD_HEIGHT + 30,
      bottom: HEIGHT - 80
    };
    const TOP_LINE = BOARD.top + cfg.topTolerance;

    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    canvas.style.borderRadius = '12px';
    canvas.style.background = '#020617';
    canvas.style.touchAction = 'none';
    root.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let running = false;
    let ended = false;
    let raf = 0;
    let lastTime = 0;
    let elapsed = 0;
    let dropCooldown = 0;
    let achievedLevel = 0;
    let merges = 0;
    let score = 0;
    const pointer = {
      x: (BOARD.left + BOARD.right) / 2,
      target: (BOARD.left + BOARD.right) / 2
    };

    let fruits = [];
    let queue = [];
    let preview = null;
    let floatingTexts = [];
    let mergeFx = [];

    function disableHostRestart(){
      shortcuts?.disableKey?.('r');
    }

    function enableHostRestart(){
      shortcuts?.enableKey?.('r');
    }

    function resize(){
      const available = root.clientWidth ? Math.min(root.clientWidth, WIDTH) : WIDTH;
      const scale = available / WIDTH;
      canvas.style.width = `${WIDTH * scale}px`;
      canvas.style.height = `${HEIGHT * scale}px`;
    }

    function randomLevel(){
      const dist = cfg.distribution;
      const idx = (Math.random() * dist.length) | 0;
      return dist[idx] ?? 0;
    }

    function refillQueue(){
      while (queue.length < 3) queue.push(randomLevel());
    }

    function clamp(value, min, max){
      return Math.max(min, Math.min(max, value));
    }

    function clampXForLevel(level, value){
      const info = FRUITS[level] || FRUITS[0];
      const min = BOARD.left + info.radius;
      const max = BOARD.right - info.radius;
      return clamp(value, min, max);
    }

    function ensurePreview(){
      if (preview) return;
      refillQueue();
      const nextLevel = queue.shift() ?? 0;
      const clamped = clampXForLevel(nextLevel, pointer.target);
      pointer.target = clamped;
      pointer.x = clamped;
      preview = {
        level: nextLevel,
        radius: FRUITS[nextLevel].radius,
        x: clamped,
        y: BOARD.top - FRUITS[nextLevel].radius - 16
      };
    }

    function makeFruit(level, x, y){
      const info = FRUITS[level];
      return {
        id: Math.random().toString(36).slice(2),
        level,
        radius: info.radius,
        mass: info.radius * info.radius,
        x,
        y,
        vx: 0,
        vy: 0,
        spawnTime: elapsed,
        ready: false,
        remove: false
      };
    }

    function dropFruit(){
      if (!preview || dropCooldown > 0 || ended) return;
      const level = preview.level;
      const radius = preview.radius;
      const x = clampXForLevel(level, pointer.target);
      const y = BOARD.top + radius + 4;
      const fruit = makeFruit(level, x, y);
      fruits.push(fruit);
      dropCooldown = cfg.cooldown;
      preview = null;
      ensurePreview();
    }

    function finishGame(){
      if (!ended){
        ended = true;
        enableHostRestart();
      }
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
      draw();
    }

    function updatePointerTarget(x){
      const level = preview ? preview.level : (queue[0] ?? 0);
      pointer.target = clampXForLevel(level, x);
    }

    function onPointerMove(e){
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const px = (e.clientX - rect.left) * scaleX;
      updatePointerTarget(px);
    }

    function onPointerDown(e){
      e.preventDefault();
      onPointerMove(e);
      dropFruit();
    }

    function movePointer(delta){
      const level = preview ? preview.level : (queue[0] ?? 0);
      const next = pointer.target + delta;
      updatePointerTarget(next);
    }

    function onKeyDown(e){
      if (e.key === 'r' || e.key === 'R'){
        if (ended){
          e.preventDefault();
          reset();
          start();
        }
        return;
      }
      const key = e.key;
      if (key === 'ArrowLeft' || key === 'a' || key === 'A'){
        e.preventDefault();
        movePointer(-cfg.moveStep);
      } else if (key === 'ArrowRight' || key === 'd' || key === 'D'){
        e.preventDefault();
        movePointer(cfg.moveStep);
      } else if (key === 'ArrowDown' || key === ' ' || key === 'Spacebar' || key === 'Space'){
        e.preventDefault();
        dropFruit();
      }
    }

    function physicsStep(dt){
      const gravity = cfg.gravity;
      const air = 0.995;
      const bounceWall = 0.7;
      const bounceFloor = 0.55;

      for (const fruit of fruits){
        if (!fruit.ready && elapsed - fruit.spawnTime > 0.18){
          fruit.ready = true;
        }
        fruit.vy += gravity * dt;
        fruit.x += fruit.vx * dt;
        fruit.y += fruit.vy * dt;

        const left = BOARD.left + fruit.radius;
        const right = BOARD.right - fruit.radius;
        if (fruit.x < left){
          fruit.x = left;
          fruit.vx = Math.abs(fruit.vx) * bounceWall;
        } else if (fruit.x > right){
          fruit.x = right;
          fruit.vx = -Math.abs(fruit.vx) * bounceWall;
        }

        const bottom = BOARD.bottom - fruit.radius;
        if (fruit.y > bottom){
          fruit.y = bottom;
          fruit.vy = -Math.abs(fruit.vy) * bounceFloor;
          if (Math.abs(fruit.vy) < 18) fruit.vy = 0;
        }

        fruit.vx *= air;
        fruit.vy *= 0.998;
      }

      for (let i = 0; i < fruits.length; i++){
        const a = fruits[i];
        for (let j = i + 1; j < fruits.length; j++){
          const b = fruits[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          let distSq = dx * dx + dy * dy;
          const minDist = a.radius + b.radius;
          if (distSq === 0){
            const jitter = 0.5;
            a.x -= jitter;
            b.x += jitter;
            distSq = jitter * jitter;
          }
          if (distSq >= minDist * minDist) continue;
          const dist = Math.sqrt(distSq);
          const overlap = minDist - dist;
          const nx = dx / dist;
          const ny = dy / dist;
          const totalMass = a.mass + b.mass;
          const pushA = overlap * (b.mass / totalMass);
          const pushB = overlap * (a.mass / totalMass);
          a.x -= nx * pushA;
          a.y -= ny * pushA;
          b.x += nx * pushB;
          b.y += ny * pushB;

          const relVel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (relVel < 0){
            const impulse = -(1.05) * relVel;
            const invMassA = 1 / a.mass;
            const invMassB = 1 / b.mass;
            a.vx -= impulse * nx * invMassA;
            a.vy -= impulse * ny * invMassA;
            b.vx += impulse * nx * invMassB;
            b.vy += impulse * ny * invMassB;
          }
        }
      }
    }

    function handleMerges(){
      const candidates = [];
      for (let i = 0; i < fruits.length; i++){
        const a = fruits[i];
        if (!a.ready || a.level >= FRUITS.length - 1) continue;
        for (let j = i + 1; j < fruits.length; j++){
          const b = fruits[j];
          if (!b.ready || a.level !== b.level || b.level >= FRUITS.length - 1) continue;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const distSq = dx * dx + dy * dy;
          const minDist = a.radius + b.radius;
          if (distSq <= (minDist * minDist) * 0.64){
            candidates.push({ i, j, distSq });
          }
        }
      }
      if (!candidates.length) return;
      candidates.sort((a, b) => a.distSq - b.distSq);
      const merged = new Set();
      const newFruits = [];
      for (const c of candidates){
        if (merged.has(c.i) || merged.has(c.j)) continue;
        const a = fruits[c.i];
        const b = fruits[c.j];
        if (!a || !b || a.remove || b.remove) continue;
        merged.add(c.i);
        merged.add(c.j);
        a.remove = true;
        b.remove = true;
        const level = a.level + 1;
        const massSum = a.mass + b.mass;
        const x = (a.x * a.mass + b.x * b.mass) / massSum;
        const y = (a.y * a.mass + b.y * b.mass) / massSum;
        const fruit = makeFruit(level, x, y - 2);
        fruit.vx = (a.vx + b.vx) * 0.5;
        fruit.vy = Math.min(-120, (a.vy + b.vy) * -0.25 - 80);
        fruit.spawnTime = elapsed;
        fruit.ready = false;
        achievedLevel = Math.max(achievedLevel, level);
        merges += 1;
        const xp = FRUITS[level].xp;
        score += xp;
        if (typeof awardXp === 'function') {
          awardXp(xp, { type: 'merge', level });
        }
        floatingTexts.push({
          x,
          y: y - fruit.radius * 0.6,
          text: `+${xp} XP`,
          life: 0,
          duration: 0.9
        });
        mergeFx.push({ x, y, radius: fruit.radius, life: 0, duration: 0.5 });
        newFruits.push(fruit);
      }
      if (!merged.size) return;
      fruits = fruits.filter(f => !f.remove);
      for (const f of newFruits) fruits.push(f);
    }

    function updateFloating(dt){
      const next = [];
      for (const ft of floatingTexts){
        const life = ft.life + dt;
        if (life >= ft.duration) continue;
        next.push({ ...ft, life, y: ft.y - dt * 22 });
      }
      floatingTexts = next;
    }

    function updateMergeFx(dt){
      const next = [];
      for (const fx of mergeFx){
        const life = fx.life + dt;
        if (life >= fx.duration) continue;
        next.push({ ...fx, life });
      }
      mergeFx = next;
    }

    function checkGameOver(){
      for (const fruit of fruits){
        if (fruit.y - fruit.radius <= TOP_LINE){
          if (elapsed - fruit.spawnTime > 0.4){
            finishGame();
            return;
          }
        }
      }
    }

    function step(dt){
      dropCooldown = Math.max(0, dropCooldown - dt);
      ensurePreview();
      pointer.x = pointer.x + (pointer.target - pointer.x) * Math.min(1, dt * 12);
      if (preview){
        const radius = preview.radius;
        const min = BOARD.left + radius;
        const max = BOARD.right - radius;
        pointer.x = clamp(pointer.x, min, max);
        preview.x = pointer.x;
        preview.y = BOARD.top - radius - 16 + Math.sin(elapsed * 4) * 2;
      }
      physicsStep(dt);
      handleMerges();
      updateFloating(dt);
      updateMergeFx(dt);
      checkGameOver();
    }

    function drawBackground(){
      const grad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }

    function drawHUD(){
      ctx.save();
      ctx.fillStyle = 'rgba(15,23,42,0.88)';
      ctx.fillRect(0, 0, WIDTH, HUD_HEIGHT);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '600 18px "Segoe UI", system-ui, sans-serif';
      ctx.fillText(text('hud.title', 'WATERMELON STACK'), 20, 34);
      ctx.font = '12px "Segoe UI", system-ui, sans-serif';
      ctx.fillStyle = '#94a3b8';
      const topSize = achievedLevel + 1;
      ctx.fillText(`${text('hud.score', 'SCORE')}: ${score}`, 20, 54);
      ctx.fillText(`${text('hud.maxLevel', 'MAX LEVEL')}: Lv ${topSize}`, 160, 54);
      ctx.fillText(`${text('hud.merges', 'MERGES')}: ${merges}`, 300, 54);
      ctx.restore();

      ctx.save();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(WIDTH - 120, 8, 104, HUD_HEIGHT - 16);
      ctx.strokeStyle = 'rgba(148,163,184,0.25)';
      ctx.strokeRect(WIDTH - 120 + 0.5, 8.5, 103, HUD_HEIGHT - 17);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '11px "Segoe UI", system-ui, sans-serif';
      ctx.fillText(text('hud.next', 'NEXT'), WIDTH - 100, 26);
      for (let i = 0; i < Math.min(queue.length, 3); i++){
        const level = queue[i];
        const info = FRUITS[level];
        const cx = WIDTH - 96 + i * 32;
        const cy = 48;
        ctx.save();
        ctx.globalAlpha = 0.9 - i * 0.15;
        drawFruit({ level, x: cx, y: cy, radius: info.radius * 0.6 }, info.color, true);
        ctx.restore();
      }
      ctx.restore();
    }

    function drawBoard(){
      ctx.save();
      ctx.fillStyle = 'rgba(8,15,27,0.92)';
      roundRect(ctx, BOARD.left - 18, BOARD.top - 18, (BOARD.right - BOARD.left) + 36, (BOARD.bottom - BOARD.top) + 36, 18, true, false);
      ctx.fillStyle = '#0b1220';
      roundRect(ctx, BOARD.left - 6, BOARD.top - 6, (BOARD.right - BOARD.left) + 12, (BOARD.bottom - BOARD.top) + 12, 12, true, false);
      ctx.strokeStyle = 'rgba(14,116,144,0.16)';
      ctx.setLineDash([6,4]);
      ctx.beginPath();
      ctx.moveTo(BOARD.left, TOP_LINE);
      ctx.lineTo(BOARD.right, TOP_LINE);
      ctx.stroke();
      ctx.restore();
    }

    function roundRect(ctx, x, y, width, height, radius, fill, stroke){
      let r = radius;
      if (typeof r === 'number') {
        r = { tl: radius, tr: radius, br: radius, bl: radius };
      } else {
        const defaults = { tl: 0, tr: 0, br: 0, bl: 0 };
        r = Object.assign({}, defaults, r);
      }
      ctx.beginPath();
      ctx.moveTo(x + r.tl, y);
      ctx.lineTo(x + width - r.tr, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + r.tr);
      ctx.lineTo(x + width, y + height - r.br);
      ctx.quadraticCurveTo(x + width, y + height, x + width - r.br, y + height);
      ctx.lineTo(x + r.bl, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - r.bl);
      ctx.lineTo(x, y + r.tl);
      ctx.quadraticCurveTo(x, y, x + r.tl, y);
      ctx.closePath();
      if (fill) ctx.fill();
      if (stroke) ctx.stroke();
    }

    function drawFruit(fruit, colorOverride, outline){
      const info = FRUITS[fruit.level] || { color: '#e2e8f0' };
      const color = colorOverride || info.color;
      const r = fruit.radius;
      ctx.beginPath();
      ctx.arc(fruit.x, fruit.y, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.beginPath();
      ctx.ellipse(fruit.x - r * 0.35, fruit.y - r * 0.35, r * 0.55, r * 0.45, -0.6, 0, Math.PI * 2);
      ctx.fill();
      if (outline){
        ctx.strokeStyle = 'rgba(15,23,42,0.45)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    function drawEffects(){
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const fx of mergeFx){
        const t = fx.life / fx.duration;
        const alpha = 0.35 * (1 - t);
        ctx.strokeStyle = `rgba(148,163,184,${alpha.toFixed(3)})`;
        ctx.lineWidth = 6 * (1 - t) + 2;
        ctx.beginPath();
        ctx.arc(fx.x, fx.y, fx.radius + t * 28, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.font = 'bold 14px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      for (const ft of floatingTexts){
        const alpha = 1 - ft.life / ft.duration;
        ctx.fillStyle = `rgba(248,250,252,${alpha.toFixed(3)})`;
        ctx.fillText(ft.text, ft.x, ft.y);
      }
      ctx.restore();
    }

    function drawPreview(){
      if (!preview) return;
      ctx.save();
      ctx.setLineDash([4,4]);
      ctx.strokeStyle = 'rgba(148,163,184,0.5)';
      ctx.beginPath();
      ctx.moveTo(preview.x, HUD_HEIGHT);
      ctx.lineTo(preview.x, BOARD.top - preview.radius - 12);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 0.6;
      drawFruit(preview, FRUITS[preview.level].color, true);
      ctx.restore();
    }

    function drawFruits(){
      const ordered = fruits.slice().sort((a, b) => a.y - b.y);
      for (const fruit of ordered){
        drawFruit(fruit, FRUITS[fruit.level].color, true);
      }
    }

    function drawGameOver(){
      if (!ended) return;
      ctx.save();
      ctx.fillStyle = 'rgba(2,6,23,0.62)';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 26px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(text('hud.gameOver', 'Game Over'), WIDTH / 2, HEIGHT / 2 - 10);
      ctx.font = '13px "Segoe UI", system-ui, sans-serif';
      ctx.fillText(text('hud.restart', 'Press R to retry'), WIDTH / 2, HEIGHT / 2 + 18);
      ctx.textAlign = 'start';
      ctx.restore();
    }

    function draw(){
      drawBackground();
      drawHUD();
      drawBoard();
      drawPreview();
      drawFruits();
      drawEffects();
      drawGameOver();
    }

    function loop(ts){
      if (!running) return;
      if (!lastTime) lastTime = ts;
      const dt = Math.min(0.033, (ts - lastTime) * 0.001);
      lastTime = ts;
      elapsed += dt;
      step(dt);
      draw();
      raf = requestAnimationFrame(loop);
    }

    function start(){
      if (running) return;
      running = true;
      ended = false;
      disableHostRestart();
      lastTime = 0;
      raf = requestAnimationFrame(loop);
    }

    function stop(opts = {}){
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
      if (!opts.keepShortcutsDisabled){
        enableHostRestart();
      }
    }

    function destroy(){
      try {
        stop();
        enableHostRestart();
        window.removeEventListener('resize', resize);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerdown', onPointerDown);
        document.removeEventListener('keydown', onKeyDown);
        canvas.remove();
      } catch {}
    }

    function getScore(){
      return score;
    }

    function reset(){
      stop({ keepShortcutsDisabled: true });
      fruits = [];
      queue = [];
      preview = null;
      floatingTexts = [];
      mergeFx = [];
      pointer.x = (BOARD.left + BOARD.right) / 2;
      pointer.target = pointer.x;
      achievedLevel = 0;
      merges = 0;
      score = 0;
      elapsed = 0;
      dropCooldown = 0;
      ended = false;
      disableHostRestart();
      ensurePreview();
      draw();
    }

    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown, { passive: false });
    window.addEventListener('resize', resize);

    resize();
    ensurePreview();
    draw();

    return { start, stop, destroy, reset, getScore, resize, drop: dropFruit };
  }

  window.registerMiniGame({
    id: 'watermelon_stack',
    name: 'スイカスタック',
    nameKey: 'selection.miniexp.games.watermelon_stack.name',
    description: '同じフルーツを落として合体させ巨大なスイカを目指そう。合体するたびにEXP獲得。',
    descriptionKey: 'selection.miniexp.games.watermelon_stack.description',
    categoryIds: ['puzzle'],
    create
  });
})();

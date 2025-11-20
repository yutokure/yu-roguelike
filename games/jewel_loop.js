(function(){
  function create(root, awardXp, opts){
    const shortcuts = opts?.shortcuts;
    const diff = (opts && opts.difficulty) || 'NORMAL';
    const localization = opts?.localization || (typeof window !== 'undefined' && typeof window.createMiniGameLocalization === 'function'
      ? window.createMiniGameLocalization({ id: 'jewel_loop' })
      : null);
    const text = (key, fallback, params) => {
      if (localization && typeof localization.t === 'function') {
        return localization.t(key, fallback, params);
      }
      if (typeof fallback === 'function') return fallback();
      return fallback ?? '';
    };
    let detachLocale = null;

    const cfg = {
      EASY:   { colors: 4, speed: 55, spawnCount: 54, startCount: 16 },
      NORMAL: { colors: 5, speed: 70, spawnCount: 66, startCount: 18 },
      HARD:   { colors: 6, speed: 88, spawnCount: 78, startCount: 22 }
    }[diff] || { colors: 5, speed: 70, spawnCount: 66, startCount: 18 };

    const WIDTH = 720;
    const HEIGHT = 520;
    const HUD_H = 54;
    const PLAY_MARGIN_X = 60;
    const PLAY_TOP = HUD_H + 20;
    const PLAY_BOTTOM = HEIGHT - 20;
    const PLAY_LEFT = PLAY_MARGIN_X;
    const PLAY_RIGHT = WIDTH - PLAY_MARGIN_X;
    const PLAY_WIDTH = PLAY_RIGHT - PLAY_LEFT;
    const PLAY_HEIGHT = PLAY_BOTTOM - PLAY_TOP;
    const SHOOTER_POS = {
      x: PLAY_LEFT + PLAY_WIDTH / 2,
      y: PLAY_TOP + PLAY_HEIGHT * 0.65
    };
    const BG_COLOR = '#0f172a';
    const PATH_COLOR = '#1e293b';
    const palette = ['#f97316','#ef4444','#22c55e','#0ea5e9','#a855f7','#facc15','#14b8a6','#fb7185'];
    const RADIUS = 18;
    const SPACING = RADIUS * 2.2;
    const COLLISION_MAX_PATH_DELTA = SPACING * 1.25;
    const BULLET_SPEED = 520;
    const SHOOTER_COOLDOWN = 0.28;
    const PROJECTILE_RADIUS = 14;
    const GRID_SPACING = 44;
    const DANGER_THRESHOLD = 0.78;
    const SLOW_TIME_SECONDS = 0.8;

    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    canvas.style.background = BG_COLOR;
    canvas.style.borderRadius = '12px';
    canvas.style.touchAction = 'none';
    root.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    function randRange(min, max){
      return min + Math.random() * (max - min);
    }

    function cross(a, b, c){
      return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    }

    function boundingBoxesOverlap(a, b, c, d){
      return Math.max(a.x, b.x) >= Math.min(c.x, d.x)
        && Math.max(c.x, d.x) >= Math.min(a.x, b.x)
        && Math.max(a.y, b.y) >= Math.min(c.y, d.y)
        && Math.max(c.y, d.y) >= Math.min(a.y, b.y);
    }

    function segmentsIntersect(segA, segB){
      if (!boundingBoxesOverlap(segA.a, segA.b, segB.a, segB.b)) return false;
      const d1 = cross(segA.a, segA.b, segB.a);
      const d2 = cross(segA.a, segA.b, segB.b);
      const d3 = cross(segB.a, segB.b, segA.a);
      const d4 = cross(segB.a, segB.b, segA.b);
      return d1 * d2 < 0 && d3 * d4 < 0;
    }

    function pathHasIntersections(segments){
      for (let i = 0; i < segments.length; i++) {
        for (let j = i + 2; j < segments.length; j++) {
          if (segmentsIntersect(segments[i], segments[j])) {
            return true;
          }
        }
      }
      return false;
    }

    function drawRoundedRectPath(ctx, x, y, width, height, radius){
      const r = Math.min(Math.abs(radius), Math.abs(width) / 2, Math.abs(height) / 2);
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + width - r, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + r);
      ctx.lineTo(x + width, y + height - r);
      ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
      ctx.lineTo(x + r, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
    }

    function generatePath(){
      const baseNormalized = [
        { x: 0.08, y: 0.94 },
        { x: 0.16, y: 0.78 },
        { x: 0.26, y: 0.64 },
        { x: 0.38, y: 0.50 },
        { x: 0.55, y: 0.44 },
        { x: 0.72, y: 0.50 },
        { x: 0.86, y: 0.64 },
        { x: 0.90, y: 0.80 },
        { x: 0.78, y: 0.92 },
        { x: 0.62, y: 0.96 },
        { x: 0.46, y: 0.90 },
        { x: 0.32, y: 0.78 },
        { x: 0.24, y: 0.64 },
        { x: 0.22, y: 0.50 },
        { x: 0.28, y: 0.38 },
        { x: 0.38, y: 0.30 },
        { x: 0.50, y: 0.26 },
        { x: 0.64, y: 0.28 },
        { x: 0.76, y: 0.36 },
        { x: 0.84, y: 0.46 },
        { x: 0.82, y: 0.58 },
        { x: 0.72, y: 0.70 },
        { x: 0.58, y: 0.74 },
        { x: 0.44, y: 0.72 },
        { x: 0.34, y: 0.64 },
        { x: 0.32, y: 0.52 },
        { x: 0.38, y: 0.42 },
        { x: 0.48, y: 0.36 },
        { x: 0.5, y: 0.32 }
      ];
      const shooterNormalized = {
        x: (SHOOTER_POS.x - PLAY_LEFT) / PLAY_WIDTH,
        y: (SHOOTER_POS.y - PLAY_TOP) / PLAY_HEIGHT
      };
      baseNormalized.push({ x: shooterNormalized.x * 0.98 + 0.01, y: Math.max(0, shooterNormalized.y - 0.08) });
      baseNormalized.push({ x: shooterNormalized.x, y: Math.max(0, shooterNormalized.y - 0.04) });
      baseNormalized.push({ x: shooterNormalized.x, y: shooterNormalized.y - 0.02 });
      baseNormalized.push({ x: shooterNormalized.x, y: shooterNormalized.y - 0.01 });
      baseNormalized.push({ x: shooterNormalized.x, y: shooterNormalized.y - 0.005 });
      baseNormalized.push({ x: shooterNormalized.x, y: shooterNormalized.y });

      const MAX_PATH_ATTEMPTS = 12;
      let attempt = 0;
      while (true) {
        const points = baseNormalized.map((p, i) => {
          const rx = p.x + randRange(-0.03, 0.03) * (i === 0 ? 0.4 : 1);
          const ry = p.y + randRange(-0.03, 0.03) * (i >= baseNormalized.length - 6 ? 0.2 : 1);
          const clampedX = Math.max(0.02, Math.min(0.98, rx));
          const clampedY = Math.max(0.02, Math.min(0.98, ry));
          return {
            x: PLAY_LEFT + PLAY_WIDTH * clampedX,
            y: PLAY_TOP + PLAY_HEIGHT * clampedY
          };
        });
        const segments = [];
        let total = 0;
        for (let i = 0; i < points.length - 1; i++) {
          const a = points[i];
          const b = points[i + 1];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len = Math.hypot(dx, dy);
          segments.push({ a, b, len, dx, dy, nx: dx / len, ny: dy / len, acc: total });
          total += len;
        }
        if (!pathHasIntersections(segments) || attempt >= MAX_PATH_ATTEMPTS) {
          return { points, segments, total };
        }
        attempt++;
      }
    }

    const path = generatePath();
    const END_DISTANCE = Math.max(40, path.total - 80);

    function pointAt(distance){
      if (distance <= 0) {
        const start = path.points[0];
        return { x: start.x, y: start.y };
      }
      if (distance >= path.total) {
        const end = path.points[path.points.length - 1];
        return { x: end.x, y: end.y };
      }
      let seg = null;
      for (let i = 0; i < path.segments.length; i++) {
        const s = path.segments[i];
        if (distance <= s.acc + s.len) { seg = s; break; }
      }
      if (!seg) seg = path.segments[path.segments.length - 1];
      const local = distance - seg.acc;
      const t = Math.max(0, Math.min(1, seg.len === 0 ? 0 : local / seg.len));
      return {
        x: seg.a.x + seg.dx * t,
        y: seg.a.y + seg.dy * t
      };
    }

    function projectToPath(x, y){
      let best = { distance: 0, point: path.points[0], d2: Infinity };
      for (const seg of path.segments) {
        const ax = seg.a.x;
        const ay = seg.a.y;
        const bx = seg.b.x;
        const by = seg.b.y;
        const dx = bx - ax;
        const dy = by - ay;
        const len2 = dx * dx + dy * dy;
        let t = 0;
        if (len2 > 0) {
          t = ((x - ax) * dx + (y - ay) * dy) / len2;
          t = Math.max(0, Math.min(1, t));
        }
        const px = ax + dx * t;
        const py = ay + dy * t;
        const d2 = (px - x) * (px - x) + (py - y) * (py - y);
        if (d2 < best.d2) {
          best = { distance: seg.acc + seg.len * t, point: { x: px, y: py }, d2 };
        }
      }
      return best;
    }

    function clampInsertionDistance(hitIndex, estimatedDist){
      const bead = chain[hitIndex];
      if (!bead) return estimatedDist;
      const lowerBound = bead.dist + SPACING * 0.1;
      let upperBound;
      const nextBead = hitIndex + 1 < chain.length ? chain[hitIndex + 1] : null;
      if (nextBead) {
        upperBound = nextBead.dist - SPACING * 0.1;
      } else {
        upperBound = Math.min(path.total, bead.dist + SPACING * 2);
      }
      if (upperBound < lowerBound) upperBound = lowerBound;
      return Math.min(Math.max(estimatedDist, lowerBound), upperBound);
    }

    let chain = [];
    let spawnBag = Array.from({ length: cfg.spawnCount }, () => Math.floor(Math.random() * cfg.colors));
    let spawnIndex = 0;
    let projectiles = [];
    let particles = [];
    let floatTexts = [];
    let pointer = { x: SHOOTER_POS.x, y: SHOOTER_POS.y - 120 };

    function updatePointerFromClient(clientX, clientY){
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      pointer.x = Math.max(0, Math.min(WIDTH, (clientX - rect.left) * scaleX));
      pointer.y = Math.max(0, Math.min(HEIGHT, (clientY - rect.top) * scaleY));
    }
    let lastTime = null;
    let running = true;
    let gameOver = false;
    let victory = false;
    let animationId = null;
    let cooldown = 0;
    let score = 0;
    let shotsFired = 0;
    let longestCombo = 0;
    let slowTimer = 0;

    const shotQueue = [];
    let loadedColor = 0;

    function activeColors(){
      const colors = new Set();
      for (const b of chain) colors.add(b.color);
      for (let i = spawnIndex; i < spawnBag.length; i++) colors.add(spawnBag[i]);
      if (colors.size === 0) colors.add(0);
      return Array.from(colors);
    }

    function pruneShotQueue(){
      const colors = new Set(activeColors());
      if (!colors.has(loadedColor)) {
        const first = colors.values().next().value;
        loadedColor = first ?? 0;
      }
      for (let i = shotQueue.length - 1; i >= 0; i--) {
        if (!colors.has(shotQueue[i])) {
          shotQueue.splice(i, 1);
        }
      }
    }

    function refillShotQueue(){
      const colors = activeColors();
      while (shotQueue.length < 2) {
        shotQueue.push(colors[Math.floor(Math.random() * colors.length)]);
      }
    }

    function loadNextShot(){
      if (shotQueue.length === 0) refillShotQueue();
      loadedColor = shotQueue.shift();
      refillShotQueue();
    }

    function disableHostRestart(){
      shortcuts?.disableKey?.('r');
    }

    function enableHostRestart(){
      shortcuts?.enableKey?.('r');
    }

    function resetChain(){
      const shouldRestart = gameOver || animationId == null;
      spawnBag = Array.from({ length: cfg.spawnCount }, () => Math.floor(Math.random() * cfg.colors));
      chain = [];
      spawnIndex = 0;
      projectiles = [];
      particles = [];
      floatTexts = [];
      cooldown = 0;
      score = 0;
      shotsFired = 0;
      longestCombo = 0;
      slowTimer = 0;
      gameOver = false;
      victory = false;
      running = true;
      lastTime = null;
      shotQueue.length = 0;
      loadedColor = 0;
      disableHostRestart();
      pointer.x = SHOOTER_POS.x;
      pointer.y = SHOOTER_POS.y - 120;
      const initial = Math.min(cfg.startCount, spawnBag.length);
      let dist = -SPACING * initial;
      for (let i = 0; i < initial; i++) {
        chain.push({ color: spawnBag[spawnIndex++], dist });
        dist += SPACING;
      }
      loadNextShot();
      render();
      if (shouldRestart) start();
    }

    resetChain();

    function enforceForward(){
      for (let i = 1; i < chain.length; i++) {
        const prev = chain[i - 1];
        const curr = chain[i];
        const required = prev.dist + SPACING;
        if (curr.dist < required) curr.dist = required;
      }
    }

    function enforceBackward(){
      for (let i = chain.length - 2; i >= 0; i--) {
        const next = chain[i + 1];
        const curr = chain[i];
        const required = next.dist - SPACING;
        if (curr.dist > required) curr.dist = required;
      }
      if (chain.length > 0 && chain[0].dist < -SPACING * 4) chain[0].dist = -SPACING * 4;
      for (let i = 1; i < chain.length; i++) {
        const prev = chain[i - 1];
        const curr = chain[i];
        const required = prev.dist + SPACING;
        if (curr.dist < required) curr.dist = required;
      }
    }

    function trySpawn(){
      while (spawnIndex < spawnBag.length) {
        if (chain.length === 0) {
          chain.push({ color: spawnBag[spawnIndex++], dist: -SPACING * 2 });
          continue;
        }
        const head = chain[0];
        if (head.dist > SPACING * 0.9) {
          const newDist = Math.min(head.dist - SPACING, -SPACING * 2);
          chain.unshift({ color: spawnBag[spawnIndex++], dist: newDist });
        } else {
          break;
        }
      }
    }

    function insertBead(color, dist){
      const clamped = Math.max(-SPACING * 4, Math.min(path.total, dist));
      let index = 0;
      while (index < chain.length && chain[index].dist < clamped) index++;
      chain.splice(index, 0, { color, dist: clamped });
      enforceForward();
      enforceBackward();
      return index;
    }

    function collapseGap(start, count){
      if (count <= 0) return;
      const shift = SPACING * count;
      for (let i = start; i < chain.length; i++) {
        chain[i].dist -= shift;
      }
      if (chain.length > 0 && chain[0].dist < -SPACING * 4) {
        const correction = -SPACING * 4 - chain[0].dist;
        for (const bead of chain) {
          bead.dist += correction;
        }
      }
    }

    function removeRange(start, count){
      chain.splice(start, count);
      collapseGap(start, count);
      enforceBackward();
    }

    function spawnMatchEffects(points, color, count){
      if (!points || points.length === 0) return;
      const main = palette[color % palette.length];
      for (const p of points) {
        const burst = 9;
        for (let i = 0; i < burst; i++) {
          const ang = randRange(0, Math.PI * 2);
          const spd = randRange(90, 240);
          particles.push({
            x: p.x,
            y: p.y,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd,
            life: 0,
            ttl: 0.8,
            size: randRange(2.5, 5.5),
            color: main
          });
        }
      }
      const avgX = points.reduce((s, p) => s + p.x, 0) / points.length;
      const avgY = points.reduce((s, p) => s + p.y, 0) / points.length;
      floatTexts.push({ x: avgX, y: avgY, vy: -24, text: `x${count}`, color: main, life: 0, ttl: 0.9 });
    }

    function resolveMatches(index){
      if (index < 0 || index >= chain.length) return;
      const color = chain[index].color;
      let left = index;
      let right = index;
      while (left - 1 >= 0 && chain[left - 1].color === color) left--;
      while (right + 1 < chain.length && chain[right + 1].color === color) right++;
      const count = right - left + 1;
      if (count >= 3) {
        const matchPoints = [];
        for (let i = left; i <= right; i++) {
          matchPoints.push(pointAt(chain[i].dist));
        }
        removeRange(left, count);
        score += count * 5;
        longestCombo = Math.max(longestCombo, count);
        awardXp?.(count);
        slowTimer = Math.max(slowTimer, SLOW_TIME_SECONDS);
        spawnMatchEffects(matchPoints, color, count);
        resolveMatches(Math.max(0, left - 1));
        resolveMatches(Math.min(chain.length - 1, left));
      }
    }

    function shoot(){
      if (!running || gameOver || cooldown > 0) return;
      if (loadedColor == null) loadNextShot();
      const angle = Math.atan2(pointer.y - SHOOTER_POS.y, pointer.x - SHOOTER_POS.x);
      const vx = Math.cos(angle) * BULLET_SPEED;
      const vy = Math.sin(angle) * BULLET_SPEED;
      projectiles.push({ x: SHOOTER_POS.x, y: SHOOTER_POS.y, vx, vy, color: loadedColor });
      shotsFired++;
      cooldown = SHOOTER_COOLDOWN;
      loadNextShot();
    }

    function onMouseMove(e){
      updatePointerFromClient(e.clientX, e.clientY);
    }

    function onTouchMove(e){
      if (e.touches && e.touches.length > 0) {
        updatePointerFromClient(e.touches[0].clientX, e.touches[0].clientY);
      }
    }

    function onMouseDown(e){
      e.preventDefault();
      updatePointerFromClient(e.clientX, e.clientY);
      shoot();
    }

    function onTouchStart(e){
      e.preventDefault();
      if (e.touches && e.touches.length > 0) {
        updatePointerFromClient(e.touches[0].clientX, e.touches[0].clientY);
      }
      shoot();
    }

    function onKeyDown(e){
      if (e.code === 'Space') {
        e.preventDefault();
        shoot();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        resetChain();
      } else if (e.code === 'KeyQ') {
        e.preventDefault();
        if (shotQueue.length === 0) refillShotQueue();
        if (shotQueue.length === 0) return;
        const next = shotQueue.shift();
        if (next == null) return;
        const current = loadedColor;
        loadedColor = next;
        if (current != null) shotQueue.push(current);
        refillShotQueue();
      }
    }

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('keydown', onKeyDown);

    if (localization && typeof localization.onChange === 'function') {
      detachLocale = localization.onChange(() => {
        try { render(); } catch {}
      });
    }

    function update(dt){
      if (!running || gameOver) return;
      if (cooldown > 0) cooldown = Math.max(0, cooldown - dt);
      if (slowTimer > 0) slowTimer = Math.max(0, slowTimer - dt);

      // Move chain
      const speed = cfg.speed * (slowTimer > 0 ? 0.6 : 1);
      for (const bead of chain) {
        bead.dist += speed * dt;
      }
      enforceForward();

      // Spawn new beads when space available
      trySpawn();

      // Move projectiles
      const remainingProjectiles = [];
      for (const p of projectiles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < -40 || p.x > WIDTH + 40 || p.y < HUD_H - 40 || p.y > HEIGHT + 40) {
          continue;
        }
        const proj = projectToPath(p.x, p.y);
        let hitIndex = -1;
        for (let i = 0; i < chain.length; i++) {
          const bead = chain[i];
          if (Math.abs(bead.dist - proj.distance) > COLLISION_MAX_PATH_DELTA) {
            continue;
          }
          const pos = pointAt(bead.dist);
          const dx = pos.x - p.x;
          const dy = pos.y - p.y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 <= (RADIUS + PROJECTILE_RADIUS) * (RADIUS + PROJECTILE_RADIUS)) {
            hitIndex = i;
            break;
          }
        }
        if (hitIndex >= 0) {
          const insertionDist = clampInsertionDistance(hitIndex, proj.distance);
          const inserted = insertBead(p.color, insertionDist);
          resolveMatches(inserted);
          pruneShotQueue();
          refillShotQueue();
          continue;
        }
        remainingProjectiles.push(p);
      }
      projectiles = remainingProjectiles;

      // Animate particles and float texts
      const nextParticles = [];
      for (const p of particles) {
        p.life += dt;
        if (p.life > p.ttl) continue;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 220 * dt;
        nextParticles.push(p);
      }
      particles = nextParticles;

      const nextTexts = [];
      for (const t of floatTexts) {
        t.life += dt;
        if (t.life > t.ttl) continue;
        t.y += t.vy * dt;
        t.vy -= 40 * dt;
        nextTexts.push(t);
      }
      floatTexts = nextTexts;

      enforceBackward();

      // Victory / defeat conditions
      if (chain.length === 0 && spawnIndex >= spawnBag.length && projectiles.length === 0) {
        running = false;
        victory = true;
        gameOver = true;
        enableHostRestart();
      } else if (chain.length > 0 && chain[chain.length - 1].dist >= END_DISTANCE) {
        running = false;
        victory = false;
        gameOver = true;
        enableHostRestart();
      }
    }

    function drawBackground(){
      const grad = ctx.createLinearGradient(0, HUD_H, 0, HEIGHT);
      grad.addColorStop(0, '#0b1220');
      grad.addColorStop(1, '#0a1a2f');
      ctx.fillStyle = grad;
      ctx.fillRect(0, HUD_H, WIDTH, HEIGHT - HUD_H);
      ctx.strokeStyle = 'rgba(148,163,184,0.08)';
      ctx.lineWidth = 1;
      for (let x = PLAY_LEFT - 8; x <= PLAY_RIGHT + 8; x += GRID_SPACING) {
        ctx.beginPath();
        ctx.moveTo(x, HUD_H);
        ctx.lineTo(x, HEIGHT);
        ctx.stroke();
      }
      for (let y = PLAY_TOP - 20; y <= PLAY_BOTTOM + 40; y += GRID_SPACING) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(WIDTH, y);
        ctx.stroke();
      }
    }

    function drawPath(){
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = PATH_COLOR;
      ctx.lineWidth = RADIUS * 1.15;
      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length; i++) {
        const p = path.points[i];
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)';
      ctx.lineWidth = RADIUS * 0.55;
      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length; i++) {
        const p = path.points[i];
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }

    function drawParticles(){
      for (const p of particles) {
        const t = 1 - Math.min(1, p.life / p.ttl);
        ctx.fillStyle = p.color + Math.floor(120 * t).toString(16).padStart(2, '0');
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (0.8 + 0.4 * t), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawFloatTexts(){
      ctx.font = 'bold 22px "Noto Sans JP", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const t of floatTexts) {
        const alpha = 1 - Math.min(1, t.life / t.ttl);
        ctx.fillStyle = `rgba(255,255,255,${alpha * 0.9})`;
        ctx.strokeStyle = `${t.color}55`;
        ctx.lineWidth = 3;
        ctx.strokeText(t.text, t.x, t.y);
        ctx.fillText(t.text, t.x, t.y);
      }
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    }

    function drawAimGuide(){
      const dx = pointer.x - SHOOTER_POS.x;
      const dy = pointer.y - SHOOTER_POS.y;
      const len = Math.hypot(dx, dy) || 1;
      const maxLen = 780;
      const nx = dx / len;
      const ny = dy / len;
      const gx = SHOOTER_POS.x + nx * Math.min(len, maxLen);
      const gy = SHOOTER_POS.y + ny * Math.min(len, maxLen);
      ctx.save();
      ctx.setLineDash([8, 10]);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(56,189,248,0.42)';
      ctx.beginPath();
      ctx.moveTo(SHOOTER_POS.x, SHOOTER_POS.y);
      ctx.lineTo(gx, gy);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(125,211,252,0.5)';
      ctx.beginPath();
      ctx.arc(gx, gy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawDangerMeter(){
      if (chain.length === 0) return;
      const tail = chain[chain.length - 1];
      const ratio = Math.min(1, tail.dist / END_DISTANCE);
      const barW = 260;
      const barH = 12;
      const x = WIDTH / 2 - barW / 2;
      const y = HEIGHT - 28;
      ctx.fillStyle = 'rgba(15,23,42,0.7)';
      ctx.fillRect(x - 4, y - 4, barW + 8, barH + 8);
      const grad = ctx.createLinearGradient(x, y, x + barW, y);
      grad.addColorStop(0, '#22c55e');
      grad.addColorStop(0.6, '#facc15');
      grad.addColorStop(1, '#ef4444');
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barW * ratio, barH);
      ctx.strokeStyle = 'rgba(148,163,184,0.4)';
      ctx.strokeRect(x, y, barW, barH);
      if (ratio > DANGER_THRESHOLD) {
        const pulse = 0.45 + 0.35 * Math.sin(performance.now() / 120);
        ctx.fillStyle = `rgba(239,68,68,${pulse})`;
        ctx.fillRect(x, y, barW * ratio, barH);
      }
    }

    function drawBeads(){
      ctx.lineWidth = 3;
      for (const bead of chain) {
        const pos = pointAt(bead.dist);
        ctx.fillStyle = palette[bead.color % palette.length];
        ctx.strokeStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.beginPath();
        ctx.arc(pos.x - RADIUS * 0.35, pos.y - RADIUS * 0.35, RADIUS * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawProjectiles(){
      ctx.lineWidth = 2;
      for (const p of projectiles) {
        ctx.fillStyle = palette[p.color % palette.length];
        ctx.strokeStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(p.x, p.y, PROJECTILE_RADIUS, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    function drawShooter(){
      const angle = Math.atan2(pointer.y - SHOOTER_POS.y, pointer.x - SHOOTER_POS.x);
      const barrelLen = 52;
      ctx.save();
      ctx.translate(SHOOTER_POS.x, SHOOTER_POS.y);
      ctx.rotate(angle - Math.PI / 2);
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.arc(0, 0, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      drawRoundedRectPath(ctx, -12, -20, 24, barrelLen, 12);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = palette[loadedColor % palette.length];
      ctx.beginPath();
      ctx.arc(SHOOTER_POS.x, SHOOTER_POS.y, RADIUS * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(SHOOTER_POS.x, SHOOTER_POS.y, RADIUS * 0.9, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < shotQueue.length; i++) {
        const cx = SHOOTER_POS.x + 40 + i * (RADIUS * 1.4);
        const cy = SHOOTER_POS.y + 42;
        ctx.fillStyle = palette[shotQueue[i] % palette.length];
        ctx.beginPath();
        ctx.arc(cx, cy, RADIUS * 0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(15,23,42,0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, RADIUS * 0.7, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    function drawHUD(){
      ctx.fillStyle = '#0b1220';
      ctx.fillRect(0, 0, WIDTH, HUD_H);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px "Noto Sans JP", sans-serif';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      const remaining = Math.max(0, spawnBag.length - spawnIndex + chain.length);
      ctx.fillText(text('hud.score', 'SCORE: ') + score, 20, HUD_H / 2);
      ctx.fillText(text('hud.shots', 'SHOTS: ') + shotsFired, 180, HUD_H / 2);
      ctx.fillText(text('hud.combo', 'BEST COMBO: ') + longestCombo, 320, HUD_H / 2);
      ctx.fillText(text('hud.remaining', 'REMAINING: ') + remaining, 520, HUD_H / 2);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '18px "Noto Sans JP", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(text('hud.difficulty', '難易度: ') + diff, WIDTH - 20, HUD_H / 2);
      ctx.textAlign = 'left';
      const prevBaseline = ctx.textBaseline;
      ctx.textBaseline = 'alphabetic';
      ctx.font = '12px "Noto Sans JP", sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText(text('hud.hint', 'SPACE/タップで発射・Qで弾入れ替え'), 20, HUD_H - 6);
      ctx.textBaseline = prevBaseline;
    }

    function drawBanner(message, color){
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = color;
      ctx.font = 'bold 42px "Noto Sans JP", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(message, WIDTH / 2, HEIGHT / 2 - 30);
      ctx.font = '20px "Noto Sans JP", sans-serif';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText(text('hud.restart_hint', 'Rキーでやり直し'), WIDTH / 2, HEIGHT / 2 + 24);
      ctx.restore();
    }

    function render(){
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      drawBackground();
      drawHUD();
      drawPath();
      drawBeads();
      drawParticles();
      drawProjectiles();
      drawAimGuide();
      drawShooter();
      drawFloatTexts();
      drawDangerMeter();
      if (gameOver) {
        if (victory) {
          drawBanner(text('result.victory', 'CONGRATULATIONS! 全てのジュエルを消去しました'), '#4ade80');
        } else {
          drawBanner(text('result.defeat', 'レールを突破されました…'), '#f87171');
        }
      }
    }

    function loop(timestamp){
      if (!running && !gameOver) return;
      if (lastTime == null) lastTime = timestamp;
      const dt = Math.min(0.05, (timestamp - lastTime) / 1000);
      lastTime = timestamp;
      update(dt);
      render();
      if (!gameOver) {
        animationId = requestAnimationFrame(loop);
      }
    }

    function start(){
      if (animationId) cancelAnimationFrame(animationId);
      animationId = requestAnimationFrame(loop);
    }

    function stop(){
      running = false;
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    }

    function destroy(){
      stop();
      gameOver = true;
      enableHostRestart();
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('keydown', onKeyDown);
      try { detachLocale && detachLocale(); } catch {}
      canvas.remove();
    }

    start();

    return {
      start,
      stop,
      destroy
    };
  }

  if (!window.MiniGameMods) window.MiniGameMods = {};
  window.MiniGameMods.jewelLoop = { create };
  if (window.registerMiniGame) {
    window.registerMiniGame({
      id: 'jewel_loop',
      name: 'ジュエルループ', nameKey: 'selection.miniexp.games.jewel_loop.name',
      description: 'レールを進むジュエルに同色の石を撃ち込み、3つ揃えて消去するパズルアクション。',
      descriptionKey: 'selection.miniexp.games.jewel_loop.description',
      categoryIds: ['puzzle'],
      create
    });
  }
})();

(function(){
  /** MiniExp: Aurora Circuit (Top-down racing)
   *  - Circular track with boost zones, difficulty-based AI opponents.
   */
  function create(root, awardXp, opts){
    const difficulty = (opts && opts.difficulty) || 'NORMAL';
    const cfg = (
      difficulty === 'HARD' ? {
        laps: 5,
        aiCount: 4,
        aiSpeedRange: [0.057, 0.065],
        lapXp: 30,
        bestXp: 18,
        finishXp: [120, 70, 30],
        turboDuration: 3.6,
        turboMultiplier: 1.45
      } :
      difficulty === 'EASY' ? {
        laps: 3,
        aiCount: 2,
        aiSpeedRange: [0.038, 0.045],
        lapXp: 20,
        bestXp: 8,
        finishXp: [60, 30, 15],
        turboDuration: 3.2,
        turboMultiplier: 1.35
      } : {
        laps: 4,
        aiCount: 3,
        aiSpeedRange: [0.047, 0.055],
        lapXp: 25,
        bestXp: 12,
        finishXp: [80, 45, 20],
        turboDuration: 3.4,
        turboMultiplier: 1.4
      }
    );

    const size = { width: 720, height: 520 };
    const cx = size.width / 2;
    const cy = size.height / 2;
    const outerR = Math.min(size.width, size.height) * 0.42;
    const innerR = outerR * 0.55;
    const startAngle = -Math.PI / 2;
    const TAU = Math.PI * 2;

    const surfaces = {
      track: { drag: 1.4, accel: 130, brake: 220, turn: 2.3, maxSpeed: 190 },
      grass: { drag: 2.8, accel: 90, brake: 210, turn: 1.3, maxSpeed: 120 },
      off: { drag: 4.8, accel: 70, brake: 200, turn: 0.75, maxSpeed: 80 }
    };

    const boostZones = [
      { id: 'zoneA', start: 0.10, end: 0.18, cooldown: 0 },
      { id: 'zoneB', start: 0.47, end: 0.55, cooldown: 0 },
      { id: 'zoneC', start: 0.78, end: 0.86, cooldown: 0 }
    ];
    const boostCooldownMs = 10000;
    const boostXp = 2;

    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.width = size.width + 'px';
    container.style.margin = '0 auto';
    container.style.fontFamily = 'system-ui, sans-serif';

    const canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    canvas.style.display = 'block';
    canvas.style.borderRadius = '12px';
    canvas.style.background = 'radial-gradient(circle at 50% 50%, #0f172a 0%, #020617 70%)';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const hud = document.createElement('div');
    hud.style.position = 'absolute';
    hud.style.top = '16px';
    hud.style.right = '16px';
    hud.style.background = 'rgba(15, 23, 42, 0.8)';
    hud.style.color = '#f8fafc';
    hud.style.padding = '12px 16px';
    hud.style.borderRadius = '10px';
    hud.style.width = '220px';
    hud.style.fontSize = '13px';
    hud.style.lineHeight = '1.5';
    hud.style.backdropFilter = 'blur(6px)';
    hud.style.boxShadow = '0 10px 30px rgba(15, 23, 42, 0.35)';
    container.appendChild(hud);

    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.left = '0';
    overlay.style.top = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.pointerEvents = 'none';
    overlay.style.color = '#e2e8f0';
    overlay.style.fontSize = '56px';
    overlay.style.textShadow = '0 18px 32px rgba(15, 23, 42, 0.85)';
    container.appendChild(overlay);

    const miniMapSize = 160;
    const miniMapCanvas = document.createElement('canvas');
    miniMapCanvas.width = miniMapSize;
    miniMapCanvas.height = miniMapSize;
    miniMapCanvas.style.position = 'absolute';
    miniMapCanvas.style.left = '16px';
    miniMapCanvas.style.top = '16px';
    miniMapCanvas.style.background = 'rgba(15, 23, 42, 0.82)';
    miniMapCanvas.style.border = '1px solid rgba(148, 163, 184, 0.4)';
    miniMapCanvas.style.borderRadius = '12px';
    miniMapCanvas.style.boxShadow = '0 12px 25px rgba(2, 6, 23, 0.45)';
    miniMapCanvas.style.backdropFilter = 'blur(4px)';
    container.appendChild(miniMapCanvas);
    const miniMapCtx = miniMapCanvas.getContext('2d');

    const telemetry = document.createElement('div');
    telemetry.style.position = 'absolute';
    telemetry.style.bottom = '20px';
    telemetry.style.left = '50%';
    telemetry.style.transform = 'translateX(-50%)';
    telemetry.style.width = '320px';
    telemetry.style.background = 'rgba(15, 23, 42, 0.82)';
    telemetry.style.color = '#e2e8f0';
    telemetry.style.padding = '14px 18px 16px';
    telemetry.style.borderRadius = '14px';
    telemetry.style.boxShadow = '0 18px 40px rgba(2, 6, 23, 0.55)';
    telemetry.style.fontSize = '12px';
    telemetry.style.letterSpacing = '0.04em';
    telemetry.style.backdropFilter = 'blur(6px)';
    container.appendChild(telemetry);

    function createMeterRow(label){
      const wrapper = document.createElement('div');
      wrapper.style.marginTop = '8px';
      const header = document.createElement('div');
      header.style.display = 'flex';
      header.style.justifyContent = 'space-between';
      header.style.alignItems = 'baseline';
      header.style.marginBottom = '4px';
      const title = document.createElement('span');
      title.textContent = label;
      title.style.fontWeight = '600';
      title.style.fontSize = '11px';
      title.style.color = '#94a3b8';
      const value = document.createElement('span');
      value.textContent = '0';
      value.style.fontWeight = '600';
      value.style.fontSize = '12px';
      value.style.color = '#f8fafc';
      header.appendChild(title);
      header.appendChild(value);
      const bar = document.createElement('div');
      bar.style.position = 'relative';
      bar.style.height = '8px';
      bar.style.borderRadius = '999px';
      bar.style.background = 'rgba(148, 163, 184, 0.22)';
      const fill = document.createElement('div');
      fill.style.position = 'absolute';
      fill.style.left = '0';
      fill.style.top = '0';
      fill.style.bottom = '0';
      fill.style.width = '0%';
      fill.style.borderRadius = '999px';
      fill.style.background = 'linear-gradient(90deg, #38f9d7, #60a5fa)';
      bar.appendChild(fill);
      wrapper.appendChild(header);
      wrapper.appendChild(bar);
      telemetry.appendChild(wrapper);
      return { wrapper, title, value, fill };
    }

    const telemetryHeader = document.createElement('div');
    telemetryHeader.style.display = 'flex';
    telemetryHeader.style.justifyContent = 'space-between';
    telemetryHeader.style.alignItems = 'center';
    telemetryHeader.style.fontSize = '12px';
    telemetryHeader.style.fontWeight = '600';
    telemetryHeader.style.color = '#cbd5f5';
    telemetryHeader.style.marginBottom = '4px';
    telemetryHeader.textContent = 'DRIVER TELEMETRY';
    telemetry.appendChild(telemetryHeader);

    const speedMeter = createMeterRow('SPEED');
    const turboMeter = createMeterRow('TURBO');
    const lapMeter = createMeterRow('LAP PROGRESS');

    const resultPanel = document.createElement('div');
    resultPanel.style.position = 'absolute';
    resultPanel.style.left = '50%';
    resultPanel.style.top = '50%';
    resultPanel.style.transform = 'translate(-50%, -50%)';
    resultPanel.style.minWidth = '320px';
    resultPanel.style.maxWidth = '460px';
    resultPanel.style.background = 'rgba(15, 23, 42, 0.93)';
    resultPanel.style.color = '#e2e8f0';
    resultPanel.style.padding = '24px 28px';
    resultPanel.style.borderRadius = '14px';
    resultPanel.style.boxShadow = '0 18px 45px rgba(2, 6, 23, 0.65)';
    resultPanel.style.display = 'none';
    resultPanel.style.textAlign = 'center';
    container.appendChild(resultPanel);

    const instruction = document.createElement('div');
    instruction.style.position = 'absolute';
    instruction.style.left = '16px';
    instruction.style.bottom = '16px';
    instruction.style.padding = '10px 14px';
    instruction.style.background = 'rgba(15, 23, 42, 0.8)';
    instruction.style.borderRadius = '10px';
    instruction.style.color = '#cbd5f5';
    instruction.style.fontSize = '12px';
    instruction.style.lineHeight = '1.6';
    instruction.innerHTML = '↑/W:アクセル　↓/S:ブレーキ　←→/A・D:ステア<br>Space:ターボ　R:リスタート';
    container.appendChild(instruction);

    root.appendChild(container);

    const player = {
      x: cx + Math.cos(startAngle) * ((innerR + outerR) / 2),
      y: cy + Math.sin(startAngle) * ((innerR + outerR) / 2),
      angle: 0,
      speed: 0,
      lap: 0,
      lapTime: 0,
      bestLap: Infinity,
      justCrossed: false,
      turboGauge: 0,
      turboActive: false,
      turboTimer: 0,
      finished: false,
      finishTime: null,
      lastProgress: 0
    };

    const trackRadius = (innerR + outerR) / 2;
    const metersPerPixel = 400 / (TAU * trackRadius);
    const miniMapScale = (miniMapSize / 2 - 12) / outerR;

    const aiColors = ['#f97316', '#a855f7', '#38bdf8', '#facc15', '#f472b6'];
    const aiCars = [];
    for (let i = 0; i < cfg.aiCount; i++){
      aiCars.push({
        laneOffset: (i - (cfg.aiCount-1)/2) * 10,
        progress: (0.8 - i * 0.05 + TAU) % 1,
        targetSpeed: randRange(cfg.aiSpeedRange[0], cfg.aiSpeedRange[1]),
        speed: randRange(cfg.aiSpeedRange[0], cfg.aiSpeedRange[1]),
        lap: 0,
        lapTime: 0,
        finishTime: null,
        justCrossed: false,
        color: aiColors[i % aiColors.length],
        name: 'Rival ' + (i + 1)
      });
    }

    let keys = Object.create(null);
    let raf = 0;
    let lastTs = 0;
    let running = false;
    let state = 'idle';
    let countdown = 3;
    let countdownTimer = 0;
    let totalTime = 0;
    let xpEarned = { lap: 0, best: 0, boost: 0, finish: 0 };
    let finishOrder = [];

    function randRange(a, b){
      return a + Math.random() * (b - a);
    }

    function clamp(v, min, max){
      return v < min ? min : (v > max ? max : v);
    }

    function normAngle(angle){
      let a = angle - startAngle;
      a = ((a % TAU) + TAU) % TAU;
      return a / TAU;
    }

    function getSurface(x, y){
      const dx = x - cx;
      const dy = y - cy;
      const r = Math.hypot(dx, dy);
      if (r >= innerR && r <= outerR){
        return { ...surfaces.track, type: 'track', radius: r };
      } else if ((r > innerR - 30 && r < innerR) || (r > outerR && r < outerR + 36)){
        return { ...surfaces.grass, type: 'grass', radius: r };
      } else {
        return { ...surfaces.off, type: 'off', radius: r };
      }
    }

    function boostForProgress(progress, entity){
      for (const zone of boostZones){
        const now = performance.now();
        if (progress >= zone.start && progress <= zone.end){
          if (!zone.cooldown || now - zone.cooldown >= boostCooldownMs){
            zone.cooldown = now;
            if (entity === player){
              player.turboGauge = clamp(player.turboGauge + 0.5, 0, 1);
              awardXp(boostXp, { type: 'boost', zone: zone.id, difficulty });
              xpEarned.boost += boostXp;
            }
          }
        }
      }
    }

    function updatePlayer(dt){
      if (player.finished) return;
      const surface = getSurface(player.x, player.y);
      const accel = surface.accel;
      const brake = surface.brake;
      const turn = surface.turn;
      const maxSpeed = surface.maxSpeed * (player.turboActive ? cfg.turboMultiplier : 1);

      if (keys['ArrowUp'] || keys['w'] || keys['W']){
        player.speed += accel * dt;
      }
      if (keys['ArrowDown'] || keys['s'] || keys['S']){
        if (player.speed > 0){
          player.speed -= brake * dt;
        } else {
          player.speed -= accel * 0.5 * dt;
        }
      }

      const steerInput = ((keys['ArrowLeft'] || keys['a'] || keys['A']) ? -1 : 0) + ((keys['ArrowRight'] || keys['d'] || keys['D']) ? 1 : 0);
      if (steerInput !== 0){
        const steerForce = turn * dt * clamp(Math.abs(player.speed) / 140, 0, 1.8);
        player.angle += steerForce * steerInput;
      }

      const drag = surface.drag * dt;
      if (!keys['ArrowUp'] && !keys['w'] && !keys['W']){
        player.speed -= player.speed * drag * 0.4;
      }
      player.speed -= player.speed * drag * 0.15;
      if (Math.abs(player.speed) < 0.01) player.speed = 0;
      player.speed = clamp(player.speed, -maxSpeed * 0.35, maxSpeed);

      player.x += Math.cos(player.angle) * player.speed * dt;
      player.y += Math.sin(player.angle) * player.speed * dt;

      // collision with inner/outer wall
      const dx = player.x - cx;
      const dy = player.y - cy;
      const r = Math.hypot(dx, dy);
      if (r < innerR - 12){
        const ang = Math.atan2(dy, dx);
        player.x = cx + Math.cos(ang) * (innerR - 12);
        player.y = cy + Math.sin(ang) * (innerR - 12);
        player.speed *= -0.35;
      } else if (r > outerR + 12){
        const ang = Math.atan2(dy, dx);
        player.x = cx + Math.cos(ang) * (outerR + 12);
        player.y = cy + Math.sin(ang) * (outerR + 12);
        player.speed *= -0.25;
      }

      if (player.turboActive){
        player.turboTimer -= dt;
        if (player.turboTimer <= 0){
          player.turboActive = false;
        }
      } else if (player.turboGauge > 0){
        player.turboGauge = clamp(player.turboGauge - dt / 12, 0, 1);
      }

      const progress = normAngle(Math.atan2(player.y - cy, player.x - cx));
      boostForProgress(progress, player);
      handleLapProgress(player, progress, dt, true);
    }

    function updateAi(dt){
      for (const car of aiCars){
        if (car.finishTime) continue;
        car.speed += (car.targetSpeed - car.speed) * dt * 2.5;
        if (Math.random() < 0.02){
          car.targetSpeed = clamp(car.targetSpeed + randRange(-0.01, 0.01), cfg.aiSpeedRange[0], cfg.aiSpeedRange[1] * 1.05);
        }
        car.progress += car.speed * dt;
        if (car.progress >= 1){
          car.progress -= 1;
        }
        const progress = (car.progress + 1) % 1;
        handleLapProgress(car, progress, dt, false);
      }
    }

    function handleLapProgress(entity, progress, dt, isPlayer){
      if (!entity.lapTime) entity.lapTime = 0;
      entity.lapTime += dt;
      if (entity.progress === undefined) entity.progress = progress;
      const prev = entity.progress;
      entity.progress = progress;

      const crossing = prev > 0.8 && progress < 0.2;
      if (crossing && !entity.justCrossed){
        entity.justCrossed = true;
        entity.lap += 1;
        if (isPlayer){
          if (entity.lap > 0){
            awardXp(cfg.lapXp, { type: 'lap', lap: entity.lap, difficulty });
            xpEarned.lap += cfg.lapXp;
          }
          if (entity.lapTime < entity.bestLap){
            entity.bestLap = entity.lapTime;
            awardXp(cfg.bestXp, { type: 'best', lap: entity.lap, difficulty });
            xpEarned.best += cfg.bestXp;
          }
        }
        if (entity.lap >= cfg.laps && !entity.finishTime){
          entity.finishTime = totalTime;
          if (isPlayer){
            entity.finished = true;
            running = false;
            state = 'finished';
            showResult();
          }
        }
        entity.lapTime = 0;
        if (isPlayer) entity.turboGauge = clamp(entity.turboGauge + 0.35, 0, 1);
      } else if (progress >= 0.2){
        entity.justCrossed = false;
      }
    }

    function showResult(){
      finishOrder = buildFinishOrder();
      const playerPos = finishOrder.findIndex(entry => entry.id === 'player') + 1;
      const xpFinish = cfg.finishXp[Math.min(playerPos - 1, cfg.finishXp.length - 1)] || 0;
      if (xpFinish > 0){
        awardXp(xpFinish, { type: 'finish', place: playerPos, difficulty });
        xpEarned.finish += xpFinish;
      }
      resultPanel.style.display = 'block';
      resultPanel.innerHTML = `
        <h2 style="margin-top:0;font-size:24px;letter-spacing:0.05em;">レース結果</h2>
        <p style="margin:4px 0 16px;color:#94a3b8;">総タイム ${formatTime(totalTime)}</p>
        <table style="width:100%;margin-bottom:16px;color:#cbd5f5;font-size:13px;border-collapse:collapse;">
          <thead><tr style="text-align:left;color:#94a3b8;"><th style="padding-bottom:6px;">順位</th><th>ドライバー</th><th style="text-align:right;">フィニッシュ</th></tr></thead>
          <tbody>
            ${finishOrder.map((entry, idx) => `
              <tr>
                <td style="padding:4px 0;">${idx+1}</td>
                <td>${entry.name}</td>
                <td style="text-align:right;">${entry.time ? formatTime(entry.time) : 'DNF'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="font-size:13px;color:#94a3b8;margin-bottom:10px;">獲得EXP: ラップ${xpEarned.lap} / ベスト${xpEarned.best} / ブースト${xpEarned.boost} / フィニッシュ${xpEarned.finish}</div>
        <div style="font-size:12px;color:#60a5fa;">Rキーで再スタート</div>
      `;
    }

    function buildFinishOrder(){
      const standings = getStandings();
      return standings.map(entry => ({ id: entry.id, name: entry.name, time: entry.time }));
    }

    function getStandings(){
      const list = [];
      list.push({ id: 'player', name: 'You', lap: player.lap, progress: player.progress || 0, time: player.finishTime });
      for (const car of aiCars){
        list.push({ id: car.name, name: car.name, lap: car.lap, progress: car.progress || 0, time: car.finishTime });
      }
      list.sort((a, b) => {
        const aFinished = a.time != null;
        const bFinished = b.time != null;
        if (aFinished && bFinished){
          return a.time - b.time;
        }
        if (aFinished) return -1;
        if (bFinished) return 1;
        if (a.lap !== b.lap) return b.lap - a.lap;
        return b.progress - a.progress;
      });
      return list;
    }

    function updateHud(){
      const lapLabel = player.finished ? cfg.laps : Math.min(player.lap + 1, cfg.laps);
      const bestLabel = isFinite(player.bestLap) ? formatTime(player.bestLap) : '-';
      const turboPct = Math.round(player.turboGauge * 100);
      const speedKmh = Math.round(Math.abs(player.speed) * metersPerPixel * 3.6);
      speedMeter.value.textContent = `${speedKmh} km/h`;
      const speedPct = clamp(Math.abs(player.speed) / surfaces.track.maxSpeed, 0, 1) * 100;
      speedMeter.fill.style.width = `${speedPct.toFixed(1)}%`;
      turboMeter.value.textContent = `${turboPct}%`;
      turboMeter.fill.style.width = `${turboPct}%`;
      const lapProgress = player.finished ? 1 : (player.progress || 0);
      const lapPct = clamp(lapProgress, 0, 1) * 100;
      lapMeter.value.textContent = `${Math.round(lapPct)}%`;
      lapMeter.fill.style.width = `${lapPct.toFixed(1)}%`;

      const lines = [
        `<div style="font-size:15px;margin-bottom:4px;font-weight:600;">Aurora Circuit (${difficulty})</div>`,
        `<div>Lap: <strong>${Math.min(player.lap, cfg.laps)}/${cfg.laps}</strong> (Next ${lapLabel})</div>`,
        `<div>Lap Time: ${formatTime(player.lapTime || 0)}</div>`,
        `<div>Best Lap: ${bestLabel}</div>`,
        `<div>Turbo: ${turboPct}% ${player.turboActive ? '(Active)' : ''}</div>`
      ];
      const standings = getStandings();
      const playerPos = standings.findIndex(entry => entry.id === 'player') + 1;
      if (playerPos > 0){
        lines.push(`<div>Position: <strong>${playerPos}/${standings.length}</strong></div>`);
      }
      lines.push(`<div style="margin-top:8px;font-weight:600;">ライバル</div>`);
      for (const entry of standings){
        if (entry.id === 'player') continue;
        let diff = '';
        if (state === 'finished'){
          if (player.finishTime && entry.time){
            diff = formatDelta(entry.time - player.finishTime);
          } else if (entry.time == null){
            diff = 'DNF';
          }
        } else if (entry.time != null && !player.finishTime){
          diff = 'FIN';
        } else {
          const delta = computeTimeGap(entry);
          diff = `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}s`;
        }
        if (!diff){
          diff = '-';
        }
        if (entry.time == null){
          diff += ` · Lap ${Math.min(entry.lap, cfg.laps)}/${cfg.laps}`;
        }
        lines.push(`<div style="display:flex;justify-content:space-between;"><span>${entry.name}</span><span>${diff}</span></div>`);
      }
      hud.innerHTML = lines.join('');
    }

    function computeTimeGap(entry){
      if (!entry) return 0;
      const avgSpeed = (cfg.aiSpeedRange[0] + cfg.aiSpeedRange[1]) / 2;
      const estimatedLapTime = avgSpeed > 0 ? (1 / avgSpeed) : 0;
      const playerProgress = player.finishTime ? cfg.laps : (player.lap + (player.progress || 0));
      const rivalProgress = entry.time != null ? cfg.laps : (entry.lap + (entry.progress || 0));
      const gapLaps = rivalProgress - playerProgress;
      return gapLaps * estimatedLapTime;
    }

    function draw(){
      ctx.clearRect(0, 0, size.width, size.height);
      drawTrack();
      drawBoostZones();
      drawStartLine();
      drawCar(player, '#38f9d7', true);
      for (const car of aiCars){
        drawAICar(car);
      }
      drawMiniMap();
      if (state === 'countdown'){
        overlay.style.display = 'flex';
        overlay.textContent = countdown > 0 ? Math.ceil(countdown) : 'GO!';
      } else if (state === 'finished'){
        overlay.style.display = 'none';
      } else if (state === 'running'){
        overlay.style.display = 'none';
      } else {
        overlay.style.display = 'flex';
        overlay.style.fontSize = '32px';
        overlay.textContent = 'Press START';
      }
    }

    function drawTrack(){
      ctx.save();
      ctx.translate(cx, cy);
      const grad = ctx.createRadialGradient(0,0, innerR, 0,0, outerR+60);
      grad.addColorStop(0, 'rgba(15,23,42,0.9)');
      grad.addColorStop(0.5, 'rgba(15,23,42,0.8)');
      grad.addColorStop(1, 'rgba(2,6,23,0.95)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, outerR + 60, 0, TAU);
      ctx.fill();

      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(0, 0, outerR, 0, TAU);
      ctx.fill();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(0, 0, innerR, 0, TAU);
      ctx.fill();

      ctx.setLineDash([16, 16]);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.55)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, 0, (outerR + innerR) / 2, 0, TAU);
      ctx.stroke();

      ctx.restore();
    }

    function drawBoostZones(){
      ctx.save();
      ctx.translate(cx, cy);
      ctx.lineWidth = 16;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineCap = 'round';
      for (const zone of boostZones){
        ctx.beginPath();
        ctx.arc(0, 0, (outerR + innerR) / 2, startAngle + zone.start * TAU, startAngle + zone.end * TAU);
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawStartLine(){
      ctx.save();
      ctx.translate(cx, cy);
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(Math.cos(startAngle) * innerR, Math.sin(startAngle) * innerR);
      ctx.lineTo(Math.cos(startAngle) * outerR, Math.sin(startAngle) * outerR);
      ctx.stroke();
      ctx.restore();
    }

    function drawRoundedRect(ctx, x, y, w, h, radius){
      const r = Math.min(radius, Math.abs(w) / 2, Math.abs(h) / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }

    function drawCar(car, color, isPlayer){
      const ang = isPlayer ? car.angle : (startAngle + (car.progress || 0) * TAU + Math.PI / 2);
      const pos = isPlayer ? { x: car.x, y: car.y } : polarToXY(car.progress, car.lap, car.laneOffset);
      const sizeCar = isPlayer ? { w: 28, h: 48 } : { w: 26, h: 46 };
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate(ang);
      ctx.fillStyle = color;
      ctx.shadowColor = car.turboActive ? 'rgba(56, 249, 215, 0.8)' : 'rgba(15, 23, 42, 0.4)';
      ctx.shadowBlur = car.turboActive ? 24 : 12;
      drawRoundedRect(ctx, -sizeCar.w/2, -sizeCar.h/2, sizeCar.w, sizeCar.h, 6);
      ctx.fill();
      ctx.fillStyle = 'rgba(15,23,42,0.85)';
      ctx.fillRect(-sizeCar.w/2+4, -sizeCar.h/2+6, sizeCar.w-8, sizeCar.h/2);
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.beginPath();
      ctx.moveTo(0, -sizeCar.h/2);
      ctx.lineTo(sizeCar.w/2-6, -sizeCar.h/2+12);
      ctx.lineTo(-sizeCar.w/2+6, -sizeCar.h/2+12);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function drawAICar(car){
      const pos = polarToXY(car.progress, car.lap, car.laneOffset);
      ctx.save();
      ctx.translate(pos.x, pos.y);
      const ang = startAngle + (car.progress || 0) * TAU + Math.PI / 2;
      ctx.rotate(ang);
      ctx.fillStyle = car.color;
      ctx.shadowColor = 'rgba(15, 23, 42, 0.35)';
      ctx.shadowBlur = 14;
      drawRoundedRect(ctx, -12, -20, 24, 40, 6);
      ctx.fill();
      ctx.restore();
    }

    function polarToXY(progress, lap, offset){
      const radius = (outerR + innerR) / 2 + (offset || 0);
      const angle = startAngle + (progress || 0) * TAU;
      return {
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius
      };
    }

    function formatTime(t){
      if (!isFinite(t) || t < 0) return '-';
      const minutes = Math.floor(t / 60);
      const seconds = t % 60;
      return `${minutes}:${seconds.toFixed(3).padStart(6, '0')}`;
    }

    function formatDelta(delta){
      const sign = delta >= 0 ? '+' : '-';
      const abs = Math.abs(delta);
      return `${sign}${abs.toFixed(3)}s`;
    }

    function drawMiniMap(){
      miniMapCtx.clearRect(0, 0, miniMapSize, miniMapSize);
      miniMapCtx.save();
      miniMapCtx.translate(miniMapSize / 2, miniMapSize / 2);

      miniMapCtx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      miniMapCtx.fillRect(-miniMapSize / 2, -miniMapSize / 2, miniMapSize, miniMapSize);

      const outerRadius = outerR * miniMapScale + 6;
      const innerRadius = Math.max(4, innerR * miniMapScale - 6);

      miniMapCtx.fillStyle = '#1e293b';
      miniMapCtx.beginPath();
      miniMapCtx.arc(0, 0, outerRadius, 0, TAU);
      miniMapCtx.fill();

      miniMapCtx.fillStyle = '#020617';
      miniMapCtx.beginPath();
      miniMapCtx.arc(0, 0, innerRadius, 0, TAU);
      miniMapCtx.fill();

      miniMapCtx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
      miniMapCtx.lineWidth = 3;
      miniMapCtx.setLineDash([6, 10]);
      miniMapCtx.beginPath();
      miniMapCtx.arc(0, 0, trackRadius * miniMapScale, 0, TAU);
      miniMapCtx.stroke();
      miniMapCtx.setLineDash([]);

      miniMapCtx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      miniMapCtx.lineWidth = 5;
      miniMapCtx.lineCap = 'round';
      for (const zone of boostZones){
        miniMapCtx.beginPath();
        miniMapCtx.arc(0, 0, trackRadius * miniMapScale, startAngle + zone.start * TAU, startAngle + zone.end * TAU);
        miniMapCtx.stroke();
      }

      miniMapCtx.strokeStyle = '#f8fafc';
      miniMapCtx.lineWidth = 4;
      miniMapCtx.beginPath();
      miniMapCtx.moveTo(Math.cos(startAngle) * innerR * miniMapScale, Math.sin(startAngle) * innerR * miniMapScale);
      miniMapCtx.lineTo(Math.cos(startAngle) * outerR * miniMapScale, Math.sin(startAngle) * outerR * miniMapScale);
      miniMapCtx.stroke();

      const drawMarker = (x, y, color, size = 6, pulse = false) => {
        miniMapCtx.fillStyle = color;
        miniMapCtx.beginPath();
        miniMapCtx.arc((x - cx) * miniMapScale, (y - cy) * miniMapScale, size * (pulse ? 1.25 : 1), 0, TAU);
        miniMapCtx.fill();
      };

      for (const car of aiCars){
        const pos = polarToXY(car.progress, car.lap, car.laneOffset);
        drawMarker(pos.x, pos.y, car.color, 4);
      }

      drawMarker(player.x, player.y, player.turboActive ? '#38f9d7' : '#bef264', 6, player.turboActive);

      miniMapCtx.restore();
    }

    function onKeyDown(e){
      keys[e.key] = true;
      keys[e.code] = true;
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.code === 'Space'){
        e.preventDefault();
      }
      if (e.code === 'Space'){
        if (player.turboGauge > 0.2 && !player.turboActive){
          player.turboActive = true;
          player.turboTimer = cfg.turboDuration;
          player.turboGauge = clamp(player.turboGauge - 0.2, 0, 1);
        }
      }
      if ((e.key === 'r' || e.key === 'R') && state === 'finished'){
        e.preventDefault();
        reset();
        start();
      }
    }

    function onKeyUp(e){
      keys[e.key] = false;
      keys[e.code] = false;
    }

    function reset(){
      player.x = cx + Math.cos(startAngle) * ((innerR + outerR) / 2);
      player.y = cy + Math.sin(startAngle) * ((innerR + outerR) / 2);
      player.angle = 0;
      player.speed = 0;
      player.lap = 0;
      player.lapTime = 0;
      player.bestLap = Infinity;
      player.justCrossed = false;
      player.turboGauge = 0;
      player.turboActive = false;
      player.turboTimer = 0;
      player.finished = false;
      player.finishTime = null;
      player.progress = 0;
      player.lastProgress = 0;
      xpEarned = { lap: 0, best: 0, boost: 0, finish: 0 };
      totalTime = 0;
      countdown = 3;
      countdownTimer = 0;
      state = 'countdown';
      running = false;
      overlay.style.fontSize = '56px';
      overlay.textContent = '3';
      overlay.style.display = 'flex';
      resultPanel.style.display = 'none';
      finishOrder = [];
      for (const zone of boostZones){
        zone.cooldown = 0;
      }
      for (let i = 0; i < aiCars.length; i++){
        const car = aiCars[i];
        car.progress = (0.8 - i * 0.05 + TAU) % 1;
        car.speed = randRange(cfg.aiSpeedRange[0], cfg.aiSpeedRange[1]);
        car.targetSpeed = randRange(cfg.aiSpeedRange[0], cfg.aiSpeedRange[1]);
        car.lap = 0;
        car.lapTime = 0;
        car.justCrossed = false;
        car.finishTime = null;
      }
    }

    function startCountdown(dt){
      countdownTimer += dt;
      if (countdownTimer >= 1){
        countdown -= 1;
        countdownTimer = 0;
        if (countdown <= 0){
          overlay.textContent = 'GO!';
          state = 'running';
          running = true;
          setTimeout(() => overlay.style.display = 'none', 420);
        } else {
          overlay.textContent = countdown;
        }
      }
    }

    function loop(ts){
      raf = requestAnimationFrame(loop);
      const now = ts * 0.001;
      const dt = Math.min(0.05, lastTs ? now - lastTs : 0);
      lastTs = now;
      if (state === 'countdown'){
        startCountdown(dt);
      }
      if (running){
        totalTime += dt;
        updatePlayer(dt);
        updateAi(dt);
      }
      updateHud();
      draw();
    }

    function start(){
      if (state === 'idle' || state === 'finished'){
        reset();
      }
      if (!raf){
        raf = requestAnimationFrame(loop);
      }
    }

    function stop(){
      running = false;
    }

    function destroy(){
      cancelAnimationFrame(raf);
      raf = 0;
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      container.remove();
    }

    function getScore(){
      return player.lap;
    }

    document.addEventListener('keydown', onKeyDown, { passive: false });
    document.addEventListener('keyup', onKeyUp, { passive: false });

    reset();
    start();

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({
    id: 'topdown_race',
    name: 'Aurora Circuit',
    description: '見下ろし型周回レース。ラップと順位でEXP獲得',
    create
  });
})();

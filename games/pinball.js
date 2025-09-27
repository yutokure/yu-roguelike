(function(){
  const DEG = Math.PI/180;

  function create(root, awardXp, opts){
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.alignItems = 'center';
    wrapper.style.gap = '8px';
    wrapper.style.color = '#e2e8f0';
    wrapper.style.fontFamily = "'Segoe UI', sans-serif";

    const info = document.createElement('div');
    info.style.display = 'flex';
    info.style.flexWrap = 'wrap';
    info.style.justifyContent = 'center';
    info.style.gap = '16px';
    info.style.fontSize = '14px';
    info.innerHTML = `
      <span>左右フリッパー: ← / → または A / D</span>
      <span>プランジャー: スペースキー長押しでショット</span>
      <span>Rキー: リセット</span>
    `;
    wrapper.appendChild(info);

    const status = document.createElement('div');
    status.style.display = 'flex';
    status.style.gap = '18px';
    status.style.fontSize = '15px';
    status.style.fontWeight = '600';
    wrapper.appendChild(status);

    const missionInfo = document.createElement('div');
    missionInfo.style.fontSize = '13px';
    missionInfo.style.lineHeight = '1.5';
    missionInfo.style.textAlign = 'center';
    missionInfo.style.minHeight = '56px';
    missionInfo.style.padding = '4px 12px';
    missionInfo.style.borderRadius = '10px';
    missionInfo.style.background = 'rgba(15, 23, 42, 0.45)';
    missionInfo.style.border = '1px solid rgba(148, 163, 184, 0.35)';
    wrapper.appendChild(missionInfo);

    const skillInfo = document.createElement('div');
    skillInfo.style.fontSize = '12px';
    skillInfo.style.opacity = '0.85';
    skillInfo.style.textAlign = 'center';
    skillInfo.style.minHeight = '22px';
    wrapper.appendChild(skillInfo);

    const announcer = document.createElement('div');
    announcer.style.minHeight = '28px';
    announcer.style.fontSize = '14px';
    announcer.style.fontWeight = '600';
    announcer.style.color = '#facc15';
    announcer.style.transition = 'opacity 0.3s ease';
    announcer.style.opacity = '0';
    wrapper.appendChild(announcer);

    const canvas = document.createElement('canvas');
    const W = 600, H = 820;
    canvas.width = W; canvas.height = H;
    canvas.style.width = 'min(100%, 600px)';
    canvas.style.maxWidth = '100%';
    canvas.style.background = '#0b1020';
    canvas.style.borderRadius = '18px';
    canvas.style.boxShadow = '0 18px 36px rgba(15, 23, 42, 0.45)';
    canvas.style.border = '3px solid #1e293b';
    wrapper.appendChild(canvas);

    root.appendChild(wrapper);

    const ctx = canvas.getContext('2d');

    const table = {
      left: 70,
      right: W - 70,
      top: 70,
      bottom: H - 80,
      drainWidth: 120
    };

    let lives = 3;
    let totalXp = 0;
    let bonusChain = 1;
    let score = 0;
    let running = false;
    let rafId = 0;
    let paused = false;
    let mission = null;
    let missionTimer = 0;
    let lastMissionId = null;
    let comboTimer = 0;
    let comboCount = 0;
    let skillShotTarget = 0;
    let skillShotTimer = 0;
    let skillShotReady = true;
    let announcementTimeout = 0;

    const gravity = 0.28;
    const friction = 0.995;

    const ball = {
      x: W - 110,
      y: table.bottom - 30,
      vx: 0,
      vy: 0,
      r: 10,
      held: true,
      plungerPower: 0
    };

    const plunger = {
      x: W - 100,
      width: 36,
      top: table.top + 20,
      bottom: table.bottom - 20,
      pullMax: 70
    };

    const flippers = [
      {
        side: 'left',
        pivotX: table.left + 110,
        pivotY: table.bottom - 20,
        length: 120,
        restAngle: -22 * DEG,
        activeAngle: 52 * DEG,
        angle: -22 * DEG,
        speed: 0,
        pressing: false,
        thickness: 18,
        lastHit: 0
      },
      {
        side: 'right',
        pivotX: table.right - 110,
        pivotY: table.bottom - 20,
        length: 120,
        restAngle: Math.PI + 22 * DEG,
        activeAngle: Math.PI - 52 * DEG,
        angle: Math.PI + 22 * DEG,
        speed: 0,
        pressing: false,
        thickness: 18,
        lastHit: 0
      }
    ];

    const bumpers = [
      { x: W/2, y: table.top + 150, r: 36, boost: 4.5, xp: 8, color: '#f97316', cooldown: 0 },
      { x: table.left + 140, y: table.top + 230, r: 32, boost: 4.2, xp: 6, color: '#22d3ee', cooldown: 0 },
      { x: table.right - 140, y: table.top + 230, r: 32, boost: 4.2, xp: 6, color: '#a855f7', cooldown: 0 }
    ];

    const slingshots = [
      // Left
      { ax: table.left + 45, ay: table.bottom - 120, bx: table.left + 140, by: table.bottom - 60, power: 7, xp: 4, cooldown: 0 },
      // Right
      { ax: table.right - 45, ay: table.bottom - 120, bx: table.right - 140, by: table.bottom - 60, power: 7, xp: 4, cooldown: 0 }
    ];

    const rollovers = [
      { x: table.left + 80, width: 90, y: table.top + 40, hit: false, label: 'L' },
      { x: table.left + 190, width: 90, y: table.top + 40, hit: false, label: 'M' },
      { x: table.left + 300, width: 90, y: table.top + 40, hit: false, label: 'R' }
    ];

    const missionTypes = [
      { id: 'bumper-blitz', name: 'バンパーブリッツ', description: 'バンパーに6回ヒットしよう', event: 'bumper', target: 6, reward: 45, duration: 60 * 45 },
      { id: 'sling-storm', name: 'スリングストーム', description: 'スリングショットを4回作動させる', event: 'sling', target: 4, reward: 35, duration: 60 * 35 },
      { id: 'lane-master', name: 'レーンマスター', description: 'L/M/Rレーンセットを2回完成', event: 'lane-set', target: 2, reward: 60, duration: 60 * 55 },
      { id: 'post-challenge', name: 'ポストチャレンジ', description: 'ポストに5回ヒット', event: 'post', target: 5, reward: 40, duration: 60 * 40 }
    ];

    const posts = [
      { x: table.left + 165, y: table.bottom - 42, r: 18, cooldown: 0, xp: 3 },
      { x: table.right - 165, y: table.bottom - 42, r: 18, cooldown: 0, xp: 3 },
      { x: table.left + 40, y: table.bottom - 150, r: 16, cooldown: 0, xp: 3 },
      // 右下レーンを塞がないよう、ポストを左へ寄せて通路を確保する
      { x: table.right - 75, y: table.bottom - 150, r: 16, cooldown: 0, xp: 3 }
    ];

    const sparks = [];

    function award(amount, meta){
      totalXp += amount;
      awardXp && awardXp(amount, meta);
    }

    function updateMissionDisplay(){
      if (!mission){
        missionInfo.innerHTML = `<strong>ミッション:</strong> なし<br><span style="opacity:0.75">L/M/Rレーンを揃えて新しいミッションを開始</span>`;
      } else {
        const remain = Math.max(0, Math.ceil(missionTimer / 60));
        missionInfo.innerHTML = `<strong>ミッション:</strong> ${mission.name}<br>${mission.description}<br>進行: ${mission.progress} / ${mission.target}（残り${remain}s）`;
      }
    }

    function updateSkillInfo(){
      const target = rollovers[skillShotTarget];
      if (!target){
        skillInfo.textContent = '';
        return;
      }
      if (skillShotTimer > 0){
        skillInfo.textContent = `スキルショット: ${target.label} レーン / 残り ${Math.ceil(skillShotTimer / 60)}s`;
      } else if (ball.held && skillShotReady){
        skillInfo.textContent = `スキルショット準備完了: ${target.label} レーンを狙おう！`;
      } else {
        skillInfo.textContent = `次のスキルショット標的: ${target.label} レーン`;
      }
    }

    function pushAnnouncement(message){
      announcer.textContent = message;
      announcer.style.opacity = '1';
      if (announcementTimeout){
        clearTimeout(announcementTimeout);
      }
      announcementTimeout = setTimeout(() => {
        announcer.style.opacity = '0';
      }, 2000);
    }

    function chooseSkillShotTarget(){
      skillShotTarget = Math.floor(Math.random() * rollovers.length);
    }

    function startMission(initialEvent){
      const candidates = missionTypes.filter(m => m.id !== lastMissionId);
      const def = candidates[Math.floor(Math.random() * candidates.length)] || missionTypes[0];
      mission = { ...def, progress: 0 };
      missionTimer = def.duration;
      lastMissionId = def.id;
      if (initialEvent && mission.event === initialEvent){
        mission.progress = 1;
      }
      updateMissionDisplay();
      pushAnnouncement(`${def.name} 開始！`);
      if (mission.progress >= mission.target){
        completeMission();
      }
    }

    function completeMission(){
      if (!mission) return;
      const reward = Math.round(mission.reward * bonusChain);
      award(reward, { type: 'mission', id: mission.id, chain: bonusChain });
      score += reward * 18;
      bonusChain = Math.min(8, bonusChain + 1.1);
      pushAnnouncement(`${mission.name} クリア！ +${reward}EXP`);
      mission = null;
      missionTimer = 0;
      updateMissionDisplay();
    }

    function failMission(){
      if (!mission) return;
      pushAnnouncement(`${mission.name} 失敗…`);
      mission = null;
      missionTimer = 0;
      updateMissionDisplay();
    }

    function onMissionEvent(type){
      if (!mission || mission.event !== type) return;
      mission.progress++;
      updateMissionDisplay();
      if (mission.progress >= mission.target){
        completeMission();
      }
    }

    function registerCombo(){
      if (comboTimer > 0){
        comboCount++;
      } else {
        comboCount = 1;
      }
      comboTimer = 90;
      if (comboCount >= 3){
        const comboXp = 4 * comboCount;
        award(comboXp, { type: 'combo', count: comboCount });
        score += comboXp * 14;
        bonusChain = Math.min(7.5, bonusChain + comboCount * 0.05);
        pushAnnouncement(`コンボ ${comboCount}！ +${comboXp}EXP`);
      }
    }

    function resetRollovers(){
      rollovers.forEach(r => r.hit = false);
      bonusChain = 1;
    }

    function resetBall(drained){
      ball.x = W - 110;
      ball.y = table.bottom - 30;
      ball.vx = 0;
      ball.vy = 0;
      ball.held = true;
      ball.plungerPower = 0;
      skillShotTimer = 0;
      skillShotReady = true;
      chooseSkillShotTarget();
      if (drained){
        bonusChain = 1;
        comboCount = 0;
        comboTimer = 0;
      }
    }

    function fullReset(){
      lives = 3;
      totalXp = 0;
      score = 0;
      bonusChain = 1;
      resetRollovers();
      resetBall();
      mission = null;
      missionTimer = 0;
      lastMissionId = null;
      comboCount = 0;
      comboTimer = 0;
      updateMissionDisplay();
      updateSkillInfo();
      updateStatus();
    }

    function updateStatus(){
      status.textContent = `Balls: ${lives} / Score: ${score} / EXP: ${totalXp} / Chain: x${bonusChain.toFixed(1)} / Combo: ${comboCount > 1 ? comboCount : '-'}`;
      updateMissionDisplay();
      updateSkillInfo();
    }

    chooseSkillShotTarget();
    updateStatus();

    function reflectVelocity(nx, ny){
      const dot = ball.vx * nx + ball.vy * ny;
      ball.vx -= 2 * dot * nx;
      ball.vy -= 2 * dot * ny;
    }

    function collideCircle(target, dtStep){
      const dx = ball.x - target.x;
      const dy = ball.y - target.y;
      const dist = Math.hypot(dx, dy);
      const limit = ball.r + target.r;
      if (dist < limit){
        const nx = dist === 0 ? 0 : dx / dist;
        const ny = dist === 0 ? -1 : dy / dist;
        const overlap = limit - dist;
        ball.x += nx * overlap;
        ball.y += ny * overlap;
        reflectVelocity(nx, ny);
        ball.vx += nx * target.boost;
        ball.vy += ny * target.boost;
        addSparks(ball.x, ball.y, target.color || '#f8fafc');
        if (target.xp && (!target.cooldown || target.cooldown <= 0)){
          const gain = Math.round(target.xp * bonusChain);
          award(gain, { type: 'bumper', baseXp: target.xp, chain: bonusChain });
          score += gain * 10;
          bonusChain = Math.min(5, bonusChain + 0.25);
          target.cooldown = 18;
          registerCombo();
          onMissionEvent('bumper');
        }
        return true;
      }
      if (target.cooldown !== undefined && target.cooldown > 0){
        target.cooldown = Math.max(0, target.cooldown - dtStep);
      }
      return false;
    }

    function collidePost(target, dtStep){
      const dx = ball.x - target.x;
      const dy = ball.y - target.y;
      const dist = Math.hypot(dx, dy);
      const limit = ball.r + target.r;
      if (dist < limit){
        const nx = dist === 0 ? 0 : dx / dist;
        const ny = dist === 0 ? -1 : dy / dist;
        const overlap = limit - dist;
        ball.x += nx * overlap;
        ball.y += ny * overlap;
        reflectVelocity(nx, ny);
        ball.vx *= 0.92;
        ball.vy *= 0.92;
        addSparks(ball.x, ball.y, '#cbd5f5');
        if (target.cooldown <= 0){
          const gain = Math.round(target.xp * bonusChain);
          award(gain, { type: 'post', baseXp: target.xp, chain: bonusChain });
          score += gain * 8;
          target.cooldown = 14;
          registerCombo();
          onMissionEvent('post');
        }
      }
      target.cooldown = Math.max(0, (target.cooldown || 0) - dtStep);
    }

    function collideSlingshot(s, dtStep){
      const ax = s.ax, ay = s.ay;
      const bx = s.bx, by = s.by;
      const dx = bx - ax;
      const dy = by - ay;
      const len2 = dx*dx + dy*dy;
      if (len2 === 0) return;
      const t = Math.max(0, Math.min(1, ((ball.x-ax)*dx + (ball.y-ay)*dy) / len2));
      const px = ax + dx * t;
      const py = ay + dy * t;
      const dist = Math.hypot(ball.x - px, ball.y - py);
      if (dist < ball.r + 8){
        const nx = (py - ay);
        const ny = -(px - ax);
        const nl = Math.hypot(nx, ny) || 1;
        const ux = nx / nl;
        const uy = ny / nl;
        reflectVelocity(ux, uy);
        ball.vx += ux * s.power;
        ball.vy += uy * s.power;
        addSparks(px, py, '#f1f5f9');
        if (s.xp && (!s.cooldown || s.cooldown <= 0)){
          const gain = Math.round(s.xp * bonusChain);
          award(gain, { type: 'sling', baseXp: s.xp, chain: bonusChain });
          score += gain * 6;
          s.cooldown = 12;
          registerCombo();
          onMissionEvent('sling');
        }
      }
      if (s.cooldown !== undefined && s.cooldown > 0){
        s.cooldown = Math.max(0, s.cooldown - dtStep);
      }
    }

    function collideFlipper(f, dtStep){
      const ax = f.pivotX;
      const ay = f.pivotY;
      const bx = ax + Math.cos(f.angle) * f.length;
      const by = ay + Math.sin(f.angle) * f.length;
      const dx = bx - ax;
      const dy = by - ay;
      const len2 = dx*dx + dy*dy;
      if (len2 === 0) return;
      const t = Math.max(0, Math.min(1, ((ball.x-ax)*dx + (ball.y-ay)*dy) / len2));
      const px = ax + dx * t;
      const py = ay + dy * t;
      const dist = Math.hypot(ball.x - px, ball.y - py);
      if (dist < ball.r + f.thickness/2){
        const nx = (py - ay);
        const ny = -(px - ax);
        const nl = Math.hypot(nx, ny) || 1;
        const ux = nx / nl;
        const uy = ny / nl;
        reflectVelocity(ux, uy);
        const strength = f.pressing ? 12 : 4;
        ball.vx += ux * strength;
        ball.vy += uy * strength;
        if (ball.vy > -2) ball.vy = -2;
        addSparks(px, py, '#facc15');
        if (f.pressing){
          score += 5;
        }
        if (f.lastHit <= 0){
          award(2, { type: 'flipper' });
          f.lastHit = 10;
        }
      }
      f.lastHit = Math.max(0, f.lastHit - dtStep);
    }

    function updateFlippers(dt){
      const rate = dt * 0.018;
      for (const f of flippers){
        const target = f.pressing ? f.activeAngle : f.restAngle;
        const delta = target - f.angle;
        f.angle += delta * Math.min(1, rate * (f.pressing ? 6 : 3));
      }
    }

    function drawFlipper(f){
      const ax = f.pivotX;
      const ay = f.pivotY;
      const bx = ax + Math.cos(f.angle) * f.length;
      const by = ay + Math.sin(f.angle) * f.length;
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = f.thickness;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(ax, ay, f.thickness/1.6, 0, Math.PI*2);
      ctx.fill();
    }

    function addSparks(x, y, color){
      for (let i = 0; i < 10; i++){
        sparks.push({
          x,
          y,
          vx: (Math.random()*2-1)*3,
          vy: (Math.random()*2-1)*3,
          life: 22,
          color
        });
      }
    }

    function updateSparks(){
      for (let i = sparks.length - 1; i >= 0; i--){
        const p = sparks[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.life--;
        if (p.life <= 0) sparks.splice(i, 1);
      }
    }

    function drawSparks(){
      for (const p of sparks){
        const alpha = Math.max(0, p.life / 22);
        ctx.fillStyle = typeof p.color === 'string' ? p.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba') : `rgba(248, 250, 252, ${alpha})`;
        if (p.color && p.color.startsWith('#')){
          ctx.fillStyle = hexToRgba(p.color, alpha);
        }
        ctx.fillRect(p.x, p.y, 2, 2);
      }
    }

    function hexToRgba(hex, alpha){
      const bigint = parseInt(hex.slice(1), 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    function drawRoundedRect(ctx, x, y, w, h, r){
      if (ctx.roundRect){
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
        return;
      }
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

    function drawTable(){
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#0b1020';
      ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 4;
      ctx.strokeRect(table.left - 16, table.top - 16, (table.right - table.left) + 32, (table.bottom - table.top) + 32);
      ctx.restore();

      // playfield gradient
      const grad = ctx.createLinearGradient(0, table.top, 0, table.bottom);
      grad.addColorStop(0, '#111c35');
      grad.addColorStop(1, '#050914');
      ctx.fillStyle = grad;
      drawRoundedRect(ctx, table.left, table.top, table.right - table.left, table.bottom - table.top, 28);
      ctx.fill();

      // drain gap shading
      ctx.fillStyle = '#020617';
      ctx.fillRect(table.left, table.bottom - 10, table.right - table.left, 40);
      ctx.fillStyle = '#111827';
      ctx.fillRect(W/2 - table.drainWidth/2, table.bottom - 12, table.drainWidth, 36);

      // rollovers
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      rollovers.forEach((r, index) => {
        let fill = '#334155';
        if (r.hit){
          fill = '#22c55e';
        } else if ((skillShotTimer > 0 || (ball.held && skillShotReady)) && index === skillShotTarget){
          fill = '#fbbf24';
        }
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(r.x + r.width/2, r.y, 22, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.fillText(r.label, r.x + r.width/2, r.y);
      });

      // bumpers
      for (const b of bumpers){
        const ring = ctx.createRadialGradient(b.x, b.y, 6, b.x, b.y, b.r);
        ring.addColorStop(0, '#f8fafc');
        ring.addColorStop(1, b.color);
        ctx.fillStyle = ring;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
        ctx.fill();
      }

      // slingshot guides
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (const s of slingshots){
        ctx.moveTo(s.ax, s.ay);
        ctx.lineTo(s.bx, s.by);
      }
      ctx.stroke();

      // posts
      ctx.fillStyle = '#94a3b8';
      for (const p of posts){
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fill();
      }

      drawFlipper(flippers[0]);
      drawFlipper(flippers[1]);

      // plunger lane divider
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(plunger.x - 10, table.top, 6, table.bottom - table.top);

      // ball
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2);
      ctx.fill();
      ctx.strokeStyle = '#e2e8f0';
      ctx.stroke();

      // plunger spring indicator
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(plunger.x, ball.y + ball.r + 6, plunger.width/2, -ball.plungerPower * 0.8);

      drawSparks();

      // overlay text when held
      if (ball.held){
        ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
        ctx.fillRect(W-170, table.bottom-180, 150, 120);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('スペースでショット', W-95, table.bottom-120);
      }
    }

    function updateRollovers(){
      rollovers.forEach((r, index) => {
        if (ball.y < r.y + 12 && ball.y > r.y - 12 && ball.x > r.x && ball.x < r.x + r.width){
          if (!r.hit){
            r.hit = true;
            const gain = Math.round(5 * bonusChain);
            award(gain, { type: 'rollover', baseXp: 5, chain: bonusChain });
            score += gain * 12;
            addSparks(ball.x, ball.y, '#4ade80');
            if (skillShotTimer > 0 && skillShotReady && index === skillShotTarget){
              const bonus = Math.round(50 * bonusChain);
              award(bonus, { type: 'skill-shot', target: r.label, chain: bonusChain });
              score += bonus * 16;
              bonusChain = Math.min(8.5, bonusChain + 1.2);
              skillShotTimer = 0;
              skillShotReady = false;
              pushAnnouncement(`スキルショット成功！ +${bonus}EXP`);
            }
          }
        }
      });
      if (rollovers.every(r => r.hit)){
        award(20, { type: 'lane-set' });
        score += 400;
        bonusChain = Math.min(6, bonusChain + 0.6);
        onMissionEvent('lane-set');
        resetRollovers();
        if (!mission){
          startMission('lane-set');
        }
      }
    }

    function clampBallSpeed(){
      const speed = Math.hypot(ball.vx, ball.vy);
      if (speed > 22){
        const ratio = 22 / speed;
        ball.vx *= ratio;
        ball.vy *= ratio;
      }
    }

    function integrate(dt){
      if (ball.held){
        ball.y = Math.min(plunger.bottom - ball.r - 2, ball.y);
        return;
      }

      let remaining = dt;
      const maxStep = 0.5;
      while (remaining > 0){
        const step = Math.min(maxStep, remaining);
        remaining -= step;

        ball.vy += gravity * step;
        const decay = Math.pow(friction, step);
        ball.vx *= decay;
        ball.vy *= decay;

        ball.x += ball.vx * step;
        ball.y += ball.vy * step;

        clampBallSpeed();

        // walls
        if (ball.x < table.left + ball.r){
          ball.x = table.left + ball.r;
          ball.vx = Math.abs(ball.vx) * 0.9;
        }
        if (ball.x > table.right - ball.r - plunger.width){
          if (ball.x > plunger.x - ball.r){
            ball.x = plunger.x - ball.r;
            ball.vx = -Math.abs(ball.vx) * 0.92;
          } else {
            ball.x = table.right - ball.r - plunger.width;
            ball.vx = -Math.abs(ball.vx) * 0.9;
          }
        }
        if (ball.y < table.top + ball.r){
          ball.y = table.top + ball.r;
          ball.vy = Math.abs(ball.vy) * 0.9;
        }

        // drain / bottom
        const drainHalf = table.drainWidth/2;
        if (ball.y > table.bottom - ball.r){
          if (Math.abs(ball.x - W/2) < drainHalf){
            drainBall();
            return;
          } else {
            ball.y = table.bottom - ball.r;
            ball.vy = -Math.abs(ball.vy) * 0.92;
          }
        }

        // components
        for (const b of bumpers){
          collideCircle(b, step);
        }
        for (const p of posts){
          collidePost(p, step);
        }
        for (const s of slingshots){
          collideSlingshot(s, step);
        }
        for (const f of flippers){
          collideFlipper(f, step);
        }

        clampBallSpeed();
      }

      updateRollovers();
    }

    function drainBall(){
      addSparks(ball.x, ball.y, '#f87171');
      lives--;
      award(1, { type: 'drain' });
      if (mission){
        failMission();
      }
      if (lives <= 0){
        lives = 3;
        bonusChain = 1;
        score = 0;
        resetRollovers();
      }
      resetBall(true);
    }

    let lastTime = performance.now();

    function frame(time){
      if (!running){
        return;
      }
      const dt = Math.max(0.5, Math.min(2.5, (time - lastTime) / (1000/60)));
      lastTime = time;

      updateFlippers(dt);
      if (!paused){
        integrate(dt);
        updateSparks();
        if (mission){
          missionTimer = Math.max(0, missionTimer - dt);
          if (missionTimer === 0){
            failMission();
          }
        }
        if (comboTimer > 0){
          comboTimer = Math.max(0, comboTimer - dt);
          if (comboTimer === 0){
            comboCount = 0;
          }
        }
        if (skillShotTimer > 0){
          skillShotTimer = Math.max(0, skillShotTimer - dt);
          if (skillShotTimer === 0){
            skillShotReady = false;
          }
        }
      }
      updateStatus();
      drawTable();
      rafId = requestAnimationFrame(frame);
    }

    function start(){
      if (!running){
        running = true;
        paused = false;
        lastTime = performance.now();
        rafId = requestAnimationFrame(frame);
        requestAnimationFrame(externalStep);
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        canvas.addEventListener('pointerdown', onPointerDown);
        canvas.addEventListener('pointerup', onPointerUp);
      }
    }

    function stop(){
      if (running){
        running = false;
        cancelAnimationFrame(rafId);
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointerup', onPointerUp);
      }
    }

    function destroy(){
      stop();
      try {
        root.removeChild(wrapper);
      } catch (e) {
        // ignore
      }
      if (announcementTimeout){
        clearTimeout(announcementTimeout);
      }
    }

    function launchBall(){
      if (ball.held){
        ball.held = false;
        const power = Math.max(12, Math.min(24, 12 + ball.plungerPower * 0.25));
        ball.vy = -power;
        ball.vx = -3;
        addSparks(ball.x, ball.y, '#38bdf8');
        ball.plungerPower = 0;
        skillShotTimer = 240;
        skillShotReady = true;
      }
    }

    function onKeyDown(e){
      if (e.repeat) return;
      switch (e.key){
        case 'ArrowLeft':
        case 'a':
        case 'A':
          flippers[0].pressing = true;
          e.preventDefault();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          flippers[1].pressing = true;
          e.preventDefault();
          break;
        case ' ':
        case 'Spacebar':
          if (ball.held){
            e.preventDefault();
            plungerPulling = true;
          }
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          fullReset();
          break;
      }
    }

    function onKeyUp(e){
      switch (e.key){
        case 'ArrowLeft':
        case 'a':
        case 'A':
          flippers[0].pressing = false;
          e.preventDefault();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          flippers[1].pressing = false;
          e.preventDefault();
          break;
        case ' ':
        case 'Spacebar':
          if (plungerPulling){
            launchBall();
          }
          plungerPulling = false;
          break;
      }
    }

    let plungerPulling = false;

    function onPointerDown(ev){
      const rect = canvas.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      if (x > plunger.x - 40 && y > table.bottom - 160){
        plungerPulling = true;
      } else if (x < W/2){
        flippers[0].pressing = true;
      } else {
        flippers[1].pressing = true;
      }
    }

    function onPointerUp(){
      if (plungerPulling){
        launchBall();
      }
      plungerPulling = false;
      flippers[0].pressing = false;
      flippers[1].pressing = false;
    }

    function stepPlunger(){
      if (ball.held && plungerPulling){
        ball.plungerPower = Math.min(plunger.pullMax, ball.plungerPower + 1.6);
        ball.y = Math.min(plunger.bottom - ball.r - 6, table.bottom - 30 + ball.plungerPower * 0.4);
      } else if (ball.held) {
        ball.plungerPower = Math.max(0, ball.plungerPower - 1.2);
      }
    }

    function externalStep(){
      if (!running) return;
      stepPlunger();
      requestAnimationFrame(externalStep);
    }

    externalStep();
    drawTable();

    return { start, stop, destroy, getScore: () => score };
  }

  window.registerMiniGame({
    id: 'pinball_xp',
    name: 'XPピンボール',
    description: '3Dピンボール風テーブル。バンパーやレーンでEXPを稼ごう',
    create
  });
})();

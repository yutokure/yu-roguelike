(function(){
  /** MiniExp: Highway Chaser (pseudo 3D racing, v0.1.0) */

  const SEG_LENGTH = 80; // world units per segment
  const ROAD_WIDTH = 900; // world units half width will be ROAD_WIDTH/2
  const TRACK_REPEAT = 5; // base track repeated for longer loop
  const DRAW_DISTANCE = 160; // number of segments drawn ahead
  const CAMERA_DISTANCE = 600; // camera distance behind player
  const CAMERA_HEIGHT = 900;
  const FOV = 70 * Math.PI/180;

  const COLORS = [
    { road:'#1f2937', shoulder:'#0f172a', rumble:'#f97316', lane:'#e2e8f0' },
    { road:'#111827', shoulder:'#0a1222', rumble:'#fb7185', lane:'#94a3b8' }
  ];

  const DIFFICULTY = {
    EASY:   { time:75, maxSpeed:280, accel:110, brake:220, coast:40, traffic:5, trafficSpeed:0.65, crashLimit:5, sectionBonus:14, xpScale:0.85 },
    NORMAL: { time:60, maxSpeed:320, accel:130, brake:260, coast:56, traffic:6, trafficSpeed:0.72, crashLimit:3, sectionBonus:10, xpScale:1.0 },
    HARD:   { time:50, maxSpeed:360, accel:150, brake:300, coast:68, traffic:7, trafficSpeed:0.8, crashLimit:2, sectionBonus:8, xpScale:1.2 }
  };

  function lerp(a,b,t){ return a + (b-a)*t; }
  function clamp(v,min,max){ return v<min?min:(v>max?max:v); }

  function buildTrack(){
    const segments = [];
    let cumulativeCurve = 0;
    let cumulativeX = 0;
    let currentY = 0;

    function pushSegment(curveDelta, hillDelta){
      const startX = cumulativeX;
      const startY = currentY;
      cumulativeCurve += curveDelta;
      cumulativeX += cumulativeCurve;
      currentY += hillDelta;
      segments.push({
        index: segments.length,
        curve: cumulativeCurve,
        curveDelta,
        startX,
        endX: cumulativeX,
        startY,
        endY: currentY,
        color: COLORS[(segments.length/3|0)%COLORS.length]
      });
    }

    function addStraight(len){ for(let i=0;i<len;i++) pushSegment(0,0); }
    function addCurve(len, curve, hill){
      const curveStep = curve/len;
      const hillStep = (hill||0)/len;
      for(let i=0;i<len;i++) pushSegment(curveStep, hillStep);
    }

    function buildPattern(){
      addStraight(40);
      addCurve(60, 120, 80);
      addStraight(30);
      addCurve(80, -160, -120);
      addStraight(20);
      addCurve(50, 140, 100);
      addStraight(60);
      addCurve(70, -110, 0);
      addStraight(40);
      addCurve(90, 160, -160);
    }

    for(let i=0;i<TRACK_REPEAT;i++) buildPattern();
    // adjust index and ensure continuity (wrap positions)
    for(let i=0;i<segments.length;i++) segments[i].index=i;

    return segments;
  }

  function create(root, awardXp, opts){
    const difficulty = (opts && opts.difficulty) || 'NORMAL';
    const cfg = { ...(DIFFICULTY[difficulty] || DIFFICULTY.NORMAL) };
    const xpSection = 25 * (cfg.xpScale || 1);
    const xpPass = 4 * (cfg.xpScale || 1);
    const xpDistanceUnit = 0.5 * (cfg.xpScale || 1);
    const xpPerfect = 100 * (cfg.xpScale || 1.1);

    const canvas = document.createElement('canvas');
    const W = Math.max(560, Math.min(800, root.clientWidth||640));
    const H = Math.round(W * 0.6);
    canvas.width = W;
    canvas.height = H;
    canvas.style.display='block';
    canvas.style.margin='0 auto';
    canvas.style.borderRadius='10px';
    canvas.style.background='#020617';
    canvas.style.touchAction='none';
    root.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const cameraDepth = (W/2) / Math.tan(FOV/2);
    const track = buildTrack();
    const trackLength = track.length * SEG_LENGTH;
    const laneWidth = ROAD_WIDTH * 0.5;
    const offroadPenalty = 0.65;

    let running=false, paused=false, ended=false, raf=0, lastTs=0;
    let playerZ = 0;
    let totalDistance = 0;
    let playerX = 0; // -1 .. 1 relative to road center (scaled later)
    let playerSpeed = 0;
    let playerNitro = { active:false, cooldown:0, remaining:0 };
    let crashes = 0;
    let remainingTime = cfg.time;
    let nextSection = trackLength/4;
    let lastDistanceXp = 0;
    let lastSectionCheck = nextSection;

    const keys = new Set();

    const traffic = [];
    function spawnTraffic(){
      const ahead = playerZ + 600 + Math.random()*1200;
      const z = ahead % trackLength;
      const lane = [-0.7,-0.35,0,0.35,0.7][(Math.random()*5)|0];
      const type = Math.random()<0.35?'truck':(Math.random()<0.5?'sport':'sedan');
      traffic.push({ z, lane, speed: cfg.maxSpeed * (cfg.trafficSpeed*(0.8+Math.random()*0.3)), type, passed:false });
    }
    for(let i=0;i<cfg.traffic;i++) spawnTraffic();

    function getSegmentAt(z){
      const idx = Math.floor(z / SEG_LENGTH) % track.length;
      return track[idx];
    }

    function projectPoint(worldX, worldY, worldZ, cameraX, cameraY, cameraZ){
      let relX = worldX - cameraX;
      let relY = worldY - cameraY;
      let relZ = worldZ - cameraZ;
      if (relZ <= 1) relZ = 1.01; // avoid division by zero
      const scale = cameraDepth / relZ;
      return {
        x: (W/2) + scale * relX,
        y: (H/2) - scale * relY,
        scale,
        z: relZ,
        width: scale * ROAD_WIDTH
      };
    }

    function drawBackground(){
      const grad = ctx.createLinearGradient(0,0,0,H);
      grad.addColorStop(0,'#0f172a');
      grad.addColorStop(0.45,'#1d2a44');
      grad.addColorStop(0.8,'#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0,0,W,H);
      // horizon glow
      ctx.fillStyle='rgba(148,163,184,0.35)';
      ctx.fillRect(0,H*0.45,W,4);
      // simple mountains
      ctx.fillStyle='rgba(30,41,59,0.6)';
      ctx.beginPath();
      ctx.moveTo(0,H*0.45);
      ctx.lineTo(W*0.22,H*0.28);
      ctx.lineTo(W*0.44,H*0.45);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(W*0.36,H*0.45);
      ctx.lineTo(W*0.6,H*0.3);
      ctx.lineTo(W,H*0.45);
      ctx.closePath();
      ctx.fill();
    }

    function drawRoad(){
      const playerSegIndex = Math.floor(playerZ / SEG_LENGTH) % track.length;
      const playerSeg = track[playerSegIndex];
      const segPercent = (playerZ % SEG_LENGTH) / SEG_LENGTH;
      const playerRoadX = lerp(playerSeg.startX, playerSeg.endX, segPercent);
      const playerRoadY = lerp(playerSeg.startY, playerSeg.endY, segPercent);
      const cameraX = playerRoadX + playerX * laneWidth;
      const cameraY = playerRoadY + CAMERA_HEIGHT;
      const cameraZ = playerZ - CAMERA_DISTANCE;
      let clipY = H;

      for (let n=0;n<DRAW_DISTANCE;n++){
        const segIndex = (playerSegIndex + n) % track.length;
        const seg = track[segIndex];
        let segZ = seg.index * SEG_LENGTH;
        if (segIndex < playerSegIndex) segZ += trackLength;
        const nextSeg = track[(segIndex+1)%track.length];
        let nextZ = nextSeg.index * SEG_LENGTH;
        if ((segIndex+1)%track.length < playerSegIndex) nextZ += trackLength;

        const p1 = projectPoint(
          seg.startX,
          seg.startY,
          segZ,
          cameraX,
          cameraY,
          cameraZ
        );
        const p2 = projectPoint(
          nextSeg.startX,
          nextSeg.startY,
          nextZ,
          cameraX,
          cameraY,
          cameraZ
        );
        const p3 = projectPoint(
          seg.endX,
          seg.endY,
          segZ,
          cameraX,
          cameraY,
          cameraZ
        );
        const p4 = projectPoint(
          nextSeg.endX,
          nextSeg.endY,
          nextZ,
          cameraX,
          cameraY,
          cameraZ
        );
        const screen = {
          left1: p3.x - p3.width*0.5,
          right1: p3.x + p3.width*0.5,
          left2: p4.x - p4.width*0.5,
          right2: p4.x + p4.width*0.5,
          y1: p3.y,
          y2: p4.y,
          laneLeft1: p3.x - p3.width*0.2,
          laneRight1: p3.x + p3.width*0.2,
          laneLeft2: p4.x - p4.width*0.2,
          laneRight2: p4.x + p4.width*0.2
        };
        if (p4.y >= clipY) continue;
        clipY = p4.y;
        const color = seg.color || COLORS[0];
        // shoulders
        ctx.fillStyle=color.shoulder;
        ctx.beginPath();
        ctx.moveTo(p1.x - p1.width*0.7, p1.y);
        ctx.lineTo(p2.x - p2.width*0.7, p2.y);
        ctx.lineTo(p2.x + p2.width*0.7, p2.y);
        ctx.lineTo(p1.x + p1.width*0.7, p1.y);
        ctx.closePath();
        ctx.fill();
        // rumble stripes
        ctx.fillStyle=color.rumble;
        ctx.beginPath();
        ctx.moveTo(p1.x - p1.width*0.6, p1.y);
        ctx.lineTo(p2.x - p2.width*0.6, p2.y);
        ctx.lineTo(p2.x - p2.width*0.45, p2.y);
        ctx.lineTo(p1.x - p1.width*0.45, p1.y);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(p1.x + p1.width*0.45, p1.y);
        ctx.lineTo(p2.x + p2.width*0.45, p2.y);
        ctx.lineTo(p2.x + p2.width*0.6, p2.y);
        ctx.lineTo(p1.x + p1.width*0.6, p1.y);
        ctx.closePath();
        ctx.fill();
        // road
        ctx.fillStyle=color.road;
        ctx.beginPath();
        ctx.moveTo(screen.left1, screen.y1);
        ctx.lineTo(screen.left2, screen.y2);
        ctx.lineTo(screen.right2, screen.y2);
        ctx.lineTo(screen.right1, screen.y1);
        ctx.closePath();
        ctx.fill();
        // lane markers
        ctx.strokeStyle=color.lane;
        ctx.lineWidth=Math.max(1, (screen.right1-screen.left1)*0.015);
        ctx.beginPath();
        ctx.moveTo((screen.left1+screen.right1)/2, screen.y1);
        ctx.lineTo((screen.left2+screen.right2)/2, screen.y2);
        ctx.stroke();
      }

      return { cameraX, cameraY, cameraZ };
    }

    function drawTraffic(camera){
      for (const car of traffic){
        const seg = getSegmentAt(car.z);
        const segPercent = ((car.z % SEG_LENGTH)+SEG_LENGTH) % SEG_LENGTH / SEG_LENGTH;
        const roadX = lerp(seg.startX, seg.endX, segPercent);
        const roadY = lerp(seg.startY, seg.endY, segPercent);
        let worldZ = seg.index * SEG_LENGTH + segPercent*SEG_LENGTH;
        if (car.z < playerZ - trackLength*0.5) worldZ += trackLength;
        const worldX = roadX + car.lane * laneWidth;
        const point = projectPoint(worldX, roadY + 40, worldZ, camera.cameraX, camera.cameraY, camera.cameraZ);
        if (point.z <= 0 || point.y > H) continue;
        const carWidth = point.scale * 160;
        const carHeight = carWidth * 0.55;
        ctx.fillStyle = car.type==='truck' ? '#fbbf24' : (car.type==='sport' ? '#38bdf8' : '#94a3b8');
        ctx.fillRect(point.x - carWidth/2, point.y - carHeight, carWidth, carHeight);
        ctx.fillStyle = '#020617';
        ctx.fillRect(point.x - carWidth/3, point.y - carHeight*0.6, carWidth*0.66, carHeight*0.25);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(point.x - carWidth*0.45, point.y - carHeight*0.25, carWidth*0.9, carHeight*0.22);
      }
    }

    function drawPlayer(){
      ctx.save();
      ctx.translate(W/2, H*0.82);
      const bodyW = 120;
      const bodyH = 40;
      ctx.fillStyle='#22d3ee';
      ctx.fillRect(-bodyW/2, -bodyH, bodyW, bodyH);
      ctx.fillStyle='#0f172a';
      ctx.fillRect(-bodyW/2+12, -bodyH*0.75, bodyW-24, bodyH*0.4);
      ctx.fillStyle='#bae6fd';
      ctx.fillRect(-bodyW/4, -bodyH*0.9, bodyW/2, bodyH*0.35);
      ctx.restore();
    }

    function drawHUD(){
      ctx.fillStyle='rgba(2,6,23,0.55)';
      ctx.fillRect(12,12, W-24, 52);
      ctx.fillStyle='#e2e8f0';
      ctx.font='16px "Segoe UI",system-ui,sans-serif';
      const speedKmh = Math.round(playerSpeed * 0.36);
      ctx.fillText(`SPEED ${speedKmh} km/h`, 24, 36);
      ctx.fillText(`DIST ${Math.floor(totalDistance)} m`, W*0.32, 36);
      ctx.fillText(`TIME ${Math.max(0,remainingTime).toFixed(1)}s`, W*0.58, 36);
      ctx.fillText(`CRASH ${crashes}/${cfg.crashLimit}`, W*0.8, 36);
      ctx.fillText(paused?'PAUSED':'', W-110, 36);
      ctx.fillStyle='#38bdf8';
      ctx.fillRect(24, 44, Math.max(0,Math.min(1,playerSpeed / cfg.maxSpeed))*160, 6);
      // nitro gauge
      ctx.fillStyle=playerNitro.active ? '#facc15' : '#f97316';
      const cooldownRatio = playerNitro.cooldown <= 0 ? 1 : 1 - clamp(playerNitro.cooldown/8,0,1);
      ctx.fillRect(200, 44, cooldownRatio*120, 6);
      ctx.fillStyle='#cbd5f5';
      ctx.font='12px "Segoe UI",system-ui,sans-serif';
      ctx.fillText('NITRO', 200, 58);
      if (ended){
        ctx.fillStyle='rgba(2,6,23,0.78)';
        ctx.fillRect(W*0.16, H*0.34, W*0.68, H*0.3);
        ctx.fillStyle='#f8fafc';
        ctx.font='bold 26px system-ui,sans-serif';
        ctx.textAlign='center';
        ctx.fillText('GAME OVER', W/2, H*0.45);
        ctx.font='16px system-ui,sans-serif';
        ctx.fillText('Rでリスタート', W/2, H*0.52);
        ctx.fillText('Pで一時停止/再開', W/2, H*0.58);
        ctx.textAlign='start';
      }
    }

    function draw(){
      drawBackground();
      const camera = drawRoad();
      drawTraffic(camera);
      drawPlayer();
      drawHUD();
    }

    function update(dt){
      if (paused || ended) return;
      const targetAccel = keys.has('ArrowUp') || keys.has('KeyW') ? cfg.accel : -cfg.coast;
      const braking = keys.has('ArrowDown') || keys.has('KeyS');
      if (targetAccel>0){
        playerSpeed += targetAccel * dt;
      } else {
        playerSpeed += targetAccel * dt;
      }
      if (braking) playerSpeed -= cfg.brake * dt;
      if (playerNitro.active){
        playerSpeed += cfg.accel * 1.8 * dt;
        playerNitro.remaining -= dt;
        if (playerNitro.remaining <= 0){
          playerNitro.active=false;
          playerNitro.cooldown = 8;
        }
      } else if (playerNitro.cooldown > 0){
        playerNitro.cooldown = Math.max(0, playerNitro.cooldown - dt);
      }
      playerSpeed = clamp(playerSpeed, 0, cfg.maxSpeed * (playerNitro.active?1.2:1));

      const steer = (keys.has('ArrowLeft')||keys.has('KeyA') ? -1 : 0) + (keys.has('ArrowRight')||keys.has('KeyD') ? 1 : 0);
      const steerStrength = (playerSpeed / cfg.maxSpeed) * 1.2;
      playerX += steer * steerStrength * dt;
      const seg = getSegmentAt(playerZ);
      const segPercent = (playerZ % SEG_LENGTH) / SEG_LENGTH;
      const curvature = seg.curve;
      playerX -= curvature * 0.00015 * (playerSpeed * dt);

      // offroad penalty
      if (Math.abs(playerX) > 1){
        playerSpeed *= (1 - offroadPenalty * dt);
      }
      playerX = clamp(playerX, -1.4, 1.4);

      const move = playerSpeed * dt;
      totalDistance += move;
      playerZ = (playerZ + move) % trackLength;
      remainingTime -= dt;
      if (remainingTime <= 0){
        endGame();
        return;
      }

      if (totalDistance - lastDistanceXp >= 10){
        lastDistanceXp += 10;
        awardXp && awardXp(xpDistanceUnit, { type:'distance', distance:Math.floor(totalDistance) });
      }

      if (totalDistance >= lastSectionCheck){
        lastSectionCheck += nextSection;
        remainingTime += cfg.sectionBonus;
        awardXp && awardXp(xpSection, { type:'section', distance:Math.floor(totalDistance) });
        if (window.showTransientPopupAt){
          window.showTransientPopupAt(W-120, 70, `+${Math.round(xpSection)}`, { variant:'combo', level:2 });
        }
      }

      // traffic update & collisions
      for (const car of traffic){
        let relative = car.z - playerZ;
        if (relative < -trackLength/2) relative += trackLength;
        if (relative > trackLength/2) relative -= trackLength;
        const prevRelative = relative;
        car.z = (car.z + car.speed * dt) % trackLength;
        let newRelative = car.z - playerZ;
        if (newRelative < -trackLength/2) newRelative += trackLength;
        if (newRelative > trackLength/2) newRelative -= trackLength;
        if (!car.passed && prevRelative > 0 && newRelative <= 0 && Math.abs(newRelative) < 200){
          car.passed = true;
          awardXp && awardXp(xpPass, { type:'pass', distance:Math.floor(totalDistance) });
        }
        // collision check
        if (Math.abs(newRelative) < 40){
          const laneDiff = Math.abs(car.lane - playerX);
          if (laneDiff < 0.35){
            crashes++;
            playerSpeed = cfg.maxSpeed*0.2;
            playerNitro.active=false;
            playerNitro.cooldown = 8;
            remainingTime = Math.max(remainingTime - 6, 0);
            car.z = (car.z + SEG_LENGTH*4) % trackLength;
            car.passed=false;
            if (crashes >= cfg.crashLimit){
              endGame();
              return;
            }
          }
        }
        // recycle when far behind
        if (newRelative < -400){
          car.z = (playerZ + 600 + Math.random()*1400) % trackLength;
          car.lane = [-0.85,-0.45,0,0.45,0.85][(Math.random()*5)|0];
          car.speed = cfg.maxSpeed * (cfg.trafficSpeed*(0.8+Math.random()*0.3));
          car.passed=false;
        }
      }
    }

    function endGame(){
      if (ended) return;
      ended=true;
      running=false;
      if (playerSpeed>0) playerSpeed=0;
      cancelAnimationFrame(raf);
      if (crashes === 0 && awardXp){
        awardXp(xpPerfect, { type:'perfect', distance:Math.floor(totalDistance) });
      }
      draw();
    }

    function loop(ts){
      const now = ts*0.001;
      const dt = Math.min(0.05, now - (lastTs||now));
      lastTs = now;
      if (running){
        update(dt);
        draw();
        raf = requestAnimationFrame(loop);
      }
    }

    function start(){ if(running) return; running=true; ended=false; paused=false; lastTs=0; raf=requestAnimationFrame(loop); }
    function stop(){ if(!running) return; running=false; cancelAnimationFrame(raf); }
    function destroy(){ try{ stop(); canvas.remove(); removeControls(); document.removeEventListener('keydown', onKeyDown); document.removeEventListener('keyup', onKeyUp); }catch{} }
    function getScore(){ return Math.floor(totalDistance); }

    function reset(){
      playerZ=0; totalDistance=0; playerX=0; playerSpeed=0; crashes=0; remainingTime=cfg.time; lastDistanceXp=0; lastSectionCheck=trackLength/4; playerNitro={ active:false, cooldown:0, remaining:0 };
      keys.clear();
      traffic.length=0; for(let i=0;i<cfg.traffic;i++) spawnTraffic();
      ended=false; paused=false; draw();
    }

    function togglePause(){ if(ended) return; paused=!paused; if(running && paused){ cancelAnimationFrame(raf); draw(); } else if(running){ lastTs=0; raf=requestAnimationFrame(loop); } }

    function triggerNitro(){
      if (paused || ended) return;
      if (playerNitro.active) return;
      if (playerNitro.cooldown>0) return;
      playerNitro.active=true;
      playerNitro.remaining=3.5;
      if (window.showTransientPopupAt){ window.showTransientPopupAt(W*0.5, H*0.65, 'NITRO!', { variant:'combo', level:3 }); }
    }

    function onKeyDown(e){
      if (e.repeat) return;
      if (e.code==='ArrowLeft'||e.code==='ArrowRight'||e.code==='ArrowUp'||e.code==='ArrowDown'||e.code==='Space') e.preventDefault();
      if (e.code==='ArrowLeft'||e.code==='KeyA') keys.add('ArrowLeft');
      if (e.code==='ArrowRight'||e.code==='KeyD') keys.add('ArrowRight');
      if (e.code==='ArrowUp'||e.code==='KeyW') keys.add('ArrowUp');
      if (e.code==='ArrowDown'||e.code==='KeyS') keys.add('ArrowDown');
      if (e.code==='Space'){ e.preventDefault(); triggerNitro(); }
      if (e.key==='p'||e.key==='P'){ togglePause(); }
      if ((e.key==='r'||e.key==='R') && ended){ reset(); start(); }
    }
    function onKeyUp(e){
      if (e.code==='ArrowLeft'||e.code==='KeyA') keys.delete('ArrowLeft');
      if (e.code==='ArrowRight'||e.code==='KeyD') keys.delete('ArrowRight');
      if (e.code==='ArrowUp'||e.code==='KeyW') keys.delete('ArrowUp');
      if (e.code==='ArrowDown'||e.code==='KeyS') keys.delete('ArrowDown');
    }

    document.addEventListener('keydown', onKeyDown, { passive:false });
    document.addEventListener('keyup', onKeyUp, { passive:false });

    const controlPad = document.createElement('div');
    controlPad.style.display='flex';
    controlPad.style.justifyContent='center';
    controlPad.style.alignItems='center';
    controlPad.style.gap='12px';
    controlPad.style.marginTop='12px';
    controlPad.style.flexWrap='wrap';
    root.appendChild(controlPad);
    const cleanupFns = [];

    function addCleanup(fn){ cleanupFns.push(fn); }
    function addGlobalListener(target, type, handler, options){
      target.addEventListener(type, handler, options);
      addCleanup(()=>target.removeEventListener(type, handler, options));
    }

    function mkBtn(label){
      const btn = document.createElement('button');
      btn.textContent=label;
      btn.style.minWidth='72px';
      btn.style.padding='10px 16px';
      btn.style.borderRadius='999px';
      btn.style.border='none';
      btn.style.background='#1e293b';
      btn.style.color='#e2e8f0';
      btn.style.fontSize='15px';
      btn.style.boxShadow='0 2px 8px rgba(15,23,42,0.45)';
      btn.style.touchAction='manipulation';
      return btn;
    }

    const leftBtn = mkBtn('←');
    const rightBtn = mkBtn('→');
    const accelBtn = mkBtn('↑');
    const brakeBtn = mkBtn('↓');
    const nitroBtn = mkBtn('NITRO');
    const pauseBtn = mkBtn('PAUSE');

    function bindPress(btn, code){
      const down = (ev)=>{ if(ev) ev.preventDefault(); keys.add(code); if(code==='Space') triggerNitro(); };
      const up = ()=>{ keys.delete(code); };
      btn.addEventListener('mousedown', down);
      btn.addEventListener('touchstart', down, { passive:false });
      addCleanup(()=>{ btn.removeEventListener('mousedown', down); });
      addCleanup(()=>{ btn.removeEventListener('touchstart', down); });
      addGlobalListener(window, 'mouseup', up);
      addGlobalListener(window, 'touchend', up, { passive:false });
      addGlobalListener(window, 'touchcancel', up, { passive:false });
    }

    bindPress(leftBtn,'ArrowLeft');
    bindPress(rightBtn,'ArrowRight');
    bindPress(accelBtn,'ArrowUp');
    bindPress(brakeBtn,'ArrowDown');
    const nitroClick = (e)=>{ e.preventDefault(); triggerNitro(); };
    nitroBtn.addEventListener('click', nitroClick);
    nitroBtn.addEventListener('touchstart', nitroClick, { passive:false });
    addCleanup(()=>{ nitroBtn.removeEventListener('click', nitroClick); });
    addCleanup(()=>{ nitroBtn.removeEventListener('touchstart', nitroClick); });
    const pauseClick = (e)=>{ e.preventDefault(); togglePause(); };
    pauseBtn.addEventListener('click', pauseClick);
    pauseBtn.addEventListener('touchstart', pauseClick, { passive:false });
    addCleanup(()=>{ pauseBtn.removeEventListener('click', pauseClick); });
    addCleanup(()=>{ pauseBtn.removeEventListener('touchstart', pauseClick); });

    controlPad.append(leftBtn, rightBtn, accelBtn, brakeBtn, nitroBtn, pauseBtn);

    function removeControls(){
      for (const fn of cleanupFns.splice(0, cleanupFns.length)) fn();
      controlPad.remove();
    }

    reset();
    draw();

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({
    id:'pseudo3d_race',
    name:'ハイウェイチェイサー',
    description:'疑似3D高速道路で交通を追い抜け。距離+0.5/追い越し+4/セクション+25',
    create
  });
})();

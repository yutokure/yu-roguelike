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
        color: COLORS[(segments.length/3|0)%COLORS.length],
        scenery: []
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

    populateScenery(segments);
    return segments;
  }

  function populateScenery(segments){
    const decorPalette = [
      { type:'tree', side:'both', probability:0.65 },
      { type:'billboard', side:'right', probability:0.25 },
      { type:'tower', side:'left', probability:0.18 },
      { type:'light', side:'both', probability:0.32 },
      { type:'rock', side:'both', probability:0.28 }
    ];

    function addDecor(segIndex, side, spec){
      const seg = segments[segIndex];
      if (!seg) return;
      const offsetSide = side==='left' ? -1 : 1;
      const offset = (ROAD_WIDTH * 0.9) + (spec.offset || 0);
      const height = spec.height || 0;
      seg.scenery.push({
        type: spec.type,
        offset: offset * offsetSide,
        elevation: height,
        scale: spec.scale || 1,
        sway: spec.sway || 0,
        hueShift: spec.hueShift || 0,
        variant: Math.random()
      });
    }

    for(let i=5;i<segments.length;i+=3){
      const baseSpec = decorPalette[(Math.random()*decorPalette.length)|0];
      if (Math.random() > baseSpec.probability) continue;
      const placements = baseSpec.side==='both' ? ['left','right'] : [baseSpec.side];
      for (const side of placements){
        addDecor(i, side, {
          type: baseSpec.type,
          scale: baseSpec.type==='billboard' ? (1.3+Math.random()*0.6) : 1,
          offset: baseSpec.type==='billboard' ? ROAD_WIDTH*0.15 : (baseSpec.type==='tower'?ROAD_WIDTH*0.25:0),
          height: baseSpec.type==='tower'? 60 : 0,
          sway: baseSpec.type==='tree'? (0.5+Math.random()*0.6) : 0,
          hueShift: baseSpec.type==='light'? (Math.random()*20-10) : 0
        });
      }
    }
  }

  function buildCloudLayer(){
    const clouds = [];
    const count = 8;
    for(let i=0;i<count;i++){
      clouds.push({
        x: Math.random(),
        y: 0.08 + Math.random()*0.18,
        scale: 0.3 + Math.random()*0.8,
        alpha: 0.35 + Math.random()*0.25
      });
    }
    return clouds;
  }

  function create(root, awardXp, opts){
    const difficulty = (opts && opts.difficulty) || 'NORMAL';
    const shortcuts = opts?.shortcuts;
    const localization = opts?.localization || (typeof window !== 'undefined' && typeof window.createMiniGameLocalization === 'function'
      ? window.createMiniGameLocalization({ id: 'pseudo3d_race' })
      : null);
    const ownsLocalization = !opts?.localization && !!localization;
    const buildKey = (suffix)=>`minigame.pseudo3d_race.${suffix}`;
    const text = (suffix, fallback, params)=>{
      const key = buildKey(suffix);
      if (localization && typeof localization.t === 'function'){
        try {
          const result = localization.t(key, fallback, params);
          if (typeof result === 'string' && result !== key) return result;
        } catch (error) {
          console.warn('[pseudo3d_race] localization failed for', key, error);
        }
      }
      if (typeof fallback === 'function'){
        try { return fallback(); } catch (error) {
          console.warn('[pseudo3d_race] fallback evaluation failed for', key, error);
          return '';
        }
      }
      return fallback ?? '';
    };
    let detachLocale = null;
    const cfg = { ...(DIFFICULTY[difficulty] || DIFFICULTY.NORMAL) };
    const xpSection = 25 * (cfg.xpScale || 1);
    const xpPass = 4 * (cfg.xpScale || 1);
    const xpDistanceUnit = 0.5 * (cfg.xpScale || 1);
    const xpPerfect = 100 * (cfg.xpScale || 1.1);
    let shortcutsLocked = false;

    function setShortcutsLocked(nextLocked){
      if (!shortcuts || shortcutsLocked === nextLocked) return;
      if (nextLocked){
        shortcuts.disableKey?.('p');
        shortcuts.disableKey?.('r');
      } else {
        shortcuts.enableKey?.('p');
        shortcuts.enableKey?.('r');
      }
      shortcutsLocked = nextLocked;
    }

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
    const cloudsFar = buildCloudLayer();
    const cloudsNear = buildCloudLayer();

    let running=false, paused=false, ended=false, raf=0, lastTs=0;
    let playerZ = 0;
    let totalDistance = 0;
    let playerX = 0; // -1 .. 1 relative to road center (scaled later)
    let playerSpeed = 0;
    let playerNitro = { active:false, cooldown:0, remaining:0 };
    let countdown = 0;
    let showHelp = true;
    let helpTimer = 0;
    let crashes = 0;
    let remainingTime = cfg.time;
    let nextSection = trackLength/4;
    let lastDistanceXp = 0;
    let lastSectionCheck = nextSection;

    function disableHostRestart(){
      shortcuts?.disableKey('r');
    }

    function enableHostRestart(){
      shortcuts?.enableKey('r');
    }

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
      grad.addColorStop(0.4,'#1f2c48');
      grad.addColorStop(0.78,'#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0,0,W,H);
      // sun glow
      const sunY = H*0.28;
      const sunGrad = ctx.createRadialGradient(W*0.5, sunY, 10, W*0.5, sunY, W*0.45);
      sunGrad.addColorStop(0,'rgba(248,250,252,0.35)');
      sunGrad.addColorStop(1,'rgba(248,250,252,0)');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0,0,W,H*0.6);

      // layered mountains
      const parallax = (playerX*0.04);
      ctx.fillStyle='rgba(30,41,59,0.6)';
      ctx.beginPath();
      ctx.moveTo(-W*parallax, H*0.46);
      ctx.lineTo(W*0.15 - W*parallax, H*0.32);
      ctx.lineTo(W*0.32 - W*parallax, H*0.46);
      ctx.lineTo(W*0.52 - W*parallax, H*0.33);
      ctx.lineTo(W*0.78 - W*parallax, H*0.48);
      ctx.lineTo(W*1.2 - W*parallax, H*0.4);
      ctx.lineTo(W*1.4 - W*parallax, H*0.48);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle='rgba(15,23,42,0.8)';
      ctx.beginPath();
      ctx.moveTo(W*0.2 - W*parallax*1.4, H*0.48);
      ctx.lineTo(W*0.36 - W*parallax*1.4, H*0.38);
      ctx.lineTo(W*0.6 - W*parallax*1.4, H*0.5);
      ctx.lineTo(W*0.9 - W*parallax*1.4, H*0.4);
      ctx.lineTo(W*1.2 - W*parallax*1.4, H*0.52);
      ctx.closePath();
      ctx.fill();

      const horizonGlow = ctx.createLinearGradient(0,H*0.44,0,H*0.5);
      horizonGlow.addColorStop(0,'rgba(148,163,184,0.45)');
      horizonGlow.addColorStop(1,'rgba(15,23,42,0)');
      ctx.fillStyle=horizonGlow;
      ctx.fillRect(0,H*0.42,W,H*0.1);

      drawCloudLayer(cloudsFar, 0.15, H*0.42, '#d4d7e5');
      drawCloudLayer(cloudsNear, 0.28, H*0.45, '#f1f5f9');
    }

    function drawCloudLayer(layer, speedFactor, baseY, color){
      const drift = (playerZ * 0.00012 * speedFactor) % 1;
      for (const cloud of layer){
        const cloudX = ((cloud.x - drift + 1) % 1) * W;
        const cloudY = baseY * cloud.y;
        const width = W * 0.28 * cloud.scale;
        const height = H * 0.09 * cloud.scale;
        const gradient = ctx.createLinearGradient(cloudX-width*0.5, cloudY-height*0.5, cloudX+width*0.5, cloudY);
        gradient.addColorStop(0,`rgba(241,245,249,${cloud.alpha*0.5})`);
        gradient.addColorStop(0.6,`rgba(226,232,240,${cloud.alpha})`);
        gradient.addColorStop(1,'rgba(241,245,249,0)');
        ctx.fillStyle=gradient;
        ctx.beginPath();
        ctx.ellipse(cloudX, cloudY, width*0.5, height*0.5, 0, 0, Math.PI*2);
        ctx.fill();
      }
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
      const visibleSegments = [];

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

        const fog = Math.max(0, Math.min(1, (1 - (n / DRAW_DISTANCE))));
        ctx.fillStyle=`rgba(15,23,42,${0.12*fog})`;
        ctx.beginPath();
        ctx.moveTo(screen.left1, screen.y1);
        ctx.lineTo(screen.left2, screen.y2);
        ctx.lineTo(screen.right2, screen.y2);
        ctx.lineTo(screen.right1, screen.y1);
        ctx.closePath();
        ctx.fill();

        visibleSegments.push({ seg, nextSeg, segZ, nextZ, screen });
      }

      return { cameraX, cameraY, cameraZ, segments: visibleSegments };
    }

    function drawScenery(view){
      const { segments: visible } = view;
      for (let i=visible.length-1;i>=0;i--){
        const { seg, segZ } = visible[i];
        if (!seg.scenery || seg.scenery.length===0) continue;
        const midPercent = 0.55;
        const baseX = lerp(seg.startX, seg.endX, midPercent);
        const baseY = lerp(seg.startY, seg.endY, midPercent);
        const worldZ = segZ + midPercent*SEG_LENGTH;
        for (const decor of seg.scenery){
          const sway = decor.sway ? Math.sin(playerZ*0.0008 + decor.offset*0.003) * decor.sway : 0;
          const point = projectPoint(
            baseX + decor.offset + sway,
            baseY + decor.elevation,
            worldZ,
            view.cameraX,
            view.cameraY,
            view.cameraZ
          );
          if (point.z <= 0 || point.y > H) continue;
          drawDecorShape(point, decor);
        }
      }
    }

    function drawDecorShape(point, decor){
      const scale = point.scale * decor.scale;
      if (decor.type==='tree'){
        const trunkW = Math.max(6, scale * 26);
        const trunkH = Math.max(14, scale * 60);
        ctx.fillStyle='#3f2e1e';
        ctx.fillRect(point.x - trunkW/2, point.y - trunkH, trunkW, trunkH);
        const crownH = trunkH*1.2;
        const gradient = ctx.createLinearGradient(point.x, point.y - trunkH - crownH, point.x, point.y - trunkH*0.2);
        gradient.addColorStop(0,`hsl(${150+decor.hueShift},45%,62%)`);
        gradient.addColorStop(1,`hsl(${150+decor.hueShift},55%,42%)`);
        ctx.fillStyle=gradient;
        ctx.beginPath();
        ctx.moveTo(point.x, point.y - trunkH - crownH);
        ctx.lineTo(point.x - trunkW*2.1, point.y - trunkH*0.15);
        ctx.lineTo(point.x + trunkW*2.1, point.y - trunkH*0.15);
        ctx.closePath();
        ctx.fill();
      } else if (decor.type==='billboard'){
        const boardW = scale * 140;
        const boardH = scale * 80;
        ctx.fillStyle='#111827';
        ctx.fillRect(point.x - boardW/2, point.y - boardH*1.15, boardW, boardH);
        ctx.strokeStyle='#38bdf8';
        ctx.lineWidth=boardH*0.08;
        ctx.strokeRect(point.x - boardW/2, point.y - boardH*1.15, boardW, boardH);
        ctx.fillStyle='rgba(56,189,248,0.85)';
        const prevAlign = ctx.textAlign;
        ctx.font=`${Math.max(12,boardH*0.22)}px system-ui,sans-serif`;
        ctx.textAlign='center';
        ctx.fillText(text('scenery.billboard', 'BOOST'), point.x, point.y - boardH*0.68);
        ctx.textAlign=prevAlign;
        const poleH = boardH*1.2;
        ctx.fillStyle='#1e293b';
        ctx.fillRect(point.x - boardW*0.05, point.y - poleH, boardW*0.1, poleH);
      } else if (decor.type==='tower'){
        const baseW = scale * 90;
        const baseH = scale * 200;
        const baseX = point.x - baseW/2;
        const baseY = point.y - baseH;
        const gradient = ctx.createLinearGradient(baseX, baseY, baseX+baseW, baseY+baseH);
        gradient.addColorStop(0,'#0f172a');
        gradient.addColorStop(0.5,'#1f2937');
        gradient.addColorStop(1,'#0f172a');
        ctx.fillStyle=gradient;
        ctx.fillRect(baseX, baseY, baseW, baseH);
        ctx.fillStyle='rgba(248,250,252,0.25)';
        ctx.fillRect(baseX+baseW*0.2, baseY+baseH*0.1, baseW*0.12, baseH*0.8);
      } else if (decor.type==='light'){
        const poleH = scale * 150;
        const poleW = Math.max(3, scale * 12);
        ctx.fillStyle='#1f2937';
        ctx.fillRect(point.x - poleW/2, point.y - poleH, poleW, poleH);
        ctx.fillStyle='rgba(254,240,138,0.85)';
        ctx.beginPath();
        ctx.arc(point.x, point.y - poleH, poleW*1.6, 0, Math.PI*2);
        ctx.fill();
        const glow = ctx.createRadialGradient(point.x, point.y - poleH, 0, point.x, point.y - poleH, poleH*0.6);
        glow.addColorStop(0,`rgba(250,250,210,0.48)`);
        glow.addColorStop(1,'rgba(250,250,210,0)');
        ctx.fillStyle=glow;
        ctx.beginPath();
        ctx.arc(point.x, point.y - poleH, poleH*0.9, 0, Math.PI*2);
        ctx.fill();
      } else if (decor.type==='rock'){
        const rockW = scale * 80;
        const rockH = scale * 40;
        ctx.fillStyle='#475569';
        ctx.beginPath();
        ctx.moveTo(point.x - rockW*0.5, point.y);
        ctx.lineTo(point.x - rockW*0.15, point.y - rockH);
        ctx.lineTo(point.x + rockW*0.4, point.y - rockH*0.65);
        ctx.lineTo(point.x + rockW*0.55, point.y);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle='rgba(148,163,184,0.35)';
        ctx.beginPath();
        ctx.moveTo(point.x - rockW*0.1, point.y - rockH*0.6);
        ctx.lineTo(point.x + rockW*0.35, point.y - rockH*0.45);
        ctx.lineTo(point.x + rockW*0.18, point.y - rockH*0.2);
        ctx.closePath();
        ctx.fill();
      }
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
        const bodyColor = car.type==='truck' ? '#facc15' : (car.type==='sport' ? '#38bdf8' : '#94a3b8');
        const shade = ctx.createLinearGradient(point.x - carWidth/2, point.y - carHeight, point.x + carWidth/2, point.y);
        shade.addColorStop(0, bodyColor);
        shade.addColorStop(1, '#0f172a');
        ctx.fillStyle = shade;
        roundedRectPath(point.x - carWidth/2, point.y - carHeight, carWidth, carHeight, carHeight*0.25);
        ctx.fill();
        ctx.fillStyle = 'rgba(15,23,42,0.75)';
        ctx.fillRect(point.x - carWidth/3, point.y - carHeight*0.7, carWidth*0.66, carHeight*0.32);
        ctx.fillStyle = car.type==='truck' ? '#fde68a' : '#f8fafc';
        ctx.fillRect(point.x - carWidth*0.42, point.y - carHeight*0.25, carWidth*0.84, carHeight*0.24);
        ctx.fillStyle = car.type==='truck' ? '#7f1d1d' : '#ef4444';
        ctx.fillRect(point.x - carWidth*0.38, point.y - carHeight*0.05, carWidth*0.76, carHeight*0.12);
        ctx.fillStyle = 'rgba(248,113,113,0.7)';
        ctx.fillRect(point.x - carWidth*0.36, point.y - carHeight*0.05, carWidth*0.12, carHeight*0.08);
        ctx.fillRect(point.x + carWidth*0.24, point.y - carHeight*0.05, carWidth*0.12, carHeight*0.08);
      }
    }

    function drawPlayer(){
      ctx.save();
      ctx.translate(W/2, H*0.82);
      const bodyW = 126;
      const bodyH = 44;
      const paint = ctx.createLinearGradient(-bodyW/2, -bodyH*1.4, bodyW/2, 0);
      paint.addColorStop(0,'#5eead4');
      paint.addColorStop(0.5,'#0ea5e9');
      paint.addColorStop(1,'#0284c7');
      ctx.fillStyle=paint;
      roundedRectPath(-bodyW/2, -bodyH, bodyW, bodyH, 18);
      ctx.fill();
      ctx.fillStyle='rgba(15,23,42,0.85)';
      ctx.fillRect(-bodyW*0.28, -bodyH*0.9, bodyW*0.56, bodyH*0.48);
      ctx.fillStyle='#e0f2fe';
      ctx.beginPath();
      ctx.moveTo(-bodyW*0.3, -bodyH*0.9);
      ctx.quadraticCurveTo(0, -bodyH*1.3, bodyW*0.3, -bodyH*0.9);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle='#1e293b';
      ctx.fillRect(-bodyW*0.46, -bodyH*0.3, bodyW*0.2, bodyH*0.6);
      ctx.fillRect(bodyW*0.26, -bodyH*0.3, bodyW*0.2, bodyH*0.6);
      ctx.fillStyle='rgba(248,250,252,0.38)';
      ctx.fillRect(-bodyW*0.25, -bodyH*0.4, bodyW*0.5, bodyH*0.15);
      if (playerNitro.active){
        ctx.fillStyle='rgba(250,250,210,0.9)';
        ctx.beginPath();
        ctx.moveTo(-bodyW*0.16, -bodyH*0.05);
        ctx.lineTo(bodyW*0.16, -bodyH*0.05);
        ctx.lineTo(0, bodyH*0.35);
        ctx.closePath();
        ctx.fill();
        const flame = ctx.createRadialGradient(0, bodyH*0.25, 0, 0, bodyH*0.25, bodyH*0.6);
        flame.addColorStop(0,'rgba(254,240,138,0.8)');
        flame.addColorStop(1,'rgba(248,113,113,0)');
        ctx.fillStyle=flame;
        ctx.beginPath();
        ctx.ellipse(0, bodyH*0.35, bodyW*0.3, bodyH*0.55, 0, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.restore();
    }

    function drawHUD(indicators){
      ctx.fillStyle='rgba(2,6,23,0.55)';
      ctx.fillRect(12,12, W-24, 52);
      ctx.fillStyle='#e2e8f0';
      ctx.font='16px "Segoe UI",system-ui,sans-serif';
      const speedKmh = Math.round(playerSpeed * 0.36);
      const distanceMeters = Math.floor(totalDistance);
      const remainingSeconds = Math.max(0, remainingTime);
      const speedLabel = text('hud.speed', () => `SPEED ${speedKmh} km/h`, { speed: speedKmh, unit: 'km/h' });
      const distanceLabel = text('hud.distance', () => `DIST ${distanceMeters} m`, { distance: distanceMeters, unit: 'm' });
      const timeLabel = text('hud.time', () => `TIME ${remainingSeconds.toFixed(1)}s`, { time: remainingSeconds, unit: 's' });
      const crashLabel = text('hud.crash', () => `CRASH ${crashes}/${cfg.crashLimit}`, { crashes, limit: cfg.crashLimit });
      const pausedLabel = paused ? text('hud.paused', 'PAUSED') : '';
      ctx.fillText(speedLabel, 24, 36);
      ctx.fillText(distanceLabel, W*0.32, 36);
      ctx.fillText(timeLabel, W*0.58, 36);
      ctx.fillText(crashLabel, W*0.8, 36);
      if (pausedLabel) ctx.fillText(pausedLabel, W-110, 36);
      ctx.fillStyle='#38bdf8';
      ctx.fillRect(24, 44, Math.max(0,Math.min(1,playerSpeed / cfg.maxSpeed))*160, 6);
      // nitro gauge
      ctx.fillStyle=playerNitro.active ? '#facc15' : '#f97316';
      const cooldownRatio = playerNitro.cooldown <= 0 ? 1 : 1 - clamp(playerNitro.cooldown/8,0,1);
      ctx.fillRect(200, 44, cooldownRatio*120, 6);
      ctx.fillStyle='#cbd5f5';
      ctx.font='12px "Segoe UI",system-ui,sans-serif';
      ctx.fillText(text('hud.nitro', 'NITRO'), 200, 58);

      // track progress bar
      const progressWidth = W*0.6;
      const progressX = (W-progressWidth)/2;
      const progressY = H-32;
      ctx.fillStyle='rgba(15,23,42,0.75)';
      ctx.fillRect(progressX-4, progressY-6, progressWidth+8, 16);
      ctx.fillStyle='#334155';
      ctx.fillRect(progressX, progressY-2, progressWidth, 8);
      ctx.fillStyle='#38bdf8';
      const lapRatio = (playerZ % trackLength) / trackLength;
      ctx.fillRect(progressX, progressY-2, progressWidth * lapRatio, 8);
      ctx.fillStyle='#e2e8f0';
      ctx.font='12px "Segoe UI",system-ui,sans-serif';
      ctx.fillText(text('hud.progress', 'コース進捗'), progressX, progressY-8);

      if (indicators){
        const arrowSize = 44;
        const arrowX = W-64;
        const arrowY = 68;
        const direction = indicators.direction;
        if (direction !== 0){
          const intensity = Math.min(1, indicators.intensity);
          ctx.save();
          ctx.translate(arrowX, arrowY);
          ctx.fillStyle = direction > 0 ? '#facc15' : '#a855f7';
          ctx.globalAlpha = 0.45 + 0.55*intensity;
          ctx.beginPath();
          if (direction > 0){
            ctx.moveTo(-arrowSize*0.4, -arrowSize*0.6);
            ctx.lineTo(arrowSize*0.4, 0);
            ctx.lineTo(-arrowSize*0.4, arrowSize*0.6);
          } else {
            ctx.moveTo(arrowSize*0.4, -arrowSize*0.6);
            ctx.lineTo(-arrowSize*0.4, 0);
            ctx.lineTo(arrowSize*0.4, arrowSize*0.6);
          }
          ctx.closePath();
          ctx.fill();
          ctx.restore();
          ctx.globalAlpha = 1;
          ctx.fillStyle='#e2e8f0';
          ctx.font='12px "Segoe UI",system-ui,sans-serif';
          const turnLabel = direction>0 ? text('hud.upcomingTurn.right', '右カーブ') : text('hud.upcomingTurn.left', '左カーブ');
          ctx.fillText(turnLabel, arrowX-38, arrowY+32);
        }
      }

      const helpVisible = showHelp || !running || paused;
      if (helpVisible){
        const fade = (!running || paused) ? 1 : (showHelp ? clamp(helpTimer/2, 0, 1) : 1);
        ctx.save();
        ctx.globalAlpha = 0.75 * fade;
        ctx.fillStyle='#020617';
        const panelW = W*0.76;
        const panelX = (W-panelW)/2;
        const panelY = H-108;
        ctx.fillRect(panelX, panelY, panelW, 80);
        ctx.globalAlpha = fade;
        ctx.fillStyle='#f8fafc';
        ctx.font='15px "Segoe UI",system-ui,sans-serif';
        ctx.fillText(
          text('help.controls', '操作: ←/→ または A/D でステアリング ・ ↑/W でアクセル ・ ↓/S でブレーキ ・ スペースでニトロ'),
          panelX+16,
          panelY+28
        );
        ctx.font='14px "Segoe UI",system-ui,sans-serif';
        ctx.fillText(
          text('help.objective', '目的: 制限時間内に距離を稼ぎ、交通を安全に追い越そう'),
          panelX+16,
          panelY+50
        );
        ctx.fillText(text('help.shortcuts', 'H でヘルプ切替 / P で一時停止'), panelX+16, panelY+68);
        ctx.restore();
      }
      if (ended){
        ctx.fillStyle='rgba(2,6,23,0.78)';
        ctx.fillRect(W*0.16, H*0.34, W*0.68, H*0.3);
        ctx.fillStyle='#f8fafc';
        ctx.font='bold 26px system-ui,sans-serif';
        ctx.textAlign='center';
        ctx.fillText(text('end.title', 'GAME OVER'), W/2, H*0.45);
        ctx.font='16px system-ui,sans-serif';
        ctx.fillText(text('end.restart', 'Rでリスタート'), W/2, H*0.52);
        ctx.fillText(text('end.pause', 'Pで一時停止/再開'), W/2, H*0.58);
        ctx.textAlign='start';
      }
    }

    function drawCountdown(){
      if (countdown <= 0) return;
      const remaining = Math.ceil(countdown);
      ctx.save();
      ctx.fillStyle='rgba(2,6,23,0.7)';
      ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#f8fafc';
      ctx.font='bold 88px "Segoe UI",system-ui,sans-serif';
      ctx.textAlign='center';
      ctx.textBaseline='middle';
      const label = remaining<=1 && countdown<=0.5 ? text('countdown.go', 'GO!') : String(remaining);
      ctx.fillText(label, W/2, H*0.45);
      ctx.restore();
    }

    function analyzeUpcomingCurve(){
      const segIndex = Math.floor(playerZ / SEG_LENGTH) % track.length;
      let netCurve = 0;
      const preview = 28;
      for (let i=0;i<preview;i++){
        const seg = track[(segIndex + i) % track.length];
        netCurve += seg.curveDelta;
      }
      const direction = netCurve>3 ? 1 : netCurve<-3 ? -1 : 0;
      return { direction, intensity: Math.min(1, Math.abs(netCurve)/18) };
    }

    function draw(){
      drawBackground();
      const camera = drawRoad();
      drawScenery(camera);
      drawTraffic(camera);
      drawPlayer();
      const indicators = analyzeUpcomingCurve();
      drawHUD(indicators);
      drawCountdown();
      drawSpeedFX();
    }

    function roundedRectPath(x, y, w, h, r){
      const radius = Math.max(0, Math.min(r, Math.min(Math.abs(w), Math.abs(h))*0.5));
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    }

    function drawSpeedFX(){
      const boost = playerNitro.active ? 0.35 : 0;
      const intensity = clamp((playerSpeed / (cfg.maxSpeed*0.92)) - 0.55 + boost, 0, 1);
      if (intensity <= 0) return;
      ctx.save();
      const vignette = ctx.createLinearGradient(0,0,W,0);
      vignette.addColorStop(0,`rgba(15,23,42,${0.45*intensity})`);
      vignette.addColorStop(0.45,'rgba(15,23,42,0)');
      vignette.addColorStop(0.55,'rgba(15,23,42,0)');
      vignette.addColorStop(1,`rgba(15,23,42,${0.45*intensity})`);
      ctx.fillStyle=vignette;
      ctx.fillRect(0,0,W,H);

      ctx.strokeStyle=`rgba(148,163,184,${0.22*intensity})`;
      ctx.lineWidth=2;
      const streaks = 10;
      for (let i=0;i<streaks;i++){
        const offset = ((i/streaks) - 0.5) * W * 0.9;
        ctx.beginPath();
        ctx.moveTo(W/2 + offset*0.35, H*0.5);
        ctx.lineTo(W/2 + offset, H);
        ctx.stroke();
      }
      ctx.restore();
    }

    function update(dt){
      if (paused || ended) return;
      if (countdown > 0){
        countdown = Math.max(0, countdown - dt);
        if (countdown > 0) return;
        lastTs = 0;
        return;
      }
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

      if (showHelp){
        helpTimer = Math.max(0, helpTimer - dt);
        if (helpTimer === 0) showHelp = false;
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
      enableHostRestart();
      running=false;
      setShortcutsLocked(false);
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

    function start(){
      if(running) return;
      running=true;
      ended=false;
      paused=false;
      countdown = 3;
      showHelp = true;
      helpTimer = 6.5;
      lastTs=0;
      setShortcutsLocked(true);
      raf=requestAnimationFrame(loop);
    }
    function stop(){ if(running){ running=false; cancelAnimationFrame(raf); } setShortcutsLocked(false); }
    function destroy(){
      try {
        stop();
        setShortcutsLocked(false);
        canvas.remove();
        removeControls();
        document.removeEventListener('keydown', onKeyDown);
        document.removeEventListener('keyup', onKeyUp);
      } catch {}
      if (detachLocale){
        try { detachLocale(); } catch {}
        detachLocale = null;
      }
      if (ownsLocalization && localization && typeof localization.destroy === 'function'){
        try { localization.destroy(); } catch {}
      }
    }
    function getScore(){ return Math.floor(totalDistance); }

    function reset(){
      playerZ=0; totalDistance=0; playerX=0; playerSpeed=0; crashes=0; remainingTime=cfg.time; lastDistanceXp=0; lastSectionCheck=trackLength/4; playerNitro={ active:false, cooldown:0, remaining:0 };
      countdown = 0;
      showHelp = true;
      helpTimer = 0;
      keys.clear();
      traffic.length=0; for(let i=0;i<cfg.traffic;i++) spawnTraffic();
      ended=false; paused=false; draw();
    }

    function togglePause(){ if(ended) return; paused=!paused; if(running && paused){ cancelAnimationFrame(raf); draw(); } else if(running){ lastTs=0; setShortcutsLocked(true); raf=requestAnimationFrame(loop); } }

    function triggerNitro(){
      if (paused || ended) return;
      if (playerNitro.active) return;
      if (playerNitro.cooldown>0) return;
      playerNitro.active=true;
      playerNitro.remaining=3.5;
      if (window.showTransientPopupAt){
        window.showTransientPopupAt(W*0.5, H*0.65, text('popup.nitro', 'NITRO!'), { variant:'combo', level:3 });
      }
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
      if (e.key==='h'||e.key==='H'){ showHelp = !showHelp; helpTimer = showHelp ? 6 : 0; draw(); }
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
    const nitroBtn = mkBtn('');
    const pauseBtn = mkBtn('');

    function updateControlLabels(){
      nitroBtn.textContent = text('controls.nitro', 'NITRO');
      pauseBtn.textContent = text('controls.pause', 'PAUSE');
    }
    updateControlLabels();

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

    if (localization && typeof localization.onChange === 'function'){
      try {
        detachLocale = localization.onChange(() => {
          try {
            updateControlLabels();
            draw();
          } catch {}
        });
      } catch (error) {
        console.warn('[pseudo3d_race] failed to attach localization listener', error);
      }
    }

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({
    id:'pseudo3d_race',
    name:'ハイウェイチェイサー', nameKey: 'selection.miniexp.games.pseudo3d_race.name',
    description:'疑似3D高速道路で交通を追い抜け。距離+0.5/追い越し+4/セクション+25', descriptionKey: 'selection.miniexp.games.pseudo3d_race.description', categoryIds: ['action'],
    create
  });
})();

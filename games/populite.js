(function(){
  const STYLE_ID = 'populite-mod-style';
  const MAP_SIZE = 18;
  const TILE_COUNT = MAP_SIZE * MAP_SIZE;
  const TILE_MAX = 5;
  const TILE_MIN = 0;
  const TILE_SIZE = 26;
  const CANVAS_SIZE = MAP_SIZE * TILE_SIZE;
  const LEVEL_CAP = 3;

  const DIFFICULTY_CONFIG = {
    EASY: {
      duration: 210,
      disasterInterval: 40,
      manaRegenMultiplier: 1.2,
      flattenCost: 1,
      targetPopulation: 80,
      disasterRadiusBonus: 0
    },
    NORMAL: {
      duration: 180,
      disasterInterval: 30,
      manaRegenMultiplier: 1,
      flattenCost: 1,
      targetPopulation: 120,
      disasterRadiusBonus: 0
    },
    HARD: {
      duration: 150,
      disasterInterval: 25,
      manaRegenMultiplier: 0.85,
      flattenCost: 2,
      targetPopulation: 160,
      disasterRadiusBonus: 1
    }
  };

  const COLOR_PALETTE = {
    water: '#1d4ed8',
    shore: '#0ea5e9',
    plains: ['#bbf7d0', '#86efac', '#4ade80'],
    hills: ['#22c55e', '#16a34a', '#15803d'],
    high: ['#facc15', '#f97316'],
    lava: 'rgba(220,38,38,0.75)',
    barrier: 'rgba(96,165,250,0.45)'
  };

  function clamp(v, min, max){
    return v < min ? min : v > max ? max : v;
  }

  function getTileIndex(x, y){
    return y * MAP_SIZE + x;
  }

  function formatTime(seconds){
    const s = Math.max(0, Math.floor(seconds));
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  function create(root, awardXp, opts){
    const difficulty = (opts?.difficulty || 'NORMAL').toUpperCase();
    const cfg = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.NORMAL;
    const shortcuts = opts?.shortcuts;

    if (!document.getElementById(STYLE_ID)){
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = `
        .populite-mod { font-family: 'Segoe UI', 'BIZ UDPGothic', 'Hiragino Kaku Gothic ProN', system-ui, sans-serif; color:#e2e8f0; background:radial-gradient(circle at 20% 20%, rgba(14,116,144,0.4), rgba(15,23,42,0.92)); border-radius:18px; padding:16px; box-shadow:0 18px 36px rgba(8,47,73,0.45); max-width:960px; margin:0 auto; }
        .populite-mod h2 { margin:0 0 12px; font-size:24px; color:#f8fafc; text-align:center; }
        .populite-mod .hud { display:grid; grid-template-columns: minmax(220px, 280px) 1fr; gap:16px; }
        .populite-mod .hud-left { display:flex; flex-direction:column; gap:12px; }
        .populite-mod .stat-box { background:rgba(15,23,42,0.78); border-radius:12px; padding:12px; box-shadow:inset 0 0 0 1px rgba(148,163,184,0.2); }
        .populite-mod .stat-box h3 { margin:0 0 8px; font-size:16px; color:#bae6fd; }
        .populite-mod .stat-line { display:flex; justify-content:space-between; margin-bottom:6px; font-size:14px; color:#e2e8f0; }
        .populite-mod .bar { position:relative; height:12px; border-radius:999px; background:rgba(148,163,184,0.16); overflow:hidden; margin-top:6px; }
        .populite-mod .bar > span { position:absolute; top:0; left:0; bottom:0; border-radius:999px; background:linear-gradient(90deg,#22d3ee,#0ea5e9); }
        .populite-mod .bar.mana > span { background:linear-gradient(90deg,#38bdf8,#6366f1); }
        .populite-mod .bar.population > span { background:linear-gradient(90deg,#4ade80,#16a34a); }
        .populite-mod .disaster-box { font-size:13px; color:#fcd34d; }
        .populite-mod canvas { width:100%; max-width:540px; height:auto; display:block; margin:0 auto; border-radius:12px; background:#0f172a; box-shadow:0 12px 28px rgba(15,23,42,0.65); cursor:crosshair; }
        .populite-mod .log { max-height:120px; overflow:auto; background:rgba(15,23,42,0.74); border-radius:12px; padding:10px; font-size:12px; box-shadow:inset 0 0 0 1px rgba(148,163,184,0.14); }
        .populite-mod .log strong { color:#f8fafc; }
        .populite-mod .controls { font-size:12px; color:#94a3b8; line-height:1.5; }
        .populite-mod .status-message { min-height:20px; font-size:14px; color:#fbbf24; text-align:center; }
        .populite-mod .spell-buttons { display:flex; gap:8px; flex-wrap:wrap; margin-top:8px; }
        .populite-mod .spell-buttons button { flex:1; min-width:120px; background:rgba(59,130,246,0.28); border:1px solid rgba(148,163,184,0.35); color:#e0f2fe; border-radius:8px; padding:8px; font-weight:600; cursor:pointer; transition:background 0.15s ease, transform 0.15s ease; }
        .populite-mod .spell-buttons button:disabled { background:rgba(71,85,105,0.35); color:#94a3b8; cursor:not-allowed; transform:none; }
        .populite-mod .spell-buttons button:not(:disabled):hover { background:rgba(96,165,250,0.5); transform:translateY(-1px); }
        .populite-mod .paused-overlay { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:#f1f5f9; font-size:26px; background:rgba(15,23,42,0.6); pointer-events:none; border-radius:12px; }
      `;
      document.head.appendChild(style);
    }

    const container = document.createElement('div');
    container.className = 'populite-mod';

    const title = document.createElement('h2');
    title.textContent = 'ポピュラス風 ミニ神様モード';

    const hud = document.createElement('div');
    hud.className = 'hud';

    const hudLeft = document.createElement('div');
    hudLeft.className = 'hud-left';

    const statusBox = document.createElement('div');
    statusBox.className = 'stat-box';
    const statusTitle = document.createElement('h3');
    statusTitle.textContent = '信仰状態';
    const timeLine = document.createElement('div');
    timeLine.className = 'stat-line';
    const timeLabel = document.createElement('span');
    timeLabel.textContent = '残り時間';
    const timeValue = document.createElement('span');
    timeValue.textContent = '--:--';
    timeLine.appendChild(timeLabel);
    timeLine.appendChild(timeValue);

    const manaLine = document.createElement('div');
    manaLine.className = 'stat-line';
    const manaLabel = document.createElement('span');
    manaLabel.textContent = 'マナ';
    const manaValue = document.createElement('span');
    manaValue.textContent = '0 / 0';
    manaLine.appendChild(manaLabel);
    manaLine.appendChild(manaValue);

    const manaBar = document.createElement('div');
    manaBar.className = 'bar mana';
    const manaBarFill = document.createElement('span');
    manaBar.appendChild(manaBarFill);

    const popLine = document.createElement('div');
    popLine.className = 'stat-line';
    const popLabel = document.createElement('span');
    popLabel.textContent = '人口';
    const popValue = document.createElement('span');
    popValue.textContent = '0 / 0';
    popLine.appendChild(popLabel);
    popLine.appendChild(popValue);

    const popBar = document.createElement('div');
    popBar.className = 'bar population';
    const popBarFill = document.createElement('span');
    popBar.appendChild(popBarFill);

    const disasterBox = document.createElement('div');
    disasterBox.className = 'stat-box disaster-box';
    const disasterTitle = document.createElement('h3');
    disasterTitle.textContent = '災害タイマー';
    const disasterLine = document.createElement('div');
    disasterLine.className = 'stat-line';
    const disasterLabel = document.createElement('span');
    disasterLabel.textContent = '次の災害';
    const disasterTimerValue = document.createElement('span');
    disasterTimerValue.textContent = '--';
    disasterLine.appendChild(disasterLabel);
    disasterLine.appendChild(disasterTimerValue);
    const bestTimeLine = document.createElement('div');
    bestTimeLine.className = 'stat-line';
    const bestLabel = document.createElement('span');
    bestLabel.textContent = '最速達成';
    const bestValue = document.createElement('span');
    bestValue.textContent = '--';
    bestTimeLine.appendChild(bestLabel);
    bestTimeLine.appendChild(bestValue);
    disasterBox.appendChild(disasterTitle);
    disasterBox.appendChild(disasterLine);
    disasterBox.appendChild(bestTimeLine);

    statusBox.appendChild(statusTitle);
    statusBox.appendChild(timeLine);
    statusBox.appendChild(manaLine);
    statusBox.appendChild(manaBar);
    statusBox.appendChild(popLine);
    statusBox.appendChild(popBar);

    hudLeft.appendChild(statusBox);
    hudLeft.appendChild(disasterBox);

    const controlBox = document.createElement('div');
    controlBox.className = 'stat-box';
    const controlTitle = document.createElement('h3');
    controlTitle.textContent = '操作と魔法';
    const controlInfo = document.createElement('div');
    controlInfo.className = 'controls';
    controlInfo.innerHTML = `
      左ドラッグ: 整地（Shiftで掘削） / 右クリック: 祈りで信者を招く<br>
      スペース: 一時停止 / 数字キー1:守護 2:隆起 3:浄化雨
    `;
    const spellButtons = document.createElement('div');
    spellButtons.className = 'spell-buttons';
    const spellGuard = document.createElement('button');
    spellGuard.textContent = '1) 守護バリア (30)';
    const spellUplift = document.createElement('button');
    spellUplift.textContent = '2) 隆起 (40)';
    const spellPurify = document.createElement('button');
    spellPurify.textContent = '3) 浄化雨 (50)';
    spellButtons.appendChild(spellGuard);
    spellButtons.appendChild(spellUplift);
    spellButtons.appendChild(spellPurify);
    controlBox.appendChild(controlTitle);
    controlBox.appendChild(controlInfo);
    controlBox.appendChild(spellButtons);

    hudLeft.appendChild(controlBox);

    const logBox = document.createElement('div');
    logBox.className = 'stat-box';
    const logTitle = document.createElement('h3');
    logTitle.textContent = '出来事ログ';
    const logContainer = document.createElement('div');
    logContainer.className = 'log';
    logContainer.innerHTML = '---';
    logBox.appendChild(logTitle);
    logBox.appendChild(logContainer);

    hudLeft.appendChild(logBox);

    const canvasWrapper = document.createElement('div');
    canvasWrapper.style.position = 'relative';
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    const pauseOverlay = document.createElement('div');
    pauseOverlay.className = 'paused-overlay';
    pauseOverlay.textContent = '一時停止中';
    pauseOverlay.style.display = 'none';
    canvasWrapper.appendChild(canvas);
    canvasWrapper.appendChild(pauseOverlay);

    hud.appendChild(hudLeft);
    hud.appendChild(canvasWrapper);

    const statusMessage = document.createElement('div');
    statusMessage.className = 'status-message';
    statusMessage.textContent = '';

    container.appendChild(title);
    container.appendChild(hud);
    container.appendChild(statusMessage);

    root.appendChild(container);

    const ctx = canvas.getContext('2d');

    const state = {
      tiles: new Uint8Array(TILE_COUNT),
      mana: 40,
      manaMax: 120,
      population: 0,
      target: cfg.targetPopulation,
      followersQueue: 0,
      prayerCooldown: 0,
      disasterTimer: cfg.disasterInterval,
      timeLeft: cfg.duration,
      paused: false,
      running: false,
      ended: false,
      reason: null,
      settlements: [],
      flatZones: new Map(),
      disasters: [],
      bestTime: null,
      victoryAwarded: false,
      elapsed: 0,
      lastRender: 0,
      populationMilestone: 0
    };

    try {
      const best = localStorage.getItem('mini_populite_bestTime');
      if (best) state.bestTime = Number(best) || null;
    } catch {}

    function logEvent(text){
      const ts = formatTime(cfg.duration - state.timeLeft);
      const entry = `<div><strong>[${ts}]</strong> ${text}</div>`;
      if (logContainer.innerHTML === '---') logContainer.innerHTML = '';
      logContainer.innerHTML = entry + logContainer.innerHTML;
      const maxLines = 40;
      const children = logContainer.querySelectorAll('div');
      if (children.length > maxLines){
        for (let i = maxLines; i < children.length; i++) children[i].remove();
      }
    }

    function updateStatusMessage(text, duration = 2.5){
      statusMessage.textContent = text;
      if (!text) return;
      const id = Symbol('status');
      statusMessage._id = id;
      setTimeout(() => { if (statusMessage._id === id) statusMessage.textContent = ''; }, duration * 1000);
    }

    function showPopup(x, y, text, options){
      if (window.showTransientPopupAt){
        try { window.showTransientPopupAt(x, y, text, options); } catch {}
      }
    }

    function resetTiles(){
      for (let i = 0; i < TILE_COUNT; i++){
        state.tiles[i] = i % MAP_SIZE === 0 || i % MAP_SIZE === MAP_SIZE - 1 || Math.floor(i / MAP_SIZE) === 0 || Math.floor(i / MAP_SIZE) === MAP_SIZE - 1 ? 0 : (1 + Math.floor(Math.random() * 2));
      }
      state.flatZones.clear();
      state.populationMilestone = 0;
      recomputeSettlements({ skipMilestone: true });
      state.populationMilestone = Math.floor(state.population / 10) * 10;
    }

    function getTileHeight(x, y){
      if (x < 0 || y < 0 || x >= MAP_SIZE || y >= MAP_SIZE) return 0;
      return state.tiles[getTileIndex(x, y)];
    }

    function setTileHeight(x, y, value){
      const index = getTileIndex(x, y);
      state.tiles[index] = value;
    }

    function adjustTile(x, y, delta){
      const cost = cfg.flattenCost;
      if (state.mana < cost){
        updateStatusMessage('マナが不足しています…');
        return false;
      }
      const before = getTileHeight(x, y);
      const next = clamp(before + delta, TILE_MIN, TILE_MAX);
      if (next === before) return false;
      state.mana = Math.max(0, state.mana - cost);
      setTileHeight(x, y, next);
      checkFlatZonesAround(x, y);
      recomputeSettlements();
      awardXp(0.3, { type:'terraform', tile:`${x},${y}` });
      return true;
    }

    function checkFlatZonesAround(x, y){
      for (let oy = -2; oy <= 0; oy++){
        for (let ox = -2; ox <= 0; ox++){
          const sx = x + ox;
          const sy = y + oy;
          if (sx < 0 || sy < 0 || sx + 2 >= MAP_SIZE || sy + 2 >= MAP_SIZE) continue;
          const key = `${sx},${sy}`;
          let min = Infinity; let max = -Infinity;
          let water = false;
          for (let yy = 0; yy < 3; yy++){
            for (let xx = 0; xx < 3; xx++){
              const h = getTileHeight(sx + xx, sy + yy);
              if (h <= 0) water = true;
              if (h < min) min = h;
              if (h > max) max = h;
            }
          }
          const uniform = !water && (max - min <= 1);
          const prev = state.flatZones.get(key) || false;
          if (uniform && !prev){
            state.flatZones.set(key, true);
            awardXp(0.3, { type:'terraform_flat', origin: key });
          } else if (!uniform && prev){
            state.flatZones.set(key, false);
          }
        }
      }
    }

    function recomputeSettlements(opts = {}){
      const skipMilestone = !!opts.skipMilestone;
      const newMap = new Map();
      const updated = [];
      for (let sy = 0; sy <= MAP_SIZE - 3; sy++){
        for (let sx = 0; sx <= MAP_SIZE - 3; sx++){
          const key = `${sx},${sy}`;
          let min = Infinity; let max = -Infinity;
          for (let yy = 0; yy < 3; yy++){
            for (let xx = 0; xx < 3; xx++){
              const h = getTileHeight(sx + xx, sy + yy);
              if (h < min) min = h;
              if (h > max) max = h;
            }
          }
          const uniform = min > 0 && (max - min <= 0);
          if (!uniform) continue;
          const level = clamp(min, 1, LEVEL_CAP);
          newMap.set(key, level);
        }
      }
      const nextSettlements = [];
      const now = performance.now();
      const existingMap = new Map();
      for (const settlement of state.settlements){
        existingMap.set(`${settlement.x},${settlement.y}`, settlement);
      }
      for (const [key, level] of newMap.entries()){
        const [sx, sy] = key.split(',').map(Number);
        let settlement = existingMap.get(key);
        if (!settlement){
          settlement = {
            x: sx,
            y: sy,
            level,
            population: Math.floor(5 + Math.random() * 4),
            progress: Math.random(),
            barrierUntil: 0,
            buildAwarded: 0,
            lastDamage: 0,
            shielded: false,
            lastLevel: level
          };
          logEvent(`新しい集落が誕生 (${sx},${sy}) 高さ${level}`);
          awardXp(1, { type:'settlement', level });
        } else {
          settlement.level = level;
        }
        if (settlement.level > settlement.buildAwarded){
          const reward = settlement.level === 1 ? 1 : settlement.level === 2 ? 2 : 3;
          awardXp(reward, { type:'build', level: settlement.level });
          settlement.buildAwarded = settlement.level;
          showPopup((settlement.x + 1.5) * TILE_SIZE, (settlement.y + 1.5) * TILE_SIZE, `建築Lv${settlement.level}`, { variant:'bonus' });
        }
        settlement.lastLevel = settlement.level;
        updated.push(settlement);
      }
      state.settlements = updated;
      recalcPopulation(skipMilestone);
    }

    function recalcPopulation(skipMilestone = false){
      const population = state.settlements.reduce((sum, s) => sum + s.population, 0);
      state.population = population;
      if (!skipMilestone){
        checkPopulationMilestones();
      }
    }

    function checkPopulationMilestones(){
      if (state.population <= state.populationMilestone) return;
      while (state.population >= state.populationMilestone + 10){
        state.populationMilestone += 10;
        awardXp(5, { type:'population_milestone', value: state.populationMilestone });
        logEvent(`人口が${state.populationMilestone}人を突破！`);
      }
    }

    function distributeFollowers(dt){
      if (state.followersQueue <= 0 || state.settlements.length === 0) return;
      let distributable = Math.min(state.followersQueue, Math.ceil(dt * 6));
      if (distributable <= 0) return;
      state.followersQueue -= distributable;
      const sorted = [...state.settlements].sort((a, b) => (capacityFor(b) - b.population) - (capacityFor(a) - a.population));
      for (const s of sorted){
        if (distributable <= 0) break;
        const cap = capacityFor(s);
        const free = cap - s.population;
        if (free <= 0) continue;
        const take = Math.min(distributable, free);
        s.population += take;
        distributable -= take;
        state.population += take;
      }
      if (distributable > 0) state.followersQueue += distributable;
      checkPopulationMilestones();
    }

    function capacityFor(settlement){
      return settlement.level === 1 ? 30 : settlement.level === 2 ? 60 : 90;
    }

    function growthRate(settlement){
      return (0.12 + settlement.level * 0.08);
    }

    function regenMana(dt){
      let regen = 0;
      for (const s of state.settlements){
        const base = s.population * 0.5;
        const bonus = s.level === 1 ? 0 : s.level === 2 ? 1 : 2;
        regen += base + bonus;
      }
      regen *= cfg.manaRegenMultiplier;
      state.mana = clamp(state.mana + regen * dt, 0, state.manaMax);
    }

    function updateSettlements(dt){
      for (const s of state.settlements){
        const cap = capacityFor(s);
        s.progress += dt * growthRate(s);
        if (s.progress >= 1){
          const gain = Math.min(Math.floor(s.progress), cap - s.population);
          if (gain > 0){
            s.population += gain;
            s.progress -= gain;
            awardXp(0.5 * gain, { type:'growth', level: s.level });
            showPopup((s.x + 1.5) * TILE_SIZE, (s.y + 1.5) * TILE_SIZE, `+${gain}信者`, { variant:'combo' });
          } else {
            s.progress = Math.min(s.progress, 1);
          }
        }
      }
      state.population = state.settlements.reduce((sum, s) => sum + s.population, 0);
      checkPopulationMilestones();
    }

    function triggerPrayer(){
      if (state.prayerCooldown > 0){
        updateStatusMessage('祈りはまだ冷却中です…');
        return;
      }
      const cost = 10;
      if (state.mana < cost){
        updateStatusMessage('マナが不足しています…');
        return;
      }
      state.mana -= cost;
      state.followersQueue += 10;
      state.prayerCooldown = 8;
      awardXp(3, { type:'prayer' });
      logEvent('祈りの力で信者が集まり始めた！');
    }

    function updateCooldowns(dt){
      state.prayerCooldown = Math.max(0, state.prayerCooldown - dt);
      for (const s of state.settlements){
        if (s.barrierUntil && s.barrierUntil <= performance.now()){
          s.barrierUntil = 0;
        }
      }
    }

    function triggerDisaster(){
      const type = Math.random() < 0.5 ? 'tsunami' : 'volcano';
      if (type === 'tsunami'){
        logEvent('🌊 津波が低地を襲います！');
        const affected = [];
        for (let y = 0; y < MAP_SIZE; y++){
          for (let x = 0; x < MAP_SIZE; x++){
            const h = getTileHeight(x, y);
            if (h <= 1){
              setTileHeight(x, y, 0);
              affected.push({ x, y });
            }
          }
        }
        handleDisasterDamage(affected, { range: 0, type });
        state.disasters.push({ type, time: 0, duration: 4 });
      } else {
        const cx = 2 + Math.floor(Math.random() * (MAP_SIZE - 4));
        const cy = 2 + Math.floor(Math.random() * (MAP_SIZE - 4));
        const affected = [];
        const radius = 1 + cfg.disasterRadiusBonus;
        for (let y = -radius; y <= radius; y++){
          for (let x = -radius; x <= radius; x++){
            const tx = clamp(cx + x, 0, MAP_SIZE - 1);
            const ty = clamp(cy + y, 0, MAP_SIZE - 1);
            const dist = Math.hypot(x, y);
            if (dist <= radius + 0.2){
              const newHeight = clamp(getTileHeight(tx, ty) + (x === 0 && y === 0 ? 3 : 1), TILE_MIN, TILE_MAX);
              setTileHeight(tx, ty, newHeight);
              affected.push({ x: tx, y: ty });
            }
          }
        }
        handleDisasterDamage(affected, { range: radius, type });
        state.disasters.push({ type, cx, cy, time: 0, duration: 5 });
        logEvent(`🌋 火山が噴火！ (${cx},${cy})`);
      }
      recomputeSettlements();
      state.disasterTimer = cfg.disasterInterval;
      if (window.playSfx){ try { window.playSfx('damage'); } catch {} }
    }

    function handleDisasterDamage(tiles, opts){
      const now = performance.now();
      const affectedSet = new Set(tiles.map(t => `${t.x},${t.y}`));
      for (const s of state.settlements){
        let hit = false;
        for (let yy = 0; yy < 3 && !hit; yy++){
          for (let xx = 0; xx < 3 && !hit; xx++){
            const key = `${s.x + xx},${s.y + yy}`;
            if (affectedSet.has(key)) hit = true;
          }
        }
        if (!hit) continue;
        if (s.barrierUntil && s.barrierUntil > now){
          showPopup((s.x + 1.5) * TILE_SIZE, (s.y + 1.5) * TILE_SIZE, 'バリアが防いだ！', { variant:'shield' });
          continue;
        }
        const lossRatio = opts.type === 'tsunami' ? 0.4 : 0.3 + opts.range * 0.05;
        const lost = Math.max(1, Math.floor(s.population * lossRatio));
        s.population = Math.max(0, s.population - lost);
        s.progress = 0;
        s.lastDamage = now;
        if (s.population === 0){
          logEvent(`集落(${s.x},${s.y})が壊滅してしまった…`);
        } else {
          logEvent(`集落(${s.x},${s.y})が${lost}人の被害`);
        }
        state.population = Math.max(0, state.population - lost);
      }
      if (state.population <= 0){
        state.population = 0;
        if (!state.ended){
          endGame('population');
        }
      }
    }

    function castBarrier(){
      const cost = 30;
      if (state.mana < cost){ updateStatusMessage('マナが不足しています…'); return; }
      if (state.settlements.length === 0){ updateStatusMessage('守るべき集落がありません'); return; }
      const target = state.settlements.reduce((best, cur) => (cur.population > (best?.population || -1) ? cur : best), null);
      if (!target) return;
      state.mana -= cost;
      const now = performance.now();
      target.barrierUntil = now + 10000;
      logEvent(`守護バリアが集落(${target.x},${target.y})を包み込む`);
      awardXp(5, { type:'spell', spell:'barrier' });
    }

    function castUplift(){
      const cost = 40;
      if (state.mana < cost){ updateStatusMessage('マナが不足しています…'); return; }
      state.mana -= cost;
      const cx = 2 + Math.floor(Math.random() * (MAP_SIZE - 4));
      const cy = 2 + Math.floor(Math.random() * (MAP_SIZE - 4));
      for (let y = 0; y < 3; y++){
        for (let x = 0; x < 3; x++){
          const tx = clamp(cx + x - 1, 0, MAP_SIZE - 1);
          const ty = clamp(cy + y - 1, 0, MAP_SIZE - 1);
          const before = getTileHeight(tx, ty);
          const after = clamp(before + 2, TILE_MIN, TILE_MAX);
          setTileHeight(tx, ty, after);
          checkFlatZonesAround(tx, ty);
        }
      }
      recomputeSettlements();
      awardXp(6, { type:'spell', spell:'uplift' });
      logEvent(`大地が隆起し安全な高地が生まれた (${cx-1},${cy-1})`);
    }

    function castPurify(){
      const cost = 50;
      if (state.mana < cost){ updateStatusMessage('マナが不足しています…'); return; }
      state.mana -= cost;
      state.disasterTimer = cfg.disasterInterval;
      awardXp(8, { type:'spell', spell:'purify' });
      logEvent('浄化の雨で災害の兆候が洗い流された');
    }

    function endGame(reason){
      state.ended = true;
      state.running = false;
      state.reason = reason;
      let message = '';
      if (reason === 'victory'){
        message = '人口目標を達成しました！';
      } else if (reason === 'population'){
        message = '信者がいなくなってしまった…';
      } else {
        message = '時間切れです…';
      }
      updateStatusMessage(message, 6);
      pauseOverlay.style.display = 'none';
      shortcuts?.enableKey?.('r');
      shortcuts?.enableKey?.('Space');
      shortcuts?.enableKey?.(' ');
      if (reason === 'victory' && !state.victoryAwarded){
        state.victoryAwarded = true;
        awardXp(150, { type:'goal', remaining: state.timeLeft });
        if (state.timeLeft >= 30) awardXp(30, { type:'goal_bonus' });
        if (opts?.player?.awardItems){
          try {
            const result = opts.player.awardItems({ holyShard: 1 });
            if (result === 0){
              logEvent('インベントリに空きがなく聖なる欠片は見送られた…');
            }
          } catch (err){
            console.error(err);
          }
        }
        const elapsed = cfg.duration - state.timeLeft;
        try {
          if (!state.bestTime || elapsed < state.bestTime){
            localStorage.setItem('mini_populite_bestTime', String(elapsed));
            state.bestTime = elapsed;
            logEvent(`最速記録を更新！ ${elapsed.toFixed(1)}秒`);
          }
        } catch {}
      }
      logEvent(`▶ 結果: ${message}`);
      renderHUD();
    }

    function evaluateWin(){
      if (state.population >= state.target && !state.ended){
        endGame('victory');
      }
    }

    function step(dt){
      if (state.ended || state.paused) return;
      state.timeLeft -= dt;
      if (state.timeLeft <= 0){
        state.timeLeft = 0;
        endGame('timeout');
        return;
      }
      state.disasterTimer -= dt;
      if (state.disasterTimer <= 0){
        triggerDisaster();
      }
      regenMana(dt);
      distributeFollowers(dt);
      updateSettlements(dt);
      updateCooldowns(dt);
      evaluateWin();
      updateDisasters(dt);
    }

    function updateDisasters(dt){
      state.disasters = state.disasters.filter(dis => {
        dis.time += dt;
        return dis.time < dis.duration;
      });
    }

    function draw(){
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      for (let y = 0; y < MAP_SIZE; y++){
        for (let x = 0; x < MAP_SIZE; x++){
          const h = getTileHeight(x, y);
          const px = x * TILE_SIZE;
          const py = y * TILE_SIZE;
          let color;
          if (h <= 0){
            color = COLOR_PALETTE.water;
          } else if (h === 1){
            color = COLOR_PALETTE.plains[h - 1];
          } else if (h === 2){
            color = COLOR_PALETTE.plains[1];
          } else if (h === 3){
            color = COLOR_PALETTE.hills[0];
          } else if (h === 4){
            color = COLOR_PALETTE.hills[1];
          } else {
            color = COLOR_PALETTE.high[Math.min(1, h - 5)] || COLOR_PALETTE.high[0];
          }
          ctx.fillStyle = color;
          ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
          ctx.strokeStyle = 'rgba(15,23,42,0.12)';
          ctx.strokeRect(px + 0.5, py + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
        }
      }
      for (const disaster of state.disasters){
        if (disaster.type === 'tsunami'){
          ctx.fillStyle = 'rgba(14,165,233,0.35)';
          ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        } else if (disaster.type === 'volcano'){
          const radius = (1 + cfg.disasterRadiusBonus) * TILE_SIZE * 1.2;
          const cx = (disaster.cx + 0.5) * TILE_SIZE;
          const cy = (disaster.cy + 0.5) * TILE_SIZE;
          const grd = ctx.createRadialGradient(cx, cy, TILE_SIZE * 0.4, cx, cy, radius);
          grd.addColorStop(0, 'rgba(248,113,113,0.65)');
          grd.addColorStop(1, 'rgba(248,113,113,0)');
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      for (const s of state.settlements){
        const px = s.x * TILE_SIZE;
        const py = s.y * TILE_SIZE;
        const size = TILE_SIZE * 3;
        ctx.fillStyle = 'rgba(15,23,42,0.35)';
        ctx.fillRect(px, py, size, size);
        ctx.fillStyle = s.level === 3 ? '#f97316' : s.level === 2 ? '#facc15' : '#cbd5f5';
        ctx.fillRect(px + 6, py + 6, size - 12, size - 12);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 14px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(String(s.population), px + size / 2, py + size / 2 + 5);
        if (s.barrierUntil && s.barrierUntil > performance.now()){
          ctx.fillStyle = COLOR_PALETTE.barrier;
          ctx.fillRect(px, py, size, size);
        }
      }
      if (state.paused && !state.ended){
        ctx.fillStyle = 'rgba(15,23,42,0.6)';
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 28px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', CANVAS_SIZE / 2, CANVAS_SIZE / 2);
      }
    }

    function renderHUD(){
      timeValue.textContent = formatTime(state.timeLeft);
      manaValue.textContent = `${Math.round(state.mana)} / ${state.manaMax}`;
      const manaRatio = Math.min(1, state.mana / state.manaMax);
      manaBarFill.style.width = `${Math.max(4, manaRatio * 100)}%`;
      popValue.textContent = `${state.population} / ${state.target}`;
      popBarFill.style.width = `${Math.min(100, (state.population / state.target) * 100)}%`;
      disasterTimerValue.textContent = `${Math.ceil(state.disasterTimer)} 秒`;
      spellGuard.disabled = state.mana < 30;
      spellUplift.disabled = state.mana < 40;
      spellPurify.disabled = state.mana < 50;
      bestValue.textContent = state.bestTime ? `${state.bestTime.toFixed(1)}秒` : '--';
    }

    let raf = 0;
    let lastTs = 0;

    function loop(ts){
      if (!state.running){ return; }
      if (!lastTs) lastTs = ts;
      const dt = Math.min(0.25, (ts - lastTs) / 1000);
      lastTs = ts;
      step(dt);
      draw();
      renderHUD();
      raf = requestAnimationFrame(loop);
    }

    function start(){
      if (state.running) return;
      if (state.ended) return;
      state.running = true;
      state.paused = false;
      pauseOverlay.style.display = 'none';
      shortcuts?.disableKey?.('r');
      shortcuts?.disableKey?.('Space');
      shortcuts?.disableKey?.(' ');
      lastTs = 0;
      raf = requestAnimationFrame(loop);
    }

    function stop(opts = {}){
      if (!state.running) return;
      state.running = false;
      cancelAnimationFrame(raf);
      raf = 0;
      if (!opts.keepShortcutsDisabled){
        shortcuts?.enableKey?.('r');
        shortcuts?.enableKey?.('Space');
        shortcuts?.enableKey?.(' ');
      }
    }

    function togglePause(){
      if (state.ended) return;
      state.paused = !state.paused;
      if (state.paused){
        pauseOverlay.style.display = 'flex';
        updateStatusMessage('一時停止中');
      } else {
        pauseOverlay.style.display = 'none';
        updateStatusMessage('再開');
      }
    }

    function handlePointer(e){
      if (state.ended) return;
      if (state.paused) return;
      if (e.buttons !== 1) return;
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
      const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);
      if (x < 0 || y < 0 || x >= MAP_SIZE || y >= MAP_SIZE) return;
      const delta = e.shiftKey ? -1 : 1;
      if (adjustTile(x, y, delta)){
        draw();
        renderHUD();
      }
    }

    function handlePointerDown(e){
      if (e.button === 2){
        e.preventDefault();
        triggerPrayer();
        renderHUD();
        return false;
      }
      if (e.button !== 0) return;
      e.preventDefault();
      handlePointer(e);
      canvas.setPointerCapture(e.pointerId);
    }

    function handlePointerUp(e){
      try { canvas.releasePointerCapture(e.pointerId); } catch {}
    }

    function onContextMenu(e){ e.preventDefault(); }

    function onKey(e){
      if (['Space', ' ', 'Digit1', 'Digit2', 'Digit3', 'Numpad1', 'Numpad2', 'Numpad3'].includes(e.code) || ['1','2','3'].includes(e.key)){
        e.preventDefault();
      }
      if (state.ended) return;
      if (e.code === 'Space' || e.key === ' '){ togglePause(); return; }
      if (state.paused) return;
      if (e.code === 'Digit1' || e.code === 'Numpad1' || e.key === '1') castBarrier();
      if (e.code === 'Digit2' || e.code === 'Numpad2' || e.key === '2') castUplift();
      if (e.code === 'Digit3' || e.code === 'Numpad3' || e.key === '3') castPurify();
      renderHUD();
    }

    function destroy(){
      stop();
      window.removeEventListener('keydown', onKey);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointer);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
      canvas.removeEventListener('contextmenu', onContextMenu);
      try { root.removeChild(container); } catch {}
    }

    function getScore(){
      return state.population;
    }

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointer);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);
    canvas.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('keydown', onKey, { passive:false });

    resetTiles();
    draw();
    renderHUD();
    logEvent(`難易度: ${difficulty}`);
    logEvent(`人口目標 ${state.target} / 制限時間 ${cfg.duration}秒`);

    start();

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({
    id: 'populite',
    name: 'ポピュラス風',
    version: '0.1.0',
    category: 'シミュレーション',
    description: '地形を整えて信者を守り、人口目標を目指す神ゲーム',
    create
  });
})();

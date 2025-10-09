(function(){
  /** MiniExp: Dungeon Tower Defense
   *  - Uses mixed-type dungeon stage via MiniExp dungeon API
   *  - Player builds turrets on traversable tiles to stop enemy waves
   *  - Award EXP for enemy defeats and wave clears; survive all waves to win
   */
  function create(root, awardXp, opts){
    const shortcuts = opts?.shortcuts;
    const dungeonApi = opts?.dungeon;
    const difficulty = opts?.difficulty || 'NORMAL';
    const localization = (opts && opts.localization) || (typeof window !== 'undefined' && typeof window.createMiniGameLocalization === 'function'
      ? window.createMiniGameLocalization({ id: 'dungeon_td' })
      : null);
    const text = (key, fallback, params) => {
      if (localization && typeof localization.t === 'function') {
        return localization.t(key, fallback, params);
      }
      if (typeof fallback === 'function') return fallback();
      return fallback ?? '';
    };
    const formatNumberLocalized = (value, options) => {
      if (localization && typeof localization.formatNumber === 'function') {
        try { return localization.formatNumber(value, options); } catch {}
      }
      const locale = typeof localization?.getLocale === 'function' ? localization.getLocale() : undefined;
      if (typeof Intl !== 'undefined' && typeof Intl.NumberFormat === 'function') {
        try { return new Intl.NumberFormat(locale, options).format(value); } catch {}
      }
      if (value != null && typeof value.toLocaleString === 'function') {
        try { return value.toLocaleString(); } catch {}
      }
      return String(value ?? '');
    };
    const formatInteger = (value) => formatNumberLocalized(value, { maximumFractionDigits: 0 });
    let detachLocale = null;

    const wrapper = document.createElement('div');
    wrapper.className = 'mini-dungeon-td';
    wrapper.style.display = 'grid';
    wrapper.style.gridTemplateColumns = 'minmax(320px, 1fr)';
    wrapper.style.gap = '8px';
    wrapper.style.fontFamily = 'system-ui, sans-serif';

    const infoBar = document.createElement('div');
    infoBar.style.display = 'grid';
    infoBar.style.gridTemplateColumns = 'repeat(4, minmax(0, 1fr))';
    infoBar.style.alignItems = 'center';
    infoBar.style.gap = '8px';
    infoBar.style.background = 'rgba(15,23,42,0.88)';
    infoBar.style.color = '#e2e8f0';
    infoBar.style.padding = '8px 12px';
    infoBar.style.borderRadius = '10px';

    const waveLabel = document.createElement('div');
    const coinsLabel = document.createElement('div');
    const baseLabel = document.createElement('div');
    const expLabel = document.createElement('div');
    waveLabel.style.fontWeight = '600';
    coinsLabel.style.fontVariantNumeric = 'tabular-nums';
    baseLabel.style.fontVariantNumeric = 'tabular-nums';
    expLabel.style.fontVariantNumeric = 'tabular-nums';

    infoBar.appendChild(waveLabel);
    infoBar.appendChild(coinsLabel);
    infoBar.appendChild(baseLabel);
    infoBar.appendChild(expLabel);

    const canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    canvas.style.borderRadius = '10px';
    canvas.style.boxShadow = '0 12px 30px rgba(15,23,42,0.4)';
    canvas.style.background = '#020617';

    const controlBar = document.createElement('div');
    controlBar.style.display = 'flex';
    controlBar.style.flexWrap = 'wrap';
    controlBar.style.gap = '8px';

    const startWaveBtn = document.createElement('button');
    startWaveBtn.type = 'button';
    startWaveBtn.textContent = text('controls.startWave', 'ウェーブ開始');
    startWaveBtn.style.padding = '8px 14px';
    startWaveBtn.style.borderRadius = '8px';
    startWaveBtn.style.border = 'none';
    startWaveBtn.style.background = '#38bdf8';
    startWaveBtn.style.color = '#0f172a';
    startWaveBtn.style.fontWeight = '600';
    startWaveBtn.style.cursor = 'pointer';

    const hintLabel = document.createElement('div');
    hintLabel.style.flex = '1';
    hintLabel.style.minWidth = '220px';
    hintLabel.style.fontSize = '0.88rem';
    hintLabel.style.color = '#e2e8f0';
    hintLabel.style.background = 'rgba(15,23,42,0.85)';
    hintLabel.style.borderRadius = '8px';
    hintLabel.style.padding = '8px 10px';
    hintLabel.textContent = text('hud.hint', '床タイルをクリックで砲塔を設置 (Shift+クリックで砲塔強化)。敵がコアに到達すると耐久が減ります。');

    const statusLabel = document.createElement('div');
    statusLabel.style.background = 'rgba(15,23,42,0.88)';
    statusLabel.style.color = '#f8fafc';
    statusLabel.style.padding = '8px 12px';
    statusLabel.style.borderRadius = '10px';
    statusLabel.style.fontSize = '0.95rem';

    controlBar.appendChild(startWaveBtn);
    controlBar.appendChild(hintLabel);

    wrapper.appendChild(infoBar);
    wrapper.appendChild(canvas);
    wrapper.appendChild(controlBar);
    wrapper.appendChild(statusLabel);
    root.appendChild(wrapper);

    const difficultyConfig = {
      EASY: {
        baseHp: 30,
        startingCoins: 160,
        towerCost: 38,
        towerUpgradeBase: 45,
        towerRangeTiles: 4.6,
        towerDamage: 18,
        towerFireInterval: 0.8,
        enemyHpBase: 65,
        enemyHpGrowth: 18,
        enemySpeed: 42,
        enemyReward: 18,
        enemyDamage: 1,
        killXp: 6,
        waveBonusXp: 30,
        waveBonusCoins: 28,
        spawnInterval: 1.2,
        maxWaves: 10
      },
      NORMAL: {
        baseHp: 24,
        startingCoins: 135,
        towerCost: 48,
        towerUpgradeBase: 55,
        towerRangeTiles: 4.2,
        towerDamage: 20,
        towerFireInterval: 0.75,
        enemyHpBase: 80,
        enemyHpGrowth: 22,
        enemySpeed: 50,
        enemyReward: 22,
        enemyDamage: 1,
        killXp: 8,
        waveBonusXp: 36,
        waveBonusCoins: 32,
        spawnInterval: 1.05,
        maxWaves: 12
      },
      HARD: {
        baseHp: 18,
        startingCoins: 110,
        towerCost: 56,
        towerUpgradeBase: 65,
        towerRangeTiles: 4.0,
        towerDamage: 22,
        towerFireInterval: 0.68,
        enemyHpBase: 110,
        enemyHpGrowth: 26,
        enemySpeed: 58,
        enemyReward: 26,
        enemyDamage: 2,
        killXp: 10,
        waveBonusXp: 42,
        waveBonusCoins: 34,
        spawnInterval: 0.92,
        maxWaves: 12
      }
    };

    const config = difficultyConfig[difficulty] || difficultyConfig.NORMAL;

    const state = {
      stage: null,
      background: null,
      tileSize: 18,
      stageReady: false,
      runningWave: false,
      paused: true,
      pendingStart: false,
      loopActive: false,
      raf: 0,
      lastTs: 0,
      wave: 0,
      coins: config.startingCoins,
      baseHp: config.baseHp,
      maxBaseHp: config.baseHp,
      totalExp: 0,
      enemies: [],
      towers: [],
      effects: [],
      spawnQueue: [],
      spawnTimer: 0,
      pathTiles: [],
      pathTileSet: new Set(),
      pathSegments: [],
      pathLength: 0,
      spawnTile: null,
      baseTile: null,
      basePixel: { x: 0, y: 0 }
    };

    let hoverTile = null;
    let hoverValid = false;

    function disableHostShortcuts(){ shortcuts?.disableKey?.('r'); shortcuts?.disableKey?.('p'); }
    function enableHostShortcuts(){ shortcuts?.enableKey?.('r'); shortcuts?.enableKey?.('p'); }

    const lastStatus = { key: null, fallback: '', params: undefined };
    function refreshStatus(){
      statusLabel.textContent = text(lastStatus.key, lastStatus.fallback, lastStatus.params);
    }
    function setStatus(key, fallback, params){
      lastStatus.key = key || null;
      lastStatus.fallback = fallback !== undefined ? fallback : '';
      lastStatus.params = params;
      refreshStatus();
    }

    function updateHud(){
      const nextWaveNumber = state.runningWave ? state.wave : state.wave + 1;
      const currentWave = Math.min(nextWaveNumber, config.maxWaves);
      const waveParams = {
        current: currentWave,
        currentFormatted: formatInteger(currentWave),
        max: config.maxWaves > 0 ? config.maxWaves : null,
        maxFormatted: config.maxWaves > 0 ? formatInteger(config.maxWaves) : null
      };
      waveLabel.textContent = text(
        'hud.wave',
        () => {
          if (config.maxWaves > 0){
            return `Wave ${waveParams.currentFormatted}/${waveParams.maxFormatted}`;
          }
          return `Wave ${waveParams.currentFormatted}`;
        },
        waveParams
      );
      const coinsFormatted = formatInteger(state.coins);
      coinsLabel.textContent = text('hud.coins', () => `資金 ${coinsFormatted} G`, { value: state.coins, formatted: coinsFormatted });
      const baseHpFormatted = formatInteger(state.baseHp);
      const maxHpFormatted = formatInteger(state.maxBaseHp);
      baseLabel.textContent = text('hud.baseHp', () => `コア耐久 ${baseHpFormatted}/${maxHpFormatted}`, {
        value: state.baseHp,
        valueFormatted: baseHpFormatted,
        max: state.maxBaseHp,
        maxFormatted: maxHpFormatted
      });
      const expValue = Math.floor(state.totalExp);
      const expFormatted = formatInteger(expValue);
      expLabel.textContent = text('hud.exp', () => `獲得EXP ${expFormatted}`, { value: expValue, formatted: expFormatted });
      startWaveBtn.disabled = !state.stageReady || state.runningWave || state.baseHp <= 0 || state.wave >= config.maxWaves;
    }

    function applyLocale(){
      startWaveBtn.textContent = text('controls.startWave', 'ウェーブ開始');
      hintLabel.textContent = text('hud.hint', '床タイルをクリックで砲塔を設置 (Shift+クリックで砲塔強化)。敵がコアに到達すると耐久が減ります。');
      refreshStatus();
      updateHud();
    }

    if (localization && typeof localization.onChange === 'function'){
      detachLocale = localization.onChange(() => {
        try {
          applyLocale();
        } catch (error) {
          console.warn('[dungeon_td] Failed to apply locale update:', error);
        }
      });
    }

    function clampNumber(value, fallback = 0){
      return Number.isFinite(value) ? value : fallback;
    }

    function computeTilePath(startTile, goalTile){
      if (!state.stage) return null;
      const w = state.stage.width;
      const h = state.stage.height;
      if (!w || !h) return null;
      const idx = (x, y) => y * w + x;
      const startIdx = idx(startTile.x, startTile.y);
      const goalIdx = idx(goalTile.x, goalTile.y);
      const visited = new Uint8Array(w * h);
      const parent = new Int32Array(w * h);
      parent.fill(-1);
      const queue = [];
      queue.push(startIdx);
      visited[startIdx] = 1;
      let head = 0;
      const dirs = [ [1,0], [-1,0], [0,1], [0,-1] ];
      while (head < queue.length){
        const currentIdx = queue[head++];
        if (currentIdx === goalIdx) break;
        const cx = currentIdx % w;
        const cy = Math.floor(currentIdx / w);
        for (const [dx, dy] of dirs){
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          if (state.stage.tiles[ny]?.[nx] !== 0) continue;
          const nextIdx = idx(nx, ny);
          if (visited[nextIdx]) continue;
          visited[nextIdx] = 1;
          parent[nextIdx] = currentIdx;
          queue.push(nextIdx);
        }
      }
      if (!visited[goalIdx]) return null;
      const path = [];
      let cursor = goalIdx;
      while (cursor >= 0){
        const x = cursor % w;
        const y = Math.floor(cursor / w);
        path.push({ x, y });
        if (cursor === startIdx) break;
        cursor = parent[cursor];
      }
      if (path[path.length - 1].x !== startTile.x || path[path.length - 1].y !== startTile.y) return null;
      path.reverse();
      return path;
    }

    function pickPathEndpoints(){
      if (!state.stage) return false;
      const floors = typeof state.stage.listFloorCells === 'function' ? state.stage.listFloorCells() : [];
      if (!floors.length) return false;
      const boundary = floors.filter(cell => cell.x <= 1 || cell.y <= 1 || cell.x >= state.stage.width - 2 || cell.y >= state.stage.height - 2);
      const randomFloor = () => floors[Math.floor(Math.random() * floors.length)] || null;
      const randomBoundary = () => boundary[Math.floor(Math.random() * boundary.length)] || null;
      let bestPath = null;
      let spawn = null;
      let base = null;
      const attempts = Math.max(40, floors.length);
      for (let attempt = 0; attempt < attempts; attempt++){
        const candidateBase = attempt < 16 ? randomFloor() : state.stage.pickFloorPosition({});
        if (!candidateBase) continue;
        const baseIdx = `${candidateBase.x},${candidateBase.y}`;
        for (let t = 0; t < 24; t++){
          const candidateSpawn = randomBoundary() || randomFloor();
          if (!candidateSpawn) continue;
          if (`${candidateSpawn.x},${candidateSpawn.y}` === baseIdx) continue;
          const path = computeTilePath(candidateSpawn, candidateBase);
          if (!path) continue;
          if (!bestPath || path.length > bestPath.length){
            bestPath = path;
            spawn = { x: candidateSpawn.x, y: candidateSpawn.y };
            base = { x: candidateBase.x, y: candidateBase.y };
          }
          if (bestPath && bestPath.length >= Math.max(state.stage.width, state.stage.height)) break;
        }
        if (bestPath && bestPath.length >= Math.max(state.stage.width, state.stage.height)) break;
      }
      if (!bestPath){
        const pair = state.stage.pickFloorPositions(2, { minDistance: 6 });
        if (!pair || pair.length < 2) return false;
        const fallbackPath = computeTilePath(pair[0], pair[1]);
        if (!fallbackPath) return false;
        bestPath = fallbackPath;
        spawn = pair[0];
        base = pair[1];
      }
      if (!bestPath || !spawn || !base) return false;
      state.pathTiles = bestPath;
      state.pathTileSet = new Set(bestPath.map(tile => `${tile.x},${tile.y}`));
      state.spawnTile = spawn;
      state.baseTile = base;
      state.basePixel = state.stage.tileCenter(base.x, base.y);
      const centers = bestPath.map(tile => state.stage.tileCenter(tile.x, tile.y));
      state.pathSegments = [];
      state.pathLength = 0;
      for (let i = 0; i < centers.length - 1; i++){
        const start = centers[i];
        const end = centers[i + 1];
        const length = Math.hypot(end.x - start.x, end.y - start.y);
        if (length <= 0) continue;
        state.pathSegments.push({ start, end, length });
        state.pathLength += length;
      }
      return state.pathSegments.length > 0;
    }

    function positionAlongPath(distance){
      if (!state.pathSegments.length) return { x: state.basePixel.x, y: state.basePixel.y };
      let remaining = distance;
      for (const segment of state.pathSegments){
        if (remaining <= segment.length){
          const ratio = segment.length > 0 ? remaining / segment.length : 0;
          return {
            x: segment.start.x + (segment.end.x - segment.start.x) * ratio,
            y: segment.start.y + (segment.end.y - segment.start.y) * ratio
          };
        }
        remaining -= segment.length;
      }
      const last = state.pathSegments[state.pathSegments.length - 1].end;
      return { x: last.x, y: last.y };
    }

    function isTileBuildable(tile){
      if (!state.stage) return false;
      const { x, y } = tile;
      if (x < 0 || y < 0 || x >= state.stage.width || y >= state.stage.height) return false;
      if (state.stage.tiles[y]?.[x] !== 0) return false;
      const key = `${x},${y}`;
      if (state.pathTileSet.has(key)) return false;
      if (state.baseTile && state.baseTile.x === x && state.baseTile.y === y) return false;
      if (state.spawnTile && state.spawnTile.x === x && state.spawnTile.y === y) return false;
      for (const tower of state.towers){
        if (tower.tileX === x && tower.tileY === y) return false;
      }
      return true;
    }

    function addEffect(from, to){
      state.effects.push({
        x1: from.x,
        y1: from.y,
        x2: to.x,
        y2: to.y,
        life: 0.16
      });
    }

    function addTower(tile){
      if (!isTileBuildable(tile)){
        setStatus('status.tileUnavailable', 'そのタイルには砲塔を設置できません');
        return;
      }
      if (state.coins < config.towerCost){
        setStatus('status.insufficientFunds', '資金が不足しています');
        return;
      }
      const center = state.stage.tileCenter(tile.x, tile.y);
      const tower = {
        tileX: tile.x,
        tileY: tile.y,
        x: center.x,
        y: center.y,
        level: 1,
        range: config.towerRangeTiles * state.tileSize,
        damage: config.towerDamage,
        fireInterval: config.towerFireInterval,
        cooldown: 0
      };
      state.towers.push(tower);
      state.coins -= config.towerCost;
      setStatus('status.towerPlaced', '砲塔を設置しました');
      updateHud();
    }

    function upgradeTower(tower){
      const upgradeCost = Math.floor(config.towerUpgradeBase * Math.pow(1.35, tower.level - 1));
      if (state.coins < upgradeCost){
        const upgradeCostFormatted = formatInteger(upgradeCost);
        setStatus(
          'status.upgradeInsufficientFunds',
          () => `強化に必要な資金が不足しています (${upgradeCostFormatted} G)`,
          { cost: upgradeCost, costFormatted: upgradeCostFormatted }
        );
        return;
      }
      state.coins -= upgradeCost;
      tower.level += 1;
      tower.damage *= 1.32;
      tower.range *= 1.06;
      tower.fireInterval = Math.max(0.32, tower.fireInterval * 0.88);
      const towerLevelFormatted = formatInteger(tower.level);
      setStatus(
        'status.towerUpgraded',
        () => `砲塔をLv${towerLevelFormatted}に強化しました`,
        { level: tower.level, levelFormatted: towerLevelFormatted }
      );
      updateHud();
    }

    function createEnemy(){
      const waveFactor = 1 + (state.wave - 1) * 0.18;
      const hp = Math.round((config.enemyHpBase + config.enemyHpGrowth * (state.wave - 1)) * waveFactor);
      const reward = Math.round(config.enemyReward * (1 + (state.wave - 1) * 0.12));
      const enemy = {
        hp,
        maxHp: hp,
        reward,
        damage: config.enemyDamage,
        speed: config.enemySpeed * (1 + (state.wave - 1) * 0.05),
        distance: 0,
        x: state.spawnTile ? state.stage.tileCenter(state.spawnTile.x, state.spawnTile.y).x : 0,
        y: state.spawnTile ? state.stage.tileCenter(state.spawnTile.x, state.spawnTile.y).y : 0
      };
      return enemy;
    }

    function beginWave(){
      if (!state.stageReady || state.runningWave || state.baseHp <= 0) return;
      if (!state.pathSegments.length){
        setStatus('status.noPath', '経路を構成できませんでした');
        return;
      }
      state.wave += 1;
      const enemyCount = Math.floor(6 + state.wave * 2.5);
      state.spawnQueue = Array.from({ length: enemyCount }, () => createEnemy());
      state.spawnTimer = 0.6;
      state.runningWave = true;
      state.paused = false;
      disableHostShortcuts();
      const waveFormatted = formatInteger(state.wave);
      setStatus('status.waveStarted', () => `Wave ${waveFormatted} が始まりました！`, { wave: state.wave, waveFormatted });
      updateHud();
    }

    function finishWave(){
      state.runningWave = false;
      enableHostShortcuts();
      const bonusCoins = config.waveBonusCoins + Math.floor(state.wave * 1.5);
      state.coins += bonusCoins;
      const gained = clampNumber(awardXp(config.waveBonusXp + state.wave * 4, { reason: 'wave-clear', wave: state.wave, gameId: 'dungeon_td' }), 0);
      state.totalExp += gained;
      const waveFormatted = formatInteger(state.wave);
      const bonusCoinsFormatted = formatInteger(bonusCoins);
      const waveXp = config.waveBonusXp + state.wave * 4;
      const waveXpFormatted = formatInteger(waveXp);
      if (state.wave >= config.maxWaves){
        setStatus(
          'status.allWavesCleared',
          () => `全ウェーブ防衛成功！ボーナス ${bonusCoinsFormatted}G / EXP +${waveXpFormatted}`,
          {
            wave: state.wave,
            waveFormatted,
            bonusCoins,
            bonusCoinsFormatted,
            bonusXp: waveXp,
            bonusXpFormatted: waveXpFormatted
          }
        );
      } else {
        setStatus(
          'status.waveCleared',
          () => `Wave ${waveFormatted} を防衛！ 資金+${bonusCoinsFormatted} / EXP +${waveXpFormatted}`,
          {
            wave: state.wave,
            waveFormatted,
            bonusCoins,
            bonusCoinsFormatted,
            bonusXp: waveXp,
            bonusXpFormatted: waveXpFormatted
          }
        );
      }
      updateHud();
      if (state.wave >= config.maxWaves){
        endGame('victory');
      }
    }

    function handleEnemyDefeat(enemy){
      state.coins += enemy.reward;
      const gained = clampNumber(awardXp(config.killXp, { reason: 'enemy-defeat', wave: state.wave, gameId: 'dungeon_td' }), 0);
      state.totalExp += gained;
      updateHud();
    }

    function endGame(result){
      state.runningWave = false;
      state.spawnQueue = [];
      state.enemies.length = 0;
      enableHostShortcuts();
      if (result === 'defeat'){
        setStatus('status.coreDestroyed', 'コアが破壊されました…ウェーブ失敗');
      } else if (result === 'victory'){
        const bonus = clampNumber(awardXp(120, { reason: 'full-clear', gameId: 'dungeon_td' }), 0);
        state.totalExp += bonus;
        const bonusFormatted = formatInteger(120);
        setStatus('status.fullClearBonus', () => `完全防衛達成！追加ボーナスEXP +${bonusFormatted}`, { bonus: 120, bonusFormatted });
      }
      updateHud();
    }

    function spawnEnemy(){
      if (!state.spawnQueue.length) return;
      const enemy = state.spawnQueue.shift();
      enemy.distance = 0;
      const pos = positionAlongPath(0);
      enemy.x = pos.x;
      enemy.y = pos.y;
      state.enemies.push(enemy);
      state.spawnTimer = config.spawnInterval;
    }

    function updateEnemies(dt){
      for (let i = state.enemies.length - 1; i >= 0; i--){
        const enemy = state.enemies[i];
        if (enemy.hp <= 0){
          handleEnemyDefeat(enemy);
          state.enemies.splice(i, 1);
          continue;
        }
        enemy.distance += enemy.speed * dt;
        if (enemy.distance >= state.pathLength){
          state.enemies.splice(i, 1);
          state.baseHp = Math.max(0, state.baseHp - enemy.damage);
          if (state.baseHp <= 0){
            state.baseHp = 0;
            updateHud();
            setStatus('status.coreBreached', '敵がコアに侵入しました…');
            endGame('defeat');
            return;
          }
          setStatus('status.coreDamaged', '敵がコアに到達！耐久が減少');
          updateHud();
          continue;
        }
        const pos = positionAlongPath(enemy.distance);
        enemy.x = pos.x;
        enemy.y = pos.y;
      }
    }

    function findTarget(tower){
      let best = null;
      let bestProgress = -Infinity;
      for (const enemy of state.enemies){
        const dx = enemy.x - tower.x;
        const dy = enemy.y - tower.y;
        if (dx * dx + dy * dy > tower.range * tower.range) continue;
        if (enemy.distance > bestProgress){
          best = enemy;
          bestProgress = enemy.distance;
        }
      }
      return best;
    }

    function updateTowers(dt){
      for (const tower of state.towers){
        tower.cooldown = Math.max(0, tower.cooldown - dt);
        if (tower.cooldown > 0) continue;
        const target = findTarget(tower);
        if (!target) continue;
        target.hp -= tower.damage;
        tower.cooldown = tower.fireInterval;
        addEffect({ x: tower.x, y: tower.y }, { x: target.x, y: target.y });
      }
    }

    function updateEffects(dt){
      for (let i = state.effects.length - 1; i >= 0; i--){
        const effect = state.effects[i];
        effect.life -= dt;
        if (effect.life <= 0){
          state.effects.splice(i, 1);
        }
      }
    }

    function draw(){
      if (!state.stage || !state.background) return;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(state.background.canvas, 0, 0);
      if (state.pathTiles.length){
        ctx.fillStyle = 'rgba(59,130,246,0.15)';
        for (const tile of state.pathTiles){
          ctx.fillRect(tile.x * state.tileSize, tile.y * state.tileSize, state.tileSize, state.tileSize);
        }
      }
      if (state.baseTile){
        ctx.fillStyle = 'rgba(249,115,22,0.75)';
        const radius = state.tileSize * 0.6;
        ctx.beginPath();
        ctx.arc(state.basePixel.x, state.basePixel.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      if (state.spawnTile){
        const spawnCenter = state.stage.tileCenter(state.spawnTile.x, state.spawnTile.y);
        ctx.fillStyle = 'rgba(56,189,248,0.75)';
        ctx.beginPath();
        ctx.arc(spawnCenter.x, spawnCenter.y, state.tileSize * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#38bdf8';
      for (const tower of state.towers){
        ctx.save();
        ctx.translate(tower.x, tower.y);
        ctx.rotate(Math.PI / 4);
        const size = state.tileSize * 0.6;
        ctx.fillRect(-size / 2, -size / 2, size, size);
        ctx.restore();
      }
      ctx.strokeStyle = 'rgba(148,163,184,0.6)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      for (const effect of state.effects){
        ctx.globalAlpha = Math.max(0, effect.life / 0.16);
        ctx.beginPath();
        ctx.moveTo(effect.x1, effect.y1);
        ctx.lineTo(effect.x2, effect.y2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      for (const enemy of state.enemies){
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, state.tileSize * 0.38, 0, Math.PI * 2);
        ctx.fill();
        const hpRatio = Math.max(0, Math.min(1, enemy.hp / enemy.maxHp));
        const barWidth = state.tileSize * 0.9;
        const barHeight = 4;
        ctx.fillStyle = 'rgba(15,23,42,0.7)';
        ctx.fillRect(enemy.x - barWidth / 2, enemy.y - state.tileSize * 0.55, barWidth, barHeight);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(enemy.x - barWidth / 2, enemy.y - state.tileSize * 0.55, barWidth * hpRatio, barHeight);
      }
      if (hoverTile){
        const { x, y } = hoverTile;
        ctx.fillStyle = hoverValid ? 'rgba(34,197,94,0.32)' : 'rgba(248,113,113,0.32)';
        ctx.fillRect(x * state.tileSize, y * state.tileSize, state.tileSize, state.tileSize);
      }
    }

    function step(dt){
      if (state.paused) return;
      if (state.runningWave){
        state.spawnTimer -= dt;
        if (state.spawnTimer <= 0){
          spawnEnemy();
        }
      }
      updateTowers(dt);
      updateEnemies(dt);
      if (state.runningWave && state.spawnQueue.length === 0 && state.enemies.length === 0 && state.baseHp > 0){
        finishWave();
      }
      updateEffects(dt);
      draw();
    }

    function loop(ts){
      if (!state.loopActive) return;
      const now = ts * 0.001;
      if (!state.lastTs) state.lastTs = now;
      const dt = Math.min(0.2, now - state.lastTs);
      state.lastTs = now;
      step(dt);
      state.raf = requestAnimationFrame(loop);
    }

    function startAnimation(){
      if (state.loopActive) return;
      state.loopActive = true;
      state.lastTs = 0;
      state.raf = requestAnimationFrame(loop);
    }

    function stopAnimation(){
      if (!state.loopActive) return;
      state.loopActive = false;
      cancelAnimationFrame(state.raf);
      state.raf = 0;
    }

    function prepareStage(){
      if (!dungeonApi || typeof dungeonApi.generateStage !== 'function'){
        setStatus('status.apiUnavailable', 'ダンジョンAPIを利用できません');
        return;
      }
      setStatus('status.generatingStage', 'ステージ生成中…');
      dungeonApi.generateStage({ type: 'mixed', tilesX: 44, tilesY: 32, tileSize: 20 }).then((generated) => {
        state.stage = generated;
        state.tileSize = generated.tileSize;
        state.background = dungeonApi.renderStage(generated, { tileSize: generated.tileSize, showGrid: false });
        canvas.width = state.background.canvas.width;
        canvas.height = state.background.canvas.height;
        const pathReady = pickPathEndpoints();
        if (!pathReady){
          setStatus('status.pathFailedRetry', '経路の確保に失敗しました。再読み込みしてください。');
          return;
        }
        state.stageReady = true;
        state.paused = false;
        setStatus('status.ready', '砲塔を配置してウェーブ開始を押してください');
        updateHud();
        draw();
        if (state.pendingStart){
          state.pendingStart = false;
          state.paused = false;
        }
        startAnimation();
      }).catch(() => {
        setStatus('status.stageGenerationFailed', 'ステージ生成に失敗しました');
      });
    }

    function pointerToTile(event){
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const px = (event.clientX - rect.left) * scaleX;
      const py = (event.clientY - rect.top) * scaleY;
      const tx = Math.floor(px / state.tileSize);
      const ty = Math.floor(py / state.tileSize);
      if (tx < 0 || ty < 0 || tx >= state.stage.width || ty >= state.stage.height) return null;
      return { x: tx, y: ty };
    }

    function handlePointerMove(event){
      if (!state.stageReady) return;
      const tile = pointerToTile(event);
      hoverTile = tile;
      hoverValid = tile ? isTileBuildable(tile) : false;
      draw();
    }

    function handlePointerLeave(){
      hoverTile = null;
      hoverValid = false;
      draw();
    }

    function handlePointerClick(event){
      if (!state.stageReady) return;
      const tile = pointerToTile(event);
      if (!tile) return;
      const tower = state.towers.find(t => t.tileX === tile.x && t.tileY === tile.y);
      if (tower){
        if (event.shiftKey){
          upgradeTower(tower);
        } else {
          setStatus('status.upgradeHint', 'Shift+クリックで砲塔を強化できます');
        }
        return;
      }
      addTower(tile);
    }

    canvas.addEventListener('mousemove', handlePointerMove);
    canvas.addEventListener('mouseleave', handlePointerLeave);
    canvas.addEventListener('click', handlePointerClick);

    function handleStartWave(){
      beginWave();
    }

    startWaveBtn.addEventListener('click', handleStartWave);

    applyLocale();
    prepareStage();

    function start(){
      if (!state.stageReady){
        state.pendingStart = true;
        return;
      }
      state.paused = false;
      if (state.runningWave) disableHostShortcuts();
      startAnimation();
    }

    function stop(){
      state.paused = true;
      enableHostShortcuts();
    }

    function destroy(){
      stop();
      stopAnimation();
      canvas.removeEventListener('mousemove', handlePointerMove);
      canvas.removeEventListener('mouseleave', handlePointerLeave);
      canvas.removeEventListener('click', handlePointerClick);
      startWaveBtn.removeEventListener('click', handleStartWave);
      if (detachLocale){
        try { detachLocale(); } catch (error) { console.warn('[dungeon_td] Failed to detach locale listener:', error); }
        detachLocale = null;
      }
      try { wrapper.remove(); } catch {}
    }

    function getScore(){
      return state.wave;
    }

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({
    id: 'dungeon_td',
    name: 'ダンジョンタワーディフェンス', nameKey: 'selection.miniexp.games.dungeon_td.name',
    description: '混合型ダンジョンを舞台に砲塔を設置してコアを防衛するタワーディフェンス', descriptionKey: 'selection.miniexp.games.dungeon_td.description', categoryIds: ['action'],
    create
  });
})();

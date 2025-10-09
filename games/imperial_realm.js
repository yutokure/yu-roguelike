(function(){
  /**
   * MiniExp: Imperial Realm — AoE2-inspired RTS mini-game
   * - Manage villagers, build structures, and repel enemy raids.
   */
  function create(root, awardXp, opts){
    const difficulty = (opts && opts.difficulty) || 'NORMAL';
    const difficultyCfg = (
      difficulty === 'HARD' ? {
        enemyHpMultiplier: 1.2,
        waveInterval: 75000,
        waveCount: 4,
        startingResources: { food: 180, wood: 180, gold: 90, stone: 60 },
        bonusXp: 1.2
      } : difficulty === 'EASY' ? {
        enemyHpMultiplier: 0.85,
        waveInterval: 95000,
        waveCount: 3,
        startingResources: { food: 260, wood: 240, gold: 120, stone: 80 },
        bonusXp: 0.85
      } : {
        enemyHpMultiplier: 1,
        waveInterval: 85000,
        waveCount: 3,
        startingResources: { food: 220, wood: 210, gold: 110, stone: 70 },
        bonusXp: 1
      }
    );

    const size = { width: 880, height: 520 };

    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.display = 'grid';
    container.style.gridTemplateColumns = '260px 1fr 220px';
    container.style.gridTemplateRows = 'auto 1fr auto';
    container.style.gap = '8px';
    container.style.width = (size.width + 480) + 'px';
    container.style.padding = '12px';
    container.style.boxSizing = 'border-box';
    container.style.fontFamily = '\"Segoe UI\", \"Yu Gothic UI\", sans-serif';
    container.style.background = 'linear-gradient(160deg, #020617 0%, #0f172a 30%, #1e293b 100%)';
    container.style.color = '#e2e8f0';
    container.style.borderRadius = '16px';
    container.style.boxShadow = '0 20px 45px rgba(2, 6, 23, 0.6)';

    const topPanel = document.createElement('div');
    topPanel.style.gridColumn = '1 / span 3';
    topPanel.style.display = 'flex';
    topPanel.style.alignItems = 'center';
    topPanel.style.justifyContent = 'space-between';
    topPanel.style.padding = '8px 12px';
    topPanel.style.background = 'rgba(15, 23, 42, 0.82)';
    topPanel.style.borderRadius = '12px';
    topPanel.style.boxShadow = '0 10px 24px rgba(2, 6, 23, 0.45)';
    container.appendChild(topPanel);

    const resourcePanel = document.createElement('div');
    resourcePanel.style.display = 'flex';
    resourcePanel.style.gap = '16px';
    resourcePanel.style.fontSize = '14px';
    resourcePanel.style.fontWeight = '600';
    topPanel.appendChild(resourcePanel);

    const timerPanel = document.createElement('div');
    timerPanel.style.display = 'flex';
    timerPanel.style.flexDirection = 'column';
    timerPanel.style.alignItems = 'flex-end';
    timerPanel.style.fontSize = '13px';
    timerPanel.style.lineHeight = '1.4';
    topPanel.appendChild(timerPanel);

    const mainCanvas = document.createElement('canvas');
    mainCanvas.width = size.width;
    mainCanvas.height = size.height;
    mainCanvas.style.gridColumn = '2 / span 1';
    mainCanvas.style.gridRow = '2 / span 1';
    mainCanvas.style.background = '#111827';
    mainCanvas.style.borderRadius = '12px';
    mainCanvas.style.boxShadow = '0 20px 45px rgba(2, 6, 23, 0.5) inset';
    mainCanvas.style.cursor = 'default';

    const ctx = mainCanvas.getContext('2d');

    const leftPanel = document.createElement('div');
    leftPanel.style.gridColumn = '1 / span 1';
    leftPanel.style.gridRow = '2 / span 1';
    leftPanel.style.background = 'rgba(15, 23, 42, 0.78)';
    leftPanel.style.borderRadius = '12px';
    leftPanel.style.padding = '12px';
    leftPanel.style.display = 'flex';
    leftPanel.style.flexDirection = 'column';
    leftPanel.style.gap = '8px';
    leftPanel.style.fontSize = '13px';
    leftPanel.style.boxShadow = '0 12px 30px rgba(2, 6, 23, 0.45) inset';

    const logTitle = document.createElement('div');
    logTitle.style.fontWeight = '700';
    logTitle.style.color = '#38bdf8';
    leftPanel.appendChild(logTitle);

    const logView = document.createElement('div');
    logView.style.flex = '1';
    logView.style.overflowY = 'auto';
    logView.style.background = 'rgba(15, 23, 42, 0.6)';
    logView.style.borderRadius = '10px';
    logView.style.padding = '8px';
    logView.style.lineHeight = '1.5';
    logView.style.boxShadow = 'inset 0 0 0 1px rgba(56, 189, 248, 0.15)';
    leftPanel.appendChild(logView);

    const actionPanel = document.createElement('div');
    actionPanel.style.gridColumn = '1 / span 3';
    actionPanel.style.gridRow = '3 / span 1';
    actionPanel.style.display = 'grid';
    actionPanel.style.gridTemplateColumns = '260px 1fr 220px';
    actionPanel.style.gap = '8px';

    const selectionPanel = document.createElement('div');
    selectionPanel.style.background = 'rgba(15, 23, 42, 0.85)';
    selectionPanel.style.borderRadius = '12px';
    selectionPanel.style.padding = '12px';
    selectionPanel.style.display = 'flex';
    selectionPanel.style.flexDirection = 'column';
    selectionPanel.style.gap = '6px';
    selectionPanel.style.boxShadow = '0 12px 30px rgba(2, 6, 23, 0.4)';

    const actionButtonPanel = document.createElement('div');
    actionButtonPanel.style.background = 'rgba(15, 23, 42, 0.85)';
    actionButtonPanel.style.borderRadius = '12px';
    actionButtonPanel.style.padding = '12px';
    actionButtonPanel.style.display = 'grid';
    actionButtonPanel.style.gridTemplateColumns = 'repeat(auto-fit, minmax(120px, 1fr))';
    actionButtonPanel.style.gap = '8px';
    actionButtonPanel.style.alignContent = 'flex-start';
    actionButtonPanel.style.boxShadow = '0 12px 30px rgba(2, 6, 23, 0.4)';

    const intelPanel = document.createElement('div');
    intelPanel.style.background = 'rgba(15, 23, 42, 0.85)';
    intelPanel.style.borderRadius = '12px';
    intelPanel.style.padding = '12px';
    intelPanel.style.display = 'flex';
    intelPanel.style.flexDirection = 'column';
    intelPanel.style.gap = '6px';
    intelPanel.style.boxShadow = '0 12px 30px rgba(2, 6, 23, 0.4)';

    actionPanel.appendChild(selectionPanel);
    actionPanel.appendChild(actionButtonPanel);
    actionPanel.appendChild(intelPanel);

    const rightPanel = document.createElement('div');
    rightPanel.style.gridColumn = '3 / span 1';
    rightPanel.style.gridRow = '2 / span 1';
    rightPanel.style.background = 'rgba(15, 23, 42, 0.78)';
    rightPanel.style.borderRadius = '12px';
    rightPanel.style.padding = '12px';
    rightPanel.style.display = 'flex';
    rightPanel.style.flexDirection = 'column';
    rightPanel.style.gap = '10px';
    rightPanel.style.fontSize = '13px';
    rightPanel.style.boxShadow = '0 12px 30px rgba(2, 6, 23, 0.45) inset';

    const waveTitle = document.createElement('div');
    waveTitle.style.fontWeight = '700';
    waveTitle.style.color = '#facc15';
    rightPanel.appendChild(waveTitle);

    const waveInfo = document.createElement('div');
    waveInfo.style.lineHeight = '1.6';
    waveInfo.style.whiteSpace = 'pre-line';
    rightPanel.appendChild(waveInfo);

    const miniMapCanvas = document.createElement('canvas');
    miniMapCanvas.width = 200;
    miniMapCanvas.height = 150;
    miniMapCanvas.style.background = 'rgba(15, 23, 42, 0.8)';
    miniMapCanvas.style.borderRadius = '10px';
    miniMapCanvas.style.boxShadow = 'inset 0 0 0 1px rgba(148, 163, 184, 0.3)';
    rightPanel.appendChild(miniMapCanvas);
    const miniCtx = miniMapCanvas.getContext('2d');

    container.appendChild(topPanel);
    container.appendChild(leftPanel);
    container.appendChild(mainCanvas);
    container.appendChild(rightPanel);
    container.appendChild(actionPanel);

    if (root) {
      root.appendChild(container);
    }

    const localization = (opts && opts.localization) || (typeof window !== 'undefined' && typeof window.createMiniGameLocalization === 'function'
      ? window.createMiniGameLocalization({ id: 'imperial_realm' })
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
        try {
          return localization.formatNumber(value, options);
        } catch {}
      }
      try {
        const locale = localization && typeof localization.getLocale === 'function'
          ? localization.getLocale()
          : undefined;
        return new Intl.NumberFormat(locale || undefined, options).format(value);
      } catch {
        return String(value ?? '');
      }
    };

    let detachLocale = null;

    const RESOURCE_TYPES = ['food', 'wood', 'gold', 'stone'];
    const RESOURCE_DEFAULT_LABELS = { food: '食料', wood: '木材', gold: '金', stone: '石' };
    const resourceSpans = new Map();
    const resourceLabelElements = new Map();
    RESOURCE_TYPES.forEach((type) => {
      const span = document.createElement('div');
      span.style.display = 'flex';
      span.style.alignItems = 'center';
      span.style.gap = '4px';
      const label = document.createElement('span');
      label.style.color = '#94a3b8';
      label.style.fontSize = '12px';
      const value = document.createElement('span');
      value.textContent = '0';
      value.style.color = '#e2e8f0';
      value.style.fontFeatureSettings = '\"tnum\" 1';
      span.appendChild(label);
      span.appendChild(value);
      resourcePanel.appendChild(span);
      resourceSpans.set(type, value);
      resourceLabelElements.set(type, label);
    });

    const popSpan = document.createElement('div');
    popSpan.style.display = 'flex';
    popSpan.style.alignItems = 'center';
    popSpan.style.gap = '4px';
    const popLabel = document.createElement('span');
    popLabel.style.color = '#94a3b8';
    popLabel.style.fontSize = '12px';
    const popValue = document.createElement('span');
    popValue.style.color = '#e2e8f0';
    popValue.textContent = '0/0';
    popSpan.appendChild(popLabel);
    popSpan.appendChild(popValue);
    resourcePanel.appendChild(popSpan);

    const timerHeading = document.createElement('div');
    timerHeading.style.color = '#94a3b8';
    timerHeading.style.fontWeight = '600';
    timerPanel.appendChild(timerHeading);

    const timerValue = document.createElement('div');
    timerValue.style.fontSize = '20px';
    timerValue.style.fontWeight = '700';
    timerValue.style.color = '#facc15';
    timerPanel.appendChild(timerValue);

    const statusRow = document.createElement('div');
    statusRow.style.marginTop = '4px';
    statusRow.style.fontSize = '12px';
    statusRow.style.color = '#94a3b8';
    timerPanel.appendChild(statusRow);

    const intelHeading = document.createElement('div');
    intelHeading.style.fontWeight = '700';
    intelHeading.style.color = '#38bdf8';
    intelPanel.appendChild(intelHeading);

    const intelBody = document.createElement('div');
    intelBody.style.lineHeight = '1.6';
    intelBody.style.whiteSpace = 'pre-line';
    intelPanel.appendChild(intelBody);

    const selectionHeading = document.createElement('div');
    selectionHeading.style.fontWeight = '700';
    selectionHeading.style.color = '#38bdf8';
    selectionPanel.appendChild(selectionHeading);

    const selectionBody = document.createElement('div');
    selectionBody.style.whiteSpace = 'pre-line';
    selectionBody.style.lineHeight = '1.5';
    selectionPanel.appendChild(selectionBody);

    function createActionButton(label, description, handler){
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.style.background = 'linear-gradient(135deg, #1d4ed8, #38bdf8)';
      btn.style.color = '#f8fafc';
      btn.style.border = 'none';
      btn.style.borderRadius = '10px';
      btn.style.padding = '10px';
      btn.style.fontWeight = '600';
      btn.style.fontSize = '12px';
      btn.style.cursor = 'pointer';
      btn.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.35)';
      btn.style.textAlign = 'left';
      btn.innerHTML = `<div>${label}</div><div style="font-size:11px;font-weight:500;opacity:0.82;margin-top:4px;">${description}</div>`;
      btn.addEventListener('click', handler);
      btn.addEventListener('mouseenter', () => {
        btn.style.boxShadow = '0 12px 26px rgba(56, 189, 248, 0.45)';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.35)';
      });
      return btn;
    }

    const placementOverlay = document.createElement('div');
    placementOverlay.style.position = 'absolute';
    placementOverlay.style.left = '0';
    placementOverlay.style.top = '0';
    placementOverlay.style.right = '0';
    placementOverlay.style.bottom = '0';
    placementOverlay.style.pointerEvents = 'none';
    placementOverlay.style.borderRadius = 'inherit';
    placementOverlay.style.display = 'none';
    container.appendChild(placementOverlay);

    let idCounter = 1;
    function nextId(prefix){
      return `${prefix}${idCounter++}`;
    }

    const state = {
      resources: { ...difficultyCfg.startingResources },
      pop: { used: 3, cap: 10 },
      age: 1,
      time: 0,
      wave: 0,
      nextWaveTime: difficultyCfg.waveInterval,
      waveActive: false,
      xpBuffer: 0,
      selection: { units: new Set(), structures: new Set() },
      lastEventTime: 0,
      placementMode: null,
      gameOver: null,
      enemyCommanderSpawned: false,
      gatherXpBucket: 0
    };

    const units = [];
    const structures = [];
    const projectiles = [];
    const resourceNodes = [];
    const enemyStructures = [];

    const PLAYER = 'player';
    const ENEMY = 'enemy';

    const unitConfigs = {
      villager: {
        name: '村人',
        nameKey: 'units.villager',
        radius: 12,
        maxHp: 40,
        speed: 46,
        attackDamage: 3,
        attackRange: 22,
        attackCooldown: 1.6,
        gatherRates: { food: 10, wood: 9, gold: 8, stone: 7 },
        buildRate: 0.15
      },
      militia: {
        name: '民兵',
        nameKey: 'units.militia',
        radius: 13,
        maxHp: 60,
        speed: 56,
        attackDamage: 10,
        attackRange: 24,
        attackCooldown: 1.1
      },
      archer: {
        name: '弓兵',
        nameKey: 'units.archer',
        radius: 13,
        maxHp: 45,
        speed: 52,
        attackDamage: 8,
        attackRange: 130,
        attackCooldown: 1.35,
        projectileSpeed: 220
      },
      raider: {
        name: '略奪兵',
        nameKey: 'units.raider',
        radius: 13,
        maxHp: 55,
        speed: 58,
        attackDamage: 8,
        attackRange: 24,
        attackCooldown: 1.2
      },
      horseArcher: {
        name: '騎馬弓兵',
        nameKey: 'units.horseArcher',
        radius: 16,
        maxHp: 70,
        speed: 72,
        attackDamage: 10,
        attackRange: 140,
        attackCooldown: 1.6,
        projectileSpeed: 260
      },
      commander: {
        name: '敵将軍',
        nameKey: 'units.commander',
        radius: 18,
        maxHp: 280,
        speed: 62,
        attackDamage: 18,
        attackRange: 40,
        attackCooldown: 1.1
      },
      ram: {
        name: '破城槌',
        nameKey: 'units.ram',
        radius: 20,
        maxHp: 220,
        speed: 34,
        attackDamage: 45,
        attackRange: 26,
        attackCooldown: 2.5
      }
    };

    const structureConfigs = {
      townCenter: {
        name: 'タウンセンター',
        nameKey: 'structures.townCenter',
        radius: 42,
        maxHp: 1600,
        buildTime: 0,
        popCap: 10,
        trainable: [{ type: 'villager', label: '村人', labelKey: 'units.villager', cost: { food: 50 }, time: 22 }]
      },
      house: {
        name: '家',
        nameKey: 'structures.house',
        radius: 20,
        maxHp: 600,
        buildTime: 22,
        popCap: 5
      },
      barracks: {
        name: '兵舎',
        nameKey: 'structures.barracks',
        radius: 32,
        maxHp: 1200,
        buildTime: 35,
        trainable: [{ type: 'militia', label: '民兵', labelKey: 'units.militia', cost: { food: 60, gold: 20 }, time: 25 }]
      },
      archery: {
        name: '弓兵小屋',
        nameKey: 'structures.archery',
        radius: 32,
        maxHp: 1100,
        buildTime: 38,
        trainable: [{ type: 'archer', label: '弓兵', labelKey: 'units.archer', cost: { wood: 50, gold: 40 }, time: 26 }]
      },
      tower: {
        name: '見張り塔',
        nameKey: 'structures.tower',
        radius: 24,
        maxHp: 900,
        buildTime: 36,
        attackDamage: 12,
        attackRange: 200,
        attackCooldown: 2.4
      }
    };

    function getResourceLabel(type){
      const fallback = RESOURCE_DEFAULT_LABELS[type] || type;
      return text(`resources.${type}`, fallback);
    }

    function getUnitName(type){
      const cfg = unitConfigs[type] || {};
      const fallback = cfg.name || type;
      const key = cfg.nameKey || `units.${type}`;
      return text(key, fallback);
    }

    function getStructureName(type){
      const cfg = structureConfigs[type] || {};
      const fallback = cfg.name || type;
      const key = cfg.nameKey || `structures.${type}`;
      return text(key, fallback);
    }

    const TRAINING_COST_XP = 4;
    const BUILDING_EXP = 12;
    const GATHER_XP_UNIT = 100;
    const WAVE_EXP = [120, 180, 260, 320];

    function addLog(message){
      const entry = document.createElement('div');
      entry.textContent = `[${formatTime(state.time)}] ${message}`;
      entry.style.fontSize = '12px';
      entry.style.color = '#e2e8f0';
      logView.appendChild(entry);
      logView.scrollTop = logView.scrollHeight;
      state.lastEventTime = state.time;
    }

    function formatTime(ms){
      const total = Math.floor(ms / 1000);
      const m = Math.floor(total / 60);
      const s = total % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
    }

    function createStructure(type, x, y, owner, opts = {}){
      const cfg = structureConfigs[type];
      if (!cfg) return null;
      const structure = {
        id: nextId('b'),
        type,
        owner,
        x,
        y,
        radius: cfg.radius,
        maxHp: cfg.maxHp,
        hp: cfg.maxHp,
        completed: cfg.buildTime <= 0,
        buildTime: cfg.buildTime,
        buildProgress: cfg.buildTime <= 0 ? 1 : 0,
        queue: [],
        queueProgress: 0,
        popProvided: cfg.popCap || 0,
        attackCooldown: cfg.attackCooldown || 0,
        attackTimer: 0
      };
      if (typeof opts.partial === 'number') {
        const progress = Math.max(0, Math.min(1, opts.partial));
        structure.buildProgress = progress;
        if (progress >= 1) {
          structure.completed = true;
          structure.hp = structure.maxHp;
        } else {
          structure.completed = false;
          structure.hp = Math.max(1, structure.maxHp * Math.max(0.25, progress));
        }
      }
      structures.push(structure);
      if (owner === PLAYER) {
        state.pop.cap += structure.completed ? (structure.popProvided || 0) : 0;
      }
      return structure;
    }

    function createUnit(type, x, y, owner){
      const cfg = unitConfigs[type];
      if (!cfg) return null;
      const unit = {
        id: nextId('u'),
        type,
        owner,
        x,
        y,
        radius: cfg.radius,
        maxHp: Math.round(cfg.maxHp * (owner === ENEMY ? difficultyCfg.enemyHpMultiplier : 1)),
        hp: Math.round(cfg.maxHp * (owner === ENEMY ? difficultyCfg.enemyHpMultiplier : 1)),
        speed: cfg.speed,
        attackDamage: cfg.attackDamage || 0,
        attackRange: cfg.attackRange || 0,
        attackCooldown: cfg.attackCooldown || 1,
        attackTimer: 0,
        gatherRates: cfg.gatherRates || null,
        buildRate: cfg.buildRate || 0,
        projectileSpeed: cfg.projectileSpeed || 0,
        action: { type: 'idle' },
        targetId: null,
        gatherTimer: 0,
        xpValue: owner === ENEMY ? (type === 'commander' ? 60 : type === 'ram' ? 30 : 12) : 0
      };
      units.push(unit);
      if (owner === PLAYER) {
        state.pop.used += 1;
      }
      return unit;
    }

    function createResource(type, x, y, amount){
      const node = {
        id: nextId('r'),
        type,
        x,
        y,
        radius: type === 'wood' ? 26 : type === 'gold' ? 24 : type === 'stone' ? 24 : 22,
        amount
      };
      resourceNodes.push(node);
      return node;
    }

    function setupInitialState(){
      createStructure('townCenter', size.width * 0.25, size.height * 0.55, PLAYER);
      createStructure('house', size.width * 0.32, size.height * 0.45, PLAYER, { partial: 1 });
      createStructure('house', size.width * 0.18, size.height * 0.50, PLAYER, { partial: 1 });
      createUnit('villager', size.width * 0.25, size.height * 0.49, PLAYER);
      createUnit('villager', size.width * 0.27, size.height * 0.58, PLAYER);
      createUnit('villager', size.width * 0.20, size.height * 0.60, PLAYER);

      createResource('food', size.width * 0.20, size.height * 0.25, 360);
      createResource('food', size.width * 0.32, size.height * 0.30, 280);
      createResource('wood', size.width * 0.52, size.height * 0.28, 420);
      createResource('wood', size.width * 0.58, size.height * 0.36, 420);
      createResource('wood', size.width * 0.45, size.height * 0.22, 420);
      createResource('gold', size.width * 0.58, size.height * 0.70, 360);
      createResource('stone', size.width * 0.46, size.height * 0.74, 260);

      const enemyTc = createStructure('townCenter', size.width * 0.78, size.height * 0.50, ENEMY);
      enemyTc.hp = enemyTc.maxHp = 2200;
      enemyStructures.push(enemyTc);
      createStructure('house', size.width * 0.74, size.height * 0.60, ENEMY, { partial: 1 });
      createStructure('barracks', size.width * 0.80, size.height * 0.40, ENEMY, { partial: 1 });

      addLog(text('logs.missionStart', '作戦開始。タウンセンターと村人3名が配置されています。'));
    }

    setupInitialState();

    function formatCost(cost){
      return RESOURCE_TYPES
        .filter((type) => cost[type])
        .map((type) => {
          const label = getResourceLabel(type);
          const amount = formatNumberLocalized(cost[type], { maximumFractionDigits: 0 });
          return text('resources.costEntry', () => `${label}${amount}`, { resource: label, amount });
        })
        .join(text('resources.costSeparator', ' / '));
    }

    function hasResources(cost){
      return RESOURCE_TYPES.every((type) => !cost[type] || state.resources[type] >= cost[type]);
    }

    function spendResources(cost){
      RESOURCE_TYPES.forEach((type) => {
        if (cost[type]) {
          state.resources[type] -= cost[type];
        }
      });
    }

    function refundResources(cost){
      RESOURCE_TYPES.forEach((type) => {
        if (cost[type]) {
          state.resources[type] += cost[type];
        }
      });
    }

    function awardBufferedXp(value){
      const xp = Math.round(value * difficultyCfg.bonusXp);
      if (xp > 0) {
        awardXp(xp);
      }
    }

    function updateResourcesDisplay(){
      RESOURCE_TYPES.forEach((type) => {
        const el = resourceSpans.get(type);
        if (el) {
          const value = Math.floor(state.resources[type]);
          el.textContent = formatNumberLocalized(value, { maximumFractionDigits: 0 });
        }
      });
      if (popValue) {
        const used = formatNumberLocalized(state.pop.used, { maximumFractionDigits: 0 });
        const cap = formatNumberLocalized(state.pop.cap, { maximumFractionDigits: 0 });
        popValue.textContent = `${used}/${cap}`;
      }
    }

    function updateWaveInfo(){
      const remaining = state.wave >= difficultyCfg.waveCount ? 0 : Math.max(0, state.nextWaveTime - state.time);
      if (state.wave >= difficultyCfg.waveCount && !state.waveActive) {
        timerValue.textContent = state.enemyCommanderSpawned
          ? text('hud.commanderGoal', '司令官討伐')
          : text('hud.finalStand', '終局戦');
      } else {
        const seconds = Math.floor(remaining / 1000);
        timerValue.textContent = text('hud.countdown', () => `${seconds}秒`, { seconds });
      }
      statusRow.textContent = state.waveActive
        ? text('hud.defending', '防衛中！')
        : text('hud.waveStatus', () => `ウェーブ ${state.wave + 1} / ${difficultyCfg.waveCount}`, {
            current: state.wave + 1,
            total: difficultyCfg.waveCount
          });
      const enemyTc = enemyStructures[0];
      const hp = Math.max(0, Math.round(enemyTc?.hp || 0));
      const maxHp = Math.round(enemyTc?.maxHp || 0);
      waveInfo.textContent = text('hud.waveInfo', () => `現在の波: ${state.wave}/${difficultyCfg.waveCount}\n敵TC耐久: ${hp} / ${maxHp}`, {
        wave: state.wave,
        total: difficultyCfg.waveCount,
        hp,
        max: maxHp
      });
    }

    function updateIntel(){
      const villagerCount = units.filter((u) => u.owner === PLAYER && u.type === 'villager').length;
      const armyCount = units.filter((u) => u.owner === PLAYER && u.type !== 'villager').length;
      const structureCount = structures.filter((s) => s.owner === PLAYER && s.completed).length;
      intelBody.textContent = text('intel.summary', () => `村人: ${villagerCount}\n軍事: ${armyCount}\n建物: ${structureCount}`, {
        villagers: villagerCount,
        army: armyCount,
        structures: structureCount
      });
    }

    function clearSelection(){
      state.selection.units.clear();
      state.selection.structures.clear();
    }

    function describeSelection(){
      if (state.selection.units.size === 0 && state.selection.structures.size === 0) {
        selectionBody.textContent = text('selection.empty', '何も選択されていません。');
        return;
      }
      const unitList = [];
      state.selection.units.forEach((id) => {
        const unit = units.find((u) => u.id === id);
        if (unit) {
          const name = getUnitName(unit.type);
          const current = Math.round(unit.hp);
          const max = Math.round(unit.maxHp);
          unitList.push(text('selection.unitEntry', () => `${name} HP ${current}/${max}`, {
            name,
            current,
            max
          }));
        }
      });
      const structureList = [];
      state.selection.structures.forEach((id) => {
        const structure = structures.find((s) => s.id === id);
        if (structure) {
          const name = getStructureName(structure.type);
          const current = Math.round(structure.hp);
          const max = Math.round(structure.maxHp);
          const status = structure.completed ? '' : text('selection.underConstruction', '（建設中）');
          structureList.push(text('selection.structureEntry', () => `${name} HP ${current}/${max}${status}`, {
            name,
            current,
            max,
            status
          }));
        }
      });
      const separator = unitList.length && structureList.length ? text('selection.separator', '---') : '';
      selectionBody.textContent = `${unitList.join('\n')}${separator ? `\n${separator}\n` : ''}${structureList.join('\n')}`.trim();
    }

    function rebuildActionButtons(){
      actionButtonPanel.innerHTML = '';
      const selectedUnits = Array.from(state.selection.units).map((id) => units.find((u) => u.id === id)).filter(Boolean);
      const selectedStructures = Array.from(state.selection.structures).map((id) => structures.find((s) => s.id === id)).filter(Boolean);

      if (selectedUnits.length === 1 && selectedUnits[0].type === 'villager') {
        const villager = selectedUnits[0];
        const buildActions = [
          {
            type: 'house',
            cost: { wood: 50 },
            label: text('actions.build.house.label', '建設: 家'),
            description: text('actions.build.house.description', '+5人口、建設時間短')
          },
          {
            type: 'barracks',
            cost: { wood: 175 },
            label: text('actions.build.barracks.label', '建設: 兵舎'),
            description: text('actions.build.barracks.description', '民兵の訓練')
          },
          {
            type: 'archery',
            cost: { wood: 200, gold: 50 },
            label: text('actions.build.archery.label', '建設: 弓兵小屋'),
            description: text('actions.build.archery.description', '弓兵の訓練')
          },
          {
            type: 'tower',
            cost: { wood: 125, stone: 125 },
            label: text('actions.build.tower.label', '建設: 見張り塔'),
            description: text('actions.build.tower.description', '自動射撃タワー')
          }
        ];
        buildActions.forEach((action) => {
          const costText = formatCost(action.cost);
          const description = `${action.description}\n${costText}`;
          actionButtonPanel.appendChild(createActionButton(action.label, description, () => {
            if (!hasResources(action.cost)) {
              addLog(text('logs.insufficientResources', '資源が不足しています。'));
              return;
            }
            state.placementMode = {
              type: action.type,
              cost: action.cost,
              villagerIds: [villager.id],
              radius: structureConfigs[action.type].radius
            };
            placementOverlay.style.display = 'block';
            addLog(text('logs.placementPrompt', () => `${action.label} の建設位置を指定してください。`, {
              label: action.label
            }));
          }));
        });
      }

      selectedStructures.forEach((structure) => {
        const cfg = structureConfigs[structure.type];
        if (cfg && cfg.trainable && structure.completed) {
          cfg.trainable.forEach((trainCfg) => {
            const unitName = getUnitName(trainCfg.type) || trainCfg.label || trainCfg.type;
            const buttonLabel = text('actions.train.button', () => `訓練: ${unitName}`, { unit: unitName });
            const costText = formatCost(trainCfg.cost);
            const detailText = text('actions.train.details', () => `${costText} / ${Math.round(trainCfg.time)}秒`, {
              cost: costText,
              time: trainCfg.time
            });
            actionButtonPanel.appendChild(createActionButton(buttonLabel, detailText, () => {
              if (!hasResources(trainCfg.cost)) {
                addLog(text('logs.insufficientResources', '資源が不足しています。'));
                return;
              }
              if (state.pop.used >= state.pop.cap) {
                addLog(text('logs.populationCap', '人口上限です。家を建てましょう。'));
                return;
              }
              spendResources(trainCfg.cost);
              structure.queue.push({ ...trainCfg });
              if (structure.queue.length === 1) {
                structure.queueProgress = 0;
              }
              addLog(text('logs.trainingStarted', () => `${unitName} の訓練を開始しました。`, {
                unit: unitName
              }));
              awardBufferedXp(TRAINING_COST_XP);
              updateResourcesDisplay();
            }));
          });
        }
      });
    }

    function selectionFromPoint(x, y){
      const point = { x, y };
      clearSelection();
      for (let i = units.length - 1; i >= 0; i--) {
        const unit = units[i];
        if (unit.owner !== PLAYER) continue;
        if (distance(unit, point) <= unit.radius + 4) {
          state.selection.units.add(unit.id);
          describeSelection();
          rebuildActionButtons();
          return;
        }
      }
      for (let i = structures.length - 1; i >= 0; i--) {
        const structure = structures[i];
        if (structure.owner !== PLAYER) continue;
        if (distance(structure, point) <= structure.radius + 6) {
          state.selection.structures.add(structure.id);
          describeSelection();
          rebuildActionButtons();
          return;
        }
      }
      describeSelection();
      rebuildActionButtons();
    }

    function selectionFromRect(rect){
      clearSelection();
      units.forEach((unit) => {
        if (unit.owner !== PLAYER) return;
        if (unit.x >= rect.x && unit.x <= rect.x + rect.width && unit.y >= rect.y && unit.y <= rect.y + rect.height) {
          state.selection.units.add(unit.id);
        }
      });
      if (state.selection.units.size === 0) {
        structures.forEach((structure) => {
          if (structure.owner !== PLAYER) return;
          if (structure.x >= rect.x && structure.x <= rect.x + rect.width && structure.y >= rect.y && structure.y <= rect.y + rect.height) {
            state.selection.structures.add(structure.id);
          }
        });
      }
      describeSelection();
      rebuildActionButtons();
    }

    function issueMoveCommand(target){
      const selected = Array.from(state.selection.units).map((id) => units.find((u) => u.id === id)).filter(Boolean);
      selected.forEach((unit, index) => {
        unit.action = {
          type: 'move',
          x: target.x + (index % 3) * 14 - 14,
          y: target.y + Math.floor(index / 3) * 14 - 14
        };
      });
    }

    function assignVillagersToBuild(structure){
      state.selection.units.forEach((id) => {
        const villager = units.find((u) => u.id === id && u.type === 'villager');
        if (villager) {
          villager.action = { type: 'build', targetId: structure.id };
        }
      });
    }

    function issueGatherCommand(resource){
      state.selection.units.forEach((id) => {
        const villager = units.find((u) => u.id === id);
        if (!villager || villager.owner !== PLAYER || !villager.gatherRates) return;
        villager.action = { type: 'gather', resourceId: resource.id };
        const resourceLabel = getResourceLabel(resource.type);
        addLog(text('logs.gatherOrder', () => `村人に${resourceLabel}採集を指示しました。`, {
          resource: resourceLabel
        }));
      });
    }

    function issueAttackCommand(target){
      const selected = Array.from(state.selection.units).map((id) => units.find((u) => u.id === id)).filter(Boolean);
      selected.forEach((unit) => {
        unit.action = { type: 'attack', targetId: target.id };
      });
      addLog(text('logs.attackOrder', '攻撃命令を実行。'));
    }

    function cancelPlacement(){
      if (state.placementMode) {
        state.placementMode = null;
        placementOverlay.style.display = 'none';
      }
    }

    let dragStart = null;
    let dragRect = null;

    mainCanvas.addEventListener('mousedown', (event) => {
      const rect = mainCanvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (event.button === 0) {
        if (state.placementMode) {
          if (!hasResources(state.placementMode.cost)) {
            addLog(text('logs.insufficientResources', '資源が不足しています。'));
            cancelPlacement();
            return;
          }
          const structure = createStructure(state.placementMode.type, x, y, PLAYER, { partial: 0.4 });
          spendResources(state.placementMode.cost);
          const structureName = getStructureName(state.placementMode.type);
          addLog(text('logs.buildingStarted', () => `${structureName} を建設開始しました。`, {
            structure: structureName
          }));
          assignVillagersToBuild(structure);
          cancelPlacement();
          updateResourcesDisplay();
          rebuildActionButtons();
          return;
        }
        dragStart = { x, y };
        dragRect = null;
      }
    });

    mainCanvas.addEventListener('mousemove', (event) => {
      const rect = mainCanvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (state.placementMode) {
        const radius = state.placementMode.radius || 20;
        const ctxOverlay = placementOverlay.getContext?.('2d');
        if (ctxOverlay) {
          ctxOverlay.clearRect(0, 0, placementOverlay.width, placementOverlay.height);
        }
      }
      if (dragStart) {
        dragRect = {
          x: Math.min(dragStart.x, x),
          y: Math.min(dragStart.y, y),
          width: Math.abs(dragStart.x - x),
          height: Math.abs(dragStart.y - y)
        };
      }
    });

    mainCanvas.addEventListener('mouseup', (event) => {
      const rect = mainCanvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (event.button === 0) {
        if (dragRect && dragRect.width > 6 && dragRect.height > 6) {
          selectionFromRect(dragRect);
        } else {
          selectionFromPoint(x, y);
        }
        dragStart = null;
        dragRect = null;
      }
    });

    mainCanvas.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      const rect = mainCanvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const targetUnit = units.find((u) => distance(u, { x, y }) <= u.radius + 6 && u.owner !== PLAYER);
      if (targetUnit) {
        issueAttackCommand(targetUnit);
        return;
      }
      const targetStructure = structures.find((s) => distance(s, { x, y }) <= s.radius + 8 && s.owner === ENEMY);
      if (targetStructure) {
        issueAttackCommand(targetStructure);
        return;
      }
      const targetResource = resourceNodes.find((r) => distance(r, { x, y }) <= r.radius + 8);
      if (targetResource) {
        issueGatherCommand(targetResource);
        return;
      }
      issueMoveCommand({ x, y });
    });

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        cancelPlacement();
      }
    });

    function updateSelectionPanels(){
      describeSelection();
      rebuildActionButtons();
    }

    function applyLocalization(){
      logTitle.textContent = text('ui.logTitle', '作戦ログ');
      waveTitle.textContent = text('ui.waveTitle', 'ウェーブ情報');
      intelHeading.textContent = text('ui.intelTitle', '戦況インテリジェンス');
      selectionHeading.textContent = text('ui.selectionTitle', '選択情報');
      timerHeading.textContent = text('hud.nextWave', '次のウェーブ');
      timerValue.textContent = text('hud.ready', '準備完了');
      if (popLabel) {
        popLabel.textContent = text('ui.populationLabel', '人口');
      }
      RESOURCE_TYPES.forEach((type) => {
        const labelEl = resourceLabelElements.get(type);
        if (labelEl) {
          labelEl.textContent = getResourceLabel(type);
        }
      });
      updateResourcesDisplay();
      updateWaveInfo();
      updateIntel();
      describeSelection();
      rebuildActionButtons();
    }

    function distance(a, b){
      const dx = (a.x || 0) - (b.x || 0);
      const dy = (a.y || 0) - (b.y || 0);
      return Math.hypot(dx, dy);
    }

    function normalize(dx, dy){
      const len = Math.hypot(dx, dy) || 1;
      return { x: dx / len, y: dy / len };
    }

    function updateTraining(structure, dt){
      if (!structure.queue.length) return;
      structure.queueProgress += dt;
      const current = structure.queue[0];
      if (structure.queueProgress >= current.time) {
        const spawn = createUnit(current.type, structure.x + (Math.random() - 0.5) * 40, structure.y + (Math.random() - 0.5) * 40, structure.owner);
        if (spawn.owner === PLAYER) {
          const unitName = getUnitName(spawn.type) || current.label || spawn.type;
          addLog(text('logs.unitComplete', () => `${unitName} が完成しました。`, {
            unit: unitName
          }));
        }
        structure.queue.shift();
        structure.queueProgress = 0;
      }
    }

    function updateBuildingProgress(dt){
      structures.forEach((structure) => {
        if (structure.completed) return;
        const builders = units.filter((u) => u.owner === PLAYER && u.action.type === 'build' && u.action.targetId === structure.id && distance(u, structure) <= u.radius + structure.radius + 2);
        if (builders.length === 0) return;
        const totalRate = builders.reduce((acc, unit) => acc + (unit.buildRate || 0.05), 0);
        structure.buildProgress += totalRate * dt;
        structure.hp = Math.min(structure.maxHp, structure.maxHp * structure.buildProgress);
        if (structure.buildProgress >= 1) {
          structure.completed = true;
          structure.hp = structure.maxHp;
          if (structure.owner === PLAYER) {
            state.pop.cap += structure.popProvided || 0;
            awardBufferedXp(BUILDING_EXP);
            const structureName = getStructureName(structure.type);
            addLog(text('logs.structureComplete', () => `${structureName} が完成しました。`, {
              structure: structureName
            }));
            updateResourcesDisplay();
            updateIntel();
          }
        }
      });
    }

    function removeStructure(structure){
      const index = structures.indexOf(structure);
      if (index >= 0) structures.splice(index, 1);
      const enemyIndex = enemyStructures.indexOf(structure);
      if (enemyIndex >= 0) enemyStructures.splice(enemyIndex, 1);
      if (structure.owner === PLAYER) {
        state.pop.cap -= structure.popProvided || 0;
        if (structure.type === 'townCenter') {
          triggerGameOver(false, text('gameOver.message.ownTownCenterDestroyed', 'タウンセンターが破壊された。'));
        }
      } else {
        if (structure.type === 'townCenter') {
          triggerGameOver(true, text('gameOver.message.enemyTownCenterDestroyed', '敵のタウンセンターを破壊した。'));
        }
      }
    }

    function removeUnit(unit){
      const index = units.indexOf(unit);
      if (index >= 0) units.splice(index, 1);
      if (unit.owner === PLAYER) {
        state.pop.used = Math.max(0, state.pop.used - 1);
        if (unit.type === 'villager') {
          const villagersLeft = units.some((u) => u.owner === PLAYER && u.type === 'villager');
          if (!villagersLeft) {
            triggerGameOver(false, text('gameOver.message.allVillagersLost', '村人が全滅した。'));
          }
        }
      } else {
        awardBufferedXp(unit.xpValue);
      }
    }

    function triggerGameOver(victory, message){
      if (state.gameOver) return;
      state.gameOver = { victory, message };
      const resultLog = victory ? text('logs.victory', '勝利！') : text('logs.defeat', '敗北…');
      addLog(resultLog);
      if (message) addLog(message);
      const overlay = document.createElement('div');
      overlay.style.position = 'absolute';
      overlay.style.left = '0';
      overlay.style.top = '0';
      overlay.style.right = '0';
      overlay.style.bottom = '0';
      overlay.style.display = 'flex';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.background = 'rgba(2, 6, 23, 0.78)';
      overlay.style.color = victory ? '#bef264' : '#f87171';
      overlay.style.fontSize = '32px';
      overlay.style.fontWeight = '700';
      overlay.style.textShadow = '0 10px 30px rgba(2,6,23,0.9)';
      overlay.textContent = victory ? text('gameOver.overlay.victory', '勝利') : text('gameOver.overlay.defeat', '敗北');
      container.appendChild(overlay);
    }

    function findNearestEnemy(entity, range){
      let best = null;
      let bestDist = range;
      units.forEach((unit) => {
        if (unit.owner === entity.owner) return;
        const dist = distance(entity, unit);
        if (dist < bestDist) {
          bestDist = dist;
          best = unit;
        }
      });
      structures.forEach((structure) => {
        if (structure.owner === entity.owner) return;
        const dist = distance(entity, structure);
        if (dist < bestDist) {
          bestDist = dist;
          best = structure;
        }
      });
      return best;
    }

    function updateCombat(dt){
      units.forEach((unit) => {
        unit.attackTimer = Math.max(0, unit.attackTimer - dt);
        if (unit.action.type === 'attack') {
          const target = units.find((u) => u.id === unit.action.targetId) || structures.find((s) => s.id === unit.action.targetId);
          if (!target) {
            unit.action = { type: 'idle' };
            return;
          }
          const dist = distance(unit, target);
          if (dist > unit.attackRange * 1.2) {
            unit.action = { type: 'move', x: target.x, y: target.y, next: { type: 'attack', targetId: target.id } };
            return;
          }
          if (dist > unit.attackRange) {
            const dir = normalize(target.x - unit.x, target.y - unit.y);
            unit.x += dir.x * unit.speed * dt;
            unit.y += dir.y * unit.speed * dt;
          } else if (unit.attackTimer <= 0) {
            performAttack(unit, target);
            unit.attackTimer = unit.attackCooldown;
          }
        }
      });

      structures.forEach((structure) => {
        if (structure.owner === PLAYER && structure.type === 'tower' && structure.completed) {
          structure.attackTimer = Math.max(0, (structure.attackTimer || 0) - dt);
          if (structure.attackTimer <= 0) {
            const target = findNearestEnemy(structure, structureConfigs.tower.attackRange);
            if (target) {
              createProjectile(structure, target, structureConfigs.tower.attackDamage, 240);
              structure.attackTimer = structureConfigs.tower.attackCooldown;
            }
          }
        }
      });
    }

    function createProjectile(source, target, damage, speed){
      projectiles.push({
        id: nextId('p'),
        x: source.x,
        y: source.y,
        targetId: target.id,
        damage,
        speed,
        owner: source.owner
      });
    }

    function performAttack(attacker, target){
      if (attacker.projectileSpeed) {
        createProjectile(attacker, target, attacker.attackDamage, attacker.projectileSpeed);
        return;
      }
      applyDamage(target, attacker.attackDamage, attacker);
    }

    function applyDamage(target, amount, source){
      if (!target) return;
      target.hp -= amount;
      if (target.hp <= 0) {
        if ('queue' in target) {
          removeStructure(target);
        } else {
          removeUnit(target);
        }
        if (source && source.owner === PLAYER) {
          addLog(text('logs.enemyDefeated', '敵を撃破しました。'));
        }
      }
    }

    function updateProjectiles(dt){
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        const target = units.find((u) => u.id === projectile.targetId) || structures.find((s) => s.id === projectile.targetId);
        if (!target) {
          projectiles.splice(i, 1);
          continue;
        }
        const dir = normalize(target.x - projectile.x, target.y - projectile.y);
        projectile.x += dir.x * projectile.speed * dt;
        projectile.y += dir.y * projectile.speed * dt;
        if (distance(projectile, target) <= (target.radius || 14)) {
          applyDamage(target, projectile.damage, { owner: projectile.owner });
          projectiles.splice(i, 1);
        }
      }
    }

    function updateMovement(dt){
      units.forEach((unit) => {
        if (unit.action.type === 'move') {
          const dx = unit.action.x - unit.x;
          const dy = unit.action.y - unit.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 4) {
            unit.x = unit.action.x;
            unit.y = unit.action.y;
            unit.action = unit.action.next || { type: 'idle' };
          } else {
            const dir = normalize(dx, dy);
            unit.x += dir.x * unit.speed * dt;
            unit.y += dir.y * unit.speed * dt;
          }
        }
      });
    }

    function updateGathering(dt){
      units.forEach((unit) => {
        if (unit.action.type === 'gather') {
          const resource = resourceNodes.find((r) => r.id === unit.action.resourceId);
          if (!resource) {
            unit.action = { type: 'idle' };
            return;
          }
          const dist = distance(unit, resource);
          if (dist > resource.radius + unit.radius + 4) {
            const dir = normalize(resource.x - unit.x, resource.y - unit.y);
            unit.x += dir.x * unit.speed * dt;
            unit.y += dir.y * unit.speed * dt;
            return;
          }
          unit.gatherTimer += dt;
          const rate = (unit.gatherRates && unit.gatherRates[resource.type]) || 6;
          const cycle = 4 / Math.max(1, rate / 6);
          if (unit.gatherTimer >= cycle) {
            unit.gatherTimer = 0;
            const amount = Math.min(rate, resource.amount);
            resource.amount -= amount;
            state.resources[resource.type] += amount;
            state.gatherXpBucket += amount;
            if (state.gatherXpBucket >= GATHER_XP_UNIT) {
              awardBufferedXp(5);
              state.gatherXpBucket -= GATHER_XP_UNIT;
            }
            if (resource.amount <= 0) {
              const resourceLabel = getResourceLabel(resource.type);
              addLog(text('logs.resourceDepleted', () => `${resourceLabel}の資源が枯渇しました。`, {
                resource: resourceLabel
              }));
              const index = resourceNodes.indexOf(resource);
              if (index >= 0) resourceNodes.splice(index, 1);
              unit.action = { type: 'idle' };
            }
            updateResourcesDisplay();
          }
        }
      });
    }

    function updateEnemyAI(dt){
      units.forEach((unit) => {
        if (unit.owner !== ENEMY) return;
        if (unit.action.type === 'idle' || unit.action.type === 'move') {
          const target = findNearestEnemy(unit, 9999);
          if (target) {
            unit.action = { type: 'attack', targetId: target.id };
          }
        }
      });
    }

    function spawnWave(){
      if (state.wave >= difficultyCfg.waveCount) {
        if (!state.enemyCommanderSpawned) {
          const commander = createUnit('commander', size.width * 0.78, size.height * 0.48, ENEMY);
          commander.xpValue = 120;
          addLog(text('logs.commanderArrived', '敵将軍が戦場に現れました！'));
          state.enemyCommanderSpawned = true;
        }
        return;
      }
      state.wave += 1;
      state.waveActive = true;
      addLog(text('logs.waveIncoming', () => `敵ウェーブ${state.wave}が接近中！`, {
        wave: state.wave
      }));
      const spawnX = size.width * 0.88;
      const spawnY = size.height * 0.50;
      const spawnConfigs = [
        () => {
          for (let i = 0; i < 6; i++) createUnit('raider', spawnX + Math.random() * 30, spawnY + (Math.random()-0.5)*80, ENEMY);
          for (let i = 0; i < 2; i++) createUnit('horseArcher', spawnX + Math.random() * 30, spawnY + (Math.random()-0.5)*80, ENEMY);
        },
        () => {
          for (let i = 0; i < 8; i++) createUnit('raider', spawnX + Math.random() * 40, spawnY + (Math.random()-0.5)*80, ENEMY);
          createUnit('ram', spawnX - 20, spawnY);
          for (let i = 0; i < 2; i++) createUnit('horseArcher', spawnX + Math.random() * 30, spawnY + (Math.random()-0.5)*80, ENEMY);
        },
        () => {
          for (let i = 0; i < 10; i++) createUnit('raider', spawnX + Math.random() * 40, spawnY + (Math.random()-0.5)*80, ENEMY);
          for (let i = 0; i < 3; i++) createUnit('horseArcher', spawnX + Math.random() * 40, spawnY + (Math.random()-0.5)*80, ENEMY);
          createUnit('ram', spawnX - 20, spawnY + 40);
          createUnit('ram', spawnX - 20, spawnY - 40);
        },
        () => {
          for (let i = 0; i < 12; i++) createUnit('raider', spawnX + Math.random() * 50, spawnY + (Math.random()-0.5)*120, ENEMY);
          for (let i = 0; i < 5; i++) createUnit('horseArcher', spawnX + Math.random() * 40, spawnY + (Math.random()-0.5)*120, ENEMY);
          createUnit('ram', spawnX - 20, spawnY + 40);
          createUnit('ram', spawnX - 20, spawnY - 40);
        }
      ];
      const spawnFn = spawnConfigs[Math.min(spawnConfigs.length - 1, state.wave - 1)];
      spawnFn();
      state.nextWaveTime = state.time + difficultyCfg.waveInterval;
      updateIntel();
    }

    function checkWaveClear(){
      if (state.waveActive) {
        const remaining = units.some((u) => u.owner === ENEMY);
        if (!remaining) {
          state.waveActive = false;
          const reward = WAVE_EXP[Math.min(WAVE_EXP.length - 1, state.wave - 1)] || 120;
          awardBufferedXp(reward);
          RESOURCE_TYPES.forEach((type) => {
            state.resources[type] += 40;
          });
          addLog(text('logs.waveCleared', () => `ウェーブ${state.wave}を撃退！補給物資を受領しました。`, {
            wave: state.wave
          }));
          updateResourcesDisplay();
        }
      }
    }

    function draw(){
      ctx.clearRect(0, 0, size.width, size.height);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, size.width, size.height);

      ctx.save();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
      for (let x = 0; x <= size.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, size.height);
        ctx.stroke();
      }
      for (let y = 0; y <= size.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(size.width, y);
        ctx.stroke();
      }
      ctx.restore();

      resourceNodes.forEach((resource) => {
        ctx.beginPath();
        ctx.fillStyle = resource.type === 'food' ? '#f87171' : resource.type === 'wood' ? '#22c55e' : resource.type === 'gold' ? '#facc15' : '#94a3b8';
        ctx.globalAlpha = 0.85;
        ctx.arc(resource.x, resource.y, resource.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#0f172a';
        ctx.font = '10px "Segoe UI"';
        ctx.textAlign = 'center';
        ctx.fillText(Math.max(0, Math.floor(resource.amount)).toString(), resource.x, resource.y + 4);
      });

      structures.forEach((structure) => {
        ctx.beginPath();
        ctx.fillStyle = structure.owner === PLAYER ? '#38bdf8' : '#f97316';
        ctx.globalAlpha = structure.completed ? 0.9 : 0.6;
        ctx.arc(structure.x, structure.y, structure.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 11px "Segoe UI"';
        ctx.textAlign = 'center';
        const structureLabel = getStructureName(structure.type);
        ctx.fillText(structureLabel, structure.x, structure.y + 4);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(structure.x - structure.radius, structure.y - structure.radius - 12, structure.radius * 2, 6);
        ctx.fillStyle = structure.owner === PLAYER ? '#38bdf8' : '#f97316';
        ctx.fillRect(structure.x - structure.radius, structure.y - structure.radius - 12, structure.radius * 2 * (structure.hp / structure.maxHp), 6);
      });

      units.forEach((unit) => {
        ctx.beginPath();
        ctx.fillStyle = unit.owner === PLAYER ? '#a5f3fc' : '#fb7185';
        ctx.globalAlpha = 0.95;
        ctx.arc(unit.x, unit.y, unit.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 10px "Segoe UI"';
        ctx.textAlign = 'center';
        const unitLabel = getUnitName(unit.type);
        ctx.fillText(unitLabel, unit.x, unit.y + 4);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(unit.x - unit.radius, unit.y - unit.radius - 10, unit.radius * 2, 4);
        ctx.fillStyle = unit.owner === PLAYER ? '#38bdf8' : '#fb7185';
        ctx.fillRect(unit.x - unit.radius, unit.y - unit.radius - 10, unit.radius * 2 * (unit.hp / unit.maxHp), 4);
        if (state.selection.units.has(unit.id)) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(unit.x, unit.y, unit.radius + 4, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      projectiles.forEach((projectile) => {
        ctx.beginPath();
        ctx.fillStyle = projectile.owner === PLAYER ? '#fef9c3' : '#fda4af';
        ctx.arc(projectile.x, projectile.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      if (dragRect) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(dragRect.x, dragRect.y, dragRect.width, dragRect.height);
        ctx.setLineDash([]);
      }

      drawMiniMap();
    }

    function drawMiniMap(){
      miniCtx.clearRect(0, 0, miniMapCanvas.width, miniMapCanvas.height);
      miniCtx.fillStyle = '#0f172a';
      miniCtx.fillRect(0, 0, miniMapCanvas.width, miniMapCanvas.height);
      const scaleX = miniMapCanvas.width / size.width;
      const scaleY = miniMapCanvas.height / size.height;

      resourceNodes.forEach((resource) => {
        miniCtx.fillStyle = resource.type === 'food' ? '#f87171' : resource.type === 'wood' ? '#22c55e' : resource.type === 'gold' ? '#facc15' : '#94a3b8';
        miniCtx.fillRect(resource.x * scaleX - 2, resource.y * scaleY - 2, 4, 4);
      });
      structures.forEach((structure) => {
        miniCtx.fillStyle = structure.owner === PLAYER ? '#38bdf8' : '#f97316';
        miniCtx.fillRect(structure.x * scaleX - 3, structure.y * scaleY - 3, 6, 6);
      });
      units.forEach((unit) => {
        miniCtx.fillStyle = unit.owner === PLAYER ? '#bae6fd' : '#fda4af';
        miniCtx.fillRect(unit.x * scaleX - 2, unit.y * scaleY - 2, 4, 4);
      });
    }

    function update(dt){
      if (state.gameOver) return;
      state.time += dt * 1000;
      if (!state.waveActive && state.time >= state.nextWaveTime) {
        spawnWave();
      }
      updateTrainingLoop(dt);
      updateBuildingProgress(dt);
      updateMovement(dt);
      updateGathering(dt);
      updateEnemyAI(dt);
      updateCombat(dt);
      updateProjectiles(dt);
      checkWaveClear();
      updateWaveInfo();
      updateResourcesDisplay();
      updateIntel();
    }

    function updateTrainingLoop(dt){
      structures.forEach((structure) => {
        if (structure.owner === PLAYER && structure.completed) {
          updateTraining(structure, dt);
        }
      });
    }

    let lastTime = performance.now();
    const step = 1 / 60;
    let accumulator = 0;

    function frame(now){
      const delta = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;
      accumulator += delta;
      while (accumulator >= step) {
        update(step);
        accumulator -= step;
      }
      draw();
      requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);

    applyLocalization();
    if (localization && typeof localization.onChange === 'function') {
      try {
        detachLocale = localization.onChange(() => {
          applyLocalization();
        });
      } catch {}
    }

    return {
      destroy(){
        if (container && container.parentNode) {
          container.parentNode.removeChild(container);
        }
        if (typeof detachLocale === 'function') {
          try { detachLocale(); } catch {}
        }
      }
    };
  }

  if (typeof window !== 'undefined' && window.registerMiniGame) {
    window.registerMiniGame({
      id: 'imperial_realm',
      name: 'インペリアル・レルム', nameKey: 'selection.miniexp.games.imperial_realm.name',
      description: '村人を指揮して町を築き、襲撃ウェーブから防衛しつつ敵本陣を破壊するAoE2風RTS', descriptionKey: 'selection.miniexp.games.imperial_realm.description', categoryIds: ['simulation'],
      create
    });
  }
})();

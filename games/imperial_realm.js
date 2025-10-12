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
    topPanel.style.flexWrap = 'wrap';
    topPanel.style.gap = '12px';
    container.appendChild(topPanel);

    const resourcePanel = document.createElement('div');
    resourcePanel.style.display = 'flex';
    resourcePanel.style.gap = '16px';
    resourcePanel.style.fontSize = '14px';
    resourcePanel.style.fontWeight = '600';
    topPanel.appendChild(resourcePanel);

    const agePanel = document.createElement('div');
    agePanel.style.display = 'flex';
    agePanel.style.flexDirection = 'column';
    agePanel.style.minWidth = '180px';
    agePanel.style.flex = '1 1 220px';
    agePanel.style.background = 'linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(59, 130, 246, 0.05))';
    agePanel.style.padding = '6px 12px 10px';
    agePanel.style.borderRadius = '10px';
    agePanel.style.boxShadow = 'inset 0 0 0 1px rgba(56, 189, 248, 0.18)';
    agePanel.style.transition = 'box-shadow 0.3s ease';

    const ageLabel = document.createElement('div');
    ageLabel.style.fontWeight = '700';
    ageLabel.style.fontSize = '13px';
    ageLabel.style.letterSpacing = '0.02em';
    ageLabel.style.color = '#bae6fd';
    agePanel.appendChild(ageLabel);

    const ageSummary = document.createElement('div');
    ageSummary.style.fontSize = '12px';
    ageSummary.style.marginTop = '2px';
    ageSummary.style.color = '#cbd5f5';
    ageSummary.style.opacity = '0.88';
    agePanel.appendChild(ageSummary);

    const ageProgress = document.createElement('div');
    ageProgress.style.marginTop = '6px';
    ageProgress.style.height = '6px';
    ageProgress.style.background = 'rgba(15, 23, 42, 0.7)';
    ageProgress.style.borderRadius = '999px';
    ageProgress.style.overflow = 'hidden';
    ageProgress.style.position = 'relative';
    agePanel.appendChild(ageProgress);

    const ageProgressFill = document.createElement('div');
    ageProgressFill.style.height = '100%';
    ageProgressFill.style.width = '100%';
    ageProgressFill.style.background = 'linear-gradient(135deg, #38bdf8, #0ea5e9)';
    ageProgressFill.style.transition = 'width 0.25s ease';
    ageProgressFill.style.borderRadius = 'inherit';
    ageProgress.appendChild(ageProgressFill);

    const ageStatus = document.createElement('div');
    ageStatus.style.fontSize = '11px';
    ageStatus.style.marginTop = '6px';
    ageStatus.style.color = '#a5b4fc';
    ageStatus.style.fontFeatureSettings = '"tnum" 1';
    agePanel.appendChild(ageStatus);

    const timerPanel = document.createElement('div');
    timerPanel.style.display = 'flex';
    timerPanel.style.flexDirection = 'column';
    timerPanel.style.alignItems = 'flex-end';
    timerPanel.style.fontSize = '13px';
    timerPanel.style.lineHeight = '1.4';

    const momentumPanel = document.createElement('div');
    momentumPanel.style.display = 'flex';
    momentumPanel.style.flexDirection = 'column';
    momentumPanel.style.alignItems = 'flex-end';
    momentumPanel.style.background = 'linear-gradient(135deg, rgba(250, 204, 21, 0.14), rgba(234, 179, 8, 0.06))';
    momentumPanel.style.padding = '6px 12px 10px';
    momentumPanel.style.borderRadius = '10px';
    momentumPanel.style.minWidth = '160px';
    momentumPanel.style.boxShadow = 'inset 0 0 0 1px rgba(250, 204, 21, 0.18)';

    const momentumHeading = document.createElement('div');
    momentumHeading.style.fontWeight = '700';
    momentumHeading.style.fontSize = '13px';
    momentumHeading.style.color = '#facc15';
    momentumPanel.appendChild(momentumHeading);

    const momentumValue = document.createElement('div');
    momentumValue.style.fontSize = '20px';
    momentumValue.style.fontWeight = '700';
    momentumValue.style.marginTop = '2px';
    momentumValue.style.color = '#fef3c7';
    momentumPanel.appendChild(momentumValue);

    const momentumDetail = document.createElement('div');
    momentumDetail.style.fontSize = '11px';
    momentumDetail.style.opacity = '0.85';
    momentumDetail.style.marginTop = '2px';
    momentumDetail.style.color = '#fde68a';
    momentumPanel.appendChild(momentumDetail);

    const momentumBar = document.createElement('div');
    momentumBar.style.marginTop = '6px';
    momentumBar.style.height = '6px';
    momentumBar.style.width = '100%';
    momentumBar.style.background = 'rgba(15, 23, 42, 0.7)';
    momentumBar.style.borderRadius = '999px';
    momentumBar.style.overflow = 'hidden';
    momentumPanel.appendChild(momentumBar);

    const momentumBarFill = document.createElement('div');
    momentumBarFill.style.height = '100%';
    momentumBarFill.style.width = '30%';
    momentumBarFill.style.background = 'linear-gradient(135deg, #facc15, #f97316)';
    momentumBarFill.style.transition = 'width 0.25s ease';
    momentumBarFill.style.borderRadius = 'inherit';
    momentumBar.appendChild(momentumBarFill);

    topPanel.appendChild(agePanel);
    topPanel.appendChild(momentumPanel);
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

    function createActionButton(label, description, handler, options = {}){
      const { disabled = false, onDisabledClick = null, variant = 'azure', badge = null } = options || {};
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.style.position = 'relative';
      const gradient = variant === 'gold'
        ? 'linear-gradient(135deg, #f59e0b, #facc15)'
        : variant === 'emerald'
          ? 'linear-gradient(135deg, #10b981, #34d399)'
          : 'linear-gradient(135deg, #1d4ed8, #38bdf8)';
      btn.style.background = gradient;
      btn.style.color = '#f8fafc';
      btn.style.border = 'none';
      btn.style.borderRadius = '10px';
      btn.style.padding = '10px';
      btn.style.fontWeight = '600';
      btn.style.fontSize = '12px';
      btn.style.cursor = 'pointer';
      btn.style.boxShadow = variant === 'gold'
        ? '0 10px 24px rgba(250, 204, 21, 0.35)'
        : variant === 'emerald'
          ? '0 8px 20px rgba(16, 185, 129, 0.35)'
          : '0 8px 20px rgba(59, 130, 246, 0.35)';
      btn.style.textAlign = 'left';
      btn.innerHTML = `<div>${label}</div><div style="font-size:11px;font-weight:500;opacity:0.82;margin-top:4px;">${description}</div>`;
      if (badge) {
        const badgeEl = document.createElement('span');
        badgeEl.textContent = badge;
        badgeEl.style.position = 'absolute';
        badgeEl.style.top = '8px';
        badgeEl.style.right = '10px';
        badgeEl.style.fontSize = '10px';
        badgeEl.style.padding = '2px 6px';
        badgeEl.style.borderRadius = '999px';
        badgeEl.style.background = 'rgba(15, 23, 42, 0.35)';
        badgeEl.style.color = '#f8fafc';
        badgeEl.style.fontWeight = '700';
        badgeEl.style.letterSpacing = '0.05em';
        btn.appendChild(badgeEl);
      }
      if (disabled) {
        btn.style.opacity = '0.55';
        btn.style.cursor = onDisabledClick ? 'help' : 'not-allowed';
        btn.style.filter = 'saturate(0.5)';
        if (onDisabledClick) {
          btn.addEventListener('click', (event) => {
            event.preventDefault();
            onDisabledClick();
          });
        }
      } else {
        btn.addEventListener('click', handler);
        btn.addEventListener('mouseenter', () => {
          btn.style.boxShadow = variant === 'gold'
            ? '0 14px 30px rgba(250, 204, 21, 0.42)'
            : variant === 'emerald'
              ? '0 12px 28px rgba(16, 185, 129, 0.45)'
              : '0 12px 26px rgba(56, 189, 248, 0.45)';
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.boxShadow = variant === 'gold'
            ? '0 10px 24px rgba(250, 204, 21, 0.35)'
            : variant === 'emerald'
              ? '0 8px 20px rgba(16, 185, 129, 0.35)'
              : '0 8px 20px rgba(59, 130, 246, 0.35)';
        });
      }
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

    const AGE_STAGES = [
      {
        id: 'frontier',
        label: '開拓期',
        labelKey: 'age.labels.frontier',
        summary: '村落の礎を築き、生存を優先する段階。',
        summaryKey: 'age.summaries.frontier',
        cost: null,
        time: 0,
        attackBonus: 0,
        accent: '#38bdf8',
        glow: 'rgba(56, 189, 248, 0.16)'
      },
      {
        id: 'feudal',
        label: '封建期',
        labelKey: 'age.labels.feudal',
        summary: '歩兵の再編と防衛線の強化が可能になる。',
        summaryKey: 'age.summaries.feudal',
        cost: { food: 500, gold: 200 },
        time: 45,
        attackBonus: 0.05,
        accent: '#f97316',
        glow: 'rgba(249, 115, 22, 0.14)'
      },
      {
        id: 'castle',
        label: '城塞期',
        labelKey: 'age.labels.castle',
        summary: '重装兵と騎兵の整備で攻勢に転じられる。',
        summaryKey: 'age.summaries.castle',
        cost: { food: 800, gold: 450 },
        time: 60,
        attackBonus: 0.1,
        accent: '#22c55e',
        glow: 'rgba(34, 197, 94, 0.14)'
      },
      {
        id: 'imperial',
        label: '帝国期',
        labelKey: 'age.labels.imperial',
        summary: '最先端の軍制で決定的な優位を築く。',
        summaryKey: 'age.summaries.imperial',
        cost: { food: 1200, gold: 750, stone: 300 },
        time: 75,
        attackBonus: 0.18,
        accent: '#facc15',
        glow: 'rgba(250, 204, 21, 0.16)'
      }
    ];

    const MAX_MOMENTUM = 160;

    const state = {
      resources: { ...difficultyCfg.startingResources },
      pop: { used: 3, cap: 10 },
      ageStage: 0,
      ageResearch: null,
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
      gatherXpBucket: 0,
      empireMomentum: 24
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
      spearman: {
        name: '槍兵',
        nameKey: 'units.spearman',
        radius: 14,
        maxHp: 70,
        speed: 54,
        attackDamage: 11,
        attackRange: 30,
        attackCooldown: 1.15
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
      crossbowman: {
        name: 'クロスボウ兵',
        nameKey: 'units.crossbowman',
        radius: 13,
        maxHp: 55,
        speed: 52,
        attackDamage: 11,
        attackRange: 140,
        attackCooldown: 1.4,
        projectileSpeed: 280
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
      knight: {
        name: '騎士',
        nameKey: 'units.knight',
        radius: 18,
        maxHp: 130,
        speed: 78,
        attackDamage: 18,
        attackRange: 34,
        attackCooldown: 1.25
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
        requiredAge: 0,
        trainable: [{ type: 'villager', label: '村人', labelKey: 'units.villager', cost: { food: 50 }, time: 22 }]
      },
      house: {
        name: '家',
        nameKey: 'structures.house',
        radius: 20,
        maxHp: 600,
        buildTime: 22,
        popCap: 5,
        requiredAge: 0
      },
      barracks: {
        name: '兵舎',
        nameKey: 'structures.barracks',
        radius: 32,
        maxHp: 1200,
        buildTime: 35,
        requiredAge: 0,
        trainable: [
          { type: 'militia', label: '民兵', labelKey: 'units.militia', cost: { food: 60, gold: 20 }, time: 25, requiredAge: 0 },
          { type: 'spearman', label: '槍兵', labelKey: 'units.spearman', cost: { food: 60, wood: 25 }, time: 26, requiredAge: 1 }
        ]
      },
      archery: {
        name: '弓兵小屋',
        nameKey: 'structures.archery',
        radius: 32,
        maxHp: 1100,
        buildTime: 38,
        requiredAge: 1,
        trainable: [
          { type: 'archer', label: '弓兵', labelKey: 'units.archer', cost: { wood: 50, gold: 40 }, time: 26, requiredAge: 1 },
          { type: 'crossbowman', label: 'クロスボウ兵', labelKey: 'units.crossbowman', cost: { wood: 75, gold: 60 }, time: 30, requiredAge: 2 }
        ]
      },
      tower: {
        name: '見張り塔',
        nameKey: 'structures.tower',
        radius: 24,
        maxHp: 900,
        buildTime: 36,
        requiredAge: 1,
        attackDamage: 12,
        attackRange: 200,
        attackCooldown: 2.4
      },
      blacksmith: {
        name: '鍛冶場',
        nameKey: 'structures.blacksmith',
        radius: 28,
        maxHp: 950,
        buildTime: 32,
        requiredAge: 1
      },
      stable: {
        name: '厩舎',
        nameKey: 'structures.stable',
        radius: 34,
        maxHp: 1200,
        buildTime: 40,
        requiredAge: 2,
        trainable: [
          { type: 'knight', label: '騎士', labelKey: 'units.knight', cost: { food: 120, gold: 70 }, time: 32, requiredAge: 2 }
        ]
      },
      siegeWorkshop: {
        name: '攻城工房',
        nameKey: 'structures.siegeWorkshop',
        radius: 36,
        maxHp: 1250,
        buildTime: 44,
        requiredAge: 2,
        trainable: [
          { type: 'ram', label: '破城槌', labelKey: 'units.ram', cost: { wood: 160, gold: 40 }, time: 40, requiredAge: 2 }
        ]
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

    function getAgeName(index){
      const ageCfg = AGE_STAGES[Math.max(0, Math.min(AGE_STAGES.length - 1, index))];
      const fallback = ageCfg?.label || `Age ${index + 1}`;
      const key = ageCfg?.labelKey || `age.stage${index}`;
      return text(key, fallback);
    }

    function getAgeSummary(index){
      const ageCfg = AGE_STAGES[Math.max(0, Math.min(AGE_STAGES.length - 1, index))];
      const fallback = ageCfg?.summary || '';
      const key = ageCfg?.summaryKey || `age.stage${index}.summary`;
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

    function gainMomentum(amount){
      if (!amount) return;
      state.empireMomentum = Math.max(0, Math.min(MAX_MOMENTUM, state.empireMomentum + amount));
      updateMomentumDisplay();
    }

    function updateAgeDisplay(){
      const currentAgeName = getAgeName(state.ageStage);
      const ageCfg = AGE_STAGES[state.ageStage];
      if (ageLabel) {
        ageLabel.textContent = text('hud.ageHeading', () => `帝国段階: ${currentAgeName}`, { age: currentAgeName });
      }
      if (ageSummary) {
        ageSummary.textContent = getAgeSummary(state.ageStage);
      }
      if (agePanel && ageCfg) {
        agePanel.style.boxShadow = `0 8px 18px ${ageCfg.glow}, inset 0 0 0 1px ${ageCfg.glow}`;
        agePanel.style.background = `linear-gradient(135deg, ${ageCfg.glow}, rgba(15, 23, 42, 0.65))`;
      }
      if (ageProgressFill && ageCfg) {
        ageProgressFill.style.background = `linear-gradient(135deg, ${ageCfg.accent}, rgba(2,6,23,0.35))`;
      }
      if (state.ageResearch) {
        const remaining = Math.max(0, state.ageResearch.remaining);
        const progress = state.ageResearch.total > 0 ? 1 - remaining / state.ageResearch.total : 0;
        if (ageProgressFill) {
          ageProgressFill.style.width = `${Math.min(1, Math.max(0, progress)) * 100}%`;
        }
        const seconds = Math.ceil(remaining);
        if (ageStatus) {
          ageStatus.textContent = text('hud.ageProgress', () => `進化中… 残り${seconds}秒`, { remaining: seconds });
        }
      } else {
        if (ageProgressFill) {
          ageProgressFill.style.width = '100%';
        }
        const nextAgeIndex = state.ageStage + 1;
        if (nextAgeIndex < AGE_STAGES.length) {
          const nextAgeName = getAgeName(nextAgeIndex);
          const nextAge = AGE_STAGES[nextAgeIndex];
          const requirement = nextAge.cost ? formatCost(nextAge.cost) : text('hud.ageReady', '進化可能');
          if (ageStatus) {
            ageStatus.textContent = text('hud.ageNext', () => `次: ${nextAgeName} / ${requirement}`, {
              nextAge: nextAgeName,
              requirement
            });
          }
        } else if (ageStatus) {
          ageStatus.textContent = text('hud.ageMax', '帝国期を維持しています。');
        }
      }
    }

    function getMomentumBonusPercent(){
      return (getPlayerAttackMultiplier() - 1) * 100;
    }

    function updateMomentumDisplay(){
      if (momentumHeading) {
        momentumHeading.textContent = text('hud.momentumTitle', '帝国士気');
      }
      if (momentumValue) {
        const value = Math.round(state.empireMomentum);
        momentumValue.textContent = formatNumberLocalized(value, { maximumFractionDigits: 0 });
      }
      if (momentumDetail) {
        const bonus = Math.max(0, getMomentumBonusPercent());
        momentumDetail.textContent = text('hud.momentumDetail', () => `攻撃補正 +${bonus.toFixed(1)}%`, {
          bonus: Number(bonus.toFixed(1))
        });
      }
      if (momentumBarFill) {
        const percent = Math.max(0, Math.min(1, state.empireMomentum / MAX_MOMENTUM));
        const width = Math.max(0.06, percent) * 100;
        momentumBarFill.style.width = `${width}%`;
        if (percent > 0.75) {
          momentumBarFill.style.background = 'linear-gradient(135deg, #facc15, #22c55e)';
        } else if (percent > 0.4) {
          momentumBarFill.style.background = 'linear-gradient(135deg, #f97316, #facc15)';
        } else {
          momentumBarFill.style.background = 'linear-gradient(135deg, #facc15, #f97316)';
        }
      }
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
      const ageName = getAgeName(state.ageStage);
      const momentumScore = Math.round(state.empireMomentum);
      const attackBonus = getMomentumBonusPercent();
      intelBody.textContent = text(
        'intel.summary',
        () => `村人: ${villagerCount}\n軍事: ${armyCount}\n建物: ${structureCount}\n時代: ${ageName}\n士気: ${momentumScore}（攻撃+${attackBonus.toFixed(1)}%）`,
        {
          villagers: villagerCount,
          army: armyCount,
          structures: structureCount,
          age: ageName,
          momentum: momentumScore,
          attackBonus: Number(attackBonus.toFixed(1))
        }
      );
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
            requiredAge: 0,
            label: text('actions.build.house.label', '建設: 家'),
            description: text('actions.build.house.description', '+5人口、建設時間短')
          },
          {
            type: 'barracks',
            cost: { wood: 175 },
            requiredAge: 0,
            label: text('actions.build.barracks.label', '建設: 兵舎'),
            description: text('actions.build.barracks.description', '民兵の訓練')
          },
          {
            type: 'archery',
            cost: { wood: 200, gold: 50 },
            requiredAge: 1,
            label: text('actions.build.archery.label', '建設: 弓兵小屋'),
            description: text('actions.build.archery.description', '射撃兵を解禁')
          },
          {
            type: 'tower',
            cost: { wood: 125, stone: 125 },
            requiredAge: 1,
            label: text('actions.build.tower.label', '建設: 見張り塔'),
            description: text('actions.build.tower.description', '自動射撃タワー')
          },
          {
            type: 'blacksmith',
            cost: { wood: 150, gold: 50 },
            requiredAge: 1,
            label: text('actions.build.blacksmith.label', '建設: 鍛冶場'),
            description: text('actions.build.blacksmith.description', '武具を鍛え士気を高める')
          },
          {
            type: 'stable',
            cost: { wood: 225, food: 125, gold: 50 },
            requiredAge: 2,
            label: text('actions.build.stable.label', '建設: 厩舎'),
            description: text('actions.build.stable.description', '騎士の訓練施設')
          },
          {
            type: 'siegeWorkshop',
            cost: { wood: 260, gold: 120 },
            requiredAge: 2,
            label: text('actions.build.siegeWorkshop.label', '建設: 攻城工房'),
            description: text('actions.build.siegeWorkshop.description', '攻城兵器を製造')
          }
        ];
        buildActions.forEach((action) => {
          const costText = formatCost(action.cost);
          const requiredAgeName = getAgeName(action.requiredAge || 0);
          const requirementText = state.ageStage >= (action.requiredAge || 0)
            ? ''
            : text('actions.requireAge', () => `必要時代: ${requiredAgeName}`, { age: requiredAgeName });
          const description = [action.description, costText, requirementText].filter(Boolean).join('\n');
          const disabled = state.ageStage < (action.requiredAge || 0);
          actionButtonPanel.appendChild(createActionButton(
            action.label,
            description,
            () => {
              if (disabled) {
                const nextAgeLabel = requiredAgeName;
                addLog(text('logs.requireAge', () => `${nextAgeLabel} に到達すると建設可能です。`, { age: nextAgeLabel }));
                return;
              }
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
              const label = action.label;
              addLog(text('logs.placementPrompt', () => `${label} の建設位置を指定してください。`, {
                label
              }));
            },
            {
              disabled,
              onDisabledClick: disabled
                ? () => {
                    const nextAgeLabel = requiredAgeName;
                    addLog(text('logs.requireAge', () => `${nextAgeLabel} に到達すると建設可能です。`, { age: nextAgeLabel }));
                  }
                : null
            }
          ));
        });
      }

      selectedStructures.forEach((structure) => {
        const cfg = structureConfigs[structure.type];
        if (cfg && cfg.trainable && structure.completed) {
          cfg.trainable.forEach((trainCfg) => {
            const unitName = getUnitName(trainCfg.type) || trainCfg.label || trainCfg.type;
            const buttonLabel = text('actions.train.button', () => `訓練: ${unitName}`, { unit: unitName });
            const costText = formatCost(trainCfg.cost);
            const ageRequirement = trainCfg.requiredAge || 0;
            const meetsAge = state.ageStage >= ageRequirement;
            const requirementDetail = meetsAge
              ? ''
              : text('actions.requireAge', () => `必要時代: ${getAgeName(ageRequirement)}`, { age: getAgeName(ageRequirement) });
            const detailText = text('actions.train.details', () => `${costText} / ${Math.round(trainCfg.time)}秒`, {
              cost: costText,
              time: trainCfg.time
            });
            const descriptionLines = [detailText];
            if (requirementDetail) descriptionLines.push(requirementDetail);
            actionButtonPanel.appendChild(createActionButton(
              buttonLabel,
              descriptionLines.join('\n'),
              () => {
                if (!meetsAge) {
                  const ageName = getAgeName(ageRequirement);
                  addLog(text('logs.requireAge', () => `${ageName} に到達すると訓練可能です。`, { age: ageName }));
                  return;
                }
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
              },
              {
                disabled: !meetsAge,
                onDisabledClick: !meetsAge
                  ? () => {
                      const ageName = getAgeName(ageRequirement);
                      addLog(text('logs.requireAge', () => `${ageName} に到達すると訓練可能です。`, { age: ageName }));
                    }
                  : null
              }
            ));
          });
        }

        if (structure.owner === PLAYER && structure.type === 'townCenter') {
          const nextAgeIndex = state.ageStage + 1;
          if (nextAgeIndex < AGE_STAGES.length) {
            const nextAge = AGE_STAGES[nextAgeIndex];
            const nextAgeName = getAgeName(nextAgeIndex);
            const costText = nextAge.cost ? formatCost(nextAge.cost) : '';
            const timeText = text('actions.ageUp.time', () => `進化時間: ${Math.round(nextAge.time)}秒`, {
              time: Math.round(nextAge.time)
            });
            const summaryLine = nextAge.summary ? text(nextAge.summaryKey || 'actions.ageUp.summary', nextAge.summary) : '';
            const detailLines = [summaryLine, costText, timeText].filter(Boolean).join('\n');
            const isResearching = Boolean(state.ageResearch);
            actionButtonPanel.appendChild(createActionButton(
              text('actions.ageUp.label', () => `時代進化: ${nextAgeName}`, { age: nextAgeName }),
              detailLines,
              () => {
                if (state.ageResearch) {
                  addLog(text('logs.ageResearchInProgress', '既に時代進化を研究中です。'));
                  return;
                }
                if (nextAge.cost && !hasResources(nextAge.cost)) {
                  addLog(text('logs.insufficientResources', '資源が不足しています。'));
                  return;
                }
                if (nextAge.cost) {
                  spendResources(nextAge.cost);
                  updateResourcesDisplay();
                }
                state.ageResearch = {
                  targetIndex: nextAgeIndex,
                  remaining: nextAge.time,
                  total: nextAge.time,
                  structureId: structure.id
                };
                addLog(text('logs.ageResearchStarted', () => `${nextAgeName} への進化を開始しました。`, {
                  age: nextAgeName
                }));
                gainMomentum(4);
                updateAgeDisplay();
              },
              {
                variant: 'gold',
                badge: text('actions.badge.ageUp', '時代'),
                disabled: isResearching,
                onDisabledClick: isResearching
                  ? () => addLog(text('logs.ageResearchInProgress', '既に時代進化を研究中です。'))
                  : null
              }
            ));
          }
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
      updateAgeDisplay();
      updateMomentumDisplay();
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

    function countCompletedStructures(type){
      return structures.filter((structure) => structure.owner === PLAYER && structure.type === type && structure.completed).length;
    }

    function getPlayerAttackMultiplier(){
      let bonus = 0;
      for (let i = 0; i <= state.ageStage; i++) {
        bonus += AGE_STAGES[i]?.attackBonus || 0;
      }
      bonus += countCompletedStructures('blacksmith') * 0.04;
      bonus += Math.min(state.empireMomentum, MAX_MOMENTUM) / 200;
      return Math.max(1, 1 + bonus);
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
          gainMomentum(3);
        }
        structure.queue.shift();
        structure.queueProgress = 0;
      }
    }

    function updateAgeResearch(dt){
      if (!state.ageResearch) return;
      const tcExists = structures.some((structure) => structure.id === state.ageResearch.structureId && structure.owner === PLAYER);
      if (!tcExists) {
        state.ageResearch = null;
        addLog(text('logs.ageResearchCancelled', 'タウンセンター喪失により時代進化が中断されました。'));
        updateAgeDisplay();
        return;
      }
      state.ageResearch.remaining = Math.max(0, state.ageResearch.remaining - dt);
      updateAgeDisplay();
      if (state.ageResearch.remaining <= 0) {
        state.ageStage = Math.max(state.ageStage, Math.min(state.ageResearch.targetIndex, AGE_STAGES.length - 1));
        state.ageResearch = null;
        const ageName = getAgeName(state.ageStage);
        addLog(text('logs.ageAdvanced', () => `${ageName} に進化しました！`, { age: ageName }));
        gainMomentum(14);
        updateSelectionPanels();
        updateIntel();
        updateAgeDisplay();
      }
    }

    function tickMomentum(dt){
      const before = state.empireMomentum;
      const decayRate = state.empireMomentum > 90 ? 0.42 : state.empireMomentum > 60 ? 0.26 : 0.14;
      state.empireMomentum = Math.max(0, state.empireMomentum - decayRate * dt);
      if (Math.abs(before - state.empireMomentum) > 0.05) {
        updateMomentumDisplay();
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
            gainMomentum(structure.type === 'blacksmith' ? 8 : 6);
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
        gainMomentum(-12);
      } else {
        if (structure.type === 'townCenter') {
          triggerGameOver(true, text('gameOver.message.enemyTownCenterDestroyed', '敵のタウンセンターを破壊した。'));
        }
        gainMomentum(10);
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
        gainMomentum(-6);
      } else {
        awardBufferedXp(unit.xpValue);
        gainMomentum(1.5);
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
      const scaledDamage = source.owner === PLAYER ? damage * getPlayerAttackMultiplier() : damage;
      projectiles.push({
        id: nextId('p'),
        x: source.x,
        y: source.y,
        targetId: target.id,
        damage: scaledDamage,
        speed,
        owner: source.owner
      });
    }

    function performAttack(attacker, target){
      if (attacker.projectileSpeed) {
        createProjectile(attacker, target, attacker.attackDamage, attacker.projectileSpeed);
        return;
      }
      const base = attacker.attackDamage;
      const scaled = attacker.owner === PLAYER ? base * getPlayerAttackMultiplier() : base;
      applyDamage(target, scaled, attacker);
    }

    function applyDamage(target, amount, source){
      if (!target) return;
      const finalAmount = Math.max(1, Math.round(amount));
      target.hp -= finalAmount;
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
          for (let i = 0; i < 2; i++) createUnit('knight', spawnX + Math.random() * 30, spawnY + (Math.random()-0.5)*70, ENEMY);
        },
        () => {
          for (let i = 0; i < 12; i++) createUnit('raider', spawnX + Math.random() * 50, spawnY + (Math.random()-0.5)*120, ENEMY);
          for (let i = 0; i < 5; i++) createUnit('horseArcher', spawnX + Math.random() * 40, spawnY + (Math.random()-0.5)*120, ENEMY);
          createUnit('ram', spawnX - 20, spawnY + 40);
          createUnit('ram', spawnX - 20, spawnY - 40);
          for (let i = 0; i < 3; i++) createUnit('knight', spawnX + Math.random() * 40, spawnY + (Math.random()-0.5)*120, ENEMY);
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
          gainMomentum(12);
          updateResourcesDisplay();
        }
      }
    }

    function draw(){
      ctx.clearRect(0, 0, size.width, size.height);
      const skyGradient = ctx.createLinearGradient(0, 0, size.width, size.height);
      skyGradient.addColorStop(0, '#020617');
      skyGradient.addColorStop(0.55, '#0f172a');
      skyGradient.addColorStop(1, '#020b1a');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, size.width, size.height);

      const glowColor = AGE_STAGES[state.ageStage]?.glow || 'rgba(56, 189, 248, 0.16)';
      const radial = ctx.createRadialGradient(size.width * 0.45, size.height * 0.58, 60, size.width * 0.45, size.height * 0.58, size.width * 0.9);
      radial.addColorStop(0, glowColor);
      radial.addColorStop(1, 'rgba(8, 15, 30, 0)');
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, size.width, size.height);

      ctx.save();
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.12)';
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

      const resourcePalette = {
        food: { inner: '#fca5a5', outer: '#f87171' },
        wood: { inner: '#86efac', outer: '#22c55e' },
        gold: { inner: '#fde68a', outer: '#facc15' },
        stone: { inner: '#cbd5f5', outer: '#94a3b8' }
      };

      resourceNodes.forEach((resource) => {
        const palette = resourcePalette[resource.type] || resourcePalette.stone;
        ctx.save();
        const gradient = ctx.createRadialGradient(resource.x, resource.y, 6, resource.x, resource.y, resource.radius);
        gradient.addColorStop(0, palette.inner);
        gradient.addColorStop(1, palette.outer);
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.92;
        ctx.shadowColor = palette.outer;
        ctx.shadowBlur = 22;
        ctx.beginPath();
        ctx.arc(resource.x, resource.y, resource.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
        ctx.font = '10px "Segoe UI"';
        ctx.textAlign = 'center';
        ctx.fillText(formatNumberLocalized(Math.max(0, Math.floor(resource.amount)), { maximumFractionDigits: 0 }), resource.x, resource.y + 4);
        ctx.restore();
      });

      structures.forEach((structure) => {
        ctx.save();
        const ownerColor = structure.owner === PLAYER ? '#38bdf8' : '#f97316';
        ctx.shadowColor = ownerColor;
        ctx.shadowBlur = structure.completed ? 26 : 14;
        const baseGradient = ctx.createRadialGradient(structure.x, structure.y, structure.radius * 0.2, structure.x, structure.y, structure.radius);
        baseGradient.addColorStop(0, structure.owner === PLAYER ? '#bae6fd' : '#ffd0a6');
        baseGradient.addColorStop(1, ownerColor);
        ctx.globalAlpha = structure.completed ? 0.95 : 0.7;
        ctx.beginPath();
        ctx.fillStyle = baseGradient;
        ctx.arc(structure.x, structure.y, structure.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = 0.95;
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 11px "Segoe UI"';
        ctx.textAlign = 'center';
        const structureLabel = getStructureName(structure.type);
        ctx.fillText(structureLabel, structure.x, structure.y + 4);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fillRect(structure.x - structure.radius, structure.y - structure.radius - 12, structure.radius * 2, 6);
        ctx.fillStyle = ownerColor;
        ctx.fillRect(structure.x - structure.radius, structure.y - structure.radius - 12, structure.radius * 2 * (structure.hp / structure.maxHp), 6);
        ctx.restore();
      });

      units.forEach((unit) => {
        ctx.save();
        const ownerColor = unit.owner === PLAYER ? '#bae6fd' : '#fb7185';
        ctx.shadowColor = ownerColor;
        ctx.shadowBlur = 18;
        ctx.globalAlpha = 0.96;
        ctx.beginPath();
        ctx.fillStyle = ownerColor;
        ctx.arc(unit.x, unit.y, unit.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 10px "Segoe UI"';
        ctx.textAlign = 'center';
        const unitLabel = getUnitName(unit.type);
        ctx.fillText(unitLabel, unit.x, unit.y + 4);
        ctx.restore();

        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fillRect(unit.x - unit.radius, unit.y - unit.radius - 10, unit.radius * 2, 4);
        ctx.fillStyle = unit.owner === PLAYER ? '#38bdf8' : '#fb7185';
        ctx.fillRect(unit.x - unit.radius, unit.y - unit.radius - 10, unit.radius * 2 * (unit.hp / unit.maxHp), 4);
        if (state.selection.units.has(unit.id)) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(unit.x, unit.y, unit.radius + 5, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      });

      projectiles.forEach((projectile) => {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = projectile.owner === PLAYER ? 'rgba(254, 249, 195, 0.9)' : 'rgba(253, 164, 175, 0.9)';
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
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
      const background = miniCtx.createLinearGradient(0, 0, miniMapCanvas.width, miniMapCanvas.height);
      background.addColorStop(0, '#020617');
      background.addColorStop(1, '#111c2f');
      miniCtx.fillStyle = background;
      miniCtx.fillRect(0, 0, miniMapCanvas.width, miniMapCanvas.height);
      miniCtx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
      miniCtx.strokeRect(0.5, 0.5, miniMapCanvas.width - 1, miniMapCanvas.height - 1);
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
      updateAgeResearch(dt);
      tickMomentum(dt);
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
      updateMomentumDisplay();
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

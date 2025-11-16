(function(){
  /** MiniExp: Sandbox Fusion Numbers (v0.1.0) */
  function create(root, awardXp, opts){
    const localization = (opts && opts.localization)
      || (typeof window !== 'undefined' && typeof window.createMiniGameLocalization === 'function'
        ? window.createMiniGameLocalization({
            id: 'sandbox_fusion_numbers',
            localizationKey: 'games.sandboxFusionNumbers',
            textKeyPrefix: 'games.sandboxFusionNumbers',
            legacyKeyPrefixes: ['games.sandboxFusionNumbers']
          })
        : null);

    function text(key, fallback, params){
      if (key && localization && typeof localization.t === 'function'){
        try {
          const localized = localization.t(key, fallback, params);
          if (localized != null){
            return localized;
          }
        } catch (error){
          console.warn('[sandbox_fusion_numbers] Failed to translate key:', key, error);
        }
      }
      if (typeof fallback === 'function'){
        try { return fallback(params || {}); } catch (error) {
          console.warn('[sandbox_fusion_numbers] Failed to compute fallback text for key:', key, error);
          return '';
        }
      }
      return fallback ?? '';
    }

    const state = {
      width: 4,
      height: 4,
      board: [],
      running: false,
      mode: 'multiply',
      baseValue: 2,
      additionStep: 1,
      spawnMode: 'count',
      spawnCount: 1,
      spawnRatio: 0.1,
      mergeRequirementEnabled: false,
      mergeRequirementCount: 2,
      dynamicSpawnEnabled: false,
      dynamicOffset: -1,
      autoEnabled: false,
      autoInterval: 1.5,
      autoStyle: 'random',
      autoTimer: null,
      autoCycleIndex: 0,
      stats: {
        moves: 0,
        merges: 0,
        highestValue: 0,
        lastGain: 0
      }
    };

    const shortcuts = opts?.shortcuts;
    let keyListenerAttached = false;
    const container = document.createElement('div');
    container.className = 'sfn-container';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '12px';
    container.style.maxWidth = '840px';
    container.style.margin = '0 auto';
    container.style.padding = '18px 18px 28px';
    container.style.background = 'linear-gradient(180deg, rgba(15,23,42,0.95), rgba(2,6,23,0.92))';
    container.style.borderRadius = '18px';
    container.style.boxShadow = '0 24px 48px rgba(15,23,42,0.55)';
    container.style.color = '#e2e8f0';
    container.style.fontFamily = "'Noto Sans JP', 'Segoe UI', sans-serif";

    const title = document.createElement('h2');
    title.textContent = text('title', 'サンドボックス融合数字');
    title.style.margin = '0';
    title.style.textAlign = 'center';
    title.style.fontSize = '22px';
    container.appendChild(title);

    const subtitle = document.createElement('div');
    subtitle.textContent = text('subtitle', '2048を自由に拡張する実験モード。詰んだら自動シャッフルします。');
    subtitle.style.textAlign = 'center';
    subtitle.style.fontSize = '13px';
    subtitle.style.opacity = '0.85';
    container.appendChild(subtitle);

    const layout = document.createElement('div');
    layout.style.display = 'flex';
    layout.style.flexWrap = 'wrap';
    layout.style.gap = '18px';
    container.appendChild(layout);

    const controlsPanel = document.createElement('div');
    controlsPanel.style.flex = '1 1 280px';
    controlsPanel.style.background = 'rgba(15,23,42,0.6)';
    controlsPanel.style.borderRadius = '14px';
    controlsPanel.style.padding = '14px 16px 18px';
    controlsPanel.style.display = 'flex';
    controlsPanel.style.flexDirection = 'column';
    controlsPanel.style.gap = '12px';
    controlsPanel.style.color = '#e2e8f0';

    const boardPanel = document.createElement('div');
    boardPanel.style.flex = '1 1 320px';
    boardPanel.style.display = 'flex';
    boardPanel.style.flexDirection = 'column';
    boardPanel.style.alignItems = 'center';
    boardPanel.style.gap = '12px';

    layout.appendChild(controlsPanel);
    layout.appendChild(boardPanel);

    function createSection(titleText){
      const section = document.createElement('section');
      section.style.display = 'flex';
      section.style.flexDirection = 'column';
      section.style.gap = '8px';
      const header = document.createElement('h3');
      header.textContent = titleText;
      header.style.margin = '0';
      header.style.fontSize = '15px';
      header.style.color = '#bfdbfe';
      section.appendChild(header);
      return { section, header };
    }

    function createLabeledInput(labelText, input){
    const wrapper = document.createElement('label');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '4px';
    wrapper.style.fontSize = '13px';
    wrapper.style.color = '#e2e8f0';
    const span = document.createElement('span');
    span.textContent = labelText;
    span.style.opacity = '0.9';
    span.style.color = '#f8fafc';
      wrapper.appendChild(span);
      wrapper.appendChild(input);
      return wrapper;
    }

    function createNumberInput({ min, max, step, value }){
      const input = document.createElement('input');
      input.type = 'number';
      if (min != null) input.min = String(min);
      if (max != null) input.max = String(max);
      if (step != null) input.step = String(step);
      input.value = value != null ? String(value) : '';
      input.style.padding = '6px 8px';
      input.style.borderRadius = '8px';
      input.style.border = '1px solid rgba(148,163,184,0.35)';
      input.style.background = 'rgba(15,23,42,0.7)';
      input.style.color = '#e2e8f0';
      input.style.fontSize = '13px';
      return input;
    }

    function parseNumberInput(input, fallback){
      const num = Number(input.value);
      return Number.isFinite(num) ? num : fallback;
    }

    const boardSection = createSection(text('sections.boardSettings', '盤面設定'));
    const widthInput = createNumberInput({ min: 2, max: 64, value: state.width });
    const heightInput = createNumberInput({ min: 2, max: 64, value: state.height });
    const widthLabel = createLabeledInput(text('labels.width', '幅'), widthInput);
    const heightLabel = createLabeledInput(text('labels.height', '高さ'), heightInput);
    const sizeRow = document.createElement('div');
    sizeRow.style.display = 'grid';
    sizeRow.style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
    sizeRow.style.gap = '8px';
    sizeRow.appendChild(widthLabel);
    sizeRow.appendChild(heightLabel);
    boardSection.section.appendChild(sizeRow);

    controlsPanel.appendChild(boardSection.section);

    const spawnSection = createSection(text('sections.spawnSettings', '出現設定'));
    const spawnModeRow = document.createElement('div');
    spawnModeRow.style.display = 'flex';
    spawnModeRow.style.gap = '8px';
    spawnModeRow.style.flexWrap = 'wrap';

    function createRadio(name, value, labelText, checked){
      const wrapper = document.createElement('label');
    wrapper.style.display = 'inline-flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.gap = '4px';
    wrapper.style.fontSize = '13px';
    wrapper.style.color = '#f8fafc';
    const input = document.createElement('input');
    input.type = 'radio';
      input.name = name;
      input.value = value;
      input.checked = checked;
    const span = document.createElement('span');
    span.textContent = labelText;
    span.style.color = '#f8fafc';
      wrapper.appendChild(input);
      wrapper.appendChild(span);
      return { wrapper, input };
    }

    const spawnCountInput = createNumberInput({ min: 1, max: 32, value: state.spawnCount });
    const spawnRatioInput = createNumberInput({ min: 0, max: 1, step: 0.05, value: state.spawnRatio });

    const { wrapper: countRadioWrap, input: countRadio } = createRadio('sfn-spawn-mode', 'count', text('labels.spawnCountMode', '個数指定'), true);
    const { wrapper: ratioRadioWrap, input: ratioRadio } = createRadio('sfn-spawn-mode', 'ratio', text('labels.spawnRatioMode', '割合指定'), false);
    spawnModeRow.appendChild(countRadioWrap);
    spawnModeRow.appendChild(ratioRadioWrap);
    spawnSection.section.appendChild(spawnModeRow);

    const spawnCountLabel = createLabeledInput(text('labels.spawnCount', '一度に出現する数'), spawnCountInput);
    const spawnRatioLabel = createLabeledInput(text('labels.spawnRatio', '空きマスに対する割合'), spawnRatioInput);
    spawnRatioLabel.style.display = 'none';

    spawnSection.section.appendChild(spawnCountLabel);
    spawnSection.section.appendChild(spawnRatioLabel);

    const dynamicToggleRow = document.createElement('label');
    dynamicToggleRow.style.display = 'flex';
    dynamicToggleRow.style.alignItems = 'center';
    dynamicToggleRow.style.gap = '6px';
    dynamicToggleRow.style.fontSize = '13px';
    dynamicToggleRow.style.color = '#f8fafc';
    const dynamicToggle = document.createElement('input');
    dynamicToggle.type = 'checkbox';
    dynamicToggle.checked = state.dynamicSpawnEnabled;
    const dynamicLabel = document.createElement('span');
    dynamicLabel.textContent = text('labels.dynamicSpawn', '動的出現数字 (最大値からのオフセット)');
    dynamicLabel.style.color = '#f8fafc';
    dynamicToggleRow.appendChild(dynamicToggle);
    dynamicToggleRow.appendChild(dynamicLabel);

    const dynamicOffsetInput = createNumberInput({ min: -64, max: 64, value: state.dynamicOffset });
    const dynamicOffsetLabel = createLabeledInput(text('labels.dynamicOffset', 'オフセット (負値で小さく)'), dynamicOffsetInput);
    dynamicOffsetLabel.style.display = 'none';

    spawnSection.section.appendChild(dynamicToggleRow);
    spawnSection.section.appendChild(dynamicOffsetLabel);

    controlsPanel.appendChild(spawnSection.section);

    const modeSection = createSection(text('sections.modeSettings', '融合ルール'));
    const modeSelect = document.createElement('select');
    modeSelect.style.padding = '6px 8px';
    modeSelect.style.borderRadius = '8px';
    modeSelect.style.border = '1px solid rgba(148,163,184,0.35)';
    modeSelect.style.background = 'rgba(15,23,42,0.7)';
    modeSelect.style.color = '#e2e8f0';
    modeSelect.style.fontSize = '13px';
    const optAdd = document.createElement('option');
    optAdd.value = 'add';
    optAdd.textContent = text('labels.additionMode', '加算モード');
    const optMul = document.createElement('option');
    optMul.value = 'multiply';
    optMul.textContent = text('labels.multiplicationMode', '乗算モード');
    modeSelect.appendChild(optMul);
    modeSelect.appendChild(optAdd);
    modeSelect.value = state.mode;

    const baseValueInput = createNumberInput({ min: 1, max: 4096, value: state.baseValue });
    const baseLabel = createLabeledInput(text('labels.baseValue', '初期数字'), baseValueInput);

    const additionStepInput = createNumberInput({ min: 1, max: 4096, value: state.additionStep });
    const additionStepLabel = createLabeledInput(text('labels.additionStep', '加算モードのステップ'), additionStepInput);
    additionStepLabel.style.display = state.mode === 'add' ? 'flex' : 'none';

    const mergeRequirementRow = document.createElement('label');
    mergeRequirementRow.style.display = 'flex';
    mergeRequirementRow.style.alignItems = 'center';
    mergeRequirementRow.style.gap = '6px';
    mergeRequirementRow.style.fontSize = '13px';
    mergeRequirementRow.style.color = '#f8fafc';
    const mergeRequirementToggle = document.createElement('input');
    mergeRequirementToggle.type = 'checkbox';
    mergeRequirementToggle.checked = state.mergeRequirementEnabled;
    const mergeRequirementSpan = document.createElement('span');
    mergeRequirementSpan.textContent = text('labels.mergeRequirement', 'n回くっつくまでは数字アップなし');
    mergeRequirementRow.appendChild(mergeRequirementToggle);
    mergeRequirementRow.appendChild(mergeRequirementSpan);

    const mergeRequirementInput = createNumberInput({ min: 2, max: 16, value: state.mergeRequirementCount });
    const mergeRequirementLabel = createLabeledInput(text('labels.mergeRequirementCount', '必要融合回数 n'), mergeRequirementInput);
    mergeRequirementLabel.style.display = state.mergeRequirementEnabled ? 'flex' : 'none';

    const modeLabel = createLabeledInput(text('labels.mode', 'モード'), modeSelect);
    modeSection.section.appendChild(modeLabel);
    modeSection.section.appendChild(baseLabel);
    modeSection.section.appendChild(additionStepLabel);
    modeSection.section.appendChild(mergeRequirementRow);
    modeSection.section.appendChild(mergeRequirementLabel);

    controlsPanel.appendChild(modeSection.section);

    const autoSection = createSection(text('sections.autoPlay', '自動モード'));
    const autoToggleRow = document.createElement('label');
    autoToggleRow.style.display = 'flex';
    autoToggleRow.style.alignItems = 'center';
    autoToggleRow.style.gap = '6px';
    autoToggleRow.style.fontSize = '13px';
    autoToggleRow.style.color = '#f8fafc';
    const autoToggle = document.createElement('input');
    autoToggle.type = 'checkbox';
    autoToggle.checked = state.autoEnabled;
    const autoToggleSpan = document.createElement('span');
    autoToggleSpan.textContent = text('labels.autoPlay', 'プレイ中に自動操作');
    autoToggleSpan.style.color = '#f8fafc';
    autoToggleRow.appendChild(autoToggle);
    autoToggleRow.appendChild(autoToggleSpan);

    const autoIntervalInput = createNumberInput({ min: 0.1, max: 10, step: 0.1, value: state.autoInterval });
    const autoIntervalLabel = createLabeledInput(text('labels.autoInterval', '操作間隔 (秒)'), autoIntervalInput);
    autoIntervalLabel.style.display = state.autoEnabled ? 'flex' : 'none';

    const autoModeSelect = document.createElement('select');
    autoModeSelect.style.padding = '6px 8px';
    autoModeSelect.style.borderRadius = '8px';
    autoModeSelect.style.border = '1px solid rgba(148,163,184,0.35)';
    autoModeSelect.style.background = 'rgba(15,23,42,0.7)';
    autoModeSelect.style.color = '#e2e8f0';
    autoModeSelect.style.fontSize = '13px';
    const autoRandomOpt = document.createElement('option');
    autoRandomOpt.value = 'random';
    autoRandomOpt.textContent = text('labels.autoRandom', 'ランダム');
    const autoCycleOpt = document.createElement('option');
    autoCycleOpt.value = 'cycle';
    autoCycleOpt.textContent = text('labels.autoCycle', 'ぐるぐる');
    autoModeSelect.appendChild(autoRandomOpt);
    autoModeSelect.appendChild(autoCycleOpt);
    autoModeSelect.value = state.autoStyle;
    const autoModeLabel = createLabeledInput(text('labels.autoMode', '自動操作パターン'), autoModeSelect);
    autoModeLabel.style.display = state.autoEnabled ? 'flex' : 'none';

    autoSection.section.appendChild(autoToggleRow);
    autoSection.section.appendChild(autoIntervalLabel);
    autoSection.section.appendChild(autoModeLabel);

    controlsPanel.appendChild(autoSection.section);

    const actionSection = createSection(text('sections.actions', '操作'));
    const startButton = document.createElement('button');
    startButton.type = 'button';
    startButton.textContent = text('buttons.start', '設定を適用して開始');
    styleButton(startButton);
    startButton.style.background = 'linear-gradient(90deg, #3b82f6, #6366f1)';
    startButton.style.color = '#f8fafc';

    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.textContent = text('buttons.reset', '盤面をクリア');
    styleButton(resetButton);

    const shuffleButton = document.createElement('button');
    shuffleButton.type = 'button';
    shuffleButton.textContent = text('buttons.shuffle', '強制シャッフル');
    styleButton(shuffleButton);

    const buttonsRow = document.createElement('div');
    buttonsRow.style.display = 'flex';
    buttonsRow.style.flexWrap = 'wrap';
    buttonsRow.style.gap = '8px';
    buttonsRow.appendChild(startButton);
    buttonsRow.appendChild(resetButton);
    buttonsRow.appendChild(shuffleButton);

    actionSection.section.appendChild(buttonsRow);

    const importExportRow = document.createElement('div');
    importExportRow.style.display = 'flex';
    importExportRow.style.flexDirection = 'column';
    importExportRow.style.gap = '6px';

    const dataArea = document.createElement('textarea');
    dataArea.rows = 4;
    dataArea.style.width = '100%';
    dataArea.style.resize = 'vertical';
    dataArea.style.padding = '8px';
    dataArea.style.borderRadius = '8px';
    dataArea.style.border = '1px solid rgba(148,163,184,0.35)';
    dataArea.style.background = 'rgba(15,23,42,0.7)';
    dataArea.style.color = '#e2e8f0';
    dataArea.placeholder = text('placeholders.importExport', 'インポート/エクスポートJSONをここに入力');

    const dataButtonsRow = document.createElement('div');
    dataButtonsRow.style.display = 'flex';
    dataButtonsRow.style.gap = '8px';
    dataButtonsRow.style.flexWrap = 'wrap';

    const exportButton = document.createElement('button');
    exportButton.type = 'button';
    exportButton.textContent = text('buttons.export', 'エクスポート');
    styleButton(exportButton);

    const importButton = document.createElement('button');
    importButton.type = 'button';
    importButton.textContent = text('buttons.import', 'インポートして適用');
    styleButton(importButton);

    dataButtonsRow.appendChild(exportButton);
    dataButtonsRow.appendChild(importButton);

    importExportRow.appendChild(dataArea);
    importExportRow.appendChild(dataButtonsRow);

    actionSection.section.appendChild(importExportRow);

    controlsPanel.appendChild(actionSection.section);

    function styleButton(btn){
      btn.style.padding = '8px 12px';
      btn.style.borderRadius = '8px';
      btn.style.border = '1px solid rgba(148,163,184,0.3)';
      btn.style.background = 'rgba(30,41,59,0.8)';
      btn.style.color = '#e2e8f0';
      btn.style.fontSize = '13px';
      btn.style.cursor = 'pointer';
      btn.style.flex = '1 1 auto';
    }

    const boardCanvas = document.createElement('canvas');
    boardCanvas.width = 560;
    boardCanvas.height = 560;
    boardCanvas.style.maxWidth = '100%';
    boardCanvas.style.borderRadius = '16px';
    boardCanvas.style.background = 'rgba(15,23,42,0.9)';
    boardCanvas.style.boxShadow = '0 12px 32px rgba(15,23,42,0.55)';

    const boardCtx = boardCanvas.getContext('2d');
    const tilePalette = ['#475569', '#2563eb', '#22d3ee', '#34d399', '#facc15', '#f97316', '#ef4444', '#a855f7'];
    const animationState = {
      running: false,
      tiles: [],
      spawnTiles: [],
      startTime: 0,
      duration: 260,
      onComplete: null
    };
    let animationFrameId = null;
    const requestFrame = (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function')
      ? window.requestAnimationFrame.bind(window)
      : (callback) => setTimeout(() => callback(Date.now()), 16);
    const cancelFrame = (typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function')
      ? window.cancelAnimationFrame.bind(window)
      : (id) => clearTimeout(id);
    function getTimestamp(){
      if (typeof performance === 'object' && typeof performance.now === 'function'){
        return performance.now();
      }
      return Date.now();
    }
    function easeOutCubic(value){
      const clamped = Math.max(0, Math.min(1, value));
      return 1 - Math.pow(1 - clamped, 3);
    }

    const statsBox = document.createElement('div');
    statsBox.style.display = 'grid';
    statsBox.style.gridTemplateColumns = 'repeat(auto-fit, minmax(120px, 1fr))';
    statsBox.style.gap = '8px';
    statsBox.style.width = '100%';

    function createStatCard(label){
      const card = document.createElement('div');
      card.style.background = 'rgba(15,23,42,0.7)';
      card.style.borderRadius = '12px';
      card.style.padding = '10px 12px';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.gap = '4px';
      const labelEl = document.createElement('div');
      labelEl.textContent = label;
      labelEl.style.fontSize = '12px';
      labelEl.style.opacity = '0.75';
      const valueEl = document.createElement('div');
      valueEl.textContent = '0';
      valueEl.style.fontSize = '18px';
      valueEl.style.fontWeight = '600';
      card.appendChild(labelEl);
      card.appendChild(valueEl);
      statsBox.appendChild(card);
      return valueEl;
    }

    const movesValueEl = createStatCard(text('stats.moves', '移動回数'));
    const mergesValueEl = createStatCard(text('stats.merges', '融合回数'));
    const highestValueEl = createStatCard(text('stats.highest', '最大数字'));
    const lastGainValueEl = createStatCard(text('stats.lastGain', '直近獲得値/EXP'));

    const hint = document.createElement('div');
    hint.textContent = text('hint', '矢印キーまたはボタンで操作できます。詰んだら自動でシャッフルします。');
    hint.style.fontSize = '12px';
    hint.style.opacity = '0.7';
    hint.style.textAlign = 'center';

    const manualControls = document.createElement('div');
    manualControls.style.display = 'grid';
    manualControls.style.gridTemplateColumns = 'repeat(3, 64px)';
    manualControls.style.gridTemplateRows = 'repeat(3, 40px)';
    manualControls.style.gap = '6px';
    manualControls.style.justifyContent = 'center';

    const dirToLabel = {
      up: text('buttons.up', '↑ 上'),
      down: text('buttons.down', '↓ 下'),
      left: text('buttons.left', '← 左'),
      right: text('buttons.right', '→ 右')
    };
    const dirToIndex = { left: 0, up: 1, right: 2, down: 3 };

    for (let r = 0; r < 3; r++){
      for (let c = 0; c < 3; c++){
        const dir = (r === 0 && c === 1) ? 'up'
          : (r === 1 && c === 0) ? 'left'
          : (r === 1 && c === 2) ? 'right'
          : (r === 2 && c === 1) ? 'down'
          : null;
        const cell = document.createElement('div');
        cell.style.display = 'flex';
        cell.style.alignItems = 'center';
        cell.style.justifyContent = 'center';
        if (dir){
          const btn = document.createElement('button');
          styleButton(btn);
          btn.style.width = '100%';
          btn.style.height = '100%';
          btn.style.fontSize = '13px';
          btn.textContent = dirToLabel[dir];
          btn.addEventListener('click', () => handleMove(dirToIndex[dir]));
          btn.dataset.dir = dir;
          cell.appendChild(btn);
        }
        manualControls.appendChild(cell);
      }
    }

    boardPanel.appendChild(boardCanvas);
    boardPanel.appendChild(statsBox);
    boardPanel.appendChild(manualControls);
    boardPanel.appendChild(hint);

    root.appendChild(container);

    let detachLocale = localization && typeof localization.onChange === 'function'
      ? localization.onChange(() => {
          try { updateLocaleTexts(); } catch (error) { console.warn(error); }
          try { drawBoard(); } catch (error) { console.warn(error); }
        })
      : null;

    function updateLocaleTexts(){
      title.textContent = text('title', 'サンドボックス融合数字');
      subtitle.textContent = text('subtitle', '2048を自由に拡張する実験モード。詰んだら自動シャッフルします。');
      boardSection.header.textContent = text('sections.boardSettings', '盤面設定');
      widthLabel.firstChild.textContent = text('labels.width', '幅');
      heightLabel.firstChild.textContent = text('labels.height', '高さ');
      spawnSection.header.textContent = text('sections.spawnSettings', '出現設定');
      countRadioWrap.querySelector('span').textContent = text('labels.spawnCountMode', '個数指定');
      ratioRadioWrap.querySelector('span').textContent = text('labels.spawnRatioMode', '割合指定');
      spawnCountLabel.firstChild.textContent = text('labels.spawnCount', '一度に出現する数');
      spawnRatioLabel.firstChild.textContent = text('labels.spawnRatio', '空きマスに対する割合');
      dynamicLabel.textContent = text('labels.dynamicSpawn', '動的出現数字 (最大値からのオフセット)');
      dynamicOffsetLabel.firstChild.textContent = text('labels.dynamicOffset', 'オフセット (負値で小さく)');
      modeSection.header.textContent = text('sections.modeSettings', '融合ルール');
      modeLabel.firstChild.textContent = text('labels.mode', 'モード');
      optAdd.textContent = text('labels.additionMode', '加算モード');
      optMul.textContent = text('labels.multiplicationMode', '乗算モード');
      baseLabel.firstChild.textContent = text('labels.baseValue', '初期数字');
      additionStepLabel.firstChild.textContent = text('labels.additionStep', '加算モードのステップ');
      mergeRequirementSpan.textContent = text('labels.mergeRequirement', 'n回くっつくまでは数字アップなし');
      mergeRequirementLabel.firstChild.textContent = text('labels.mergeRequirementCount', '必要融合回数 n');
      autoSection.header.textContent = text('sections.autoPlay', '自動モード');
      autoToggleSpan.textContent = text('labels.autoPlay', 'プレイ中に自動操作');
      autoIntervalLabel.firstChild.textContent = text('labels.autoInterval', '操作間隔 (秒)');
      autoModeLabel.firstChild.textContent = text('labels.autoMode', '自動操作パターン');
      autoRandomOpt.textContent = text('labels.autoRandom', 'ランダム');
      autoCycleOpt.textContent = text('labels.autoCycle', 'ぐるぐる');
      actionSection.header.textContent = text('sections.actions', '操作');
      startButton.textContent = text('buttons.start', '設定を適用して開始');
      resetButton.textContent = text('buttons.reset', '盤面をクリア');
      shuffleButton.textContent = text('buttons.shuffle', '強制シャッフル');
      exportButton.textContent = text('buttons.export', 'エクスポート');
      importButton.textContent = text('buttons.import', 'インポートして適用');
      dataArea.placeholder = text('placeholders.importExport', 'インポート/エクスポートJSONをここに入力');
      movesValueEl.parentElement.firstChild.textContent = text('stats.moves', '移動回数');
      mergesValueEl.parentElement.firstChild.textContent = text('stats.merges', '融合回数');
      highestValueEl.parentElement.firstChild.textContent = text('stats.highest', '最大数字');
      lastGainValueEl.parentElement.firstChild.textContent = text('stats.lastGain', '直近獲得値/EXP');
      hint.textContent = text('hint', '矢印キーまたはボタンで操作できます。詰んだら自動でシャッフルします。');
      manualControls.querySelectorAll('button').forEach(btn => {
        const dir = btn.dataset.dir;
        if (dir && dirToLabel[dir]){
          btn.textContent = dirToLabel[dir];
        }
      });
    }

    countRadio.addEventListener('change', () => {
      if (countRadio.checked){
        state.spawnMode = 'count';
        spawnCountLabel.style.display = 'flex';
        spawnRatioLabel.style.display = 'none';
      }
    });
    ratioRadio.addEventListener('change', () => {
      if (ratioRadio.checked){
        state.spawnMode = 'ratio';
        spawnCountLabel.style.display = 'none';
        spawnRatioLabel.style.display = 'flex';
      }
    });

    modeSelect.addEventListener('change', () => {
      state.mode = modeSelect.value === 'add' ? 'add' : 'multiply';
      additionStepLabel.style.display = state.mode === 'add' ? 'flex' : 'none';
      drawBoard();
    });

    mergeRequirementToggle.addEventListener('change', () => {
      state.mergeRequirementEnabled = mergeRequirementToggle.checked;
      mergeRequirementLabel.style.display = state.mergeRequirementEnabled ? 'flex' : 'none';
    });

    dynamicToggle.addEventListener('change', () => {
      state.dynamicSpawnEnabled = dynamicToggle.checked;
      dynamicOffsetLabel.style.display = state.dynamicSpawnEnabled ? 'flex' : 'none';
    });

    autoToggle.addEventListener('change', () => {
      state.autoEnabled = autoToggle.checked;
      autoIntervalLabel.style.display = state.autoEnabled ? 'flex' : 'none';
      autoModeLabel.style.display = state.autoEnabled ? 'flex' : 'none';
      if (!state.autoEnabled){
        stopAutoPlay();
      } else if (state.running){
        startAutoPlay();
      }
    });

    function readConfigFromInputs(){
      state.width = Math.max(2, Math.min(64, Math.floor(parseNumberInput(widthInput, state.width))));
      state.height = Math.max(2, Math.min(64, Math.floor(parseNumberInput(heightInput, state.height))));
      state.spawnMode = countRadio.checked ? 'count' : 'ratio';
      state.spawnCount = Math.max(1, Math.floor(parseNumberInput(spawnCountInput, state.spawnCount)));
      state.spawnRatio = Math.max(0, Math.min(1, parseNumberInput(spawnRatioInput, state.spawnRatio)));
      state.dynamicSpawnEnabled = dynamicToggle.checked;
      state.dynamicOffset = Math.floor(parseNumberInput(dynamicOffsetInput, state.dynamicOffset));
      state.mode = modeSelect.value === 'add' ? 'add' : 'multiply';
      state.baseValue = Math.max(1, Math.floor(parseNumberInput(baseValueInput, state.baseValue)));
      state.additionStep = Math.max(1, Math.floor(parseNumberInput(additionStepInput, state.additionStep)));
      state.mergeRequirementEnabled = mergeRequirementToggle.checked;
      state.mergeRequirementCount = Math.max(2, Math.floor(parseNumberInput(mergeRequirementInput, state.mergeRequirementCount)));
      state.autoEnabled = autoToggle.checked;
      state.autoInterval = Math.max(0.1, parseNumberInput(autoIntervalInput, state.autoInterval));
      state.autoStyle = autoModeSelect.value === 'cycle' ? 'cycle' : 'random';
    }

    function resetStats(){
      state.stats.moves = 0;
      state.stats.merges = 0;
      state.stats.highestValue = 0;
      state.stats.lastGain = 0;
      updateStatsUI();
    }

    function updateStatsUI(){
      movesValueEl.textContent = String(state.stats.moves);
      mergesValueEl.textContent = String(state.stats.merges);
      highestValueEl.textContent = String(state.stats.highestValue);
      lastGainValueEl.textContent = String(state.stats.lastGain);
    }

    function initBoard(){
      readConfigFromInputs();
      stopAutoPlay();
      state.board = Array.from({ length: state.height }, () => Array(state.width).fill(null));
      resetStats();
      state.running = true;
      shortcuts?.disableKey('r');
      if (!keyListenerAttached){
        document.addEventListener('keydown', onKeyDown, { passive: false });
        keyListenerAttached = true;
      }
      spawnInitialTiles();
      drawBoard();
      if (state.autoEnabled){
        startAutoPlay();
      }
    }

    function spawnInitialTiles(){
      const initialTiles = Math.min(3, Math.max(1, state.spawnMode === 'count' ? state.spawnCount : Math.max(1, Math.round(state.width * state.height * 0.05))));
      for (let i = 0; i < initialTiles; i++){
        spawnTile();
      }
    }

    function createTile(level = 0, progress = 0){
      return { level, progress };
    }

    function cloneTile(tile){
      return tile ? { level: tile.level, progress: tile.progress || 0 } : null;
    }

    function getTileValue(tile){
      if (!tile) return 0;
      if (state.mode === 'multiply'){
        return Math.pow(state.baseValue, tile.level + 1);
      }
      return state.baseValue + tile.level * state.additionStep;
    }

    function canMerge(tileA, tileB){
      if (!tileA || !tileB) return false;
      return tileA.level === tileB.level;
    }

    function mergeTiles(tileA, tileB){
      const required = state.mergeRequirementEnabled ? Math.max(2, state.mergeRequirementCount) : 1;
      let progress = (tileA.progress || 0) + (tileB.progress || 0) + 1;
      let level = tileA.level;
      let gainedLevels = 0;
      if (required <= 1){
        gainedLevels = 1;
        progress = 0;
      } else {
        gainedLevels = Math.floor(progress / required);
        progress = progress % required;
      }
      level += gainedLevels;
      const mergedTile = { level, progress };
      const value = getTileValue(mergedTile);
      state.stats.merges += 1;
      if (gainedLevels > 0){
        state.stats.lastGain = value;
        awardXp?.(Math.max(1, Math.floor(Math.log(value + 1))), { type: 'merge', gainedLevels });
      } else {
        state.stats.lastGain = `+0/${progress}`;
      }
      if (value > state.stats.highestValue){
        state.stats.highestValue = value;
      }
      return mergedTile;
    }

    function getEmptyCells(){
      const empties = [];
      for (let y = 0; y < state.height; y++){
        for (let x = 0; x < state.width; x++){
          if (!state.board[y][x]) empties.push({ x, y });
        }
      }
      return empties;
    }

    function getHighestTileLevel(){
      let maxLevel = -1;
      const rows = Array.isArray(state.board) ? state.board : [];
      for (let y = 0; y < state.height; y++){
        const row = rows[y];
        for (let x = 0; x < state.width; x++){
          const tile = row?.[x] ?? null;
          if (tile && tile.level > maxLevel){
            maxLevel = tile.level;
          }
        }
      }
      return maxLevel;
    }

    function spawnTile(){
      const empties = getEmptyCells();
      if (!empties.length) return null;
      const { x, y } = empties[(Math.random() * empties.length) | 0];
      let level = 0;
      if (state.dynamicSpawnEnabled){
        const highest = getHighestTileLevel();
        if (highest >= 0){
          const offset = state.dynamicOffset;
          level = Math.max(0, highest + offset);
        }
      }
      state.board[y][x] = createTile(level, 0);
      const value = getTileValue(state.board[y][x]);
      if (value > state.stats.highestValue){
        state.stats.highestValue = value;
      }
      return { x, y };
    }

    function spawnTilesAfterMove(){
      const empties = getEmptyCells();
      if (!empties.length) return [];
      let toSpawn = 1;
      if (state.spawnMode === 'count'){
        toSpawn = Math.max(1, Math.min(empties.length, state.spawnCount));
      } else {
        const ratio = Math.max(0, Math.min(1, state.spawnRatio));
        toSpawn = Math.max(1, Math.min(empties.length, Math.round(empties.length * ratio)));
      }
      const spawned = [];
      for (let i = 0; i < toSpawn; i++){
        const cell = spawnTile();
        if (!cell) break;
        spawned.push(cell);
      }
      return spawned;
    }

    function slideLine(cells){
      const tiles = [];
      for (const cell of cells){
        const tile = state.board[cell.y][cell.x];
        if (tile){
          tiles.push({ tile: cloneTile(tile), cell });
        }
      }
      const resultTiles = [];
      const moveMeta = [];
      let i = 0;
      let moved = false;
      while (i < tiles.length){
        const current = tiles[i].tile;
        const next = tiles[i + 1]?.tile;
        if (next && canMerge(current, next)){
          const merged = mergeTiles(current, next);
          resultTiles.push(merged);
          moveMeta.push({ from: tiles[i].cell, merged: true });
          i += 2;
          moved = true;
        } else {
          resultTiles.push(current);
          moveMeta.push({ from: tiles[i].cell, merged: false });
          i += 1;
        }
      }
      const moves = [];
      for (let idx = 0; idx < cells.length; idx++){
        const cell = cells[idx];
        const tile = resultTiles[idx] || null;
        const existing = state.board[cell.y][cell.x];
        if (!existing && tile){
          moved = true;
        } else if (existing && !tile){
          moved = true;
        } else if (existing && tile){
          if (existing.level !== tile.level || (existing.progress || 0) !== (tile.progress || 0)){
            moved = true;
          }
        }
        state.board[cell.y][cell.x] = tile ? { level: tile.level, progress: tile.progress || 0 } : null;
        if (tile){
          const meta = moveMeta[idx];
          const needsAnimation = meta && (meta.from.x !== cell.x || meta.from.y !== cell.y || meta.merged);
          if (needsAnimation){
            moves.push({
              from: { x: meta.from.x, y: meta.from.y },
              to: { x: cell.x, y: cell.y },
              tile: cloneTile(tile),
              merged: !!meta.merged
            });
          }
        }
      }
      return { moved, moves };
    }

    function handleMove(direction){
      if (!state.running) return;
      const lines = [];
      if (direction === 0 || direction === 2){
        for (let y = 0; y < state.height; y++){
          const line = [];
          if (direction === 0){
            for (let x = 0; x < state.width; x++) line.push({ x, y });
          } else {
            for (let x = state.width - 1; x >= 0; x--) line.push({ x, y });
          }
          lines.push(line);
        }
      } else {
        for (let x = 0; x < state.width; x++){
          const line = [];
          if (direction === 1){
            for (let y = 0; y < state.height; y++) line.push({ x, y });
          } else {
            for (let y = state.height - 1; y >= 0; y--) line.push({ x, y });
          }
          lines.push(line);
        }
      }
      let moved = false;
      const moveAnimations = [];
      for (const line of lines){
        const result = slideLine(line);
        if (result.moved){
          moved = true;
        }
        if (result.moves && result.moves.length){
          moveAnimations.push(...result.moves);
        }
      }
      if (moved){
        state.stats.moves += 1;
        updateStatsUI();
        const spawnedCells = spawnTilesAfterMove();
        const spawnAnimations = [];
        for (const cell of spawnedCells){
          const row = state.board[cell.y];
          const tile = row ? row[cell.x] : null;
          if (tile){
            spawnAnimations.push({
              cell,
              tile: cloneTile(tile)
            });
          }
        }
        const needShuffle = !hasMovesAvailable();
        const finishAnimation = () => {
          if (needShuffle){
            shuffleBoard();
          }
          drawBoard();
        };
        startTileAnimation(moveAnimations, spawnAnimations, finishAnimation);
      }
    }

    function hasMovesAvailable(){
      if (getEmptyCells().length > 0) return true;
      const rows = Array.isArray(state.board) ? state.board : [];
      for (let y = 0; y < state.height; y++){
        const row = rows[y];
        for (let x = 0; x < state.width; x++){
          const tile = row?.[x] ?? null;
          if (!tile) continue;
          const right = x + 1 < state.width ? state.board[y][x + 1] : null;
          const down = y + 1 < state.height ? state.board[y + 1][x] : null;
          if (right && canMerge(tile, right)) return true;
          if (down && canMerge(tile, down)) return true;
        }
      }
      return false;
    }

    function shuffleBoard(){
      const tiles = [];
      for (let y = 0; y < state.height; y++){
        for (let x = 0; x < state.width; x++){
          if (state.board[y][x]){
            tiles.push(cloneTile(state.board[y][x]));
            state.board[y][x] = null;
          }
        }
      }
      for (let i = tiles.length - 1; i > 0; i--){
        const j = (Math.random() * (i + 1)) | 0;
        [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
      }
      let idx = 0;
      for (let y = 0; y < state.height; y++){
        for (let x = 0; x < state.width; x++){
          state.board[y][x] = idx < tiles.length ? tiles[idx++] : null;
        }
      }
    }

    function drawTileVisual(tile, cellX, cellY, innerSize, scale = 1){
      const tileSize = Math.max(1, innerSize * scale);
      const offset = (innerSize - tileSize) / 2;
      const drawX = cellX + offset;
      const drawY = cellY + offset;
      const value = getTileValue(tile);
      const color = tilePalette[tile.level % tilePalette.length];
      boardCtx.fillStyle = color;
      boardCtx.fillRect(drawX, drawY, tileSize, tileSize);
      boardCtx.fillStyle = value >= 1000 ? '#f8fafc' : '#e2e8f0';
      boardCtx.fillText(String(value), drawX + tileSize / 2, drawY + tileSize / 2);
      if (state.mergeRequirementEnabled && state.mergeRequirementCount > 1){
        const progressValue = tile.progress || 0;
        const ratio = Math.min(1, progressValue / state.mergeRequirementCount);
        const barHeight = Math.max(2, Math.floor(8 * Math.max(0.3, scale)));
        const barY = drawY + tileSize - barHeight - 2;
        boardCtx.fillStyle = 'rgba(15,23,42,0.6)';
        boardCtx.fillRect(drawX, barY, tileSize, barHeight);
        boardCtx.fillStyle = 'rgba(248,250,252,0.8)';
        boardCtx.fillRect(drawX, barY, Math.max(0, tileSize * ratio), barHeight);
      }
    }

    function renderBoardFrame(progress = 1){
      const padding = 16;
      const maxSize = 560 - padding * 2;
      const cellSize = Math.max(10, Math.floor(maxSize / Math.max(state.width, state.height)));
      boardCanvas.width = cellSize * state.width + padding * 2;
      boardCanvas.height = cellSize * state.height + padding * 2;
      boardCtx.fillStyle = '#020617';
      boardCtx.fillRect(0, 0, boardCanvas.width, boardCanvas.height);
      boardCtx.font = `${Math.max(10, Math.floor(cellSize * 0.32))}px "Segoe UI", sans-serif`;
      boardCtx.textAlign = 'center';
      boardCtx.textBaseline = 'middle';

      const innerPad = Math.max(2, Math.floor(cellSize * 0.18));
      const innerSize = cellSize - innerPad;
      const cellOffset = innerPad / 2;
      const rows = Array.isArray(state.board) ? state.board : [];
      const isAnimating = animationState.running && progress < 1;
      const skipCells = new Set();
      if (isAnimating){
        for (const move of animationState.tiles){
          skipCells.add(`${move.to.x},${move.to.y}`);
        }
        for (const spawn of animationState.spawnTiles){
          skipCells.add(`${spawn.cell.x},${spawn.cell.y}`);
        }
      }
      for (let y = 0; y < state.height; y++){
        const row = rows[y];
        for (let x = 0; x < state.width; x++){
          const px = padding + x * cellSize;
          const py = padding + y * cellSize;
          const cellX = px + cellOffset;
          const cellY = py + cellOffset;
          boardCtx.fillStyle = '#0f172a';
          boardCtx.fillRect(cellX, cellY, innerSize, innerSize);
          const tile = row?.[x] ?? null;
          if (tile && !(isAnimating && skipCells.has(`${x},${y}`))) {
            drawTileVisual(tile, cellX, cellY, innerSize);
          }
        }
      }
      if (isAnimating){
        const animatedProgress = easeOutCubic(progress);
        for (const move of animationState.tiles){
          const fromX = padding + move.from.x * cellSize + cellOffset;
          const fromY = padding + move.from.y * cellSize + cellOffset;
          const toX = padding + move.to.x * cellSize + cellOffset;
          const toY = padding + move.to.y * cellSize + cellOffset;
          const currentX = fromX + (toX - fromX) * animatedProgress;
          const currentY = fromY + (toY - fromY) * animatedProgress;
          const scale = move.merged ? 1 + 0.15 * Math.sin(Math.PI * animatedProgress) : 1;
          drawTileVisual(move.tile, currentX, currentY, innerSize, scale);
        }
        for (const spawn of animationState.spawnTiles){
          const spawnX = padding + spawn.cell.x * cellSize + cellOffset;
          const spawnY = padding + spawn.cell.y * cellSize + cellOffset;
          const spawnScale = Math.max(0.3, animatedProgress);
          drawTileVisual(spawn.tile, spawnX, spawnY, innerSize, spawnScale);
        }
      }
    }

    function drawBoard(){
      if (animationFrameId != null){
        cancelFrame(animationFrameId);
        animationFrameId = null;
      }
      if (animationState.running){
        animationState.running = false;
        const callback = animationState.onComplete;
        animationState.onComplete = null;
        animationState.tiles = [];
        animationState.spawnTiles = [];
        if (typeof callback === 'function'){
          callback();
          return;
        }
      }
      renderBoardFrame(1);
    }

    function stepAnimationFrame(timestamp){
      if (!animationState.running){
        return;
      }
      const time = typeof timestamp === 'number' ? timestamp : getTimestamp();
      const elapsed = time - animationState.startTime;
      const duration = Math.max(1, animationState.duration || 260);
      const progress = Math.min(1, Math.max(0, elapsed / duration));
      renderBoardFrame(progress);
      if (progress < 1){
        animationFrameId = requestFrame(stepAnimationFrame);
        return;
      }
      animationState.running = false;
      animationFrameId = null;
      const callback = animationState.onComplete;
      animationState.onComplete = null;
      animationState.tiles = [];
      animationState.spawnTiles = [];
      if (typeof callback === 'function'){
        callback();
      } else {
        renderBoardFrame(1);
      }
    }

    function startTileAnimation(moves, spawns, onComplete){
      const tiles = Array.isArray(moves) ? moves.slice() : [];
      const spawnTiles = Array.isArray(spawns) ? spawns.slice() : [];
      if (!tiles.length && !spawnTiles.length){
        if (typeof onComplete === 'function'){
          onComplete();
        } else {
          renderBoardFrame(1);
        }
        return;
      }
      animationState.tiles = tiles;
      animationState.spawnTiles = spawnTiles;
      animationState.startTime = getTimestamp();
      animationState.running = true;
      animationState.onComplete = typeof onComplete === 'function' ? onComplete : null;
      if (animationFrameId != null){
        cancelFrame(animationFrameId);
      }
      animationFrameId = requestFrame(stepAnimationFrame);
    }

    function exportState(){
      const data = {
        version: 1,
        config: {
          width: state.width,
          height: state.height,
          spawnMode: state.spawnMode,
          spawnCount: state.spawnCount,
          spawnRatio: state.spawnRatio,
          dynamicSpawnEnabled: state.dynamicSpawnEnabled,
          dynamicOffset: state.dynamicOffset,
          mode: state.mode,
          baseValue: state.baseValue,
          additionStep: state.additionStep,
          mergeRequirementEnabled: state.mergeRequirementEnabled,
          mergeRequirementCount: state.mergeRequirementCount,
          autoEnabled: state.autoEnabled,
          autoInterval: state.autoInterval,
          autoStyle: state.autoStyle
        },
        board: state.board.map(row => row.map(tile => tile ? { level: tile.level, progress: tile.progress || 0 } : null)),
        stats: { ...state.stats }
      };
      return JSON.stringify(data);
    }

    function importState(json){
      const data = JSON.parse(json);
      if (!data || typeof data !== 'object') throw new Error('Invalid data');
      const cfg = data.config || {};
      widthInput.value = String(cfg.width ?? state.width);
      heightInput.value = String(cfg.height ?? state.height);
      if (cfg.spawnMode === 'ratio'){
        ratioRadio.checked = true;
        countRadio.checked = false;
        spawnCountLabel.style.display = 'none';
        spawnRatioLabel.style.display = 'flex';
      } else {
        countRadio.checked = true;
        ratioRadio.checked = false;
        spawnCountLabel.style.display = 'flex';
        spawnRatioLabel.style.display = 'none';
      }
      spawnCountInput.value = String(cfg.spawnCount ?? state.spawnCount);
      spawnRatioInput.value = String(cfg.spawnRatio ?? state.spawnRatio);
      dynamicToggle.checked = !!cfg.dynamicSpawnEnabled;
      dynamicOffsetInput.value = String(cfg.dynamicOffset ?? state.dynamicOffset);
      dynamicOffsetLabel.style.display = dynamicToggle.checked ? 'flex' : 'none';
      modeSelect.value = cfg.mode === 'add' ? 'add' : 'multiply';
      additionStepLabel.style.display = modeSelect.value === 'add' ? 'flex' : 'none';
      baseValueInput.value = String(cfg.baseValue ?? state.baseValue);
      additionStepInput.value = String(cfg.additionStep ?? state.additionStep);
      mergeRequirementToggle.checked = !!cfg.mergeRequirementEnabled;
      mergeRequirementInput.value = String(cfg.mergeRequirementCount ?? state.mergeRequirementCount);
      mergeRequirementLabel.style.display = mergeRequirementToggle.checked ? 'flex' : 'none';
      autoToggle.checked = !!cfg.autoEnabled;
      autoIntervalInput.value = String(cfg.autoInterval ?? state.autoInterval);
      autoModeSelect.value = cfg.autoStyle === 'cycle' ? 'cycle' : 'random';
      autoIntervalLabel.style.display = autoToggle.checked ? 'flex' : 'none';
      autoModeLabel.style.display = autoToggle.checked ? 'flex' : 'none';

      readConfigFromInputs();
      state.board = (data.board || []).map(row => {
        const source = Array.isArray(row) ? row : [];
        return Array.from({ length: state.width }, (_, x) => {
          const tile = source[x];
          if (!tile || typeof tile !== 'object') return null;
          return { level: tile.level | 0, progress: tile.progress | 0 };
        });
      });
      while (state.board.length < state.height){
        state.board.push(Array(state.width).fill(null));
      }
      state.board = state.board.slice(0, state.height);

      if (!Array.isArray(data.board)){
        state.board = Array.from({ length: state.height }, () => Array(state.width).fill(null));
      }

      state.stats = { ...state.stats, ...(data.stats || {}) };
      updateStatsUI();
      drawBoard();
      shortcuts?.disableKey('r');
      if (!keyListenerAttached){
        document.addEventListener('keydown', onKeyDown, { passive: false });
        keyListenerAttached = true;
      }
      stopAutoPlay();
      state.running = true;
      if (state.autoEnabled){
        startAutoPlay();
      }
    }

    function startAutoPlay(){
      stopAutoPlay();
      if (!state.autoEnabled) return;
      state.autoCycleIndex = 0;
      const interval = Math.max(0.1, state.autoInterval) * 1000;
      state.autoTimer = setInterval(() => {
        if (!state.running) return;
        if (state.autoStyle === 'cycle'){
          const dir = state.autoCycleIndex % 4;
          state.autoCycleIndex += 1;
          handleMove(dir);
        } else {
          const dir = (Math.random() * 4) | 0;
          handleMove(dir);
        }
      }, interval);
    }

    function stopAutoPlay(){
      if (state.autoTimer){
        clearInterval(state.autoTimer);
        state.autoTimer = null;
      }
    }

    function exportToTextarea(){
      try {
        const json = exportState();
        dataArea.value = json;
      } catch (error){
        dataArea.value = `// Export failed: ${error.message}`;
      }
    }

    function importFromTextarea(){
      try {
        importState(dataArea.value);
      } catch (error){
        dataArea.value = `// Import failed: ${error.message}`;
      }
    }

    function clearBoard(){
      initBoard();
    }

    function onKeyDown(event){
      if (!state.running) return;
      const map = { ArrowLeft: 0, ArrowUp: 1, ArrowRight: 2, ArrowDown: 3 };
      if (map[event.code] != null){
        event.preventDefault();
        handleMove(map[event.code]);
      }
    }

    startButton.addEventListener('click', () => {
      initBoard();
      updateStatsUI();
    });
    resetButton.addEventListener('click', () => {
      clearBoard();
    });
    shuffleButton.addEventListener('click', () => {
      shuffleBoard();
      drawBoard();
    });
    exportButton.addEventListener('click', exportToTextarea);
    importButton.addEventListener('click', importFromTextarea);

    function start(){
      initBoard();
      updateStatsUI();
      drawBoard();
    }

    function stop(){
      state.running = false;
      stopAutoPlay();
      shortcuts?.enableKey('r');
      if (keyListenerAttached){
        document.removeEventListener('keydown', onKeyDown);
        keyListenerAttached = false;
      }
    }

    function destroy(){
      try { stop(); } catch (error){ console.warn(error); }
      if (detachLocale){
        try { detachLocale(); } catch (error){ console.warn(error); }
        detachLocale = null;
      }
      try { container.remove(); } catch {}
    }

    function getScore(){
      return state.stats.highestValue;
    }

    updateStatsUI();
    drawBoard();

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({
    id: 'sandbox_fusion_numbers',
    name: 'サンドボックス融合数字',
    nameKey: 'selection.miniexp.games.sandbox_fusion_numbers.name',
    description: '自由な盤面と融合ルールで遊ぶ拡張2048。シャッフル・自動操作・インポート対応',
    descriptionKey: 'selection.miniexp.games.sandbox_fusion_numbers.description',
    version: '0.1.0',
    categoryIds: ['puzzle'],
    categories: ['パズル'],
    author: 'mod',
    create
  });
})();

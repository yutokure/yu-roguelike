(function(){
  const STORAGE_KEY = 'blockcode_projects_v1';
  const MAX_RECENTS = 10;
  const XP_STATE_KEY = 'blockcode_xp_state_v1';
  const WORKER_HEARTBEAT_MS = 5000;
  const BLOCK_BUILD_XP_INTERVAL = 5;

  const BC_I18N_PREFIX = 'selection.miniexp.games.blockcode';
  const I18N = typeof window !== 'undefined' ? window.I18n : null;

  function computeFallbackText(fallback) {
    if (typeof fallback === 'function') {
      try {
        const result = fallback();
        return typeof result === 'string' ? result : (result ?? '');
      } catch (error) {
        console.warn('[blockcode] Failed to evaluate fallback text:', error);
        return '';
      }
    }
    return fallback ?? '';
  }

  function translateText(key, fallback, params) {
    if (key && I18N && typeof I18N.t === 'function') {
      try {
        const translated = I18N.t(key, params);
        if (typeof translated === 'string' && translated !== key) {
          return translated;
        }
      } catch (error) {
        console.warn('[blockcode] Failed to translate key:', key, error);
      }
    }
    return computeFallbackText(fallback);
  }

  function translateBlockcode(path, fallback, params) {
    const key = path ? `${BC_I18N_PREFIX}.${path}` : BC_I18N_PREFIX;
    return translateText(key, fallback, params);
  }

  const BLOCK_DEFS = [
    {
      id: 'whenGameStarts',
      category: 'events',
      type: 'hat',
      label: 'ゲーム開始時',
      labelKey: `${BC_I18N_PREFIX}.blocks.whenGameStarts.label`,
      description: 'プロジェクト開始時に実行されるイベントハンドラー',
      descriptionKey: `${BC_I18N_PREFIX}.blocks.whenGameStarts.description`
    },
    {
      id: 'whenKeyPressed',
      category: 'events',
      type: 'hat',
      label: 'キー {key} が押されたとき',
      labelKey: `${BC_I18N_PREFIX}.blocks.whenKeyPressed.label`,
      description: '指定キー押下時に呼び出されます',
      descriptionKey: `${BC_I18N_PREFIX}.blocks.whenKeyPressed.description`,
      inputs: {
        key: {
          type: 'string',
          default: 'Space',
          placeholder: 'Key',
          placeholderKey: `${BC_I18N_PREFIX}.blocks.whenKeyPressed.inputs.key.placeholder`
        }
      }
    },
    {
      id: 'movePlayer',
      category: 'actions',
      type: 'statement',
      label: 'プレイヤーを {steps} マス移動',
      labelKey: `${BC_I18N_PREFIX}.blocks.movePlayer.label`,
      description: 'サンドボックスプレイヤーを移動します',
      descriptionKey: `${BC_I18N_PREFIX}.blocks.movePlayer.description`,
      inputs: {
        steps: { type: 'number', default: 1, min: -20, max: 20 }
      }
    },
    {
      id: 'setTile',
      category: 'actions',
      type: 'statement',
      label: 'タイル ({x}, {y}) を {color} にする',
      labelKey: `${BC_I18N_PREFIX}.blocks.setTile.label`,
      description: 'ステージタイルの色を変更',
      descriptionKey: `${BC_I18N_PREFIX}.blocks.setTile.description`,
      inputs: {
        x: { type: 'number', default: 0, min: 0, max: 9 },
        y: { type: 'number', default: 0, min: 0, max: 9 },
        color: {
          type: 'string',
          default: '#38bdf8',
          placeholder: '#RRGGBB',
          placeholderKey: `${BC_I18N_PREFIX}.blocks.setTile.inputs.color.placeholder`
        }
      }
    },
    {
      id: 'waitSeconds',
      category: 'control',
      type: 'statement',
      label: '{seconds} 秒待つ',
      labelKey: `${BC_I18N_PREFIX}.blocks.waitSeconds.label`,
      description: '指定秒数待機',
      descriptionKey: `${BC_I18N_PREFIX}.blocks.waitSeconds.description`,
      inputs: {
        seconds: { type: 'number', default: 1, min: 0, step: 0.1 }
      }
    },
    {
      id: 'repeatTimes',
      category: 'control',
      type: 'statement',
      label: '{count} 回繰り返す',
      labelKey: `${BC_I18N_PREFIX}.blocks.repeatTimes.label`,
      description: '指定回数繰り返します',
      descriptionKey: `${BC_I18N_PREFIX}.blocks.repeatTimes.description`,
      inputs: {
        count: { type: 'number', default: 4, min: 0, max: 999 }
      },
      hasChild: true
    },
    {
      id: 'foreverLoop',
      category: 'control',
      type: 'statement',
      label: 'ずっと繰り返す',
      labelKey: `${BC_I18N_PREFIX}.blocks.foreverLoop.label`,
      description: '一定回数制限付きで繰り返します',
      descriptionKey: `${BC_I18N_PREFIX}.blocks.foreverLoop.description`,
      hasChild: true
    },
    {
      id: 'ifCondition',
      category: 'control',
      type: 'statement',
      label: 'もし {condition} なら',
      labelKey: `${BC_I18N_PREFIX}.blocks.ifCondition.label`,
      description: '条件成立時に実行します',
      descriptionKey: `${BC_I18N_PREFIX}.blocks.ifCondition.description`,
      inputs: {
        condition: {
          type: 'string',
          default: 'true',
          placeholder: '条件式 (例: score > 5)',
          placeholderKey: `${BC_I18N_PREFIX}.blocks.ifCondition.inputs.condition.placeholder`
        }
      },
      hasChild: true,
      hasElse: true
    },
    {
      id: 'logMessage',
      category: 'utility',
      type: 'statement',
      label: 'ログ: {message}',
      labelKey: `${BC_I18N_PREFIX}.blocks.logMessage.label`,
      description: 'ログタブにメッセージを出力',
      descriptionKey: `${BC_I18N_PREFIX}.blocks.logMessage.description`,
      inputs: {
        message: {
          type: 'string',
          default: 'Hello MiniExp!',
          defaultKey: `${BC_I18N_PREFIX}.blocks.logMessage.inputs.message.default`
        }
      }
    },
    {
      id: 'awardXp',
      category: 'utility',
      type: 'statement',
      label: 'XP {amount} を獲得',
      labelKey: `${BC_I18N_PREFIX}.blocks.awardXp.label`,
      description: 'XPを獲得します',
      descriptionKey: `${BC_I18N_PREFIX}.blocks.awardXp.description`,
      inputs: {
        amount: { type: 'number', default: 2, min: -100, max: 1000 }
      }
    },
    {
      id: 'setVariable',
      category: 'variables',
      type: 'statement',
      label: '変数 {variable} を {value} にする',
      labelKey: `${BC_I18N_PREFIX}.blocks.setVariable.label`,
      description: '変数へ値を代入',
      descriptionKey: `${BC_I18N_PREFIX}.blocks.setVariable.description`,
      inputs: {
        variable: { type: 'variable' },
        value: {
          type: 'string',
          default: '0',
          placeholder: '値または式',
          placeholderKey: `${BC_I18N_PREFIX}.blocks.setVariable.inputs.value.placeholder`
        }
      }
    },
    {
      id: 'changeVariable',
      category: 'variables',
      type: 'statement',
      label: '変数 {variable} を {delta} ずつ変える',
      labelKey: `${BC_I18N_PREFIX}.blocks.changeVariable.label`,
      description: '変数を増減',
      descriptionKey: `${BC_I18N_PREFIX}.blocks.changeVariable.description`,
      inputs: {
        variable: { type: 'variable' },
        delta: { type: 'string', default: '1' }
      }
    },
    {
      id: 'broadcast',
      category: 'events',
      type: 'statement',
      label: 'ブロードキャスト {channel}',
      labelKey: `${BC_I18N_PREFIX}.blocks.broadcast.label`,
      description: '仮想イベントを発火します',
      descriptionKey: `${BC_I18N_PREFIX}.blocks.broadcast.description`,
      inputs: {
        channel: { type: 'string', default: 'signal1' }
      }
    },
    {
      id: 'stopAll',
      category: 'control',
      type: 'statement',
      label: 'すべて停止する',
      labelKey: `${BC_I18N_PREFIX}.blocks.stopAll.label`,
      description: '実行を停止します',
      descriptionKey: `${BC_I18N_PREFIX}.blocks.stopAll.description`
    }
  ];

  const CATEGORY_DEFS = {
    events: { key: `${BC_I18N_PREFIX}.categories.events`, fallback: 'イベント' },
    actions: { key: `${BC_I18N_PREFIX}.categories.actions`, fallback: 'アクション' },
    control: { key: `${BC_I18N_PREFIX}.categories.control`, fallback: '制御' },
    variables: { key: `${BC_I18N_PREFIX}.categories.variables`, fallback: '変数' },
    utility: { key: `${BC_I18N_PREFIX}.categories.utility`, fallback: 'ユーティリティ' }
  };

  const VARIABLE_TYPE_DEFS = {
    number: { key: `${BC_I18N_PREFIX}.ui.variableTypes.number`, fallback: '数値' },
    string: { key: `${BC_I18N_PREFIX}.ui.variableTypes.string`, fallback: '文字列' },
    boolean: { key: `${BC_I18N_PREFIX}.ui.variableTypes.boolean`, fallback: '真偽' }
  };

  let uidCounter = 1;

  function getCategoryLabel(category) {
    const def = CATEGORY_DEFS[category];
    return translateText(def?.key, def?.fallback || category);
  }

  function getVariableTypeLabel(type) {
    const def = VARIABLE_TYPE_DEFS[type];
    return translateText(def?.key, def?.fallback || type);
  }

  function getBlockLabel(def) {
    return translateText(def.labelKey, def.label || def.id);
  }

  function getBlockDescription(def) {
    return translateText(def.descriptionKey, def.description || '');
  }

  function getInputPlaceholder(spec) {
    if (!spec) return '';
    return translateText(spec.placeholderKey, spec.placeholder || '');
  }

  function getInputDefault(spec) {
    if (!spec) return '';
    return translateText(spec.defaultKey, spec.default ?? '');
  }

  function getVariablePlaceholderLabel() {
    return translateBlockcode('ui.variableSelect.placeholder', '-- 変数 --');
  }

  function getElseLabel() {
    return translateBlockcode('ui.workspace.elseLabel', 'そうでなければ');
  }

  function getStagePlaceholderMessage() {
    return translateBlockcode('ui.stage.placeholder', 'ブロックを組み立てて実行ボタンを押してください。');
  }

  function getStatusLabel(running) {
    return running
      ? translateBlockcode('ui.status.running', '実行中')
      : translateBlockcode('ui.status.stopped', '停止中');
  }

  function getToolbarSnapLabel(enabled) {
    return enabled
      ? translateBlockcode('ui.toolbar.snapOn', 'スナップ: ON')
      : translateBlockcode('ui.toolbar.snapOff', 'スナップ: OFF');
  }

  function getToolbarSpeedLabel(value) {
    return translateBlockcode('ui.toolbar.speedLabel', () => `速度 ${value.toFixed(2)}x`, { value: value.toFixed(2) });
  }

  function getDefaultProjectName() {
    return translateBlockcode('defaults.projectName', '新規プロジェクト');
  }

  function getSummaryText(state, blockCount, variableCount) {
    return translateBlockcode(
      'ui.summary',
      () => `${state.project.name} · ブロック ${blockCount} · 変数 ${variableCount}`,
      { name: state.project.name, blocks: blockCount, variables: variableCount }
    );
  }

  function getXpBadgeText(value) {
    return translateBlockcode('ui.badges.xp', () => `XP ${value}`, { value });
  }

  function getXpChangeText(amount) {
    const sign = amount >= 0 ? '+' : '';
    return translateBlockcode('ui.messages.xpChange', () => `XP ${sign}${amount}`, { amount, sign });
  }

  function formatVariableEntry(name, value) {
    return translateBlockcode('ui.variableList.entry', () => `${name}: ${value}`, { name, value });
  }
  function nextUid(){
    return 'bc_' + (uidCounter++);
  }

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function normalizeProject(project){
    if (!project || typeof project !== 'object') {
      return createBlankProject();
    }
    return {
      id: project.id || 'project-' + Date.now(),
      name: typeof project.name === 'string' && project.name.trim() ? project.name.trim() : getDefaultProjectName(),
      createdAt: Number.isFinite(project.createdAt) ? project.createdAt : Date.now(),
      updatedAt: Date.now(),
      blocks: Array.isArray(project.blocks) ? project.blocks.map(normalizeBlock).filter(Boolean) : [],
      variables: Array.isArray(project.variables) ? project.variables.map(normalizeVariable).filter(Boolean) : [],
      metadata: project.metadata && typeof project.metadata === 'object' ? {
        description: typeof project.metadata.description === 'string' ? project.metadata.description : '',
        tags: Array.isArray(project.metadata.tags) ? project.metadata.tags.filter(t => typeof t === 'string') : []
      } : { description: '', tags: [] }
    };
  }

  function normalizeVariable(v){
    if (!v || typeof v !== 'object') return null;
    const name = typeof v.name === 'string' ? v.name.trim() : '';
    if (!name) return null;
    return {
      id: v.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'var-' + Math.random().toString(36).slice(2)),
      name,
      type: v.type === 'string' || v.type === 'boolean' ? v.type : 'number',
      initialValue: typeof v.initialValue === 'string' || typeof v.initialValue === 'number' || typeof v.initialValue === 'boolean'
        ? v.initialValue : 0
    };
  }

  function normalizeBlock(block){
    if (!block || typeof block !== 'object') return null;
    const def = BLOCK_DEFS.find(d => d.id === block.defId);
    if (!def) return null;
    const inputs = {};
    if (def.inputs) {
      for (const key of Object.keys(def.inputs)) {
        const spec = def.inputs[key];
        const raw = block.inputs && Object.prototype.hasOwnProperty.call(block.inputs, key) ? block.inputs[key] : undefined;
        if (spec.type === 'number') {
          const num = Number(raw);
          inputs[key] = Number.isFinite(num) ? num : (typeof spec.default === 'number' ? spec.default : 0);
        } else if (spec.type === 'variable') {
          inputs[key] = typeof raw === 'string' ? raw : '';
        } else {
          const defaultValue = getInputDefault(spec);
          inputs[key] = typeof raw === 'string' ? raw : defaultValue;
        }
      }
    }
    return {
      uid: block.uid || nextUid(),
      defId: def.id,
      inputs,
      child: Array.isArray(block.child) ? block.child.map(normalizeBlock).filter(Boolean) : [],
      elseChild: Array.isArray(block.elseChild) ? block.elseChild.map(normalizeBlock).filter(Boolean) : []
    };
  }

  function createBlankProject(){
    return {
      id: 'project-' + Date.now(),
      name: getDefaultProjectName(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      blocks: [
        {
          uid: nextUid(),
          defId: 'whenGameStarts',
          inputs: {},
          child: []
        }
      ],
      variables: [
        { id: 'var-score', name: 'score', type: 'number', initialValue: 0 }
      ],
      metadata: { description: '', tags: [] }
    };
  }

  function syncUidCounter(project){
    let max = uidCounter;
    function walk(list){
      list.forEach(block => {
        if (block.uid) {
          const m = /bc_(\d+)/.exec(block.uid);
          if (m) {
            const n = Number(m[1]);
            if (Number.isFinite(n) && n > max) max = n;
          }
        }
        if (block.child) walk(block.child);
        if (block.elseChild) walk(block.elseChild);
      });
    }
    if (project && Array.isArray(project.blocks)) walk(project.blocks);
    uidCounter = Math.max(uidCounter, max + 1);
  }

  function loadStoredProjects(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map(normalizeProject)
        .slice(0, MAX_RECENTS);
    } catch {
      return [];
    }
  }

  function saveStoredProjects(projects){
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects.slice(0, MAX_RECENTS)));
    } catch {}
  }

  function persistProject(project){
    const list = loadStoredProjects();
    const idx = list.findIndex(p => p.id === project.id);
    const entry = normalizeProject(project);
    if (idx >= 0) {
      list.splice(idx, 1);
    }
    list.unshift(entry);
    saveStoredProjects(list);
  }

  function loadXpState(){
    try {
      const raw = localStorage.getItem(XP_STATE_KEY);
      if (!raw) return { total: 0 };
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return { total: 0 };
      return {
        total: Number.isFinite(parsed.total) ? parsed.total : 0
      };
    } catch {
      return { total: 0 };
    }
  }

  function persistXpState(state){
    try {
      localStorage.setItem(XP_STATE_KEY, JSON.stringify(state));
    } catch {}
  }

  function formatDateTime(ts){
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return String(ts);
    }
  }

  function formatSavedProjectOption(project){
    const updatedAt = formatDateTime(project.updatedAt);
    return translateBlockcode(
      'ui.load.projectOption',
      () => `${project.name} (${updatedAt})`,
      { name: project.name, updatedAt }
    );
  }

  function createStyle(){
    const existing = document.querySelector('style[data-blockcode-style="1"]');
    if (existing) return () => {};
    const style = document.createElement('style');
    style.dataset.blockcodeStyle = '1';
    style.textContent = `
      .blockcode-root { width: 100%; height: 100%; display: flex; flex-direction: column; font-family: "Segoe UI", "Hiragino Sans", sans-serif; color: #0f172a; }
      .blockcode-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; background: linear-gradient(120deg, #1e3a8a, #2563eb); color: #f8fafc; }
      .blockcode-header-left { display: flex; flex-direction: column; }
      .blockcode-header-title { font-size: 18px; font-weight: 600; }
      .blockcode-header-sub { font-size: 12px; opacity: 0.75; }
      .blockcode-header-controls { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
      .blockcode-btn { border: none; border-radius: 8px; padding: 6px 12px; font-size: 13px; cursor: pointer; background: rgba(15,23,42,0.12); color: inherit; transition: background 0.2s ease; }
      .blockcode-btn:hover { background: rgba(255,255,255,0.2); }
      .blockcode-btn.primary { background: #facc15; color: #1f2937; font-weight: 600; }
      .blockcode-btn.primary:hover { background: #fde047; }
      .blockcode-status { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
      .blockcode-badge { padding: 4px 10px; border-radius: 999px; background: rgba(15,23,42,0.2); font-size: 12px; }
      .blockcode-running { background: rgba(34,197,94,0.25); color: #bbf7d0; }
      .blockcode-body { flex: 1; display: flex; min-height: 0; background: linear-gradient(135deg, rgba(248,250,252,0.85), rgba(226,232,240,0.6)); }
      .blockcode-library { width: 240px; display: flex; flex-direction: column; border-right: 1px solid rgba(148,163,184,0.4); backdrop-filter: blur(8px); }
      .blockcode-catlist { display: flex; flex-wrap: wrap; gap: 6px; padding: 12px; }
      .blockcode-catbtn { flex: 1 1 45%; border-radius: 8px; border: 1px solid rgba(59,130,246,0.35); padding: 6px 8px; font-size: 12px; background: rgba(59,130,246,0.08); color: #1d4ed8; cursor: pointer; transition: transform 0.2s ease, background 0.2s ease; }
      .blockcode-catbtn.active { background: #1d4ed8; color: #f8fafc; box-shadow: 0 8px 14px rgba(29,78,216,0.3); }
      .blockcode-blocklist { flex: 1; overflow: auto; padding: 0 12px 12px; display: flex; flex-direction: column; gap: 8px; }
      .blockcode-blocklist::-webkit-scrollbar { width: 8px; }
      .blockcode-blocklist::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.4); border-radius: 999px; }
      .bc-lib-block { border-radius: 12px; padding: 10px; background: rgba(37,99,235,0.08); color: #1e3a8a; border: 1px solid rgba(37,99,235,0.22); font-size: 12px; cursor: grab; box-shadow: inset 0 0 0 1px rgba(148,163,184,0.2); }
      .bc-lib-block:active { cursor: grabbing; }
      .bc-lib-desc { margin-top: 6px; font-size: 11px; color: #475569; }
      .blockcode-center { flex: 1; display: flex; flex-direction: column; min-width: 0; }
      .blockcode-canvas { flex: 1; overflow: auto; padding: 16px; position: relative; }
      .blockcode-canvas::before { content: ""; position: absolute; inset: 0; background-image: radial-gradient(circle at 1px 1px, rgba(148,163,184,0.28) 0, rgba(148,163,184,0.28) 1px, transparent 1px, transparent 32px); background-size: 32px 32px; opacity: 0.6; pointer-events: none; transition: opacity 0.2s ease; }
      .blockcode-canvas.hide-grid::before { opacity: 0; }
      .blockcode-stack { position: relative; min-height: 100%; }
      .bc-dropzone { height: 14px; border-radius: 7px; margin: 6px 12px; border: 1px dashed transparent; transition: background 0.1s ease, border-color 0.1s ease; }
      .bc-dropzone.active { border-color: rgba(99,102,241,0.55); background: rgba(129,140,248,0.2); }
      .bc-block { position: relative; min-width: 220px; max-width: 480px; margin: 6px 0; padding: 10px 14px; border-radius: 18px; background: linear-gradient(120deg, rgba(59,130,246,0.86), rgba(59,130,246,0.65)); color: #e0f2fe; box-shadow: 0 14px 28px rgba(59,130,246,0.25); cursor: grab; }
      .bc-block[data-type="hat"] { background: linear-gradient(130deg, rgba(251,146,60,0.92), rgba(244,114,182,0.82)); color: #fff7ed; padding-top: 16px; border-top-left-radius: 28px; border-top-right-radius: 28px; }
      .bc-block.dragging { opacity: 0.45; }
      .bc-block-header { display: flex; align-items: center; gap: 8px; font-weight: 600; margin-bottom: 4px; }
      .bc-block-controls { margin-left: auto; display: flex; gap: 6px; }
      .bc-block-controls button { border: none; background: rgba(15,23,42,0.2); color: inherit; border-radius: 6px; width: 20px; height: 20px; cursor: pointer; font-size: 11px; }
      .bc-block-body { font-size: 13px; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
      .bc-input { border: none; border-radius: 6px; padding: 3px 6px; font-size: 12px; min-width: 48px; }
      .bc-input[type="number"] { width: 64px; }
      .bc-input-variable { border: 1px solid rgba(30,64,175,0.45); background: rgba(191,219,254,0.9); }
      .bc-substack { margin-top: 8px; margin-left: 28px; padding-left: 12px; border-left: 3px dashed rgba(148,163,184,0.4); }
      .bc-else-label { margin-top: 10px; font-size: 12px; opacity: 0.8; margin-left: 8px; }
      .blockcode-right { width: 320px; border-left: 1px solid rgba(148,163,184,0.35); display: flex; flex-direction: column; backdrop-filter: blur(12px); background: rgba(15,23,42,0.08); }
      .blockcode-stage { flex: 1; display: flex; flex-direction: column; }
      .blockcode-stage canvas { width: 100%; height: 240px; background: #0f172a; border-bottom: 1px solid rgba(148,163,184,0.3); }
      .blockcode-stage-placeholder { flex: 1; display: flex; align-items: center; justify-content: center; color: #475569; font-size: 13px; padding: 16px; text-align: center; }
      .blockcode-tabs { display: flex; padding: 8px; gap: 6px; }
      .blockcode-tabbtn { flex: 1; border: none; border-radius: 8px; padding: 6px 8px; font-size: 12px; cursor: pointer; background: rgba(148,163,184,0.25); color: #1e293b; }
      .blockcode-tabbtn.active { background: rgba(59,130,246,0.35); color: #1e3a8a; }
      .blockcode-tabpanel { flex: 1; padding: 12px; overflow: auto; font-size: 12px; }
      .blockcode-tabpanel pre { white-space: pre-wrap; word-break: break-word; font-family: "Fira Code", "Consolas", monospace; }
      .blockcode-toolbar { display: flex; align-items: center; gap: 10px; padding: 10px 16px; border-top: 1px solid rgba(148,163,184,0.35); background: rgba(248,250,252,0.85); }
      .blockcode-toolbar button { border: none; border-radius: 8px; background: rgba(148,163,184,0.35); padding: 6px 10px; cursor: pointer; font-size: 12px; color: #1f2937; }
      .blockcode-toolbar button:hover { background: rgba(148,163,184,0.55); }
      .blockcode-slider { display: flex; align-items: center; gap: 6px; font-size: 12px; margin-left: auto; }
      .blockcode-modal-backdrop { position: absolute; inset: 0; background: rgba(15,23,42,0.45); display: flex; align-items: center; justify-content: center; z-index: 40; }
      .blockcode-modal { width: min(420px, 92%); background: #f8fafc; border-radius: 16px; box-shadow: 0 24px 48px rgba(15,23,42,0.35); padding: 20px; display: flex; flex-direction: column; gap: 12px; }
      .blockcode-modal h3 { margin: 0; font-size: 18px; color: #1e3a8a; }
      .blockcode-modal footer { display: flex; justify-content: flex-end; gap: 10px; }
      .blockcode-modal textarea { min-height: 160px; font-family: "Fira Code", monospace; font-size: 12px; padding: 12px; border-radius: 12px; border: 1px solid rgba(148,163,184,0.5); }
      .blockcode-variable-list { padding: 12px; border-top: 1px solid rgba(148,163,184,0.35); display: flex; flex-direction: column; gap: 8px; font-size: 12px; background: rgba(255,255,255,0.75); }
      .blockcode-variable-list button { align-self: flex-start; border: none; border-radius: 8px; padding: 4px 8px; background: rgba(59,130,246,0.16); color: #1d4ed8; cursor: pointer; font-size: 12px; }
      .blockcode-variable-item { display: flex; justify-content: space-between; gap: 12px; background: rgba(148,163,184,0.25); padding: 6px 10px; border-radius: 8px; }
      .blockcode-variable-item span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .blockcode-highlight { box-shadow: 0 0 0 3px rgba(129,140,248,0.75), 0 18px 28px rgba(99,102,241,0.35); }
      .blockcode-logline { margin-bottom: 6px; }
      .blockcode-logline.warn { color: #b45309; }
      .blockcode-logline.error { color: #dc2626; }
    `;
    document.head.appendChild(style);
    return () => {
      if (style.parentNode) style.parentNode.removeChild(style);
    };
  }

  function renderBlockLabel(def, block, variableNames){
    const text = getBlockLabel(def);
    if (!def.inputs) return [document.createTextNode(text)];
    const fragments = [];
    const parts = text.split(/\{([^}]+)\}/g);
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        if (parts[i]) fragments.push(document.createTextNode(parts[i]));
      } else {
        const key = parts[i];
        const spec = def.inputs[key];
        if (!spec) {
          fragments.push(document.createTextNode('{' + key + '}'));
          continue;
        }
        const value = block.inputs?.[key];
        if (spec.type === 'number') {
          const input = document.createElement('input');
          input.type = 'number';
          input.className = 'bc-input';
          if (typeof spec.min === 'number') input.min = String(spec.min);
          if (typeof spec.max === 'number') input.max = String(spec.max);
          if (typeof spec.step === 'number') input.step = String(spec.step);
          input.value = value ?? spec.default ?? 0;
          input.addEventListener('change', () => {
            block.inputs[key] = Number(input.value);
            block.inputs[key] = Number.isFinite(block.inputs[key]) ? block.inputs[key] : (spec.default ?? 0);
          });
          fragments.push(input);
        } else if (spec.type === 'variable') {
          const select = document.createElement('select');
          select.className = 'bc-input bc-input-variable';
          const opt = document.createElement('option');
          opt.value = '';
          opt.textContent = getVariablePlaceholderLabel();
          select.appendChild(opt);
          variableNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            select.appendChild(option);
          });
          select.value = typeof value === 'string' ? value : '';
          select.addEventListener('change', () => {
            block.inputs[key] = select.value;
          });
          fragments.push(select);
        } else {
          const input = document.createElement('input');
          input.type = 'text';
          input.className = 'bc-input';
          const placeholder = getInputPlaceholder(spec);
          if (placeholder) input.placeholder = placeholder;
          input.value = typeof value === 'string' ? value : getInputDefault(spec);
          input.addEventListener('change', () => {
            block.inputs[key] = input.value;
          });
          fragments.push(input);
        }
      }
    }
    return fragments;
  }

  function createDropZone(state, parentUid, target, index){
    const zone = document.createElement('div');
    zone.className = 'bc-dropzone';
    zone.dataset.parent = parentUid || 'root';
    zone.dataset.target = target || 'root';
    zone.dataset.index = String(index ?? 0);
    zone.addEventListener('dragover', (e) => {
      if (!state.dragData) return;
      const def = BLOCK_DEFS.find(d => d.id === state.dragData.defId);
      if (!def) return;
      if (zone.dataset.parent === 'root' && def.type !== 'hat') return;
      if (zone.dataset.parent !== 'root' && def.type === 'hat') return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = state.dragData.source === 'library' ? 'copy' : 'move';
      zone.classList.add('active');
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('active'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('active');
      handleDrop(state, zone);
    });
    return zone;
  }

  function renderBlock(state, block, container, variableNames){
    const def = BLOCK_DEFS.find(d => d.id === block.defId);
    if (!def) return;
    const blockEl = document.createElement('div');
    blockEl.className = 'bc-block';
    blockEl.dataset.uid = block.uid;
    blockEl.dataset.type = def.type;
    blockEl.draggable = true;
    const header = document.createElement('div');
    header.className = 'bc-block-header';
    const title = document.createElement('span');
    title.textContent = getCategoryLabel(def.category);
    header.appendChild(title);
    const controls = document.createElement('div');
    controls.className = 'bc-block-controls';
    const dupBtn = document.createElement('button');
    dupBtn.type = 'button';
    dupBtn.textContent = '⧉';
    dupBtn.title = translateBlockcode('ui.buttons.duplicate', '複製');
    dupBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      duplicateBlock(state, block.uid);
    });
    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.textContent = '×';
    delBtn.title = translateBlockcode('ui.buttons.delete', '削除');
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteBlock(state, block.uid);
    });
    controls.appendChild(dupBtn);
    controls.appendChild(delBtn);
    header.appendChild(controls);
    blockEl.appendChild(header);
    const body = document.createElement('div');
    body.className = 'bc-block-body';
    renderBlockLabel(def, block, variableNames).forEach(node => body.appendChild(node));
    blockEl.appendChild(body);
    if (def.hasChild) {
      const sub = document.createElement('div');
      sub.className = 'bc-substack';
      sub.appendChild(createDropZone(state, block.uid, 'then', 0));
      block.child?.forEach((childBlock, idx) => {
        renderBlock(state, childBlock, sub, variableNames);
        sub.appendChild(createDropZone(state, block.uid, 'then', idx + 1));
      });
      blockEl.appendChild(sub);
    }
    if (def.hasElse) {
      const elseLabel = document.createElement('div');
      elseLabel.className = 'bc-else-label';
      elseLabel.textContent = getElseLabel();
      blockEl.appendChild(elseLabel);
      const subElse = document.createElement('div');
      subElse.className = 'bc-substack';
      subElse.appendChild(createDropZone(state, block.uid, 'else', 0));
      block.elseChild?.forEach((childBlock, idx) => {
        renderBlock(state, childBlock, subElse, variableNames);
        subElse.appendChild(createDropZone(state, block.uid, 'else', idx + 1));
      });
      blockEl.appendChild(subElse);
    }
    blockEl.addEventListener('dragstart', (e) => {
      blockEl.classList.add('dragging');
      state.dragData = { source: 'workspace', uid: block.uid, defId: block.defId };
      if (e.dataTransfer) {
        e.dataTransfer.setData('text/plain', block.uid);
        e.dataTransfer.effectAllowed = 'move';
      }
    });
    blockEl.addEventListener('dragend', () => {
      blockEl.classList.remove('dragging');
      state.dragData = null;
    });
    blockEl.addEventListener('click', () => {
      state.selectedBlock = block.uid;
      state.highlightBlockUid = block.uid;
      highlightSelection(state);
    });
    container.appendChild(blockEl);
  }

  function highlightSelection(state){
    if (!state.workspaceRoot) return;
    state.workspaceRoot.querySelectorAll('.bc-block').forEach(node => {
      if (node.dataset.uid === state.highlightBlockUid) node.classList.add('blockcode-highlight');
      else node.classList.remove('blockcode-highlight');
    });
  }

  function renderWorkspace(state){
    if (!state.workspaceRoot) return;
    state.workspaceRoot.innerHTML = '';
    const variableNames = state.project.variables.map(v => v.name);
    state.workspaceRoot.appendChild(createDropZone(state, 'root', 'root', 0));
    state.project.blocks.forEach((block, idx) => {
      renderBlock(state, block, state.workspaceRoot, variableNames);
      state.workspaceRoot.appendChild(createDropZone(state, 'root', 'root', idx + 1));
    });
    highlightSelection(state);
  }

  function handleDrop(state, zone){
    if (!state.dragData) return;
    const parentUid = zone.dataset.parent;
    const target = zone.dataset.target;
    const index = Number(zone.dataset.index || 0);
    const def = BLOCK_DEFS.find(d => d.id === state.dragData.defId);
    if (!def) return;
    let blockToInsert = null;
    if (state.dragData.source === 'library') {
      if (parentUid === 'root' && def.type !== 'hat') return;
      if (parentUid !== 'root' && def.type === 'hat') return;
      blockToInsert = {
        uid: nextUid(),
        defId: def.id,
        inputs: {},
        child: [],
        elseChild: []
      };
      if (def.inputs) {
        for (const key of Object.keys(def.inputs)) {
          const spec = def.inputs[key];
          if (spec.type === 'number') blockToInsert.inputs[key] = spec.default ?? 0;
          else blockToInsert.inputs[key] = getInputDefault(spec);
        }
      }
      state.blockCreationCount = (state.blockCreationCount || 0) + 1;
      if (state.blockCreationCount % BLOCK_BUILD_XP_INTERVAL === 0) {
        awardXpLocal(state, 2, { type: 'build' });
      }
    } else {
      blockToInsert = detachBlock(state.project, state.dragData.uid);
      if (!blockToInsert) return;
      if (parentUid === 'root' && def.type !== 'hat') return;
      if (parentUid !== 'root' && def.type === 'hat') return;
    }
    insertBlock(state.project, blockToInsert, parentUid, target, index);
    state.project.updatedAt = Date.now();
    renderWorkspace(state);
    updateProjectSummary(state);
  }

  function detachBlock(project, uid){
    function walk(list){
      const idx = list.findIndex(item => item.uid === uid);
      if (idx >= 0) return list.splice(idx, 1)[0];
      for (const item of list) {
        if (item.child) {
          const found = walk(item.child);
          if (found) return found;
        }
        if (item.elseChild) {
          const foundElse = walk(item.elseChild);
          if (foundElse) return foundElse;
        }
      }
      return null;
    }
    return walk(project.blocks);
  }

  function insertBlock(project, block, parentUid, target, index){
    if (parentUid === 'root') {
      project.blocks.splice(index, 0, block);
      return;
    }
    const parent = findBlockByUid(project.blocks, parentUid);
    if (!parent) return;
    if (target === 'else') {
      parent.elseChild = parent.elseChild || [];
      parent.elseChild.splice(index, 0, block);
    } else {
      parent.child = parent.child || [];
      parent.child.splice(index, 0, block);
    }
  }

  function findBlockByUid(list, uid){
    for (const item of list) {
      if (item.uid === uid) return item;
      const found = findBlockByUid(item.child || [], uid);
      if (found) return found;
      const foundElse = findBlockByUid(item.elseChild || [], uid);
      if (foundElse) return foundElse;
    }
    return null;
  }

  function deleteBlock(state, uid){
    const removed = detachBlock(state.project, uid);
    if (!removed) return;
    renderWorkspace(state);
    updateProjectSummary(state);
  }

  function duplicateBlock(state, uid){
    const block = findBlockByUid(state.project.blocks, uid);
    if (!block) return;
    const copy = deepClone(block);
    assignNewIds(copy);
    insertAfter(state.project.blocks, uid, copy);
    renderWorkspace(state);
    updateProjectSummary(state);
  }

  function assignNewIds(block){
    block.uid = nextUid();
    block.child?.forEach(assignNewIds);
    block.elseChild?.forEach(assignNewIds);
  }

  function insertAfter(list, uid, block){
    function walk(arr){
      const idx = arr.findIndex(item => item.uid === uid);
      if (idx >= 0) {
        arr.splice(idx + 1, 0, block);
        return true;
      }
      for (const item of arr) {
        if (item.child && walk(item.child)) return true;
        if (item.elseChild && walk(item.elseChild)) return true;
      }
      return false;
    }
    walk(list);
  }

  function countBlocks(list){
    return list.reduce((acc, block) => {
      let total = acc + 1;
      if (Array.isArray(block.child)) total += countBlocks(block.child);
      if (Array.isArray(block.elseChild)) total += countBlocks(block.elseChild);
      return total;
    }, 0);
  }

  function updateProjectSummary(state){
    if (!state.summaryEl) return;
    const blockCount = countBlocks(state.project.blocks);
    const variableCount = state.project.variables.length;
    state.summaryEl.textContent = getSummaryText(state, blockCount, variableCount);
  }

  function addBlockFromLibrary(state, def){
    if (!def) return;
    const block = {
      uid: nextUid(),
      defId: def.id,
      inputs: {},
      child: [],
      elseChild: []
    };
    if (def.inputs) {
      for (const key of Object.keys(def.inputs)) {
        const spec = def.inputs[key];
        if (spec.type === 'number') block.inputs[key] = spec.default ?? 0;
        else block.inputs[key] = getInputDefault(spec);
      }
    }
    if (def.type === 'hat') {
      state.project.blocks.push(block);
    } else {
      let hat = state.project.blocks.find(b => BLOCK_DEFS.find(d => d.id === b.defId)?.type === 'hat');
      if (!hat) {
        hat = {
          uid: nextUid(),
          defId: 'whenGameStarts',
          inputs: {},
          child: [],
          elseChild: []
        };
        state.project.blocks.unshift(hat);
      }
      hat.child = hat.child || [];
      hat.child.push(block);
    }
    state.blockCreationCount = (state.blockCreationCount || 0) + 1;
    if (state.blockCreationCount % BLOCK_BUILD_XP_INTERVAL === 0) {
      awardXpLocal(state, 2, { type: 'build' });
    }
    renderWorkspace(state);
    updateProjectSummary(state);
  }

  function renderLibrary(state){
    if (!state.blockListEl) return;
    state.blockListEl.innerHTML = '';
    const defs = BLOCK_DEFS.filter(def => def.category === state.activeCategory);
    defs.forEach(def => {
      const item = document.createElement('div');
      item.className = 'bc-lib-block';
      item.draggable = true;
      item.textContent = getBlockLabel(def).replace(/\{([^}]+)\}/g, (_, key) => `«${key}»`);
      const description = getBlockDescription(def);
      if (description) {
        const desc = document.createElement('div');
        desc.className = 'bc-lib-desc';
        desc.textContent = description;
        item.appendChild(desc);
      }
      item.addEventListener('dragstart', (e) => {
        state.dragData = { source: 'library', defId: def.id };
        if (e.dataTransfer) {
          e.dataTransfer.setData('text/plain', def.id);
          e.dataTransfer.effectAllowed = 'copy';
        }
      });
      item.addEventListener('dragend', () => {
        state.dragData = null;
      });
      item.addEventListener('dblclick', () => {
        addBlockFromLibrary(state, def);
      });
      state.blockListEl.appendChild(item);
    });
  }

  function openModal(state, opts){
    closeModal(state);
    const backdrop = document.createElement('div');
    backdrop.className = 'blockcode-modal-backdrop';
    const modal = document.createElement('div');
    modal.className = 'blockcode-modal';
    if (opts.title) {
      const title = document.createElement('h3');
      title.textContent = opts.title;
      modal.appendChild(title);
    }
    if (typeof opts.render === 'function') {
      const content = opts.render();
      if (content) modal.appendChild(content);
    }
    const footer = document.createElement('footer');
    if (opts.onCancel) {
      const cancel = document.createElement('button');
      cancel.type = 'button';
      cancel.className = 'blockcode-btn';
      cancel.textContent = opts.cancelLabel || translateBlockcode('ui.buttons.cancel', 'キャンセル');
      cancel.addEventListener('click', () => {
        opts.onCancel();
        closeModal(state);
      });
      footer.appendChild(cancel);
    }
    if (opts.onConfirm) {
      const ok = document.createElement('button');
      ok.type = 'button';
      ok.className = 'blockcode-btn primary';
      ok.textContent = opts.confirmLabel || translateBlockcode('ui.buttons.ok', 'OK');
      ok.addEventListener('click', () => {
        if (opts.onConfirm() !== false) closeModal(state);
      });
      footer.appendChild(ok);
    }
    modal.appendChild(footer);
    backdrop.appendChild(modal);
    state.root.appendChild(backdrop);
    state.activeModal = backdrop;
  }

  function closeModal(state){
    if (state.activeModal && state.activeModal.parentNode) {
      state.activeModal.parentNode.removeChild(state.activeModal);
    }
    state.activeModal = null;
  }

  function updateVariableList(state){
    if (!state.variableListEl) return;
    state.variableListEl.innerHTML = '';
    state.project.variables.forEach((variable) => {
      const row = document.createElement('div');
      row.className = 'blockcode-variable-item';
      const name = document.createElement('span');
      name.textContent = variable.name;
      const value = document.createElement('span');
      value.textContent = translateBlockcode(
        'ui.variableList.initialValue',
        () => `初期値: ${variable.initialValue}`,
        { value: variable.initialValue }
      );
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = translateBlockcode('ui.buttons.delete', '削除');
      remove.className = 'blockcode-btn';
      remove.style.padding = '2px 8px';
      remove.style.fontSize = '11px';
      remove.addEventListener('click', () => {
        const idx = state.project.variables.findIndex(v => v.id === variable.id);
        if (idx >= 0) {
          state.project.variables.splice(idx, 1);
          renderWorkspace(state);
          updateVariableList(state);
          updateProjectSummary(state);
        }
      });
      row.appendChild(name);
      row.appendChild(value);
      row.appendChild(remove);
      state.variableListEl.appendChild(row);
    });
  }

  function showAddVariableDialog(state){
    const refs = {};
    openModal(state, {
      title: translateBlockcode('ui.modals.addVariableTitle', '変数を追加'),
      render() {
        const wrap = document.createElement('div');
        wrap.style.display = 'flex';
        wrap.style.flexDirection = 'column';
        wrap.style.gap = '12px';
        const nameInput = document.createElement('input');
        nameInput.placeholder = translateBlockcode('ui.inputs.variableName', '変数名');
        nameInput.className = 'bc-input';
        const typeSelect = document.createElement('select');
        typeSelect.className = 'bc-input';
        ['number', 'string', 'boolean'].forEach((value) => {
          const opt = document.createElement('option');
          opt.value = value;
          opt.textContent = getVariableTypeLabel(value);
          typeSelect.appendChild(opt);
        });
        const initialInput = document.createElement('input');
        initialInput.placeholder = translateBlockcode('ui.inputs.variableInitial', '初期値');
        initialInput.className = 'bc-input';
        wrap.appendChild(nameInput);
        wrap.appendChild(typeSelect);
        wrap.appendChild(initialInput);
        refs.nameInput = nameInput;
        refs.typeSelect = typeSelect;
        refs.initialInput = initialInput;
        return wrap;
      },
      onCancel() {},
      onConfirm() {
        const name = refs.nameInput?.value?.trim();
        if (!name) return false;
        const type = refs.typeSelect?.value || 'number';
        const initialValue = refs.initialInput?.value ?? '';
        if (state.project.variables.some(v => v.name === name)) {
          alert(translateBlockcode('ui.alerts.duplicateVariable', '同名の変数が既に存在します'));
          return false;
        }
        state.project.variables.push({
          id: nextUid(),
          name,
          type,
          initialValue
        });
        renderWorkspace(state);
        updateVariableList(state);
        updateProjectSummary(state);
        return true;
      }
    });
  }

  function encodeProject(project){
    const data = JSON.stringify(normalizeProject(project));
    try {
      if (typeof TextEncoder !== 'undefined' && typeof btoa === 'function') {
        const bytes = new TextEncoder().encode(data);
        let bin = '';
        bytes.forEach(byte => { bin += String.fromCharCode(byte); });
        return btoa(bin);
      }
      if (typeof Buffer !== 'undefined') {
        return Buffer.from(data, 'utf-8').toString('base64');
      }
    } catch (err) {
      console.error(err);
    }
    return data;
  }

  function decodeProject(code){
    try {
      let json = code;
      if (/^[A-Za-z0-9+/=]+$/.test(code)) {
        if (typeof atob === 'function' && typeof TextDecoder !== 'undefined') {
          const binary = atob(code);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          json = new TextDecoder().decode(bytes);
        } else if (typeof Buffer !== 'undefined') {
          json = Buffer.from(code, 'base64').toString('utf-8');
        }
      }
      const parsed = JSON.parse(json);
      return normalizeProject(parsed);
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  function showSaveDialog(state){
    const refs = {};
    openModal(state, {
      title: translateBlockcode('ui.modals.saveProjectTitle', 'プロジェクトを保存'),
      render() {
        const wrap = document.createElement('div');
        wrap.style.display = 'flex';
        wrap.style.flexDirection = 'column';
        wrap.style.gap = '12px';
        const nameInput = document.createElement('input');
        nameInput.className = 'bc-input';
        nameInput.value = state.project.name;
        const descArea = document.createElement('textarea');
        descArea.placeholder = translateBlockcode('ui.inputs.memo', 'メモ (任意)');
        descArea.value = state.project.metadata?.description || '';
        wrap.appendChild(nameInput);
        wrap.appendChild(descArea);
        refs.nameInput = nameInput;
        refs.descArea = descArea;
        return wrap;
      },
      onCancel() {},
      onConfirm() {
        const name = refs.nameInput?.value?.trim() || getDefaultProjectName();
        state.project.name = name;
        if (!state.project.metadata) state.project.metadata = {};
        state.project.metadata.description = refs.descArea?.value || '';
        state.project.updatedAt = Date.now();
        persistProject(state.project);
        updateProjectSummary(state);
        pushLog(
          state,
          'info',
          translateBlockcode('ui.messages.projectSaved', () => `プロジェクト「${name}」を保存しました。`, { name })
        );
        return true;
      }
    });
  }

  function showLoadDialog(state){
    const projects = loadStoredProjects();
    if (!projects.length) {
      alert(translateBlockcode('ui.alerts.noSavedProjects', '保存済みのプロジェクトがありません。'));
      return;
    }
    const refs = { idx: 0 };
    openModal(state, {
      title: translateBlockcode('ui.modals.loadProjectTitle', 'プロジェクトを読み込み'),
      render() {
        const wrap = document.createElement('div');
        wrap.style.display = 'flex';
        wrap.style.flexDirection = 'column';
        wrap.style.gap = '12px';
        const select = document.createElement('select');
        select.className = 'bc-input';
        projects.forEach((project, index) => {
          const option = document.createElement('option');
          option.value = String(index);
          option.textContent = formatSavedProjectOption(project);
          select.appendChild(option);
        });
        select.addEventListener('change', () => {
          refs.idx = Number(select.value) || 0;
        });
        wrap.appendChild(select);
        const summary = document.createElement('div');
        summary.style.fontSize = '12px';
        summary.style.color = '#475569';
        summary.textContent = translateBlockcode(
          'ui.projectStats',
          () => `ブロック ${countBlocks(projects[0].blocks)} · 変数 ${projects[0].variables.length}`,
          {
            blocks: countBlocks(projects[0].blocks),
            variables: projects[0].variables.length
          }
        );
        select.addEventListener('change', () => {
          const chosen = projects[Number(select.value) || 0];
          summary.textContent = translateBlockcode(
            'ui.projectStats',
            () => `ブロック ${countBlocks(chosen.blocks)} · 変数 ${chosen.variables.length}`,
            { blocks: countBlocks(chosen.blocks), variables: chosen.variables.length }
          );
        });
        wrap.appendChild(summary);
        refs.summary = summary;
        return wrap;
      },
      onCancel() {},
      onConfirm() {
        const idx = Math.min(projects.length - 1, Math.max(0, refs.idx || 0));
        const chosen = normalizeProject(projects[idx]);
        state.project = chosen;
        renderWorkspace(state);
        updateVariableList(state);
        updateProjectSummary(state);
        resetStageView(state);
        pushLog(
          state,
          'info',
          translateBlockcode('ui.messages.projectLoaded', () => `プロジェクト「${chosen.name}」を読み込みました。`, { name: chosen.name })
        );
        return true;
      }
    });
  }

  function showShareDialog(state){
    const refs = {};
    openModal(state, {
      title: translateBlockcode('ui.share.title', '共有コード'),
      render() {
        const wrap = document.createElement('div');
        wrap.style.display = 'flex';
        wrap.style.flexDirection = 'column';
        wrap.style.gap = '12px';
        const shareArea = document.createElement('textarea');
        shareArea.readOnly = true;
        shareArea.value = encodeProject(state.project);
        refs.shareArea = shareArea;
        wrap.appendChild(shareArea);
        const importLabel = document.createElement('div');
        importLabel.textContent = translateBlockcode('ui.share.importLabel', '共有コードを貼り付けて読み込み');
        importLabel.style.fontSize = '12px';
        importLabel.style.color = '#475569';
        wrap.appendChild(importLabel);
        const importArea = document.createElement('textarea');
        importArea.placeholder = translateBlockcode('ui.share.importPlaceholder', '共有コード');
        refs.importArea = importArea;
        wrap.appendChild(importArea);
        const importBtn = document.createElement('button');
        importBtn.type = 'button';
        importBtn.className = 'blockcode-btn';
        importBtn.textContent = translateBlockcode('ui.share.importButton', '読み込む');
        importBtn.addEventListener('click', () => {
          const code = refs.importArea?.value?.trim();
          if (!code) return;
          const project = decodeProject(code);
          if (!project) {
            alert(translateBlockcode('ui.alerts.decodeFailed', '共有コードの解析に失敗しました。'));
            return;
          }
          state.project = project;
          renderWorkspace(state);
          updateVariableList(state);
          updateProjectSummary(state);
          resetStageView(state);
          pushLog(
            state,
            'info',
            translateBlockcode('ui.messages.shareImported', () => `共有コードから「${project.name}」を読み込みました。`, { name: project.name })
          );
          closeModal(state);
        });
        wrap.appendChild(importBtn);
        const copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'blockcode-btn';
        copyBtn.textContent = translateBlockcode('ui.share.copyButton', 'コードをコピー');
        copyBtn.addEventListener('click', async () => {
          try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
              await navigator.clipboard.writeText(refs.shareArea.value);
              copyBtn.textContent = translateBlockcode('ui.share.copied', 'コピーしました!');
              setTimeout(() => {
                copyBtn.textContent = translateBlockcode('ui.share.copyButton', 'コードをコピー');
              }, 1500);
            } else {
              refs.shareArea.select();
              document.execCommand('copy');
              copyBtn.textContent = translateBlockcode('ui.share.copied', 'コピーしました!');
              setTimeout(() => {
                copyBtn.textContent = translateBlockcode('ui.share.copyButton', 'コードをコピー');
              }, 1500);
            }
          } catch (err) {
            console.error(err);
          }
        });
        wrap.appendChild(copyBtn);
        return wrap;
      },
      onCancel() {},
      onConfirm() { return true; }
    });
  }

  function pushLog(state, level, message){
    if (!state.logPanel) return;
    const entry = document.createElement('div');
    entry.className = `blockcode-logline ${level}`;
    const ts = new Date().toLocaleTimeString();
    entry.textContent = `[${ts}] ${message}`;
    state.logPanel.appendChild(entry);
    while (state.logPanel.childElementCount > 200) {
      state.logPanel.removeChild(state.logPanel.firstChild);
    }
    state.logPanel.scrollTop = state.logPanel.scrollHeight;
  }

  function switchTab(state, tab){
    state.activeTab = tab;
    if (state.logsTabBtn) state.logsTabBtn.classList.toggle('active', tab === 'logs');
    if (state.varsTabBtn) state.varsTabBtn.classList.toggle('active', tab === 'vars');
    if (state.logPanel) state.logPanel.style.display = tab === 'logs' ? 'block' : 'none';
    if (state.varsPanel) state.varsPanel.style.display = tab === 'vars' ? 'block' : 'none';
  }

  function ensureStageCanvas(state){
    if (state.stageCanvas) return;
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    state.stageCanvas = canvas;
    state.stageCtx = canvas.getContext('2d');
    if (state.stageContainer) {
      state.stageContainer.innerHTML = '';
      state.stageContainer.appendChild(canvas);
    }
  }

  function resetStageView(state, message){
    if (!state.stageContainer) return;
    if (!state.stagePlaceholder) {
      const placeholder = document.createElement('div');
      placeholder.className = 'blockcode-stage-placeholder';
      state.stagePlaceholder = placeholder;
    }
    state.stagePlaceholder.textContent = message || getStagePlaceholderMessage();
    state.stageContainer.innerHTML = '';
    state.stageContainer.appendChild(state.stagePlaceholder);
    state.stageCanvas = null;
    state.stageCtx = null;
  }

  function renderStage(state, stage){
    ensureStageCanvas(state);
    if (!state.stageCanvas || !state.stageCtx) return;
    const canvas = state.stageCanvas;
    const ctx = state.stageCtx;
    const width = stage?.width || 10;
    const height = stage?.height || 10;
    const tiles = stage?.tiles || Array.from({ length: height }, () => Array.from({ length: width }, () => '#1e293b'));
    const player = stage?.player || { x: 0, y: 0, color: '#facc15' };
    canvas.width = canvas.clientWidth || 320;
    canvas.height = canvas.clientHeight || 240;
    const tileW = canvas.width / width;
    const tileH = canvas.height / height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        ctx.fillStyle = tiles[y]?.[x] || '#1e293b';
        ctx.fillRect(x * tileW, y * tileH, tileW, tileH);
        ctx.strokeStyle = 'rgba(15,23,42,0.35)';
        ctx.strokeRect(x * tileW, y * tileH, tileW, tileH);
      }
    }
    ctx.fillStyle = player.color || '#facc15';
    ctx.beginPath();
    ctx.arc((player.x + 0.5) * tileW, (player.y + 0.5) * tileH, Math.min(tileW, tileH) * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  function updateVariableWatch(state, variables){
    state.runtimeVars = variables || {};
    if (!state.varsPanel) return;
    state.varsPanel.innerHTML = '';
    const entries = Object.entries(state.runtimeVars || {});
    if (!entries.length) {
      const empty = document.createElement('div');
      empty.textContent = translateBlockcode('ui.variableList.empty', '変数はありません。');
      state.varsPanel.appendChild(empty);
      return;
    }
    entries.sort((a, b) => a[0].localeCompare(b[0]));
    entries.forEach(([name, value]) => {
      const row = document.createElement('div');
      row.className = 'blockcode-logline';
      row.textContent = formatVariableEntry(name, value);
      state.varsPanel.appendChild(row);
    });
  }

  function serializeBlocks(blocks){
    return (blocks || []).map(block => ({
      uid: block.uid,
      defId: block.defId,
      inputs: block.inputs || {},
      child: serializeBlocks(block.child || []),
      elseChild: serializeBlocks(block.elseChild || [])
    }));
  }

  function serializeProject(project, executionSpeed){
    return {
      blocks: serializeBlocks(project.blocks),
      variables: project.variables.map(v => ({
        name: v.name,
        type: v.type,
        initialValue: v.initialValue
      })),
      settings: {
        speed: executionSpeed || 1
      }
    };
  }

  function awardXpLocal(state, amount, meta){
    if (!Number.isFinite(amount) || amount === 0) return;
    state.xpState.total += amount;
    updateXpBadge(state);
    persistXpState(state.xpState);
    if (typeof state.awardXp === 'function') {
      try { state.awardXp(amount, meta || {}); } catch (err) { console.error(err); }
    }
    pushLog(state, amount >= 0 ? 'info' : 'warn', getXpChangeText(amount));
  }

  function updateXpBadge(state){
    if (state.xpBadge) {
      state.xpBadge.textContent = getXpBadgeText(state.xpState.total);
    }
  }

  function updateRunState(state, running){
    state.running = running;
    if (state.runButton) state.runButton.disabled = running;
    if (state.stopButton) state.stopButton.disabled = !running;
    if (state.statusBadge) {
      state.statusBadge.textContent = getStatusLabel(running);
      state.statusBadge.classList.toggle('blockcode-running', running);
    }
  }

  function createSandboxWorker(state){
    const workerSrc = `(() => {
      const SPEED_MIN = 0.1;
      let stopRequested = false;
      let stage = null;
      let variables = {};
      let speed = 1;
      let heartbeatTimer = null;

      const DEFAULT_WIDTH = 10;
      const DEFAULT_HEIGHT = 10;

      function resetStage(){
        stage = {
          width: DEFAULT_WIDTH,
          height: DEFAULT_HEIGHT,
          tiles: Array.from({ length: DEFAULT_HEIGHT }, () => Array.from({ length: DEFAULT_WIDTH }, () => '#0f172a')),
          player: { x: 4, y: 4, color: '#facc15' }
        };
      }

      function send(msg){
        try { postMessage(msg); } catch (err) { console.error(err); }
      }

      function sendState(){
        send({ type: 'state', stage });
      }

      function sendVars(){
        send({ type: 'vars', variables });
      }

      function sanitizeColor(value){
        if (typeof value !== 'string') return '#38bdf8';
        const trimmed = value.trim();
        if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed)) return trimmed;
        return '#38bdf8';
      }

      function toNumber(value){
        const num = Number(value);
        return Number.isFinite(num) ? num : 0;
      }

      function evaluate(expr){
        if (typeof expr === 'number') return expr;
        if (typeof expr === 'boolean') return expr ? 1 : 0;
        if (expr == null) return 0;
        const text = String(expr);
        if (!text.trim()) return 0;
        const safe = text.replace(/[^0-9a-zA-Z_+\-*/%<>=!&|().,'"\s]/g, '');
        const varNames = Object.keys(variables);
        const replaced = safe.replace(/\b([A-Za-z_][A-Za-z0-9_]*)\b/g, (m) => {
          if (m === 'true' || m === 'false') return m;
          if (m === 'Math') return 'Math';
          if (varNames.includes(m)) return `(variables['${m}'] ?? 0)`;
          return m;
        });
        try {
          // eslint-disable-next-line no-new-func
          const fn = new Function('variables', 'return (' + replaced + ');');
          const result = fn(variables);
          if (typeof result === 'boolean') return result ? 1 : 0;
          if (typeof result === 'number') return Number.isFinite(result) ? result : 0;
          return Number(result) || 0;
        } catch {
          return 0;
        }
      }

      function evaluateBool(expr){
        if (typeof expr === 'boolean') return expr;
        if (typeof expr === 'number') return expr !== 0;
        const text = String(expr).trim().toLowerCase();
        if (!text) return false;
        if (text === 'true') return true;
        if (text === 'false') return false;
        return evaluate(expr) !== 0;
      }

      async function sleep(ms){
        if (ms <= 0) return;
        await new Promise(resolve => setTimeout(resolve, ms));
      }

      async function executeBlocks(blocks){
        for (const block of blocks) {
          if (stopRequested) return;
          send({ type: 'step', uid: block.uid });
          await executeBlock(block);
        }
      }

      async function executeBlock(block){
        switch (block.defId) {
          case 'movePlayer': {
            const steps = toNumber(block.inputs?.steps);
            const dir = steps >= 0 ? 1 : -1;
            const amount = Math.abs(Math.floor(steps));
            for (let i = 0; i < amount; i++) {
              stage.player.x = Math.max(0, Math.min(stage.width - 1, stage.player.x + dir));
              sendState();
              await sleep(60 / Math.max(speed, SPEED_MIN));
              if (stopRequested) return;
            }
            break;
          }
          case 'setTile': {
            const x = Math.max(0, Math.min(stage.width - 1, Math.round(toNumber(block.inputs?.x))));
            const y = Math.max(0, Math.min(stage.height - 1, Math.round(toNumber(block.inputs?.y))));
            const color = sanitizeColor(block.inputs?.color);
            stage.tiles[y][x] = color;
            sendState();
            break;
          }
          case 'waitSeconds': {
            const seconds = Math.max(0, Number(block.inputs?.seconds) || 0);
            await sleep((seconds * 1000) / Math.max(speed, SPEED_MIN));
            break;
          }
          case 'repeatTimes': {
            let count = Math.floor(toNumber(block.inputs?.count));
            if (!Number.isFinite(count) || count < 0) count = 0;
            count = Math.min(count, 9999);
            for (let i = 0; i < count; i++) {
              if (stopRequested) break;
              await executeBlocks(block.child || []);
            }
            break;
          }
          case 'foreverLoop': {
            let iterations = 0;
            while (!stopRequested && iterations < 512) {
              await executeBlocks(block.child || []);
              iterations++;
            }
            if (iterations >= 512) {
              send({
                type: 'log',
                level: 'warn',
                messageKey: '${BC_I18N_PREFIX}.worker.foreverLimit',
                messageParams: { limit: 512 },
                message: 'foreverループが512回で停止しました。'
              });
            }
            break;
          }
          case 'ifCondition': {
            const cond = evaluateBool(block.inputs?.condition);
            if (cond) await executeBlocks(block.child || []);
            else await executeBlocks(block.elseChild || []);
            break;
          }
          case 'logMessage': {
            const message = String(block.inputs?.message ?? '');
            send({ type: 'log', level: 'info', message });
            break;
          }
          case 'awardXp': {
            const amount = Math.round(toNumber(block.inputs?.amount));
            send({ type: 'xp', amount });
            break;
          }
          case 'setVariable': {
            const name = block.inputs?.variable;
            if (typeof name === 'string' && name) {
              const raw = block.inputs?.value;
              if (typeof raw === 'string') {
                const trimmed = raw.trim();
                if (!trimmed) {
                  variables[name] = 0;
                } else if ((trimmed.startsWith("\"") && trimmed.endsWith("\"")) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
                  variables[name] = trimmed.slice(1, -1);
                } else if (!Number.isNaN(Number(trimmed))) {
                  variables[name] = Number(trimmed);
                } else {
                  variables[name] = evaluate(trimmed);
                }
              } else {
                variables[name] = raw ?? 0;
              }
              sendVars();
            }
            break;
          }
          case 'changeVariable': {
            const name = block.inputs?.variable;
            if (typeof name === 'string' && name) {
              const delta = evaluate(block.inputs?.delta);
              const current = toNumber(variables[name]);
              variables[name] = current + delta;
              sendVars();
            }
            break;
          }
          case 'broadcast': {
            const channel = block.inputs?.channel ?? '';
            const message = 'ブロードキャスト: ' + String(channel ?? '');
            send({
              type: 'log',
              level: 'info',
              messageKey: '${BC_I18N_PREFIX}.worker.broadcast',
              messageParams: { channel: String(channel ?? '') },
              message
            });
            break;
          }
          case 'stopAll': {
            stopRequested = true;
            break;
          }
          default:
            break;
        }
      }

      async function runProgram(program){
        stopRequested = false;
        resetStage();
        variables = {};
        speed = Math.max(SPEED_MIN, Number(program?.settings?.speed) || 1);
        if (Array.isArray(program?.variables)) {
          program.variables.forEach(v => {
            variables[v.name] = v.initialValue ?? 0;
          });
        }
        sendVars();
        sendState();
        const blocks = Array.isArray(program?.blocks) ? program.blocks : [];
        const hats = blocks.filter(block => block.defId === 'whenGameStarts');
        if (!hats.length) {
          send({
            type: 'log',
            level: 'warn',
            messageKey: '${BC_I18N_PREFIX}.worker.noStart',
            message: '開始イベントが見つかりません。'
          });
        }
        for (const hat of hats) {
          if (stopRequested) break;
          await executeBlocks(hat.child || []);
        }
        if (!stopRequested) {
          send({ type: 'done' });
        } else {
          send({
            type: 'log',
            level: 'warn',
            messageKey: '${BC_I18N_PREFIX}.worker.stopped',
            message: '停止されました。'
          });
        }
      }

      onmessage = (event) => {
        const data = event.data;
        if (!data) return;
        switch (data.type) {
          case 'run':
            if (heartbeatTimer) clearInterval(heartbeatTimer);
            heartbeatTimer = setInterval(() => { send({ type: 'heartbeat' }); }, 5000);
            runProgram(data.program).catch(err => {
              send({ type: 'error', message: err.message, stack: err.stack });
            }).finally(() => {
              if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = null; }
            });
            break;
          case 'stop':
            stopRequested = true;
            break;
          case 'ping':
            send({ type: 'pong' });
            break;
          default:
            break;
        }
      };
    })();`;
    const blob = new Blob([workerSrc], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    worker._blockcodeUrl = url;
    worker.onmessage = (event) => {
      const data = event.data;
      if (!data) return;
      switch (data.type) {
        case 'state':
          renderStage(state, data.stage);
          break;
        case 'vars':
          updateVariableWatch(state, data.variables);
          break;
        case 'log': {
          const text = data.messageKey
            ? translateText(data.messageKey, data.message || '', data.messageParams)
            : (data.message || '');
          pushLog(state, data.level || 'info', text);
          break;
        }
        case 'error':
          pushLog(state, 'error', data.message || translateBlockcode('ui.messages.genericError', 'エラーが発生しました'));
          stopExecution(state, false);
          break;
        case 'done':
          pushLog(state, 'info', translateBlockcode('ui.messages.runComplete', '実行が完了しました。'));
          awardXpLocal(state, 8, { type: 'run' });
          stopExecution(state, false);
          break;
        case 'step':
          state.highlightBlockUid = data.uid;
          highlightSelection(state);
          break;
        case 'xp':
          awardXpLocal(state, Number(data.amount) || 0, { type: 'sandbox' });
          break;
        case 'heartbeat':
          break;
        case 'pong':
          break;
        default:
          break;
      }
    };
    return worker;
  }

  function cleanupWorker(state){
    if (state.worker) {
      try { state.worker.terminate(); } catch (err) { console.error(err); }
      if (state.worker._blockcodeUrl) {
        try { URL.revokeObjectURL(state.worker._blockcodeUrl); } catch {}
      }
    }
    state.worker = null;
    if (state.heartbeatTimer) {
      clearInterval(state.heartbeatTimer);
      state.heartbeatTimer = null;
    }
  }

  function runProject(state){
    if (state.running) return;
    const hatExists = state.project.blocks.some(block => {
      const def = BLOCK_DEFS.find(d => d.id === block.defId);
      return def?.type === 'hat';
    });
    if (!hatExists) {
      pushLog(state, 'warn', translateBlockcode('ui.messages.needHat', '開始イベントブロックが必要です。'));
      return;
    }
    state.logPanel && (state.logPanel.innerHTML = '');
    state.varsPanel && (state.varsPanel.innerHTML = '');
    state.highlightBlockUid = null;
    highlightSelection(state);
    renderStage(state, null);
    updateRunState(state, true);
    state.worker = createSandboxWorker(state);
    state.worker.onerror = (err) => {
      pushLog(state, 'error', err.message || translateBlockcode('ui.messages.workerError', 'Worker error'));
      stopExecution(state, false);
    };
    state.worker.postMessage({ type: 'run', program: serializeProject(state.project, state.executionSpeed) });
    state.heartbeatTimer = setInterval(() => {
      if (state.worker) state.worker.postMessage({ type: 'ping' });
    }, WORKER_HEARTBEAT_MS);
  }

  function stopExecution(state, manual = true){
    if (state.worker) {
      try { state.worker.postMessage({ type: 'stop' }); } catch {}
    }
    cleanupWorker(state);
    updateRunState(state, false);
    if (manual) {
      pushLog(state, 'warn', translateBlockcode('ui.messages.executionStopped', '実行を停止しました。'));
      resetStageView(state, getStagePlaceholderMessage());
    }
  }

  function create(root, awardXp, options){
    if (!root) throw new Error(translateBlockcode('errors.containerRequired', 'MiniExp BlockCode requires a container'));
    const cleanupStyle = createStyle();
    root.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'blockcode-root';
    root.appendChild(wrapper);

    const state = {
      root: wrapper,
      awardXp,
      executionSpeed: 1,
      activeCategory: 'events',
      blockCreationCount: 0,
      xpState: loadXpState(),
      runtimeVars: {},
      running: false,
      worker: null,
      heartbeatTimer: null,
      zoom: 1
    };

    const stored = loadStoredProjects();
    if (stored.length > 0) {
      state.project = normalizeProject(deepClone(stored[0]));
    } else {
      state.project = createBlankProject();
    }
    syncUidCounter(state.project);

    // Header
    const header = document.createElement('div');
    header.className = 'blockcode-header';
    const headerLeft = document.createElement('div');
    headerLeft.className = 'blockcode-header-left';
    const title = document.createElement('div');
    title.className = 'blockcode-header-title';
    title.textContent = translateBlockcode('ui.title', 'ブロックコードラボ');
    headerLeft.appendChild(title);
    const summary = document.createElement('div');
    summary.className = 'blockcode-header-sub';
    headerLeft.appendChild(summary);
    state.summaryEl = summary;

    const headerControls = document.createElement('div');
    headerControls.className = 'blockcode-header-controls';
    const statusArea = document.createElement('div');
    statusArea.className = 'blockcode-status';
    const xpBadge = document.createElement('div');
    xpBadge.className = 'blockcode-badge';
    state.xpBadge = xpBadge;
    updateXpBadge(state);
    const statusBadge = document.createElement('div');
    statusBadge.className = 'blockcode-badge';
    statusBadge.textContent = getStatusLabel(false);
    state.statusBadge = statusBadge;
    statusArea.appendChild(xpBadge);
    statusArea.appendChild(statusBadge);

    const btnNew = document.createElement('button');
    btnNew.type = 'button';
    btnNew.className = 'blockcode-btn';
    btnNew.textContent = translateBlockcode('ui.buttons.new', '新規');
    btnNew.addEventListener('click', () => {
      if (state.running) {
        if (!confirm(translateBlockcode('ui.prompts.confirmStopForNew', '実行中です。停止して新規プロジェクトを作成しますか？'))) return;
        stopExecution(state);
      }
      if (countBlocks(state.project.blocks) > 0) {
        if (!confirm(translateBlockcode('ui.prompts.confirmDiscard', '現在のプロジェクトを破棄して新規作成しますか？'))) return;
      }
      state.project = createBlankProject();
      syncUidCounter(state.project);
      renderWorkspace(state);
      updateVariableList(state);
      updateProjectSummary(state);
      resetStageView(state);
      pushLog(state, 'info', translateBlockcode('ui.messages.projectCreated', '新しいプロジェクトを作成しました。'));
    });

    const btnSave = document.createElement('button');
    btnSave.type = 'button';
    btnSave.className = 'blockcode-btn';
    btnSave.textContent = translateBlockcode('ui.buttons.save', '保存');
    btnSave.addEventListener('click', () => showSaveDialog(state));

    const btnLoad = document.createElement('button');
    btnLoad.type = 'button';
    btnLoad.className = 'blockcode-btn';
    btnLoad.textContent = translateBlockcode('ui.buttons.load', '読み込み');
    btnLoad.addEventListener('click', () => showLoadDialog(state));

    const btnShare = document.createElement('button');
    btnShare.type = 'button';
    btnShare.className = 'blockcode-btn';
    btnShare.textContent = translateBlockcode('ui.buttons.share', '共有コード');
    btnShare.addEventListener('click', () => showShareDialog(state));

    const btnRun = document.createElement('button');
    btnRun.type = 'button';
    btnRun.className = 'blockcode-btn primary';
    btnRun.textContent = translateBlockcode('ui.buttons.run', '実行');
    btnRun.addEventListener('click', () => runProject(state));
    state.runButton = btnRun;

    const btnStop = document.createElement('button');
    btnStop.type = 'button';
    btnStop.className = 'blockcode-btn';
    btnStop.textContent = translateBlockcode('ui.buttons.stop', '停止');
    btnStop.disabled = true;
    btnStop.addEventListener('click', () => stopExecution(state));
    state.stopButton = btnStop;

    headerControls.appendChild(btnNew);
    headerControls.appendChild(btnSave);
    headerControls.appendChild(btnLoad);
    headerControls.appendChild(btnShare);
    headerControls.appendChild(btnRun);
    headerControls.appendChild(btnStop);

    header.appendChild(headerLeft);
    header.appendChild(headerControls);
    header.appendChild(statusArea);
    wrapper.appendChild(header);

    const body = document.createElement('div');
    body.className = 'blockcode-body';
    wrapper.appendChild(body);

    const library = document.createElement('div');
    library.className = 'blockcode-library';
    const catList = document.createElement('div');
    catList.className = 'blockcode-catlist';
    const blockList = document.createElement('div');
    blockList.className = 'blockcode-blocklist';
    state.blockListEl = blockList;

    Object.keys(CATEGORY_DEFS).forEach(cat => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'blockcode-catbtn';
      btn.textContent = getCategoryLabel(cat);
      if (cat === state.activeCategory) btn.classList.add('active');
      btn.addEventListener('click', () => {
        state.activeCategory = cat;
        catList.querySelectorAll('.blockcode-catbtn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderLibrary(state);
      });
      catList.appendChild(btn);
    });

    library.appendChild(catList);
    library.appendChild(blockList);

    const variableBox = document.createElement('div');
    variableBox.className = 'blockcode-variable-list';
    const addVarBtn = document.createElement('button');
    addVarBtn.type = 'button';
    addVarBtn.textContent = translateBlockcode('ui.buttons.addVariable', '変数を追加');
    addVarBtn.addEventListener('click', () => showAddVariableDialog(state));
    variableBox.appendChild(addVarBtn);
    const varList = document.createElement('div');
    variableBox.appendChild(varList);
    state.variableListEl = varList;
    library.appendChild(variableBox);

    body.appendChild(library);

    const center = document.createElement('div');
    center.className = 'blockcode-center';
    const canvasWrap = document.createElement('div');
    canvasWrap.className = 'blockcode-canvas';
    const stack = document.createElement('div');
    stack.className = 'blockcode-stack';
    canvasWrap.appendChild(stack);
    center.appendChild(canvasWrap);
    state.workspaceRoot = stack;
    state.workspaceRoot.style.transformOrigin = '0 0';

    body.appendChild(center);

    const right = document.createElement('div');
    right.className = 'blockcode-right';
    const stageArea = document.createElement('div');
    stageArea.className = 'blockcode-stage';
    const stagePlaceholder = document.createElement('div');
    stagePlaceholder.className = 'blockcode-stage-placeholder';
    stagePlaceholder.textContent = getStagePlaceholderMessage();
    stageArea.appendChild(stagePlaceholder);
    state.stageContainer = stageArea;
    state.stagePlaceholder = stagePlaceholder;
    right.appendChild(stageArea);

    const tabs = document.createElement('div');
    tabs.className = 'blockcode-tabs';
    const logsBtn = document.createElement('button');
    logsBtn.type = 'button';
    logsBtn.className = 'blockcode-tabbtn active';
    logsBtn.textContent = translateBlockcode('ui.tabs.logs', 'ログ');
    logsBtn.addEventListener('click', () => switchTab(state, 'logs'));
    const varsBtn = document.createElement('button');
    varsBtn.type = 'button';
    varsBtn.className = 'blockcode-tabbtn';
    varsBtn.textContent = translateBlockcode('ui.tabs.variables', '変数ウォッチ');
    varsBtn.addEventListener('click', () => switchTab(state, 'vars'));
    state.logsTabBtn = logsBtn;
    state.varsTabBtn = varsBtn;
    tabs.appendChild(logsBtn);
    tabs.appendChild(varsBtn);
    right.appendChild(tabs);

    const logPanel = document.createElement('div');
    logPanel.className = 'blockcode-tabpanel';
    logPanel.style.display = 'block';
    state.logPanel = logPanel;
    right.appendChild(logPanel);

    const varsPanel = document.createElement('div');
    varsPanel.className = 'blockcode-tabpanel';
    varsPanel.style.display = 'none';
    state.varsPanel = varsPanel;
    right.appendChild(varsPanel);

    body.appendChild(right);

    const toolbar = document.createElement('div');
    toolbar.className = 'blockcode-toolbar';
    const undoBtn = document.createElement('button');
    undoBtn.type = 'button';
    undoBtn.textContent = translateBlockcode('ui.toolbar.undo', 'Undo');
    undoBtn.addEventListener('click', () => pushLog(state, 'warn', translateBlockcode('ui.messages.undoUnavailable', 'Undo は未実装です。')));
    const redoBtn = document.createElement('button');
    redoBtn.type = 'button';
    redoBtn.textContent = translateBlockcode('ui.toolbar.redo', 'Redo');
    redoBtn.addEventListener('click', () => pushLog(state, 'warn', translateBlockcode('ui.messages.redoUnavailable', 'Redo は未実装です。')));
    const zoomReset = document.createElement('button');
    zoomReset.type = 'button';
    zoomReset.textContent = translateBlockcode('ui.toolbar.zoomReset', 'ズームリセット');
    zoomReset.addEventListener('click', () => {
      state.zoom = 1;
      state.workspaceRoot.style.transform = 'scale(1)';
      state.workspaceRoot.style.transformOrigin = '0 0';
    });
    const snapBtn = document.createElement('button');
    snapBtn.type = 'button';
    snapBtn.textContent = getToolbarSnapLabel(false);
    snapBtn.addEventListener('click', () => {
      state.snapEnabled = !state.snapEnabled;
      snapBtn.textContent = getToolbarSnapLabel(state.snapEnabled);
    });
    const gridBtn = document.createElement('button');
    gridBtn.type = 'button';
    gridBtn.textContent = translateBlockcode('ui.toolbar.gridToggle', 'グリッド切替');
    gridBtn.addEventListener('click', () => {
      canvasWrap.classList.toggle('hide-grid');
    });

    const sliderBox = document.createElement('div');
    sliderBox.className = 'blockcode-slider';
    const sliderLabel = document.createElement('span');
    sliderLabel.textContent = getToolbarSpeedLabel(1);
    const speedSlider = document.createElement('input');
    speedSlider.type = 'range';
    speedSlider.min = '0.25';
    speedSlider.max = '3';
    speedSlider.step = '0.25';
    speedSlider.value = '1';
    speedSlider.addEventListener('input', () => {
      state.executionSpeed = Number(speedSlider.value) || 1;
      sliderLabel.textContent = getToolbarSpeedLabel(state.executionSpeed);
    });
    sliderBox.appendChild(sliderLabel);
    sliderBox.appendChild(speedSlider);

    toolbar.appendChild(undoBtn);
    toolbar.appendChild(redoBtn);
    toolbar.appendChild(zoomReset);
    toolbar.appendChild(snapBtn);
    toolbar.appendChild(gridBtn);
    toolbar.appendChild(sliderBox);

    wrapper.appendChild(toolbar);

    resetStageView(state);
    renderLibrary(state);
    renderWorkspace(state);
    updateVariableList(state);
    updateProjectSummary(state);
    switchTab(state, 'logs');
    updateRunState(state, false);

    awardXpLocal(state, 5, { type: 'open' });

    return {
      start(){},
      stop(){ stopExecution(state); },
      destroy(){
        stopExecution(state, false);
        closeModal(state);
        cleanupWorker(state);
        cleanupStyle();
        root.innerHTML = '';
      },
      getScore(){
        return state.xpState.total;
      }
    };
  }

  window.registerMiniGame({
    id: 'blockcode',
    name: 'ブロックコードラボ', nameKey: 'selection.miniexp.games.blockcode.name', description: '', descriptionKey: 'selection.miniexp.games.blockcode.description', categoryIds: ['utility'],
    category: translateText('selection.miniexp.category.utility', 'ユーティリティ'),
    create: create
  });
})();

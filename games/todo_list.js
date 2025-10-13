(function(){
  const STORAGE_KEY = 'mini_todo_tasks_v1';
  const MAX_NAME = 32;
  const MAX_MEMO = 256;
  const MAX_XP = 99999999;
  const MAX_REWARD_AMOUNT = 99999999;
  const MAX_REWARD_KEY_LENGTH = 64;
  const DEFAULT_AUTO_NAMES = new Set(['名称未設定', 'Untitled']);
  const TASK_TYPE_SINGLE = 'single';
  const TASK_TYPE_REPEATABLE = 'repeatable';

  function sanitizeTaskType(value){
    return value === TASK_TYPE_REPEATABLE ? TASK_TYPE_REPEATABLE : TASK_TYPE_SINGLE;
  }

  function clampXp(value){
    const num = Number(value);
    if (!Number.isFinite(num)) return 0;
    const rounded = num >= 0 ? Math.floor(num) : Math.ceil(num);
    if (rounded > MAX_XP) return MAX_XP;
    if (rounded < -MAX_XP) return -MAX_XP;
    return rounded;
  }

  function clampRewardAmount(value, { min = 0, max = MAX_REWARD_AMOUNT } = {}){
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return min;
    let rounded = numeric >= 0 ? Math.floor(numeric) : Math.ceil(numeric);
    if (rounded < min) rounded = min;
    if (rounded > max) rounded = max;
    return rounded;
  }

  function sanitizeRewardKey(value){
    if (typeof value !== 'string') return '';
    const trimmed = value.trim();
    if (!trimmed) return '';
    return trimmed.slice(0, MAX_REWARD_KEY_LENGTH);
  }

  function sanitizeTaskRewards(raw){
    const base = {
      passiveOrb: { enabled: false, orbId: '', amount: 1 },
      item: { enabled: false, key: '', amount: 1 },
      sp: { enabled: false, amount: 0 }
    };
    const source = raw && typeof raw === 'object' ? raw : {};

    const passiveSource = (source.passiveOrb && typeof source.passiveOrb === 'object') ? source.passiveOrb : source;
    const passiveEnabledRaw = passiveSource.enabled === true || source.passiveOrbEnabled === true;
    const passiveId = sanitizeRewardKey(passiveSource.orbId ?? passiveSource.id ?? source.passiveOrbId ?? '');
    const passiveAmount = clampRewardAmount(passiveSource.amount ?? source.passiveOrbAmount ?? 1, { min: 1 });
    base.passiveOrb = {
      enabled: passiveEnabledRaw && !!passiveId && passiveAmount > 0,
      orbId: passiveId,
      amount: passiveAmount > 0 ? passiveAmount : 1
    };

    const itemSource = (source.item && typeof source.item === 'object') ? source.item : source;
    const itemEnabledRaw = itemSource.enabled === true || source.itemEnabled === true;
    const itemKey = sanitizeRewardKey(itemSource.key ?? itemSource.id ?? source.itemKey ?? '');
    const itemAmount = clampRewardAmount(itemSource.amount ?? source.itemAmount ?? 1, { min: -MAX_REWARD_AMOUNT, max: MAX_REWARD_AMOUNT });
    const hasItemAmount = itemAmount !== 0;
    base.item = {
      enabled: itemEnabledRaw && !!itemKey && hasItemAmount,
      key: itemKey,
      amount: hasItemAmount ? itemAmount : 0
    };

    const spSource = (source.sp && typeof source.sp === 'object') ? source.sp : source;
    const spEnabledRaw = spSource.enabled === true || source.spEnabled === true;
    const spAmount = clampRewardAmount(spSource.amount ?? spSource.value ?? source.spAmount ?? source.spValue ?? 0, { min: 0 });
    base.sp = {
      enabled: spEnabledRaw && spAmount > 0,
      amount: spAmount > 0 ? spAmount : 0
    };

    return base;
  }

  function ensureTaskRewards(task){
    if (!task || typeof task !== 'object') return sanitizeTaskRewards(null);
    const sanitized = sanitizeTaskRewards(task.rewards);
    task.rewards = sanitized;
    return sanitized;
  }

  function sanitizeColor(value){
    if (typeof value !== 'string') return '#f97316';
    const hex = value.trim();
    if (/^#([0-9a-fA-F]{3}){1,2}$/.test(hex)) return hex;
    return '#f97316';
  }

  function sanitizeString(value, fallback = ''){
    if (typeof value !== 'string') return fallback;
    return value.slice(0, MAX_MEMO);
  }

  function loadPersistentState(defaultName = '名称未設定'){
    const fallbackName = typeof defaultName === 'string' && defaultName.trim() ? defaultName : '名称未設定';
    DEFAULT_AUTO_NAMES.add(fallbackName);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(item => {
        if (!item || typeof item !== 'object') return null;
        const id = typeof item.id === 'string' && item.id ? item.id : `todo_${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`;
        const rawName = sanitizeString(item.name || '', '').slice(0, MAX_NAME).trim();
        const name = rawName || fallbackName;
        const memo = sanitizeString(item.memo || '', '');
        const xp = clampXp(item.xp);
        const color = sanitizeColor(item.color);
        const createdAt = Number.isFinite(item.createdAt) ? item.createdAt : Date.now();
        const completedAt = Number.isFinite(item.completedAt) ? item.completedAt : null;
        const status = item.status === 'completed' || item.status === 'failed' ? item.status : 'pending';
        const persistedAutoName = item.autoName === true;
        const inferredAutoName = !rawName && (DEFAULT_AUTO_NAMES.has(item.name) || DEFAULT_AUTO_NAMES.has(name));
        const autoName = persistedAutoName || inferredAutoName;
        const type = sanitizeTaskType(item.type);
        const achievedCountRaw = Number.isFinite(item.achievedCount) ? item.achievedCount : Number.isFinite(item.completedCount) ? item.completedCount : 0;
        const achievedCount = Math.max(0, Math.floor(achievedCountRaw));
        if (autoName) {
          DEFAULT_AUTO_NAMES.add(name);
        }
        const rewards = sanitizeTaskRewards(item.rewards);
        return { id, name, memo, xp, color, createdAt, completedAt, status, autoName, type, achievedCount, rewards };
      }).filter(Boolean);
    } catch {
      return [];
    }
  }

  function writePersistentState(tasks){
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {}
  }

  function formatDate(ts, i18n, options){
    if (ts === null || ts === undefined) return '-';
    try {
      const date = ts instanceof Date ? ts : new Date(ts);
      if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '-';
      if (i18n && typeof i18n.formatDate === 'function'){
        try {
          return i18n.formatDate(date, options);
        } catch {}
      }
      if (options && typeof date.toLocaleString === 'function'){
        return date.toLocaleString(undefined, options);
      }
      return date.toLocaleString();
    } catch {
      try {
        return new Date(ts).toISOString();
      } catch {
        return '-';
      }
    }
  }

  function create(root, awardXp, opts = {}){
    if (!root) throw new Error('MiniExp ToDo requires a container');

    let i18n = (typeof window !== 'undefined' && typeof window.I18n === 'object') ? window.I18n : null;
    const playerApi = (opts && typeof opts === 'object' && opts.player && typeof opts.player === 'object') ? opts.player : null;
    const shortcuts = (opts && typeof opts === 'object' && opts.shortcuts && typeof opts.shortcuts === 'object') ? opts.shortcuts : null;

    const HOST_SHORTCUT_KEYS = Object.freeze(['r', 'p']);
    let hostShortcutsSuppressed = false;

    function suppressHostShortcuts(){
      if (hostShortcutsSuppressed || !shortcuts) return;
      HOST_SHORTCUT_KEYS.forEach(key => {
        try {
          if (typeof shortcuts.disableKey === 'function') {
            shortcuts.disableKey.call(shortcuts, key);
          } else if (typeof shortcuts.setKeyEnabled === 'function') {
            shortcuts.setKeyEnabled(key, false);
          }
        } catch {}
      });
      hostShortcutsSuppressed = true;
    }

    function restoreHostShortcuts(){
      if (!hostShortcutsSuppressed || !shortcuts) return;
      HOST_SHORTCUT_KEYS.forEach(key => {
        try {
          if (typeof shortcuts.enableKey === 'function') {
            shortcuts.enableKey.call(shortcuts, key);
          } else if (typeof shortcuts.setKeyEnabled === 'function') {
            shortcuts.setKeyEnabled(key, true);
          }
        } catch {}
      });
      hostShortcutsSuppressed = false;
    }

    const getI18n = () => {
      if (typeof window !== 'undefined' && typeof window.I18n === 'object'){
        if (i18n !== window.I18n){
          i18n = window.I18n;
        }
      }
      return i18n;
    };

    const applyParams = (value, params) => {
      if (!params || typeof value !== 'string') return value;
      return value.replace(/\{([^{}]+)\}/g, (match, token) => {
        const key = token.trim();
        if (!key) return match;
        const paramValue = params[key];
        return paramValue === undefined || paramValue === null ? match : String(paramValue);
      });
    };

    const translate = (key, fallback, params) => {
      const instance = getI18n();
      if (key && typeof instance?.t === 'function') {
        try {
          const value = instance.t(key, params);
          if (typeof value === 'string' && value !== key) return value;
          if (value !== undefined && value !== null && value !== key) return value;
        } catch {}
      }
      let result = fallback;
      if (typeof fallback === 'function') {
        try {
          result = fallback();
        } catch {
          result = '';
        }
      }
      if (result === undefined || result === null) {
        if (typeof key === 'string') return key;
        return '';
      }
      if (typeof result === 'string') {
        return applyParams(result, params);
      }
      return result;
    };

    const formatNumber = (value, options) => {
      const instance = getI18n();
      if (typeof instance?.formatNumber === 'function') {
        try {
          return instance.formatNumber(value, options);
        } catch {}
      }
      try {
        return new Intl.NumberFormat(undefined, options).format(value);
      } catch {}
      return String(value);
    };

    let defaultTaskName = '名称未設定';
    DEFAULT_AUTO_NAMES.add(defaultTaskName);
    const dateTimeOptions = { dateStyle: 'medium', timeStyle: 'short' };
    const headerDateOptions = { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' };

    const state = {
      tasks: loadPersistentState(defaultTaskName),
      editingTaskId: null,
      sessionXp: 0
    };
    const collapseState = {
      pending: false,
      completed: false
    };

    function setDefaultTaskName(nextName){
      const sanitized = sanitizeString(nextName || '', '').slice(0, MAX_NAME).trim() || '名称未設定';
      if (sanitized === defaultTaskName) return false;
      const previous = defaultTaskName;
      defaultTaskName = sanitized;
      DEFAULT_AUTO_NAMES.add(sanitized);
      if (previous) {
        DEFAULT_AUTO_NAMES.add(previous);
      }
      let mutated = false;
      state.tasks.forEach(task => {
        if (task.autoName) {
          if (task.name !== sanitized) {
            task.name = sanitized;
            mutated = true;
          }
        } else if (DEFAULT_AUTO_NAMES.has(task.name) && task.status !== undefined) {
          task.autoName = true;
          task.name = sanitized;
          mutated = true;
        }
      });
      if (mutated) {
        persist();
      }
      return mutated;
    }

    let isRunning = false;
    let localeUnsubscribe = null;
    let detachDocumentLocale = null;
    let lastAppliedLocale = null;

    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.padding = '24px';
    wrapper.style.boxSizing = 'border-box';
    wrapper.style.background = '#ffffff';
    wrapper.style.fontFamily = '"Noto Sans JP", "Hiragino Sans", sans-serif';
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '16px';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.justifyContent = 'space-between';
    header.style.flexWrap = 'wrap';
    header.style.gap = '12px';

    const titleWrap = document.createElement('div');
    titleWrap.style.display = 'flex';
    titleWrap.style.flexDirection = 'column';
    titleWrap.style.gap = '4px';

    const title = document.createElement('h2');
    title.style.margin = '0';
    title.style.fontSize = '24px';
    title.style.color = '#111827';

    const subtitle = document.createElement('div');
    subtitle.style.fontSize = '14px';
    subtitle.style.color = '#6b7280';

    titleWrap.appendChild(title);
    titleWrap.appendChild(subtitle);

    const stats = document.createElement('div');
    stats.style.fontSize = '14px';
    stats.style.color = '#374151';

    header.appendChild(titleWrap);
    header.appendChild(stats);

    const formCard = document.createElement('form');
    formCard.className = 'todo-form';
    formCard.style.display = 'grid';
    formCard.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
    formCard.style.gap = '12px';
    formCard.style.background = '#f9fafb';
    formCard.style.padding = '16px';
    formCard.style.borderRadius = '12px';
    formCard.style.border = '1px solid #e5e7eb';
    formCard.style.boxShadow = '0 8px 24px rgba(15,23,42,0.08)';

    const formTitle = document.createElement('h3');
    formTitle.style.gridColumn = '1 / -1';
    formTitle.style.margin = '0';
    formTitle.style.fontSize = '18px';
    formTitle.style.color = '#1f2937';

    const nameLabel = document.createElement('label');
    nameLabel.style.display = 'flex';
    nameLabel.style.flexDirection = 'column';
    nameLabel.style.fontSize = '14px';
    nameLabel.style.color = '#374151';

    const nameLabelText = document.createElement('span');
    nameLabelText.style.fontWeight = '600';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.required = true;
    nameInput.maxLength = MAX_NAME;
    nameInput.style.marginTop = '4px';
    nameInput.style.padding = '10px 12px';
    nameInput.style.borderRadius = '8px';
    nameInput.style.border = '1px solid #cbd5f5';
    nameInput.style.fontSize = '14px';
    nameLabel.appendChild(nameLabelText);
    nameLabel.appendChild(nameInput);

    const typeLabel = document.createElement('label');
    typeLabel.style.display = 'flex';
    typeLabel.style.flexDirection = 'column';
    typeLabel.style.fontSize = '14px';
    typeLabel.style.color = '#374151';

    const typeLabelText = document.createElement('span');
    typeLabelText.style.fontWeight = '600';

    const typeSelect = document.createElement('select');
    typeSelect.style.marginTop = '4px';
    typeSelect.style.padding = '10px 12px';
    typeSelect.style.borderRadius = '8px';
    typeSelect.style.border = '1px solid #cbd5f5';
    typeSelect.style.fontSize = '14px';

    const typeOptionSingle = document.createElement('option');
    typeOptionSingle.value = TASK_TYPE_SINGLE;
    const typeOptionRepeatable = document.createElement('option');
    typeOptionRepeatable.value = TASK_TYPE_REPEATABLE;
    typeSelect.appendChild(typeOptionSingle);
    typeSelect.appendChild(typeOptionRepeatable);

    typeLabel.appendChild(typeLabelText);
    typeLabel.appendChild(typeSelect);

    const xpLabel = document.createElement('label');
    xpLabel.style.display = 'flex';
    xpLabel.style.flexDirection = 'column';
    xpLabel.style.fontSize = '14px';
    xpLabel.style.color = '#374151';

    const xpLabelText = document.createElement('span');
    xpLabelText.style.fontWeight = '600';

    const xpInput = document.createElement('input');
    xpInput.type = 'number';
    xpInput.min = String(-MAX_XP);
    xpInput.max = String(MAX_XP);
    xpInput.step = '1';
    xpInput.required = true;
    xpInput.value = '25';
    xpInput.style.marginTop = '4px';
    xpInput.style.padding = '10px 12px';
    xpInput.style.borderRadius = '8px';
    xpInput.style.border = '1px solid #cbd5f5';
    xpInput.style.fontSize = '14px';
    xpLabel.appendChild(xpLabelText);
    xpLabel.appendChild(xpInput);

    const rewardsSection = document.createElement('div');
    rewardsSection.style.gridColumn = '1 / -1';
    rewardsSection.style.display = 'flex';
    rewardsSection.style.flexDirection = 'column';
    rewardsSection.style.gap = '10px';
    rewardsSection.style.padding = '12px';
    rewardsSection.style.borderRadius = '10px';
    rewardsSection.style.border = '1px solid #d1d5db';
    rewardsSection.style.background = '#ffffff';

    const rewardsTitle = document.createElement('div');
    rewardsTitle.style.fontSize = '14px';
    rewardsTitle.style.fontWeight = '600';
    rewardsTitle.style.color = '#1f2937';
    rewardsSection.appendChild(rewardsTitle);

    function makeRewardRow(){
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.flexWrap = 'wrap';
      row.style.gap = '8px';
      row.style.alignItems = 'center';
      return row;
    }

    function makeToggleLabel(){
      const label = document.createElement('label');
      label.style.display = 'inline-flex';
      label.style.alignItems = 'center';
      label.style.gap = '6px';
      label.style.fontWeight = '600';
      label.style.fontSize = '13px';
      return label;
    }

    function makeAmountLabel(){
      const label = document.createElement('label');
      label.style.display = 'inline-flex';
      label.style.alignItems = 'center';
      label.style.gap = '6px';
      label.style.fontSize = '13px';
      return label;
    }

    const passiveRow = makeRewardRow();
    const passiveToggleLabel = makeToggleLabel();
    const passiveEnableInput = document.createElement('input');
    passiveEnableInput.type = 'checkbox';
    const passiveEnableText = document.createElement('span');
    passiveToggleLabel.appendChild(passiveEnableInput);
    passiveToggleLabel.appendChild(passiveEnableText);

    const passiveOrbIdInput = document.createElement('select');
    passiveOrbIdInput.style.padding = '8px 10px';
    passiveOrbIdInput.style.borderRadius = '8px';
    passiveOrbIdInput.style.border = '1px solid #cbd5f5';
    passiveOrbIdInput.style.fontSize = '13px';
    passiveOrbIdInput.style.minWidth = '200px';
    passiveOrbIdInput.style.background = '#ffffff';
    passiveOrbIdInput.style.color = '#111827';
    passiveOrbIdInput.style.cursor = 'pointer';

    const passiveAmountLabel = makeAmountLabel();
    const passiveAmountText = document.createElement('span');
    const passiveAmountInput = document.createElement('input');
    passiveAmountInput.type = 'number';
    passiveAmountInput.min = '1';
    passiveAmountInput.max = String(MAX_REWARD_AMOUNT);
    passiveAmountInput.step = '1';
    passiveAmountInput.value = '1';
    passiveAmountInput.style.width = '90px';
    passiveAmountInput.style.padding = '6px 8px';
    passiveAmountInput.style.borderRadius = '8px';
    passiveAmountInput.style.border = '1px solid #cbd5f5';
    passiveAmountInput.style.fontSize = '13px';
    passiveAmountLabel.appendChild(passiveAmountText);
    passiveAmountLabel.appendChild(passiveAmountInput);

    passiveRow.appendChild(passiveToggleLabel);
    passiveRow.appendChild(passiveOrbIdInput);
    passiveRow.appendChild(passiveAmountLabel);
    rewardsSection.appendChild(passiveRow);

    const itemRow = makeRewardRow();
    const itemToggleLabel = makeToggleLabel();
    const itemEnableInput = document.createElement('input');
    itemEnableInput.type = 'checkbox';
    const itemEnableText = document.createElement('span');
    itemToggleLabel.appendChild(itemEnableInput);
    itemToggleLabel.appendChild(itemEnableText);

    const itemKeyInput = document.createElement('select');
    itemKeyInput.style.padding = '8px 10px';
    itemKeyInput.style.borderRadius = '8px';
    itemKeyInput.style.border = '1px solid #cbd5f5';
    itemKeyInput.style.fontSize = '13px';
    itemKeyInput.style.minWidth = '200px';
    itemKeyInput.style.background = '#ffffff';
    itemKeyInput.style.color = '#111827';
    itemKeyInput.style.cursor = 'pointer';

    const itemAmountLabel = makeAmountLabel();
    const itemAmountText = document.createElement('span');
    const itemAmountInput = document.createElement('input');
    itemAmountInput.type = 'number';
    itemAmountInput.min = String(-MAX_REWARD_AMOUNT);
    itemAmountInput.max = String(MAX_REWARD_AMOUNT);
    itemAmountInput.step = '1';
    itemAmountInput.value = '1';
    itemAmountInput.style.width = '90px';
    itemAmountInput.style.padding = '6px 8px';
    itemAmountInput.style.borderRadius = '8px';
    itemAmountInput.style.border = '1px solid #cbd5f5';
    itemAmountInput.style.fontSize = '13px';
    itemAmountLabel.appendChild(itemAmountText);
    itemAmountLabel.appendChild(itemAmountInput);

    itemRow.appendChild(itemToggleLabel);
    itemRow.appendChild(itemKeyInput);
    itemRow.appendChild(itemAmountLabel);
    rewardsSection.appendChild(itemRow);

    const spRow = makeRewardRow();
    const spToggleLabel = makeToggleLabel();
    const spEnableInput = document.createElement('input');
    spEnableInput.type = 'checkbox';
    const spEnableText = document.createElement('span');
    spToggleLabel.appendChild(spEnableInput);
    spToggleLabel.appendChild(spEnableText);

    const spAmountLabel = makeAmountLabel();
    const spAmountText = document.createElement('span');
    const spAmountInput = document.createElement('input');
    spAmountInput.type = 'number';
    spAmountInput.min = '1';
    spAmountInput.max = String(MAX_REWARD_AMOUNT);
    spAmountInput.step = '1';
    spAmountInput.value = '10';
    spAmountInput.style.width = '90px';
    spAmountInput.style.padding = '6px 8px';
    spAmountInput.style.borderRadius = '8px';
    spAmountInput.style.border = '1px solid #cbd5f5';
    spAmountInput.style.fontSize = '13px';
    spAmountLabel.appendChild(spAmountText);
    spAmountLabel.appendChild(spAmountInput);

    spRow.appendChild(spToggleLabel);
    spRow.appendChild(spAmountLabel);
    rewardsSection.appendChild(spRow);

    const PASSIVE_ORB_DEFS_REF = (typeof window !== 'undefined' && window.PASSIVE_ORB_DEFS && typeof window.PASSIVE_ORB_DEFS === 'object') ? window.PASSIVE_ORB_DEFS : {};
    const PASSIVE_ORB_KNOWN_IDS = (() => {
      const ids = new Set();
      if (typeof window !== 'undefined' && Array.isArray(window.PASSIVE_ORB_IDS)) {
        window.PASSIVE_ORB_IDS.forEach(id => ids.add(id));
      }
      Object.keys(PASSIVE_ORB_DEFS_REF || {}).forEach(id => ids.add(id));
      return ids;
    })();

    const DEFAULT_ITEM_IDS = Object.freeze(['potion30', 'hpBoost', 'atkBoost', 'defBoost', 'hpBoostMajor', 'atkBoostMajor', 'defBoostMajor', 'spElixir']);
    const DEFAULT_ITEM_LABEL_FALLBACKS = Object.freeze({
      potion30: { key: 'games.todoList.form.rewards.item.defaults.potion30', defaultText: 'Potion (30%)' },
      hpBoost: { key: 'games.todoList.form.rewards.item.defaults.hpBoost', defaultText: 'HP Boost' },
      atkBoost: { key: 'games.todoList.form.rewards.item.defaults.atkBoost', defaultText: 'ATK Boost' },
      defBoost: { key: 'games.todoList.form.rewards.item.defaults.defBoost', defaultText: 'DEF Boost' },
      hpBoostMajor: { key: 'games.todoList.form.rewards.item.defaults.hpBoostMajor', defaultText: 'Grand HP Boost' },
      atkBoostMajor: { key: 'games.todoList.form.rewards.item.defaults.atkBoostMajor', defaultText: 'Grand ATK Boost' },
      defBoostMajor: { key: 'games.todoList.form.rewards.item.defaults.defBoostMajor', defaultText: 'Grand DEF Boost' },
      spElixir: { key: 'games.todoList.form.rewards.item.defaults.spElixir', defaultText: 'SP Elixir' }
    });

    function getDefaultItemLabel(id){
      const fallback = DEFAULT_ITEM_LABEL_FALLBACKS[id];
      if (!fallback) return id;
      return translate(fallback.key, fallback.defaultText);
    }

    function ensureSelectHasValue(select, value, label){
      if (!select || !value) return;
      const exists = Array.from(select.options).some(option => option.value === value);
      if (exists) return;
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label || value;
      select.appendChild(option);
    }

    function getPassiveOrbLabel(id){
      if (!id) return '';
      const fallbackLabel = (PASSIVE_ORB_DEFS_REF && PASSIVE_ORB_DEFS_REF[id] && typeof PASSIVE_ORB_DEFS_REF[id].label === 'string')
        ? PASSIVE_ORB_DEFS_REF[id].label
        : id;
      let label = translate(`game.passiveOrb.orbs.${id}.name`, () => fallbackLabel);
      if (!PASSIVE_ORB_KNOWN_IDS.has(id) && (!label || label === id)){ 
        label = translate('games.todoList.form.rewards.passiveOrb.customOption', '{value} (保存済み)', { value: id });
      }
      return label || id;
    }

    function getItemLabel(id){
      if (!id) return '';
      const fallback = DEFAULT_ITEM_IDS.includes(id) ? getDefaultItemLabel(id) : id;
      let label = translate(`game.items.${id}.label`, () => fallback);
      if ((!DEFAULT_ITEM_IDS.includes(id)) && (!label || label === fallback || label === id)){
        label = translate('games.todoList.form.rewards.item.customOption', '{value} (保存済み)', { value: id });
      }
      return label || fallback || id;
    }

    function collectPassiveOrbIds(){
      const ids = new Set();
      PASSIVE_ORB_KNOWN_IDS.forEach(id => ids.add(id));
      if (typeof playerApi?.getState === 'function'){
        try {
          const snapshot = playerApi.getState();
          const inventory = snapshot && typeof snapshot === 'object' ? snapshot.inventory : null;
          const passiveOrbs = inventory && typeof inventory === 'object' ? inventory.passiveOrbs : null;
          if (passiveOrbs && typeof passiveOrbs === 'object'){
            Object.keys(passiveOrbs).forEach(id => ids.add(id));
          }
        } catch {}
      }
      state.tasks.forEach(task => {
        const rewards = ensureTaskRewards(task);
        if (rewards.passiveOrb?.orbId) ids.add(rewards.passiveOrb.orbId);
      });
      return Array.from(ids).filter(Boolean);
    }

    function collectItemIds(){
      const ids = new Set(DEFAULT_ITEM_IDS);
      if (typeof playerApi?.getState === 'function'){
        try {
          const snapshot = playerApi.getState();
          const inventory = snapshot && typeof snapshot === 'object' ? snapshot.inventory : null;
          if (inventory && typeof inventory === 'object'){
            Object.keys(inventory).forEach(key => {
              if (!key || key === 'passiveOrbs' || key === 'skillCharms') return;
              ids.add(key);
            });
          }
        } catch {}
      }
      state.tasks.forEach(task => {
        const rewards = ensureTaskRewards(task);
        if (rewards.item?.key) ids.add(rewards.item.key);
      });
      return Array.from(ids).filter(Boolean);
    }

    function refreshPassiveOrbSelect(preserveValue = true){
      const previous = preserveValue ? passiveOrbIdInput.value : '';
      const placeholderText = translate('games.todoList.form.rewards.passiveOrb.selectPlaceholder', 'パッシブオーブを選択');
      const entries = collectPassiveOrbIds().map(id => ({
        value: id,
        label: getPassiveOrbLabel(id)
      })).sort((a, b) => a.label.localeCompare(b.label));
      passiveOrbIdInput.innerHTML = '';
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = placeholderText;
      passiveOrbIdInput.appendChild(placeholder);
      entries.forEach(({ value, label }) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        passiveOrbIdInput.appendChild(option);
      });
      if (previous && Array.from(passiveOrbIdInput.options).some(option => option.value === previous)){
        passiveOrbIdInput.value = previous;
      } else {
        passiveOrbIdInput.value = '';
      }
    }

    function refreshItemSelect(preserveValue = true){
      const previous = preserveValue ? itemKeyInput.value : '';
      const placeholderText = translate('games.todoList.form.rewards.item.selectPlaceholder', 'アイテムを選択');
      const entries = collectItemIds().map(id => ({
        value: id,
        label: getItemLabel(id)
      })).sort((a, b) => a.label.localeCompare(b.label));
      itemKeyInput.innerHTML = '';
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = placeholderText;
      itemKeyInput.appendChild(placeholder);
      entries.forEach(({ value, label }) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        itemKeyInput.appendChild(option);
      });
      if (previous && Array.from(itemKeyInput.options).some(option => option.value === previous)){
        itemKeyInput.value = previous;
      } else {
        itemKeyInput.value = '';
      }
    }

    refreshPassiveOrbSelect(false);
    refreshItemSelect(false);

    function updatePassiveRowState(){
      const enabled = !!passiveEnableInput.checked;
      passiveOrbIdInput.disabled = !enabled;
      passiveAmountInput.disabled = !enabled;
      passiveRow.style.opacity = enabled ? '1' : '0.6';
    }

    function updateItemRowState(){
      const enabled = !!itemEnableInput.checked;
      itemKeyInput.disabled = !enabled;
      itemAmountInput.disabled = !enabled;
      itemRow.style.opacity = enabled ? '1' : '0.6';
    }

    function updateSpRowState(){
      const enabled = !!spEnableInput.checked;
      spAmountInput.disabled = !enabled;
      spRow.style.opacity = enabled ? '1' : '0.6';
    }

    passiveEnableInput.addEventListener('change', updatePassiveRowState);
    itemEnableInput.addEventListener('change', updateItemRowState);
    spEnableInput.addEventListener('change', updateSpRowState);

    updatePassiveRowState();
    updateItemRowState();
    updateSpRowState();

    const colorLabel = document.createElement('label');
    colorLabel.style.display = 'flex';
    colorLabel.style.flexDirection = 'column';
    colorLabel.style.fontSize = '14px';
    colorLabel.style.color = '#374151';

    const colorLabelText = document.createElement('span');
    colorLabelText.style.fontWeight = '600';

    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = '#f97316';
    colorInput.style.marginTop = '4px';
    colorInput.style.height = '42px';
    colorInput.style.border = '1px solid #cbd5f5';
    colorInput.style.borderRadius = '8px';
    colorLabel.appendChild(colorLabelText);
    colorLabel.appendChild(colorInput);

    const memoLabel = document.createElement('label');
    memoLabel.style.display = 'flex';
    memoLabel.style.flexDirection = 'column';
    memoLabel.style.fontSize = '14px';
    memoLabel.style.color = '#374151';
    memoLabel.style.gridColumn = '1 / -1';

    const memoLabelText = document.createElement('span');
    memoLabelText.style.fontWeight = '600';

    const memoInput = document.createElement('textarea');
    memoInput.maxLength = MAX_MEMO;
    memoInput.rows = 3;
    memoInput.style.marginTop = '4px';
    memoInput.style.padding = '10px 12px';
    memoInput.style.borderRadius = '8px';
    memoInput.style.border = '1px solid #cbd5f5';
    memoInput.style.fontSize = '14px';
    memoInput.style.resize = 'vertical';
    memoLabel.appendChild(memoLabelText);
    memoLabel.appendChild(memoInput);

    const buttonRow = document.createElement('div');
    buttonRow.style.gridColumn = '1 / -1';
    buttonRow.style.display = 'flex';
    buttonRow.style.gap = '12px';
    buttonRow.style.justifyContent = 'flex-end';

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.style.padding = '10px 18px';
    submitBtn.style.borderRadius = '999px';
    submitBtn.style.border = 'none';
    submitBtn.style.background = '#2563eb';
    submitBtn.style.color = '#ffffff';
    submitBtn.style.fontWeight = '600';
    submitBtn.style.cursor = 'pointer';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.style.padding = '10px 18px';
    cancelBtn.style.borderRadius = '999px';
    cancelBtn.style.border = '1px solid #cbd5f5';
    cancelBtn.style.background = '#ffffff';
    cancelBtn.style.color = '#1f2937';
    cancelBtn.style.cursor = 'pointer';

    buttonRow.appendChild(cancelBtn);
    buttonRow.appendChild(submitBtn);

    formCard.appendChild(formTitle);
    formCard.appendChild(nameLabel);
    formCard.appendChild(typeLabel);
    formCard.appendChild(xpLabel);
    formCard.appendChild(rewardsSection);
    formCard.appendChild(colorLabel);
    formCard.appendChild(memoLabel);
    formCard.appendChild(buttonRow);

    const listsWrap = document.createElement('div');
    listsWrap.style.display = 'grid';
    listsWrap.style.gridTemplateColumns = '1fr';
    listsWrap.style.gap = '20px';
    listsWrap.style.flex = '1';
    listsWrap.style.minHeight = '0';

    const pendingSection = document.createElement('section');
    const pendingTitle = document.createElement('h3');
    pendingTitle.style.margin = '0';
    pendingTitle.style.fontSize = '18px';
    pendingTitle.style.color = '#b91c1c';
    const pendingList = document.createElement('div');
    pendingList.id = 'todo_pending_list';
    pendingList.style.display = 'flex';
    pendingList.style.flexDirection = 'column';
    pendingList.style.gap = '12px';

    pendingSection.appendChild(pendingTitle);
    pendingSection.appendChild(pendingList);

    const completedSection = document.createElement('section');
    const completedTitle = document.createElement('h3');
    completedTitle.style.margin = '0';
    completedTitle.style.fontSize = '18px';
    completedTitle.style.color = '#6b7280';
    const completedList = document.createElement('div');
    completedList.id = 'todo_completed_list';
    completedList.style.display = 'flex';
    completedList.style.flexDirection = 'column';
    completedList.style.gap = '12px';

    completedSection.appendChild(completedTitle);
    completedSection.appendChild(completedList);

    const pendingSectionControls = makeCollapsibleSection(pendingTitle, pendingList, 'pending');
    const completedSectionControls = makeCollapsibleSection(completedTitle, completedList, 'completed');

    listsWrap.appendChild(pendingSection);
    listsWrap.appendChild(completedSection);

    wrapper.appendChild(header);
    wrapper.appendChild(formCard);
    wrapper.appendChild(listsWrap);

    root.appendChild(wrapper);

    function setFormMode(mode){
      if (mode === 'edit'){
        formTitle.textContent = translate('games.todoList.form.titleEdit', 'ToDoを編集');
        submitBtn.textContent = translate('games.todoList.form.submitUpdate', '更新');
      } else {
        formTitle.textContent = translate('games.todoList.form.titleCreate', '新規ToDoを登録');
        submitBtn.textContent = translate('games.todoList.form.submitCreate', '追加');
      }
    }

    function resetForm(){
      state.editingTaskId = null;
      setFormMode('create');
      refreshPassiveOrbSelect(false);
      refreshItemSelect(false);
      nameInput.value = '';
      typeSelect.value = TASK_TYPE_SINGLE;
      xpInput.value = '25';
      colorInput.value = '#f97316';
      memoInput.value = '';
      passiveEnableInput.checked = false;
      passiveOrbIdInput.value = '';
      passiveAmountInput.value = '1';
      itemEnableInput.checked = false;
      itemKeyInput.value = '';
      itemAmountInput.value = '1';
      spEnableInput.checked = false;
      spAmountInput.value = '10';
      updatePassiveRowState();
      updateItemRowState();
      updateSpRowState();
    }

    function fillForm(task){
      state.editingTaskId = task.id;
      setFormMode('edit');
      refreshPassiveOrbSelect(false);
      refreshItemSelect(false);
      nameInput.value = task.autoName ? '' : task.name;
      typeSelect.value = sanitizeTaskType(task.type);
      xpInput.value = String(task.xp);
      colorInput.value = task.color;
      memoInput.value = task.memo;
      const rewards = ensureTaskRewards(task);
      passiveEnableInput.checked = !!rewards.passiveOrb.enabled;
      if (rewards.passiveOrb?.orbId){
        ensureSelectHasValue(passiveOrbIdInput, rewards.passiveOrb.orbId, getPassiveOrbLabel(rewards.passiveOrb.orbId));
      }
      passiveOrbIdInput.value = rewards.passiveOrb.orbId || '';
      passiveAmountInput.value = String(rewards.passiveOrb.amount || 1);
      itemEnableInput.checked = !!rewards.item.enabled;
      if (rewards.item?.key){
        ensureSelectHasValue(itemKeyInput, rewards.item.key, getItemLabel(rewards.item.key));
      }
      itemKeyInput.value = rewards.item.key || '';
      itemAmountInput.value = String(rewards.item.amount || 1);
      spEnableInput.checked = !!rewards.sp.enabled;
      spAmountInput.value = String(rewards.sp.amount || 10);
      updatePassiveRowState();
      updateItemRowState();
      updateSpRowState();
    }

    function readRewardsFromForm(){
      return sanitizeTaskRewards({
        passiveOrb: {
          enabled: passiveEnableInput.checked,
          orbId: passiveOrbIdInput.value,
          amount: passiveAmountInput.value
        },
        item: {
          enabled: itemEnableInput.checked,
          key: itemKeyInput.value,
          amount: itemAmountInput.value
        },
        sp: {
          enabled: spEnableInput.checked,
          amount: spAmountInput.value
        }
      });
    }

    function persist(){
      state.tasks.forEach(task => {
        if (!task || typeof task !== 'object') return;
        task.xp = clampXp(task.xp);
        ensureTaskRewards(task);
      });
      writePersistentState(state.tasks);
    }

    function updateStats(){
      const pendingCount = state.tasks.filter(t => t.status === 'pending').length;
      const completedCount = state.tasks.filter(t => t.status !== 'pending').length;
      const totalAchievements = state.tasks.reduce((sum, task) => sum + (task.type === TASK_TYPE_REPEATABLE ? task.achievedCount || 0 : 0), 0);
      stats.textContent = translate('games.todoList.header.stats', '未完了: {pending}件 / 完了: {completed}件 / 達成: {achievements}回', {
        pending: formatNumber(pendingCount, { maximumFractionDigits: 0 }),
        completed: formatNumber(completedCount, { maximumFractionDigits: 0 }),
        achievements: formatNumber(totalAchievements, { maximumFractionDigits: 0 })
      });
    }

    function renderLists(){
      pendingList.innerHTML = '';
      completedList.innerHTML = '';
      const pending = state.tasks.filter(t => t.status === 'pending').sort((a, b) => a.createdAt - b.createdAt);
      const done = state.tasks.filter(t => t.status !== 'pending').sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

      if (pending.length === 0){
        const empty = document.createElement('div');
        empty.textContent = translate('games.todoList.sections.emptyPending', '未完了のToDoはありません。');
        empty.style.color = '#9ca3af';
        empty.style.fontSize = '14px';
        pendingList.appendChild(empty);
      } else {
        pending.forEach(task => pendingList.appendChild(renderTaskCard(task)));
      }

      if (done.length === 0){
        const empty = document.createElement('div');
        empty.textContent = translate('games.todoList.sections.emptyCompleted', '完了したToDoはまだありません。');
        empty.style.color = '#9ca3af';
        empty.style.fontSize = '14px';
        completedList.appendChild(empty);
      } else {
        done.forEach(task => completedList.appendChild(renderTaskCard(task)));
      }

      pendingSectionControls.update();
      completedSectionControls.update();
    }

    function applyTranslations(includeDynamic = false){
      const translatedDefaultName = translate('games.todoList.defaults.untitled', defaultTaskName);
      const defaultChanged = setDefaultTaskName(translatedDefaultName);
      title.textContent = translate('games.todoList.header.title', 'ToDoリスト');
      const headerDateText = (() => {
        const now = Date.now();
        const formatted = formatDate(now, getI18n(), headerDateOptions);
        if (formatted && formatted !== '-') return formatted;
        try {
          return new Date(now).toLocaleDateString(undefined, headerDateOptions);
        } catch {
          return new Date(now).toDateString();
        }
      })();
      subtitle.textContent = translate('games.todoList.header.today', () => headerDateText, { date: headerDateText });

      nameLabelText.textContent = translate('games.todoList.form.name', '名前');
      nameInput.placeholder = translate('games.todoList.form.namePlaceholder', '例: 日次レポートを送信');

      typeLabelText.textContent = translate('games.todoList.form.type', 'タイプ');
      typeOptionSingle.textContent = translate('games.todoList.form.typeSingle', '単発');
      typeOptionRepeatable.textContent = translate('games.todoList.form.typeRepeatable', '繰り返し');

      xpLabelText.textContent = translate('games.todoList.form.xp', 'EXP変化量（マイナスで没収）');
      rewardsTitle.textContent = translate('games.todoList.form.rewards.title', '追加報酬');
      passiveEnableText.textContent = translate('games.todoList.form.rewards.passiveOrb.label', 'パッシブオーブ');
      const passiveSelectPlaceholder = translate('games.todoList.form.rewards.passiveOrb.selectPlaceholder', 'パッシブオーブを選択');
      passiveOrbIdInput.title = passiveSelectPlaceholder;
      passiveOrbIdInput.setAttribute('aria-label', passiveSelectPlaceholder);
      passiveAmountText.textContent = translate('games.todoList.form.rewards.passiveOrb.amount', '個数');
      itemEnableText.textContent = translate('games.todoList.form.rewards.item.label', 'アイテム');
      const itemSelectPlaceholder = translate('games.todoList.form.rewards.item.selectPlaceholder', 'アイテムを選択');
      itemKeyInput.title = itemSelectPlaceholder;
      itemKeyInput.setAttribute('aria-label', itemSelectPlaceholder);
      itemAmountText.textContent = translate('games.todoList.form.rewards.item.amount', '個数（マイナスで没収）');
      spEnableText.textContent = translate('games.todoList.form.rewards.sp.label', 'SP');
      spAmountText.textContent = translate('games.todoList.form.rewards.sp.amount', '量');
      colorLabelText.textContent = translate('games.todoList.form.color', 'カラー');
      memoLabelText.textContent = translate('games.todoList.form.memo', 'メモ');
      memoInput.placeholder = translate('games.todoList.form.memoPlaceholder', '補足情報やチェックポイントなどを入力');

      refreshPassiveOrbSelect(true);
      refreshItemSelect(true);

      cancelBtn.textContent = translate('games.todoList.form.cancel', 'キャンセル');

      pendingSectionControls.setLabel(translate('games.todoList.sections.pending', '未完了タスク'));
      completedSectionControls.setLabel(translate('games.todoList.sections.completed', '完了済みタスク'));

      setFormMode(state.editingTaskId ? 'edit' : 'create');

      if (includeDynamic || defaultChanged){
        updateStats();
        renderLists();
      }
    }

    function makeCollapsibleSection(titleEl, listEl, key){
      const icon = document.createElement('span');
      icon.textContent = '▼';
      icon.style.display = 'inline-flex';
      icon.style.alignItems = 'center';
      icon.style.justifyContent = 'center';
      icon.style.width = '18px';
      icon.style.fontSize = '12px';
      icon.style.color = titleEl.style.color || '#111827';

      const label = document.createElement('span');
      label.textContent = '';

      titleEl.textContent = '';
      titleEl.appendChild(icon);
      titleEl.appendChild(label);
      titleEl.style.display = 'flex';
      titleEl.style.alignItems = 'center';
      titleEl.style.gap = '6px';
      titleEl.style.cursor = 'pointer';
      titleEl.style.userSelect = 'none';
      titleEl.tabIndex = 0;
      titleEl.setAttribute('role', 'button');
      if (!listEl.id){
        listEl.id = `todo_section_${key}`;
      }
      titleEl.setAttribute('aria-controls', listEl.id);

      const setLabel = (text) => {
        const safe = text ?? '';
        label.textContent = safe;
        titleEl.setAttribute('aria-label', safe);
      };

      function update(){
        const collapsed = !!collapseState[key];
        icon.textContent = collapsed ? '▶' : '▼';
        listEl.style.display = collapsed ? 'none' : 'flex';
        titleEl.setAttribute('aria-expanded', String(!collapsed));
      }

      function toggle(){
        collapseState[key] = !collapseState[key];
        update();
      }

      titleEl.addEventListener('click', toggle);
      titleEl.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' '){
          event.preventDefault();
          toggle();
        }
      });

      update();
      return {
        update,
        setLabel
      };
    }

    function renderTaskCard(task){
      const rewards = ensureTaskRewards(task);
      const card = document.createElement('div');
      card.style.display = 'flex';
      card.style.gap = '16px';
      card.style.alignItems = 'stretch';
      card.style.padding = '16px';
      card.style.borderRadius = '12px';
      card.style.border = '2px solid';
      card.style.background = '#ffffff';
      card.style.boxShadow = '0 6px 20px rgba(15,23,42,0.08)';

      const colorBar = document.createElement('div');
      colorBar.style.width = '6px';
      colorBar.style.borderRadius = '4px';
      colorBar.style.background = task.color;

      const body = document.createElement('div');
      body.style.flex = '1';
      body.style.display = 'flex';
      body.style.flexDirection = 'column';
      body.style.gap = '6px';

      const titleRow = document.createElement('div');
      titleRow.style.display = 'flex';
      titleRow.style.alignItems = 'center';
      titleRow.style.gap = '8px';
      titleRow.style.justifyContent = 'space-between';

      const name = document.createElement('div');
      name.textContent = task.name;
      name.style.fontSize = '16px';
      name.style.fontWeight = '600';
      name.style.flexGrow = '1';

      function makeChip(text, background, textColor){
        const chip = document.createElement('span');
        chip.textContent = text;
        chip.style.padding = '2px 8px';
        chip.style.borderRadius = '999px';
        chip.style.background = background;
        chip.style.color = textColor;
        chip.style.fontSize = '12px';
        chip.style.fontWeight = '600';
        return chip;
      }

      const chipRow = document.createElement('div');
      chipRow.style.display = 'flex';
      chipRow.style.flexWrap = 'wrap';
      chipRow.style.gap = '6px';
      chipRow.style.alignItems = 'center';

      const xpChip = makeChip(
        translate('games.todoList.task.xpChip', '{xp} EXP', {
          xp: formatNumber(task.xp, { maximumFractionDigits: 0 })
        }),
        '#fee2e2',
        '#991b1b'
      );
      chipRow.appendChild(xpChip);

      if (rewards.passiveOrb.enabled){
        const passiveText = translate('games.todoList.task.rewards.passiveOrb', 'オーブ: {orb} ×{amount}', {
          orb: rewards.passiveOrb.orbId,
          amount: formatNumber(rewards.passiveOrb.amount, { maximumFractionDigits: 0 })
        });
        chipRow.appendChild(makeChip(passiveText, '#ede9fe', '#5b21b6'));
      }

      if (rewards.item.enabled){
        const itemText = translate('games.todoList.task.rewards.item', '{item} ×{amount}', {
          item: rewards.item.key,
          amount: formatNumber(rewards.item.amount, { maximumFractionDigits: 0 })
        });
        chipRow.appendChild(makeChip(itemText, '#dbeafe', '#1d4ed8'));
      }

      if (rewards.sp.enabled){
        const spText = translate('games.todoList.task.rewards.sp', '+{amount} SP', {
          amount: formatNumber(rewards.sp.amount, { maximumFractionDigits: 0 })
        });
        chipRow.appendChild(makeChip(spText, '#cffafe', '#0f766e'));
      }

      const colorChip = document.createElement('span');
      colorChip.textContent = '●';
      colorChip.style.color = task.color;
      colorChip.style.fontSize = '14px';
      chipRow.appendChild(colorChip);

      titleRow.appendChild(name);
      titleRow.appendChild(chipRow);

      const memo = document.createElement('div');
      memo.textContent = task.memo || translate('games.todoList.task.memoEmpty', 'メモなし');
      memo.style.fontSize = '14px';
      memo.style.color = '#4b5563';

      const meta = document.createElement('div');
      meta.style.display = 'flex';
      meta.style.flexWrap = 'wrap';
      meta.style.gap = '12px';
      meta.style.fontSize = '12px';
      meta.style.color = '#6b7280';
      const createdLabel = document.createElement('span');
      createdLabel.textContent = translate('games.todoList.task.createdAt', '登録: {date}', {
        date: formatDate(task.createdAt, getI18n(), dateTimeOptions)
      });
      meta.appendChild(createdLabel);
      if (task.completedAt){
        const completedLabel = document.createElement('span');
        completedLabel.textContent = translate('games.todoList.task.completedAt', '完了: {date}', {
          date: formatDate(task.completedAt, getI18n(), dateTimeOptions)
        });
        meta.appendChild(completedLabel);
      }

      if (task.type === TASK_TYPE_REPEATABLE){
        const achievedLabel = document.createElement('span');
        achievedLabel.textContent = translate('games.todoList.task.repeatableCount', '達成回数: {count}回', {
          count: formatNumber(task.achievedCount || 0, { maximumFractionDigits: 0 })
        });
        meta.appendChild(achievedLabel);
      }

      const statusWrap = document.createElement('div');
      statusWrap.style.display = 'flex';
      statusWrap.style.gap = '8px';
      statusWrap.style.alignItems = 'center';

      if (task.status === 'completed' || task.status === 'failed'){
        const statusBadge = document.createElement('span');
        statusBadge.style.padding = '2px 8px';
        statusBadge.style.borderRadius = '999px';
        statusBadge.style.fontSize = '12px';
        statusBadge.style.fontWeight = '600';
        if (task.status === 'completed'){
          statusBadge.textContent = translate('games.todoList.task.statusCompleted', '成功');
          statusBadge.style.background = '#dcfce7';
          statusBadge.style.color = '#166534';
        } else {
          statusBadge.textContent = translate('games.todoList.task.statusFailed', '失敗');
          statusBadge.style.background = '#fee2e2';
          statusBadge.style.color = '#b91c1c';
        }
        statusWrap.appendChild(statusBadge);
      }

      body.appendChild(titleRow);
      body.appendChild(memo);
      body.appendChild(meta);
      body.appendChild(statusWrap);

      const actions = document.createElement('div');
      actions.style.display = 'flex';
      actions.style.flexDirection = 'column';
      actions.style.justifyContent = 'center';
      actions.style.gap = '8px';

      function makeButton(label, color, handler){
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = label;
        btn.style.padding = '6px 10px';
        btn.style.borderRadius = '8px';
        btn.style.border = 'none';
        btn.style.cursor = 'pointer';
        btn.style.fontSize = '13px';
        btn.style.fontWeight = '600';
        btn.style.background = color.background;
        btn.style.color = color.text;
        btn.addEventListener('click', handler);
        btn.addEventListener('pointerenter', () => { btn.style.filter = 'brightness(0.9)'; });
        btn.addEventListener('pointerleave', () => { btn.style.filter = 'none'; });
        return btn;
      }

      if (task.status === 'pending'){
        card.style.borderColor = '#ef4444';
        if (task.type === TASK_TYPE_REPEATABLE){
          const achieveBtn = makeButton(translate('games.todoList.task.actions.achieve', '達成'), { background: '#34d399', text: '#064e3b' }, () => achieveTask(task.id));
          actions.appendChild(achieveBtn);
        }
        const completeBtn = makeButton(translate('games.todoList.task.actions.complete', '完了'), { background: '#22c55e', text: '#064e3b' }, () => markTask(task.id, 'completed'));
        const failBtn = makeButton(translate('games.todoList.task.actions.fail', '失敗'), { background: '#f97316', text: '#7c2d12' }, () => markTask(task.id, 'failed'));
        const editBtn = makeButton(translate('games.todoList.task.actions.edit', '編集'), { background: '#93c5fd', text: '#1d4ed8' }, () => { fillForm(task); nameInput.focus(); });
        const deleteBtn = makeButton(translate('games.todoList.task.actions.delete', '削除'), { background: '#e5e7eb', text: '#374151' }, () => deleteTask(task.id));
        actions.appendChild(completeBtn);
        actions.appendChild(failBtn);
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
      } else {
        card.style.borderColor = '#d1d5db';
        card.style.color = '#6b7280';
        name.style.color = '#4b5563';
        memo.style.color = '#6b7280';
        const editBtn = makeButton(translate('games.todoList.task.actions.edit', '編集'), { background: '#bfdbfe', text: '#1d4ed8' }, () => { fillForm(task); nameInput.focus(); });
        const deleteBtn = makeButton(translate('games.todoList.task.actions.delete', '削除'), { background: '#e5e7eb', text: '#4b5563' }, () => deleteTask(task.id));
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
      }

      card.appendChild(colorBar);
      card.appendChild(body);
      card.appendChild(actions);
      return card;
    }

    function applyTaskRewards(task, meta){
      const rewards = ensureTaskRewards(task);
      let xpDelta = 0;
      const xpAmount = Number(task.xp) || 0;
      if (xpAmount !== 0 && typeof awardXp === 'function'){
        try {
          const gained = awardXp(xpAmount, meta);
          const numeric = Number(gained);
          if (Number.isFinite(numeric)){
            xpDelta = numeric;
          } else if (Number.isFinite(xpAmount)){
            xpDelta = xpAmount;
          }
        } catch {}
      }
      if (playerApi && rewards.sp.enabled && rewards.sp.amount > 0 && typeof playerApi.adjustSp === 'function'){
        try {
          playerApi.adjustSp(rewards.sp.amount, { source: 'todo_list', reason: meta?.type || 'todo_list' });
        } catch {}
      }
      if (playerApi && rewards.item.enabled && rewards.item.key){
        const itemAmount = Number(rewards.item.amount) || 0;
        if (itemAmount !== 0){
          const payload = { [rewards.item.key]: itemAmount };
          if (itemAmount > 0 && typeof playerApi.awardItems === 'function'){
            try {
              playerApi.awardItems(payload, { allowNegative: false });
            } catch {}
          } else if (itemAmount < 0){
            const handler = typeof playerApi.adjustItems === 'function' ? playerApi.adjustItems : playerApi.awardItems;
            if (typeof handler === 'function'){
              try {
                handler(payload, { allowNegative: true });
              } catch {}
            }
          }
        }
      }
      if (playerApi && rewards.passiveOrb.enabled && rewards.passiveOrb.orbId && typeof playerApi.awardPassiveOrb === 'function'){
        try {
          playerApi.awardPassiveOrb(rewards.passiveOrb.orbId, rewards.passiveOrb.amount, { source: meta?.type || 'todo_list' });
        } catch {}
      }
      return xpDelta;
    }

    function deleteTask(id){
      const idx = state.tasks.findIndex(t => t.id === id);
      if (idx === -1) return;
      if (!confirm(translate('games.todoList.dialogs.confirmDelete', 'このToDoを削除しますか？'))) return;
      state.tasks.splice(idx, 1);
      if (state.editingTaskId === id){
        resetForm();
      }
      persist();
      updateStats();
      renderLists();
    }

    function markTask(id, status){
      const task = state.tasks.find(t => t.id === id);
      if (!task) return;
      if (task.status !== 'pending') return;
      task.status = status === 'completed' ? 'completed' : 'failed';
      task.completedAt = Date.now();
      persist();
      if (task.status === 'completed'){
        const meta = { type: 'todo-complete', todoId: task.id, name: task.name };
        const gained = applyTaskRewards(task, meta);
        if (gained !== 0) state.sessionXp += gained;
      }
      updateStats();
      renderLists();
    }

    function achieveTask(id){
      const task = state.tasks.find(t => t.id === id);
      if (!task) return;
      if (task.status !== 'pending') return;
      if (task.type !== TASK_TYPE_REPEATABLE) return;
      const nextCount = Math.max(0, (task.achievedCount || 0) + 1);
      task.achievedCount = nextCount;
      const meta = { type: 'todo-achieve', todoId: task.id, name: task.name, count: nextCount };
      const gained = applyTaskRewards(task, meta);
      if (gained !== 0) state.sessionXp += gained;
      persist();
      updateStats();
      renderLists();
    }

    formCard.addEventListener('submit', (event) => {
      event.preventDefault();
      const rawName = sanitizeString(nameInput.value || '', '').slice(0, MAX_NAME).trim();
      const isAutoName = !rawName;
      const name = isAutoName ? defaultTaskName : rawName;
      if (!name){
        alert(translate('games.todoList.dialogs.requireName', '名前を入力してください。'));
        nameInput.focus();
        return;
      }
      const xp = clampXp(xpInput.value);
      const type = sanitizeTaskType(typeSelect.value);
      const color = sanitizeColor(colorInput.value);
      const memo = sanitizeString(memoInput.value || '', '');
      const rewards = readRewardsFromForm();
      if (state.editingTaskId){
        const task = state.tasks.find(t => t.id === state.editingTaskId);
        if (!task){
          resetForm();
        } else {
          task.name = name;
          task.autoName = isAutoName;
          task.type = type;
          task.xp = xp;
          task.color = color;
          task.memo = memo;
          task.rewards = rewards;
          persist();
        }
      } else {
        const now = Date.now();
        const id = `todo_${now}_${Math.random().toString(36).slice(2, 8)}`;
        state.tasks.push({
          id,
          name,
          autoName: isAutoName,
          memo,
          xp,
          color,
          type,
          achievedCount: 0,
          rewards,
          createdAt: now,
          completedAt: null,
          status: 'pending'
        });
        persist();
      }
      resetForm();
      updateStats();
      renderLists();
    });

    cancelBtn.addEventListener('click', () => {
      resetForm();
    });

    formCard.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter'){
        e.preventDefault();
        submitBtn.click();
      }
    });

    function start(){
      if (isRunning) return;
      isRunning = true;
      suppressHostShortcuts();
      updateStats();
      renderLists();
      nameInput.focus();
    }

    function stop(){
      if (!isRunning) return;
      isRunning = false;
      restoreHostShortcuts();
      persist();
    }

    function destroy(){
      stop();
      restoreHostShortcuts();
      if (typeof localeUnsubscribe === 'function'){
        localeUnsubscribe();
        localeUnsubscribe = null;
      }
      if (typeof detachDocumentLocale === 'function'){
        detachDocumentLocale();
        detachDocumentLocale = null;
      }
      root.removeChild(wrapper);
    }

    const runtime = {
      start,
      stop,
      destroy,
      getScore(){ return state.sessionXp; }
    };

    applyTranslations(false);

    function subscribeLocale(){
      const instance = getI18n();
      if (instance && typeof instance.onLocaleChanged === 'function' && !localeUnsubscribe){
        localeUnsubscribe = instance.onLocaleChanged(() => {
          handleLocaleChange();
        });
      }
    }

    function handleLocaleChange(){
      i18n = null;
      const instance = getI18n();
      subscribeLocale();
      const nextLocale = instance && typeof instance.getLocale === 'function' ? instance.getLocale() : null;
      if (nextLocale && lastAppliedLocale && nextLocale === lastAppliedLocale){
        return;
      }
      applyTranslations(true);
      lastAppliedLocale = nextLocale || lastAppliedLocale;
    }

    subscribeLocale();

    if (typeof document !== 'undefined' && typeof document.addEventListener === 'function'){
      const listener = () => handleLocaleChange();
      document.addEventListener('i18n:locale-changed', listener);
      detachDocumentLocale = () => {
        document.removeEventListener('i18n:locale-changed', listener);
      };
    }

    start();
    return runtime;
  }

  window.registerMiniGame({
    id: 'todo_list',
    name: 'ToDoリスト', nameKey: 'selection.miniexp.games.todo_list.name',
    description: '完了で設定EXPを獲得 / 失敗は獲得なし', descriptionKey: 'selection.miniexp.games.todo_list.description', categoryIds: ['utility'],
    category: 'ユーティリティ',
    version: '0.3.0',
    author: 'mod',
    create
  });
})();

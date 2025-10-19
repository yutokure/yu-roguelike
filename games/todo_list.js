(function(){
  const STORAGE_KEY = 'mini_todo_tasks_v1';
  const LOG_STORAGE_KEY = 'mini_todo_logs_v1';
  const MAX_NAME = 32;
  const MAX_MEMO = 256;
  const MAX_XP = 99999999;
  const MAX_REWARD_AMOUNT = 99999999;
  const MAX_REWARD_WEIGHT = 99999999;
  const MAX_REWARD_KEY_LENGTH = 64;
  const MAX_LOG_ENTRIES = 500;
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

  function clampRewardWeight(value){
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 0;
    const absolute = Math.abs(numeric);
    if (absolute < 1) return 0;
    const rounded = Math.floor(absolute);
    return rounded > MAX_REWARD_WEIGHT ? MAX_REWARD_WEIGHT : rounded;
  }

  function clampDropChance(value, fallback = 100){
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return fallback;
    if (numeric <= 0) return 0;
    if (numeric >= 100) return 100;
    return Math.round(numeric * 100) / 100;
  }

  function sanitizeRandomRange(raw, clampFn, fallbackValue = 0){
    const source = raw && typeof raw === 'object' ? raw : {};
    const enabledFlag = source.enabled === true || source.useRange === true || source.random === true || source.randomized === true;
    const clamp = typeof clampFn === 'function' ? clampFn : (value) => value;
    const fallback = clamp(fallbackValue);
    const readValue = (keyCandidates, defaultValue) => {
      for (const key of keyCandidates){
        if (source[key] !== undefined) return source[key];
      }
      return defaultValue;
    };
    const minRaw = readValue([
      'min',
      'minValue',
      'lower',
      'start',
      'from',
      'amountMin'
    ], fallback);
    const maxRaw = readValue([
      'max',
      'maxValue',
      'upper',
      'end',
      'to',
      'amountMax'
    ], fallback);
    let min = clamp(minRaw);
    let max = clamp(maxRaw);
    if (!Number.isFinite(min)) min = fallback;
    if (!Number.isFinite(max)) max = fallback;
    if (min > max){
      const tmp = min;
      min = max;
      max = tmp;
    }
    const enabled = enabledFlag && min !== max;
    return { enabled, min, max };
  }

  function isRangeEnabled(range){
    return !!(range && range.enabled && Number.isFinite(range.min) && Number.isFinite(range.max) && range.min !== range.max);
  }

  function resolveRandomValue(baseValue, range, clampFn, randomFn){
    const base = Number(baseValue) || 0;
    if (!isRangeEnabled(range)) return base;
    const clamp = typeof clampFn === 'function' ? clampFn : (value) => value;
    let min = Number(range.min);
    let max = Number(range.max);
    if (!Number.isFinite(min) || !Number.isFinite(max)) return base;
    if (min > max){
      const tmp = min;
      min = max;
      max = tmp;
    }
    min = clamp(min);
    max = clamp(max);
    if (min > max){
      const tmp = min;
      min = max;
      max = tmp;
    }
    if (min === max) return min;
    const low = Math.min(Math.round(min), Math.round(max));
    const high = Math.max(Math.round(min), Math.round(max));
    if (low === high) return low;
    const span = high - low;
    if (span <= 0) return low;
    const generator = typeof randomFn === 'function' ? randomFn : getRandomFloat;
    let sample;
    try {
      sample = generator();
    } catch {}
    if (!Number.isFinite(sample) || sample < 0 || sample >= 1){
      sample = getRandomFloat();
    }
    const value = low + Math.floor(sample * (span + 1));
    return value;
  }

  function getRandomFloat(){
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function'){
      try {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        return array[0] / 0x100000000;
      } catch {}
    }
    return Math.random();
  }

  function sanitizeRewardKey(value){
    if (typeof value !== 'string') return '';
    const trimmed = value.trim();
    if (!trimmed) return '';
    return trimmed.slice(0, MAX_REWARD_KEY_LENGTH);
  }

  function sanitizeTaskRewards(raw){
    const base = {
      passiveOrbs: { enabled: false, entries: [] },
      items: { enabled: false, entries: [], lootTable: { enabled: false, dropChance: 100, entries: [] } },
      sp: { enabled: false, amount: 0, range: { enabled: false, min: 0, max: 0 } }
    };
    const source = raw && typeof raw === 'object' ? raw : {};

    function readEnabledFlag(possibleSources){
      for (const value of possibleSources){
        if (value === true) return true;
        if (value === false) return false;
      }
      return null;
    }

    function sanitizeEntries(entries, {
      idKey = 'id',
      amountKey = 'amount',
      sanitizeId = sanitizeRewardKey,
      clampOptions = {},
      rangeSourceKey = 'range'
    } = {}){
      const list = Array.isArray(entries) ? entries : [];
      const sanitized = [];
      const clampValue = (value) => clampRewardAmount(value, clampOptions);
      list.forEach(entry => {
        if (!entry || typeof entry !== 'object') return;
        const idValue = sanitizeId(entry[idKey] ?? entry.key ?? entry.orbId ?? entry.id ?? '');
        if (!idValue) return;
        const rawAmount = entry[amountKey] ?? entry.amount ?? entry.value ?? 0;
        const amountValue = clampValue(rawAmount);
        const rangeSource = entry[rangeSourceKey] ?? entry.randomRange ?? entry.random ?? entry.amountRange ?? {};
        const range = sanitizeRandomRange(rangeSource, clampValue, amountValue);
        if (!Number.isFinite(amountValue) && !range.enabled) return;
        if (amountValue === 0 && !range.enabled) return;
        sanitized.push({ id: idValue, amount: Number.isFinite(amountValue) ? amountValue : 0, range });
      });
      return sanitized;
    }

    const passiveSources = [];
    if (Array.isArray(source.passiveOrbs)) passiveSources.push(source.passiveOrbs);
    if (source.passiveOrbs && typeof source.passiveOrbs === 'object' && Array.isArray(source.passiveOrbs.entries)){
      passiveSources.push(source.passiveOrbs.entries);
    }
    if (Array.isArray(source.passiveOrbEntries)) passiveSources.push(source.passiveOrbEntries);
    if (source.passiveOrb && typeof source.passiveOrb === 'object') passiveSources.push([source.passiveOrb]);
    if (source.passiveOrbId){
      passiveSources.push([{ orbId: source.passiveOrbId, amount: source.passiveOrbAmount ?? source.passiveOrb?.amount ?? source.amount }]);
    }
    const passiveEntriesRaw = passiveSources.find(entries => Array.isArray(entries)) || [];
    const passiveEntries = sanitizeEntries(passiveEntriesRaw, {
      idKey: 'orbId',
      clampOptions: { min: -MAX_REWARD_AMOUNT, max: MAX_REWARD_AMOUNT }
    }).map(entry => ({ orbId: entry.id, amount: entry.amount, range: entry.range }));
    const passiveEnabledFlag = readEnabledFlag([
      source.passiveOrbs?.enabled,
      source.passiveOrbsEnabled,
      source.passiveOrbEnabled,
      source.passiveOrb?.enabled
    ]);
    base.passiveOrbs = {
      enabled: passiveEnabledFlag === null ? passiveEntries.length > 0 : passiveEnabledFlag,
      entries: passiveEntries
    };

    const itemSources = [];
    if (Array.isArray(source.items)) itemSources.push(source.items);
    if (source.items && typeof source.items === 'object' && Array.isArray(source.items.entries)){
      itemSources.push(source.items.entries);
    }
    if (Array.isArray(source.itemEntries)) itemSources.push(source.itemEntries);
    if (source.item && typeof source.item === 'object') itemSources.push([source.item]);
    if (source.itemKey){
      itemSources.push([{ key: source.itemKey, amount: source.itemAmount ?? source.item?.amount ?? source.amount }]);
    }
    const itemEntriesRaw = itemSources.find(entries => Array.isArray(entries)) || [];
    const itemEntries = sanitizeEntries(itemEntriesRaw, {
      idKey: 'key',
      clampOptions: { min: -MAX_REWARD_AMOUNT, max: MAX_REWARD_AMOUNT }
    }).map(entry => ({ key: entry.id, amount: entry.amount, range: entry.range }));
    const itemEnabledFlag = readEnabledFlag([
      source.items?.enabled,
      source.itemsEnabled,
      source.itemEnabled,
      source.item?.enabled
    ]);

    const lootSource = (source.items && typeof source.items === 'object' && typeof source.items.lootTable === 'object')
      ? source.items.lootTable
      : (typeof source.itemLootTable === 'object' ? source.itemLootTable : {});
    const lootEntriesRaw = Array.isArray(lootSource?.entries) ? lootSource.entries : [];
    const lootEntries = [];
    const clampLootAmount = (value) => clampRewardAmount(value, { min: 0, max: MAX_REWARD_AMOUNT });
    lootEntriesRaw.forEach(entry => {
      if (!entry || typeof entry !== 'object') return;
      const key = sanitizeRewardKey(entry.key ?? entry.id ?? entry.item ?? '');
      if (!key) return;
      const weight = clampRewardWeight(entry.weight ?? entry.chance ?? entry.rate ?? entry.weightValue ?? entry.w);
      if (weight <= 0) return;
      const rawAmount = entry.amount ?? entry.value ?? entry.count ?? 1;
      const amount = clampLootAmount(rawAmount);
      const rangeSource = entry.range ?? entry.randomRange ?? entry.random ?? entry.amountRange ?? {};
      const range = sanitizeRandomRange(rangeSource, clampLootAmount, amount);
      if (amount === 0 && !range.enabled) return;
      lootEntries.push({ key, amount, weight, range });
    });
    const lootEnabledFlag = readEnabledFlag([
      lootSource?.enabled,
      lootSource?.useLootTable,
      lootSource?.lootEnabled
    ]);
    const lootDropChance = clampDropChance(lootSource?.dropChance ?? lootSource?.chance ?? lootSource?.probability ?? 100, 100);

    base.items = {
      enabled: itemEnabledFlag === null ? itemEntries.length > 0 || lootEntries.length > 0 : itemEnabledFlag,
      entries: itemEntries,
      lootTable: {
        enabled: lootEnabledFlag === null ? lootEntries.length > 0 : lootEnabledFlag,
        dropChance: lootDropChance,
        entries: lootEntries
      }
    };

    const spSource = (source.sp && typeof source.sp === 'object') ? source.sp : source;
    const spEnabledFlag = readEnabledFlag([spSource.enabled, source.spEnabled]);
    const clampSpValue = (value) => clampRewardAmount(value, {
      min: -MAX_REWARD_AMOUNT,
      max: MAX_REWARD_AMOUNT
    });
    const spAmount = clampSpValue(spSource.amount ?? spSource.value ?? source.spAmount ?? source.spValue ?? 0);
    const spRange = sanitizeRandomRange(spSource.range ?? spSource.randomRange ?? source.spRange ?? {}, clampSpValue, spAmount);
    base.sp = {
      enabled: spEnabledFlag === null ? spAmount !== 0 || spRange.enabled : spEnabledFlag,
      amount: spAmount,
      range: spRange
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

  function sanitizeLogEntry(entry, fallbackName){
    if (!entry || typeof entry !== 'object') return null;
    const fallback = sanitizeString(fallbackName || '', '名称未設定').slice(0, MAX_NAME).trim() || '名称未設定';
    const timestamp = Number.isFinite(entry.timestamp) ? entry.timestamp : Date.now();
    const rawName = sanitizeString(entry.name || '', '').slice(0, MAX_NAME).trim();
    const name = rawName || fallback;
    const action = entry.action === 'achieved' ? 'achieved' : 'completed';
    const id = (typeof entry.id === 'string' && entry.id)
      ? entry.id
      : `log_${timestamp}_${getRandomFloat().toString(36).slice(2, 10)}`;
    return { id, timestamp, name, action };
  }

  function sanitizeLogList(logs, fallbackName){
    const list = Array.isArray(logs) ? logs : [];
    const sanitized = [];
    list.forEach(entry => {
      const normalized = sanitizeLogEntry(entry, fallbackName);
      if (normalized) sanitized.push(normalized);
    });
    sanitized.sort((a, b) => b.timestamp - a.timestamp);
    if (sanitized.length > MAX_LOG_ENTRIES){
      sanitized.length = MAX_LOG_ENTRIES;
    }
    return sanitized;
  }

  function loadPersistentLogs(defaultName = '名称未設定'){
    try {
      const raw = localStorage.getItem(LOG_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return sanitizeLogList(parsed, defaultName);
    } catch {
      return [];
    }
  }

  function writePersistentLogs(logs){
    try {
      localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs));
    } catch {}
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
        const id = typeof item.id === 'string' && item.id ? item.id : `todo_${crypto.randomUUID?.() || getRandomFloat().toString(36).slice(2)}`;
        const rawName = sanitizeString(item.name || '', '').slice(0, MAX_NAME).trim();
        const name = rawName || fallbackName;
        const memo = sanitizeString(item.memo || '', '');
        const xp = clampXp(item.xp);
        const xpRange = sanitizeRandomRange(
          item.xpRange ?? item.xpRandomRange ?? item.randomXpRange ?? item.xpRandom ?? item.randomXp ?? {},
          clampXp,
          xp
        );
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
        return { id, name, memo, xp, xpRange, color, createdAt, completedAt, status, autoName, type, achievedCount, rewards };
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
    const randomOverride = typeof opts?.random === 'function' ? opts.random : null;

    const clampRandomSample = (value) => {
      if (!Number.isFinite(value)) return null;
      if (value <= 0) return 0;
      if (value >= 1) return 0.9999999999999999;
      return value;
    };

    function useRandom(){
      if (randomOverride){
        try {
          const candidate = clampRandomSample(Number(randomOverride()));
          if (candidate !== null) return candidate;
        } catch {}
      }
      return getRandomFloat();
    }

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

    const formatSignedValue = (value) => {
      const numeric = Number(value) || 0;
      const formatted = formatNumber(Math.abs(numeric), { maximumFractionDigits: 0 });
      if (numeric > 0) return `+${formatted}`;
      if (numeric < 0) return `-${formatted}`;
      return '0';
    };

    const formatRangeText = (base, range, { signed = false } = {}) => {
      if (!isRangeEnabled(range)){
        return signed ? formatSignedValue(base) : formatNumber(base, { maximumFractionDigits: 0 });
      }
      const minText = signed ? formatSignedValue(range.min) : formatNumber(range.min, { maximumFractionDigits: 0 });
      const maxText = signed ? formatSignedValue(range.max) : formatNumber(range.max, { maximumFractionDigits: 0 });
      return `${minText}~${maxText}`;
    };

    let defaultTaskName = '名称未設定';
    DEFAULT_AUTO_NAMES.add(defaultTaskName);
    const dateTimeOptions = { dateStyle: 'medium', timeStyle: 'short' };
    const headerDateOptions = { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' };

    const state = {
      tasks: loadPersistentState(defaultTaskName),
      logs: loadPersistentLogs(defaultTaskName),
      editingTaskId: null,
      sessionXp: 0
    };
    const randomRangeToggleNodes = [];
    const randomRangeMinNodes = [];
    const randomRangeMaxNodes = [];
    const lootDropChanceTextNodes = [];
    const lootWeightTextNodes = [];

    const removeNodeReference = (list, node) => {
      if (!Array.isArray(list) || !node) return;
      const index = list.indexOf(node);
      if (index !== -1) list.splice(index, 1);
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

    const xpRangeControls = document.createElement('div');
    xpRangeControls.style.display = 'flex';
    xpRangeControls.style.flexWrap = 'wrap';
    xpRangeControls.style.gap = '8px';
    xpRangeControls.style.alignItems = 'center';
    xpRangeControls.style.marginTop = '6px';

    const xpRandomLabel = document.createElement('label');
    xpRandomLabel.style.display = 'inline-flex';
    xpRandomLabel.style.alignItems = 'center';
    xpRandomLabel.style.gap = '6px';
    xpRandomLabel.style.fontSize = '12px';
    xpRandomLabel.style.fontWeight = '600';
    const xpRandomInput = document.createElement('input');
    xpRandomInput.type = 'checkbox';
    const xpRandomText = document.createElement('span');
    xpRandomLabel.appendChild(xpRandomInput);
    xpRandomLabel.appendChild(xpRandomText);

    const xpRangeInputs = document.createElement('div');
    xpRangeInputs.style.display = 'none';
    xpRangeInputs.style.flexWrap = 'wrap';
    xpRangeInputs.style.gap = '6px';
    xpRangeInputs.style.alignItems = 'center';

    const xpRangeMinLabel = makeRangeLabel();
    const xpRangeMinText = document.createElement('span');
    const xpRangeMinInput = document.createElement('input');
    xpRangeMinInput.type = 'number';
    xpRangeMinInput.min = xpInput.min;
    xpRangeMinInput.max = xpInput.max;
    xpRangeMinInput.step = '1';
    xpRangeMinInput.value = xpInput.value;
    xpRangeMinInput.style.width = '90px';
    xpRangeMinInput.style.padding = '6px 8px';
    xpRangeMinInput.style.borderRadius = '8px';
    xpRangeMinInput.style.border = '1px solid #cbd5f5';
    xpRangeMinInput.style.fontSize = '13px';
    xpRangeMinLabel.appendChild(xpRangeMinText);
    xpRangeMinLabel.appendChild(xpRangeMinInput);

    const xpRangeMaxLabel = makeRangeLabel();
    const xpRangeMaxText = document.createElement('span');
    const xpRangeMaxInput = document.createElement('input');
    xpRangeMaxInput.type = 'number';
    xpRangeMaxInput.min = xpInput.min;
    xpRangeMaxInput.max = xpInput.max;
    xpRangeMaxInput.step = '1';
    xpRangeMaxInput.value = xpInput.value;
    xpRangeMaxInput.style.width = '90px';
    xpRangeMaxInput.style.padding = '6px 8px';
    xpRangeMaxInput.style.borderRadius = '8px';
    xpRangeMaxInput.style.border = '1px solid #cbd5f5';
    xpRangeMaxInput.style.fontSize = '13px';
    xpRangeMaxLabel.appendChild(xpRangeMaxText);
    xpRangeMaxLabel.appendChild(xpRangeMaxInput);

    xpRangeInputs.appendChild(xpRangeMinLabel);
    xpRangeInputs.appendChild(xpRangeMaxLabel);

    xpRangeControls.appendChild(xpRandomLabel);
    xpRangeControls.appendChild(xpRangeInputs);
    randomRangeToggleNodes.push(xpRandomText);
    randomRangeMinNodes.push(xpRangeMinText);
    randomRangeMaxNodes.push(xpRangeMaxText);

    function updateXpRangeState(){
      const enabled = !!xpRandomInput.checked;
      xpRangeInputs.style.display = enabled ? 'inline-flex' : 'none';
      xpRangeMinInput.disabled = !enabled;
      xpRangeMaxInput.disabled = !enabled;
    }

    xpRandomInput.addEventListener('change', () => {
      if (xpRandomInput.checked){
        const value = clampXp(xpInput.value);
        xpRangeMinInput.value = String(value);
        xpRangeMaxInput.value = String(value);
      }
      updateXpRangeState();
    });

    xpLabel.appendChild(xpLabelText);
    xpLabel.appendChild(xpInput);
    xpLabel.appendChild(xpRangeControls);
    updateXpRangeState();

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

    function makeRangeLabel(fontSize = '12px'){
      const label = document.createElement('label');
      label.style.display = 'inline-flex';
      label.style.alignItems = 'center';
      label.style.gap = '4px';
      label.style.fontSize = fontSize;
      return label;
    }

    const passiveRow = makeRewardRow();
    const passiveToggleLabel = makeToggleLabel();
    const passiveEnableInput = document.createElement('input');
    passiveEnableInput.type = 'checkbox';
    const passiveEnableText = document.createElement('span');
    passiveToggleLabel.appendChild(passiveEnableInput);
    passiveToggleLabel.appendChild(passiveEnableText);

    const passiveAddButton = document.createElement('button');
    passiveAddButton.type = 'button';
    passiveAddButton.style.padding = '6px 12px';
    passiveAddButton.style.borderRadius = '8px';
    passiveAddButton.style.border = '1px solid #cbd5f5';
    passiveAddButton.style.background = '#f3f4f6';
    passiveAddButton.style.color = '#1f2937';
    passiveAddButton.style.fontSize = '12px';
    passiveAddButton.style.fontWeight = '600';
    passiveAddButton.style.cursor = 'pointer';
    passiveAddButton.textContent = '追加';

    passiveRow.appendChild(passiveToggleLabel);
    passiveRow.appendChild(passiveAddButton);
    rewardsSection.appendChild(passiveRow);

    const passiveEntriesContainer = document.createElement('div');
    passiveEntriesContainer.style.display = 'flex';
    passiveEntriesContainer.style.flexDirection = 'column';
    passiveEntriesContainer.style.gap = '6px';
    passiveEntriesContainer.style.paddingLeft = '26px';
    rewardsSection.appendChild(passiveEntriesContainer);

    const passiveEntryRows = [];
    const passiveAmountTexts = [];
    let passiveSelectPlaceholderText = 'パッシブオーブを選択';
    let passiveAmountLabelText = '個数（マイナスで没収）';

    const itemRow = makeRewardRow();
    const itemToggleLabel = makeToggleLabel();
    const itemEnableInput = document.createElement('input');
    itemEnableInput.type = 'checkbox';
    const itemEnableText = document.createElement('span');
    itemToggleLabel.appendChild(itemEnableInput);
    itemToggleLabel.appendChild(itemEnableText);

    const itemAddButton = document.createElement('button');
    itemAddButton.type = 'button';
    itemAddButton.style.padding = '6px 12px';
    itemAddButton.style.borderRadius = '8px';
    itemAddButton.style.border = '1px solid #cbd5f5';
    itemAddButton.style.background = '#f3f4f6';
    itemAddButton.style.color = '#1f2937';
    itemAddButton.style.fontSize = '12px';
    itemAddButton.style.fontWeight = '600';
    itemAddButton.style.cursor = 'pointer';
    itemAddButton.textContent = '追加';

    itemRow.appendChild(itemToggleLabel);
    itemRow.appendChild(itemAddButton);
    rewardsSection.appendChild(itemRow);

    const itemEntriesContainer = document.createElement('div');
    itemEntriesContainer.style.display = 'flex';
    itemEntriesContainer.style.flexDirection = 'column';
    itemEntriesContainer.style.gap = '6px';
    itemEntriesContainer.style.paddingLeft = '26px';
    rewardsSection.appendChild(itemEntriesContainer);

    const itemEntryRows = [];
    const itemAmountTexts = [];
    let itemSelectPlaceholderText = 'アイテムを選択';
    let itemAmountLabelText = '個数（マイナスで没収）';

    const lootTableSection = document.createElement('div');
    lootTableSection.style.display = 'flex';
    lootTableSection.style.flexDirection = 'column';
    lootTableSection.style.gap = '6px';
    lootTableSection.style.padding = '12px';
    lootTableSection.style.marginLeft = '26px';
    lootTableSection.style.borderRadius = '10px';
    lootTableSection.style.border = '1px dashed #cbd5f5';
    lootTableSection.style.background = '#f9fafb';

    const lootHeaderRow = makeRewardRow();
    const lootToggleLabel = makeToggleLabel();
    lootToggleLabel.style.fontSize = '12px';
    const lootEnableInput = document.createElement('input');
    lootEnableInput.type = 'checkbox';
    const lootEnableText = document.createElement('span');
    lootToggleLabel.appendChild(lootEnableInput);
    lootToggleLabel.appendChild(lootEnableText);

    const lootAddButton = document.createElement('button');
    lootAddButton.type = 'button';
    lootAddButton.style.padding = '6px 12px';
    lootAddButton.style.borderRadius = '8px';
    lootAddButton.style.border = '1px solid #cbd5f5';
    lootAddButton.style.background = '#e0f2fe';
    lootAddButton.style.color = '#0f172a';
    lootAddButton.style.fontSize = '12px';
    lootAddButton.style.fontWeight = '600';
    lootAddButton.style.cursor = 'pointer';
    lootAddButton.textContent = '追加';

    lootHeaderRow.appendChild(lootToggleLabel);
    lootHeaderRow.appendChild(lootAddButton);

    const lootChanceRow = makeRewardRow();
    const lootChanceLabel = makeAmountLabel();
    lootChanceLabel.style.fontSize = '12px';
    const lootChanceText = document.createElement('span');
    const lootChanceInput = document.createElement('input');
    lootChanceInput.type = 'number';
    lootChanceInput.min = '0';
    lootChanceInput.max = '100';
    lootChanceInput.step = '0.1';
    lootChanceInput.value = '100';
    lootChanceInput.style.width = '90px';
    lootChanceInput.style.padding = '6px 8px';
    lootChanceInput.style.borderRadius = '8px';
    lootChanceInput.style.border = '1px solid #cbd5f5';
    lootChanceInput.style.fontSize = '13px';
    lootChanceLabel.appendChild(lootChanceText);
    lootChanceLabel.appendChild(lootChanceInput);
    lootChanceRow.appendChild(lootChanceLabel);

    const lootEntriesContainer = document.createElement('div');
    lootEntriesContainer.style.display = 'flex';
    lootEntriesContainer.style.flexDirection = 'column';
    lootEntriesContainer.style.gap = '6px';

    lootTableSection.appendChild(lootHeaderRow);
    lootTableSection.appendChild(lootChanceRow);
    lootTableSection.appendChild(lootEntriesContainer);
    rewardsSection.appendChild(lootTableSection);
    lootDropChanceTextNodes.push(lootChanceText);

    const sanitizeLootChanceInput = () => {
      const clamped = clampDropChance(lootChanceInput.value, 100);
      lootChanceInput.value = String(clamped);
    };
    ['change', 'blur'].forEach(eventName => {
      lootChanceInput.addEventListener(eventName, sanitizeLootChanceInput);
    });

    const lootEntryRows = [];

    function createPassiveEntryRow(initial = {}){
      const row = makeRewardRow();
      const select = document.createElement('select');
      select.style.padding = '8px 10px';
      select.style.borderRadius = '8px';
      select.style.border = '1px solid #cbd5f5';
      select.style.fontSize = '13px';
      select.style.minWidth = '200px';
      select.style.background = '#ffffff';
      select.style.color = '#111827';
      select.style.cursor = 'pointer';

      const amountLabel = makeAmountLabel();
      const amountText = document.createElement('span');
      const amountInput = document.createElement('input');
      amountInput.type = 'number';
      amountInput.min = String(-MAX_REWARD_AMOUNT);
      amountInput.max = String(MAX_REWARD_AMOUNT);
      amountInput.step = '1';
      const baseAmount = Number.isFinite(Number(initial.amount)) ? Number(initial.amount) : 1;
      amountInput.value = String(baseAmount);
      amountInput.style.width = '90px';
      amountInput.style.padding = '6px 8px';
      amountInput.style.borderRadius = '8px';
      amountInput.style.border = '1px solid #cbd5f5';
      amountInput.style.fontSize = '13px';
      amountLabel.appendChild(amountText);
      amountLabel.appendChild(amountInput);

      const rangeToggle = makeToggleLabel();
      rangeToggle.style.fontSize = '12px';
      rangeToggle.style.fontWeight = '600';
      const rangeCheckbox = document.createElement('input');
      rangeCheckbox.type = 'checkbox';
      const rangeToggleText = document.createElement('span');
      rangeToggle.appendChild(rangeCheckbox);
      rangeToggle.appendChild(rangeToggleText);

      const rangeContainer = document.createElement('div');
      rangeContainer.style.display = 'none';
      rangeContainer.style.alignItems = 'center';
      rangeContainer.style.flexWrap = 'wrap';
      rangeContainer.style.gap = '6px';

      const rangeMinLabel = makeRangeLabel();
      const rangeMinText = document.createElement('span');
      const rangeMinInput = document.createElement('input');
      rangeMinInput.type = 'number';
      rangeMinInput.min = String(-MAX_REWARD_AMOUNT);
      rangeMinInput.max = String(MAX_REWARD_AMOUNT);
      rangeMinInput.step = '1';
      rangeMinInput.value = String(baseAmount);
      rangeMinInput.style.width = '90px';
      rangeMinInput.style.padding = '6px 8px';
      rangeMinInput.style.borderRadius = '8px';
      rangeMinInput.style.border = '1px solid #cbd5f5';
      rangeMinInput.style.fontSize = '13px';
      rangeMinLabel.appendChild(rangeMinText);
      rangeMinLabel.appendChild(rangeMinInput);

      const rangeMaxLabel = makeRangeLabel();
      const rangeMaxText = document.createElement('span');
      const rangeMaxInput = document.createElement('input');
      rangeMaxInput.type = 'number';
      rangeMaxInput.min = String(-MAX_REWARD_AMOUNT);
      rangeMaxInput.max = String(MAX_REWARD_AMOUNT);
      rangeMaxInput.step = '1';
      rangeMaxInput.value = String(baseAmount);
      rangeMaxInput.style.width = '90px';
      rangeMaxInput.style.padding = '6px 8px';
      rangeMaxInput.style.borderRadius = '8px';
      rangeMaxInput.style.border = '1px solid #cbd5f5';
      rangeMaxInput.style.fontSize = '13px';
      rangeMaxLabel.appendChild(rangeMaxText);
      rangeMaxLabel.appendChild(rangeMaxInput);

      rangeContainer.appendChild(rangeMinLabel);
      rangeContainer.appendChild(rangeMaxLabel);

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.textContent = '×';
      removeBtn.style.padding = '4px 8px';
      removeBtn.style.borderRadius = '8px';
      removeBtn.style.border = '1px solid #f87171';
      removeBtn.style.background = '#fee2e2';
      removeBtn.style.color = '#b91c1c';
      removeBtn.style.cursor = 'pointer';
      removeBtn.style.fontWeight = '600';

      row.appendChild(select);
      row.appendChild(amountLabel);
      row.appendChild(rangeToggle);
      row.appendChild(rangeContainer);
      row.appendChild(removeBtn);
      passiveEntriesContainer.appendChild(row);

      const entry = {
        row,
        select,
        amountInput,
        removeBtn,
        amountText,
        rangeToggleText,
        rangeMinText,
        rangeMaxText,
        rangeCheckbox,
        rangeMinInput,
        rangeMaxInput,
        rangeContainer,
        updateRangeState(parentEnabled = !rangeCheckbox.disabled){
          const rangeEnabled = parentEnabled && !!rangeCheckbox.checked;
          rangeContainer.style.display = rangeEnabled ? 'inline-flex' : 'none';
          rangeMinInput.disabled = !rangeEnabled;
          rangeMaxInput.disabled = !rangeEnabled;
        }
      };
      passiveEntryRows.push(entry);
      passiveAmountTexts.push(amountText);
      randomRangeToggleNodes.push(rangeToggleText);
      randomRangeMinNodes.push(rangeMinText);
      randomRangeMaxNodes.push(rangeMaxText);

      refreshPassiveOrbSelect(true);

      removeBtn.addEventListener('click', () => {
        if (row.parentNode) row.parentNode.removeChild(row);
        const index = passiveEntryRows.indexOf(entry);
        if (index !== -1) passiveEntryRows.splice(index, 1);
        removeNodeReference(passiveAmountTexts, amountText);
        removeNodeReference(randomRangeToggleNodes, rangeToggleText);
        removeNodeReference(randomRangeMinNodes, rangeMinText);
        removeNodeReference(randomRangeMaxNodes, rangeMaxText);
        updatePassiveRowState();
        refreshPassiveOrbSelect(true);
      });

      rangeCheckbox.addEventListener('change', () => {
        if (rangeCheckbox.checked){
          const value = clampRewardAmount(amountInput.value, { min: -MAX_REWARD_AMOUNT, max: MAX_REWARD_AMOUNT });
          rangeMinInput.value = String(value);
          rangeMaxInput.value = String(value);
        }
        entry.updateRangeState(!rangeCheckbox.disabled);
      });

      select.title = passiveSelectPlaceholderText;
      select.setAttribute('aria-label', passiveSelectPlaceholderText);
      amountText.textContent = passiveAmountLabelText;

      if (initial.orbId){
        ensureSelectHasValue(select, initial.orbId, getPassiveOrbLabel(initial.orbId));
        select.value = initial.orbId;
      }

      if (initial.range && initial.range.enabled){
        rangeCheckbox.checked = true;
        rangeMinInput.value = String(initial.range.min);
        rangeMaxInput.value = String(initial.range.max);
      }

      entry.updateRangeState(!rangeCheckbox.disabled);
      return entry;
    }

    function createItemEntryRow(initial = {}){
      const row = makeRewardRow();
      const select = document.createElement('select');
      select.style.padding = '8px 10px';
      select.style.borderRadius = '8px';
      select.style.border = '1px solid #cbd5f5';
      select.style.fontSize = '13px';
      select.style.minWidth = '200px';
      select.style.background = '#ffffff';
      select.style.color = '#111827';
      select.style.cursor = 'pointer';

      const amountLabel = makeAmountLabel();
      const amountText = document.createElement('span');
      const amountInput = document.createElement('input');
      amountInput.type = 'number';
      amountInput.min = String(-MAX_REWARD_AMOUNT);
      amountInput.max = String(MAX_REWARD_AMOUNT);
      amountInput.step = '1';
      const baseAmount = Number.isFinite(Number(initial.amount)) ? Number(initial.amount) : 1;
      amountInput.value = String(baseAmount);
      amountInput.style.width = '90px';
      amountInput.style.padding = '6px 8px';
      amountInput.style.borderRadius = '8px';
      amountInput.style.border = '1px solid #cbd5f5';
      amountInput.style.fontSize = '13px';
      amountLabel.appendChild(amountText);
      amountLabel.appendChild(amountInput);

      const rangeToggle = makeToggleLabel();
      rangeToggle.style.fontSize = '12px';
      rangeToggle.style.fontWeight = '600';
      const rangeCheckbox = document.createElement('input');
      rangeCheckbox.type = 'checkbox';
      const rangeToggleText = document.createElement('span');
      rangeToggle.appendChild(rangeCheckbox);
      rangeToggle.appendChild(rangeToggleText);

      const rangeContainer = document.createElement('div');
      rangeContainer.style.display = 'none';
      rangeContainer.style.alignItems = 'center';
      rangeContainer.style.flexWrap = 'wrap';
      rangeContainer.style.gap = '6px';

      const rangeMinLabel = makeRangeLabel();
      const rangeMinText = document.createElement('span');
      const rangeMinInput = document.createElement('input');
      rangeMinInput.type = 'number';
      rangeMinInput.min = String(-MAX_REWARD_AMOUNT);
      rangeMinInput.max = String(MAX_REWARD_AMOUNT);
      rangeMinInput.step = '1';
      rangeMinInput.value = String(baseAmount);
      rangeMinInput.style.width = '90px';
      rangeMinInput.style.padding = '6px 8px';
      rangeMinInput.style.borderRadius = '8px';
      rangeMinInput.style.border = '1px solid #cbd5f5';
      rangeMinInput.style.fontSize = '13px';
      rangeMinLabel.appendChild(rangeMinText);
      rangeMinLabel.appendChild(rangeMinInput);

      const rangeMaxLabel = makeRangeLabel();
      const rangeMaxText = document.createElement('span');
      const rangeMaxInput = document.createElement('input');
      rangeMaxInput.type = 'number';
      rangeMaxInput.min = String(-MAX_REWARD_AMOUNT);
      rangeMaxInput.max = String(MAX_REWARD_AMOUNT);
      rangeMaxInput.step = '1';
      rangeMaxInput.value = String(baseAmount);
      rangeMaxInput.style.width = '90px';
      rangeMaxInput.style.padding = '6px 8px';
      rangeMaxInput.style.borderRadius = '8px';
      rangeMaxInput.style.border = '1px solid #cbd5f5';
      rangeMaxInput.style.fontSize = '13px';
      rangeMaxLabel.appendChild(rangeMaxText);
      rangeMaxLabel.appendChild(rangeMaxInput);

      rangeContainer.appendChild(rangeMinLabel);
      rangeContainer.appendChild(rangeMaxLabel);

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.textContent = '×';
      removeBtn.style.padding = '4px 8px';
      removeBtn.style.borderRadius = '8px';
      removeBtn.style.border = '1px solid #f87171';
      removeBtn.style.background = '#fee2e2';
      removeBtn.style.color = '#b91c1c';
      removeBtn.style.cursor = 'pointer';
      removeBtn.style.fontWeight = '600';

      row.appendChild(select);
      row.appendChild(amountLabel);
      row.appendChild(rangeToggle);
      row.appendChild(rangeContainer);
      row.appendChild(removeBtn);
      itemEntriesContainer.appendChild(row);

      const entry = {
        row,
        select,
        amountInput,
        removeBtn,
        amountText,
        rangeToggleText,
        rangeMinText,
        rangeMaxText,
        rangeCheckbox,
        rangeMinInput,
        rangeMaxInput,
        rangeContainer,
        updateRangeState(parentEnabled = !rangeCheckbox.disabled){
          const rangeEnabled = parentEnabled && !!rangeCheckbox.checked;
          rangeContainer.style.display = rangeEnabled ? 'inline-flex' : 'none';
          rangeMinInput.disabled = !rangeEnabled;
          rangeMaxInput.disabled = !rangeEnabled;
        }
      };
      itemEntryRows.push(entry);
      itemAmountTexts.push(amountText);
      randomRangeToggleNodes.push(rangeToggleText);
      randomRangeMinNodes.push(rangeMinText);
      randomRangeMaxNodes.push(rangeMaxText);

      refreshItemSelect(true);

      removeBtn.addEventListener('click', () => {
        if (row.parentNode) row.parentNode.removeChild(row);
        const index = itemEntryRows.indexOf(entry);
        if (index !== -1) itemEntryRows.splice(index, 1);
        removeNodeReference(itemAmountTexts, amountText);
        removeNodeReference(randomRangeToggleNodes, rangeToggleText);
        removeNodeReference(randomRangeMinNodes, rangeMinText);
        removeNodeReference(randomRangeMaxNodes, rangeMaxText);
        updateItemRowState();
        refreshItemSelect(true);
      });

      rangeCheckbox.addEventListener('change', () => {
        if (rangeCheckbox.checked){
          const value = clampRewardAmount(amountInput.value, { min: -MAX_REWARD_AMOUNT, max: MAX_REWARD_AMOUNT });
          rangeMinInput.value = String(value);
          rangeMaxInput.value = String(value);
        }
        entry.updateRangeState(!rangeCheckbox.disabled);
      });

      select.title = itemSelectPlaceholderText;
      select.setAttribute('aria-label', itemSelectPlaceholderText);
      amountText.textContent = itemAmountLabelText;

      if (initial.key){
        ensureSelectHasValue(select, initial.key, getItemLabel(initial.key));
        select.value = initial.key;
      }

      if (initial.range && initial.range.enabled){
        rangeCheckbox.checked = true;
        rangeMinInput.value = String(initial.range.min);
        rangeMaxInput.value = String(initial.range.max);
      }

      entry.updateRangeState(!rangeCheckbox.disabled);
      return entry;
    }

    function createLootEntryRow(initial = {}){
      const row = makeRewardRow();
      const select = document.createElement('select');
      select.style.padding = '8px 10px';
      select.style.borderRadius = '8px';
      select.style.border = '1px solid #cbd5f5';
      select.style.fontSize = '13px';
      select.style.minWidth = '200px';
      select.style.background = '#ffffff';
      select.style.color = '#111827';
      select.style.cursor = 'pointer';

      const weightLabel = makeAmountLabel();
      weightLabel.style.fontSize = '12px';
      const weightText = document.createElement('span');
      const weightInput = document.createElement('input');
      weightInput.type = 'number';
      weightInput.min = '1';
      weightInput.max = String(MAX_REWARD_WEIGHT);
      weightInput.step = '1';
      weightInput.value = String(clampRewardWeight(initial.weight ?? 1) || 1);
      weightInput.style.width = '80px';
      weightInput.style.padding = '6px 8px';
      weightInput.style.borderRadius = '8px';
      weightInput.style.border = '1px solid #cbd5f5';
      weightInput.style.fontSize = '13px';
      weightLabel.appendChild(weightText);
      weightLabel.appendChild(weightInput);

      const amountLabel = makeAmountLabel();
      amountLabel.style.fontSize = '12px';
      const amountText = document.createElement('span');
      const amountInput = document.createElement('input');
      amountInput.type = 'number';
      amountInput.min = '0';
      amountInput.max = String(MAX_REWARD_AMOUNT);
      amountInput.step = '1';
      const baseAmount = Number.isFinite(Number(initial.amount)) ? Math.max(0, Number(initial.amount)) : 1;
      amountInput.value = String(baseAmount);
      amountInput.style.width = '90px';
      amountInput.style.padding = '6px 8px';
      amountInput.style.borderRadius = '8px';
      amountInput.style.border = '1px solid #cbd5f5';
      amountInput.style.fontSize = '13px';
      amountLabel.appendChild(amountText);
      amountLabel.appendChild(amountInput);

      const rangeToggle = makeToggleLabel();
      rangeToggle.style.fontSize = '12px';
      rangeToggle.style.fontWeight = '600';
      const rangeCheckbox = document.createElement('input');
      rangeCheckbox.type = 'checkbox';
      const rangeToggleText = document.createElement('span');
      rangeToggle.appendChild(rangeCheckbox);
      rangeToggle.appendChild(rangeToggleText);

      const rangeContainer = document.createElement('div');
      rangeContainer.style.display = 'none';
      rangeContainer.style.alignItems = 'center';
      rangeContainer.style.flexWrap = 'wrap';
      rangeContainer.style.gap = '6px';

      const rangeMinLabel = makeRangeLabel();
      const rangeMinText = document.createElement('span');
      const rangeMinInput = document.createElement('input');
      rangeMinInput.type = 'number';
      rangeMinInput.min = '0';
      rangeMinInput.max = String(MAX_REWARD_AMOUNT);
      rangeMinInput.step = '1';
      rangeMinInput.value = String(baseAmount);
      rangeMinInput.style.width = '90px';
      rangeMinInput.style.padding = '6px 8px';
      rangeMinInput.style.borderRadius = '8px';
      rangeMinInput.style.border = '1px solid #cbd5f5';
      rangeMinInput.style.fontSize = '13px';
      rangeMinLabel.appendChild(rangeMinText);
      rangeMinLabel.appendChild(rangeMinInput);

      const rangeMaxLabel = makeRangeLabel();
      const rangeMaxText = document.createElement('span');
      const rangeMaxInput = document.createElement('input');
      rangeMaxInput.type = 'number';
      rangeMaxInput.min = '0';
      rangeMaxInput.max = String(MAX_REWARD_AMOUNT);
      rangeMaxInput.step = '1';
      rangeMaxInput.value = String(baseAmount);
      rangeMaxInput.style.width = '90px';
      rangeMaxInput.style.padding = '6px 8px';
      rangeMaxInput.style.borderRadius = '8px';
      rangeMaxInput.style.border = '1px solid #cbd5f5';
      rangeMaxInput.style.fontSize = '13px';
      rangeMaxLabel.appendChild(rangeMaxText);
      rangeMaxLabel.appendChild(rangeMaxInput);

      rangeContainer.appendChild(rangeMinLabel);
      rangeContainer.appendChild(rangeMaxLabel);

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.textContent = '×';
      removeBtn.style.padding = '4px 8px';
      removeBtn.style.borderRadius = '8px';
      removeBtn.style.border = '1px solid #f87171';
      removeBtn.style.background = '#fee2e2';
      removeBtn.style.color = '#b91c1c';
      removeBtn.style.cursor = 'pointer';
      removeBtn.style.fontWeight = '600';

      row.appendChild(select);
      row.appendChild(weightLabel);
      row.appendChild(amountLabel);
      row.appendChild(rangeToggle);
      row.appendChild(rangeContainer);
      row.appendChild(removeBtn);
      lootEntriesContainer.appendChild(row);

      const entry = {
        row,
        select,
        weightInput,
        amountInput,
        removeBtn,
        amountText,
        weightText,
        rangeToggleText,
        rangeMinText,
        rangeMaxText,
        rangeCheckbox,
        rangeMinInput,
        rangeMaxInput,
        rangeContainer,
        updateRangeState(parentEnabled = !rangeCheckbox.disabled){
          const rangeEnabled = parentEnabled && !!rangeCheckbox.checked;
          rangeContainer.style.display = rangeEnabled ? 'inline-flex' : 'none';
          rangeMinInput.disabled = !rangeEnabled;
          rangeMaxInput.disabled = !rangeEnabled;
        }
      };
      lootEntryRows.push(entry);
      randomRangeToggleNodes.push(rangeToggleText);
      randomRangeMinNodes.push(rangeMinText);
      randomRangeMaxNodes.push(rangeMaxText);
      lootWeightTextNodes.push(weightText);

      refreshItemSelect(true);

      removeBtn.addEventListener('click', () => {
        if (row.parentNode) row.parentNode.removeChild(row);
        const index = lootEntryRows.indexOf(entry);
        if (index !== -1) lootEntryRows.splice(index, 1);
        removeNodeReference(randomRangeToggleNodes, rangeToggleText);
        removeNodeReference(randomRangeMinNodes, rangeMinText);
        removeNodeReference(randomRangeMaxNodes, rangeMaxText);
        removeNodeReference(lootWeightTextNodes, weightText);
        updateLootState();
        refreshItemSelect(true);
      });

      const sanitizeWeightInput = () => {
        const clamped = clampRewardWeight(weightInput.value);
        weightInput.value = String(clamped > 0 ? clamped : 1);
      };
      ['change', 'blur'].forEach(eventName => {
        weightInput.addEventListener(eventName, sanitizeWeightInput);
      });

      rangeCheckbox.addEventListener('change', () => {
        if (rangeCheckbox.checked){
          const value = clampRewardAmount(amountInput.value, { min: 0, max: MAX_REWARD_AMOUNT });
          rangeMinInput.value = String(value);
          rangeMaxInput.value = String(value);
        }
        entry.updateRangeState(!rangeCheckbox.disabled);
      });

      select.title = itemSelectPlaceholderText;
      select.setAttribute('aria-label', itemSelectPlaceholderText);
      amountText.textContent = itemAmountLabelText;

      if (initial.key){
        ensureSelectHasValue(select, initial.key, getItemLabel(initial.key));
        select.value = initial.key;
      }

      if (initial.range && initial.range.enabled){
        rangeCheckbox.checked = true;
        rangeMinInput.value = String(initial.range.min);
        rangeMaxInput.value = String(initial.range.max);
      }

      entry.updateRangeState(!rangeCheckbox.disabled);
      return entry;
    }

    passiveAddButton.addEventListener('click', () => {
      if (!passiveEnableInput.checked){
        passiveEnableInput.checked = true;
      }
      const entry = createPassiveEntryRow();
      refreshPassiveOrbSelect(true);
      updatePassiveRowState();
      try { entry.select.focus(); } catch {}
    });

    itemAddButton.addEventListener('click', () => {
      if (!itemEnableInput.checked){
        itemEnableInput.checked = true;
      }
      const entry = createItemEntryRow();
      refreshItemSelect(true);
      updateItemRowState();
      try { entry.select.focus(); } catch {}
    });

    lootAddButton.addEventListener('click', () => {
      if (!lootEnableInput.checked){
        lootEnableInput.checked = true;
      }
      const entry = createLootEntryRow();
      refreshItemSelect(true);
      updateLootState();
      try { entry.select.focus(); } catch {}
    });

    function clearPassiveEntries(){
      while (passiveEntryRows.length){
        const entry = passiveEntryRows.pop();
        if (entry.row?.parentNode) entry.row.parentNode.removeChild(entry.row);
        removeNodeReference(passiveAmountTexts, entry.amountText);
        removeNodeReference(randomRangeToggleNodes, entry.rangeToggleText);
        removeNodeReference(randomRangeMinNodes, entry.rangeMinText);
        removeNodeReference(randomRangeMaxNodes, entry.rangeMaxText);
      }
      passiveAmountTexts.length = 0;
      passiveEntriesContainer.innerHTML = '';
      refreshPassiveOrbSelect(false);
    }

    function clearItemEntries(){
      while (itemEntryRows.length){
        const entry = itemEntryRows.pop();
        if (entry.row?.parentNode) entry.row.parentNode.removeChild(entry.row);
        removeNodeReference(itemAmountTexts, entry.amountText);
        removeNodeReference(randomRangeToggleNodes, entry.rangeToggleText);
        removeNodeReference(randomRangeMinNodes, entry.rangeMinText);
        removeNodeReference(randomRangeMaxNodes, entry.rangeMaxText);
      }
      itemAmountTexts.length = 0;
      itemEntriesContainer.innerHTML = '';
      refreshItemSelect(false);
    }

    function clearLootEntries(){
      while (lootEntryRows.length){
        const entry = lootEntryRows.pop();
        if (entry.row?.parentNode) entry.row.parentNode.removeChild(entry.row);
        removeNodeReference(randomRangeToggleNodes, entry.rangeToggleText);
        removeNodeReference(randomRangeMinNodes, entry.rangeMinText);
        removeNodeReference(randomRangeMaxNodes, entry.rangeMaxText);
        removeNodeReference(lootWeightTextNodes, entry.weightText);
      }
      lootEntriesContainer.innerHTML = '';
      refreshItemSelect(false);
    }

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
    spAmountInput.min = String(-MAX_REWARD_AMOUNT);
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

    const spRangeControls = document.createElement('div');
    spRangeControls.style.display = 'flex';
    spRangeControls.style.flexWrap = 'wrap';
    spRangeControls.style.gap = '6px';
    spRangeControls.style.alignItems = 'center';

    const spRandomLabel = makeToggleLabel();
    spRandomLabel.style.fontSize = '12px';
    const spRandomInput = document.createElement('input');
    spRandomInput.type = 'checkbox';
    const spRandomText = document.createElement('span');
    spRandomLabel.appendChild(spRandomInput);
    spRandomLabel.appendChild(spRandomText);

    const spRangeContainer = document.createElement('div');
    spRangeContainer.style.display = 'none';
    spRangeContainer.style.flexWrap = 'wrap';
    spRangeContainer.style.gap = '6px';
    spRangeContainer.style.alignItems = 'center';

    const spRangeMinLabel = makeRangeLabel();
    const spRangeMinText = document.createElement('span');
    const spRangeMinInput = document.createElement('input');
    spRangeMinInput.type = 'number';
    spRangeMinInput.min = String(-MAX_REWARD_AMOUNT);
    spRangeMinInput.max = String(MAX_REWARD_AMOUNT);
    spRangeMinInput.step = '1';
    spRangeMinInput.value = spAmountInput.value;
    spRangeMinInput.style.width = '90px';
    spRangeMinInput.style.padding = '6px 8px';
    spRangeMinInput.style.borderRadius = '8px';
    spRangeMinInput.style.border = '1px solid #cbd5f5';
    spRangeMinInput.style.fontSize = '13px';
    spRangeMinLabel.appendChild(spRangeMinText);
    spRangeMinLabel.appendChild(spRangeMinInput);

    const spRangeMaxLabel = makeRangeLabel();
    const spRangeMaxText = document.createElement('span');
    const spRangeMaxInput = document.createElement('input');
    spRangeMaxInput.type = 'number';
    spRangeMaxInput.min = String(-MAX_REWARD_AMOUNT);
    spRangeMaxInput.max = String(MAX_REWARD_AMOUNT);
    spRangeMaxInput.step = '1';
    spRangeMaxInput.value = spAmountInput.value;
    spRangeMaxInput.style.width = '90px';
    spRangeMaxInput.style.padding = '6px 8px';
    spRangeMaxInput.style.borderRadius = '8px';
    spRangeMaxInput.style.border = '1px solid #cbd5f5';
    spRangeMaxInput.style.fontSize = '13px';
    spRangeMaxLabel.appendChild(spRangeMaxText);
    spRangeMaxLabel.appendChild(spRangeMaxInput);

    spRangeContainer.appendChild(spRangeMinLabel);
    spRangeContainer.appendChild(spRangeMaxLabel);

    spRangeControls.appendChild(spRandomLabel);
    spRangeControls.appendChild(spRangeContainer);

    function updateSpRangeState(){
      const enabled = spEnableInput.checked && spRandomInput.checked;
      spRangeContainer.style.display = enabled ? 'inline-flex' : 'none';
      spRangeMinInput.disabled = !enabled;
      spRangeMaxInput.disabled = !enabled;
    }

    spRandomInput.addEventListener('change', () => {
      if (spRandomInput.checked){
        const value = clampRewardAmount(spAmountInput.value, { min: -MAX_REWARD_AMOUNT, max: MAX_REWARD_AMOUNT });
        spRangeMinInput.value = String(value);
        spRangeMaxInput.value = String(value);
      }
      updateSpRangeState();
    });

    spRow.appendChild(spToggleLabel);
    spRow.appendChild(spAmountLabel);
    spRow.appendChild(spRangeControls);
    rewardsSection.appendChild(spRow);
    randomRangeToggleNodes.push(spRandomText);
    randomRangeMinNodes.push(spRangeMinText);
    randomRangeMaxNodes.push(spRangeMaxText);

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
        if (rewards.passiveOrbs?.entries){
          rewards.passiveOrbs.entries.forEach(entry => {
            if (entry?.orbId) ids.add(entry.orbId);
          });
        }
      });
      passiveEntryRows.forEach(entry => {
        if (entry.select?.value) ids.add(entry.select.value);
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
        if (rewards.items?.entries){
          rewards.items.entries.forEach(entry => {
            if (entry?.key) ids.add(entry.key);
          });
        }
      });
      itemEntryRows.forEach(entry => {
        if (entry.select?.value) ids.add(entry.select.value);
      });
      return Array.from(ids).filter(Boolean);
    }

    function refreshPassiveOrbSelect(preserveValue = true){
      const placeholderText = translate('games.todoList.form.rewards.passiveOrb.selectPlaceholder', 'パッシブオーブを選択');
      const entries = collectPassiveOrbIds().map(id => ({
        value: id,
        label: getPassiveOrbLabel(id)
      })).sort((a, b) => a.label.localeCompare(b.label));
      passiveEntryRows.forEach(entry => {
        const select = entry.select;
        if (!select) return;
        const previous = preserveValue ? select.value : '';
        select.innerHTML = '';
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = placeholderText;
        select.appendChild(placeholder);
        entries.forEach(({ value, label }) => {
          const option = document.createElement('option');
          option.value = value;
          option.textContent = label;
          select.appendChild(option);
        });
        if (previous && Array.from(select.options).some(option => option.value === previous)){
          select.value = previous;
        } else {
          select.value = '';
        }
      });
    }

    function refreshItemSelect(preserveValue = true){
      const placeholderText = translate('games.todoList.form.rewards.item.selectPlaceholder', 'アイテムを選択');
      const entries = collectItemIds().map(id => ({
        value: id,
        label: getItemLabel(id)
      })).sort((a, b) => a.label.localeCompare(b.label));
      itemEntryRows.forEach(entry => {
        const select = entry.select;
        if (!select) return;
        const previous = preserveValue ? select.value : '';
        select.innerHTML = '';
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = placeholderText;
        select.appendChild(placeholder);
        entries.forEach(({ value, label }) => {
          const option = document.createElement('option');
          option.value = value;
          option.textContent = label;
          select.appendChild(option);
        });
        if (previous && Array.from(select.options).some(option => option.value === previous)){
          select.value = previous;
        } else {
          select.value = '';
        }
      });
      lootEntryRows.forEach(entry => {
        const select = entry.select;
        if (!select) return;
        const previous = preserveValue ? select.value : '';
        select.innerHTML = '';
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = placeholderText;
        select.appendChild(placeholder);
        entries.forEach(({ value, label }) => {
          const option = document.createElement('option');
          option.value = value;
          option.textContent = label;
          select.appendChild(option);
        });
        if (previous && Array.from(select.options).some(option => option.value === previous)){
          select.value = previous;
        } else {
          select.value = '';
        }
      });
    }

    refreshPassiveOrbSelect(false);
    refreshItemSelect(false);

    function updateLootState(){
      const baseEnabled = !!itemEnableInput.checked;
      const enabled = baseEnabled && !!lootEnableInput.checked;
      lootTableSection.style.opacity = baseEnabled ? '1' : '0.6';
      lootEntriesContainer.style.opacity = enabled ? '1' : '0.6';
      lootEnableInput.disabled = !baseEnabled;
      lootAddButton.disabled = !enabled;
      lootChanceInput.disabled = !enabled;
      lootEntryRows.forEach(entry => {
        entry.select.disabled = !enabled;
        entry.weightInput.disabled = !enabled;
        entry.amountInput.disabled = !enabled;
        entry.removeBtn.disabled = !enabled;
        entry.rangeCheckbox.disabled = !enabled;
        entry.updateRangeState(enabled);
      });
    }

    function updatePassiveRowState(){
      const enabled = !!passiveEnableInput.checked;
      passiveAddButton.disabled = !enabled;
      passiveRow.style.opacity = enabled ? '1' : '0.6';
      passiveEntriesContainer.style.opacity = enabled ? '1' : '0.6';
      passiveEntryRows.forEach(entry => {
        entry.select.disabled = !enabled;
        entry.amountInput.disabled = !enabled;
        entry.removeBtn.disabled = !enabled;
        entry.rangeCheckbox.disabled = !enabled;
        entry.updateRangeState(enabled);
      });
    }

    function updateItemRowState(){
      const enabled = !!itemEnableInput.checked;
      itemAddButton.disabled = !enabled;
      itemRow.style.opacity = enabled ? '1' : '0.6';
      itemEntriesContainer.style.opacity = enabled ? '1' : '0.6';
      itemEntryRows.forEach(entry => {
        entry.select.disabled = !enabled;
        entry.amountInput.disabled = !enabled;
        entry.removeBtn.disabled = !enabled;
        entry.rangeCheckbox.disabled = !enabled;
        entry.updateRangeState(enabled);
      });
      updateLootState();
    }

    function updateSpRowState(){
      const enabled = !!spEnableInput.checked;
      spAmountInput.disabled = !enabled;
      spRow.style.opacity = enabled ? '1' : '0.6';
      spRandomInput.disabled = !enabled;
      updateSpRangeState();
    }

    passiveEnableInput.addEventListener('change', () => {
      if (passiveEnableInput.checked && passiveEntryRows.length === 0){
        createPassiveEntryRow();
      }
      updatePassiveRowState();
    });
    itemEnableInput.addEventListener('change', () => {
      if (itemEnableInput.checked && itemEntryRows.length === 0){
        createItemEntryRow();
      }
      updateItemRowState();
    });
    lootEnableInput.addEventListener('change', () => {
      if (lootEnableInput.checked && lootEntryRows.length === 0){
        createLootEntryRow();
      }
      updateLootState();
    });
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

    const logSection = document.createElement('section');
    logSection.style.background = '#f8fafc';
    logSection.style.borderRadius = '12px';
    logSection.style.padding = '18px';
    logSection.style.boxShadow = '0 16px 36px rgba(15,23,42,0.08)';
    logSection.style.display = 'flex';
    logSection.style.flexDirection = 'column';
    logSection.style.gap = '12px';

    const logTitle = document.createElement('h3');
    logTitle.style.margin = '0';
    logTitle.style.fontSize = '18px';
    logTitle.style.color = '#1f2937';

    const logList = document.createElement('div');
    logList.style.display = 'flex';
    logList.style.flexDirection = 'column';
    logList.style.gap = '8px';
    logList.style.maxHeight = '240px';
    logList.style.overflowY = 'auto';
    logList.style.paddingRight = '4px';

    logSection.appendChild(logTitle);
    logSection.appendChild(logList);

    wrapper.appendChild(header);
    wrapper.appendChild(formCard);
    wrapper.appendChild(listsWrap);
    wrapper.appendChild(logSection);

    const resultOverlay = document.createElement('div');
    resultOverlay.style.position = 'fixed';
    resultOverlay.style.top = '0';
    resultOverlay.style.left = '0';
    resultOverlay.style.width = '0';
    resultOverlay.style.height = '0';
    resultOverlay.style.display = 'none';
    resultOverlay.style.alignItems = 'center';
    resultOverlay.style.justifyContent = 'center';
    resultOverlay.style.background = 'rgba(15,23,42,0.78)';
    resultOverlay.style.backdropFilter = 'blur(4px)';
    resultOverlay.style.zIndex = '9999';
    resultOverlay.style.transition = 'opacity 0.3s ease';
    resultOverlay.style.opacity = '0';
    resultOverlay.setAttribute('role', 'dialog');
    resultOverlay.setAttribute('aria-modal', 'true');

    const resultPanel = document.createElement('div');
    resultPanel.style.minWidth = '320px';
    resultPanel.style.maxWidth = '520px';
    resultPanel.style.background = 'linear-gradient(135deg, #0f172a, #1e293b)';
    resultPanel.style.color = '#f8fafc';
    resultPanel.style.borderRadius = '18px';
    resultPanel.style.padding = '28px';
    resultPanel.style.boxShadow = '0 24px 60px rgba(2,6,23,0.45)';
    resultPanel.style.display = 'flex';
    resultPanel.style.flexDirection = 'column';
    resultPanel.style.gap = '14px';
    resultPanel.style.transform = 'scale(0.94)';
    resultPanel.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
    resultPanel.style.opacity = '0';

    const resultTitle = document.createElement('div');
    resultTitle.style.fontSize = '28px';
    resultTitle.style.fontWeight = '700';
    resultTitle.style.textAlign = 'center';

    const resultXpLine = document.createElement('div');
    resultXpLine.style.fontSize = '18px';
    resultXpLine.style.fontWeight = '600';
    resultXpLine.style.textAlign = 'center';

    const resultLevelLine = document.createElement('div');
    resultLevelLine.style.fontSize = '16px';
    resultLevelLine.style.textAlign = 'center';
    resultLevelLine.style.color = '#cbd5f5';

    const resultRewardsWrap = document.createElement('div');
    resultRewardsWrap.style.display = 'flex';
    resultRewardsWrap.style.flexDirection = 'column';
    resultRewardsWrap.style.gap = '6px';
    resultRewardsWrap.style.fontSize = '14px';
    resultRewardsWrap.style.whiteSpace = 'pre-line';

    const resultActions = document.createElement('div');
    resultActions.style.display = 'flex';
    resultActions.style.justifyContent = 'center';
    resultActions.style.marginTop = '4px';

    const resultCloseButton = document.createElement('button');
    resultCloseButton.type = 'button';
    resultCloseButton.style.background = 'linear-gradient(135deg, #38bdf8, #2563eb)';
    resultCloseButton.style.color = '#f8fafc';
    resultCloseButton.style.border = 'none';
    resultCloseButton.style.borderRadius = '999px';
    resultCloseButton.style.padding = '10px 28px';
    resultCloseButton.style.fontSize = '15px';
    resultCloseButton.style.fontWeight = '600';
    resultCloseButton.style.cursor = 'pointer';
    resultCloseButton.style.boxShadow = '0 10px 30px rgba(37, 99, 235, 0.35)';

    resultActions.appendChild(resultCloseButton);

    resultPanel.appendChild(resultTitle);
    resultPanel.appendChild(resultXpLine);
    resultPanel.appendChild(resultLevelLine);
    resultPanel.appendChild(resultRewardsWrap);
    resultPanel.appendChild(resultActions);
    resultOverlay.appendChild(resultPanel);

    root.appendChild(wrapper);

    const overlayDoc = root?.ownerDocument || (typeof document !== 'undefined' ? document : null);
    const overlayMountTarget = overlayDoc?.body || wrapper;
    const overlayWindow = overlayDoc?.defaultView || (typeof window !== 'undefined' ? window : null);
    if (overlayMountTarget && overlayMountTarget !== wrapper) {
      overlayMountTarget.appendChild(resultOverlay);
    } else {
      wrapper.appendChild(resultOverlay);
    }

    const updateResultOverlayBounds = () => {
      if (!resultOverlay || !root || !root.getBoundingClientRect) return;
      const rect = root.getBoundingClientRect();
      resultOverlay.style.top = `${Math.max(rect.top, 0)}px`;
      resultOverlay.style.left = `${Math.max(rect.left, 0)}px`;
      resultOverlay.style.width = `${Math.max(rect.width, 0)}px`;
      resultOverlay.style.height = `${Math.max(rect.height, 0)}px`;
    };

    let overlayResizeObserver = null;
    let detachResultOverlayTracking = null;

    function startResultOverlayTracking(){
      if (detachResultOverlayTracking) return;
      const passiveOptions = { passive: true };
      if (overlayWindow && typeof overlayWindow.addEventListener === 'function'){
        overlayWindow.addEventListener('scroll', updateResultOverlayBounds, passiveOptions);
        overlayWindow.addEventListener('resize', updateResultOverlayBounds);
      }
      if (root && typeof root.addEventListener === 'function'){
        root.addEventListener('scroll', updateResultOverlayBounds, passiveOptions);
      }
      if (typeof ResizeObserver === 'function' && root){
        overlayResizeObserver = new ResizeObserver(() => updateResultOverlayBounds());
        try {
          overlayResizeObserver.observe(root);
        } catch {
          overlayResizeObserver = null;
        }
      }
      updateResultOverlayBounds();
      detachResultOverlayTracking = () => {
        if (overlayWindow && typeof overlayWindow.removeEventListener === 'function'){
          overlayWindow.removeEventListener('scroll', updateResultOverlayBounds);
          overlayWindow.removeEventListener('resize', updateResultOverlayBounds);
        }
        if (root && typeof root.removeEventListener === 'function'){
          root.removeEventListener('scroll', updateResultOverlayBounds);
        }
        if (overlayResizeObserver){
          overlayResizeObserver.disconnect();
          overlayResizeObserver = null;
        }
        detachResultOverlayTracking = null;
      };
    }

    function stopResultOverlayTracking(){
      if (typeof detachResultOverlayTracking === 'function'){
        detachResultOverlayTracking();
      }
    }

    let logEmptyText = '記録はまだありません。';
    function hideResultOverlay({ immediate = false } = {}){
      if (resultOverlay.style.display === 'none') return;
      if (immediate){
        resultOverlay.style.display = 'none';
        stopResultOverlayTracking();
        return;
      }
      resultOverlay.style.opacity = '0';
      resultPanel.style.transform = 'scale(0.94)';
      resultPanel.style.opacity = '0';
      setTimeout(() => {
        resultOverlay.style.display = 'none';
        stopResultOverlayTracking();
      }, 320);
    }

    resultCloseButton.addEventListener('click', () => {
      hideResultOverlay();
    });
    resultCloseButton.addEventListener('keydown', (event) => {
      if (event.key === 'Escape'){
        event.preventDefault();
        hideResultOverlay();
      }
    });

    function capturePlayerSnapshot(){
      if (typeof playerApi?.getState === 'function'){
        try {
          return playerApi.getState();
        } catch {
          return null;
        }
      }
      return null;
    }

    function showResultOverlay(config){
      const rewards = config?.rewards || {};
      const action = config?.action === 'achieved' ? 'achieved' : 'completed';
      const actionText = action === 'achieved'
        ? translate('games.todoList.log.actionAchieved', '達成')
        : translate('games.todoList.log.actionCompleted', '完了');
      const name = sanitizeString(config?.name || '', '').slice(0, MAX_NAME).trim() || defaultTaskName;
      resultTitle.textContent = translate('games.todoList.result.title', '{name}{action}！', {
        name,
        action: actionText
      });

      const xpAmount = Number(config?.xp) || 0;
      const xpFormatted = (() => {
        if (xpAmount > 0) return `+${formatNumber(xpAmount, { maximumFractionDigits: 0 })}`;
        if (xpAmount < 0) return `-${formatNumber(Math.abs(xpAmount), { maximumFractionDigits: 0 })}`;
        return '+0';
      })();
      resultXpLine.textContent = translate('games.todoList.result.xp', '獲得経験値 {amount}', { amount: xpFormatted });

      const beforeLevel = Number.isFinite(config?.beforeLevel) ? config.beforeLevel : null;
      const afterLevel = Number.isFinite(config?.afterLevel) ? config.afterLevel : null;
      if (beforeLevel !== null && afterLevel !== null){
        const delta = afterLevel - beforeLevel;
        const beforeText = formatNumber(beforeLevel, { maximumFractionDigits: 0 });
        const afterText = formatNumber(afterLevel, { maximumFractionDigits: 0 });
        if (delta !== 0){
          const deltaText = delta > 0
            ? `+${formatNumber(delta, { maximumFractionDigits: 0 })}`
            : `-${formatNumber(Math.abs(delta), { maximumFractionDigits: 0 })}`;
          resultLevelLine.textContent = translate('games.todoList.result.levelChange', 'レベル{before}→{after}({delta})', {
            before: beforeText,
            after: afterText,
            delta: deltaText
          });
          resultLevelLine.style.display = 'block';
        } else {
          resultLevelLine.textContent = translate('games.todoList.result.levelStatic', 'レベル{level}', {
            level: afterText
          });
          resultLevelLine.style.display = 'block';
        }
      } else {
        resultLevelLine.style.display = 'none';
      }

      resultRewardsWrap.innerHTML = '';
      const lines = [];
      const gainedItems = Array.isArray(rewards.items)
        ? rewards.items.filter(entry => Number(entry.amount) > 0)
        : [];
      const removedItems = Array.isArray(rewards.removedItems)
        ? rewards.removedItems.filter(entry => Number(entry.amount) > 0)
        : [];
      const gainedOrbs = Array.isArray(rewards.passiveOrbs)
        ? rewards.passiveOrbs.filter(entry => Number(entry.amount) > 0)
        : [];
      const removedOrbs = Array.isArray(rewards.removedPassiveOrbs)
        ? rewards.removedPassiveOrbs.filter(entry => Number(entry.amount) > 0)
        : [];
      if (Number.isFinite(rewards.spAmount) && rewards.spAmount !== 0){
        const spSigned = rewards.spAmount > 0
          ? `+${formatNumber(rewards.spAmount, { maximumFractionDigits: 0 })}`
          : `-${formatNumber(Math.abs(rewards.spAmount), { maximumFractionDigits: 0 })}`;
        lines.push(translate('games.todoList.result.sp', 'SP：{amount}', { amount: spSigned }));
      }
      if (gainedItems.length){
        const itemText = gainedItems.map(entry => {
          const label = getItemLabel(entry.key);
          const amountText = formatNumber(entry.amount, { maximumFractionDigits: 0 });
          return `${label}x${amountText}`;
        }).join('、');
        lines.push(translate('games.todoList.result.items', 'アイテム：{list}', { list: itemText }));
      }
      if (removedItems.length){
        const itemText = removedItems.map(entry => {
          const label = getItemLabel(entry.key);
          const amountText = formatNumber(entry.amount, { maximumFractionDigits: 0 });
          return `${label}x${amountText}`;
        }).join('、');
        lines.push(translate('games.todoList.result.itemsRemoved', '没収アイテム：{list}', { list: itemText }));
      }
      if (gainedOrbs.length){
        const orbText = gainedOrbs.map(entry => {
          const label = getPassiveOrbLabel(entry.orbId);
          const amountText = formatNumber(entry.amount, { maximumFractionDigits: 0 });
          return `${label}x${amountText}`;
        }).join('、');
        lines.push(translate('games.todoList.result.passiveOrbs', 'パッシブオーブ：{list}', { list: orbText }));
      }
      if (removedOrbs.length){
        const orbText = removedOrbs.map(entry => {
          const label = getPassiveOrbLabel(entry.orbId);
          const amountText = formatNumber(entry.amount, { maximumFractionDigits: 0 });
          return `${label}x${amountText}`;
        }).join('、');
        lines.push(translate('games.todoList.result.passiveOrbsRemoved', '没収オーブ：{list}', { list: orbText }));
      }
      if (rewards.loot && rewards.loot.enabled){
        const chanceText = formatNumber(Number(rewards.loot.dropChance) || 0, { maximumFractionDigits: 1 });
        if (rewards.loot.dropped && rewards.loot.entry){
          const label = getItemLabel(rewards.loot.entry.key);
          const amountText = formatNumber(rewards.loot.entry.amount, { maximumFractionDigits: 0 });
          lines.push(translate('games.todoList.result.lootSuccess', '抽選成功：{item} ×{amount} (確率 {chance}%)', {
            item: label,
            amount: amountText,
            chance: chanceText
          }));
        } else if (rewards.loot.attempted) {
          lines.push(translate('games.todoList.result.lootFailure', '抽選失敗（確率 {chance}%）', { chance: chanceText }));
        }
      }

      if (lines.length){
        const header = document.createElement('div');
        header.textContent = translate('games.todoList.result.rewardsHeader', '獲得');
        header.style.fontWeight = '600';
        header.style.fontSize = '15px';
        resultRewardsWrap.appendChild(header);
        lines.forEach(text => {
          const row = document.createElement('div');
          row.textContent = text;
          resultRewardsWrap.appendChild(row);
        });
      }

      startResultOverlayTracking();
      updateResultOverlayBounds();
      resultOverlay.style.display = 'flex';
      requestAnimationFrame(() => {
        updateResultOverlayBounds();
        resultOverlay.style.opacity = '1';
        resultPanel.style.transform = 'scale(1)';
        resultPanel.style.opacity = '1';
        try {
          resultCloseButton.focus({ preventScroll: true });
        } catch {
          resultCloseButton.focus();
        }
      });
    }

    function renderLogs(){
      logList.innerHTML = '';
      if (!state.logs || state.logs.length === 0){
        const empty = document.createElement('div');
        empty.textContent = logEmptyText;
        empty.style.color = '#6b7280';
        empty.style.fontSize = '14px';
        empty.style.textAlign = 'center';
        empty.style.padding = '12px 0';
        logList.appendChild(empty);
        return;
      }
      state.logs.forEach(entry => {
        const row = document.createElement('div');
        row.style.background = '#ffffff';
        row.style.borderRadius = '10px';
        row.style.padding = '8px 12px';
        row.style.fontSize = '13px';
        row.style.color = '#0f172a';
        row.style.boxShadow = '0 4px 12px rgba(148,163,184,0.18)';
        const timestamp = formatDate(entry.timestamp, getI18n(), dateTimeOptions);
        const actionText = entry.action === 'achieved'
          ? translate('games.todoList.log.actionAchieved', '達成')
          : translate('games.todoList.log.actionCompleted', '完了');
        row.textContent = `[${timestamp}] ${entry.name} ${actionText}`;
        logList.appendChild(row);
      });
    }

    function recordLogEntry(task, action){
      const entry = sanitizeLogEntry({
        timestamp: Date.now(),
        name: task?.name,
        action
      }, defaultTaskName);
      if (!entry) return;
      if (!Array.isArray(state.logs)){
        state.logs = [entry];
      } else {
        state.logs.unshift(entry);
      }
      if (state.logs.length > MAX_LOG_ENTRIES){
        state.logs.length = MAX_LOG_ENTRIES;
      }
      persist();
      renderLogs();
    }

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
      xpRandomInput.checked = false;
      xpRangeMinInput.value = xpInput.value;
      xpRangeMaxInput.value = xpInput.value;
      updateXpRangeState();
      colorInput.value = '#f97316';
      memoInput.value = '';
      passiveEnableInput.checked = false;
      clearPassiveEntries();
      itemEnableInput.checked = false;
      clearItemEntries();
      lootEnableInput.checked = false;
      lootChanceInput.value = '100';
      clearLootEntries();
      spEnableInput.checked = false;
      spAmountInput.value = '10';
      spRandomInput.checked = false;
      spRangeMinInput.value = spAmountInput.value;
      spRangeMaxInput.value = spAmountInput.value;
      updatePassiveRowState();
      updateItemRowState();
      updateSpRowState();
      updateLootState();
    }

    function fillForm(task){
      state.editingTaskId = task.id;
      setFormMode('edit');
      refreshPassiveOrbSelect(false);
      refreshItemSelect(false);
      nameInput.value = task.autoName ? '' : task.name;
      typeSelect.value = sanitizeTaskType(task.type);
      xpInput.value = String(task.xp);
      if (task.xpRange && task.xpRange.enabled){
        xpRandomInput.checked = true;
        xpRangeMinInput.value = String(task.xpRange.min);
        xpRangeMaxInput.value = String(task.xpRange.max);
      } else {
        xpRandomInput.checked = false;
        xpRangeMinInput.value = String(task.xp);
        xpRangeMaxInput.value = String(task.xp);
      }
      updateXpRangeState();
      colorInput.value = task.color;
      memoInput.value = task.memo;
      const rewards = ensureTaskRewards(task);
      passiveEnableInput.checked = !!rewards.passiveOrbs.enabled;
      clearPassiveEntries();
      if (Array.isArray(rewards.passiveOrbs.entries) && rewards.passiveOrbs.entries.length){
        rewards.passiveOrbs.entries.forEach(entry => createPassiveEntryRow(entry));
      }
      if (passiveEnableInput.checked && passiveEntryRows.length === 0){
        createPassiveEntryRow();
      }
      itemEnableInput.checked = !!rewards.items.enabled;
      clearItemEntries();
      if (Array.isArray(rewards.items.entries) && rewards.items.entries.length){
        rewards.items.entries.forEach(entry => createItemEntryRow(entry));
      }
      if (itemEnableInput.checked && itemEntryRows.length === 0){
        createItemEntryRow();
      }
      const lootConfig = rewards.items?.lootTable || {};
      lootEnableInput.checked = !!lootConfig.enabled;
      lootChanceInput.value = String(lootConfig.dropChance ?? 100);
      clearLootEntries();
      if (Array.isArray(lootConfig.entries) && lootConfig.entries.length){
        lootConfig.entries.forEach(entry => createLootEntryRow(entry));
      }
      if (lootEnableInput.checked && lootEntryRows.length === 0){
        createLootEntryRow();
      }
      spEnableInput.checked = !!rewards.sp.enabled;
      spAmountInput.value = String(rewards.sp.amount || 0);
      if (rewards.sp.range && rewards.sp.range.enabled){
        spRandomInput.checked = true;
        spRangeMinInput.value = String(rewards.sp.range.min);
        spRangeMaxInput.value = String(rewards.sp.range.max);
      } else {
        spRandomInput.checked = false;
        spRangeMinInput.value = spAmountInput.value;
        spRangeMaxInput.value = spAmountInput.value;
      }
      updatePassiveRowState();
      updateItemRowState();
      updateSpRowState();
      updateLootState();
    }

    function readRewardsFromForm(){
      return sanitizeTaskRewards({
        passiveOrbs: {
          enabled: passiveEnableInput.checked,
          entries: passiveEntryRows.map(entry => ({
            orbId: entry.select.value,
            amount: entry.amountInput.value,
            range: entry.rangeCheckbox.checked ? {
              enabled: true,
              min: entry.rangeMinInput.value,
              max: entry.rangeMaxInput.value
            } : {}
          }))
        },
        items: {
          enabled: itemEnableInput.checked,
          entries: itemEntryRows.map(entry => ({
            key: entry.select.value,
            amount: entry.amountInput.value,
            range: entry.rangeCheckbox.checked ? {
              enabled: true,
              min: entry.rangeMinInput.value,
              max: entry.rangeMaxInput.value
            } : {}
          })),
          lootTable: {
            enabled: itemEnableInput.checked && lootEnableInput.checked,
            dropChance: lootChanceInput.value,
            entries: lootEntryRows.map(entry => ({
              key: entry.select.value,
              weight: entry.weightInput.value,
              amount: entry.amountInput.value,
              range: entry.rangeCheckbox.checked ? {
                enabled: true,
                min: entry.rangeMinInput.value,
                max: entry.rangeMaxInput.value
              } : {}
            }))
          }
        },
        sp: {
          enabled: spEnableInput.checked,
          amount: spAmountInput.value,
          range: spRandomInput.checked ? {
            enabled: true,
            min: spRangeMinInput.value,
            max: spRangeMaxInput.value
          } : {}
        }
      });
    }

    function persist(){
      state.tasks.forEach(task => {
        if (!task || typeof task !== 'object') return;
        task.xp = clampXp(task.xp);
        task.xpRange = sanitizeRandomRange(task.xpRange, clampXp, task.xp);
        ensureTaskRewards(task);
      });
      writePersistentState(state.tasks);
      state.logs = sanitizeLogList(state.logs, defaultTaskName);
      writePersistentLogs(state.logs);
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
      passiveSelectPlaceholderText = translate('games.todoList.form.rewards.passiveOrb.selectPlaceholder', 'パッシブオーブを選択');
      passiveAmountLabelText = translate('games.todoList.form.rewards.passiveOrb.amount', '個数（マイナスで没収）');
      passiveAddButton.textContent = translate('games.todoList.form.rewards.passiveOrb.addEntry', '追加');
      passiveEntryRows.forEach(entry => {
        entry.select.title = passiveSelectPlaceholderText;
        entry.select.setAttribute('aria-label', passiveSelectPlaceholderText);
      });
      passiveAmountTexts.forEach(node => { node.textContent = passiveAmountLabelText; });
      refreshPassiveOrbSelect(true);
      itemEnableText.textContent = translate('games.todoList.form.rewards.item.label', 'アイテム');
      itemSelectPlaceholderText = translate('games.todoList.form.rewards.item.selectPlaceholder', 'アイテムを選択');
      itemAmountLabelText = translate('games.todoList.form.rewards.item.amount', '個数（マイナスで没収）');
      itemAddButton.textContent = translate('games.todoList.form.rewards.item.addEntry', '追加');
      itemEntryRows.forEach(entry => {
        entry.select.title = itemSelectPlaceholderText;
        entry.select.setAttribute('aria-label', itemSelectPlaceholderText);
      });
      itemAmountTexts.forEach(node => { node.textContent = itemAmountLabelText; });
      refreshItemSelect(true);
      const randomToggleText = translate('games.todoList.form.randomRange.toggle', 'ランダム範囲を使用');
      const randomMinText = translate('games.todoList.form.randomRange.min', '最小値');
      const randomMaxText = translate('games.todoList.form.randomRange.max', '最大値');
      randomRangeToggleNodes.forEach(node => { node.textContent = randomToggleText; });
      randomRangeMinNodes.forEach(node => { node.textContent = randomMinText; });
      randomRangeMaxNodes.forEach(node => { node.textContent = randomMaxText; });
      lootEnableText.textContent = translate('games.todoList.form.rewards.item.lootTable.label', 'ルートテーブル');
      lootAddButton.textContent = translate('games.todoList.form.rewards.item.lootTable.addEntry', '追加');
      const lootChanceLabelText = translate('games.todoList.form.rewards.item.lootTable.dropChance', 'ドロップ率(%)');
      lootDropChanceTextNodes.forEach(node => { node.textContent = lootChanceLabelText; });
      const lootWeightLabelText = translate('games.todoList.form.rewards.item.lootTable.weight', '重み');
      lootWeightTextNodes.forEach(node => { node.textContent = lootWeightLabelText; });
      spEnableText.textContent = translate('games.todoList.form.rewards.sp.label', 'SP');
      spAmountText.textContent = translate('games.todoList.form.rewards.sp.amount', '変化量（マイナスで没収）');
      colorLabelText.textContent = translate('games.todoList.form.color', 'カラー');
      memoLabelText.textContent = translate('games.todoList.form.memo', 'メモ');
      memoInput.placeholder = translate('games.todoList.form.memoPlaceholder', '補足情報やチェックポイントなどを入力');

      refreshPassiveOrbSelect(true);
      refreshItemSelect(true);

      cancelBtn.textContent = translate('games.todoList.form.cancel', 'キャンセル');

      const resultCloseText = translate('games.todoList.result.close', 'OK');
      resultCloseButton.textContent = resultCloseText;
      resultCloseButton.setAttribute('aria-label', resultCloseText);

      pendingSectionControls.setLabel(translate('games.todoList.sections.pending', '未完了タスク'));
      completedSectionControls.setLabel(translate('games.todoList.sections.completed', '完了済みタスク'));

      logTitle.textContent = translate('games.todoList.log.title', '達成・完了ログ');
      logEmptyText = translate('games.todoList.log.empty', '記録はまだありません。');

      setFormMode(state.editingTaskId ? 'edit' : 'create');

      if (includeDynamic || defaultChanged){
        updateStats();
        renderLists();
      }
      renderLogs();
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
          xp: formatRangeText(task.xp, task.xpRange, { signed: true })
        }),
        '#fee2e2',
        '#991b1b'
      );
      chipRow.appendChild(xpChip);

      if (rewards.passiveOrbs.enabled && Array.isArray(rewards.passiveOrbs.entries)){
        rewards.passiveOrbs.entries.forEach(entry => {
          if (!entry?.orbId) return;
          const amountText = formatRangeText(entry.amount, entry.range);
          const passiveText = translate('games.todoList.task.rewards.passiveOrb', 'オーブ: {orb} ×{amount}', {
            orb: entry.orbId,
            amount: amountText
          });
          chipRow.appendChild(makeChip(passiveText, '#ede9fe', '#5b21b6'));
        });
      }

      if (rewards.items.enabled && Array.isArray(rewards.items.entries)){
        rewards.items.entries.forEach(entry => {
          if (!entry?.key) return;
          const amountText = formatRangeText(entry.amount, entry.range);
          const itemText = translate('games.todoList.task.rewards.item', '{item} ×{amount}', {
            item: entry.key,
            amount: amountText
          });
          chipRow.appendChild(makeChip(itemText, '#dbeafe', '#1d4ed8'));
        });
      }

      if (rewards.sp.enabled){
        const spAmount = rewards.sp.amount;
        const display = formatRangeText(spAmount, rewards.sp.range, { signed: true });
        if (display !== '0'){
          const spText = translate('games.todoList.task.rewards.sp', 'SP {amount}', {
            amount: display
          });
          chipRow.appendChild(makeChip(spText, '#cffafe', '#0f766e'));
        }
      }

      if (rewards.items?.lootTable?.enabled){
        const chanceText = formatNumber(Number(rewards.items.lootTable.dropChance) || 0, { maximumFractionDigits: 1 });
        const lootChipText = translate('games.todoList.task.rewards.loot', '抽選{chance}%', { chance: chanceText });
        chipRow.appendChild(makeChip(lootChipText, '#fef3c7', '#92400e'));
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
      const result = {
        xp: 0,
        sp: 0,
        items: { gained: [], removed: [] },
        passiveOrbs: { gained: [], removed: [] },
        loot: {
          enabled: !!rewards.items?.lootTable?.enabled,
          attempted: false,
          dropped: false,
          entry: null,
          dropChance: Number(rewards.items?.lootTable?.dropChance) || 0
        }
      };

      const resolvedXp = resolveRandomValue(task.xp, task.xpRange, clampXp, useRandom);
      if (resolvedXp !== 0 && typeof awardXp === 'function'){
        try {
          const gained = awardXp(resolvedXp, meta);
          const numeric = Number(gained);
          if (Number.isFinite(numeric)){
            result.xp = numeric;
          } else if (Number.isFinite(resolvedXp)){
            result.xp = resolvedXp;
          }
        } catch {
          result.xp = resolvedXp;
        }
      } else if (Number.isFinite(resolvedXp)){
        result.xp = resolvedXp;
      }

      if (playerApi && rewards.sp.enabled && typeof playerApi.adjustSp === 'function'){
        const spAmount = resolveRandomValue(rewards.sp.amount, rewards.sp.range, (value) => clampRewardAmount(value, {
          min: -MAX_REWARD_AMOUNT,
          max: MAX_REWARD_AMOUNT
        }), useRandom);
        if (spAmount !== 0){
          try {
            playerApi.adjustSp(spAmount, { source: 'todo_list', reason: meta?.type || 'todo_list' });
            result.sp = spAmount;
          } catch {}
        }
      }

      const itemPositives = {};
      const itemNegatives = {};
      if (playerApi && rewards.items.enabled && Array.isArray(rewards.items.entries)){
        rewards.items.entries.forEach(entry => {
          const key = entry?.key;
          if (!key) return;
          const amount = resolveRandomValue(entry.amount, entry.range, (value) => clampRewardAmount(value, {
            min: -MAX_REWARD_AMOUNT,
            max: MAX_REWARD_AMOUNT
          }), useRandom);
          if (amount === 0) return;
          if (amount > 0){
            itemPositives[key] = (itemPositives[key] || 0) + amount;
            result.items.gained.push({ key, amount });
          } else {
            itemNegatives[key] = (itemNegatives[key] || 0) + amount;
            result.items.removed.push({ key, amount: Math.abs(amount) });
          }
        });
      }

      if (playerApi && rewards.passiveOrbs.enabled && Array.isArray(rewards.passiveOrbs.entries) && typeof playerApi.awardPassiveOrb === 'function'){
        rewards.passiveOrbs.entries.forEach(entry => {
          const orbId = entry?.orbId;
          if (!orbId) return;
          const amount = resolveRandomValue(entry.amount, entry.range, (value) => clampRewardAmount(value, {
            min: -MAX_REWARD_AMOUNT,
            max: MAX_REWARD_AMOUNT
          }), useRandom);
          if (amount === 0) return;
          try {
            playerApi.awardPassiveOrb(orbId, amount, { source: meta?.type || 'todo_list' });
            if (amount > 0){
              result.passiveOrbs.gained.push({ orbId, amount });
            } else {
              result.passiveOrbs.removed.push({ orbId, amount: Math.abs(amount) });
            }
          } catch {}
        });
      }

      const lootConfig = rewards.items?.lootTable;
      if (lootConfig && lootConfig.enabled && Array.isArray(lootConfig.entries) && lootConfig.entries.length){
        result.loot.attempted = true;
        const chance = Math.max(0, Math.min(100, Number(lootConfig.dropChance) || 0));
        if (useRandom() * 100 < chance){
          const weightedEntries = lootConfig.entries
            .map(entry => ({
              key: entry?.key,
              weight: clampRewardWeight(entry?.weight ?? entry?.chance ?? 0),
              amount: entry?.amount,
              range: entry?.range
            }))
            .filter(entry => entry.key && entry.weight > 0);
          const totalWeight = weightedEntries.reduce((sum, entry) => sum + entry.weight, 0);
          if (totalWeight > 0){
            let roll = useRandom() * totalWeight;
            let chosen = null;
            for (const entry of weightedEntries){
              if (roll < entry.weight){
                chosen = entry;
                break;
              }
              roll -= entry.weight;
            }
            if (chosen){
              const amount = resolveRandomValue(chosen.amount, chosen.range, (value) => clampRewardAmount(value, {
                min: 0,
                max: MAX_REWARD_AMOUNT
              }), useRandom);
              if (amount > 0){
                result.loot.dropped = true;
                result.loot.entry = { key: chosen.key, amount };
                itemPositives[chosen.key] = (itemPositives[chosen.key] || 0) + amount;
                result.items.gained.push({ key: chosen.key, amount });
              }
            }
          }
        }
      }

      if (playerApi && Object.keys(itemPositives).length && typeof playerApi.awardItems === 'function'){
        try {
          playerApi.awardItems(itemPositives, { allowNegative: false });
        } catch {}
      }
      if (playerApi && Object.keys(itemNegatives).length){
        const handler = typeof playerApi.adjustItems === 'function' ? playerApi.adjustItems : playerApi.awardItems;
        if (typeof handler === 'function'){
          try {
            handler(itemNegatives, { allowNegative: true });
          } catch {}
        }
      }

      return result;
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
        const before = capturePlayerSnapshot();
        const meta = { type: 'todo-complete', todoId: task.id, name: task.name };
        const rewardResult = applyTaskRewards(task, meta);
        const xpGained = Number(rewardResult?.xp) || 0;
        if (xpGained !== 0) state.sessionXp += xpGained;
        const after = capturePlayerSnapshot();
        recordLogEntry(task, 'completed');
        showResultOverlay({
          name: task.name,
          action: 'completed',
          xp: xpGained,
          beforeLevel: before?.level,
          afterLevel: after?.level,
          rewards: {
            items: rewardResult?.items?.gained,
            removedItems: rewardResult?.items?.removed,
            passiveOrbs: rewardResult?.passiveOrbs?.gained,
            removedPassiveOrbs: rewardResult?.passiveOrbs?.removed,
            spAmount: rewardResult?.sp || 0,
            loot: rewardResult?.loot
          }
        });
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
      const before = capturePlayerSnapshot();
      const meta = { type: 'todo-achieve', todoId: task.id, name: task.name, count: nextCount };
      const rewardResult = applyTaskRewards(task, meta);
      const xpGained = Number(rewardResult?.xp) || 0;
      if (xpGained !== 0) state.sessionXp += xpGained;
      persist();
      const after = capturePlayerSnapshot();
      recordLogEntry(task, 'achieved');
      showResultOverlay({
        name: task.name,
        action: 'achieved',
        xp: xpGained,
        beforeLevel: before?.level,
        afterLevel: after?.level,
        rewards: {
          items: rewardResult?.items?.gained,
          removedItems: rewardResult?.items?.removed,
          passiveOrbs: rewardResult?.passiveOrbs?.gained,
          removedPassiveOrbs: rewardResult?.passiveOrbs?.removed,
          spAmount: rewardResult?.sp || 0,
          loot: rewardResult?.loot
        }
      });
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
      const xpRangeRaw = xpRandomInput.checked ? {
        enabled: true,
        min: xpRangeMinInput.value,
        max: xpRangeMaxInput.value
      } : {};
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
          task.xpRange = sanitizeRandomRange(xpRangeRaw, clampXp, xp);
          task.color = color;
          task.memo = memo;
          task.rewards = rewards;
          persist();
        }
      } else {
        const now = Date.now();
        const id = `todo_${now}_${getRandomFloat().toString(36).slice(2, 8)}`;
        state.tasks.push({
          id,
          name,
          autoName: isAutoName,
          memo,
          xp,
          xpRange: sanitizeRandomRange(xpRangeRaw, clampXp, xp),
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
      hideResultOverlay({ immediate: true });
      if (resultOverlay.parentNode){
        resultOverlay.parentNode.removeChild(resultOverlay);
      }
      root.removeChild(wrapper);
    }

    const testUtils = {
      applyTaskRewards: (task, meta) => applyTaskRewards(task, meta),
      resolveRandomValue,
      sanitizeRandomRange,
      sanitizeTaskRewards,
      clampRewardAmount,
      clampRewardWeight,
      clampDropChance,
      getTranslationNodeCounts(){
        return {
          randomRangeToggle: randomRangeToggleNodes.length,
          randomRangeMin: randomRangeMinNodes.length,
          randomRangeMax: randomRangeMaxNodes.length,
          passiveAmount: passiveAmountTexts.length,
          itemAmount: itemAmountTexts.length,
          lootWeight: lootWeightTextNodes.length
        };
      },
      addPassiveEntry: (initial) => createPassiveEntryRow(initial || {}),
      addItemEntry: (initial) => createItemEntryRow(initial || {}),
      addLootEntry: (initial) => createLootEntryRow(initial || {}),
      getLootChanceInput: () => lootChanceInput,
      constants: {
        MAX_REWARD_AMOUNT,
        MAX_REWARD_WEIGHT,
        MAX_XP
      }
    };

    const runtime = {
      start,
      stop,
      destroy,
      getScore(){ return state.sessionXp; },
      __test: testUtils
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

    renderLogs();
    start();
    return runtime;
  }

  window.registerMiniGame({
    id: 'todo_list',
    name: 'ToDoリスト', nameKey: 'selection.miniexp.games.todo_list.name',
    description: '完了で設定EXPを獲得 / 失敗は獲得なし', descriptionKey: 'selection.miniexp.games.todo_list.description', categoryIds: ['utility'],
    category: 'ユーティリティ',
    version: '0.4.0',
    author: 'mod',
    create
  });
})();

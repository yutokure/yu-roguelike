(function(){
  const STORAGE_KEY = 'mini_random_tool_state_v1';
  const MAX_DICE = 20;
  const MAX_SEGMENTS = 12;
  const MAX_NAME_LENGTH = 40;
  const MAX_ROULETTE_XP = 1000000;
  const MAX_ROULETTE_WEIGHT = 1000;
  const MAX_RANDOM_RANGE = 1_000_000_000;
  const MAX_TEXT_LENGTH = 256;
  const MAX_CUSTOM_CHARACTERS = 200;
  const AMBIGUOUS_CHARACTERS = 'O0oIl1|`"\'‘’“”<>{}[]()/\\';
  const LOWERCASE_CHARACTERS = 'abcdefghijklmnopqrstuvwxyz';
  const UPPERCASE_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const NUMBER_CHARACTERS = '0123456789';
  const SYMBOL_CHARACTERS = '!@#$%^&*()-_=+[]{};:,.<>?/';
  const DEFAULT_TEXT_OPTIONS = {
    length: 16,
    useLowercase: true,
    useUppercase: true,
    useNumbers: true,
    useSymbols: false,
    includeSpaces: false,
    allowAmbiguous: false,
    customCharacters: '',
    lastResult: '',
    lastType: 'password'
  };
  const DEFAULT_STATE = {
    activeTab: 'dice',
    diceCount: 2,
    rouletteSegments: [
      { id: createId(), name: 'EXP100', xp: 100, weight: 1 },
      { id: createId(), name: 'EXP250', xp: 250, weight: 1 },
      { id: createId(), name: 'EXP500', xp: 500, weight: 1 }
    ],
    selectionList: ['選択肢A', '選択肢B', '選択肢C'],
    numberRange: { min: 1, max: 100 },
    textOptions: DEFAULT_TEXT_OPTIONS
  };
  const WHEEL_COLORS = ['#ff6b6b', '#ff9f43', '#54a0ff', '#5f27cd', '#1dd1a1', '#f368e0', '#00d2d3', '#48dbfb'];

  function createId(){
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'){
      return `rnd_${crypto.randomUUID()}`;
    }
    return `rnd_${Math.random().toString(36).slice(2, 10)}`;
  }

  function safeNumber(value, fallback = 0){
    const num = Number(value);
    if (!Number.isFinite(num)) return fallback;
    return num;
  }

  function clampDiceCount(raw){
    const value = Math.round(Math.abs(safeNumber(raw, DEFAULT_STATE.diceCount)));
    if (value < 1) return 1;
    if (value > MAX_DICE) return MAX_DICE;
    return value;
  }

  function clampRouletteXp(raw){
    const value = Math.round(Math.max(0, safeNumber(raw, 0)));
    if (value > MAX_ROULETTE_XP) return MAX_ROULETTE_XP;
    return value;
  }

  function clampRouletteWeight(raw){
    const value = Math.round(Math.max(1, safeNumber(raw, 1)));
    if (value > MAX_ROULETTE_WEIGHT) return MAX_ROULETTE_WEIGHT;
    return value;
  }

  function clampName(raw){
    if (typeof raw !== 'string') return '';
    const trimmed = raw.trim();
    if (!trimmed) return '';
    return trimmed.slice(0, MAX_NAME_LENGTH);
  }

  function clampRangeValue(raw){
    const value = Math.round(safeNumber(raw, 0));
    if (!Number.isFinite(value)) return 0;
    if (value < -MAX_RANDOM_RANGE) return -MAX_RANDOM_RANGE;
    if (value > MAX_RANDOM_RANGE) return MAX_RANDOM_RANGE;
    return value;
  }

  function clampTextLength(raw){
    const value = Math.round(Math.abs(safeNumber(raw, DEFAULT_TEXT_OPTIONS.length)));
    if (value < 1) return 1;
    if (value > MAX_TEXT_LENGTH) return MAX_TEXT_LENGTH;
    return value;
  }

  function sanitizeCustomCharacters(raw){
    if (typeof raw !== 'string') return '';
    const normalized = Array.from(raw.replace(/\r?\n/g, '')).slice(0, MAX_CUSTOM_CHARACTERS).join('');
    return normalized;
  }

  function toBoolean(value, fallback = false){
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string'){
      const lowered = value.toLowerCase();
      if (lowered === 'true') return true;
      if (lowered === 'false') return false;
    }
    return fallback;
  }

  function filterAmbiguousCharacters(characters, allowAmbiguous){
    if (allowAmbiguous) return characters;
    return Array.from(characters).filter((char) => !AMBIGUOUS_CHARACTERS.includes(char)).join('');
  }

  function uniqueCharacters(characters){
    return Array.from(new Set(Array.from(characters))).join('');
  }

  function sanitizeTextOptions(raw){
    if (!raw || typeof raw !== 'object') return cloneState(DEFAULT_TEXT_OPTIONS);
    const length = clampTextLength(raw.length);
    const useLowercase = toBoolean(raw.useLowercase, true);
    const useUppercase = toBoolean(raw.useUppercase, true);
    const useNumbers = toBoolean(raw.useNumbers, true);
    const useSymbols = toBoolean(raw.useSymbols, false);
    const includeSpaces = toBoolean(raw.includeSpaces, false);
    const allowAmbiguous = toBoolean(raw.allowAmbiguous, false);
    const customCharacters = sanitizeCustomCharacters(raw.customCharacters || '');
    const lastResult = typeof raw.lastResult === 'string' ? raw.lastResult.slice(0, MAX_TEXT_LENGTH * 4) : '';
    const lastType = raw.lastType === 'text' ? 'text' : raw.lastType === 'password' ? 'password' : 'password';
    return {
      length,
      useLowercase,
      useUppercase,
      useNumbers,
      useSymbols,
      includeSpaces,
      allowAmbiguous,
      customCharacters,
      lastResult,
      lastType
    };
  }

  function pickRandomCharacter(characters){
    const array = Array.from(characters);
    if (!array.length) return '';
    return array[Math.floor(Math.random() * array.length)];
  }

  function shuffleArray(array){
    for (let i = array.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }

  function loadState(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return cloneState(DEFAULT_STATE);
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return cloneState(DEFAULT_STATE);
      return sanitizeState(parsed);
    } catch {
      return cloneState(DEFAULT_STATE);
    }
  }

  function sanitizeState(raw){
    const diceCount = clampDiceCount(raw.diceCount);
    const rouletteSegments = Array.isArray(raw.rouletteSegments)
      ? raw.rouletteSegments.slice(0, MAX_SEGMENTS).map((segment) => sanitizeSegment(segment))
      : cloneState(DEFAULT_STATE.rouletteSegments);
    const selectionList = Array.isArray(raw.selectionList)
      ? raw.selectionList
          .map((entry) => (typeof entry === 'string' ? entry : ''))
          .map((entry) => entry.trim())
          .filter((entry) => entry)
          .slice(0, 100)
      : cloneState(DEFAULT_STATE.selectionList);
    const numberRangeRaw = raw.numberRange && typeof raw.numberRange === 'object' ? raw.numberRange : DEFAULT_STATE.numberRange;
    const min = clampRangeValue(numberRangeRaw.min);
    const max = clampRangeValue(numberRangeRaw.max);
    const normalizedRange = min <= max ? { min, max } : { min: max, max: min };
    const activeTab = ['dice', 'roulette', 'choice', 'text', 'number'].includes(raw.activeTab) ? raw.activeTab : DEFAULT_STATE.activeTab;
    return {
      activeTab,
      diceCount,
      rouletteSegments: rouletteSegments.length ? rouletteSegments : cloneState(DEFAULT_STATE.rouletteSegments),
      selectionList: selectionList.length ? selectionList : cloneState(DEFAULT_STATE.selectionList),
      numberRange: normalizedRange,
      textOptions: sanitizeTextOptions(raw.textOptions)
    };
  }

  function sanitizeSegment(raw){
    if (!raw || typeof raw !== 'object'){
      return { id: createId(), name: 'EXP100', xp: 100, weight: 1 };
    }
    const id = typeof raw.id === 'string' && raw.id.trim() ? raw.id : createId();
    const name = clampName(raw.name) || 'EXP100';
    const xp = clampRouletteXp(raw.xp);
    const weight = clampRouletteWeight(raw.weight);
    return { id, name, xp, weight };
  }

  function saveState(state){
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }

  function cloneState(value){
    const globalClone = typeof globalThis !== 'undefined' && typeof globalThis.structuredClone === 'function'
      ? globalThis.structuredClone
      : null;
    if (globalClone){
      try {
        return globalClone(value);
      } catch {}
    }
    return JSON.parse(JSON.stringify(value));
  }

  function create(root, awardXp, opts){
    if (!root) throw new Error('MiniExp Random Tool requires a container');

    const localization = (opts && opts.localization) ||
      (typeof window !== 'undefined' && typeof window.createMiniGameLocalization === 'function'
        ? window.createMiniGameLocalization({ id: 'random_tool' })
        : null);

    const text = (key, fallback, params) => {
      if (localization && typeof localization.t === 'function'){
        try {
          return localization.t(key, fallback, params);
        } catch {}
      }
      if (typeof fallback === 'function') return fallback();
      return fallback ?? '';
    };

    const formatNumber = (value, options) => {
      if (localization && typeof localization.formatNumber === 'function'){
        try {
          return localization.formatNumber(value, options);
        } catch {}
      }
      try {
        const locale = localization && typeof localization.getLocale === 'function'
          ? localization.getLocale()
          : undefined;
        return new Intl.NumberFormat(locale, options).format(value);
      } catch {}
      if (value == null || Number.isNaN(value)) return '0';
      if (typeof value === 'number') return value.toString();
      return String(value);
    };

    ensureStyles();

    const state = loadState();
    const tabOrder = ['dice', 'roulette', 'choice', 'text', 'number'];

    const container = document.createElement('div');
    container.className = 'mini-random-tool';

    const header = document.createElement('div');
    header.className = 'mini-random-tool__header';
    const title = document.createElement('h2');
    title.className = 'mini-random-tool__title';
    title.textContent = text('.title', 'ランダムツール');
    const subtitle = document.createElement('p');
    subtitle.className = 'mini-random-tool__subtitle';
    subtitle.textContent = text('.subtitle', 'サイコロ、ルーレット、リスト抽選、乱数・文字列生成をまとめた便利ツール。');
    header.appendChild(title);
    header.appendChild(subtitle);

    const tabs = document.createElement('div');
    tabs.className = 'mini-random-tool__tabs';
    const panels = document.createElement('div');
    panels.className = 'mini-random-tool__panels';

    const panelRefs = {};
    const tabButtons = {};

    function switchTab(id){
      if (!tabOrder.includes(id)) return;
      state.activeTab = id;
      saveState(state);
      Object.entries(panelRefs).forEach(([key, panel]) => {
        if (panel){
          if (key === id){
            panel.classList.add('is-active');
          } else {
            panel.classList.remove('is-active');
          }
        }
      });
      Object.entries(tabButtons).forEach(([key, button]) => {
        if (button){
          if (key === id){
            button.classList.add('is-active');
            button.setAttribute('aria-selected', 'true');
            button.setAttribute('tabindex', '0');
          } else {
            button.classList.remove('is-active');
            button.setAttribute('aria-selected', 'false');
            button.setAttribute('tabindex', '-1');
          }
        }
      });
    }

    const tabDefinitions = [
      { id: 'dice', label: text('.tabs.dice', 'サイコロ'), builder: buildDicePanel },
      { id: 'roulette', label: text('.tabs.roulette', 'ルーレット'), builder: buildRoulettePanel },
      { id: 'choice', label: text('.tabs.choice', 'ランダム選択'), builder: buildChoicePanel },
      { id: 'text', label: text('.tabs.text', 'ランダムテキスト'), builder: buildTextPanel },
      { id: 'number', label: text('.tabs.number', 'ランダム数字'), builder: buildNumberPanel }
    ];

    tabDefinitions.forEach(({ id, label, builder }) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'mini-random-tool__tab';
      button.textContent = label;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-controls', `mini-random-tool-panel-${id}`);
      button.addEventListener('click', () => switchTab(id));
      button.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft'){
          event.preventDefault();
          const index = tabOrder.indexOf(id);
          if (index === -1) return;
          const direction = event.key === 'ArrowRight' ? 1 : -1;
          const nextIndex = (index + direction + tabOrder.length) % tabOrder.length;
          const nextId = tabOrder[nextIndex];
          const nextButton = tabButtons[nextId];
          if (nextButton){
            nextButton.focus();
            switchTab(nextId);
          }
        }
      });
      tabs.appendChild(button);
      tabButtons[id] = button;

      const panel = builder({
        id,
        text,
        formatNumber,
        state,
        awardXp: typeof awardXp === 'function' ? awardXp : () => {},
        saveState
      });
      panel.id = `mini-random-tool-panel-${id}`;
      panel.setAttribute('role', 'tabpanel');
      panels.appendChild(panel);
      panelRefs[id] = panel;
    });

    container.appendChild(header);
    container.appendChild(tabs);
    container.appendChild(panels);
    root.innerHTML = '';
    root.appendChild(container);

    switchTab(state.activeTab);

    return () => {
      root.innerHTML = '';
    };
  }

  function buildDicePanel({ text, formatNumber, state, awardXp, saveState }){
    const panel = document.createElement('div');
    panel.className = 'mini-random-tool__panel';

    const formRow = document.createElement('div');
    formRow.className = 'mini-random-tool__form-row';

    const label = document.createElement('label');
    label.className = 'mini-random-tool__label';
    label.textContent = text('.dice.countLabel', 'サイコロの数');

    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'mini-random-tool__input';
    input.min = '1';
    input.max = String(MAX_DICE);
    input.value = state.diceCount;
    input.setAttribute('aria-label', text('.dice.countLabel', 'サイコロの数'));

    const rollButton = document.createElement('button');
    rollButton.type = 'button';
    rollButton.className = 'mini-random-tool__primary-button';
    rollButton.textContent = text('.dice.roll', 'サイコロを振る');

    const result = document.createElement('div');
    result.className = 'mini-random-tool__result';
    result.textContent = text('.dice.placeholder', 'サイコロを振ると結果が表示されます。');

    const diceContainer = document.createElement('div');
    diceContainer.className = 'mini-random-tool__dice-container';

    formRow.appendChild(label);
    formRow.appendChild(input);
    formRow.appendChild(rollButton);

    panel.appendChild(formRow);
    panel.appendChild(diceContainer);
    panel.appendChild(result);

    rollButton.addEventListener('click', () => {
      const count = clampDiceCount(input.value);
      input.value = String(count);
      state.diceCount = count;
      saveState(state);
      const values = Array.from({ length: count }, () => 1 + Math.floor(Math.random() * 6));
      const total = values.reduce((sum, value) => sum + value, 0);
      diceContainer.innerHTML = '';
      values.forEach((value) => {
        const die = document.createElement('div');
        die.className = 'mini-random-tool__die';
        die.setAttribute('data-value', String(value));
        die.textContent = String(value);
        diceContainer.appendChild(die);
      });
      result.innerHTML = '';
      const summary = document.createElement('p');
      summary.innerHTML = text('.dice.summary', () => `結果: <strong>${values.join(', ')}</strong>`, { values: values.join(', ') });
      const totalLine = document.createElement('p');
      totalLine.innerHTML = text('.dice.total', () => `合計 <strong>${formatNumber(total)}</strong>`, { total: formatNumber(total) });
      const xpLine = document.createElement('p');
      xpLine.innerHTML = text('.dice.xp', () => `+${formatNumber(total)} EXP 獲得！`, { xp: formatNumber(total) });
      result.appendChild(summary);
      result.appendChild(totalLine);
      result.appendChild(xpLine);
      awardXp(total);
    });

    input.addEventListener('change', () => {
      const count = clampDiceCount(input.value);
      input.value = String(count);
      state.diceCount = count;
      saveState(state);
    });

    return panel;
  }

  function buildRoulettePanel({ text, formatNumber, state, awardXp = () => {}, saveState }){
    const panel = document.createElement('div');
    panel.className = 'mini-random-tool__panel';

    const layout = document.createElement('div');
    layout.className = 'mini-random-tool__roulette-layout';

    const wheelWrapper = document.createElement('div');
    wheelWrapper.className = 'mini-random-tool__roulette-wrapper';

    const wheel = document.createElement('div');
    wheel.className = 'mini-random-tool__roulette-wheel';
    const labelLayer = document.createElement('div');
    labelLayer.className = 'mini-random-tool__roulette-label-layer';
    wheel.appendChild(labelLayer);

    const pointer = document.createElement('div');
    pointer.className = 'mini-random-tool__roulette-pointer';

    const spinButton = document.createElement('button');
    spinButton.type = 'button';
    spinButton.className = 'mini-random-tool__primary-button mini-random-tool__spin-button';
    spinButton.textContent = text('.roulette.spin', 'ルーレットを回す');

    const result = document.createElement('div');
    result.className = 'mini-random-tool__result';
    result.textContent = text('.roulette.placeholder', '名前とEXPを設定してルーレットを回しましょう。');

    const list = document.createElement('div');
    list.className = 'mini-random-tool__segment-list';

    const addButton = document.createElement('button');
    addButton.type = 'button';
    addButton.className = 'mini-random-tool__secondary-button';
    addButton.textContent = text('.roulette.addSegment', 'セグメントを追加');

    wheelWrapper.appendChild(wheel);
    wheelWrapper.appendChild(pointer);
    wheelWrapper.appendChild(spinButton);

    layout.appendChild(wheelWrapper);
    layout.appendChild(list);

    panel.appendChild(layout);
    panel.appendChild(addButton);
    panel.appendChild(result);

    let wheelRotation = 0;
    let spinTimer = null;
    let wheelGeometry = [];
    let rerenderScheduled = false;

    function getSegments(){
      return state.rouletteSegments
        .map((segment) => ({
          id: segment.id,
          name: clampName(segment.name),
          xp: clampRouletteXp(segment.xp),
          weight: clampRouletteWeight(segment.weight)
        }))
        .filter((segment) => segment.name && segment.weight > 0);
    }

    function persistSegments(segments){
      state.rouletteSegments = segments.slice(0, MAX_SEGMENTS);
      saveState(state);
      renderList();
      renderWheel();
    }

    function updateSegment(id, updates){
      const next = state.rouletteSegments.map((segment) => {
        if (segment.id !== id) return segment;
        return Object.assign({}, segment, updates);
      });
      persistSegments(next);
    }

    function removeSegment(id){
      const next = state.rouletteSegments.filter((segment) => segment.id !== id);
      if (!next.length){
        next.push(sanitizeSegment({ name: 'EXP100', xp: 100, weight: 1 }));
      }
      persistSegments(next);
    }

    function renderList(){
      list.innerHTML = '';
      const segments = state.rouletteSegments;
      segments.forEach((segment, index) => {
        const row = document.createElement('div');
        row.className = 'mini-random-tool__segment-row';

        const color = document.createElement('span');
        color.className = 'mini-random-tool__segment-color';
        color.style.backgroundColor = WHEEL_COLORS[index % WHEEL_COLORS.length];
        row.appendChild(color);

        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'mini-random-tool__input mini-random-tool__segment-name';
        nameInput.placeholder = text('.roulette.namePlaceholder', '名前');
        nameInput.value = segment.name;
        nameInput.addEventListener('change', () => {
          updateSegment(segment.id, { name: clampName(nameInput.value) });
        });
        row.appendChild(nameInput);

        const xpInput = document.createElement('input');
        xpInput.type = 'number';
        xpInput.className = 'mini-random-tool__input mini-random-tool__segment-xp';
        xpInput.placeholder = text('.roulette.xpPlaceholder', 'EXP');
        xpInput.min = '0';
        xpInput.max = String(MAX_ROULETTE_XP);
        xpInput.value = String(clampRouletteXp(segment.xp));
        xpInput.addEventListener('change', () => {
          updateSegment(segment.id, { xp: clampRouletteXp(xpInput.value) });
        });
        row.appendChild(xpInput);

        const weightInput = document.createElement('input');
        weightInput.type = 'number';
        weightInput.className = 'mini-random-tool__input mini-random-tool__segment-weight';
        weightInput.placeholder = text('.roulette.weightPlaceholder', '重み');
        weightInput.min = '1';
        weightInput.max = String(MAX_ROULETTE_WEIGHT);
        weightInput.value = String(clampRouletteWeight(segment.weight));
        weightInput.addEventListener('change', () => {
          updateSegment(segment.id, { weight: clampRouletteWeight(weightInput.value) });
        });
        row.appendChild(weightInput);

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'mini-random-tool__icon-button';
        removeButton.setAttribute('aria-label', text('.roulette.removeSegment', 'このセグメントを削除'));
        removeButton.textContent = '×';
        removeButton.addEventListener('click', () => removeSegment(segment.id));
        row.appendChild(removeButton);

        list.appendChild(row);
      });

      if (segments.length >= MAX_SEGMENTS){
        addButton.disabled = true;
      } else {
        addButton.disabled = false;
      }
    }

    function renderWheel(){
      const segments = getSegments();
      if (!segments.length){
        wheel.style.background = 'linear-gradient(135deg, #4b4b4b, #2b2b2b)';
        labelLayer.innerHTML = '';
        wheelGeometry = [];
        return;
      }
      const totalWeight = segments.reduce((sum, segment) => sum + segment.weight, 0);
      if (totalWeight <= 0){
        wheel.style.background = 'linear-gradient(135deg, #4b4b4b, #2b2b2b)';
        labelLayer.innerHTML = '';
        wheelGeometry = [];
        return;
      }
      const gradientParts = [];
      let current = 0;
      const radiusRaw = wheel.offsetWidth ? wheel.offsetWidth / 2 : wheel.clientWidth / 2;
      const radius = radiusRaw || 120;
      const distance = Math.max(36, radius * 0.68);
      labelLayer.innerHTML = '';
      wheelGeometry = [];
      segments.forEach((segment, index) => {
        const fraction = segment.weight / totalWeight;
        const sweep = fraction * 360;
        const start = current;
        let end = current + sweep;
        if (index === segments.length - 1){
          end = 360;
        }
        current = end;
        const color = WHEEL_COLORS[index % WHEEL_COLORS.length];
        gradientParts.push(`${color} ${start}deg ${end}deg`);
        const actualSweep = end - start;
        const mid = start + actualSweep / 2;
        const label = document.createElement('div');
        label.className = 'mini-random-tool__roulette-label';
        label.style.transform = `rotate(${mid}deg) translateY(${-distance}px)`;
        const textEl = document.createElement('span');
        textEl.className = 'mini-random-tool__roulette-label-text';
        textEl.textContent = segment.name;
        textEl.style.transform = `rotate(${-mid}deg)`;
        label.appendChild(textEl);
        labelLayer.appendChild(label);
        wheelGeometry.push({ id: segment.id, start, end, sweep: actualSweep });
      });
      wheel.style.background = `conic-gradient(${gradientParts.join(',')})`;
      wheel.setAttribute('data-segment-count', String(segments.length));
      if (!wheel.offsetWidth && !rerenderScheduled && typeof requestAnimationFrame === 'function'){
        rerenderScheduled = true;
        requestAnimationFrame(() => {
          rerenderScheduled = false;
          renderWheel();
        });
      }
    }

    function spin(){
      const segments = getSegments();
      if (!segments.length){
        result.textContent = text('.roulette.noSegments', 'セグメントを追加してください。');
        return;
      }
      if (spinButton.disabled) return;
      const prefersReducedMotion = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

      const totalWeight = segments.reduce((sum, segment) => sum + segment.weight, 0);
      let threshold = Math.random() * totalWeight;
      let chosenSegment = segments[segments.length - 1];
      for (const segment of segments){
        threshold -= segment.weight;
        if (threshold <= 0){
          chosenSegment = segment;
          break;
        }
      }
      const geometry = wheelGeometry.find((entry) => entry.id === chosenSegment.id);
      const fallbackSweep = 360 / segments.length;
      const sweep = geometry ? geometry.sweep : fallbackSweep;
      const startAngle = geometry ? geometry.start : segments.indexOf(chosenSegment) * fallbackSweep;
      const offset = sweep * (0.2 + Math.random() * 0.6);
      const targetAngle = startAngle + offset;
      const extraSpins = prefersReducedMotion ? 0 : 2 + Math.floor(Math.random() * 3);
      const duration = prefersReducedMotion ? 0.6 : 3.2;
      const targetRotation = wheelRotation - (extraSpins * 360 + targetAngle);
      wheelRotation = targetRotation % 360;

      wheel.style.transition = `transform ${duration}s cubic-bezier(0.22, 0.61, 0.36, 1)`;
      wheel.style.transform = `rotate(${targetRotation}deg)`;
      spinButton.disabled = true;
      spinButton.textContent = text('.roulette.spinning', '回転中…');

      if (spinTimer) clearTimeout(spinTimer);
      spinTimer = setTimeout(() => {
        finishSpin(chosenSegment);
      }, duration * 1000 + 50);
    }

    function finishSpin(segment){
      spinButton.disabled = false;
      spinButton.textContent = text('.roulette.spin', 'ルーレットを回す');
      result.innerHTML = '';
      const nameLine = document.createElement('p');
      nameLine.innerHTML = text('.roulette.result', () => `結果: <strong>${segment.name}</strong>`, { name: segment.name });
      const xpLine = document.createElement('p');
      xpLine.innerHTML = text('.roulette.xp', () => `+${formatNumber(segment.xp)} EXP 獲得！`, { xp: formatNumber(segment.xp) });
      result.appendChild(nameLine);
      result.appendChild(xpLine);
      awardXp(segment.xp);
    }

    addButton.addEventListener('click', () => {
      if (state.rouletteSegments.length >= MAX_SEGMENTS) return;
      const next = state.rouletteSegments.concat({
        id: createId(),
        name: text('.roulette.defaultName', 'EXP100'),
        xp: 100,
        weight: 1
      });
      persistSegments(next);
    });

    spinButton.addEventListener('click', () => {
      const prefersReducedMotion = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;
      if (prefersReducedMotion){
        wheel.style.transition = 'none';
        wheel.style.transform = 'rotate(0deg)';
        wheelRotation = 0;
      }
      spin();
    });

    wheel.addEventListener('transitionend', () => {
      wheel.style.transition = 'none';
      wheel.style.transform = `rotate(${wheelRotation}deg)`;
    });

    renderList();
    renderWheel();

    return panel;
  }

  function buildChoicePanel({ text, state, saveState, awardXp = () => {} }){
    const panel = document.createElement('div');
    panel.className = 'mini-random-tool__panel';

    const textarea = document.createElement('textarea');
    textarea.className = 'mini-random-tool__textarea';
    textarea.rows = 6;
    textarea.placeholder = text('.choice.placeholder', '選択肢を1行ずつ入力');
    textarea.value = state.selectionList.join('\n');

    const pickButton = document.createElement('button');
    pickButton.type = 'button';
    pickButton.className = 'mini-random-tool__primary-button';
    pickButton.textContent = text('.choice.pick', 'ランダムに選ぶ');

    const result = document.createElement('div');
    result.className = 'mini-random-tool__result';
    result.textContent = text('.choice.resultPlaceholder', '選択ボタンで結果を表示します。');

    textarea.addEventListener('input', () => {
      const lines = textarea.value.split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line)
        .slice(0, 200);
      state.selectionList = lines;
      saveState(state);
    });

    pickButton.addEventListener('click', () => {
      const options = state.selectionList;
      if (!options.length){
        result.textContent = text('.choice.empty', '選択肢がありません。追加してください。');
        return;
      }
      const choice = options[Math.floor(Math.random() * options.length)];
      result.innerHTML = text('.choice.result', () => `選択結果: <strong>${choice}</strong>`, { choice });
      awardXp(options.length);
    });

    panel.appendChild(textarea);
    panel.appendChild(pickButton);
    panel.appendChild(result);

    return panel;
  }

  function buildTextPanel({ text, state, saveState, awardXp = () => {} }){
    const panel = document.createElement('div');
    panel.className = 'mini-random-tool__panel';

    state.textOptions = sanitizeTextOptions(state.textOptions);
    const options = state.textOptions;

    const lengthRow = document.createElement('div');
    lengthRow.className = 'mini-random-tool__form-row';

    const lengthLabel = document.createElement('label');
    lengthLabel.className = 'mini-random-tool__label';
    lengthLabel.textContent = text('.text.lengthLabel', '文字数');

    const lengthInput = document.createElement('input');
    lengthInput.type = 'number';
    lengthInput.className = 'mini-random-tool__input';
    lengthInput.min = '1';
    lengthInput.max = String(MAX_TEXT_LENGTH);
    lengthInput.value = options.length;
    lengthInput.setAttribute('aria-label', text('.text.lengthLabel', '文字数'));

    lengthRow.appendChild(lengthLabel);
    lengthRow.appendChild(lengthInput);

    const charactersTitle = document.createElement('p');
    charactersTitle.className = 'mini-random-tool__section-title';
    charactersTitle.textContent = text('.text.charactersTitle', '使用する文字種');

    const checkboxList = document.createElement('div');
    checkboxList.className = 'mini-random-tool__checkbox-list';

    const toggleTitle = document.createElement('p');
    toggleTitle.className = 'mini-random-tool__section-title';
    toggleTitle.textContent = text('.text.additionalOptions', '追加設定');

    const toggleList = document.createElement('div');
    toggleList.className = 'mini-random-tool__checkbox-list';

    function createCheckbox(labelText, checked){
      const labelEl = document.createElement('label');
      labelEl.className = 'mini-random-tool__checkbox';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.className = 'mini-random-tool__checkbox-input';
      input.checked = checked;
      const span = document.createElement('span');
      span.className = 'mini-random-tool__checkbox-label';
      span.textContent = labelText;
      labelEl.appendChild(input);
      labelEl.appendChild(span);
      return { labelEl, input };
    }

    const checkboxDefinitions = [
      { key: 'useLowercase', label: text('.text.lowercase', '小文字 (a-z)'), container: checkboxList },
      { key: 'useUppercase', label: text('.text.uppercase', '大文字 (A-Z)'), container: checkboxList },
      { key: 'useNumbers', label: text('.text.numbers', '数字 (0-9)'), container: checkboxList },
      { key: 'useSymbols', label: text('.text.symbols', '記号 (!@#など)'), container: checkboxList },
      { key: 'includeSpaces', label: text('.text.includeSpaces', 'スペースを含める（テキスト生成のみ）'), container: toggleList },
      { key: 'allowAmbiguous', label: text('.text.allowAmbiguous', '曖昧な文字を含める（O/0/I/1/|など）'), container: toggleList }
    ];

    checkboxDefinitions.forEach(({ key, label, container }) => {
      const { labelEl, input } = createCheckbox(label, Boolean(options[key]));
      input.addEventListener('change', () => {
        options[key] = input.checked;
        saveState(state);
      });
      container.appendChild(labelEl);
    });

    const customWrapper = document.createElement('div');
    customWrapper.className = 'mini-random-tool__custom-wrapper';

    const customLabel = document.createElement('label');
    customLabel.className = 'mini-random-tool__label';
    customLabel.textContent = text('.text.customLabel', '追加する文字');
    const customId = `${createId()}_custom`;
    customLabel.setAttribute('for', customId);

    const customInput = document.createElement('input');
    customInput.type = 'text';
    customInput.id = customId;
    customInput.className = 'mini-random-tool__input mini-random-tool__custom-input';
    customInput.value = options.customCharacters;
    customInput.placeholder = text('.text.customPlaceholder', '任意の文字を追加');

    const customHelper = document.createElement('p');
    customHelper.className = 'mini-random-tool__helper-text';
    customHelper.textContent = text('.text.customHelper', '重複は自動で削除されます。最大200文字まで。');

    customWrapper.appendChild(customLabel);
    customWrapper.appendChild(customInput);

    const buttonRow = document.createElement('div');
    buttonRow.className = 'mini-random-tool__button-row';

    const passwordButton = document.createElement('button');
    passwordButton.type = 'button';
    passwordButton.className = 'mini-random-tool__primary-button';
    passwordButton.textContent = text('.text.generatePassword', 'パスワードを生成');

    const textButton = document.createElement('button');
    textButton.type = 'button';
    textButton.className = 'mini-random-tool__secondary-button';
    textButton.textContent = text('.text.generateText', 'テキストを生成');

    buttonRow.appendChild(passwordButton);
    buttonRow.appendChild(textButton);

    const result = document.createElement('div');
    result.className = 'mini-random-tool__result mini-random-tool__result--text';

    const resultHeader = document.createElement('div');
    resultHeader.className = 'mini-random-tool__result-header';

    const resultLabel = document.createElement('span');
    resultLabel.className = 'mini-random-tool__result-caption';
    const baseResultLabel = text('.text.resultHeading', '生成結果');
    resultLabel.textContent = baseResultLabel;

    const copyButton = document.createElement('button');
    copyButton.type = 'button';
    copyButton.className = 'mini-random-tool__secondary-button mini-random-tool__copy-button';
    copyButton.textContent = text('.text.copy', 'コピー');
    copyButton.disabled = true;

    resultHeader.appendChild(resultLabel);
    resultHeader.appendChild(copyButton);

    const resultBox = document.createElement('pre');
    resultBox.className = 'mini-random-tool__result-box';
    const placeholderText = text('.text.placeholder', '設定して文字列を生成するとここに表示されます。');
    resultBox.textContent = placeholderText;
    resultBox.setAttribute('aria-live', 'polite');

    result.appendChild(resultHeader);
    result.appendChild(resultBox);

    const status = document.createElement('p');
    status.className = 'mini-random-tool__status';
    status.textContent = '';

    function showStatus(message, statusType){
      if (!message){
        status.textContent = '';
        status.removeAttribute('data-status');
        return;
      }
      status.textContent = message;
      status.setAttribute('data-status', statusType);
    }

    function clearStatus(){
      showStatus('', '');
    }

    function updateLength(){
      const length = clampTextLength(lengthInput.value);
      lengthInput.value = String(length);
      if (options.length !== length){
        options.length = length;
        saveState(state);
      }
    }

    lengthInput.addEventListener('change', updateLength);

    customInput.addEventListener('input', () => {
      const sanitized = sanitizeCustomCharacters(customInput.value);
      if (sanitized !== customInput.value){
        const pos = customInput.selectionStart;
        customInput.value = sanitized;
        if (typeof pos === 'number'){
          const offset = Math.min(pos, sanitized.length);
          try {
            customInput.setSelectionRange(offset, offset);
          } catch {}
        }
      }
      if (options.customCharacters !== sanitized){
        options.customCharacters = sanitized;
        saveState(state);
      }
    });

    function buildCharacterPools(forPassword){
      const sets = [];
      if (options.useLowercase){
        const chars = uniqueCharacters(filterAmbiguousCharacters(LOWERCASE_CHARACTERS, options.allowAmbiguous));
        if (chars) sets.push(chars);
      }
      if (options.useUppercase){
        const chars = uniqueCharacters(filterAmbiguousCharacters(UPPERCASE_CHARACTERS, options.allowAmbiguous));
        if (chars) sets.push(chars);
      }
      if (options.useNumbers){
        const chars = uniqueCharacters(filterAmbiguousCharacters(NUMBER_CHARACTERS, options.allowAmbiguous));
        if (chars) sets.push(chars);
      }
      if (options.useSymbols){
        const chars = uniqueCharacters(filterAmbiguousCharacters(SYMBOL_CHARACTERS, options.allowAmbiguous));
        if (chars) sets.push(chars);
      }
      if (options.customCharacters){
        const chars = uniqueCharacters(filterAmbiguousCharacters(options.customCharacters, options.allowAmbiguous));
        if (chars) sets.push(chars);
      }
      let pool = sets.join('');
      if (!forPassword && options.includeSpaces){
        pool += ' ';
      }
      pool = uniqueCharacters(pool);
      return {
        pool,
        sets,
        minLength: forPassword ? sets.length || 1 : 1
      };
    }

    function renderResult(){
      const value = options.lastResult;
      const type = options.lastType;
      if (!value){
        resultLabel.textContent = baseResultLabel;
        resultBox.textContent = placeholderText;
        resultBox.classList.add('is-empty');
        copyButton.disabled = true;
        return;
      }
      const labelKey = type === 'text' ? '.text.textLabel' : '.text.passwordLabel';
      const fallback = type === 'text' ? 'テキスト生成結果' : 'パスワード生成結果';
      resultLabel.textContent = text(labelKey, fallback);
      resultBox.textContent = value;
      resultBox.classList.remove('is-empty');
      copyButton.disabled = false;
    }

    function updateResult(type, value){
      options.lastType = type;
      options.lastResult = value;
      saveState(state);
      renderResult();
    }

    function showNoCharsetError(){
      showStatus(text('.text.errorNoCharset', '文字種を1つ以上選択してください。'), 'error');
    }

    function showLengthError(min){
      showStatus(text('.text.errorLength', () => `選択した文字種では最低${min}文字が必要です。`, { min }), 'error');
    }

    function ensureLength(){
      const length = clampTextLength(lengthInput.value);
      lengthInput.value = String(length);
      if (options.length !== length){
        options.length = length;
        saveState(state);
      }
      return length;
    }

    function generatePassword(){
      clearStatus();
      const length = ensureLength();
      const { pool, sets, minLength } = buildCharacterPools(true);
      if (!pool){
        showNoCharsetError();
        return;
      }
      if (length < minLength){
        showLengthError(minLength);
        return;
      }
      const characters = [];
      sets.forEach((set) => {
        characters.push(pickRandomCharacter(set));
      });
      while (characters.length < length){
        characters.push(pickRandomCharacter(pool));
      }
      shuffleArray(characters);
      const value = characters.join('');
      updateResult('password', value);
      const xpGain = Math.max(1, pool.length * length);
      awardXp(xpGain);
    }

    function generateText(){
      clearStatus();
      const length = ensureLength();
      const { pool } = buildCharacterPools(false);
      if (!pool){
        showNoCharsetError();
        return;
      }
      const characters = [];
      for (let index = 0; index < length; index += 1){
        characters.push(pickRandomCharacter(pool));
      }
      const value = characters.join('');
      updateResult('text', value);
      const xpGain = Math.max(1, Math.floor((pool.length * length) / 7));
      awardXp(xpGain);
    }

    passwordButton.addEventListener('click', generatePassword);
    textButton.addEventListener('click', generateText);

    async function copyResult(){
      if (!options.lastResult) return;
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function'){
          await navigator.clipboard.writeText(options.lastResult);
        } else {
          const temp = document.createElement('textarea');
          temp.value = options.lastResult;
          temp.setAttribute('readonly', 'true');
          temp.style.position = 'fixed';
          temp.style.top = '-9999px';
          document.body.appendChild(temp);
          temp.select();
          document.execCommand('copy');
          document.body.removeChild(temp);
        }
        showStatus(text('.text.copied', 'コピーしました！'), 'success');
      } catch {
        showStatus(text('.text.copyFailed', 'コピーに失敗しました。'), 'error');
      }
    }

    copyButton.addEventListener('click', () => {
      copyResult();
    });

    renderResult();

    panel.appendChild(lengthRow);
    panel.appendChild(charactersTitle);
    panel.appendChild(checkboxList);
    panel.appendChild(toggleTitle);
    panel.appendChild(toggleList);
    panel.appendChild(customWrapper);
    panel.appendChild(customHelper);
    panel.appendChild(buttonRow);
    panel.appendChild(result);
    panel.appendChild(status);

    return panel;
  }

  function buildNumberPanel({ text, formatNumber, state, saveState, awardXp = () => {} }){
    const panel = document.createElement('div');
    panel.className = 'mini-random-tool__panel';

    const formRow = document.createElement('div');
    formRow.className = 'mini-random-tool__form-row';

    const minLabel = document.createElement('label');
    minLabel.className = 'mini-random-tool__label';
    minLabel.textContent = text('.number.minLabel', '最小値');

    const minInput = document.createElement('input');
    minInput.type = 'number';
    minInput.className = 'mini-random-tool__input';
    minInput.value = state.numberRange.min;
    minInput.setAttribute('aria-label', text('.number.minLabel', '最小値'));

    const maxLabel = document.createElement('label');
    maxLabel.className = 'mini-random-tool__label';
    maxLabel.textContent = text('.number.maxLabel', '最大値');

    const maxInput = document.createElement('input');
    maxInput.type = 'number';
    maxInput.className = 'mini-random-tool__input';
    maxInput.value = state.numberRange.max;
    maxInput.setAttribute('aria-label', text('.number.maxLabel', '最大値'));

    const generateButton = document.createElement('button');
    generateButton.type = 'button';
    generateButton.className = 'mini-random-tool__primary-button';
    generateButton.textContent = text('.number.generate', '数字を生成');

    const result = document.createElement('div');
    result.className = 'mini-random-tool__result';
    result.textContent = text('.number.placeholder', '最小値と最大値を設定してから生成してください。');

    function updateRange(){
      const min = clampRangeValue(minInput.value);
      const max = clampRangeValue(maxInput.value);
      const normalized = min <= max ? { min, max } : { min: max, max: min };
      state.numberRange = normalized;
      saveState(state);
      minInput.value = String(normalized.min);
      maxInput.value = String(normalized.max);
    }

    minInput.addEventListener('change', updateRange);
    maxInput.addEventListener('change', updateRange);

    generateButton.addEventListener('click', () => {
      const range = state.numberRange;
      const span = range.max - range.min + 1;
      if (!Number.isFinite(span) || span <= 0){
        result.textContent = text('.number.invalid', '範囲が正しくありません。');
        return;
      }
      const value = range.min + Math.floor(Math.random() * span);
      result.innerHTML = text('.number.result', () => `結果: <strong>${formatNumber(value)}</strong>`, { value: formatNumber(value) });
      const maxAbs = Math.abs(range.max);
      const digits = maxAbs === 0 ? 1 : Math.floor(Math.log10(maxAbs)) + 1;
      const xpGain = Math.max(1, digits * 10);
      awardXp(xpGain);
    });

    formRow.appendChild(minLabel);
    formRow.appendChild(minInput);
    formRow.appendChild(maxLabel);
    formRow.appendChild(maxInput);
    formRow.appendChild(generateButton);

    panel.appendChild(formRow);
    panel.appendChild(result);

    return panel;
  }

  function ensureStyles(){
    if (typeof document === 'undefined') return;
    const styleId = 'mini-random-tool-style';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .mini-random-tool {
        font-family: var(--mini-font-family, 'Noto Sans JP', system-ui, sans-serif);
        color: var(--mini-text-color, #f1f5f9);
        background: rgba(13, 17, 23, 0.8);
        border: 1px solid rgba(148, 163, 184, 0.2);
        border-radius: 16px;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .mini-random-tool__header {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .mini-random-tool__title {
        margin: 0;
        font-size: 1.4rem;
        font-weight: 600;
      }
      .mini-random-tool__subtitle {
        margin: 0;
        font-size: 0.95rem;
        color: rgba(241, 245, 249, 0.75);
      }
      .mini-random-tool__tabs {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .mini-random-tool__tab {
        border: none;
        border-radius: 999px;
        padding: 8px 16px;
        background: rgba(30, 41, 59, 0.7);
        color: inherit;
        cursor: pointer;
        transition: background 0.2s ease, transform 0.2s ease;
      }
      .mini-random-tool__tab:hover {
        background: rgba(59, 130, 246, 0.45);
        transform: translateY(-1px);
      }
      .mini-random-tool__tab.is-active {
        background: linear-gradient(135deg, #38bdf8, #9333ea);
        color: #0f172a;
        font-weight: 600;
      }
      .mini-random-tool__panels {
        position: relative;
      }
      .mini-random-tool__panel {
        display: none;
        flex-direction: column;
        gap: 12px;
        animation: mini-random-tool-fade-in 0.25s ease;
      }
      .mini-random-tool__panel.is-active {
        display: flex;
      }
      @keyframes mini-random-tool-fade-in {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .mini-random-tool__form-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }
      .mini-random-tool__label {
        min-width: 72px;
        font-size: 0.9rem;
        color: rgba(241, 245, 249, 0.75);
      }
      .mini-random-tool__input {
        flex: 1 1 120px;
        padding: 8px 10px;
        border-radius: 10px;
        border: 1px solid rgba(148, 163, 184, 0.3);
        background: rgba(15, 23, 42, 0.75);
        color: inherit;
        font-size: 0.95rem;
      }
      .mini-random-tool__input:focus {
        outline: none;
        border-color: rgba(56, 189, 248, 0.8);
        box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.25);
      }
      .mini-random-tool__primary-button,
      .mini-random-tool__secondary-button {
        border: none;
        border-radius: 12px;
        padding: 10px 16px;
        cursor: pointer;
        font-weight: 600;
        transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
      }
      .mini-random-tool__primary-button {
        background: linear-gradient(135deg, #38bdf8, #9333ea);
        color: #0f172a;
        box-shadow: 0 6px 16px rgba(56, 189, 248, 0.25);
      }
      .mini-random-tool__primary-button:hover {
        transform: translateY(-1px);
        box-shadow: 0 10px 22px rgba(147, 51, 234, 0.35);
      }
      .mini-random-tool__primary-button:disabled {
        opacity: 0.55;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }
      .mini-random-tool__secondary-button {
        background: rgba(30, 41, 59, 0.7);
        color: inherit;
        border: 1px solid rgba(148, 163, 184, 0.25);
      }
      .mini-random-tool__secondary-button:hover {
        background: rgba(59, 130, 246, 0.3);
        border-color: rgba(59, 130, 246, 0.5);
      }
      .mini-random-tool__icon-button {
        border: none;
        background: rgba(239, 68, 68, 0.1);
        color: rgba(239, 68, 68, 0.9);
        border-radius: 8px;
        width: 32px;
        height: 32px;
        font-size: 1rem;
        cursor: pointer;
      }
      .mini-random-tool__icon-button:hover {
        background: rgba(239, 68, 68, 0.25);
      }
      .mini-random-tool__result {
        background: rgba(15, 23, 42, 0.6);
        border-radius: 12px;
        padding: 12px;
        font-size: 0.95rem;
        line-height: 1.5;
      }
      .mini-random-tool__dice-container {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .mini-random-tool__die {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 1.2rem;
        color: #0f172a;
        background: linear-gradient(145deg, #facc15, #f97316);
        box-shadow: 0 6px 12px rgba(249, 115, 22, 0.3);
      }
      .mini-random-tool__roulette-layout {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        align-items: flex-start;
      }
      .mini-random-tool__roulette-wrapper {
        position: relative;
        width: min(260px, 100%);
        aspect-ratio: 1 / 1;
      }
      .mini-random-tool__roulette-wheel {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 8px solid rgba(148, 163, 184, 0.3);
        box-shadow: inset 0 0 30px rgba(15, 23, 42, 0.7), 0 12px 30px rgba(15, 23, 42, 0.6);
        transition: transform 0.4s ease;
        position: relative;
        overflow: hidden;
      }
      .mini-random-tool__roulette-label-layer {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }
      .mini-random-tool__roulette-label {
        position: absolute;
        top: 50%;
        left: 50%;
        transform-origin: center;
      }
      .mini-random-tool__roulette-label-text {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 4px 8px;
        border-radius: 999px;
        background: rgba(15, 23, 42, 0.75);
        color: #f8fafc;
        font-size: 0.75rem;
        font-weight: 600;
        letter-spacing: 0.05em;
        white-space: nowrap;
        box-shadow: 0 6px 18px rgba(15, 23, 42, 0.45);
        transform-origin: center;
      }
      .mini-random-tool__roulette-pointer {
        position: absolute;
        top: -18px;
        left: 50%;
        width: 0;
        height: 0;
        border-left: 12px solid transparent;
        border-right: 12px solid transparent;
        border-bottom: 18px solid #38bdf8;
        transform: translateX(-50%);
        filter: drop-shadow(0 4px 6px rgba(56, 189, 248, 0.4));
        z-index: 3;
      }
      .mini-random-tool__spin-button {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        padding: 12px 20px;
        z-index: 4;
      }
      .mini-random-tool__segment-list {
        flex: 1 1 200px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-height: 260px;
        overflow: auto;
        padding-right: 4px;
      }
      .mini-random-tool__segment-row {
        display: grid;
        grid-template-columns: 20px minmax(0, 1fr) 100px 80px 32px;
        gap: 8px;
        align-items: center;
      }
      .mini-random-tool__segment-color {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.75);
      }
      .mini-random-tool__textarea {
        width: 100%;
        padding: 10px 12px;
        border-radius: 12px;
        border: 1px solid rgba(148, 163, 184, 0.3);
        background: rgba(15, 23, 42, 0.75);
        color: inherit;
        font-size: 0.95rem;
        line-height: 1.5;
      }
      .mini-random-tool__textarea:focus {
        outline: none;
        border-color: rgba(147, 51, 234, 0.6);
        box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.25);
      }
      .mini-random-tool__section-title {
        margin: 0;
        font-size: 0.9rem;
        font-weight: 600;
        color: rgba(241, 245, 249, 0.75);
      }
      .mini-random-tool__checkbox-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 8px;
      }
      .mini-random-tool__checkbox {
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(30, 41, 59, 0.6);
        border-radius: 10px;
        border: 1px solid rgba(148, 163, 184, 0.25);
        padding: 8px 10px;
        font-size: 0.9rem;
        cursor: pointer;
        color: #e2e8f0;
      }
      .mini-random-tool__checkbox-input {
        width: 18px;
        height: 18px;
        accent-color: #38bdf8;
      }
      .mini-random-tool__checkbox-label {
        color: #f1f5f9;
        font-weight: 600;
      }
      .mini-random-tool__segment-weight {
        text-align: center;
      }
      .mini-random-tool__custom-wrapper {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .mini-random-tool__custom-input {
        flex: 1 1 auto;
      }
      .mini-random-tool__helper-text {
        margin: 0;
        font-size: 0.82rem;
        color: rgba(241, 245, 249, 0.6);
      }
      .mini-random-tool__button-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .mini-random-tool__result-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      .mini-random-tool__result-caption {
        font-weight: 600;
      }
      .mini-random-tool__result-box {
        margin: 0;
        padding: 12px;
        border-radius: 12px;
        border: 1px solid rgba(148, 163, 184, 0.3);
        background: rgba(15, 23, 42, 0.75);
        font-family: 'Fira Code', 'Source Code Pro', Consolas, monospace;
        font-size: 1rem;
        line-height: 1.4;
        white-space: pre-wrap;
        word-break: break-word;
        min-height: 48px;
      }
      .mini-random-tool__result-box.is-empty {
        color: rgba(241, 245, 249, 0.6);
      }
      .mini-random-tool__status {
        margin: 0;
        font-size: 0.85rem;
        color: rgba(241, 245, 249, 0.7);
        min-height: 1.2em;
      }
      .mini-random-tool__status[data-status="error"] {
        color: #fca5a5;
      }
      .mini-random-tool__status[data-status="success"] {
        color: #bbf7d0;
      }
      .mini-random-tool__copy-button {
        white-space: nowrap;
      }
      @media (max-width: 720px) {
        .mini-random-tool {
          padding: 16px;
        }
        .mini-random-tool__segment-row {
          grid-template-columns: 16px 1fr 80px 28px;
        }
        .mini-random-tool__spin-button {
          font-size: 0.85rem;
          padding: 10px 16px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  if (typeof window !== 'undefined'){
    window.miniRandomTool = { create };
    if (typeof window.registerMiniGame === 'function'){
      window.registerMiniGame({
        id: 'random_tool',
        name: 'ランダムツール',
        nameKey: 'selection.miniexp.games.random_tool.name',
        description: 'サイコロ・ルーレット・リスト抽選・乱数/文字列生成を備えたユーティリティ',
        descriptionKey: 'selection.miniexp.games.random_tool.description',
        categoryIds: ['utility'],
        create
      });
    }
  }

  if (typeof module !== 'undefined' && module.exports){
    module.exports = { create };
  }
})();

(function(){
  const STORAGE_KEY = 'mini_counter_state_v1';
  const MAX_COUNTERS = 32;
  const MAX_NAME_LENGTH = 32;
  const MIN_VALUE = -1_000_000_000;
  const MAX_VALUE = 1_000_000_000;
  const MIN_STEP = 1;
  const MAX_STEP = 1000000;
  const XP_COOLDOWN_MS = 600;
  const XP_PER_STEP = 1;

  function safeNumber(value, fallback = 0){
    const num = Number(value);
    if (!Number.isFinite(num)) return fallback;
    return num;
  }

  function clampValue(num){
    if (!Number.isFinite(num)) return 0;
    if (num < MIN_VALUE) return MIN_VALUE;
    if (num > MAX_VALUE) return MAX_VALUE;
    return Math.round(num);
  }

  function clampStep(num){
    const value = Math.round(Math.abs(safeNumber(num, 1)));
    if (value < MIN_STEP) return MIN_STEP;
    if (value > MAX_STEP) return MAX_STEP;
    return value;
  }

  function sanitizeName(name, fallback = ''){
    if (typeof name !== 'string') return fallback;
    const trimmed = name.trim();
    if (!trimmed) return fallback;
    return trimmed.slice(0, MAX_NAME_LENGTH);
  }

  function randomId(){
    if (typeof crypto !== 'undefined' && crypto.randomUUID){
      return `ctr_${crypto.randomUUID()}`;
    }
    return `ctr_${Math.random().toString(36).slice(2, 10)}`;
  }

  function sanitizeCounter(raw, index = 0){
    if (!raw || typeof raw !== 'object'){
      return {
        id: randomId(),
        name: `カウンター${index + 1}`,
        value: 0,
        step: 1
      };
    }
    const id = typeof raw.id === 'string' && raw.id.trim() ? raw.id : randomId();
    const name = sanitizeName(raw.name, `カウンター${index + 1}`) || `カウンター${index + 1}`;
    const value = clampValue(safeNumber(raw.value, 0));
    const step = clampStep(raw.step);
    return { id, name, value, step };
  }

  function loadPersistentState(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { counters: [] };
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return { counters: [] };
      const list = Array.isArray(parsed.counters) ? parsed.counters : [];
      const counters = list.slice(0, MAX_COUNTERS).map(sanitizeCounter);
      return { counters };
    } catch {
      return { counters: [] };
    }
  }

  function writePersistentState(state){
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        counters: state.counters.map((counter, index) => ({
          id: counter.id || randomId(),
          name: sanitizeName(counter.name, `カウンター${index + 1}`) || `カウンター${index + 1}`,
          value: clampValue(counter.value),
          step: clampStep(counter.step)
        }))
      }));
    } catch {}
  }

  function create(root, awardXp){
    if (!root) throw new Error('MiniExp Counter requires a container');

    const persisted = loadPersistentState();
    const state = {
      counters: persisted.counters,
      sessionXp: 0,
      lastAwardAt: 0
    };

    let persistTimer = null;
    let isRunning = false;

    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.boxSizing = 'border-box';
    wrapper.style.padding = '24px clamp(12px, 4vw, 32px)';
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '20px';
    wrapper.style.background = 'linear-gradient(135deg, rgba(15,23,42,0.92), rgba(30,64,175,0.55))';
    wrapper.style.fontFamily = '"Noto Sans JP", "Hiragino Sans", sans-serif';
    wrapper.style.color = '#f8fafc';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.flexDirection = 'column';
    header.style.gap = '6px';

    const title = document.createElement('h2');
    title.textContent = 'カウンターパッド';
    title.style.margin = '0';
    title.style.fontSize = '24px';
    title.style.fontWeight = '700';
    title.style.letterSpacing = '0.04em';

    const subtitle = document.createElement('div');
    subtitle.textContent = '複数のカウントを素早く管理。増減操作は自動保存されます。';
    subtitle.style.fontSize = '14px';
    subtitle.style.color = 'rgba(226,232,240,0.85)';

    header.appendChild(title);
    header.appendChild(subtitle);

    const summaryBar = document.createElement('div');
    summaryBar.style.display = 'flex';
    summaryBar.style.flexWrap = 'wrap';
    summaryBar.style.gap = '8px';
    summaryBar.style.alignItems = 'center';

    function makeChip(){
      const chip = document.createElement('span');
      chip.style.display = 'inline-flex';
      chip.style.alignItems = 'center';
      chip.style.gap = '6px';
      chip.style.padding = '6px 12px';
      chip.style.borderRadius = '999px';
      chip.style.background = 'rgba(15,23,42,0.55)';
      chip.style.border = '1px solid rgba(148,163,184,0.35)';
      chip.style.fontSize = '13px';
      chip.style.color = '#e2e8f0';
      return chip;
    }

    const chipCount = makeChip();
    const chipSum = makeChip();
    const chipXp = makeChip();

    summaryBar.appendChild(chipCount);
    summaryBar.appendChild(chipSum);
    summaryBar.appendChild(chipXp);

    const formCard = document.createElement('form');
    formCard.style.display = 'grid';
    formCard.style.gridTemplateColumns = 'minmax(120px,1fr) minmax(120px, 0.7fr) minmax(120px,0.7fr) auto';
    formCard.style.gap = '12px';
    formCard.style.alignItems = 'center';
    formCard.style.padding = '16px';
    formCard.style.borderRadius = '16px';
    formCard.style.background = 'rgba(15,23,42,0.55)';
    formCard.style.border = '1px solid rgba(148,163,184,0.3)';
    formCard.style.boxShadow = '0 14px 40px rgba(2,6,23,0.45)';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'カウンター名';
    nameInput.maxLength = MAX_NAME_LENGTH;
    nameInput.required = true;
    nameInput.style.height = '42px';
    nameInput.style.borderRadius = '10px';
    nameInput.style.border = '1px solid rgba(148,163,184,0.4)';
    nameInput.style.padding = '0 14px';
    nameInput.style.background = 'rgba(15,23,42,0.4)';
    nameInput.style.color = '#f1f5f9';

    const valueInput = document.createElement('input');
    valueInput.type = 'number';
    valueInput.placeholder = '初期値 (0)';
    valueInput.style.height = '42px';
    valueInput.style.borderRadius = '10px';
    valueInput.style.border = '1px solid rgba(148,163,184,0.4)';
    valueInput.style.padding = '0 14px';
    valueInput.style.background = 'rgba(15,23,42,0.4)';
    valueInput.style.color = '#f1f5f9';

    const stepInput = document.createElement('input');
    stepInput.type = 'number';
    stepInput.placeholder = 'ステップ (1)';
    stepInput.min = '1';
    stepInput.style.height = '42px';
    stepInput.style.borderRadius = '10px';
    stepInput.style.border = '1px solid rgba(148,163,184,0.4)';
    stepInput.style.padding = '0 14px';
    stepInput.style.background = 'rgba(15,23,42,0.4)';
    stepInput.style.color = '#f1f5f9';

    const addButton = document.createElement('button');
    addButton.type = 'submit';
    addButton.textContent = '追加';
    addButton.style.height = '42px';
    addButton.style.padding = '0 22px';
    addButton.style.borderRadius = '12px';
    addButton.style.border = 'none';
    addButton.style.fontWeight = '600';
    addButton.style.fontSize = '15px';
    addButton.style.letterSpacing = '0.05em';
    addButton.style.background = 'linear-gradient(135deg, #38bdf8, #0ea5e9)';
    addButton.style.color = '#0f172a';
    addButton.style.cursor = 'pointer';
    addButton.style.boxShadow = '0 12px 26px rgba(14,165,233,0.35)';

    formCard.appendChild(nameInput);
    formCard.appendChild(valueInput);
    formCard.appendChild(stepInput);
    formCard.appendChild(addButton);

    const listContainer = document.createElement('div');
    listContainer.style.flex = '1';
    listContainer.style.display = 'grid';
    listContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(240px, 1fr))';
    listContainer.style.gap = '16px';
    listContainer.style.alignContent = 'start';
    listContainer.style.overflowY = 'auto';
    listContainer.style.paddingBottom = '12px';

    const emptyState = document.createElement('div');
    emptyState.textContent = 'まだカウンターがありません。上のフォームから追加してください。';
    emptyState.style.padding = '28px';
    emptyState.style.borderRadius = '16px';
    emptyState.style.border = '1px dashed rgba(148,163,184,0.4)';
    emptyState.style.background = 'rgba(15,23,42,0.35)';
    emptyState.style.textAlign = 'center';
    emptyState.style.fontSize = '14px';
    emptyState.style.color = 'rgba(226,232,240,0.75)';

    listContainer.appendChild(emptyState);

    wrapper.appendChild(header);
    wrapper.appendChild(summaryBar);
    wrapper.appendChild(formCard);
    wrapper.appendChild(listContainer);

    root.appendChild(wrapper);

    function persistSoon(){
      if (persistTimer) return;
      persistTimer = setTimeout(() => {
        persistTimer = null;
        writePersistentState(state);
      }, 250);
    }

    function award(type, amount, context){
      if (!awardXp || !amount) return 0;
      try {
        const gained = awardXp(amount, Object.assign({ type }, context || {}));
        const num = Number(gained);
        if (Number.isFinite(num) && num !== 0){
          state.sessionXp += num;
          updateSummary();
        }
        return gained;
      } catch {
        return 0;
      }
    }

    function updateSummary(){
      const total = state.counters.reduce((sum, counter) => sum + counter.value, 0);
      chipCount.textContent = `カウンター ${state.counters.length}件`;
      chipSum.textContent = `合計 ${total}`;
      chipXp.textContent = `セッションEXP ${Math.round(state.sessionXp)}`;
    }

    function createActionButton(label){
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
      btn.style.border = '1px solid rgba(148,163,184,0.3)';
      btn.style.background = 'rgba(15,23,42,0.4)';
      btn.style.color = '#f8fafc';
      btn.style.borderRadius = '10px';
      btn.style.padding = '10px 12px';
      btn.style.cursor = 'pointer';
      btn.style.fontWeight = '600';
      btn.style.fontSize = '14px';
      btn.style.transition = 'transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease';
      btn.addEventListener('pointerenter', () => {
        btn.style.transform = 'translateY(-1px) scale(1.01)';
        btn.style.boxShadow = '0 12px 24px rgba(8,47,73,0.35)';
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.transform = 'translateY(0) scale(1)';
        btn.style.boxShadow = 'none';
      });
      return btn;
    }

    function adjustCounter(id, delta, meta){
      const index = state.counters.findIndex(c => c.id === id);
      if (index === -1) return;
      const counter = state.counters[index];
      const nextValue = clampValue(counter.value + delta);
      if (nextValue === counter.value) return;
      state.counters[index] = Object.assign({}, counter, { value: nextValue });
      persistSoon();
      renderCounters();
      const now = Date.now();
      const diff = Math.abs(nextValue - counter.value);
      if (diff > 0){
        if (now - state.lastAwardAt >= XP_COOLDOWN_MS){
          state.lastAwardAt = now;
          const xpAmount = Math.min(10, diff * XP_PER_STEP);
          award('counter-adjust', xpAmount, { counterId: counter.id, name: counter.name, delta: delta });
        }
      }
    }

    function setCounterValue(id, value){
      const index = state.counters.findIndex(c => c.id === id);
      if (index === -1) return;
      const counter = state.counters[index];
      const nextValue = clampValue(value);
      if (nextValue === counter.value) return;
      state.counters[index] = Object.assign({}, counter, { value: nextValue });
      persistSoon();
      renderCounters();
    }

    function updateCounterMeta(id, patch){
      const index = state.counters.findIndex(c => c.id === id);
      if (index === -1) return;
      const counter = state.counters[index];
      const next = Object.assign({}, counter, patch);
      state.counters[index] = {
        id: next.id,
        name: sanitizeName(next.name, counter.name) || counter.name,
        value: clampValue(next.value),
        step: clampStep(next.step)
      };
      persistSoon();
      renderCounters();
    }

    function removeCounter(id){
      const index = state.counters.findIndex(c => c.id === id);
      if (index === -1) return;
      state.counters.splice(index, 1);
      persistSoon();
      renderCounters();
    }

    function renderCounters(){
      listContainer.innerHTML = '';
      if (!state.counters.length){
        listContainer.appendChild(emptyState);
        updateSummary();
        return;
      }
      state.counters.forEach(counter => {
        const card = document.createElement('div');
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.gap = '12px';
        card.style.padding = '18px';
        card.style.borderRadius = '18px';
        card.style.background = 'linear-gradient(145deg, rgba(15,23,42,0.85), rgba(30,64,175,0.55))';
        card.style.border = '1px solid rgba(148,163,184,0.35)';
        card.style.boxShadow = '0 16px 38px rgba(8,47,73,0.35)';

        const cardHeader = document.createElement('div');
        cardHeader.style.display = 'flex';
        cardHeader.style.alignItems = 'center';
        cardHeader.style.gap = '10px';

        const nameField = document.createElement('input');
        nameField.type = 'text';
        nameField.value = counter.name;
        nameField.maxLength = MAX_NAME_LENGTH;
        nameField.style.flex = '1';
        nameField.style.height = '38px';
        nameField.style.borderRadius = '10px';
        nameField.style.border = '1px solid rgba(148,163,184,0.4)';
        nameField.style.background = 'rgba(15,23,42,0.35)';
        nameField.style.color = '#f8fafc';
        nameField.style.padding = '0 12px';
        nameField.addEventListener('change', () => {
          updateCounterMeta(counter.id, { name: nameField.value });
        });

        const deleteBtn = createActionButton('削除');
        deleteBtn.style.background = 'rgba(239,68,68,0.2)';
        deleteBtn.style.borderColor = 'rgba(248,113,113,0.5)';
        deleteBtn.addEventListener('click', () => {
          if (confirm(`${counter.name} を削除しますか？`)){
            removeCounter(counter.id);
          }
        });

        cardHeader.appendChild(nameField);
        cardHeader.appendChild(deleteBtn);

        const valueDisplay = document.createElement('div');
        valueDisplay.style.display = 'flex';
        valueDisplay.style.alignItems = 'baseline';
        valueDisplay.style.justifyContent = 'space-between';
        valueDisplay.style.gap = '12px';

        const valueLabel = document.createElement('div');
        valueLabel.textContent = counter.value;
        valueLabel.style.fontSize = '40px';
        valueLabel.style.fontWeight = '700';
        valueLabel.style.letterSpacing = '0.04em';

        const valueEdit = document.createElement('input');
        valueEdit.type = 'number';
        valueEdit.value = counter.value;
        valueEdit.style.width = '110px';
        valueEdit.style.height = '38px';
        valueEdit.style.borderRadius = '10px';
        valueEdit.style.border = '1px solid rgba(148,163,184,0.4)';
        valueEdit.style.background = 'rgba(15,23,42,0.35)';
        valueEdit.style.color = '#f8fafc';
        valueEdit.style.padding = '0 10px';
        valueEdit.addEventListener('change', () => {
          setCounterValue(counter.id, safeNumber(valueEdit.value, counter.value));
        });

        valueDisplay.appendChild(valueLabel);
        valueDisplay.appendChild(valueEdit);

        const controls = document.createElement('div');
        controls.style.display = 'grid';
        controls.style.gridTemplateColumns = 'repeat(4, minmax(0,1fr))';
        controls.style.gap = '10px';

        const minusBig = createActionButton(`-${counter.step * 5}`);
        const minus = createActionButton(`-${counter.step}`);
        const plus = createActionButton(`+${counter.step}`);
        const plusBig = createActionButton(`+${counter.step * 5}`);

        minusBig.addEventListener('click', () => adjustCounter(counter.id, -counter.step * 5));
        minus.addEventListener('click', () => adjustCounter(counter.id, -counter.step));
        plus.addEventListener('click', () => adjustCounter(counter.id, counter.step));
        plusBig.addEventListener('click', () => adjustCounter(counter.id, counter.step * 5));

        controls.appendChild(minusBig);
        controls.appendChild(minus);
        controls.appendChild(plus);
        controls.appendChild(plusBig);

        const footer = document.createElement('div');
        footer.style.display = 'flex';
        footer.style.alignItems = 'center';
        footer.style.gap = '10px';
        footer.style.flexWrap = 'wrap';

        const stepLabel = document.createElement('label');
        stepLabel.textContent = 'ステップ';
        stepLabel.style.fontSize = '13px';
        stepLabel.style.opacity = '0.85';

        const stepField = document.createElement('input');
        stepField.type = 'number';
        stepField.value = counter.step;
        stepField.min = '1';
        stepField.style.width = '90px';
        stepField.style.height = '34px';
        stepField.style.borderRadius = '10px';
        stepField.style.border = '1px solid rgba(148,163,184,0.4)';
        stepField.style.background = 'rgba(15,23,42,0.35)';
        stepField.style.color = '#f8fafc';
        stepField.style.padding = '0 10px';
        stepField.addEventListener('change', () => {
          updateCounterMeta(counter.id, { step: stepField.value });
        });

        const resetBtn = createActionButton('リセット');
        resetBtn.style.background = 'rgba(14,165,233,0.22)';
        resetBtn.style.borderColor = 'rgba(125,211,252,0.5)';
        resetBtn.addEventListener('click', () => {
          setCounterValue(counter.id, 0);
        });

        footer.appendChild(stepLabel);
        footer.appendChild(stepField);
        footer.appendChild(resetBtn);

        card.appendChild(cardHeader);
        card.appendChild(valueDisplay);
        card.appendChild(controls);
        card.appendChild(footer);

        listContainer.appendChild(card);
      });
      updateSummary();
    }

    formCard.addEventListener('submit', (ev) => {
      ev.preventDefault();
      if (state.counters.length >= MAX_COUNTERS){
        alert(`これ以上は追加できません (最大${MAX_COUNTERS}件)`);
        return;
      }
      const name = sanitizeName(nameInput.value, '新しいカウンター') || `カウンター${state.counters.length + 1}`;
      const value = clampValue(safeNumber(valueInput.value, 0));
      const step = clampStep(stepInput.value);
      state.counters.push({ id: randomId(), name, value, step });
      nameInput.value = '';
      valueInput.value = '';
      stepInput.value = '';
      persistSoon();
      renderCounters();
      award('counter-create', 5, { name });
      setTimeout(() => { nameInput.focus(); }, 0);
    });

    function start(){
      if (isRunning) return;
      isRunning = true;
      renderCounters();
      updateSummary();
      setTimeout(() => { try { nameInput.focus(); } catch {} }, 0);
    }

    function stop(){
      if (!isRunning) return;
      isRunning = false;
      if (persistTimer){
        clearTimeout(persistTimer);
        persistTimer = null;
      }
      writePersistentState(state);
    }

    function destroy(){
      stop();
      try {
        if (root.contains(wrapper)) root.removeChild(wrapper);
      } catch {}
    }

    return {
      start,
      stop,
      destroy,
      getScore(){
        return state.sessionXp;
      }
    };
  }

  window.registerMiniGame({
    id: 'counter_pad',
    name: 'カウンターパッド',
    description: '増減操作だけの多機能カウンター。全て自動保存されます',
    category: 'ユーティリティ',
    version: '0.1.0',
    author: 'mod',
    create
  });
})();

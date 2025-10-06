(function(){
  /** MiniExp: Utility Calculator */
  const OPERATORS = new Set(['+', '-', '×', '÷']);
  const STORAGE_KEY = 'mini_calculator_state_v1';
  const HISTORY_LIMIT = 50;
  const BASE_DIGITS = '0123456789ABCDEFGHIJKLMNOPQRST';
  const PROGRAMMER_BASES = [2, 4, 6, 8, 10, 16, 24, 30];
  const PROGRAMMER_BASE_LABELS = {
    2: '2進',
    4: '4進',
    6: '6進',
    8: '8進',
    10: '10進',
    16: '16進',
    24: '24進',
    30: '30進'
  };

  function loadPersistentState(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { memory: null, history: [] };
      const parsed = JSON.parse(raw);
      const memory = typeof parsed.memory === 'number' && Number.isFinite(parsed.memory) ? parsed.memory : null;
      const history = Array.isArray(parsed.history) ? parsed.history.filter(entry => entry && typeof entry.expr === 'string' && typeof entry.result === 'string').slice(0, HISTORY_LIMIT) : [];
      return { memory, history };
    } catch {
      return { memory: null, history: [] };
    }
  }

  function writePersistentState(payload){
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        memory: (typeof payload.memory === 'number' && Number.isFinite(payload.memory)) ? payload.memory : null,
        history: Array.isArray(payload.history) ? payload.history.slice(0, HISTORY_LIMIT) : []
      }));
    } catch {}
  }

  function create(root, awardXp){
    const persistent = loadPersistentState();
    let memoryValue = (typeof persistent.memory === 'number' && Number.isFinite(persistent.memory)) ? persistent.memory : null;
    let history = Array.isArray(persistent.history) ? persistent.history.slice(0, HISTORY_LIMIT) : [];

    const container = document.createElement('div');
    container.className = 'calculator-mini-root';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.position = 'relative';
    container.style.background = 'radial-gradient(circle at 20% 20%, rgba(59,130,246,0.12), rgba(2,6,23,0.9))';

    const panel = document.createElement('div');
    panel.style.width = 'min(360px, 92%)';
    panel.style.background = 'linear-gradient(150deg,#111827,#0f172a)';
    panel.style.borderRadius = '18px';
    panel.style.boxShadow = '0 22px 48px rgba(15,23,42,0.45)';
    panel.style.border = '1px solid rgba(148,163,184,0.12)';
    panel.style.display = 'flex';
    panel.style.flexDirection = 'column';
    panel.style.overflow = 'hidden';

    const display = document.createElement('div');
    display.style.padding = '24px 20px 16px';
    display.style.display = 'flex';
    display.style.flexDirection = 'column';
    display.style.alignItems = 'flex-end';
    display.style.gap = '6px';
    display.style.background = 'linear-gradient(180deg, rgba(30,41,59,0.2), rgba(15,23,42,0.55))';

    const statusBar = document.createElement('div');
    statusBar.style.alignSelf = 'stretch';
    statusBar.style.display = 'flex';
    statusBar.style.justifyContent = 'space-between';
    statusBar.style.fontSize = '12px';
    statusBar.style.color = 'rgba(148,163,184,0.95)';
    statusBar.style.opacity = '0.9';

    const memoryStatus = document.createElement('span');
    const historyStatus = document.createElement('span');
    statusBar.appendChild(memoryStatus);
    statusBar.appendChild(historyStatus);

    const exprEl = document.createElement('div');
    exprEl.style.fontSize = '16px';
    exprEl.style.color = '#a5b4fc';
    exprEl.style.minHeight = '20px';
    exprEl.style.wordBreak = 'break-all';
    exprEl.style.opacity = '0.9';

    const resultEl = document.createElement('div');
    resultEl.style.fontSize = '36px';
    resultEl.style.lineHeight = '1.2';
    resultEl.style.color = '#f8fafc';
    resultEl.style.fontWeight = '600';
    resultEl.style.wordBreak = 'break-all';

    display.appendChild(statusBar);
    display.appendChild(exprEl);
    display.appendChild(resultEl);

    const modeRow = document.createElement('div');
    modeRow.style.display = 'flex';
    modeRow.style.alignItems = 'center';
    modeRow.style.justifyContent = 'space-between';
    modeRow.style.padding = '12px 20px 4px';
    modeRow.style.gap = '12px';

    const modeToggle = document.createElement('div');
    modeToggle.style.display = 'inline-flex';
    modeToggle.style.gap = '8px';

    const modeButtons = [];
    const modeDefs = [
      { label: '標準', value: 'standard' },
      { label: 'プログラマー', value: 'programmer' }
    ];
    modeDefs.forEach(def => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = def.label;
      btn.style.borderRadius = '999px';
      btn.style.border = '1px solid rgba(148,163,184,0.25)';
      btn.style.padding = '6px 14px';
      btn.style.fontSize = '12px';
      btn.style.letterSpacing = '0.3px';
      btn.style.cursor = 'pointer';
      btn.style.background = 'rgba(15,23,42,0.45)';
      btn.style.color = '#e2e8f0';
      btn.addEventListener('click', () => setMode(def.value));
      modeToggle.appendChild(btn);
      modeButtons.push({ value: def.value, button: btn });
    });

    const modeSummary = document.createElement('div');
    modeSummary.style.fontSize = '12px';
    modeSummary.style.color = 'rgba(148,163,184,0.85)';
    modeSummary.style.letterSpacing = '0.3px';
    modeSummary.style.flex = '0 0 auto';

    modeRow.appendChild(modeToggle);
    modeRow.appendChild(modeSummary);

    const programmerPanel = document.createElement('div');
    programmerPanel.style.display = 'none';
    programmerPanel.style.flexDirection = 'column';
    programmerPanel.style.gap = '12px';
    programmerPanel.style.padding = '0 20px 6px';

    const baseSelector = document.createElement('div');
    baseSelector.style.display = 'flex';
    baseSelector.style.flexWrap = 'wrap';
    baseSelector.style.gap = '8px';

    const baseButtons = [];
    PROGRAMMER_BASES.forEach(base => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = `${PROGRAMMER_BASE_LABELS[base]} (基数${base})`;
      btn.style.padding = '8px 12px';
      btn.style.borderRadius = '10px';
      btn.style.border = '1px solid rgba(96,165,250,0.4)';
      btn.style.background = 'rgba(15,23,42,0.5)';
      btn.style.color = '#cbd5f5';
      btn.style.fontSize = '12px';
      btn.style.cursor = 'pointer';
      btn.addEventListener('click', () => setProgrammerBase(base));
      baseSelector.appendChild(btn);
      baseButtons.push({ base, button: btn });
    });

    const letterPad = document.createElement('div');
    letterPad.style.display = 'grid';
    letterPad.style.gridTemplateColumns = 'repeat(5, minmax(0, 1fr))';
    letterPad.style.gap = '8px';
    letterPad.style.padding = '4px 0 0';

    const letterButtons = [];
    const extraDigits = BASE_DIGITS.slice(10);
    for (let i = 0; i < extraDigits.length; i++) {
      const ch = extraDigits[i];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = ch;
      btn.style.borderRadius = '10px';
      btn.style.border = '1px solid rgba(148,163,184,0.24)';
      btn.style.background = 'linear-gradient(135deg,#1f2937,#111827)';
      btn.style.color = '#f8fafc';
      btn.style.fontSize = '14px';
      btn.style.padding = '10px 0';
      btn.style.cursor = 'pointer';
      btn.style.boxShadow = '0 10px 20px rgba(8,15,30,0.25)';
      btn.style.transition = 'transform 0.12s ease, box-shadow 0.12s ease';
      btn.addEventListener('pointerenter', () => {
        btn.style.transform = 'translateY(-2px)';
        btn.style.boxShadow = '0 16px 30px rgba(8,15,30,0.35)';
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.transform = 'translateY(0)';
        btn.style.boxShadow = '0 10px 20px rgba(8,15,30,0.25)';
      });
      btn.addEventListener('click', () => inputDigit(ch));
      letterPad.appendChild(btn);
      letterButtons.push({ digit: ch, button: btn, value: 10 + i });
    }

    const conversionContainer = document.createElement('div');
    conversionContainer.style.display = 'grid';
    conversionContainer.style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
    conversionContainer.style.gap = '10px';
    conversionContainer.style.padding = '10px 12px';
    conversionContainer.style.background = 'linear-gradient(135deg, rgba(30,41,59,0.4), rgba(15,23,42,0.32))';
    conversionContainer.style.border = '1px solid rgba(96,165,250,0.25)';
    conversionContainer.style.borderRadius = '14px';

    const conversionItems = [];
    PROGRAMMER_BASES.forEach(base => {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.flexDirection = 'column';
      row.style.gap = '4px';
      row.style.padding = '6px';
      row.style.borderRadius = '10px';
      row.style.background = 'rgba(15,23,42,0.45)';

      const label = document.createElement('span');
      label.textContent = `${PROGRAMMER_BASE_LABELS[base]} (基数${base})`;
      label.style.fontSize = '11px';
      label.style.color = '#60a5fa';
      label.style.letterSpacing = '0.3px';

      const value = document.createElement('span');
      value.textContent = '--';
      value.style.fontFamily = '"Fira Code", "Consolas", monospace';
      value.style.fontSize = '15px';
      value.style.color = '#f8fafc';
      value.style.wordBreak = 'break-all';

      row.appendChild(label);
      row.appendChild(value);
      conversionContainer.appendChild(row);
      conversionItems.push({ base, valueEl: value });
    });

    programmerPanel.appendChild(baseSelector);
    programmerPanel.appendChild(letterPad);
    programmerPanel.appendChild(conversionContainer);

    const controlRow = document.createElement('div');
    controlRow.style.display = 'flex';
    controlRow.style.flexWrap = 'wrap';
    controlRow.style.gap = '10px';
    controlRow.style.padding = '14px 20px 4px';
    controlRow.style.justifyContent = 'flex-end';

    const keypad = document.createElement('div');
    keypad.style.display = 'grid';
    keypad.style.gridTemplateColumns = 'repeat(4, minmax(0, 1fr))';
    keypad.style.gap = '12px';
    keypad.style.padding = '16px 20px 24px';

    const standardButtonDefs = [
      [
        { label: 'AC', variant: 'ghost', handler: clearAll },
        { label: '⌫', variant: 'ghost', handler: backspace },
        { label: '%', variant: 'ghost', handler: applyPercent },
        { label: '÷', variant: 'operator', handler: () => inputOperator('÷') }
      ],
      [
        { label: '7', variant: 'digit', handler: () => inputDigit('7') },
        { label: '8', variant: 'digit', handler: () => inputDigit('8') },
        { label: '9', variant: 'digit', handler: () => inputDigit('9') },
        { label: '×', variant: 'operator', handler: () => inputOperator('×') }
      ],
      [
        { label: '4', variant: 'digit', handler: () => inputDigit('4') },
        { label: '5', variant: 'digit', handler: () => inputDigit('5') },
        { label: '6', variant: 'digit', handler: () => inputDigit('6') },
        { label: '-', variant: 'operator', handler: () => inputOperator('-') }
      ],
      [
        { label: '1', variant: 'digit', handler: () => inputDigit('1') },
        { label: '2', variant: 'digit', handler: () => inputDigit('2') },
        { label: '3', variant: 'digit', handler: () => inputDigit('3') },
        { label: '+', variant: 'operator', handler: () => inputOperator('+') }
      ],
      [
        { label: '0', variant: 'digit', gridColumn: 'span 2', handler: () => inputDigit('0') },
        { label: '.', variant: 'ghost', handler: inputDecimal },
        { label: '=', variant: 'equals', handler: evaluateExpression }
      ]
    ];

    const digitButtons = new Map();

    function renderKeypad(){
      keypad.innerHTML = '';
      digitButtons.clear();
      standardButtonDefs.forEach(row => {
        row.forEach(def => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.textContent = def.label;
          btn.style.border = '1px solid rgba(148,163,184,0.15)';
          btn.style.borderRadius = '12px';
          btn.style.background = variantBackground(def.variant);
          btn.style.color = variantColor(def.variant);
          btn.style.fontSize = '18px';
          btn.style.padding = '16px 0';
          btn.style.fontWeight = '500';
          btn.style.cursor = 'pointer';
          btn.style.boxShadow = '0 10px 20px rgba(8,15,30,0.25)';
          btn.style.transition = 'transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease';
          btn.addEventListener('pointerenter', () => {
            btn.style.transform = 'translateY(-2px)';
            btn.style.boxShadow = '0 16px 30px rgba(8,15,30,0.35)';
          });
          btn.addEventListener('pointerleave', () => {
            btn.style.transform = 'translateY(0)';
            btn.style.boxShadow = '0 10px 20px rgba(8,15,30,0.25)';
          });
          btn.addEventListener('click', () => {
            def.handler();
          });
          if (def.gridColumn) {
            btn.style.gridColumn = def.gridColumn;
          }
          if (/^[0-9]$/.test(def.label)) {
            digitButtons.set(def.label, btn);
          }
          keypad.appendChild(btn);
        });
      });
      updateDigitControls();
    }

    panel.appendChild(display);
    panel.appendChild(modeRow);
    panel.appendChild(programmerPanel);
    panel.appendChild(controlRow);
    panel.appendChild(keypad);
    renderKeypad();

    const historySection = document.createElement('div');
    historySection.style.padding = '12px 20px 20px';
    historySection.style.display = 'flex';
    historySection.style.flexDirection = 'column';
    historySection.style.gap = '10px';
    historySection.style.background = 'linear-gradient(180deg, rgba(15,23,42,0.35), rgba(2,6,23,0.05))';

    const historyHeader = document.createElement('div');
    historyHeader.style.display = 'flex';
    historyHeader.style.justifyContent = 'space-between';
    historyHeader.style.alignItems = 'center';
    const historyTitle = document.createElement('span');
    historyTitle.textContent = '履歴';
    historyTitle.style.color = '#cbd5f5';
    historyTitle.style.fontSize = '14px';
    historyTitle.style.fontWeight = '500';
    const historyClearBtn = document.createElement('button');
    historyClearBtn.type = 'button';
    historyClearBtn.textContent = 'クリア';
    historyClearBtn.style.fontSize = '12px';
    historyClearBtn.style.padding = '4px 10px';
    historyClearBtn.style.borderRadius = '999px';
    historyClearBtn.style.border = '1px solid rgba(148,163,184,0.2)';
    historyClearBtn.style.background = 'rgba(30,41,59,0.35)';
    historyClearBtn.style.color = '#e2e8f0';
    historyClearBtn.style.cursor = 'pointer';
    historyClearBtn.addEventListener('click', () => {
      if (!history.length) return;
      history = [];
      renderHistory();
      persistState();
      updateStatusBar();
    });
    historyHeader.appendChild(historyTitle);
    historyHeader.appendChild(historyClearBtn);

    const historyList = document.createElement('div');
    historyList.style.display = 'flex';
    historyList.style.flexDirection = 'column';
    historyList.style.gap = '6px';
    historyList.style.maxHeight = '140px';
    historyList.style.overflowY = 'auto';
    historyList.style.paddingRight = '4px';

    historySection.appendChild(historyHeader);
    historySection.appendChild(historyList);

    container.appendChild(panel);
    panel.appendChild(historySection);
    root.appendChild(container);

    let tokens = [];
    let current = '';
    let lastExpression = '';
    let lastResult = 0;
    let displayMode = 'input'; // 'input' | 'result'
    let totalCalculations = 0;
    let active = false;
    let mode = 'standard';
    let programmerBase = 16;

    updateModeUI();
    updateDigitControls();
    updateProgrammerPanel();

    function isProgrammerMode(){
      return mode === 'programmer';
    }

    function setMode(nextMode, opts = {}){
      if (nextMode !== 'standard' && nextMode !== 'programmer') return;
      if (mode === nextMode) {
        updateModeUI();
        updateStatusBar();
        return;
      }
      mode = nextMode;
      if (!opts.preserveState) {
        clearAll();
      }
      updateModeUI();
      updateDigitControls();
      updateProgrammerPanel();
      updateStatusBar();
    }

    function setProgrammerBase(base, opts = {}){
      const next = Number(base);
      if (!PROGRAMMER_BASES.includes(next)) return;
      if (programmerBase === next) {
        updateBaseButtons();
        updateStatusBar();
        return;
      }
      programmerBase = next;
      if (!opts.preserveState && isProgrammerMode()) {
        clearAll();
      }
      updateBaseButtons();
      updateModeUI();
      updateDigitControls();
      updateProgrammerPanel();
      updateStatusBar();
    }

    function updateModeUI(){
      modeButtons.forEach(({ value, button }) => {
        const activeMode = value === mode;
        button.style.background = activeMode ? 'linear-gradient(135deg, rgba(59,130,246,0.35), rgba(37,99,235,0.65))' : 'rgba(15,23,42,0.45)';
        button.style.borderColor = activeMode ? 'rgba(96,165,250,0.7)' : 'rgba(148,163,184,0.25)';
        button.style.color = activeMode ? '#f8fafc' : '#e2e8f0';
      });
      programmerPanel.style.display = isProgrammerMode() ? 'flex' : 'none';
      modeSummary.textContent = isProgrammerMode()
        ? `プログラマーモード / 基数${programmerBase}`
        : '標準モード (10進)';
      updateBaseButtons();
    }

    function updateBaseButtons(){
      baseButtons.forEach(({ base, button }) => {
        const activeBase = base === programmerBase;
        button.style.background = activeBase
          ? 'linear-gradient(135deg, rgba(96,165,250,0.35), rgba(14,116,144,0.55))'
          : 'rgba(15,23,42,0.5)';
        button.style.borderColor = activeBase ? 'rgba(96,165,250,0.7)' : 'rgba(96,165,250,0.4)';
        button.style.color = activeBase ? '#f8fafc' : '#cbd5f5';
      });
    }

    function setButtonEnabled(btn, enabled){
      btn.disabled = !enabled;
      btn.style.opacity = enabled ? '1' : '0.45';
      btn.style.pointerEvents = enabled ? 'auto' : 'none';
    }

    function updateDigitControls(){
      digitButtons.forEach((btn) => {
        setButtonEnabled(btn, true);
      });
      letterButtons.forEach(item => {
        setButtonEnabled(item.button, false);
      });
      if (!isProgrammerMode()) return;
      digitButtons.forEach((btn, digit) => {
        const allowed = isDigitAllowedInBase(digit, programmerBase);
        setButtonEnabled(btn, allowed);
      });
      letterButtons.forEach(item => {
        const allowed = item.value < programmerBase;
        setButtonEnabled(item.button, allowed);
      });
    }

    function isDigitAllowedInBase(char, base){
      if (!char) return false;
      const upper = char.toString().toUpperCase();
      const index = BASE_DIGITS.indexOf(upper);
      return index >= 0 && index < base;
    }

    function parseProgrammerNumber(str, base){
      if (typeof str !== 'string') return null;
      let text = str.trim().toUpperCase();
      if (!text) return null;
      let sign = 1;
      if (text.startsWith('+')) {
        text = text.slice(1);
      } else if (text.startsWith('-')) {
        sign = -1;
        text = text.slice(1);
      }
      if (!text) return null;
      const parts = text.split('.');
      if (parts.length > 2) return null;
      const intPart = parts[0];
      const fracPart = parts[1] || '';
      const validPattern = new RegExp(`^[${BASE_DIGITS.slice(0, base)}]*$`);
      if (!validPattern.test(intPart) || !validPattern.test(fracPart)) return null;
      let value = 0;
      for (let i = 0; i < intPart.length; i++) {
        const ch = intPart[i];
        if (!ch) continue;
        const digit = BASE_DIGITS.indexOf(ch);
        if (digit < 0 || digit >= base) return null;
        value = value * base + digit;
      }
      let fraction = 0;
      let factor = 1 / base;
      for (let i = 0; i < fracPart.length; i++) {
        const ch = fracPart[i];
        const digit = BASE_DIGITS.indexOf(ch);
        if (digit < 0 || digit >= base) return null;
        fraction += digit * factor;
        factor /= base;
      }
      const result = sign * (value + fraction);
      return Number.isFinite(result) ? result : null;
    }

    function normalizeProgrammerNumber(str){
      if (!str) return null;
      if (str === '-' || str === '+') return null;
      const parsed = parseProgrammerNumber(str, programmerBase);
      if (parsed === null) return null;
      return convertDecimalToBase(parsed, programmerBase);
    }

    function normalizeInput(str){
      return isProgrammerMode() ? normalizeProgrammerNumber(str) : normalizeNumber(str);
    }

    function convertDecimalToBase(num, base, precision = 12){
      if (!Number.isFinite(num)) return 'NaN';
      if (base < 2) return String(num);
      const negative = num < 0;
      let value = Math.abs(num);
      const intPart = Math.floor(value);
      let intStr = '';
      let temp = intPart;
      if (!Number.isFinite(temp)) return 'NaN';
      if (temp === 0) {
        intStr = '0';
      } else {
        while (temp > 0) {
          const digit = temp % base;
          intStr = BASE_DIGITS[digit] + intStr;
          temp = Math.floor(temp / base);
        }
      }
      let fracStr = '';
      let fraction = value - intPart;
      if (fraction > 0) {
        const maxDigits = Math.max(1, Math.min(precision, 18));
        for (let i = 0; i < maxDigits && fraction > 1e-12; i++) {
          fraction *= base;
          let digit = Math.floor(fraction + 1e-12);
          if (digit >= base) {
            digit = base - 1;
            fraction = 0;
          }
          fracStr += BASE_DIGITS[digit];
          fraction -= digit;
        }
        fracStr = fracStr.replace(/0+$/, '');
      }
      const combined = fracStr ? `${intStr}.${fracStr}` : intStr;
      return negative && combined !== '0' ? `-${combined}` : combined;
    }

    function getProgrammerDecimalValue(){
      if (!isProgrammerMode()) return null;
      if (displayMode === 'result') {
        const source = current || convertDecimalToBase(lastResult || 0, programmerBase);
        return parseProgrammerNumber(source, programmerBase);
      }
      if (current && current !== '-' && current !== '+') {
        return parseProgrammerNumber(current, programmerBase);
      }
      const idx = findLastNumberIndex(tokens);
      if (idx >= 0) {
        return parseProgrammerNumber(tokens[idx], programmerBase);
      }
      return Number.isFinite(lastResult) ? lastResult : 0;
    }

    function updateProgrammerPanel(){
      if (!isProgrammerMode()) {
        conversionItems.forEach(item => { item.valueEl.textContent = '--'; });
        return;
      }
      const decimalValue = getProgrammerDecimalValue();
      if (decimalValue === null || !Number.isFinite(decimalValue)) {
        conversionItems.forEach(item => { item.valueEl.textContent = '--'; });
        return;
      }
      conversionItems.forEach(item => {
        item.valueEl.textContent = convertDecimalToBase(decimalValue, item.base);
      });
    }

    function variantBackground(variant){
      if (variant === 'operator') return 'linear-gradient(135deg,#1d4ed8,#1e3a8a)';
      if (variant === 'equals') return 'linear-gradient(135deg,#fb923c,#f97316)';
      if (variant === 'digit') return 'linear-gradient(135deg,#1f2937,#111827)';
      return 'linear-gradient(135deg,#202e44,#141b2f)';
    }
    function variantColor(variant){
      if (variant === 'equals') return '#0f172a';
      return '#e2e8f0';
    }

    function updateDisplay(){
      if (displayMode === 'result') {
        exprEl.textContent = lastExpression ? `${lastExpression} =` : '0 =';
        if (isProgrammerMode()) {
          const resultText = current || convertDecimalToBase(lastResult || 0, programmerBase);
          resultEl.textContent = resultText;
        } else {
          resultEl.textContent = formatNumberString(current || String(lastResult || 0));
        }
        updateProgrammerPanel();
        return;
      }
      const combined = tokens.slice();
      if (current) combined.push(current);
      const exprText = tokensToDisplay(combined);
      exprEl.textContent = exprText || '0';
      if (current) {
        resultEl.textContent = current;
      } else {
        const lastNumberIndex = findLastNumberIndex(tokens);
        if (lastNumberIndex >= 0) {
          resultEl.textContent = tokens[lastNumberIndex];
        } else {
          resultEl.textContent = isProgrammerMode()
            ? convertDecimalToBase(lastResult || 0, programmerBase)
            : formatNumberString(String(lastResult || 0));
        }
      }
      updateProgrammerPanel();
    }

    function tokensToDisplay(list){
      let out = '';
      for (const token of list){
        if (token === '(') {
          out += (out.endsWith(' ') || out === '' ? '' : ' ') + '(';
        } else if (token === ')') {
          out = out.trimEnd();
          out += ') ';
        } else if (OPERATORS.has(token)) {
          out = out.trimEnd();
          out += ` ${token} `;
        } else {
          out += token;
        }
      }
      return out.trim();
    }

    function findLastNumberIndex(list){
      for (let i = list.length - 1; i >= 0; i--) {
        const t = list[i];
        if (!OPERATORS.has(t) && t !== '(' && t !== ')') return i;
      }
      return -1;
    }

    function inputDigit(d){
      if (!d) return;
      if (displayMode === 'result') {
        tokens = [];
        current = '';
        displayMode = 'input';
        lastExpression = '';
      }
      if (isProgrammerMode()) {
        const digit = d.toString().toUpperCase();
        if (!isDigitAllowedInBase(digit, programmerBase)) return;
        if (current === '0' && digit !== '.') current = '';
        if (current === '-0') current = '-';
        if (current.length >= 24) return;
        current += digit;
        awardDigitXp();
        updateDisplay();
        return;
      }
      if (current === '0' && d !== '.') current = '';
      if (current === '-0') current = '-';
      if (current.length >= 18) return;
      current += d;
      awardDigitXp();
      updateDisplay();
    }

    function inputDecimal(){
      if (displayMode === 'result') {
        tokens = [];
        current = '';
        displayMode = 'input';
        lastExpression = '';
      }
      if (!current) {
        current = '0.';
      } else if (!current.includes('.')) {
        current += '.';
      }
      updateDisplay();
    }

    function inputOperator(op){
      if (displayMode === 'result') {
        const seed = current || (isProgrammerMode()
          ? convertDecimalToBase(lastResult || 0, programmerBase)
          : formatNumber(lastResult || 0));
        tokens = seed ? [seed] : [];
        current = '';
        displayMode = 'input';
        lastExpression = '';
      }
      if (current && current !== '-' && current !== '+') {
        const norm = normalizeInput(current);
        if (norm !== null) tokens.push(norm);
        current = '';
      }
      if (!tokens.length) {
        if (op === '-') {
          current = current === '-' ? '' : '-';
          updateDisplay();
        }
        return;
      }
      const last = tokens[tokens.length - 1];
      if (OPERATORS.has(last)) {
        tokens[tokens.length - 1] = op;
      } else {
        tokens.push(op);
      }
      updateDisplay();
    }

    function handleParenthesis(mark){
      if (displayMode === 'result') {
        tokens = [];
        current = '';
        displayMode = 'input';
        lastExpression = '';
      }
      if (mark === '(') {
        const last = tokens[tokens.length - 1];
        if (!tokens.length || OPERATORS.has(last) || last === '(') {
          tokens.push('(');
          updateDisplay();
        }
        return;
      }
      if (current && current !== '-' && current !== '+') {
        const norm = normalizeInput(current);
        if (norm !== null) tokens.push(norm);
        current = '';
      }
      const balance = parenBalance(tokens);
      const last = tokens[tokens.length - 1];
      if (balance > 0 && last && last !== '(' && !OPERATORS.has(last)) {
        tokens.push(')');
        updateDisplay();
      }
    }

    function parenBalance(list){
      let count = 0;
      for (const t of list) {
        if (t === '(') count++;
        else if (t === ')') count--;
      }
      return count;
    }

    function toggleSign(){
      if (displayMode === 'result') {
        if (!current) {
          current = isProgrammerMode()
            ? convertDecimalToBase(lastResult || 0, programmerBase)
            : formatNumber(lastResult || 0);
        }
        current = toggleStringSign(current);
        if (isProgrammerMode()) {
          const parsed = parseProgrammerNumber(current, programmerBase);
          lastResult = Number.isFinite(parsed) ? parsed : 0;
        } else {
          lastResult = Number(current);
        }
        updateDisplay();
        return;
      }
      if (current) {
        current = toggleStringSign(current);
        updateDisplay();
        return;
      }
      const idx = findLastNumberIndex(tokens);
      if (idx >= 0) {
        tokens[idx] = toggleStringSign(tokens[idx]);
        updateDisplay();
      } else {
        current = '-';
        updateDisplay();
      }
    }

    function toggleStringSign(str){
      if (!str) return str;
      if (str === '-') return '';
      if (str.startsWith('-')) return str.slice(1);
      return '-' + str;
    }

    function applyPercent(){
      if (displayMode === 'result') {
        if (isProgrammerMode()) {
          const source = current || convertDecimalToBase(lastResult || 0, programmerBase);
          const parsed = parseProgrammerNumber(source, programmerBase);
          if (parsed === null) return;
          const res = parsed / 100;
          current = convertDecimalToBase(res, programmerBase);
          lastResult = res;
          updateDisplay();
          return;
        }
        const num = Number(current || lastResult || 0);
        if (!Number.isFinite(num)) return;
        const res = num / 100;
        current = formatNumber(res);
        lastResult = res;
        updateDisplay();
        return;
      }
      if (current && current !== '-' && current !== '+') {
        if (isProgrammerMode()) {
          const parsed = parseProgrammerNumber(current, programmerBase);
          if (parsed === null) return;
          current = convertDecimalToBase(parsed / 100, programmerBase);
          updateDisplay();
          return;
        }
        const num = Number(current);
        if (!Number.isFinite(num)) return;
        current = formatNumber(num / 100);
        updateDisplay();
        return;
      }
      const idx = findLastNumberIndex(tokens);
      if (idx >= 0) {
        if (isProgrammerMode()) {
          const parsed = parseProgrammerNumber(tokens[idx], programmerBase);
          if (parsed === null) return;
          tokens[idx] = convertDecimalToBase(parsed / 100, programmerBase);
          updateDisplay();
          return;
        }
        const num = Number(tokens[idx]);
        if (!Number.isFinite(num)) return;
        tokens[idx] = formatNumber(num / 100);
        updateDisplay();
      }
    }

    function backspace(){
      if (displayMode === 'result') {
        displayMode = 'input';
        current = current ? current.slice(0, -1) : '';
        if (!current) current = '';
        updateDisplay();
        return;
      }
      if (current) {
        current = current.slice(0, -1);
        updateDisplay();
        return;
      }
      if (!tokens.length) return;
      const last = tokens.pop();
      if (last && !OPERATORS.has(last) && last !== '(' && last !== ')') {
        current = last.slice(0, -1);
      }
      updateDisplay();
    }

    function clearAll(){
      tokens = [];
      current = '';
      lastExpression = '';
      lastResult = 0;
      displayMode = 'input';
      updateDisplay();
    }

    function normalizeNumber(str){
      if (!str) return null;
      if (str === '-' || str === '+') return null;
      const num = Number(str);
      if (!Number.isFinite(num)) return null;
      return formatNumber(num);
    }

    function formatNumber(num){
      if (!Number.isFinite(num)) return 'エラー';
      if (Math.abs(num) >= 1e12 || (Math.abs(num) > 0 && Math.abs(num) < 1e-6)) {
        return num.toExponential(6).replace(/e\+?/, 'e');
      }
      let str = num.toString();
      if (str.includes('.')) {
        str = str.replace(/\.0+$/,'').replace(/(\.\d*?)0+$/,'$1');
      }
      if (str.length > 16) {
        str = num.toPrecision(12).replace(/\.0+$/,'').replace(/(\.\d*?)0+$/,'$1').replace(/e\+?/,'e');
      }
      return str;
    }

    function formatNumberString(str){
      if (!str) return '0';
      const num = Number(str);
      if (!Number.isFinite(num)) return str;
      return formatNumber(num);
    }

    function buildEvaluationSequence(){
      const seq = tokens.slice();
      if (displayMode !== 'result' && current && current !== '-' && current !== '+') {
        const norm = normalizeInput(current);
        if (norm !== null) seq.push(norm);
      }
      return seq;
    }

    function sanitizeExpression(str){
      return /^[0-9+\-*/().eE ]+$/.test(str);
    }

    function evaluateExpression(){
      const seq = buildEvaluationSequence();
      if (!seq.length) return;
      if (parenBalance(seq) !== 0) return;
      const exprDisplay = tokensToDisplay(seq);
      if (isProgrammerMode()) {
        const exprEval = seq.map(token => {
          if (token === '×') return '*';
          if (token === '÷') return '/';
          if (OPERATORS.has(token) || token === '(' || token === ')') return token;
          const parsed = parseProgrammerNumber(token, programmerBase);
          if (parsed === null) throw new Error('INVALID_TOKEN');
          return '(' + parsed + ')';
        }).join('');
        if (!sanitizeExpression(exprEval)) return;
        let value;
        try {
          value = Function('"use strict"; return (' + exprEval + ');')();
        } catch (e) {
          showEvaluationError();
          return;
        }
        if (typeof value !== 'number' || !Number.isFinite(value)) {
          showEvaluationError();
          return;
        }
        lastResult = value;
        lastExpression = exprDisplay;
        current = convertDecimalToBase(value, programmerBase);
        displayMode = 'result';
        tokens = [];
        totalCalculations += 1;
        awardEqualsXp();
        appendHistoryEntry(exprDisplay, current, { mode: 'programmer', base: programmerBase, decimal: value });
        updateDisplay();
        return;
      }
      const exprEval = seq.map(token => token === '×' ? '*' : token === '÷' ? '/' : token).join('');
      if (!sanitizeExpression(exprEval)) return;
      let value;
      try {
        value = Function('"use strict"; return (' + exprEval + ');')();
      } catch (e) {
        showEvaluationError();
        return;
      }
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        showEvaluationError();
        return;
      }
      lastResult = value;
      lastExpression = exprDisplay;
      current = formatNumber(value);
      displayMode = 'result';
      tokens = [];
      totalCalculations += 1;
      awardEqualsXp();
      appendHistoryEntry(exprDisplay, current, { mode: 'standard', base: 10, decimal: value });
      updateDisplay();
    }

    function showEvaluationError(){
      lastExpression = '';
      lastResult = 0;
      current = 'エラー';
      displayMode = 'result';
      tokens = [];
      updateDisplay();
    }

    function getActiveNumber(){
      if (isProgrammerMode()) {
        if (displayMode === 'result') {
          const source = current || convertDecimalToBase(lastResult || 0, programmerBase);
          const parsed = parseProgrammerNumber(source, programmerBase);
          return Number.isFinite(parsed) ? parsed : null;
        }
        if (current && current !== '-' && current !== '+') {
          const parsed = parseProgrammerNumber(current, programmerBase);
          return Number.isFinite(parsed) ? parsed : null;
        }
        const idx = findLastNumberIndex(tokens);
        if (idx >= 0) {
          const parsed = parseProgrammerNumber(tokens[idx], programmerBase);
          return Number.isFinite(parsed) ? parsed : null;
        }
        return Number.isFinite(lastResult) ? lastResult : null;
      }
      if (displayMode === 'result') {
        const num = Number(current || lastResult || 0);
        return Number.isFinite(num) ? num : null;
      }
      if (current && current !== '-' && current !== '+') {
        const num = Number(current);
        return Number.isFinite(num) ? num : null;
      }
      const idx = findLastNumberIndex(tokens);
      if (idx >= 0) {
        const num = Number(tokens[idx]);
        return Number.isFinite(num) ? num : null;
      }
      const fallback = Number(lastResult || 0);
      return Number.isFinite(fallback) ? fallback : null;
    }

    function clearMemory(){
      memoryValue = null;
      persistState();
      updateStatusBar();
    }

    function memoryAdd(){
      const num = getActiveNumber();
      if (num === null) return;
      memoryValue = (memoryValue ?? 0) + num;
      persistState();
      updateStatusBar();
    }

    function memorySubtract(){
      const num = getActiveNumber();
      if (num === null) return;
      memoryValue = (memoryValue ?? 0) - num;
      persistState();
      updateStatusBar();
    }

    function memoryRecall(){
      if (memoryValue === null) return;
      const formatted = isProgrammerMode()
        ? convertDecimalToBase(memoryValue, programmerBase)
        : formatNumber(memoryValue);
      tokens = [];
      current = formatted;
      displayMode = 'input';
      updateDisplay();
    }

    function persistState(){
      writePersistentState({ memory: memoryValue, history });
    }

    function appendHistoryEntry(expr, resultStr, meta){
      const item = { expr, result: resultStr, ts: Date.now() };
      if (meta && typeof meta === 'object') {
        Object.assign(item, meta);
      }
      history.unshift(item);
      if (history.length > HISTORY_LIMIT) history.length = HISTORY_LIMIT;
      persistState();
      renderHistory();
      updateStatusBar();
    }

    function renderHistory(){
      historyList.innerHTML = '';
      if (!history.length) {
        const empty = document.createElement('div');
        empty.style.fontSize = '12px';
        empty.style.color = 'rgba(148,163,184,0.65)';
        empty.textContent = '履歴はありません。';
        historyList.appendChild(empty);
        return;
      }
      history.forEach(entry => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.style.display = 'flex';
        btn.style.justifyContent = 'space-between';
        btn.style.gap = '12px';
        btn.style.padding = '8px 10px';
        btn.style.border = '1px solid rgba(148,163,184,0.15)';
        btn.style.borderRadius = '10px';
        btn.style.background = 'rgba(15,23,42,0.35)';
        btn.style.color = '#e2e8f0';
        btn.style.cursor = 'pointer';
        btn.style.fontSize = '12px';
        btn.addEventListener('click', () => {
          loadHistoryEntry(entry);
        });
        const exprSpan = document.createElement('span');
        exprSpan.textContent = entry.expr;
        exprSpan.style.flex = '1';
        exprSpan.style.textAlign = 'left';
        const resultSpan = document.createElement('span');
        const baseInfo = entry.mode === 'programmer' && entry.base ? ` (基数${entry.base})` : '';
        resultSpan.textContent = entry.result + baseInfo;
        resultSpan.style.color = '#94a3b8';
        resultSpan.style.whiteSpace = 'nowrap';
        btn.appendChild(exprSpan);
        btn.appendChild(resultSpan);
        historyList.appendChild(btn);
      });
    }

    function loadHistoryEntry(entry){
      if (!entry) return;
      if (entry.mode === 'programmer') {
        if (mode !== 'programmer') setMode('programmer', { preserveState: true });
        const base = PROGRAMMER_BASES.includes(entry.base) ? entry.base : programmerBase;
        setProgrammerBase(base, { preserveState: true });
        const decimal = typeof entry.decimal === 'number' && Number.isFinite(entry.decimal)
          ? entry.decimal
          : parseProgrammerNumber(entry.result, base);
        lastResult = Number.isFinite(decimal) ? decimal : 0;
      } else {
        if (mode !== 'standard') setMode('standard', { preserveState: true });
        const decimal = typeof entry.decimal === 'number' && Number.isFinite(entry.decimal)
          ? entry.decimal
          : Number(entry.result);
        lastResult = Number.isFinite(decimal) ? decimal : 0;
      }
      lastExpression = entry.expr;
      tokens = [];
      current = entry.result;
      displayMode = 'result';
      updateDisplay();
    }

    function updateStatusBar(){
      if (memoryValue === null) {
        memoryStatus.textContent = 'M: --';
      } else if (isProgrammerMode()) {
        memoryStatus.textContent = `M: ${convertDecimalToBase(memoryValue, programmerBase)} (基数${programmerBase})`;
      } else {
        memoryStatus.textContent = `M: ${formatNumber(memoryValue)}`;
      }
      historyStatus.textContent = isProgrammerMode()
        ? `履歴: ${history.length} / 基数${programmerBase}`
        : `履歴: ${history.length}`;
    }

    function awardDigitXp(){
      try { awardXp && awardXp(1, { type: 'digit' }); } catch {}
    }
    function awardEqualsXp(){
      try { awardXp && awardXp(5, { type: 'equals' }); } catch {}
    }

    function onKeyDown(e){
      if (!active) return;
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) return;
      const key = e.key;
      if (/^[0-9]$/.test(key)) {
        if (isProgrammerMode() && !isDigitAllowedInBase(key, programmerBase)) {
          e.preventDefault();
          return;
        }
        e.preventDefault();
        inputDigit(key);
        return;
      }
      if (isProgrammerMode()) {
        const upper = key.toUpperCase();
        if (/^[A-Z]$/.test(upper) && isDigitAllowedInBase(upper, programmerBase)) {
          e.preventDefault();
          inputDigit(upper);
          return;
        }
      }
      if (key === '.' || key === ',') {
        e.preventDefault();
        inputDecimal();
        return;
      }
      if (key === '+' || key === '-' || key === '*' || key === '/') {
        e.preventDefault();
        inputOperator(key === '*' ? '×' : key === '/' ? '÷' : key);
        return;
      }
      if (key === 'Enter' || key === '=') {
        e.preventDefault();
        evaluateExpression();
        return;
      }
      if (key === 'Backspace') {
        e.preventDefault();
        backspace();
        return;
      }
      if (key === 'Escape') {
        e.preventDefault();
        clearAll();
        return;
      }
      if (key === '(' || key === ')') {
        e.preventDefault();
        handleParenthesis(key);
        return;
      }
      if (key === '%') {
        e.preventDefault();
        applyPercent();
        return;
      }
    }

    function start(){
      if (active) return;
      active = true;
      window.addEventListener('keydown', onKeyDown, { passive: false });
      updateDisplay();
    }
    function stop(){
      if (!active) return;
      active = false;
      window.removeEventListener('keydown', onKeyDown);
    }
    function destroy(){
      stop();
      try { root && root.contains(container) && root.removeChild(container); } catch {}
    }
    function getScore(){
      return totalCalculations;
    }

    const controlButtons = [
      { label: '+/-', handler: toggleSign },
      { label: '(', handler: () => handleParenthesis('(') },
      { label: ')', handler: () => handleParenthesis(')') },
      { label: 'M+', handler: memoryAdd },
      { label: 'M-', handler: memorySubtract },
      { label: 'MR', handler: memoryRecall },
      { label: 'MC', handler: clearMemory }
    ];

    controlButtons.forEach(cfg => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = cfg.label;
      btn.style.border = '1px solid rgba(148,163,184,0.2)';
      btn.style.borderRadius = '10px';
      btn.style.padding = '8px 12px';
      btn.style.background = 'linear-gradient(135deg,#202e44,#141b2f)';
      btn.style.color = '#e2e8f0';
      btn.style.fontSize = '13px';
      btn.style.cursor = 'pointer';
      btn.style.transition = 'transform 0.12s ease, box-shadow 0.12s ease';
      btn.addEventListener('pointerenter', () => {
        btn.style.transform = 'translateY(-1px)';
        btn.style.boxShadow = '0 10px 20px rgba(8,15,30,0.25)';
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.transform = 'translateY(0)';
        btn.style.boxShadow = 'none';
      });
      btn.addEventListener('click', cfg.handler);
      controlRow.appendChild(btn);
    });

    updateStatusBar();
    renderHistory();
    updateDisplay();

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({
    id: 'calculator',
    name: '電卓', nameKey: 'selection.miniexp.games.calculator.name',
    description: '数字入力で+1 / 「=」で+5EXPのユーティリティ電卓', descriptionKey: 'selection.miniexp.games.calculator.description', categoryIds: ['utility'],
    category: 'ユーティリティ',
    create
  });
})();

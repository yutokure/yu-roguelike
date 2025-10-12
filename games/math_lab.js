(function(){
  /** MiniExp: Advanced Mathematics Lab */
  const MATHJS_PATH = 'libs/math.js';
  const MATHJAX_PATH = 'libs/MathJax-4.0.0/tex-mml-chtml.js';
  let mathLoader = null;
  let mathJaxLoader = null;
  let mathJaxInstance = null;
  
  // I18n関連の関数群をシンプルに書き換える
  function getI18nInstance() {
    return (typeof window !== 'undefined' && window.I18n) ? window.I18n : null;
  }

  function translateText(key, fallback, params) {
    const i18n = getI18nInstance();
    if (key && i18n && typeof i18n.t === 'function') {
      try {
        const translated = i18n.t(key, params);
        if (typeof translated === 'string' && translated !== key) {
          return translated;
        }
      } catch (error) {
        console.warn('[math_lab:i18n] Translation failed for key:', key, error);
      }
    }
    
    if (typeof fallback === 'function') {
      try {
        const result = fallback();
        return result != null ? String(result) : '';
      } catch (error) {
        console.warn('[math_lab:i18n] Fallback evaluation failed:', error);
        return '';
      }
    }
    return fallback != null ? String(fallback) : '';
  }

  function gameText(subKey, fallback, params){
    const i18n = getI18nInstance();
    if (subKey && i18n && typeof i18n.t === 'function') {
      const candidates = [
        `games.math_lab.${subKey}`,
        `games.mathLab.${subKey}`,
        `selection.miniexp.games.math_lab.${subKey}`,
        `miniexp.games.math_lab.${subKey}`,
        `mathLab.${subKey}`
      ];
      for (const candidate of candidates) {
        try {
          // I18nライブラリにキーが存在するかどうかを先に確認する
          if (i18n.exists(candidate)) {
            const translated = i18n.t(candidate, params);
            // 翻訳結果がキー自身と異なることを確認（翻訳が存在することの保証）
            if (typeof translated === 'string' && translated !== candidate) {
              return translated;
            }
          }
        } catch {}
      }
    }
    // どの候補キーでも翻訳が見つからなかった場合にのみ、フォールバックを評価する
    return translateText(null, fallback, params); // 第1引数を null にして、キーによる再翻訳をスキップ
  }

  const uiText = (key, fallback, params) => gameText(`ui.${key}`, fallback, params);
  const statusText = (key, fallback, params) => gameText(`status.${key}`, fallback, params);
  const graphText = (key, fallback, params) => gameText(`graph.${key}`, fallback, params);
  const keypadText = (key, fallback, params) => gameText(`keypad.${key}`, fallback, params);
  const unitText = (key, fallback, params) => gameText(`units.${key}`, fallback, params);
  const resultText = (key, fallback, params) => gameText(`results.${key}`, fallback, params);
  const placeholderText = (key, fallback, params) => gameText(`placeholders.${key}`, fallback, params);
  const errorText = (key, fallback, params) => gameText(`errors.${key}`, fallback, params);

  function resolveAssetUrl(path){
    if (!path) return path;
    try {
      const base = (typeof document !== 'undefined' && document.baseURI)
        ? document.baseURI
        : (typeof location !== 'undefined' ? location.href : '');
      return base ? new URL(path, base).href : path;
    } catch {
      return path;
    }
  }

  function ensureMathJs(){
    if (window.math && window.math.create) {
      return Promise.resolve(window.math);
    }
    if (mathLoader) return mathLoader;
    mathLoader = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[data-mathjs="1"]`);
      if (existing) {
        existing.addEventListener('load', () => resolve(window.math));
        existing.addEventListener('error', reject);
        return;
      }
      const script = document.createElement('script');
      script.src = resolveAssetUrl(MATHJS_PATH);
      script.async = true;
      script.setAttribute('data-mathjs', '1');
      script.onload = () => {
        if (window.math && window.math.create) {
          resolve(window.math);
        } else {
          reject(new Error('math.js failed to load'));
        }
      };
      script.onerror = () => reject(new Error('math.js failed to load'));
      document.head.appendChild(script);
    });
    return mathLoader;
  }

  function ensureMathJax(){
    if (mathJaxInstance && mathJaxInstance.tex2chtmlPromise) {
      const ready = mathJaxInstance.startup?.promise;
      return ready ? ready.then(() => mathJaxInstance) : Promise.resolve(mathJaxInstance);
    }
    if (window.MathJax && window.MathJax.tex2chtmlPromise) {
      mathJaxInstance = window.MathJax;
      const ready = mathJaxInstance.startup?.promise;
      return ready ? ready.then(() => mathJaxInstance) : Promise.resolve(mathJaxInstance);
    }
    if (mathJaxLoader) return mathJaxLoader;
    window.MathJax = window.MathJax || {};
    window.MathJax.tex = window.MathJax.tex || { inlineMath: [['\\(', '\\)'], ['$', '$']] };
    if (!window.MathJax.tex.inlineMath) {
      window.MathJax.tex.inlineMath = [['\\(', '\\)'], ['$', '$']];
    }
    window.MathJax.chtml = Object.assign({ scale: 1.05 }, window.MathJax.chtml);
    window.MathJax.svg = Object.assign({ fontCache: 'global' }, window.MathJax.svg);
    mathJaxLoader = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-mathjax-loader="1"]');
      if (existing) {
        existing.addEventListener('load', () => {
          const ready = window.MathJax?.startup?.promise;
          (ready || Promise.resolve(window.MathJax)).then(mjx => {
            mathJaxInstance = mjx;
            resolve(mjx);
          }).catch(reject);
        });
        existing.addEventListener('error', reject);
        return;
      }
      const script = document.createElement('script');
      script.src = resolveAssetUrl(MATHJAX_PATH);
      script.async = true;
      script.setAttribute('data-mathjax-loader', '1');
      script.onload = () => {
        const ready = window.MathJax?.startup?.promise;
        (ready || Promise.resolve(window.MathJax)).then(mjx => {
          mathJaxInstance = mjx;
          resolve(mjx);
        }).catch(reject);
      };
      script.onerror = () => reject(new Error('MathJax failed to load'));
      document.head.appendChild(script);
    }).catch(err => {
      mathJaxLoader = null;
      throw err;
    });
    return mathJaxLoader;
  }

  function create(root, awardXp, opts){
    let active = false;
    let destroyed = false;
    let mathRef = null;
    let math = null;
    let scope = { ans: 0 };
    let totalComputations = 0;
    let totalGraphs = 0;
    const shortcuts = opts?.shortcuts;
    let shortcutsLocked = false;
    const localeBindings = [];
    const localeCleanup = [];
    let lastStatusDescriptor = null;
    let lastStatusTimestamp = null;

    const container = document.createElement('div');
    container.className = 'math-lab-root';
    Object.assign(container.style, {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 20% 20%, rgba(59,130,246,0.08), rgba(8,11,23,0.92))',
      color: '#e2e8f0',
      fontFamily: "'Segoe UI', 'Helvetica Neue', sans-serif"
    });

    const panel = document.createElement('div');
    Object.assign(panel.style, {
      width: 'min(960px, 96%)',
      height: 'min(640px, 94%)',
      display: 'grid',
      gridTemplateColumns: '260px 1fr',
      gap: '16px',
      padding: '18px',
      background: 'linear-gradient(150deg,#0f172a,#111827)',
      borderRadius: '24px',
      border: '1px solid rgba(148,163,184,0.18)',
      boxShadow: '0 28px 60px rgba(8,12,24,0.55)',
      position: 'relative'
    });

    const loadingOverlay = document.createElement('div');
    Object.assign(loadingOverlay.style, {
      position: 'absolute',
      inset: '0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(15,23,42,0.82)',
      zIndex: '4'
    });
    const loadingMessage = document.createElement('div');
    Object.assign(loadingMessage.style, {
      textAlign: 'center',
      fontSize: '15px',
      letterSpacing: '0.4px',
      color: '#cbd5f5'
    });
    registerLocaleBinding(() => {
      loadingMessage.textContent = statusText('loading', '数学エンジンを読み込んでいます…');
    });
    loadingOverlay.appendChild(loadingMessage);

    const keypadPanel = document.createElement('div');
    Object.assign(keypadPanel.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      height: '100%',
      minHeight: '0',
      overflow: 'hidden'
    });

    const functionGroupContainer = document.createElement('div');
    Object.assign(functionGroupContainer.style, {
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      flex: '1 1 auto',
      minHeight: '0',
      overflowY: 'auto',
      overflowX: 'hidden',
      paddingRight: '4px'
    });
    keypadPanel.appendChild(functionGroupContainer);

    const workspace = document.createElement('div');
    Object.assign(workspace.style, {
      display: 'grid',
      gridTemplateRows: 'auto auto 1fr auto',
      gap: '14px',
      minHeight: '0'
    });

    panel.appendChild(keypadPanel);
    panel.appendChild(workspace);
    panel.appendChild(loadingOverlay);
    container.appendChild(panel);

    root.appendChild(container);

    function setShortcutEnabled(key, enabled){
      if (!shortcuts) return;
      if (typeof shortcuts.setKeyEnabled === 'function') {
        try { shortcuts.setKeyEnabled(key, enabled); } catch {}
        return;
      }
      if (enabled) {
        try { shortcuts.enableKey?.(key); } catch {}
      } else {
        try { shortcuts.disableKey?.(key); } catch {}
      }
    }

    function lockShortcuts(){
      if (shortcutsLocked) return;
      setShortcutEnabled('p', false);
      setShortcutEnabled('r', false);
      shortcutsLocked = true;
    }

    function unlockShortcuts(){
      if (!shortcutsLocked) return;
      setShortcutEnabled('p', true);
      setShortcutEnabled('r', true);
      shortcutsLocked = false;
    }

    function isEditableElement(el){
      if (!el || typeof el !== 'object' || el.nodeType !== 1) return false;
      if (el.isContentEditable && el.contentEditable !== 'false') return true;
      const tag = (el.tagName || '').toLowerCase();
      if (tag === 'textarea') {
        return !el.disabled && !el.readOnly;
      }
      if (tag === 'input') {
        const type = (el.type || '').toLowerCase();
        if (['button', 'submit', 'reset', 'checkbox', 'radio', 'range', 'color', 'file'].includes(type)) return false;
        return !el.disabled && !el.readOnly;
      }
      return false;
    }

    function handleFocusIn(evt){
      if (!container.contains(evt.target)) return;
      if (isEditableElement(evt.target)) {
        lockShortcuts();
      }
    }

    function handleFocusOut(evt){
      if (!container.contains(evt.target)) return;
      if (!isEditableElement(evt.target)) return;
      const next = evt.relatedTarget;
      if (next && container.contains(next) && isEditableElement(next)) return;
      unlockShortcuts();
    }

    container.addEventListener('focusin', handleFocusIn);
    container.addEventListener('focusout', handleFocusOut);

    let expressionInput, expressionInputClassic, expressionInputPretty;
    let expressionPreviewEl;
    let expressionPreviewPlaceholder = '';
    let exactResultEl, approxResultEl, resultSubLabelExact, resultSubLabelApprox;
    let statusBar, variableList, historyBody;
    let angleToggleRad, angleToggleDeg;
    let resultToggleSymbolic, resultToggleNumeric;
    let expressionModeToggleClassic, expressionModeTogglePretty;
    let graphInput, graphXMin, graphXMax, graphCanvas, graphMessage;
    let plotButton, evalButton, clearButton;
    let unitSelect;
    let radianMode = true;
    let resultMode = 'symbolic';
    let expressionMode = 'classic';
    let history = [];
    let numericMath = null;
    let moreDigitsButton = null;
    let approxRawValue = null;
    let approxManualText = null;
    let approxDigitsShown = 10;
    let approxHasMoreDigits = false;
    let approxForceEllipsis = false;
    let latestHistoryEntry = null;
    let lastSymbolicRaw = null;

    function runLocaleBindings(){
      localeBindings.forEach(fn => {
        try {
          fn();
        } catch (error) {
          console.warn('[math_lab:i18n] Failed to refresh locale binding:', error);
        }
      });
    }

    function registerLocaleBinding(fn){
      if (typeof fn !== 'function') return;
      localeBindings.push(fn);
      try {
        fn();
      } catch (error) {
        console.warn('[math_lab:i18n] Failed to apply locale binding:', error);
      }
    }

    function renderStatusFromDescriptor(descriptor){
      if (!statusBar || !descriptor) return;
      const timestamp = lastStatusTimestamp instanceof Date ? lastStatusTimestamp : new Date();
      const message = statusText(descriptor.key, descriptor.fallback, descriptor.params);
      statusBar.textContent = `${timestamp.toLocaleTimeString()} — ${message}`;
    }

    function notifyStatusKey(key, fallback, params){
      lastStatusDescriptor = { key, fallback, params };
      lastStatusTimestamp = new Date();
      renderStatusFromDescriptor(lastStatusDescriptor);
    }

    function setupLocaleSync(){
      const handler = () => {
        const i18n = getI18nInstance();
        // i18nインスタンスが存在し、isReady()がないか、isReady()がtrueを返す場合のみ実行
        if (i18n && (typeof i18n.isReady !== 'function' || i18n.isReady())) {
          runLocaleBindings();
        }
      };

      if (typeof document !== 'undefined') {
        // main.jsが言語変更/初期化完了時に発火させるイベント
        document.addEventListener('app:rerender', handler);
        localeCleanup.push(() => document.removeEventListener('app:rerender', handler));

        // 標準的なI18nライブラリが発火させる可能性のあるイベント
        document.addEventListener('i18n:locale-changed', handler);
        localeCleanup.push(() => document.removeEventListener('i18n:locale-changed', handler));
      }

      // I18nライブラリの準備が非同期で完了するのを待つためのポーリング処理
      const i18n = getI18nInstance();
      if (i18n && typeof i18n.isReady === 'function' && !i18n.isReady()) {
        const interval = setInterval(() => {
          const currentI18n = getI18nInstance();
          if (currentI18n && currentI18n.isReady()) {
            clearInterval(interval);
            handler();
          }
        }, 100);
        localeCleanup.push(() => clearInterval(interval));
      } else {
        // 同期的に利用可能な場合は即時実行
        handler();
      }
    }

    const DEFAULT_DECIMAL_DIGITS = 10;
    const DECIMAL_DIGIT_STEP = 5;
    const MAX_DECIMAL_DIGITS = 120;
    const buttonGroups = [
      {
        id: 'standard',
        title: '標準関数',
        color: '#38bdf8',
        buttons: [
          { label: '(', text: '(', },
          { label: ')', text: ')', },
          { label: '+', text: '+', },
          { label: '−', text: '-', },
          { label: '×', text: '*', },
          { label: '÷', text: '/', },
          { label: '^', text: '^', },
          { label: 'sqrt', text: 'sqrt(', },
          { label: 'nthRoot', text: 'nthRoot(', },
          { label: 'abs', text: 'abs(', },
          { label: 'exp', text: 'exp(', },
          { label: 'log', text: 'log(', },
          { label: 'ln', text: 'ln(', },
          { label: 'derivative', text: 'derivative(', },
          { label: 'integral', text: 'integral(', },
          { label: 'taylor', text: 'taylorSeries(', }
        ]
      },
      {
        id: 'trigonometry',
        title: '三角・双曲線',
        color: '#a855f7',
        buttons: [
          { label: 'sin', text: 'sin(', },
          { label: 'cos', text: 'cos(', },
          { label: 'tan', text: 'tan(', },
          { label: 'asin', text: 'asin(', },
          { label: 'acos', text: 'acos(', },
          { label: 'atan', text: 'atan(', },
          { label: 'atan2', text: 'atan2(', },
          { label: 'sinh', text: 'sinh(', },
          { label: 'cosh', text: 'cosh(', },
          { label: 'tanh', text: 'tanh(', }
        ]
      },
      {
        id: 'complex',
        title: '複素数・行列',
        color: '#f97316',
        buttons: [
          { label: 'i', text: 'i', },
          { label: 'conj', text: 'conj(', },
          { label: 're', text: 're(', },
          { label: 'im', text: 'im(', },
          { label: 'arg', text: 'arg(', },
          { label: 'det', text: 'det(', },
          { label: 'trace', text: 'trace(', },
          { label: 'transpose', text: 'transpose(', },
          { label: 'solveLinear', text: 'solveLinear(', },
          { label: 'eigenvalues', text: 'eigs(', }
        ]
      },
      {
        id: 'analysis',
        title: '解析・特殊関数',
        color: '#34d399',
        buttons: [
          { label: 'factorial', text: 'factorial(', },
          { label: 'gamma', text: 'gamma(', },
          { label: 'digamma', text: 'digamma(', },
          { label: 'polygamma', text: 'polygamma(', },
          { label: 'beta', text: 'beta(', },
          { label: 'zeta', text: 'zeta(', },
          { label: 'harmonic', text: 'harmonic(', },
          { label: 'erf', text: 'erf(', },
          { label: 'erfc', text: 'erfc(', },
          { label: 'LambertW', text: 'lambertW(', },
          { label: 'logGamma', text: 'logGamma(', },
          { label: 'BesselJ', text: 'besselj(', },
          { label: 'BesselY', text: 'bessely(', },
          { label: 'BesselI', text: 'besseli(', },
          { label: 'BesselK', text: 'besselk(', },
          { label: 'comb', text: 'combinations(', },
          { label: 'perm', text: 'permutations(', },
          { label: 'sum', text: 'sum(', },
          { label: 'product', text: 'prod(', },
          { label: 'Fourier', text: 'fft(', },
          { label: 'tetra', text: 'tetra(', },
          { label: 'slog', text: 'slog(', }
        ]
      },
      {
        id: 'statistics',
        title: '確率・統計',
        color: '#f472b6',
        buttons: [
          { label: 'normalPdf', text: 'normalPdf(', },
          { label: 'normalCdf', text: 'normalCdf(', },
          { label: 'normalInv', text: 'normalInv(', },
          { label: 'poissonPmf', text: 'poissonPmf(', },
          { label: 'poissonCdf', text: 'poissonCdf(', },
          { label: 'binomPmf', text: 'binomialPmf(', },
          { label: 'binomCdf', text: 'binomialCdf(', },
          { label: 'logit', text: 'logit(', },
          { label: 'sigmoid', text: 'sigmoid(', }
        ]
      },
      {
        id: 'numerical',
        title: '数値解法',
        color: '#fb7185',
        buttons: [
          { label: 'solveEq', text: 'solveEq(', },
          { label: 'solveSystem', text: 'solveSystem(', },
          { label: 'numericIntegrate', text: 'numericIntegrate(', },
          { label: 'minimize', text: 'minimize(', },
          { label: 'maximize', text: 'maximize(', }
        ]
      },
      {
        id: 'programmer',
        title: 'プログラマー・情報',
        color: '#0ea5e9',
        buttons: [
          { label: 'baseDecode', text: 'baseDecode(', },
          { label: 'baseEncode', text: 'baseEncode(', },
          { label: 'baseConvert', text: 'baseConvert(', }
        ]
      },
      {
        id: 'constants',
        title: '定数・単位',
        color: '#facc15',
        buttons: [
          { label: 'π', text: 'pi', },
          { label: 'e', text: 'e', },
          { label: 'φ', text: '(1+sqrt(5))/2', },
          { label: 'c', text: 'c', },
          { label: 'G', text: 'G', },
          { label: 'ℏ', text: 'hbar', },
          { label: 'deg', text: 'deg', },
          { label: 'rad', text: 'rad', },
          { label: 'kg', text: 'kg', },
          { label: 'm', text: 'm', }
        ]
      }
    ];

    const RADIX_DIGITS = '0123456789ABCDEFGHIJKLMNOPQRST';

    function ensureRadix(value){
      const num = Number(ensureFiniteNumber(value));
      if (!Number.isInteger(num) || num < 2 || num > 30) {
        throw new Error(errorText('radixRange', '基数は 2 以上 30 以下の整数で指定してください。'));
      }
      return num;
    }

    function clampRadixPrecision(value){
      if (value === undefined || value === null) return 12;
      const num = Number(value);
      if (!Number.isFinite(num)) return 12;
      return Math.max(0, Math.min(24, Math.floor(num)));
    }

    function parseRadixText(text, base){
      if (typeof text !== 'string') return null;
      let str = text.trim().toUpperCase();
      if (!str) return null;
      let sign = 1;
      if (str.startsWith('+')) {
        str = str.slice(1);
      } else if (str.startsWith('-')) {
        sign = -1;
        str = str.slice(1);
      }
      if (!str) return null;
      const parts = str.split('.');
      if (parts.length > 2) return null;
      const intPart = parts[0] || '';
      const fracPart = parts[1] || '';
      const pattern = new RegExp(`^[${RADIX_DIGITS.slice(0, base)}]*$`);
      if (!pattern.test(intPart) || !pattern.test(fracPart)) return null;
      let value = 0;
      for (let i = 0; i < intPart.length; i++) {
        const digit = RADIX_DIGITS.indexOf(intPart[i]);
        if (digit < 0 || digit >= base) return null;
        value = value * base + digit;
      }
      let fraction = 0;
      let factor = 1 / base;
      for (let i = 0; i < fracPart.length; i++) {
        const digit = RADIX_DIGITS.indexOf(fracPart[i]);
        if (digit < 0 || digit >= base) return null;
        fraction += digit * factor;
        factor /= base;
      }
      const result = sign * (value + fraction);
      return Number.isFinite(result) ? result : null;
    }

    function decodeBaseValue(value, base){
      if (typeof value === 'string') {
        const parsed = parseRadixText(value, base);
        if (parsed === null) {
          throw new Error(errorText('radixInvalidCharacter', '指定した基数に対応しない文字が含まれています。'));
        }
        return parsed;
      }
      if (value && typeof value.valueOf === 'function' && value.valueOf() !== value) {
        return decodeBaseValue(value.valueOf(), base);
      }
      return ensureFiniteNumber(value);
    }

    function convertDecimalToRadix(num, base, precision = 12){
      const numeric = ensureFiniteNumber(num);
      if (!Number.isFinite(numeric)) return 'NaN';
      if (base < 2) return String(numeric);
      const negative = numeric < 0;
      let absValue = Math.abs(numeric);
      let intPart = Math.floor(absValue);
      if (!Number.isFinite(intPart)) return 'NaN';
      let intStr = '';
      if (intPart === 0) {
        intStr = '0';
      } else {
        while (intPart > 0) {
          const digit = intPart % base;
          intStr = RADIX_DIGITS[digit] + intStr;
          intPart = Math.floor(intPart / base);
        }
      }
      let fracStr = '';
      const digitCount = Math.max(0, Math.min(precision, 24));
      let fraction = absValue - Math.floor(absValue);
      if (fraction > 0 && digitCount > 0) {
        for (let i = 0; i < digitCount && fraction > 1e-12; i++) {
          fraction *= base;
          let digit = Math.floor(fraction + 1e-12);
          if (digit >= base) {
            digit = base - 1;
            fraction = 0;
          }
          fracStr += RADIX_DIGITS[digit];
          fraction -= digit;
        }
        fracStr = fracStr.replace(/0+$/, '');
      }
      const combined = fracStr ? `${intStr}.${fracStr}` : intStr;
      return negative && combined !== '0' ? `-${combined}` : combined;
    }

    function cloneScope(source = scope){
      const target = Object.create(null);
      if (!source) return target;
      Object.keys(source).forEach(key => {
        target[key] = source[key];
      });
      return target;
    }

    function compileExpression(expr){
      if (expr && typeof expr.evaluate === 'function') return expr;
      if (typeof expr === 'string') {
        return math.parse(expr);
      }
      throw new Error(errorText('expressionParse', '式を解釈できませんでした。文字列または math.js のノードを渡してください。'));
    }

    function normalizeEquation(expr){
      if (typeof expr !== 'string') return expr;
      if (!expr.includes('=')) return expr;
      const [lhs, rhs] = expr.split('=').map(part => part.trim());
      if (lhs && rhs) {
        return `(${lhs}) - (${rhs})`;
      }
      return expr;
    }

    function ensureFiniteNumber(value){
      if (typeof value === 'number') {
        if (!Number.isFinite(value)) throw new Error(errorText('notFinite', '有限の数値ではありません。'));
        return value;
      }
      if (mathRef && mathRef.isBigNumber && mathRef.isBigNumber(value)) {
        const num = value.toNumber();
        if (!Number.isFinite(num)) throw new Error(errorText('notFinite', '有限の数値ではありません。'));
        return num;
      }
      if (mathRef && mathRef.isFraction && mathRef.isFraction(value)) {
        return value.valueOf();
      }
      if (mathRef && mathRef.isComplex && mathRef.isComplex(value)) {
        if (Math.abs(value.im) > 1e-10) {
          const err = new Error(errorText('complexRealOnly', '複素数は実数部のみを使用できません。'));
          err.code = 'COMPLEX';
          throw err;
        }
        return value.re;
      }
      if (mathRef && mathRef.isMatrix && mathRef.isMatrix(value)) {
        const err = new Error(errorText('matrixToScalar', '行列はスカラーに変換できません。'));
        err.code = 'MATRIX';
        throw err;
      }
      if (Array.isArray(value)) {
        const err = new Error(errorText('arrayToScalar', '配列はスカラーに変換できません。'));
        err.code = 'ARRAY';
        throw err;
      }
      const num = Number(value);
      if (!Number.isFinite(num)) throw new Error(errorText('numberConversion', '数値へ変換できませんでした。'));
      return num;
    }

    function ensurePositiveFiniteNumber(value, message){
      const num = ensureFiniteNumber(value);
      if (num <= 0) {
        throw new Error(message || errorText('positiveRealRequired', '正の実数を指定してください。'));
      }
      return num;
    }

    function buildKeypad(){
      functionGroupContainer.innerHTML = '';
      const existingFavorites = keypadPanel.querySelector('[data-math-lab-favorites]');
      if (existingFavorites) existingFavorites.remove();
      buttonGroups.forEach(group => {
        const section = document.createElement('div');
        Object.assign(section.style, {
          background: 'linear-gradient(135deg, rgba(30,41,59,0.45), rgba(15,23,42,0.32))',
          borderRadius: '16px',
          border: '1px solid rgba(148,163,184,0.12)',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        });

        const headerButton = document.createElement('button');
        headerButton.type = 'button';
        Object.assign(headerButton.style, {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          width: '100%',
          fontSize: '14px',
          fontWeight: '600',
          letterSpacing: '0.3px',
          color: group.color,
          background: 'transparent',
          border: 'none',
          padding: '0',
          cursor: 'pointer'
        });

        const headerText = document.createElement('span');
        registerLocaleBinding(() => {
          headerText.textContent = keypadText(`groups.${group.id}`, group.title);
        });

        const chevron = document.createElement('span');
        chevron.textContent = '▾';
        chevron.style.fontSize = '12px';
        chevron.style.color = group.color;

        headerButton.appendChild(headerText);
        headerButton.appendChild(chevron);

        const grid = document.createElement('div');
        Object.assign(grid.style, {
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: '8px'
        });

        group.buttons.forEach(btnDef => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.textContent = btnDef.label;
          Object.assign(btn.style, {
            padding: '11px 8px',
            borderRadius: '10px',
            border: '1px solid rgba(148,163,184,0.24)',
            background: 'linear-gradient(135deg, rgba(23,37,84,0.55), rgba(15,23,42,0.55))',
            color: '#f8fafc',
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: '0 12px 24px rgba(8,12,24,0.32)',
            transition: 'transform 0.12s ease, box-shadow 0.12s ease'
          });
          btn.addEventListener('pointerenter', () => {
            btn.style.transform = 'translateY(-2px) scale(1.02)';
            btn.style.boxShadow = '0 20px 36px rgba(8,12,24,0.45)';
          });
          btn.addEventListener('pointerleave', () => {
            btn.style.transform = 'translateY(0) scale(1)';
            btn.style.boxShadow = '0 12px 24px rgba(8,12,24,0.32)';
          });
          btn.addEventListener('click', () => insertText(btnDef.text));
          grid.appendChild(btn);
        });

        section.appendChild(headerButton);
        section.appendChild(grid);

        let collapsed = false;
        const updateCollapsed = () => {
          grid.style.display = collapsed ? 'none' : 'grid';
          chevron.textContent = collapsed ? '▸' : '▾';
          headerButton.setAttribute('aria-expanded', String(!collapsed));
        };
        headerButton.addEventListener('click', () => {
          collapsed = !collapsed;
          updateCollapsed();
        });
        updateCollapsed();
        functionGroupContainer.appendChild(section);
      });

      const favorites = document.createElement('div');
      favorites.setAttribute('data-math-lab-favorites', '1');
      Object.assign(favorites.style, {
        marginTop: 'auto',
        background: 'linear-gradient(135deg, rgba(59,130,246,0.14), rgba(15,23,42,0.4))',
        borderRadius: '18px',
        border: '1px solid rgba(59,130,246,0.25)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      });
      const favTitle = document.createElement('div');
      registerLocaleBinding(() => {
        favTitle.textContent = uiText('unitTemplates.title', 'ユニット変換テンプレ');
      });
      Object.assign(favTitle.style, {
        fontSize: '14px',
        letterSpacing: '0.4px',
        color: '#60a5fa',
        fontWeight: '600'
      });

      unitSelect = document.createElement('select');
      Object.assign(unitSelect.style, {
        padding: '10px 12px',
        borderRadius: '10px',
        border: '1px solid rgba(96,165,250,0.45)',
        background: 'rgba(15,23,42,0.6)',
        color: '#dbeafe',
        fontSize: '13px'
      });
      const unitTemplates = [
        { key: 'length', label: '長さ: 5 cm → inch', expr: '5 cm to inch' },
        { key: 'mass', label: '重さ: 70 kg → lb', expr: '70 kg to pound' },
        { key: 'energy', label: 'エネルギー: 1 kWh → J', expr: '1 kWh to J' },
        { key: 'temperature', label: '温度: 25 degC → degF', expr: '25 degC to degF' },
        { key: 'speed', label: '速度: 100 km/h → m/s', expr: '100 km/h to m/s' }
      ];
      unitTemplates.forEach(t => {
        const option = document.createElement('option');
        option.value = t.expr;
        registerLocaleBinding(() => {
          option.textContent = unitText(`templates.${t.key}`, t.label);
        });
        unitSelect.appendChild(option);
      });
      const unitBtn = document.createElement('button');
      unitBtn.type = 'button';
      registerLocaleBinding(() => {
        unitBtn.textContent = uiText('unitTemplates.insert', '挿入');
      });
      Object.assign(unitBtn.style, {
        padding: '10px 0',
        borderRadius: '10px',
        border: '1px solid rgba(59,130,246,0.5)',
        background: 'linear-gradient(135deg, rgba(96,165,250,0.3), rgba(14,116,144,0.5))',
        color: '#f8fafc',
        fontSize: '13px',
        cursor: 'pointer'
      });
      unitBtn.addEventListener('click', () => {
        insertText(unitSelect.value);
      });

      favorites.appendChild(favTitle);
      favorites.appendChild(unitSelect);
      favorites.appendChild(unitBtn);
      keypadPanel.appendChild(favorites);
    }

    function buildWorkspace(){
      const topBar = document.createElement('div');
      Object.assign(topBar.style, {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 16px',
        background: 'linear-gradient(135deg, rgba(30,41,59,0.5), rgba(15,23,42,0.45))',
        borderRadius: '16px',
        border: '1px solid rgba(148,163,184,0.18)'
      });

      const angleGroup = document.createElement('div');
      Object.assign(angleGroup.style, {
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        fontSize: '13px'
      });

      angleToggleRad = buildToggle(uiText('angle.radians', 'Radians'), true, () => setAngleMode(true));
      angleToggleDeg = buildToggle(uiText('angle.degrees', 'Degrees'), false, () => setAngleMode(false));
      registerLocaleBinding(() => {
        if (angleToggleRad?.labelEl) {
          angleToggleRad.labelEl.textContent = uiText('angle.radians', 'Radians');
        }
        if (angleToggleDeg?.labelEl) {
          angleToggleDeg.labelEl.textContent = uiText('angle.degrees', 'Degrees');
        }
      });

      angleGroup.appendChild(angleToggleRad.wrapper);
      angleGroup.appendChild(angleToggleDeg.wrapper);

      statusBar = document.createElement('div');
      Object.assign(statusBar.style, {
        fontSize: '12px',
        color: '#cbd5f5',
        letterSpacing: '0.3px'
      });
      lastStatusDescriptor = { key: 'initializing', fallback: '準備中…' };
      lastStatusTimestamp = new Date();
      registerLocaleBinding(() => {
        if (!lastStatusDescriptor) {
          lastStatusDescriptor = { key: 'initializing', fallback: '準備中…' };
        }
        if (!(lastStatusTimestamp instanceof Date)) {
          lastStatusTimestamp = new Date();
        }
        renderStatusFromDescriptor(lastStatusDescriptor);
      });

      topBar.appendChild(angleGroup);
      topBar.appendChild(statusBar);

      const worksheet = document.createElement('div');
      Object.assign(worksheet.style, {
        background: 'linear-gradient(180deg, rgba(15,23,42,0.45), rgba(8,11,23,0.65))',
        borderRadius: '18px',
        border: '1px solid rgba(148,163,184,0.15)',
        padding: '18px',
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr)',
        gap: '14px'
      });

      const worksheetHeader = document.createElement('div');
      registerLocaleBinding(() => {
        worksheetHeader.textContent = uiText('worksheet.title', 'ワークシート');
      });
      Object.assign(worksheetHeader.style, {
        fontSize: '14px',
        color: '#93c5fd',
        letterSpacing: '0.4px',
        fontWeight: '600'
      });

      const inputModeSwitch = document.createElement('div');
      Object.assign(inputModeSwitch.style, {
        display: 'inline-flex',
        borderRadius: '999px',
        overflow: 'hidden',
        border: '1px solid rgba(148,163,184,0.28)',
        alignSelf: 'flex-start'
      });

      expressionModeToggleClassic = buildSegmentToggle(uiText('inputMode.classic', '関数表記'), () => setExpressionMode('classic'));
      expressionModeTogglePretty = buildSegmentToggle(uiText('inputMode.pretty', '数学記号'), () => setExpressionMode('pretty'));
      registerLocaleBinding(() => {
        if (expressionModeToggleClassic?.button) {
          expressionModeToggleClassic.button.textContent = uiText('inputMode.classic', '関数表記');
        }
        if (expressionModeTogglePretty?.button) {
          expressionModeTogglePretty.button.textContent = uiText('inputMode.pretty', '数学記号');
        }
      });
      inputModeSwitch.appendChild(expressionModeToggleClassic.button);
      inputModeSwitch.appendChild(expressionModeTogglePretty.button);

      expressionInputClassic = document.createElement('textarea');
      registerLocaleBinding(() => {
        expressionInputClassic.placeholder = placeholderText('worksheet.classic', '式やコマンドを入力 (例: integrate(sin(x), x), solveEq(sin(x)=0.5, x, 1), solveSystem(["x+y=3","x-y=1"],["x","y"]))');
      });
      Object.assign(expressionInputClassic.style, {
        minHeight: '110px',
        resize: 'vertical',
        borderRadius: '14px',
        border: '1px solid rgba(148,163,184,0.22)',
        padding: '14px',
        fontSize: '15px',
        fontFamily: '"Fira Code", "Cascadia Code", monospace',
        background: 'rgba(15,23,42,0.65)',
        color: '#f8fafc'
      });

      expressionInputPretty = document.createElement('textarea');
      registerLocaleBinding(() => {
        expressionInputPretty.placeholder = placeholderText('worksheet.pretty', '例: √(2) + 1/3, 2π, (x+1)/(x−1) など数学記号で入力');
      });
      Object.assign(expressionInputPretty.style, {
        minHeight: '110px',
        resize: 'vertical',
        borderRadius: '14px',
        border: '1px solid rgba(148,163,184,0.22)',
        padding: '14px',
        fontSize: '16px',
        fontFamily: '"Noto Sans JP", "Yu Gothic", sans-serif',
        background: 'rgba(15,23,42,0.65)',
        color: '#f8fafc',
        display: 'none'
      });

      expressionInput = expressionInputClassic;

      const previewCard = document.createElement('div');
      Object.assign(previewCard.style, {
        borderRadius: '14px',
        border: '1px solid rgba(148,163,184,0.18)',
        background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(15,23,42,0.4))',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      });

      const previewTitle = document.createElement('div');
      registerLocaleBinding(() => {
        previewTitle.textContent = uiText('preview.title', '数式プレビュー');
      });
      Object.assign(previewTitle.style, {
        fontSize: '13px',
        color: '#bae6fd',
        letterSpacing: '0.3px'
      });

      expressionPreviewEl = document.createElement('div');
      Object.assign(expressionPreviewEl.style, {
        minHeight: '52px',
        borderRadius: '12px',
        background: 'rgba(15,23,42,0.55)',
        padding: '12px',
        fontSize: '15px',
        lineHeight: '1.45',
        color: '#f8fafc',
        wordBreak: 'break-word'
      });
      registerLocaleBinding(() => {
        expressionPreviewPlaceholder = placeholderText('preview.expression', '（入力中の式がここに可視化されます）');
        updateExpressionPreview();
      });
      expressionPreviewEl.style.opacity = '0.65';

      previewCard.appendChild(previewTitle);
      previewCard.appendChild(expressionPreviewEl);

      const worksheetButtons = document.createElement('div');
      Object.assign(worksheetButtons.style, {
        display: 'flex',
        gap: '12px'
      });

      evalButton = buildPrimaryButton(uiText('actions.evaluate', '計算 (Shift+Enter)'), '#4ade80');
      registerLocaleBinding(() => {
        if (evalButton) {
          evalButton.textContent = uiText('actions.evaluate', '計算 (Shift+Enter)');
        }
      });
      evalButton.addEventListener('click', evaluateExpression);

      clearButton = buildPrimaryButton(uiText('actions.clear', 'リセット'), '#60a5fa');
      registerLocaleBinding(() => {
        if (clearButton) {
          clearButton.textContent = uiText('actions.clear', 'リセット');
        }
      });
      clearButton.addEventListener('click', clearWorksheet);

      const copyButton = buildPrimaryButton(uiText('actions.copyResult', '結果をコピー'), '#f97316');
      registerLocaleBinding(() => {
        copyButton.textContent = uiText('actions.copyResult', '結果をコピー');
      });
      copyButton.addEventListener('click', () => {
        const result = resultMode === 'numeric'
          ? approxResultEl?.dataset.rawValue
          : exactResultEl?.dataset.rawValue;
        if (result) {
          navigator.clipboard?.writeText(result)
            .then(() => notifyStatusKey('copySuccess', '結果をクリップボードにコピーしました。'))
            .catch(() => notifyStatusKey('copyFailure', 'コピーに失敗しました…'));
        }
      });

      worksheetButtons.appendChild(evalButton);
      worksheetButtons.appendChild(clearButton);
      worksheetButtons.appendChild(copyButton);

      const resultCard = document.createElement('div');
      Object.assign(resultCard.style, {
        borderRadius: '16px',
        border: '1px solid rgba(74,222,128,0.35)',
        background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(15,118,110,0.12))',
        padding: '16px',
        display: 'grid',
        gap: '10px'
      });
      const resultTitle = document.createElement('div');
      registerLocaleBinding(() => {
        resultTitle.textContent = resultText('title', '結果');
      });
      Object.assign(resultTitle.style, {
        fontSize: '14px',
        color: '#bbf7d0',
        letterSpacing: '0.4px'
      });
      const resultModeSwitch = document.createElement('div');
      Object.assign(resultModeSwitch.style, {
        display: 'inline-flex',
        borderRadius: '999px',
        overflow: 'hidden',
        border: '1px solid rgba(16,185,129,0.35)',
        alignSelf: 'flex-start'
      });
      resultToggleSymbolic = buildSegmentToggle(resultText('symbolicToggle', '分数/記号'), () => setResultMode('symbolic'), '#0f766e');
      resultToggleNumeric = buildSegmentToggle(resultText('numericToggle', '小数'), () => setResultMode('numeric'), '#0f766e');
      registerLocaleBinding(() => {
        if (resultToggleSymbolic?.button) {
          resultToggleSymbolic.button.textContent = resultText('symbolicToggle', '分数/記号');
        }
        if (resultToggleNumeric?.button) {
          resultToggleNumeric.button.textContent = resultText('numericToggle', '小数');
        }
      });
      resultModeSwitch.appendChild(resultToggleSymbolic.button);
      resultModeSwitch.appendChild(resultToggleNumeric.button);
      exactResultEl = document.createElement('div');
      approxResultEl = document.createElement('div');
      [exactResultEl, approxResultEl].forEach(el => {
        Object.assign(el.style, {
          background: 'rgba(15,23,42,0.45)',
          borderRadius: '12px',
          padding: '12px',
          fontSize: '15px'
        });
        el.textContent = '—';
      });
      exactResultEl.style.fontFamily = '"Noto Sans Math", "Cambria Math", "Times New Roman", serif';
      approxResultEl.style.fontFamily = '"Fira Code", monospace';

      resultSubLabelExact = document.createElement('div');
      registerLocaleBinding(() => {
        resultSubLabelExact.textContent = resultText('symbolicLabel', 'Exact / Symbolic');
      });
      Object.assign(resultSubLabelExact.style, { fontSize: '12px', color: '#a7f3d0', letterSpacing: '0.3px' });
      resultSubLabelApprox = document.createElement('div');
      registerLocaleBinding(() => {
        resultSubLabelApprox.textContent = resultText('numericLabel', 'Approximate (10進)');
      });
      Object.assign(resultSubLabelApprox.style, { fontSize: '12px', color: '#a7f3d0', letterSpacing: '0.3px' });

      resultCard.appendChild(resultTitle);
      resultCard.appendChild(resultModeSwitch);
      resultCard.appendChild(resultSubLabelExact);
      resultCard.appendChild(exactResultEl);
      resultCard.appendChild(resultSubLabelApprox);
      resultCard.appendChild(approxResultEl);
      moreDigitsButton = document.createElement('button');
      registerLocaleBinding(() => {
        moreDigitsButton.textContent = resultText('moreDigits', 'More Digits');
        moreDigitsButton.title = resultText('moreDigitsHint', '小数表示を+5桁拡張');
      });
      Object.assign(moreDigitsButton.style, {
        justifySelf: 'flex-end',
        padding: '6px 14px',
        borderRadius: '999px',
        border: '1px solid rgba(59,130,246,0.35)',
        background: 'rgba(15,23,42,0.6)',
        color: '#bfdbfe',
        cursor: 'pointer',
        fontSize: '12px',
        letterSpacing: '0.3px',
        display: 'none'
      });
      moreDigitsButton.addEventListener('click', () => {
        const nextDigits = Math.min(MAX_DECIMAL_DIGITS, approxDigitsShown + DECIMAL_DIGIT_STEP);
        if (nextDigits !== approxDigitsShown) {
          approxDigitsShown = nextDigits;
          updateApproxDisplay();
          if (latestHistoryEntry && approxResultEl?.dataset?.rawValue) {
            latestHistoryEntry.approx = approxResultEl.dataset.rawValue;
            updateHistory();
          }
        }
      });
      resultCard.appendChild(moreDigitsButton);

      worksheet.appendChild(worksheetHeader);
      worksheet.appendChild(inputModeSwitch);
      worksheet.appendChild(expressionInputClassic);
      worksheet.appendChild(expressionInputPretty);
      worksheet.appendChild(previewCard);
      worksheet.appendChild(worksheetButtons);
      worksheet.appendChild(resultCard);

      const midPanel = document.createElement('div');
      Object.assign(midPanel.style, {
        display: 'grid',
        gridTemplateColumns: '1fr 240px',
        gap: '16px',
        minHeight: '0'
      });

      const historyCard = document.createElement('div');
      Object.assign(historyCard.style, {
        borderRadius: '18px',
        border: '1px solid rgba(148,163,184,0.14)',
        background: 'linear-gradient(135deg, rgba(15,23,42,0.45), rgba(15,23,42,0.55))',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '0'
      });
      const historyTitle = document.createElement('div');
      registerLocaleBinding(() => {
        historyTitle.textContent = uiText('history.title', '計算履歴');
      });
      Object.assign(historyTitle.style, {
        fontSize: '14px',
        color: '#cbd5f5',
        marginBottom: '10px'
      });

      const historyTable = document.createElement('div');
      Object.assign(historyTable.style, {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        fontSize: '12px',
        color: '#e2e8f0',
        flex: '1 1 auto',
        overflowY: 'auto',
        paddingRight: '6px'
      });
      historyBody = historyTable;

      historyCard.appendChild(historyTitle);
      historyCard.appendChild(historyTable);

      const variableCard = document.createElement('div');
      Object.assign(variableCard.style, {
        borderRadius: '18px',
        border: '1px solid rgba(96,165,250,0.28)',
        background: 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(17,24,39,0.55))',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      });
      const variableTitle = document.createElement('div');
      registerLocaleBinding(() => {
        variableTitle.textContent = uiText('variables.title', 'スコープ変数');
      });
      Object.assign(variableTitle.style, {
        fontSize: '13px',
        color: '#bfdbfe',
        letterSpacing: '0.4px'
      });
      variableList = document.createElement('div');
      Object.assign(variableList.style, {
        fontFamily: '"Fira Code", monospace',
        fontSize: '12px',
        display: 'grid',
        gap: '6px',
        maxHeight: '220px',
        overflowY: 'auto'
      });

      const variableReset = buildPrimaryButton(uiText('variables.reset', '変数をクリア'), '#f87171');
      registerLocaleBinding(() => {
        variableReset.textContent = uiText('variables.reset', '変数をクリア');
      });
      variableReset.addEventListener('click', () => {
        scope = { ans: 0 };
        updateVariables();
        notifyStatusKey('scopeReset', 'スコープを初期化しました。');
      });

      variableCard.appendChild(variableTitle);
      variableCard.appendChild(variableList);
      variableCard.appendChild(variableReset);

      midPanel.appendChild(historyCard);
      midPanel.appendChild(variableCard);

      const graphCard = document.createElement('div');
      Object.assign(graphCard.style, {
        borderRadius: '18px',
        border: '1px solid rgba(148,163,184,0.15)',
        background: 'linear-gradient(135deg, rgba(12,74,110,0.25), rgba(15,23,42,0.55))',
        padding: '18px',
        display: 'grid',
        gap: '12px'
      });
      const graphHeader = document.createElement('div');
      registerLocaleBinding(() => {
        graphHeader.textContent = graphText('title', 'グラフ表示');
      });
      Object.assign(graphHeader.style, {
        fontSize: '14px',
        color: '#bae6fd',
        letterSpacing: '0.4px'
      });

      graphInput = document.createElement('input');
      registerLocaleBinding(() => {
        graphInput.placeholder = placeholderText('graph.expression', 'f(x) を入力 (例: sin(x) / x)');
      });
      Object.assign(graphInput.style, {
        borderRadius: '12px',
        border: '1px solid rgba(148,163,184,0.22)',
        padding: '12px',
        background: 'rgba(15,23,42,0.6)',
        color: '#f8fafc',
        fontSize: '14px',
        fontFamily: '"Fira Code", monospace'
      });

      const graphControls = document.createElement('div');
      Object.assign(graphControls.style, {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: '10px'
      });

      graphXMin = document.createElement('input');
      graphXMin.type = 'number';
      graphXMin.value = '-10';
      graphXMax = document.createElement('input');
      graphXMax.type = 'number';
      graphXMax.value = '10';
      [graphXMin, graphXMax].forEach(inp => {
        Object.assign(inp.style, {
          borderRadius: '10px',
          border: '1px solid rgba(148,163,184,0.2)',
          padding: '10px',
          background: 'rgba(15,23,42,0.6)',
          color: '#e0f2fe',
          fontSize: '13px'
        });
      });

      plotButton = buildPrimaryButton(graphText('plot', 'グラフ描画'), '#38bdf8');
      registerLocaleBinding(() => {
        if (plotButton) {
          plotButton.textContent = graphText('plot', 'グラフ描画');
        }
      });
      plotButton.addEventListener('click', plotGraph);

      graphControls.appendChild(graphXMin);
      graphControls.appendChild(graphXMax);
      graphControls.appendChild(plotButton);

      graphCanvas = document.createElement('canvas');
      graphCanvas.width = 640;
      graphCanvas.height = 240;
      Object.assign(graphCanvas.style, {
        width: '100%',
        height: '240px',
        background: 'rgba(8,11,23,0.7)',
        borderRadius: '16px',
        border: '1px solid rgba(148,163,184,0.2)'
      });

      graphMessage = document.createElement('div');
      Object.assign(graphMessage.style, {
        fontSize: '12px',
        color: '#bae6fd',
        letterSpacing: '0.3px'
      });
      registerLocaleBinding(() => {
        if (!graphMessage.dataset.graphState || graphMessage.dataset.graphState === 'info') {
          graphMessage.textContent = graphText('info', 'x軸・y軸は自動スケール。単位付き値・ベクトル・複素数の虚部は除外されます。');
          graphMessage.dataset.graphState = 'info';
        }
      });
      graphMessage.dataset.graphState = 'info';

      graphCard.appendChild(graphHeader);
      graphCard.appendChild(graphInput);
      const rangeLabel = document.createElement('div');
      registerLocaleBinding(() => {
        rangeLabel.textContent = graphText('range', '範囲 (xmin, xmax)');
      });
      Object.assign(rangeLabel.style, { fontSize: '12px', color: '#cbd5f5' });
      graphCard.appendChild(rangeLabel);
      graphCard.appendChild(graphControls);
      graphCard.appendChild(graphCanvas);
      graphCard.appendChild(graphMessage);

      workspace.appendChild(topBar);
      workspace.appendChild(worksheet);
      workspace.appendChild(midPanel);
      workspace.appendChild(graphCard);

      attachShiftEnterListener(expressionInputClassic);
      attachShiftEnterListener(expressionInputPretty);
      expressionInputClassic.addEventListener('input', () => {
        syncPrettyFromClassic();
      });
      expressionInputClassic.addEventListener('change', () => {
        syncPrettyFromClassic();
      });
      expressionInputPretty.addEventListener('input', () => {
        syncClassicFromPretty();
      });
      expressionInputPretty.addEventListener('change', () => {
        syncClassicFromPretty();
      });
      setExpressionMode('classic', true);
      setResultMode('symbolic', true);
      updateExpressionPreview();
    }

    function buildPrimaryButton(label, accent){
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
      Object.assign(btn.style, {
        padding: '12px 16px',
        borderRadius: '12px',
        border: `1px solid ${accent}44`,
        background: `linear-gradient(135deg, ${accent}40, rgba(15,23,42,0.6))`,
        color: '#f8fafc',
        fontSize: '13px',
        letterSpacing: '0.3px',
        cursor: 'pointer',
        boxShadow: '0 12px 24px rgba(8,12,24,0.32)',
        transition: 'transform 0.12s ease, box-shadow 0.12s ease'
      });
      btn.addEventListener('pointerenter', () => {
        btn.style.transform = 'translateY(-2px)';
        btn.style.boxShadow = '0 18px 36px rgba(8,12,24,0.45)';
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.transform = 'translateY(0)';
        btn.style.boxShadow = '0 12px 24px rgba(8,12,24,0.32)';
      });
      return btn;
    }

    function buildSegmentToggle(label, onClick, accent = '#1d4ed8'){
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
      Object.assign(btn.style, {
        padding: '8px 16px',
        fontSize: '12px',
        border: 'none',
        background: 'rgba(15,23,42,0.65)',
        color: '#e2e8f0',
        cursor: 'pointer',
        transition: 'background 0.12s ease, color 0.12s ease'
      });
      btn.addEventListener('click', () => onClick());
      const setActive = (active) => {
        btn.style.background = active ? `linear-gradient(135deg, ${accent}66, rgba(15,23,42,0.6))` : 'rgba(15,23,42,0.65)';
        btn.style.color = active ? '#f0fdf4' : '#cbd5f5';
      };
      setActive(false);
      return { button: btn, setActive };
    }

    function attachShiftEnterListener(element){
      if (!element) return;
      element.addEventListener('keydown', evt => {
        if (evt.key === 'Enter' && evt.shiftKey) {
          evt.preventDefault();
          evaluateExpression();
        }
      });
    }

    function syncClassicFromPretty(){
      if (!expressionInputPretty || !expressionInputClassic) return;
      expressionInputClassic.value = convertPrettyToAscii(expressionInputPretty.value);
      updateExpressionPreview();
    }

    function syncPrettyFromClassic(){
      if (!expressionInputPretty || !expressionInputClassic) return;
      expressionInputPretty.value = convertAsciiToPretty(expressionInputClassic.value);
      updateExpressionPreview();
    }

    function setExpressionMode(mode, silent = false){
      if (!expressionInputClassic || !expressionInputPretty) return;
      if (expressionMode === mode && !silent) {
        if (expressionInput) expressionInput.focus();
        return;
      }
      expressionMode = mode;
      if (mode === 'classic') {
        expressionInputClassic.style.display = '';
        expressionInputPretty.style.display = 'none';
        expressionInput = expressionInputClassic;
        syncClassicFromPretty();
        if (!silent) notifyStatusKey('inputModeClassic', '入力モード: 関数表記');
      } else {
        syncPrettyFromClassic();
        expressionInputClassic.style.display = 'none';
        expressionInputPretty.style.display = '';
        expressionInput = expressionInputPretty;
        if (!silent) notifyStatusKey('inputModePretty', '入力モード: 数学記号');
      }
      expressionModeToggleClassic?.setActive(mode === 'classic');
      expressionModeTogglePretty?.setActive(mode === 'pretty');
      try { expressionInput?.focus(); } catch {}
      updateExpressionPreview();
    }

    function setResultMode(mode, silent = false){
      if (resultMode === mode && !silent) {
        updateResultDisplay();
        return;
      }
      resultMode = mode;
      updateResultDisplay();
      if (!silent) {
        if (mode === 'symbolic') {
          notifyStatusKey('resultModeSymbolic', '結果表示: 分数/記号モード');
        } else {
          notifyStatusKey('resultModeNumeric', '結果表示: 小数モード');
        }
      }
    }

    function updateResultDisplay(){
      if (!exactResultEl || !approxResultEl) return;
      const showSymbolic = resultMode !== 'numeric';
      exactResultEl.style.display = showSymbolic ? 'block' : 'none';
      approxResultEl.style.display = showSymbolic ? 'none' : 'block';
      if (resultSubLabelExact) resultSubLabelExact.style.display = showSymbolic ? 'block' : 'none';
      if (resultSubLabelApprox) resultSubLabelApprox.style.display = showSymbolic ? 'none' : 'block';
      resultToggleSymbolic?.setActive(showSymbolic);
      resultToggleNumeric?.setActive(!showSymbolic);
      if (showSymbolic) {
        renderSymbolicResult(lastSymbolicRaw);
      }
      updateApproxDisplay();
      updateHistory();
    }

    function buildToggle(label, activeState, onClick){
      const wrapper = document.createElement('div');
      Object.assign(wrapper.style, {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 10px',
        borderRadius: '999px',
        border: '1px solid rgba(148,163,184,0.3)',
        cursor: 'pointer',
        background: activeState ? 'rgba(59,130,246,0.28)' : 'rgba(15,23,42,0.55)'
      });
      const dot = document.createElement('span');
      Object.assign(dot.style, {
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        background: activeState ? '#38bdf8' : '#94a3b8',
        transition: 'background 0.12s ease'
      });
      const text = document.createElement('span');
      text.textContent = label;
      Object.assign(text.style, {
        fontSize: '12px'
      });
      wrapper.appendChild(dot);
      wrapper.appendChild(text);
      wrapper.addEventListener('click', () => {
        onClick();
      });
      return { wrapper, dot, labelEl: text, setActive: (state) => {
        wrapper.style.background = state ? 'rgba(59,130,246,0.28)' : 'rgba(15,23,42,0.55)';
        dot.style.background = state ? '#38bdf8' : '#94a3b8';
      }};
    }

    function setAngleMode(rad){
      if (radianMode === rad) return;
      radianMode = rad;
      angleToggleRad.setActive(rad);
      angleToggleDeg.setActive(!rad);
      notifyStatusKey(rad ? 'angleRadians' : 'angleDegrees', rad ? '角度単位: ラジアン' : '角度単位: 度');
    }

    function insertText(text){
      if (!expressionInput) return;
      const target = expressionInput;
      const valueToInsert = expressionMode === 'pretty' ? beautifySymbols(text) : text;
      const start = target.selectionStart ?? target.value.length;
      const end = target.selectionEnd ?? target.value.length;
      const before = target.value.slice(0, start);
      const after = target.value.slice(end);
      target.value = before + valueToInsert + after;
      const pos = start + valueToInsert.length;
      target.selectionStart = pos;
      target.selectionEnd = pos;
      target.focus();
      if (expressionMode === 'pretty') {
        syncClassicFromPretty();
      } else {
        syncPrettyFromClassic();
      }
    }

    function notifyStatus(message){
      if (!statusBar) return;
      lastStatusDescriptor = null;
      lastStatusTimestamp = new Date();
      statusBar.textContent = `${lastStatusTimestamp.toLocaleTimeString()} — ${message}`;
    }

    function escapeLatexIdentifier(name){
      return String(name ?? '').replace(/([_#%&{}$^\\])/g, '\\$1');
    }

    function joinArgsAsGroup(argsTex){
      return argsTex.length ? `\\left(${argsTex.join(', ')}\\right)` : '';
    }

    const LATEX_FUNCTION_MAP = {
      sin: '\\sin', cos: '\\cos', tan: '\\tan', sec: '\\sec', csc: '\\csc', cot: '\\cot',
      asin: '\\arcsin', acos: '\\arccos', atan: '\\arctan', asec: '\\operatorname{arcsec}',
      acsc: '\\operatorname{arccsc}', acot: '\\operatorname{arccot}',
      sinh: '\\sinh', cosh: '\\cosh', tanh: '\\tanh', csch: '\\operatorname{csch}',
      sech: '\\operatorname{sech}', coth: '\\operatorname{coth}',
      asinh: '\\operatorname{arsinh}', acosh: '\\operatorname{arcosh}', atan2: '\\operatorname{atan2}',
      atanh: '\\operatorname{artanh}', acsch: '\\operatorname{arccsch}', asech: '\\operatorname{arcsech}',
      acoth: '\\operatorname{arcoth}',
      log: '\\log', ln: '\\ln', exp: '\\exp',
      det: '\\det', tr: '\\operatorname{tr}', trace: '\\operatorname{tr}',
      sign: '\\operatorname{sgn}', abs: null,
      floor: null, ceil: null, round: '\\operatorname{round}',
      max: '\\max', min: '\\min', mean: '\\operatorname{mean}',
      median: '\\operatorname{median}', mode: '\\operatorname{mode}',
      variance: '\\operatorname{var}', std: '\\operatorname{std}', sum: '\\sum',
      prod: '\\prod', gamma: '\\Gamma', Gamma: '\\Gamma',
      Beta: '\\operatorname{B}', beta: '\\operatorname{beta}',
      erf: '\\operatorname{erf}', erfc: '\\operatorname{erfc}',
      erfi: '\\operatorname{erfi}', sinc: '\\operatorname{sinc}',
      Ei: '\\operatorname{Ei}', Si: '\\operatorname{Si}', Ci: '\\operatorname{Ci}',
      gcd: '\\gcd', lcm: '\\operatorname{lcm}',
      Re: '\\Re', Im: '\\Im', arg: '\\arg'
    };

    const TEX_HANDLERS = {
      'OperatorNode:divide': (node, options) => {
        const [a, b] = node.args || [];
        const left = a ? a.toTex(options) : '';
        const right = b ? b.toTex(options) : '';
        return `\\frac{${left}}{${right}}`;
      },
      FunctionNode: (node, options) => {
        const name = node.name || node.fn?.name || '';
        const args = node.args || [];
        const argsTex = args.map(arg => arg.toTex(options));
        if (name === 'sqrt') {
          const radicand = argsTex[0] ?? '';
          return `\\sqrt{${radicand}}`;
        }
        if (name === 'nthRoot') {
          const radicand = argsTex[0] ?? '';
          const degree = argsTex[1] ?? '';
          return `\\sqrt[${degree}]{${radicand}}`;
        }
        if (name === 'cbrt') {
          const radicand = argsTex[0] ?? '';
          return `\\sqrt[3]{${radicand}}`;
        }
        if (name === 'abs') {
          const value = argsTex[0] ?? '';
          return `\\left|${value}\\right|`;
        }
        if (name === 'floor') {
          const value = argsTex[0] ?? '';
          return `\\left\\lfloor${value}\\right\\rfloor`;
        }
        if (name === 'ceil') {
          const value = argsTex[0] ?? '';
          return `\\left\\lceil${value}\\right\\rceil`;
        }
        if (name === 'log' && argsTex.length === 2) {
          return `\\log_{${argsTex[1]}}\\left(${argsTex[0]}\\right)`;
        }
        if (name === 'log10' && argsTex.length >= 1) {
          return `\\log_{10}\\left(${argsTex[0]}\\right)`;
        }
        if (name === 'log2' && argsTex.length >= 1) {
          return `\\log_{2}\\left(${argsTex[0]}\\right)`;
        }
        const command = LATEX_FUNCTION_MAP[name];
        if (command) {
          if (command === '\\sum' || command === '\\prod') {
            return `${command}${joinArgsAsGroup(argsTex)}`;
          }
          return `${command}${joinArgsAsGroup(argsTex)}`;
        }
        const escaped = escapeLatexIdentifier(name);
        return `\\operatorname{${escaped}}${joinArgsAsGroup(argsTex)}`;
      }
    };

    function setPlainMathContent(target, text){
      if (!target) return;
      target.innerHTML = '';
      target.textContent = text ?? '';
      if (target.dataset) {
        delete target.dataset.tex;
      }
    }

    function renderMathContent(target, tex, fallback){
      if (!target) return;
      if (!tex) {
        setPlainMathContent(target, fallback ?? '');
        return;
      }
      setPlainMathContent(target, fallback ?? '');
      if (target.dataset) {
        target.dataset.tex = tex;
      }
      ensureMathJax()
        .then(mjx => {
          if (!mjx || (target.dataset && target.dataset.tex !== tex)) return;
          const renderPromise = mjx.tex2chtmlPromise
            ? mjx.tex2chtmlPromise(tex, { display: false })
            : mjx.tex2chtml
              ? Promise.resolve(mjx.tex2chtml(tex, { display: false }))
              : mjx.tex2svgPromise
                ? mjx.tex2svgPromise(tex, { display: false })
                : mjx.tex2svg
                  ? Promise.resolve(mjx.tex2svg(tex, { display: false }))
                  : null;
          if (!renderPromise) return;
          return renderPromise.then(node => {
            if (target.dataset && target.dataset.tex !== tex) return;
            if (!node) return;
            target.innerHTML = '';
            target.appendChild(node);
            if (mjx.startup?.document) {
              mjx.startup.document.clear();
              mjx.startup.document.updateDocument();
            }
          });
        })
        .catch(() => {
          if (target.dataset && target.dataset.tex === tex) {
            setPlainMathContent(target, fallback ?? tex);
            delete target.dataset.tex;
          }
        });
    }

    function tryGenerateTexFromExpression(text){
      if (!text) return null;
      if (!math || typeof math.parse !== 'function') return null;
      const ascii = convertPrettyToAscii(text);
      if (!ascii) return null;
      try {
        const node = math.parse(ascii);
        return node.toTex({ parenthesis: 'auto', implicit: 'hide', handler: TEX_HANDLERS });
      } catch {
        return null;
      }
    }

    function renderSymbolicTextInto(target, text, placeholder = '—'){
      if (!target) return;
      if (text == null) {
        setPlainMathContent(target, placeholder);
        return;
      }
      const displayText = String(text);
      const trimmed = displayText.trim();
      if (!trimmed) {
        setPlainMathContent(target, placeholder);
        return;
      }
      const tex = tryGenerateTexFromExpression(displayText);
      if (tex) {
        renderMathContent(target, tex, displayText);
      } else {
        setPlainMathContent(target, displayText);
      }
    }

    function updateExpressionPreview(){
      if (!expressionPreviewEl) return;
      const source = expressionMode === 'pretty'
        ? (expressionInputPretty?.value || '')
        : (expressionInputClassic?.value || '');
      const trimmed = source.trim();
      if (!trimmed) {
        expressionPreviewEl.style.opacity = '0.65';
        const placeholder = expressionPreviewPlaceholder || placeholderText('preview.expression', '（入力中の式がここに可視化されます）');
        setPlainMathContent(expressionPreviewEl, placeholder);
        return;
      }
      const displayText = expressionMode === 'pretty'
        ? source
        : convertAsciiToPretty(source);
      expressionPreviewEl.style.opacity = '1';
      renderSymbolicTextInto(expressionPreviewEl, displayText, displayText);
    }

    function renderSymbolicResult(text){
      if (!exactResultEl) return;
      if (!text) {
        setPlainMathContent(exactResultEl, '—');
        return;
      }
      renderSymbolicTextInto(exactResultEl, text, '—');
    }

    function updateVariables(){
      if (!variableList) return;
      variableList.innerHTML = '';
      Object.keys(scope)
        .filter(key => key !== 'ans')
        .forEach(key => {
          const row = document.createElement('div');
          row.textContent = `${key} = ${formatValue(scope[key])}`;
          variableList.appendChild(row);
        });
      if (variableList.childElementCount === 0) {
        const empty = document.createElement('div');
        empty.textContent = uiText('variables.empty', '（変数は未定義）');
        empty.style.color = '#94a3b8';
        variableList.appendChild(empty);
      }
    }

    function updateHistory(){
      if (!historyBody) return;
      historyBody.innerHTML = '';
      history.slice(-80).forEach(item => {
        const exprCell = document.createElement('div');
        exprCell.textContent = item.expr;
        exprCell.style.opacity = '0.85';
        const resultCell = document.createElement('div');
        if (resultMode === 'numeric') {
          setPlainMathContent(resultCell, item.approx ?? '—');
          resultCell.style.fontFamily = '"Fira Code", monospace';
        } else {
          renderSymbolicTextInto(resultCell, item.symbolic ?? '—', '—');
          resultCell.style.fontFamily = 'inherit';
        }
        historyBody.appendChild(exprCell);
        historyBody.appendChild(resultCell);
      });
      if (historyBody.childElementCount === 0) {
        const placeholder = document.createElement('div');
        placeholder.textContent = uiText('history.empty', 'ここに計算履歴が表示されます。');
        placeholder.style.color = '#94a3b8';
        historyBody.appendChild(placeholder);
      }
    }

    function clearWorksheet(){
      if (expressionInputClassic) expressionInputClassic.value = '';
      if (expressionInputPretty) expressionInputPretty.value = '';
      setResults(null, null);
      updateExpressionPreview();
      notifyStatusKey('worksheetCleared', 'ワークシートをクリアしました。');
    }

    function setResults(exact, approx){
      if (!exactResultEl || !approxResultEl) return;
      if (exact == null) {
        setPlainMathContent(exactResultEl, '—');
        setPlainMathContent(approxResultEl, '—');
        delete exactResultEl.dataset.rawValue;
        delete approxResultEl.dataset.rawValue;
        approxRawValue = null;
        approxManualText = null;
        approxDigitsShown = DEFAULT_DECIMAL_DIGITS;
        approxHasMoreDigits = false;
        approxForceEllipsis = false;
        latestHistoryEntry = null;
        lastSymbolicRaw = null;
        if (moreDigitsButton) moreDigitsButton.style.display = 'none';
        updateResultDisplay();
        return;
      }
      const symbolicText = exact ?? '—';
      lastSymbolicRaw = symbolicText;
      exactResultEl.dataset.rawValue = symbolicText;
      renderSymbolicResult(symbolicText);
      approxDigitsShown = DEFAULT_DECIMAL_DIGITS;
      approxHasMoreDigits = false;
      approxForceEllipsis = false;
      if (typeof approx === 'string') {
        approxManualText = approx ?? '—';
        approxRawValue = null;
      } else if (canUseDynamicDigits(approx)) {
        approxManualText = null;
        approxRawValue = approx;
      } else {
        approxManualText = formatApproxValue(approx);
        approxRawValue = null;
      }
      updateResultDisplay();
    }

    function drawGraph(points, xRange, yRange){
      const ctx = graphCanvas.getContext('2d');
      ctx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
      const width = graphCanvas.width;
      const height = graphCanvas.height;
      ctx.fillStyle = 'rgba(8,11,23,0.9)';
      ctx.fillRect(0, 0, width, height);

      const xMin = xRange[0];
      const xMax = xRange[1];
      const yMin = yRange[0];
      const yMax = yRange[1];

      const xZero = (0 - xMin) / (xMax - xMin) * width;
      const yZero = height - ((0 - yMin) / (yMax - yMin) * height);

      ctx.strokeStyle = 'rgba(148,163,184,0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, yZero);
      ctx.lineTo(width, yZero);
      ctx.moveTo(xZero, 0);
      ctx.lineTo(xZero, height);
      ctx.stroke();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      points.forEach((pt, idx) => {
        const px = (pt.x - xMin) / (xMax - xMin) * width;
        const py = height - ((pt.y - yMin) / (yMax - yMin) * height);
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
    }

    const FRACTION_CHAR_MAP = {
      '½': '1/2', '⅓': '1/3', '⅔': '2/3', '¼': '1/4', '¾': '3/4',
      '⅕': '1/5', '⅖': '2/5', '⅗': '3/5', '⅘': '4/5',
      '⅙': '1/6', '⅚': '5/6', '⅛': '1/8', '⅜': '3/8', '⅝': '5/8', '⅞': '7/8'
    };

    const SUPERSCRIPT_DIGITS = {
      '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
      '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
      '⁺': '+', '⁻': '-'
    };

    const LANCZOS_COEFFS = [
      0.99999999999980993,
      676.5203681218851,
      -1259.1392167224028,
      771.32342877765313,
      -176.61502916214059,
      12.507343278686905,
      -0.13857109526572012,
      9.9843695780195716e-6,
      1.5056327351493116e-7
    ];

    function convertPrettyToAscii(input){
      if (input == null) return '';
      let expr = String(input);
      expr = expr.replace(/\r/g, '');
      Object.entries(FRACTION_CHAR_MAP).forEach(([char, value]) => {
        expr = expr.split(char).join(value);
      });
      expr = expr.replace(/([A-Za-z0-9_\)\]])([⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+)/g, (_, base, supers) => {
        const digits = supers.split('').map(ch => SUPERSCRIPT_DIGITS[ch] ?? '').join('');
        if (!digits) return base;
        return base + '^' + (digits.length > 1 ? `(${digits})` : digits);
      });
      expr = expr.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]/g, ch => SUPERSCRIPT_DIGITS[ch] ?? '');
      expr = expr
        .replace(/[×∙·]/g, '*')
        .replace(/[÷∕]/g, '/')
        .replace(/[−–—]/g, '-')
        .replace(/√\s*\(([^)]+)\)/g, 'sqrt($1)')
        .replace(/√\s*([A-Za-z0-9_πΠｅℯφΦ\.]+)/g, 'sqrt($1)')
        .replace(/∛\s*\(([^)]+)\)/g, 'nthRoot($1,3)')
        .replace(/∛\s*([A-Za-z0-9_πΠｅℯφΦ\.]+)/g, 'nthRoot($1,3)')
        .replace(/∜\s*\(([^)]+)\)/g, 'nthRoot($1,4)')
        .replace(/∜\s*([A-Za-z0-9_πΠｅℯφΦ\.]+)/g, 'nthRoot($1,4)');
      expr = expr.replace(/[πΠ]/g, 'pi');
      expr = expr.replace(/[ｅℯ]/g, 'e');
      expr = expr.replace(/[φΦ]/g, '(1+sqrt(5))/2');
      expr = expr.replace(/\u2044/g, '/');
      expr = expr.replace(/\s+/g, ' ');
      return expr.trim();
    }

    function beautifySymbols(value){
      if (value == null) return '';
      let output = String(value);
      output = output.replace(/nthRoot\(([^,]+),\s*2\)/g, '√($1)');
      output = output.replace(/nthRoot\(([^,]+),\s*3\)/g, '∛($1)');
      output = output.replace(/nthRoot\(([^,]+),\s*4\)/g, '∜($1)');
      output = output.replace(/\bpi\b/g, 'π');
      output = output.replace(/sqrt\(/g, '√(');
      output = output.replace(/\bphi\b/g, 'φ');
      output = output.replace(/\*/g, '·');
      output = output.replace(/\s*\/\s*/g, '/');
      return output;
    }

    function convertAsciiToPretty(input){
      if (input == null) return '';
      return beautifySymbols(input);
    }

    function cloneExpressionNode(node){
      if (!node) return node;
      if (typeof node.cloneDeep === 'function') {
        return node.cloneDeep();
      }
      if (typeof node.clone === 'function') {
        return node.clone();
      }
      return node;
    }

    function unwrapParenthesisNode(node){
      let current = node;
      while (current && (math?.isParenthesisNode?.(current) || mathRef?.isParenthesisNode?.(current)) && current.content) {
        current = current.content;
      }
      return current;
    }

    function nodeToCompactString(node){
      if (!node) return '';
      try {
        const text = node.toString({ parenthesis: 'auto' });
        return typeof text === 'string' ? text.replace(/\s+/g, '') : '';
      } catch {
        try {
          return String(node).replace(/\s+/g, '');
        } catch {
          return '';
        }
      }
    }

    function extractPositiveInteger(node){
      const cleaned = nodeToCompactString(unwrapParenthesisNode(node));
      if (/^[+]?[0-9]+$/.test(cleaned)) {
        const parsed = Number(cleaned);
        if (Number.isFinite(parsed) && parsed >= 0) {
          return parsed;
        }
      }
      return null;
    }

    function isConstantOneNode(node){
      const cleaned = nodeToCompactString(unwrapParenthesisNode(node));
      return cleaned === '1' || cleaned === '+1';
    }

    function detectNthRootDegree(exponentNode){
      if (!exponentNode) return null;
      const exponent = unwrapParenthesisNode(exponentNode);
      if (!exponent) return null;
      const cleaned = nodeToCompactString(exponent);
      if (!cleaned) return null;
      if (cleaned === '1/2' || cleaned === '0.5') {
        return 2;
      }
      const fractionMatch = cleaned.match(/^1\/\(?(-?\d+)\)?$/);
      if (fractionMatch) {
        const denom = Number(fractionMatch[1]);
        if (Number.isFinite(denom) && denom > 0) {
          return denom;
        }
      }
      if ((math?.isOperatorNode?.(exponent) || mathRef?.isOperatorNode?.(exponent)) && exponent.op === '/' && Array.isArray(exponent.args) && exponent.args.length === 2) {
        const [numerator, denominator] = exponent.args;
        if (isConstantOneNode(numerator)) {
          const denom = extractPositiveInteger(denominator);
          if (denom) return denom;
        }
      }
      return null;
    }

    function asLogFunctionNode(node){
      const inner = unwrapParenthesisNode(node);
      if (!inner) return null;
      if ((math?.isFunctionNode?.(inner) || mathRef?.isFunctionNode?.(inner)) && inner.name === 'log' && Array.isArray(inner.args) && inner.args.length === 1) {
        return inner;
      }
      return null;
    }

    function isEulerConstantNode(node){
      const inner = unwrapParenthesisNode(node);
      if (!inner) return false;
      if ((math?.isSymbolNode?.(inner) || mathRef?.isSymbolNode?.(inner)) && inner.name === 'e') {
        return true;
      }
      const cleaned = nodeToCompactString(inner);
      return cleaned === 'e' || cleaned === 'ℯ';
    }

    function restoreSpecialFunctionNodes(node){
      if (!node || typeof node.transform !== 'function') return node;
      const FunctionNodeCtor = mathRef?.FunctionNode || math?.FunctionNode;
      const ConstantNodeCtor = mathRef?.ConstantNode || math?.ConstantNode;
      if (!FunctionNodeCtor || !ConstantNodeCtor) return node;
      const isOperatorNode = (value) => math?.isOperatorNode?.(value) || mathRef?.isOperatorNode?.(value);
      const isFunctionNode = (value) => math?.isFunctionNode?.(value) || mathRef?.isFunctionNode?.(value);
      return node.transform(child => {
        if (!child) return child;
        if (isOperatorNode(child) && child.op === '^' && Array.isArray(child.args) && child.args.length === 2) {
          const [baseNode, exponentNode] = child.args;
          const degree = detectNthRootDegree(exponentNode);
          if (degree === 2) {
            return new FunctionNodeCtor('sqrt', [cloneExpressionNode(baseNode)]);
          }
          if (degree != null) {
            return new FunctionNodeCtor('nthRoot', [cloneExpressionNode(baseNode), new ConstantNodeCtor(degree)]);
          }
        }
        if (isFunctionNode(child) && child.name === 'pow' && Array.isArray(child.args) && child.args.length === 2) {
          const [baseNode, exponentNode] = child.args;
          const degree = detectNthRootDegree(exponentNode);
          if (degree === 2) {
            return new FunctionNodeCtor('sqrt', [cloneExpressionNode(baseNode)]);
          }
          if (degree != null) {
            return new FunctionNodeCtor('nthRoot', [cloneExpressionNode(baseNode), new ConstantNodeCtor(degree)]);
          }
        }
        if (isOperatorNode(child) && child.op === '/' && Array.isArray(child.args) && child.args.length === 2) {
          const numeratorLog = asLogFunctionNode(child.args[0]);
          const denominatorLog = asLogFunctionNode(child.args[1]);
          if (numeratorLog && denominatorLog) {
            const argNode = cloneExpressionNode(numeratorLog.args[0]);
            const baseNode = cloneExpressionNode(denominatorLog.args[0]);
            if (isEulerConstantNode(baseNode)) {
              return new FunctionNodeCtor('ln', [argNode]);
            }
            return new FunctionNodeCtor('log', [argNode, baseNode]);
          }
        }
        if (isFunctionNode(child) && child.name === 'log' && Array.isArray(child.args) && child.args.length === 2) {
          if (isEulerConstantNode(child.args[1])) {
            return new FunctionNodeCtor('ln', [cloneExpressionNode(child.args[0])]);
          }
        }
        return child;
      });
    }

    function convertForNumeric(value){
      if (value == null) return value;
      if (!mathRef) return value;
      if (mathRef.isFraction && mathRef.isFraction(value)) {
        try { return numericMath?.bignumber ? numericMath.bignumber(value.valueOf()) : value.valueOf(); }
        catch { return value.valueOf(); }
      }
      if (mathRef.isBigNumber && mathRef.isBigNumber(value)) {
        try { return numericMath?.bignumber ? numericMath.bignumber(value.toString()) : value.toNumber(); }
        catch { return value.toNumber(); }
      }
      if (mathRef.isComplex && mathRef.isComplex(value)) {
        const re = convertForNumeric(value.re);
        const im = convertForNumeric(value.im);
        if (numericMath && numericMath.complex) return numericMath.complex(re, im);
        return { re, im };
      }
      if (mathRef.isMatrix && mathRef.isMatrix(value)) {
        return value.toArray().map(item => convertForNumeric(item));
      }
      if (mathRef.isUnit && mathRef.isUnit(value)) {
        return typeof value.clone === 'function' ? value.clone() : value;
      }
      if (Array.isArray(value)) {
        return value.map(item => convertForNumeric(item));
      }
      if (typeof value === 'object') {
        return value;
      }
      if (numericMath?.bignumber && typeof value === 'number' && Number.isFinite(value)) {
        try { return numericMath.bignumber(value); } catch { return value; }
      }
      return value;
    }

    function buildNumericScope(source){
      const target = Object.create(null);
      if (!source) return target;
      Object.keys(source).forEach(key => {
        target[key] = convertForNumeric(source[key]);
      });
      return target;
    }

    function formatApproxValue(value){
      if (value == null) return 'null';
      if (!numericMath) return beautifySymbols(String(value));
      if (numericMath.isMatrix && numericMath.isMatrix(value)) {
        return value.toString();
      }
      if (numericMath.isUnit && numericMath.isUnit(value)) {
        return value.toString();
      }
      if (numericMath.isFraction && numericMath.isFraction(value)) {
        return numericMath.format(value.valueOf(), { precision: 14 });
      }
      if (numericMath.isBigNumber && numericMath.isBigNumber(value)) {
        return numericMath.format(value, { precision: 14 });
      }
      if (numericMath.isComplex && numericMath.isComplex(value)) {
        const reNum = typeof value.re === 'number' ? value.re : numericMath.number ? numericMath.number(value.re) : Number(value.re);
        const imNum = typeof value.im === 'number' ? value.im : numericMath.number ? numericMath.number(value.im) : Number(value.im);
        const reStr = numericMath.format(reNum, { precision: 12 });
        const imAbs = Math.abs(imNum);
        if (imAbs < 1e-14) {
          return reStr;
        }
        const imStr = numericMath.format(imAbs, { precision: 12 });
        const sign = imNum >= 0 ? '+' : '−';
        return `${reStr} ${sign} ${imStr}i`;
      }
      if (Array.isArray(value)) {
        return `[${value.map(formatApproxValue).join(', ')}]`;
      }
      if (typeof value === 'number') {
        return numericMath.format(value, { precision: 14 });
      }
      try {
        return numericMath.format(value, { precision: 14 });
      } catch {
        return beautifySymbols(String(value));
      }
    }

    function canUseDynamicDigits(value){
      if (value == null || !numericMath) return false;
      if (typeof value === 'number') return Number.isFinite(value);
      if (math?.isFraction?.(value)) return true;
      if (math?.isBigNumber?.(value)) return true;
      if (numericMath.isBigNumber?.(value)) return true;
      return false;
    }

    function coerceToBigNumber(value){
      if (!numericMath) return null;
      if (numericMath.isBigNumber?.(value)) return value;
      if (math?.isBigNumber?.(value)) {
        try { return numericMath.bignumber(value.toNumber()); } catch { return null; }
      }
      if (math?.isFraction?.(value)) {
        try { return numericMath.bignumber(value.valueOf()); } catch { return null; }
      }
      if (typeof value === 'number') {
        if (!Number.isFinite(value)) return null;
        try { return numericMath.bignumber(value); } catch { return null; }
      }
      return null;
    }

    function normalizeFixedDecimal(str){
      if (typeof str !== 'string') return str;
      if (!str.includes('.')) return str;
      let cleaned = str.replace(/(\.\d*?[1-9])0+$/, '$1');
      cleaned = cleaned.replace(/\.0+$/, '');
      return cleaned;
    }

    function formatDecimalWithDigits(value, digits){
      const bn = coerceToBigNumber(value);
      if (!bn) return null;
      const precision = Math.max(1, Math.min(MAX_DECIMAL_DIGITS, Math.max(digits | 0, 1)));
      const options = { notation: 'fixed', precision, lowerExp: -200, upperExp: 200 };
      try {
        return normalizeFixedDecimal(numericMath.format(bn, options));
      } catch (err) {
        try {
          return normalizeFixedDecimal(numericMath.format(bn, { precision }));
        } catch {
          return null;
        }
      }
    }

    function computeApproxDisplay(value, digits){
      const base = formatDecimalWithDigits(value, digits);
      if (!base) {
        return { baseText: formatApproxValue(value), hasMore: false, hasDecimal: false, fractionLength: 0 };
      }
      let hasMore = false;
      if (digits < MAX_DECIMAL_DIGITS) {
        const extended = formatDecimalWithDigits(value, Math.min(MAX_DECIMAL_DIGITS, digits + DECIMAL_DIGIT_STEP));
        hasMore = !!extended && extended !== base;
      }
      const hasDecimal = base.includes('.');
      return { baseText: base, hasMore, hasDecimal };
    }

    function updateApproxDisplay(){
      if (!approxResultEl) return;
      if (approxManualText != null) {
        approxResultEl.textContent = approxManualText;
        approxResultEl.dataset.rawValue = approxManualText;
        approxHasMoreDigits = false;
        if (moreDigitsButton) moreDigitsButton.style.display = 'none';
        return;
      }
      if (approxRawValue == null) {
        approxResultEl.textContent = '—';
        approxResultEl.dataset.rawValue = '—';
        approxHasMoreDigits = false;
        if (moreDigitsButton) moreDigitsButton.style.display = 'none';
        return;
      }
      const digits = Math.max(DEFAULT_DECIMAL_DIGITS, Math.min(MAX_DECIMAL_DIGITS, approxDigitsShown | 0));
      const { baseText, hasMore, hasDecimal } = computeApproxDisplay(approxRawValue, digits);
      const canIncreaseDigits = digits < MAX_DECIMAL_DIGITS;
      if (hasMore) approxForceEllipsis = true;
      const showEllipsis = hasMore || (approxForceEllipsis && hasDecimal);
      const displayText = showEllipsis ? `${baseText}...` : baseText;
      approxResultEl.textContent = displayText;
      approxResultEl.dataset.rawValue = displayText;
      approxHasMoreDigits = hasMore || canIncreaseDigits;
      if (moreDigitsButton) {
        if (resultMode === 'numeric' && canIncreaseDigits) {
          moreDigitsButton.style.display = 'inline-flex';
          moreDigitsButton.disabled = false;
        } else {
          moreDigitsButton.style.display = 'none';
        }
      }
    }

    function toNumber(value){
      if (mathRef && mathRef.isUnit && mathRef.isUnit(value)) {
        const json = typeof value.toJSON === 'function' ? value.toJSON() : null;
        if (json && json.unit) {
          try {
            return ensureFiniteNumber(value.toNumber(json.unit));
          } catch {}
        }
        if (typeof value.toSI === 'function') {
          const si = value.toSI();
          if (si && typeof si.valueOf === 'function') {
            return ensureFiniteNumber(si.valueOf());
          }
        }
        const err = new Error(errorText('graphUnitsUnsupported', '単位付きの値はグラフ化できません。'));
        err.code = 'UNIT';
        throw err;
      }
      return ensureFiniteNumber(value);
    }

    function formatValue(value){
      if (value == null) return 'null';
      if (!math) return String(value);
      if (math.isMatrix && math.isMatrix(value)) {
        return value.toString();
      }
      if (math.isUnit && math.isUnit(value)) {
        return value.toString();
      }
      if (math.isComplex && math.isComplex(value)) {
        return value.toString();
      }
      if (math.isBigNumber && math.isBigNumber(value)) {
        return value.toString();
      }
      if (math.isFraction && math.isFraction(value)) {
        return beautifySymbols(value.toFraction(false));
      }
      if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'string') {
        return beautifySymbols(String(value));
      }
      if (Array.isArray(value)) {
        return `[${value.map(formatValue).join(', ')}]`;
      }
      if (typeof value === 'object' && value !== null) {
        return beautifySymbols(JSON.stringify(value));
      }
      return beautifySymbols(String(value));
    }

    function computeTetration(base, height){
      const b = Number(math ? math.number(base) : Number(base));
      const h = Number(math ? math.number(height) : Number(height));
      if (!Number.isFinite(b) || !Number.isFinite(h)) {
        throw new Error(errorText('tetraRealOnly', 'tetra は実数引数にのみ対応します。'));
      }
      if (h === 0) return 1;
      if (h < 0) {
        return 1 / computeTetration(b, -h);
      }
      const integerPart = Math.floor(h);
      const fracPart = h - integerPart;
      let current;
      if (integerPart === 0) {
        current = 1;
      } else {
        current = b;
        for (let i = 1; i < integerPart; i++) {
          current = Math.pow(b, current);
          if (!Number.isFinite(current)) break;
        }
      }
      if (fracPart === 0 || !Number.isFinite(current)) return current;
      const next = Math.pow(b, current);
      if (!Number.isFinite(next) || current <= 0 || next <= 0) {
        return current + (next - current) * fracPart;
      }
      const logInterp = Math.exp(Math.log(current) * (1 - fracPart) + Math.log(next) * fracPart);
      return logInterp;
    }

    function computeSlog(base, value){
      const b = Number(math ? math.number(base) : Number(base));
      const v = Number(math ? math.number(value) : Number(value));
      if (!Number.isFinite(b) || !Number.isFinite(v) || b <= 0) {
        throw new Error(errorText('slogPositiveBase', 'slog は正の底と実数値に対応します。'));
      }
      if (Math.abs(b - 1) < 1e-8) {
        throw new Error(errorText('slogBaseSeparated', 'slog の底は 1 から十分に離れた値を指定してください。'));
      }
      if (v <= 0) return NaN;
      if (v === 1) return 0;
      let height = 0;
      let current = v;
      const limit = 64;
      while (current > Math.E && height < limit) {
        current = Math.log(current) / Math.log(b);
        height += 1;
      }
      if (current <= 0) return height;
      const frac = Math.log(current) / Math.log(b);
      return height + frac;
    }

    function computeTaylorSeries(expr, variable = 'x', order = 5, center = 0){
      const varName = String(variable);
      const n = Math.max(0, Math.min(32, Math.floor(order)));
      const a = Number(center);
      const expression = compileExpression(expr);
      let derivative = expression;
      const baseScope = cloneScope(scope);
      baseScope[varName] = a;
      const terms = [];
      for (let k = 0; k <= n; k++) {
        const value = ensureFiniteNumber(derivative.evaluate(baseScope));
        const coeff = value / math.factorial(k);
        terms.push({ k, coeff });
        derivative = math.derivative(derivative, varName);
      }
      const formattedTerms = terms.map(term => {
        const coeffStr = math.format(term.coeff, { precision: 12 });
        if (term.k === 0) return coeffStr;
        const base = a === 0 ? varName : `(${varName} - (${math.format(a, { precision: 12 })}))`;
        const power = term.k === 1 ? '' : `^${term.k}`;
        return `${coeffStr} * ${base}${power}`;
      });
      return formattedTerms.join(' + ');
    }

    function adaptiveSimpson(fn, a, b, eps, maxDepth){
      const f = fn;
      function simpson(l, r){
        const m = (l + r) / 2;
        return (r - l) / 6 * (f(l) + 4 * f(m) + f(r));
      }
      function recurse(l, r, epsLocal, whole, depth){
        const m = (l + r) / 2;
        const left = simpson(l, m);
        const right = simpson(m, r);
        const delta = left + right - whole;
        if (depth <= 0 || Math.abs(delta) < 15 * epsLocal) {
          return left + right + delta / 15;
        }
        return recurse(l, m, epsLocal / 2, left, depth - 1) + recurse(m, r, epsLocal / 2, right, depth - 1);
      }
      const initial = simpson(a, b);
      return recurse(a, b, eps, initial, maxDepth);
    }

    function normalizeVariableName(variable){
      if (variable == null) return 'x';
      if (typeof variable === 'string') return variable;
      if (mathRef?.isSymbolNode?.(variable) || math?.isSymbolNode?.(variable)) {
        return variable.name;
      }
      if (variable && typeof variable.name === 'string') {
        return variable.name;
      }
      if (variable && typeof variable.evaluate === 'function') {
        try {
          const evaluated = variable.evaluate(scope);
          if (typeof evaluated === 'string') {
            return evaluated;
          }
        } catch {}
      }
      return String(variable);
    }

    function evaluateMathArgument(arg){
      if (arg == null) return arg;
      if (mathRef?.isNode?.(arg) || math?.isNode?.(arg)) {
        try { return arg.evaluate(scope); } catch {}
      }
      if (arg && typeof arg.evaluate === 'function') {
        try { return arg.evaluate(scope); } catch {}
      }
      return arg;
    }

    function nodeToAscii(node){
      if (!node) return '';
      if (typeof node.toString === 'function') {
        try { return node.toString({ parenthesis: 'auto' }); }
        catch { return String(node); }
      }
      return String(node);
    }

    function nodeDependsOnVariable(node, variable){
      if (!node) return false;
      if (math?.isSymbolNode?.(node) || mathRef?.isSymbolNode?.(node)) {
        return node.name === variable;
      }
      if (math?.isConstantNode?.(node) || mathRef?.isConstantNode?.(node)) {
        return false;
      }
      if (math?.isParenthesisNode?.(node) || mathRef?.isParenthesisNode?.(node)) {
        return nodeDependsOnVariable(node.content, variable);
      }
      if (Array.isArray(node.args)) {
        return node.args.some(child => nodeDependsOnVariable(child, variable));
      }
      if (node.content) {
        return nodeDependsOnVariable(node.content, variable);
      }
      return false;
    }

    function tryEvaluateNumericNode(node){
      if (!node) return null;
      try {
        if (typeof node.evaluate === 'function') {
          const value = node.evaluate(scope);
          return ensureFiniteNumber(value);
        }
      } catch {}
      try {
        const text = nodeToAscii(node);
        if (text) {
          const value = math ? math.evaluate(text, scope) : null;
          if (value != null) {
            return ensureFiniteNumber(value);
          }
        }
      } catch {}
      return null;
    }

    function isApproximatelyValue(node, expected){
      const num = tryEvaluateNumericNode(node);
      if (num == null) return false;
      return Math.abs(num - expected) < 1e-12;
    }

    function isZeroNode(node){
      return isApproximatelyValue(node, 0);
    }

    function isOneNode(node){
      return isApproximatelyValue(node, 1);
    }

    function isNegativeOneNode(node){
      return isApproximatelyValue(node, -1);
    }

    function wrapTerm(expr){
      if (expr == null) return '';
      const text = String(expr).trim();
      if (!text) return '';
      if (/^[A-Za-z0-9_\.]+$/.test(text)) return text;
      if (text.startsWith('(') && text.endsWith(')')) return text;
      return `(${text})`;
    }

    function negateExpression(expr){
      const text = String(expr).trim();
      if (!text) return '0';
      if (text.startsWith('-')) return text.slice(1);
      return `-(${text})`;
    }

    function multiplyExpressions(a, b){
      const left = String(a ?? '').trim();
      const right = String(b ?? '').trim();
      if (!left || left === '0' || left === '-0') return '0';
      if (!right || right === '0' || right === '-0') return '0';
      if (left === '1') return right;
      if (right === '1') return left;
      if (left === '-1') return negateExpression(right);
      if (right === '-1') return negateExpression(left);
      return `${wrapTerm(left)} * ${wrapTerm(right)}`;
    }

    function divideExpressions(numerator, denominator){
      const top = String(numerator ?? '').trim();
      const bottom = String(denominator ?? '').trim();
      if (!bottom || bottom === '0' || bottom === '-0') {
        throw new Error(errorText('divideByZero', '0 で割ることはできません。'));
      }
      if (!top || top === '0' || top === '-0') return '0';
      if (bottom === '1') return top;
      if (bottom === '-1') return negateExpression(top);
      return `${wrapTerm(top)} / ${wrapTerm(bottom)}`;
    }

    function addExpressions(parts){
      return parts.filter(part => part != null && String(part).trim() !== '')
        .map(part => wrapTerm(part))
        .join(' + ');
    }

    function subtractExpressions(first, rest){
      const head = String(first ?? '').trim();
      const tail = String(rest ?? '').trim();
      if (!head && !tail) return '';
      if (!tail) return head;
      if (!head) return negateExpression(tail);
      return `${wrapTerm(head)} - ${wrapTerm(tail)}`;
    }

    function splitProductArgs(args, variable){
      const constants = [];
      const dependents = [];
      args.forEach(arg => {
        if (nodeDependsOnVariable(arg, variable)) dependents.push(arg);
        else constants.push(arg);
      });
      return { constants, dependents };
    }

    function nodesToProductExpression(nodes){
      if (!nodes.length) return '1';
      return nodes.map(node => wrapTerm(nodeToAscii(node))).join(' * ');
    }

    function simplifyExpressionString(expr){
      if (!expr) return expr;
      if (!math || typeof math.simplify !== 'function') return expr;
      try {
        const simplified = math.simplify(expr, scope);
        const restored = restoreSpecialFunctionNodes(simplified);
        return restored.toString({ parenthesis: 'auto' });
      } catch {
        return expr;
      }
    }

    function safeDerivative(node, variable){
      if (!math || typeof math.derivative !== 'function') return null;
      try {
        return math.derivative(node, variable);
      } catch {
        return null;
      }
    }

    function applyChainRule(baseExpr, innerDerivative){
      if (!innerDerivative) return null;
      if (isZeroNode(innerDerivative)) return null;
      if (isOneNode(innerDerivative)) return baseExpr;
      if (isNegativeOneNode(innerDerivative)) return negateExpression(baseExpr);
      return divideExpressions(baseExpr, nodeToAscii(innerDerivative));
    }

    function integrateFunctionNode(node, variable){
      if (!node || typeof node.name !== 'string' || !Array.isArray(node.args) || !node.args.length) {
        return null;
      }
      const inner = node.args[0];
      if (!nodeDependsOnVariable(inner, variable)) {
        return null;
      }
      const derivative = safeDerivative(inner, variable);
      if (!derivative) return null;
      const innerStr = nodeToAscii(inner);
      let base;
      switch (node.name) {
        case 'sin':
          base = `-cos(${innerStr})`;
          break;
        case 'cos':
          base = `sin(${innerStr})`;
          break;
        case 'tan':
          base = `-log(abs(cos(${innerStr})))`;
          break;
        case 'cot':
          base = `log(abs(sin(${innerStr})))`;
          break;
        case 'sinh':
          base = `cosh(${innerStr})`;
          break;
        case 'cosh':
          base = `sinh(${innerStr})`;
          break;
        case 'tanh':
          base = `log(cosh(${innerStr}))`;
          break;
        case 'exp':
          base = `exp(${innerStr})`;
          break;
        default:
          return null;
      }
      const chained = applyChainRule(base, derivative);
      return chained ? chained : null;
    }

    function integratePower(baseNode, exponentNode, variable){
      if (!(math?.isSymbolNode?.(baseNode) || mathRef?.isSymbolNode?.(baseNode))) {
        return null;
      }
      if (baseNode.name !== variable) return null;
      if (nodeDependsOnVariable(exponentNode, variable)) return null;
      if (isNegativeOneNode(exponentNode)) {
        return `log(abs(${variable}))`;
      }
      const exponentStr = nodeToAscii(exponentNode);
      const evaluated = tryEvaluateNumericNode(exponentNode);
      if (evaluated != null && Math.abs(evaluated + 1) > 1e-12) {
        const next = evaluated + 1;
        const nextStr = math ? math.format(next, { precision: 12 }) : String(next);
        const numerator = `${wrapTerm(variable)}^${nextStr}`;
        return divideExpressions(numerator, nextStr);
      }
      return divideExpressions(`${wrapTerm(variable)}^(${exponentStr} + 1)`, `(${exponentStr} + 1)`);
    }

    function integrateNodeToString(node, variable){
      if (!node) return null;
      if (math?.isParenthesisNode?.(node) || mathRef?.isParenthesisNode?.(node)) {
        return integrateNodeToString(node.content, variable);
      }
      if (!nodeDependsOnVariable(node, variable)) {
        const constantExpr = nodeToAscii(node);
        if (!constantExpr || constantExpr === '0' || constantExpr === '-0') {
          return '0';
        }
        return multiplyExpressions(constantExpr, variable);
      }
      if ((math?.isSymbolNode?.(node) || mathRef?.isSymbolNode?.(node)) && node.name === variable) {
        return divideExpressions(`${wrapTerm(variable)}^2`, '2');
      }
      if (math?.isOperatorNode?.(node) || mathRef?.isOperatorNode?.(node)) {
        const fn = node.fn;
        if (fn === 'add') {
          const parts = node.args.map(arg => integrateNodeToString(arg, variable));
          if (parts.some(part => part == null)) return null;
          return addExpressions(parts);
        }
        if (fn === 'subtract') {
          const [left, right] = node.args;
          const leftExpr = integrateNodeToString(left, variable);
          const rightExpr = integrateNodeToString(right, variable);
          if (leftExpr == null || rightExpr == null) return null;
          return subtractExpressions(leftExpr, rightExpr);
        }
        if (fn === 'unaryMinus') {
          const inner = integrateNodeToString(node.args[0], variable);
          return inner == null ? null : negateExpression(inner);
        }
        if (fn === 'unaryPlus') {
          return integrateNodeToString(node.args[0], variable);
        }
        if (fn === 'multiply') {
          const { constants, dependents } = splitProductArgs(node.args, variable);
          if (!dependents.length) {
            const constExpr = nodesToProductExpression(node.args);
            return multiplyExpressions(constExpr, variable);
          }
          const constantExpr = nodesToProductExpression(constants);
          if (dependents.length === 1) {
            const dependentExpr = integrateNodeToString(dependents[0], variable);
            if (dependentExpr == null) return null;
            return multiplyExpressions(constantExpr, dependentExpr);
          }
          try {
            const dependentProduct = nodesToProductExpression(dependents);
            const dependentNode = math.parse(dependentProduct);
            const integrated = integrateNodeToString(dependentNode, variable);
            if (integrated == null) return null;
            return multiplyExpressions(constantExpr, integrated);
          } catch {
            return null;
          }
        }
        if (fn === 'divide') {
          const [numerator, denominator] = node.args;
          if (nodeDependsOnVariable(denominator, variable)) return null;
          const numeratorExpr = integrateNodeToString(numerator, variable);
          if (numeratorExpr == null) return null;
          return divideExpressions(numeratorExpr, nodeToAscii(denominator));
        }
        if (fn === 'pow') {
          const [baseNode, exponentNode] = node.args;
          return integratePower(baseNode, exponentNode, variable);
        }
      }
      if (math?.isFunctionNode?.(node) || mathRef?.isFunctionNode?.(node)) {
        return integrateFunctionNode(node, variable);
      }
      return null;
    }

    function integrateExpressionSymbolic(expr, variable = 'x'){
      if (!math) {
        throw new Error(errorText('integralNotReady', '数学エンジンの初期化を待ってから積分を実行してください。'));
      }
      const varName = normalizeVariableName(variable);
      const expressionNode = compileExpression(expr);
      const simplified = typeof math.simplify === 'function'
        ? math.simplify(expressionNode, scope)
        : expressionNode;
      const restored = restoreSpecialFunctionNodes(simplified);
      const result = integrateNodeToString(restored, varName);
      if (!result) {
        throw new Error(errorText('integralSymbolicFailed', '指定した式の解析的積分を求められませんでした。numericIntegrate を利用してください。'));
      }
      return simplifyExpressionString(result);
    }

    function numericIntegrate(expr, variable, lower, upper, options = {}){
      const varName = variable ? String(variable) : 'x';
      const node = compileExpression(expr);
      const a = Number(lower);
      const b = Number(upper);
      if (!Number.isFinite(a) || !Number.isFinite(b)) {
        throw new Error(errorText('integralRange', '積分範囲は有限の実数で指定してください。'));
      }
      const tol = Number(options.tolerance ?? 1e-8);
      const depth = Number(options.maxDepth ?? 10);
      const baseScope = cloneScope(scope);
      const lowerBound = Math.min(a, b);
      const upperBound = Math.max(a, b);
      const direction = a <= b ? 1 : -1;
      const fn = (x) => {
        const localScope = cloneScope(baseScope);
        localScope[varName] = x;
        const value = node.evaluate(localScope);
        return ensureFiniteNumber(value);
      };
      if (lowerBound === upperBound) return 0;
      const integral = adaptiveSimpson(fn, lowerBound, upperBound, tol, depth);
      return integral * direction;
    }

    function newtonSolve(expr, variable = 'x', guess = 0, options = {}){
      const varName = String(variable);
      const normalized = normalizeEquation(expr);
      const node = compileExpression(normalized);
      const derivative = math.derivative(node, varName);
      let x = Number(guess);
      if (!Number.isFinite(x)) throw new Error(errorText('newtonInitialValue', '初期値には有限の数値を指定してください。'));
      const maxIter = Number(options.maxIterations ?? 32);
      const tol = Number(options.tolerance ?? 1e-10);
      const snapshot = cloneScope(scope);
      for (let i = 0; i < maxIter; i++) {
        const local = cloneScope(snapshot);
        local[varName] = x;
        const fx = ensureFiniteNumber(node.evaluate(local));
        if (Math.abs(fx) < tol) return x;
        const dfx = ensureFiniteNumber(derivative.evaluate(local));
        if (!Number.isFinite(dfx) || Math.abs(dfx) < 1e-12) {
          throw new Error(errorText('newtonDerivativeZero', '導関数が 0 に近いためニュートン法が収束しません。'));
        }
        const next = x - fx / dfx;
        if (!Number.isFinite(next)) throw new Error(errorText('iterationDiverged', '反復計算が発散しました。'));
        if (Math.abs(next - x) < tol) return next;
        x = next;
      }
      throw new Error(errorText('iterationNotConverged', '指定した反復回数内に収束しませんでした。'));
    }

    function solveLinearSystem(matrix, vector){
      if (!math || typeof math.lusolve !== 'function') {
        throw new Error(errorText('linearSolverUnavailable', '線形方程式ソルバが利用できません。'));
      }
      const solved = math.lusolve(matrix, vector);
      if (Array.isArray(solved) && solved.length && Array.isArray(solved[0])) {
        return solved.map(row => ensureFiniteNumber(row[0]));
      }
      return solved;
    }

    function jacobian(nodes, variables){
      return nodes.map(node => variables.map(v => math.derivative(node, v)));
    }

    function newtonSystem(equations, variables, initialGuess = [], options = {}){
      if (!Array.isArray(equations) || !equations.length) {
        throw new Error(errorText('systemEquationsArray', '方程式の配列を渡してください。'));
      }
      if (!Array.isArray(variables) || variables.length !== equations.length) {
        throw new Error(errorText('systemVariableCount', '変数リストは方程式の数と一致している必要があります。'));
      }
      const varNames = variables.map(v => String(v));
      const nodes = equations.map(expr => compileExpression(normalizeEquation(expr)));
      const jacNodes = jacobian(nodes, varNames);
      const guess = initialGuess.length ? initialGuess.map(Number) : varNames.map(() => 0);
      const maxIter = Number(options.maxIterations ?? 24);
      const tol = Number(options.tolerance ?? 1e-9);
      const snapshot = cloneScope(scope);
      let current = guess.slice();
      const size = nodes.length;
      for (let iter = 0; iter < maxIter; iter++) {
        const local = cloneScope(snapshot);
        varNames.forEach((name, idx) => { local[name] = current[idx]; });
        const fValues = nodes.map(node => ensureFiniteNumber(node.evaluate(local)));
        if (fValues.every(val => Math.abs(val) < tol)) {
          const result = {};
          varNames.forEach((name, idx) => { result[name] = current[idx]; });
          return result;
        }
        const jacobianMatrix = jacNodes.map(row => row.map(cell => ensureFiniteNumber(cell.evaluate(local))));
        const delta = solveLinearSystem(jacobianMatrix, fValues.map(val => [val]));
        if (!Array.isArray(delta) || delta.length !== size) {
          throw new Error(errorText('jacobianSolveFailed', 'ヤコビ行列の解が取得できませんでした。'));
        }
        let diverged = false;
        for (let i = 0; i < size; i++) {
          const step = ensureFiniteNumber(delta[i][0]);
          const nextVal = current[i] - step;
          if (!Number.isFinite(nextVal)) {
            diverged = true;
            break;
          }
          current[i] = nextVal;
        }
        if (diverged) throw new Error(errorText('iterationDiverged', '反復計算が発散しました。'));
      }
      throw new Error(errorText('iterationNotConverged', '指定した反復回数内に収束しませんでした。'));
    }

    function optimize(expr, variable = 'x', guess = 0, options = {}, maximize = false){
      const varName = String(variable);
      const node = compileExpression(expr);
      const first = math.derivative(node, varName);
      const second = math.derivative(first, varName);
      const root = newtonSolve(first, varName, guess, options);
      const local = cloneScope(scope);
      local[varName] = root;
      const curvature = ensureFiniteNumber(second.evaluate(local));
      const curvatureTol = Math.abs(Number(options.curvatureTolerance ?? 1e-7));
      if (maximize && curvature > curvatureTol) {
        throw new Error(errorText('maximizeFoundMinimum', '指定の初期値付近では最大値ではなく最小値が見つかりました。'));
      }
      if (!maximize && curvature < -curvatureTol) {
        throw new Error(errorText('minimizeFoundMaximum', '指定の初期値付近では最小値ではなく最大値が見つかりました。'));
      }
      return { point: root, value: ensureFiniteNumber(node.evaluate(local)) };
    }

    function digammaReal(x){
      const value = Number(x);
      if (!Number.isFinite(value)) throw new Error(errorText('digammaFinite', 'digamma の引数は有限の実数で指定してください。'));
      if (value <= 0) throw new Error(errorText('digammaPositive', 'digamma は正の実数引数にのみ対応します。'));
      let result = 0;
      let z = value;
      while (z < 8) {
        result -= 1 / z;
        z += 1;
      }
      const inv = 1 / z;
      const inv2 = inv * inv;
      result += Math.log(z) - 0.5 * inv - inv2 * (1 / 12 - inv2 * (1 / 120 - inv2 * (1 / 252)));
      return result;
    }

    function polygammaReal(order, x){
      const m = Math.floor(Number(order));
      if (!Number.isFinite(m) || m < 0) {
        throw new Error(errorText('polygammaOrder', 'polygamma の階数は 0 以上の整数を指定してください。'));
      }
      if (m === 0) return digammaReal(x);
      const value = Number(x);
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error(errorText('polygammaPositive', 'polygamma は正の実数引数にのみ対応します。'));
      }
      const factorial = math.factorial(m);
      const sign = m % 2 === 0 ? -1 : 1;
      let sum = 0;
      let z = value;
      for (let i = 0; i < 6400; i++) {
        const term = 1 / Math.pow(z, m + 1);
        sum += term;
        if (term < 1e-12) break;
        z += 1;
      }
      if (z > value) {
        sum += 1 / (m * Math.pow(z, m));
      }
      return sign * factorial * sum;
    }

    function harmonicNumber(n, r = 1){
      const count = Math.floor(Number(n));
      if (!Number.isFinite(count) || count <= 0) {
        throw new Error(errorText('harmonicFirstArg', 'harmonic の第1引数には 1 以上の整数を指定してください。'));
      }
      const order = Number(r);
      if (!Number.isFinite(order) || order <= 0) {
        throw new Error(errorText('harmonicSecondArg', 'harmonic の第2引数には正の実数を指定してください。'));
      }
      let sum = 0;
      for (let k = 1; k <= count; k++) {
        sum += 1 / Math.pow(k, order);
      }
      return sum;
    }

    function riemannZeta(s, terms = 256){
      const sigma = Number(s);
      if (!Number.isFinite(sigma)) {
        throw new Error(errorText('zetaFinite', 'zeta の引数は有限の実数で指定してください。'));
      }
      if (sigma === 1) {
        throw new Error(errorText('zetaOneDiverges', 'zeta(1) は発散します。'));
      }
      if (sigma <= 0) {
        throw new Error(errorText('zetaPositiveRegion', 'この簡易実装では実部が正の領域でのみ定義されています。'));
      }
      const nTerms = Math.max(32, Math.min(8192, Math.floor(Number(terms)) || 0));
      let eta = 0;
      let sign = 1;
      for (let n = 1; n <= nTerms; n++) {
        eta += sign / Math.pow(n, sigma);
        sign *= -1;
      }
      const pow = Math.pow(2, 1 - sigma);
      const zeta = eta / (1 - pow);
      return zeta;
    }

    function logGammaReal(z){
      const value = Number(z);
      if (!Number.isFinite(value)) throw new Error(errorText('logGammaFinite', 'logGamma の引数は有限の実数で指定してください。'));
      if (value <= 0) throw new Error(errorText('logGammaPositive', 'logGamma は正の実数引数にのみ対応します。'));
      if (value < 0.5) {
        return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * value)) - logGammaReal(1 - value);
      }
      let sum = LANCZOS_COEFFS[0];
      const v = value - 1;
      for (let i = 1; i < LANCZOS_COEFFS.length; i++) {
        sum += LANCZOS_COEFFS[i] / (v + i);
      }
      const t = v + LANCZOS_COEFFS.length - 0.5;
      return 0.5 * Math.log(2 * Math.PI) + (v + 0.5) * Math.log(t) - t + Math.log(sum);
    }

    function gammaReal(z){
      const value = Number(z);
      if (!Number.isFinite(value)) throw new Error(errorText('gammaFinite', 'gamma の引数は有限の実数で指定してください。'));
      if (value <= 0) throw new Error(errorText('gammaPositive', 'gamma は正の実数引数にのみ対応します。'));
      const result = Math.exp(logGammaReal(value));
      if (!Number.isFinite(result)) {
        return value > 170 ? Infinity : result;
      }
      return result;
    }

    function betaReal(x, y){
      const a = ensurePositiveFiniteNumber(x, errorText('betaFirstArg', 'beta の第1引数には正の実数を指定してください。'));
      const b = ensurePositiveFiniteNumber(y, errorText('betaSecondArg', 'beta の第2引数には正の実数を指定してください。'));
      const sum = a + b;
      return Math.exp(logGammaReal(a) + logGammaReal(b) - logGammaReal(sum));
    }

    function lambertWReal(x, branch = 0){
      const value = Number(x);
      if (!Number.isFinite(value)) throw new Error(errorText('lambertFinite', 'lambertW の引数は有限の実数で指定してください。'));
      const branchIndex = Number(branch ?? 0);
      if (!Number.isFinite(branchIndex) || Math.trunc(branchIndex) !== branchIndex) {
        throw new Error(errorText('lambertBranchInteger', 'lambertW のブランチは整数で指定してください。'));
      }
      if (branchIndex !== 0 && branchIndex !== -1) {
        throw new Error(errorText('lambertBranchRange', 'この実装では分枝 0 と -1 のみ対応しています。'));
      }
      const minValue = -1 / Math.E;
      if (branchIndex === 0 && value < minValue) {
        throw new Error(errorText('lambertPrincipalDomain', 'lambertW の主枝は x ≥ -1/e の範囲でのみ定義されます。'));
      }
      if (branchIndex === -1 && (value < minValue || value >= 0)) {
        throw new Error(errorText('lambertNegativeDomain', 'lambertW の分枝 -1 は -1/e ≤ x < 0 の範囲でのみ定義されます。'));
      }
      if (value === 0) return 0;
      if (value === minValue) return -1;
      let w;
      if (branchIndex === 0) {
        if (value < 1) {
          w = value < 0 ? Math.log1p(value) : value;
        } else {
          w = Math.log(value);
          if (value > 3) {
            w -= Math.log(w);
          }
        }
      } else {
        w = Math.log(-value);
      }
      const maxIter = 64;
      for (let i = 0; i < maxIter; i++) {
        const e = Math.exp(w);
        const we = w * e;
        const f = we - value;
        const denomBase = e * (w + 1);
        let denom = denomBase;
        if (Math.abs(w + 1) > 1e-12) {
          denom -= (w + 2) * f / (2 * (w + 1));
        }
        if (!Number.isFinite(denom) || denom === 0) {
          denom = denomBase || (branchIndex === 0 ? 1 : -1);
        }
        const delta = f / denom;
        w -= delta;
        if (!Number.isFinite(w)) {
          throw new Error(errorText('lambertNotConverged', 'lambertW の計算が収束しませんでした。'));
        }
        if (Math.abs(delta) <= 1e-14 * (1 + Math.abs(w))) {
          return w;
        }
      }
      return w;
    }

    function erfApprox(z){
      const sign = z >= 0 ? 1 : -1;
      const abs = Math.abs(z);
      const t = 1 / (1 + 0.3275911 * abs);
      const poly = (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t;
      return sign * (1 - poly * Math.exp(-abs * abs));
    }

    function normalPdfReal(x, mu = 0, sigma = 1){
      const mean = Number(mu ?? 0);
      const stdev = Number(sigma ?? 1);
      if (!Number.isFinite(mean)) throw new Error(errorText('normalPdfMean', 'normalPdf の平均には有限の実数を指定してください。'));
      if (!Number.isFinite(stdev) || stdev <= 0) throw new Error(errorText('normalPdfSigma', 'normalPdf の標準偏差は正の実数で指定してください。'));
      const value = Number(x ?? 0);
      if (!Number.isFinite(value)) throw new Error(errorText('normalPdfInput', 'normalPdf の第1引数は有限の実数で指定してください。'));
      const z = (value - mean) / stdev;
      const coeff = 1 / (Math.sqrt(2 * Math.PI) * stdev);
      return coeff * Math.exp(-0.5 * z * z);
    }

    function normalCdfReal(x, mu = 0, sigma = 1){
      const mean = Number(mu ?? 0);
      const stdev = Number(sigma ?? 1);
      if (!Number.isFinite(mean)) throw new Error(errorText('normalCdfMean', 'normalCdf の平均には有限の実数を指定してください。'));
      if (!Number.isFinite(stdev) || stdev <= 0) throw new Error(errorText('normalCdfSigma', 'normalCdf の標準偏差は正の実数で指定してください。'));
      const value = Number(x ?? 0);
      if (!Number.isFinite(value)) throw new Error(errorText('normalCdfInput', 'normalCdf の第1引数は有限の実数で指定してください。'));
      const z = (value - mean) / (stdev * Math.SQRT2);
      const erfValue = math && typeof math.erf === 'function' ? math.erf(z) : erfApprox(z);
      return 0.5 * (1 + erfValue);
    }

    function normalInvReal(p, mu = 0, sigma = 1){
      const probability = Number(p);
      if (!Number.isFinite(probability)) throw new Error(errorText('normalInvProbability', 'normalInv の確率は有限の実数で指定してください。'));
      if (probability <= 0) {
        if (probability === 0) return -Infinity;
        throw new Error(errorText('normalInvProbabilityRange', 'normalInv の確率は 0 < p < 1 の範囲で指定してください。'));
      }
      if (probability >= 1) {
        if (probability === 1) return Infinity;
        throw new Error(errorText('normalInvProbabilityRange', 'normalInv の確率は 0 < p < 1 の範囲で指定してください。'));
      }
      const mean = Number(mu ?? 0);
      const stdev = Number(sigma ?? 1);
      if (!Number.isFinite(stdev) || stdev <= 0) throw new Error(errorText('normalInvSigma', 'normalInv の標準偏差は正の実数で指定してください。'));
      const a = [
        -3.969683028665376e+01,
        2.209460984245205e+02,
        -2.759285104469687e+02,
        1.383577518672690e+02,
        -3.066479806614716e+01,
        2.506628277459239e+00
      ];
      const b = [
        -5.447609879822406e+01,
        1.615858368580409e+02,
        -1.556989798598866e+02,
        6.680131188771972e+01,
        -1.328068155288572e+01
      ];
      const c = [
        -7.784894002430293e-03,
        -3.223964580411365e-01,
        -2.400758277161838e+00,
        -2.549732539343734e+00,
        4.374664141464968e+00,
        2.938163982698783e+00
      ];
      const d = [
        7.784695709041462e-03,
        3.224671290700398e-01,
        2.445134137142996e+00,
        3.754408661907416e+00
      ];
      const plow = 0.02425;
      const phigh = 1 - plow;
      let q;
      if (probability < plow) {
        q = Math.sqrt(-2 * Math.log(probability));
        const num = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]);
        const den = ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
        return mean + stdev * (-num / den);
      }
      if (probability > phigh) {
        q = Math.sqrt(-2 * Math.log(1 - probability));
        const num = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]);
        const den = ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
        return mean + stdev * (num / den);
      }
      q = probability - 0.5;
      const r = q * q;
      const num = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q;
      const den = ((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1;
      return mean + stdev * (num / den);
    }

    function poissonPmfReal(k, lambda){
      const rate = Number(lambda);
      if (!Number.isFinite(rate) || rate <= 0) throw new Error(errorText('poissonMean', 'poissonPmf の平均には正の実数を指定してください。'));
      const count = Math.floor(Number(k));
      if (!Number.isFinite(count) || count < 0) throw new Error(errorText('poissonCount', 'poissonPmf の回数には 0 以上の整数を指定してください。'));
      const logProb = count * Math.log(rate) - rate - logGammaReal(count + 1);
      return Math.exp(logProb);
    }

    function poissonCdfReal(k, lambda){
      const rate = Number(lambda);
      if (!Number.isFinite(rate) || rate <= 0) throw new Error(errorText('poissonCdfMean', 'poissonCdf の平均には正の実数を指定してください。'));
      const count = Math.floor(Number(k));
      if (!Number.isFinite(count) || count < 0) throw new Error(errorText('poissonCdfCount', 'poissonCdf の回数には 0 以上の整数を指定してください。'));
      let term = Math.exp(-rate);
      let sum = term;
      for (let i = 1; i <= count; i++) {
        term *= rate / i;
        sum += term;
        if (term < 1e-16) break;
      }
      return Math.min(1, sum);
    }

    function binomialPmfReal(k, n, p){
      const trials = Math.floor(Number(n));
      if (!Number.isFinite(trials) || trials < 0) throw new Error(errorText('binomialTrials', 'binomialPmf の試行回数には 0 以上の整数を指定してください。'));
      const successes = Math.floor(Number(k));
      if (!Number.isFinite(successes) || successes < 0) throw new Error(errorText('binomialSuccesses', 'binomialPmf の成功回数には 0 以上の整数を指定してください。'));
      if (successes > trials) return 0;
      const prob = Number(p);
      if (!Number.isFinite(prob) || prob < 0 || prob > 1) throw new Error(errorText('binomialProbability', 'binomialPmf の成功確率は 0〜1 の範囲で指定してください。'));
      if (prob === 0) return successes === 0 ? 1 : 0;
      if (prob === 1) return successes === trials ? 1 : 0;
      const logCoeff = logGammaReal(trials + 1) - logGammaReal(successes + 1) - logGammaReal(trials - successes + 1);
      const logProb = logCoeff + successes * Math.log(prob) + (trials - successes) * Math.log(1 - prob);
      return Math.exp(logProb);
    }

    function binomialCdfReal(k, n, p){
      const trials = Math.floor(Number(n));
      if (!Number.isFinite(trials) || trials < 0) throw new Error(errorText('binomialCdfTrials', 'binomialCdf の試行回数には 0 以上の整数を指定してください。'));
      const successes = Math.floor(Number(k));
      if (!Number.isFinite(successes) || successes < 0) throw new Error(errorText('binomialCdfSuccesses', 'binomialCdf の成功回数には 0 以上の整数を指定してください。'));
      const prob = Number(p);
      if (!Number.isFinite(prob) || prob < 0 || prob > 1) throw new Error(errorText('binomialCdfProbability', 'binomialCdf の成功確率は 0〜1 の範囲で指定してください。'));
      if (successes >= trials) return 1;
      if (successes < 0) return 0;
      let sum = 0;
      for (let i = 0; i <= successes; i++) {
        sum += binomialPmfReal(i, trials, prob);
        if (sum >= 1 - 1e-12) return 1;
      }
      return Math.min(1, sum);
    }

    function logitReal(p){
      const prob = Number(p);
      if (!Number.isFinite(prob)) throw new Error(errorText('logitFinite', 'logit の引数は有限の実数で指定してください。'));
      if (prob <= 0 || prob >= 1) {
        if (prob === 0) return -Infinity;
        if (prob === 1) return Infinity;
        throw new Error(errorText('logitRange', 'logit は 0 と 1 の間の値で指定してください。'));
      }
      return Math.log(prob / (1 - prob));
    }

    function sigmoidReal(x){
      const value = Number(x);
      if (!Number.isFinite(value)) throw new Error(errorText('sigmoidFinite', 'sigmoid の引数は有限の実数で指定してください。'));
      if (value >= 0) {
        const expNeg = Math.exp(-value);
        return 1 / (1 + expNeg);
      }
      const expPos = Math.exp(value);
      return expPos / (1 + expPos);
    }

    function bindMath(mathjs){
      mathRef = mathjs;
      math = mathjs.create(mathjs.all);
      math.config({ number: 'Fraction', precision: 64, matrix: 'Matrix' });
      numericMath = mathjs.create(mathjs.all);
      numericMath.config({ number: 'BigNumber', precision: 128, matrix: 'Matrix' });

      const fractionFallbackSkip = new Set(['config', 'import', 'createUnit', 'chain', 'typed', 'evaluate', 'parser']);
      const fractionFallbackPatterns = [
        /Cannot implicitly convert a number to a Fraction/,
        /Cannot implicitly convert .* to Fraction/,
        /Cannot implicitly convert .* to BigNumber or vice versa/,
        /TypeError: Unexpected type of argument in function/
      ];
      const needsFractionFallback = (error) => {
        const message = error?.message || '';
        return fractionFallbackPatterns.some(pattern => pattern.test(message));
      };
      const convertForFallback = (value, ctx) => {
        if (ctx?.isFraction?.(value)) return value.valueOf();
        if (ctx?.isBigNumber?.(value)) return value.toNumber();
        if (ctx?.isComplex?.(value)) {
          const re = convertForFallback(value.re, ctx);
          const im = convertForFallback(value.im, ctx);
          return typeof ctx?.complex === 'function' ? ctx.complex(re, im) : { re, im };
        }
        if (ctx?.isMatrix?.(value)) {
          return value.map(item => convertForFallback(item, ctx));
        }
        if (Array.isArray(value)) {
          return value.map(item => convertForFallback(item, ctx));
        }
        return value;
      };
      const wrapFunctionWithFractionFallback = (target, name, numericTarget) => {
        if (!target || typeof name !== 'string' || fractionFallbackSkip.has(name)) return;
        const original = target[name];
        if (typeof original !== 'function' || original._fractionSafeWrapped) return;
        const wrapper = function fractionSafeWrapper(...args){
          const context = this || target;
          const detectionContext = (context && (
            typeof context.isFraction === 'function' ||
            typeof context.isBigNumber === 'function' ||
            typeof context.isComplex === 'function' ||
            typeof context.isMatrix === 'function'
          )) ? context : target;
          try {
            return original.apply(context, args);
          } catch (err) {
            if (needsFractionFallback(err)) {
              const converted = args.map(arg => convertForFallback(arg, detectionContext));
              try {
                return original.apply(context, converted);
              } catch (innerErr) {
                if (!needsFractionFallback(innerErr)) throw innerErr;
                const numericCtx = numericTarget || null;
                const numericFn = numericCtx && typeof numericCtx[name] === 'function' ? numericCtx[name] : null;
                if (!numericFn) throw innerErr;
                const numericArgs = converted.map(arg => convertForFallback(arg, numericCtx || detectionContext));
                const numericResult = numericFn.apply(numericCtx, numericArgs);
                return convertForFallback(numericResult, detectionContext);
              }
            }
            throw err;
          }
        };
        wrapper._fractionSafeWrapped = true;
        try { Object.defineProperty(wrapper, 'name', { value: original.name || name }); } catch {}
        for (const key of Reflect.ownKeys(original)) {
          if (key === 'length' || key === 'name' || key === 'arguments' || key === 'caller' || key === 'prototype') continue;
          const descriptor = Object.getOwnPropertyDescriptor(original, key);
          if (descriptor) {
            try { Object.defineProperty(wrapper, key, descriptor); } catch {}
          }
        }
        target[name] = wrapper;
      };
      const baseFractionFallbackNames = [
        'sqrt', 'cbrt', 'nthRoot', 'pow',
        'exp', 'expm1', 'log', 'log10', 'log2', 'log1p', 'ln',
        'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2',
        'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
        'sec', 'csc', 'cot', 'asec', 'acsc', 'acot',
        'sech', 'csch', 'coth', 'asech', 'acsch', 'acoth'
      ];
      const applyFractionFallbacks = (target, extraNames = []) => {
        if (!target) return;
        const mathWithTransform = target.expression?.mathWithTransform;
        const numericMathWithTransform = numericMath?.expression?.mathWithTransform;
        const names = new Set([
          ...baseFractionFallbackNames,
          ...extraNames
        ]);
        names.forEach(fnName => {
          if (!fnName || typeof fnName !== 'string') return;
          wrapFunctionWithFractionFallback(target, fnName, numericMath);
          if (mathWithTransform) {
            wrapFunctionWithFractionFallback(mathWithTransform, fnName, numericMathWithTransform);
          }
        });
      };
      applyFractionFallbacks(math);

      function createIntegerParser(target, errorMessage){
        const isFraction = typeof target.isFraction === 'function' ? target.isFraction.bind(target) : null;
        const isBigNumber = typeof target.isBigNumber === 'function' ? target.isBigNumber.bind(target) : null;
        return function parseInteger(value){
          if (typeof value === 'bigint') {
            if (value < 0n) throw new Error(errorMessage);
            return value;
          }
          if (typeof value === 'number') {
            if (!Number.isFinite(value) || value < 0 || Math.floor(value) !== value) {
              throw new Error(errorMessage);
            }
            return BigInt(value);
          }
          if (typeof value === 'boolean') {
            return value ? 1n : 0n;
          }
          if (typeof value === 'string') {
            const trimmed = value.trim();
            if (!trimmed || !/^[+-]?\d+$/.test(trimmed)) {
              throw new Error(errorMessage);
            }
            const parsed = BigInt(trimmed);
            if (parsed < 0n) throw new Error(errorMessage);
            return parsed;
          }
          if (isFraction && isFraction(value)) {
            const sign = value?.s;
            if (typeof sign === 'bigint') {
              if (sign < 0n) throw new Error(errorMessage);
            } else if (typeof sign === 'number') {
              if (sign < 0) throw new Error(errorMessage);
            } else if (sign != null) {
              const coercedSign = Number(sign);
              if (!Number.isFinite(coercedSign) || coercedSign < 0) {
                throw new Error(errorMessage);
              }
            }

            const denominator = value?.d;
            let denominatorIsOne = false;
            if (typeof denominator === 'bigint') {
              denominatorIsOne = denominator === 1n;
            } else if (typeof denominator === 'number') {
              denominatorIsOne = denominator === 1;
            } else if (typeof denominator === 'string') {
              try {
                denominatorIsOne = BigInt(denominator.trim()) === 1n;
              } catch {
                denominatorIsOne = false;
              }
            } else if (denominator && typeof denominator.valueOf === 'function') {
              const primitive = denominator.valueOf();
              if (typeof primitive === 'bigint') {
                denominatorIsOne = primitive === 1n;
              } else if (typeof primitive === 'number') {
                denominatorIsOne = primitive === 1;
              } else if (typeof primitive === 'string') {
                try {
                  denominatorIsOne = BigInt(primitive.trim()) === 1n;
                } catch {
                  denominatorIsOne = false;
                }
              }
            } else if (denominator == null) {
              denominatorIsOne = true;
            }

            if (!denominatorIsOne) {
              throw new Error(errorMessage);
            }

            const numerator = value?.n;
            if (typeof numerator === 'bigint') {
              if (numerator < 0n) throw new Error(errorMessage);
              return numerator;
            }
            if (typeof numerator === 'number') {
              if (!Number.isFinite(numerator) || numerator < 0 || Math.floor(numerator) !== numerator) {
                throw new Error(errorMessage);
              }
              return BigInt(numerator);
            }
            if (typeof numerator === 'string') {
              const trimmed = numerator.trim();
              if (!trimmed || !/^[+-]?\d+$/.test(trimmed)) {
                throw new Error(errorMessage);
              }
              const parsed = BigInt(trimmed);
              if (parsed < 0n) throw new Error(errorMessage);
              return parsed;
            }
            if (numerator && typeof numerator.valueOf === 'function' && numerator.valueOf() !== numerator) {
              return parseInteger(numerator.valueOf());
            }
            if (value && typeof value.valueOf === 'function' && value.valueOf() !== value) {
              return parseInteger(value.valueOf());
            }
            const asString = typeof value.toString === 'function' ? value.toString().trim() : '';
            if (!asString || !/^[+-]?\d+$/.test(asString)) {
              throw new Error(errorMessage);
            }
            const parsed = BigInt(asString);
            if (parsed < 0n) throw new Error(errorMessage);
            return parsed;
          }
          if (isBigNumber && isBigNumber(value)) {
            if (typeof value.isFinite === 'function' && !value.isFinite()) {
              throw new Error(errorMessage);
            }
            if (typeof value.isInteger === 'function' && !value.isInteger()) {
              throw new Error(errorMessage);
            }
            if (typeof value.isNegative === 'function' && value.isNegative()) {
              throw new Error(errorMessage);
            }
            const raw = value.toString();
            const normalized = /[eE\.]/.test(raw)
              ? (typeof value.toFixed === 'function' ? value.toFixed(0) : raw)
              : raw;
            const trimmed = String(normalized).trim();
            if (!trimmed || !/^[+-]?\d+$/.test(trimmed)) {
              throw new Error(errorMessage);
            }
            const parsed = BigInt(trimmed);
            if (parsed < 0n) throw new Error(errorMessage);
            return parsed;
          }
          if (value && typeof value.valueOf === 'function' && value.valueOf() !== value) {
            return parseInteger(value.valueOf());
          }
          throw new Error(errorMessage);
        };
      }

      function convertBigIntToPreferred(target, value, preferFraction){
        if (preferFraction && typeof target.fraction === 'function') {
          try { return target.fraction(value.toString()); } catch {}
        }
        if (typeof target.bignumber === 'function') {
          try { return target.bignumber(value.toString()); } catch {}
        }
        const asNumber = Number(value);
        if (Number.isSafeInteger(asNumber)) {
          return asNumber;
        }
        return value.toString();
      }

      function mapStructure(target, input, mapper){
        if (Array.isArray(input)) {
          return input.map(item => mapStructure(target, item, mapper));
        }
        if (typeof target.isMatrix === 'function' && target.isMatrix(input)) {
          return input.map(item => mapStructure(target, item, mapper));
        }
        return mapper(input);
      }

      const factorialBigInt = (n) => {
        if (n <= 1n) return 1n;
        let result = 1n;
        for (let i = 2n; i <= n; i++) {
          result *= i;
        }
        return result;
      };

      const permutationsBigInt = (n, k) => {
        if (k === 0n) return 1n;
        let result = 1n;
        for (let i = 0n; i < k; i++) {
          result *= (n - i);
        }
        return result;
      };

      const combinationsBigInt = (n, k) => {
        if (k === 0n) return 1n;
        let result = 1n;
        for (let i = 1n; i <= k; i++) {
          result = (result * (n - k + i)) / i;
        }
        return result;
      };

      function convertFactorialInputToNumber(value, target){
        if (value == null) {
          throw new Error(errorText('factorialNumeric', 'factorial の引数には数値を指定してください。'));
        }
        if (typeof value === 'number') {
          return value;
        }
        if (typeof value === 'bigint') {
          const numeric = Number(value);
          if (!Number.isFinite(numeric)) {
            throw new Error(errorText('factorialFinite', 'factorial の引数には有限の実数を指定してください。'));
          }
          return numeric;
        }
        if (typeof value === 'boolean') {
          return value ? 1 : 0;
        }
        if (typeof value === 'string') {
          const trimmed = value.trim();
          if (!trimmed) {
            throw new Error(errorText('factorialNumeric', 'factorial の引数には数値を指定してください。'));
          }
          const parsed = Number(trimmed);
          if (!Number.isFinite(parsed)) {
            throw new Error(errorText('factorialFinite', 'factorial の引数には有限の実数を指定してください。'));
          }
          return parsed;
        }
        if (target?.isFraction?.(value)) {
          return value.valueOf();
        }
        if (target?.isBigNumber?.(value)) {
          return value.toNumber();
        }
        if (target?.isComplex?.(value)) {
          throw new Error(errorText('factorialReal', 'factorial の引数には実数を指定してください。'));
        }
        if (value && typeof value.valueOf === 'function' && value.valueOf() !== value) {
          return convertFactorialInputToNumber(value.valueOf(), target);
        }
        throw new Error(errorText('factorialNumeric', 'factorial の引数には数値を指定してください。'));
      }

      function installFactorialFallback(target, preferFraction){
        if (!target || typeof target.factorial !== 'function') return;
        const original = target.factorial;
        const parseInteger = createIntegerParser(target, errorText('factorialNonNegativeInteger', 'factorial の引数には 0 以上の整数を指定してください。'));
        const convertResult = (value) => convertBigIntToPreferred(target, value, preferFraction);
        const compute = (value) => {
          let parsedInt = null;
          try {
            parsedInt = parseInteger(value);
          } catch {
            parsedInt = null;
          }
          if (parsedInt != null) {
            return convertResult(factorialBigInt(parsedInt));
          }
          const numericValue = convertFactorialInputToNumber(value, target);
          if (!Number.isFinite(numericValue)) {
            throw new Error(errorText('factorialFinite', 'factorial の引数には有限の実数を指定してください。'));
          }
          if (numericValue < -1) {
            throw new Error(errorText('factorialGreaterThanMinusOne', 'factorial の引数は -1 より大きい実数を指定してください。'));
          }
          const rounded = Math.round(numericValue);
          if (Math.abs(numericValue - rounded) < 1e-12) {
            if (rounded < 0) {
              throw new Error(errorText('factorialNegativeInteger', 'factorial は負の整数では定義されません。'));
            }
            return convertResult(factorialBigInt(BigInt(rounded)));
          }
          const gammaInput = numericValue + 1;
          if (gammaInput <= 0) {
            throw new Error(errorText('factorialGreaterThanMinusOne', 'factorial の引数は -1 より大きい実数を指定してください。'));
          }
          const gammaValue = gammaReal(gammaInput);
          if (!Number.isFinite(gammaValue)) {
            return gammaValue;
          }
          return gammaValue;
        };
        target.factorial = function(value){
          try {
            return original.call(target, value);
          } catch {
            return mapStructure(target, value, compute);
          }
        };
      }

      function installPermutationCombinationFallback(target, preferFraction){
        if (!target) return;
        if (typeof target.permutations === 'function') {
          const originalPerm = target.permutations;
          const parseInteger = createIntegerParser(target, errorText('permutationsInteger', 'permutations の引数には 0 以上の整数を指定してください。'));
          const convertResult = (value) => convertBigIntToPreferred(target, value, preferFraction);
          const invalidRangeError = new Error(errorText('permutationsRange', 'permutations の第2引数は第1引数以下の整数で指定してください。'));
          const computePerm = (nVal, kVal) => {
            const nInt = parseInteger(nVal);
            const kInt = kVal == null ? nInt : parseInteger(kVal);
            if (kInt > nInt) throw invalidRangeError;
            return convertResult(permutationsBigInt(nInt, kInt));
          };
          target.permutations = function(nVal, kVal){
            try {
              return originalPerm.call(target, nVal, kVal);
            } catch (err) {
              if (!fractionBigNumberPattern.test(err?.message || '')) {
                throw err;
              }
              return mapStructure(target, nVal, item => computePerm(item, kVal));
            }
          };
        }
        if (typeof target.combinations === 'function') {
          const originalComb = target.combinations;
          const parseInteger = createIntegerParser(target, errorText('combinationsInteger', 'combinations の引数には 0 以上の整数を指定してください。'));
          const convertResult = (value) => convertBigIntToPreferred(target, value, preferFraction);
          const invalidRangeError = new Error(errorText('combinationsRange', 'combinations の第2引数は第1引数以下の整数で指定してください。'));
          const missingArgError = new Error(errorText('combinationsSecondArg', 'combinations の第2引数には 0 以上の整数を指定してください。'));
          const computeComb = (nVal, kVal) => {
            if (kVal == null) throw missingArgError;
            const nInt = parseInteger(nVal);
            const kInt = parseInteger(kVal);
            if (kInt > nInt) throw invalidRangeError;
            const useK = kInt > nInt - kInt ? nInt - kInt : kInt;
            return convertResult(combinationsBigInt(nInt, useK));
          };
          target.combinations = function(nVal, kVal){
            try {
              return originalComb.call(target, nVal, kVal);
            } catch (err) {
              if (!fractionBigNumberPattern.test(err?.message || '')) {
                throw err;
              }
              return mapStructure(target, nVal, item => computeComb(item, kVal));
            }
          };
        }
      }

      installFactorialFallback(math, true);
      installFactorialFallback(numericMath, false);
      installPermutationCombinationFallback(math, true);
      installPermutationCombinationFallback(numericMath, false);

      const trigNames = [
        ['sin', true, false], ['cos', true, false], ['tan', true, false],
        ['asin', false, true], ['acos', false, true], ['atan', false, true],
        ['sinh', true, false], ['cosh', true, false], ['tanh', true, false],
        ['asinh', false, true], ['acosh', false, true], ['atanh', false, true],
        ['csc', true, false], ['sec', true, false], ['cot', true, false],
        ['acsc', false, true], ['asec', false, true], ['acot', false, true]
      ];

      function createMathOverrides(targetMath, numericPeer){
        if (!targetMath) return {};

        const radianContext = targetMath || numericPeer;
        const toRadians = value => radianContext.multiply(value, radianContext.divide(radianContext.pi, 180));
        const fromRadians = value => radianContext.multiply(value, radianContext.divide(180, radianContext.pi));

        const overrides = {};
        overrides.baseDecode = function(value, base){
          const radix = ensureRadix(base);
          return decodeBaseValue(value, radix);
        };
        overrides.baseEncode = function(value, base, precision){
          const radix = ensureRadix(base);
          const prec = clampRadixPrecision(precision);
          return convertDecimalToRadix(value, radix, prec);
        };
        overrides.baseConvert = function(value, fromBase, toBase, precision){
          const from = ensureRadix(fromBase);
          const to = ensureRadix(toBase);
          const prec = clampRadixPrecision(precision);
          const decimal = decodeBaseValue(value, from);
          return convertDecimalToRadix(decimal, to, prec);
        };
        overrides.ln = function(value){
          const logContext = (targetMath && typeof targetMath.log === 'function')
            ? targetMath
            : numericPeer;
          if (!logContext || typeof logContext.log !== 'function') {
            throw new Error(errorText('lnUnavailable', '自然対数関数 ln が利用できません。'));
          }
          return logContext.log(value);
        };
        overrides.integral = function(expr, variable, lower, upper, options){
          const varName = normalizeVariableName(variable);
          const hasLower = lower != null;
          const hasUpper = upper != null;
          if (hasLower || hasUpper) {
            if (!hasLower || !hasUpper) {
              throw new Error(errorText('integralBounds', '定積分を求める場合は下限と上限を両方指定してください。'));
            }
            const lowerVal = evaluateMathArgument(lower);
            const upperVal = evaluateMathArgument(upper);
            const optionValue = options != null ? evaluateMathArgument(options) : options;
            const normalizedOptions = optionValue && typeof optionValue === 'object' ? optionValue : {};
            return numericIntegrate(expr, varName, lowerVal, upperVal, normalizedOptions);
          }
          return integrateExpressionSymbolic(expr, varName);
        };
        overrides.integral.rawArgs = true;
        trigNames.forEach(([name, convertIn, convertOut]) => {
          const baseFn = targetMath[name]?.bind(targetMath);
          if (typeof baseFn !== 'function') return;
          overrides[name] = function(...args){
            let processed = args;
            if (!radianMode && convertIn) {
              processed = args.map(arg => {
                if (targetMath.typeOf?.(arg) === 'Matrix' || Array.isArray(arg)) {
                  return targetMath.map(arg, item => toRadians(item));
                }
                return toRadians(arg);
              });
            }
            let result = baseFn(...processed);
            if (!radianMode && convertOut) {
              if (targetMath.typeOf?.(result) === 'Matrix' || Array.isArray(result)) {
                return targetMath.map(result, item => fromRadians(item));
              }
              result = fromRadians(result);
            }
            return result;
          };
        });

        overrides.tetra = function(base, height){
          const result = computeTetration(base, height);
          return result;
        };
        overrides.slog = function(base, value){
          return computeSlog(base, value);
        };
        overrides.gamma = function(x){
          return gammaReal(x);
        };
        overrides.beta = function(a, b){
          return mapStructure(targetMath, a, left => mapStructure(targetMath, b, right => betaReal(left, right)));
        };
        overrides.taylorSeries = function(expr, variable, order, center){
          return computeTaylorSeries(expr, variable, order, center);
        };
        overrides.numericIntegrate = function(expr, variable, lower, upper, options){
          return numericIntegrate(expr, variable, lower, upper, options);
        };
        overrides.solveEq = function(expr, variable, guess, options){
          return newtonSolve(expr, variable, guess, options);
        };
        overrides.solveSystem = function(equations, variables, initialGuess, options){
          return newtonSystem(equations, variables, initialGuess, options);
        };
        overrides.solveLinear = function(matrix, vector){
          return solveLinearSystem(matrix, vector);
        };
        overrides.minimize = function(expr, variable, guess, options){
          return optimize(expr, variable, guess, options, false);
        };
        overrides.maximize = function(expr, variable, guess, options){
          return optimize(expr, variable, guess, options, true);
        };
        overrides.digamma = function(x){
          return digammaReal(x);
        };
        overrides.polygamma = function(order, x){
          return polygammaReal(order, x);
        };
        overrides.harmonic = function(n, r){
          return harmonicNumber(n, r);
        };
        overrides.zeta = function(s, terms){
          return riemannZeta(s, terms);
        };
        overrides.logGamma = function(x){
          return logGammaReal(x);
        };
        overrides.lambertW = function(x, branch){
          return lambertWReal(x, branch);
        };
        overrides.normalPdf = function(x, mu, sigma){
          return normalPdfReal(x, mu, sigma);
        };
        overrides.normalCdf = function(x, mu, sigma){
          return normalCdfReal(x, mu, sigma);
        };
        overrides.normalInv = function(p, mu, sigma){
          return normalInvReal(p, mu, sigma);
        };
        overrides.poissonPmf = function(k, lambda){
          return poissonPmfReal(k, lambda);
        };
        overrides.poissonCdf = function(k, lambda){
          return poissonCdfReal(k, lambda);
        };
        overrides.binomialPmf = function(k, n, p){
          return binomialPmfReal(k, n, p);
        };
        overrides.binomialCdf = function(k, n, p){
          return binomialCdfReal(k, n, p);
        };
        overrides.logit = function(p){
          return logitReal(p);
        };
        overrides.sigmoid = function(x){
          return sigmoidReal(x);
        };
        overrides.erfc = function(x){
          const subtractContext = (targetMath && typeof targetMath.subtract === 'function')
            ? targetMath
            : numericPeer;
          const erfContext = (targetMath && typeof targetMath.erf === 'function')
            ? targetMath
            : numericPeer;
          if (!subtractContext || !erfContext) {
            throw new Error(errorText('erfcUnavailable', 'erfc は現在利用できません。'));
          }
          const one = typeof subtractContext.bignumber === 'function'
            ? subtractContext.bignumber(1)
            : 1;
          const erfValue = erfContext.erf(x);
          return subtractContext.subtract(one, erfValue);
        };

        return overrides;
      }

      const mathOverrides = createMathOverrides(math, numericMath);
      math.import(mathOverrides, { override: true });
      applyFractionFallbacks(math, Object.keys(mathOverrides));

      const numericOverrides = createMathOverrides(numericMath, math);
      numericMath.import(numericOverrides, { override: true });
      updateVariables();
      renderSymbolicResult(lastSymbolicRaw);
      updateHistory();
      updateExpressionPreview();
    }

    function evaluateExpression(){
      if (!math) {
        notifyStatusKey('engineWaiting', '数学エンジンの初期化を待っています…');
        return;
      }
      const rawExpr = expressionMode === 'pretty'
        ? (expressionInputPretty?.value || '')
        : (expressionInputClassic?.value || '');
      const displayExpr = (rawExpr || '').trim();
      const expr = convertPrettyToAscii(rawExpr).trim();
      if (expressionMode === 'pretty' && expressionInputClassic) {
        expressionInputClassic.value = expr;
      }
      if (!expr) {
        notifyStatusKey('enterExpression', '式を入力してください。');
        return;
      }
      try {
        const node = math.parse(expr);
        const result = node.evaluate(scope);
        scope.ans = result;
        let symbolic = formatValue(result);
        try {
          const simplified = math.simplify(node, scope, { exactFractions: true });
          const restored = restoreSpecialFunctionNodes(simplified);
          const simplifiedText = beautifySymbols(restored.toString({ parenthesis: 'auto' }));
          if (simplifiedText) {
            symbolic = simplifiedText;
          }
        } catch {}
        let approxValue;
        try {
          const approxScope = buildNumericScope(scope);
          approxValue = numericMath ? numericMath.evaluate(expr, approxScope) : result;
        } catch {
          approxValue = result;
        }
        setResults(symbolic, approxValue);
        const historyExpr = expressionMode === 'pretty'
          ? (displayExpr || expr)
          : convertAsciiToPretty(displayExpr || expr);
        const approxDisplay = approxResultEl?.dataset?.rawValue ?? formatApproxValue(approxValue);
        const entry = { expr: historyExpr, symbolic, approx: approxDisplay };
        history.push(entry);
        latestHistoryEntry = entry;
        updateHistory();
        updateVariables();
        totalComputations += 1;
        try { awardXp && awardXp(12, { type: 'compute', expression: expr }); } catch {}
        notifyStatusKey('calculationComplete', '計算が完了しました。');
      } catch (err) {
        latestHistoryEntry = null;
        const errorLabel = resultText('errorLabel', 'Error');
        setResults(errorLabel, err.message || String(err));
        notifyStatusKey('error', 'エラー: {message}', { message: err.message || err });
      }
    }

    function plotGraph(){
      if (!math) {
        notifyStatusKey('engineWaiting', '数学エンジンの初期化を待っています…');
        return;
      }
      const exprRaw = graphInput.value.trim();
      const expr = convertPrettyToAscii(exprRaw);
      if (!expr) {
        notifyStatusKey('enterGraphExpression', 'グラフ式を入力してください。');
        return;
      }
      let compiled;
      try {
        compiled = math.parse(expr);
      } catch (err) {
        graphMessage.textContent = graphText('parseFailed', '式の解析に失敗しました: {message}', { message: err.message || '' });
        graphMessage.dataset.graphState = 'custom';
        return;
      }
      const xmin = Number(graphXMin.value);
      const xmax = Number(graphXMax.value);
      if (!Number.isFinite(xmin) || !Number.isFinite(xmax) || xmin >= xmax) {
        graphMessage.textContent = graphText('invalidRange', '範囲は有限で xmin < xmax となるように設定してください。');
        graphMessage.dataset.graphState = 'custom';
        return;
      }
      const baseScope = cloneScope(scope);
      const points = [];
      const total = 320;
      let ymin = Infinity;
      let ymax = -Infinity;
      let rejectedUnits = 0;
      let rejectedComposite = 0;
      let rejectedComplex = 0;
      for (let i = 0; i <= total; i++) {
        const x = xmin + (xmax - xmin) * (i / total);
        const localScope = cloneScope(baseScope);
        localScope.x = x;
        try {
          const yVal = compiled.evaluate(localScope);
          const y = toNumber(yVal);
          if (!Number.isFinite(y)) continue;
          if (y < ymin) ymin = y;
          if (y > ymax) ymax = y;
          points.push({ x, y });
        } catch (err) {
          if (err && err.code === 'UNIT') rejectedUnits += 1;
          else if (err && (err.code === 'MATRIX' || err.code === 'ARRAY')) rejectedComposite += 1;
          else if (err && err.code === 'COMPLEX') rejectedComplex += 1;
          continue;
        }
      }
      if (!points.length) {
        const reasons = [];
        if (rejectedUnits) reasons.push(graphText('reasons.units', '単位付き: {count}', { count: rejectedUnits }));
        if (rejectedComposite) reasons.push(graphText('reasons.composite', 'ベクトル/行列: {count}', { count: rejectedComposite }));
        if (rejectedComplex) reasons.push(graphText('reasons.complex', '複素数: {count}', { count: rejectedComplex }));
        const detail = reasons.length
          ? graphText('noPointsDetail', ' (除外: {reasons})', { reasons: reasons.join(', ') })
          : '';
        graphMessage.textContent = graphText('noPoints', '描画できる点がありません{detail}。', { detail });
        graphMessage.dataset.graphState = 'custom';
        return;
      }
      if (ymax === ymin) {
        ymax += 1;
        ymin -= 1;
      }
      drawGraph(points, [xmin, xmax], [ymin, ymax]);
      graphMessage.textContent = graphText('summary', '描画ポイント: {count} / {total}', { count: points.length, total: total + 1 });
      graphMessage.dataset.graphState = 'custom';
      const extras = [];
      if (rejectedUnits) extras.push(graphText('reasons.units', '単位付き: {count}', { count: rejectedUnits }));
      if (rejectedComposite) extras.push(graphText('reasons.composite', 'ベクトル/行列: {count}', { count: rejectedComposite }));
      if (rejectedComplex) extras.push(graphText('reasons.complex', '複素数: {count}', { count: rejectedComplex }));
      if (extras.length) {
        graphMessage.textContent += graphText('summaryExtra', ' / 除外 {items}', { items: extras.join(', ') });
      }
      totalGraphs += 1;
      try { awardXp && awardXp(8, { type: 'graph', expression: expr }); } catch {}
    }

    function refreshShortcutState(){
      const activeEl = document.activeElement;
      if (container.contains(activeEl) && isEditableElement(activeEl)) {
        lockShortcuts();
      } else {
        unlockShortcuts();
      }
    }

    function start(){
      if (active) return;
      active = true;
      expressionInput?.focus();
      notifyStatusKey('ready', '数学ラボの準備が整いました。');
      refreshShortcutState();
    }

    function stop(){
      if (!active) return;
      active = false;
      unlockShortcuts();
    }

    function destroy(){
      if (destroyed) return;
      destroyed = true;
      stop();
      container.removeEventListener('focusin', handleFocusIn);
      container.removeEventListener('focusout', handleFocusOut);
      unlockShortcuts();
      while (localeCleanup.length) {
        const cleanup = localeCleanup.pop();
        try { cleanup?.(); } catch (error) {
          console.warn('[math_lab:i18n] Failed to cleanup locale listener:', error);
        }
      }
      localeBindings.length = 0;
      lastStatusDescriptor = null;
      lastStatusTimestamp = null;
      try { root && root.contains(container) && root.removeChild(container); } catch {}
    }

    function getScore(){
      return totalComputations * 2 + totalGraphs * 3;
    }

    buildKeypad();
    buildWorkspace();
    registerLocaleBinding(() => {
      updateVariables();
      updateHistory();
    });
    setupLocaleSync();
    setResults(null, null);

    ensureMathJax()
      .then(() => {
        if (destroyed) return;
        renderSymbolicResult(lastSymbolicRaw);
        updateExpressionPreview();
        updateHistory();
      })
      .catch(() => {});

    ensureMathJs()
      .then(mathjs => {
        if (destroyed) return;
        bindMath(mathjs);
        loadingOverlay.remove();
        notifyStatusKey('engineInitialized', '数学エンジンを初期化しました。');
      })
      .catch(err => {
        if (destroyed) return;
        loadingOverlay.innerHTML = '';
        const failureMessage = document.createElement('div');
        Object.assign(failureMessage.style, {
          color: '#fca5a5',
          fontSize: '14px',
          textAlign: 'center',
          maxWidth: '320px',
          lineHeight: '1.6',
          whiteSpace: 'pre-line',
          margin: '0 auto'
        });
        const errorMessage = err?.message || String(err || '');
        const failureText = statusText('loadFailed', '数学エンジンの読み込みに失敗しました。インターネット接続を確認してください。');
        failureMessage.textContent = errorMessage ? `${failureText}\n${errorMessage}` : failureText;
        loadingOverlay.appendChild(failureMessage);
      });

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({
    id: 'math_lab',
    name: '数学ラボ', nameKey: 'selection.miniexp.games.math_lab.name',
    description: 'Mathematica風ワークシートで関数・単位・グラフ・テトレーションまで扱える超高機能電卓', descriptionKey: 'selection.miniexp.games.math_lab.description', categoryIds: ['utility'],
    category: 'ユーティリティ',
    create
  });
})();

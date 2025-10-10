(function(){
  const STYLE_ID = 'mini-tester-style';
  const STYLES = `
  .mini-tester-root {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 18px;
    color: #0b1120;
    background: linear-gradient(160deg, #f8fafc 0%, #e2e8f0 45%, #dbeafe 100%);
    font-family: 'Segoe UI', 'Hiragino Sans', 'Noto Sans JP', sans-serif;
    padding: 26px 30px;
    box-sizing: border-box;
    overflow: hidden;
  }
  .mini-tester-header {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .mini-tester-title {
    font-size: 24px;
    font-weight: 600;
    letter-spacing: 0.05em;
    color: #0f172a;
    text-shadow: 0 1px 0 rgba(255,255,255,0.6);
  }
  .mini-tester-sub {
    font-size: 13px;
    color: #334155;
  }
  .mini-tester-tabs {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    padding: 10px 14px;
    background: rgba(255,255,255,0.72);
    border: 1px solid rgba(148,163,184,0.35);
    border-radius: 16px;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.7);
  }
  .mini-tester-tab-btn {
    padding: 8px 16px;
    background: #e2e8f0;
    border: 1px solid rgba(148,163,184,0.6);
    border-radius: 999px;
    color: #0f172a;
    cursor: pointer;
    font-size: 13px;
    transition: background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
  }
  .mini-tester-tab-btn:hover {
    background: #cbd5f5;
    transform: translateY(-1px);
  }
  .mini-tester-tab-btn.active {
    background: #ffffff;
    border-color: rgba(100,116,139,0.85);
    box-shadow: 0 8px 22px rgba(100,116,139,0.18);
  }
  .mini-tester-main {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: 1fr;
    overflow: hidden;
  }
  .mini-tester-section {
    display: none;
    overflow: hidden;
  }
  .mini-tester-section.active {
    display: flex;
  }
  .mini-tester-section-inner {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
    overflow: hidden;
  }
  .mini-tester-card {
    background: rgba(255,255,255,0.92);
    border: 1px solid rgba(148,163,184,0.4);
    border-radius: 18px;
    padding: 20px;
    box-shadow: 0 24px 52px rgba(148,163,184,0.25);
  }
  .mini-tester-card h3 {
    margin: 0 0 10px;
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: #0b1f44;
  }
  .mini-tester-card p {
    margin: 0;
    color: #475569;
    font-size: 13px;
    line-height: 1.6;
  }
  .mini-tester-tests-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 14px;
  }
  .mini-tester-test-item {
    background: rgba(248,250,252,0.95);
    border-radius: 14px;
    border: 1px solid rgba(148,163,184,0.45);
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .mini-tester-test-item strong {
    font-size: 15px;
    color: #0f172a;
  }
  .mini-tester-test-desc {
    color: #475569;
    font-size: 12px;
  }
  .mini-tester-test-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .mini-tester-button {
    border: none;
    border-radius: 999px;
    padding: 8px 16px;
    font-size: 12px;
    color: #f8fafc;
    background: linear-gradient(135deg, #2563eb, #7c3aed);
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .mini-tester-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 18px rgba(59,130,246,0.28);
  }
  .mini-tester-button.secondary {
    background: #e2e8f0;
    color: #0f172a;
    border: 1px solid rgba(148,163,184,0.55);
  }
  .mini-tester-button.danger {
    background: linear-gradient(135deg, #ef4444, #f97316);
    color: #ffffff;
  }
  .mini-tester-test-result {
    font-size: 12px;
    color: #1e293b;
  }
  .mini-tester-bench-display {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
  }
  .mini-tester-bench-box {
    background: rgba(248,250,252,0.95);
    border: 1px solid rgba(148,163,184,0.45);
    border-radius: 16px;
    padding: 18px;
  }
  .mini-tester-bench-value {
    font-size: 26px;
    font-weight: 700;
    margin-bottom: 6px;
    color: #0b1f44;
  }
  .mini-tester-bench-log {
    background: rgba(241,245,249,0.95);
    border-radius: 12px;
    padding: 12px;
    max-height: 200px;
    overflow: auto;
    font-size: 12px;
    line-height: 1.6;
    border: 1px solid rgba(148,163,184,0.35);
  }
  .mini-tester-bench-log-entry {
    color: #1e293b;
  }
  .mini-tester-blocks {
    display: grid;
    grid-template-columns: minmax(320px, 360px) 1fr;
    gap: 20px;
    height: 100%;
    background: linear-gradient(135deg, rgba(248,250,252,0.94), rgba(224,231,255,0.92));
    border: 1px solid rgba(148,163,184,0.35);
    border-radius: 22px;
    padding: 18px;
    box-shadow: 0 30px 60px rgba(148,163,184,0.28);
  }
  .mini-tester-blocks-left,
  .mini-tester-blocks-right {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-height: 0;
    background: rgba(255,255,255,0.92);
    border: 1px solid rgba(148,163,184,0.3);
    border-radius: 16px;
    padding: 16px;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.65);
  }
  .mini-tester-block-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-right: 6px;
  }
  .mini-tester-block-item {
    background: linear-gradient(135deg, #ffffff, rgba(241,245,249,0.92));
    border: 1px solid rgba(148,163,184,0.35);
    border-radius: 14px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    position: relative;
    box-shadow: 0 12px 28px rgba(148,163,184,0.18);
  }
  .mini-tester-block-item.active {
    box-shadow: 0 0 0 2px rgba(37,99,235,0.45);
  }
  .mini-tester-block-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }
  .mini-tester-block-header select,
  .mini-tester-block-header input[type="number"] {
    background: #ffffff;
    border: 1px solid rgba(148,163,184,0.6);
    color: #0f172a;
    border-radius: 8px;
    padding: 4px 8px;
    font-size: 12px;
  }
  .mini-tester-block-body textarea,
  .mini-tester-block-body input,
  .mini-tester-block-body select {
    width: 100%;
    background: #f8fafc;
    border: 1px solid rgba(148,163,184,0.55);
    color: #0f172a;
    border-radius: 8px;
    padding: 6px 8px;
    font-size: 12px;
    box-sizing: border-box;
  }
  .mini-tester-block-body textarea {
    min-height: 60px;
    resize: vertical;
  }
  .mini-tester-block-actions {
    display: flex;
    gap: 6px;
  }
  .mini-tester-story-log {
    flex: 1;
    background: rgba(248,250,252,0.95);
    border: 1px solid rgba(148,163,184,0.45);
    border-radius: 16px;
    padding: 16px;
    overflow-y: auto;
    font-size: 13px;
    line-height: 1.6;
  }
  .mini-tester-story-log-entry {
    margin-bottom: 8px;
  }
  .mini-tester-story-log-entry span.label {
    font-weight: 600;
    color: #2563eb;
    margin-right: 6px;
  }
  .mini-tester-choice-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 10px;
  }
  .mini-tester-choice-container button {
    background: rgba(37,99,235,0.12);
    border: 1px solid rgba(37,99,235,0.4);
    color: #1e3a8a;
    padding: 6px 14px;
    border-radius: 999px;
    cursor: pointer;
    transition: background 0.18s ease;
  }
  .mini-tester-choice-container button:hover {
    background: rgba(37,99,235,0.22);
  }
  .mini-tester-alert-editor textarea {
    width: 100%;
    min-height: 120px;
    background: rgba(248,250,252,0.95);
    border: 1px solid rgba(148,163,184,0.45);
    border-radius: 12px;
    padding: 12px;
    color: #0f172a;
    font-size: 12px;
    line-height: 1.6;
  }
  .mini-tester-variables {
    background: rgba(248,250,252,0.95);
    border: 1px solid rgba(148,163,184,0.45);
    border-radius: 12px;
    padding: 14px;
    font-size: 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .mini-tester-alert-status {
    font-size: 12px;
    color: #334155;
  }
  .mini-tester-control-block {
    background: #ffffff;
    border: 1px solid rgba(148,163,184,0.45);
    border-radius: 12px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    box-shadow: 0 18px 32px rgba(148,163,184,0.18);
  }
  .mini-tester-control-message {
    font-weight: 600;
    color: #0f172a;
  }
  .mini-tester-control-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  .mini-tester-control-actions button {
    background: rgba(37,99,235,0.14);
    border: 1px solid rgba(37,99,235,0.4);
    color: #1e3a8a;
    padding: 6px 16px;
    border-radius: 999px;
    cursor: pointer;
  }
  .mini-tester-control-actions button:hover {
    background: rgba(37,99,235,0.22);
  }
  .mini-tester-control-input {
    background: #f8fafc;
    border: 1px solid rgba(148,163,184,0.55);
    border-radius: 8px;
    padding: 6px 10px;
    color: #0f172a;
    width: 100%;
    box-sizing: border-box;
  }
  .mini-tester-control-error {
    color: #b91c1c;
    font-size: 12px;
  }
  `;

  const I18N = typeof window !== 'undefined' ? window.I18n : null;
  const I18N_PREFIX = 'selection.miniexp.games.tester';

  function computeFallbackText(fallback) {
    if (typeof fallback === 'function') {
      try {
        const result = fallback();
        return typeof result === 'string' ? result : (result ?? '');
      } catch (error) {
        console.warn('[tester] Failed to evaluate fallback text:', error);
        return '';
      }
    }
    return fallback ?? '';
  }

  function translateKey(fullKey, fallback, params) {
    if (fullKey && I18N && typeof I18N.t === 'function') {
      try {
        const translated = I18N.t(fullKey, params);
        if (typeof translated === 'string' && translated !== fullKey) {
          return translated;
        }
      } catch (error) {
        console.warn('[tester] Failed to translate key:', fullKey, error);
      }
    }
    return computeFallbackText(fallback);
  }

  function t(path, fallback, params) {
    if (!path) return computeFallbackText(fallback);
    const fullKey = `${I18N_PREFIX}.${path}`;
    return translateKey(fullKey, fallback, params);
  }

  function ensureStyles(){
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = STYLES;
      document.head.appendChild(style);
    }
  }

  function formatNumber(num) {
    if (!Number.isFinite(num)) return '—';
    if (num >= 1e9) return `${(num/1e9).toFixed(2)}G`;
    if (num >= 1e6) return `${(num/1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num/1e3).toFixed(2)}K`;
    return String(Math.round(num));
  }

  let blockSectionApi = null;

  const TEST_DEFS = [
    {
      id: 'numbers',
      name: '数値/BigInt',
      nameKey: 'tests.defs.numbers.name',
      description: '浮動小数とBigIntの演算、Math拡張を試験します。',
      descriptionKey: 'tests.defs.numbers.description',
      async run() {
        const big = 2n ** 40n;
        const big2 = big / 256n;
        if (big2 !== 2n ** 32n) throw new Error(t('tests.defs.numbers.errors.bigInt', 'BigInt演算が期待どおりではありません'));
        const precise = Math.fround(Math.PI * Math.E);
        const hypot = Math.hypot(3, 4, 12);
        if (Math.abs(hypot - 13) > 1e-6) throw new Error(t('tests.defs.numbers.errors.hypot', 'Math.hypot結果に誤差が大きいです'));
        return `BigInt OK / fround=${precise.toFixed(4)}`;
      }
    },
    {
      id: 'json',
      name: 'JSON & structuredClone',
      nameKey: 'tests.defs.json.name',
      description: 'JSONシリアライズとstructuredCloneをチェックします。',
      descriptionKey: 'tests.defs.json.description',
      async run() {
        const obj = {
          count: 12,
          nested: [1, 2, { label: 'X', when: new Date('2024-01-02T03:04:05Z').toISOString() }],
          map: new Map([[1, 'one']])
        };
        const json = JSON.stringify(obj);
        const restored = JSON.parse(json);
        if (!restored.nested || restored.nested[2].label !== 'X') throw new Error(t('tests.defs.json.errors.restore', 'JSON復元に失敗しました'));
        if (typeof structuredClone === 'function') {
          const cloned = structuredClone(obj);
          if (!(cloned.map instanceof Map) || cloned.map.get(1) !== 'one') {
            throw new Error(t('tests.defs.json.errors.clone', 'structuredCloneがMapを保持できません'));
          }
        }
        return `JSON長=${json.length}`;
      }
    },
    {
      id: 'intl',
      name: 'Intlフォーマット',
      nameKey: 'tests.defs.intl.name',
      description: 'Intl.DateTimeFormatとNumberFormatを検証します。',
      descriptionKey: 'tests.defs.intl.description',
      async run() {
        const i18n = window.I18n;
        const locale = (i18n?.getLocale?.() || i18n?.getDefaultLocale?.() || 'ja').toString();
        const dateFmt = new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeStyle: 'medium', timeZone: 'Asia/Tokyo' });
        const formattedNumber = (typeof i18n?.formatNumber === 'function')
          ? i18n.formatNumber(123456.789, { style: 'currency', currency: 'JPY' })
          : new Intl.NumberFormat(locale, { style: 'currency', currency: 'JPY' }).format(123456.789);
        const formattedDate = dateFmt.format(new Date('2023-05-01T12:34:56Z'));
        if (!formattedDate.includes('5月')) throw new Error(t('tests.defs.intl.errors.date', '日付フォーマットが想定外です'));
        if (!formattedNumber.includes('￥')) throw new Error(t('tests.defs.intl.errors.currency', '通貨フォーマットが想定外です'));
        return `${formattedDate} / ${formattedNumber}`;
      }
    },
    {
      id: 'crypto',
      name: 'Crypto API',
      nameKey: 'tests.defs.crypto.name',
      description: '暗号学的乱数と微小なハッシュ処理を行います。',
      descriptionKey: 'tests.defs.crypto.description',
      async run() {
        if (!window.crypto || !crypto.getRandomValues) throw new Error(t('tests.defs.crypto.errors.random', 'crypto.getRandomValuesが利用できません'));
        const bytes = new Uint8Array(32);
        crypto.getRandomValues(bytes);
        const digest = await crypto.subtle.digest('SHA-256', bytes);
        const hashBytes = Array.from(new Uint8Array(digest)).slice(0, 4).map(b => b.toString(16).padStart(2, '0')).join('');
        return `SHA-256 head=${hashBytes}`;
      }
    },
    {
      id: 'storage',
      name: 'Storage API',
      nameKey: 'tests.defs.storage.name',
      description: 'localStorage/sessionStorage の読み書きを確認します。',
      descriptionKey: 'tests.defs.storage.description',
      async run() {
        const key = `tester-${Date.now()}-${Math.random()}`;
        try {
          localStorage.setItem(key, 'ok');
          const value = localStorage.getItem(key);
          sessionStorage.setItem(key, value + '-session');
          const sessionValue = sessionStorage.getItem(key);
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
          if (value !== 'ok' || sessionValue !== 'ok-session') throw new Error(t('tests.defs.storage.errors.read', 'Storage読み書き失敗'));
        } catch (err) {
          throw new Error(t('tests.defs.storage.errors.blocked', 'Storage利用がブロックされています'));
        }
        return 'localStorage / sessionStorage OK';
      }
    },
    {
      id: 'canvas',
      name: 'Canvas & Offscreen',
      nameKey: 'tests.defs.canvas.name',
      description: 'Canvas描画とOffscreenCanvasの存在を検査します。',
      descriptionKey: 'tests.defs.canvas.description',
      async run() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, 64, 64);
        const grad = ctx.createLinearGradient(0, 0, 64, 64);
        grad.addColorStop(0, '#60a5fa');
        grad.addColorStop(1, '#a855f7');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(32, 32, 22, 0, Math.PI * 2);
        ctx.fill();
        const data = ctx.getImageData(32, 32, 1, 1).data;
        if (!data || data.length < 3) throw new Error(t('tests.defs.canvas.errors.sample', 'Canvasピクセル取得に失敗'));
        const hasOffscreen = typeof OffscreenCanvas !== 'undefined';
        return `中心RGB=(${data[0]},${data[1]},${data[2]}) / Offscreen=${hasOffscreen ? 'YES' : 'NO'}`;
      }
    }
  ];

  function create(root, awardXp) {
    ensureStyles();
    blockSectionApi = null;
    let destroyed = false;
    let paused = false;
    let currentSection = 'tests';
    let benchmarkRunning = false;
    let bestBenchmark = 0;
    let totalBenchmarkRuns = 0;
    let testResults = {};
    let storyBlocks = [];
    let storyRunToken = 0;
    let customAlertImpl = defaultAlertImpl;
    let alertStatusEl = null;
    let varBodyEl = null;
    let variablesEmpty = true;
    let alertStatusState = {
      key: 'blocks.alert.statusDefault',
      fallback: '既定: ログに表示します。alert() に変えることも可能です。',
      params: null
    };
    let detachLocaleListener = null;
    let lastAlertTestAwarded = false;

    const localizationBindings = [];

    function normalizeKey(key, options) {
      if (!key) return null;
      const absolute = options && options.absolute;
      if (absolute) return key;
      if (typeof key === 'string' && (key === I18N_PREFIX || key.startsWith(`${I18N_PREFIX}.`))) {
        return key;
      }
      return `${I18N_PREFIX}.${key}`;
    }

    function evaluateParams(binding) {
      if (!binding) return undefined;
      if (typeof binding.params === 'function') {
        try {
          return binding.params();
        } catch (error) {
          console.warn('[tester] Failed to evaluate localization params:', error);
          return undefined;
        }
      }
      return binding.params;
    }

    function applyBinding(binding) {
      if (!binding || !binding.element) return;
      const key = normalizeKey(binding.key, binding);
      const params = evaluateParams(binding);
      const value = key
        ? translateKey(key, binding.fallback, params)
        : computeFallbackText(typeof binding.computeFallback === 'function'
            ? () => binding.computeFallback(params)
            : binding.fallback);
      if (binding.type === 'text') {
        binding.element.textContent = value;
      } else if (binding.type === 'html') {
        binding.element.innerHTML = value;
      } else if (binding.type === 'attr' && binding.attr) {
        if (value === undefined || value === null) {
          binding.element.removeAttribute(binding.attr);
        } else {
          binding.element.setAttribute(binding.attr, value);
        }
      } else if (binding.type === 'value') {
        binding.element.value = value;
      }
    }

    function registerBinding(binding) {
      if (!binding || !binding.element) return;
      localizationBindings.push(binding);
      applyBinding(binding);
    }

    function bindText(element, key, fallback, params, options) {
      if (!element) return;
      registerBinding({ element, key, fallback, params, type: 'text', ...(options || {}) });
    }

    function bindHtml(element, key, fallback, params, options) {
      if (!element) return;
      registerBinding({ element, key, fallback, params, type: 'html', ...(options || {}) });
    }

    function bindAttr(element, attr, key, fallback, params, options) {
      if (!element) return;
      registerBinding({ element, key, fallback, params, type: 'attr', attr, ...(options || {}) });
    }

    function bindPlaceholder(element, key, fallback, params, options) {
      bindAttr(element, 'placeholder', key, fallback, params, options);
    }

    function bindValue(element, key, fallback, params, options) {
      if (!element) return;
      registerBinding({ element, key, fallback, params, type: 'value', ...(options || {}) });
    }

    function translateImmediate(key, fallback, params, options) {
      const normalized = normalizeKey(key, options);
      return normalized ? translateKey(normalized, fallback, params) : computeFallbackText(fallback);
    }

    function setImmediateText(element, key, fallback, params, options) {
      if (!element) return;
      element.textContent = translateImmediate(key, fallback, params, options);
    }

    function refreshLocalization() {
      for (let i = localizationBindings.length - 1; i >= 0; i -= 1) {
        const binding = localizationBindings[i];
        if (!binding || !binding.element || (typeof binding.element.isConnected === 'boolean' && !binding.element.isConnected)) {
          localizationBindings.splice(i, 1);
          continue;
        }
        applyBinding(binding);
      }
      refreshAlertStatus();
      if (variablesEmpty && varBodyEl) {
        setImmediateText(varBodyEl, 'blocks.variables.empty', '(空)');
      }
    }

    function setAlertStatus(key, fallback, params, options) {
      alertStatusState = { key, fallback, params, options };
      refreshAlertStatus();
    }

    function refreshAlertStatus() {
      if (!alertStatusEl) return;
      setImmediateText(alertStatusEl, alertStatusState.key, alertStatusState.fallback, alertStatusState.params, alertStatusState.options);
    }

    const container = document.createElement('div');
    container.className = 'mini-tester-root';

    const header = document.createElement('div');
    header.className = 'mini-tester-header';
    const title = document.createElement('div');
    title.className = 'mini-tester-title';
    bindText(title, 'title', 'JSテスター / MiniExp MOD');
    const subtitle = document.createElement('div');
    subtitle.className = 'mini-tester-sub';
    bindText(subtitle, 'subtitle', 'JavaScript機能のセルフチェック、CPUベンチマーク、ブロック式アドベンチャーメーカーを収録。');
    header.appendChild(title);
    header.appendChild(subtitle);

    const tabs = document.createElement('div');
    tabs.className = 'mini-tester-tabs';
    const sections = {};

    const main = document.createElement('div');
    main.className = 'mini-tester-main';

    function makeSection(id, labelKey, fallback, element, options) {
      const btn = document.createElement('button');
      btn.className = 'mini-tester-tab-btn';
      if (labelKey) {
        bindText(btn, labelKey, fallback, null, options);
      } else {
        btn.textContent = computeFallbackText(fallback);
      }
      btn.addEventListener('click', () => {
        if (destroyed) return;
        currentSection = id;
        refreshTabs();
      });
      tabs.appendChild(btn);

      const section = document.createElement('div');
      section.className = 'mini-tester-section';
      const inner = document.createElement('div');
      inner.className = 'mini-tester-section-inner';
      inner.appendChild(element);
      section.appendChild(inner);
      main.appendChild(section);
      sections[id] = { btn, section };
    }

    function refreshTabs() {
      Object.entries(sections).forEach(([id, parts]) => {
        const active = id === currentSection;
        parts.btn.classList.toggle('active', active);
        parts.section.classList.toggle('active', active);
      });
    }

    container.appendChild(header);
    container.appendChild(tabs);
    container.appendChild(main);

    const testsElement = buildTestsSection();
    const benchElement = buildBenchmarkSection();
    const blockElement = buildBlocksSection();

    makeSection('tests', 'tabs.tests', '機能テスト', testsElement);
    makeSection('benchmark', 'tabs.benchmark', 'CPUベンチマーク', benchElement);
    makeSection('blocks', 'tabs.blocks', 'ブロックアドベンチャー', blockElement);
    refreshTabs();

    root.appendChild(container);

    refreshLocalization();
    if (I18N && typeof I18N.onLocaleChanged === 'function') {
      detachLocaleListener = I18N.onLocaleChanged(() => {
        if (!destroyed) {
          refreshLocalization();
        }
      });
    }

    function defaultAlertImpl(message) {
      window.alert(message);
    }

    function safeAwardXp(amount, reason) {
      try {
        if (typeof awardXp === 'function') awardXp(amount, reason);
      } catch (err) {
        console.warn('awardXp failed', err);
      }
    }
    function buildTestsSection() {
      const wrapper = document.createElement('div');
      wrapper.className = 'mini-tester-card';

      const heading = document.createElement('h3');
      bindText(heading, 'tests.heading', 'JavaScriptセルフチェックラボ');
      wrapper.appendChild(heading);

      const description = document.createElement('p');
      bindText(description, 'tests.description', 'ブラウザが提供する代表的な機能をワンタップで検査できます。結果を共有すればデバッグにも役立ちます。');
      wrapper.appendChild(description);

      const runAllBtn = document.createElement('button');
      runAllBtn.className = 'mini-tester-button';
      bindText(runAllBtn, 'tests.runAll', 'すべて実行');
      runAllBtn.addEventListener('click', async () => {
        if (destroyed || paused) return;
        runAllBtn.disabled = true;
        await runAllTests();
        runAllBtn.disabled = false;
      });
      wrapper.appendChild(runAllBtn);

      const list = document.createElement('div');
      list.className = 'mini-tester-tests-list';
      wrapper.appendChild(list);

      TEST_DEFS.forEach(def => {
        const item = document.createElement('div');
        item.className = 'mini-tester-test-item';

        const title = document.createElement('strong');
        if (def.nameKey) {
          bindText(title, def.nameKey, def.name);
        } else {
          title.textContent = def.name;
        }
        item.appendChild(title);

        const desc = document.createElement('div');
        desc.className = 'mini-tester-test-desc';
        if (def.descriptionKey) {
          bindText(desc, def.descriptionKey, def.description);
        } else {
          desc.textContent = def.description;
        }
        item.appendChild(desc);

        const actions = document.createElement('div');
        actions.className = 'mini-tester-test-actions';
        const btn = document.createElement('button');
        btn.className = 'mini-tester-button secondary';
        bindText(btn, 'tests.runSingle', 'テスト実行');
        const resultEl = document.createElement('div');
        resultEl.className = 'mini-tester-test-result';
        actions.appendChild(btn);
        item.appendChild(actions);
        item.appendChild(resultEl);

        btn.addEventListener('click', async () => {
          if (destroyed || paused) return;
          btn.disabled = true;
          setImmediateText(resultEl, 'tests.running', '実行中…');
          try {
            const res = await def.run();
            testResults[def.id] = { ok: true, message: res, at: Date.now() };
            resultEl.textContent = `✅ ${res}`;
            safeAwardXp(2, 'tester:test');
          } catch (err) {
            testResults[def.id] = { ok: false, message: err.message, at: Date.now() };
            resultEl.textContent = `❌ ${err.message}`;
          } finally {
            btn.disabled = false;
          }
        });

        list.appendChild(item);
      });

      async function runAllTests() {
        for (const def of TEST_DEFS) {
          if (destroyed) return;
          const entry = [...list.children].find(child => child.querySelector('strong').textContent === def.name);
          if (!entry) continue;
          const btn = entry.querySelector('button');
          const resultEl = entry.querySelector('.mini-tester-test-result');
          btn.disabled = true;
          setImmediateText(resultEl, 'tests.running', '実行中…');
          try {
            const res = await def.run();
            testResults[def.id] = { ok: true, message: res, at: Date.now() };
            resultEl.textContent = `✅ ${res}`;
          } catch (err) {
            testResults[def.id] = { ok: false, message: err.message, at: Date.now() };
            resultEl.textContent = `❌ ${err.message}`;
          }
          btn.disabled = false;
        }
        const okCount = Object.values(testResults).filter(r => r.ok).length;
        if (okCount) {
          safeAwardXp(5 + okCount, 'tester:all-tests');
        }
      }

      return wrapper;
    }
    function buildBenchmarkSection() {
      const wrapper = document.createElement('div');
      wrapper.className = 'mini-tester-card';

      const heading = document.createElement('h3');
      bindText(heading, 'benchmark.heading', 'CPUベンチマーク - 1秒間のインクリメント回数');
      wrapper.appendChild(heading);

      const description = document.createElement('p');
      bindText(description, 'benchmark.description', '整数に1を加算し続け、1秒間で何回ループできるか計測します。ブラウザや端末の瞬間的な性能をチェックしましょう。');
      wrapper.appendChild(description);

      const benchDisplay = document.createElement('div');
      benchDisplay.className = 'mini-tester-bench-display';
      wrapper.appendChild(benchDisplay);

      const currentBox = document.createElement('div');
      currentBox.className = 'mini-tester-bench-box';
      const currentValue = document.createElement('div');
      currentValue.className = 'mini-tester-bench-value';
      currentValue.textContent = '—';
      const currentLabel = document.createElement('div');
      bindText(currentLabel, 'benchmark.labels.current', '最新結果 (回/秒)');
      currentLabel.style.fontSize = '12px';
      currentLabel.style.color = '#64748b';
      currentBox.appendChild(currentValue);
      currentBox.appendChild(currentLabel);

      const bestBox = document.createElement('div');
      bestBox.className = 'mini-tester-bench-box';
      const bestValue = document.createElement('div');
      bestValue.className = 'mini-tester-bench-value';
      bestValue.textContent = '—';
      const bestLabel = document.createElement('div');
      bindText(bestLabel, 'benchmark.labels.best', '自己ベスト (回/秒)');
      bestLabel.style.fontSize = '12px';
      bestLabel.style.color = '#64748b';
      bestBox.appendChild(bestValue);
      bestBox.appendChild(bestLabel);

      const streakBox = document.createElement('div');
      streakBox.className = 'mini-tester-bench-box';
      const streakValue = document.createElement('div');
      streakValue.className = 'mini-tester-bench-value';
      streakValue.textContent = '0';
      const streakLabel = document.createElement('div');
      bindText(streakLabel, 'benchmark.labels.runs', '累計実行回数');
      streakLabel.style.fontSize = '12px';
      streakLabel.style.color = '#64748b';
      streakBox.appendChild(streakValue);
      streakBox.appendChild(streakLabel);

      benchDisplay.appendChild(currentBox);
      benchDisplay.appendChild(bestBox);
      benchDisplay.appendChild(streakBox);

      const actions = document.createElement('div');
      actions.style.display = 'flex';
      actions.style.gap = '10px';
      actions.style.flexWrap = 'wrap';
      actions.style.alignItems = 'center';

      const runBtn = document.createElement('button');
      runBtn.className = 'mini-tester-button';
      bindText(runBtn, 'benchmark.start', '計測スタート (1秒)');
      actions.appendChild(runBtn);

      const stopHint = document.createElement('div');
      stopHint.style.fontSize = '12px';
      stopHint.style.color = '#64748b';
      bindText(stopHint, 'benchmark.notice', '計測中はUIが1秒間固まる場合があります。');
      actions.appendChild(stopHint);

      wrapper.appendChild(actions);

      const log = document.createElement('div');
      log.className = 'mini-tester-bench-log';
      wrapper.appendChild(log);

      runBtn.addEventListener('click', async () => {
        if (destroyed || paused || benchmarkRunning) return;
        benchmarkRunning = true;
        runBtn.disabled = true;
        appendLog(t('benchmark.log.start', '計測を開始します…'));
        await waitFrames(2);
        const result = runBenchmark();
        benchmarkRunning = false;
        runBtn.disabled = false;
        totalBenchmarkRuns++;
        streakValue.textContent = String(totalBenchmarkRuns);
        currentValue.textContent = formatNumber(result.countPerSec);
        if (result.countPerSec > bestBenchmark) {
          bestBenchmark = result.countPerSec;
          bestValue.textContent = formatNumber(bestBenchmark);
          appendLog(t('benchmark.log.record', '新記録: {value} 回/秒', { value: formatNumber(bestBenchmark) }));
          safeAwardXp(Math.min(50, Math.floor(result.countPerSec / 500000)), 'tester:benchmark-record');
        } else {
          appendLog(t('benchmark.log.result', '結果: {value} 回/秒', { value: formatNumber(result.countPerSec) }));
          safeAwardXp(Math.min(15, Math.floor(result.countPerSec / 1000000) + 1), 'tester:benchmark');
        }
      });

      function appendLog(text) {
        const entry = document.createElement('div');
        entry.className = 'mini-tester-bench-log-entry';
        const timestamp = new Date().toLocaleTimeString('ja-JP', { hour12: false });
        entry.textContent = `[${timestamp}] ${text}`;
        log.prepend(entry);
        while (log.children.length > 20) {
          log.removeChild(log.lastChild);
        }
      }

      function runBenchmark() {
        const start = performance.now();
        let counter = 0;
        let value = 0;
        const endAt = start + 1000;
        while (performance.now() < endAt) {
          value += 1;
          counter++;
        }
        const elapsed = performance.now() - start;
        const perSec = counter * (1000 / elapsed);
        return { counter, elapsed, countPerSec: perSec };
      }

      return wrapper;
    }
    function buildBlocksSection() {
      const root = document.createElement('div');
      root.className = 'mini-tester-blocks';

      const left = document.createElement('div');
      left.className = 'mini-tester-blocks-left';
      const right = document.createElement('div');
      right.className = 'mini-tester-blocks-right';

      const blockControls = document.createElement('div');
      blockControls.style.display = 'flex';
      blockControls.style.gap = '8px';
      const addBtn = document.createElement('button');
      addBtn.className = 'mini-tester-button';
      bindText(addBtn, 'blocks.controls.add', 'ブロックを追加');
      blockControls.appendChild(addBtn);

      const clearBtn = document.createElement('button');
      clearBtn.className = 'mini-tester-button secondary';
      bindText(clearBtn, 'blocks.controls.clear', '全削除');
      blockControls.appendChild(clearBtn);

      left.appendChild(blockControls);

      const blockList = document.createElement('div');
      blockList.className = 'mini-tester-block-list';
      left.appendChild(blockList);

      const alertCard = document.createElement('div');
      alertCard.className = 'mini-tester-card mini-tester-alert-editor';
      const alertTitle = document.createElement('h3');
      bindText(alertTitle, 'blocks.alert.title', 'カスタムAlert関数');
      alertCard.appendChild(alertTitle);
      const alertDesc = document.createElement('p');
      bindText(alertDesc, 'blocks.alert.description', 'message, context を受け取る関数本体を記述します。context.flags や context.log を使って高度な演出が可能です。');
      alertCard.appendChild(alertDesc);
      const alertTextarea = document.createElement('textarea');
      alertTextarea.value = t('blocks.alert.template', () => `// message: string\n// context: { flags, log, awardXp }\nconst box = document.createElement('div');\nbox.textContent = message;\nbox.style.padding = '16px';\nbox.style.background = 'rgba(96,165,250,0.15)';\nbox.style.border = '1px solid rgba(96,165,250,0.4)';\nbox.style.borderRadius = '12px';\nbox.style.margin = '6px 0';\ncontext.log(box);\n`);
      alertCard.appendChild(alertTextarea);
      const alertActions = document.createElement('div');
      alertActions.style.display = 'flex';
      alertActions.style.gap = '8px';
      alertActions.style.marginTop = '8px';
      const alertApply = document.createElement('button');
      alertApply.className = 'mini-tester-button';
      bindText(alertApply, 'blocks.alert.apply', '更新');
      const alertTest = document.createElement('button');
      alertTest.className = 'mini-tester-button secondary';
      bindText(alertTest, 'blocks.alert.test', 'テスト実行');
      alertActions.appendChild(alertApply);
      alertActions.appendChild(alertTest);
      alertCard.appendChild(alertActions);
      const alertStatus = document.createElement('div');
      alertStatus.className = 'mini-tester-alert-status';
      alertStatusEl = alertStatus;
      setAlertStatus('blocks.alert.statusDefault', '既定: ログに表示します。alert() に変えることも可能です。');
      alertCard.appendChild(alertStatus);
      right.appendChild(alertCard);

      const storyCard = document.createElement('div');
      storyCard.className = 'mini-tester-card';
      const storyHeader = document.createElement('div');
      storyHeader.style.display = 'flex';
      storyHeader.style.justifyContent = 'space-between';
      storyHeader.style.alignItems = 'center';
      const storyTitle = document.createElement('h3');
      bindText(storyTitle, 'blocks.story.title', 'ブロックストーリーランナー');
      storyHeader.appendChild(storyTitle);
      const storyButtons = document.createElement('div');
      storyButtons.style.display = 'flex';
      storyButtons.style.gap = '8px';
      const runStoryBtn = document.createElement('button');
      runStoryBtn.className = 'mini-tester-button';
      bindText(runStoryBtn, 'blocks.story.play', 'ストーリー再生');
      const stopStoryBtn = document.createElement('button');
      stopStoryBtn.className = 'mini-tester-button secondary';
      bindText(stopStoryBtn, 'blocks.story.stop', '停止');
      storyButtons.appendChild(runStoryBtn);
      storyButtons.appendChild(stopStoryBtn);
      storyHeader.appendChild(storyButtons);
      storyCard.appendChild(storyHeader);

      const storyLog = document.createElement('div');
      storyLog.className = 'mini-tester-story-log';
      storyCard.appendChild(storyLog);

      const variableCard = document.createElement('div');
      variableCard.className = 'mini-tester-variables';
      const varTitle = document.createElement('div');
      bindText(varTitle, 'blocks.variables.title', '変数ビュー (flags)');
      variableCard.appendChild(varTitle);
      const varBody = document.createElement('div');
      varBodyEl = varBody;
      variablesEmpty = true;
      setImmediateText(varBody, 'blocks.variables.empty', '(空)');
      variableCard.appendChild(varBody);
      storyCard.appendChild(variableCard);

      right.appendChild(storyCard);

      root.appendChild(left);
      root.appendChild(right);

      addBtn.addEventListener('click', () => {
        addBlock();
      });

      clearBtn.addEventListener('click', () => {
        storyBlocks = [];
        renderBlocks();
      });

      alertApply.addEventListener('click', () => {
        try {
          const fn = new Function('message', 'context', alertTextarea.value);
          customAlertImpl = (message, context) => {
            return fn.call(context, message, context);
          };
          setAlertStatus('blocks.alert.statusApplied', '✅ カスタムalertを適用しました。');
        } catch (err) {
          setAlertStatus('blocks.alert.statusError', () => `❌ エラー: ${err.message}`, { message: err.message });
        }
      });

      alertTest.addEventListener('click', () => {
        if (destroyed) return;
        try {
          customAlertImpl(t('blocks.alert.testMessage', 'カスタムalertのテストです。'), {
            flags: {},
            log: el => appendStoryLog(el, 'alert-test'),
            awardXp: (n, reason) => safeAwardXp(n, reason || 'tester:alert-test')
          });
          setAlertStatus('blocks.alert.statusTestSent', '✅ テストメッセージを送信しました。');
          if (!lastAlertTestAwarded) {
            safeAwardXp(3, 'tester:alert-first');
            lastAlertTestAwarded = true;
          }
        } catch (err) {
          setAlertStatus('blocks.alert.statusTestError', () => `❌ 実行エラー: ${err.message}`, { message: err.message });
        }
      });

      runStoryBtn.addEventListener('click', async () => {
        if (destroyed || paused) return;
        runStoryBtn.disabled = true;
        stopStoryBtn.disabled = false;
        storyRunToken++;
        const token = storyRunToken;
        storyLog.innerHTML = '';
        appendStoryLog(t('blocks.story.logStart', '▶ ストーリー開始 ({count} ブロック)', { count: storyBlocks.length }));
        const context = {
          flags: {},
          lastChoice: null,
          step: 0,
          awardXp: (n, reason) => safeAwardXp(n, reason || 'tester:story-award'),
          log: (elementOrText) => appendStoryLog(elementOrText, 'custom'),
          stop: () => { storyRunToken++; },
        };
        updateVariables(context.flags);
        try {
          await runStory(context, token);
        } catch (err) {
          appendStoryLog(t('blocks.story.logAborted', () => `⚠ 実行中断: ${err.message}`, { message: err.message }));
        }
        runStoryBtn.disabled = false;
        stopStoryBtn.disabled = true;
        appendStoryLog(t('blocks.story.logEnd', '■ ストーリー終了'));
      });

      stopStoryBtn.addEventListener('click', () => {
        storyRunToken++;
        stopStoryBtn.disabled = true;
        appendStoryLog(t('blocks.story.logUserStop', '■ ユーザーが停止しました'));
      });
      stopStoryBtn.disabled = true;
      function addBlock(type = 'text') {
        storyBlocks.push(createBlock(type));
        renderBlocks();
      }

      function createBlock(type = 'text') {
        switch (type) {
          case 'choice':
            return {
              type: 'choice',
              question: t('blocks.defaults.choiceQuestion', 'どうする？'),
              storeAs: 'choice',
              options: [
                { label: t('blocks.defaults.choiceGo', '進む'), target: '', value: 'go' },
                { label: t('blocks.defaults.choiceStop', 'やめる'), target: '', value: 'stop' }
              ]
            };
          case 'set':
            return { type: 'set', name: 'flagName', value: 'true', next: '' };
          case 'jump':
            return { type: 'jump', name: 'flagName', equals: 'true', target: '', elseTarget: '' };
          case 'award':
            return { type: 'award', amount: 10, next: '' };
          case 'control':
            return {
              type: 'control',
              mode: 'confirm',
              message: t('blocks.defaults.controlMessage', '進みますか？'),
              storeAs: 'answer',
              yesLabel: t('blocks.defaults.yes', 'はい'),
              yesValue: 'yes',
              yesTarget: '',
              noLabel: t('blocks.defaults.no', 'いいえ'),
              noValue: 'no',
              noTarget: ''
            };
          default:
            return { type: 'text', text: t('blocks.defaults.message', 'メッセージ'), delivery: 'log', next: '' };
        }
      }

      function renderBlocks(activeIndex = -1) {
        blockList.innerHTML = '';
        storyBlocks.forEach((block, index) => {
          const item = document.createElement('div');
          item.className = 'mini-tester-block-item';
          if (index === activeIndex) item.classList.add('active');

          const header = document.createElement('div');
          header.className = 'mini-tester-block-header';
          const label = document.createElement('div');
          label.textContent = `#${index}`;
          header.appendChild(label);

          const typeSelect = document.createElement('select');
          const typeLabels = {
            text: t('blocks.types.text', 'text'),
            choice: t('blocks.types.choice', 'choice'),
            set: t('blocks.types.set', 'set'),
            jump: t('blocks.types.jump', 'jump'),
            award: t('blocks.types.award', 'award'),
            control: t('blocks.types.control', 'control')
          };
          ['text', 'choice', 'set', 'jump', 'award', 'control'].forEach(tType => {
            const option = document.createElement('option');
            option.value = tType;
            option.textContent = typeLabels[tType] || tType;
            if (block.type === tType) option.selected = true;
            typeSelect.appendChild(option);
          });
          header.appendChild(typeSelect);

          const reorder = document.createElement('div');
          reorder.style.display = 'flex';
          reorder.style.gap = '4px';
          const upBtn = document.createElement('button');
          upBtn.className = 'mini-tester-button secondary';
          upBtn.textContent = '▲';
          upBtn.style.padding = '4px 8px';
          const downBtn = document.createElement('button');
          downBtn.className = 'mini-tester-button secondary';
          downBtn.textContent = '▼';
          downBtn.style.padding = '4px 8px';
          reorder.appendChild(upBtn);
          reorder.appendChild(downBtn);
          header.appendChild(reorder);

          item.appendChild(header);

          const body = document.createElement('div');
          body.className = 'mini-tester-block-body';
          renderBlockBody(block, body, index);
          item.appendChild(body);

          const actions = document.createElement('div');
          actions.className = 'mini-tester-block-actions';
          const deleteBtn = document.createElement('button');
          deleteBtn.className = 'mini-tester-button danger';
          deleteBtn.textContent = '削除';
          actions.appendChild(deleteBtn);
          item.appendChild(actions);

          typeSelect.addEventListener('change', () => {
            const newBlock = createBlock(typeSelect.value);
            storyBlocks[index] = Object.assign(newBlock, { id: block.id });
            renderBlocks(index);
          });

          upBtn.addEventListener('click', () => {
            if (index === 0) return;
            const tmp = storyBlocks[index - 1];
            storyBlocks[index - 1] = storyBlocks[index];
            storyBlocks[index] = tmp;
            renderBlocks(index - 1);
          });

          downBtn.addEventListener('click', () => {
            if (index >= storyBlocks.length - 1) return;
            const tmp = storyBlocks[index + 1];
            storyBlocks[index + 1] = storyBlocks[index];
            storyBlocks[index] = tmp;
            renderBlocks(index + 1);
          });

          deleteBtn.addEventListener('click', () => {
            storyBlocks.splice(index, 1);
            renderBlocks();
          });

          blockList.appendChild(item);
        });
      }
      function renderBlockBody(block, body, index) {
        body.innerHTML = '';
        switch (block.type) {
          case 'text':
            renderTextBlock(block, body, index);
            break;
          case 'choice':
            renderChoiceBlock(block, body, index);
            break;
          case 'set':
            renderSetBlock(block, body, index);
            break;
          case 'jump':
            renderJumpBlock(block, body, index);
            break;
          case 'award':
            renderAwardBlock(block, body, index);
            break;
          case 'control':
            renderControlBlock(block, body, index);
            break;
        }
      }

      function renderTextBlock(block, body, index) {
        const textarea = document.createElement('textarea');
        textarea.value = block.text || '';
        bindPlaceholder(textarea, 'blocks.text.placeholder', '表示するメッセージ');
        textarea.addEventListener('input', () => {
          block.text = textarea.value;
        });
        body.appendChild(textarea);

        const delivery = document.createElement('select');
        [
          ['log', t('blocks.text.delivery.log', 'ログに出力')],
          ['alert', t('blocks.text.delivery.alert', 'カスタムalert')],
          ['both', t('blocks.text.delivery.both', '両方')]
        ].forEach(([value, label]) => {
          const option = document.createElement('option');
          option.value = value;
          option.textContent = label;
          if ((block.delivery || 'log') === value) option.selected = true;
          delivery.appendChild(option);
        });
        delivery.addEventListener('change', () => {
          block.delivery = delivery.value;
        });
        body.appendChild(delivery);

        const nextRow = document.createElement('div');
        nextRow.style.display = 'flex';
        nextRow.style.gap = '6px';
        nextRow.style.marginTop = '6px';
        const nextLabel = document.createElement('div');
        bindText(nextLabel, 'blocks.text.nextLabel', '次に進むブロック (# または空)');
        nextLabel.style.fontSize = '11px';
        nextLabel.style.color = '#64748b';
        nextRow.appendChild(nextLabel);
        body.appendChild(nextRow);

        const nextInput = document.createElement('input');
        nextInput.type = 'number';
        nextInput.min = '0';
        bindPlaceholder(nextInput, 'blocks.text.nextPlaceholder', '空なら自動で次');
        nextInput.value = block.next ?? '';
        nextInput.addEventListener('input', () => {
          block.next = nextInput.value;
        });
        body.appendChild(nextInput);
      }

      function renderChoiceBlock(block, body, index) {
        const question = document.createElement('textarea');
        question.value = block.question || '';
        bindPlaceholder(question, 'blocks.choice.questionPlaceholder', '選択肢の前に表示する文章');
        question.addEventListener('input', () => { block.question = question.value; });
        body.appendChild(question);

        const storeAs = document.createElement('input');
        storeAs.type = 'text';
        bindPlaceholder(storeAs, 'blocks.choice.storePlaceholder', '選択した値を保存する変数名 (例: choice)');
        storeAs.value = block.storeAs || 'choice';
        storeAs.addEventListener('input', () => { block.storeAs = storeAs.value; });
        body.appendChild(storeAs);

        const optionsContainer = document.createElement('div');
        optionsContainer.style.display = 'flex';
        optionsContainer.style.flexDirection = 'column';
        optionsContainer.style.gap = '6px';
        body.appendChild(optionsContainer);

        block.options ||= [];

        const renderOptions = () => {
          optionsContainer.innerHTML = '';
          block.options.forEach((opt, optIndex) => {
            const row = document.createElement('div');
            row.style.display = 'grid';
            row.style.gridTemplateColumns = '1fr 80px 80px auto';
            row.style.gap = '6px';

            const labelInput = document.createElement('input');
            labelInput.type = 'text';
            labelInput.value = opt.label || '';
            bindPlaceholder(labelInput, 'blocks.choice.labelPlaceholder', 'ボタン表示');
            labelInput.addEventListener('input', () => { opt.label = labelInput.value; });
            row.appendChild(labelInput);

            const valueInput = document.createElement('input');
            valueInput.type = 'text';
            valueInput.value = opt.value ?? '';
            bindPlaceholder(valueInput, 'blocks.choice.valuePlaceholder', '保存する値');
            valueInput.addEventListener('input', () => { opt.value = valueInput.value; });
            row.appendChild(valueInput);

            const targetInput = document.createElement('input');
            targetInput.type = 'number';
            targetInput.min = '0';
            bindPlaceholder(targetInput, 'blocks.choice.targetPlaceholder', '次の#');
            targetInput.value = opt.target ?? '';
            targetInput.addEventListener('input', () => { opt.target = targetInput.value; });
            row.appendChild(targetInput);

            const removeBtn = document.createElement('button');
            removeBtn.className = 'mini-tester-button danger';
            removeBtn.textContent = '×';
            removeBtn.style.padding = '4px 10px';
            removeBtn.addEventListener('click', () => {
              block.options.splice(optIndex, 1);
              renderOptions();
            });
            row.appendChild(removeBtn);

            optionsContainer.appendChild(row);
          });
        };

        const addOptionBtn = document.createElement('button');
        addOptionBtn.className = 'mini-tester-button secondary';
        bindText(addOptionBtn, 'blocks.choice.addOption', '選択肢を追加');
        addOptionBtn.addEventListener('click', () => {
          block.options.push({ label: t('blocks.choice.newOption', '新しい選択肢'), value: '', target: '' });
          renderOptions();
        });
        body.appendChild(addOptionBtn);

        renderOptions();
      }
      function renderSetBlock(block, body, index) {
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        bindPlaceholder(nameInput, 'blocks.set.namePlaceholder', '変数名');
        nameInput.value = block.name || 'flag';
        nameInput.addEventListener('input', () => { block.name = nameInput.value; });
        body.appendChild(nameInput);

        const valueInput = document.createElement('input');
        valueInput.type = 'text';
        bindPlaceholder(valueInput, 'blocks.set.valuePlaceholder', '値 (文字列)');
        valueInput.value = block.value ?? '';
        valueInput.addEventListener('input', () => { block.value = valueInput.value; });
        body.appendChild(valueInput);

        const nextInput = document.createElement('input');
        nextInput.type = 'number';
        bindPlaceholder(nextInput, 'blocks.set.nextPlaceholder', '次のブロック (空=順番通り)');
        nextInput.value = block.next ?? '';
        nextInput.addEventListener('input', () => { block.next = nextInput.value; });
        body.appendChild(nextInput);
      }

      function renderJumpBlock(block, body, index) {
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        bindPlaceholder(nameInput, 'blocks.jump.namePlaceholder', '判定する変数名');
        nameInput.value = block.name || '';
        nameInput.addEventListener('input', () => { block.name = nameInput.value; });
        body.appendChild(nameInput);

        const equalsInput = document.createElement('input');
        equalsInput.type = 'text';
        bindPlaceholder(equalsInput, 'blocks.jump.equalsPlaceholder', '比較値 (文字列)');
        equalsInput.value = block.equals ?? '';
        equalsInput.addEventListener('input', () => { block.equals = equalsInput.value; });
        body.appendChild(equalsInput);

        const targetInput = document.createElement('input');
        targetInput.type = 'number';
        bindPlaceholder(targetInput, 'blocks.jump.targetPlaceholder', '一致した時のブロック#');
        targetInput.value = block.target ?? '';
        targetInput.addEventListener('input', () => { block.target = targetInput.value; });
        body.appendChild(targetInput);

        const elseInput = document.createElement('input');
        elseInput.type = 'number';
        bindPlaceholder(elseInput, 'blocks.jump.elsePlaceholder', '不一致の時のブロック# (空=次)');
        elseInput.value = block.elseTarget ?? '';
        elseInput.addEventListener('input', () => { block.elseTarget = elseInput.value; });
        body.appendChild(elseInput);
      }

      function renderAwardBlock(block, body, index) {
        const amountInput = document.createElement('input');
        amountInput.type = 'number';
        bindPlaceholder(amountInput, 'blocks.award.amountPlaceholder', '付与するEXP (負数も可)');
        amountInput.value = block.amount ?? 0;
        amountInput.addEventListener('input', () => { block.amount = Number(amountInput.value || 0); });
        body.appendChild(amountInput);

        const nextInput = document.createElement('input');
        nextInput.type = 'number';
        bindPlaceholder(nextInput, 'blocks.award.nextPlaceholder', '次のブロック (空=順番通り)');
        nextInput.value = block.next ?? '';
        nextInput.addEventListener('input', () => { block.next = nextInput.value; });
        body.appendChild(nextInput);
      }

      function renderControlBlock(block, body, index) {
        if (!block.mode) block.mode = 'confirm';
        const modeRow = document.createElement('div');
        modeRow.style.display = 'flex';
        modeRow.style.gap = '6px';
        modeRow.style.alignItems = 'center';
        const modeLabel = document.createElement('span');
        bindText(modeLabel, 'blocks.control.modeLabel', '種類');
        modeLabel.style.fontSize = '12px';
        modeLabel.style.color = '#64748b';
        modeRow.appendChild(modeLabel);
        const modeSelect = document.createElement('select');
        [
          ['confirm', t('blocks.control.modeConfirm', '確認 (はい/いいえ)')],
          ['prompt', t('blocks.control.modePrompt', '入力ボックス')]
        ].forEach(([value, label]) => {
          const option = document.createElement('option');
          option.value = value;
          option.textContent = label;
          if (block.mode === value) option.selected = true;
          modeSelect.appendChild(option);
        });
        modeRow.appendChild(modeSelect);
        body.appendChild(modeRow);

        const dynamic = document.createElement('div');
        dynamic.style.display = 'flex';
        dynamic.style.flexDirection = 'column';
        dynamic.style.gap = '6px';
        body.appendChild(dynamic);

        const renderConfirmFields = () => {
          if (!('storeAs' in block)) block.storeAs = 'answer';
          if (!('message' in block)) block.message = t('blocks.defaults.controlMessage', '進みますか？');
          if (!('yesLabel' in block)) block.yesLabel = t('blocks.defaults.yes', 'はい');
          if (!('noLabel' in block)) block.noLabel = t('blocks.defaults.no', 'いいえ');
          if (!('yesValue' in block)) block.yesValue = 'yes';
          if (!('noValue' in block)) block.noValue = 'no';

          const textarea = document.createElement('textarea');
          textarea.value = block.message || '';
          bindPlaceholder(textarea, 'blocks.control.messagePlaceholder', '表示するメッセージ');
          textarea.addEventListener('input', () => { block.message = textarea.value; });
          dynamic.appendChild(textarea);

          const storeInput = document.createElement('input');
          storeInput.type = 'text';
          bindPlaceholder(storeInput, 'blocks.control.storePlaceholder', '結果を保存する変数名 (空=保存しない)');
          storeInput.value = block.storeAs || '';
          storeInput.addEventListener('input', () => { block.storeAs = storeInput.value; });
          dynamic.appendChild(storeInput);

          const yesLabel = document.createElement('input');
          yesLabel.type = 'text';
          bindPlaceholder(yesLabel, 'blocks.control.yesLabel', 'はいボタンの表示');
          yesLabel.value = block.yesLabel || '';
          yesLabel.addEventListener('input', () => { block.yesLabel = yesLabel.value; });
          dynamic.appendChild(yesLabel);

          const yesValue = document.createElement('input');
          yesValue.type = 'text';
          bindPlaceholder(yesValue, 'blocks.control.yesValue', 'はいを押した時に保存する値');
          yesValue.value = block.yesValue ?? '';
          yesValue.addEventListener('input', () => { block.yesValue = yesValue.value; });
          dynamic.appendChild(yesValue);

          const yesTarget = document.createElement('input');
          yesTarget.type = 'number';
          bindPlaceholder(yesTarget, 'blocks.control.yesTarget', 'はいの次ブロック# (空=次)');
          yesTarget.value = block.yesTarget ?? '';
          yesTarget.addEventListener('input', () => { block.yesTarget = yesTarget.value; });
          dynamic.appendChild(yesTarget);

          const noLabel = document.createElement('input');
          noLabel.type = 'text';
          bindPlaceholder(noLabel, 'blocks.control.noLabel', 'いいえボタンの表示');
          noLabel.value = block.noLabel || '';
          noLabel.addEventListener('input', () => { block.noLabel = noLabel.value; });
          dynamic.appendChild(noLabel);

          const noValue = document.createElement('input');
          noValue.type = 'text';
          bindPlaceholder(noValue, 'blocks.control.noValue', 'いいえを押した時に保存する値');
          noValue.value = block.noValue ?? '';
          noValue.addEventListener('input', () => { block.noValue = noValue.value; });
          dynamic.appendChild(noValue);

          const noTarget = document.createElement('input');
          noTarget.type = 'number';
          bindPlaceholder(noTarget, 'blocks.control.noTarget', 'いいえの次ブロック# (空=次)');
          noTarget.value = block.noTarget ?? '';
          noTarget.addEventListener('input', () => { block.noTarget = noTarget.value; });
          dynamic.appendChild(noTarget);
        };

        const renderPromptFields = () => {
          if (!('storeAs' in block)) block.storeAs = 'input';
          if (!('message' in block)) block.message = t('blocks.defaults.prompt', '名前を入力してください');
          if (!('defaultValue' in block)) block.defaultValue = '';
          if (!('defaultFrom' in block)) block.defaultFrom = '';
          if (!('allowEmpty' in block)) block.allowEmpty = false;
          if (!('okLabel' in block)) block.okLabel = t('blocks.control.okLabel', '決定');
          if (!('cancelLabel' in block)) block.cancelLabel = t('blocks.control.cancelLabel', 'キャンセル');
          if (!('cancelValue' in block)) block.cancelValue = 'cancel';
          if (!('inputType' in block)) block.inputType = 'text';

          const textarea = document.createElement('textarea');
          textarea.value = block.message || '';
          bindPlaceholder(textarea, 'blocks.prompt.messagePlaceholder', '入力ボックスの前に表示する文章');
          textarea.addEventListener('input', () => { block.message = textarea.value; });
          dynamic.appendChild(textarea);

          const storeInput = document.createElement('input');
          storeInput.type = 'text';
          bindPlaceholder(storeInput, 'blocks.prompt.storePlaceholder', '入力値を保存する変数名');
          storeInput.value = block.storeAs || '';
          storeInput.addEventListener('input', () => { block.storeAs = storeInput.value; });
          dynamic.appendChild(storeInput);

          const typeSelect = document.createElement('select');
          [
            ['text', t('blocks.prompt.inputTypeText', 'テキスト')],
            ['number', t('blocks.prompt.inputTypeNumber', '数値')]
          ].forEach(([value, label]) => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = label;
            if ((block.inputType || 'text') === value) option.selected = true;
            typeSelect.appendChild(option);
          });
          typeSelect.addEventListener('change', () => { block.inputType = typeSelect.value; });
          dynamic.appendChild(typeSelect);

          const defaultInput = document.createElement('input');
          defaultInput.type = 'text';
          bindPlaceholder(defaultInput, 'blocks.prompt.defaultValue', '既定値 (固定文字列)');
          defaultInput.value = block.defaultValue ?? '';
          defaultInput.addEventListener('input', () => { block.defaultValue = defaultInput.value; });
          dynamic.appendChild(defaultInput);

          const fromInput = document.createElement('input');
          fromInput.type = 'text';
          bindPlaceholder(fromInput, 'blocks.prompt.defaultFrom', '既定値を読み込む変数名 (空=固定)');
          fromInput.value = block.defaultFrom || '';
          fromInput.addEventListener('input', () => { block.defaultFrom = fromInput.value; });
          dynamic.appendChild(fromInput);

          const allowEmptyLabel = document.createElement('label');
          allowEmptyLabel.style.display = 'flex';
          allowEmptyLabel.style.alignItems = 'center';
          allowEmptyLabel.style.gap = '6px';
          const allowEmptyCheckbox = document.createElement('input');
          allowEmptyCheckbox.type = 'checkbox';
          allowEmptyCheckbox.checked = !!block.allowEmpty;
          allowEmptyCheckbox.addEventListener('change', () => { block.allowEmpty = allowEmptyCheckbox.checked; });
          allowEmptyLabel.appendChild(allowEmptyCheckbox);
          const allowEmptyText = document.createElement('span');
          bindText(allowEmptyText, 'blocks.prompt.allowEmpty', '空入力を許可');
          allowEmptyLabel.appendChild(allowEmptyText);
          dynamic.appendChild(allowEmptyLabel);

          const okLabelInput = document.createElement('input');
          okLabelInput.type = 'text';
          bindPlaceholder(okLabelInput, 'blocks.prompt.okLabel', '決定ボタンの表示');
          okLabelInput.value = block.okLabel || '';
          okLabelInput.addEventListener('input', () => { block.okLabel = okLabelInput.value; });
          dynamic.appendChild(okLabelInput);

          const okTarget = document.createElement('input');
          okTarget.type = 'number';
          bindPlaceholder(okTarget, 'blocks.prompt.okTarget', '決定後のブロック# (空=次)');
          okTarget.value = block.okTarget ?? '';
          okTarget.addEventListener('input', () => { block.okTarget = okTarget.value; });
          dynamic.appendChild(okTarget);

          const cancelLabelInput = document.createElement('input');
          cancelLabelInput.type = 'text';
          bindPlaceholder(cancelLabelInput, 'blocks.prompt.cancelLabel', 'キャンセルボタンの表示');
          cancelLabelInput.value = block.cancelLabel || '';
          cancelLabelInput.addEventListener('input', () => { block.cancelLabel = cancelLabelInput.value; });
          dynamic.appendChild(cancelLabelInput);

          const cancelValueInput = document.createElement('input');
          cancelValueInput.type = 'text';
          bindPlaceholder(cancelValueInput, 'blocks.prompt.cancelValue', 'キャンセル時に保存する値');
          cancelValueInput.value = block.cancelValue ?? '';
          cancelValueInput.addEventListener('input', () => { block.cancelValue = cancelValueInput.value; });
          dynamic.appendChild(cancelValueInput);

          const cancelTarget = document.createElement('input');
          cancelTarget.type = 'number';
          bindPlaceholder(cancelTarget, 'blocks.prompt.cancelTarget', 'キャンセル後のブロック# (空=次)');
          cancelTarget.value = block.cancelTarget ?? '';
          cancelTarget.addEventListener('input', () => { block.cancelTarget = cancelTarget.value; });
          dynamic.appendChild(cancelTarget);
        };

        const rerender = () => {
          dynamic.innerHTML = '';
          if (block.mode === 'confirm') {
            renderConfirmFields();
          } else {
            renderPromptFields();
          }
        };

        modeSelect.addEventListener('change', () => {
          block.mode = modeSelect.value;
          rerender();
        });

        rerender();
      }

      function appendStoryLog(content, type = 'log') {
        const entry = document.createElement('div');
        entry.className = 'mini-tester-story-log-entry';
        if (content instanceof HTMLElement) {
          entry.appendChild(content);
        } else {
          entry.textContent = String(content);
        }
        storyLog.appendChild(entry);
        storyLog.scrollTop = storyLog.scrollHeight;
      }

      function updateVariables(flags) {
        const keys = Object.keys(flags || {});
        if (!keys.length) {
          variablesEmpty = true;
          setImmediateText(varBody, 'blocks.variables.empty', '(空)');
          return;
        }
        variablesEmpty = false;
        varBody.textContent = '';
        const list = document.createElement('div');
        list.style.display = 'flex';
        list.style.flexDirection = 'column';
        list.style.gap = '4px';
        keys.forEach(key => {
          const row = document.createElement('div');
          row.textContent = `${key}: ${JSON.stringify(flags[key])}`;
          list.appendChild(row);
        });
        varBody.appendChild(list);
      }

      async function runStory(context, token) {
        if (!storyBlocks.length) {
          appendStoryLog(t('blocks.story.logEmpty', '⚠ ブロックが1つもありません。'));
          return;
        }
        let stepCount = 0;
        let index = 0;
        const maxSteps = 999;
        while (!destroyed && storyRunToken === token && index >= 0 && index < storyBlocks.length) {
          if (stepCount++ > maxSteps) throw new Error(t('blocks.errors.tooManySteps', 'ステップ回数が多すぎます。ループしていませんか？'));
          const block = storyBlocks[index];
          renderBlocks(index);
          switch (block.type) {
            case 'text':
              await executeTextBlock(block, context);
              index = resolveNextIndex(index, block.next);
              break;
            case 'choice':
              const nextIndex = await executeChoiceBlock(block, context, token);
              index = typeof nextIndex === 'number' ? nextIndex : index + 1;
              break;
            case 'set':
              context.flags[block.name || 'flag'] = block.value ?? '';
              appendStoryLog(`[SET] ${block.name || 'flag'} = ${JSON.stringify(block.value ?? '')}`);
              updateVariables(context.flags);
              index = resolveNextIndex(index, block.next);
              break;
            case 'jump':
              const name = block.name || '';
              const value = context.flags[name];
              const expected = block.equals ?? '';
              const matches = String(value) === String(expected);
              const status = matches
                ? t('blocks.logs.jumpMatch', '一致')
                : t('blocks.logs.jumpMismatch', '不一致');
              appendStoryLog(t('blocks.logs.jump', '[JUMP] {name}={value} => {status}', {
                name,
                value: JSON.stringify(value),
                status
              }));
              index = matches ? resolveIndex(block.target, index + 1) : resolveIndex(block.elseTarget, index + 1);
              break;
            case 'award':
              const amount = Number(block.amount || 0);
              if (amount !== 0) {
                safeAwardXp(amount, 'tester:story-block');
                appendStoryLog(`[EXP] ${amount > 0 ? '+' : ''}${amount} EXP`);
              }
              index = resolveNextIndex(index, block.next);
              break;
            case 'control':
              const controlNext = await executeControlBlock(block, context, token, index);
              index = typeof controlNext === 'number' ? controlNext : index + 1;
              break;
            default:
              index++;
              break;
          }
          await waitFrames(1);
        }
        renderBlocks();
      }

      async function executeTextBlock(block, context) {
        const mode = block.delivery || 'log';
        const message = block.text || '';
        if (mode === 'log' || mode === 'both') {
          appendStoryLog(message);
        }
        if (mode === 'alert' || mode === 'both') {
          try {
            await customAlertImpl(message, {
              flags: context.flags,
              log: (value) => appendStoryLog(value, 'custom'),
              awardXp: context.awardXp,
              context
            });
          } catch (err) {
            appendStoryLog(t('blocks.logs.alertError', () => `❌ alert実行エラー: ${err.message}`, { message: err.message }));
          }
        }
      }

      function executeControlBlock(block, context, token, currentIndex) {
        return new Promise(resolve => {
          const mode = block.mode || 'confirm';
          const container = document.createElement('div');
          container.className = 'mini-tester-control-block';
          const makeSummary = (labelText, messageText, resultText) => {
            container.innerHTML = '';
            const header = document.createElement('div');
            header.className = 'mini-tester-control-message';
            const labelSpan = document.createElement('span');
            labelSpan.className = 'label';
            labelSpan.textContent = labelText;
            header.appendChild(labelSpan);
            if (messageText) {
              header.appendChild(document.createTextNode(messageText));
            }
            container.appendChild(header);
            if (resultText) {
              const result = document.createElement('div');
              result.textContent = resultText;
              container.appendChild(result);
            }
          };

          const labelText = mode === 'prompt'
            ? t('blocks.control.labelPrompt', '入力')
            : t('blocks.control.labelConfirm', '確認');
          const messageLine = document.createElement('div');
          messageLine.className = 'mini-tester-control-message';
          const labelSpan = document.createElement('span');
          labelSpan.className = 'label';
          labelSpan.textContent = labelText;
          messageLine.appendChild(labelSpan);
          if (block.message) {
            messageLine.appendChild(document.createTextNode(block.message));
          }
          container.appendChild(messageLine);

          let settled = false;
          const finish = (nextIndex) => {
            if (settled) return;
            settled = true;
            resolve(nextIndex);
          };

          if (mode === 'prompt') {
            const input = document.createElement('input');
            input.className = 'mini-tester-control-input';
            input.type = (block.inputType || 'text') === 'number' ? 'number' : 'text';
            if (input.type === 'number') input.step = 'any';
            let initialValue = block.defaultValue ?? '';
            if (block.defaultFrom) {
              const fromValue = context.flags[block.defaultFrom];
              if (typeof fromValue !== 'undefined' && fromValue !== null) {
                initialValue = fromValue;
              }
            }
            if (typeof initialValue !== 'undefined' && initialValue !== null) {
              input.value = String(initialValue);
            }
            container.appendChild(input);

            const error = document.createElement('div');
            error.className = 'mini-tester-control-error';
            error.textContent = '';
            container.appendChild(error);

            const actions = document.createElement('div');
            actions.className = 'mini-tester-control-actions';
            const okBtn = document.createElement('button');
            okBtn.textContent = block.okLabel || t('blocks.control.okLabel', '決定');
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = block.cancelLabel || t('blocks.control.cancelLabel', 'キャンセル');
            actions.appendChild(okBtn);
            actions.appendChild(cancelBtn);
            container.appendChild(actions);

            okBtn.addEventListener('click', () => {
              if (storyRunToken !== token || settled) return;
              const raw = input.value;
              if (!block.allowEmpty && raw === '') {
                setImmediateText(error, 'blocks.control.errorRequired', '値を入力してください。');
                input.focus();
                return;
              }
              let storedValue = raw;
              if ((block.inputType || 'text') === 'number' && raw !== '') {
                storedValue = Number(raw);
                if (!Number.isFinite(storedValue)) {
                  setImmediateText(error, 'blocks.control.errorNumber', '数値を入力してください。');
                  input.focus();
                  return;
                }
              }
              error.textContent = '';
              if (block.storeAs) {
                context.flags[block.storeAs] = storedValue;
                updateVariables(context.flags);
              }
              const summaryText = block.storeAs
                ? t('blocks.control.summaryStored', '▶ {variable} = {value}', {
                  variable: block.storeAs,
                  value: JSON.stringify(storedValue)
                })
                : t('blocks.control.summaryValueOnly', '▶ 値 = {value}', {
                  value: JSON.stringify(storedValue)
                });
              makeSummary(labelText, block.message || '', summaryText);
              finish(resolveIndex(block.okTarget, currentIndex + 1));
            });

            cancelBtn.addEventListener('click', () => {
              if (storyRunToken !== token || settled) return;
              const cancelValue = block.cancelValue ?? 'cancel';
              if (block.storeAs) {
                context.flags[block.storeAs] = cancelValue;
                updateVariables(context.flags);
              }
              const summaryText = block.storeAs
                ? t('blocks.control.summaryCancelStored', '▶ キャンセル ({variable} = {value})', {
                  variable: block.storeAs,
                  value: JSON.stringify(cancelValue)
                })
                : t('blocks.control.summaryCancel', '▶ 入力をキャンセル');
              makeSummary(labelText, block.message || '', summaryText);
              finish(resolveIndex(block.cancelTarget, currentIndex + 1));
            });
          } else {
            const actions = document.createElement('div');
            actions.className = 'mini-tester-control-actions';
            const yesBtn = document.createElement('button');
            yesBtn.textContent = block.yesLabel || t('blocks.defaults.yes', 'はい');
            const noBtn = document.createElement('button');
            noBtn.textContent = block.noLabel || t('blocks.defaults.no', 'いいえ');
            actions.appendChild(yesBtn);
            actions.appendChild(noBtn);
            container.appendChild(actions);

            const choose = (label, storedValue, target) => {
              if (storyRunToken !== token || settled) return;
              if (block.storeAs) {
                context.flags[block.storeAs] = storedValue;
                updateVariables(context.flags);
              }
              const summary = block.storeAs
                ? t('blocks.control.summaryChoiceStored', '▶ {label} を選択 → {variable} = {value}', {
                  label,
                  variable: block.storeAs,
                  value: JSON.stringify(storedValue)
                })
                : t('blocks.control.summaryChoice', '▶ {label} を選択', { label });
              makeSummary(labelText, block.message || '', summary);
              finish(resolveIndex(target, currentIndex + 1));
            };

            yesBtn.addEventListener('click', () => {
              const value = block.yesValue ?? block.yesLabel ?? 'yes';
              choose(block.yesLabel || t('blocks.defaults.yes', 'はい'), value, block.yesTarget);
            });

            noBtn.addEventListener('click', () => {
              const value = block.noValue ?? block.noLabel ?? 'no';
              choose(block.noLabel || t('blocks.defaults.no', 'いいえ'), value, block.noTarget);
            });
          }

          storyLog.appendChild(container);
          storyLog.scrollTop = storyLog.scrollHeight;

          const watch = () => {
            if (settled) return;
            if (storyRunToken !== token) {
              try { finish(null); } catch {}
              container.remove();
            } else {
              requestAnimationFrame(watch);
            }
          };
          requestAnimationFrame(watch);
        });
      }

      function executeChoiceBlock(block, context, token) {
        return new Promise((resolve, reject) => {
          const container = document.createElement('div');
          const label = document.createElement('div');
          const badge = document.createElement('span');
          badge.className = 'label';
          bindText(badge, 'blocks.choice.logLabel', '選択');
          label.appendChild(badge);
          label.appendChild(document.createTextNode(block.question || ''));
          container.appendChild(label);
          const choices = document.createElement('div');
          choices.className = 'mini-tester-choice-container';
          (block.options || []).forEach(opt => {
            const btn = document.createElement('button');
            btn.textContent = opt.label || t('blocks.choice.buttonFallback', '選択');
            btn.addEventListener('click', () => {
              if (storyRunToken !== token) return;
              const value = opt.value ?? opt.label ?? '';
              context.flags[block.storeAs || 'choice'] = value;
              context.lastChoice = value;
              updateVariables(context.flags);
              appendStoryLog(t('blocks.choice.logSelection', '▶ 選択: {value}', { value }));
              container.remove();
              resolve(resolveIndex(opt.target, null));
            });
            choices.appendChild(btn);
          });
          if (!choices.children.length) {
            const notice = document.createElement('div');
            bindText(notice, 'blocks.choice.noOptions', '※ 選択肢が設定されていません');
            choices.appendChild(notice);
          }
          container.appendChild(choices);
          storyLog.appendChild(container);
          storyLog.scrollTop = storyLog.scrollHeight;

          const watch = () => {
            if (storyRunToken !== token) {
              try { resolve(null); } catch {}
              container.remove();
            } else {
              requestAnimationFrame(watch);
            }
          };
          requestAnimationFrame(watch);
        });
      }

      function resolveNextIndex(current, nextValue) {
        if (nextValue === '' || nextValue === null || typeof nextValue === 'undefined') {
          return current + 1;
        }
        return resolveIndex(nextValue, current + 1);
      }

      function resolveIndex(value, fallback) {
        const num = Number(value);
        if (Number.isFinite(num) && num >= 0 && num < storyBlocks.length) {
          return num;
        }
        return fallback;
      }

      blockSectionApi = {
        reset() {
          storyLog.innerHTML = '';
          variablesEmpty = true;
          setImmediateText(varBody, 'blocks.variables.empty', '(空)');
          renderBlocks();
        }
      };

      renderBlocks();
      return root;
    }
    function waitFrames(count = 1) {
      return new Promise(resolve => {
        let remaining = Math.max(1, Number(count) || 1);
        function step() {
          if (destroyed) { resolve(); return; }
          if (remaining-- <= 0) { resolve(); return; }
          requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }

    function resetAll() {
      testResults = {};
      bestBenchmark = 0;
      totalBenchmarkRuns = 0;
      storyBlocks = [];
      storyRunToken++;
      customAlertImpl = defaultAlertImpl;
      lastAlertTestAwarded = false;
      setAlertStatus('blocks.alert.statusDefault', '既定: ログに表示します。alert() に変えることも可能です。');
      if (blockSectionApi && blockSectionApi.reset) blockSectionApi.reset();
    }

    return {
      pause() { paused = true; },
      resume() { paused = false; },
      restart() { resetAll(); },
      destroy() {
        destroyed = true;
        storyRunToken++;
        if (typeof detachLocaleListener === 'function') {
          try { detachLocaleListener(); } catch {}
          detachLocaleListener = null;
        }
        alertStatusEl = null;
        varBodyEl = null;
        try { container.remove(); } catch {}
        blockSectionApi = null;
      }
    };
  }

  window.registerMiniGame({
    id: 'tester',
    name: 'JSテスター', nameKey: 'selection.miniexp.games.tester.name',
    description: '機能テストとCPUベンチマーク、カスタムalert対応のブロック式アドベンチャー作成ツール。', descriptionKey: 'selection.miniexp.games.tester.description', categoryIds: ['utility'],
    category: 'ユーティリティ',
    version: '0.1.0',
    author: 'mod',
    create
  });
})();

(function(){
  const STYLE_ID = 'mini-tester-style';
  const STYLES = `
  .mini-tester-root {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
    color: #e2e8f0;
    background: radial-gradient(circle at 18% 18%, rgba(59,130,246,0.08), rgba(9,12,24,0.96));
    font-family: 'Segoe UI', 'Hiragino Sans', 'Noto Sans JP', sans-serif;
    padding: 22px 26px;
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
  }
  .mini-tester-sub {
    font-size: 13px;
    color: rgba(226,232,240,0.7);
  }
  .mini-tester-tabs {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  .mini-tester-tab-btn {
    padding: 8px 14px;
    background: rgba(30,41,59,0.75);
    border: 1px solid rgba(148,163,184,0.2);
    border-radius: 999px;
    color: #e2e8f0;
    cursor: pointer;
    font-size: 13px;
    transition: background 0.18s ease, transform 0.18s ease;
  }
  .mini-tester-tab-btn:hover {
    background: rgba(59,130,246,0.2);
    transform: translateY(-1px);
  }
  .mini-tester-tab-btn.active {
    background: linear-gradient(135deg, rgba(59,130,246,0.4), rgba(129,140,248,0.55));
    border-color: rgba(191,219,254,0.6);
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
    gap: 18px;
    overflow: hidden;
  }
  .mini-tester-card {
    background: rgba(15,23,42,0.82);
    border: 1px solid rgba(148,163,184,0.22);
    border-radius: 18px;
    padding: 18px;
    box-shadow: 0 28px 60px rgba(8,12,24,0.55);
  }
  .mini-tester-card h3 {
    margin: 0 0 10px;
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 0.04em;
  }
  .mini-tester-card p {
    margin: 0;
    color: rgba(226,232,240,0.8);
    font-size: 13px;
  }
  .mini-tester-tests-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 14px;
  }
  .mini-tester-test-item {
    background: rgba(30,41,59,0.6);
    border-radius: 14px;
    border: 1px solid rgba(148,163,184,0.25);
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .mini-tester-test-item strong {
    font-size: 15px;
  }
  .mini-tester-test-desc {
    color: rgba(226,232,240,0.7);
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
    padding: 8px 14px;
    font-size: 12px;
    color: #0f172a;
    background: linear-gradient(135deg, rgba(96,165,250,0.85), rgba(129,140,248,0.9));
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .mini-tester-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 18px rgba(37,99,235,0.32);
  }
  .mini-tester-button.secondary {
    background: rgba(148,163,184,0.2);
    color: #e2e8f0;
  }
  .mini-tester-button.danger {
    background: linear-gradient(135deg, rgba(248,113,113,0.9), rgba(239,68,68,0.85));
    color: #0b1120;
  }
  .mini-tester-test-result {
    font-size: 12px;
    color: rgba(226,232,240,0.86);
  }
  .mini-tester-bench-display {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
  }
  .mini-tester-bench-box {
    background: rgba(30,41,59,0.65);
    border: 1px solid rgba(148,163,184,0.22);
    border-radius: 16px;
    padding: 16px;
  }
  .mini-tester-bench-value {
    font-size: 26px;
    font-weight: 700;
    margin-bottom: 6px;
  }
  .mini-tester-bench-log {
    background: rgba(15,23,42,0.65);
    border-radius: 12px;
    padding: 12px;
    max-height: 180px;
    overflow: auto;
    font-size: 12px;
    line-height: 1.5;
  }
  .mini-tester-bench-log-entry {
    color: rgba(226,232,240,0.82);
  }
  .mini-tester-blocks {
    display: grid;
    grid-template-columns: minmax(320px, 360px) 1fr;
    gap: 18px;
    height: 100%;
  }
  .mini-tester-blocks-left {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 0;
  }
  .mini-tester-blocks-right {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 0;
  }
  .mini-tester-block-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .mini-tester-block-item {
    background: rgba(30,41,59,0.72);
    border: 1px solid rgba(148,163,184,0.28);
    border-radius: 14px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    position: relative;
  }
  .mini-tester-block-item.active {
    box-shadow: 0 0 0 2px rgba(96,165,250,0.7);
  }
  .mini-tester-block-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }
  .mini-tester-block-header select,
  .mini-tester-block-header input[type="number"] {
    background: rgba(15,23,42,0.8);
    border: 1px solid rgba(148,163,184,0.3);
    color: #e2e8f0;
    border-radius: 8px;
    padding: 4px 8px;
    font-size: 12px;
  }
  .mini-tester-block-body textarea,
  .mini-tester-block-body input,
  .mini-tester-block-body select {
    width: 100%;
    background: rgba(15,23,42,0.78);
    border: 1px solid rgba(148,163,184,0.25);
    color: #e2e8f0;
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
    background: rgba(15,23,42,0.75);
    border: 1px solid rgba(148,163,184,0.25);
    border-radius: 16px;
    padding: 14px;
    overflow-y: auto;
    font-size: 13px;
    line-height: 1.6;
  }
  .mini-tester-story-log-entry {
    margin-bottom: 6px;
  }
  .mini-tester-story-log-entry span.label {
    font-weight: 600;
    color: rgba(125,211,252,0.92);
    margin-right: 6px;
  }
  .mini-tester-choice-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
  }
  .mini-tester-choice-container button {
    background: rgba(96,165,250,0.2);
    border: 1px solid rgba(59,130,246,0.4);
    color: #bfdbfe;
    padding: 6px 12px;
    border-radius: 999px;
    cursor: pointer;
  }
  .mini-tester-choice-container button:hover {
    background: rgba(96,165,250,0.35);
  }
  .mini-tester-alert-editor textarea {
    width: 100%;
    min-height: 120px;
    background: rgba(15,23,42,0.82);
    border: 1px solid rgba(148,163,184,0.25);
    border-radius: 12px;
    padding: 10px;
    color: #e2e8f0;
    font-size: 12px;
    line-height: 1.5;
  }
  .mini-tester-variables {
    background: rgba(15,23,42,0.7);
    border: 1px solid rgba(148,163,184,0.25);
    border-radius: 12px;
    padding: 12px;
    font-size: 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .mini-tester-alert-status {
    font-size: 12px;
    color: rgba(248,250,252,0.8);
  }
  `;

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
      description: '浮動小数とBigIntの演算、Math拡張を試験します。',
      async run() {
        const big = 2n ** 40n;
        const big2 = big / 256n;
        if (big2 !== 2n ** 32n) throw new Error('BigInt演算が期待どおりではありません');
        const precise = Math.fround(Math.PI * Math.E);
        const hypot = Math.hypot(3, 4, 12);
        if (Math.abs(hypot - 13) > 1e-6) throw new Error('Math.hypot結果に誤差が大きいです');
        return `BigInt OK / fround=${precise.toFixed(4)}`;
      }
    },
    {
      id: 'json',
      name: 'JSON & structuredClone',
      description: 'JSONシリアライズとstructuredCloneをチェックします。',
      async run() {
        const obj = {
          count: 12,
          nested: [1, 2, { label: 'X', when: new Date('2024-01-02T03:04:05Z').toISOString() }],
          map: new Map([[1, 'one']])
        };
        const json = JSON.stringify(obj);
        const restored = JSON.parse(json);
        if (!restored.nested || restored.nested[2].label !== 'X') throw new Error('JSON復元に失敗しました');
        if (typeof structuredClone === 'function') {
          const cloned = structuredClone(obj);
          if (!(cloned.map instanceof Map) || cloned.map.get(1) !== 'one') {
            throw new Error('structuredCloneがMapを保持できません');
          }
        }
        return `JSON長=${json.length}`;
      }
    },
    {
      id: 'intl',
      name: 'Intlフォーマット',
      description: 'Intl.DateTimeFormatとNumberFormatを検証します。',
      async run() {
        const dateFmt = new Intl.DateTimeFormat('ja-JP', { dateStyle: 'full', timeStyle: 'medium', timeZone: 'Asia/Tokyo' });
        const numFmt = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' });
        const formattedDate = dateFmt.format(new Date('2023-05-01T12:34:56Z'));
        const formattedNumber = numFmt.format(123456.789);
        if (!formattedDate.includes('5月')) throw new Error('日付フォーマットが想定外です');
        if (!formattedNumber.includes('￥')) throw new Error('通貨フォーマットが想定外です');
        return `${formattedDate} / ${formattedNumber}`;
      }
    },
    {
      id: 'crypto',
      name: 'Crypto API',
      description: '暗号学的乱数と微小なハッシュ処理を行います。',
      async run() {
        if (!window.crypto || !crypto.getRandomValues) throw new Error('crypto.getRandomValuesが利用できません');
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
      description: 'localStorage/sessionStorage の読み書きを確認します。',
      async run() {
        const key = `tester-${Date.now()}-${Math.random()}`;
        try {
          localStorage.setItem(key, 'ok');
          const value = localStorage.getItem(key);
          sessionStorage.setItem(key, value + '-session');
          const sessionValue = sessionStorage.getItem(key);
          localStorage.removeItem(key);
          sessionStorage.removeItem(key);
          if (value !== 'ok' || sessionValue !== 'ok-session') throw new Error('Storage読み書き失敗');
        } catch (err) {
          throw new Error('Storage利用がブロックされています');
        }
        return 'localStorage / sessionStorage OK';
      }
    },
    {
      id: 'canvas',
      name: 'Canvas & Offscreen',
      description: 'Canvas描画とOffscreenCanvasの存在を検査します。',
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
        if (!data || data.length < 3) throw new Error('Canvasピクセル取得に失敗');
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
    let customAlertStatus = '';
    let lastAlertTestAwarded = false;

    const container = document.createElement('div');
    container.className = 'mini-tester-root';

    const header = document.createElement('div');
    header.className = 'mini-tester-header';
    const title = document.createElement('div');
    title.className = 'mini-tester-title';
    title.textContent = 'JSテスター / MiniExp MOD';
    const subtitle = document.createElement('div');
    subtitle.className = 'mini-tester-sub';
    subtitle.textContent = 'JavaScript機能のセルフチェック、CPUベンチマーク、ブロック式アドベンチャーメーカーを収録。';
    header.appendChild(title);
    header.appendChild(subtitle);

    const tabs = document.createElement('div');
    tabs.className = 'mini-tester-tabs';
    const sections = {};

    const main = document.createElement('div');
    main.className = 'mini-tester-main';

    function makeSection(id, label, element) {
      const btn = document.createElement('button');
      btn.className = 'mini-tester-tab-btn';
      btn.textContent = label;
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

    makeSection('tests', '機能テスト', testsElement);
    makeSection('benchmark', 'CPUベンチマーク', benchElement);
    makeSection('blocks', 'ブロックアドベンチャー', blockElement);
    refreshTabs();

    root.appendChild(container);

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
      heading.textContent = 'JavaScriptセルフチェックラボ';
      wrapper.appendChild(heading);

      const description = document.createElement('p');
      description.textContent = 'ブラウザが提供する代表的な機能をワンタップで検査できます。結果を共有すればデバッグにも役立ちます。';
      wrapper.appendChild(description);

      const runAllBtn = document.createElement('button');
      runAllBtn.className = 'mini-tester-button';
      runAllBtn.textContent = 'すべて実行';
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
        title.textContent = def.name;
        item.appendChild(title);

        const desc = document.createElement('div');
        desc.className = 'mini-tester-test-desc';
        desc.textContent = def.description;
        item.appendChild(desc);

        const actions = document.createElement('div');
        actions.className = 'mini-tester-test-actions';
        const btn = document.createElement('button');
        btn.className = 'mini-tester-button secondary';
        btn.textContent = 'テスト実行';
        const resultEl = document.createElement('div');
        resultEl.className = 'mini-tester-test-result';
        actions.appendChild(btn);
        item.appendChild(actions);
        item.appendChild(resultEl);

        btn.addEventListener('click', async () => {
          if (destroyed || paused) return;
          btn.disabled = true;
          resultEl.textContent = '実行中…';
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
          resultEl.textContent = '実行中…';
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
      heading.textContent = 'CPUベンチマーク - 1秒間のインクリメント回数';
      wrapper.appendChild(heading);

      const description = document.createElement('p');
      description.textContent = '整数に1を加算し続け、1秒間で何回ループできるか計測します。ブラウザや端末の瞬間的な性能をチェックしましょう。';
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
      currentLabel.textContent = '最新結果 (回/秒)';
      currentLabel.style.fontSize = '12px';
      currentLabel.style.color = 'rgba(226,232,240,0.7)';
      currentBox.appendChild(currentValue);
      currentBox.appendChild(currentLabel);

      const bestBox = document.createElement('div');
      bestBox.className = 'mini-tester-bench-box';
      const bestValue = document.createElement('div');
      bestValue.className = 'mini-tester-bench-value';
      bestValue.textContent = '—';
      const bestLabel = document.createElement('div');
      bestLabel.textContent = '自己ベスト (回/秒)';
      bestLabel.style.fontSize = '12px';
      bestLabel.style.color = 'rgba(226,232,240,0.7)';
      bestBox.appendChild(bestValue);
      bestBox.appendChild(bestLabel);

      const streakBox = document.createElement('div');
      streakBox.className = 'mini-tester-bench-box';
      const streakValue = document.createElement('div');
      streakValue.className = 'mini-tester-bench-value';
      streakValue.textContent = '0';
      const streakLabel = document.createElement('div');
      streakLabel.textContent = '累計実行回数';
      streakLabel.style.fontSize = '12px';
      streakLabel.style.color = 'rgba(226,232,240,0.7)';
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
      runBtn.textContent = '計測スタート (1秒)';
      actions.appendChild(runBtn);

      const stopHint = document.createElement('div');
      stopHint.style.fontSize = '12px';
      stopHint.style.color = 'rgba(226,232,240,0.7)';
      stopHint.textContent = '計測中はUIが1秒間固まる場合があります。';
      actions.appendChild(stopHint);

      wrapper.appendChild(actions);

      const log = document.createElement('div');
      log.className = 'mini-tester-bench-log';
      wrapper.appendChild(log);

      runBtn.addEventListener('click', async () => {
        if (destroyed || paused || benchmarkRunning) return;
        benchmarkRunning = true;
        runBtn.disabled = true;
        appendLog('計測を開始します…');
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
          appendLog(`新記録: ${formatNumber(bestBenchmark)} 回/秒`);
          safeAwardXp(Math.min(50, Math.floor(result.countPerSec / 500000)), 'tester:benchmark-record');
        } else {
          appendLog(`結果: ${formatNumber(result.countPerSec)} 回/秒`);
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
      addBtn.textContent = 'ブロックを追加';
      blockControls.appendChild(addBtn);

      const clearBtn = document.createElement('button');
      clearBtn.className = 'mini-tester-button secondary';
      clearBtn.textContent = '全削除';
      blockControls.appendChild(clearBtn);

      left.appendChild(blockControls);

      const blockList = document.createElement('div');
      blockList.className = 'mini-tester-block-list';
      left.appendChild(blockList);

      const alertCard = document.createElement('div');
      alertCard.className = 'mini-tester-card mini-tester-alert-editor';
      const alertTitle = document.createElement('h3');
      alertTitle.textContent = 'カスタムAlert関数';
      alertCard.appendChild(alertTitle);
      const alertDesc = document.createElement('p');
      alertDesc.textContent = 'message, context を受け取る関数本体を記述します。context.flags や context.log を使って高度な演出が可能です。';
      alertCard.appendChild(alertDesc);
      const alertTextarea = document.createElement('textarea');
      alertTextarea.value = `// message: string\n// context: { flags, log, awardXp }\nconst box = document.createElement('div');\nbox.textContent = message;\nbox.style.padding = '16px';\nbox.style.background = 'rgba(96,165,250,0.15)';\nbox.style.border = '1px solid rgba(96,165,250,0.4)';\nbox.style.borderRadius = '12px';\nbox.style.margin = '6px 0';\ncontext.log(box);\n`;
      alertCard.appendChild(alertTextarea);
      const alertActions = document.createElement('div');
      alertActions.style.display = 'flex';
      alertActions.style.gap = '8px';
      alertActions.style.marginTop = '8px';
      const alertApply = document.createElement('button');
      alertApply.className = 'mini-tester-button';
      alertApply.textContent = '更新';
      const alertTest = document.createElement('button');
      alertTest.className = 'mini-tester-button secondary';
      alertTest.textContent = 'テスト実行';
      alertActions.appendChild(alertApply);
      alertActions.appendChild(alertTest);
      alertCard.appendChild(alertActions);
      const alertStatus = document.createElement('div');
      alertStatus.className = 'mini-tester-alert-status';
      alertStatus.textContent = '既定: ログに表示します。alert() に変えることも可能です。';
      alertCard.appendChild(alertStatus);
      right.appendChild(alertCard);

      const storyCard = document.createElement('div');
      storyCard.className = 'mini-tester-card';
      const storyHeader = document.createElement('div');
      storyHeader.style.display = 'flex';
      storyHeader.style.justifyContent = 'space-between';
      storyHeader.style.alignItems = 'center';
      const storyTitle = document.createElement('h3');
      storyTitle.textContent = 'ブロックストーリーランナー';
      storyHeader.appendChild(storyTitle);
      const storyButtons = document.createElement('div');
      storyButtons.style.display = 'flex';
      storyButtons.style.gap = '8px';
      const runStoryBtn = document.createElement('button');
      runStoryBtn.className = 'mini-tester-button';
      runStoryBtn.textContent = 'ストーリー再生';
      const stopStoryBtn = document.createElement('button');
      stopStoryBtn.className = 'mini-tester-button secondary';
      stopStoryBtn.textContent = '停止';
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
      varTitle.textContent = '変数ビュー (flags)';
      variableCard.appendChild(varTitle);
      const varBody = document.createElement('div');
      varBody.textContent = '(空)';
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
          customAlertStatus = '✅ カスタムalertを適用しました。';
          alertStatus.textContent = customAlertStatus;
        } catch (err) {
          customAlertStatus = `❌ エラー: ${err.message}`;
          alertStatus.textContent = customAlertStatus;
        }
      });

      alertTest.addEventListener('click', () => {
        if (destroyed) return;
        try {
          customAlertImpl('カスタムalertのテストです。', {
            flags: {},
            log: el => appendStoryLog(el, 'alert-test'),
            awardXp: (n, reason) => safeAwardXp(n, reason || 'tester:alert-test')
          });
          alertStatus.textContent = '✅ テストメッセージを送信しました。';
          if (!lastAlertTestAwarded) {
            safeAwardXp(3, 'tester:alert-first');
            lastAlertTestAwarded = true;
          }
        } catch (err) {
          alertStatus.textContent = `❌ 実行エラー: ${err.message}`;
        }
      });

      runStoryBtn.addEventListener('click', async () => {
        if (destroyed || paused) return;
        runStoryBtn.disabled = true;
        stopStoryBtn.disabled = false;
        storyRunToken++;
        const token = storyRunToken;
        storyLog.innerHTML = '';
        appendStoryLog(`▶ ストーリー開始 (${storyBlocks.length} ブロック)`);
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
          appendStoryLog(`⚠ 実行中断: ${err.message}`);
        }
        runStoryBtn.disabled = false;
        stopStoryBtn.disabled = true;
        appendStoryLog('■ ストーリー終了');
      });

      stopStoryBtn.addEventListener('click', () => {
        storyRunToken++;
        stopStoryBtn.disabled = true;
        appendStoryLog('■ ユーザーが停止しました');
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
              question: 'どうする？',
              storeAs: 'choice',
              options: [
                { label: '進む', target: '', value: 'go' },
                { label: 'やめる', target: '', value: 'stop' }
              ]
            };
          case 'set':
            return { type: 'set', name: 'flagName', value: 'true', next: '' };
          case 'jump':
            return { type: 'jump', name: 'flagName', equals: 'true', target: '', elseTarget: '' };
          case 'award':
            return { type: 'award', amount: 10, next: '' };
          default:
            return { type: 'text', text: 'メッセージ', delivery: 'log', next: '' };
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
          ['text', 'choice', 'set', 'jump', 'award'].forEach(t => {
            const option = document.createElement('option');
            option.value = t;
            option.textContent = t;
            if (block.type === t) option.selected = true;
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
        }
      }

      function renderTextBlock(block, body, index) {
        const textarea = document.createElement('textarea');
        textarea.value = block.text || '';
        textarea.placeholder = '表示するメッセージ';
        textarea.addEventListener('input', () => {
          block.text = textarea.value;
        });
        body.appendChild(textarea);

        const delivery = document.createElement('select');
        [['log', 'ログに出力'], ['alert', 'カスタムalert'], ['both', '両方']].forEach(([value, label]) => {
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
        nextLabel.textContent = '次に進むブロック (# または空)';
        nextLabel.style.fontSize = '11px';
        nextLabel.style.color = 'rgba(226,232,240,0.7)';
        nextRow.appendChild(nextLabel);
        body.appendChild(nextRow);

        const nextInput = document.createElement('input');
        nextInput.type = 'number';
        nextInput.min = '0';
        nextInput.placeholder = '空なら自動で次';
        nextInput.value = block.next ?? '';
        nextInput.addEventListener('input', () => {
          block.next = nextInput.value;
        });
        body.appendChild(nextInput);
      }

      function renderChoiceBlock(block, body, index) {
        const question = document.createElement('textarea');
        question.value = block.question || '';
        question.placeholder = '選択肢の前に表示する文章';
        question.addEventListener('input', () => { block.question = question.value; });
        body.appendChild(question);

        const storeAs = document.createElement('input');
        storeAs.type = 'text';
        storeAs.placeholder = '選択した値を保存する変数名 (例: choice)';
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
            labelInput.placeholder = 'ボタン表示';
            labelInput.addEventListener('input', () => { opt.label = labelInput.value; });
            row.appendChild(labelInput);

            const valueInput = document.createElement('input');
            valueInput.type = 'text';
            valueInput.value = opt.value ?? '';
            valueInput.placeholder = '保存する値';
            valueInput.addEventListener('input', () => { opt.value = valueInput.value; });
            row.appendChild(valueInput);

            const targetInput = document.createElement('input');
            targetInput.type = 'number';
            targetInput.min = '0';
            targetInput.placeholder = '次の#';
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
        addOptionBtn.textContent = '選択肢を追加';
        addOptionBtn.addEventListener('click', () => {
          block.options.push({ label: '新しい選択肢', value: '', target: '' });
          renderOptions();
        });
        body.appendChild(addOptionBtn);

        renderOptions();
      }
      function renderSetBlock(block, body, index) {
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = '変数名';
        nameInput.value = block.name || 'flag';
        nameInput.addEventListener('input', () => { block.name = nameInput.value; });
        body.appendChild(nameInput);

        const valueInput = document.createElement('input');
        valueInput.type = 'text';
        valueInput.placeholder = '値 (文字列)';
        valueInput.value = block.value ?? '';
        valueInput.addEventListener('input', () => { block.value = valueInput.value; });
        body.appendChild(valueInput);

        const nextInput = document.createElement('input');
        nextInput.type = 'number';
        nextInput.placeholder = '次のブロック (空=順番通り)';
        nextInput.value = block.next ?? '';
        nextInput.addEventListener('input', () => { block.next = nextInput.value; });
        body.appendChild(nextInput);
      }

      function renderJumpBlock(block, body, index) {
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.placeholder = '判定する変数名';
        nameInput.value = block.name || '';
        nameInput.addEventListener('input', () => { block.name = nameInput.value; });
        body.appendChild(nameInput);

        const equalsInput = document.createElement('input');
        equalsInput.type = 'text';
        equalsInput.placeholder = '比較値 (文字列)';
        equalsInput.value = block.equals ?? '';
        equalsInput.addEventListener('input', () => { block.equals = equalsInput.value; });
        body.appendChild(equalsInput);

        const targetInput = document.createElement('input');
        targetInput.type = 'number';
        targetInput.placeholder = '一致した時のブロック#';
        targetInput.value = block.target ?? '';
        targetInput.addEventListener('input', () => { block.target = targetInput.value; });
        body.appendChild(targetInput);

        const elseInput = document.createElement('input');
        elseInput.type = 'number';
        elseInput.placeholder = '不一致の時のブロック# (空=次)';
        elseInput.value = block.elseTarget ?? '';
        elseInput.addEventListener('input', () => { block.elseTarget = elseInput.value; });
        body.appendChild(elseInput);
      }

      function renderAwardBlock(block, body, index) {
        const amountInput = document.createElement('input');
        amountInput.type = 'number';
        amountInput.placeholder = '付与するEXP (負数も可)';
        amountInput.value = block.amount ?? 0;
        amountInput.addEventListener('input', () => { block.amount = Number(amountInput.value || 0); });
        body.appendChild(amountInput);

        const nextInput = document.createElement('input');
        nextInput.type = 'number';
        nextInput.placeholder = '次のブロック (空=順番通り)';
        nextInput.value = block.next ?? '';
        nextInput.addEventListener('input', () => { block.next = nextInput.value; });
        body.appendChild(nextInput);
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
          varBody.textContent = '(空)';
          return;
        }
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
          appendStoryLog('⚠ ブロックが1つもありません。');
          return;
        }
        let stepCount = 0;
        let index = 0;
        const maxSteps = 999;
        while (!destroyed && storyRunToken === token && index >= 0 && index < storyBlocks.length) {
          if (stepCount++ > maxSteps) throw new Error('ステップ回数が多すぎます。ループしていませんか？');
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
              appendStoryLog(`[JUMP] ${name}=${JSON.stringify(value)} => ${matches ? '一致' : '不一致'}`);
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
            appendStoryLog(`❌ alert実行エラー: ${err.message}`);
          }
        }
      }

      function executeChoiceBlock(block, context, token) {
        return new Promise((resolve, reject) => {
          const container = document.createElement('div');
          const label = document.createElement('div');
          label.innerHTML = `<span class="label">選択</span>${block.question || ''}`;
          container.appendChild(label);
          const choices = document.createElement('div');
          choices.className = 'mini-tester-choice-container';
          (block.options || []).forEach(opt => {
            const btn = document.createElement('button');
            btn.textContent = opt.label || '選択';
            btn.addEventListener('click', () => {
              if (storyRunToken !== token) return;
              const value = opt.value ?? opt.label ?? '';
              context.flags[block.storeAs || 'choice'] = value;
              context.lastChoice = value;
              updateVariables(context.flags);
              appendStoryLog(`▶ 選択: ${value}`);
              container.remove();
              resolve(resolveIndex(opt.target, null));
            });
            choices.appendChild(btn);
          });
          if (!choices.children.length) {
            const notice = document.createElement('div');
            notice.textContent = '※ 選択肢が設定されていません';
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
          varBody.textContent = '(空)';
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
      if (blockSectionApi && blockSectionApi.reset) blockSectionApi.reset();
    }

    return {
      pause() { paused = true; },
      resume() { paused = false; },
      restart() { resetAll(); },
      destroy() {
        destroyed = true;
        storyRunToken++;
        try { container.remove(); } catch {}
        blockSectionApi = null;
      }
    };
  }

  window.registerMiniGame({
    id: 'tester',
    name: 'JSテスター',
    description: '機能テストとCPUベンチマーク、カスタムalert対応のブロック式アドベンチャー作成ツール。',
    category: 'ユーティリティ',
    version: '0.1.0',
    author: 'mod',
    create
  });
})();

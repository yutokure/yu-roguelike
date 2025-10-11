(function(){
  const GLOBAL = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
  const I18N_PREFIX = 'minigame.system';
  const MAIN_TABS = [
    { id: 'pc', label: 'PC' },
    { id: 'os', label: 'OS' },
    { id: 'browser', label: 'ブラウザ' },
    { id: 'ip', label: 'IP' }
  ];
  const PC_SUB_TABS = [
    { id: 'pc-info', label: '情報' },
    { id: 'pc-monitor', label: 'ハードウェアモニター' }
  ];
  const IP_ENDPOINTS = [
    { id: 'ipify', label: 'api.ipify.org', url: 'https://api.ipify.org?format=json' },
    { id: 'ipinfo', label: 'ipinfo.io', url: 'https://ipinfo.io/json' },
    { id: 'ifconfig', label: 'ifconfig.co', url: 'https://ifconfig.co/json' }
  ];
  const NUMBER_FORMAT = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 });
  const PERCENT_FORMAT = new Intl.NumberFormat(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  const DATE_TIME_FORMAT = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'medium' });

  function clamp(min, max, value){
    if (!Number.isFinite(value)) return min;
    return Math.min(max, Math.max(min, value));
  }

  function formatBytes(value){
    if (!Number.isFinite(value) || value < 0) return '-';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let idx = 0;
    let num = value;
    while (num >= 1024 && idx < units.length - 1){
      num /= 1024;
      idx += 1;
    }
    return `${NUMBER_FORMAT.format(num)} ${units[idx]}`;
  }

  function formatPercent(value){
    if (!Number.isFinite(value)) return '-';
    return `${PERCENT_FORMAT.format(value)}%`;
  }

  function guessCpuFamily(ua){
    if (!ua) return '不明';
    if (/Apple Silicon|Mac OS X.*Apple/.test(ua)) return 'Apple Silicon (推定)';
    if (/Intel/i.test(ua)) return 'Intel (推定)';
    if (/AMD|Ryzen|Threadripper/i.test(ua)) return 'AMD (推定)';
    if (/Snapdragon|Qualcomm/i.test(ua)) return 'Qualcomm Snapdragon (推定)';
    if (/Exynos/i.test(ua)) return 'Samsung Exynos (推定)';
    if (/Kirin/i.test(ua)) return 'Huawei Kirin (推定)';
    if (/MediaTek|MT\d+/i.test(ua)) return 'MediaTek (推定)';
    return '不明';
  }

  function guessArchitecture(ua){
    if (!ua) return '-';
    if (/ARM64|AArch64|arm64|Apple M\d/i.test(ua)) return 'ARM64';
    if (/ARM/i.test(ua)) return 'ARM';
    if (/x86_64|Win64|x64|amd64/i.test(ua)) return 'x64';
    if (/i686|x86/i.test(ua)) return 'x86';
    return '-';
  }

  function detectBrowser(ua){
    const info = { name: '不明', version: '-', engine: '-', vendor: navigator.vendor || '-' };
    if (!ua) return info;
    const pairs = [
      { regex: /(Edg|Edge)\/([\d.]+)/, name: 'Microsoft Edge', engine: 'Blink' },
      { regex: /(OPR|Opera)\/([\d.]+)/, name: 'Opera', engine: 'Blink' },
      { regex: /(Chrome)\/([\d.]+)/, name: 'Google Chrome', engine: 'Blink' },
      { regex: /(Firefox)\/([\d.]+)/, name: 'Mozilla Firefox', engine: 'Gecko' },
      { regex: /(Safari)\/([\d.]+)/, name: 'Safari', engine: 'WebKit' }
    ];
    for (const entry of pairs){
      const match = ua.match(entry.regex);
      if (match){
        info.name = entry.name;
        info.version = match[2];
        info.engine = entry.engine;
        return info;
      }
    }
    if (/Trident\/7\.0/.test(ua)){
      info.name = 'Internet Explorer 11';
      info.version = '11';
      info.engine = 'Trident';
    }
    return info;
  }

  function detectOs(ua, platform){
    const info = { name: '不明', version: '-', build: '-', bitness: '-', detail: '' };
    if (!ua) ua = '';
    const plat = platform || navigator.platform || '';
    if (/Windows NT 10\.0/.test(ua)){
      info.name = 'Windows 10/11';
      info.version = '10.0';
      info.detail = 'Windows NT 10.0';
    } else if (/Windows NT 6\.3/.test(ua)){
      info.name = 'Windows 8.1';
      info.version = '6.3';
      info.detail = 'Windows NT 6.3';
    } else if (/Windows NT 6\.2/.test(ua)){
      info.name = 'Windows 8';
      info.version = '6.2';
      info.detail = 'Windows NT 6.2';
    } else if (/Windows NT 6\.1/.test(ua)){
      info.name = 'Windows 7';
      info.version = '6.1';
      info.detail = 'Windows NT 6.1';
    } else if (/Mac OS X (\d+[_.]\d+(?:[_.]\d+)?)/.test(ua)){
      const version = RegExp.$1.replace(/_/g, '.');
      info.name = 'macOS';
      info.version = version;
      info.detail = `Mac OS X ${version}`;
    } else if (/Android\s+([\d.]+)/.test(ua)){
      info.name = 'Android';
      info.version = RegExp.$1;
      info.detail = `Android ${info.version}`;
    } else if (/(iPhone|iPad|iPod).*OS\s([\d_]+)/.test(ua)){
      info.name = 'iOS/iPadOS';
      info.version = RegExp.$2.replace(/_/g, '.');
      info.detail = `${RegExp.$1} iOS ${info.version}`;
    } else if (/Linux/.test(ua)){
      info.name = 'Linux (推定)';
      info.detail = plat || 'Linux';
    }
    if (/Win64|x64|WOW64|amd64/.test(ua) || /Win64|x64|AMD64/.test(plat)) info.bitness = '64-bit';
    else if (/i686|x86/.test(ua)) info.bitness = '32-bit';
    else if (/arm64|aarch64|ARM64/.test(ua)) info.bitness = '64-bit (ARM)';
    else info.bitness = '-';
    return info;
  }

  function detectGpu(){
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return null;
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo){
        const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        return { vendor, renderer };
      }
      return {
        vendor: gl.getParameter(gl.VENDOR),
        renderer: gl.getParameter(gl.RENDERER)
      };
    } catch {
      return null;
    }
  }

  async function getHighEntropyValues(keys){
    if (!navigator.userAgentData || typeof navigator.userAgentData.getHighEntropyValues !== 'function') return {};
    try {
      return await navigator.userAgentData.getHighEntropyValues(keys);
    } catch {
      return {};
    }
  }

  async function getStorageEstimate(){
    if (!navigator.storage || typeof navigator.storage.estimate !== 'function') return null;
    try {
      const result = await navigator.storage.estimate();
      if (!result) return null;
      const usage = Number(result.usage);
      const quota = Number(result.quota);
      if (!Number.isFinite(usage) || !Number.isFinite(quota)) return null;
      return { usage, quota };
    } catch {
      return null;
    }
  }

  async function getBatteryInfo(){
    if (!navigator.getBattery) return null;
    try {
      const battery = await navigator.getBattery();
      if (!battery) return null;
      return {
        charging: !!battery.charging,
        level: Number.isFinite(battery.level) ? battery.level : null,
        chargingTime: Number.isFinite(battery.chargingTime) ? battery.chargingTime : null,
        dischargingTime: Number.isFinite(battery.dischargingTime) ? battery.dischargingTime : null
      };
    } catch {
      return null;
    }
  }

  async function fetchIpInformation(abortSignal){
    const headers = { 'cache-control': 'no-store' };
    const errors = [];
    for (const endpoint of IP_ENDPOINTS){
      try {
        const res = await fetch(endpoint.url, { cache: 'no-store', headers, signal: abortSignal });
        if (!res.ok) {
          errors.push(`${endpoint.label}: HTTP ${res.status}`);
          continue;
        }
        const text = await res.text();
        let data = null;
        try {
          data = JSON.parse(text);
        } catch {
          data = { raw: text.trim() };
        }
        return { source: endpoint.label, data };
      } catch (err){
        if (err?.name === 'AbortError') throw err;
        errors.push(`${endpoint.label}: ${err && err.message ? err.message : '取得失敗'}`);
      }
    }
    throw new Error(errors.join('\n'));
  }

  function createTabButton(label = ''){
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = label ?? '';
    btn.style.border = '1px solid rgba(148,163,184,0.35)';
    btn.style.background = 'rgba(15,23,42,0.45)';
    btn.style.color = '#e2e8f0';
    btn.style.padding = '10px 16px';
    btn.style.borderRadius = '10px';
    btn.style.cursor = 'pointer';
    btn.style.fontSize = '14px';
    btn.style.fontWeight = '600';
    btn.style.transition = 'background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease';
    btn.addEventListener('pointerenter', () => {
      btn.style.transform = 'translateY(-1px)';
      btn.style.boxShadow = '0 10px 22px rgba(15,23,42,0.35)';
    });
    btn.addEventListener('pointerleave', () => {
      btn.style.transform = 'translateY(0)';
      btn.style.boxShadow = 'none';
    });
    return btn;
  }

  function setTabButtonActive(button, active){
    if (!button) return;
    if (active){
      button.style.background = 'linear-gradient(135deg, #2563eb, #38bdf8)';
      button.style.color = '#0f172a';
    } else {
      button.style.background = 'rgba(15,23,42,0.45)';
      button.style.color = '#e2e8f0';
    }
  }

  function createInfoGrid(){
    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'minmax(120px, 220px) 1fr';
    grid.style.gap = '10px 18px';
    grid.style.alignItems = 'flex-start';
    grid.style.width = '100%';
    return grid;
  }

  function appendRow(grid, label){
    const labelEl = document.createElement('div');
    labelEl.textContent = label;
    labelEl.style.fontWeight = '600';
    labelEl.style.fontSize = '13px';
    labelEl.style.color = '#94a3b8';
    const valueWrap = document.createElement('div');
    valueWrap.style.display = 'flex';
    valueWrap.style.flexDirection = 'column';
    valueWrap.style.gap = '3px';
    const valueEl = document.createElement('div');
    valueEl.textContent = '-';
    valueEl.style.fontSize = '14px';
    valueEl.style.color = '#0f172a';
    valueEl.style.wordBreak = 'break-word';
    const noteEl = document.createElement('div');
    noteEl.style.fontSize = '12px';
    noteEl.style.color = '#64748b';
    noteEl.style.display = 'none';
    valueWrap.appendChild(valueEl);
    valueWrap.appendChild(noteEl);
    grid.appendChild(labelEl);
    grid.appendChild(valueWrap);
    return {
      label: labelEl,
      value: valueEl,
      note: noteEl,
      set(value, note){
        valueEl.textContent = value ?? '-';
        if (note){
          noteEl.textContent = note;
          noteEl.style.display = 'block';
        } else {
          noteEl.style.display = 'none';
        }
      }
    };
  }

  function createMetricCard(title = ''){
    const card = document.createElement('div');
    card.style.background = 'rgba(15,23,42,0.65)';
    card.style.border = '1px solid rgba(148,163,184,0.25)';
    card.style.borderRadius = '14px';
    card.style.padding = '16px';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.gap = '6px';
    const titleEl = document.createElement('div');
    titleEl.textContent = title ?? '';
    titleEl.style.fontSize = '13px';
    titleEl.style.color = 'rgba(226,232,240,0.75)';
    const valueEl = document.createElement('div');
    valueEl.textContent = '-';
    valueEl.style.fontSize = '22px';
    valueEl.style.fontWeight = '700';
    valueEl.style.color = '#f8fafc';
    const noteEl = document.createElement('div');
    noteEl.style.fontSize = '12px';
    noteEl.style.color = 'rgba(148,163,184,0.75)';
    noteEl.style.minHeight = '16px';
    card.appendChild(titleEl);
    card.appendChild(valueEl);
    card.appendChild(noteEl);
    return {
      element: card,
      title: titleEl,
      value: valueEl,
      note: noteEl,
      setValue(value, note){
        valueEl.textContent = value ?? '-';
        noteEl.textContent = note ?? '';
      }
    };
  }

  function createSectionTitle(text = ''){
    const heading = document.createElement('h3');
    heading.textContent = text ?? '';
    heading.style.margin = '0';
    heading.style.fontSize = '16px';
    heading.style.color = '#1f2937';
    heading.style.fontWeight = '700';
    return heading;
  }

  function create(root, awardXp, opts = {}){
    if (!root) throw new Error('System utility requires a container');

    const localization = opts?.localization || (GLOBAL && typeof GLOBAL.createMiniGameLocalization === 'function'
      ? GLOBAL.createMiniGameLocalization({ id: 'system' })
      : null);
    const text = (key, fallback, params) => {
      if (localization && typeof localization.t === 'function'){
        return localization.t(key, fallback, params);
      }
      if (typeof fallback === 'function') return fallback();
      return fallback ?? '';
    };
    const toText = value => (value == null ? '' : String(value));
    const localizationUpdaters = [];
    const registerLocalizationUpdater = fn => {
      if (typeof fn !== 'function') return () => {};
      localizationUpdaters.push(fn);
      try { fn(); } catch {}
      return fn;
    };
    const applyLocaleUpdates = () => {
      localizationUpdaters.forEach(fn => {
        try { fn(); } catch {}
      });
    };
    let detachLocale = null;
    if (localization && typeof localization.onChange === 'function'){
      detachLocale = localization.onChange(() => {
        applyLocaleUpdates();
      });
    }
    const bindLocalizedText = (element, key, fallback, { attr = 'textContent', params } = {}) => {
      return registerLocalizationUpdater(() => {
        const paramValue = typeof params === 'function' ? params() : params;
        const resolved = text(key, fallback, paramValue);
        if (attr === 'textContent') element.textContent = toText(resolved);
        else element[attr] = toText(resolved);
      });
    };
    const localText = (suffix, fallback, params) => text(`${I18N_PREFIX}.${suffix}`, fallback, params);

    const state = {
      sessionXp: 0,
      activeTab: 'pc',
      activePcTab: 'pc-info',
      hardwareInfo: null,
      osInfo: null,
      browserInfo: null,
      ipInfo: null,
      ipSource: null,
      ipError: null,
      ipUpdatedAt: null,
      monitor: {
        cpuUsage: 0,
        loopLag: 0,
        fps: 0,
        lastTick: performance.now(),
        interval: 1000,
        timer: null,
        rafId: null
      },
      abortController: null
    };

    let isRunning = false;

    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.boxSizing = 'border-box';
    wrapper.style.padding = '24px';
    wrapper.style.background = 'linear-gradient(135deg, #e2e8f0, #f8fafc)';
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '16px';
    wrapper.style.fontFamily = '\"Noto Sans JP\", \"Hiragino Sans\", sans-serif';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.flexWrap = 'wrap';
    header.style.alignItems = 'center';
    header.style.justifyContent = 'space-between';
    header.style.gap = '12px';

    const titleWrap = document.createElement('div');
    titleWrap.style.display = 'flex';
    titleWrap.style.flexDirection = 'column';
    titleWrap.style.gap = '4px';

    const title = document.createElement('h2');
    title.style.margin = '0';
    title.style.fontSize = '26px';
    title.style.color = '#0f172a';
    bindLocalizedText(title, `${I18N_PREFIX}.header.title`, 'システムユーティリティ');

    const subtitle = document.createElement('div');
    subtitle.style.fontSize = '14px';
    subtitle.style.color = '#475569';
    bindLocalizedText(subtitle, `${I18N_PREFIX}.header.subtitle`, 'PC / OS / ブラウザ / ネットワーク情報をまとめて確認');

    titleWrap.appendChild(title);
    titleWrap.appendChild(subtitle);

    const headerActions = document.createElement('div');
    headerActions.style.display = 'flex';
    headerActions.style.alignItems = 'center';
    headerActions.style.gap = '8px';

    const xpChip = document.createElement('div');
    xpChip.style.padding = '6px 12px';
    xpChip.style.borderRadius = '999px';
    xpChip.style.background = 'rgba(59,130,246,0.12)';
    xpChip.style.border = '1px solid rgba(59,130,246,0.4)';
    xpChip.style.color = '#1d4ed8';
    xpChip.style.fontSize = '13px';
    xpChip.style.fontWeight = '600';
    const updateXpChipLabel = () => {
      xpChip.textContent = toText(text(`${I18N_PREFIX}.header.sessionXp`, 'セッションEXP {xp}', {
        xp: Math.round(state.sessionXp)
      }));
    };
    registerLocalizationUpdater(updateXpChipLabel);

    const copyButton = createTabButton();
    copyButton.style.padding = '10px 14px';
    bindLocalizedText(copyButton, `${I18N_PREFIX}.controls.copySummary`, '概要をコピー');

    headerActions.appendChild(xpChip);
    headerActions.appendChild(copyButton);

    header.appendChild(titleWrap);
    header.appendChild(headerActions);

    const tabBar = document.createElement('div');
    tabBar.style.display = 'flex';
    tabBar.style.flexWrap = 'wrap';
    tabBar.style.gap = '8px';

    const tabButtons = new Map();
    MAIN_TABS.forEach(tab => {
      const btn = createTabButton();
      btn.dataset.tab = tab.id;
      bindLocalizedText(btn, `${I18N_PREFIX}.tabs.${tab.id}`, tab.label);
      btn.addEventListener('click', () => selectMainTab(tab.id));
      tabButtons.set(tab.id, btn);
      tabBar.appendChild(btn);
    });

    const contentArea = document.createElement('div');
    contentArea.style.flex = '1';
    contentArea.style.display = 'flex';
    contentArea.style.flexDirection = 'column';

    const panels = new Map();

    // PC panel
    const pcPanel = document.createElement('div');
    pcPanel.style.display = 'flex';
    pcPanel.style.flexDirection = 'column';
    pcPanel.style.gap = '18px';

    const pcTabBar = document.createElement('div');
    pcTabBar.style.display = 'flex';
    pcTabBar.style.flexWrap = 'wrap';
    pcTabBar.style.gap = '8px';

    const pcSubButtons = new Map();
    PC_SUB_TABS.forEach(tab => {
      const btn = createTabButton();
      btn.dataset.tab = tab.id;
      btn.style.fontSize = '13px';
      bindLocalizedText(btn, `${I18N_PREFIX}.pcSubTabs.${tab.id}`, tab.label);
      btn.addEventListener('click', () => selectPcSubTab(tab.id));
      pcSubButtons.set(tab.id, btn);
      pcTabBar.appendChild(btn);
    });

    const pcContent = document.createElement('div');
    pcContent.style.background = 'rgba(255,255,255,0.8)';
    pcContent.style.border = '1px solid rgba(148,163,184,0.25)';
    pcContent.style.borderRadius = '16px';
    pcContent.style.padding = '20px';
    pcContent.style.display = 'flex';
    pcContent.style.flexDirection = 'column';
    pcContent.style.gap = '16px';

    const pcInfoSection = document.createElement('div');
    pcInfoSection.style.display = 'flex';
    pcInfoSection.style.flexDirection = 'column';
    pcInfoSection.style.gap = '16px';

    const pcInfoHeader = document.createElement('div');
    pcInfoHeader.style.display = 'flex';
    pcInfoHeader.style.alignItems = 'center';
    pcInfoHeader.style.justifyContent = 'space-between';
    pcInfoHeader.style.flexWrap = 'wrap';
    pcInfoHeader.style.gap = '10px';

    const pcInfoTitle = createSectionTitle();
    bindLocalizedText(pcInfoTitle, `${I18N_PREFIX}.sections.pcInfo.title`, 'システム情報');
    const refreshPcButton = createTabButton();
    bindLocalizedText(refreshPcButton, `${I18N_PREFIX}.controls.refreshHardware`, '最新情報を取得');
    refreshPcButton.style.fontSize = '13px';
    refreshPcButton.style.padding = '8px 12px';

    pcInfoHeader.appendChild(pcInfoTitle);
    pcInfoHeader.appendChild(refreshPcButton);

    const pcInfoGrid = createInfoGrid();
    const pcInfoRows = {
      motherboard: appendRow(pcInfoGrid, ''),
      cpuFamily: appendRow(pcInfoGrid, ''),
      cpuThreads: appendRow(pcInfoGrid, ''),
      cpuFrequency: appendRow(pcInfoGrid, ''),
      architecture: appendRow(pcInfoGrid, ''),
      memory: appendRow(pcInfoGrid, ''),
      jsHeap: appendRow(pcInfoGrid, ''),
      storage: appendRow(pcInfoGrid, ''),
      touch: appendRow(pcInfoGrid, ''),
      gpuVendor: appendRow(pcInfoGrid, ''),
      gpuName: appendRow(pcInfoGrid, ''),
      gpuMemory: appendRow(pcInfoGrid, ''),
      battery: appendRow(pcInfoGrid, '')
    };
    bindLocalizedText(pcInfoRows.motherboard.label, `${I18N_PREFIX}.pcInfo.motherboard`, 'マザーボード');
    bindLocalizedText(pcInfoRows.cpuFamily.label, `${I18N_PREFIX}.pcInfo.cpuFamily`, 'CPUファミリー');
    bindLocalizedText(pcInfoRows.cpuThreads.label, `${I18N_PREFIX}.pcInfo.cpuThreads`, 'CPUスレッド数');
    bindLocalizedText(pcInfoRows.cpuFrequency.label, `${I18N_PREFIX}.pcInfo.cpuFrequency`, 'CPU周波数');
    bindLocalizedText(pcInfoRows.architecture.label, `${I18N_PREFIX}.pcInfo.architecture`, 'アーキテクチャ');
    bindLocalizedText(pcInfoRows.memory.label, `${I18N_PREFIX}.pcInfo.memory`, 'メモリ容量');
    bindLocalizedText(pcInfoRows.jsHeap.label, `${I18N_PREFIX}.pcInfo.jsHeap`, 'JSヒープ上限');
    bindLocalizedText(pcInfoRows.storage.label, `${I18N_PREFIX}.pcInfo.storage`, 'ストレージ推定');
    bindLocalizedText(pcInfoRows.touch.label, `${I18N_PREFIX}.pcInfo.touch`, 'タッチポイント');
    bindLocalizedText(pcInfoRows.gpuVendor.label, `${I18N_PREFIX}.pcInfo.gpuVendor`, 'GPUベンダー');
    bindLocalizedText(pcInfoRows.gpuName.label, `${I18N_PREFIX}.pcInfo.gpuName`, 'GPU名');
    bindLocalizedText(pcInfoRows.gpuMemory.label, `${I18N_PREFIX}.pcInfo.gpuMemory`, 'GPUメモリ');
    bindLocalizedText(pcInfoRows.battery.label, `${I18N_PREFIX}.pcInfo.battery`, 'バッテリー');

    const monitorSection = document.createElement('div');
    monitorSection.style.display = 'flex';
    monitorSection.style.flexDirection = 'column';
    monitorSection.style.gap = '16px';

    const monitorHeader = document.createElement('div');
    monitorHeader.style.display = 'flex';
    monitorHeader.style.alignItems = 'center';
    monitorHeader.style.justifyContent = 'space-between';
    monitorHeader.style.flexWrap = 'wrap';
    monitorHeader.style.gap = '10px';

    const monitorTitle = createSectionTitle();
    bindLocalizedText(monitorTitle, `${I18N_PREFIX}.sections.monitor.title`, 'リアルタイムモニター');
    const monitorNote = document.createElement('div');
    monitorNote.style.fontSize = '12px';
    monitorNote.style.color = '#64748b';
    bindLocalizedText(monitorNote, `${I18N_PREFIX}.sections.monitor.note`, 'ブラウザの標準APIを用いた推定値です。実際のシステム使用率とは異なる場合があります。');

    monitorHeader.appendChild(monitorTitle);
    monitorHeader.appendChild(monitorNote);

    const monitorGrid = document.createElement('div');
    monitorGrid.style.display = 'grid';
    monitorGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
    monitorGrid.style.gap = '16px';

    const cpuCard = createMetricCard();
    const lagCard = createMetricCard();
    const fpsCard = createMetricCard();
    const memoryCard = createMetricCard();
    const deviceMemoryCard = createMetricCard();
    bindLocalizedText(cpuCard.title, `${I18N_PREFIX}.monitor.cpu`, 'CPU使用率 (推定)');
    bindLocalizedText(lagCard.title, `${I18N_PREFIX}.monitor.loopLag`, 'イベントループ遅延');
    bindLocalizedText(fpsCard.title, `${I18N_PREFIX}.monitor.fps`, '描画更新 (FPS)');
    bindLocalizedText(memoryCard.title, `${I18N_PREFIX}.monitor.jsHeap`, 'JSヒープ使用量');
    bindLocalizedText(deviceMemoryCard.title, `${I18N_PREFIX}.monitor.deviceMemory`, '実メモリ (推定)');

    monitorGrid.appendChild(cpuCard.element);
    monitorGrid.appendChild(lagCard.element);
    monitorGrid.appendChild(fpsCard.element);
    monitorGrid.appendChild(memoryCard.element);
    monitorGrid.appendChild(deviceMemoryCard.element);

    monitorSection.appendChild(monitorHeader);
    monitorSection.appendChild(monitorGrid);

    pcInfoSection.appendChild(pcInfoHeader);
    pcInfoSection.appendChild(pcInfoGrid);

    pcContent.appendChild(pcInfoSection);
    pcContent.appendChild(monitorSection);

    pcPanel.appendChild(pcTabBar);
    pcPanel.appendChild(pcContent);

    panels.set('pc', pcPanel);

    // OS panel
    const osPanel = document.createElement('div');
    osPanel.style.display = 'flex';
    osPanel.style.flexDirection = 'column';
    osPanel.style.gap = '18px';
    osPanel.style.background = 'rgba(255,255,255,0.8)';
    osPanel.style.border = '1px solid rgba(148,163,184,0.25)';
    osPanel.style.borderRadius = '16px';
    osPanel.style.padding = '20px';

    const osHeader = document.createElement('div');
    osHeader.style.display = 'flex';
    osHeader.style.alignItems = 'center';
    osHeader.style.justifyContent = 'space-between';
    osHeader.style.flexWrap = 'wrap';
    osHeader.style.gap = '10px';

    const osTitle = createSectionTitle();
    bindLocalizedText(osTitle, `${I18N_PREFIX}.sections.os.title`, 'OS情報');
    const refreshOsButton = createTabButton();
    bindLocalizedText(refreshOsButton, `${I18N_PREFIX}.controls.refreshOs`, '再読み込み');
    refreshOsButton.style.fontSize = '13px';
    refreshOsButton.style.padding = '8px 12px';

    osHeader.appendChild(osTitle);
    osHeader.appendChild(refreshOsButton);

    const osGrid = createInfoGrid();
    const osRows = {
      name: appendRow(osGrid, ''),
      version: appendRow(osGrid, ''),
      build: appendRow(osGrid, ''),
      bitness: appendRow(osGrid, ''),
      platform: appendRow(osGrid, ''),
      timezone: appendRow(osGrid, ''),
      locale: appendRow(osGrid, ''),
      languages: appendRow(osGrid, ''),
      uptime: appendRow(osGrid, ''),
      lastChecked: appendRow(osGrid, '')
    };
    bindLocalizedText(osRows.name.label, `${I18N_PREFIX}.os.name`, 'OS名称');
    bindLocalizedText(osRows.version.label, `${I18N_PREFIX}.os.version`, 'バージョン');
    bindLocalizedText(osRows.build.label, `${I18N_PREFIX}.os.build`, 'ビルド');
    bindLocalizedText(osRows.bitness.label, `${I18N_PREFIX}.os.bitness`, 'ビット数');
    bindLocalizedText(osRows.platform.label, `${I18N_PREFIX}.os.platform`, 'プラットフォーム');
    bindLocalizedText(osRows.timezone.label, `${I18N_PREFIX}.os.timezone`, 'タイムゾーン');
    bindLocalizedText(osRows.locale.label, `${I18N_PREFIX}.os.locale`, 'ロケール');
    bindLocalizedText(osRows.languages.label, `${I18N_PREFIX}.os.languages`, '利用言語');
    bindLocalizedText(osRows.uptime.label, `${I18N_PREFIX}.os.uptime`, '起動時間 (推定)');
    bindLocalizedText(osRows.lastChecked.label, `${I18N_PREFIX}.os.lastChecked`, '最終更新');

    osPanel.appendChild(osHeader);
    osPanel.appendChild(osGrid);
    panels.set('os', osPanel);

    // Browser panel
    const browserPanel = document.createElement('div');
    browserPanel.style.display = 'flex';
    browserPanel.style.flexDirection = 'column';
    browserPanel.style.gap = '18px';
    browserPanel.style.background = 'rgba(255,255,255,0.8)';
    browserPanel.style.border = '1px solid rgba(148,163,184,0.25)';
    browserPanel.style.borderRadius = '16px';
    browserPanel.style.padding = '20px';

    const browserHeader = document.createElement('div');
    browserHeader.style.display = 'flex';
    browserHeader.style.alignItems = 'center';
    browserHeader.style.justifyContent = 'space-between';
    browserHeader.style.flexWrap = 'wrap';
    browserHeader.style.gap = '10px';

    const browserTitle = createSectionTitle();
    bindLocalizedText(browserTitle, `${I18N_PREFIX}.sections.browser.title`, 'ブラウザ情報');
    const refreshBrowserButton = createTabButton();
    bindLocalizedText(refreshBrowserButton, `${I18N_PREFIX}.controls.refreshBrowser`, '再分析');
    refreshBrowserButton.style.fontSize = '13px';
    refreshBrowserButton.style.padding = '8px 12px';

    browserHeader.appendChild(browserTitle);
    browserHeader.appendChild(refreshBrowserButton);

    const browserGrid = createInfoGrid();
    const browserRows = {
      name: appendRow(browserGrid, ''),
      version: appendRow(browserGrid, ''),
      engine: appendRow(browserGrid, ''),
      agent: appendRow(browserGrid, ''),
      brands: appendRow(browserGrid, ''),
      vendor: appendRow(browserGrid, ''),
      doNotTrack: appendRow(browserGrid, ''),
      online: appendRow(browserGrid, ''),
      cookies: appendRow(browserGrid, ''),
      storage: appendRow(browserGrid, ''),
      features: appendRow(browserGrid, ''),
      html5: appendRow(browserGrid, '')
    };
    bindLocalizedText(browserRows.name.label, `${I18N_PREFIX}.browser.name`, 'ブラウザ名');
    bindLocalizedText(browserRows.version.label, `${I18N_PREFIX}.browser.version`, 'バージョン');
    bindLocalizedText(browserRows.engine.label, `${I18N_PREFIX}.browser.engine`, 'レンダリングエンジン');
    bindLocalizedText(browserRows.agent.label, `${I18N_PREFIX}.browser.agent`, 'ユーザーエージェント');
    bindLocalizedText(browserRows.brands.label, `${I18N_PREFIX}.browser.brands`, 'ブランド情報');
    bindLocalizedText(browserRows.vendor.label, `${I18N_PREFIX}.browser.vendor`, 'ベンダー');
    bindLocalizedText(browserRows.doNotTrack.label, `${I18N_PREFIX}.browser.doNotTrack`, 'Do Not Track');
    bindLocalizedText(browserRows.online.label, `${I18N_PREFIX}.browser.online`, 'オンライン状態');
    bindLocalizedText(browserRows.cookies.label, `${I18N_PREFIX}.browser.cookies`, 'Cookie');
    bindLocalizedText(browserRows.storage.label, `${I18N_PREFIX}.browser.storage`, 'ストレージAPI');
    bindLocalizedText(browserRows.features.label, `${I18N_PREFIX}.browser.features`, '主な技術');
    bindLocalizedText(browserRows.html5.label, `${I18N_PREFIX}.browser.html5`, 'HTML5サポート (主要API)');

    browserPanel.appendChild(browserHeader);
    browserPanel.appendChild(browserGrid);
    panels.set('browser', browserPanel);

    // IP panel
    const ipPanel = document.createElement('div');
    ipPanel.style.display = 'flex';
    ipPanel.style.flexDirection = 'column';
    ipPanel.style.gap = '18px';
    ipPanel.style.background = 'rgba(255,255,255,0.8)';
    ipPanel.style.border = '1px solid rgba(148,163,184,0.25)';
    ipPanel.style.borderRadius = '16px';
    ipPanel.style.padding = '20px';

    const ipHeader = document.createElement('div');
    ipHeader.style.display = 'flex';
    ipHeader.style.flexWrap = 'wrap';
    ipHeader.style.alignItems = 'center';
    ipHeader.style.justifyContent = 'space-between';
    ipHeader.style.gap = '10px';

    const ipTitle = createSectionTitle();
    bindLocalizedText(ipTitle, `${I18N_PREFIX}.sections.ip.title`, 'IP情報');
    const ipActionWrap = document.createElement('div');
    ipActionWrap.style.display = 'flex';
    ipActionWrap.style.gap = '8px';
    ipActionWrap.style.flexWrap = 'wrap';

    const fetchIpButton = createTabButton();
    bindLocalizedText(fetchIpButton, `${I18N_PREFIX}.controls.fetchIp`, 'IP情報を取得');
    fetchIpButton.style.fontSize = '13px';
    fetchIpButton.style.padding = '8px 12px';

    const cancelIpButton = createTabButton();
    bindLocalizedText(cancelIpButton, `${I18N_PREFIX}.controls.cancelIp`, '取得を中止');
    cancelIpButton.style.fontSize = '13px';
    cancelIpButton.style.padding = '8px 12px';
    cancelIpButton.style.display = 'none';

    const copyIpButton = createTabButton();
    bindLocalizedText(copyIpButton, `${I18N_PREFIX}.controls.copyIp`, '結果をコピー');
    copyIpButton.style.fontSize = '13px';
    copyIpButton.style.padding = '8px 12px';

    ipActionWrap.appendChild(fetchIpButton);
    ipActionWrap.appendChild(cancelIpButton);
    ipActionWrap.appendChild(copyIpButton);

    ipHeader.appendChild(ipTitle);
    ipHeader.appendChild(ipActionWrap);

    const ipStatus = document.createElement('div');
    ipStatus.style.fontSize = '13px';
    ipStatus.style.color = '#475569';
    bindLocalizedText(ipStatus, `${I18N_PREFIX}.ip.statusIdle`, 'ネットワークアクセスが必要です。取得ボタンを押してください。');

    const ipGrid = createInfoGrid();
    const ipRows = {
      ip: appendRow(ipGrid, ''),
      hostname: appendRow(ipGrid, ''),
      city: appendRow(ipGrid, ''),
      region: appendRow(ipGrid, ''),
      country: appendRow(ipGrid, ''),
      loc: appendRow(ipGrid, ''),
      org: appendRow(ipGrid, ''),
      postal: appendRow(ipGrid, ''),
      timezone: appendRow(ipGrid, ''),
      asn: appendRow(ipGrid, ''),
      userAgent: appendRow(ipGrid, ''),
      updated: appendRow(ipGrid, '')
    };
    bindLocalizedText(ipRows.ip.label, `${I18N_PREFIX}.ip.ip`, 'IPアドレス');
    bindLocalizedText(ipRows.hostname.label, `${I18N_PREFIX}.ip.hostname`, 'ホスト名');
    bindLocalizedText(ipRows.city.label, `${I18N_PREFIX}.ip.city`, '都市');
    bindLocalizedText(ipRows.region.label, `${I18N_PREFIX}.ip.region`, '地域');
    bindLocalizedText(ipRows.country.label, `${I18N_PREFIX}.ip.country`, '国');
    bindLocalizedText(ipRows.loc.label, `${I18N_PREFIX}.ip.loc`, '緯度経度');
    bindLocalizedText(ipRows.org.label, `${I18N_PREFIX}.ip.org`, '組織 / ISP');
    bindLocalizedText(ipRows.postal.label, `${I18N_PREFIX}.ip.postal`, '郵便番号');
    bindLocalizedText(ipRows.timezone.label, `${I18N_PREFIX}.ip.timezone`, 'タイムゾーン');
    bindLocalizedText(ipRows.asn.label, `${I18N_PREFIX}.ip.asn`, 'ASN');
    bindLocalizedText(ipRows.userAgent.label, `${I18N_PREFIX}.ip.userAgent`, 'エージェント');
    bindLocalizedText(ipRows.updated.label, `${I18N_PREFIX}.ip.updated`, '最終取得');

    ipPanel.appendChild(ipHeader);
    ipPanel.appendChild(ipStatus);
    ipPanel.appendChild(ipGrid);
    panels.set('ip', ipPanel);

    contentArea.appendChild(pcPanel);
    contentArea.appendChild(osPanel);
    contentArea.appendChild(browserPanel);
    contentArea.appendChild(ipPanel);

    wrapper.appendChild(header);
    wrapper.appendChild(tabBar);
    wrapper.appendChild(contentArea);

    root.appendChild(wrapper);

    function updateSessionXp(){
      updateXpChipLabel();
    }

    function award(type, amount, payload){
      if (!awardXp || !amount) return 0;
      try {
        const gained = awardXp(amount, Object.assign({ type }, payload || {}));
        const num = Number(gained);
        if (Number.isFinite(num) && num !== 0){
          state.sessionXp += num;
          updateSessionXp();
        }
        return gained;
      } catch {
        return 0;
      }
    }

    function selectMainTab(id){
      state.activeTab = id;
      panels.forEach((panel, key) => {
        panel.style.display = key === id ? 'flex' : 'none';
      });
      tabButtons.forEach((btn, key) => {
        setTabButtonActive(btn, key === id);
      });
      if (id === 'pc'){
        selectPcSubTab(state.activePcTab);
      }
    }

    function selectPcSubTab(id){
      state.activePcTab = id;
      setTabButtonActive(pcSubButtons.get('pc-info'), id === 'pc-info');
      setTabButtonActive(pcSubButtons.get('pc-monitor'), id === 'pc-monitor');
      pcInfoSection.style.display = id === 'pc-info' ? 'flex' : 'none';
      monitorSection.style.display = id === 'pc-monitor' ? 'flex' : 'none';
    }

    function updatePcInfoUI(info){
      const unavailable = localText('status.unavailable', '取得不可');
      const unknown = localText('status.unknown', '不明');
      const notAvailable = localText('status.notAvailable', '-');
      const noMotherboard = localText('pcInfo.notes.motherboardUnavailable', 'ブラウザからはマザーボード情報にアクセスできません。');
      const cpuFreqNote = localText('pcInfo.notes.cpuFrequencyUnavailable', 'CPU周波数はWeb標準APIでは公開されていません。');
      const jsHeapNote = localText('pcInfo.notes.jsHeapChromeOnly', 'Chrome系ブラウザのみ提供されます。');
      const storageNote = localText('pcInfo.notes.storageEstimate', 'navigator.storage.estimate() による推定値');
      const gpuNote = localText('pcInfo.notes.gpuWebgl', 'WEBGL_debug_renderer_infoから取得');
      const gpuDisabled = localText('pcInfo.notes.gpuDisabled', 'WebGLが無効化されている可能性があります。');
      const gpuMemoryNote = localText('pcInfo.notes.gpuMemoryUnavailable', 'ブラウザはGPUメモリの総量を公開しません。');
      const batteryUnavailable = localText('pcInfo.notes.batteryUnavailable', 'Battery Status APIは利用できないか、許可されていません。');
      const batteryCharging = localText('pcInfo.battery.charging', '充電中');
      const batteryDischarging = localText('pcInfo.battery.discharging', '放電中');

      if (!info){
        pcInfoRows.motherboard.set(unavailable, noMotherboard);
        pcInfoRows.cpuFamily.set(unknown);
        pcInfoRows.cpuThreads.set(notAvailable);
        pcInfoRows.cpuFrequency.set(unavailable, cpuFreqNote);
        pcInfoRows.architecture.set(notAvailable);
        pcInfoRows.memory.set(notAvailable);
        pcInfoRows.jsHeap.set(notAvailable);
        pcInfoRows.storage.set(notAvailable);
        pcInfoRows.touch.set(notAvailable);
        pcInfoRows.gpuVendor.set(notAvailable);
        pcInfoRows.gpuName.set(notAvailable);
        pcInfoRows.gpuMemory.set(unavailable, gpuMemoryNote);
        pcInfoRows.battery.set(notAvailable);
        return;
      }

      pcInfoRows.motherboard.set(unavailable, noMotherboard);
      pcInfoRows.cpuFamily.set(info.cpuFamily || unknown);
      pcInfoRows.cpuThreads.set(info.cpuThreads ? localText('pcInfo.values.cpuThreads', '{threads} スレッド', { threads: info.cpuThreads }) : notAvailable);
      pcInfoRows.cpuFrequency.set(unavailable, cpuFreqNote);
      pcInfoRows.architecture.set(info.architecture || notAvailable);
      pcInfoRows.memory.set(info.deviceMemory ? localText('pcInfo.values.deviceMemory', '{memory} GB (navigator.deviceMemory)', { memory: info.deviceMemory }) : notAvailable);
      if (info.jsHeapLimit){
        pcInfoRows.jsHeap.set(formatBytes(info.jsHeapLimit), info.jsHeapNote || jsHeapNote);
      } else {
        pcInfoRows.jsHeap.set(notAvailable);
      }
      if (info.storage){
        pcInfoRows.storage.set(`${formatBytes(info.storage.usage)} / ${formatBytes(info.storage.quota)}`, storageNote);
      } else {
        pcInfoRows.storage.set(notAvailable);
      }
      pcInfoRows.touch.set(info.touchPoints != null ? String(info.touchPoints) : notAvailable);
      pcInfoRows.gpuVendor.set(info.gpu?.vendor || unavailable, info.gpu ? gpuNote : gpuDisabled);
      pcInfoRows.gpuName.set(info.gpu?.renderer || notAvailable);
      pcInfoRows.gpuMemory.set(unavailable, gpuMemoryNote);
      if (info.battery){
        const percent = Number.isFinite(info.battery.level) ? `${PERCENT_FORMAT.format(info.battery.level * 100)}%` : unknown;
        const charging = info.battery.charging ? batteryCharging : batteryDischarging;
        pcInfoRows.battery.set(localText('pcInfo.values.battery', '{level} ({state})', { level: percent, state: charging }));
      } else {
        pcInfoRows.battery.set(unavailable, batteryUnavailable);
      }
    }

    function updateMonitorCards(){
      cpuCard.setValue(formatPercent(state.monitor.cpuUsage * 100), localText('monitor.notes.cpuUsage', 'イベントループ遅延から推定'));
      lagCard.setValue(`${NUMBER_FORMAT.format(state.monitor.loopLag)} ms`, localText('monitor.notes.loopLag', 'setInterval基準との差分'));
      fpsCard.setValue(state.monitor.fps ? `${NUMBER_FORMAT.format(state.monitor.fps)} fps` : localText('status.notAvailable', '-'), localText('monitor.notes.fps', 'requestAnimationFrameの結果'));
      const memoryInfo = state.hardwareInfo?.memoryUsage;
      if (memoryInfo){
        const pct = memoryInfo.limit > 0 ? (memoryInfo.used / memoryInfo.limit) : NaN;
        const value = `${formatBytes(memoryInfo.used)} / ${formatBytes(memoryInfo.limit)}`;
        const note = Number.isFinite(pct)
          ? localText('monitor.notes.memoryUsage', '使用率 {percent}', { percent: formatPercent(pct * 100) })
          : localText('monitor.notes.memoryChromeOnly', 'Chrome系でのみ利用可能');
        memoryCard.setValue(value, note);
      } else {
        memoryCard.setValue(localText('status.notAvailable', '-'), localText('monitor.notes.memoryUnavailable', 'performance.memory が利用できません'));
      }
      if (state.hardwareInfo?.deviceMemory){
        deviceMemoryCard.setValue(`${state.hardwareInfo.deviceMemory} GB`, localText('monitor.notes.deviceMemoryEstimate', 'navigator.deviceMemoryによる概算'));
      } else {
        deviceMemoryCard.setValue(localText('status.notAvailable', '-'), localText('status.unavailable', '取得不可'));
      }
    }

    function updateOsUI(){
      const info = state.osInfo;
      const now = new Date();
      const unknown = localText('status.unknown', '不明');
      const dash = localText('status.notAvailable', '-');
      const buildNote = localText('os.notes.buildUnavailable', 'ブラウザは詳細なビルド番号を提供しません。');
      const uptimeNote = localText('os.notes.uptime', 'OSの起動時間は取得できないためブラウザ稼働時間を表示');
      osRows.name.set(info?.name || unknown, info?.detail || '');
      osRows.version.set(info?.version || dash);
      osRows.build.set(info?.build || dash, buildNote);
      osRows.bitness.set(info?.bitness || dash);
      osRows.platform.set(navigator.platform || dash);
      const tz = (() => {
        try {
          return Intl.DateTimeFormat().resolvedOptions().timeZone || dash;
        } catch {
          return dash;
        }
      })();
      osRows.timezone.set(tz);
      osRows.locale.set(navigator.language || dash);
      osRows.languages.set(Array.isArray(navigator.languages) ? navigator.languages.join(', ') : dash);
      const uptimeSeconds = performance.now ? Math.floor(performance.now() / 1000) : null;
      osRows.uptime.set(
        uptimeSeconds != null
          ? localText('os.values.uptime', '{hours} 時間 (ブラウザ稼働時間)', { hours: NUMBER_FORMAT.format(uptimeSeconds / 3600) })
          : dash,
        uptimeNote
      );
      osRows.lastChecked.set(DATE_TIME_FORMAT.format(now));
    }

    function updateBrowserUI(){
      const info = state.browserInfo;
      const ua = navigator.userAgent || '-';
      const brands = navigator.userAgentData?.brands || [];
      const unknown = localText('status.unknown', '不明');
      const dash = localText('status.notAvailable', '-');
      const unavailable = localText('status.unavailable', '取得不可');
      const onlineText = navigator.onLine ? localText('browser.status.online', 'オンライン') : localText('browser.status.offline', 'オフライン');
      const dntEnabled = localText('browser.status.dntEnabled', '有効');
      const dntDisabled = localText('browser.status.dntDisabled', '無効');
      const dntUnknown = localText('status.unknown', '不明');
      const cookiesEnabled = localText('browser.status.cookiesEnabled', '利用可能');
      const cookiesDisabled = localText('browser.status.cookiesDisabled', '無効');
      const noFeatures = localText('browser.notes.noFeatures', '主要API情報なし');
      const html5Unknown = localText('browser.notes.html5Unknown', '判定不可');
      browserRows.name.set(info?.name || unknown);
      browserRows.version.set(info?.version || dash);
      browserRows.engine.set(info?.engine || dash);
      browserRows.agent.set(ua);
      browserRows.brands.set(brands.length ? brands.map(b => `${b.brand} ${b.version}`).join(', ') : unavailable);
      browserRows.vendor.set(info?.vendor || dash);
      browserRows.doNotTrack.set(navigator.doNotTrack === '1' ? dntEnabled : (navigator.doNotTrack === '0' ? dntDisabled : dntUnknown));
      browserRows.online.set(onlineText);
      browserRows.cookies.set(navigator.cookieEnabled ? cookiesEnabled : cookiesDisabled);
      const storageApis = [];
      try {
        if ('localStorage' in window) storageApis.push('localStorage');
      } catch {}
      try {
        if ('sessionStorage' in window) storageApis.push('sessionStorage');
      } catch {}
      if ('indexedDB' in window) storageApis.push('IndexedDB');
      if (navigator.storage && navigator.storage.persist) storageApis.push('StorageManager');
      browserRows.storage.set(storageApis.length ? storageApis.join(', ') : unavailable);
      const features = [];
      if (typeof window.fetch === 'function') features.push('Fetch');
      if ('serviceWorker' in navigator) features.push('ServiceWorker');
      if ('Worker' in window) features.push('WebWorker');
      if ('WebAssembly' in window) features.push('WebAssembly');
      if ('gpu' in navigator) features.push('WebGPU');
      if ('bluetooth' in navigator) features.push('Web Bluetooth');
      if ('mediaDevices' in navigator) features.push('MediaDevices');
      browserRows.features.set(features.length ? features.join(', ') : noFeatures);
      const html5 = [];
      if ('geolocation' in navigator) html5.push('Geolocation');
      if ('localStorage' in window) html5.push('Web Storage');
      if ('Notification' in window) html5.push('Notification');
      if ('RTCPeerConnection' in window) html5.push('WebRTC');
      if ('DeviceOrientationEvent' in window) html5.push('DeviceOrientation');
      try {
        if (document.createElement('canvas').getContext) html5.push('Canvas');
      } catch {}
      browserRows.html5.set(html5.length ? html5.join(', ') : html5Unknown);
    }

    function updateIpUI(){
      const dash = localText('status.notAvailable', '-');
      const idleMessage = localText('ip.statusIdle', 'ネットワークアクセスが必要です。取得ボタンを押してください。');
      if (state.ipError){
        ipStatus.textContent = state.ipError;
        ipStatus.style.color = '#b91c1c';
      } else if (state.ipInfo){
        const lines = [state.ipSource ? localText('ip.statusSource', '{source} から取得', { source: state.ipSource }) : '', state.ipUpdatedAt ? DATE_TIME_FORMAT.format(state.ipUpdatedAt) : ''];
        ipStatus.textContent = lines.filter(Boolean).join(' / ');
        ipStatus.style.color = '#0f172a';
      } else {
        ipStatus.textContent = idleMessage;
        ipStatus.style.color = '#475569';
      }
      const data = state.ipInfo;
      ipRows.ip.set(data?.ip || data?.query || dash);
      ipRows.hostname.set(data?.hostname || data?.host || dash);
      ipRows.city.set(data?.city || dash);
      ipRows.region.set(data?.region || data?.regionName || dash);
      ipRows.country.set(data?.country || data?.countryCode || dash);
      ipRows.loc.set(data?.loc || (data?.latitude && data?.longitude ? `${data.latitude}, ${data.longitude}` : dash));
      ipRows.org.set(data?.org || data?.asn || data?.isp || dash);
      ipRows.postal.set(data?.postal || dash);
      ipRows.timezone.set(data?.timezone || data?.time_zone || dash);
      ipRows.asn.set(data?.asn || data?.as || dash);
      ipRows.userAgent.set(data?.user_agent || data?.userAgent || dash);
      ipRows.updated.set(state.ipUpdatedAt ? DATE_TIME_FORMAT.format(state.ipUpdatedAt) : dash);
    }

    function buildSummary(){
      const lines = [];
      const now = new Date();
      lines.push(localText('summary.header', '[システム概要] {timestamp}', { timestamp: DATE_TIME_FORMAT.format(now) }));
      if (state.hardwareInfo){
        const h = state.hardwareInfo;
        lines.push(localText('summary.cpu', 'CPU: {family} / {threads} threads / arch {arch}', {
          family: h.cpuFamily || localText('status.unknown', '不明'),
          threads: h.cpuThreads || localText('status.notAvailable', '-'),
          arch: h.architecture || localText('status.notAvailable', '-')
        }));
        lines.push(localText('summary.memory', 'Memory: {memory} (JS heap limit {heap})', {
          memory: h.deviceMemory ? `${h.deviceMemory}GB` : localText('status.notAvailable', '-'),
          heap: h.jsHeapLimit ? formatBytes(h.jsHeapLimit) : localText('status.notAvailable', '-')
        }));
        lines.push(localText('summary.gpu', 'GPU: {name} (vendor {vendor})', {
          name: (h.gpu && h.gpu.renderer) || localText('status.notAvailable', '-'),
          vendor: (h.gpu && h.gpu.vendor) || localText('status.notAvailable', '-')
        }));
      }
      if (state.osInfo){
        const o = state.osInfo;
        lines.push(localText('summary.os', 'OS: {name} {version} ({bitness})', {
          name: o.name || localText('status.unknown', '不明'),
          version: o.version || '',
          bitness: o.bitness || localText('status.notAvailable', '-')
        }));
      }
      if (state.browserInfo){
        const b = state.browserInfo;
        lines.push(localText('summary.browser', 'Browser: {name} {version} ({engine})', {
          name: b.name || localText('status.unknown', '不明'),
          version: b.version || '',
          engine: b.engine || localText('status.notAvailable', '-')
        }));
      }
      if (state.ipInfo){
        lines.push(localText('summary.ip', 'IP: {ip} @ {city}, {country}', {
          ip: state.ipInfo.ip || state.ipInfo.query || localText('status.notAvailable', '-'),
          city: state.ipInfo.city || localText('status.notAvailable', '-'),
          country: state.ipInfo.country || localText('status.notAvailable', '-')
        }));
      }
      return lines.join('\n');
    }

    registerLocalizationUpdater(() => updatePcInfoUI(state.hardwareInfo));
    registerLocalizationUpdater(() => updateMonitorCards());
    registerLocalizationUpdater(() => updateOsUI());
    registerLocalizationUpdater(() => updateBrowserUI());
    registerLocalizationUpdater(() => updateIpUI());

    async function refreshHardware(manual){
      const loading = localText('status.loading', '取得中…');
      pcInfoRows.motherboard.set(loading);
      pcInfoRows.cpuFamily.set(loading);
      pcInfoRows.cpuThreads.set(loading);
      pcInfoRows.architecture.set(loading);
      pcInfoRows.memory.set(loading);
      pcInfoRows.jsHeap.set(loading);
      pcInfoRows.storage.set(loading);
      pcInfoRows.touch.set(loading);
      pcInfoRows.gpuVendor.set(loading);
      pcInfoRows.gpuName.set(loading);
      pcInfoRows.battery.set(loading);
      try {
        const ua = navigator.userAgent || '';
        const entropy = await getHighEntropyValues(['architecture', 'bitness', 'model', 'platformVersion']);
        const gpu = detectGpu();
        const storage = await getStorageEstimate();
        const battery = await getBatteryInfo();
        const memoryInfo = (performance && performance.memory) ? {
          used: Number(performance.memory.usedJSHeapSize),
          limit: Number(performance.memory.jsHeapSizeLimit)
        } : null;
        const info = {
          cpuFamily: guessCpuFamily(ua),
          cpuThreads: navigator.hardwareConcurrency || null,
          architecture: entropy.architecture || guessArchitecture(ua),
          deviceMemory: navigator.deviceMemory || null,
          jsHeapLimit: memoryInfo && Number.isFinite(memoryInfo.limit) ? memoryInfo.limit : null,
          memoryUsage: memoryInfo && Number.isFinite(memoryInfo.used) && Number.isFinite(memoryInfo.limit) ? memoryInfo : null,
          storage,
          touchPoints: navigator.maxTouchPoints ?? null,
          gpu,
          battery
        };
        if (entropy && entropy.bitness){
          info.bitness = entropy.bitness;
        }
        state.hardwareInfo = info;
        updatePcInfoUI(info);
        updateMonitorCards();
        if (manual) award('pc-refresh', 2);
      } catch (err){
        pcInfoRows.motherboard.set(localText('status.failed', '取得失敗'), err && err.message ? err.message : localText('errors.hardwareFetch', '情報の取得に失敗しました'));
      }
    }

    function refreshOs(manual){
      state.osInfo = detectOs(navigator.userAgent || '', navigator.platform || '');
      updateOsUI();
      if (manual) award('os-refresh', 1);
    }

    function refreshBrowser(manual){
      state.browserInfo = detectBrowser(navigator.userAgent || '');
      updateBrowserUI();
      if (manual) award('browser-refresh', 1);
    }

    async function refreshIp(){
      if (state.abortController){
        try { state.abortController.abort(); } catch {}
      }
      const abortController = new AbortController();
      state.abortController = abortController;
      state.ipError = null;
      state.ipInfo = null;
      state.ipUpdatedAt = null;
      ipStatus.textContent = localText('status.loading', '取得中…');
      ipStatus.style.color = '#0f172a';
      fetchIpButton.disabled = true;
      cancelIpButton.style.display = 'inline-flex';
      try {
        const result = await fetchIpInformation(abortController.signal);
        state.ipInfo = result.data;
        state.ipSource = result.source;
        state.ipUpdatedAt = new Date();
        state.ipError = null;
        updateIpUI();
        award('ip-refresh', 3, { source: result.source });
      } catch (err){
        if (err?.name === 'AbortError'){
          state.ipError = localText('errors.ipCancelled', '取得を中止しました。');
        } else {
          state.ipError = err && err.message ? err.message : localText('errors.ipFetch', 'IP情報の取得に失敗しました。ファイアウォールやオフライン環境では取得できません。');
        }
        state.ipInfo = null;
        state.ipSource = null;
        state.ipUpdatedAt = null;
        updateIpUI();
      } finally {
        fetchIpButton.disabled = false;
        cancelIpButton.style.display = 'none';
        if (state.abortController === abortController){
          state.abortController = null;
        }
      }
    }

    function cancelIpFetch(){
      if (state.abortController){
        try { state.abortController.abort(); } catch {}
        state.abortController = null;
      }
    }

    function startMonitor(){
      if (state.monitor.timer) return;
      state.monitor.lastTick = performance.now();
      state.monitor.timer = setInterval(() => {
        const now = performance.now();
        const diff = now - state.monitor.lastTick;
        state.monitor.lastTick = now;
        const lag = Math.max(0, diff - state.monitor.interval);
        const usage = clamp(0, 1, lag / state.monitor.interval);
        state.monitor.loopLag = lag;
        state.monitor.cpuUsage = state.monitor.cpuUsage * 0.6 + usage * 0.4;
        if (state.hardwareInfo && performance && performance.memory){
          const used = Number(performance.memory.usedJSHeapSize);
          const limit = Number(performance.memory.jsHeapSizeLimit);
          if (Number.isFinite(used) && Number.isFinite(limit)){
            state.hardwareInfo.memoryUsage = { used, limit };
          }
        }
        updateMonitorCards();
      }, state.monitor.interval);

      let frameCount = 0;
      let lastSample = performance.now();
      const loop = (ts) => {
        frameCount += 1;
        if (ts - lastSample >= 1000){
          const fps = frameCount * 1000 / (ts - lastSample);
          state.monitor.fps = clamp(0, 240, fps);
          frameCount = 0;
          lastSample = ts;
          updateMonitorCards();
        }
        if (state.monitor.memoryUpdatePending){
          state.monitor.memoryUpdatePending = false;
          updateMonitorCards();
        }
        if (isRunning){
          state.monitor.rafId = requestAnimationFrame(loop);
        }
      };
      state.monitor.rafId = requestAnimationFrame(loop);
    }

    function stopMonitor(){
      if (state.monitor.timer){
        clearInterval(state.monitor.timer);
        state.monitor.timer = null;
      }
      if (state.monitor.rafId){
        cancelAnimationFrame(state.monitor.rafId);
        state.monitor.rafId = null;
      }
    }

    function handleCopySummary(){
      const summary = buildSummary();
      const doCopy = async () => {
        if (navigator.clipboard && navigator.clipboard.writeText){
          try {
            await navigator.clipboard.writeText(summary);
            award('copy-summary', 2);
            return true;
          } catch {}
        }
        try {
          const textarea = document.createElement('textarea');
          textarea.value = summary;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();
          const ok = document.execCommand('copy');
          document.body.removeChild(textarea);
          if (ok) award('copy-summary', 2);
          return ok;
        } catch {
          return false;
        }
      };
      doCopy();
    }

    refreshPcButton.addEventListener('click', () => {
      refreshHardware(true);
    });
    refreshOsButton.addEventListener('click', () => refreshOs(true));
    refreshBrowserButton.addEventListener('click', () => refreshBrowser(true));
    fetchIpButton.addEventListener('click', () => {
      refreshIp();
    });
    cancelIpButton.addEventListener('click', () => {
      cancelIpFetch();
      state.ipError = localText('errors.ipCancelled', '取得を中止しました。');
      state.ipInfo = null;
      state.ipSource = null;
      state.ipUpdatedAt = null;
      updateIpUI();
      fetchIpButton.disabled = false;
      cancelIpButton.style.display = 'none';
    });
    copyIpButton.addEventListener('click', () => {
      if (!state.ipInfo){
        award('copy-ip-failed', 0);
        return;
      }
      const lines = [];
      for (const key in state.ipInfo){
        if (Object.prototype.hasOwnProperty.call(state.ipInfo, key)){
          lines.push(`${key}: ${state.ipInfo[key]}`);
        }
      }
      const text = lines.join('\n');
      const doCopy = async () => {
        if (navigator.clipboard && navigator.clipboard.writeText){
          try {
            await navigator.clipboard.writeText(text);
            award('copy-ip', 2);
            return;
          } catch {}
        }
        try {
          const textarea = document.createElement('textarea');
          textarea.value = text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();
          if (document.execCommand('copy')) award('copy-ip', 2);
          document.body.removeChild(textarea);
        } catch {}
      };
      doCopy();
    });
    copyButton.addEventListener('click', handleCopySummary);

    function start(){
      if (isRunning) return;
      isRunning = true;
      selectMainTab('pc');
      selectPcSubTab('pc-info');
      refreshHardware(false);
      refreshOs(false);
      refreshBrowser(false);
      updateIpUI();
      startMonitor();
      updateMonitorCards();
    }

    function stop(){
      if (!isRunning) return;
      isRunning = false;
      stopMonitor();
      cancelIpFetch();
    }

    function destroy(){
      stop();
      if (detachLocale){
        try { detachLocale(); } catch {}
        detachLocale = null;
      }
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
    id: 'system',
    name: 'システム', nameKey: 'selection.miniexp.games.system.name',
    description: 'PCやOS、ブラウザ、IP情報を一括確認できるシステムモニターユーティリティ', descriptionKey: 'selection.miniexp.games.system.description', categoryIds: ['utility'],
    category: 'ユーティリティ',
    version: '0.1.0',
    author: 'mod',
    localizationKey: 'minigame.system',
    create
  });
})();

(function(){
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

  function createTabButton(label){
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = label;
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

  function createMetricCard(title){
    const card = document.createElement('div');
    card.style.background = 'rgba(15,23,42,0.65)';
    card.style.border = '1px solid rgba(148,163,184,0.25)';
    card.style.borderRadius = '14px';
    card.style.padding = '16px';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.gap = '6px';
    const titleEl = document.createElement('div');
    titleEl.textContent = title;
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
      setValue(value, note){
        valueEl.textContent = value ?? '-';
        noteEl.textContent = note ?? '';
      }
    };
  }

  function createSectionTitle(text){
    const heading = document.createElement('h3');
    heading.textContent = text;
    heading.style.margin = '0';
    heading.style.fontSize = '16px';
    heading.style.color = '#1f2937';
    heading.style.fontWeight = '700';
    return heading;
  }

  function create(root, awardXp){
    if (!root) throw new Error('System utility requires a container');

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
    title.textContent = 'システムユーティリティ';
    title.style.margin = '0';
    title.style.fontSize = '26px';
    title.style.color = '#0f172a';

    const subtitle = document.createElement('div');
    subtitle.textContent = 'PC / OS / ブラウザ / ネットワーク情報をまとめて確認';
    subtitle.style.fontSize = '14px';
    subtitle.style.color = '#475569';

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
    xpChip.textContent = 'セッションEXP 0';

    const copyButton = createTabButton('概要をコピー');
    copyButton.style.padding = '10px 14px';

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
      const btn = createTabButton(tab.label);
      btn.dataset.tab = tab.id;
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
      const btn = createTabButton(tab.label);
      btn.dataset.tab = tab.id;
      btn.style.fontSize = '13px';
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

    const pcInfoTitle = createSectionTitle('システム情報');
    const refreshPcButton = createTabButton('最新情報を取得');
    refreshPcButton.style.fontSize = '13px';
    refreshPcButton.style.padding = '8px 12px';

    pcInfoHeader.appendChild(pcInfoTitle);
    pcInfoHeader.appendChild(refreshPcButton);

    const pcInfoGrid = createInfoGrid();
    const pcInfoRows = {
      motherboard: appendRow(pcInfoGrid, 'マザーボード'),
      cpuFamily: appendRow(pcInfoGrid, 'CPUファミリー'),
      cpuThreads: appendRow(pcInfoGrid, 'CPUスレッド数'),
      cpuFrequency: appendRow(pcInfoGrid, 'CPU周波数'),
      architecture: appendRow(pcInfoGrid, 'アーキテクチャ'),
      memory: appendRow(pcInfoGrid, 'メモリ容量'),
      jsHeap: appendRow(pcInfoGrid, 'JSヒープ上限'),
      storage: appendRow(pcInfoGrid, 'ストレージ推定'),
      touch: appendRow(pcInfoGrid, 'タッチポイント'),
      gpuVendor: appendRow(pcInfoGrid, 'GPUベンダー'),
      gpuName: appendRow(pcInfoGrid, 'GPU名'),
      gpuMemory: appendRow(pcInfoGrid, 'GPUメモリ'),
      battery: appendRow(pcInfoGrid, 'バッテリー')
    };

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

    const monitorTitle = createSectionTitle('リアルタイムモニター');
    const monitorNote = document.createElement('div');
    monitorNote.textContent = 'ブラウザの標準APIを用いた推定値です。実際のシステム使用率とは異なる場合があります。';
    monitorNote.style.fontSize = '12px';
    monitorNote.style.color = '#64748b';

    monitorHeader.appendChild(monitorTitle);
    monitorHeader.appendChild(monitorNote);

    const monitorGrid = document.createElement('div');
    monitorGrid.style.display = 'grid';
    monitorGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
    monitorGrid.style.gap = '16px';

    const cpuCard = createMetricCard('CPU使用率 (推定)');
    const lagCard = createMetricCard('イベントループ遅延');
    const fpsCard = createMetricCard('描画更新 (FPS)');
    const memoryCard = createMetricCard('JSヒープ使用量');
    const deviceMemoryCard = createMetricCard('実メモリ (推定)');

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

    const osTitle = createSectionTitle('OS情報');
    const refreshOsButton = createTabButton('再読み込み');
    refreshOsButton.style.fontSize = '13px';
    refreshOsButton.style.padding = '8px 12px';

    osHeader.appendChild(osTitle);
    osHeader.appendChild(refreshOsButton);

    const osGrid = createInfoGrid();
    const osRows = {
      name: appendRow(osGrid, 'OS名称'),
      version: appendRow(osGrid, 'バージョン'),
      build: appendRow(osGrid, 'ビルド'),
      bitness: appendRow(osGrid, 'ビット数'),
      platform: appendRow(osGrid, 'プラットフォーム'),
      timezone: appendRow(osGrid, 'タイムゾーン'),
      locale: appendRow(osGrid, 'ロケール'),
      languages: appendRow(osGrid, '利用言語'),
      uptime: appendRow(osGrid, '起動時間 (推定)'),
      lastChecked: appendRow(osGrid, '最終更新')
    };

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

    const browserTitle = createSectionTitle('ブラウザ情報');
    const refreshBrowserButton = createTabButton('再分析');
    refreshBrowserButton.style.fontSize = '13px';
    refreshBrowserButton.style.padding = '8px 12px';

    browserHeader.appendChild(browserTitle);
    browserHeader.appendChild(refreshBrowserButton);

    const browserGrid = createInfoGrid();
    const browserRows = {
      name: appendRow(browserGrid, 'ブラウザ名'),
      version: appendRow(browserGrid, 'バージョン'),
      engine: appendRow(browserGrid, 'レンダリングエンジン'),
      agent: appendRow(browserGrid, 'ユーザーエージェント'),
      brands: appendRow(browserGrid, 'ブランド情報'),
      vendor: appendRow(browserGrid, 'ベンダー'),
      doNotTrack: appendRow(browserGrid, 'Do Not Track'),
      online: appendRow(browserGrid, 'オンライン状態'),
      cookies: appendRow(browserGrid, 'Cookie'),
      storage: appendRow(browserGrid, 'ストレージAPI'),
      features: appendRow(browserGrid, '主な技術'),
      html5: appendRow(browserGrid, 'HTML5サポート (主要API)')
    };

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

    const ipTitle = createSectionTitle('IP情報');
    const ipActionWrap = document.createElement('div');
    ipActionWrap.style.display = 'flex';
    ipActionWrap.style.gap = '8px';
    ipActionWrap.style.flexWrap = 'wrap';

    const fetchIpButton = createTabButton('IP情報を取得');
    fetchIpButton.style.fontSize = '13px';
    fetchIpButton.style.padding = '8px 12px';

    const cancelIpButton = createTabButton('取得を中止');
    cancelIpButton.style.fontSize = '13px';
    cancelIpButton.style.padding = '8px 12px';
    cancelIpButton.style.display = 'none';

    const copyIpButton = createTabButton('結果をコピー');
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
    ipStatus.textContent = 'ネットワークアクセスが必要です。取得ボタンを押してください。';

    const ipGrid = createInfoGrid();
    const ipRows = {
      ip: appendRow(ipGrid, 'IPアドレス'),
      hostname: appendRow(ipGrid, 'ホスト名'),
      city: appendRow(ipGrid, '都市'),
      region: appendRow(ipGrid, '地域'),
      country: appendRow(ipGrid, '国'),
      loc: appendRow(ipGrid, '緯度経度'),
      org: appendRow(ipGrid, '組織 / ISP'),
      postal: appendRow(ipGrid, '郵便番号'),
      timezone: appendRow(ipGrid, 'タイムゾーン'),
      asn: appendRow(ipGrid, 'ASN'),
      userAgent: appendRow(ipGrid, 'エージェント'),
      updated: appendRow(ipGrid, '最終取得')
    };

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

    function updateXpChip(){
      xpChip.textContent = `セッションEXP ${Math.round(state.sessionXp)}`;
    }

    function award(type, amount, payload){
      if (!awardXp || !amount) return 0;
      try {
        const gained = awardXp(amount, Object.assign({ type }, payload || {}));
        const num = Number(gained);
        if (Number.isFinite(num) && num !== 0){
          state.sessionXp += num;
          updateXpChip();
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
      if (!info){
        pcInfoRows.motherboard.set('取得不可', 'ブラウザからはマザーボード情報にアクセスできません。');
        pcInfoRows.cpuFamily.set('不明');
        pcInfoRows.cpuThreads.set('-');
        pcInfoRows.cpuFrequency.set('取得不可', 'CPU周波数はWeb標準APIでは公開されていません。');
        pcInfoRows.architecture.set('-');
        pcInfoRows.memory.set('-');
        pcInfoRows.jsHeap.set('-');
        pcInfoRows.storage.set('-');
        pcInfoRows.touch.set('-');
        pcInfoRows.gpuVendor.set('-');
        pcInfoRows.gpuName.set('-');
        pcInfoRows.gpuMemory.set('取得不可', 'WebGLはGPUメモリ容量を提供しません。');
        pcInfoRows.battery.set('-');
        return;
      }
      pcInfoRows.motherboard.set('取得不可', 'ブラウザからはマザーボード情報にアクセスできません。');
      pcInfoRows.cpuFamily.set(info.cpuFamily || '不明');
      pcInfoRows.cpuThreads.set(info.cpuThreads ? `${info.cpuThreads} スレッド` : '-');
      pcInfoRows.cpuFrequency.set('取得不可', 'CPU周波数はWeb標準APIでは公開されていません。');
      pcInfoRows.architecture.set(info.architecture || '-');
      pcInfoRows.memory.set(info.deviceMemory ? `${info.deviceMemory} GB (navigator.deviceMemory)` : '-');
      if (info.jsHeapLimit){
        pcInfoRows.jsHeap.set(formatBytes(info.jsHeapLimit), info.jsHeapNote || 'Chrome系ブラウザのみ提供されます。');
      } else {
        pcInfoRows.jsHeap.set('-');
      }
      if (info.storage){
        pcInfoRows.storage.set(`${formatBytes(info.storage.usage)} / ${formatBytes(info.storage.quota)}`, 'navigator.storage.estimate() による推定値');
      } else {
        pcInfoRows.storage.set('-');
      }
      pcInfoRows.touch.set(info.touchPoints != null ? `${info.touchPoints}` : '-');
      pcInfoRows.gpuVendor.set(info.gpu?.vendor || '取得不可', info.gpu ? 'WEBGL_debug_renderer_infoから取得' : 'WebGLが無効化されている可能性があります。');
      pcInfoRows.gpuName.set(info.gpu?.renderer || '-');
      pcInfoRows.gpuMemory.set('取得不可', 'ブラウザはGPUメモリの総量を公開しません。');
      if (info.battery){
        const percent = Number.isFinite(info.battery.level) ? `${PERCENT_FORMAT.format(info.battery.level * 100)}%` : '不明';
        const charging = info.battery.charging ? '充電中' : '放電中';
        pcInfoRows.battery.set(`${percent} (${charging})`);
      } else {
        pcInfoRows.battery.set('取得不可', 'Battery Status APIは利用できないか、許可されていません。');
      }
    }

    function updateMonitorCards(){
      cpuCard.setValue(formatPercent(state.monitor.cpuUsage * 100), 'イベントループ遅延から推定');
      lagCard.setValue(`${NUMBER_FORMAT.format(state.monitor.loopLag)} ms`, 'setInterval基準との差分');
      fpsCard.setValue(state.monitor.fps ? `${NUMBER_FORMAT.format(state.monitor.fps)} fps` : '-', 'requestAnimationFrameの結果');
      const memoryInfo = state.hardwareInfo?.memoryUsage;
      if (memoryInfo){
        const pct = memoryInfo.limit > 0 ? (memoryInfo.used / memoryInfo.limit) : NaN;
        const value = `${formatBytes(memoryInfo.used)} / ${formatBytes(memoryInfo.limit)}`;
        const note = Number.isFinite(pct) ? `使用率 ${formatPercent(pct * 100)}` : 'Chrome系でのみ利用可能';
        memoryCard.setValue(value, note);
      } else {
        memoryCard.setValue('-', 'performance.memory が利用できません');
      }
      if (state.hardwareInfo?.deviceMemory){
        deviceMemoryCard.setValue(`${state.hardwareInfo.deviceMemory} GB`, 'navigator.deviceMemoryによる概算');
      } else {
        deviceMemoryCard.setValue('-', '取得不可');
      }
    }

    function updateOsUI(){
      const info = state.osInfo;
      const now = new Date();
      osRows.name.set(info?.name || '不明', info?.detail || '');
      osRows.version.set(info?.version || '-');
      osRows.build.set(info?.build || '-', 'ブラウザは詳細なビルド番号を提供しません。');
      osRows.bitness.set(info?.bitness || '-');
      osRows.platform.set(navigator.platform || '-');
      const tz = (() => {
        try {
          return Intl.DateTimeFormat().resolvedOptions().timeZone || '-';
        } catch {
          return '-';
        }
      })();
      osRows.timezone.set(tz);
      osRows.locale.set(navigator.language || '-');
      osRows.languages.set(Array.isArray(navigator.languages) ? navigator.languages.join(', ') : '-');
      const uptimeSeconds = performance.now ? Math.floor(performance.now() / 1000) : null;
      osRows.uptime.set(uptimeSeconds != null ? `${NUMBER_FORMAT.format(uptimeSeconds / 3600)} 時間 (ブラウザ稼働時間)` : '-', 'OSの起動時間は取得できないためブラウザ稼働時間を表示');
      osRows.lastChecked.set(DATE_TIME_FORMAT.format(now));
    }

    function updateBrowserUI(){
      const info = state.browserInfo;
      const ua = navigator.userAgent || '-';
      const brands = navigator.userAgentData?.brands || [];
      browserRows.name.set(info?.name || '不明');
      browserRows.version.set(info?.version || '-');
      browserRows.engine.set(info?.engine || '-');
      browserRows.agent.set(ua);
      browserRows.brands.set(brands.length ? brands.map(b => `${b.brand} ${b.version}`).join(', ') : '取得不可');
      browserRows.vendor.set(info?.vendor || '-');
      browserRows.doNotTrack.set(navigator.doNotTrack === '1' ? '有効' : (navigator.doNotTrack === '0' ? '無効' : '不明'));
      browserRows.online.set(navigator.onLine ? 'オンライン' : 'オフライン');
      browserRows.cookies.set(navigator.cookieEnabled ? '利用可能' : '無効');
      const storageApis = [];
      try {
        if ('localStorage' in window) storageApis.push('localStorage');
      } catch {}
      try {
        if ('sessionStorage' in window) storageApis.push('sessionStorage');
      } catch {}
      if ('indexedDB' in window) storageApis.push('IndexedDB');
      if (navigator.storage && navigator.storage.persist) storageApis.push('StorageManager');
      browserRows.storage.set(storageApis.length ? storageApis.join(', ') : '取得不可');
      const features = [];
      if (typeof window.fetch === 'function') features.push('Fetch');
      if ('serviceWorker' in navigator) features.push('ServiceWorker');
      if ('Worker' in window) features.push('WebWorker');
      if ('WebAssembly' in window) features.push('WebAssembly');
      if ('gpu' in navigator) features.push('WebGPU');
      if ('bluetooth' in navigator) features.push('Web Bluetooth');
      if ('mediaDevices' in navigator) features.push('MediaDevices');
      browserRows.features.set(features.length ? features.join(', ') : '主要API情報なし');
      const html5 = [];
      if ('geolocation' in navigator) html5.push('Geolocation');
      if ('localStorage' in window) html5.push('Web Storage');
      if ('Notification' in window) html5.push('Notification');
      if ('RTCPeerConnection' in window) html5.push('WebRTC');
      if ('DeviceOrientationEvent' in window) html5.push('DeviceOrientation');
      try {
        if (document.createElement('canvas').getContext) html5.push('Canvas');
      } catch {}
      browserRows.html5.set(html5.length ? html5.join(', ') : '判定不可');
    }

    function updateIpUI(){
      if (state.ipError){
        ipStatus.textContent = state.ipError;
        ipStatus.style.color = '#b91c1c';
      } else if (state.ipInfo){
        const lines = [`${state.ipSource} から取得`, state.ipUpdatedAt ? DATE_TIME_FORMAT.format(state.ipUpdatedAt) : ''];
        ipStatus.textContent = lines.filter(Boolean).join(' / ');
        ipStatus.style.color = '#0f172a';
      } else {
        ipStatus.textContent = 'ネットワークアクセスが必要です。取得ボタンを押してください。';
        ipStatus.style.color = '#475569';
      }
      const data = state.ipInfo;
      ipRows.ip.set(data?.ip || data?.query || '-');
      ipRows.hostname.set(data?.hostname || data?.host || '-');
      ipRows.city.set(data?.city || '-');
      ipRows.region.set(data?.region || data?.regionName || '-');
      ipRows.country.set(data?.country || data?.countryCode || '-');
      ipRows.loc.set(data?.loc || (data?.latitude && data?.longitude ? `${data.latitude}, ${data.longitude}` : '-'));
      ipRows.org.set(data?.org || data?.asn || data?.isp || '-');
      ipRows.postal.set(data?.postal || '-');
      ipRows.timezone.set(data?.timezone || data?.time_zone || '-');
      ipRows.asn.set(data?.asn || data?.as || '-');
      ipRows.userAgent.set(data?.user_agent || data?.userAgent || '-');
      ipRows.updated.set(state.ipUpdatedAt ? DATE_TIME_FORMAT.format(state.ipUpdatedAt) : '-');
    }

    function buildSummary(){
      const lines = [];
      const now = new Date();
      lines.push(`[システム概要] ${DATE_TIME_FORMAT.format(now)}`);
      if (state.hardwareInfo){
        const h = state.hardwareInfo;
        lines.push(`CPU: ${h.cpuFamily || '不明'} / ${h.cpuThreads || '-'} threads / arch ${h.architecture || '-'}`);
        lines.push(`Memory: ${h.deviceMemory ? `${h.deviceMemory}GB` : '-'} (JS heap limit ${h.jsHeapLimit ? formatBytes(h.jsHeapLimit) : '-'})`);
        lines.push(`GPU: ${(h.gpu && h.gpu.renderer) || '-'} (vendor ${(h.gpu && h.gpu.vendor) || '-'})`);
      }
      if (state.osInfo){
        const o = state.osInfo;
        lines.push(`OS: ${o.name || '不明'} ${o.version || ''} (${o.bitness || '-'})`);
      }
      if (state.browserInfo){
        const b = state.browserInfo;
        lines.push(`Browser: ${b.name || '不明'} ${b.version || ''} (${b.engine || '-'})`);
      }
      if (state.ipInfo){
        lines.push(`IP: ${state.ipInfo.ip || state.ipInfo.query || '-'} @ ${state.ipInfo.city || '-'}, ${state.ipInfo.country || '-'}`);
      }
      return lines.join('\n');
    }

    async function refreshHardware(manual){
      pcInfoRows.motherboard.set('取得中…');
      pcInfoRows.cpuFamily.set('取得中…');
      pcInfoRows.cpuThreads.set('取得中…');
      pcInfoRows.architecture.set('取得中…');
      pcInfoRows.memory.set('取得中…');
      pcInfoRows.jsHeap.set('取得中…');
      pcInfoRows.storage.set('取得中…');
      pcInfoRows.touch.set('取得中…');
      pcInfoRows.gpuVendor.set('取得中…');
      pcInfoRows.gpuName.set('取得中…');
      pcInfoRows.battery.set('取得中…');
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
        pcInfoRows.motherboard.set('取得失敗', err && err.message ? err.message : '情報の取得に失敗しました');
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
      ipStatus.textContent = '取得中…';
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
          state.ipError = '取得を中止しました。';
        } else {
          state.ipError = err && err.message ? err.message : 'IP情報の取得に失敗しました。ファイアウォールやオフライン環境では取得できません。';
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
      state.ipError = '取得を中止しました。';
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
    name: 'システム',
    description: 'PCやOS、ブラウザ、IP情報を一括確認できるシステムモニターユーティリティ',
    category: 'ユーティリティ',
    version: '0.1.0',
    author: 'mod',
    create
  });
})();

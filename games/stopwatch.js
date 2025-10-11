(function(){
  const UPDATE_INTERVAL = 33;
  const MAX_LAPS = 60;

  const globalScope = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null);

  function getI18n(){
    if (!globalScope) return null;
    const instance = globalScope.I18n;
    return (instance && typeof instance === 'object') ? instance : null;
  }
  const I18N_PREFIX = 'games.stopwatch';

  function pad2(value){
    return value.toString().padStart(2, '0');
  }

  function timeParts(ms){
    const clamped = Math.max(0, Math.floor(ms));
    const hours = Math.floor(clamped / 3600000);
    const minutes = Math.floor((clamped % 3600000) / 60000);
    const seconds = Math.floor((clamped % 60000) / 1000);
    const centis = Math.floor((clamped % 1000) / 10);
    return { hours, minutes, seconds, centis };
  }

  function formatForDisplay(ms, { trimHours = false } = {}){
    const parts = timeParts(ms);
    const hh = parts.hours.toString();
    const mm = pad2(parts.minutes);
    const ss = pad2(parts.seconds);
    const cc = pad2(parts.centis);
    if (trimHours && parts.hours === 0){
      return `${mm}:${ss}.${cc}`;
    }
    return `${pad2(parts.hours)}:${mm}:${ss}.${cc}`;
  }

  function formatXp(value){
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }

  function formatTemplate(template, params){
    if (template === undefined || template === null) return '';
    if (!params || typeof params !== 'object') return String(template);
    return String(template).replace(/\{([^{}]+)\}/g, (match, token) => {
      const key = token.trim();
      if (!key) return match;
      const value = params[key];
      return value === undefined || value === null ? match : String(value);
    });
  }

  function translateKey(key, fallback, params){
    const i18n = getI18n();
    if (key && i18n && typeof i18n.t === 'function'){
      try {
        const value = i18n.t(key, params);
        if (typeof value === 'string' && value !== key) return value;
      } catch {}
    }
    if (fallback !== undefined) return params ? formatTemplate(fallback, params) : String(fallback);
    return params ? formatTemplate(key, params) : String(key ?? '');
  }

  function t(path, fallback, params){
    return translateKey(path ? `${I18N_PREFIX}.${path}` : I18N_PREFIX, fallback, params);
  }

  function formatNumberLocalized(value){
    const i18n = getI18n();
    if (i18n && typeof i18n.formatNumber === 'function'){
      try { return i18n.formatNumber(value); } catch {}
    }
    try {
      const locale = i18n && typeof i18n.getLocale === 'function' ? i18n.getLocale() : undefined;
      return new Intl.NumberFormat(locale).format(value);
    } catch {
      return String(value ?? '');
    }
  }

  function create(root, awardXp){
    if (!root) throw new Error('MiniExp Stopwatch requires a container');

    const state = {
      running: false,
      startAt: 0,
      baseElapsed: 0,
      laps: [],
      sessionXp: 0
    };

    let rafId = null;
    let tickerId = null;
    let isActive = false;
    const localeCleanup = [];
    let localeReadyPoller = null;
    let localeListenerBound = false;

    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.justifyContent = 'center';
    wrapper.style.background = 'radial-gradient(circle at 30% 20%, rgba(56,189,248,0.18), rgba(15,23,42,0.92))';
    wrapper.style.fontFamily = '"Segoe UI", "Hiragino Sans", sans-serif';

    const panel = document.createElement('div');
    panel.style.width = 'min(720px, 96%)';
    panel.style.maxHeight = '94%';
    panel.style.background = 'linear-gradient(160deg, rgba(15,23,42,0.92), rgba(30,41,59,0.88))';
    panel.style.borderRadius = '24px';
    panel.style.boxShadow = '0 24px 60px rgba(8,15,30,0.6)';
    panel.style.border = '1px solid rgba(148,163,184,0.18)';
    panel.style.display = 'flex';
    panel.style.flexDirection = 'column';
    panel.style.padding = '28px';
    panel.style.gap = '22px';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';

    const title = document.createElement('div');
    title.textContent = t('header.title', 'Stopwatch Pro');
    title.style.fontSize = '22px';
    title.style.fontWeight = '600';
    title.style.color = '#e2e8f0';

    const statusPill = document.createElement('span');
    statusPill.style.padding = '6px 14px';
    statusPill.style.borderRadius = '999px';
    statusPill.style.fontSize = '13px';
    statusPill.style.letterSpacing = '0.02em';
    statusPill.style.background = 'rgba(45,212,191,0.12)';
    statusPill.style.color = '#5eead4';
    statusPill.textContent = t('statusBadge.stopped', 'Stopped');

    header.appendChild(title);
    header.appendChild(statusPill);

    const display = document.createElement('div');
    display.style.display = 'flex';
    display.style.flexDirection = 'column';
    display.style.alignItems = 'center';
    display.style.gap = '10px';
    display.style.padding = '28px 24px 22px';
    display.style.borderRadius = '18px';
    display.style.background = 'linear-gradient(160deg, rgba(15,118,110,0.28), rgba(13,148,136,0.18))';
    display.style.border = '1px solid rgba(34,211,238,0.24)';

    const mainTime = document.createElement('div');
    mainTime.style.fontSize = '64px';
    mainTime.style.fontWeight = '700';
    mainTime.style.letterSpacing = '0.04em';
    mainTime.style.color = '#f8fafc';
    mainTime.textContent = '00:00:00';

    const fractionalTime = document.createElement('div');
    fractionalTime.style.fontSize = '24px';
    fractionalTime.style.color = '#a5f3fc';
    fractionalTime.textContent = '.00';

    const infoRow = document.createElement('div');
    infoRow.style.display = 'flex';
    infoRow.style.flexWrap = 'wrap';
    infoRow.style.gap = '16px';
    infoRow.style.justifyContent = 'center';
    infoRow.style.color = '#bae6fd';
    infoRow.style.fontSize = '13px';

    const lapCountEl = document.createElement('span');
    lapCountEl.textContent = t('info.lapCount', 'Lap: {count}', { count: formatNumberLocalized(0) });

    const lastLapEl = document.createElement('span');
    lastLapEl.textContent = t('info.lastLapNone', 'Last lap: -');

    const sessionXpEl = document.createElement('span');
    sessionXpEl.textContent = t('info.sessionXp', 'Session EXP: {xp}', { xp: formatXp(0) });

    infoRow.appendChild(lapCountEl);
    infoRow.appendChild(lastLapEl);
    infoRow.appendChild(sessionXpEl);

    display.appendChild(mainTime);
    display.appendChild(fractionalTime);
    display.appendChild(infoRow);

    const buttonsRow = document.createElement('div');
    buttonsRow.style.display = 'flex';
    buttonsRow.style.gap = '16px';
    buttonsRow.style.justifyContent = 'center';

    function createButton(label, variant){
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
      btn.style.minWidth = '120px';
      btn.style.padding = '14px 24px';
      btn.style.borderRadius = '12px';
      btn.style.fontSize = '15px';
      btn.style.fontWeight = '600';
      btn.style.cursor = 'pointer';
      btn.style.border = '1px solid transparent';
      btn.style.transition = 'transform 0.12s ease, box-shadow 0.12s ease, background 0.12s ease';
      btn.addEventListener('pointerenter', () => {
        btn.style.transform = 'translateY(-2px)';
        btn.style.boxShadow = '0 14px 30px rgba(8,15,30,0.35)';
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.transform = 'translateY(0)';
        btn.style.boxShadow = 'none';
      });
      if (variant === 'primary'){
        btn.style.background = 'linear-gradient(135deg, #22d3ee, #0ea5e9)';
        btn.style.color = '#0f172a';
      } else if (variant === 'accent'){
        btn.style.background = 'rgba(94,234,212,0.18)';
        btn.style.color = '#99f6e4';
        btn.style.borderColor = 'rgba(94,234,212,0.35)';
      } else {
        btn.style.background = 'rgba(148,163,184,0.12)';
        btn.style.color = '#cbd5f5';
        btn.style.borderColor = 'rgba(148,163,184,0.3)';
      }
      return btn;
    }

    const startStopBtn = createButton(t('buttons.start', 'Start'), 'primary');
    const lapBtn = createButton(t('buttons.lap', 'Lap'), 'accent');
    const resetBtn = createButton(t('buttons.reset', 'Reset'), 'ghost');

    buttonsRow.appendChild(startStopBtn);
    buttonsRow.appendChild(lapBtn);
    buttonsRow.appendChild(resetBtn);

    const lapsSection = document.createElement('div');
    lapsSection.style.display = 'flex';
    lapsSection.style.flexDirection = 'column';
    lapsSection.style.gap = '12px';
    lapsSection.style.background = 'rgba(15,23,42,0.55)';
    lapsSection.style.borderRadius = '16px';
    lapsSection.style.padding = '20px';
    lapsSection.style.border = '1px solid rgba(148,163,184,0.12)';
    lapsSection.style.flex = '1';

    const lapsHeader = document.createElement('div');
    lapsHeader.style.display = 'flex';
    lapsHeader.style.justifyContent = 'space-between';
    lapsHeader.style.alignItems = 'center';

    const lapsTitle = document.createElement('span');
    lapsTitle.textContent = t('laps.title', 'Lap history');
    lapsTitle.style.color = '#e0f2fe';
    lapsTitle.style.fontWeight = '600';

    const lapsSubtitle = document.createElement('span');
    lapsSubtitle.textContent = t('laps.subtitle', 'Most recent first');
    lapsSubtitle.style.color = 'rgba(148,163,184,0.75)';
    lapsSubtitle.style.fontSize = '12px';

    lapsHeader.appendChild(lapsTitle);
    lapsHeader.appendChild(lapsSubtitle);

    const lapsList = document.createElement('div');
    lapsList.style.display = 'flex';
    lapsList.style.flexDirection = 'column';
    lapsList.style.gap = '10px';
    lapsList.style.maxHeight = '240px';
    lapsList.style.overflowY = 'auto';
    lapsList.style.paddingRight = '4px';

    lapsSection.appendChild(lapsHeader);
    lapsSection.appendChild(lapsList);

    panel.appendChild(header);
    panel.appendChild(display);
    panel.appendChild(buttonsRow);
    panel.appendChild(lapsSection);
    wrapper.appendChild(panel);
    root.appendChild(wrapper);

    function addLocaleCleanup(handler){
      if (typeof handler === 'function') localeCleanup.push(handler);
    }

    function stopLocaleReadyPoller(){
      if (!localeReadyPoller) return;
      const clearFn = (globalScope && typeof globalScope.clearInterval === 'function')
        ? globalScope.clearInterval.bind(globalScope)
        : (typeof clearInterval === 'function' ? clearInterval : null);
      if (clearFn){
        try { clearFn(localeReadyPoller); } catch {}
      }
      localeReadyPoller = null;
    }

    function cleanupLocaleObservers(){
      while (localeCleanup.length){
        const handler = localeCleanup.pop();
        try {
          handler();
        } catch {}
      }
      localeListenerBound = false;
      stopLocaleReadyPoller();
    }

    function safeApplyLocaleStrings(){
      try {
        applyLocaleStrings();
      } catch (error){
        console.warn('[stopwatch] Failed to apply localized strings', error);
      }
    }

    function bindI18nLocaleListener(instance){
      if (!instance || localeListenerBound) return;
      if (typeof instance.onLocaleChanged !== 'function') return;
      try {
        const unsubscribe = instance.onLocaleChanged(() => safeApplyLocaleStrings());
        localeListenerBound = true;
        addLocaleCleanup(() => {
          localeListenerBound = false;
          try { unsubscribe(); } catch {}
        });
      } catch (error){
        console.warn('[stopwatch] Failed to observe locale changes', error);
      }
    }

    function trySetupI18nSync(){
      const instance = getI18n();
      if (!instance || typeof instance.t !== 'function') return false;
      bindI18nLocaleListener(instance);
      if (typeof instance.isReady === 'function' && !instance.isReady()) return false;
      safeApplyLocaleStrings();
      return true;
    }

    function ensureLocaleReadySync(){
      if (trySetupI18nSync()) return;
      if (localeReadyPoller) return;
      const intervalFactory = (globalScope && typeof globalScope.setInterval === 'function')
        ? globalScope.setInterval.bind(globalScope)
        : (typeof setInterval === 'function' ? setInterval : null);
      const clearFactory = (globalScope && typeof globalScope.clearInterval === 'function')
        ? globalScope.clearInterval.bind(globalScope)
        : (typeof clearInterval === 'function' ? clearInterval : null);
      if (!intervalFactory || !clearFactory) return;
      let attempts = 0;
      localeReadyPoller = intervalFactory(() => {
        attempts += 1;
        if (trySetupI18nSync() || attempts >= 40){
          try { clearFactory(localeReadyPoller); } catch {}
          localeReadyPoller = null;
        }
      }, 250);
      addLocaleCleanup(() => {
        if (!localeReadyPoller) return;
        try { clearFactory(localeReadyPoller); } catch {}
        localeReadyPoller = null;
      });
    }

    function grantXp(amount, detail){
      if (!(amount > 0)) return;
      state.sessionXp += amount;
      if (typeof awardXp === 'function'){
        awardXp(amount, Object.assign({ type: 'stopwatch' }, detail || {}));
      }
      updateSessionXp();
    }

    function updateSessionXp(){
      const xpValue = formatXp(state.sessionXp);
      sessionXpEl.textContent = t('info.sessionXp', 'Session EXP: {xp}', { xp: xpValue });
    }

    function currentElapsed(){
      if (!state.running) return state.baseElapsed;
      return state.baseElapsed + (performance.now() - state.startAt);
    }

    function updateDisplay(){
      const elapsed = currentElapsed();
      const parts = timeParts(elapsed);
      mainTime.textContent = `${pad2(parts.hours)}:${pad2(parts.minutes)}:${pad2(parts.seconds)}`;
      fractionalTime.textContent = `.${pad2(parts.centis)}`;
      const lapCount = formatNumberLocalized(state.laps.length);
      lapCountEl.textContent = t('info.lapCount', 'Lap: {count}', { count: lapCount });
      if (state.laps.length){
        const last = state.laps[state.laps.length - 1];
        const formatted = formatForDisplay(last.split, { trimHours: true });
        lastLapEl.textContent = t('info.lastLap', 'Last lap: {time}', { time: formatted });
      } else {
        lastLapEl.textContent = t('info.lastLapNone', 'Last lap: -');
      }
      updateSessionXp();
      updateStatusIndicator();
      updateButtons();
    }

    function updateStatusIndicator(){
      if (state.running){
        statusPill.textContent = t('statusBadge.running', 'Running');
        statusPill.style.background = 'rgba(56,189,248,0.18)';
        statusPill.style.color = '#38bdf8';
      } else {
        statusPill.textContent = t('statusBadge.stopped', 'Stopped');
        statusPill.style.background = 'rgba(94,234,212,0.12)';
        statusPill.style.color = '#5eead4';
      }
    }

    function updateButtons(){
      if (state.running){
        startStopBtn.textContent = t('buttons.pause', 'Pause');
        startStopBtn.style.background = 'linear-gradient(135deg, #f97316, #ea580c)';
        startStopBtn.style.color = '#fff7ed';
      } else {
        startStopBtn.textContent = state.baseElapsed > 0 ? t('buttons.resume', 'Resume') : t('buttons.start', 'Start');
        startStopBtn.style.background = 'linear-gradient(135deg, #22d3ee, #0ea5e9)';
        startStopBtn.style.color = '#0f172a';
      }
      lapBtn.disabled = !state.running;
      lapBtn.style.opacity = state.running ? '1' : '0.5';
      lapBtn.style.cursor = state.running ? 'pointer' : 'not-allowed';
      const canReset = state.baseElapsed > 0 || state.laps.length > 0;
      resetBtn.disabled = state.running || !canReset;
      resetBtn.style.opacity = (!state.running && canReset) ? '1' : '0.5';
      resetBtn.style.cursor = (!state.running && canReset) ? 'pointer' : 'not-allowed';
    }

    function ensureTicker(){
      if (rafId || !state.running) return;
      const tick = () => {
        updateDisplay();
        if (state.running){
          rafId = requestAnimationFrame(tick);
        } else {
          rafId = null;
        }
      };
      rafId = requestAnimationFrame(tick);
    }

    function startTickerLoop(){
      if (tickerId) return;
      tickerId = setInterval(() => {
        if (!state.running){
          updateDisplay();
        }
      }, UPDATE_INTERVAL * 4);
    }

    function stopTickerLoop(){
      if (!tickerId) return;
      clearInterval(tickerId);
      tickerId = null;
    }

    function startStopwatch(){
      if (state.running) return;
      state.running = true;
      state.startAt = performance.now();
      updateDisplay();
      grantXp(1, { action: state.baseElapsed > 0 ? 'resume' : 'start' });
      ensureTicker();
    }

    function pauseStopwatch({ silent = false } = {}){
      if (!state.running) return;
      state.baseElapsed += performance.now() - state.startAt;
      state.running = false;
      state.startAt = 0;
      if (rafId){
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      updateDisplay();
      if (!silent){
        grantXp(1, { action: 'pause', totalMs: Math.round(state.baseElapsed) });
      }
    }

    function resetStopwatch({ silent = false } = {}){
      const hadProgress = state.baseElapsed > 0 || state.laps.length > 0;
      state.baseElapsed = 0;
      state.startAt = state.running ? performance.now() : 0;
      state.laps = [];
      renderLaps();
      updateDisplay();
      if (hadProgress && !silent){
        grantXp(1, { action: 'reset' });
      }
    }

    function recordLap(){
      if (!state.running) return;
      const total = currentElapsed();
      const previousTotal = state.laps.length ? state.laps[state.laps.length - 1].total : 0;
      const split = total - previousTotal;
      const entry = {
        index: state.laps.length + 1,
        total,
        split,
        recordedAt: Date.now()
      };
      state.laps.push(entry);
      if (state.laps.length > MAX_LAPS){
        state.laps.splice(0, state.laps.length - MAX_LAPS);
      }
      renderLaps();
      updateDisplay();
      grantXp(2, { action: 'lap', lapNumber: entry.index, lapMs: Math.round(split) });
    }

    function renderLaps(){
      lapsList.innerHTML = '';
      if (!state.laps.length){
        const empty = document.createElement('div');
        empty.textContent = t('laps.empty', 'Your laps will appear here once recorded.');
        empty.style.color = 'rgba(148,163,184,0.75)';
        empty.style.textAlign = 'center';
        empty.style.padding = '32px 0';
        lapsList.appendChild(empty);
        return;
      }

      const rows = document.createElement('div');
      rows.style.display = 'flex';
      rows.style.flexDirection = 'column';
      rows.style.gap = '10px';

      const bestSplit = Math.min(...state.laps.map(l => l.split));
      const worstSplit = Math.max(...state.laps.map(l => l.split));

      const visible = [...state.laps].reverse();
      visible.forEach(lap => {
        const row = document.createElement('div');
        row.style.display = 'grid';
        row.style.gridTemplateColumns = '80px 1fr 1fr';
        row.style.alignItems = 'center';
        row.style.gap = '12px';
        row.style.padding = '12px 16px';
        row.style.borderRadius = '12px';
        row.style.background = 'linear-gradient(135deg, rgba(15,118,110,0.24), rgba(13,148,136,0.12))';
        row.style.border = '1px solid rgba(34,211,238,0.16)';

        const label = document.createElement('span');
        const labelIndex = formatNumberLocalized(lap.index);
        label.textContent = t('laps.label', 'Lap {index}', { index: labelIndex });
        label.style.color = '#99f6e4';
        label.style.fontWeight = '600';

        const splitEl = document.createElement('span');
        splitEl.textContent = formatForDisplay(lap.split, { trimHours: true });
        splitEl.style.textAlign = 'center';
        splitEl.style.color = '#e0f2fe';
        splitEl.style.fontVariantNumeric = 'tabular-nums';
        if (state.laps.length > 1){
          if (lap.split === bestSplit){
            splitEl.style.color = '#4ade80';
            splitEl.textContent += ' ★';
          } else if (lap.split === worstSplit){
            splitEl.style.color = '#f87171';
            splitEl.textContent += ' ▼';
          }
        }

        const totalEl = document.createElement('span');
        totalEl.textContent = formatForDisplay(lap.total, { trimHours: false });
        totalEl.style.textAlign = 'right';
        totalEl.style.color = '#bae6fd';
        totalEl.style.fontVariantNumeric = 'tabular-nums';

        row.appendChild(label);
        row.appendChild(splitEl);
        row.appendChild(totalEl);
        rows.appendChild(row);
      });

      lapsList.appendChild(rows);
    }

    function applyLocaleStrings(){
      title.textContent = t('header.title', 'Stopwatch Pro');
      lapBtn.textContent = t('buttons.lap', 'Lap');
      resetBtn.textContent = t('buttons.reset', 'Reset');
      lapsTitle.textContent = t('laps.title', 'Lap history');
      lapsSubtitle.textContent = t('laps.subtitle', 'Most recent first');
      updateDisplay();
      renderLaps();
    }

    startStopBtn.addEventListener('click', () => {
      if (state.running){
        pauseStopwatch();
      } else {
        startStopwatch();
      }
    });

    lapBtn.addEventListener('click', () => {
      recordLap();
    });

    resetBtn.addEventListener('click', () => {
      if (state.running) return;
      resetStopwatch();
    });

    function start(){
      if (isActive) return;
      isActive = true;
      updateDisplay();
      renderLaps();
      startTickerLoop();
    }

    function stop(){
      if (!isActive) return;
      isActive = false;
      if (state.running){
        pauseStopwatch({ silent: true });
      }
      stopTickerLoop();
    }

    function destroy(){
      stop();
      cleanupLocaleObservers();
      if (rafId){
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      root.removeChild(wrapper);
    }

    if (typeof document !== 'undefined' && typeof document.addEventListener === 'function'){
      const handleLocaleChange = () => safeApplyLocaleStrings();
      document.addEventListener('i18n:locale-changed', handleLocaleChange);
      addLocaleCleanup(() => {
        try { document.removeEventListener('i18n:locale-changed', handleLocaleChange); } catch {}
      });
    }

    applyLocaleStrings();
    ensureLocaleReadySync();
    start();

    return {
      start,
      stop,
      destroy,
      getScore(){ return state.sessionXp; }
    };
  }

  window.registerMiniGame({
    id: 'stopwatch',
    name: 'ストップウォッチ', nameKey: 'selection.miniexp.games.stopwatch.name',
    description: 'ラップ対応の高機能ストップウォッチ。操作でEXPを獲得', descriptionKey: 'selection.miniexp.games.stopwatch.description', categoryIds: ['utility'],
    category: 'ユーティリティ',
    version: '0.1.0',
    author: 'mod',
    create
  });
})();

(function(){
  const globalScope = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null);
  const i18n = globalScope && globalScope.I18n ? globalScope.I18n : null;
  const I18N_PREFIX = 'games.timer';

  function translate(path, fallback, params){
    if (path && i18n && typeof i18n.t === 'function'){
      try {
        const result = i18n.t(path, params);
        if (typeof result === 'string' && result !== path){
          return result;
        }
      } catch (error){
        console.warn('[timer] Failed to translate key', path, error);
      }
    }
    if (typeof fallback === 'function'){
      try {
        const value = fallback(params || {});
        return typeof value === 'string' ? value : (value ?? '');
      } catch (error){
        console.warn('[timer] Failed to evaluate fallback for', path, error);
        return '';
      }
    }
    return fallback ?? '';
  }

  function t(path, fallback, params){
    return translate(path ? `${I18N_PREFIX}.${path}` : null, fallback, params);
  }

  function formatNumberLocalized(value){
    if (i18n && typeof i18n.formatNumber === 'function'){
      try {
        return i18n.formatNumber(value);
      } catch (error){
        console.warn('[timer] Failed to format number via i18n:', error);
      }
    }
    try {
      const locale = i18n && typeof i18n.getLocale === 'function' ? i18n.getLocale() : undefined;
      return new Intl.NumberFormat(locale).format(value);
    } catch (error){
      console.warn('[timer] Intl.NumberFormat failed:', error);
      return String(value ?? '');
    }
  }

  function formatTimestamp(date){
    if (!(date instanceof Date)) return '';
    if (i18n && typeof i18n.formatTime === 'function'){
      try {
        return i18n.formatTime(date, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      } catch (error){
        console.warn('[timer] Failed to format time via i18n:', error);
      }
    }
    try {
      const locale = i18n && typeof i18n.getLocale === 'function' ? i18n.getLocale() : undefined;
      return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(date);
    } catch (error){
      console.warn('[timer] Intl.DateTimeFormat failed:', error);
      try {
        return date.toLocaleTimeString();
      } catch {
        return '';
      }
    }
  }

  const STORAGE_KEY = 'mini_timer_prefs_v1';
  const MAX_HOURS = 23;
  const MAX_MINUTES = 59;
  const MAX_SECONDS = 59;
  const DEFAULT_DURATION = 5 * 60 * 1000; // 5 minutes

  function clampInt(value, min, max){
    const num = Number(value);
    if (!Number.isFinite(num)) return min;
    return Math.min(max, Math.max(min, Math.floor(num)));
  }

  function sanitizePrefs(raw){
    if (!raw || typeof raw !== 'object') return null;
    const mode = raw.mode === 'stopwatch' ? 'stopwatch' : 'countdown';
    const hours = clampInt(raw.hours, 0, MAX_HOURS);
    const minutes = clampInt(raw.minutes, 0, MAX_MINUTES);
    const seconds = clampInt(raw.seconds, 0, MAX_SECONDS);
    return { mode, hours, minutes, seconds };
  }

  function loadPrefs(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return sanitizePrefs(parsed);
    } catch {
      return null;
    }
  }

  function savePrefs(prefs){
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        mode: prefs.mode,
        hours: prefs.hours,
        minutes: prefs.minutes,
        seconds: prefs.seconds
      }));
    } catch {}
  }

  function computeDurationMs(hours, minutes, seconds){
    const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
    return Math.max(0, totalSeconds * 1000);
  }

  function splitDuration(ms){
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { hours, minutes, seconds };
  }

  function formatTime(ms){
    const { hours, minutes, seconds } = splitDuration(ms);
    const h = hours.toString().padStart(2, '0');
    const m = minutes.toString().padStart(2, '0');
    const s = seconds.toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  function formatStopwatch(ms){
    const abs = Math.max(0, Math.floor(ms));
    const totalSeconds = Math.floor(abs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const hundredths = Math.floor((abs % 1000) / 10);
    const prefix = hours > 0
      ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    return { main: prefix, fraction: `.${hundredths.toString().padStart(2, '0')}` };
  }

  function create(root, awardXp){
    if (!root) throw new Error('MiniExp Timer requires a container');

    const persisted = loadPrefs();
    const initialHours = persisted?.hours ?? 0;
    const initialMinutes = persisted?.minutes ?? 5;
    const initialSeconds = persisted?.seconds ?? 0;
    let initialDuration = computeDurationMs(initialHours, initialMinutes, initialSeconds);
    if (initialDuration <= 0) initialDuration = DEFAULT_DURATION;

    const state = {
      mode: persisted?.mode || 'countdown',
      totalMs: initialDuration,
      remainingMs: initialDuration,
      running: false,
      endTime: null,
      sessionXp: 0,
      stopwatchElapsed: 0,
      stopwatchStart: 0,
      stopwatchAwardedMinutes: 0
    };

    let isRuntimeActive = false;
    let rafId = null;
    let startButtonState = 'start';
    let currentStatus = { id: 'ready', params: null };
    const inputLabelUpdaters = [];
    const quickButtonUpdaters = [];
    const modeButtonUpdaters = [];
    let detachLocale = null;

    const STATUS_CONFIG = {
      ready: { key: 'status.ready', fallback: '準備完了' },
      countdownReady: { key: 'status.countdownReady', fallback: 'カウントダウンの準備完了' },
      stopwatchReady: { key: 'status.stopwatchReady', fallback: 'ストップウォッチの準備完了' },
      countdownRunning: { key: 'status.countdownRunning', fallback: 'カウント中…' },
      resumed: { key: 'status.resumed', fallback: '再開しました' },
      paused: { key: 'status.paused', fallback: '一時停止中' },
      stopwatchRunning: { key: 'status.stopwatchRunning', fallback: '計測中…' },
      stopwatchMinuteAwarded: { key: 'status.stopwatchMinuteAwarded', fallback: params => `${params.minutes}分経過！` },
      stopwatchMinute: { key: 'status.stopwatchMinute', fallback: params => `${params.minutes}分経過` },
      completed: { key: 'status.completed', fallback: '完了！お疲れさまでした' }
    };

    const CONTROL_LABELS = {
      start: { key: 'controls.start', fallback: '開始' },
      pause: { key: 'controls.pause', fallback: '一時停止' },
      resume: { key: 'controls.resume', fallback: '再開' }
    };

    const HISTORY_LABELS = {
      complete: { key: 'history.labels.complete', fallback: '完了' },
      start: { key: 'history.labels.start', fallback: '開始' },
      stopwatch_minute: { key: 'history.labels.stopwatchMinute', fallback: '経過' },
      generic: { key: 'history.labels.generic', fallback: '達成' }
    };

    const HISTORY_FALLBACKS = {
      xpAward: params => `${params.label}: +${params.formattedXp} EXP`,
      timerComplete: () => 'タイマー完了！'
    };

    function resolveStatusText(id, params){
      const config = STATUS_CONFIG[id] || STATUS_CONFIG.ready;
      if (typeof config.fallback === 'function'){
        return t(config.key, inner => config.fallback(inner || {}), params || {});
      }
      return t(config.key, config.fallback, params);
    }

    function getHistoryLabel(type){
      const config = HISTORY_LABELS[type] || HISTORY_LABELS.generic;
      return t(config.key, config.fallback);
    }

    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.justifyContent = 'center';
    wrapper.style.background = 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(14,116,144,0.75))';
    wrapper.style.fontFamily = '"Noto Sans JP", "Hiragino Sans", sans-serif';

    const card = document.createElement('div');
    card.style.width = 'min(520px, 94%)';
    card.style.background = 'rgba(255,255,255,0.96)';
    card.style.borderRadius = '18px';
    card.style.boxShadow = '0 24px 60px rgba(15,23,42,0.25)';
    card.style.padding = '28px';
    card.style.boxSizing = 'border-box';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.gap = '20px';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.justifyContent = 'space-between';

    const titleWrap = document.createElement('div');
    titleWrap.style.display = 'flex';
    titleWrap.style.flexDirection = 'column';

    const title = document.createElement('h2');
    title.style.margin = '0';
    title.style.fontSize = '24px';
    title.style.color = '#0f172a';

    const subtitle = document.createElement('div');
    subtitle.style.fontSize = '13px';
    subtitle.style.color = '#475569';

    titleWrap.appendChild(title);
    titleWrap.appendChild(subtitle);

    const xpBadge = document.createElement('div');
    xpBadge.style.padding = '6px 12px';
    xpBadge.style.background = 'linear-gradient(135deg, #2563eb, #4f46e5)';
    xpBadge.style.color = '#fff';
    xpBadge.style.borderRadius = '999px';
    xpBadge.style.fontSize = '13px';
    xpBadge.style.fontWeight = '600';

    function updateXpBadge(){
      const xpValue = Math.max(0, Math.floor(state.sessionXp));
      const formattedXp = formatNumberLocalized(xpValue);
      xpBadge.textContent = t('xpBadge', params => `今回獲得 ${params.formattedXp} EXP`, { xp: xpValue, formattedXp });
    }

    header.appendChild(titleWrap);
    header.appendChild(xpBadge);

    const modeSwitch = document.createElement('div');
    modeSwitch.style.display = 'inline-flex';
    modeSwitch.style.background = '#e2e8f0';
    modeSwitch.style.borderRadius = '999px';
    modeSwitch.style.padding = '4px';
    modeSwitch.style.alignSelf = 'flex-start';
    modeSwitch.style.gap = '4px';

    function makeModeButton(id, key, fallback){
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.mode = id;
      btn.style.border = 'none';
      btn.style.padding = '8px 16px';
      btn.style.borderRadius = '999px';
      btn.style.cursor = 'pointer';
      btn.style.fontSize = '13px';
      btn.style.fontWeight = '600';
      btn.style.background = 'transparent';
      btn.style.color = '#475569';
      btn.addEventListener('click', () => switchMode(id));
      const updateLabel = () => {
        btn.textContent = t(key, fallback);
      };
      modeButtonUpdaters.push(updateLabel);
      updateLabel();
      return btn;
    }

    const countdownBtn = makeModeButton('countdown', 'modes.countdown', 'カウントダウン');
    const stopwatchBtn = makeModeButton('stopwatch', 'modes.stopwatch', 'ストップウォッチ');
    modeSwitch.appendChild(countdownBtn);
    modeSwitch.appendChild(stopwatchBtn);

    const displayWrap = document.createElement('div');
    displayWrap.style.display = 'flex';
    displayWrap.style.flexDirection = 'column';
    displayWrap.style.alignItems = 'center';
    displayWrap.style.gap = '8px';

    const timerDisplay = document.createElement('div');
    timerDisplay.textContent = formatTime(state.remainingMs);
    timerDisplay.style.fontSize = '52px';
    timerDisplay.style.fontWeight = '700';
    timerDisplay.style.letterSpacing = '2px';
    timerDisplay.style.color = '#1f2937';

    const timerFraction = document.createElement('div');
    timerFraction.textContent = '';
    timerFraction.style.fontSize = '20px';
    timerFraction.style.fontWeight = '600';
    timerFraction.style.color = '#64748b';
    timerFraction.style.minHeight = '24px';

    const statusLabel = document.createElement('div');
    statusLabel.style.fontSize = '13px';
    statusLabel.style.color = '#475569';

    function renderStatus(){
      statusLabel.textContent = resolveStatusText(currentStatus.id, currentStatus.params);
    }

    function setStatus(id, params){
      currentStatus = { id, params: params || null };
      renderStatus();
    }

    displayWrap.appendChild(timerDisplay);
    displayWrap.appendChild(timerFraction);
    displayWrap.appendChild(statusLabel);

    const countdownControls = document.createElement('div');
    countdownControls.style.display = 'grid';
    countdownControls.style.gridTemplateColumns = 'repeat(3, minmax(0, 1fr))';
    countdownControls.style.gap = '10px';
    countdownControls.style.width = '100%';

    function makeInput(labelKey, fallbackText, min, max, defaultValue){
      const wrap = document.createElement('label');
      wrap.style.display = 'flex';
      wrap.style.flexDirection = 'column';
      wrap.style.fontSize = '12px';
      wrap.style.color = '#475569';
      const span = document.createElement('span');
      span.style.marginBottom = '4px';
      const input = document.createElement('input');
      input.type = 'number';
      input.min = String(min);
      input.max = String(max);
      input.value = String(defaultValue);
      input.style.padding = '10px 12px';
      input.style.borderRadius = '12px';
      input.style.border = '1px solid rgba(148,163,184,0.6)';
      input.style.fontSize = '16px';
      input.style.fontWeight = '600';
      input.style.color = '#0f172a';
      input.addEventListener('input', () => handleInputChange());
      const updateLabel = () => {
        span.textContent = t(labelKey, fallbackText);
      };
      inputLabelUpdaters.push(updateLabel);
      updateLabel();
      wrap.appendChild(span);
      wrap.appendChild(input);
      return { wrap, input };
    }

    const hoursInput = makeInput('inputs.hours', '時間', 0, MAX_HOURS, initialHours);
    const minutesInput = makeInput('inputs.minutes', '分', 0, MAX_MINUTES, initialMinutes);
    const secondsInput = makeInput('inputs.seconds', '秒', 0, MAX_SECONDS, initialSeconds);

    countdownControls.appendChild(hoursInput.wrap);
    countdownControls.appendChild(minutesInput.wrap);
    countdownControls.appendChild(secondsInput.wrap);

    const quickButtons = document.createElement('div');
    quickButtons.style.display = 'flex';
    quickButtons.style.flexWrap = 'wrap';
    quickButtons.style.gap = '8px';

    function makeQuickButton(labelFn, handler){
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.style.padding = '8px 14px';
      btn.style.borderRadius = '10px';
      btn.style.border = '1px solid rgba(148,163,184,0.5)';
      btn.style.background = '#f8fafc';
      btn.style.color = '#1e293b';
      btn.style.fontSize = '13px';
      btn.style.cursor = 'pointer';
      btn.addEventListener('click', handler);
      const updateLabel = () => {
        btn.textContent = labelFn();
      };
      quickButtonUpdaters.push(updateLabel);
      updateLabel();
      return btn;
    }

    quickButtons.appendChild(makeQuickButton(
      () => t('quickButtons.addMinutes', params => `+${params.minutes}分`, { minutes: 1 }),
      () => adjustDuration(60_000)
    ));
    quickButtons.appendChild(makeQuickButton(
      () => t('quickButtons.addMinutes', params => `+${params.minutes}分`, { minutes: 5 }),
      () => adjustDuration(5 * 60_000)
    ));
    quickButtons.appendChild(makeQuickButton(
      () => t('quickButtons.addMinutes', params => `+${params.minutes}分`, { minutes: 10 }),
      () => adjustDuration(10 * 60_000)
    ));
    quickButtons.appendChild(makeQuickButton(
      () => t('quickButtons.subtractMinutes', params => `-${params.minutes}分`, { minutes: 1 }),
      () => adjustDuration(-60_000)
    ));
    quickButtons.appendChild(makeQuickButton(
      () => t('quickButtons.pomodoro', params => `${params.minutes}分ポモドーロ`, { minutes: 25 }),
      () => setDuration(25 * 60_000)
    ));

    const controls = document.createElement('div');
    controls.style.display = 'flex';
    controls.style.flexWrap = 'wrap';
    controls.style.gap = '12px';

    const startBtn = document.createElement('button');
    startBtn.type = 'button';
    startBtn.style.flex = '1 1 150px';
    startBtn.style.padding = '14px';
    startBtn.style.borderRadius = '12px';
    startBtn.style.border = 'none';
    startBtn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
    startBtn.style.color = '#fff';
    startBtn.style.fontSize = '16px';
    startBtn.style.fontWeight = '600';
    startBtn.style.cursor = 'pointer';

    function renderStartButtonLabel(){
      const config = CONTROL_LABELS[startButtonState] || CONTROL_LABELS.start;
      startBtn.textContent = t(config.key, config.fallback);
    }

    function setStartButtonState(nextState){
      startButtonState = nextState;
      renderStartButtonLabel();
    }

    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.style.flex = '1 1 120px';
    resetBtn.style.padding = '14px';
    resetBtn.style.borderRadius = '12px';
    resetBtn.style.border = '1px solid rgba(148,163,184,0.6)';
    resetBtn.style.background = '#fff';
    resetBtn.style.color = '#0f172a';
    resetBtn.style.fontSize = '15px';
    resetBtn.style.fontWeight = '600';
    resetBtn.style.cursor = 'pointer';

    const updateResetLabel = () => {
      resetBtn.textContent = t('controls.reset', 'リセット');
    };

    controls.appendChild(startBtn);
    controls.appendChild(resetBtn);

    const historyCard = document.createElement('div');
    historyCard.style.background = '#f8fafc';
    historyCard.style.borderRadius = '14px';
    historyCard.style.padding = '16px';
    historyCard.style.border = '1px solid rgba(148,163,184,0.35)';
    historyCard.style.display = 'flex';
    historyCard.style.flexDirection = 'column';
    historyCard.style.gap = '8px';

    const historyTitle = document.createElement('div');
    historyTitle.style.fontSize = '13px';
    historyTitle.style.color = '#475569';
    historyTitle.style.fontWeight = '600';

    const historyList = document.createElement('div');
    historyList.style.display = 'flex';
    historyList.style.flexDirection = 'column';
    historyList.style.gap = '6px';
    historyList.style.maxHeight = '140px';
    historyList.style.overflowY = 'auto';

    historyCard.appendChild(historyTitle);
    historyCard.appendChild(historyList);

    function applyLocale(){
      title.textContent = t('header.title', 'タイマー');
      subtitle.textContent = t('header.subtitle', '集中や休憩の時間管理に。シンプルなカウントダウンとストップウォッチ');
      modeButtonUpdaters.forEach(fn => fn());
      inputLabelUpdaters.forEach(fn => fn());
      quickButtonUpdaters.forEach(fn => fn());
      updateResetLabel();
      renderStartButtonLabel();
      updateXpBadge();
      historyTitle.textContent = t('history.title', '最近のログ');
      renderStatus();
    }

    card.appendChild(header);
    card.appendChild(modeSwitch);
    card.appendChild(displayWrap);
    card.appendChild(countdownControls);
    card.appendChild(quickButtons);
    card.appendChild(controls);
    card.appendChild(historyCard);

    wrapper.appendChild(card);
    root.appendChild(wrapper);

    function resolveHistoryText(key, params, fallbackOverride){
      const fallback = fallbackOverride || HISTORY_FALLBACKS[key] || (() => '');
      if (typeof fallback === 'function'){
        return t(`history.${key}`, inner => fallback(inner || {}), params || {});
      }
      return t(`history.${key}`, fallback, params);
    }

    function logHistory(key, params, fallbackOverride){
      const text = resolveHistoryText(key, params, fallbackOverride);
      if (!text) return;
      const timestamp = formatTimestamp(new Date());
      const item = document.createElement('div');
      item.textContent = timestamp ? `${timestamp} ${text}` : text;
      item.style.fontSize = '12px';
      item.style.color = '#1f2937';
      historyList.prepend(item);
      while (historyList.childElementCount > 8){
        historyList.removeChild(historyList.lastChild);
      }
    }

    function award(type, amount){
      if (!awardXp || !Number.isFinite(amount) || amount <= 0) return 0;
      try {
        const gained = Number(awardXp(amount, { type, mode: state.mode }));
        if (Number.isFinite(gained) && gained !== 0){
          state.sessionXp += gained;
          updateXpBadge();
          const label = getHistoryLabel(type);
          const xpValue = Math.max(0, Math.floor(gained));
          logHistory('xpAward', { label, xp: xpValue, formattedXp: formatNumberLocalized(xpValue) });
        }
        return gained;
      } catch {
        return 0;
      }
    }

    function updateInputsFromState(){
      const { hours, minutes, seconds } = splitDuration(state.totalMs);
      hoursInput.input.value = String(Math.min(hours, MAX_HOURS));
      minutesInput.input.value = String(Math.min(minutes, MAX_MINUTES));
      secondsInput.input.value = String(Math.min(seconds, MAX_SECONDS));
    }

    function persist(){
      savePrefs({
        mode: state.mode,
        hours: clampInt(hoursInput.input.value, 0, MAX_HOURS),
        minutes: clampInt(minutesInput.input.value, 0, MAX_MINUTES),
        seconds: clampInt(secondsInput.input.value, 0, MAX_SECONDS)
      });
    }

    function handleInputChange(){
      if (state.running) return;
      const hours = clampInt(hoursInput.input.value, 0, MAX_HOURS);
      const minutes = clampInt(minutesInput.input.value, 0, MAX_MINUTES);
      const seconds = clampInt(secondsInput.input.value, 0, MAX_SECONDS);
      const ms = computeDurationMs(hours, minutes, seconds);
      setDuration(ms);
    }

    function setDuration(ms){
      if (state.mode !== 'countdown') return;
      if (state.running) return;
      const next = Number.isFinite(ms) ? Math.max(0, Math.floor(ms)) : 0;
      state.totalMs = next || DEFAULT_DURATION;
      state.remainingMs = state.totalMs;
      updateInputsFromState();
      updateDisplay();
      persist();
    }

    function adjustDuration(deltaMs){
      if (state.mode !== 'countdown') return;
      if (state.running) return;
      const current = computeDurationMs(
        clampInt(hoursInput.input.value, 0, MAX_HOURS),
        clampInt(minutesInput.input.value, 0, MAX_MINUTES),
        clampInt(secondsInput.input.value, 0, MAX_SECONDS)
      );
      setDuration(current + deltaMs);
    }

    function toggleInputs(disabled){
      [hoursInput.input, minutesInput.input, secondsInput.input].forEach(input => {
        input.disabled = disabled;
        input.style.opacity = disabled ? '0.65' : '1';
      });
    }

    function updateModeButtons(){
      [countdownBtn, stopwatchBtn].forEach(btn => {
        const active = btn.dataset.mode === state.mode;
        btn.style.background = active ? '#fff' : 'transparent';
        btn.style.color = active ? '#0f172a' : '#475569';
        btn.style.boxShadow = active ? '0 4px 16px rgba(15,23,42,0.12)' : 'none';
      });
      countdownControls.style.display = state.mode === 'countdown' ? 'grid' : 'none';
      quickButtons.style.display = state.mode === 'countdown' ? 'flex' : 'none';
      timerFraction.style.display = state.mode === 'stopwatch' ? 'block' : 'none';
    }

    function updateDisplay(){
      if (state.mode === 'countdown'){
        timerDisplay.textContent = formatTime(state.remainingMs);
        timerFraction.textContent = '';
      } else {
        const { main, fraction } = formatStopwatch(state.stopwatchElapsed + (state.running ? Date.now() - state.stopwatchStart : 0));
        timerDisplay.textContent = main;
        timerFraction.textContent = fraction;
      }
    }

    function switchMode(mode){
      if (mode === state.mode) return;
      pauseTimer();
      state.mode = mode === 'stopwatch' ? 'stopwatch' : 'countdown';
      if (state.mode === 'countdown'){
        state.remainingMs = state.totalMs;
        setStatus('countdownReady');
      } else {
        state.stopwatchElapsed = 0;
        state.stopwatchAwardedMinutes = 0;
        setStatus('stopwatchReady');
      }
      setStartButtonState('start');
      updateModeButtons();
      updateDisplay();
      persist();
    }

    function finishCountdown(){
      state.running = false;
      state.remainingMs = 0;
      setStatus('completed');
      setStartButtonState('start');
      toggleInputs(false);
      updateDisplay();
      const minutes = Math.max(1, Math.round(state.totalMs / 60000));
      const gained = award('complete', Math.min(60, minutes * 4));
      if (!gained) logHistory('timerComplete');
    }

    function handleCountdownTick(){
      if (!state.running) return;
      const now = Date.now();
      state.remainingMs = Math.max(0, state.endTime - now);
      if (state.remainingMs <= 0){
        finishCountdown();
        return;
      }
      updateDisplay();
    }

    function handleStopwatchTick(){
      if (!state.running) return;
      const now = Date.now();
      const elapsed = state.stopwatchElapsed + (now - state.stopwatchStart);
      const minutes = Math.floor(elapsed / 60000);
      if (minutes > state.stopwatchAwardedMinutes){
        const diff = minutes - state.stopwatchAwardedMinutes;
        const gained = award('stopwatch_minute', diff * 2);
        setStatus(gained ? 'stopwatchMinuteAwarded' : 'stopwatchMinute', { minutes });
        state.stopwatchAwardedMinutes = minutes;
      }
      updateDisplay();
    }

    function tick(){
      rafId = null;
      if (!isRuntimeActive || !state.running) return;
      if (state.mode === 'countdown') handleCountdownTick();
      else handleStopwatchTick();
      requestNextTick();
    }

    function requestNextTick(){
      if (rafId || !isRuntimeActive || !state.running) return;
      rafId = requestAnimationFrame(tick);
    }

    function startCountdown(){
      if (state.running) return;
      const current = computeDurationMs(
        clampInt(hoursInput.input.value, 0, MAX_HOURS),
        clampInt(minutesInput.input.value, 0, MAX_MINUTES),
        clampInt(secondsInput.input.value, 0, MAX_SECONDS)
      );
      state.totalMs = current > 0 ? current : DEFAULT_DURATION;
      state.remainingMs = state.totalMs;
      state.endTime = Date.now() + state.remainingMs;
      state.running = true;
      setStartButtonState('pause');
      setStatus('countdownRunning');
      toggleInputs(true);
      updateDisplay();
      award('start', 3);
      requestNextTick();
    }

    function resumeCountdown(){
      if (state.running) return;
      if (state.remainingMs <= 0){
        state.remainingMs = state.totalMs;
      }
      state.endTime = Date.now() + state.remainingMs;
      state.running = true;
      setStartButtonState('pause');
      setStatus('resumed');
      toggleInputs(true);
      requestNextTick();
    }

    function pauseCountdown(){
      if (!state.running) return;
      state.remainingMs = Math.max(0, state.endTime - Date.now());
      state.running = false;
      setStartButtonState('resume');
      setStatus('paused');
      toggleInputs(false);
      updateDisplay();
    }

    function resetCountdown(){
      state.running = false;
      state.remainingMs = state.totalMs;
      setStartButtonState('start');
      setStatus('countdownReady');
      toggleInputs(false);
      updateDisplay();
    }

    function startStopwatch(){
      if (state.running) return;
      const fresh = state.stopwatchElapsed === 0;
      state.stopwatchStart = Date.now();
      state.running = true;
      setStartButtonState('pause');
      setStatus('stopwatchRunning');
      if (fresh) award('start', 2);
      requestNextTick();
    }

    function pauseStopwatch(){
      if (!state.running) return;
      state.stopwatchElapsed += Date.now() - state.stopwatchStart;
      state.running = false;
      setStartButtonState('resume');
      setStatus('paused');
      updateDisplay();
    }

    function resetStopwatch(){
      state.running = false;
      state.stopwatchElapsed = 0;
      state.stopwatchAwardedMinutes = 0;
      setStartButtonState('start');
      setStatus('stopwatchReady');
      updateDisplay();
    }

    function pauseTimer(){
      if (!state.running) return;
      if (state.mode === 'countdown') pauseCountdown();
      else pauseStopwatch();
    }

    function handleStartClick(){
      if (state.mode === 'countdown'){
        if (!state.running){
          if (state.remainingMs === state.totalMs) startCountdown();
          else resumeCountdown();
        } else {
          pauseCountdown();
        }
      } else {
        if (!state.running) startStopwatch(); else pauseStopwatch();
      }
    }

    function handleReset(){
      pauseTimer();
      if (state.mode === 'countdown') resetCountdown();
      else resetStopwatch();
    }

    startBtn.addEventListener('click', handleStartClick);
    resetBtn.addEventListener('click', handleReset);

    const listeners = [];

    function handleVisibility(){
      if (document.visibilityState === 'visible'){
        updateDisplay();
      }
    }

    listeners.push({ target: document, type: 'visibilitychange', handler: handleVisibility });

    function startRuntime(){
      if (isRuntimeActive) return;
      isRuntimeActive = true;
      listeners.forEach(l => l.target.addEventListener(l.type, l.handler, l.capture || false));
      updateModeButtons();
      updateDisplay();
      if (state.running) requestNextTick();
    }

    function stopRuntime(){
      if (!isRuntimeActive) return;
      isRuntimeActive = false;
      listeners.forEach(l => l.target.removeEventListener(l.type, l.handler, l.capture || false));
      pauseTimer();
      if (rafId){
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    function destroyRuntime(){
      stopRuntime();
      startBtn.removeEventListener('click', handleStartClick);
      resetBtn.removeEventListener('click', handleReset);
      if (typeof detachLocale === 'function'){
        try {
          detachLocale();
        } catch (error){
          console.warn('[timer] Failed to detach locale listener:', error);
        }
        detachLocale = null;
      }
      try { root.removeChild(wrapper); } catch {}
      persist();
    }

    updateModeButtons();
    updateInputsFromState();
    setStatus(state.mode === 'stopwatch' ? 'stopwatchReady' : 'countdownReady');
    updateDisplay();
    applyLocale();

    if (i18n && typeof i18n.onLocaleChanged === 'function'){
      try {
        detachLocale = i18n.onLocaleChanged(() => applyLocale());
      } catch (error){
        console.warn('[timer] Failed to register locale listener:', error);
      }
    }

    const runtime = {
      start: startRuntime,
      stop: stopRuntime,
      destroy: destroyRuntime,
      getScore(){ return state.sessionXp; }
    };

    startRuntime();
    return runtime;
  }

  window.registerMiniGame({
    id: 'timer',
    name: 'タイマー', nameKey: 'selection.miniexp.games.timer.name',
    description: 'シンプルなカウントダウンとストップウォッチで時間管理', descriptionKey: 'selection.miniexp.games.timer.description', categoryIds: ['utility'],
    category: 'ユーティリティ',
    version: '0.1.0',
    author: 'mod',
    create
  });
})();

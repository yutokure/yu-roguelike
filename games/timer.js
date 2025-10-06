(function(){
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
    title.textContent = 'タイマー';
    title.style.margin = '0';
    title.style.fontSize = '24px';
    title.style.color = '#0f172a';

    const subtitle = document.createElement('div');
    subtitle.textContent = '集中や休憩の時間管理に。シンプルなカウントダウンとストップウォッチ';
    subtitle.style.fontSize = '13px';
    subtitle.style.color = '#475569';

    titleWrap.appendChild(title);
    titleWrap.appendChild(subtitle);

    const xpBadge = document.createElement('div');
    xpBadge.textContent = '今回獲得 0 EXP';
    xpBadge.style.padding = '6px 12px';
    xpBadge.style.background = 'linear-gradient(135deg, #2563eb, #4f46e5)';
    xpBadge.style.color = '#fff';
    xpBadge.style.borderRadius = '999px';
    xpBadge.style.fontSize = '13px';
    xpBadge.style.fontWeight = '600';

    header.appendChild(titleWrap);
    header.appendChild(xpBadge);

    const modeSwitch = document.createElement('div');
    modeSwitch.style.display = 'inline-flex';
    modeSwitch.style.background = '#e2e8f0';
    modeSwitch.style.borderRadius = '999px';
    modeSwitch.style.padding = '4px';
    modeSwitch.style.alignSelf = 'flex-start';
    modeSwitch.style.gap = '4px';

    function makeModeButton(id, label){
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
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
      return btn;
    }

    const countdownBtn = makeModeButton('countdown', 'カウントダウン');
    const stopwatchBtn = makeModeButton('stopwatch', 'ストップウォッチ');
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
    statusLabel.textContent = '準備完了';
    statusLabel.style.fontSize = '13px';
    statusLabel.style.color = '#475569';

    displayWrap.appendChild(timerDisplay);
    displayWrap.appendChild(timerFraction);
    displayWrap.appendChild(statusLabel);

    const countdownControls = document.createElement('div');
    countdownControls.style.display = 'grid';
    countdownControls.style.gridTemplateColumns = 'repeat(3, minmax(0, 1fr))';
    countdownControls.style.gap = '10px';
    countdownControls.style.width = '100%';

    function makeInput(labelText, min, max, defaultValue){
      const wrap = document.createElement('label');
      wrap.style.display = 'flex';
      wrap.style.flexDirection = 'column';
      wrap.style.fontSize = '12px';
      wrap.style.color = '#475569';
      const span = document.createElement('span');
      span.textContent = labelText;
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
      wrap.appendChild(span);
      wrap.appendChild(input);
      return { wrap, input };
    }

    const hoursInput = makeInput('時間', 0, MAX_HOURS, initialHours);
    const minutesInput = makeInput('分', 0, MAX_MINUTES, initialMinutes);
    const secondsInput = makeInput('秒', 0, MAX_SECONDS, initialSeconds);

    countdownControls.appendChild(hoursInput.wrap);
    countdownControls.appendChild(minutesInput.wrap);
    countdownControls.appendChild(secondsInput.wrap);

    const quickButtons = document.createElement('div');
    quickButtons.style.display = 'flex';
    quickButtons.style.flexWrap = 'wrap';
    quickButtons.style.gap = '8px';

    function makeQuickButton(label, handler){
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
      btn.style.padding = '8px 14px';
      btn.style.borderRadius = '10px';
      btn.style.border = '1px solid rgba(148,163,184,0.5)';
      btn.style.background = '#f8fafc';
      btn.style.color = '#1e293b';
      btn.style.fontSize = '13px';
      btn.style.cursor = 'pointer';
      btn.addEventListener('click', handler);
      return btn;
    }

    quickButtons.appendChild(makeQuickButton('+1分', () => adjustDuration(60_000)));
    quickButtons.appendChild(makeQuickButton('+5分', () => adjustDuration(5 * 60_000)));
    quickButtons.appendChild(makeQuickButton('+10分', () => adjustDuration(10 * 60_000)));
    quickButtons.appendChild(makeQuickButton('-1分', () => adjustDuration(-60_000)));
    quickButtons.appendChild(makeQuickButton('25分ポモドーロ', () => setDuration(25 * 60_000)));

    const controls = document.createElement('div');
    controls.style.display = 'flex';
    controls.style.flexWrap = 'wrap';
    controls.style.gap = '12px';

    const startBtn = document.createElement('button');
    startBtn.type = 'button';
    startBtn.textContent = '開始';
    startBtn.style.flex = '1 1 150px';
    startBtn.style.padding = '14px';
    startBtn.style.borderRadius = '12px';
    startBtn.style.border = 'none';
    startBtn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
    startBtn.style.color = '#fff';
    startBtn.style.fontSize = '16px';
    startBtn.style.fontWeight = '600';
    startBtn.style.cursor = 'pointer';

    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.textContent = 'リセット';
    resetBtn.style.flex = '1 1 120px';
    resetBtn.style.padding = '14px';
    resetBtn.style.borderRadius = '12px';
    resetBtn.style.border = '1px solid rgba(148,163,184,0.6)';
    resetBtn.style.background = '#fff';
    resetBtn.style.color = '#0f172a';
    resetBtn.style.fontSize = '15px';
    resetBtn.style.fontWeight = '600';
    resetBtn.style.cursor = 'pointer';

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
    historyTitle.textContent = '最近のログ';
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

    card.appendChild(header);
    card.appendChild(modeSwitch);
    card.appendChild(displayWrap);
    card.appendChild(countdownControls);
    card.appendChild(quickButtons);
    card.appendChild(controls);
    card.appendChild(historyCard);

    wrapper.appendChild(card);
    root.appendChild(wrapper);

    function award(type, amount){
      if (!awardXp || !Number.isFinite(amount) || amount <= 0) return 0;
      try {
        const gained = Number(awardXp(amount, { type, mode: state.mode }));
        if (Number.isFinite(gained) && gained !== 0){
          state.sessionXp += gained;
          xpBadge.textContent = `今回獲得 ${Math.floor(state.sessionXp)} EXP`;
          const label = type === 'complete' ? '完了' : type === 'start' ? '開始' : type === 'stopwatch_minute' ? '経過' : '達成';
          logEvent(`${label}: +${Math.floor(gained)} EXP`);
        }
        return gained;
      } catch {
        return 0;
      }
    }

    function logEvent(text){
      const item = document.createElement('div');
      item.textContent = `${new Date().toLocaleTimeString()} ${text}`;
      item.style.fontSize = '12px';
      item.style.color = '#1f2937';
      historyList.prepend(item);
      while (historyList.childElementCount > 8){
        historyList.removeChild(historyList.lastChild);
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
        statusLabel.textContent = 'カウントダウンの準備完了';
      } else {
        state.stopwatchElapsed = 0;
        state.stopwatchAwardedMinutes = 0;
        statusLabel.textContent = 'ストップウォッチの準備完了';
      }
      updateModeButtons();
      updateDisplay();
      persist();
    }

    function finishCountdown(){
      state.running = false;
      state.remainingMs = 0;
      statusLabel.textContent = '完了！お疲れさまでした';
      startBtn.textContent = '開始';
      toggleInputs(false);
      updateDisplay();
      const minutes = Math.max(1, Math.round(state.totalMs / 60000));
      const gained = award('complete', Math.min(60, minutes * 4));
      if (!gained) logEvent('タイマー完了！');
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
        if (gained) statusLabel.textContent = `${minutes}分経過！`; else statusLabel.textContent = `${minutes}分経過`; 
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
      startBtn.textContent = '一時停止';
      statusLabel.textContent = 'カウント中…';
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
      startBtn.textContent = '一時停止';
      statusLabel.textContent = '再開しました';
      toggleInputs(true);
      requestNextTick();
    }

    function pauseCountdown(){
      if (!state.running) return;
      state.remainingMs = Math.max(0, state.endTime - Date.now());
      state.running = false;
      startBtn.textContent = '再開';
      statusLabel.textContent = '一時停止中';
      toggleInputs(false);
      updateDisplay();
    }

    function resetCountdown(){
      state.running = false;
      state.remainingMs = state.totalMs;
      startBtn.textContent = '開始';
      statusLabel.textContent = 'カウントダウンの準備完了';
      toggleInputs(false);
      updateDisplay();
    }

    function startStopwatch(){
      if (state.running) return;
      const fresh = state.stopwatchElapsed === 0;
      state.stopwatchStart = Date.now();
      state.running = true;
      startBtn.textContent = '一時停止';
      statusLabel.textContent = '計測中…';
      if (fresh) award('start', 2);
      requestNextTick();
    }

    function pauseStopwatch(){
      if (!state.running) return;
      state.stopwatchElapsed += Date.now() - state.stopwatchStart;
      state.running = false;
      startBtn.textContent = '再開';
      statusLabel.textContent = '一時停止中';
      updateDisplay();
    }

    function resetStopwatch(){
      state.running = false;
      state.stopwatchElapsed = 0;
      state.stopwatchAwardedMinutes = 0;
      startBtn.textContent = '開始';
      statusLabel.textContent = 'ストップウォッチの準備完了';
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
      try { root.removeChild(wrapper); } catch {}
      persist();
    }

    updateModeButtons();
    updateInputsFromState();
    statusLabel.textContent = state.mode === 'stopwatch'
      ? 'ストップウォッチの準備完了'
      : 'カウントダウンの準備完了';
    updateDisplay();

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

(function(){
  const STORAGE_KEY = 'mini_pomodoro_timer_state_v1';
  const HISTORY_LIMIT = 60;
  const FOCUS_MIN_RANGE = [5, 180];
  const SHORT_BREAK_RANGE = [1, 60];
  const LONG_BREAK_RANGE = [5, 180];
  const CYCLE_RANGE = [2, 8];
  const DEFAULT_CONFIG = {
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    cyclesBeforeLong: 4,
    autoStartBreaks: true,
    autoStartFocus: false
  };

  function clamp(value, min, max){
    const num = Number(value);
    if (!Number.isFinite(num)) return min;
    return Math.min(max, Math.max(min, Math.round(num)));
  }

  function sanitizeConfig(raw){
    const cfg = raw && typeof raw === 'object' ? raw : {};
    return {
      focusMinutes: clamp(cfg.focusMinutes ?? cfg.focus ?? DEFAULT_CONFIG.focusMinutes, FOCUS_MIN_RANGE[0], FOCUS_MIN_RANGE[1]),
      shortBreakMinutes: clamp(cfg.shortBreakMinutes ?? cfg.shortBreak ?? DEFAULT_CONFIG.shortBreakMinutes, SHORT_BREAK_RANGE[0], SHORT_BREAK_RANGE[1]),
      longBreakMinutes: clamp(cfg.longBreakMinutes ?? cfg.longBreak ?? DEFAULT_CONFIG.longBreakMinutes, LONG_BREAK_RANGE[0], LONG_BREAK_RANGE[1]),
      cyclesBeforeLong: clamp(cfg.cyclesBeforeLong ?? cfg.cycles ?? DEFAULT_CONFIG.cyclesBeforeLong, CYCLE_RANGE[0], CYCLE_RANGE[1]),
      autoStartBreaks: cfg.autoStartBreaks !== undefined ? !!cfg.autoStartBreaks : DEFAULT_CONFIG.autoStartBreaks,
      autoStartFocus: cfg.autoStartFocus !== undefined ? !!cfg.autoStartFocus : DEFAULT_CONFIG.autoStartFocus
    };
  }

  function sanitizeDaily(raw){
    const out = {};
    if (!raw || typeof raw !== 'object') return out;
    Object.keys(raw).forEach(key => {
      const value = raw[key];
      if (!value || typeof value !== 'object') return;
      const focus = Number.isFinite(value.focus) ? Math.max(0, Math.floor(value.focus)) : 0;
      const shortBreak = Number.isFinite(value.shortBreak) ? Math.max(0, Math.floor(value.shortBreak)) : 0;
      const longBreak = Number.isFinite(value.longBreak) ? Math.max(0, Math.floor(value.longBreak)) : 0;
      const xp = Number.isFinite(value.xp) ? Math.max(0, Math.floor(value.xp)) : 0;
      out[key] = { focus, shortBreak, longBreak, xp };
    });
    return out;
  }

  function sanitizeTotals(raw){
    const obj = raw && typeof raw === 'object' ? raw : {};
    const toInt = (v) => Number.isFinite(v) ? Math.max(0, Math.floor(v)) : 0;
    return {
      focus: toInt(obj.focus),
      shortBreak: toInt(obj.shortBreak),
      longBreak: toInt(obj.longBreak),
      xp: toInt(obj.xp),
      longestStreak: toInt(obj.longestStreak),
      currentStreak: toInt(obj.currentStreak),
      focusInCycle: toInt(obj.focusInCycle)
    };
  }

  function loadPersistentState(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { config: { ...DEFAULT_CONFIG }, totals: sanitizeTotals(null), daily: {} };
      const parsed = JSON.parse(raw);
      const config = sanitizeConfig(parsed.config);
      const totals = sanitizeTotals(parsed.totals);
      const daily = sanitizeDaily(parsed.daily);
      return { config, totals, daily };
    } catch {
      return { config: { ...DEFAULT_CONFIG }, totals: sanitizeTotals(null), daily: {} };
    }
  }

  function writePersistentState(payload){
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {}
  }

  function getTodayKey(){
    try {
      return new Date().toISOString().slice(0, 10);
    } catch {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
  }

  function formatTime(totalSeconds){
    if (!Number.isFinite(totalSeconds)) return '00:00';
    const s = Math.max(0, Math.floor(totalSeconds));
    const minutes = Math.floor(s / 60);
    const seconds = s % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function createSectionTitle(text){
    const el = document.createElement('h3');
    el.textContent = text;
    el.style.margin = '0 0 8px';
    el.style.fontSize = '16px';
    el.style.color = '#0f172a';
    return el;
  }

  function createStatChip(label, value){
    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.flexDirection = 'column';
    wrap.style.padding = '12px';
    wrap.style.borderRadius = '12px';
    wrap.style.background = 'rgba(15,118,110,0.08)';
    wrap.style.border = '1px solid rgba(13,148,136,0.2)';
    wrap.style.minWidth = '120px';

    const labelEl = document.createElement('span');
    labelEl.textContent = label;
    labelEl.style.fontSize = '12px';
    labelEl.style.letterSpacing = '0.04em';
    labelEl.style.textTransform = 'uppercase';
    labelEl.style.color = '#0f766e';

    const valueEl = document.createElement('span');
    valueEl.textContent = value;
    valueEl.style.fontSize = '20px';
    valueEl.style.fontWeight = '600';
    valueEl.style.color = '#0f172a';

    wrap.appendChild(labelEl);
    wrap.appendChild(valueEl);
    return { wrap, valueEl };
  }

  function createNumberInput(labelText, min, max, value){
    const wrap = document.createElement('label');
    wrap.style.display = 'flex';
    wrap.style.flexDirection = 'column';
    wrap.style.gap = '6px';
    wrap.style.fontSize = '13px';
    wrap.style.color = '#1f2937';

    const span = document.createElement('span');
    span.textContent = labelText;

    const input = document.createElement('input');
    input.type = 'number';
    input.min = String(min);
    input.max = String(max);
    input.value = String(value);
    input.step = '1';
    input.style.padding = '10px 12px';
    input.style.borderRadius = '10px';
    input.style.border = '1px solid #cbd5f5';
    input.style.fontSize = '14px';
    input.style.width = '100%';

    wrap.appendChild(span);
    wrap.appendChild(input);
    return { wrap, input };
  }

  function createToggle(labelText, checked){
    const wrap = document.createElement('label');
    wrap.style.display = 'flex';
    wrap.style.alignItems = 'center';
    wrap.style.gap = '10px';
    wrap.style.fontSize = '13px';
    wrap.style.color = '#1f2937';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = !!checked;

    const span = document.createElement('span');
    span.textContent = labelText;

    wrap.appendChild(input);
    wrap.appendChild(span);
    return { wrap, input };
  }

  function createButton(label, variant){
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = label;
    btn.style.padding = '12px 18px';
    btn.style.borderRadius = '999px';
    btn.style.fontSize = '15px';
    btn.style.fontWeight = '600';
    btn.style.cursor = 'pointer';
    btn.style.transition = 'transform 0.12s ease, box-shadow 0.12s ease';
    btn.style.border = 'none';
    btn.style.outline = 'none';

    if (variant === 'primary'){
      btn.style.background = 'linear-gradient(135deg,#0ea5e9,#2563eb)';
      btn.style.color = '#f8fafc';
      btn.style.boxShadow = '0 14px 30px rgba(37,99,235,0.35)';
    } else if (variant === 'outline'){
      btn.style.background = 'transparent';
      btn.style.color = '#1d4ed8';
      btn.style.border = '1px solid rgba(37,99,235,0.3)';
      btn.style.boxShadow = '0 8px 18px rgba(37,99,235,0.15)';
    } else {
      btn.style.background = 'rgba(148,163,184,0.16)';
      btn.style.color = '#0f172a';
      btn.style.boxShadow = '0 8px 18px rgba(30,41,59,0.12)';
    }

    btn.addEventListener('pointerenter', () => {
      btn.style.transform = 'translateY(-2px)';
    });
    btn.addEventListener('pointerleave', () => {
      btn.style.transform = 'translateY(0)';
    });
    return btn;
  }

  function createHistoryRow(dateLabel, stats){
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.justifyContent = 'space-between';
    row.style.gap = '12px';
    row.style.padding = '8px 0';
    row.style.fontSize = '13px';
    row.style.color = '#1f2937';
    row.style.borderBottom = '1px solid rgba(148,163,184,0.2)';

    const left = document.createElement('div');
    left.textContent = dateLabel;

    const right = document.createElement('div');
    right.textContent = `集中 ${stats.focus} / 休憩 ${stats.shortBreak + stats.longBreak} / +${stats.xp}XP`;
    right.style.whiteSpace = 'nowrap';

    row.appendChild(left);
    row.appendChild(right);
    return row;
  }

  function create(root, awardXp){
    if (!root) throw new Error('Pomodoro mini-game requires a container');

    const persisted = loadPersistentState();
    const state = {
      config: persisted.config,
      totals: persisted.totals,
      daily: persisted.daily,
      sessionXp: 0
    };

    if (!state.daily[getTodayKey()]){
      state.daily[getTodayKey()] = { focus: 0, shortBreak: 0, longBreak: 0, xp: 0 };
    }

    const runtimeState = {
      phase: 'focus',
      remainingSec: state.config.focusMinutes * 60,
      running: false,
      timerId: null,
      activated: false
    };

    function persist(){
      writePersistentState({
        config: state.config,
        totals: state.totals,
        daily: state.daily
      });
    }

    function grantXp(amount, meta, badgeText, badgeOpts){
      if (!awardXp || !amount) return 0;
      try {
        const gained = awardXp(amount, meta || {});
        const num = Number(gained);
        if (Number.isFinite(num)) {
          state.sessionXp += num;
          state.totals.xp = (state.totals.xp || 0) + Math.max(0, Math.floor(num));
          const today = state.daily[getTodayKey()] || (state.daily[getTodayKey()] = { focus: 0, shortBreak: 0, longBreak: 0, xp: 0 });
          today.xp += Math.max(0, Math.floor(num));
        }
        if (badgeText && window && window.showMiniExpBadge){
          try { window.showMiniExpBadge(`${badgeText} +${Math.floor(amount)}XP`, badgeOpts); } catch {}
        }
        return gained;
      } catch {
        return 0;
      } finally {
        persist();
        updateStats();
      }
    }

    function phaseName(type){
      if (type === 'short_break') return '小休憩';
      if (type === 'long_break') return '長休憩';
      return '集中';
    }

    function nextPhaseAfterFocus(advance = true){
      const current = state.totals.focusInCycle || 0;
      const target = state.config.cyclesBeforeLong;
      const nextCount = current + 1;
      const shouldLong = nextCount >= target;
      if (advance){
        state.totals.focusInCycle = shouldLong ? 0 : nextCount;
      }
      return shouldLong ? 'long_break' : 'short_break';
    }

    function getPhaseDurationMinutes(type){
      if (type === 'short_break') return state.config.shortBreakMinutes;
      if (type === 'long_break') return state.config.longBreakMinutes;
      return state.config.focusMinutes;
    }

    function resetPhase(type, preserveRunning){
      runtimeState.phase = type || 'focus';
      runtimeState.remainingSec = getPhaseDurationMinutes(runtimeState.phase) * 60;
      updateTimerDisplay();
      updateControls();
      updateStats();
      updateUpcoming();
      if (!preserveRunning){
        stopTimer();
      }
    }

    function startTimer(){
      if (runtimeState.running) return;
      runtimeState.running = true;
      updateControls();
      runtimeState.timerId = setInterval(() => {
        runtimeState.remainingSec -= 1;
        if (runtimeState.remainingSec <= 0){
          runtimeState.remainingSec = 0;
          updateTimerDisplay();
          completePhase();
          return;
        }
        updateTimerDisplay();
      }, 1000);
    }

    function stopTimer(){
      runtimeState.running = false;
      if (runtimeState.timerId){
        clearInterval(runtimeState.timerId);
        runtimeState.timerId = null;
      }
      updateControls();
    }

    function completePhase(skipped){
      stopTimer();
      const current = runtimeState.phase;
      const today = state.daily[getTodayKey()] || (state.daily[getTodayKey()] = { focus: 0, shortBreak: 0, longBreak: 0, xp: 0 });
      let nextPhase = 'focus';

      if (current === 'focus'){
        if (!skipped){
          state.totals.focus = (state.totals.focus || 0) + 1;
          today.focus += 1;
          state.totals.currentStreak = (state.totals.currentStreak || 0) + 1;
          if (!state.totals.longestStreak || state.totals.currentStreak > state.totals.longestStreak){
            state.totals.longestStreak = state.totals.currentStreak;
          }
          const streakBonus = Math.min(40, Math.max(0, (state.totals.currentStreak - 1) * 5));
          const amount = 50 + streakBonus;
          grantXp(amount, { type: 'focus_complete', streak: state.totals.currentStreak, total: state.totals.focus }, '集中セッション達成', { variant: 'combo', level: Math.min(5, state.totals.currentStreak) });
          nextPhase = nextPhaseAfterFocus(true);
        } else {
          state.totals.currentStreak = 0;
          const preview = nextPhaseAfterFocus(false);
          if (preview === 'long_break') state.totals.focusInCycle = 0;
          nextPhase = preview;
        }
      } else {
        state.totals.currentStreak = 0;
        if (!skipped){
          if (current === 'short_break'){
            state.totals.shortBreak = (state.totals.shortBreak || 0) + 1;
            today.shortBreak += 1;
            grantXp(12, { type: 'short_break_complete', total: state.totals.shortBreak }, 'ショートブレイク完了', { variant: 'info' });
          } else if (current === 'long_break'){
            state.totals.longBreak = (state.totals.longBreak || 0) + 1;
            today.longBreak += 1;
            grantXp(25, { type: 'long_break_complete', total: state.totals.longBreak }, 'ロングブレイク完了', { variant: 'info' });
          }
        }
        nextPhase = 'focus';
      }

      const autoStart = nextPhase === 'focus' ? state.config.autoStartFocus : state.config.autoStartBreaks;
      runtimeState.phase = nextPhase;
      runtimeState.remainingSec = getPhaseDurationMinutes(nextPhase) * 60;
      persist();
      updateStats();
      renderHistory();
      updateTimerDisplay();
      updateUpcoming();
      updateControls();
      if (autoStart && !skipped){
        startTimer();
      }
    }

    function skipPhase(){
      completePhase(true);
    }

    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.boxSizing = 'border-box';
    wrapper.style.padding = '24px';
    wrapper.style.background = 'linear-gradient(135deg, #ecfeff, #f8fafc)';
    wrapper.style.fontFamily = '"Noto Sans JP", "Hiragino Sans", sans-serif';
    wrapper.style.overflow = 'auto';

    const layout = document.createElement('div');
    layout.style.maxWidth = '840px';
    layout.style.margin = '0 auto';
    layout.style.display = 'grid';
    layout.style.gridTemplateColumns = 'minmax(0, 1fr)';
    layout.style.gap = '20px';

    const timerCard = document.createElement('section');
    timerCard.style.background = '#ffffff';
    timerCard.style.borderRadius = '24px';
    timerCard.style.padding = '28px';
    timerCard.style.boxShadow = '0 18px 40px rgba(148,163,184,0.25)';
    timerCard.style.display = 'flex';
    timerCard.style.flexDirection = 'column';
    timerCard.style.gap = '20px';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.flexWrap = 'wrap';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.gap = '12px';

    const titleWrap = document.createElement('div');
    const title = document.createElement('h2');
    title.textContent = 'ポモドーロタイマー';
    title.style.margin = '0';
    title.style.fontSize = '24px';
    title.style.color = '#0f172a';

    const subtitle = document.createElement('div');
    subtitle.textContent = '集中と休憩をリズム良く切り替え、完了ごとにEXPを獲得します。';
    subtitle.style.fontSize = '14px';
    subtitle.style.color = '#475569';

    titleWrap.appendChild(title);
    titleWrap.appendChild(subtitle);

    const phaseBadge = document.createElement('span');
    phaseBadge.style.padding = '8px 14px';
    phaseBadge.style.borderRadius = '999px';
    phaseBadge.style.background = 'rgba(56,189,248,0.15)';
    phaseBadge.style.color = '#0369a1';
    phaseBadge.style.fontWeight = '600';
    phaseBadge.style.fontSize = '13px';

    header.appendChild(titleWrap);
    header.appendChild(phaseBadge);

    const timerDisplay = document.createElement('div');
    timerDisplay.style.fontSize = '64px';
    timerDisplay.style.fontWeight = '700';
    timerDisplay.style.color = '#0f172a';
    timerDisplay.style.letterSpacing = '0.06em';
    timerDisplay.style.textAlign = 'center';

    const progressWrap = document.createElement('div');
    progressWrap.style.height = '12px';
    progressWrap.style.borderRadius = '999px';
    progressWrap.style.background = 'rgba(226,232,240,0.7)';
    progressWrap.style.overflow = 'hidden';

    const progressInner = document.createElement('div');
    progressInner.style.height = '100%';
    progressInner.style.width = '0%';
    progressInner.style.background = 'linear-gradient(135deg,#0ea5e9,#22d3ee)';
    progressInner.style.transition = 'width 0.4s ease';

    progressWrap.appendChild(progressInner);

    const infoRow = document.createElement('div');
    infoRow.style.display = 'flex';
    infoRow.style.justifyContent = 'space-between';
    infoRow.style.alignItems = 'center';
    infoRow.style.flexWrap = 'wrap';
    infoRow.style.gap = '12px';

    const cycleInfo = document.createElement('div');
    cycleInfo.style.fontSize = '13px';
    cycleInfo.style.color = '#475569';

    const upcomingInfo = document.createElement('div');
    upcomingInfo.style.fontSize = '13px';
    upcomingInfo.style.color = '#1d4ed8';
    upcomingInfo.style.fontWeight = '600';

    infoRow.appendChild(cycleInfo);
    infoRow.appendChild(upcomingInfo);

    const controlRow = document.createElement('div');
    controlRow.style.display = 'flex';
    controlRow.style.flexWrap = 'wrap';
    controlRow.style.gap = '12px';
    controlRow.style.justifyContent = 'center';

    const startBtn = createButton('▶ 開始', 'primary');
    const skipBtn = createButton('⏭ 次へ', 'outline');
    const resetBtn = createButton('↺ リセット', 'ghost');

    controlRow.appendChild(startBtn);
    controlRow.appendChild(skipBtn);
    controlRow.appendChild(resetBtn);

    timerCard.appendChild(header);
    timerCard.appendChild(timerDisplay);
    timerCard.appendChild(progressWrap);
    timerCard.appendChild(infoRow);
    timerCard.appendChild(controlRow);

    const statsCard = document.createElement('section');
    statsCard.style.background = '#ffffff';
    statsCard.style.borderRadius = '24px';
    statsCard.style.padding = '24px';
    statsCard.style.boxShadow = '0 12px 28px rgba(148,163,184,0.2)';
    statsCard.style.display = 'flex';
    statsCard.style.flexDirection = 'column';
    statsCard.style.gap = '16px';

    const statsTitle = createSectionTitle('進捗サマリー');
    statsCard.appendChild(statsTitle);

    const statsGrid = document.createElement('div');
    statsGrid.style.display = 'grid';
    statsGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(150px, 1fr))';
    statsGrid.style.gap = '12px';

    const focusChip = createStatChip('集中セッション', '0');
    const breakChip = createStatChip('休憩回数', '0');
    const streakChip = createStatChip('連続集中', '0');
    const xpChip = createStatChip('累計EXP', '0');

    statsGrid.appendChild(focusChip.wrap);
    statsGrid.appendChild(breakChip.wrap);
    statsGrid.appendChild(streakChip.wrap);
    statsGrid.appendChild(xpChip.wrap);

    const todaySummary = document.createElement('div');
    todaySummary.style.fontSize = '13px';
    todaySummary.style.color = '#475569';

    statsCard.appendChild(statsGrid);
    statsCard.appendChild(todaySummary);

    const historyCard = document.createElement('section');
    historyCard.style.background = '#ffffff';
    historyCard.style.borderRadius = '24px';
    historyCard.style.padding = '24px';
    historyCard.style.boxShadow = '0 12px 28px rgba(148,163,184,0.2)';
    historyCard.style.display = 'flex';
    historyCard.style.flexDirection = 'column';
    historyCard.style.gap = '12px';

    const historyTitle = createSectionTitle('直近の履歴');
    const historyList = document.createElement('div');

    historyCard.appendChild(historyTitle);
    historyCard.appendChild(historyList);

    const settingsCard = document.createElement('section');
    settingsCard.style.background = '#ffffff';
    settingsCard.style.borderRadius = '24px';
    settingsCard.style.padding = '24px';
    settingsCard.style.boxShadow = '0 12px 28px rgba(148,163,184,0.18)';
    settingsCard.style.display = 'flex';
    settingsCard.style.flexDirection = 'column';
    settingsCard.style.gap = '16px';

    const settingsTitle = createSectionTitle('タイマー設定');
    const settingsForm = document.createElement('div');
    settingsForm.style.display = 'grid';
    settingsForm.style.gridTemplateColumns = 'repeat(auto-fit, minmax(180px, 1fr))';
    settingsForm.style.gap = '14px';

    const focusInput = createNumberInput('集中 (分)', FOCUS_MIN_RANGE[0], FOCUS_MIN_RANGE[1], state.config.focusMinutes);
    const shortInput = createNumberInput('小休憩 (分)', SHORT_BREAK_RANGE[0], SHORT_BREAK_RANGE[1], state.config.shortBreakMinutes);
    const longInput = createNumberInput('長休憩 (分)', LONG_BREAK_RANGE[0], LONG_BREAK_RANGE[1], state.config.longBreakMinutes);
    const cycleInput = createNumberInput('長休憩までの集中回数', CYCLE_RANGE[0], CYCLE_RANGE[1], state.config.cyclesBeforeLong);

    settingsForm.appendChild(focusInput.wrap);
    settingsForm.appendChild(shortInput.wrap);
    settingsForm.appendChild(longInput.wrap);
    settingsForm.appendChild(cycleInput.wrap);

    const toggles = document.createElement('div');
    toggles.style.display = 'flex';
    toggles.style.flexDirection = 'column';
    toggles.style.gap = '10px';

    const autoBreakToggle = createToggle('集中完了後に自動で休憩を開始', state.config.autoStartBreaks);
    const autoFocusToggle = createToggle('休憩完了後に自動で集中を開始', state.config.autoStartFocus);

    toggles.appendChild(autoBreakToggle.wrap);
    toggles.appendChild(autoFocusToggle.wrap);

    const applyBtn = createButton('設定を保存', 'primary');
    applyBtn.style.alignSelf = 'flex-start';

    settingsCard.appendChild(settingsTitle);
    settingsCard.appendChild(settingsForm);
    settingsCard.appendChild(toggles);
    settingsCard.appendChild(applyBtn);

    layout.appendChild(timerCard);
    layout.appendChild(statsCard);
    layout.appendChild(historyCard);
    layout.appendChild(settingsCard);

    wrapper.appendChild(layout);
    root.appendChild(wrapper);

    function updateTimerDisplay(){
      timerDisplay.textContent = formatTime(runtimeState.remainingSec);
      const total = getPhaseDurationMinutes(runtimeState.phase) * 60;
      const progress = total > 0 ? Math.min(100, Math.max(0, 100 - (runtimeState.remainingSec / total) * 100)) : 0;
      progressInner.style.width = `${progress.toFixed(1)}%`;
      phaseBadge.textContent = `${phaseName(runtimeState.phase)}モード`;
      if (runtimeState.phase === 'focus'){
        phaseBadge.style.background = 'rgba(56,189,248,0.15)';
        phaseBadge.style.color = '#0369a1';
        progressInner.style.background = 'linear-gradient(135deg,#0ea5e9,#22d3ee)';
      } else {
        phaseBadge.style.background = 'rgba(16,185,129,0.18)';
        phaseBadge.style.color = '#047857';
        progressInner.style.background = 'linear-gradient(135deg,#34d399,#10b981)';
      }
    }

    function updateControls(){
      startBtn.textContent = runtimeState.running ? '⏸ 一時停止' : '▶ 開始';
      startBtn.setAttribute('aria-pressed', runtimeState.running ? 'true' : 'false');
      skipBtn.disabled = runtimeState.running && runtimeState.phase === 'focus' && runtimeState.remainingSec < (getPhaseDurationMinutes('focus') * 60 * 0.2);
    }

    function updateStats(){
      focusChip.valueEl.textContent = `${state.totals.focus || 0} 回`;
      const totalBreaks = (state.totals.shortBreak || 0) + (state.totals.longBreak || 0);
      breakChip.valueEl.textContent = `${totalBreaks} 回`;
      streakChip.valueEl.textContent = `${state.totals.currentStreak || 0} 回`;
      xpChip.valueEl.textContent = `${state.totals.xp || 0} XP`;
      const today = state.daily[getTodayKey()] || { focus: 0, shortBreak: 0, longBreak: 0, xp: 0 };
      todaySummary.textContent = `今日: 集中 ${today.focus} 回 / 休憩 ${today.shortBreak + today.longBreak} 回 / 獲得EXP +${today.xp}`;
      const completed = state.totals.focusInCycle || 0;
      let remaining = state.config.cyclesBeforeLong - completed;
      if (remaining <= 0) remaining = state.config.cyclesBeforeLong;
      if (runtimeState.phase === 'focus'){
        const preview = nextPhaseAfterFocus(false);
        if (preview === 'long_break'){
          cycleInfo.textContent = 'この集中で長休憩に入ります';
        } else {
          cycleInfo.textContent = `長休憩まであと ${remaining} セッション`;
        }
      } else if (runtimeState.phase === 'long_break'){
        cycleInfo.textContent = '長休憩中：しっかりリフレッシュしましょう';
      } else {
        cycleInfo.textContent = `長休憩まであと ${remaining} セッション`;
      }
    }

    function updateUpcoming(){
      if (runtimeState.phase === 'focus'){
        const next = nextPhaseAfterFocus(false);
        const label = phaseName(next);
        const minutes = getPhaseDurationMinutes(next);
        upcomingInfo.textContent = `次は ${label} (${minutes}分)`;
      } else {
        upcomingInfo.textContent = `次は 集中 (${state.config.focusMinutes}分)`;
      }
    }

    function renderHistory(){
      historyList.innerHTML = '';
      const entries = Object.entries(state.daily)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .slice(0, HISTORY_LIMIT);
      if (!entries.length){
        const empty = document.createElement('div');
        empty.textContent = '記録はまだありません。';
        empty.style.fontSize = '13px';
        empty.style.color = '#94a3b8';
        historyList.appendChild(empty);
        return;
      }
      entries.slice(0, 7).forEach(([date, stats]) => {
        historyList.appendChild(createHistoryRow(date, stats));
      });
    }

    function applySettings(){
      const newConfig = sanitizeConfig({
        focusMinutes: focusInput.input.value,
        shortBreakMinutes: shortInput.input.value,
        longBreakMinutes: longInput.input.value,
        cyclesBeforeLong: cycleInput.input.value,
        autoStartBreaks: autoBreakToggle.input.checked,
        autoStartFocus: autoFocusToggle.input.checked
      });
      state.config = newConfig;
      persist();
      updateStats();
      updateUpcoming();
      if (!runtimeState.running){
        runtimeState.remainingSec = getPhaseDurationMinutes(runtimeState.phase) * 60;
        updateTimerDisplay();
      }
      if (window && window.showMiniExpBadge){
        try { window.showMiniExpBadge('設定を保存しました', { variant: 'info' }); } catch {}
      }
    }

    startBtn.addEventListener('click', () => {
      if (runtimeState.running){
        stopTimer();
      } else {
        startTimer();
      }
    });

    skipBtn.addEventListener('click', () => {
      skipPhase();
    });

    resetBtn.addEventListener('click', () => {
      state.totals.currentStreak = runtimeState.phase === 'focus' ? 0 : state.totals.currentStreak;
      resetPhase(runtimeState.phase, false);
    });

    applyBtn.addEventListener('click', () => {
      applySettings();
    });

    function start(){
      if (runtimeState.activated) return;
      runtimeState.activated = true;
      updateTimerDisplay();
      updateControls();
      updateStats();
      updateUpcoming();
      renderHistory();
    }

    function stop(){
      stopTimer();
    }

    function destroy(){
      stopTimer();
      try { root.removeChild(wrapper); } catch {}
    }

    start();

    return {
      start,
      stop,
      destroy,
      getScore(){ return state.sessionXp; }
    };
  }

  window.registerMiniGame({
    id: 'pomodoro',
    name: 'ポモドーロタイマー', nameKey: 'selection.miniexp.games.pomodoro.name',
    description: '25分集中＋休憩サイクルを管理し、完了ごとにEXPを獲得できるユーティリティ', descriptionKey: 'selection.miniexp.games.pomodoro.description', categoryIds: ['utility'],
    category: 'ユーティリティ',
    version: '0.1.0',
    author: 'mod',
    create
  });
})();

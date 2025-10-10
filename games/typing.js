(function(){
  const GAME_ID = 'typing';
  const DISPLAY_NAME = 'タイピングチャレンジ';
  const DEFAULT_TIME_LIMIT = 60;
  const XP_PER_CHAR = 0.2;
  const COMBO_MILESTONES = [
    { count: 10, bonus: 3 },
    { count: 25, bonus: 8 },
    { count: 50, bonus: 20 }
  ];
  const ACCURACY_BONUSES = [
    { threshold: 0.98, bonus: 60 },
    { threshold: 0.95, bonus: 30 }
  ];
  const DIFFICULTY_OPTIONS = {
    EASY: {
      label: 'EASY',
      wordPool: [
        'apple', 'storm', 'river', 'forest', 'light', 'bloom', 'water', 'stone', 'dream', 'green',
        'flame', 'magic', 'cloud', 'swift', 'grain', 'smile', 'music', 'shine', 'spark', 'quiet',
        'peace', 'happy', 'brave', 'honor', 'fresh', 'clear', 'pride', 'focus', 'guard', 'trail',
        'dance', 'clean', 'candy', 'grape', 'sweet', 'lemon', 'polar', 'rainy', 'sunny', 'sugar'
      ],
      fontFamily: '"Noto Sans JP", "Hiragino Sans", sans-serif'
    },
    NORMAL: {
      label: 'NORMAL',
      wordPool: [
        'silver-line', 'future-proof', "night's tale", 'focus-group', 'paper-plane', 'castle-town',
        'winter-sky', 'city-light', 'whispering', 'pixel-art', 'open-source', 'hidden-path',
        'memory-lane', 'midnight', 'timber-wolf', 'urban-mood', 'echo-chamber', 'soft-touch',
        'lively-song', 'cosmic-ray', 'deep-breath', 'sugar-rush', 'dream-chase', 'letter-box',
        'mirror-ball', 'secret-key', 'lucky-charm', 'gentle-wave', 'bright-side', 'silent-mode'
      ],
      fontFamily: '"Noto Sans JP", "Hiragino Sans", sans-serif'
    },
    HARD: {
      label: 'HARD',
      wordPool: [
        'hyperThread', 'snake_case_demo', 'QuantumLeap', 'async-await-now', 'vectorMatrix4',
        'camelTrailMix', 'fluxCapacitor', 'zeroGravityRun', 'refactor_me_now', 'signalBoost64',
        'microTaskQueue', 'constellationX', 'neonCircuit77', 'precisionStrike', 'MemoryGuardian',
        'just_do_print', 'iterateFast', 'MonochromeNight', 'dataDrivenFlow', 'rapid-fire_typing',
        'QuantumCipher', 'renderLoopFrame', 'pixelForgeLab', 'GalacticBeacon', 'syntax::highlight'
      ],
      fontFamily: '"Roboto Mono", "Fira Mono", monospace'
    }
  };
  const TARGET_WPM_RANGE = { min: 40, max: 120 };
  const STYLE_ELEMENT_ID = 'typing_challenge_style';

  function getI18n(){
    return typeof window !== 'undefined' ? window.I18n : null;
  }

  function translate(key, fallback, params){
    const i18n = getI18n();
    const computeFallback = () => {
      if (typeof fallback === 'function'){
        try {
          const value = fallback();
          return typeof value === 'string' ? value : (value ?? '');
        } catch (error) {
          console.warn('[typing] Failed to compute fallback for', key, error);
          return '';
        }
      }
      return fallback ?? '';
    };
    if (!key || !i18n || typeof i18n.t !== 'function'){
      return computeFallback();
    }
    try {
      const translated = i18n.t(key, params);
      if (typeof translated === 'string' && translated !== key){
        return translated;
      }
    } catch (error) {
      console.warn('[typing] Failed to translate key', key, error);
    }
    return computeFallback();
  }

  function formatNumber(value, digits = 1){
    if (!Number.isFinite(value)) return '0';
    const i18n = getI18n();
    if (i18n && typeof i18n.formatNumber === 'function'){
      try {
        return i18n.formatNumber(value, {
          minimumFractionDigits: digits,
          maximumFractionDigits: digits
        });
      } catch (error) {
        console.warn('[typing] Failed to format number', value, error);
      }
    }
    return value.toFixed(digits);
  }

  const STYLE_CONTENT = `
    .typing-game-wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at 20% 20%, rgba(14,165,233,0.22), rgba(15,23,42,0.94));
      font-family: "Noto Sans JP", "Hiragino Sans", sans-serif;
      color: #f8fafc;
      box-sizing: border-box;
      padding: clamp(16px, 4vw, 40px);
    }
    .typing-panel {
      position: relative;
      width: min(960px, 98%);
      max-height: 98%;
      background: linear-gradient(160deg, rgba(15,23,42,0.95), rgba(30,41,59,0.88));
      border-radius: 28px;
      box-shadow: 0 28px 60px rgba(8,15,30,0.55);
      border: 1px solid rgba(148,163,184,0.22);
      display: flex;
      flex-direction: column;
      padding: clamp(20px, 4vw, 32px);
      gap: clamp(16px, 3vw, 26px);
    }
    .typing-header {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      justify-content: space-between;
      align-items: center;
    }
    .typing-header .title {
      font-size: clamp(20px, 4vw, 28px);
      font-weight: 700;
      letter-spacing: 0.04em;
      margin: 0;
    }
    .typing-controls {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
      background: rgba(15,118,110,0.15);
      padding: 10px 16px;
      border-radius: 999px;
      border: 1px solid rgba(94,234,212,0.28);
      font-size: 13px;
      color: #99f6e4;
    }
    .typing-controls label {
      display: flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
    }
    .typing-controls select,
    .typing-controls input[type="range"] {
      background: rgba(14,116,144,0.45);
      color: #f8fafc;
      border: 1px solid rgba(14,165,233,0.45);
      border-radius: 8px;
      padding: 6px 10px;
      font-size: 13px;
      appearance: none;
    }
    .typing-controls input[type="range"] {
      padding: 0;
      width: 140px;
      height: 6px;
    }
    .typing-timer {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .typing-timer .time-value {
      font-size: clamp(26px, 6vw, 38px);
      font-weight: 700;
      letter-spacing: 0.08em;
    }
    .typing-progress {
      position: relative;
      width: 100%;
      height: 12px;
      background: rgba(30,58,138,0.35);
      border-radius: 999px;
      overflow: hidden;
    }
    .typing-progress .fill {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 100%;
      background: linear-gradient(90deg, #38bdf8, #22d3ee);
      transition: width 0.1s ease;
    }
    .typing-progress.hurry .fill {
      background: linear-gradient(90deg, #f97316, #ef4444);
    }
    .typing-words {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: clamp(16px, 3vw, 24px);
      border-radius: 18px;
      background: rgba(15,118,110,0.18);
      border: 1px solid rgba(34,211,238,0.24);
    }
    .typing-current {
      font-size: clamp(28px, 6vw, 40px);
      font-weight: 600;
      letter-spacing: 0.06em;
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      align-items: center;
    }
    .typing-current.mono {
      font-family: "Roboto Mono", "Fira Mono", monospace;
      letter-spacing: 0.02em;
    }
    .typing-next {
      font-size: clamp(16px, 4vw, 20px);
      color: rgba(226,232,240,0.75);
    }
    .typing-char {
      padding: 4px 2px;
      border-bottom: 2px solid transparent;
      transition: color 0.12s ease, background 0.12s ease, border-color 0.12s ease;
    }
    .typing-char.pending { color: #cbd5f5; }
    .typing-char.correct {
      color: #4ade80;
      border-color: rgba(74,222,128,0.7);
    }
    .typing-char.next {
      color: #f8fafc;
      border-color: rgba(14,165,233,0.75);
    }
    .typing-word-error {
      animation: typing-error 0.28s ease;
    }
    @keyframes typing-error {
      0% { transform: translateX(0); }
      25% { transform: translateX(-4px); }
      50% { transform: translateX(4px); }
      75% { transform: translateX(-2px); }
      100% { transform: translateX(0); }
    }
    .typing-input-row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      align-items: center;
    }
    .typing-input-row input[type="text"] {
      flex: 1;
      min-width: 160px;
      padding: 14px 16px;
      font-size: clamp(16px, 4vw, 20px);
      border-radius: 14px;
      border: 1px solid rgba(148,163,184,0.35);
      background: rgba(15,23,42,0.6);
      color: #f8fafc;
      outline: none;
      transition: border-color 0.12s ease, box-shadow 0.12s ease;
    }
    .typing-input-row input[type="text"]:focus {
      border-color: rgba(59,130,246,0.65);
      box-shadow: 0 0 0 3px rgba(59,130,246,0.25);
    }
    .typing-input-row button {
      padding: 12px 20px;
      border-radius: 12px;
      border: 1px solid rgba(94,234,212,0.35);
      background: rgba(14,116,144,0.32);
      color: #a5f3fc;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.12s ease, box-shadow 0.12s ease;
    }
    .typing-input-row button:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 20px rgba(14,116,144,0.35);
    }
    .typing-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
    }
    .typing-stat-card {
      background: rgba(15,23,42,0.55);
      border: 1px solid rgba(148,163,184,0.22);
      border-radius: 16px;
      padding: 14px 18px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .typing-stat-card .label {
      font-size: 12px;
      letter-spacing: 0.08em;
      color: rgba(226,232,240,0.65);
      text-transform: uppercase;
    }
    .typing-stat-card .value {
      font-size: clamp(18px, 4vw, 24px);
      font-weight: 600;
      letter-spacing: 0.04em;
    }
    .typing-toast {
      min-height: 24px;
      font-size: 15px;
      color: #facc15;
      text-align: center;
    }
    .typing-result-overlay {
      position: absolute;
      inset: 0;
      display: none;
      align-items: center;
      justify-content: center;
      background: rgba(8,15,30,0.82);
      backdrop-filter: blur(6px);
      border-radius: inherit;
    }
    .typing-result-overlay.active {
      display: flex;
    }
    .typing-result-card {
      width: min(520px, 90%);
      background: linear-gradient(160deg, rgba(15,23,42,0.92), rgba(30,64,175,0.38));
      border-radius: 24px;
      border: 1px solid rgba(148,163,184,0.28);
      box-shadow: 0 24px 48px rgba(8,15,30,0.65);
      padding: 26px 28px;
      display: flex;
      flex-direction: column;
      gap: 18px;
      color: #f8fafc;
    }
    .typing-result-card h3 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 0.06em;
    }
    .typing-result-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }
    .typing-result-grid .item {
      background: rgba(15,23,42,0.55);
      border: 1px solid rgba(148,163,184,0.2);
      border-radius: 14px;
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .typing-result-grid .item .label {
      font-size: 12px;
      color: rgba(226,232,240,0.66);
      letter-spacing: 0.06em;
    }
    .typing-result-grid .item .value {
      font-size: 20px;
      font-weight: 600;
    }
    .typing-result-xp {
      background: rgba(14,116,144,0.22);
      border-radius: 16px;
      padding: 14px 16px;
      border: 1px solid rgba(34,211,238,0.3);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .typing-result-xp ul {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 14px;
    }
    .typing-result-card button {
      align-self: flex-end;
      padding: 10px 18px;
      border-radius: 999px;
      border: 1px solid rgba(59,130,246,0.45);
      background: rgba(59,130,246,0.22);
      color: #bfdbfe;
      cursor: pointer;
      font-weight: 600;
    }
  `;

  function ensureStyles(){
    if (document.getElementById(STYLE_ELEMENT_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ELEMENT_ID;
    style.textContent = STYLE_CONTENT;
    document.head.appendChild(style);
  }

  function shuffle(array){
    const result = array.slice();
    for (let i = result.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function pad(value){
    return value.toString().padStart(2, '0');
  }

  function clampTargetWpm(value){
    const num = Number(value);
    if (!Number.isFinite(num)) return 60;
    if (num < TARGET_WPM_RANGE.min) return TARGET_WPM_RANGE.min;
    if (num > TARGET_WPM_RANGE.max) return TARGET_WPM_RANGE.max;
    return Math.round(num);
  }

  function pickDifficulty(name){
    const key = typeof name === 'string' ? name.toUpperCase() : 'NORMAL';
    if (DIFFICULTY_OPTIONS[key]) return key;
    return 'NORMAL';
  }

  function create(root, awardXp, opts){
    if (!root) throw new Error('MiniExp Typing requires a container');
    ensureStyles();

    const shortcutController = opts?.shortcuts;
    if (shortcutController){
      if (typeof shortcutController.disableKey === 'function'){
        shortcutController.disableKey('r');
        shortcutController.disableKey('p');
      } else if (typeof shortcutController.setKeyEnabled === 'function'){
        shortcutController.setKeyEnabled('r', false);
        shortcutController.setKeyEnabled('p', false);
      } else if (typeof shortcutController.setAll === 'function' || typeof shortcutController.setGlobal === 'function'){
        const setter = shortcutController.setAll || shortcutController.setGlobal;
        try { setter.call(shortcutController, false); } catch {}
      }
    }

    const initialDifficulty = pickDifficulty(opts?.difficulty);
    const state = {
      difficulty: initialDifficulty,
      targetWpm: clampTargetWpm(opts?.targetWpm ?? 60),
      timeLimit: DEFAULT_TIME_LIMIT,
      remaining: DEFAULT_TIME_LIMIT,
      running: false,
      phase: 'idle',
      currentWord: '',
      nextWord: '',
      typed: '',
      wordQueue: [],
      charSpans: [],
      correctChars: 0,
      incorrectChars: 0,
      combo: 0,
      maxCombo: 0,
      comboAwards: new Set(),
      wordIndex: 0,
      wordsCompleted: 0,
      elapsed: 0,
      sessionXp: 0,
      accuracyXp: 0,
      xpEvents: [],
      toastTimer: null
    };

    let rafId = null;
    let lastTick = null;
    let lastInputValue = '';
    let localeUnsubscribe = null;

    const wrapper = document.createElement('div');
    wrapper.className = 'typing-game-wrapper';

    const panel = document.createElement('div');
    panel.className = 'typing-panel';

    const header = document.createElement('div');
    header.className = 'typing-header';

    const title = document.createElement('h2');
    title.className = 'title';
    title.textContent = translate('selection.miniexp.games.typing.name', () => DISPLAY_NAME);

    const controls = document.createElement('div');
    controls.className = 'typing-controls';

    const difficultyLabel = document.createElement('label');
    const difficultyLabelText = document.createElement('span');
    difficultyLabel.appendChild(difficultyLabelText);

    const difficultySelect = document.createElement('select');
    const difficultyOptions = [
      { value: 'EASY', key: 'easy' },
      { value: 'NORMAL', key: 'normal' },
      { value: 'HARD', key: 'hard' }
    ];
    difficultyOptions.forEach(option => {
      const opt = document.createElement('option');
      opt.value = option.value;
      difficultySelect.appendChild(opt);
      option.element = opt;
    });
    difficultySelect.value = state.difficulty;
    difficultyLabel.appendChild(difficultySelect);

    const targetLabel = document.createElement('label');
    const targetLabelText = document.createElement('span');
    targetLabel.appendChild(targetLabelText);

    const targetSlider = document.createElement('input');
    targetSlider.type = 'range';
    targetSlider.min = String(TARGET_WPM_RANGE.min);
    targetSlider.max = String(TARGET_WPM_RANGE.max);
    targetSlider.value = String(state.targetWpm);

    const targetValue = document.createElement('span');

    targetLabel.appendChild(targetSlider);
    targetLabel.appendChild(targetValue);

    controls.appendChild(difficultyLabel);
    controls.appendChild(targetLabel);

    const timerBox = document.createElement('div');
    timerBox.className = 'typing-timer';

    const timeValue = document.createElement('div');
    timeValue.className = 'time-value';
    timeValue.textContent = '60:00';

    const progress = document.createElement('div');
    progress.className = 'typing-progress';

    const progressFill = document.createElement('div');
    progressFill.className = 'fill';
    progress.appendChild(progressFill);

    timerBox.appendChild(timeValue);
    timerBox.appendChild(progress);

    header.appendChild(title);
    header.appendChild(controls);
    header.appendChild(timerBox);

    const wordsArea = document.createElement('div');
    wordsArea.className = 'typing-words';

    const currentWordEl = document.createElement('div');
    currentWordEl.className = 'typing-current';

    const nextWordEl = document.createElement('div');
    nextWordEl.className = 'typing-next';

    wordsArea.appendChild(currentWordEl);
    wordsArea.appendChild(nextWordEl);

    const inputRow = document.createElement('div');
    inputRow.className = 'typing-input-row';

    const input = document.createElement('input');
    input.type = 'text';
    input.autocapitalize = 'off';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.placeholder = translate('miniGames.typing.input.placeholder', '表示された単語をタイプ（Space/Enterで確定）');

    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.textContent = translate('miniGames.typing.buttons.reset', 'リセット');

    inputRow.appendChild(input);
    inputRow.appendChild(resetButton);

    const toast = document.createElement('div');
    toast.className = 'typing-toast';

    const statsGrid = document.createElement('div');
    statsGrid.className = 'typing-stats';

    const statLabelUpdaters = [];
    function makeStat(labelKey, fallback){
      const card = document.createElement('div');
      card.className = 'typing-stat-card';
      const lbl = document.createElement('div');
      lbl.className = 'label';
      const value = document.createElement('div');
      value.className = 'value';
      value.textContent = '0';
      card.appendChild(lbl);
      card.appendChild(value);
      statsGrid.appendChild(card);
      const updateLabel = () => {
        lbl.textContent = translate(labelKey, fallback);
      };
      statLabelUpdaters.push(updateLabel);
      updateLabel();
      return value;
    }

    const accuracyValue = makeStat('miniGames.typing.stats.labels.accuracy', 'ACC');
    const wpmValue = makeStat('miniGames.typing.stats.labels.wpm', 'WPM');
    const comboValue = makeStat('miniGames.typing.stats.labels.combo', 'COMBO');
    const xpValue = makeStat('miniGames.typing.stats.labels.sessionXp', 'SESSION XP');

    const resultOverlay = document.createElement('div');
    resultOverlay.className = 'typing-result-overlay';

    const resultCard = document.createElement('div');
    resultCard.className = 'typing-result-card';

    const resultTitle = document.createElement('h3');
    resultTitle.textContent = translate('miniGames.typing.result.title', 'RESULT');

    const resultGrid = document.createElement('div');
    resultGrid.className = 'typing-result-grid';

    const resultLabelUpdaters = [];
    function makeResultItem(labelKey, fallback){
      const item = document.createElement('div');
      item.className = 'item';
      const lbl = document.createElement('div');
      lbl.className = 'label';
      const value = document.createElement('div');
      value.className = 'value';
      value.textContent = '-';
      item.appendChild(lbl);
      item.appendChild(value);
      resultGrid.appendChild(item);
      const updateLabel = () => {
        lbl.textContent = translate(labelKey, fallback);
      };
      resultLabelUpdaters.push(updateLabel);
      updateLabel();
      return value;
    }

    const resultAccuracy = makeResultItem('miniGames.typing.result.labels.accuracy', '精度');
    const resultWpm = makeResultItem('miniGames.typing.result.labels.wpm', '平均WPM');
    const resultWords = makeResultItem('miniGames.typing.result.labels.words', '正タイプ数');
    const resultCombo = makeResultItem('miniGames.typing.result.labels.combo', '最高コンボ');

    const xpSummary = document.createElement('div');
    xpSummary.className = 'typing-result-xp';
    const xpSummaryTitle = document.createElement('div');
    xpSummaryTitle.textContent = translate('miniGames.typing.xp.title', 'EXP 内訳');
    const xpList = document.createElement('ul');
    xpSummary.appendChild(xpSummaryTitle);
    xpSummary.appendChild(xpList);
    const targetInfo = document.createElement('div');
    targetInfo.style.fontSize = '13px';
    targetInfo.style.color = '#bae6fd';
    xpSummary.appendChild(targetInfo);

    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.textContent = translate('miniGames.typing.buttons.retry', 'もう一度挑戦');

    resultCard.appendChild(resultTitle);
    resultCard.appendChild(resultGrid);
    resultCard.appendChild(xpSummary);
    resultCard.appendChild(closeButton);
    resultOverlay.appendChild(resultCard);

    panel.appendChild(header);
    panel.appendChild(wordsArea);
    panel.appendChild(inputRow);
    panel.appendChild(toast);
    panel.appendChild(statsGrid);
    panel.appendChild(resultOverlay);

    wrapper.appendChild(panel);
    root.appendChild(wrapper);

    function setToast(message, color = '#facc15'){
      toast.textContent = message || '';
      toast.style.color = color;
      if (state.toastTimer){
        clearTimeout(state.toastTimer);
        state.toastTimer = null;
      }
      if (message){
        state.toastTimer = setTimeout(() => {
          toast.textContent = '';
          state.toastTimer = null;
        }, 2600);
      }
    }

    function formatNextWordText(word){
      if (word){
        return translate('miniGames.typing.words.nextWithValue', () => `次: ${word}`, { word });
      }
      return translate('miniGames.typing.words.nextEmpty', '次: -');
    }

    function updateTargetValue(){
      targetValue.textContent = translate('miniGames.typing.controls.targetValue', () => `${state.targetWpm} WPM`, {
        targetWpm: state.targetWpm
      });
    }

    function updateTargetInfo(progressPercent){
      if (progressPercent == null || Number.isNaN(progressPercent)){
        targetInfo.textContent = translate('miniGames.typing.stats.targetInfo.pending', () => `ターゲット ${state.targetWpm} WPM / 達成度 -`, {
          targetWpm: state.targetWpm
        });
        return;
      }
      const clamped = Math.min(progressPercent, 999);
      const formatted = formatNumber(clamped, 1);
      targetInfo.textContent = translate('miniGames.typing.stats.targetInfo.active', () => `ターゲット ${state.targetWpm} WPM / 達成度 ${formatted}%`, {
        targetWpm: state.targetWpm,
        progress: formatted
      });
    }

    function formatMilestoneEntry(milestone){
      return translate('miniGames.typing.xp.milestoneEntry', () => `x${milestone.combo}+${milestone.bonus}`, {
        combo: milestone.combo,
        bonus: milestone.bonus
      });
    }

    function formatXpEvent(event){
      const xpValueText = Number.isInteger(event.xp) ? String(event.xp) : formatNumber(event.xp, 1);
      if (event.type === 'word'){
        const label = translate('miniGames.typing.xp.wordLabel', () => `単語 ${event.index}`, {
          index: event.index
        });
        if (event.milestones && event.milestones.length){
          const milestoneText = event.milestones.map(formatMilestoneEntry).join(translate('miniGames.typing.xp.milestoneSeparator', ', '));
          return translate('miniGames.typing.xp.wordWithMilestones', () => `${label}: +${xpValueText} EXP (${milestoneText})`, {
            label,
            xp: xpValueText,
            milestones: milestoneText,
            index: event.index
          });
        }
        return translate('miniGames.typing.xp.word', () => `${label}: +${xpValueText} EXP`, {
          label,
          xp: xpValueText,
          index: event.index
        });
      }
      if (event.type === 'accuracy'){
        const percentText = formatNumber(event.accuracy * 100, 1);
        const label = translate('miniGames.typing.xp.accuracyLabel', () => `精度ボーナス (${percentText}%)`, {
          accuracyPercent: percentText
        });
        return translate('miniGames.typing.xp.accuracy', () => `${label}: +${xpValueText} EXP`, {
          label,
          xp: xpValueText,
          accuracyPercent: percentText
        });
      }
      return translate('miniGames.typing.xp.generic', () => `+${xpValueText} EXP`, {
        xp: xpValueText
      });
    }

    function renderXpList(){
      xpList.innerHTML = '';
      if (!state.xpEvents.length){
        const item = document.createElement('li');
        item.textContent = translate('miniGames.typing.xp.none', 'EXPは獲得できませんでした');
        xpList.appendChild(item);
        return;
      }
      state.xpEvents.forEach(event => {
        const item = document.createElement('li');
        item.textContent = formatXpEvent(event);
        xpList.appendChild(item);
      });
    }

    function applyLocaleTexts(){
      title.textContent = translate('selection.miniexp.games.typing.name', () => DISPLAY_NAME);
      difficultyLabelText.textContent = translate('miniGames.typing.controls.difficulty', '難易度');
      difficultyOptions.forEach(option => {
        const key = `miniGames.typing.controls.difficultyOptions.${option.key}`;
        option.element.textContent = translate(key, option.value);
      });
      targetLabelText.textContent = translate('miniGames.typing.controls.target', 'ターゲットWPM');
      updateTargetValue();
      input.placeholder = translate('miniGames.typing.input.placeholder', '表示された単語をタイプ（Space/Enterで確定）');
      resetButton.textContent = translate('miniGames.typing.buttons.reset', 'リセット');
      statLabelUpdaters.forEach(update => update());
      resultTitle.textContent = translate('miniGames.typing.result.title', 'RESULT');
      resultLabelUpdaters.forEach(update => update());
      xpSummaryTitle.textContent = translate('miniGames.typing.xp.title', 'EXP 内訳');
      closeButton.textContent = translate('miniGames.typing.buttons.retry', 'もう一度挑戦');
      updateNextWord();
      const ratio = state.phase === 'finished' || state.phase === 'running'
        ? (state.targetWpm > 0 ? (computeWpm() / state.targetWpm) * 100 : 0)
        : null;
      updateTargetInfo(ratio);
      renderXpList();
    }

    const i18nInstance = getI18n();
    const handleLocaleChange = () => applyLocaleTexts();
    if (typeof i18nInstance?.onLocaleChanged === 'function'){
      try {
        localeUnsubscribe = i18nInstance.onLocaleChanged(handleLocaleChange);
      } catch (error) {
        console.warn('[typing] Failed to subscribe to locale changes via onLocaleChanged', error);
      }
    }
    if (!localeUnsubscribe){
      const listener = () => handleLocaleChange();
      document.addEventListener('i18n:locale-changed', listener);
      localeUnsubscribe = () => {
        document.removeEventListener('i18n:locale-changed', listener);
      };
    }

    function prepareWordQueue(){
      const config = DIFFICULTY_OPTIONS[state.difficulty];
      const pool = config ? config.wordPool : DIFFICULTY_OPTIONS.NORMAL.wordPool;
      state.wordQueue = shuffle(pool);
      state.wordIndex = 0;
    }

    function pullWord(){
      if (!state.wordQueue.length || state.wordIndex >= state.wordQueue.length){
        prepareWordQueue();
      }
      const word = state.wordQueue[state.wordIndex % state.wordQueue.length];
      state.wordIndex += 1;
      return word;
    }

    function setWords(){
      state.currentWord = pullWord();
      state.nextWord = pullWord();
      renderCurrentWord();
      updateNextWord();
    }

    function renderCurrentWord(){
      currentWordEl.innerHTML = '';
      const letters = state.currentWord.split('');
      state.charSpans = letters.map((char) => {
        const span = document.createElement('span');
        span.className = 'typing-char pending';
        span.textContent = char;
        currentWordEl.appendChild(span);
        return span;
      });
      if (state.difficulty === 'HARD'){
        currentWordEl.classList.add('mono');
      } else {
        currentWordEl.classList.remove('mono');
      }
      updateWordProgress();
    }

    function updateWordProgress(){
      const typedLength = state.typed.length;
      state.charSpans.forEach((span, index) => {
        span.className = 'typing-char';
        if (index < typedLength){
          span.classList.add('correct');
        } else if (index === typedLength){
          span.classList.add('next');
        } else {
          span.classList.add('pending');
        }
      });
    }

    function updateNextWord(){
      nextWordEl.textContent = formatNextWordText(state.nextWord);
    }

    function updateTimerVisual(){
      const seconds = Math.max(0, Math.floor(state.remaining));
      const hundredths = Math.floor((state.remaining - Math.floor(state.remaining)) * 100);
      timeValue.textContent = `${pad(seconds)}:${pad(hundredths)}`;
      const ratio = Math.max(0, Math.min(1, state.remaining / state.timeLimit));
      progressFill.style.width = `${ratio * 100}%`;
      if (state.remaining <= 10){
        progress.classList.add('hurry');
      } else {
        progress.classList.remove('hurry');
      }
      if (state.difficulty === 'HARD' && state.remaining <= 30){
        panel.style.boxShadow = '0 28px 70px rgba(14,165,233,0.35)';
      } else {
        panel.style.boxShadow = '0 28px 60px rgba(8,15,30,0.55)';
      }
      if (state.remaining <= 10){
        wrapper.style.background = 'radial-gradient(circle at 20% 20%, rgba(248,113,113,0.32), rgba(15,23,42,0.94))';
      } else if (state.remaining <= 20){
        wrapper.style.background = 'radial-gradient(circle at 20% 20%, rgba(249,115,22,0.26), rgba(15,23,42,0.94))';
      } else {
        wrapper.style.background = 'radial-gradient(circle at 20% 20%, rgba(14,165,233,0.22), rgba(15,23,42,0.94))';
      }
    }

    function computeAccuracy(){
      const total = state.correctChars + state.incorrectChars;
      if (total === 0) return 1;
      return state.correctChars / total;
    }

    function computeWpm(){
      const elapsedMinutes = state.elapsed > 0 ? state.elapsed / 60 : 1 / 60;
      return (state.correctChars / 5) / elapsedMinutes;
    }

    function updateStats(){
      const accuracy = computeAccuracy();
      accuracyValue.textContent = `${formatNumber(accuracy * 100, 1)}%`;
      const wpm = computeWpm();
      wpmValue.textContent = formatNumber(wpm, 1);
      if (state.phase !== 'finished'){
        if (state.running){
          const liveRatio = state.targetWpm > 0 ? (wpm / state.targetWpm) * 100 : 0;
          updateTargetInfo(liveRatio);
        } else {
          updateTargetInfo(null);
        }
      }
      comboValue.textContent = String(state.combo);
      xpValue.textContent = formatNumber(state.sessionXp, 1);
    }

    function resetCombo(){
      state.combo = 0;
      state.comboAwards.clear();
      comboValue.textContent = '0';
    }

    function handleMistype(){
      state.incorrectChars += 1;
      resetCombo();
      currentWordEl.classList.add('typing-word-error');
      setToast(translate('miniGames.typing.toasts.mistype', 'ミスタイプ！'), '#fca5a5');
      setTimeout(() => currentWordEl.classList.remove('typing-word-error'), 280);
      updateStats();
    }

    function handleWordConfirmed(){
      const word = state.currentWord;
      const length = word.length;
      state.wordsCompleted += 1;
      state.correctChars += length;
      state.combo += length;
      state.maxCombo = Math.max(state.maxCombo, state.combo);

      const triggered = [];
      let xpGain = length * XP_PER_CHAR;
      for (const milestone of COMBO_MILESTONES){
        if (state.combo >= milestone.count && !state.comboAwards.has(milestone.count)){
          state.comboAwards.add(milestone.count);
          xpGain += milestone.bonus;
          triggered.push(milestone);
        }
      }
      if (xpGain > 0){
        if (typeof awardXp === 'function'){
          awardXp(xpGain, { type: 'char', word, chars: length, combo: state.combo, milestones: triggered.map(m => m.count) });
        }
        state.sessionXp += xpGain;
        state.xpEvents.push({ type: 'word', index: state.wordsCompleted, xp: xpGain, milestones: triggered.map(m => ({ combo: m.count, bonus: m.bonus })) });
        updateStats();
        renderXpList();
      }
      if (triggered.length){
        const milestoneTexts = triggered.map(m => translate('miniGames.typing.toasts.comboMilestone', () => `Combo x${m.count}! +${m.bonus} EXP`, {
          combo: m.count,
          bonus: m.bonus
        }));
        const separator = translate('miniGames.typing.toasts.comboSeparator', ' / ');
        setToast(milestoneTexts.join(separator), '#fde68a');
        window.playSfx?.('pickup');
      }
      state.typed = '';
      lastInputValue = '';
      input.value = '';
      state.currentWord = state.nextWord;
      state.nextWord = pullWord();
      renderCurrentWord();
      updateNextWord();
    }

    function finalizeWord(){
      if (!state.running) return;
      if (state.typed.length !== state.currentWord.length){
        setToast(translate('miniGames.typing.toasts.completeBeforeConfirm', '全文字をタイプしてから確定！'), '#fde68a');
        return;
      }
      handleWordConfirmed();
    }

    function applyDifficultyStyles(){
      const config = DIFFICULTY_OPTIONS[state.difficulty];
      if (config){
        panel.style.fontFamily = config.fontFamily;
        currentWordEl.style.fontFamily = config.fontFamily;
      }
    }

    function resetState(){
      state.remaining = state.timeLimit;
      state.running = false;
      state.phase = 'idle';
      state.typed = '';
      state.correctChars = 0;
      state.incorrectChars = 0;
      state.combo = 0;
      state.maxCombo = 0;
      state.comboAwards.clear();
      state.wordsCompleted = 0;
      state.elapsed = 0;
      state.sessionXp = 0;
      state.accuracyXp = 0;
      state.xpEvents = [];
      setToast('');
      updateTargetValue();
      updateTargetInfo(null);
      renderXpList();
      lastInputValue = '';
      input.value = '';
      input.disabled = false;
      prepareWordQueue();
      setWords();
      updateStats();
      updateTimerVisual();
    }

    function finish(){
      state.running = false;
      state.phase = 'finished';
      state.elapsed = Math.min(state.elapsed, state.timeLimit);
      cancelAnimationFrame(rafId);
      rafId = null;
      input.disabled = true;
      const accuracy = computeAccuracy();
      const wpm = computeWpm();
      resultAccuracy.textContent = `${formatNumber(accuracy * 100, 1)}%`;
      resultWpm.textContent = formatNumber(wpm, 1);
      resultWords.textContent = translate('miniGames.typing.result.wordsValue', () => `${state.correctChars} 文字`, {
        count: state.correctChars
      });
      resultCombo.textContent = `${state.maxCombo}`;
      const targetRatio = state.targetWpm > 0 ? (wpm / state.targetWpm) * 100 : 0;
      updateTargetInfo(targetRatio);

      let accuracyXp = 0;
      for (const bonus of ACCURACY_BONUSES){
        if (accuracy >= bonus.threshold){
          accuracyXp = bonus.bonus;
          break;
        }
      }
      if (accuracyXp > 0){
        if (typeof awardXp === 'function'){
          awardXp(accuracyXp, { type: 'accuracy', accuracy });
        }
        state.sessionXp += accuracyXp;
        state.accuracyXp = accuracyXp;
        state.xpEvents.push({ type: 'accuracy', accuracy, xp: accuracyXp });
      }
      xpValue.textContent = formatNumber(state.sessionXp, 1);

      renderXpList();

      resultOverlay.classList.add('active');
    }

    function tick(timestamp){
      if (!state.running) return;
      if (lastTick == null){
        lastTick = timestamp;
      }
      const delta = (timestamp - lastTick) / 1000;
      lastTick = timestamp;
      state.remaining -= delta;
      state.elapsed += delta;
      if (state.remaining <= 0){
        state.remaining = 0;
        updateTimerVisual();
        finish();
        return;
      }
      updateTimerVisual();
      updateStats();
      rafId = requestAnimationFrame(tick);
    }

    function startTimer(){
      if (state.running) return;
      state.running = true;
      state.phase = 'running';
      lastTick = null;
      rafId = requestAnimationFrame(tick);
      setToast(translate('miniGames.typing.toasts.start', '60秒チャレンジ開始！がんばって！'), '#fde68a');
    }

    function stopTimer(){
      if (!state.running) return;
      state.running = false;
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    function start(){
      stopTimer();
      resetState();
      applyDifficultyStyles();
      resultOverlay.classList.remove('active');
      startTimer();
      input.focus();
    }

    function stop(){
      stopTimer();
    }

    function destroy(){
      stopTimer();
      if (state.toastTimer){
        clearTimeout(state.toastTimer);
      }
      input.removeEventListener('input', onInput);
      input.removeEventListener('keydown', onKeyDown);
      resetButton.removeEventListener('click', onReset);
      difficultySelect.removeEventListener('change', onDifficultyChange);
      targetSlider.removeEventListener('input', onTargetChange);
      closeButton.removeEventListener('click', onCloseResult);
      if (typeof localeUnsubscribe === 'function'){
        try {
          localeUnsubscribe();
        } catch (error) {
          console.warn('[typing] Failed to unsubscribe from locale changes', error);
        }
        localeUnsubscribe = null;
      }
      if (wrapper.parentNode === root){
        root.removeChild(wrapper);
      }
    }

    function onInput(){
      if (!state.running) {
        input.value = '';
        return;
      }
      const value = input.value;
      if (value.length > state.currentWord.length){
        input.value = lastInputValue;
        return;
      }
      if (value.length > lastInputValue.length){
        const index = value.length - 1;
        const expected = state.currentWord[index] || '';
        const entered = value[index];
        if (entered === expected){
          state.typed = value;
          lastInputValue = value;
          updateWordProgress();
        } else {
          input.value = lastInputValue;
          handleMistype();
        }
      } else if (value.length < lastInputValue.length){
        state.typed = value;
        lastInputValue = value;
        updateWordProgress();
      } else {
        input.value = lastInputValue;
      }
    }

    function onKeyDown(event){
      if (!state.running) return;
      if (event.key === ' ' || event.key === 'Enter'){
        event.preventDefault();
        finalizeWord();
      }
    }

    function onReset(){
      start();
    }

    function onDifficultyChange(){
      const next = pickDifficulty(difficultySelect.value);
      if (state.difficulty !== next){
        state.difficulty = next;
        applyDifficultyStyles();
        start();
      }
    }

    function onTargetChange(){
      state.targetWpm = clampTargetWpm(targetSlider.value);
      targetSlider.value = String(state.targetWpm);
      updateTargetValue();
      if (state.phase === 'finished'){
        const ratio = state.targetWpm > 0 ? (computeWpm() / state.targetWpm) * 100 : 0;
        updateTargetInfo(ratio);
      } else {
        updateStats();
      }
    }

    function onCloseResult(){
      start();
    }

    input.addEventListener('input', onInput);
    input.addEventListener('keydown', onKeyDown);
    resetButton.addEventListener('click', onReset);
    difficultySelect.addEventListener('change', onDifficultyChange);
    targetSlider.addEventListener('input', onTargetChange);
    closeButton.addEventListener('click', onCloseResult);

    resetState();
    applyDifficultyStyles();
    updateTimerVisual();
    updateStats();
    applyLocaleTexts();

    const runtime = {
      start,
      stop,
      destroy,
      getScore(){
        return state.correctChars;
      }
    };

    start();
    return runtime;
  }

  window.registerMiniGame({
    id: GAME_ID,
    name: DISPLAY_NAME,
    nameKey: 'selection.miniexp.games.typing.name',
    description: '60秒で精度とスピードに挑むリアルタイムタイピング',
    descriptionKey: 'selection.miniexp.games.typing.description',
    category: 'スキル',
    categories: ['スキル'],
    categoryIds: ['skill'],
    version: '0.1.0',
    author: 'mod',
    create
  });
})();

(function(){
  const GAME_ID = 'calc_combo';
  const GAME_NAME = '計算コンボ';

  /** @type {Record<'EASY'|'NORMAL'|'HARD', {limit:number, weights:Record<string,number>}>> */
  const DIFFICULTY_CONFIG = {
    EASY:   { limit: 6, weights: { add: 4, sub: 3, mul: 2, div: 1 } },
    NORMAL: { limit: 5, weights: { add: 1, sub: 1, mul: 1, div: 1 } },
    HARD:   { limit: 4, weights: { add: 2, sub: 3, mul: 3, div: 2 } }
  };

  const MAX_HISTORY = 5;
  const STREAK_BONUS_INTERVAL = 10;
  const BASE_EXP = 5;
  const SPEED_BONUS_SCALE = 4; // 最大+4EXP
  const COMBO_BONUS_STEP = 2;  // コンボ1段階につき+2EXP
  const SPEED_WARNING_THRESHOLD = 0.25;

  const DIVISION_POOL = (() => {
    const pool = [];
    for (let divisor = 2; divisor <= 9; divisor++){
      for (let quotient = 1; quotient <= 12; quotient++){
        const dividend = divisor * quotient;
        if (dividend >= 10 && dividend <= 99){
          pool.push({ dividend, divisor, quotient });
        }
      }
    }
    return pool;
  })();

  function randomInt(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function weightedPick(weights, lastType){
    const entries = Object.entries(weights).map(([type, weight]) => {
      let w = Number(weight) || 0;
      if (type === lastType){
        w *= 0.45; // 前回タイプは出現確率を下げる
      }
      return [type, Math.max(w, 0)];
    });
    const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
    if (total <= 0){
      return entries[Math.floor(Math.random() * entries.length)][0];
    }
    let r = Math.random() * total;
    for (const [type, weight] of entries){
      r -= weight;
      if (r <= 0){
        return type;
      }
    }
    return entries[entries.length - 1][0];
  }

  function generateQuestion(difficulty, lastType){
    const config = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.NORMAL;
    const type = weightedPick(config.weights, lastType);
    let text = '';
    let answer = 0;

    switch (type){
      case 'add': {
        const a = randomInt(0, 99);
        const b = randomInt(0, 99);
        text = `${a} + ${b}`;
        answer = a + b;
        break;
      }
      case 'sub': {
        let a = randomInt(0, 99);
        let b = randomInt(0, 99);
        if (a < b){
          const tmp = a;
          a = b;
          b = tmp;
        }
        text = `${a} - ${b}`;
        answer = a - b;
        break;
      }
      case 'mul': {
        const a = randomInt(1, 9);
        const b = randomInt(1, 9);
        text = `${a} × ${b}`;
        answer = a * b;
        break;
      }
      case 'div': {
        const pick = DIVISION_POOL[Math.floor(Math.random() * DIVISION_POOL.length)];
        text = `${pick.dividend} ÷ ${pick.divisor}`;
        answer = pick.quotient;
        break;
      }
      default: {
        const a = randomInt(0, 9);
        const b = randomInt(0, 9);
        text = `${a} + ${b}`;
        answer = a + b;
      }
    }

    return {
      type,
      text,
      answer,
      limit: (config.limit || 5) * 1000,
      remaining: (config.limit || 5) * 1000,
      startedAt: performance.now()
    };
  }

  function clamp(value, min, max){
    if (value < min) return min;
    if (value > max) return max;
    return value;
  }

  function formatNumber(num){
    return Number(num).toString();
  }


  function create(root, awardXp, opts){
    if (!root) throw new Error('Calculation Combo requires a container');

    const difficulty = (opts && opts.difficulty) || 'NORMAL';
    const localization = opts?.localization || (typeof window !== 'undefined' && typeof window.createMiniGameLocalization === 'function'
      ? window.createMiniGameLocalization({ id: GAME_ID })
      : null);
    const text = (key, fallback, params) => {
      if (localization && typeof localization.t === 'function'){
        return localization.t(key, fallback, params);
      }
      if (typeof fallback === 'function') return fallback();
      return fallback ?? '';
    };
    const formatNumber = (value, options) => {
      if (localization && typeof localization.formatNumber === 'function'){
        try { return localization.formatNumber(value, options); } catch {}
      }
      if (typeof Intl !== 'undefined' && typeof Intl.NumberFormat === 'function'){
        try { return new Intl.NumberFormat(undefined, options).format(value); } catch {}
      }
      if (value != null && typeof value.toLocaleString === 'function'){
        try { return value.toLocaleString(); } catch {}
      }
      return String(value ?? '');
    };
    const formatExpValue = (value) => {
      const numeric = Number(value) || 0;
      const hasFraction = Math.abs(numeric - Math.trunc(numeric)) > 1e-6;
      return formatNumber(numeric, {
        minimumFractionDigits: hasFraction ? 1 : 0,
        maximumFractionDigits: hasFraction ? 1 : 0
      });
    };
    const getDifficultyLabel = (value) => {
      switch (value){
        case 'EASY':
          return text('.difficulty.easy', 'EASY');
        case 'HARD':
          return text('.difficulty.hard', 'HARD');
        case 'NORMAL':
        default:
          return text('.difficulty.normal', 'NORMAL');
      }
    };
    const getLocalizedName = () => text('.name', GAME_NAME);
    let detachLocale = null;

    const state = {
      running: false,
      question: null,
      combo: 0,
      totalCorrect: 0,
      totalMistake: 0,
      totalXp: 0,
      bestCombo: 0,
      lastType: null,
      lastAward: null,
      history: [],
      rafId: null,
      lastTick: 0
    };

    const style = document.createElement('style');
    style.textContent = `
      .calc-combo-root{width:100%;height:100%;box-sizing:border-box;padding:24px;display:flex;flex-direction:column;gap:16px;background:radial-gradient(circle at top left,rgba(30,64,175,0.28),rgba(15,23,42,0.92));font-family:"Noto Sans JP","Hiragino Sans",sans-serif;color:#f1f5f9;}
      .calc-combo-top{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;}
      .calc-combo-title{font-size:24px;font-weight:700;margin:0;letter-spacing:0.04em;}
      .calc-combo-info{display:flex;gap:8px;flex-wrap:wrap;font-size:13px;color:rgba(226,232,240,0.85);}
      .calc-combo-chip{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;background:rgba(15,23,42,0.55);border:1px solid rgba(148,163,184,0.35);}
      .calc-combo-main{flex:1;display:flex;gap:20px;flex-wrap:wrap;align-items:stretch;}
      .calc-combo-card{flex:1 1 280px;min-height:200px;background:rgba(15,23,42,0.6);border:1px solid rgba(148,163,184,0.35);border-radius:18px;padding:24px;display:flex;flex-direction:column;gap:18px;box-shadow:0 12px 32px rgba(15,23,42,0.35);transition:transform 0.2s ease,background 0.2s ease,border-color 0.2s ease;}
      .calc-combo-card.correct{background:rgba(22,101,52,0.65);border-color:rgba(74,222,128,0.65);}
      .calc-combo-card.wrong{background:rgba(185,28,28,0.55);border-color:rgba(248,113,113,0.65);}
      .calc-combo-card.shake{animation:calcComboShake 0.4s ease;}
      @keyframes calcComboShake{0%,100%{transform:translateX(0);}20%{transform:translateX(-6px);}40%{transform:translateX(6px);}60%{transform:translateX(-4px);}80%{transform:translateX(4px);}}
      .calc-combo-question{font-size:48px;font-weight:700;letter-spacing:0.08em;text-align:center;margin:0;}
      .calc-combo-timer{height:12px;background:rgba(30,41,59,0.7);border-radius:999px;overflow:hidden;}
      .calc-combo-timer-bar{height:100%;width:100%;background:linear-gradient(90deg,rgba(56,189,248,0.9),rgba(14,165,233,0.8));transition:background 0.2s ease;}
      .calc-combo-timer-bar.warning{background:linear-gradient(90deg,rgba(239,68,68,0.9),rgba(220,38,38,0.8));}
      .calc-combo-footer{display:flex;flex-direction:column;gap:12px;}
      .calc-combo-answer{display:flex;gap:12px;align-items:center;}
      .calc-combo-answer input{flex:1;padding:12px 16px;border-radius:999px;border:1px solid rgba(148,163,184,0.5);background:rgba(15,23,42,0.5);color:#f8fafc;font-size:20px;text-align:center;outline:none;transition:border-color 0.2s ease,box-shadow 0.2s ease;}
      .calc-combo-answer input:focus{border-color:rgba(96,165,250,0.8);box-shadow:0 0 0 3px rgba(59,130,246,0.35);}
      .calc-combo-submit{padding:12px 24px;border-radius:999px;border:none;background:linear-gradient(135deg,rgba(59,130,246,0.9),rgba(37,99,235,0.8));color:#f8fafc;font-size:16px;font-weight:600;cursor:pointer;transition:transform 0.15s ease,filter 0.15s ease;}
      .calc-combo-submit:active{transform:scale(0.97);}
      .calc-combo-shortcuts{font-size:12px;color:rgba(226,232,240,0.7);}
      .calc-combo-history{flex:0 1 220px;background:rgba(15,23,42,0.55);border:1px solid rgba(148,163,184,0.35);border-radius:16px;padding:16px;display:flex;flex-direction:column;gap:12px;}
      .calc-combo-history h3{margin:0;font-size:16px;font-weight:600;color:rgba(226,232,240,0.9);}
      .calc-combo-history ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px;}
      .calc-combo-history li{font-size:13px;color:rgba(226,232,240,0.85);display:flex;justify-content:space-between;align-items:center;gap:8px;}
      .calc-combo-history li span{display:inline-flex;align-items:center;gap:6px;}
      .calc-combo-exp{font-size:14px;font-weight:600;}
      .calc-combo-exp.gain{color:#34d399;}
      .calc-combo-exp.loss{color:#f87171;}
      .calc-combo-exp.neutral{color:rgba(226,232,240,0.7);}
      .calc-combo-pop{font-size:14px;color:rgba(226,232,240,0.85);min-height:20px;}
    `;

    const wrapper = document.createElement('div');
    wrapper.className = 'calc-combo-root';

    const top = document.createElement('div');
    top.className = 'calc-combo-top';

    const title = document.createElement('h2');
    title.className = 'calc-combo-title';
    title.textContent = text('.title', () => `${GAME_NAME} (${difficulty})`, {
      name: getLocalizedName(),
      difficulty: getDifficultyLabel(difficulty)
    });

    const info = document.createElement('div');
    info.className = 'calc-combo-info';

    function makeChip(label, value){
      const chip = document.createElement('span');
      chip.className = 'calc-combo-chip';
      const labelSpan = document.createElement('span');
      labelSpan.textContent = label;
      const valueSpan = document.createElement('strong');
      valueSpan.textContent = value;
      chip.appendChild(labelSpan);
      chip.appendChild(valueSpan);
      return { chip, label: labelSpan, value: valueSpan };
    }

    const chipCorrect = makeChip(text('.stats.correct', '正解'), '0');
    const chipMistake = makeChip(text('.stats.mistake', 'ミス'), '0');
    const chipCombo = makeChip(text('.stats.combo', 'コンボ'), '0');
    const chipXp = makeChip(text('.stats.xp', '累計EXP'), '0');

    info.appendChild(chipCorrect.chip);
    info.appendChild(chipMistake.chip);
    info.appendChild(chipCombo.chip);
    info.appendChild(chipXp.chip);

    top.appendChild(title);
    top.appendChild(info);

    const main = document.createElement('div');
    main.className = 'calc-combo-main';

    const card = document.createElement('div');
    card.className = 'calc-combo-card';

    const questionText = document.createElement('p');
    questionText.className = 'calc-combo-question';
    questionText.textContent = text('.question.loading', '準備中…');

    const timer = document.createElement('div');
    timer.className = 'calc-combo-timer';
    const timerBar = document.createElement('div');
    timerBar.className = 'calc-combo-timer-bar';
    timer.appendChild(timerBar);

    const pop = document.createElement('div');
    pop.className = 'calc-combo-pop';

    const footer = document.createElement('div');
    footer.className = 'calc-combo-footer';

    const form = document.createElement('form');
    form.className = 'calc-combo-answer';

    const input = document.createElement('input');
    input.type = 'number';
    input.inputMode = 'numeric';
    input.autocomplete = 'off';
    input.placeholder = text('.input.answerPlaceholder', '答えを入力');

    const submit = document.createElement('button');
    submit.type = 'submit';
    submit.className = 'calc-combo-submit';
    submit.textContent = text('.buttons.submit', '回答');

    form.appendChild(input);
    form.appendChild(submit);

    const shortcuts = document.createElement('div');
    shortcuts.className = 'calc-combo-shortcuts';
    shortcuts.textContent = text('.shortcuts.submitOrSkip', 'Enterで回答 / Escでスキップ');

    footer.appendChild(form);
    footer.appendChild(shortcuts);

    card.appendChild(questionText);
    card.appendChild(timer);
    card.appendChild(pop);
    card.appendChild(footer);

    const history = document.createElement('div');
    history.className = 'calc-combo-history';
    const historyTitle = document.createElement('h3');
    historyTitle.textContent = text('.history.title', () => `履歴 (直近${MAX_HISTORY}問)`, { count: MAX_HISTORY });
    const historyList = document.createElement('ul');
    history.appendChild(historyTitle);
    history.appendChild(historyList);

    main.appendChild(card);
    main.appendChild(history);

    wrapper.appendChild(style);
    wrapper.appendChild(top);
    wrapper.appendChild(main);
    root.appendChild(wrapper);

    function updateHud(){
      chipCorrect.value.textContent = formatNumber(state.totalCorrect);
      chipMistake.value.textContent = formatNumber(state.totalMistake);
      chipCombo.value.textContent = formatNumber(state.combo);
      chipXp.value.textContent = formatExpValue(state.totalXp);
    }

    function formatHistoryLabel(entry){
      if (!entry) return '';
      switch (entry.type){
        case 'correct':
          return text('.history.correctEntry', () => `○ ${entry.expression}`, { expression: entry.expression });
        case 'mistake':
          return text('.history.mistakeEntry', () => `× ${entry.expression} = ${formatNumber(entry.answer)}`, {
            expression: entry.expression,
            answer: formatNumber(entry.answer)
          });
        case 'streak':
          return text('.history.streakEntry', () => `★ ${entry.combo}連続ボーナス`, { combo: entry.combo });
        default:
          return entry.label || '';
      }
    }

    function formatHistoryExp(entry){
      if (!entry) return { text: '', className: 'neutral' };
      const value = Number(entry.exp) || 0;
      if (value > 0){
        return {
          className: 'gain',
          text: text('.history.gain', () => `+${formatExpValue(value)} EXP`, { value: formatExpValue(value) })
        };
      }
      if (value < 0){
        return {
          className: 'loss',
          text: text('.history.loss', () => `${formatExpValue(value)} EXP`, { value: formatExpValue(value) })
        };
      }
      return {
        className: 'neutral',
        text: text('.history.neutral', '±0 EXP')
      };
    }

    function renderHistory(){
      historyList.innerHTML = '';
      for (const item of state.history){
        const li = document.createElement('li');
        const left = document.createElement('span');
        left.textContent = formatHistoryLabel(item);
        const right = document.createElement('span');
        const expMeta = formatHistoryExp(item);
        right.className = `calc-combo-exp ${expMeta.className}`;
        right.textContent = expMeta.text;
        li.appendChild(left);
        li.appendChild(right);
        historyList.appendChild(li);
      }
    }

    function addHistory(entry){
      state.history.unshift(entry);
      state.history = state.history.slice(0, MAX_HISTORY);
      renderHistory();
    }

    function showPop(message){
      pop.textContent = message;
    }

    function clearFeedback(){
      card.classList.remove('correct', 'wrong', 'shake');
      showPop('');
    }

    function applyFeedback(type){
      card.classList.remove('correct', 'wrong', 'shake');
      if (type === 'correct'){
        card.classList.add('correct');
      } else if (type === 'wrong'){
        card.classList.add('wrong', 'shake');
      }
    }

    function scheduleNextQuestion(){
      if (!state.running) return;
      clearFeedback();
      const q = generateQuestion(difficulty, state.lastType);
      state.question = q;
      state.lastType = q.type;
      questionText.textContent = text('.question.prompt', () => `${q.text} = ?`, { expression: q.text });
      input.value = '';
      input.focus({ preventScroll: true });
      timerBar.style.width = '100%';
      timerBar.classList.remove('warning');
      showPop('');
      state.lastTick = performance.now();
    }

    function handleCorrect(elapsedMs){
      state.combo += 1;
      state.totalCorrect += 1;
      if (state.combo > state.bestCombo){
        state.bestCombo = state.combo;
      }
      const question = state.question;
      const limit = question ? question.limit : DIFFICULTY_CONFIG[difficulty].limit * 1000;
      const remaining = Math.max(0, limit - elapsedMs);
      const remainingRatio = clamp(limit > 0 ? remaining / limit : 0, 0, 1);
      const speedBonus = Math.ceil(remainingRatio * SPEED_BONUS_SCALE);
      const comboBonus = state.combo * COMBO_BONUS_STEP;
      const totalGain = BASE_EXP + comboBonus + speedBonus;
      const awarded = awardXp ? awardXp(totalGain, { type: 'correct', combo: state.combo }) : totalGain;
      const actualGain = typeof awarded === 'number' ? awarded : totalGain;
      state.totalXp += Number(actualGain) || 0;
      state.lastAward = actualGain;
      addHistory({ type: 'correct', expression: question.text, exp: actualGain });
      showPop(text('.pop.correct', () => `正解！ 基本${formatExpValue(BASE_EXP)} + コンボ${formatExpValue(comboBonus)} + スピード${formatExpValue(speedBonus)}`, {
        base: formatExpValue(BASE_EXP),
        combo: formatExpValue(comboBonus),
        speed: formatExpValue(speedBonus)
      }));
      applyFeedback('correct');
      if (state.combo > 0 && state.combo % STREAK_BONUS_INTERVAL === 0){
        const streakGain = 10;
        const streakAward = awardXp ? awardXp(streakGain, { type: 'streak', combo: state.combo }) : streakGain;
        const actualStreakGain = typeof streakAward === 'number' ? streakAward : streakGain;
        state.totalXp += Number(actualStreakGain) || 0;
        addHistory({ type: 'streak', combo: state.combo, exp: actualStreakGain });
        showPop(text('.pop.streak', () => `コンボ${state.combo}達成！ボーナス+${formatExpValue(actualStreakGain)}`, {
          combo: state.combo,
          bonus: formatExpValue(actualStreakGain)
        }));
        if (window && window.playSfx){
          try { window.playSfx('pickup'); } catch (_) {}
        }
      }
      updateHud();
    }

    function handleMistake(correctAnswer){
      state.combo = 0;
      state.totalMistake += 1;
      addHistory({
        type: 'mistake',
        expression: state.question ? state.question.text : '',
        answer: correctAnswer,
        exp: 0
      });
      showPop(text('.pop.mistake', () => `正解は ${formatNumber(correctAnswer)}`, { answer: formatNumber(correctAnswer) }));
      applyFeedback('wrong');
      updateHud();
    }

    function finishQuestion(correct){
      if (state.question){
        state.question = null;
      }
      const delay = correct ? 600 : 900;
      setTimeout(() => {
        if (!state.running) return;
        clearFeedback();
        scheduleNextQuestion();
      }, delay);
    }

    function submitAnswer(){
      if (!state.question || !state.running) return;
      const raw = input.value.trim();
      if (raw === ''){
        showPop(text('.pop.emptyAnswer', '入力してから回答してください'));
        return;
      }
      const userAnswer = Number(raw);
      if (!Number.isFinite(userAnswer)){
        showPop(text('.pop.invalidAnswer', '数値で入力してください'));
        return;
      }
      const expected = state.question.answer;
      const elapsed = state.question.limit - state.question.remaining;
      if (Math.round(userAnswer) === expected){
        handleCorrect(elapsed);
        finishQuestion(true);
      } else {
        handleMistake(expected);
        finishQuestion(false);
      }
    }

    function skipQuestion(){
      if (!state.question || !state.running) return;
      handleMistake(state.question.answer);
      finishQuestion(false);
    }

    function updateTimer(deltaMs){
      if (!state.question) return;
      state.question.remaining = clamp(state.question.remaining - deltaMs, 0, state.question.limit);
      const ratio = state.question.limit > 0 ? state.question.remaining / state.question.limit : 0;
      timerBar.style.width = `${ratio * 100}%`;
      if (ratio <= SPEED_WARNING_THRESHOLD){
        timerBar.classList.add('warning');
      } else {
        timerBar.classList.remove('warning');
      }
      if (state.question.remaining <= 0){
        handleMistake(state.question.answer);
        finishQuestion(false);
      }
    }

    function loop(now){
      if (!state.running){
        state.rafId = null;
        return;
      }
      const delta = now - state.lastTick;
      state.lastTick = now;
      updateTimer(delta);
      state.rafId = requestAnimationFrame(loop);
    }

    function startLoop(){
      if (!state.running){
        state.running = true;
        state.lastTick = performance.now();
        state.rafId = requestAnimationFrame(loop);
        if (!state.question){
          scheduleNextQuestion();
        }
      }
    }

    function stopLoop(){
      state.running = false;
      if (state.rafId !== null){
        cancelAnimationFrame(state.rafId);
        state.rafId = null;
      }
    }

    const formSubmitHandler = function(e){
      e.preventDefault();
      submitAnswer();
    };

    form.addEventListener('submit', formSubmitHandler);

    const keyHandlerOptions = { passive: false };
    const keyHandler = function(e){
      if (!state.running) return;
      if (e.key === 'Escape'){
        e.preventDefault();
        skipQuestion();
      }
    };

    window.addEventListener('keydown', keyHandler, keyHandlerOptions);

    function applyLocalization(){
      const localizedName = getLocalizedName();
      const difficultyLabel = getDifficultyLabel(difficulty);
      title.textContent = text('.title', () => `${localizedName} (${difficultyLabel})`, {
        name: localizedName,
        difficulty: difficultyLabel
      });
      chipCorrect.label.textContent = text('.stats.correct', '正解');
      chipMistake.label.textContent = text('.stats.mistake', 'ミス');
      chipCombo.label.textContent = text('.stats.combo', 'コンボ');
      chipXp.label.textContent = text('.stats.xp', '累計EXP');
      input.placeholder = text('.input.answerPlaceholder', '答えを入力');
      submit.textContent = text('.buttons.submit', '回答');
      shortcuts.textContent = text('.shortcuts.submitOrSkip', 'Enterで回答 / Escでスキップ');
      historyTitle.textContent = text('.history.title', () => `履歴 (直近${MAX_HISTORY}問)`, { count: MAX_HISTORY });
      if (state.question){
        questionText.textContent = text('.question.prompt', () => `${state.question.text} = ?`, { expression: state.question.text });
      } else {
        questionText.textContent = text('.question.loading', '準備中…');
      }
      renderHistory();
    }

    applyLocalization();
    updateHud();

    if (!detachLocale && localization && typeof localization.onChange === 'function'){
      try {
        detachLocale = localization.onChange(() => {
          applyLocalization();
          updateHud();
        });
      } catch {}
    }

    return {
      start(){
        startLoop();
        setTimeout(() => {
          if (input && typeof input.focus === 'function'){
            input.focus({ preventScroll: true });
          }
        }, 50);
      },
      stop(){
        stopLoop();
      },
      destroy(){
        stopLoop();
        form.removeEventListener('submit', formSubmitHandler);
        window.removeEventListener('keydown', keyHandler, keyHandlerOptions);
        if (detachLocale){
          try { detachLocale(); } catch {}
          detachLocale = null;
        }
        if (wrapper.parentNode){
          wrapper.parentNode.removeChild(wrapper);
        }
      },
      getScore(){
        return Number(state.totalXp.toFixed(2));
      }
    };
  }

  window.registerMiniGame({
    id: GAME_ID,
    name: GAME_NAME,
    nameKey: 'selection.miniexp.games.calc_combo.name',
    description: '暗算を連続で決めてコンボEXPを稼ぐ高速計算チャレンジ',
    descriptionKey: 'selection.miniexp.games.calc_combo.description',
    categoryIds: ['puzzle'],
    create
  });
})();

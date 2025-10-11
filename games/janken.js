(function(){
  /** MiniExp: じゃんけん10EXP
   *  - Classic rock-paper-scissors vs CPU
   *  - Win rounds to earn 10 EXP apiece
   */
  function create(root, awardXp, opts){
    const localization = opts?.localization || (typeof window !== 'undefined' && typeof window.createMiniGameLocalization === 'function'
      ? window.createMiniGameLocalization({ id: 'janken' })
      : null);
    const text = (key, fallback, params) => {
      try {
        if (localization && typeof localization.t === 'function'){
          return localization.t(key, fallback, params);
        }
      } catch (error) {
        console.warn('[MiniExp:Janken] Failed to translate key:', key, error);
      }
      if (typeof fallback === 'function'){
        try { return fallback(); } catch { return ''; }
      }
      return fallback ?? '';
    };
    const formatNumber = (value, options) => {
      try {
        if (localization && typeof localization.formatNumber === 'function'){
          return localization.formatNumber(value, options);
        }
      } catch (error) {
        console.warn('[MiniExp:Janken] Failed to format number:', value, error);
      }
      try {
        const locale = localization?.getLocale?.();
        return new Intl.NumberFormat(locale || undefined, options).format(value);
      } catch {}
      return String(value ?? '');
    };
    const resolveParams = (params) => {
      if (typeof params === 'function'){
        try { return params(); } catch { return undefined; }
      }
      return params;
    };
    function createCard(){
      const card = document.createElement('div');
      card.style.background = 'rgba(2,6,23,0.92)';
      card.style.borderRadius = '12px';
      card.style.padding = '16px';
      card.style.boxShadow = '0 12px 24px rgba(2,6,23,0.55)';
      card.style.display = 'grid';
      card.style.gap = '10px';
      return card;
    }

    const CHOICES = [
      { key: 'choices.rock', fallback: 'グー' },
      { key: 'choices.scissors', fallback: 'チョキ' },
      { key: 'choices.paper', fallback: 'パー' },
    ];

    const CHANT_SEQUENCE = [
      { key: 'chant.step1', fallback: '最初はグー…' },
      { key: 'chant.step2', fallback: 'じゃんけん…' },
      { key: 'chant.step3', fallback: 'ぽん！' },
    ];

    const wrapper = document.createElement('div');
    wrapper.style.display = 'grid';
    wrapper.style.gap = '16px';
    wrapper.style.fontFamily = 'system-ui, sans-serif';
    wrapper.style.color = '#e2e8f0';
    wrapper.style.maxWidth = '420px';
    wrapper.style.margin = '0 auto';

    const titleCard = createCard();
    titleCard.style.padding = '14px 16px';
    const title = document.createElement('div');
    title.style.fontSize = '1.3rem';
    title.style.fontWeight = '600';
    title.textContent = text('title', 'じゃんけん 10EXP');
    const subtitle = document.createElement('div');
    subtitle.style.fontSize = '0.85rem';
    subtitle.style.opacity = '0.75';
    subtitle.textContent = text('subtitle', '3連勝以上でボーナスEXP！');
    titleCard.appendChild(title);
    titleCard.appendChild(subtitle);

    const controlCard = createCard();
    const statusLabel = document.createElement('div');
    statusLabel.style.fontSize = '0.95rem';
    statusLabel.textContent = text('status.prompt', '手を選ぶと掛け声が始まるよ');
    const buttonRow = document.createElement('div');
    buttonRow.style.display = 'flex';
    buttonRow.style.gap = '10px';

    const buttons = [];
    CHOICES.forEach((choice, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = text(choice.key, choice.fallback);
      btn.style.flex = '1';
      btn.style.padding = '12px';
      btn.style.borderRadius = '8px';
      btn.style.border = 'none';
      btn.style.fontWeight = '600';
      btn.style.cursor = 'pointer';
      btn.style.background = 'linear-gradient(135deg, #1e293b, #0f172a)';
      btn.style.color = '#e2e8f0';
      btn.dataset.bg = btn.style.background;
      btn.addEventListener('mouseenter', () => {
        if (btn.disabled) return;
        btn.style.background = 'linear-gradient(135deg, #334155, #1e293b)';
      });
      btn.addEventListener('mouseleave', () => {
        if (btn.disabled) return;
        btn.style.background = btn.dataset.bg;
      });
      btn.addEventListener('click', () => play(idx));
      buttons.push(btn);
      buttonRow.appendChild(btn);
    });
    controlCard.appendChild(statusLabel);
    controlCard.appendChild(buttonRow);

    const logCard = createCard();
    const logTitle = document.createElement('div');
    logTitle.style.fontSize = '0.9rem';
    logTitle.style.opacity = '0.75';
    logTitle.textContent = text('log.title', '直近の結果');
    const log = document.createElement('div');
    log.style.minHeight = '48px';
    log.textContent = text('log.intro', '勝てば10EXP！');
    const historyList = document.createElement('ul');
    historyList.style.listStyle = 'none';
    historyList.style.margin = '0';
    historyList.style.padding = '0';
    historyList.style.display = 'grid';
    historyList.style.gap = '4px';
    logCard.appendChild(logTitle);
    logCard.appendChild(log);
    logCard.appendChild(historyList);

    const statsCard = createCard();
    const statsPrimary = document.createElement('div');
    statsPrimary.style.fontSize = '0.95rem';
    const statsSecondary = document.createElement('div');
    statsSecondary.style.fontSize = '0.85rem';
    statsSecondary.style.opacity = '0.8';
    statsCard.appendChild(statsPrimary);
    statsCard.appendChild(statsSecondary);

    wrapper.appendChild(titleCard);
    wrapper.appendChild(controlCard);
    wrapper.appendChild(logCard);
    wrapper.appendChild(statsCard);
    root.appendChild(wrapper);

    const historyRecords = [];
    let statusState = { key: 'status.prompt', fallback: '手を選ぶと掛け声が始まるよ', params: null };
    let detachLocale = null;
    let wins = 0;
    let losses = 0;
    let ties = 0;
    let streak = 0;
    let bestStreak = 0;
    let roundCount = 0;
    let isResolving = false;
    let lastPlayerChoice = null;

    function choiceLabel(index){
      const def = CHOICES[index] || {};
      return text(def.key, def.fallback);
    }

    function choiceFallback(index){
      return CHOICES[index]?.fallback ?? '';
    }

    function applyStatus(){
      const params = resolveParams(statusState.params);
      statusLabel.textContent = text(statusState.key, statusState.fallback, params);
    }

    function setStatus(key, fallback, params){
      statusState = { key, fallback, params: params ?? null };
      applyStatus();
    }

    function createHistoryRecord({ round, messageKey, messageFallback, params }){
      return { round, messageKey, messageFallback, params };
    }

    function resolveHistoryMessage(record){
      if (!record) return '';
      const params = resolveParams(record.params);
      return text(record.messageKey, record.messageFallback, params);
    }

    function resolveHistoryEntry(record){
      if (!record) return '';
      const message = resolveHistoryMessage(record);
      const fallback = () => `[第${record.round}戦] ${record.messageFallback()}`;
      const params = {
        round: formatNumber(record.round),
        message,
      };
      return text('log.entry', fallback, params);
    }

    function renderHistory(){
      while (historyList.firstChild){
        historyList.removeChild(historyList.firstChild);
      }
      if (historyRecords.length === 0){
        log.textContent = text('log.intro', '勝てば10EXP！');
        return;
      }
      historyRecords.forEach((record) => {
        const li = document.createElement('li');
        li.textContent = resolveHistoryEntry(record);
        li.style.fontSize = '0.82rem';
        li.style.opacity = '0.85';
        historyList.appendChild(li);
      });
      log.textContent = resolveHistoryEntry(historyRecords[0]);
    }

    function attachLocaleListener(){
      if (!detachLocale && localization && typeof localization.onChange === 'function'){
        detachLocale = localization.onChange(() => {
          try {
            applyStaticTexts();
          } catch (error) {
            console.warn('[MiniExp:Janken] Failed to refresh locale:', error);
          }
        });
      }
    }

    function detachLocaleListener(){
      if (detachLocale){
        try { detachLocale(); } catch {}
        detachLocale = null;
      }
    }

    function applyStaticTexts(){
      title.textContent = text('title', 'じゃんけん 10EXP');
      subtitle.textContent = text('subtitle', '3連勝以上でボーナスEXP！');
      logTitle.textContent = text('log.title', '直近の結果');
      buttons.forEach((btn, idx) => {
        const choice = CHOICES[idx];
        if (!choice) return;
        btn.textContent = text(choice.key, choice.fallback);
      });
      applyStatus();
      updateStats();
      renderHistory();
    }

    applyStaticTexts();
    attachLocaleListener();

    const timers = new Set();
    const BEATS = [1,2,0];
    const BEATEN_BY = [2,0,1];
    const CHANT_INTERVAL = 260;

    function setGameTimeout(fn, delay){
      const id = setTimeout(() => {
        timers.delete(id);
        fn();
      }, delay);
      timers.add(id);
      return id;
    }

    function clearTimers(){
      timers.forEach(id => clearTimeout(id));
      timers.clear();
    }

    function updateStats(){
      const total = wins + losses + ties;
      const winRate = total ? Math.round((wins / total) * 100) : 0;
      statsPrimary.textContent = text(
        'stats.primary',
        () => `勝ち: ${wins}／負け: ${losses}／あいこ: ${ties}`,
        {
          wins: formatNumber(wins),
          losses: formatNumber(losses),
          ties: formatNumber(ties),
        }
      );
      statsSecondary.textContent = text(
        'stats.secondary',
        () => `連勝: ${streak}（最高 ${bestStreak}）／勝率: ${winRate}%`,
        {
          streak: formatNumber(streak),
          best: formatNumber(bestStreak),
          winRate: formatNumber(winRate),
        }
      );
    }

    function setButtonsDisabled(disabled){
      buttons.forEach(btn => {
        btn.disabled = disabled;
        btn.style.cursor = disabled ? 'default' : 'pointer';
        btn.style.opacity = disabled ? '0.7' : '1';
      });
    }

    function highlightButton(index){
      buttons.forEach((btn, idx) => {
        if (idx === index){
          btn.style.background = 'linear-gradient(135deg, #facc15, #eab308)';
          btn.style.color = '#111827';
          btn.style.boxShadow = '0 0 0 2px rgba(250,204,21,0.75)';
        } else {
          btn.style.background = btn.dataset.bg;
          btn.style.color = '#e2e8f0';
          btn.style.boxShadow = 'none';
        }
      });
    }

    function clearHighlights(){
      buttons.forEach(btn => {
        btn.style.background = btn.dataset.bg;
        btn.style.color = '#e2e8f0';
        btn.style.boxShadow = 'none';
      });
    }

    function pushHistory(record){
      if (!record) return;
      historyRecords.unshift(record);
      if (historyRecords.length > 6){
        historyRecords.length = 6;
      }
      renderHistory();
    }

    function play(player){
      if (isResolving) return;
      isResolving = true;
      setButtonsDisabled(true);
      highlightButton(player);
      const firstStep = CHANT_SEQUENCE[0];
      if (firstStep){
        setStatus(firstStep.key, firstStep.fallback);
      }
      let step = 1;

      function continueChant(){
        if (step < CHANT_SEQUENCE.length){
          const sequence = CHANT_SEQUENCE[step];
          if (sequence){
            setStatus(sequence.key, sequence.fallback);
          }
          step += 1;
          setGameTimeout(continueChant, CHANT_INTERVAL);
        } else {
          setGameTimeout(() => resolveRound(player), 140);
        }
      }

      setGameTimeout(continueChant, CHANT_INTERVAL);
    }

    function resolveRound(player){
      const cpu = pickCpuChoice(player);
      lastPlayerChoice = player;
      roundCount += 1;

      const result = judge(player, cpu);
      let xpGain = 0;
      let bonus = 0;
      let messageKey = null;
      let messageFallback = null;
      let messageParamsFactory = null;

      if (result === 'win'){
        wins += 1;
        streak += 1;
        bestStreak = Math.max(bestStreak, streak);
        xpGain = 10;
        if (streak >= 7) bonus = 15;
        else if (streak >= 5) bonus = 8;
        else if (streak >= 3) bonus = 4;
        if (bonus > 0){
          xpGain += bonus;
        }
        const payload = { reason: bonus > 0 ? 'streak-win' : 'win', gameId: 'janken', streak };
        if (bonus > 0) payload.bonus = bonus;
        awardXp(xpGain, payload);
        messageKey = 'messages.win';
        messageFallback = () => `勝ち！あなた=${choiceFallback(player)}／相手=${choiceFallback(cpu)} → ${xpGain}EXP`;
        messageParamsFactory = () => ({
          player: choiceLabel(player),
          cpu: choiceLabel(cpu),
          xp: formatNumber(xpGain),
        });
        if (streak >= 2){
          setStatus('status.winStreak', () => `連勝${streak}！次は？`, () => ({ streak: formatNumber(streak) }));
        } else {
          setStatus('status.winNext', 'ナイス！次の手を選んでね');
        }
      } else if (result === 'lose'){
        losses += 1;
        streak = 0;
        messageKey = 'messages.lose';
        messageFallback = () => `負け… あなた=${choiceFallback(player)}／相手=${choiceFallback(cpu)}`;
        messageParamsFactory = () => ({
          player: choiceLabel(player),
          cpu: choiceLabel(cpu),
        });
        setStatus('status.lose', '切り替えて次こそ勝とう！');
      } else {
        ties += 1;
        messageKey = 'messages.tie';
        messageFallback = () => `あいこ：${choiceFallback(player)} vs ${choiceFallback(cpu)} もう一度！`;
        messageParamsFactory = () => ({
          player: choiceLabel(player),
          cpu: choiceLabel(cpu),
        });
        setStatus('status.tie', 'あいこ！そのままもう一度');
      }

      pushHistory(createHistoryRecord({
        round: roundCount,
        messageKey: messageKey || '',
        messageFallback: messageFallback || (() => ''),
        params: messageParamsFactory,
      }));
      updateStats();

      clearHighlights();
      isResolving = false;
      setButtonsDisabled(false);
    }

    function pickCpuChoice(playerChoice){
      const counter = BEATEN_BY[playerChoice];
      const mimic = lastPlayerChoice;
      const bias = Math.min(0.32, streak * 0.05);
      const mimicChance = mimic == null ? 0 : 0.18;
      const roll = Math.random();
      if (roll < bias) return counter;
      if (roll < bias + mimicChance) return mimic;
      if (streak >= 4 && Math.random() < 0.18) return BEATS[playerChoice];
      return Math.floor(Math.random() * 3);
    }

    function judge(player, cpu){
      if (player === cpu) return 'tie';
      if (BEATS[player] === cpu) return 'win';
      return 'lose';
    }

    updateStats();

    function resetInteractionState(){
      clearTimers();
      if (isResolving){
        isResolving = false;
      }
      setButtonsDisabled(false);
      clearHighlights();
    }

    function start(){
      resetInteractionState();
      setStatus('status.prompt', '手を選ぶと掛け声が始まるよ');
    }
    function stop(){
      resetInteractionState();
      setStatus('status.paused', '一時停止中');
    }
    function destroy(){
      stop();
      detachLocaleListener();
      try { wrapper.remove(); } catch {}
    }
    function getScore(){ return wins * 10; }

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({ id: 'janken', name: 'じゃんけん', nameKey: 'selection.miniexp.games.janken.name', description: '勝利で10EXP', descriptionKey: 'selection.miniexp.games.janken.description', categoryIds: ['toy'], create });
})();

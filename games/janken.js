(function(){
  /** MiniExp: じゃんけん10EXP
   *  - Classic rock-paper-scissors vs CPU
   *  - Win rounds to earn 10 EXP apiece
   */
  function create(root, awardXp){
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
    title.textContent = 'じゃんけん 10EXP';
    const subtitle = document.createElement('div');
    subtitle.style.fontSize = '0.85rem';
    subtitle.style.opacity = '0.75';
    subtitle.textContent = '3連勝以上でボーナスEXP！';
    titleCard.appendChild(title);
    titleCard.appendChild(subtitle);

    const controlCard = createCard();
    const statusLabel = document.createElement('div');
    statusLabel.style.fontSize = '0.95rem';
    statusLabel.textContent = '手を選ぶと掛け声が始まるよ';
    const buttonRow = document.createElement('div');
    buttonRow.style.display = 'flex';
    buttonRow.style.gap = '10px';

    const buttons = [];
    ['グー','チョキ','パー'].forEach((label, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
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
    logTitle.textContent = '直近の結果';
    const log = document.createElement('div');
    log.style.minHeight = '48px';
    log.textContent = '勝てば10EXP！';
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

    const timers = new Set();
    const BEATS = [1,2,0];
    const BEATEN_BY = [2,0,1];
    const CHANT_STEPS = ['最初はグー…', 'じゃんけん…', 'ぽん！'];
    const CHANT_INTERVAL = 260;

    let wins = 0;
    let losses = 0;
    let ties = 0;
    let streak = 0;
    let bestStreak = 0;
    let roundCount = 0;
    let isResolving = false;
    let lastPlayerChoice = null;

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
      statsPrimary.textContent = `勝ち: ${wins}／負け: ${losses}／あいこ: ${ties}`;
      const total = wins + losses + ties;
      const winRate = total ? Math.round((wins / total) * 100) : 0;
      statsSecondary.textContent = `連勝: ${streak}（最高 ${bestStreak}）／勝率: ${winRate}%`;
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

    function pushHistory(entry){
      const li = document.createElement('li');
      li.textContent = entry;
      li.style.fontSize = '0.82rem';
      li.style.opacity = '0.85';
      historyList.prepend(li);
      while (historyList.children.length > 6){
        historyList.removeChild(historyList.lastChild);
      }
    }

    function play(player){
      if (isResolving) return;
      isResolving = true;
      setButtonsDisabled(true);
      highlightButton(player);
      statusLabel.textContent = CHANT_STEPS[0];
      let step = 1;

      function continueChant(){
        if (step < CHANT_STEPS.length){
          statusLabel.textContent = CHANT_STEPS[step];
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
      let message = '';
      let xpGain = 0;
      let bonus = 0;

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
        message = `勝ち！あなた=${labelOf(player)}／相手=${labelOf(cpu)} → ${xpGain}EXP`;
        statusLabel.textContent = streak >= 2 ? `連勝${streak}！次は？` : 'ナイス！次の手を選んでね';
      } else if (result === 'lose'){
        losses += 1;
        streak = 0;
        message = `負け… あなた=${labelOf(player)}／相手=${labelOf(cpu)}`;
        statusLabel.textContent = '切り替えて次こそ勝とう！';
      } else {
        ties += 1;
        message = `あいこ：${labelOf(player)} vs ${labelOf(cpu)} もう一度！`;
        statusLabel.textContent = 'あいこ！そのままもう一度';
      }

      const historyEntry = `[第${roundCount}戦] ${message}`;
      log.textContent = historyEntry;
      pushHistory(historyEntry);
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

    function labelOf(index){
      return index === 0 ? 'グー' : index === 1 ? 'チョキ' : 'パー';
    }

    updateStats();

    function start(){}
    function stop(){
      clearTimers();
      if (isResolving){
        isResolving = false;
        setButtonsDisabled(false);
        clearHighlights();
        statusLabel.textContent = '一時停止中';
      }
    }
    function destroy(){
      stop();
      try { wrapper.remove(); } catch {}
    }
    function getScore(){ return wins * 10; }

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({ id: 'janken', name: 'じゃんけん', nameKey: 'selection.miniexp.games.janken.name', description: '勝利で10EXP', descriptionKey: 'selection.miniexp.games.janken.description', categoryIds: ['toy'], create });
})();

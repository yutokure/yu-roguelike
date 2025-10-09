(function(){
  /** MiniExp: あっち向いてホイ
   *  - First win Rock-Paper-Scissors, then point/avoid directions
   *  - Player attack win: +15 EXP, successful dodge as defender: +5 EXP
   */
  function create(root, awardXp, options = {}){
    function createCard(){
      const card = document.createElement('div');
      card.style.background = 'rgba(2,6,23,0.92)';
      card.style.borderRadius = '12px';
      card.style.padding = '16px';
      card.style.boxShadow = '0 12px 24px rgba(2,6,23,0.55)';
      card.style.display = 'grid';
      card.style.gap = '8px';
      return card;
    }

    const wrapper = document.createElement('div');
    wrapper.style.display = 'grid';
    wrapper.style.gap = '16px';
    wrapper.style.fontFamily = 'system-ui, sans-serif';
    wrapper.style.color = '#e2e8f0';
    wrapper.style.maxWidth = '480px';
    wrapper.style.margin = '0 auto';

    const flowCard = createCard();
    const stageTitle = document.createElement('div');
    stageTitle.style.fontSize = '1.2rem';
    stageTitle.style.fontWeight = '600';
    const statusLabel = document.createElement('div');
    statusLabel.style.fontSize = '0.95rem';
    const countdownLabel = document.createElement('div');
    countdownLabel.style.fontSize = '0.85rem';
    countdownLabel.style.opacity = '0.85';
    countdownLabel.style.color = '#cbd5f5';
    flowCard.appendChild(stageTitle);
    flowCard.appendChild(statusLabel);
    flowCard.appendChild(countdownLabel);

    const rpsCard = createCard();
    const rpsTitle = document.createElement('div');
    rpsTitle.style.fontSize = '0.95rem';
    rpsTitle.style.opacity = '0.75';
    const rpsRow = document.createElement('div');
    rpsRow.style.display = 'flex';
    rpsRow.style.gap = '10px';
    const rpsHint = document.createElement('div');
    rpsHint.style.fontSize = '0.8rem';
    rpsHint.style.opacity = '0.7';
    rpsCard.appendChild(rpsTitle);
    rpsCard.appendChild(rpsRow);
    rpsCard.appendChild(rpsHint);

    const directionCard = createCard();
    directionCard.style.display = 'none';
    const directionTitle = document.createElement('div');
    directionTitle.style.fontSize = '0.95rem';
    directionTitle.style.opacity = '0.75';
    const directionRow = document.createElement('div');
    directionRow.style.display = 'grid';
    directionRow.style.gridTemplateColumns = 'repeat(3, 72px)';
    directionRow.style.gap = '8px';
    directionRow.style.justifyContent = 'center';
    const directionHint = document.createElement('div');
    directionHint.style.fontSize = '0.8rem';
    directionHint.style.opacity = '0.7';
    directionCard.appendChild(directionTitle);
    directionCard.appendChild(directionRow);
    directionCard.appendChild(directionHint);

    const scoreCard = createCard();
    const scorePrimary = document.createElement('div');
    scorePrimary.style.fontSize = '0.95rem';
    const scoreSecondary = document.createElement('div');
    scoreSecondary.style.fontSize = '0.85rem';
    scoreSecondary.style.opacity = '0.85';
    const scoreTertiary = document.createElement('div');
    scoreTertiary.style.fontSize = '0.8rem';
    scoreTertiary.style.opacity = '0.75';
    scoreCard.appendChild(scorePrimary);
    scoreCard.appendChild(scoreSecondary);
    scoreCard.appendChild(scoreTertiary);

    const logCard = createCard();
    const logTitle = document.createElement('div');
    logTitle.style.fontSize = '0.9rem';
    logTitle.style.opacity = '0.75';
    const logList = document.createElement('ul');
    logList.style.listStyle = 'none';
    logList.style.margin = '0';
    logList.style.padding = '0';
    logList.style.maxHeight = '160px';
    logList.style.overflow = 'auto';
    logList.style.display = 'grid';
    logList.style.gap = '4px';
    logCard.appendChild(logTitle);
    logCard.appendChild(logList);

    wrapper.appendChild(flowCard);
    wrapper.appendChild(rpsCard);
    wrapper.appendChild(directionCard);
    wrapper.appendChild(scoreCard);
    wrapper.appendChild(logCard);
    root.appendChild(wrapper);

    const directionLimit = 1.8;
    const localization = options?.localization || null;
    const cleanupCallbacks = [];
    const logEntries = [];

    const evaluateFallback = (fallback) => {
      if (typeof fallback === 'function') {
        try {
          return fallback();
        } catch (error) {
          console.warn('[MiniExp][acchimuitehoi] Failed to evaluate fallback text', error);
          return '';
        }
      }
      return fallback ?? '';
    };

    const resolveParams = (params) => {
      if (typeof params === 'function') {
        try {
          return params();
        } catch (error) {
          console.warn('[MiniExp][acchimuitehoi] Failed to resolve params', error);
          return undefined;
        }
      }
      return params;
    };

    const formatNumber = (value, options) => {
      if (localization && typeof localization.formatNumber === 'function') {
        try {
          return localization.formatNumber(value, options);
        } catch (error) {
          console.warn('[MiniExp][acchimuitehoi] Failed to format number', error);
        }
      }
      if (typeof value === 'number') {
        try {
          return new Intl.NumberFormat(undefined, options).format(value);
        } catch {}
        return String(value);
      }
      return String(value ?? '');
    };

    function t(key, fallback, params){
      const resolvedParams = resolveParams(params);
      if (localization && typeof localization.t === 'function') {
        try {
          return localization.t(key, fallback, resolvedParams);
        } catch (error) {
          console.warn('[MiniExp][acchimuitehoi] Failed to translate key:', key, error);
        }
      }
      return evaluateFallback(fallback);
    }

    const stageTitleState = { key: 'ui.stage.rps', fallback: 'じゃんけんで攻守を決めよう', params: null };
    const statusState = { key: 'status.ready', fallback: '手を選んでミニゲーム開始！', params: null };

    function applyStageTitle(){
      stageTitle.textContent = t(stageTitleState.key, stageTitleState.fallback, stageTitleState.params);
    }

    function setStageTitle(key, fallback, params){
      stageTitleState.key = key;
      stageTitleState.fallback = fallback;
      stageTitleState.params = params || null;
      applyStageTitle();
    }

    function applyStatus(){
      statusLabel.textContent = t(statusState.key, statusState.fallback, statusState.params);
    }

    function setStatus(key, fallback, params){
      statusState.key = key;
      statusState.fallback = fallback;
      statusState.params = params || null;
      applyStatus();
    }

    function setCountdownIdle(){
      countdownLabel.textContent = t('countdown.idle', '残り --.- 秒');
      countdownLabel.style.color = '#cbd5f5';
    }

    function updateInstructionTexts(){
      rpsTitle.textContent = t('instructions.rpsTitle', '1. じゃんけんで攻守決定');
      rpsHint.textContent = t('instructions.rpsHint', '勝ったら攻め、負けたら防御');
      directionTitle.textContent = t('instructions.directionTitle', '2. あっち向いてホイ');
      const limitLabel = () => formatNumber(directionLimit, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
      directionHint.textContent = t('instructions.directionHint', () => `制限時間 ${limitLabel()} 秒以内に方向を選択`, () => ({ seconds: limitLabel() }));
      logTitle.textContent = t('instructions.logTitle', '戦況ログ');
    }

    function updateRpsButtonLabels(){
      buttons.rock.textContent = getHandLabel('rock');
      buttons.scissors.textContent = getHandLabel('scissors');
      buttons.paper.textContent = getHandLabel('paper');
    }

    let state = 'rps';
    let attacker = null; // 'player' | 'cpu'
    let playerWins = 0;
    let successfulDodges = 0;
    let rounds = 0;
    let attackStreak = 0;
    let bestAttackStreak = 0;
    let defenseStreak = 0;
    let bestDefenseStreak = 0;
    let directionTimeoutId = null;
    let directionIntervalId = null;
    let directionDeadline = 0;

    const buttons = {
      rock: createButton(''),
      scissors: createButton(''),
      paper: createButton('')
    };
    rpsRow.appendChild(buttons.rock);
    rpsRow.appendChild(buttons.scissors);
    rpsRow.appendChild(buttons.paper);

    const dirButtons = {
      up: createButton('↑'),
      left: createButton('←'),
      down: createButton('↓'),
      right: createButton('→')
    };
    directionRow.appendChild(document.createElement('span'));
    directionRow.appendChild(dirButtons.up);
    directionRow.appendChild(document.createElement('span'));
    directionRow.appendChild(dirButtons.left);
    directionRow.appendChild(dirButtons.down);
    directionRow.appendChild(dirButtons.right);

    Object.entries(buttons).forEach(([key, btn]) => {
      btn.addEventListener('click', () => {
        if (state !== 'rps') return;
        flashButton(btn, 'accent');
        handleRps(key);
      });
    });

    dirButtons.up.addEventListener('click', () => handleDirectionInput('up'));
    dirButtons.down.addEventListener('click', () => handleDirectionInput('down'));
    dirButtons.left.addEventListener('click', () => handleDirectionInput('left'));
    dirButtons.right.addEventListener('click', () => handleDirectionInput('right'));

    updateInstructionTexts();
    updateRpsButtonLabels();
    setStatus('status.ready', '手を選んでミニゲーム開始！');
    setStageTitle('ui.stage.rps', 'じゃんけんで攻守を決めよう');
    setCountdownIdle();
    updateScore();
    updateUI();
    renderLogs();

    if (localization && typeof localization.onChange === 'function') {
      const unsubscribe = localization.onChange(() => {
        updateInstructionTexts();
        updateRpsButtonLabels();
        applyStageTitle();
        applyStatus();
        updateScore();
        updateCountdownLabel();
        renderLogs();
      });
      if (typeof unsubscribe === 'function') cleanupCallbacks.push(unsubscribe);
    }

    function createButton(label){
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
      btn.style.flex = '1';
      btn.style.padding = '12px';
      btn.style.borderRadius = '10px';
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
        btn.style.background = btn.dataset.bg;
        btn.style.color = '#e2e8f0';
      });
      return btn;
    }

    function flashButton(btn, tone){
      const prevBg = btn.style.background;
      const prevColor = btn.style.color;
      let startColor = '#facc15';
      let endColor = '#eab308';
      if (tone === 'defense'){
        startColor = '#38bdf8';
        endColor = '#0ea5e9';
      }
      if (tone === 'alert'){
        startColor = '#f87171';
        endColor = '#ef4444';
      }
      btn.style.background = `linear-gradient(135deg, ${startColor}, ${endColor})`;
      btn.style.color = '#111827';
      setTimeout(() => {
        if (!btn.isConnected) return;
        btn.style.background = btn.dataset.bg;
        btn.style.color = '#e2e8f0';
      }, 260);
    }

    function updateScore(){
      const attackWinsLabel = formatNumber(playerWins);
      const dodgeLabel = formatNumber(successfulDodges);
      scorePrimary.textContent = t('score.primary', () => `攻め成功: ${attackWinsLabel}／防御成功: ${dodgeLabel}`, () => ({
        attackWins: attackWinsLabel,
        defenseWins: dodgeLabel
      }));
      const attackStreakLabel = formatNumber(attackStreak);
      const bestAttackLabel = formatNumber(bestAttackStreak);
      const defenseStreakLabel = formatNumber(defenseStreak);
      const bestDefenseLabel = formatNumber(bestDefenseStreak);
      scoreSecondary.textContent = t('score.secondary', () => `攻め連続: ${attackStreakLabel}（最高 ${bestAttackLabel}）／防御連続: ${defenseStreakLabel}（最高 ${bestDefenseLabel}）`, () => ({
        attackStreak: attackStreakLabel,
        bestAttackStreak: bestAttackLabel,
        defenseStreak: defenseStreakLabel,
        bestDefenseStreak: bestDefenseLabel
      }));
      const successTotal = playerWins + successfulDodges;
      if (rounds > 0){
        const successRate = Math.round((successTotal / rounds) * 100);
        const roundsLabel = formatNumber(rounds);
        const rateLabel = formatNumber(successRate);
        scoreTertiary.textContent = t('score.tertiaryWithRate', () => `決着数: ${roundsLabel}／成功率: ${rateLabel}%`, () => ({
          rounds: roundsLabel,
          successRate: rateLabel
        }));
      } else {
        scoreTertiary.textContent = t('score.tertiaryEmpty', '決着数: 0／成功率: --%');
      }
    }

    function updateUI(){
      directionCard.style.display = state === 'direction' ? 'grid' : 'none';
      rpsRow.style.opacity = state === 'rps' ? '1' : '0.4';
      Object.values(buttons).forEach(btn => btn.disabled = state !== 'rps');
      Object.values(dirButtons).forEach(btn => btn.disabled = state !== 'direction');
      if (state === 'rps'){
        setStageTitle('ui.stage.rps', 'じゃんけんで攻守を決めよう');
      } else if (attacker === 'player'){
        setStageTitle('ui.stage.attack', '攻撃フェーズ：指す方向を素早く選ぼう');
      } else {
        setStageTitle('ui.stage.defense', '防御フェーズ：相手と違う方向を素早く選ぼう');
      }
      updateCountdownLabel();
    }

    function handleRps(playerChoice){
      const cpuChoice = randomRps();
      if (playerChoice === cpuChoice){
        setStatus('status.tie', () => `あいこで ${getHandLabel(cpuChoice)}！もう一度`, () => ({ hand: getHandLabel(cpuChoice) }));
        pushLogEntry('log.tie', 'あいこ続行');
        return;
      }
      const playerWinsRound =
        (playerChoice === 'rock' && cpuChoice === 'scissors') ||
        (playerChoice === 'scissors' && cpuChoice === 'paper') ||
        (playerChoice === 'paper' && cpuChoice === 'rock');
      attacker = playerWinsRound ? 'player' : 'cpu';
      state = 'direction';
      const role = playerWinsRound ? 'attack' : 'defense';
      const roleLabel = getRoleLabel(role);
      setStatus(
        playerWinsRound ? 'status.playerWin' : 'status.cpuWin',
        playerWinsRound
          ? 'あなたの勝ち！制限内に指す方向を選んでヒットを狙おう'
          : '相手が攻め！制限内に別方向を選んで回避'
      );
      pushLogEntry('log.rpsResult', () => `じゃんけん結果: あなた=${getHandLabel(playerChoice)}／相手=${getHandLabel(cpuChoice)} → ${roleLabel}`, () => ({
        playerHand: getHandLabel(playerChoice),
        cpuHand: getHandLabel(cpuChoice),
        role: roleLabel
      }));
      updateUI();
      startDirectionCountdown();
    }

    function handleDirectionInput(dir){
      if (state !== 'direction') return;
      const btn = dir === 'up' ? dirButtons.up : dir === 'down' ? dirButtons.down : dir === 'left' ? dirButtons.left : dirButtons.right;
      flashButton(btn, attacker === 'player' ? 'accent' : 'defense');
      resolveDirection(dir);
    }

    function resolveDirection(playerDir){
      if (state !== 'direction') return;
      const cpuDir = randomDirection();
      clearDirectionCountdown();
      rounds += 1;

      if (attacker === 'player'){
        const match = playerDir === cpuDir;
        if (match){
          attackStreak += 1;
          defenseStreak = 0;
          bestAttackStreak = Math.max(bestAttackStreak, attackStreak);
          let xp = 15;
          let bonus = 0;
          if (attackStreak >= 3 && attackStreak % 3 === 0){
            bonus = 5;
            xp += bonus;
          }
          const payload = { reason: bonus ? 'attack-streak' : 'attacker-win', gameId: 'acchimuitehoi', streak: attackStreak };
          if (bonus > 0) payload.bonus = bonus;
          awardXp(xp, payload);
          playerWins += 1;
          const xpLabel = formatNumber(xp);
          if (bonus){
            const streakLabel = formatNumber(attackStreak);
            setStatus('status.attack.hitBonus', () => `ヒット！${getDirectionLabel(playerDir)}で${xpLabel}EXP（連続${streakLabel}）`, () => ({
              direction: getDirectionLabel(playerDir),
              exp: xpLabel,
              streak: streakLabel
            }));
          } else {
            setStatus('status.attack.hit', () => `ヒット！${getDirectionLabel(playerDir)}で${xpLabel}EXP`, () => ({
              direction: getDirectionLabel(playerDir),
              exp: xpLabel
            }));
          }
          pushLogEntry('log.attackSuccess', () => `攻め成功：CPUは${getDirectionLabel(cpuDir)} → ${xpLabel}EXP`, () => ({
            cpuDirection: getDirectionLabel(cpuDir),
            exp: xpLabel
          }));
        } else {
          attackStreak = 0;
          setStatus('status.attack.miss', () => `外した…CPUは${getDirectionLabel(cpuDir)}を向いた`, () => ({
            cpuDirection: getDirectionLabel(cpuDir)
          }));
          pushLogEntry('log.attackFail', () => `攻め失敗：CPU ${getDirectionLabel(cpuDir)}／あなた ${getDirectionLabel(playerDir)}`, () => ({
            cpuDirection: getDirectionLabel(cpuDir),
            playerDirection: getDirectionLabel(playerDir)
          }));
        }
      } else {
        const avoided = playerDir !== cpuDir;
        if (avoided){
          defenseStreak += 1;
          attackStreak = 0;
          bestDefenseStreak = Math.max(bestDefenseStreak, defenseStreak);
          let xp = 5;
          let bonus = 0;
          if (defenseStreak >= 3 && defenseStreak % 3 === 0){
            bonus = 3;
            xp += bonus;
          }
          const payload = { reason: bonus ? 'defense-streak' : 'defense-success', gameId: 'acchimuitehoi', streak: defenseStreak };
          if (bonus > 0) payload.bonus = bonus;
          awardXp(xp, payload);
          successfulDodges += 1;
          const xpLabel = formatNumber(xp);
          if (bonus){
            const streakLabel = formatNumber(defenseStreak);
            setStatus('status.defense.successBonus', () => `回避成功！${getDirectionLabel(cpuDir)}を避けた（連続${streakLabel}）`, () => ({
              cpuDirection: getDirectionLabel(cpuDir),
              streak: streakLabel
            }));
          } else {
            setStatus('status.defense.success', () => `回避成功！${getDirectionLabel(cpuDir)}を避けた！${xpLabel}EXP`, () => ({
              cpuDirection: getDirectionLabel(cpuDir),
              exp: xpLabel
            }));
          }
          pushLogEntry('log.defenseSuccess', () => `防御成功：相手 ${getDirectionLabel(cpuDir)}／あなた ${getDirectionLabel(playerDir)} → ${xpLabel}EXP`, () => ({
            cpuDirection: getDirectionLabel(cpuDir),
            playerDirection: getDirectionLabel(playerDir),
            exp: xpLabel
          }));
        } else {
          defenseStreak = 0;
          setStatus('status.defense.fail', () => `回避失敗…同じ${getDirectionLabel(cpuDir)}を向いた`, () => ({
            direction: getDirectionLabel(cpuDir)
          }));
          pushLogEntry('log.defenseFail', '防御失敗：同方向でヒット');
        }
      }

      attacker = null;
      state = 'rps';
      updateScore();
      updateUI();
    }

    function startDirectionCountdown(){
      clearDirectionCountdown();
      directionDeadline = performance.now() + directionLimit * 1000;
      updateCountdownLabel();
      directionIntervalId = setInterval(updateCountdownLabel, 80);
      directionTimeoutId = setTimeout(() => {
        directionTimeoutId = null;
        handleDirectionTimeout();
      }, directionLimit * 1000);
    }

    function handleDirectionTimeout(){
      if (state !== 'direction') return;
      rounds += 1;
      clearDirectionCountdown();
      if (attacker === 'player'){
        attackStreak = 0;
        setStatus('status.attack.timeout', '時間切れ…指しそびれた');
        pushLogEntry('log.attackTimeout', '攻め時間切れ：チャンスを逃した');
      } else {
        defenseStreak = 0;
        setStatus('status.defense.timeout', '時間切れ…反応できずヒット');
        pushLogEntry('log.defenseTimeout', '防御時間切れ：反応が遅れた');
      }
      attacker = null;
      state = 'rps';
      updateScore();
      updateUI();
    }

    function clearDirectionCountdown(){
      if (directionTimeoutId != null){
        clearTimeout(directionTimeoutId);
        directionTimeoutId = null;
      }
      if (directionIntervalId != null){
        clearInterval(directionIntervalId);
        directionIntervalId = null;
      }
      setCountdownIdle();
    }

    function updateCountdownLabel(){
      if (state !== 'direction'){
        setCountdownIdle();
        return;
      }
      const remaining = Math.max(0, (directionDeadline - performance.now()) / 1000);
      const display = remaining.toFixed(1);
      countdownLabel.textContent = t('countdown.remaining', () => `残り ${display} 秒`, () => ({ seconds: display }));
      if (remaining <= 0.3){
        countdownLabel.style.color = '#fca5a5';
      } else if (remaining <= 0.7){
        countdownLabel.style.color = '#facc15';
      } else {
        countdownLabel.style.color = '#bbf7d0';
      }
    }

    function renderLogs(){
      logList.innerHTML = '';
      for (const entry of logEntries){
        const li = document.createElement('li');
        li.textContent = t(entry.key, entry.fallback, entry.params);
        li.style.fontSize = '0.82rem';
        li.style.opacity = '0.85';
        logList.appendChild(li);
      }
    }

    function pushLogEntry(key, fallback, params){
      logEntries.unshift({ key, fallback, params });
      if (logEntries.length > 8){
        logEntries.length = 8;
      }
      renderLogs();
    }

    function randomRps(){
      const values = ['rock', 'scissors', 'paper'];
      return values[Math.floor(Math.random() * values.length)];
    }

    function randomDirection(){
      const values = ['up', 'down', 'left', 'right'];
      return values[Math.floor(Math.random() * values.length)];
    }

    function getHandLabel(value){
      switch (value){
        case 'rock': return t('hands.rock', 'グー');
        case 'scissors': return t('hands.scissors', 'チョキ');
        case 'paper': return t('hands.paper', 'パー');
        default: return value;
      }
    }

    function getDirectionLabel(dir){
      switch (dir){
        case 'up': return t('direction.up', '上');
        case 'down': return t('direction.down', '下');
        case 'left': return t('direction.left', '左');
        case 'right': return t('direction.right', '右');
        default: return dir;
      }
    }

    function getRoleLabel(role){
      if (role === 'attack') return t('role.attack', '攻め');
      if (role === 'defense') return t('role.defense', '守り');
      return role;
    }

    function start(){}
    function stop(){
      clearDirectionCountdown();
      if (state === 'direction'){
        attacker = null;
        state = 'rps';
      }
      setStatus('status.paused', '一時停止中');
      updateUI();
    }
    function destroy(){
      clearDirectionCountdown();
      try { cleanupCallbacks.forEach(fn => { try { fn && fn(); } catch {} }); } catch {}
      try { wrapper.remove(); } catch {}
    }
    function getScore(){
      return playerWins * 15 + successfulDodges * 5;
    }

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({ id: 'acchimuitehoi', name: 'あっち向いてホイ', nameKey: 'selection.miniexp.games.acchimuitehoi.name', description: '攻め勝利で15EXP、防御成功で5EXP', descriptionKey: 'selection.miniexp.games.acchimuitehoi.description', categoryIds: ['toy'], create });
})();

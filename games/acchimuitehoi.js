(function(){
  /** MiniExp: あっち向いてホイ
   *  - First win Rock-Paper-Scissors, then point/avoid directions
   *  - Player attack win: +15 EXP, successful dodge as defender: +5 EXP
   */
  function create(root, awardXp){
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
    stageTitle.textContent = 'じゃんけんで攻守を決めよう';
    const statusLabel = document.createElement('div');
    statusLabel.style.fontSize = '0.95rem';
    statusLabel.textContent = '手を選んでミニゲーム開始！';
    const countdownLabel = document.createElement('div');
    countdownLabel.style.fontSize = '0.85rem';
    countdownLabel.style.opacity = '0.85';
    countdownLabel.style.color = '#cbd5f5';
    countdownLabel.textContent = '残り --.- 秒';
    flowCard.appendChild(stageTitle);
    flowCard.appendChild(statusLabel);
    flowCard.appendChild(countdownLabel);

    const rpsCard = createCard();
    const rpsTitle = document.createElement('div');
    rpsTitle.style.fontSize = '0.95rem';
    rpsTitle.style.opacity = '0.75';
    rpsTitle.textContent = '1. じゃんけんで攻守決定';
    const rpsRow = document.createElement('div');
    rpsRow.style.display = 'flex';
    rpsRow.style.gap = '10px';
    const rpsHint = document.createElement('div');
    rpsHint.style.fontSize = '0.8rem';
    rpsHint.style.opacity = '0.7';
    rpsHint.textContent = '勝ったら攻め、負けたら防御';
    rpsCard.appendChild(rpsTitle);
    rpsCard.appendChild(rpsRow);
    rpsCard.appendChild(rpsHint);

    const directionCard = createCard();
    directionCard.style.display = 'none';
    const directionTitle = document.createElement('div');
    directionTitle.style.fontSize = '0.95rem';
    directionTitle.style.opacity = '0.75';
    directionTitle.textContent = '2. あっち向いてホイ';
    const directionRow = document.createElement('div');
    directionRow.style.display = 'grid';
    directionRow.style.gridTemplateColumns = 'repeat(3, 72px)';
    directionRow.style.gap = '8px';
    directionRow.style.justifyContent = 'center';
    const directionHint = document.createElement('div');
    directionHint.style.fontSize = '0.8rem';
    directionHint.style.opacity = '0.7';
    directionHint.textContent = '制限時間 1.8 秒以内に方向を選択';
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
    logTitle.textContent = '戦況ログ';
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
      rock: createButton('グー'),
      scissors: createButton('チョキ'),
      paper: createButton('パー')
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

    updateScore();
    updateUI();

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
      scorePrimary.textContent = `攻め成功: ${playerWins}／防御成功: ${successfulDodges}`;
      scoreSecondary.textContent = `攻め連続: ${attackStreak}（最高 ${bestAttackStreak}）／防御連続: ${defenseStreak}（最高 ${bestDefenseStreak}）`;
      const successTotal = playerWins + successfulDodges;
      scoreTertiary.textContent = rounds > 0 ? `決着数: ${rounds}／成功率: ${Math.round((successTotal / rounds) * 100)}%` : '決着数: 0／成功率: --%';
    }

    function updateUI(){
      directionCard.style.display = state === 'direction' ? 'grid' : 'none';
      rpsRow.style.opacity = state === 'rps' ? '1' : '0.4';
      Object.values(buttons).forEach(btn => btn.disabled = state !== 'rps');
      Object.values(dirButtons).forEach(btn => btn.disabled = state !== 'direction');
      if (state === 'rps'){
        stageTitle.textContent = 'じゃんけんで攻守を決めよう';
      } else if (attacker === 'player'){
        stageTitle.textContent = '攻撃フェーズ：指す方向を素早く選ぼう';
      } else {
        stageTitle.textContent = '防御フェーズ：相手と違う方向を素早く選ぼう';
      }
      updateCountdownLabel();
    }

    function handleRps(playerChoice){
      const cpuChoice = randomRps();
      if (playerChoice === cpuChoice){
        statusLabel.textContent = `あいこで ${rpsToJapanese(cpuChoice)}！もう一度`; pushLog('あいこ続行');
        return;
      }
      const playerWinsRound =
        (playerChoice === 'rock' && cpuChoice === 'scissors') ||
        (playerChoice === 'scissors' && cpuChoice === 'paper') ||
        (playerChoice === 'paper' && cpuChoice === 'rock');
      attacker = playerWinsRound ? 'player' : 'cpu';
      state = 'direction';
      const roleText = playerWinsRound ? '攻め' : '守り';
      statusLabel.textContent = playerWinsRound
        ? 'あなたの勝ち！制限内に指す方向を選んでヒットを狙おう'
        : '相手が攻め！制限内に別方向を選んで回避';
      pushLog(`じゃんけん結果: あなた=${rpsToJapanese(playerChoice)}／相手=${rpsToJapanese(cpuChoice)} → ${roleText}`);
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
          statusLabel.textContent = bonus
            ? `ヒット！${dirToJapanese(playerDir)}で${xp}EXP（連続${attackStreak}）`
            : `ヒット！${dirToJapanese(playerDir)}で15EXP`;
          pushLog(`攻め成功：CPUは${dirToJapanese(cpuDir)} → ${xp}EXP`);
        } else {
          attackStreak = 0;
          statusLabel.textContent = `外した…CPUは${dirToJapanese(cpuDir)}を向いた`;
          pushLog(`攻め失敗：CPU ${dirToJapanese(cpuDir)}／あなた ${dirToJapanese(playerDir)}`);
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
          statusLabel.textContent = bonus
            ? `回避成功！${dirToJapanese(cpuDir)}を避けた（連続${defenseStreak}）`
            : `回避成功！${dirToJapanese(cpuDir)}を避けた！5EXP`;
          pushLog(`防御成功：相手 ${dirToJapanese(cpuDir)}／あなた ${dirToJapanese(playerDir)} → ${xp}EXP`);
        } else {
          defenseStreak = 0;
          statusLabel.textContent = `回避失敗…同じ${dirToJapanese(cpuDir)}を向いた`;
          pushLog('防御失敗：同方向でヒット');
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
        statusLabel.textContent = '時間切れ…指しそびれた';
        pushLog('攻め時間切れ：チャンスを逃した');
      } else {
        defenseStreak = 0;
        statusLabel.textContent = '時間切れ…反応できずヒット';
        pushLog('防御時間切れ：反応が遅れた');
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
      countdownLabel.textContent = '残り --.- 秒';
      countdownLabel.style.color = '#cbd5f5';
    }

    function updateCountdownLabel(){
      if (state !== 'direction'){
        countdownLabel.textContent = '残り --.- 秒';
        countdownLabel.style.color = '#cbd5f5';
        return;
      }
      const remaining = Math.max(0, (directionDeadline - performance.now()) / 1000);
      countdownLabel.textContent = `残り ${remaining.toFixed(1)} 秒`;
      if (remaining <= 0.3){
        countdownLabel.style.color = '#fca5a5';
      } else if (remaining <= 0.7){
        countdownLabel.style.color = '#facc15';
      } else {
        countdownLabel.style.color = '#bbf7d0';
      }
    }

    function pushLog(message){
      const entry = document.createElement('li');
      entry.textContent = message;
      entry.style.fontSize = '0.82rem';
      entry.style.opacity = '0.85';
      logList.prepend(entry);
      while (logList.children.length > 8){
        logList.removeChild(logList.lastChild);
      }
    }

    function randomRps(){
      const values = ['rock', 'scissors', 'paper'];
      return values[Math.floor(Math.random() * values.length)];
    }

    function randomDirection(){
      const values = ['up', 'down', 'left', 'right'];
      return values[Math.floor(Math.random() * values.length)];
    }

    function rpsToJapanese(value){
      return value === 'rock' ? 'グー' : value === 'scissors' ? 'チョキ' : 'パー';
    }

    function dirToJapanese(dir){
      switch (dir){
        case 'up': return '上';
        case 'down': return '下';
        case 'left': return '左';
        case 'right': return '右';
        default: return dir;
      }
    }

    function start(){}
    function stop(){
      clearDirectionCountdown();
      if (state === 'direction'){
        attacker = null;
        state = 'rps';
      }
      statusLabel.textContent = '一時停止中';
      updateUI();
    }
    function destroy(){
      clearDirectionCountdown();
      try { wrapper.remove(); } catch {}
    }
    function getScore(){
      return playerWins * 15 + successfulDodges * 5;
    }

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({ id: 'acchimuitehoi', name: 'あっち向いてホイ', description: '攻め勝利で15EXP、防御成功で5EXP', create });
})();

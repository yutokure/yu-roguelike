(function(){
  /** MiniExp: あっち向いてホイ
   *  - First win Rock-Paper-Scissors, then point/avoid directions
   *  - Player attack win: +15 EXP, successful dodge as defender: +5 EXP
   */
  function create(root, awardXp){
    const wrapper = document.createElement('div');
    wrapper.style.display = 'grid';
    wrapper.style.gap = '12px';
    wrapper.style.fontFamily = 'system-ui, sans-serif';
    wrapper.style.color = '#e2e8f0';

    const stageTitle = document.createElement('div');
    stageTitle.style.fontSize = '1.2rem';
    stageTitle.style.fontWeight = '600';
    stageTitle.textContent = 'じゃんけんで攻守を決めよう';

    const rpsRow = document.createElement('div');
    rpsRow.style.display = 'flex';
    rpsRow.style.gap = '8px';

    const buttons = {
      rock: createButton('グー'),
      paper: createButton('パー'),
      scissors: createButton('チョキ')
    };

    rpsRow.appendChild(buttons.rock);
    rpsRow.appendChild(buttons.scissors);
    rpsRow.appendChild(buttons.paper);

    const directionRow = document.createElement('div');
    directionRow.style.display = 'grid';
    directionRow.style.gridTemplateColumns = 'repeat(3, 64px)';
    directionRow.style.gap = '6px';
    directionRow.style.justifyContent = 'center';

    const dirButtons = {
      up: createButton('↑'),
      down: createButton('↓'),
      left: createButton('←'),
      right: createButton('→')
    };
    directionRow.appendChild(document.createElement('span'));
    directionRow.appendChild(dirButtons.up);
    directionRow.appendChild(document.createElement('span'));
    directionRow.appendChild(dirButtons.left);
    directionRow.appendChild(dirButtons.down);
    directionRow.appendChild(dirButtons.right);

    const statusLabel = document.createElement('div');
    statusLabel.style.background = 'rgba(15,23,42,0.8)';
    statusLabel.style.padding = '10px 12px';
    statusLabel.style.borderRadius = '8px';
    statusLabel.style.minHeight = '46px';
    statusLabel.textContent = 'じゃんけん中';

    const scoreRow = document.createElement('div');
    scoreRow.style.fontSize = '0.9rem';
    const scoreSpan = document.createElement('span');
    const dodgeSpan = document.createElement('span');
    scoreRow.appendChild(scoreSpan);
    scoreRow.appendChild(document.createTextNode(' ／ '));
    scoreRow.appendChild(dodgeSpan);

    const logList = document.createElement('ol');
    logList.style.margin = 0;
    logList.style.padding = '0 0 0 18px';
    logList.style.maxHeight = '150px';
    logList.style.overflow = 'auto';
    logList.style.fontSize = '0.85rem';

    wrapper.appendChild(stageTitle);
    wrapper.appendChild(rpsRow);
    wrapper.appendChild(directionRow);
    wrapper.appendChild(statusLabel);
    wrapper.appendChild(scoreRow);
    wrapper.appendChild(logList);
    root.appendChild(wrapper);

    let state = 'rps';
    let attacker = null; // 'player' | 'cpu'
    let playerWins = 0;
    let successfulDodges = 0;

    updateUI();

    function updateUI(){
      scoreSpan.textContent = `攻め勝利: ${playerWins}`;
      dodgeSpan.textContent = `回避成功: ${successfulDodges}`;
      directionRow.style.display = state === 'direction' ? 'grid' : 'none';
      rpsRow.style.opacity = state === 'rps' ? '1' : '0.4';
      Object.values(buttons).forEach(btn => btn.disabled = state !== 'rps');
      Object.values(dirButtons).forEach(btn => btn.disabled = state !== 'direction');
      if (state === 'rps'){
        stageTitle.textContent = 'じゃんけんで攻守を決めよう';
      } else if (attacker === 'player'){
        stageTitle.textContent = '攻撃：指を差す方向を選んで！';
      } else {
        stageTitle.textContent = '防御：相手とは違う方向を選ぼう！';
      }
    }

    function createButton(label){
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
      btn.style.flex = '1';
      btn.style.padding = '10px';
      btn.style.borderRadius = '8px';
      btn.style.border = 'none';
      btn.style.fontWeight = '600';
      btn.style.cursor = 'pointer';
      btn.style.background = 'linear-gradient(135deg, #1e293b, #0f172a)';
      btn.style.color = '#e2e8f0';
      btn.addEventListener('mouseenter', () => btn.style.background = 'linear-gradient(135deg, #334155, #1e293b)');
      btn.addEventListener('mouseleave', () => btn.style.background = 'linear-gradient(135deg, #1e293b, #0f172a)');
      return btn;
    }

    function log(message){
      const entry = document.createElement('li');
      entry.textContent = message;
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

    function handleRps(playerChoice){
      if (state !== 'rps') return;
      const cpuChoice = randomRps();
      if (playerChoice === cpuChoice){
        statusLabel.textContent = `あいこで ${rpsToJapanese(cpuChoice)}！もう一度`; log('あいこ続行');
        return;
      }
      const playerWinsRound =
        (playerChoice === 'rock' && cpuChoice === 'scissors') ||
        (playerChoice === 'scissors' && cpuChoice === 'paper') ||
        (playerChoice === 'paper' && cpuChoice === 'rock');
      attacker = playerWinsRound ? 'player' : 'cpu';
      state = 'direction';
      statusLabel.textContent = playerWinsRound
        ? `あなたの勝ち！指す方向を決めよう`
        : `相手が攻め！違う方向を選んで回避`; 
      log(`じゃんけん結果: あなた=${rpsToJapanese(playerChoice)} / 相手=${rpsToJapanese(cpuChoice)} → ${playerWinsRound ? '攻め' : '守り'}`);
      updateUI();
    }

    function resolveDirection(playerDir){
      if (state !== 'direction') return;
      const cpuDir = randomDirection();
      if (attacker === 'player'){
        const match = playerDir === cpuDir;
        if (match){
          awardXp(15, { reason: 'attacker-win', gameId: 'acchimuitehoi' });
          playerWins += 1;
          statusLabel.textContent = `ヒット！${dirToJapanese(playerDir)}で15EXP`; log(`攻め成功！CPUは ${dirToJapanese(cpuDir)}`);
        } else {
          statusLabel.textContent = `外した… CPUは${dirToJapanese(cpuDir)}を向いた`; log(`攻め失敗：CPU ${dirToJapanese(cpuDir)} / あなた ${dirToJapanese(playerDir)}`);
        }
      } else {
        const avoided = playerDir !== cpuDir;
        if (avoided){
          awardXp(5, { reason: 'defense-success', gameId: 'acchimuitehoi' });
          successfulDodges += 1;
          statusLabel.textContent = `回避成功！${dirToJapanese(cpuDir)}を避けた！5EXP`; log(`防御成功：相手 ${dirToJapanese(cpuDir)} / あなた ${dirToJapanese(playerDir)}`);
        } else {
          statusLabel.textContent = `回避失敗…同じ${dirToJapanese(cpuDir)}を向いた`; log('防御失敗');
        }
      }
      attacker = null;
      state = 'rps';
      updateUI();
    }

    buttons.rock.addEventListener('click', () => handleRps('rock'));
    buttons.scissors.addEventListener('click', () => handleRps('scissors'));
    buttons.paper.addEventListener('click', () => handleRps('paper'));

    dirButtons.up.addEventListener('click', () => resolveDirection('up'));
    dirButtons.down.addEventListener('click', () => resolveDirection('down'));
    dirButtons.left.addEventListener('click', () => resolveDirection('left'));
    dirButtons.right.addEventListener('click', () => resolveDirection('right'));

    function start(){}
    function stop(){}
    function destroy(){ try { wrapper.remove(); } catch {} }
    function getScore(){ return playerWins * 15 + successfulDodges * 5; }

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({ id: 'acchimuitehoi', name: 'あっち向いてホイ', description: '攻め勝利で15EXP、防御成功で5EXP', create });
})();

(function(){
  /** MiniExp: じゃんけん10EXP
   *  - Classic rock-paper-scissors vs CPU
   *  - Win rounds to earn 10 EXP apiece
   */
  function create(root, awardXp){
    const wrapper = document.createElement('div');
    wrapper.style.display = 'grid';
    wrapper.style.gap = '12px';
    wrapper.style.fontFamily = 'system-ui, sans-serif';
    wrapper.style.color = '#e2e8f0';

    const title = document.createElement('div');
    title.style.fontSize = '1.3rem';
    title.style.fontWeight = '600';
    title.textContent = 'じゃんけん 10EXP';

    const buttonRow = document.createElement('div');
    buttonRow.style.display = 'flex';
    buttonRow.style.gap = '8px';

    const log = document.createElement('div');
    log.style.background = 'rgba(15,23,42,0.85)';
    log.style.padding = '12px';
    log.style.borderRadius = '10px';
    log.style.minHeight = '64px';
    log.textContent = '勝てば10EXP！';

    const stats = document.createElement('div');
    stats.style.fontSize = '0.9rem';
    stats.textContent = '勝ち: 0／負け: 0／あいこ: 0';

    wrapper.appendChild(title);
    wrapper.appendChild(buttonRow);
    wrapper.appendChild(log);
    wrapper.appendChild(stats);
    root.appendChild(wrapper);

    let wins = 0;
    let losses = 0;
    let ties = 0;

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
      btn.addEventListener('mouseenter', () => btn.style.background = 'linear-gradient(135deg, #334155, #1e293b)');
      btn.addEventListener('mouseleave', () => btn.style.background = 'linear-gradient(135deg, #1e293b, #0f172a)');
      btn.addEventListener('click', () => play(idx));
      buttonRow.appendChild(btn);
    });

    function play(player){
      const cpu = Math.floor(Math.random() * 3);
      if (player === cpu){
        ties += 1;
        log.textContent = `あいこ (${labelOf(cpu)}) - 引き分け`; 
      } else if ((player === 0 && cpu === 1) || (player === 1 && cpu === 2) || (player === 2 && cpu === 0)){
        wins += 1;
        awardXp(10, { reason: 'win', gameId: 'janken' });
        log.textContent = `勝ち！あなた=${labelOf(player)} 相手=${labelOf(cpu)} (+10EXP)`;
      } else {
        losses += 1;
        log.textContent = `負け… あなた=${labelOf(player)} 相手=${labelOf(cpu)}`;
      }
      stats.textContent = `勝ち: ${wins}／負け: ${losses}／あいこ: ${ties}`;
    }

    function labelOf(index){
      return index === 0 ? 'グー' : index === 1 ? 'チョキ' : 'パー';
    }

    function start(){}
    function stop(){}
    function destroy(){ try { wrapper.remove(); } catch {} }
    function getScore(){ return wins * 10; }

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({ id: 'janken', name: 'じゃんけん', description: '勝利で10EXP', create });
})();

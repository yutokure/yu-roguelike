(function(){
  /**
   * MiniExp Bowling Duel MOD (v0.1.0)
   * - Player sets hook, aim and power against CPU opponent
   * - 10 frame match with standard bowling scoring
   * - EXP: +1 per pin, +8 spare, +15 strike, +40 victory (scaled by difficulty)
   */
  function clamp(v, min, max){ return v < min ? min : (v > max ? max : v); }

  function create(root, awardXp, opts){
    const difficulty = (opts?.difficulty || 'NORMAL').toUpperCase();
    const shortcuts = opts?.shortcuts;
    const cfg = difficulty === 'HARD' ?
      { cpuSkill: 0.78, variance: 0.22, cpuVariance: 0.16, victoryXp: 55 } :
      difficulty === 'EASY' ?
      { cpuSkill: 0.48, variance: 0.28, cpuVariance: 0.22, victoryXp: 30 } :
      { cpuSkill: 0.62, variance: 0.24, cpuVariance: 0.19, victoryXp: 40 };

    if(!document.getElementById('bowling-mod-style')){
      const style = document.createElement('style');
      style.id = 'bowling-mod-style';
      style.textContent = `
        .bowling-mod { font-family: 'Segoe UI', 'Hiragino Kaku Gothic ProN', 'BIZ UDPGothic', system-ui, sans-serif; color:#e2e8f0; background:linear-gradient(160deg,#0f172a,#1f2937); padding:16px; border-radius:16px; box-shadow:0 12px 32px rgba(15,23,42,0.45); max-width:880px; margin:0 auto; }
        .bowling-mod h2 { margin:0 0 12px; font-size:24px; color:#f8fafc; text-align:center; }
        .bowling-mod .status-line { margin:8px 0 12px; font-size:14px; color:#cbd5f5; text-align:center; min-height:24px; }
        .bowling-mod table.bowling-scoreboard { width:100%; border-collapse:separate; border-spacing:4px; margin-bottom:16px; }
        .bowling-mod table.bowling-scoreboard th { background:#0b1120; padding:6px 4px; border-radius:6px; font-size:13px; }
        .bowling-mod table.bowling-scoreboard td { background:#111c30; border-radius:8px; padding:6px 4px; vertical-align:top; text-align:center; }
        .bowling-mod .player-label { font-weight:600; margin-bottom:4px; display:block; font-size:13px; color:#38bdf8; }
        .bowling-mod .cpu-label { font-weight:600; margin-bottom:4px; display:block; font-size:13px; color:#f97316; }
        .bowling-mod .frame-rolls { display:flex; justify-content:center; gap:2px; font-size:14px; margin-bottom:4px; }
        .bowling-mod .frame-rolls span { width:18px; height:18px; display:inline-flex; align-items:center; justify-content:center; background:#1f2a44; border-radius:4px; }
        .bowling-mod .frame-total { font-size:13px; color:#f1f5f9; min-height:16px; }
        .bowling-mod .controls { display:grid; gap:12px; grid-template-columns:repeat(auto-fit, minmax(220px,1fr)); background:#0f172a; padding:12px; border-radius:12px; box-shadow:inset 0 0 0 1px rgba(148,163,184,0.18); }
        .bowling-mod .slider-block { display:flex; flex-direction:column; gap:6px; }
        .bowling-mod .slider-block label { font-size:14px; font-weight:600; color:#e0f2fe; display:flex; justify-content:space-between; }
        .bowling-mod .slider-block input[type="range"] { width:100%; accent-color:#38bdf8; }
        .bowling-mod .controls button { padding:10px 14px; border:none; border-radius:8px; font-weight:600; background:linear-gradient(135deg,#38bdf8,#2563eb); color:#0f172a; cursor:pointer; transition:transform .1s ease, box-shadow .1s ease; }
        .bowling-mod .controls button:disabled { background:#334155; color:#94a3b8; cursor:not-allowed; box-shadow:none; transform:none; }
        .bowling-mod .controls button:not(:disabled):hover { transform:translateY(-1px); box-shadow:0 6px 16px rgba(37,99,235,0.45); }
        .bowling-mod .legend { font-size:12px; color:#cbd5f5; text-align:center; margin-top:8px; }
        .bowling-mod .history-log { margin-top:12px; background:#0f172a; border-radius:12px; padding:12px; max-height:140px; overflow:auto; font-size:13px; color:#cbd5f5; box-shadow:inset 0 0 0 1px rgba(148,163,184,0.18); }
        .bowling-mod .history-log strong { color:#f8fafc; }
      `;
      document.head.appendChild(style);
    }

    const container = document.createElement('div');
    container.className = 'bowling-mod';
    const title = document.createElement('h2');
    title.textContent = 'ボウリング対決 MOD';
    const statusLine = document.createElement('div');
    statusLine.className = 'status-line';
    statusLine.textContent = '3つのパラメータを調整してストライクを狙おう！';

    const table = document.createElement('table');
    table.className = 'bowling-scoreboard';
    const headRow = document.createElement('tr');
    const blankTh = document.createElement('th');
    blankTh.textContent = '';
    headRow.appendChild(blankTh);
    for(let i=1;i<=10;i++){ const th = document.createElement('th'); th.textContent = i; headRow.appendChild(th); }
    const totalTh = document.createElement('th'); totalTh.textContent = '合計'; headRow.appendChild(totalTh);
    table.appendChild(headRow);

    function makeScoreRow(labelText, labelClass){
      const row = document.createElement('tr');
      const labelCell = document.createElement('td');
      const labelSpan = document.createElement('span');
      labelSpan.className = labelClass;
      labelSpan.textContent = labelText;
      labelCell.appendChild(labelSpan);
      row.appendChild(labelCell);
      const cells = [];
      for(let i=0;i<10;i++){
        const td = document.createElement('td');
        const rollsBox = document.createElement('div');
        rollsBox.className = 'frame-rolls';
        const r1 = document.createElement('span');
        const r2 = document.createElement('span');
        const r3 = document.createElement('span');
        rollsBox.appendChild(r1); rollsBox.appendChild(r2); rollsBox.appendChild(r3);
        const totalBox = document.createElement('div');
        totalBox.className = 'frame-total';
        td.appendChild(rollsBox);
        td.appendChild(totalBox);
        row.appendChild(td);
        cells.push({ td, rolls:[r1,r2,r3], total:totalBox });
      }
      const totalCell = document.createElement('td');
      totalCell.className = 'frame-total';
      totalCell.style.fontSize = '16px';
      totalCell.style.fontWeight = '700';
      row.appendChild(totalCell);
      return { row, cells, totalCell };
    }

    const playerRow = makeScoreRow('あなた', 'player-label');
    const cpuRow = makeScoreRow('CPU', 'cpu-label');
    table.appendChild(playerRow.row);
    table.appendChild(cpuRow.row);

    const controls = document.createElement('div');
    controls.className = 'controls';

    function makeSlider(label, min, max, step, value, formatter){
      const block = document.createElement('div');
      block.className = 'slider-block';
      const labelEl = document.createElement('label');
      const spanName = document.createElement('span');
      spanName.textContent = label;
      const spanValue = document.createElement('span');
      spanValue.textContent = formatter(value);
      const input = document.createElement('input');
      input.type = 'range';
      input.min = String(min);
      input.max = String(max);
      input.step = String(step);
      input.value = String(value);
      input.addEventListener('input', ()=>{ spanValue.textContent = formatter(Number(input.value)); });
      labelEl.appendChild(spanName);
      labelEl.appendChild(spanValue);
      block.appendChild(labelEl);
      block.appendChild(input);
      return { block, input, valueEl: spanValue };
    }

    const aimSlider = makeSlider('狙い位置', -100, 100, 1, 0, v=> v===0 ? '中央' : (v>0 ? `右 ${v}` : `左 ${Math.abs(v)}`));
    const curveSlider = makeSlider('カーブ量', -100, 100, 1, 20, v=> v===0 ? 'なし' : (v>0 ? `右曲がり ${v}` : `左曲がり ${Math.abs(v)}`));
    const powerSlider = makeSlider('投球パワー', 40, 100, 1, 72, v=> `${v}%`);

    controls.appendChild(aimSlider.block);
    controls.appendChild(curveSlider.block);
    controls.appendChild(powerSlider.block);

    const buttonBlock = document.createElement('div');
    buttonBlock.className = 'slider-block';
    buttonBlock.style.justifyContent = 'flex-end';
    buttonBlock.style.gap = '10px';
    const throwBtn = document.createElement('button');
    throwBtn.textContent = '🎳 ボールを投げる';
    const resetBtn = document.createElement('button');
    resetBtn.textContent = '🔄 リセット';
    resetBtn.style.background = 'linear-gradient(135deg,#f97316,#fb7185)';
    resetBtn.style.color = '#0f172a';
    buttonBlock.appendChild(throwBtn);
    buttonBlock.appendChild(resetBtn);
    controls.appendChild(buttonBlock);

    const legend = document.createElement('div');
    legend.className = 'legend';
    legend.textContent = '各フレームであなた→CPUの順に投球します。10フレーム終了時のスコアで勝負！';

    const historyLog = document.createElement('div');
    historyLog.className = 'history-log';
    historyLog.innerHTML = '<strong>ログ</strong><br>---';

    container.appendChild(title);
    container.appendChild(statusLine);
    container.appendChild(table);
    container.appendChild(controls);
    container.appendChild(legend);
    container.appendChild(historyLog);
    root.appendChild(container);

    const playerFrames = Array.from({ length: 10 }, () => ({ rolls: [] }));
    const cpuFrames = Array.from({ length: 10 }, () => ({ rolls: [] }));
    let frameIndex = 0;
    let turn = 'player';
    let running = false;
    let ended = false;
    let cpuTimeout = 0;

    function resetState(){
      if(cpuTimeout){ clearTimeout(cpuTimeout); cpuTimeout = 0; }
      for(let i=0;i<10;i++){ playerFrames[i].rolls.length = 0; cpuFrames[i].rolls.length = 0; updateCell(playerRow.cells[i], []); updateCell(cpuRow.cells[i], []); }
      updateTotals();
      historyLog.innerHTML = '<strong>ログ</strong><br>---';
      frameIndex = 0;
      turn = 'player';
      running = false;
      ended = false;
      statusLine.textContent = '第1フレーム あなたの番です。';
      throwBtn.disabled = false;
    }

    function updateCell(cell, rolls, cumulative){
      const symbols = formatRolls(rolls);
      cell.rolls[0].textContent = symbols[0] || '';
      cell.rolls[1].textContent = symbols[1] || '';
      cell.rolls[2].textContent = symbols[2] || '';
      if(typeof cumulative === 'number'){ cell.total.textContent = cumulative.toString(); }
      else cell.total.textContent = '';
    }

    function formatRolls(rolls){
      const res = [];
      if(rolls.length === 0) return res;
      if(rolls.length >= 1){
        res[0] = rolls[0] === 10 ? 'X' : (rolls[0] === 0 ? '-' : String(rolls[0]));
      }
      if(rolls.length >= 2){
        if(rolls[0] === 10){
          res[1] = rolls[1] === 10 ? 'X' : (rolls[1] === 0 ? '-' : String(rolls[1]));
        } else if((rolls[0] || 0) + rolls[1] === 10){
          res[1] = '/';
        } else {
          res[1] = rolls[1] === 0 ? '-' : String(rolls[1]);
        }
      }
      if(rolls.length >= 3){
        const r3 = rolls[2];
        if(rolls[1] === 10){
          res[2] = r3 === 10 ? 'X' : (r3 === 0 ? '-' : String(r3));
        } else if(((rolls[1] || 0) + r3) === 10){
          res[2] = '/';
        } else {
          res[2] = r3 === 10 ? 'X' : (r3 === 0 ? '-' : String(r3));
        }
      }
      return res;
    }

    function computeTotals(frames){
      const totals = [];
      let score = 0;
      let rollIndex = 0;
      const rollsFlat = [];
      for(const fr of frames){ rollsFlat.push(...fr.rolls); }
      for(let frame=0; frame<10; frame++){
        if(frame < 9){
          const first = rollsFlat[rollIndex] ?? 0;
          const second = rollsFlat[rollIndex+1] ?? 0;
          const third = rollsFlat[rollIndex+2] ?? 0;
          if(first === 10){
            score += 10 + second + third;
            rollIndex += 1;
          } else if(first + second === 10){
            score += 10 + third;
            rollIndex += 2;
          } else {
            score += first + second;
            rollIndex += 2;
          }
        } else {
          const fr = frames[frame];
          score += fr.rolls.reduce((a,b)=>a+b,0);
          rollIndex += fr.rolls.length;
        }
        totals[frame] = score;
      }
      return totals;
    }

    function updateTotals(){
      const playerTotals = computeTotals(playerFrames);
      const cpuTotals = computeTotals(cpuFrames);
      for(let i=0;i<10;i++){
        const pFrame = playerFrames[i];
        const cFrame = cpuFrames[i];
        const pTotal = (pFrame.rolls.length && frameComplete(playerFrames, i)) ? playerTotals[i] : undefined;
        const cTotal = (cFrame.rolls.length && frameComplete(cpuFrames, i)) ? cpuTotals[i] : undefined;
        updateCell(playerRow.cells[i], playerFrames[i].rolls, Number.isFinite(pTotal) ? pTotal : undefined);
        updateCell(cpuRow.cells[i], cpuFrames[i].rolls, Number.isFinite(cTotal) ? cTotal : undefined);
      }
      playerRow.totalCell.textContent = playerTotals[9] ? String(playerTotals[9]) : '0';
      cpuRow.totalCell.textContent = cpuTotals[9] ? String(cpuTotals[9]) : '0';
      return { player: playerTotals[9] || 0, cpu: cpuTotals[9] || 0 };
    }

    function pinsStandingFor(frames, frameIdx){
      const frame = frames[frameIdx];
      if(!frame) return 0;
      if(frameIdx < 9){
        if(frame.rolls.length === 0) return 10;
        if(frame.rolls.length === 1){ return 10 - frame.rolls[0]; }
        return 0;
      }
      // 10th frame
      if(frame.rolls.length === 0) return 10;
      if(frame.rolls.length === 1){ return frame.rolls[0] === 10 ? 10 : 10 - frame.rolls[0]; }
      if(frame.rolls.length === 2){
        if(frame.rolls[0] === 10){ return frame.rolls[1] === 10 ? 10 : 10 - frame.rolls[1]; }
        if(frame.rolls[0] + frame.rolls[1] === 10) return 10;
        return Math.max(0, 10 - frame.rolls[0] - frame.rolls[1]);
      }
      return 0;
    }

    function frameComplete(frames, idx){
      const frame = frames[idx];
      if(!frame) return true;
      if(idx < 9){
        return frame.rolls[0] === 10 || frame.rolls.length === 2;
      }
      if(frame.rolls.length < 2) return false;
      if(frame.rolls.length === 2){
        const sum = (frame.rolls[0]||0)+(frame.rolls[1]||0);
        if(frame.rolls[0] === 10 || frame.rolls[1] === 10 || sum === 10){ return false; }
        return true;
      }
      return frame.rolls.length >= 3;
    }

    function log(message){
      if(historyLog.innerHTML.endsWith('---')){
        historyLog.innerHTML = historyLog.innerHTML.slice(0, -3);
      }
      historyLog.innerHTML += `<br>${message}`;
      historyLog.scrollTop = historyLog.scrollHeight;
    }

    function evaluateShot(aim, curve, power, pinsLeft, variance){
      const aimNorm = clamp(aim / 100, -1, 1);
      const curveNorm = clamp(curve / 100, -1, 1);
      const powerNorm = clamp(power / 100, 0, 1.15);
      const aimScore = 1 - Math.min(1, Math.abs(aimNorm) * 0.78);
      const pocketOffset = Math.abs(aimNorm + curveNorm * 0.65);
      const pocketScore = 1 - Math.min(1, pocketOffset * 0.95);
      const curveControl = 1 - Math.min(1, Math.abs(curveNorm) * 0.55);
      const baseQuality = 0.36 * powerNorm + 0.34 * aimScore + 0.30 * (0.65 * pocketScore + 0.35 * curveControl);
      let quality = baseQuality + (Math.random() - 0.5) * variance;
      quality = clamp(quality, 0, 1.15);
      let factor = 0.35 + quality * 0.68;
      if(pinsLeft <= 3){ factor += quality * 0.25; }
      let knocked = Math.round(pinsLeft * factor);
      if(pinsLeft === 10 && quality > 0.92 && Math.random() < (0.12 + quality * 0.15)){
        knocked = 10;
      }
      knocked = clamp(knocked, 0, pinsLeft);
      if(knocked === 0 && quality > 0.6 && pinsLeft <= 3){ knocked = 1; }
      return knocked;
    }

    function cpuDecision(){
      const skill = cfg.cpuSkill;
      const pressure = 0.02 * frameIndex;
      const aimBase = skill >= 0.7 ? 10 : -6;
      const aim = clamp(aimBase + (Math.random()-0.5) * (120 - skill*60), -95, 95);
      const hookPreferred = aim >= 0 ? -40 : 40;
      const curve = clamp(hookPreferred * (0.5 + skill*0.4) + (Math.random()-0.5)*(100 - skill*55), -100, 100);
      const power = clamp(65 + skill*28 + (Math.random()-0.5)*18 + pressure*60, 50, 100);
      return { aim, curve, power };
    }

    function recordRoll(frames, knocked, who){
      const frame = frames[frameIndex];
      frame.rolls.push(knocked);
      if(knocked > 0 && who === 'player'){ awardXp(knocked, { type:'pins', who }); }
      if(frameIndex === 9){
        if(frame.rolls.length === 1 && knocked === 10 && who === 'player'){ awardXp(15, { type:'strike', frame: frameIndex+1 }); }
        else if(frame.rolls.length === 2){
          const first = frame.rolls[0];
          if(first === 10 && knocked === 10 && who === 'player'){ awardXp(15, { type:'strike', frame: frameIndex+1 }); }
          else if((first||0) + knocked === 10 && who === 'player'){ awardXp(8, { type:'spare', frame: frameIndex+1 }); }
        }
        if(frame.rolls.length === 3 && who === 'player' && knocked === 10){ awardXp(12, { type:'bonus-strike', frame: frameIndex+1 }); }
      } else if(knocked === 10 && who === 'player'){ awardXp(15, { type:'strike', frame: frameIndex+1 }); }
      else if(frame.rolls.length === 2 && frame.rolls[0] + frame.rolls[1] === 10 && who === 'player'){ awardXp(8, { type:'spare', frame: frameIndex+1 }); }
    }

    function ensureRunning(){
      if(!running){ running = true; shortcuts?.disableKey?.('r'); }
    }

    function finishGame(){
      ended = true;
      running = false;
      if(cpuTimeout){ clearTimeout(cpuTimeout); cpuTimeout = 0; }
      shortcuts?.enableKey?.('r');
      throwBtn.disabled = true;
      const totals = updateTotals();
      if(totals.player > totals.cpu){
        statusLine.textContent = `勝利！ スコア ${totals.player} - ${totals.cpu}`;
        awardXp(cfg.victoryXp, { type:'victory' });
        log(`<strong>YOU WIN!</strong> +${cfg.victoryXp}EXP`);
      } else if(totals.player === totals.cpu){
        statusLine.textContent = `引き分け… スコア ${totals.player} - ${totals.cpu}`;
        const drawXp = Math.floor(cfg.victoryXp * 0.4);
        awardXp(drawXp, { type:'draw' });
        log(`<strong>DRAW</strong> +${drawXp}EXP`);
      } else {
        statusLine.textContent = `敗北… スコア ${totals.player} - ${totals.cpu}`;
        const consolation = Math.floor(cfg.victoryXp * 0.25);
        awardXp(consolation, { type:'consolation' });
        log(`<strong>LOSE</strong> +${consolation}EXP`);
      }
    }

    function nextTurn(){
      updateTotals();
      if(frameComplete(turn === 'player' ? playerFrames : cpuFrames, frameIndex)){
        if(turn === 'player'){
          turn = 'cpu';
          statusLine.textContent = `第${frameIndex+1}フレーム CPUの番です…`;
          throwBtn.disabled = true;
          if(cpuTimeout){ clearTimeout(cpuTimeout); }
          cpuTimeout = setTimeout(cpuThrow, 800 + Math.random()*500);
        } else {
          if(frameComplete(cpuFrames, frameIndex)){
            frameIndex++;
            if(frameIndex >= 10){ finishGame(); return; }
            turn = 'player';
            statusLine.textContent = `第${frameIndex+1}フレーム あなたの番です。`;
            throwBtn.disabled = false;
          }
        }
      } else {
        if(turn === 'player'){
          const remaining = pinsStandingFor(playerFrames, frameIndex);
          statusLine.textContent = `残りピン: ${remaining} 本。もう一投！`;
          throwBtn.disabled = false;
        }
      }
    }

    function cpuThrow(){
      if(cpuTimeout){ clearTimeout(cpuTimeout); cpuTimeout = 0; }
      if(ended || frameIndex >= 10) return;
      const pinsLeft = pinsStandingFor(cpuFrames, frameIndex);
      const decision = cpuDecision();
      const knocked = evaluateShot(decision.aim, decision.curve, decision.power, pinsLeft, cfg.cpuVariance);
      recordRoll(cpuFrames, knocked, 'cpu');
      log(`CPU: aim ${decision.aim|0}, curve ${decision.curve|0}, power ${decision.power|0} → <strong>${knocked}</strong>`);
      if(frameIndex === 9){
        const fr = cpuFrames[frameIndex];
        if(fr.rolls.length === 1 && knocked === 10){ statusLine.textContent = `CPUがストライク！`; }
      }
      nextTurn();
    }

    function playerThrow(){
      if(ended || frameIndex >= 10 || turn !== 'player') return;
      ensureRunning();
      throwBtn.disabled = true;
      const aim = Number(aimSlider.input.value);
      const curve = Number(curveSlider.input.value);
      const power = Number(powerSlider.input.value);
      const pinsLeft = pinsStandingFor(playerFrames, frameIndex);
      const knocked = evaluateShot(aim, curve, power, pinsLeft, cfg.variance);
      recordRoll(playerFrames, knocked, 'player');
      log(`あなた: aim ${aim}, curve ${curve}, power ${power}% → <strong>${knocked}</strong>`);
      if(knocked === 10 && pinsLeft === 10){ statusLine.textContent = `ストライク！`; }
      nextTurn();
    }

    function start(){ if(running || ended) return; ensureRunning(); statusLine.textContent = `第${frameIndex+1}フレーム あなたの番です。`; }
    function stop(){
      running = false;
      if(cpuTimeout){ clearTimeout(cpuTimeout); cpuTimeout = 0; }
      shortcuts?.enableKey?.('r');
    }
    function destroy(){ stop(); container.remove(); }
    function getScore(){ const totals = updateTotals(); return totals.player; }

    throwBtn.addEventListener('click', playerThrow);
    resetBtn.addEventListener('click', ()=>{ resetState(); shortcuts?.disableKey?.('r'); });

    resetState();

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({
    id: 'bowling_duel',
    name: 'ボウリング対決',
    description: 'カーブ・狙い・パワーを調整してCPUと10フレーム勝負するボウリングMOD',
    create
  });
})();

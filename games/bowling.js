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

    const I18N_PREFIX = 'games.bowlingDuel';
    const globalI18n = typeof window !== 'undefined'
      ? (window.I18n || window.i18n || null)
      : null;
    const localization = opts?.localization
      || (typeof window !== 'undefined' && typeof window.createMiniGameLocalization === 'function'
        ? window.createMiniGameLocalization({ id: 'bowling_duel', localizationKey: I18N_PREFIX, textKeyPrefix: I18N_PREFIX })
        : null);
    const ownsLocalization = !opts?.localization && localization && typeof localization.destroy === 'function';

    function localize(key, params, fallback){
      if(localization && typeof localization.t === 'function'){
        try {
          const result = localization.t(key, typeof fallback === 'function' ? ()=>{
            try {
              const value = fallback();
              return value == null ? '' : String(value);
            } catch (error) {
              console.warn('[bowling] Failed to evaluate localization fallback for', key, error);
              return '';
            }
          } : fallback, params);
          if(result !== undefined && result !== null && result !== key){
            return typeof result === 'string' ? result : String(result);
          }
        } catch (error) {
          console.warn('[bowling] Failed to translate via helper for', key, error);
        }
      }

      const fullKey = `${I18N_PREFIX}.${key}`;
      try {
        if(typeof globalI18n?.t === 'function'){
          const translated = globalI18n.t(fullKey, params);
          if(typeof translated === 'string' && translated !== fullKey){
            return translated;
          }
        }
      } catch (error) {
        console.warn('[bowling] Failed to resolve translation for', fullKey, error);
      }

      if(typeof fallback === 'function'){
        try {
          const value = fallback();
          return value == null ? '' : String(value);
        } catch (error) {
          console.warn('[bowling] Failed to evaluate fallback for', key, error);
          return '';
        }
      }
      if(fallback == null) return '';
      try {
        return String(fallback);
      } catch {
        return '';
      }
    }

    function getLocaleCode(){
      const candidates = [
        localization?.getLocale?.(),
        globalI18n?.getLocale?.(),
        globalI18n?.getStoredLocale?.(),
        typeof navigator !== 'undefined' ? navigator.language : null,
        globalI18n?.getDefaultLocale?.(),
        'ja'
      ];
      for(const candidate of candidates){
        if(!candidate) continue;
        const normalized = String(candidate).toLowerCase();
        if(normalized.startsWith('en')) return 'en';
        if(normalized.startsWith('ja')) return 'ja';
      }
      return 'ja';
    }

    const textFallbacks = {
      ja: {
        title: ()=>'ボウリング対決 MOD',
        legend: ()=>'ボタンを押して狙い→カーブ→パワーの順にゲージを止め、投球しよう！',
        'history.title': ()=>'ログ',
        'history.placeholder': ()=>'---',
        'buttons.throw': ()=>'🎳 ボールを投げる',
        'buttons.reset': ()=>'🔄 リセット',
        'buttons.throwing': ()=>'🎳 投球中…',
        'scoreboard.you': ()=>'あなた',
        'scoreboard.cpu': ()=>'CPU',
        'scoreboard.total': ()=>'合計',
        'sliders.aim.label': ()=>'狙い位置',
        'sliders.aim.center': ()=>'中央',
        'sliders.aim.right': params=>`右 ${params.value}`,
        'sliders.aim.left': params=>`左 ${params.value}`,
        'sliders.curve.label': ()=>'カーブ量',
        'sliders.curve.none': ()=>'なし',
        'sliders.curve.right': params=>`右曲がり ${params.value}`,
        'sliders.curve.left': params=>`左曲がり ${params.value}`,
        'sliders.power.label': ()=>'投球パワー',
        'sliders.power.format': params=>`${params.value}%`,
        'status.introHint': ()=>'ゲージをタイミング良く止めてストライクを狙おう！',
        'status.framePlayer': params=>`第${params.frame}フレーム あなたの番です。`,
        'status.frameCpu': params=>`第${params.frame}フレーム CPUの番です…`,
        'status.remainingPins': params=>`残りピン: ${params.count} 本。もう一投！`,
        'status.playerStrike': ()=>'ストライク！',
        'status.cpuStrike': ()=>'CPUがストライク！',
        'status.victory': params=>`勝利！ スコア ${params.player} - ${params.cpu}`,
        'status.draw': params=>`引き分け… スコア ${params.player} - ${params.cpu}`,
        'status.defeat': params=>`敗北… スコア ${params.player} - ${params.cpu}`,
        'stage.aim.prompt': ()=>'狙いゲージが往復中…止めるタイミングでボタン！',
        'stage.aim.button': ()=>'🛑 狙いを止める',
        'stage.aim.confirm': params=>`狙い位置を ${params.value} にセット！`,
        'stage.curve.prompt': ()=>'カーブゲージ調整中…ボタンでストップ！',
        'stage.curve.button': ()=>'🛑 カーブを止める',
        'stage.curve.confirm': params=>`カーブ量は ${params.value} に決定！`,
        'stage.power.prompt': ()=>'パワーゲージを注視…ボタンで投球！',
        'stage.power.button': ()=>'🛑 パワーを止める',
        'stage.power.confirm': params=>`パワー ${params.value} で投球！`,
        'logs.playerShot': params=>`あなた: aim ${params.aim}, curve ${params.curve}, power ${params.power}% → <strong>${params.pins}</strong>`,
        'logs.cpuShot': params=>`CPU: aim ${params.aim}, curve ${params.curve}, power ${params.power}% → <strong>${params.pins}</strong>`,
        'logs.victory': params=>`<strong>勝利！</strong> +${params.exp}EXP`,
        'logs.draw': params=>`<strong>引き分け</strong> +${params.exp}EXP`,
        'logs.defeat': params=>`<strong>敗北</strong> +${params.exp}EXP`
      },
      en: {
        title: ()=>'Bowling Duel MOD',
        legend: ()=>'Press the button to stop the Aim → Curve → Power gauges in order and roll the ball!',
        'history.title': ()=>'Log',
        'history.placeholder': ()=>'---',
        'buttons.throw': ()=>'🎳 Throw Ball',
        'buttons.reset': ()=>'🔄 Reset',
        'buttons.throwing': ()=>'🎳 Rolling…',
        'scoreboard.you': ()=>'You',
        'scoreboard.cpu': ()=>'CPU',
        'scoreboard.total': ()=>'Total',
        'sliders.aim.label': ()=>'Aim Position',
        'sliders.aim.center': ()=>'Center',
        'sliders.aim.right': params=>`Right ${params.value}`,
        'sliders.aim.left': params=>`Left ${params.value}`,
        'sliders.curve.label': ()=>'Curve Amount',
        'sliders.curve.none': ()=>'None',
        'sliders.curve.right': params=>`Hooks Right ${params.value}`,
        'sliders.curve.left': params=>`Hooks Left ${params.value}`,
        'sliders.power.label': ()=>'Throw Power',
        'sliders.power.format': params=>`${params.value}%`,
        'status.introHint': ()=>'Stop each moving gauge at the right moment to chase strikes!',
        'status.framePlayer': params=>`Frame ${params.frame}: Your turn.`,
        'status.frameCpu': params=>`Frame ${params.frame}: CPU turn…`,
        'status.remainingPins': params=>`Pins left: ${params.count}. Take another shot!`,
        'status.playerStrike': ()=>'Strike!',
        'status.cpuStrike': ()=>'CPU rolled a strike!',
        'status.victory': params=>`Victory! Score ${params.player} - ${params.cpu}`,
        'status.draw': params=>`Draw… Score ${params.player} - ${params.cpu}`,
        'status.defeat': params=>`Defeat… Score ${params.player} - ${params.cpu}`,
        'stage.aim.prompt': ()=>'Aim gauge oscillating—press to lock it in!',
        'stage.aim.button': ()=>'🛑 Stop Aim',
        'stage.aim.confirm': params=>`Aim set to ${params.value}!`,
        'stage.curve.prompt': ()=>'Curve gauge moving—stop it with the button!',
        'stage.curve.button': ()=>'🛑 Stop Curve',
        'stage.curve.confirm': params=>`Curve locked at ${params.value}!`,
        'stage.power.prompt': ()=>'Watch the power gauge—press to roll!',
        'stage.power.button': ()=>'🛑 Stop Power',
        'stage.power.confirm': params=>`Rolling with ${params.value}!`,
        'logs.playerShot': params=>`You: aim ${params.aim}, curve ${params.curve}, power ${params.power}% → <strong>${params.pins}</strong>`,
        'logs.cpuShot': params=>`CPU: aim ${params.aim}, curve ${params.curve}, power ${params.power}% → <strong>${params.pins}</strong>`,
        'logs.victory': params=>`<strong>Victory!</strong> +${params.exp}EXP`,
        'logs.draw': params=>`<strong>Draw</strong> +${params.exp}EXP`,
        'logs.defeat': params=>`<strong>Defeat</strong> +${params.exp}EXP`
      }
    };

    function fallbackText(key, params){
      const locale = getLocaleCode();
      const entry = textFallbacks[locale]?.[key] || textFallbacks.ja?.[key];
      if(!entry) return '';
      try {
        const value = typeof entry === 'function' ? entry(params || {}) : entry;
        return value == null ? '' : String(value);
      } catch (error) {
        console.warn('[bowling] Failed to compute fallback text for', key, error);
        return '';
      }
    }

    function translateStatus(key, params){
      return localize(`status.${key}`, params, () => fallbackText(`status.${key}`, params));
    }

    function formatLog(key, params){
      return localize(`logs.${key}`, params, () => fallbackText(`logs.${key}`, params));
    }

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
        .bowling-mod .slider-block input.auto-gauge { pointer-events:none; cursor:default; }
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
    const statusLine = document.createElement('div');
    statusLine.className = 'status-line';

    const table = document.createElement('table');
    table.className = 'bowling-scoreboard';
    const headRow = document.createElement('tr');
    const blankTh = document.createElement('th');
    blankTh.textContent = '';
    headRow.appendChild(blankTh);
    for(let i=1;i<=10;i++){ const th = document.createElement('th'); th.textContent = i; headRow.appendChild(th); }
    const totalTh = document.createElement('th'); headRow.appendChild(totalTh);
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
      return { row, cells, totalCell, labelSpan };
    }

    const playerRow = makeScoreRow(localize('scoreboard.you', null, () => fallbackText('scoreboard.you')), 'player-label');
    const cpuRow = makeScoreRow(localize('scoreboard.cpu', null, () => fallbackText('scoreboard.cpu')), 'cpu-label');
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
      const clampToStep = v => {
        const base = Math.round(v / step) * step;
        return clamp(base, min, max);
      };
      const input = document.createElement('input');
      input.type = 'range';
      input.min = String(min);
      input.max = String(max);
      input.step = String(step);
      input.value = String(value);
      input.tabIndex = -1;
      input.style.pointerEvents = 'none';
      input.classList.add('auto-gauge');
      spanValue.textContent = formatter(clampToStep(value));
      const updateDisplay = ()=>{ spanValue.textContent = formatter(Number(input.value)); };
      updateDisplay();
      labelEl.appendChild(spanName);
      labelEl.appendChild(spanValue);
      block.appendChild(labelEl);
      block.appendChild(input);
      return {
        block,
        input,
        valueEl: spanValue,
        nameEl: spanName,
        formatter,
        min,
        max,
        step,
        setLabel(text){ spanName.textContent = text; },
        setValue(v){
          const val = clampToStep(v);
          input.value = String(val);
          spanValue.textContent = formatter(val);
        },
        getValue(){ return Number(input.value); },
        refresh(){
          const val = clampToStep(Number(input.value));
          spanValue.textContent = formatter(val);
        }
      };
    }

    const aimSlider = makeSlider(
      localize('sliders.aim.label', null, () => fallbackText('sliders.aim.label')),
      -100, 100, 1, 0,
      v => v === 0
        ? localize('sliders.aim.center', null, () => fallbackText('sliders.aim.center'))
        : v > 0
          ? localize('sliders.aim.right', { value: v }, () => fallbackText('sliders.aim.right', { value: v }))
          : localize('sliders.aim.left', { value: Math.abs(v) }, () => fallbackText('sliders.aim.left', { value: Math.abs(v) }))
    );
    const curveSlider = makeSlider(
      localize('sliders.curve.label', null, () => fallbackText('sliders.curve.label')),
      -100, 100, 1, 20,
      v => v === 0
        ? localize('sliders.curve.none', null, () => fallbackText('sliders.curve.none'))
        : v > 0
          ? localize('sliders.curve.right', { value: v }, () => fallbackText('sliders.curve.right', { value: v }))
          : localize('sliders.curve.left', { value: Math.abs(v) }, () => fallbackText('sliders.curve.left', { value: Math.abs(v) }))
    );
    const powerSlider = makeSlider(
      localize('sliders.power.label', null, () => fallbackText('sliders.power.label')),
      40, 100, 1, 72,
      v => localize('sliders.power.format', { value: v }, () => fallbackText('sliders.power.format', { value: v }))
    );

    controls.appendChild(aimSlider.block);
    controls.appendChild(curveSlider.block);
    controls.appendChild(powerSlider.block);

    const buttonBlock = document.createElement('div');
    buttonBlock.className = 'slider-block';
    buttonBlock.style.justifyContent = 'flex-end';
    buttonBlock.style.gap = '10px';
    const throwBtn = document.createElement('button');
    const resetBtn = document.createElement('button');
    resetBtn.style.background = 'linear-gradient(135deg,#f97316,#fb7185)';
    resetBtn.style.color = '#0f172a';
    buttonBlock.appendChild(throwBtn);
    buttonBlock.appendChild(resetBtn);
    controls.appendChild(buttonBlock);

    const legend = document.createElement('div');
    legend.className = 'legend';
    legend.textContent = localize('legend', null, () => fallbackText('legend'));

    const historyLog = document.createElement('div');
    historyLog.className = 'history-log';
    historyLog.innerHTML = `<strong>${localize('history.title', null, () => fallbackText('history.title'))}</strong><br>${localize('history.placeholder', null, () => fallbackText('history.placeholder'))}`;

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
    let selectionStage = null;
    const pendingParams = { aim: 0, curve: 0, power: 0 };
    let statusSnapshot = { mode: 'status', key: 'introHint', params: {} };
    let throwState = { mode: 'idle' };
    let historyEntries = [];
    let detachLocale = null;

    function renderHistory(){
      const titleText = localize('history.title', null, () => fallbackText('history.title'));
      const placeholder = localize('history.placeholder', null, () => fallbackText('history.placeholder'));
      if(historyEntries.length === 0){
        historyLog.innerHTML = `<strong>${titleText}</strong><br>${placeholder}`;
      } else {
        historyLog.innerHTML = [`<strong>${titleText}</strong>`, ...historyEntries].join('<br>');
      }
    }

    function log(message){
      historyEntries.push(message);
      renderHistory();
      historyLog.scrollTop = historyLog.scrollHeight;
    }

    function updateThrowButton(){
      if(throwState.mode === 'stage' && throwState.stage){
        const info = stageInfo?.[throwState.stage];
        throwBtn.textContent = info ? info.getButton() : localize('buttons.throw', null, () => fallbackText('buttons.throw'));
      } else if(throwState.mode === 'rolling'){
        throwBtn.textContent = localize('buttons.throwing', null, () => fallbackText('buttons.throwing'));
      } else {
        throwBtn.textContent = localize('buttons.throw', null, () => fallbackText('buttons.throw'));
      }
    }

    function setThrowState(next){
      throwState = next;
      updateThrowButton();
    }

    function applyStatusSnapshot(){
      if(statusSnapshot.mode === 'stagePrompt' && statusSnapshot.stage){
        const info = stageInfo?.[statusSnapshot.stage];
        statusLine.textContent = info ? info.getPrompt() : '';
      } else if(statusSnapshot.mode === 'stageConfirm' && statusSnapshot.stage){
        const info = stageInfo?.[statusSnapshot.stage];
        statusLine.textContent = info ? info.getConfirm(statusSnapshot.value) : '';
      } else if(statusSnapshot.mode === 'status' && statusSnapshot.key){
        statusLine.textContent = translateStatus(statusSnapshot.key, statusSnapshot.params);
      } else {
        statusLine.textContent = '';
      }
    }

    function setStatus(key, params){
      statusSnapshot = { mode: 'status', key, params };
      statusLine.textContent = translateStatus(key, params);
    }

    function makeOscillator(slider, unitsPerSecond){
      let animationId = 0;
      let direction = 1;
      let lastTime = 0;
      function step(now){
        if(!slider._animating) return;
        if(!lastTime) lastTime = now;
        const dt = (now - lastTime) / 1000;
        lastTime = now;
        let value = Number(slider.input.value);
        value += direction * unitsPerSecond * dt;
        if(value >= slider.max){ value = slider.max; direction = -1; }
        if(value <= slider.min){ value = slider.min; direction = 1; }
        slider.input.value = String(value);
        slider.refresh();
        animationId = requestAnimationFrame(step);
      }
      return {
        start(){
          this.stop(false);
          slider._animating = true;
          direction = 1;
          lastTime = 0;
          slider.input.value = String(slider.min);
          slider.refresh();
          animationId = requestAnimationFrame(step);
        },
        stop(quantize = true){
          if(animationId){ cancelAnimationFrame(animationId); animationId = 0; }
          slider._animating = false;
          lastTime = 0;
          if(!quantize){ slider.refresh(); return undefined; }
          const stepped = clamp(Math.round(Number(slider.input.value) / slider.step) * slider.step, slider.min, slider.max);
          slider.input.value = String(stepped);
          slider.refresh();
          return stepped;
        }
      };
    }

    const oscillators = {
      aim: makeOscillator(aimSlider, 160),
      curve: makeOscillator(curveSlider, 180),
      power: makeOscillator(powerSlider, 120)
    };

    function cancelSelection(){
      selectionStage = null;
      oscillators.aim.stop(false);
      oscillators.curve.stop(false);
      oscillators.power.stop(false);
      setThrowState({ mode: 'idle' });
    }

    function resetState(){
      if(cpuTimeout){ clearTimeout(cpuTimeout); cpuTimeout = 0; }
      for(let i=0;i<10;i++){ playerFrames[i].rolls.length = 0; cpuFrames[i].rolls.length = 0; updateCell(playerRow.cells[i], []); updateCell(cpuRow.cells[i], []); }
      updateTotals();
      historyEntries = [];
      renderHistory();
      frameIndex = 0;
      turn = 'player';
      running = false;
      ended = false;
      setStatus('framePlayer', { frame: 1 });
      throwBtn.disabled = false;
      cancelSelection();
      aimSlider.setValue(0);
      curveSlider.setValue(20);
      powerSlider.setValue(72);
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
      cancelSelection();
      const totals = updateTotals();
      if(totals.player > totals.cpu){
        setStatus('victory', { player: totals.player, cpu: totals.cpu });
        awardXp(cfg.victoryXp, { type:'victory' });
        log(formatLog('victory', { exp: cfg.victoryXp }));
      } else if(totals.player === totals.cpu){
        setStatus('draw', { player: totals.player, cpu: totals.cpu });
        const drawXp = Math.floor(cfg.victoryXp * 0.4);
        awardXp(drawXp, { type:'draw' });
        log(formatLog('draw', { exp: drawXp }));
      } else {
        setStatus('defeat', { player: totals.player, cpu: totals.cpu });
        const consolation = Math.floor(cfg.victoryXp * 0.25);
        awardXp(consolation, { type:'consolation' });
        log(formatLog('defeat', { exp: consolation }));
      }
      setThrowState({ mode: 'idle' });
    }

    function nextTurn(){
      updateTotals();
      if(frameComplete(turn === 'player' ? playerFrames : cpuFrames, frameIndex)){
        if(turn === 'player'){
          turn = 'cpu';
          setStatus('frameCpu', { frame: frameIndex+1 });
          throwBtn.disabled = true;
          if(cpuTimeout){ clearTimeout(cpuTimeout); }
          cpuTimeout = setTimeout(cpuThrow, 800 + Math.random()*500);
        } else {
          if(frameComplete(cpuFrames, frameIndex)){
            frameIndex++;
            if(frameIndex >= 10){ finishGame(); return; }
            turn = 'player';
            setStatus('framePlayer', { frame: frameIndex+1 });
            throwBtn.disabled = false;
            setThrowState({ mode: 'idle' });
          }
        }
      } else {
        if(turn === 'player'){
          const remaining = pinsStandingFor(playerFrames, frameIndex);
          setStatus('remainingPins', { count: remaining });
          throwBtn.disabled = false;
          setThrowState({ mode: 'idle' });
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
      log(formatLog('cpuShot', { aim: decision.aim|0, curve: decision.curve|0, power: decision.power|0, pins: knocked }));
      if(frameIndex === 9){
        const fr = cpuFrames[frameIndex];
        if(fr.rolls.length === 1 && knocked === 10){ setStatus('cpuStrike'); }
      }
      nextTurn();
    }

    function playerThrow(aim, curve, power){
      if(ended || frameIndex >= 10 || turn !== 'player') return;
      ensureRunning();
      throwBtn.disabled = true;
      const pinsLeft = pinsStandingFor(playerFrames, frameIndex);
      const knocked = evaluateShot(aim, curve, power, pinsLeft, cfg.variance);
      recordRoll(playerFrames, knocked, 'player');
      log(formatLog('playerShot', { aim, curve, power, pins: knocked }));
      if(knocked === 10 && pinsLeft === 10){ setStatus('playerStrike'); }
      nextTurn();
    }

    function start(){ if(running || ended) return; ensureRunning(); setStatus('framePlayer', { frame: frameIndex+1 }); }
    function stop(){
      running = false;
      if(cpuTimeout){ clearTimeout(cpuTimeout); cpuTimeout = 0; }
      cancelSelection();
      shortcuts?.enableKey?.('r');
    }
    function destroy(){
      stop();
      try {
        detachLocale?.();
      } catch (error) {
        console.warn('[bowling] Failed to detach locale listener:', error);
      }
      detachLocale = null;
      if(ownsLocalization && localization && typeof localization.destroy === 'function'){
        try { localization.destroy(); } catch (error) {
          console.warn('[bowling] Failed to dispose localization helper:', error);
        }
      }
      container.remove();
    }
    function getScore(){ const totals = updateTotals(); return totals.player; }

    const stageOrder = ['aim', 'curve', 'power'];
    const stageInfo = {
      aim: {
        getPrompt: () => localize('stage.aim.prompt', null, () => fallbackText('stage.aim.prompt')),
        getButton: () => localize('stage.aim.button', null, () => fallbackText('stage.aim.button')),
        getConfirm: v => localize('stage.aim.confirm', { value: aimSlider.formatter(v) }, () => fallbackText('stage.aim.confirm', { value: aimSlider.formatter(v) }))
      },
      curve: {
        getPrompt: () => localize('stage.curve.prompt', null, () => fallbackText('stage.curve.prompt')),
        getButton: () => localize('stage.curve.button', null, () => fallbackText('stage.curve.button')),
        getConfirm: v => localize('stage.curve.confirm', { value: curveSlider.formatter(v) }, () => fallbackText('stage.curve.confirm', { value: curveSlider.formatter(v) }))
      },
      power: {
        getPrompt: () => localize('stage.power.prompt', null, () => fallbackText('stage.power.prompt')),
        getButton: () => localize('stage.power.button', null, () => fallbackText('stage.power.button')),
        getConfirm: v => localize('stage.power.confirm', { value: powerSlider.formatter(v) }, () => fallbackText('stage.power.confirm', { value: powerSlider.formatter(v) }))
      }
    };

    function beginStage(stage){
      selectionStage = stage;
      const info = stageInfo[stage];
      statusSnapshot = { mode: 'stagePrompt', stage };
      statusLine.textContent = info.getPrompt();
      throwBtn.disabled = false;
      setThrowState({ mode: 'stage', stage });
      oscillators[stage].start();
    }

    function completeStage(){
      if(!selectionStage) return;
      const stage = selectionStage;
      const info = stageInfo[stage];
      const value = oscillators[stage].stop();
      pendingParams[stage] = value;
      statusSnapshot = { mode: 'stageConfirm', stage, value };
      statusLine.textContent = info.getConfirm(value);
      const idx = stageOrder.indexOf(stage);
      if(idx < stageOrder.length - 1){
        beginStage(stageOrder[idx + 1]);
      } else {
        selectionStage = null;
        setThrowState({ mode: 'rolling' });
        playerThrow(pendingParams.aim, pendingParams.curve, pendingParams.power);
      }
    }

    throwBtn.addEventListener('click', ()=>{
      if(ended || frameIndex >= 10 || turn !== 'player') return;
      if(selectionStage){
        completeStage();
      } else {
        ensureRunning();
        pendingParams.aim = pendingParams.curve = pendingParams.power = 0;
        beginStage('aim');
      }
    });
    resetBtn.addEventListener('click', ()=>{ resetState(); shortcuts?.disableKey?.('r'); });

    function applyLocale(){
      title.textContent = localize('title', null, () => fallbackText('title'));
      aimSlider.setLabel(localize('sliders.aim.label', null, () => fallbackText('sliders.aim.label')));
      curveSlider.setLabel(localize('sliders.curve.label', null, () => fallbackText('sliders.curve.label')));
      powerSlider.setLabel(localize('sliders.power.label', null, () => fallbackText('sliders.power.label')));
      aimSlider.refresh();
      curveSlider.refresh();
      powerSlider.refresh();
      legend.textContent = localize('legend', null, () => fallbackText('legend'));
      resetBtn.textContent = localize('buttons.reset', null, () => fallbackText('buttons.reset'));
      playerRow.labelSpan.textContent = localize('scoreboard.you', null, () => fallbackText('scoreboard.you'));
      cpuRow.labelSpan.textContent = localize('scoreboard.cpu', null, () => fallbackText('scoreboard.cpu'));
      totalTh.textContent = localize('scoreboard.total', null, () => fallbackText('scoreboard.total'));
      renderHistory();
      applyStatusSnapshot();
      updateThrowButton();
    }

    applyLocale();

    let localeListenerAttached = false;
    if(localization && typeof localization.onChange === 'function'){
      try {
        const unsubscribe = localization.onChange(() => { applyLocale(); });
        localeListenerAttached = true;
        detachLocale = typeof unsubscribe === 'function' ? unsubscribe : null;
      } catch (error) {
        console.warn('[bowling] Failed to attach localization listener via helper:', error);
      }
    }
    if(!localeListenerAttached && typeof globalI18n?.onLocaleChanged === 'function'){
      try {
        const unsubscribe = globalI18n.onLocaleChanged(() => { applyLocale(); });
        detachLocale = typeof unsubscribe === 'function' ? unsubscribe : null;
        localeListenerAttached = true;
      } catch (error) {
        console.warn('[bowling] Failed to attach localization listener:', error);
      }
    }

    resetState();

    applyStatusSnapshot();
    updateThrowButton();

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({
    id: 'bowling_duel',
    name: 'ボウリング対決', nameKey: 'selection.miniexp.games.bowling_duel.name',
    description: '動くゲージを止めて狙い・カーブ・パワーを決めるCPU対決ボウリングMOD', descriptionKey: 'selection.miniexp.games.bowling_duel.description', categoryIds: ['action'],
    create
  });
})();

(function(){
  const STYLE_ID = 'mini-gamble-hall-style';
  function ensureStyles(){
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .mini-gamble-hall{position:relative;display:flex;flex-direction:column;gap:18px;padding:16px 20px;color:#e2e8f0;font-family:"Segoe UI","Hiragino Sans","BIZ UDPGothic",sans-serif;background:radial-gradient(circle at top,#0f172a 0%,#020617 70%);border-radius:22px;overflow:hidden;box-shadow:0 18px 60px rgba(2,6,23,0.65);}
      .mini-gamble-hall::before{content:'';position:absolute;inset:-30%;background:conic-gradient(from 45deg,rgba(59,130,246,0.05),rgba(14,165,233,0.18),rgba(236,72,153,0.08),rgba(59,130,246,0.05));filter:blur(40px);animation:mini-gh-aurora 18s linear infinite;}
      .mini-gamble-hall::after{content:'';position:absolute;inset:0;background:radial-gradient(circle at 80% 20%,rgba(236,72,153,0.08),transparent 45%),radial-gradient(circle at 20% 80%,rgba(56,189,248,0.08),transparent 40%);pointer-events:none;}
      @keyframes mini-gh-aurora{0%{transform:rotate(0deg) scale(1.1);}100%{transform:rotate(360deg) scale(1.1);}}
      .mini-gamble-hall > *{position:relative;z-index:1;}
      .mini-gh-header{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end;background:rgba(15,23,42,0.55);padding:12px 16px;border-radius:16px;border:1px solid rgba(148,163,184,0.22);}
      .mini-gh-balance{flex:1 1 160px;display:flex;flex-direction:column;gap:4px;}
      .mini-gh-balance span.label{font-size:12px;color:#94a3b8;letter-spacing:0.04em;}
      .mini-gh-balance strong{font-size:20px;font-weight:700;color:#38bdf8;}
      .mini-gh-bet{display:flex;flex-direction:column;gap:6px;}
      .mini-gh-bet-input{display:flex;gap:8px;align-items:center;}
      .mini-gh-bet-input input{width:120px;padding:6px 10px;border-radius:10px;border:1px solid rgba(148,163,184,0.3);background:rgba(15,23,42,0.75);color:#e2e8f0;font-size:14px;}
      .mini-gh-bet-input button{padding:6px 10px;border-radius:10px;border:1px solid rgba(148,163,184,0.25);background:rgba(30,41,59,0.85);color:#cbd5f5;cursor:pointer;font-size:12px;transition:background 0.2s,border-color 0.2s;}
      .mini-gh-bet-input button:hover{background:rgba(51,65,85,0.95);border-color:rgba(59,130,246,0.45);}
      .mini-gh-session{min-width:160px;display:flex;flex-direction:column;gap:4px;text-align:right;}
      .mini-gh-session .net{font-weight:700;font-size:16px;}
      .mini-gh-session .net.positive{color:#4ade80;}
      .mini-gh-session .net.negative{color:#f87171;}
      .mini-gh-tabs{display:flex;gap:10px;}
      .mini-gh-tabs button{flex:1;border:none;padding:12px 14px;border-radius:14px;background:linear-gradient(135deg,rgba(30,41,59,0.85),rgba(15,23,42,0.85));color:#cbd5f5;font-weight:600;cursor:pointer;letter-spacing:0.04em;transition:background 0.25s,transform 0.2s,box-shadow 0.25s;box-shadow:0 10px 24px rgba(2,6,23,0.45);}
      .mini-gh-tabs button:hover{background:linear-gradient(135deg,rgba(51,65,85,0.9),rgba(15,23,42,0.95));transform:translateY(-1px);}
      .mini-gh-tabs button.active{background:linear-gradient(135deg,#6366f1,#38bdf8);color:#fff;box-shadow:0 14px 28px rgba(59,130,246,0.36);transform:translateY(-2px);}
      .mini-gh-panels{background:rgba(15,23,42,0.6);border-radius:18px;border:1px solid rgba(148,163,184,0.2);padding:18px;min-height:240px;}
      .mini-gh-panel{display:none;gap:16px;}
      .mini-gh-panel.active{display:flex;flex-direction:column;}
      .mini-gh-status{padding:12px 16px;border-radius:14px;background:rgba(30,41,59,0.8);border:1px solid rgba(148,163,184,0.25);font-size:13px;color:#cbd5f5;box-shadow:0 12px 26px rgba(2,6,23,0.35);transition:transform 0.35s ease,box-shadow 0.35s ease;}
      .mini-gh-status.pulse-win{transform:translateY(-2px) scale(1.01);box-shadow:0 16px 34px rgba(74,222,128,0.35);}
      .mini-gh-status.pulse-loss{transform:translateY(2px) scale(0.99);box-shadow:0 16px 34px rgba(248,113,113,0.28);}
      .mini-gh-status.win{border-color:rgba(74,222,128,0.6);color:#bbf7d0;background:rgba(22,101,52,0.4);}
      .mini-gh-status.loss{border-color:rgba(248,113,113,0.6);color:#fecaca;background:rgba(127,29,29,0.4);}
      .mini-gh-status.warn{border-color:rgba(248,191,22,0.6);color:#fef08a;background:rgba(113,63,18,0.45);}
      .mini-gh-status.info{border-color:rgba(96,165,250,0.55);color:#bfdbfe;background:rgba(30,64,175,0.4);}
      .mini-gh-history{background:rgba(15,23,42,0.55);border-radius:14px;border:1px solid rgba(148,163,184,0.18);padding:14px;}
      .mini-gh-history h3{margin:0 0 8px;font-size:13px;color:#94a3b8;letter-spacing:0.05em;}
      .mini-gh-history-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px;max-height:160px;overflow:auto;}
      .mini-gh-history-list li{padding:10px 12px;border-radius:12px;background:rgba(30,41,59,0.72);display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#cbd5f5;border-left:3px solid transparent;position:relative;overflow:hidden;}
      .mini-gh-history-list li::after{content:'';position:absolute;inset:0;background:linear-gradient(120deg,rgba(148,163,184,0.08),rgba(148,163,184,0));opacity:0;transition:opacity 0.4s;}
      .mini-gh-history-list li.new::after{opacity:1;}
      .mini-gh-history-list li.win{border-left-color:#4ade80;}
      .mini-gh-history-list li.loss{border-left-color:#f87171;}
      .mini-gh-history-list li .meta{color:#94a3b8;font-size:11px;}
      .mini-gh-roulette-layout{display:flex;flex-direction:column;gap:16px;}
      .mini-gh-roulette-wheel{width:160px;height:160px;margin:0 auto;position:relative;border-radius:50%;background:radial-gradient(circle at center,#1e293b 0%,#0f172a 65%,#020617 100%);border:4px solid rgba(148,163,184,0.35);box-shadow:0 12px 30px rgba(2,6,23,0.65);overflow:hidden;display:flex;align-items:center;justify-content:center;}
      .mini-gh-roulette-wheel::after{content:'';position:absolute;width:14px;height:14px;border-radius:50%;background:#e2e8f0;box-shadow:0 0 12px rgba(226,232,240,0.55);}
      .mini-gh-wheel-result{position:absolute;text-align:center;font-size:26px;font-weight:700;color:#f8fafc;text-shadow:0 3px 8px rgba(0,0,0,0.35);}
      .mini-gh-wheel-color{font-size:13px;font-weight:600;margin-top:36px;text-transform:uppercase;letter-spacing:0.08em;}
      .mini-gh-roulette-wheel.spinning{animation:mini-gh-roulette-spin 0.9s ease-out;}
      @keyframes mini-gh-roulette-spin{0%{transform:rotate(0deg);}100%{transform:rotate(540deg);}}
      .mini-gh-pointer{position:absolute;top:-20px;left:50%;width:0;height:0;border-left:10px solid transparent;border-right:10px solid transparent;border-bottom:18px solid rgba(248,250,252,0.82);transform:translateX(-50%);filter:drop-shadow(0 6px 10px rgba(15,23,42,0.6));pointer-events:none;}
      .mini-gh-roulette-controls{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end;justify-content:center;}
      .mini-gh-roulette-controls select,.mini-gh-roulette-controls button{padding:8px 12px;border-radius:10px;border:1px solid rgba(148,163,184,0.25);background:rgba(30,41,59,0.8);color:#cbd5f5;cursor:pointer;}
      .mini-gh-roulette-controls select{min-width:120px;}
      .mini-gh-slot{display:flex;flex-direction:column;gap:16px;align-items:center;}
      .mini-gh-slot-reels{display:flex;gap:12px;justify-content:center;}
      .mini-gh-slot-reel{width:72px;height:72px;border-radius:14px;border:2px solid rgba(148,163,184,0.35);background:linear-gradient(160deg,rgba(30,41,59,0.9),rgba(15,23,42,0.9));display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;color:#f8fafc;box-shadow:0 8px 20px rgba(2,6,23,0.55);transition:transform 0.2s;}
      .mini-gh-slot.running .mini-gh-slot-reel{animation:mini-gh-slot-spin 0.4s linear infinite;}
      @keyframes mini-gh-slot-spin{0%{transform:translateY(0);}50%{transform:translateY(-6px);}100%{transform:translateY(0);}}
      .mini-gh-slot button{padding:10px 18px;border-radius:14px;border:1px solid rgba(59,130,246,0.45);background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#fff;font-weight:600;cursor:pointer;box-shadow:0 10px 24px rgba(14,165,233,0.3);transition:transform 0.15s,box-shadow 0.15s;}
      .mini-gh-slot button:active{transform:translateY(1px);box-shadow:0 6px 18px rgba(14,165,233,0.26);}
      .mini-gh-small{font-size:11px;color:#94a3b8;text-align:center;}
      .mini-gh-dice{display:flex;flex-direction:column;gap:18px;align-items:center;}
      .mini-gh-dice-rolling{display:flex;gap:14px;}
      .mini-gh-die{width:62px;height:62px;border-radius:18px;background:linear-gradient(145deg,rgba(30,41,59,0.92),rgba(15,23,42,0.92));border:2px solid rgba(148,163,184,0.35);display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:700;color:#f8fafc;box-shadow:0 10px 24px rgba(2,6,23,0.55);transition:transform 0.25s ease;}
      .mini-gh-die.roll{animation:mini-gh-die-roll 0.6s ease-in-out infinite;}
      @keyframes mini-gh-die-roll{0%{transform:rotateX(0deg) rotateY(0deg);}50%{transform:rotateX(18deg) rotateY(-24deg) translateY(-6px);}100%{transform:rotateX(0deg) rotateY(0deg);}}
      .mini-gh-dice-controls{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;}
      .mini-gh-dice-controls select,.mini-gh-dice-controls button{padding:10px 16px;border-radius:12px;border:1px solid rgba(148,163,184,0.25);background:rgba(30,41,59,0.85);color:#cbd5f5;font-weight:600;cursor:pointer;transition:transform 0.2s,box-shadow 0.2s;}
      .mini-gh-dice-controls button{background:linear-gradient(135deg,#22d3ee,#6366f1);color:#0f172a;box-shadow:0 12px 30px rgba(34,211,238,0.35);}
      .mini-gh-dice-controls button:active{transform:translateY(1px);box-shadow:0 8px 18px rgba(34,211,238,0.28);}
    `;
    document.head.appendChild(style);
  }

  function formatDelta(v){
    const n = Math.round(Number(v)||0);
    if (n > 0) return `+${n}`;
    if (n < 0) return `${n}`;
    return '±0';
  }

  function create(root, awardXp, opts){
    ensureStyles();
    const disposers = [];
    const state = {
      currentGame: 'roulette',
      netExp: 0,
      biggestWin: 0,
      history: [],
      slotSpinInterval: null,
      slotStopTimer: null,
      slotBusy: false,
      diceInterval: null,
      diceStopTimer: null,
      diceRolling: false
    };

    const layout = document.createElement('div');
    layout.className = 'mini-gamble-hall';
    root.appendChild(layout);

    let diceEls = [];
    let diceModeSelect;
    let diceButton;
    let diceHint;
    let diceResultEl;

    function getBalance(){
      try {
        if (typeof window.getMiniExpBalance === 'function') return window.getMiniExpBalance();
      } catch {}
      const playerExp = (window.player && window.player.exp) || 0;
      return Math.max(0, Math.floor(playerExp));
    }

    function setStatus(text, tone){
      statusEl.textContent = text;
      statusEl.className = 'mini-gh-status';
      statusEl.classList.remove('pulse-win','pulse-loss');
      if (tone){
        statusEl.classList.add(tone);
        if (tone === 'win') statusEl.classList.add('pulse-win');
        if (tone === 'loss') statusEl.classList.add('pulse-loss');
      }
    }

    function updateSessionHud(){
      sessionNetEl.textContent = formatDelta(state.netExp) + ' EXP';
      sessionNetEl.classList.remove('positive','negative');
      if (state.netExp > 0) sessionNetEl.classList.add('positive');
      else if (state.netExp < 0) sessionNetEl.classList.add('negative');
      biggestWinEl.textContent = `${Math.round(Math.max(0,state.biggestWin))} EXP`;
    }

    function renderBalance(){
      balanceValueEl.textContent = `${getBalance()} EXP`;
    }

    function setBetValue(v){
      const max = getBalance();
      const sanitized = Math.max(0, Math.min(max, Math.floor(Number(v)||0)));
      betInput.value = sanitized ? String(sanitized) : '';
    }

    function getBetAmount(){
      return Math.max(0, Math.floor(Number(betInput.value)||0));
    }

    function clampBet(){
      const amt = getBetAmount();
      const max = getBalance();
      if (amt > max) setBetValue(max);
      if (amt < 0) setBetValue(0);
    }

    function adjustBet(delta){
      const amt = getBetAmount();
      setBetValue(amt + delta);
    }

    function pushHistory(entry){
      state.history.unshift(entry);
      if (state.history.length > 5) state.history.pop();
      renderHistory();
      const firstItem = historyList.querySelector('li');
      if (firstItem){
        firstItem.classList.add('new');
        setTimeout(() => firstItem.classList.remove('new'), 600);
      }
    }

    function renderHistory(){
      historyList.innerHTML = '';
      if (!state.history.length){
        const empty = document.createElement('div');
        empty.className = 'mini-gh-small';
        empty.textContent = 'まだ履歴がありません。';
        historyList.appendChild(empty);
        return;
      }
      for (const entry of state.history){
        const li = document.createElement('li');
        if (entry.net > 0) li.classList.add('win');
        else if (entry.net < 0) li.classList.add('loss');
        const left = document.createElement('div');
        left.innerHTML = `<strong>${entry.game}</strong> <span class="meta">BET ${entry.bet} / ${entry.detail}</span>`;
        const right = document.createElement('div');
        right.textContent = formatDelta(entry.net);
        li.appendChild(left);
        li.appendChild(right);
        historyList.appendChild(li);
      }
    }

    function stopSlotTimers(){
      if (state.slotSpinInterval){ clearInterval(state.slotSpinInterval); state.slotSpinInterval = null; }
      if (state.slotStopTimer){ clearTimeout(state.slotStopTimer); state.slotStopTimer = null; }
      state.slotBusy = false;
      slotPanel.classList.remove('running');
    }

    function stopDiceTimers(){
      if (state.diceInterval){ clearInterval(state.diceInterval); state.diceInterval = null; }
      if (state.diceStopTimer){ clearTimeout(state.diceStopTimer); state.diceStopTimer = null; }
      state.diceRolling = false;
      diceEls.forEach(el => el.classList.remove('roll'));
    }

    function applyDelta(delta){
      state.netExp += delta;
      if (delta > 0) state.biggestWin = Math.max(state.biggestWin, delta);
      updateSessionHud();
    }

    function handleRoulette(){
      clampBet();
      const bet = getBetAmount();
      if (bet <= 0){ setStatus('ベット額を入力してください。', 'warn'); return; }
      if (getBalance() <= 0){ setStatus('利用可能なEXPがありません。', 'warn'); return; }
      const spendDelta = awardXp(-bet);
      if (!spendDelta){
        renderBalance();
        setStatus('EXPが不足しています。', 'warn');
        return;
      }
      const actualBet = Math.abs(Math.round(spendDelta));
      applyDelta(spendDelta);
      const result = Math.floor(Math.random() * 12);
      const color = result === 0 ? 'green' : (result % 2 === 0 ? 'black' : 'red');
      const colorLabel = color === 'red' ? '赤' : color === 'black' ? '黒' : '緑';
      let multiplier = 0;
      let hitText = 'ハズレ';
      const type = betTypeSelect.value;
      if (type === 'color_red'){ multiplier = color === 'red' ? 2 : 0; hitText = multiplier ? '赤的中' : '赤ハズレ'; }
      else if (type === 'color_black'){ multiplier = color === 'black' ? 2 : 0; hitText = multiplier ? '黒的中' : '黒ハズレ'; }
      else if (type === 'color_green'){ multiplier = result === 0 ? 14 : 0; hitText = multiplier ? '0ヒット！' : '緑ハズレ'; }
      else if (type === 'parity_even'){ multiplier = (result !== 0 && result % 2 === 0) ? 2 : 0; hitText = multiplier ? '偶数的中' : '偶数ハズレ'; }
      else if (type === 'parity_odd'){ multiplier = result % 2 === 1 ? 2 : 0; hitText = multiplier ? '奇数的中' : '奇数ハズレ'; }
      else if (type === 'number'){ const pick = Number(numberSelect.value)||0; multiplier = result === pick ? 12 : 0; hitText = multiplier ? `${pick} 的中！` : `${pick} ハズレ`; }
      const payout = multiplier > 0 ? Math.round(actualBet * multiplier) : 0;
      let gainDelta = 0;
      if (payout > 0){
        const gained = awardXp(payout);
        gainDelta = Number(gained)||0;
        applyDelta(gainDelta);
      }
      const net = spendDelta + gainDelta;
      rouletteWheel.classList.remove('spinning');
      void rouletteWheel.offsetWidth; // reflow to restart animation
      rouletteWheel.classList.add('spinning');
      rouletteNumberEl.textContent = result;
      rouletteColorEl.textContent = colorLabel;
      rouletteColorEl.style.color = color === 'red' ? '#f87171' : color === 'black' ? '#cbd5f5' : '#4ade80';
      const tone = net > 0 ? 'win' : (net < 0 ? 'loss' : 'info');
      setStatus(`ルーレット: ${hitText} (${colorLabel} / ${result}) ${formatDelta(net)} EXP`, tone);
      pushHistory({ game: 'ルーレット', bet: actualBet, detail: `No.${result} ${colorLabel}`, net });
      renderBalance();
      setBetValue(actualBet); // 直前のベット額を保持
    }

    const slotSymbols = ['7', 'BAR', 'W', '☆', '鈴', '🍒'];
    function randomSymbol(){ return slotSymbols[Math.floor(Math.random() * slotSymbols.length)]; }

    function evaluateSlot(symbols){
      const [a,b,c] = symbols;
      const counts = symbols.reduce((map, sym) => { map[sym] = (map[sym]||0)+1; return map; }, {});
      if (a === '7' && b === '7' && c === '7') return { multiplier: 18, label: '777ジャックポット！' };
      if (a === 'BAR' && b === 'BAR' && c === 'BAR') return { multiplier: 12, label: 'BAR揃い！' };
      if (counts[a] === 3 || counts[b] === 3 || counts[c] === 3) return { multiplier: 9, label: 'トリプルヒット！' };
      const entries = Object.entries(counts);
      const pair = entries.find(([sym,count]) => count === 2);
      if (pair){
        if (symbols.includes('☆')) return { multiplier: 4, label: `${pair[0]} ペア＋スター！` };
        return { multiplier: 2, label: `${pair[0]} ペア！` };
      }
      return { multiplier: 0, label: 'ハズレ…' };
    }

    const diceFaces = ['⚀','⚁','⚂','⚃','⚄','⚅'];
    const diceModes = {
      high: { label: 'ハイ (11-18)', multiplier: 2, hint: '合計が11以上で配当x2。ゾロ目は対象外。', check: ({ total, isTriple }) => total >= 11 && !isTriple },
      low: { label: 'ロー (3-10)', multiplier: 2, hint: '合計が10以下で配当x2。ゾロ目は対象外。', check: ({ total, isTriple }) => total <= 10 && !isTriple },
      lucky7: { label: 'ラッキー7', multiplier: 9, hint: '合計7ちょうどで高配当！', check: ({ total }) => total === 7 },
      all_diff: { label: 'バラバラ', multiplier: 4, hint: '3つとも違う目で配当x4。', check: ({ uniqueCount, isTriple }) => uniqueCount === 3 && !isTriple },
      triple: { label: 'ゾロ目', multiplier: 24, hint: '全て同じ目で超高配当！', check: ({ isTriple }) => isTriple }
    };
    function faceFromNumber(num){ return diceFaces[Math.max(1, Math.min(6, num)) - 1]; }
    function rollDie(){ return Math.floor(Math.random() * 6) + 1; }

    function handleSlot(){
      clampBet();
      const bet = getBetAmount();
      if (bet <= 0){ setStatus('ベット額を入力してください。', 'warn'); return; }
      if (state.slotBusy){ setStatus('リール停止を待っています…', 'warn'); return; }
      const spendDelta = awardXp(-bet);
      if (!spendDelta){ renderBalance(); setStatus('EXPが不足しています。', 'warn'); return; }
      const actualBet = Math.abs(Math.round(spendDelta));
      applyDelta(spendDelta);
      state.slotBusy = true;
      slotPanel.classList.add('running');
      setStatus('リール回転中…', 'info');
      const spinInterval = setInterval(() => {
        reelEls.forEach((el, idx) => { el.textContent = randomSymbol(); });
      }, 120);
      state.slotSpinInterval = spinInterval;
      const stopAfter = 1200;
      const finalSymbols = [randomSymbol(), randomSymbol(), randomSymbol()];
      state.slotStopTimer = setTimeout(() => {
        stopSlotTimers();
        for (let i=0;i<reelEls.length;i++) reelEls[i].textContent = finalSymbols[i];
        const result = evaluateSlot(finalSymbols);
        const payout = result.multiplier > 0 ? Math.round(actualBet * result.multiplier) : 0;
        let gainDelta = 0;
        if (payout > 0){
          const gained = awardXp(payout);
          gainDelta = Number(gained)||0;
          applyDelta(gainDelta);
        }
        const net = spendDelta + gainDelta;
        const tone = net > 0 ? 'win' : (net < 0 ? 'loss' : 'info');
        setStatus(`スロット: ${result.label} ${formatDelta(net)} EXP`, tone);
        pushHistory({ game: 'スロット', bet: actualBet, detail: finalSymbols.join(' | '), net });
        renderBalance();
        setBetValue(actualBet);
      }, stopAfter);
    }

    function updateDiceHint(){
      if (!diceHint) return;
      const mode = diceModes[diceModeSelect && diceModeSelect.value];
      if (mode){
        diceHint.textContent = `${mode.hint} (x${mode.multiplier})`;
      } else {
        diceHint.textContent = '';
      }
    }

    function handleDice(){
      clampBet();
      const bet = getBetAmount();
      if (bet <= 0){ setStatus('ベット額を入力してください。', 'warn'); return; }
      if (state.diceRolling){ setStatus('結果表示をお待ちください…', 'warn'); return; }
      const spendDelta = awardXp(-bet);
      if (!spendDelta){ renderBalance(); setStatus('EXPが不足しています。', 'warn'); return; }
      const actualBet = Math.abs(Math.round(spendDelta));
      applyDelta(spendDelta);
      state.diceRolling = true;
      diceResultEl.textContent = 'ロール中…';
      diceEls.forEach(el => el.classList.add('roll'));
      setStatus('ダイスを振っています…', 'info');
      state.diceInterval = setInterval(() => {
        diceEls.forEach(el => { el.textContent = faceFromNumber(rollDie()); });
      }, 100);
      const final = [rollDie(), rollDie(), rollDie()];
      state.diceStopTimer = setTimeout(() => {
        stopDiceTimers();
        final.forEach((value, idx) => { diceEls[idx].textContent = faceFromNumber(value); });
        const total = final.reduce((sum, v) => sum + v, 0);
        const uniqueCount = new Set(final).size;
        const isTriple = uniqueCount === 1;
        const modeKey = diceModeSelect ? diceModeSelect.value : 'high';
        const mode = diceModes[modeKey] || diceModes.high;
        const hit = mode && mode.check ? mode.check({ total, uniqueCount, isTriple, values: final }) : false;
        const payout = hit ? Math.round(actualBet * mode.multiplier) : 0;
        let gainDelta = 0;
        if (payout > 0){
          const gained = awardXp(payout);
          gainDelta = Number(gained)||0;
          applyDelta(gainDelta);
        }
        const net = spendDelta + gainDelta;
        const tone = net > 0 ? 'win' : (net < 0 ? 'loss' : 'info');
        const faces = final.map(faceFromNumber).join(' ');
        diceResultEl.textContent = `出目 ${faces} (合計 ${total})`;
        const modeLabel = mode ? mode.label : '不明';
        setStatus(`ダイス: ${modeLabel} ${hit ? '的中！' : 'ハズレ…'} ${formatDelta(net)} EXP`, tone);
        pushHistory({ game: 'ラッキーダイス', bet: actualBet, detail: `${faces} / 合計${total}`, net });
        renderBalance();
        setBetValue(actualBet);
      }, 1200);
    }

    // Header UI
    const header = document.createElement('div');
    header.className = 'mini-gh-header';
    layout.appendChild(header);

    const balanceBox = document.createElement('div');
    balanceBox.className = 'mini-gh-balance';
    balanceBox.innerHTML = `<span class="label">利用可能EXP</span>`;
    const balanceValueEl = document.createElement('strong');
    balanceBox.appendChild(balanceValueEl);
    header.appendChild(balanceBox);

    const betBox = document.createElement('div');
    betBox.className = 'mini-gh-bet';
    betBox.innerHTML = '<span class="label">ベット額</span>';
    const betInputRow = document.createElement('div');
    betInputRow.className = 'mini-gh-bet-input';
    const betInput = document.createElement('input');
    betInput.type = 'number';
    betInput.min = '0';
    betInput.step = '10';
    betInput.placeholder = '10';
    betInputRow.appendChild(betInput);
    const btnPlus10 = document.createElement('button'); btnPlus10.textContent = '+10';
    const btnPlus50 = document.createElement('button'); btnPlus50.textContent = '+50';
    const btnMax = document.createElement('button'); btnMax.textContent = 'MAX';
    betInputRow.append(btnPlus10, btnPlus50, btnMax);
    betBox.appendChild(betInputRow);
    header.appendChild(betBox);

    const sessionBox = document.createElement('div');
    sessionBox.className = 'mini-gh-session';
    sessionBox.innerHTML = `<span class="label">セッション収支</span>`;
    const sessionNetEl = document.createElement('div'); sessionNetEl.className = 'net'; sessionBox.appendChild(sessionNetEl);
    const biggestWrap = document.createElement('div'); biggestWrap.className = 'mini-gh-small'; biggestWrap.textContent = '最大獲得';
    const biggestWinEl = document.createElement('div'); biggestWinEl.className = 'mini-gh-small'; sessionBox.append(biggestWrap, biggestWinEl);
    header.appendChild(sessionBox);

    // Tabs
    const tabRow = document.createElement('div');
    tabRow.className = 'mini-gh-tabs';
    const tabRoulette = document.createElement('button'); tabRoulette.textContent = 'ルーレット';
    const tabSlot = document.createElement('button'); tabSlot.textContent = 'パチンコスロット';
    const tabDice = document.createElement('button'); tabDice.textContent = 'ラッキーダイス';
    tabRow.append(tabRoulette, tabSlot, tabDice);
    layout.appendChild(tabRow);

    const panels = document.createElement('div');
    panels.className = 'mini-gh-panels';
    layout.appendChild(panels);

    // Roulette panel
    const roulettePanel = document.createElement('div');
    roulettePanel.className = 'mini-gh-panel mini-gh-roulette-layout';
    roulettePanel.innerHTML = `
      <div class="mini-gh-roulette-wheel">
        <div class="mini-gh-pointer"></div>
        <div class="mini-gh-wheel-result"><span class="num">--</span><div class="mini-gh-wheel-color">-</div></div>
      </div>
      <div class="mini-gh-roulette-controls">
        <select class="mini-gh-roulette-type">
          <option value="color_red">赤</option>
          <option value="color_black">黒</option>
          <option value="color_green">緑(0)</option>
          <option value="parity_even">偶数</option>
          <option value="parity_odd">奇数</option>
          <option value="number">番号指定</option>
        </select>
        <select class="mini-gh-roulette-number" disabled></select>
        <button class="mini-gh-roulette-spin">スピン</button>
      </div>
    `;
    panels.appendChild(roulettePanel);

    const rouletteWheel = roulettePanel.querySelector('.mini-gh-roulette-wheel');
    const rouletteNumberEl = roulettePanel.querySelector('.mini-gh-wheel-result .num');
    const rouletteColorEl = roulettePanel.querySelector('.mini-gh-wheel-color');
    const betTypeSelect = roulettePanel.querySelector('.mini-gh-roulette-type');
    const numberSelect = roulettePanel.querySelector('.mini-gh-roulette-number');
    const spinButton = roulettePanel.querySelector('.mini-gh-roulette-spin');
    for (let i=0;i<12;i++){
      const opt = document.createElement('option');
      opt.value = String(i);
      opt.textContent = `No.${i}`;
      numberSelect.appendChild(opt);
    }

    const slotPanel = document.createElement('div');
    slotPanel.className = 'mini-gh-panel mini-gh-slot';
    const reelsWrap = document.createElement('div'); reelsWrap.className = 'mini-gh-slot-reels';
    const reelEls = Array.from({length:3}).map(() => {
      const el = document.createElement('div');
      el.className = 'mini-gh-slot-reel';
      el.textContent = randomSymbol();
      reelsWrap.appendChild(el);
      return el;
    });
    const slotButton = document.createElement('button'); slotButton.textContent = 'スタート';
    const slotHint = document.createElement('div'); slotHint.className = 'mini-gh-small'; slotHint.textContent = '同じ絵柄やスター付きペアで配当アップ！';
    slotPanel.append(reelsWrap, slotButton, slotHint);
    panels.appendChild(slotPanel);

    const dicePanel = document.createElement('div');
    dicePanel.className = 'mini-gh-panel mini-gh-dice';
    const diceRollWrap = document.createElement('div'); diceRollWrap.className = 'mini-gh-dice-rolling';
    diceEls = Array.from({ length: 3 }).map(() => {
      const el = document.createElement('div');
      el.className = 'mini-gh-die';
      el.textContent = faceFromNumber(rollDie());
      diceRollWrap.appendChild(el);
      return el;
    });
    const diceControls = document.createElement('div'); diceControls.className = 'mini-gh-dice-controls';
    diceModeSelect = document.createElement('select');
    Object.entries(diceModes).forEach(([value, mode]) => {
      const opt = document.createElement('option');
      opt.value = value;
      opt.textContent = `${mode.label} x${mode.multiplier}`;
      diceModeSelect.appendChild(opt);
    });
    diceButton = document.createElement('button'); diceButton.textContent = 'ロール';
    diceControls.append(diceModeSelect, diceButton);
    diceHint = document.createElement('div'); diceHint.className = 'mini-gh-small';
    diceResultEl = document.createElement('div'); diceResultEl.className = 'mini-gh-small'; diceResultEl.textContent = '---';
    dicePanel.append(diceRollWrap, diceControls, diceHint, diceResultEl);
    panels.appendChild(dicePanel);
    updateDiceHint();

    const statusEl = document.createElement('div');
    statusEl.className = 'mini-gh-status';
    statusEl.textContent = 'ベットしてゲームを始めましょう。';
    layout.appendChild(statusEl);

    const historyBox = document.createElement('div');
    historyBox.className = 'mini-gh-history';
    historyBox.innerHTML = '<h3>直近の結果</h3>';
    const historyList = document.createElement('div');
    historyList.className = 'mini-gh-history-list';
    historyBox.appendChild(historyList);
    layout.appendChild(historyBox);

    function switchGame(id){
      state.currentGame = id;
      tabRoulette.classList.toggle('active', id === 'roulette');
      tabSlot.classList.toggle('active', id === 'slot');
      tabDice.classList.toggle('active', id === 'dice');
      roulettePanel.classList.toggle('active', id === 'roulette');
      slotPanel.classList.toggle('active', id === 'slot');
      dicePanel.classList.toggle('active', id === 'dice');
    }

    switchGame('roulette');

    function bind(el, evt, handler){
      el.addEventListener(evt, handler);
      disposers.push(() => el.removeEventListener(evt, handler));
    }

    bind(betInput, 'change', () => { clampBet(); });
    bind(betInput, 'input', () => { clampBet(); });
    bind(btnPlus10, 'click', () => { adjustBet(10); });
    bind(btnPlus50, 'click', () => { adjustBet(50); });
    bind(btnMax, 'click', () => { setBetValue(getBalance()); });
    bind(tabRoulette, 'click', () => { switchGame('roulette'); });
    bind(tabSlot, 'click', () => { switchGame('slot'); });
    bind(tabDice, 'click', () => { switchGame('dice'); });
    bind(betTypeSelect, 'change', () => {
      const useNumber = betTypeSelect.value === 'number';
      numberSelect.disabled = !useNumber;
    });
    bind(spinButton, 'click', () => handleRoulette());
    bind(numberSelect, 'change', () => clampBet());
    bind(slotButton, 'click', () => handleSlot());
    bind(diceModeSelect, 'change', () => updateDiceHint());
    bind(diceButton, 'click', () => handleDice());

    function start(){
      state.netExp = 0;
      state.biggestWin = 0;
      state.history = [];
      renderBalance();
      updateSessionHud();
      renderHistory();
      rouletteNumberEl.textContent = '--';
      rouletteColorEl.textContent = '-';
      diceEls.forEach(el => { el.textContent = faceFromNumber(rollDie()); });
      diceResultEl.textContent = '---';
      updateDiceHint();
      setBetValue(10);
      setStatus('ベットしてゲームを始めましょう。');
    }

    function stop(){
      stopSlotTimers();
      stopDiceTimers();
    }

    function destroy(){
      stop();
      disposers.splice(0).forEach(fn => { try { fn(); } catch {} });
      try { layout.remove(); } catch {}
    }

    return { start, stop, destroy, getScore: () => Math.round(Math.max(0, state.biggestWin)) };
  }

  window.registerMiniGame({ id: 'gamble_hall', name: 'ギャンブルホール', description: 'EXPを賭けるルーレットとパチンコスロットの複合MOD', create });
})();

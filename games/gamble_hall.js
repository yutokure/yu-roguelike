(function(){
  const STYLE_ID = 'mini-gamble-hall-style';
  function ensureStyles(){
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .mini-gamble-hall{position:relative;display:flex;flex-direction:column;gap:20px;padding:18px 22px;color:#e2e8f0;font-family:"Segoe UI","Hiragino Sans","BIZ UDPGothic",sans-serif;background:radial-gradient(circle at top,#0f172a 0%,#020617 70%);border-radius:22px;overflow:hidden;box-shadow:0 18px 60px rgba(2,6,23,0.65);}
      .mini-gamble-hall::before{content:'';position:absolute;inset:-30%;background:conic-gradient(from 45deg,rgba(59,130,246,0.05),rgba(14,165,233,0.18),rgba(236,72,153,0.08),rgba(59,130,246,0.05));filter:blur(40px);animation:mini-gh-aurora 18s linear infinite;}
      .mini-gamble-hall::after{content:'';position:absolute;inset:0;background:radial-gradient(circle at 80% 20%,rgba(236,72,153,0.08),transparent 45%),radial-gradient(circle at 20% 80%,rgba(56,189,248,0.08),transparent 40%);pointer-events:none;}
      @keyframes mini-gh-aurora{0%{transform:rotate(0deg) scale(1.1);}100%{transform:rotate(360deg) scale(1.1);}}
      .mini-gamble-hall > *{position:relative;z-index:1;}
      .mini-gh-shell{display:flex;gap:20px;align-items:stretch;min-height:340px;}
      .mini-gh-sidebar{width:240px;display:flex;flex-direction:column;gap:16px;}
      .mini-gh-main{flex:1;display:flex;flex-direction:column;gap:16px;min-width:0;}
      .mini-gh-card{background:rgba(15,23,42,0.6);border:1px solid rgba(148,163,184,0.25);border-radius:18px;box-shadow:0 16px 40px rgba(2,6,23,0.45);padding:16px;}
      .mini-gh-nav-card{padding:0;overflow:hidden;display:flex;flex-direction:column;}
      .mini-gh-nav-title{padding:16px 18px;font-size:15px;font-weight:700;letter-spacing:0.06em;border-bottom:1px solid rgba(148,163,184,0.18);background:rgba(15,23,42,0.7);}
      .mini-gh-nav-list{flex:1;display:flex;flex-direction:column;gap:8px;padding:14px;overflow:auto;}
      .mini-gh-nav-list button{display:flex;gap:12px;align-items:center;text-align:left;border:none;border-radius:12px;padding:10px 12px;background:rgba(148,163,184,0.08);color:#e2e8f0;cursor:pointer;transition:background 0.2s,transform 0.15s,box-shadow 0.25s;}
      .mini-gh-nav-list button:hover{background:rgba(148,163,184,0.14);transform:translateY(-1px);}
      .mini-gh-nav-list button.active{background:linear-gradient(135deg,#6366f1,#38bdf8);box-shadow:0 12px 28px rgba(59,130,246,0.35);color:#0f172a;}
      .mini-gh-nav-list button .icon{font-size:20px;}
      .mini-gh-nav-list button .body{display:flex;flex-direction:column;gap:2px;}
      .mini-gh-nav-list button .body strong{font-size:14px;font-weight:700;}
      .mini-gh-nav-list button .body span{font-size:11px;opacity:0.78;letter-spacing:0.03em;}
      .mini-gh-sidebar .mini-gh-summary{display:flex;flex-direction:column;gap:12px;font-size:12px;color:#cbd5f5;}
      .mini-gh-sidebar .mini-gh-summary strong{display:block;font-size:20px;font-weight:700;color:#38bdf8;}
      .mini-gh-sidebar .mini-gh-summary .label{font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#94a3b8;}
      .mini-gh-sidebar .mini-gh-summary .net{font-size:16px;font-weight:700;}
      .mini-gh-sidebar .mini-gh-summary .net.positive{color:#4ade80;}
      .mini-gh-sidebar .mini-gh-summary .net.negative{color:#f87171;}
      .mini-gh-sidebar .mini-gh-summary .max{font-size:12px;color:#94a3b8;}
      .mini-gh-panel-title{padding:14px 18px;border-radius:18px;background:rgba(15,23,42,0.55);border:1px solid rgba(148,163,184,0.2);font-size:16px;font-weight:700;letter-spacing:0.04em;display:flex;align-items:center;gap:10px;}
      .mini-gh-panel-title .icon{font-size:18px;}
      .mini-gh-panel-title .subtitle{font-size:12px;color:#94a3b8;font-weight:500;letter-spacing:0.04em;}
      .mini-gh-header{display:flex;flex-wrap:wrap;gap:16px;align-items:flex-end;background:rgba(15,23,42,0.55);padding:16px 18px;border-radius:18px;border:1px solid rgba(148,163,184,0.22);}
      .mini-gh-balance{flex:1 1 160px;display:flex;flex-direction:column;gap:4px;}
      .mini-gh-balance span.label{font-size:12px;color:#94a3b8;letter-spacing:0.04em;}
      .mini-gh-balance strong{font-size:22px;font-weight:700;color:#38bdf8;}
      .mini-gh-bet{display:flex;flex-direction:column;gap:6px;min-width:200px;}
      .mini-gh-bet-input{display:flex;gap:8px;align-items:center;flex-wrap:wrap;}
      .mini-gh-bet-input input{flex:1 1 120px;min-width:120px;padding:8px 12px;border-radius:12px;border:1px solid rgba(148,163,184,0.3);background:rgba(15,23,42,0.75);color:#e2e8f0;font-size:14px;}
      .mini-gh-bet-input button{padding:8px 12px;border-radius:12px;border:1px solid rgba(148,163,184,0.25);background:rgba(30,41,59,0.85);color:#cbd5f5;cursor:pointer;font-size:12px;transition:background 0.2s,border-color 0.2s,transform 0.15s;}
      .mini-gh-bet-input button:hover{background:rgba(51,65,85,0.95);border-color:rgba(59,130,246,0.45);transform:translateY(-1px);}
      .mini-gh-session{min-width:160px;display:flex;flex-direction:column;gap:6px;text-align:right;}
      .mini-gh-session .net{font-weight:700;font-size:18px;}
      .mini-gh-session .net.positive{color:#4ade80;}
      .mini-gh-session .net.negative{color:#f87171;}
      .mini-gh-panels{flex:1;background:rgba(15,23,42,0.6);border-radius:20px;border:1px solid rgba(148,163,184,0.2);padding:20px;min-height:260px;position:relative;overflow:hidden;}
      .mini-gh-panel{display:none;gap:18px;}
      .mini-gh-panel.active{display:flex;flex-direction:column;}
      .mini-gh-panel.mini-gh-roulette-layout{gap:20px;}
      .mini-gh-panel.mini-gh-slot{gap:20px;align-items:center;}
      .mini-gh-panel.mini-gh-dice{gap:20px;align-items:center;}
      .mini-gh-lower{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));align-items:stretch;}
      .mini-gh-status{padding:16px 18px;border-radius:18px;background:rgba(30,41,59,0.8);border:1px solid rgba(148,163,184,0.25);font-size:13px;color:#cbd5f5;box-shadow:0 12px 26px rgba(2,6,23,0.35);transition:transform 0.35s ease,box-shadow 0.35s ease;}
      .mini-gh-status.pulse-win{transform:translateY(-2px) scale(1.01);box-shadow:0 16px 34px rgba(74,222,128,0.35);}
      .mini-gh-status.pulse-loss{transform:translateY(2px) scale(0.99);box-shadow:0 16px 34px rgba(248,113,113,0.28);}
      .mini-gh-status.win{border-color:rgba(74,222,128,0.6);color:#bbf7d0;background:rgba(22,101,52,0.4);}
      .mini-gh-status.loss{border-color:rgba(248,113,113,0.6);color:#fecaca;background:rgba(127,29,29,0.4);}
      .mini-gh-status.warn{border-color:rgba(248,191,22,0.6);color:#fef08a;background:rgba(113,63,18,0.45);}
      .mini-gh-status.info{border-color:rgba(96,165,250,0.55);color:#bfdbfe;background:rgba(30,64,175,0.4);}
      .mini-gh-history{padding:16px;border-radius:18px;background:rgba(15,23,42,0.55);border:1px solid rgba(148,163,184,0.18);box-shadow:0 12px 32px rgba(2,6,23,0.38);display:flex;flex-direction:column;gap:12px;}
      .mini-gh-history h3{margin:0;font-size:13px;color:#94a3b8;letter-spacing:0.05em;}
      .mini-gh-history-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px;max-height:180px;overflow:auto;}
      .mini-gh-history-list li{padding:10px 12px;border-radius:12px;background:rgba(30,41,59,0.72);display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#cbd5f5;border-left:3px solid transparent;position:relative;overflow:hidden;}
      .mini-gh-history-list li::after{content:'';position:absolute;inset:0;background:linear-gradient(120deg,rgba(148,163,184,0.08),rgba(148,163,184,0));opacity:0;transition:opacity 0.4s;}
      .mini-gh-history-list li.new::after{opacity:1;}
      .mini-gh-history-list li.win{border-left-color:#4ade80;}
      .mini-gh-history-list li.loss{border-left-color:#f87171;}
      .mini-gh-history-list li .meta{color:#94a3b8;font-size:11px;}
      .mini-gh-roulette-layout{flex-direction:column;}
      .mini-gh-roulette-visual{display:flex;flex-direction:column;align-items:center;gap:14px;}
      .mini-gh-roulette-wheel{width:220px;height:220px;position:relative;border-radius:50%;background:radial-gradient(circle at center,#0b1220 0%,#0f172a 55%,#020617 100%);border:6px solid rgba(148,163,184,0.38);box-shadow:0 18px 42px rgba(2,6,23,0.65);display:flex;align-items:center;justify-content:center;overflow:hidden;}
      .mini-gh-roulette-wheel::after{content:'';position:absolute;width:18px;height:18px;border-radius:50%;background:#e2e8f0;box-shadow:0 0 16px rgba(226,232,240,0.6),0 0 0 6px rgba(15,23,42,0.6);z-index:6;}
      .mini-gh-roulette-track{position:absolute;inset:18px;border-radius:50%;background:radial-gradient(circle at center,rgba(15,23,42,0.92) 0%,rgba(15,23,42,0.92) 52%,rgba(2,6,23,0.9) 55%,rgba(2,6,23,0.9) 100%);display:flex;align-items:center;justify-content:center;overflow:visible;transform:rotate(0deg);transition:transform 2.8s cubic-bezier(0.22,0.61,0.35,1);}
      .mini-gh-roulette-track::before{content:'';position:absolute;inset:-18px;border-radius:50%;background:var(--mini-gh-roulette-gradient,conic-gradient(#1f2937 0deg,#1f2937 360deg));mask:radial-gradient(circle at center,transparent 58%,black 59%);-webkit-mask:radial-gradient(circle at center,transparent 58%,black 59%);z-index:1;}
      .mini-gh-roulette-numbers{position:absolute;inset:0;pointer-events:none;z-index:2;}
      .mini-gh-roulette-marker{position:absolute;left:50%;top:50%;transform-origin:center center;transform:rotate(var(--angle)) translateY(-86px);}
      .mini-gh-roulette-marker span{display:inline-flex;align-items:center;justify-content:center;width:34px;height:20px;border-radius:6px;font-size:12px;font-weight:700;letter-spacing:0.08em;background:rgba(15,23,42,0.82);color:var(--color,#f8fafc);box-shadow:0 4px 10px rgba(2,6,23,0.45);transform:rotate(calc(-1 * var(--angle)));}
      .mini-gh-roulette-marker.active span{background:linear-gradient(135deg,#facc15,#f97316);color:#0f172a;box-shadow:0 0 0 2px rgba(250,204,21,0.5),0 10px 20px rgba(249,115,22,0.35);}
      .mini-gh-roulette-center{position:absolute;width:90px;height:90px;border-radius:50%;background:radial-gradient(circle at center,#111827 0%,#020617 100%);border:1px solid rgba(148,163,184,0.35);z-index:4;box-shadow:inset 0 12px 28px rgba(0,0,0,0.55);}
      .mini-gh-roulette-ball{position:absolute;width:16px;height:16px;border-radius:50%;background:radial-gradient(circle at 30% 30%,#f8fafc 0%,#cbd5f5 70%,#94a3b8 100%);top:50%;left:50%;transform:rotate(0deg) translateY(-88px);transform-origin:center center;z-index:5;filter:drop-shadow(0 6px 10px rgba(0,0,0,0.4));}
      .mini-gh-roulette-ball.rolling{animation:mini-gh-ball-spin 2.8s cubic-bezier(0.22,0.61,0.35,1);}
      @keyframes mini-gh-ball-spin{0%{transform:rotate(0deg) translateY(-88px);}60%{transform:rotate(-520deg) translateY(-88px);}100%{transform:rotate(-720deg) translateY(-88px);}}
      .mini-gh-wheel-result{display:flex;flex-direction:column;align-items:center;gap:6px;font-weight:700;text-align:center;}
      .mini-gh-wheel-result .num{font-size:32px;text-shadow:0 6px 14px rgba(0,0,0,0.45);}
      .mini-gh-wheel-color{font-size:14px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;}
      .mini-gh-pointer{position:absolute;top:-24px;left:50%;width:0;height:0;border-left:12px solid transparent;border-right:12px solid transparent;border-bottom:22px solid rgba(248,250,252,0.88);transform:translateX(-50%);filter:drop-shadow(0 8px 14px rgba(15,23,42,0.6));pointer-events:none;z-index:10;}
      .mini-gh-roulette-controls{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end;justify-content:center;}
      .mini-gh-roulette-controls select,.mini-gh-roulette-controls button{padding:10px 14px;border-radius:12px;border:1px solid rgba(148,163,184,0.25);background:rgba(30,41,59,0.8);color:#cbd5f5;cursor:pointer;transition:background 0.2s,border-color 0.2s,transform 0.15s;}
      .mini-gh-roulette-controls select{min-width:140px;}
      .mini-gh-roulette-controls button{background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#0f172a;font-weight:700;box-shadow:0 12px 26px rgba(14,165,233,0.32);}
      .mini-gh-roulette-controls button:disabled{opacity:0.6;cursor:not-allowed;box-shadow:none;}
      .mini-gh-roulette-controls button:hover:not(:disabled){transform:translateY(-1px);}
      .mini-gh-slot{flex-direction:column;align-items:center;}
      .mini-gh-slot-reels{display:flex;gap:14px;justify-content:center;}
      .mini-gh-slot-reel{width:72px;height:72px;border-radius:16px;border:2px solid rgba(148,163,184,0.35);background:linear-gradient(160deg,rgba(30,41,59,0.9),rgba(15,23,42,0.9));display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;color:#f8fafc;box-shadow:0 8px 20px rgba(2,6,23,0.55);transition:transform 0.2s;}
      .mini-gh-slot.running .mini-gh-slot-reel{animation:mini-gh-slot-spin 0.4s linear infinite;}
      @keyframes mini-gh-slot-spin{0%{transform:translateY(0);}50%{transform:translateY(-6px);}100%{transform:translateY(0);}}
      .mini-gh-slot button{padding:12px 22px;border-radius:16px;border:1px solid rgba(59,130,246,0.45);background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#fff;font-weight:600;cursor:pointer;box-shadow:0 12px 26px rgba(14,165,233,0.3);transition:transform 0.15s,box-shadow 0.15s;}
      .mini-gh-slot button:active{transform:translateY(1px);box-shadow:0 6px 18px rgba(14,165,233,0.26);}
      .mini-gh-small{font-size:11px;color:#94a3b8;text-align:center;}
      .mini-gh-dice{flex-direction:column;align-items:center;}
      .mini-gh-dice-rolling{display:flex;gap:16px;}
      .mini-gh-die{width:62px;height:62px;border-radius:18px;background:linear-gradient(145deg,rgba(30,41,59,0.92),rgba(15,23,42,0.92));border:2px solid rgba(148,163,184,0.35);display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:700;color:#f8fafc;box-shadow:0 10px 24px rgba(2,6,23,0.55);transition:transform 0.25s ease;}
      .mini-gh-die.roll{animation:mini-gh-die-roll 0.6s ease-in-out infinite;}
      @keyframes mini-gh-die-roll{0%{transform:rotateX(0deg) rotateY(0deg);}50%{transform:rotateX(18deg) rotateY(-24deg) translateY(-6px);}100%{transform:rotateX(0deg) rotateY(0deg);}}
      .mini-gh-dice-controls{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;}
      .mini-gh-dice-controls select,.mini-gh-dice-controls button{padding:12px 16px;border-radius:12px;border:1px solid rgba(148,163,184,0.25);background:rgba(30,41,59,0.85);color:#cbd5f5;font-weight:600;cursor:pointer;transition:transform 0.2s,box-shadow 0.2s;}
      .mini-gh-dice-controls button{background:linear-gradient(135deg,#22d3ee,#6366f1);color:#0f172a;box-shadow:0 12px 30px rgba(34,211,238,0.35);}
      .mini-gh-dice-controls button:active{transform:translateY(1px);box-shadow:0 8px 18px rgba(34,211,238,0.28);}
      @media (max-width:900px){
        .mini-gh-shell{flex-direction:column;}
        .mini-gh-sidebar{width:100%;flex-direction:row;gap:16px;flex-wrap:wrap;}
        .mini-gh-nav-card{flex:1 1 260px;}
        .mini-gh-sidebar .mini-gh-summary{flex:1 1 200px;}
      }
      @media (max-width:600px){
        .mini-gamble-hall{padding:16px;}
        .mini-gh-header{flex-direction:column;align-items:stretch;}
        .mini-gh-session{text-align:left;}
      }
    `;
    document.head.appendChild(style);
  }

  const ROULETTE_NUMBERS = [
    { value: 0, color: 'green' },
    { value: 32, color: 'red' },
    { value: 15, color: 'black' },
    { value: 19, color: 'red' },
    { value: 4, color: 'black' },
    { value: 21, color: 'red' },
    { value: 2, color: 'black' },
    { value: 25, color: 'red' },
    { value: 17, color: 'black' },
    { value: 34, color: 'red' },
    { value: 6, color: 'black' },
    { value: 27, color: 'red' },
    { value: 13, color: 'black' },
    { value: 36, color: 'red' },
    { value: 11, color: 'black' },
    { value: 30, color: 'red' },
    { value: 8, color: 'black' },
    { value: 23, color: 'red' },
    { value: 10, color: 'black' },
    { value: 5, color: 'red' },
    { value: 24, color: 'black' },
    { value: 16, color: 'red' },
    { value: 33, color: 'black' },
    { value: 1, color: 'red' },
    { value: 20, color: 'black' },
    { value: 14, color: 'red' },
    { value: 31, color: 'black' },
    { value: 9, color: 'red' },
    { value: 22, color: 'black' },
    { value: 18, color: 'red' },
    { value: 29, color: 'black' },
    { value: 7, color: 'red' },
    { value: 28, color: 'black' },
    { value: 12, color: 'red' },
    { value: 35, color: 'black' },
    { value: 3, color: 'red' },
    { value: 26, color: 'black' }
  ];
  const ROULETTE_GRADIENT_COLORS = { red: '#dc2626', black: '#0f172a', green: '#15803d' };
  const ROULETTE_DISPLAY_COLORS = { red: '#f87171', black: '#cbd5f5', green: '#4ade80' };
  const ROULETTE_SEGMENT_ANGLE = 360 / ROULETTE_NUMBERS.length;
  const ROULETTE_SPIN_MS = 2800;

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
      diceRolling: false,
      rouletteRotation: 0,
      rouletteSpinning: false,
      rouletteSpinTimer: null,
      rouletteBallTimer: null
    };

    const layout = document.createElement('div');
    layout.className = 'mini-gamble-hall';
    root.appendChild(layout);

    const shell = document.createElement('div');
    shell.className = 'mini-gh-shell';
    layout.appendChild(shell);

    const sidebar = document.createElement('div');
    sidebar.className = 'mini-gh-sidebar';
    shell.appendChild(sidebar);

    const main = document.createElement('div');
    main.className = 'mini-gh-main';
    shell.appendChild(main);

    let diceEls = [];
    let diceModeSelect;
    let diceButton;
    let diceHint;
    let diceResultEl;
    let summaryBalanceEl;
    let summaryNetEl;
    let summaryMaxEl;
    const navButtons = {};
    const navMeta = {};
    let panelTitleIcon;
    let panelTitleLabel;
    let panelTitleSubtitle;
    let rouletteTrack;
    let rouletteBall;
    let rouletteNumberEl;
    let rouletteColorEl;
    let betTypeSelect;
    let numberSelect;
    let spinButton;
    const rouletteMarkerMap = new Map();
    let activeRouletteMarker = null;

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
      if (summaryNetEl){
        summaryNetEl.textContent = formatDelta(state.netExp) + ' EXP';
        summaryNetEl.classList.remove('positive','negative');
        if (state.netExp > 0) summaryNetEl.classList.add('positive');
        else if (state.netExp < 0) summaryNetEl.classList.add('negative');
      }
      if (summaryMaxEl){
        summaryMaxEl.textContent = `${Math.round(Math.max(0,state.biggestWin))} EXP`;
      }
    }

    function renderBalance(){
      const value = `${getBalance()} EXP`;
      balanceValueEl.textContent = value;
      if (summaryBalanceEl){
        summaryBalanceEl.textContent = value;
      }
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

    function stopRouletteSpin(forceReset){
      if (state.rouletteSpinTimer){ clearTimeout(state.rouletteSpinTimer); state.rouletteSpinTimer = null; }
      if (state.rouletteBallTimer){ clearTimeout(state.rouletteBallTimer); state.rouletteBallTimer = null; }
      state.rouletteSpinning = false;
      if (spinButton) spinButton.disabled = false;
      if (rouletteBall){
        rouletteBall.classList.remove('rolling');
        if (forceReset) rouletteBall.style.transform = 'rotate(0deg) translateY(-88px)';
      }
      if (forceReset){
        state.rouletteRotation = 0;
        if (rouletteTrack){
          rouletteTrack.style.transition = 'none';
          rouletteTrack.style.transform = 'rotate(0deg)';
          const restore = () => { if (rouletteTrack) rouletteTrack.style.transition = ''; };
          if (typeof requestAnimationFrame === 'function') requestAnimationFrame(restore);
          else setTimeout(restore, 0);
        }
        if (rouletteNumberEl) rouletteNumberEl.textContent = '--';
        if (rouletteColorEl){
          rouletteColorEl.textContent = '-';
          rouletteColorEl.style.color = '';
        }
        if (activeRouletteMarker){
          activeRouletteMarker.classList.remove('active');
          activeRouletteMarker = null;
        }
      }
    }

    function applyDelta(delta){
      state.netExp += delta;
      if (delta > 0) state.biggestWin = Math.max(state.biggestWin, delta);
      updateSessionHud();
    }

    function handleRoulette(){
      clampBet();
      const bet = getBetAmount();
      if (state.rouletteSpinning){ setStatus('ルーレットが回転中です…', 'warn'); return; }
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
      state.rouletteSpinning = true;
      if (spinButton) spinButton.disabled = true;
      setStatus('ルーレットを回しています…', 'info');
      if (activeRouletteMarker){
        activeRouletteMarker.classList.remove('active');
        activeRouletteMarker = null;
      }
      if (rouletteBall){
        rouletteBall.classList.remove('rolling');
        void rouletteBall.offsetWidth;
        rouletteBall.classList.add('rolling');
      }
      if (rouletteTrack){
        rouletteTrack.style.transition = 'none';
        void rouletteTrack.offsetWidth;
      }

      const resultIndex = Math.floor(Math.random() * ROULETTE_NUMBERS.length);
      const resultEntry = ROULETTE_NUMBERS[resultIndex];
      const result = resultEntry.value;
      const color = resultEntry.color;
      const colorLabel = color === 'red' ? '赤' : color === 'black' ? '黒' : '緑';
      const baseAngle = resultIndex * ROULETTE_SEGMENT_ANGLE;
      const targetBase = (360 - baseAngle) % 360;
      const minRotation = state.rouletteRotation + 720;
      let finalRotation = minRotation - (minRotation % 360) + targetBase;
      if (finalRotation <= minRotation) finalRotation += 360;
      state.rouletteRotation = finalRotation;
      if (rouletteTrack){
        const applyRotation = () => {
          if (!rouletteTrack) return;
          rouletteTrack.style.transition = `transform ${ROULETTE_SPIN_MS / 1000}s cubic-bezier(0.22,0.61,0.35,1)`;
          rouletteTrack.style.transform = `rotate(${finalRotation}deg)`;
        };
        if (typeof requestAnimationFrame === 'function') requestAnimationFrame(applyRotation);
        else setTimeout(applyRotation, 0);
      }
      if (rouletteBall){
        state.rouletteBallTimer = setTimeout(() => {
          if (rouletteBall) rouletteBall.classList.remove('rolling');
          state.rouletteBallTimer = null;
        }, ROULETTE_SPIN_MS);
      }

      let multiplier = 0;
      let hitText = 'ハズレ';
      const type = betTypeSelect.value;
      if (type === 'color_red'){ multiplier = color === 'red' ? 2 : 0; hitText = multiplier ? '赤的中' : '赤ハズレ'; }
      else if (type === 'color_black'){ multiplier = color === 'black' ? 2 : 0; hitText = multiplier ? '黒的中' : '黒ハズレ'; }
      else if (type === 'color_green'){ multiplier = result === 0 ? 36 : 0; hitText = multiplier ? '0ヒット！' : '0ハズレ'; }
      else if (type === 'parity_even'){ multiplier = (result !== 0 && result % 2 === 0) ? 2 : 0; hitText = multiplier ? '偶数的中' : '偶数ハズレ'; }
      else if (type === 'parity_odd'){ multiplier = result % 2 === 1 ? 2 : 0; hitText = multiplier ? '奇数的中' : '奇数ハズレ'; }
      else if (type === 'number'){ const pick = Number(numberSelect.value)||0; multiplier = result === pick ? 36 : 0; hitText = multiplier ? `${pick} 的中！` : `${pick} ハズレ`; }
      const detailText = `No.${result} ${colorLabel}`;

      state.rouletteSpinTimer = setTimeout(() => {
        let gainDelta = 0;
        const payout = multiplier > 0 ? Math.round(actualBet * multiplier) : 0;
        if (payout > 0){
          const gained = awardXp(payout);
          gainDelta = Number(gained)||0;
          applyDelta(gainDelta);
        }
        const net = spendDelta + gainDelta;
        const tone = net > 0 ? 'win' : (net < 0 ? 'loss' : 'info');
        if (rouletteNumberEl) rouletteNumberEl.textContent = String(result);
        if (rouletteColorEl){
          rouletteColorEl.textContent = colorLabel;
          rouletteColorEl.style.color = ROULETTE_DISPLAY_COLORS[color] || '#f8fafc';
        }
        const marker = rouletteMarkerMap.get(result);
        if (marker){
          marker.classList.add('active');
          activeRouletteMarker = marker;
        }
        setStatus(`ルーレット: ${hitText} (${colorLabel} / ${result}) ${formatDelta(net)} EXP`, tone);
        pushHistory({ game: 'ルーレット', bet: actualBet, detail: detailText, net });
        renderBalance();
        setBetValue(actualBet);
        state.rouletteSpinTimer = null;
        stopRouletteSpin(false);
      }, ROULETTE_SPIN_MS);
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

    const summaryCard = document.createElement('div');
    summaryCard.className = 'mini-gh-card';
    const summaryBox = document.createElement('div');
    summaryBox.className = 'mini-gh-summary';
    summaryCard.appendChild(summaryBox);
    const summaryBalanceBlock = document.createElement('div');
    const summaryBalanceLabel = document.createElement('span');
    summaryBalanceLabel.className = 'label';
    summaryBalanceLabel.textContent = 'BALANCE';
    summaryBalanceEl = document.createElement('strong');
    summaryBalanceEl.textContent = '0 EXP';
    summaryBalanceBlock.append(summaryBalanceLabel, summaryBalanceEl);
    const summaryNetBlock = document.createElement('div');
    const summaryNetLabel = document.createElement('span');
    summaryNetLabel.className = 'label';
    summaryNetLabel.textContent = 'SESSION NET';
    summaryNetEl = document.createElement('span');
    summaryNetEl.className = 'net';
    summaryNetEl.textContent = '±0 EXP';
    summaryNetBlock.append(summaryNetLabel, summaryNetEl);
    const summaryMaxBlock = document.createElement('div');
    const summaryMaxLabel = document.createElement('span');
    summaryMaxLabel.className = 'label';
    summaryMaxLabel.textContent = 'MAX WIN';
    summaryMaxEl = document.createElement('span');
    summaryMaxEl.className = 'max';
    summaryMaxEl.textContent = '0 EXP';
    summaryMaxBlock.append(summaryMaxLabel, summaryMaxEl);
    summaryBox.append(summaryBalanceBlock, summaryNetBlock, summaryMaxBlock);
    sidebar.appendChild(summaryCard);

    const navCard = document.createElement('div');
    navCard.className = 'mini-gh-card mini-gh-nav-card';
    const navTitle = document.createElement('div');
    navTitle.className = 'mini-gh-nav-title';
    navTitle.textContent = 'ゲームセレクト';
    navCard.appendChild(navTitle);
    const navList = document.createElement('div');
    navList.className = 'mini-gh-nav-list';
    navCard.appendChild(navList);
    sidebar.appendChild(navCard);

    const navItems = [
      { id: 'roulette', label: 'ルーレット', icon: '🎯', detail: '欧州式37マス' },
      { id: 'slot', label: 'パチンコスロット', icon: '🎰', detail: '3リール＋スター配当' },
      { id: 'dice', label: 'ラッキーダイス', icon: '🎲', detail: '5種のベットモード' }
    ];
    navItems.forEach(item => {
      navMeta[item.id] = item;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.dataset.game = item.id;
      const icon = document.createElement('span');
      icon.className = 'icon';
      icon.textContent = item.icon;
      const body = document.createElement('div');
      body.className = 'body';
      const strong = document.createElement('strong');
      strong.textContent = item.label;
      const detail = document.createElement('span');
      detail.textContent = item.detail;
      body.append(strong, detail);
      btn.append(icon, body);
      navList.appendChild(btn);
      navButtons[item.id] = btn;
    });

    // Header UI
    const header = document.createElement('div');
    header.className = 'mini-gh-header';
    main.appendChild(header);

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

    const panelTitle = document.createElement('div');
    panelTitle.className = 'mini-gh-panel-title';
    panelTitleIcon = document.createElement('span');
    panelTitleIcon.className = 'icon';
    panelTitleLabel = document.createElement('span');
    panelTitleSubtitle = document.createElement('span');
    panelTitleSubtitle.className = 'subtitle';
    panelTitle.append(panelTitleIcon, panelTitleLabel, panelTitleSubtitle);
    main.appendChild(panelTitle);

    const panels = document.createElement('div');
    panels.className = 'mini-gh-panels';
    main.appendChild(panels);

    // Roulette panel
    const roulettePanel = document.createElement('div');
    roulettePanel.className = 'mini-gh-panel mini-gh-roulette-layout';
    const rouletteVisual = document.createElement('div');
    rouletteVisual.className = 'mini-gh-roulette-visual';
    const rouletteWheel = document.createElement('div');
    rouletteWheel.className = 'mini-gh-roulette-wheel';
    rouletteTrack = document.createElement('div');
    rouletteTrack.className = 'mini-gh-roulette-track';
    const rouletteNumbersWrap = document.createElement('div');
    rouletteNumbersWrap.className = 'mini-gh-roulette-numbers';
    rouletteTrack.appendChild(rouletteNumbersWrap);
    rouletteWheel.appendChild(rouletteTrack);
    const rouletteCenter = document.createElement('div');
    rouletteCenter.className = 'mini-gh-roulette-center';
    rouletteWheel.appendChild(rouletteCenter);
    rouletteBall = document.createElement('div');
    rouletteBall.className = 'mini-gh-roulette-ball';
    rouletteWheel.appendChild(rouletteBall);
    const roulettePointer = document.createElement('div');
    roulettePointer.className = 'mini-gh-pointer';
    rouletteWheel.appendChild(roulettePointer);
    rouletteVisual.appendChild(rouletteWheel);
    const rouletteResultBox = document.createElement('div');
    rouletteResultBox.className = 'mini-gh-wheel-result';
    rouletteNumberEl = document.createElement('div');
    rouletteNumberEl.className = 'num';
    rouletteNumberEl.textContent = '--';
    rouletteColorEl = document.createElement('div');
    rouletteColorEl.className = 'mini-gh-wheel-color';
    rouletteColorEl.textContent = '-';
    rouletteResultBox.append(rouletteNumberEl, rouletteColorEl);
    rouletteVisual.appendChild(rouletteResultBox);
    roulettePanel.appendChild(rouletteVisual);

    const rouletteControls = document.createElement('div');
    rouletteControls.className = 'mini-gh-roulette-controls';
    betTypeSelect = document.createElement('select');
    betTypeSelect.className = 'mini-gh-roulette-type';
    [
      { value: 'color_red', label: '赤' },
      { value: 'color_black', label: '黒' },
      { value: 'color_green', label: '緑(0)' },
      { value: 'parity_even', label: '偶数' },
      { value: 'parity_odd', label: '奇数' },
      { value: 'number', label: '番号指定' }
    ].forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label;
      betTypeSelect.appendChild(option);
    });
    numberSelect = document.createElement('select');
    numberSelect.className = 'mini-gh-roulette-number';
    numberSelect.disabled = true;
    spinButton = document.createElement('button');
    spinButton.className = 'mini-gh-roulette-spin';
    spinButton.textContent = 'スピン';
    rouletteControls.append(betTypeSelect, numberSelect, spinButton);
    roulettePanel.appendChild(rouletteControls);
    panels.appendChild(roulettePanel);

    for (let i=0; i<=36; i++){
      const opt = document.createElement('option');
      opt.value = String(i);
      opt.textContent = `No.${i}`;
      numberSelect.appendChild(opt);
    }

    const gradientStops = ROULETTE_NUMBERS.map((entry, idx) => {
      const start = (idx * ROULETTE_SEGMENT_ANGLE).toFixed(2);
      const end = ((idx + 1) * ROULETTE_SEGMENT_ANGLE).toFixed(2);
      const color = ROULETTE_GRADIENT_COLORS[entry.color] || '#1f2937';
      return `${color} ${start}deg ${end}deg`;
    }).join(',');
    rouletteTrack.style.setProperty('--mini-gh-roulette-gradient', `conic-gradient(${gradientStops})`);

    ROULETTE_NUMBERS.forEach((entry, idx) => {
      const marker = document.createElement('div');
      marker.className = 'mini-gh-roulette-marker';
      marker.style.setProperty('--angle', `${idx * ROULETTE_SEGMENT_ANGLE}deg`);
      const label = document.createElement('span');
      label.textContent = String(entry.value);
      label.style.setProperty('--color', ROULETTE_DISPLAY_COLORS[entry.color] || '#f8fafc');
      marker.appendChild(label);
      rouletteNumbersWrap.appendChild(marker);
      rouletteMarkerMap.set(entry.value, marker);
    });

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

    const lowerRow = document.createElement('div');
    lowerRow.className = 'mini-gh-lower';
    main.appendChild(lowerRow);

    const statusEl = document.createElement('div');
    statusEl.className = 'mini-gh-status';
    statusEl.textContent = 'ベットしてゲームを始めましょう。';
    lowerRow.appendChild(statusEl);

    const historyBox = document.createElement('div');
    historyBox.className = 'mini-gh-history';
    historyBox.innerHTML = '<h3>直近の結果</h3>';
    const historyList = document.createElement('div');
    historyList.className = 'mini-gh-history-list';
    historyBox.appendChild(historyList);
    lowerRow.appendChild(historyBox);

    function switchGame(id){
      state.currentGame = id;
      Object.entries(navButtons).forEach(([key, btn]) => {
        if (btn) btn.classList.toggle('active', key === id);
      });
      roulettePanel.classList.toggle('active', id === 'roulette');
      slotPanel.classList.toggle('active', id === 'slot');
      dicePanel.classList.toggle('active', id === 'dice');
      const meta = navMeta[id];
      if (panelTitleIcon) panelTitleIcon.textContent = meta ? meta.icon : '';
      if (panelTitleLabel) panelTitleLabel.textContent = meta ? meta.label : '';
      if (panelTitleSubtitle) panelTitleSubtitle.textContent = meta && meta.detail ? meta.detail : '';
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
    if (navButtons.roulette) bind(navButtons.roulette, 'click', () => { switchGame('roulette'); });
    if (navButtons.slot) bind(navButtons.slot, 'click', () => { switchGame('slot'); });
    if (navButtons.dice) bind(navButtons.dice, 'click', () => { switchGame('dice'); });
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
      stopRouletteSpin(true);
      renderBalance();
      updateSessionHud();
      renderHistory();
      diceEls.forEach(el => { el.textContent = faceFromNumber(rollDie()); });
      diceResultEl.textContent = '---';
      updateDiceHint();
      setBetValue(10);
      setStatus('ベットしてゲームを始めましょう。');
    }

    function stop(){
      stopSlotTimers();
      stopDiceTimers();
      stopRouletteSpin(false);
    }

    function destroy(){
      stop();
      disposers.splice(0).forEach(fn => { try { fn(); } catch {} });
      try { layout.remove(); } catch {}
    }

    return { start, stop, destroy, getScore: () => Math.round(Math.max(0, state.biggestWin)) };
  }

  window.registerMiniGame({ id: 'gamble_hall', name: 'ギャンブルホール', nameKey: 'selection.miniexp.games.gamble_hall.name', description: 'EXPを賭けるルーレットとパチンコスロットの複合MOD', descriptionKey: 'selection.miniexp.games.gamble_hall.description', categoryIds: ['gambling'], create });
})();

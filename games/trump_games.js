(function(){
  const STORAGE_KEY = 'mini_trump_games_v1';
  const STYLE_ID = 'mini-trump-style';
  const DEFAULT_SETTINGS = { cardBack: 'classic', autoFlip: true };

  const SUITS = [
    { id: 'spade', label: 'Spade', symbol: '\u2660', color: 'black' },
    { id: 'heart', label: 'Heart', symbol: '\u2665', color: 'red' },
    { id: 'diamond', label: 'Diamond', symbol: '\u2666', color: 'red' },
    { id: 'club', label: 'Club', symbol: '\u2663', color: 'black' }
  ];
  const RANKS = [
    { id: 'A', label: 'A', value: 1 },
    { id: '2', label: '2', value: 2 },
    { id: '3', label: '3', value: 3 },
    { id: '4', label: '4', value: 4 },
    { id: '5', label: '5', value: 5 },
    { id: '6', label: '6', value: 6 },
    { id: '7', label: '7', value: 7 },
    { id: '8', label: '8', value: 8 },
    { id: '9', label: '9', value: 9 },
    { id: '10', label: '10', value: 10 },
    { id: 'J', label: 'J', value: 11 },
    { id: 'Q', label: 'Q', value: 12 },
    { id: 'K', label: 'K', value: 13 }
  ];

  const GAME_DEFS = [
    { id: 'memory', title: '神経衰弱', icon: '🧠', phase: 1, implemented: true, description: 'ペアを揃える定番記憶ゲーム。' },
    { id: 'blackjack', title: 'ブラックジャック', icon: '🃏', phase: 1, implemented: true, description: '21を目指してディーラーと勝負。' },
    { id: 'baba', title: 'ババ抜き', icon: '😼', phase: 1, implemented: true, description: 'ジョーカーを最後まで残さないように。' },
    { id: 'klondike', title: 'ソリティア（クロンダイク）', icon: '🂮', phase: 2, implemented: false, description: '7列の場札から台札を揃えるソリティア。' },
    { id: 'spider', title: 'スパイダーソリティア', icon: '🕷️', phase: 3, implemented: false, description: '完成した列を確実に作る耐久ソリティア。' },
    { id: 'freecell', title: 'フリーセル', icon: '🗄️', phase: 2, implemented: false, description: '4つのセルを駆使するソリティア。' },
    { id: 'hearts', title: 'ハーツ', icon: '♥️', phase: 3, implemented: false, description: 'ハートを避けるトリックテイキング。' },
    { id: 'sevens', title: '七並べ', icon: '7️⃣', phase: 2, implemented: false, description: '7を基点にカードを並べる。' },
    { id: 'poker', title: 'ポーカー（ドロー）', icon: '♠️', phase: 2, implemented: false, description: '役を完成させて高得点を狙う。' },
    { id: 'jiji', title: 'ジジ抜き', icon: '👴', phase: 2, implemented: false, description: 'ジョーカー設定可のババ抜き拡張。' },
    { id: 'daifugo', title: '大富豪', icon: '👑', phase: 3, implemented: false, description: '革命必至の手札管理ゲーム。' },
    { id: 'pageone', title: 'ページワン', icon: '📖', phase: 2, implemented: false, description: 'UNOの祖先とされる定番ゲーム。' }
  ];

  const CARD_BACK_OPTIONS = [
    { id: 'classic', label: 'クラシック', description: 'ネイビーの王道パターン', gradient: 'linear-gradient(135deg,#0f172a,#1e40af)', border: 'rgba(37,99,235,0.8)', color: '#93c5fd' },
    { id: 'modern', label: 'モダン', description: 'ビビッドなサイバー柄', gradient: 'linear-gradient(135deg,#831843,#ef4444)', border: 'rgba(244,114,182,0.9)', color: '#fecdd3' },
    { id: 'forest', label: 'フォレスト', description: '深緑と金のグラデ', gradient: 'linear-gradient(135deg,#134e4a,#0f766e)', border: 'rgba(45,212,191,0.85)', color: '#5eead4' }
  ];

  function ensureStyleInjected(){
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = getStyleSheet();
    document.head.appendChild(style);
  }

  function getStyleSheet(){
    return `
    .mini-trump-wrapper{width:100%;height:100%;display:flex;gap:12px;align-items:stretch;justify-content:center;padding:12px;box-sizing:border-box;background:radial-gradient(circle at top,#1b3a2f,#0b1a16 68%);font-family:"Segoe UI","Yu Gothic",sans-serif;color:#f1f5f9;}
    .mini-trump-panel{background:rgba(15,23,42,0.6);border:1px solid rgba(148,163,184,0.35);border-radius:14px;box-shadow:0 18px 48px rgba(0,0,0,0.35);backdrop-filter:blur(10px);}
    .mini-trump-nav{width:250px;display:flex;flex-direction:column;overflow:hidden;}
    .mini-trump-nav header{padding:14px 16px;font-weight:600;font-size:16px;border-bottom:1px solid rgba(148,163,184,0.22);}
    .mini-trump-nav-list{flex:1;overflow:auto;padding:10px 8px;display:flex;flex-direction:column;gap:8px;}
    .mini-trump-nav-list button{display:flex;align-items:center;gap:12px;border:none;border-radius:10px;padding:10px 12px;background:rgba(148,163,184,0.08);color:#e2e8f0;cursor:pointer;text-align:left;font-size:14px;transition:background .2s,transform .15s;}
    .mini-trump-nav-list button:hover{background:rgba(148,163,184,0.16);}
    .mini-trump-nav-list button.selected{background:linear-gradient(135deg,#2563eb,#1d4ed8);box-shadow:0 10px 24px rgba(37,99,235,0.3);}
    .mini-trump-nav-list button .icon{font-size:18px;}
    .mini-trump-nav-list button .meta{margin-left:auto;font-size:11px;color:#cbd5f5;opacity:0.85;}
    .mini-trump-nav-list button.disabled{opacity:0.5;cursor:not-allowed;}
    .mini-trump-main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
    .mini-trump-header{padding:14px 18px;border-bottom:1px solid rgba(148,163,184,0.18);display:flex;align-items:center;gap:18px;position:relative;}
    .mini-trump-header-title{font-size:18px;font-weight:600;}
    .mini-trump-header-controls{margin-left:auto;display:flex;align-items:center;gap:16px;}
    .mini-trump-header-settings{width:34px;height:34px;border-radius:50%;border:1px solid rgba(148,163,184,0.3);background:rgba(148,163,184,0.12);color:#e2e8f0;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .2s,border .2s,transform .2s;}
    .mini-trump-header-settings:hover{background:rgba(148,163,184,0.25);}
    .mini-trump-header-settings.active{background:linear-gradient(135deg,#22d3ee,#0ea5e9);color:#0f172a;border-color:rgba(14,165,233,0.8);box-shadow:0 10px 24px rgba(14,165,233,0.32);}
    .mini-trump-header-status{text-align:right;font-size:12px;color:#cbd5f5;display:flex;flex-direction:column;gap:4px;}
    .mini-trump-difficulty{padding:6px 10px;border-radius:999px;background:rgba(59,130,246,0.18);border:1px solid rgba(59,130,246,0.4);font-size:12px;color:#bfdbfe;font-weight:600;letter-spacing:0.04em;}
    .mini-trump-settings-panel{position:absolute;top:58px;right:18px;width:260px;background:rgba(15,23,42,0.92);border:1px solid rgba(148,163,184,0.3);border-radius:14px;box-shadow:0 18px 36px rgba(0,0,0,0.4);padding:14px 16px;display:flex;flex-direction:column;gap:14px;z-index:40;backdrop-filter:blur(10px);}
    .mini-trump-settings-panel h3{margin:0;font-size:14px;color:#e2e8f0;font-weight:600;}
    .mini-trump-settings-group{display:flex;flex-direction:column;gap:10px;}
    .mini-trump-settings-options{display:flex;gap:8px;flex-wrap:wrap;}
    .mini-trump-settings-option{flex:1;min-width:100px;padding:8px 10px;border-radius:10px;background:rgba(148,163,184,0.12);border:1px solid rgba(148,163,184,0.25);cursor:pointer;display:flex;flex-direction:column;gap:6px;transition:background .2s,border .2s;}
    .mini-trump-settings-option.selected{background:linear-gradient(135deg,#38bdf8,#2563eb);border-color:rgba(37,99,235,0.8);color:#0f172a;box-shadow:0 10px 24px rgba(37,99,235,0.32);}
    .mini-trump-settings-option label{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;}
    .mini-trump-settings-option small{font-size:11px;color:inherit;opacity:0.8;}
    .mini-trump-settings-preview{height:70px;display:flex;align-items:center;justify-content:center;}
    .mini-trump-settings-panel .toggle{display:flex;align-items:center;justify-content:space-between;padding:10px;border-radius:10px;background:rgba(148,163,184,0.12);border:1px solid rgba(148,163,184,0.25);font-size:13px;}
    .mini-trump-board{flex:1;position:relative;padding:16px;overflow:auto;}
    .mini-trump-placeholder{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#cbd5f5;gap:12px;text-align:center;}
    .mini-trump-actions{padding:12px 16px;border-top:1px solid rgba(148,163,184,0.18);display:flex;gap:10px;justify-content:flex-end;background:rgba(15,23,42,0.65);}
    .mini-trump-actions button{min-width:120px;height:36px;border-radius:9px;border:1px solid rgba(148,163,184,0.28);background:rgba(148,163,184,0.12);color:#e2e8f0;font-weight:600;cursor:pointer;transition:background .2s,border .2s,transform .15s;}
    .mini-trump-actions button.primary{background:linear-gradient(135deg,#22d3ee,#06b6d4);border-color:rgba(6,182,212,0.8);color:#0f172a;}
    .mini-trump-actions button.primary:hover{transform:translateY(-1px);}
    .mini-trump-actions button.secondary{background:rgba(37,99,235,0.18);border-color:rgba(59,130,246,0.6);}
    .mini-trump-actions button:disabled{opacity:0.5;cursor:not-allowed;}
    .mini-trump-toast-container{position:absolute;right:16px;bottom:16px;display:flex;flex-direction:column;gap:8px;pointer-events:none;}
    .mini-trump-toast{min-width:200px;padding:10px 14px;border-radius:10px;background:rgba(15,23,42,0.88);border:1px solid rgba(148,163,184,0.4);box-shadow:0 8px 20px rgba(0,0,0,0.35);font-size:13px;opacity:0;transform:translateY(6px);transition:opacity .2s,transform .2s;}
    .mini-trump-toast.show{opacity:1;transform:translateY(0);}
    .mini-trump-toast.warn{background:rgba(248,113,113,0.18);border-color:rgba(248,113,113,0.6);color:#fecaca;}
    .mini-trump-status-line{font-size:13px;color:#cbd5f5;display:flex;gap:14px;flex-wrap:wrap;}
    .mini-trump-score{font-size:13px;color:#e2e8f0;}
    .mini-trump-card{position:relative;border-radius:8px;border:1px solid rgba(15,23,42,0.6);background:#f8fafc;color:#111827;width:76px;height:110px;box-shadow:0 6px 14px rgba(15,23,42,0.35);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:20px;cursor:default;transition:transform .2s,box-shadow .2s;}
    .mini-trump-card.red{color:#c026d3;}
    .mini-trump-card.small{width:60px;height:88px;font-size:18px;}
    .mini-trump-card.tiny{width:44px;height:64px;font-size:16px;}
    .mini-trump-card .corner{position:absolute;font-size:14px;font-weight:600;}
    .mini-trump-card .corner.top{left:8px;top:6px;}
    .mini-trump-card .corner.bottom{right:8px;bottom:6px;transform:rotate(180deg);}
    .mini-trump-card .symbol{font-size:22px;}
    .mini-trump-card.face-down{box-shadow:0 8px 18px rgba(15,23,42,0.56);}
    .mini-trump-wrapper[data-card-back="classic"] .mini-trump-card.face-down{background:linear-gradient(135deg,#0f172a,#1e40af);color:#93c5fd;border-color:rgba(37,99,235,0.8);}
    .mini-trump-wrapper[data-card-back="modern"] .mini-trump-card.face-down{background:linear-gradient(135deg,#831843,#ef4444);color:#fecdd3;border-color:rgba(244,114,182,0.85);}
    .mini-trump-wrapper[data-card-back="forest"] .mini-trump-card.face-down{background:linear-gradient(135deg,#134e4a,#0f766e);color:#5eead4;border-color:rgba(45,212,191,0.85);}
    .mini-trump-card.interactive{cursor:pointer;}
    .mini-trump-card.interactive:hover{transform:translateY(-4px);box-shadow:0 12px 24px rgba(37,99,235,0.32);}
    .mini-trump-grid{display:grid;gap:12px;justify-content:center;}
    .mini-trump-fan{position:relative;}
    .mini-trump-blackjack{display:flex;flex-direction:column;gap:16px;align-items:center;}
    .mini-trump-hand{display:flex;gap:12px;align-items:center;flex-wrap:wrap;justify-content:center;}
    .mini-trump-label{font-size:14px;color:#cbd5f5;}
    .mini-trump-meta{font-size:12px;color:#94a3b8;}
    .mini-trump-baba-table{display:flex;flex-direction:column;gap:18px;align-items:center;}
    .mini-trump-baba-ring{display:flex;gap:24px;align-items:center;justify-content:center;flex-wrap:wrap;}
    .mini-trump-baba-player{display:flex;flex-direction:column;align-items:center;gap:8px;padding:10px 14px;border-radius:12px;background:rgba(15,23,42,0.4);min-width:150px;}
    .mini-trump-baba-player.active{border:1px solid rgba(96,165,250,0.7);box-shadow:0 0 0 2px rgba(37,99,235,0.35);}
    .mini-trump-baba-player .name{font-weight:600;color:#e2e8f0;}
    .mini-trump-baba-player .hand{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;}
    .mini-trump-baba-player .hand button{width:48px;height:68px;border-radius:8px;border:none;background:linear-gradient(135deg,#0f172a,#1e3a8a);color:#e2e8f0;cursor:pointer;font-weight:600;}
    .mini-trump-baba-player .hand button:hover{background:linear-gradient(135deg,#1e3a8a,#2563eb);} 
    .mini-trump-baba-player .hand-empty{font-size:12px;color:#94a3b8;}
    .mini-trump-finished{font-size:12px;color:#38bdf8;margin-top:6px;}
    @media (max-width:960px){
      .mini-trump-wrapper{flex-direction:column;}
      .mini-trump-nav{width:100%;flex-direction:row;}
      .mini-trump-nav header{display:none;}
      .mini-trump-nav-list{flex-direction:row;overflow:auto;}
      .mini-trump-nav-list button{flex:1;min-width:160px;}
    }
    `;
  }

  function createDeck(opts = {}){
    const decks = Math.max(1, opts.decks || 1);
    const jokers = Math.max(0, opts.jokers || 0);
    const out = [];
    for (let d = 0; d < decks; d++) {
      for (const suit of SUITS) {
        for (const rank of RANKS) {
          out.push({
            id: `${suit.id}-${rank.id}-${d}-${out.length}`,
            suit: suit.id,
            suitLabel: suit.label,
            suitSymbol: suit.symbol,
            color: suit.color,
            rank: rank.id,
            rankValue: rank.value,
            rankLabel: rank.label,
            deck: d
          });
        }
      }
    }
    for (let j = 0; j < jokers; j++) {
      out.push({
        id: `joker-${j}-${out.length}`,
        suit: 'joker',
        suitLabel: 'Joker',
        suitSymbol: j % 2 === 0 ? 'JOKER' : 'JK',
        color: j % 2 === 0 ? 'red' : 'black',
        rank: 'JOKER',
        rankValue: 0,
        rankLabel: 'Joker',
        deck: 0
      });
    }
    return out;
  }

  function shuffleInPlace(array, rng){
    const random = rng || Math.random;
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function drawCard(deck){
    return deck.shift() || null;
  }

  function cloneCard(card, idx){
    return Object.assign({}, card, { id: `${card.id}-clone-${idx}` });
  }

  function renderCard(card, opts = {}){
    const sizeClass = opts.size === 'small' ? 'small' : opts.size === 'tiny' ? 'tiny' : '';
    const faceUp = opts.faceUp !== false;
    const el = document.createElement('div');
    el.className = `mini-trump-card${sizeClass ? ' ' + sizeClass : ''}`;
    if (opts.interactive) el.classList.add('interactive');
    updateCardFace(el, card, faceUp);
    return el;
  }

  function updateCardFace(el, card, faceUp){
    el.innerHTML = '';
    if (!faceUp) {
      el.classList.add('face-down');
      el.dataset.face = 'down';
      return;
    }
    el.classList.remove('face-down');
    el.dataset.face = 'up';
    if (!card) return;
    const upper = document.createElement('div');
    upper.className = 'corner top';
    upper.textContent = card.rankLabel + (card.suit === 'joker' ? '' : card.suitSymbol);
    const lower = document.createElement('div');
    lower.className = 'corner bottom';
    lower.textContent = card.rankLabel + (card.suit === 'joker' ? '' : card.suitSymbol);
    const symbol = document.createElement('div');
    symbol.className = 'symbol';
    symbol.textContent = card.suit === 'joker' ? '★' : card.suitSymbol;
    if (card.color === 'red') el.classList.add('red'); else el.classList.remove('red');
    el.appendChild(upper);
    el.appendChild(symbol);
    el.appendChild(lower);
  }

  function cardValue(card){
    if (!card) return 0;
    if (typeof card.rankValue === 'number') return card.rankValue;
    const rank = String(card.rank || '').toUpperCase();
    if (rank === 'A') return 1;
    if (rank === 'J') return 11;
    if (rank === 'Q') return 12;
    if (rank === 'K') return 13;
    const numeric = Number(rank);
    return Number.isFinite(numeric) ? numeric : 0;
  }

  function formatCard(card, opts = {}){
    if (!card) return '';
    const style = (opts.style || opts.mode || 'short').toLowerCase();
    if (style === 'long') {
      if (card.suit === 'joker') return 'Joker';
      const suit = card.suitLabel || card.suit || '';
      const rank = card.rankLabel || card.rank || '';
      return `${suit}の${rank}`;
    }
    if (style === 'symbol') {
      return card.suit === 'joker' ? '★' : card.suitSymbol || '';
    }
    if (style === 'short') {
      if (card.suit === 'joker') return 'JK';
      return `${card.rankLabel || card.rank || ''}${card.suitSymbol || ''}`;
    }
    return `${card.rankLabel || card.rank || ''} ${card.suitLabel || card.suit || ''}`.trim();
  }

  function arrangeFan(container, cards, opts = {}){
    if (!container) return;
    const elements = Array.isArray(cards) ? cards : Array.from(cards || []);
    const direction = opts.direction === 'vertical' ? 'vertical' : 'horizontal';
    const spacing = Number.isFinite(opts.spacing) ? opts.spacing : 24;
    const maxTilt = Number.isFinite(opts.rotate) ? opts.rotate : 0;
    const tiltStep = elements.length > 1 ? maxTilt / (elements.length - 1) : 0;
    const startTilt = -maxTilt / 2;
    if (!container.classList.contains('mini-trump-fan')) {
      container.classList.add('mini-trump-fan');
    }
    const extent = Math.max(0, (elements.length - 1) * spacing);
    if (direction === 'horizontal') {
      if (!container.style.position) container.style.position = 'relative';
      if (!container.style.minWidth) container.style.minWidth = `${extent + 80}px`;
      if (!container.style.minHeight) container.style.minHeight = '120px';
    } else {
      if (!container.style.position) container.style.position = 'relative';
      if (!container.style.minHeight) container.style.minHeight = `${extent + 110}px`;
      if (!container.style.minWidth) container.style.minWidth = '80px';
    }
    elements.forEach((el, idx) => {
      if (!(el instanceof HTMLElement)) return;
      const offset = idx * spacing;
      const tilt = startTilt + idx * tiltStep;
      el.style.position = 'absolute';
      el.style.zIndex = String(100 + idx);
      if (direction === 'vertical') {
        el.style.transform = `translate(${Math.round(offset * 0.15)}px, ${offset}px) rotate(${tilt}deg)`;
      } else {
        el.style.transform = `translate(${offset}px, ${Math.round(offset * 0.05)}px) rotate(${tilt}deg)`;
      }
    });
  }

  function getMultiplier(diff){
    switch(diff){
      case 'EASY': return 0.8;
      case 'HARD': return 1.2;
      default: return 1.0;
    }
  }

  function formatTime(ms){
    const sec = Math.floor(ms / 1000);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2,'0')}`;
  }

  function loadPersisted(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { selectedGameId: null, stats: {}, settings: Object.assign({}, DEFAULT_SETTINGS) };
      const parsed = JSON.parse(raw);
      return {
        selectedGameId: typeof parsed.selectedGameId === 'string' ? parsed.selectedGameId : null,
        stats: parsed.stats && typeof parsed.stats === 'object' ? parsed.stats : {},
        settings: parsed.settings && typeof parsed.settings === 'object'
          ? Object.assign({}, DEFAULT_SETTINGS, parsed.settings)
          : Object.assign({}, DEFAULT_SETTINGS)
      };
    } catch {
      return { selectedGameId: null, stats: {}, settings: Object.assign({}, DEFAULT_SETTINGS) };
    }
  }

  function create(root, awardXp, opts){
    if (!root) throw new Error('MiniExp trump requires container');
    ensureStyleInjected();

    const persisted = loadPersisted();
    const difficulty = (opts?.difficulty || 'NORMAL').toUpperCase();
    const multiplier = getMultiplier(difficulty);

    const state = {
      root,
      awardXp,
      difficulty,
      multiplier,
      currentGame: null,
      currentRuntime: null,
      actions: [],
      hotkeys: new Map(),
      stats: persisted.stats || {},
      settings: Object.assign({}, DEFAULT_SETTINGS, persisted.settings || {}),
      settingsListeners: new Set(),
     selectedGameId: persisted.selectedGameId,
      saveTimer: null,
      destroyed: false
    };

    const wrapper = document.createElement('div');
    wrapper.className = 'mini-trump-wrapper mini-trump-panel';
    wrapper.dataset.cardBack = state.settings.cardBack || DEFAULT_SETTINGS.cardBack;

    const nav = document.createElement('nav');
    nav.className = 'mini-trump-nav mini-trump-panel';

    const navHeader = document.createElement('header');
    navHeader.textContent = 'トランプゲーム';

    const navList = document.createElement('div');
    navList.className = 'mini-trump-nav-list';

    nav.appendChild(navHeader);
    nav.appendChild(navList);

    const main = document.createElement('section');
    main.className = 'mini-trump-main mini-trump-panel';

    const header = document.createElement('div');
    header.className = 'mini-trump-header';

    const title = document.createElement('div');
    title.className = 'mini-trump-header-title';
    title.textContent = 'トランプセレクション';

    const statusBox = document.createElement('div');
    statusBox.className = 'mini-trump-header-status';

    const statusLine = document.createElement('div');
    statusLine.className = 'mini-trump-status-line';
    statusLine.textContent = 'ゲームを選択してください。';

    const scoreLine = document.createElement('div');
    scoreLine.className = 'mini-trump-score';
    scoreLine.textContent = '';

    statusBox.appendChild(statusLine);
    statusBox.appendChild(scoreLine);

    const headerControls = document.createElement('div');
    headerControls.className = 'mini-trump-header-controls';

    const difficultyBadge = document.createElement('span');
    difficultyBadge.className = 'mini-trump-difficulty';
    const multiplierTxt = state.multiplier.toFixed(1).replace(/\.0$/, '');
    difficultyBadge.textContent = `難易度 ${state.difficulty} ×${multiplierTxt}`;

    const settingsButton = document.createElement('button');
    settingsButton.type = 'button';
    settingsButton.className = 'mini-trump-header-settings';
    settingsButton.setAttribute('aria-label', '設定');
    settingsButton.textContent = '⚙';

    headerControls.appendChild(difficultyBadge);
    headerControls.appendChild(settingsButton);
    headerControls.appendChild(statusBox);

    header.appendChild(title);
    header.appendChild(headerControls);

    settingsButton.addEventListener('click', (ev) => {
      ev.stopPropagation();
      if (settingsPanelElement) {
        closeSettingsPanel();
      } else {
        openSettingsPanel();
      }
    });

    const board = document.createElement('div');
    board.className = 'mini-trump-board';

    const placeholder = document.createElement('div');
    placeholder.className = 'mini-trump-placeholder';
    placeholder.innerHTML = '<div>左のリストからゲームを選んでください。</div><div style="font-size:12px;color:#94a3b8;">Phase 1: 神経衰弱 / ブラックジャック / ババ抜き</div>';
    board.appendChild(placeholder);

    const actionsBar = document.createElement('div');
    actionsBar.className = 'mini-trump-actions';

    const toastContainer = document.createElement('div');
    toastContainer.className = 'mini-trump-toast-container';

    main.appendChild(header);
    main.appendChild(board);
    main.appendChild(actionsBar);
    main.appendChild(toastContainer);

    let settingsPanelElement = null;
    let settingsPanelRefs = null;
    let settingsPanelCleanup = null;

    wrapper.appendChild(nav);
    wrapper.appendChild(main);
    root.appendChild(wrapper);

    applySettings();

    function queueSave(){
      if (state.destroyed) return;
      if (state.saveTimer) clearTimeout(state.saveTimer);
      state.saveTimer = setTimeout(() => {
        state.saveTimer = null;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            selectedGameId: state.selectedGameId || null,
            stats: state.stats,
            settings: state.settings
          }));
        } catch {}
      }, 400);
    }

    function applySettings(){
      wrapper.dataset.cardBack = state.settings.cardBack || DEFAULT_SETTINGS.cardBack;
      if (settingsPanelRefs) {
        const currentBack = state.settings.cardBack || DEFAULT_SETTINGS.cardBack;
        if (settingsPanelRefs.optionMap) {
          for (const [id, btn] of settingsPanelRefs.optionMap.entries()) {
            if (!btn) continue;
            if (id === currentBack) btn.classList.add('selected'); else btn.classList.remove('selected');
          }
        }
        if (settingsPanelRefs.autoFlipCheckbox) {
          settingsPanelRefs.autoFlipCheckbox.checked = state.settings.autoFlip !== false;
        }
      }
    }

    function updateSetting(key, value){
      if (state.settings[key] === value) return;
      state.settings = Object.assign({}, state.settings, { [key]: value });
      applySettings();
      queueSave();
      const snapshot = Object.assign({}, state.settings);
      for (const listener of state.settingsListeners) {
        try { listener(snapshot, key); } catch {}
      }
    }

    function getSettings(){
      return state.settings;
    }

    function onSettingsChange(handler){
      if (typeof handler !== 'function') return () => {};
      state.settingsListeners.add(handler);
      return () => state.settingsListeners.delete(handler);
    }

    function openSettingsPanel(){
      closeSettingsPanel();
      settingsButton.classList.add('active');
      const panel = document.createElement('div');
      panel.className = 'mini-trump-settings-panel';

      const heading = document.createElement('h3');
      heading.textContent = '設定';
      panel.appendChild(heading);

      const backGroup = document.createElement('div');
      backGroup.className = 'mini-trump-settings-group';
      const backLabel = document.createElement('span');
      backLabel.textContent = 'カード裏面テーマ';
      backLabel.style.fontSize = '12px';
      backLabel.style.color = '#cbd5f5';
      backLabel.style.fontWeight = '600';
      backGroup.appendChild(backLabel);
      const optionsWrap = document.createElement('div');
      optionsWrap.className = 'mini-trump-settings-options';
      backGroup.appendChild(optionsWrap);

      const optionMap = new Map();
      for (const opt of CARD_BACK_OPTIONS) {
        const optionBtn = document.createElement('button');
        optionBtn.type = 'button';
        optionBtn.className = 'mini-trump-settings-option';
        optionBtn.dataset.value = opt.id;
        optionBtn.addEventListener('click', () => updateSetting('cardBack', opt.id));
        optionBtn.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter' || ev.key === ' ') {
            ev.preventDefault();
            updateSetting('cardBack', opt.id);
          }
        });

        const name = document.createElement('span');
        name.textContent = opt.label;
        name.style.fontSize = '13px';
        name.style.fontWeight = '600';
        const preview = document.createElement('div');
        preview.className = 'mini-trump-settings-preview';
        preview.style.background = opt.gradient;
        preview.style.border = `1px solid ${opt.border}`;
        preview.style.color = opt.color;
        const desc = document.createElement('small');
        desc.textContent = opt.description;

        optionBtn.appendChild(name);
        optionBtn.appendChild(preview);
        optionBtn.appendChild(desc);

        optionsWrap.appendChild(optionBtn);
        optionMap.set(opt.id, optionBtn);
      }

      panel.appendChild(backGroup);

      const toggleRow = document.createElement('label');
      toggleRow.className = 'toggle';
      const toggleText = document.createElement('span');
      toggleText.textContent = '神経衰弱で不一致カードを自動で裏返す';
      const toggleInput = document.createElement('input');
      toggleInput.type = 'checkbox';
      toggleInput.checked = state.settings.autoFlip !== false;
      toggleInput.addEventListener('change', () => updateSetting('autoFlip', toggleInput.checked));
      toggleRow.appendChild(toggleText);
      toggleRow.appendChild(toggleInput);
      panel.appendChild(toggleRow);

      header.appendChild(panel);
      settingsPanelElement = panel;
      settingsPanelRefs = { optionMap, autoFlipCheckbox: toggleInput };

      applySettings();

      const handleClickOutside = (ev) => {
        if (panel.contains(ev.target) || ev.target === settingsButton) return;
        closeSettingsPanel();
      };
      const handleKeydown = (ev) => {
        if (ev.key === 'Escape') {
          closeSettingsPanel();
        }
      };
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside, true);
        window.addEventListener('keydown', handleKeydown, true);
      }, 0);
      settingsPanelCleanup = () => {
        document.removeEventListener('mousedown', handleClickOutside, true);
        window.removeEventListener('keydown', handleKeydown, true);
        settingsPanelCleanup = null;
      };
    }

    function closeSettingsPanel(){
      if (settingsPanelCleanup) settingsPanelCleanup();
      if (settingsPanelElement && settingsPanelElement.parentNode) {
        settingsPanelElement.parentNode.removeChild(settingsPanelElement);
      }
      settingsPanelElement = null;
      settingsPanelRefs = null;
      settingsButton.classList.remove('active');
    }

    function difficultyAward(amount, meta){
      if (!amount || amount <= 0) return 0;
      const val = Math.max(1, Math.round(amount * state.multiplier));
      return awardXp(val, meta);
    }

    function getStats(gameId){
      return state.stats[gameId] || (state.stats[gameId] = { plays: 0, wins: 0, bestScore: null, lastScore: null });
    }

    function commitStats(gameId, delta){
      const stats = getStats(gameId);
      if (delta.plays) stats.plays += delta.plays;
      if (delta.wins) stats.wins += delta.wins;
      if (typeof delta.score === 'number') {
        stats.lastScore = delta.score;
        if (delta.bestMode === 'lower') {
          stats.bestScore = stats.bestScore == null ? delta.score : Math.min(stats.bestScore, delta.score);
        } else if (delta.bestMode === 'higher') {
          stats.bestScore = stats.bestScore == null ? delta.score : Math.max(stats.bestScore, delta.score);
        }
      }
      queueSave();
      renderGameList();
    }

    function showToast(message, opts){
      const toast = document.createElement('div');
      toast.className = 'mini-trump-toast';
      if (opts?.type === 'warn') toast.classList.add('warn');
      toast.textContent = message;
      toastContainer.appendChild(toast);
      requestAnimationFrame(() => toast.classList.add('show'));
      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => { toast.remove(); }, 200);
      }, opts?.duration || 2200);
    }

    function setStatus(text){
      statusLine.textContent = text;
    }

    function setScore(text){
      scoreLine.textContent = text || '';
    }

    function setTitle(text){
      title.textContent = text;
    }

    function returnToSelection(){
      if (state.currentRuntime) {
        try { state.currentRuntime.stop && state.currentRuntime.stop(); } catch {}
        try { state.currentRuntime.destroy && state.currentRuntime.destroy(); } catch {}
      }
      state.currentRuntime = null;
      state.currentGame = null;
      state.selectedGameId = null;
      board.innerHTML = '';
      board.appendChild(placeholder);
      setTitle('トランプセレクション');
      setStatus('ゲームを選択してください。');
      setScore('');
      closeSettingsPanel();
      queueSave();
      renderGameList();
    }

    function setActions(defs){
      state.actions = defs || [];
      actionsBar.innerHTML = '';
      state.hotkeys.clear();
      if (!state.actions.length) {
        const btn = document.createElement('button');
        btn.textContent = 'ゲームを終了';
        btn.addEventListener('click', returnToSelection);
        actionsBar.appendChild(btn);
        state.hotkeys.set('ESCAPE', { trigger: () => btn.click(), label: 'ゲームを終了' });
        state.hotkeys.set('ESC', { trigger: () => btn.click(), label: 'ゲームを終了' });
        return;
      }
      for (const entry of state.actions) {
        const btn = document.createElement('button');
        btn.textContent = entry.label || 'Action';
        if (entry.variant === 'primary') btn.classList.add('primary');
        if (entry.variant === 'secondary') btn.classList.add('secondary');
        btn.disabled = !!entry.disabled;
        if (typeof entry.onClick === 'function') {
          btn.addEventListener('click', entry.onClick);
        }
        actionsBar.appendChild(btn);
        if (entry.hotkey) {
          state.hotkeys.set(entry.hotkey.toUpperCase(), { trigger: () => btn.click(), label: entry.label });
        }
      }
    }

    function getGameDef(id){
      return GAME_DEFS.find(g => g.id === id) || null;
    }

    function renderGameList(){
      navList.innerHTML = '';
      for (const def of GAME_DEFS) {
        const button = document.createElement('button');
        button.dataset.gameId = def.id;
        const icon = document.createElement('span');
        icon.className = 'icon';
        icon.textContent = def.icon;
        const label = document.createElement('span');
        label.textContent = def.title;
        button.appendChild(icon);
        button.appendChild(label);
        if (!def.implemented) {
          button.classList.add('disabled');
          const badge = document.createElement('span');
          badge.className = 'meta';
          badge.textContent = '準備中';
          button.appendChild(badge);
        } else {
          const stats = state.stats[def.id];
          if (stats && stats.bestScore != null) {
            const badge = document.createElement('span');
            badge.className = 'meta';
            badge.textContent = `Best ${stats.bestScore}`;
            button.appendChild(badge);
          }
        }
        if (state.selectedGameId === def.id) {
          button.classList.add('selected');
        }
        button.addEventListener('click', () => {
          if (!def.implemented) {
            setTitle(def.title);
            board.innerHTML = '';
            const msg = document.createElement('div');
            msg.className = 'mini-trump-placeholder';
            msg.innerHTML = `<div style="font-size:18px;">${def.title}</div><div style="max-width:420px;font-size:13px;color:#94a3b8;">${def.description}<br>Phase ${def.phase} で実装予定です。</div>`;
            board.appendChild(msg);
            setStatus('開発中のゲームです。今後のアップデートをお待ちください。');
            setScore('');
            setActions([]);
            return;
          }
          launchGame(def);
        });
        navList.appendChild(button);
      }
    }

    function clearBoard(){
      board.innerHTML = '';
    }

    function launchGame(def){
      closeSettingsPanel();
      if (state.currentRuntime) {
        try { state.currentRuntime.stop && state.currentRuntime.stop(); } catch {}
        try { state.currentRuntime.destroy && state.currentRuntime.destroy(); } catch {}
        state.currentRuntime = null;
      }
      state.currentGame = def;
      state.selectedGameId = def.id;
      queueSave();
      clearBoard();

      const gameRoot = document.createElement('div');
      board.appendChild(gameRoot);

      const context = {
        difficulty: state.difficulty,
        multiplier: state.multiplier,
        award: (base, meta) => difficultyAward(base, Object.assign({ game: def.id }, meta || {})),
        cardUtils: { createDeck, shuffle: shuffleInPlace, renderCard, updateCardFace, drawCard, cloneCard, cardValue, formatCard, arrangeFan },
        setStatus,
        setScore,
        setTitle,
        setActions,
        showToast,
        exitToHub: returnToSelection,
        getSettings,
        onSettingsChange,
        updateSetting,
        stats: () => getStats(def.id),
        commitStats: (delta) => commitStats(def.id, delta),
        queueSave,
        playClick: () => { window.playSfx && window.playSfx('pickup'); }
      };

      setTitle(def.title);
      renderGameList();

      let runtime;
      try {
        if (def.id === 'memory') runtime = createMemoryGame(gameRoot, context);
        else if (def.id === 'blackjack') runtime = createBlackjackGame(gameRoot, context);
        else if (def.id === 'baba') runtime = createBabaGame(gameRoot, context);
        else runtime = createPlaceholderGame(gameRoot, context, def);
      } catch (err) {
        console.error('Trump game init failed', err);
        showToast('ゲームの初期化に失敗しました。', { type: 'warn' });
        const fallback = document.createElement('div');
        fallback.className = 'mini-trump-placeholder';
        fallback.textContent = '初期化に失敗しました。別のゲームを試してください。';
        board.appendChild(fallback);
        setActions([]);
        return;
      }

      state.currentRuntime = runtime;
      try { runtime.start && runtime.start(); } catch (err) { console.error(err); }
    }

    function createPlaceholderGame(container, ctx, def){
      container.innerHTML = '';
      const msg = document.createElement('div');
      msg.className = 'mini-trump-placeholder';
      msg.innerHTML = `<div style="font-size:18px;">${def.title}</div><div style="font-size:14px;color:#94a3b8;max-width:420px;">${def.description}<br>実装準備中です。</div>`;
      container.appendChild(msg);
      ctx.setStatus('現在は開発中です。');
      ctx.setScore('');
      ctx.setActions([
        { label: '一覧に戻る', variant: 'secondary', onClick: () => ctx.exitToHub() }
      ]);
      return {
        start(){},
        stop(){},
        destroy(){ container.innerHTML=''; }
      };
    }

    function handleKeydown(e){
      if (!state.currentGame) return;
      if (e.repeat) return;
      const key = e.key.toUpperCase();
      if (key === 'ESCAPE' || key === 'ESC') {
        e.preventDefault();
        returnToSelection();
        return;
      }
      if (state.hotkeys.has(key)) {
        e.preventDefault();
        const action = state.hotkeys.get(key);
        try { action.trigger(); } catch {}
      }
    }

    document.addEventListener('keydown', handleKeydown);

    renderGameList();

    if (state.selectedGameId) {
      const def = getGameDef(state.selectedGameId);
      if (def && def.implemented) {
        launchGame(def);
      }
    }

    return {
      start(){
        try { state.currentRuntime && state.currentRuntime.start && state.currentRuntime.start(); } catch{}
      },
      stop(){
        try { state.currentRuntime && state.currentRuntime.stop && state.currentRuntime.stop(); } catch{}
      },
      destroy(){
        state.destroyed = true;
        document.removeEventListener('keydown', handleKeydown);
        if (state.saveTimer) { clearTimeout(state.saveTimer); state.saveTimer = null; }
        try { state.currentRuntime && state.currentRuntime.destroy && state.currentRuntime.destroy(); } catch{}
        state.currentRuntime = null;
        closeSettingsPanel();
        state.settingsListeners.clear();
        root.removeChild(wrapper);
      },
      getScore(){
        try { return state.currentRuntime && state.currentRuntime.getScore ? state.currentRuntime.getScore() : 0; } catch{ return 0; }
      }
    };
  }

  function createMemoryGame(container, ctx){
    const config = getMemoryConfig(ctx.difficulty);
    const state = {
      cards: [],
      flipped: [],
      matches: 0,
      attempts: 0,
      running: false,
      startTime: 0,
      timerId: null,
      elapsed: 0,
      locked: false,
      streak: 0,
      finished: false,
      pendingReset: new Set()
    };

    let autoFlipEnabled = ctx.getSettings().autoFlip !== false;
    const detachSettings = ctx.onSettingsChange((settings, key) => {
      autoFlipEnabled = settings.autoFlip !== false;
      if (autoFlipEnabled && state.pendingReset.size) {
        const pending = Array.from(state.pendingReset);
        state.pendingReset.clear();
        pending.forEach((entry, idx) => {
          if (!entry) return;
          setTimeout(() => {
            entry.faceUp = false;
            ctx.cardUtils.updateCardFace(entry.element, entry.card, false);
            if (idx === pending.length - 1) updateStatus();
          }, 120 * idx);
        });
      } else {
        updateStatus();
      }
    });

    const grid = document.createElement('div');
    grid.className = 'mini-trump-grid';
    grid.style.setProperty('grid-template-columns', `repeat(${config.columns}, minmax(0, 1fr))`);

    container.innerHTML = '';
    container.appendChild(grid);

    ctx.setActions([
      { label: 'リスタート (R)', variant: 'primary', hotkey: 'R', onClick: restart },
      { label: 'ゲーム一覧 (B)', variant: 'secondary', hotkey: 'B', onClick: () => ctx.exitToHub() }
    ]);

    function buildDeck(){
      const baseDeck = ctx.cardUtils.createDeck();
      ctx.cardUtils.shuffle(baseDeck);
      const chosen = baseDeck.slice(0, config.pairs);
      const pool = [];
      let idx = 0;
      for (const card of chosen) {
        const a = ctx.cardUtils.cloneCard(card, idx++);
        const b = ctx.cardUtils.cloneCard(card, idx++);
        const key = card.rank + '-' + card.color;
        pool.push({ card: a, pairKey: key });
        pool.push({ card: b, pairKey: key });
      }
      ctx.cardUtils.shuffle(pool);
      return pool.map((entry, i) => ({
        id: `${entry.card.id}-mem-${i}`,
        card: entry.card,
        pairKey: entry.pairKey,
        faceUp: false,
        matched: false,
        element: null
      }));
    }

    function startTimer(){
      state.running = true;
      state.startTime = performance.now();
      state.timerId = setInterval(() => {
        if (!state.running) return;
        state.elapsed = performance.now() - state.startTime;
        updateStatus();
      }, 200);
    }

    function stopTimer(){
      state.running = false;
      if (state.timerId) { clearInterval(state.timerId); state.timerId = null; }
      state.elapsed = performance.now() - state.startTime;
      updateStatus();
    }

    function flip(cardEntry){
      if (!cardEntry) return;
      if (state.locked) return;
      if (state.pendingReset.size) {
        if (state.pendingReset.has(cardEntry)) {
          state.pendingReset.delete(cardEntry);
          cardEntry.faceUp = false;
          ctx.cardUtils.updateCardFace(cardEntry.element, cardEntry.card, false);
          ctx.playClick();
          if (!state.pendingReset.size) {
            updateStatus();
          }
        } else {
          ctx.showToast('開いたカードを戻してから次をめくってください。', { type: 'warn', duration: 1600 });
        }
        return;
      }
      if (cardEntry.matched || cardEntry.faceUp) return;
      if (!state.running && !state.finished) startTimer();
      cardEntry.faceUp = true;
      ctx.cardUtils.updateCardFace(cardEntry.element, cardEntry.card, true);
      state.flipped.push(cardEntry);
      ctx.playClick();
      if (state.flipped.length === 2) {
        state.locked = true;
        state.attempts++;
        setTimeout(checkPair, 320);
      }
      updateStatus();
    }

    function checkPair(){
      const [a, b] = state.flipped;
      state.flipped = [];
      if (!a || !b) { state.locked = false; return; }
      if (a.pairKey === b.pairKey) {
        a.matched = b.matched = true;
        state.matches++;
        state.streak++;
        ctx.award(3 + (state.streak > 1 ? 1 : 0), { type: 'memory-match', streak: state.streak });
        state.locked = false;
        if (state.matches >= config.pairs) {
          finish();
        }
      } else {
        state.streak = 0;
        ctx.award(1, { type: 'memory-miss' });
        if (autoFlipEnabled) {
          setTimeout(() => {
            a.faceUp = false; b.faceUp = false;
            ctx.cardUtils.updateCardFace(a.element, a.card, false);
            ctx.cardUtils.updateCardFace(b.element, b.card, false);
            state.locked = false;
            updateStatus();
          }, 600);
        } else {
          state.pendingReset.clear();
          state.pendingReset.add(a);
          state.pendingReset.add(b);
          state.locked = false;
          ctx.showToast('不一致です。カードをタップして裏返してください。', { duration: 2200 });
        }
      }
      updateStatus();
    }

    function finish(){
      state.finished = true;
      stopTimer();
      const totalMs = state.elapsed;
      const seconds = Math.floor(totalMs / 1000);
      ctx.award(60, { type: 'memory-clear', time: seconds });
      ctx.showToast(`クリア！タイム ${formatTime(totalMs)} / ミス ${state.attempts - state.matches}`);
      ctx.commitStats({ plays: 1, wins: 1, score: seconds, bestMode: 'lower' });
      ctx.setActions([
        { label: 'もう一度 (R)', variant: 'primary', hotkey: 'R', onClick: restart },
        { label: 'ゲーム一覧 (B)', variant: 'secondary', hotkey: 'B', onClick: () => ctx.exitToHub() }
      ]);
    }

    function updateStatus(){
      const mistakes = state.attempts - state.matches;
      const stats = ctx.stats();
      const flipMode = autoFlipEnabled ? '自動' : '手動';
      ctx.setStatus(`ペア ${state.matches}/${config.pairs} ・ ミス ${Math.max(0, mistakes)} ・ 経過 ${formatTime(state.elapsed || 0)} ・ 裏返し ${flipMode}`);
      ctx.setScore(`通算 ${stats.plays||0} 回 / ベスト ${stats.bestScore != null ? stats.bestScore + ' 秒' : '---'}`);
    }

    function restart(){
      state.cards = buildDeck();
      state.flipped = [];
      state.matches = 0;
      state.attempts = 0;
      state.running = false;
      state.startTime = 0;
      state.elapsed = 0;
      state.locked = false;
      state.streak = 0;
      state.finished = false;
      state.pendingReset.clear();
      autoFlipEnabled = ctx.getSettings().autoFlip !== false;
      if (state.timerId) { clearInterval(state.timerId); state.timerId = null; }

      grid.innerHTML = '';
      for (const entry of state.cards) {
        const el = ctx.cardUtils.renderCard(entry.card, { faceUp: false, size: 'small', interactive: true });
        entry.element = el;
        el.addEventListener('click', () => flip(entry));
        grid.appendChild(el);
      }
      updateStatus();
    }

    restart();

    return {
      start(){ if (state.running && !state.timerId) startTimer(); },
      stop(){ if (state.timerId) { clearInterval(state.timerId); state.timerId = null; } state.running = false; },
      destroy(){ if (state.timerId) clearInterval(state.timerId); if (typeof detachSettings === 'function') detachSettings(); },
      getScore(){ return ctx.stats().bestScore || 0; }
    };
  }

  function getMemoryConfig(diff){
    switch(diff){
      case 'EASY': return { pairs: 12, columns: 6 };
      case 'HARD': return { pairs: 18, columns: 6 };
      default: return { pairs: 15, columns: 6 };
    }
  }

  function createBlackjackGame(container, ctx){
    const state = {
      shoe: [],
      discard: [],
      playerHand: [],
      dealerHand: [],
      inRound: false,
      settled: false,
      wins: 0,
      losses: 0,
      pushes: 0
    };

    const root = document.createElement('div');
    root.className = 'mini-trump-blackjack';

    const dealerLabel = document.createElement('div');
    dealerLabel.className = 'mini-trump-label';
    dealerLabel.textContent = 'ディーラー';

    const dealerHandEl = document.createElement('div');
    dealerHandEl.className = 'mini-trump-hand';

    const playerLabel = document.createElement('div');
    playerLabel.className = 'mini-trump-label';
    playerLabel.textContent = 'プレイヤー';

    const playerHandEl = document.createElement('div');
    playerHandEl.className = 'mini-trump-hand';

    const message = document.createElement('div');
    message.className = 'mini-trump-meta';
    message.textContent = 'HIT / STAND を選択してください。';

    root.appendChild(dealerLabel);
    root.appendChild(dealerHandEl);
    root.appendChild(playerLabel);
    root.appendChild(playerHandEl);
    root.appendChild(message);

    container.innerHTML = '';
    container.appendChild(root);

    ctx.setActions([
      { label: 'ヒット (H)', variant: 'primary', hotkey: 'H', onClick: () => hit() },
      { label: 'スタンド (S)', variant: 'secondary', hotkey: 'S', onClick: () => stand() },
      { label: 'リスタート (R)', variant: 'secondary', hotkey: 'R', onClick: () => newRound(true) },
      { label: 'ゲーム一覧 (B)', variant: 'secondary', hotkey: 'B', onClick: () => ctx.exitToHub() }
    ]);

    function ensureShoe(){
      if (state.shoe.length > 60) return;
      state.shoe = ctx.cardUtils.createDeck({ decks: 6 });
      ctx.cardUtils.shuffle(state.shoe);
      state.discard = [];
    }

    function deal(hand, faceUp = true){
      ensureShoe();
      const card = ctx.cardUtils.drawCard(state.shoe);
      if (!card) return null;
      const entry = { card, faceUp };
      hand.push(entry);
      return entry;
    }

    function renderHands(revealDealer){
      dealerHandEl.innerHTML = '';
      for (let i = 0; i < state.dealerHand.length; i++) {
        const info = state.dealerHand[i];
        const face = revealDealer || i !== 0 ? info.faceUp !== false : false;
        const el = ctx.cardUtils.renderCard(info.card, { faceUp: face, size: 'small' });
        dealerHandEl.appendChild(el);
      }
      playerHandEl.innerHTML = '';
      for (const info of state.playerHand) {
        const el = ctx.cardUtils.renderCard(info.card, { faceUp: info.faceUp !== false, size: 'small' });
        playerHandEl.appendChild(el);
      }
      updateStatus();
    }

    function handValue(hand){
      let total = 0;
      let aces = 0;
      for (const entry of hand) {
        const rank = entry.card.rank;
        if (rank === 'A') { aces++; total += 11; }
        else if (['K','Q','J'].includes(rank) || rank === '10') total += 10;
        else total += Number(rank);
      }
      while (total > 21 && aces > 0) { total -= 10; aces--; }
      return total;
    }

    function updateStatus(){
      const stats = ctx.stats();
      ctx.setStatus(`Wins ${state.wins} / Losses ${state.losses} / Push ${state.pushes}`);
      ctx.setScore(`通算プレイ ${stats.plays||0} ・ 勝利 ${stats.wins||0}`);
    }

    function setMessage(text){
      message.textContent = text;
    }

    function settleRound(outcome){
      if (state.settled) return;
      state.settled = true;
      ctx.setActions([
        { label: '次のハンド (N)', variant: 'primary', hotkey: 'N', onClick: () => newRound(false) },
        { label: 'ゲーム一覧 (B)', variant: 'secondary', hotkey: 'B', onClick: () => ctx.exitToHub() }
      ]);
      const isWin = outcome === 'win' || outcome === 'bj';
      const projectedWins = state.wins + (isWin ? 1 : 0);
      ctx.commitStats({ plays: 1, wins: isWin ? 1 : 0, score: projectedWins, bestMode: 'higher' });
      if (outcome === 'win') {
        state.wins++;
        ctx.award(25, { type: 'blackjack-win' });
      } else if (outcome === 'bj') {
        state.wins++;
        ctx.award(60, { type: 'blackjack-blackjack' });
      } else if (outcome === 'push') {
        state.pushes++;
        ctx.award(10, { type: 'blackjack-push' });
      } else {
        state.losses++;
        ctx.showToast('残念！次は勝てるはず。', { type: 'warn', duration: 2600 });
      }
      renderHands(true);
      updateStatus();
    }

    function checkForNaturals(){
      const playerVal = handValue(state.playerHand);
      const dealerVal = handValue(state.dealerHand);
      if (playerVal === 21 && dealerVal !== 21) {
        setMessage('ブラックジャック！');
        settleRound('bj');
        return true;
      }
      if (dealerVal === 21 && playerVal !== 21) {
        setMessage('ディーラーがブラックジャック…');
        settleRound('lose');
        return true;
      }
      if (dealerVal === 21 && playerVal === 21) {
        setMessage('両者ブラックジャック。プッシュ！');
        settleRound('push');
        return true;
      }
      return false;
    }

    function hit(){
      if (!state.inRound || state.settled) return;
      deal(state.playerHand);
      renderHands(false);
      const value = handValue(state.playerHand);
      if (value > 21) {
        setMessage(`バースト (${value})`);
        settleRound('lose');
      } else {
        setMessage(`合計 ${value} / HIT or STAND`);
      }
    }

    function stand(){
      if (!state.inRound || state.settled) return;
      dealerPlay();
    }

    function dealerPlay(){
      state.dealerHand[0].faceUp = true;
      let dealerVal = handValue(state.dealerHand);
      const soft17 = dealerVal === 17 && state.dealerHand.some(entry => entry.card.rank === 'A');
      const hitSoft17 = ctx.difficulty === 'HARD';
      while (dealerVal < 17 || (soft17 && hitSoft17 && dealerVal === 17)) {
        deal(state.dealerHand);
        dealerVal = handValue(state.dealerHand);
      }
      const playerVal = handValue(state.playerHand);
      if (dealerVal > 21) {
        setMessage(`ディーラーがバースト (${dealerVal})`);
        settleRound('win');
        return;
      }
      if (dealerVal > playerVal) {
        setMessage(`ディーラー ${dealerVal} 対 ${playerVal}`);
        settleRound('lose');
      } else if (dealerVal < playerVal) {
        setMessage(`勝利！${playerVal} 対 ${dealerVal}`);
        settleRound('win');
      } else {
        setMessage(`プッシュ (${playerVal})`);
        settleRound('push');
      }
    }

    function newRound(resetStats){
      if (resetStats) {
        state.wins = state.losses = state.pushes = 0;
      }
      state.playerHand = [];
      state.dealerHand = [];
      state.inRound = true;
      state.settled = false;

      ctx.setActions([
        { label: 'ヒット (H)', variant: 'primary', hotkey: 'H', onClick: () => hit() },
        { label: 'スタンド (S)', variant: 'secondary', hotkey: 'S', onClick: () => stand() },
        { label: 'リスタート (R)', variant: 'secondary', hotkey: 'R', onClick: () => newRound(true) },
        { label: 'ゲーム一覧 (B)', variant: 'secondary', hotkey: 'B', onClick: () => ctx.exitToHub() }
      ]);

      deal(state.playerHand);
      deal(state.dealerHand, false);
      deal(state.playerHand);
      deal(state.dealerHand);
      state.dealerHand[0].faceUp = false;
      renderHands(false);
      if (!checkForNaturals()) {
        setMessage('HIT または STAND を選択してください。');
      }
    }

    newRound(true);

    return {
      start(){},
      stop(){},
      destroy(){},
      getScore(){ return state.wins; }
    };
  }

  function createBabaGame(container, ctx){
    const players = [
      { id: 0, name: 'You', human: true, hand: [], finishedAt: null },
      { id: 1, name: 'AI-1', human: false, hand: [], finishedAt: null },
      { id: 2, name: 'AI-2', human: false, hand: [], finishedAt: null },
      { id: 3, name: 'AI-3', human: false, hand: [], finishedAt: null }
    ];
    const state = {
      order: [],
      current: 0,
      jokerHolder: null,
      finished: false,
      turnCount: 0
    };

    const layout = document.createElement('div');
    layout.className = 'mini-trump-baba-table';

    const ring = document.createElement('div');
    ring.className = 'mini-trump-baba-ring';

    layout.appendChild(ring);
    container.innerHTML = '';
    container.appendChild(layout);

    ctx.setActions([
      { label: 'ヒント (H)', variant: 'secondary', hotkey: 'H', onClick: () => ctx.showToast('右隣のプレイヤーのカードをクリックして引きましょう。') },
      { label: 'リスタート (R)', variant: 'secondary', hotkey: 'R', onClick: () => initGame() },
      { label: 'ゲーム一覧 (B)', variant: 'secondary', hotkey: 'B', onClick: () => ctx.exitToHub() }
    ]);

    function updateHud(){
      const stats = ctx.stats();
      const human = players[0];
      const best = stats.bestScore != null ? `${stats.bestScore} 位` : '---';
      ctx.setScore(`通算 ${stats.plays||0} 回 / ベスト ${best} / 手札 ${human.hand.length} 枚`);
    }

    function initGame(){
      for (const p of players) {
        p.hand = [];
        p.finishedAt = null;
      }
      state.order = [];
      state.current = 0;
      state.jokerHolder = null;
      state.finished = false;
      state.turnCount = 0;

      let deck = ctx.cardUtils.createDeck();
      deck.push({ id: 'joker-main', suit: 'joker', rank: 'JOKER', suitLabel: 'Joker', suitSymbol: 'JOKER', color: 'black', rankValue: 0, rankLabel: 'Joker' });
      ctx.cardUtils.shuffle(deck);

      let idx = 0;
      while (deck.length) {
        const card = ctx.cardUtils.drawCard(deck);
        if (!card) break;
        players[idx % players.length].hand.push(card);
        idx++;
      }
      for (const p of players) {
        removePairs(p, { award: false });
      }
      state.current = findNextActive(0);
      render();
      ctx.setStatus(`あなたの番：右隣のカードをクリックしてください。（手札 ${players[0].hand.length} 枚）`);
      updateHud();
      ctx.showToast('ゲーム開始！右隣のプレイヤーからカードを引きましょう。');
    }

    function findNextActive(start){
      let i = start;
      for (let attempt = 0; attempt < players.length; attempt++) {
        const player = players[i % players.length];
        if (player.hand.length > 0) return i % players.length;
        i++;
      }
      return start;
    }

    function removePairs(player, opts){
      const counts = new Map();
      for (const card of player.hand) {
        if (card.suit === 'joker') continue;
        const key = card.rank;
        counts.set(key, (counts.get(key) || 0) + 1);
      }
      const toRemove = new Set();
      for (const [rank, count] of counts.entries()) {
        const pairs = Math.floor(count / 2);
        if (pairs <= 0) continue;
        let removed = 0;
        for (let i = player.hand.length - 1; i >= 0 && removed < pairs * 2; i--) {
          if (player.hand[i].rank === rank) {
            toRemove.add(player.hand[i].id);
            removed++;
          }
        }
        if (player.human && opts?.award !== false) {
          ctx.award(4, { type: 'baba-pair', rank });
        }
      }
      if (toRemove.size) {
        player.hand = player.hand.filter(card => !toRemove.has(card.id));
      }
      if (player.hand.length === 0 && player.finishedAt == null) {
        player.finishedAt = state.order.length + 1;
        state.order.push(player.id);
        if (player.human) {
          ctx.award(80, { type: 'baba-finish', place: player.finishedAt });
          ctx.showToast(`上がり！順位 ${player.finishedAt}`, { duration: 2600 });
        }
      }
      updateHud();
    }

    function executeTurn(player){
      if (state.finished) return;
      const nextIndex = findNextActive((player.id + 1) % players.length);
      const target = players[nextIndex];
      if (!target || target.hand.length === 0) {
        advanceTurn();
        return;
      }
      let drawn;
      if (player.human) {
        // 後続のクリックハンドラで処理するためここでは待機
        return;
      } else {
        const idx = Math.floor(Math.random() * target.hand.length);
        drawn = target.hand.splice(idx, 1)[0];
      }
      if (drawn) {
        player.hand.push(drawn);
        if (drawn.suit === 'joker') {
          state.jokerHolder = player.id;
        }
      }
      removePairs(player);
      removePairs(target, { award: false });
      advanceTurn();
    }

    function advanceTurn(){
      if (checkGameEnd()) return;
      state.current = findNextActive((state.current + 1) % players.length);
      state.turnCount++;
      const current = players[state.current];
      if (current.human) {
        ctx.setStatus(`あなたの番：右隣のカードをクリックしてください。（手札 ${current.hand.length} 枚）`);
      } else {
        ctx.setStatus(`${current.name} の番`);
      }
      render();
      if (!current.human) {
        setTimeout(() => {
          executeTurn(current);
        }, 600);
      }
    }

    function checkGameEnd(){
      const active = players.filter(p => p.hand.length > 0);
      if (active.length <= 1) {
        state.finished = true;
        const loser = active[0];
        ctx.showToast(`${loser.name} がジョーカーを持っています。ゲーム終了！`, { duration: 2800 });
        ctx.commitStats({ plays: 1, wins: players[0].finishedAt === 1 ? 1 : 0, score: players[0].finishedAt || players.length, bestMode: 'lower' });
        ctx.setActions([
          { label: '再戦する', variant: 'primary', onClick: () => initGame() },
          { label: 'ゲーム一覧 (B)', variant: 'secondary', hotkey: 'B', onClick: () => ctx.exitToHub() }
        ]);
        updateHud();
        return true;
      }
      return false;
    }

    function render(){
      ring.innerHTML = '';
      const human = players[0];
      const humanTargetIndex = findNextActive((0 + 1) % players.length);
      for (const player of players) {
        const card = document.createElement('div');
        card.className = 'mini-trump-baba-player';
        if (player.id === state.current) card.classList.add('active');
        const name = document.createElement('div');
        name.className = 'name';
        name.textContent = player.name + (player.human ? ' (You)' : '');
        card.appendChild(name);
        const handBox = document.createElement('div');
        handBox.className = 'hand';
        if (player.hand.length === 0) {
          const empty = document.createElement('div');
          empty.className = 'hand-empty';
          empty.textContent = player.finishedAt ? `上がり (${player.finishedAt}位)` : '手札なし';
          handBox.appendChild(empty);
        } else if (player.human) {
          for (const cardInfo of player.hand) {
            const el = ctx.cardUtils.renderCard(cardInfo, { faceUp: true, size: 'tiny' });
            handBox.appendChild(el);
          }
        } else {
          for (let i = 0; i < player.hand.length; i++) {
            const btn = document.createElement('button');
            btn.dataset.targetCard = String(i);
            btn.textContent = '?';
            if (players[state.current].human && player.id === humanTargetIndex) {
              btn.disabled = false;
              btn.addEventListener('click', () => {
                if (state.finished || players[state.current].id !== 0) return;
                if (player.hand.length <= i) return;
                const drawn = player.hand.splice(i, 1)[0];
                human.hand.push(drawn);
                if (drawn.suit === 'joker') state.jokerHolder = 0;
                removePairs(human);
                removePairs(player, { award: false });
                advanceTurn();
              });
            } else {
              btn.disabled = true;
            }
            handBox.appendChild(btn);
          }
        }
        card.appendChild(handBox);
        if (player.finishedAt) {
          const finished = document.createElement('div');
          finished.className = 'mini-trump-finished';
          finished.textContent = `${player.finishedAt} 位確定`;
          card.appendChild(finished);
        }
        ring.appendChild(card);
      }
      updateHud();
    }

    initGame();

    return {
      start(){},
      stop(){},
      destroy(){},
      getScore(){ return players[0].finishedAt || 0; }
    };
  }

  window.registerMiniGame({
    id: 'trump_games',
    name: 'トランプセレクション',
    description: 'トランプゲームハブ（神経衰弱・ブラックジャック・ババ抜き収録）',
    create
  });
})();

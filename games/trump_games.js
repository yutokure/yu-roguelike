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
    { id: 'memory', title: '神経衰弱', titleKey: 'games.memory.title', descriptionKey: 'games.memory.description', icon: '🧠', phase: 1, implemented: true, description: 'ペアを揃える定番記憶ゲーム。' },
    { id: 'blackjack', title: 'ブラックジャック', titleKey: 'games.blackjack.title', descriptionKey: 'games.blackjack.description', icon: '🃏', phase: 1, implemented: true, description: '21を目指してディーラーと勝負。' },
    { id: 'baba', title: 'ババ抜き', titleKey: 'games.baba.title', descriptionKey: 'games.baba.description', icon: '😼', phase: 1, implemented: true, description: 'ジョーカーを最後まで残さないように。' },
    { id: 'klondike', title: 'ソリティア（クロンダイク）', titleKey: 'games.klondike.title', descriptionKey: 'games.klondike.description', icon: '🂮', phase: 2, implemented: true, description: '7列の場札から台札を揃えるソリティア。' },
    { id: 'spider', title: 'スパイダーソリティア', titleKey: 'games.spider.title', descriptionKey: 'games.spider.description', icon: '🕷️', phase: 3, implemented: true, description: '完成した列を確実に作る耐久ソリティア。' },
    { id: 'freecell', title: 'フリーセル', titleKey: 'games.freecell.title', descriptionKey: 'games.freecell.description', icon: '🗄️', phase: 2, implemented: true, description: '4つのセルを駆使するソリティア。' },
    { id: 'hearts', title: 'ハーツ', titleKey: 'games.hearts.title', descriptionKey: 'games.hearts.description', icon: '♥️', phase: 3, implemented: true, description: 'ハートを避けるトリックテイキング。' },
    { id: 'sevens', title: '七並べ', titleKey: 'games.sevens.title', descriptionKey: 'games.sevens.description', icon: '7️⃣', phase: 2, implemented: true, description: '7を基点にカードを並べる。' },
    { id: 'poker', title: 'ポーカー（ドロー）', titleKey: 'games.poker.title', descriptionKey: 'games.poker.description', icon: '♠️', phase: 2, implemented: true, description: '役を完成させて高得点を狙う。' },
    { id: 'jiji', title: 'ジジ抜き', titleKey: 'games.jiji.title', descriptionKey: 'games.jiji.description', icon: '👴', phase: 2, implemented: true, description: 'ジョーカー設定可のババ抜き拡張。' },
    { id: 'daifugo', title: '大富豪', titleKey: 'games.daifugo.title', descriptionKey: 'games.daifugo.description', icon: '👑', phase: 3, implemented: true, description: '革命必至の手札管理ゲーム。' },
    { id: 'pageone', title: 'ページワン', titleKey: 'games.pageone.title', descriptionKey: 'games.pageone.description', icon: '📖', phase: 2, implemented: true, description: 'UNOの祖先とされる定番ゲーム。' }
  ];

  const CARD_BACK_OPTIONS = [
    { id: 'classic', label: 'クラシック', labelKey: 'cardBacks.classic.label', descriptionKey: 'cardBacks.classic.description', description: 'ネイビーの王道パターン', gradient: 'linear-gradient(135deg,#0f172a,#1e40af)', border: 'rgba(37,99,235,0.8)', color: '#93c5fd' },
    { id: 'modern', label: 'モダン', labelKey: 'cardBacks.modern.label', descriptionKey: 'cardBacks.modern.description', description: 'ビビッドなサイバー柄', gradient: 'linear-gradient(135deg,#831843,#ef4444)', border: 'rgba(244,114,182,0.9)', color: '#fecdd3' },
    { id: 'forest', label: 'フォレスト', labelKey: 'cardBacks.forest.label', descriptionKey: 'cardBacks.forest.description', description: '深緑と金のグラデ', gradient: 'linear-gradient(135deg,#134e4a,#0f766e)', border: 'rgba(45,212,191,0.85)', color: '#5eead4' }
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
    .mini-trump-card.interactive:not(.no-hover-raise):hover{transform:translateY(-4px);box-shadow:0 12px 24px rgba(37,99,235,0.32);}
    .mini-trump-card.selected{outline:2px solid #fbbf24;outline-offset:-3px;}
    .mini-trump-klondike{display:flex;flex-direction:column;gap:18px;align-items:center;justify-content:flex-start;padding-top:8px;}
    .mini-trump-klondike-top{display:flex;gap:24px;justify-content:space-between;width:100%;max-width:960px;}
    .mini-trump-klondike-stack{display:flex;flex-direction:column;align-items:center;gap:6px;}
    .mini-trump-klondike-stock{display:flex;gap:12px;}
    .mini-trump-klondike-tableau{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:12px;width:100%;max-width:960px;}
    .mini-trump-pile{width:80px;height:112px;border-radius:10px;border:1px dashed rgba(148,163,184,0.45);position:relative;display:flex;align-items:flex-end;justify-content:center;padding:6px;box-sizing:border-box;transition:border .2s,box-shadow .2s,background .2s;}
    .mini-trump-pile.interactive{cursor:pointer;}
    .mini-trump-pile.empty{background:rgba(15,23,42,0.3);}
    .mini-trump-pile.drop-target{border-color:rgba(74,222,128,0.85);box-shadow:0 0 0 2px rgba(74,222,128,0.35);}
    .mini-trump-klondike-foundations{display:flex;gap:16px;}
    .mini-trump-klondike-foundations .mini-trump-pile{width:78px;}
    .mini-trump-klondike-column{position:relative;min-height:140px;padding:6px;border-radius:10px;border:1px dashed rgba(148,163,184,0.35);background:rgba(15,23,42,0.28);box-sizing:border-box;transition:border .2s,box-shadow .2s;}
    .mini-trump-klondike-column.drop-target{border-color:rgba(74,222,128,0.85);box-shadow:0 0 0 2px rgba(74,222,128,0.35);}
    .mini-trump-klondike-column.empty{background:rgba(15,23,42,0.18);}
    .mini-trump-klondike-column .mini-trump-card{position:absolute;left:50%;transform:translateX(-50%);transition:transform .15s;}
    .mini-trump-klondike-placeholder{font-size:18px;color:rgba(148,163,184,0.8);}
    .mini-trump-klondike-waste{position:absolute;inset:0;}
    .mini-trump-klondike-info{font-size:13px;color:#94a3b8;text-align:center;}
    .mini-trump-spider{display:flex;flex-direction:column;gap:18px;align-items:center;padding-top:8px;}
    .mini-trump-spider-top{display:flex;gap:24px;align-items:flex-start;justify-content:space-between;width:100%;max-width:960px;}
    .mini-trump-spider-stock{display:flex;gap:12px;align-items:flex-start;}
    .mini-trump-spider-columns{display:grid;grid-template-columns:repeat(10,minmax(0,1fr));gap:12px;width:100%;max-width:960px;}
    .mini-trump-spider-column{position:relative;min-height:140px;padding:6px;border-radius:10px;border:1px dashed rgba(148,163,184,0.35);background:rgba(15,23,42,0.28);box-sizing:border-box;transition:border .2s,box-shadow .2s;}
    .mini-trump-spider-column.drop-target{border-color:rgba(74,222,128,0.85);box-shadow:0 0 0 2px rgba(74,222,128,0.35);}
    .mini-trump-spider-column.empty{background:rgba(15,23,42,0.18);}
    .mini-trump-spider-column .mini-trump-card{position:absolute;left:50%;transform:translateX(-50%);transition:transform .15s;}
    .mini-trump-freecell{display:flex;flex-direction:column;gap:18px;align-items:center;padding-top:8px;}
    .mini-trump-freecell-top{display:flex;gap:24px;align-items:flex-start;justify-content:space-between;width:100%;max-width:960px;}
    .mini-trump-freecell-cells,.mini-trump-freecell-foundations{display:flex;gap:12px;}
    .mini-trump-freecell-columns{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:12px;width:100%;max-width:960px;}
    .mini-trump-freecell-column{position:relative;min-height:140px;padding:6px;border-radius:10px;border:1px dashed rgba(148,163,184,0.35);background:rgba(15,23,42,0.28);box-sizing:border-box;transition:border .2s,box-shadow .2s;}
    .mini-trump-freecell-column.drop-target{border-color:rgba(74,222,128,0.85);box-shadow:0 0 0 2px rgba(74,222,128,0.35);}
    .mini-trump-freecell-column.empty{background:rgba(15,23,42,0.18);}
    .mini-trump-freecell-column .mini-trump-card{position:absolute;left:50%;transform:translateX(-50%);transition:transform .12s;}
    .mini-trump-table-game{display:flex;flex-direction:column;gap:18px;align-items:center;padding:12px 0;width:100%;}
    .mini-trump-table-layout{display:grid;gap:18px;grid-template-columns:repeat(2,minmax(0,1fr));max-width:780px;width:100%;}
    .mini-trump-table-players{display:flex;flex-direction:column;gap:12px;}
    .mini-trump-table-player{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:12px;background:rgba(15,23,42,0.35);border:1px solid rgba(148,163,184,0.18);}
    .mini-trump-table-player.active{border-color:rgba(96,165,250,0.7);box-shadow:0 0 0 2px rgba(37,99,235,0.28);}
    .mini-trump-table-player .name{font-weight:600;color:#e2e8f0;}
    .mini-trump-table-player .meta{margin-left:auto;font-size:12px;color:#94a3b8;display:flex;gap:8px;align-items:center;}
    .mini-trump-table-board{background:rgba(15,23,42,0.32);border:1px solid rgba(148,163,184,0.2);border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:14px;}
    .mini-trump-trick{display:flex;justify-content:center;gap:18px;align-items:center;flex-wrap:wrap;min-height:120px;}
    .mini-trump-trick-card{display:flex;flex-direction:column;align-items:center;gap:6px;font-size:12px;color:#94a3b8;}
    .mini-trump-hand-row{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;}
    .mini-trump-hand-row button{border:none;border-radius:8px;padding:6px 10px;background:rgba(148,163,184,0.12);color:#e2e8f0;font-weight:600;cursor:pointer;transition:background .2s,transform .15s;}
    .mini-trump-hand-row button:hover{background:rgba(148,163,184,0.22);transform:translateY(-2px);}
    .mini-trump-hand-row button.disabled{opacity:0.4;cursor:not-allowed;transform:none;}
    .mini-trump-table-summary{font-size:13px;color:#cbd5f5;display:flex;flex-direction:column;gap:6px;}
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
    .mini-trump-poker{display:flex;flex-direction:column;align-items:center;gap:18px;padding-top:8px;width:100%;}
    .mini-trump-poker-board{display:flex;flex-direction:column;gap:16px;width:100%;max-width:860px;}
    .mini-trump-poker-opponents{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;}
    .mini-trump-poker-opponent{background:rgba(15,23,42,0.42);border:1px solid rgba(148,163,184,0.18);border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:6px;min-height:120px;}
    .mini-trump-poker-opponent.active{border-color:rgba(96,165,250,0.65);box-shadow:0 0 0 2px rgba(37,99,235,0.32);}
    .mini-trump-poker-opponent .name{font-weight:600;color:#e2e8f0;}
    .mini-trump-poker-opponent .cards{display:flex;gap:6px;flex-wrap:wrap;}
    .mini-trump-poker-opponent .cards .mini-trump-card{width:48px;height:68px;}
    .mini-trump-poker-player{background:rgba(15,23,42,0.45);border:1px solid rgba(148,163,184,0.2);border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:12px;}
    .mini-trump-poker-player h3{margin:0;font-size:15px;color:#e2e8f0;}
    .mini-trump-poker-hand{display:flex;gap:12px;flex-wrap:wrap;justify-content:center;}
    .mini-trump-poker-card{position:relative;cursor:pointer;}
    .mini-trump-poker-card.hold::after{content:'HOLD';position:absolute;bottom:6px;left:50%;transform:translateX(-50%);font-size:11px;background:rgba(56,189,248,0.85);color:#0f172a;padding:2px 6px;border-radius:999px;font-weight:700;letter-spacing:0.04em;}
    .mini-trump-poker-card.locked{cursor:default;}
    .mini-trump-poker-summary{font-size:13px;color:#94a3b8;display:flex;flex-direction:column;gap:4px;}
    .mini-trump-jiji-table{display:flex;flex-direction:column;gap:18px;align-items:center;}
    .mini-trump-jiji-center{display:flex;gap:18px;align-items:flex-start;justify-content:center;flex-wrap:wrap;}
    .mini-trump-jiji-table-card{background:rgba(15,23,42,0.42);border:1px solid rgba(148,163,184,0.25);border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:8px;align-items:center;min-width:160px;}
    .mini-trump-jiji-table-card.swap-ready{border-color:rgba(248,250,252,0.65);box-shadow:0 0 0 2px rgba(248,250,252,0.25);}
    .mini-trump-jiji-table-card button{border:none;border-radius:8px;background:rgba(37,99,235,0.28);color:#e0f2fe;padding:6px 12px;cursor:pointer;font-weight:600;}
    .mini-trump-jiji-table-card button:disabled{opacity:0.5;cursor:not-allowed;}
    .mini-trump-jiji-table-card .label{font-size:13px;color:#e2e8f0;font-weight:600;}
    .mini-trump-jiji-table-card .meta{font-size:12px;color:#94a3b8;}
    .mini-trump-daifugo{display:flex;flex-direction:column;gap:18px;align-items:center;width:100%;padding-top:8px;}
    .mini-trump-daifugo-board{width:100%;max-width:880px;display:flex;flex-direction:column;gap:16px;}
    .mini-trump-daifugo-players{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;}
    .mini-trump-daifugo-player{background:rgba(15,23,42,0.42);border:1px solid rgba(148,163,184,0.2);border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:6px;}
    .mini-trump-daifugo-player.active{border-color:rgba(56,189,248,0.8);box-shadow:0 0 0 2px rgba(56,189,248,0.35);}
    .mini-trump-daifugo-player .name{font-weight:600;color:#e2e8f0;}
    .mini-trump-daifugo-player .meta{font-size:12px;color:#94a3b8;}
    .mini-trump-daifugo-center{display:flex;gap:16px;align-items:center;justify-content:center;flex-wrap:wrap;}
    .mini-trump-daifugo-center .pile{display:flex;flex-direction:column;align-items:center;gap:6px;background:rgba(15,23,42,0.38);border:1px dashed rgba(148,163,184,0.28);border-radius:12px;padding:12px;min-width:160px;}
    .mini-trump-daifugo-center .pile h4{margin:0;font-size:13px;color:#e2e8f0;}
    .mini-trump-daifugo-hand{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;}
    .mini-trump-daifugo-hand button{border:none;border-radius:8px;background:rgba(59,130,246,0.24);color:#e0f2fe;padding:8px 12px;font-weight:600;cursor:pointer;}
    .mini-trump-daifugo-hand button.disabled{opacity:0.4;cursor:not-allowed;}
    .mini-trump-daifugo-history{font-size:12px;color:#94a3b8;display:flex;flex-direction:column;gap:4px;}
    .mini-trump-pageone{display:flex;flex-direction:column;gap:16px;align-items:center;width:100%;padding-top:8px;}
    .mini-trump-pageone-board{width:100%;max-width:840px;display:flex;flex-direction:column;gap:16px;}
    .mini-trump-pageone-opponents{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;}
    .mini-trump-pageone-opponent{background:rgba(15,23,42,0.4);border:1px solid rgba(148,163,184,0.18);border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:6px;}
    .mini-trump-pageone-opponent.active{border-color:rgba(37,99,235,0.62);box-shadow:0 0 0 2px rgba(37,99,235,0.32);}
    .mini-trump-pageone-opponent .name{font-weight:600;color:#e2e8f0;}
    .mini-trump-pageone-opponent .meta{font-size:12px;color:#94a3b8;}
    .mini-trump-pageone-center{display:flex;gap:18px;align-items:center;justify-content:center;flex-wrap:wrap;}
    .mini-trump-pageone-center .deck,.mini-trump-pageone-center .discard{background:rgba(15,23,42,0.38);border:1px solid rgba(148,163,184,0.22);border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:6px;align-items:center;min-width:150px;}
    .mini-trump-pageone-center h4{margin:0;font-size:13px;color:#e2e8f0;}
    .mini-trump-pageone-hand{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;}
    .mini-trump-pageone-hand button{border:none;border-radius:8px;background:rgba(59,130,246,0.25);color:#e2e8f0;padding:8px 12px;font-weight:600;cursor:pointer;}
    .mini-trump-pageone-hand button.disabled{opacity:0.4;cursor:not-allowed;}
    .mini-trump-pageone-status{font-size:12px;color:#94a3b8;display:flex;flex-direction:column;gap:4px;text-align:center;}
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
    if (opts.hoverRaise === false) el.classList.add('no-hover-raise');
    if (card && card.id) {
      el.dataset.cardId = card.id;
    } else if (opts.key) {
      el.dataset.cardId = opts.key;
    }
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

  function createCardAnimator(root){
    let lastRects = new Map();

    function capture(){
      if (!root || !root.isConnected) return;
      const next = new Map();
      const elements = root.querySelectorAll('[data-card-id]');
      elements.forEach(el => {
        const id = el.dataset.cardId;
        if (!id) return;
        const rect = el.getBoundingClientRect();
        next.set(id, rect);
      });
      lastRects = next;
    }

    function animate(){
      if (!root || !root.isConnected) {
        lastRects = new Map();
        return;
      }
      const elements = root.querySelectorAll('[data-card-id]');
      const next = new Map();
      elements.forEach(el => {
        const id = el.dataset.cardId;
        if (!id) return;
        const rect = el.getBoundingClientRect();
        const prev = lastRects.get(id);
        if (prev) {
          const dx = prev.left - rect.left;
          const dy = prev.top - rect.top;
          const scaleX = rect.width ? prev.width / rect.width : 1;
          const scaleY = rect.height ? prev.height / rect.height : 1;
          const distance = Math.hypot(dx, dy);
          const scaleDiff = Math.abs(scaleX - 1) + Math.abs(scaleY - 1);
          if (distance > 0.5 || scaleDiff > 0.02) {
            el.animate([
              { transform: `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})`, opacity: 0.88 },
              { transform: 'translate(0,0) scale(1,1)', opacity: 1 }
            ], { duration: 320, easing: 'ease-out' });
          }
        } else {
          el.animate([
            { transform: 'scale(0.8)', opacity: 0 },
            { transform: 'scale(1)', opacity: 1 }
          ], { duration: 220, easing: 'ease-out' });
        }
        next.set(id, rect);
      });
      lastRects = next;
    }

    function reset(){
      lastRects = new Map();
    }

    return { capture, animate, reset };
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

    const localization = opts?.localization || (typeof window !== 'undefined' && typeof window.createMiniGameLocalization === 'function'
      ? window.createMiniGameLocalization({ id: 'trump_games' })
      : null);
    const text = (key, fallback, params) => {
      if (localization && typeof localization.t === 'function') {
        try { return localization.t(key, fallback, params); } catch (error) {
          console.warn('[Mini Trump] localization error', error);
        }
      }
      if (typeof fallback === 'function') {
        try { return fallback(params || {}); } catch { return ''; }
      }
      return fallback ?? '';
    };
    const formatNumber = (value, options) => {
      if (localization && typeof localization.formatNumber === 'function') {
        try { return localization.formatNumber(value, options); } catch {}
      }
      if (typeof Intl !== 'undefined' && typeof Intl.NumberFormat === 'function') {
        try { return new Intl.NumberFormat(undefined, options).format(value); } catch {}
      }
      if (value != null && typeof value.toLocaleString === 'function') {
        try { return value.toLocaleString(undefined, options); } catch {}
      }
      return String(value ?? '');
    };
    let detachLocale = null;

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
      destroyed: false,
      titleMeta: null,
      statusMeta: null
    };

    const wrapper = document.createElement('div');
    wrapper.className = 'mini-trump-wrapper mini-trump-panel';
    wrapper.dataset.cardBack = state.settings.cardBack || DEFAULT_SETTINGS.cardBack;

    const nav = document.createElement('nav');
    nav.className = 'mini-trump-nav mini-trump-panel';

    const navHeader = document.createElement('header');

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

    const statusBox = document.createElement('div');
    statusBox.className = 'mini-trump-header-status';

    const statusLine = document.createElement('div');
    statusLine.className = 'mini-trump-status-line';

    const scoreLine = document.createElement('div');
    scoreLine.className = 'mini-trump-score';
    scoreLine.textContent = '';

    statusBox.appendChild(statusLine);
    statusBox.appendChild(scoreLine);

    const headerControls = document.createElement('div');
    headerControls.className = 'mini-trump-header-controls';

    const difficultyBadge = document.createElement('span');
    difficultyBadge.className = 'mini-trump-difficulty';

    const settingsButton = document.createElement('button');
    settingsButton.type = 'button';
    settingsButton.className = 'mini-trump-header-settings';
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
    const placeholderPrimary = document.createElement('div');
    placeholderPrimary.className = 'mini-trump-placeholder-primary';
    const placeholderSecondary = document.createElement('div');
    placeholderSecondary.className = 'mini-trump-placeholder-secondary';
    placeholderSecondary.style.fontSize = '12px';
    placeholderSecondary.style.color = '#94a3b8';
    placeholder.appendChild(placeholderPrimary);
    placeholder.appendChild(placeholderSecondary);
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

    updateHeaderLocalization();
    updatePlaceholderLocalization();
    setTitle(text('layout.title', 'トランプセレクション'), { key: 'layout.title', fallback: 'トランプセレクション' });
    setStatus(text('status.selectGame', 'ゲームを選択してください。'), { key: 'status.selectGame', fallback: 'ゲームを選択してください。' });

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
      heading.textContent = text('settings.heading', '設定');
      panel.appendChild(heading);

      const backGroup = document.createElement('div');
      backGroup.className = 'mini-trump-settings-group';
      const backLabel = document.createElement('span');
      backLabel.textContent = text('settings.cardBack', 'カード裏面テーマ');
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
        name.textContent = text(opt.labelKey, opt.label);
        name.style.fontSize = '13px';
        name.style.fontWeight = '600';
        const preview = document.createElement('div');
        preview.className = 'mini-trump-settings-preview';
        preview.style.background = opt.gradient;
        preview.style.border = `1px solid ${opt.border}`;
        preview.style.color = opt.color;
        const desc = document.createElement('small');
        desc.textContent = text(opt.descriptionKey, opt.description);

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
      toggleText.textContent = text('settings.autoFlip', '神経衰弱で不一致カードを自動で裏返す');
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

    function setStatus(textValue, metadata){
      const resolved = textValue == null ? '' : String(textValue);
      statusLine.textContent = resolved;
      if (metadata === null) return;
      if (metadata && typeof metadata === 'object') {
        state.statusMeta = {
          key: metadata.key || null,
          params: metadata.params || null,
          fallback: metadata.fallback != null ? metadata.fallback : resolved
        };
      } else {
        state.statusMeta = { key: null, params: null, fallback: resolved };
      }
    }

    function setScore(text){
      scoreLine.textContent = text || '';
    }

    function setTitle(textValue, metadata){
      const resolved = textValue == null ? '' : String(textValue);
      title.textContent = resolved;
      if (metadata === null) return;
      if (metadata && typeof metadata === 'object') {
        state.titleMeta = {
          key: metadata.key || null,
          params: metadata.params || null,
          fallback: metadata.fallback != null ? metadata.fallback : resolved
        };
      } else {
        state.titleMeta = { key: null, params: null, fallback: resolved };
      }
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
      setTitle(text('layout.title', 'トランプセレクション'), { key: 'layout.title', fallback: 'トランプセレクション' });
      setStatus(text('status.selectGame', 'ゲームを選択してください。'), { key: 'status.selectGame', fallback: 'ゲームを選択してください。' });
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
        const exitLabel = text('actions.returnToHub', 'ゲームを終了');
        btn.textContent = exitLabel;
        btn.addEventListener('click', returnToSelection);
        actionsBar.appendChild(btn);
        state.hotkeys.set('ESCAPE', { trigger: () => btn.click(), label: exitLabel });
        state.hotkeys.set('ESC', { trigger: () => btn.click(), label: exitLabel });
        return;
      }
      for (const entry of state.actions) {
        const btn = document.createElement('button');
        const labelText = entry.labelKey ? text(entry.labelKey, entry.label || '') : (entry.label != null ? entry.label : text('actions.default', 'Action'));
        btn.textContent = labelText;
        if (entry.variant === 'primary') btn.classList.add('primary');
        if (entry.variant === 'secondary') btn.classList.add('secondary');
        btn.disabled = !!entry.disabled;
        if (typeof entry.onClick === 'function') {
          btn.addEventListener('click', entry.onClick);
        }
        actionsBar.appendChild(btn);
        if (entry.hotkey) {
          state.hotkeys.set(entry.hotkey.toUpperCase(), { trigger: () => btn.click(), label: labelText });
        }
      }
    }

    function getLocalizedGameTitle(def){
      if (!def) return '';
      return text(def.titleKey, def.title);
    }

    function getLocalizedGameDescription(def){
      if (!def) return '';
      return text(def.descriptionKey, def.description);
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
        const titleText = getLocalizedGameTitle(def);
        label.textContent = titleText;
        button.appendChild(icon);
        button.appendChild(label);
        if (!def.implemented) {
          button.classList.add('disabled');
          const badge = document.createElement('span');
          badge.className = 'meta';
          badge.textContent = text('list.badge.comingSoon', '準備中');
          button.appendChild(badge);
        } else {
          const stats = state.stats[def.id];
          if (stats && stats.bestScore != null) {
            const badge = document.createElement('span');
            badge.className = 'meta';
            const bestScore = formatNumber(stats.bestScore);
            badge.textContent = text('list.badge.bestScore', () => `Best ${bestScore}`, { score: bestScore, rawScore: stats.bestScore });
            button.appendChild(badge);
          }
        }
        if (state.selectedGameId === def.id) {
          button.classList.add('selected');
        }
        button.addEventListener('click', () => {
          if (!def.implemented) {
            setTitle(titleText, { key: def.titleKey, fallback: def.title });
            board.innerHTML = '';
            const msg = document.createElement('div');
            msg.className = 'mini-trump-placeholder';
            const titleEl = document.createElement('div');
            titleEl.style.fontSize = '18px';
            titleEl.textContent = titleText;
            const descWrap = document.createElement('div');
            descWrap.style.maxWidth = '420px';
            descWrap.style.fontSize = '13px';
            descWrap.style.color = '#94a3b8';
            descWrap.style.display = 'flex';
            descWrap.style.flexDirection = 'column';
            descWrap.style.gap = '4px';
            const descEl = document.createElement('div');
            descEl.textContent = getLocalizedGameDescription(def);
            const phaseEl = document.createElement('div');
            phaseEl.textContent = text('list.unimplemented.phase', () => `Phase ${def.phase} で実装予定です。`, { phase: def.phase });
            descWrap.appendChild(descEl);
            descWrap.appendChild(phaseEl);
            msg.appendChild(titleEl);
            msg.appendChild(descWrap);
            board.appendChild(msg);
            setStatus(text('status.comingSoon', '開発中のゲームです。今後のアップデートをお待ちください。'), { key: 'status.comingSoon', fallback: '開発中のゲームです。今後のアップデートをお待ちください。' });
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

      const localizedTitle = getLocalizedGameTitle(def);
      setTitle(localizedTitle, { key: def.titleKey, fallback: def.title });
      renderGameList();

      let runtime;
      try {
        if (def.id === 'klondike') runtime = createKlondikeGame(gameRoot, context);
        else if (def.id === 'spider') runtime = createSpiderGame(gameRoot, context);
        else if (def.id === 'freecell') runtime = createFreecellGame(gameRoot, context);
        else if (def.id === 'hearts') runtime = createHeartsGame(gameRoot, context);
        else if (def.id === 'sevens') runtime = createSevensGame(gameRoot, context);
        else if (def.id === 'poker') runtime = createPokerGame(gameRoot, context);
        else if (def.id === 'jiji') runtime = createJijiGame(gameRoot, context);
        else if (def.id === 'daifugo') runtime = createDaifugoGame(gameRoot, context);
        else if (def.id === 'pageone') runtime = createPageOneGame(gameRoot, context);
        else if (def.id === 'memory') runtime = createMemoryGame(gameRoot, context);
        else if (def.id === 'blackjack') runtime = createBlackjackGame(gameRoot, context);
        else if (def.id === 'baba') runtime = createBabaGame(gameRoot, context);
        else runtime = createPlaceholderGame(gameRoot, context, def);
      } catch (err) {
        console.error('Trump game init failed', err);
        showToast(text('errors.initToast', 'ゲームの初期化に失敗しました。'), { type: 'warn' });
        const fallback = document.createElement('div');
        fallback.className = 'mini-trump-placeholder';
        fallback.textContent = text('errors.initFallback', '初期化に失敗しました。別のゲームを試してください。');
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
      const titleEl = document.createElement('div');
      titleEl.style.fontSize = '18px';
      titleEl.textContent = getLocalizedGameTitle(def);
      const descWrap = document.createElement('div');
      descWrap.style.fontSize = '14px';
      descWrap.style.color = '#94a3b8';
      descWrap.style.maxWidth = '420px';
      descWrap.style.display = 'flex';
      descWrap.style.flexDirection = 'column';
      descWrap.style.gap = '6px';
      const descEl = document.createElement('div');
      descEl.textContent = getLocalizedGameDescription(def);
      const statusEl = document.createElement('div');
      statusEl.textContent = text('list.unimplemented.status', '実装準備中です。');
      descWrap.appendChild(descEl);
      descWrap.appendChild(statusEl);
      msg.appendChild(titleEl);
      msg.appendChild(descWrap);
      container.appendChild(msg);
      ctx.setStatus(text('status.devPlaceholder', '現在は開発中です。'), { key: 'status.devPlaceholder', fallback: '現在は開発中です。' });
      ctx.setScore('');
      ctx.setActions([
        { label: text('actions.backToList', '一覧に戻る'), labelKey: 'actions.backToList', variant: 'secondary', onClick: () => ctx.exitToHub() }
      ]);
      return {
        start(){},
        stop(){},
        destroy(){ container.innerHTML=''; }
      };
    }

    function updateDifficultyBadge(){
      const multiplierTxt = state.multiplier.toFixed(1).replace(/\.0$/, '');
      difficultyBadge.textContent = text('layout.difficulty', () => `難易度 ${state.difficulty} ×${multiplierTxt}`, {
        difficulty: state.difficulty,
        multiplier: multiplierTxt
      });
    }

    function updateHeaderLocalization(){
      navHeader.textContent = text('layout.navHeader', 'トランプゲーム');
      updateDifficultyBadge();
      const settingsLabel = text('layout.settings', '設定');
      settingsButton.setAttribute('aria-label', settingsLabel);
      settingsButton.title = settingsLabel;
    }

    function updatePlaceholderLocalization(){
      placeholderPrimary.textContent = text('placeholder.primary', '左のリストからゲームを選んでください。');
      const separator = text('placeholder.separator', ' / ');
      const phaseGames = GAME_DEFS.filter((def) => def.phase === 1 && def.implemented).map((def) => getLocalizedGameTitle(def));
      const joined = phaseGames.filter(Boolean).join(separator);
      placeholderSecondary.textContent = text('placeholder.phaseInfo', () => {
        const summary = joined || '神経衰弱 / ブラックジャック / ババ抜き';
        return `Phase 1: ${summary}`;
      }, { phase: 1, games: joined });
    }

    function applyStoredTitle(){
      if (!state.titleMeta) return;
      const meta = state.titleMeta;
      if (meta.key) {
        title.textContent = text(meta.key, meta.fallback, meta.params);
      } else {
        title.textContent = meta.fallback ?? '';
      }
    }

    function applyStoredStatus(){
      if (!state.statusMeta) return;
      const meta = state.statusMeta;
      if (meta.key) {
        statusLine.textContent = text(meta.key, meta.fallback, meta.params);
      } else {
        statusLine.textContent = meta.fallback ?? '';
      }
    }

    function updateLocalizedUi(){
      updateHeaderLocalization();
      updatePlaceholderLocalization();
      renderGameList();
      applyStoredTitle();
      applyStoredStatus();
      if (actionsBar.children.length || (state.actions && state.actions.length)) {
        setActions(state.actions && state.actions.length ? state.actions : []);
      }
      if (settingsPanelElement) {
        closeSettingsPanel();
      }
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

    if (!detachLocale && localization && typeof localization.onChange === 'function') {
      detachLocale = localization.onChange(() => {
        updateLocalizedUi();
      });
    }

    if (localization && typeof localization.getLocale === 'function') {
      // Ensure localization-dependent UI is consistent even if locale was restored before init
      updateLocalizedUi();
    }

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
        if (detachLocale) {
          try { detachLocale(); } catch {}
          detachLocale = null;
        }
        root.removeChild(wrapper);
      },
      getScore(){
        try { return state.currentRuntime && state.currentRuntime.getScore ? state.currentRuntime.getScore() : 0; } catch{ return 0; }
      }
    };
  }

  function createKlondikeGame(container, ctx){
    const foundationDefs = SUITS.filter(s => s.id !== 'joker').map(s => ({ suit: s.id, symbol: s.symbol, label: s.label }));
    const foundationIndex = new Map(foundationDefs.map((def, idx) => [def.suit, idx]));

    const state = {
      stock: [],
      waste: [],
      tableaus: [],
      foundations: [],
      selected: null,
      moves: 0,
      recycles: 0,
      finished: false
    };

    const root = document.createElement('div');
    root.className = 'mini-trump-klondike';

    const topRow = document.createElement('div');
    topRow.className = 'mini-trump-klondike-top';

    const stockGroup = document.createElement('div');
    stockGroup.className = 'mini-trump-klondike-stock';

    const stockStack = createStack('山札', 'stock');
    stockStack.pile.classList.add('interactive');
    stockStack.pile.addEventListener('click', () => drawFromStock());

    const wasteStack = createStack('捨て札', 'waste');
    wasteStack.pile.addEventListener('click', () => handleWasteClick());

    stockGroup.appendChild(stockStack.wrapper);
    stockGroup.appendChild(wasteStack.wrapper);

    const foundationGroup = document.createElement('div');
    foundationGroup.className = 'mini-trump-klondike-foundations';
    const foundationStacks = [];
    foundationDefs.forEach((def, idx) => {
      const stack = createStack(`${def.symbol} 台札`, 'foundation');
      stack.pile.addEventListener('click', () => handleFoundationClick(idx));
      foundationGroup.appendChild(stack.wrapper);
      foundationStacks.push(stack);
    });

    topRow.appendChild(stockGroup);
    topRow.appendChild(foundationGroup);

    const tableauRow = document.createElement('div');
    tableauRow.className = 'mini-trump-klondike-tableau';
    const columnEls = [];
    for (let i = 0; i < 7; i++) {
      const col = document.createElement('div');
      col.className = 'mini-trump-klondike-column empty';
      col.dataset.column = String(i);
      col.addEventListener('click', (ev) => {
        if (ev.target !== col) return;
        if (state.selected) {
          if (!moveSelectedToTableau(i)) {
            ctx.showToast('その列には移動できません。', { type: 'warn', duration: 1500 });
          }
        }
      });
      columnEls.push(col);
      tableauRow.appendChild(col);
    }

    const info = document.createElement('div');
    info.className = 'mini-trump-klondike-info';
    info.textContent = '山札をめくるか、場札を選択して移動しましょう。';

    root.appendChild(topRow);
    root.appendChild(tableauRow);
    root.appendChild(info);

    container.innerHTML = '';
    container.appendChild(root);
    const animator = createCardAnimator(root);

    function createStack(labelText, pileClass){
      const wrapper = document.createElement('div');
      wrapper.className = 'mini-trump-klondike-stack';
      const pile = document.createElement('div');
      pile.className = `mini-trump-pile ${pileClass || ''}`.trim();
      const label = document.createElement('div');
      label.className = 'mini-trump-meta';
      label.textContent = labelText;
      wrapper.appendChild(pile);
      wrapper.appendChild(label);
      return { wrapper, pile, label };
    }

    function restart(){
      const deck = ctx.cardUtils.createDeck();
      ctx.cardUtils.shuffle(deck);
      state.tableaus = [];
      for (let col = 0; col < 7; col++) {
        const column = [];
        for (let depth = 0; depth <= col; depth++) {
          const card = deck.pop();
          column.push({ card, faceUp: depth === col });
        }
        state.tableaus.push(column);
      }
      state.stock = deck;
      state.waste = [];
      state.foundations = foundationDefs.map(def => ({ suit: def.suit, symbol: def.symbol, label: def.label, cards: [] }));
      state.selected = null;
      state.moves = 0;
      state.recycles = 0;
      state.finished = false;
      ctx.commitStats({ plays: 1 });
      setDefaultActions();
      render();
      ctx.showToast('新しい配置でゲームを開始しました。', { duration: 1600 });
    }

    function setDefaultActions(){
      ctx.setActions([
        { label: '山札をめくる (D)', variant: 'primary', hotkey: 'D', onClick: () => drawFromStock() },
        { label: '自動で台札へ (A)', variant: 'secondary', hotkey: 'A', onClick: () => autoMoveToFoundation() },
        { label: 'リスタート (R)', variant: 'secondary', hotkey: 'R', onClick: () => restart() },
        { label: 'ゲーム一覧 (B)', variant: 'secondary', hotkey: 'B', onClick: () => ctx.exitToHub() }
      ]);
    }

    function drawFromStock(){
      if (state.finished) return;
      if (state.stock.length) {
        const card = state.stock.pop();
        state.waste.push({ card, faceUp: true });
        state.moves++;
        state.selected = null;
        ctx.award(1, { type: 'klondike-stock' });
        ctx.playClick();
        render();
        return;
      }
      if (!state.waste.length) {
        ctx.showToast('山札も捨て札も空です。', { type: 'warn', duration: 1500 });
        return;
      }
      state.stock = state.waste.map(entry => entry.card).reverse();
      state.waste = [];
      state.selected = null;
      state.recycles++;
      ctx.showToast('捨て札を山札に戻しました。', { duration: 1600 });
      ctx.playClick();
      render();
    }

    function handleWasteClick(){
      if (!state.waste.length) return;
      if (state.selected && state.selected.type === 'waste') {
        state.selected = null;
      } else {
        state.selected = { type: 'waste' };
      }
      render();
    }

    function handleWasteDoubleClick(){
      if (!state.waste.length || state.finished) return;
      const source = { type: 'waste' };
      if (moveStackToFoundationFrom(source)) {
        applyPostMove(source);
      } else {
        ctx.showToast('台札に置ける場所がありません。', { type: 'warn', duration: 1500 });
      }
    }

    function handleFoundationClick(index){
      if (state.finished) return;
      if (state.selected) {
        if (moveSelectedToFoundation(index)) {
          return;
        }
      }
      const pile = state.foundations[index];
      if (!pile.cards.length) return;
      if (state.selected && state.selected.type === 'foundation' && state.selected.index === index) {
        state.selected = null;
      } else {
        state.selected = { type: 'foundation', index };
      }
      render();
    }

    function handleTableauCardClick(columnIndex, cardIndex){
      if (state.finished) return;
      const column = state.tableaus[columnIndex];
      if (!column) return;
      const entry = column[cardIndex];
      if (!entry) return;
      const fromSameColumn = state.selected && state.selected.type === 'tableau' && state.selected.column === columnIndex;
      if (state.selected && !fromSameColumn) {
        const moved = moveSelectedToTableau(columnIndex);
        if (moved) return;
        ctx.showToast('その列には移動できません。', { type: 'warn', duration: 1500 });
        return;
      }
      if (!entry.faceUp) {
        if (cardIndex === column.length - 1) {
          entry.faceUp = true;
          ctx.playClick();
          render();
        } else {
          ctx.showToast('このカードはまだ表にできません。', { type: 'warn', duration: 1500 });
        }
        return;
      }
      if (state.selected && state.selected.type === 'tableau' && state.selected.column === columnIndex && state.selected.index === cardIndex) {
        state.selected = null;
      } else {
        const tail = column.slice(cardIndex);
        if (tail.some(item => !item.faceUp)) {
          ctx.showToast('裏向きのカードは移動できません。', { type: 'warn', duration: 1500 });
          return;
        }
        state.selected = { type: 'tableau', column: columnIndex, index: cardIndex };
      }
      render();
    }

    function handleTableauDoubleClick(columnIndex, cardIndex){
      if (state.finished) return;
      const column = state.tableaus[columnIndex];
      if (!column || !column.length) return;
      if (cardIndex !== column.length - 1) return;
      const entry = column[cardIndex];
      if (!entry || !entry.faceUp) return;
      const source = { type: 'tableau', column: columnIndex, index: cardIndex };
      if (moveStackToFoundationFrom(source)) {
        applyPostMove(source);
      } else {
        state.selected = { type: 'tableau', column: columnIndex, index: cardIndex };
        render();
      }
    }

    function moveSelectedToFoundation(index){
      if (!state.selected) return false;
      const source = state.selected;
      const moved = moveStackToFoundationFrom(source, index);
      if (!moved) {
        ctx.showToast('そのカードは台札に置けません。', { type: 'warn', duration: 1500 });
        return false;
      }
      applyPostMove(source);
      return true;
    }

    function moveSelectedToTableau(columnIndex){
      if (!state.selected) return false;
      const source = state.selected;
      if (source.type === 'tableau' && source.column === columnIndex) {
        state.selected = null;
        render();
        return true;
      }
      const moved = moveStackToTableauFrom(source, columnIndex);
      if (!moved) return false;
      applyPostMove(source);
      return true;
    }

    function moveStackToFoundationFrom(source, forcedIndex){
      const stack = peekStack(source);
      if (stack.length !== 1) return false;
      const entry = stack[0];
      const card = entry.card;
      if (!card) return false;
      const targetIndex = typeof forcedIndex === 'number' ? forcedIndex : foundationIndex.get(card.suit);
      if (targetIndex == null) return false;
      const target = state.foundations[targetIndex];
      if (!target) return false;
      if (!canPlaceOnFoundation(card, target)) return false;
      const removed = takeStack(source);
      target.cards.push(removed[0].card);
      state.moves++;
      ctx.award(1, { type: 'klondike-move', to: 'foundation', suit: target.suit });
      if (target.cards.length === 13) {
        ctx.award(25, { type: 'klondike-foundation', suit: target.suit });
        ctx.showToast(`${target.label}の台札を完成！`, { duration: 2000 });
      }
      return true;
    }

    function moveStackToTableauFrom(source, columnIndex){
      const stack = peekStack(source);
      if (!stack.length) return false;
      const column = state.tableaus[columnIndex];
      if (!column) return false;
      if (!canPlaceStackOnTableau(stack, column)) return false;
      const removed = takeStack(source);
      removed.forEach(entry => {
        column.push({ card: entry.card, faceUp: true });
      });
      state.moves++;
      ctx.award(1, { type: 'klondike-move', to: 'tableau', column: columnIndex });
      return true;
    }

    function peekStack(source){
      if (!source) return [];
      if (source.type === 'waste') {
        if (!state.waste.length) return [];
        return [state.waste[state.waste.length - 1]];
      }
      if (source.type === 'tableau') {
        const column = state.tableaus[source.column];
        if (!column) return [];
        return column.slice(source.index);
      }
      if (source.type === 'foundation') {
        const pile = state.foundations[source.index];
        if (!pile || !pile.cards.length) return [];
        return [{ card: pile.cards[pile.cards.length - 1], faceUp: true }];
      }
      return [];
    }

    function takeStack(source){
      if (!source) return [];
      if (source.type === 'waste') {
        if (!state.waste.length) return [];
        return state.waste.splice(state.waste.length - 1, 1);
      }
      if (source.type === 'tableau') {
        const column = state.tableaus[source.column];
        if (!column) return [];
        return column.splice(source.index);
      }
      if (source.type === 'foundation') {
        const pile = state.foundations[source.index];
        if (!pile || !pile.cards.length) return [];
        const card = pile.cards.pop();
        return [{ card, faceUp: true }];
      }
      return [];
    }

    function canPlaceOnFoundation(card, target){
      if (!card || !target) return false;
      if (card.suit !== target.suit) return false;
      const needed = target.cards.length + 1;
      return ctx.cardUtils.cardValue(card) === needed;
    }

    function canPlaceStackOnTableau(stack, column){
      if (!stack.length) return false;
      const lead = stack[0];
      if (!lead.faceUp) return false;
      const leadCard = lead.card;
      if (!leadCard) return false;
      if (!column.length) {
        return ctx.cardUtils.cardValue(leadCard) === 13;
      }
      const target = column[column.length - 1];
      if (!target.faceUp) return false;
      const targetVal = ctx.cardUtils.cardValue(target.card);
      const leadVal = ctx.cardUtils.cardValue(leadCard);
      if (target.card.color === leadCard.color) return false;
      return targetVal === leadVal + 1;
    }

    function autoMoveToFoundation(){
      if (state.finished) return;
      let moved = false;
      let guard = 0;
      while (guard < 64) {
        guard++;
        let source = null;
        if (state.waste.length) {
          const topWaste = state.waste[state.waste.length - 1];
          const idx = foundationIndex.get(topWaste.card.suit);
          if (idx != null && canPlaceOnFoundation(topWaste.card, state.foundations[idx])) {
            source = { type: 'waste' };
          }
        }
        if (!source) {
          for (let i = 0; i < state.tableaus.length; i++) {
            const column = state.tableaus[i];
            if (!column.length) continue;
            const top = column[column.length - 1];
            if (!top.faceUp) continue;
            const idx = foundationIndex.get(top.card.suit);
            if (idx != null && canPlaceOnFoundation(top.card, state.foundations[idx])) {
              source = { type: 'tableau', column: i, index: column.length - 1 };
              break;
            }
          }
        }
        if (!source) break;
        if (!moveStackToFoundationFrom(source)) break;
        applyPostMove(source, { skipRender: true, skipWinCheck: true });
        moved = true;
      }
      if (moved) {
        ctx.playClick();
        render();
        checkWin();
      } else {
        ctx.showToast('移動できるカードがありません。', { type: 'warn', duration: 1500 });
      }
    }

    function applyPostMove(source, opts){
      if (source && source.type === 'tableau') {
        const column = state.tableaus[source.column];
        if (column && column.length) {
          const last = column[column.length - 1];
          if (last && !last.faceUp) {
            last.faceUp = true;
          }
        }
      }
      state.selected = null;
      if (opts && opts.skipRender) return;
      ctx.playClick();
      render();
      if (!opts || !opts.skipWinCheck) {
        checkWin();
      }
    }

    function checkWin(){
      if (state.finished) return;
      const total = state.foundations.reduce((sum, pile) => sum + pile.cards.length, 0);
      if (total === 52) {
        finishGame();
      }
    }

    function finishGame(){
      state.finished = true;
      ctx.award(150, { type: 'klondike-clear', moves: state.moves });
      ctx.showToast('クロンダイクをクリアしました！', { duration: 3200 });
      ctx.commitStats({ plays: 1, wins: 1, score: state.moves, bestMode: 'lower' });
      ctx.setActions([
        { label: '新しいゲーム (R)', variant: 'primary', hotkey: 'R', onClick: () => restart() },
        { label: 'ゲーム一覧 (B)', variant: 'secondary', hotkey: 'B', onClick: () => ctx.exitToHub() }
      ]);
      render();
    }

    function updateInfo(){
      if (state.finished) {
        info.textContent = 'おめでとうございます！新しいゲームで腕試ししましょう。';
      } else if (state.selected) {
        info.textContent = '移動先をクリックしてください。空列にはキングのみ置けます。';
      } else if (!state.waste.length && !state.stock.length) {
        info.textContent = '捨て札をクリックして山札に戻しましょう。';
      } else {
        info.textContent = '山札をめくるか、場札を選択して移動しましょう。';
      }
    }

    function updateHud(){
      const foundationText = state.foundations.map(p => `${p.symbol}${p.cards.length}`).join(' / ');
      ctx.setStatus(`移動 ${state.moves} 手 ・ 再構築 ${state.recycles} 回 ・ 山札 ${state.stock.length} ・ 捨て札 ${state.waste.length} ・ 台札 ${foundationText}`);
      const stats = ctx.stats();
      const best = stats.bestScore != null ? `${stats.bestScore} 手` : '---';
      ctx.setScore(`通算 ${stats.plays || 0} 回 / 勝利 ${stats.wins || 0} 回 / ベスト ${best}`);
    }

    function render(){
      animator.capture();
      renderStock();
      renderWaste();
      renderFoundations();
      renderTableaus();
      updateInfo();
      updateHud();
      animator.animate();
    }

    function renderStock(){
      const pile = stockStack.pile;
      pile.innerHTML = '';
      pile.classList.remove('empty');
      pile.classList.add('interactive');
      if (!state.stock.length) {
        pile.classList.add('empty');
        const placeholder = document.createElement('div');
        placeholder.className = 'mini-trump-klondike-placeholder';
        placeholder.textContent = state.waste.length ? '返す' : '空';
        pile.appendChild(placeholder);
      } else {
        const top = state.stock[state.stock.length - 1];
        const cardEl = ctx.cardUtils.renderCard(top, { faceUp: false });
        pile.appendChild(cardEl);
      }
    }

    function renderWaste(){
      const pile = wasteStack.pile;
      pile.innerHTML = '';
      pile.classList.toggle('empty', state.waste.length === 0);
      pile.classList.toggle('interactive', state.waste.length > 0);
      if (!state.waste.length) {
        const placeholder = document.createElement('div');
        placeholder.className = 'mini-trump-klondike-placeholder';
        placeholder.textContent = '---';
        pile.appendChild(placeholder);
        return;
      }
      const inner = document.createElement('div');
      inner.className = 'mini-trump-klondike-waste';
      pile.appendChild(inner);
      const maxDisplay = Math.min(3, state.waste.length);
      const start = state.waste.length - maxDisplay;
      for (let i = start; i < state.waste.length; i++) {
        const entry = state.waste[i];
        const isTop = i === state.waste.length - 1;
        const cardEl = ctx.cardUtils.renderCard(entry.card, { faceUp: true, interactive: isTop, hoverRaise: false });
        const offset = i - start;
        cardEl.style.position = 'absolute';
        cardEl.style.left = `${offset * 18}px`;
        cardEl.style.top = `${offset * 4}px`;
        if (isTop) {
          cardEl.addEventListener('click', (ev) => {
            ev.stopPropagation();
            handleWasteClick();
          });
          cardEl.addEventListener('dblclick', (ev) => {
            ev.stopPropagation();
            handleWasteDoubleClick();
          });
          if (state.selected && state.selected.type === 'waste') {
            cardEl.classList.add('selected');
          }
        }
        inner.appendChild(cardEl);
      }
    }

    function renderFoundations(){
      foundationStacks.forEach((stack, idx) => {
        const pile = stack.pile;
        pile.innerHTML = '';
        const statePile = state.foundations[idx];
        const stackCards = statePile.cards;
        if (!stackCards.length) {
          pile.classList.add('empty');
          pile.classList.remove('drop-target');
          const placeholder = document.createElement('div');
          placeholder.className = 'mini-trump-klondike-placeholder';
          placeholder.textContent = statePile.symbol;
          pile.appendChild(placeholder);
        } else {
          pile.classList.remove('empty');
          const card = stackCards[stackCards.length - 1];
          const cardEl = ctx.cardUtils.renderCard(card, { faceUp: true });
          cardEl.addEventListener('click', (ev) => {
            ev.stopPropagation();
            handleFoundationClick(idx);
          });
          if (state.selected && state.selected.type === 'foundation' && state.selected.index === idx) {
            cardEl.classList.add('selected');
          }
          pile.appendChild(cardEl);
        }
        if (state.selected) {
          const stackPeek = peekStack(state.selected);
          if (stackPeek.length === 1 && canPlaceOnFoundation(stackPeek[0].card, statePile)) {
            pile.classList.add('drop-target');
          } else {
            pile.classList.remove('drop-target');
          }
        } else {
          pile.classList.remove('drop-target');
        }
      });
    }

    function renderTableaus(){
      columnEls.forEach((colEl, idx) => {
        const column = state.tableaus[idx];
        colEl.innerHTML = '';
        if (!column.length) {
          colEl.classList.add('empty');
        } else {
          colEl.classList.remove('empty');
        }
        if (state.selected && canDropOnTableau(idx)) {
          colEl.classList.add('drop-target');
        } else {
          colEl.classList.remove('drop-target');
        }
        column.forEach((entry, cardIndex) => {
          const isFaceUp = entry.faceUp;
          const cardEl = ctx.cardUtils.renderCard(entry.card, { faceUp: isFaceUp, interactive: isFaceUp, hoverRaise: isFaceUp ? false : undefined });
          cardEl.style.top = `${cardIndex * 26}px`;
          if (isFaceUp) {
            cardEl.addEventListener('click', (ev) => {
              ev.stopPropagation();
              handleTableauCardClick(idx, cardIndex);
            });
            cardEl.addEventListener('dblclick', (ev) => {
              ev.stopPropagation();
              handleTableauDoubleClick(idx, cardIndex);
            });
          } else {
            cardEl.addEventListener('click', (ev) => {
              ev.stopPropagation();
              handleTableauCardClick(idx, cardIndex);
            });
          }
          if (state.selected && state.selected.type === 'tableau' && state.selected.column === idx && cardIndex >= state.selected.index) {
            cardEl.classList.add('selected');
          }
          colEl.appendChild(cardEl);
        });
      });
    }

    function canDropOnTableau(columnIndex){
      if (!state.selected) return false;
      const stack = peekStack(state.selected);
      if (!stack.length) return false;
      const column = state.tableaus[columnIndex];
      return canPlaceStackOnTableau(stack, column);
    }

    restart();

    return {
      start(){},
      stop(){},
      destroy(){},
      getScore(){ return ctx.stats().bestScore || 0; }
    };
  }

  function createSpiderGame(container, ctx){
    const root = document.createElement('div');
    root.className = 'mini-trump-spider';
    container.appendChild(root);
    const animator = createCardAnimator(root);

    const top = document.createElement('div');
    top.className = 'mini-trump-spider-top';
    root.appendChild(top);

    const stockWrapper = document.createElement('div');
    stockWrapper.className = 'mini-trump-spider-stock';
    top.appendChild(stockWrapper);

    const stockPile = document.createElement('div');
    stockPile.className = 'mini-trump-pile empty';
    stockWrapper.appendChild(stockPile);

    const stockInfo = document.createElement('div');
    stockInfo.className = 'mini-trump-meta';
    stockWrapper.appendChild(stockInfo);

    const completeWrapper = document.createElement('div');
    completeWrapper.className = 'mini-trump-klondike-foundations';
    top.appendChild(completeWrapper);

    const completeLabel = document.createElement('div');
    completeLabel.className = 'mini-trump-meta';
    completeWrapper.appendChild(completeLabel);

    const columns = document.createElement('div');
    columns.className = 'mini-trump-spider-columns';
    root.appendChild(columns);

    const columnEls = Array.from({ length: 10 }, (_, idx) => {
      const col = document.createElement('div');
      col.className = 'mini-trump-spider-column empty';
      col.addEventListener('click', (ev) => {
        ev.stopPropagation();
        handleColumnClick(idx);
      });
      columns.appendChild(col);
      return col;
    });

    const suitOrder = SUITS.filter(s => s.id !== 'joker').map(s => s.id);

    function spiderSuitIds(){
      switch(ctx.difficulty){
        case 'EASY':
          return ['spade'];
        case 'HARD':
          return suitOrder.slice();
        default:
          return ['spade', 'heart'];
      }
    }

    function buildSpiderDeck(){
      const suitIds = spiderSuitIds();
      const multiplier = Math.max(1, Math.floor(8 / suitIds.length));
      const deck = ctx.cardUtils.createDeck({ decks: multiplier }).filter(card => card.suit !== 'joker' && suitIds.includes(card.suit));
      return deck;
    }

    const state = {
      columns: Array.from({ length: 10 }, () => []),
      stock: [],
      moves: 0,
      score: 500,
      completed: 0,
      selected: null,
      finished: false
    };

    function restart(){
      const deck = buildSpiderDeck();
      ctx.cardUtils.shuffle(deck);
      state.columns = Array.from({ length: 10 }, () => []);
      for (let c = 0; c < 10; c++) {
        const count = c < 4 ? 6 : 5;
        for (let i = 0; i < count; i++) {
          const card = drawCard(deck);
          if (!card) continue;
          state.columns[c].push({ card, faceUp: i === count - 1 });
        }
      }
      state.stock = [];
      while (deck.length) {
        const pack = deck.splice(0, 10).map(card => ({ card, faceUp: true }));
        state.stock.push(pack);
      }
      state.moves = 0;
      state.score = 500;
      state.completed = 0;
      state.selected = null;
      state.finished = false;
      ctx.commitStats({ plays: 1 });
      render();
    }

    function currentSelection(){
      if (!state.selected) return [];
      const column = state.columns[state.selected.column];
      if (!column) return [];
      return column.slice(state.selected.index);
    }

    function isOrderedRun(cards){
      if (!cards.length) return false;
      for (let i = 0; i < cards.length - 1; i++) {
        const a = cards[i].card;
        const b = cards[i + 1].card;
        if (a.suit !== b.suit) return false;
        if (a.rankValue !== b.rankValue + 1) return false;
      }
      return true;
    }

    function columnTopCard(idx){
      const column = state.columns[idx];
      return column && column.length ? column[column.length - 1] : null;
    }

    function canDropRunOnColumn(run, idx){
      if (!run.length) return false;
      const column = state.columns[idx];
      if (!column.length) {
        return run[0].card.rankValue === 13; // King only
      }
      const top = column[column.length - 1];
      return top.card.rankValue === run[0].card.rankValue + 1;
    }

    function handleColumnCardClick(colIdx, cardIdx){
      const column = state.columns[colIdx];
      if (!column || !column.length) return;
      const entry = column[cardIdx];
      if (!entry || !entry.faceUp) return;
      if (state.selected && state.selected.column === colIdx && state.selected.index === cardIdx) {
        state.selected = null;
        render();
        return;
      }
      const run = column.slice(cardIdx);
      if (!isOrderedRun(run)) {
        ctx.showToast('連続した同スートの列のみ移動できます。', { type: 'warn', duration: 1800 });
        return;
      }
      state.selected = { column: colIdx, index: cardIdx };
      ctx.playClick();
      render();
    }

    function handleColumnClick(colIdx){
      const column = state.columns[colIdx];
      if (state.selected) {
        if (state.selected.column === colIdx) {
          state.selected = null;
          render();
          return;
        }
        const source = state.columns[state.selected.column];
        if (!source) return;
        const run = source.slice(state.selected.index);
        if (!isOrderedRun(run)) return;
        if (!canDropRunOnColumn(run, colIdx)) {
          ctx.showToast('移動できない列です。', { type: 'warn', duration: 1400 });
          return;
        }
        for (let i = state.selected.index; i < source.length; i++) {
          source[i].justMoved = true;
        }
        const moved = source.splice(state.selected.index);
        state.columns[colIdx].push(...moved.map(entry => ({ card: entry.card, faceUp: true })));
        const prev = source[source.length - 1];
        if (prev && !prev.faceUp) prev.faceUp = true;
        state.selected = null;
        state.moves += 1;
        state.score = Math.max(0, state.score - 1);
        ctx.playClick();
        checkColumnForSequence(colIdx);
        render();
        checkWin();
      } else if (column && column.length) {
        const topIndex = column.length - 1;
        const entry = column[topIndex];
        if (!entry.faceUp) return;
        handleColumnCardClick(colIdx, topIndex);
      }
    }

    function dealStock(){
      if (!state.stock.length) return;
      if (state.columns.some(col => !col.length)) {
        ctx.showToast('空の列があるときは配れません。', { type: 'warn', duration: 1600 });
        return;
      }
      const pack = state.stock.shift();
      for (let i = 0; i < state.columns.length; i++) {
        const entry = pack[i];
        if (entry) {
          state.columns[i].push({ card: entry.card, faceUp: true });
        }
      }
      state.selected = null;
      state.moves += 1;
      state.score = Math.max(0, state.score - 1);
      ctx.award(2, { type: 'spider-deal', remaining: state.stock.length });
      ctx.playClick();
      render();
      checkWin();
    }

    function checkColumnForSequence(idx){
      const column = state.columns[idx];
      if (!column || column.length < 13) return;
      const tail = column.slice(column.length - 13);
      if (!isOrderedRun(tail)) return;
      const suits = new Set(tail.map(entry => entry.card.suit));
      if (suits.size !== 1) return;
      column.splice(column.length - 13, 13);
      state.completed += 1;
      state.score += 100;
      ctx.award(15, { type: 'spider-sequence', column: idx, completed: state.completed });
      ctx.showToast(`${formatCard(tail[0].card, { style: 'symbol' })}の列を完成！`, { duration: 2000 });
      const top = column[column.length - 1];
      if (top && !top.faceUp) top.faceUp = true;
    }

    function checkWin(){
      if (state.finished) return;
      if (state.completed === 8) {
        state.finished = true;
        state.score += state.stock.length * 10;
        ctx.award(250, { type: 'spider-clear', moves: state.moves });
        ctx.showToast('スパイダーソリティアを制覇！', { duration: 3200 });
        ctx.commitStats({ wins: 1, score: state.score, bestMode: 'higher' });
        ctx.setActions([
          { label: 'もう一度遊ぶ (R)', variant: 'primary', hotkey: 'R', onClick: () => restart() },
          { label: 'ゲーム一覧 (B)', variant: 'secondary', hotkey: 'B', onClick: () => ctx.exitToHub() }
        ]);
        render();
      }
    }

    function renderStock(){
      stockPile.innerHTML = '';
      if (!state.stock.length) {
        stockPile.classList.add('empty');
      } else {
        stockPile.classList.remove('empty');
        const card = ctx.cardUtils.renderCard({ rankLabel: '?', suitSymbol: '?', suit: 'joker', color: 'black' }, { faceUp: false });
        stockPile.appendChild(card);
      }
      stockInfo.textContent = `山札 ${state.stock.length} 回`;
    }

    function renderColumns(){
      columnEls.forEach((colEl, idx) => {
        const column = state.columns[idx];
        colEl.innerHTML = '';
        if (!column.length) {
          colEl.classList.add('empty');
        } else {
          colEl.classList.remove('empty');
        }
        const run = currentSelection();
        if (state.selected && state.selected.column !== idx && canDropRunOnColumn(run, idx)) {
          colEl.classList.add('drop-target');
        } else {
          colEl.classList.remove('drop-target');
        }
        column.forEach((entry, cardIdx) => {
          const cardEl = ctx.cardUtils.renderCard(entry.card, { faceUp: entry.faceUp });
          cardEl.style.top = `${cardIdx * 24}px`;
          cardEl.addEventListener('click', (ev) => {
            ev.stopPropagation();
            handleColumnCardClick(idx, cardIdx);
          });
          if (state.selected && state.selected.column === idx && cardIdx >= state.selected.index) {
            cardEl.classList.add('selected');
          }
          colEl.appendChild(cardEl);
        });
      });
    }

    function updateHud(){
      const columnCounts = state.columns.map(col => col.filter(entry => entry.faceUp).length).join('/');
      ctx.setStatus(`移動 ${state.moves} 回 ・ 完成列 ${state.completed} / 8 ・ 山札 ${state.stock.length}`);
      ctx.setScore(`スコア ${state.score} ・ 表向き ${columnCounts}`);
      completeLabel.textContent = `完成列 ${state.completed} / 8`;
    }

    function render(){
      animator.capture();
      renderStock();
      renderColumns();
      updateHud();
      if (!state.finished) updateActions();
      animator.animate();
    }

    function updateActions(){
      const canDeal = state.stock.length > 0 && state.columns.every(col => col.length);
      ctx.setActions([
        { label: '山札を配る (D)', variant: 'primary', hotkey: 'D', onClick: () => dealStock(), disabled: !canDeal },
        { label: 'リスタート (R)', variant: 'secondary', hotkey: 'R', onClick: () => restart() },
        { label: '一覧へ戻る (B)', variant: 'secondary', hotkey: 'B', onClick: () => ctx.exitToHub() }
      ]);
    }

    restart();

    return {
      start(){},
      stop(){},
      destroy(){},
      getScore(){ return state.score || 0; }
    };
  }

  function createFreecellGame(container, ctx){
    const root = document.createElement('div');
    root.className = 'mini-trump-freecell';
    container.appendChild(root);
    const animator = createCardAnimator(root);

    const top = document.createElement('div');
    top.className = 'mini-trump-freecell-top';
    root.appendChild(top);

    const cellsRow = document.createElement('div');
    cellsRow.className = 'mini-trump-freecell-cells';
    top.appendChild(cellsRow);

    const foundationsRow = document.createElement('div');
    foundationsRow.className = 'mini-trump-freecell-foundations';
    top.appendChild(foundationsRow);

    const columns = document.createElement('div');
    columns.className = 'mini-trump-freecell-columns';
    root.appendChild(columns);

    const cellEls = Array.from({ length: 4 }, (_, idx) => {
      const cell = document.createElement('div');
      cell.className = 'mini-trump-pile empty';
      cell.addEventListener('click', (ev) => {
        ev.stopPropagation();
        handleCellClick(idx);
      });
      cellsRow.appendChild(cell);
      return cell;
    });

    const foundationDefs = SUITS.filter(s => s.id !== 'joker');
    const foundationEls = foundationDefs.map((suit, idx) => {
      const pile = document.createElement('div');
      pile.className = 'mini-trump-pile empty';
      pile.dataset.suit = suit.id;
      pile.addEventListener('click', (ev) => {
        ev.stopPropagation();
        handleFoundationClick(suit.id);
      });
      foundationsRow.appendChild(pile);
      return pile;
    });

    const columnEls = Array.from({ length: 8 }, (_, idx) => {
      const col = document.createElement('div');
      col.className = 'mini-trump-freecell-column empty';
      col.addEventListener('click', (ev) => {
        ev.stopPropagation();
        handleColumnClick(idx);
      });
      columns.appendChild(col);
      return col;
    });

    const state = {
      columns: Array.from({ length: 8 }, () => []),
      cells: [null, null, null, null],
      foundations: foundationDefs.reduce((acc, suit) => { acc[suit.id] = []; return acc; }, {}),
      selected: null,
      moves: 0,
      finished: false
    };

    function awardFreecellMove(target, meta = {}){
      ctx.award(1, Object.assign({ type: 'freecell-move', target }, meta));
    }

    function restart(){
      const deck = ctx.cardUtils.createDeck().slice();
      ctx.cardUtils.shuffle(deck);
      state.columns = Array.from({ length: 8 }, () => []);
      for (let i = 0; i < deck.length; i++) {
        const col = i % 8;
        const card = deck[i];
        state.columns[col].push({ card, faceUp: true });
      }
      state.cells = [null, null, null, null];
      Object.keys(state.foundations).forEach(suit => { state.foundations[suit] = []; });
      state.selected = null;
      state.moves = 0;
      state.finished = false;
      ctx.commitStats({ plays: 1 });
      ctx.setActions([
        { label: '新しいゲーム (R)', variant: 'primary', hotkey: 'R', onClick: () => restart() },
        { label: 'ヒント', variant: 'secondary', onClick: () => showHint() },
        { label: '一覧に戻る (B)', variant: 'secondary', hotkey: 'B', onClick: () => ctx.exitToHub() }
      ]);
      render();
    }

    function getMovableRun(column, start){
      const run = column.slice(start);
      if (!run.length) return [];
      for (let i = 0; i < run.length - 1; i++) {
        const a = run[i].card;
        const b = run[i + 1].card;
        if (a.rankValue !== b.rankValue + 1) return [];
        if (a.color === b.color) return [];
      }
      return run;
    }

    function freeMoveCapacity(){
      const freeCells = state.cells.filter(cell => !cell).length;
      const emptyColumns = state.columns.filter(col => !col.length).length;
      return (freeCells + 1) * Math.pow(2, emptyColumns);
    }

    function handleColumnCardClick(colIdx, cardIdx){
      const column = state.columns[colIdx];
      if (!column.length) return;
      if (state.selected && state.selected.type === 'column' && state.selected.column === colIdx && state.selected.index === cardIdx) {
        state.selected = null;
        ctx.playClick();
        render();
        return;
      }
      const run = getMovableRun(column, cardIdx);
      if (!run.length) {
        ctx.showToast('交互色の連続したカードのみ移動できます。', { type: 'warn', duration: 1600 });
        return;
      }
      if (run.length > freeMoveCapacity()) {
        ctx.showToast('空きセルと空列が不足しています。', { type: 'warn', duration: 1600 });
        return;
      }
      state.selected = { type: 'column', column: colIdx, index: cardIdx };
      ctx.playClick();
      render();
    }

    function handleColumnClick(colIdx){
      if (!state.selected) return;
      if (state.selected.type === 'column' && state.selected.column === colIdx) {
        state.selected = null;
        render();
        return;
      }
      const column = state.columns[colIdx];
      const stack = column && column.length ? column[column.length - 1].card : null;
      const moving = getSelectedCards();
      if (!moving.length) return;
      const first = moving[0].card;
      if (!column.length) {
        // any card allowed on empty column
      } else {
        if (stack.rankValue !== first.rankValue + 1 || stack.color === first.color) {
          ctx.showToast('置けるのは交互色で1小さいカードです。', { type: 'warn', duration: 1500 });
          return;
        }
      }
      moveSelectedToColumn(colIdx);
    }

    function handleCellClick(idx){
      if (state.selected && state.selected.type === 'cell' && state.selected.index === idx) {
        state.selected = null;
        ctx.playClick();
        render();
        return;
      }
      if (state.selected) {
        const moving = getSelectedCards();
        if (moving.length !== 1) {
          ctx.showToast('セルには1枚のみ置けます。', { type: 'warn', duration: 1400 });
          return;
        }
        if (state.cells[idx]) {
          ctx.showToast('すでにカードがあります。', { type: 'warn', duration: 1400 });
          return;
        }
        removeSelected((cardObj) => {
          state.cells[idx] = { card: cardObj.card };
        });
        awardFreecellMove('cell', { cell: idx });
      } else {
        const entry = state.cells[idx];
        if (!entry) return;
        state.selected = { type: 'cell', index: idx };
        ctx.playClick();
        render();
      }
    }

    function handleFoundationClick(suit){
      const moving = getSelectedCards();
      if (moving.length !== 1) {
        ctx.showToast('台札には1枚ずつ積みます。', { type: 'warn', duration: 1400 });
        return;
      }
      const card = moving[0].card;
      if (card.suit !== suit) {
        ctx.showToast('同じスートのみ移動できます。', { type: 'warn', duration: 1400 });
        return;
      }
      const pile = state.foundations[suit];
      const expected = pile.length + 1;
      if (card.rankValue !== expected) {
        ctx.showToast(`${expected === 1 ? 'A' : expected} を待っています。`, { type: 'warn', duration: 1400 });
        return;
      }
      removeSelected(() => {
        pile.push(card);
        ctx.award(4, { type: 'freecell-foundation', suit, rank: card.rankValue });
      });
      awardFreecellMove('foundation', { suit, rank: card.rankValue });
      if (pile.length === 13 && Object.values(state.foundations).every(p => p.length === 13)) {
        finishGame();
      }
    }

    function removeSelected(cb){
      if (!state.selected) return;
      if (state.selected.type === 'column') {
        const column = state.columns[state.selected.column];
        const removed = column.splice(state.selected.index);
        cb && removed.forEach(entry => cb(entry));
        state.moves += 1;
        state.selected = null;
        ctx.playClick();
        render();
      } else if (state.selected.type === 'cell') {
        const cell = state.cells[state.selected.index];
        if (!cell) return;
        const entry = { card: cell.card };
        state.cells[state.selected.index] = null;
        cb && cb(entry);
        state.moves += 1;
        state.selected = null;
        ctx.playClick();
        render();
      }
    }

    function getSelectedCards(){
      if (!state.selected) return [];
      if (state.selected.type === 'column') {
        return getMovableRun(state.columns[state.selected.column], state.selected.index);
      }
      if (state.selected.type === 'cell') {
        const entry = state.cells[state.selected.index];
        return entry ? [{ card: entry.card }] : [];
      }
      return [];
    }

    function moveSelectedToColumn(targetIdx){
      if (!state.selected) return;
      const origin = { ...state.selected };
      const targetColumn = state.columns[targetIdx];
      const wasEmpty = targetColumn.length === 0;
      let moved = false;
      if (state.selected.type === 'column') {
        const column = state.columns[state.selected.column];
        const chunk = column.splice(state.selected.index);
        if (!chunk.length) return;
        targetColumn.push(...chunk);
        moved = true;
      } else if (state.selected.type === 'cell') {
        const entry = state.cells[state.selected.index];
        if (!entry) return;
        targetColumn.push({ card: entry.card, faceUp: true });
        state.cells[state.selected.index] = null;
        moved = true;
      }
      if (!moved) return;
      state.moves += 1;
      state.selected = null;
      ctx.playClick();
      render();
      awardFreecellMove('column', { column: targetIdx, from: origin.type });
      if (wasEmpty) {
        ctx.award(3, { type: 'freecell-empty-column', column: targetIdx });
      }
    }

    function showHint(){
      const moves = computeAvailableMoves();
      if (!moves.length) {
        ctx.showToast('利用できる移動はありません。', { duration: 1600 });
        return;
      }
      const best = moves[0];
      ctx.showToast(best.message, { duration: 2200 });
    }

    function computeAvailableMoves(){
      const moves = [];
      state.columns.forEach((column, idx) => {
        if (!column.length) return;
        for (let i = 0; i < column.length; i++) {
          const run = getMovableRun(column, i);
          if (!run.length) continue;
          if (run.length > freeMoveCapacity()) continue;
          const card = run[0].card;
          state.columns.forEach((target, tIdx) => {
            if (idx === tIdx) return;
            if (!target.length) {
              moves.push({ message: `${formatCard(card)} を空列へ移動できます。`, weight: 1 });
            } else {
              const top = target[target.length - 1].card;
              if (top.rankValue === card.rankValue + 1 && top.color !== card.color) {
                moves.push({ message: `${formatCard(card)} を ${formatCard(top)} の上に移動できます。`, weight: 2 });
              }
            }
          });
        }
      });
      state.cells.forEach((cell, idx) => {
        if (!cell) return;
        const card = cell.card;
        Object.entries(state.foundations).forEach(([suit, pile]) => {
          if (suit === card.suit && card.rankValue === pile.length + 1) {
            moves.push({ message: `${formatCard(card)} を台札に移動できます。`, weight: 5 });
          }
        });
      });
      moves.sort((a, b) => b.weight - a.weight);
      return moves;
    }

    function finishGame(){
      if (state.finished) return;
      state.finished = true;
      ctx.award(180, { type: 'freecell-clear', moves: state.moves });
      ctx.showToast('フリーセルクリア！おめでとうございます。', { duration: 3200 });
      ctx.commitStats({ wins: 1, score: state.moves, bestMode: 'lower' });
      ctx.setActions([
        { label: '新しいゲーム (R)', variant: 'primary', hotkey: 'R', onClick: () => restart() },
        { label: '一覧に戻る (B)', variant: 'secondary', hotkey: 'B', onClick: () => ctx.exitToHub() }
      ]);
      render();
    }

    function renderCells(){
      cellEls.forEach((cellEl, idx) => {
        cellEl.innerHTML = '';
        const entry = state.cells[idx];
        if (!entry) {
          cellEl.classList.add('empty');
          cellEl.classList.remove('drop-target');
        } else {
          cellEl.classList.remove('empty');
          const cardEl = ctx.cardUtils.renderCard(entry.card, { faceUp: true, size: 'small' });
          if (state.selected && state.selected.type === 'cell' && state.selected.index === idx) {
            cardEl.classList.add('selected');
          }
          cellEl.appendChild(cardEl);
        }
      });
    }

    function renderFoundations(){
      foundationEls.forEach((pileEl) => {
        const suit = pileEl.dataset.suit;
        const pile = state.foundations[suit];
        pileEl.innerHTML = '';
        if (!pile.length) {
          pileEl.classList.add('empty');
          const placeholder = document.createElement('div');
          placeholder.className = 'mini-trump-klondike-placeholder';
          placeholder.textContent = SUITS.find(s => s.id === suit)?.symbol || '';
          pileEl.appendChild(placeholder);
        } else {
          pileEl.classList.remove('empty');
          const cardEl = ctx.cardUtils.renderCard(pile[pile.length - 1], { faceUp: true, size: 'small' });
          pileEl.appendChild(cardEl);
        }
      });
    }

    function renderColumns(){
      const selection = state.selected && state.selected.type === 'column' ? getMovableRun(state.columns[state.selected.column], state.selected.index) : [];
      columnEls.forEach((colEl, idx) => {
        colEl.innerHTML = '';
        const column = state.columns[idx];
        if (!column.length) {
          colEl.classList.add('empty');
        } else {
          colEl.classList.remove('empty');
        }
        if (state.selected && state.selected.type !== 'foundation' && state.selected.column !== idx) {
          const run = selection;
          if (run.length) {
            if (!column.length || (column[column.length - 1].card.rankValue === run[0].card.rankValue + 1 && column[column.length - 1].card.color !== run[0].card.color)) {
              colEl.classList.add('drop-target');
            } else {
              colEl.classList.remove('drop-target');
            }
          } else {
            colEl.classList.remove('drop-target');
          }
        } else {
          colEl.classList.remove('drop-target');
        }
        column.forEach((entry, cardIdx) => {
          const cardEl = ctx.cardUtils.renderCard(entry.card, { faceUp: true });
          cardEl.style.top = `${cardIdx * 26}px`;
          cardEl.addEventListener('click', (ev) => {
            ev.stopPropagation();
            handleColumnCardClick(idx, cardIdx);
          });
          if (state.selected && state.selected.type === 'column' && state.selected.column === idx && cardIdx >= state.selected.index) {
            cardEl.classList.add('selected');
          }
          colEl.appendChild(cardEl);
        });
      });
    }

    function updateHud(){
      const foundationStatus = foundationDefs.map(suit => `${suit.symbol}${state.foundations[suit.id].length}`).join(' / ');
      ctx.setStatus(`移動 ${state.moves} 回 ・ セル空き ${state.cells.filter(c => !c).length} ・ 台札 ${foundationStatus}`);
      const stats = ctx.stats();
      const best = stats.bestScore != null ? `${stats.bestScore} 手` : '---';
      ctx.setScore(`通算 ${stats.plays || 0} 回 / 勝利 ${stats.wins || 0} 回 / ベスト ${best}`);
    }

    function render(){
      animator.capture();
      renderCells();
      renderFoundations();
      renderColumns();
      updateHud();
      animator.animate();
    }

    restart();

    return {
      start(){},
      stop(){},
      destroy(){},
      getScore(){ return ctx.stats().bestScore || 0; }
    };
  }

  function createHeartsGame(container, ctx){
    const playerNames = ['あなた', '北', '東', '西'];
    const state = {
      players: [],
      trick: [],
      leadSuit: null,
      heartsBroken: false,
      turn: 0,
      trickNumber: 0,
      totals: [0, 0, 0, 0],
      roundScores: [0, 0, 0, 0],
      finished: false,
      awaitingPlayer: false
    };

    const root = document.createElement('div');
    root.className = 'mini-trump-table-game';
    container.appendChild(root);

    const layout = document.createElement('div');
    layout.className = 'mini-trump-table-layout';
    root.appendChild(layout);

    const playerList = document.createElement('div');
    playerList.className = 'mini-trump-table-players';
    layout.appendChild(playerList);

    const board = document.createElement('div');
    board.className = 'mini-trump-table-board';
    layout.appendChild(board);

    const trickRow = document.createElement('div');
    trickRow.className = 'mini-trump-trick';
    board.appendChild(trickRow);

    const handRow = document.createElement('div');
    handRow.className = 'mini-trump-hand-row';
    board.appendChild(handRow);

    const summary = document.createElement('div');
    summary.className = 'mini-trump-table-summary';
    board.appendChild(summary);

    const playerEls = playerNames.map((name, idx) => {
      const el = document.createElement('div');
      el.className = 'mini-trump-table-player';
      const label = document.createElement('div');
      label.className = 'name';
      label.textContent = name;
      const meta = document.createElement('div');
      meta.className = 'meta';
      el.appendChild(label);
      el.appendChild(meta);
      playerList.appendChild(el);
      return { el, meta };
    });

    function restart(){
      state.players = playerNames.map((name, idx) => ({
        name,
        hand: [],
        taken: [],
        idx
      }));
      const deck = ctx.cardUtils.createDeck().filter(card => card.suit !== 'joker');
      ctx.cardUtils.shuffle(deck);
      for (let i = 0; i < deck.length; i++) {
        const player = state.players[i % 4];
        player.hand.push(deck[i]);
      }
      state.players.forEach(player => player.hand.sort((a, b) => (a.suit > b.suit ? 1 : a.suit < b.suit ? -1 : a.rankValue - b.rankValue)));
      state.trick = [];
      state.trickNumber = 0;
      state.heartsBroken = false;
      state.leadSuit = null;
      state.roundScores = [0, 0, 0, 0];
      state.finished = false;
      const starter = state.players.find(p => p.hand.some(card => card.suit === 'club' && card.rankValue === 2));
      state.turn = starter ? starter.idx : 0;
      state.awaitingPlayer = state.turn === 0;
      ctx.commitStats({ plays: 1 });
      ctx.setActions([
        { label: '新しいディール (R)', variant: 'primary', hotkey: 'R', onClick: () => restart() },
        { label: '一覧に戻る (B)', variant: 'secondary', hotkey: 'B', onClick: () => ctx.exitToHub() }
      ]);
      render();
      maybeRunAi();
    }

    function maybeRunAi(){
      if (state.finished) return;
      if (state.turn !== 0) {
        state.awaitingPlayer = false;
        setTimeout(() => {
          const legal = legalCards(state.turn);
          const card = chooseAiCard(state.turn, legal);
          playCard(state.turn, card);
        }, 260);
      } else {
        state.awaitingPlayer = true;
        render();
      }
    }

    function legalCards(playerIdx){
      const player = state.players[playerIdx];
      const hand = player.hand;
      if (!state.trick.length) {
        const hasTwoClub = hand.some(card => card.suit === 'club' && card.rankValue === 2);
        if (state.trickNumber === 0 && hasTwoClub) {
          return hand.filter(card => card.suit === 'club' && card.rankValue === 2);
        }
        let legal = hand.slice();
        if (!state.heartsBroken) {
          const nonHearts = legal.filter(card => card.suit !== 'heart');
          if (nonHearts.length && !(state.trickNumber === 0)) legal = nonHearts;
        }
        return legal;
      }
      const leadSuit = state.leadSuit;
      const follow = hand.filter(card => card.suit === leadSuit);
      if (follow.length) return follow;
      if (state.trickNumber === 0) {
        return hand.filter(card => card.suit !== 'heart' && !(card.suit === 'spade' && card.rankValue === 12)) || hand.slice();
      }
      return hand.slice();
    }

    function chooseAiCard(idx, legal){
      if (!legal.length) return null;
      legal.sort((a, b) => a.rankValue - b.rankValue);
      if (!state.trick.length) {
        return legal[0];
      }
      const safe = legal.filter(card => card.suit !== 'heart' && !(card.suit === 'spade' && card.rankValue === 12));
      if (safe.length) return safe[0];
      return legal[legal.length - 1];
    }

    function playCard(playerIdx, card){
      const player = state.players[playerIdx];
      const handIdx = player.hand.findIndex(c => c.id === card.id);
      if (handIdx === -1) return;
      player.hand.splice(handIdx, 1);
      if (!state.trick.length) {
        state.leadSuit = card.suit;
        if (card.suit === 'heart') state.heartsBroken = true;
      } else if (card.suit === 'heart') {
        state.heartsBroken = true;
      }
      state.trick.push({ player: playerIdx, card });
      if (playerIdx === 0) state.awaitingPlayer = false;
      if (state.trick.length === 4) {
        render();
        setTimeout(resolveTrick, 400);
      } else {
        state.turn = (state.turn + 1) % 4;
        render();
        maybeRunAi();
      }
    }

    function resolveTrick(){
      const leadSuit = state.leadSuit;
      let winner = state.trick[0];
      for (const entry of state.trick.slice(1)) {
        if (entry.card.suit === leadSuit && entry.card.rankValue > winner.card.rankValue) {
          winner = entry;
        }
      }
      const points = state.trick.reduce((sum, entry) => {
        if (entry.card.suit === 'heart') return sum + 1;
        if (entry.card.suit === 'spade' && entry.card.rankValue === 12) return sum + 13;
        return sum;
      }, 0);
      const winnerName = winner.player === 0 ? 'you' : playerNames[winner.player];
      if (winner.player === 0) {
        const reward = points === 0 ? 6 : Math.max(-30, -points * 3);
        ctx.award(reward, { type: 'hearts-trick', winner: winnerName, points });
      } else {
        const reward = points > 0 ? 4 : 2;
        ctx.award(reward, { type: 'hearts-trick', winner: winnerName, points });
      }
      state.players[winner.player].taken.push(...state.trick);
      state.roundScores[winner.player] += points;
      state.trick = [];
      state.leadSuit = null;
      state.trickNumber += 1;
      state.turn = winner.player;
      if (state.players.every(p => p.hand.length === 0)) {
        finishRound();
      } else {
        render();
        maybeRunAi();
      }
    }

    function finishRound(){
      const shooter = state.roundScores.findIndex(score => score === 26);
      if (shooter !== -1) {
        state.roundScores = state.roundScores.map((score, idx) => idx === shooter ? 0 : score + 26);
      }
      for (let i = 0; i < state.totals.length; i++) {
        state.totals[i] += state.roundScores[i];
      }
      ctx.award(80, { type: 'hearts-round', scores: state.roundScores.slice() });
      state.finished = true;
      const playerScore = state.roundScores[0];
      if (playerScore === Math.min(...state.roundScores)) {
        ctx.commitStats({ wins: 1 });
        ctx.showToast('ハーツでラウンド勝利！', { duration: 2800 });
      }
      ctx.setActions([
        { label: '次のディール (R)', variant: 'primary', hotkey: 'R', onClick: () => restart() },
        { label: 'ゲーム一覧 (B)', variant: 'secondary', hotkey: 'B', onClick: () => ctx.exitToHub() }
      ]);
      render();
    }

    function handlePlayerChoice(card){
      if (state.turn !== 0) return;
      const legal = legalCards(0);
      if (!legal.some(c => c.id === card.id)) {
        ctx.showToast('そのカードは出せません。', { type: 'warn', duration: 1500 });
        return;
      }
      playCard(0, card);
    }

    function updateHud(){
      const trickDisplay = Math.min(13, state.trickNumber + 1);
      ctx.setStatus(`トリック ${trickDisplay}/13 ・ ハート解禁 ${state.heartsBroken ? '済' : '未'}`);
      const scoreLine = state.totals.map((score, idx) => `${playerNames[idx]} ${score}点`).join(' / ');
      ctx.setScore(scoreLine);
    }

    function renderPlayers(){
      playerEls.forEach(({ el, meta }, idx) => {
        const player = state.players[idx];
        if (!player) return;
        if (state.turn === idx && !state.finished) el.classList.add('active'); else el.classList.remove('active');
        const taken = state.roundScores[idx];
        meta.textContent = `手札${player.hand.length}枚 / ラウンド${taken}点 / 通算${state.totals[idx]}点`;
      });
    }

    function renderTrick(){
      trickRow.innerHTML = '';
      state.trick.forEach(entry => {
        const container = document.createElement('div');
        container.className = 'mini-trump-trick-card';
        const name = document.createElement('div');
        name.textContent = playerNames[entry.player];
        const cardEl = ctx.cardUtils.renderCard(entry.card, { faceUp: true, size: 'small' });
        container.appendChild(name);
        container.appendChild(cardEl);
        trickRow.appendChild(container);
      });
    }

    function renderHand(){
      handRow.innerHTML = '';
      const player = state.players[0];
      if (!player) return;
      const legal = state.finished ? [] : legalCards(0);
      player.hand.forEach(card => {
        const btn = document.createElement('button');
        btn.textContent = formatCard(card);
        if (state.turn !== 0 || state.finished || !legal.some(c => c.id === card.id)) {
          btn.classList.add('disabled');
          btn.disabled = true;
        } else {
          btn.addEventListener('click', () => handlePlayerChoice(card));
        }
        handRow.appendChild(btn);
      });
    }

    function renderSummary(){
      const lines = [];
      lines.push(`ハート解禁: ${state.heartsBroken ? 'はい' : 'いいえ'}`);
      if (state.finished) {
        const ranking = state.roundScores
          .map((score, idx) => ({ score, name: playerNames[idx] }))
          .sort((a, b) => a.score - b.score)
          .map(entry => `${entry.name}: ${entry.score}点`)
          .join(' / ');
        lines.push(`ラウンド結果: ${ranking}`);
      } else if (state.trick.length) {
        lines.push(`${playerNames[state.turn]} の番です。`);
      } else {
        lines.push(`${playerNames[state.turn]} がリードします。`);
      }
      summary.innerHTML = lines.map(line => `<div>${line}</div>`).join('');
    }

    function render(){
      renderPlayers();
      renderTrick();
      renderHand();
      renderSummary();
      updateHud();
    }

    restart();

    return {
      start(){},
      stop(){},
      destroy(){},
      getScore(){ return -state.roundScores[0]; }
    };
  }

  function createSevensGame(container, ctx){
    const playerNames = ['あなた', '北', '東', '西'];
    const suits = SUITS.filter(s => s.id !== 'joker');
    const root = document.createElement('div');
    root.className = 'mini-trump-table-game';
    container.appendChild(root);

    const layout = document.createElement('div');
    layout.className = 'mini-trump-table-layout';
    root.appendChild(layout);

    const playerList = document.createElement('div');
    playerList.className = 'mini-trump-table-players';
    layout.appendChild(playerList);

    const board = document.createElement('div');
    board.className = 'mini-trump-table-board';
    layout.appendChild(board);

    const boardStatus = document.createElement('div');
    boardStatus.className = 'mini-trump-table-summary';
    board.appendChild(boardStatus);

    const boardRows = suits.map((suit) => {
      const row = document.createElement('div');
      row.className = 'mini-trump-table-summary';
      row.style.flexDirection = 'row';
      row.style.flexWrap = 'wrap';
      board.appendChild(row);
      return { suit, row };
    });

    const handRow = document.createElement('div');
    handRow.className = 'mini-trump-hand-row';
    board.appendChild(handRow);

    const playerEls = playerNames.map((name) => {
      const el = document.createElement('div');
      el.className = 'mini-trump-table-player';
      const label = document.createElement('div');
      label.className = 'name';
      label.textContent = name;
      const meta = document.createElement('div');
      meta.className = 'meta';
      el.appendChild(label);
      el.appendChild(meta);
      playerList.appendChild(el);
      return { el, meta };
    });

    const state = {
      players: [],
      board: suits.reduce((acc, suit) => {
        acc[suit.id] = { low: 7, high: 7, cards: [] };
        return acc;
      }, {}),
      turn: 0,
      passes: 0,
      finished: false,
      log: []
    };

    function restart(){
      const deck = ctx.cardUtils.createDeck().filter(card => card.suit !== 'joker');
      ctx.cardUtils.shuffle(deck);
      state.players = playerNames.map((name, idx) => ({ name, idx, hand: [] }));
      for (let i = 0; i < deck.length; i++) {
        state.players[i % 4].hand.push(deck[i]);
      }
      state.players.forEach(player => player.hand.sort((a, b) => (a.suit > b.suit ? 1 : a.suit < b.suit ? -1 : a.rankValue - b.rankValue)));
      suits.forEach(suit => {
        state.board[suit.id] = { low: 7, high: 7, cards: [] };
      });
      state.passes = 0;
      state.finished = false;
      state.log = [];
      placeInitialSeven();
      ctx.commitStats({ plays: 1 });
      render();
      maybeRunAi();
    }

    function placeInitialSeven(){
      const starter = state.players.find(player => player.hand.some(card => card.suit === 'diamond' && card.rankValue === 7));
      if (!starter) {
        state.turn = 0;
        return;
      }
      const idx = starter.hand.findIndex(card => card.suit === 'diamond' && card.rankValue === 7);
      if (idx === -1) {
        state.turn = starter.idx;
        return;
      }
      const card = starter.hand.splice(idx, 1)[0];
      placeCardOnBoard(card);
      state.log.push(`${starter.name} が ${formatCard(card)} を開始に配置。`);
      ctx.award(5, { type: 'sevens-start' });
      state.turn = (starter.idx + 1) % 4;
    }

    function legalCards(playerIdx){
      const player = state.players[playerIdx];
      return player.hand.filter(card => {
        const suitBoard = state.board[card.suit];
        if (!suitBoard.cards.length) {
          return card.rankValue === 7;
        }
        if (card.rankValue === 7) return true;
        if (card.rankValue === suitBoard.low - 1 && card.rankValue >= 1) return true;
        if (card.rankValue === suitBoard.high + 1 && card.rankValue <= 13) return true;
        return false;
      });
    }

    function handlePlayerCard(card){
      if (state.finished || state.turn !== 0) return;
      const legal = legalCards(0);
      if (!legal.some(c => c.id === card.id)) {
        ctx.showToast('そのカードは並べられません。', { type: 'warn', duration: 1500 });
        return;
      }
      playCard(0, card);
    }

    function handlePlayerPass(){
      if (state.finished || state.turn !== 0) return;
      const legal = legalCards(0);
      if (legal.length) {
        ctx.showToast('出せるカードがあります。', { type: 'warn', duration: 1400 });
        return;
      }
      passTurn(0);
    }

    function maybeRunAi(){
      if (state.finished) return;
      if (state.turn === 0) {
        render();
        return;
      }
      setTimeout(() => {
        const legal = legalCards(state.turn);
        if (legal.length) {
          const card = chooseAiCard(legal);
          playCard(state.turn, card);
        } else {
          passTurn(state.turn);
        }
      }, 260);
    }

    function chooseAiCard(cards){
      const sorted = cards.slice().sort((a, b) => a.rankValue - b.rankValue);
      return sorted[0];
    }

    function playCard(playerIdx, card){
      const player = state.players[playerIdx];
      const index = player.hand.findIndex(c => c.id === card.id);
      if (index === -1) return;
      player.hand.splice(index, 1);
      placeCardOnBoard(card);
      ctx.award(2, { type: 'sevens-play', suit: card.suit, rank: card.rank });
      state.log.push(`${player.name} が ${formatCard(card)} を配置。`);
      if (player.hand.length === 0) {
        finishGame(player);
        return;
      }
      state.passes = 0;
      state.turn = (state.turn + 1) % 4;
      render();
      maybeRunAi();
    }

    function updateActions(){
      if (state.finished) return;
      const legal = state.turn === 0 ? legalCards(0) : [];
      ctx.setActions([
        { label: '再戦 (R)', variant: 'primary', hotkey: 'R', onClick: () => restart() },
        { label: 'パス', variant: 'secondary', onClick: () => handlePlayerPass(), disabled: state.turn !== 0 || legal.length > 0 },
        { label: '一覧に戻る (B)', variant: 'secondary', hotkey: 'B', onClick: () => ctx.exitToHub() }
      ]);
    }

    function placeCardOnBoard(card){
      const boardSuit = state.board[card.suit];
      if (!boardSuit.cards.includes(card.rankValue)) {
        boardSuit.cards.push(card.rankValue);
        boardSuit.cards.sort((a, b) => a - b);
      }
      if (card.rankValue < boardSuit.low) boardSuit.low = card.rankValue;
      if (card.rankValue > boardSuit.high) boardSuit.high = card.rankValue;
    }

    function passTurn(playerIdx){
      state.log.push(`${state.players[playerIdx].name} はパス。`);
      state.passes += 1;
      if (playerIdx === 0) {
        ctx.award(-3, { type: 'sevens-pass' });
      }
      state.turn = (state.turn + 1) % 4;
      if (state.passes >= 4) {
        ctx.showToast('全員がパスしました。状況が進むまで待ちましょう。', { duration: 2000 });
        state.passes = 0;
      }
      render();
      maybeRunAi();
    }

    function finishGame(player){
      if (state.finished) return;
      state.finished = true;
      ctx.award(100, { type: 'sevens-clear', winner: player.name });
      ctx.commitStats({ wins: player.idx === 0 ? 1 : 0 });
      ctx.showToast(`${player.name} の勝利！`, { duration: 2800 });
      ctx.setActions([
        { label: '再戦 (R)', variant: 'primary', hotkey: 'R', onClick: () => restart() },
        { label: 'ゲーム一覧 (B)', variant: 'secondary', hotkey: 'B', onClick: () => ctx.exitToHub() }
      ]);
      render();
    }

    function renderPlayers(){
      playerEls.forEach(({ el, meta }, idx) => {
        const player = state.players[idx];
        if (!player) return;
        if (state.turn === idx && !state.finished) el.classList.add('active'); else el.classList.remove('active');
        meta.textContent = `手札 ${player.hand.length} 枚`;
      });
    }

    function renderBoard(){
      boardRows.forEach(({ suit, row }) => {
        row.innerHTML = '';
        const info = state.board[suit.id];
        const played = info.cards.slice().sort((a, b) => a - b);
        const frag = document.createDocumentFragment();
        const label = document.createElement('div');
        label.textContent = `${suit.symbol} :`;
        frag.appendChild(label);
        if (!played.length) {
          const placeholder = document.createElement('div');
          placeholder.textContent = '---';
          placeholder.style.opacity = '0.6';
          frag.appendChild(placeholder);
        } else {
          for (let rank = info.low; rank <= info.high; rank++) {
            const span = document.createElement('div');
            span.textContent = rankLabel(rank);
            span.style.marginRight = '6px';
            span.style.fontWeight = played.includes(rank) ? '700' : '400';
            frag.appendChild(span);
          }
        }
        row.appendChild(frag);
      });
      boardStatus.innerHTML = state.log.slice(-4).map(item => `<div>${item}</div>`).join('');
    }

    function rankLabel(value){
      if (value === 1) return 'A';
      if (value === 11) return 'J';
      if (value === 12) return 'Q';
      if (value === 13) return 'K';
      return String(value);
    }

    function renderHand(){
      handRow.innerHTML = '';
      const player = state.players[0];
      if (!player) return;
      const legal = legalCards(0);
      player.hand.forEach(card => {
        const btn = document.createElement('button');
        btn.textContent = formatCard(card);
        if (state.finished || state.turn !== 0 || !legal.some(c => c.id === card.id)) {
          btn.classList.add('disabled');
          btn.disabled = true;
        } else {
          btn.addEventListener('click', () => handlePlayerCard(card));
        }
        handRow.appendChild(btn);
      });
    }

    function updateHud(){
      const leader = state.players.reduce((best, player) => {
        if (player.hand.length < best.count) return { name: player.name, count: player.hand.length };
        return best;
      }, { name: '', count: Infinity });
      ctx.setStatus(`手番: ${playerNames[state.turn]} ・ パス連続 ${state.passes}`);
      ctx.setScore(`最少手札: ${leader.count === Infinity ? '-' : `${leader.name} (${leader.count}枚)`}`);
    }

    function render(){
      renderPlayers();
      renderBoard();
      renderHand();
      updateHud();
      if (!state.finished) updateActions();
    }

    restart();

    return {
      start(){},
      stop(){},
      destroy(){},
      getScore(){ return state.finished && state.players[0].hand.length === 0 ? 1 : 0; }
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
        const key = card.rank + '-' + card.suit;
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
      let softAces = aces;
      while (total > 21 && softAces > 0) { total -= 10; softAces--; }
      return { total, soft: softAces > 0 };
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
      const playerEval = handValue(state.playerHand);
      const dealerEval = handValue(state.dealerHand);
      if (playerEval.total === 21 && dealerEval.total !== 21) {
        setMessage('ブラックジャック！');
        settleRound('bj');
        return true;
      }
      if (dealerEval.total === 21 && playerEval.total !== 21) {
        setMessage('ディーラーがブラックジャック…');
        settleRound('lose');
        return true;
      }
      if (dealerEval.total === 21 && playerEval.total === 21) {
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
      const value = handValue(state.playerHand).total;
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
      let dealerEval = handValue(state.dealerHand);
      const hitSoft17 = ctx.difficulty === 'HARD';
      while (dealerEval.total < 17 || (hitSoft17 && dealerEval.total === 17 && dealerEval.soft)) {
        deal(state.dealerHand);
        dealerEval = handValue(state.dealerHand);
      }
      const playerVal = handValue(state.playerHand).total;
      if (dealerEval.total > 21) {
        setMessage(`ディーラーがバースト (${dealerEval.total})`);
        settleRound('win');
        return;
      }
      if (dealerEval.total > playerVal) {
        setMessage(`ディーラー ${dealerEval.total} 対 ${playerVal}`);
        settleRound('lose');
      } else if (dealerEval.total < playerVal) {
        setMessage(`勝利！${playerVal} 対 ${dealerEval.total}`);
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
    const animator = createCardAnimator(layout);

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
        if (loser && loser.human) {
          ctx.award(-10, { type: 'baba-joker-penalty' });
        }
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
      animator.capture();
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
            const cardInfo = player.hand[i];
            if (cardInfo && cardInfo.id) {
              btn.dataset.cardId = cardInfo.id;
            }
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
      animator.animate();
    }

    initGame();

    return {
      start(){},
      stop(){},
      destroy(){},
      getScore(){ return players[0].finishedAt || 0; }
    };
  }

  function createPokerGame(container, ctx){
    const opponents = [
      { id: 1, name: 'AI-1', hand: [], result: null },
      { id: 2, name: 'AI-2', hand: [], result: null },
      { id: 3, name: 'AI-3', hand: [], result: null }
    ];
    const state = {
      deck: [],
      playerHand: [],
      holds: new Set(),
      stage: 'hold',
      showdown: null,
      rounds: 0
    };

    const root = document.createElement('div');
    root.className = 'mini-trump-poker';
    const board = document.createElement('div');
    board.className = 'mini-trump-poker-board';
    const opponentList = document.createElement('div');
    opponentList.className = 'mini-trump-poker-opponents';
    const playerBox = document.createElement('div');
    playerBox.className = 'mini-trump-poker-player';
    const playerTitle = document.createElement('h3');
    playerTitle.textContent = 'あなたの手札';
    const handRow = document.createElement('div');
    handRow.className = 'mini-trump-poker-hand';
    const summary = document.createElement('div');
    summary.className = 'mini-trump-poker-summary';

    container.innerHTML = '';
    container.appendChild(root);
    root.appendChild(board);
    board.appendChild(opponentList);
    board.appendChild(playerBox);
    playerBox.appendChild(playerTitle);
    playerBox.appendChild(handRow);
    playerBox.appendChild(summary);

    const opponentRefs = opponents.map(opponent => {
      const el = document.createElement('div');
      el.className = 'mini-trump-poker-opponent';
      const name = document.createElement('div');
      name.className = 'name';
      name.textContent = opponent.name;
      const cards = document.createElement('div');
      cards.className = 'cards';
      const result = document.createElement('div');
      result.className = 'mini-trump-poker-summary';
      el.appendChild(name);
      el.appendChild(cards);
      el.appendChild(result);
      opponentList.appendChild(el);
      return { el, cards, result };
    });

    ctx.onSettingsChange(() => render());

    function initRound(){
      const deck = ctx.cardUtils.createDeck();
      const filtered = deck.filter(card => card.suit !== 'joker');
      ctx.cardUtils.shuffle(filtered);
      state.deck = filtered;
      state.playerHand = [];
      state.holds = new Set();
      state.showdown = null;
      state.stage = 'hold';
      opponents.forEach(op => { op.hand = []; op.result = null; });

      dealInitial();
      state.holds = new Set(state.playerHand.map(card => card.id));
      state.rounds += 1;
      ctx.setStatus('保持するカードを選んで「交換する」を押してください。');
      updateHud();
      updateActions();
      render();
    }

    function dealInitial(){
      for (let i = 0; i < 5; i++) {
        state.playerHand.push(ctx.cardUtils.drawCard(state.deck));
        opponents.forEach(opponent => {
          opponent.hand.push(ctx.cardUtils.drawCard(state.deck));
        });
      }
    }

    function updateHud(){
      const stats = ctx.stats();
      const bestLabel = stats.bestScore != null ? scoreToHandLabel(stats.bestScore) : '---';
      ctx.setScore(`通算 ${stats.plays || 0} ハンド / 勝利 ${stats.wins || 0} / ベスト ${bestLabel}`);
    }

    function updateActions(){
      if (state.stage === 'hold') {
        ctx.setActions([
          { label: '交換する (D)', variant: 'primary', hotkey: 'D', onClick: () => executeDraw() },
          { label: '勝負 (S)', variant: 'secondary', hotkey: 'S', onClick: () => resolveShowdown() },
          { label: 'ヒント (H)', variant: 'secondary', hotkey: 'H', onClick: () => ctx.showToast('残したいカードを「HOLD」にして交換しましょう。') },
          { label: '新しいハンド (R)', variant: 'secondary', hotkey: 'R', onClick: () => initRound() },
          { label: 'ゲーム一覧 (B)', variant: 'secondary', hotkey: 'B', onClick: () => ctx.exitToHub() }
        ]);
      } else {
        ctx.setActions([
          { label: '次のハンド (R)', variant: 'primary', hotkey: 'R', onClick: () => initRound() },
          { label: 'ヒント (H)', variant: 'secondary', hotkey: 'H', onClick: () => ctx.showToast('保持するカードを工夫すると強い役が狙えます。') },
          { label: 'ゲーム一覧 (B)', variant: 'secondary', hotkey: 'B', onClick: () => ctx.exitToHub() }
        ]);
      }
    }

    function toggleHold(card){
      if (state.stage !== 'hold') return;
      if (state.holds.has(card.id)) {
        if (state.holds.size <= 1) {
          ctx.showToast('最低1枚は保持してください。', { type: 'warn' });
          return;
        }
        const discardCount = 5 - state.holds.size;
        if (discardCount >= 3) {
          ctx.showToast('一度に捨てられるのは3枚までです。', { type: 'warn' });
          return;
        }
        state.holds.delete(card.id);
      } else {
        state.holds.add(card.id);
      }
      renderHand();
    }

    function executeDraw(){
      if (state.stage !== 'hold') return;
      replaceCards(state.playerHand, state.holds);
      opponents.forEach(opponent => {
        const holdSet = chooseAiHolds(opponent.hand);
        replaceCards(opponent.hand, holdSet);
      });
      resolveShowdown();
    }

    function replaceCards(hand, holdSet){
      for (let i = 0; i < hand.length; i++) {
        const card = hand[i];
        if (!card || !holdSet.has(card.id)) {
          const next = ctx.cardUtils.drawCard(state.deck);
          if (next) {
            hand[i] = next;
          }
        }
      }
    }

    function resolveShowdown(skipAward){
      const playerEval = evaluateHand(state.playerHand);
      const results = [
        { player: 0, name: 'あなた', eval: playerEval, score: handScore(playerEval), hand: state.playerHand.slice(), human: true }
      ];
      opponents.forEach(opponent => {
        const evalResult = evaluateHand(opponent.hand);
        results.push({
          player: opponent.id,
          name: opponent.name,
          eval: evalResult,
          score: handScore(evalResult),
          hand: opponent.hand.slice(),
          human: false
        });
        opponent.result = evalResult;
      });
      results.sort((a, b) => b.score - a.score);
      const bestScore = results[0].score;
      const winners = results.filter(entry => entry.score === bestScore);
      const playerPlacement = results.findIndex(entry => entry.player === 0) + 1;
      const stats = ctx.stats();
      const awardTable = [8, 15, 25, 35, 60, 90, 120, 150, 180, 220];
      const baseAward = awardTable[playerEval.rank] ?? 10;
      if (!skipAward) ctx.award(baseAward, { type: 'poker-hand', label: playerEval.label, rank: playerEval.rank });
      if (playerPlacement === 1) {
        ctx.award(90, { type: 'poker-win', label: playerEval.label });
      }
      ctx.commitStats({ plays: 1, wins: playerPlacement === 1 ? 1 : 0, score: handScore(playerEval), bestMode: 'higher' });
      state.stage = 'result';
      state.showdown = { results, winners, placement: playerPlacement };
      const winnerNames = winners.map(w => w.name).join(' / ');
      ctx.setStatus(`勝者: ${winnerNames} ・ あなたは ${playerPlacement} 位 (${playerEval.label})`);
      updateHud();
      updateActions();
      render();
    }

    function chooseAiHolds(hand){
      const holdSet = new Set();
      const evalResult = evaluateHand(hand);
      if (evalResult.rank >= 4) {
        // flush or better → 全保持
        hand.forEach(card => holdSet.add(card.id));
        return holdSet;
      }
      const counts = rankCounts(hand);
      const suitCounts = suitCountsMap(hand);
      const targetSuit = Array.from(suitCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
      hand.forEach(card => {
        if (counts.get(card.rankValue === 1 ? 14 : card.rankValue) > 1) {
          holdSet.add(card.id);
        }
      });
      if (holdSet.size <= 1 && targetSuit && suitCounts.get(targetSuit) >= 3) {
        hand.forEach(card => {
          if (card.suit === targetSuit) holdSet.add(card.id);
        });
      }
      if (!holdSet.size) {
        const sorted = hand.slice().sort((a, b) => (valueOf(b) - valueOf(a)));
        sorted.slice(0, 2).forEach(card => holdSet.add(card.id));
      }
      return holdSet;
    }

    function renderHand(){
      handRow.innerHTML = '';
      state.playerHand.forEach(card => {
        const el = ctx.cardUtils.renderCard(card, { faceUp: true, size: 'small', interactive: state.stage === 'hold' });
        if (state.stage === 'hold') {
          el.addEventListener('click', () => toggleHold(card));
        }
        if (state.holds.has(card.id)) el.classList.add('hold'); else el.classList.remove('hold');
        if (state.stage !== 'hold') el.classList.add('locked');
        handRow.appendChild(el);
      });
      renderSummary();
    }

    function renderOpponents(){
      opponents.forEach((opponent, idx) => {
        const ref = opponentRefs[idx];
        ref.cards.innerHTML = '';
        if (state.stage === 'result' && opponent.result) {
          opponent.hand.forEach(card => {
            const el = ctx.cardUtils.renderCard(card, { faceUp: true, size: 'tiny' });
            ref.cards.appendChild(el);
          });
          ref.result.innerHTML = `<div>${opponent.result.label}</div>`;
        } else {
          opponent.hand.forEach(() => {
            const el = ctx.cardUtils.renderCard({ suit: 'joker', rank: 'X', rankValue: 0, rankLabel: 'X', suitLabel: 'Back', suitSymbol: '' }, { faceUp: false, size: 'tiny' });
            ref.cards.appendChild(el);
          });
          ref.result.innerHTML = `<div>交換待ち...</div>`;
        }
        if (state.showdown && state.showdown.results[0].player === opponent.id) ref.el.classList.add('active'); else ref.el.classList.remove('active');
      });
    }

    function renderSummary(){
      if (!state.showdown) {
        summary.innerHTML = `<div>交換しないカードは「HOLD」が表示されます。</div><div>山札: ${state.deck.length} 枚</div>`;
      } else {
        const player = state.showdown.results.find(entry => entry.player === 0);
        summary.innerHTML = `<div>${player.eval.label}</div><div>順位: ${state.showdown.placement} 位</div>`;
      }
    }

    function render(){
      renderHand();
      renderOpponents();
    }

    function valueOf(card){
      if (!card) return 0;
      return card.rankValue === 1 ? 14 : card.rankValue;
    }

    function rankCounts(hand){
      const counts = new Map();
      hand.forEach(card => {
        const value = valueOf(card);
        counts.set(value, (counts.get(value) || 0) + 1);
      });
      return counts;
    }

    function suitCountsMap(hand){
      const counts = new Map();
      hand.forEach(card => counts.set(card.suit, (counts.get(card.suit) || 0) + 1));
      return counts;
    }

    function evaluateHand(hand){
      const values = hand.map(valueOf).sort((a, b) => b - a);
      const suits = suitCountsMap(hand);
      const counts = rankCounts(hand);
      const sortedCounts = Array.from(counts.entries()).sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1];
        return b[0] - a[0];
      });
      let isStraight = false;
      let straightHigh = values[0];
      const unique = Array.from(new Set(values));
      if (unique.length === 5) {
        if (values[0] - values[4] === 4) {
          isStraight = true;
          straightHigh = values[0];
        } else if (values[0] === 14 && values[1] === 5 && values[2] === 4 && values[3] === 3 && values[4] === 2) {
          isStraight = true;
          straightHigh = 5;
        }
      }
      const isFlush = Array.from(suits.values()).some(count => count === 5);
      let rank = 0;
      let label = 'ハイカード';
      let tiebreak = values.slice();
      if (isStraight && isFlush) {
        if (straightHigh === 14) {
          rank = 9;
          label = 'ロイヤルフラッシュ';
          tiebreak = [14];
        } else {
          rank = 8;
          label = 'ストレートフラッシュ';
          tiebreak = [straightHigh];
        }
      } else if (sortedCounts[0][1] === 4) {
        rank = 7;
        label = 'フォーカード';
        tiebreak = [sortedCounts[0][0], sortedCounts[1][0]];
      } else if (sortedCounts[0][1] === 3 && sortedCounts[1][1] === 2) {
        rank = 6;
        label = 'フルハウス';
        tiebreak = [sortedCounts[0][0], sortedCounts[1][0]];
      } else if (isFlush) {
        rank = 5;
        label = 'フラッシュ';
        tiebreak = values.slice();
      } else if (isStraight) {
        rank = 4;
        label = 'ストレート';
        tiebreak = [straightHigh];
      } else if (sortedCounts[0][1] === 3) {
        rank = 3;
        label = 'スリーカード';
        const rest = values.filter(v => v !== sortedCounts[0][0]).sort((a, b) => b - a);
        tiebreak = [sortedCounts[0][0], ...rest];
      } else if (sortedCounts[0][1] === 2 && sortedCounts[1][1] === 2) {
        rank = 2;
        label = 'ツーペア';
        const kicker = values.filter(v => v !== sortedCounts[0][0] && v !== sortedCounts[1][0])[0];
        const highPair = Math.max(sortedCounts[0][0], sortedCounts[1][0]);
        const lowPair = Math.min(sortedCounts[0][0], sortedCounts[1][0]);
        tiebreak = [highPair, lowPair, kicker];
      } else if (sortedCounts[0][1] === 2) {
        rank = 1;
        label = 'ワンペア';
        const rest = values.filter(v => v !== sortedCounts[0][0]).sort((a, b) => b - a);
        tiebreak = [sortedCounts[0][0], ...rest];
      }
      return { rank, label, values: tiebreak };
    }

    function handScore(result){
      let score = result.rank * 1000000;
      result.values.forEach(val => {
        score = score * 20 + val;
      });
      return score;
    }

    function scoreToHandLabel(score){
      if (score == null) return '---';
      const rank = Math.floor(score / 1000000);
      const labels = ['ハイカード', 'ワンペア', 'ツーペア', 'スリーカード', 'ストレート', 'フラッシュ', 'フルハウス', 'フォーカード', 'ストレートフラッシュ', 'ロイヤルフラッシュ'];
      return labels[rank] || '---';
    }

    initRound();

    return {
      start(){},
      stop(){},
      destroy(){},
      getScore(){
        return state.showdown ? state.showdown.results.find(entry => entry.player === 0)?.score || 0 : 0;
      }
    };
  }

  function createJijiGame(container, ctx){
    const players = [
      { id: 0, name: 'You', human: true, hand: [], finishedAt: null },
      { id: 1, name: 'AI-1', human: false, hand: [], finishedAt: null },
      { id: 2, name: 'AI-2', human: false, hand: [], finishedAt: null },
      { id: 3, name: 'AI-3', human: false, hand: [], finishedAt: null }
    ];
    const state = {
      order: [],
      current: 0,
      finished: false,
      tableCard: null,
      selectingSwap: false,
      jijiId: null,
      jijiHolder: null
    };

    const layout = document.createElement('div');
    layout.className = 'mini-trump-jiji-table';
    const center = document.createElement('div');
    center.className = 'mini-trump-jiji-center';
    const tableEl = document.createElement('div');
    tableEl.className = 'mini-trump-jiji-table-card';
    const tableLabel = document.createElement('div');
    tableLabel.className = 'label';
    tableLabel.textContent = '台札';
    const tableCardHost = document.createElement('div');
    const tableMeta = document.createElement('div');
    tableMeta.className = 'meta';
    const swapButton = document.createElement('button');
    swapButton.type = 'button';
    swapButton.textContent = '交換モード';
    tableEl.appendChild(tableLabel);
    tableEl.appendChild(tableCardHost);
    tableEl.appendChild(tableMeta);
    tableEl.appendChild(swapButton);
    center.appendChild(tableEl);

    const ring = document.createElement('div');
    ring.className = 'mini-trump-baba-ring';

    layout.appendChild(center);
    layout.appendChild(ring);
    container.innerHTML = '';
    container.appendChild(layout);
    const animator = createCardAnimator(layout);

    swapButton.addEventListener('click', () => {
      if (state.finished) return;
      const player = players[state.current];
      if (!player || !player.human) return;
      if (!state.tableCard) {
        ctx.showToast('交換できる台札がありません。', { type: 'warn' });
        return;
      }
      state.selectingSwap = !state.selectingSwap;
      updateSwapState();
      render();
    });

    ctx.setActions([
      { label: 'ヒント (H)', variant: 'secondary', hotkey: 'H', onClick: () => ctx.showToast('台札と同じランクを揃えると手札を減らせます。') },
      { label: 'リスタート (R)', variant: 'secondary', hotkey: 'R', onClick: () => initGame() },
      { label: 'ゲーム一覧 (B)', variant: 'secondary', hotkey: 'B', onClick: () => ctx.exitToHub() }
    ]);

    function initGame(){
      players.forEach(p => { p.hand = []; p.finishedAt = null; });
      state.order = [];
      state.current = 0;
      state.finished = false;
      state.tableCard = null;
      state.selectingSwap = false;
      state.jijiId = null;
      state.jijiHolder = null;

      let deck = ctx.cardUtils.createDeck({ jokers: 2 }).filter(card => card.rank !== 'JOKER' || card.suit === 'joker');
      ctx.cardUtils.shuffle(deck);
      const jokers = deck.filter(card => card.suit === 'joker');
      if (jokers.length) {
        const chosen = jokers[Math.floor(Math.random() * jokers.length)];
        chosen.isJiji = true;
        state.jijiId = chosen.id;
      }

      let table = ctx.cardUtils.drawCard(deck);
      while (table && table.id === state.jijiId) {
        deck.push(table);
        ctx.cardUtils.shuffle(deck);
        table = ctx.cardUtils.drawCard(deck);
      }
      state.tableCard = table;

      let idx = 0;
      while (deck.length) {
        const card = ctx.cardUtils.drawCard(deck);
        const player = players[idx % players.length];
        player.hand.push(card);
        if (card.id === state.jijiId) state.jijiHolder = player.id;
        idx++;
      }

      players.forEach(player => removePairs(player));
      state.current = findNextActive(0);
      ctx.setStatus('あなたの番：必要なら台札と交換し、右隣からカードを引きましょう。');
      render();
      updateHud();
    }

    function updateHud(){
      const stats = ctx.stats();
      const human = players[0];
      const best = stats.bestScore != null ? `${stats.bestScore} 位` : '---';
      ctx.setScore(`通算 ${stats.plays || 0} 回 / ベスト ${best} / 手札 ${human.hand.length} 枚`);
    }

    function updateSwapState(){
      if (state.selectingSwap) {
        swapButton.textContent = '交換モード解除';
        tableEl.classList.add('swap-ready');
        ctx.setStatus('交換するカードを自分の手札から選んでください。');
      } else {
        swapButton.textContent = '交換モード';
        tableEl.classList.remove('swap-ready');
        if (state.current === 0) {
          ctx.setStatus('台札と交換するか、右隣からカードを引いてください。');
        }
      }
    }

    function findNextActive(start){
      let i = start;
      for (let attempt = 0; attempt < players.length; attempt++) {
        const player = players[i % players.length];
        if (player.hand.length > 0) return i % players.length;
        i++;
      }
      return start % players.length;
    }

    function removePairs(player, opts = {}){
      const counts = new Map();
      for (const card of player.hand) {
        if (card.id === state.jijiId) continue;
        const value = card.rank;
        counts.set(value, (counts.get(value) || 0) + 1);
      }
      const toRemove = new Set();
      counts.forEach((count, rank) => {
        const pairs = Math.floor(count / 2);
        if (pairs <= 0) return;
        let removed = 0;
        for (let i = player.hand.length - 1; i >= 0 && removed < pairs * 2; i--) {
          const card = player.hand[i];
          if (card.rank === rank && card.id !== state.jijiId) {
            toRemove.add(card.id);
            removed++;
          }
        }
        if (player.human && opts.award !== false) ctx.award(5, { type: 'jiji-pair', rank });
      });
      if (toRemove.size) {
        player.hand = player.hand.filter(card => !toRemove.has(card.id));
      }
      if (player.hand.length === 0 && player.finishedAt == null) {
        player.finishedAt = state.order.length + 1;
        state.order.push(player.id);
        if (player.id === 0) {
          ctx.award(90, { type: 'jiji-finish', place: player.finishedAt });
          ctx.showToast(`上がり！順位 ${player.finishedAt}`, { duration: 2600 });
        }
      }
    }

    function swapWithTable(player, idx){
      if (!state.tableCard) {
        ctx.showToast('台札がありません。', { type: 'warn' });
        state.selectingSwap = false;
        updateSwapState();
        render();
        return;
      }
      const card = player.hand[idx];
      if (!card) return;
      if (card.id === state.jijiId) {
        if (player.human) ctx.showToast('ジジは台札に置けません。', { type: 'warn' });
        return;
      }
      const newCard = state.tableCard;
      player.hand[idx] = newCard;
      state.tableCard = card;
      if (newCard && newCard.id === state.jijiId) state.jijiHolder = player.id;
      if (card.id === state.jijiId) state.jijiHolder = player.id;
      state.selectingSwap = false;
      updateSwapState();
      removePairs(player);
      render();
      if (player.human) {
        ctx.showToast('台札と交換しました。');
      }
    }

    function executeTurn(player){
      if (state.finished) return;
      if (player.human) {
        render();
        return;
      }
      aiMaybeSwap(player);
      drawFromNext(player);
    }

    function aiMaybeSwap(player){
      if (!state.tableCard) return;
      const tableRank = state.tableCard.rank;
      if (!tableRank) return;
      const jijiIndex = player.hand.findIndex(card => card.id === state.jijiId);
      const matchIndex = player.hand.findIndex(card => card.rank === tableRank && card.id !== state.jijiId);
      if (jijiIndex !== -1 && state.tableCard.rank !== 'JOKER') {
        // try to get rid of jiji by pairing
        const pairIdx = player.hand.findIndex(card => card.rank === state.tableCard.rank && card.id !== state.jijiId);
        if (pairIdx !== -1) {
          swapWithTable(player, pairIdx);
        }
        return;
      }
      if (matchIndex !== -1) {
        swapWithTable(player, matchIndex);
      }
    }

    function drawFromNext(player){
      const nextIndex = findNextActive((player.id + 1) % players.length);
      const target = players[nextIndex];
      if (!target || target.hand.length === 0) {
        advanceTurn();
        return;
      }
      const idx = Math.floor(Math.random() * target.hand.length);
      const drawn = target.hand.splice(idx, 1)[0];
      if (!drawn) {
        advanceTurn();
        return;
      }
      player.hand.push(drawn);
      if (drawn.id === state.jijiId) state.jijiHolder = player.id;
      removePairs(player);
      removePairs(target, { award: false });
      advanceTurn();
    }

    function handleHumanDraw(targetIdx, cardIdx){
      if (state.finished) return;
      const human = players[0];
      if (state.current !== 0) return;
      const target = players[targetIdx];
      if (!target || target.hand.length <= cardIdx) return;
      if (state.selectingSwap) {
        ctx.showToast('交換モードを終了してください。', { type: 'warn' });
        return;
      }
      const drawn = target.hand.splice(cardIdx, 1)[0];
      if (drawn) {
        human.hand.push(drawn);
        if (drawn.id === state.jijiId) state.jijiHolder = 0;
      }
      removePairs(human);
      removePairs(target, { award: false });
      advanceTurn();
    }

    function advanceTurn(){
      if (checkGameEnd()) return;
      state.current = findNextActive((state.current + 1) % players.length);
      const current = players[state.current];
      state.selectingSwap = false;
      updateSwapState();
      if (current.human) {
        ctx.setStatus('台札と交換するか、右隣からカードを引いてください。');
        render();
      } else {
        ctx.setStatus(`${current.name} の番`);
        render();
        setTimeout(() => executeTurn(current), 600);
      }
    }

    function checkGameEnd(){
      const active = players.filter(p => p.hand.length > 0);
      if (active.length <= 1) {
        state.finished = true;
        const loser = active[0];
        ctx.showToast(`${loser.name} がジジを持っています。ゲーム終了！`, { duration: 2800 });
        if (loser && loser.human) {
          ctx.award(-20, { type: 'jiji-joker-penalty' });
        }
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
      animator.capture();
      renderTable();
      renderPlayers();
      updateHud();
      animator.animate();
    }

    function renderTable(){
      tableCardHost.innerHTML = '';
      if (state.tableCard) {
        const el = ctx.cardUtils.renderCard(state.tableCard, { faceUp: true, size: 'small' });
        tableCardHost.appendChild(el);
        tableMeta.textContent = `ランク: ${state.tableCard.rankLabel}`;
      } else {
        tableMeta.textContent = '台札なし';
      }
      swapButton.disabled = state.finished || state.current !== 0 || !state.tableCard;
      updateSwapState();
    }

    function renderPlayers(){
      ring.innerHTML = '';
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
          player.hand.forEach((cardInfo, idx) => {
            const el = ctx.cardUtils.renderCard(cardInfo, { faceUp: true, size: 'tiny', interactive: state.selectingSwap && state.current === 0 });
            if (state.selectingSwap && state.current === 0 && cardInfo.id !== state.jijiId) {
              el.addEventListener('click', () => swapWithTable(player, idx));
            }
            handBox.appendChild(el);
          });
        } else {
          for (let i = 0; i < player.hand.length; i++) {
            const btn = document.createElement('button');
            btn.dataset.targetCard = String(i);
            const cardInfo = player.hand[i];
            if (cardInfo && cardInfo.id) {
              btn.dataset.cardId = cardInfo.id;
            }
            btn.textContent = '?';
            if (players[state.current].human && player.id === humanTargetIndex && !state.selectingSwap) {
              btn.disabled = false;
              btn.addEventListener('click', () => handleHumanDraw(player.id, i));
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
    }

    initGame();

    return {
      start(){},
      stop(){},
      destroy(){},
      getScore(){ return players[0].finishedAt || 0; }
    };
  }

  function createDaifugoGame(container, ctx){
    const players = [
      { id: 0, name: 'あなた', human: true, hand: [], finishedAt: null },
      { id: 1, name: '北', human: false, hand: [], finishedAt: null },
      { id: 2, name: '東', human: false, hand: [], finishedAt: null },
      { id: 3, name: '西', human: false, hand: [], finishedAt: null }
    ];
    const state = {
      deck: [],
      leadValue: null,
      leadPlayer: null,
      current: 0,
      passCount: 0,
      history: [],
      finished: false,
      order: []
    };

    const root = document.createElement('div');
    root.className = 'mini-trump-daifugo';
    const board = document.createElement('div');
    board.className = 'mini-trump-daifugo-board';
    const playerGrid = document.createElement('div');
    playerGrid.className = 'mini-trump-daifugo-players';
    const center = document.createElement('div');
    center.className = 'mini-trump-daifugo-center';
    const pile = document.createElement('div');
    pile.className = 'pile';
    const pileTitle = document.createElement('h4');
    pileTitle.textContent = '現在の場';
    const pileBody = document.createElement('div');
    pile.appendChild(pileTitle);
    pile.appendChild(pileBody);
    const log = document.createElement('div');
    log.className = 'mini-trump-daifugo-history';
    center.appendChild(pile);
    center.appendChild(log);
    const handRow = document.createElement('div');
    handRow.className = 'mini-trump-daifugo-hand';

    container.innerHTML = '';
    container.appendChild(root);
    root.appendChild(board);
    board.appendChild(playerGrid);
    board.appendChild(center);
    board.appendChild(handRow);

    const playerEls = players.map(player => {
      const el = document.createElement('div');
      el.className = 'mini-trump-daifugo-player';
      const name = document.createElement('div');
      name.className = 'name';
      name.textContent = player.name;
      const meta = document.createElement('div');
      meta.className = 'meta';
      el.appendChild(name);
      el.appendChild(meta);
      playerGrid.appendChild(el);
      return { el, meta };
    });

    function initGame(){
      players.forEach(p => { p.hand = []; p.finishedAt = null; });
      state.deck = ctx.cardUtils.createDeck().filter(card => card.suit !== 'joker');
      ctx.cardUtils.shuffle(state.deck);
      state.leadValue = null;
      state.leadPlayer = null;
      state.current = 0;
      state.passCount = 0;
      state.history = [];
      state.finished = false;
      state.order = [];

      dealCards();
      state.current = findStartPlayer();
      ctx.setStatus(`${players[state.current].name} のリード`);
      updateActions();
      render();
      ctx.commitStats({ plays: 1 });
      advanceTurn({ stay: true });
    }

    function dealCards(){
      for (let i = 0; i < 13; i++) {
        players.forEach(player => {
          const card = ctx.cardUtils.drawCard(state.deck);
          if (card) player.hand.push(card);
        });
      }
      players.forEach(player => {
        player.hand.sort((a, b) => valueOf(a) - valueOf(b));
      });
    }

    function findStartPlayer(){
      let starter = 0;
      players.forEach(player => {
        const hasThreeDiamond = player.hand.some(card => card.suit === 'diamond' && card.rankValue === 3);
        if (hasThreeDiamond) starter = player.id;
      });
      return starter;
    }

    function valueOf(card){
      return card.rankValue === 1 ? 14 : card.rankValue;
    }

    function legalCards(player){
      if (state.leadValue == null || state.leadPlayer === player.id) {
        return player.hand.slice();
      }
      return player.hand.filter(card => valueOf(card) > state.leadValue);
    }

    function playCard(player, card){
      const index = player.hand.findIndex(c => c.id === card.id);
      if (index === -1) return;
      player.hand.splice(index, 1);
      state.leadValue = valueOf(card);
      state.leadPlayer = player.id;
      state.passCount = 0;
      state.history.unshift(`${player.name}: ${formatCard(card)}`);
      if (state.history.length > 6) state.history.length = 6;
      if (player.hand.length === 0 && player.finishedAt == null) {
        player.finishedAt = state.order.length + 1;
        state.order.push(player.id);
        if (player.id === 0) ctx.award(120, { type: 'daifugo-finish', place: player.finishedAt });
      }
      if (checkFinish()) return;
      render();
      advanceTurn();
    }

    function pass(player){
      state.passCount += 1;
      state.history.unshift(`${player.name}: パス`);
      if (state.history.length > 6) state.history.length = 6;
      const active = players.filter(p => p.hand.length > 0).length;
      if (state.passCount >= Math.max(1, active - 1)) {
        const lead = state.leadPlayer;
        state.leadValue = null;
        state.leadPlayer = null;
        state.passCount = 0;
        state.current = lead != null ? lead : player.id;
        return true;
      }
      return false;
    }

    function checkFinish(){
      const remaining = players.filter(p => p.hand.length > 0);
      if (remaining.length <= 1) {
        state.finished = true;
        if (remaining.length === 1) {
          const loser = remaining[0];
          loser.finishedAt = players.length;
          state.order.push(loser.id);
        }
        const placement = players[0].finishedAt || players.length;
        const awards = [0, 150, 80, 40, 10];
        if (placement <= 4) ctx.award(awards[placement], { type: 'daifugo-result', place: placement });
        ctx.commitStats({ wins: placement === 1 ? 1 : 0, score: placement, bestMode: 'lower' });
        ctx.setStatus('ラウンド終了');
        ctx.setActions([
          { label: '次のラウンド (R)', variant: 'primary', hotkey: 'R', onClick: () => initGame() },
          { label: 'ゲーム一覧 (B)', variant: 'secondary', hotkey: 'B', onClick: () => ctx.exitToHub() }
        ]);
        updateHud();
        render();
        return true;
      }
      return false;
    }

    function advanceTurn(opts = {}){
      if (state.finished) return;
      if (!opts.stay) {
        state.current = (state.current + 1) % players.length;
      } else {
        state.current = state.current % players.length;
      }
      const player = players[state.current];
      if (player.hand.length === 0) {
        advanceTurn({ stay: false });
        return;
      }
      if (player.human) {
        ctx.setStatus(state.leadValue == null ? '好きなカードを出してください。' : `場より強いカードを出すかパス (P) してください。`);
        updateActions();
        render();
      } else {
        updateActions();
        render();
        setTimeout(() => aiTakeTurn(player), 650);
      }
    }

    function aiTakeTurn(player){
      if (state.finished) return;
      const legal = legalCards(player);
      if (!legal.length) {
      const reset = pass(player);
      render();
      advanceTurn({ stay: reset });
      return;
    }
      const choice = legal.sort((a, b) => valueOf(a) - valueOf(b))[0];
      playCard(player, choice);
    }

    function handleHumanPlay(card){
      if (state.current !== 0 || state.finished) return;
      const legal = legalCards(players[0]);
      if (!legal.some(c => c.id === card.id)) {
        ctx.showToast('そのカードは出せません。', { type: 'warn' });
        return;
      }
      playCard(players[0], card);
    }

    function handleHumanPass(){
      if (state.current !== 0 || state.finished) return;
      if (state.leadValue == null) {
        ctx.showToast('最初のリードではパスできません。', { type: 'warn' });
        return;
      }
      const reset = pass(players[0]);
      render();
      advanceTurn({ stay: reset });
    }

    function updateActions(){
      if (state.finished) return;
      const actions = [];
      if (state.current === 0 && state.leadValue != null) {
        actions.push({ label: 'パス (P)', variant: 'secondary', hotkey: 'P', onClick: () => handleHumanPass() });
      }
      actions.push({ label: 'リスタート (R)', variant: 'secondary', hotkey: 'R', onClick: () => initGame() });
      actions.push({ label: 'ゲーム一覧 (B)', variant: 'secondary', hotkey: 'B', onClick: () => ctx.exitToHub() });
      ctx.setActions(actions);
    }

    function updateHud(){
      const stats = ctx.stats();
      const best = stats.bestScore != null ? `${stats.bestScore} 位` : '---';
      ctx.setScore(`通算 ${stats.plays || 0} 回 / 勝利 ${stats.wins || 0} / ベスト ${best}`);
    }

    function render(){
      renderPlayers();
      renderPile();
      renderHand();
      renderHistory();
      updateHud();
    }

    function renderPlayers(){
      playerEls.forEach(({ el, meta }, idx) => {
        const player = players[idx];
        if (!player) return;
        if (state.current === idx && !state.finished) el.classList.add('active'); else el.classList.remove('active');
        const status = player.finishedAt ? `${player.finishedAt} 位` : `${player.hand.length} 枚`;
        meta.textContent = status;
      });
    }

    function renderPile(){
      if (state.leadValue == null) {
        pileBody.textContent = 'リセット';
      } else {
        pileBody.textContent = `要求値: ${state.leadValue}`;
      }
    }

    function renderHand(){
      handRow.innerHTML = '';
      const player = players[0];
      const legal = legalCards(player);
      player.hand.forEach(card => {
        const btn = document.createElement('button');
        btn.textContent = formatCard(card);
        if (!legal.some(c => c.id === card.id) || state.finished || state.current !== 0) {
          btn.classList.add('disabled');
          btn.disabled = true;
        } else {
          btn.addEventListener('click', () => handleHumanPlay(card));
        }
        handRow.appendChild(btn);
      });
    }

    function renderHistory(){
      log.innerHTML = '';
      state.history.forEach(entry => {
        const line = document.createElement('div');
        line.textContent = entry;
        log.appendChild(line);
      });
    }

    initGame();

    return {
      start(){},
      stop(){},
      destroy(){},
      getScore(){ return players[0].finishedAt || 0; }
    };
  }

  function createPageOneGame(container, ctx){
    const players = [
      { id: 0, name: 'あなた', human: true, hand: [], declared: false },
      { id: 1, name: '北', human: false, hand: [], declared: false },
      { id: 2, name: '東', human: false, hand: [], declared: false },
      { id: 3, name: '西', human: false, hand: [], declared: false }
    ];
    const state = {
      deck: [],
      discard: [],
      turn: 0,
      finished: false,
      drawUsed: false,
      turns: 0
    };

    const root = document.createElement('div');
    root.className = 'mini-trump-pageone';
    const board = document.createElement('div');
    board.className = 'mini-trump-pageone-board';
    const opponentRow = document.createElement('div');
    opponentRow.className = 'mini-trump-pageone-opponents';
    const center = document.createElement('div');
    center.className = 'mini-trump-pageone-center';
    const deckBox = document.createElement('div');
    deckBox.className = 'deck';
    const deckTitle = document.createElement('h4');
    deckTitle.textContent = '山札';
    const deckCount = document.createElement('div');
    deckBox.appendChild(deckTitle);
    deckBox.appendChild(deckCount);
    const discardBox = document.createElement('div');
    discardBox.className = 'discard';
    const discardTitle = document.createElement('h4');
    discardTitle.textContent = '捨て札';
    const discardTop = document.createElement('div');
    discardBox.appendChild(discardTitle);
    discardBox.appendChild(discardTop);
    center.appendChild(deckBox);
    center.appendChild(discardBox);
    const handRow = document.createElement('div');
    handRow.className = 'mini-trump-pageone-hand';
    const statusBox = document.createElement('div');
    statusBox.className = 'mini-trump-pageone-status';

    container.innerHTML = '';
    container.appendChild(root);
    root.appendChild(board);
    board.appendChild(opponentRow);
    board.appendChild(center);
    board.appendChild(handRow);
    board.appendChild(statusBox);

    const opponentRefs = players.slice(1).map(player => {
      const el = document.createElement('div');
      el.className = 'mini-trump-pageone-opponent';
      const name = document.createElement('div');
      name.className = 'name';
      name.textContent = player.name;
      const meta = document.createElement('div');
      meta.className = 'meta';
      el.appendChild(name);
      el.appendChild(meta);
      opponentRow.appendChild(el);
      return { player, el, meta };
    });

    function initGame(){
      players.forEach(player => { player.hand = []; player.declared = false; });
      state.deck = ctx.cardUtils.createDeck().filter(card => card.suit !== 'joker');
      ctx.cardUtils.shuffle(state.deck);
      state.discard = [];
      state.turn = 0;
      state.finished = false;
      state.drawUsed = false;
      state.turns = 0;

      for (let i = 0; i < 7; i++) {
        players.forEach(player => {
          const card = ctx.cardUtils.drawCard(state.deck);
          if (card) player.hand.push(card);
        });
      }
      const starter = ctx.cardUtils.drawCard(state.deck);
      if (starter) state.discard.push(starter);
      ctx.setStatus('同じ数字か同じスートのカードを出してください。');
      updateActions();
      render();
      ctx.commitStats({ plays: 1 });
    }

    function updateActions(){
      if (state.finished) return;
      const actions = [];
      const human = players[0];
      if (state.turn === 0 && !state.drawUsed) {
        actions.push({ label: 'ドロー (D)', variant: 'primary', hotkey: 'D', onClick: () => handleDraw() });
      }
      if (human.hand.length === 1 && !human.declared) {
        actions.push({ label: '宣言する (P)', variant: 'secondary', hotkey: 'P', onClick: () => handleDeclare() });
      }
      actions.push({ label: 'リスタート (R)', variant: 'secondary', hotkey: 'R', onClick: () => initGame() });
      actions.push({ label: 'ゲーム一覧 (B)', variant: 'secondary', hotkey: 'B', onClick: () => ctx.exitToHub() });
      ctx.setActions(actions);
    }

    function handleDraw(){
      if (state.turn !== 0 || state.drawUsed || state.finished) return;
      drawCard(players[0]);
      if (players[0].hand.length === 1 && !players[0].declared) {
        ctx.showToast('残り1枚！「宣言する」を押してください。', { duration: 2000 });
      }
      state.drawUsed = true;
      render();
      setTimeout(() => advanceTurn(), 400);
    }

    function handleDeclare(){
      if (state.finished) return;
      const human = players[0];
      if (human.declared) {
        ctx.showToast('すでに宣言済みです。', { duration: 1400 });
        return;
      }
      if (human.hand.length !== 1) {
        ctx.showToast('宣言できるのは残り1枚のときだけです。', { type: 'warn', duration: 1400 });
        return;
      }
      human.declared = true;
      ctx.showToast('「ページワン！」', { duration: 1800 });
      render();
      updateActions();
    }

    function drawCard(player){
      if (!state.deck.length) reshuffleDeck();
      const card = ctx.cardUtils.drawCard(state.deck);
      if (card) player.hand.push(card);
      return card;
    }

    function reshuffleDeck(){
      const top = state.discard.pop();
      const rest = state.discard.splice(0);
      ctx.cardUtils.shuffle(rest);
      state.deck.push(...rest);
      if (top) state.discard.push(top);
    }

    function legalCards(player){
      const top = state.discard[state.discard.length - 1];
      if (!top) return player.hand.slice();
      return player.hand.filter(card => card.rank === top.rank || card.suit === top.suit);
    }

    function playCard(player, card){
      const idx = player.hand.findIndex(c => c.id === card.id);
      if (idx === -1) return;
      player.hand.splice(idx, 1);
      state.discard.push(card);
      state.drawUsed = false;
      state.turns += 1;
      if (player.hand.length === 1) {
        if (player.human) {
          ctx.showToast('残り1枚！「宣言する」を押してください。', { duration: 2000 });
        } else {
          player.declared = true;
        }
      }
      if (player.hand.length === 0) {
        finishGame(player.id);
        return;
      }
      advanceTurn();
    }

    function finishGame(winnerId){
      state.finished = true;
      const humanWin = winnerId === 0;
      if (humanWin) {
        if (!players[0].declared) {
          ctx.award(-10, { type: 'pageone-penalty' });
          ctx.showToast('宣言していなかったため -10XP。', { type: 'warn', duration: 2400 });
        }
        ctx.award(90, { type: 'pageone-win', turns: state.turns });
      }
      ctx.commitStats({ wins: humanWin ? 1 : 0, score: humanWin ? 1 : 0, bestMode: 'higher' });
      ctx.setStatus(`${players[winnerId].name} の勝利！`);
      ctx.setActions([
        { label: 'もう一度 (R)', variant: 'primary', hotkey: 'R', onClick: () => initGame() },
        { label: 'ゲーム一覧 (B)', variant: 'secondary', hotkey: 'B', onClick: () => ctx.exitToHub() }
      ]);
      render();
    }

    function advanceTurn(){
      if (state.finished) return;
      state.turn = (state.turn + 1) % players.length;
      if (state.turn === 0) {
        ctx.setStatus('同じ数字か同じスートのカードを出してください。');
        state.drawUsed = false;
        updateActions();
        render();
      } else {
        updateActions();
        render();
        setTimeout(() => aiTurn(players[state.turn]), 480);
      }
    }

    function aiTurn(player){
      if (state.finished) return;
      const legal = legalCards(player);
      if (legal.length) {
        legal.sort((a, b) => valueOfCard(a) - valueOfCard(b));
        playCard(player, legal[0]);
      } else {
        const card = drawCard(player);
        if (card) {
          const plays = legalCards(player);
          if (plays.some(c => c.id === card.id)) {
            playCard(player, card);
            return;
          }
        }
        advanceTurn();
      }
    }

    function valueOfCard(card){
      return card.rankValue === 1 ? 14 : card.rankValue;
    }

    function handleHumanPlay(card){
      if (state.turn !== 0 || state.finished) return;
      const legal = legalCards(players[0]);
      if (!legal.some(c => c.id === card.id)) {
        ctx.showToast('そのカードは出せません。', { type: 'warn' });
        return;
      }
      playCard(players[0], card);
    }

    function render(){
      renderOpponents();
      renderCenter();
      renderHand();
      renderStatus();
      updateHud();
    }

    function renderOpponents(){
      opponentRefs.forEach(ref => {
        const { player, el, meta } = ref;
        if (state.turn === player.id && !state.finished) el.classList.add('active'); else el.classList.remove('active');
        meta.textContent = `${player.hand.length} 枚${player.declared ? ' / 宣言済' : ''}`;
      });
    }

    function renderCenter(){
      deckCount.textContent = `${state.deck.length} 枚`; 
      discardTop.innerHTML = '';
      const top = state.discard[state.discard.length - 1];
      if (top) {
        discardTop.textContent = formatCard(top);
      } else {
        discardTop.textContent = '---';
      }
    }

    function renderHand(){
      handRow.innerHTML = '';
      const player = players[0];
      const legal = legalCards(player);
      player.hand.forEach(card => {
        const btn = document.createElement('button');
        btn.textContent = formatCard(card);
        if (state.turn !== 0 || state.finished || !legal.some(c => c.id === card.id)) {
          btn.classList.add('disabled');
          btn.disabled = true;
        } else {
          btn.addEventListener('click', () => handleHumanPlay(card));
        }
        handRow.appendChild(btn);
      });
    }

    function renderStatus(){
      statusBox.innerHTML = '';
      const line1 = document.createElement('div');
      const top = state.discard[state.discard.length - 1];
      line1.textContent = top ? `現在の場: ${formatCard(top)}` : '現在の場: ---';
      const line2 = document.createElement('div');
      line2.textContent = state.turn === 0 ? 'あなたの番です。' : `${players[state.turn].name} の番`;
      statusBox.appendChild(line1);
      statusBox.appendChild(line2);
    }

    function updateHud(){
      const stats = ctx.stats();
      ctx.setScore(`通算 ${stats.plays || 0} 回 / 勝利 ${stats.wins || 0}`);
    }

    initGame();

    return {
      start(){},
      stop(){},
      destroy(){},
      getScore(){ return state.turns; }
    };
  }

  window.registerMiniGame({
    id: 'trump_games',
    name: 'トランプセレクション', nameKey: 'selection.miniexp.games.trump_games.name',
    description: 'トランプゲームハブ（神経衰弱・ブラックジャック・ババ抜き収録）', descriptionKey: 'selection.miniexp.games.trump_games.description', categoryIds: ['board'],
    create
  });
})();

(function(){
  const STORAGE_KEY = 'mini_memostudio_state_v1';
  const STYLE_ID = 'mini-exp-memostudio-style';
  const BASE_STYLE = `
    .memo-studio-root { display:flex; gap:18px; width:100%; height:100%; box-sizing:border-box; padding:18px; font-family:'Segoe UI','Hiragino Sans','Yu Gothic',sans-serif; color:#0f172a; background:linear-gradient(135deg, rgba(59,130,246,0.08), rgba(236,72,153,0.08)); }
    .memo-sidebar { width:280px; display:flex; flex-direction:column; gap:16px; background:rgba(15,23,42,0.02); border-radius:18px; padding:16px; box-shadow:inset 0 0 0 1px rgba(15,23,42,0.08); }
    .memo-sidebar-header { display:flex; align-items:center; justify-content:space-between; }
    .memo-sidebar-header h2 { margin:0; font-size:18px; display:flex; gap:8px; align-items:center; }
    .memo-sidebar-header h2 span { font-size:11px; color:#2563eb; background:rgba(37,99,235,0.15); padding:2px 10px; border-radius:999px; letter-spacing:0.04em; }
    .memo-deck-list { display:flex; flex-direction:column; gap:10px; max-height:46vh; overflow-y:auto; padding-right:6px; }
    .memo-deck-card { border-radius:14px; padding:12px; border:1px solid rgba(15,23,42,0.08); background:#fff; cursor:pointer; transition:transform 0.12s ease, box-shadow 0.12s ease; }
    .memo-deck-card:hover { transform:translateY(-2px); box-shadow:0 12px 24px rgba(15,23,42,0.12); }
    .memo-deck-card.active { border-color:#2563eb; box-shadow:0 0 0 2px rgba(37,99,235,0.25); }
    .memo-deck-name { font-weight:600; font-size:15px; display:flex; align-items:center; gap:8px; }
    .memo-deck-metrics { margin-top:8px; display:flex; gap:12px; font-size:12px; color:#475569; flex-wrap:wrap; }
    .memo-deck-progress { height:6px; border-radius:999px; background:rgba(15,23,42,0.08); margin-top:10px; overflow:hidden; }
    .memo-deck-progress span { display:block; height:100%; border-radius:999px; }
    .memo-sidebar-controls { display:flex; flex-direction:column; gap:8px; }
    .memo-sidebar button, .memo-sidebar select { border-radius:10px; border:1px solid rgba(15,23,42,0.12); padding:8px 12px; background:#fff; font-weight:600; color:#0f172a; cursor:pointer; transition:background 0.1s ease, box-shadow 0.1s ease; }
    .memo-sidebar button:hover { background:rgba(37,99,235,0.08); }
    .memo-tag-filter { display:flex; flex-direction:column; gap:6px; font-size:12px; color:#475569; }
    .memo-tag-filter input { border-radius:8px; border:1px solid rgba(15,23,42,0.12); padding:6px 10px; font-size:13px; }
    .memo-main { flex:1; display:flex; flex-direction:column; gap:16px; }
    .memo-card-form { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:12px; background:#fff; padding:16px; border-radius:16px; box-shadow:0 18px 36px rgba(15,23,42,0.12); border:1px solid rgba(148,163,184,0.2); }
    .memo-card-form h3 { grid-column:1/-1; margin:0 0 6px 0; font-size:16px; color:#2563eb; display:flex; gap:8px; align-items:center; }
    .memo-card-form label { display:flex; flex-direction:column; gap:6px; font-size:13px; font-weight:600; color:#334155; }
    .memo-card-form input[type="text"], .memo-card-form textarea, .memo-card-form select { border-radius:10px; border:1px solid rgba(15,23,42,0.15); padding:8px 10px; font-size:13px; font-family:inherit; resize:vertical; min-height:42px; }
    .memo-card-form textarea { min-height:90px; }
    .memo-card-form button[type="submit"] { grid-column:1/-1; justify-self:end; border-radius:10px; padding:8px 16px; background:linear-gradient(120deg,#2563eb,#7c3aed); color:#fff; border:none; font-weight:600; cursor:pointer; box-shadow:0 10px 24px rgba(37,99,235,0.35); }
    .memo-card-form button[type="submit"]:hover { transform:translateY(-1px); }
    .memo-preview { background:rgba(148,163,184,0.12); border-radius:12px; padding:12px; font-size:13px; line-height:1.6; color:#0f172a; min-height:120px; overflow:auto; }
    .memo-review-card { background:#fff; border-radius:18px; padding:20px; box-shadow:0 22px 48px rgba(15,23,42,0.16); border:1px solid rgba(148,163,184,0.25); display:flex; flex-direction:column; gap:16px; min-height:240px; position:relative; }
    .memo-review-header { display:flex; justify-content:space-between; align-items:center; font-size:14px; color:#475569; }
    .memo-review-body { flex:1; display:flex; flex-direction:column; gap:12px; }
    .memo-review-front { font-size:20px; font-weight:700; color:#0f172a; }
    .memo-review-hint { font-size:13px; color:#475569; }
    .memo-review-answer { background:rgba(59,130,246,0.08); padding:14px; border-radius:12px; font-size:16px; line-height:1.6; color:#0f172a; display:none; }
    .memo-review-answer.visible { display:block; }
    .memo-review-controls { display:flex; flex-wrap:wrap; gap:10px; }
    .memo-review-controls button { flex:1; min-width:120px; border-radius:12px; padding:10px 14px; border:none; font-weight:600; cursor:pointer; color:#fff; box-shadow:0 12px 24px rgba(15,23,42,0.18); }
    .memo-btn-show { background:linear-gradient(120deg,#14b8a6,#0ea5e9); }
    .memo-btn-good { background:linear-gradient(120deg,#22c55e,#16a34a); }
    .memo-btn-hard { background:linear-gradient(120deg,#facc15,#f97316); color:#0f172a; }
    .memo-btn-again { background:linear-gradient(120deg,#ef4444,#dc2626); }
    .memo-btn-note { background:linear-gradient(120deg,#6366f1,#8b5cf6); }
    .memo-hud { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:12px; }
    .memo-hud-card { background:#fff; border-radius:14px; padding:12px; border:1px solid rgba(148,163,184,0.2); box-shadow:0 12px 28px rgba(15,23,42,0.12); display:flex; flex-direction:column; gap:6px; }
    .memo-hud-card span { font-size:12px; color:#64748b; }
    .memo-hud-card strong { font-size:20px; color:#0f172a; }
    .memo-sparkline { width:100%; height:64px; background:#fff; border-radius:12px; border:1px solid rgba(148,163,184,0.18); padding:10px; box-shadow:inset 0 0 0 1px rgba(148,163,184,0.08); }
    .memo-sparkline canvas { width:100%; height:44px; }
    .memo-empty { font-size:14px; color:#64748b; text-align:center; padding:24px 0; }
    .memo-note-overlay { position:fixed; inset:0; background:rgba(15,23,42,0.45); display:flex; align-items:center; justify-content:center; z-index:9999; }
    .memo-note-dialog { width:min(480px, 90%); background:#fff; border-radius:16px; padding:20px; box-shadow:0 28px 56px rgba(15,23,42,0.4); display:flex; flex-direction:column; gap:14px; }
    .memo-note-dialog textarea { min-height:180px; border-radius:12px; border:1px solid rgba(15,23,42,0.12); padding:12px; font-family:inherit; font-size:14px; }
    .memo-note-actions { display:flex; justify-content:flex-end; gap:8px; }
    .memo-note-actions button { border:none; border-radius:10px; padding:8px 14px; font-weight:600; cursor:pointer; }
    .memo-note-close { background:rgba(148,163,184,0.16); color:#334155; }
    .memo-note-save { background:linear-gradient(120deg,#2563eb,#7c3aed); color:#fff; }
    .memo-tooltip { position:absolute; background:#0f172a; color:#fff; padding:6px 10px; border-radius:8px; font-size:11px; pointer-events:none; box-shadow:0 12px 24px rgba(15,23,42,0.3); opacity:0; transform:translateY(-6px); transition:opacity 0.15s ease, transform 0.15s ease; }
    .memo-tooltip.visible { opacity:1; transform:translateY(0); }
  `;

  function ensureStyle(){
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = BASE_STYLE;
    document.head.appendChild(style);
  }

  function uuid(){
    return 'xxxx-4xxx-yxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function safeParse(json){
    try {
      const parsed = JSON.parse(json);
      if (!parsed || typeof parsed !== 'object') return null;
      return parsed;
    } catch {
      return null;
    }
  }

  function loadPersistentState(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = safeParse(raw);
      if (!parsed) return null;
      if (!Array.isArray(parsed.decks)) parsed.decks = [];
      if (!Array.isArray(parsed.stats)) parsed.stats = [];
      if (!parsed.lastSession || typeof parsed.lastSession !== 'object') parsed.lastSession = { reviewed:0, correct:0, xp:0, timeSpentMs:0 };
      return parsed;
    } catch {
      return null;
    }
  }

  function persistState(state){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }

  function todayKey(date){
    const d = date ? new Date(date) : new Date();
    return d.toISOString().slice(0,10);
  }

  function daysToMs(days){
    return Math.round(days * 86400000);
  }

  function sanitizeHtml(str){
    return String(str || '').replace(/[&<>"]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
  }

  function markdownToHtml(text){
    let html = sanitizeHtml(text);
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/`(.+?)`/g, '<code>$1</code>');
    html = html.replace(/\n/g, '<br>');
    return html;
  }

  function clamp(value, min, max){
    return Math.max(min, Math.min(max, value));
  }

  function calculateDueCount(deck){
    const now = Date.now();
    let due = 0;
    deck.cards.forEach(card => {
      const dueTime = card && card.due ? Date.parse(card.due) : 0;
      if (!dueTime || dueTime <= now) due++;
    });
    return due;
  }

  function calculateAccuracy(deck){
    const total = deck.cards.reduce((acc, c) => acc + (c.totalReviews || 0), 0);
    if (!total) return 1;
    const correct = deck.cards.reduce((acc, c) => acc + (c.correctStreak || 0), 0);
    return total ? clamp(correct / total, 0, 1) : 1;
  }

  function create(root, awardXp, opts){
    if (!root) throw new Error('MiniExp Memo Studio requires a container');
    ensureStyle();

    const difficulty = (opts && opts.difficulty) || 'NORMAL';
    const xpMultiplier = difficulty === 'HARD' ? 1.25 : difficulty === 'EASY' ? 0.8 : 1;

    const data = loadPersistentState() || createDefaultData();
    const runtime = {
      sessionXp: 0,
      reviewed: 0,
      correct: 0,
      queue: [],
      current: null,
      showingAnswer: false,
      filterTag: '',
      selectedDeckId: getInitialDeckId(data),
      tooltip: null,
      timer: null,
      sessionStart: Date.now(),
      hoveredStatAwarded: false,
      nextBonusMilestone: 10,
      frameListeners: []
    };

    const wrapper = document.createElement('div');
    wrapper.className = 'memo-studio-root';

    const sidebar = document.createElement('div');
    sidebar.className = 'memo-sidebar';

    const sidebarHeader = document.createElement('div');
    sidebarHeader.className = 'memo-sidebar-header';
    const title = document.createElement('h2');
    title.textContent = '暗記スタジオ';
    const badge = document.createElement('span');
    badge.textContent = 'TOY MOD';
    title.appendChild(badge);
    sidebarHeader.appendChild(title);
    sidebar.appendChild(sidebarHeader);

    const deckList = document.createElement('div');
    deckList.className = 'memo-deck-list';
    sidebar.appendChild(deckList);

    const sidebarControls = document.createElement('div');
    sidebarControls.className = 'memo-sidebar-controls';

    const addDeckBtn = document.createElement('button');
    addDeckBtn.type = 'button';
    addDeckBtn.textContent = '＋ デッキ追加';
    sidebarControls.appendChild(addDeckBtn);

    const exportBtn = document.createElement('button');
    exportBtn.type = 'button';
    exportBtn.textContent = 'エクスポート (JSON)';
    sidebarControls.appendChild(exportBtn);

    const importBtn = document.createElement('button');
    importBtn.type = 'button';
    importBtn.textContent = 'インポート (JSON)';
    sidebarControls.appendChild(importBtn);

    const tagFilterBox = document.createElement('div');
    tagFilterBox.className = 'memo-tag-filter';
    const tagFilterLabel = document.createElement('label');
    tagFilterLabel.textContent = 'タグフィルター';
    const tagFilterInput = document.createElement('input');
    tagFilterInput.type = 'text';
    tagFilterInput.placeholder = 'カンマ区切りで入力';
    tagFilterBox.appendChild(tagFilterLabel);
    tagFilterBox.appendChild(tagFilterInput);

    sidebar.appendChild(sidebarControls);
    sidebar.appendChild(tagFilterBox);

    const hiddenImport = document.createElement('input');
    hiddenImport.type = 'file';
    hiddenImport.accept = '.json,application/json';
    hiddenImport.style.display = 'none';
    sidebar.appendChild(hiddenImport);

    const main = document.createElement('div');
    main.className = 'memo-main';

    const cardForm = document.createElement('form');
    cardForm.className = 'memo-card-form';

    const formTitle = document.createElement('h3');
    formTitle.textContent = 'カード登録';
    cardForm.appendChild(formTitle);

    const frontField = createField('表面 (タイトル)', 'text');
    const backField = createTextAreaField('裏面 (解答)');
    const hintField = createTextAreaField('ヒント / 説明 (任意)');
    const tagsField = createField('タグ (カンマ区切り)', 'text');
    const intervalField = createField('初期間隔（日）', 'number');
    intervalField.input.min = '1';
    intervalField.input.value = '1';

    cardForm.appendChild(frontField.wrapper);
    cardForm.appendChild(backField.wrapper);
    cardForm.appendChild(hintField.wrapper);
    cardForm.appendChild(tagsField.wrapper);
    cardForm.appendChild(intervalField.wrapper);

    const previewWrapper = document.createElement('div');
    previewWrapper.className = 'memo-preview';
    previewWrapper.innerHTML = '<em>入力するとプレビューが表示されます。</em>';
    const previewLabel = document.createElement('label');
    previewLabel.textContent = '裏面プレビュー';
    previewLabel.style.display = 'flex';
    previewLabel.style.flexDirection = 'column';
    previewLabel.style.gap = '6px';
    previewLabel.appendChild(previewWrapper);
    cardForm.appendChild(previewLabel);

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = 'カードを追加';
    cardForm.appendChild(submitBtn);

    const reviewCard = document.createElement('div');
    reviewCard.className = 'memo-review-card';

    const reviewHeader = document.createElement('div');
    reviewHeader.className = 'memo-review-header';
    const reviewDeckName = document.createElement('span');
    const reviewQueueInfo = document.createElement('span');
    reviewHeader.appendChild(reviewDeckName);
    reviewHeader.appendChild(reviewQueueInfo);
    reviewCard.appendChild(reviewHeader);

    const reviewBody = document.createElement('div');
    reviewBody.className = 'memo-review-body';
    const reviewFront = document.createElement('div');
    reviewFront.className = 'memo-review-front';
    const reviewHint = document.createElement('div');
    reviewHint.className = 'memo-review-hint';
    const reviewAnswer = document.createElement('div');
    reviewAnswer.className = 'memo-review-answer';
    reviewBody.appendChild(reviewFront);
    reviewBody.appendChild(reviewHint);
    reviewBody.appendChild(reviewAnswer);
    reviewCard.appendChild(reviewBody);

    const reviewControls = document.createElement('div');
    reviewControls.className = 'memo-review-controls';

    const showBtn = document.createElement('button');
    showBtn.type = 'button';
    showBtn.className = 'memo-btn-show';
    showBtn.textContent = '表示';

    const goodBtn = document.createElement('button');
    goodBtn.type = 'button';
    goodBtn.className = 'memo-btn-good';
    goodBtn.textContent = '覚えた';

    const hardBtn = document.createElement('button');
    hardBtn.type = 'button';
    hardBtn.className = 'memo-btn-hard';
    hardBtn.textContent = '難しい';

    const againBtn = document.createElement('button');
    againBtn.type = 'button';
    againBtn.className = 'memo-btn-again';
    againBtn.textContent = '再学習';

    const noteBtn = document.createElement('button');
    noteBtn.type = 'button';
    noteBtn.className = 'memo-btn-note';
    noteBtn.textContent = 'ノート';

    reviewControls.appendChild(showBtn);
    reviewControls.appendChild(goodBtn);
    reviewControls.appendChild(hardBtn);
    reviewControls.appendChild(againBtn);
    reviewControls.appendChild(noteBtn);
    reviewCard.appendChild(reviewControls);

    const hud = document.createElement('div');
    hud.className = 'memo-hud';

    const hudCards = [
      createHudCard('レビュー済み'),
      createHudCard('正答率'),
      createHudCard('経過時間'),
      createHudCard('セッションEXP')
    ];
    hudCards.forEach(card => hud.appendChild(card.wrapper));

    const sparklineBox = document.createElement('div');
    sparklineBox.className = 'memo-sparkline';
    const sparklineCanvas = document.createElement('canvas');
    const sparklineCtx = sparklineCanvas.getContext('2d');
    sparklineBox.appendChild(sparklineCanvas);

    const tooltip = document.createElement('div');
    tooltip.className = 'memo-tooltip';
    reviewCard.appendChild(tooltip);
    runtime.tooltip = tooltip;

    main.appendChild(cardForm);
    main.appendChild(reviewCard);
    main.appendChild(hud);
    main.appendChild(sparklineBox);

    wrapper.appendChild(sidebar);
    wrapper.appendChild(main);
    root.appendChild(wrapper);

    runtime.frameListeners.push({ target: hiddenImport, type: 'change', handler: handleImport });
    runtime.frameListeners.push({ target: sparklineCanvas, type: 'mousemove', handler: handleSparklineHover });
    runtime.frameListeners.push({ target: sparklineCanvas, type: 'mouseleave', handler: handleSparklineLeave });
    runtime.frameListeners.forEach(l => l.target.addEventListener(l.type, l.handler));

    addDeckBtn.addEventListener('click', () => {
      const name = prompt('新しいデッキ名を入力してください', '新しいデッキ');
      if (!name) return;
      const deck = createDeck(name.trim());
      data.decks.push(deck);
      runtime.selectedDeckId = deck.id;
      persist();
      renderDeckList();
      rebuildQueue();
      beginNextCard();
    });

    exportBtn.addEventListener('click', () => {
      const payload = JSON.stringify(data, null, 2);
      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `memo-studio-${todayKey()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 0);
    });

    importBtn.addEventListener('click', () => {
      hiddenImport.value = '';
      hiddenImport.click();
    });

    tagFilterInput.addEventListener('input', () => {
      runtime.filterTag = tagFilterInput.value;
      rebuildQueue();
      beginNextCard();
    });

    cardForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const deck = getSelectedDeck();
      if (!deck) return;
      const front = frontField.input.value.trim();
      const back = backField.input.value.trim();
      const hint = hintField.input.value.trim();
      const tags = tagsField.input.value.split(',').map(t => t.trim()).filter(Boolean);
      const initialInterval = Math.max(1, parseInt(intervalField.input.value, 10) || 1);
      if (!front || !back) {
        alert('表面と裏面は必須です。');
        return;
      }
      const now = new Date();
      const card = {
        id: 'card-' + uuid(),
        front,
        back,
        hint,
        tags,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        ease: 2.5,
        interval: initialInterval,
        due: new Date(Date.now() + daysToMs(initialInterval)).toISOString(),
        lapses: 0,
        totalReviews: 0,
        correctStreak: 0,
        note: ''
      };
      deck.cards.push(card);
      persist();
      rebuildQueue();
      beginNextCard();
      award('add_card', 6);
      cardForm.reset();
      intervalField.input.value = '1';
      previewWrapper.innerHTML = '<em>入力するとプレビューが表示されます。</em>';
    });

    backField.input.addEventListener('input', () => {
      if (backField.input.value.trim()) {
        previewWrapper.innerHTML = markdownToHtml(backField.input.value);
      } else {
        previewWrapper.innerHTML = '<em>入力するとプレビューが表示されます。</em>';
      }
    });

    showBtn.addEventListener('click', () => {
      runtime.showingAnswer = true;
      updateReviewCard();
    });

    goodBtn.addEventListener('click', () => handleReview('good'));
    hardBtn.addEventListener('click', () => handleReview('hard'));
    againBtn.addEventListener('click', () => handleReview('again'));
    noteBtn.addEventListener('click', () => openNoteEditor(runtime.current));

    function handleImport(){
      const file = hiddenImport.files && hiddenImport.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const text = typeof reader.result === 'string' ? reader.result : '';
        const parsed = safeParse(text);
        if (!parsed) {
          alert('JSON を読み取れませんでした。');
          return;
        }
        if (Array.isArray(parsed.decks)) {
          parsed.decks.forEach(deck => {
            if (!deck || typeof deck !== 'object') return;
            if (!deck.id) deck.id = 'deck-' + uuid();
            if (!Array.isArray(deck.cards)) deck.cards = [];
            deck.cards.forEach(card => {
              if (!card.id) card.id = 'card-' + uuid();
              if (!card.createdAt) card.createdAt = new Date().toISOString();
              if (!card.updatedAt) card.updatedAt = card.createdAt;
              if (!card.due) card.due = new Date().toISOString();
              if (!Array.isArray(card.tags)) card.tags = [];
            });
            data.decks.push(deck);
          });
        }
        if (Array.isArray(parsed.stats)) data.stats = mergeStats(data.stats, parsed.stats);
        persist();
        renderDeckList();
        rebuildQueue();
        beginNextCard();
        award('import', 10);
      };
      reader.onerror = () => alert('ファイルの読み込みに失敗しました。');
      reader.readAsText(file, 'utf-8');
    }

    function handleSparklineHover(ev){
      const rect = sparklineCanvas.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const stats = data.stats.slice(-60);
      if (!stats.length) return;
      const step = rect.width / stats.length;
      const index = clamp(Math.floor(x / step), 0, stats.length - 1);
      const stat = stats[index];
      if (!stat) return;
      const accuracy = stat.reviewed ? Math.round((stat.correct / stat.reviewed) * 100) : 0;
      tooltip.textContent = `${stat.date} / ${stat.reviewed}枚 / ${accuracy}% / ${Math.round(stat.xp)}XP`;
      tooltip.style.left = `${ev.clientX - reviewCard.getBoundingClientRect().left + 12}px`;
      tooltip.style.top = `${ev.clientY - reviewCard.getBoundingClientRect().top - 32}px`;
      tooltip.classList.add('visible');
      if (!runtime.hoveredStatAwarded) {
        runtime.hoveredStatAwarded = true;
        award('stat_hover', 2);
      }
    }

    function handleSparklineLeave(){
      tooltip.classList.remove('visible');
    }

    function mergeStats(existing, incoming){
      const map = new Map();
      existing.concat(incoming).forEach(item => {
        if (!item || !item.date) return;
        const key = item.date;
        const prev = map.get(key) || { date:key, reviewed:0, correct:0, xp:0, timeSpentMs:0 };
        map.set(key, {
          date:key,
          reviewed: prev.reviewed + (item.reviewed || 0),
          correct: prev.correct + (item.correct || 0),
          xp: prev.xp + (item.xp || 0),
          timeSpentMs: prev.timeSpentMs + (item.timeSpentMs || 0)
        });
      });
      return Array.from(map.values()).sort((a,b) => a.date.localeCompare(b.date)).slice(-90);
    }

    function rebuildQueue(){
      const deck = getSelectedDeck();
      if (!deck) {
        runtime.queue = [];
        return;
      }
      const tags = runtime.filterTag.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
      const now = Date.now();
      const due = [];
      const later = [];
      deck.cards.forEach(card => {
        if (!card) return;
        if (tags.length && !tags.every(tag => (card.tags || []).some(ct => ct.toLowerCase().includes(tag)))) return;
        const dueTime = card.due ? Date.parse(card.due) : 0;
        if (!dueTime || dueTime <= now) due.push(card);
        else later.push(card);
      });
      due.sort((a,b) => Date.parse(a.due || 0) - Date.parse(b.due || 0));
      later.sort((a,b) => Date.parse(a.due || 0) - Date.parse(b.due || 0));
      runtime.queue = due.concat(later.slice(0, 10));
    }

    function beginNextCard(){
      runtime.current = runtime.queue.shift() || null;
      runtime.showingAnswer = false;
      updateReviewCard();
      renderHud();
      renderSparkline();
    }

    function updateReviewCard(){
      const deck = getSelectedDeck();
      reviewDeckName.textContent = deck ? `${deck.name} (${deck.cards.length}枚)` : 'デッキ未選択';
      reviewQueueInfo.textContent = deck ? `残り ${runtime.queue.length + (runtime.current ? 1 : 0)} 枚` : '';
      if (!runtime.current) {
        reviewFront.innerHTML = '<div class="memo-empty">レビュー対象のカードはありません。追加またはインポートしてください。</div>';
        reviewHint.textContent = '';
        reviewAnswer.classList.remove('visible');
        reviewAnswer.innerHTML = '';
        showBtn.disabled = true;
        goodBtn.disabled = true;
        hardBtn.disabled = true;
        againBtn.disabled = true;
        noteBtn.disabled = true;
        return;
      }
      showBtn.disabled = false;
      goodBtn.disabled = false;
      hardBtn.disabled = false;
      againBtn.disabled = false;
      noteBtn.disabled = false;
      reviewFront.textContent = runtime.current.front;
      reviewHint.textContent = runtime.current.hint ? `ヒント: ${runtime.current.hint}` : '';
      reviewAnswer.innerHTML = markdownToHtml(runtime.current.back);
      reviewAnswer.classList.toggle('visible', runtime.showingAnswer);
    }

    function renderDeckList(){
      deckList.innerHTML = '';
      if (!data.decks.length) {
        const empty = document.createElement('div');
        empty.className = 'memo-empty';
        empty.textContent = 'デッキがありません。追加してください。';
        deckList.appendChild(empty);
        return;
      }
      data.decks.forEach(deck => {
        const card = document.createElement('div');
        card.className = 'memo-deck-card';
        if (deck.id === runtime.selectedDeckId) card.classList.add('active');

        const name = document.createElement('div');
        name.className = 'memo-deck-name';
        const swatch = document.createElement('span');
        swatch.style.display = 'inline-flex';
        swatch.style.width = '12px';
        swatch.style.height = '12px';
        swatch.style.borderRadius = '999px';
        swatch.style.background = deck.color || '#2563eb';
        name.appendChild(swatch);
        const label = document.createElement('span');
        label.textContent = deck.name;
        name.appendChild(label);

        const metrics = document.createElement('div');
        metrics.className = 'memo-deck-metrics';
        const totalSpan = document.createElement('span');
        totalSpan.textContent = `${deck.cards.length}枚`;
        const dueSpan = document.createElement('span');
        dueSpan.textContent = `期限 ${calculateDueCount(deck)}枚`;
        const accuracySpan = document.createElement('span');
        accuracySpan.textContent = `達成率 ${(calculateAccuracy(deck) * 100 | 0)}%`;
        metrics.appendChild(totalSpan);
        metrics.appendChild(dueSpan);
        metrics.appendChild(accuracySpan);

        const progress = document.createElement('div');
        progress.className = 'memo-deck-progress';
        const bar = document.createElement('span');
        const ratio = deck.cards.length ? clamp((deck.cards.length - calculateDueCount(deck)) / deck.cards.length, 0, 1) : 0;
        bar.style.width = `${Math.round(ratio * 100)}%`;
        bar.style.background = deck.color || '#2563eb';
        progress.appendChild(bar);

        card.appendChild(name);
        card.appendChild(metrics);
        card.appendChild(progress);
        card.addEventListener('click', () => {
          runtime.selectedDeckId = deck.id;
          renderDeckList();
          rebuildQueue();
          beginNextCard();
        });
        deckList.appendChild(card);
      });
    }

    function handleReview(result){
      if (!runtime.current) return;
      applyReview(runtime.current, result);
      runtime.reviewed += 1;
      if (result === 'good') runtime.correct += 1;
      const xp = result === 'good' ? 4 : result === 'hard' ? 3 : 2;
      award(`review_${result}`, xp);
      if (runtime.reviewed >= runtime.nextBonusMilestone) {
        award('review_bonus', 8);
        runtime.nextBonusMilestone += 10;
      }
      updateDailyStats({ reviewed: 1, correct: result === 'good' ? 1 : 0 });
      persist();
      renderDeckList();
      rebuildQueue();
      beginNextCard();
    }

    function applyReview(card, outcome){
      const now = Date.now();
      const ease = typeof card.ease === 'number' ? card.ease : 2.5;
      let interval = Math.max(1, card.interval || 1);
      let nextEase = ease;
      if (outcome === 'good') {
        interval = Math.max(1, Math.round(interval * ease));
        nextEase = clamp(ease + 0.05, 1.3, 3.0);
        card.correctStreak = (card.correctStreak || 0) + 1;
      } else if (outcome === 'hard') {
        interval = Math.max(1, Math.round(interval * 0.5));
        nextEase = clamp(ease - 0.15, 1.3, 3.0);
        card.correctStreak = Math.max(0, (card.correctStreak || 0) - 1);
      } else {
        interval = 1;
        nextEase = clamp(ease - 0.3, 1.3, 3.0);
        card.correctStreak = 0;
        card.lapses = (card.lapses || 0) + 1;
      }
      card.interval = interval;
      card.ease = nextEase;
      card.totalReviews = (card.totalReviews || 0) + 1;
      card.updatedAt = new Date().toISOString();
      card.due = new Date(now + daysToMs(interval)).toISOString();
    }

    function renderHud(){
      const elapsedMs = Date.now() - runtime.sessionStart;
      const accuracy = runtime.reviewed ? Math.round((runtime.correct / runtime.reviewed) * 100) : 0;
      hudCards[0].value.textContent = `${runtime.reviewed}枚`;
      hudCards[1].value.textContent = `${accuracy}%`;
      hudCards[2].value.textContent = formatDuration(elapsedMs);
      hudCards[3].value.textContent = `${Math.round(runtime.sessionXp)}XP`;
    }

    function formatDuration(ms){
      const totalSec = Math.floor(ms / 1000);
      const m = Math.floor(totalSec / 60);
      const s = totalSec % 60;
      return `${m}分${s.toString().padStart(2,'0')}秒`;
    }

    function renderSparkline(){
      const stats = data.stats.slice(-60);
      const width = sparklineCanvas.clientWidth || 320;
      const height = sparklineCanvas.clientHeight || 44;
      sparklineCanvas.width = width * window.devicePixelRatio;
      sparklineCanvas.height = height * window.devicePixelRatio;
      sparklineCtx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
      sparklineCtx.clearRect(0, 0, width, height);
      if (!stats.length) {
        sparklineCtx.fillStyle = '#94a3b8';
        sparklineCtx.font = '12px "Segoe UI"';
        sparklineCtx.fillText('履歴なし', 8, height / 2);
        return;
      }
      const maxReviewed = Math.max(...stats.map(s => s.reviewed || 0), 1);
      const step = width / Math.max(1, stats.length - 1);
      sparklineCtx.strokeStyle = '#2563eb';
      sparklineCtx.lineWidth = 2;
      sparklineCtx.beginPath();
      stats.forEach((stat, index) => {
        const x = step * index;
        const ratio = maxReviewed ? (stat.reviewed || 0) / maxReviewed : 0;
        const y = height - ratio * (height - 6) - 3;
        if (index === 0) sparklineCtx.moveTo(x, y);
        else sparklineCtx.lineTo(x, y);
      });
      sparklineCtx.stroke();
      sparklineCtx.fillStyle = '#f87171';
      stats.forEach((stat, index) => {
        const x = step * index;
        const accuracy = stat.reviewed ? stat.correct / stat.reviewed : 0;
        const y = height - accuracy * (height - 6) - 3;
        sparklineCtx.beginPath();
        sparklineCtx.arc(x, y, 3, 0, Math.PI * 2);
        sparklineCtx.fill();
      });
    }

    function openNoteEditor(card){
      if (!card) return;
      const overlay = document.createElement('div');
      overlay.className = 'memo-note-overlay';
      const dialog = document.createElement('div');
      dialog.className = 'memo-note-dialog';
      const title = document.createElement('h3');
      title.textContent = `${card.front} のノート`;
      const textarea = document.createElement('textarea');
      textarea.value = card.note || '';
      const actions = document.createElement('div');
      actions.className = 'memo-note-actions';
      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.className = 'memo-note-close';
      cancelBtn.textContent = '閉じる';
      const saveBtn = document.createElement('button');
      saveBtn.type = 'button';
      saveBtn.className = 'memo-note-save';
      saveBtn.textContent = '保存';
      actions.appendChild(cancelBtn);
      actions.appendChild(saveBtn);
      dialog.appendChild(title);
      dialog.appendChild(textarea);
      dialog.appendChild(actions);
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);

      const close = () => {
        document.body.removeChild(overlay);
        window.removeEventListener('keydown', handleKey);
      };

      const handleKey = (ev) => {
        if (ev.key === 'Escape') close();
      };
      window.addEventListener('keydown', handleKey);

      cancelBtn.addEventListener('click', close);
      saveBtn.addEventListener('click', () => {
        card.note = textarea.value;
        card.updatedAt = new Date().toISOString();
        persist();
        award('note', 1);
        close();
      });
    }

    function createHudCard(title){
      const wrapper = document.createElement('div');
      wrapper.className = 'memo-hud-card';
      const label = document.createElement('span');
      label.textContent = title;
      const value = document.createElement('strong');
      value.textContent = '0';
      wrapper.appendChild(label);
      wrapper.appendChild(value);
      return { wrapper, value };
    }

    function createField(labelText, type){
      const wrapper = document.createElement('label');
      wrapper.textContent = labelText;
      const input = document.createElement('input');
      input.type = type;
      wrapper.appendChild(input);
      return { wrapper, input };
    }

    function createTextAreaField(labelText){
      const wrapper = document.createElement('label');
      wrapper.textContent = labelText;
      const textarea = document.createElement('textarea');
      wrapper.appendChild(textarea);
      return { wrapper, input: textarea };
    }

    function createDeck(name){
      const now = new Date();
      return {
        id: 'deck-' + uuid(),
        name: name || '新しいデッキ',
        color: randomColor(),
        createdAt: now.toISOString(),
        reviewOrder: 'due',
        active: true,
        cards: []
      };
    }

    function randomColor(){
      const palette = ['#2563eb','#7c3aed','#ec4899','#f97316','#22c55e','#14b8a6'];
      return palette[Math.floor(Math.random() * palette.length)];
    }

    function createDefaultData(){
      const deck = createDeck('スターターデッキ');
      const now = new Date();
      deck.cards = [
        { id:'card-'+uuid(), front:'HTML', back:'HyperText Markup Language', hint:'Webページの骨組み', tags:['Web'], createdAt:now.toISOString(), updatedAt:now.toISOString(), ease:2.5, interval:1, due:now.toISOString(), lapses:0, totalReviews:0, correctStreak:0, note:'' },
        { id:'card-'+uuid(), front:'CSS', back:'Cascading Style Sheets', hint:'見た目を装飾', tags:['Web'], createdAt:now.toISOString(), updatedAt:now.toISOString(), ease:2.5, interval:1, due:now.toISOString(), lapses:0, totalReviews:0, correctStreak:0, note:'' },
        { id:'card-'+uuid(), front:'JavaScript', back:'ブラウザで動作するプログラミング言語', hint:'インタラクティブ', tags:['Web'], createdAt:now.toISOString(), updatedAt:now.toISOString(), ease:2.5, interval:1, due:now.toISOString(), lapses:0, totalReviews:0, correctStreak:0, note:'' }
      ];
      return { decks:[deck], stats:[], lastSession:{ reviewed:0, correct:0, xp:0, timeSpentMs:0 } };
    }

    function getInitialDeckId(data){
      if (!data.decks.length) return null;
      const active = data.decks.find(d => d.active);
      return (active || data.decks[0]).id;
    }

    function getSelectedDeck(){
      return data.decks.find(deck => deck.id === runtime.selectedDeckId) || data.decks[0] || null;
    }

    function award(type, base){
      if (!awardXp || !base) return 0;
      const amount = Math.max(0, Math.round(base * xpMultiplier));
      if (!amount) return 0;
      try {
        const gained = awardXp(amount, { type, source:'memo_studio' });
        const num = Number(gained);
        if (Number.isFinite(num)) {
          runtime.sessionXp += num;
          updateDailyStats({ xp:num });
        }
        return gained;
      } catch {
        return 0;
      }
    }

    function updateDailyStats({ reviewed = 0, correct = 0, xp = 0, time = 0 }){
      const key = todayKey();
      let stat = data.stats.find(s => s.date === key);
      if (!stat) {
        stat = { date:key, reviewed:0, correct:0, xp:0, timeSpentMs:0 };
        data.stats.push(stat);
      }
      stat.reviewed += reviewed;
      stat.correct += correct;
      stat.xp += xp;
      stat.timeSpentMs += time;
      data.stats = data.stats.slice(-90);
    }

    function persist(){
      data.lastSession = data.lastSession || { reviewed:0, correct:0, xp:0, timeSpentMs:0 };
      data.lastSession.reviewed = runtime.reviewed;
      data.lastSession.correct = runtime.correct;
      data.lastSession.xp = runtime.sessionXp;
      data.lastSession.timeSpentMs = Date.now() - runtime.sessionStart;
      persistState(data);
    }

    function tick(){
      updateDailyStats({ time:1000 });
      renderHud();
      persist();
    }

    function start(){
      if (runtime.timer) return;
      runtime.timer = setInterval(tick, 1000);
    }

    function stop(){
      if (!runtime.timer) return;
      clearInterval(runtime.timer);
      runtime.timer = null;
    }

    function destroy(){
      stop();
      runtime.frameListeners.forEach(l => l.target.removeEventListener(l.type, l.handler));
      persist();
      try { root.removeChild(wrapper); } catch {}
    }

    renderDeckList();
    rebuildQueue();
    beginNextCard();
    start();

    return {
      start,
      stop,
      destroy,
      getScore(){ return runtime.sessionXp; }
    };
  }

  window.registerMiniGame({
    id: 'memo_studio',
    name: '暗記スタジオ',
    description: 'フラッシュカードを登録して間隔反復で学習。操作でEXPを獲得',
    category: 'トイ',
    version: '0.1.0',
    author: 'mod',
    create
  });
})();

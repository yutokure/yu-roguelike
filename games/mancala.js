(function(){
  'use strict';

  const PIT_COUNT = 6;
  const INITIAL_SEEDS = { EASY: 3, NORMAL: 4, HARD: 5 };
  const XP_MULTIPLIER = { EASY: 0.8, NORMAL: 1, HARD: 1.2 };
  const AI_THINK_TIME = { EASY: 900, NORMAL: 650, HARD: 450 };

  function ensureStyles(){
    if (document.getElementById('mini-mancala-style')) return;
    const style = document.createElement('style');
    style.id = 'mini-mancala-style';
    style.textContent = `
      .mini-mancala-root {
        font-family: 'Hiragino Sans', 'Yu Gothic', sans-serif;
        color: #1f2a44;
        display: flex;
        flex-direction: column;
        gap: 12px;
        height: 100%;
      }
      .mini-mancala-root .mancala-info {
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 12px;
        align-items: center;
        background: linear-gradient(120deg, #e8f0ff, #f5f9ff);
        border-radius: 12px;
        padding: 10px 16px;
        box-shadow: inset 0 0 0 1px rgba(31,42,68,0.08);
      }
      .mini-mancala-root .mancala-status {
        font-weight: 600;
        font-size: 1.1rem;
      }
      .mini-mancala-root .mancala-score {
        font-weight: 600;
        display: flex;
        gap: 12px;
        align-items: baseline;
      }
      .mini-mancala-root .mancala-score span {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        border-radius: 999px;
        background: rgba(31,42,68,0.08);
      }
      .mini-mancala-root .mancala-actions {
        display: flex;
        gap: 8px;
      }
      .mini-mancala-root button.mini {
        border: none;
        background: #3055ff;
        color: #fff;
        border-radius: 999px;
        padding: 6px 14px;
        cursor: pointer;
        font-weight: 600;
        transition: transform 0.15s, box-shadow 0.15s;
      }
      .mini-mancala-root button.mini:disabled {
        background: #a3b4f7;
        cursor: default;
        box-shadow: none;
      }
      .mini-mancala-root button.mini:not(:disabled):hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(48,85,255,0.25);
      }
      .mini-mancala-root .mancala-board {
        flex: 1 1 auto;
        min-height: 260px;
        background: radial-gradient(circle at top, #f6f8ff 0%, #dde6ff 100%);
        border-radius: 20px;
        padding: 18px;
        box-shadow: inset 0 0 0 1px rgba(31,42,68,0.08), 0 14px 30px rgba(15,28,63,0.16);
        display: grid;
        grid-template-columns: minmax(90px, 120px) 1fr minmax(90px, 120px);
        gap: 16px;
        align-items: stretch;
      }
      .mini-mancala-root .store {
        background: rgba(255,255,255,0.85);
        border-radius: 18px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: inset 0 0 0 2px rgba(31,42,68,0.08);
        padding: 16px 8px;
        gap: 12px;
        text-align: center;
      }
      .mini-mancala-root .store .label {
        font-weight: 700;
        font-size: 1.1rem;
      }
      .mini-mancala-root .store .count {
        font-size: 2rem;
        font-weight: 700;
        color: #3055ff;
      }
      .mini-mancala-root .pits-area {
        display: grid;
        grid-template-rows: repeat(2, 1fr);
        gap: 14px;
      }
      .mini-mancala-root .pit-row {
        display: grid;
        grid-template-columns: repeat(${PIT_COUNT}, 1fr);
        gap: 12px;
      }
      .mini-mancala-root .pit {
        position: relative;
        border: none;
        border-radius: 14px;
        padding: 12px 8px 10px;
        min-height: 70px;
        background: linear-gradient(145deg, rgba(255,255,255,0.92), rgba(208,217,255,0.72));
        box-shadow: inset 0 2px 0 rgba(255,255,255,0.9), inset 0 -4px 0 rgba(48,85,255,0.1), 0 8px 16px rgba(15,28,63,0.15);
        cursor: pointer;
        transition: transform 0.12s ease, box-shadow 0.12s ease;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-size: 1.1rem;
        font-weight: 600;
        color: #102048;
      }
      .mini-mancala-root .pit::after {
        content: attr(data-seeds);
        font-size: 1.2rem;
        font-weight: 700;
        color: #1f2a44;
      }
      .mini-mancala-root .pit .sub {
        font-size: 0.75rem;
        font-weight: 500;
        opacity: 0.7;
        position: absolute;
        bottom: 6px;
      }
      .mini-mancala-root .pit.disabled,
      .mini-mancala-root .pit:disabled {
        cursor: default;
        filter: grayscale(0.3);
        opacity: 0.55;
        transform: none;
        box-shadow: inset 0 0 0 1px rgba(31,42,68,0.08);
      }
      .mini-mancala-root .pit.player-turn:not(.disabled) {
        box-shadow: inset 0 2px 0 rgba(255,255,255,0.9), inset 0 -4px 0 rgba(48,85,255,0.38), 0 10px 22px rgba(48,85,255,0.25);
      }
      .mini-mancala-root .pit.player-turn:not(.disabled):hover {
        transform: translateY(-3px);
      }
      .mini-mancala-root .pit.flash {
        animation: miniMancalaFlash 0.8s ease;
      }
      @keyframes miniMancalaFlash {
        0% { box-shadow: 0 0 0 0 rgba(48,85,255,0.0); }
        50% { box-shadow: 0 0 0 6px rgba(48,85,255,0.25); }
        100% { box-shadow: 0 0 0 0 rgba(48,85,255,0.0); }
      }
      .mini-mancala-root .history {
        font-size: 0.85rem;
        background: rgba(255,255,255,0.75);
        border-radius: 12px;
        padding: 8px 12px;
        max-height: 120px;
        overflow-y: auto;
        box-shadow: inset 0 0 0 1px rgba(31,42,68,0.08);
      }
      .mini-mancala-root .history ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .mini-mancala-root .history li {
        display: flex;
        justify-content: space-between;
        gap: 8px;
      }
      .mini-mancala-root .history li .who {
        font-weight: 600;
        color: #3055ff;
      }
      @media (max-width: 820px) {
        .mini-mancala-root .mancala-info {
          grid-template-columns: 1fr;
          text-align: center;
        }
        .mini-mancala-root .mancala-actions {
          justify-content: center;
        }
        .mini-mancala-root .mancala-board {
          grid-template-columns: 1fr;
        }
        .mini-mancala-root .store {
          flex-direction: row;
          justify-content: space-between;
          padding: 12px 18px;
        }
        .mini-mancala-root .pits-area {
          order: -1;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function create(root, awardXp, opts){
    ensureStyles();
    const difficulty = opts?.difficulty || 'NORMAL';
    const multiplier = XP_MULTIPLIER[difficulty] || 1;
    const initialSeeds = INITIAL_SEEDS[difficulty] || INITIAL_SEEDS.NORMAL;

    const state = {
      pits: {
        player: new Array(PIT_COUNT).fill(initialSeeds),
        ai: new Array(PIT_COUNT).fill(initialSeeds)
      },
      stores: { player: 0, ai: 0 },
      current: 'player',
      running: false,
      locked: false,
      history: [],
      ended: false
    };

    let aiTimer = null;

    root.innerHTML = '';
    root.classList.add('mini-mancala-root');

    const info = document.createElement('div');
    info.className = 'mancala-info';
    const statusEl = document.createElement('div');
    statusEl.className = 'mancala-status';
    const scoreEl = document.createElement('div');
    scoreEl.className = 'mancala-score';
    const playerStoreBadge = document.createElement('span');
    playerStoreBadge.innerHTML = 'あなた: <strong>0</strong>';
    const aiStoreBadge = document.createElement('span');
    aiStoreBadge.innerHTML = 'AI: <strong>0</strong>';
    scoreEl.append(playerStoreBadge, aiStoreBadge);

    const actions = document.createElement('div');
    actions.className = 'mancala-actions';
    const restartBtn = document.createElement('button');
    restartBtn.textContent = 'リスタート';
    restartBtn.className = 'mini';
    const hintBtn = document.createElement('button');
    hintBtn.textContent = 'ヒント';
    hintBtn.className = 'mini';
    actions.append(restartBtn, hintBtn);

    info.append(statusEl, scoreEl, actions);

    const board = document.createElement('div');
    board.className = 'mancala-board';

    const storeAi = createStore('AI');
    storeAi.classList.add('ai');
    const storePlayer = createStore('あなた');
    storePlayer.classList.add('player');

    const pitsArea = document.createElement('div');
    pitsArea.className = 'pits-area';

    const aiRow = document.createElement('div');
    aiRow.className = 'pit-row ai-row';
    const playerRow = document.createElement('div');
    playerRow.className = 'pit-row player-row';

    const pitButtons = {
      player: [],
      ai: []
    };

    for (let i = PIT_COUNT - 1; i >= 0; i--){
      const btn = createPitButton('ai', i);
      aiRow.appendChild(btn);
      pitButtons.ai[i] = btn;
    }
    for (let i = 0; i < PIT_COUNT; i++){
      const btn = createPitButton('player', i);
      playerRow.appendChild(btn);
      pitButtons.player[i] = btn;
    }

    pitsArea.append(aiRow, playerRow);

    board.append(storeAi, pitsArea, storePlayer);

    const historyBox = document.createElement('div');
    historyBox.className = 'history';
    const historyList = document.createElement('ul');
    historyBox.appendChild(historyList);

    root.append(info, board, historyBox);

    function createStore(label){
      const el = document.createElement('div');
      el.className = 'store';
      const name = document.createElement('div');
      name.className = 'label';
      name.textContent = label;
      const count = document.createElement('div');
      count.className = 'count';
      count.textContent = '0';
      el.append(name, count);
      return el;
    }

    function createPitButton(owner, index){
      const btn = document.createElement('button');
      btn.className = 'pit';
      btn.dataset.owner = owner;
      btn.dataset.index = String(index);
      const sub = document.createElement('div');
      sub.className = 'sub';
      sub.textContent = owner === 'player' ? `P${index + 1}` : `AI${index + 1}`;
      btn.appendChild(sub);
      btn.addEventListener('click', () => {
        if (!state.running || state.locked || state.current !== 'player') return;
        const pitIdx = Number(btn.dataset.index);
        if (state.pits.player[pitIdx] === 0) return;
        executeTurn('player', pitIdx);
      });
      return btn;
    }

    function resetState(){
      state.pits.player.fill(initialSeeds);
      state.pits.ai.fill(initialSeeds);
      state.stores.player = 0;
      state.stores.ai = 0;
      state.current = 'player';
      state.locked = false;
      state.history = [];
      state.ended = false;
      statusEl.textContent = 'あなたのターン — ピットを選んで種を蒔こう';
      updateBoard();
      updateHistory();
      scheduleAi();
    }

    function updateBoard(){
      for (let i = 0; i < PIT_COUNT; i++){
        const playerBtn = pitButtons.player[i];
        playerBtn.dataset.seeds = String(state.pits.player[i]);
        playerBtn.classList.toggle('disabled', state.pits.player[i] === 0);
        playerBtn.classList.toggle('player-turn', state.current === 'player' && !state.locked && state.pits.player[i] > 0 && !state.ended);
        const aiBtn = pitButtons.ai[i];
        aiBtn.dataset.seeds = String(state.pits.ai[i]);
        aiBtn.classList.toggle('disabled', true);
      }
      storePlayer.querySelector('.count').textContent = state.stores.player;
      storeAi.querySelector('.count').textContent = state.stores.ai;
      playerStoreBadge.querySelector('strong').textContent = state.stores.player;
      aiStoreBadge.querySelector('strong').textContent = state.stores.ai;
    }

    function updateHistory(){
      historyList.innerHTML = '';
      for (const entry of state.history.slice(-12).reverse()){
        const li = document.createElement('li');
        const who = document.createElement('span');
        who.className = 'who';
        who.textContent = entry.who;
        const detail = document.createElement('span');
        detail.textContent = entry.detail;
        li.append(who, detail);
        historyList.appendChild(li);
      }
    }

    function trackPositions(){
      const arr = [];
      for (let i = 0; i < PIT_COUNT; i++) arr.push({ owner: 'player', type: 'pit', index: i });
      arr.push({ owner: 'player', type: 'store' });
      for (let i = PIT_COUNT - 1; i >= 0; i--) arr.push({ owner: 'ai', type: 'pit', index: i });
      arr.push({ owner: 'ai', type: 'store' });
      return arr;
    }

    const track = trackPositions();

    function executeTurn(side, index){
      if (state.ended) return;
      state.locked = true;
      const result = sowSeeds(side, index);
      updateBoard();
      recordHistory(side, index, result);
      if (side === 'player'){
        const xpBase = 1 + result.seedsToStore * 0.6 + result.captured * 1.5 + (result.extraTurn ? 2.5 : 0);
        if (xpBase > 0){
          awardXp(Math.round(xpBase * multiplier));
        }
        if (result.captured > 0) flashCapture(index);
      }
      const ending = checkForFinish();
      if (ending){
        finishGame(ending);
        return;
      }
      if (result.extraTurn){
        state.current = side;
        statusEl.textContent = side === 'player' ? 'もう一度手番！別のピットを選ぼう' : 'AI が連続手番...';
        state.locked = false;
        updateBoard();
        if (side === 'ai') scheduleAi();
        return;
      }
      state.current = side === 'player' ? 'ai' : 'player';
      state.locked = false;
      statusEl.textContent = state.current === 'player' ? 'あなたのターン' : 'AI が考えています...';
      updateBoard();
      if (state.current === 'ai') scheduleAi();
    }

    function sowSeeds(side, index){
      const pits = state.pits[side];
      let seeds = pits[index];
      pits[index] = 0;
      let positionIndex = track.findIndex(p => p.owner === side && p.type === 'pit' && p.index === index);
      const result = { seedsToStore: 0, captured: 0, extraTurn: false };
      let lastPos = null;
      while(seeds > 0){
        positionIndex = (positionIndex + 1) % track.length;
        const pos = track[positionIndex];
        if (pos.type === 'store' && pos.owner !== side) continue;
        if (pos.type === 'pit'){
          state.pits[pos.owner][pos.index]++;
          seeds--;
          lastPos = pos;
        } else {
          state.stores[pos.owner]++;
          if (pos.owner === side){
            result.seedsToStore++;
          }
          seeds--;
          lastPos = pos;
        }
      }
      if (lastPos && lastPos.type === 'store' && lastPos.owner === side){
        result.extraTurn = true;
      }
      if (lastPos && lastPos.type === 'pit' && lastPos.owner === side){
        const landingCount = state.pits[side][lastPos.index];
        if (landingCount === 1){
          const oppositeOwner = side === 'player' ? 'ai' : 'player';
          const oppositeIndex = PIT_COUNT - 1 - lastPos.index;
          const oppositeSeeds = state.pits[oppositeOwner][oppositeIndex];
          if (oppositeSeeds > 0){
            state.pits[side][lastPos.index] = 0;
            state.pits[oppositeOwner][oppositeIndex] = 0;
            const captured = oppositeSeeds + 1;
            state.stores[side] += captured;
            result.captured = captured;
            result.seedsToStore += captured;
          }
        }
      }
      return result;
    }

    function recordHistory(side, index, result){
      const label = side === 'player' ? 'YOU' : 'AI';
      const detailParts = [];
      detailParts.push(`${index + 1}番ピット`);
      if (result.seedsToStore) detailParts.push(`ストア+${result.seedsToStore}`);
      if (result.captured) detailParts.push(`捕獲${result.captured}`);
      if (result.extraTurn) detailParts.push('追加ターン');
      state.history.push({ who: label, detail: detailParts.join(' / ') });
      updateHistory();
    }

    function flashCapture(index){
      const btn = pitButtons.player[index];
      btn.classList.add('flash');
      setTimeout(() => btn.classList.remove('flash'), 800);
    }

    function checkForFinish(){
      const playerEmpty = state.pits.player.every(v => v === 0);
      const aiEmpty = state.pits.ai.every(v => v === 0);
      if (!playerEmpty && !aiEmpty) return null;
      if (playerEmpty){
        const remain = state.pits.ai.reduce((a,b) => a + b, 0);
        state.pits.ai.fill(0);
        state.stores.ai += remain;
      } else if (aiEmpty){
        const remain = state.pits.player.reduce((a,b) => a + b, 0);
        state.pits.player.fill(0);
        state.stores.player += remain;
      }
      updateBoard();
      return {
        winner: state.stores.player === state.stores.ai ? 'draw' : (state.stores.player > state.stores.ai ? 'player' : 'ai'),
        diff: Math.abs(state.stores.player - state.stores.ai)
      };
    }

    function finishGame(result){
      state.ended = true;
      state.locked = true;
      clearTimeout(aiTimer);
      aiTimer = null;
      let message;
      if (result.winner === 'draw'){
        message = `引き分け！ ${state.stores.player} 対 ${state.stores.ai}`;
      } else if (result.winner === 'player'){
        message = `勝利！ ${state.stores.player} 対 ${state.stores.ai}`;
        const base = 22 + Math.min(40, result.diff * 2.5);
        awardXp(Math.round(base * multiplier));
      } else {
        message = `敗北… ${state.stores.player} 対 ${state.stores.ai}`;
      }
      statusEl.textContent = message;
    }

    function scheduleAi(){
      if (state.ended || state.current !== 'ai') return;
      clearTimeout(aiTimer);
      aiTimer = setTimeout(() => {
        if (!state.running || state.ended || state.current !== 'ai') return;
        const move = chooseAiMove();
        if (move == null){
          const ending = checkForFinish();
          if (ending) finishGame(ending);
          return;
        }
        executeTurn('ai', move);
      }, AI_THINK_TIME[difficulty] || 700);
    }

    function chooseAiMove(){
      const options = [];
      for (let i = 0; i < PIT_COUNT; i++){
        const seeds = state.pits.ai[i];
        if (seeds > 0) options.push(i);
      }
      if (!options.length) return null;
      if (difficulty === 'EASY'){
        return options[Math.floor(Math.random() * options.length)];
      }
      let best = null;
      let bestScore = -Infinity;
      for (const idx of options){
        const score = evaluateMove('ai', idx);
        if (score > bestScore){
          bestScore = score;
          best = idx;
        }
      }
      if (difficulty === 'HARD'){
        // look for tie-break by minimizing player's next capture potential
        const candidateMoves = options.filter(idx => Math.abs(evaluateMove('ai', idx) - bestScore) < 0.5);
        if (candidateMoves.length > 1){
          let tieBest = null;
          let tieScore = Infinity;
          for (const idx of candidateMoves){
            const score = evaluateFutureThreat(idx);
            if (score < tieScore){
              tieScore = score;
              tieBest = idx;
            }
          }
          best = tieBest ?? best;
        }
      }
      return best;
    }

    function evaluateMove(side, index){
      const snapshot = cloneState();
      const res = simulate(snapshot, side, index);
      const storeGain = res.storeGain;
      const captured = res.captured;
      const extraTurn = res.extraTurn ? 1 : 0;
      const diff = snapshot.stores.ai - snapshot.stores.player;
      const preference = side === 'ai' ? diff : -diff;
      return storeGain * 1.8 + captured * 2.6 + extraTurn * 2.4 + preference * 0.4;
    }

    function evaluateFutureThreat(index){
      const snapshot = cloneState();
      simulate(snapshot, 'ai', index);
      let worst = -Infinity;
      for (let i = 0; i < PIT_COUNT; i++){
        if (snapshot.pits.player[i] > 0){
          const val = evaluateMoveOnSnapshot(snapshot, 'player', i);
          if (val > worst) worst = val;
        }
      }
      return worst === -Infinity ? -10 : worst;
    }

    function evaluateMoveOnSnapshot(snapshot, side, index){
      const next = deepClone(snapshot);
      const res = simulate(next, side, index);
      return res.storeGain * 1.5 + res.captured * 2.2 + (res.extraTurn ? 2.0 : 0);
    }

    function cloneState(){
      return {
        pits: {
          player: state.pits.player.slice(),
          ai: state.pits.ai.slice()
        },
        stores: {
          player: state.stores.player,
          ai: state.stores.ai
        }
      };
    }

    function deepClone(snapshot){
      return {
        pits: {
          player: snapshot.pits.player.slice(),
          ai: snapshot.pits.ai.slice()
        },
        stores: {
          player: snapshot.stores.player,
          ai: snapshot.stores.ai
        }
      };
    }

    function simulate(snapshot, side, index){
      const localTrack = track;
      let seeds = snapshot.pits[side][index];
      snapshot.pits[side][index] = 0;
      let positionIndex = localTrack.findIndex(p => p.owner === side && p.type === 'pit' && p.index === index);
      let lastPos = null;
      let storeGain = 0;
      let captured = 0;
      while(seeds > 0){
        positionIndex = (positionIndex + 1) % localTrack.length;
        const pos = localTrack[positionIndex];
        if (pos.type === 'store' && pos.owner !== side) continue;
        if (pos.type === 'pit'){
          snapshot.pits[pos.owner][pos.index]++;
          seeds--;
          lastPos = pos;
        } else {
          snapshot.stores[pos.owner]++;
          if (pos.owner === side) storeGain++;
          seeds--;
          lastPos = pos;
        }
      }
      let extraTurn = false;
      if (lastPos && lastPos.type === 'store' && lastPos.owner === side){
        extraTurn = true;
      }
      if (lastPos && lastPos.type === 'pit' && lastPos.owner === side){
        const landingCount = snapshot.pits[side][lastPos.index];
        if (landingCount === 1){
          const oppositeOwner = side === 'player' ? 'ai' : 'player';
          const oppositeIndex = PIT_COUNT - 1 - lastPos.index;
          const oppositeSeeds = snapshot.pits[oppositeOwner][oppositeIndex];
          if (oppositeSeeds > 0){
            snapshot.pits[side][lastPos.index] = 0;
            snapshot.pits[oppositeOwner][oppositeIndex] = 0;
            const cap = oppositeSeeds + 1;
            snapshot.stores[side] += cap;
            storeGain += cap;
            captured = cap;
          }
        }
      }
      return { storeGain, captured, extraTurn };
    }

    function onRestart(){
      clearTimeout(aiTimer);
      aiTimer = null;
      resetState();
      if (state.running && state.current === 'ai') scheduleAi();
    }

    function onHint(){
      if (!state.running || state.ended || state.current !== 'player') return;
      const options = [];
      for (let i = 0; i < PIT_COUNT; i++) if (state.pits.player[i] > 0) options.push(i);
      if (!options.length) return;
      const scored = options.map(idx => ({ idx, score: evaluateMove('player', idx) }));
      scored.sort((a,b) => b.score - a.score);
      const top = scored[0];
      const btn = pitButtons.player[top.idx];
      btn.classList.add('flash');
      setTimeout(() => btn.classList.remove('flash'), 1000);
      statusEl.textContent = `ヒント: ${top.idx + 1}番ピットが好手です`;
    }

    restartBtn.addEventListener('click', onRestart);
    hintBtn.addEventListener('click', onHint);

    function handleKey(e){
      if (!state.running || state.ended) return;
      if (e.key === 'r' || e.key === 'R'){
        onRestart();
      }
    }

    window.addEventListener('keydown', handleKey);

    function start(){
      if (state.running) return;
      state.running = true;
      resetState();
      updateBoard();
      if (state.current === 'ai') scheduleAi();
    }

    function stop(){
      state.running = false;
      clearTimeout(aiTimer);
      aiTimer = null;
    }

    function destroy(){
      stop();
      window.removeEventListener('keydown', handleKey);
      root.innerHTML = '';
      root.classList.remove('mini-mancala-root');
    }

    function getScore(){
      return state.stores.player;
    }

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({
    id: 'mancala',
    name: 'マンカラ',
    description: 'カラハ式マンカラ。種まきや捕獲でEXPを稼ぎ、AIとの勝負に挑もう',
    create
  });
})();

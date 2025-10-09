(function(){
  'use strict';

  const PLAYER = 'player';
  const AI = 'ai';
  const BOARD_POINTS = 24;
  const CHECKERS_PER_SIDE = 15;
  const PLAYER_COLOR = '#facc15';
  const AI_COLOR = '#60a5fa';
  const BOARD_BG = '#0f172a';
  const BOARD_EDGE = '#1e293b';
  const TRIANGLE_LIGHT = '#94a3b8';
  const TRIANGLE_DARK = '#475569';
  const HIGHLIGHT_COLOR = 'rgba(248, 250, 252, 0.45)';
  const SELECT_COLOR = 'rgba(250, 204, 21, 0.35)';
  const BEAR_HIGHLIGHT = 'rgba(134, 239, 172, 0.35)';

  const XP_GAIN = {
    move: 1,
    hit: 7,
    bear: 6,
    win: { EASY: 140, NORMAL: 230, HARD: 360 }
  };

  const i18n = window.I18n;

  function getLocale(){
    if (typeof i18n?.getLocale === 'function'){
      try {
        return i18n.getLocale();
      } catch (error){
        console.warn('[backgammon] Failed to get locale', error);
      }
    }
    return undefined;
  }

  function formatNumberLocalized(value, options){
    if (typeof i18n?.formatNumber === 'function'){
      try {
        return i18n.formatNumber(value, options);
      } catch (error){
        console.warn('[backgammon] Failed to format number via i18n', error);
      }
    }
    try {
      return new Intl.NumberFormat(getLocale(), options).format(value);
    } catch (error){
      console.warn('[backgammon] Failed to format number', error);
      return String(value ?? '');
    }
  }

  function translateOrFallback(key, fallback, params){
    if (key && typeof i18n?.t === 'function'){
      try {
        const translated = i18n.t(key, params);
        if (typeof translated === 'string' && translated !== key){
          return translated;
        }
      } catch (error){
        console.warn('[backgammon] Failed to translate key', key, error);
      }
    }
    if (typeof fallback === 'function'){
      try {
        const result = fallback();
        return typeof result === 'string' ? result : (result ?? '');
      } catch (error){
        console.warn('[backgammon] Failed to resolve fallback text for key', key, error);
        return '';
      }
    }
    return fallback ?? '';
  }

  function getActorLabel(owner){
    if (owner === PLAYER){
      return translateOrFallback('game.backgammon.actor.player', 'プレイヤー');
    }
    return translateOrFallback('game.backgammon.actor.ai', 'AI');
  }

  function getDifficultyLabel(difficulty){
    const map = {
      EASY: { key: 'game.backgammon.difficulty.easy', fallback: 'イージー' },
      NORMAL: { key: 'game.backgammon.difficulty.normal', fallback: 'ノーマル' },
      HARD: { key: 'game.backgammon.difficulty.hard', fallback: 'ハード' }
    };
    const entry = map[difficulty] || { key: '', fallback: difficulty };
    return translateOrFallback(entry.key, entry.fallback);
  }

  function formatPoint(index){
    const label = pointLabel(index);
    return translateOrFallback('game.backgammon.point', () => `ポイント${label}`, { point: label });
  }

  function formatBarLabel(){
    return translateOrFallback('game.backgammon.bar', 'バー');
  }

  function formatDiceArray(values){
    return values.map(value => formatNumberLocalized(value)).join(', ');
  }

  function formatRemainingDice(values){
    if (!values || values.length === 0) return translateOrFallback('game.backgammon.dice.none', '-');
    return formatDiceArray(values);
  }

  function formatBearOffArea(owner, count){
    const actor = getActorLabel(owner);
    const countFormatted = formatNumberLocalized(count);
    const key = owner === PLAYER ? 'game.backgammon.board.playerOff' : 'game.backgammon.board.aiOff';
    return translateOrFallback(key, () => `${actor} OFF (${countFormatted})`, {
      actor,
      count,
      countFormatted
    });
  }

  const TOP_ORDER = [23,22,21,20,19,18,17,16,15,14,13,12];
  const BOTTOM_ORDER = [11,10,9,8,7,6,5,4,3,2,1,0];

  function createInitialBoard(){
    const board = [];
    for (let i = 0; i < BOARD_POINTS; i++){
      board.push({ owner: null, count: 0 });
    }
    setPoint(board, 23, PLAYER, 2);
    setPoint(board, 12, PLAYER, 5);
    setPoint(board, 7, PLAYER, 3);
    setPoint(board, 5, PLAYER, 5);
    setPoint(board, 0, AI, 2);
    setPoint(board, 11, AI, 5);
    setPoint(board, 16, AI, 3);
    setPoint(board, 18, AI, 5);
    return board;
  }

  function setPoint(board, index, owner, count){
    board[index].owner = owner;
    board[index].count = count;
  }

  function pointLabel(index){
    return String(index + 1);
  }

  function randomInt(min, max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function create(root, awardXp, opts){
    const difficulty = opts && opts.difficulty || 'NORMAL';
    const state = {
      board: createInitialBoard(),
      currentPlayer: PLAYER,
      dice: [],
      movesLeft: [],
      awaitingRoll: true,
      selectedPoint: null,
      highlightMoves: [],
      legalMoves: [],
      playerBar: 0,
      aiBar: 0,
      playerOff: 0,
      aiOff: 0,
      playerHits: 0,
      aiHits: 0,
      paused: false,
      destroyed: false,
      difficulty,
      gameOver: false,
      score: 0,
      log: []
    };

    let layout = null;

    const styleId = 'bgm-style';
    if (!document.getElementById(styleId)){
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        .bgm-root{display:flex;flex-direction:column;gap:12px;color:#e2e8f0;font-family:'Segoe UI','Noto Sans JP',sans-serif;}
        .bgm-board-wrapper{background:rgba(15,23,42,0.9);border-radius:16px;padding:12px;box-shadow:0 10px 30px rgba(15,23,42,0.45);}
        .bgm-canvas{width:100%;height:auto;display:block;border-radius:12px;}
        .bgm-ui{display:flex;flex-wrap:wrap;gap:12px;align-items:center;}
        .bgm-button{background:linear-gradient(135deg,#f59e0b,#facc15);color:#1e293b;border:none;border-radius:999px;padding:8px 18px;font-weight:600;cursor:pointer;transition:transform 0.15s ease, box-shadow 0.15s ease;}
        .bgm-button:disabled{background:#475569;color:#cbd5f5;cursor:not-allowed;box-shadow:none;transform:none;}
        .bgm-button:not(:disabled):hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(250,204,21,0.35);}
        .bgm-label{padding:6px 12px;border-radius:999px;background:rgba(148,163,184,0.2);font-size:0.9rem;}
        .bgm-panel{display:flex;flex-direction:column;gap:6px;min-width:160px;}
        .bgm-log{background:rgba(15,23,42,0.75);border-radius:12px;padding:10px;font-size:0.85rem;max-height:140px;overflow-y:auto;line-height:1.5;box-shadow:inset 0 0 0 1px rgba(148,163,184,0.25);}
        .bgm-log p{margin:0 0 4px;}
        .bgm-log p:last-child{margin-bottom:0;}
        .bgm-badges{display:flex;flex-wrap:wrap;gap:8px;font-size:0.8rem;}
        .bgm-badge{background:rgba(148,163,184,0.25);padding:4px 10px;border-radius:999px;}
      `;
      document.head.appendChild(style);
    }

    const container = document.createElement('div');
    container.className = 'bgm-root';

    const boardWrapper = document.createElement('div');
    boardWrapper.className = 'bgm-board-wrapper';
    const canvas = document.createElement('canvas');
    canvas.className = 'bgm-canvas';
    const ctx = canvas.getContext('2d');
    boardWrapper.appendChild(canvas);

    const uiRow = document.createElement('div');
    uiRow.className = 'bgm-ui';

    const turnLabel = document.createElement('div');
    turnLabel.className = 'bgm-label';

    const diceLabel = document.createElement('div');
    diceLabel.className = 'bgm-label';

    const rollBtn = document.createElement('button');
    rollBtn.className = 'bgm-button';
    rollBtn.textContent = translateOrFallback('game.backgammon.action.roll', 'ダイスを振る');

    const newGameBtn = document.createElement('button');
    newGameBtn.className = 'bgm-button';
    newGameBtn.textContent = translateOrFallback('game.backgammon.action.rematch', '再戦');

    const statusPanel = document.createElement('div');
    statusPanel.className = 'bgm-panel';

    const barLabel = document.createElement('div');
    barLabel.className = 'bgm-label';
    const offLabel = document.createElement('div');
    offLabel.className = 'bgm-label';

    const badges = document.createElement('div');
    badges.className = 'bgm-badges';

    const logBox = document.createElement('div');
    logBox.className = 'bgm-log';

    statusPanel.appendChild(barLabel);
    statusPanel.appendChild(offLabel);
    statusPanel.appendChild(badges);

    uiRow.appendChild(turnLabel);
    uiRow.appendChild(diceLabel);
    uiRow.appendChild(rollBtn);
    uiRow.appendChild(newGameBtn);
    uiRow.appendChild(statusPanel);

    container.appendChild(boardWrapper);
    container.appendChild(uiRow);
    container.appendChild(logBox);
    root.appendChild(container);

    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    resizeObserver.observe(root);

    function resizeCanvas(){
      if (state.destroyed) return;
      const rect = boardWrapper.getBoundingClientRect();
      const baseWidth = rect.width > 0 ? rect.width : (root.clientWidth || 720);
      const desiredWidth = Math.max(640, Math.min(baseWidth, 1100));
      const desiredHeight = Math.round(desiredWidth * 0.55);
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(desiredWidth * dpr);
      canvas.height = Math.floor(desiredHeight * dpr);
      canvas.style.width = desiredWidth + 'px';
      canvas.style.height = desiredHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layout = computeLayout(desiredWidth, desiredHeight);
      draw();
    }

    function computeLayout(width, height){
      const margin = 16;
      const sideWidth = Math.max(70, width * 0.1);
      const boardWidth = width - sideWidth * 2 - margin * 2;
      const boardHeight = height - margin * 2;
      const barWidth = Math.max(38, boardWidth * 0.07);
      const usableWidth = boardWidth - barWidth;
      const pointWidth = usableWidth / 12;
      const midY = margin + boardHeight / 2;
      const triangleHeight = boardHeight / 2 - 18;
      const pointRects = new Array(BOARD_POINTS);

      for (let col = 0; col < 12; col++){
        const x = margin + sideWidth + (col < 6 ? col * pointWidth : col * pointWidth + barWidth);
        const indexTop = TOP_ORDER[col];
        pointRects[indexTop] = {
          x,
          width: pointWidth,
          top: margin,
          bottom: midY,
          orientation: 'down',
          triangleHeight
        };
        const indexBottom = BOTTOM_ORDER[col];
        pointRects[indexBottom] = {
          x,
          width: pointWidth,
          top: midY,
          bottom: margin + boardHeight,
          orientation: 'up',
          triangleHeight
        };
      }

      return {
        width,
        height,
        margin,
        sideWidth,
        boardWidth,
        boardHeight,
        boardX: margin + sideWidth,
        boardY: margin,
        barWidth,
        pointWidth,
        midY,
        triangleHeight,
        pointRects,
        playerBearRect: {
          x: margin + sideWidth + boardWidth,
          y: midY,
          width: sideWidth,
          height: boardHeight / 2
        },
        aiBearRect: {
          x: margin,
          y: margin,
          width: sideWidth,
          height: boardHeight / 2
        },
        barRect: {
          x: margin + sideWidth + (usableWidth / 12) * 6,
          width: barWidth,
          y: margin,
          height: boardHeight
        }
      };
    }

    function logMessage(text){
      state.log.push(text);
      if (state.log.length > 50) state.log.shift();
      renderLog();
    }

    function renderLog(){
      logBox.innerHTML = '';
      const frag = document.createDocumentFragment();
      state.log.slice(-10).forEach(line => {
        const p = document.createElement('p');
        p.textContent = line;
        frag.appendChild(p);
      });
      logBox.appendChild(frag);
      logBox.scrollTop = logBox.scrollHeight;
    }

    function updateBadges(){
      badges.innerHTML = '';
      const difficultyLabel = getDifficultyLabel(state.difficulty);
      const playerHitsFormatted = formatNumberLocalized(state.playerHits);
      const scoreFormatted = formatNumberLocalized(state.score);
      const items = [
        translateOrFallback('game.backgammon.badge.difficulty', () => `難易度: ${difficultyLabel}`, {
          difficulty: difficultyLabel,
          rawDifficulty: state.difficulty
        }),
        translateOrFallback('game.backgammon.badge.hits', () => `ヒット: ${playerHitsFormatted}`, {
          hits: state.playerHits,
          hitsFormatted: playerHitsFormatted
        }),
        translateOrFallback('game.backgammon.badge.score', () => `スコア: ${scoreFormatted}`, {
          score: state.score,
          scoreFormatted
        })
      ];
      for (const text of items){
        const span = document.createElement('span');
        span.className = 'bgm-badge';
        span.textContent = text;
        badges.appendChild(span);
      }
    }

    function updateUi(){
      const actor = getActorLabel(state.currentPlayer);
      turnLabel.textContent = translateOrFallback('game.backgammon.ui.turn', () => `手番: ${actor}${state.gameOver ? '（終了）' : ''}`, {
        actor,
        gameOver: state.gameOver
      });
      if (state.dice.length === 0){
        diceLabel.textContent = translateOrFallback('game.backgammon.ui.dice.empty', 'ダイス: -');
      } else {
        const original = formatDiceArray(state.dice);
        const remaining = formatRemainingDice(state.movesLeft);
        diceLabel.textContent = translateOrFallback('game.backgammon.ui.dice.detail', () => `ダイス: [${original}] / 残り [${remaining}]`, {
          dice: state.dice,
          diceFormatted: original,
          remaining: state.movesLeft,
          remainingFormatted: remaining
        });
      }
      rollBtn.disabled = state.paused || state.destroyed || state.gameOver || state.currentPlayer !== PLAYER || !state.awaitingRoll;
      newGameBtn.disabled = state.paused || state.destroyed;
      const barTitle = formatBarLabel();
      const playerBarFormatted = formatNumberLocalized(state.playerBar);
      const aiBarFormatted = formatNumberLocalized(state.aiBar);
      barLabel.textContent = translateOrFallback('game.backgammon.ui.bar', () => `${barTitle}: ${getActorLabel(PLAYER)} ${playerBarFormatted} / ${getActorLabel(AI)} ${aiBarFormatted}`, {
        bar: barTitle,
        player: state.playerBar,
        playerFormatted: playerBarFormatted,
        ai: state.aiBar,
        aiFormatted: aiBarFormatted
      });
      const bearOffTitle = translateOrFallback('game.backgammon.ui.bearOff.title', 'ベアオフ');
      const playerOffFormatted = formatNumberLocalized(state.playerOff);
      const aiOffFormatted = formatNumberLocalized(state.aiOff);
      offLabel.textContent = translateOrFallback('game.backgammon.ui.bearOff', () => `${bearOffTitle}: ${getActorLabel(PLAYER)} ${playerOffFormatted} / ${getActorLabel(AI)} ${aiOffFormatted}`, {
        title: bearOffTitle,
        player: state.playerOff,
        playerFormatted: playerOffFormatted,
        ai: state.aiOff,
        aiFormatted: aiOffFormatted
      });
      updateBadges();
    }

    function playerAllInHome(){
      if (state.playerBar > 0) return false;
      for (let i = 6; i < BOARD_POINTS; i++){
        if (state.board[i].owner === PLAYER) return false;
      }
      return true;
    }

    function aiAllInHome(){
      if (state.aiBar > 0) return false;
      for (let i = 0; i < 18; i++){
        if (state.board[i].owner === AI) return false;
      }
      return true;
    }

    function hasHigherPlayerChecker(from){
      for (let i = from + 1; i <= 5; i++){
        if (state.board[i].owner === PLAYER) return true;
      }
      return false;
    }

    function hasLowerAiChecker(from){
      for (let i = from - 1; i >= 18; i--){
        if (state.board[i].owner === AI) return true;
      }
      return false;
    }

    function buildLegalMoves(){
      if (state.movesLeft.length === 0) return [];
      const uniqueDice = [...new Set(state.movesLeft)];
      const moves = [];
      for (const die of uniqueDice){
        const generated = generateMovesForDie(state.currentPlayer, die);
        moves.push(...generated);
      }
      if (moves.length === 0) return moves;
      if (state.currentPlayer === PLAYER && state.playerBar > 0){
        return moves.filter(m => m.from === 'bar');
      }
      if (state.currentPlayer === AI && state.aiBar > 0){
        return moves.filter(m => m.from === 'bar');
      }
      return moves;
    }

    function generateMovesForDie(owner, die){
      const moves = [];
      const board = state.board;
      if (owner === PLAYER){
        if (state.playerBar > 0){
          const destIndex = 24 - die;
          const target = board[destIndex];
          if (canLand(owner, target)){
            moves.push({ from: 'bar', to: destIndex, die, hit: target.owner === AI && target.count === 1, bearOff: false });
          }
          return moves;
        }
        for (let i = 0; i < BOARD_POINTS; i++){
          const point = board[i];
          if (point.owner !== PLAYER) continue;
          const dest = i - die;
          if (dest >= 0){
            const target = board[dest];
            if (canLand(PLAYER, target)){
              moves.push({ from: i, to: dest, die, hit: target.owner === AI && target.count === 1, bearOff: false });
            }
          } else {
            if (i <= 5 && playerAllInHome()){
              if (dest === -1 || !hasHigherPlayerChecker(i)){
                moves.push({ from: i, to: null, die, hit: false, bearOff: true });
              }
            }
          }
        }
      } else {
        if (state.aiBar > 0){
          const destIndex = die - 1;
          const target = board[destIndex];
          if (canLand(owner, target)){
            moves.push({ from: 'bar', to: destIndex, die, hit: target.owner === PLAYER && target.count === 1, bearOff: false });
          }
          return moves;
        }
        for (let i = 0; i < BOARD_POINTS; i++){
          const point = board[i];
          if (point.owner !== AI) continue;
          const dest = i + die;
          if (dest <= 23){
            const target = board[dest];
            if (canLand(AI, target)){
              moves.push({ from: i, to: dest, die, hit: target.owner === PLAYER && target.count === 1, bearOff: false });
            }
          } else {
            if (i >= 18 && aiAllInHome()){
              if (dest === 24 || !hasLowerAiChecker(i)){
                moves.push({ from: i, to: null, die, hit: false, bearOff: true });
              }
            }
          }
        }
      }
      return moves;
    }

    function canLand(owner, target){
      if (!target.owner) return true;
      if (target.owner === owner) return true;
      return target.count === 1;
    }

    function consumeDie(die){
      const idx = state.movesLeft.indexOf(die);
      if (idx !== -1){
        state.movesLeft.splice(idx, 1);
      }
    }

    function clearSelection(){
      state.selectedPoint = null;
      state.highlightMoves = [];
    }

    function setSelection(from){
      state.selectedPoint = from;
      state.highlightMoves = state.legalMoves.filter(m => m.from === from);
    }

    function handleCanvasClick(evt){
      if (state.paused || state.destroyed || state.gameOver) return;
      if (state.currentPlayer !== PLAYER || state.awaitingRoll) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / parseFloat(canvas.style.width || canvas.width);
      const scaleY = canvas.height / parseFloat(canvas.style.height || canvas.height);
      const x = (evt.clientX - rect.left) * scaleX / (window.devicePixelRatio || 1);
      const y = (evt.clientY - rect.top) * scaleY / (window.devicePixelRatio || 1);
      const pointIndex = detectPoint(x, y);
      const bearClicked = detectBearOffArea(x, y);

      if (state.playerBar > 0 && state.legalMoves.some(m => m.from === 'bar')){
        setSelection('bar');
      }

      if (bearClicked && state.selectedPoint !== null){
        const move = state.highlightMoves.find(m => m.bearOff);
        if (move){
          performMove(move);
          return;
        }
      }

      if (pointIndex === null){
        clearSelection();
        draw();
        return;
      }

      if (state.selectedPoint !== null){
        const move = state.highlightMoves.find(m => m.to === pointIndex && !m.bearOff);
        if (move){
          performMove(move);
          return;
        }
      }

      const hasMovesFromPoint = state.legalMoves.some(m => m.from === pointIndex);
      if (hasMovesFromPoint){
        setSelection(pointIndex);
      } else {
        clearSelection();
      }
      draw();
    }

    function detectPoint(x, y){
      if (!layout) return null;
      for (let i = 0; i < BOARD_POINTS; i++){
        const rect = layout.pointRects[i];
        if (!rect) continue;
        if (x >= rect.x && x <= rect.x + rect.width && y >= rect.top && y <= rect.bottom){
          return i;
        }
      }
      return null;
    }

    function detectBearOffArea(x, y){
      if (!layout) return false;
      const r = layout.playerBearRect;
      return x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height;
    }

    function performMove(move){
      applyMove(state.currentPlayer, move);
      consumeDie(move.die);
      logMove(state.currentPlayer, move);
      refreshScore();
      const winner = checkWinner();
      if (winner){
        handleWin(winner);
        return;
      }
      if (state.movesLeft.length === 0){
        endTurn();
        return;
      }
      refreshLegalMoves();
    }

    function refreshScore(){
      state.score = state.playerOff * 12 + state.playerHits * 5 - state.aiOff * 6;
    }

    function logMove(owner, move){
      const actor = getActorLabel(owner);
      const dieFormatted = formatNumberLocalized(move.die);
      if (move.bearOff){
        const fromLabel = formatPoint(move.from);
        logMessage(translateOrFallback('game.backgammon.log.bearOff', () => `${actor} が${fromLabel}からベアオフ（${dieFormatted}）`, {
          actor,
          from: move.from,
          fromLabel,
          die: move.die,
          dieFormatted
        }));
        return;
      }
      if (move.from === 'bar'){
        const toLabel = formatPoint(move.to);
        const baseParams = {
          actor,
          to: move.to,
          toLabel,
          die: move.die,
          dieFormatted,
          bar: formatBarLabel()
        };
        if (move.hit){
          logMessage(translateOrFallback('game.backgammon.log.barHit', () => `${actor} が${baseParams.bar}から${toLabel}へエントリー（${dieFormatted}）：ヒット！`, baseParams));
        } else {
          logMessage(translateOrFallback('game.backgammon.log.barEntry', () => `${actor} が${baseParams.bar}から${toLabel}へエントリー（${dieFormatted}）`, baseParams));
        }
        return;
      }
      const fromLabel = formatPoint(move.from);
      const toLabel = formatPoint(move.to);
      const params = {
        actor,
        from: move.from,
        fromLabel,
        to: move.to,
        toLabel,
        die: move.die,
        dieFormatted
      };
      if (move.hit){
        logMessage(translateOrFallback('game.backgammon.log.moveHit', () => `${actor} が${fromLabel} → ${toLabel}（${dieFormatted}）：ヒット！`, params));
      } else {
        logMessage(translateOrFallback('game.backgammon.log.move', () => `${actor} が${fromLabel} → ${toLabel}（${dieFormatted}）`, params));
      }
    }

    function applyMove(owner, move){
      if (move.from === 'bar'){
        if (owner === PLAYER){
          state.playerBar = Math.max(0, state.playerBar - 1);
        } else {
          state.aiBar = Math.max(0, state.aiBar - 1);
        }
      } else {
        const fromPoint = state.board[move.from];
        fromPoint.count -= 1;
        if (fromPoint.count <= 0){
          fromPoint.count = 0;
          fromPoint.owner = null;
        }
      }

      if (move.bearOff){
        if (owner === PLAYER){
          state.playerOff += 1;
          awardXpSafely(XP_GAIN.move + XP_GAIN.bear);
        } else {
          state.aiOff += 1;
        }
        return;
      }

      const destPoint = state.board[move.to];
      if (destPoint.owner && destPoint.owner !== owner){
        // hit
        if (destPoint.count === 1){
          if (owner === PLAYER){
            state.playerHits += 1;
            state.aiBar += 1;
            awardXpSafely(XP_GAIN.move + XP_GAIN.hit);
          } else {
            state.aiHits += 1;
            state.playerBar += 1;
          }
          destPoint.owner = owner;
          destPoint.count = 1;
        }
      } else {
        if (destPoint.owner === owner){
          destPoint.count += 1;
        } else {
          destPoint.owner = owner;
          destPoint.count = 1;
        }
        if (owner === PLAYER){
          awardXpSafely(XP_GAIN.move);
        }
      }
    }

    function awardXpSafely(amount){
      if (!amount) return 0;
      try {
        const res = awardXp(amount);
        return typeof res === 'number' ? res : amount;
      } catch (err){
        console.error('Award XP failed', err);
        return 0;
      }
    }

    function checkWinner(){
      if (state.playerOff >= CHECKERS_PER_SIDE) return PLAYER;
      if (state.aiOff >= CHECKERS_PER_SIDE) return AI;
      return null;
    }

    function handleWin(winner){
      state.gameOver = true;
      state.awaitingRoll = true;
      state.movesLeft = [];
      state.legalMoves = [];
      clearSelection();
      updateUi();
      draw();
      if (winner === PLAYER){
        const gain = XP_GAIN.win[difficulty] || XP_GAIN.win.NORMAL;
        const actual = awardXpSafely(gain);
        const reward = typeof actual === 'number' && !Number.isNaN(actual) ? actual : gain;
        const rewardFormatted = formatNumberLocalized(reward);
        logMessage(translateOrFallback('game.backgammon.log.win.player', () => `プレイヤーの勝利！${rewardFormatted} EXP 獲得`, {
          actor: getActorLabel(PLAYER),
          reward,
          rewardFormatted
        }));
      } else {
        logMessage(translateOrFallback('game.backgammon.log.win.ai', 'AIの勝利…再挑戦しよう'));
      }
    }

    function endTurn(){
      clearSelection();
      state.dice = [];
      state.movesLeft = [];
      state.legalMoves = [];
      state.awaitingRoll = true;
      state.currentPlayer = state.currentPlayer === PLAYER ? AI : PLAYER;
      updateUi();
      draw();
      if (state.currentPlayer === AI && !state.gameOver){
        aiTakeTurn();
      }
    }

    function refreshLegalMoves(){
      state.legalMoves = buildLegalMoves();
      if (state.currentPlayer === PLAYER){
        if (state.playerBar > 0 && state.legalMoves.some(m => m.from === 'bar')){
          setSelection('bar');
        } else if (state.selectedPoint !== null){
          const next = state.legalMoves.filter(m => m.from === state.selectedPoint);
          if (next.length === 0) clearSelection();
          else state.highlightMoves = next;
        }
      }
      updateUi();
      draw();
    }

    function rollDiceForCurrentPlayer(){
      const d1 = randomInt(1, 6);
      const d2 = randomInt(1, 6);
      if (d1 === d2){
        state.dice = [d1, d1, d1, d1];
      } else {
        state.dice = [d1, d2];
      }
      state.movesLeft = state.dice.slice();
      state.awaitingRoll = false;
      updateUi();
      draw();
    }

    function aiTakeTurn(){
      if (state.paused || state.destroyed || state.gameOver || state.currentPlayer !== AI) return;
      rollDiceForCurrentPlayer();
      const diceFormatted = formatDiceArray(state.dice);
      logMessage(translateOrFallback('game.backgammon.log.aiDice', () => `AIのダイス: ${diceFormatted}`, {
        actor: getActorLabel(AI),
        dice: state.dice,
        diceFormatted
      }));
      refreshLegalMoves();
      if (state.legalMoves.length === 0){
        logMessage(translateOrFallback('game.backgammon.log.aiNoMove', 'AIは動けない'));
        endTurn();
        return;
      }
      while (state.movesLeft.length > 0){
        state.legalMoves = buildLegalMoves();
        if (state.legalMoves.length === 0) break;
        const move = chooseAiMove(state.legalMoves);
        applyMove(AI, move);
        consumeDie(move.die);
        logMove(AI, move);
        const winner = checkWinner();
        refreshScore();
        if (winner){
          handleWin(winner);
          return;
        }
      }
      endTurn();
    }

    function chooseAiMove(moves){
      let bestScore = -Infinity;
      let bestMove = moves[0];
      for (const move of moves){
        const score = evaluateAiMove(move);
        if (score > bestScore){
          bestScore = score;
          bestMove = move;
        }
      }
      return bestMove;
    }

    function evaluateAiMove(move){
      let score = 0;
      if (move.bearOff) score += 120;
      if (move.hit) score += 80;
      if (move.from === 'bar') score += 60;
      score += move.die * 2;
      const dest = move.to;
      if (dest !== null){
        const target = state.board[dest];
        if (target.owner === AI){
          score += target.count >= 2 ? 25 : 10;
        } else if (!target.owner){
          score += 5;
        }
        const opponentHomeThreat = dest >= 18 ? 10 : 0;
        score += opponentHomeThreat;
      }
      if (state.difficulty === 'EASY'){
        score *= 0.85;
      } else if (state.difficulty === 'HARD'){
        score *= 1.15;
      }
      return score;
    }

    function rollButtonClicked(){
      if (state.paused || state.gameOver || state.currentPlayer !== PLAYER || !state.awaitingRoll) return;
      rollDiceForCurrentPlayer();
      const diceFormatted = formatDiceArray(state.dice);
      logMessage(translateOrFallback('game.backgammon.log.playerDice', () => `プレイヤーのダイス: ${diceFormatted}`, {
        actor: getActorLabel(PLAYER),
        dice: state.dice,
        diceFormatted
      }));
      refreshLegalMoves();
      if (state.legalMoves.length === 0){
        logMessage(translateOrFallback('game.backgammon.log.noMoves', '動かせる手がありません'));
        endTurn();
      }
    }

    function newGame(){
      state.board = createInitialBoard();
      state.currentPlayer = PLAYER;
      state.dice = [];
      state.movesLeft = [];
      state.awaitingRoll = true;
      state.selectedPoint = null;
      state.highlightMoves = [];
      state.legalMoves = [];
      state.playerBar = 0;
      state.aiBar = 0;
      state.playerOff = 0;
      state.aiOff = 0;
      state.playerHits = 0;
      state.aiHits = 0;
      state.gameOver = false;
      state.score = 0;
      state.log = [];
      renderLog();
      updateUi();
      draw();
      logMessage(translateOrFallback('game.backgammon.log.newGame', '新しいゲームを開始。プレイヤーの手番です'));
    }

    function draw(){
      if (!layout) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBoardBase();
      drawPoints();
      drawCheckers();
      drawBar();
      drawBearOffAreas();
      drawHighlights();
    }

    function drawBoardBase(){
      ctx.save();
      ctx.fillStyle = BOARD_BG;
      ctx.fillRect(0, 0, layout.width, layout.height);
      ctx.fillStyle = BOARD_EDGE;
      ctx.fillRect(layout.boardX - 6, layout.boardY - 6, layout.boardWidth + 12, layout.boardHeight + 12);
      ctx.fillStyle = '#0b1220';
      ctx.fillRect(layout.boardX, layout.boardY, layout.boardWidth, layout.boardHeight);

      const pointWidth = layout.pointWidth;
      const triangleHeight = layout.triangleHeight;

      for (let col = 0; col < 12; col++){
        const x = layout.boardX + (col < 6 ? col * pointWidth : col * pointWidth + layout.barWidth);
        const isEven = col % 2 === 0;
        ctx.fillStyle = isEven ? TRIANGLE_LIGHT : TRIANGLE_DARK;
        ctx.beginPath();
        ctx.moveTo(x, layout.boardY);
        ctx.lineTo(x + pointWidth, layout.boardY);
        ctx.lineTo(x + pointWidth / 2, layout.boardY + triangleHeight);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(x, layout.boardY + layout.boardHeight);
        ctx.lineTo(x + pointWidth, layout.boardY + layout.boardHeight);
        ctx.lineTo(x + pointWidth / 2, layout.boardY + layout.boardHeight - triangleHeight);
        ctx.closePath();
        ctx.fill();
      }

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(layout.barRect.x, layout.boardY, layout.barRect.width, layout.boardHeight);
      ctx.restore();
    }

    function drawPoints(){
      ctx.save();
      ctx.fillStyle = '#f1f5f9';
      ctx.font = '14px "Segoe UI", "Noto Sans JP", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let col = 0; col < 12; col++){
        const topIndex = TOP_ORDER[col];
        const rectTop = layout.pointRects[topIndex];
        ctx.fillText(pointLabel(topIndex), rectTop.x + rectTop.width / 2, rectTop.top + 12);
        const bottomIndex = BOTTOM_ORDER[col];
        const rectBottom = layout.pointRects[bottomIndex];
        ctx.fillText(pointLabel(bottomIndex), rectBottom.x + rectBottom.width / 2, rectBottom.bottom - 12);
      }
      ctx.restore();
    }

    function drawChecker(x, y, radius, owner, countText){
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      const color = owner === PLAYER ? PLAYER_COLOR : AI_COLOR;
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.stroke();
      if (countText){
        ctx.fillStyle = '#0f172a';
        ctx.font = `${Math.round(radius * 0.9)}px "Segoe UI", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(countText, x, y);
      }
      ctx.restore();
    }

    function drawCheckers(){
      const radius = Math.min(layout.pointWidth * 0.42, layout.triangleHeight / 6.5);
      const spacing = radius * 1.75;
      for (let i = 0; i < BOARD_POINTS; i++){
        const point = state.board[i];
        if (!point.owner || point.count === 0) continue;
        const rect = layout.pointRects[i];
        const drawCount = Math.min(point.count, 5);
        for (let n = 0; n < drawCount; n++){
          let cx = rect.x + rect.width / 2;
          let cy;
          if (rect.orientation === 'down'){
            cy = rect.top + radius + 10 + n * spacing;
          } else {
            cy = rect.bottom - radius - 10 - n * spacing;
          }
          const isLast = n === drawCount - 1 && point.count > 5;
          drawChecker(cx, cy, radius, point.owner, isLast ? String(point.count) : '');
        }
      }

      // bar checkers
      if (state.playerBar > 0){
        const cx = layout.barRect.x + layout.barRect.width / 2;
        const startY = layout.midY + radius + 12;
        for (let i = 0; i < Math.min(state.playerBar, 4); i++){
          const cy = startY + i * spacing;
          drawChecker(cx, cy, radius, PLAYER, i === 3 && state.playerBar > 4 ? String(state.playerBar) : '');
        }
      }
      if (state.aiBar > 0){
        const cx = layout.barRect.x + layout.barRect.width / 2;
        const startY = layout.midY - radius - 12;
        for (let i = 0; i < Math.min(state.aiBar, 4); i++){
          const cy = startY - i * spacing;
          drawChecker(cx, cy, radius, AI, i === 3 && state.aiBar > 4 ? String(state.aiBar) : '');
        }
      }
    }

    function drawBar(){
      ctx.save();
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '12px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      const barText = translateOrFallback('game.backgammon.board.barText', () => 'BAR', {
        label: formatBarLabel()
      });
      ctx.fillText(barText, layout.barRect.x + layout.barRect.width / 2, layout.midY);
      ctx.restore();
    }

    function drawBearOffAreas(){
      ctx.save();
      ctx.fillStyle = 'rgba(30,41,59,0.8)';
      ctx.fillRect(layout.aiBearRect.x, layout.aiBearRect.y, layout.aiBearRect.width, layout.aiBearRect.height);
      ctx.fillRect(layout.playerBearRect.x, layout.playerBearRect.y, layout.playerBearRect.width, layout.playerBearRect.height);
      ctx.fillStyle = '#cbd5f5';
      ctx.font = '12px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const aiOffText = formatBearOffArea(AI, state.aiOff);
      const playerOffText = formatBearOffArea(PLAYER, state.playerOff);
      ctx.fillText(aiOffText, layout.aiBearRect.x + layout.aiBearRect.width / 2, layout.aiBearRect.y + layout.aiBearRect.height / 2);
      ctx.fillText(playerOffText, layout.playerBearRect.x + layout.playerBearRect.width / 2, layout.playerBearRect.y + layout.playerBearRect.height / 2);
      ctx.restore();
    }

    function drawHighlights(){
      if (state.currentPlayer !== PLAYER) return;
      ctx.save();
      if (state.selectedPoint === 'bar'){
        ctx.fillStyle = SELECT_COLOR;
        ctx.fillRect(layout.barRect.x, layout.barRect.y, layout.barRect.width, layout.barRect.height);
      } else if (state.selectedPoint !== null){
        const rect = layout.pointRects[state.selectedPoint];
        if (rect){
          ctx.fillStyle = SELECT_COLOR;
          ctx.fillRect(rect.x, rect.top, rect.width, rect.bottom - rect.top);
        }
      }
      if (state.highlightMoves.length > 0){
        ctx.fillStyle = HIGHLIGHT_COLOR;
        for (const move of state.highlightMoves){
          if (move.bearOff){
            ctx.fillStyle = BEAR_HIGHLIGHT;
            ctx.fillRect(layout.playerBearRect.x, layout.playerBearRect.y, layout.playerBearRect.width, layout.playerBearRect.height);
            ctx.fillStyle = HIGHLIGHT_COLOR;
          } else {
            const rect = layout.pointRects[move.to];
            ctx.fillRect(rect.x, rect.top, rect.width, rect.bottom - rect.top);
          }
        }
      }
      ctx.restore();
    }

    canvas.addEventListener('click', handleCanvasClick);
    rollBtn.addEventListener('click', rollButtonClicked);
    newGameBtn.addEventListener('click', newGame);

    newGame();
    resizeCanvas();

    return {
      start(){
        state.paused = false;
        if (state.currentPlayer === AI && state.awaitingRoll && !state.gameOver){
          aiTakeTurn();
        }
      },
      stop(){
        state.paused = true;
      },
      destroy(){
        state.destroyed = true;
        resizeObserver.disconnect();
        canvas.removeEventListener('click', handleCanvasClick);
        rollBtn.removeEventListener('click', rollButtonClicked);
        newGameBtn.removeEventListener('click', newGame);
        container.remove();
      },
      getScore(){
        return state.score;
      }
    };
  }

  window.registerMiniGame({
    id: 'backgammon',
    name: 'バックギャモン', nameKey: 'selection.miniexp.games.backgammon.name',
    description: '本格的なバー＆ポイント制ボードゲーム。ヒットやベアオフでEXPを稼ぎ、ベアリングオフで勝利を目指そう。', descriptionKey: 'selection.miniexp.games.backgammon.description', categoryIds: ['board'],
    create
  });
})();

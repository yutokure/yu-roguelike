(function(){
  /** MiniExp MOD: Color Sort Puzzle */
  function create(root, awardXp, opts){
    const difficulty = (opts && opts.difficulty) || 'NORMAL';
    const shortcuts = opts?.shortcuts;
    const localization = opts?.localization || (typeof window !== 'undefined' && typeof window.createMiniGameLocalization === 'function'
      ? window.createMiniGameLocalization({ id: 'color_sort' })
      : null);
    const text = (key, fallback, params) => {
      if (localization && typeof localization.t === 'function'){
        return localization.t(key, fallback, params);
      }
      if (typeof fallback === 'function') return fallback();
      return fallback ?? '';
    };
    const formatNumber = (value, options) => {
      if (localization && typeof localization.formatNumber === 'function'){
        try { return localization.formatNumber(value, options); } catch {}
      }
      if (typeof Intl !== 'undefined' && typeof Intl.NumberFormat === 'function'){
        try { return new Intl.NumberFormat(undefined, options).format(value); } catch {}
      }
      if (value != null && typeof value.toLocaleString === 'function'){
        try { return value.toLocaleString(); } catch {}
      }
      return String(value ?? '');
    };
    const formatTime = (ms) => {
      if (!Number.isFinite(ms)) return '0:00.0';
      const totalSeconds = Math.max(0, ms) / 1000;
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = Math.floor(totalSeconds % 60);
      const tenths = Math.floor((totalSeconds - Math.floor(totalSeconds)) * 10);
      return `${minutes}:${seconds.toString().padStart(2, '0')}.${tenths}`;
    };

    const disableHostRestart = typeof shortcuts?.disableHostRestart === 'function'
      ? () => { try { shortcuts.disableHostRestart(); } catch {} }
      : null;
    const enableHostRestart = typeof shortcuts?.enableHostRestart === 'function'
      ? () => { try { shortcuts.enableHostRestart(); } catch {} }
      : null;

    const difficultyConfigs = {
      EASY: { colors: 4, capacity: 4, extra: 2, pourXp: 0.18, clearXp: 18 },
      NORMAL: { colors: 6, capacity: 4, extra: 2, pourXp: 0.24, clearXp: 32 },
      HARD: { colors: 8, capacity: 4, extra: 2, pourXp: 0.32, clearXp: 48 }
    };
    const config = difficultyConfigs[difficulty] || difficultyConfigs.NORMAL;
    const palette = [
      '#f87171', '#fb923c', '#facc15', '#34d399', '#38bdf8', '#60a5fa', '#a78bfa', '#f472b6',
      '#fef08a', '#22d3ee', '#f97316', '#4ade80'
    ];

    let running = false;
    let solved = false;
    let startedOnce = false;
    let tubes = [];
    let moves = 0;
    let elapsedMs = 0;
    let bestTimeMs = null;
    let bestMoves = null;
    let solveCount = 0;
    let selectedTubeIndex = null;
    let startTimestamp = 0;
    let timerInterval = null;
    let detachLocale = null;

    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.maxWidth = '600px';
    wrapper.style.margin = '0 auto';
    wrapper.style.padding = '16px 18px 26px';
    wrapper.style.boxSizing = 'border-box';
    wrapper.style.fontFamily = "'Segoe UI', system-ui, sans-serif";
    wrapper.style.color = '#e2e8f0';
    wrapper.style.background = '#020617';
    wrapper.style.borderRadius = '18px';
    wrapper.style.boxShadow = '0 16px 36px rgba(15,23,42,0.65)';

    const title = document.createElement('div');
    title.style.fontSize = '22px';
    title.style.fontWeight = '600';
    title.style.marginBottom = '6px';

    const description = document.createElement('div');
    description.style.fontSize = '13px';
    description.style.lineHeight = '1.5';
    description.style.opacity = '0.85';
    description.style.marginBottom = '14px';

    const infoBar = document.createElement('div');
    infoBar.style.display = 'flex';
    infoBar.style.flexWrap = 'wrap';
    infoBar.style.gap = '8px 16px';
    infoBar.style.marginBottom = '14px';
    infoBar.style.fontSize = '13px';

    const createInfo = (labelKey, fallbackLabel) => {
      const span = document.createElement('span');
      span.style.display = 'flex';
      span.style.gap = '4px';
      const strong = document.createElement('span');
      strong.style.opacity = '0.7';
      const value = document.createElement('span');
      value.textContent = '0';
      value.style.fontVariantNumeric = 'tabular-nums';
      span.appendChild(strong);
      span.appendChild(value);
      const updateLabel = () => {
        strong.textContent = text(labelKey, fallbackLabel);
      };
      updateLabel();
      return { span, value, updateLabel };
    };

    const movesInfo = createInfo('.info.moves', 'Moves');
    const timeInfo = createInfo('.info.time', 'Time');
    const bestInfo = createInfo('.info.best', 'Best');
    const solveInfo = createInfo('.info.clears', 'Clears');
    bestInfo.value.textContent = '-';
    timeInfo.value.textContent = '0:00.0';
    solveInfo.value.textContent = '0';

    infoBar.appendChild(movesInfo.span);
    infoBar.appendChild(timeInfo.span);
    infoBar.appendChild(bestInfo.span);
    infoBar.appendChild(solveInfo.span);

    const tubesWrapper = document.createElement('div');
    tubesWrapper.style.display = 'grid';
    tubesWrapper.style.gridTemplateColumns = 'repeat(auto-fit, minmax(90px, 1fr))';
    tubesWrapper.style.gap = '18px';
    tubesWrapper.style.padding = '8px 4px';
    tubesWrapper.style.justifyItems = 'center';

    const statusBar = document.createElement('div');
    statusBar.style.marginTop = '16px';
    statusBar.style.minHeight = '22px';
    statusBar.style.fontSize = '13px';
    statusBar.style.opacity = '0.9';

    const controlRow = document.createElement('div');
    controlRow.style.display = 'flex';
    controlRow.style.gap = '10px';
    controlRow.style.marginTop = '16px';

    const resetBtn = document.createElement('button');
    resetBtn.style.padding = '8px 14px';
    resetBtn.style.borderRadius = '10px';
    resetBtn.style.border = 'none';
    resetBtn.style.fontSize = '13px';
    resetBtn.style.fontWeight = '600';
    resetBtn.style.cursor = 'pointer';
    resetBtn.style.background = 'linear-gradient(135deg, #6366f1, #8b5cf6)';
    resetBtn.style.color = '#f8fafc';

    controlRow.appendChild(resetBtn);

    wrapper.appendChild(title);
    wrapper.appendChild(description);
    wrapper.appendChild(infoBar);
    wrapper.appendChild(tubesWrapper);
    wrapper.appendChild(controlRow);
    wrapper.appendChild(statusBar);

    const doc = root && root.ownerDocument ? root.ownerDocument : document;

    function createTubeElement(index){
      const container = document.createElement('button');
      container.type = 'button';
      container.style.position = 'relative';
      container.style.width = '84px';
      container.style.height = '240px';
      container.style.padding = '12px 0';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.justifyContent = 'flex-end';
      container.style.alignItems = 'center';
      container.style.gap = '8px';
      container.style.borderRadius = '42px';
      container.style.border = '2px solid rgba(148,163,184,0.6)';
      container.style.background = 'radial-gradient(circle at 50% 10%, rgba(148,163,184,0.2), rgba(30,41,59,0.9))';
      container.style.boxShadow = 'inset 0 2px 6px rgba(15,23,42,0.85), 0 8px 18px rgba(2,6,23,0.55)';
      container.style.cursor = 'pointer';
      container.style.transition = 'transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease';
      container.style.outline = 'none';
      container.setAttribute('data-index', String(index));

      container.addEventListener('mouseenter', () => {
        if (solved) return;
        container.style.transform = 'translateY(-3px)';
      });
      container.addEventListener('mouseleave', () => {
        container.style.transform = 'translateY(0)';
      });

      container.addEventListener('click', () => {
        if (!running || solved) return;
        handleTubeSelection(index);
      });

      return container;
    }

    function getTubeTopColor(tube){
      return tube.length > 0 ? tube[tube.length - 1] : null;
    }

    function tubeIsUniform(tube){
      if (tube.length === 0) return true;
      if (tube.length !== config.capacity) return false;
      const first = tube[0];
      return tube.every(color => color === first);
    }

    function isSolved(state){
      return state.every(tube => tubeIsUniform(tube));
    }

    function shuffle(array){
      for (let i = array.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    function generateInitialState(){
      const totalTubes = config.colors + config.extra;
      const fillColors = palette.slice(0, config.colors);
      const slots = [];
      for (const color of fillColors){
        for (let i = 0; i < config.capacity; i++){
          slots.push(color);
        }
      }
      shuffle(slots);
      const newState = Array.from({ length: totalTubes }, () => []);
      let pointer = 0;
      for (let i = 0; i < config.colors; i++){
        newState[i] = slots.slice(pointer, pointer + config.capacity);
        pointer += config.capacity;
      }
      return newState;
    }

    function ensurePlayableState(){
      let state = generateInitialState();
      let attempts = 0;
      while (isSolved(state) && attempts < 10){
        state = generateInitialState();
        attempts++;
      }
      return state;
    }

    function renderTubes(){
      tubesWrapper.innerHTML = '';
      tubes.forEach((tube, index) => {
        const tubeEl = createTubeElement(index);
        if (index === selectedTubeIndex){
          tubeEl.style.borderColor = '#facc15';
          tubeEl.style.boxShadow = 'inset 0 2px 8px rgba(15,23,42,0.85), 0 0 0 4px rgba(250,204,21,0.35)';
        }
        const placeholderCount = config.capacity - tube.length;
        for (let i = 0; i < placeholderCount; i++){
          const ghost = document.createElement('div');
          ghost.style.width = '48px';
          ghost.style.height = '48px';
          ghost.style.borderRadius = '50%';
          ghost.style.opacity = '0.15';
          ghost.style.border = '2px dashed rgba(148,163,184,0.3)';
          tubeEl.appendChild(ghost);
        }
        for (let i = tube.length - 1; i >= 0; i--){
          const color = tube[i];
          const bead = document.createElement('div');
          bead.style.width = '48px';
          bead.style.height = '48px';
          bead.style.borderRadius = '50%';
          bead.style.background = color;
          bead.style.boxShadow = 'inset 0 6px 12px rgba(255,255,255,0.35), inset 0 -6px 12px rgba(15,23,42,0.45)';
          bead.style.border = '2px solid rgba(15,23,42,0.25)';
          bead.style.transition = 'transform 0.12s ease';
          tubeEl.appendChild(bead);
        }
        tubesWrapper.appendChild(tubeEl);
      });
    }

    function beginTiming(){
      if (startedOnce) return;
      startedOnce = true;
      startTimestamp = Date.now();
    }

    function updateTimeDisplay(){
      timeInfo.value.textContent = formatTime(elapsedMs);
    }

    function updateScoreboard(){
      movesInfo.value.textContent = formatNumber(moves, { maximumFractionDigits: 0 });
      updateTimeDisplay();
      if (bestTimeMs == null){
        bestInfo.value.textContent = '-';
      } else {
        const bestMovesText = bestMoves != null ? formatNumber(bestMoves, { maximumFractionDigits: 0 }) : null;
        const formatted = `${formatTime(bestTimeMs)}${bestMovesText ? ` / ${bestMovesText}手` : ''}`;
        bestInfo.value.textContent = formatted;
      }
      solveInfo.value.textContent = formatNumber(solveCount, { maximumFractionDigits: 0 });
    }

    function setStatus(mode, data){
      if (mode === 'intro'){
        statusBar.textContent = text('.status.intro', () => `同じ色のボールを1本の試験管にまとめよう。容量は${config.capacity}個。空の試験管を使って並べ替えてね。`);
        statusBar.style.color = '#e2e8f0';
      } else if (mode === 'clear'){
        const xpText = formatNumber(data.xp ?? config.clearXp, { maximumFractionDigits: 2 });
        statusBar.textContent = text('.status.clear', () => `クリア！ ${moves} 手 / ${formatTime(elapsedMs)} 取得EXP: ${xpText}`, {
          moves,
          time: formatTime(elapsedMs),
          xp: xpText,
          difficulty,
        });
        statusBar.style.color = '#facc15';
      } else if (mode === 'invalid'){
        statusBar.textContent = text('.status.invalid', 'その移動はできません。');
        statusBar.style.color = '#f87171';
      } else {
        statusBar.textContent = '';
        statusBar.style.color = '#e2e8f0';
      }
    }

    function awardPourXp(ballsMoved){
      if (!Number.isFinite(ballsMoved) || ballsMoved <= 0) return;
      const total = config.pourXp * ballsMoved;
      if (typeof awardXp === 'function' && total > 0){
        try { awardXp(total); } catch (error){ console.warn('[MiniExp] Color Sort awardXp failed', error); }
      }
    }

    function finishGame(){
      solved = true;
      running = false;
      const now = Date.now();
      if (startedOnce){
        elapsedMs = now - startTimestamp;
        updateTimeDisplay();
      }
      solveCount += 1;
      if (bestTimeMs == null || elapsedMs < bestTimeMs){
        bestTimeMs = elapsedMs;
        bestMoves = moves;
      }
      updateScoreboard();
      setStatus('clear', { xp: config.clearXp });
      if (enableHostRestart) enableHostRestart();
      if (typeof awardXp === 'function' && config.clearXp > 0){
        try { awardXp(config.clearXp); } catch (error){ console.warn('[MiniExp] Color Sort clear award failed', error); }
      }
    }

    function attemptPour(fromIndex, toIndex){
      if (fromIndex === toIndex) return;
      const from = tubes[fromIndex];
      const to = tubes[toIndex];
      if (!from || !to) return;
      if (from.length === 0){
        setStatus('invalid');
        renderTubes();
        return;
      }
      const color = getTubeTopColor(from);
      if (color == null){
        setStatus('invalid');
        renderTubes();
        return;
      }
      if (to.length >= config.capacity){
        setStatus('invalid');
        renderTubes();
        return;
      }
      const toColor = getTubeTopColor(to);
      if (toColor != null && toColor !== color){
        setStatus('invalid');
        renderTubes();
        return;
      }
      let moved = 0;
      while (from.length > 0 && getTubeTopColor(from) === color && to.length < config.capacity){
        to.push(from.pop());
        moved += 1;
      }
      if (moved === 0){
        setStatus('invalid');
        renderTubes();
        return;
      }
      moves += 1;
      setStatus(null);
      awardPourXp(moved);
      if (!startedOnce) beginTiming();
      const now = Date.now();
      if (startedOnce){
        elapsedMs = now - startTimestamp;
      }
      renderTubes();
      updateScoreboard();
      if (isSolved(tubes)){
        finishGame();
      }
    }

    function handleTubeSelection(index){
      if (selectedTubeIndex == null){
        selectedTubeIndex = index;
        setStatus(null);
        renderTubes();
        return;
      }
      if (selectedTubeIndex === index){
        selectedTubeIndex = null;
        setStatus(null);
        renderTubes();
        return;
      }
      const fromIndex = selectedTubeIndex;
      selectedTubeIndex = null;
      attemptPour(fromIndex, index);
    }

    function resetGame(){
      if (disableHostRestart) disableHostRestart();
      tubes = ensurePlayableState();
      moves = 0;
      elapsedMs = 0;
      startedOnce = false;
      solved = false;
      running = true;
      selectedTubeIndex = null;
      startTimestamp = Date.now();
      updateScoreboard();
      renderTubes();
      setStatus('intro');
      if (!timerInterval){
        timerInterval = setInterval(() => {
          if (!running || solved || !startedOnce) return;
          elapsedMs = Date.now() - startTimestamp;
          updateTimeDisplay();
        }, 100);
      }
    }

    function handleKeyDown(event){
      if (!running) return;
      const key = event.key?.toLowerCase();
      if (key === 'r'){
        event.preventDefault();
        resetGame();
      }
    }

    resetBtn.addEventListener('click', () => {
      resetGame();
    });

    if (doc && typeof doc.addEventListener === 'function'){
      doc.addEventListener('keydown', handleKeyDown, true);
    }

    if (localization && typeof localization.onChange === 'function'){
      detachLocale = localization.onChange(() => {
        try {
          refreshTexts();
        } catch (error){
          console.warn('[MiniExp] Color Sort localization refresh failed:', error);
        }
      });
    }

    function refreshTexts(){
      const resetKey = typeof shortcuts?.getLabel === 'function' ? shortcuts.getLabel('r') || 'R' : 'R';
      title.textContent = text('.title', () => `カラーソート (${difficulty})`);
      description.textContent = text('.description', () => `上からボールを移し替えて、同じ色だけの試験管を作ろう。クリックで選択、もう一度クリックで移動先を決定。${resetKey}でリセット。`, {
        difficulty,
        capacity: config.capacity,
        colors: config.colors,
        resetKey,
      });
      resetBtn.textContent = text('.controls.reset', () => `リセット (${resetKey})`, { key: resetKey, keyLabel: resetKey });
      movesInfo.updateLabel();
      timeInfo.updateLabel();
      bestInfo.updateLabel();
      solveInfo.updateLabel();
      if (!solved && !startedOnce){
        setStatus('intro');
      }
    }

    function start(){
      if (running) return;
      resetGame();
    }

    function stop(){
      running = false;
      if (enableHostRestart) enableHostRestart();
    }

    function destroy(){
      stop();
      if (timerInterval){
        clearInterval(timerInterval);
        timerInterval = null;
      }
      if (doc && typeof doc.removeEventListener === 'function'){
        doc.removeEventListener('keydown', handleKeyDown, true);
      }
      if (detachLocale){
        try { detachLocale(); } catch {}
        detachLocale = null;
      }
      root.innerHTML = '';
    }

    function getScore(){
      return {
        moves,
        clears: solveCount,
        bestTimeMs,
        bestMoves,
        difficulty,
      };
    }

    refreshTexts();
    root.appendChild(wrapper);
    resetGame();

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({
    id: 'color_sort',
    name: 'カラーソート', nameKey: 'selection.miniexp.games.color_sort.name',
    description: 'カラフルなボールを試験管に色分けするロジックパズル。移し替えとクリアでEXP獲得。', descriptionKey: 'selection.miniexp.games.color_sort.description', categoryIds: ['puzzle'],
    category: 'パズル',
    create
  });
})();

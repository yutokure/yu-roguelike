(function(){
  /**
   * MiniExp MOD: Arrow Escape Puzzle
   * Click blocks to let them escape along their arrow direction. Generate puzzles via reverse-playback.
   */
  const GLOBAL = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});

  const DIRECTION_DEFS = {
    up:    { dr: -1, dc:  0, arrow: '\u2191', rotation: 'rotate(0deg)' },
    down:  { dr:  1, dc:  0, arrow: '\u2193', rotation: 'rotate(180deg)' },
    left:  { dr:  0, dc: -1, arrow: '\u2190', rotation: 'rotate(-90deg)' },
    right: { dr:  0, dc:  1, arrow: '\u2192', rotation: 'rotate(90deg)' }
  };

  const CONFIG_BY_DIFFICULTY = {
    EASY:   { width: 5, height: 5, blocks: 10, escapeXp: 0.35, clearXp: 6 },
    NORMAL: { width: 6, height: 6, blocks: 16, escapeXp: 0.55, clearXp: 14 },
    HARD:   { width: 7, height: 7, blocks: 22, escapeXp: 0.85, clearXp: 28 }
  };

  function pickConfig(difficulty){
    const upper = typeof difficulty === 'string' ? difficulty.toUpperCase() : 'NORMAL';
    return CONFIG_BY_DIFFICULTY[upper] || CONFIG_BY_DIFFICULTY.NORMAL;
  }

  function randomItem(list){
    return list[Math.floor(Math.random() * list.length)];
  }

  function create(root, awardXp, opts){
    if (!root) throw new Error('Arrow Escape requires a container element.');

    const difficulty = (opts && opts.difficulty) || 'NORMAL';
    const config = pickConfig(difficulty);
    const shortcuts = opts?.shortcuts || null;
    const localization = opts?.localization || (GLOBAL && typeof GLOBAL.createMiniGameLocalization === 'function'
      ? GLOBAL.createMiniGameLocalization({ id: 'arrow_escape' })
      : null);

    const text = (key, fallback, params) => {
      if (localization && typeof localization.t === 'function'){
        return localization.t(key, fallback, params);
      }
      if (typeof fallback === 'function') return fallback(params || {});
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

    const disableHostRestart = typeof shortcuts?.disableHostRestart === 'function'
      ? () => { try { shortcuts.disableHostRestart(); } catch {} }
      : () => {};
    const enableHostRestart = typeof shortcuts?.enableHostRestart === 'function'
      ? () => { try { shortcuts.enableHostRestart(); } catch {} }
      : () => {};

    let running = false;
    let timerId = null;
    let startedAt = 0;
    let elapsedMs = 0;
    let puzzle = null;
    let remaining = 0;
    let escaped = 0;
    let bestTimeMs = null;
    let totalClears = 0;

    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.maxWidth = '520px';
    wrapper.style.margin = '0 auto';
    wrapper.style.padding = '16px';
    wrapper.style.boxSizing = 'border-box';
    wrapper.style.fontFamily = "'Segoe UI', system-ui, sans-serif";
    wrapper.style.color = '#f8fafc';
    wrapper.style.background = '#020617';
    wrapper.style.borderRadius = '18px';
    wrapper.style.boxShadow = '0 18px 36px rgba(15,23,42,0.55)';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.justifyContent = 'space-between';
    header.style.marginBottom = '8px';

    const title = document.createElement('div');
    title.style.fontSize = '20px';
    title.style.fontWeight = '600';
    title.style.letterSpacing = '0.02em';
    title.textContent = text('.title', () => `Arrow Escape (${difficulty})`, { difficulty });

    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.textContent = text('.actions.reset', 'リセット');
    resetButton.style.background = '#1e293b';
    resetButton.style.color = '#e2e8f0';
    resetButton.style.border = '1px solid rgba(148,163,184,0.45)';
    resetButton.style.borderRadius = '999px';
    resetButton.style.padding = '6px 14px';
    resetButton.style.fontSize = '13px';
    resetButton.style.cursor = 'pointer';
    resetButton.style.transition = 'transform 120ms ease, background 120ms ease';
    resetButton.addEventListener('mouseenter', () => { resetButton.style.background = '#334155'; });
    resetButton.addEventListener('mouseleave', () => { resetButton.style.background = '#1e293b'; });
    resetButton.addEventListener('mousedown', () => { resetButton.style.transform = 'scale(0.96)'; });
    resetButton.addEventListener('mouseup', () => { resetButton.style.transform = 'scale(1)'; });

    header.appendChild(title);
    header.appendChild(resetButton);

    const description = document.createElement('div');
    description.style.fontSize = '13px';
    description.style.lineHeight = '1.5';
    description.style.opacity = '0.88';
    description.style.marginBottom = '12px';
    description.textContent = text('.description', '矢印方向にクリックしてすべてのブロックを外へ脱出させよう。進路に他のブロックがあると動けません。');

    const infoBar = document.createElement('div');
    infoBar.style.display = 'grid';
    infoBar.style.gridTemplateColumns = 'repeat(auto-fit, minmax(120px, 1fr))';
    infoBar.style.gap = '8px';
    infoBar.style.marginBottom = '12px';

    function createInfoCard(labelKey, fallback){
      const card = document.createElement('div');
      card.style.background = '#0f172a';
      card.style.border = '1px solid rgba(148,163,184,0.25)';
      card.style.borderRadius = '12px';
      card.style.padding = '8px 10px';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.gap = '4px';

      const label = document.createElement('div');
      label.style.fontSize = '12px';
      label.style.textTransform = 'uppercase';
      label.style.letterSpacing = '0.08em';
      label.style.opacity = '0.6';
      const value = document.createElement('div');
      value.style.fontVariantNumeric = 'tabular-nums';
      value.style.fontSize = '18px';
      value.style.fontWeight = '600';

      card.appendChild(label);
      card.appendChild(value);

      const updateLabel = () => {
        label.textContent = text(labelKey, fallback);
      };

      updateLabel();

      return { card, value, updateLabel };
    }

    const remainingInfo = createInfoCard('.info.remaining', '残りブロック');
    const escapedInfo = createInfoCard('.info.escaped', '脱出済み');
    const timeInfo = createInfoCard('.info.time', '経過時間');
    const clearInfo = createInfoCard('.info.clears', '累計クリア');

    timeInfo.value.textContent = '0:00.0';
    clearInfo.value.textContent = '0';

    infoBar.appendChild(remainingInfo.card);
    infoBar.appendChild(escapedInfo.card);
    infoBar.appendChild(timeInfo.card);
    infoBar.appendChild(clearInfo.card);

    const boardFrame = document.createElement('div');
    boardFrame.style.position = 'relative';
    boardFrame.style.background = 'linear-gradient(160deg, #0f172a, #020617)';
    boardFrame.style.borderRadius = '14px';
    boardFrame.style.padding = '12px';
    boardFrame.style.boxShadow = 'inset 0 0 0 1px rgba(148,163,184,0.25)';

    const boardEl = document.createElement('div');
    boardEl.style.position = 'relative';
    boardEl.style.width = '100%';
    boardEl.style.paddingBottom = `${(config.height / config.width) * 100}%`;
    boardEl.style.background = '#020617';
    boardEl.style.borderRadius = '10px';
    boardEl.style.boxShadow = 'inset 0 0 0 1px rgba(148,163,184,0.2)';
    boardEl.style.overflow = 'hidden';

    const gridLayer = document.createElement('div');
    gridLayer.style.position = 'absolute';
    gridLayer.style.left = '0';
    gridLayer.style.top = '0';
    gridLayer.style.right = '0';
    gridLayer.style.bottom = '0';
    gridLayer.style.display = 'grid';
    gridLayer.style.gridTemplateColumns = `repeat(${config.width}, 1fr)`;
    gridLayer.style.gridTemplateRows = `repeat(${config.height}, 1fr)`;
    gridLayer.style.gap = '6px';
    gridLayer.style.padding = '12px';
    gridLayer.style.boxSizing = 'border-box';

    const floatLayer = document.createElement('div');
    floatLayer.style.position = 'absolute';
    floatLayer.style.left = '0';
    floatLayer.style.top = '0';
    floatLayer.style.right = '0';
    floatLayer.style.bottom = '0';
    floatLayer.style.pointerEvents = 'none';

    boardEl.appendChild(gridLayer);
    boardEl.appendChild(floatLayer);
    boardFrame.appendChild(boardEl);

    const statusBar = document.createElement('div');
    statusBar.style.marginTop = '12px';
    statusBar.style.minHeight = '20px';
    statusBar.style.fontSize = '13px';
    statusBar.style.opacity = '0.9';

    wrapper.appendChild(header);
    wrapper.appendChild(description);
    wrapper.appendChild(infoBar);
    wrapper.appendChild(boardFrame);
    wrapper.appendChild(statusBar);

    root.appendChild(wrapper);

    const cellElements = Array.from({ length: config.height }, () => Array(config.width));
    for (let r = 0; r < config.height; r++){
      for (let c = 0; c < config.width; c++){
        const cell = document.createElement('div');
        cell.style.position = 'relative';
        cell.style.borderRadius = '10px';
        cell.style.background = 'rgba(15,23,42,0.85)';
        cell.style.boxShadow = 'inset 0 0 0 1px rgba(71,85,105,0.35)';
        cell.style.transition = 'background 150ms ease';
        cellElements[r][c] = cell;
        gridLayer.appendChild(cell);
      }
    }

    function updateInfo(){
      remainingInfo.value.textContent = formatNumber(remaining, { maximumFractionDigits: 0 });
      escapedInfo.value.textContent = formatNumber(escaped, { maximumFractionDigits: 0 });
      clearInfo.value.textContent = formatNumber(totalClears, { maximumFractionDigits: 0 });
    }

    function formatTime(ms){
      if (!Number.isFinite(ms) || ms < 0) return '0:00.0';
      const totalSeconds = Math.floor(ms / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const tenths = Math.floor((ms % 1000) / 100);
      const mm = minutes.toString();
      const ss = seconds.toString().padStart(2, '0');
      return `${mm}:${ss}.${tenths}`;
    }

    function updateTimeDisplay(){
      const now = running ? performance.now() : startedAt;
      const elapsed = running ? (elapsedMs + (now - startedAt)) : elapsedMs;
      timeInfo.value.textContent = formatTime(elapsed);
    }

    function startTimer(){
      if (timerId) clearInterval(timerId);
      startedAt = performance.now();
      elapsedMs = 0;
      timerId = setInterval(() => {
        updateTimeDisplay();
      }, 100);
      updateTimeDisplay();
    }

    function stopTimer(){
      if (timerId){
        clearInterval(timerId);
        timerId = null;
      }
      if (running){
        elapsedMs += performance.now() - startedAt;
      }
      updateTimeDisplay();
    }

    function grantXp(amount, meta){
      if (typeof awardXp === 'function' && Number.isFinite(amount) && amount > 0){
        try { awardXp(amount, meta); } catch (error){ console.warn('[arrow_escape] awardXp failed', error); }
      }
    }

    function computeCells(){
      return puzzle?.grid;
    }

    function isPathClear(block){
      if (!block || !block.active) return false;
      const deltas = DIRECTION_DEFS[block.dir];
      const grid = computeCells();
      if (!grid || !deltas) return false;
      let r = block.row;
      let c = block.col;
      while (true){
        r += deltas.dr;
        c += deltas.dc;
        if (r < 0 || r >= config.height || c < 0 || c >= config.width){
          return true;
        }
        if (grid[r][c]){
          return false;
        }
      }
    }

    function animateEscape(block, onComplete){
      const cell = cellElements[block.row][block.col];
      const blockEl = block.el;
      if (!cell || !blockEl){
        onComplete?.();
        return;
      }
      const boardRect = boardEl.getBoundingClientRect();
      const cellRect = cell.getBoundingClientRect();
      const ghost = blockEl.cloneNode(true);
      ghost.style.position = 'absolute';
      ghost.style.left = `${cellRect.left - boardRect.left}px`;
      ghost.style.top = `${cellRect.top - boardRect.top}px`;
      ghost.style.width = `${cellRect.width}px`;
      ghost.style.height = `${cellRect.height}px`;
      ghost.style.display = 'flex';
      ghost.style.alignItems = 'center';
      ghost.style.justifyContent = 'center';
      ghost.style.borderRadius = blockEl.style.borderRadius;
      ghost.style.background = blockEl.style.background;
      ghost.style.color = blockEl.style.color;
      ghost.style.boxShadow = blockEl.style.boxShadow;
      ghost.style.fontSize = blockEl.style.fontSize;
      ghost.style.fontWeight = blockEl.style.fontWeight;
      ghost.style.transition = 'transform 220ms ease, opacity 220ms ease';
      ghost.style.willChange = 'transform, opacity';
      floatLayer.appendChild(ghost);

      blockEl.style.opacity = '0';

      const delta = DIRECTION_DEFS[block.dir];
      const translateX = delta.dc * (boardRect.width + cellRect.width * 0.8);
      const translateY = delta.dr * (boardRect.height + cellRect.height * 0.8);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          ghost.style.transform = `translate(${translateX}px, ${translateY}px)`;
          ghost.style.opacity = '0';
        });
      });

      const cleanup = () => {
        ghost.removeEventListener('transitionend', cleanup);
        ghost.remove();
        onComplete?.();
      };
      ghost.addEventListener('transitionend', cleanup);
    }

    function setStatus(mode, params){
      if (mode === 'clear'){
        const timeText = formatTime(params.timeMs);
        const xpText = formatNumber(params.xpAwarded, { maximumFractionDigits: 2 });
        statusBar.textContent = text('.status.clear', () => `クリア！ ${timeText} / 取得EXP ${xpText}`, {
          time: timeText,
          xp: xpText,
          difficulty,
          clears: totalClears
        });
        statusBar.style.color = '#facc15';
      } else if (mode === 'intro'){
        statusBar.textContent = text('.status.intro', 'すべてのブロックを外へ導く順番を見極めましょう。');
        statusBar.style.color = '#e2e8f0';
      } else if (mode === 'running'){
        statusBar.textContent = '';
        statusBar.style.color = '#e2e8f0';
      }
    }

    function markBlocked(block){
      if (!block || !block.el) return;
      const el = block.el;
      el.style.transition = 'transform 90ms ease';
      el.style.transform = 'scale(0.92)';
      el.style.boxShadow = '0 0 0 2px rgba(248,113,113,0.65)';
      setTimeout(() => {
        el.style.transform = 'scale(1)';
        el.style.boxShadow = '0 8px 18px rgba(15,23,42,0.55)';
      }, 120);
    }

    function removeBlock(block){
      if (!block || !block.active) return;
      const grid = computeCells();
      grid[block.row][block.col] = null;
      block.active = false;
      const element = block.el;
      if (element){
        animateEscape(block, () => {
          element.remove();
        });
      }
      block.el = null;
      remaining -= 1;
      escaped += 1;
      grantXp(config.escapeXp, { reason: 'escape', difficulty });
      updateInfo();
      if (remaining <= 0){
        stopTimer();
        running = false;
        enableHostRestart();
        totalClears += 1;
        clearInfo.value.textContent = formatNumber(totalClears, { maximumFractionDigits: 0 });
        if (!bestTimeMs || elapsedMs < bestTimeMs){
          bestTimeMs = elapsedMs;
        }
        const totalXp = config.clearXp;
        grantXp(totalXp, { reason: 'clear', difficulty, elapsedMs });
        setStatus('clear', { timeMs: elapsedMs, xpAwarded: totalXp });
      }
    }

    function handleBlockClick(block){
      if (!running || !block?.active) return;
      if (isPathClear(block)){
        removeBlock(block);
      } else {
        markBlocked(block);
      }
    }

    function bindBlockElement(block){
      const cell = cellElements[block.row][block.col];
      if (!cell) return;
      const tile = document.createElement('div');
      tile.style.position = 'absolute';
      tile.style.left = '0';
      tile.style.top = '0';
      tile.style.right = '0';
      tile.style.bottom = '0';
      tile.style.margin = '2px';
      tile.style.borderRadius = '10px';
      tile.style.display = 'flex';
      tile.style.alignItems = 'center';
      tile.style.justifyContent = 'center';
      tile.style.fontSize = '28px';
      tile.style.fontWeight = '700';
      tile.style.cursor = 'pointer';
      tile.style.color = '#0f172a';
      tile.style.background = 'linear-gradient(135deg, #38bdf8, #3b82f6)';
      tile.style.boxShadow = '0 8px 18px rgba(15,23,42,0.55)';
      tile.style.transition = 'transform 120ms ease, box-shadow 120ms ease, opacity 120ms ease';
      tile.textContent = DIRECTION_DEFS[block.dir].arrow;
      tile.setAttribute('role', 'button');
      const directionName = DIRECTION_DEFS[block.dir]?.arrow || block.dir;
      tile.setAttribute('aria-label', text('.block.ariaLabel', params => {
        const label = params && params.direction ? params.direction : directionName;
        return `Block ${label}`;
      }, { direction: directionName }));
      tile.addEventListener('click', () => handleBlockClick(block));
      cell.appendChild(tile);
      block.el = tile;
    }

    function resetBoard(){
      floatLayer.innerHTML = '';
      for (let r = 0; r < config.height; r++){
        for (let c = 0; c < config.width; c++){
          const cell = cellElements[r][c];
          if (cell){
            while (cell.firstChild){ cell.removeChild(cell.firstChild); }
          }
        }
      }
    }

    function computeCandidates(grid, dir, index){
      const height = config.height;
      const width = config.width;
      const candidates = [];
      if (dir === 'up'){
        let limit = height;
        for (let r = 0; r < height; r++){
          if (grid[r][index]){ limit = r; break; }
        }
        for (let r = 0; r < limit; r++){
          if (!grid[r][index]) candidates.push({ row: r, col: index });
        }
      } else if (dir === 'down'){
        let limit = -1;
        for (let r = height - 1; r >= 0; r--){
          if (grid[r][index]){ limit = r; break; }
        }
        for (let r = height - 1; r > limit; r--){
          if (!grid[r][index]) candidates.push({ row: r, col: index });
        }
      } else if (dir === 'left'){
        let limit = width;
        for (let c = 0; c < width; c++){
          if (grid[index][c]){ limit = c; break; }
        }
        for (let c = 0; c < limit; c++){
          if (!grid[index][c]) candidates.push({ row: index, col: c });
        }
      } else if (dir === 'right'){
        let limit = -1;
        for (let c = width - 1; c >= 0; c--){
          if (grid[index][c]){ limit = c; break; }
        }
        for (let c = width - 1; c > limit; c--){
          if (!grid[index][c]) candidates.push({ row: index, col: c });
        }
      }
      return candidates;
    }

    function generatePuzzle(){
      const width = config.width;
      const height = config.height;
      const grid = Array.from({ length: height }, () => Array(width).fill(null));
      const blocks = [];
      const dirs = Object.keys(DIRECTION_DEFS);
      const maxAttempts = config.blocks * 60;
      let attempts = 0;
      while (blocks.length < config.blocks && attempts < maxAttempts){
        attempts++;
        const dir = randomItem(dirs);
        const lineIndex = (dir === 'up' || dir === 'down')
          ? Math.floor(Math.random() * width)
          : Math.floor(Math.random() * height);
        const candidates = computeCandidates(grid, dir, lineIndex);
        if (!candidates.length) continue;
        const chosen = randomItem(candidates);
        const block = {
          id: `b${blocks.length}`,
          row: chosen.row,
          col: chosen.col,
          dir,
          active: true,
          el: null
        };
        grid[chosen.row][chosen.col] = block;
        blocks.push(block);
      }

      if (blocks.length < config.blocks){
        outer: for (let dir of dirs){
          for (let lineIndex = 0; lineIndex < (dir === 'up' || dir === 'down' ? width : height); lineIndex++){
            const candidates = computeCandidates(grid, dir, lineIndex);
            for (const candidate of candidates){
              const block = {
                id: `b${blocks.length}`,
                row: candidate.row,
                col: candidate.col,
                dir,
                active: true,
                el: null
              };
              grid[candidate.row][candidate.col] = block;
              blocks.push(block);
              if (blocks.length >= config.blocks){
                break outer;
              }
            }
          }
        }
      }

      return { grid, blocks };
    }

    function buildBoard(){
      resetBoard();
      puzzle = generatePuzzle();
      remaining = puzzle.blocks.length;
      escaped = 0;
      updateInfo();
      timeInfo.value.textContent = '0:00.0';
      elapsedMs = 0;
      startedAt = performance.now();
      const grid = puzzle.grid;
      for (const block of puzzle.blocks){
        bindBlockElement(block);
      }
      setStatus('intro');
    }

    function start(){
      if (running) return;
      running = true;
      disableHostRestart();
      if (!puzzle){
        buildBoard();
      }
      startTimer();
      setStatus('running');
    }

    function restart(){
      if (running){
        stopTimer();
      }
      running = true;
      disableHostRestart();
      buildBoard();
      startTimer();
      setStatus('running');
    }

    function stop(){
      if (!running) return;
      running = false;
      stopTimer();
      enableHostRestart();
    }

    function destroy(){
      stop();
      if (timerId){
        clearInterval(timerId);
        timerId = null;
      }
      try { localization && typeof localization.destroy === 'function' && localization.destroy(); } catch {}
      wrapper.remove();
    }

    function getScore(){
      return totalClears;
    }

    resetButton.addEventListener('click', () => {
      restart();
    });

    buildBoard();
    start();

    return { start, stop, destroy, getScore };
  }

  if (GLOBAL && typeof GLOBAL.registerMiniGame === 'function'){
    GLOBAL.registerMiniGame({
      id: 'arrow_escape',
      name: 'アローエスケープ',
      nameKey: 'selection.miniexp.games.arrow_escape.name',
      description: '矢印の向きにブロックを飛ばして全脱出',
      descriptionKey: 'selection.miniexp.games.arrow_escape.description',
      categoryIds: ['puzzle'],
      create
    });
  }
})();

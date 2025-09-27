(function(){
  /** MiniExp MOD: Sliding Puzzle (8/15/24 depending on difficulty)
   *  - EASY: 3x3 (8-puzzle), NORMAL: 4x4 (15-puzzle), HARD: 5x5 (24-puzzle)
   */
  function create(root, awardXp, opts){
    const difficulty = (opts && opts.difficulty) || 'NORMAL';
    const shortcuts = opts?.shortcuts;
    const sizeMap = { EASY: 3, NORMAL: 4, HARD: 5 };
    const boardSize = sizeMap[difficulty] || sizeMap.NORMAL;
    const tileCount = boardSize * boardSize;
    const moveXp = { EASY: 0.18, NORMAL: 0.25, HARD: 0.35 }[difficulty] || 0.25;
    const solveXp = { EASY: 8, NORMAL: 24, HARD: 55 }[difficulty] || 24;
    const moveBatch = boardSize <= 3 ? 2 : 3;

    let running = false;
    let solved = false;
    let startedOnce = false;
    let board = [];
    let blankIndex = tileCount - 1;
    let moves = 0;
    let elapsedMs = 0;
    let bestTimeMs = null;
    let solveCount = 0;

    let moveXpBuffer = 0;
    let bufferedMoves = 0;

    let timerInterval = null;

    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.maxWidth = '460px';
    wrapper.style.margin = '0 auto';
    wrapper.style.padding = '12px 12px 20px';
    wrapper.style.boxSizing = 'border-box';
    wrapper.style.fontFamily = "'Segoe UI', system-ui, sans-serif";
    wrapper.style.color = '#e2e8f0';
    wrapper.style.background = '#000';
    wrapper.style.borderRadius = '16px';
    wrapper.style.boxShadow = '0 12px 32px rgba(0,0,0,0.55)';

    const title = document.createElement('div');
    title.textContent = `${boardSize}×${boardSize} スライドパズル`;
    title.style.fontSize = '20px';
    title.style.fontWeight = '600';
    title.style.marginBottom = '8px';

    const description = document.createElement('div');
    description.textContent = '空きマスにタイルをスライドして 1 → N の順に揃えよう。クリックまたは矢印キー/WASDで操作。Rで再スタート。';
    description.style.fontSize = '13px';
    description.style.lineHeight = '1.45';
    description.style.opacity = '0.85';
    description.style.marginBottom = '12px';

    const infoBar = document.createElement('div');
    infoBar.style.display = 'flex';
    infoBar.style.flexWrap = 'wrap';
    infoBar.style.gap = '8px 16px';
    infoBar.style.marginBottom = '12px';
    infoBar.style.fontSize = '13px';

    function createInfo(label){
      const span = document.createElement('span');
      span.style.display = 'flex';
      span.style.gap = '4px';
      const strong = document.createElement('span'); strong.textContent = label; strong.style.opacity = '0.7';
      const value = document.createElement('span'); value.textContent = '0'; value.style.fontVariantNumeric = 'tabular-nums';
      span.appendChild(strong); span.appendChild(value);
      return { span, value };
    }

    const movesInfo = createInfo('Moves');
    const timeInfo = createInfo('Time');
    const bestInfo = createInfo('Best');
    const solveInfo = createInfo('Clears');

    bestInfo.value.textContent = '-';
    timeInfo.value.textContent = '0:00.0';
    solveInfo.value.textContent = '0';

    infoBar.appendChild(movesInfo.span);
    infoBar.appendChild(timeInfo.span);
    infoBar.appendChild(bestInfo.span);
    infoBar.appendChild(solveInfo.span);

    const boardFrame = document.createElement('div');
    boardFrame.style.position = 'relative';
    boardFrame.style.width = '100%';
    boardFrame.style.paddingBottom = '100%';
    boardFrame.style.background = '#000';
    boardFrame.style.borderRadius = '12px';
    boardFrame.style.boxShadow = '0 12px 24px rgba(15,23,42,0.35) inset, 0 0 0 1px rgba(148,163,184,0.3) inset';

    const boardEl = document.createElement('div');
    boardEl.setAttribute('tabindex', '0');
    boardEl.style.position = 'absolute';
    boardEl.style.left = '12px';
    boardEl.style.top = '12px';
    boardEl.style.right = '12px';
    boardEl.style.bottom = '12px';
    boardEl.style.display = 'grid';
    boardEl.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
    boardEl.style.gridTemplateRows = `repeat(${boardSize}, 1fr)`;
    boardEl.style.gap = '8px';
    boardEl.style.background = '#000';

    const statusBar = document.createElement('div');
    statusBar.style.marginTop = '14px';
    statusBar.style.minHeight = '20px';
    statusBar.style.fontSize = '13px';
    statusBar.style.opacity = '0.9';

    const controlsBar = document.createElement('div');
    controlsBar.style.marginTop = '12px';
    controlsBar.style.display = 'flex';
    controlsBar.style.gap = '12px';
    controlsBar.style.flexWrap = 'wrap';

    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'リセット (R)';
    resetBtn.style.padding = '8px 16px';
    resetBtn.style.fontSize = '13px';
    resetBtn.style.borderRadius = '999px';
    resetBtn.style.border = '1px solid rgba(148,163,184,0.35)';
    resetBtn.style.background = 'rgba(15,23,42,0.75)';
    resetBtn.style.color = '#f8fafc';
    resetBtn.style.cursor = 'pointer';
    resetBtn.style.boxShadow = '0 2px 6px rgba(15,23,42,0.4)';
    resetBtn.addEventListener('click', function(){ resetAndStart(); });

    controlsBar.appendChild(resetBtn);

    boardFrame.appendChild(boardEl);

    wrapper.appendChild(title);
    wrapper.appendChild(description);
    wrapper.appendChild(infoBar);
    wrapper.appendChild(boardFrame);
    wrapper.appendChild(statusBar);
    wrapper.appendChild(controlsBar);
    root.appendChild(wrapper);

    const tiles = [];
    for (let i = 0; i < tileCount; i++){
      const tile = document.createElement('div');
      tile.dataset.pos = String(i);
      tile.style.display = 'flex';
      tile.style.alignItems = 'center';
      tile.style.justifyContent = 'center';
      tile.style.fontSize = boardSize >= 5 ? '18px' : boardSize === 3 ? '28px' : '22px';
      tile.style.fontWeight = '600';
      tile.style.borderRadius = '10px';
      tile.style.boxShadow = '0 4px 12px rgba(15,23,42,0.5)';
      tile.style.transition = 'filter 120ms ease';
      tile.style.userSelect = 'none';
      tile.style.cursor = 'pointer';
      tile.addEventListener('click', onTilePointer);
      tiles.push(tile);
      boardEl.appendChild(tile);
    }

    function onTilePointer(e){
      const idx = Number(e.currentTarget.dataset.pos || '0');
      attemptMove(idx);
    }

    function onKeyDown(e){
      const key = e.key;
      if (key === 'r' || key === 'R'){
        e.preventDefault();
        resetAndStart();
        return;
      }
      if (solved) return;
      if (!running) return;
      let target = -1;
      if (key === 'ArrowUp' || key === 'w' || key === 'W'){
        if (blankIndex + boardSize < tileCount) target = blankIndex + boardSize;
      } else if (key === 'ArrowDown' || key === 's' || key === 'S'){
        if (blankIndex - boardSize >= 0) target = blankIndex - boardSize;
      } else if (key === 'ArrowLeft' || key === 'a' || key === 'A'){
        if (blankIndex % boardSize < boardSize - 1) target = blankIndex + 1;
      } else if (key === 'ArrowRight' || key === 'd' || key === 'D'){
        if (blankIndex % boardSize > 0) target = blankIndex - 1;
      }
      if (target >= 0){
        e.preventDefault();
        attemptMove(target);
      }
    }

    boardEl.addEventListener('keydown', onKeyDown);

    function formatTime(ms){
      const totalSeconds = Math.floor(ms / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const tenths = Math.floor((ms % 1000) / 100);
      return `${minutes}:${seconds.toString().padStart(2,'0')}.${tenths}`;
    }

    function updateInfo(){
      movesInfo.value.textContent = String(moves);
      timeInfo.value.textContent = formatTime(elapsedMs);
      bestInfo.value.textContent = bestTimeMs == null ? '-' : formatTime(bestTimeMs);
      solveInfo.value.textContent = String(solveCount);
    }

    function tintTile(tile, idx, value){
      if (value === 0){
        tile.textContent = '';
        tile.style.background = 'rgba(30,41,59,0.35)';
        tile.style.boxShadow = '0 0 0 1px rgba(148,163,184,0.25) inset';
        tile.style.cursor = 'default';
      } else {
        tile.textContent = String(value);
        const correct = value === idx + 1;
        tile.style.background = correct ? 'linear-gradient(160deg, #22d3ee, #0ea5e9)' : 'linear-gradient(160deg, #64748b, #475569)';
        tile.style.boxShadow = correct ? '0 6px 16px rgba(14,165,233,0.4)' : '0 4px 10px rgba(15,23,42,0.55)';
        tile.style.filter = correct ? 'brightness(1.05)' : 'none';
        tile.style.cursor = 'pointer';
      }
    }

    function render(){
      for (let i = 0; i < tileCount; i++){
        tintTile(tiles[i], i, board[i]);
      }
    }

    function countInversions(arr){
      let inv = 0;
      for (let i = 0; i < arr.length; i++){
        const current = arr[i];
        if (current === 0) continue;
        for (let j = i + 1; j < arr.length; j++){
          const next = arr[j];
          if (next !== 0 && next < current) inv++;
        }
      }
      return inv;
    }

    function isSolvedArrangement(arr){
      for (let i = 0; i < arr.length - 1; i++){
        if (arr[i] !== i + 1) return false;
      }
      return arr[arr.length - 1] === 0;
    }

    function isSolvable(arr){
      const inv = countInversions(arr);
      if (boardSize % 2 === 1){
        return inv % 2 === 0;
      }
      const zeroRowFromTop = Math.floor(arr.indexOf(0) / boardSize);
      const zeroRowFromBottom = boardSize - zeroRowFromTop;
      if (zeroRowFromBottom % 2 === 0){
        return inv % 2 === 1;
      }
      return inv % 2 === 0;
    }

    function shuffledBoard(){
      const arr = [];
      for (let i = 1; i < tileCount; i++) arr.push(i);
      arr.push(0);
      let attempts = 0;
      do {
        // Fisher-Yates shuffle
        for (let i = arr.length - 1; i > 0; i--){
          const j = (Math.random() * (i + 1)) | 0;
          const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
        }
        attempts++;
        if (attempts > 50){
          // fallback: swap last two tiles (keeps solvability parity flip for even board)
          const idxA = arr.length - 2;
          const idxB = arr.length - 3;
          const tmp = arr[idxA]; arr[idxA] = arr[idxB]; arr[idxB] = tmp;
        }
      } while (!isSolvable(arr) || isSolvedArrangement(arr));
      return arr;
    }

    function commitMoveXp(force, meta){
      if (moveXpBuffer <= 0) return;
      if (!force && bufferedMoves < moveBatch) return;
      const payload = Object.assign({ type: 'move', difficulty }, meta || {});
      awardXp(moveXpBuffer, payload);
      moveXpBuffer = 0;
      bufferedMoves = 0;
    }

    function attemptMove(index){
      if (solved) return;
      if (!running) return;
      if (index < 0 || index >= tileCount) return;
      const sameRow = Math.floor(index / boardSize) === Math.floor(blankIndex / boardSize);
      const diff = Math.abs(index - blankIndex);
      const adjacent = (sameRow && diff === 1) || diff === boardSize;
      if (!adjacent) return;
      const tileVal = board[index];
      board[blankIndex] = tileVal;
      board[index] = 0;
      blankIndex = index;
      moves += 1;
      bufferedMoves += 1;
      moveXpBuffer += moveXp;
      commitMoveXp(false);
      render();
      updateInfo();
      if (isSolvedArrangement(board)){
        solved = true;
        running = false;
        stopTimer();
        commitMoveXp(true, { reason: 'solve' });
        elapsedMs = mathClamp(elapsedMs);
        const total = awardXp(solveXp, { type: 'solve', difficulty, moves, timeMs: elapsedMs });
        if (window.playSfx) window.playSfx('pickup');
        solveCount += 1;
        if (bestTimeMs == null || elapsedMs < bestTimeMs){
          bestTimeMs = elapsedMs;
        }
        enableHostRestart();
        updateInfo();
        statusBar.textContent = `クリア！ ${moves} 手 / ${formatTime(elapsedMs)} 取得EXP: ${total ?? solveXp}`;
        statusBar.style.color = '#facc15';
      }
    }

    function mathClamp(v){
      if (!Number.isFinite(v) || v < 0) return 0;
      return Math.min(v, 24 * 60 * 60 * 1000);
    }

    function startTimer(){
      stopTimer();
      const base = performance.now() - elapsedMs;
      timerInterval = setInterval(function(){
        if (!running) return;
        elapsedMs = performance.now() - base;
        updateInfo();
      }, 80);
    }

    function stopTimer(){
      if (timerInterval){
        clearInterval(timerInterval);
        timerInterval = null;
      }
    }

    function setupBoard(){
      board = shuffledBoard();
      blankIndex = board.indexOf(0);
      moves = 0;
      elapsedMs = 0;
      moveXpBuffer = 0;
      bufferedMoves = 0;
      solved = false;
      statusBar.textContent = `ノーマルなら15パズル、イージーは8パズル、ハードは24パズルです。`; 
      statusBar.style.color = '#e2e8f0';
      render();
      updateInfo();
    }

    function disableHostRestart(){
      shortcuts?.disableKey('r');
    }

    function enableHostRestart(){
      shortcuts?.enableKey('r');
    }

    function resetAndStart(){
      stop({ keepShortcutsDisabled: true });
      setupBoard();
      startedOnce = true;
      start();
    }

    function start(){
      if (running) return;
      if (!startedOnce || solved){
        setupBoard();
        startedOnce = true;
      }
      solved = false;
      running = true;
      disableHostRestart();
      startTimer();
      updateInfo();
      try { boardEl.focus({ preventScroll: true }); } catch {}
    }

    function stop(opts = {}){
      if (!running) return;
      running = false;
      stopTimer();
      commitMoveXp(true, { reason: 'stop' });
      updateInfo();
      if (!opts.keepShortcutsDisabled){
        enableHostRestart();
      }
    }

    function destroy(){
      stop();
      tiles.forEach(function(tile){ tile.removeEventListener('click', onTilePointer); });
      boardEl.removeEventListener('keydown', onKeyDown);
      wrapper.remove();
    }

    function getScore(){
      return solveCount;
    }

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({
    id: 'sliding_puzzle',
    name: 'スライドパズル',
    description: 'EASY=8 / NORMAL=15 / HARD=24のスライドパズル',
    create
  });
})();

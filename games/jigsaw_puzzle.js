(function(){
  /** MiniExp MOD: Jigsaw Puzzle
   *  - Load any image from file or URL and choose arbitrary rows/columns.
   *  - Swap tiles to reconstruct the original picture.
   */
  function create(root, awardXp, opts){
    const shortcuts = opts?.shortcuts;
    const localization = opts?.localization || (typeof window !== 'undefined' && typeof window.createMiniGameLocalization === 'function'
      ? window.createMiniGameLocalization({ id: 'jigsaw_puzzle' })
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

    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.maxWidth = '520px';
    wrapper.style.margin = '0 auto';
    wrapper.style.padding = '14px 14px 22px';
    wrapper.style.boxSizing = 'border-box';
    wrapper.style.fontFamily = "'Segoe UI', system-ui, sans-serif";
    wrapper.style.color = '#e2e8f0';
    wrapper.style.background = '#020617';
    wrapper.style.borderRadius = '18px';
    wrapper.style.boxShadow = '0 14px 32px rgba(15,23,42,0.65)';

    const title = document.createElement('div');
    title.style.fontSize = '21px';
    title.style.fontWeight = '600';
    title.style.marginBottom = '6px';

    const description = document.createElement('div');
    description.style.fontSize = '13px';
    description.style.lineHeight = '1.5';
    description.style.opacity = '0.85';
    description.style.marginBottom = '14px';

    const controls = document.createElement('div');
    controls.style.display = 'flex';
    controls.style.flexDirection = 'column';
    controls.style.gap = '10px';
    controls.style.marginBottom = '16px';

    const sizeRow = document.createElement('div');
    sizeRow.style.display = 'flex';
    sizeRow.style.flexWrap = 'wrap';
    sizeRow.style.gap = '8px';
    sizeRow.style.alignItems = 'center';

    const createNumberInput = (labelText, initial) => {
      const container = document.createElement('label');
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      container.style.gap = '6px';
      container.style.fontSize = '13px';
      const span = document.createElement('span');
      span.textContent = labelText;
      span.style.opacity = '0.75';
      const input = document.createElement('input');
      input.type = 'number';
      input.min = '2';
      input.max = '12';
      input.value = initial;
      input.style.width = '70px';
      input.style.padding = '4px 6px';
      input.style.borderRadius = '6px';
      input.style.border = '1px solid rgba(148,163,184,0.4)';
      input.style.background = '#0f172a';
      input.style.color = '#e2e8f0';
      input.style.fontSize = '13px';
      container.appendChild(span);
      container.appendChild(input);
      return { container, input };
    };

    const rowsControl = createNumberInput(text('.controls.rowsLabel', '行数'), 3);
    const colsControl = createNumberInput(text('.controls.colsLabel', '列数'), 4);

    sizeRow.appendChild(rowsControl.container);
    sizeRow.appendChild(colsControl.container);

    const applySizeBtn = document.createElement('button');
    applySizeBtn.textContent = text('.controls.applySize', 'サイズを更新');
    applySizeBtn.style.padding = '6px 12px';
    applySizeBtn.style.fontSize = '13px';
    applySizeBtn.style.fontWeight = '600';
    applySizeBtn.style.borderRadius = '8px';
    applySizeBtn.style.border = 'none';
    applySizeBtn.style.cursor = 'pointer';
    applySizeBtn.style.background = 'linear-gradient(135deg,#6366f1,#8b5cf6)';
    applySizeBtn.style.color = '#f8fafc';
    sizeRow.appendChild(applySizeBtn);

    controls.appendChild(sizeRow);

    const fileRow = document.createElement('div');
    fileRow.style.display = 'flex';
    fileRow.style.flexWrap = 'wrap';
    fileRow.style.gap = '8px';
    fileRow.style.alignItems = 'center';

    const fileLabel = document.createElement('label');
    fileLabel.style.display = 'inline-flex';
    fileLabel.style.alignItems = 'center';
    fileLabel.style.gap = '8px';
    fileLabel.style.padding = '6px 12px';
    fileLabel.style.background = 'rgba(99,102,241,0.1)';
    fileLabel.style.border = '1px solid rgba(99,102,241,0.45)';
    fileLabel.style.borderRadius = '8px';
    fileLabel.style.cursor = 'pointer';
    fileLabel.style.fontSize = '13px';
    fileLabel.style.color = '#c7d2fe';
    const fileLabelText = document.createElement('span');
    fileLabelText.textContent = text('.controls.chooseFile', '画像を選択…');

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';

    fileLabel.appendChild(fileLabelText);
    fileLabel.appendChild(fileInput);
    fileRow.appendChild(fileLabel);

    const urlInput = document.createElement('input');
    urlInput.type = 'url';
    urlInput.placeholder = text('.controls.urlPlaceholder', '画像URLを入力');
    urlInput.style.flex = '1 1 200px';
    urlInput.style.padding = '6px 8px';
    urlInput.style.borderRadius = '8px';
    urlInput.style.border = '1px solid rgba(148,163,184,0.4)';
    urlInput.style.background = '#0f172a';
    urlInput.style.color = '#e2e8f0';
    urlInput.style.fontSize = '13px';

    const loadUrlBtn = document.createElement('button');
    loadUrlBtn.textContent = text('.controls.loadUrl', 'URLを読み込み');
    loadUrlBtn.style.padding = '6px 12px';
    loadUrlBtn.style.fontSize = '13px';
    loadUrlBtn.style.fontWeight = '600';
    loadUrlBtn.style.borderRadius = '8px';
    loadUrlBtn.style.border = 'none';
    loadUrlBtn.style.cursor = 'pointer';
    loadUrlBtn.style.background = 'linear-gradient(135deg,#22d3ee,#0ea5e9)';
    loadUrlBtn.style.color = '#0f172a';

    fileRow.appendChild(urlInput);
    fileRow.appendChild(loadUrlBtn);

    controls.appendChild(fileRow);

    const shuffleBtn = document.createElement('button');
    shuffleBtn.textContent = text('.controls.shuffle', 'シャッフルして開始');
    shuffleBtn.style.alignSelf = 'flex-start';
    shuffleBtn.style.padding = '6px 12px';
    shuffleBtn.style.fontSize = '13px';
    shuffleBtn.style.fontWeight = '600';
    shuffleBtn.style.borderRadius = '8px';
    shuffleBtn.style.border = 'none';
    shuffleBtn.style.cursor = 'pointer';
    shuffleBtn.style.background = 'linear-gradient(135deg,#f59e0b,#f97316)';
    shuffleBtn.style.color = '#0f172a';
    controls.appendChild(shuffleBtn);

    const infoBar = document.createElement('div');
    infoBar.style.display = 'flex';
    infoBar.style.flexWrap = 'wrap';
    infoBar.style.gap = '10px 20px';
    infoBar.style.marginBottom = '12px';
    infoBar.style.fontSize = '13px';

    function createInfo(labelKey, fallback){
      const span = document.createElement('span');
      span.style.display = 'flex';
      span.style.gap = '6px';
      span.style.alignItems = 'baseline';
      const strong = document.createElement('span');
      strong.style.opacity = '0.7';
      const value = document.createElement('span');
      value.style.fontVariantNumeric = 'tabular-nums';
      span.appendChild(strong);
      span.appendChild(value);
      const updateLabel = () => { strong.textContent = text(labelKey, fallback); };
      updateLabel();
      return { span, value, updateLabel };
    }

    const movesInfo = createInfo('.info.moves', '手数');
    const timeInfo = createInfo('.info.time', 'タイム');
    const correctInfo = createInfo('.info.correct', '正解ピース');
    const solveInfo = createInfo('.info.clears', 'クリア数');

    timeInfo.value.textContent = '0:00.0';
    correctInfo.value.textContent = '0';
    solveInfo.value.textContent = '0';

    infoBar.appendChild(movesInfo.span);
    infoBar.appendChild(timeInfo.span);
    infoBar.appendChild(correctInfo.span);
    infoBar.appendChild(solveInfo.span);

    const boardFrame = document.createElement('div');
    boardFrame.style.position = 'relative';
    boardFrame.style.width = '100%';
    boardFrame.style.background = '#020617';
    boardFrame.style.borderRadius = '16px';
    boardFrame.style.boxShadow = '0 0 0 1px rgba(148,163,184,0.35) inset, 0 18px 40px rgba(15,23,42,0.45) inset';
    boardFrame.style.overflow = 'hidden';
    boardFrame.style.margin = '0 auto';

    const canvas = document.createElement('canvas');
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    boardFrame.appendChild(canvas);

    const statusBar = document.createElement('div');
    statusBar.style.marginTop = '14px';
    statusBar.style.minHeight = '20px';
    statusBar.style.fontSize = '13px';
    statusBar.style.opacity = '0.9';

    wrapper.appendChild(title);
    wrapper.appendChild(description);
    wrapper.appendChild(controls);
    wrapper.appendChild(infoBar);
    wrapper.appendChild(boardFrame);
    wrapper.appendChild(statusBar);

    root.appendChild(wrapper);

    // --- Puzzle state ---
    let rows = 3;
    let cols = 4;
    let board = [];
    let running = false;
    let selectedIndex = null;
    let correctPieces = 0;
    let solved = false;
    let solveCount = 0;
    let moves = 0;
    let elapsedMs = 0;
    let startedAt = null;
    let timerInterval = null;
    let currentImage = null;
    let imageNaturalWidth = 0;
    let imageNaturalHeight = 0;
    let hostRestartDisabled = false;
    let statusState = { mode: '', data: {} };

    const pieceRewardXp = 0.6;
    const solveRewardMultiplier = 0.9;

    function giveXp(amount, context){
      if (!awardXp || !amount) return;
      try { awardXp(amount, context || {}); } catch (err) {
        if (typeof console !== 'undefined' && typeof console.warn === 'function'){
          console.warn('awardXp failed', err);
        }
      }
    }

    function clampSize(value){
      const num = Math.floor(Number(value));
      if (!Number.isFinite(num)) return 3;
      return Math.min(12, Math.max(2, num));
    }

    function formatBoardSize(){
      return `${rows}×${cols}`;
    }

    function updateInfo(){
      movesInfo.value.textContent = formatNumber(moves, { maximumFractionDigits: 0 });
      timeInfo.value.textContent = formatTime(elapsedMs);
      correctInfo.value.textContent = `${formatNumber(correctPieces, { maximumFractionDigits: 0 })}/${formatNumber(rows * cols, { maximumFractionDigits: 0 })}`;
      solveInfo.value.textContent = formatNumber(solveCount, { maximumFractionDigits: 0 });
    }

    function renderStatus(){
      const mode = statusState.mode;
      const payload = statusState.data || {};
      if (mode === 'loading'){
        statusBar.textContent = text('.status.loading', '画像を読み込み中…');
        statusBar.style.color = '#38bdf8';
      } else if (mode === 'error'){
        statusBar.textContent = payload?.message || text('.status.error', '画像の読み込みに失敗しました');
        statusBar.style.color = '#f87171';
      } else if (mode === 'clear'){
        const timeText = formatTime(payload?.timeMs ?? elapsedMs);
        const xpText = formatNumber(payload?.xp ?? 0, { maximumFractionDigits: 2 });
        statusBar.textContent = text('.status.cleared', () => `完成！ ${moves} 手 / ${timeText} 取得EXP: ${xpText}`, {
          moves,
          time: timeText,
          xp: xpText,
          rows,
          cols,
        });
        statusBar.style.color = '#facc15';
      } else if (mode === 'ready'){
        statusBar.textContent = text('.status.ready', () => `${formatBoardSize()} のピースをシャッフルしました。画像を完成させよう！`, {
          rows,
          cols,
        });
        statusBar.style.color = '#cbd5f5';
      } else {
        statusBar.textContent = '';
        statusBar.style.color = '#e2e8f0';
      }
    }

    function setStatus(mode, payload){
      statusState = { mode: mode || '', data: payload || {} };
      renderStatus();
    }

    function stopTimer(){
      if (timerInterval){
        clearInterval(timerInterval);
        timerInterval = null;
      }
    }

    function startTimer(){
      stopTimer();
      startedAt = performance.now();
      timerInterval = setInterval(() => {
        if (!startedAt) return;
        elapsedMs = performance.now() - startedAt;
        updateInfo();
      }, 100);
    }

    function resetStats(){
      moves = 0;
      elapsedMs = 0;
      startedAt = null;
      solved = false;
      correctPieces = 0;
      updateInfo();
    }

    function calculateBoardSize(){
      const containerWidth = wrapper.clientWidth ? Math.max(160, wrapper.clientWidth - 4) : 480;
      const maxWidth = Math.min(520, containerWidth);
      const aspect = imageNaturalWidth > 0 ? imageNaturalHeight / Math.max(1, imageNaturalWidth) : 1;
      let width = maxWidth;
      let height = width * aspect;
      const maxHeight = 520;
      if (height > maxHeight){
        const ratio = maxHeight / height;
        height = maxHeight;
        width = width * ratio;
      }
      if (width > maxWidth){
        const ratio = maxWidth / width;
        width *= ratio;
        height *= ratio;
      }
      width = Math.max(160, width);
      height = Math.max(160, height);
      return { width, height };
    }

    function drawBoard(){
      const ctx = canvas.getContext('2d');
      if (!ctx){
        return;
      }
      const dpr = window.devicePixelRatio || 1;
      const { width, height } = calculateBoardSize();
      const displayWidth = Math.max(50, width);
      const displayHeight = Math.max(50, height);
      boardFrame.style.width = `${displayWidth}px`;
      boardFrame.style.height = `${displayHeight}px`;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.width = Math.round(displayWidth * dpr);
      canvas.height = Math.round(displayHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, displayWidth, displayHeight);
      if (!currentImage || !board.length){
        ctx.fillStyle = '#475569';
        ctx.font = '16px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text('.status.noImage', '画像を読み込んでください'), displayWidth / 2, displayHeight / 2);
        return;
      }

      const tileWidth = displayWidth / cols;
      const tileHeight = displayHeight / rows;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      for (let index = 0; index < board.length; index++){
        const pieceId = board[index];
        const destRow = Math.floor(index / cols);
        const destCol = index % cols;
        const destX = destCol * tileWidth;
        const destY = destRow * tileHeight;
        const srcRow = Math.floor(pieceId / cols);
        const srcCol = pieceId % cols;
        const sx = (imageNaturalWidth / cols) * srcCol;
        const sy = (imageNaturalHeight / rows) * srcRow;
        const sw = imageNaturalWidth / cols;
        const sh = imageNaturalHeight / rows;
        ctx.drawImage(currentImage, sx, sy, sw, sh, destX, destY, tileWidth, tileHeight);
        ctx.strokeStyle = 'rgba(15,23,42,0.55)';
        ctx.lineWidth = 1;
        ctx.strokeRect(destX, destY, tileWidth, tileHeight);
      }

      if (selectedIndex != null){
        const selRow = Math.floor(selectedIndex / cols);
        const selCol = selectedIndex % cols;
        const sx = selCol * tileWidth;
        const sy = selRow * tileHeight;
        ctx.fillStyle = 'rgba(250,204,21,0.25)';
        ctx.fillRect(sx, sy, tileWidth, tileHeight);
        ctx.strokeStyle = 'rgba(250,204,21,0.8)';
        ctx.lineWidth = 2;
        ctx.strokeRect(sx + 1, sy + 1, tileWidth - 2, tileHeight - 2);
      }

      if (solved){
        ctx.fillStyle = 'rgba(2,6,23,0.35)';
        ctx.fillRect(0, 0, displayWidth, displayHeight);
        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 24px "Segoe UI", system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text('.status.overlayCleared', '完成！'), displayWidth / 2, displayHeight / 2);
      }
    }

    function countCorrectPieces(){
      let count = 0;
      for (let i = 0; i < board.length; i++){
        if (board[i] === i) count++;
      }
      return count;
    }

    function checkSolved(){
      for (let i = 0; i < board.length; i++){
        if (board[i] !== i) return false;
      }
      return true;
    }

    function shuffleBoard(){
      for (let i = board.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = board[i];
        board[i] = board[j];
        board[j] = tmp;
      }
      if (checkSolved()){
        // Force at least one swap to avoid solved board
        if (board.length >= 2){
          const tmp = board[0];
          board[0] = board[1];
          board[1] = tmp;
        }
      }
    }

    function buildBoard(){
      const total = rows * cols;
      board = new Array(total);
      for (let i = 0; i < total; i++){
        board[i] = i;
      }
      shuffleBoard();
      correctPieces = countCorrectPieces();
      moves = 0;
      selectedIndex = null;
      solved = false;
      elapsedMs = 0;
      if (running){
        startedAt = performance.now();
        startTimer();
      } else {
        startedAt = null;
        stopTimer();
      }
      setStatus('ready');
      updateInfo();
      drawBoard();
    }

    function applySizeChanges(){
      const newRows = clampSize(rowsControl.input.value);
      const newCols = clampSize(colsControl.input.value);
      rows = newRows;
      cols = newCols;
      rowsControl.input.value = rows;
      colsControl.input.value = cols;
      if (currentImage){
        buildBoard();
      } else {
        drawBoard();
      }
    }

    function onCanvasClick(event){
      if (!running || solved || !board.length) return;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const { width, height } = calculateBoardSize();
      const scaleX = width / rect.width;
      const scaleY = height / rect.height;
      const tileWidth = width / cols;
      const tileHeight = height / rows;
      const col = Math.max(0, Math.min(cols - 1, Math.floor((x * scaleX) / tileWidth)));
      const row = Math.max(0, Math.min(rows - 1, Math.floor((y * scaleY) / tileHeight)));
      const index = row * cols + col;
      if (selectedIndex == null){
        selectedIndex = index;
        drawBoard();
        return;
      }
      if (selectedIndex === index){
        selectedIndex = null;
        drawBoard();
        return;
      }
      const prevCorrectA = board[selectedIndex] === selectedIndex;
      const prevCorrectB = board[index] === index;
      const tmp = board[selectedIndex];
      board[selectedIndex] = board[index];
      board[index] = tmp;
      const nowCorrectA = board[selectedIndex] === selectedIndex;
      const nowCorrectB = board[index] === index;
      let gained = 0;
      if (!prevCorrectA && nowCorrectA) gained++;
      if (!prevCorrectB && nowCorrectB) gained++;
      correctPieces = countCorrectPieces();
      moves += 1;
      selectedIndex = null;
      drawBoard();
      updateInfo();
      if (gained > 0){
        const xp = pieceRewardXp * gained;
        giveXp(xp, { reason: 'piece', pieces: gained, rows, cols });
      }
      if (checkSolved()){
        solved = true;
        stopTimer();
        elapsedMs = performance.now() - (startedAt ?? performance.now());
        updateInfo();
        solveCount += 1;
        updateInfo();
        const solveXp = Math.max(5, rows * cols * solveRewardMultiplier);
        giveXp(solveXp, { reason: 'solve', moves, timeMs: elapsedMs, rows, cols });
        setStatus('clear', { timeMs: elapsedMs, xp: solveXp });
        drawBoard();
      }
    }

    function loadImageFromUrl(url){
      if (!url) return;
      setStatus('loading');
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        currentImage = img;
        imageNaturalWidth = img.naturalWidth || img.width;
        imageNaturalHeight = img.naturalHeight || img.height;
        resetStats();
        buildBoard();
      };
      img.onerror = () => {
        setStatus('error', { message: text('.status.errorLoadUrl', '画像の取得に失敗しました') });
        drawBoard();
      };
      img.src = url;
    }

    function loadImageFromFile(file){
      if (!file) return;
      setStatus('loading');
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          currentImage = img;
          imageNaturalWidth = img.naturalWidth || img.width;
          imageNaturalHeight = img.naturalHeight || img.height;
          resetStats();
          buildBoard();
        };
        img.onerror = () => {
          setStatus('error', { message: text('.status.errorLoadFile', 'ファイルを読み込めませんでした') });
          drawBoard();
        };
        img.src = reader.result;
      };
      reader.onerror = () => {
        setStatus('error', { message: text('.status.errorLoadFile', 'ファイルを読み込めませんでした') });
      };
      reader.readAsDataURL(file);
    }

    function createDefaultImage(){
      const size = 512;
      const canvasEl = document.createElement('canvas');
      canvasEl.width = size;
      canvasEl.height = size;
      const ctx = canvasEl.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, '#0ea5e9');
      gradient.addColorStop(1, '#6366f1');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = 'rgba(15,23,42,0.15)';
      for (let i = 0; i < 12; i++){
        const radius = 60 + i * 18;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(15,23,42,${0.05 + i * 0.015})`;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(15,23,42,0.12)';
      for (let i = 0; i < 120; i++){
        const x = Math.random() * size;
        const y = Math.random() * size;
        const w = 18 + Math.random() * 32;
        const h = 18 + Math.random() * 32;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.random() * Math.PI);
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.restore();
      }
      ctx.fillStyle = 'rgba(241,245,249,0.9)';
      ctx.font = 'bold 64px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text('.defaultImage.title', 'Jigsaw'), size / 2, size / 2 - 24);
      ctx.font = '24px "Segoe UI", system-ui, sans-serif';
      ctx.fillText(text('.defaultImage.subtitle', 'Puzzle'), size / 2, size / 2 + 32);
      return canvasEl.toDataURL('image/png');
    }

    function loadDefaultImage(){
      const dataUrl = createDefaultImage();
      loadImageFromUrl(dataUrl);
    }

    const onResize = () => { drawBoard(); };

    canvas.addEventListener('click', onCanvasClick);
    window.addEventListener('resize', onResize);
    applySizeBtn.addEventListener('click', () => {
      applySizeChanges();
    });
    shuffleBtn.addEventListener('click', () => {
      if (!currentImage){
        loadDefaultImage();
        return;
      }
      resetStats();
      buildBoard();
    });
    fileInput.addEventListener('change', (event) => {
      const file = event.target.files && event.target.files[0];
      if (file){
        loadImageFromFile(file);
        try { event.target.value = ''; } catch {}
      }
    });
    loadUrlBtn.addEventListener('click', () => {
      const url = urlInput.value.trim();
      if (!url) return;
      loadImageFromUrl(url);
    });
    urlInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter'){
        event.preventDefault();
        const url = urlInput.value.trim();
        if (!url) return;
        loadImageFromUrl(url);
      }
    });

    function refreshLocalizedTexts(){
      title.textContent = text('.title', 'ジグソーパズル');
      description.textContent = text('.description', '任意の画像を読み込み、ピース数を自由に設定してジグソーパズルを楽しもう。ピースをクリックして入れ替え、元の画像を完成させよう。');
      rowsControl.container.querySelector('span').textContent = text('.controls.rowsLabel', '行数');
      colsControl.container.querySelector('span').textContent = text('.controls.colsLabel', '列数');
      applySizeBtn.textContent = text('.controls.applySize', 'サイズを更新');
      fileLabelText.textContent = text('.controls.chooseFile', '画像を選択…');
      urlInput.placeholder = text('.controls.urlPlaceholder', '画像URLを入力');
      loadUrlBtn.textContent = text('.controls.loadUrl', 'URLを読み込み');
      shuffleBtn.textContent = text('.controls.shuffle', 'シャッフルして開始');
      movesInfo.updateLabel();
      timeInfo.updateLabel();
      correctInfo.updateLabel();
      solveInfo.updateLabel();
      renderStatus();
      drawBoard();
    }

    refreshLocalizedTexts();

    function start(){
      if (running) return;
      running = true;
      setStatus('');
      if (!currentImage){
        loadDefaultImage();
      } else {
        resetStats();
        buildBoard();
      }
      if (disableHostRestart && !hostRestartDisabled){
        disableHostRestart();
        hostRestartDisabled = true;
      }
    }

    function stop(){
      if (!running) return;
      running = false;
      stopTimer();
      if (hostRestartDisabled && enableHostRestart){
        enableHostRestart();
        hostRestartDisabled = false;
      }
    }

    function destroy(){
      stopTimer();
      canvas.removeEventListener('click', onCanvasClick);
      if (hostRestartDisabled && enableHostRestart){
        enableHostRestart();
        hostRestartDisabled = false;
      }
      window.removeEventListener('resize', onResize);
      wrapper.remove();
    }

    function getScore(){
      return solveCount;
    }

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({
    id: 'jigsaw_puzzle',
    name: 'ジグソーパズル', nameKey: 'selection.miniexp.games.jigsaw_puzzle.name',
    description: '任意の画像を行列指定で遊べるジグソーパズル', descriptionKey: 'selection.miniexp.games.jigsaw_puzzle.description',
    categoryIds: ['puzzle'],
    create
  });
})();

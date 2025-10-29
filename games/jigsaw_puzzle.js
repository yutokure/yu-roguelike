(function(){
  /** MiniExp MOD: True Jigsaw Puzzle with draggable pieces */
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
    wrapper.style.maxWidth = '620px';
    wrapper.style.margin = '0 auto';
    wrapper.style.padding = '16px 18px 26px';
    wrapper.style.boxSizing = 'border-box';
    wrapper.style.fontFamily = "'Segoe UI', system-ui, sans-serif";
    wrapper.style.color = '#e2e8f0';
    wrapper.style.background = '#020617';
    wrapper.style.borderRadius = '18px';
    wrapper.style.boxShadow = '0 16px 38px rgba(15,23,42,0.65)';

    const title = document.createElement('div');
    title.style.fontSize = '22px';
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
      input.style.width = '72px';
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
    fileLabel.style.background = 'rgba(99,102,241,0.12)';
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
    const correctInfo = createInfo('.info.correct', '正しい位置');
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
    boardFrame.style.boxShadow = '0 0 0 1px rgba(148,163,184,0.28) inset, 0 18px 42px rgba(15,23,42,0.45) inset';
    boardFrame.style.padding = '18px';
    boardFrame.style.boxSizing = 'border-box';
    boardFrame.style.overflow = 'visible';

    const boardArea = document.createElement('div');
    boardArea.style.position = 'relative';
    boardArea.style.margin = '0 auto';
    boardArea.style.touchAction = 'none';
    boardArea.style.userSelect = 'none';

    const puzzleSurface = document.createElement('div');
    puzzleSurface.style.position = 'absolute';
    puzzleSurface.style.left = '0';
    puzzleSurface.style.top = '0';
    puzzleSurface.style.borderRadius = '12px';
    puzzleSurface.style.background = 'linear-gradient(145deg, rgba(30,41,59,0.9), rgba(15,23,42,0.95))';
    puzzleSurface.style.boxShadow = 'inset 0 0 0 2px rgba(15,23,42,0.7)';

    boardArea.appendChild(puzzleSurface);
    boardFrame.appendChild(boardArea);

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
    let pieces = [];
    let running = false;
    let solved = false;
    let solveCount = 0;
    let moves = 0;
    let elapsedMs = 0;
    let startedAt = null;
    let timerInterval = null;
    let correctPieces = 0;
    let currentImage = null;
    let imageNaturalWidth = 0;
    let imageNaturalHeight = 0;
    let sourceCanvas = null;
    let boardWidth = 420;
    let boardHeight = 320;
    let pieceWidth = 0;
    let pieceHeight = 0;
    let piecePadding = 0;
    let boardAreaWidth = 0;
    let boardAreaHeight = 0;
    let hostRestartDisabled = false;
    let statusState = { mode: '', data: {} };
    let activePiece = null;
    let activePointerId = null;
    let pointerOffsetX = 0;
    let pointerOffsetY = 0;
    let pointerMoved = false;
    let zIndexCounter = 10;

    const pieceRewardXp = 0.6;
    const solveRewardMultiplier = 1.2;

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
        statusBar.textContent = text('.status.cleared', () => `完成！ ${moves} 手 / ${timeText} EXP: ${xpText}`, {
          moves,
          time: timeText,
          xp: xpText,
          rows,
          cols,
        });
        statusBar.style.color = '#facc15';
      } else if (mode === 'ready'){
        statusBar.textContent = text('.status.ready', () => `${formatBoardSize()} のピースをシャッフルしました。ドラッグで組み立てよう！`, {
          rows,
          cols,
        });
        statusBar.style.color = '#cbd5f5';
      } else if (mode === 'noImage'){
        statusBar.textContent = text('.status.noImage', '画像を読み込んでください');
        statusBar.style.color = '#94a3b8';
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
      const containerWidth = wrapper.clientWidth ? Math.max(220, wrapper.clientWidth - 36) : 520;
      const maxWidth = Math.min(560, containerWidth);
      const aspect = imageNaturalWidth > 0 ? imageNaturalHeight / Math.max(1, imageNaturalWidth) : 0.75;
      let width = maxWidth;
      let height = width * aspect;
      const maxHeight = 500;
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
      width = Math.max(220, width);
      height = Math.max(220, height);
      return { width, height };
    }

    function prepareSourceCanvas(){
      if (!currentImage) return;
      const { width, height } = calculateBoardSize();
      boardWidth = width;
      boardHeight = height;
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(boardWidth);
      canvas.height = Math.round(boardHeight);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, boardWidth, boardHeight);
      ctx.drawImage(currentImage, 0, 0, boardWidth, boardHeight);
      sourceCanvas = canvas;
    }

    function createPiecePath(ctx, piece){
      const tab = Math.min(pieceWidth, pieceHeight) * 0.35;
      const tabDepth = tab * 0.55;
      const halfTab = tab / 2;

      ctx.moveTo(0, 0);
      if (piece.top === 0){
        ctx.lineTo(pieceWidth, 0);
      } else {
        const dir = piece.top;
        ctx.lineTo(pieceWidth / 2 - halfTab, 0);
        ctx.bezierCurveTo(
          pieceWidth / 2 - halfTab * 0.25,
          -tabDepth * dir * 0.3,
          pieceWidth / 2 - halfTab * 0.15,
          -tabDepth * dir,
          pieceWidth / 2,
          -tabDepth * dir
        );
        ctx.bezierCurveTo(
          pieceWidth / 2 + halfTab * 0.15,
          -tabDepth * dir,
          pieceWidth / 2 + halfTab * 0.25,
          -tabDepth * dir * 0.3,
          pieceWidth / 2 + halfTab,
          0
        );
        ctx.lineTo(pieceWidth, 0);
      }
      if (piece.right === 0){
        ctx.lineTo(pieceWidth, pieceHeight);
      } else {
        const dir = piece.right;
        ctx.lineTo(pieceWidth, pieceHeight / 2 - halfTab);
        ctx.bezierCurveTo(
          pieceWidth + tabDepth * dir * 0.3,
          pieceHeight / 2 - halfTab * 0.25,
          pieceWidth + tabDepth * dir,
          pieceHeight / 2 - halfTab * 0.15,
          pieceWidth + tabDepth * dir,
          pieceHeight / 2
        );
        ctx.bezierCurveTo(
          pieceWidth + tabDepth * dir,
          pieceHeight / 2 + halfTab * 0.15,
          pieceWidth + tabDepth * dir * 0.3,
          pieceHeight / 2 + halfTab * 0.25,
          pieceWidth,
          pieceHeight / 2 + halfTab
        );
        ctx.lineTo(pieceWidth, pieceHeight);
      }
      if (piece.bottom === 0){
        ctx.lineTo(0, pieceHeight);
      } else {
        const dir = piece.bottom;
        ctx.lineTo(pieceWidth / 2 + halfTab, pieceHeight);
        ctx.bezierCurveTo(
          pieceWidth / 2 + halfTab * 0.25,
          pieceHeight + tabDepth * dir * 0.3,
          pieceWidth / 2 + halfTab * 0.15,
          pieceHeight + tabDepth * dir,
          pieceWidth / 2,
          pieceHeight + tabDepth * dir
        );
        ctx.bezierCurveTo(
          pieceWidth / 2 - halfTab * 0.15,
          pieceHeight + tabDepth * dir,
          pieceWidth / 2 - halfTab * 0.25,
          pieceHeight + tabDepth * dir * 0.3,
          pieceWidth / 2 - halfTab,
          pieceHeight
        );
        ctx.lineTo(0, pieceHeight);
      }
      if (piece.left === 0){
        ctx.lineTo(0, 0);
      } else {
        const dir = piece.left;
        ctx.lineTo(0, pieceHeight / 2 + halfTab);
        ctx.bezierCurveTo(
          -tabDepth * dir * 0.3,
          pieceHeight / 2 + halfTab * 0.25,
          -tabDepth * dir,
          pieceHeight / 2 + halfTab * 0.15,
          -tabDepth * dir,
          pieceHeight / 2
        );
        ctx.bezierCurveTo(
          -tabDepth * dir,
          pieceHeight / 2 - halfTab * 0.15,
          -tabDepth * dir * 0.3,
          pieceHeight / 2 - halfTab * 0.25,
          0,
          pieceHeight / 2 - halfTab
        );
        ctx.lineTo(0, 0);
      }
      ctx.closePath();
    }

    function drawPiece(piece){
      const canvas = piece.element;
      const ctx = canvas.getContext('2d');
      if (!ctx || !sourceCanvas) return;
      const dpr = window.devicePixelRatio || 1;
      const cssWidth = pieceWidth + piecePadding * 2;
      const cssHeight = pieceHeight + piecePadding * 2;
      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssWidth, cssHeight);
      ctx.save();
      ctx.translate(piecePadding, piecePadding);
      ctx.beginPath();
      createPiecePath(ctx, piece);
      ctx.save();
      ctx.clip();
      ctx.drawImage(sourceCanvas, -piece.col * pieceWidth, -piece.row * pieceHeight);
      ctx.restore();
      ctx.strokeStyle = 'rgba(15,23,42,0.65)';
      ctx.lineWidth = 1.6;
      ctx.lineJoin = 'round';
      ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.translate(piecePadding, piecePadding);
      ctx.beginPath();
      createPiecePath(ctx, piece);
      const grad = ctx.createLinearGradient(0, 0, pieceWidth, pieceHeight);
      grad.addColorStop(0, 'rgba(15,23,42,0.18)');
      grad.addColorStop(1, 'rgba(2,6,23,0)');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    }
    function updatePiecePosition(piece){
      piece.element.style.left = `${piece.x}px`;
      piece.element.style.top = `${piece.y}px`;
    }

    function setPieceLocked(piece, locked){
      piece.locked = locked;
      piece.element.style.cursor = locked ? 'default' : 'grab';
      piece.element.style.filter = locked ? 'drop-shadow(0 0 0 rgba(0,0,0,0))' : 'drop-shadow(0 6px 18px rgba(15,23,42,0.45))';
      piece.element.style.pointerEvents = locked ? 'none' : 'auto';
    }

    function createPieceElement(piece){
      const canvas = document.createElement('canvas');
      canvas.style.position = 'absolute';
      canvas.style.left = '0';
      canvas.style.top = '0';
      canvas.style.cursor = 'grab';
      canvas.style.touchAction = 'none';
      canvas.style.transition = 'box-shadow 0.2s ease';
      canvas.__piece = piece;
      piece.element = canvas;
      drawPiece(piece);
      return canvas;
    }

    function updateBoardMetrics(){
      pieceWidth = boardWidth / cols;
      pieceHeight = boardHeight / rows;
      piecePadding = Math.min(pieceWidth, pieceHeight) * 0.35;
      boardAreaWidth = boardWidth + piecePadding * 2;
      boardAreaHeight = boardHeight + piecePadding * 2;
      boardArea.style.width = `${boardAreaWidth}px`;
      boardArea.style.height = `${boardAreaHeight}px`;
      puzzleSurface.style.left = `${piecePadding}px`;
      puzzleSurface.style.top = `${piecePadding}px`;
      puzzleSurface.style.width = `${boardWidth}px`;
      puzzleSurface.style.height = `${boardHeight}px`;
    }

    function generatePieces(){
      pieces = [];
      const connectors = [];
      for (let row = 0; row < rows; row++){
        for (let col = 0; col < cols; col++){
          const index = row * cols + col;
          const top = row === 0 ? 0 : -connectors[(row - 1) * cols + col].bottom;
          const left = col === 0 ? 0 : -connectors[index - 1].right;
          const bottom = row === rows - 1 ? 0 : (Math.random() < 0.5 ? 1 : -1);
          const right = col === cols - 1 ? 0 : (Math.random() < 0.5 ? 1 : -1);
          const piece = {
            row,
            col,
            top,
            right,
            bottom,
            left,
            element: null,
            locked: false,
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0,
          };
          connectors[index] = piece;
          pieces.push(piece);
        }
      }
    }

    function clearPieces(){
      while (boardArea.children.length > 1){
        const child = boardArea.lastChild;
        if (child !== puzzleSurface){
          child.remove();
        } else {
          break;
        }
      }
    }

    function scatterPieces(){
      const threshold = Math.min(pieceWidth, pieceHeight) * 0.3;
      correctPieces = 0;
      pieces.forEach((piece) => {
        const element = piece.element;
        const canvasWidth = pieceWidth + piecePadding * 2;
        const canvasHeight = pieceHeight + piecePadding * 2;
        piece.targetX = piece.col * pieceWidth;
        piece.targetY = piece.row * pieceHeight;
        const maxX = boardAreaWidth - canvasWidth;
        const maxY = boardAreaHeight - canvasHeight;
        piece.x = Math.random() * maxX;
        piece.y = Math.random() * maxY;
        setPieceLocked(piece, false);
        element.dataset.snapDistance = String(threshold);
        updatePiecePosition(piece);
      });
      updateInfo();
    }

    function buildPieces(){
      if (!sourceCanvas) return;
      detachPointerEvents();
      clearPieces();
      updateBoardMetrics();
      generatePieces();
      pieces.forEach((piece) => {
        createPieceElement(piece);
        boardArea.appendChild(piece.element);
      });
      scatterPieces();
      attachPointerEvents();
    }

    function rebuildPuzzle(){
      if (!currentImage){
        setStatus('noImage');
        clearPieces();
        return;
      }
      prepareSourceCanvas();
      buildPieces();
      setStatus('ready');
      if (running){
        resetStats();
        startTimer();
      } else {
        stopTimer();
      }
    }

    function clampPosition(piece, x, y){
      const canvasWidth = pieceWidth + piecePadding * 2;
      const canvasHeight = pieceHeight + piecePadding * 2;
      const minX = 0;
      const minY = 0;
      const maxX = boardAreaWidth - canvasWidth;
      const maxY = boardAreaHeight - canvasHeight;
      return {
        x: Math.min(maxX, Math.max(minX, x)),
        y: Math.min(maxY, Math.max(minY, y)),
      };
    }

    function trySnap(piece){
      const snapDistance = Number(piece.element.dataset.snapDistance || 0) || Math.min(pieceWidth, pieceHeight) * 0.3;
      const dx = piece.x - piece.targetX;
      const dy = piece.y - piece.targetY;
      const dist = Math.hypot(dx, dy);
      if (dist <= snapDistance){
        piece.x = piece.targetX;
        piece.y = piece.targetY;
        updatePiecePosition(piece);
        if (!piece.locked){
          setPieceLocked(piece, true);
          correctPieces++;
          giveXp(pieceRewardXp, { type: 'pieceLocked', rows, cols });
          updateInfo();
        }
        checkSolved();
        return true;
      }
      return false;
    }

    function checkSolved(){
      if (pieces.every((p) => p.locked)){
        if (!solved){
          solved = true;
          stopTimer();
          solveCount++;
          const bonus = rows * cols * solveRewardMultiplier;
          giveXp(bonus, { type: 'completed', rows, cols, moves, timeMs: elapsedMs });
          setStatus('clear', { timeMs: elapsedMs, xp: bonus });
          correctPieces = pieces.length;
          updateInfo();
        }
      }
    }
    function onPointerDown(event){
      const piece = event.currentTarget.__piece;
      if (!piece || piece.locked) return;
      const rect = boardArea.getBoundingClientRect();
      activePiece = piece;
      activePointerId = event.pointerId;
      pointerOffsetX = event.clientX - rect.left - piece.x;
      pointerOffsetY = event.clientY - rect.top - piece.y;
      pointerMoved = false;
      piece.element.setPointerCapture(event.pointerId);
      piece.element.style.cursor = 'grabbing';
      piece.element.style.zIndex = String(zIndexCounter++);
    }

    function onPointerMove(event){
      if (!activePiece || event.pointerId !== activePointerId) return;
      const rect = boardArea.getBoundingClientRect();
      const newX = event.clientX - rect.left - pointerOffsetX;
      const newY = event.clientY - rect.top - pointerOffsetY;
      const clamped = clampPosition(activePiece, newX, newY);
      activePiece.x = clamped.x;
      activePiece.y = clamped.y;
      updatePiecePosition(activePiece);
      pointerMoved = true;
    }

    function onPointerUp(event){
      if (!activePiece || event.pointerId !== activePointerId) return;
      try {
        activePiece.element.releasePointerCapture(event.pointerId);
      } catch {}
      const piece = activePiece;
      activePiece.element.style.cursor = piece.locked ? 'default' : 'grab';
      activePiece = null;
      activePointerId = null;
      if (pointerMoved){
        moves++;
        updateInfo();
      }
      pointerMoved = false;
      if (!piece.locked){
        trySnap(piece);
      }
    }

    function attachPointerEvents(){
      pieces.forEach((piece) => {
        const el = piece.element;
        el.addEventListener('pointerdown', onPointerDown);
        el.addEventListener('pointermove', onPointerMove);
        el.addEventListener('pointerup', onPointerUp);
        el.addEventListener('pointercancel', onPointerUp);
      });
    }

    function detachPointerEvents(){
      pieces.forEach((piece) => {
        const el = piece.element;
        if (!el) return;
        el.removeEventListener('pointerdown', onPointerDown);
        el.removeEventListener('pointermove', onPointerMove);
        el.removeEventListener('pointerup', onPointerUp);
        el.removeEventListener('pointercancel', onPointerUp);
      });
    }

    function applySizeChanges(){
      const nextRows = clampSize(rowsControl.input.value);
      const nextCols = clampSize(colsControl.input.value);
      rowsControl.input.value = String(nextRows);
      colsControl.input.value = String(nextCols);
      const changed = nextRows !== rows || nextCols !== cols;
      rows = nextRows;
      cols = nextCols;
      if (changed && currentImage){
        resetStats();
        rebuildPuzzle();
      }
    }

    function loadImageFromFile(file){
      if (!file) return;
      const reader = new FileReader();
      setStatus('loading');
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          currentImage = img;
          imageNaturalWidth = img.naturalWidth;
          imageNaturalHeight = img.naturalHeight;
          rebuildPuzzle();
        };
        img.onerror = () => {
          setStatus('error', { message: text('.status.errorFile', 'ファイルの読み込みに失敗しました') });
        };
        img.src = reader.result;
      };
      reader.onerror = () => {
        setStatus('error', { message: text('.status.errorFile', 'ファイルの読み込みに失敗しました') });
      };
      try {
        reader.readAsDataURL(file);
      } catch {
        setStatus('error', { message: text('.status.errorFile', 'ファイルの読み込みに失敗しました') });
      }
    }

    function loadImageFromUrl(url){
      if (!url) return;
      setStatus('loading');
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        currentImage = img;
        imageNaturalWidth = img.naturalWidth;
        imageNaturalHeight = img.naturalHeight;
        rebuildPuzzle();
      };
      img.onerror = () => {
        setStatus('error', { message: text('.status.errorUrl', '画像の読み込みに失敗しました') });
      };
      img.src = url;
    }

    function createDefaultImage(){
      const size = 480;
      const canvasEl = document.createElement('canvas');
      canvasEl.width = size;
      canvasEl.height = Math.floor(size * 0.65);
      const ctx = canvasEl.getContext('2d');
      if (!ctx) return null;
      const grd = ctx.createLinearGradient(0, 0, size, canvasEl.height);
      grd.addColorStop(0, '#1d4ed8');
      grd.addColorStop(1, '#9333ea');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, size, canvasEl.height);
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      for (let i = 0; i < 18; i++){
        ctx.beginPath();
        ctx.arc(Math.random() * size, Math.random() * canvasEl.height, 30 + Math.random() * 120, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 52px "Segoe UI", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text('.defaultImage.title', 'Jigsaw'), size / 2, canvasEl.height / 2 - 30);
      ctx.font = '28px "Segoe UI", system-ui, sans-serif';
      ctx.fillText(text('.defaultImage.subtitle', 'Puzzle'), size / 2, canvasEl.height / 2 + 26);
      return canvasEl.toDataURL('image/png');
    }

    function loadDefaultImage(){
      const url = createDefaultImage();
      if (url){
        loadImageFromUrl(url);
      } else {
        setStatus('error', { message: text('.status.error', '画像の生成に失敗しました') });
      }
    }

    function refreshLocalizedTexts(){
      title.textContent = text('.title', 'ジグソーパズル');
      description.textContent = text('.description', 'ジグソーピースの形をしたパーツをドラッグし、元の画像を完成させよう。行数と列数、画像を自由に選べます。');
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
    }

    refreshLocalizedTexts();

    function onResize(){
      if (!currentImage) return;
      prepareSourceCanvas();
      updateBoardMetrics();
      const threshold = Math.min(pieceWidth, pieceHeight) * 0.3;
      pieces.forEach((piece) => {
        drawPiece(piece);
        piece.targetX = piece.col * pieceWidth;
        piece.targetY = piece.row * pieceHeight;
        piece.element.dataset.snapDistance = String(threshold);
        if (piece.locked){
          piece.x = piece.targetX;
          piece.y = piece.targetY;
        } else {
          const { x, y } = clampPosition(piece, piece.x, piece.y);
          piece.x = x;
          piece.y = y;
        }
        updatePiecePosition(piece);
      });
    }

    applySizeBtn.addEventListener('click', () => {
      applySizeChanges();
    });

    shuffleBtn.addEventListener('click', () => {
      if (!currentImage){
        loadDefaultImage();
        return;
      }
      resetStats();
      pieces.forEach((piece) => setPieceLocked(piece, false));
      scatterPieces();
      if (running){
        startTimer();
      }
      setStatus('ready');
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

    window.addEventListener('resize', onResize);

    function start(){
      if (running) return;
      running = true;
      solved = false;
      moves = 0;
      correctPieces = 0;
      if (!currentImage){
        loadDefaultImage();
      } else {
        resetStats();
        rebuildPuzzle();
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
      detachPointerEvents();
      if (hostRestartDisabled && enableHostRestart){
        enableHostRestart();
        hostRestartDisabled = false;
      }
    }

    function destroy(){
      stopTimer();
      detachPointerEvents();
      window.removeEventListener('resize', onResize);
      if (hostRestartDisabled && enableHostRestart){
        enableHostRestart();
        hostRestartDisabled = false;
      }
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
    description: '任意の画像をピースで組み立てるジグソーパズル', descriptionKey: 'selection.miniexp.games.jigsaw_puzzle.description',
    categoryIds: ['puzzle'],
    create
  });
})();

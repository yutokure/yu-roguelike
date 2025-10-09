(function(){
  const globalObject = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});

  function getI18n(){
    return globalObject && globalObject.I18n ? globalObject.I18n : null;
  }

  function translate(key, params, fallback){
    const i18n = getI18n();
    if (key && i18n && typeof i18n.t === 'function') {
      try {
        const value = i18n.t(key, params);
        if (value !== undefined && value !== null && value !== key) {
          return value;
        }
      } catch (error) {
        console.warn('[MiniPaint] Failed to translate key:', key, error);
      }
    }
    if (typeof fallback === 'function') {
      try {
        return fallback();
      } catch (error) {
        console.warn('[MiniPaint] Failed to evaluate fallback for key:', key, error);
        return '';
      }
    }
    if (fallback !== undefined && fallback !== null) {
      return fallback;
    }
    if (typeof key === 'string') {
      return key;
    }
    return '';
  }

  const STORAGE_KEY = 'mini_paint_state_v1';
  const CANVAS_WIDTH = 960;
  const CANVAS_HEIGHT = 540;
  const HISTORY_LIMIT = 20;
  const STROKE_XP_COOLDOWN = 700;
  const FILL_XP = 3;
  const SHAPE_XP = 2;
  const SAVE_XP = 8;
  const NEW_XP = 1;
  const IMPORT_XP = 5;
  const DEFAULT_PRIMARY = '#1f2937';
  const DEFAULT_SECONDARY = '#ffffff';
  const DEFAULT_APP_NAME = 'ペイント';
  const DEFAULT_FILENAME_FALLBACK = '未タイトル.png';
  const DEFAULT_IMPORTED_FILENAME = 'インポート画像.png';

  const TOOL_DEFINITIONS = {
    brush: { kind: 'stroke', label: 'ブラシ', labelKey: 'miniPaint.tools.brush', icon: '🖌️', sizeMultiplier: 1, lineCap: 'round', lineJoin: 'round' },
    pencil: { kind: 'stroke', label: '鉛筆', labelKey: 'miniPaint.tools.pencil', icon: '✏️', sizeMultiplier: 0.55, lineCap: 'round', lineJoin: 'round' },
    marker: { kind: 'stroke', label: 'マーカー', labelKey: 'miniPaint.tools.marker', icon: '🖍️', sizeMultiplier: 1.8, lineCap: 'round', lineJoin: 'round', alpha: 0.45 },
    eraser: { kind: 'stroke', label: '消しゴム', labelKey: 'miniPaint.tools.eraser', icon: '🧼', sizeMultiplier: 1.6, lineCap: 'round', lineJoin: 'round', erase: true },
    line: { kind: 'shape-line', label: '直線', labelKey: 'miniPaint.tools.line', icon: '／' },
    rectangle: { kind: 'shape-rect', label: '四角', labelKey: 'miniPaint.tools.rectangle', icon: '▭' },
    ellipse: { kind: 'shape-ellipse', label: '楕円', labelKey: 'miniPaint.tools.ellipse', icon: '◯' },
    fill: { kind: 'fill', label: '塗りつぶし', labelKey: 'miniPaint.tools.fill', icon: '🪣' },
    picker: { kind: 'picker', label: 'スポイト', labelKey: 'miniPaint.tools.picker', icon: '🎯' }
  };

  const PALETTE_COLORS = [
    '#000000','#7f7f7f','#a5a5a5','#ffffff',
    '#880015','#ed1c24','#ff7f27','#fff200',
    '#22b14c','#00a2e8','#3f48cc','#a349a4',
    '#1e3a8a','#0f766e','#115e59','#78350f'
  ];

  function clamp(value, min, max){
    return Math.min(max, Math.max(min, value));
  }

  function loadPersistentState(defaultFileName){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      return {
        primaryColor: typeof parsed.primaryColor === 'string' ? parsed.primaryColor : DEFAULT_PRIMARY,
        secondaryColor: typeof parsed.secondaryColor === 'string' ? parsed.secondaryColor : DEFAULT_SECONDARY,
        brushSize: Number.isFinite(parsed.brushSize) ? clamp(parsed.brushSize, 1, 96) : 10,
        tool: typeof parsed.tool === 'string' && TOOL_DEFINITIONS[parsed.tool] ? parsed.tool : 'brush',
        shapeFilled: !!parsed.shapeFilled,
        showGrid: !!parsed.showGrid,
        zoom: Number.isFinite(parsed.zoom) ? clamp(parsed.zoom, 50, 200) : 100,
        canvasData: typeof parsed.canvasData === 'string' && parsed.canvasData.startsWith('data:image') ? parsed.canvasData : null,
        fileName: typeof parsed.fileName === 'string' && parsed.fileName.trim() ? parsed.fileName : defaultFileName
      };
    } catch {
      return null;
    }
  }

  function writePersistentState(state){
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        primaryColor: state.primaryColor,
        secondaryColor: state.secondaryColor,
        brushSize: state.brushSize,
        tool: state.tool,
        shapeFilled: state.shapeFilled,
        showGrid: state.showGrid,
        zoom: state.zoom,
        canvasData: state.canvasData,
        fileName: state.fileName
      }));
    } catch {}
  }

  function setImportantColor(element, color){
    if (!element) return;
    element.style.setProperty('color', color, 'important');
  }

  function create(root, awardXp){
    if (!root) throw new Error('MiniExp Paint requires a container');

    const initialAppName = translate('miniPaint.appName', null, DEFAULT_APP_NAME);
    const initialDefaultFileName = translate('miniPaint.defaultFileName', null, DEFAULT_FILENAME_FALLBACK);
    const initialImportedFileName = translate('miniPaint.importedFileName', null, DEFAULT_IMPORTED_FILENAME);
    const persisted = loadPersistentState(initialDefaultFileName);
    const initialTool = persisted?.tool && TOOL_DEFINITIONS[persisted.tool] ? persisted.tool : 'brush';
    const state = {
      primaryColor: persisted?.primaryColor || DEFAULT_PRIMARY,
      secondaryColor: persisted?.secondaryColor || DEFAULT_SECONDARY,
      brushSize: clamp(persisted?.brushSize ?? 10, 1, 96),
      tool: initialTool,
      shapeFilled: persisted?.shapeFilled ?? false,
      showGrid: persisted?.showGrid ?? false,
      zoom: clamp(persisted?.zoom ?? 100, 50, 200),
      defaultFileName: initialDefaultFileName,
      importedFileName: initialImportedFileName,
      appName: initialAppName,
      fileName: persisted?.fileName || initialDefaultFileName,
      canvasData: persisted?.canvasData || null,
      lastStrokeAwardAt: 0,
      sessionXp: 0
    };

    let hasUnsavedChanges = false;
    let persistTimer = null;
    let canvasPersistTimer = null;
    let isRunning = false;
    const listeners = [];
    const history = [];
    let historyIndex = -1;
    let currentRuntimeRef = null;

    const pointerState = {
      active: false,
      pointerId: null,
      button: 0,
      tool: null,
      startX: 0,
      startY: 0,
      lastX: 0,
      lastY: 0,
      color: DEFAULT_PRIMARY,
      shiftKey: false
    };
    let actionDirty = false;
    let hoverPosition = null;
    const toolButtons = [];
    let localeUnsubscribe = null;
    let brushSlider;
    let brushValue;
    let zoomSlider;
    let zoomValue;
    let fillToggle;
    let gridToggle;
    let undoBtn;
    let redoBtn;
    let newBtn;
    let importBtn;
    let saveBtn;
    let saveAsBtn;
    let exportBtn;
    let clearBtn;
    let brushLabel;
    let zoomLabel;
    let primaryCaption;
    let secondaryCaption;
    let primarySwatch;
    let secondarySwatch;
    let primaryInput;
    let secondaryInput;

    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.justifyContent = 'center';
    wrapper.style.background = 'linear-gradient(135deg, rgba(148,163,184,0.12), rgba(15,23,42,0.65))';

    const frame = document.createElement('div');
    frame.style.width = 'min(1020px, 96%)';
    frame.style.height = 'min(680px, 94%)';
    frame.style.display = 'flex';
    frame.style.flexDirection = 'column';
    frame.style.background = '#f6f8fc';
    frame.style.borderRadius = '16px';
    frame.style.boxShadow = '0 20px 52px rgba(15,23,42,0.35)';
    frame.style.border = '1px solid rgba(148,163,184,0.28)';
    frame.style.overflow = 'hidden';
    frame.style.fontFamily = '"Segoe UI", "Yu Gothic", sans-serif';
    frame.style.position = 'relative';
    setImportantColor(frame, '#1f2937');

    const titleBar = document.createElement('div');
    titleBar.style.display = 'flex';
    titleBar.style.alignItems = 'center';
    titleBar.style.background = '#ffffff';
    titleBar.style.padding = '0 14px';
    titleBar.style.height = '46px';
    titleBar.style.borderBottom = '1px solid rgba(148,163,184,0.24)';

    const appIcon = document.createElement('div');
    appIcon.style.width = '28px';
    appIcon.style.height = '28px';
    appIcon.style.marginRight = '10px';
    appIcon.style.borderRadius = '6px';
    appIcon.style.background = 'linear-gradient(135deg, #2563eb, #60a5fa)';
    appIcon.style.boxShadow = '0 4px 10px rgba(37,99,235,0.42)';

    const titleLabel = document.createElement('div');
    titleLabel.style.flex = '1';
    titleLabel.style.fontSize = '15px';
    titleLabel.style.fontWeight = '600';
    setImportantColor(titleLabel, '#1e293b');

    const windowControls = document.createElement('div');
    windowControls.style.display = 'flex';
    windowControls.style.gap = '4px';

    ['—', '□', '×'].forEach(symbol => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = symbol;
      btn.style.width = '34px';
      btn.style.height = '26px';
      btn.style.border = 'none';
      btn.style.borderRadius = '6px';
      btn.style.background = 'transparent';
      btn.style.cursor = 'pointer';
      setImportantColor(btn, '#334155');
      btn.addEventListener('pointerenter', () => { btn.style.background = symbol === '×' ? '#fee2e2' : '#e2e8f0'; });
      btn.addEventListener('pointerleave', () => { btn.style.background = 'transparent'; });
      if (symbol === '×') {
        btn.addEventListener('click', () => {
          const message = translate('miniPaint.prompts.closeConfirm', null, '変更を破棄してペイントを閉じますか？');
          if (!hasUnsavedChanges || confirm(message)) quit();
        });
      }
      windowControls.appendChild(btn);
    });

    titleBar.appendChild(appIcon);
    titleBar.appendChild(titleLabel);
    titleBar.appendChild(windowControls);

    const ribbon = document.createElement('div');
    ribbon.style.background = 'linear-gradient(180deg, rgba(226,232,240,0.5), rgba(148,163,184,0.08))';
    ribbon.style.padding = '12px 16px';
    ribbon.style.display = 'flex';
    ribbon.style.flexDirection = 'column';
    ribbon.style.gap = '10px';
    ribbon.style.borderBottom = '1px solid rgba(148,163,184,0.24)';

    const fileRow = document.createElement('div');
    fileRow.style.display = 'flex';
    fileRow.style.alignItems = 'center';
    fileRow.style.gap = '8px';

    const toolRow = document.createElement('div');
    toolRow.style.display = 'flex';
    toolRow.style.alignItems = 'center';
    toolRow.style.justifyContent = 'space-between';
    toolRow.style.gap = '12px';

    const toolGroup = document.createElement('div');
    toolGroup.style.display = 'grid';
    toolGroup.style.gridTemplateColumns = 'repeat(5, minmax(0, 1fr))';
    toolGroup.style.gap = '8px';
    toolGroup.style.flex = '1';

    const sizeGroup = document.createElement('div');
    sizeGroup.style.display = 'flex';
    sizeGroup.style.alignItems = 'center';
    sizeGroup.style.gap = '10px';

    const colorRow = document.createElement('div');
    colorRow.style.display = 'flex';
    colorRow.style.alignItems = 'center';
    colorRow.style.gap = '14px';

    const canvasViewport = document.createElement('div');
    canvasViewport.style.flex = '1';
    canvasViewport.style.position = 'relative';
    canvasViewport.style.background = 'linear-gradient(180deg, rgba(15,23,42,0.05), rgba(15,23,42,0.25))';
    canvasViewport.style.display = 'flex';
    canvasViewport.style.justifyContent = 'flex-start';
    canvasViewport.style.alignItems = 'flex-start';
    canvasViewport.style.overflow = 'auto';
    canvasViewport.style.padding = '24px';

    const canvasFrame = document.createElement('div');
    canvasFrame.style.position = 'relative';
    canvasFrame.style.width = `${CANVAS_WIDTH}px`;
    canvasFrame.style.height = `${CANVAS_HEIGHT}px`;
    canvasFrame.style.background = '#ffffff';
    canvasFrame.style.border = '1px solid rgba(148,163,184,0.45)';
    canvasFrame.style.boxShadow = '0 18px 44px rgba(15,23,42,0.28)';
    canvasFrame.style.transformOrigin = 'top left';

    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.cursor = 'crosshair';
    canvas.style.imageRendering = 'crisp-edges';
    canvas.style.touchAction = 'none';

    const gridOverlay = document.createElement('div');
    gridOverlay.style.position = 'absolute';
    gridOverlay.style.inset = '0';
    gridOverlay.style.pointerEvents = 'none';
    gridOverlay.style.backgroundImage = 'linear-gradient(to right, rgba(148,163,184,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.25) 1px, transparent 1px)';
    gridOverlay.style.backgroundSize = '16px 16px';
    gridOverlay.style.opacity = '0';
    gridOverlay.style.zIndex = '1';
    gridOverlay.style.mixBlendMode = 'multiply';

    const overlayCanvas = document.createElement('canvas');
    overlayCanvas.width = CANVAS_WIDTH;
    overlayCanvas.height = CANVAS_HEIGHT;
    overlayCanvas.style.position = 'absolute';
    overlayCanvas.style.top = '0';
    overlayCanvas.style.left = '0';
    overlayCanvas.style.width = '100%';
    overlayCanvas.style.height = '100%';
    overlayCanvas.style.pointerEvents = 'none';
    overlayCanvas.style.zIndex = '2';

    canvasFrame.appendChild(canvas);
    canvasFrame.appendChild(gridOverlay);
    canvasFrame.appendChild(overlayCanvas);
    canvasViewport.appendChild(canvasFrame);

    const statusBar = document.createElement('div');
    statusBar.style.height = '34px';
    statusBar.style.borderTop = '1px solid rgba(148,163,184,0.24)';
    statusBar.style.background = '#ffffff';
    statusBar.style.display = 'flex';
    statusBar.style.alignItems = 'center';
    statusBar.style.padding = '0 14px';
    statusBar.style.fontSize = '12px';
    setImportantColor(statusBar, '#475569');
    statusBar.style.gap = '16px';

    const statusPosition = document.createElement('span');
    const statusSize = document.createElement('span');
    const statusZoom = document.createElement('span');
    const statusXp = document.createElement('span');

    statusBar.appendChild(statusPosition);
    statusBar.appendChild(statusSize);
    statusBar.appendChild(statusZoom);
    statusBar.appendChild(statusXp);

    frame.appendChild(titleBar);
    frame.appendChild(ribbon);
    ribbon.appendChild(fileRow);
    ribbon.appendChild(toolRow);
    ribbon.appendChild(colorRow);
    toolRow.appendChild(toolGroup);
    toolRow.appendChild(sizeGroup);
    frame.appendChild(canvasViewport);
    frame.appendChild(statusBar);
    wrapper.appendChild(frame);
    root.appendChild(wrapper);

    const ctx = canvas.getContext('2d');
    const overlayCtx = overlayCanvas.getContext('2d');
    overlayCtx.lineCap = 'round';
    overlayCtx.lineJoin = 'round';

    const hiddenFileInput = document.createElement('input');
    hiddenFileInput.type = 'file';
    hiddenFileInput.accept = 'image/*';
    hiddenFileInput.style.display = 'none';
    root.appendChild(hiddenFileInput);

    const hiddenDownloader = document.createElement('a');
    hiddenDownloader.style.display = 'none';
    root.appendChild(hiddenDownloader);

    function trackListener(target, type, handler, options){
      listeners.push({ target, type, handler, options });
      if (isRunning) target.addEventListener(type, handler, options || false);
    }

    function setTitle(){
      const marker = hasUnsavedChanges ? '* ' : '';
      const fileName = state.fileName || state.defaultFileName;
      const appName = state.appName || translate('miniPaint.appName', null, DEFAULT_APP_NAME);
      titleLabel.textContent = translate(
        'miniPaint.windowTitle',
        { marker, fileName, appName },
        () => `${marker}${fileName} - ${appName}`
      );
    }

    function award(type, amount){
      if (!awardXp || !amount) return 0;
      try {
        const gained = awardXp(amount, { type });
        const num = Number(gained);
        if (Number.isFinite(num)) state.sessionXp += num;
        updateStatusBar();
        return gained;
      } catch {
        return 0;
      }
    }

    function persistStateSoon(){
      if (persistTimer) return;
      persistTimer = setTimeout(() => {
        persistTimer = null;
        writePersistentState(state);
      }, 400);
    }

    function persistCanvasSoon(){
      if (canvasPersistTimer) return;
      canvasPersistTimer = setTimeout(() => {
        canvasPersistTimer = null;
        try {
          state.canvasData = canvas.toDataURL('image/png');
          persistStateSoon();
        } catch {}
      }, 900);
    }

    function captureSnapshot(){
      try {
        return ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      } catch {
        return null;
      }
    }

    function applySnapshot(snapshot){
      if (!snapshot) return;
      try { ctx.putImageData(snapshot, 0, 0); } catch {}
    }

    function pushHistory(snapshot){
      if (!snapshot) return;
      if (historyIndex < history.length - 1) history.splice(historyIndex + 1);
      history.push(snapshot);
      if (history.length > HISTORY_LIMIT) {
        history.shift();
        historyIndex = history.length - 1;
      } else {
        historyIndex = history.length - 1;
      }
      updateHistoryButtons();
    }

    function undo(){
      if (historyIndex <= 0) return;
      historyIndex -= 1;
      applySnapshot(history[historyIndex]);
      hasUnsavedChanges = true;
      persistCanvasSoon();
      updateStatusBar();
      updateHistoryButtons();
    }

    function redo(){
      if (historyIndex >= history.length - 1) return;
      historyIndex += 1;
      applySnapshot(history[historyIndex]);
      hasUnsavedChanges = true;
      persistCanvasSoon();
      updateStatusBar();
      updateHistoryButtons();
    }

    function updateHistoryButtons(){
      undoBtn.disabled = historyIndex <= 0;
      redoBtn.disabled = historyIndex >= history.length - 1;
    }

    function clearOverlay(){
      overlayCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    function updateGrid(){
      gridOverlay.style.opacity = state.showGrid ? '0.6' : '0';
    }

    function formatZoomValue(value){
      return translate('miniPaint.labels.zoomValue', { value }, () => `${value}%`);
    }

    function formatBrushValue(value){
      return translate('miniPaint.labels.sizeValue', { value }, () => `${value}px`);
    }

    function updateZoom(){
      canvasFrame.style.transform = `scale(${state.zoom / 100})`;
      zoomSlider.value = String(state.zoom);
      zoomValue.textContent = formatZoomValue(state.zoom);
      updateStatusBar();
      persistStateSoon();
    }

    function updateBrushSize(){
      brushSlider.value = String(state.brushSize);
      brushValue.textContent = formatBrushValue(state.brushSize);
      updateStatusBar();
      persistStateSoon();
    }

    function updateColorPreview(){
      primarySwatch.style.background = state.primaryColor;
      secondarySwatch.style.background = state.secondaryColor;
      primaryInput.value = normalizeColorInput(state.primaryColor);
      secondaryInput.value = normalizeColorInput(state.secondaryColor);
      updateStatusBar();
      persistStateSoon();
    }

    function updateToolSelection(){
      toolButtons.forEach(btn => {
        if (btn.__toolId === state.tool) {
          btn.classList.add('active');
          btn.style.background = '#dbeafe';
          btn.style.borderColor = '#1d4ed8';
        } else {
          btn.classList.remove('active');
          btn.style.background = 'rgba(255,255,255,0.8)';
          btn.style.borderColor = 'rgba(148,163,184,0.4)';
        }
      });
      fillToggle.style.background = state.shapeFilled ? '#c4f1f9' : 'rgba(255,255,255,0.7)';
      fillToggle.style.borderColor = state.shapeFilled ? '#0e7490' : 'rgba(148,163,184,0.4)';
      persistStateSoon();
      updateCursor();
    }

    function updateCursor(){
      const def = TOOL_DEFINITIONS[state.tool];
      if (!def) { canvas.style.cursor = 'crosshair'; return; }
      if (def.kind === 'picker') canvas.style.cursor = 'copy';
      else if (def.kind === 'fill') canvas.style.cursor = 'url("data:image/svg+xml,%3Csvg xmlns=' + encodeURIComponent('http://www.w3.org/2000/svg') + ' width=16 height=16%3E%3Cpath fill=%230f172a d=\'M2 2h4l2 4-2 4H2l-2-4z\'/%3E%3C/svg%3E") 0 16, crosshair';
      else canvas.style.cursor = 'crosshair';
    }

    function updateStatusBar(){
      if (hoverPosition) {
        const x = Math.round(hoverPosition.x);
        const y = Math.round(hoverPosition.y);
        statusPosition.textContent = translate(
          'miniPaint.status.position',
          { x, y },
          () => `座標: ${x}, ${y}`
        );
      } else {
        statusPosition.textContent = translate('miniPaint.status.positionIdle', null, '座標: -');
      }
      statusSize.textContent = translate(
        'miniPaint.status.brushSize',
        { value: state.brushSize },
        () => `太さ: ${state.brushSize}px`
      );
      statusZoom.textContent = translate(
        'miniPaint.status.zoom',
        { value: state.zoom },
        () => `ズーム: ${state.zoom}%`
      );
      statusXp.textContent = translate(
        'miniPaint.status.exp',
        { value: state.sessionXp },
        () => `獲得EXP: ${state.sessionXp}`
      );
    }

    function refreshLocaleText(){
      const previousDefault = state.defaultFileName;
      const previousImported = state.importedFileName;
      state.appName = translate('miniPaint.appName', null, DEFAULT_APP_NAME);
      state.defaultFileName = translate('miniPaint.defaultFileName', null, DEFAULT_FILENAME_FALLBACK);
      state.importedFileName = translate('miniPaint.importedFileName', null, DEFAULT_IMPORTED_FILENAME);
      if (!state.fileName || state.fileName === previousDefault) {
        state.fileName = state.defaultFileName;
      } else if (previousImported && state.fileName === previousImported) {
        state.fileName = state.importedFileName;
      }
      setTitle();

      if (newBtn) newBtn.textContent = translate('miniPaint.menu.new', null, '新規');
      if (importBtn) importBtn.textContent = translate('miniPaint.menu.import', null, '読み込み');
      if (saveBtn) saveBtn.textContent = translate('miniPaint.menu.save', null, '保存');
      if (saveAsBtn) saveAsBtn.textContent = translate('miniPaint.menu.saveAs', null, '名前を付けて保存');
      if (exportBtn) exportBtn.textContent = translate('miniPaint.menu.export', null, 'エクスポート');
      if (clearBtn) clearBtn.textContent = translate('miniPaint.menu.clear', null, 'クリア');
      if (gridToggle) updateGridToggleLabel();
      if (undoBtn) undoBtn.textContent = translate('miniPaint.menu.undo', null, '元に戻す');
      if (redoBtn) redoBtn.textContent = translate('miniPaint.menu.redo', null, 'やり直す');

      toolButtons.forEach(btn => {
        if (!btn || !btn.__toolId) return;
        const def = TOOL_DEFINITIONS[btn.__toolId];
        if (!def) return;
        btn.textContent = `${def.icon} ${translate(def.labelKey, null, def.label)}`;
      });

      if (fillToggle) fillToggle.textContent = translate('miniPaint.tools.fillMode', null, '形を塗りつぶす');
      if (brushLabel) brushLabel.textContent = translate('miniPaint.labels.size', null, 'サイズ');
      if (zoomLabel) zoomLabel.textContent = translate('miniPaint.labels.zoom', null, 'ズーム');
      if (primaryCaption) primaryCaption.textContent = translate('miniPaint.labels.primary', null, '前景');
      if (secondaryCaption) secondaryCaption.textContent = translate('miniPaint.labels.secondary', null, '背景');
      if (primaryInput) primaryInput.title = translate('miniPaint.labels.primaryColorTitle', null, '前景色');
      if (secondaryInput) secondaryInput.title = translate('miniPaint.labels.secondaryColorTitle', null, '背景色');

      if (brushValue) brushValue.textContent = formatBrushValue(state.brushSize);
      if (zoomValue) zoomValue.textContent = formatZoomValue(state.zoom);

      updateStatusBar();
    }

    function markDirty(){
      hasUnsavedChanges = true;
      setTitle();
    }

    function normalizeColorInput(color){
      const tmp = document.createElement('canvas');
      tmp.width = tmp.height = 1;
      const tmpCtx = tmp.getContext('2d');
      tmpCtx.fillStyle = color;
      const computed = tmpCtx.fillStyle;
      if (computed.startsWith('#')) return computed;
      return '#000000';
    }

    function setPrimaryColor(color){
      state.primaryColor = color;
      updateColorPreview();
    }

    function setSecondaryColor(color){
      state.secondaryColor = color;
      updateColorPreview();
    }

    function swapColors(){
      const tmp = state.primaryColor;
      state.primaryColor = state.secondaryColor;
      state.secondaryColor = tmp;
      updateColorPreview();
    }

    function setBrushSize(size){
      state.brushSize = clamp(size, 1, 96);
      updateBrushSize();
    }

    function setZoom(value){
      state.zoom = clamp(value, 50, 200);
      updateZoom();
    }

    function getGridToggleLabel(isOn){
      return translate(
        isOn ? 'miniPaint.menu.gridOn' : 'miniPaint.menu.gridOff',
        null,
        isOn ? 'グリッド: ON' : 'グリッド: OFF'
      );
    }

    function updateGridToggleLabel(){
      if (gridToggle) {
        gridToggle.textContent = getGridToggleLabel(state.showGrid);
      }
    }

    function toggleGrid(){
      state.showGrid = !state.showGrid;
      updateGridToggleLabel();
      updateGrid();
      persistStateSoon();
    }

    function toggleFillMode(){
      state.shapeFilled = !state.shapeFilled;
      updateToolSelection();
    }

    function selectTool(id){
      if (!TOOL_DEFINITIONS[id]) return;
      state.tool = id;
      updateToolSelection();
    }

    function clearCanvas(skipConfirmation){
      if (!skipConfirmation && hasUnsavedChanges) {
        const message = translate('miniPaint.prompts.clearConfirm', null, '現在のキャンバスを消去しますか？');
        if (!confirm(message)) return;
      }
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.restore();
      pushHistory(captureSnapshot());
      hasUnsavedChanges = false;
      setTitle();
      persistCanvasSoon();
      updateStatusBar();
    }

    function newCanvas(){
      if (hasUnsavedChanges) {
        const message = translate('miniPaint.prompts.newConfirm', null, '保存せずに新規キャンバスを作成しますか？');
        if (!confirm(message)) return;
      }
      clearCanvas(true);
      history.length = 0;
      historyIndex = -1;
      pushHistory(captureSnapshot());
      state.fileName = state.defaultFileName;
      hasUnsavedChanges = false;
      setTitle();
      updateHistoryButtons();
      persistCanvasSoon();
      award('new', NEW_XP);
    }

    function saveCanvas(forcePrompt){
      let name = state.fileName || state.defaultFileName;
      if (forcePrompt || !name || name === state.defaultFileName) {
        const promptMessage = translate('miniPaint.prompts.saveFileName', null, '保存するファイル名を入力してください');
        const entered = prompt(promptMessage, name.replace(/\.png$/i, ''));
        if (!entered) return;
        name = entered.endsWith('.png') ? entered : `${entered}.png`;
      }
      try {
        canvas.toBlob(blob => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          hiddenDownloader.href = url;
          hiddenDownloader.download = name;
          hiddenDownloader.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        }, 'image/png');
        state.fileName = name;
        hasUnsavedChanges = false;
        setTitle();
        award('save', SAVE_XP);
        persistCanvasSoon();
      } catch {
        alert(translate('miniPaint.messages.saveFailed', null, '画像の保存に失敗しました。'));
      }
    }

    function importCanvas(){
      hiddenFileInput.value = '';
      hiddenFileInput.click();
    }

    function handleFileSelected(){
      const file = hiddenFileInput.files && hiddenFileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          ctx.save();
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          ctx.restore();
          const scale = Math.min(CANVAS_WIDTH / img.width, CANVAS_HEIGHT / img.height, 1);
          const drawW = img.width * scale;
          const drawH = img.height * scale;
          const dx = (CANVAS_WIDTH - drawW) / 2;
          const dy = (CANVAS_HEIGHT - drawH) / 2;
          ctx.drawImage(img, dx, dy, drawW, drawH);
          pushHistory(captureSnapshot());
          state.fileName = file.name || state.importedFileName;
          hasUnsavedChanges = true;
          setTitle();
          persistCanvasSoon();
          updateHistoryButtons();
          award('import', IMPORT_XP);
        };
        img.onerror = () => alert(translate('miniPaint.messages.imageLoadFailed', null, '画像の読み込みに失敗しました。'));
        img.src = typeof reader.result === 'string' ? reader.result : '';
      };
      reader.onerror = () => alert(translate('miniPaint.messages.fileLoadFailed', null, 'ファイルの読み込みに失敗しました。'));
      reader.readAsDataURL(file);
    }

    function exportCanvas(){
      saveCanvas(false);
    }

    function commitAction(kind){
      if (!actionDirty) return;
      actionDirty = false;
      const snapshot = captureSnapshot();
      pushHistory(snapshot);
      markDirty();
      persistCanvasSoon();
      updateHistoryButtons();
      const now = Date.now();
      if (kind === 'stroke') {
        if (now - state.lastStrokeAwardAt >= STROKE_XP_COOLDOWN) {
          state.lastStrokeAwardAt = now;
          award('stroke', 1);
        }
      } else if (kind === 'fill') {
        award('fill', FILL_XP);
      } else if (kind === 'shape') {
        award('shape', SHAPE_XP);
      }
    }

    function getCanvasPoint(ev){
      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;
      return {
        x: clamp((ev.clientX - rect.left) * scaleX, 0, CANVAS_WIDTH),
        y: clamp((ev.clientY - rect.top) * scaleY, 0, CANVAS_HEIGHT)
      };
    }

    function drawStrokePoint(def, x, y, color){
      ctx.save();
      const size = Math.max(1, state.brushSize * (def.sizeMultiplier || 1));
      ctx.fillStyle = def.erase ? '#ffffff' : color;
      ctx.globalAlpha = def.alpha ? clamp(def.alpha, 0, 1) : 1;
      ctx.beginPath();
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      actionDirty = true;
    }

    function drawStrokeSegment(def, fromX, fromY, toX, toY, color){
      ctx.save();
      ctx.strokeStyle = def.erase ? '#ffffff' : color;
      ctx.lineWidth = Math.max(1, state.brushSize * (def.sizeMultiplier || 1));
      ctx.globalAlpha = def.alpha ? clamp(def.alpha, 0, 1) : 1;
      ctx.lineCap = def.lineCap || 'round';
      ctx.lineJoin = def.lineJoin || 'round';
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();
      ctx.restore();
      actionDirty = true;
    }

    function canonicalRect(x1, y1, x2, y2, lock){
      let dx = x2 - x1;
      let dy = y2 - y1;
      if (lock) {
        const size = Math.max(Math.abs(dx), Math.abs(dy)) || 0;
        const sx = dx >= 0 ? 1 : -1;
        const sy = dy >= 0 ? 1 : -1;
        dx = size * sx;
        dy = size * sy;
      }
      const x = dx >= 0 ? x1 : x1 + dx;
      const y = dy >= 0 ? y1 : y1 + dy;
      return { x, y, w: Math.abs(dx), h: Math.abs(dy) };
    }

    function snapLineWithShift(x1, y1, x2, y2){
      const dx = x2 - x1;
      const dy = y2 - y1;
      if (dx === 0 && dy === 0) return { x: x2, y: y2 };
      const angle = Math.atan2(dy, dx);
      const snapped = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
      const length = Math.sqrt(dx * dx + dy * dy);
      return {
        x: x1 + Math.cos(snapped) * length,
        y: y1 + Math.sin(snapped) * length
      };
    }

    function drawShapePreview(tool, start, current, color, filled, shift){
      clearOverlay();
      const size = Math.max(1, state.brushSize);
      overlayCtx.strokeStyle = color;
      overlayCtx.lineWidth = size;
      overlayCtx.globalAlpha = 1;
      if (tool === 'line') {
        let end = current;
        if (shift) end = snapLineWithShift(start.x, start.y, current.x, current.y);
        overlayCtx.beginPath();
        overlayCtx.moveTo(start.x, start.y);
        overlayCtx.lineTo(end.x, end.y);
        overlayCtx.stroke();
      } else if (tool === 'rectangle') {
        const rect = canonicalRect(start.x, start.y, current.x, current.y, shift);
        if (filled) {
          overlayCtx.fillStyle = color;
          overlayCtx.fillRect(rect.x, rect.y, rect.w, rect.h);
        }
        overlayCtx.strokeRect(rect.x, rect.y, rect.w, rect.h);
      } else if (tool === 'ellipse') {
        const rect = canonicalRect(start.x, start.y, current.x, current.y, shift);
        overlayCtx.beginPath();
        overlayCtx.ellipse(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w / 2, rect.h / 2, 0, 0, Math.PI * 2);
        if (filled) {
          overlayCtx.fillStyle = color;
          overlayCtx.fill();
        }
        overlayCtx.stroke();
      }
    }

    function drawShapeFinal(tool, start, end, color, filled, shift){
      const size = Math.max(1, state.brushSize);
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (tool === 'line') {
        let adjustedEnd = end;
        if (shift) adjustedEnd = snapLineWithShift(start.x, start.y, end.x, end.y);
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(adjustedEnd.x, adjustedEnd.y);
        ctx.stroke();
      } else if (tool === 'rectangle') {
        const rect = canonicalRect(start.x, start.y, end.x, end.y, shift);
        if (filled) {
          ctx.fillStyle = color;
          ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        }
        ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
      } else if (tool === 'ellipse') {
        const rect = canonicalRect(start.x, start.y, end.x, end.y, shift);
        ctx.beginPath();
        ctx.ellipse(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w / 2, rect.h / 2, 0, 0, Math.PI * 2);
        if (filled) {
          ctx.fillStyle = color;
          ctx.fill();
        }
        ctx.stroke();
      }
      ctx.restore();
      actionDirty = true;
    }

    function colorsMatch(data, index, target){
      return data[index] === target.r && data[index + 1] === target.g && data[index + 2] === target.b && data[index + 3] === target.a;
    }

    function setPixel(data, index, color){
      data[index] = color.r;
      data[index + 1] = color.g;
      data[index + 2] = color.b;
      data[index + 3] = color.a;
    }

    function parseColor(color){
      const ctxTmp = document.createElement('canvas').getContext('2d');
      ctxTmp.fillStyle = color;
      const computed = ctxTmp.fillStyle;
      const hex = computed.startsWith('#') ? computed : '#000000';
      const value = parseInt(hex.slice(1), 16);
      if (hex.length === 7) {
        return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255, a: 255 };
      }
      return { r: 0, g: 0, b: 0, a: 255 };
    }

    function floodFillAt(x, y, color){
      const imageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      const data = imageData.data;
      const targetIndex = (Math.floor(y) * CANVAS_WIDTH + Math.floor(x)) * 4;
      const targetColor = {
        r: data[targetIndex],
        g: data[targetIndex + 1],
        b: data[targetIndex + 2],
        a: data[targetIndex + 3]
      };
      const fillColor = parseColor(color);
      if (colorsMatch(data, targetIndex, fillColor)) return false;
      const stack = [[Math.floor(x), Math.floor(y)]];
      const width = CANVAS_WIDTH;
      const height = CANVAS_HEIGHT;
      while (stack.length) {
        const [cx, cy] = stack.pop();
        if (cx < 0 || cy < 0 || cx >= width || cy >= height) continue;
        const idx = (cy * width + cx) * 4;
        if (!colorsMatch(data, idx, targetColor)) continue;
        setPixel(data, idx, fillColor);
        stack.push([cx + 1, cy]);
        stack.push([cx - 1, cy]);
        stack.push([cx, cy + 1]);
        stack.push([cx, cy - 1]);
      }
      ctx.putImageData(imageData, 0, 0);
      actionDirty = true;
      return true;
    }

    function sampleColor(x, y){
      const imageData = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1);
      const d = imageData.data;
      const toHex = v => v.toString(16).padStart(2, '0');
      return `#${toHex(d[0])}${toHex(d[1])}${toHex(d[2])}`;
    }

    function handlePointerDown(ev){
      if (ev.button !== 0 && ev.button !== 2) return;
      if (!canvas.contains(ev.target)) return;
      ev.preventDefault();
      const def = TOOL_DEFINITIONS[state.tool];
      if (!def) return;
      const point = getCanvasPoint(ev);
      pointerState.active = true;
      pointerState.pointerId = ev.pointerId;
      pointerState.button = ev.button;
      pointerState.tool = state.tool;
      pointerState.startX = point.x;
      pointerState.startY = point.y;
      pointerState.lastX = point.x;
      pointerState.lastY = point.y;
      pointerState.color = ev.button === 2 ? state.secondaryColor : state.primaryColor;
      pointerState.shiftKey = ev.shiftKey;
      actionDirty = false;
      canvas.setPointerCapture(ev.pointerId);

      if (def.kind === 'stroke') {
        drawStrokePoint(def, point.x, point.y, pointerState.color);
      } else if (def.kind === 'fill') {
        const changed = floodFillAt(point.x, point.y, pointerState.color);
        if (changed) {
          commitAction('fill');
        }
        pointerState.active = false;
        canvas.releasePointerCapture(ev.pointerId);
      } else if (def.kind === 'picker') {
        const sampled = sampleColor(point.x, point.y);
        if (ev.button === 2) setSecondaryColor(sampled); else setPrimaryColor(sampled);
        pointerState.active = false;
        canvas.releasePointerCapture(ev.pointerId);
      } else if (def.kind.startsWith('shape')) {
        drawShapePreview(pointerState.tool, { x: point.x, y: point.y }, { x: point.x, y: point.y }, pointerState.color, state.shapeFilled, ev.shiftKey);
      }
      hoverPosition = point;
      updateStatusBar();
    }

    function handlePointerMove(ev){
      const point = getCanvasPoint(ev);
      hoverPosition = point;
      if (!pointerState.active || pointerState.pointerId !== ev.pointerId) {
        updateStatusBar();
        return;
      }
      pointerState.shiftKey = ev.shiftKey;
      const def = TOOL_DEFINITIONS[pointerState.tool];
      if (!def) return;
      if (def.kind === 'stroke') {
        drawStrokeSegment(def, pointerState.lastX, pointerState.lastY, point.x, point.y, pointerState.color);
        pointerState.lastX = point.x;
        pointerState.lastY = point.y;
      } else if (def.kind.startsWith('shape')) {
        drawShapePreview(pointerState.tool, { x: pointerState.startX, y: pointerState.startY }, point, pointerState.color, state.shapeFilled, ev.shiftKey);
      }
      updateStatusBar();
    }

    function handlePointerUp(ev){
      if (!pointerState.active || pointerState.pointerId !== ev.pointerId) return;
      const def = TOOL_DEFINITIONS[pointerState.tool];
      pointerState.active = false;
      canvas.releasePointerCapture(ev.pointerId);
      const point = getCanvasPoint(ev);
      hoverPosition = point;
      if (!def) return;
      if (def.kind === 'stroke') {
        drawStrokeSegment(def, pointerState.lastX, pointerState.lastY, point.x, point.y, pointerState.color);
        commitAction('stroke');
      } else if (def.kind.startsWith('shape')) {
        clearOverlay();
        drawShapeFinal(pointerState.tool, { x: pointerState.startX, y: pointerState.startY }, point, pointerState.color, state.shapeFilled, pointerState.shiftKey);
        commitAction('shape');
      }
      updateStatusBar();
    }

    function handlePointerCancel(ev){
      if (pointerState.active && pointerState.pointerId === ev.pointerId) {
        pointerState.active = false;
        canvas.releasePointerCapture(ev.pointerId);
        clearOverlay();
        actionDirty = false;
      }
    }

    function handlePointerLeave(){
      hoverPosition = null;
      updateStatusBar();
    }

    function handleKeydown(ev){
      if (!isRunning) return;
      if (ev.ctrlKey || ev.metaKey) {
        const key = ev.key.toLowerCase();
        if (key === 'z') { ev.preventDefault(); undo(); }
        if (key === 'y') { ev.preventDefault(); redo(); }
        if (key === 's') { ev.preventDefault(); saveCanvas(ev.shiftKey); }
        if (key === 'o') { ev.preventDefault(); importCanvas(); }
        if (key === 'n') { ev.preventDefault(); newCanvas(); }
      }
    }

    function quit(){
      if (currentRuntimeRef) {
        try { currentRuntimeRef.stop(); } catch {}
        try { currentRuntimeRef.destroy(); } catch {}
      }
    }

    function start(){
      if (isRunning) return;
      isRunning = true;
      listeners.forEach(l => l.target.addEventListener(l.type, l.handler, l.options || false));
      updateStatusBar();
    }

    function stop(){
      if (!isRunning) return;
      isRunning = false;
      listeners.forEach(l => l.target.removeEventListener(l.type, l.handler, l.options || false));
    }

    function destroy(){
      stop();
      if (persistTimer) { clearTimeout(persistTimer); persistTimer = null; }
      if (canvasPersistTimer) { clearTimeout(canvasPersistTimer); canvasPersistTimer = null; }
      hiddenFileInput.removeEventListener('change', handleFileSelected);
      if (localeUnsubscribe) {
        try { localeUnsubscribe(); } catch (error) { console.warn('[MiniPaint] Failed to unsubscribe locale listener:', error); }
        localeUnsubscribe = null;
      }
      try { root.removeChild(wrapper); } catch {}
      try { root.removeChild(hiddenFileInput); } catch {}
      try { root.removeChild(hiddenDownloader); } catch {}
      writePersistentState(state);
      currentRuntimeRef = null;
    }

    newBtn = createToolbarButton(translate('miniPaint.menu.new', null, '新規'), () => newCanvas());
    importBtn = createToolbarButton(translate('miniPaint.menu.import', null, '読み込み'), () => importCanvas());
    saveBtn = createToolbarButton(translate('miniPaint.menu.save', null, '保存'), () => saveCanvas(false));
    saveAsBtn = createToolbarButton(translate('miniPaint.menu.saveAs', null, '名前を付けて保存'), () => saveCanvas(true));
    exportBtn = createToolbarButton(translate('miniPaint.menu.export', null, 'エクスポート'), () => exportCanvas());
    clearBtn = createToolbarButton(translate('miniPaint.menu.clear', null, 'クリア'), () => clearCanvas());
    gridToggle = createToolbarButton(getGridToggleLabel(state.showGrid), () => toggleGrid());
    gridToggle.style.marginLeft = 'auto';

    fileRow.appendChild(newBtn);
    fileRow.appendChild(importBtn);
    fileRow.appendChild(saveBtn);
    fileRow.appendChild(saveAsBtn);
    fileRow.appendChild(exportBtn);
    fileRow.appendChild(clearBtn);
    fileRow.appendChild(gridToggle);

    undoBtn = createToolbarButton(translate('miniPaint.menu.undo', null, '元に戻す'), () => undo());
    redoBtn = createToolbarButton(translate('miniPaint.menu.redo', null, 'やり直す'), () => redo());
    undoBtn.style.width = redoBtn.style.width = '100%';
    undoBtn.style.padding = redoBtn.style.padding = '10px 0';

    fileRow.insertBefore(undoBtn, gridToggle);
    fileRow.insertBefore(redoBtn, gridToggle);

    Object.entries(TOOL_DEFINITIONS).forEach(([id, def]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.__toolId = id;
      btn.textContent = `${def.icon} ${translate(def.labelKey, null, def.label)}`;
      btn.style.border = '1px solid rgba(148,163,184,0.4)';
      btn.style.borderRadius = '10px';
      btn.style.padding = '8px 10px';
      btn.style.fontSize = '13px';
      btn.style.cursor = 'pointer';
      btn.style.background = 'rgba(255,255,255,0.8)';
      setImportantColor(btn, '#1f2937');
      btn.style.fontWeight = '500';
      btn.addEventListener('click', () => selectTool(id));
      btn.addEventListener('pointerenter', () => btn.style.boxShadow = '0 6px 14px rgba(15,23,42,0.18)');
      btn.addEventListener('pointerleave', () => btn.style.boxShadow = 'none');
      toolGroup.appendChild(btn);
      toolButtons.push(btn);
    });

    fillToggle = document.createElement('button');
    fillToggle.type = 'button';
    fillToggle.textContent = translate('miniPaint.tools.fillMode', null, '形を塗りつぶす');
    fillToggle.style.border = '1px solid rgba(148,163,184,0.4)';
    fillToggle.style.borderRadius = '10px';
    fillToggle.style.padding = '8px 12px';
    fillToggle.style.fontSize = '13px';
    fillToggle.style.cursor = 'pointer';
    setImportantColor(fillToggle, '#0f172a');
    fillToggle.addEventListener('click', toggleFillMode);
    toolRow.appendChild(fillToggle);

    brushLabel = document.createElement('span');
    brushLabel.textContent = translate('miniPaint.labels.size', null, 'サイズ');
    brushLabel.style.fontSize = '12px';
    setImportantColor(brushLabel, '#475569');

    brushSlider = document.createElement('input');
    brushSlider.type = 'range';
    brushSlider.min = '1';
    brushSlider.max = '96';
    brushSlider.value = String(state.brushSize);
    brushSlider.addEventListener('input', () => setBrushSize(Number(brushSlider.value)));

    brushValue = document.createElement('span');
    brushValue.style.minWidth = '48px';
    brushValue.style.fontSize = '12px';
    setImportantColor(brushValue, '#1f2937');

    zoomLabel = document.createElement('span');
    zoomLabel.textContent = translate('miniPaint.labels.zoom', null, 'ズーム');
    zoomLabel.style.fontSize = '12px';
    setImportantColor(zoomLabel, '#475569');

    zoomSlider = document.createElement('input');
    zoomSlider.type = 'range';
    zoomSlider.min = '50';
    zoomSlider.max = '200';
    zoomSlider.value = String(state.zoom);
    zoomSlider.addEventListener('input', () => setZoom(Number(zoomSlider.value)));

    zoomValue = document.createElement('span');
    zoomValue.style.minWidth = '48px';
    zoomValue.style.fontSize = '12px';
    setImportantColor(zoomValue, '#1f2937');

    sizeGroup.appendChild(brushLabel);
    sizeGroup.appendChild(brushSlider);
    sizeGroup.appendChild(brushValue);
    sizeGroup.appendChild(zoomLabel);
    sizeGroup.appendChild(zoomSlider);
    sizeGroup.appendChild(zoomValue);

    const colorPreview = document.createElement('div');
    colorPreview.style.display = 'flex';
    colorPreview.style.alignItems = 'center';
    colorPreview.style.gap = '8px';

    primarySwatch = createColorSwatch(state.primaryColor);
    secondarySwatch = createColorSwatch(state.secondaryColor);

    const swapBtn = document.createElement('button');
    swapBtn.type = 'button';
    swapBtn.textContent = '↔';
    swapBtn.style.border = '1px solid rgba(148,163,184,0.4)';
    swapBtn.style.borderRadius = '8px';
    swapBtn.style.padding = '8px 10px';
    swapBtn.style.fontSize = '14px';
    swapBtn.style.cursor = 'pointer';
    setImportantColor(swapBtn, '#1f2937');
    swapBtn.addEventListener('click', swapColors);

    primaryInput = document.createElement('input');
    primaryInput.type = 'color';
    primaryInput.value = normalizeColorInput(state.primaryColor);
    primaryInput.title = translate('miniPaint.labels.primaryColorTitle', null, '前景色');
    primaryInput.style.width = '42px';
    primaryInput.style.height = '32px';
    primaryInput.style.border = '1px solid rgba(148,163,184,0.4)';
    primaryInput.style.borderRadius = '8px';
    primaryInput.addEventListener('input', () => setPrimaryColor(primaryInput.value));

    secondaryInput = document.createElement('input');
    secondaryInput.type = 'color';
    secondaryInput.value = normalizeColorInput(state.secondaryColor);
    secondaryInput.title = translate('miniPaint.labels.secondaryColorTitle', null, '背景色');
    secondaryInput.style.width = '42px';
    secondaryInput.style.height = '32px';
    secondaryInput.style.border = '1px solid rgba(148,163,184,0.4)';
    secondaryInput.style.borderRadius = '8px';
    secondaryInput.addEventListener('input', () => setSecondaryColor(secondaryInput.value));

    const primaryWrap = document.createElement('div');
    primaryWrap.style.display = 'flex';
    primaryWrap.style.flexDirection = 'column';
    primaryWrap.style.alignItems = 'center';
    primaryWrap.style.gap = '4px';
    primaryCaption = document.createElement('span');
    primaryCaption.textContent = translate('miniPaint.labels.primary', null, '前景');
    primaryCaption.style.fontSize = '11px';
    setImportantColor(primaryCaption, '#475569');
    primaryWrap.appendChild(primarySwatch);
    primaryWrap.appendChild(primaryCaption);

    const secondaryWrap = document.createElement('div');
    secondaryWrap.style.display = 'flex';
    secondaryWrap.style.flexDirection = 'column';
    secondaryWrap.style.alignItems = 'center';
    secondaryWrap.style.gap = '4px';
    secondaryCaption = document.createElement('span');
    secondaryCaption.textContent = translate('miniPaint.labels.secondary', null, '背景');
    secondaryCaption.style.fontSize = '11px';
    setImportantColor(secondaryCaption, '#475569');
    secondaryWrap.appendChild(secondarySwatch);
    secondaryWrap.appendChild(secondaryCaption);

    colorPreview.appendChild(primaryWrap);
    colorPreview.appendChild(secondaryWrap);
    colorPreview.appendChild(swapBtn);
    colorPreview.appendChild(primaryInput);
    colorPreview.appendChild(secondaryInput);

    primarySwatch.addEventListener('click', () => primaryInput.click());
    secondarySwatch.addEventListener('click', () => secondaryInput.click());

    const palette = document.createElement('div');
    palette.style.display = 'grid';
    palette.style.gridTemplateColumns = 'repeat(8, 24px)';
    palette.style.gap = '6px';

    PALETTE_COLORS.forEach(hex => {
      const sw = document.createElement('button');
      sw.type = 'button';
      sw.style.width = '24px';
      sw.style.height = '24px';
      sw.style.borderRadius = '6px';
      sw.style.border = '1px solid rgba(15,23,42,0.2)';
      sw.style.background = hex;
      sw.style.cursor = 'pointer';
      sw.title = hex.toUpperCase();
      sw.addEventListener('click', () => setPrimaryColor(hex));
      sw.addEventListener('contextmenu', ev => { ev.preventDefault(); setSecondaryColor(hex); });
      palette.appendChild(sw);
    });

    colorRow.appendChild(colorPreview);
    colorRow.appendChild(palette);

    hiddenFileInput.addEventListener('change', handleFileSelected);

    trackListener(canvas, 'pointerdown', handlePointerDown);
    trackListener(canvas, 'pointermove', handlePointerMove);
    trackListener(window, 'pointerup', handlePointerUp);
    trackListener(window, 'pointercancel', handlePointerCancel);
    trackListener(canvas, 'pointerleave', handlePointerLeave);
    trackListener(canvas, 'contextmenu', preventContextMenu);
    trackListener(window, 'keydown', handleKeydown);

    function preventContextMenu(ev){ ev.preventDefault(); }

    function initializeCanvas(){
      history.length = 0;
      historyIndex = -1;
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.restore();

      const finalize = () => {
        const snap = captureSnapshot();
        if (snap) pushHistory(snap);
        hasUnsavedChanges = false;
        setTitle();
        updateHistoryButtons();
        persistCanvasSoon();
      };

      if (state.canvasData) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          finalize();
        };
        img.onerror = finalize;
        img.src = state.canvasData;
      } else {
        finalize();
      }
    }

    refreshLocaleText();
    updateColorPreview();
    updateToolSelection();
    updateGrid();
    updateHistoryButtons();
    initializeCanvas();
    updateStatusBar();

    const i18nInstance = getI18n();
    if (i18nInstance && typeof i18nInstance.onLocaleChanged === 'function') {
      try {
        localeUnsubscribe = i18nInstance.onLocaleChanged(() => {
          refreshLocaleText();
        });
      } catch (error) {
        console.warn('[MiniPaint] Failed to subscribe to locale changes:', error);
      }
    }

    const runtime = {
      start,
      stop,
      destroy,
      getScore(){ return state.sessionXp; }
    };

    currentRuntimeRef = runtime;
    start();
    return runtime;
  }

  function createToolbarButton(label, handler){
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = label;
    btn.style.border = '1px solid rgba(148,163,184,0.4)';
    btn.style.borderRadius = '8px';
    btn.style.padding = '8px 12px';
    btn.style.fontSize = '12px';
    btn.style.cursor = 'pointer';
    btn.style.background = 'rgba(255,255,255,0.85)';
    btn.style.fontWeight = '500';
    setImportantColor(btn, '#1f2937');
    btn.addEventListener('click', handler);
    btn.addEventListener('pointerenter', () => btn.style.boxShadow = '0 8px 16px rgba(15,23,42,0.16)');
    btn.addEventListener('pointerleave', () => btn.style.boxShadow = 'none');
    return btn;
  }

  function createColorSwatch(color){
    const sw = document.createElement('div');
    sw.style.width = '42px';
    sw.style.height = '42px';
    sw.style.borderRadius = '12px';
    sw.style.border = '2px solid rgba(15,23,42,0.2)';
    sw.style.boxShadow = '0 8px 16px rgba(15,23,42,0.18)';
    sw.style.background = color;
    sw.style.cursor = 'pointer';
    return sw;
  }

  window.registerMiniGame({
    id: 'paint',
    name: 'ペイント', nameKey: 'selection.miniexp.games.paint.name',
    description: '描画+1 / 塗りつぶし+3 / 保存+8 EXP、Windows風ペイント', descriptionKey: 'selection.miniexp.games.paint.description', categoryIds: ['utility'],
    category: 'ユーティリティ',
    version: '0.1.0',
    author: 'mod',
    create
  });
})();

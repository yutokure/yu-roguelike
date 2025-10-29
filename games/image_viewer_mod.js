(function(){
  'use strict';

  const STYLE_ID = 'mini-image-viewer-style';
  const DEFAULT_STATE = Object.freeze({
    zoom: 1,
    rotation: 0,
    stretchX: 1,
    stretchY: 1,
    panX: 0,
    panY: 0,
    rotateX: 0,
    rotateY: 0,
    perspective: 800
  });
  const ZOOM_MIN = 0.1;
  const ZOOM_MAX = 8;
  const STRETCH_MIN = 0.2;
  const STRETCH_MAX = 4;
  const PERSPECTIVE_MIN = 200;
  const PERSPECTIVE_MAX = 2000;
  const ROTATE_LIMIT = 180;
  const ROTATE_3D_LIMIT = 75;
  const XP_ON_LOAD = 10;

  const i18n = window.I18n || null;

  function translate(key, fallback){
    if (key && i18n && typeof i18n.t === 'function'){
      try {
        const value = i18n.t(key);
        if (value !== undefined && value !== null && value !== key) {
          return value;
        }
      } catch (error) {
        // ignore and use fallback
      }
    }
    return fallback;
  }

  function escapeHtml(value){
    return String(value).replace(/[&<>"']/g, ch => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[ch] || ch));
  }

  function ensureStyles(){
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
.mini-image-viewer { display:flex; flex-direction:column; gap:16px; color:#0f172a; }
.mini-image-viewer-header { display:flex; flex-direction:column; gap:4px; }
.mini-image-viewer-title { margin:0; font-size:22px; font-weight:700; color:#0f172a; }
.mini-image-viewer-subtitle { margin:0; font-size:14px; color:#475569; }
.mini-image-viewer-exp { margin:0; font-size:13px; color:#1d4ed8; font-weight:600; }
.mini-image-viewer-body { display:flex; flex-wrap:wrap; gap:16px; }
.mini-image-viewer-stage-wrapper { flex:1 1 360px; display:flex; flex-direction:column; gap:8px; }
.mini-image-viewer-stage { position:relative; border:1px solid rgba(102,126,234,0.35); border-radius:12px; background:rgba(238,242,255,0.85); min-height:340px; display:flex; align-items:center; justify-content:center; overflow:hidden; cursor:grab; transition:border-color 0.2s ease, box-shadow 0.2s ease; }
.mini-image-viewer-stage:focus-visible { outline:3px solid rgba(102,126,234,0.6); outline-offset:2px; }
.mini-image-viewer-stage.dragging { cursor:grabbing; border-color:rgba(102,126,234,0.65); box-shadow:inset 0 0 0 2px rgba(102,126,234,0.15); }
.mini-image-viewer-stage.drag-over { border-color:#60a5fa; box-shadow:0 0 0 3px rgba(96,165,250,0.35); }
.mini-image-viewer-stage img { max-width:none; max-height:none; transform-origin:center center; user-select:none; pointer-events:none; display:none; }
.mini-image-viewer-stage.has-image img { display:block; }
.mini-image-viewer-placeholder { position:absolute; inset:16px; display:flex; align-items:center; justify-content:center; text-align:center; color:#64748b; font-size:14px; line-height:1.5; pointer-events:none; transition:opacity 0.2s ease; }
.mini-image-viewer-stage.has-image .mini-image-viewer-placeholder { opacity:0; }
.mini-image-viewer-stage-hint { margin:0; font-size:12px; color:#6b7280; }
.mini-image-viewer-message { min-height:22px; font-size:13px; color:#0f172a; }
.mini-image-viewer-message.error { color:#b91c1c; }
.mini-image-viewer-message.success { color:#166534; }
.mini-image-viewer-controls { flex:1 1 260px; display:flex; flex-direction:column; gap:12px; }
.mini-image-viewer-upload { display:flex; flex-direction:column; gap:8px; }
.mini-image-viewer-file-label { display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:10px 16px; background:linear-gradient(135deg,#667eea,#764ba2); color:#f8fafc; border-radius:999px; font-weight:600; cursor:pointer; box-shadow:0 4px 12px rgba(102,126,234,0.25); transition:transform 0.2s ease, box-shadow 0.2s ease; }
.mini-image-viewer-file-label:hover { transform:translateY(-1px); box-shadow:0 6px 16px rgba(102,126,234,0.35); }
.mini-image-viewer-file-label input { display:none; }
.mini-image-viewer-upload-actions { display:flex; gap:8px; }
.mini-image-viewer-upload-actions button { flex:1; padding:8px 12px; border-radius:999px; border:1px solid rgba(99,102,241,0.25); background:#eef2ff; color:#312e81; font-weight:600; cursor:pointer; transition:background 0.2s ease, transform 0.2s ease; }
.mini-image-viewer-upload-actions button:hover { background:#e0e7ff; transform:translateY(-1px); }
.mini-image-viewer-control-group { display:flex; flex-direction:column; gap:6px; }
.mini-image-viewer-control-row { display:flex; gap:12px; }
.mini-image-viewer-control { display:flex; align-items:center; gap:8px; }
.mini-image-viewer-control input[type="range"] { flex:1; }
.mini-image-viewer-value { font-size:12px; color:#475569; min-width:44px; text-align:right; }
.mini-image-viewer-control-group label { font-size:13px; color:#1f2937; font-weight:600; }
.mini-image-viewer-meta { background:#f8f9ff; border:1px solid rgba(102,126,234,0.2); border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:8px; }
.mini-image-viewer-meta h4 { margin:0; font-size:16px; color:#1f2937; }
.mini-image-viewer-meta-grid { margin:0; display:grid; grid-template-columns:120px 1fr; gap:6px 12px; }
.mini-image-viewer-meta-grid dt { margin:0; font-size:13px; color:#475569; }
.mini-image-viewer-meta-grid dd { margin:0; font-size:13px; color:#1f2937; word-break:break-all; }
@media (max-width: 980px) {
  .mini-image-viewer-stage-wrapper,
  .mini-image-viewer-controls { flex:1 1 100%; }
}
@media (max-width: 600px) {
  .mini-image-viewer-stage { min-height:260px; }
}`;
    document.head.appendChild(style);
  }

  function clamp(value, min, max){
    return Math.min(max, Math.max(min, value));
  }

  function formatPercent(value){
    return `${Math.round(value * 100)}%`;
  }

  function formatDegrees(value){
    return `${Math.round(value)}°`;
  }

  function formatPerspective(value){
    return `${Math.round(value)}px`;
  }

  function formatFileSize(bytes){
    if (!Number.isFinite(bytes) || bytes < 0) return '-';
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    const gb = mb / 1024;
    return `${gb.toFixed(2)} GB`;
  }

  function formatMetaDate(timestamp){
    if (!Number.isFinite(timestamp)) return '-';
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '-';
    const locale = (i18n && typeof i18n.getLocale === 'function' && i18n.getLocale()) || 'ja-JP';
    try {
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(date);
    } catch (error) {
      return new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(date);
    }
  }

  function formatExp(value){
    const number = Number(value) || 0;
    const formatter = (typeof Intl !== 'undefined' && Intl.NumberFormat)
      ? new Intl.NumberFormat((i18n && typeof i18n.getLocale === 'function' && i18n.getLocale()) || 'ja-JP', { maximumFractionDigits: 2 })
      : null;
    return formatter ? formatter.format(number) : number.toFixed(2);
  }

  function createUniqueId(prefix){
    return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function replacePlaceholders(template, replacements){
    if (typeof template !== 'string' || !template.includes('{')) return template;
    return Object.entries(replacements || {}).reduce((acc, [key, value]) => {
      const token = `{${key}}`;
      return acc.split(token).join(String(value));
    }, template);
  }

  function cloneDefaultState(){
    return { ...DEFAULT_STATE };
  }

  function create(root, awardXp){
    ensureStyles();

    const headerTitle = translate('tools.imageViewer.header.title', '画像ビューア');
    const headerDescription = translate('tools.imageViewer.header.description', '画像を読み込み、パン・ズーム・回転・伸縮・遠近変換で確認できます。');
    const stageAria = translate('tools.imageViewer.stage.ariaLabel', '画像プレビュー領域');
    const stageHint = translate('tools.imageViewer.stage.hint', 'ホイールでズーム、ドラッグでパン、ダブルクリックでビューをリセットします。');
    const placeholderText = translate('tools.imageViewer.stage.placeholder', '画像ファイルを選択するか、ここにドラッグ＆ドロップしてください。');
    const selectFileText = translate('tools.imageViewer.upload.select', '画像ファイルを選択');
    const resetViewText = translate('tools.imageViewer.upload.resetView', 'ビューリセット');
    const resetAllText = translate('tools.imageViewer.upload.resetAll', '全てリセット');
    const zoomLabel = translate('tools.imageViewer.controls.zoom', 'ズーム');
    const rotationLabel = translate('tools.imageViewer.controls.rotation', '回転');
    const stretchXLabel = translate('tools.imageViewer.controls.stretchX', '横伸縮');
    const stretchYLabel = translate('tools.imageViewer.controls.stretchY', '縦伸縮');
    const perspectiveLabel = translate('tools.imageViewer.controls.perspective', '遠近距離');
    const rotateXLabel = translate('tools.imageViewer.controls.rotateX', '遠近X回転');
    const rotateYLabel = translate('tools.imageViewer.controls.rotateY', '遠近Y回転');
    const metaTitle = translate('tools.imageViewer.meta.title', 'メタ情報');
    const metaNameLabel = translate('tools.imageViewer.meta.name', 'ファイル名');
    const metaTypeLabel = translate('tools.imageViewer.meta.type', '種類');
    const metaSizeLabel = translate('tools.imageViewer.meta.size', 'サイズ');
    const metaDimensionLabel = translate('tools.imageViewer.meta.dimensions', '画像解像度');
    const metaModifiedLabel = translate('tools.imageViewer.meta.modified', '最終更新日');
    const expLabelTemplate = translate('minigame.image_viewer_mod.header.exp', '獲得EXP: {xp}');

    const ids = {
      container: createUniqueId('mini-image-viewer'),
      stage: createUniqueId('mini-image-viewer-stage'),
      placeholder: createUniqueId('mini-image-viewer-placeholder'),
      image: createUniqueId('mini-image-viewer-image'),
      message: createUniqueId('mini-image-viewer-message'),
      file: createUniqueId('mini-image-viewer-file'),
      resetView: createUniqueId('mini-image-viewer-reset-view'),
      resetAll: createUniqueId('mini-image-viewer-reset-all'),
      zoom: createUniqueId('mini-image-viewer-zoom'),
      zoomValue: createUniqueId('mini-image-viewer-zoom-value'),
      rotation: createUniqueId('mini-image-viewer-rotation'),
      rotationValue: createUniqueId('mini-image-viewer-rotation-value'),
      stretchX: createUniqueId('mini-image-viewer-stretch-x'),
      stretchXValue: createUniqueId('mini-image-viewer-stretch-x-value'),
      stretchY: createUniqueId('mini-image-viewer-stretch-y'),
      stretchYValue: createUniqueId('mini-image-viewer-stretch-y-value'),
      perspective: createUniqueId('mini-image-viewer-perspective'),
      perspectiveValue: createUniqueId('mini-image-viewer-perspective-value'),
      rotateX: createUniqueId('mini-image-viewer-rotate-x'),
      rotateXValue: createUniqueId('mini-image-viewer-rotate-x-value'),
      rotateY: createUniqueId('mini-image-viewer-rotate-y'),
      rotateYValue: createUniqueId('mini-image-viewer-rotate-y-value'),
      metaName: createUniqueId('mini-image-viewer-meta-name'),
      metaType: createUniqueId('mini-image-viewer-meta-type'),
      metaSize: createUniqueId('mini-image-viewer-meta-size'),
      metaDimensions: createUniqueId('mini-image-viewer-meta-dimensions'),
      metaModified: createUniqueId('mini-image-viewer-meta-modified'),
      exp: createUniqueId('mini-image-viewer-exp')
    };

    const container = document.createElement('div');
    container.className = 'mini-image-viewer';
    container.id = ids.container;
    container.innerHTML = `
      <div class="mini-image-viewer-header">
        <h2 class="mini-image-viewer-title">${escapeHtml(headerTitle)}</h2>
        <p class="mini-image-viewer-subtitle">${escapeHtml(headerDescription)}</p>
        <p id="${ids.exp}" class="mini-image-viewer-exp" aria-live="polite"></p>
      </div>
      <div class="mini-image-viewer-body">
        <div class="mini-image-viewer-stage-wrapper">
          <div id="${ids.stage}" class="mini-image-viewer-stage" tabindex="0" aria-label="${escapeHtml(stageAria)}">
            <div id="${ids.placeholder}" class="mini-image-viewer-placeholder">${escapeHtml(placeholderText)}</div>
            <img id="${ids.image}" alt="${escapeHtml(translate('tools.imageViewer.stage.imageAlt', '選択した画像のプレビュー'))}" draggable="false" />
          </div>
          <p class="mini-image-viewer-stage-hint">${escapeHtml(stageHint)}</p>
          <div id="${ids.message}" class="mini-image-viewer-message" role="status" aria-live="polite"></div>
        </div>
        <div class="mini-image-viewer-controls">
          <div class="mini-image-viewer-upload">
            <label class="mini-image-viewer-file-label">
              <span>${escapeHtml(selectFileText)}</span>
              <input type="file" id="${ids.file}" accept="image/*" />
            </label>
            <div class="mini-image-viewer-upload-actions">
              <button type="button" id="${ids.resetView}">${escapeHtml(resetViewText)}</button>
              <button type="button" id="${ids.resetAll}">${escapeHtml(resetAllText)}</button>
            </div>
          </div>
          <div class="mini-image-viewer-control-group">
            <label for="${ids.zoom}">${escapeHtml(zoomLabel)}</label>
            <div class="mini-image-viewer-control">
              <input type="range" id="${ids.zoom}" min="${ZOOM_MIN}" max="${ZOOM_MAX}" step="0.01" value="1" />
              <span id="${ids.zoomValue}" class="mini-image-viewer-value">100%</span>
            </div>
          </div>
          <div class="mini-image-viewer-control-group">
            <label for="${ids.rotation}">${escapeHtml(rotationLabel)}</label>
            <div class="mini-image-viewer-control">
              <input type="range" id="${ids.rotation}" min="-${ROTATE_LIMIT}" max="${ROTATE_LIMIT}" step="1" value="0" />
              <span id="${ids.rotationValue}" class="mini-image-viewer-value">0°</span>
            </div>
          </div>
          <div class="mini-image-viewer-control-row">
            <div class="mini-image-viewer-control-group">
              <label for="${ids.stretchX}">${escapeHtml(stretchXLabel)}</label>
              <div class="mini-image-viewer-control">
                <input type="range" id="${ids.stretchX}" min="${STRETCH_MIN}" max="${STRETCH_MAX}" step="0.01" value="1" />
                <span id="${ids.stretchXValue}" class="mini-image-viewer-value">100%</span>
              </div>
            </div>
            <div class="mini-image-viewer-control-group">
              <label for="${ids.stretchY}">${escapeHtml(stretchYLabel)}</label>
              <div class="mini-image-viewer-control">
                <input type="range" id="${ids.stretchY}" min="${STRETCH_MIN}" max="${STRETCH_MAX}" step="0.01" value="1" />
                <span id="${ids.stretchYValue}" class="mini-image-viewer-value">100%</span>
              </div>
            </div>
          </div>
          <div class="mini-image-viewer-control-group">
            <label for="${ids.perspective}">${escapeHtml(perspectiveLabel)}</label>
            <div class="mini-image-viewer-control">
              <input type="range" id="${ids.perspective}" min="${PERSPECTIVE_MIN}" max="${PERSPECTIVE_MAX}" step="10" value="800" />
              <span id="${ids.perspectiveValue}" class="mini-image-viewer-value">800px</span>
            </div>
          </div>
          <div class="mini-image-viewer-control-row">
            <div class="mini-image-viewer-control-group">
              <label for="${ids.rotateX}">${escapeHtml(rotateXLabel)}</label>
              <div class="mini-image-viewer-control">
                <input type="range" id="${ids.rotateX}" min="-${ROTATE_3D_LIMIT}" max="${ROTATE_3D_LIMIT}" step="1" value="0" />
                <span id="${ids.rotateXValue}" class="mini-image-viewer-value">0°</span>
              </div>
            </div>
            <div class="mini-image-viewer-control-group">
              <label for="${ids.rotateY}">${escapeHtml(rotateYLabel)}</label>
              <div class="mini-image-viewer-control">
                <input type="range" id="${ids.rotateY}" min="-${ROTATE_3D_LIMIT}" max="${ROTATE_3D_LIMIT}" step="1" value="0" />
                <span id="${ids.rotateYValue}" class="mini-image-viewer-value">0°</span>
              </div>
            </div>
          </div>
          <div class="mini-image-viewer-meta" aria-live="polite">
            <h4>${escapeHtml(metaTitle)}</h4>
            <dl class="mini-image-viewer-meta-grid">
              <div class="mini-image-viewer-meta-row">
                <dt>${escapeHtml(metaNameLabel)}</dt>
                <dd id="${ids.metaName}">-</dd>
              </div>
              <div class="mini-image-viewer-meta-row">
                <dt>${escapeHtml(metaTypeLabel)}</dt>
                <dd id="${ids.metaType}">-</dd>
              </div>
              <div class="mini-image-viewer-meta-row">
                <dt>${escapeHtml(metaSizeLabel)}</dt>
                <dd id="${ids.metaSize}">-</dd>
              </div>
              <div class="mini-image-viewer-meta-row">
                <dt>${escapeHtml(metaDimensionLabel)}</dt>
                <dd id="${ids.metaDimensions}">-</dd>
              </div>
              <div class="mini-image-viewer-meta-row">
                <dt>${escapeHtml(metaModifiedLabel)}</dt>
                <dd id="${ids.metaModified}">-</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    `;

    root.appendChild(container);

    const refs = {
      container,
      stage: container.querySelector(`#${ids.stage}`),
      placeholder: container.querySelector(`#${ids.placeholder}`),
      image: container.querySelector(`#${ids.image}`),
      message: container.querySelector(`#${ids.message}`),
      file: container.querySelector(`#${ids.file}`),
      resetView: container.querySelector(`#${ids.resetView}`),
      resetAll: container.querySelector(`#${ids.resetAll}`),
      zoom: container.querySelector(`#${ids.zoom}`),
      zoomValue: container.querySelector(`#${ids.zoomValue}`),
      rotation: container.querySelector(`#${ids.rotation}`),
      rotationValue: container.querySelector(`#${ids.rotationValue}`),
      stretchX: container.querySelector(`#${ids.stretchX}`),
      stretchXValue: container.querySelector(`#${ids.stretchXValue}`),
      stretchY: container.querySelector(`#${ids.stretchY}`),
      stretchYValue: container.querySelector(`#${ids.stretchYValue}`),
      perspective: container.querySelector(`#${ids.perspective}`),
      perspectiveValue: container.querySelector(`#${ids.perspectiveValue}`),
      rotateX: container.querySelector(`#${ids.rotateX}`),
      rotateXValue: container.querySelector(`#${ids.rotateXValue}`),
      rotateY: container.querySelector(`#${ids.rotateY}`),
      rotateYValue: container.querySelector(`#${ids.rotateYValue}`),
      metaName: container.querySelector(`#${ids.metaName}`),
      metaType: container.querySelector(`#${ids.metaType}`),
      metaSize: container.querySelector(`#${ids.metaSize}`),
      metaDimensions: container.querySelector(`#${ids.metaDimensions}`),
      metaModified: container.querySelector(`#${ids.metaModified}`),
      exp: container.querySelector(`#${ids.exp}`)
    };

    let state = cloneDefaultState();
    let currentFile = null;
    let objectUrl = null;
    let naturalSize = { width: 0, height: 0 };
    let dragState = null;
    let totalXpEarned = 0;

    function updateExpLabel(){
      if (!refs.exp) return;
      const formatted = formatExp(totalXpEarned);
      refs.exp.textContent = (expLabelTemplate || '獲得EXP: {xp}').replace('{xp}', formatted);
    }

    function addExperience(amount, context){
      if (!Number.isFinite(amount) || amount <= 0) return;
      totalXpEarned += amount;
      updateExpLabel();
      if (typeof awardXp === 'function') {
        try {
          awardXp(amount, context || {});
        } catch (error) {
          // ignore award errors to keep viewer responsive
        }
      }
    }

    function renderMessage(text, type){
      if (!refs.message) return;
      refs.message.textContent = text || '';
      refs.message.classList.remove('error', 'success');
      if (type === 'error') refs.message.classList.add('error');
      if (type === 'success') refs.message.classList.add('success');
    }

    function clearMessage(){
      renderMessage('');
    }

    function setStageHasImage(active){
      if (!refs.stage) return;
      refs.stage.classList.toggle('has-image', !!active);
      if (refs.placeholder) {
        refs.placeholder.hidden = !!active;
        refs.placeholder.setAttribute('aria-hidden', active ? 'true' : 'false');
      }
    }

    function updateMeta(){
      if (!refs.metaName) return;
      if (!currentFile){
        refs.metaName.textContent = '-';
        refs.metaType.textContent = '-';
        refs.metaSize.textContent = '-';
        refs.metaDimensions.textContent = '-';
        refs.metaModified.textContent = '-';
        return;
      }
      refs.metaName.textContent = currentFile.name || translate('tools.imageViewer.meta.nameFallback', '(Untitled)');
      refs.metaType.textContent = currentFile.type || translate('tools.imageViewer.meta.typeFallback', 'Unknown');
      refs.metaSize.textContent = formatFileSize(currentFile.size);
      refs.metaDimensions.textContent = (naturalSize.width && naturalSize.height)
        ? replacePlaceholders(
            translate('tools.imageViewer.meta.dimensionsValue', '{width} × {height} px'),
            { width: naturalSize.width, height: naturalSize.height }
          )
        : '-';
      refs.metaModified.textContent = (typeof currentFile.lastModified === 'number')
        ? formatMetaDate(currentFile.lastModified)
        : '-';
    }

    function updateValueLabels(){
      if (!refs.zoomValue) return;
      refs.zoomValue.textContent = formatPercent(state.zoom);
      refs.rotationValue.textContent = formatDegrees(state.rotation);
      refs.stretchXValue.textContent = formatPercent(state.stretchX);
      refs.stretchYValue.textContent = formatPercent(state.stretchY);
      refs.perspectiveValue.textContent = formatPerspective(state.perspective);
      refs.rotateXValue.textContent = formatDegrees(state.rotateX);
      refs.rotateYValue.textContent = formatDegrees(state.rotateY);
    }

    function syncInputs(){
      if (!refs.zoom) return;
      refs.zoom.value = state.zoom;
      refs.rotation.value = state.rotation;
      refs.stretchX.value = state.stretchX;
      refs.stretchY.value = state.stretchY;
      refs.perspective.value = state.perspective;
      refs.rotateX.value = state.rotateX;
      refs.rotateY.value = state.rotateY;
    }

    function updateTransform(){
      if (!refs.image) return;
      const scaleX = clamp(state.zoom * state.stretchX, ZOOM_MIN * STRETCH_MIN, ZOOM_MAX * STRETCH_MAX);
      const scaleY = clamp(state.zoom * state.stretchY, ZOOM_MIN * STRETCH_MIN, ZOOM_MAX * STRETCH_MAX);
      const transforms = [
        `perspective(${clamp(state.perspective, PERSPECTIVE_MIN, PERSPECTIVE_MAX)}px)`,
        `rotateX(${clamp(state.rotateX, -ROTATE_3D_LIMIT, ROTATE_3D_LIMIT)}deg)`,
        `rotateY(${clamp(state.rotateY, -ROTATE_3D_LIMIT, ROTATE_3D_LIMIT)}deg)`,
        `translate(${state.panX}px, ${state.panY}px)`,
        `rotate(${clamp(state.rotation, -ROTATE_LIMIT, ROTATE_LIMIT)}deg)`,
        `scale(${scaleX}, ${scaleY})`
      ];
      refs.image.style.transform = transforms.join(' ');
    }

    function resetTransform(){
      state = cloneDefaultState();
      dragState = null;
      syncInputs();
      updateValueLabels();
      updateTransform();
    }

    function resetAll(){
      if (objectUrl){
        URL.revokeObjectURL(objectUrl);
        objectUrl = null;
      }
      if (refs.file) refs.file.value = '';
      currentFile = null;
      naturalSize = { width: 0, height: 0 };
      setStageHasImage(false);
      if (refs.image){
        refs.image.removeAttribute('src');
        refs.image.style.transform = 'none';
      }
      resetTransform();
      updateMeta();
      clearMessage();
      renderMessage(translate('tools.imageViewer.messages.resetAll', '画像ビューアを初期化しました。'), 'success');
    }

    function handleImageLoad(){
      naturalSize = {
        width: refs.image.naturalWidth || 0,
        height: refs.image.naturalHeight || 0
      };
      setStageHasImage(true);
      updateMeta();
      updateTransform();
      updateValueLabels();
      renderMessage(translate('tools.imageViewer.messages.loadSuccess', '画像を読み込みました。'), 'success');
      addExperience(XP_ON_LOAD, { type: 'load', fileName: currentFile?.name || null });
    }

    function handleImageError(){
      renderMessage(translate('tools.imageViewer.messages.loadError', '画像の読み込みに失敗しました。'), 'error');
      resetAll();
    }

    function loadFile(file){
      if (!file) return;
      if (!file.type || !file.type.startsWith('image/')){
        renderMessage(translate('tools.imageViewer.messages.invalidType', '画像ファイルのみ対応しています。'), 'error');
        return;
      }
      if (objectUrl){
        URL.revokeObjectURL(objectUrl);
        objectUrl = null;
      }
      currentFile = file;
      naturalSize = { width: 0, height: 0 };
      setStageHasImage(false);
      resetTransform();
      updateMeta();
      renderMessage(translate('tools.imageViewer.messages.loading', '画像を読み込み中…'), 'info');
      objectUrl = URL.createObjectURL(file);
      refs.image.src = objectUrl;
    }

    function onPointerDown(event){
      if (!currentFile || !refs.stage || event.button !== 0) return;
      refs.stage.setPointerCapture(event.pointerId);
      dragState = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        lastX: event.clientX,
        lastY: event.clientY,
        originPanX: state.panX,
        originPanY: state.panY,
        totalDistance: 0
      };
      refs.stage.classList.add('dragging');
      event.preventDefault();
    }

    function onPointerMove(event){
      if (!dragState || dragState.pointerId !== event.pointerId) return;
      const dx = event.clientX - dragState.startX;
      const dy = event.clientY - dragState.startY;
      state.panX = dragState.originPanX + dx;
      state.panY = dragState.originPanY + dy;
      const stepDx = event.clientX - dragState.lastX;
      const stepDy = event.clientY - dragState.lastY;
      dragState.totalDistance += Math.hypot(stepDx, stepDy);
      dragState.lastX = event.clientX;
      dragState.lastY = event.clientY;
      updateTransform();
    }

    function finishDrag(event){
      if (!dragState) return;
      if (refs.stage){
        refs.stage.classList.remove('dragging');
        if (dragState.pointerId != null && refs.stage.hasPointerCapture(dragState.pointerId)){
          refs.stage.releasePointerCapture(dragState.pointerId);
        }
      }
      const movedDistance = dragState.totalDistance || 0;
      dragState = null;
      if (movedDistance > 0){
        const xp = movedDistance / 100;
        addExperience(xp, { type: 'pan', distance: movedDistance });
      }
    }

    function onWheel(event){
      if (!currentFile) return;
      event.preventDefault();
      const direction = event.deltaY < 0 ? 1 : -1;
      const factor = direction > 0 ? 1.1 : 0.9;
      state.zoom = clamp(state.zoom * factor, ZOOM_MIN, ZOOM_MAX);
      refs.zoom.value = state.zoom;
      updateTransform();
      updateValueLabels();
    }

    function onDoubleClick(event){
      if (!currentFile) return;
      event.preventDefault();
      resetTransform();
      renderMessage(translate('tools.imageViewer.messages.resetView', 'ビューをリセットしました。'), 'info');
    }

    function onDragOver(event){
      event.preventDefault();
      if (refs.stage) refs.stage.classList.add('drag-over');
    }

    function onDragLeave(event){
      event.preventDefault();
      if (refs.stage) refs.stage.classList.remove('drag-over');
    }

    function onDrop(event){
      event.preventDefault();
      if (refs.stage) refs.stage.classList.remove('drag-over');
      const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
      if (file) loadFile(file);
    }

    function onFileChange(event){
      const file = event.target.files && event.target.files[0];
      loadFile(file);
    }

    function onResetViewClick(){
      resetTransform();
      renderMessage(translate('tools.imageViewer.messages.resetView', 'ビューをリセットしました。'), 'info');
    }

    function onResetAllClick(){
      resetAll();
    }

    function onZoomInput(){
      state.zoom = Number(refs.zoom.value);
      updateTransform();
      updateValueLabels();
    }

    function onRotationInput(){
      state.rotation = Number(refs.rotation.value);
      updateTransform();
      updateValueLabels();
    }

    function onStretchXInput(){
      state.stretchX = Number(refs.stretchX.value);
      updateTransform();
      updateValueLabels();
    }

    function onStretchYInput(){
      state.stretchY = Number(refs.stretchY.value);
      updateTransform();
      updateValueLabels();
    }

    function onPerspectiveInput(){
      state.perspective = Number(refs.perspective.value);
      updateTransform();
      updateValueLabels();
    }

    function onRotateXInput(){
      state.rotateX = Number(refs.rotateX.value);
      updateTransform();
      updateValueLabels();
    }

    function onRotateYInput(){
      state.rotateY = Number(refs.rotateY.value);
      updateTransform();
      updateValueLabels();
    }

    function onPointerLeave(event){
      if (dragState && dragState.pointerId === event.pointerId) {
        finishDrag(event);
      }
    }

    function attachEvents(){
      refs.image.addEventListener('load', handleImageLoad);
      refs.image.addEventListener('error', handleImageError);
      refs.file.addEventListener('change', onFileChange);
      refs.resetView.addEventListener('click', onResetViewClick);
      refs.resetAll.addEventListener('click', onResetAllClick);
      refs.zoom.addEventListener('input', onZoomInput);
      refs.rotation.addEventListener('input', onRotationInput);
      refs.stretchX.addEventListener('input', onStretchXInput);
      refs.stretchY.addEventListener('input', onStretchYInput);
      refs.perspective.addEventListener('input', onPerspectiveInput);
      refs.rotateX.addEventListener('input', onRotateXInput);
      refs.rotateY.addEventListener('input', onRotateYInput);
      refs.stage.addEventListener('pointerdown', onPointerDown);
      refs.stage.addEventListener('pointermove', onPointerMove);
      refs.stage.addEventListener('pointerup', finishDrag);
      refs.stage.addEventListener('pointercancel', finishDrag);
      refs.stage.addEventListener('pointerleave', onPointerLeave);
      refs.stage.addEventListener('wheel', onWheel, { passive: false });
      refs.stage.addEventListener('dblclick', onDoubleClick);
      refs.stage.addEventListener('dragover', onDragOver);
      refs.stage.addEventListener('dragleave', onDragLeave);
      refs.stage.addEventListener('drop', onDrop);
    }

    function detachEvents(){
      refs.image.removeEventListener('load', handleImageLoad);
      refs.image.removeEventListener('error', handleImageError);
      refs.file.removeEventListener('change', onFileChange);
      refs.resetView.removeEventListener('click', onResetViewClick);
      refs.resetAll.removeEventListener('click', onResetAllClick);
      refs.zoom.removeEventListener('input', onZoomInput);
      refs.rotation.removeEventListener('input', onRotationInput);
      refs.stretchX.removeEventListener('input', onStretchXInput);
      refs.stretchY.removeEventListener('input', onStretchYInput);
      refs.perspective.removeEventListener('input', onPerspectiveInput);
      refs.rotateX.removeEventListener('input', onRotateXInput);
      refs.rotateY.removeEventListener('input', onRotateYInput);
      refs.stage.removeEventListener('pointerdown', onPointerDown);
      refs.stage.removeEventListener('pointermove', onPointerMove);
      refs.stage.removeEventListener('pointerup', finishDrag);
      refs.stage.removeEventListener('pointercancel', finishDrag);
      refs.stage.removeEventListener('pointerleave', onPointerLeave);
      refs.stage.removeEventListener('wheel', onWheel);
      refs.stage.removeEventListener('dblclick', onDoubleClick);
      refs.stage.removeEventListener('dragover', onDragOver);
      refs.stage.removeEventListener('dragleave', onDragLeave);
      refs.stage.removeEventListener('drop', onDrop);
    }

    function destroy(){
      detachEvents();
      if (dragState) {
        finishDrag({ pointerId: dragState.pointerId });
      }
      if (refs.file) refs.file.value = '';
      if (objectUrl){
        URL.revokeObjectURL(objectUrl);
        objectUrl = null;
      }
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }

    attachEvents();
    updateExpLabel();
    updateValueLabels();
    updateMeta();
    clearMessage();

    return {
      start(){},
      stop(){},
      destroy
    };
  }

  window.registerMiniGame({
    id: 'image_viewer_mod',
    name: '画像ビューアMOD',
    nameKey: 'selection.miniexp.games.image_viewer_mod.name',
    description: '画像を読み込み、操作してEXPを獲得',
    descriptionKey: 'selection.miniexp.games.image_viewer_mod.description',
    categoryIds: ['utility'],
    create
  });
})();

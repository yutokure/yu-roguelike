(function (global) {
    'use strict';

    const i18n = global.I18n || null;

    const TOOL_ID = 'image-viewer';
    const STYLE_ID = 'tool-image-viewer-styles';
    const ZOOM_MIN = 0.1;
    const ZOOM_MAX = 8;
    const STRETCH_MIN = 0.2;
    const STRETCH_MAX = 4;
    const PERSPECTIVE_MIN = 200;
    const PERSPECTIVE_MAX = 2000;
    const DEFAULT_PERSPECTIVE = 800;
    const ROTATE_LIMIT = 180;
    const ROTATE_3D_LIMIT = 75;

    const DATE_TIME_FORMAT_OPTIONS = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };

    const MESSAGE_DESCRIPTORS = Object.freeze({
        loadSuccess: {
            key: 'tools.imageViewer.messages.loadSuccess',
            fallback: 'Image loaded.'
        },
        loadError: {
            key: 'tools.imageViewer.messages.loadError',
            fallback: 'Failed to load the image.'
        },
        invalidType: {
            key: 'tools.imageViewer.messages.invalidType',
            fallback: 'Only image files are supported.'
        },
        loading: {
            key: 'tools.imageViewer.messages.loading',
            fallback: 'Loading image…'
        },
        resetView: {
            key: 'tools.imageViewer.messages.resetView',
            fallback: 'View settings reset.'
        },
        resetAll: {
            key: 'tools.imageViewer.messages.resetAll',
            fallback: 'Image Viewer has been reset.'
        },
        missingElements: {
            key: 'tools.imageViewer.errors.missingElements',
            fallback: '[ImageViewer] Required elements not found.'
        }
    });

    const defaultState = () => ({
        zoom: 1,
        rotation: 0,
        stretchX: 1,
        stretchY: 1,
        panX: 0,
        panY: 0,
        rotateX: 0,
        rotateY: 0,
        perspective: DEFAULT_PERSPECTIVE
    });

    let state = defaultState();
    let refs = null;
    let dragging = null;
    let currentFile = null;
    let objectUrl = null;
    let naturalSize = { width: 0, height: 0 };
    let pendingSerializedState = null;
    let pendingTransform = null;
    let localeUnsubscribe = null;
    let lastMessageDescriptor = null;

    function translate(key, params, fallback) {
        if (key && i18n && typeof i18n.t === 'function') {
            const value = i18n.t(key, params);
            if (value !== undefined && value !== null && value !== key) {
                return value;
            }
        }
        if (typeof fallback === 'function') {
            try {
                return fallback(params || {});
            } catch (error) {
                // fall back below
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

    function formatMetaDate(timestamp) {
        if (!Number.isFinite(timestamp)) return '-';
        const date = new Date(timestamp);
        if (Number.isNaN(date.getTime())) return '-';
        if (i18n && typeof i18n.formatDate === 'function') {
            const formatted = i18n.formatDate(date, DATE_TIME_FORMAT_OPTIONS);
            if (formatted) return formatted;
        }
        const locale = (i18n && typeof i18n.getLocale === 'function' && i18n.getLocale()) || 'ja-JP';
        try {
            return new Intl.DateTimeFormat(locale, DATE_TIME_FORMAT_OPTIONS).format(date);
        } catch (error) {
            return new Intl.DateTimeFormat('ja-JP', DATE_TIME_FORMAT_OPTIONS).format(date);
        }
    }

    function ensureStylesInjected() {
        if (document.getElementById(STYLE_ID)) {
            return;
        }

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `#tool-image-viewer .image-viewer-body {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
}

#tool-image-viewer .image-viewer-stage-wrapper {
    flex: 1 1 360px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

#tool-image-viewer .image-viewer-stage {
    position: relative;
    border: 1px solid rgba(102,126,234,0.35);
    border-radius: 12px;
    background: rgba(238,242,255,0.85);
    min-height: 340px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    cursor: grab;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

#tool-image-viewer .image-viewer-stage:focus-visible {
    outline: 3px solid rgba(102,126,234,0.6);
    outline-offset: 2px;
}

#tool-image-viewer .image-viewer-stage.dragging {
    cursor: grabbing;
    border-color: rgba(102,126,234,0.65);
    box-shadow: inset 0 0 0 2px rgba(102,126,234,0.15);
}

#tool-image-viewer .image-viewer-stage.drag-over {
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(96,165,250,0.35);
}

#tool-image-viewer .image-viewer-stage img {
    max-width: none;
    max-height: none;
    transform-origin: center center;
    user-select: none;
    pointer-events: none;
    display: none;
}

#tool-image-viewer .image-viewer-stage.has-image img {
    display: block;
}

#tool-image-viewer .image-viewer-placeholder {
    position: absolute;
    inset: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: #64748b;
    font-size: 14px;
    line-height: 1.5;
    pointer-events: none;
    transition: opacity 0.2s ease;
}

#tool-image-viewer .image-viewer-stage.has-image .image-viewer-placeholder {
    opacity: 0;
}

#tool-image-viewer .image-viewer-stage-hint {
    margin: 0;
    font-size: 12px;
    color: #475569;
}

#tool-image-viewer .image-viewer-message {
    min-height: 1em;
    font-size: 12px;
    color: #475569;
}

#tool-image-viewer .image-viewer-message.error {
    color: #b91c1c;
}

#tool-image-viewer .image-viewer-message.success {
    color: #166534;
}

#tool-image-viewer .image-viewer-controls {
    flex: 1 1 280px;
    display: flex;
    flex-direction: column;
    gap: 14px;
}

#tool-image-viewer .image-viewer-upload {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

#tool-image-viewer .image-viewer-file-label {
    appearance: none;
    border: 2px dashed rgba(102,126,234,0.5);
    border-radius: 12px;
    padding: 16px;
    background: rgba(238,242,255,0.6);
    text-align: center;
    color: #475569;
    font-size: 14px;
    line-height: 1.6;
    cursor: pointer;
    transition: border-color 0.15s ease, background 0.15s ease;
}

#tool-image-viewer .image-viewer-file-label strong {
    display: block;
    font-size: 16px;
    color: #1f2937;
}

#tool-image-viewer .image-viewer-file-label span {
    display: block;
    margin-top: 4px;
    font-size: 12px;
    color: #64748b;
}

#tool-image-viewer .image-viewer-file-label:hover {
    border-color: rgba(102,126,234,0.8);
    background: rgba(238,242,255,0.9);
}

#tool-image-viewer .image-viewer-file-label input[type="file"] {
    display: none;
}

#tool-image-viewer .image-viewer-upload-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

#tool-image-viewer .image-viewer-upload-actions button {
    appearance: none;
    border: none;
    border-radius: 8px;
    padding: 8px 12px;
    background: linear-gradient(135deg,#667eea,#764ba2);
    color: #fff;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(102,126,234,0.35);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
}

#tool-image-viewer .image-viewer-upload-actions button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102,126,234,0.45);
}

#tool-image-viewer .image-viewer-control-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

#tool-image-viewer .image-viewer-control-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

#tool-image-viewer .image-viewer-control {
    display: flex;
    align-items: center;
    gap: 8px;
}

#tool-image-viewer .image-viewer-control input[type="range"] {
    flex: 1 1 auto;
}

#tool-image-viewer .image-viewer-value {
    min-width: 52px;
    text-align: right;
    font-variant-numeric: tabular-nums;
    color: #1f2937;
    font-weight: 600;
}

#tool-image-viewer .image-viewer-meta {
    background: #f8f9ff;
    border: 1px solid rgba(102,126,234,0.2);
    border-radius: 12px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

#tool-image-viewer .image-viewer-meta h4 {
    margin: 0;
    font-size: 16px;
    color: #1f2937;
}

#tool-image-viewer .image-viewer-meta-grid {
    margin: 0;
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 6px 12px;
}

#tool-image-viewer .image-viewer-meta-grid dt {
    margin: 0;
    font-size: 13px;
    color: #475569;
}

#tool-image-viewer .image-viewer-meta-grid dd {
    margin: 0;
    font-size: 13px;
    color: #1f2937;
    word-break: break-all;
}

@media (max-width: 980px) {
    #tool-image-viewer .image-viewer-stage-wrapper,
    #tool-image-viewer .image-viewer-controls { flex: 1 1 100%; }
}

@media (max-width: 600px) {
    #tool-image-viewer .image-viewer-stage { min-height: 260px; }
}`;
        document.head.appendChild(style);
    }

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    function formatPercent(value) {
        return `${Math.round(value * 100)}%`;
    }

    function formatDegrees(value) {
        return `${Math.round(value)}°`;
    }

    function formatPerspective(value) {
        return `${Math.round(value)}px`;
    }

    function formatFileSize(bytes) {
        if (!Number.isFinite(bytes) || bytes < 0) return '-';
        if (bytes < 1024) return `${bytes} B`;
        const kb = bytes / 1024;
        if (kb < 1024) return `${kb.toFixed(1)} KB`;
        const mb = kb / 1024;
        if (mb < 1024) return `${mb.toFixed(1)} MB`;
        const gb = mb / 1024;
        return `${gb.toFixed(2)} GB`;
    }

    function renderMessage(text, type = 'info') {
        if (!refs?.message) return;
        refs.message.textContent = text || '';
        refs.message.classList.remove('error', 'success');
        if (type === 'error') refs.message.classList.add('error');
        if (type === 'success') refs.message.classList.add('success');
    }

    function clearMessage() {
        lastMessageDescriptor = null;
        renderMessage('');
    }

    function setMessage(descriptor, type = 'info', params) {
        if (!descriptor) {
            clearMessage();
            return;
        }
        const text = translate(descriptor.key, params, descriptor.fallback);
        lastMessageDescriptor = { key: descriptor.key || null, params: params || null, fallback: descriptor.fallback, type };
        renderMessage(text, type);
    }

    function reapplyLastMessage() {
        if (!lastMessageDescriptor) return;
        const { key, params, fallback, type } = lastMessageDescriptor;
        const text = translate(key, params, fallback);
        renderMessage(text, type || 'info');
    }

    function setStageHasImage(hasImage) {
        if (!refs?.stage) return;
        const active = !!hasImage;
        refs.stage.classList.toggle('has-image', active);
        if (refs.placeholder) {
            refs.placeholder.hidden = active;
            refs.placeholder.setAttribute('aria-hidden', active ? 'true' : 'false');
        }
    }

    function readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error || new Error('failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    function dataUrlToFile(dataUrl, name, typeHint) {
        if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
            throw new Error('invalid data URL');
        }
        const parts = dataUrl.split(',');
        if (parts.length < 2) throw new Error('invalid data URL');
        const header = parts[0];
        const base64 = parts[1];
        const mimeMatch = header.match(/^data:(.*?)(;base64)?$/i);
        const mimeType = typeHint || (mimeMatch ? mimeMatch[1] : 'application/octet-stream');
        const binary = atob(base64);
        const len = binary.length;
        const buffer = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            buffer[i] = binary.charCodeAt(i);
        }
        return new File([buffer], name || 'image', { type: mimeType });
    }

    function applyPendingTransform() {
        if (!pendingTransform) return;
        state = { ...defaultState(), ...pendingTransform };
        pendingTransform = null;
        syncInputsFromState();
    }

    function syncInputsFromState() {
        if (!refs) return;
        refs.zoom.value = state.zoom;
        refs.rotation.value = state.rotation;
        refs.stretchX.value = state.stretchX;
        refs.stretchY.value = state.stretchY;
        refs.perspective.value = state.perspective;
        refs.rotateX.value = state.rotateX;
        refs.rotateY.value = state.rotateY;
    }

    function updateValueLabels() {
        if (!refs) return;
        refs.zoomValue.textContent = formatPercent(state.zoom);
        refs.rotationValue.textContent = formatDegrees(state.rotation);
        refs.stretchXValue.textContent = formatPercent(state.stretchX);
        refs.stretchYValue.textContent = formatPercent(state.stretchY);
        refs.perspectiveValue.textContent = formatPerspective(state.perspective);
        refs.rotateXValue.textContent = formatDegrees(state.rotateX);
        refs.rotateYValue.textContent = formatDegrees(state.rotateY);
    }

    function updateTransform() {
        if (!refs?.image) return;
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

    function updateMeta() {
        if (!refs) return;
        if (!currentFile) {
            refs.metaName.textContent = '-';
            refs.metaType.textContent = '-';
            refs.metaSize.textContent = '-';
            refs.metaDimensions.textContent = '-';
            refs.metaModified.textContent = '-';
            return;
        }
        refs.metaName.textContent = currentFile.name || translate('tools.imageViewer.meta.nameFallback', null, '(Untitled)');
        refs.metaType.textContent = currentFile.type || translate('tools.imageViewer.meta.typeFallback', null, 'Unknown');
        refs.metaSize.textContent = formatFileSize(currentFile.size);
        refs.metaDimensions.textContent = (naturalSize.width && naturalSize.height)
            ? translate(
                'tools.imageViewer.meta.dimensionsValue',
                { width: naturalSize.width, height: naturalSize.height },
                ({ width, height }) => `${width} × ${height} px`
            )
            : '-';
        if (typeof currentFile.lastModified === 'number') {
            refs.metaModified.textContent = formatMetaDate(currentFile.lastModified);
        } else {
            refs.metaModified.textContent = '-';
        }
    }

    function resetTransformState() {
        state = defaultState();
        endPointerDrag();
        syncInputsFromState();
        updateValueLabels();
        updateTransform();
    }

    function resetAllState() {
        if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
            objectUrl = null;
        }
        if (refs?.file) refs.file.value = '';
        currentFile = null;
        naturalSize = { width: 0, height: 0 };
        setStageHasImage(false);
        pendingTransform = null;
        if (refs?.image) {
            refs.image.removeAttribute('src');
            refs.image.style.transform = 'none';
        }
        resetTransformState();
        updateMeta();
    }

    function handleImageLoad() {
        naturalSize = {
            width: refs.image.naturalWidth || 0,
            height: refs.image.naturalHeight || 0
        };
        setStageHasImage(true);
        updateMeta();
        applyPendingTransform();
        updateTransform();
        updateValueLabels();
        setMessage(MESSAGE_DESCRIPTORS.loadSuccess, 'success');
    }

    function handleImageError() {
        setMessage(MESSAGE_DESCRIPTORS.loadError, 'error');
        resetAllState();
    }

    function loadFile(file) {
        if (!file) return;
        if (!file.type || !file.type.startsWith('image/')) {
            setMessage(MESSAGE_DESCRIPTORS.invalidType, 'error');
            return;
        }
        if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
            objectUrl = null;
        }
        currentFile = file;
        naturalSize = { width: 0, height: 0 };
        setStageHasImage(false);
        resetTransformState();
        updateMeta();
        setMessage(MESSAGE_DESCRIPTORS.loading, 'info');
        objectUrl = URL.createObjectURL(file);
        refs.image.src = objectUrl;
    }

    function onPointerDown(ev) {
        if (!refs?.stage || !currentFile) return;
        if (ev.button !== 0) return;
        refs.stage.setPointerCapture(ev.pointerId);
        dragging = {
            id: ev.pointerId,
            startX: ev.clientX,
            startY: ev.clientY,
            panX: state.panX,
            panY: state.panY
        };
        refs.stage.classList.add('dragging');
        ev.preventDefault();
    }

    function onPointerMove(ev) {
        if (!dragging || dragging.id !== ev.pointerId) return;
        const dx = ev.clientX - dragging.startX;
        const dy = ev.clientY - dragging.startY;
        state.panX = dragging.panX + dx;
        state.panY = dragging.panY + dy;
        updateTransform();
    }

    function endPointerDrag(ev) {
        if (!dragging) return;
        const pointerId = ev?.pointerId ?? dragging.id ?? null;
        if (refs?.stage) {
            refs.stage.classList.remove('dragging');
            if (pointerId != null && refs.stage.hasPointerCapture(pointerId)) {
                refs.stage.releasePointerCapture(pointerId);
            }
        }
        dragging = null;
    }

    function onWheel(ev) {
        if (!currentFile) return;
        ev.preventDefault();
        const direction = ev.deltaY < 0 ? 1 : -1;
        const factor = direction > 0 ? 1.1 : 0.9;
        const nextZoom = clamp(state.zoom * factor, ZOOM_MIN, ZOOM_MAX);
        state.zoom = nextZoom;
        refs.zoom.value = state.zoom;
        updateTransform();
        updateValueLabels();
    }

    function onDoubleClick(ev) {
        if (!currentFile) return;
        ev.preventDefault();
        resetTransformState();
        setMessage(MESSAGE_DESCRIPTORS.resetView, 'info');
    }

    function onDragOver(ev) {
        ev.preventDefault();
        if (!refs?.stage) return;
        refs.stage.classList.add('drag-over');
    }

    function onDragLeave(ev) {
        ev.preventDefault();
        if (!refs?.stage) return;
        refs.stage.classList.remove('drag-over');
    }

    function onDrop(ev) {
        ev.preventDefault();
        if (!refs?.stage) return;
        refs.stage.classList.remove('drag-over');
        const file = ev.dataTransfer?.files?.[0] || null;
        if (file) loadFile(file);
    }

    function getSerializedState() {
        const base = {
            transform: { ...state },
            fileName: currentFile?.name || null,
            fileType: currentFile?.type || null,
            naturalSize: { ...naturalSize }
        };
        if (!currentFile) {
            return Promise.resolve(base);
        }
        return readFileAsDataURL(currentFile)
            .then(dataUrl => ({ ...base, fileDataUrl: dataUrl }))
            .catch(() => ({ ...base, fileDataUrl: null }));
    }

    function applyImageViewerState(payload) {
        pendingSerializedState = null;
        pendingTransform = payload.transform ? { ...payload.transform } : null;
        naturalSize = payload.naturalSize || { width: 0, height: 0 };
        if (!payload.fileDataUrl) {
            resetAllState();
            state = { ...defaultState(), ...(payload.transform || {}) };
            syncInputsFromState();
            updateTransform();
            updateValueLabels();
            if (!payload.transform) clearMessage();
            return Promise.resolve(true);
        }
        try {
            const file = dataUrlToFile(payload.fileDataUrl, payload.fileName, payload.fileType);
            return new Promise((resolve) => {
                const handleSuccess = () => resolve(true);
                const handleFail = () => resolve(false);
                refs.image.addEventListener('load', handleSuccess, { once: true });
                refs.image.addEventListener('error', handleFail, { once: true });
                loadFile(file);
            }).catch(() => false);
        } catch (err) {
            console.warn('[ImageViewer] Failed to decode snapshot image:', err);
            resetAllState();
            state = { ...defaultState(), ...(payload.transform || {}) };
            syncInputsFromState();
            updateTransform();
            updateValueLabels();
            return Promise.resolve(false);
        }
    }

    function applySerializedState(snapshot) {
        if (!snapshot || typeof snapshot !== 'object') {
            pendingSerializedState = null;
            resetAllState();
            return Promise.resolve(false);
        }
        const transform = snapshot.transform && typeof snapshot.transform === 'object'
            ? { ...defaultState(), ...snapshot.transform }
            : defaultState();
        const payload = {
            transform,
            fileDataUrl: typeof snapshot.fileDataUrl === 'string' ? snapshot.fileDataUrl : null,
            fileName: typeof snapshot.fileName === 'string' ? snapshot.fileName : 'image',
            fileType: typeof snapshot.fileType === 'string' ? snapshot.fileType : '',
            naturalSize: snapshot.naturalSize && typeof snapshot.naturalSize === 'object'
                ? {
                    width: Number(snapshot.naturalSize.width) || 0,
                    height: Number(snapshot.naturalSize.height) || 0
                }
                : { width: 0, height: 0 }
        };
        if (!refs?.panel) {
            pendingSerializedState = payload;
            return Promise.resolve(true);
        }
        return applyImageViewerState(payload);
    }

    function bindControlEvents() {
        if (!refs) return;
        refs.file.addEventListener('change', (ev) => {
            const file = ev.target.files?.[0] || null;
            if (file) {
                loadFile(file);
            }
        });

        refs.resetView.addEventListener('click', () => {
            if (!refs.image?.src) {
                resetTransformState();
                clearMessage();
                return;
            }
            resetTransformState();
            setMessage(MESSAGE_DESCRIPTORS.resetView, 'info');
        });

        refs.resetAll.addEventListener('click', () => {
            resetAllState();
            setMessage(MESSAGE_DESCRIPTORS.resetAll, 'info');
        });

        refs.zoom.addEventListener('input', () => {
            state.zoom = clamp(parseFloat(refs.zoom.value) || 1, ZOOM_MIN, ZOOM_MAX);
            updateTransform();
            updateValueLabels();
        });

        refs.rotation.addEventListener('input', () => {
            state.rotation = clamp(parseFloat(refs.rotation.value) || 0, -ROTATE_LIMIT, ROTATE_LIMIT);
            updateTransform();
            updateValueLabels();
        });

        refs.stretchX.addEventListener('input', () => {
            state.stretchX = clamp(parseFloat(refs.stretchX.value) || 1, STRETCH_MIN, STRETCH_MAX);
            updateTransform();
            updateValueLabels();
        });

        refs.stretchY.addEventListener('input', () => {
            state.stretchY = clamp(parseFloat(refs.stretchY.value) || 1, STRETCH_MIN, STRETCH_MAX);
            updateTransform();
            updateValueLabels();
        });

        refs.perspective.addEventListener('input', () => {
            state.perspective = clamp(parseFloat(refs.perspective.value) || DEFAULT_PERSPECTIVE, PERSPECTIVE_MIN, PERSPECTIVE_MAX);
            updateTransform();
            updateValueLabels();
        });

        refs.rotateX.addEventListener('input', () => {
            state.rotateX = clamp(parseFloat(refs.rotateX.value) || 0, -ROTATE_3D_LIMIT, ROTATE_3D_LIMIT);
            updateTransform();
            updateValueLabels();
        });

        refs.rotateY.addEventListener('input', () => {
            state.rotateY = clamp(parseFloat(refs.rotateY.value) || 0, -ROTATE_3D_LIMIT, ROTATE_3D_LIMIT);
            updateTransform();
            updateValueLabels();
        });

        refs.stage.addEventListener('pointerdown', onPointerDown);
        refs.stage.addEventListener('pointermove', onPointerMove);
        refs.stage.addEventListener('pointerup', endPointerDrag);
        refs.stage.addEventListener('pointercancel', endPointerDrag);
        refs.stage.addEventListener('pointerleave', endPointerDrag);
        refs.stage.addEventListener('wheel', onWheel, { passive: false });
        refs.stage.addEventListener('dblclick', onDoubleClick);
        refs.stage.addEventListener('dragover', onDragOver);
        refs.stage.addEventListener('dragenter', onDragOver);
        refs.stage.addEventListener('dragleave', onDragLeave);
        refs.stage.addEventListener('drop', onDrop);
    }

    function initImageViewerTool(context) {
        if (!context?.panel || context.panel.__imageViewerInited) return;
        context.panel.__imageViewerInited = true;

        ensureStylesInjected();

        refs = {
            panel: context.panel,
            stage: context.panel.querySelector('#image-viewer-stage'),
            image: context.panel.querySelector('#image-viewer-image'),
            placeholder: context.panel.querySelector('#image-viewer-placeholder'),
            message: context.panel.querySelector('#image-viewer-message'),
            file: context.panel.querySelector('#image-viewer-file'),
            resetView: context.panel.querySelector('#image-viewer-reset-view'),
            resetAll: context.panel.querySelector('#image-viewer-reset-all'),
            zoom: context.panel.querySelector('#image-viewer-zoom'),
            zoomValue: context.panel.querySelector('#image-viewer-zoom-value'),
            rotation: context.panel.querySelector('#image-viewer-rotation'),
            rotationValue: context.panel.querySelector('#image-viewer-rotation-value'),
            stretchX: context.panel.querySelector('#image-viewer-stretch-x'),
            stretchXValue: context.panel.querySelector('#image-viewer-stretch-x-value'),
            stretchY: context.panel.querySelector('#image-viewer-stretch-y'),
            stretchYValue: context.panel.querySelector('#image-viewer-stretch-y-value'),
            perspective: context.panel.querySelector('#image-viewer-perspective'),
            perspectiveValue: context.panel.querySelector('#image-viewer-perspective-value'),
            rotateX: context.panel.querySelector('#image-viewer-rotate-x'),
            rotateXValue: context.panel.querySelector('#image-viewer-rotate-x-value'),
            rotateY: context.panel.querySelector('#image-viewer-rotate-y'),
            rotateYValue: context.panel.querySelector('#image-viewer-rotate-y-value'),
            metaName: context.panel.querySelector('#image-viewer-meta-name'),
            metaType: context.panel.querySelector('#image-viewer-meta-type'),
            metaSize: context.panel.querySelector('#image-viewer-meta-size'),
            metaDimensions: context.panel.querySelector('#image-viewer-meta-dimensions'),
            metaModified: context.panel.querySelector('#image-viewer-meta-modified')
        };

        if (!refs.stage || !refs.image || !refs.file) {
            console.warn(translate(
                MESSAGE_DESCRIPTORS.missingElements.key,
                null,
                MESSAGE_DESCRIPTORS.missingElements.fallback
            ));
            return;
        }

        if (i18n && typeof i18n.applyTranslations === 'function') {
            i18n.applyTranslations(context.panel);
        }

        refs.image.addEventListener('load', handleImageLoad);
        refs.image.addEventListener('error', handleImageError);

        resetAllState();
        bindControlEvents();
        clearMessage();

        if (!localeUnsubscribe && i18n && typeof i18n.onLocaleChanged === 'function') {
            localeUnsubscribe = i18n.onLocaleChanged(() => {
                if (!refs?.panel) return;
                if (typeof i18n.applyTranslations === 'function') {
                    i18n.applyTranslations(refs.panel);
                }
                updateMeta();
                updateValueLabels();
                reapplyLastMessage();
            });
        }

        if (pendingSerializedState) {
            const payload = pendingSerializedState;
            pendingSerializedState = null;
            applyImageViewerState(payload).catch(err => {
                console.warn('[ImageViewer] Failed to apply pending state:', err);
            });
        }
    }

    const api = {
        init: initImageViewerTool,
        getState: () => getSerializedState(),
        setState: (snapshot) => applySerializedState(snapshot)
    };

    global.ImageViewerTool = Object.assign(global.ImageViewerTool || {}, api);
    if (global.ToolsTab?.registerTool) {
        global.ToolsTab.registerTool(TOOL_ID, (context) => api.init(context));
    }
    if (global.ToolStateRegistry?.register) {
        global.ToolStateRegistry.register('imageViewer', {
            getState: () => getSerializedState(),
            setState: (snapshot) => applySerializedState(snapshot),
            labelKey: 'tools.sidebar.stateManager.toolNames.imageViewer',
            labelFallback: '画像ビューア'
        });
    }
})(window);


(function(){
  const i18n = window?.I18n;

  function translateOrFallback(key, fallback, params){
    const computeFallback = () => {
      if (typeof fallback === 'function') {
        try {
          const result = fallback(params);
          return typeof result === 'string' ? result : (result ?? '');
        } catch (error) {
          console.warn('[DiagramMaker:i18n] Failed to evaluate fallback text:', error);
          return '';
        }
      }
      return fallback ?? '';
    };
    if (!key || !i18n || typeof i18n.t !== 'function') return computeFallback();
    try {
      const translated = i18n.t(key, params);
      if (typeof translated === 'string' && translated !== key) return translated;
    } catch (error) {
      console.warn('[DiagramMaker:i18n] Failed to translate key:', key, error);
    }
    return computeFallback();
  }

  const TEXT = {
    'errors.containerMissing': { key: 'games.diagramMaker.errors.containerMissing', fallback: () => 'MiniExp Diagram Maker requires a container' },
    'defaults.fileName': { key: 'games.diagramMaker.defaults.fileName', fallback: () => '未保存の図.drawio' },
    'defaults.layerName': { key: 'games.diagramMaker.defaults.layerName', fallback: ({ index } = {}) => `レイヤー ${index ?? 1}` },
    'defaults.pageName': { key: 'games.diagramMaker.defaults.pageName', fallback: ({ index } = {}) => `ページ ${index ?? 1}` },
    'errors.pngSignature': { key: 'games.diagramMaker.errors.pngSignature', fallback: () => 'PNG署名を認識できませんでした' },
    'errors.pngDataMissing': { key: 'games.diagramMaker.errors.pngDataMissing', fallback: () => 'PNG内にdraw.ioデータが見つかりませんでした' },
    'errors.inflateUnsupported': { key: 'games.diagramMaker.errors.inflateUnsupported', fallback: () => '圧縮データの展開に対応していない環境です' },
    'errors.parseXml': { key: 'games.diagramMaker.errors.parseXml', fallback: () => 'XMLを解析できませんでした' },
    'errors.diagramMissing': { key: 'games.diagramMaker.errors.diagramMissing', fallback: () => 'diagram 要素が見つかりません' },
    'errors.mxGraphMissing': { key: 'games.diagramMaker.errors.mxGraphMissing', fallback: () => 'mxGraphModel が見つかりません' },
    'errors.diagramDecodeFailed': { key: 'games.diagramMaker.errors.diagramDecodeFailed', fallback: () => 'diagram データを展開できませんでした' },
    'errors.mxGraphRootMissing': { key: 'games.diagramMaker.errors.mxGraphRootMissing', fallback: () => 'mxGraphModel root が見つかりません' },
    'tools.select': { key: 'games.diagramMaker.tools.select', fallback: () => '選択' },
    'tools.rectangle': { key: 'games.diagramMaker.tools.rectangle', fallback: () => '四角' },
    'tools.ellipse': { key: 'games.diagramMaker.tools.ellipse', fallback: () => '楕円' },
    'tools.text': { key: 'games.diagramMaker.tools.text', fallback: () => 'テキスト' },
    'tools.connector': { key: 'games.diagramMaker.tools.connector', fallback: () => 'コネクタ' },
    'tools.delete': { key: 'games.diagramMaker.tools.delete', fallback: () => '削除' },
    'defaults.textPlaceholder': { key: 'games.diagramMaker.defaults.textPlaceholder', fallback: () => 'テキスト' },
    'defaults.nodePlaceholder': { key: 'games.diagramMaker.defaults.nodePlaceholder', fallback: () => '新しいノード' },
    'actions.new': { key: 'games.diagramMaker.actions.new', fallback: () => '新規' },
    'actions.open': { key: 'games.diagramMaker.actions.open', fallback: () => '開く' },
    'actions.save': { key: 'games.diagramMaker.actions.save', fallback: () => '保存' },
    'actions.export': { key: 'games.diagramMaker.actions.export', fallback: () => '書き出し' },
    'actions.exportFormat': { key: 'games.diagramMaker.actions.exportFormat', fallback: ({ formatLabel } = {}) => `${formatLabel ?? ''} で書き出し` },
    'sections.properties': { key: 'games.diagramMaker.sections.properties', fallback: () => 'プロパティ' },
    'fields.x': { key: 'games.diagramMaker.fields.x', fallback: () => 'X' },
    'fields.y': { key: 'games.diagramMaker.fields.y', fallback: () => 'Y' },
    'fields.width': { key: 'games.diagramMaker.fields.width', fallback: () => '幅' },
    'fields.height': { key: 'games.diagramMaker.fields.height', fallback: () => '高さ' },
    'fields.fill': { key: 'games.diagramMaker.fields.fill', fallback: () => '塗り' },
    'fields.stroke': { key: 'games.diagramMaker.fields.stroke', fallback: () => '線' },
    'fields.strokeWidth': { key: 'games.diagramMaker.fields.strokeWidth', fallback: () => '線幅' },
    'fields.textColor': { key: 'games.diagramMaker.fields.textColor', fallback: () => '文字色' },
    'fields.fontSize': { key: 'games.diagramMaker.fields.fontSize', fallback: () => '文字サイズ' },
    'fields.text': { key: 'games.diagramMaker.fields.text', fallback: () => 'テキスト' },
    'toggles.grid': { key: 'games.diagramMaker.toggles.grid', fallback: () => 'グリッド' },
    'toggles.snap': { key: 'games.diagramMaker.toggles.snap', fallback: () => 'スナップ' },
    'labels.exp': { key: 'games.diagramMaker.labels.exp', fallback: ({ value } = {}) => `EXP: ${value ?? 0}` },
    'actions.undo': { key: 'games.diagramMaker.actions.undo', fallback: () => 'Undo' },
    'actions.redo': { key: 'games.diagramMaker.actions.redo', fallback: () => 'Redo' },
    'confirm.newDocument': { key: 'games.diagramMaker.confirm.newDocument', fallback: () => '保存されていない変更があります。新規作成しますか？' },
    'errors.loadFailed': { key: 'games.diagramMaker.errors.loadFailed', fallback: ({ error } = {}) => `読み込みに失敗しました: ${error ?? ''}` },
    'errors.saveFailed': { key: 'games.diagramMaker.errors.saveFailed', fallback: ({ error } = {}) => `保存に失敗しました: ${error ?? ''}` },
    'errors.exportFailed': { key: 'games.diagramMaker.errors.exportFailed', fallback: ({ error } = {}) => `書き出しに失敗しました: ${error ?? ''}` }
  };

  function localizeText(id, params){
    const entry = TEXT[id];
    if (!entry) return '';
    return translateOrFallback(entry.key, entry.fallback, params);
  }

  function getDefaultFileName(){
    return localizeText('defaults.fileName');
  }

  function getDefaultLayerName(index = 1){
    return localizeText('defaults.layerName', { index });
  }

  function getDefaultPageName(index = 1){
    return localizeText('defaults.pageName', { index });
  }

  function formatErrorMessage(error){
    if (error == null) return '';
    if (typeof error === 'string') return error;
    if (typeof error?.message === 'string') return error.message;
    try {
      return String(error);
    } catch {
      return '';
    }
  }

  const STORAGE_KEY = 'mini_diagram_maker_state_v1';
  const AUTOSAVE_KEY = 'mini_diagram_maker_autosaves_v1';
  const AUTOSAVE_LIMIT = 5;
  const HISTORY_LIMIT = 100;
  const XP_VALUES = {
    open: 5,
    shapeEdit: 2,
    connectorEdit: 2,
    import: 8,
    saveXml: 10,
    exportImage: 6
  };
  const ACTION_COOLDOWN_MS = 5000;
  const AUTOSAVE_INTERVAL_MS = 60000;
  const GRID_SIZE = 10;
  const SVG_WIDTH = 1200;
  const SVG_HEIGHT = 720;
  const MAX_ZOOM = 200;
  const MIN_ZOOM = 25;

  const TOOL_DEFS = [
    { id: 'select', labelId: 'tools.select', icon: '🖱️' },
    { id: 'rectangle', labelId: 'tools.rectangle', icon: '▭' },
    { id: 'ellipse', labelId: 'tools.ellipse', icon: '◯' },
    { id: 'text', labelId: 'tools.text', icon: '🅣' },
    { id: 'connector', labelId: 'tools.connector', icon: '⇄' },
    { id: 'delete', labelId: 'tools.delete', icon: '🗑️' }
  ];

  const DEFAULT_STYLE = {
    fill: '#f1f5f9',
    stroke: '#0f172a',
    strokeWidth: 2,
    textColor: '#0f172a',
    fontSize: 16,
    fontFamily: '"Segoe UI", "Yu Gothic", sans-serif'
  };

  const BASE_STROKE_COLOR = DEFAULT_STYLE.stroke;
  const BASE_TEXT_COLOR = DEFAULT_STYLE.textColor;

  const pointerCaptureOptions = { passive: false };

  const COLOR_THEMES = {
    light: {
      overlay: 'linear-gradient(135deg, rgba(148,163,184,0.12), rgba(15,23,42,0.4))',
      shellBg: '#f8fafc',
      shellBorder: '1px solid rgba(148,163,184,0.35)',
      titleBg: '#ffffff',
      titleBorder: '1px solid rgba(148,163,184,0.25)',
      primaryText: '#0f172a',
      secondaryText: '#475569',
      actionButtonBg: '#e2e8f0',
      actionButtonBorder: '1px solid rgba(148,163,184,0.4)',
      actionButtonText: '#0f172a',
      panelBg: '#f1f5f9',
      panelDivider: '1px solid rgba(148,163,184,0.25)',
      paletteButtonBg: '#ffffff',
      paletteButtonText: '#0f172a',
      paletteButtonBorder: '1px solid rgba(148,163,184,0.4)',
      paletteButtonActiveBg: '#dbeafe',
      paletteButtonActiveBorder: '1px solid rgba(59,130,246,0.6)',
      paletteButtonActiveText: '#1e3a8a',
      canvasWrapBg: '#e2e8f0',
      canvasBg: '#f8fafc',
      propertiesBg: '#f8fafc',
      footerBg: '#ffffff',
      footerBorder: '1px solid rgba(148,163,184,0.25)',
      inputBg: '#ffffff',
      inputBorder: '1px solid rgba(148,163,184,0.4)',
      inputText: '#0f172a',
      toggleText: '#0f172a',
      exportBg: '#ffffff',
      exportText: '#0f172a',
      exportHoverBg: 'rgba(59,130,246,0.12)',
      xpText: '#0f172a'
    },
    dark: {
      overlay: 'radial-gradient(circle at top, rgba(30,41,59,0.85), rgba(15,23,42,0.95))',
      shellBg: 'rgba(15,23,42,0.96)',
      shellBorder: '1px solid rgba(148,163,184,0.3)',
      titleBg: 'rgba(15,23,42,0.92)',
      titleBorder: '1px solid rgba(71,85,105,0.7)',
      primaryText: '#e2e8f0',
      secondaryText: '#cbd5f5',
      actionButtonBg: 'rgba(148,163,184,0.18)',
      actionButtonBorder: '1px solid rgba(148,163,184,0.4)',
      actionButtonText: '#f8fafc',
      panelBg: 'rgba(15,23,42,0.82)',
      panelDivider: '1px solid rgba(71,85,105,0.65)',
      paletteButtonBg: 'rgba(30,41,59,0.75)',
      paletteButtonText: '#e2e8f0',
      paletteButtonBorder: '1px solid rgba(100,116,139,0.6)',
      paletteButtonActiveBg: 'rgba(59,130,246,0.38)',
      paletteButtonActiveBorder: '1px solid rgba(96,165,250,0.7)',
      paletteButtonActiveText: '#e0f2fe',
      canvasWrapBg: 'rgba(15,23,42,0.75)',
      canvasBg: '#0f172a',
      propertiesBg: 'rgba(15,23,42,0.82)',
      footerBg: 'rgba(15,23,42,0.92)',
      footerBorder: '1px solid rgba(71,85,105,0.8)',
      inputBg: 'rgba(15,23,42,0.9)',
      inputBorder: '1px solid rgba(100,116,139,0.6)',
      inputText: '#e2e8f0',
      toggleText: '#e2e8f0',
      exportBg: 'rgba(15,23,42,0.96)',
      exportText: '#e2e8f0',
      exportHoverBg: 'rgba(59,130,246,0.32)',
      xpText: '#e2e8f0'
    }
  };

  function detectColorScheme(){
    const doc = document.documentElement;
    const body = document.body;
    const dataTheme = (doc?.dataset?.theme || body?.dataset?.theme || '').toLowerCase();
    if (dataTheme === 'dark') return 'dark';
    if (dataTheme === 'light') return 'light';
    const classList = new Set([
      ...(doc ? Array.from(doc.classList) : []),
      ...(body ? Array.from(body.classList) : [])
    ]);
    for (const cls of classList){
      if (cls && /dark/.test(cls)) return 'dark';
      if (cls && /light/.test(cls)) return 'light';
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  }

  function cloneDiagram(diagram){
    return JSON.parse(JSON.stringify(diagram));
  }

  function createLayer(){
    return { id: 'layer1', name: getDefaultLayerName(1), visible: true, locked: false };
  }

  function createEmptyDiagram(){
    return {
      id: 'diagram-1',
      name: getDefaultPageName(1),
      nodes: [],
      edges: [],
      layers: [createLayer()],
      layerOrder: ['layer1'],
      nextNodeId: 1,
      nextEdgeId: 1
    };
  }

  function loadPersistentState(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      return parsed;
    } catch {
      return null;
    }
  }

  function writePersistentState(state){
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        fileName: state.fileName,
        zoom: state.zoom,
        gridVisible: state.gridVisible,
        snapToGrid: state.snapToGrid,
        diagram: state.diagram
      }));
    } catch {}
  }

  function loadAutosaves(){
    try {
      const raw = localStorage.getItem(AUTOSAVE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function writeAutosaves(list){
    try {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(list.slice(0, AUTOSAVE_LIMIT)));
    } catch {}
  }

  function escapeXml(text){
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function parseStyle(styleText){
    const style = {};
    if (!styleText) return style;
    styleText.split(';').forEach(pair => {
      const [key, value] = pair.split('=');
      if (key && value !== undefined) style[key.trim()] = value.trim();
    });
    return style;
  }

  function buildStyle(styleObj){
    return Object.entries(styleObj)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${k}=${v}`)
      .join(';');
  }

  function findLayer(diagram, id){
    return diagram.layers.find(l => l.id === id) || diagram.layers[0];
  }

  function roundToGrid(value, gridSize){
    return Math.round(value / gridSize) * gridSize;
  }

  function ensureDiagramIds(diagram){
    let maxNode = 0;
    let maxEdge = 0;
    for (const node of diagram.nodes) {
      const num = Number(node.id?.replace(/^n/, ''));
      if (Number.isFinite(num)) maxNode = Math.max(maxNode, num);
    }
    for (const edge of diagram.edges) {
      const num = Number(edge.id?.replace(/^e/, ''));
      if (Number.isFinite(num)) maxEdge = Math.max(maxEdge, num);
    }
    diagram.nextNodeId = Math.max(diagram.nextNodeId || 1, maxNode + 1);
    diagram.nextEdgeId = Math.max(diagram.nextEdgeId || 1, maxEdge + 1);
  }

  async function decodePngXml(arrayBuffer){
    const bytes = new Uint8Array(arrayBuffer);
    const decodedText = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    const markerIndex = decodedText.indexOf('<mxfile');
    if (markerIndex >= 0) {
      return decodedText.slice(markerIndex);
    }
    const signature = [137, 80, 78, 71, 13, 10, 26, 10];
    for (let i = 0; i < signature.length; i++) {
      if (bytes[i] !== signature[i]) throw new Error(localizeText('errors.pngSignature'));
    }
    let offset = 8;
    while (offset + 8 <= bytes.length) {
      const length = (bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3];
      const type = String.fromCharCode(bytes[offset + 4], bytes[offset + 5], bytes[offset + 6], bytes[offset + 7]);
      const dataStart = offset + 8;
      const dataEnd = dataStart + length;
      if (dataEnd > bytes.length) break;
      if (type === 'tEXt' || type === 'zTXt' || type === 'iTXt') {
        const chunk = bytes.slice(dataStart, dataEnd);
        let keyword = '';
        let idx = 0;
        while (idx < chunk.length && chunk[idx] !== 0) {
          keyword += String.fromCharCode(chunk[idx]);
          idx++;
        }
        if (idx >= chunk.length) {
          offset = dataEnd + 4;
          continue;
        }
        idx++;
        if (type === 'tEXt') {
          const text = new TextDecoder().decode(chunk.slice(idx));
          if (text.includes('<mxfile')) return text.slice(text.indexOf('<mxfile'));
        } else if (type === 'zTXt') {
          const compression = chunk[idx++];
          if (compression !== 0) {
            offset = dataEnd + 4;
            continue;
          }
          const xml = await inflateBytes(chunk.slice(idx));
          if (xml.includes('<mxfile')) return xml.slice(xml.indexOf('<mxfile'));
        } else if (type === 'iTXt') {
          const compressedFlag = chunk[idx++];
          const compressionMethod = chunk[idx++];
          while (idx < chunk.length && chunk[idx] !== 0) idx++;
          idx++;
          while (idx < chunk.length && chunk[idx] !== 0) idx++;
          idx++;
          const data = chunk.slice(idx);
          if (compressedFlag === 1) {
            if (compressionMethod !== 0) {
              offset = dataEnd + 4;
              continue;
            }
            const xml = await inflateBytes(data);
            if (xml.includes('<mxfile')) return xml.slice(xml.indexOf('<mxfile'));
          } else {
            const text = new TextDecoder().decode(data);
            if (text.includes('<mxfile')) return text.slice(text.indexOf('<mxfile'));
          }
        }
      }
      offset = dataEnd + 4;
    }
    throw new Error(localizeText('errors.pngDataMissing'));
  }

  async function inflateBytes(bytes){
    if (typeof DecompressionStream === 'function') {
      const stream = new DecompressionStream('deflate');
      const writer = stream.writable.getWriter();
      await writer.write(bytes);
      await writer.close();
      const reader = stream.readable.getReader();
      const chunks = [];
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      const total = chunks.reduce((acc, arr) => acc + arr.length, 0);
      const merged = new Uint8Array(total);
      let offset = 0;
      for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }
      return new TextDecoder().decode(merged);
    }
    throw new Error(localizeText('errors.inflateUnsupported'));
  }

  function decodeHtml(text){
    const tmp = document.createElement('textarea');
    tmp.innerHTML = text;
    return tmp.value;
  }

  function normalizeCellId(id){
    if (!id) return id;
    if (id.startsWith('n') || id.startsWith('e')) return id;
    return `n${id}`;
  }

  function mxToDiagram(xmlString){
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'text/xml');
    if (doc.querySelector('parsererror')) {
      throw new Error(localizeText('errors.parseXml'));
    }
    const diagramEl = doc.querySelector('diagram');
    if (!diagramEl) throw new Error(localizeText('errors.diagramMissing'));
    let modelEl = diagramEl.querySelector('mxGraphModel');
    if (!modelEl) {
      const text = diagramEl.textContent || '';
      if (!text.trim()) throw new Error(localizeText('errors.mxGraphMissing'));
      const decoded = decodeURIComponent(escape(atob(text)));
      const innerDoc = parser.parseFromString(decoded, 'text/xml');
      if (innerDoc.querySelector('parsererror')) {
        throw new Error(localizeText('errors.diagramDecodeFailed'));
      }
      modelEl = innerDoc.querySelector('mxGraphModel');
      if (!modelEl) throw new Error(localizeText('errors.mxGraphMissing'));
    }
    const rootEl = modelEl.querySelector('root');
    if (!rootEl) throw new Error(localizeText('errors.mxGraphRootMissing'));
    const diagram = createEmptyDiagram();
    diagram.id = diagramEl.getAttribute('id') || diagram.id;
    diagram.name = diagramEl.getAttribute('name') || diagram.name;
    diagram.layers = [];
    diagram.layerOrder = [];
    const cells = Array.from(rootEl.children);
    const nodes = [];
    const edges = [];
    for (const cell of cells) {
      const id = cell.getAttribute('id');
      if (!id || id === '0' || id === '1') continue;
      const vertex = cell.getAttribute('vertex') === '1';
      const edge = cell.getAttribute('edge') === '1';
      if (vertex) {
        const geometry = cell.querySelector('mxGeometry');
        const style = parseStyle(cell.getAttribute('style'));
        const node = {
          id: id.startsWith('n') ? id : `n${id}`,
          type: style.shape === 'ellipse' ? 'ellipse' : style.shape === 'text' ? 'text' : 'rectangle',
          layer: cell.getAttribute('parent') || '1',
          x: Number(geometry?.getAttribute('x')) || 0,
          y: Number(geometry?.getAttribute('y')) || 0,
          width: Number(geometry?.getAttribute('width')) || 120,
          height: Number(geometry?.getAttribute('height')) || 60,
          rotation: Number(style.rotation) || 0,
          text: cell.getAttribute('value') ? decodeHtml(cell.getAttribute('value')) : '',
          fill: style.fillColor || DEFAULT_STYLE.fill,
          stroke: style.strokeColor || DEFAULT_STYLE.stroke,
          strokeWidth: Number(style.strokeWidth) || DEFAULT_STYLE.strokeWidth,
          textColor: style.fontColor || DEFAULT_STYLE.textColor,
          fontSize: Number(style.fontSize) || DEFAULT_STYLE.fontSize,
          fontFamily: style.fontFamily || DEFAULT_STYLE.fontFamily
        };
        nodes.push(node);
      } else if (edge) {
        const style = parseStyle(cell.getAttribute('style'));
        const geometry = cell.querySelector('mxGeometry');
        const points = [];
        if (geometry) {
          geometry.querySelectorAll('mxPoint').forEach(pt => {
            const px = Number(pt.getAttribute('x'));
            const py = Number(pt.getAttribute('y'));
            if (Number.isFinite(px) && Number.isFinite(py)) points.push({ x: px, y: py });
          });
        }
        edges.push({
          id: id.startsWith('e') ? id : `e${id}`,
          layer: cell.getAttribute('parent') || '1',
          source: cell.getAttribute('source') ? normalizeCellId(cell.getAttribute('source')) : null,
          target: cell.getAttribute('target') ? normalizeCellId(cell.getAttribute('target')) : null,
          points,
          stroke: style.strokeColor || DEFAULT_STYLE.stroke,
          strokeWidth: Number(style.strokeWidth) || DEFAULT_STYLE.strokeWidth,
          arrow: style.endArrow || 'block'
        });
      } else {
        const isLayer = !cell.getAttribute('parent') || cell.getAttribute('parent') === '0';
        if (isLayer) {
          const layerId = cell.getAttribute('id');
          const layerName = cell.getAttribute('value') ? decodeHtml(cell.getAttribute('value')) : getDefaultLayerName(diagram.layers.length + 1);
          diagram.layers.push({
            id: layerId,
            name: layerName,
            visible: cell.getAttribute('visible') !== '0',
            locked: cell.getAttribute('locked') === '1'
          });
          diagram.layerOrder.push(layerId);
        }
      }
    }
    if (!diagram.layers.length) {
      diagram.layers = [createLayer()];
      diagram.layerOrder = ['layer1'];
    }
    diagram.nodes = nodes.map(node => ({
      id: node.id,
      type: node.type,
      layer: node.layer === '1' ? diagram.layerOrder[0] : node.layer,
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height,
      rotation: node.rotation,
      text: node.text,
      fill: node.fill,
      stroke: node.stroke,
      strokeWidth: node.strokeWidth,
      textColor: node.textColor,
      fontSize: node.fontSize,
      fontFamily: node.fontFamily
    }));
    diagram.edges = edges.map(edge => ({
      id: edge.id,
      layer: edge.layer === '1' ? diagram.layerOrder[0] : edge.layer,
      source: edge.source,
      target: edge.target,
      points: edge.points,
      stroke: edge.stroke,
      strokeWidth: edge.strokeWidth,
      arrow: edge.arrow || 'block'
    }));
    ensureDiagramIds(diagram);
    return diagram;
  }

  function diagramToMx(diagram){
    const lines = [];
    const iso = new Date().toISOString();
    lines.push('<?xml version="1.0" encoding="UTF-8"?>');
    lines.push('<mxfile host="app.diagrams.net" modified="' + iso + '" agent="MiniExp Diagram Maker" version="21.6.5" type="device">');
    lines.push('  <diagram id="' + escapeXml(diagram.id || 'diagram-1') + '" name="' + escapeXml(diagram.name || getDefaultPageName(1)) + '">');
    lines.push('    <mxGraphModel dx="1024" dy="768" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="850" pageHeight="1100" math="0" shadow="0">');
    lines.push('      <root>');
    lines.push('        <mxCell id="0"/>');
    lines.push('        <mxCell id="1" parent="0"/>');
    const layerIds = new Set();
    diagram.layerOrder.forEach(layerId => {
      const layer = findLayer(diagram, layerId);
      if (!layer) return;
      layerIds.add(layer.id);
      const attrs = [
        'id="' + escapeXml(layer.id) + '"',
        'parent="1"',
        'value="' + escapeXml(layer.name || layer.id) + '"'
      ];
      if (layer.visible === false) attrs.push('visible="0"');
      if (layer.locked) attrs.push('locked="1"');
      lines.push('        <mxCell ' + attrs.join(' ') + '/>');
    });
    for (const node of diagram.nodes) {
      const layerId = layerIds.has(node.layer) ? node.layer : (diagram.layerOrder[0] || '1');
      const style = buildStyle({
        shape: node.type === 'ellipse' ? 'ellipse' : node.type === 'text' ? 'text' : 'rectangle',
        fillColor: node.fill || DEFAULT_STYLE.fill,
        strokeColor: node.stroke || DEFAULT_STYLE.stroke,
        strokeWidth: node.strokeWidth ?? DEFAULT_STYLE.strokeWidth,
        fontColor: node.textColor || DEFAULT_STYLE.textColor,
        fontSize: node.fontSize ?? DEFAULT_STYLE.fontSize,
        fontFamily: node.fontFamily || DEFAULT_STYLE.fontFamily,
        align: 'center',
        verticalAlign: 'middle'
      });
      lines.push('        <mxCell id="' + escapeXml(node.id) + '" value="' + escapeXml(node.text || '') + '" style="' + escapeXml(style) + '" vertex="1" parent="' + escapeXml(layerId) + '">');
      lines.push('          <mxGeometry x="' + Number(node.x || 0) + '" y="' + Number(node.y || 0) + '" width="' + Number(node.width || 120) + '" height="' + Number(node.height || 60) + '" as="geometry"/>');
      lines.push('        </mxCell>');
    }
    for (const edge of diagram.edges) {
      const layerId = layerIds.has(edge.layer) ? edge.layer : (diagram.layerOrder[0] || '1');
      const style = buildStyle({
        edgeStyle: 'elbowEdgeStyle',
        rounded: 0,
        orthogonal: 1,
        endArrow: edge.arrow || 'block',
        strokeColor: edge.stroke || DEFAULT_STYLE.stroke,
        strokeWidth: edge.strokeWidth ?? DEFAULT_STYLE.strokeWidth
      });
      let edgeLine = '        <mxCell id="' + escapeXml(edge.id) + '" style="' + escapeXml(style) + '" edge="1" parent="' + escapeXml(layerId) + '"';
      if (edge.source) edgeLine += ' source="' + escapeXml(edge.source) + '"';
      if (edge.target) edgeLine += ' target="' + escapeXml(edge.target) + '"';
      edgeLine += '>';
      lines.push(edgeLine);
      lines.push('          <mxGeometry relative="1" as="geometry">');
      for (const point of edge.points || []) {
        lines.push('            <mxPoint x="' + Number(point.x) + '" y="' + Number(point.y) + '"/>');
      }
      lines.push('          </mxGeometry>');
      lines.push('        </mxCell>');
    }
    lines.push('      </root>');
    lines.push('    </mxGraphModel>');
    lines.push('  </diagram>');
    lines.push('</mxfile>');
    return lines.join('\n');
  }

  function create(root, awardXp){
    if (!root) throw new Error(localizeText('errors.containerMissing'));

    const persisted = loadPersistentState();
    const state = {
      documentId: crypto.randomUUID ? crypto.randomUUID() : `doc-${Date.now()}`,
      fileName: persisted?.fileName || getDefaultFileName(),
      diagram: persisted?.diagram ? cloneDiagram(persisted.diagram) : createEmptyDiagram(),
      selection: [],
      tool: 'select',
      zoom: persisted?.zoom ?? 100,
      gridVisible: persisted?.gridVisible ?? true,
      snapToGrid: persisted?.snapToGrid ?? true,
      history: [],
      historyIndex: -1,
      xp: 0,
      lastAwards: {},
      autosaves: loadAutosaves(),
      hasUnsavedChanges: false
    };
    ensureDiagramIds(state.diagram);

    const originalRootStyle = {
      padding: root.style.padding || '',
      margin: root.style.margin || '',
      background: root.style.background || '',
      border: root.style.border || '',
      minHeight: root.style.minHeight || '',
      display: root.style.display || '',
      justifyContent: root.style.justifyContent || '',
      alignItems: root.style.alignItems || '',
      width: root.style.width || '',
      maxWidth: root.style.maxWidth || ''
    };

    root.style.padding = '0';
    root.style.margin = '0 auto';
    root.style.background = 'transparent';
    root.style.border = 'none';
    root.style.minHeight = '0';
    root.style.display = 'flex';
    root.style.alignItems = 'stretch';
    root.style.justifyContent = 'center';
    root.style.width = 'min(96vw, 1400px)';
    root.style.maxWidth = '1400px';

    let currentTheme = detectColorScheme();
    let applyTheme = () => {};

    let svg = null;
    let selectionOutline = null;
    let connectorPreview = null;
    let pendingConnector = null;
    let pointerState = null;
    const paletteButtons = [];
    const actionButtons = [];
    const exportItems = [];
    const propertyGroups = [];
    const propertyFields = [];
    const toggleLabels = [];
    const toggleInputs = [];
    const footerButtons = [];
    const propertyInputs = {};
    let xpLabel = null;
    let zoomSlider = null;
    let zoomLabel = null;
    let gridToggle = null;
    let snapToggle = null;
    let fileNameLabel = null;
    let dirtyMark = null;
    let exportMenu = null;
    let autosaveTimer = null;
    let undoBtn = null;
    let redoBtn = null;
    const listeners = [];
    let hiddenFileInput = null;

    function applyZoom(){
      if (!svg) return;
      const scale = state.zoom / 100;
      svg.style.transform = `scale(${scale})`;
      svg.style.transformOrigin = '0 0';
      if (zoomLabel) zoomLabel.textContent = `${Math.round(state.zoom)}%`;
      if (zoomSlider) zoomSlider.value = state.zoom;
    }

    function setTool(toolId){
      state.tool = toolId;
      paletteButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tool === toolId);
      });
      applyTheme(currentTheme);
      if (toolId !== 'connector') {
        pendingConnector = null;
        if (connectorPreview) {
          connectorPreview.remove();
          connectorPreview = null;
        }
      }
    }

    function awardSessionXp(amount, meta){
      state.xp += amount;
      if (typeof awardXp === 'function') {
        try { awardXp(amount, meta); } catch {}
      }
      if (xpLabel) xpLabel.textContent = localizeText('labels.exp', { value: state.xp });
    }

    function grantXp(kind, amount, meta){
      const now = Date.now();
      const last = state.lastAwards[kind] || 0;
      if (now - last < ACTION_COOLDOWN_MS) return;
      state.lastAwards[kind] = now;
      awardSessionXp(amount, Object.assign({ type: kind }, meta));
    }

    function markDirty(){
      state.hasUnsavedChanges = true;
      renderTitle();
      scheduleAutosave();
    }

    function renderTitle(){
      if (fileNameLabel) fileNameLabel.textContent = state.fileName;
      if (dirtyMark) dirtyMark.style.visibility = state.hasUnsavedChanges ? 'visible' : 'hidden';
    }

    function scheduleAutosave(){
      if (autosaveTimer) clearTimeout(autosaveTimer);
      autosaveTimer = setTimeout(() => {
        if (!state.hasUnsavedChanges) return;
        state.autosaves.unshift({ ts: Date.now(), fileName: state.fileName, diagram: cloneDiagram(state.diagram) });
        writeAutosaves(state.autosaves);
        writePersistentState(state);
      }, AUTOSAVE_INTERVAL_MS);
    }

    function pushHistory(){
      const snapshot = cloneDiagram(state.diagram);
      state.history.splice(state.historyIndex + 1);
      state.history.push(snapshot);
      if (state.history.length > HISTORY_LIMIT) state.history.shift();
      state.historyIndex = state.history.length - 1;
      updateUndoRedoButtons();
    }

    function undo(){
      if (state.historyIndex <= 0) return;
      state.historyIndex--;
      state.diagram = cloneDiagram(state.history[state.historyIndex]);
      ensureDiagramIds(state.diagram);
      state.selection = [];
      renderDiagram();
      markDirty();
      updatePropertyPanel();
    }

    function redo(){
      if (state.historyIndex >= state.history.length - 1) return;
      state.historyIndex++;
      state.diagram = cloneDiagram(state.history[state.historyIndex]);
      ensureDiagramIds(state.diagram);
      state.selection = [];
      renderDiagram();
      markDirty();
      updatePropertyPanel();
    }

    function updateUndoRedoButtons(){
      if (undoBtn) undoBtn.disabled = state.historyIndex <= 0;
      if (redoBtn) redoBtn.disabled = state.historyIndex >= state.history.length - 1;
    }

    function setSelection(ids){
      state.selection = Array.isArray(ids) ? ids.filter(Boolean) : [];
      updatePropertyPanel();
      updateSelectionOutline();
    }

    function updateSelectionOutline(){
      if (!svg) return;
      if (selectionOutline) selectionOutline.remove();
      if (!state.selection.length) return;
      const nodes = state.diagram.nodes.filter(n => state.selection.includes(n.id));
      if (!nodes.length) return;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const node of nodes) {
        minX = Math.min(minX, node.x);
        minY = Math.min(minY, node.y);
        maxX = Math.max(maxX, node.x + node.width);
        maxY = Math.max(maxY, node.y + node.height);
      }
      selectionOutline = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      selectionOutline.setAttribute('x', String(minX - 4));
      selectionOutline.setAttribute('y', String(minY - 4));
      selectionOutline.setAttribute('width', String(maxX - minX + 8));
      selectionOutline.setAttribute('height', String(maxY - minY + 8));
      selectionOutline.setAttribute('fill', 'none');
      selectionOutline.setAttribute('stroke', '#38bdf8');
      selectionOutline.setAttribute('stroke-width', '1');
      selectionOutline.setAttribute('stroke-dasharray', '4 4');
      selectionOutline.setAttribute('pointer-events', 'none');
      svg.appendChild(selectionOutline);
    }

    function renderDiagram(){
      if (!svg) return;
      const theme = COLOR_THEMES[currentTheme] || COLOR_THEMES.light;
      const gridStroke = currentTheme === 'dark' ? 'rgba(148,163,184,0.25)' : '#e2e8f0';
      const markerColor = theme.primaryText;
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      if (state.gridVisible) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
        pattern.setAttribute('id', 'diagram-grid');
        pattern.setAttribute('patternUnits', 'userSpaceOnUse');
        pattern.setAttribute('width', String(GRID_SIZE));
        pattern.setAttribute('height', String(GRID_SIZE));
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', String(GRID_SIZE));
        rect.setAttribute('height', String(GRID_SIZE));
        rect.setAttribute('fill', 'none');
        rect.setAttribute('stroke', gridStroke);
        rect.setAttribute('stroke-width', '0.5');
        pattern.appendChild(rect);
        defs.appendChild(pattern);
        svg.appendChild(defs);
        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bg.setAttribute('x', '0');
        bg.setAttribute('y', '0');
        bg.setAttribute('width', String(SVG_WIDTH));
        bg.setAttribute('height', String(SVG_HEIGHT));
        bg.setAttribute('fill', 'url(#diagram-grid)');
        svg.appendChild(bg);
      } else {
        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bg.setAttribute('x', '0');
        bg.setAttribute('y', '0');
        bg.setAttribute('width', String(SVG_WIDTH));
        bg.setAttribute('height', String(SVG_HEIGHT));
        bg.setAttribute('fill', theme.canvasBg);
        svg.appendChild(bg);
      }
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
      marker.setAttribute('id', 'diagram-arrow');
      marker.setAttribute('markerWidth', '10');
      marker.setAttribute('markerHeight', '7');
      marker.setAttribute('refX', '10');
      marker.setAttribute('refY', '3.5');
      marker.setAttribute('orient', 'auto');
      const markerPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      markerPath.setAttribute('d', 'M0,0 L10,3.5 L0,7 Z');
      markerPath.setAttribute('fill', markerColor);
      marker.appendChild(markerPath);
      defs.appendChild(marker);
      svg.appendChild(defs);
      for (const edge of state.diagram.edges) {
        if (!edge.source || !edge.target) continue;
        const source = state.diagram.nodes.find(n => n.id === edge.source);
        const target = state.diagram.nodes.find(n => n.id === edge.target);
        if (!source || !target) continue;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', String(source.x + source.width / 2));
        line.setAttribute('y1', String(source.y + source.height / 2));
        line.setAttribute('x2', String(target.x + target.width / 2));
        line.setAttribute('y2', String(target.y + target.height / 2));
        const baseStroke = edge.stroke || DEFAULT_STYLE.stroke;
        const strokeColor = currentTheme === 'dark' && baseStroke === BASE_STROKE_COLOR ? theme.primaryText : baseStroke;
        line.setAttribute('stroke', strokeColor);
        line.setAttribute('stroke-width', String(edge.strokeWidth ?? DEFAULT_STYLE.strokeWidth));
        line.setAttribute('marker-end', 'url(#diagram-arrow)');
        line.dataset.id = edge.id;
        line.dataset.kind = 'edge';
        svg.appendChild(line);
      }
      for (const node of state.diagram.nodes) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.dataset.id = node.id;
        group.dataset.kind = 'node';
        let shape;
        if (node.type === 'ellipse') {
          shape = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
          shape.setAttribute('cx', String(node.x + node.width / 2));
          shape.setAttribute('cy', String(node.y + node.height / 2));
          shape.setAttribute('rx', String(node.width / 2));
          shape.setAttribute('ry', String(node.height / 2));
        } else {
          shape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          shape.setAttribute('x', String(node.x));
          shape.setAttribute('y', String(node.y));
          shape.setAttribute('width', String(node.width));
          shape.setAttribute('height', String(node.height));
          shape.setAttribute('rx', node.type === 'rectangle' ? '6' : '0');
          shape.setAttribute('ry', node.type === 'rectangle' ? '6' : '0');
        }
        shape.setAttribute('fill', node.fill || DEFAULT_STYLE.fill);
        const nodeStroke = node.stroke || DEFAULT_STYLE.stroke;
        shape.setAttribute('stroke', currentTheme === 'dark' && nodeStroke === BASE_STROKE_COLOR ? theme.primaryText : nodeStroke);
        shape.setAttribute('stroke-width', String(node.strokeWidth ?? DEFAULT_STYLE.strokeWidth));
        group.appendChild(shape);
        if (node.text) {
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', String(node.x + node.width / 2));
          text.setAttribute('y', String(node.y + node.height / 2));
          const textColor = node.textColor || DEFAULT_STYLE.textColor;
          text.setAttribute('fill', currentTheme === 'dark' && textColor === BASE_TEXT_COLOR ? theme.primaryText : textColor);
          text.setAttribute('font-size', String(node.fontSize ?? DEFAULT_STYLE.fontSize));
          text.setAttribute('font-family', node.fontFamily || DEFAULT_STYLE.fontFamily);
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('dominant-baseline', 'middle');
          text.textContent = node.text;
          group.appendChild(text);
        }
        svg.appendChild(group);
      }
      updateSelectionOutline();
    }

    function addNode(type, x, y){
      const id = `n${state.diagram.nextNodeId++}`;
      const theme = COLOR_THEMES[currentTheme] || COLOR_THEMES.light;
      const defaultStroke = currentTheme === 'dark' ? theme.primaryText : DEFAULT_STYLE.stroke;
      const defaultText = currentTheme === 'dark' ? theme.primaryText : DEFAULT_STYLE.textColor;
      const node = {
        id,
        type,
        layer: state.diagram.layerOrder[0],
        x: state.snapToGrid ? roundToGrid(x, GRID_SIZE) : x,
        y: state.snapToGrid ? roundToGrid(y, GRID_SIZE) : y,
        width: type === 'text' ? 160 : 160,
        height: type === 'text' ? 60 : 90,
        rotation: 0,
        text: type === 'text' ? localizeText('defaults.textPlaceholder') : localizeText('defaults.nodePlaceholder'),
        fill: DEFAULT_STYLE.fill,
        stroke: defaultStroke,
        strokeWidth: DEFAULT_STYLE.strokeWidth,
        textColor: defaultText,
        fontSize: DEFAULT_STYLE.fontSize,
        fontFamily: DEFAULT_STYLE.fontFamily
      };
      state.diagram.nodes.push(node);
      pushHistory();
      renderDiagram();
      setSelection([id]);
      markDirty();
      grantXp('shape_edit', XP_VALUES.shapeEdit, { action: 'add' });
    }

    function addConnector(sourceId, targetId){
      const id = `e${state.diagram.nextEdgeId++}`;
      const theme = COLOR_THEMES[currentTheme] || COLOR_THEMES.light;
      const defaultStroke = currentTheme === 'dark' ? theme.primaryText : DEFAULT_STYLE.stroke;
      state.diagram.edges.push({
        id,
        layer: state.diagram.layerOrder[0],
        source: sourceId,
        target: targetId,
        points: [],
        stroke: defaultStroke,
        strokeWidth: DEFAULT_STYLE.strokeWidth,
        arrow: 'block'
      });
      pushHistory();
      renderDiagram();
      setSelection([sourceId, targetId]);
      markDirty();
      grantXp('connector_edit', XP_VALUES.connectorEdit, { action: 'add' });
    }

    function deleteSelection(){
      if (!state.selection.length) return;
      const before = state.diagram.nodes.length + state.diagram.edges.length;
      state.diagram.nodes = state.diagram.nodes.filter(n => !state.selection.includes(n.id));
      state.diagram.edges = state.diagram.edges.filter(e => !state.selection.includes(e.id) && !state.selection.includes(e.source) && !state.selection.includes(e.target));
      const after = state.diagram.nodes.length + state.diagram.edges.length;
      if (before !== after) {
        pushHistory();
        renderDiagram();
        setSelection([]);
        markDirty();
        grantXp('shape_edit', XP_VALUES.shapeEdit, { action: 'delete' });
      }
    }

    function updatePropertyPanel(){
      const nodes = state.diagram.nodes.filter(n => state.selection.includes(n.id));
      if (nodes.length === 1) {
        const node = nodes[0];
        propertyInputs.x.value = node.x;
        propertyInputs.y.value = node.y;
        propertyInputs.width.value = node.width;
        propertyInputs.height.value = node.height;
        propertyInputs.fill.value = node.fill || DEFAULT_STYLE.fill;
        propertyInputs.stroke.value = node.stroke || DEFAULT_STYLE.stroke;
        propertyInputs.strokeWidth.value = node.strokeWidth ?? DEFAULT_STYLE.strokeWidth;
        propertyInputs.text.value = node.text || '';
        propertyInputs.textColor.value = node.textColor || DEFAULT_STYLE.textColor;
        propertyInputs.fontSize.value = node.fontSize ?? DEFAULT_STYLE.fontSize;
        Object.values(propertyInputs).forEach(input => { input.disabled = false; });
      } else {
        Object.values(propertyInputs).forEach(input => {
          input.value = '';
          input.disabled = true;
        });
      }
    }

    function bindProperty(key, parse){
      const input = propertyInputs[key];
      if (!input) return;
      input.addEventListener('input', () => {
        const nodes = state.diagram.nodes.filter(n => state.selection.includes(n.id));
        if (nodes.length !== 1) return;
        const node = nodes[0];
        const value = parse(input.value, node[key]);
        if (value === undefined) return;
        node[key] = value;
        pushHistory();
        renderDiagram();
        markDirty();
      });
    }

    function pointerDown(e){
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const scale = state.zoom / 100;
      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;
      if (state.tool === 'rectangle' || state.tool === 'ellipse' || state.tool === 'text') {
        addNode(state.tool, x - 80, y - 45);
        return;
      }
      const target = e.target.closest('[data-kind]');
      if (state.tool === 'connector') {
        if (target && target.dataset.kind === 'node') {
          if (!pendingConnector) {
            pendingConnector = target.dataset.id;
            showConnectorPreview(target.dataset.id, x, y);
          } else if (pendingConnector !== target.dataset.id) {
            addConnector(pendingConnector, target.dataset.id);
            pendingConnector = null;
            if (connectorPreview) {
              connectorPreview.remove();
              connectorPreview = null;
            }
          }
        }
        return;
      }
      if (state.tool === 'delete') {
        if (target) {
          setSelection([target.dataset.id]);
          deleteSelection();
        }
        return;
      }
      if (target && target.dataset.kind === 'node') {
        const nodeId = target.dataset.id;
        setSelection([nodeId]);
        const node = state.diagram.nodes.find(n => n.id === nodeId);
        pointerState = {
          active: true,
          node,
          startX: x,
          startY: y,
          originX: node.x,
          originY: node.y
        };
        svg.addEventListener('pointermove', pointerMove, pointerCaptureOptions);
        svg.addEventListener('pointerup', pointerUp, pointerCaptureOptions);
        svg.setPointerCapture(e.pointerId);
      } else {
        setSelection([]);
      }
    }

    function pointerMove(e){
      if (!pointerState?.active) return;
      const rect = svg.getBoundingClientRect();
      const scale = state.zoom / 100;
      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;
      const dx = x - pointerState.startX;
      const dy = y - pointerState.startY;
      const newX = pointerState.originX + dx;
      const newY = pointerState.originY + dy;
      pointerState.node.x = state.snapToGrid ? roundToGrid(newX, GRID_SIZE) : newX;
      pointerState.node.y = state.snapToGrid ? roundToGrid(newY, GRID_SIZE) : newY;
      renderDiagram();
      markDirty();
    }

    function pointerUp(e){
      if (pointerState?.active) {
        pushHistory();
        grantXp('shape_edit', XP_VALUES.shapeEdit, { action: 'move' });
      }
      pointerState = null;
      svg.removeEventListener('pointermove', pointerMove, pointerCaptureOptions);
      svg.removeEventListener('pointerup', pointerUp, pointerCaptureOptions);
      try { svg.releasePointerCapture(e.pointerId); } catch {}
    }

    function showConnectorPreview(sourceId, x, y){
      if (connectorPreview) connectorPreview.remove();
      const source = state.diagram.nodes.find(n => n.id === sourceId);
      if (!source) return;
      connectorPreview = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      connectorPreview.setAttribute('x1', String(source.x + source.width / 2));
      connectorPreview.setAttribute('y1', String(source.y + source.height / 2));
      connectorPreview.setAttribute('x2', String(x));
      connectorPreview.setAttribute('y2', String(y));
      connectorPreview.setAttribute('stroke', '#94a3b8');
      connectorPreview.setAttribute('stroke-dasharray', '4 4');
      connectorPreview.setAttribute('pointer-events', 'none');
      svg.appendChild(connectorPreview);
    }

    function pointerMoveConnector(e){
      if (!pendingConnector || !connectorPreview) return;
      const rect = svg.getBoundingClientRect();
      const scale = state.zoom / 100;
      const x = (e.clientX - rect.left) / scale;
      const y = (e.clientY - rect.top) / scale;
      connectorPreview.setAttribute('x2', String(x));
      connectorPreview.setAttribute('y2', String(y));
    }

    function buildLayout(){
      const wrapper = document.createElement('div');
      wrapper.style.width = '100%';
      wrapper.style.height = '100%';
      wrapper.style.display = 'flex';
      wrapper.style.alignItems = 'center';
      wrapper.style.justifyContent = 'center';
      wrapper.style.padding = '24px 32px';

      const shell = document.createElement('div');
      shell.style.width = 'min(1280px, 96%)';
      shell.style.height = 'min(780px, 94%)';
      shell.style.display = 'flex';
      shell.style.flexDirection = 'column';
      shell.style.borderRadius = '18px';
      shell.style.background = '#f8fafc';
      shell.style.boxShadow = '0 24px 60px rgba(15,23,42,0.45)';
      shell.style.border = '1px solid rgba(148,163,184,0.35)';
      shell.style.overflow = 'hidden';
      shell.style.fontFamily = '"Segoe UI", "Yu Gothic", sans-serif';

      const titleBar = document.createElement('div');
      titleBar.style.display = 'flex';
      titleBar.style.alignItems = 'center';
      titleBar.style.gap = '12px';
      titleBar.style.padding = '0 18px';
      titleBar.style.height = '50px';
      titleBar.style.background = '#ffffff';
      titleBar.style.borderBottom = '1px solid rgba(148,163,184,0.25)';

      fileNameLabel = document.createElement('div');
      fileNameLabel.style.flex = '1';
      fileNameLabel.style.fontWeight = '600';
      fileNameLabel.style.color = '#0f172a';

      dirtyMark = document.createElement('span');
      dirtyMark.textContent = '*';
      dirtyMark.style.color = '#ef4444';
      dirtyMark.style.fontWeight = '700';
      dirtyMark.style.visibility = 'hidden';

      const titleGroup = document.createElement('div');
      titleGroup.style.display = 'flex';
      titleGroup.style.alignItems = 'center';
      titleGroup.style.gap = '6px';
      titleGroup.appendChild(fileNameLabel);
      titleGroup.appendChild(dirtyMark);

      const actions = document.createElement('div');
      actions.style.display = 'flex';
      actions.style.gap = '8px';

      function createButton(labelId, onClick, params){
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = localizeText(labelId, params);
        btn.style.padding = '6px 12px';
        btn.style.borderRadius = '8px';
        btn.style.border = '1px solid rgba(148,163,184,0.4)';
        btn.style.background = '#e2e8f0';
        btn.style.cursor = 'pointer';
        btn.style.fontSize = '14px';
        btn.addEventListener('click', onClick);
        actionButtons.push(btn);
        return btn;
      }

      const newBtn = createButton('actions.new', handleNew);
      const openBtn = createButton('actions.open', () => hiddenFileInput.click());
      const saveBtn = createButton('actions.save', handleSave);
      const exportBtn = createButton('actions.export', toggleExportMenu);
      exportBtn.style.position = 'relative';

      exportMenu = document.createElement('div');
      exportMenu.style.position = 'absolute';
      exportMenu.style.top = '36px';
      exportMenu.style.right = '0';
      exportMenu.style.background = '#ffffff';
      exportMenu.style.border = '1px solid rgba(148,163,184,0.25)';
      exportMenu.style.borderRadius = '8px';
      exportMenu.style.boxShadow = '0 10px 30px rgba(15,23,42,0.25)';
      exportMenu.style.padding = '6px';
      exportMenu.style.display = 'none';
      exportMenu.style.flexDirection = 'column';
      ['png', 'jpg', 'bmp'].forEach(fmt => {
        const item = document.createElement('button');
        item.type = 'button';
        const formatLabel = fmt.toUpperCase();
        item.textContent = localizeText('actions.exportFormat', { format: fmt, formatLabel });
        item.style.border = 'none';
        item.style.background = 'transparent';
        item.style.padding = '6px 12px';
        item.style.textAlign = 'left';
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => {
          exportMenu.style.display = 'none';
          exportImage(fmt);
        });
        item.addEventListener('mouseenter', () => {
          const theme = COLOR_THEMES[currentTheme] || COLOR_THEMES.light;
          item.style.background = theme.exportHoverBg;
        });
        item.addEventListener('mouseleave', () => {
          item.style.background = 'transparent';
        });
        exportMenu.appendChild(item);
        exportItems.push(item);
      });
      exportBtn.appendChild(exportMenu);

      actions.appendChild(newBtn);
      actions.appendChild(openBtn);
      actions.appendChild(saveBtn);
      actions.appendChild(exportBtn);

      titleBar.appendChild(titleGroup);
      titleBar.appendChild(actions);

      const body = document.createElement('div');
      body.style.flex = '1';
      body.style.display = 'grid';
      body.style.gridTemplateColumns = 'minmax(240px, 280px) minmax(0, 1fr) minmax(280px, 340px)';
      body.style.gridTemplateRows = '1fr';

      const palette = document.createElement('div');
      palette.style.background = '#f1f5f9';
      palette.style.borderRight = '1px solid rgba(148,163,184,0.25)';
      palette.style.padding = '12px';
      palette.style.display = 'flex';
      palette.style.flexDirection = 'column';
      palette.style.gap = '10px';

      TOOL_DEFS.forEach(def => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.dataset.tool = def.id;
        const labelText = localizeText(def.labelId) || def.labelId;
        btn.textContent = def.icon + (labelText ? ` ${labelText}` : '');
        btn.setAttribute('aria-label', labelText || def.id);
        btn.style.padding = '8px 12px';
        btn.style.borderRadius = '8px';
        btn.style.border = '1px solid rgba(148,163,184,0.4)';
        btn.style.background = '#ffffff';
        btn.style.cursor = 'pointer';
        btn.style.display = 'flex';
        btn.style.alignItems = 'center';
        btn.style.gap = '6px';
        btn.addEventListener('click', () => setTool(def.id));
        palette.appendChild(btn);
        paletteButtons.push(btn);
      });

      const canvasWrap = document.createElement('div');
      canvasWrap.style.position = 'relative';
      canvasWrap.style.overflow = 'auto';
      canvasWrap.style.background = '#e2e8f0';

      svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', String(SVG_WIDTH));
      svg.setAttribute('height', String(SVG_HEIGHT));
      svg.style.background = '#f8fafc';
      svg.style.transition = 'transform 0.15s ease';
      canvasWrap.appendChild(svg);

      const properties = document.createElement('div');
      properties.style.background = '#f8fafc';
      properties.style.borderLeft = '1px solid rgba(148,163,184,0.25)';
      properties.style.padding = '16px';
      properties.style.display = 'flex';
      properties.style.flexDirection = 'column';
      properties.style.gap = '12px';

      const propertyTitle = document.createElement('h3');
      propertyTitle.textContent = localizeText('sections.properties');
      propertyTitle.style.fontSize = '16px';
      propertyTitle.style.margin = '0';
      propertyTitle.style.color = '#0f172a';
      propertyGroups.push(propertyTitle);
      properties.appendChild(propertyTitle);

      function createField(labelId, type){
        const wrapper = document.createElement('label');
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.fontSize = '13px';
        wrapper.style.color = '#0f172a';
        const labelText = localizeText(labelId);
        wrapper.textContent = labelText;
        const input = document.createElement('input');
        input.type = type;
        input.style.marginTop = '4px';
        input.style.padding = '6px 8px';
        input.style.borderRadius = '6px';
        input.style.border = '1px solid rgba(148,163,184,0.4)';
        wrapper.appendChild(input);
        properties.appendChild(wrapper);
        propertyGroups.push(wrapper);
        propertyFields.push(input);
        return input;
      }

      propertyInputs.x = createField('fields.x', 'number');
      propertyInputs.y = createField('fields.y', 'number');
      propertyInputs.width = createField('fields.width', 'number');
      propertyInputs.height = createField('fields.height', 'number');
      propertyInputs.fill = createField('fields.fill', 'color');
      propertyInputs.stroke = createField('fields.stroke', 'color');
      propertyInputs.strokeWidth = createField('fields.strokeWidth', 'number');
      propertyInputs.textColor = createField('fields.textColor', 'color');
      propertyInputs.fontSize = createField('fields.fontSize', 'number');
      const textLabel = document.createElement('label');
      textLabel.style.display = 'flex';
      textLabel.style.flexDirection = 'column';
      textLabel.style.fontSize = '13px';
      textLabel.style.color = '#0f172a';
      textLabel.textContent = localizeText('fields.text');
      const textArea = document.createElement('textarea');
      textArea.rows = 3;
      textArea.style.marginTop = '4px';
      textArea.style.padding = '6px 8px';
      textArea.style.borderRadius = '6px';
      textArea.style.border = '1px solid rgba(148,163,184,0.4)';
      propertyInputs.text = textArea;
      textLabel.appendChild(textArea);
      properties.appendChild(textLabel);
      propertyGroups.push(textLabel);
      propertyFields.push(textArea);

      textArea.addEventListener('input', () => {
        const nodes = state.diagram.nodes.filter(n => state.selection.includes(n.id));
        if (nodes.length !== 1) return;
        nodes[0].text = textArea.value;
        pushHistory();
        renderDiagram();
        markDirty();
      });

      const footer = document.createElement('div');
      footer.style.height = '48px';
      footer.style.display = 'flex';
      footer.style.alignItems = 'center';
      footer.style.justifyContent = 'space-between';
      footer.style.padding = '0 16px';
      footer.style.background = '#ffffff';
      footer.style.borderTop = '1px solid rgba(148,163,184,0.25)';

      const left = document.createElement('div');
      left.style.display = 'flex';
      left.style.alignItems = 'center';
      left.style.gap = '12px';

      zoomSlider = document.createElement('input');
      zoomSlider.type = 'range';
      zoomSlider.min = String(MIN_ZOOM);
      zoomSlider.max = String(MAX_ZOOM);
      zoomSlider.value = String(state.zoom);
      zoomSlider.addEventListener('input', () => {
        state.zoom = Number(zoomSlider.value);
        applyZoom();
        writePersistentState(state);
      });

      zoomLabel = document.createElement('span');
      zoomLabel.textContent = `${Math.round(state.zoom)}%`;

      gridToggle = document.createElement('label');
      gridToggle.style.display = 'flex';
      gridToggle.style.alignItems = 'center';
      gridToggle.style.gap = '4px';
      const gridCheckbox = document.createElement('input');
      gridCheckbox.type = 'checkbox';
      gridCheckbox.checked = state.gridVisible;
      gridCheckbox.addEventListener('change', () => {
        state.gridVisible = gridCheckbox.checked;
        renderDiagram();
        writePersistentState(state);
      });
      gridToggle.appendChild(gridCheckbox);
      gridToggle.appendChild(document.createTextNode(localizeText('toggles.grid')));
      toggleLabels.push(gridToggle);
      toggleInputs.push(gridCheckbox);

      snapToggle = document.createElement('label');
      snapToggle.style.display = 'flex';
      snapToggle.style.alignItems = 'center';
      snapToggle.style.gap = '4px';
      const snapCheckbox = document.createElement('input');
      snapCheckbox.type = 'checkbox';
      snapCheckbox.checked = state.snapToGrid;
      snapCheckbox.addEventListener('change', () => {
        state.snapToGrid = snapCheckbox.checked;
        writePersistentState(state);
      });
      snapToggle.appendChild(snapCheckbox);
      snapToggle.appendChild(document.createTextNode(localizeText('toggles.snap')));
      toggleLabels.push(snapToggle);
      toggleInputs.push(snapCheckbox);

      left.appendChild(zoomSlider);
      left.appendChild(zoomLabel);
      left.appendChild(gridToggle);
      left.appendChild(snapToggle);

      xpLabel = document.createElement('div');
      xpLabel.textContent = localizeText('labels.exp', { value: state.xp });
      xpLabel.style.fontWeight = '600';
      xpLabel.style.color = '#0f172a';

      undoBtn = document.createElement('button');
      undoBtn.type = 'button';
      undoBtn.textContent = localizeText('actions.undo');
      undoBtn.style.marginRight = '8px';
      undoBtn.addEventListener('click', undo);
      footerButtons.push(undoBtn);

      redoBtn = document.createElement('button');
      redoBtn.type = 'button';
      redoBtn.textContent = localizeText('actions.redo');
      redoBtn.style.marginRight = '12px';
      redoBtn.addEventListener('click', redo);
      footerButtons.push(redoBtn);

      const right = document.createElement('div');
      right.style.display = 'flex';
      right.style.alignItems = 'center';
      right.style.gap = '8px';
      right.appendChild(undoBtn);
      right.appendChild(redoBtn);
      right.appendChild(xpLabel);

      footer.appendChild(left);
      footer.appendChild(right);

      body.appendChild(palette);
      body.appendChild(canvasWrap);
      body.appendChild(properties);

      shell.appendChild(titleBar);
      shell.appendChild(body);
      shell.appendChild(footer);
      wrapper.appendChild(shell);

      hiddenFileInput = document.createElement('input');
      hiddenFileInput.type = 'file';
      hiddenFileInput.accept = '.drawio,.xml,.dio,.png,.jpg,.jpeg,.bmp';
      hiddenFileInput.style.display = 'none';
      hiddenFileInput.addEventListener('change', onFileChange);
      wrapper.appendChild(hiddenFileInput);

      applyTheme = (mode) => {
        const theme = COLOR_THEMES[mode] || COLOR_THEMES.light;
        wrapper.style.background = theme.overlay;
        shell.style.background = theme.shellBg;
        shell.style.border = theme.shellBorder;
        shell.style.boxShadow = mode === 'dark'
          ? '0 32px 80px rgba(2,6,23,0.75)'
          : '0 24px 60px rgba(15,23,42,0.35)';
        shell.style.color = theme.primaryText;
        titleBar.style.background = theme.titleBg;
        titleBar.style.borderBottom = theme.titleBorder;
        titleBar.style.color = theme.primaryText;
        fileNameLabel.style.color = theme.primaryText;
        actionButtons.forEach(btn => {
          btn.style.background = theme.actionButtonBg;
          btn.style.border = theme.actionButtonBorder;
          btn.style.color = theme.actionButtonText;
        });
        exportMenu.style.background = theme.exportBg;
        exportMenu.style.border = theme.panelDivider;
        exportItems.forEach(item => {
          item.style.color = theme.exportText;
        });
        body.style.color = theme.primaryText;
        palette.style.background = theme.panelBg;
        palette.style.borderRight = theme.panelDivider;
        palette.style.color = theme.primaryText;
        paletteButtons.forEach(btn => {
          const active = state.tool === btn.dataset.tool;
          btn.style.background = active ? theme.paletteButtonActiveBg : theme.paletteButtonBg;
          btn.style.border = active ? theme.paletteButtonActiveBorder : theme.paletteButtonBorder;
          btn.style.color = active ? theme.paletteButtonActiveText : theme.paletteButtonText;
          btn.style.boxShadow = active ? '0 0 0 1px rgba(59,130,246,0.4)' : 'none';
        });
        canvasWrap.style.background = theme.canvasWrapBg;
        svg.style.background = theme.canvasBg;
        properties.style.background = theme.propertiesBg;
        properties.style.borderLeft = theme.panelDivider;
        properties.style.color = theme.primaryText;
        propertyGroups.forEach(group => {
          group.style.color = theme.primaryText;
        });
        propertyFields.forEach(field => {
          field.style.background = theme.inputBg;
          field.style.border = theme.inputBorder;
          field.style.color = theme.inputText;
        });
        footer.style.background = theme.footerBg;
        footer.style.borderTop = theme.footerBorder;
        footer.style.color = theme.primaryText;
        toggleLabels.forEach(label => {
          label.style.color = theme.toggleText;
        });
        const accent = mode === 'dark' ? '#38bdf8' : '#2563eb';
        toggleInputs.forEach(input => {
          try { input.style.accentColor = accent; } catch {}
        });
        if (zoomLabel) {
          zoomLabel.style.color = theme.secondaryText;
        }
        if (zoomSlider) {
          try { zoomSlider.style.accentColor = accent; } catch {}
        }
        if (xpLabel) {
          xpLabel.style.color = theme.xpText;
        }
        footerButtons.forEach(btn => {
          btn.style.background = theme.actionButtonBg;
          btn.style.border = theme.actionButtonBorder;
          btn.style.color = theme.actionButtonText;
          btn.style.padding = '6px 12px';
          btn.style.borderRadius = '8px';
          btn.style.cursor = 'pointer';
        });
      };

      applyTheme(currentTheme);

      root.appendChild(wrapper);
      return { wrapper };
    }

    function toggleExportMenu(){
      if (!exportMenu) return;
      exportMenu.style.display = exportMenu.style.display === 'flex' ? 'none' : 'flex';
    }

    function bindProperties(){
      bindProperty('x', v => Number(v));
      bindProperty('y', v => Number(v));
      bindProperty('width', v => Math.max(10, Number(v)));
      bindProperty('height', v => Math.max(10, Number(v)));
      bindProperty('fill', v => v || DEFAULT_STYLE.fill);
      bindProperty('stroke', v => v || DEFAULT_STYLE.stroke);
      bindProperty('strokeWidth', v => Number(v) || DEFAULT_STYLE.strokeWidth);
      bindProperty('textColor', v => v || DEFAULT_STYLE.textColor);
      bindProperty('fontSize', v => Number(v) || DEFAULT_STYLE.fontSize);
    }

    function handleNew(){
      if (state.hasUnsavedChanges && !confirm(localizeText('confirm.newDocument'))) return;
      state.diagram = createEmptyDiagram();
      ensureDiagramIds(state.diagram);
      state.fileName = getDefaultFileName();
      state.selection = [];
      state.history = [];
      state.historyIndex = -1;
      state.hasUnsavedChanges = false;
      renderDiagram();
      renderTitle();
      pushHistory();
      grantXp('shape_edit', XP_VALUES.shapeEdit, { action: 'new_document' });
    }

    async function onFileChange(){
      const file = hiddenFileInput.files?.[0];
      if (!file) return;
      try {
        let text;
        if (file.name.endsWith('.png') || file.name.endsWith('.jpg') || file.name.endsWith('.jpeg') || file.name.endsWith('.bmp')) {
          const buffer = await file.arrayBuffer();
          text = await decodePngXml(buffer);
        } else {
          text = await file.text();
        }
        const diagram = mxToDiagram(text);
        state.diagram = diagram;
        state.fileName = file.name.replace(/\.(png|jpg|jpeg|bmp)$/i, '.drawio');
        state.selection = [];
        state.history = [];
        state.historyIndex = -1;
        state.hasUnsavedChanges = false;
        renderDiagram();
        renderTitle();
        pushHistory();
        grantXp('import', XP_VALUES.import, { file: file.name });
      } catch (err) {
        alert(localizeText('errors.loadFailed', { error: formatErrorMessage(err) }));
      } finally {
        hiddenFileInput.value = '';
      }
    }

    function handleSave(){
      try {
        const xml = diagramToMx(state.diagram);
        const blob = new Blob([xml], { type: 'text/xml' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = state.fileName.endsWith('.drawio') ? state.fileName : `${state.fileName.replace(/\.[^.]+$/, '')}.drawio`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        state.hasUnsavedChanges = false;
        renderTitle();
        awardSessionXp(XP_VALUES.saveXml, { type: 'save_xml' });
        writePersistentState(state);
      } catch (err) {
        alert(localizeText('errors.saveFailed', { error: formatErrorMessage(err) }));
      }
    }

    async function exportImage(format){
      try {
        const xml = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.src = url;
        await img.decode();
        const canvas = document.createElement('canvas');
        canvas.width = SVG_WIDTH;
        canvas.height = SVG_HEIGHT;
        const ctx = canvas.getContext('2d');
        if (format !== 'png') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        const mime = format === 'png' ? 'image/png' : format === 'jpg' ? 'image/jpeg' : 'image/bmp';
        const dataUrl = canvas.toDataURL(mime);
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `${state.fileName.replace(/\.[^.]+$/, '')}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        awardSessionXp(XP_VALUES.exportImage, { type: 'export_image', format });
      } catch (err) {
        alert(localizeText('errors.exportFailed', { error: formatErrorMessage(err) }));
      }
    }

    const { wrapper } = buildLayout();

    function syncTheme(){
      const next = detectColorScheme();
      if (next !== currentTheme){
        currentTheme = next;
        applyTheme(currentTheme);
      }
    }

    const schemeQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    if (schemeQuery){
      const handleScheme = () => syncTheme();
      if (typeof schemeQuery.addEventListener === 'function') schemeQuery.addEventListener('change', handleScheme);
      else if (typeof schemeQuery.addListener === 'function') schemeQuery.addListener(handleScheme);
      listeners.push(() => {
        if (typeof schemeQuery.removeEventListener === 'function') schemeQuery.removeEventListener('change', handleScheme);
        else if (typeof schemeQuery.removeListener === 'function') schemeQuery.removeListener(handleScheme);
      });
    }

    const observerTargets = [document.documentElement, document.body].filter(Boolean);
    if (observerTargets.length){
      const observer = new MutationObserver(syncTheme);
      observerTargets.forEach(target => observer.observe(target, { attributes: true, attributeFilter: ['class', 'data-theme'] }));
      listeners.push(() => observer.disconnect());
    }

    syncTheme();
    setTool('select');
    applyZoom();
    bindProperties();
    renderDiagram();
    renderTitle();
    pushHistory();
    awardSessionXp(XP_VALUES.open, { type: 'open' });

    svg.addEventListener('pointerdown', pointerDown, pointerCaptureOptions);
    svg.addEventListener('pointermove', pointerMoveConnector, pointerCaptureOptions);
    window.addEventListener('keydown', handleKeyDown);

    function handleKeyDown(e){
      if (e.key === 'Delete') {
        deleteSelection();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    }

    function destroy(){
      window.removeEventListener('keydown', handleKeyDown);
      if (svg) {
        svg.removeEventListener('pointerdown', pointerDown, pointerCaptureOptions);
        svg.removeEventListener('pointermove', pointerMoveConnector, pointerCaptureOptions);
      }
      if (autosaveTimer) clearTimeout(autosaveTimer);
      while (listeners.length){
        const dispose = listeners.pop();
        try { dispose(); } catch {}
      }
      writePersistentState(state);
      try { root.removeChild(wrapper); } catch {}
      root.style.padding = originalRootStyle.padding;
      root.style.margin = originalRootStyle.margin;
      root.style.background = originalRootStyle.background;
      root.style.border = originalRootStyle.border;
      root.style.minHeight = originalRootStyle.minHeight;
      root.style.display = originalRootStyle.display;
      root.style.justifyContent = originalRootStyle.justifyContent;
      root.style.alignItems = originalRootStyle.alignItems;
      root.style.width = originalRootStyle.width;
      root.style.maxWidth = originalRootStyle.maxWidth;
    }

    function stop(){
      if (autosaveTimer) clearTimeout(autosaveTimer);
      writePersistentState(state);
    }

    function start(){
      renderDiagram();
      applyZoom();
    }

    return {
      start,
      stop,
      destroy,
      getScore(){ return state.xp; }
    };
  }

  window.registerMiniGame({
    id: 'diagram_maker',
    name: 'ダイアグラムメーカー', nameKey: 'selection.miniexp.games.diagram_maker.name',
    description: 'draw.io互換XMLと画像書き出し対応の図表作成ツール', descriptionKey: 'selection.miniexp.games.diagram_maker.description', categoryIds: ['utility'],
    category: 'ユーティリティ',
    version: '0.1.0',
    author: 'mod',
    create
  });
})();

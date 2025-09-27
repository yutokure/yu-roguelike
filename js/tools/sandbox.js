(function (global) {
    'use strict';

    const ToolsTab = global.ToolsTab;
    let Bridge = null;

    if (!ToolsTab || typeof ToolsTab.registerTool !== 'function') {
        return;
    }

    const clamp = (min, max, value) => Math.max(min, Math.min(max, value));
    const DEFAULT_WIDTH = 21;
    const DEFAULT_HEIGHT = 15;
    const DEFAULT_LEVEL = 1;
    const MIN_SIZE_FALLBACK = 5;
    const MAX_SIZE_FALLBACK = 60;
    const MAX_LEVEL_FALLBACK = 999;
    const BRUSHES = ['select', 'floor', 'wall', 'start', 'stairs', 'enemy'];
    const BRUSH_CURSOR = {
        select: 'default',
        floor: 'pointer',
        wall: 'pointer',
        start: 'pointer',
        stairs: 'pointer',
        enemy: 'pointer'
    };
    const FLOOR_TYPES = ['normal', 'ice', 'poison'];
    const DEFAULT_FLOOR_COLOR = '#ced6e0';
    const DEFAULT_WALL_COLOR = '#2f3542';
    const COLOR_HEX_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
    const RENDER_CELL_SIZE = 28;
    const RENDER_CELL_GAP = 4;
    const RENDER_CELL_RADIUS = 6;
    const GRID_BACKGROUND_COLOR = '#f8fafc';
    const GRID_DEFAULT_FLOOR_COLOR = '#e5edff';
    const GRID_DEFAULT_WALL_COLOR = '#1f2937';
    const GRID_BORDER_FLOOR = '#cbd5f5';
    const GRID_BORDER_WALL = '#0f172a';
    const GRID_SELECTION_COLOR = '#38bdf8';
    const GRID_START_COLOR = '#22d3ee';
    const GRID_STAIRS_COLOR = '#f97316';
    const GRID_SELECTED_ENEMY_COLOR = '#f97316';
    const FLOOR_TYPE_COLORS = {
        ice: '#74c0fc',
        poison: '#94d82d'
    };

    let refs = {};
    let state = null;
    let enemySeq = 1;
    let pendingSerializedState = null;
    const paintState = { active: false, pointerId: null, lastKey: null, blockClick: false };
    const EXPORT_FILE_PREFIX = 'sandbox-dungeon';

    function formatTimestamp(date) {
        const pad = (value) => String(value).padStart(2, '0');
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        const seconds = pad(date.getSeconds());
        return `${year}${month}${day}-${hours}${minutes}${seconds}`;
    }

    function triggerDownload(content, filename) {
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 0);
    }

    function renderIoStatus() {
        if (!refs.ioStatus) return;
        const status = state?.ioStatus || { type: 'idle', message: '' };
        if (!status.message) {
            refs.ioStatus.textContent = '';
            refs.ioStatus.dataset.tone = '';
            refs.ioStatus.style.display = 'none';
            return;
        }
        refs.ioStatus.style.display = '';
        refs.ioStatus.textContent = status.message;
        refs.ioStatus.dataset.tone = status.type || 'info';
    }

    function updateIoStatus(type, message) {
        if (!state) return;
        state.ioStatus = { type, message };
        renderIoStatus();
    }

    function extractSandboxPayload(raw) {
        if (!raw || typeof raw !== 'object') return null;
        const candidates = [];
        if (raw.type === 'sandbox_dungeon' && raw.data) candidates.push(raw.data);
        if (raw.sandbox) candidates.push(raw.sandbox);
        if (raw.data && raw.type !== 'sandbox_dungeon') candidates.push(raw.data);
        if (raw.sandboxState) candidates.push(raw.sandboxState);
        if (raw.state && !Array.isArray(raw.state)) candidates.push(raw.state);
        candidates.push(raw);
        for (const candidate of candidates) {
            if (!candidate || typeof candidate !== 'object') continue;
            const width = Number(candidate.width);
            const height = Number(candidate.height);
            if (!Number.isFinite(width) || !Number.isFinite(height)) continue;
            return { ...candidate, width, height };
        }
        return null;
    }

    function captureActiveInput() {
        const active = document.activeElement;
        if (!active || !refs.panel?.contains(active)) return null;
        if (!(active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement)) return null;
        const key = active.dataset.preserveKey;
        if (!key) return null;
        return {
            key,
            selectionStart: typeof active.selectionStart === 'number' ? active.selectionStart : null,
            selectionEnd: typeof active.selectionEnd === 'number' ? active.selectionEnd : null
        };
    }

    function restoreActiveInput(snapshot) {
        if (!snapshot?.key) return;
        const target = refs.panel?.querySelector(`[data-preserve-key="${snapshot.key}"]`);
        if (!target || typeof target.focus !== 'function') return;
        try {
            target.focus({ preventScroll: true });
        } catch (err) {
            target.focus();
        }
        if (typeof snapshot.selectionStart === 'number' && typeof snapshot.selectionEnd === 'number' && typeof target.setSelectionRange === 'function') {
            try {
                target.setSelectionRange(snapshot.selectionStart, snapshot.selectionEnd);
            } catch (err) {
                // Ignore selection errors for input types that do not support setSelectionRange.
            }
        }
    }

    function createEmptyGrid(width, height, fill = 0) {
        return Array.from({ length: height }, () => Array.from({ length: width }, () => fill));
    }

    function createEmptyMeta(width, height) {
        return Array.from({ length: height }, () => Array.from({ length: width }, () => null));
    }

    function cloneGrid(grid) {
        return grid.map(row => row.slice());
    }

    function cloneMetaGrid(meta) {
        if (!Array.isArray(meta)) return [];
        return meta.map(row => Array.isArray(row) ? row.map(cell => (cell ? { ...cell } : null)) : []);
    }

    function sanitizeColorValue(value) {
        if (typeof value !== 'string') return '';
        const trimmed = value.trim();
        if (!trimmed) return '';
        return COLOR_HEX_PATTERN.test(trimmed) ? trimmed.toLowerCase() : '';
    }

    function parseHexColor(value) {
        const hex = sanitizeColorValue(value);
        if (!hex) return null;
        let r;
        let g;
        let b;
        if (hex.length === 4 || hex.length === 5) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length === 7 || hex.length === 9) {
            r = parseInt(hex.slice(1, 3), 16);
            g = parseInt(hex.slice(3, 5), 16);
            b = parseInt(hex.slice(5, 7), 16);
        } else {
            return null;
        }
        if ([r, g, b].some(v => Number.isNaN(v))) return null;
        return { r, g, b };
    }

    function getTextColorForBackground(color) {
        const rgb = parseHexColor(color);
        if (!rgb) return '#1f2937';
        const sr = rgb.r / 255;
        const sg = rgb.g / 255;
        const sb = rgb.b / 255;
        const toLinear = (value) => (value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4));
        const luminance = 0.2126 * toLinear(sr) + 0.7152 * toLinear(sg) + 0.0722 * toLinear(sb);
        return luminance > 0.45 ? '#1f2937' : '#f8fafc';
    }

    function getFloorFillColor(meta) {
        if (meta?.floorColor) return meta.floorColor;
        if (meta?.floorType && FLOOR_TYPE_COLORS[meta.floorType]) {
            return FLOOR_TYPE_COLORS[meta.floorType];
        }
        return GRID_DEFAULT_FLOOR_COLOR;
    }

    function getWallFillColor(meta) {
        if (meta?.wallColor) return meta.wallColor;
        return GRID_DEFAULT_WALL_COLOR;
    }

    function normalizeMetaObject(meta, isFloor) {
        if (!meta || typeof meta !== 'object') return null;
        const result = {};
        if (isFloor) {
            const type = typeof meta.floorType === 'string' ? meta.floorType.trim().toLowerCase() : '';
            if (FLOOR_TYPES.includes(type) && type !== 'normal') {
                result.floorType = type;
            }
            const floorColor = sanitizeColorValue(meta.floorColor);
            if (floorColor) {
                result.floorColor = floorColor;
            }
        }
        const wallColor = sanitizeColorValue(meta.wallColor);
        if (!isFloor && wallColor) {
            result.wallColor = wallColor;
        }
        return Object.keys(result).length ? result : null;
    }

    function metaEquals(a, b) {
        if (!a && !b) return true;
        if (!a || !b) return false;
        const keys = ['floorType', 'floorColor', 'wallColor'];
        for (const key of keys) {
            if ((a[key] || null) !== (b[key] || null)) return false;
        }
        return true;
    }

    function ensureMetaRow(y) {
        if (!state.meta) {
            state.meta = createEmptyMeta(state.width, state.height);
        }
        if (!Array.isArray(state.meta[y])) {
            state.meta[y] = Array.from({ length: state.width }, () => null);
        }
        return state.meta[y];
    }

    function computeFloorMetaFromSettings() {
        const settings = state.brushSettings || {};
        const type = typeof settings.floorType === 'string' ? settings.floorType : 'normal';
        const result = {};
        if (FLOOR_TYPES.includes(type) && type !== 'normal') {
            result.floorType = type;
        }
        const floorColor = sanitizeColorValue(settings.floorColor);
        if (floorColor) {
            result.floorColor = floorColor;
        }
        return Object.keys(result).length ? result : null;
    }

    function computeWallMetaFromSettings() {
        const settings = state.brushSettings || {};
        const wallColor = sanitizeColorValue(settings.wallColor);
        if (!wallColor) return null;
        return { wallColor };
    }

    function applyFloorMetaToCell(x, y, options = {}) {
        const { useBrushSettings = true } = options;
        const row = ensureMetaRow(y);
        const previous = row[x] ? { ...row[x] } : null;
        const prevNormalized = normalizeMetaObject(previous, true);
        const desired = useBrushSettings ? computeFloorMetaFromSettings() : prevNormalized;
        const changed = !metaEquals(prevNormalized, desired) || (!!previous !== !!desired);
        row[x] = desired;
        return changed || (!!previous && !metaEquals(previous, desired));
    }

    function applyWallMetaToCell(x, y) {
        const row = ensureMetaRow(y);
        const previous = row[x] ? { ...row[x] } : null;
        const prevNormalized = normalizeMetaObject(previous, false);
        const desired = computeWallMetaFromSettings();
        const changed = !metaEquals(prevNormalized, desired) || (!!previous !== !!desired);
        row[x] = desired;
        return changed || (!!previous && !metaEquals(previous, desired));
    }

    function defaultEnemyStats(level) {
        const lvl = clamp(1, Bridge?.maxLevel || 999, Math.floor(Number(level) || 1));
        return {
            hp: 50 + 5 * (lvl - 1),
            attack: 8 + (lvl - 1),
            defense: 8 + (lvl - 1)
        };
    }

    function buildConfigFromState() {
        return {
            width: state.width,
            height: state.height,
            grid: cloneGrid(state.grid),
            playerStart: state.playerStart ? { ...state.playerStart } : null,
            stairs: state.stairs ? { ...state.stairs } : null,
            playerLevel: state.playerLevel,
            enemies: state.enemies.map(e => ({
                id: e.id,
                name: e.name,
                level: e.level,
                hp: e.hp,
                attack: e.attack,
                defense: e.defense,
                boss: !!e.boss,
                x: Number.isFinite(e.x) ? e.x : null,
                y: Number.isFinite(e.y) ? e.y : null
            })),
            tileMeta: cloneMetaGrid(state.meta)
        };
    }

    function exportSerializedState() {
        if (!state) {
            return pendingSerializedState ? { ...pendingSerializedState } : null;
        }
        return {
            width: state.width,
            height: state.height,
            grid: cloneGrid(state.grid || []),
            playerStart: state.playerStart ? { ...state.playerStart } : null,
            stairs: state.stairs ? { ...state.stairs } : null,
            playerLevel: state.playerLevel,
            enemies: state.enemies.map(enemy => ({
                id: enemy.id,
                name: enemy.name,
                level: enemy.level,
                hp: enemy.hp,
                attack: enemy.attack,
                defense: enemy.defense,
                boss: !!enemy.boss,
                x: Number.isFinite(enemy.x) ? enemy.x : null,
                y: Number.isFinite(enemy.y) ? enemy.y : null
            })),
            tileMeta: cloneMetaGrid(state.meta),
            selectedEnemyId: state.selectedEnemyId || null,
            brush: state.brush,
            lastCell: state.lastCell ? { ...state.lastCell } : null,
            validation: {
                errors: Array.isArray(state.validation?.errors) ? state.validation.errors.slice() : [],
                warnings: Array.isArray(state.validation?.warnings) ? state.validation.warnings.slice() : []
            },
            tempMessage: state.tempMessage || '',
            brushSettings: state.brushSettings ? { ...state.brushSettings } : { floorType: 'normal', floorColor: '', wallColor: '' }
        };
    }

    function normalizePosition(pos, width, height) {
        if (!pos || typeof pos !== 'object') return null;
        const x = Math.floor(Number(pos.x));
        const y = Math.floor(Number(pos.y));
        if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
        if (x < 0 || x >= width || y < 0 || y >= height) return null;
        return { x, y };
    }

    function normalizeEnemies(list, width, height, maxLevel) {
        if (!Array.isArray(list)) return [];
        const enemies = [];
        for (const enemy of list) {
            if (!enemy || typeof enemy !== 'object') continue;
            const lvl = clamp(1, maxLevel, Math.floor(Number(enemy.level) || DEFAULT_LEVEL));
            const stats = defaultEnemyStats(lvl);
            const norm = {
                id: typeof enemy.id === 'string' ? enemy.id : null,
                name: typeof enemy.name === 'string' ? enemy.name : '',
                level: lvl,
                hp: clamp(1, Number.MAX_SAFE_INTEGER, Math.floor(Number(enemy.hp) || stats.hp)),
                attack: clamp(0, Number.MAX_SAFE_INTEGER, Math.floor(Number(enemy.attack) || stats.attack)),
                defense: clamp(0, Number.MAX_SAFE_INTEGER, Math.floor(Number(enemy.defense) || stats.defense)),
                boss: !!enemy.boss,
                x: null,
                y: null
            };
            const pos = normalizePosition(enemy, width, height);
            if (pos) {
                norm.x = pos.x;
                norm.y = pos.y;
            }
            enemies.push(norm);
        }
        return enemies;
    }

    function normalizeSerializedState(serialized) {
        const minSize = Bridge?.minSize || MIN_SIZE_FALLBACK;
        const maxSize = Bridge?.maxSize || MAX_SIZE_FALLBACK;
        const maxLevel = Bridge?.maxLevel || MAX_LEVEL_FALLBACK;
        const width = clamp(minSize, maxSize, Math.floor(Number(serialized?.width) || DEFAULT_WIDTH));
        const height = clamp(minSize, maxSize, Math.floor(Number(serialized?.height) || DEFAULT_HEIGHT));
        const grid = createEmptyGrid(width, height, 1);
        if (Array.isArray(serialized?.grid)) {
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const cell = serialized.grid?.[y]?.[x];
                    grid[y][x] = cell === 0 ? 0 : 1;
                }
            }
        }
        const metaSource = Array.isArray(serialized?.tileMeta) ? serialized.tileMeta : serialized?.meta;
        const tileMeta = createEmptyMeta(width, height);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const src = metaSource?.[y]?.[x];
                tileMeta[y][x] = normalizeMetaObject(src, grid[y][x] === 0);
            }
        }
        const playerLevel = clamp(1, maxLevel, Math.floor(Number(serialized?.playerLevel) || DEFAULT_LEVEL));
        const rawBrush = serialized?.brushSettings || {};
        const rawFloorType = typeof rawBrush.floorType === 'string' ? rawBrush.floorType.toLowerCase() : '';
        const brushSettings = {
            floorType: FLOOR_TYPES.includes(rawFloorType) ? rawFloorType : 'normal',
            floorColor: sanitizeColorValue(rawBrush.floorColor),
            wallColor: sanitizeColorValue(rawBrush.wallColor)
        };
        return {
            width,
            height,
            grid,
            meta: tileMeta,
            playerStart: normalizePosition(serialized?.playerStart, width, height),
            stairs: normalizePosition(serialized?.stairs, width, height),
            lastCell: normalizePosition(serialized?.lastCell, width, height),
            playerLevel,
            enemies: normalizeEnemies(serialized?.enemies, width, height, maxLevel),
            selectedEnemyId: typeof serialized?.selectedEnemyId === 'string' ? serialized.selectedEnemyId : null,
            brush: BRUSHES.includes(serialized?.brush) ? serialized.brush : 'floor',
            validation: {
                errors: Array.isArray(serialized?.validation?.errors) ? serialized.validation.errors.map(e => String(e)) : [],
                warnings: Array.isArray(serialized?.validation?.warnings) ? serialized.validation.warnings.map(w => String(w)) : []
            },
            tempMessage: typeof serialized?.tempMessage === 'string' ? serialized.tempMessage : '',
            brushSettings
        };
    }

    function importSerializedState(serialized) {
        const payload = normalizeSerializedState(serialized);
        if (!state) {
            pendingSerializedState = payload;
            return true;
        }
        state.width = payload.width;
        state.height = payload.height;
        state.grid = cloneGrid(payload.grid);
        state.meta = cloneMetaGrid(payload.meta);
        ensureStateGridSize(state.width, state.height);
        state.grid = cloneGrid(payload.grid);
        state.meta = cloneMetaGrid(payload.meta);
        state.playerStart = payload.playerStart;
        state.stairs = payload.stairs;
        state.playerLevel = payload.playerLevel;
        state.enemies = payload.enemies.map(enemy => ({ ...enemy, id: enemy.id || `enemy-${enemySeq++}` }));
        state.selectedEnemyId = payload.selectedEnemyId;
        state.brush = payload.brush;
        state.lastCell = payload.lastCell;
        state.brushSettings = { ...payload.brushSettings };
        state.validation = {
            errors: payload.validation.errors.slice(),
            warnings: payload.validation.warnings.slice()
        };
        state.compiledConfig = null;
        state.tempMessage = payload.tempMessage;
        state.ioStatus = { type: 'idle', message: '' };
        if (refs.widthInput) refs.widthInput.value = state.width;
        if (refs.heightInput) refs.heightInput.value = state.height;
        if (refs.playerLevelInput) refs.playerLevelInput.value = state.playerLevel;
        const maxEnemyId = state.enemies.reduce((max, enemy) => {
            const match = typeof enemy.id === 'string' ? enemy.id.match(/(\d+)$/) : null;
            const num = match ? Number(match[1]) : NaN;
            return Number.isFinite(num) ? Math.max(max, num) : max;
        }, 0);
        enemySeq = Math.max(enemySeq, maxEnemyId + 1);
        render();
        return true;
    }

    function ensureStateGridSize(width, height) {
        const newGrid = createEmptyGrid(width, height, 1);
        const newMeta = createEmptyMeta(width, height);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                newGrid[y][x] = state.grid?.[y]?.[x] === 0 ? 0 : 1;
                const prevMeta = state.meta?.[y]?.[x];
                newMeta[y][x] = normalizeMetaObject(prevMeta, newGrid[y][x] === 0);
            }
        }
        state.grid = newGrid;
        state.meta = newMeta;
        const clampPos = (pos) => {
            if (!pos) return null;
            if (pos.x < 0 || pos.x >= width || pos.y < 0 || pos.y >= height) return null;
            return pos;
        };
        state.playerStart = clampPos(state.playerStart);
        state.stairs = clampPos(state.stairs);
        if (state.lastCell && (state.lastCell.x < 0 || state.lastCell.x >= width || state.lastCell.y < 0 || state.lastCell.y >= height)) {
            state.lastCell = null;
        }
        state.enemies = state.enemies.map(enemy => {
            if (!Number.isFinite(enemy.x) || !Number.isFinite(enemy.y)) {
                return { ...enemy, x: null, y: null };
            }
            if (enemy.x < 0 || enemy.x >= width || enemy.y < 0 || enemy.y >= height) {
                return { ...enemy, x: null, y: null };
            }
            return enemy;
        });
    }

    function setBrush(brush) {
        if (!BRUSHES.includes(brush)) return;
        state.brush = brush;
        updateBrushButtons();
        updateGridCursor();
    }

    function setSelectedCell(x, y) {
        state.lastCell = { x, y };
        updateSelectedCellLabel();
        syncBrushControls();
    }

    function applyBrushToCell(x, y, options = {}) {
        if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
        if (x < 0 || y < 0 || x >= state.width || y >= state.height) return false;
        const { updateSelection = true } = options;
        if (updateSelection) {
            setSelectedCell(x, y);
        }
        let changed = false;
        const brush = state.brush;
        if (brush === 'select') {
            return false;
        }
        if (brush === 'floor') {
            if (state.grid[y][x] !== 0) {
                state.grid[y][x] = 0;
                changed = true;
            }
            if (applyFloorMetaToCell(x, y)) changed = true;
        } else if (brush === 'wall') {
            if (state.grid[y][x] !== 1) {
                state.grid[y][x] = 1;
                changed = true;
            }
            if (state.playerStart && state.playerStart.x === x && state.playerStart.y === y) {
                state.playerStart = null;
                changed = true;
            }
            if (state.stairs && state.stairs.x === x && state.stairs.y === y) {
                state.stairs = null;
                changed = true;
            }
            let enemyChanged = false;
            state.enemies = state.enemies.map(enemy => {
                if (enemy.x === x && enemy.y === y) {
                    enemyChanged = true;
                    return { ...enemy, x: null, y: null };
                }
                return enemy;
            });
            if (enemyChanged) changed = true;
            if (applyWallMetaToCell(x, y)) changed = true;
        } else if (brush === 'start') {
            if (state.grid[y][x] !== 0) {
                state.grid[y][x] = 0;
                changed = true;
            }
            if (!state.playerStart || state.playerStart.x !== x || state.playerStart.y !== y) {
                state.playerStart = { x, y };
                changed = true;
            }
            if (applyFloorMetaToCell(x, y, { useBrushSettings: false })) changed = true;
        } else if (brush === 'stairs') {
            if (state.grid[y][x] !== 0) {
                state.grid[y][x] = 0;
                changed = true;
            }
            if (!state.stairs || state.stairs.x !== x || state.stairs.y !== y) {
                state.stairs = { x, y };
                changed = true;
            }
            if (applyFloorMetaToCell(x, y, { useBrushSettings: false })) changed = true;
        } else if (brush === 'enemy') {
            if (!state.selectedEnemyId) {
                state.tempMessage = '敵配置ブラシを使う前に敵を選択してください。';
                renderValidation();
                return false;
            }
            const enemy = state.enemies.find(e => e.id === state.selectedEnemyId);
            if (enemy) {
                if (state.grid[y][x] !== 0) {
                    state.grid[y][x] = 0;
                    changed = true;
                }
                if (enemy.x !== x || enemy.y !== y) {
                    enemy.x = x;
                    enemy.y = y;
                    changed = true;
                }
                if (applyFloorMetaToCell(x, y, { useBrushSettings: false })) changed = true;
            }
        }
        return changed;
    }

    function drawRoundedRect(ctx, x, y, width, height, radius, fillStyle, strokeStyle, strokeWidth) {
        const r = Math.max(0, Math.min(radius, width / 2, height / 2));
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + width - r, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + r);
        ctx.lineTo(x + width, y + height - r);
        ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
        ctx.lineTo(x + r, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        if (fillStyle) {
            ctx.fillStyle = fillStyle;
            ctx.fill();
        }
        if (strokeStyle && strokeWidth > 0) {
            ctx.strokeStyle = strokeStyle;
            ctx.lineWidth = strokeWidth;
            ctx.stroke();
        }
    }

    function describeCell(x, y) {
        if (!state || !Array.isArray(state.grid) || !Array.isArray(state.grid[y]) || typeof state.grid[y][x] === 'undefined') {
            return '';
        }
        const cell = state.grid[y][x];
        const meta = state.meta?.[y]?.[x] || null;
        const baseLabel = `${cell === 0 ? '床' : '壁'} (${x}, ${y})`;
        const detailParts = [];
        if (state.playerStart && state.playerStart.x === x && state.playerStart.y === y) {
            detailParts.push('開始位置');
        }
        if (state.stairs && state.stairs.x === x && state.stairs.y === y) {
            detailParts.push('階段');
        }
        if (cell === 0) {
            if (meta?.floorType === 'ice') {
                detailParts.push('床タイプ: 氷');
            } else if (meta?.floorType === 'poison') {
                detailParts.push('床タイプ: 毒');
            }
            if (meta?.floorColor) {
                detailParts.push(`床色: ${meta.floorColor}`);
            }
        } else if (meta?.wallColor) {
            detailParts.push(`壁色: ${meta.wallColor}`);
        }
        const enemiesHere = Array.isArray(state.enemies) ? state.enemies.filter(e => e.x === x && e.y === y) : [];
        if (enemiesHere.length) {
            let enemyDetail = '';
            if (enemiesHere.length === 1) {
                const enemy = enemiesHere[0];
                const name = (enemy.name || '').trim();
                if (name) {
                    enemyDetail = `敵: ${name}${enemy.boss ? '（ボス）' : ''}`;
                } else {
                    enemyDetail = enemy.boss ? '敵: ボス1体' : '敵: 1体';
                }
            } else {
                const nameParts = enemiesHere
                    .map(e => {
                        const nm = (e.name || '').trim();
                        return nm ? `${nm}${e.boss ? '（ボス）' : ''}` : '';
                    })
                    .filter(Boolean);
                if (nameParts.length === enemiesHere.length) {
                    enemyDetail = `敵: ${nameParts.join('、')}`;
                } else {
                    const bossCount = enemiesHere.filter(e => e.boss).length;
                    if (bossCount && bossCount === enemiesHere.length) {
                        enemyDetail = `敵: ボス${enemiesHere.length}体`;
                    } else if (bossCount) {
                        enemyDetail = `敵: ${enemiesHere.length}体（ボス${bossCount}体含む）`;
                    } else {
                        enemyDetail = `敵: ${enemiesHere.length}体`;
                    }
                }
            }
            detailParts.push(enemyDetail);
        }
        return detailParts.length ? `${baseLabel} - ${detailParts.join(' / ')}` : baseLabel;
    }

    function renderGrid() {
        const gridEl = refs.grid;
        const canvas = refs.gridCanvas;
        if (!gridEl || !canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const cellSize = RENDER_CELL_SIZE;
        const gap = RENDER_CELL_GAP;
        const widthPx = state.width * cellSize + Math.max(0, state.width - 1) * gap;
        const heightPx = state.height * cellSize + Math.max(0, state.height - 1) * gap;
        const displayWidth = Math.max(1, Math.round(widthPx));
        const displayHeight = Math.max(1, Math.round(heightPx));
        const dpr = global.devicePixelRatio || 1;
        const scaledWidth = Math.max(1, Math.round(displayWidth * dpr));
        const scaledHeight = Math.max(1, Math.round(displayHeight * dpr));

        if (canvas.width !== scaledWidth || canvas.height !== scaledHeight) {
            canvas.width = scaledWidth;
            canvas.height = scaledHeight;
        }
        if (canvas.style.width !== `${displayWidth}px`) {
            canvas.style.width = `${displayWidth}px`;
        }
        if (canvas.style.height !== `${displayHeight}px`) {
            canvas.style.height = `${displayHeight}px`;
        }

        if (typeof ctx.resetTransform === 'function') {
            ctx.resetTransform();
        } else {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (dpr !== 1) {
            ctx.scale(dpr, dpr);
        }

        ctx.fillStyle = GRID_BACKGROUND_COLOR;
        ctx.fillRect(0, 0, displayWidth, displayHeight);
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        state.renderMetrics = {
            cellSize,
            gap,
            width: displayWidth,
            height: displayHeight
        };

        gridEl.setAttribute('aria-rowcount', String(state.height));
        gridEl.setAttribute('aria-colcount', String(state.width));

        for (let y = 0; y < state.height; y++) {
            for (let x = 0; x < state.width; x++) {
                const cellValue = state.grid?.[y]?.[x] ?? 0;
                const meta = state.meta?.[y]?.[x] || null;
                const isFloor = cellValue === 0;
                const baseColor = isFloor ? getFloorFillColor(meta) : getWallFillColor(meta);
                const baseStroke = isFloor ? GRID_BORDER_FLOOR : GRID_BORDER_WALL;
                const originX = x * (cellSize + gap);
                const originY = y * (cellSize + gap);
                drawRoundedRect(ctx, originX, originY, cellSize, cellSize, RENDER_CELL_RADIUS, baseColor, baseStroke, 1.2);

                const isStart = state.playerStart && state.playerStart.x === x && state.playerStart.y === y;
                const isStairs = state.stairs && state.stairs.x === x && state.stairs.y === y;
                const enemiesHere = Array.isArray(state.enemies) ? state.enemies.filter(e => e.x === x && e.y === y) : [];
                const hasSelectedEnemy = state.selectedEnemyId && enemiesHere.some(e => e.id === state.selectedEnemyId);

                if (isStart) {
                    drawRoundedRect(ctx, originX, originY, cellSize, cellSize, RENDER_CELL_RADIUS, null, GRID_START_COLOR, 2.4);
                }
                if (isStairs) {
                    drawRoundedRect(ctx, originX, originY, cellSize, cellSize, RENDER_CELL_RADIUS, null, GRID_STAIRS_COLOR, 2.4);
                }
                if (hasSelectedEnemy) {
                    drawRoundedRect(ctx, originX, originY, cellSize, cellSize, RENDER_CELL_RADIUS, null, GRID_SELECTED_ENEMY_COLOR, 2.6);
                }
                if (state.lastCell && state.lastCell.x === x && state.lastCell.y === y) {
                    drawRoundedRect(ctx, originX, originY, cellSize, cellSize, RENDER_CELL_RADIUS, null, GRID_SELECTION_COLOR, 2);
                }

                let icon = '';
                let iconColor = getTextColorForBackground(baseColor);
                let fontSize = Math.floor(cellSize * 0.58);
                if (isStart) {
                    icon = '★';
                    iconColor = '#ffffff';
                    fontSize = Math.floor(cellSize * 0.65);
                }
                if (isStairs) {
                    icon = '⬆';
                    iconColor = '#1f2937';
                    fontSize = Math.floor(cellSize * 0.6);
                }
                if (!icon && enemiesHere.length) {
                    icon = enemiesHere.length > 1 ? `✦${enemiesHere.length}` : '✦';
                    fontSize = enemiesHere.length > 1 ? Math.floor(cellSize * 0.5) : Math.floor(cellSize * 0.6);
                    iconColor = getTextColorForBackground(baseColor);
                }

                if (icon) {
                    ctx.font = `700 ${fontSize}px 'Segoe UI', 'Hiragino Sans', 'ヒラギノ角ゴ ProN', 'Noto Sans JP', sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = iconColor;
                    const textOffsetY = icon === '⬆' ? -cellSize * 0.05 : 0;
                    ctx.fillText(icon, originX + cellSize / 2, originY + cellSize / 2 + textOffsetY);
                }
            }
        }
    }

    function getCellFromOffset(offsetX, offsetY) {
        const metrics = state?.renderMetrics || {};
        const cellSize = metrics.cellSize || RENDER_CELL_SIZE;
        const gap = typeof metrics.gap === 'number' ? metrics.gap : RENDER_CELL_GAP;
        if (offsetX < 0 || offsetY < 0) return null;
        const totalWidth = cellSize + gap;
        const totalHeight = cellSize + gap;
        const x = Math.floor(offsetX / totalWidth);
        const y = Math.floor(offsetY / totalHeight);
        if (x < 0 || y < 0 || x >= state.width || y >= state.height) return null;
        const withinX = offsetX - x * totalWidth;
        const withinY = offsetY - y * totalHeight;
        if (withinX >= cellSize || withinY >= cellSize) return null;
        return { x, y };
    }

    function getCellFromEvent(event) {
        const canvas = refs.gridCanvas;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return null;
        const metrics = state?.renderMetrics || {};
        const displayWidth = metrics.width || rect.width;
        const displayHeight = metrics.height || rect.height;
        const offsetX = ((event.clientX - rect.left) / rect.width) * displayWidth;
        const offsetY = ((event.clientY - rect.top) / rect.height) * displayHeight;
        return getCellFromOffset(offsetX, offsetY);
    }

    function updateBrushButtons() {
        if (!refs.brushButtons?.length) return;
        refs.brushButtons.forEach(btn => {
            const active = btn.dataset.brush === state.brush;
            btn.setAttribute('aria-pressed', active ? 'true' : 'false');
            btn.classList.toggle('active', active);
        });
    }

    function updateGridCursor() {
        if (!refs.gridCanvas) return;
        const cursor = BRUSH_CURSOR[state.brush] || 'pointer';
        if (refs.gridCanvas.style.cursor !== cursor) {
            refs.gridCanvas.style.cursor = cursor;
        }
    }

    function updateSelectedCellLabel() {
        const fallbackText = 'セルをクリックして編集します。';
        const description = state.lastCell ? describeCell(state.lastCell.x, state.lastCell.y) : '';
        if (refs.selectedCell) {
            if (state.lastCell && description) {
                refs.selectedCell.textContent = `選択セル: ${description}`;
            } else if (state.lastCell) {
                refs.selectedCell.textContent = `選択セル: (${state.lastCell.x}, ${state.lastCell.y})`;
            } else {
                refs.selectedCell.textContent = fallbackText;
            }
        }
        if (refs.gridAria) {
            if (state.lastCell && description) {
                refs.gridAria.textContent = description;
            } else {
                refs.gridAria.textContent = fallbackText;
            }
        }
    }

    function updateColorInput(input, hintEl, color, fallback) {
        if (!input) return;
        const sanitized = sanitizeColorValue(color);
        const hasCustom = !!sanitized;
        const value = hasCustom ? sanitized : fallback;
        if (input.value !== value) {
            input.value = value;
        }
        input.dataset.hasCustom = hasCustom ? 'true' : 'false';
        if (hintEl) {
            hintEl.textContent = hasCustom ? sanitized : '自動';
        }
    }

    function syncBrushControls() {
        if (!refs.brushFloorType) return;
        const settings = state.brushSettings || { floorType: 'normal', floorColor: '', wallColor: '' };
        let floorType = settings.floorType;
        let floorColor = settings.floorColor;
        let wallColor = settings.wallColor;
        if (state.lastCell) {
            const { x, y } = state.lastCell;
            const isFloor = state.grid?.[y]?.[x] === 0;
            const meta = state.meta?.[y]?.[x] || null;
            if (isFloor) {
                floorType = meta?.floorType || 'normal';
                floorColor = meta?.floorColor || '';
            }
            if (!isFloor) {
                wallColor = meta?.wallColor || '';
            }
        }
        if (!FLOOR_TYPES.includes(floorType)) {
            floorType = 'normal';
        }
        refs.brushFloorType.value = floorType;
        updateColorInput(refs.brushFloorColor, refs.floorColorHint, floorColor, DEFAULT_FLOOR_COLOR);
        updateColorInput(refs.brushWallColor, refs.wallColorHint, wallColor, DEFAULT_WALL_COLOR);
    }

    function renderPlayerPreview() {
        if (!refs.playerPreview || !Bridge) return;
        const stats = Bridge.computePlayerStats ? Bridge.computePlayerStats(state.playerLevel) : { maxHp: 100, attack: 10, defense: 10, level: state.playerLevel };
        refs.playerPreview.textContent = `HP ${stats.maxHp} / 攻撃 ${stats.attack} / 防御 ${stats.defense}`;
    }

    function renderEnemies() {
        if (!refs.enemyList) return;
        refs.enemyList.innerHTML = '';
        if (!state.enemies.length) {
            const empty = document.createElement('p');
            empty.textContent = '敵は未配置です。「敵を追加」ボタンから追加してください。';
            empty.className = 'sandbox-note';
            refs.enemyList.appendChild(empty);
            state.selectedEnemyId = null;
            return;
        }
        if (!state.selectedEnemyId || !state.enemies.some(e => e.id === state.selectedEnemyId)) {
            state.selectedEnemyId = state.enemies[0].id;
        }
        const maxLevel = Bridge?.maxLevel || 999;
        state.enemies.forEach((enemy, index) => {
            const card = document.createElement('div');
            card.className = 'sandbox-enemy-card';
            if (enemy.id === state.selectedEnemyId) {
                card.classList.add('selected');
            }
            card.dataset.enemyId = enemy.id;

            const header = document.createElement('div');
            header.className = 'sandbox-enemy-header';
            const title = document.createElement('h5');
            title.textContent = enemy.name || `敵${index + 1}`;
            header.appendChild(title);

            const actions = document.createElement('div');
            actions.className = 'sandbox-enemy-actions';
            const selectBtn = document.createElement('button');
            selectBtn.type = 'button';
            selectBtn.className = 'select';
            selectBtn.textContent = '選択';
            selectBtn.addEventListener('click', () => {
                state.selectedEnemyId = enemy.id;
                render();
            });
            actions.appendChild(selectBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'delete';
            deleteBtn.textContent = '削除';
            deleteBtn.addEventListener('click', () => {
                state.enemies = state.enemies.filter(e => e.id !== enemy.id);
                if (state.selectedEnemyId === enemy.id) {
                    state.selectedEnemyId = state.enemies[0]?.id || null;
                }
                render();
            });
            actions.appendChild(deleteBtn);
            header.appendChild(actions);
            card.appendChild(header);

            const grid = document.createElement('div');
            grid.className = 'sandbox-enemy-grid';

            const fields = [
                {
                    key: 'name',
                    label: '名前',
                    type: 'text',
                    value: enemy.name || '',
                    handler: (val) => { enemy.name = val; render(); }
                },
                {
                    key: 'level',
                    label: 'レベル',
                    type: 'number',
                    value: enemy.level,
                    attrs: { min: 1, max: maxLevel },
                    handler: (val) => {
                        enemy.level = clamp(1, maxLevel, Math.floor(Number(val) || 1));
                        render();
                    }
                },
                {
                    key: 'hp',
                    label: 'HP',
                    type: 'number',
                    value: enemy.hp,
                    attrs: { min: 1 },
                    handler: (val) => {
                        enemy.hp = Math.max(1, Math.floor(Number(val) || 1));
                        render();
                    }
                },
                {
                    key: 'attack',
                    label: '攻撃',
                    type: 'number',
                    value: enemy.attack,
                    attrs: { min: 0 },
                    handler: (val) => {
                        enemy.attack = Math.max(0, Math.floor(Number(val) || 0));
                        render();
                    }
                },
                {
                    key: 'defense',
                    label: '防御',
                    type: 'number',
                    value: enemy.defense,
                    attrs: { min: 0 },
                    handler: (val) => {
                        enemy.defense = Math.max(0, Math.floor(Number(val) || 0));
                        render();
                    }
                },
                {
                    key: 'x',
                    label: 'X座標',
                    type: 'number',
                    value: Number.isFinite(enemy.x) ? enemy.x : '',
                    attrs: { min: 0, max: state.width - 1 },
                    handler: (val) => {
                        if (val === '') {
                            enemy.x = null;
                            render();
                            return;
                        }
                        const parsed = Math.floor(Number(val));
                        enemy.x = clamp(0, state.width - 1, parsed);
                        render();
                    }
                },
                {
                    key: 'y',
                    label: 'Y座標',
                    type: 'number',
                    value: Number.isFinite(enemy.y) ? enemy.y : '',
                    attrs: { min: 0, max: state.height - 1 },
                    handler: (val) => {
                        if (val === '') {
                            enemy.y = null;
                            render();
                            return;
                        }
                        const parsed = Math.floor(Number(val));
                        enemy.y = clamp(0, state.height - 1, parsed);
                        render();
                    }
                }
            ];

            fields.forEach(field => {
                const wrapper = document.createElement('label');
                wrapper.textContent = field.label;
                const input = document.createElement('input');
                input.type = field.type;
                input.value = field.value;
                input.dataset.preserveKey = `enemy-${enemy.id}-${field.key}`;
                if (field.attrs) {
                    Object.keys(field.attrs).forEach(key => {
                        input.setAttribute(key, field.attrs[key]);
                    });
                }
                input.addEventListener('input', (e) => {
                    field.handler(e.target.value);
                });
                wrapper.appendChild(input);
                grid.appendChild(wrapper);
            });

            const bossLabel = document.createElement('label');
            bossLabel.className = 'checkbox';
            const bossInput = document.createElement('input');
            bossInput.type = 'checkbox';
            bossInput.checked = !!enemy.boss;
            bossInput.addEventListener('change', () => {
                enemy.boss = !!bossInput.checked;
                render();
            });
            bossLabel.appendChild(bossInput);
            bossLabel.appendChild(document.createTextNode('ボス扱い'));
            grid.appendChild(bossLabel);

            card.appendChild(grid);
            refs.enemyList.appendChild(card);
        });
    }

    function renderValidation() {
        if (!refs.validation) return;
        const baseErrors = state.validation?.errors || [];
        const baseWarnings = state.validation?.warnings || [];
        const errors = baseErrors.slice();
        const warnings = baseWarnings.slice();
        const maxEnemies = Number.isFinite(Bridge?.maxEnemies) ? Bridge.maxEnemies : null;
        if (maxEnemies !== null && state.enemies.length >= maxEnemies) {
            const limitMsg = state.enemies.length > maxEnemies
                ? `敵の上限（${maxEnemies}体）を超えています。敵を減らしてください。`
                : `敵の上限（${maxEnemies}体）に達しています。新たに追加するには既存の敵を削除してください。`;
            if (state.enemies.length > maxEnemies) {
                errors.push(limitMsg);
            } else {
                warnings.push(limitMsg);
            }
        }
        const tempMsg = state.tempMessage;
        refs.validation.innerHTML = '';
        const list = document.createElement('ul');
        list.style.margin = '0';
        list.style.paddingLeft = '18px';
        let severity = 'info';
        if (errors.length) {
            severity = 'error';
            errors.forEach(msg => {
                const li = document.createElement('li');
                li.textContent = msg;
                list.appendChild(li);
            });
        } else if (warnings.length) {
            severity = 'warning';
            warnings.forEach(msg => {
                const li = document.createElement('li');
                li.textContent = msg;
                list.appendChild(li);
            });
        }
        if (tempMsg) {
            const li = document.createElement('li');
            li.textContent = tempMsg;
            list.appendChild(li);
            state.tempMessage = '';
            if (severity === 'info') severity = 'warning';
        }
        if (list.childElementCount) {
            refs.validation.appendChild(list);
        } else {
            const ok = document.createElement('span');
            ok.textContent = '✅ 開始できます';
            refs.validation.appendChild(ok);
        }
        if (refs.startButton) {
            refs.startButton.disabled = !!errors.length;
        }
        if (severity === 'error') {
            refs.validation.style.color = '#b91c1c';
        } else if (severity === 'warning') {
            refs.validation.style.color = '#b45309';
        } else {
            refs.validation.style.color = '#15803d';
        }
    }

    function render() {
        if (!Bridge) return;
        const focusSnapshot = captureActiveInput();
        const validation = Bridge.validate(buildConfigFromState()) || { errors: [], warnings: [], config: buildConfigFromState() };
        state.validation = { errors: validation.errors || [], warnings: validation.warnings || [] };
        state.compiledConfig = validation.config || buildConfigFromState();

        renderGrid();
        updateBrushButtons();
        updateGridCursor();
        updateSelectedCellLabel();
        syncBrushControls();
        renderPlayerPreview();
        renderEnemies();
        renderValidation();
        renderIoStatus();
        restoreActiveInput(focusSnapshot);
    }

    function handleGridPointerDown(event) {
        if (typeof event.button === 'number' && event.button !== 0) return;
        const cell = getCellFromEvent(event);
        if (!cell) return;
        paintState.active = true;
        paintState.pointerId = event.pointerId;
        paintState.lastKey = `${cell.x},${cell.y}`;
        paintState.blockClick = true;
        if (refs.gridCanvas && typeof refs.gridCanvas.setPointerCapture === 'function') {
            try {
                refs.gridCanvas.setPointerCapture(event.pointerId);
            } catch (err) {
                // Ignore pointer capture errors (e.g. unsupported browsers).
            }
        }
        event.preventDefault();
        applyBrushToCell(cell.x, cell.y, { updateSelection: true });
        render();
    }

    function handleGridPointerMove(event) {
        if (!paintState.active || paintState.pointerId !== event.pointerId) return;
        const cell = getCellFromEvent(event);
        if (!cell) return;
        const key = `${cell.x},${cell.y}`;
        if (key === paintState.lastKey) return;
        paintState.lastKey = key;
        applyBrushToCell(cell.x, cell.y, { updateSelection: true });
        render();
    }

    function endPointerPaint(pointerId) {
        if (!paintState.active || paintState.pointerId !== pointerId) return;
        if (refs.gridCanvas && typeof refs.gridCanvas.releasePointerCapture === 'function') {
            try {
                refs.gridCanvas.releasePointerCapture(pointerId);
            } catch (err) {
                // Ignore release errors.
            }
        }
        paintState.active = false;
        paintState.pointerId = null;
        paintState.lastKey = null;
        setTimeout(() => { paintState.blockClick = false; }, 0);
    }

    function handleGlobalPointerUp(event) {
        endPointerPaint(event.pointerId);
    }

    function handleGridClick(event) {
        if (paintState.blockClick) {
            paintState.blockClick = false;
            event.preventDefault();
            return;
        }
        const cell = getCellFromEvent(event);
        if (!cell) return;
        applyBrushToCell(cell.x, cell.y, { updateSelection: true });
        render();
    }

    function handleBrushClick(event) {
        const btn = event.currentTarget;
        const brush = btn.dataset.brush;
        setBrush(brush);
    }

    function addEnemy() {
        const maxEnemies = Number.isFinite(Bridge?.maxEnemies) ? Bridge.maxEnemies : null;
        if (maxEnemies !== null && state.enemies.length >= maxEnemies) {
            state.tempMessage = `敵の上限（${maxEnemies}体）に達しています。新たに追加するには既存の敵を削除してください。`;
            renderValidation();
            return;
        }
        const id = `enemy-${enemySeq++}`;
        const stats = defaultEnemyStats(state.playerLevel);
        const enemy = {
            id,
            name: `敵${state.enemies.length + 1}`,
            level: state.playerLevel,
            hp: stats.hp,
            attack: stats.attack,
            defense: stats.defense,
            boss: false,
            x: state.lastCell?.x ?? null,
            y: state.lastCell?.y ?? null
        };
        state.enemies.push(enemy);
        state.selectedEnemyId = id;
        render();
    }

    function fillGrid(value) {
        state.grid = createEmptyGrid(state.width, state.height, value);
        state.meta = createEmptyMeta(state.width, state.height);
        if (value === 1) {
            state.playerStart = null;
            state.stairs = null;
            state.enemies = state.enemies.map(enemy => ({ ...enemy, x: null, y: null }));
        }
        render();
    }

    function clearMarkers() {
        state.playerStart = null;
        state.stairs = null;
        render();
    }

    function init(panelContext) {
        if (state) return;
        Bridge = global.SandboxBridge;
        if (!Bridge) {
            console.warn('[SandboxTool] SandboxBridge is not ready.');
            return;
        }
        const panel = panelContext?.panel || document.getElementById('tool-sandbox-editor');
        if (!panel) return;

        refs = {
            panel,
            grid: panel.querySelector('#sandbox-grid'),
            gridCanvas: panel.querySelector('#sandbox-grid-canvas'),
            gridAria: panel.querySelector('#sandbox-grid-aria'),
            brushButtons: Array.from(panel.querySelectorAll('.sandbox-brush')),
            selectedCell: panel.querySelector('#sandbox-selected-cell'),
            widthInput: panel.querySelector('#sandbox-width'),
            heightInput: panel.querySelector('#sandbox-height'),
            playerLevelInput: panel.querySelector('#sandbox-player-level'),
            playerPreview: panel.querySelector('#sandbox-player-preview'),
            enemyList: panel.querySelector('#sandbox-enemy-list'),
            addEnemyButton: panel.querySelector('#sandbox-add-enemy'),
            fillFloorButton: panel.querySelector('#sandbox-fill-floor'),
            fillWallButton: panel.querySelector('#sandbox-fill-wall'),
            clearMarkersButton: panel.querySelector('#sandbox-clear-markers'),
            brushFloorType: panel.querySelector('#sandbox-brush-floor-type'),
            brushFloorColor: panel.querySelector('#sandbox-brush-floor-color'),
            brushFloorColorClear: panel.querySelector('#sandbox-brush-floor-color-clear'),
            brushWallColor: panel.querySelector('#sandbox-brush-wall-color'),
            brushWallColorClear: panel.querySelector('#sandbox-brush-wall-color-clear'),
            floorColorHint: panel.querySelector('#sandbox-floor-color-hint'),
            wallColorHint: panel.querySelector('#sandbox-wall-color-hint'),
            validation: panel.querySelector('#sandbox-validation'),
            startButton: panel.querySelector('#sandbox-start-button'),
            exportButton: panel.querySelector('#sandbox-export-button'),
            importButton: panel.querySelector('#sandbox-import-button'),
            importFile: panel.querySelector('#sandbox-import-file'),
            ioStatus: panel.querySelector('#sandbox-io-status')
        };

        state = {
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT,
            grid: createEmptyGrid(DEFAULT_WIDTH, DEFAULT_HEIGHT, 0),
            meta: createEmptyMeta(DEFAULT_WIDTH, DEFAULT_HEIGHT),
            brush: 'floor',
            lastCell: null,
            playerStart: { x: 1, y: 1 },
            stairs: { x: DEFAULT_WIDTH - 2, y: DEFAULT_HEIGHT - 2 },
            playerLevel: DEFAULT_LEVEL,
            enemies: [],
            selectedEnemyId: null,
            validation: { errors: [], warnings: [] },
            compiledConfig: null,
            tempMessage: '',
            brushSettings: { floorType: 'normal', floorColor: '', wallColor: '' },
            renderMetrics: { cellSize: RENDER_CELL_SIZE, gap: RENDER_CELL_GAP, width: 0, height: 0 },
            ioStatus: { type: 'idle', message: '' }
        };

        if (refs.gridCanvas) {
            refs.gridCanvas.addEventListener('click', handleGridClick);
            refs.gridCanvas.addEventListener('pointerdown', handleGridPointerDown);
            refs.gridCanvas.addEventListener('pointermove', handleGridPointerMove);
        }
        window.addEventListener('pointerup', handleGlobalPointerUp);
        window.addEventListener('pointercancel', handleGlobalPointerUp);
        if (refs.brushButtons?.length) {
            refs.brushButtons.forEach(btn => btn.addEventListener('click', handleBrushClick));
        }
        if (refs.widthInput) {
            refs.widthInput.value = state.width;
            refs.widthInput.addEventListener('change', (e) => {
                const value = clamp(Bridge.minSize || 5, Bridge.maxSize || 60, Math.floor(Number(e.target.value) || state.width));
                state.width = value;
                e.target.value = value;
                ensureStateGridSize(state.width, state.height);
                render();
            });
        }
        if (refs.heightInput) {
            refs.heightInput.value = state.height;
            refs.heightInput.addEventListener('change', (e) => {
                const value = clamp(Bridge.minSize || 5, Bridge.maxSize || 60, Math.floor(Number(e.target.value) || state.height));
                state.height = value;
                e.target.value = value;
                ensureStateGridSize(state.width, state.height);
                render();
            });
        }
        if (refs.playerLevelInput) {
            refs.playerLevelInput.value = state.playerLevel;
            refs.playerLevelInput.addEventListener('change', (e) => {
                const value = clamp(1, Bridge.maxLevel || 999, Math.floor(Number(e.target.value) || state.playerLevel));
                state.playerLevel = value;
                e.target.value = value;
                render();
            });
        }
        if (refs.addEnemyButton) {
            refs.addEnemyButton.addEventListener('click', addEnemy);
        }
        if (refs.fillFloorButton) {
            refs.fillFloorButton.addEventListener('click', () => fillGrid(0));
        }
        if (refs.fillWallButton) {
            refs.fillWallButton.addEventListener('click', () => fillGrid(1));
        }
        if (refs.clearMarkersButton) {
            refs.clearMarkersButton.addEventListener('click', clearMarkers);
        }
        if (refs.brushFloorType) {
            refs.brushFloorType.addEventListener('change', (e) => {
                const value = typeof e.target.value === 'string' ? e.target.value : 'normal';
                state.brushSettings.floorType = FLOOR_TYPES.includes(value) ? value : 'normal';
                if (state.lastCell && state.grid?.[state.lastCell.y]?.[state.lastCell.x] === 0) {
                    applyFloorMetaToCell(state.lastCell.x, state.lastCell.y);
                }
                render();
            });
        }
        if (refs.brushFloorColor) {
            refs.brushFloorColor.addEventListener('input', (e) => {
                const color = sanitizeColorValue(e.target.value);
                state.brushSettings.floorColor = color;
                if (state.lastCell && state.grid?.[state.lastCell.y]?.[state.lastCell.x] === 0) {
                    applyFloorMetaToCell(state.lastCell.x, state.lastCell.y);
                }
                render();
            });
        }
        if (refs.brushFloorColorClear) {
            refs.brushFloorColorClear.addEventListener('click', () => {
                state.brushSettings.floorColor = '';
                if (state.lastCell && state.grid?.[state.lastCell.y]?.[state.lastCell.x] === 0) {
                    applyFloorMetaToCell(state.lastCell.x, state.lastCell.y);
                }
                render();
            });
        }
        if (refs.brushWallColor) {
            refs.brushWallColor.addEventListener('input', (e) => {
                const color = sanitizeColorValue(e.target.value);
                state.brushSettings.wallColor = color;
                if (state.lastCell && state.grid?.[state.lastCell.y]?.[state.lastCell.x] !== 0) {
                    applyWallMetaToCell(state.lastCell.x, state.lastCell.y);
                }
                render();
            });
        }
        if (refs.brushWallColorClear) {
            refs.brushWallColorClear.addEventListener('click', () => {
                state.brushSettings.wallColor = '';
                if (state.lastCell && state.grid?.[state.lastCell.y]?.[state.lastCell.x] !== 0) {
                    applyWallMetaToCell(state.lastCell.x, state.lastCell.y);
                }
                render();
            });
        }
        if (refs.startButton) {
            refs.startButton.addEventListener('click', () => {
                if (state.validation.errors.length) {
                    refs.validation?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    return;
                }
                const result = Bridge.start ? Bridge.start(buildConfigFromState()) : { ok: false, errors: ['サンドボックスを開始できませんでした。'], warnings: [] };
                if (!result?.ok && result?.errors?.length) {
                    state.validation = { errors: result.errors, warnings: result.warnings || [] };
                    renderValidation();
                }
            });
        }

        if (refs.exportButton) {
            refs.exportButton.addEventListener('click', () => {
                if (!state) return;
                try {
                    const snapshot = exportSerializedState();
                    const payload = {
                        version: 1,
                        type: 'sandbox_dungeon',
                        data: snapshot
                    };
                    const filename = `${EXPORT_FILE_PREFIX}-${formatTimestamp(new Date())}.json`;
                    triggerDownload(JSON.stringify(payload, null, 2), filename);
                    updateIoStatus('success', '設定をエクスポートしました。');
                } catch (err) {
                    console.error('[SandboxTool] Failed to export sandbox configuration:', err);
                    updateIoStatus('error', 'エクスポートに失敗しました。');
                }
            });
        }

        if (refs.importButton && refs.importFile) {
            refs.importButton.addEventListener('click', () => {
                refs.importFile.value = '';
                refs.importFile.click();
            });

            refs.importFile.addEventListener('change', (event) => {
                const file = event.target.files && event.target.files[0];
                if (!file) {
                    updateIoStatus('info', 'ファイルが選択されませんでした。');
                    return;
                }
                updateIoStatus('info', '読み込み中...');
                const reader = new FileReader();
                reader.addEventListener('error', () => {
                    console.error('[SandboxTool] Failed to read sandbox file:', reader.error);
                    updateIoStatus('error', 'ファイルを読み込めませんでした。');
                });
                reader.addEventListener('load', () => {
                    try {
                        const text = typeof reader.result === 'string'
                            ? reader.result
                            : String(reader.result || '');
                        const parsed = JSON.parse(text);
                        const payload = extractSandboxPayload(parsed);
                        if (!payload) {
                            throw new Error('対応していないファイル形式です。');
                        }
                        const ok = importSerializedState(payload);
                        if (!ok) {
                            throw new Error('インポートに失敗しました。');
                        }
                        updateIoStatus('success', 'サンドボックス設定をインポートしました。');
                    } catch (err) {
                        console.error('[SandboxTool] Failed to import sandbox configuration:', err);
                        const message = err && err.message ? err.message : '不明なエラーが発生しました。';
                        updateIoStatus('error', `インポートに失敗しました: ${message}`);
                    }
                });
                reader.readAsText(file);
            });
        }

        render();
        if (pendingSerializedState) {
            const payload = pendingSerializedState;
            pendingSerializedState = null;
            try { importSerializedState(payload); } catch (err) {
                console.warn('[SandboxTool] Failed to restore pending state:', err);
            }
        }
    }

    ToolsTab.registerTool('sandbox-editor', init);
    global.SandboxEditor = {
        getState: exportSerializedState,
        setState: importSerializedState
    };
})(window);

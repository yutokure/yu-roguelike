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
    const BRUSHES = ['select', 'floor', 'wall', 'start', 'stairs', 'gate', 'enemy', 'domain'];
    const BRUSH_CURSOR = {
        select: 'default',
        floor: 'pointer',
        wall: 'pointer',
        start: 'pointer',
        stairs: 'pointer',
        gate: 'pointer',
        enemy: 'pointer',
        domain: 'pointer'
    };
    const FLOOR_TYPES = ['normal', 'ice', 'poison', 'bomb', 'conveyor', 'one-way', 'vertical', 'horizontal'];
    const FLOOR_TYPES_NEED_DIRECTION = new Set(['conveyor', 'one-way']);
    const FLOOR_DIRECTION_OPTIONS = ['','up','down','left','right'];
    const DEFAULT_FLOOR_COLOR = '#ced6e0';
    const DEFAULT_WALL_COLOR = '#2f3542';
    const PORTAL_TYPES = ['stairs', 'gate'];
    const PORTAL_DIRECTIONS = ['up', 'down', 'side'];
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
    const GRID_DOMAIN_COLOR = '#7c3aed';
    const GRID_GATE_COLOR = '#f59f00';
    const FLOOR_TYPE_LABELS = {
        ice: '氷',
        poison: '毒',
        bomb: '爆弾',
        conveyor: 'コンベヤー',
        'one-way': '一方通行',
        vertical: '縦通行のみ',
        horizontal: '横通行のみ'
    };
    const FLOOR_TYPE_COLORS = {
        ice: '#74c0fc',
        poison: '#94d82d',
        bomb: '#ff8787',
        conveyor: '#ffe066',
        'one-way': '#b197fc',
        vertical: '#38d9a9',
        horizontal: '#ffa94d'
    };
    const FLOOR_DIRECTION_ICONS = {
        up: '↑',
        down: '↓',
        left: '←',
        right: '→'
    };

    let refs = {};
    const DOMAIN_EFFECT_OPTIONS = [
        { id: 'attackUp', label: '攻撃力アップ' },
        { id: 'defenseUp', label: '防御力アップ' },
        { id: 'attackDown', label: '攻撃力ダウン' },
        { id: 'defenseDown', label: '防御力ダウン' },
        { id: 'allyBoost', label: '味方強化' },
        { id: 'enemyBoost', label: '敵強化' },
        { id: 'enemyOverpower', label: '超敵強化' },
        { id: 'levelUp', label: '高レベル化' },
        { id: 'levelDown', label: '低レベル化' },
        { id: 'abilityUp', label: '能力アップ' },
        { id: 'abilityDown', label: '能力ダウン' },
        { id: 'enemyInvincible', label: '敵無敵' },
        { id: 'allInvincible', label: '無敵' },
        { id: 'damageReverse', label: 'ダメージ反転' },
        { id: 'slow', label: '遅い' },
        { id: 'fast', label: '速い' },
        { id: 'ailment', label: '状態異常化' }
    ];

    const DOMAIN_EFFECT_PARAM_DEFAULTS = {
        abilityUp: 'all',
        abilityDown: 'all',
        ailment: 'random'
    };

    const DOMAIN_ABILITY_PARAM_OPTIONS = [
        { id: 'attack', label: '攻撃力' },
        { id: 'defense', label: '防御力' },
        { id: 'maxHp', label: '最大HP' },
        { id: 'all', label: '全能力' }
    ];

    const DOMAIN_STATUS_PARAM_OPTIONS = [
        { id: 'poison', label: '毒' },
        { id: 'paralysis', label: '麻痺' },
        { id: 'abilityDown', label: '能力低下' },
        { id: 'levelDown', label: 'レベル低下' },
        { id: 'random', label: 'ランダム' }
    ];

    const DOMAIN_EFFECTS_REQUIRING_PARAM = new Set(['abilityUp', 'abilityDown', 'ailment']);

    function domainEffectRequiresParam(effectId) {
        return DOMAIN_EFFECTS_REQUIRING_PARAM.has(effectId);
    }

    function getDomainEffectParamOptions(effectId) {
        if (effectId === 'abilityUp' || effectId === 'abilityDown') {
            return DOMAIN_ABILITY_PARAM_OPTIONS;
        }
        if (effectId === 'ailment') {
            return DOMAIN_STATUS_PARAM_OPTIONS;
        }
        return [];
    }

    function sanitizeDomainEffectParam(effectId, value) {
        if (!domainEffectRequiresParam(effectId)) return null;
        const options = getDomainEffectParamOptions(effectId);
        const normalized = typeof value === 'string' ? value : '';
        if (options.some(opt => opt.id === normalized)) {
            return normalized;
        }
        return DOMAIN_EFFECT_PARAM_DEFAULTS[effectId] || options[0]?.id || null;
    }

    function normalizeDomainEffectParams(rawParams, effectIds) {
        const params = {};
        if (rawParams && typeof rawParams === 'object') {
            effectIds.forEach(effectId => {
                if (!domainEffectRequiresParam(effectId)) return;
                const rawValue = rawParams[effectId];
                const sanitized = sanitizeDomainEffectParam(effectId, rawValue);
                if (sanitized) {
                    params[effectId] = sanitized;
                }
            });
        }
        effectIds.forEach(effectId => {
            if (!domainEffectRequiresParam(effectId)) return;
            if (!params[effectId]) {
                params[effectId] = DOMAIN_EFFECT_PARAM_DEFAULTS[effectId];
            }
        });
        return params;
    }

    function ensureDomainEffectParamDefaults(effect) {
        if (!effect) return;
        if (!effect.effectParams || typeof effect.effectParams !== 'object') {
            effect.effectParams = {};
        }
        const params = effect.effectParams;
        const list = Array.isArray(effect.effects) ? effect.effects : [];
        Object.keys(params).forEach(key => {
            if (!list.includes(key) || !domainEffectRequiresParam(key)) {
                delete params[key];
            }
        });
        list.forEach(effectId => {
            if (!domainEffectRequiresParam(effectId)) return;
            params[effectId] = sanitizeDomainEffectParam(effectId, params[effectId]);
        });
    }

    function cloneDomainEffectParams(effect) {
        if (!effect || typeof effect !== 'object') return {};
        const list = Array.isArray(effect.effects) ? effect.effects : [];
        const params = {};
        list.forEach(effectId => {
            if (!domainEffectRequiresParam(effectId)) return;
            const value = sanitizeDomainEffectParam(effectId, effect.effectParams?.[effectId]);
            if (value) params[effectId] = value;
        });
        return params;
    }

    const DOMAIN_RADIUS_MIN = 1;
    const DOMAIN_RADIUS_MAX = 20;

    let state = null;
    let mapSeq = 1;
    let portalSeq = 1;
    let enemySeq = 1;
    let domainSeq = 1;
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

    function createMapRecord(options = {}) {
        const {
            id,
            floor = 1,
            branchKey = '',
            width = DEFAULT_WIDTH,
            height = DEFAULT_HEIGHT,
            label = null
        } = options;
        const mapId = typeof id === 'string' && id.trim() ? id.trim() : `map-${mapSeq++}`;
        const resolvedWidth = clamp(MIN_SIZE_FALLBACK, MAX_SIZE_FALLBACK, Math.floor(width) || DEFAULT_WIDTH);
        const resolvedHeight = clamp(MIN_SIZE_FALLBACK, MAX_SIZE_FALLBACK, Math.floor(height) || DEFAULT_HEIGHT);
        const grid = createEmptyGrid(resolvedWidth, resolvedHeight, 1);
        const meta = createEmptyMeta(resolvedWidth, resolvedHeight);
        const startX = Math.min(resolvedWidth - 1, 1);
        const startY = Math.min(resolvedHeight - 1, 1);
        grid[startY][startX] = 0;
        const stairsX = Math.max(0, resolvedWidth - 2);
        const stairsY = Math.max(0, resolvedHeight - 2);
        grid[stairsY][stairsX] = 0;
        const portalId = `portal-${portalSeq++}`;
        const portal = {
            id: portalId,
            type: 'stairs',
            label: '階段',
            direction: 'up',
            x: stairsX,
            y: stairsY,
            targetMapId: mapId,
            targetX: startX,
            targetY: startY
        };
        const resolvedLabel = typeof label === 'string' && label.trim()
            ? label.trim()
            : `${floor}F${branchKey ? `-${branchKey}` : ''}`;
        return {
            id: mapId,
            label: resolvedLabel,
            floor: Math.max(1, Math.floor(floor) || 1),
            branchKey: typeof branchKey === 'string' ? branchKey.trim() : '',
            width: resolvedWidth,
            height: resolvedHeight,
            grid,
            meta,
            playerStart: { x: startX, y: startY },
            portals: [portal],
            enemies: [],
            domainEffects: []
        };
    }

    function findMapIndexById(id) {
        if (!state || !Array.isArray(state.maps)) return -1;
        return state.maps.findIndex(map => map && map.id === id);
    }

    function getActiveMapRecord() {
        if (!state) return null;
        if (!state.activeMapId) return null;
        const index = findMapIndexById(state.activeMapId);
        return index >= 0 ? state.maps[index] : null;
    }

    function activateMap(mapId, { preserveSelection = true } = {}) {
        if (!state || !Array.isArray(state.maps)) return false;
        const index = findMapIndexById(mapId);
        if (index < 0) return false;
        const map = state.maps[index];
        state.activeMapId = map.id;
        state.activeMapIndex = index;
        state.width = map.width;
        state.height = map.height;
        state.grid = map.grid;
        state.meta = map.meta;
        state.playerStart = map.playerStart;
        if (!Array.isArray(map.portals)) map.portals = [];
        state.portals = map.portals;
        state.enemies = map.enemies;
        state.domainEffects = map.domainEffects;
        if (!preserveSelection) {
            state.selectedEnemyId = map.enemies[0]?.id || null;
            state.selectedDomainId = map.domainEffects[0]?.id || null;
            state.selectedPortalId = map.portals && map.portals.length ? map.portals[0].id : null;
        }
        ensureStateGridSize(state.width, state.height);
        return true;
    }

    function ensureActiveMapRecord() {
        const map = getActiveMapRecord();
        if (map) return map;
        if (state && Array.isArray(state.maps) && state.maps.length) {
            activateMap(state.maps[0].id, { preserveSelection: false });
            return getActiveMapRecord();
        }
        return null;
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
            const dirSource = typeof meta.floorDir === 'string' ? meta.floorDir : (typeof meta.direction === 'string' ? meta.direction : meta.floorDirection);
            const direction = dirSource ? dirSource.trim().toLowerCase() : '';
            if (result.floorType && FLOOR_TYPES_NEED_DIRECTION.has(result.floorType) && FLOOR_DIRECTION_OPTIONS.includes(direction)) {
                result.floorDir = direction;
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
        const keys = ['floorType', 'floorColor', 'wallColor', 'floorDir'];
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
        if (result.floorType && FLOOR_TYPES_NEED_DIRECTION.has(result.floorType)) {
            const dir = typeof settings.floorDir === 'string' ? settings.floorDir : '';
            if (dir && FLOOR_DIRECTION_OPTIONS.includes(dir)) {
                result.floorDir = dir;
            }
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

    function getDomainEffectLabel(effectId) {
        const option = DOMAIN_EFFECT_OPTIONS.find(opt => opt.id === effectId);
        return option ? option.label : effectId;
    }

    function normalizeDomainEffects(list, width, height) {
        if (!Array.isArray(list)) return [];
        const seen = new Set();
        const effects = [];
        for (const entry of list) {
            if (!entry || typeof entry !== 'object') continue;
            const id = typeof entry.id === 'string' ? entry.id : `domain-${domainSeq++}`;
            if (seen.has(id)) continue;
            seen.add(id);
            const rawEffects = Array.isArray(entry.effects) ? entry.effects : [];
            const normalizedEffects = [];
            const rawParams = {};
            rawEffects.forEach(effectEntry => {
                let effectId = null;
                let paramValue = null;
                if (typeof effectEntry === 'string') {
                    effectId = effectEntry;
                } else if (effectEntry && typeof effectEntry === 'object') {
                    if (typeof effectEntry.id === 'string') effectId = effectEntry.id;
                    if (typeof effectEntry.param === 'string') paramValue = effectEntry.param;
                }
                const option = DOMAIN_EFFECT_OPTIONS.find(opt => opt.id === effectId);
                if (!option) return;
                if (normalizedEffects.includes(option.id)) return;
                normalizedEffects.push(option.id);
                if (paramValue) rawParams[option.id] = paramValue;
            });
            if (entry.effectParams && typeof entry.effectParams === 'object') {
                Object.keys(entry.effectParams).forEach(key => {
                    if (normalizedEffects.includes(key) && typeof entry.effectParams[key] === 'string') {
                        rawParams[key] = entry.effectParams[key];
                    }
                });
            }
            if (!normalizedEffects.length) {
                normalizedEffects.push(DOMAIN_EFFECT_OPTIONS[0].id);
            }
            const radius = clamp(DOMAIN_RADIUS_MIN, DOMAIN_RADIUS_MAX, Math.floor(Number(entry.radius) || 3));
            const pos = normalizePosition(entry, width, height);
            effects.push({
                id,
                name: typeof entry.name === 'string' ? entry.name : '',
                radius,
                effects: normalizedEffects,
                effectParams: normalizeDomainEffectParams(rawParams, normalizedEffects),
                x: pos ? pos.x : null,
                y: pos ? pos.y : null
            });
        }
        return effects;
    }

    function buildConfigFromState() {
        const maps = Array.isArray(state.maps) ? state.maps.map(map => {
            const mapGrid = cloneGrid(map.grid || []);
            const mapMeta = cloneMetaGrid(map.meta || []);
            const sanitizePortals = Array.isArray(map.portals) ? map.portals.map(portal => ({
                id: portal.id,
                type: PORTAL_TYPES.includes(portal.type) ? portal.type : 'stairs',
                label: typeof portal.label === 'string' ? portal.label : '',
                direction: PORTAL_DIRECTIONS.includes(portal.direction) ? portal.direction : (portal.type === 'stairs' ? 'up' : 'side'),
                x: Number.isFinite(portal.x) ? portal.x : null,
                y: Number.isFinite(portal.y) ? portal.y : null,
                targetMapId: typeof portal.targetMapId === 'string' ? portal.targetMapId : null,
                targetX: Number.isFinite(portal.targetX) ? portal.targetX : null,
                targetY: Number.isFinite(portal.targetY) ? portal.targetY : null
            })) : [];
            return {
                id: map.id,
                label: map.label,
                floor: map.floor,
                branchKey: map.branchKey,
                width: map.width,
                height: map.height,
                grid: mapGrid,
                tileMeta: mapMeta,
                playerStart: map.playerStart ? { ...map.playerStart } : null,
                portals: sanitizePortals,
                enemies: (map.enemies || []).map(enemy => ({
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
                domainEffects: (map.domainEffects || []).map(effect => ({
                    id: effect.id,
                    name: effect.name,
                    radius: effect.radius,
                    effects: Array.isArray(effect.effects) ? effect.effects.slice() : [],
                    effectParams: cloneDomainEffectParams(effect),
                    x: Number.isFinite(effect.x) ? effect.x : null,
                    y: Number.isFinite(effect.y) ? effect.y : null
                }))
            };
        }) : [];

        const entryMapId = state.entryMapId && maps.some(map => map.id === state.entryMapId)
            ? state.entryMapId
            : (maps[0]?.id || null);
        return {
            version: Bridge?.configVersion || SANDBOX_CONFIG_VERSION,
            playerLevel: state.playerLevel,
            interactiveMode: !!state.interactiveMode,
            entryMapId,
            maps
        };
    }

    function exportSerializedState() {
        if (!state) {
            return pendingSerializedState ? { ...pendingSerializedState } : null;
        }
        return {
            version: Bridge?.configVersion || SANDBOX_CONFIG_VERSION,
            maps: Array.isArray(state.maps) ? state.maps.map(map => ({
                id: map.id,
                label: map.label,
                floor: map.floor,
                branchKey: map.branchKey,
                width: map.width,
                height: map.height,
                grid: cloneGrid(map.grid || []),
                tileMeta: cloneMetaGrid(map.meta || []),
                playerStart: map.playerStart ? { ...map.playerStart } : null,
                portals: Array.isArray(map.portals) ? map.portals.map(portal => ({
                    id: portal.id,
                    type: portal.type,
                    label: portal.label,
                    direction: portal.direction,
                    x: Number.isFinite(portal.x) ? portal.x : null,
                    y: Number.isFinite(portal.y) ? portal.y : null,
                    targetMapId: typeof portal.targetMapId === 'string' ? portal.targetMapId : null,
                    targetX: Number.isFinite(portal.targetX) ? portal.targetX : null,
                    targetY: Number.isFinite(portal.targetY) ? portal.targetY : null
                })) : [],
                enemies: (map.enemies || []).map(enemy => ({
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
                domainEffects: (map.domainEffects || []).map(effect => ({
                    id: effect.id,
                    name: effect.name,
                    radius: effect.radius,
                    effects: Array.isArray(effect.effects) ? effect.effects.slice() : [],
                    effectParams: cloneDomainEffectParams(effect),
                    x: Number.isFinite(effect.x) ? effect.x : null,
                    y: Number.isFinite(effect.y) ? effect.y : null
                }))
            })) : [],
            activeMapId: state.activeMapId,
            entryMapId: state.entryMapId,
            playerLevel: state.playerLevel,
            interactiveMode: !!state.interactiveMode,
            selectedEnemyId: state.selectedEnemyId || null,
            selectedDomainId: state.selectedDomainId || null,
            selectedPortalId: state.selectedPortalId || null,
            brush: state.brush,
            lastCell: state.lastCell ? { ...state.lastCell } : null,
            validation: {
                errors: Array.isArray(state.validation?.errors) ? state.validation.errors.slice() : [],
                warnings: Array.isArray(state.validation?.warnings) ? state.validation.warnings.slice() : []
            },
            tempMessage: state.tempMessage || '',
            brushSettings: state.brushSettings ? { ...state.brushSettings } : { floorType: 'normal', floorColor: '', wallColor: '', floorDir: '' },
            colorPalette: Array.isArray(state.colorPalette) ? state.colorPalette.slice() : [],
            eyedropper: state.eyedropper ? { ...state.eyedropper } : { active: false }
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
        const maxLevel = Bridge?.maxLevel || MAX_LEVEL_FALLBACK;
        let rawConfig;

        if (Array.isArray(serialized?.maps) && serialized.maps.length) {
            rawConfig = {
                version: serialized.version,
                playerLevel: serialized.playerLevel,
                interactiveMode: serialized.interactiveMode,
                entryMapId: serialized.activeMapId,
                maps: serialized.maps
            };
        } else {
            rawConfig = {
                playerLevel: serialized?.playerLevel,
                interactiveMode: serialized?.interactiveMode,
                maps: [{
                    id: serialized?.id,
                    label: serialized?.label,
                    floor: serialized?.floor,
                    branchKey: serialized?.branchKey,
                    width: serialized?.width,
                    height: serialized?.height,
                    grid: serialized?.grid,
                    tileMeta: serialized?.tileMeta || serialized?.meta,
                    playerStart: serialized?.playerStart,
                    portals: serialized?.stairs ? [{
                        id: serialized?.stairs?.id || 'portal-stairs-legacy',
                        type: 'stairs',
                        label: '階段',
                        direction: 'up',
                        x: serialized.stairs.x,
                        y: serialized.stairs.y,
                        targetMapId: serialized?.stairs?.targetMapId || null,
                        targetX: serialized?.stairs?.targetX ?? serialized?.playerStart?.x ?? 0,
                        targetY: serialized?.stairs?.targetY ?? serialized?.playerStart?.y ?? 0
                    }] : [],
                    enemies: serialized?.enemies,
                    domainEffects: serialized?.domainEffects
                }]
            };
        }

        const sanitizedConfig = Bridge?.sanitize ? Bridge.sanitize(rawConfig) : rawConfig;
        const maps = Array.isArray(sanitizedConfig?.maps) ? sanitizedConfig.maps.map(map => {
            const width = clamp(Bridge?.minSize || MIN_SIZE_FALLBACK, Bridge?.maxSize || MAX_SIZE_FALLBACK, Math.floor(Number(map.width) || DEFAULT_WIDTH));
            const height = clamp(Bridge?.minSize || MIN_SIZE_FALLBACK, Bridge?.maxSize || MAX_SIZE_FALLBACK, Math.floor(Number(map.height) || DEFAULT_HEIGHT));
            return {
                id: typeof map.id === 'string' ? map.id : `map-${mapSeq++}`,
                label: typeof map.label === 'string' ? map.label : `${map.floor || 1}F`,
                floor: Math.max(1, Math.floor(Number(map.floor) || 1)),
                branchKey: typeof map.branchKey === 'string' ? map.branchKey : '',
                width,
                height,
                grid: cloneGrid(map.grid || []),
                meta: cloneMetaGrid(map.tileMeta || []),
                playerStart: map.playerStart ? { x: clamp(0, width - 1, Math.floor(Number(map.playerStart.x) || 0)), y: clamp(0, height - 1, Math.floor(Number(map.playerStart.y) || 0)) } : null,
                portals: Array.isArray(map.portals) ? map.portals.map(portal => ({
                    id: typeof portal.id === 'string' ? portal.id : `portal-${portalSeq++}`,
                    type: PORTAL_TYPES.includes(portal.type) ? portal.type : 'stairs',
                    label: typeof portal.label === 'string' ? portal.label : '',
                    direction: PORTAL_DIRECTIONS.includes(portal.direction) ? portal.direction : (portal.type === 'stairs' ? 'up' : 'side'),
                    x: Number.isFinite(portal.x) ? clamp(0, width - 1, Math.floor(portal.x)) : null,
                    y: Number.isFinite(portal.y) ? clamp(0, height - 1, Math.floor(portal.y)) : null,
                    targetMapId: typeof portal.targetMapId === 'string' ? portal.targetMapId : null,
                    targetX: Number.isFinite(portal.targetX) ? Math.floor(portal.targetX) : null,
                    targetY: Number.isFinite(portal.targetY) ? Math.floor(portal.targetY) : null
                })) : [],
                enemies: Array.isArray(map.enemies) ? map.enemies.map(enemy => ({
                    id: typeof enemy.id === 'string' ? enemy.id : null,
                    name: typeof enemy.name === 'string' ? enemy.name : '',
                    level: clamp(1, maxLevel, Math.floor(Number(enemy.level) || DEFAULT_LEVEL)),
                    hp: Math.max(1, Math.floor(Number(enemy.hp) || 1)),
                    attack: Math.max(0, Math.floor(Number(enemy.attack) || 0)),
                    defense: Math.max(0, Math.floor(Number(enemy.defense) || 0)),
                    boss: !!enemy.boss,
                    x: Number.isFinite(enemy.x) ? clamp(0, width - 1, Math.floor(enemy.x)) : null,
                    y: Number.isFinite(enemy.y) ? clamp(0, height - 1, Math.floor(enemy.y)) : null
                })) : [],
                domainEffects: Array.isArray(map.domainEffects) ? map.domainEffects.map(effect => ({
                    id: typeof effect.id === 'string' ? effect.id : null,
                    name: typeof effect.name === 'string' ? effect.name : '',
                    radius: clamp(1, 50, Math.floor(Number(effect.radius) || 3)),
                    effects: Array.isArray(effect.effects) ? effect.effects.slice() : [],
                    effectParams: cloneDomainEffectParams(effect),
                    x: Number.isFinite(effect.x) ? clamp(0, width - 1, Math.floor(effect.x)) : null,
                    y: Number.isFinite(effect.y) ? clamp(0, height - 1, Math.floor(effect.y)) : null
                })) : []
            };
        }) : [];

        const brushSettingsRaw = serialized?.brushSettings || {};
        const brushSettings = {
            floorType: FLOOR_TYPES.includes(brushSettingsRaw.floorType) ? brushSettingsRaw.floorType : 'normal',
            floorColor: sanitizeColorValue(brushSettingsRaw.floorColor),
            wallColor: sanitizeColorValue(brushSettingsRaw.wallColor),
            floorDir: FLOOR_DIRECTION_OPTIONS.includes(brushSettingsRaw.floorDir) ? brushSettingsRaw.floorDir : ''
        };

        const computedEntryMapId = sanitizedConfig?.entryMapId && maps.some(map => map.id === sanitizedConfig.entryMapId)
            ? sanitizedConfig.entryMapId
            : (maps[0]?.id || null);
        return {
            maps,
            activeMapId: maps.some(map => map.id === serialized?.activeMapId) ? serialized.activeMapId : (maps[0]?.id || null),
            entryMapId: computedEntryMapId,
            playerLevel: clamp(1, maxLevel, Math.floor(Number(sanitizedConfig?.playerLevel) || DEFAULT_LEVEL)),
            interactiveMode: !!sanitizedConfig?.interactiveMode,
            selectedEnemyId: typeof serialized?.selectedEnemyId === 'string' ? serialized.selectedEnemyId : null,
            selectedDomainId: typeof serialized?.selectedDomainId === 'string' ? serialized.selectedDomainId : null,
            selectedPortalId: typeof serialized?.selectedPortalId === 'string' ? serialized.selectedPortalId : null,
            brush: BRUSHES.includes(serialized?.brush) ? serialized.brush : 'floor',
            lastCell: serialized?.lastCell && Number.isFinite(serialized.lastCell.x) && Number.isFinite(serialized.lastCell.y)
                ? { x: Math.floor(serialized.lastCell.x), y: Math.floor(serialized.lastCell.y) }
                : null,
            validation: {
                errors: Array.isArray(serialized?.validation?.errors) ? serialized.validation.errors.map(e => String(e)) : [],
                warnings: Array.isArray(serialized?.validation?.warnings) ? serialized.validation.warnings.map(w => String(w)) : []
            },
            tempMessage: typeof serialized?.tempMessage === 'string' ? serialized.tempMessage : '',
            brushSettings,
            colorPalette: Array.isArray(serialized?.colorPalette) ? serialized.colorPalette.reduce((acc, entry) => {
                if (entry && typeof entry === 'object') {
                    acc.push({
                        kind: entry.kind === 'wall' ? 'wall' : 'floor',
                        floorColor: entry.floorColor || '',
                        wallColor: entry.wallColor || '',
                        floorType: entry.floorType || 'normal',
                        floorDir: entry.floorDir || ''
                    });
                } else if (typeof entry === 'string') {
                    acc.push({ kind: 'floor', floorColor: entry, wallColor: '', floorType: 'normal', floorDir: '' });
                }
                return acc;
            }, []) : [],
            eyedropper: serialized?.eyedropper && typeof serialized.eyedropper === 'object'
                ? { active: !!serialized.eyedropper.active }
                : { active: false }
        };
    }

    function importSerializedState(serialized) {
        const payload = normalizeSerializedState(serialized);
        if (!state) {
            pendingSerializedState = payload;
            return true;
        }
        state.maps = Array.isArray(payload.maps) ? payload.maps.map(map => {
            const record = {
                id: map.id || `map-${mapSeq++}`,
                label: map.label || `${map.floor || 1}F`,
                floor: map.floor || 1,
                branchKey: map.branchKey || '',
                width: map.width,
                height: map.height,
                grid: cloneGrid(map.grid || []),
                meta: cloneMetaGrid(map.meta || []),
                playerStart: map.playerStart ? { ...map.playerStart } : null,
                portals: Array.isArray(map.portals) ? map.portals.map(portal => ({
                    id: typeof portal.id === 'string' ? portal.id : `portal-${portalSeq++}`,
                    type: PORTAL_TYPES.includes(portal.type) ? portal.type : 'stairs',
                    label: typeof portal.label === 'string' ? portal.label : '',
                    direction: PORTAL_DIRECTIONS.includes(portal.direction) ? portal.direction : (portal.type === 'stairs' ? 'up' : 'side'),
                    x: Number.isFinite(portal.x) ? portal.x : null,
                    y: Number.isFinite(portal.y) ? portal.y : null,
                    targetMapId: typeof portal.targetMapId === 'string' ? portal.targetMapId : null,
                    targetX: Number.isFinite(portal.targetX) ? portal.targetX : null,
                    targetY: Number.isFinite(portal.targetY) ? portal.targetY : null
                })) : [],
                enemies: Array.isArray(map.enemies) ? map.enemies.map(enemy => ({
                    id: enemy.id || `enemy-${enemySeq++}`,
                    name: typeof enemy.name === 'string' ? enemy.name : '',
                    level: clamp(1, maxLevel, Math.floor(Number(enemy.level) || DEFAULT_LEVEL)),
                    hp: Math.max(1, Math.floor(Number(enemy.hp) || 1)),
                    attack: Math.max(0, Math.floor(Number(enemy.attack) || 0)),
                    defense: Math.max(0, Math.floor(Number(enemy.defense) || 0)),
                    boss: !!enemy.boss,
                    x: Number.isFinite(enemy.x) ? enemy.x : null,
                    y: Number.isFinite(enemy.y) ? enemy.y : null
                })) : [],
                domainEffects: Array.isArray(map.domainEffects) ? map.domainEffects.map(effect => {
                    const effectList = Array.isArray(effect.effects)
                        ? effect.effects.filter((id, idx, arr) => DOMAIN_EFFECT_OPTIONS.some(opt => opt.id === id) && arr.indexOf(id) === idx)
                        : [DOMAIN_EFFECT_OPTIONS[0].id];
                    if (!effectList.length) effectList.push(DOMAIN_EFFECT_OPTIONS[0].id);
                    const normalized = {
                        id: effect.id || `domain-${domainSeq++}`,
                        name: typeof effect.name === 'string' ? effect.name : '',
                        radius: clamp(DOMAIN_RADIUS_MIN, DOMAIN_RADIUS_MAX, Math.floor(Number(effect.radius) || 3)),
                        effects: effectList,
                        effectParams: normalizeDomainEffectParams(effect.effectParams, effectList),
                        x: Number.isFinite(effect.x) ? effect.x : null,
                        y: Number.isFinite(effect.y) ? effect.y : null
                    };
                    ensureDomainEffectParamDefaults(normalized);
                    return normalized;
                }) : []
            };
            return record;
        }) : [];

        const extractNumericSuffix = (value) => {
            if (typeof value !== 'string') return NaN;
            const match = value.match(/(\d+)$/);
            return match ? Number(match[1]) : NaN;
        };
        const maxMapSeq = state.maps.reduce((max, map) => {
            const num = extractNumericSuffix(map.id);
            return Number.isFinite(num) ? Math.max(max, num) : max;
        }, 0);
        mapSeq = Math.max(mapSeq, Number.isFinite(maxMapSeq) ? maxMapSeq + 1 : mapSeq);
        const maxPortalSeq = state.maps.reduce((max, map) => {
            if (!Array.isArray(map.portals)) return max;
            const localMax = map.portals.reduce((pMax, portal) => {
                const num = extractNumericSuffix(portal.id);
                return Number.isFinite(num) ? Math.max(pMax, num) : pMax;
            }, 0);
            return Math.max(max, localMax);
        }, 0);
        portalSeq = Math.max(portalSeq, Number.isFinite(maxPortalSeq) ? maxPortalSeq + 1 : portalSeq);
        const maxEnemySeq = state.maps.reduce((max, map) => {
            const localMax = map.enemies.reduce((eMax, enemy) => {
                const num = extractNumericSuffix(enemy.id);
                return Number.isFinite(num) ? Math.max(eMax, num) : eMax;
            }, 0);
            return Math.max(max, localMax);
        }, 0);
        enemySeq = Math.max(enemySeq, Number.isFinite(maxEnemySeq) ? maxEnemySeq + 1 : enemySeq);
        const maxDomainSeq = state.maps.reduce((max, map) => {
            const localMax = map.domainEffects.reduce((dMax, effect) => {
                const num = extractNumericSuffix(effect.id);
                return Number.isFinite(num) ? Math.max(dMax, num) : dMax;
            }, 0);
            return Math.max(max, localMax);
        }, 0);
        domainSeq = Math.max(domainSeq, Number.isFinite(maxDomainSeq) ? maxDomainSeq + 1 : domainSeq);

        state.entryMapId = payload.entryMapId || state.maps[0]?.id || null;
        state.playerLevel = payload.playerLevel;
        state.interactiveMode = !!payload.interactiveMode;
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
        state.colorPalette = Array.isArray(payload.colorPalette) ? payload.colorPalette.map(entry => ({ ...entry })) : [];
        state.eyedropper = payload.eyedropper ? { ...payload.eyedropper } : { active: false };

        const activated = activateMap(payload.activeMapId, { preserveSelection: false });
        if (!activated && state.maps.length) {
            activateMap(state.maps[0].id, { preserveSelection: false });
        }

        state.selectedEnemyId = state.enemies.some(enemy => enemy.id === payload.selectedEnemyId)
            ? payload.selectedEnemyId
            : (state.enemies[0]?.id || null);
        state.selectedDomainId = state.domainEffects.some(effect => effect.id === payload.selectedDomainId)
            ? payload.selectedDomainId
            : (state.domainEffects[0]?.id || null);
        state.selectedPortalId = state.portals.some(portal => portal.id === payload.selectedPortalId)
            ? payload.selectedPortalId
            : (state.portals[0]?.id || null);

        if (refs.widthInput) refs.widthInput.value = state.width;
        if (refs.heightInput) refs.heightInput.value = state.height;
        if (refs.playerLevelInput) refs.playerLevelInput.value = state.playerLevel;
        if (refs.interactiveModeInput) refs.interactiveModeInput.checked = !!state.interactiveMode;

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
        const map = getActiveMapRecord();
        if (map) {
            map.width = width;
            map.height = height;
            map.grid = newGrid;
            map.meta = newMeta;
        }
        const clampPos = (pos) => {
            if (!pos) return null;
            if (pos.x < 0 || pos.x >= width || pos.y < 0 || pos.y >= height) return null;
            return pos;
        };
        state.playerStart = clampPos(state.playerStart);
        if (map) {
            map.playerStart = state.playerStart ? { ...state.playerStart } : null;
        }
        if (Array.isArray(state.portals)) {
            state.portals = state.portals.map(portal => {
                if (!portal) return null;
                if (!Number.isFinite(portal.x) || !Number.isFinite(portal.y)) return { ...portal, x: null, y: null };
                if (portal.x < 0 || portal.x >= width || portal.y < 0 || portal.y >= height) {
                    return { ...portal, x: null, y: null };
                }
                return portal;
            }).filter(Boolean);
            if (map) {
                map.portals = state.portals;
            }
        }
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
        if (map) {
            map.enemies = state.enemies;
        }
        state.domainEffects = state.domainEffects.map(effect => {
            if (!Number.isFinite(effect.x) || !Number.isFinite(effect.y)) {
                return { ...effect, x: null, y: null };
            }
            if (effect.x < 0 || effect.x >= width || effect.y < 0 || effect.y >= height) {
                return { ...effect, x: null, y: null };
            }
            return effect;
        });
        if (map) {
            map.domainEffects = state.domainEffects;
        }
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

        const mapConfig = getActiveMapRecord();
        const portals = Array.isArray(state.portals)
            ? state.portals
            : (mapConfig ? (mapConfig.portals = mapConfig.portals || []) : []);
        if (mapConfig && state.portals !== mapConfig.portals) {
            state.portals = mapConfig.portals;
        }

        const ensurePortalReference = (type) => {
            let portal = portals.find(p => p && p.id === state.selectedPortalId && p.type === type);
            if (!portal) {
                portal = portals.find(p => p.type === type);
            }
            if (!portal) {
                portal = {
                    id: `portal-${portalSeq++}`,
                    type,
                    label: type === 'stairs' ? '階段' : 'ゲート',
                    direction: type === 'stairs' ? 'up' : 'side',
                    x: null,
                    y: null,
                    targetMapId: mapConfig?.id || state.activeMapId || null,
                    targetX: state.playerStart?.x ?? null,
                    targetY: state.playerStart?.y ?? null
                };
                portals.push(portal);
                if (mapConfig) mapConfig.portals = portals;
                state.selectedPortalId = portal.id;
            }
            return portal;
        };

        const removePortalsAt = (px, py) => {
            if (!Array.isArray(portals) || !portals.length) return false;
            let removed = false;
            for (let i = portals.length - 1; i >= 0; i--) {
                const portal = portals[i];
                if (portal && portal.x === px && portal.y === py) {
                    portals.splice(i, 1);
                    removed = true;
                }
            }
            if (removed) {
                if (mapConfig) mapConfig.portals = portals;
                if (state.selectedPortalId && !portals.some(portal => portal.id === state.selectedPortalId)) {
                    state.selectedPortalId = portals[0]?.id || null;
                }
            }
            return removed;
        };

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
                if (mapConfig) mapConfig.playerStart = null;
                changed = true;
            }
            if (removePortalsAt(x, y)) {
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
            let domainChanged = false;
            state.domainEffects = state.domainEffects.map(effect => {
                if (effect.x === x && effect.y === y) {
                    domainChanged = true;
                    return { ...effect, x: null, y: null };
                }
                return effect;
            });
            if (domainChanged) changed = true;
            if (applyWallMetaToCell(x, y)) changed = true;
        } else if (brush === 'start') {
            if (state.grid[y][x] !== 0) {
                state.grid[y][x] = 0;
                changed = true;
            }
            if (!state.playerStart || state.playerStart.x !== x || state.playerStart.y !== y) {
                state.playerStart = { x, y };
                if (mapConfig) mapConfig.playerStart = { x, y };
                changed = true;
            }
            if (applyFloorMetaToCell(x, y, { useBrushSettings: false })) changed = true;
        } else if (brush === 'stairs' || brush === 'gate') {
            if (state.grid[y][x] !== 0) {
                state.grid[y][x] = 0;
                changed = true;
            }
            const desiredType = brush === 'stairs' ? 'stairs' : 'gate';
            const portal = ensurePortalReference(desiredType);
            if (!portal) return false;
            if (portal.x !== x || portal.y !== y) {
                portal.x = x;
                portal.y = y;
                changed = true;
            }
            if (!Number.isFinite(portal.targetX)) portal.targetX = state.playerStart?.x ?? x;
            if (!Number.isFinite(portal.targetY)) portal.targetY = state.playerStart?.y ?? y;
            if (mapConfig) mapConfig.portals = portals;
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
        } else if (brush === 'domain') {
            if (!state.selectedDomainId) {
                state.tempMessage = '領域ブラシを使う前にクリスタルを選択してください。';
                renderValidation();
                return false;
            }
            const effect = state.domainEffects.find(d => d.id === state.selectedDomainId);
            if (effect) {
                if (state.grid[y][x] !== 0) {
                    state.grid[y][x] = 0;
                    changed = true;
                }
                if (effect.x !== x || effect.y !== y) {
                    effect.x = x;
                    effect.y = y;
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
        const portalHere = Array.isArray(state.portals)
            ? state.portals.find(portal => portal && portal.x === x && portal.y === y)
            : null;
        if (portalHere) {
            if (portalHere.type === 'stairs') {
                detailParts.push('階段');
            } else {
                const label = (portalHere.label || '').trim();
                detailParts.push(label ? `ゲート: ${label}` : 'ゲート');
            }
        }
        if (cell === 0) {
            const floorType = meta?.floorType || '';
            if (floorType && floorType !== 'normal') {
                const label = FLOOR_TYPE_LABELS[floorType] || floorType;
                let suffix = '';
                if (FLOOR_TYPES_NEED_DIRECTION.has(floorType)) {
                    const dir = meta?.floorDir || '';
                    if (dir && FLOOR_DIRECTION_ICONS[dir]) {
                        suffix = `（${FLOOR_DIRECTION_ICONS[dir]}）`;
                    }
                } else if (floorType === 'vertical') {
                    suffix = '（↕）';
                } else if (floorType === 'horizontal') {
                    suffix = '（↔）';
                }
                detailParts.push(`床タイプ: ${label}${suffix}`);
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
        const domainsHere = Array.isArray(state.domainEffects) ? state.domainEffects.filter(e => e.x === x && e.y === y) : [];
        if (domainsHere.length) {
            const labels = domainsHere.map(effect => {
                const name = (effect.name || '').trim();
                const effects = Array.isArray(effect.effects) ? effect.effects.map(getDomainEffectLabel) : [];
                const effectLabel = effects.length ? effects.join('・') : '効果なし';
                return name ? `${name}: ${effectLabel}` : effectLabel;
            });
            detailParts.push(`領域: ${labels.join(' / ')}`);
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
                const portalsHere = Array.isArray(state.portals)
                    ? state.portals.filter(portal => portal && portal.x === x && portal.y === y)
                    : [];
                const stairsPortal = portalsHere.find(portal => portal.type === 'stairs');
                const gatePortal = portalsHere.find(portal => portal.type !== 'stairs');
                const hasSelectedPortal = state.selectedPortalId && portalsHere.some(portal => portal.id === state.selectedPortalId);
                const enemiesHere = Array.isArray(state.enemies) ? state.enemies.filter(e => e.x === x && e.y === y) : [];
                const hasSelectedEnemy = state.selectedEnemyId && enemiesHere.some(e => e.id === state.selectedEnemyId);

                if (isStart) {
                    drawRoundedRect(ctx, originX, originY, cellSize, cellSize, RENDER_CELL_RADIUS, null, GRID_START_COLOR, 2.4);
                }
                if (stairsPortal) {
                    drawRoundedRect(ctx, originX, originY, cellSize, cellSize, RENDER_CELL_RADIUS, null, GRID_STAIRS_COLOR, 2.4);
                }
                if (gatePortal) {
                    drawRoundedRect(ctx, originX, originY, cellSize, cellSize, RENDER_CELL_RADIUS, null, GRID_GATE_COLOR, 2.4);
                }
                if (hasSelectedEnemy) {
                    drawRoundedRect(ctx, originX, originY, cellSize, cellSize, RENDER_CELL_RADIUS, null, GRID_SELECTED_ENEMY_COLOR, 2.6);
                }
                if (hasSelectedPortal) {
                    drawRoundedRect(ctx, originX, originY, cellSize, cellSize, RENDER_CELL_RADIUS, null, '#1c7ed6', 2.2);
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
                if (stairsPortal) {
                    icon = '⬆';
                    iconColor = '#1f2937';
                    fontSize = Math.floor(cellSize * 0.6);
                }
                if (!icon && gatePortal) {
                    icon = '⛩';
                    iconColor = '#1f2937';
                    fontSize = Math.floor(cellSize * 0.62);
                }
                if (!icon && enemiesHere.length) {
                    icon = enemiesHere.length > 1 ? `✦${enemiesHere.length}` : '✦';
                    fontSize = enemiesHere.length > 1 ? Math.floor(cellSize * 0.5) : Math.floor(cellSize * 0.6);
                    iconColor = getTextColorForBackground(baseColor);
                }
                if (!icon) {
                    const domainHere = Array.isArray(state.domainEffects)
                        ? state.domainEffects.filter(effect => effect.x === x && effect.y === y)
                        : [];
                    if (domainHere.length) {
                        icon = domainHere.length > 1 ? `◇${domainHere.length}` : '◇';
                        fontSize = domainHere.length > 1 ? Math.floor(cellSize * 0.5) : Math.floor(cellSize * 0.58);
                        iconColor = GRID_DOMAIN_COLOR;
                    }
                }
                if (!icon && isFloor) {
                    const floorType = meta?.floorType || '';
                    if (floorType && floorType !== 'normal') {
                        if (FLOOR_TYPES_NEED_DIRECTION.has(floorType)) {
                            const dir = meta?.floorDir || '';
                            if (dir && FLOOR_DIRECTION_ICONS[dir]) {
                                icon = FLOOR_DIRECTION_ICONS[dir];
                                fontSize = Math.floor(cellSize * 0.55);
                                iconColor = '#1f2937';
                            }
                        } else if (floorType === 'vertical') {
                            icon = '↕';
                            fontSize = Math.floor(cellSize * 0.55);
                            iconColor = '#1f2937';
                        } else if (floorType === 'horizontal') {
                            icon = '↔';
                            fontSize = Math.floor(cellSize * 0.55);
                            iconColor = '#1f2937';
                        }
                    }
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
        const settings = state.brushSettings || { floorType: 'normal', floorColor: '', wallColor: '', floorDir: '' };
        let floorType = settings.floorType;
        let floorColor = settings.floorColor;
        let wallColor = settings.wallColor;
        let floorDir = settings.floorDir || '';
        if (state.lastCell) {
            const { x, y } = state.lastCell;
            const isFloor = state.grid?.[y]?.[x] === 0;
            const meta = state.meta?.[y]?.[x] || null;
            if (isFloor) {
                floorType = meta?.floorType || 'normal';
                floorColor = meta?.floorColor || '';
                floorDir = meta?.floorDir || '';
            }
            if (!isFloor) {
                wallColor = meta?.wallColor || '';
            }
        }
        if (!FLOOR_TYPES.includes(floorType)) {
            floorType = 'normal';
        }
        if (!FLOOR_DIRECTION_OPTIONS.includes(floorDir)) {
            floorDir = '';
        }
        if (!FLOOR_TYPES_NEED_DIRECTION.has(floorType)) {
            floorDir = '';
        }
        refs.brushFloorType.value = floorType;
        if (refs.brushFloorDirection) {
            refs.brushFloorDirection.value = floorDir;
            refs.brushFloorDirection.disabled = !FLOOR_TYPES_NEED_DIRECTION.has(floorType);
            if (refs.brushFloorDirection.closest('.sandbox-field-group')) {
                refs.brushFloorDirection.closest('.sandbox-field-group').classList.toggle('disabled', refs.brushFloorDirection.disabled);
            }
        }
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

    function renderDomains() {
        if (!refs.domainList) return;
        refs.domainList.innerHTML = '';
        if (!state.domainEffects.length) {
            const empty = document.createElement('p');
            empty.textContent = 'クリスタルは未配置です。「クリスタルを追加」ボタンから追加してください。';
            empty.className = 'sandbox-note';
            refs.domainList.appendChild(empty);
            state.selectedDomainId = null;
            return;
        }
        if (!state.selectedDomainId || !state.domainEffects.some(e => e.id === state.selectedDomainId)) {
            state.selectedDomainId = state.domainEffects[0].id;
        }
        state.domainEffects.forEach((effect, index) => {
            ensureDomainEffectParamDefaults(effect);
            const card = document.createElement('div');
            card.className = 'sandbox-domain-card';
            if (effect.id === state.selectedDomainId) {
                card.classList.add('selected');
            }

            const header = document.createElement('div');
            header.className = 'sandbox-domain-header';
            const title = document.createElement('h5');
            title.textContent = (effect.name || '').trim() || `クリスタル${index + 1}`;
            header.appendChild(title);

            const actions = document.createElement('div');
            actions.className = 'sandbox-domain-actions';

            const selectBtn = document.createElement('button');
            selectBtn.type = 'button';
            selectBtn.className = 'select';
            selectBtn.textContent = '選択';
            selectBtn.addEventListener('click', () => {
                state.selectedDomainId = effect.id;
                render();
            });
            actions.appendChild(selectBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'delete';
            deleteBtn.textContent = '削除';
            deleteBtn.addEventListener('click', () => {
                state.domainEffects = state.domainEffects.filter(d => d.id !== effect.id);
                if (state.selectedDomainId === effect.id) {
                    state.selectedDomainId = state.domainEffects[0]?.id || null;
                }
                render();
            });
            actions.appendChild(deleteBtn);

            header.appendChild(actions);
            card.appendChild(header);

            const grid = document.createElement('div');
            grid.className = 'sandbox-domain-grid';

            const nameLabel = document.createElement('label');
            nameLabel.textContent = '名前';
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.value = effect.name || '';
            nameInput.dataset.preserveKey = `domain-${effect.id}-name`;
            nameInput.addEventListener('input', (e) => {
                effect.name = e.target.value.slice(0, 40);
                render();
            });
            nameLabel.appendChild(nameInput);
            grid.appendChild(nameLabel);

            const radiusLabel = document.createElement('label');
            radiusLabel.textContent = '半径';
            const radiusInput = document.createElement('input');
            radiusInput.type = 'number';
            radiusInput.min = String(DOMAIN_RADIUS_MIN);
            radiusInput.max = String(DOMAIN_RADIUS_MAX);
            radiusInput.value = effect.radius || 3;
            radiusInput.dataset.preserveKey = `domain-${effect.id}-radius`;
            radiusInput.addEventListener('change', (e) => {
                const value = clamp(DOMAIN_RADIUS_MIN, DOMAIN_RADIUS_MAX, Math.floor(Number(e.target.value) || effect.radius || 3));
                effect.radius = value;
                radiusInput.value = value;
            });
            radiusLabel.appendChild(radiusInput);
            grid.appendChild(radiusLabel);

            const xLabel = document.createElement('label');
            xLabel.textContent = 'X';
            const xInput = document.createElement('input');
            xInput.type = 'number';
            xInput.min = '0';
            xInput.max = String(state.width - 1);
            xInput.value = Number.isFinite(effect.x) ? effect.x : '';
            xInput.dataset.preserveKey = `domain-${effect.id}-x`;
            xInput.addEventListener('change', (e) => {
                const value = Math.floor(Number(e.target.value));
                if (!Number.isFinite(value)) {
                    effect.x = null;
                    e.target.value = '';
                    return;
                }
                effect.x = clamp(0, state.width - 1, value);
                e.target.value = effect.x;
            });
            xLabel.appendChild(xInput);
            grid.appendChild(xLabel);

            const yLabel = document.createElement('label');
            yLabel.textContent = 'Y';
            const yInput = document.createElement('input');
            yInput.type = 'number';
            yInput.min = '0';
            yInput.max = String(state.height - 1);
            yInput.value = Number.isFinite(effect.y) ? effect.y : '';
            yInput.dataset.preserveKey = `domain-${effect.id}-y`;
            yInput.addEventListener('change', (e) => {
                const value = Math.floor(Number(e.target.value));
                if (!Number.isFinite(value)) {
                    effect.y = null;
                    e.target.value = '';
                    return;
                }
                effect.y = clamp(0, state.height - 1, value);
                e.target.value = effect.y;
            });
            yLabel.appendChild(yInput);
            grid.appendChild(yLabel);

            const effectsLabel = document.createElement('label');
            effectsLabel.textContent = '効果';
            const effectSelect = document.createElement('select');
            effectSelect.multiple = true;
            effectSelect.size = Math.min(6, DOMAIN_EFFECT_OPTIONS.length);
            DOMAIN_EFFECT_OPTIONS.forEach(option => {
                const opt = document.createElement('option');
                opt.value = option.id;
                opt.textContent = option.label;
                if (Array.isArray(effect.effects) && effect.effects.includes(option.id)) {
                    opt.selected = true;
                }
                effectSelect.appendChild(opt);
            });
            effectSelect.addEventListener('change', () => {
                const selected = Array.from(effectSelect.selectedOptions).map(opt => opt.value);
                if (!selected.length) {
                    selected.push(DOMAIN_EFFECT_OPTIONS[0].id);
                }
                effect.effects = selected;
                ensureDomainEffectParamDefaults(effect);
                render();
            });
            effectsLabel.appendChild(effectSelect);
            grid.appendChild(effectsLabel);

            const paramsContainer = document.createElement('div');
            paramsContainer.className = 'sandbox-domain-params';
            let hasParams = false;
            effect.effects.forEach(effectId => {
                if (!domainEffectRequiresParam(effectId)) return;
                const paramLabel = document.createElement('label');
                paramLabel.textContent = `${getDomainEffectLabel(effectId)}の対象`;
                const paramSelect = document.createElement('select');
                paramSelect.dataset.preserveKey = `domain-${effect.id}-param-${effectId}`;
                const options = getDomainEffectParamOptions(effectId);
                const currentValue = effect.effectParams?.[effectId] || DOMAIN_EFFECT_PARAM_DEFAULTS[effectId] || options[0]?.id || '';
                options.forEach(option => {
                    const opt = document.createElement('option');
                    opt.value = option.id;
                    opt.textContent = option.label;
                    if (option.id === currentValue) opt.selected = true;
                    paramSelect.appendChild(opt);
                });
                paramSelect.addEventListener('change', () => {
                    if (!effect.effectParams || typeof effect.effectParams !== 'object') {
                        effect.effectParams = {};
                    }
                    effect.effectParams[effectId] = sanitizeDomainEffectParam(effectId, paramSelect.value);
                    ensureDomainEffectParamDefaults(effect);
                    render();
                });
                paramLabel.appendChild(paramSelect);
                paramsContainer.appendChild(paramLabel);
                hasParams = true;
            });
            if (hasParams) {
                grid.appendChild(paramsContainer);
            }

            card.appendChild(grid);
            refs.domainList.appendChild(card);
        });
    }

    function renderPortals() {
        if (!refs.portalList) return;
        const mapConfig = getActiveMapRecord();
        const portals = Array.isArray(state.portals) ? state.portals : [];
        refs.portalList.innerHTML = '';
        if (!mapConfig) {
            const note = document.createElement('p');
            note.className = 'sandbox-note';
            note.textContent = 'マップを選択してください。';
            refs.portalList.appendChild(note);
            if (refs.addPortalButton) refs.addPortalButton.disabled = true;
            return;
        }
        if (refs.addPortalButton) refs.addPortalButton.disabled = false;
        portals.forEach(portal => {
            if (portal && !portal.targetMapId) {
                portal.targetMapId = mapConfig.id;
            }
        });
        if (!portals.length) {
            const empty = document.createElement('p');
            empty.className = 'sandbox-note';
            empty.textContent = 'ポータルは未配置です。「ポータルを追加」ボタンから追加してください。';
            refs.portalList.appendChild(empty);
            state.selectedPortalId = null;
            return;
        }
        if (!state.selectedPortalId || !portals.some(portal => portal.id === state.selectedPortalId)) {
            state.selectedPortalId = portals[0]?.id || null;
        }
        portals.forEach((portal, index) => {
            const card = document.createElement('div');
            card.className = 'sandbox-portal-card';
            if (portal.id === state.selectedPortalId) {
                card.classList.add('selected');
            }

            const header = document.createElement('div');
            header.className = 'sandbox-portal-header';
            const title = document.createElement('h5');
            title.textContent = (portal.label || '').trim() || `ポータル${index + 1}`;
            header.appendChild(title);

            const actions = document.createElement('div');
            actions.className = 'sandbox-portal-actions';

            const selectBtn = document.createElement('button');
            selectBtn.type = 'button';
            selectBtn.className = 'select';
            selectBtn.textContent = '選択';
            selectBtn.addEventListener('click', () => {
                state.selectedPortalId = portal.id;
                state.brush = portal.type === 'stairs' ? 'stairs' : 'gate';
                render();
            });
            actions.appendChild(selectBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'delete';
            deleteBtn.textContent = '削除';
            deleteBtn.addEventListener('click', () => {
                const idx = portals.indexOf(portal);
                if (idx >= 0) portals.splice(idx, 1);
                if (state.selectedPortalId === portal.id) {
                    state.selectedPortalId = portals[0]?.id || null;
                }
                render();
            });
            actions.appendChild(deleteBtn);

            header.appendChild(actions);
            card.appendChild(header);

            const grid = document.createElement('div');
            grid.className = 'sandbox-portal-grid';

            const nameLabel = document.createElement('label');
            nameLabel.textContent = '名前';
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.value = portal.label || '';
            nameInput.maxLength = 40;
            nameInput.dataset.preserveKey = `portal-${portal.id}-name`;
            nameInput.addEventListener('input', (e) => {
                portal.label = e.target.value.slice(0, 40);
                renderMapList();
                renderPortals();
            });
            nameLabel.appendChild(nameInput);
            grid.appendChild(nameLabel);

            const typeLabel = document.createElement('label');
            typeLabel.textContent = '種類';
            const typeSelect = document.createElement('select');
            ['stairs', 'gate'].forEach(type => {
                const opt = document.createElement('option');
                opt.value = type;
                opt.textContent = type === 'stairs' ? '階段' : 'ゲート';
                if (portal.type === type) opt.selected = true;
                typeSelect.appendChild(opt);
            });
            typeSelect.addEventListener('change', (e) => {
                portal.type = e.target.value === 'gate' ? 'gate' : 'stairs';
                if (portal.type === 'stairs' && (!portal.label || portal.label === 'ゲート')) {
                    portal.label = '階段';
                }
                if (portal.type === 'gate' && (!portal.label || portal.label === '階段')) {
                    portal.label = 'ゲート';
                }
                state.brush = portal.type === 'stairs' ? 'stairs' : 'gate';
                renderPortals();
                renderMapList();
            });
            typeLabel.appendChild(typeSelect);
            grid.appendChild(typeLabel);

            const targetLabel = document.createElement('label');
            targetLabel.textContent = '接続先マップ';
            const targetSelect = document.createElement('select');
            state.maps.forEach(map => {
                const opt = document.createElement('option');
                opt.value = map.id;
                const branchText = map.branchKey ? ` (${map.branchKey})` : '';
                opt.textContent = `${map.floor}F ${map.label || ''}${branchText}`;
                if (map.id === portal.targetMapId) opt.selected = true;
                targetSelect.appendChild(opt);
            });
            targetSelect.addEventListener('change', (e) => {
                portal.targetMapId = e.target.value;
            });
            targetLabel.appendChild(targetSelect);
            grid.appendChild(targetLabel);

            const targetXLabel = document.createElement('label');
            targetXLabel.textContent = '接続X';
            const targetXInput = document.createElement('input');
            targetXInput.type = 'number';
            targetXInput.min = '0';
            targetXInput.value = Number.isFinite(portal.targetX) ? portal.targetX : '';
            targetXInput.dataset.preserveKey = `portal-${portal.id}-targetx`;
            targetXInput.addEventListener('change', (e) => {
                const value = Math.floor(Number(e.target.value));
                if (Number.isFinite(value)) {
                    const targetMap = state.maps.find(map => map.id === portal.targetMapId);
                    if (targetMap) {
                        const maxX = Math.max(0, (targetMap.width || state.width) - 1);
                        portal.targetX = clamp(0, maxX, value);
                        e.target.value = portal.targetX;
                    } else {
                        portal.targetX = value;
                    }
                } else {
                    portal.targetX = null;
                }
                renderPortals();
            });
            targetXLabel.appendChild(targetXInput);
            grid.appendChild(targetXLabel);

            const targetYLabel = document.createElement('label');
            targetYLabel.textContent = '接続Y';
            const targetYInput = document.createElement('input');
            targetYInput.type = 'number';
            targetYInput.min = '0';
            targetYInput.value = Number.isFinite(portal.targetY) ? portal.targetY : '';
            targetYInput.dataset.preserveKey = `portal-${portal.id}-targety`;
            targetYInput.addEventListener('change', (e) => {
                const value = Math.floor(Number(e.target.value));
                if (Number.isFinite(value)) {
                    const targetMap = state.maps.find(map => map.id === portal.targetMapId);
                    if (targetMap) {
                        const maxY = Math.max(0, (targetMap.height || state.height) - 1);
                        portal.targetY = clamp(0, maxY, value);
                        e.target.value = portal.targetY;
                    } else {
                        portal.targetY = value;
                    }
                } else {
                    portal.targetY = null;
                }
                renderPortals();
            });
            targetYLabel.appendChild(targetYInput);
            grid.appendChild(targetYLabel);

            card.appendChild(grid);
            refs.portalList.appendChild(card);
        });

        if (refs.nodeMapDialog && refs.nodeMapDialog.classList.contains('open')) {
            renderNodeMap();
        }
    }

    function renderColorPalette() {
        if (!refs.colorPalette) return;
        const paletteEl = refs.colorPalette;
        paletteEl.innerHTML = '';
        if (!Array.isArray(state.colorPalette) || !state.colorPalette.length) {
            const note = document.createElement('p');
            note.className = 'sandbox-note';
            note.textContent = '保存したカラーがありません。';
            paletteEl.appendChild(note);
            return;
        }
        state.colorPalette.forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = 'sandbox-palette-item';
            const applyBtn = document.createElement('button');
            applyBtn.type = 'button';
            applyBtn.className = 'sandbox-palette-apply';
            applyBtn.setAttribute('aria-label', 'カラーを適用');
            const swatch = document.createElement('span');
            swatch.className = 'sandbox-palette-swatch';
            if (entry.kind === 'wall') {
                swatch.style.background = entry.wallColor || '#2f3542';
            } else {
                const floorColor = entry.floorColor || '#ced6e0';
                const secondary = entry.wallColor || '#2f3542';
                swatch.style.background = `linear-gradient(135deg, ${floorColor} 50%, ${secondary} 50%)`;
            }
            applyBtn.appendChild(swatch);
            applyBtn.addEventListener('click', () => {
                if (entry.kind === 'wall') {
                    state.brushSettings.wallColor = entry.wallColor || '';
                    state.brush = 'wall';
                } else {
                    if (entry.floorType) state.brushSettings.floorType = entry.floorType;
                    if (entry.floorDir) state.brushSettings.floorDir = entry.floorDir;
                    state.brushSettings.floorColor = entry.floorColor || '';
                    if (entry.wallColor) state.brushSettings.wallColor = entry.wallColor;
                    state.brush = 'floor';
                }
                syncBrushControls();
                render();
            });
            item.appendChild(applyBtn);

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'sandbox-palette-remove';
            removeBtn.setAttribute('aria-label', 'カラーを削除');
            removeBtn.textContent = '✕';
            removeBtn.addEventListener('click', () => {
                state.colorPalette.splice(index, 1);
                renderColorPalette();
            });
            item.appendChild(removeBtn);
            paletteEl.appendChild(item);
        });
    }

    function applyEyedropper(x, y) {
        if (!Number.isFinite(x) || !Number.isFinite(y)) return;
        const mapRow = state.grid?.[y];
        if (!Array.isArray(mapRow)) return;
        const cell = mapRow[x];
        const meta = state.meta?.[y]?.[x] || null;
        const portalsHere = Array.isArray(state.portals)
            ? state.portals.filter(portal => portal && portal.x === x && portal.y === y)
            : [];

        setSelectedCell(x, y);

        if (cell === 0) {
            state.brush = 'floor';
            if (meta?.floorType) state.brushSettings.floorType = meta.floorType;
            if (meta?.floorDir) state.brushSettings.floorDir = meta.floorDir;
            state.brushSettings.floorColor = meta?.floorColor || '';
        } else {
            state.brush = 'wall';
            state.brushSettings.wallColor = meta?.wallColor || '';
        }

        if (portalsHere.length) {
            const portal = portalsHere[0];
            state.selectedPortalId = portal.id;
            state.brush = portal.type === 'stairs' ? 'stairs' : 'gate';
        }

        syncBrushControls();
    }

    function handleAddMap() {
        const nextFloor = state.maps.length ? Math.max(...state.maps.map(map => map.floor || 1)) + 1 : 1;
        const newMap = createMapRecord({ floor: nextFloor });
        state.maps.push(newMap);
        activateMap(newMap.id, { preserveSelection: false });
        if (!state.entryMapId) state.entryMapId = newMap.id;
        render();
    }

    function handleAddPortal() {
        const mapConfig = getActiveMapRecord();
        if (!mapConfig) return;
        if (!Array.isArray(mapConfig.portals)) mapConfig.portals = [];
        const portal = {
            id: `portal-${portalSeq++}`,
            type: 'gate',
            label: 'ゲート',
            direction: 'side',
            x: null,
            y: null,
            targetMapId: mapConfig.id,
            targetX: mapConfig.playerStart?.x ?? 0,
            targetY: mapConfig.playerStart?.y ?? 0
        };
        mapConfig.portals.push(portal);
        state.portals = mapConfig.portals;
        state.selectedPortalId = portal.id;
        state.brush = 'gate';
        renderPortals();
    }

    function openNodeMap() {
        if (!refs.nodeMapDialog) return;
        refs.nodeMapDialog.setAttribute('aria-hidden', 'false');
        refs.nodeMapDialog.classList.add('open');
        renderNodeMap();
        document.addEventListener('keydown', handleNodeMapKeydown);
    }

    function closeNodeMap() {
        if (!refs.nodeMapDialog) return;
        refs.nodeMapDialog.setAttribute('aria-hidden', 'true');
        refs.nodeMapDialog.classList.remove('open');
        document.removeEventListener('keydown', handleNodeMapKeydown);
    }

    function renderNodeMap() {
        if (!refs.nodeMapCanvas) return;
        const container = refs.nodeMapCanvas;
        container.innerHTML = '';
        const maps = Array.isArray(state.maps) ? state.maps : [];
        if (!maps.length) {
            const note = document.createElement('p');
            note.className = 'sandbox-note';
            note.textContent = 'マップがありません。';
            container.appendChild(note);
            return;
        }

        const floors = Array.from(new Set(maps.map(map => map.floor))).sort((a, b) => b - a);
        const floorMap = new Map();
        floors.forEach(floor => {
            const group = maps.filter(map => map.floor === floor).sort((a, b) => {
                if (a.branchKey && b.branchKey) return a.branchKey.localeCompare(b.branchKey);
                if (a.branchKey) return -1;
                if (b.branchKey) return 1;
                return a.label.localeCompare(b.label);
            });
            floorMap.set(floor, group);
        });

        const rowHeight = 140;
        const columnWidth = 160;
        const margin = 60;
        const maxColumns = Math.max(...Array.from(floorMap.values()).map(group => group.length));
        const width = Math.max(320, margin * 2 + (maxColumns - 1) * columnWidth);
        const height = Math.max(240, margin * 2 + (floors.length - 1) * rowHeight);

        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.classList.add('node-map-svg');

        const positions = new Map();
        floors.forEach((floor, rowIndex) => {
            const group = floorMap.get(floor) || [];
            group.forEach((map, colIndex) => {
                const x = margin + colIndex * columnWidth;
                const y = margin + rowIndex * rowHeight;
                positions.set(map.id, { x, y, map });
            });
        });

        // Draw connections
        maps.forEach(map => {
            const source = positions.get(map.id);
            if (!source) return;
            (map.portals || []).forEach(portal => {
                if (!portal || !portal.targetMapId) return;
                if (portal.targetMapId === map.id) return;
                const target = positions.get(portal.targetMapId);
                if (!target) return;
                const line = document.createElementNS(svgNS, 'line');
                line.setAttribute('x1', source.x + 40);
                line.setAttribute('y1', source.y + 40);
                line.setAttribute('x2', target.x + 40);
                line.setAttribute('y2', target.y + 40);
                line.setAttribute('class', portal.type === 'stairs' ? 'node-map-edge stairs' : 'node-map-edge gate');
                svg.appendChild(line);
            });
        });

        // Draw nodes
        Array.from(positions.values()).forEach(({ x, y, map }) => {
            const nodeGroup = document.createElementNS(svgNS, 'g');
            nodeGroup.setAttribute('transform', `translate(${x}, ${y})`);
            nodeGroup.setAttribute('role', 'button');
            nodeGroup.setAttribute('tabindex', '0');
            nodeGroup.classList.add('node-map-node');
            if (map.id === state.activeMapId) nodeGroup.classList.add('active');
            if (map.id === state.entryMapId) nodeGroup.classList.add('entry');

            const circle = document.createElementNS(svgNS, 'circle');
            circle.setAttribute('cx', '40');
            circle.setAttribute('cy', '40');
            circle.setAttribute('r', '32');
            nodeGroup.appendChild(circle);

            const text = document.createElementNS(svgNS, 'text');
            text.setAttribute('x', '40');
            text.setAttribute('y', '40');
            text.setAttribute('dy', '0.35em');
            text.setAttribute('text-anchor', 'middle');
            text.textContent = `${map.floor}F`;
            nodeGroup.appendChild(text);

            const label = document.createElementNS(svgNS, 'text');
            label.setAttribute('x', '40');
            label.setAttribute('y', '84');
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('class', 'node-map-label');
            label.textContent = map.label || '';
            nodeGroup.appendChild(label);

            nodeGroup.addEventListener('click', () => {
                if (map.id !== state.activeMapId) {
                    activateMap(map.id);
                    render();
                }
                closeNodeMap();
            });
            nodeGroup.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    nodeGroup.click();
                }
            });

            svg.appendChild(nodeGroup);
        });

        container.appendChild(svg);
    }

    function handleNodeMapKeydown(event) {
        if (event.key === 'Escape') {
            closeNodeMap();
        }
    }

    function renderMapList() {
        if (!refs.mapList) return;
        const listEl = refs.mapList;
        listEl.innerHTML = '';
        if (!Array.isArray(state.maps) || !state.maps.length) {
            const empty = document.createElement('p');
            empty.textContent = 'マップがありません。「マップ追加」で新規作成してください。';
            empty.className = 'sandbox-note';
            listEl.appendChild(empty);
            return;
        }
        const activeId = state.activeMapId;
        const entryId = state.entryMapId;
        state.maps.forEach(map => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'sandbox-map-item';
            if (map.id === activeId) button.classList.add('active');
            if (map.id === entryId) button.classList.add('entry');
            const branchLabel = map.branchKey ? ` (${map.branchKey})` : '';
            button.textContent = `${map.floor}F ${map.label || ''}${branchLabel}`;
            button.addEventListener('click', () => {
                if (map.id !== state.activeMapId) {
                    activateMap(map.id, { preserveSelection: false });
                    render();
                }
            });
            listEl.appendChild(button);
        });

        const activeMap = getActiveMapRecord();
        if (refs.mapNameInput) {
            refs.mapNameInput.value = activeMap?.label || '';
            refs.mapNameInput.disabled = !activeMap;
        }
        if (refs.mapFloorInput) {
            refs.mapFloorInput.value = activeMap?.floor || 1;
            refs.mapFloorInput.disabled = !activeMap;
        }
        if (refs.mapBranchInput) {
            refs.mapBranchInput.value = activeMap?.branchKey || '';
            refs.mapBranchInput.disabled = !activeMap;
        }
        if (refs.setEntryMapButton) {
            refs.setEntryMapButton.disabled = !activeMap;
        }
        if (refs.nodeMapButton) {
            refs.nodeMapButton.disabled = !(Array.isArray(state.maps) && state.maps.length > 0);
        }
        if (refs.nodeMapDialog && refs.nodeMapDialog.classList.contains('open')) {
            renderNodeMap();
        }
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
        renderMapList();
        renderPlayerPreview();
        renderEnemies();
        renderDomains();
        renderPortals();
        renderColorPalette();
        renderValidation();
        renderIoStatus();
        if (refs.interactiveModeInput) {
            refs.interactiveModeInput.checked = !!state.interactiveMode;
        }
        restoreActiveInput(focusSnapshot);
    }

    function handleGridPointerDown(event) {
        if (typeof event.button === 'number' && event.button !== 0) return;
        const cell = getCellFromEvent(event);
        if (!cell) return;
        if (state.eyedropper?.active) {
            event.preventDefault();
            applyEyedropper(cell.x, cell.y);
            state.eyedropper.active = false;
            if (refs.eyedropperButton) refs.eyedropperButton.classList.remove('active');
            render();
            return;
        }
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
        const portalsHere = Array.isArray(state.portals)
            ? state.portals.filter(portal => portal && portal.x === cell.x && portal.y === cell.y)
            : [];
        if (portalsHere.length) {
            const portal = portalsHere[0];
            state.selectedPortalId = portal.id;
            state.brush = portal.type === 'stairs' ? 'stairs' : 'gate';
            render();
            return;
        }
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

    function addDomain() {
        const id = `domain-${domainSeq++}`;
        const domain = {
            id,
            name: `領域${state.domainEffects.length + 1}`,
            radius: 3,
            effects: [DOMAIN_EFFECT_OPTIONS[0].id],
            effectParams: {},
            x: state.lastCell?.x ?? null,
            y: state.lastCell?.y ?? null
        };
        ensureDomainEffectParamDefaults(domain);
        state.domainEffects.push(domain);
        state.selectedDomainId = id;
        render();
    }

    function fillGrid(value) {
        state.grid = createEmptyGrid(state.width, state.height, value);
        state.meta = createEmptyMeta(state.width, state.height);
        const map = getActiveMapRecord();
        if (map) {
            map.grid = state.grid;
            map.meta = state.meta;
        }
        if (value === 1) {
            state.playerStart = null;
            state.portals = [];
            state.enemies = state.enemies.map(enemy => ({ ...enemy, x: null, y: null }));
            state.domainEffects = state.domainEffects.map(effect => ({ ...effect, x: null, y: null }));
            if (map) {
                map.playerStart = null;
                map.portals = state.portals;
                map.enemies = state.enemies;
                map.domainEffects = state.domainEffects;
            }
        }
        render();
    }

    function clearMarkers() {
        state.playerStart = null;
        state.portals = [];
        const map = getActiveMapRecord();
        if (map) {
            map.playerStart = null;
            map.portals = state.portals;
        }
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
            domainList: panel.querySelector('#sandbox-domain-list'),
            addDomainButton: panel.querySelector('#sandbox-add-domain'),
            fillFloorButton: panel.querySelector('#sandbox-fill-floor'),
            fillWallButton: panel.querySelector('#sandbox-fill-wall'),
            clearMarkersButton: panel.querySelector('#sandbox-clear-markers'),
            brushFloorType: panel.querySelector('#sandbox-brush-floor-type'),
            brushFloorDirection: panel.querySelector('#sandbox-brush-floor-direction'),
            brushFloorColor: panel.querySelector('#sandbox-brush-floor-color'),
            brushFloorColorClear: panel.querySelector('#sandbox-brush-floor-color-clear'),
            brushWallColor: panel.querySelector('#sandbox-brush-wall-color'),
            brushWallColorClear: panel.querySelector('#sandbox-brush-wall-color-clear'),
            floorColorHint: panel.querySelector('#sandbox-floor-color-hint'),
            wallColorHint: panel.querySelector('#sandbox-wall-color-hint'),
            colorPalette: panel.querySelector('#sandbox-color-palette'),
            saveFloorColorButton: panel.querySelector('#sandbox-save-floor-color'),
            saveWallColorButton: panel.querySelector('#sandbox-save-wall-color'),
            clearPaletteButton: panel.querySelector('#sandbox-clear-palette'),
            eyedropperButton: panel.querySelector('#sandbox-eyedropper-button'),
            mapList: panel.querySelector('#sandbox-map-list'),
            addMapButton: panel.querySelector('#sandbox-add-map'),
            mapNameInput: panel.querySelector('#sandbox-map-name'),
            mapFloorInput: panel.querySelector('#sandbox-map-floor'),
            mapBranchInput: panel.querySelector('#sandbox-map-branch'),
            setEntryMapButton: panel.querySelector('#sandbox-set-entry-map'),
            nodeMapButton: panel.querySelector('#sandbox-node-map-button'),
            portalList: panel.querySelector('#sandbox-portal-list'),
            addPortalButton: panel.querySelector('#sandbox-add-portal'),
            validation: panel.querySelector('#sandbox-validation'),
            startButton: panel.querySelector('#sandbox-start-button'),
            exportButton: panel.querySelector('#sandbox-export-button'),
            importButton: panel.querySelector('#sandbox-import-button'),
            importFile: panel.querySelector('#sandbox-import-file'),
            interactiveModeInput: panel.querySelector('#sandbox-interactive-mode'),
            ioStatus: panel.querySelector('#sandbox-io-status'),
            nodeMapDialog: document.getElementById('sandbox-node-map-dialog'),
            nodeMapCanvas: document.getElementById('sandbox-node-map-canvas'),
            nodeMapClose: document.getElementById('sandbox-node-map-close')
        };

        state = {
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT,
            grid: createEmptyGrid(DEFAULT_WIDTH, DEFAULT_HEIGHT, 0),
            meta: createEmptyMeta(DEFAULT_WIDTH, DEFAULT_HEIGHT),
            brush: 'floor',
            lastCell: null,
            playerStart: { x: 1, y: 1 },
            playerLevel: DEFAULT_LEVEL,
            enemies: [],
            selectedEnemyId: null,
            domainEffects: [],
            selectedDomainId: null,
            portals: [],
            selectedPortalId: null,
            validation: { errors: [], warnings: [] },
            compiledConfig: null,
            tempMessage: '',
            brushSettings: { floorType: 'normal', floorColor: '', wallColor: '', floorDir: '' },
            renderMetrics: { cellSize: RENDER_CELL_SIZE, gap: RENDER_CELL_GAP, width: 0, height: 0 },
            ioStatus: { type: 'idle', message: '' },
            interactiveMode: false,
            maps: [],
            activeMapId: null,
            colorPalette: [],
            eyedropper: { active: false },
            entryMapId: null
        };

        const defaultMap = createMapRecord();
        state.maps.push(defaultMap);
        activateMap(defaultMap.id, { preserveSelection: false });
        state.entryMapId = defaultMap.id;

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
        if (refs.interactiveModeInput) {
            refs.interactiveModeInput.checked = !!state.interactiveMode;
            refs.interactiveModeInput.addEventListener('change', (e) => {
                state.interactiveMode = !!e.target.checked;
                renderValidation();
            });
        }
        if (refs.addEnemyButton) {
            refs.addEnemyButton.addEventListener('click', addEnemy);
        }
        if (refs.addDomainButton) {
            refs.addDomainButton.addEventListener('click', addDomain);
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
                const normalized = FLOOR_TYPES.includes(value) ? value : 'normal';
                state.brushSettings.floorType = normalized;
                if (!FLOOR_TYPES_NEED_DIRECTION.has(normalized)) {
                    state.brushSettings.floorDir = '';
                    if (refs.brushFloorDirection) refs.brushFloorDirection.value = '';
                }
                if (state.lastCell && state.grid?.[state.lastCell.y]?.[state.lastCell.x] === 0) {
                    applyFloorMetaToCell(state.lastCell.x, state.lastCell.y);
                }
                render();
            });
        }
        if (refs.brushFloorDirection) {
            refs.brushFloorDirection.addEventListener('change', (e) => {
                const value = typeof e.target.value === 'string' ? e.target.value : '';
                const normalized = FLOOR_DIRECTION_OPTIONS.includes(value) ? value : '';
                state.brushSettings.floorDir = normalized;
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
        if (refs.saveFloorColorButton) {
            refs.saveFloorColorButton.addEventListener('click', () => {
                state.colorPalette.push({
                    kind: 'floor',
                    floorColor: state.brushSettings.floorColor || '',
                    wallColor: state.brushSettings.wallColor || '',
                    floorType: state.brushSettings.floorType || 'normal',
                    floorDir: state.brushSettings.floorDir || ''
                });
                renderColorPalette();
            });
        }
        if (refs.saveWallColorButton) {
            refs.saveWallColorButton.addEventListener('click', () => {
                state.colorPalette.push({ kind: 'wall', wallColor: state.brushSettings.wallColor || '' });
                renderColorPalette();
            });
        }
        if (refs.clearPaletteButton) {
            refs.clearPaletteButton.addEventListener('click', () => {
                state.colorPalette = [];
                renderColorPalette();
            });
        }
        if (refs.eyedropperButton) {
            refs.eyedropperButton.addEventListener('click', () => {
                const next = !state.eyedropper?.active;
                state.eyedropper = { active: next };
                if (next) refs.eyedropperButton.classList.add('active');
                else refs.eyedropperButton.classList.remove('active');
            });
        }
        if (refs.addMapButton) {
            refs.addMapButton.addEventListener('click', () => {
                handleAddMap();
            });
        }
        if (refs.mapNameInput) {
            refs.mapNameInput.addEventListener('input', (e) => {
                const map = getActiveMapRecord();
                if (!map) return;
                map.label = e.target.value.slice(0, 40);
                renderMapList();
                renderPortals();
            });
        }
        if (refs.mapFloorInput) {
            refs.mapFloorInput.addEventListener('change', (e) => {
                const map = getActiveMapRecord();
                if (!map) return;
                const value = Math.max(1, Math.floor(Number(e.target.value) || map.floor || 1));
                map.floor = value;
                e.target.value = value;
                renderMapList();
                renderNodeMap();
                renderPortals();
            });
        }
        if (refs.mapBranchInput) {
            refs.mapBranchInput.addEventListener('input', (e) => {
                const map = getActiveMapRecord();
                if (!map) return;
                map.branchKey = e.target.value.slice(0, 12);
                renderMapList();
                renderNodeMap();
                renderPortals();
            });
        }
        if (refs.setEntryMapButton) {
            refs.setEntryMapButton.addEventListener('click', () => {
                const map = getActiveMapRecord();
                if (!map) return;
                state.entryMapId = map.id;
                renderMapList();
                if (refs.nodeMapDialog && refs.nodeMapDialog.classList.contains('open')) {
                    renderNodeMap();
                }
            });
        }
        if (refs.nodeMapButton) {
            refs.nodeMapButton.addEventListener('click', () => {
                openNodeMap();
            });
        }
        if (refs.nodeMapClose) {
            refs.nodeMapClose.addEventListener('click', () => {
                closeNodeMap();
            });
        }
        if (refs.nodeMapDialog) {
            refs.nodeMapDialog.addEventListener('click', (event) => {
                if (event.target === refs.nodeMapDialog) {
                    closeNodeMap();
                }
            });
        }
        if (refs.addPortalButton) {
            refs.addPortalButton.addEventListener('click', () => {
                handleAddPortal();
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

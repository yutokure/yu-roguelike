const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const playerStatsDiv = document.getElementById('player-stats');
const statLevel = document.getElementById('stat-level');
const statAtk = document.getElementById('stat-atk');
const statDef = document.getElementById('stat-def');
const statHpText = document.getElementById('stat-hp-text');
const statExpText = document.getElementById('stat-exp-text');
const hpBar = document.getElementById('hp-bar');
const expBar = document.getElementById('exp-bar');
const messageLogDiv = document.getElementById('message-log');
const MAX_LOG_LINES = 100;
let logBuffer = [];
const gameOverScreen = document.getElementById('game-over-screen');
const restartButton = document.getElementById('restart-button');
// Toolbar / Modals
const btnBack = document.getElementById('btn-back');
const btnItems = document.getElementById('btn-items');
const btnStatus = document.getElementById('btn-status');
const btnImport = document.getElementById('btn-import');
const btnExport = document.getElementById('btn-export');
const importFileInput = document.getElementById('import-file');
const itemsModal = document.getElementById('items-modal');
const statusModal = document.getElementById('status-modal');
const invPotion30 = document.getElementById('inv-potion30');
const invHpBoost = document.getElementById('inv-hp-boost');
const invAtkBoost = document.getElementById('inv-atk-boost');
const invDefBoost = document.getElementById('inv-def-boost');
const usePotion30Btn = document.getElementById('use-potion30');
const useHpBoostBtn = document.getElementById('use-hp-boost');
const useAtkBoostBtn = document.getElementById('use-atk-boost');
const useDefBoostBtn = document.getElementById('use-def-boost');
const statusDetails = document.getElementById('status-details');
// Selection screen
const selectionScreen = document.getElementById('selection-screen');
const gameScreen = document.getElementById('game-screen');
const difficultySelect = document.getElementById('difficulty-select');
const worldButtonsDiv = document.getElementById('world-buttons');
const dungeonButtonsDiv = document.getElementById('dungeon-buttons');
const playerSummaryDiv = document.getElementById('player-summary');
let selectionFooterCollapsed = false; // 選択画面フッターの折りたたみ状態

// ダンジョン詳細カード要素
const dungeonDetailCard = document.getElementById('dungeon-detail-card');
const dungeonNameEl = document.getElementById('dungeon-name');
const dungeonTypeEl = document.getElementById('dungeon-type');
const dungeonRecommendedLevelEl = document.getElementById('dungeon-recommended-level');
const dungeonDamageMultiplierEl = document.getElementById('dungeon-damage-multiplier');
const dungeonDescriptionEl = document.getElementById('dungeon-description');
const startDungeonBtn = document.getElementById('start-dungeon-btn');
// Tabs (Normal / BlockDim / MiniExp)
const tabBtnNormal = document.getElementById('tab-button-normal');
const tabBtnBlockDim = document.getElementById('tab-button-blockdim');
const tabBtnMiniExp = document.getElementById('tab-button-miniexp');
const tabBtnTools = document.getElementById('tab-button-tools');
const tabNormal = document.getElementById('tab-normal');
const tabBlockDim = document.getElementById('tab-blockdim');
const tabMiniExp = document.getElementById('tab-miniexp');
const tabTools = document.getElementById('tab-tools');
// MiniExp elements
const miniexpList = document.getElementById('miniexp-list');
const miniexpCatList = document.getElementById('miniexp-cat-list');
const miniexpPlaceholder = document.getElementById('miniexp-placeholder');
const miniexpStartBtn = document.getElementById('miniexp-start');
const miniexpQuitBtn = document.getElementById('miniexp-quit');
const miniexpPauseBtn = document.getElementById('miniexp-pause');
const miniexpRestartBtn = document.getElementById('miniexp-restart');
const miniexpDifficulty = document.getElementById('miniexp-difficulty');
const miniexpContainer = document.getElementById('miniexp-container');
// BlockDim UI elements
// BlockDim listbox UI elements
const bdimDimList = document.getElementById('bdim-list-dimension');
const bdim1List = document.getElementById('bdim-list-1st');
const bdim2List = document.getElementById('bdim-list-2nd');
const bdim3List = document.getElementById('bdim-list-3rd');
const bdimNestedInput = document.getElementById('bdim-nested');
const bdimStartBtn = document.getElementById('bdim-start-button');
const bdimAddBookmarkBtn = document.getElementById('bdim-add-bookmark');
const bdimClearHistoryBtn = document.getElementById('bdim-clear-history');
const bdimRandomBtn = document.getElementById('bdim-random-button');
const bdimWeightedRandomBtn = document.getElementById('bdim-weighted-random-button');
const bdimRandomTargetInput = document.getElementById('bdim-random-target');
const bdimRandomTypeSelect = document.getElementById('bdim-random-type');
const bdimHistoryDiv = document.getElementById('bdim-history');
const bdimBookmarksDiv = document.getElementById('bdim-bookmarks');
const bdimCardLevel = document.getElementById('bdim-card-level');
const bdimCardType = document.getElementById('bdim-card-type');
const bdimCardDepth = document.getElementById('bdim-card-depth');
const bdimCardSize = document.getElementById('bdim-card-size');
const bdimCardChest = document.getElementById('bdim-card-chest');
const bdimCardBoss = document.getElementById('bdim-card-boss');
const bdimCardSelection = document.getElementById('bdim-card-selection');

// 敵情報モーダル要素
const enemyInfoModal = document.getElementById('enemy-info-modal');
const enemyModalTitle = document.getElementById('enemy-modal-title');
const enemyModalLevel = document.getElementById('enemy-modal-level');
const enemyModalHp = document.getElementById('enemy-modal-hp');
const enemyModalAttack = document.getElementById('enemy-modal-attack');
const enemyModalDefense = document.getElementById('enemy-modal-defense');
const damageDealRange = document.getElementById('damage-deal-range');
const damageTakeRange = document.getElementById('damage-take-range');
const hitRate = document.getElementById('hit-rate');
const enemyHitRate = document.getElementById('enemy-hit-rate');

// ゲームの定数
const TILE_SIZE = 20;
// マップはビューポートより大きくする (動的サイズ: 15 + 階層 × 5)
let MAP_WIDTH = 60;  // Will be updated dynamically
let MAP_HEIGHT = 45; // Will be updated dynamically
// ビューポート（カメラ）サイズ（タイル数）
const VIEWPORT_WIDTH = 20;
const VIEWPORT_HEIGHT = 15;

// 現在モード: 'normal' | 'blockdim'
let currentMode = 'normal';
// MiniExp state (mods)
const MINI_ALL_CATEGORY = '__ALL__';
let miniExpState = { selected: null, difficulty: 'NORMAL', records: {}, category: MINI_ALL_CATEGORY };
let __miniExpInited = false;
let __miniManifest = null; // [{id,name,entry,version,author,icon,description}]
let __miniGameRegistry = {}; // id -> def
let __miniGameWaiters = {};  // id -> [resolve]
let __currentMini = null;    // runtime
let __miniSessionExp = 0;    // セッション内の獲得EXP合計
let __miniPaused = false;

let __toolsInited = false;
let modMakerRefs = null;

const MOD_MAKER_TEMPLATES = {
    blank: `function algorithm(ctx) {\n  const { width, height, map } = ctx;\n  for (let y = 1; y < height - 1; y++) {\n    for (let x = 1; x < width - 1; x++) {\n      map[y][x] = 0;\n    }\n  }\n  ctx.ensureConnectivity();\n}\n`,
    rooms: `function algorithm(ctx) {\n  const { width, height, map, random } = ctx;\n  const roomCount = Math.max(4, Math.floor((width + height) / 6));\n  const rooms = [];\n  for (let i = 0; i < roomCount; i++) {\n    const w = 4 + Math.floor(random() * 6);\n    const h = 4 + Math.floor(random() * 6);\n    const x = 2 + Math.floor(random() * Math.max(1, width - w - 4));\n    const y = 2 + Math.floor(random() * Math.max(1, height - h - 4));\n    rooms.push({ x, y, w, h });\n    for (let yy = y; yy < y + h; yy++) {\n      for (let xx = x; xx < x + w; xx++) map[yy][xx] = 0;\n    }\n  }\n  for (let i = 1; i < rooms.length; i++) {\n    const a = rooms[i - 1];\n    const b = rooms[i];\n    const ax = a.x + (a.w >> 1);\n    const ay = a.y + (a.h >> 1);\n    const bx = b.x + (b.w >> 1);\n    const by = b.y + (b.h >> 1);\n    for (let xx = Math.min(ax, bx); xx <= Math.max(ax, bx); xx++) map[ay][xx] = 0;\n    for (let yy = Math.min(ay, by); yy <= Math.max(ay, by); yy++) map[yy][bx] = 0;\n  }\n  ctx.ensureConnectivity();\n}\n`,
    structure: `function algorithm(ctx) {\n  const { width, height, map, random, structures } = ctx;\n  for (let y = 1; y < height - 1; y++) {\n    for (let x = 1; x < width - 1; x++) map[y][x] = 1;\n  }\n  const cx = Math.floor(width / 2);\n  const cy = Math.floor(height / 2);\n  if (structures && typeof structures.list === 'function') {\n    const pool = structures.list();\n    if (pool && pool.length) {\n      const rand = typeof random === 'function' ? random : Math.random;\n      const chosen = pool[Math.floor(rand() * pool.length) % pool.length];\n      if (chosen && chosen.id) {\n        const rot = Math.floor(rand() * 360) % 360;\n        structures.place(chosen.id, cx, cy, { rotation: rot });\n      }\n    }\n  }\n  ctx.ensureConnectivity();\n}\n`
};

MOD_MAKER_TEMPLATES.fixed = `function algorithm(ctx) {\n  const applied = ctx.fixedMaps?.applyCurrent?.();\n  if (!applied) {\n    for (let y = 1; y < ctx.height - 1; y++) {\n      for (let x = 1; x < ctx.width - 1; x++) ctx.map[y][x] = 0;\n    }\n    ctx.ensureConnectivity();\n  }\n}\n`;

const modMakerState = {
    metadata: {
        id: 'custom_pack',
        name: 'Custom Dungeon Pack',
        version: '1.0.0',
        author: '',
        description: ''
    },
    structures: [],
    generators: [],
    blocks: {
        blocks1: [],
        blocks2: [],
        blocks3: []
    },
    selectedStructure: 0,
    selectedGenerator: 0
};

let modMakerCopyTimer = null;
let modMakerCopyLabel = 'クリップボードにコピー';

// マップサイズを階層に応じて更新（BlockDim の sizeFactor を反映）
function updateMapSize() {
    const baseSize = 15 + dungeonLevel * 5;
    let width = baseSize;
    let height = baseSize;
    if (currentMode === 'blockdim' && blockDimState?.spec) {
        // 1段階=±2 タイル程度
        const delta = (blockDimState.spec.sizeFactor || 0) * 2;
        width = Math.max(15, baseSize + delta);
        height = Math.max(15, baseSize + delta);
    }
    MAP_WIDTH = width;
    MAP_HEIGHT = height;
}

// キャンバスのサイズ設定（親ステージに追従）
function resizeCanvasToStage() {
    const stage = document.getElementById('game-stage');
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}
resizeCanvasToStage();
window.addEventListener('resize', resizeCanvasToStage);
window.addEventListener('resize', () => {
    // in-game 時はツールバーの高さを再計測して反映
    if (document.body.classList.contains('in-game')) {
        const tb = document.getElementById('toolbar');
        const h = tb ? Math.ceil(tb.getBoundingClientRect().height) : 0;
        document.documentElement.style.setProperty('--toolbar-height', h + 'px');
    }
    // 選択画面フッター高さも再計測
    measureSelectionFooterHeight();
    // BlockDim リストの高さも更新
    refreshBdimListHeights();
});

function refreshBdimListHeights() {
    try { setScrollableList(bdimHistoryDiv, 5); } catch {}
    try { setScrollableList(bdimBookmarksDiv, 5); } catch {}
}

// 探索画面のレイアウト（全画面化とツールバー高さの反映）
function enterInGameLayout() {
    try {
        document.body.classList.add('in-game');
        const tb = document.getElementById('toolbar');
        const h = tb ? Math.ceil(tb.getBoundingClientRect().height) : 0;
        document.documentElement.style.setProperty('--toolbar-height', h + 'px');
        // 可視化時にキャンバスを再調整
        setTimeout(resizeCanvasToStage, 0);
    } catch {}
}
function leaveInGameLayout() {
    try {
        document.body.classList.remove('in-game');
        document.body.classList.remove('modal-open');
        document.documentElement.style.removeProperty('--toolbar-height');
        setTimeout(resizeCanvasToStage, 0);
    } catch {}
}

// 探索画面での矢印キーによるスクロール抑止
function isGameScreenVisible() {
    return gameScreen && gameScreen.style.display !== 'none';
}
window.addEventListener('keydown', (e) => {
    if (!isGameScreenVisible()) return;
    if (isAnyModalOpen()) return; // モーダル中はスクロールや入力を妨げない
    const k = e.key;
    if (k === 'ArrowUp' || k === 'ArrowDown' || k === 'ArrowLeft' || k === 'ArrowRight') {
        e.preventDefault();
    }
}, { passive: false });

// 選択画面を表示する共通関数（全経路統一）
function showSelectionScreen(opts = {}) {
    const {
        stopLoop = true,
        refillHp = true,
        resetModeToNormal = true,
        rebuildSelection = true,
    } = opts;

    try {
        if (stopLoop) stopGameLoop();
    } catch {}

    // 画面表示切り替え
    if (gameScreen) gameScreen.style.display = 'none';
    const tb = document.getElementById('toolbar');
    if (tb) tb.style.display = 'none';
    if (selectionScreen) selectionScreen.style.display = 'flex';
    leaveInGameLayout();

    // 状態のリセット
    if (refillHp) player.hp = player.maxHp;
    isGameOver = false;
    if (resetModeToNormal) {
        currentMode = 'normal';
        restoreRandom();
    }

    // 選択画面の再構築
    if (rebuildSelection) {
        try { buildSelection(); } catch {}
        try { updateUI(); } catch {}
    }
    // フッター高さを反映
    setTimeout(measureSelectionFooterHeight, 0);
}

// 選択画面のフッター高さを CSS 変数へ反映
function measureSelectionFooterHeight() {
    try {
        if (!selectionScreen || selectionScreen.style.display === 'none') return;
        const footer = playerSummaryDiv;
        if (!footer) return;
        let h;
        if (footer.classList.contains('collapsed')) {
            // 折りたたみ時はトグルボタン分のみ（最低高）
            h = 42; // ボタン＋余白の目安
        } else {
            h = Math.ceil(footer.getBoundingClientRect().height);
        }
        document.documentElement.style.setProperty('--selection-footer-h', (h + 16) + 'px');
    } catch {}
}

function toggleSelectionFooter(forceCollapsed) {
    if (!playerSummaryDiv) return;
    const next = forceCollapsed !== undefined ? !!forceCollapsed : !playerSummaryDiv.classList.contains('collapsed');
    playerSummaryDiv.classList.toggle('collapsed', next);
    selectionFooterCollapsed = next;
    // ボタン表示を更新
    const btn = document.getElementById('player-summary-toggle');
    if (btn) {
        btn.textContent = next ? '∧' : '∨';
        btn.setAttribute('aria-expanded', String(!next));
        btn.title = next ? '展開' : '折りたたみ';
    }
    measureSelectionFooterHeight();
}

// マップデータ
let map = [];

// タイルの表示・挙動拡張
const DEFAULT_WALL_COLOR = '#2f3542';
const DEFAULT_FLOOR_COLOR = '#ced6e0';
const FLOOR_TYPE_NORMAL = 'normal';
const FLOOR_TYPE_ICE = 'ice';
const FLOOR_TYPE_POISON = 'poison';
let tileMeta = [];

function resetTileMetadata() {
    tileMeta = Array.from({ length: MAP_HEIGHT }, () => Array(MAP_WIDTH).fill(null));
}

function ensureTileMeta(x, y) {
    if (y < 0 || y >= MAP_HEIGHT || x < 0 || x >= MAP_WIDTH) return null;
    if (!tileMeta[y]) tileMeta[y] = Array(MAP_WIDTH).fill(null);
    if (!tileMeta[y][x]) tileMeta[y][x] = {};
    return tileMeta[y][x];
}

function getTileMeta(x, y) {
    if (y < 0 || y >= MAP_HEIGHT || x < 0 || x >= MAP_WIDTH) return null;
    return tileMeta[y] ? tileMeta[y][x] : null;
}

function getTileFloorType(x, y) {
    if (!map[y] || map[y][x] !== 0) return FLOOR_TYPE_NORMAL;
    const meta = getTileMeta(x, y);
    if (!meta || !meta.floorType) return FLOOR_TYPE_NORMAL;
    const t = meta.floorType;
    return (t === FLOOR_TYPE_ICE || t === FLOOR_TYPE_POISON) ? t : FLOOR_TYPE_NORMAL;
}

function getTileRenderColor(x, y, isWall) {
    const meta = getTileMeta(x, y);
    if (isWall) {
        return (meta && meta.wallColor) || DEFAULT_WALL_COLOR;
    }
    if (meta && meta.floorColor) {
        return meta.floorColor;
    }
    const type = getTileFloorType(x, y);
    if (type === FLOOR_TYPE_ICE) return '#74c0fc';
    if (type === FLOOR_TYPE_POISON) return '#94d82d';
    return DEFAULT_FLOOR_COLOR;
}

// プレイヤー
const player = {
    x: 0, // Will be set dynamically
    y: 0, // Will be set dynamically
    level: 1,
    exp: 0,
    maxHp: 100,
    hp: 100,
    attack: 10,
    defense: 10,
    facing: 'down',
    inventory: { 
        potion30: 0,
        hpBoost: 0,
        atkBoost: 0,
        defBoost: 0
    }
};

// Track previous values for change indicators
let prevHp = 100;
let prevExp = 0;
let activePopupGroup = [];
let popupGroupTimer = null;

// 敵
let enemies = [];
let ENEMY_COUNT = 8;

// アイテム

// -------------------- Modal helpers --------------------
let __openModalCount = 0;
function isAnyModalOpen() {
    if (__openModalCount > 0) return true;
    try {
        const modals = document.querySelectorAll('.modal');
        for (const m of modals) {
            const s = window.getComputedStyle(m);
            if (s && s.display !== 'none' && s.visibility !== 'hidden' && parseFloat(s.opacity || '1') > 0) {
                return true;
            }
        }
    } catch {}
    return false;
}
function updateModalBodyState() {
    if (isAnyModalOpen()) document.body.classList.add('modal-open');
    else document.body.classList.remove('modal-open');
}
function openModal(el) {
    if (!el) return;
    if (el.style.display !== 'flex') {
        el.style.display = 'flex';
        __openModalCount++;
        updateModalBodyState();
    }
}
function closeModal(el) {
    if (!el) return;
    if (el.style.display !== 'none') {
        el.style.display = 'none';
        __openModalCount = Math.max(0, __openModalCount - 1);
        updateModalBodyState();
    }
}
let items = [];
let POTION_COUNT = 5;

// 階段
let stairs = { x: 0, y: 0 };
// 直近に生成に使用した実タイプ（mixedの内訳反映用）
let lastGeneratedGenType = null;

// ダンジョン情報
const dungeonInfo = {
    1: { name: "初心者の森", type: "field", description: "広い草原に点在する障害物" },
    11: { name: "暗闇の洞窟", type: "cave", description: "曲がりくねった洞窟システム" },
    21: { name: "迷宮の遺跡", type: "narrow-maze", description: "細かく複雑な迷路構造の古代遺跡" },
    31: { name: "地下神殿", type: "rooms", description: "部屋と通路で構成された神殿" },
    41: { name: "魔法の庭園", type: "circle", description: "魔力に満ちた円形の庭園" },
    51: { name: "水晶の洞窟", type: "snake", description: "蛇行する水晶の洞窟" },
    61: { name: "古代の迷宮", type: "wide-maze", description: "時を超えた巨大迷宮" },
    71: { name: "竜の巣窟", type: "circle-rooms", description: "円形の部屋が連なる竜の巣穴" },
    81: { name: "星の平原", type: "single-room", description: "星空が美しい一つの大きな部屋" },
    91: { name: "終焉の塔", type: "mixed", description: "様々な構造が混在する世界の終わりの塔" },
    // X世界用
    'X': { name: "極限の地", type: "mixed", description: "25階層の終極ダンジョン" }
};

// ダンジョンレベル
let dungeonLevel = 1;
let selectedWorld = 'A'; // A..J or X
let selectedDungeonBase = 1; // 1,11,...,91
let difficulty = 'Normal';
let isGameOver = false;
let chests = [];
let bossAlive = false;

// -------------------- BlockDim: data/state/helpers (UI only for now) --------------------
let blockDimState = { enabled: false, dimKey: 'a', b1Key: null, b2Key: null, b3Key: null, spec: null };
let blockDimTables = { dimensions: [], blocks1: [], blocks2: [], blocks3: [] };
let blockDimHistory = [];
let blockDimBookmarks = [];
let __lastSavedBlockDimSelectionKey = null;

function clamp(min, max, v) { return Math.max(min, Math.min(max, v)); }
function majority(arr) {
    const cnt = { less:0, normal:0, more:0 };
    for (const v of arr) if (v && cnt.hasOwnProperty(v)) cnt[v]++;
    if (cnt.normal >= cnt.more && cnt.normal >= cnt.less) return 'normal';
    if (cnt.more >= cnt.less) return 'more';
    return 'less';
}
function pickPriority(arr) { for (const t of arr) if (t) return t; return null; }
function unionNormalize(listOfLists) {
    const s = new Set();
    for (const lst of listOfLists) for (const x of (lst||[])) s.add(x);
    return Array.from(s).sort((a,b)=>a-b);
}
function composeSpec(dim, b1, b2, b3, nested = 1) {
    if (!dim || !b1 || !b2 || !b3) return null;
    const base = dim.baseLevel || 1;
    const nestedOffset = 2600 * Math.max(0, ((nested|0) - 1));
    const level = Math.max(1, base + (b1.level||0) + (b2.level||0) + (b3.level||0) + nestedOffset);
    // サイズはブロック合計そのまま（-2..+2で丸め）
    const rawSize = (b1.size||0) + (b2.size||0) + (b3.size||0);
    const sizeFactor = clamp(-2, 2, rawSize);
    const depth = clamp(1, 15, 1 + (b1.depth||0) + (b2.depth||0) + (b3.depth||0));
    const chestBias = majority([b1.chest, b2.chest, b3.chest]);
    // 新仕様: タイプはブロック由来の組み合わせで混合させる
    const pool = [b1.type, b2.type, b3.type].filter(t => !!t);
    const uniquePool = Array.from(new Set(pool));
    const type = uniquePool.length === 1 ? uniquePool[0] : 'mixed';
    const bossFloors = unionNormalize([b1.bossFloors, b2.bossFloors, b3.bossFloors]).filter(n => n>=1 && n<=depth);
    // typePool を追加して混合対象を明示（空ならデフォルト混合）
    return { level, sizeFactor, depth, chestBias, type, bossFloors, typePool: uniquePool };
}

function snapshotBlockDimSelection(state) {
    if (!state || !state.enabled) return null;
    return JSON.stringify({
        nested: state.nested || 1,
        dimKey: state.dimKey || null,
        b1Key: state.b1Key || null,
        b2Key: state.b2Key || null,
        b3Key: state.b3Key || null
    });
}

// ---- Deterministic RNG (seeded) ----
let __originalRandom = Math.random;
let __seededActive = false;

function hash32(str) {
    // FNV-1a 32bit
    let h = 0x811c9dc5 >>> 0;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
        h >>>= 0;
    }
    return h >>> 0;
}

function mulberry32(seed) {
    let a = seed >>> 0;
    return function() {
        a = (a + 0x6D2B79F5) >>> 0;
        let t = a ^ (a >>> 15);
        t = Math.imul(t, a | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), a | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function seedFromSelection(dimKey, b1Key, b2Key, b3Key) {
    const base = `${dimKey}|${b1Key}|${b2Key}|${b3Key}`;
    return hash32(base);
}

function mixSeed(base, floor) {
    // 0x9e3779b1 is Knuth's constant
    const mixed = (base ^ ((floor >>> 0) * 0x9e3779b1)) >>> 0;
    return mixed >>> 0;
}

function setSeededRandom(seed) {
    Math.random = mulberry32(seed >>> 0);
    __seededActive = true;
}

function restoreRandom() {
    if (__seededActive) {
        Math.random = __originalRandom;
        __seededActive = false;
    }
}

function reseedBlockDimForFloor() {
    if (currentMode !== 'blockdim' || !blockDimState?.spec) return;
    const baseSeed = blockDimState.seed ?? seedFromSelection(blockDimState.dimKey, blockDimState.b1Key, blockDimState.b2Key, blockDimState.b3Key);
    blockDimState.seed = baseSeed;
    const floorSeed = mixSeed(baseSeed, dungeonLevel);
    setSeededRandom(floorSeed);
}

// BlockDim: フロア/ボス判定ユーティリティ
function getMaxFloor() {
    if (currentMode === 'blockdim' && blockDimState?.spec) {
        return Math.max(1, Math.min(15, blockDimState.spec.depth || 10));
    }
    const genType = resolveCurrentGeneratorType();
    if (genType) {
        const def = DungeonGenRegistry.get(genType);
        if (def && def.floors && Number.isFinite(def.floors.max)) {
            return Math.max(1, Math.floor(def.floors.max));
        }
        const bundle = FixedMapRegistry.get(genType);
        if (bundle && Number.isFinite(bundle.max)) {
            return Math.max(1, Math.floor(bundle.max));
        }
    }
    return selectedWorld === 'X' ? 25 : 10;
}

function isBossFloor(level) {
    if (currentMode === 'blockdim' && blockDimState?.spec) {
        const list = blockDimState.spec.bossFloors || [];
        return list.includes(level);
    }
    const genType = resolveCurrentGeneratorType();
    if (genType) {
        const def = DungeonGenRegistry.get(genType);
        if (def && def.floors) {
            if (Array.isArray(def.floors.bossFloors) && def.floors.bossFloors.includes(level)) return true;
            if (Number.isFinite(def.floors.max) && level === Math.floor(def.floors.max)) return true;
            return false;
        }
        const bundle = FixedMapRegistry.get(genType);
        if (bundle) {
            if (Array.isArray(bundle.bossFloors) && bundle.bossFloors.includes(level)) return true;
            if (Number.isFinite(bundle.max) && level === Math.floor(bundle.max)) return true;
        }
    }
    return level === (selectedWorld === 'X' ? 25 : 10);
}

async function loadBlockDataOnce() {
    if (blockDimTables.__loaded) return blockDimTables;
    try {
        const res = await fetch('blockdata.json', { cache: 'no-store' });
        const json = await res.json();
        // Dimensions: if provided use it, else synthesize a..z 100刻み
        let dims = json.dimensions;
        if (!Array.isArray(dims) || dims.length === 0) {
            dims = Array.from({length:26}, (_,i) => {
                const key = String.fromCharCode('a'.charCodeAt(0)+i);
                return { key, name: key.toUpperCase(), baseLevel: 1 + i*100 };
            });
        }
        blockDimTables = {
            dimensions: dims,
            blocks1: Array.isArray(json.blocks1) ? json.blocks1 : [],
            blocks2: Array.isArray(json.blocks2) ? json.blocks2 : [],
            blocks3: Array.isArray(json.blocks3) ? json.blocks3 : [],
            __loaded: true
        };
        try { flushPendingDungeonBlocks && flushPendingDungeonBlocks(); } catch {}
    } catch (e) {
        console.error('Failed to load blockdata.json', e);
        // file:// プロトコル時のフォールバック: blockdata.js を script タグで読み込む
        if (location.protocol === 'file:') {
            try {
                const data = await loadBlockDataViaScript();
                let dims = data.dimensions;
                if (!Array.isArray(dims) || dims.length === 0) {
                    dims = Array.from({length:26}, (_,i) => {
                        const key = String.fromCharCode('a'.charCodeAt(0)+i);
                        return { key, name: key.toUpperCase(), baseLevel: 1 + i*100 };
                    });
                }
                blockDimTables = {
                    dimensions: dims,
                    blocks1: Array.isArray(data.blocks1) ? data.blocks1 : [],
                    blocks2: Array.isArray(data.blocks2) ? data.blocks2 : [],
                    blocks3: Array.isArray(data.blocks3) ? data.blocks3 : [],
                    __loaded: true
                };
                try { flushPendingDungeonBlocks && flushPendingDungeonBlocks(); } catch {}
                return blockDimTables;
            } catch (e2) {
                console.error('Failed to load blockdata.js fallback', e2);
            }
        }
        // 最小フォールバック（UIを壊さない）
        blockDimTables = {
            dimensions: [{ key:'a', name:'A', baseLevel:1 }],
            blocks1: [{ key:'b1001', name:'サンプル1', level:0, size:0, depth:0, chest:'normal', type:null, bossFloors:[] }],
            blocks2: [{ key:'b2001', name:'サンプル2', level:0, size:0, depth:0, chest:'normal', type:null, bossFloors:[] }],
            blocks3: [{ key:'b3001', name:'サンプル3', level:0, size:0, depth:0, chest:'normal', type:null, bossFloors:[] }],
            __loaded: true
        };
        try { flushPendingDungeonBlocks && flushPendingDungeonBlocks(); } catch {}
    }
    return blockDimTables;
}

function loadBlockDataViaScript() {
    return new Promise((resolve, reject) => {
        if (window.__BLOCKDATA) {
            resolve(window.__BLOCKDATA);
            return;
        }
        const s = document.createElement('script');
        s.src = 'blockdata.js';
        s.onload = () => resolve(window.__BLOCKDATA || {});
        s.onerror = reject;
        document.head.appendChild(s);
    });
}

// Listbox helpers
function buildList(listEl, data, selectedKey, labelFn) {
    if (!listEl) return;
    listEl.innerHTML = '';
    data.forEach((entry, idx) => {
        const opt = document.createElement('div');
        opt.className = 'bdim-option' + (entry.key === selectedKey ? ' selected' : '');
        opt.setAttribute('role','option');
        opt.dataset.key = entry.key;
        const name = document.createElement('span');
        name.textContent = labelFn ? labelFn(entry, idx) : (entry.name || entry.key);
        opt.appendChild(name);
        if (typeof entry.level === 'number' || entry.type) {
            const tag = document.createElement('span');
            tag.className = 'bdim-tag';
            const parts = [];
            if (typeof entry.level === 'number') parts.push(`Lv${entry.level>=0?'+':''}${entry.level}`);
            if (entry.type) parts.push(entry.type);
            tag.textContent = parts.join(' / ');
            opt.appendChild(tag);
        }
        opt.addEventListener('click', () => {
            selectOption(listEl, entry.key);
            onBlockDimChanged();
        });
        listEl.appendChild(opt);
    });
}

function selectOption(listEl, key) {
    if (!listEl) return;
    listEl.querySelectorAll('.bdim-option').forEach(el => el.classList.remove('selected'));
    const target = Array.from(listEl.querySelectorAll('.bdim-option')).find(el => el.dataset.key === key);
    if (target) {
        target.classList.add('selected');
        target.scrollIntoView({ block: 'nearest' });
    }
}

function getSelectedKey(listEl) {
    const sel = listEl && listEl.querySelector('.bdim-option.selected');
    return sel ? sel.dataset.key : null;
}

function enableListKeyboardNavigation(listEl) {
    if (!listEl) return;
    listEl.addEventListener('keydown', (e) => {
        if (!['ArrowDown','ArrowUp','Enter',' '].includes(e.key)) return;
        const options = Array.from(listEl.querySelectorAll('.bdim-option'));
        if (options.length === 0) return;
        let idx = options.findIndex(o => o.classList.contains('selected'));
        if (e.key === 'ArrowDown') { idx = Math.min(options.length-1, idx+1); }
        if (e.key === 'ArrowUp')   { idx = Math.max(0, idx-1); }
        if (e.key === 'Enter' || e.key === ' ') {
            // keep idx
        }
        e.preventDefault();
        options.forEach(o => o.classList.remove('selected'));
        options[idx].classList.add('selected');
        options[idx].scrollIntoView({ block: 'nearest' });
        onBlockDimChanged();
    });
}

function renderBdimPreview(spec) {
    if (!spec) {
        if (bdimCardSelection) bdimCardSelection.textContent = '-';
        bdimCardLevel.textContent = '-';
        bdimCardType.textContent = '-';
        bdimCardDepth.textContent = '-';
        bdimCardSize.textContent = '-';
        bdimCardChest.textContent = '-';
        bdimCardBoss.textContent = '-';
        return;
    }
    if (bdimCardSelection) {
        const dimKey = blockDimState?.dimKey || 'a';
        const b1Key = blockDimState?.b1Key || '';
        const b2Key = blockDimState?.b2Key || '';
        const b3Key = blockDimState?.b3Key || '';
        const nested = blockDimState?.nested || 1;
        const b1 = (blockDimTables.blocks1.find(b=>b.key===b1Key)||{}).name || b1Key;
        const b2 = (blockDimTables.blocks2.find(b=>b.key===b2Key)||{}).name || b2Key;
        const b3 = (blockDimTables.blocks3.find(b=>b.key===b3Key)||{}).name || b3Key;
        bdimCardSelection.textContent = `NESTED ${nested} ／ 次元 ${String(dimKey).toUpperCase()}：${b1}・${b2}・${b3}`;
    }
    bdimCardLevel.textContent = String(spec.level);
    bdimCardType.textContent = formatSpecType(spec);
    bdimCardDepth.textContent = String(spec.depth);
    bdimCardSize.textContent = String(spec.sizeFactor);
    bdimCardChest.textContent = String(spec.chestBias);
    bdimCardBoss.textContent = (spec.bossFloors||[]).join(',');
}

function formatSpecType(spec) {
    if (!spec) return '-';
    if (spec.type === 'mixed') {
        const pool = Array.isArray(spec.typePool) ? spec.typePool : [];
        if (pool.length === 0) return getDungeonTypeName('mixed');
        const names = pool.map(t => getDungeonTypeName(t));
        return `${getDungeonTypeName('mixed')}（${names.join('＋')}）`;
    }
    return getDungeonTypeName(spec.type);
}

async function initBlockDimUI() {
    await loadBlockDataOnce();
    // Build listboxes
    const selDim = blockDimState.dimKey || (blockDimTables.dimensions[0]?.key);
    const sel1 = blockDimState.b1Key || (blockDimTables.blocks1[0]?.key);
    const sel2 = blockDimState.b2Key || (blockDimTables.blocks2[0]?.key);
    const sel3 = blockDimState.b3Key || (blockDimTables.blocks3[0]?.key);
    buildList(bdimDimList, blockDimTables.dimensions, selDim, (d)=> `${d.name} (Lv${d.baseLevel})`);
    buildList(bdim1List, blockDimTables.blocks1, sel1, (b)=> b.name);
    buildList(bdim2List, blockDimTables.blocks2, sel2, (b)=> b.name);
    buildList(bdim3List, blockDimTables.blocks3, sel3, (b)=> b.name);
    enableListKeyboardNavigation(bdimDimList);
    enableListKeyboardNavigation(bdim1List);
    enableListKeyboardNavigation(bdim2List);
    enableListKeyboardNavigation(bdim3List);
    // NESTED 初期値とイベント
    if (bdimNestedInput) {
        const initialNested = clamp(1, 99999999, (blockDimState?.nested|0) || 1);
        bdimNestedInput.value = initialNested;
        bdimNestedInput.addEventListener('input', onBlockDimChanged);
        bdimNestedInput.addEventListener('change', onBlockDimChanged);
    }
    // First render
    onBlockDimChanged();
    if (bdimStartBtn) { bdimStartBtn.disabled = false; bdimStartBtn.title = ''; }
    renderHistoryAndBookmarks();
}

function onBlockDimChanged() {
    if (!blockDimTables.__loaded) return;
    const dimKey = getSelectedKey(bdimDimList) || blockDimTables.dimensions[0]?.key;
    const b1Key  = getSelectedKey(bdim1List)  || blockDimTables.blocks1[0]?.key;
    const b2Key  = getSelectedKey(bdim2List)  || blockDimTables.blocks2[0]?.key;
    const b3Key  = getSelectedKey(bdim3List)  || blockDimTables.blocks3[0]?.key;
    const dim = blockDimTables.dimensions.find(d=>d.key===dimKey) || blockDimTables.dimensions[0];
    const b1  = blockDimTables.blocks1.find(b=>b.key===b1Key)     || blockDimTables.blocks1[0];
    const b2  = blockDimTables.blocks2.find(b=>b.key===b2Key)     || blockDimTables.blocks2[0];
    const b3  = blockDimTables.blocks3.find(b=>b.key===b3Key)     || blockDimTables.blocks3[0];
    const nested = clamp(1, 99999999, parseInt(bdimNestedInput?.value)||1);
    const spec = composeSpec(dim, b1, b2, b3, nested);
    const seed = seedFromSelection(dim.key, b1.key, b2.key, b3.key);
    blockDimState = { enabled: true, nested, dimKey: dim.key, b1Key: b1.key, b2Key: b2.key, b3Key: b3.key, spec, seed };
    renderBdimPreview(spec);
    // Preview updated
    const selectionSnapshot = snapshotBlockDimSelection(blockDimState);
    if (selectionSnapshot !== __lastSavedBlockDimSelectionKey) {
        try {
            saveAll();
            __lastSavedBlockDimSelectionKey = selectionSnapshot;
        } catch (err) {
            console.error('Failed to persist BlockDim selection', err);
        }
    }
}

// 1st/2nd/3rd をランダムに選択
function randomizeBdimBlocks() {
    if (!blockDimTables.__loaded) return;
    const pickRandomKeyFrom = (listEl) => {
        if (!listEl) return null;
        const options = Array.from(listEl.querySelectorAll('.bdim-option'));
        if (options.length === 0) return null;
        const idx = Math.floor(Math.random() * options.length);
        return options[idx].dataset.key || null;
    };
    const k1 = pickRandomKeyFrom(bdim1List);
    const k2 = pickRandomKeyFrom(bdim2List);
    const k3 = pickRandomKeyFrom(bdim3List);
    if (k1) selectOption(bdim1List, k1);
    if (k2) selectOption(bdim2List, k2);
    if (k3) selectOption(bdim3List, k3);
    onBlockDimChanged();
}

// ------- 重み付きランダム（Lvターゲット＋タイプ優先） -------
function clampInt(v, lo, hi, def=0) {
    const n = Number.isFinite(+v) ? Math.trunc(+v) : def;
    return Math.max(lo, Math.min(hi, n));
}

function gaussianWeight(x, mu, sigma) {
    const d = (x - mu);
    const s2 = sigma * sigma;
    return Math.exp(-(d*d) / (2 * s2));
}

function pickWeighted(arr, desiredLevel, typePref, sigma=3.5, typeBoost=2.0) {
    if (!Array.isArray(arr) || arr.length === 0) return null;
    let total = 0;
    const weights = arr.map(b => {
        const lv = Number.isFinite(b.level) ? b.level : 0;
        const wl = gaussianWeight(lv, desiredLevel, sigma);
        const wt = (typePref && b.type === typePref) ? typeBoost : 1.0;
        const w = Math.max(1e-6, wl * wt);
        total += w;
        return w;
    });
    if (total <= 0) return arr[Math.floor(Math.random() * arr.length)];
    let r = Math.random() * total;
    for (let i=0;i<arr.length;i++) { r -= weights[i]; if (r <= 0) return arr[i]; }
    return arr[arr.length-1];
}

function weightedRandomizeBdimBlocks(targetSumRaw, typePrefRaw) {
    if (!blockDimTables.__loaded) return;
    const targetSum = clampInt(targetSumRaw, -10, 102, 0); // ブロック合計Lv（次元は無視）
    const typePref = (typePrefRaw || '').trim() || null;   // 例: 'maze' 等

    const arr1 = blockDimTables.blocks1 || [];
    const arr2 = blockDimTables.blocks2 || [];
    const arr3 = blockDimTables.blocks3 || [];
    if (arr1.length===0 || arr2.length===0 || arr3.length===0) return;

    const desired1 = Math.round(targetSum / 3);
    let best = null; // {b1,b2,b3,diff}

    // 複数試行して「合計一致」を優先的に探す（最大64回）
    for (let attempt = 0; attempt < 64; attempt++) {
        const t1 = pickWeighted(arr1, desired1, typePref);
        const l1 = Number.isFinite(t1?.level) ? t1.level : 0;
        const desired2 = Math.round((targetSum - l1) / 2);
        const t2 = pickWeighted(arr2, desired2, typePref);
        const l2 = Number.isFinite(t2?.level) ? t2.level : 0;
        const need3 = targetSum - l1 - l2;
        let t3 = arr3.find(x => (Number.isFinite(x.level)?x.level:0) === need3) || null;
        if (!t3) t3 = pickWeighted(arr3, need3, typePref);
        const l3 = Number.isFinite(t3?.level) ? t3.level : 0;
        const diff = Math.abs((l1 + l2 + l3) - targetSum);
        if (!best || diff < best.diff) best = { b1: t1, b2: t2, b3: t3, diff };
        if (diff === 0) break;
    }

    if (best?.b1?.key) selectOption(bdim1List, best.b1.key);
    if (best?.b2?.key) selectOption(bdim2List, best.b2.key);
    if (best?.b3?.key) selectOption(bdim3List, best.b3.key);
    onBlockDimChanged();
}

// ------- BlockDim 履歴/ブックマーク -------
function bdimKey(nested, dimKey, b1, b2, b3) {
    return `${nested}|${dimKey}|${b1}|${b2}|${b3}`;
}

function labelForEntry(entry) {
    // Human readable short label
    const dim = (blockDimTables.dimensions.find(d=>d.key===entry.dim)||{name:entry.dim}).name;
    const b1 = (blockDimTables.blocks1.find(b=>b.key===entry.b1)||{name:entry.b1}).name;
    const b2 = (blockDimTables.blocks2.find(b=>b.key===entry.b2)||{name:entry.b2}).name;
    const b3 = (blockDimTables.blocks3.find(b=>b.key===entry.b3)||{name:entry.b3}).name;
    const nested = entry.nested || 1;
    return `NESTED ${nested}｜${dim}｜${b1}・${b2}・${b3}`;
}

function renderHistoryAndBookmarks() {
    // History
    if (bdimHistoryDiv) {
        bdimHistoryDiv.innerHTML = '';
        if (blockDimHistory.length === 0) {
            const p = document.createElement('div');
            p.textContent = 'まだ履歴はありません。';
            bdimHistoryDiv.appendChild(p);
        } else {
            blockDimHistory.forEach((e, idx) => {
                const row = document.createElement('div');
                row.style.display='flex'; row.style.gap='8px'; row.style.alignItems='center'; row.style.margin='6px 0';
                const btn = document.createElement('button');
                btn.textContent = labelForEntry(e);
                btn.title = `Lv${e.level} / ${e.type} / 深さ${e.depth} / seed ${e.seed}`;
                btn.addEventListener('click', () => applyBdimSelection(e));
                const del = document.createElement('button');
                del.textContent = '×';
                del.title = '削除';
                del.addEventListener('click', () => { blockDimHistory.splice(idx,1); renderHistoryAndBookmarks(); saveAll(); });
                row.appendChild(btn); row.appendChild(del);
                bdimHistoryDiv.appendChild(row);
            });
        }
        setScrollableList(bdimHistoryDiv, 5);
    }
    // Bookmarks
    if (bdimBookmarksDiv) {
        bdimBookmarksDiv.innerHTML = '';
        if (blockDimBookmarks.length === 0) {
            const p = document.createElement('div');
            p.textContent = 'ブックマークはまだありません。';
            bdimBookmarksDiv.appendChild(p);
        } else {
            blockDimBookmarks.forEach((e, idx) => {
                const row = document.createElement('div');
                row.style.display='flex'; row.style.gap='8px'; row.style.alignItems='center'; row.style.margin='6px 0';
                const btn = document.createElement('button');
                btn.textContent = labelForEntry(e);
                btn.title = `Lv${e.level} / ${e.type} / 深さ${e.depth} / seed ${e.seed}`;
                btn.addEventListener('click', () => applyBdimSelection(e));
                const del = document.createElement('button');
                del.textContent = '×';
                del.title = '削除';
                del.addEventListener('click', () => { blockDimBookmarks.splice(idx,1); renderHistoryAndBookmarks(); saveAll(); });
                row.appendChild(btn); row.appendChild(del);
                bdimBookmarksDiv.appendChild(row);
            });
        }
        setScrollableList(bdimBookmarksDiv, 5);
    }
}

// 履歴/ブックマークの高さを「5行分」に制限してスクロール可能にする
function setScrollableList(container, rows = 5) {
    if (!container) return;
    const row = Array.from(container.children).find(el => el && el.tagName === 'DIV');
    if (!row) {
        container.style.maxHeight = 'none';
        container.style.overflowY = 'visible';
        return;
    }
    const rect = row.getBoundingClientRect();
    let mt = 0, mb = 0;
    try {
        const cs = getComputedStyle(row);
        mt = parseFloat(cs.marginTop) || 0;
        mb = parseFloat(cs.marginBottom) || 0;
    } catch {}
    const line = Math.ceil(rect.height + mt + mb) || 28;
    const maxH = Math.max(1, rows) * line;
    container.style.maxHeight = `${maxH}px`;
    container.style.overflowY = 'auto';
}

function applyBdimSelection(entry) {
    // Set list selections and recompute spec
    if (bdimNestedInput && entry.nested) { bdimNestedInput.value = entry.nested; }
    selectOption(bdimDimList, entry.dim);
    selectOption(bdim1List, entry.b1);
    selectOption(bdim2List, entry.b2);
    selectOption(bdim3List, entry.b3);
    onBlockDimChanged();
}

function addBookmarkFromCurrent() {
    if (!blockDimState?.spec) return;
    const entry = {
        nested: blockDimState.nested || 1,
        dim: blockDimState.dimKey,
        b1: blockDimState.b1Key,
        b2: blockDimState.b2Key,
        b3: blockDimState.b3Key,
        key: bdimKey(blockDimState.nested || 1, blockDimState.dimKey, blockDimState.b1Key, blockDimState.b2Key, blockDimState.b3Key),
        level: blockDimState.spec.level,
        type: formatSpecType(blockDimState.spec),
        depth: blockDimState.spec.depth,
        seed: blockDimState.seed || seedFromSelection(blockDimState.dimKey, blockDimState.b1Key, blockDimState.b2Key, blockDimState.b3Key),
        at: Date.now()
    };
    // dedupe by key
    blockDimBookmarks = [entry, ...blockDimBookmarks.filter(e => e.key !== entry.key)];
    // cap size
    if (blockDimBookmarks.length > 100) blockDimBookmarks.length = 100;
    renderHistoryAndBookmarks();
    saveAll();
}

function pushGateHistoryFromCurrent() {
    if (!blockDimState?.spec) return;
    const entry = {
        nested: blockDimState.nested || 1,
        dim: blockDimState.dimKey,
        b1: blockDimState.b1Key,
        b2: blockDimState.b2Key,
        b3: blockDimState.b3Key,
        key: bdimKey(blockDimState.nested || 1, blockDimState.dimKey, blockDimState.b1Key, blockDimState.b2Key, blockDimState.b3Key),
        level: blockDimState.spec.level,
        type: formatSpecType(blockDimState.spec),
        depth: blockDimState.spec.depth,
        seed: blockDimState.seed || seedFromSelection(blockDimState.dimKey, blockDimState.b1Key, blockDimState.b2Key, blockDimState.b3Key),
        at: Date.now()
    };
    // Move to front (recent), dedupe
    blockDimHistory = [entry, ...blockDimHistory.filter(e => e.key !== entry.key)];
    if (blockDimHistory.length > 200) blockDimHistory.length = 200;
    renderHistoryAndBookmarks();
    saveAll();
}

function setupTabs() {
    if (!tabBtnNormal || !tabBtnBlockDim) return;
    function activateTab(which) {
        const map = {
            normal: { btn: tabBtnNormal, panel: tabNormal },
            blockdim: { btn: tabBtnBlockDim, panel: tabBlockDim },
            miniexp: { btn: tabBtnMiniExp, panel: tabMiniExp },
            tools: { btn: tabBtnTools, panel: tabTools },
        };
        for (const k of Object.keys(map)) {
            const { btn, panel } = map[k];
            if (!btn || !panel) continue;
            const on = (k === which);
            btn.classList.toggle('active', on);
            btn.setAttribute('aria-selected', on ? 'true' : 'false');
            panel.style.display = on ? '' : 'none';
        }
    }
    tabBtnNormal.addEventListener('click', () => {
        activateTab('normal');
    });
    tabBtnBlockDim.addEventListener('click', async () => {
        activateTab('blockdim');
        // Lazy init
        if (!blockDimTables.__loaded) await initBlockDimUI();
        renderHistoryAndBookmarks();
    });
    if (tabBtnMiniExp) {
        tabBtnMiniExp.addEventListener('click', async () => {
            activateTab('miniexp');
            if (!__miniExpInited) {
                await initMiniExpUI();
                __miniExpInited = true;
                renderMiniExpPlayerHud();
            }
        });
    }
    if (tabBtnTools) {
        tabBtnTools.addEventListener('click', () => {
            activateTab('tools');
            if (!__toolsInited) {
                initToolsTab();
                __toolsInited = true;
            }
        });
    }
    // Lists are click/keyboard driven（render側でバインド済み）
    if (bdimStartBtn) {
        bdimStartBtn.addEventListener('click', () => {
            startGameFromBlockDim();
        });
    }
    if (bdimAddBookmarkBtn) {
        bdimAddBookmarkBtn.addEventListener('click', addBookmarkFromCurrent);
    }
    if (bdimRandomBtn) {
        bdimRandomBtn.addEventListener('click', () => {
            // 未初期化なら最初にロード
            if (!blockDimTables.__loaded) {
                initBlockDimUI().then(() => randomizeBdimBlocks());
            } else {
                randomizeBdimBlocks();
            }
        });
    }
    if (bdimWeightedRandomBtn) {
        bdimWeightedRandomBtn.addEventListener('click', () => {
            const target = bdimRandomTargetInput ? bdimRandomTargetInput.value : 0;
            const typePref = bdimRandomTypeSelect ? bdimRandomTypeSelect.value : '';
            if (!blockDimTables.__loaded) {
                initBlockDimUI().then(() => weightedRandomizeBdimBlocks(target, typePref));
            } else {
                weightedRandomizeBdimBlocks(target, typePref);
            }
        });
    }
    if (bdimClearHistoryBtn) {
        bdimClearHistoryBtn.addEventListener('click', () => {
            if (confirm('Gate履歴をすべて削除しますか？')) {
                blockDimHistory = [];
                renderHistoryAndBookmarks();
                saveAll();
            }
        });
    }
}

// -------------- Tools Tab: Dungeon Mod Maker --------------
const MOD_MAKER_MAX_STRUCTURE_SIZE = 31;
const MOD_MAKER_DEFAULT_FIXED_WIDTH = 21;
const MOD_MAKER_DEFAULT_FIXED_HEIGHT = 15;
const MOD_MAKER_MIN_FIXED_SIZE = 5;
const MOD_MAKER_MAX_FIXED_SIZE = 75;
const MOD_MAKER_MAX_FLOOR_COUNT = 60;

function initToolsTab() {
    if (!tabTools) return;

    const menuButtons = Array.from(tabTools.querySelectorAll('[data-tool-target]'));
    const panels = Array.from(tabTools.querySelectorAll('[data-tool-panel]'));
    const activateToolPanel = (toolId) => {
        menuButtons.forEach(btn => {
            const active = btn.dataset.toolTarget === toolId;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        panels.forEach(panel => {
            const active = panel.dataset.toolPanel === toolId;
            panel.classList.toggle('active', active);
        });
    };
    activateToolPanel('mod-maker');
    menuButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.toolTarget;
            if (target) activateToolPanel(target);
        });
    });

    modMakerRefs = {
        addonId: document.getElementById('modmaker-addon-id'),
        addonName: document.getElementById('modmaker-addon-name'),
        addonVersion: document.getElementById('modmaker-addon-version'),
        addonAuthor: document.getElementById('modmaker-addon-author'),
        addonDescription: document.getElementById('modmaker-addon-description'),
        structureList: document.getElementById('modmaker-structure-list'),
        addStructure: document.getElementById('modmaker-add-structure'),
        removeStructure: document.getElementById('modmaker-remove-structure'),
        structureId: document.getElementById('modmaker-structure-id'),
        structureName: document.getElementById('modmaker-structure-name'),
        structureAnchorX: document.getElementById('modmaker-structure-anchor-x'),
        structureAnchorY: document.getElementById('modmaker-structure-anchor-y'),
        structureTags: document.getElementById('modmaker-structure-tags'),
        structureAllowRotate: document.getElementById('modmaker-structure-allow-rotate'),
        structureAllowMirror: document.getElementById('modmaker-structure-allow-mirror'),
        structureWidth: document.getElementById('modmaker-structure-width'),
        structureHeight: document.getElementById('modmaker-structure-height'),
        grid: document.getElementById('modmaker-grid'),
        patternPreview: document.getElementById('modmaker-pattern-preview'),
        fillEmpty: document.getElementById('modmaker-fill-empty'),
        fillFloor: document.getElementById('modmaker-fill-floor'),
        fillWall: document.getElementById('modmaker-fill-wall'),
        fixedContainer: document.getElementById('modmaker-fixed-container'),
        fixedEnabled: document.getElementById('modmaker-fixed-enabled'),
        fixedFloorCount: document.getElementById('modmaker-fixed-floor-count'),
        fixedBossFloors: document.getElementById('modmaker-fixed-boss-floors'),
        fixedFloorList: document.getElementById('modmaker-fixed-floor-list'),
        fixedWidth: document.getElementById('modmaker-fixed-width'),
        fixedHeight: document.getElementById('modmaker-fixed-height'),
        fixedCopyPrev: document.getElementById('modmaker-fixed-copy-prev'),
        fixedFillWall: document.getElementById('modmaker-fixed-fill-wall'),
        fixedFillFloor: document.getElementById('modmaker-fixed-fill-floor'),
        fixedFillVoid: document.getElementById('modmaker-fixed-fill-void'),
        fixedGrid: document.getElementById('modmaker-fixed-grid'),
        generatorList: document.getElementById('modmaker-generator-list'),
        addGenerator: document.getElementById('modmaker-add-generator'),
        removeGenerator: document.getElementById('modmaker-remove-generator'),
        generatorId: document.getElementById('modmaker-generator-id'),
        generatorName: document.getElementById('modmaker-generator-name'),
        generatorDescription: document.getElementById('modmaker-generator-description'),
        generatorNormalMix: document.getElementById('modmaker-generator-normal-mix'),
        generatorBlockdimMix: document.getElementById('modmaker-generator-blockdim-mix'),
        generatorTags: document.getElementById('modmaker-generator-tags'),
        templateSelect: document.getElementById('modmaker-template-select'),
        templateApply: document.getElementById('modmaker-apply-template'),
        generatorCode: document.getElementById('modmaker-generator-code'),
        blocks: {
            blocks1: document.getElementById('modmaker-blocks1'),
            blocks2: document.getElementById('modmaker-blocks2'),
            blocks3: document.getElementById('modmaker-blocks3')
        },
        output: document.getElementById('modmaker-output'),
        copy: document.getElementById('modmaker-copy'),
        download: document.getElementById('modmaker-download'),
        errors: document.getElementById('modmaker-errors')
    };

    ensureModMakerDefaults();

    const bindInput = (el, handler, event = 'input') => {
        if (!el) return;
        el.addEventListener(event, handler);
    };

    bindInput(modMakerRefs.addonId, () => {
        modMakerState.metadata.id = modMakerRefs.addonId.value.trim();
        renderModMaker();
    });
    bindInput(modMakerRefs.addonName, () => {
        modMakerState.metadata.name = modMakerRefs.addonName.value;
        renderModMaker();
    });
    bindInput(modMakerRefs.addonVersion, () => {
        modMakerState.metadata.version = modMakerRefs.addonVersion.value;
        renderModMaker();
    });
    bindInput(modMakerRefs.addonAuthor, () => {
        modMakerState.metadata.author = modMakerRefs.addonAuthor.value;
        renderModMaker();
    });
    bindInput(modMakerRefs.addonDescription, () => {
        modMakerState.metadata.description = modMakerRefs.addonDescription.value;
        renderModMaker();
    });

    if (modMakerRefs.addStructure) {
        modMakerRefs.addStructure.addEventListener('click', () => {
            modMakerState.structures.push(createNewStructure());
            modMakerState.selectedStructure = modMakerState.structures.length - 1;
            renderModMaker();
        });
    }
    if (modMakerRefs.removeStructure) {
        modMakerRefs.removeStructure.addEventListener('click', () => {
            if (modMakerState.structures.length <= 1) {
                const single = modMakerState.structures[0];
                if (single) single.matrix = modMakerCreateMatrix(single.width, single.height, null);
            } else {
                modMakerState.structures.splice(modMakerState.selectedStructure, 1);
                modMakerState.selectedStructure = Math.max(0, modMakerState.selectedStructure - 1);
            }
            ensureModMakerDefaults();
            renderModMaker();
        });
    }

    bindInput(modMakerRefs.structureId, () => {
        const structure = getSelectedStructure();
        if (!structure) return;
        structure.id = modMakerRefs.structureId.value.trim();
        renderModMaker();
    });
    bindInput(modMakerRefs.structureName, () => {
        const structure = getSelectedStructure();
        if (!structure) return;
        structure.name = modMakerRefs.structureName.value;
        renderModMaker();
    });
    bindInput(modMakerRefs.structureAnchorX, () => {
        const structure = getSelectedStructure();
        if (!structure) return;
        structure.anchorX = clampAnchor(modMakerRefs.structureAnchorX.value, structure.width - 1);
        renderModMaker();
    }, 'change');
    bindInput(modMakerRefs.structureAnchorY, () => {
        const structure = getSelectedStructure();
        if (!structure) return;
        structure.anchorY = clampAnchor(modMakerRefs.structureAnchorY.value, structure.height - 1);
        renderModMaker();
    }, 'change');
    bindInput(modMakerRefs.structureTags, () => {
        const structure = getSelectedStructure();
        if (!structure) return;
        structure.tagsText = modMakerRefs.structureTags.value;
        renderModMaker();
    });
    bindInput(modMakerRefs.structureAllowRotate, () => {
        const structure = getSelectedStructure();
        if (!structure) return;
        structure.allowRotation = !!modMakerRefs.structureAllowRotate.checked;
        renderModMaker();
    }, 'change');
    bindInput(modMakerRefs.structureAllowMirror, () => {
        const structure = getSelectedStructure();
        if (!structure) return;
        structure.allowMirror = !!modMakerRefs.structureAllowMirror.checked;
        renderModMaker();
    }, 'change');
    bindInput(modMakerRefs.structureWidth, () => {
        const structure = getSelectedStructure();
        if (!structure) return;
        const width = clampStructureSize(modMakerRefs.structureWidth.value);
        resizeStructure(structure, width, structure.height);
        renderModMaker();
    }, 'change');
    bindInput(modMakerRefs.structureHeight, () => {
        const structure = getSelectedStructure();
        if (!structure) return;
        const height = clampStructureSize(modMakerRefs.structureHeight.value);
        resizeStructure(structure, structure.width, height);
        renderModMaker();
    }, 'change');

    if (modMakerRefs.fillEmpty) {
        modMakerRefs.fillEmpty.addEventListener('click', () => fillStructureCells(null));
    }
    if (modMakerRefs.fillFloor) {
        modMakerRefs.fillFloor.addEventListener('click', () => fillStructureCells(0));
    }
    if (modMakerRefs.fillWall) {
        modMakerRefs.fillWall.addEventListener('click', () => fillStructureCells(1));
    }

    bindInput(modMakerRefs.fixedEnabled, () => {
        const fixed = getSelectedFixedState();
        if (!fixed) return;
        const generator = getSelectedGenerator();
        const enabled = !!modMakerRefs.fixedEnabled.checked;
        fixed.enabled = enabled;
        if (enabled && generator && !(generator.code || '').trim()) {
            generator.code = MOD_MAKER_TEMPLATES.fixed.trim();
        }
        renderModMaker();
    }, 'change');

    bindInput(modMakerRefs.fixedFloorCount, () => {
        const fixed = getSelectedFixedState();
        if (!fixed) return;
        fixed.floorCount = clampFixedFloorCount(modMakerRefs.fixedFloorCount.value);
        ensureGeneratorFixedState(getSelectedGenerator());
        renderModMaker();
    }, 'change');

    bindInput(modMakerRefs.fixedBossFloors, () => {
        const fixed = getSelectedFixedState();
        if (!fixed) return;
        fixed.bossFloorsText = modMakerRefs.fixedBossFloors.value;
        renderModMaker();
    });

    bindInput(modMakerRefs.fixedWidth, () => {
        const floor = getSelectedFixedFloor();
        if (!floor) return;
        resizeFixedFloor(floor, modMakerRefs.fixedWidth.value, floor.height);
        renderModMaker();
    }, 'change');

    bindInput(modMakerRefs.fixedHeight, () => {
        const floor = getSelectedFixedFloor();
        if (!floor) return;
        resizeFixedFloor(floor, floor.width, modMakerRefs.fixedHeight.value);
        renderModMaker();
    }, 'change');

    if (modMakerRefs.fixedCopyPrev) {
        modMakerRefs.fixedCopyPrev.addEventListener('click', () => copyFixedFloorFromPrev());
    }
    if (modMakerRefs.fixedFillWall) {
        modMakerRefs.fixedFillWall.addEventListener('click', () => fillFixedFloor(1));
    }
    if (modMakerRefs.fixedFillFloor) {
        modMakerRefs.fixedFillFloor.addEventListener('click', () => fillFixedFloor(0));
    }
    if (modMakerRefs.fixedFillVoid) {
        modMakerRefs.fixedFillVoid.addEventListener('click', () => fillFixedFloor(null));
    }

    if (modMakerRefs.addGenerator) {
        modMakerRefs.addGenerator.addEventListener('click', () => {
            modMakerState.generators.push(createNewGenerator());
            modMakerState.selectedGenerator = modMakerState.generators.length - 1;
            renderModMaker();
        });
    }
    if (modMakerRefs.removeGenerator) {
        modMakerRefs.removeGenerator.addEventListener('click', () => {
            if (modMakerState.generators.length <= 1) {
                const single = modMakerState.generators[0];
                if (single) single.code = MOD_MAKER_TEMPLATES.blank;
            } else {
                modMakerState.generators.splice(modMakerState.selectedGenerator, 1);
                modMakerState.selectedGenerator = Math.max(0, modMakerState.selectedGenerator - 1);
            }
            ensureModMakerDefaults();
            renderModMaker();
        });
    }

    bindInput(modMakerRefs.generatorId, () => {
        const generator = getSelectedGenerator();
        if (!generator) return;
        generator.id = modMakerRefs.generatorId.value.trim();
        renderModMaker();
    });
    bindInput(modMakerRefs.generatorName, () => {
        const generator = getSelectedGenerator();
        if (!generator) return;
        generator.name = modMakerRefs.generatorName.value;
        renderModMaker();
    });
    bindInput(modMakerRefs.generatorDescription, () => {
        const generator = getSelectedGenerator();
        if (!generator) return;
        generator.description = modMakerRefs.generatorDescription.value;
        renderModMaker();
    });
    bindInput(modMakerRefs.generatorNormalMix, () => {
        const generator = getSelectedGenerator();
        if (!generator) return;
        const value = Number(modMakerRefs.generatorNormalMix.value);
        generator.mixinNormal = Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
        renderModMaker();
    });
    bindInput(modMakerRefs.generatorBlockdimMix, () => {
        const generator = getSelectedGenerator();
        if (!generator) return;
        const value = Number(modMakerRefs.generatorBlockdimMix.value);
        generator.mixinBlockDim = Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
        renderModMaker();
    });
    bindInput(modMakerRefs.generatorTags, () => {
        const generator = getSelectedGenerator();
        if (!generator) return;
        generator.tagsText = modMakerRefs.generatorTags.value;
        renderModMaker();
    });

    if (modMakerRefs.templateSelect) modMakerRefs.templateSelect.value = 'blank';
    if (modMakerRefs.templateApply) {
        modMakerRefs.templateApply.addEventListener('click', () => {
            const generator = getSelectedGenerator();
            if (!generator) return;
            const key = modMakerRefs.templateSelect ? modMakerRefs.templateSelect.value : 'blank';
            const template = MOD_MAKER_TEMPLATES[key] || MOD_MAKER_TEMPLATES.blank;
            generator.code = template;
            if (key === 'fixed') {
                const fixed = ensureGeneratorFixedState(generator);
                if (fixed) fixed.enabled = true;
            }
            renderModMaker();
        });
    }
    bindInput(modMakerRefs.generatorCode, () => {
        const generator = getSelectedGenerator();
        if (!generator) return;
        generator.code = modMakerRefs.generatorCode.value;
        refreshModMakerPreview();
    });

    const blockAddButtons = tabTools.querySelectorAll('.modmaker-add-block');
    blockAddButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tier = btn.dataset.tier;
            if (!tier || !modMakerState.blocks[tier]) return;
            modMakerState.blocks[tier].push(createNewBlockEntry(tier));
            renderModMaker();
        });
    });

    if (modMakerRefs.copy) modMakerRefs.copy.addEventListener('click', copyModMakerOutput);
    if (modMakerRefs.download) modMakerRefs.download.addEventListener('click', downloadModMakerOutput);

    renderModMaker();
}
function ensureModMakerDefaults() {
    if (!Array.isArray(modMakerState.structures)) modMakerState.structures = [];
    if (!modMakerState.structures.length) modMakerState.structures.push(createNewStructure());
    if (!Array.isArray(modMakerState.generators)) modMakerState.generators = [];
    if (!modMakerState.generators.length) modMakerState.generators.push(createNewGenerator());
    modMakerState.generators.forEach(gen => ensureGeneratorFixedState(gen));
    if (!modMakerState.blocks || typeof modMakerState.blocks !== 'object') {
        modMakerState.blocks = { blocks1: [], blocks2: [], blocks3: [] };
    }
    for (const tier of ['blocks1', 'blocks2', 'blocks3']) {
        if (!Array.isArray(modMakerState.blocks[tier])) modMakerState.blocks[tier] = [];
    }
    modMakerState.selectedStructure = Math.min(Math.max(0, modMakerState.selectedStructure || 0), modMakerState.structures.length - 1);
    modMakerState.selectedGenerator = Math.min(Math.max(0, modMakerState.selectedGenerator || 0), modMakerState.generators.length - 1);
}

function modMakerCreateMatrix(width, height, fill = null) {
    const w = Math.max(1, Math.floor(width));
    const h = Math.max(1, Math.floor(height));
    const rows = [];
    for (let y = 0; y < h; y++) {
        const row = [];
        for (let x = 0; x < w; x++) row.push(fill);
        rows.push(row);
    }
    return rows;
}

function createNewStructure() {
    const width = 7;
    const height = 7;
    return {
        id: `structure_${Math.random().toString(36).slice(2, 7)}`,
        name: '',
        width,
        height,
        anchorX: Math.floor(width / 2),
        anchorY: Math.floor(height / 2),
        allowRotation: true,
        allowMirror: true,
        tagsText: '',
        matrix: modMakerCreateMatrix(width, height, null)
    };
}

function createNewGenerator() {
    return {
        id: `custom_${Math.random().toString(36).slice(2, 7)}`,
        name: '',
        description: '',
        mixinNormal: 0,
        mixinBlockDim: 0,
        tagsText: '',
        code: MOD_MAKER_TEMPLATES.blank,
        fixed: createDefaultFixedState()
    };
}

function createDefaultFixedState() {
    return {
        enabled: false,
        floorCount: 1,
        bossFloorsText: '',
        selected: 0,
        floors: [createFixedFloor()]
    };
}

function createFixedFloor(width = MOD_MAKER_DEFAULT_FIXED_WIDTH, height = MOD_MAKER_DEFAULT_FIXED_HEIGHT, sourceMatrix = null) {
    const w = clampFixedMapSize(width, MOD_MAKER_DEFAULT_FIXED_WIDTH);
    const h = clampFixedMapSize(height, MOD_MAKER_DEFAULT_FIXED_HEIGHT);
    const matrix = [];
    for (let y = 0; y < h; y++) {
        const row = [];
        for (let x = 0; x < w; x++) {
            const base = sourceMatrix?.[y]?.[x];
            if (base === 0) row.push(0);
            else if (base === 1) row.push(1);
            else row.push(null);
        }
        matrix.push(row);
    }
    return { width: w, height: h, matrix };
}

function cloneFixedFloor(floor) {
    if (!floor) return createFixedFloor();
    return createFixedFloor(floor.width, floor.height, floor.matrix);
}

function clampFixedFloorCount(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 1;
    return Math.max(1, Math.min(MOD_MAKER_MAX_FLOOR_COUNT, Math.floor(n)));
}

function clampFixedMapSize(value, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback != null ? fallback : MOD_MAKER_DEFAULT_FIXED_WIDTH;
    return Math.max(MOD_MAKER_MIN_FIXED_SIZE, Math.min(MOD_MAKER_MAX_FIXED_SIZE, Math.floor(n)));
}

function ensureGeneratorFixedState(generator) {
    if (!generator) return null;
    if (!generator.fixed || typeof generator.fixed !== 'object') {
        generator.fixed = createDefaultFixedState();
    }
    const fixed = generator.fixed;
    fixed.floorCount = clampFixedFloorCount(fixed.floorCount);
    if (!Array.isArray(fixed.floors) || !fixed.floors.length) {
        fixed.floors = [createFixedFloor()];
    }
    while (fixed.floors.length < fixed.floorCount) {
        const prev = fixed.floors[fixed.floors.length - 1];
        fixed.floors.push(cloneFixedFloor(prev));
    }
    if (fixed.floors.length > fixed.floorCount) {
        fixed.floors.length = fixed.floorCount;
    }
    if (!Number.isFinite(fixed.selected)) fixed.selected = 0;
    fixed.selected = Math.min(Math.max(0, Math.floor(fixed.selected)), Math.max(0, fixed.floors.length - 1));
    return fixed;
}

function getSelectedFixedState() {
    const generator = getSelectedGenerator();
    return ensureGeneratorFixedState(generator);
}

function getSelectedFixedFloor() {
    const fixed = getSelectedFixedState();
    if (!fixed) return null;
    return fixed.floors[fixed.selected] || null;
}

function createNewBlockEntry(tier) {
    const current = Array.isArray(modMakerState.blocks?.[tier]) ? modMakerState.blocks[tier].length + 1 : 1;
    const suffix = String(current).padStart(2, '0');
    const prefix = tier === 'blocks1' ? 'block1_' : tier === 'blocks2' ? 'block2_' : 'block3_';
    return {
        key: `${prefix}${suffix}`,
        name: '',
        level: '0',
        size: '0',
        depth: '0',
        chest: 'normal',
        type: '',
        bossFloors: '',
        description: ''
    };
}

function getSelectedStructure() {
    return modMakerState.structures[modMakerState.selectedStructure] || null;
}

function getSelectedGenerator() {
    return modMakerState.generators[modMakerState.selectedGenerator] || null;
}

function clampStructureSize(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 1;
    return Math.min(MOD_MAKER_MAX_STRUCTURE_SIZE, Math.max(1, Math.floor(n)));
}

function clampAnchor(value, max) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.min(Math.max(0, Math.floor(n)), Math.max(0, max));
}

function resizeStructure(structure, width, height) {
    const w = clampStructureSize(width);
    const h = clampStructureSize(height);
    const next = modMakerCreateMatrix(w, h, null);
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            next[y][x] = structure.matrix?.[y]?.[x] ?? null;
        }
    }
    structure.width = w;
    structure.height = h;
    structure.matrix = next;
    structure.anchorX = clampAnchor(structure.anchorX, w - 1);
    structure.anchorY = clampAnchor(structure.anchorY, h - 1);
}

function cycleStructureCell(value) {
    if (value === null || typeof value === 'undefined') return 0;
    if (value === 0) return 1;
    return null;
}

function fillStructureCells(fill) {
    const structure = getSelectedStructure();
    if (!structure) return;
    for (let y = 0; y < structure.height; y++) {
        for (let x = 0; x < structure.width; x++) {
            structure.matrix[y][x] = fill;
        }
    }
    renderModMaker();
}

function renderStructureGrid(structure) {
    if (!modMakerRefs?.grid || !structure) return;
    const grid = modMakerRefs.grid;
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${structure.width}, minmax(22px, 22px))`;
    for (let y = 0; y < structure.height; y++) {
        for (let x = 0; x < structure.width; x++) {
            const cell = structure.matrix?.[y]?.[x] ?? null;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'modmaker-cell';
            if (cell === 0) btn.classList.add('state-floor');
            if (cell === 1) btn.classList.add('state-wall');
            if (x === structure.anchorX && y === structure.anchorY) btn.classList.add('anchor');
            btn.title = `(${x}, ${y})`;
            btn.addEventListener('click', () => {
                structure.matrix[y][x] = cycleStructureCell(structure.matrix[y][x]);
                renderModMaker();
            });
            grid.appendChild(btn);
        }
    }
}

function resizeFixedFloor(floor, width, height) {
    if (!floor) return;
    const w = clampFixedMapSize(width, floor.width || MOD_MAKER_DEFAULT_FIXED_WIDTH);
    const h = clampFixedMapSize(height, floor.height || MOD_MAKER_DEFAULT_FIXED_HEIGHT);
    const next = [];
    for (let y = 0; y < h; y++) {
        const row = [];
        for (let x = 0; x < w; x++) {
            const val = floor.matrix?.[y]?.[x];
            if (val === 0) row.push(0);
            else if (val === 1) row.push(1);
            else row.push(null);
        }
        next.push(row);
    }
    floor.width = w;
    floor.height = h;
    floor.matrix = next;
}

function cycleFixedCell(value) {
    if (value === 1) return 0;
    if (value === 0) return null;
    return 1;
}

function fillFixedFloor(fill) {
    const floor = getSelectedFixedFloor();
    if (!floor) return;
    for (let y = 0; y < floor.height; y++) {
        for (let x = 0; x < floor.width; x++) {
            floor.matrix[y][x] = fill;
        }
    }
    renderModMaker();
}

function copyFixedFloorFromPrev() {
    const fixed = getSelectedFixedState();
    if (!fixed) return;
    const idx = fixed.selected;
    if (idx <= 0) return;
    const prev = fixed.floors[idx - 1];
    const current = fixed.floors[idx];
    if (!prev || !current) return;
    const cloned = cloneFixedFloor(prev);
    current.width = cloned.width;
    current.height = cloned.height;
    current.matrix = cloned.matrix;
    renderModMaker();
}

function renderFixedMapGrid(fixed) {
    if (!modMakerRefs?.fixedGrid) return;
    const grid = modMakerRefs.fixedGrid;
    grid.setAttribute('aria-live', 'polite');
    if (!fixed || !fixed.enabled) {
        grid.classList.add('placeholder');
        grid.setAttribute('aria-disabled', 'true');
        grid.innerHTML = '<span role="note">固定マップを有効にすると編集できます。</span>';
        grid.style.gridTemplateColumns = '';
        return;
    }
    const floor = fixed.floors[fixed.selected];
    if (!floor) {
        grid.classList.add('placeholder');
        grid.setAttribute('aria-disabled', 'true');
        grid.innerHTML = '<span role="note">階層を追加してください。</span>';
        grid.style.gridTemplateColumns = '';
        return;
    }
    grid.setAttribute('aria-disabled', 'false');
    grid.classList.remove('placeholder');
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${floor.width}, minmax(22px, 22px))`;
    for (let y = 0; y < floor.height; y++) {
        for (let x = 0; x < floor.width; x++) {
            const cell = floor.matrix?.[y]?.[x];
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'modmaker-cell';
            if (cell === 0) btn.classList.add('state-floor');
            else if (cell === 1) btn.classList.add('state-wall');
            else btn.classList.add('state-void');
            btn.title = `(${x}, ${y})`;
            btn.addEventListener('click', () => {
                if (!fixed.enabled) return;
                floor.matrix[y][x] = cycleFixedCell(floor.matrix[y][x]);
                renderModMaker();
            });
            grid.appendChild(btn);
        }
    }
}

function renderModMakerFixed(fixed) {
    if (!modMakerRefs) return;
    const container = modMakerRefs.fixedContainer;
    if (container) {
        const disabled = !fixed || !fixed.enabled;
        container.classList.toggle('disabled', disabled);
        container.setAttribute('aria-disabled', disabled ? 'true' : 'false');
    }
    if (modMakerRefs.fixedEnabled) {
        modMakerRefs.fixedEnabled.checked = !!fixed?.enabled;
    }
    if (modMakerRefs.fixedFloorCount) {
        modMakerRefs.fixedFloorCount.disabled = !fixed;
        modMakerRefs.fixedFloorCount.value = fixed ? fixed.floorCount : 1;
    }
    if (modMakerRefs.fixedBossFloors) {
        modMakerRefs.fixedBossFloors.disabled = !fixed || !fixed.enabled;
        modMakerRefs.fixedBossFloors.value = fixed?.bossFloorsText || '';
    }
    if (modMakerRefs.fixedFloorList) {
        modMakerRefs.fixedFloorList.innerHTML = '';
        if (fixed) {
            fixed.floors.forEach((floor, idx) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.textContent = `${idx + 1}F`;
                btn.classList.toggle('active', idx === fixed.selected);
                btn.disabled = !fixed.enabled;
                btn.addEventListener('click', () => {
                    fixed.selected = idx;
                    renderModMaker();
                });
                modMakerRefs.fixedFloorList.appendChild(btn);
            });
        }
    }
    const selectedFloor = fixed?.floors?.[fixed.selected] || null;
    if (modMakerRefs.fixedWidth) {
        modMakerRefs.fixedWidth.disabled = !fixed || !fixed.enabled || !selectedFloor;
        modMakerRefs.fixedWidth.value = selectedFloor ? selectedFloor.width : MOD_MAKER_DEFAULT_FIXED_WIDTH;
    }
    if (modMakerRefs.fixedHeight) {
        modMakerRefs.fixedHeight.disabled = !fixed || !fixed.enabled || !selectedFloor;
        modMakerRefs.fixedHeight.value = selectedFloor ? selectedFloor.height : MOD_MAKER_DEFAULT_FIXED_HEIGHT;
    }
    if (modMakerRefs.fixedCopyPrev) {
        modMakerRefs.fixedCopyPrev.disabled = !fixed || !fixed.enabled || !selectedFloor || fixed.selected === 0;
    }
    if (modMakerRefs.fixedFillWall) modMakerRefs.fixedFillWall.disabled = !fixed || !fixed.enabled;
    if (modMakerRefs.fixedFillFloor) modMakerRefs.fixedFillFloor.disabled = !fixed || !fixed.enabled;
    if (modMakerRefs.fixedFillVoid) modMakerRefs.fixedFillVoid.disabled = !fixed || !fixed.enabled;
    renderFixedMapGrid(fixed);
}

function modMakerPatternFromMatrix(matrix) {
    const rows = [];
    for (const row of matrix || []) {
        const line = row.map(cell => {
            if (cell === 1) return '#';
            if (cell === 0) return '.';
            return ' ';
        }).join('');
        rows.push(line);
    }
    return rows;
}

function modMakerPatternFromFixedMatrix(matrix, width, height) {
    const rows = [];
    for (let y = 0; y < height; y++) {
        const line = [];
        for (let x = 0; x < width; x++) {
            const cell = matrix?.[y]?.[x];
            if (cell === 0) line.push('.');
            else if (cell === 1) line.push('#');
            else line.push(' ');
        }
        rows.push(line.join(''));
    }
    return rows;
}

function normalizeGeneratorFixed(generator, index, errors) {
    const fixed = ensureGeneratorFixedState(generator);
    if (!fixed || !fixed.enabled) return null;
    const floorCount = clampFixedFloorCount(fixed.floorCount);
    if (!fixed.floors.length) {
        errors.push(`生成タイプ${index + 1}の固定マップが未設定です。`);
        return null;
    }
    const maps = [];
    for (let i = 0; i < floorCount; i++) {
        const floor = fixed.floors[i];
        if (!floor) {
            errors.push(`生成タイプ${index + 1}の${i + 1}F固定マップが不足しています。`);
            continue;
        }
        const width = clampFixedMapSize(floor.width, MOD_MAKER_DEFAULT_FIXED_WIDTH);
        const height = clampFixedMapSize(floor.height, MOD_MAKER_DEFAULT_FIXED_HEIGHT);
        const pattern = modMakerPatternFromFixedMatrix(floor.matrix, width, height);
        if (!pattern.some(row => row.includes('.'))) {
            errors.push(`生成タイプ${index + 1}の${i + 1}F固定マップに床がありません。`);
        }
        maps.push({ floor: i + 1, layout: pattern });
    }
    if (!maps.length) return null;
    const parsedBoss = Array.isArray(fixed.bossFloors)
        ? fixed.bossFloors
        : parseBossFloors(fixed.bossFloorsText || '');
    const bossFloors = Array.from(new Set((parsedBoss || []).map(n => Number(n)).filter(n => Number.isFinite(n)))).sort((a, b) => a - b);
    const result = { max: floorCount, maps };
    if (bossFloors.length) {
        result.bossFloors = bossFloors;
    }
    return result;
}

function renderModMakerBlocks() {
    if (!modMakerRefs?.blocks) return;
    const tiers = ['blocks1', 'blocks2', 'blocks3'];
    for (const tier of tiers) {
        const container = modMakerRefs.blocks[tier];
        if (!container) continue;
        container.innerHTML = '';
        const entries = modMakerState.blocks[tier] || [];
        if (!entries.length) {
            const empty = document.createElement('p');
            empty.textContent = '未定義です。右上の追加ボタンで作成できます。';
            empty.style.fontSize = '12px';
            empty.style.color = '#6b7280';
            container.appendChild(empty);
            continue;
        }
        entries.forEach((entry, index) => {
            const card = document.createElement('div');
            card.className = 'modmaker-block-card';
            const header = document.createElement('header');
            const title = document.createElement('div');
            title.textContent = entry.name || entry.key || `${tier.toUpperCase()} #${index + 1}`;
            header.appendChild(title);
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.textContent = '削除';
            removeBtn.addEventListener('click', () => {
                modMakerState.blocks[tier].splice(index, 1);
                renderModMaker();
            });
            header.appendChild(removeBtn);
            card.appendChild(header);

            card.appendChild(createBlockField('キー', entry.key, (val) => { entry.key = val.trim(); }));
            card.appendChild(createBlockField('名前', entry.name, (val) => { entry.name = val; }));
            card.appendChild(createBlockField('レベル補正', entry.level, (val) => { entry.level = val; }, { placeholder: '例: +0' }));
            card.appendChild(createBlockField('サイズ補正', entry.size, (val) => { entry.size = val; }, { placeholder: '例: +1' }));
            card.appendChild(createBlockField('深さ補正', entry.depth, (val) => { entry.depth = val; }, { placeholder: '例: +1' }));
            card.appendChild(createBlockField('宝箱タイプ', entry.chest, (val) => { entry.chest = val; }, { placeholder: 'normal/more/less' }));
            card.appendChild(createBlockField('タイプID', entry.type, (val) => { entry.type = val; }, { placeholder: '例: custom-dungeon' }));
            card.appendChild(createBlockField('ボス階層', entry.bossFloors, (val) => { entry.bossFloors = val; }, { placeholder: '例: 5,10,15' }));
            card.appendChild(createBlockField('説明・メモ', entry.description, (val) => { entry.description = val; }, { multiline: true, rows: 2 }));

            container.appendChild(card);
        });
    }
}

function createBlockField(labelText, value, onChange, options = {}) {
    const label = document.createElement('label');
    label.textContent = labelText;
    const control = options.multiline ? document.createElement('textarea') : document.createElement('input');
    if (!options.multiline) control.type = options.type || 'text';
    if (options.placeholder) control.placeholder = options.placeholder;
    if (options.rows && options.multiline) control.rows = options.rows;
    control.value = value ?? '';
    control.spellcheck = false;
    control.addEventListener(options.event || 'input', () => {
        onChange(control.value);
        if (!options.deferRender) renderModMaker();
    });
    label.appendChild(control);
    return label;
}

function renderModMaker() {
    ensureModMakerDefaults();
    const structure = getSelectedStructure();
    const generator = getSelectedGenerator();
    const fixed = generator ? ensureGeneratorFixedState(generator) : null;

    if (modMakerRefs.addonId) modMakerRefs.addonId.value = modMakerState.metadata.id || '';
    if (modMakerRefs.addonName) modMakerRefs.addonName.value = modMakerState.metadata.name || '';
    if (modMakerRefs.addonVersion) modMakerRefs.addonVersion.value = modMakerState.metadata.version || '';
    if (modMakerRefs.addonAuthor) modMakerRefs.addonAuthor.value = modMakerState.metadata.author || '';
    if (modMakerRefs.addonDescription) modMakerRefs.addonDescription.value = modMakerState.metadata.description || '';

    if (modMakerRefs.structureList) {
        modMakerRefs.structureList.innerHTML = '';
        modMakerState.structures.forEach((item, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = item.name || item.id || `構造${idx + 1}`;
            btn.classList.toggle('active', idx === modMakerState.selectedStructure);
            btn.addEventListener('click', () => {
                modMakerState.selectedStructure = idx;
                renderModMaker();
            });
            modMakerRefs.structureList.appendChild(btn);
        });
    }

    if (modMakerRefs.structureId) {
        modMakerRefs.structureId.disabled = !structure;
        modMakerRefs.structureId.value = structure?.id || '';
    }
    if (modMakerRefs.structureName) {
        modMakerRefs.structureName.disabled = !structure;
        modMakerRefs.structureName.value = structure?.name || '';
    }
    if (modMakerRefs.structureAnchorX) {
        modMakerRefs.structureAnchorX.disabled = !structure;
        modMakerRefs.structureAnchorX.max = structure ? Math.max(0, structure.width - 1) : 0;
        modMakerRefs.structureAnchorX.value = structure ? structure.anchorX : 0;
    }
    if (modMakerRefs.structureAnchorY) {
        modMakerRefs.structureAnchorY.disabled = !structure;
        modMakerRefs.structureAnchorY.max = structure ? Math.max(0, structure.height - 1) : 0;
        modMakerRefs.structureAnchorY.value = structure ? structure.anchorY : 0;
    }
    if (modMakerRefs.structureTags) {
        modMakerRefs.structureTags.disabled = !structure;
        modMakerRefs.structureTags.value = structure?.tagsText || '';
    }
    if (modMakerRefs.structureAllowRotate) {
        modMakerRefs.structureAllowRotate.disabled = !structure;
        modMakerRefs.structureAllowRotate.checked = !!structure?.allowRotation;
    }
    if (modMakerRefs.structureAllowMirror) {
        modMakerRefs.structureAllowMirror.disabled = !structure;
        modMakerRefs.structureAllowMirror.checked = !!structure?.allowMirror;
    }
    if (modMakerRefs.structureWidth) {
        modMakerRefs.structureWidth.disabled = !structure;
        modMakerRefs.structureWidth.value = structure ? structure.width : 1;
    }
    if (modMakerRefs.structureHeight) {
        modMakerRefs.structureHeight.disabled = !structure;
        modMakerRefs.structureHeight.value = structure ? structure.height : 1;
    }
    if (structure) renderStructureGrid(structure);
    if (modMakerRefs.patternPreview) {
        modMakerRefs.patternPreview.value = structure ? modMakerPatternFromMatrix(structure.matrix).join('\n') : '';
    }

    if (modMakerRefs.generatorList) {
        modMakerRefs.generatorList.innerHTML = '';
        modMakerState.generators.forEach((item, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.textContent = item.name || item.id || `生成タイプ${idx + 1}`;
            btn.classList.toggle('active', idx === modMakerState.selectedGenerator);
            btn.addEventListener('click', () => {
                modMakerState.selectedGenerator = idx;
                renderModMaker();
            });
            modMakerRefs.generatorList.appendChild(btn);
        });
    }

    if (modMakerRefs.generatorId) {
        modMakerRefs.generatorId.disabled = !generator;
        modMakerRefs.generatorId.value = generator?.id || '';
    }
    if (modMakerRefs.generatorName) {
        modMakerRefs.generatorName.disabled = !generator;
        modMakerRefs.generatorName.value = generator?.name || '';
    }
    if (modMakerRefs.generatorDescription) {
        modMakerRefs.generatorDescription.disabled = !generator;
        modMakerRefs.generatorDescription.value = generator?.description || '';
    }
    if (modMakerRefs.generatorNormalMix) {
        modMakerRefs.generatorNormalMix.disabled = !generator;
        modMakerRefs.generatorNormalMix.value = generator ? generator.mixinNormal : 0;
    }
    if (modMakerRefs.generatorBlockdimMix) {
        modMakerRefs.generatorBlockdimMix.disabled = !generator;
        modMakerRefs.generatorBlockdimMix.value = generator ? generator.mixinBlockDim : 0;
    }
    if (modMakerRefs.generatorTags) {
        modMakerRefs.generatorTags.disabled = !generator;
        modMakerRefs.generatorTags.value = generator?.tagsText || '';
    }
    if (modMakerRefs.generatorCode) {
        modMakerRefs.generatorCode.disabled = !generator;
        modMakerRefs.generatorCode.value = generator?.code || '';
    }

    renderModMakerFixed(fixed);

    renderModMakerBlocks();

    const result = buildModMakerOutput();
    updateModMakerOutputView(result);
}

function buildModMakerOutput() {
    ensureModMakerDefaults();
    const errors = [];
    const metaId = (modMakerState.metadata.id || '').trim();
    const metaName = (modMakerState.metadata.name || '').trim();
    const metaVersion = (modMakerState.metadata.version || '').trim() || '1.0.0';
    const metaAuthor = (modMakerState.metadata.author || '').trim();
    const metaDescription = (modMakerState.metadata.description || '').trim();

    if (!metaId) errors.push('アドオンIDを入力してください。');
    if (metaId && !/^[a-zA-Z0-9_\-]+$/.test(metaId)) errors.push('アドオンIDは英数字・ハイフン・アンダースコアのみ使用できます。');

    const normalizedStructures = [];
    const structureIds = new Set();
    modMakerState.structures.forEach((structure, idx) => {
        const id = (structure.id || '').trim();
        if (!id) errors.push(`構造${idx + 1}のIDを入力してください。`);
        else if (structureIds.has(id)) errors.push(`構造ID「${id}」が重複しています。`);
        else structureIds.add(id);
        const width = clampStructureSize(structure.width);
        const height = clampStructureSize(structure.height);
        if (structure.anchorX < 0 || structure.anchorX >= width || structure.anchorY < 0 || structure.anchorY >= height) {
            errors.push(`構造${idx + 1}のアンカー位置が範囲外です。`);
        }
        normalizedStructures.push({
            id,
            name: (structure.name || '').trim(),
            anchorX: clampAnchor(structure.anchorX, width - 1),
            anchorY: clampAnchor(structure.anchorY, height - 1),
            allowRotation: structure.allowRotation !== false,
            allowMirror: structure.allowMirror !== false,
            tags: parseTags(structure.tagsText || ''),
            pattern: modMakerPatternFromMatrix(structure.matrix || modMakerCreateMatrix(width, height, null))
        });
    });

    const normalizedGenerators = [];
    const generatorIds = new Set();
    if (!modMakerState.generators.length) errors.push('生成タイプを最低1つ追加してください。');
    modMakerState.generators.forEach((generator, idx) => {
        const id = (generator.id || '').trim();
        if (!id) errors.push(`生成タイプ${idx + 1}のIDを入力してください。`);
        else if (generatorIds.has(id)) errors.push(`生成タイプID「${id}」が重複しています。`);
        else generatorIds.add(id);
        let code = (generator.code || '').trim();
        const mixNormal = Number(generator.mixinNormal);
        const mixBlock = Number(generator.mixinBlockDim);
        if (Number.isFinite(mixNormal) && (mixNormal < 0 || mixNormal > 1)) errors.push(`生成タイプ${idx + 1}のNormal混合参加率は0〜1で指定してください。`);
        if (Number.isFinite(mixBlock) && (mixBlock < 0 || mixBlock > 1)) errors.push(`生成タイプ${idx + 1}のBlock次元混合参加率は0〜1で指定してください。`);
        const floors = normalizeGeneratorFixed(generator, idx, errors);
        if (!code) {
            if (floors) {
                code = MOD_MAKER_TEMPLATES.fixed.trim();
            } else {
                errors.push(`生成タイプ${idx + 1}のアルゴリズムコードを入力してください。`);
            }
        }
        normalizedGenerators.push({
            id,
            name: (generator.name || '').trim(),
            description: (generator.description || '').trim(),
            mixinNormal: Number.isFinite(mixNormal) ? Math.max(0, Math.min(1, mixNormal)) : 0,
            mixinBlockDim: Number.isFinite(mixBlock) ? Math.max(0, Math.min(1, mixBlock)) : 0,
            tags: parseTags(generator.tagsText || ''),
            code,
            floors
        });
    });

    const normalizedBlocks = { blocks1: [], blocks2: [], blocks3: [] };
    const blockKeys = new Set();
    for (const tier of ['blocks1', 'blocks2', 'blocks3']) {
        const entries = modMakerState.blocks[tier] || [];
        entries.forEach((entry, idx) => {
            const key = (entry.key || '').trim();
            if (!key) {
                errors.push(`${tier.toUpperCase()} ブロック${idx + 1}のキーを入力してください。`);
                return;
            }
            if (blockKeys.has(key)) {
                errors.push(`ブロックキー「${key}」が重複しています。`);
                return;
            }
            blockKeys.add(key);
            const level = parseNumber(entry.level);
            const size = parseNumber(entry.size);
            const depth = parseNumber(entry.depth);
            const bossFloors = parseBossFloors(entry.bossFloors || '');
            const record = { key };
            if ((entry.name || '').trim()) record.name = entry.name.trim();
            if (Number.isFinite(level)) record.level = level;
            if (Number.isFinite(size)) record.size = size;
            if (Number.isFinite(depth)) record.depth = depth;
            if ((entry.chest || '').trim()) record.chest = entry.chest.trim();
            if ((entry.type || '').trim()) record.type = entry.type.trim();
            if (bossFloors.length) record.bossFloors = bossFloors;
            if ((entry.description || '').trim()) record.description = entry.description.trim();
            normalizedBlocks[tier].push(record);
        });
    }

    const addonProps = [];
    addonProps.push([`id: ${jsString(metaId)}`]);
    if (metaName) addonProps.push([`name: ${jsString(metaName)}`]);
    addonProps.push([`version: ${jsString(metaVersion)}`]);
    if (metaAuthor) addonProps.push([`author: ${jsString(metaAuthor)}`]);
    if (metaDescription) addonProps.push([`description: ${jsString(metaDescription)}`]);

    if (normalizedStructures.length) {
        const structBlock = ['structures: ['];
        normalizedStructures.forEach((structure, idx) => {
            const lines = buildStructureLines(structure);
            if (idx < normalizedStructures.length - 1) {
                lines[lines.length - 1] += ',';
            }
            structBlock.push(...lines);
        });
        structBlock.push(']');
        addonProps.push(structBlock);
    }

    if (normalizedGenerators.length) {
        const genBlock = ['generators: ['];
        normalizedGenerators.forEach((generator, idx) => {
            const lines = buildGeneratorLines(generator);
            if (idx < normalizedGenerators.length - 1) {
                lines[lines.length - 1] += ',';
            }
            genBlock.push(...lines);
        });
        genBlock.push(']');
        addonProps.push(genBlock);
    }

    const blockEntries = Object.fromEntries(Object.entries(normalizedBlocks).filter(([, arr]) => arr.length));
    if (Object.keys(blockEntries).length) {
        const blockLines = ['blocks: {'];
        const tiers = Object.keys(blockEntries);
        tiers.forEach((tier, idx) => {
            blockLines.push(`${indent(3)}${tier}: [`);
            blockEntries[tier].forEach((entry, entryIdx) => {
                const lines = buildBlockEntryLines(entry, 4);
                if (entryIdx < blockEntries[tier].length - 1) {
                    lines[lines.length - 1] += ',';
                }
                blockLines.push(...lines);
            });
            blockLines.push(`${indent(3)}]${idx < tiers.length - 1 ? ',' : ''}`);
        });
        blockLines.push('}');
        addonProps.push(blockLines);
    }

    const lines = [];
    lines.push('// Generated by Tools - Dungeon Type Mod Maker');
    lines.push('(function(){');
    lines.push(`${indent(1)}const addon = {`);
    addonProps.forEach((propLines, idx) => {
        const linesForProp = Array.isArray(propLines) ? propLines : [propLines];
        const isLast = idx === addonProps.length - 1;
        linesForProp.forEach((line, lineIdx) => {
            const needsComma = !isLast && lineIdx === linesForProp.length - 1;
            lines.push(`${indent(2)}${line}${needsComma ? ',' : ''}`);
        });
    });
    lines.push(`${indent(1)}};`);
    lines.push(`${indent(1)}window.registerDungeonAddon(addon);`);
    lines.push('})();');

    return { code: lines.join('\n'), errors };
}

function updateModMakerOutputView(result) {
    if (!modMakerRefs) return;
    const { code, errors } = result || { code: '', errors: [] };
    if (modMakerRefs.output) modMakerRefs.output.value = code || '';
    if (modMakerRefs.copy) {
        modMakerRefs.copy.disabled = !code || errors.length > 0;
        modMakerRefs.copy.textContent = modMakerCopyLabel;
    }
    if (modMakerRefs.download) modMakerRefs.download.disabled = !code || errors.length > 0;
    if (modMakerRefs.errors) {
        modMakerRefs.errors.innerHTML = '';
        if (errors.length) {
            modMakerRefs.errors.style.color = '#dc2626';
            const heading = document.createElement('div');
            heading.textContent = `⚠️ ${errors.length} 件の確認事項があります`;
            const list = document.createElement('ul');
            errors.forEach(msg => {
                const li = document.createElement('li');
                li.textContent = msg;
                list.appendChild(li);
            });
            modMakerRefs.errors.appendChild(heading);
            modMakerRefs.errors.appendChild(list);
        } else {
            modMakerRefs.errors.style.color = '#15803d';
            modMakerRefs.errors.textContent = '✅ 出力できます';
        }
    }
}

function refreshModMakerPreview() {
    updateModMakerOutputView(buildModMakerOutput());
}

function formatAlgorithmLines(code) {
    const normalized = (code || '').replace(/\r\n/g, '\n').trim();
    if (!normalized) {
        return [
            'function(ctx) {',
            '  // TODO: ctx.map などを編集してダンジョンを生成してください。',
            '}'
        ];
    }
    const lines = normalized.split('\n');
    if (normalized.startsWith('function')) return lines;
    const body = lines.map(line => `  ${line}`);
    return ['function(ctx) {', ...body, '}'];
}

function buildStructureLines(structure) {
    const lines = [];
    lines.push(`${indent(3)}{`);
    lines.push(`${indent(4)}id: ${jsString(structure.id)},`);
    if (structure.name) lines.push(`${indent(4)}name: ${jsString(structure.name)},`);
    lines.push(`${indent(4)}anchor: { x: ${structure.anchorX}, y: ${structure.anchorY} },`);
    lines.push(`${indent(4)}allowRotation: ${structure.allowRotation ? 'true' : 'false'},`);
    lines.push(`${indent(4)}allowMirror: ${structure.allowMirror ? 'true' : 'false'},`);
    if (structure.tags.length) lines.push(`${indent(4)}tags: ${JSON.stringify(structure.tags)},`);
    lines.push(`${indent(4)}pattern: [`);
    structure.pattern.forEach(row => {
        lines.push(`${indent(5)}${jsString(row)},`);
    });
    lines.push(`${indent(4)}]`);
    lines.push(`${indent(3)}}`);
    return lines;
}

function buildGeneratorLines(generator) {
    const lines = [`${indent(3)}{`];
    const props = [];
    props.push([`id: ${jsString(generator.id)}`]);
    if (generator.name) props.push([`name: ${jsString(generator.name)}`]);
    if (generator.description) props.push([`description: ${jsString(generator.description)}`]);
    const mixParts = [];
    if (generator.mixinNormal > 0) mixParts.push(`normalMixed: ${generator.mixinNormal}`);
    if (generator.mixinBlockDim > 0) mixParts.push(`blockDimMixed: ${generator.mixinBlockDim}`);
    if (generator.tags.length) mixParts.push(`tags: ${JSON.stringify(generator.tags)}`);
    if (mixParts.length) props.push([`mixin: { ${mixParts.join(', ')} }`]);
    if (generator.floors) {
        const floorsLines = buildGeneratorFloorsLines(generator.floors);
        if (floorsLines.length) props.push(floorsLines);
    }
    const algoLines = formatAlgorithmLines(generator.code);
    if (algoLines.length) {
        const prop = [`algorithm: ${algoLines[0]}`, ...algoLines.slice(1)];
        props.push(prop);
    }
    props.forEach((propLines, idx) => {
        const isLast = idx === props.length - 1;
        propLines.forEach((line, lineIdx) => {
            const needsComma = !isLast && lineIdx === propLines.length - 1;
            lines.push(`${indent(4)}${line}${needsComma ? ',' : ''}`);
        });
    });
    lines.push(`${indent(3)}}`);
    return lines;
}

function buildGeneratorFloorsLines(floors) {
    if (!floors || !Array.isArray(floors.maps) || !floors.maps.length) return [];
    const maxFloor = Number.isFinite(floors.max) ? floors.max : floors.maps.length;
    const lines = ['floors: {'];
    lines.push(`  max: ${maxFloor},`);
    const boss = Array.isArray(floors.bossFloors) ? floors.bossFloors.filter(n => Number.isFinite(n)).map(n => Math.floor(n)) : [];
    if (boss.length) {
        lines.push(`  bossFloors: [${boss.join(', ')}],`);
    }
    lines.push('  maps: [');
    floors.maps.forEach((map, idx) => {
        const layout = Array.isArray(map.layout) ? map.layout : [];
        lines.push('    {');
        lines.push(`      floor: ${Number.isFinite(map.floor) ? Math.floor(map.floor) : idx + 1},`);
        lines.push('      layout: [');
        layout.forEach((row, rowIdx) => {
            const comma = rowIdx < layout.length - 1 ? ',' : '';
            lines.push(`        ${jsString(row)}${comma}`);
        });
        lines.push('      ]');
        lines.push(`    }${idx < floors.maps.length - 1 ? ',' : ''}`);
    });
    lines.push('  ]');
    lines.push('}');
    return lines;
}

function buildBlockEntryLines(entry, baseIndent = 4) {
    const props = [];
    props.push([`key: ${jsString(entry.key)}`]);
    if (entry.name) props.push([`name: ${jsString(entry.name)}`]);
    if (Object.prototype.hasOwnProperty.call(entry, 'level')) props.push([`level: ${entry.level}`]);
    if (Object.prototype.hasOwnProperty.call(entry, 'size')) props.push([`size: ${entry.size}`]);
    if (Object.prototype.hasOwnProperty.call(entry, 'depth')) props.push([`depth: ${entry.depth}`]);
    if (entry.chest) props.push([`chest: ${jsString(entry.chest)}`]);
    if (entry.type) props.push([`type: ${jsString(entry.type)}`]);
    if (Array.isArray(entry.bossFloors) && entry.bossFloors.length) props.push([`bossFloors: [${entry.bossFloors.join(', ')}]`]);
    if (entry.description) props.push([`description: ${jsString(entry.description)}`]);
    const lines = [`${indent(baseIndent)}{`];
    props.forEach((propLines, idx) => {
        const isLast = idx === props.length - 1;
        propLines.forEach((line, lineIdx) => {
            const needsComma = !isLast && lineIdx === propLines.length - 1;
            lines.push(`${indent(baseIndent + 1)}${line}${needsComma ? ',' : ''}`);
        });
    });
    lines.push(`${indent(baseIndent)}}`);
    return lines;
}

function parseTags(text) {
    if (!text) return [];
    return text.split(',').map(t => t.trim()).filter(Boolean);
}

function parseBossFloors(text) {
    if (!text) return [];
    return text.split(/[\s,]+/).map(v => parseInt(v, 10)).filter(n => Number.isFinite(n));
}

function parseNumber(value) {
    if (value == null || value === '') return NaN;
    const n = Number(value);
    return Number.isFinite(n) ? n : NaN;
}

function indent(level) {
    return '  '.repeat(level);
}

function jsString(value) {
    return JSON.stringify(value ?? '');
}

async function copyModMakerOutput() {
    if (!modMakerRefs?.output) return;
    const text = modMakerRefs.output.value;
    if (!text) return;
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            showModMakerCopyFeedback('コピーしました');
            return;
        }
    } catch {}
    try {
        const textarea = modMakerRefs.output;
        textarea.focus();
        textarea.select();
        const ok = document.execCommand('copy');
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        showModMakerCopyFeedback(ok ? 'コピーしました' : 'コピーできませんでした');
    } catch {
        showModMakerCopyFeedback('コピーできませんでした');
    }
}

function showModMakerCopyFeedback(message) {
    modMakerCopyLabel = message;
    if (modMakerRefs?.copy) modMakerRefs.copy.textContent = modMakerCopyLabel;
    if (modMakerCopyTimer) clearTimeout(modMakerCopyTimer);
    modMakerCopyTimer = setTimeout(() => {
        modMakerCopyLabel = 'クリップボードにコピー';
        if (modMakerRefs?.copy) modMakerRefs.copy.textContent = modMakerCopyLabel;
    }, 2000);
}

function downloadModMakerOutput() {
    if (!modMakerRefs?.output) return;
    const code = modMakerRefs.output.value;
    if (!code) return;
    const base = (modMakerState.metadata.id || 'dungeon_addon').replace(/[^a-zA-Z0-9_-]/g, '_');
    const blob = new Blob([code], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${base}.js`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}




// 一元的なセーブ
function saveAll() {
    try {
        localStorage.setItem('roguelike_save_v1', JSON.stringify({
            dungeonLevel,
            player,
            selectedWorld,
            selectedDungeonBase,
            difficulty,
            mode: currentMode,
            blockDim: blockDimState?.enabled ? {
                enabled: true,
                nested: blockDimState.nested || 1,
                dimKey: blockDimState.dimKey,
                b1Key: blockDimState.b1Key,
                b2Key: blockDimState.b2Key,
                b3Key: blockDimState.b3Key,
                spec: blockDimState.spec,
                seed: blockDimState.seed
            } : { enabled: false },
            blockDimHistory,
            blockDimBookmarks,
            miniExp: miniExpState
        }));
    } catch {}
}

// カメラ（プレイヤー中心に追従）
const camera = { x: 0, y: 0 };

function updateCamera() {
    const halfW = Math.floor(VIEWPORT_WIDTH / 2);
    const halfH = Math.floor(VIEWPORT_HEIGHT / 2);
    let camX = player.x - halfW;
    let camY = player.y - halfH;
    camX = Math.max(0, Math.min(MAP_WIDTH - VIEWPORT_WIDTH, camX));
    camY = Math.max(0, Math.min(MAP_HEIGHT - VIEWPORT_HEIGHT, camY));
    camera.x = camX;
    camera.y = camY;
}

function isFloor(x, y) {
    return map[y] && map[y][x] === 0;
}

function countFloorTiles() {
    let n = 0;
    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            if (map[y][x] === 0) n++;
        }
    }
    return n;
}

ffunction ensureMinimumFloors(minTiles = 10) {
    const floors = countFloorTiles();
    if (floors >= minTiles) return;
    // Carve a small room at center as a safety fallback
    const cx = Math.floor(MAP_WIDTH / 2);
    const cy = Math.floor(MAP_HEIGHT / 2);
    const half = Math.max(1, Math.floor(Math.min(MAP_WIDTH, MAP_HEIGHT) * 0.05)); // ~5% size
    for (let y = Math.max(1, cy - half); y <= Math.min(MAP_HEIGHT - 2, cy + half); y++) {
        for (let x = Math.max(1, cx - half); x <= Math.min(MAP_WIDTH - 2, cx + half); x++) {
            map[y][x] = 0;
        }
    }
}

function randomFloorPosition(excludePositions = []) {
    const excludeSet = new Set(excludePositions.map(p => `${p.x},${p.y}`));
    const maxTries = Math.max(2000, MAP_WIDTH * MAP_HEIGHT * 4);
    for (let t = 0; t < maxTries; t++) {
        const x = Math.floor(Math.random() * MAP_WIDTH);
        const y = Math.floor(Math.random() * MAP_HEIGHT);
        if (map[y] && map[y][x] === 0 && !excludeSet.has(`${x},${y}`)) {
            return { x, y };
        }
    }
    // Fallback: scan for any floor not excluded
    for (let y = 1; y < MAP_HEIGHT - 1; y++) {
        for (let x = 1; x < MAP_WIDTH - 1; x++) {
            if (map[y][x] === 0 && !excludeSet.has(`${x},${y}`)) return { x, y };
        }
    }
    // As a last resort, carve the center tile
    const cx = Math.floor(MAP_WIDTH / 2), cy = Math.floor(MAP_HEIGHT / 2);
    map[cy][cx] = 0;
    return { x: cx, y: cy };
}

// Pick K floor positions with a minimum Euclidean spacing
function pickSpreadFloorPositions(count, minDist, exclude = []) {
    const result = [];
    const maxTries = Math.max(200, count * 200);
    const minDist2 = (minDist || 0) * (minDist || 0);
    function ok(pos) {
        for (const p of exclude) {
            const dx = p.x - pos.x, dy = p.y - pos.y; if (dx*dx + dy*dy < minDist2) return false;
        }
        for (const p of result) {
            const dx = p.x - pos.x, dy = p.y - pos.y; if (dx*dx + dy*dy < minDist2) return false;
        }
        return true;
    }
    let tries = 0;
    while (result.length < count && tries++ < maxTries) {
        const pos = randomFloorPosition(exclude.concat(result));
        if (ok(pos)) result.push(pos);
    }
    // Fallback: fill remaining without spacing if necessary
    while (result.length < count) {
        result.push(randomFloorPosition(exclude.concat(result)));
    }
    return result;
}

function generateMap() {
    map = [];
    tileMeta = [];
    for (let y = 0; y < MAP_HEIGHT; y++) {
        map[y] = [];
        tileMeta[y] = Array(MAP_WIDTH).fill(null);
        for (let x = 0; x < MAP_WIDTH; x++) {
            map[y][x] = 1; // Start with all walls
        }
    }
    
    // Choose generation type based on mode
    let genType = resolveCurrentGeneratorType() || 'field';
    // mixed以外はここで実タイプ記録
    lastGeneratedGenType = genType;

    // アドオン生成タイプのフック（genType が登録IDに一致したらこちらを優先）
    if (DungeonGenRegistry && DungeonGenRegistry.has(genType)) {
        try { runAddonGenerator(genType); } catch (e) { console.warn('addon generator failed', genType, e); generateFieldType(); }
    } else switch (genType) {
        case 'field':
            generateFieldType();
            break;
        case 'cave':
            generateCaveType();
            break;
        case 'grid':
            generateGridType();
            break;
        case 'open-space':
            generateOpenSpaceType();
            break;
        case 'maze':
            generateMazeType();
            break;
        case 'rooms':
            generateRoomsType();
            break;
        case 'single-room':
            generateSingleRoomType();
            break;
        case 'circle':
            generateCircleType();
            break;
        case 'narrow-maze':
            generateNarrowMazeType();
            break;
        case 'wide-maze':
            generateWideMazeType();
            break;
        case 'snake':
            generateSnakeType();
            break;
        case 'mixed':
            generateMixedType();
            break;
        case 'circle-rooms':
            generateCircleRoomsType();
            break;
        default:
            generateFieldType();
    }
    
    // Ensure borders are always walls
    for (let x = 0; x < MAP_WIDTH; x++) {
        map[0][x] = 1;
        map[MAP_HEIGHT - 1][x] = 1;
    }
    for (let y = 0; y < MAP_HEIGHT; y++) {
        map[y][0] = 1;
        map[y][MAP_WIDTH - 1] = 1;
    }
    // Fallback safety: ensure there are some floor tiles to avoid infinite loops
    ensureMinimumFloors(10);
}

function resolveCurrentGeneratorType() {
    if (currentMode === 'blockdim' && blockDimState?.spec) {
        return blockDimState.spec.type || 'mixed';
    }
    if (selectedWorld === 'X') {
        const data = dungeonInfo['X'];
        return data ? data.type : 'mixed';
    }
    const dungeonData = dungeonInfo[selectedDungeonBase];
    return dungeonData ? dungeonData.type : 'field';
}

function getFixedMapRecord(bundle, floor) {
    if (!bundle || !Array.isArray(bundle.maps) || !bundle.maps.length) return null;
    const target = Number.isFinite(floor) ? Math.max(1, Math.floor(floor)) : 1;
    if (bundle.mapByFloor && bundle.mapByFloor.has(target)) {
        return bundle.mapByFloor.get(target);
    }
    let fallback = null;
    for (const map of bundle.maps) {
        if (map.floor <= target) fallback = map;
        if (map.floor >= target) break;
    }
    return fallback || bundle.maps[0];
}

function reshapeMap(width, height, ctx) {
    const w = Math.max(3, Math.floor(width));
    const h = Math.max(3, Math.floor(height));
    if (MAP_WIDTH !== w || MAP_HEIGHT !== h) {
        MAP_WIDTH = w;
        MAP_HEIGHT = h;
    }
    map.length = h;
    for (let y = 0; y < h; y++) {
        if (!map[y]) map[y] = [];
        map[y].length = w;
        for (let x = 0; x < w; x++) {
            map[y][x] = 1;
        }
    }
    tileMeta = Array.from({ length: h }, () => Array(w).fill(null));
    if (ctx) {
        ctx.width = w;
        ctx.height = h;
        ctx.map = map;
    }
}

function applyFixedMapLayout(bundle, floor, ctx) {
    const record = getFixedMapRecord(bundle, floor);
    if (!record) return false;
    reshapeMap(record.width, record.height, ctx);
    for (let y = 0; y < record.height; y++) {
        for (let x = 0; x < record.width; x++) {
            const cell = record.matrix?.[y]?.[x];
            map[y][x] = cell === 0 ? 0 : 1;
        }
    }
    return true;
}

function makeFixedMapApi(generatorId, ctx) {
    const bundle = FixedMapRegistry.get(generatorId);
    if (!bundle) {
        return {
            available: false,
            meta: null,
            list: () => [],
            get: () => null,
            apply: () => false,
            applyCurrent: () => false
        };
    }
    return {
        available: true,
        meta: {
            addonId: bundle.addonId || null,
            generatorId,
            max: bundle.max,
            bossFloors: bundle.bossFloors.slice()
        },
        list() {
            return bundle.maps.map(map => ({ floor: map.floor, width: map.width, height: map.height }));
        },
        get(floor) {
            const record = getFixedMapRecord(bundle, floor ?? ctx?.floor ?? dungeonLevel);
            if (!record) return null;
            return { floor: record.floor, width: record.width, height: record.height, layout: record.layout.slice() };
        },
        apply(floor) {
            return applyFixedMapLayout(bundle, floor ?? ctx?.floor ?? dungeonLevel, ctx);
        },
        applyCurrent() {
            return applyFixedMapLayout(bundle, ctx?.floor ?? dungeonLevel, ctx);
        }
    };
}

function prepareFixedMapDimensionsIfNeeded() {
    const genType = resolveCurrentGeneratorType();
    if (!genType) return;
    const bundle = FixedMapRegistry.get(genType);
    if (!bundle) return;
    const record = getFixedMapRecord(bundle, dungeonLevel);
    if (!record) return;
    MAP_WIDTH = record.width;
    MAP_HEIGHT = record.height;
}

function generateFieldType() {
    // Open field with scattered obstacles - scale density with map size
    const baseDensity = 0.15; // Base wall density
    const sizeFactor = Math.min(MAP_WIDTH, MAP_HEIGHT) / 20; // Scale factor based on map size
    const wallDensity = Math.max(0.08, baseDensity / Math.sqrt(sizeFactor)); // Reduce density for larger maps
    
    for (let y = 1; y < MAP_HEIGHT - 1; y++) {
        for (let x = 1; x < MAP_WIDTH - 1; x++) {
            map[y][x] = Math.random() < wallDensity ? 1 : 0;
        }
    }
    ensureConnectivity();
}

// Grid type - orthogonal corridors forming a lattice (spacing=1, thickness=1)
function generateGridType() {
    // Start with walls (already set by caller)
    const step = 2; // spacing=1 wall cell between corridors
    // Horizontal corridors (1-cell thickness)
    for (let y = 2; y < MAP_HEIGHT - 2; y += step) {
        for (let x = 1; x < MAP_WIDTH - 1; x++) map[y][x] = 0;
    }
    // Vertical corridors (1-cell thickness)
    for (let x = 2; x < MAP_WIDTH - 2; x += step) {
        for (let y = 1; y < MAP_HEIGHT - 1; y++) map[y][x] = 0;
    }
    ensureConnectivity();
}

// Open-space type - everything inside border is floor
function generateOpenSpaceType() {
    for (let y = 1; y < MAP_HEIGHT - 1; y++) {
        for (let x = 1; x < MAP_WIDTH - 1; x++) {
            map[y][x] = 0;
        }
    }
    // Connectivity is trivially satisfied
}

function generateCaveType() {
    // Constrained Drunkard's Walk + light CA smoothing for varied cave systems
    // 1) Start with all walls (keep border walls outside)
    for (let y = 1; y < MAP_HEIGHT - 1; y++) {
        for (let x = 1; x < MAP_WIDTH - 1; x++) map[y][x] = 1;
    }

    const area = (MAP_WIDTH - 2) * (MAP_HEIGHT - 2);
    const targetFill = Math.floor(area * 0.42); // target floor tiles
    const maxSteps = area * 4; // safety
    const turnRate = 0.28;     // chance to pick a new dir per step
    const branchRate = 0.03;   // chance to spawn a new walker
    const maxWalkers = 6;
    const DIRS = [ [1,0], [-1,0], [0,1], [0,-1] ];

    function randDir(prev) {
        if (!prev || Math.random() < 0.5) return DIRS[Math.floor(Math.random() * 4)];
        // Avoid immediate reversal with bias
        const candidates = DIRS.filter(d => !(d[0] === -prev[0] && d[1] === -prev[1]));
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    function clampInside(x, y) {
        return {
            x: Math.max(1, Math.min(MAP_WIDTH - 2, x)),
            y: Math.max(1, Math.min(MAP_HEIGHT - 2, y))
        };
    }

    const walkers = [];
    const wcount = Math.max(2, Math.min(maxWalkers, Math.floor(Math.min(MAP_WIDTH, MAP_HEIGHT) / 10)));
    for (let i = 0; i < wcount; i++) {
        walkers.push({
            x: 1 + Math.floor(Math.random() * (MAP_WIDTH - 2)),
            y: 1 + Math.floor(Math.random() * (MAP_HEIGHT - 2)),
            dir: randDir(null)
        });
    }

    let carved = 0;
    let steps = 0;
    while (carved < targetFill && steps < maxSteps && walkers.length > 0) {
        steps++;
        for (let w = walkers.length - 1; w >= 0; w--) {
            const walker = walkers[w];
            // Carve at current position (plus occasional side cells for irregularity)
            if (map[walker.y][walker.x] === 1) { map[walker.y][walker.x] = 0; carved++; }
            if (Math.random() < 0.15) {
                const side = Math.random() < 0.5 ? [walker.dir[1], walker.dir[0]] : [-walker.dir[1], -walker.dir[0]];
                const sx = walker.x + side[0], sy = walker.y + side[1];
                if (inBounds(sx, sy) && map[sy][sx] === 1) { map[sy][sx] = 0; carved++; }
            }

            // Randomly turn
            if (Math.random() < turnRate) walker.dir = randDir(walker.dir);

            // Branch occasionally
            if (walkers.length < maxWalkers && Math.random() < branchRate) {
                const nx = walker.x + walker.dir[0];
                const ny = walker.y + walker.dir[1];
                const nd = randDir(walker.dir);
                const p = clampInside(nx, ny);
                walkers.push({ x: p.x, y: p.y, dir: nd });
            }

            // Step forward; bounce at borders
            let nx = walker.x + walker.dir[0];
            let ny = walker.y + walker.dir[1];
            if (!inBounds(nx, ny)) {
                walker.dir = randDir(walker.dir);
                const p = clampInside(walker.x, walker.y);
                walker.x = p.x; walker.y = p.y;
            } else {
                walker.x = nx; walker.y = ny;
            }
        }
    }

    // 2) Optional larger chambers to diversify
    if (Math.random() < 0.8) createCaveChambers();

    // 3) Light cellular automata smoothing for natural look
    const smooths = 2;
    for (let i = 0; i < smooths; i++) smoothMapWithThreshold(5);

    // 4) Ensure global connectivity using A*
    ensureConnectivity();

    // 5) Cleanup ragged edges
    cleanupCaveEdges();
}

function generateMazeType() {
    // Create guaranteed path first
    for (let y = 1; y < MAP_HEIGHT - 1; y++) {
        for (let x = 1; x < MAP_WIDTH - 1; x++) {
            map[y][x] = 0; // Start with all floors
        }
    }
    
    // Scale maze density with map size
    const sizeFactor = Math.min(MAP_WIDTH, MAP_HEIGHT) / 20;
    const stepSize = Math.max(2, Math.floor(2 * sizeFactor)); // Scale step size
    const wallProbability = Math.max(0.4, 0.6 - (sizeFactor - 1) * 0.1); // Reduce wall probability for larger mazes
    
    // Add maze walls while maintaining connectivity
    for (let y = stepSize; y < MAP_HEIGHT - stepSize; y += stepSize) {
        for (let x = stepSize; x < MAP_WIDTH - stepSize; x += stepSize) {
            if (Math.random() < wallProbability) {
                map[y][x] = 1;
                // Add connecting wall in random direction
                const directions = [[0,1], [1,0], [0,-1], [-1,0]];
                const dir = directions[Math.floor(Math.random() * directions.length)];
                const newX = x + dir[0];
                const newY = y + dir[1];
                if (newX > 0 && newX < MAP_WIDTH-1 && newY > 0 && newY < MAP_HEIGHT-1) {
                    map[newY][newX] = 1;
                }
            }
        }
    }
    
    // Add some random walls for complexity
    const additionalWalls = Math.floor((MAP_WIDTH * MAP_HEIGHT) * 0.05);
    for (let i = 0; i < additionalWalls; i++) {
        const x = 1 + Math.floor(Math.random() * (MAP_WIDTH - 2));
        const y = 1 + Math.floor(Math.random() * (MAP_HEIGHT - 2));
        if (Math.random() < 0.3) {
            map[y][x] = 1;
        }
    }
    
    ensureConnectivity();
}

function generateRoomsType() {
    // Rooms via Poisson Disk placement + MST corridors (with A* digging)
    const sizeFactor = Math.min(MAP_WIDTH, MAP_HEIGHT) / 20;
    const baseRooms = Math.max(4, Math.floor(4 + sizeFactor * 2));
    const numRoomsTarget = baseRooms + Math.floor(Math.random() * Math.max(2, Math.floor(sizeFactor)));

    const minRoomSize = Math.max(3, Math.floor(3 + sizeFactor * 0.5));
    const maxRoomSize = Math.max(5, Math.floor(6 + sizeFactor));
    const meanRoom = (minRoomSize + maxRoomSize) / 2;
    const margin = 2;
    const r = Math.max(3, Math.floor(meanRoom * 0.6)); // Poisson minimum distance

    function poissonDisk(width, height, radius, k = 30) {
        // Bridson's algorithm (discrete grid domain)
        const cell = radius / Math.SQRT2;
        const gw = Math.ceil(width / cell);
        const gh = Math.ceil(height / cell);
        const grid = new Array(gw * gh).fill(-1);
        const samples = [];
        const active = [];
        function gridIndex(x, y) { return x + y * gw; }
        function toGrid(p) { return [Math.floor(p.x / cell), Math.floor(p.y / cell)]; }
        function inRange(p) { return p.x >= margin && p.x < width - margin && p.y >= margin && p.y < height - margin; }
        function farEnough(p) {
            const [gx, gy] = toGrid(p);
            for (let yy = Math.max(gy - 2, 0); yy <= Math.min(gy + 2, gh - 1); yy++) {
                for (let xx = Math.max(gx - 2, 0); xx <= Math.min(gx + 2, gw - 1); xx++) {
                    const idx = grid[gridIndex(xx, yy)];
                    if (idx >= 0) {
                        const q = samples[idx];
                        const dx = q.x - p.x, dy = q.y - p.y;
                        if (dx * dx + dy * dy < radius * radius) return false;
                    }
                }
            }
            return true;
        }
        function add(p) {
            samples.push(p);
            active.push(p);
            const [gx, gy] = toGrid(p);
            grid[gridIndex(gx, gy)] = samples.length - 1;
        }
        // seed
        add({ x: Math.floor(Math.random() * (width - 2 * margin)) + margin, y: Math.floor(Math.random() * (height - 2 * margin)) + margin });
        while (active.length > 0 && samples.length < numRoomsTarget * 3) {
            const idx = Math.floor(Math.random() * active.length);
            const p = active[idx];
            let placed = false;
            for (let i = 0; i < k; i++) {
                const ang = Math.random() * Math.PI * 2;
                const rad = radius * (1 + Math.random()); // [r, 2r)
                const cand = { x: Math.floor(p.x + Math.cos(ang) * rad), y: Math.floor(p.y + Math.sin(ang) * rad) };
                if (inRange(cand) && farEnough(cand)) { add(cand); placed = true; break; }
            }
            if (!placed) { active.splice(idx, 1); }
        }
        return samples;
    }

    // Generate candidate centers and instantiate rooms
    const pts = poissonDisk(MAP_WIDTH, MAP_HEIGHT, r);
    const rooms = [];
    function rectsOverlap(a, b, gap = 2) {
        return !(a.x + a.w + gap <= b.x || b.x + b.w + gap <= a.x || a.y + a.h + gap <= b.y || b.y + b.h + gap <= a.y);
    }
    for (const p of pts) {
        if (rooms.length >= numRoomsTarget) break;
        const w = minRoomSize + Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1));
        const h = minRoomSize + Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1));
        const x = Math.max(1, Math.min(MAP_WIDTH - 1 - w, Math.floor(p.x - Math.floor(w / 2))));
        const y = Math.max(1, Math.min(MAP_HEIGHT - 1 - h, Math.floor(p.y - Math.floor(h / 2))));
        const rect = { x, y, w, h, cx: x + Math.floor(w / 2), cy: y + Math.floor(h / 2) };
        if (rooms.every(rm => !rectsOverlap(rect, rm, 2))) rooms.push(rect);
    }

    // Fallback to old placement if Poisson produced too few rooms
    if (rooms.length < Math.max(3, Math.floor(numRoomsTarget * 0.5))) {
        rooms.length = 0;
        for (let i = 0; i < numRoomsTarget; i++) {
            const roomW = minRoomSize + Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1));
            const roomH = minRoomSize + Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1));
            let roomX, roomY;
            let attempts = 0;
            do {
                roomX = 2 + Math.floor(Math.random() * (MAP_WIDTH - roomW - 4));
                roomY = 2 + Math.floor(Math.random() * (MAP_HEIGHT - roomH - 4));
                attempts++;
            } while (attempts < 80 && rooms.some(rm => !(roomX >= rm.x + rm.w + 2 || roomX + roomW + 2 <= rm.x || roomY >= rm.y + rm.h + 2 || roomY + roomH + 2 <= rm.y)));
            if (attempts < 80) rooms.push({ x: roomX, y: roomY, w: roomW, h: roomH, cx: roomX + Math.floor(roomW / 2), cy: roomY + Math.floor(roomH / 2) });
        }
    }

    // Dig rooms
    for (const rct of rooms) {
        for (let y = rct.y; y < rct.y + rct.h; y++) {
            for (let x = rct.x; x < rct.x + rct.w; x++) {
                map[y][x] = 0;
            }
        }
    }

    // Build MST over room centers
    const centers = rooms.map(r => ({ x: r.cx, y: r.cy }));
    const n = centers.length;
    const inTree = new Array(n).fill(false);
    const edges = [];
    if (n >= 2) {
        inTree[0] = true;
        for (let t = 1; t < n; t++) {
            let bestI = -1, bestJ = -1, bestD = Infinity;
            for (let i = 0; i < n; i++) if (inTree[i]) {
                for (let j = 0; j < n; j++) if (!inTree[j]) {
                    const dx = centers[i].x - centers[j].x;
                    const dy = centers[i].y - centers[j].y;
                    const d2 = dx * dx + dy * dy;
                    if (d2 < bestD) { bestD = d2; bestI = i; bestJ = j; }
                }
            }
            if (bestI !== -1) {
                inTree[bestJ] = true;
                edges.push([bestI, bestJ]);
            }
        }
    }

    // Add extra non-MST edges to create loops
    const extraRatio = 0.25;
    const possible = [];
    const inMst = new Set(edges.map(([i, j]) => `${Math.min(i, j)}-${Math.max(i, j)}`));
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            const key = `${i}-${j}`;
            if (!inMst.has(key)) possible.push([i, j]);
        }
    }
    // Shuffle possible lightly
    for (let k2 = possible.length - 1; k2 > 0; k2--) {
        const r2 = Math.floor(Math.random() * (k2 + 1));
        const tmp = possible[k2]; possible[k2] = possible[r2]; possible[r2] = tmp;
    }
    const extraCount = Math.min(possible.length, Math.max(0, Math.floor(edges.length * extraRatio)));
    for (let i = 0; i < extraCount; i++) edges.push(possible[i]);

    // Carve corridors via A*
    for (const [i, j] of edges) {
        const a = centers[i], b = centers[j];
        createCorridor(a.x, a.y, b.x, b.y);
    }

    ensureConnectivity();
}

function smoothMap() {
    smoothMapWithThreshold(5);
}

function smoothMapWithThreshold(threshold) {
    const newMap = map.map(row => [...row]);
    for (let y = 1; y < MAP_HEIGHT - 1; y++) {
        for (let x = 1; x < MAP_WIDTH - 1; x++) {
            let wallCount = 0;
            // Count walls in 3x3 neighborhood
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (map[y + dy][x + dx] === 1) wallCount++;
                }
            }
            // Apply cellular automata rule with specified threshold
            newMap[y][x] = wallCount >= threshold ? 1 : 0;
        }
    }
    map = newMap;
}

function createCaveChambers() {
    // Create larger open areas that resemble cave chambers
    const sizeFactor = Math.min(MAP_WIDTH, MAP_HEIGHT) / 20;
    const numChambers = Math.max(2, Math.floor(sizeFactor * 0.8));
    
    for (let i = 0; i < numChambers; i++) {
        const chamberRadius = Math.max(3, Math.floor(3 + Math.random() * sizeFactor));
        const centerX = chamberRadius + 2 + Math.floor(Math.random() * (MAP_WIDTH - 2 * chamberRadius - 4));
        const centerY = chamberRadius + 2 + Math.floor(Math.random() * (MAP_HEIGHT - 2 * chamberRadius - 4));
        
        // Create irregular chamber shape
        for (let y = centerY - chamberRadius; y <= centerY + chamberRadius; y++) {
            for (let x = centerX - chamberRadius; x <= centerX + chamberRadius; x++) {
                if (x > 0 && x < MAP_WIDTH - 1 && y > 0 && y < MAP_HEIGHT - 1) {
                    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                    // Create irregular chamber with some randomness
                    const threshold = chamberRadius * (0.7 + Math.random() * 0.3);
                    if (distance <= threshold) {
                        map[y][x] = 0;
                    }
                }
            }
        }
    }
}

function cleanupCaveEdges() {
    const newMap = map.map(row => [...row]);
    
    for (let y = 1; y < MAP_HEIGHT - 1; y++) {
        for (let x = 1; x < MAP_WIDTH - 1; x++) {
            if (map[y][x] === 1) {
                // Count adjacent floor tiles
                let floorCount = 0;
                const directions = [[0,1], [1,0], [0,-1], [-1,0]];
                for (const [dx, dy] of directions) {
                    if (map[y + dy][x + dx] === 0) floorCount++;
                }
                
                // Remove isolated walls surrounded by too many floors
                if (floorCount >= 3) {
                    newMap[y][x] = 0;
                }
            }
        }
    }
    
    map = newMap;
}

// ---------- Pathfinding & corridor carving (A* based) ----------
function inBounds(x, y) {
    return x >= 1 && x < MAP_WIDTH - 1 && y >= 1 && y < MAP_HEIGHT - 1;
}

function neighbors4(x, y) {
    return [
        [x + 1, y, 1, 0],
        [x - 1, y, -1, 0],
        [x, y + 1, 0, 1],
        [x, y - 1, 0, -1]
    ];
}

function countAdjacentWalls(x, y) {
    let c = 0;
    if (map[y][x + 1] === 1) c++;
    if (map[y][x - 1] === 1) c++;
    if (map[y + 1][x] === 1) c++;
    if (map[y - 1][x] === 1) c++;
    return c;
}

function aStarPath(start, goal, options = {}) {
    // options: { wallCost, floorCost, straightPenalty, hugWalls }
    const wallCost = options.wallCost ?? 1.0;      // extra cost to pass through walls
    const floorCost = options.floorCost ?? 0.0;    // extra cost to pass through floors
    const straightPenalty = options.straightPenalty ?? 0.15; // penalize continuing straight to get mild curves
    const hugWalls = options.hugWalls ?? 0.10;     // penalize cells far from walls (push path to hug walls)

    const startKey = `${start.x},${start.y}`;
    const goalKey = `${goal.x},${goal.y}`;

    const open = [startKey];
    const came = new Map(); // key -> prevKey
    const cameDir = new Map(); // key -> [dx,dy]
    const g = new Map([[startKey, 0]]);
    const f = new Map([[startKey, Math.abs(goal.x - start.x) + Math.abs(goal.y - start.y)]]);

    const seen = new Set();

    function popLowestF() {
        let bestIdx = 0;
        let bestKey = open[0];
        let bestF = f.get(bestKey) ?? Infinity;
        for (let i = 1; i < open.length; i++) {
            const k = open[i];
            const fk = f.get(k) ?? Infinity;
            if (fk < bestF) { bestF = fk; bestKey = k; bestIdx = i; }
        }
        open.splice(bestIdx, 1);
        return bestKey;
    }

    while (open.length > 0) {
        const currentKey = popLowestF();
        if (currentKey === goalKey) {
            // Reconstruct
            const path = [];
            let k = currentKey;
            while (k) {
                const [sx, sy] = k.split(',').map(Number);
                path.push({ x: sx, y: sy });
                k = came.get(k);
            }
            path.reverse();
            return path;
        }
        seen.add(currentKey);

        const [cx, cy] = currentKey.split(',').map(Number);
        const prevDir = cameDir.get(currentKey) || [0, 0];

        for (const [nx, ny, dx, dy] of neighbors4(cx, cy)) {
            if (!inBounds(nx, ny)) continue;
            const nk = `${nx},${ny}`;
            if (seen.has(nk)) continue;

            // movement base cost
            let step = 1;
            // prefer going near walls: add penalty when far from walls
            const farFromWalls = 4 - countAdjacentWalls(nx, ny); // 0..4
            step += hugWalls * (farFromWalls * 0.05);
            // prefer slight curves by penalizing long straight segments
            if (prevDir[0] === dx && prevDir[1] === dy && (dx !== 0 || dy !== 0)) {
                step += straightPenalty;
            }
            // make existing floors cheaper so corridors prefer to reuse floors when present
            step += (map[ny][nx] === 1 ? wallCost : floorCost);

            const tentative = (g.get(currentKey) ?? Infinity) + step;
            if (tentative < (g.get(nk) ?? Infinity)) {
                came.set(nk, currentKey);
                cameDir.set(nk, [dx, dy]);
                g.set(nk, tentative);
                const h = Math.abs(goal.x - nx) + Math.abs(goal.y - ny);
                f.set(nk, tentative + h);
                if (!open.includes(nk)) open.push(nk);
            }
        }
    }
    // Fallback: straight dig if A* fails
    return [start, goal];
}

function digPath(path, width = 1) {
    const half = Math.floor(width / 2);
    for (const p of path) {
        for (let dy = -half; dy <= half; dy++) {
            for (let dx = -half; dx <= half; dx++) {
                const x = p.x + dx, y = p.y + dy;
                if (inBounds(x, y)) map[y][x] = 0;
            }
        }
    }
}

function createCorridor(x1, y1, x2, y2) {
    // Use A* to carve more natural corridors with mild curvature and wall hugging
    const path = aStarPath({ x: x1, y: y1 }, { x: x2, y: y2 }, {
        wallCost: 1.0,
        floorCost: 0.0,
        straightPenalty: 0.12,
        hugWalls: 0.08
    });
    digPath(path, 1);
}

// 接続性を確保する関数 (4方向移動のみ)
ffunction ensureConnectivity() {
    // Build 4-neighbor connected components of floor tiles
    function getComponents() {
        const comps = [];
        const seen = new Set();
        for (let y = 1; y < MAP_HEIGHT - 1; y++) {
            for (let x = 1; x < MAP_WIDTH - 1; x++) {
                if (map[y][x] !== 0) continue;
                const key0 = `${x},${y}`;
                if (seen.has(key0)) continue;
                const q = [{ x, y }];
                const comp = [];
                seen.add(key0);
                while (q.length) {
                    const cur = q.shift();
                    comp.push(cur);
                    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
                    for (const [dx, dy] of dirs) {
                        const nx = cur.x + dx, ny = cur.y + dy;
                        if (!inBounds(nx, ny) || map[ny][nx] !== 0) continue;
                        const k = `${nx},${ny}`;
                        if (seen.has(k)) continue;
                        seen.add(k); q.push({ x: nx, y: ny });
                    }
                }
                comps.push(comp);
            }
        }
        return comps;
    }

    function centroid(comp) {
        let sx = 0, sy = 0;
        for (const p of comp) { sx += p.x; sy += p.y; }
        const n = Math.max(1, comp.length);
        return { x: Math.floor(sx / n), y: Math.floor(sy / n) };
    }

    function boundaryTiles(comp) {
        const out = [];
        for (const p of comp) {
            const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
            for (const [dx, dy] of dirs) {
                const nx = p.x + dx, ny = p.y + dy;
                if (inBounds(nx, ny) && map[ny][nx] === 1) { out.push(p); break; }
            }
        }
        return out.length ? out : comp; // fallback
    }

    let comps = getComponents();
    if (comps.length <= 1) return;
    let guard = 0;
    while (comps.length > 1 && guard++ < 50) {
        // Pick closest pair by centroid distance
        let ai = 0, bi = 1, best = Infinity;
        const cents = comps.map(centroid);
        for (let i = 0; i < comps.length; i++) {
            for (let j = i + 1; j < comps.length; j++) {
                const dx = cents[i].x - cents[j].x;
                const dy = cents[i].y - cents[j].y;
                const d2 = dx*dx + dy*dy;
                if (d2 < best) { best = d2; ai = i; bi = j; }
            }
        }
        const a = comps[ai], b = comps[bi];
        const ca = cents[ai], cb = cents[bi];
        const A = boundaryTiles(a);
        const B = boundaryTiles(b);
        // Pick portal tiles toward the other centroid
        let pa = A[0]; let bestA = Infinity;
        for (const p of A) { const d = Math.abs(p.x - cb.x) + Math.abs(p.y - cb.y); if (d < bestA) { bestA = d; pa = p; } }
        let pb = B[0]; let bestB = Infinity;
        for (const p of B) { const d = Math.abs(p.x - ca.x) + Math.abs(p.y - ca.y); if (d < bestB) { bestB = d; pb = p; } }
        createCorridor(pa.x, pa.y, pb.x, pb.y);
        // Recompute components after carving
        comps = getComponents();
    }
}

// Single room type - one medium-sized rectangular room
function generateSingleRoomType() {
    const sizeFactor = Math.min(MAP_WIDTH, MAP_HEIGHT) / 20;
    const roomW = Math.max(8, Math.floor(8 + sizeFactor * 2));
    const roomH = Math.max(8, Math.floor(8 + sizeFactor * 2));
    const startX = Math.floor((MAP_WIDTH - roomW) / 2);
    const startY = Math.floor((MAP_HEIGHT - roomH) / 2);
    
    // Create room
    for (let y = startY; y < startY + roomH; y++) {
        for (let x = startX; x < startX + roomW; x++) {
            map[y][x] = 0;
        }
    }
}

// Circle type - medium-sized circular room
function generateCircleType() {
    const sizeFactor = Math.min(MAP_WIDTH, MAP_HEIGHT) / 20;
    const radius = Math.max(6, Math.floor(6 + sizeFactor * 1.5));
    const centerX = Math.floor(MAP_WIDTH / 2);
    const centerY = Math.floor(MAP_HEIGHT / 2);
    
    // Create circular room
    for (let y = 1; y < MAP_HEIGHT - 1; y++) {
        for (let x = 1; x < MAP_WIDTH - 1; x++) {
            const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
            if (distance <= radius) {
                map[y][x] = 0;
            }
        }
    }
}

// Narrow maze type - fine detailed maze with narrow passages using recursive backtracking
function generateNarrowMazeType() {
    // Start with all walls
    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            map[y][x] = 1;
        }
    }
    
    // Create maze using recursive backtracking for authentic maze structure
    const visited = new Set();
    const stack = [];
    
    // Start position (odd coordinates for proper maze generation)
    const startX = 1;
    const startY = 1;
    map[startY][startX] = 0;
    visited.add(`${startX},${startY}`);
    stack.push({ x: startX, y: startY });
    
    const directions = [
        { dx: 0, dy: -2 }, // Up
        { dx: 2, dy: 0 },  // Right  
        { dx: 0, dy: 2 },  // Down
        { dx: -2, dy: 0 }  // Left
    ];
    
    while (stack.length > 0) {
        const current = stack[stack.length - 1];
        const neighbors = [];
        
        // Find unvisited neighbors (2 cells away)
        for (const dir of directions) {
            const newX = current.x + dir.dx;
            const newY = current.y + dir.dy;
            
            if (newX > 0 && newX < MAP_WIDTH - 1 && 
                newY > 0 && newY < MAP_HEIGHT - 1 && 
                !visited.has(`${newX},${newY}`)) {
                neighbors.push({ x: newX, y: newY, wallX: current.x + dir.dx / 2, wallY: current.y + dir.dy / 2 });
            }
        }
        
        if (neighbors.length > 0) {
            // Choose random neighbor
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            
            // Carve path to neighbor
            map[next.y][next.x] = 0;
            map[next.wallY][next.wallX] = 0;
            
            visited.add(`${next.x},${next.y}`);
            stack.push({ x: next.x, y: next.y });
        } else {
            // Backtrack
            stack.pop();
        }
    }
    
    // Add some additional random connections for complexity (but maintain narrow feel)
    const sizeFactor = Math.min(MAP_WIDTH, MAP_HEIGHT) / 20;
    const extraConnections = Math.floor(sizeFactor * 2);
    
    for (let i = 0; i < extraConnections; i++) {
        const x = 2 + Math.floor(Math.random() * (MAP_WIDTH - 4));
        const y = 2 + Math.floor(Math.random() * (MAP_HEIGHT - 4));
        
        if (map[y][x] === 1) {
            // Check if this creates a useful connection
            let floorNeighbors = 0;
            const dirs = [[0,1], [1,0], [0,-1], [-1,0]];
            for (const [dx, dy] of dirs) {
                if (map[y + dy][x + dx] === 0) floorNeighbors++;
            }
            
            // Only add if it connects different areas (exactly 2 floor neighbors)
            if (floorNeighbors === 2) {
                map[y][x] = 0;
            }
        }
    }
    
    ensureConnectivity();
}

// Wide maze type - same algorithm as narrow maze but with thickness 3
function generateWideMazeType() {
    // Start with all walls
    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            map[y][x] = 1;
        }
    }
    
    // Create maze using recursive backtracking (same as narrow maze) but with 3x scale
    const visited = new Set();
    const stack = [];
    const scale = 3; // Thickness factor for wide maze
    
    // Start position (scaled coordinates for thick maze generation)
    const startX = scale;
    const startY = scale;
    
    // Create initial thick corridor (3x3 block)
    for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
            if (startX + dx < MAP_WIDTH && startY + dy < MAP_HEIGHT) {
                map[startY + dy][startX + dx] = 0;
            }
        }
    }
    
    visited.add(`${startX},${startY}`);
    stack.push({ x: startX, y: startY });
    
    const directions = [
        { dx: 0, dy: -scale * 2 }, // Up (skip 6 to maintain thick walls)
        { dx: scale * 2, dy: 0 },  // Right  
        { dx: 0, dy: scale * 2 },  // Down
        { dx: -scale * 2, dy: 0 }  // Left
    ];
    
    while (stack.length > 0) {
        const current = stack[stack.length - 1];
        const neighbors = [];
        
        // Find unvisited neighbors (scale*2 cells away)
        for (const dir of directions) {
            const newX = current.x + dir.dx;
            const newY = current.y + dir.dy;
            
            if (newX >= scale && newX < MAP_WIDTH - scale && 
                newY >= scale && newY < MAP_HEIGHT - scale && 
                !visited.has(`${newX},${newY}`)) {
                neighbors.push({ x: newX, y: newY, wallX: current.x + dir.dx / 2, wallY: current.y + dir.dy / 2 });
            }
        }
        
        if (neighbors.length > 0) {
            // Choose random neighbor
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            
            // Create thick corridor at destination (3x3 block)
            for (let dy = 0; dy < scale; dy++) {
                for (let dx = 0; dx < scale; dx++) {
                    if (next.x + dx < MAP_WIDTH && next.y + dy < MAP_HEIGHT) {
                        map[next.y + dy][next.x + dx] = 0;
                    }
                }
            }
            
            // Create thick connecting corridor (3x3 block)
            for (let dy = 0; dy < scale; dy++) {
                for (let dx = 0; dx < scale; dx++) {
                    if (next.wallX + dx < MAP_WIDTH && next.wallY + dy < MAP_HEIGHT) {
                        map[next.wallY + dy][next.wallX + dx] = 0;
                    }
                }
            }
            
            visited.add(`${next.x},${next.y}`);
            stack.push({ x: next.x, y: next.y });
        } else {
            // Backtrack
            stack.pop();
        }
    }
    
    // Add some additional random connections for complexity (but maintain thick style)
    const sizeFactor = Math.min(MAP_WIDTH, MAP_HEIGHT) / 20;
    const extraConnections = Math.floor(sizeFactor * 2);
    
    for (let i = 0; i < extraConnections; i++) {
        const x = scale + Math.floor(Math.random() * (MAP_WIDTH - scale * 2));
        const y = scale + Math.floor(Math.random() * (MAP_HEIGHT - scale * 2));
        
        if (map[y][x] === 1) {
            // Check if this creates a useful connection
            let floorNeighbors = 0;
            const dirs = [[0,scale], [scale,0], [0,-scale], [-scale,0]];
            for (const [dx, dy] of dirs) {
                if (y + dy >= 0 && y + dy < MAP_HEIGHT && x + dx >= 0 && x + dx < MAP_WIDTH) {
                    if (map[y + dy][x + dx] === 0) floorNeighbors++;
                }
            }
            
            // Only add if it connects different areas (exactly 2 thick floor neighbors)
            if (floorNeighbors === 2) {
                // Create thick connection (3x3 block)
                for (let dy = 0; dy < scale; dy++) {
                    for (let dx = 0; dx < scale; dx++) {
                        if (x + dx < MAP_WIDTH && y + dy < MAP_HEIGHT) {
                            map[y + dy][x + dx] = 0;
                        }
                    }
                }
            }
        }
    }
    
    ensureConnectivity();
}

// Snake type - winding passage with no branches (single path, no blocks)
function generateSnakeType() {
    const sizeFactor = Math.min(MAP_WIDTH, MAP_HEIGHT) / 20;
    // Path width should be 1 for single path, optionally 2 for slightly wider corridors
    const pathWidth = Math.min(1, Math.floor(sizeFactor * 0.3)); // Keep it narrow, avoid blocks
    
    // Start from top-left corner (2,2), target bottom-right corner as specified
    let currentX = 2;
    let currentY = 2;
    const targetX = MAP_WIDTH - 3;
    const targetY = MAP_HEIGHT - 3;
    
    let currentDirection = 0; // 0=right, 1=down, 2=left, 3=up
    const directions = [[1,0], [0,1], [-1,0], [0,-1]]; // right, down, left, up
    
    // Create initial single path cell (not a block)
    map[currentY][currentX] = 0;
    const pathCells = new Set();
    pathCells.add(`${currentX},${currentY}`);
    
    // Multiple termination conditions as specified
    const maxIterations = 2000; // Maximum iteration limit
    let iterations = 0;
    let consecutiveDirectionChanges = 0;
    let consecutiveFailures = 0;
    const maxConsecutiveDirectionChanges = 10;
    const maxConsecutiveFailures = 20;
    let lastDirection = currentDirection;
    
    // Continue until we reach near the target or hit termination conditions
    while (iterations < maxIterations && 
           consecutiveDirectionChanges < maxConsecutiveDirectionChanges &&
           consecutiveFailures < maxConsecutiveFailures) {
        
        // Calculate distance to target for termination check
        const distanceToTarget = Math.abs(currentX - targetX) + Math.abs(currentY - targetY);
        
        // If we're close enough to target, we're done
        if (distanceToTarget <= 2) {
            break;
        }
        
        // Step-by-step movement with look-ahead collision detection
        // Determine preferred directions towards target (70% bias as specified)
        let preferredDirections = [];
        if (currentX < targetX) preferredDirections.push(0); // right
        if (currentY < targetY) preferredDirections.push(1); // down
        if (currentX > targetX) preferredDirections.push(2); // left
        if (currentY > targetY) preferredDirections.push(3); // up
        
        // Find valid directions with 2-step look-ahead collision detection
        const validDirections = [];
        for (let dir = 0; dir < 4; dir++) {
            const moveDir = directions[dir];
            const nextX = currentX + moveDir[0];
            const nextY = currentY + moveDir[1];
            const aheadX = currentX + moveDir[0] * 2; // Check 2 steps ahead
            const aheadY = currentY + moveDir[1] * 2;
            
            // Boundary checking
            if (nextX <= 1 || nextX >= MAP_WIDTH - 2 || 
                nextY <= 1 || nextY >= MAP_HEIGHT - 2) {
                continue;
            }
            
            // Check if next position would hit existing path
            if (pathCells.has(`${nextX},${nextY}`)) {
                continue;
            }
            
            // Look-ahead collision detection - check if 2 steps ahead would hit existing path
            if (aheadX > 1 && aheadX < MAP_WIDTH - 2 && 
                aheadY > 1 && aheadY < MAP_HEIGHT - 2) {
                if (pathCells.has(`${aheadX},${aheadY}`)) {
                    continue;
                }
            }
            
            validDirections.push(dir);
        }
        
        // Choose direction with target-oriented movement
        let chosenDirection = currentDirection; // default to current
        let foundValidMove = false;
        
        if (validDirections.length === 0) {
            // No valid moves - increment consecutive failures
            consecutiveFailures++;
        } else {
            foundValidMove = true;
            consecutiveFailures = 0; // Reset failure counter
            
            // Target-oriented movement: 70% bias toward target directions
            const validPreferred = validDirections.filter(dir => preferredDirections.includes(dir));
            
            if (validPreferred.length > 0 && Math.random() < 0.7) {
                // 70% chance to go towards target
                chosenDirection = validPreferred[Math.floor(Math.random() * validPreferred.length)];
            } else {
                // 30% random turns for natural curves
                chosenDirection = validDirections[Math.floor(Math.random() * validDirections.length)];
            }
        }
        
        // Track direction changes for termination condition
        if (chosenDirection !== lastDirection) {
            consecutiveDirectionChanges++;
        } else {
            consecutiveDirectionChanges = 0; // Reset if same direction
        }
        lastDirection = chosenDirection;
        
        if (foundValidMove) {
            currentDirection = chosenDirection;
            
            // Step-by-step movement: move one cell at a time
            const moveDir = directions[currentDirection];
            currentX += moveDir[0];
            currentY += moveDir[1];
            
            // Create single path cell (no blocks)
            map[currentY][currentX] = 0;
            pathCells.add(`${currentX},${currentY}`);
            
            // Optionally create slightly wider path for better navigation (but not blocks)
            if (pathWidth > 0) {
                // Only add adjacent cells if they don't create unwanted intersections
                const adjacentOffsets = [[0,1], [1,0], [0,-1], [-1,0]];
                for (const [dx, dy] of adjacentOffsets) {
                    const adjX = currentX + dx;
                    const adjY = currentY + dy;
                    
                    if (adjX > 1 && adjX < MAP_WIDTH - 2 && 
                        adjY > 1 && adjY < MAP_HEIGHT - 2 && 
                        !pathCells.has(`${adjX},${adjY}`)) {
                        
                        // Only add if it doesn't create unwanted connections
                        let wouldCreateIntersection = false;
                        for (const [ddx, ddy] of adjacentOffsets) {
                            const checkX = adjX + ddx;
                            const checkY = adjY + ddy;
                            if (checkX !== currentX || checkY !== currentY) {
                                if (pathCells.has(`${checkX},${checkY}`)) {
                                    wouldCreateIntersection = true;
                                    break;
                                }
                            }
                        }
                        
                        if (!wouldCreateIntersection) {
                            map[adjY][adjX] = 0;
                            pathCells.add(`${adjX},${adjY}`);
                        }
                    }
                }
            }
        }
        
        iterations++;
    }
    
    ensureConnectivity();
}

// Mixed type - randomly selects generation type per floor
function generateMixedType() {
    // Default mixed pool（混合型限定タイプ含む）
    let types = [
        'field', 'cave', 'maze', 'rooms', 'single-room',
        'circle', 'circle-rooms', 'narrow-maze', 'wide-maze',
        'snake', 'grid', 'open-space'
    ];
    // BlockDim の場合は選択ブロック由来のプールを使用（空ならデフォルト）
    if (currentMode === 'blockdim' && blockDimState?.spec && Array.isArray(blockDimState.spec.typePool) && blockDimState.spec.typePool.length > 0) {
        // ブロックが指示したタイプのみ（アドオンタイプを含んでいてもOK）
        types = blockDimState.spec.typePool.slice();
    } else {
        // プールが空 or Normal のとき、アドオンの混合参加重みを考慮して拡張
        try {
            if (DungeonGenRegistry && DungeonGenRegistry.size > 0) {
                const weighted = [];
                for (const [id, def] of DungeonGenRegistry.entries()) {
                    const w = currentMode === 'blockdim' ? (def?.mixin?.blockDimMixed || 0) : (def?.mixin?.normalMixed || 0);
                    if (w > 0) {
                        const n = Math.max(1, Math.floor(w * 10));
                        for (let i = 0; i < n; i++) weighted.push(id);
                    }
                }
                if (weighted.length) types = types.concat(weighted);
            }
        } catch {}
    }
    const selectedType = types[Math.floor(Math.random() * Math.max(1, types.length))];
    lastGeneratedGenType = selectedType;
    
    // アドオンタイプなら専用アルゴリズムを実行
    if (DungeonGenRegistry && DungeonGenRegistry.has(selectedType)) {
        try { runAddonGenerator(selectedType); } catch (e) { console.warn('addon generator(mixed) failed', selectedType, e); generateFieldType(); }
        return;
    }

    switch (selectedType) {
        case 'field':
            generateFieldType();
            break;
        case 'cave':
            generateCaveType();
            break;
        case 'maze':
            generateMazeType();
            break;
        case 'rooms':
            generateRoomsType();
            break;
        case 'narrow-maze':
            generateNarrowMazeType();
            break;
        case 'wide-maze':
            generateWideMazeType();
            break;
        case 'single-room':
            generateSingleRoomType();
            break;
        case 'circle':
            generateCircleType();
            break;
        case 'circle-rooms':
            generateCircleRoomsType();
            break;
        case 'snake':
            generateSnakeType();
            break;
        case 'grid':
            generateGridType();
            break;
        case 'open-space':
            generateOpenSpaceType();
            break;
        default:
            // フォールバック（未知タイプ）
            generateFieldType();
    }
}

// Circle rooms type - multiple circular rooms connected by corridors
function generateCircleRoomsType() {
    const rooms = [];
    const sizeFactor = Math.min(MAP_WIDTH, MAP_HEIGHT) / 20;
    const baseRooms = Math.max(3, Math.floor(3 + sizeFactor * 1.5));
    const numRooms = baseRooms + Math.floor(Math.random() * Math.max(2, Math.floor(sizeFactor)));
    
    const minRadius = Math.max(2, Math.floor(2 + sizeFactor * 0.3));
    const maxRadius = Math.max(4, Math.floor(4 + sizeFactor * 0.5));
    
    // Generate circular rooms
    for (let i = 0; i < numRooms; i++) {
        const radius = minRadius + Math.floor(Math.random() * (maxRadius - minRadius + 1));
        let centerX, centerY;
        let attempts = 0;
        
        // Try to place room without overlap
        do {
            centerX = radius + 2 + Math.floor(Math.random() * (MAP_WIDTH - 2 * radius - 4));
            centerY = radius + 2 + Math.floor(Math.random() * (MAP_HEIGHT - 2 * radius - 4));
            attempts++;
        } while (attempts < 100 && rooms.some(r => {
            const distance = Math.sqrt((centerX - r.x) ** 2 + (centerY - r.y) ** 2);
            return distance < r.radius + radius + 3;
        }));
        
        if (attempts < 100) {
            // Create circular room
            for (let y = 1; y < MAP_HEIGHT - 1; y++) {
                for (let x = 1; x < MAP_WIDTH - 1; x++) {
                    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                    if (distance <= radius) {
                        map[y][x] = 0;
                    }
                }
            }
            rooms.push({ x: centerX, y: centerY, radius: radius });
        }
    }
    
    // Connect all rooms with corridors
    for (let i = 0; i < rooms.length - 1; i++) {
        const room1 = rooms[i];
        const room2 = rooms[i + 1];
        createCorridor(room1.x, room1.y, room2.x, room2.y);
    }
    
    // Connect first and last room for better connectivity
    if (rooms.length > 2) {
        const first = rooms[0];
        const last = rooms[rooms.length - 1];
        createCorridor(first.x, first.y, last.x, last.y);
    }
    
    // Add some additional connections for larger maps
    if (sizeFactor > 1.5 && rooms.length > 3) {
        const additionalConnections = Math.floor(rooms.length / 3);
        for (let i = 0; i < additionalConnections; i++) {
            const room1 = rooms[Math.floor(Math.random() * rooms.length)];
            const room2 = rooms[Math.floor(Math.random() * rooms.length)];
            if (room1 !== room2) {
                createCorridor(room1.x, room1.y, room2.x, room2.y);
            }
        }
    }
    
    ensureConnectivity();
}

function generateEntities() {
    enemies = [];
    items = [];
    chests = [];

    // Get current dungeon type (prefer last generated actual type in mixed)
    let genType = resolveCurrentGeneratorType() || 'field';
    // Override with actual type used by generateMap if available
    if (lastGeneratedGenType) genType = lastGeneratedGenType;

    // プレイヤーの初期位置
    if (genType === 'snake') {
        // Snake type: place player at top-left corner on floor
        for (let y = 1; y < MAP_HEIGHT - 1; y++) {
            for (let x = 1; x < MAP_WIDTH - 1; x++) {
                if (map[y][x] === 0) { // Find first floor tile from top-left
                    player.x = x;
                    player.y = y;
                    break;
                }
            }
            if (map[player.y][player.x] === 0) break; // Found a floor tile
        }
    } else if (genType === 'rooms' || genType === 'circle-rooms') {
        // Room types: ensure player spawns in accessible floor area
        // Use randomFloorPosition to guarantee accessible placement
        const pos = randomFloorPosition();
        player.x = pos.x;
        player.y = pos.y;
    } else {
        // Other types: normal placement
        if (dungeonLevel === 1) {
            // For first level, try center but ensure it's accessible
            const centerX = Math.floor(MAP_WIDTH / 2);
            const centerY = Math.floor(MAP_HEIGHT / 2);
            if (map[centerY] && map[centerY][centerX] === 0) {
                player.x = centerX;
                player.y = centerY;
            } else {
                // Center is not accessible, find nearest floor tile
                const pos = randomFloorPosition();
                player.x = pos.x;
                player.y = pos.y;
            }
        } else {
            const pos = randomFloorPosition();
            player.x = pos.x;
            player.y = pos.y;
        }
    }

    // 敵を配置（サイズベース生成：幅+高さ8で割った数） Poisson分散で最小距離を確保
    const enemyCount = Math.max(1, Math.floor((MAP_WIDTH + MAP_HEIGHT) / 8));
    const enemyMinDist = Math.max(3, Math.floor(Math.min(MAP_WIDTH, MAP_HEIGHT) * 0.08));
    const enemyPositions = pickSpreadFloorPositions(enemyCount, enemyMinDist, [{ x: player.x, y: player.y }]);
    for (const pos of enemyPositions) {
        const baseRec = recommendedLevelForSelection(selectedWorld, selectedDungeonBase, dungeonLevel);
        const lvl = Math.max(1, baseRec + (Math.floor(Math.random() * 9) - 4));
        const maxHp = 50 + 5 * (lvl - 1);
        enemies.push({ x: pos.x, y: pos.y, level: lvl, maxHp: maxHp, hp: maxHp, attack: 8 + (lvl - 1), defense: 8 + (lvl - 1) });
    }

    // アイテムを配置 (緑の丸は削除、宝箱のみでアイテム入手)
    // items = []; // No standalone items, only treasure chests

    // 宝箱（推奨+5以上なら設置しない、サイズベース生成）
    const rec = recommendedLevelForSelection(selectedWorld, selectedDungeonBase, dungeonLevel);
    const allowChests = player.level < rec + 5;
    const chestBase = Math.floor((MAP_WIDTH + MAP_HEIGHT) / 15);
    let chestMul = 1.0;
    if (currentMode === 'blockdim' && blockDimState?.spec) {
        chestMul = blockDimState.spec.chestBias === 'less' ? 0.7 : blockDimState.spec.chestBias === 'more' ? 1.3 : 1.0;
    }
    const chestCount = allowChests ? Math.max(0, Math.round(chestBase * chestMul)) : 0;
    const chestMinDist = Math.max(3, Math.floor(Math.min(MAP_WIDTH, MAP_HEIGHT) * 0.06));
    const chestPositions = pickSpreadFloorPositions(
        chestCount,
        chestMinDist,
        [{ x: player.x, y: player.y }, ...enemies]
    );
    for (const cpos of chestPositions) chests.push({ x: cpos.x, y: cpos.y, type: 'chest' });

    // 階段を配置
    if (genType === 'snake') {
        // Snake type: place stairs at bottom-right corner on floor
        let stairsPlaced = false;
        for (let y = MAP_HEIGHT - 2; y >= 1; y--) {
            for (let x = MAP_WIDTH - 2; x >= 1; x--) {
                if (map[y][x] === 0) { // Find first floor tile from bottom-right
                    stairs = { x: x, y: y };
                    stairsPlaced = true;
                    break;
                }
            }
            if (stairsPlaced) break;
        }
        // Fallback to random position if no floor found at bottom-right
        if (!stairsPlaced) {
            const stairPos = randomFloorPosition([{ x: player.x, y: player.y }, ...enemies, ...items, ...chests]);
            stairs = { x: stairPos.x, y: stairPos.y };
        }
    } else {
        // Other types: place stairs with safety distance from player/enemies
        const minStairsDist = 3;
        const maxTry = 500;
        let found = null;
        for (let t = 0; t < maxTry; t++) {
            const p = randomFloorPosition([{ x: player.x, y: player.y }, ...chests]);
            let ok = true;
            const dxp = Math.abs(p.x - player.x), dyp = Math.abs(p.y - player.y);
            if (dxp + dyp < minStairsDist) ok = false;
            if (ok) {
                for (const e of enemies) { if (Math.abs(e.x - p.x) + Math.abs(e.y - p.y) < minStairsDist) { ok = false; break; } }
            }
            if (ok) { found = p; break; }
        }
        if (!found) found = randomFloorPosition([{ x: player.x, y: player.y }, ...enemies, ...items, ...chests]);
        stairs = { x: found.x, y: found.y };
    }
}

function generateLevel() {
    updateMapSize(); // Update map size based on current floor
    prepareFixedMapDimensionsIfNeeded();
    // Reseed RNG for deterministic generation in BlockDim
    if (currentMode === 'blockdim') {
        reseedBlockDimForFloor();
    } else {
        restoreRandom();
    }
    generateMap();
    generateEntities();
    updateCamera();
    bossAlive = false;
    
    // Boss room generation based on mode/spec
    const maxFloor = getMaxFloor();
    if (isBossFloor(dungeonLevel)) {
        generateBossRoom();
    }
    
    updateUI(); // Update UI after level generation
}

function generateBossRoom() {
    const roomW = 10; // Fixed 10×10 size
    const roomH = 10;
    const startX = Math.floor((MAP_WIDTH - roomW) / 2);
    const startY = Math.floor((MAP_HEIGHT - roomH) / 2);

    resetTileMetadata();

    // Clear entire map to walls
    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            map[y][x] = 1;
        }
    }
    
    // Create 10×10 room
    for (let y = startY; y < startY + roomH; y++) {
        for (let x = startX; x < startX + roomW; x++) {
            map[y][x] = 0;
        }
    }
    
    // プレイヤー位置（部屋の左下）
    player.x = startX + 1;
    player.y = startY + roomH - 2;
    updateCamera();
    
    // ボス位置（部屋の中央）
    const bossX = startX + Math.floor(roomW / 2);
    const bossY = startY + Math.floor(roomH / 2);
    
    const rec = recommendedLevelForSelection(selectedWorld, selectedDungeonBase, dungeonLevel);
    const bossLevel = rec + 5;
    const bossMaxHp = 1000 + 50 * (bossLevel - 1);
    
    enemies = [{
        x: bossX,
        y: bossY,
        level: bossLevel,
        maxHp: bossMaxHp,
        hp: bossMaxHp,
        attack: 8 + (bossLevel - 1),
        defense: 8 + (bossLevel - 1),
        boss: true,
    }];
    bossAlive = true;
    
    // 階段位置（部屋の右上）
    stairs = { x: startX + roomW - 2, y: startY + 1 };
    
    // 宝箱配置（ボスの上下左右、プレイヤーレベルがボス+5以上なら生成しない）
    chests = [];
    if (player.level < bossLevel + 5) {
        const chestPositions = [
            { x: bossX, y: bossY - 1 }, // 上
            { x: bossX, y: bossY + 1 }, // 下
            { x: bossX - 1, y: bossY }, // 左
            { x: bossX + 1, y: bossY }  // 右
        ];
        
        chestPositions.forEach(pos => {
            chests.push({ x: pos.x, y: pos.y, type: 'chest' });
        });
    }
    
    items = [];
}

function getDungeonTypeName(type) {
    const typeNames = {
        'field': 'フィールド型',
        'cave': '洞窟型',
        'maze': '迷路型',
        'rooms': '部屋＆通路型',
        'single-room': '単部屋型',
        'circle': '円型',
        'narrow-maze': '狭い迷路型',
        'wide-maze': '幅広迷路型',
        'snake': 'スネーク型',
        'mixed': '混合型',
        'circle-rooms': '円型部屋＆通路型',
        'grid': '格子型',
        'open-space': '空間型'
    };
    // アドオンタイプ（DungeonGenRegistry）優先で名前を解決
    try {
        if (typeof DungeonGenRegistry !== 'undefined' && DungeonGenRegistry && typeof DungeonGenRegistry.get === 'function') {
            const def = DungeonGenRegistry.get(type);
            if (def && (def.name || def.id)) return def.name || def.id;
        }
    } catch {}
    return typeNames[type] || type || '不明';
}

function showDungeonDetail(dungeonBase) {
    let dungeonData;
    
    // X世界の場合は特別なデータを使用
    if (selectedWorld === 'X') {
        dungeonData = dungeonInfo['X'];
    } else {
        dungeonData = dungeonInfo[dungeonBase];
    }
    
    if (!dungeonData) {
        dungeonDetailCard.style.display = 'none';
        return;
    }
    
    const recommendedLevel = recommendedLevelForSelection(selectedWorld, dungeonBase, 1);
    const difficultyData = {
        'Very Easy': { deal: 4.0, take: 0.25 },
        'Easy': { deal: 2.0, take: 0.35 },
        'Normal': { deal: 1.6, take: 0.5 },
        'Second': { deal: 1.4, take: 0.7 },
        'Hard': { deal: 1.2, take: 0.85 },
        'Very Hard': { deal: 1.0, take: 1.0 },
    };
    const multiplier = difficultyData[difficulty] || difficultyData['Normal'];
    
    dungeonNameEl.textContent = dungeonData.name;
    dungeonTypeEl.textContent = getDungeonTypeName(dungeonData.type);
    dungeonRecommendedLevelEl.textContent = recommendedLevel;
    dungeonDamageMultiplierEl.textContent = `与: ${multiplier.deal}x / 被: ${multiplier.take}x`;
    dungeonDescriptionEl.textContent = dungeonData.description;
    
    dungeonDetailCard.style.display = 'block';
}

function calculateDamageRange(attacker, defender) {
    const base = Math.max(1, attacker.attack - Math.floor(defender.defense / 2));
    const levelDiff = attacker.level - defender.level;
    let mult = damageMultiplierByLevelDiff(levelDiff);
    // Guard against NaN due to overflow in alternative implementations
    if (!Number.isFinite(mult)) mult = (levelDiff > 0 ? Infinity : 0);
    
    // Calculate min and max damage (70% to 120% variation)
    const minRand = 0.7;
    const maxRand = 1.2;
    
    // Normal damage range
    const minDamage = Math.ceil(base * mult * minRand);
    const maxDamage = Math.ceil(base * mult * maxRand);
    
    // Critical damage range (1.5x multiplier)
    const minCrit = Math.ceil(base * mult * minRand * 1.5);
    const maxCrit = Math.ceil(base * mult * maxRand * 1.5);
    
    return { minDamage, maxDamage, minCrit, maxCrit };
}

function calculateHitRate(attackerLevel, defenderLevel) {
    const diff = attackerLevel - defenderLevel;
    const abs = Math.abs(diff);
    
    if (abs <= 2) return 80;
    if (abs >= 7 && diff < 0) return 0;
    if (abs >= 3 && diff > 0) return 100;
    if (abs >= 5 && diff < 0) return 50;
    return 80;
}

function showEnemyInfo(enemy) {
    if (!enemy) return;
    
    // 基本ステータス表示
    enemyModalTitle.textContent = enemy.boss ? 'ボスの情報' : '敵の情報';
    enemyModalLevel.textContent = `Lv.${enemy.level}`;
    enemyModalHp.textContent = `${enemy.hp}/${enemy.maxHp}`;
    enemyModalAttack.textContent = enemy.attack;
    enemyModalDefense.textContent = enemy.defense;
    
    // ダメージシミュレーション
    // プレイヤーから敵へのダメージ
    const playerToEnemy = calculateDamageRange(
        { level: player.level, attack: player.attack },
        { level: enemy.level, defense: enemy.defense }
    );
    
    // 敵からプレイヤーへのダメージ
    const enemyToPlayer = calculateDamageRange(
        { level: enemy.level, attack: enemy.attack },
        { level: player.level, defense: player.defense }
    );
    
    // 難易度補正を適用
    const dealMin = Math.ceil(applyDifficultyDamageMultipliers('deal', playerToEnemy.minDamage));
    const dealMax = Math.ceil(applyDifficultyDamageMultipliers('deal', playerToEnemy.maxDamage));
    const dealCritMin = Math.ceil(applyDifficultyDamageMultipliers('deal', playerToEnemy.minCrit));
    const dealCritMax = Math.ceil(applyDifficultyDamageMultipliers('deal', playerToEnemy.maxCrit));
    
    const takeMin = Math.ceil(applyDifficultyDamageMultipliers('take', enemyToPlayer.minDamage));
    const takeMax = Math.ceil(applyDifficultyDamageMultipliers('take', enemyToPlayer.maxDamage));
    const takeCritMin = Math.ceil(applyDifficultyDamageMultipliers('take', enemyToPlayer.minCrit));
    const takeCritMax = Math.ceil(applyDifficultyDamageMultipliers('take', enemyToPlayer.maxCrit));
    
    // 表示用テキスト作成
    damageDealRange.textContent = `${dealMin}-${dealMax} (クリ: ${dealCritMin}-${dealCritMax})`;
    damageTakeRange.textContent = `${takeMin}-${takeMax} (クリ: ${takeCritMin}-${takeCritMax})`;
    
    // 命中率表示
    const playerHitRate = calculateHitRate(player.level, enemy.level);
    const enemyHitRateValue = calculateHitRate(enemy.level, player.level);
    
    hitRate.textContent = `${playerHitRate}%`;
    enemyHitRate.textContent = `${enemyHitRateValue}%`;
    
    // モーダル表示
    openModal(enemyInfoModal);
}

function recommendedLevelForSelection(world, baseLevel, floorIndex) {
    // BlockDim 優先
    if (currentMode === 'blockdim' && blockDimState?.spec) {
        return Math.max(1, blockDimState.spec.level || 1);
    }
    if (world === 'X') {
        // X世界の場合は推奨レベルは 1000 + 階層
        return 1000 + (floorIndex || 1);
    }
    const worldOffset = { A: 0, B: 100, C: 200, D: 300, E: 400, F: 500, G: 600, H: 700, I: 800, J: 900 }[world] || 0;
    return baseLevel + worldOffset;
}

// レベル差によるダメージ倍率計算
function damageMultiplierByLevelDiff(levelDiff) {
    const abs = Math.abs(levelDiff);
    if (abs === 0) return 1.0;
    if (abs <= 4) return levelDiff > 0 ? 1.0 + (abs * 0.25) : 1.0 - (abs * 0.125);
    if (abs === 5) return levelDiff > 0 ? 2.0 : 0.5;
    if (abs <= 9) return levelDiff > 0 ? 2.0 * Math.pow(1.6, abs - 5) : 0.5 * Math.pow(0.625, abs - 5);
    if (abs === 10) return levelDiff > 0 ? 10.0 : 0.1;
    if (abs <= 19) return levelDiff > 0 ? 10.0 * Math.pow(1.26, abs - 10) : 0.1 * Math.pow(0.794, abs - 10);
    if (abs === 20) return levelDiff > 0 ? 100.0 : 0.01;
    // 以降は10レベル差ごとに10倍/0.1倍
    const groups = Math.floor((abs - 20) / 10);
    return levelDiff > 0 ? 100.0 * Math.pow(10, groups) : 0.01 * Math.pow(0.1, groups);
}

function applyDifficultyDamageMultipliers(type, value) {
    // type: 'deal' or 'take'
    const map = {
        'Very Easy': { deal: 4.0, take: 0.25 },
        'Easy': { deal: 2.0, take: 0.35 },
        'Normal': { deal: 1.6, take: 0.5 },
        'Second': { deal: 1.4, take: 0.7 },
        'Hard': { deal: 1.2, take: 0.85 },
        'Very Hard': { deal: 1.0, take: 1.0 },
    };
    const m = map[difficulty] || map['Normal'];
    return value * (type === 'deal' ? m.deal : m.take);
}

function drawMap() {
    const startX = camera.x;
    const startY = camera.y;
    const endX = startX + VIEWPORT_WIDTH;
    const endY = startY + VIEWPORT_HEIGHT;

    const cellW = canvas.width / VIEWPORT_WIDTH;
    const cellH = canvas.height / VIEWPORT_HEIGHT;

    for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
            const screenX = (x - startX) * cellW;
            const screenY = (y - startY) * cellH;
            if (y < 0 || y >= MAP_HEIGHT || x < 0 || x >= MAP_WIDTH) {
                ctx.fillStyle = DEFAULT_WALL_COLOR;
            } else {
                const isWall = map[y][x] === 1;
                ctx.fillStyle = getTileRenderColor(x, y, isWall);
            }
            ctx.fillRect(screenX, screenY, cellW, cellH);
        }
    }

    // 階段
    if (stairs) {
        const sx = stairs.x - startX;
        const sy = stairs.y - startY;
        if (sx >= 0 && sy >= 0 && sx < VIEWPORT_WIDTH && sy < VIEWPORT_HEIGHT) {
            const cellW = canvas.width / VIEWPORT_WIDTH;
            const cellH = canvas.height / VIEWPORT_HEIGHT;
            const screenX = sx * cellW;
            const screenY = sy * cellH;
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(screenX + 4, screenY + 4, cellW - 8, cellH - 8);
        }
    }
}

function drawPlayer() {
    const startX = camera.x;
    const startY = camera.y;
    const px = player.x - startX;
    const py = player.y - startY;
    if (px < 0 || py < 0 || px >= VIEWPORT_WIDTH || py >= VIEWPORT_HEIGHT) return;

    const cellW1 = canvas.width / VIEWPORT_WIDTH;
    const cellH1 = canvas.height / VIEWPORT_HEIGHT;
    const cx = px * cellW1 + cellW1 / 2;
    const cy = py * cellH1 + cellH1 / 2;
    ctx.fillStyle = '#0984e3';
    ctx.beginPath();
    // 向きに応じて三角形
    const size = Math.min(cellW1, cellH1) * 0.45;
    if (player.facing === 'up') {
        ctx.moveTo(cx, cy - size);
        ctx.lineTo(cx - size * 0.7, cy + size * 0.7);
        ctx.lineTo(cx + size * 0.7, cy + size * 0.7);
    } else if (player.facing === 'down') {
        ctx.moveTo(cx, cy + size);
        ctx.lineTo(cx - size * 0.7, cy - size * 0.7);
        ctx.lineTo(cx + size * 0.7, cy - size * 0.7);
    } else if (player.facing === 'left') {
        ctx.moveTo(cx - size, cy);
        ctx.lineTo(cx + size * 0.7, cy - size * 0.7);
        ctx.lineTo(cx + size * 0.7, cy + size * 0.7);
    } else {
        ctx.moveTo(cx + size, cy);
        ctx.lineTo(cx - size * 0.7, cy - size * 0.7);
        ctx.lineTo(cx - size * 0.7, cy + size * 0.7);
    }
    ctx.closePath();
    ctx.fill();
}

// Helper function to draw text with background
function drawTextWithBackground(ctx, text, x, y, textColor) {
    // Measure text
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = parseInt(ctx.font.match(/\d+/)[0]);
    
    // Background padding
    const padding = 4;
    const bgWidth = textWidth + padding * 2;
    const bgHeight = textHeight + padding;
    
    // Draw background (semi-transparent black with white border)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x - bgWidth/2, y - textHeight + padding/2, bgWidth, bgHeight);
    
    // Draw white border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - bgWidth/2, y - textHeight + padding/2, bgWidth, bgHeight);
    
    // Draw text
    ctx.fillStyle = textColor;
    ctx.fillText(text, x, y);
}

function drawEnemies() {
    const startX = camera.x;
    const startY = camera.y;
    enemies.forEach(enemy => {
        const ex = enemy.x - startX;
        const ey = enemy.y - startY;
        if (ex < 0 || ey < 0 || ex >= VIEWPORT_WIDTH || ey >= VIEWPORT_HEIGHT) return;
        const cellWe = canvas.width / VIEWPORT_WIDTH;
        const cellHe = canvas.height / VIEWPORT_HEIGHT;
        const cx = ex * cellWe + cellWe / 2;
        const cy = ey * cellHe + cellHe / 2;
        
        // Boss has special appearance
        if (enemy.boss) {
            ctx.fillStyle = '#8b0000'; // Dark red for boss
            ctx.beginPath();
            ctx.arc(cx, cy, TILE_SIZE * 0.5, 0, Math.PI * 2); // Larger size
            ctx.fill();
            // Boss crown/aura effect
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx, cy, TILE_SIZE * 0.6, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            const enemyRadius = Math.min(cellWe, cellHe) * 0.45; // 0.9 times cell size (0.45 is radius)
            ctx.arc(cx, cy, enemyRadius, 0, Math.PI * 2);
            ctx.fill();
        }

        // 小型HPバーとテキスト
        const barWidth = cellWe * 0.9;
        const barHeight = Math.max(3, cellHe * 0.12);
        const barX = ex * cellWe + (cellWe - barWidth) / 2;
        const barY = ey * cellHe + cellHe - barHeight - 2;
        const hpPct = Math.max(0, Math.min(1, (enemy.hp || 0) / (enemy.maxHp || 1)));
        // 減少部: 赤
        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        // 残りHP: 黄緑 (boss は金色)
        ctx.fillStyle = enemy.boss ? '#ffd700' : '#a3e635';
        ctx.fillRect(barX, barY, barWidth * hpPct, barHeight);
        // レベル/HPテキスト with background
        ctx.font = `${Math.max(10, Math.floor(cellHe * 0.35))}px sans-serif`;
        ctx.textAlign = 'center';
        
        const levelText = enemy.boss ? `BOSS Lv.${enemy.level ?? '?'}` : `Lv.${enemy.level ?? '?'}`;
        const hpText = `HP ${enemy.hp ?? '?'} / ${enemy.maxHp ?? '?'}`;
        
        // Draw level text with background
        const levelY = ey * cellHe + Math.max(10, Math.floor(cellHe * 0.3));
        drawTextWithBackground(ctx, levelText, cx, levelY, enemy.boss ? '#ffd700' : (enemy.level >= player.level + 5 ? '#ffa94d' : (enemy.level <= player.level - 5 ? '#74c0fc' : '#ffffff')));
        
        // Draw HP text with background  
        const hpY = ey * cellHe + Math.max(20, Math.floor(cellHe * 0.6));
        drawTextWithBackground(ctx, hpText, cx, hpY, enemy.boss ? '#ffd700' : '#ffffff');
    });
}

function drawItems() {
    const startX = camera.x;
    const startY = camera.y;
    items.forEach(item => {
        const ix = item.x - startX;
        const iy = item.y - startY;
        if (ix < 0 || iy < 0 || ix >= VIEWPORT_WIDTH || iy >= VIEWPORT_HEIGHT) return;
        const cellWi = canvas.width / VIEWPORT_WIDTH;
        const cellHi = canvas.height / VIEWPORT_HEIGHT;
        const cx = ix * cellWi + cellWi / 2;
        const cy = iy * cellHi + cellHi / 2;
        ctx.fillStyle = '#2ecc71';
        ctx.beginPath();
        ctx.arc(cx, cy, Math.min(cellWi, cellHi) * 0.25, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawChests() {
    const startX = camera.x;
    const startY = camera.y;
    chests.forEach(ch => {
        const ix = ch.x - startX;
        const iy = ch.y - startY;
        if (ix < 0 || iy < 0 || ix >= VIEWPORT_WIDTH || iy >= VIEWPORT_HEIGHT) return;
        const cellWc = canvas.width / VIEWPORT_WIDTH;
        const cellHc = canvas.height / VIEWPORT_HEIGHT;
        const sx = ix * cellWc + cellWc / 2;
        const sy = iy * cellHc + cellHc / 2;
        ctx.fillStyle = '#d4a373';
        const w = Math.min(cellWc, cellHc) * 0.6;
        const h = Math.min(cellWc, cellHc) * 0.4;
        ctx.fillRect(sx - w/2, sy - h/2, w, h);
        ctx.fillStyle = '#8d5524';
        ctx.fillRect(sx - w/2, sy - h/2 - h*0.125, w, h*0.25);
    });
}

// Value change indicators
function showValueChange(elementId, newValue, prevValue, isPositive = null) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const change = newValue - prevValue;
    if (change === 0) return;
    
    // Add to current popup group
    const popupData = {
        element: element,
        change: change,
        isPositive: isPositive !== null ? isPositive : change > 0,
        type: 'stat'
    };
    
    addToPopupGroup(popupData);
}

// New function to add level up popup to group
function showLevelUpPopup() {
    const levelElement = document.getElementById('stat-level');
    if (!levelElement) return;
    
    const popupData = {
        element: levelElement,
        change: 0,
        isPositive: true,
        type: 'levelup'
    };
    
    addToPopupGroup(popupData);
    
    // Also add level up popup above the player on the canvas
    addPopup(player.x, player.y, 'LEVEL UP!', '#ffd700', 2.0);
}

function addToPopupGroup(popupData) {
    activePopupGroup.push(popupData);
    
    // Clear existing timer
    if (popupGroupTimer) {
        clearTimeout(popupGroupTimer);
    }
    
    // Set new timer to process group after short delay (to collect simultaneous popups)
    popupGroupTimer = setTimeout(() => {
        processPopupGroup();
        activePopupGroup = [];
        popupGroupTimer = null;
    }, 50); // Slightly longer delay to ensure all simultaneous changes are captured
}

function processPopupGroup() {
    if (activePopupGroup.length === 0) return;
    
    // Add CSS animation if not already present
    if (!document.getElementById('popup-animation-styles')) {
        const style = document.createElement('style');
        style.id = 'popup-animation-styles';
        style.textContent = `
            @keyframes popupFloat {
                0% {
                    opacity: 1;
                    transform: translateY(0) scale(1.1);
                }
                20% {
                    transform: translateY(-5px) scale(1);
                }
                100% {
                    opacity: 0;
                    transform: translateY(-45px) scale(0.9);
                }
            }
            .popup-group {
                position: fixed;
                z-index: 10000;
                pointer-events: none;
            }
            .popup-item {
                font-size: 14px;
                font-weight: bold;
                text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
                margin-bottom: 6px;
                animation: popupFloat 2.8s ease-out forwards;
                background: rgba(255, 255, 255, 0.95);
                padding: 4px 8px;
                border-radius: 6px;
                border: 1px solid;
                display: block;
                text-align: center;
                min-width: 60px;
                white-space: nowrap;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Group popups by their target element to prevent overlapping at the same position
    const groupsByElement = new Map();
    
    activePopupGroup.forEach(popupData => {
        const elementId = popupData.element ? popupData.element.id : 'default';
        if (!groupsByElement.has(elementId)) {
            groupsByElement.set(elementId, []);
        }
        groupsByElement.get(elementId).push(popupData);
    });
    
    // Process each element group separately
    groupsByElement.forEach((popups, elementId) => {
        const referenceElement = popups[0].element;
        if (!referenceElement) return;
        
        // Create group container for this element
        const groupContainer = document.createElement('div');
        groupContainer.className = 'popup-group';
        
        // Position next to the specific element
        const rect = referenceElement.getBoundingClientRect();
        groupContainer.style.left = (rect.right + 10) + 'px';
        groupContainer.style.top = (rect.top + rect.height / 2 - 15) + 'px'; // Center vertically on the element
        
        // Sort popups by priority within this element group
        const priorityOrder = { 'levelup': 0, 'damage_taken': 1, 'healing': 2, 'exp': 3, 'stat': 4 };
        popups.sort((a, b) => {
            const priorityA = priorityOrder[a.type] || 5;
            const priorityB = priorityOrder[b.type] || 5;
            return priorityA - priorityB;
        });
        
        // Create popup elements for this group
        popups.forEach((popupData, index) => {
            const popup = document.createElement('div');
            popup.className = 'popup-item';
            
            // Format text based on type
            let text = '';
            let color = '';
            let borderColor = '';
            
            switch (popupData.type) {
                case 'levelup':
                    text = 'LEVEL UP!';
                    color = '#1a365d';
                    borderColor = '#ffd700';
                    popup.style.background = 'linear-gradient(135deg, #ffd700, #ffed4a)';
                    popup.style.fontSize = '16px';
                    popup.style.fontWeight = '900';
                    break;
                case 'damage_taken':
                    text = '-' + popupData.change;
                    color = '#ffffff';
                    borderColor = '#e53e3e';
                    popup.style.background = 'linear-gradient(135deg, #e53e3e, #fc8181)';
                    break;
                case 'healing':
                    text = '+' + popupData.change;
                    color = '#ffffff';
                    borderColor = '#38a169';
                    popup.style.background = 'linear-gradient(135deg, #38a169, #68d391)';
                    break;
                case 'exp':
                    text = '+' + popupData.change;
                    color = '#ffffff';
                    borderColor = '#3182ce';
                    popup.style.background = 'linear-gradient(135deg, #3182ce, #63b3ed)';
                    break;
                case 'stat':
                default:
                    text = (popupData.change > 0 ? '+' : '') + popupData.change;
                    if (popupData.isPositive) {
                        color = '#ffffff';
                        borderColor = '#3182ce';
                        popup.style.background = 'linear-gradient(135deg, #3182ce, #63b3ed)';
                    } else {
                        color = '#ffffff';
                        borderColor = '#e53e3e';
                        popup.style.background = 'linear-gradient(135deg, #e53e3e, #fc8181)';
                    }
                    break;
            }
            
            popup.textContent = text;
            popup.style.color = color;
            popup.style.borderColor = borderColor;
            popup.style.animationDelay = (index * 0.15) + 's'; // Stagger animations within group
            
            groupContainer.appendChild(popup);
        });
        
        document.body.appendChild(groupContainer);
        
        // Remove after animation
        setTimeout(() => {
            if (groupContainer.parentNode) {
                groupContainer.parentNode.removeChild(groupContainer);
            }
        }, 3500);
    });
}

// Add CSS animation for value change popups
if (!document.getElementById('valueChangeCSS')) {
    const style = document.createElement('style');
    style.id = 'valueChangeCSS';
    style.textContent = `
        @keyframes valueChangeFloat {
            0% {
                opacity: 1;
                transform: translateY(0px) scale(1.2);
            }
            50% {
                opacity: 1;
                transform: translateY(-20px) scale(1);
            }
            100% {
                opacity: 0;
                transform: translateY(-40px) scale(0.8);
            }
        }
    `;
    document.head.appendChild(style);
}

function updateUI() {
    const level = player.level || 1;
    const exp = player.exp || 0;
    const expDisp = Math.floor(exp);
    const expMax = 1000;
    const currentHp = player.hp || 0;
    const hpPct = Math.max(0, Math.min(1, currentHp / (player.maxHp || 1)));
    const expPct = Math.max(0, Math.min(1, exp / expMax));
    
    // Show value change indicators
    if (currentHp !== prevHp) {
        const hpChange = currentHp - prevHp;
        const changeType = hpChange > 0 ? 'healing' : 'damage_taken';
        const hpBarElement = document.querySelector('.bar.hp') || document.getElementById('stat-hp-text');
        const popupData = {
            element: hpBarElement,
            change: Math.abs(hpChange),
            isPositive: hpChange > 0,
            type: changeType
        };
        addToPopupGroup(popupData);
        prevHp = currentHp;
    }
    if (exp !== prevExp) {
        const expChange = exp - prevExp;
        if (expChange > 0) {
            const expBarElement = document.querySelector('.bar.exp') || document.getElementById('stat-exp-text');
            const popupData = {
                element: expBarElement,
                change: expChange,
                isPositive: true,
                type: 'exp'
            };
            addToPopupGroup(popupData);
        }
        prevExp = exp;
    }
    
    if (statLevel) statLevel.textContent = level;
    if (statAtk) statAtk.textContent = player.attack || 0;
    if (statDef) statDef.textContent = player.defense || 0;
    if (statHpText) statHpText.textContent = `${currentHp}/${player.maxHp || 0}`;
    if (statExpText) statExpText.textContent = `${expDisp}/${expMax}`;
    if (hpBar) hpBar.style.width = `${hpPct * 100}%`;
    if (expBar) expBar.style.width = `${expPct * 100}%`;
    
    // Update item modal - fix NaN issue
    const potion30Count = player.inventory?.potion30 || 0;
    const hpBoostCount = player.inventory?.hpBoost || 0;
    const atkBoostCount = player.inventory?.atkBoost || 0;
    const defBoostCount = player.inventory?.defBoost || 0;
    
    if (invPotion30) invPotion30.textContent = potion30Count;
    if (invHpBoost) invHpBoost.textContent = hpBoostCount;
    if (invAtkBoost) invAtkBoost.textContent = atkBoostCount;
    if (invDefBoost) invDefBoost.textContent = defBoostCount;
    
    // Update detailed status modal
    const modalLevel = document.getElementById('modal-level');
    const modalExp = document.getElementById('modal-exp');
    const modalHp = document.getElementById('modal-hp');
    const modalAttack = document.getElementById('modal-attack');
    const modalDefense = document.getElementById('modal-defense');
    const modalFloor = document.getElementById('modal-floor');
    const modalPotion30 = document.getElementById('modal-potion30');
    const modalHpBoost = document.getElementById('modal-hp-boost');
    const modalAtkBoost = document.getElementById('modal-atk-boost');
    const modalDefBoost = document.getElementById('modal-def-boost');
    const modalWorld = document.getElementById('modal-world');
    const modalDifficulty = document.getElementById('modal-difficulty');
    const modalDungeonSummary = document.getElementById('modal-dungeon-summary');
    const modalDungeonType = document.getElementById('modal-dungeon-type');
    const modalDungeonTypeRow = document.getElementById('modal-dungeon-type-row');
    
    if (modalLevel) modalLevel.textContent = level;
    if (modalExp) modalExp.textContent = `${expDisp} / ${expMax}`;
    if (modalHp) modalHp.textContent = `${currentHp} / ${player.maxHp || 0}`;
    if (modalAttack) modalAttack.textContent = player.attack || 0;
    if (modalDefense) modalDefense.textContent = player.defense || 0;
    if (modalFloor) modalFloor.textContent = `${dungeonLevel}F`;
    if (modalPotion30) modalPotion30.textContent = `x ${potion30Count}`;
    if (modalHpBoost) modalHpBoost.textContent = `x ${hpBoostCount}`;
    if (modalAtkBoost) modalAtkBoost.textContent = `x ${atkBoostCount}`;
    if (modalDefBoost) modalDefBoost.textContent = `x ${defBoostCount}`;
    if (modalWorld) {
        if (currentMode === 'blockdim') {
            const nested = blockDimState?.nested || 1;
            modalWorld.textContent = `BlockDim NESTED ${nested} / ${blockDimState?.dimKey?.toUpperCase() || ''}`;
        } else {
            modalWorld.textContent = `${selectedWorld}世界`;
        }
    }
    if (modalDifficulty) modalDifficulty.textContent = difficulty;
    // ダンジョン情報（BlockDim ではブロック構成を表示）
    if (modalDungeonSummary) {
        if (currentMode === 'blockdim' && blockDimState?.spec) {
            const dimKey = (blockDimState.dimKey || 'a').toUpperCase();
            // 名前解決（未ロード時はキーをそのまま表示）
            let b1 = blockDimState.b1Key || '';
            let b2 = blockDimState.b2Key || '';
            let b3 = blockDimState.b3Key || '';
            try {
                if (typeof blockDimTables === 'object' && blockDimTables.__loaded) {
                    b1 = (blockDimTables.blocks1.find(b=>b.key===blockDimState.b1Key)||{}).name || b1;
                    b2 = (blockDimTables.blocks2.find(b=>b.key===blockDimState.b2Key)||{}).name || b2;
                    b3 = (blockDimTables.blocks3.find(b=>b.key===blockDimState.b3Key)||{}).name || b3;
                }
            } catch {}
            const nested = blockDimState?.nested || 1;
            modalDungeonSummary.textContent = `NESTED ${nested} ／ 次元 ${dimKey}：${b1}・${b2}・${b3}`;
            if (modalDungeonTypeRow && modalDungeonType) {
                modalDungeonTypeRow.style.display = '';
                modalDungeonType.textContent = formatSpecType(blockDimState.spec);
            }
        } else {
            const dData = dungeonInfo[selectedDungeonBase];
            const name = dData ? dData.name : '-';
            modalDungeonSummary.textContent = `${selectedWorld}世界：${name}`;
            if (modalDungeonTypeRow && modalDungeonType) {
                modalDungeonTypeRow.style.display = '';
                modalDungeonType.textContent = dData ? getDungeonTypeName(dData.type) : '-';
            }
        }
    }
    
    if (statusDetails) {
        statusDetails.innerHTML = `階層: ${dungeonLevel}<br>` +
            `Lv.${level} HP ${currentHp}/${player.maxHp || 0} 攻${player.attack || 0} 防${player.defense || 0}`;
    }
    const floorEl = document.getElementById('floor-indicator');
    if (floorEl) floorEl.textContent = `${dungeonLevel}F`;

    // メッセージログは addMessage で更新
}

function addMessage(message) {
    logBuffer.push(String(message));
    if (logBuffer.length > MAX_LOG_LINES) {
        logBuffer.splice(0, logBuffer.length - MAX_LOG_LINES);
    }
    renderLog();
}

function addSeparator() {
    logBuffer.push('--------');
    if (logBuffer.length > MAX_LOG_LINES) {
        logBuffer.splice(0, logBuffer.length - MAX_LOG_LINES);
    }
    renderLog();
}

function renderLog() {
    if (!messageLogDiv) return;
    messageLogDiv.innerHTML = '';
    for (const line of logBuffer) {
        const div = document.createElement('div');
        if (line === '--------') {
            div.className = 'log-line log-sep';
        } else {
            div.className = 'log-line';
        }
        div.textContent = line;
        messageLogDiv.appendChild(div);
    }
    messageLogDiv.scrollTop = messageLogDiv.scrollHeight;
}

function openChest(chest) {
    playSfx('pickup');
    const roll = Math.random();
    
    if (roll < 0.9) {
        // 90% chance for HP30% recovery potion
        player.inventory.potion30 += 1;
        addMessage('宝箱を開けた！HP30%回復ポーションを手に入れた！');
    } else {
        // 10% chance for parameter boost items
        const boostType = Math.floor(Math.random() * 3);
        
        if (boostType === 0) {
            // Max HP boost
            player.inventory.hpBoost += 1;
            addMessage('宝箱を開けた！最大HP強化アイテムを手に入れた！');
        } else if (boostType === 1) {
            // Attack boost
            player.inventory.atkBoost += 1;
            addMessage('宝箱を開けた！攻撃力強化アイテムを手に入れた！');
        } else {
            // Defense boost
            player.inventory.defBoost += 1;
            addMessage('宝箱を開けた！防御力強化アイテムを手に入れた！');
        }
    }
    
    updateUI();
    saveAll();
}
let audioCtx;
ffunction ensureAudio() {
    if (!audioCtx) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            // 失敗しても無視
        }
    }
}

function playSfx(type) {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type === 'attack' ? 'square' : type === 'pickup' ? 'sine' : type === 'damage' ? 'sawtooth' : 'triangle';
    const freq = type === 'attack' ? 300 : type === 'pickup' ? 880 : type === 'damage' ? 180 : type === 'stair' ? 520 : 440;
    o.frequency.setValueAtTime(freq, now);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.2, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    o.connect(g).connect(audioCtx.destination);
    o.start(now);
    o.stop(now + 0.15);
}

function attackInDirection() {
    let targetX = player.x;
    let targetY = player.y;
    
    switch (player.facing) {
        case 'up':
            targetY--;
            break;
        case 'down':
            targetY++;
            break;
        case 'left':
            targetX--;
            break;
        case 'right':
            targetX++;
            break;
    }
    
    const enemyAtTarget = enemies.find(e => e.x === targetX && e.y === targetY);
    
    if (enemyAtTarget) {
        addSeparator();
        performAttack(enemyAtTarget);
        playerTurn = false;
        setTimeout(enemyTurn, 100);
    } else {
        addMessage('その方向には敵がいない！');
    }
}

function performAttack(enemyAtTarget) {
    if (!hitCheck(player.level || 1, enemyAtTarget.level || 1)) {
        addMessage('Miss');
        addPopup(enemyAtTarget.x, enemyAtTarget.y, 'Miss', '#74c0fc');
    } else {
        const baseDef = enemyAtTarget.defense || Math.floor((5 + Math.floor(dungeonLevel / 2)) / 2);
        const attacker = { level: player.level, attack: player.attack };
        const defender = { level: enemyAtTarget.level || 1, defense: baseDef };
        const { dmg, crit } = (function(att, def){
            const base = Math.max(1, att.attack - Math.floor(def.defense / 2));
            const levelDiff = att.level - def.level;
            let mult = damageMultiplierByLevelDiff(levelDiff);
            if (!Number.isFinite(mult)) mult = (levelDiff > 0 ? Infinity : 0);
            const critFlag = isCritical(att.level, def.level);
            const rand = 0.7 + Math.random() * 0.5;
            let d = Math.ceil(base * mult * rand * (critFlag ? 1.5 : 1));
            if (d < 1 && d < 0.5) d = 0;
            return { dmg: d, crit: critFlag };
        })(attacker, defender);
        const applied = Math.ceil(applyDifficultyDamageMultipliers('deal', dmg));
        enemyAtTarget.hp -= applied;
        addMessage(`プレイヤーは敵に ${applied} のダメージを与えた！`);
        const dmgText = (crit ? '!' : '') + `${Math.min(applied, 999999999)}${applied>999999999?'+':''}`;
        playSfx('attack');
        if (enemyAtTarget.hp <= 0) {
            addMessage("敵を倒した！");
            addPopup(enemyAtTarget.x, enemyAtTarget.y, `${dmgText}☠`, '#ffffff', 1.3);
            addDefeatedEnemy(enemyAtTarget); // Add defeat animation
            grantExpFromEnemy(enemyAtTarget.level || 1, enemyAtTarget.boss || false);
            if (enemyAtTarget.boss) bossAlive = false;
            enemies.splice(enemies.indexOf(enemyAtTarget), 1);
        } else {
            addPopup(enemyAtTarget.x, enemyAtTarget.y, dmgText, crit ? '#ffa94d' : '#ffffff', crit ? 1.15 : 1);
        }
    }
}

// ダメージ/命中計算（旧補間版: Infinity-Inf 差でNaN化するため無効化）
function damageMultiplierByLevelDiff_v2_disabled(levelDiff) {
    const abs = Math.abs(levelDiff);
    if (abs < 5) return 1;
    
    // Calculate exponential multiplier based on specification
    let multiplier;
    if (abs < 10) {
        // Level diff 5-9: interpolate between 2x and 10x (or 0.5x and 0.1x)
        const progress = (abs - 5) / 5; // 0 to 1
        multiplier = 2 + (8 * progress); // 2 to 10
    } else {
        // Level diff 10+: 10^(floor(abs/10)) * (1 if exact multiple, else * base interpolation)
        const step = Math.floor(abs / 10);
        const remainder = abs % 10;
        const baseMultiplier = Math.pow(10, step);
        
        if (remainder === 0) {
            multiplier = baseMultiplier;
        } else {
            // Interpolate to next step
            const nextMultiplier = Math.pow(10, step + 1);
            const progress = remainder / 10;
            multiplier = baseMultiplier + (nextMultiplier - baseMultiplier) * progress;
        }
    }
    
    return levelDiff > 0 ? multiplier : 1 / multiplier;
}

function hitCheck(attackerLevel, defenderLevel) {
    const diff = attackerLevel - defenderLevel;
    const abs = Math.abs(diff);
    if (abs <= 2) return Math.random() < 0.8;
    if (abs >= 7 && diff < 0) return false;
    if (abs >= 3 && diff > 0) return true;
    if (abs >= 5 && diff < 0) return Math.random() >= 0.5;
    return true;
}

function isCritical(attackerLevel, defenderLevel) {
    const diff = attackerLevel - defenderLevel;
    if (Math.abs(diff) >= 5 && diff > 0) return true;
    return Math.random() < 0.1;
}

// Enemy defeat animations
const defeatedEnemies = [];

function addDefeatedEnemy(enemy) {
    defeatedEnemies.push({
        x: enemy.x,
        y: enemy.y,
        scale: 1.0,
        alpha: 1.0,
        time: 0,
        boss: enemy.boss || false
    });
}

function updateDefeatedEnemies() {
    for (let i = defeatedEnemies.length - 1; i >= 0; i--) {
        const def = defeatedEnemies[i];
        def.time += 1;
        def.scale = Math.max(0, 1.0 - def.time * 0.05);
        def.alpha = Math.max(0, 1.0 - def.time * 0.03);
        
        if (def.time > 40) {
            defeatedEnemies.splice(i, 1);
        }
    }
}

function drawDefeatedEnemies() {
    const startX = camera.x;
    const startY = camera.y;
    
    defeatedEnemies.forEach(def => {
        const ex = def.x - startX;
        const ey = def.y - startY;
        if (ex < 0 || ey < 0 || ex >= VIEWPORT_WIDTH || ey >= VIEWPORT_HEIGHT) return;
        
        const cellWe = canvas.width / VIEWPORT_WIDTH;
        const cellHe = canvas.height / VIEWPORT_HEIGHT;
        const cx = ex * cellWe + cellWe / 2;
        const cy = ey * cellHe + cellHe / 2;
        
        ctx.save();
        ctx.globalAlpha = def.alpha;
        
        if (def.boss) {
            ctx.fillStyle = '#8b0000';
            ctx.beginPath();
            ctx.arc(cx, cy, TILE_SIZE * 0.5 * def.scale, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = '#e74c3c';
            ctx.beginPath();
            ctx.arc(cx, cy, TILE_SIZE * 0.4 * def.scale, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    });
}

const popups = [];
function addPopup(x, y, text, color, scale = 1) {
    popups.push({ x, y, text, color, t: 0, scale });
}

function drawPopups() {
    const startX = camera.x;
    const startY = camera.y;
    const baseCellH = canvas.height / VIEWPORT_HEIGHT;
    ctx.textAlign = 'center';
    for (let i = popups.length - 1; i >= 0; i--) {
        const p = popups[i];
        p.t += 1;
        const ex = p.x - startX;
        const ey = p.y - startY;
        const cellW = canvas.width / VIEWPORT_WIDTH;
        const cellH2 = canvas.height / VIEWPORT_HEIGHT;
        const screenX = ex * cellW + cellW / 2;
        const screenY = ey * cellH2 + cellH2 / 2 - p.t * (cellH2 * 0.03);
        const fontSize = Math.max(18, Math.floor(baseCellH * 0.8 * (p.scale || 1)));
        ctx.font = `bold ${fontSize}px sans-serif`;
        
        // Draw popup with background and border
        const metrics = ctx.measureText(p.text);
        const textWidth = metrics.width;
        const textHeight = fontSize;
        const padding = 6;
        const bgWidth = textWidth + padding * 2;
        const bgHeight = textHeight + padding;
        
        // Draw background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(screenX - bgWidth/2, screenY - textHeight + padding/2, bgWidth, bgHeight);
        
        // Draw border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX - bgWidth/2, screenY - textHeight + padding/2, bgWidth, bgHeight);
        
        // Draw text
        ctx.fillStyle = p.color;
        ctx.fillText(p.text, screenX, screenY);
        
        if (p.t > 60) popups.splice(i, 1);
    }
}

function handlePlayerDeath(message = 'ゲームオーバー') {
    if (isGameOver) return;
    addMessage(message);
    player.hp = Math.max(0, player.hp);
    const finalFloor = document.getElementById('final-floor');
    const finalLevel = document.getElementById('final-level');
    if (finalFloor) finalFloor.textContent = `${dungeonLevel}F`;
    if (finalLevel) finalLevel.textContent = player.level;
    gameOverScreen.style.display = 'block';
    playerTurn = false;
    isGameOver = true;
    stopGameLoop();
}

function applyPostMoveEffects() {
    let continueSliding = true;

    const chestAtPlayer = chests.find(c => c.x === player.x && c.y === player.y);
    if (chestAtPlayer) {
        openChest(chestAtPlayer);
        const idx = chests.indexOf(chestAtPlayer);
        if (idx >= 0) chests.splice(idx, 1);
    }

    if (!isGameOver) {
        const floorType = getTileFloorType(player.x, player.y);
        if (floorType === FLOOR_TYPE_POISON) {
            const damage = Math.max(1, Math.floor(player.maxHp * 0.1));
            player.hp = Math.max(0, player.hp - damage);
            addMessage(`毒床がダメージ！HPが${damage}減少`);
            addPopup(player.x, player.y, `-${Math.min(damage, 999999999)}${damage>999999999?'+':''}`, '#ff6b6b');
            playSfx('damage');
            updateUI();
            if (player.hp <= 0) {
                handlePlayerDeath('毒床で倒れた…ゲームオーバー');
                continueSliding = false;
            }
        }
    }

    if (isGameOver) return { continueSliding: false };

    if (player.x === stairs.x && player.y === stairs.y) {
        const maxFloor = getMaxFloor();
        if (isBossFloor(dungeonLevel) && bossAlive) {
            addMessage('ボスを倒すまでは進めない！');
        } else {
            if (dungeonLevel === maxFloor) {
                addMessage('ダンジョンを攻略した！');
                player.hp = player.maxHp;
                stopGameLoop();
                showSelectionScreen({ stopLoop: true, refillHp: true, resetModeToNormal: true, rebuildSelection: true });
            } else {
                dungeonLevel += 1;
                addMessage(`次の階層に進んだ！（${dungeonLevel}F）`);
                playSfx('stair');
                generateLevel();
            }
        }
        continueSliding = false;
    }

    return { continueSliding: continueSliding && !isGameOver };
}

function attemptPlayerStep(dx, dy) {
    const targetX = player.x + dx;
    const targetY = player.y + dy;

    const enemyAtTarget = enemies.find(e => e.x === targetX && e.y === targetY);
    if (enemyAtTarget) {
        addSeparator();
        performAttack(enemyAtTarget);
        return true;
    }

    if (!isFloor(targetX, targetY)) return false;

    addSeparator();
    let moveSoundPlayed = false;

    function moveTo(x, y) {
        player.x = x;
        player.y = y;
        if (!moveSoundPlayed) {
            playSfx('move');
            moveSoundPlayed = true;
        }
        updateCamera();
        return applyPostMoveEffects();
    }

    let nextX = targetX;
    let nextY = targetY;

    while (true) {
        const result = moveTo(nextX, nextY);
        if (!result.continueSliding) return true;
        if (getTileFloorType(player.x, player.y) !== FLOOR_TYPE_ICE) break;

        const candidateX = player.x + dx;
        const candidateY = player.y + dy;
        const enemyAhead = enemies.find(e => e.x === candidateX && e.y === candidateY);
        if (enemyAhead) {
            performAttack(enemyAhead);
            return true;
        }
        if (!isFloor(candidateX, candidateY)) break;
        nextX = candidateX;
        nextY = candidateY;
    }

    return true;
}

// ゲームループ
let gameLoopRunning = false;

function gameLoop() {
    if (!gameLoopRunning) return; // Stop if game loop should not be running
    
    // 描画処理
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawMap();
    drawPlayer();
    drawEnemies();
    drawDefeatedEnemies(); // Draw defeat animations
    // drawItems(); // Removed - no more standalone items
    drawChests();
    drawPopups();

    updateUI();
    updateDefeatedEnemies(); // Update defeat animations

    requestAnimationFrame(gameLoop);
}

function startGameLoop() {
    if (!gameLoopRunning) {
        gameLoopRunning = true;
        gameLoop();
    }
}

function stopGameLoop() {
    gameLoopRunning = false;
}

let playerTurn = true;

// キーボード入力
document.addEventListener('keydown', (event) => {
    if (!playerTurn || isGameOver) return;
    if (isAnyModalOpen()) return; // モーダル中はゲーム入力を無効化
    ensureAudio(); // 初回入力でオーディオ解放

    let acted = false;

    switch (event.key) {
        case 'ArrowUp':
            player.facing = 'up';
            acted = attemptPlayerStep(0, -1);
            break;
        case 'ArrowDown':
            player.facing = 'down';
            acted = attemptPlayerStep(0, 1);
            break;
        case 'ArrowLeft':
            player.facing = 'left';
            acted = attemptPlayerStep(-1, 0);
            break;
        case 'ArrowRight':
            player.facing = 'right';
            acted = attemptPlayerStep(1, 0);
            break;
        case ' ': // Spacebar attack
            event.preventDefault();
            attackInDirection();
            return;
        default:
            return;
    }

    if (acted) {
        if (!isGameOver && gameLoopRunning) {
            playerTurn = false;
            setTimeout(enemyTurn, 100);
        } else if (!isGameOver) {
            playerTurn = true;
        }
    }
});

// 敵クリックでステータス表示と予測ダメージ
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    // キャンバスの現在のサイズで計算
    const cellW = canvas.width / VIEWPORT_WIDTH;
    const cellH = canvas.height / VIEWPORT_HEIGHT;
    const tx = Math.floor(mx / cellW) + camera.x;
    const ty = Math.floor(my / cellH) + camera.y;
    
    const enemy = enemies.find(en => en.x === tx && en.y === ty);
    if (enemy) {
        showEnemyInfo(enemy);
    }
});

function enemyTurn() {
    for (const enemy of enemies) {
        if (isGameOver) break;
        if (!enemy.level) enemy.level = Math.max(1, player.level + (Math.floor(Math.random() * 9) - 4));
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;

        let newX = enemy.x;
        let newY = enemy.y;

        if (Math.abs(dx) > Math.abs(dy)) {
            newX += Math.sign(dx);
        } else {
            newY += Math.sign(dy);
        }

        if (newX === player.x && newY === player.y) {
            if (!hitCheck(enemy.level, player.level)) {
                addMessage('敵は外した！');
                addPopup(player.x, player.y, 'Miss', '#74c0fc');
            } else {
                const attacker = { level: enemy.level, attack: enemy.attack };
                const defender = { level: player.level, defense: player.defense };
                const { dmg, crit } = (function(att, def){
                    const base = Math.max(1, att.attack - Math.floor(def.defense / 2));
                    const levelDiff = att.level - def.level;
                    let mult = damageMultiplierByLevelDiff(levelDiff);
                    if (!Number.isFinite(mult)) mult = (levelDiff > 0 ? Infinity : 0);
                    const critFlag = isCritical(att.level, def.level);
                    const rand = 0.7 + Math.random() * 0.5;
                    let d = Math.ceil(base * mult * rand * (critFlag ? 1.5 : 1));
                    if (d < 1 && d < 0.5) d = 0;
                    return { dmg: d, crit: critFlag };
                })(attacker, defender);
                const applied = Math.ceil(applyDifficultyDamageMultipliers('take', dmg));
                player.hp -= applied;
                addMessage(`敵はプレイヤーに ${applied} のダメージを与えた！`);
                const dmgText = (crit ? '!' : '') + `${Math.min(applied, 999999999)}${applied>999999999?'+':''}`;
                addPopup(player.x, player.y, dmgText, crit ? '#ffa94d' : '#ff6b6b', crit ? 1.15 : 1);
                playSfx('damage');
            }
            if (player.hp <= 0) {
                handlePlayerDeath('ゲームオーバー');
                break;
            }
        } else {
            const isWall = map[newY] && map[newY][newX] === 1;
            const isOccupied = enemies.some(e => e !== enemy && e.x === newX && e.y === newY);

            if (!isWall && !isOccupied) {
                enemy.x = newX;
                enemy.y = newY;
            }
        }
    }

    if (!isGameOver) {
        playerTurn = true;
    }
    saveAll();
}

restartButton.addEventListener('click', () => {
    // Reset game state
    stopGameLoop();
    dungeonLevel = 1;
    player.hp = player.maxHp; // Restore HP to full
    isGameOver = false;
    playerTurn = true;
    
    // Hide game over screen
    gameOverScreen.style.display = 'none';
    
    // Return to selection screen (common)
    showSelectionScreen({ stopLoop: false, refillHp: true, resetModeToNormal: true, rebuildSelection: true });
    
    // Save the restored state
    saveAll();
});

// ゲームの開始
// UI: モーダル/入出力
btnItems && btnItems.addEventListener('click', () => { openModal(itemsModal); });
btnStatus && btnStatus.addEventListener('click', () => { openModal(statusModal); updateUI(); });
document.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', (e) => {
    const target = e.currentTarget.getAttribute('data-target');
    const modal = document.getElementById(target);
    if (modal) {
        closeModal(modal);
    }
}));
btnExport && btnExport.addEventListener('click', () => {
    const data = { 
        dungeonLevel, 
        player, 
        selectedWorld, 
        selectedDungeonBase, 
        difficulty,
        mode: currentMode,
        blockDim: blockDimState?.enabled ? {
            enabled: true,
            dimKey: blockDimState.dimKey,
            b1Key: blockDimState.b1Key,
            b2Key: blockDimState.b2Key,
            b3Key: blockDimState.b3Key,
            spec: blockDimState.spec,
            seed: blockDimState.seed
        } : { enabled: false },
        blockDimHistory,
        blockDimBookmarks
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'save.json';
    a.click();
    URL.revokeObjectURL(url);
});
btnImport && btnImport.addEventListener('click', () => importFileInput.click());
importFileInput && importFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    try {
        const data = JSON.parse(text);
        dungeonLevel = data.dungeonLevel || 1;
        Object.assign(player, data.player || {});
        if (data.selectedWorld) selectedWorld = data.selectedWorld;
        if (data.selectedDungeonBase) selectedDungeonBase = data.selectedDungeonBase;
        if (data.difficulty) difficulty = data.difficulty;
        if (data.mode) currentMode = data.mode;
        if (data.blockDim && data.blockDim.enabled) {
            blockDimState = { enabled: true, ...data.blockDim };
        } else {
            blockDimState = { enabled: false, dimKey: 'a', b1Key: null, b2Key: null, b3Key: null, spec: null };
        }
        __lastSavedBlockDimSelectionKey = snapshotBlockDimSelection(blockDimState);
        if (Array.isArray(data.blockDimHistory)) blockDimHistory = data.blockDimHistory;
        if (Array.isArray(data.blockDimBookmarks)) blockDimBookmarks = data.blockDimBookmarks;
        if (data.miniExp) miniExpState = { selected: null, difficulty: 'NORMAL', records: {}, category: MINI_ALL_CATEGORY, ...data.miniExp };
        buildSelection();
        renderHistoryAndBookmarks();
        // インポート後は選択画面に戻す（モードは保存値を尊重）
        showSelectionScreen({ stopLoop: true, refillHp: false, resetModeToNormal: false, rebuildSelection: false });
        addMessage('データをインポートしました');
        saveAll();
    } catch {}
});
usePotion30Btn && usePotion30Btn.addEventListener('click', () => {
    if (player.inventory.potion30 > 0) {
        const heal = Math.ceil(player.maxHp * 0.3);
        player.hp = Math.min(player.maxHp, player.hp + heal);
        player.inventory.potion30 -= 1;
        addMessage(`ポーションを使用！HPが${heal}回復`);
        playSfx('pickup');
        updateUI();
        saveAll();
    }
});

useHpBoostBtn && useHpBoostBtn.addEventListener('click', () => {
    if (player.inventory.hpBoost > 0) {
        player.maxHp += 5;
        player.hp += 5; // 現在HPも同時に増加
        player.inventory.hpBoost -= 1;
        addMessage('最大HP強化アイテムを使用！最大HPが5増加！');
        playSfx('pickup');
        updateUI();
        saveAll();
    }
});

useAtkBoostBtn && useAtkBoostBtn.addEventListener('click', () => {
    if (player.inventory.atkBoost > 0) {
        player.attack += 1;
        player.inventory.atkBoost -= 1;
        addMessage('攻撃力強化アイテムを使用！攻撃力が1増加！');
        playSfx('pickup');
        updateUI();
        saveAll();
    }
});

useDefBoostBtn && useDefBoostBtn.addEventListener('click', () => {
    if (player.inventory.defBoost > 0) {
        player.defense += 1;
        player.inventory.defBoost -= 1;
        addMessage('防御力強化アイテムを使用！防御力が1増加！');
        playSfx('pickup');
        updateUI();
        saveAll();
    }
});

function grantExpFromEnemy(enemyLevel, isBoss = false) {
    const diff = enemyLevel - player.level;
    let gained = 0;
    if (diff >= 7) gained = 1200;
    else if (diff >= 5) gained = 600;
    else if (diff >= 1) gained = 300;
    else if (diff === 0) gained = 150;
    else if (diff === -1) gained = 100;
    else if (diff === -2) gained = 70;
    else if (diff === -3) gained = 50;
    else if (diff === -4) gained = 25;
    else if (diff === -5) gained = 10;
    else if (diff <= -6) gained = 1;
    
    // Boss gives 2x total normal enemy exp
    if (isBoss) {
        gained *= 2;
    }
    
    addMessage(`経験値を ${gained} 獲得！${isBoss ? ' (ボスボーナス!)' : ''}`);
    grantExp(gained, { source: 'battle', reason: isBoss ? 'boss' : '', popup: false });
}

// ロード
try {
    const raw = localStorage.getItem('roguelike_save_v1');
    if (raw) {
        const data = JSON.parse(raw);
        dungeonLevel = data.dungeonLevel || 1;
        Object.assign(player, data.player || {});
        if (data.selectedWorld) selectedWorld = data.selectedWorld;
        if (data.selectedDungeonBase) selectedDungeonBase = data.selectedDungeonBase;
        if (data.difficulty) difficulty = data.difficulty;
        if (data.mode) currentMode = data.mode;
        if (data.blockDim && data.blockDim.enabled) {
            blockDimState = { enabled: true, nested: (data.blockDim.nested||1), ...data.blockDim };
        }
        __lastSavedBlockDimSelectionKey = snapshotBlockDimSelection(blockDimState);
        if (Array.isArray(data.blockDimHistory)) blockDimHistory = data.blockDimHistory;
        if (Array.isArray(data.blockDimBookmarks)) blockDimBookmarks = data.blockDimBookmarks;
        
        // Initialize previous values to current values to prevent false change indicators
        prevHp = player.hp || 100;
        prevExp = player.exp || 0;
    }
} catch {}

// 共通EXP付与（ミニゲー/戦闘 共用）
function grantExp(amount, opts = { source: 'misc', reason: '', popup: true }) {
    const v = Math.max(0, Number(amount) || 0);
    if (v <= 0) return 0;
    player.exp = (player.exp || 0) + v;
    let leveled = 0;
    while (player.exp >= 1000) {
        player.exp -= 1000;
        const beforeLevel = player.level;
        const beforeMaxHp = player.maxHp;
        const beforeAttack = player.attack;
        const beforeDefense = player.defense;
        player.level += 1;
        player.maxHp += 5;
        player.attack += 1;
        player.defense += 1;
        player.hp = player.maxHp;
        leveled++;
        try { showLevelUpPopup(); } catch {}
        try {
            const levelUpMsg = `レベルアップ！レベル：${player.level} (+${player.level - beforeLevel})|最大HP：${player.maxHp}(+${player.maxHp - beforeMaxHp})|攻撃力：${player.attack}(+${player.attack - beforeAttack})|防御力：${player.defense}(+${player.defense - beforeDefense})`;
            addMessage(levelUpMsg);
        } catch {}
        if (expBar) {
            expBar.style.transition = 'width 0.25s';
            expBar.style.width = '100%';
            setTimeout(() => {
                expBar.style.width = '0%';
                setTimeout(() => { updateUI(); }, 260);
            }, 260);
        }
    }
    if (opts.popup) {
        try { addMessage(`経験値を ${Math.floor(v)} 獲得！（${opts.source}${opts.reason ? ': ' + opts.reason : ''}）`); } catch {}
    }
    try { updateUI(); } catch {}
    try { renderMiniExpPlayerHud(); } catch {}
    try { saveAll(); } catch {}
    return v;
}

// 選択画面構築
function buildSelection() {
    // 世界ボタン A..J, X
    const worlds = ['A','B','C','D','E','F','G','H','I','J','X'];
    worldButtonsDiv.innerHTML = '';
    worlds.forEach(w => {
        const b = document.createElement('button');
        b.textContent = w;
        if (w === selectedWorld) b.classList.add('selected');
        b.addEventListener('click', () => {
            selectedWorld = w;
            buildSelection();
            persistSelection();
        });
        worldButtonsDiv.appendChild(b);
    });
    // ダンジョンボタン 1,11,..,91（Xは1のみ扱い、内部で25F運用）
    const bases = selectedWorld === 'X' ? [1] : [1,11,21,31,41,51,61,71,81,91];
    dungeonButtonsDiv.innerHTML = '';
    bases.forEach(base => {
        const b = document.createElement('button');
        let dungeonData;
        if (selectedWorld === 'X') {
            dungeonData = dungeonInfo['X'];
        } else {
            dungeonData = dungeonInfo[base];
        }
        b.textContent = dungeonData ? dungeonData.name : `${base}`;
        if (base === selectedDungeonBase) b.classList.add('selected');
        // Normalプレビューは常に normal 基準で
        const prevMode = currentMode;
        currentMode = 'normal';
        b.title = `推奨Lv: ${recommendedLevelForSelection(selectedWorld, base, 1)}`;
        currentMode = prevMode;
        b.addEventListener('click', () => {
            selectedDungeonBase = base;
            buildSelection();
            showDungeonDetail(base); // 詳細情報表示
            persistSelection();
        });
        dungeonButtonsDiv.appendChild(b);
    });
    difficultySelect.value = difficulty;
    difficultySelect.onchange = () => { 
        difficulty = difficultySelect.value; 
        if (selectedDungeonBase) {
            showDungeonDetail(selectedDungeonBase); // 難易度変更時に更新
        }
        persistSelection(); 
        saveAll(); 
    };
    const expMaxSelect = 1000;
    playerSummaryDiv.innerHTML = `
        <button id=\"player-summary-toggle\" class=\"summary-toggle\" aria-expanded=\"${!selectionFooterCollapsed}\" title=\"${selectionFooterCollapsed ? '展開' : '折りたたみ'}\">${selectionFooterCollapsed ? '∧' : '∨'}</button>
        <div class=\"player-status-card\">
            <h3>プレイヤーステータス</h3>
            <div class=\"status-grid\">
                <div class=\"stat-item\">
                    <span class=\"stat-label\">レベル</span>
                    <span class=\"stat-value level\">${player.level}</span>
                </div>
                <div class=\"stat-item\">
                    <span class=\"stat-label\">HP</span>
                    <span class=\"stat-value hp\">${player.hp}/${player.maxHp}</span>
                </div>
                <div class=\"stat-item\">
                    <span class=\"stat-label\">経験値</span>
                    <span class=\"stat-value\">${Math.floor(player.exp || 0)}/${expMaxSelect}</span>
                </div>
                <div class=\"stat-item\">
                    <span class=\"stat-label\">攻撃力</span>
                    <span class=\"stat-value attack\">${player.attack}</span>
                </div>
                <div class=\"stat-item\">
                    <span class=\"stat-label\">防御力</span>
                    <span class=\"stat-value defense\">${player.defense}</span>
                </div>
            </div>
        </div>
    `;
    // トグルの初期状態反映とハンドラ
    if (selectionFooterCollapsed) playerSummaryDiv.classList.add('collapsed');
    else playerSummaryDiv.classList.remove('collapsed');
    const toggleBtn = document.getElementById('player-summary-toggle');
    if (toggleBtn) toggleBtn.addEventListener('click', () => toggleSelectionFooter());
    measureSelectionFooterHeight();
    // レイアウト反映（高さ計測）
    measureSelectionFooterHeight();
    
    // 初期選択時の詳細表示
    if (selectedDungeonBase) {
        showDungeonDetail(selectedDungeonBase);
    } else {
        dungeonDetailCard.style.display = 'none';
    }
}

function persistSelection() {
    try {
        saveAll();
    } catch {}
}

function startGameFromSelection() {
    // 初期階層
    currentMode = 'normal';
    restoreRandom();
    dungeonLevel = 1;
    updateMapSize(); // Ensure proper map size for level 1
    selectionScreen.style.display = 'none';
    document.getElementById('toolbar').style.display = 'flex';
    gameScreen.style.display = 'block';
    enterInGameLayout();
    
    // Force canvas resize and immediate render with proper timing
    setTimeout(() => {
        resizeCanvasToStage();
        generateLevel();
        updateUI();
        
        // Start game loop
        startGameLoop();
    }, 100); // Increased timeout for better initialization
}

// BlockDim でゲーム開始
function startGameFromBlockDim() {
    // Validate spec
    if (!blockDimState?.spec) {
        addMessage('ブロック選択が不完全です');
        return;
    }
    currentMode = 'blockdim';
    blockDimState.enabled = true;
    dungeonLevel = 1;
    updateMapSize();
    reseedBlockDimForFloor();
    selectionScreen.style.display = 'none';
    document.getElementById('toolbar').style.display = 'flex';
    gameScreen.style.display = 'block';
    enterInGameLayout();
    setTimeout(() => {
        resizeCanvasToStage();
        generateLevel();
        updateUI();
        startGameLoop();
    }, 100);
    // 履歴に追加
    pushGateHistoryFromCurrent();
    saveAll();
}

// 戻るボタンで選択に戻る（共通関数経由）
btnBack && btnBack.addEventListener('click', () => {
    showSelectionScreen({ stopLoop: true, refillHp: true, resetModeToNormal: true, rebuildSelection: true });
});

// 初期表示は選択画面
document.getElementById('toolbar').style.display = 'none';
selectionScreen.style.display = 'flex';
gameScreen.style.display = 'none';
buildSelection();
updateUI(); // Initial UI update
// Tabs + BlockDim UI init (lazy fetch when opening BlockDim tab)
setupTabs();

// キャンバスクリックで敵情報を出す処理はそのまま

// スタートはダンジョン押下で行う（ダンジョンボタンクリック時に開始）
dungeonButtonsDiv.addEventListener('click', (e) => {
    if (e.target.tagName.toLowerCase() === 'button') {
        // ダンジョン選択時は詳細表示のみ、ゲーム開始はしない
        // ゲーム開始は「ダンジョンに入る」ボタンで行う
    }
});

// ダンジョン開始ボタンのイベントリスナー
startDungeonBtn && startDungeonBtn.addEventListener('click', () => {
    if (selectedDungeonBase) {
        startGameFromSelection();
        updateUI(); // Update UI when starting game
    }
});

// -------------- MiniExp (MOD) --------------
async function loadMiniManifestOnce() {
    if (__miniManifest) return __miniManifest;
    // 1) すでに JS マニフェストが読み込まれていればそれを採用
    if (Array.isArray(window.MINIEXP_MANIFEST)) {
        __miniManifest = window.MINIEXP_MANIFEST;
        return __miniManifest;
    }
    // 2) file:// 対応: JS 版マニフェストを <script> で読み込む
    try {
        await new Promise((ok) => {
            const s = document.createElement('script');
            s.src = 'games/manifest.json.js';
            s.async = true; s.onload = () => ok(); s.onerror = () => ok();
            document.head.appendChild(s);
        });
        if (Array.isArray(window.MINIEXP_MANIFEST)) {
            __miniManifest = window.MINIEXP_MANIFEST;
            return __miniManifest;
        }
    } catch {}
    // 3) http(s) 環境では JSON を fetch（CORS を満たす場合）
    try {
        const res = await fetch('games/manifest.json', { cache: 'no-store' });
        if (res.ok) {
            __miniManifest = await res.json();
            if (!Array.isArray(__miniManifest)) __miniManifest = [];
            return __miniManifest;
        }
    } catch {}
    // 4) フォールバック（内蔵サンプル）
    __miniManifest = [
        { id: 'othello',   name: 'オセロ',       description: '石をひっくり返してEXP', version: '0.1.0', category: 'ボード' },
        { id: 'snake',     name: 'スネーク',     description: '餌でEXP',             version: '0.1.0', category: 'アクション' },
        { id: 'breakout',  name: 'ブロック崩し', description: 'ブロック破壊でEXP',     version: '0.1.0', category: 'アクション' },
        { id: 'pong',      name: 'ピンポン',     description: '勝利でEXP',           version: '0.1.0', category: 'アクション' },
        { id: 'same',      name: 'セイムゲーム', description: 'まとめ消しでEXP',       version: '0.1.0', category: 'パズル' },
        { id: 'match3',    name: 'マッチ3',       description: 'マッチ/連鎖でEXP',     version: '0.1.0', category: 'パズル' },
    ];
    return __miniManifest;
}
function normalizeCategories(def) {
    try {
        const c = def?.categories ?? def?.category;
        if (!c) return ['その他'];
        if (Array.isArray(c)) return c.length ? c.map(x=>String(x)) : ['その他'];
        return [String(c)];
    } catch { return ['その他']; }
}

function buildCategoryMap(manifest) {
    const map = new Map();
    for (const def of manifest || []) {
        for (const cat of normalizeCategories(def)) {
            const key = cat || 'その他';
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(def);
        }
    }
    return map;
}

function renderMiniExpCategories(manifest) {
    if (!miniexpCatList) return;
    miniexpCatList.innerHTML = '';
    const catMap = buildCategoryMap(manifest);
    // 先頭に「すべて」
    const cats = ['すべて', ...Array.from(catMap.keys()).sort((a,b)=>a.localeCompare(b,'ja'))];
    const sel = miniExpState.category || MINI_ALL_CATEGORY;
    const toKey = (label) => label === 'すべて' ? MINI_ALL_CATEGORY : label;
    for (const label of cats) {
        const btn = document.createElement('button');
        btn.className = 'cat-btn' + ((sel === toKey(label)) ? ' active' : '');
        btn.textContent = label;
        btn.addEventListener('click', () => {
            miniExpState.category = toKey(label);
            renderMiniExpCategories(manifest);
            renderMiniExpList(manifest);
            // カテゴリ変更時、選択中ゲームがカテゴリ外なら未選択化
            if (miniExpState.selected) {
                const list = getFilteredManifest(manifest);
                if (!list.find(x=>x.id===miniExpState.selected)) {
                    miniExpState.selected = null;
                    if (miniexpPlaceholder) miniexpPlaceholder.textContent = 'カテゴリからゲームを選んでください。';
                    renderMiniExpRecords();
                }
            }
            saveAll();
        });
        miniexpCatList.appendChild(btn);
    }
}

function getFilteredManifest(manifest) {
    const sel = miniExpState.category || MINI_ALL_CATEGORY;
    if (sel === MINI_ALL_CATEGORY) return manifest || [];
    return (manifest || []).filter(def => normalizeCategories(def).includes(sel));
}

function renderMiniExpList(manifest) {
    if (!miniexpList) return;
    miniexpList.innerHTML = '';
    const filtered = getFilteredManifest(manifest);
    if (!filtered || filtered.length === 0) {
        const p = document.createElement('div');
        p.textContent = '該当カテゴリのミニゲームが見つかりません。games/ にミニゲームを追加してください。';
        miniexpList.appendChild(p);
        return;
    }
    filtered.forEach(def => {
        const card = document.createElement('div');
        card.className = 'miniexp-card';
        const h = document.createElement('h4'); h.textContent = def.name || def.id;
        const d = document.createElement('div'); d.className = 'desc'; d.textContent = def.description || '';
        const m = document.createElement('div'); m.className = 'meta'; m.textContent = `v${def.version||'0.0.0'} ${def.author?(' / '+def.author):''}`;
        const btn = document.createElement('button');
        btn.textContent = miniExpState.selected === def.id ? '選択中' : '選択';
        btn.addEventListener('click', () => {
            miniExpState.selected = def.id;
            renderMiniExpList(manifest);
            if (miniexpPlaceholder) miniexpPlaceholder.textContent = `${def.name||def.id} を選択しました。`;
            renderMiniExpRecords();
            saveAll();
        });
        card.appendChild(h); card.appendChild(d); card.appendChild(m); card.appendChild(btn);
        miniexpList.appendChild(card);
    });
}

async function initMiniExpUI() {
    try {
        if (miniexpPlaceholder) miniexpPlaceholder.textContent = '読み込み中...';
        const list = await loadMiniManifestOnce();
        // 初回表示時にカテゴリ→ゲームの順で描画
        renderMiniExpCategories(list);
        renderMiniExpList(list);
        if (miniexpPlaceholder && miniExpState.selected) {
            const sel = list.find(x=>x.id===miniExpState.selected);
            if (sel) miniexpPlaceholder.textContent = `${sel.name||sel.id} を選択しました。`;
            else miniexpPlaceholder.textContent = '左からミニゲームを選んでください。';
            renderMiniExpRecords();
        } else if (miniexpPlaceholder) {
            miniexpPlaceholder.textContent = 'カテゴリ→ゲームの順に選んでください。';
        }
    } catch (e) {
        if (miniexpPlaceholder) miniexpPlaceholder.textContent = '読み込みに失敗しました。';
    }
}

// Mini game registry for MODs
function cleanupMiniGameWaiter(id, entry) {
    const list = __miniGameWaiters[id];
    if (!list) return;
    const idx = list.indexOf(entry);
    if (idx >= 0) list.splice(idx, 1);
    if (list.length === 0) delete __miniGameWaiters[id];
}

function rejectMiniGameWaiters(id, error) {
    const list = __miniGameWaiters[id];
    if (!list) return;
    list.forEach(entry => {
        try {
            if (entry && typeof entry === 'object') {
                if (entry.timer) clearTimeout(entry.timer);
                entry.reject && entry.reject(error);
            } else if (typeof entry === 'function') {
                entry(null);
            }
        } catch {}
    });
    delete __miniGameWaiters[id];
}

window.registerMiniGame = function(def) {
    if (!def || !def.id) return;
    __miniGameRegistry[def.id] = def;
    const list = __miniGameWaiters[def.id];
    if (!list) return;
    list.forEach(entry => {
        try {
            if (entry && typeof entry === 'object') {
                if (entry.timer) clearTimeout(entry.timer);
                entry.resolve && entry.resolve(def);
            } else if (typeof entry === 'function') {
                entry(def);
            }
        } catch {}
    });
    delete __miniGameWaiters[def.id];
};

function waitForMiniGame(id, opts = {}) {
    return new Promise((resolve, reject) => {
        if (__miniGameRegistry[id]) { resolve(__miniGameRegistry[id]); return; }
        const timeoutMs = Number(opts.timeout ?? opts.timeoutMs ?? 15000);
        const entry = { resolve, reject, timer: null };
        if (Number.isFinite(timeoutMs) && timeoutMs > 0) {
            entry.timer = setTimeout(() => {
                cleanupMiniGameWaiter(id, entry);
                reject(new Error('Mini game registration timed out'));
            }, timeoutMs);
        }
        (__miniGameWaiters[id] ||= []).push(entry);
    });
}

async function loadMiniGameScript(def) {
    if (__miniGameRegistry[def.id]) return __miniGameRegistry[def.id];
    const url = def.entry || `games/${def.id}.js`;
    const waitPromise = waitForMiniGame(def.id, { timeout: 15000 });
    try {
        await new Promise((resolve, reject) => {
            const s = document.createElement('script');
            let done = false;
            const finish = (err) => {
                if (done) return;
                done = true;
                if (err) reject(err);
                else resolve();
            };
            s.src = url;
            s.async = true;
            s.onload = () => finish();
            s.onerror = () => {
                if (s.parentNode) { try { s.parentNode.removeChild(s); } catch {} }
                finish(new Error('Failed to load mini game script'));
            };
            document.head.appendChild(s);
        });
    } catch (err) {
        rejectMiniGameWaiters(def.id, err);
        throw err;
    }
    return await waitPromise.catch(err => {
        rejectMiniGameWaiters(def.id, err);
        throw err;
    });
}

function showMiniExpBadge(text, opts = null) {
    const hud = document.getElementById('miniexp-hud');
    if (!hud) return;
    const el = document.createElement('div');
    el.className = 'exp-badge';
    if (opts && opts.variant === 'combo') {
        el.classList.add('combo');
        const lvl = Number(opts.level||1);
        const tier = lvl >= 5 ? 'c3' : (lvl >= 3 ? 'c2' : 'c1');
        el.classList.add(tier);
    }
    el.textContent = text;
    hud.appendChild(el);
    setTimeout(() => { try { el.remove(); } catch {} }, 1200);
}

// Floating popup at arbitrary position over the mini-game container
function showTransientPopupAt(x, y, text, opts = null) {
    try {
        const container = document.getElementById('miniexp-container');
        if (!container) return;
        const el = document.createElement('div');
        el.className = 'exp-badge float';
        if (opts && opts.variant === 'combo') {
            el.classList.add('combo');
            const lvl = Number(opts.level||1);
            const tier = lvl >= 5 ? 'c3' : (lvl >= 3 ? 'c2' : 'c1');
            el.classList.add(tier);
        }
        el.textContent = text;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        container.appendChild(el);
        setTimeout(() => { try { el.remove(); } catch {} }, 1300);
    } catch {}
}
window.showTransientPopupAt = showTransientPopupAt;

function renderMiniExpPlayerHud() {
    const lv = document.getElementById('miniexp-hud-level');
    const expText = document.getElementById('miniexp-hud-exp-text');
    const bar = document.getElementById('miniexp-exp-bar');
    if (!lv || !expText || !bar) return;
    const expMax = 1000;
    const exp = Math.max(0, player?.exp||0);
    lv.textContent = String(player?.level||1);
    expText.textContent = `${Math.floor(exp)}/${expMax}`;
    const pct = Math.max(0, Math.min(1, exp/expMax));
    bar.style.width = `${Math.round(pct*100)}%`;
}

function awardXpFromMini(n, reason='') {
    ensureAudio();
    playSfx && playSfx('pickup');
    const gained = grantExp(n, { source: 'mini', reason });
    showMiniExpBadge(`+${Math.floor(gained)} EXP`);
    renderMiniExpPlayerHud();
    // 記録: セッション合計と通算
    __miniSessionExp += (Number(gained)||0);
    try {
        const gid = miniExpState.selected || reason || 'unknown';
        const rec = (miniExpState.records[gid] ||= { id: gid, bestScore: 0, totalPlays: 0, totalExpEarned: 0, lastPlayedAt: 0 });
        rec.totalExpEarned = (rec.totalExpEarned||0) + (Number(gained)||0);
        renderMiniExpRecords();
        saveAll();
    } catch {}
    return gained;
}

async function startSelectedMiniGame() {
    if (!miniExpState.selected || __currentMini) return;
    const list = __miniManifest || await loadMiniManifestOnce();
    const def = list.find(x => x.id === miniExpState.selected);
    if (!def) return;
    if (miniexpStartBtn) miniexpStartBtn.disabled = true;
    if (miniexpPlaceholder) miniexpPlaceholder.textContent = 'ミニゲームを読み込んでいます…';
    let mod = null;
    try {
        mod = await loadMiniGameScript(def);
    } catch (err) {
        if (miniexpPlaceholder) miniexpPlaceholder.textContent = 'ミニゲームのロードに失敗しました。';
        if (miniexpStartBtn) miniexpStartBtn.disabled = false;
        return;
    }
    if (!mod || typeof mod.create !== 'function') {
        if (miniexpPlaceholder) miniexpPlaceholder.textContent = 'ミニゲームのロードに失敗しました。';
        if (miniexpStartBtn) miniexpStartBtn.disabled = false;
        return;
    }
    if (miniexpContainer) miniexpContainer.innerHTML = '';
    __miniSessionExp = 0;
    let runtime = null;
    try {
        runtime = mod.create(miniexpContainer, (n, meta) => awardXpFromMini(n, def.id), { difficulty: (miniexpDifficulty?.value||'NORMAL') });
    } catch (err) {
        if (miniexpPlaceholder) miniexpPlaceholder.textContent = 'ミニゲームの開始に失敗しました。';
        if (miniexpStartBtn) miniexpStartBtn.disabled = false;
        return;
    }
    try { runtime.start(); } catch {}
    __currentMini = runtime;
    if (miniexpPauseBtn) { miniexpPauseBtn.disabled = false; miniexpPauseBtn.textContent = '一時停止'; }
    if (miniexpRestartBtn) miniexpRestartBtn.disabled = false;
    if (miniexpQuitBtn) miniexpQuitBtn.disabled = false;
}

function quitMiniGame() {
    if (!__currentMini) return;
    let finalScore = NaN;
    try { __currentMini.stop && __currentMini.stop(); } catch {}
    try {
        finalScore = (typeof __currentMini.getScore === 'function') ? Number(__currentMini.getScore()) : NaN;
    } catch {}
    try { __currentMini.destroy && __currentMini.destroy(); } catch {}
    // 記録更新（プレイ回数/ベストスコア/最終プレイ時刻）
    try {
        const gid = miniExpState.selected || 'unknown';
        const rec = (miniExpState.records[gid] ||= { id: gid, bestScore: 0, totalPlays: 0, totalExpEarned: 0, lastPlayedAt: 0 });
        rec.totalPlays = (rec.totalPlays||0) + 1;
        rec.lastPlayedAt = Date.now();
        const sc = finalScore;
        if (Number.isFinite(sc)) rec.bestScore = Math.max(rec.bestScore||0, sc);
        renderMiniExpRecords();
        saveAll();
    } catch {}
    __currentMini = null;
    if (miniexpContainer) miniexpContainer.innerHTML = '';
    if (miniexpStartBtn) miniexpStartBtn.disabled = false;
    if (miniexpPauseBtn) { miniexpPauseBtn.disabled = true; miniexpPauseBtn.textContent = '一時停止'; }
    if (miniexpRestartBtn) miniexpRestartBtn.disabled = true;
    if (miniexpQuitBtn) miniexpQuitBtn.disabled = true;
}

miniexpStartBtn && miniexpStartBtn.addEventListener('click', () => {
    miniExpState.difficulty = miniexpDifficulty?.value || 'NORMAL';
    saveAll();
    startSelectedMiniGame();
});
miniexpQuitBtn && miniexpQuitBtn.addEventListener('click', quitMiniGame);

miniexpPauseBtn && miniexpPauseBtn.addEventListener('click', () => {
    if (!__currentMini) return;
    if (!__miniPaused) { __currentMini.stop && __currentMini.stop(); __miniPaused = true; miniexpPauseBtn.textContent = '再開'; }
    else { __currentMini.start && __currentMini.start(); __miniPaused = false; miniexpPauseBtn.textContent = '一時停止'; }
});
miniexpRestartBtn && miniexpRestartBtn.addEventListener('click', async () => {
    if (!miniExpState.selected) return;
    quitMiniGame();
    setTimeout(() => startSelectedMiniGame(), 50);
});

// keyboard shortcuts (P pause / R restart) when MiniExp tab active
document.addEventListener('keydown', (e) => {
    if (!tabMiniExp || tabMiniExp.style.display === 'none') return;
    if (e.key === 'p' || e.key === 'P') { e.preventDefault(); if (!miniexpPauseBtn?.disabled) miniexpPauseBtn.click(); }
    if (e.key === 'r' || e.key === 'R') { e.preventDefault(); if (!miniexpRestartBtn?.disabled) miniexpRestartBtn.click(); }
});

function renderMiniExpRecords() {
    const box = document.getElementById('miniexp-records');
    if (!box) return;
    box.innerHTML = '';
    const id = miniExpState.selected;
    if (!id) return;
    const rec = miniExpState.records[id];
    const mk = (title, value) => {
        const card = document.createElement('div');
        card.className = 'rec-card';
        const t = document.createElement('div'); t.className='rec-title'; t.textContent = title;
        const v = document.createElement('div'); v.className='rec-value'; v.textContent = value;
        card.appendChild(t); card.appendChild(v); return card;
    };
    const best = rec?.bestScore ?? 0;
    const plays = rec?.totalPlays ?? 0;
    const totalExp = Math.floor(rec?.totalExpEarned ?? 0);
    box.appendChild(mk('ベストスコア', String(best)));
    box.appendChild(mk('通算プレイ', String(plays)));
    box.appendChild(mk('通算獲得EXP', String(totalExp)));
}

// -------------- Dungeon Addons (生成MOD) --------------
// 生成タイプのレジストリ
const DungeonGenRegistry = new Map(); // id -> DungeonGeneratorDef
const StructureRegistry = new Map();  // id -> normalized structure definition
const FixedMapRegistry = new Map();   // generatorId -> { max, bossFloors, maps, mapByFloor }
const __pendingDungeonBlocks = [];    // blockdata.json 読込前に来た追加ブロック

function structureMatrixToStrings(matrix) {
    return matrix.map(row => row.map(cell => {
        if (cell === 1) return '#';
        if (cell === 0) return '.';
        return ' ';
    }).join(''));
}

function parseStructureAnchor(anchor, width, height) {
    const defaultAnchor = { x: Math.floor(width / 2), y: Math.floor(height / 2) };
    if (!anchor && anchor !== 0) return defaultAnchor;
    if (typeof anchor === 'string') {
        const key = anchor.toLowerCase();
        if (key === 'center' || key === 'centre') return defaultAnchor;
        if (key === 'top-left' || key === 'topleft' || key === 'origin') return { x: 0, y: 0 };
    }
    if (Array.isArray(anchor) && anchor.length >= 2) {
        return { x: Number(anchor[0]) || 0, y: Number(anchor[1]) || 0 };
    }
    if (anchor && typeof anchor === 'object') {
        const x = Number(anchor.x);
        const y = Number(anchor.y);
        return { x: Number.isFinite(x) ? Math.floor(x) : defaultAnchor.x, y: Number.isFinite(y) ? Math.floor(y) : defaultAnchor.y };
    }
    return defaultAnchor;
}

function normalizeStructurePattern(pattern) {
    if (!Array.isArray(pattern)) throw new Error('structure pattern must be an array');
    const rows = [];
    let width = 0;
    for (const line of pattern) {
        let cells;
        if (typeof line === 'string') {
            cells = Array.from(line);
        } else if (Array.isArray(line)) {
            cells = line.slice();
        } else if (line == null) {
            cells = [];
        } else {
            cells = [String(line)];
        }
        const normalized = [];
        for (const cell of cells) {
            if (typeof cell === 'number') {
                if (cell === 1) normalized.push(1);
                else if (cell === 0) normalized.push(0);
                else normalized.push(null);
                continue;
            }
            const ch = typeof cell === 'string' ? cell.charAt(0) : '';
            if (ch === '#' || ch === 'W' || ch === 'X' || ch === '1') normalized.push(1);
            else if (ch === '.' || ch === 'F' || ch === '0') normalized.push(0);
            else normalized.push(null);
        }
        width = Math.max(width, normalized.length);
        rows.push(normalized);
    }
    for (const row of rows) {
        while (row.length < width) row.push(null);
    }
    return { matrix: rows, width, height: rows.length };
}

function normalizeStructureDef(raw, addonId, opts = {}) {
    if (!raw) return null;
    const allowMissingId = opts.allowMissingId === true;
    const fallbackId = opts.inlineId || '__inline__';
    const id = raw.id || (allowMissingId ? fallbackId : null);
    if (!id) throw new Error('structure id is required');
    const basePattern = raw.pattern || raw.layout || raw.blueprint;
    if (!basePattern) throw new Error('structure pattern is required');
    const { matrix, width, height } = normalizeStructurePattern(basePattern);
    const anchor = parseStructureAnchor(raw.anchor, width, height);
    const allowRotation = raw.allowRotation !== false;
    const allowMirror = raw.allowMirror !== false;
    const tags = Array.isArray(raw.tags) ? raw.tags.map(t => String(t)).filter(Boolean) : [];
    const meta = raw.meta && typeof raw.meta === 'object' ? Object.assign({}, raw.meta) : undefined;
    return {
        id,
        name: raw.name || '',
        width,
        height,
        matrix,
        anchorX: anchor.x,
        anchorY: anchor.y,
        allowRotation,
        allowMirror,
        tags,
        meta,
        source: addonId || null
    };
}

function resolveStructureScale(options = {}) {
    const readScale = (value) => {
        const n = Number(value);
        if (!Number.isFinite(n)) return null;
        if (n === 0) return null;
        return Math.abs(n);
    };

    let scaleX = 1;
    let scaleY = 1;

    const base = options.scale;
    if (typeof base === 'number') {
        const n = readScale(base);
        if (n) { scaleX = n; scaleY = n; }
    } else if (Array.isArray(base) && base.length >= 2) {
        const sx = readScale(base[0]);
        const sy = readScale(base[1]);
        if (sx) scaleX = sx;
        if (sy) scaleY = sy;
    } else if (base && typeof base === 'object') {
        const sx = readScale(base.x ?? base.scaleX ?? base.width ?? base.w ?? base[0]);
        const sy = readScale(base.y ?? base.scaleY ?? base.height ?? base.h ?? base[1]);
        if (sx) scaleX = sx;
        if (sy) scaleY = sy;
    }

    const sxOpt = options.scaleX ?? options.scaleH ?? options.scaleWidth;
    const syOpt = options.scaleY ?? options.scaleV ?? options.scaleHeight;
    const sxNum = readScale(sxOpt);
    const syNum = readScale(syOpt);
    if (sxNum) scaleX = sxNum;
    if (syNum) scaleY = syNum;

    return { scaleX, scaleY };
}

function transformStructure(def, options = {}) {
    if (!def) return null;

    const rotation = options.rotation ? ((options.rotation % 360) + 360) % 360 : 0;
    if (rotation && def.allowRotation === false) return null;

    const flipH = !!options.flipH;
    const flipV = !!options.flipV;
    if ((flipH || flipV) && def.allowMirror === false) return null;

    const { scaleX, scaleY } = resolveStructureScale(options);

    const rad = rotation * (Math.PI / 180);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    const rawCells = [];

    const applyMirrorX = flipH ? -1 : 1;
    const applyMirrorY = flipV ? -1 : 1;

    for (let y = 0; y < def.height; y++) {
        for (let x = 0; x < def.width; x++) {
            const val = def.matrix[y][x];
            if (val !== 0 && val !== 1) continue;
            let dx = x - def.anchorX;
            let dy = y - def.anchorY;
            dx *= applyMirrorX;
            dy *= applyMirrorY;
            dx *= scaleX;
            dy *= scaleY;
            let rx = dx;
            let ry = dy;
            if (rotation) {
                rx = dx * cos - dy * sin;
                ry = dx * sin + dy * cos;
            }
            const tx = Math.round(rx);
            const ty = Math.round(ry);
            rawCells.push({ x: tx, y: ty, v: val });
            if (tx < minX) minX = tx;
            if (ty < minY) minY = ty;
            if (tx > maxX) maxX = tx;
            if (ty > maxY) maxY = ty;
        }
    }

    if (!rawCells.length) {
        return { cells: [], width: 0, height: 0, anchorX: 0, anchorY: 0 };
    }

    const offsetX = -minX;
    const offsetY = -minY;
    const width = (maxX - minX) + 1;
    const height = (maxY - minY) + 1;
    const merged = new Map();

    for (const cell of rawCells) {
        const cx = cell.x - minX;
        const cy = cell.y - minY;
        const key = cx + ',' + cy;
        if (!merged.has(key) || cell.v === 1) {
            merged.set(key, { x: cx, y: cy, v: cell.v });
        }
    }

    return { cells: Array.from(merged.values()), width, height, anchorX: offsetX, anchorY: offsetY };
}

function parsePlacementAnchor(anchor, width, height, fallback) {
    const defaultAnchor = fallback || { x: Math.floor(width / 2), y: Math.floor(height / 2) };
    if (!anchor && anchor !== 0) return defaultAnchor;
    if (typeof anchor === 'string') {
        const key = anchor.toLowerCase();
        if (key === 'center' || key === 'centre') return defaultAnchor;
        if (key === 'top-left' || key === 'topleft' || key === 'origin') return { x: 0, y: 0 };
    }
    if (Array.isArray(anchor) && anchor.length >= 2) {
        return { x: Number(anchor[0]) || 0, y: Number(anchor[1]) || 0 };
    }
    if (anchor && typeof anchor === 'object') {
        const x = Number(anchor.x);
        const y = Number(anchor.y);
        return { x: Number.isFinite(x) ? Math.floor(x) : defaultAnchor.x, y: Number.isFinite(y) ? Math.floor(y) : defaultAnchor.y };
    }
    return defaultAnchor;
}

function applyStructurePlacement(ctx, def, x, y, options = {}) {
    if (!ctx || !def) return false;
    const transformed = transformStructure(def, options);
    if (!transformed) return false;
    const { cells, width, height, anchorX, anchorY } = transformed;
    const anchor = parsePlacementAnchor(options.anchor, width, height, { x: anchorX, y: anchorY });
    const originX = Math.round(x - anchor.x);
    const originY = Math.round(y - anchor.y);
    const strict = options.strict !== false;
    const pending = [];

    for (const cell of cells) {
        const gx = originX + cell.x;
        const gy = originY + cell.y;
        const inside = gx >= 0 && gx < ctx.width && gy >= 0 && gy < ctx.height;
        if (!inside || !ctx.inBounds(gx, gy)) {
            if (strict) return false;
            continue;
        }
        pending.push({ x: gx, y: gy, v: cell.v });
    }

    for (const cell of pending) {
        ctx.set(cell.x, cell.y, cell.v);
    }
    return true;
}

function decodeFixedMapChar(ch) {
    if (!ch) return null;
    switch (ch) {
        case '.':
        case '0':
        case 'F':
        case 'f':
            return 0;
        case '#':
        case '1':
        case 'W':
        case 'w':
        case 'X':
        case 'x':
            return 1;
        default:
            return null;
    }
}

function normalizeGeneratorFloors(rawFloors, generatorId, addonId) {
    if (!rawFloors) return null;
    const spec = Array.isArray(rawFloors) ? { maps: rawFloors } : rawFloors;
    const maps = Array.isArray(spec.maps) ? spec.maps : [];
    const normalized = [];
    let maxWidth = 0;
    let maxHeight = 0;
    for (let i = 0; i < maps.length; i++) {
        const entry = maps[i];
        if (!entry) continue;
        const layoutSource = Array.isArray(entry.layout)
            ? entry.layout
            : typeof entry.layout === 'string'
                ? entry.layout.split(/\r?\n/)
                : Array.isArray(entry.pattern)
                    ? entry.pattern
                    : null;
        if (!layoutSource || !layoutSource.length) continue;
        const normalizedLayout = layoutSource.map(row => String(row || '')).map(row => row.replace(/\r/g, ''));
        const width = normalizedLayout.reduce((acc, row) => Math.max(acc, row.length), 0);
        const height = normalizedLayout.length;
        if (width <= 0 || height <= 0) continue;
        const padded = normalizedLayout.map(row => row.padEnd(width, ' '));
        const matrix = padded.map(line => Array.from(line).map(ch => decodeFixedMapChar(ch)));
        const floorNumber = Number.isFinite(entry.floor) ? Math.max(1, Math.floor(entry.floor)) : null;
        normalized.push({
            floor: floorNumber ?? (normalized.length + 1),
            width,
            height,
            layout: padded,
            matrix
        });
        if (width > maxWidth) maxWidth = width;
        if (height > maxHeight) maxHeight = height;
    }
    if (!normalized.length) return null;
    normalized.sort((a, b) => a.floor - b.floor);
    const deduped = [];
    const seen = new Set();
    for (const map of normalized) {
        if (seen.has(map.floor)) {
            deduped[deduped.length - 1] = map;
        } else {
            deduped.push(map);
            seen.add(map.floor);
        }
    }
    const maxFromSpec = Number.isFinite(spec.max) ? Math.max(1, Math.floor(spec.max)) : 0;
    const highestFloor = deduped[deduped.length - 1].floor;
    const maxFloor = Math.max(highestFloor, maxFromSpec || highestFloor);
    let bossList = [];
    if (Array.isArray(spec.bossFloors)) {
        bossList = spec.bossFloors;
    } else if (typeof spec.bossFloors === 'string') {
        bossList = parseBossFloors(spec.bossFloors);
    }
    const bossFloors = Array.from(new Set((bossList || []).map(n => Number(n)).filter(n => Number.isFinite(n)))).sort((a, b) => a - b);
    const mapByFloor = new Map(deduped.map(map => [map.floor, map]));
    return {
        addonId,
        generatorId,
        max: maxFloor,
        bossFloors,
        maps: deduped,
        mapByFloor,
        maxWidth,
        maxHeight
    };
}

function registerAddonGenerators(generators, addonId) {
    if (!Array.isArray(generators)) return;
    for (const raw of generators) {
        if (!raw || !raw.id) continue;
        try {
            const def = Object.assign({}, raw);
            def.source = addonId;
            const floors = normalizeGeneratorFloors(def.floors, def.id, addonId);
            if (floors) {
                FixedMapRegistry.set(def.id, floors);
                def.floors = {
                    max: floors.max,
                    bossFloors: floors.bossFloors.slice(),
                    maps: floors.maps.map(map => ({ floor: map.floor, layout: map.layout.slice() }))
                };
            } else {
                FixedMapRegistry.delete(def.id);
                if (def.floors) delete def.floors;
            }
            DungeonGenRegistry.set(def.id, def);
        } catch (e) {
            console.warn('register generator failed', addonId, raw?.id, e);
        }
    }
}

function registerAddonStructures(structures, addonId) {
    if (!Array.isArray(structures) || !structures.length) return;
    for (const raw of structures) {
        try {
            const normalized = normalizeStructureDef(raw, addonId);
            if (!normalized) continue;
            if (StructureRegistry.has(normalized.id)) {
                console.warn('structure id duplicated, overwriting:', normalized.id);
            }
            StructureRegistry.set(normalized.id, normalized);
        } catch (e) {
            console.warn('register structure failed', addonId, e);
        }
    }
}

function filterStructures(filter) {
    let list = Array.from(StructureRegistry.values());
    if (!filter) return list;
    if (filter.addonId) list = list.filter(def => def.source === filter.addonId);
    if (filter.tag) list = list.filter(def => def.tags && def.tags.includes(filter.tag));
    if (Array.isArray(filter.tags) && filter.tags.length) {
        list = list.filter(def => def.tags && filter.tags.every(tag => def.tags.includes(tag)));
    }
    if (Array.isArray(filter.excludeTags) && filter.excludeTags.length) {
        list = list.filter(def => !def.tags || !def.tags.some(tag => filter.excludeTags.includes(tag)));
    }
    return list;
}

function exposeStructure(def) {
    if (!def) return null;
    return {
        id: def.id,
        name: def.name,
        pattern: structureMatrixToStrings(def.matrix),
        anchor: { x: def.anchorX, y: def.anchorY },
        tags: def.tags.slice(),
        allowRotation: def.allowRotation,
        allowMirror: def.allowMirror,
        meta: def.meta ? Object.assign({}, def.meta) : undefined,
        width: def.width,
        height: def.height,
        source: def.source
    };
}

function makeStructureApi(ctx) {
    return {
        get(id) {
            if (!id) return null;
            return exposeStructure(StructureRegistry.get(id));
        },
        list(filter) {
            return filterStructures(filter).map(exposeStructure).filter(Boolean);
        },
        pick(filter, rng) {
            const pool = filterStructures(filter);
            if (!pool.length) return null;
            const randomFn = typeof rng === 'function' ? rng : ctx.random;
            const r = typeof randomFn === 'function' ? randomFn() : Math.random();
            const idx = Math.floor(Math.max(0, r % 1) * pool.length);
            return exposeStructure(pool[idx]);
        },
        place(structure, x, y, options) {
            if (typeof structure === 'string') {
                const def = StructureRegistry.get(structure);
                if (!def) return false;
                return applyStructurePlacement(ctx, def, x, y, options || {});
            }
            try {
                const normalized = normalizeStructureDef(structure, structure?.source || null, { allowMissingId: true, inlineId: structure?.id });
                return applyStructurePlacement(ctx, normalized, x, y, options || {});
            } catch (e) {
                console.warn('structures.place failed', e);
                return false;
            }
        },
        placePattern(pattern, x, y, options = {}) {
            try {
                const normalized = normalizeStructureDef({
                    id: options?.id || '__inline__',
                    pattern,
                    anchor: options.anchor,
                    allowRotation: options.allowRotation,
                    allowMirror: options.allowMirror
                }, null, { allowMissingId: true });
                return applyStructurePlacement(ctx, normalized, x, y, options);
            } catch (e) {
                console.warn('structures.placePattern failed', e);
                return false;
            }
        }
    };
}

function injectScriptDyn(src) {
    return new Promise((ok) => {
        const s = document.createElement('script');
        s.src = src; s.async = true; s.onload = () => ok(); s.onerror = () => ok();
        document.head.appendChild(s);
    });
}

function mergeBlocksIntoTables(blocks) {
    if (!blocks) return;
    if (!blockDimTables || !blockDimTables.__loaded) { __pendingDungeonBlocks.push(blocks); return; }
    try {
        const mergeByKey = (dst, src) => {
            if (!Array.isArray(src)) return;
            const index = new Map(dst.map((e,i)=>[e.key,i]));
            for (const it of src) {
                if (!it || !it.key) continue;
                if (index.has(it.key)) dst[index.get(it.key)] = Object.assign({}, dst[index.get(it.key)], it);
                else dst.push(it);
            }
        };
        if (blocks.dimensions) mergeByKey(blockDimTables.dimensions, blocks.dimensions);
        if (blocks.blocks1)    mergeByKey(blockDimTables.blocks1,    blocks.blocks1);
        if (blocks.blocks2)    mergeByKey(blockDimTables.blocks2,    blocks.blocks2);
        if (blocks.blocks3)    mergeByKey(blockDimTables.blocks3,    blocks.blocks3);
    } catch (e) {
        console.warn('mergeBlocksIntoTables failed', e);
    }
}

function flushPendingDungeonBlocks() {
    if (!blockDimTables || !blockDimTables.__loaded) return;
    if (!__pendingDungeonBlocks.length) return;
    for (const b of __pendingDungeonBlocks.splice(0)) mergeBlocksIntoTables(b);
}

async function loadDungeonAddons() {
    // 1) 既にJSマニフェストが読み込まれていれば採用
    let manifest = Array.isArray(window.DUNGEONTYPE_MANIFEST) ? window.DUNGEONTYPE_MANIFEST : null;
    // 2) JSマニフェストを <script> で読み込み（file://対応）
    if (!manifest) {
        try { await injectScriptDyn('dungeontypes/manifest.json.js'); } catch {}
        if (Array.isArray(window.DUNGEONTYPE_MANIFEST)) manifest = window.DUNGEONTYPE_MANIFEST;
    }
    // 3) HTTP環境なら JSON フォールバック（任意）
    if (!manifest) {
        try { const res = await fetch('dungeontypes/manifest.json', { cache:'no-store' }); if (res.ok) manifest = await res.json(); } catch {}
    }
    // 4) フォールバック: autoload.js（任意）
    if (!manifest) { try { await injectScriptDyn('dungeontypes/autoload.js'); } catch {} return; }
    // 5) エントリJSを順次読み込み
    for (const m of manifest) { if (m && m.entry) await injectScriptDyn(m.entry); }
}

// グローバル登録API（アドオンが呼ぶ）
window.registerDungeonAddon = function(def) {
    if (!def || !def.id) { console.error('registerDungeonAddon: id が必須'); return; }
    // 生成タイプを登録
    try { registerAddonGenerators(def.generators, def.id); } catch {}
    // BlockDim テーブルへ追記
    try { mergeBlocksIntoTables(def.blocks); } catch {}
    // 構造パターンを登録
    try { registerAddonStructures(def.structures, def.id); } catch {}
    console.log('[addon registered]', def.id);
};

function makeGenContext() {
    const ctx = {
        width: MAP_WIDTH,
        height: MAP_HEIGHT,
        map,
        floor: dungeonLevel,
        maxFloor: getMaxFloor(),
        generatorId: null,
        addonId: null,
        random: Math.random,
        inBounds(x,y){ return x>=1 && x<MAP_WIDTH-1 && y>=1 && y<MAP_HEIGHT-1; },
        set(x,y,v){
            if (!this.inBounds(x,y)) return;
            map[y][x] = v ? 1 : 0;
            if (v) {
                const meta = getTileMeta(x, y);
                if (meta) {
                    delete meta.floorType;
                    delete meta.floorColor;
                    if (!meta.wallColor && !Object.keys(meta).length) tileMeta[y][x] = null;
                }
            }
        },
        get(x,y){ return map[y] && (map[y][x] ? 1 : 0); },
        ensureConnectivity: () => { try { ensureConnectivity(); } catch {} },
        carvePath: (path, w=1) => { try { digPath(path, w); } catch {} },
        aStar: (s, g, opts) => { try { return aStarPath(s, g, opts) || []; } catch { return []; } },
        setFloorColor: (x, y, color) => {
            if (!color) return;
            if (y < 0 || y >= MAP_HEIGHT || x < 0 || x >= MAP_WIDTH) return;
            if (!ctx.inBounds(x, y) && map[y]?.[x] !== 0) return;
            const meta = ensureTileMeta(x, y);
            if (meta) meta.floorColor = color;
        },
        setWallColor: (x, y, color) => {
            if (!color) return;
            if (y < 0 || y >= MAP_HEIGHT || x < 0 || x >= MAP_WIDTH) return;
            const meta = ensureTileMeta(x, y);
            if (meta) meta.wallColor = color;
        },
        setFloorType: (x, y, type) => {
            if (!ctx.inBounds(x, y)) return;
            const meta = ensureTileMeta(x, y);
            if (!meta) return;
            if (!type || type === FLOOR_TYPE_NORMAL) {
                delete meta.floorType;
            } else if (type === FLOOR_TYPE_ICE || type === FLOOR_TYPE_POISON) {
                meta.floorType = type;
            }
        },
        clearTileMeta: (x, y) => {
            if (y < 0 || y >= MAP_HEIGHT || x < 0 || x >= MAP_WIDTH) return;
            tileMeta[y][x] = null;
        },
        getTileMeta: (x, y) => {
            if (y < 0 || y >= MAP_HEIGHT || x < 0 || x >= MAP_WIDTH) return null;
            return getTileMeta(x, y);
        }
    };
    ctx.structures = makeStructureApi(ctx);
    return ctx;
}

function runAddonGenerator(id) {
    const def = DungeonGenRegistry.get(id);
    if (!def) { generateFieldType(); return; }
    const ctx = makeGenContext();
    ctx.generatorId = id;
    ctx.addonId = def.source || null;
    ctx.fixedMaps = makeFixedMapApi(id, ctx);
    const bundle = FixedMapRegistry.get(id);
    let applied = false;
    const hasAlgorithm = typeof def.algorithm === 'function';
    if (!hasAlgorithm && bundle) {
        applied = applyFixedMapLayout(bundle, dungeonLevel, ctx);
    }
    if (hasAlgorithm) {
        const out = def.algorithm(ctx);
        if (Array.isArray(out)) map = out;
    } else if (!applied && !bundle) {
        generateFieldType();
    }
}

// 起動時にアドオンを試し読み込み
loadDungeonAddons()
  .then(() => {
      flushPendingDungeonBlocks();
      try { if (blockDimState?.spec) renderBdimPreview(blockDimState.spec); } catch {}
  })
  .catch(() => {});

(function (global) {
    'use strict';

    const ToolsTab = global.ToolsTab;
    function getI18n() {
        return global.I18n || null;
    }

    function translate(key, params, fallback) {
        const i18n = getI18n();
        if (key && i18n && typeof i18n.t === 'function') {
            const value = i18n.t(key, params);
            if (value !== undefined && value !== null && value !== key) {
                return value;
            }
        }
        if (typeof fallback === 'function') {
            return fallback();
        }
        if (fallback !== undefined && fallback !== null) {
            return fallback;
        }
        if (typeof key === 'string') {
            return key;
        }
        return '';
    }

    function translateSandbox(key, params, fallback) {
        if (typeof key === 'string' && !key.startsWith('tools.sandbox')) {
            return translate(`tools.sandbox.${key}`, params, fallback);
        }
        return translate(key, params, fallback);
    }

    function ts(key, fallback, params) {
        return translateSandbox(key, params || null, fallback);
    }

    function getPortalTypeLabel(type) {
        return type === 'stairs'
            ? ts('portals.types.stairs', '階段')
            : ts('portals.types.gate', 'ゲート');
    }

    let Bridge = null;

    if (!ToolsTab || typeof ToolsTab.registerTool !== 'function') {
        return;
    }

    const clamp = (min, max, value) => Math.max(min, Math.min(max, value));
    const defaultView = () => ({
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        minScale: 0.5,
        maxScale: 3,
        initialized: false,
        needsFit: true
    });
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
    const FLOOR_DIRECTION_OPTIONS = ['', 'up', 'down', 'left', 'right'];
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
    const FLOOR_TYPE_DEFINITIONS = {
        normal: { key: 'tools.sandbox.map.options.floorType.options.normal', fallback: '通常' },
        ice: { key: 'tools.sandbox.map.options.floorType.options.ice', fallback: '氷' },
        poison: { key: 'tools.sandbox.map.options.floorType.options.poison', fallback: '毒' },
        bomb: { key: 'tools.sandbox.map.options.floorType.options.bomb', fallback: '爆弾' },
        conveyor: { key: 'tools.sandbox.map.options.floorType.options.conveyor', fallback: 'コンベヤー' },
        'one-way': { key: 'tools.sandbox.map.options.floorType.options.oneWay', fallback: '一方通行' },
        vertical: { key: 'tools.sandbox.map.options.floorType.options.vertical', fallback: '縦通行のみ' },
        horizontal: { key: 'tools.sandbox.map.options.floorType.options.horizontal', fallback: '横通行のみ' }
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

    function getFloorTypeLabel(type) {
        const def = FLOOR_TYPE_DEFINITIONS?.[type];
        if (def) {
            return translate(def.key, null, def.fallback);
        }
        if (typeof type === 'string' && type) {
            return type;
        }
        return '';
    }

    const WIRE_SIGNAL_TYPES = ['binary', 'pulse', 'value'];
    const DEFAULT_WIRE_SIGNAL_TYPE = 'binary';

    
    function makeLocaleEntry(key, fallback) {
        return { key, fallback };
    }

    function localizeEntry(entry, fallback) {
        if (!entry) return fallback || '';
        if (typeof entry === 'string') return entry;
        if (entry && typeof entry === 'object' && typeof entry.key === 'string') {
            return ts(entry.key, entry.fallback != null ? entry.fallback : fallback);
        }
        return fallback || '';
    }

    function localizeField(field) {
        const localized = { ...field };
        localized.label = localizeEntry(field.label, field.id);
        if (Array.isArray(field.options)) {
            localized.options = field.options.map(option => ({
                ...option,
                label: localizeEntry(option.label, option.value)
            }));
        }
        return localized;
    }

    function localizePort(port) {
        return { ...port, label: localizeEntry(port.label, port.id || '') };
    }

    function localizeGimmickDefinition(template) {
        const definition = {
            id: template.id,
            icon: template.icon,
            defaultConfig: template.defaultConfig ? { ...template.defaultConfig } : {},
            label: localizeEntry(template.label, template.id)
        };
        definition.defaultName = localizeEntry(template.defaultName, definition.label);
        definition.configFields = Array.isArray(template.configFields)
            ? template.configFields.map(localizeField)
            : [];
        definition.inputs = Array.isArray(template.inputs)
            ? template.inputs.map(localizePort)
            : [];
        definition.outputs = Array.isArray(template.outputs)
            ? template.outputs.map(localizePort)
            : [];
        return definition;
    }

    const GIMMICK_TYPE_TEMPLATES = {
        pushableCrate: {
            id: 'pushableCrate',
            label: makeLocaleEntry('gimmicks.pushableCrate.label', '木箱'),
            icon: '📦',
            defaultName: makeLocaleEntry('gimmicks.pushableCrate.defaultName', '木箱'),
            defaultConfig: { mass: 1, snapToGrid: true, sticky: false },
            configFields: [
                { id: 'mass', type: 'number', min: 0.1, max: 20, step: 0.1, label: makeLocaleEntry('gimmicks.pushableCrate.config.mass.label', '重さ') },
                { id: 'snapToGrid', type: 'boolean', label: makeLocaleEntry('gimmicks.pushableCrate.config.snapToGrid.label', '床グリッドに合わせる') },
                { id: 'sticky', type: 'boolean', label: makeLocaleEntry('gimmicks.pushableCrate.config.sticky.label', 'スイッチに載ると固定') }
            ],
            inputs: [],
            outputs: [
                { id: 'pressed', label: makeLocaleEntry('gimmicks.pushableCrate.outputs.pressed', '荷重ON'), signal: 'binary' },
                { id: 'released', label: makeLocaleEntry('gimmicks.pushableCrate.outputs.released', '荷重OFF'), signal: 'pulse' },
                { id: 'moved', label: makeLocaleEntry('gimmicks.pushableCrate.outputs.moved', '移動'), signal: 'pulse' }
            ]
        },
        floorSwitch: {
            id: 'floorSwitch',
            label: makeLocaleEntry('gimmicks.floorSwitch.label', 'スイッチ'),
            icon: '🔘',
            defaultName: makeLocaleEntry('gimmicks.floorSwitch.defaultName', 'スイッチ'),
            defaultConfig: { mode: 'momentary', defaultOn: false, resettable: true },
            configFields: [
                {
                    id: 'mode',
                    type: 'select',
                    label: makeLocaleEntry('gimmicks.floorSwitch.config.mode.label', 'モード'),
                    options: [
                        { value: 'momentary', label: makeLocaleEntry('gimmicks.floorSwitch.config.mode.options.momentary', '踏んでいる間だけ') },
                        { value: 'toggle', label: makeLocaleEntry('gimmicks.floorSwitch.config.mode.options.toggle', '踏む度に切替') },
                        { value: 'sticky', label: makeLocaleEntry('gimmicks.floorSwitch.config.mode.options.sticky', '一度踏むと維持') }
                    ]
                },
                { id: 'defaultOn', type: 'boolean', label: makeLocaleEntry('gimmicks.floorSwitch.config.defaultOn.label', '初期状態ON') },
                { id: 'resettable', type: 'boolean', label: makeLocaleEntry('gimmicks.floorSwitch.config.resettable.label', 'リセット信号を許可') }
            ],
            inputs: [
                { id: 'set', label: makeLocaleEntry('gimmicks.floorSwitch.inputs.set', '強制ON'), signal: 'binary' },
                { id: 'reset', label: makeLocaleEntry('gimmicks.floorSwitch.inputs.reset', '強制OFF'), signal: 'binary' }
            ],
            outputs: [
                { id: 'activated', label: makeLocaleEntry('gimmicks.floorSwitch.outputs.activated', 'ON'), signal: 'binary' },
                { id: 'deactivated', label: makeLocaleEntry('gimmicks.floorSwitch.outputs.deactivated', 'OFF'), signal: 'pulse' },
                { id: 'state', label: makeLocaleEntry('gimmicks.floorSwitch.outputs.state', '状態'), signal: 'value' }
            ]
        },
        door: {
            id: 'door',
            label: makeLocaleEntry('gimmicks.door.label', '扉'),
            icon: '🚪',
            defaultName: makeLocaleEntry('gimmicks.door.defaultName', '扉'),
            defaultConfig: { initialState: 'closed', autoClose: false, autoCloseDelay: 5 },
            configFields: [
                {
                    id: 'initialState',
                    type: 'select',
                    label: makeLocaleEntry('gimmicks.door.config.initialState.label', '初期状態'),
                    options: [
                        { value: 'open', label: makeLocaleEntry('gimmicks.door.config.initialState.options.open', '開') },
                        { value: 'closed', label: makeLocaleEntry('gimmicks.door.config.initialState.options.closed', '閉') }
                    ]
                },
                { id: 'autoClose', type: 'boolean', label: makeLocaleEntry('gimmicks.door.config.autoClose.label', '自動で閉じる') },
                { id: 'autoCloseDelay', type: 'number', label: makeLocaleEntry('gimmicks.door.config.autoCloseDelay.label', '自動クローズ秒'), min: 0, max: 120, step: 0.5 }
            ],
            inputs: [
                { id: 'open', label: makeLocaleEntry('gimmicks.door.inputs.open', '開く'), signal: 'pulse' },
                { id: 'close', label: makeLocaleEntry('gimmicks.door.inputs.close', '閉じる'), signal: 'pulse' },
                { id: 'toggle', label: makeLocaleEntry('gimmicks.door.inputs.toggle', '切り替え'), signal: 'pulse' }
            ],
            outputs: [
                { id: 'opened', label: makeLocaleEntry('gimmicks.door.outputs.opened', '開状態'), signal: 'binary' },
                { id: 'closed', label: makeLocaleEntry('gimmicks.door.outputs.closed', '閉状態'), signal: 'binary' },
                { id: 'state', label: makeLocaleEntry('gimmicks.door.outputs.state', '状態'), signal: 'value' }
            ]
        },
        sensor: {
            id: 'sensor',
            label: makeLocaleEntry('gimmicks.sensor.label', 'センサー'),
            icon: '📡',
            defaultName: makeLocaleEntry('gimmicks.sensor.defaultName', 'センサー'),
            defaultConfig: { target: 'player', radius: 3, los: false },
            configFields: [
                {
                    id: 'target',
                    type: 'select',
                    label: makeLocaleEntry('gimmicks.sensor.config.target.label', '対象'),
                    options: [
                        { value: 'player', label: makeLocaleEntry('gimmicks.sensor.config.target.options.player', 'プレイヤー') },
                        { value: 'enemy', label: makeLocaleEntry('gimmicks.sensor.config.target.options.enemy', '敵') },
                        { value: 'ally', label: makeLocaleEntry('gimmicks.sensor.config.target.options.ally', '味方') },
                        { value: 'any', label: makeLocaleEntry('gimmicks.sensor.config.target.options.any', 'すべて') }
                    ]
                },
                { id: 'radius', type: 'number', label: makeLocaleEntry('gimmicks.sensor.config.radius.label', '感知半径'), min: 1, max: 20, step: 1 },
                { id: 'los', type: 'boolean', label: makeLocaleEntry('gimmicks.sensor.config.los.label', '視線判定あり') }
            ],
            inputs: [
                { id: 'enable', label: makeLocaleEntry('gimmicks.sensor.inputs.enable', '有効化'), signal: 'binary' },
                { id: 'disable', label: makeLocaleEntry('gimmicks.sensor.inputs.disable', '無効化'), signal: 'binary' }
            ],
            outputs: [
                { id: 'detected', label: makeLocaleEntry('gimmicks.sensor.outputs.detected', '検知'), signal: 'binary' },
                { id: 'lost', label: makeLocaleEntry('gimmicks.sensor.outputs.lost', '喪失'), signal: 'pulse' },
                { id: 'count', label: makeLocaleEntry('gimmicks.sensor.outputs.count', '検知数'), signal: 'value' }
            ]
        },
        logic: {
            id: 'logic',
            label: makeLocaleEntry('gimmicks.logic.label', '論理ノード'),
            icon: '⚙️',
            defaultName: makeLocaleEntry('gimmicks.logic.defaultName', 'ロジック'),
            defaultConfig: { operator: 'and', inputCount: 2, inverted: false },
            configFields: [
                {
                    id: 'operator',
                    type: 'select',
                    label: makeLocaleEntry('gimmicks.logic.config.operator.label', '演算'),
                    options: [
                        { value: 'and', label: makeLocaleEntry('gimmicks.logic.config.operator.options.and', 'AND') },
                        { value: 'or', label: makeLocaleEntry('gimmicks.logic.config.operator.options.or', 'OR') },
                        { value: 'xor', label: makeLocaleEntry('gimmicks.logic.config.operator.options.xor', 'XOR') },
                        { value: 'nand', label: makeLocaleEntry('gimmicks.logic.config.operator.options.nand', 'NAND') },
                        { value: 'nor', label: makeLocaleEntry('gimmicks.logic.config.operator.options.nor', 'NOR') },
                        { value: 'xnor', label: makeLocaleEntry('gimmicks.logic.config.operator.options.xnor', 'XNOR') },
                        { value: 'not', label: makeLocaleEntry('gimmicks.logic.config.operator.options.not', 'NOT') }
                    ]
                },
                { id: 'inputCount', type: 'number', label: makeLocaleEntry('gimmicks.logic.config.inputCount.label', '入力数'), min: 1, max: 6, step: 1 },
                { id: 'inverted', type: 'boolean', label: makeLocaleEntry('gimmicks.logic.config.inverted.label', '出力を反転') }
            ],
            inputs: [
                { id: 'in1', label: makeLocaleEntry('gimmicks.logic.inputs.in1', '入力1'), signal: 'binary' },
                { id: 'in2', label: makeLocaleEntry('gimmicks.logic.inputs.in2', '入力2'), signal: 'binary' }
            ],
            outputs: [
                { id: 'true', label: makeLocaleEntry('gimmicks.logic.outputs.true', '真'), signal: 'binary' },
                { id: 'false', label: makeLocaleEntry('gimmicks.logic.outputs.false', '偽'), signal: 'binary' },
                { id: 'state', label: makeLocaleEntry('gimmicks.logic.outputs.state', '状態'), signal: 'value' }
            ]
        },
        script: {
            id: 'script',
            label: makeLocaleEntry('gimmicks.script.label', 'コードノード'),
            icon: '🧠',
            defaultName: makeLocaleEntry('gimmicks.script.defaultName', 'スクリプト'),
            defaultConfig: { language: 'js', code: '', autoRun: false },
            configFields: [
                {
                    id: 'language',
                    type: 'select',
                    label: makeLocaleEntry('gimmicks.script.config.language.label', '言語'),
                    options: [
                        { value: 'js', label: makeLocaleEntry('gimmicks.script.config.language.options.js', 'JavaScript') },
                        { value: 'lua', label: makeLocaleEntry('gimmicks.script.config.language.options.lua', 'Lua') }
                    ]
                },
                { id: 'autoRun', type: 'boolean', label: makeLocaleEntry('gimmicks.script.config.autoRun.label', '信号無しで毎Tick実行') },
                { id: 'code', type: 'textarea', label: makeLocaleEntry('gimmicks.script.config.code.label', 'コード'), maxLength: 5000 }
            ],
            inputs: [
                { id: 'run', label: makeLocaleEntry('gimmicks.script.inputs.run', '実行'), signal: 'pulse' },
                { id: 'param', label: makeLocaleEntry('gimmicks.script.inputs.param', '引数'), signal: 'value' }
            ],
            outputs: [
                { id: 'done', label: makeLocaleEntry('gimmicks.script.outputs.done', '完了'), signal: 'pulse' },
                { id: 'result', label: makeLocaleEntry('gimmicks.script.outputs.result', '結果'), signal: 'value' },
                { id: 'error', label: makeLocaleEntry('gimmicks.script.outputs.error', 'エラー'), signal: 'value' }
            ]
        },
        io: {
            id: 'io',
            label: makeLocaleEntry('gimmicks.io.label', 'I/Oノード'),
            icon: '🗃️',
            defaultName: makeLocaleEntry('gimmicks.io.defaultName', 'I/O'),
            defaultConfig: { mode: 'read', path: 'data.json', format: 'json', throttle: 0 },
            configFields: [
                {
                    id: 'mode',
                    type: 'select',
                    label: makeLocaleEntry('gimmicks.io.config.mode.label', '動作'),
                    options: [
                        { value: 'read', label: makeLocaleEntry('gimmicks.io.config.mode.options.read', '読み込み') },
                        { value: 'write', label: makeLocaleEntry('gimmicks.io.config.mode.options.write', '書き込み') },
                        { value: 'append', label: makeLocaleEntry('gimmicks.io.config.mode.options.append', '追記') }
                    ]
                },
                { id: 'path', type: 'text', label: makeLocaleEntry('gimmicks.io.config.path.label', 'パス'), maxLength: 120 },
                {
                    id: 'format',
                    type: 'select',
                    label: makeLocaleEntry('gimmicks.io.config.format.label', '形式'),
                    options: [
                        { value: 'json', label: makeLocaleEntry('gimmicks.io.config.format.options.json', 'JSON') },
                        { value: 'text', label: makeLocaleEntry('gimmicks.io.config.format.options.text', 'テキスト') },
                        { value: 'binary', label: makeLocaleEntry('gimmicks.io.config.format.options.binary', 'バイナリ') }
                    ]
                },
                { id: 'throttle', type: 'number', label: makeLocaleEntry('gimmicks.io.config.throttle.label', 'クールタイム(s)'), min: 0, max: 120, step: 0.5 }
            ],
            inputs: [
                { id: 'execute', label: makeLocaleEntry('gimmicks.io.inputs.execute', '実行'), signal: 'pulse' },
                { id: 'payload', label: makeLocaleEntry('gimmicks.io.inputs.payload', 'データ'), signal: 'value' }
            ],
            outputs: [
                { id: 'success', label: makeLocaleEntry('gimmicks.io.outputs.success', '成功'), signal: 'pulse' },
                { id: 'data', label: makeLocaleEntry('gimmicks.io.outputs.data', '結果'), signal: 'value' },
                { id: 'failure', label: makeLocaleEntry('gimmicks.io.outputs.failure', '失敗'), signal: 'value' }
            ]
        },
        alert: {
            id: 'alert',
            label: makeLocaleEntry('gimmicks.alert.label', 'アラート'),
            icon: '⚠️',
            defaultName: makeLocaleEntry('gimmicks.alert.defaultName', 'アラート'),
            defaultConfig: { message: 'Alert!', level: 'info', cooldown: 0 },
            configFields: [
                { id: 'message', type: 'textarea', label: makeLocaleEntry('gimmicks.alert.config.message.label', 'メッセージ'), maxLength: 280 },
                {
                    id: 'level',
                    type: 'select',
                    label: makeLocaleEntry('gimmicks.alert.config.level.label', 'レベル'),
                    options: [
                        { value: 'info', label: makeLocaleEntry('gimmicks.alert.config.level.options.info', '情報') },
                        { value: 'warning', label: makeLocaleEntry('gimmicks.alert.config.level.options.warning', '警告') },
                        { value: 'error', label: makeLocaleEntry('gimmicks.alert.config.level.options.error', '重大') }
                    ]
                },
                { id: 'cooldown', type: 'number', label: makeLocaleEntry('gimmicks.alert.config.cooldown.label', 'クールタイム(s)'), min: 0, max: 60, step: 0.5 }
            ],
            inputs: [
                { id: 'trigger', label: makeLocaleEntry('gimmicks.alert.inputs.trigger', '表示'), signal: 'pulse' },
                { id: 'setMessage', label: makeLocaleEntry('gimmicks.alert.inputs.setMessage', 'メッセージ設定'), signal: 'value' }
            ],
            outputs: [
                { id: 'shown', label: makeLocaleEntry('gimmicks.alert.outputs.shown', '表示完了'), signal: 'pulse' }
            ]
        }
    };
    const GIMMICK_TYPES = Object.keys(GIMMICK_TYPE_TEMPLATES);



    const LOGIC_OPERATORS = new Set(['and', 'or', 'xor', 'nand', 'nor', 'xnor', 'not']);
    const MAX_GIMMICKS_PER_MAP = 128;
    const MAX_WIRES_PER_MAP = 256;

    let refs = {};
    const DOMAIN_EFFECT_OPTIONS = [
        { id: 'attackUp', label: '攻撃力アップ', labelKey: 'map.domain.effects.attackUp' },
        { id: 'defenseUp', label: '防御力アップ', labelKey: 'map.domain.effects.defenseUp' },
        { id: 'attackDown', label: '攻撃力ダウン', labelKey: 'map.domain.effects.attackDown' },
        { id: 'defenseDown', label: '防御力ダウン', labelKey: 'map.domain.effects.defenseDown' },
        { id: 'allyBoost', label: '味方強化', labelKey: 'map.domain.effects.allyBoost' },
        { id: 'enemyBoost', label: '敵強化', labelKey: 'map.domain.effects.enemyBoost' },
        { id: 'enemyOverpower', label: '超敵強化', labelKey: 'map.domain.effects.enemyOverpower' },
        { id: 'levelUp', label: '高レベル化', labelKey: 'map.domain.effects.levelUp' },
        { id: 'levelDown', label: '低レベル化', labelKey: 'map.domain.effects.levelDown' },
        { id: 'abilityUp', label: '能力アップ', labelKey: 'map.domain.effects.abilityUp' },
        { id: 'abilityDown', label: '能力ダウン', labelKey: 'map.domain.effects.abilityDown' },
        { id: 'enemyInvincible', label: '敵無敵', labelKey: 'map.domain.effects.enemyInvincible' },
        { id: 'allInvincible', label: '無敵', labelKey: 'map.domain.effects.allInvincible' },
        { id: 'damageReverse', label: 'ダメージ反転', labelKey: 'map.domain.effects.damageReverse' },
        { id: 'slow', label: '遅い', labelKey: 'map.domain.effects.slow' },
        { id: 'fast', label: '速い', labelKey: 'map.domain.effects.fast' },
        { id: 'ailment', label: '状態異常化', labelKey: 'map.domain.effects.ailment' }
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
    let detachLocaleChange = null;
    let pendingLocaleSubscription = null;
    let mapSeq = 1;
    let portalSeq = 1;
    let enemySeq = 1;
    let domainSeq = 1;
    let gimmickSeq = 1;
    let wireSeq = 1;
    let pendingSerializedState = null;
    const paintState = { active: false, pointerId: null, lastKey: null, blockClick: false };
    const panState = { active: false, pointerId: null, lastX: 0, lastY: 0, moved: false, blockClick: false };
    const EXPORT_FILE_PREFIX = 'sandbox-dungeon';
    const EXPORT_SCHEMA = 'yu.sandbox.dungeon';
    const EXPORT_KIND = 'sandbox_dungeon';

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

    function buildExportBundle(snapshot) {
        const version = snapshot?.version || Bridge?.configVersion || SANDBOX_CONFIG_VERSION;
        const exportedAt = new Date().toISOString();
        const summary = snapshot ? {
            mapCount: Array.isArray(snapshot.maps) ? snapshot.maps.length : 0,
            interactiveMode: !!snapshot.interactiveMode,
            playerLevel: snapshot.playerLevel ?? null
        } : null;
        const bundle = {
            schema: EXPORT_SCHEMA,
            version,
            exportedAt,
            type: EXPORT_KIND,
            data: snapshot || null,
            payload: {
                config: snapshot || null,
                summary
            }
        };
        if (!bundle.payload.summary) delete bundle.payload.summary;
        if (!bundle.payload.config) delete bundle.payload.config;
        if (!bundle.data) delete bundle.data;
        return bundle;
    }

    function extractSandboxPayload(raw) {
        if (!raw || typeof raw !== 'object') return null;

        const seen = new WeakSet();
        const queue = [];
        const enqueue = (value) => {
            if (!value || typeof value !== 'object') return;
            if (seen.has(value)) return;
            seen.add(value);
            queue.push(value);
        };

        const considerObject = (value) => {
            if (!value || typeof value !== 'object') return;
            if (Array.isArray(value.maps)) {
                return value;
            }
            if (value.config && typeof value.config === 'object') {
                const config = value.config;
                if (Array.isArray(config.maps)) return config;
                const width = Number(config.width);
                const height = Number(config.height);
                if (Number.isFinite(width) && Number.isFinite(height)) {
                    return { ...config, width, height };
                }
            }
            const width = Number(value.width);
            const height = Number(value.height);
            if (Number.isFinite(width) && Number.isFinite(height)) {
                return { ...value, width, height };
            }
            return null;
        };

        const seed = () => {
            enqueue(raw);
            if (raw.payload) {
                enqueue(raw.payload);
                if (Array.isArray(raw.payload)) {
                    raw.payload.forEach(enqueue);
                } else if (typeof raw.payload === 'object') {
                    enqueue(raw.payload.config);
                    enqueue(raw.payload.data);
                    enqueue(raw.payload.state);
                }
            }
            if (raw.bundle) enqueue(raw.bundle);
            if (raw.content) enqueue(raw.content);
            if (raw.contents) enqueue(raw.contents);
            if (raw.data) enqueue(raw.data);
            if (raw.state && !Array.isArray(raw.state)) enqueue(raw.state);
            if (raw.sandbox) enqueue(raw.sandbox);
            if (raw.sandboxState) enqueue(raw.sandboxState);
            if (raw.config) enqueue(raw.config);
            if (raw.meta && typeof raw.meta === 'object') {
                enqueue(raw.meta.config);
                enqueue(raw.meta.payload);
            }
            if (raw.type === EXPORT_KIND && raw.data) enqueue(raw.data);
        };

        seed();

        while (queue.length) {
            const current = queue.shift();
            if (Array.isArray(current)) {
                current.forEach(enqueue);
                continue;
            }
            const result = considerObject(current);
            if (result) return result;
            if (current && typeof current === 'object') {
                if (current.payload) {
                    if (Array.isArray(current.payload)) current.payload.forEach(enqueue);
                    else if (typeof current.payload === 'object') {
                        enqueue(current.payload);
                        enqueue(current.payload.config);
                        enqueue(current.payload.data);
                        enqueue(current.payload.state);
                    }
                }
                if (current.config) enqueue(current.config);
                if (current.data) enqueue(current.data);
                if (current.state && !Array.isArray(current.state)) enqueue(current.state);
                if (current.contents) enqueue(current.contents);
                if (current.bundle) enqueue(current.bundle);
            }
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

    function sanitizeGimmickType(type) {
        if (typeof type !== 'string') return 'floorSwitch';
        const normalized = type.trim();
        return GIMMICK_TYPES.includes(normalized) ? normalized : 'floorSwitch';
    }

    function getGimmickDefinition(type) {
        const template = GIMMICK_TYPE_TEMPLATES[sanitizeGimmickType(type)] || GIMMICK_TYPE_TEMPLATES.floorSwitch;
        return localizeGimmickDefinition(template);
    }

    function defaultGimmickName(type) {
        const def = getGimmickDefinition(type);
        return def?.defaultName || def?.label || 'ギミック';
    }

    function getGimmickIcon(type) {
        const def = getGimmickDefinition(type);
        return def?.icon || '⚙️';
    }

    function getGimmickDisplayLabel(gimmick) {
        if (!gimmick || typeof gimmick !== 'object') return '';
        const name = typeof gimmick.name === 'string' ? gimmick.name.trim() : '';
        if (name) return name;
        const def = getGimmickDefinition(gimmick.type);
        return def?.label || defaultGimmickName(gimmick.type);
    }

    function computeDefaultLayout(index = 0) {
        const col = index % 4;
        const row = Math.floor(index / 4);
        const x = 0.15 + col * 0.2;
        const y = 0.18 + row * 0.22;
        return {
            x: clamp(0.05, 0.95, Number.isFinite(x) ? x : 0.5),
            y: clamp(0.05, 0.95, Number.isFinite(y) ? y : 0.5)
        };
    }

    function normalizeLayout(layout, index = 0) {
        if (!layout || typeof layout !== 'object') {
            return computeDefaultLayout(index);
        }
        const lx = Number(layout.x);
        const ly = Number(layout.y);
        if (Number.isFinite(lx) && Number.isFinite(ly)) {
            return {
                x: clamp(0, 1, lx),
                y: clamp(0, 1, ly)
            };
        }
        return computeDefaultLayout(index);
    }

    function sanitizeGimmickFieldValue(field, raw) {
        if (!field) return raw;
        switch (field.type) {
            case 'number': {
                const value = Number(raw);
                if (!Number.isFinite(value)) return field.min ?? 0;
                const step = Number(field.step);
                const withClamp = clamp(field.min ?? Number.MIN_SAFE_INTEGER, field.max ?? Number.MAX_SAFE_INTEGER, value);
                if (Number.isFinite(step) && step > 0) {
                    return Math.round(withClamp / step) * step;
                }
                return withClamp;
            }
            case 'boolean':
                return !!raw;
            case 'textarea':
            case 'text': {
                const str = typeof raw === 'string' ? raw : (raw == null ? '' : String(raw));
                if (Number.isInteger(field.maxLength) && field.maxLength > 0) {
                    return str.slice(0, field.maxLength);
                }
                return str;
            }
            case 'select': {
                const value = typeof raw === 'string' ? raw : (raw == null ? '' : String(raw));
                const options = Array.isArray(field.options) ? field.options : [];
                if (options.some(opt => opt.value === value)) {
                    return value;
                }
                return options[0]?.value ?? '';
            }
            default:
                return raw;
        }
    }

    function mergeGimmickConfig(definition, rawConfig) {
        const def = definition || getGimmickDefinition('floorSwitch');
        const config = { ...(def.defaultConfig || {}) };
        const fields = Array.isArray(def.configFields) ? def.configFields : [];
        fields.forEach(field => {
            const value = rawConfig?.[field.id];
            if (typeof value !== 'undefined') {
                config[field.id] = sanitizeGimmickFieldValue(field, value);
            }
        });
        if (rawConfig && typeof rawConfig === 'object') {
            Object.keys(rawConfig).forEach(key => {
                if (typeof config[key] === 'undefined') {
                    config[key] = rawConfig[key];
                }
            });
        }
        return config;
    }

    function createGimmickRecord(options = {}, layoutIndex = 0) {
        const type = sanitizeGimmickType(options.type || 'floorSwitch');
        const def = getGimmickDefinition(type);
        const id = typeof options.id === 'string' && options.id.trim() ? options.id.trim() : `gimmick-${gimmickSeq++}`;
        const layout = normalizeLayout(options.layout, layoutIndex);
        const tile = options.tile && Number.isFinite(options.tile.x) && Number.isFinite(options.tile.y)
            ? { x: Math.floor(options.tile.x), y: Math.floor(options.tile.y) }
            : null;
        const config = mergeGimmickConfig(def, options.config);
        return {
            id,
            type,
            name: typeof options.name === 'string' && options.name.trim() ? options.name.trim() : `${def.defaultName || def.label} ${layoutIndex + 1}`,
            notes: typeof options.notes === 'string' ? options.notes : '',
            tags: Array.isArray(options.tags) ? options.tags.filter(tag => typeof tag === 'string').slice(0, 8) : [],
            locked: !!options.locked,
            layout,
            tile,
            color: typeof options.color === 'string' ? options.color : null,
            config
        };
    }

    function cloneGimmickRecord(record) {
        if (!record || typeof record !== 'object') return null;
        return {
            id: record.id,
            type: sanitizeGimmickType(record.type),
            name: typeof record.name === 'string' ? record.name : defaultGimmickName(record.type),
            notes: typeof record.notes === 'string' ? record.notes : '',
            tags: Array.isArray(record.tags) ? record.tags.filter(tag => typeof tag === 'string').map(tag => tag.slice(0, 32)).slice(0, 8) : [],
            locked: !!record.locked,
            layout: normalizeLayout(record.layout),
            tile: record.tile && Number.isFinite(record.tile.x) && Number.isFinite(record.tile.y)
                ? { x: Math.floor(record.tile.x), y: Math.floor(record.tile.y) }
                : null,
            color: typeof record.color === 'string' ? record.color : null,
            config: mergeGimmickConfig(getGimmickDefinition(record.type), record.config)
        };
    }

    function cloneGimmickList(list) {
        if (!Array.isArray(list)) return [];
        return list.map((entry, index) => cloneGimmickRecord({ ...entry, layout: entry?.layout ?? computeDefaultLayout(index) })).filter(Boolean);
    }

    function createWireRecord(options = {}) {
        const id = typeof options.id === 'string' && options.id.trim() ? options.id.trim() : `wire-${wireSeq++}`;
        const signal = WIRE_SIGNAL_TYPES.includes(options.signal) ? options.signal : DEFAULT_WIRE_SIGNAL_TYPE;
        return {
            id,
            source: {
                gimmickId: typeof options.source?.gimmickId === 'string' ? options.source.gimmickId : null,
                portId: typeof options.source?.portId === 'string' ? options.source.portId : null
            },
            target: {
                gimmickId: typeof options.target?.gimmickId === 'string' ? options.target.gimmickId : null,
                portId: typeof options.target?.portId === 'string' ? options.target.portId : null
            },
            signal,
            label: typeof options.label === 'string' ? options.label : ''
        };
    }

    function cloneWireList(list, gimmicks = []) {
        if (!Array.isArray(list)) return [];
        const outputIndex = new Set();
        const inputIndex = new Set();
        if (Array.isArray(gimmicks)) {
            gimmicks.forEach(gimmick => {
                const outputs = resolveGimmickOutputPorts(gimmick);
                const inputs = resolveGimmickInputPorts(gimmick);
                outputs.forEach(port => outputIndex.add(`${gimmick.id}:${port.id}`));
                inputs.forEach(port => inputIndex.add(`${gimmick.id}:${port.id}`));
            });
        }
        return list.map(entry => ({
            id: entry?.id || `wire-${wireSeq++}`,
            source: {
                gimmickId: typeof entry?.source?.gimmickId === 'string' ? entry.source.gimmickId : null,
                portId: typeof entry?.source?.portId === 'string' ? entry.source.portId : null
            },
            target: {
                gimmickId: typeof entry?.target?.gimmickId === 'string' ? entry.target.gimmickId : null,
                portId: typeof entry?.target?.portId === 'string' ? entry.target.portId : null
            },
            signal: WIRE_SIGNAL_TYPES.includes(entry?.signal) ? entry.signal : DEFAULT_WIRE_SIGNAL_TYPE,
            label: typeof entry?.label === 'string' ? entry.label : ''
        })).filter(wire => {
            if (!wire.source.gimmickId || !wire.source.portId || !wire.target.gimmickId || !wire.target.portId) return false;
            if (outputIndex.size && !outputIndex.has(`${wire.source.gimmickId}:${wire.source.portId}`)) return false;
            if (inputIndex.size && !inputIndex.has(`${wire.target.gimmickId}:${wire.target.portId}`)) return false;
            return true;
        });
    }

    function resolveLogicInputPorts(config) {
        const count = clamp(1, 8, Math.floor(Number(config?.inputCount) || 2));
        const ports = [];
        for (let i = 0; i < count; i++) {
            ports.push({
                id: `in${i + 1}`,
                label: `入力${i + 1}`,
                signal: 'binary'
            });
        }
        return ports;
    }

    function resolveGimmickInputPorts(gimmick) {
        const def = getGimmickDefinition(gimmick?.type);
        if (gimmick?.type === 'logic') {
            return resolveLogicInputPorts(gimmick?.config);
        }
        return Array.isArray(def.inputs)
            ? def.inputs.map(port => ({ id: port.id, label: port.label, signal: port.signal || DEFAULT_WIRE_SIGNAL_TYPE }))
            : [];
    }

    function resolveGimmickOutputPorts(gimmick) {
        const def = getGimmickDefinition(gimmick?.type);
        if (gimmick?.type === 'logic') {
            const defaultOutputs = Array.isArray(def.outputs)
                ? def.outputs.map(port => ({ id: port.id, label: port.label, signal: port.signal || DEFAULT_WIRE_SIGNAL_TYPE }))
                : [];
            if (gimmick?.config?.inverted) {
                return defaultOutputs.map(port => ({ ...port, label: `${port.label}(INV)` }));
            }
            return defaultOutputs;
        }
        return Array.isArray(def.outputs)
            ? def.outputs.map(port => ({ id: port.id, label: port.label, signal: port.signal || DEFAULT_WIRE_SIGNAL_TYPE }))
            : [];
    }

    function getGimmickById(id) {
        if (!id) return null;
        return Array.isArray(state.gimmicks) ? state.gimmicks.find(gimmick => gimmick && gimmick.id === id) : null;
    }

    function getOutputPortLabel(gimmick, portId) {
        if (!gimmick || !portId) return portId || '';
        const ports = resolveGimmickOutputPorts(gimmick);
        const port = ports.find(entry => entry.id === portId);
        return port ? port.label : portId;
    }

    function getInputPortLabel(gimmick, portId) {
        if (!gimmick || !portId) return portId || '';
        const ports = resolveGimmickInputPorts(gimmick);
        const port = ports.find(entry => entry.id === portId);
        return port ? port.label : portId;
    }

    function ensureGimmickCollections() {
        const map = getActiveMapRecord();
        if (!map) return;
        if (!Array.isArray(map.gimmicks)) map.gimmicks = [];
        if (!Array.isArray(map.wires)) map.wires = [];
        state.gimmicks = map.gimmicks;
        state.wires = map.wires;
    }

    function normalizeGimmickList(list) {
        if (!Array.isArray(list)) return [];
        const seen = new Set();
        const result = [];
        list.forEach((entry, index) => {
            if (!entry || typeof entry !== 'object') return;
            let id = typeof entry.id === 'string' && entry.id.trim() ? entry.id.trim() : `gimmick-${gimmickSeq++}`;
            while (seen.has(id)) {
                id = `gimmick-${gimmickSeq++}`;
            }
            const record = createGimmickRecord({
                id,
                type: entry.type,
                name: entry.name,
                notes: entry.notes,
                tags: entry.tags,
                locked: entry.locked,
                layout: entry.layout,
                tile: entry.tile || entry.position,
                color: entry.color,
                config: entry.config
            }, index);
            seen.add(record.id);
            result.push(record);
        });
        return result;
    }

    function normalizeWireConnections(list, gimmicks) {
        if (!Array.isArray(list) || !Array.isArray(gimmicks) || !gimmicks.length) return [];
        const gimmickMap = new Map();
        gimmicks.forEach(gimmick => gimmickMap.set(gimmick.id, gimmick));
        const seen = new Set();
        const wires = [];
        list.forEach(entry => {
            if (!entry || typeof entry !== 'object') return;
            let sourceId = typeof entry.source?.gimmickId === 'string' ? entry.source.gimmickId : null;
            let targetId = typeof entry.target?.gimmickId === 'string' ? entry.target.gimmickId : null;
            if (!gimmickMap.has(sourceId) || !gimmickMap.has(targetId)) return;
            const sourcePortId = typeof entry.source?.portId === 'string' ? entry.source.portId : null;
            const targetPortId = typeof entry.target?.portId === 'string' ? entry.target.portId : null;
            if (!sourcePortId || !targetPortId) return;
            const sourcePorts = resolveGimmickOutputPorts(gimmickMap.get(sourceId));
            const targetPorts = resolveGimmickInputPorts(gimmickMap.get(targetId));
            if (!sourcePorts.some(port => port.id === sourcePortId)) return;
            if (!targetPorts.some(port => port.id === targetPortId)) return;
            let id = typeof entry.id === 'string' && entry.id.trim() ? entry.id.trim() : `wire-${wireSeq++}`;
            while (seen.has(id)) {
                id = `wire-${wireSeq++}`;
            }
            const signal = WIRE_SIGNAL_TYPES.includes(entry.signal) ? entry.signal : DEFAULT_WIRE_SIGNAL_TYPE;
            wires.push({
                id,
                source: { gimmickId: sourceId, portId: sourcePortId },
                target: { gimmickId: targetId, portId: targetPortId },
                signal,
                label: typeof entry.label === 'string' ? entry.label : ''
            });
            seen.add(id);
        });
        return wires;
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
            label: getPortalTypeLabel('stairs'),
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
            domainEffects: [],
            gimmicks: [],
            wires: []
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
        if (!Array.isArray(map.gimmicks)) map.gimmicks = [];
        if (!Array.isArray(map.wires)) map.wires = [];
        state.gimmicks = map.gimmicks;
        state.wires = map.wires;
        if (!preserveSelection) {
            state.selectedEnemyId = map.enemies[0]?.id || null;
            state.selectedDomainId = map.domainEffects[0]?.id || null;
            state.selectedPortalId = map.portals && map.portals.length ? map.portals[0].id : null;
            state.selectedGimmickId = map.gimmicks && map.gimmicks.length ? map.gimmicks[0].id : null;
            state.selectedWireId = map.wires && map.wires.length ? map.wires[0].id : null;
            state.pendingWire = null;
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
        if (!option) {
            return effectId;
        }
        const key = option.labelKey ? `tools.sandbox.${option.labelKey}` : null;
        return key
            ? translateSandbox(key, null, option.label || effectId)
            : translateSandbox(`map.domain.effects.${option.id}`, null, option.label || effectId);
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
                })),
                gimmicks: cloneGimmickList(map.gimmicks || []),
                wires: cloneWireList(map.wires || [], map.gimmicks || [])
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
                })),
                gimmicks: cloneGimmickList(map.gimmicks || []),
                wires: cloneWireList(map.wires || [], map.gimmicks || [])
            })) : [],
            activeMapId: state.activeMapId,
            entryMapId: state.entryMapId,
            playerLevel: state.playerLevel,
            interactiveMode: !!state.interactiveMode,
            selectedEnemyId: state.selectedEnemyId || null,
            selectedDomainId: state.selectedDomainId || null,
            selectedPortalId: state.selectedPortalId || null,
             selectedGimmickId: state.selectedGimmickId || null,
             selectedWireId: state.selectedWireId || null,
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
                        label: getPortalTypeLabel('stairs'),
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
            const gimmicks = normalizeGimmickList(map.gimmicks || []);
            const wires = normalizeWireConnections(map.wires || [], gimmicks);
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
                })) : [],
                gimmicks,
                wires
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
            selectedGimmickId: typeof serialized?.selectedGimmickId === 'string' ? serialized.selectedGimmickId : null,
            selectedWireId: typeof serialized?.selectedWireId === 'string' ? serialized.selectedWireId : null,
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
            const gimmicks = cloneGimmickList(map.gimmicks || []);
            const wires = cloneWireList(map.wires || [], gimmicks);
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
                }) : [],
                gimmicks,
                wires
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
        const maxGimmickSeq = state.maps.reduce((max, map) => {
            const localMax = Array.isArray(map.gimmicks) ? map.gimmicks.reduce((gMax, gimmick) => {
                const num = extractNumericSuffix(gimmick.id);
                return Number.isFinite(num) ? Math.max(gMax, num) : gMax;
            }, 0) : 0;
            return Math.max(max, localMax);
        }, 0);
        gimmickSeq = Math.max(gimmickSeq, Number.isFinite(maxGimmickSeq) ? maxGimmickSeq + 1 : gimmickSeq);
        const maxWireSeq = state.maps.reduce((max, map) => {
            const localMax = Array.isArray(map.wires) ? map.wires.reduce((wMax, wire) => {
                const num = extractNumericSuffix(wire.id);
                return Number.isFinite(num) ? Math.max(wMax, num) : wMax;
            }, 0) : 0;
            return Math.max(max, localMax);
        }, 0);
        wireSeq = Math.max(wireSeq, Number.isFinite(maxWireSeq) ? maxWireSeq + 1 : wireSeq);

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
        state.view = defaultView();

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
        state.selectedGimmickId = state.gimmicks.some(gimmick => gimmick.id === payload.selectedGimmickId)
            ? payload.selectedGimmickId
            : (state.gimmicks[0]?.id || null);
        state.selectedWireId = state.wires.some(wire => wire.id === payload.selectedWireId)
            ? payload.selectedWireId
            : (state.wires[0]?.id || null);
        state.pendingWire = null;

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
        state.gimmicks = state.gimmicks.filter(Boolean).map(gimmick => {
            if (!gimmick.tile) return gimmick;
            if (!Number.isFinite(gimmick.tile.x) || !Number.isFinite(gimmick.tile.y)) {
                return { ...gimmick, tile: null };
            }
            if (gimmick.tile.x < 0 || gimmick.tile.x >= width || gimmick.tile.y < 0 || gimmick.tile.y >= height) {
                return { ...gimmick, tile: null };
            }
            return { ...gimmick, tile: { x: Math.floor(gimmick.tile.x), y: Math.floor(gimmick.tile.y) } };
        });
        if (map) {
            map.gimmicks = state.gimmicks;
        }
        if (state.view) {
            state.view.needsFit = true;
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
                    label: getPortalTypeLabel(type),
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
                state.tempMessage = ts('validation.brush.enemySelect', '敵配置ブラシを使う前に敵を選択してください。');
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
                state.tempMessage = ts('validation.brush.domainSelect', '領域ブラシを使う前にクリスタルを選択してください。');
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
        const typeKey = cell === 0 ? 'floor' : 'wall';
        const typeLabel = translateSandbox(`map.cell.types.${typeKey}`, null, cell === 0 ? '床' : '壁');
        const baseLabel = translateSandbox('map.cell.base', { type: typeLabel, x, y }, `${typeLabel} (${x}, ${y})`);
        const detailParts = [];
        if (state.playerStart && state.playerStart.x === x && state.playerStart.y === y) {
            detailParts.push(translateSandbox('map.cell.details.playerStart', null, '開始位置'));
        }
        const portalHere = Array.isArray(state.portals)
            ? state.portals.find(portal => portal && portal.x === x && portal.y === y)
            : null;
        if (portalHere) {
            if (portalHere.type === 'stairs') {
                detailParts.push(translateSandbox('map.cell.details.stairs', null, () => getPortalTypeLabel('stairs')));
            } else {
                const label = (portalHere.label || '').trim();
                detailParts.push(label
                    ? translateSandbox('map.cell.details.gateWithLabel', { label }, `ゲート: ${label}`)
                    : translateSandbox('map.cell.details.gate', null, () => getPortalTypeLabel('gate')));
            }
        }
        if (cell === 0) {
            const floorType = meta?.floorType || '';
            if (floorType && floorType !== 'normal') {
                const label = getFloorTypeLabel(floorType) || floorType;
                let directionIcon = '';
                if (FLOOR_TYPES_NEED_DIRECTION.has(floorType)) {
                    const dir = meta?.floorDir || '';
                    if (dir && FLOOR_DIRECTION_ICONS[dir]) {
                        directionIcon = FLOOR_DIRECTION_ICONS[dir];
                    }
                } else if (floorType === 'vertical') {
                    directionIcon = '↕';
                } else if (floorType === 'horizontal') {
                    directionIcon = '↔';
                }
                const suffix = directionIcon
                    ? translateSandbox('map.cell.details.floorTypeDirectionSuffix', { icon: directionIcon }, `（${directionIcon}）`)
                    : '';
                detailParts.push(translateSandbox('map.cell.details.floorType', { label, suffix }, `床タイプ: ${label}${suffix}`));
            }
            if (meta?.floorColor) {
                detailParts.push(translateSandbox('map.cell.details.floorColor', { color: meta.floorColor }, `床色: ${meta.floorColor}`));
            }
        } else if (meta?.wallColor) {
            detailParts.push(translateSandbox('map.cell.details.wallColor', { color: meta.wallColor }, `壁色: ${meta.wallColor}`));
        }
        const enemiesHere = Array.isArray(state.enemies) ? state.enemies.filter(e => e.x === x && e.y === y) : [];
        if (enemiesHere.length) {
            let enemyDetail = '';
            if (enemiesHere.length === 1) {
                const enemy = enemiesHere[0];
                const name = (enemy.name || '').trim();
                if (name) {
                    enemyDetail = translateSandbox(
                        enemy.boss ? 'map.cell.details.enemy.singleNamedBoss' : 'map.cell.details.enemy.singleNamed',
                        { name },
                        enemy.boss ? `敵: ${name}（ボス）` : `敵: ${name}`
                    );
                } else {
                    enemyDetail = translateSandbox(
                        enemy.boss ? 'map.cell.details.enemy.singleBoss' : 'map.cell.details.enemy.single',
                        { count: 1 },
                        enemy.boss ? '敵: ボス1体' : '敵: 1体'
                    );
                }
            } else {
                const nameParts = enemiesHere
                    .map(e => {
                        const nm = (e.name || '').trim();
                        return nm ? `${nm}${e.boss ? translateSandbox('map.cell.details.enemy.bossSuffix', null, '（ボス）') : ''}` : '';
                    })
                    .filter(Boolean);
                if (nameParts.length === enemiesHere.length) {
                    const list = nameParts.join(translateSandbox('map.cell.details.enemy.nameSeparator', null, '、'));
                    enemyDetail = translateSandbox('map.cell.details.enemy.multipleNamed', { list }, `敵: ${list}`);
                } else {
                    const bossCount = enemiesHere.filter(e => e.boss).length;
                    if (bossCount && bossCount === enemiesHere.length) {
                        enemyDetail = translateSandbox('map.cell.details.enemy.multipleAllBoss', { count: enemiesHere.length }, `敵: ボス${enemiesHere.length}体`);
                    } else if (bossCount) {
                        enemyDetail = translateSandbox(
                            'map.cell.details.enemy.multipleWithBoss',
                            { count: enemiesHere.length, bossCount },
                            `敵: ${enemiesHere.length}体（ボス${bossCount}体含む）`
                        );
                    } else {
                        enemyDetail = translateSandbox('map.cell.details.enemy.multiple', { count: enemiesHere.length }, `敵: ${enemiesHere.length}体`);
                    }
                }
            }
            if (enemyDetail) detailParts.push(enemyDetail);
        }
        const domainsHere = Array.isArray(state.domainEffects) ? state.domainEffects.filter(e => e.x === x && e.y === y) : [];
        if (domainsHere.length) {
            const effectSeparator = translateSandbox('map.cell.details.domain.effectSeparator', null, '・');
            const domainSeparator = translateSandbox('map.cell.details.domain.separator', null, ' / ');
            const labels = domainsHere.map(effect => {
                const name = (effect.name || '').trim();
                const effects = Array.isArray(effect.effects) ? effect.effects.map(getDomainEffectLabel) : [];
                const effectLabel = effects.length
                    ? effects.join(effectSeparator)
                    : translateSandbox('map.cell.details.domain.effectNone', null, '効果なし');
                if (name) {
                    return translateSandbox('map.cell.details.domain.named', { name, effects: effectLabel }, `${name}: ${effectLabel}`);
                }
                return translateSandbox('map.cell.details.domain.unnamed', { effects: effectLabel }, effectLabel);
            });
            const summary = labels.join(domainSeparator);
            detailParts.push(translateSandbox('map.cell.details.domain.summary', { summary }, `領域: ${summary}`));
        }
        if (!detailParts.length) {
            return baseLabel;
        }
        const detailJoiner = translateSandbox('map.cell.details.joiner', null, ' / ');
        const detailText = detailParts.join(detailJoiner);
        return translateSandbox('map.cell.summary', { base: baseLabel, details: detailText }, `${baseLabel} - ${detailText}`);
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

                const gimmicksHere = Array.isArray(state.gimmicks)
                    ? state.gimmicks.filter(g => g && g.tile && g.tile.x === x && g.tile.y === y)
                    : [];
                if (gimmicksHere.length) {
                    const primary = gimmicksHere[0];
                    const iconGlyph = getGimmickIcon(primary.type);
                    const labelSource = getGimmickDisplayLabel(primary);
                    const labelSuffix = gimmicksHere.length > 1 ? `×${gimmicksHere.length}` : '';
                    const labelTextRaw = labelSuffix ? `${labelSource}${labelSuffix}` : labelSource;
                    const labelText = labelTextRaw ? labelTextRaw.slice(0, 8) : '';
                    const textColor = '#0f172a';
                    const iconFont = Math.max(12, Math.floor(cellSize * 0.44));
                    ctx.font = `700 ${iconFont}px 'Segoe UI', 'Hiragino Sans', 'ヒラギノ角ゴ ProN', 'Noto Sans JP', sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = textColor;
                    const iconY = originY + cellSize * (labelText ? 0.38 : 0.5);
                    ctx.fillText(iconGlyph, originX + cellSize / 2, iconY);

                    if (labelText) {
                        const labelFont = Math.max(9, Math.floor(cellSize * 0.28));
                        ctx.font = `600 ${labelFont}px 'Segoe UI', 'Hiragino Sans', 'ヒラギノ角ゴ ProN', 'Noto Sans JP', sans-serif`;
                        ctx.fillText(labelText, originX + cellSize / 2, originY + cellSize * 0.78);
                    }

                    if (state.selectedGimmickId && gimmicksHere.some(g => g.id === state.selectedGimmickId)) {
                        ctx.save();
                        ctx.strokeStyle = '#2563eb';
                        ctx.lineWidth = 1.4;
                        ctx.strokeRect(originX + 2.5, originY + 2.5, cellSize - 5, cellSize - 5);
                        ctx.restore();
                    }
                }
            }
        }

        updateViewConstraints();
    }

    function getGridContentMetrics() {
        if (!refs?.grid) return null;
        const rect = refs.grid.getBoundingClientRect();
        const width = Math.max(0, rect.width);
        const height = Math.max(0, rect.height);
        return {
            rect,
            width,
            height,
            contentLeft: rect.left,
            contentTop: rect.top
        };
    }

    function clampViewOffset() {
        if (!state?.view || !state.renderMetrics || !refs?.grid) return;
        const metrics = getGridContentMetrics();
        if (!metrics) return;
        const { width: viewWidth, height: viewHeight } = metrics;
        const scaledWidth = (state.renderMetrics.width || 0) * (state.view.scale || 1);
        const scaledHeight = (state.renderMetrics.height || 0) * (state.view.scale || 1);
        const minX = Math.min(0, viewWidth - scaledWidth);
        const minY = Math.min(0, viewHeight - scaledHeight);
        state.view.offsetX = clamp(minX, viewWidth > 0 ? viewWidth : 0, state.view.offsetX);
        state.view.offsetY = clamp(minY, viewHeight > 0 ? viewHeight : 0, state.view.offsetY);
    }

    function applyViewportTransform() {
        if (!refs?.gridCanvas || !state?.view) return;
        refs.gridCanvas.style.transformOrigin = '0 0';
        refs.gridCanvas.style.transform = `translate(${state.view.offsetX}px, ${state.view.offsetY}px) scale(${state.view.scale})`;
    }

    function updateViewConstraints({ forceFit = false } = {}) {
        if (!state) return;
        if (!state.view) state.view = defaultView();
        const metrics = getGridContentMetrics();
        if (!metrics || !state.renderMetrics) return;
        const { width: viewWidth, height: viewHeight } = metrics;
        const mapWidth = state.renderMetrics.width || 1;
        const mapHeight = state.renderMetrics.height || 1;
        if (!viewWidth || !viewHeight) return;

        const fitScale = Math.min(viewWidth / mapWidth, viewHeight / mapHeight, 1);
        const minScale = Math.max(0.25, fitScale * 0.5);
        const maxScale = Math.max(1.5, fitScale * 4);
        state.view.minScale = minScale;
        state.view.maxScale = maxScale;

        if (forceFit || state.view.needsFit || !state.view.initialized) {
            const scale = clamp(minScale, maxScale, fitScale);
            const offsetX = (viewWidth - mapWidth * scale) / 2;
            const offsetY = (viewHeight - mapHeight * scale) / 2;
            state.view.scale = scale;
            state.view.offsetX = offsetX;
            state.view.offsetY = offsetY;
            state.view.needsFit = false;
            state.view.initialized = true;
        } else {
            clampViewOffset();
        }
        applyViewportTransform();
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
        const metrics = getGridContentMetrics();
        if (!metrics || !state?.view) return null;
        const { contentLeft, contentTop } = metrics;
        const px = event.clientX - contentLeft;
        const py = event.clientY - contentTop;
        const worldX = (px - state.view.offsetX) / state.view.scale;
        const worldY = (py - state.view.offsetY) / state.view.scale;
        return getCellFromOffset(worldX, worldY);
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
        const fallbackText = translateSandbox('map.selectedCell.hint', null, 'セルをクリックして編集します。');
        const description = state.lastCell ? describeCell(state.lastCell.x, state.lastCell.y) : '';
        if (refs.selectedCell) {
            if (state.lastCell && description) {
                refs.selectedCell.textContent = translateSandbox(
                    'map.selectedCell.selectedWithDescription',
                    { description },
                    `選択セル: ${description}`
                );
            } else if (state.lastCell) {
                refs.selectedCell.textContent = translateSandbox(
                    'map.selectedCell.selected',
                    { x: state.lastCell.x, y: state.lastCell.y },
                    `選択セル: (${state.lastCell.x}, ${state.lastCell.y})`
                );
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
        refs.playerPreview.textContent = ts('playerPreview.stats', 'HP {hp} / 攻撃 {attack} / 防御 {defense}', {
            hp: stats.maxHp,
            attack: stats.attack,
            defense: stats.defense
        });
    }

    function renderEnemies() {
        if (!refs.enemyList) return;
        refs.enemyList.innerHTML = '';
        if (!state.enemies.length) {
            const empty = document.createElement('p');
            empty.textContent = ts('enemies.empty', '敵は未配置です。「敵を追加」ボタンから追加してください。');
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
            title.textContent = enemy.name || ts('enemies.defaultName', '敵{index}', { index: index + 1 });
            header.appendChild(title);

            const actions = document.createElement('div');
            actions.className = 'sandbox-enemy-actions';
            const selectBtn = document.createElement('button');
            selectBtn.type = 'button';
            selectBtn.className = 'select';
            selectBtn.textContent = ts('common.actions.select', '選択');
            selectBtn.addEventListener('click', () => {
                state.selectedEnemyId = enemy.id;
                render();
            });
            actions.appendChild(selectBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'delete';
            deleteBtn.textContent = ts('common.actions.delete', '削除');
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
                    label: ts('enemies.fields.name', '名前'),
                    type: 'text',
                    value: enemy.name || '',
                    handler: (val) => { enemy.name = val; render(); }
                },
                {
                    key: 'level',
                    label: ts('enemies.fields.level', 'レベル'),
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
                    label: ts('enemies.fields.hp', 'HP'),
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
                    label: ts('enemies.fields.attack', '攻撃'),
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
                    label: ts('enemies.fields.defense', '防御'),
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
                    label: ts('enemies.fields.x', 'X座標'),
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
                    label: ts('enemies.fields.y', 'Y座標'),
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
            bossLabel.appendChild(document.createTextNode(ts('enemies.fields.boss', 'ボス扱い')));
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
            empty.textContent = ts('domains.empty', 'クリスタルは未配置です。「クリスタルを追加」ボタンから追加してください。');
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
            title.textContent = (effect.name || '').trim() || ts('domains.defaultName', 'クリスタル{index}', { index: index + 1 });
            header.appendChild(title);

            const actions = document.createElement('div');
            actions.className = 'sandbox-domain-actions';

            const selectBtn = document.createElement('button');
            selectBtn.type = 'button';
            selectBtn.className = 'select';
            selectBtn.textContent = ts('common.actions.select', '選択');
            selectBtn.addEventListener('click', () => {
                state.selectedDomainId = effect.id;
                render();
            });
            actions.appendChild(selectBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'delete';
            deleteBtn.textContent = ts('common.actions.delete', '削除');
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
            nameLabel.textContent = ts('domains.fields.name', '名前');
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
            radiusLabel.textContent = ts('domains.fields.radius', '半径');
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
            xLabel.textContent = ts('common.axes.x', 'X');
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
            yLabel.textContent = ts('common.axes.y', 'Y');
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
            effectsLabel.textContent = ts('domains.fields.effects', '効果');
            const effectSelect = document.createElement('select');
            effectSelect.multiple = true;
            effectSelect.size = Math.min(6, DOMAIN_EFFECT_OPTIONS.length);
            DOMAIN_EFFECT_OPTIONS.forEach(option => {
                const opt = document.createElement('option');
                opt.value = option.id;
                opt.textContent = getDomainEffectLabel(option.id);
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
                paramLabel.textContent = ts('domains.params.target', '{effect}の対象', {
                    effect: getDomainEffectLabel(effectId)
                });
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
            empty.textContent = ts('portals.empty', 'ポータルは未配置です。「ポータルを追加」ボタンから追加してください。');
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
            title.textContent = (portal.label || '').trim() || ts('portals.defaultName', 'ポータル{index}', { index: index + 1 });
            header.appendChild(title);

            const actions = document.createElement('div');
            actions.className = 'sandbox-portal-actions';

            const selectBtn = document.createElement('button');
            selectBtn.type = 'button';
            selectBtn.className = 'select';
            selectBtn.textContent = ts('common.actions.select', '選択');
            selectBtn.addEventListener('click', () => {
                state.selectedPortalId = portal.id;
                state.brush = portal.type === 'stairs' ? 'stairs' : 'gate';
                render();
            });
            actions.appendChild(selectBtn);

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'delete';
            deleteBtn.textContent = ts('common.actions.delete', '削除');
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
            nameLabel.textContent = ts('portals.fields.name', '名前');
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
            typeLabel.textContent = ts('portals.fields.type', '種類');
            const typeSelect = document.createElement('select');
            ['stairs', 'gate'].forEach(type => {
                const opt = document.createElement('option');
                opt.value = type;
                opt.textContent = type === 'stairs'
                    ? ts('portals.types.stairs', '階段')
                    : ts('portals.types.gate', 'ゲート');
                if (portal.type === type) opt.selected = true;
                typeSelect.appendChild(opt);
            });
            typeSelect.addEventListener('change', (e) => {
                portal.type = e.target.value === 'gate' ? 'gate' : 'stairs';
                if (portal.type === 'stairs' && (!portal.label || portal.label === ts('portals.types.gate', 'ゲート'))) {
                    portal.label = ts('portals.types.stairs', '階段');
                }
                if (portal.type === 'gate' && (!portal.label || portal.label === ts('portals.types.stairs', '階段'))) {
                    portal.label = ts('portals.types.gate', 'ゲート');
                }
                state.brush = portal.type === 'stairs' ? 'stairs' : 'gate';
                renderPortals();
                renderMapList();
            });
            typeLabel.appendChild(typeSelect);
            grid.appendChild(typeLabel);

            const targetLabel = document.createElement('label');
            targetLabel.textContent = ts('portals.fields.targetMap', '接続先マップ');
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
            targetXLabel.textContent = ts('portals.fields.targetX', '接続X');
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
            targetYLabel.textContent = ts('portals.fields.targetY', '接続Y');
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

    function parseTagString(value) {
        if (typeof value !== 'string' || !value.trim()) return [];
        return value.split(',')
            .map(tag => tag.trim())
            .filter(Boolean)
            .map(tag => tag.slice(0, 24))
            .slice(0, 8);
    }

    function formatTagString(tags) {
        if (!Array.isArray(tags) || !tags.length) return '';
        return tags.join(', ');
    }

    function setSelectedGimmickId(gimmickId) {
        ensureGimmickCollections();
        if (!Array.isArray(state.gimmicks) || !state.gimmicks.length) {
            state.selectedGimmickId = null;
            return;
        }
        if (!gimmickId || !state.gimmicks.some(gimmick => gimmick.id === gimmickId)) {
            state.selectedGimmickId = state.gimmicks[0].id;
        } else {
            state.selectedGimmickId = gimmickId;
        }
    }

    function setSelectedWireId(wireId) {
        ensureGimmickCollections();
        if (!Array.isArray(state.wires) || !state.wires.length) {
            state.selectedWireId = null;
            return;
        }
        if (!wireId || !state.wires.some(wire => wire.id === wireId)) {
            state.selectedWireId = state.wires[0].id;
        } else {
            state.selectedWireId = wireId;
        }
    }

    function renderGimmickPanel() {
        setSelectedGimmickId(state.selectedGimmickId);
        setSelectedWireId(state.selectedWireId);
        renderGimmickList();
        renderGimmickDetail();
        renderWireList();
        renderWireEditor();
    }

    function renderGimmickList() {
        if (!refs.gimmickList) return;
        ensureGimmickCollections();
        refs.gimmickList.innerHTML = '';
        if (!state.gimmicks.length) {
            const empty = document.createElement('p');
            empty.className = 'sandbox-wire-empty';
            empty.textContent = ts('gimmicks.empty', 'ギミックがありません。右上のボタンから追加してください。');
            refs.gimmickList.appendChild(empty);
            return;
        }

        const fragment = document.createDocumentFragment();
        state.gimmicks.forEach(gimmick => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'sandbox-gimmick-item';
            if (state.selectedGimmickId === gimmick.id) {
                button.classList.add('selected');
            }
            button.dataset.gimmickId = gimmick.id;

            const titleRow = document.createElement('div');
            titleRow.className = 'sandbox-gimmick-item-title';
            const mainSpan = document.createElement('span');
            mainSpan.className = 'sandbox-gimmick-item-main';
            const iconSpan = document.createElement('span');
            iconSpan.className = 'sandbox-gimmick-item-icon';
            iconSpan.textContent = getGimmickIcon(gimmick.type);
            const nameSpan = document.createElement('span');
            nameSpan.className = 'sandbox-gimmick-item-name';
            nameSpan.textContent = getGimmickDisplayLabel(gimmick);
            mainSpan.appendChild(iconSpan);
            mainSpan.appendChild(nameSpan);
            const typeSpan = document.createElement('span');
            typeSpan.className = 'sandbox-gimmick-item-type';
            typeSpan.textContent = getGimmickDefinition(gimmick.type)?.label || gimmick.type;
            titleRow.appendChild(mainSpan);
            titleRow.appendChild(typeSpan);
            button.appendChild(titleRow);

            if (gimmick.tags?.length) {
                const tags = document.createElement('div');
                tags.className = 'sandbox-gimmick-item-tags';
                tags.textContent = gimmick.tags.join(', ');
                button.appendChild(tags);
            }

            button.addEventListener('click', () => {
                setSelectedGimmickId(gimmick.id);
                state.pendingWire = null;
                render();
            });

            fragment.appendChild(button);
        });
        refs.gimmickList.appendChild(fragment);
    }

    function renderGimmickDetail() {
        if (!refs.gimmickForm) return;
        ensureGimmickCollections();
        const gimmick = getGimmickById(state.selectedGimmickId);
        const inputs = [
            refs.gimmickNameInput,
            refs.gimmickTagsInput,
            refs.gimmickLockedInput,
            refs.gimmickTileXInput,
            refs.gimmickTileYInput,
            refs.gimmickUseSelectedButton,
            refs.gimmickClearTileButton,
            refs.gimmickNotesInput,
            refs.gimmickDuplicateButton,
            refs.gimmickDeleteButton
        ];
        const disabled = !gimmick;
        inputs.forEach(input => {
            if (!input) return;
            if ('disabled' in input) {
                input.disabled = disabled;
            }
        });
        if (refs.gimmickTypeDisplay) {
            if (gimmick) {
                const typeLabel = getGimmickDefinition(gimmick.type)?.label || gimmick.type;
                refs.gimmickTypeDisplay.value = `${getGimmickIcon(gimmick.type)} ${typeLabel}`.trim();
            } else {
                refs.gimmickTypeDisplay.value = '';
            }
        }
        if (!gimmick) {
            if (refs.gimmickNameInput) refs.gimmickNameInput.value = '';
            if (refs.gimmickTagsInput) refs.gimmickTagsInput.value = '';
            if (refs.gimmickLockedInput) refs.gimmickLockedInput.checked = false;
            if (refs.gimmickTileXInput) refs.gimmickTileXInput.value = '';
            if (refs.gimmickTileYInput) refs.gimmickTileYInput.value = '';
            if (refs.gimmickNotesInput) refs.gimmickNotesInput.value = '';
            if (refs.gimmickConfigFields) refs.gimmickConfigFields.innerHTML = '';
            return;
        }

        if (refs.gimmickNameInput) refs.gimmickNameInput.value = gimmick.name || '';
        if (refs.gimmickTagsInput) refs.gimmickTagsInput.value = formatTagString(gimmick.tags);
        if (refs.gimmickLockedInput) refs.gimmickLockedInput.checked = !!gimmick.locked;
        if (refs.gimmickTileXInput) refs.gimmickTileXInput.value = Number.isFinite(gimmick.tile?.x) ? gimmick.tile.x : '';
        if (refs.gimmickTileYInput) refs.gimmickTileYInput.value = Number.isFinite(gimmick.tile?.y) ? gimmick.tile.y : '';
        if (refs.gimmickNotesInput) refs.gimmickNotesInput.value = gimmick.notes || '';
        renderGimmickConfigFields(gimmick);
    }

    function renderGimmickConfigFields(gimmick) {
        if (!refs.gimmickConfigFields) return;
        refs.gimmickConfigFields.innerHTML = '';
        if (!gimmick) return;
        const definition = getGimmickDefinition(gimmick.type);
        const fields = Array.isArray(definition.configFields) ? definition.configFields : [];
        if (!fields.length) {
            const placeholder = document.createElement('p');
            placeholder.className = 'sandbox-wire-empty';
            placeholder.textContent = ts('gimmicks.config.noAdditionalSettings', '追加設定はありません。');
            refs.gimmickConfigFields.appendChild(placeholder);
            return;
        }
        const fragment = document.createDocumentFragment();
        fields.forEach(field => {
            const wrapper = document.createElement('label');
            wrapper.className = 'sandbox-config-field';
            wrapper.dataset.fieldId = field.id;
            const title = document.createElement('span');
            title.textContent = field.label || field.id;
            wrapper.appendChild(title);
            let control;
            const currentValue = gimmick.config?.[field.id];
            switch (field.type) {
                case 'number': {
                    control = document.createElement('input');
                    control.type = 'number';
                    if (Number.isFinite(field.min)) control.min = String(field.min);
                    if (Number.isFinite(field.max)) control.max = String(field.max);
                    if (Number.isFinite(field.step)) control.step = String(field.step);
                    control.value = Number.isFinite(currentValue) ? currentValue : (field.min ?? 0);
                    control.addEventListener('change', () => {
                        const value = sanitizeGimmickFieldValue(field, control.value);
                        gimmick.config[field.id] = value;
                        cleanupInvalidWires();
                        render();
                    });
                    break;
                }
                case 'boolean': {
                    control = document.createElement('input');
                    control.type = 'checkbox';
                    control.checked = !!currentValue;
                    control.addEventListener('change', () => {
                        gimmick.config[field.id] = control.checked;
                        cleanupInvalidWires();
                        render();
                    });
                    break;
                }
                case 'select': {
                    control = document.createElement('select');
                    const options = Array.isArray(field.options) ? field.options : [];
                    options.forEach(option => {
                        const opt = document.createElement('option');
                        opt.value = option.value;
                        opt.textContent = option.label || option.value;
                        control.appendChild(opt);
                    });
                    control.value = typeof currentValue === 'string' && options.some(opt => opt.value === currentValue)
                        ? currentValue
                        : (options[0]?.value || '');
                    control.addEventListener('change', () => {
                        gimmick.config[field.id] = control.value;
                        cleanupInvalidWires();
                        render();
                    });
                    break;
                }
                case 'textarea': {
                    control = document.createElement('textarea');
                    control.rows = field.rows || 6;
                    if (Number.isFinite(field.maxLength)) control.maxLength = field.maxLength;
                    control.value = typeof currentValue === 'string' ? currentValue : '';
                    control.addEventListener('input', () => {
                        gimmick.config[field.id] = control.value;
                    });
                    control.addEventListener('blur', () => {
                        cleanupInvalidWires();
                        render();
                    });
                    break;
                }
                default: {
                    control = document.createElement('input');
                    control.type = 'text';
                    if (Number.isFinite(field.maxLength)) control.maxLength = field.maxLength;
                    control.value = typeof currentValue === 'string' ? currentValue : '';
                    control.addEventListener('input', () => {
                        gimmick.config[field.id] = control.value;
                    });
                    control.addEventListener('blur', () => {
                        cleanupInvalidWires();
                        render();
                    });
                }
            }
            control.classList.add('sandbox-config-control');
            wrapper.appendChild(control);
            fragment.appendChild(wrapper);
        });
        refs.gimmickConfigFields.appendChild(fragment);
    }

    function renderWireList() {
        if (!refs.wireList) return;
        ensureGimmickCollections();
        refs.wireList.innerHTML = '';
        if (!state.wires.length) {
            const empty = document.createElement('p');
            empty.className = 'sandbox-wire-empty';
            empty.textContent = ts('wires.empty', '接続はありません。出力ポートをクリックして接続を作成してください。');
            refs.wireList.appendChild(empty);
            return;
        }
        state.wires.forEach(wire => {
            const item = document.createElement('div');
            item.className = 'sandbox-wire-item';
            if (state.selectedWireId === wire.id) {
                item.classList.add('selected');
            }
            item.dataset.wireId = wire.id;
            const source = getGimmickById(wire.source?.gimmickId);
            const target = getGimmickById(wire.target?.gimmickId);
            const sourceLabel = source
                ? `${getGimmickDisplayLabel(source)}.${getOutputPortLabel(source, wire.source.portId)}`
                : `${wire.source?.gimmickId || '?'}:${wire.source?.portId || '?'}`;
            const targetLabel = target
                ? `${getGimmickDisplayLabel(target)}.${getInputPortLabel(target, wire.target.portId)}`
                : `${wire.target?.gimmickId || '?'}:${wire.target?.portId || '?'}`;
            const signalKey = wire.signal === 'pulse' ? 'pulse' : (wire.signal === 'value' ? 'value' : 'binary');
            const signalLabel = ts(`wires.signal.${signalKey}`, signalKey === 'pulse' ? 'Pulse' : signalKey === 'value' ? 'Value' : 'Binary');
            const sourceIcon = source ? getGimmickIcon(source.type) : '⚙️';
            const targetIcon = target ? getGimmickIcon(target.type) : '⚙️';
            const text = document.createElement('span');
            text.textContent = `${sourceIcon} ${sourceLabel} → ${targetIcon} ${targetLabel} (${signalLabel})`;
            const remove = document.createElement('button');
            remove.type = 'button';
            remove.textContent = ts('common.actions.delete', '削除');
            remove.addEventListener('click', (event) => {
                event.stopPropagation();
                removeWire(wire.id);
                render();
            });
            item.appendChild(text);
            item.appendChild(remove);
            item.addEventListener('click', () => {
                setSelectedWireId(wire.id);
                state.pendingWire = null;
                render();
            });
            refs.wireList.appendChild(item);
        });
    }

    function getWireEditorMetrics() {
        if (!refs.wireEditor) return null;
        const rect = refs.wireEditor.getBoundingClientRect();
        const margin = 40;
        const statusHeight = refs.wireStatusbar?.offsetHeight || 48;
        const width = rect.width;
        const height = rect.height;
        const usableWidth = Math.max(10, width - margin * 2);
        const usableHeight = Math.max(10, height - statusHeight - margin * 2);
        return { rect, width, height, margin, statusHeight, usableWidth, usableHeight };
    }

    function applyNodePosition(nodeEl, layout, metrics) {
        if (!nodeEl || !metrics) return;
        const normX = clamp(0, 1, Number(layout?.x) || 0.5);
        const normY = clamp(0, 1, Number(layout?.y) || 0.5);
        const centerX = metrics.margin + normX * metrics.usableWidth;
        const centerY = metrics.margin + normY * metrics.usableHeight;
        nodeEl.style.left = `${centerX}px`;
        nodeEl.style.top = `${centerY}px`;
        nodeEl.style.transform = 'translate(-50%, -50%)';
    }

    function renderWireEditor() {
        if (!refs.wireEditor || !refs.wireNodes || !refs.wireCanvas) return;
        ensureGimmickCollections();
        cleanupInvalidWires();
        refs.wireNodes.innerHTML = '';
        refs.wireCanvas.innerHTML = '';

        if (!state.gimmicks.length) {
            updateWireStatus();
            return;
        }

        const metrics = getWireEditorMetrics();
        if (!metrics) return;
        const fragment = document.createDocumentFragment();
        state.gimmicks.forEach(gimmick => {
            fragment.appendChild(createWireNode(gimmick, metrics));
        });
        refs.wireNodes.appendChild(fragment);
        renderWireLines(metrics);
        updateWireStatus();
    }

    function createWireNode(gimmick, metrics) {
        const node = document.createElement('div');
        node.className = 'sandbox-wire-node';
        node.dataset.gimmickId = gimmick.id;
        if (state.selectedGimmickId === gimmick.id) {
            node.classList.add('selected');
        }
        const headerRow = document.createElement('div');
        headerRow.className = 'sandbox-wire-node-header';
        const iconSpan = document.createElement('span');
        iconSpan.className = 'sandbox-wire-node-icon';
        iconSpan.textContent = getGimmickIcon(gimmick.type);
        const nameSpan = document.createElement('span');
        nameSpan.className = 'sandbox-wire-node-name';
        nameSpan.textContent = getGimmickDisplayLabel(gimmick);
        headerRow.appendChild(iconSpan);
        headerRow.appendChild(nameSpan);
        node.appendChild(headerRow);
        const typeLabel = document.createElement('span');
        typeLabel.className = 'sandbox-wire-node-type';
        typeLabel.textContent = getGimmickDefinition(gimmick.type)?.label || gimmick.type;
        node.appendChild(typeLabel);

        const portsWrapper = document.createElement('div');
        portsWrapper.className = 'sandbox-wire-ports-wrapper';

        const inputsContainer = document.createElement('div');
        inputsContainer.className = 'sandbox-wire-ports inputs';
        resolveGimmickInputPorts(gimmick).forEach(port => {
            const portEl = document.createElement('div');
            portEl.className = 'sandbox-wire-port input';
            portEl.dataset.portKey = `${gimmick.id}:${port.id}:input`;
            portEl.dataset.gimmickId = gimmick.id;
            portEl.dataset.portId = port.id;
            portEl.dataset.direction = 'input';
            const button = document.createElement('span');
            button.className = 'sandbox-wire-port-button input';
            const label = document.createElement('span');
            label.textContent = port.label;
            portEl.appendChild(button);
            portEl.appendChild(label);
            portEl.addEventListener('click', (event) => {
                event.stopPropagation();
                handleWirePortClick(gimmick.id, port.id, 'input');
            });
            inputsContainer.appendChild(portEl);
        });

        const outputsContainer = document.createElement('div');
        outputsContainer.className = 'sandbox-wire-ports outputs';
        resolveGimmickOutputPorts(gimmick).forEach(port => {
            const portEl = document.createElement('div');
            portEl.className = 'sandbox-wire-port output';
            portEl.dataset.portKey = `${gimmick.id}:${port.id}:output`;
            portEl.dataset.gimmickId = gimmick.id;
            portEl.dataset.portId = port.id;
            portEl.dataset.direction = 'output';
            const button = document.createElement('span');
            button.className = 'sandbox-wire-port-button output';
            if (state.pendingWire?.source?.gimmickId === gimmick.id && state.pendingWire?.source?.portId === port.id) {
                button.classList.add('pending');
            }
            const label = document.createElement('span');
            label.textContent = port.label;
            portEl.appendChild(button);
            portEl.appendChild(label);
            portEl.addEventListener('click', (event) => {
                event.stopPropagation();
                handleWirePortClick(gimmick.id, port.id, 'output');
            });
            outputsContainer.appendChild(portEl);
        });

        portsWrapper.appendChild(inputsContainer);
        portsWrapper.appendChild(outputsContainer);
        node.appendChild(portsWrapper);

        node.addEventListener('pointerdown', (event) => {
            if (event.button !== 0) return;
            if (event.target.closest('.sandbox-wire-port')) return;
            handleWireNodeDragStart(event, gimmick.id, node);
        });

        node.addEventListener('click', (event) => {
            if (event.target.closest('.sandbox-wire-port')) return;
            if (node.dataset.dragged === '1') {
                node.dataset.dragged = '0';
                return;
            }
            state.pendingWire = null;
            setSelectedGimmickId(gimmick.id);
            render();
        });

        applyNodePosition(node, gimmick.layout, metrics);
        return node;
    }

    function renderWireLines(metrics) {
        if (!metrics) return;
        const svg = refs.wireCanvas;
        svg.setAttribute('width', String(metrics.width));
        svg.setAttribute('height', String(metrics.height));
        svg.innerHTML = '';
        state.wires.forEach(wire => {
            const sourceKey = `${wire.source?.gimmickId}:${wire.source?.portId}:output`;
            const targetKey = `${wire.target?.gimmickId}:${wire.target?.portId}:input`;
            const sourceEl = refs.wireNodes.querySelector(`[data-port-key="${sourceKey}"]`);
            const targetEl = refs.wireNodes.querySelector(`[data-port-key="${targetKey}"]`);
            if (!sourceEl || !targetEl) return;
            const sourceRect = sourceEl.getBoundingClientRect();
            const targetRect = targetEl.getBoundingClientRect();
            const editorRect = metrics.rect;
            const x1 = sourceRect.left + sourceRect.width / 2 - editorRect.left;
            const y1 = sourceRect.top + sourceRect.height / 2 - editorRect.top;
            const x2 = targetRect.left + targetRect.width / 2 - editorRect.left;
            const y2 = targetRect.top + targetRect.height / 2 - editorRect.top;
            const delta = Math.abs(x2 - x1);
            const c1x = x1 + Math.max(60, delta * 0.35);
            const c2x = x2 - Math.max(60, delta * 0.35);
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', `M ${x1} ${y1} C ${c1x} ${y1}, ${c2x} ${y2}, ${x2} ${y2}`);
            path.classList.add('sandbox-wire-path');
            if (wire.signal === 'pulse') path.classList.add('signal-pulse');
            if (wire.signal === 'value') path.classList.add('signal-value');
            if (wire.id === state.selectedWireId) path.classList.add('selected');
            path.dataset.wireId = wire.id;
            path.addEventListener('click', (event) => {
                event.stopPropagation();
                setSelectedWireId(wire.id);
                state.pendingWire = null;
                render();
            });
            svg.appendChild(path);
        });
    }

    function updateWireStatus(message) {
        if (!refs.wireStatus) return;
        if (typeof message === 'string') {
            refs.wireStatus.textContent = message;
            return;
        }
        if (state.pendingWire?.source) {
            const source = getGimmickById(state.pendingWire.source.gimmickId);
            const fallbackLabel = ts('wires.status.outputPort', '出力ポート');
            const label = source
                ? `${getGimmickDisplayLabel(source)}.${getOutputPortLabel(source, state.pendingWire.source.portId)}`
                : fallbackLabel;
            refs.wireStatus.textContent = ts('wires.status.selectTarget', '{label} の接続先をクリックしてください。', { label });
            return;
        }
        if (state.selectedWireId) {
            const wire = getWireById(state.selectedWireId);
            if (wire) {
                const src = getGimmickById(wire.source?.gimmickId);
                const tgt = getGimmickById(wire.target?.gimmickId);
                const srcLabel = src
                    ? `${getGimmickDisplayLabel(src)}.${getOutputPortLabel(src, wire.source.portId)}`
                    : `${wire.source?.gimmickId || '?'}:${wire.source?.portId || '?'}`;
                const tgtLabel = tgt
                    ? `${getGimmickDisplayLabel(tgt)}.${getInputPortLabel(tgt, wire.target.portId)}`
                    : `${wire.target?.gimmickId || '?'}:${wire.target?.portId || '?'}`;
                refs.wireStatus.textContent = `${srcLabel} → ${tgtLabel}`;
                return;
            }
        }
        if (!state.gimmicks.length) {
            refs.wireStatus.textContent = ts('wires.status.addGimmick', 'ギミックを追加すると接続を設定できます。');
        } else {
            refs.wireStatus.textContent = ts('wires.status.ready', '出力ポートをクリックして新しい接続を作成できます。');
        }
    }

    function handleWirePortClick(gimmickId, portId, direction) {
        if (direction === 'output') {
            if (state.pendingWire?.source?.gimmickId === gimmickId && state.pendingWire?.source?.portId === portId) {
                state.pendingWire = null;
            } else {
                state.pendingWire = { source: { gimmickId, portId } };
                state.selectedWireId = null;
            }
            updateWireStatus();
            renderWireEditor();
            return;
        }
        if (!state.pendingWire?.source) {
            state.selectedWireId = null;
            state.pendingWire = null;
            updateWireStatus(ts('wires.status.selectOutputFirst', '先に出力ポートを選択してください。'));
            return;
        }
        if (state.pendingWire.source.gimmickId === gimmickId && state.pendingWire.source.portId === portId) {
            updateWireStatus(ts('wires.status.samePort', '同じポート同士は接続できません。'));
            return;
        }
        addWireConnection(state.pendingWire.source.gimmickId, state.pendingWire.source.portId, gimmickId, portId);
        state.pendingWire = null;
        render();
    }

    function handleWireNodeDragStart(event, gimmickId, nodeEl) {
        const metrics = getWireEditorMetrics();
        if (!metrics) return;
        const dragState = {
            pointerId: event.pointerId,
            gimmickId,
            metrics,
            moved: false
        };
        state.wireEditor.drag = dragState;
        nodeEl.classList.add('sandbox-wire-node-dragging');
        nodeEl.dataset.dragged = '0';
        const handleMove = (moveEvent) => {
            if (moveEvent.pointerId !== dragState.pointerId) return;
            dragState.moved = true;
            const layout = computeLayoutFromPointer(moveEvent, dragState.metrics);
            const gimmick = getGimmickById(gimmickId);
            if (!gimmick) return;
            gimmick.layout = layout;
            applyNodePosition(nodeEl, layout, dragState.metrics);
            renderWireLines(dragState.metrics);
            moveEvent.preventDefault();
        };
        const handleUp = (upEvent) => {
            if (upEvent.pointerId !== dragState.pointerId) return;
            nodeEl.classList.remove('sandbox-wire-node-dragging');
            nodeEl.releasePointerCapture(dragState.pointerId);
            nodeEl.removeEventListener('pointermove', handleMove);
            nodeEl.removeEventListener('pointerup', handleUp);
            nodeEl.removeEventListener('pointercancel', handleUp);
            state.wireEditor.drag = null;
             nodeEl.dataset.dragged = dragState.moved ? '1' : '0';
            renderWireLines(dragState.metrics);
        };
        nodeEl.addEventListener('pointermove', handleMove);
        nodeEl.addEventListener('pointerup', handleUp);
        nodeEl.addEventListener('pointercancel', handleUp);
        nodeEl.setPointerCapture(event.pointerId);
    }

    function computeLayoutFromPointer(event, metrics) {
        const x = clamp(metrics.margin, metrics.margin + metrics.usableWidth, event.clientX - metrics.rect.left);
        const y = clamp(metrics.margin, metrics.margin + metrics.usableHeight, event.clientY - metrics.rect.top);
        const layoutX = metrics.usableWidth > 0 ? (x - metrics.margin) / metrics.usableWidth : 0.5;
        const layoutY = metrics.usableHeight > 0 ? (y - metrics.margin) / metrics.usableHeight : 0.5;
        return { x: clamp(0, 1, layoutX), y: clamp(0, 1, layoutY) };
    }

    function handleWireEditorBackgroundClick(event) {
        if (!refs.wireEditor) return;
        if (event.target.closest('.sandbox-wire-node') || event.target.closest('.sandbox-wire-port') || event.target.closest('.sandbox-wire-path')) return;
        state.selectedWireId = null;
        state.pendingWire = null;
        updateWireStatus();
        renderWireEditor();
        renderWireList();
    }

    function renderColorPalette() {
        if (!refs.colorPalette) return;
        const paletteEl = refs.colorPalette;
        paletteEl.innerHTML = '';
        if (!Array.isArray(state.colorPalette) || !state.colorPalette.length) {
            const note = document.createElement('p');
            note.className = 'sandbox-note';
            note.textContent = ts('palette.empty', '保存したカラーがありません。');
            paletteEl.appendChild(note);
            return;
        }
        state.colorPalette.forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = 'sandbox-palette-item';
            const applyBtn = document.createElement('button');
            applyBtn.type = 'button';
            applyBtn.className = 'sandbox-palette-apply';
            applyBtn.setAttribute('aria-label', ts('palette.apply', 'カラーを適用'));
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
            removeBtn.setAttribute('aria-label', ts('palette.remove', 'カラーを削除'));
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
            label: getPortalTypeLabel('gate'),
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
            note.textContent = ts('nodeMap.empty', 'マップがありません。');
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
            empty.textContent = ts('maps.empty', 'マップがありません。「マップ追加」で新規作成してください。');
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
                ? ts('validation.enemies.overLimit', '敵の上限（{max}体）を超えています。敵を減らしてください。', { max: maxEnemies })
                : ts('validation.enemies.limitReached', '敵の上限（{max}体）に達しています。新たに追加するには既存の敵を削除してください。', { max: maxEnemies });
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
            ok.textContent = ts('validation.ready', '✅ 開始できます');
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
        renderGimmickPanel();
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
        if (state.eyedropper?.active && cell) {
            event.preventDefault();
            applyEyedropper(cell.x, cell.y);
            state.eyedropper.active = false;
            if (refs.eyedropperButton) refs.eyedropperButton.classList.remove('active');
            render();
            return;
        }
        if (state.brush === 'select') {
            if (cell) {
                setSelectedCell(cell.x, cell.y);
                render();
            }
            panState.active = true;
            panState.pointerId = event.pointerId;
            panState.lastX = event.clientX;
            panState.lastY = event.clientY;
            panState.moved = false;
            panState.blockClick = false;
            if (refs.gridCanvas && typeof refs.gridCanvas.setPointerCapture === 'function') {
                try {
                    refs.gridCanvas.setPointerCapture(event.pointerId);
                } catch (err) {}
            }
            event.preventDefault();
            return;
        }
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
        if (panState.active && panState.pointerId === event.pointerId) {
            const dx = event.clientX - panState.lastX;
            const dy = event.clientY - panState.lastY;
            if (dx !== 0 || dy !== 0) {
                panState.moved = panState.moved || Math.abs(dx) + Math.abs(dy) > 1;
                state.view.offsetX += dx;
                state.view.offsetY += dy;
                clampViewOffset();
                applyViewportTransform();
                panState.blockClick = panState.moved;
            }
            panState.lastX = event.clientX;
            panState.lastY = event.clientY;
            return;
        }
        if (!paintState.active || paintState.pointerId !== event.pointerId) return;
        const cell = getCellFromEvent(event);
        if (!cell) return;
        const key = `${cell.x},${cell.y}`;
        if (key === paintState.lastKey) return;
        paintState.lastKey = key;
        applyBrushToCell(cell.x, cell.y, { updateSelection: true });
        render();
    }

    function handleGridWheel(event) {
        if (!state) return;
        if (!state.view) state.view = defaultView();
        const metrics = getGridContentMetrics();
        if (!metrics) return;
        event.preventDefault();
        const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
        const nextScale = clamp(state.view.minScale || 0.25, state.view.maxScale || 4, state.view.scale * zoomFactor);
        if (nextScale === state.view.scale) return;
        const px = event.clientX - metrics.contentLeft;
        const py = event.clientY - metrics.contentTop;
        const worldX = (px - state.view.offsetX) / state.view.scale;
        const worldY = (py - state.view.offsetY) / state.view.scale;
        state.view.scale = nextScale;
        state.view.offsetX = px - worldX * nextScale;
        state.view.offsetY = py - worldY * nextScale;
        clampViewOffset();
        applyViewportTransform();
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

    function endPan(pointerId, event) {
        if (!panState.active || panState.pointerId !== pointerId) return false;
        if (refs.gridCanvas && typeof refs.gridCanvas.releasePointerCapture === 'function') {
            try {
                refs.gridCanvas.releasePointerCapture(pointerId);
            } catch (err) {}
        }
        const moved = panState.moved;
        panState.active = false;
        panState.pointerId = null;
        panState.moved = false;
        panState.lastX = 0;
        panState.lastY = 0;
        panState.blockClick = moved;
        setTimeout(() => { panState.blockClick = false; }, 0);
        if (!moved && event) {
            const cell = getCellFromEvent(event);
            if (cell) {
                setSelectedCell(cell.x, cell.y);
                render();
            }
        }
        return true;
    }

    function handleGlobalPointerUp(event) {
        if (endPan(event.pointerId, event)) return;
        endPointerPaint(event.pointerId);
    }

    function handleGridClick(event) {
        if (paintState.blockClick || panState.blockClick) {
            paintState.blockClick = false;
            panState.blockClick = false;
            event.preventDefault();
            return;
        }
        const cell = getCellFromEvent(event);
        if (!cell) return;
        if (state.brush === 'select') {
            setSelectedCell(cell.x, cell.y);
            render();
            return;
        }
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
            state.tempMessage = ts('validation.enemies.limitReached', '敵の上限（{max}体）に達しています。新たに追加するには既存の敵を削除してください。', { max: maxEnemies });
            renderValidation();
            return;
        }
        const id = `enemy-${enemySeq++}`;
        const stats = defaultEnemyStats(state.playerLevel);
        const enemy = {
            id,
            name: ts('enemies.generatedName', '敵{index}', { index: state.enemies.length + 1 }),
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
            name: ts('domains.generatedName', '領域{index}', { index: state.domainEffects.length + 1 }),
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

    function addGimmick(type, options = {}) {
        ensureGimmickCollections();
        const map = getActiveMapRecord();
        if (!map) return null;
        if (state.gimmicks.length >= MAX_GIMMICKS_PER_MAP) {
            state.tempMessage = ts('validation.gimmicks.limitReached', 'ギミックの上限（{max}）に達しています。既存のギミックを削除してください。', { max: MAX_GIMMICKS_PER_MAP });
            renderValidation();
            return null;
        }
        const baseOptions = {
            type: type || options.type || refs.gimmickTypeSelect?.value || 'floorSwitch',
            name: options.name,
            config: options.config,
            tile: options.tile,
            layout: options.layout,
            notes: options.notes,
            tags: options.tags,
            color: options.color
        };
        if (!baseOptions.tile && state.lastCell) {
            baseOptions.tile = { ...state.lastCell };
        }
        const gimmick = createGimmickRecord(baseOptions, state.gimmicks.length);
        map.gimmicks.push(gimmick);
        state.gimmicks = map.gimmicks;
        state.selectedGimmickId = gimmick.id;
        state.pendingWire = null;
        state.selectedWireId = null;
        return gimmick;
    }

    function duplicateGimmick(gimmickId) {
        ensureGimmickCollections();
        const map = getActiveMapRecord();
        if (!map) return false;
        const source = getGimmickById(gimmickId);
        if (!source) return false;
        if (state.gimmicks.length >= MAX_GIMMICKS_PER_MAP) {
            state.tempMessage = ts('validation.gimmicks.limitReached', 'ギミックの上限（{max}）に達しています。既存のギミックを削除してください。', { max: MAX_GIMMICKS_PER_MAP });
            renderValidation();
            return false;
        }
        const offset = 0.08;
        const layout = {
            x: clamp(0, 1, (source.layout?.x ?? 0.5) + offset),
            y: clamp(0, 1, (source.layout?.y ?? 0.5) + offset)
        };
        const duplicate = createGimmickRecord({
            type: source.type,
            name: `${source.name || defaultGimmickName(source.type)} copy`,
            config: { ...(source.config || {}) },
            tile: source.tile ? { ...source.tile } : null,
            layout,
            notes: source.notes,
            tags: Array.isArray(source.tags) ? source.tags.slice() : [],
            color: source.color
        }, state.gimmicks.length);
        map.gimmicks.push(duplicate);
        state.gimmicks = map.gimmicks;
        state.selectedGimmickId = duplicate.id;
        state.pendingWire = null;
        state.selectedWireId = null;
        return true;
    }

    function removeGimmick(gimmickId) {
        ensureGimmickCollections();
        const map = getActiveMapRecord();
        if (!map) return;
        map.gimmicks = map.gimmicks.filter(gimmick => gimmick && gimmick.id !== gimmickId);
        map.wires = map.wires.filter(wire => wire && wire.source?.gimmickId !== gimmickId && wire.target?.gimmickId !== gimmickId);
        state.gimmicks = map.gimmicks;
        state.wires = map.wires;
        if (state.selectedGimmickId === gimmickId) {
            state.selectedGimmickId = state.gimmicks[0]?.id || null;
        }
        if (state.selectedWireId && !state.wires.some(wire => wire.id === state.selectedWireId)) {
            state.selectedWireId = null;
        }
        if (state.pendingWire?.source?.gimmickId === gimmickId) {
            state.pendingWire = null;
        }
    }

    function getWireById(wireId) {
        if (!wireId) return null;
        return Array.isArray(state.wires) ? state.wires.find(wire => wire && wire.id === wireId) : null;
    }

    function removeWire(wireId) {
        ensureGimmickCollections();
        const map = getActiveMapRecord();
        if (!map) return;
        map.wires = map.wires.filter(wire => wire && wire.id !== wireId);
        state.wires = map.wires;
        if (state.selectedWireId === wireId) {
            state.selectedWireId = state.wires[0]?.id || null;
        }
    }

    function addWireConnection(sourceId, sourcePortId, targetId, targetPortId, options = {}) {
        ensureGimmickCollections();
        const map = getActiveMapRecord();
        if (!map) return null;
        if (!sourceId || !targetId || !sourcePortId || !targetPortId) return null;
        if (state.wires.length >= MAX_WIRES_PER_MAP) {
            state.tempMessage = ts('validation.wires.limitReached', 'ワイヤーの上限（{max}）に達しています。既存の接続を削除してください。', { max: MAX_WIRES_PER_MAP });
            renderValidation();
            return null;
        }
        const existing = state.wires.find(wire =>
            wire.source?.gimmickId === sourceId &&
            wire.source?.portId === sourcePortId &&
            wire.target?.gimmickId === targetId &&
            wire.target?.portId === targetPortId
        );
        if (existing) {
            state.selectedWireId = existing.id;
            return existing;
        }
        const wire = createWireRecord({
            source: { gimmickId: sourceId, portId: sourcePortId },
            target: { gimmickId: targetId, portId: targetPortId },
            signal: WIRE_SIGNAL_TYPES.includes(options.signal) ? options.signal : DEFAULT_WIRE_SIGNAL_TYPE,
            label: typeof options.label === 'string' ? options.label : ''
        });
        map.wires.push(wire);
        state.wires = map.wires;
        state.selectedWireId = wire.id;
        return wire;
    }

    function autoLayoutGimmicks() {
        ensureGimmickCollections();
        if (!state.gimmicks.length) return;
        const count = state.gimmicks.length;
        const columns = Math.ceil(Math.sqrt(count));
        const rows = Math.ceil(count / columns);
        state.gimmicks.forEach((gimmick, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);
            gimmick.layout = {
                x: columns > 1 ? col / (columns - 1 || 1) : 0.5,
                y: rows > 1 ? row / (rows - 1 || 1) : 0.5
            };
        });
    }

    function cleanupInvalidWires() {
        ensureGimmickCollections();
        const map = getActiveMapRecord();
        if (!map) return;
        const validOutputs = new Set();
        const validInputs = new Set();
        state.gimmicks.forEach(gimmick => {
            resolveGimmickOutputPorts(gimmick).forEach(port => validOutputs.add(`${gimmick.id}:${port.id}`));
            resolveGimmickInputPorts(gimmick).forEach(port => validInputs.add(`${gimmick.id}:${port.id}`));
        });
        const filtered = state.wires.filter(wire =>
            wire &&
            validOutputs.has(`${wire.source?.gimmickId}:${wire.source?.portId}`) &&
            validInputs.has(`${wire.target?.gimmickId}:${wire.target?.portId}`)
        );
        if (filtered.length !== state.wires.length) {
            state.wires = filtered;
            map.wires = filtered;
            if (state.selectedWireId && !filtered.some(wire => wire.id === state.selectedWireId)) {
                state.selectedWireId = filtered[0]?.id || null;
            }
        }
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
            nodeMapClose: document.getElementById('sandbox-node-map-close'),
            gimmickList: panel.querySelector('#sandbox-gimmick-list'),
            addGimmickButton: panel.querySelector('#sandbox-add-gimmick'),
            autoLayoutButton: panel.querySelector('#sandbox-auto-layout'),
            gimmickTypeSelect: panel.querySelector('#sandbox-gimmick-type'),
            gimmickForm: panel.querySelector('#sandbox-gimmick-form'),
            gimmickNameInput: panel.querySelector('#sandbox-gimmick-name'),
            gimmickTypeDisplay: panel.querySelector('#sandbox-gimmick-type-display'),
            gimmickTagsInput: panel.querySelector('#sandbox-gimmick-tags'),
            gimmickLockedInput: panel.querySelector('#sandbox-gimmick-locked'),
            gimmickTileXInput: panel.querySelector('#sandbox-gimmick-tile-x'),
            gimmickTileYInput: panel.querySelector('#sandbox-gimmick-tile-y'),
            gimmickUseSelectedButton: panel.querySelector('#sandbox-gimmick-use-selected'),
            gimmickClearTileButton: panel.querySelector('#sandbox-gimmick-clear-tile'),
            gimmickNotesInput: panel.querySelector('#sandbox-gimmick-notes'),
            gimmickConfigFields: panel.querySelector('#sandbox-gimmick-config-fields'),
            gimmickDuplicateButton: panel.querySelector('#sandbox-gimmick-duplicate'),
            gimmickDeleteButton: panel.querySelector('#sandbox-gimmick-delete'),
            wireList: panel.querySelector('#sandbox-wire-list'),
            wireEditor: panel.querySelector('#sandbox-wire-editor'),
            wireCanvas: panel.querySelector('#sandbox-wire-canvas'),
            wireNodes: panel.querySelector('#sandbox-wire-nodes'),
            wireStatus: panel.querySelector('#sandbox-wire-status'),
            wireClearSelection: panel.querySelector('#sandbox-wire-clear-selection'),
            wireStatusbar: panel.querySelector('#sandbox-wire-editor .sandbox-wire-statusbar')
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
            gimmicks: [],
            wires: [],
            selectedGimmickId: null,
            selectedWireId: null,
            pendingWire: null,
            wireEditor: { hoveredPort: null },
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
            entryMapId: null,
            view: defaultView()
        };

        const applyPanelTranslations = () => {
            const i18n = getI18n();
            if (i18n && typeof i18n.applyTranslations === 'function' && refs?.panel) {
                i18n.applyTranslations(refs.panel);
            }
        };

        function ensureLocaleChangeSubscription() {
            if (detachLocaleChange) return;
            const i18n = getI18n();
            if (!i18n || typeof i18n.onLocaleChanged !== 'function') {
                if (!pendingLocaleSubscription && typeof global.setTimeout === 'function') {
                    pendingLocaleSubscription = global.setTimeout(() => {
                        pendingLocaleSubscription = null;
                        ensureLocaleChangeSubscription();
                    }, 100);
                }
                return;
            }
            detachLocaleChange = i18n.onLocaleChanged(() => {
                if (!state) return;
                render();
                applyPanelTranslations();
            });
            if (typeof i18n.isReady !== 'function' || i18n.isReady()) {
                render();
                applyPanelTranslations();
            }
        }

        ensureLocaleChangeSubscription();

        const defaultMap = createMapRecord();
        state.maps.push(defaultMap);
        activateMap(defaultMap.id, { preserveSelection: false });
        state.entryMapId = defaultMap.id;

        if (refs.gridCanvas) {
            refs.gridCanvas.addEventListener('click', handleGridClick);
            refs.gridCanvas.addEventListener('pointerdown', handleGridPointerDown);
            refs.gridCanvas.addEventListener('pointermove', handleGridPointerMove);
        }
        if (refs.grid) {
            refs.grid.addEventListener('wheel', handleGridWheel, { passive: false });
        }
        window.addEventListener('pointerup', handleGlobalPointerUp);
        window.addEventListener('pointercancel', handleGlobalPointerUp);
        window.addEventListener('resize', () => updateViewConstraints({ forceFit: false }));
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
        if (refs.addGimmickButton) {
            refs.addGimmickButton.addEventListener('click', () => {
                const type = refs.gimmickTypeSelect?.value || 'floorSwitch';
                const added = addGimmick(type);
                if (added) render();
            });
        }
        if (refs.autoLayoutButton) {
            refs.autoLayoutButton.addEventListener('click', () => {
                autoLayoutGimmicks();
                renderWireEditor();
                renderWireList();
                updateWireStatus();
            });
        }
        if (refs.gimmickNameInput) {
            refs.gimmickNameInput.addEventListener('input', (event) => {
                const gimmick = getGimmickById(state.selectedGimmickId);
                if (!gimmick) return;
                const value = event.target.value.slice(0, 40);
                gimmick.name = value;
                renderGimmickList();
                renderWireEditor();
            });
        }
        if (refs.gimmickTagsInput) {
            refs.gimmickTagsInput.addEventListener('blur', (event) => {
                const gimmick = getGimmickById(state.selectedGimmickId);
                if (!gimmick) return;
                gimmick.tags = parseTagString(event.target.value);
                event.target.value = formatTagString(gimmick.tags);
                renderGimmickList();
            });
        }
        if (refs.gimmickLockedInput) {
            refs.gimmickLockedInput.addEventListener('change', (event) => {
                const gimmick = getGimmickById(state.selectedGimmickId);
                if (!gimmick) return;
                gimmick.locked = !!event.target.checked;
            });
        }
        const handleTileChange = () => {
            const gimmick = getGimmickById(state.selectedGimmickId);
            if (!gimmick) return;
            const x = Number(refs.gimmickTileXInput?.value);
            const y = Number(refs.gimmickTileYInput?.value);
            if (Number.isFinite(x) && Number.isFinite(y) && x >= 0 && y >= 0 && x < state.width && y < state.height) {
                gimmick.tile = { x: Math.floor(x), y: Math.floor(y) };
            } else {
                gimmick.tile = null;
            }
            renderGimmickDetail();
        };
        if (refs.gimmickTileXInput) refs.gimmickTileXInput.addEventListener('change', handleTileChange);
        if (refs.gimmickTileYInput) refs.gimmickTileYInput.addEventListener('change', handleTileChange);
        if (refs.gimmickUseSelectedButton) {
            refs.gimmickUseSelectedButton.addEventListener('click', () => {
                const gimmick = getGimmickById(state.selectedGimmickId);
                if (!gimmick || !state.lastCell) return;
                gimmick.tile = { ...state.lastCell };
                renderGimmickDetail();
            });
        }
        if (refs.gimmickClearTileButton) {
            refs.gimmickClearTileButton.addEventListener('click', () => {
                const gimmick = getGimmickById(state.selectedGimmickId);
                if (!gimmick) return;
                gimmick.tile = null;
                renderGimmickDetail();
            });
        }
        if (refs.gimmickNotesInput) {
            refs.gimmickNotesInput.addEventListener('input', (event) => {
                const gimmick = getGimmickById(state.selectedGimmickId);
                if (!gimmick) return;
                gimmick.notes = event.target.value.slice(0, 400);
            });
        }
        if (refs.gimmickDuplicateButton) {
            refs.gimmickDuplicateButton.addEventListener('click', () => {
                if (!state.selectedGimmickId) return;
                duplicateGimmick(state.selectedGimmickId);
                render();
            });
        }
        if (refs.gimmickDeleteButton) {
            refs.gimmickDeleteButton.addEventListener('click', () => {
                if (!state.selectedGimmickId) return;
                removeGimmick(state.selectedGimmickId);
                render();
            });
        }
        if (refs.wireClearSelection) {
            refs.wireClearSelection.addEventListener('click', () => {
                state.pendingWire = null;
                state.selectedWireId = null;
                updateWireStatus();
                renderWireEditor();
                renderWireList();
            });
        }
        if (refs.wireEditor) {
            refs.wireEditor.addEventListener('click', handleWireEditorBackgroundClick);
        }
        window.addEventListener('resize', () => {
            if (refs.wireEditor && state) {
                renderWireEditor();
            }
        });
        if (refs.startButton) {
            refs.startButton.addEventListener('click', () => {
                if (state.validation.errors.length) {
                    refs.validation?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    return;
                }
                const result = Bridge.start ? Bridge.start(buildConfigFromState()) : {
                    ok: false,
                    errors: [ts('start.defaultError', 'サンドボックスを開始できませんでした。')],
                    warnings: []
                };
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
                    const payload = buildExportBundle(snapshot);
                    const filename = `${EXPORT_FILE_PREFIX}-${formatTimestamp(new Date())}.json`;
                    triggerDownload(JSON.stringify(payload, null, 2), filename);
                    updateIoStatus('success', ts('io.export.success', '設定をエクスポートしました。'));
                } catch (err) {
                    console.error('[SandboxTool] Failed to export sandbox configuration:', err);
                    updateIoStatus('error', ts('io.export.failure', 'エクスポートに失敗しました。'));
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
                    updateIoStatus('info', ts('io.import.noFile', 'ファイルが選択されませんでした。'));
                    return;
                }
                updateIoStatus('info', ts('io.import.loading', '読み込み中...'));
                const reader = new FileReader();
                reader.addEventListener('error', () => {
                    console.error('[SandboxTool] Failed to read sandbox file:', reader.error);
                    updateIoStatus('error', ts('io.import.readError', 'ファイルを読み込めませんでした。'));
                });
                reader.addEventListener('load', () => {
                    try {
                        const text = typeof reader.result === 'string'
                            ? reader.result
                            : String(reader.result || '');
                        const parsed = JSON.parse(text);
                        const payload = extractSandboxPayload(parsed);
                        if (!payload) {
                            throw new Error(ts('io.import.unsupported', '対応していないファイル形式です。'));
                        }
                        const ok = importSerializedState(payload);
                        if (!ok) {
                            throw new Error(ts('io.import.genericFailure', 'インポートに失敗しました。'));
                        }
                        updateIoStatus('success', ts('io.import.success', 'サンドボックス設定をインポートしました。'));
                    } catch (err) {
                        console.error('[SandboxTool] Failed to import sandbox configuration:', err);
                        const message = err && err.message ? err.message : ts('io.import.unknownError', '不明なエラーが発生しました。');
                        updateIoStatus('error', ts('io.import.failedWithReason', 'インポートに失敗しました: {reason}', { reason: message }));
                    }
                });
                reader.readAsText(file);
            });
        }

        render();
        applyPanelTranslations();
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
    if (global.ToolStateRegistry?.register) {
        global.ToolStateRegistry.register('sandbox', {
            getState: () => exportSerializedState(),
            setState: (snapshot) => importSerializedState(snapshot),
            labelKey: 'tools.sidebar.stateManager.toolNames.sandbox',
            labelFallback: 'サンドボックス'
        });
    }
})(window);

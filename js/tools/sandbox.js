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
    const BRUSHES = ['floor', 'wall', 'start', 'stairs', 'enemy'];

    let refs = {};
    let state = null;
    let enemySeq = 1;

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

    function cloneGrid(grid) {
        return grid.map(row => row.slice());
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
            }))
        };
    }

    function ensureStateGridSize(width, height) {
        const newGrid = createEmptyGrid(width, height, 1);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                newGrid[y][x] = state.grid?.[y]?.[x] === 0 ? 0 : 1;
            }
        }
        state.grid = newGrid;
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
    }

    function setSelectedCell(x, y) {
        state.lastCell = { x, y };
        updateSelectedCellLabel();
    }

    function renderGrid() {
        const gridEl = refs.grid;
        if (!gridEl) return;
        gridEl.innerHTML = '';
        gridEl.style.gridTemplateColumns = `repeat(${state.width}, var(--sandbox-cell-size))`;
        const frag = document.createDocumentFragment();
        for (let y = 0; y < state.height; y++) {
            for (let x = 0; x < state.width; x++) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'sandbox-cell';
                btn.dataset.x = String(x);
                btn.dataset.y = String(y);
                const cell = state.grid[y][x];
                btn.classList.add(cell === 0 ? 'floor' : 'wall');
                let icon = '';
                if (state.playerStart && state.playerStart.x === x && state.playerStart.y === y) {
                    icon = '★';
                    btn.classList.add('start');
                }
                if (state.stairs && state.stairs.x === x && state.stairs.y === y) {
                    icon = '⬆';
                    btn.classList.add('stairs');
                }
                const enemiesHere = state.enemies.filter(e => e.x === x && e.y === y);
                if (enemiesHere.length) {
                    btn.classList.add('enemy');
                    if (!icon) {
                        icon = enemiesHere.length > 1 ? `✦${enemiesHere.length}` : '✦';
                    }
                    if (state.selectedEnemyId && enemiesHere.some(e => e.id === state.selectedEnemyId)) {
                        btn.classList.add('selected-enemy');
                    }
                }
                if (state.lastCell && state.lastCell.x === x && state.lastCell.y === y) {
                    btn.classList.add('selected');
                }
                btn.textContent = icon;
                btn.setAttribute('aria-label', `${cell === 0 ? '床' : '壁'} (${x}, ${y})`);
                frag.appendChild(btn);
            }
        }
        gridEl.appendChild(frag);
    }

    function updateBrushButtons() {
        if (!refs.brushButtons?.length) return;
        refs.brushButtons.forEach(btn => {
            const active = btn.dataset.brush === state.brush;
            btn.setAttribute('aria-pressed', active ? 'true' : 'false');
            btn.classList.toggle('active', active);
        });
    }

    function updateSelectedCellLabel() {
        if (!refs.selectedCell) return;
        if (state.lastCell) {
            refs.selectedCell.textContent = `選択セル: (${state.lastCell.x}, ${state.lastCell.y})`;
        } else {
            refs.selectedCell.textContent = 'セルをクリックして編集します。';
        }
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
        const { errors, warnings } = state.validation;
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
        updateSelectedCellLabel();
        renderPlayerPreview();
        renderEnemies();
        renderValidation();
        restoreActiveInput(focusSnapshot);
    }

    function handleGridClick(event) {
        const target = event.target.closest('.sandbox-cell');
        if (!target) return;
        const x = Number(target.dataset.x);
        const y = Number(target.dataset.y);
        if (!Number.isFinite(x) || !Number.isFinite(y)) return;
        setSelectedCell(x, y);
        const brush = state.brush;
        if (brush === 'floor') {
            state.grid[y][x] = 0;
        } else if (brush === 'wall') {
            state.grid[y][x] = 1;
            if (state.playerStart && state.playerStart.x === x && state.playerStart.y === y) state.playerStart = null;
            if (state.stairs && state.stairs.x === x && state.stairs.y === y) state.stairs = null;
            state.enemies = state.enemies.map(enemy => enemy.x === x && enemy.y === y ? { ...enemy, x: null, y: null } : enemy);
        } else if (brush === 'start') {
            state.grid[y][x] = 0;
            state.playerStart = { x, y };
        } else if (brush === 'stairs') {
            state.grid[y][x] = 0;
            state.stairs = { x, y };
        } else if (brush === 'enemy') {
            if (!state.selectedEnemyId) {
                state.tempMessage = '敵配置ブラシを使う前に敵を選択してください。';
                renderValidation();
                return;
            }
            const enemy = state.enemies.find(e => e.id === state.selectedEnemyId);
            if (enemy) {
                state.grid[y][x] = 0;
                enemy.x = x;
                enemy.y = y;
            }
        }
        render();
    }

    function handleBrushClick(event) {
        const btn = event.currentTarget;
        const brush = btn.dataset.brush;
        setBrush(brush);
    }

    function addEnemy() {
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
            validation: panel.querySelector('#sandbox-validation'),
            startButton: panel.querySelector('#sandbox-start-button')
        };

        state = {
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT,
            grid: createEmptyGrid(DEFAULT_WIDTH, DEFAULT_HEIGHT, 0),
            brush: 'floor',
            lastCell: null,
            playerStart: { x: 1, y: 1 },
            stairs: { x: DEFAULT_WIDTH - 2, y: DEFAULT_HEIGHT - 2 },
            playerLevel: DEFAULT_LEVEL,
            enemies: [],
            selectedEnemyId: null,
            validation: { errors: [], warnings: [] },
            compiledConfig: null,
            tempMessage: ''
        };

        if (refs.grid) {
            refs.grid.addEventListener('click', handleGridClick);
        }
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

        render();
    }

    ToolsTab.registerTool('sandbox-editor', init);
})(window);

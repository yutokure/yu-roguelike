(function (global) {
    'use strict';

    const GROUPS = ['blocks1', 'blocks2', 'blocks3'];
    const STANDARD_KEYS = new Set(['key', 'name', 'level', 'size', 'depth', 'chest', 'type', 'bossFloors']);
    const CHEST_OPTIONS = ['normal', 'more', 'less'];

    const state = {
        initialized: false,
        panel: null,
        data: null,
        currentGroup: 'blocks1',
        selectedGroup: null,
        selectedIndex: -1,
        form: null,
        formDirty: false,
        dirty: false,
        loading: false
    };

    const refs = {};

    function createEmptyData() {
        return {
            version: 1,
            blocks1: [],
            blocks2: [],
            blocks3: []
        };
    }

    function createEmptyBlock() {
        return {
            key: '',
            name: '',
            level: 0,
            size: 0,
            depth: 0,
            chest: 'normal',
            type: '',
            bossFloorsText: '',
            extrasText: ''
        };
    }

    function safeNumber(value, fallback = 0) {
        const num = Number(value);
        if (!Number.isFinite(num)) return fallback;
        return Math.round(num);
    }

    function normalizeBlock(block) {
        if (!block || typeof block !== 'object') {
            return {
                key: '',
                name: '',
                level: 0,
                size: 0,
                depth: 0,
                chest: 'normal',
                type: '',
                bossFloors: []
            };
        }
        const normalized = {
            key: typeof block.key === 'string' ? block.key : '',
            name: typeof block.name === 'string' ? block.name : '',
            level: safeNumber(block.level),
            size: safeNumber(block.size),
            depth: safeNumber(block.depth),
            chest: typeof block.chest === 'string' ? block.chest : 'normal',
            type: typeof block.type === 'string' ? block.type : '',
            bossFloors: Array.isArray(block.bossFloors)
                ? block.bossFloors
                    .map(n => Number(n))
                    .filter(n => Number.isFinite(n))
                    .map(n => Math.round(n))
                : []
        };
        for (const [key, value] of Object.entries(block)) {
            if (!STANDARD_KEYS.has(key)) {
                normalized[key] = value;
            }
        }
        return normalized;
    }

    function normalizeData(raw) {
        const data = createEmptyData();
        if (!raw || typeof raw !== 'object') {
            return data;
        }
        data.version = safeNumber(raw.version ?? 1, 1);
        for (const group of GROUPS) {
            const entries = Array.isArray(raw[group]) ? raw[group] : [];
            data[group] = entries.map(normalizeBlock);
        }
        return data;
    }

    function cacheElements(panel) {
        refs.groupButtons = Array.from(panel.querySelectorAll('[data-block-group]'));
        refs.search = panel.querySelector('#blockdata-search-input');
        refs.list = panel.querySelector('#blockdata-list');
        refs.createBtn = panel.querySelector('#blockdata-create');
        refs.versionInput = panel.querySelector('#blockdata-version');
        refs.reloadBtn = panel.querySelector('#blockdata-reload');
        refs.importBtn = panel.querySelector('#blockdata-import');
        refs.copyBtn = panel.querySelector('#blockdata-copy');
        refs.downloadBtn = panel.querySelector('#blockdata-download');
        refs.importInput = panel.querySelector('#blockdata-import-file');
        refs.dirtyIndicator = panel.querySelector('#blockdata-dirty-indicator');
        refs.status = panel.querySelector('#blockdata-status');
        refs.form = panel.querySelector('#blockdata-form');
        refs.fieldset = panel.querySelector('[data-blockdata-fieldset]');
        refs.saveBtn = panel.querySelector('#blockdata-save');
        refs.deleteBtn = panel.querySelector('#blockdata-delete');
        refs.fieldKey = panel.querySelector('#blockdata-field-key');
        refs.fieldName = panel.querySelector('#blockdata-field-name');
        refs.fieldLevel = panel.querySelector('#blockdata-field-level');
        refs.fieldSize = panel.querySelector('#blockdata-field-size');
        refs.fieldDepth = panel.querySelector('#blockdata-field-depth');
        refs.fieldChest = panel.querySelector('#blockdata-field-chest');
        refs.fieldType = panel.querySelector('#blockdata-field-type');
        refs.fieldBossFloors = panel.querySelector('#blockdata-field-bossfloors');
        refs.fieldExtras = panel.querySelector('#blockdata-field-extras');
        refs.preview = panel.querySelector('#blockdata-json-preview');
        refs.previewSize = panel.querySelector('#blockdata-preview-size');
    }

    function bindEvents() {
        refs.groupButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const group = btn.dataset.blockGroup;
                if (!group || group === state.currentGroup) return;
                if (!maybeDiscardForm()) return;
                setGroup(group);
            });
        });
        if (refs.search) {
            refs.search.addEventListener('input', () => {
                renderList();
            });
        }
        if (refs.createBtn) {
            refs.createBtn.addEventListener('click', handleCreateNew);
        }
        if (refs.versionInput) {
            refs.versionInput.addEventListener('change', handleVersionChange);
            refs.versionInput.addEventListener('input', handleVersionChange);
        }
        if (refs.reloadBtn) {
            refs.reloadBtn.addEventListener('click', handleReload);
        }
        if (refs.importBtn) {
            refs.importBtn.addEventListener('click', () => {
                if (!refs.importInput) return;
                refs.importInput.value = '';
                refs.importInput.click();
            });
        }
        if (refs.importInput) {
            refs.importInput.addEventListener('change', handleImportFile);
        }
        if (refs.copyBtn) {
            refs.copyBtn.addEventListener('click', handleCopy);
        }
        if (refs.downloadBtn) {
            refs.downloadBtn.addEventListener('click', handleDownload);
        }
        if (refs.form) {
            refs.form.addEventListener('submit', evt => evt.preventDefault());
        }
        const inputs = [
            refs.fieldKey,
            refs.fieldName,
            refs.fieldLevel,
            refs.fieldSize,
            refs.fieldDepth,
            refs.fieldChest,
            refs.fieldType,
            refs.fieldBossFloors,
            refs.fieldExtras
        ].filter(Boolean);
        inputs.forEach(el => {
            const eventName = el === refs.fieldChest ? 'change' : 'input';
            el.addEventListener(eventName, () => {
                updateFormFromInputs();
                state.formDirty = true;
                updateFormButtons();
                clearStatus();
            });
        });
        if (refs.saveBtn) {
            refs.saveBtn.addEventListener('click', handleSave);
        }
        if (refs.deleteBtn) {
            refs.deleteBtn.addEventListener('click', handleDelete);
        }
    }

    function initBlockDataEditor(context) {
        if (!context || !context.panel || state.initialized) {
            return;
        }
        state.initialized = true;
        state.panel = context.panel;
        cacheElements(context.panel);
        bindEvents();
        resetUI();
        loadInitialData();
    }

    function resetUI() {
        updateDirtyIndicator();
        clearStatus();
        clearForm();
        renderList();
        updateGroupButtons();
        if (refs.preview) refs.preview.value = '';
        if (refs.previewSize) refs.previewSize.textContent = '';
    }

    function setGroup(group) {
        state.currentGroup = GROUPS.includes(group) ? group : 'blocks1';
        updateGroupButtons();
        state.selectedGroup = null;
        state.selectedIndex = -1;
        clearForm();
        renderList();
    }

    function loadInitialData() {
        setStatus('blockdata.json を読み込んでいます…');
        state.loading = true;
        fetch('blockdata.json', { cache: 'no-store' })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                applyData(data);
                setStatus('blockdata.json を読み込みました。', false, 'success');
            })
            .catch(err => {
                console.warn('[BlockDataEditor] Failed to load blockdata.json:', err);
                applyData(createEmptyData());
                setStatus('blockdata.json の読み込みに失敗しました。インポートから読み込んでください。', true);
            })
            .finally(() => {
                state.loading = false;
            });
    }

    function applyData(rawData) {
        const normalized = normalizeData(rawData);
        state.data = normalized;
        state.dirty = false;
        state.selectedGroup = null;
        state.selectedIndex = -1;
        state.form = null;
        state.formDirty = false;
        if (!GROUPS.includes(state.currentGroup)) {
            state.currentGroup = 'blocks1';
        }
        if (refs.versionInput) {
            refs.versionInput.value = normalized.version ?? 1;
        }
        updateGroupCounts();
        updateGroupButtons();
        clearForm();
        renderList();
        renderPreview();
        updateDirtyIndicator();
    }

    function updateGroupCounts() {
        if (!state.data || !refs.groupButtons) return;
        refs.groupButtons.forEach(btn => {
            const group = btn.dataset.blockGroup;
            const countEl = btn.querySelector('.count');
            if (group && countEl) {
                const list = state.data[group];
                const count = Array.isArray(list) ? list.length : 0;
                countEl.textContent = String(count);
            }
        });
    }

    function updateGroupButtons() {
        if (!refs.groupButtons) return;
        refs.groupButtons.forEach(btn => {
            const group = btn.dataset.blockGroup;
            const active = group === state.currentGroup;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
    }

    function renderList() {
        if (!refs.list) return;
        refs.list.innerHTML = '';
        if (!state.data) {
            const empty = document.createElement('p');
            empty.className = 'blockdata-empty';
            empty.textContent = 'データが読み込まれていません。';
            refs.list.appendChild(empty);
            return;
        }
        const groupList = state.data[state.currentGroup] || [];
        const term = (refs.search?.value || '').trim().toLowerCase();
        const entries = groupList.map((block, index) => ({ block, index }));
        const filtered = term
            ? entries.filter(({ block }) => {
                const key = String(block.key || '').toLowerCase();
                const name = String(block.name || '').toLowerCase();
                return key.includes(term) || name.includes(term);
            })
            : entries;
        if (!filtered.length) {
            const empty = document.createElement('p');
            empty.className = 'blockdata-empty';
            empty.textContent = term ? '該当するブロックがありません。' : 'ブロックがありません。';
            refs.list.appendChild(empty);
            return;
        }
        const frag = document.createDocumentFragment();
        filtered.forEach(({ block, index }) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'blockdata-item';
            const isActive = state.selectedGroup === state.currentGroup && index === state.selectedIndex;
            if (isActive) btn.classList.add('active');
            btn.setAttribute('role', 'option');
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
            btn.dataset.index = String(index);

            const title = document.createElement('strong');
            title.textContent = block.name || '(無題)';
            const meta = document.createElement('span');
            meta.className = 'meta';
            const levelText = Number.isFinite(block.level) ? `Lv ${block.level}` : 'Lv -';
            meta.textContent = `${block.key || '-'} · ${levelText}`;
            btn.appendChild(title);
            btn.appendChild(meta);

            btn.addEventListener('click', () => {
                if (index === state.selectedIndex && state.selectedGroup === state.currentGroup) return;
                if (!maybeDiscardForm()) return;
                selectBlock(index);
            });
            frag.appendChild(btn);
        });
        refs.list.appendChild(frag);
    }

    function selectBlock(index) {
        if (!state.data) return;
        const groupList = state.data[state.currentGroup] || [];
        const block = groupList[index];
        if (!block) return;
        state.selectedGroup = state.currentGroup;
        state.selectedIndex = index;
        state.form = toFormModel(block);
        state.formDirty = false;
        fillForm();
        updateFormButtons();
        renderList();
        clearStatus();
    }

    function toFormModel(block) {
        const extras = {};
        for (const [key, value] of Object.entries(block)) {
            if (!STANDARD_KEYS.has(key)) {
                extras[key] = value;
            }
        }
        return {
            key: String(block.key || ''),
            name: String(block.name || ''),
            level: safeNumber(block.level),
            size: safeNumber(block.size),
            depth: safeNumber(block.depth),
            chest: CHEST_OPTIONS.includes(block.chest) ? block.chest : 'normal',
            type: String(block.type || ''),
            bossFloorsText: Array.isArray(block.bossFloors) && block.bossFloors.length
                ? block.bossFloors.join(', ')
                : '',
            extrasText: Object.keys(extras).length ? JSON.stringify(extras, null, 2) : ''
        };
    }

    function fillForm() {
        if (!state.form || !refs.fieldset) return;
        refs.fieldset.disabled = false;
        refs.fieldKey.value = state.form.key;
        refs.fieldName.value = state.form.name;
        refs.fieldLevel.value = state.form.level;
        refs.fieldSize.value = state.form.size;
        refs.fieldDepth.value = state.form.depth;
        refs.fieldChest.value = state.form.chest;
        refs.fieldType.value = state.form.type;
        refs.fieldBossFloors.value = state.form.bossFloorsText;
        refs.fieldExtras.value = state.form.extrasText;
    }

    function updateFormFromInputs() {
        if (!state.form) return;
        state.form.key = refs.fieldKey?.value?.trim() || '';
        state.form.name = refs.fieldName?.value?.trim() || '';
        state.form.level = safeNumber(refs.fieldLevel?.value ?? 0);
        state.form.size = safeNumber(refs.fieldSize?.value ?? 0);
        state.form.depth = safeNumber(refs.fieldDepth?.value ?? 0);
        state.form.chest = refs.fieldChest?.value || 'normal';
        state.form.type = refs.fieldType?.value?.trim() || '';
        state.form.bossFloorsText = refs.fieldBossFloors?.value?.trim() || '';
        state.form.extrasText = refs.fieldExtras?.value?.trim() || '';
    }

    function clearForm() {
        if (refs.fieldset) refs.fieldset.disabled = true;
        if (refs.fieldKey) refs.fieldKey.value = '';
        if (refs.fieldName) refs.fieldName.value = '';
        if (refs.fieldLevel) refs.fieldLevel.value = 0;
        if (refs.fieldSize) refs.fieldSize.value = 0;
        if (refs.fieldDepth) refs.fieldDepth.value = 0;
        if (refs.fieldChest) refs.fieldChest.value = 'normal';
        if (refs.fieldType) refs.fieldType.value = '';
        if (refs.fieldBossFloors) refs.fieldBossFloors.value = '';
        if (refs.fieldExtras) refs.fieldExtras.value = '';
        if (refs.saveBtn) refs.saveBtn.disabled = true;
        if (refs.deleteBtn) refs.deleteBtn.disabled = true;
    }

    function updateFormButtons() {
        const hasForm = !!state.form;
        const canSave = hasForm && (state.formDirty || state.selectedIndex === -1);
        if (refs.saveBtn) refs.saveBtn.disabled = !canSave;
        const canDelete = hasForm && state.selectedIndex >= 0;
        if (refs.deleteBtn) refs.deleteBtn.disabled = !canDelete;
    }

    function setStatus(message, isError = false, variant = null) {
        if (!refs.status) return;
        refs.status.textContent = message || '';
        refs.status.classList.remove('error', 'success');
        if (!message) return;
        if (variant === 'success') {
            refs.status.classList.add('success');
        } else if (variant === 'error' || isError) {
            refs.status.classList.add('error');
        }
    }

    function clearStatus() {
        setStatus('');
    }

    function updateDirtyIndicator() {
        if (!refs.dirtyIndicator) return;
        if (state.dirty) {
            refs.dirtyIndicator.textContent = '未保存の変更があります。エクスポートまたはコピーを忘れずに。';
            refs.dirtyIndicator.classList.add('is-dirty');
        } else {
            refs.dirtyIndicator.textContent = '最新の状態です。';
            refs.dirtyIndicator.classList.remove('is-dirty');
        }
    }

    function handleCreateNew() {
        if (!state.data) {
            setStatus('データが読み込まれていません。', true);
            return;
        }
        if (!maybeDiscardForm()) return;
        state.selectedGroup = state.currentGroup;
        state.selectedIndex = -1;
        state.form = createEmptyBlock();
        state.formDirty = true;
        fillForm();
        updateFormButtons();
        setStatus('新規ブロックを作成中です。必要な項目を入力してください。');
        if (refs.fieldKey) refs.fieldKey.focus();
    }

    function handleVersionChange() {
        if (!state.data || !refs.versionInput) return;
        const value = safeNumber(refs.versionInput.value || state.data.version || 1, state.data.version || 1);
        refs.versionInput.value = value;
        if (state.data.version !== value) {
            state.data.version = value;
            markDirty();
            renderPreview();
        }
    }

    function handleReload() {
        if (state.loading) return;
        if ((state.dirty || state.formDirty) && !confirm('未エクスポートの変更が失われます。再読込しますか？')) {
            return;
        }
        loadInitialData();
    }

    function handleImportFile(evt) {
        const file = evt.target?.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = e => {
            try {
                const parsed = JSON.parse(e.target.result);
                applyData(parsed);
                setStatus(`${file.name} を読み込みました。`, false, 'success');
            } catch (err) {
                console.error('[BlockDataEditor] Failed to import file:', err);
                setStatus('JSONの読み込みに失敗しました。形式を確認してください。', true);
            }
        };
        reader.onerror = () => {
            setStatus('ファイルを読み込めませんでした。', true);
        };
        reader.readAsText(file, 'utf-8');
    }

    function parseBossFloors(text) {
        if (!text) return { values: [] };
        const tokens = text.split(',').map(token => token.trim()).filter(Boolean);
        const values = [];
        for (const token of tokens) {
            const num = Number(token);
            if (!Number.isFinite(num)) {
                return { error: token };
            }
            values.push(Math.round(num));
        }
        return { values };
    }

    function parseExtras(text) {
        if (!text) return {};
        try {
            const parsed = JSON.parse(text);
            if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                throw new Error('Extras must be an object');
            }
            return parsed;
        } catch (err) {
            throw new Error('追加プロパティはJSONオブジェクトで入力してください。');
        }
    }

    function handleSave() {
        if (!state.form || !state.data) return;
        updateFormFromInputs();
        const errors = [];
        const group = state.selectedGroup || state.currentGroup;
        const list = state.data[group] || [];
        const key = state.form.key.trim();
        if (!key) {
            errors.push('キーを入力してください。');
        }
        const name = state.form.name.trim();
        if (!name) {
            errors.push('名前を入力してください。');
        }
        if (key) {
            const duplicateIndex = list.findIndex((item, idx) => item.key === key && idx !== state.selectedIndex);
            if (duplicateIndex >= 0) {
                errors.push('同じキーのブロックが既に存在します。');
            }
        }
        let bossFloorsResult = { values: [] };
        if (state.form.bossFloorsText) {
            bossFloorsResult = parseBossFloors(state.form.bossFloorsText);
            if (bossFloorsResult.error) {
                errors.push(`ボス階層に数値ではない値があります: ${bossFloorsResult.error}`);
            }
        }
        let extras = {};
        if (state.form.extrasText) {
            try {
                extras = parseExtras(state.form.extrasText);
            } catch (err) {
                errors.push(err.message);
            }
        }
        if (errors.length) {
            setStatus(errors.join('\n'), true);
            return;
        }
        const block = {
            key,
            name,
            level: safeNumber(state.form.level),
            size: safeNumber(state.form.size),
            depth: safeNumber(state.form.depth),
            chest: state.form.chest,
            type: state.form.type,
            bossFloors: bossFloorsResult.values
        };
        for (const [prop, value] of Object.entries(extras)) {
            block[prop] = value;
        }
        if (!Array.isArray(state.data[group])) {
            state.data[group] = [];
        }
        if (state.selectedIndex >= 0 && state.selectedGroup === group) {
            state.data[group][state.selectedIndex] = block;
        } else {
            state.data[group].push(block);
            state.selectedIndex = state.data[group].length - 1;
            state.selectedGroup = group;
        }
        state.form = toFormModel(block);
        state.formDirty = false;
        fillForm();
        updateFormButtons();
        markDirty();
        updateGroupCounts();
        renderList();
        renderPreview();
        setStatus('ブロックを保存しました。', false, 'success');
    }

    function handleDelete() {
        if (!state.data) return;
        if (state.selectedIndex < 0 || !GROUPS.includes(state.selectedGroup)) {
            setStatus('削除対象のブロックが選択されていません。', true);
            return;
        }
        if (!confirm('選択したブロックを削除しますか？')) {
            return;
        }
        const list = state.data[state.selectedGroup];
        if (!Array.isArray(list)) return;
        list.splice(state.selectedIndex, 1);
        state.selectedIndex = -1;
        state.selectedGroup = null;
        state.form = null;
        state.formDirty = false;
        clearForm();
        updateGroupCounts();
        renderList();
        renderPreview();
        markDirty();
        setStatus('ブロックを削除しました。', false, 'success');
    }

    function markDirty() {
        state.dirty = true;
        updateDirtyIndicator();
    }

    function renderPreview() {
        if (!refs.preview) return;
        if (!state.data) {
            refs.preview.value = '';
            if (refs.previewSize) refs.previewSize.textContent = '';
            return;
        }
        const jsonString = JSON.stringify(state.data, null, 2);
        refs.preview.value = jsonString;
        if (refs.previewSize) {
            const lines = jsonString.split('\n').length;
            let bytes = jsonString.length;
            if (typeof TextEncoder !== 'undefined') {
                bytes = new TextEncoder().encode(jsonString).length;
            }
            refs.previewSize.textContent = `${lines.toLocaleString()} 行 / ${bytes.toLocaleString()} bytes`;
        }
    }

    function handleCopy() {
        if (!refs.preview) return;
        const text = refs.preview.value;
        if (!text) {
            setStatus('コピーする内容がありません。', true);
            return;
        }
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(text)
                .then(() => setStatus('クリップボードにコピーしました。', false, 'success'))
                .catch(err => {
                    console.warn('[BlockDataEditor] Clipboard write failed:', err);
                    fallbackCopy(text);
                });
        } else {
            fallbackCopy(text);
        }
    }

    function fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.top = '0';
        textarea.style.left = '0';
        textarea.style.width = '1px';
        textarea.style.height = '1px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
            document.execCommand('copy');
            setStatus('クリップボードにコピーしました。', false, 'success');
        } catch (err) {
            console.error('[BlockDataEditor] execCommand copy failed:', err);
            setStatus('コピーできませんでした。', true);
        }
        document.body.removeChild(textarea);
    }

    function handleDownload() {
        if (!refs.preview) return;
        const text = refs.preview.value;
        if (!text) {
            setStatus('ダウンロードする内容がありません。', true);
            return;
        }
        const blob = new Blob([text], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'blockdata.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 500);
        setStatus('JSONファイルをダウンロードしました。', false, 'success');
    }

    function maybeDiscardForm() {
        if (!state.formDirty) return true;
        const ok = confirm('編集中の内容が破棄されます。続行しますか？');
        if (ok) {
            state.formDirty = false;
        }
        return ok;
    }

    global.BlockDataEditor = {
        state
    };

    if (global.ToolsTab?.registerTool) {
        global.ToolsTab.registerTool('blockdata-editor', initBlockDataEditor);
    }
})(window);

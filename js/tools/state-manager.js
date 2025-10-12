(function (global) {
    'use strict';

    const TOOL_ID = 'state-manager';
    const i18n = global.I18n || null;

    const TOOL_LABEL_KEYS = Object.freeze({
        modMaker: 'tools.stateManager.toolNames.modMaker',
        blockDataEditor: 'tools.stateManager.toolNames.blockDataEditor',
        sandbox: 'tools.stateManager.toolNames.sandbox',
        imageViewer: 'tools.stateManager.toolNames.imageViewer'
    });

    const TOOL_LABEL_FALLBACKS = Object.freeze({
        modMaker: 'Mod作成',
        blockDataEditor: 'BlockData編集',
        sandbox: 'サンドボックス',
        imageViewer: '画像ビューア'
    });

    const STATUS_MESSAGES = Object.freeze({
        exportPreparing: { key: 'tools.stateManager.status.exportPreparing', fallback: '全体エクスポートを準備しています…', variant: null },
        exportSuccess: { key: 'tools.stateManager.status.exportSuccess', fallback: ({ fileName } = {}) => `${fileName || ''} として保存しました。`, variant: 'success' },
        exportError: { key: 'tools.stateManager.status.exportError', fallback: 'エクスポートに失敗しました。コンソールログを確認してください。', variant: 'error' },
        importReading: { key: 'tools.stateManager.status.importReading', fallback: ({ fileName } = {}) => `${fileName || ''} を読み込み中です…`, variant: null },
        importSuccess: { key: 'tools.stateManager.status.importSuccess', fallback: '全体インポートが完了しました。', variant: 'success' },
        importError: { key: 'tools.stateManager.status.importError', fallback: 'インポートに失敗しました。ファイル形式を確認してください。', variant: 'error' }
    });

    const MESSAGE_DESCRIPTORS = Object.freeze({
        importComplete: { key: 'tools.stateManager.messages.importComplete', fallback: '状態データをインポートしました。' }
    });

    let lastStatusPayload = { key: null, params: null, fallback: '', variant: null };
    let lastSummarySnapshot = null;
    let refsCache = null;
    let localeUnsubscribe = null;

    function translate(key, params, fallback) {
        if (key && i18n && typeof i18n.t === 'function') {
            const value = i18n.t(key, params);
            if (value !== undefined && value !== null && value !== key) {
                return value;
            }
        }
        if (typeof fallback === 'function') {
            return fallback(params || {});
        }
        if (fallback !== undefined && fallback !== null) {
            return fallback;
        }
        if (typeof key === 'string') {
            return key;
        }
        return '';
    }

    function getDefaultSummary() {
        return translate('tools.stateManager.summary.default', null, 'エクスポート／インポートの概要がここに表示されます。');
    }

    function deepClone(value) {
        if (value === null || value === undefined) return value;
        try {
            return JSON.parse(JSON.stringify(value));
        } catch (err) {
            return value;
        }
    }

    function sanitizeSnapshot(snapshot) {
        if (!snapshot || typeof snapshot !== 'object') return {};
        const clean = Array.isArray(snapshot) ? [] : {};
        for (const [key, value] of Object.entries(snapshot)) {
            if (value === undefined) continue;
            if (value && typeof value === 'object') {
                clean[key] = sanitizeSnapshot(value);
            } else {
                clean[key] = value;
            }
        }
        return clean;
    }

    function formatNumber(value) {
        const num = Number(value);
        if (!Number.isFinite(num)) return '-';
        if (i18n && typeof i18n.formatNumber === 'function') {
            try {
                return i18n.formatNumber(num);
            } catch (err) {
                // Fall back below.
            }
        }
        try {
            return num.toLocaleString();
        } catch (err) {
            return String(num);
        }
    }

    function getToolSeparator() {
        return translate('tools.stateManager.summary.toolSeparator', null, '、');
    }

    function getToolLabel(toolId) {
        const key = TOOL_LABEL_KEYS[toolId] || null;
        const fallback = TOOL_LABEL_FALLBACKS[toolId] || toolId;
        return translate(key, null, fallback);
    }

    function formatSummary(snapshot) {
        if (!snapshot || typeof snapshot !== 'object') {
            return getDefaultSummary();
        }
        const lines = [];
        if (snapshot.exportedAt) {
            lines.push(translate('tools.stateManager.summary.exportedAt', { value: snapshot.exportedAt }, () => `エクスポート日時: ${snapshot.exportedAt}`));
        }
        const game = snapshot.game || {};
        const player = game.player || {};
        const levelText = formatNumber(player.level);
        const hpText = Number.isFinite(player.maxHp)
            ? `${formatNumber(player.hp || 0)}/${formatNumber(player.maxHp)}`
            : '-';
        lines.push(translate('tools.stateManager.summary.player', { level: levelText, hp: hpText }, () => `プレイヤー: Lv ${levelText} / HP ${hpText}`));
        if (game.dungeonLevel != null || game.difficulty) {
            const floorText = game.dungeonLevel != null ? formatNumber(game.dungeonLevel) : '-';
            const difficulty = game.difficulty || '-';
            lines.push(translate('tools.stateManager.summary.dungeon', { floor: floorText, difficulty }, () => `現在階層: ${floorText}F / 難易度: ${difficulty}`));
        }
        const miniExp = game.miniExp || {};
        const recordCount = miniExp.records ? Object.keys(miniExp.records).length : 0;
        const selected = miniExp.selected != null && miniExp.selected !== '' ? miniExp.selected : '-';
        const recordText = formatNumber(recordCount);
        lines.push(translate('tools.stateManager.summary.miniExp', { selected, records: recordText }, () => `MiniExp: 選択 ${selected} / 記録 ${recordText}件`));
        const bookmarks = Array.isArray(game.blockDimBookmarks) ? game.blockDimBookmarks.length : 0;
        const history = Array.isArray(game.blockDimHistory) ? game.blockDimHistory.length : 0;
        const historyText = formatNumber(history);
        const bookmarkText = formatNumber(bookmarks);
        lines.push(translate('tools.stateManager.summary.blockDim', { history: historyText, bookmarks: bookmarkText }, () => `BlockDim: 履歴 ${historyText}件 / ブックマーク ${bookmarkText}件`));
        const tools = snapshot.tools || {};
        const toolKeys = Object.keys(tools);
        if (toolKeys.length) {
            const separator = getToolSeparator();
            const names = toolKeys.map(key => getToolLabel(key)).join(separator);
            lines.push(translate('tools.stateManager.summary.tools', { names }, () => `ツールデータ: ${names}`));
        } else {
            lines.push(translate('tools.stateManager.summary.noTools', null, 'ツールデータ: なし'));
        }
        return lines.join('\n');
    }

    function applyStatusFromPayload(refs) {
        if (!refs?.status) return;
        const { key, params, fallback, variant } = lastStatusPayload || {};
        const text = translate(key, params, fallback);
        refs.status.textContent = text || '';
        refs.status.classList.remove('success', 'error');
        if (!text) return;
        if (variant === 'success') {
            refs.status.classList.add('success');
        } else if (variant === 'error') {
            refs.status.classList.add('error');
        }
    }

    function setStatus(refs, payload) {
        if (!refs?.status) return;
        if (typeof payload === 'string' || typeof payload === 'number') {
            lastStatusPayload = { key: null, params: null, fallback: () => String(payload), variant: null };
        } else if (payload && typeof payload === 'object') {
            lastStatusPayload = {
                key: payload.key || null,
                params: payload.params || null,
                fallback: payload.fallback !== undefined ? payload.fallback : '',
                variant: payload.variant || null
            };
        } else {
            lastStatusPayload = { key: null, params: null, fallback: '', variant: null };
        }
        applyStatusFromPayload(refs);
    }

    function applySummary(refs) {
        const target = refs?.summary;
        if (!target) return;
        const text = lastSummarySnapshot
            ? formatSummary(lastSummarySnapshot)
            : getDefaultSummary();
        target.textContent = text || '';
    }

    function setSummaryToDefault(refs) {
        lastSummarySnapshot = null;
        applySummary(refs);
    }

    function setSummaryFromSnapshot(refs, snapshot) {
        lastSummarySnapshot = snapshot && typeof snapshot === 'object' ? snapshot : null;
        applySummary(refs);
    }

    function downloadSnapshot(snapshot) {
        const json = JSON.stringify(sanitizeSnapshot(snapshot), null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const timestamp = new Date(snapshot.exportedAt || Date.now());
        const pad = (n) => String(n).padStart(2, '0');
        const fileName = `fullstate-${timestamp.getFullYear()}${pad(timestamp.getMonth() + 1)}${pad(timestamp.getDate())}-${pad(timestamp.getHours())}${pad(timestamp.getMinutes())}${pad(timestamp.getSeconds())}.json`;
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fileName;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        setTimeout(() => URL.revokeObjectURL(url), 500);
        return fileName;
    }

    async function collectFullSnapshot() {
        const snapshot = {
            version: 1,
            exportedAt: new Date().toISOString()
        };
        if (typeof global.getGameStateSnapshot === 'function') {
            snapshot.game = deepClone(global.getGameStateSnapshot());
        }
        const tools = {};
        if (global.ModMakerTool?.getState) {
            const modState = await Promise.resolve(global.ModMakerTool.getState());
            if (modState) tools.modMaker = deepClone(modState);
        } else if (typeof global.getModMakerStateSnapshot === 'function') {
            const modState = global.getModMakerStateSnapshot();
            if (modState) tools.modMaker = deepClone(modState);
        }
        if (global.BlockDataEditor?.getState) {
            const bdState = global.BlockDataEditor.getState();
            if (bdState) tools.blockDataEditor = deepClone(bdState);
        }
        if (global.SandboxEditor?.getState) {
            const sandboxState = global.SandboxEditor.getState();
            if (sandboxState) tools.sandbox = deepClone(sandboxState);
        }
        if (global.ImageViewerTool?.getState) {
            const viewerState = await Promise.resolve(global.ImageViewerTool.getState());
            if (viewerState) tools.imageViewer = sanitizeSnapshot(viewerState);
        }
        if (Object.keys(tools).length) {
            snapshot.tools = tools;
        }
        return snapshot;
    }

    async function applyFullSnapshot(snapshot) {
        if (!snapshot || typeof snapshot !== 'object') {
            throw new Error('snapshot is invalid');
        }
        if (snapshot.game && typeof global.applyGameStateSnapshot === 'function') {
            global.applyGameStateSnapshot(snapshot.game, { applyUI: true });
        }
        const toolPromises = [];
        if (snapshot.tools) {
            if (snapshot.tools.modMaker) {
                if (global.ModMakerTool?.setState) {
                    toolPromises.push(Promise.resolve(global.ModMakerTool.setState(snapshot.tools.modMaker)));
                } else if (typeof global.applyModMakerStateSnapshot === 'function') {
                    global.applyModMakerStateSnapshot(snapshot.tools.modMaker);
                }
            }
            if (snapshot.tools.blockDataEditor && global.BlockDataEditor?.setState) {
                try { global.BlockDataEditor.setState(snapshot.tools.blockDataEditor); } catch (err) {
                    console.warn('[StateManager] Failed to apply BlockDataEditor state:', err);
                }
            }
            if (snapshot.tools.sandbox && global.SandboxEditor?.setState) {
                try { global.SandboxEditor.setState(snapshot.tools.sandbox); } catch (err) {
                    console.warn('[StateManager] Failed to apply sandbox state:', err);
                }
            }
            if (snapshot.tools.imageViewer && global.ImageViewerTool?.setState) {
                toolPromises.push(Promise.resolve(global.ImageViewerTool.setState(snapshot.tools.imageViewer)));
            }
        }
        if (toolPromises.length) {
            await Promise.allSettled(toolPromises);
        }
        if (typeof global.saveAll === 'function') {
            try { global.saveAll(); } catch (err) { console.warn('[StateManager] Failed to save after import:', err); }
        }
        if (typeof global.showSelectionScreen === 'function') {
            try {
                global.showSelectionScreen({ stopLoop: true, refillHp: false, resetModeToNormal: false, rebuildSelection: false });
            } catch (err) {
                console.warn('[StateManager] Failed to show selection screen:', err);
            }
        }
        if (typeof global.addMessage === 'function') {
            try {
                const message = translate(
                    MESSAGE_DESCRIPTORS.importComplete.key,
                    null,
                    MESSAGE_DESCRIPTORS.importComplete.fallback
                );
                global.addMessage(message);
            } catch {}
        }
    }

    function initStateManagerTool(context) {
        const panel = context?.panel;
        if (!panel || panel.__stateManagerInited) return;
        panel.__stateManagerInited = true;
        const refs = {
            panel,
            exportBtn: panel.querySelector('#state-manager-export'),
            importBtn: panel.querySelector('#state-manager-import'),
            importInput: panel.querySelector('#state-manager-import-file'),
            status: panel.querySelector('#state-manager-status'),
            summary: panel.querySelector('#state-manager-summary')
        };
        refsCache = refs;
        setSummaryToDefault(refs);

        if (!localeUnsubscribe && i18n && typeof i18n.onLocaleChanged === 'function') {
            localeUnsubscribe = i18n.onLocaleChanged(() => {
                applySummary(refsCache);
                applyStatusFromPayload(refsCache);
            });
        }

        if (refs.exportBtn) {
            refs.exportBtn.addEventListener('click', async () => {
                setStatus(refs, { ...STATUS_MESSAGES.exportPreparing });
                try {
                    const snapshot = await collectFullSnapshot();
                    const fileName = downloadSnapshot(snapshot);
                    setSummaryFromSnapshot(refs, snapshot);
                    setStatus(refs, { ...STATUS_MESSAGES.exportSuccess, params: { fileName } });
                } catch (err) {
                    console.error('[StateManager] Export failed:', err);
                    setStatus(refs, { ...STATUS_MESSAGES.exportError });
                }
            });
        }

        if (refs.importBtn && refs.importInput) {
            refs.importBtn.addEventListener('click', () => {
                refs.importInput.value = '';
                refs.importInput.click();
            });
            refs.importInput.addEventListener('change', async (event) => {
                const file = event.target?.files?.[0];
                if (!file) return;
                setStatus(refs, { ...STATUS_MESSAGES.importReading, params: { fileName: file.name } });
                try {
                    const text = await file.text();
                    const parsed = JSON.parse(text);
                    await applyFullSnapshot(parsed);
                    setSummaryFromSnapshot(refs, parsed);
                    setStatus(refs, { ...STATUS_MESSAGES.importSuccess });
                } catch (err) {
                    console.error('[StateManager] Import failed:', err);
                    setStatus(refs, { ...STATUS_MESSAGES.importError });
                }
            });
        }
    }

    if (global.ToolsTab?.registerTool) {
        global.ToolsTab.registerTool(TOOL_ID, initStateManagerTool);
    }
})(window);

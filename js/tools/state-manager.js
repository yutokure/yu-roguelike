(function (global) {
    'use strict';

    const TOOL_ID = 'state-manager';
    const DEFAULT_SUMMARY = 'エクスポート／インポートの概要がここに表示されます。';
    const TOOL_LABELS = {
        modMaker: 'Mod作成',
        blockDataEditor: 'BlockData編集',
        sandbox: 'サンドボックス',
        imageViewer: '画像ビューア'
    };

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
        return num.toLocaleString('ja-JP');
    }

    function formatSummary(snapshot) {
        if (!snapshot || typeof snapshot !== 'object') return DEFAULT_SUMMARY;
        const lines = [];
        if (snapshot.exportedAt) {
            lines.push(`エクスポート日時: ${snapshot.exportedAt}`);
        }
        const game = snapshot.game || {};
        const player = game.player || {};
        const hpMax = Number.isFinite(player.maxHp) ? `${formatNumber(player.hp || 0)}/${formatNumber(player.maxHp)}` : '-';
        lines.push(`プレイヤー: Lv ${formatNumber(player.level)} / HP ${hpMax}`);
        if (game.dungeonLevel != null) {
            lines.push(`現在階層: ${formatNumber(game.dungeonLevel)}F / 難易度: ${game.difficulty || '-'}`);
        }
        const miniExp = game.miniExp || {};
        const recordCount = miniExp.records ? Object.keys(miniExp.records).length : 0;
        lines.push(`MiniExp: 選択 ${miniExp.selected || '-'} / 記録 ${formatNumber(recordCount)}件`);
        const bookmarks = Array.isArray(game.blockDimBookmarks) ? game.blockDimBookmarks.length : 0;
        const history = Array.isArray(game.blockDimHistory) ? game.blockDimHistory.length : 0;
        lines.push(`BlockDim: 履歴 ${formatNumber(history)}件 / ブックマーク ${formatNumber(bookmarks)}件`);
        const tools = snapshot.tools || {};
        const toolKeys = Object.keys(tools);
        if (toolKeys.length) {
            const names = toolKeys.map(key => TOOL_LABELS[key] || key).join('、');
            lines.push(`ツールデータ: ${names}`);
        } else {
            lines.push('ツールデータ: なし');
        }
        return lines.join('\n');
    }

    function setStatus(refs, message, variant = null) {
        if (!refs.status) return;
        refs.status.textContent = message || '';
        refs.status.classList.remove('success', 'error');
        if (variant === 'success') refs.status.classList.add('success');
        if (variant === 'error') refs.status.classList.add('error');
    }

    function setSummary(refs, text) {
        if (!refs.summary) return;
        refs.summary.textContent = text && text.trim() ? text : DEFAULT_SUMMARY;
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
            try { global.addMessage('状態データをインポートしました。'); } catch {}
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
        setSummary(refs, DEFAULT_SUMMARY);

        if (refs.exportBtn) {
            refs.exportBtn.addEventListener('click', async () => {
                setStatus(refs, '全体エクスポートを準備しています…');
                try {
                    const snapshot = await collectFullSnapshot();
                    const fileName = downloadSnapshot(snapshot);
                    setSummary(refs, formatSummary(snapshot));
                    setStatus(refs, `${fileName} として保存しました。`, 'success');
                } catch (err) {
                    console.error('[StateManager] Export failed:', err);
                    setStatus(refs, 'エクスポートに失敗しました。コンソールログを確認してください。', 'error');
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
                setStatus(refs, `${file.name} を読み込み中です…`);
                try {
                    const text = await file.text();
                    const parsed = JSON.parse(text);
                    await applyFullSnapshot(parsed);
                    setSummary(refs, formatSummary(parsed));
                    setStatus(refs, '全体インポートが完了しました。', 'success');
                } catch (err) {
                    console.error('[StateManager] Import failed:', err);
                    setStatus(refs, 'インポートに失敗しました。ファイル形式を確認してください。', 'error');
                }
            });
        }
    }

    if (global.ToolsTab?.registerTool) {
        global.ToolsTab.registerTool(TOOL_ID, initStateManagerTool);
    }
})(window);

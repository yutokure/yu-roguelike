
(function (global) {
    'use strict';

    const VERSION = 1;
    const DIFFICULTY_ORDER = ['Very Easy', 'Easy', 'Normal', 'Second', 'Hard', 'Very Hard'];
    const numberFormatter = new Intl.NumberFormat('ja-JP');

    const CATEGORY_DEFINITIONS = [
        { id: 'dungeon', name: 'ダンジョン関連' },
        { id: 'blockdim', name: 'ブロック次元関連' },
        { id: 'tools', name: 'ツールズ関連' },
        { id: 'mini', name: 'ミニゲーム関連', comingSoon: true }
    ];

    const AUTO_ACHIEVEMENTS = [
        {
            id: 'dungeon_first_clear',
            category: 'dungeon',
            title: '初陣の証',
            description: 'いずれかのダンジョンを攻略する。',
            reward: '称号「新人冒険者」',
            condition: (stats) => stats.core.dungeonsCleared >= 1
        },
        {
            id: 'dungeon_hard_clear',
            category: 'dungeon',
            title: '高難度征服者',
            description: 'Hard 以上の難易度でダンジョンを攻略する。',
            reward: '高難易度攻略の記念メダル',
            condition: (stats) => stats.core.highestDifficultyIndex >= DIFFICULTY_ORDER.indexOf('Hard')
        },
        {
            id: 'dungeon_step_1000',
            category: 'dungeon',
            title: '千里の旅も一歩から',
            description: '累計移動距離を 1000 マスに到達させる。',
            reward: '移動ノウハウのメモ',
            condition: (stats) => stats.core.totalSteps >= 1000,
            progress: (stats) => {
                const current = stats.core.totalSteps || 0;
                const target = 1000;
                return {
                    current,
                    target,
                    percent: Math.min(1, current / target),
                    text: `${formatNumber(current)} / ${formatNumber(target)}`
                };
            }
        },
        {
            id: 'dungeon_boss_hunter',
            category: 'dungeon',
            title: 'ボスハンター',
            description: 'ボス撃破数がそのまま実績カウントになります。',
            reward: '称号「狩人」',
            type: 'counter',
            counter: (stats) => stats.core.bossesDefeated || 0,
            progress: (stats) => {
                const defeated = stats.core.bossesDefeated || 0;
                return {
                    current: defeated,
                    text: `${formatNumber(defeated)} 体撃破`
                };
            }
        },
        {
            id: 'dungeon_loop_runner',
            category: 'dungeon',
            title: '周回の達人',
            description: 'ダンジョンを 5 回攻略するごとにカウントが増える実績。',
            reward: '周回ログカード',
            type: 'repeatable',
            counter: (stats) => Math.floor((stats.core.dungeonsCleared || 0) / 5),
            progress: (stats) => {
                const total = stats.core.dungeonsCleared || 0;
                const step = 5;
                const remainder = total % step;
                return {
                    current: remainder,
                    target: step,
                    percent: Math.min(1, remainder / step),
                    text: remainder === 0 ? '次の達成まで 5 回' : `次の達成まで ${formatNumber(step - remainder)} 回`
                };
            }
        },
        {
            id: 'blockdim_first_gate',
            category: 'blockdim',
            title: 'ゲート起動',
            description: '初めて Gate からブロック次元に突入する。',
            reward: 'ゲート起動ログ',
            condition: (stats) => stats.blockdim.gatesOpened >= 1
        },
        {
            id: 'blockdim_bookmark_collector',
            category: 'blockdim',
            title: 'ブックマークコレクター',
            description: 'ブロック次元のブックマークを 5 件登録する。',
            reward: '組み合わせ研究ノート',
            condition: (stats) => stats.blockdim.bookmarksAdded >= 5,
            progress: (stats) => {
                const current = stats.blockdim.bookmarksAdded || 0;
                const target = 5;
                return {
                    current,
                    target,
                    percent: Math.min(1, current / target),
                    text: `${formatNumber(current)} / ${formatNumber(target)}`
                };
            }
        },
        {
            id: 'blockdim_weighted_explorer',
            category: 'blockdim',
            title: '狙い撃ち合成者',
            description: '重み付きランダム選択を使用する。',
            reward: '狙い撃ち計算式',
            condition: (stats) => stats.blockdim.weightedSelections >= 1
        },
        {
            id: 'tools_first_visit',
            category: 'tools',
            title: '工房デビュー',
            description: 'ツールズタブを開く。',
            reward: '作業手帳',
            condition: (stats) => stats.tools.tabVisits >= 1
        },
        {
            id: 'tools_mod_export',
            category: 'tools',
            title: 'アドオンビルダー',
            description: 'Mod 作成ツールでコードを書き出す。',
            reward: 'Mod 署名スタンプ',
            condition: (stats) => stats.tools.modExports >= 1
        },
        {
            id: 'tools_blockdata_saver',
            category: 'tools',
            title: 'データ整備士',
            description: 'BlockData エディタでデータを保存またはダウンロードする。',
            reward: '整備員バッジ',
            condition: (stats) => (stats.tools.blockdataSaves + stats.tools.blockdataDownloads) >= 1,
            progress: (stats) => {
                const total = (stats.tools.blockdataSaves || 0) + (stats.tools.blockdataDownloads || 0);
                return {
                    current: total,
                    text: `${formatNumber(total)} 回操作`
                };
            }
        },
        {
            id: 'tools_sandbox_session',
            category: 'tools',
            title: 'シミュレーション好き',
            description: 'サンドボックスインターフェースを開いて編集する。',
            reward: 'テストパス',
            condition: (stats) => stats.tools.sandboxSessions >= 1
        },
        {
            id: 'minigame_coming_soon',
            category: 'mini',
            title: 'ミニゲーム実績',
            description: 'COMING SOON - ミニゲーム用実績は近日追加予定です。',
            reward: '',
            comingSoon: true
        }
    ];

    const STAT_SECTIONS = [
        {
            id: 'core',
            title: 'ダンジョンの記録',
            entries: [
                { path: 'core.totalSteps', label: '総移動距離', description: 'これまでに歩いたマスの合計。', formatter: (value) => `${formatNumber(value)} マス` },
                { path: 'core.floorsAdvanced', label: '踏破した階層数', description: '階段で進んだ累積階層。', formatter: formatNumber },
                { path: 'core.dungeonsCleared', label: '攻略したダンジョン数', description: '通常・ブロック次元を含む攻略回数。', formatter: formatNumber },
                { path: 'core.enemiesDefeated', label: '撃破した敵', description: '倒した敵の合計数。', formatter: formatNumber },
                { path: 'core.bossesDefeated', label: 'ボス撃破数', description: '撃破したボスの数。', formatter: formatNumber },
                { path: 'core.totalExpEarned', label: '累計獲得EXP', description: '探索やミニゲームで得た経験値の合計。', formatter: (value) => `${formatNumber(Math.floor(value || 0))} EXP` },
                { path: 'core.damageDealt', label: '累計与ダメージ', description: '敵に与えたダメージ総量。', formatter: formatNumber },
                { path: 'core.damageTaken', label: '累計被ダメージ', description: '敵やギミックから受けたダメージ総量。', formatter: formatNumber },
                { path: 'core.chestsOpened', label: '開けた宝箱', description: '探索中に開封した宝箱の数。', formatter: formatNumber },
                { path: 'core.deaths', label: '戦闘不能回数', description: 'ゲームオーバーになった回数。', formatter: formatNumber },
                { path: 'core.highestDifficultyIndex', label: '最高攻略難易度', description: 'これまで攻略した最も高い難易度。', formatter: formatDifficultyLabel }
            ]
        },
        {
            id: 'blockdim',
            title: 'ブロック次元の記録',
            entries: [
                { path: 'blockdim.gatesOpened', label: 'Gate 起動回数', description: 'ブロック次元へ突入した回数。', formatter: formatNumber },
                { path: 'blockdim.bookmarksAdded', label: 'ブックマーク登録数', description: '保存したブックマークの数。', formatter: formatNumber },
                { path: 'blockdim.randomSelections', label: 'ランダム選択回数', description: '等確率ランダム選択を使った回数。', formatter: formatNumber },
                { path: 'blockdim.weightedSelections', label: '重み付き選択回数', description: '狙い撃ちランダムを使った回数。', formatter: formatNumber }
            ]
        },
        {
            id: 'tools',
            title: 'ツール利用状況',
            entries: [
                { path: 'tools.tabVisits', label: 'ツールズタブ訪問回数', description: 'ツールズタブを開いた回数。', formatter: formatNumber },
                { path: 'tools.modExports', label: 'Mod 出力回数', description: 'Mod 作成ツールで出力した回数。', formatter: formatNumber },
                { path: 'tools.blockdataSaves', label: 'BlockData 保存回数', description: 'BlockData エディタで保存した回数。', formatter: formatNumber },
                { path: 'tools.blockdataDownloads', label: 'BlockData ダウンロード回数', description: 'BlockData エディタからダウンロードした回数。', formatter: formatNumber },
                { path: 'tools.sandboxSessions', label: 'サンドボックス操作回数', description: 'サンドボックスUIを開いた回数。', formatter: formatNumber }
            ]
        }
    ];

    const state = {
        version: VERSION,
        stats: createDefaultStats(),
        achievements: {},
        custom: {},
        customOrder: []
    };

    const ui = {
        initialized: false,
        root: null,
        list: null,
        customList: null,
        customForm: null,
        statsList: null,
        statsSummary: null,
        categorySummary: null
    };

    let renderScheduled = false;
    let saveScheduled = false;

    function formatNumber(value) {
        if (!Number.isFinite(value)) return '0';
        return numberFormatter.format(Math.floor(value));
    }

    function formatDifficultyLabel(index) {
        if (!Number.isFinite(index) || index < 0) return '未攻略';
        const idx = Math.max(0, Math.min(DIFFICULTY_ORDER.length - 1, Math.floor(index)));
        return DIFFICULTY_ORDER[idx] || '未攻略';
    }

    function createDefaultStats() {
        return {
            core: {
                totalSteps: 0,
                floorsAdvanced: 0,
                dungeonsCleared: 0,
                enemiesDefeated: 0,
                bossesDefeated: 0,
                totalExpEarned: 0,
                damageDealt: 0,
                damageTaken: 0,
                chestsOpened: 0,
                deaths: 0,
                highestDifficultyIndex: -1,
                lastClearedDifficulty: '',
                lastClearedMode: '',
                lastClearedAt: 0,
                lastDeathAt: 0
            },
            blockdim: {
                gatesOpened: 0,
                bookmarksAdded: 0,
                randomSelections: 0,
                weightedSelections: 0
            },
            tools: {
                tabVisits: 0,
                modExports: 0,
                blockdataSaves: 0,
                blockdataDownloads: 0,
                sandboxSessions: 0
            }
        };
    }

    function deepClone(value) {
        if (value === null || value === undefined) return value;
        try {
            return JSON.parse(JSON.stringify(value));
        } catch (err) {
            return value;
        }
    }

    function difficultyIndex(value) {
        if (typeof value !== 'string') return -1;
        const idx = DIFFICULTY_ORDER.indexOf(value);
        return idx >= 0 ? idx : -1;
    }

    function normalizeStats(raw) {
        const base = createDefaultStats();
        if (!raw || typeof raw !== 'object') return base;
        mergeStats(base, raw);
        return base;
    }

    function mergeStats(target, source) {
        if (!source || typeof source !== 'object') return;
        for (const [key, value] of Object.entries(source)) {
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                if (typeof target[key] !== 'object' || target[key] === null) {
                    target[key] = {};
                }
                mergeStats(target[key], value);
            } else if (Number.isFinite(value)) {
                target[key] = value;
            }
        }
    }

    function normalizeAchievementRecord(record) {
        if (!record || typeof record !== 'object') {
            return { unlocked: false, count: 0, firstUnlockedAt: null, updatedAt: null };
        }
        return {
            unlocked: !!record.unlocked,
            count: Number.isFinite(record.count) ? Math.max(0, Math.floor(record.count)) : 0,
            firstUnlockedAt: Number.isFinite(record.firstUnlockedAt) ? Number(record.firstUnlockedAt) : null,
            updatedAt: Number.isFinite(record.updatedAt) ? Number(record.updatedAt) : null
        };
    }

    function normalizeCustomEntry(entry) {
        if (!entry || typeof entry !== 'object') return null;
        const type = ['todo', 'repeatable', 'counter'].includes(entry.type) ? entry.type : 'todo';
        const now = Date.now();
        return {
            id: String(entry.id || `custom-${now}`),
            title: String(entry.title || 'カスタム実績'),
            description: entry.description ? String(entry.description) : '',
            reward: entry.reward ? String(entry.reward) : '',
            type,
            target: Number.isFinite(entry.target) && entry.target > 0 ? Math.floor(entry.target) : null,
            completed: type === 'todo' ? !!entry.completed : false,
            completions: type === 'repeatable' ? Math.max(0, Math.floor(entry.completions ?? entry.count ?? 0)) : 0,
            value: type === 'counter' ? Math.max(0, Math.floor(entry.value ?? entry.count ?? 0)) : 0,
            createdAt: Number.isFinite(entry.createdAt) ? Number(entry.createdAt) : now,
            updatedAt: Number.isFinite(entry.updatedAt) ? Number(entry.updatedAt) : now
        };
    }

    function getStatValue(path) {
        const keys = Array.isArray(path) ? path : String(path).split('.');
        let ref = state.stats;
        for (const key of keys) {
            if (!ref || typeof ref !== 'object') return 0;
            ref = ref[key];
        }
        return Number(ref) || 0;
    }

    function incrementStat(path, amount) {
        const numeric = Number(amount);
        if (!Number.isFinite(numeric) || numeric === 0) return false;
        const keys = Array.isArray(path) ? path : String(path).split('.');
        let target = state.stats;
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (typeof target[key] !== 'object' || target[key] === null) {
                target[key] = {};
            }
            target = target[key];
        }
        const lastKey = keys[keys.length - 1];
        const current = Number(target[lastKey]) || 0;
        const next = current + numeric;
        if (next === current) return false;
        target[lastKey] = next;
        return true;
    }

    function scheduleRender() {
        if (!ui.initialized) return;
        if (renderScheduled) return;
        renderScheduled = true;
        const callback = () => {
            renderScheduled = false;
            renderAll();
        };
        if (typeof global.requestAnimationFrame === 'function') {
            global.requestAnimationFrame(callback);
        } else {
            setTimeout(callback, 0);
        }
    }

    function scheduleSave() {
        if (saveScheduled) return;
        saveScheduled = true;
        const flush = () => {
            saveScheduled = false;
            try {
                if (typeof global.saveAll === 'function') {
                    global.saveAll();
                }
            } catch (err) {
                // ignore persistence errors
            }
        };
        if (typeof global.requestIdleCallback === 'function') {
            global.requestIdleCallback(flush, { timeout: 1000 });
        } else {
            setTimeout(flush, 250);
        }
    }

    function evaluateAutoAchievements() {
        let changed = false;
        for (const def of AUTO_ACHIEVEMENTS) {
            if (def.comingSoon) continue;
            const record = normalizeAchievementRecord(state.achievements[def.id]);
            const stats = state.stats;
            if (def.type === 'repeatable') {
                const count = Math.max(0, Math.floor(def.counter ? def.counter(stats) : 0));
                if (count !== record.count) {
                    record.count = count;
                    record.updatedAt = Date.now();
                    changed = true;
                }
                if (count > 0 && !record.unlocked) {
                    record.unlocked = true;
                    record.firstUnlockedAt = record.firstUnlockedAt || Date.now();
                    record.updatedAt = Date.now();
                    changed = true;
                }
            } else if (def.type === 'counter') {
                const count = Math.max(0, Math.floor(def.counter ? def.counter(stats) : 0));
                if (count !== record.count) {
                    record.count = count;
                    record.updatedAt = Date.now();
                    changed = true;
                }
                if (count > 0 && !record.unlocked) {
                    record.unlocked = true;
                    record.firstUnlockedAt = record.firstUnlockedAt || Date.now();
                    record.updatedAt = Date.now();
                    changed = true;
                }
            } else {
                const unlocked = def.condition ? !!def.condition(stats) : false;
                if (unlocked && !record.unlocked) {
                    record.unlocked = true;
                    record.firstUnlockedAt = record.firstUnlockedAt || Date.now();
                    record.updatedAt = Date.now();
                    changed = true;
                }
            }
            state.achievements[def.id] = record;
        }
        return changed;
    }

    function renderAll() {
        evaluateAutoAchievements();
        renderAchievements();
        renderCustomAchievements();
        renderCategorySummary();
        renderStatisticsSummary();
        renderStats();
    }

    function renderAchievements() {
        if (!ui.list) return;
        ui.list.innerHTML = '';
        const fragment = document.createDocumentFragment();
        for (const category of CATEGORY_DEFINITIONS) {
            const section = document.createElement('section');
            section.className = 'achievement-category';
            const header = document.createElement('header');
            header.className = 'achievement-category__header';
            const title = document.createElement('h4');
            title.textContent = category.name;
            header.appendChild(title);
            section.appendChild(header);

            const defs = AUTO_ACHIEVEMENTS.filter(def => def.category === category.id);
            if (category.comingSoon) {
                const coming = document.createElement('p');
                coming.className = 'achievement-coming-soon';
                coming.textContent = '実績は近日追加予定です。';
                section.appendChild(coming);
                fragment.appendChild(section);
                continue;
            }

            if (defs.length === 0) {
                const empty = document.createElement('p');
                empty.className = 'achievement-empty';
                empty.textContent = '登録されている実績はまだありません。';
                section.appendChild(empty);
                fragment.appendChild(section);
                continue;
            }

            const grid = document.createElement('div');
            grid.className = 'achievement-card-grid';

            for (const def of defs) {
                const record = state.achievements[def.id] || { unlocked: false, count: 0 };
                const card = document.createElement('article');
                card.className = 'achievement-card';
                const unlocked = !!record.unlocked || (record.count || 0) > 0;
                card.classList.add(unlocked ? 'achievement-card--unlocked' : 'achievement-card--locked');
                if (def.comingSoon) {
                    card.classList.add('achievement-card--coming-soon');
                }

                const headerRow = document.createElement('div');
                headerRow.className = 'achievement-card__header';
                const heading = document.createElement('h5');
                heading.textContent = def.title;
                headerRow.appendChild(heading);
                const status = document.createElement('span');
                status.className = 'achievement-card__status';
                status.textContent = def.comingSoon ? 'COMING SOON' : (unlocked ? '達成済み' : '未達成');
                headerRow.appendChild(status);
                card.appendChild(headerRow);

                if (def.description) {
                    const desc = document.createElement('p');
                    desc.className = 'achievement-card__description';
                    desc.textContent = def.description;
                    card.appendChild(desc);
                }

                if (def.reward) {
                    const reward = document.createElement('p');
                    reward.className = 'achievement-card__reward';
                    reward.textContent = `報酬メモ: ${def.reward}`;
                    card.appendChild(reward);
                }

                const progress = def.progress ? def.progress(state.stats, record) : null;
                const counterValue = record.count || 0;
                if (progress && (progress.text || Number.isFinite(progress.percent))) {
                    const progressEl = document.createElement('div');
                    progressEl.className = 'achievement-card__progress';
                    if (Number.isFinite(progress.percent) && progress.target) {
                        const bar = document.createElement('div');
                        bar.className = 'achievement-progress-bar';
                        const fill = document.createElement('div');
                        fill.className = 'achievement-progress-bar__fill';
                        fill.style.width = `${Math.max(0, Math.min(100, Math.round(progress.percent * 100)))}%`;
                        bar.appendChild(fill);
                        progressEl.appendChild(bar);
                    }
                    if (progress.text) {
                        const text = document.createElement('span');
                        text.textContent = progress.text;
                        progressEl.appendChild(text);
                    }
                    card.appendChild(progressEl);
                }

                if ((def.type === 'repeatable' || def.type === 'counter') && counterValue >= 0) {
                    const meta = document.createElement('div');
                    meta.className = 'achievement-card__meta';
                    const label = def.type === 'repeatable' ? '累計達成回数' : '達成数';
                    meta.textContent = `${label}: ${formatNumber(counterValue)}`;
                    card.appendChild(meta);
                }

                grid.appendChild(card);
            }

            section.appendChild(grid);
            fragment.appendChild(section);
        }

        ui.list.appendChild(fragment);
    }

    function renderCategorySummary() {
        if (!ui.categorySummary) return;
        const list = document.createElement('ul');
        list.className = 'achievement-category-summary__list';
        for (const category of CATEGORY_DEFINITIONS) {
            const item = document.createElement('li');
            item.className = 'achievement-category-summary__item';
            const name = document.createElement('span');
            name.className = 'category-name';
            name.textContent = category.name;
            const value = document.createElement('span');
            value.className = 'category-progress';
            if (category.comingSoon) {
                value.textContent = 'Coming Soon';
            } else {
                const defs = AUTO_ACHIEVEMENTS.filter(def => def.category === category.id && !def.comingSoon);
                if (defs.length === 0) {
                    value.textContent = '-';
                } else {
                    const unlocked = defs.filter(def => {
                        const record = state.achievements[def.id];
                        if (!record) return false;
                        if (def.type === 'repeatable' || def.type === 'counter') {
                            return (record.count || 0) > 0;
                        }
                        return !!record.unlocked;
                    }).length;
                    value.textContent = `${unlocked}/${defs.length}`;
                }
            }
            item.appendChild(name);
            item.appendChild(value);
            list.appendChild(item);
        }
        ui.categorySummary.innerHTML = '';
        ui.categorySummary.appendChild(list);
    }

    function renderStatisticsSummary() {
        if (!ui.statsSummary) return;
        const stats = state.stats.core;
        const highlights = [
            { label: '攻略ダンジョン', value: formatNumber(stats.dungeonsCleared) },
            { label: '最高難易度', value: formatDifficultyLabel(stats.highestDifficultyIndex) },
            { label: '累計EXP', value: `${formatNumber(Math.floor(stats.totalExpEarned || 0))} EXP` }
        ];
        const list = document.createElement('ul');
        list.className = 'statistics-summary__list';
        for (const item of highlights) {
            const li = document.createElement('li');
            li.className = 'statistics-summary__item';
            const label = document.createElement('span');
            label.className = 'summary-label';
            label.textContent = item.label;
            const value = document.createElement('span');
            value.className = 'summary-value';
            value.textContent = item.value;
            li.appendChild(label);
            li.appendChild(value);
            list.appendChild(li);
        }
        ui.statsSummary.innerHTML = '';
        ui.statsSummary.appendChild(list);
    }

    function renderStats() {
        if (!ui.statsList) return;
        ui.statsList.innerHTML = '';
        const fragment = document.createDocumentFragment();
        for (const sectionDef of STAT_SECTIONS) {
            const section = document.createElement('section');
            section.className = 'statistics-section';
            const heading = document.createElement('h4');
            heading.textContent = sectionDef.title;
            section.appendChild(heading);
            const table = document.createElement('table');
            table.className = 'statistics-table';
            for (const entry of sectionDef.entries) {
                const valueRaw = getStatValue(entry.path);
                const formatter = entry.formatter || formatNumber;
                const display = formatter(valueRaw, state.stats);
                const row = document.createElement('tr');
                const th = document.createElement('th');
                th.textContent = entry.label;
                const tdValue = document.createElement('td');
                tdValue.textContent = display;
                const tdDesc = document.createElement('td');
                tdDesc.textContent = entry.description || '';
                row.appendChild(th);
                row.appendChild(tdValue);
                row.appendChild(tdDesc);
                table.appendChild(row);
            }
            section.appendChild(table);
            fragment.appendChild(section);
        }
        ui.statsList.appendChild(fragment);
    }

    function getCustomEntries() {
        const entries = [];
        for (const id of state.customOrder) {
            const entry = state.custom[id];
            if (entry) entries.push(entry);
        }
        return entries;
    }

    function renderCustomAchievements() {
        if (!ui.customList) return;
        const entries = getCustomEntries();
        ui.customList.innerHTML = '';
        if (!entries.length) {
            const empty = document.createElement('p');
            empty.className = 'custom-achievement-empty';
            empty.textContent = 'カスタム実績はまだありません。フォームから追加できます。';
            ui.customList.appendChild(empty);
            return;
        }
        const fragment = document.createDocumentFragment();
        for (const entry of entries) {
            const card = document.createElement('article');
            card.className = 'achievement-card custom-achievement-card';
            card.dataset.customId = entry.id;
            const header = document.createElement('div');
            header.className = 'achievement-card__header';
            const title = document.createElement('h5');
            title.textContent = entry.title;
            header.appendChild(title);
            const actions = document.createElement('div');
            actions.className = 'achievement-card__actions';
            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'danger';
            deleteBtn.dataset.action = 'delete';
            deleteBtn.textContent = '削除';
            actions.appendChild(deleteBtn);
            header.appendChild(actions);
            card.appendChild(header);

            if (entry.description) {
                const desc = document.createElement('p');
                desc.className = 'achievement-card__description';
                desc.textContent = entry.description;
                card.appendChild(desc);
            }
            if (entry.reward) {
                const reward = document.createElement('p');
                reward.className = 'achievement-card__reward';
                reward.textContent = `報酬メモ: ${entry.reward}`;
                card.appendChild(reward);
            }

            if (entry.type === 'todo') {
                const status = document.createElement('p');
                status.className = 'custom-achievement-status';
                status.textContent = entry.completed ? '状態: 完了済み' : '状態: 未完了';
                card.appendChild(status);
                const controls = document.createElement('div');
                controls.className = 'custom-achievement-controls';
                const toggle = document.createElement('button');
                toggle.type = 'button';
                toggle.dataset.action = 'toggle';
                toggle.textContent = entry.completed ? '未完了に戻す' : '完了にする';
                controls.appendChild(toggle);
                card.appendChild(controls);
            } else if (entry.type === 'repeatable') {
                const info = document.createElement('p');
                info.className = 'custom-achievement-info';
                const targetText = entry.target ? ` / 目標 ${formatNumber(entry.target)} 回` : '';
                info.textContent = `累計達成回数: ${formatNumber(entry.completions)} 回${targetText}`;
                card.appendChild(info);
                const controls = document.createElement('div');
                controls.className = 'custom-achievement-controls';
                const minus = document.createElement('button');
                minus.type = 'button';
                minus.dataset.action = 'decrement';
                minus.textContent = '-1';
                const plus = document.createElement('button');
                plus.type = 'button';
                plus.dataset.action = 'increment';
                plus.textContent = '+1';
                const reset = document.createElement('button');
                reset.type = 'button';
                reset.dataset.action = 'reset';
                reset.textContent = 'リセット';
                controls.appendChild(minus);
                controls.appendChild(plus);
                controls.appendChild(reset);
                card.appendChild(controls);
            } else if (entry.type === 'counter') {
                const info = document.createElement('p');
                info.className = 'custom-achievement-info';
                const targetText = entry.target ? ` / 目標 ${formatNumber(entry.target)}` : '';
                info.textContent = `現在値: ${formatNumber(entry.value)}${targetText}`;
                card.appendChild(info);
                const controls = document.createElement('div');
                controls.className = 'custom-achievement-controls';
                const minus = document.createElement('button');
                minus.type = 'button';
                minus.dataset.action = 'decrement';
                minus.textContent = '-1';
                const plus = document.createElement('button');
                plus.type = 'button';
                plus.dataset.action = 'increment';
                plus.textContent = '+1';
                const reset = document.createElement('button');
                reset.type = 'button';
                reset.dataset.action = 'reset';
                reset.textContent = 'リセット';
                controls.appendChild(minus);
                controls.appendChild(plus);
                controls.appendChild(reset);
                card.appendChild(controls);
            }

            fragment.appendChild(card);
        }
        ui.customList.appendChild(fragment);
    }

    function addCustomAchievement({ title, description, reward, type, target }) {
        const now = Date.now();
        const id = `custom-${now.toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
        const entry = {
            id,
            title: title || 'カスタム実績',
            description: description || '',
            reward: reward || '',
            type,
            target: Number.isFinite(target) && target > 0 ? Math.floor(target) : null,
            completed: type === 'todo' ? false : false,
            completions: type === 'repeatable' ? 0 : 0,
            value: type === 'counter' ? 0 : 0,
            createdAt: now,
            updatedAt: now
        };
        state.custom[id] = entry;
        state.customOrder.unshift(id);
        notifyChange();
        return id;
    }

    function deleteCustomAchievement(id) {
        if (!id || !state.custom[id]) return;
        delete state.custom[id];
        state.customOrder = state.customOrder.filter(item => item !== id);
        notifyChange();
    }

    function toggleCustomTodo(id) {
        const entry = state.custom[id];
        if (!entry || entry.type !== 'todo') return;
        entry.completed = !entry.completed;
        entry.updatedAt = Date.now();
        notifyChange();
    }

    function incrementCustomRepeatable(id, delta) {
        const entry = state.custom[id];
        if (!entry || entry.type !== 'repeatable') return;
        const next = Math.max(0, (entry.completions || 0) + delta);
        entry.completions = next;
        entry.updatedAt = Date.now();
        notifyChange();
    }

    function adjustCustomCounter(id, delta) {
        const entry = state.custom[id];
        if (!entry || entry.type !== 'counter') return;
        const next = Math.max(0, (entry.value || 0) + delta);
        entry.value = next;
        entry.updatedAt = Date.now();
        notifyChange();
    }

    function resetCustomProgress(id) {
        const entry = state.custom[id];
        if (!entry) return;
        if (entry.type === 'repeatable') {
            entry.completions = 0;
        } else if (entry.type === 'counter') {
            entry.value = 0;
        }
        entry.updatedAt = Date.now();
        notifyChange();
    }

    function notifyChange() {
        scheduleRender();
        scheduleSave();
    }

    function recordEvent(type, payload = {}) {
        let mutated = false;
        switch (type) {
            case 'move': {
                const steps = Math.max(0, Math.floor(Number(payload.steps) || 0));
                if (steps > 0) mutated = incrementStat('core.totalSteps', steps) || mutated;
                break;
            }
            case 'floor_advanced': {
                mutated = incrementStat('core.floorsAdvanced', 1) || mutated;
                break;
            }
            case 'dungeon_cleared': {
                mutated = incrementStat('core.dungeonsCleared', 1) || mutated;
                const idx = difficultyIndex(payload.difficulty);
                if (idx > state.stats.core.highestDifficultyIndex) {
                    state.stats.core.highestDifficultyIndex = idx;
                    mutated = true;
                }
                if (typeof payload.difficulty === 'string') {
                    state.stats.core.lastClearedDifficulty = payload.difficulty;
                    mutated = true;
                }
                if (payload.mode) {
                    state.stats.core.lastClearedMode = payload.mode;
                    mutated = true;
                }
                state.stats.core.lastClearedAt = Date.now();
                mutated = true;
                break;
            }
            case 'exp_earned': {
                const amount = Number(payload.amount);
                if (Number.isFinite(amount) && amount > 0) {
                    mutated = incrementStat('core.totalExpEarned', amount) || mutated;
                }
                break;
            }
            case 'damage_dealt': {
                const amount = Number(payload.amount);
                if (Number.isFinite(amount) && amount > 0) {
                    mutated = incrementStat('core.damageDealt', amount) || mutated;
                }
                break;
            }
            case 'damage_taken': {
                const amount = Number(payload.amount);
                if (Number.isFinite(amount) && amount > 0) {
                    mutated = incrementStat('core.damageTaken', amount) || mutated;
                }
                break;
            }
            case 'enemy_defeated': {
                mutated = incrementStat('core.enemiesDefeated', 1) || mutated;
                if (payload && payload.boss) {
                    mutated = incrementStat('core.bossesDefeated', 1) || mutated;
                }
                break;
            }
            case 'boss_defeated': {
                mutated = incrementStat('core.bossesDefeated', 1) || mutated;
                mutated = incrementStat('core.enemiesDefeated', 1) || mutated;
                break;
            }
            case 'chest_opened': {
                mutated = incrementStat('core.chestsOpened', 1) || mutated;
                break;
            }
            case 'death': {
                mutated = incrementStat('core.deaths', 1) || mutated;
                state.stats.core.lastDeathAt = Date.now();
                mutated = true;
                break;
            }
            case 'blockdim_gate': {
                mutated = incrementStat('blockdim.gatesOpened', 1) || mutated;
                break;
            }
            case 'blockdim_bookmark': {
                mutated = incrementStat('blockdim.bookmarksAdded', 1) || mutated;
                break;
            }
            case 'blockdim_random': {
                if (payload && payload.weighted) {
                    mutated = incrementStat('blockdim.weightedSelections', 1) || mutated;
                } else {
                    mutated = incrementStat('blockdim.randomSelections', 1) || mutated;
                }
                break;
            }
            case 'tools_tab_opened': {
                mutated = incrementStat('tools.tabVisits', 1) || mutated;
                break;
            }
            case 'tools_mod_export': {
                mutated = incrementStat('tools.modExports', 1) || mutated;
                break;
            }
            case 'tools_blockdata_download': {
                mutated = incrementStat('tools.blockdataDownloads', 1) || mutated;
                break;
            }
            case 'tools_blockdata_save': {
                mutated = incrementStat('tools.blockdataSaves', 1) || mutated;
                break;
            }
            case 'sandbox_session': {
                mutated = incrementStat('tools.sandboxSessions', 1) || mutated;
                break;
            }
            default:
                break;
        }
        if (mutated) {
            evaluateAutoAchievements();
            notifyChange();
        }
    }

    function bindCustomForm() {
        if (!ui.customForm) return;
        const titleInput = ui.customForm.querySelector('#custom-achievement-title-input');
        const descInput = ui.customForm.querySelector('#custom-achievement-desc-input');
        const rewardInput = ui.customForm.querySelector('#custom-achievement-reward-input');
        const typeInput = ui.customForm.querySelector('#custom-achievement-type-input');
        const targetInput = ui.customForm.querySelector('#custom-achievement-target-input');
        const targetField = ui.customForm.querySelector('.target-field');

        function updateTargetVisibility() {
            if (!typeInput || !targetField) return;
            const value = typeInput.value;
            const show = value === 'repeatable' || value === 'counter';
            targetField.style.display = show ? '' : 'none';
        }

        if (typeInput) {
            typeInput.addEventListener('change', updateTargetVisibility);
            updateTargetVisibility();
        }

        ui.customForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const title = (titleInput?.value || '').trim();
            if (!title) {
                titleInput?.focus();
                return;
            }
            const description = (descInput?.value || '').trim();
            const reward = (rewardInput?.value || '').trim();
            const type = typeInput ? typeInput.value : 'todo';
            const targetRaw = targetInput ? Number(targetInput.value) : null;
            const target = Number.isFinite(targetRaw) && targetRaw > 0 ? Math.floor(targetRaw) : null;
            addCustomAchievement({ title, description, reward, type, target });
            ui.customForm.reset();
            updateTargetVisibility();
        });
    }

    function bindCustomListEvents() {
        if (!ui.customList) return;
        ui.customList.addEventListener('click', (event) => {
            const button = event.target.closest('[data-action]');
            if (!button) return;
            const card = button.closest('[data-custom-id]');
            if (!card) return;
            const id = card.dataset.customId;
            const action = button.dataset.action;
            switch (action) {
                case 'delete': {
                    if (confirm('このカスタム実績を削除しますか？')) {
                        deleteCustomAchievement(id);
                    }
                    break;
                }
                case 'toggle':
                    toggleCustomTodo(id);
                    break;
                case 'increment':
                    incrementCustomRepeatable(id, 1);
                    adjustCustomCounter(id, 1);
                    break;
                case 'decrement':
                    incrementCustomRepeatable(id, -1);
                    adjustCustomCounter(id, -1);
                    break;
                case 'reset':
                    resetCustomProgress(id);
                    break;
                default:
                    break;
            }
        });
    }

    function exportState() {
        return deepClone({
            version: VERSION,
            stats: state.stats,
            achievements: state.achievements,
            custom: state.custom,
            customOrder: state.customOrder
        });
    }

    function importState(snapshot) {
        if (!snapshot || typeof snapshot !== 'object') {
            state.stats = createDefaultStats();
            state.achievements = {};
            state.custom = {};
            state.customOrder = [];
            if (ui.initialized) renderAll();
            return;
        }
        state.stats = normalizeStats(snapshot.stats || snapshot); // fallback for older saves
        state.achievements = {};
        if (snapshot.achievements && typeof snapshot.achievements === 'object') {
            for (const [id, record] of Object.entries(snapshot.achievements)) {
                state.achievements[id] = normalizeAchievementRecord(record);
            }
        }
        state.custom = {};
        state.customOrder = Array.isArray(snapshot.customOrder) ? snapshot.customOrder.slice() : [];
        if (snapshot.custom && typeof snapshot.custom === 'object') {
            for (const [id, entry] of Object.entries(snapshot.custom)) {
                const normalized = normalizeCustomEntry({ ...entry, id });
                if (normalized) state.custom[id] = normalized;
            }
        }
        state.customOrder = state.customOrder.filter((id) => state.custom[id]);
        evaluateAutoAchievements();
        if (ui.initialized) renderAll();
    }

    function initUI(options = {}) {
        if (ui.initialized) return;
        ui.root = options.root || null;
        ui.list = options.list || null;
        ui.customList = options.customList || null;
        ui.customForm = options.customForm || null;
        ui.statsList = options.statsList || null;
        ui.statsSummary = options.statsSummary || null;
        ui.categorySummary = options.categorySummary || null;
        ui.initialized = true;
        if (ui.customForm) bindCustomForm();
        if (ui.customList) bindCustomListEvents();
        renderAll();
    }

    function refresh() {
        if (!ui.initialized) return;
        renderAll();
    }

    global.AchievementSystem = {
        initUI,
        recordEvent,
        exportState,
        importState,
        refresh
    };
})(window);

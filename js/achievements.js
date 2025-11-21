
(function (global) {
    'use strict';

    const VERSION = 2;
    const DIFFICULTY_ORDER = [
        { key: 'veryEasy', label: 'Very Easy', value: 'Very Easy' },
        { key: 'easy', label: 'Easy', value: 'Easy' },
        { key: 'normal', label: 'Normal', value: 'Normal' },
        { key: 'second', label: 'Second', value: 'Second' },
        { key: 'hard', label: 'Hard', value: 'Hard' },
        { key: 'veryHard', label: 'Very Hard', value: 'Very Hard' }
    ];
    const PLAYTIME_TRACKING_INTERVAL_MS = 1000;

    const CATEGORY_DEFINITIONS = [
        { id: 'dungeon', name: 'ダンジョン関連', nameKey: 'achievements.categories.dungeon' },
        { id: 'blockdim', name: 'ブロック次元関連', nameKey: 'achievements.categories.blockdim' },
        { id: 'hatena', name: 'ハテナブロック関連', nameKey: 'achievements.categories.hatena' },
        { id: 'tools', name: 'ツールズ関連', nameKey: 'achievements.categories.tools' },
        { id: 'mini', name: 'ミニゲーム関連', nameKey: 'achievements.categories.mini', comingSoon: true }
    ];

    const AUTO_ACHIEVEMENTS = [
        {
            id: 'dungeon_first_clear',
            category: 'dungeon',
            titleKey: 'achievements.auto.dungeon_first_clear.title',
            title: '初陣の証',
            descriptionKey: 'achievements.auto.dungeon_first_clear.description',
            description: 'いずれかのダンジョンを攻略する。',
            rewardKey: 'achievements.auto.dungeon_first_clear.reward',
            reward: '称号「新人冒険者」',
            condition: (stats) => stats.core.dungeonsCleared >= 1
        },
        {
            id: 'dungeon_hard_clear',
            category: 'dungeon',
            titleKey: 'achievements.auto.dungeon_hard_clear.title',
            title: '高難度征服者',
            descriptionKey: 'achievements.auto.dungeon_hard_clear.description',
            description: 'Hard 以上の難易度でダンジョンを攻略する。',
            rewardKey: 'achievements.auto.dungeon_hard_clear.reward',
            reward: '高難易度攻略の記念メダル',
            condition: (stats) => stats.core.highestDifficultyIndex >= difficultyIndex('Hard')
        },
        {
            id: 'dungeon_step_1000',
            category: 'dungeon',
            titleKey: 'achievements.auto.dungeon_step_1000.title',
            title: '千里の旅も一歩から',
            descriptionKey: 'achievements.auto.dungeon_step_1000.description',
            description: '累計移動距離を 1000 マスに到達させる。',
            rewardKey: 'achievements.auto.dungeon_step_1000.reward',
            reward: '移動ノウハウのメモ',
            condition: (stats) => stats.core.totalSteps >= 1000,
            progress: (stats) => {
                const current = stats.core.totalSteps || 0;
                const target = 1000;
                return {
                    current,
                    target,
                    percent: Math.min(1, current / target),
                    text: translate('achievements.progress.ratio', {
                        current: formatNumber(current),
                        target: formatNumber(target)
                    }, `${formatNumber(current)} / ${formatNumber(target)}`)
                };
            }
        },
        {
            id: 'dungeon_boss_hunter',
            category: 'dungeon',
            titleKey: 'achievements.auto.dungeon_boss_hunter.title',
            title: 'ボスハンター',
            descriptionKey: 'achievements.auto.dungeon_boss_hunter.description',
            description: 'ボス撃破数がそのまま実績カウントになります。',
            rewardKey: 'achievements.auto.dungeon_boss_hunter.reward',
            reward: '称号「狩人」',
            type: 'counter',
            counter: (stats) => stats.core.bossesDefeated || 0,
            progress: (stats) => {
                const defeated = stats.core.bossesDefeated || 0;
                return {
                    current: defeated,
                    text: translate('achievements.progress.bossDefeated', {
                        count: formatNumber(defeated)
                    }, `${formatNumber(defeated)} 体撃破`)
                };
            }
        },
        {
            id: 'dungeon_loop_runner',
            category: 'dungeon',
            titleKey: 'achievements.auto.dungeon_loop_runner.title',
            title: '周回の達人',
            descriptionKey: 'achievements.auto.dungeon_loop_runner.description',
            description: 'ダンジョンを 5 回攻略するごとにカウントが増える実績。',
            rewardKey: 'achievements.auto.dungeon_loop_runner.reward',
            reward: '周回ログカード',
            type: 'repeatable',
            counter: (stats) => Math.floor((stats.core.dungeonsCleared || 0) / 5),
            progress: (stats) => {
                const total = stats.core.dungeonsCleared || 0;
                const step = 5;
                const remainder = total % step;
                const remaining = remainder === 0 ? step : step - remainder;
                return {
                    current: remainder,
                    target: step,
                    percent: Math.min(1, remainder / step),
                    text: translate('achievements.progress.nextRuns', {
                        count: formatNumber(remaining)
                    }, remainder === 0
                        ? '次の達成まで 5 回'
                        : `次の達成まで ${formatNumber(remaining)} 回`)
                };
            }
        },
        {
            id: 'dungeon_floor_master',
            category: 'dungeon',
            titleKey: 'achievements.auto.dungeon_floor_master.title',
            title: '深淵踏破者',
            descriptionKey: 'achievements.auto.dungeon_floor_master.description',
            description: '最高到達階層を 30F 以上にする。',
            rewardKey: 'achievements.auto.dungeon_floor_master.reward',
            reward: '称号「深淵踏破者」',
            condition: (stats) => stats.core.highestFloorReached >= 30,
            progress: (stats) => {
                const current = stats.core.highestFloorReached || 1;
                const target = 30;
                return {
                    current,
                    target,
                    percent: Math.min(1, current / target),
                    text: translate('achievements.progress.floorRatio', {
                        current: formatNumber(current),
                        target: formatNumber(target)
                    }, `${formatNumber(current)}F / ${formatNumber(target)}F`)
                };
            }
        },
        {
            id: 'dungeon_healing_specialist',
            category: 'dungeon',
            titleKey: 'achievements.auto.dungeon_healing_specialist.title',
            title: '応急の達人',
            descriptionKey: 'achievements.auto.dungeon_healing_specialist.description',
            description: '回復アイテムを 25 回使用する。',
            rewardKey: 'achievements.auto.dungeon_healing_specialist.reward',
            reward: '回復の心得',
            condition: (stats) => stats.core.healingItemsUsed >= 25,
            progress: (stats) => {
                const current = stats.core.healingItemsUsed || 0;
                const target = 25;
                return {
                    current,
                    target,
                    percent: Math.min(1, current / target),
                    text: translate('achievements.progress.ratio', {
                        current: formatNumber(current),
                        target: formatNumber(target)
                    }, `${formatNumber(current)} / ${formatNumber(target)}`)
                };
            }
        },
        {
            id: 'dungeon_auto_guardian',
            category: 'dungeon',
            titleKey: 'achievements.auto.dungeon_auto_guardian.title',
            title: '自動防衛システム',
            descriptionKey: 'achievements.auto.dungeon_auto_guardian.description',
            description: 'オートアイテムを 10 回発動させる。',
            rewardKey: 'achievements.auto.dungeon_auto_guardian.reward',
            reward: '自動回復コア',
            condition: (stats) => stats.core.autoItemsTriggered >= 10,
            progress: (stats) => {
                const current = stats.core.autoItemsTriggered || 0;
                const target = 10;
                return {
                    current,
                    target,
                    percent: Math.min(1, current / target),
                    text: current >= target
                        ? translate('achievements.progress.completed', null, '達成！')
                        : translate('achievements.progress.remaining', {
                            count: formatNumber(target - current)
                        }, `あと ${formatNumber(target - current)} 回`)
                };
            }
        },
        {
            id: 'dungeon_playtime_30min',
            category: 'dungeon',
            titleKey: 'achievements.auto.dungeon_playtime_30min.title',
            title: '冒険の始まり',
            descriptionKey: 'achievements.auto.dungeon_playtime_30min.description',
            description: '累計プレイ時間を 30 分に到達させる。',
            rewardKey: 'achievements.auto.dungeon_playtime_30min.reward',
            reward: '携帯砂時計',
            condition: (stats) => stats.core.playTimeSeconds >= 1800,
            progress: (stats) => createDurationProgress(stats.core.playTimeSeconds, 1800)
        },
        {
            id: 'dungeon_playtime_3hour',
            category: 'dungeon',
            titleKey: 'achievements.auto.dungeon_playtime_3hour.title',
            title: '時間を忘れて',
            descriptionKey: 'achievements.auto.dungeon_playtime_3hour.description',
            description: '累計プレイ時間を 3 時間に到達させる。',
            rewardKey: 'achievements.auto.dungeon_playtime_3hour.reward',
            reward: '熟練冒険者の時計',
            condition: (stats) => stats.core.playTimeSeconds >= 10800,
            progress: (stats) => createDurationProgress(stats.core.playTimeSeconds, 10800)
        },
        {
            id: 'dungeon_playtime_12hour',
            category: 'dungeon',
            titleKey: 'achievements.auto.dungeon_playtime_12hour.title',
            title: '止まらない探索心',
            descriptionKey: 'achievements.auto.dungeon_playtime_12hour.description',
            description: '累計プレイ時間を 12 時間に到達させる。',
            rewardKey: 'achievements.auto.dungeon_playtime_12hour.reward',
            reward: '時空の羅針盤',
            condition: (stats) => stats.core.playTimeSeconds >= 43200,
            progress: (stats) => createDurationProgress(stats.core.playTimeSeconds, 43200)
        },
        {
            id: 'dungeon_rare_collector',
            category: 'dungeon',
            titleKey: 'achievements.auto.dungeon_rare_collector.title',
            title: 'レアコレクター',
            descriptionKey: 'achievements.auto.dungeon_rare_collector.description',
            description: 'レア宝箱を 10 個開ける。',
            rewardKey: 'achievements.auto.dungeon_rare_collector.reward',
            reward: '希少鍵の欠片',
            condition: (stats) => stats.core.rareChestsOpened >= 10,
            progress: (stats) => {
                const current = stats.core.rareChestsOpened || 0;
                const target = 10;
                return {
                    current,
                    target,
                    percent: Math.min(1, current / target),
                    text: translate('achievements.progress.ratio', {
                        current: formatNumber(current),
                        target: formatNumber(target)
                    }, `${formatNumber(current)} / ${formatNumber(target)}`)
                };
            }
        },
        {
            id: 'dungeon_iron_wall',
            category: 'dungeon',
            titleKey: 'achievements.auto.dungeon_iron_wall.title',
            title: '鉄壁の生還者',
            descriptionKey: 'achievements.auto.dungeon_iron_wall.description',
            description: '累計被ダメージ 10,000 を経験する。',
            rewardKey: 'achievements.auto.dungeon_iron_wall.reward',
            reward: '鉄壁の盾',
            condition: (stats) => stats.core.damageTaken >= 10000,
            progress: (stats) => {
                const current = stats.core.damageTaken || 0;
                const target = 10000;
                return {
                    current,
                    target,
                    percent: Math.min(1, current / target),
                    text: translate('achievements.progress.ratio', {
                        current: formatNumber(current),
                        target: formatNumber(target)
                    }, `${formatNumber(current)} / ${formatNumber(target)}`)
                };
            }
        },
        {
            id: 'blockdim_first_gate',
            category: 'blockdim',
            titleKey: 'achievements.auto.blockdim_first_gate.title',
            title: 'ゲート起動',
            descriptionKey: 'achievements.auto.blockdim_first_gate.description',
            description: '初めて Gate からブロック次元に突入する。',
            rewardKey: 'achievements.auto.blockdim_first_gate.reward',
            reward: 'ゲート起動ログ',
            condition: (stats) => stats.blockdim.gatesOpened >= 1
        },
        {
            id: 'blockdim_bookmark_collector',
            category: 'blockdim',
            titleKey: 'achievements.auto.blockdim_bookmark_collector.title',
            title: 'ブックマークコレクター',
            descriptionKey: 'achievements.auto.blockdim_bookmark_collector.description',
            description: 'ブロック次元のブックマークを 5 件登録する。',
            rewardKey: 'achievements.auto.blockdim_bookmark_collector.reward',
            reward: '組み合わせ研究ノート',
            condition: (stats) => stats.blockdim.bookmarksAdded >= 5,
            progress: (stats) => {
                const current = stats.blockdim.bookmarksAdded || 0;
                const target = 5;
                return {
                    current,
                    target,
                    percent: Math.min(1, current / target),
                    text: translate('achievements.progress.ratio', {
                        current: formatNumber(current),
                        target: formatNumber(target)
                    }, `${formatNumber(current)} / ${formatNumber(target)}`)
                };
            }
        },
        {
            id: 'blockdim_weighted_explorer',
            category: 'blockdim',
            titleKey: 'achievements.auto.blockdim_weighted_explorer.title',
            title: '狙い撃ち合成者',
            descriptionKey: 'achievements.auto.blockdim_weighted_explorer.description',
            description: '重み付きランダム選択を使用する。',
            rewardKey: 'achievements.auto.blockdim_weighted_explorer.reward',
            reward: '狙い撃ち計算式',
            condition: (stats) => stats.blockdim.weightedSelections >= 1
        },
        {
            id: 'hatena_first_trigger',
            category: 'hatena',
            titleKey: 'achievements.auto.hatena_first_trigger.title',
            title: '謎との遭遇',
            descriptionKey: 'achievements.auto.hatena_first_trigger.description',
            description: 'ハテナブロックを初めて発動させる。',
            rewardKey: 'achievements.auto.hatena_first_trigger.reward',
            reward: '調査記録「？」',
            condition: (stats) => (stats.hatena?.blocksTriggered || 0) >= 1,
            progress: (stats) => {
                const hatena = stats.hatena || {};
                const current = hatena.blocksTriggered || 0;
                const target = 1;
                return {
                    current,
                    target,
                    percent: Math.min(1, current / target),
                    text: translate('achievements.progress.ratio', {
                        current: formatNumber(current),
                        target: formatNumber(target)
                    }, `${formatNumber(current)} / ${formatNumber(target)}`)
                };
            }
        },
        {
            id: 'hatena_block_researcher',
            category: 'hatena',
            titleKey: 'achievements.auto.hatena_block_researcher.title',
            title: 'ハテナ観測隊',
            descriptionKey: 'achievements.auto.hatena_block_researcher.description',
            description: 'ハテナブロックを 25 回発動させる。',
            rewardKey: 'achievements.auto.hatena_block_researcher.reward',
            reward: '観測ログシート',
            condition: (stats) => (stats.hatena?.blocksTriggered || 0) >= 25,
            progress: (stats) => {
                const hatena = stats.hatena || {};
                const current = hatena.blocksTriggered || 0;
                const target = 25;
                return {
                    current,
                    target,
                    percent: Math.min(1, current / target),
                    text: translate('achievements.progress.ratio', {
                        current: formatNumber(current),
                        target: formatNumber(target)
                    }, `${formatNumber(current)} / ${formatNumber(target)}`)
                };
            }
        },
        {
            id: 'hatena_lucky_chain',
            category: 'hatena',
            titleKey: 'achievements.auto.hatena_lucky_chain.title',
            title: '幸運を掴む者',
            descriptionKey: 'achievements.auto.hatena_lucky_chain.description',
            description: 'ハテナブロックから好影響を 15 回得る。',
            rewardKey: 'achievements.auto.hatena_lucky_chain.reward',
            reward: '幸運のお守り',
            condition: (stats) => (stats.hatena?.positiveEffects || 0) >= 15,
            progress: (stats) => {
                const hatena = stats.hatena || {};
                const current = hatena.positiveEffects || 0;
                const target = 15;
                return {
                    current,
                    target,
                    percent: Math.min(1, current / target),
                    text: translate('achievements.progress.ratio', {
                        current: formatNumber(current),
                        target: formatNumber(target)
                    }, `${formatNumber(current)} / ${formatNumber(target)}`)
                };
            }
        },
        {
            id: 'hatena_unlucky_survivor',
            category: 'hatena',
            titleKey: 'achievements.auto.hatena_unlucky_survivor.title',
            title: '不運をも超えて',
            descriptionKey: 'achievements.auto.hatena_unlucky_survivor.description',
            description: 'ハテナブロックの悪影響を 10 回経験しても生き延びる。',
            rewardKey: 'achievements.auto.hatena_unlucky_survivor.reward',
            reward: '耐久メダル',
            condition: (stats) => (stats.hatena?.negativeEffects || 0) >= 10,
            progress: (stats) => {
                const hatena = stats.hatena || {};
                const current = hatena.negativeEffects || 0;
                const target = 10;
                return {
                    current,
                    target,
                    percent: Math.min(1, current / target),
                    text: translate('achievements.progress.ratio', {
                        current: formatNumber(current),
                        target: formatNumber(target)
                    }, `${formatNumber(current)} / ${formatNumber(target)}`)
                };
            }
        },
        {
            id: 'hatena_rare_hunter',
            category: 'hatena',
            titleKey: 'achievements.auto.hatena_rare_hunter.title',
            title: '輝く幸運',
            descriptionKey: 'achievements.auto.hatena_rare_hunter.description',
            description: 'ハテナブロックからレア宝箱を 3 個出現させる。',
            rewardKey: 'achievements.auto.hatena_rare_hunter.reward',
            reward: '宝箱鑑定レンズ',
            condition: (stats) => (stats.hatena?.rareChestsSpawned || 0) >= 3,
            progress: (stats) => {
                const hatena = stats.hatena || {};
                const current = hatena.rareChestsSpawned || 0;
                const target = 3;
                return {
                    current,
                    target,
                    percent: Math.min(1, current / target),
                    text: translate('achievements.progress.ratio', {
                        current: formatNumber(current),
                        target: formatNumber(target)
                    }, `${formatNumber(current)} / ${formatNumber(target)}`)
                };
            }
        },
        {
            id: 'tools_first_visit',
            category: 'tools',
            titleKey: 'achievements.auto.tools_first_visit.title',
            title: '工房デビュー',
            descriptionKey: 'achievements.auto.tools_first_visit.description',
            description: 'ツールズタブを開く。',
            rewardKey: 'achievements.auto.tools_first_visit.reward',
            reward: '作業手帳',
            condition: (stats) => stats.tools.tabVisits >= 1
        },
        {
            id: 'tools_mod_export',
            category: 'tools',
            titleKey: 'achievements.auto.tools_mod_export.title',
            title: 'アドオンビルダー',
            descriptionKey: 'achievements.auto.tools_mod_export.description',
            description: 'Mod 作成ツールでコードを書き出す。',
            rewardKey: 'achievements.auto.tools_mod_export.reward',
            reward: 'Mod 署名スタンプ',
            condition: (stats) => stats.tools.modExports >= 1
        },
        {
            id: 'tools_blockdata_saver',
            category: 'tools',
            titleKey: 'achievements.auto.tools_blockdata_saver.title',
            title: 'データ整備士',
            descriptionKey: 'achievements.auto.tools_blockdata_saver.description',
            description: 'BlockData エディタでデータを保存またはダウンロードする。',
            rewardKey: 'achievements.auto.tools_blockdata_saver.reward',
            reward: '整備員バッジ',
            condition: (stats) => (stats.tools.blockdataSaves + stats.tools.blockdataDownloads) >= 1,
            progress: (stats) => {
                const total = (stats.tools.blockdataSaves || 0) + (stats.tools.blockdataDownloads || 0);
                return {
                    current: total,
                    text: translate('achievements.progress.actions', {
                        count: formatNumber(total)
                    }, `${formatNumber(total)} 回操作`)
                };
            }
        },
        {
            id: 'tools_sandbox_session',
            category: 'tools',
            titleKey: 'achievements.auto.tools_sandbox_session.title',
            title: 'シミュレーション好き',
            descriptionKey: 'achievements.auto.tools_sandbox_session.description',
            description: 'サンドボックスインターフェースを開いて編集する。',
            rewardKey: 'achievements.auto.tools_sandbox_session.reward',
            reward: 'テストパス',
            condition: (stats) => stats.tools.sandboxSessions >= 1
        },
        {
            id: 'minigame_coming_soon',
            category: 'mini',
            titleKey: 'achievements.auto.minigame_coming_soon.title',
            title: 'ミニゲーム実績',
            descriptionKey: 'achievements.auto.minigame_coming_soon.description',
            description: 'COMING SOON - ミニゲーム用実績は近日追加予定です。',
            rewardKey: 'achievements.auto.minigame_coming_soon.reward',
            reward: '',
            comingSoon: true
        }
    ];

    function getActiveGeneratorCountFromGlobal() {
        try {
            if (typeof global.getActiveDungeonGeneratorCount === 'function') {
                const result = global.getActiveDungeonGeneratorCount();
                const numeric = Number(result);
                if (Number.isFinite(numeric)) {
                    return Math.max(0, Math.floor(numeric));
                }
            }
        } catch {}
        try {
            const registry = global.DungeonGenRegistry;
            if (registry && typeof registry.size === 'number') {
                const size = Number(registry.size);
                return Number.isFinite(size) ? Math.max(0, Math.floor(size)) : 0;
            }
            if (registry && typeof registry.keys === 'function') {
                let count = 0;
                for (const key of registry.keys()) {
                    if (key !== undefined && key !== null) count += 1;
                }
                return count;
            }
        } catch {}
        return 0;
    }

    function getMiniGameModCountFromGlobal() {
        try {
            if (typeof global.getMiniGameModCount === 'function') {
                const result = global.getMiniGameModCount();
                const numeric = Number(result);
                if (Number.isFinite(numeric)) {
                    return Math.max(0, Math.floor(numeric));
                }
            }
        } catch {}
        return 0;
    }

    const STAT_SECTIONS = [
        {
            id: 'core',
            titleKey: 'achievements.stats.sections.core.title',
            title: 'ダンジョンの記録',
            entries: [
                {
                    path: 'core.playTimeSeconds',
                    labelKey: 'achievements.stats.entries.core.playTime.label',
                    label: '総プレイ時間',
                    descriptionKey: 'achievements.stats.entries.core.playTime.description',
                    description: 'ゲームを起動していた累計時間。',
                    formatter: (value) => formatDuration(value)
                },
                {
                    path: 'core.totalSteps',
                    labelKey: 'achievements.stats.entries.core.totalSteps.label',
                    label: '総移動距離',
                    descriptionKey: 'achievements.stats.entries.core.totalSteps.description',
                    description: 'これまでに歩いたマスの合計。',
                    formatter: (value) => translate('achievements.stats.entries.core.totalSteps.value', { value: formatNumber(value) }, `${formatNumber(value)} マス`)
                },
                {
                    path: 'core.floorsAdvanced',
                    labelKey: 'achievements.stats.entries.core.floorsAdvanced.label',
                    label: '踏破した階層数',
                    descriptionKey: 'achievements.stats.entries.core.floorsAdvanced.description',
                    description: '階段で進んだ累積階層。',
                    formatter: formatNumber
                },
                {
                    path: 'core.highestFloorReached',
                    labelKey: 'achievements.stats.entries.core.highestFloorReached.label',
                    label: '最高到達階層',
                    descriptionKey: 'achievements.stats.entries.core.highestFloorReached.description',
                    description: 'これまでに到達した最も深い階層。',
                    formatter: (value) => translate('achievements.stats.entries.core.highestFloorReached.value', { value: formatNumber(value) }, `${formatNumber(value)}F`)
                },
                {
                    path: 'core.dungeonsCleared',
                    labelKey: 'achievements.stats.entries.core.dungeonsCleared.label',
                    label: '攻略したダンジョン数',
                    descriptionKey: 'achievements.stats.entries.core.dungeonsCleared.description',
                    description: '通常・ブロック次元を含む攻略回数。',
                    formatter: formatNumber
                },
                {
                    path: 'core.enemiesDefeated',
                    labelKey: 'achievements.stats.entries.core.enemiesDefeated.label',
                    label: '撃破した敵',
                    descriptionKey: 'achievements.stats.entries.core.enemiesDefeated.description',
                    description: '倒した敵の合計数。',
                    formatter: formatNumber
                },
                {
                    path: 'core.bossesDefeated',
                    labelKey: 'achievements.stats.entries.core.bossesDefeated.label',
                    label: 'ボス撃破数',
                    descriptionKey: 'achievements.stats.entries.core.bossesDefeated.description',
                    description: '撃破したボスの数。',
                    formatter: formatNumber
                },
                {
                    path: 'core.totalExpEarned',
                    labelKey: 'achievements.stats.entries.core.totalExpEarned.label',
                    label: '累計獲得EXP',
                    descriptionKey: 'achievements.stats.entries.core.totalExpEarned.description',
                    description: '探索やミニゲームで得た経験値の合計。',
                    formatter: (value) => translate('achievements.stats.entries.core.totalExpEarned.value', { value: formatNumber(Math.floor(value || 0)) }, `${formatNumber(Math.floor(value || 0))} EXP`)
                },
                {
                    path: 'core.damageDealt',
                    labelKey: 'achievements.stats.entries.core.damageDealt.label',
                    label: '累計与ダメージ',
                    descriptionKey: 'achievements.stats.entries.core.damageDealt.description',
                    description: '敵に与えたダメージ総量。',
                    formatter: formatNumber
                },
                {
                    path: 'core.damageTaken',
                    labelKey: 'achievements.stats.entries.core.damageTaken.label',
                    label: '累計被ダメージ',
                    descriptionKey: 'achievements.stats.entries.core.damageTaken.description',
                    description: '敵やギミックから受けたダメージ総量。',
                    formatter: formatNumber
                },
                {
                    path: 'core.chestsOpened',
                    labelKey: 'achievements.stats.entries.core.chestsOpened.label',
                    label: '開けた宝箱',
                    descriptionKey: 'achievements.stats.entries.core.chestsOpened.description',
                    description: '探索中に開封した宝箱の数。',
                    formatter: formatNumber
                },
                {
                    path: 'core.rareChestsOpened',
                    labelKey: 'achievements.stats.entries.core.rareChestsOpened.label',
                    label: '開けたレア宝箱',
                    descriptionKey: 'achievements.stats.entries.core.rareChestsOpened.description',
                    description: '開封したレア宝箱の数。',
                    formatter: formatNumber
                },
                {
                    path: 'core.normalChestsOpened',
                    labelKey: 'achievements.stats.entries.core.normalChestsOpened.label',
                    label: '開けた通常宝箱',
                    descriptionKey: 'achievements.stats.entries.core.normalChestsOpened.description',
                    description: '通常宝箱を開封した回数。',
                    formatter: formatNumber
                },
                {
                    path: 'core.healingItemsUsed',
                    labelKey: 'achievements.stats.entries.core.healingItemsUsed.label',
                    label: '使用した回復アイテム',
                    descriptionKey: 'achievements.stats.entries.core.healingItemsUsed.description',
                    description: 'ポーションやHP強化などを使用した回数。',
                    formatter: formatNumber
                },
                {
                    path: 'core.autoItemsTriggered',
                    labelKey: 'achievements.stats.entries.core.autoItemsTriggered.label',
                    label: 'オートアイテム発動回数',
                    descriptionKey: 'achievements.stats.entries.core.autoItemsTriggered.description',
                    description: 'HPが減ったとき自動で発動した回復アイテムの回数。',
                    formatter: formatNumber
                },
                {
                    path: 'core.deaths',
                    labelKey: 'achievements.stats.entries.core.deaths.label',
                    label: '戦闘不能回数',
                    descriptionKey: 'achievements.stats.entries.core.deaths.description',
                    description: 'ゲームオーバーになった回数。',
                    formatter: formatNumber
                },
                {
                    path: 'core.highestDifficultyIndex',
                    labelKey: 'achievements.stats.entries.core.highestDifficultyIndex.label',
                    label: '最高攻略難易度',
                    descriptionKey: 'achievements.stats.entries.core.highestDifficultyIndex.description',
                    description: 'これまで攻略した最も高い難易度。',
                    formatter: formatDifficultyLabel
                }
            ]
        },
        {
            id: 'blockdim',
            titleKey: 'achievements.stats.sections.blockdim.title',
            title: 'ブロック次元の記録',
            entries: [
                {
                    path: 'blockdim.gatesOpened',
                    labelKey: 'achievements.stats.entries.blockdim.gatesOpened.label',
                    label: 'Gate 起動回数',
                    descriptionKey: 'achievements.stats.entries.blockdim.gatesOpened.description',
                    description: 'ブロック次元へ突入した回数。',
                    formatter: formatNumber
                },
                {
                    path: 'blockdim.bookmarksAdded',
                    labelKey: 'achievements.stats.entries.blockdim.bookmarksAdded.label',
                    label: 'ブックマーク登録数',
                    descriptionKey: 'achievements.stats.entries.blockdim.bookmarksAdded.description',
                    description: '保存したブックマークの数。',
                    formatter: formatNumber
                },
                {
                    path: 'blockdim.randomSelections',
                    labelKey: 'achievements.stats.entries.blockdim.randomSelections.label',
                    label: 'ランダム選択回数',
                    descriptionKey: 'achievements.stats.entries.blockdim.randomSelections.description',
                    description: '等確率ランダム選択を使った回数。',
                    formatter: formatNumber
                },
                {
                    path: 'blockdim.weightedSelections',
                    labelKey: 'achievements.stats.entries.blockdim.weightedSelections.label',
                    label: '重み付き選択回数',
                    descriptionKey: 'achievements.stats.entries.blockdim.weightedSelections.description',
                    description: '狙い撃ちランダムを使った回数。',
                    formatter: formatNumber
                }
            ]
        },
        {
            id: 'hatena',
            titleKey: 'achievements.stats.sections.hatena.title',
            title: 'ハテナブロックの記録',
            entries: [
                {
                    path: 'hatena.blocksAppeared',
                    labelKey: 'achievements.stats.entries.hatena.blocksAppeared.label',
                    label: '出現したブロック',
                    descriptionKey: 'achievements.stats.entries.hatena.blocksAppeared.description',
                    description: '探索中に見つけたハテナブロックの総数。',
                    formatter: (value) => translate('achievements.stats.entries.hatena.blocksAppeared.value', { value: formatNumber(value) }, `${formatNumber(value)} 個`)
                },
                {
                    path: 'hatena.blocksTriggered',
                    labelKey: 'achievements.stats.entries.hatena.blocksTriggered.label',
                    label: '発動したブロック',
                    descriptionKey: 'achievements.stats.entries.hatena.blocksTriggered.description',
                    description: '踏んで発動させたハテナブロックの回数。',
                    formatter: (value) => translate('achievements.stats.entries.hatena.blocksTriggered.value', { value: formatNumber(value) }, `${formatNumber(value)} 回`)
                },
                {
                    path: 'hatena.positiveEffects',
                    labelKey: 'achievements.stats.entries.hatena.positiveEffects.label',
                    label: '好影響の回数',
                    descriptionKey: 'achievements.stats.entries.hatena.positiveEffects.description',
                    description: '好影響（レベルアップ、報酬など）になった回数。',
                    formatter: (value) => translate('achievements.stats.entries.hatena.positiveEffects.value', { value: formatNumber(value) }, `${formatNumber(value)} 回`)
                },
                {
                    path: 'hatena.neutralEffects',
                    labelKey: 'achievements.stats.entries.hatena.neutralEffects.label',
                    label: '中立効果の回数',
                    descriptionKey: 'achievements.stats.entries.hatena.neutralEffects.description',
                    description: '好影響・悪影響どちらでもない結果になった回数。',
                    formatter: (value) => translate('achievements.stats.entries.hatena.neutralEffects.value', { value: formatNumber(value) }, `${formatNumber(value)} 回`)
                },
                {
                    path: 'hatena.negativeEffects',
                    labelKey: 'achievements.stats.entries.hatena.negativeEffects.label',
                    label: '悪影響の回数',
                    descriptionKey: 'achievements.stats.entries.hatena.negativeEffects.description',
                    description: '悪影響（被弾や弱体化など）になった回数。',
                    formatter: (value) => translate('achievements.stats.entries.hatena.negativeEffects.value', { value: formatNumber(value) }, `${formatNumber(value)} 回`)
                },
                {
                    path: 'hatena.expGained',
                    labelKey: 'achievements.stats.entries.hatena.expGained.label',
                    label: '累計獲得EXP',
                    descriptionKey: 'achievements.stats.entries.hatena.expGained.description',
                    description: 'ハテナブロックから得た経験値の合計。',
                    formatter: (value) => translate('achievements.stats.entries.hatena.expGained.value', { value: formatNumber(Math.floor(value || 0)) }, `${formatNumber(Math.floor(value || 0))} EXP`)
                },
                {
                    path: 'hatena.expLost',
                    labelKey: 'achievements.stats.entries.hatena.expLost.label',
                    label: '累計消失EXP',
                    descriptionKey: 'achievements.stats.entries.hatena.expLost.description',
                    description: 'ハテナブロックで失った経験値の合計。',
                    formatter: (value) => translate('achievements.stats.entries.hatena.expLost.value', { value: formatNumber(Math.floor(value || 0)) }, `${formatNumber(Math.floor(value || 0))} EXP`)
                },
                {
                    path: 'hatena.bombDamageTaken',
                    labelKey: 'achievements.stats.entries.hatena.bombDamageTaken.label',
                    label: '爆発による被ダメージ',
                    descriptionKey: 'achievements.stats.entries.hatena.bombDamageTaken.description',
                    description: '爆発効果で受けたダメージの総量。',
                    formatter: (value) => translate('achievements.stats.entries.hatena.bombDamageTaken.value', { value: formatNumber(value) }, `${formatNumber(value)} ダメージ`)
                },
                {
                    path: 'hatena.bombHealed',
                    labelKey: 'achievements.stats.entries.hatena.bombHealed.label',
                    label: '爆発で回復したHP',
                    descriptionKey: 'achievements.stats.entries.hatena.bombHealed.description',
                    description: '爆発の回復効果で得たHPの総量。',
                    formatter: (value) => translate('achievements.stats.entries.hatena.bombHealed.value', { value: formatNumber(value) }, `${formatNumber(value)} HP`)
                },
                {
                    path: 'hatena.bombGuards',
                    labelKey: 'achievements.stats.entries.hatena.bombGuards.label',
                    label: 'ガード発動回数',
                    descriptionKey: 'achievements.stats.entries.hatena.bombGuards.description',
                    description: '爆発ガード効果でダメージを軽減した回数。',
                    formatter: (value) => translate('achievements.stats.entries.hatena.bombGuards.value', { value: formatNumber(value) }, `${formatNumber(value)} 回`)
                },
                {
                    path: 'hatena.normalChestsSpawned',
                    labelKey: 'achievements.stats.entries.hatena.normalChestsSpawned.label',
                    label: '通常宝箱生成数',
                    descriptionKey: 'achievements.stats.entries.hatena.normalChestsSpawned.description',
                    description: '通常宝箱を生成した回数。',
                    formatter: (value) => translate('achievements.stats.entries.hatena.normalChestsSpawned.value', { value: formatNumber(value) }, `${formatNumber(value)} 個`)
                },
                {
                    path: 'hatena.rareChestsSpawned',
                    labelKey: 'achievements.stats.entries.hatena.rareChestsSpawned.label',
                    label: 'レア宝箱生成数',
                    descriptionKey: 'achievements.stats.entries.hatena.rareChestsSpawned.description',
                    description: 'レア宝箱を生成した回数。',
                    formatter: (value) => translate('achievements.stats.entries.hatena.rareChestsSpawned.value', { value: formatNumber(value) }, `${formatNumber(value)} 個`)
                },
                {
                    path: 'hatena.itemsGranted',
                    labelKey: 'achievements.stats.entries.hatena.itemsGranted.label',
                    label: '獲得アイテム数',
                    descriptionKey: 'achievements.stats.entries.hatena.itemsGranted.description',
                    description: '報酬として受け取ったアイテムの数。',
                    formatter: (value) => translate('achievements.stats.entries.hatena.itemsGranted.value', { value: formatNumber(value) }, `${formatNumber(value)} 個`)
                },
                {
                    path: 'hatena.enemyAmbushes',
                    labelKey: 'achievements.stats.entries.hatena.enemyAmbushes.label',
                    label: '奇襲された敵数',
                    descriptionKey: 'achievements.stats.entries.hatena.enemyAmbushes.description',
                    description: '奇襲イベントで出現した敵の総数。',
                    formatter: (value) => translate('achievements.stats.entries.hatena.enemyAmbushes.value', { value: formatNumber(value) }, `${formatNumber(value)} 体`)
                },
                {
                    path: 'hatena.bombsTriggered',
                    labelKey: 'achievements.stats.entries.hatena.bombsTriggered.label',
                    label: '爆発イベント回数',
                    descriptionKey: 'achievements.stats.entries.hatena.bombsTriggered.description',
                    description: '爆発の効果を引いた回数。',
                    formatter: (value) => translate('achievements.stats.entries.hatena.bombsTriggered.value', { value: formatNumber(value) }, `${formatNumber(value)} 回`)
                },
                {
                    path: 'hatena.levelUps',
                    labelKey: 'achievements.stats.entries.hatena.levelUps.label',
                    label: 'レベルアップ回数',
                    descriptionKey: 'achievements.stats.entries.hatena.levelUps.description',
                    description: 'ハテナブロックの効果でレベルアップした回数。',
                    formatter: (value) => translate('achievements.stats.entries.hatena.levelUps.value', { value: formatNumber(value) }, `${formatNumber(value)} 回`)
                },
                {
                    path: 'hatena.levelUpLevels',
                    labelKey: 'achievements.stats.entries.hatena.levelUpLevels.label',
                    label: '累計上昇レベル',
                    descriptionKey: 'achievements.stats.entries.hatena.levelUpLevels.description',
                    description: 'ハテナブロックで獲得したレベルの合計。',
                    formatter: (value) => translate('achievements.stats.entries.hatena.levelUpLevels.value', { value: formatNumber(value) }, `${formatNumber(value)} レベル`)
                },
                {
                    path: 'hatena.levelDowns',
                    labelKey: 'achievements.stats.entries.hatena.levelDowns.label',
                    label: 'レベルダウン回数',
                    descriptionKey: 'achievements.stats.entries.hatena.levelDowns.description',
                    description: 'ハテナブロックの効果でレベルダウンした回数。',
                    formatter: (value) => translate('achievements.stats.entries.hatena.levelDowns.value', { value: formatNumber(value) }, `${formatNumber(value)} 回`)
                },
                {
                    path: 'hatena.levelDownLevels',
                    labelKey: 'achievements.stats.entries.hatena.levelDownLevels.label',
                    label: '累計減少レベル',
                    descriptionKey: 'achievements.stats.entries.hatena.levelDownLevels.description',
                    description: 'ハテナブロックで失ったレベルの合計。',
                    formatter: (value) => translate('achievements.stats.entries.hatena.levelDownLevels.value', { value: formatNumber(value) }, `${formatNumber(value)} レベル`)
                },
                {
                    path: 'hatena.statusesApplied',
                    labelKey: 'achievements.stats.entries.hatena.statusesApplied.label',
                    label: '状態異常付与回数',
                    descriptionKey: 'achievements.stats.entries.hatena.statusesApplied.description',
                    description: 'ハテナブロックで状態異常を受けた回数。',
                    formatter: (value) => translate('achievements.stats.entries.hatena.statusesApplied.value', { value: formatNumber(value) }, `${formatNumber(value)} 回`)
                },
                {
                    path: 'hatena.statusesResisted',
                    labelKey: 'achievements.stats.entries.hatena.statusesResisted.label',
                    label: '状態異常無効化',
                    descriptionKey: 'achievements.stats.entries.hatena.statusesResisted.description',
                    description: 'ハテナブロックの状態異常を打ち消した回数。',
                    formatter: (value) => translate('achievements.stats.entries.hatena.statusesResisted.value', { value: formatNumber(value) }, `${formatNumber(value)} 回`)
                },
                {
                    path: 'hatena.abilityUps',
                    labelKey: 'achievements.stats.entries.hatena.abilityUps.label',
                    label: '能力上昇回数',
                    descriptionKey: 'achievements.stats.entries.hatena.abilityUps.description',
                    description: 'ハテナブロックでステータスが上昇した回数。',
                    formatter: (value) => translate('achievements.stats.entries.hatena.abilityUps.value', { value: formatNumber(value) }, `${formatNumber(value)} 回`)
                },
                {
                    path: 'hatena.abilityDowns',
                    labelKey: 'achievements.stats.entries.hatena.abilityDowns.label',
                    label: '能力低下回数',
                    descriptionKey: 'achievements.stats.entries.hatena.abilityDowns.description',
                    description: 'ハテナブロックでステータスが低下した回数。',
                    formatter: (value) => translate('achievements.stats.entries.hatena.abilityDowns.value', { value: formatNumber(value) }, `${formatNumber(value)} 回`)
                }
            ]
        },
        {
            id: 'tools',
            titleKey: 'achievements.stats.sections.tools.title',
            title: 'ツール利用状況',
            entries: [
                {
                    path: 'tools.tabVisits',
                    labelKey: 'achievements.stats.entries.tools.tabVisits.label',
                    label: 'ツールズタブ訪問回数',
                    descriptionKey: 'achievements.stats.entries.tools.tabVisits.description',
                    description: 'ツールズタブを開いた回数。',
                    formatter: formatNumber
                },
                {
                    path: 'tools.modExports',
                    labelKey: 'achievements.stats.entries.tools.modExports.label',
                    label: 'Mod 出力回数',
                    descriptionKey: 'achievements.stats.entries.tools.modExports.description',
                    description: 'Mod 作成ツールで出力した回数。',
                    formatter: formatNumber
                },
                {
                    path: 'tools.blockdataSaves',
                    labelKey: 'achievements.stats.entries.tools.blockdataSaves.label',
                    label: 'BlockData 保存回数',
                    descriptionKey: 'achievements.stats.entries.tools.blockdataSaves.description',
                    description: 'BlockData エディタで保存した回数。',
                    formatter: formatNumber
                },
                {
                    path: 'tools.blockdataDownloads',
                    labelKey: 'achievements.stats.entries.tools.blockdataDownloads.label',
                    label: 'BlockData ダウンロード回数',
                    descriptionKey: 'achievements.stats.entries.tools.blockdataDownloads.description',
                    description: 'BlockData エディタからダウンロードした回数。',
                    formatter: formatNumber
                },
                {
                    path: 'tools.sandboxSessions',
                    labelKey: 'achievements.stats.entries.tools.sandboxSessions.label',
                    label: 'サンドボックス操作回数',
                    descriptionKey: 'achievements.stats.entries.tools.sandboxSessions.description',
                    description: 'サンドボックスUIを開いた回数。',
                    formatter: formatNumber
                }
            ]
        },
        {
            id: 'addons',
            titleKey: 'achievements.stats.sections.addons.title',
            title: 'アドオン状況',
            entries: [
                {
                    path: 'addons.activeGenerators',
                    labelKey: 'achievements.stats.entries.addons.activeGenerators.label',
                    label: 'アクティブ生成タイプ数',
                    descriptionKey: 'achievements.stats.entries.addons.activeGenerators.description',
                    description: '現在読み込まれている生成タイプ（MOD含む）の数。',
                    getter: () => getActiveGeneratorCountFromGlobal(),
                    formatter: (value) => {
                        const numeric = Number.isFinite(value) ? value : 0;
                        const formatted = formatNumber(numeric);
                        return translate(
                            'achievements.stats.entries.addons.activeGenerators.value',
                            { value: formatted },
                            `${formatted} 種類`
                        );
                    }
                },
                {
                    path: 'addons.miniGameMods',
                    labelKey: 'achievements.stats.entries.addons.miniGameMods.label',
                    label: 'ミニゲームMOD数',
                    descriptionKey: 'achievements.stats.entries.addons.miniGameMods.description',
                    description: 'MiniExpに登録されているMOD提供ミニゲームの数。',
                    getter: () => getMiniGameModCountFromGlobal(),
                    formatter: (value) => {
                        const numeric = Number.isFinite(value) ? value : 0;
                        const formatted = formatNumber(numeric);
                        return translate(
                            'achievements.stats.entries.addons.miniGameMods.value',
                            { value: formatted },
                            `${formatted} タイトル`
                        );
                    }
                }
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
    let playtimeTimerId = null;
    let lastPlaytimeTimestamp = 0;

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

    function formatNumber(value) {
        if (!Number.isFinite(value)) return '0';
        const numeric = Math.floor(value);
        // Prevent layout breakage on the statistics tab by switching to
        // scientific notation once the integer part reaches 15+ digits.
        const abs = Math.abs(numeric);
        const digitCount = abs === 0 ? 1 : Math.floor(Math.log10(abs)) + 1;
        if (digitCount >= 15) {
            return numeric.toExponential(2);
        }
        const i18n = getI18n();
        if (i18n && typeof i18n.formatNumber === 'function') {
            return i18n.formatNumber(numeric);
        }
        try {
            return new Intl.NumberFormat(undefined).format(numeric);
        } catch (error) {
            return String(numeric);
        }
    }

    function formatDecimal(value, options = {}) {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) return '0';
        const minimumFractionDigits = Number.isInteger(options.minimumFractionDigits)
            ? Math.max(0, options.minimumFractionDigits)
            : 0;
        const maximumFractionDigits = Number.isInteger(options.maximumFractionDigits)
            ? Math.max(minimumFractionDigits, options.maximumFractionDigits)
            : Math.max(minimumFractionDigits, 1);
        const formatOptions = { minimumFractionDigits, maximumFractionDigits };
        const i18n = getI18n();
        if (i18n && typeof i18n.formatNumber === 'function') {
            try {
                return i18n.formatNumber(numeric, formatOptions);
            } catch (error) {
                console.warn('[Achievements] Failed to format decimal via i18n:', error);
            }
        }
        try {
            return new Intl.NumberFormat(undefined, formatOptions).format(numeric);
        } catch (error) {
            return numeric.toFixed(formatOptions.maximumFractionDigits);
        }
    }

    function formatDifficultyLabel(index) {
        if (!Number.isFinite(index) || index < 0) {
            return translate('achievements.difficulty.unplayed', null, '未攻略');
        }
        const idx = Math.max(0, Math.min(DIFFICULTY_ORDER.length - 1, Math.floor(index)));
        const def = DIFFICULTY_ORDER[idx];
        if (!def) {
            return translate('achievements.difficulty.unplayed', null, '未攻略');
        }
        return translate(`achievements.difficulty.labels.${def.key}`, null, def.label || '未攻略');
    }

    function formatDuration(seconds) {
        const total = Math.max(0, Math.floor(Number(seconds) || 0));
        const hours = Math.floor(total / 3600);
        const minutes = Math.floor((total % 3600) / 60);
        const secs = total % 60;
        if (hours > 0) {
            return translate('achievements.progress.duration.full', {
                hours: formatNumber(hours),
                minutes: minutes.toString().padStart(2, '0'),
                minutesValue: formatNumber(minutes),
                seconds: secs.toString().padStart(2, '0'),
                secondsValue: formatNumber(secs)
            }, `${formatNumber(hours)}時間 ${minutes.toString().padStart(2, '0')}分 ${secs.toString().padStart(2, '0')}秒`);
        }
        if (minutes > 0) {
            return translate('achievements.progress.duration.minutes', {
                minutes: formatNumber(minutes),
                seconds: secs.toString().padStart(2, '0'),
                secondsValue: formatNumber(secs)
            }, `${formatNumber(minutes)}分 ${secs.toString().padStart(2, '0')}秒`);
        }
        return translate('achievements.progress.duration.seconds', {
            seconds: formatNumber(secs)
        }, `${secs}秒`);
    }

    function createDurationProgress(currentSeconds, targetSeconds) {
        const current = Math.max(0, Math.floor(Number(currentSeconds) || 0));
        const target = Math.max(1, Math.floor(Number(targetSeconds) || 0));
        const currentText = formatDuration(current);
        const targetText = formatDuration(target);
        return {
            current,
            target,
            percent: Math.min(1, current / target),
            text: translate('achievements.progress.duration.ratio', {
                current: currentText,
                target: targetText
            }, `${currentText} / ${targetText}`)
        };
    }

    function createDefaultStats() {
        return {
            core: {
                totalSteps: 0,
                playTimeSeconds: 0,
                floorsAdvanced: 0,
                dungeonsCleared: 0,
                enemiesDefeated: 0,
                bossesDefeated: 0,
                totalExpEarned: 0,
                damageDealt: 0,
                damageTaken: 0,
                chestsOpened: 0,
                deaths: 0,
                highestFloorReached: 1,
                healingItemsUsed: 0,
                autoItemsTriggered: 0,
                rareChestsOpened: 0,
                normalChestsOpened: 0,
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
            hatena: {
                blocksAppeared: 0,
                blocksTriggered: 0,
                positiveEffects: 0,
                negativeEffects: 0,
                neutralEffects: 0,
                expGained: 0,
                expLost: 0,
                rareChestsSpawned: 0,
                normalChestsSpawned: 0,
                itemsGranted: 0,
                enemyAmbushes: 0,
                bombsTriggered: 0,
                bombDamageTaken: 0,
                bombHealed: 0,
                bombGuards: 0,
                levelUps: 0,
                levelUpLevels: 0,
                levelDowns: 0,
                levelDownLevels: 0,
                statusesApplied: 0,
                statusesResisted: 0,
                abilityUps: 0,
                abilityDowns: 0
            },
            tools: {
                tabVisits: 0,
                modExports: 0,
                blockdataSaves: 0,
                blockdataDownloads: 0,
                sandboxSessions: 0
            },
            addons: {
                activeGenerators: 0,
                miniGameMods: 0
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
        const idx = DIFFICULTY_ORDER.findIndex(def => def && def.value === value);
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

    function applyPlaytimeDelta(seconds) {
        if (!Number.isFinite(seconds) || seconds <= 0) return;
        if (!incrementStat('core.playTimeSeconds', seconds)) return;
        const achievementsChanged = evaluateAutoAchievements();
        if (achievementsChanged) {
            notifyChange();
            return;
        }
        if (ui.initialized) {
            renderStatisticsSummary();
            renderStats();
        }
        scheduleSave();
    }

    function tickPlaytime() {
        const now = Date.now();
        if (!Number.isFinite(now)) return;
        if (global.document && typeof global.document.hidden === 'boolean' && global.document.hidden) {
            lastPlaytimeTimestamp = now;
            return;
        }
        if (!lastPlaytimeTimestamp) {
            lastPlaytimeTimestamp = now;
            return;
        }
        const elapsedSeconds = Math.floor((now - lastPlaytimeTimestamp) / 1000);
        if (elapsedSeconds <= 0) return;
        lastPlaytimeTimestamp += elapsedSeconds * 1000;
        applyPlaytimeDelta(elapsedSeconds);
    }

    function resetPlaytimeClock() {
        lastPlaytimeTimestamp = Date.now();
    }

    function startPlaytimeTracker() {
        if (playtimeTimerId || typeof global.setInterval !== 'function') return;
        resetPlaytimeClock();
        playtimeTimerId = global.setInterval(tickPlaytime, PLAYTIME_TRACKING_INTERVAL_MS);
    }

    function stopPlaytimeTracker() {
        if (!playtimeTimerId) return;
        if (typeof global.clearInterval === 'function') {
            global.clearInterval(playtimeTimerId);
        }
        playtimeTimerId = null;
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
            title.textContent = translate(category.nameKey, null, category.name);
            header.appendChild(title);
            section.appendChild(header);

            const defs = AUTO_ACHIEVEMENTS.filter(def => def.category === category.id);
            if (category.comingSoon) {
                const coming = document.createElement('p');
                coming.className = 'achievement-coming-soon';
                coming.textContent = translate('achievements.messages.categoryComingSoon', null, '実績は近日追加予定です。');
                section.appendChild(coming);
                fragment.appendChild(section);
                continue;
            }

            if (defs.length === 0) {
                const empty = document.createElement('p');
                empty.className = 'achievement-empty';
                empty.textContent = translate('achievements.messages.emptyCategory', null, '登録されている実績はまだありません。');
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
                heading.textContent = translate(def.titleKey, null, def.title);
                headerRow.appendChild(heading);
                const status = document.createElement('span');
                status.className = 'achievement-card__status';
                status.textContent = def.comingSoon
                    ? translate('achievements.status.comingSoon', null, 'COMING SOON')
                    : (unlocked
                        ? translate('achievements.status.unlocked', null, '達成済み')
                        : translate('achievements.status.locked', null, '未達成'));
                headerRow.appendChild(status);
                card.appendChild(headerRow);

                const descriptionText = translate(def.descriptionKey, null, def.description);
                if (descriptionText) {
                    const desc = document.createElement('p');
                    desc.className = 'achievement-card__description';
                    desc.textContent = descriptionText;
                    card.appendChild(desc);
                }

                const rewardText = translate(def.rewardKey, null, def.reward);
                if (rewardText) {
                    const reward = document.createElement('p');
                    reward.className = 'achievement-card__reward';
                    reward.textContent = translate('achievements.rewardMemo', { reward: rewardText }, `報酬メモ: ${rewardText}`);
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
                    const labelKey = def.type === 'repeatable'
                        ? 'achievements.meta.repeatableCount'
                        : 'achievements.meta.counterCount';
                    const fallback = def.type === 'repeatable'
                        ? `累計達成回数: ${formatNumber(counterValue)}`
                        : `達成数: ${formatNumber(counterValue)}`;
                    meta.textContent = translate(labelKey, { count: formatNumber(counterValue) }, fallback);
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
            name.textContent = translate(category.nameKey, null, category.name);
            const value = document.createElement('span');
            value.className = 'category-progress';
            if (category.comingSoon) {
                value.textContent = translate('achievements.summary.comingSoon', null, 'Coming Soon');
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
                    value.textContent = translate('achievements.summary.categoryRatio', {
                        unlocked: formatNumber(unlocked),
                        total: formatNumber(defs.length)
                    }, `${formatNumber(unlocked)}/${formatNumber(defs.length)}`);
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
        const defaults = createDefaultStats();
        const stats = state.stats?.core || defaults.core;
        const hatenaStats = state.stats?.hatena || defaults.hatena;
        const highlights = [
            {
                labelKey: 'achievements.summary.highlights.playTime',
                label: '総プレイ時間',
                value: formatDuration(stats.playTimeSeconds)
            },
            {
                labelKey: 'achievements.summary.highlights.dungeonsCleared',
                label: '攻略ダンジョン',
                value: formatNumber(stats.dungeonsCleared)
            },
            {
                labelKey: 'achievements.summary.highlights.highestDifficulty',
                label: '最高難易度',
                value: formatDifficultyLabel(stats.highestDifficultyIndex)
            },
            {
                labelKey: 'achievements.summary.highlights.totalExp',
                label: '累計EXP',
                value: translate('achievements.summary.highlights.totalExpValue', {
                    value: formatNumber(Math.floor(stats.totalExpEarned || 0))
                }, `${formatNumber(Math.floor(stats.totalExpEarned || 0))} EXP`)
            }
        ];
        const hatenaTriggered = hatenaStats.blocksTriggered || 0;
        if (hatenaTriggered > 0) {
            const positiveRate = hatenaStats.positiveEffects
                ? Math.min(100, Math.max(0, (hatenaStats.positiveEffects / hatenaTriggered) * 100))
                : 0;
            const positiveRateValue = formatDecimal(positiveRate, { minimumFractionDigits: 0, maximumFractionDigits: 1 });
            highlights.push({
                labelKey: 'achievements.summary.highlights.hatenaTriggered',
                label: 'ハテナ発動回数',
                value: translate('achievements.summary.highlights.hatenaTriggeredValue', {
                    value: formatNumber(hatenaTriggered)
                }, `${formatNumber(hatenaTriggered)} 回`)
            });
            highlights.push({
                labelKey: 'achievements.summary.highlights.hatenaPositiveRate',
                label: 'ハテナ好影響率',
                value: translate('achievements.summary.highlights.hatenaPositiveRateValue', {
                    value: positiveRateValue
                }, `${positiveRateValue}%`)
            });
        }
        const list = document.createElement('ul');
        list.className = 'statistics-summary__list';
        for (const item of highlights) {
            const li = document.createElement('li');
            li.className = 'statistics-summary__item';
            const label = document.createElement('span');
            label.className = 'summary-label';
            label.textContent = item.labelKey ? translate(item.labelKey, null, item.label) : item.label;
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
            heading.textContent = translate(sectionDef.titleKey, null, sectionDef.title);
            section.appendChild(heading);
            const table = document.createElement('table');
            table.className = 'statistics-table';
            for (const entry of sectionDef.entries) {
                const valueRaw = typeof entry.getter === 'function'
                    ? entry.getter(state.stats, entry)
                    : getStatValue(entry.path);
                const formatter = entry.formatter || formatNumber;
                const display = formatter(valueRaw, state.stats);
                const row = document.createElement('tr');
                const th = document.createElement('th');
                th.textContent = translate(entry.labelKey, null, entry.label);
                const tdValue = document.createElement('td');
                tdValue.textContent = display;
                const tdDesc = document.createElement('td');
                tdDesc.textContent = translate(entry.descriptionKey, null, entry.description || '');
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
            empty.textContent = translate('achievements.custom.empty', null, 'カスタム実績はまだありません。フォームから追加できます。');
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
            deleteBtn.textContent = translate('achievements.custom.actions.delete', null, '削除');
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
                reward.textContent = translate('achievements.rewardMemo', { reward: entry.reward }, `報酬メモ: ${entry.reward}`);
                card.appendChild(reward);
            }

            if (entry.type === 'todo') {
                const status = document.createElement('p');
                status.className = 'custom-achievement-status';
                status.textContent = entry.completed
                    ? translate('achievements.custom.todo.statusCompleted', null, '状態: 完了済み')
                    : translate('achievements.custom.todo.statusIncomplete', null, '状態: 未完了');
                card.appendChild(status);
                const controls = document.createElement('div');
                controls.className = 'custom-achievement-controls';
                const toggle = document.createElement('button');
                toggle.type = 'button';
                toggle.dataset.action = 'toggle';
                toggle.textContent = entry.completed
                    ? translate('achievements.custom.todo.markIncomplete', null, '未完了に戻す')
                    : translate('achievements.custom.todo.markComplete', null, '完了にする');
                controls.appendChild(toggle);
                card.appendChild(controls);
            } else if (entry.type === 'repeatable') {
                const info = document.createElement('p');
                info.className = 'custom-achievement-info';
                const params = {
                    count: formatNumber(entry.completions)
                };
                const infoKey = entry.target
                    ? 'achievements.custom.repeatable.infoWithTarget'
                    : 'achievements.custom.repeatable.info';
                const fallback = entry.target
                    ? `累計達成回数: ${formatNumber(entry.completions)} 回 / 目標 ${formatNumber(entry.target)} 回`
                    : `累計達成回数: ${formatNumber(entry.completions)} 回`;
                if (entry.target) {
                    params.target = formatNumber(entry.target);
                }
                info.textContent = translate(infoKey, params, fallback);
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
                reset.textContent = translate('achievements.custom.actions.reset', null, 'リセット');
                controls.appendChild(minus);
                controls.appendChild(plus);
                controls.appendChild(reset);
                card.appendChild(controls);
            } else if (entry.type === 'counter') {
                const info = document.createElement('p');
                info.className = 'custom-achievement-info';
                const params = {
                    value: formatNumber(entry.value)
                };
                const infoKey = entry.target
                    ? 'achievements.custom.counter.infoWithTarget'
                    : 'achievements.custom.counter.info';
                const fallback = entry.target
                    ? `現在値: ${formatNumber(entry.value)} / 目標 ${formatNumber(entry.target)}`
                    : `現在値: ${formatNumber(entry.value)}`;
                if (entry.target) {
                    params.target = formatNumber(entry.target);
                }
                info.textContent = translate(infoKey, params, fallback);
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
                reset.textContent = translate('achievements.custom.actions.reset', null, 'リセット');
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
            title: title || translate('achievements.custom.defaultTitle', null, 'カスタム実績'),
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
                const floor = Number(payload?.floor);
                if (Number.isFinite(floor) && floor > state.stats.core.highestFloorReached) {
                    state.stats.core.highestFloorReached = floor;
                    mutated = true;
                }
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
                if (payload && payload.rarity === 'rare') {
                    mutated = incrementStat('core.rareChestsOpened', 1) || mutated;
                } else {
                    mutated = incrementStat('core.normalChestsOpened', 1) || mutated;
                }
                break;
            }
            case 'death': {
                mutated = incrementStat('core.deaths', 1) || mutated;
                state.stats.core.lastDeathAt = Date.now();
                mutated = true;
                break;
            }
            case 'healing_item_used': {
                mutated = incrementStat('core.healingItemsUsed', 1) || mutated;
                break;
            }
            case 'auto_item_triggered': {
                mutated = incrementStat('core.autoItemsTriggered', 1) || mutated;
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
            case 'hatena_block_spawned': {
                const count = Math.max(0, Math.floor(Number(payload?.count) || 0));
                if (count > 0) {
                    mutated = incrementStat('hatena.blocksAppeared', count) || mutated;
                }
                break;
            }
            case 'hatena_block_triggered': {
                mutated = incrementStat('hatena.blocksTriggered', 1) || mutated;
                const details = payload || {};
                const classification = details.classification || 'neutral';
                if (classification === 'positive') {
                    mutated = incrementStat('hatena.positiveEffects', 1) || mutated;
                } else if (classification === 'negative') {
                    mutated = incrementStat('hatena.negativeEffects', 1) || mutated;
                } else {
                    mutated = incrementStat('hatena.neutralEffects', 1) || mutated;
                }

                const levelDelta = Number(details.levelDelta) || 0;
                if (levelDelta > 0) {
                    mutated = incrementStat('hatena.levelUps', 1) || mutated;
                    mutated = incrementStat('hatena.levelUpLevels', levelDelta) || mutated;
                } else if (levelDelta < 0) {
                    mutated = incrementStat('hatena.levelDowns', 1) || mutated;
                    mutated = incrementStat('hatena.levelDownLevels', Math.abs(levelDelta)) || mutated;
                }

                const expDelta = Number(details.expDelta);
                if (Number.isFinite(expDelta)) {
                    if (expDelta > 0) {
                        mutated = incrementStat('hatena.expGained', expDelta) || mutated;
                    } else if (expDelta < 0) {
                        mutated = incrementStat('hatena.expLost', Math.abs(expDelta)) || mutated;
                    }
                }

                const itemCount = Math.max(0, Math.floor(Number(details.itemsGranted) || 0));
                if (itemCount > 0) {
                    mutated = incrementStat('hatena.itemsGranted', itemCount) || mutated;
                }

                const normalChests = Math.max(0, Math.floor(Number(details.normalChestsSpawned) || 0));
                if (normalChests > 0) {
                    mutated = incrementStat('hatena.normalChestsSpawned', normalChests) || mutated;
                }

                const rareChests = Math.max(0, Math.floor(Number(details.rareChestsSpawned) || 0));
                if (rareChests > 0) {
                    mutated = incrementStat('hatena.rareChestsSpawned', rareChests) || mutated;
                }

                const enemies = Math.max(0, Math.floor(Number(details.enemyCount) || 0));
                if (enemies > 0) {
                    mutated = incrementStat('hatena.enemyAmbushes', enemies) || mutated;
                }

                if (details.bombOutcome) {
                    mutated = incrementStat('hatena.bombsTriggered', 1) || mutated;
                    const bombAmount = Math.max(0, Math.floor(Number(details.bombAmount) || 0));
                    if (details.bombOutcome === 'damage') {
                        if (bombAmount > 0) {
                            mutated = incrementStat('hatena.bombDamageTaken', bombAmount) || mutated;
                        }
                    } else if (details.bombOutcome === 'healed') {
                        if (bombAmount > 0) {
                            mutated = incrementStat('hatena.bombHealed', bombAmount) || mutated;
                        }
                    } else if (details.bombOutcome === 'guard') {
                        mutated = incrementStat('hatena.bombGuards', 1) || mutated;
                    }
                }

                if (details.statusAttempted) {
                    if (details.statusApplied) {
                        mutated = incrementStat('hatena.statusesApplied', 1) || mutated;
                    } else {
                        mutated = incrementStat('hatena.statusesResisted', 1) || mutated;
                    }
                }

                if (details.abilityApplied === 'up') {
                    mutated = incrementStat('hatena.abilityUps', 1) || mutated;
                } else if (details.abilityApplied === 'down') {
                    mutated = incrementStat('hatena.abilityDowns', 1) || mutated;
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
                    if (confirm(translate('achievements.custom.confirmDelete', null, 'このカスタム実績を削除しますか？'))) {
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

    if (typeof global.document?.addEventListener === 'function') {
        global.document.addEventListener('visibilitychange', resetPlaytimeClock, { passive: true });
        global.document.addEventListener('i18n:locale-changed', () => {
            if (ui.initialized) renderAll();
        }, { passive: true });
    }
    if (typeof global.addEventListener === 'function') {
        global.addEventListener('focus', resetPlaytimeClock, { passive: true });
        global.addEventListener('blur', resetPlaytimeClock, { passive: true });
        global.addEventListener('beforeunload', stopPlaytimeTracker, { passive: true });
    }
    startPlaytimeTracker();

    global.AchievementSystem = {
        initUI,
        recordEvent,
        exportState,
        importState,
        refresh
    };
})(window);

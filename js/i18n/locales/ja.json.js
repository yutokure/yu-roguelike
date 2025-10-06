(function (root) {
  if (!root) return;
  var store = root.__i18nLocales = root.__i18nLocales || {};
  store['ja'] = {
    "meta": {
      "title": "Yuローグライク"
    },
    "header": {
      "title": "Yuローグライク"
    },
    "ui": {
      "language": {
        "label": "言語",
        "ariaLabel": "言語セレクター",
        "option": {
          "ja": "日本語",
          "en": "English"
        }
      },
      "runResult": {
        "title": "リザルト",
        "reason": {
          "gameOver": "ゲームオーバー",
          "clear": "ダンジョンクリア",
          "retreat": "ダンジョン帰還",
          "return": "冒険結果"
        }
      }
    },
    "messages": {
      "domainCrystal": {
        "spawn": "謎めいた領域クリスタルがこの階に出現した…！"
      },
      "domainEffect": {
        "enter": "領域効果「{label}」の影響下に入った！",
        "exit": "領域効果の影響から解放された。"
      },
      "domain": {
        "poisonNegated": "領域効果により毒のダメージを無効化した！",
        "poisonReversed": "毒の痛みが反転し、HPが{amount}回復した！",
        "poisonDamage": "毒で{amount}のダメージ！",
        "rareChestGuarded": "黄金の宝箱が爆発したが領域効果で守られた！",
        "rareChestReversed": "黄金の宝箱の爆発が反転し、HPが{amount}回復した！",
        "rareChestDamage": "黄金の宝箱が爆発！HPが{damage}減少（タイミングずれ {timing}%）",
        "rareChestDeath": "黄金の宝箱の爆発に巻き込まれた…ゲームオーバー",
        "damageBlocked": "領域効果に阻まれてダメージを与えられなかった…",
        "enemyHealed": "領域効果で敵が{amount}回復してしまった！",
        "poisonFloorNegated": "領域効果で毒床のダメージを無効化した！",
        "poisonFloorReversed": "毒床のエネルギーが反転し、HPが{amount}回復した！",
        "poisonFloorDamage": "毒床がダメージ！HPが{amount}減少",
        "poisonFloorDeath": "毒床で倒れた…ゲームオーバー",
        "bombGuarded": "領域効果で爆風を防いだ！",
        "bombReversed": "爆風の力が反転し、HPが{amount}回復した！",
        "bombDamage": "爆弾が爆発！HPが{amount}減少",
        "bombDeath": "爆弾に巻き込まれて倒れた…ゲームオーバー",
        "bombSafe": "爆弾が爆発したがダメージは受けなかった！",
        "enemyAttackGuarded": "領域効果に守られ、ダメージを受けなかった！",
        "enemyAttackReversed": "領域効果で敵の攻撃が回復に変わった！HPが{amount}回復"
      }
    },
    "selection": {
      "title": "ダンジョン選択",
      "difficulty": {
        "label": "難易度",
        "option": {
          "veryEasy": "Very Easy",
          "easy": "Easy",
          "normal": "Normal",
          "second": "Second",
          "hard": "Hard",
          "veryHard": "Very Hard"
        }
      },
      "tabs": {
        "ariaLabel": "ダンジョン選択タブ",
        "normal": "通常",
        "blockdim": "ブロック次元",
        "miniexp": "ミニゲー経験",
        "tools": "ツールズ",
        "achievements": "実績・統計"
      },
      "normal": {
        "worlds": "世界",
        "dungeons": "ダンジョン",
        "detail": {
          "name": "ダンジョン名",
          "typeLabel": "種類:",
          "typeValue": "フィールド",
          "recommendedLabel": "推奨レベル:",
          "damageLabel": "ダメージ倍率:",
          "damageValue": "与: 1.6x / 被: 0.5x",
          "descriptionLabel": "説明:",
          "description": "ダンジョンの説明",
          "start": "ダンジョンに入る"
        }
      },
      "blockdim": {
        "nested": {
          "label": "NESTED次元",
          "title": "NESTED次元: 推奨Lvが2600*(N-1)増加します"
        },
        "dimension": {
          "label": "次元",
          "listLabel": "次元",
          "first": "1st",
          "second": "2nd",
          "third": "3rd"
        },
        "card": {
          "title": "合成プレビュー",
          "selection": "選択",
          "level": "推奨Lv",
          "type": "タイプ",
          "depth": "深さ",
          "size": "サイズ",
          "chest": "宝箱",
          "boss": "ボス階",
          "note": "同一選択は同一生成（固定シード）",
          "gate": "Gate",
          "addBookmark": "★ ブックマーク追加",
          "addBookmarkTitle": "現在の組み合わせをブックマーク",
          "clearHistory": "履歴クリア",
          "clearHistoryTitle": "Gate履歴を全消去",
          "random": "🎲 ランダム選択（1st/2nd/3rd）",
          "randomTitle": "1st/2nd/3rd をランダムに選択",
          "randomTarget": "目標Lv(ブロック合計)",
          "randomTargetTitle": "次元の基準Lvは無視し、ブロック3つのLv合計のみ",
          "randomType": "タイプ優先",
          "randomTypeTitle": "一致タイプを優先的に選びます",
          "randomTypeNone": "指定なし",
          "weightedRandom": "🎯 重み付きランダム",
          "weightedRandomTitle": "目標Lvとタイプ優先でランダム選択"
        },
        "history": {
          "title": "Gate履歴"
        },
        "bookmarks": {
          "title": "ブロックブックマーク"
        },
        "test": {
          "title": "ダンジョンテスト",
          "description": "ランダムなシードで全ての登録ダンジョンタイプを生成し、安全にブロック次元を遊べるか検証します。エラーが発生してもログに記録され、無限ループが起きた場合は完了しません。",
          "run": "🧪 ダンジョンテスト",
          "idle": "待機中"
        }
      },
      "miniexp": {
        "categories": "カテゴリ一覧",
        "displayModes": "表示形式",
        "list": "ミニゲーム一覧",
        "difficulty": {
          "label": "難易度",
          "easy": "EASY",
          "normal": "NORMAL",
          "hard": "HARD"
        },
        "start": "開始",
        "pause": "一時停止",
        "restart": "再開/再起動",
        "quit": "終了",
        "hud": {
          "level": "Lv",
          "sp": "SP",
          "expLabel": "EXP "
        },
        "placeholder": "左の一覧からミニゲームを選択してください。"
      }
    },
    "achievements": {
      "categories": {
        "dungeon": "ダンジョン関連",
        "blockdim": "ブロック次元関連",
        "hatena": "ハテナブロック関連",
        "tools": "ツールズ関連",
        "mini": "ミニゲーム関連"
      },
      "messages": {
        "categoryComingSoon": "実績は近日追加予定です。",
        "emptyCategory": "登録されている実績はまだありません。"
      },
      "status": {
        "comingSoon": "COMING SOON",
        "unlocked": "達成済み",
        "locked": "未達成"
      },
      "rewardMemo": "報酬メモ: {reward}",
      "summary": {
        "comingSoon": "Coming Soon"
      },
      "meta": {
        "repeatableCount": "累計達成回数: {count}",
        "counterCount": "達成数: {count}"
      },
      "progress": {
        "ratio": "{current} / {target}",
        "floorRatio": "{current}F / {target}F",
        "bossDefeated": "{count} 体撃破",
        "nextRuns": "次の達成まで {count} 回",
        "completed": "達成！",
        "remaining": "あと {count} 回",
        "actions": "{count} 回操作",
        "duration": {
          "full": "{hours}時間 {minutes}分 {seconds}秒",
          "minutes": "{minutes}分 {seconds}秒",
          "seconds": "{seconds}秒",
          "ratio": "{current} / {target}"
        }
      },
      "auto": {
        "dungeon_first_clear": {
          "title": "初陣の証",
          "description": "いずれかのダンジョンを攻略する。",
          "reward": "称号「新人冒険者」"
        },
        "dungeon_hard_clear": {
          "title": "高難度征服者",
          "description": "Hard 以上の難易度でダンジョンを攻略する。",
          "reward": "高難易度攻略の記念メダル"
        },
        "dungeon_step_1000": {
          "title": "千里の旅も一歩から",
          "description": "累計移動距離を 1000 マスに到達させる。",
          "reward": "移動ノウハウのメモ"
        },
        "dungeon_boss_hunter": {
          "title": "ボスハンター",
          "description": "ボス撃破数がそのまま実績カウントになります。",
          "reward": "称号「狩人」"
        },
        "dungeon_loop_runner": {
          "title": "周回の達人",
          "description": "ダンジョンを 5 回攻略するごとにカウントが増える実績。",
          "reward": "周回ログカード"
        },
        "dungeon_floor_master": {
          "title": "深淵踏破者",
          "description": "最高到達階層を 30F 以上にする。",
          "reward": "称号「深淵踏破者」"
        },
        "dungeon_healing_specialist": {
          "title": "応急の達人",
          "description": "回復アイテムを 25 回使用する。",
          "reward": "回復の心得"
        },
        "dungeon_auto_guardian": {
          "title": "自動防衛システム",
          "description": "オートアイテムを 10 回発動させる。",
          "reward": "自動回復コア"
        },
        "dungeon_playtime_30min": {
          "title": "冒険の始まり",
          "description": "累計プレイ時間を 30 分に到達させる。",
          "reward": "携帯砂時計"
        },
        "dungeon_playtime_3hour": {
          "title": "時間を忘れて",
          "description": "累計プレイ時間を 3 時間に到達させる。",
          "reward": "熟練冒険者の時計"
        },
        "dungeon_playtime_12hour": {
          "title": "止まらない探索心",
          "description": "累計プレイ時間を 12 時間に到達させる。",
          "reward": "時空の羅針盤"
        },
        "dungeon_rare_collector": {
          "title": "レアコレクター",
          "description": "レア宝箱を 10 個開ける。",
          "reward": "希少鍵の欠片"
        },
        "dungeon_iron_wall": {
          "title": "鉄壁の生還者",
          "description": "計被ダメージ 10,000 を経験する。",
          "reward": "鉄壁の盾"
        },
        "blockdim_first_gate": {
          "title": "ゲート起動",
          "description": "初めて Gate からブロック次元に突入する。",
          "reward": "ゲート起動ログ"
        },
        "blockdim_bookmark_collector": {
          "title": "ブックマークコレクター",
          "description": "ブロック次元のブックマークを 5 件登録する。",
          "reward": "組み合わせ研究ノート"
        },
        "blockdim_weighted_explorer": {
          "title": "狙い撃ち合成者",
          "description": "重み付きランダム選択を使用する。",
          "reward": "狙い撃ち計算式"
        },
        "hatena_first_trigger": {
          "title": "謎との遭遇",
          "description": "ハテナブロックを初めて発動させる。",
          "reward": "調査記録「？」"
        },
        "hatena_block_researcher": {
          "title": "ハテナ観測隊",
          "description": "ハテナブロックを 25 回発動させる。",
          "reward": "観測ログシート"
        },
        "hatena_lucky_chain": {
          "title": "幸運を掴む者",
          "description": "ハテナブロックから好影響を 15 回得る。",
          "reward": "幸運のお守り"
        },
        "hatena_unlucky_survivor": {
          "title": "不運をも超えて",
          "description": "ハテナブロックの悪影響を 10 回経験しても生き延びる。",
          "reward": "耐久メダル"
        },
        "hatena_rare_hunter": {
          "title": "輝く幸運",
          "description": "ハテナブロックからレア宝箱を 3 個出現させる。",
          "reward": "宝箱鑑定レンズ"
        },
        "tools_first_visit": {
          "title": "工房デビュー",
          "description": "ツールズタブを開く。",
          "reward": "作業手帳"
        },
        "tools_mod_export": {
          "title": "アドオンビルダー",
          "description": "Mod 作成ツールでコードを書き出す。",
          "reward": "Mod 署名スタンプ"
        },
        "tools_blockdata_saver": {
          "title": "データ整備士",
          "description": "BlockData エディタでデータを保存またはダウンロードする。",
          "reward": "整備員バッジ"
        },
        "tools_sandbox_session": {
          "title": "シミュレーション好き",
          "description": "サンドボックスインターフェースを開いて編集する。",
          "reward": "テストパス"
        },
        "minigame_coming_soon": {
          "title": "ミニゲーム実績",
          "description": "COMING SOON - ミニゲーム用実績は近日追加予定です。",
          "reward": ""
        }
      }
    }
  };
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);

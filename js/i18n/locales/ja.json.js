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
        "category": {
          "all": "すべて",
          "action": "アクション",
          "board": "ボード",
          "shooting": "シューティング",
          "puzzle": "パズル",
          "utility": "ユーティリティ",
          "rhythm": "リズム",
          "gambling": "ギャンブル",
          "toy": "トイ",
          "simulation": "シミュレーション",
          "skill": "スキル",
          "misc": "その他"
        },
        "games": {
          "snake": {
            "name": "スネーク",
            "description": "餌を取ると+1EXP"
          },
          "othello": {
            "name": "オセロ",
            "description": "ひっくり返し×0.5EXP＋勝利ボーナス"
          },
          "checkers": {
            "name": "チェッカー",
            "description": "ジャンプで駒取りしつつ王冠を目指すクラシックボードゲーム"
          },
          "chess": {
            "name": "チェス",
            "description": "駒の組み合わせで王を詰ませる本格チェス。駒取りとチェックでEXPを獲得"
          },
          "xiangqi": {
            "name": "シャンチー",
            "description": "中国の将棋・象棋。駒取り・王手・詰みでEXPを稼ごう"
          },
          "shogi": {
            "name": "将棋",
            "description": "持ち駒と成りを駆使する本格将棋。指し手/捕獲/王手でEXP"
          },
          "riichi_mahjong": {
            "name": "リーチ麻雀ライト",
            "description": "AI3人と東風1局を戦う簡易リーチ麻雀。リーチ/ツモ/ロンと点棒精算に対応"
          },
          "connect6": {
            "name": "コネクトシックス",
            "description": "六目並べ。配置+1/リーチ+10/勝利で高EXP"
          },
          "gomoku": {
            "name": "五目並べ",
            "description": "配置+1/リーチ+10/勝利ボーナス"
          },
          "renju": {
            "name": "連珠",
            "description": "禁手ルール付き五目並べ。配置+1/リーチ+10/勝利ボーナス"
          },
          "go": {
            "name": "囲碁",
            "description": "配置+1/捕獲ボーナス/勝利EXP"
          },
          "backgammon": {
            "name": "バックギャモン",
            "description": "24ポイントを駆け巡りベアリングオフを目指すバックギャモン。ヒットやベアオフでEXP獲得"
          },
          "connect4": {
            "name": "四目並べ",
            "description": "落下式四目。配置+1/リーチ+10"
          },
          "tic_tac_toe": {
            "name": "三目並べ",
            "description": "配置+1/リーチ+10/シンプル勝利EXP"
          },
          "mancala": {
            "name": "マンカラ",
            "description": "カラハ式マンカラ。種まきと捕獲を駆使してAIと勝負"
          },
          "breakout": {
            "name": "ブロック崩し",
            "description": "ブロック破壊で+1EXP"
          },
          "breakout_k": {
            "name": "ブロック崩しk",
            "description": "バー操作はキーボード限定"
          },
          "pinball_xp": {
            "name": "XPピンボール",
            "description": "3Dピンボール風テーブル。バンパーやレーンでEXPを稼ごう"
          },
          "dungeon_td": {
            "name": "ダンジョンタワーディフェンス",
            "description": "混合型ダンジョンで砲塔を設置し迫る敵波を迎撃するタワーディフェンス"
          },
          "pong": {
            "name": "ピンポン",
            "description": "マッチ勝利で EASY+1 / NORMAL+5 / HARD+25"
          },
          "same": {
            "name": "セイムゲーム",
            "description": "同色まとめ消し×0.5EXP"
          },
          "match3": {
            "name": "マッチ3",
            "description": "3:+1 / 4:+3 / 5:+10、連鎖×1.5"
          },
          "minesweeper": {
            "name": "マインスイーパー",
            "description": "開放×0.1 / クリア: 25/200/1600"
          },
          "sudoku": {
            "name": "ナンプレ",
            "description": "正解入力でEXP / クリアボーナス"
          },
          "ultimate_ttt": {
            "name": "スーパー三目並べ",
            "description": "小盤制覇+25/配置+1/リーチ+10/勝利ボーナス"
          },
          "nine_mens_morris": {
            "name": "ナイン・メンズ・モリス",
            "description": "配置+1 / ミル+15 / 勝利ボーナス"
          },
          "sugoroku_life": {
            "name": "人生すごろく",
            "description": "キャリアイベントを乗り越えて資産とEXPを伸ばす人生風すごろく"
          },
          "sliding_puzzle": {
            "name": "スライドパズル",
            "description": "難易度で8/15/24のスライドパズル"
          },
          "invaders": {
            "name": "インベーダー風",
            "description": "撃破+1 / 全滅+50"
          },
          "pacman": {
            "name": "パックマン風",
            "description": "餌+0.5 / 全取得+100"
          },
          "bomberman": {
            "name": "ボンバーマン風",
            "description": "ソフトブロック破壊+3 / 敵撃破+12 / 全滅+75"
          },
          "tetris": {
            "name": "テトリス風",
            "description": "REN×1.5^n / T-Spin"
          },
          "falling_puyos": {
            "name": "ぷよぷよ風",
            "description": "4つ同色で消去。連鎖で倍率UP"
          },
          "triomino_columns": {
            "name": "トリオミノコラムス",
            "description": "トリオトスDX風！ラインスパーク＆ホールド対応"
          },
          "game2048": {
            "name": "2048",
            "description": "合成log2 / 2048で+777"
          },
          "todo_list": {
            "name": "ToDoリスト",
            "description": "タスク完了で設定EXP / 失敗は獲得なし"
          },
          "counter_pad": {
            "name": "カウンターパッド",
            "description": "数値を増減するだけのマルチカウンター。操作内容は自動保存"
          },
          "notepad": {
            "name": "メモ帳",
            "description": "開く+5 / 編集+1 / 保存+5 EXP"
          },
          "exceler": {
            "name": "表計算エクセラー",
            "description": "XLSXの読み書きと主要関数・書式対応の軽量スプレッドシート"
          },
          "paint": {
            "name": "ペイント",
            "description": "描画+1 / 塗りつぶし+3 / 保存+8 EXP"
          },
          "diagram_maker": {
            "name": "ダイアグラムメーカー",
            "description": "draw.io XMLとPNG/JPG/BMP出力に対応した図表作成ユーティリティ"
          },
          "clock_hub": {
            "name": "時計ハブ",
            "description": "多彩な時計と時間情報、節目EXPを備えたユーティリティ"
          },
          "login_bonus": {
            "name": "ログインボーナス",
            "description": "カレンダーで毎日のログインボーナスを受け取り記録できます"
          },
          "stopwatch": {
            "name": "ストップウォッチ",
            "description": "ラップ計測に対応したストップウォッチ。操作でEXPを獲得"
          },
          "calculator": {
            "name": "電卓",
            "description": "ユーティリティ電卓。数字入力+1 / 計算確定+5EXP"
          },
          "timer": {
            "name": "タイマー",
            "description": "カウントダウンとストップウォッチで時間管理"
          },
          "math_lab": {
            "name": "数学ラボ",
            "description": "高度な関数・単位変換・グラフ・テトレーション対応の数学ワークステーション"
          },
          "calc_combo": {
            "name": "計算コンボ",
            "description": "2桁までの四則演算をテンポ良く解いてコンボEXPを稼ぐ高速暗算ゲーム"
          },
          "blockcode": {
            "name": "ブロックコードラボ",
            "description": "Scratch風のブロックでミニゲームAPIを安全に試せるビジュアルプログラミング環境"
          },
          "wording": {
            "name": "Wording",
            "description": "編集+1 / 書式+2 / 保存+6 EXP のワープロ"
          },
          "video_player": {
            "name": "動画プレイヤー",
            "description": "ローカル動画とYouTubeの視聴でEXPを獲得できるユーティリティ"
          },
          "pomodoro": {
            "name": "ポモドーロタイマー",
            "description": "集中と休憩のサイクル管理で完了ごとにEXPを得られるタイマー"
          },
          "music_player": {
            "name": "ミュージックプレイヤー",
            "description": "ローカル音源再生・視覚化・EQ搭載。再生や取り込みでEXP獲得"
          },
          "tester": {
            "name": "JSテスター",
            "description": "JS機能テストとCPUベンチマーク、ブロック式アドベンチャー作成ツール"
          },
          "system": {
            "name": "システム",
            "description": "PC/OS/ブラウザ/IPを横断的に確認できるシステム情報ユーティリティ"
          },
          "aim": {
            "name": "的あて（エイム）",
            "description": "命中で1〜3EXP／連続命中ボーナス"
          },
          "dodge_race": {
            "name": "回避レース",
            "description": "距離で微量EXP／CP+5"
          },
          "pseudo3d_race": {
            "name": "ハイウェイチェイサー",
            "description": "疑似3D高速道路で交通を追い抜け。距離+0.5/追い越し+4/セクション+25"
          },
          "bowling_duel": {
            "name": "ボウリング対決",
            "description": "カーブ・狙い・パワーを調整してCPUと10フレーム勝負するボウリングMOD"
          },
          "topdown_race": {
            "name": "Aurora Circuit",
            "description": "見下ろし型周回レース。ラップと順位でEXP獲得"
          },
          "falling_shooter": {
            "name": "落下ブロック・シューター",
            "description": "破壊で1〜数EXP（大きいほど高EXP）"
          },
          "bubble_shooter": {
            "name": "バブルシューター",
            "description": "バブルを撃って3つ揃えで消去。浮いたバブルはまとめて落下"
          },
          "virus_buster": {
            "name": "ドクターマリオ風",
            "description": "カプセルで4つ揃え！ウイルス退治でEXP獲得"
          },
          "sichuan": {
            "name": "四川省パズル",
            "description": "麻雀牌のペアを線で繋いで消す四川省。連続消去でボーナスEXP"
          },
          "piano_tiles": {
            "name": "リズムタイル",
            "description": "ピアノタイル風の4レーン譜面。タップとホールドをタイミング良く決めてコンボを伸ばそう"
          },
          "taiko_drum": {
            "name": "太鼓リズム",
            "description": "太鼓の達人風の2面譜面。良/可/普/不の判定とコンボEXPボーナスを搭載"
          },
          "river_crossing": {
            "name": "川渡り",
            "description": "1段前進+1／到達+50"
          },
          "whack_a_mole": {
            "name": "モグラたたき",
            "description": "命中でEXP／連続命中ボーナス"
          },
          "xp_crane": {
            "name": "XPクレーンキャッチャー",
            "description": "クレーンを操作して経験値カプセルを掬い上げるミニゲーム。連続成功と特殊カプセルでEXPを稼ごう"
          },
          "steady_wire": {
            "name": "イライラ棒",
            "description": "毎回生成されるコースを外れず進むワイヤーループ。操作方法を選んで挑戦"
          },
          "flappy_bird": {
            "name": "フラッピーバード風",
            "description": "パイプ通過でEXP。連続成功でボーナス"
          },
          "dino_runner": {
            "name": "ダイノランナー",
            "description": "恐竜で障害物ジャンプ／距離EXP"
          },
          "floor_descent": {
            "name": "フロア降りサバイバル",
            "description": "迫る針天井から逃げながら下へ進む縦スクロールアクション。足場ギミックで差をつけよう"
          },
          "forced_scroll_jump": {
            "name": "強制スクロールジャンプ",
            "description": "強制横スクロールで穴や鉄球を避けつつCXマークを集めてランクを目指す"
          },
          "tosochu": {
            "name": "逃走中",
            "description": "逃走者 VS ハンターの番組風アクション。逃げ切れば+10000EXP、自首で蓄積EXP"
          },
          "ten_ten": {
            "name": "1010パズル",
            "description": "ラインでEXP／クロス消しは倍増"
          },
          "trump_games": {
            "name": "トランプセレクション",
            "description": "トランプゲームハブ（神経衰弱・ブラックジャック・ババ抜き収録）"
          },
          "gamble_hall": {
            "name": "ギャンブルホール",
            "description": "EXPを賭けるルーレットとパチンコスロットの複合MOD"
          },
          "electro_instrument": {
            "name": "電子楽器スタジオ",
            "description": "ピアノ鍵盤と多彩な音色で自由に演奏し音ごとにEXP獲得"
          },
          "graphics_tester": {
            "name": "3Dグラフィックテスター",
            "description": "3D技術デモとレイトレーシング風レンダリング・ベンチマーク搭載のトイ系テスター"
          },
          "physics_sandbox": {
            "name": "物理遊び",
            "description": "火・水・ツタ・雷・回路を組み合わせるトイ系物理サンドボックス"
          },
          "populite": {
            "name": "ポピュラス風",
            "description": "地形整備と信仰力で人口目標を達成するリアルタイム神シミュレーション"
          },
          "logic_circuit": {
            "name": "論理回路シミュレータ",
            "description": "入力ソース・ゲート・出力を配置して論理回路をシミュレーション"
          },
          "circuit_simulator": {
            "name": "電気回路シミュレータ",
            "description": "DC/AC電源・受動素子・計器で回路を構成し計測するトイ向け回路ラボ"
          },
          "memo_studio": {
            "name": "暗記スタジオ",
            "description": "フラッシュカードを登録し間隔反復で学習する暗記アプリ"
          },
          "onigokko": {
            "name": "鬼ごっこ",
            "description": "混合型ダンジョンを舞台に鬼から逃げるトイアクション"
          },
          "darumasan": {
            "name": "だるまさんがころんだ",
            "description": "見られずにゴールすれば50EXPの緊張感ミニゲーム"
          },
          "acchimuitehoi": {
            "name": "あっち向いてホイ",
            "description": "攻め成功で15EXP、防御成功で5EXPを狙う反射ゲーム"
          },
          "janken": {
            "name": "じゃんけん",
            "description": "クラシックじゃんけん。勝利すると10EXP"
          },
          "typing": {
            "name": "タイピングチャレンジ",
            "description": "60秒タイプで正確さとスピードを競うタイピングチャレンジ"
          },
          "imperial_realm": {
            "name": "インペリアル・レルム",
            "description": "村人と軍勢を指揮してウェーブ攻撃を凌ぎ敵本陣を撃破するAoE2風リアルタイムストラテジー"
          }
        },

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

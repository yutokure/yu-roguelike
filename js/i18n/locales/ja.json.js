(function (root) {
  if (!root) return;
  var store = root.__i18nLocales = root.__i18nLocales || {};
  var locale = {
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
        },
        "stats": {
          "level": "レベル",
          "totalExp": "合計獲得経験値",
          "totalDamage": "合計被ダメージ",
          "healingItems": "回復アイテム使用数"
        },
        "actions": {
          "return": "拠点に戻る",
          "retry": "再挑戦"
        }
        ,
        "onigokko": {
          "timer": {
            "remaining": "残り {seconds}s"
          },
          "status": {
            "start": "鬼ごっこ開始！矢印キー/WASDで移動",
            "paused": "一時停止中",
            "loading": "ステージ読み込み中…",
            "ready": "準備完了！開始で鬼ごっこスタート",
            "stage_generation_failed": "ステージ生成に失敗しました",
            "api_unavailable": "ダンジョンAPIが利用できません",
            "caught": "捕まった！",
            "caught_no_reward": "捕まってしまった！獲得EXPなし",
            "escaped": "見事逃げ切った！",
            "escape_success": "逃げ切り成功！"
          }
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
      },
      "skills": {
        "cannotUse": "スキルを使えない：{reason}",
        "notEnoughSp": "SPが不足している。",
        "genericKill": "敵を倒した！",
        "effects": {
          "applied": "{label}の効果が発動！（{turns}ターン）",
          "gimmickNullifyExpired": "ギミック無効化の効果が切れた。",
          "statusGuardExpired": "状態異常無効の効果が切れた。",
          "enemyNullifyExpired": "特殊効果無効の効果が切れた。",
          "sureHitExpired": "必中攻撃の効果が切れた。"
        },
        "breakWall": {
          "noWall": "目の前に破壊できる壁がない。",
          "notBreakable": "その壁は破壊できなかった。",
          "success": "SPスキル：壁を粉砕した！"
        },
        "buildWall": {
          "noFloor": "目の前に壁へ変換できる床がない。",
          "cannotBuild": "そこには壁を生成できない。",
          "success": "SPスキル：壁を生成した！"
        },
        "gimmickNullify": {
          "tooHard": "このダンジョンではギミック無効化の効果が及ばない…"
        },
        "stairWarp": {
          "noDestination": "階段の周囲に安全なワープ先がない。",
          "success": "階段の前へ瞬間移動した！"
        },
        "strongStrike": {
          "noTarget": "強攻撃を放つ敵がいない。",
          "sureHitFailed": "敵のレベルが高すぎて必中が効かなかった…",
          "miss": "強攻撃は外れてしまった。",
          "damage": "強攻撃で{damage}のダメージ！",
          "kill": "強攻撃で敵を倒した！"
        },
        "rangedAttack": {
          "noTarget": "前方に遠隔攻撃が届く敵がいない。",
          "miss": "遠隔攻撃は外れてしまった…。",
          "damage": "遠隔攻撃で{damage}のダメージ！",
          "kill": "遠隔攻撃で敵を倒した！"
        },
        "areaSkill": {
          "noTargets": "範囲内に敵がいない。",
          "activated": "{skillName}を発動した！",
          "sureHitFailed": "高レベルの敵には効果が薄かった…",
          "kill": "{skillName}で敵を倒した！",
          "noneHit": "誰にも当たらなかった…"
        },
        "floorSkill": {
          "noTargets": "攻撃対象となる敵がいない。",
          "activated": "{skillName}を放った！",
          "sureHitFailed": "高レベルの敵には効果がなかった…",
          "kill": "{skillName}で敵を倒した！",
          "noneHit": "誰にもダメージを与えられなかった。"
        },
        "ruinAnnihilation": {
          "start": "破滅の力を解き放った！",
          "kill": "破滅の炎で敵を消し飛ばした！",
          "resisted": "一部の高レベルの敵には破滅の力が届かなかった…",
          "cleared": "ダンジョンの壁とギミックが消え去った！"
        }
      }
    },

    "skills": {
      "meta": {
        "currentSp": "現在のSP: {value}",
        "currentSpLabel": "現在のSP",
        "costAndCurrent": "消費SP: {cost} / 所持: {current}",
        "reasonSuffix": " ({reason})",
        "remainingTurns": "現在: 残り{turns}ターン",
        "use": "使用"
      },
      "modal": {
        "title": "スキル"
      },
      "availability": {
        "unlockLevel": "Lv100で解放",
        "maxSpShortage": "SP上限不足",
        "notEnoughSp": "SPが足りない",
        "tooHard": "高難度で無効",
        "noWallAhead": "前方に壁なし",
        "noFloorAhead": "前方に床なし",
        "noRangedTarget": "届く敵なし",
        "noFrontEnemy": "目の前に敵なし",
        "noAreaTargets": "範囲内に敵なし",
        "noEnemies": "敵がいない",
        "noWarpDestination": "ワープ先なし",
        "notYourTurn": "自分のターンではない",
        "paralyzed": "麻痺中"
      },
      "effects": {
        "gimmickNullify": { "label": "ギミック無効" },
        "statusGuard": { "label": "状態異常無効" },
        "enemyNullify": { "label": "特殊効果無効" },
        "sureHit": { "label": "必中攻撃" }
      },
      "breakWall": {
        "name": "壁破壊",
        "description": "目の前の壁を1つ破壊する。"
      },
      "buildWall": {
        "name": "壁生成",
        "description": "目の前の床を壁に変える。"
      },
      "rangedAttack": {
        "name": "遠隔攻撃",
        "description": "前方一直線上の敵に通常攻撃の1/3ダメージを必中で与える。壁で遮られる。"
      },
      "gimmickNullify": {
        "name": "ギミック無効化",
        "description": "10ターンの間ダンジョンギミックを無効化する。（推奨Lvが8以上高い場合は無効）"
      },
      "statusGuard": {
        "name": "状態異常無効",
        "description": "10ターンすべての状態異常を防ぐ。"
      },
      "enemyNullify": {
        "name": "特殊効果封印",
        "description": "10ターン特殊な敵の追加効果を無効化する。"
      },
      "sureHit": {
        "name": "必中攻撃",
        "description": "10ターン通常攻撃が必中になる。（Lv差8以上の敵には無効）"
      },
      "stairWarp": {
        "name": "階段前ワープ",
        "description": "階段の隣へワープする。"
      },
      "strongStrike": {
        "name": "強攻撃",
        "description": "目前の敵へ必中で威力3倍の攻撃。"
      },
      "areaAttack": {
        "name": "範囲攻撃",
        "description": "周囲の敵へ通常の範囲攻撃。"
      },
      "surehitArea": {
        "name": "必中範囲攻撃",
        "description": "周囲の敵へ必中の範囲攻撃。"
      },
      "strongArea": {
        "name": "強範囲攻撃",
        "description": "周囲の敵へ威力3倍の範囲攻撃。"
      },
      "surehitStrongArea": {
        "name": "必中強範囲攻撃",
        "description": "周囲の敵へ必中で威力3倍の範囲攻撃。"
      },
      "surehitFloor": {
        "name": "必中全体攻撃",
        "description": "フロア全体の敵へ必中の攻撃。"
      },
      "ruinAnnihilation": {
        "name": "破滅全体攻撃",
        "description": "全ての敵へ必中で威力3倍の攻撃＆壁やギミックを消し宝箱を獲得。（高Lv敵には無効）"
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
      "dungeons": {
        "tooltip": "推奨Lv: {level}"
      },
      "playerStatus": {
        "title": "プレイヤーステータス",
        "toggle": {
          "expand": "展開",
          "collapse": "折りたたみ"
        },
        "labels": {
          "level": "レベル",
          "hp": "HP",
          "satiety": "満腹度",
          "exp": "経験値",
          "sp": "SP",
          "attack": "攻撃力",
          "defense": "防御力"
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
          "damageMultiplier": "与: {deal}x / 被: {take}x",
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
          "title": "Gate履歴",
          "empty": "まだ履歴はありません。",
          "entryLabel": "NESTED {nested}｜{dimension}｜{block1}・{block2}・{block3}",
          "entryTooltip": "Lv{level} / {type} / 深さ{depth} / seed {seed}",
          "confirmClear": "Gate履歴をすべて削除しますか？",
          "delete": "削除"
        },
        "bookmarks": {
          "title": "ブロックブックマーク",
          "empty": "ブックマークはまだありません。",
          "entryTooltip": "Lv{level} / {type} / 深さ{depth} / seed {seed}",
          "delete": "削除"
        },
        "test": {
          "title": "ダンジョンテスト",
          "description": "ランダムなシードで全ての登録ダンジョンタイプを生成し、安全にブロック次元を遊べるか検証します。エラーが発生してもログに記録され、無限ループが起きた場合は完了しません。",
          "run": "🧪 ダンジョンテスト",
          "idle": "待機中",
          "status": {
            "initializing": "初期化中…",
            "noTargets": "対象なし",
            "running": "実行中 ({current}/{total})",
            "completedWithFailures": "完了（失敗 {count} 件）",
            "completedSuccess": "完了（全て成功）",
            "error": "エラーが発生しました"
          },
          "log": {
            "addonLoadError": "アドオン読込エラー: {error}",
            "noTargets": "テスト対象のダンジョンタイプが見つかりません。",
            "targetCount": "テスト対象: {count} タイプ",
            "start": "▶ {name} ({id}) の生成テストを開始",
            "success": "✅ 成功: {name} ({id}) seed={seed} サイズ={width}×{height} 床数={floors} 実タイプ={actual}",
            "failure": "❌ 失敗: {name} ({id}) seed={seed}",
            "summary": "完了: 成功 {success} 件 / 失敗 {failure} 件 / 所要時間 {duration}ms",
            "fatal": "重大なエラー: {error}"
          }
        },
        "hud": {
          "summary": "図形 {bodyCount} / エミッタ {emitterCount} / 布 {clothCount} / 粒子 {particleCount}",
          "powerGravityExp": "通電 {poweredCount} / 重力 {gravity} / EXP {exp}",
          "solver": "ソルバ {iterations}回 × サブステップ {substeps}",
          "temperature": "平均温度 {average}°C / 周囲 {ambient}°C / 最高 {max}°C",
          "phases": "状態 固体{solid} / 液体{liquid} / 気体{gas}",
          "wind": "風ガスト {gusts} / 風エミッタ {emitters}"
        },
        "inspector": {
          "title": "設定",
          "world": {
            "gravityY": "重力Y ({value})",
            "airDrag": "空気抵抗 ({value})",
            "iterations": "反復回数 ({value})",
            "substeps": "サブステップ ({value})",
            "ambientTemperature": "周囲温度 ({value}°C)",
            "boundary": {
              "label": "外周モード",
              "options": {
                "wall": "壁 (外周で反射)",
                "void": "奈落 (外に落下)"
              },
              "voidHint": "奈落: 図形が外に出ると一定距離で消滅します。"
            }
          },
          "noSelection": "上部ツールから図形を追加して選択すると詳細設定が表示されます。",
          "savedLayouts": {
            "title": "保存データ",
            "load": "読み込み",
            "delete": "削除"
          },
          "common": {
            "unknown": "不明"
          },
          "body": {
            "title": "図形プロパティ",
            "state": "状態: {state}",
            "damage": "損耗度: {percent}%",
            "integrity": "健全度: {percent}%",
            "stress": "応力指標: {value} kPa相当",
            "strain": "ひずみ: {percent}%",
            "heatFlux": "熱流指標: {value}",
            "fracture": "破断閾値: {threshold} / 破片生成 {fragments}回",
            "reactionCooldown": "化学反応クールダウン: {seconds}s",
            "materialPreset": "素材プリセット",
            "mass": "質量 (推定 {value})",
            "angleInfo": "角度 {angle}° / 角速度 {angular}rad/s",
            "static": "固定する",
            "restitution": "反発 ({value})",
            "friction": "摩擦 ({value})",
            "wallNote": "絶対壁は素材と物性が固定されています。サイズと位置のみ変更できます。",
            "radius": "半径 ({value})",
            "width": "幅 ({value})",
            "height": "高さ ({value})",
            "color": "色",
            "chemical": {
              "formula": "化学式: {formula}",
              "components": "構成元素: {list}",
              "molarMass": "モル質量: {mass} g/mol",
              "hazards": "性質: {list}"
            },
            "phase": {
              "solid": "固体",
              "liquid": "液体",
              "gas": "気体"
            }
          },
          "customMaterial": {
            "alertAddElement": "元素を1種類以上追加してください。",
            "title": "化学式カスタマイザ",
            "components": "構成: {list}",
            "componentsEmpty": "構成: 追加された元素はありません",
            "formulaPreview": "化学式プレビュー: {formula}",
            "molarMass": "推定モル質量: {mass} g/mol",
            "suggestedDensity": "元素平均密度: {average} (現在 {current})",
            "removeComponent": "削除",
            "addElement": "元素追加",
            "nameLabel": "素材名",
            "namePlaceholder": "カスタム素材名",
            "density": "密度 ({value})",
            "baseTemperature": "基準温度 ({value}°C)",
            "meltingPoint": "融点 ({value}°C)",
            "boilingPoint": "沸点 ({value}°C)",
            "ignitionPoint": "発火点 ({value}°C)",
            "hazardTitle": "性質タグ",
            "appliedHazards": "適用タグ: {list}",
            "apply": "カスタム素材を適用",
            "reset": "構成クリア",
            "hazards": {
              "flammable": "可燃性",
              "conductive": "導電性",
              "elastic": "弾性体",
              "insulator": "絶縁体",
              "aqueous": "水溶性",
              "superheated": "超高温",
              "ionized": "電離",
              "alkali-metal": "アルカリ金属",
              "water-reactive": "水と激しく反応",
              "acidic": "酸性",
              "corrosive": "腐食性",
              "toxic": "有毒",
              "inert": "不活性",
              "oxidizer": "助燃性",
              "explosive": "爆発性",
              "cryogenic": "超低温",
              "refractory": "耐火性",
              "catalytic": "触媒性"
            }
          },
          "emitter": {
            "title": "エミッタ設定",
            "type": "タイプ: {kind}",
            "rate": "レート ({value}/s)",
            "power": "強さ ({value})",
            "direction": "向き ({value}°)",
            "circuit": {
              "alwaysOn": "常時通電させる",
              "connections": "接続ノード",
              "disconnect": "切断",
              "cancel": "接続キャンセル",
              "connect": "接続モード"
            }
          },
          "cloth": {
            "title": "布プロパティ",
            "integrity": "健全度 {percent}%",
            "links": "節点 {cols}×{rows} / 結合 {intact}/{total}",
            "strain": "平均伸長 {average}% / 最大 {max}%",
            "fatigue": "疲労蓄積 {value}",
            "structural": "張力 ({value})",
            "shear": "せん断 ({value})",
            "bend": "しなり ({value})",
            "damping": "減衰 ({value})",
            "tearFactor": "破断倍率 ({value})",
            "windInfluence": "風反応 ({value})",
            "color": "色",
            "pinTop": "上辺を固定",
            "unpinAll": "固定解除"
          }
        }
      },
      "miniexp": {
        "categories": "カテゴリ一覧",
        "displayModes": "表示形式",
        "displayMode": {
          "tile": "タイル",
          "list": "リスト",
          "wrap": "羅列",
          "detail": "詳細"
        },
        "actions": {
          "select": "選択",
          "selected": "選択中"
        },
        "list": {
          "label": "ミニゲーム一覧",
          "empty": "該当カテゴリのミニゲームが見つかりません。games/ にミニゲームを追加してください。"
        },
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
            "description": "駒の組み合わせで王を詰ませる本格チェス。駒取りとチェックでEXPを獲得",
            "title": "チェス",
            "difficultyTag": "難易度: {value}",
            "difficultyValue": {
              "easy": "EASY",
              "normal": "NORMAL",
              "hard": "HARD"
            },
            "status": {
              "stopped": "停止中",
              "turnLabel": "手番:",
              "yourTurn": "あなたの番です",
              "aiThinking": "AIの思考中…",
              "scoreLabel": "スコア:"
            },
            "messages": {
              "checkmateWin": "チェックメイト！勝利しました。",
              "checkmateLoss": "チェックメイトを受けました…",
              "stalemate": "ステイルメイト。引き分けです。",
              "draw": "引き分け扱いになりました。",
              "playerCheck": "チェック！",
              "playerInCheck": "チェックされています！",
              "selectMove": "移動するマスを選択してください"
            },
            "prompts": {
              "promotion": "昇格する駒を選んでください (Q/R/B/N)"
            },
            "controls": {
              "restart": "リスタート"
            }
          },
          "xiangqi": {
            "name": "シャンチー",
            "description": "中国の将棋・象棋。駒取り・王手・詰みでEXPを稼ごう",
            "header": {
              "title": "シャンチー",
              "subtitle": "{color}が先手"
            },
            "controls": {
              "reset": "初期配置に戻す"
            },
            "board": {
              "riverLabel": "楚河　漢界"
            },
            "color": {
              "red": "赤",
              "black": "黒",
              "redPlayer": "赤（下）",
              "blackPlayer": "黒（上）"
            },
            "pieces": {
              "general": "将",
              "advisor": "士",
              "elephant": "象",
              "horse": "馬",
              "chariot": "車",
              "cannon": "砲",
              "soldier": "卒"
            },
            "expLabel": "EXP",
            "piece": {
              "description": "{color}の{piece}"
            },
            "status": {
              "turnLine": "手番: {turn}",
              "turn": {
                "red": "{color}の番です",
                "black": "{color}の番です"
              },
              "scoreLine": "合計スコア: {score}",
              "capture": "{actor}が{target}を取りました (+{exp}{expLabel})",
              "move": "{piece}が移動しました",
              "win": "{loser}が詰みました。{winner}の勝利！",
              "stalemate": "持将軍（合法手がありません）",
              "check": "{defender}が王手を受けています (+{exp}{expLabel})"
            }
          },
          "shogi": {
            "name": "将棋",
            "description": "持ち駒と成りを駆使する本格将棋。指し手/捕獲/王手でEXP",
            "ui": {
              "title": "将棋",
              "subtitle": "MiniExp版",
              "legend": "指し手:+{moveExpFormatted}EXP / 持ち駒投入:+{dropExpFormatted}EXP / 捕獲でボーナス / 成り:+{promoteExpFormatted}EXP / 王手:+{checkExpFormatted}EXP / 勝利ボーナスあり",
              "hands": {
                "aiLabel": "先手 (CPU)",
                "playerLabel": "後手 (あなた)",
                "empty": "なし",
                "chip": "{piece}×{countFormatted}",
                "total": "{countFormatted}枚",
                "totalNone": "なし"
              },
              "actions": {
                "restart": "リスタート"
              },
              "confirm": {
                "promote": "成りますか？"
              }
            },
            "status": {
              "playerTurn": "あなたの番です。駒または持ち駒を選んでください。",
              "aiThinking": "CPUが指し手を検討中…",
              "playerInCheck": "王手を受けています！対応してください。",
              "aiInCheck": "王手！決め手を狙いましょう。"
            },
            "result": {
              "playerWin": "詰み！あなたの勝利",
              "playerLose": "詰まされました…敗北",
              "draw": "持将棋 / 千日手で引き分け"
            },
            "pieces": {
              "glyph": {
                "pawn": "歩",
                "lance": "香",
                "knight": "桂",
                "silver": "銀",
                "gold": "金",
                "bishop": "角",
                "rook": "飛",
                "king": "玉",
                "promotedPawn": "と",
                "promotedLance": "成香",
                "promotedKnight": "成桂",
                "promotedSilver": "成銀",
                "promotedBishop": "馬",
                "promotedRook": "龍"
              },
              "label": {
                "pawn": "歩",
                "lance": "香",
                "knight": "桂",
                "silver": "銀",
                "gold": "金",
                "bishop": "角",
                "rook": "飛",
                "king": "玉"
              }
            }
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
            "description": "配置+1/捕獲ボーナス/勝利EXP",
            "info": {
              "intro": "囲碁 9×9 — あなたが先手 (黒)"
            },
            "hud": {
              "turn": {
                "player": "あなたの番 (黒)",
                "ai": "AIの番 (白)"
              },
              "status": "{turn} ｜ 黒 捕獲:{blackCaptures} ｜ 白 捕獲:{whiteCaptures} (コミ+{komi})",
              "passNotice": "{actor}がパスしました (連続{count})",
              "aiThinking": "AIが思考中…"
            },
            "buttons": {
              "pass": "パス",
              "resign": "投了"
            },
            "messages": {
              "koViolation": "その手はコウで禁じられています"
            },
            "actors": {
              "player": "あなた",
              "ai": "AI"
            },
            "result": {
              "win": "あなたの勝ち！",
              "loss": "AIの勝ち…",
              "draw": "持碁 (引き分け)",
              "summary": "{result} ｜ 黒 {blackScore} - 白 {whiteScore}"
            }
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
            "description": "3:+1 / 4:+3 / 5:+10、連鎖×1.5",
            "hud": {
              "title": "マッチ3",
              "cleared": "消去数",
              "status": "{title} | {difficulty} | {clearedLabel}: {tiles}"
            },
            "difficulty": {
              "easy": "かんたん",
              "normal": "ふつう",
              "hard": "むずかしい"
            },
            "popup": {
              "chain": "{chain}連鎖！"
            }
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
            "description": "合成log2 / 2048で+777",
            "setup": {
              "sizeLabel": "盤面サイズ: ",
              "startButton": "開始",
              "boardSizeOption": "{size}×{size}"
            }
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
          "wording": {
            "name": "Wording",
            "description": "編集+1 / 書式+2 / 保存+6 EXP のワープロ"
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
            "description": "高度な関数・単位変換・グラフ・テトレーション対応の数学ワークステーション",
            "keypad": {
              "groups": {
                "standard": "標準関数",
                "trigonometry": "三角・双曲線",
                "complex": "複素数・行列",
                "analysis": "解析・特殊関数",
                "statistics": "確率・統計",
                "numerical": "数値解法",
                "programmer": "プログラマー・情報",
                "constants": "定数・単位"
              }
            },
            "units": {
              "templates": {
                "length": "長さ: 5 cm → inch",
                "mass": "重さ: 70 kg → lb",
                "energy": "エネルギー: 1 kWh → J",
                "temperature": "温度: 25 degC → degF",
                "speed": "速度: 100 km/h → m/s"
              }
            },
            "ui": {
              "unitTemplates": {
                "title": "ユニット変換テンプレ",
                "insert": "挿入"
              },
              "worksheet": { "title": "ワークシート" },
              "inputMode": {
                "classic": "関数表記",
                "pretty": "数学記号"
              },
              "preview": { "title": "数式プレビュー" },
              "actions": {
                "evaluate": "計算 (Shift+Enter)",
                "clear": "リセット",
                "copyResult": "結果をコピー"
              },
              "history": {
                "title": "計算履歴",
                "empty": "ここに計算履歴が表示されます。"
              },
              "variables": {
                "title": "スコープ変数",
                "reset": "変数をクリア",
                "empty": "（変数は未定義）"
              },
              "angle": {
                "radians": "ラジアン",
                "degrees": "度"
              }
            },
            "placeholders": {
              "worksheet": {
                "classic": "式やコマンドを入力 (例: integrate(sin(x), x), solveEq(sin(x)=0.5, x, 1), solveSystem([\"x+y=3\",\"x-y=1\"],[\"x\",\"y\"]))",
                "pretty": "例: √(2) + 1/3, 2π, (x+1)/(x−1) など数学記号で入力"
              },
              "preview": {
                "expression": "（入力中の式がここに可視化されます）"
              },
              "graph": {
                "expression": "f(x) を入力 (例: sin(x) / x)"
              }
            },
            "status": {
              "initializing": "準備中…",
              "loading": "数学エンジンを読み込んでいます…",
              "copySuccess": "結果をクリップボードにコピーしました。",
              "copyFailure": "コピーに失敗しました…",
              "scopeReset": "スコープを初期化しました。",
              "inputModeClassic": "入力モード: 関数表記",
              "inputModePretty": "入力モード: 数学記号",
              "resultModeSymbolic": "結果表示: 分数/記号モード",
              "resultModeNumeric": "結果表示: 小数モード",
              "angleRadians": "角度単位: ラジアン",
              "angleDegrees": "角度単位: 度",
              "worksheetCleared": "ワークシートをクリアしました。",
              "engineWaiting": "数学エンジンの初期化を待っています…",
              "enterExpression": "式を入力してください。",
              "calculationComplete": "計算が完了しました。",
              "error": "エラー: {message}",
              "enterGraphExpression": "グラフ式を入力してください。",
              "ready": "数学ラボの準備が整いました。",
              "engineInitialized": "数学エンジンを初期化しました。",
              "loadFailed": "数学エンジンの読み込みに失敗しました。インターネット接続を確認してください。"
            },
            "results": {
              "title": "結果",
              "symbolicToggle": "分数/記号",
              "numericToggle": "小数",
              "symbolicLabel": "厳密値 / 記号",
              "numericLabel": "近似値 (10進)",
              "moreDigits": "桁を増やす",
              "moreDigitsHint": "小数表示をさらに5桁延長",
              "errorLabel": "エラー"
            },
            "graph": {
              "title": "グラフ表示",
              "plot": "グラフ描画",
              "range": "範囲 (xmin, xmax)",
              "info": "x軸・y軸は自動スケール。単位付き値・ベクトル・複素数の虚部は除外されます。",
              "parseFailed": "式の解析に失敗しました: {message}",
              "invalidRange": "範囲は有限で xmin < xmax となるように設定してください。",
              "noPoints": "描画できる点がありません{detail}。",
              "noPointsDetail": " (除外: {reasons})",
              "summary": "描画ポイント: {count} / {total}",
              "summaryExtra": " / 除外 {items}",
              "reasons": {
                "units": "単位付き: {count}",
                "composite": "ベクトル/行列: {count}",
                "complex": "複素数: {count}"
              }
            },
            "errors": {
              "radixRange": "基数は 2 以上 30 以下の整数で指定してください。",
              "radixInvalidCharacter": "指定した基数に対応しない文字が含まれています。",
              "expressionParse": "式を解釈できませんでした。文字列または math.js のノードを渡してください。",
              "notFinite": "有限の数値ではありません。",
              "numberConversion": "数値へ変換できませんでした。",
              "positiveRealRequired": "正の実数を指定してください。",
              "complexRealOnly": "複素数は実数部のみを使用できません。",
              "matrixToScalar": "行列はスカラーに変換できません。",
              "arrayToScalar": "配列はスカラーに変換できません。",
              "graphUnitsUnsupported": "単位付きの値はグラフ化できません。",
              "tetraRealOnly": "tetra は実数引数にのみ対応します。",
              "slogPositiveBase": "slog は正の底と実数値に対応します。",
              "slogBaseSeparated": "slog の底は 1 から十分に離れた値を指定してください。",
              "divideByZero": "0 で割ることはできません。",
              "integralNotReady": "数学エンジンの初期化を待ってから積分を実行してください。",
              "integralSymbolicFailed": "指定した式の解析的積分を求められませんでした。numericIntegrate を利用してください。",
              "integralRange": "積分範囲は有限の実数で指定してください。",
              "integralBounds": "定積分を求める場合は下限と上限を両方指定してください。",
              "newtonInitialValue": "初期値には有限の数値を指定してください。",
              "newtonDerivativeZero": "導関数が 0 に近いためニュートン法が収束しません。",
              "iterationDiverged": "反復計算が発散しました。",
              "iterationNotConverged": "指定した反復回数内に収束しませんでした。",
              "linearSolverUnavailable": "線形方程式ソルバが利用できません。",
              "systemEquationsArray": "方程式の配列を渡してください。",
              "systemVariableCount": "変数リストは方程式の数と一致している必要があります。",
              "jacobianSolveFailed": "ヤコビ行列の解が取得できませんでした。",
              "maximizeFoundMinimum": "指定の初期値付近では最大値ではなく最小値が見つかりました。",
              "minimizeFoundMaximum": "指定の初期値付近では最小値ではなく最大値が見つかりました。",
              "digammaFinite": "digamma の引数は有限の実数で指定してください。",
              "digammaPositive": "digamma は正の実数引数にのみ対応します。",
              "polygammaOrder": "polygamma の階数は 0 以上の整数を指定してください。",
              "polygammaPositive": "polygamma は正の実数引数にのみ対応します。",
              "harmonicFirstArg": "harmonic の第1引数には 1 以上の整数を指定してください。",
              "harmonicSecondArg": "harmonic の第2引数には正の実数を指定してください。",
              "zetaFinite": "zeta の引数は有限の実数で指定してください。",
              "zetaOneDiverges": "zeta(1) は発散します。",
              "zetaPositiveRegion": "この簡易実装では実部が正の領域でのみ定義されています。",
              "logGammaFinite": "logGamma の引数は有限の実数で指定してください。",
              "logGammaPositive": "logGamma は正の実数引数にのみ対応します。",
              "gammaFinite": "gamma の引数は有限の実数で指定してください。",
              "gammaPositive": "gamma は正の実数引数にのみ対応します。",
              "betaFirstArg": "beta の第1引数には正の実数を指定してください。",
              "betaSecondArg": "beta の第2引数には正の実数を指定してください。",
              "lambertFinite": "lambertW の引数は有限の実数で指定してください。",
              "lambertBranchInteger": "lambertW のブランチは整数で指定してください。",
              "lambertBranchRange": "この実装では分枝 0 と -1 のみ対応しています。",
              "lambertPrincipalDomain": "lambertW の主枝は x ≥ -1/e の範囲でのみ定義されます。",
              "lambertNegativeDomain": "lambertW の分枝 -1 は -1/e ≤ x < 0 の範囲でのみ定義されます。",
              "lambertNotConverged": "lambertW の計算が収束しませんでした。",
              "normalPdfMean": "normalPdf の平均には有限の実数を指定してください。",
              "normalPdfSigma": "normalPdf の標準偏差は正の実数で指定してください。",
              "normalPdfInput": "normalPdf の第1引数は有限の実数で指定してください。",
              "normalCdfMean": "normalCdf の平均には有限の実数を指定してください。",
              "normalCdfSigma": "normalCdf の標準偏差は正の実数で指定してください。",
              "normalCdfInput": "normalCdf の第1引数は有限の実数で指定してください。",
              "normalInvProbability": "normalInv の確率は有限の実数で指定してください。",
              "normalInvProbabilityRange": "normalInv の確率は 0 < p < 1 の範囲で指定してください。",
              "normalInvSigma": "normalInv の標準偏差は正の実数で指定してください。",
              "poissonMean": "poissonPmf の平均には正の実数を指定してください。",
              "poissonCount": "poissonPmf の回数には 0 以上の整数を指定してください。",
              "poissonCdfMean": "poissonCdf の平均には正の実数を指定してください。",
              "poissonCdfCount": "poissonCdf の回数には 0 以上の整数を指定してください。",
              "binomialTrials": "binomialPmf の試行回数には 0 以上の整数を指定してください。",
              "binomialSuccesses": "binomialPmf の成功回数には 0 以上の整数を指定してください。",
              "binomialProbability": "binomialPmf の成功確率は 0〜1 の範囲で指定してください。",
              "binomialCdfTrials": "binomialCdf の試行回数には 0 以上の整数を指定してください。",
              "binomialCdfSuccesses": "binomialCdf の成功回数には 0 以上の整数を指定してください。",
              "binomialCdfProbability": "binomialCdf の成功確率は 0〜1 の範囲で指定してください。",
              "logitFinite": "logit の引数は有限の実数で指定してください。",
              "logitRange": "logit は 0 と 1 の間の値で指定してください。",
              "sigmoidFinite": "sigmoid の引数は有限の実数で指定してください。",
              "factorialNumeric": "factorial の引数には数値を指定してください。",
              "factorialFinite": "factorial の引数には有限の実数を指定してください。",
              "factorialReal": "factorial の引数には実数を指定してください。",
              "factorialGreaterThanMinusOne": "factorial の引数は -1 より大きい実数を指定してください。",
              "factorialNegativeInteger": "factorial は負の整数では定義されません。",
              "factorialNonNegativeInteger": "factorial の引数には 0 以上の整数を指定してください。",
              "permutationsRange": "permutations の第2引数は第1引数以下の整数で指定してください。",
              "permutationsInteger": "permutations の引数には 0 以上の整数を指定してください。",
              "combinationsRange": "combinations の第2引数は第1引数以下の整数で指定してください。",
              "combinationsSecondArg": "combinations の第2引数には 0 以上の整数を指定してください。",
              "combinationsInteger": "combinations の引数には 0 以上の整数を指定してください。",
              "lnUnavailable": "自然対数関数 ln が利用できません。",
              "erfcUnavailable": "erfc は現在利用できません。"
            }
          },
          "calc_combo": {
            "name": "計算コンボ",
            "description": "2桁までの四則演算をテンポ良く解いてコンボEXPを稼ぐ高速暗算ゲーム"
          },
          "blockcode": {
            "name": "ブロックコードラボ",
            "description": "Scratch風のブロックでミニゲームAPIを安全に試せるビジュアルプログラミング環境",
            "defaults": {
              "projectName": "新規プロジェクト"
            },
            "categories": {
              "events": "イベント",
              "actions": "アクション",
              "control": "制御",
              "variables": "変数",
              "utility": "ユーティリティ"
            },
            "ui": {
              "title": "ブロックコードラボ",
              "variableSelect": { "placeholder": "-- 変数 --" },
              "workspace": { "elseLabel": "そうでなければ" },
              "stage": { "placeholder": "ブロックを組み立てて実行ボタンを押してください。" },
              "status": { "running": "実行中", "stopped": "停止中" },
              "toolbar": {
                "snapOn": "スナップ: ON",
                "snapOff": "スナップ: OFF",
                "speedLabel": "速度 {value}x",
                "undo": "Undo",
                "redo": "Redo",
                "zoomReset": "ズームリセット",
                "gridToggle": "グリッド切替"
              },
              "summary": "{name} · ブロック {blocks} · 変数 {variables}",
              "projectStats": "ブロック {blocks} · 変数 {variables}",
              "tabs": { "logs": "ログ", "variables": "変数ウォッチ" },
              "buttons": {
                "new": "新規",
                "save": "保存",
                "load": "読み込み",
                "share": "共有コード",
                "run": "実行",
                "stop": "停止",
                "duplicate": "複製",
                "delete": "削除",
                "cancel": "キャンセル",
                "ok": "OK",
                "addVariable": "変数を追加"
              },
              "inputs": {
                "variableName": "変数名",
                "variableInitial": "初期値",
                "memo": "メモ (任意)"
              },
              "alerts": {
                "duplicateVariable": "同名の変数が既に存在します",
                "noSavedProjects": "保存済みのプロジェクトがありません。",
                "decodeFailed": "共有コードの解析に失敗しました。"
              },
              "prompts": {
                "confirmStopForNew": "実行中です。停止して新規プロジェクトを作成しますか？",
                "confirmDiscard": "現在のプロジェクトを破棄して新規作成しますか？"
              },
              "messages": {
                "projectCreated": "新しいプロジェクトを作成しました。",
                "projectSaved": "プロジェクト「{name}」を保存しました。",
                "projectLoaded": "プロジェクト「{name}」を読み込みました。",
                "shareImported": "共有コードから「{name}」を読み込みました。",
                "undoUnavailable": "Undo は未実装です。",
                "redoUnavailable": "Redo は未実装です。",
                "needHat": "開始イベントブロックが必要です。",
                "executionStopped": "実行を停止しました。",
                "runComplete": "実行が完了しました。",
                "genericError": "エラーが発生しました。"
              },
              "share": {
                "title": "共有コード",
                "importLabel": "共有コードを貼り付けて読み込み",
                "importPlaceholder": "共有コード",
                "importButton": "読み込む",
                "copyButton": "コードをコピー",
                "copied": "コピーしました!"
              },
              "variableList": {
                "initialValue": "初期値: {value}",
                "empty": "変数はありません。"
              },
              "variableTypes": {
                "number": "数値",
                "string": "文字列",
                "boolean": "真偽"
              }
            },
            "blocks": {
              "whenGameStarts": {
                "label": "ゲーム開始時",
                "description": "プロジェクト開始時に実行されるイベントハンドラー"
              },
              "whenKeyPressed": {
                "label": "キー {key} が押されたとき",
                "description": "指定キー押下時に呼び出されます",
                "inputs": {
                  "key": { "placeholder": "Key" }
                }
              },
              "movePlayer": {
                "label": "プレイヤーを {steps} マス移動",
                "description": "サンドボックスプレイヤーを移動します"
              },
              "setTile": {
                "label": "タイル ({x}, {y}) を {color} にする",
                "description": "ステージタイルの色を変更",
                "inputs": {
                  "color": { "placeholder": "#RRGGBB" }
                }
              },
              "waitSeconds": {
                "label": "{seconds} 秒待つ",
                "description": "指定秒数待機"
              },
              "repeatTimes": {
                "label": "{count} 回繰り返す",
                "description": "指定回数繰り返します"
              },
              "foreverLoop": {
                "label": "ずっと繰り返す",
                "description": "一定回数制限付きで繰り返します"
              },
              "ifCondition": {
                "label": "もし {condition} なら",
                "description": "条件成立時に実行します",
                "inputs": {
                  "condition": { "placeholder": "条件式 (例: score > 5)" }
                }
              },
              "logMessage": {
                "label": "ログ: {message}",
                "description": "ログタブにメッセージを出力",
                "inputs": {
                  "message": { "default": "Hello MiniExp!" }
                }
              },
              "awardXp": {
                "label": "XP {amount} を獲得",
                "description": "XPを獲得します"
              },
              "setVariable": {
                "label": "変数 {variable} を {value} にする",
                "description": "変数へ値を代入",
                "inputs": {
                  "value": { "placeholder": "値または式" }
                }
              },
              "changeVariable": {
                "label": "変数 {variable} を {delta} ずつ変える",
                "description": "変数を増減"
              },
              "broadcast": {
                "label": "ブロードキャスト {channel}",
                "description": "仮想イベントを発火します"
              },
              "stopAll": {
                "label": "すべて停止する",
                "description": "実行を停止します"
              }
            },
            "worker": {
              "foreverLimit": "foreverループが{limit}回で停止しました。",
              "broadcast": "ブロードキャスト: {channel}",
              "noStart": "開始イベントが見つかりません。",
              "stopped": "停止されました。"
            }
          },
          "video_player": {
            "name": "動画プレイヤー",
            "description": "ローカル動画とYouTubeの視聴でEXPを獲得できるユーティリティ",
            "title": "動画プレイヤー",
            "sessionXp": "セッションEXP: {exp}",
            "info": {
              "source": "ソース",
              "title": "タイトル",
              "duration": "長さ",
              "status": "ステータス",
              "sourceLocal": "ローカル",
              "sourceYoutube": "YouTube",
              "untitled": "未タイトル"
            },
            "tabs": {
              "local": "ローカルファイル",
              "youtube": "YouTube URL"
            },
            "local": {
              "hint": "MP4 / WebM / Ogg など、ブラウザで再生できる動画を選択してください。",
              "noFile": "ファイル未選択",
              "loading": "ローカル動画を読み込み中…"
            },
            "youtube": {
              "placeholder": "https://www.youtube.com/watch?v=...",
              "loadButton": "読み込み",
              "hint": "YouTube の URL または動画IDを入力してください。IFrame API が利用できない環境では簡易モードで再生します。",
              "loading": "YouTube 動画を読み込み中…",
              "ready": "YouTube 動画を読み込みました。再生を開始してください。",
              "prepared": "YouTube 動画準備完了。",
              "simple": "YouTube (簡易モード) を読み込みました。",
              "fallbackTitle": "YouTube動画 ({id})"
            },
            "placeholder": "再生する動画を選択してください。",
            "status": {
              "noSource": "ソース未選択。",
              "loadingLocal": "ローカル動画を読み込み中…",
              "loadingYoutube": "YouTube 動画を読み込み中…",
              "localReady": "ローカル動画を読み込みました。再生を開始してください。",
              "youtubeReady": "YouTube 動画を読み込みました。再生を開始してください。",
              "youtubePrepared": "YouTube 動画準備完了。",
              "youtubeSimple": "YouTube (簡易モード) を読み込みました。",
              "playing": "再生中",
              "paused": "一時停止",
              "ended": "再生完了",
              "error": "読み込みエラー",
              "youtubeError": "YouTube プレイヤーエラー",
              "buffering": "バッファリング中…"
            },
            "message": {
              "reselectLocal": "同じ動画ファイルを再選択してください。",
              "historyCleared": "履歴をクリアしました。",
              "localLoading": "ローカル動画を読み込み中…",
              "localLoaded": "ローカル動画を読み込みました。",
              "localError": "動画の読み込み中にエラーが発生しました。別のファイルを試してください。",
              "localSelectFile": "動画ファイルを選択してください。",
              "youtubeSimpleLoaded": "YouTube 動画を簡易モードで読み込みました。",
              "youtubeLoaded": "YouTube 動画を読み込みました。",
              "youtubeError": "YouTube 動画の読み込みに失敗しました。",
              "youtubeInvalid": "有効な YouTube URL または動画IDを入力してください。"
            },
            "history": {
              "title": "視聴履歴",
              "clear": "履歴をクリア",
              "empty": "視聴履歴はまだありません。",
              "typeLocal": "ローカル",
              "typeYoutube": "YouTube",
              "untitled": "未タイトル"
            },
            "shortcuts": {
              "title": "ショートカット / ヒント",
              "playPause": "Space: 再生/一時停止 (ローカル動画 / API 利用時の YouTube)",
              "seek": "← / →: -5 / +5 秒シーク (ローカル動画 / API 利用時の YouTube)",
              "history": "履歴のエントリをクリックして再度再生できます。ローカル動画は再選択ダイアログが開きます。",
              "simpleMode": "YouTube 簡易モードでは YouTube 側のショートカットをご利用ください。"
            }
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
            "description": "JS機能テストとCPUベンチマーク、ブロック式アドベンチャー作成ツール",
            "title": "JSテスター / MiniExp MOD",
            "subtitle": "JavaScript機能のセルフチェック、CPUベンチマーク、ブロック式アドベンチャーメーカーを収録。",
            "tabs": {
              "tests": "機能テスト",
              "benchmark": "CPUベンチマーク",
              "blocks": "ブロックアドベンチャー"
            },
            "tests": {
              "heading": "JavaScriptセルフチェックラボ",
              "description": "ブラウザが提供する代表的な機能をワンタップで検査できます。結果を共有すればデバッグにも役立ちます。",
              "runAll": "すべて実行",
              "runSingle": "テスト実行",
              "running": "実行中…",
              "defs": {
                "numbers": {
                  "name": "数値/BigInt",
                  "description": "浮動小数とBigIntの演算、Math拡張を試験します。",
                  "errors": {
                    "bigInt": "BigInt演算が期待どおりではありません",
                    "hypot": "Math.hypot結果に誤差が大きいです"
                  }
                },
                "json": {
                  "name": "JSON & structuredClone",
                  "description": "JSONシリアライズとstructuredCloneをチェックします。",
                  "errors": {
                    "restore": "JSON復元に失敗しました",
                    "clone": "structuredCloneがMapを保持できません"
                  }
                },
                "intl": {
                  "name": "Intlフォーマット",
                  "description": "Intl.DateTimeFormatとNumberFormatを検証します。",
                  "errors": {
                    "date": "日付フォーマットが想定外です",
                    "currency": "通貨フォーマットが想定外です"
                  }
                },
                "crypto": {
                  "name": "Crypto API",
                  "description": "暗号学的乱数と微小なハッシュ処理を行います。",
                  "errors": {
                    "random": "crypto.getRandomValuesが利用できません"
                  }
                },
                "storage": {
                  "name": "Storage API",
                  "description": "localStorage/sessionStorage の読み書きを確認します。",
                  "errors": {
                    "read": "Storage読み書き失敗",
                    "blocked": "Storage利用がブロックされています"
                  }
                },
                "canvas": {
                  "name": "Canvas & Offscreen",
                  "description": "Canvas描画とOffscreenCanvasの存在を検査します。",
                  "errors": {
                    "sample": "Canvasピクセル取得に失敗"
                  }
                }
              }
            },
            "benchmark": {
              "heading": "CPUベンチマーク - 1秒間のインクリメント回数",
              "description": "整数に1を加算し続け、1秒間で何回ループできるか計測します。ブラウザや端末の瞬間的な性能をチェックしましょう。",
              "labels": {
                "current": "最新結果 (回/秒)",
                "best": "自己ベスト (回/秒)",
                "runs": "累計実行回数"
              },
              "start": "計測スタート (1秒)",
              "notice": "計測中はUIが1秒間固まる場合があります。",
              "log": {
                "start": "計測を開始します…",
                "record": "新記録: {value} 回/秒",
                "result": "結果: {value} 回/秒"
              }
            },
            "blocks": {
              "controls": {
                "add": "ブロックを追加",
                "clear": "全削除"
              },
              "alert": {
                "title": "カスタムAlert関数",
                "description": "message, context を受け取る関数本体を記述します。context.flags や context.log を使って高度な演出が可能です。",
                "template": "// message: string\\n// context: { flags, log, awardXp }\\nconst box = document.createElement('div');\\nbox.textContent = message;\\nbox.style.padding = '16px';\\nbox.style.background = 'rgba(96,165,250,0.15)';\\nbox.style.border = '1px solid rgba(96,165,250,0.4)';\\nbox.style.borderRadius = '12px';\\nbox.style.margin = '6px 0';\\ncontext.log(box);\\n",
                "apply": "更新",
                "test": "テスト実行",
                "statusDefault": "既定: ログに表示します。alert() に変えることも可能です。",
                "statusApplied": "✅ カスタムalertを適用しました。",
                "statusError": "❌ エラー: {message}",
                "testMessage": "カスタムalertのテストです。",
                "statusTestSent": "✅ テストメッセージを送信しました。",
                "statusTestError": "❌ 実行エラー: {message}"
              },
              "story": {
                "title": "ブロックストーリーランナー",
                "play": "ストーリー再生",
                "stop": "停止",
                "logStart": "▶ ストーリー開始 ({count} ブロック)",
                "logAborted": "⚠ 実行中断: {message}",
                "logEnd": "■ ストーリー終了",
                "logUserStop": "■ ユーザーが停止しました",
                "logEmpty": "⚠ ブロックが1つもありません。"
              },
              "variables": {
                "title": "変数ビュー (flags)",
                "empty": "(空)"
              },
              "defaults": {
                "choiceQuestion": "どうする？",
                "choiceGo": "進む",
                "choiceStop": "やめる",
                "controlMessage": "進みますか？",
                "yes": "はい",
                "no": "いいえ",
                "message": "メッセージ",
                "prompt": "名前を入力してください"
              },
              "text": {
                "placeholder": "表示するメッセージ",
                "delivery": {
                  "log": "ログに出力",
                  "alert": "カスタムalert",
                  "both": "両方"
                },
                "nextLabel": "次に進むブロック (# または空)",
                "nextPlaceholder": "空なら自動で次"
              },
              "choice": {
                "questionPlaceholder": "選択肢の前に表示する文章",
                "storePlaceholder": "選択した値を保存する変数名 (例: choice)",
                "labelPlaceholder": "ボタン表示",
                "valuePlaceholder": "保存する値",
                "targetPlaceholder": "次の#",
                "addOption": "選択肢を追加",
                "newOption": "新しい選択肢",
                "logLabel": "選択",
                "buttonFallback": "選択",
                "logSelection": "▶ 選択: {value}",
                "noOptions": "※ 選択肢が設定されていません"
              },
              "set": {
                "namePlaceholder": "変数名",
                "valuePlaceholder": "値 (文字列)",
                "nextPlaceholder": "次のブロック (空=順番通り)"
              },
              "jump": {
                "namePlaceholder": "判定する変数名",
                "equalsPlaceholder": "比較値 (文字列)",
                "targetPlaceholder": "一致した時のブロック#",
                "elsePlaceholder": "不一致の時のブロック# (空=次)"
              },
              "award": {
                "amountPlaceholder": "付与するEXP (負数も可)",
                "nextPlaceholder": "次のブロック (空=順番通り)"
              },
              "types": {
                "text": "text",
                "choice": "choice",
                "set": "set",
                "jump": "jump",
                "award": "award",
                "control": "control"
              },
              "control": {
                "modeLabel": "種類",
                "modeConfirm": "確認 (はい/いいえ)",
                "modePrompt": "入力ボックス",
                "messagePlaceholder": "表示するメッセージ",
                "storePlaceholder": "結果を保存する変数名 (空=保存しない)",
                "yesLabel": "はいボタンの表示",
                "yesValue": "はいを押した時に保存する値",
                "yesTarget": "はいの次ブロック# (空=次)",
                "noLabel": "いいえボタンの表示",
                "noValue": "いいえを押した時に保存する値",
                "noTarget": "いいえの次ブロック# (空=次)",
                "labelPrompt": "入力",
                "labelConfirm": "確認",
                "okLabel": "決定",
                "cancelLabel": "キャンセル",
                "errorRequired": "値を入力してください。",
                "errorNumber": "数値を入力してください。",
                "summaryStored": "▶ {variable} = {value}",
                "summaryValueOnly": "▶ 値 = {value}",
                "summaryCancelStored": "▶ キャンセル ({variable} = {value})",
                "summaryCancel": "▶ 入力をキャンセル",
                "summaryChoiceStored": "▶ {label} を選択 → {variable} = {value}",
                "summaryChoice": "▶ {label} を選択"
              },
              "prompt": {
                "messagePlaceholder": "入力ボックスの前に表示する文章",
                "storePlaceholder": "入力値を保存する変数名",
                "inputTypeText": "テキスト",
                "inputTypeNumber": "数値",
                "defaultValue": "既定値 (固定文字列)",
                "defaultFrom": "既定値を読み込む変数名 (空=固定)",
                "allowEmpty": "空入力を許可",
                "okLabel": "決定ボタンの表示",
                "okTarget": "決定後のブロック# (空=次)",
                "cancelLabel": "キャンセルボタンの表示",
                "cancelValue": "キャンセル時に保存する値",
                "cancelTarget": "キャンセル後のブロック# (空=次)"
              },
              "logs": {
                "jumpMatch": "一致",
                "jumpMismatch": "不一致",
                "jump": "[JUMP] {name}={value} => {status}",
                "alertError": "❌ alert実行エラー: {message}"
              },
              "errors": {
                "tooManySteps": "ステップ回数が多すぎます。ループしていませんか？"
              }
            }
          },
          "system": {
            "name": "システム",
            "description": "PC/OS/ブラウザ/IPを横断的に確認できるシステム情報ユーティリティ"
          },
          "aim": {
            "name": "的あて（エイム）",
            "description": "命中で1〜3EXP／連続命中ボーナス",
            "hud": {
              "time": "残り時間: {time}",
              "hitsAccuracy": "命中: {hits}  精度: {accuracy}%",
              "combo": "コンボ x{combo}"
            },
            "overlay": {
              "timeUp": "タイムアップ",
              "restartHint": "Rで再開/再起動"
            }
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
            "description": "見下ろし型周回レース。ラップと順位でEXP獲得",
            "difficulty": {
              "EASY": "EASY",
              "NORMAL": "NORMAL",
              "HARD": "HARD"
            },
            "hud": {
              "title": "Aurora Circuit ({difficulty})",
              "lap": "ラップ: <strong>{current}/{total}</strong> (次 {next})",
              "lapTime": "ラップタイム: {time}",
              "bestLap": "ベストラップ: {time}",
              "turbo": "ターボ: {percent}%{active}",
              "turboActive": " (発動中)",
              "position": "順位: <strong>{position}/{total}</strong>",
              "rivals": "ライバル",
              "rivalLapSuffix": " · ラップ {current}/{total}",
              "secondsSuffix": "秒"
            },
            "overlay": {
              "idlePrompt": "STARTで開始",
              "go": "GO!"
            },
            "results": {
              "title": "レース結果",
              "totalTime": "総タイム {time}",
              "headers": {
                "position": "順位",
                "driver": "ドライバー",
                "finish": "フィニッシュ"
              },
              "expSummary": "獲得EXP: ラップ{lap} / ベスト{best} / ブースト{boost} / フィニッシュ{finish}",
              "restartHint": "Rキーで再スタート"
            },
            "instructions": {
              "controls": "↑/W:アクセル　↓/S:ブレーキ　←→/A・D:ステア<br>Space:ターボ　R:リスタート"
            },
            "status": {
              "you": "自分",
              "dnf": "DNF",
              "fin": "FIN"
            }
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
            "description": "カプセルで4つ揃え！ウイルス退治でEXP獲得",
            "title": "ドクターマリオ風",
            "hud": {
              "level": "レベル {level}",
              "viruses": "ウイルス {count}",
              "cleared": "除去数 {count}",
              "chainLabel": "{chain}連鎖！",
              "chainNice": "ナイス！",
              "chainVirus": "ウイルス x{count}",
              "stageClear": "ステージクリア！",
              "controls": "操作: ←→移動 / ↓ソフトドロップ / ↑またはX回転 / Spaceハードドロップ / Rリセット"
            },
            "floating": {
              "drop": "ドロップ！",
              "virus": "ウイルス x{count}",
              "stageClear": "ステージクリア！"
            },
            "status": {
              "gameOver": "ゲームオーバー",
              "restartHint": "Rでリスタート"
            }
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
            "description": "毎回生成されるコースを外れず進むワイヤーループ。操作方法を選んで挑戦",
            "status": {
              "selectControl": "操作方法を選択してください",
              "hitObstacle": "ぶつかってしまった…",
              "clearedWithTime": "クリア！おめでとう ({time}s)",
              "cleared": "クリア！おめでとう！",
              "leftCourse": "コースから外れてしまった…",
              "pointerLeft": "コースから出てしまった…",
              "mouseInstructions": "マウスで操作: スタート円をクリックして進もう",
              "keyboardInstructions": "キーボードで操作: 矢印 / WASD で移動",
              "mouseDrag": "マウスで●をコースから外さないように進もう"
            },
            "overlay": {
              "modePrompt": "操作方法を選んでスタート！",
              "retryPrompt": "ぶつかってしまった！再挑戦しますか？",
              "clearedWithTime": "クリア！難易度 {difficulty} を {time} 秒で突破しました！",
              "cleared": "クリア！難易度 {difficulty} を突破しました！",
              "selectControlFirst": "まず操作方法を選んでください",
              "welcome": "イライラ棒ミニゲームへようこそ！\nマウスまたはキーボード操作を選んでください。\nコースから外れずに右端のゴールまで進みましょう。"
            },
            "buttons": {
              "startMouse": "マウスモードで開始",
              "startKeyboard": "キーボードモードで開始",
              "retrySameMode": "同じモードで再挑戦"
            },
            "difficulty": {
              "label": {
                "easy": "かんたん",
                "normal": "ふつう",
                "hard": "むずかしい"
              }
            },
            "canvas": {
              "startLabel": "スタート",
              "goalLabel": "ゴール"
            }
          },
          "flappy_bird": {
            "name": "フラッピーバード風",
            "description": "パイプ通過でEXP。連続成功でボーナス",
            "ui": {
              "combo": "コンボ {combo}",
              "start": "スペース / クリックで開始",
              "gameOver": "ゲームオーバー",
              "restart": "スペース / R でリスタート",
              "finalScore": "スコア {formattedScore}"
            }
          },
          "dino_runner": {
            "name": "ダイノランナー",
            "description": "恐竜で障害物ジャンプ／距離EXP"
          },
          "floor_descent": {
            "name": "フロア降りサバイバル",
            "description": "迫る針天井から逃げながら下へ進む縦スクロールアクション。足場ギミックで差をつけよう",
            "hud": {
              "life": "ライフ",
              "floor": "現在{floor}F",
              "best": "最高{floor}F",
              "gameOver": "ゲームオーバー",
              "reachedFloor": "{floor}Fまで到達",
              "retryHint": "スペースキーでリトライ"
            }
          },
          "treasure_hunt": {
            "name": "宝探しダンジョン",
            "description": "混合ダンジョンで宝を探し、距離とタイムで指数的にEXPボーナス"
          },
          "forced_scroll_jump": {
            "name": "強制スクロールジャンプ",
            "description": "強制横スクロールで穴や鉄球を避けつつCXマークを集めてランクを目指す"
          },
          "tosochu": {
            "name": "逃走中",
            "description": "逃走者 VS ハンターの番組風アクション。逃げ切れば+10000EXP、自首で蓄積EXP",
            "ui": {
              "timer": "残り {seconds}s",
              "exp": "蓄積EXP {exp}",
              "missionNotReady": "ミッション: まだ発動していません",
              "missionActive": "ミッション: {label}{optionalSuffix}：残り{seconds}s (地点: {coords})",
              "missionComplete": "ミッション完了：成功{success}/{total}",
              "missionSuccess": "{label}：成功！",
              "missionFailed": "{label}：失敗…",
              "surrender": "自首する",
              "surrenderCountdown": "自首中...{seconds}s"
            },
            "status": {
              "hunterAdded": "ハンターが追加投入された！",
              "hunterRetreat": "ミッション成功！ハンター1体が撤退",
              "missionActivated": "ミッション発動：{label}",
              "escapeSuccess": "逃走成功！+{total} EXP (内訳 {base}+{bonus})",
              "surrenderSuccess": "自首。蓄積{exp}EXPを獲得",
              "caught": "捕まってしまった…獲得EXPなし",
              "dungeonUnavailable": "ダンジョンAPI利用不可",
              "stageGenerationFailed": "ステージ生成に失敗しました",
              "runStart": "逃走開始！",
              "runPaused": "一時停止中",
              "standby": "逃走中スタンバイ",
              "surrenderZoneHint": "自首ゾーンに入ってからボタンを押してください",
              "surrenderAttempt": "自首を試みています…{duration}s耐え抜け！",
              "surrenderCancelled": "自首を中断しました",
              "beaconSuccess": "ビーコン成功！電波妨害を強化",
              "beaconFail": "ビーコン失敗…ハンターが警戒強化",
              "dataSuccess": "極秘情報を確保！報酬が増加",
              "dataFail": "警報が鳴った！高速ハンターが出現",
              "boxSuccess": "解除成功！ハンターボックスの発動が遅延",
              "boxFail": "解除失敗…ハンターが追加投入",
              "vaultSuccess": "大金獲得！しかし狙われやすくなった",
              "vaultFail": "金庫防衛が発動…ハンターが二体解放"
            },
            "missions": {
              "optionalSuffix": "（任意）",
              "beacon": { "label": "ビーコンに接触せよ" },
              "data": { "label": "情報端末をハック" },
              "box": { "label": "ハンターボックスを解除" },
              "vault": { "label": "ハイリスク金庫を解錠" }
            }
          },
          "ten_ten": {
            "name": "1010パズル",
            "description": "ラインでEXP／クロス消しは倍増",
            "hint": "ブロックをドラッグして盤面に配置 / Rでリスタート",
            "hud": {
              "lines": "ライン: {total} / 最大同時: {max}",
              "moves": "手番: {moves} / 残ブロック: {remaining}",
              "combo": {
                "base": "コンボ: {combo} (最大 {max}) / XP: {xp}",
                "detail": " / 最終:+{lastXp}XP({lines}ライン)"
              }
            },
            "end": {
              "title": "ゲームオーバー",
              "reasons": {
                "noSpace": "置ける場所がありません",
                "generationFailed": "置けるピースが生成できませんでした"
              },
              "retryHint": "Rで再開/再起動"
            },
            "shelf": {
              "refilling": "ピース補充中..."
            },
            "errors": {
              "cannotGenerate": "置けるピースが生成できませんでした"
            }
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
          "graphicsTester": {
            "title": "3Dグラフィックテスター",
            "badges": {
              "webgl2": "WebGL2",
              "rayMarching": "レイマーチング",
              "benchmark": "ベンチマーク"
            },
            "errors": {
              "webgl2Unavailable": "WebGL2 が利用できません",
              "webglInitFailed": "WebGL2 コンテキストの初期化に失敗しました。"
            },
            "gpuInfo": {
              "title": "GPU情報",
              "unsupported": {
                "message": "WebGL2非対応または無効化されています",
                "description": "このモジュールは WebGL2 対応デバイス／ブラウザが必要です。設定で WebGL2 を有効化するか、対応ブラウザで再度お試しください。"
              },
              "unknown": "不明",
              "antialias": {
                "enabled": "ON",
                "disabled": "OFF"
              },
              "entries": {
                "vendor": "ベンダー: {value}",
                "renderer": "レンダラー: {value}",
                "version": "WebGL: {value}",
                "shading": "GLSL: {value}",
                "maxTextureSize": "最大テクスチャサイズ: {value}",
                "maxCubeMap": "最大キューブマップ: {value}",
                "textureUnits": "テクスチャユニット: {value}",
                "antialias": "アンチエイリアス: {value}"
              }
            },
            "controls": {
              "demoSelect": {
                "label": "デモ選択",
                "options": {
                  "objectLab": "オブジェクトラボ (配置デモ)",
                  "ray": "レイトレーシング風デモ",
                  "gallery": "技術ギャラリー"
                },
                "note": "マウスドラッグで視点操作、ホイールでズーム。レイトレーシング風デモは GPU 負荷が高いためベンチマーク時は他タブを閉じてください。"
              },
              "objectLab": {
                "title": "オブジェクト配置",
                "actions": {
                  "addCube": "キューブ追加",
                  "addSphere": "スフィア追加",
                  "addCylinder": "シリンダー追加",
                  "clear": "全削除",
                  "autoRotate": "オート回転"
                },
                "autoRotateState": {
                  "on": "ON",
                  "off": "OFF"
                },
                "logs": {
                  "addCube": "キューブを追加しました",
                  "addSphere": "スフィアを追加しました",
                  "addCylinder": "シリンダーを追加しました",
                  "cleared": "配置をリセットしました",
                  "autoRotate": "オート回転: {state}"
                }
              },
              "ray": {
                "title": "レイトレーシング風設定",
                "bounces": "反射回数",
                "exposure": "露光"
              },
              "gallery": {
                "title": "技術ギャラリー操作",
                "description": "リング状インスタンシング・動的モーションブラー・マテリアル演出を観察できます。"
              },
              "benchmark": {
                "title": "ベンチマーク",
                "start": "6秒間ベンチマーク開始"
              }
            },
            "log": {
              "demoSwitch": "デモ切り替え: {label}",
              "benchmarkStart": "ベンチマークを開始します (高負荷)",
              "benchmarkResult": "平均FPS: {fps} / 描画オブジェクト: {count}"
            },
            "overlay": {
              "fps": "FPS: {value}",
              "objects": "オブジェクト: {count}",
              "bounces": "反射回数: {count}",
              "gallery": "ギャラリーデモ"
            }
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
            "description": "フラッシュカードを登録し間隔反復で学習する暗記アプリ",
            "title": "暗記スタジオ",
            "badge": "TOY MOD",
            "controls": {
              "addDeck": "＋ デッキ追加",
              "export": "エクスポート (JSON)",
              "import": "インポート (JSON)"
            },
            "filters": {
              "tag": {
                "label": "タグフィルター",
                "placeholder": "カンマ区切りで入力"
              }
            },
            "form": {
              "title": "カード登録",
              "fields": {
                "front": "表面 (タイトル)",
                "back": "裏面 (解答)",
                "hint": "ヒント / 説明 (任意)",
                "tags": "タグ (カンマ区切り)",
                "interval": "初期間隔（日）"
              },
              "preview": {
                "label": "裏面プレビュー",
                "empty": "入力するとプレビューが表示されます。"
              },
              "submit": "カードを追加",
              "validation": {
                "missingSides": "表面と裏面は必須です。"
              }
            },
            "review": {
              "controls": {
                "show": "表示",
                "good": "覚えた",
                "hard": "難しい",
                "again": "再学習",
                "note": "ノート"
              },
              "deckName": "{name} ({count}枚)",
              "noDeck": "デッキ未選択",
              "queueInfo": "残り {count} 枚",
              "empty": "レビュー対象のカードはありません。追加またはインポートしてください。",
              "hintPrefix": "ヒント: "
            },
            "dialogs": {
              "addDeck": {
                "prompt": "新しいデッキ名を入力してください",
                "defaultName": "新しいデッキ"
              }
            },
            "import": {
              "error": {
                "invalidJson": "JSON を読み取れませんでした。",
                "read": "ファイルの読み込みに失敗しました。"
              }
            },
            "sparkline": {
              "tooltip": "{date} / {reviewed}枚 / {accuracy}% / {xp}XP",
              "empty": "履歴なし"
            },
            "deck": {
              "empty": "デッキがありません。追加してください。",
              "defaultName": "新しいデッキ",
              "metrics": {
                "total": "{count}枚",
                "due": "期限 {count}枚",
                "accuracy": "達成率 {percent}%"
              }
            },
            "hud": {
              "reviewed": {
                "label": "レビュー済み",
                "value": "{count}枚"
              },
              "accuracy": {
                "label": "正答率",
                "value": "{percent}%"
              },
              "sessionXp": {
                "label": "セッションEXP",
                "value": "{xp}XP"
              },
              "elapsed": {
                "label": "経過時間",
                "value": "{minutes}分{secondsPadded}秒"
              }
            },
            "note": {
              "title": "{front} のノート",
              "actions": {
                "cancel": "閉じる",
                "save": "保存"
              }
            },
            "defaults": {
              "deckName": "スターターデッキ",
              "tags": {
                "web": "Web"
              },
              "cards": {
                "html": {
                  "front": "HTML",
                  "back": "HyperText Markup Language",
                  "hint": "Webページの骨組み"
                },
                "css": {
                  "front": "CSS",
                  "back": "Cascading Style Sheets",
                  "hint": "見た目を装飾"
                },
                "javascript": {
                  "front": "JavaScript",
                  "back": "ブラウザで動作するプログラミング言語",
                  "hint": "インタラクティブ"
                }
              }
            }
          },
          "onigokko": {
            "name": "鬼ごっこ",
            "description": "混合型ダンジョンを舞台に鬼から逃げるトイアクション",
            "timer": {
              "remaining": "残り {seconds}s"
            },
            "status": {
              "start": "鬼ごっこ開始！矢印キー/WASDで移動",
              "paused": "一時停止中",
              "loading": "ステージ読み込み中…",
              "ready": "準備完了！開始で鬼ごっこスタート",
              "stage_generation_failed": "ステージ生成に失敗しました",
              "api_unavailable": "ダンジョンAPIが利用できません",
              "caught": "捕まった！",
              "caught_no_reward": "捕まってしまった！獲得EXPなし",
              "escaped": "見事逃げ切った！",
              "escape_success": "逃げ切り成功！"
            }
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
            "description": "60秒タイプで正確さとスピードを競うタイピングチャレンジ",
            "controls": {
              "difficulty": "難易度",
              "target": "ターゲットWPM",
              "targetValue": "{targetWpm} WPM",
              "difficultyOptions": {
                "easy": "EASY",
                "normal": "NORMAL",
                "hard": "HARD"
              }
            },
            "words": {
              "nextEmpty": "次: -",
              "nextWithValue": "次: {word}"
            },
            "input": {
              "placeholder": "表示された単語をタイプ（Space/Enterで確定）"
            },
            "buttons": {
              "reset": "リセット",
              "retry": "もう一度挑戦"
            },
            "stats": {
              "labels": {
                "accuracy": "ACC",
                "wpm": "WPM",
                "combo": "COMBO",
                "sessionXp": "SESSION XP"
              },
              "targetInfo": {
                "pending": "ターゲット {targetWpm} WPM / 達成度 -",
                "active": "ターゲット {targetWpm} WPM / 達成度 {progress}%"
              }
            },
            "result": {
              "title": "RESULT",
              "labels": {
                "accuracy": "精度",
                "wpm": "平均WPM",
                "words": "正タイプ数",
                "combo": "最高コンボ"
              },
              "wordsValue": "{count} 文字"
            },
            "xp": {
              "title": "EXP 内訳",
              "none": "EXPは獲得できませんでした",
              "wordLabel": "単語 {index}",
              "word": "{label}: +{xp} EXP",
              "wordWithMilestones": "{label}: +{xp} EXP ({milestones})",
              "milestoneEntry": "x{combo}+{bonus}",
              "milestoneSeparator": "、",
              "accuracyLabel": "精度ボーナス ({accuracyPercent}%)",
              "accuracy": "{label}: +{xp} EXP",
              "generic": "+{xp} EXP"
            },
            "toasts": {
              "start": "60秒チャレンジ開始！がんばって！",
              "mistype": "ミスタイプ！",
              "completeBeforeConfirm": "全文字をタイプしてから確定！",
              "comboMilestone": "Combo x{combo}! +{bonus} EXP",
              "comboSeparator": " / "
            }
          },
          "imperial_realm": {
            "name": "インペリアル・レルム",
            "description": "村人と軍勢を指揮してウェーブ攻撃を凌ぎ敵本陣を撃破するAoE2風リアルタイムストラテジー"
          }
        },

        "logicCircuit": {
          "categories": {
            "input": "入力",
            "gate": "ゲート",
            "wiring": "配線",
            "composite": "複合",
            "sequential": "シーケンシャル",
            "measurement": "計測",
            "output": "出力",
            "other": "その他",
            "misc": "その他"
          },
          "common": {
            "high": "HIGH",
            "low": "LOW",
            "on": "ON",
            "off": "OFF",
            "set": "SET",
            "reset": "RESET",
            "neutral": "---",
            "metastable": "不定状態",
            "metastableIndicator": "S=R=1 (不定)",
            "metastableMessage": "SとRが同時に1です。安定しません。",
            "warning": "注意",
            "toggleState": "トグル状態",
            "previousClock": "前回クロック",
            "periodMs": "周期 (ms)",
            "outLabel": "OUT: {value}",
            "muxStatus": "OUT:{out} (SEL={sel})"
          },
          "chips": {
            "sessionXp": "セッションEXP: {value}",
            "elapsedTime": "経過時間: {value}ms"
          },
          "ui": {
            "title": "論理回路シミュレータ",
            "subtitle": "入力ノードとゲートを並べ、リアルタイム評価で組み合わせ論理を検証",
            "clearCanvas": "キャンバス初期化",
            "clearTool": "ツール解除 (Esc)",
            "step": "⏭ ステップ",
            "stepLabel": "ステップ(ms)",
            "pause": "⏸ 停止",
            "resume": "▶ 再開",
            "sessionXp": "セッションEXP: {value}",
            "elapsedTime": "経過時間: {value}ms"
          },
          "hints": {
            "board": "ツールを選択し、キャンバスの空いている場所をクリックして配置します。出力ポート→入力ポートの順でクリックすると配線できます。Deleteキーで選択中の部品を削除。",
            "wires": "配線はパスをクリックで削除。Alt+入力クリックでその入力への配線を解除。",
            "footer": "ヒント: 入力をトグルして即座に出力を確認。シミュレーション制御で一時停止やステップ実行を行いながらシーケンシャル動作を解析できます。"
          },
          "inspector": {
            "title": "部品インスペクタ",
            "empty": "部品を選択すると詳細と真理値表を表示します。最大入力3本のゲートで真理値表を自動生成します。",
            "truthTitle": "真理値表",
            "connectionCount": "{count} 本",
            "delayValue": "{value} ns",
            "clockPeriodValue": "{value} ms",
            "truthTable": {
              "input": "IN{index}"
            },
            "fields": {
              "id": "ID",
              "type": "タイプ",
              "inputs": "入力ポート",
              "outputs": "出力ポート",
              "lastInputs": "最新入力",
              "lastOutputs": "最新出力",
              "inputConnections": "入力接続",
              "outputConnections": "出力接続",
              "delay": "伝播遅延(目安)",
              "description": "説明"
            }
          },
          "truthTable": {
            "out": "OUT"
          },
          "ports": {
            "output": "出力 #{index}",
            "input": "入力 #{index}"
          },
          "components": {
            "toggle": {
              "label": "トグル入力",
              "description": "クリックでON/OFFを切り替える基本入力",
              "buttonOn": "ONにする",
              "buttonOff": "OFFにする"
            },
            "clock": {
              "label": "クロック",
              "description": "一定周期で振動するクロック入力"
            },
            "const_high": {
              "label": "定数1",
              "description": "常にHIGHを出力する定数ソース"
            },
            "constHigh": {
              "label": "定数1",
              "description": "常にHIGHを出力する定数ソース"
            },
            "const_low": {
              "label": "定数0",
              "description": "常にLOWを出力する定数ソース"
            },
            "constLow": {
              "label": "定数0",
              "description": "常にLOWを出力する定数ソース"
            },
            "buffer": {
              "label": "バッファ",
              "description": "入力をそのまま出力するバッファ"
            },
            "not": {
              "label": "NOT",
              "description": "入力を反転するNOTゲート"
            },
            "and": {
              "label": "AND",
              "description": "全ての入力がHIGHでHIGH"
            },
            "nand": {
              "label": "NAND",
              "description": "ANDの反転"
            },
            "or": {
              "label": "OR",
              "description": "いずれかの入力がHIGHでHIGH"
            },
            "nor": {
              "label": "NOR",
              "description": "ORの反転"
            },
            "xor": {
              "label": "XOR",
              "description": "入力のHIGH数が奇数でHIGH"
            },
            "xnor": {
              "label": "XNOR",
              "description": "XORの反転"
            },
            "splitter": {
              "label": "スプリッタ",
              "description": "1入力を複数の出力へ複製する"
            },
            "mux2": {
              "label": "2:1 MUX",
              "description": "選択信号で入力を切り替える2入力1出力の多重化器"
            },
            "decoder2": {
              "label": "2-4デコーダ",
              "description": "2ビット入力からワンホットの4出力を生成するデコーダ"
            },
            "d_ff": {
              "label": "Dフリップフロップ",
              "description": "立ち上がりクロックでD入力をラッチしQ/Q̅を出力する同期フリップフロップ (非同期リセット付)",
              "inspect": {
                "0": { "label": "ラッチ状態" },
                "1": { "label": "前回クロック" }
              }
            },
            "dff": {
              "label": "Dフリップフロップ",
              "description": "立ち上がりクロックでD入力をラッチしQ/Q̅を出力する同期フリップフロップ (非同期リセット付)",
              "indicator": "Q={q} / Q̅={qbar}",
              "status": "Q={value}",
              "inspectLatch": "ラッチ状態"
            },
            "sr_latch": {
              "label": "SRラッチ",
              "description": "NOR構成の基本SRラッチ。Sでセット、Rでリセット。",
              "inspect": {
                "0": { "label": "注意" }
              }
            },
            "srLatch": {
              "label": "SRラッチ",
              "description": "NOR構成の基本SRラッチ。Sでセット、Rでリセット。",
              "qStatus": "Q={value}"
            },
            "t_ff": {
              "label": "Tフリップフロップ",
              "description": "立ち上がりクロック毎にT入力がHIGHなら出力を反転。リセット入力付き。",
              "inspect": {
                "0": { "label": "トグル状態" },
                "1": { "label": "前回クロック" }
              }
            },
            "tff": {
              "label": "Tフリップフロップ",
              "description": "立ち上がりクロック毎にT入力がHIGHなら出力を反転。リセット入力付き。",
              "status": "Q={value}"
            },
            "probe": {
              "label": "プローブ",
              "description": "入力値を監視する計測ノード"
            },
            "led": {
              "label": "LED",
              "description": "入力がHIGHのとき点灯"
            }
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
        "resume": "再開",
        "restart": "再開/再起動",
        "quit": "終了",
        "hud": {
          "level": "Lv",
          "sp": "SP",
          "expLabel": "EXP "
        },
        "placeholder": {
          "default": "左の一覧からミニゲームを選択してください。",
          "loading": "読み込み中...",
          "loadFailed": "読み込みに失敗しました。",
          "chooseFromCategory": "カテゴリからゲームを選んでください。",
          "gameLoading": "ミニゲームを読み込んでいます…",
          "gameLoadFailed": "ミニゲームのロードに失敗しました。",
          "gameStartFailed": "ミニゲームの開始に失敗しました。",
          "selected": "{name} を選択しました。",
          "chooseSequence": "カテゴリ→ゲームの順に選んでください。"
        },
        "records": {
          "bestScore": "ベストスコア",
          "totalPlays": "通算プレイ",
          "totalExp": "通算獲得EXP",
          "totalExpValue": "{sign}{value}"
        }
      }
    },

    dungeon: {
      "packs": {
        "abyssal_whorl_pack": {
          "name": "Abyssal Whorl Pack"
        },
        "abstract_spectrum_pack": {
          "name": "抽象スペクトラム生成パック"
        },
        "amber_marsh_pack": {
          "name": "Amber Marsh Pack"
        },
        "ancient_enigma_pack": {
          "name": "Ancient Enigma Excavation Pack"
        },
        "arabian_legends_pack": {
          "name": "Arabian Legends Pack",
          "description": "砂海に眠る伝承と幻影をテーマに、オアシス、城砦、市場、宙庭、星図聖堂など16種類のダンジョン生成アルゴリズムと50種以上のアラビア語ブロックを鮮やかな色彩表現で追加する大型パック。"
        },
        "axis_gallery_pack": {
          "name": "Axis Gallery Pack"
        },
        "bamboo_hollows_pack": {
          "name": "Bamboo Hollows Pack"
        },
        "biome_convergence_megapack": {
          "name": "Biome Convergence Mega Pack"
        },
        "shore_pack": {
          "name": "Sunlit Shore Pack"
        },
        "bomb_pack": {
          "name": "Bomb Hazard Pack",
          "description": "爆弾ギミックに特化した生成タイプを追加するMOD。地雷原・兵舎・迷宮の3種類を収録。"
        },
        "celestial_dynasty_pack": {
          "name": "華夏王朝拡張パック",
          "blocks": {
            "huaxia": {
              "name": "華夏界域"
            },
            "jinluo": {
              "name": "金鑼交易圏"
            },
            "longmai": {
              "name": "龍脈天廊"
            },
            "xinglu": {
              "name": "星路天界"
            },
            "cuitian": {
              "name": "翠天雲境"
            }
          }
        },
        "churning_karst_pack": {
          "name": "Churning Karst Pack"
        },
        "classic_jrpg_legends_pack": {
          "name": "王道ファンタジーJRPGレジェンズパック"
        },
        "clockwork_pack": {
          "name": "Clockwork Labyrinth Pack"
        },
        "conveyor_foundry_pack": {
          "name": "Conveyor Foundry Pack"
        },
        "coral_garden_pack": {
          "name": "Coral Garden Pack"
        },
        "corridor_pack": {
          "name": "Corridor Patterns Pack"
        },
        "shadowed_caverns_pack": {
          "name": "Shadowed Caverns Pack"
        },
        "desert_pack": {
          "name": "Scorched Desert Pack"
        },
        "echo_vaults_pack": {
          "name": "Echo Vaults Pack"
        },
        "sun_kings_necropolis_pack": {
          "name": "Sun-Kings Necropolis Pack"
        },
        "emberglass_caverns_pack": {
          "name": "Emberglass Caverns Pack"
        },
        "fantasical_sci_fi_dream_pack": {
          "name": "ファンタジカルと近未来をテーマにした夢の世界パック",
          "blocks": {
            "prismaverse": {
              "name": "プリズマバース"
            },
            "holoorbit": {
              "name": "ホロオービット"
            },
            "chronostream": {
              "name": "クロノストリーム界"
            },
            "dreamwell": {
              "name": "ドリームウェル界層"
            },
            "stellarforge": {
              "name": "ステラフォージ界"
            },
            "nebular_link": {
              "name": "ネビュラリンク界"
            },
            "singularity_arboria": {
              "name": "シンギュラリティ樹冠界"
            },
            "pulse_transit_loop": {
              "name": "クロノパルス環界"
            },
            "aurora_fabricarium": {
              "name": "オーロラ製造界"
            },
            "dream_turbine_biosphere": {
              "name": "夢風タービン圏"
            },
            "astral_cantor_reach": {
              "name": "星界カントル界"
            },
            "voidglass_delta": {
              "name": "虚玻デルタ界"
            }
          }
        },
        "forest_pack": {
          "name": "Verdant Forest Pack"
        },
        "fungal_pack": {
          "name": "Fungal Bloom Pack"
        },
        "geometric_pack": {
          "name": "Geometric Structures Pack"
        },
        "grand_medieval_city_pack": {
          "name": "Grand Medieval City Pack"
        },
        "horror_expansion_pack": {
          "name": "Haunted Horror Expansion Pack"
        },
        "icy_caverns_pack": {
          "name": "Icy Caverns Pack"
        },
        "irradiated_plains_pack": {
          "name": "Irradiated Plains Pack"
        },
        "lava_pack": {
          "name": "Lava Pack"
        },
        "luminescent_glade_pack": {
          "name": "Luminescent Glade Pack"
        },
        "medieval_stronghold_pack": {
          "name": "Medieval Stronghold Pack"
        },
        "nature_expansion_pack": {
          "name": "Nature Biome Expansion Pack"
        },
        "natural_roadways_pack": {
          "name": "Natural Roadways Pack"
        },
        "neo_research_arcology_pack": {
          "name": "ネオ・リサーチアーコロジー拡張",
          "description": "未来研究都市アーコロジーを舞台に、多層リングや螺旋実験路、バイオドーム、冷却金庫、ホロシティなど7つの生成タイプと36ブロック、4次元帯を追加する大規模拡張。"
        },
        "noise_interference_pack": {
          "name": "Interference Noise Expansion Pack"
        },
        "oneway_labyrinth_pack": {
          "name": "One-Way Labyrinth Pack"
        },
        "ruins_pack": {
          "name": "Overgrown Ruins Pack"
        },
        "paddy_azemichi_pack": {
          "name": "Paddy Terrace Paths Pack"
        },
        "multicolor_plains_pack": {
          "name": "Multicolor Plains Pack"
        },
        "bog_pack": {
          "name": "Toxic Boglands Pack"
        },
        "prismatic_stalactites_pack": {
          "name": "Prismatic Stalactites Pack"
        },
        "retro_overworld_pack": {
          "name": "Retro Overworld Pack"
        },
        "ring_city_pack": {
          "name": "Ring City Pack"
        },
        "ruined_labyrinth_pack": {
          "name": "Ruined Labyrinth Pack"
        },
        "sandstorm_dunes_pack": {
          "name": "Sandstorm Dunes Pack"
        },
        "serpentine_pack": {
          "name": "Serpentine River Pack"
        },
        "sf_expansion_pack": {
          "name": "SF Expansion Pack",
          "description": "宇宙船・サイバー空間・未来都市・軌道施設・量子/時間研究・異星生態・メガコロニーを網羅し、50タイプと5次元拡張を収録した大規模SFダンジョン生成パック。"
        },
        "skyrim_nordic_legends_pack": {
          "name": "Skyrim Nordic Legends Pack"
        },
        "skyward_pack": {
          "name": "Skyward Bastions Pack"
        },
        "starlit_canopy_pack": {
          "name": "Starlit Canopy Pack"
        },
        "tidal_pack": {
          "name": "Tidal Catacombs Pack"
        },
        "traditional_japan_expansion_pack": {
          "name": "Traditional Japan Expansion Pack"
        },
        "visceral_crimescene_pack": {
          "name": "Visceral Crime Scene Pack",
          "blocks": {
            "hemorrhage-depths": {
              "name": "ヘモレージ血溜層"
            },
            "autopsy-catacombs": {
              "name": "検視地下霊廟"
            },
            "evidence-vitrines": {
              "name": "血染証拠標本界"
            }
          }
        },
        "western_frontier_pack": {
          "name": "Western Frontier Mega Pack"
        },
        "prison_pack": {
          "name": "Underground Prison Pack"
        }
      },
      "types": {
        "abyssal_whorl": {
          "name": "渦穿深淵洞",
          "description": "地下噴流が掘り抜いた渦巻状の深淵。螺旋の底で青白い光が揺れる。",
          "blocks": {
            "whorl_theme_01": {
              "name": "Abyssal Whorl I"
            },
            "whorl_theme_02": {
              "name": "Abyssal Whorl II"
            },
            "whorl_theme_03": {
              "name": "Abyssal Whorl III"
            },
            "whorl_core_01": {
              "name": "Whorl Core I"
            },
            "whorl_core_02": {
              "name": "Whorl Core II"
            },
            "whorl_core_03": {
              "name": "Whorl Core III"
            },
            "whorl_relic_01": {
              "name": "Whorl Relic I"
            },
            "whorl_relic_02": {
              "name": "Whorl Relic II"
            },
            "whorl_relic_03": {
              "name": "Whorl Relic III"
            }
          },
          "badges": [
            "cave",
            "abyss",
            "wind"
          ]
        },
        "amber_marsh": {
          "name": "琥珀湿地",
          "description": "秋色の湿原に漂う靄と泥の迷路",
          "blocks": {
            "amber_theme_01": {
              "name": "Marsh Theme I"
            },
            "amber_theme_02": {
              "name": "Marsh Theme II"
            },
            "amber_theme_03": {
              "name": "Marsh Theme III"
            },
            "amber_theme_04": {
              "name": "Marsh Theme IV"
            },
            "amber_theme_05": {
              "name": "Marsh Theme V"
            },
            "amber_theme_06": {
              "name": "Marsh Theme VI"
            },
            "amber_theme_07": {
              "name": "Marsh Theme VII"
            },
            "amber_core_01": {
              "name": "Marsh Core I"
            },
            "amber_core_02": {
              "name": "Marsh Core II"
            },
            "amber_core_03": {
              "name": "Marsh Core III"
            },
            "amber_core_04": {
              "name": "Marsh Core IV"
            },
            "amber_core_05": {
              "name": "Marsh Core V"
            },
            "amber_core_06": {
              "name": "Marsh Core VI"
            },
            "amber_core_07": {
              "name": "Marsh Core VII"
            },
            "amber_relic_01": {
              "name": "Marsh Relic I"
            },
            "amber_relic_02": {
              "name": "Marsh Relic II"
            },
            "amber_relic_03": {
              "name": "Marsh Relic III"
            },
            "amber_relic_04": {
              "name": "Marsh Relic IV"
            },
            "amber_relic_05": {
              "name": "Marsh Relic V"
            },
            "amber_relic_06": {
              "name": "Marsh Relic VI"
            }
          },
          "badges": [
            "swamp",
            "autumn",
            "mist"
          ]
        },
        "ancient_enigma_strata": {
          "name": "古代謎跡複合遺跡：層状記録庫",
          "description": "黄金比螺旋で接続された発掘層が交わる儀式性の高い記録庫",
          "blocks": {
            "enigma_strata_01": {
              "name": "Strata Expedition I"
            },
            "enigma_strata_02": {
              "name": "Strata Expedition II"
            },
            "enigma_strata_03": {
              "name": "Strata Expedition III"
            },
            "enigma_strata_04": {
              "name": "Strata Expedition IV"
            },
            "enigma_strata_05": {
              "name": "Strata Expedition V"
            },
            "enigma_strata_06": {
              "name": "Strata Expedition VI"
            },
            "enigma_strata_07": {
              "name": "Strata Expedition VII"
            },
            "glyph_ward_01": {
              "name": "Glyph Ward I"
            },
            "glyph_ward_02": {
              "name": "Glyph Ward II"
            },
            "glyph_ward_03": {
              "name": "Glyph Ward III"
            },
            "glyph_ward_04": {
              "name": "Glyph Ward IV"
            },
            "glyph_ward_05": {
              "name": "Glyph Ward V"
            },
            "glyph_ward_06": {
              "name": "Glyph Ward VI"
            }
          },
          "badges": [
            "puzzle",
            "ancient",
            "archaeology"
          ]
        },
        "ancient_enigma_crypt": {
          "name": "古代謎跡複合遺跡：墳墓回廊",
          "description": "石棺回廊と矩形環状路が幾重にも連なる考古学的地下廟",
          "blocks": {
            "crypt_reliquary_01": {
              "name": "Reliquary Vault I"
            },
            "crypt_reliquary_02": {
              "name": "Reliquary Vault II"
            },
            "crypt_reliquary_03": {
              "name": "Reliquary Vault III"
            },
            "crypt_reliquary_04": {
              "name": "Reliquary Vault IV"
            },
            "crypt_reliquary_05": {
              "name": "Reliquary Vault V"
            },
            "crypt_reliquary_06": {
              "name": "Reliquary Vault VI"
            },
            "ossuary_route_01": {
              "name": "Ossuary Route I"
            },
            "ossuary_route_02": {
              "name": "Ossuary Route II"
            },
            "ossuary_route_03": {
              "name": "Ossuary Route III"
            },
            "ossuary_route_04": {
              "name": "Ossuary Route IV"
            },
            "ossuary_route_05": {
              "name": "Ossuary Route V"
            }
          },
          "badges": [
            "labyrinth",
            "ancient",
            "ritual"
          ]
        },
        "ancient_enigma_aquifer": {
          "name": "古代謎跡複合遺跡：水聖書庫",
          "description": "蛇行する地下水脈と遺物庫を行き来する水文考古学的書庫",
          "blocks": {
            "aquifer_cache_01": {
              "name": "Aquifer Cache I"
            },
            "aquifer_cache_02": {
              "name": "Aquifer Cache II"
            },
            "aquifer_cache_03": {
              "name": "Aquifer Cache III"
            },
            "aquifer_cache_04": {
              "name": "Aquifer Cache IV"
            },
            "aquifer_cache_05": {
              "name": "Aquifer Cache V"
            },
            "aquifer_cache_06": {
              "name": "Aquifer Cache VI"
            }
          },
          "badges": [
            "water",
            "ancient",
            "mystery"
          ]
        },
        "mirage_caravan": {
          "name": "蜃気楼の隊商路",
          "description": "砂漠の商隊跡とオアシスが点在するゆらめく回廊。",
          "blocks": {
            "arabia-mirage-path": {
              "name": "طريق السراب"
            },
            "arabia-caravan-camp": {
              "name": "معسكر القافلة"
            },
            "arabia-mirage-gate": {
              "name": "بوابة السراب"
            },
            "arabia-mirage-lord": {
              "name": "سيد السراب"
            }
          },
          "badges": [
            "desert",
            "field",
            "maze"
          ]
        },
        "moonlit_oasis": {
          "name": "月影のオアシス",
          "description": "月光が照らす泉と運河が広がる静かな夜の砂漠。",
          "blocks": {
            "arabia-oasis-heart": {
              "name": "قلب الواحة"
            },
            "arabia-oasis-sanctum": {
              "name": "محراب الواحة"
            },
            "arabia-oasis-oracle": {
              "name": "عرّافة الواحة"
            }
          },
          "badges": [
            "water",
            "desert",
            "ritual"
          ]
        },
        "saffron_citadel": {
          "name": "サフランの城砦",
          "description": "金砂の層が重なる階段状の防衛拠点。",
          "blocks": {
            "arabia-saffron-terrace": {
              "name": "شرفة الزعفران"
            },
            "arabia-citadel-throne": {
              "name": "عرش القلعة"
            },
            "arabia-saffron-emperor": {
              "name": "إمبراطور الزعفران"
            }
          },
          "badges": [
            "fortress",
            "desert"
          ]
        },
        "labyrinthine_souk": {
          "name": "迷宮のスーク",
          "description": "露店がひしめく複雑な市場の路地裏。",
          "blocks": {
            "arabia-souk-arcade": {
              "name": "أروقة السوق"
            },
            "arabia-sandalwood-vault": {
              "name": "خزينة العود"
            },
            "arabia-souk-maze-core": {
              "name": "متاهة السوق"
            },
            "arabia-souk-sultana": {
              "name": "سلطانة السوق"
            }
          },
          "badges": [
            "maze",
            "urban",
            "market"
          ]
        },
        "windspire_minarets": {
          "name": "風塔ミナレット",
          "description": "高くそびえるミナレットと気流の回廊。",
          "blocks": {
            "arabia-minaret-walk": {
              "name": "ممر المئذنة"
            },
            "arabia-minaret-summit": {
              "name": "قمة المئذنة"
            },
            "arabia-minaret-windlord": {
              "name": "سيد الرياح"
            }
          },
          "badges": [
            "vertical",
            "sky",
            "desert"
          ]
        },
        "sunken_qanat": {
          "name": "地底カナート",
          "description": "地下水路が結ぶオアシス群と涼しい風穴。",
          "blocks": {
            "arabia-qanat-channel": {
              "name": "قناة القنوات"
            },
            "arabia-qanat-reservoir": {
              "name": "خزان القنوات"
            },
            "arabia-qanat-guardian": {
              "name": "حارس القنوات"
            }
          },
          "badges": [
            "water",
            "underground"
          ]
        },
        "star_sand_garden": {
          "name": "星砂の庭園",
          "description": "星型の回廊と幾何学紋様が広がる砂庭。",
          "blocks": {
            "arabia-star-garden": {
              "name": "حديقة النجوم"
            },
            "arabia-star-sigil": {
              "name": "ختم النجمة"
            },
            "arabia-star-astromancer": {
              "name": "عراف النجوم"
            }
          },
          "badges": [
            "ritual",
            "desert"
          ]
        },
        "gilded_tombs": {
          "name": "黄金の墳墓街",
          "description": "砂の下に眠る王族の墓室群。",
          "blocks": {
            "arabia-golden-crypt": {
              "name": "سرداب الذهب"
            },
            "arabia-gilded-sarcophagus": {
              "name": "تابوت مرصع"
            },
            "arabia-gilded-pharaoh": {
              "name": "فرعون مذهب"
            }
          },
          "badges": [
            "crypt",
            "desert"
          ]
        },
        "storm_djinn_forge": {
          "name": "嵐精の炉",
          "description": "ジンが鍛造した嵐の導線が渦巻く魔鍛冶場。",
          "blocks": {
            "arabia-djinn-furnace": {
              "name": "فرن الجن"
            },
            "arabia-djinn-reactor": {
              "name": "مفاعل العاصفة"
            },
            "arabia-djinn-king": {
              "name": "ملك الجن"
            }
          },
          "badges": [
            "forge",
            "arcane",
            "storm"
          ]
        },
        "celestial_astrolabe": {
          "name": "天球アストロラーベ",
          "description": "星の軌跡を刻む円環と星図の聖堂。",
          "blocks": {
            "arabia-astrolabe-ring": {
              "name": "حلقة النجوم"
            },
            "arabia-astral-dome": {
              "name": "قبة فلكية"
            },
            "arabia-astral-caliph": {
              "name": "خليفة النجوم"
            }
          },
          "badges": [
            "ritual",
            "astral"
          ]
        },
        "aurora_dune_sea": {
          "name": "黎明の砂海",
          "description": "オーロラが揺らめく砂丘が幾重にも波打つ幻彩の海。",
          "blocks": {
            "arabia-aurora-dune": {
              "name": "كثبان الفجر"
            },
            "arabia-aurora-amphitheatre": {
              "name": "مدرج الشفق"
            },
            "arabia-aurora-sovereign": {
              "name": "سيّد الشفق"
            }
          },
          "badges": [
            "desert",
            "mirage",
            "open-space"
          ]
        },
        "sapphire_madrasa": {
          "name": "蒼瑠璃のマドラサ",
          "description": "幾何学タイルが輝く左右対称の学術庭園。",
          "blocks": {
            "arabia-madrasa-court": {
              "name": "فناء المدرسة"
            },
            "arabia-madrasa-vault": {
              "name": "خزينة المعارف"
            },
            "arabia-madrasa-archsage": {
              "name": "حكيم اللازوردي"
            }
          },
          "badges": [
            "ritual",
            "urban",
            "sacred"
          ]
        },
        "prismatic_carpet_gallery": {
          "name": "虹織の絨毯回廊",
          "description": "織機のように色帯が交差する華やかな展示街路。",
          "blocks": {
            "arabia-carpet-corridor": {
              "name": "ممر السجاد"
            },
            "arabia-carpet-loom": {
              "name": "منسج الألوان"
            },
            "arabia-carpet-paragon": {
              "name": "معلّم النسيج"
            }
          },
          "badges": [
            "market",
            "maze",
            "festival"
          ]
        },
        "hanging_garden_terraces": {
          "name": "宙庭の段丘",
          "description": "空に浮かぶ庭園が段状に連なる翠の聖域。",
          "blocks": {
            "arabia-garden-ledge": {
              "name": "شرفة الحدائق"
            },
            "arabia-garden-aerial": {
              "name": "حديقة المعلّقات"
            },
            "arabia-garden-seraph": {
              "name": "حارس المعلقات"
            }
          },
          "badges": [
            "garden",
            "fortress"
          ]
        },
        "emberglass_sanctum": {
          "name": "熾砂の聖室",
          "description": "赤熱するガラス円環が連なる魔術の炉心。",
          "blocks": {
            "arabia-ember-hall": {
              "name": "قاعة الجمرة"
            },
            "arabia-ember-altar": {
              "name": "مذبح الجمرة"
            },
            "arabia-ember-avatar": {
              "name": "تجسيد الجمرة"
            }
          },
          "badges": [
            "forge",
            "ritual",
            "heat"
          ]
        },
        "astral_mirage_archive": {
          "name": "星幻の書架",
          "description": "星砂を編んだ螺旋回廊に記憶の書が漂う資料庫。",
          "blocks": {
            "arabia-astral-script": {
              "name": "مخطوط النجوم"
            },
            "arabia-astral-orrery": {
              "name": "مدار المخطوط"
            },
            "arabia-astral-archivist": {
              "name": "أمين السجلات النجمية"
            }
          },
          "badges": [
            "astral",
            "library",
            "ritual"
          ]
        },
        "axis_gallery": {
          "name": "軸路の回廊",
          "description": "縦横に分かたれた通路が交差する静寂の展示廊",
          "blocks": {
            "axis_gallery_a": {
              "name": "軸路の玄関"
            },
            "axis_gallery_b": {
              "name": "展示列柱"
            },
            "axis_gallery_core": {
              "name": "軸交差中庭"
            },
            "axis_gallery_boss": {
              "name": "双軸の祭壇"
            }
          },
          "badges": [
            "gallery",
            "hazard"
          ]
        },
        "bamboo_hollows": {
          "name": "竹のホロウ",
          "description": "竹林の小道とせせらぎが続く静かな迷路",
          "blocks": {
            "bamboo_theme_01": {
              "name": "Bamboo Theme I"
            },
            "bamboo_theme_02": {
              "name": "Bamboo Theme II"
            },
            "bamboo_theme_03": {
              "name": "Bamboo Theme III"
            },
            "bamboo_theme_04": {
              "name": "Bamboo Theme IV"
            },
            "bamboo_theme_05": {
              "name": "Bamboo Theme V"
            },
            "bamboo_theme_06": {
              "name": "Bamboo Theme VI"
            },
            "bamboo_theme_07": {
              "name": "Bamboo Theme VII"
            },
            "bamboo_core_01": {
              "name": "Bamboo Core I"
            },
            "bamboo_core_02": {
              "name": "Bamboo Core II"
            },
            "bamboo_core_03": {
              "name": "Bamboo Core III"
            },
            "bamboo_core_04": {
              "name": "Bamboo Core IV"
            },
            "bamboo_core_05": {
              "name": "Bamboo Core V"
            },
            "bamboo_core_06": {
              "name": "Bamboo Core VI"
            },
            "bamboo_core_07": {
              "name": "Bamboo Core VII"
            },
            "bamboo_relic_01": {
              "name": "Bamboo Relic I"
            },
            "bamboo_relic_02": {
              "name": "Bamboo Relic II"
            },
            "bamboo_relic_03": {
              "name": "Bamboo Relic III"
            },
            "bamboo_relic_04": {
              "name": "Bamboo Relic IV"
            },
            "bamboo_relic_05": {
              "name": "Bamboo Relic V"
            },
            "bamboo_relic_06": {
              "name": "Bamboo Relic VI"
            }
          },
          "badges": [
            "forest",
            "bamboo",
            "stream"
          ]
        },
        "sunlit_shore": {
          "name": "砂浜",
          "description": "砂浜と海水が広がる海岸沿いの地形",
          "blocks": {
            "shore_theme_01": {
              "name": "Shore Theme I"
            },
            "shore_theme_02": {
              "name": "Shore Theme II"
            },
            "shore_theme_03": {
              "name": "Shore Theme III"
            },
            "shore_theme_04": {
              "name": "Shore Theme IV"
            },
            "shore_theme_05": {
              "name": "Shore Theme V"
            },
            "shore_core_01": {
              "name": "Shore Core I"
            },
            "shore_core_02": {
              "name": "Shore Core II"
            },
            "shore_core_03": {
              "name": "Shore Core III"
            },
            "shore_core_04": {
              "name": "Shore Core IV"
            },
            "shore_core_05": {
              "name": "Shore Core V"
            },
            "shore_relic_01": {
              "name": "Shore Relic I"
            },
            "shore_relic_02": {
              "name": "Shore Relic II"
            },
            "shore_relic_03": {
              "name": "Shore Relic III"
            },
            "shore_relic_04": {
              "name": "Shore Relic IV"
            },
            "shore_relic_05": {
              "name": "Shore Relic V"
            }
          },
          "badges": [
            "beach",
            "water"
          ]
        },
        "minefield_expanse": {
          "name": "地雷原の荒野",
          "description": "縦横に走る塹壕と爆弾ポケットが散在する危険な平原",
          "blocks": {
            "minefield_theme_01": {
              "name": "Minefield Theme I"
            },
            "minefield_theme_02": {
              "name": "Minefield Theme II"
            },
            "minefield_theme_03": {
              "name": "Minefield Theme III"
            }
          },
          "badges": [
            "open-space",
            "bomb"
          ]
        },
        "shrapnel_barracks": {
          "name": "破片兵舎",
          "description": "部屋と廊下が連なる廃兵舎。扉周りには起爆装置が待ち構える",
          "blocks": {
            "barracks_core_01": {
              "name": "Barracks Core I"
            },
            "barracks_core_02": {
              "name": "Barracks Core II"
            },
            "barracks_core_03": {
              "name": "Barracks Core III"
            }
          },
          "badges": [
            "rooms",
            "bomb"
          ]
        },
        "fuse_labyrinth": {
          "name": "導火線迷宮",
          "description": "導火線のように複雑な迷路。交差点に爆弾が仕掛けられている",
          "blocks": {
            "fuse_relic_01": {
              "name": "Fuse Relic I"
            },
            "fuse_relic_02": {
              "name": "Fuse Relic II"
            },
            "fuse_relic_03": {
              "name": "Fuse Relic III"
            }
          },
          "badges": [
            "maze",
            "bomb"
          ]
        },
        "imperial_courtyard": {
          "name": "紫禁庭苑",
          "description": "王宮の中庭が重なる儀礼空間",
          "blocks": {
            "zijin_01": {
              "name": "紫禁正門"
            },
            "zijin_02": {
              "name": "紫禁内苑"
            },
            "zijin_03": {
              "name": "紫禁儀殿"
            },
            "huadian_01": {
              "name": "花殿回廊"
            },
            "huadian_02": {
              "name": "花殿主殿"
            },
            "huadian_03": {
              "name": "花殿玉階"
            },
            "huangyu_01": {
              "name": "皇御斎殿"
            },
            "huangyu_02": {
              "name": "皇御宸極"
            },
            "huangyu_03": {
              "name": "皇御星穹"
            }
          },
          "badges": [
            "imperial",
            "symmetry",
            "ceremony"
          ]
        },
        "lotus_labyrinth": {
          "name": "蓮花迷宮",
          "description": "蓮が幾重にも咲く輪郭状の迷宮",
          "blocks": {
            "lianhua_01": {
              "name": "蓮華初層"
            },
            "lianhua_02": {
              "name": "蓮華霧層"
            },
            "lianhua_03": {
              "name": "蓮華夜層"
            },
            "shuilian_01": {
              "name": "水蓮回庭"
            },
            "shuilian_02": {
              "name": "水蓮幻郭"
            },
            "shuilian_03": {
              "name": "水蓮星殿"
            },
            "lianxin_01": {
              "name": "蓮心霧宮"
            },
            "lianxin_02": {
              "name": "蓮心星塔"
            },
            "lianxin_03": {
              "name": "蓮心天蓬"
            }
          },
          "badges": [
            "garden",
            "ring",
            "water"
          ]
        },
        "silk_market": {
          "name": "絲綢市集",
          "description": "縦横に伸びる商人の路地と屋台",
          "blocks": {
            "jinluo_01": {
              "name": "金鑼街区"
            },
            "jinluo_02": {
              "name": "金鑼夜市"
            },
            "jinluo_03": {
              "name": "金鑼豪市"
            },
            "mingshi_01": {
              "name": "名市小径"
            },
            "mingshi_02": {
              "name": "名市帳幕"
            },
            "mingshi_03": {
              "name": "名市楼閣"
            },
            "shangshi_01": {
              "name": "商市耀庭"
            },
            "shangshi_02": {
              "name": "商市霓楼"
            },
            "shangshi_03": {
              "name": "商市金穹"
            }
          },
          "badges": [
            "market",
            "grid",
            "urban"
          ]
        },
        "great_wall_terrace": {
          "name": "長城高台",
          "description": "城壁と展望台が交差する防衛構造",
          "blocks": {
            "changcheng_01": {
              "name": "長城外哨"
            },
            "changcheng_02": {
              "name": "長城箭楼"
            },
            "changcheng_03": {
              "name": "長城烽台"
            },
            "yanmen_01": {
              "name": "雁門関廊"
            },
            "yanmen_02": {
              "name": "雁門砦楼"
            },
            "yanmen_03": {
              "name": "雁門烽楼"
            },
            "changsheng_01": {
              "name": "長勝烽堡"
            },
            "changsheng_02": {
              "name": "長勝天闕"
            },
            "changsheng_03": {
              "name": "長勝雲堞"
            }
          },
          "badges": [
            "fortress",
            "grid",
            "defense"
          ]
        },
        "dragon_spine": {
          "name": "龍脈回廊",
          "description": "龍の背骨のような弧状の回廊",
          "blocks": {
            "jinglu_01": {
              "name": "京路胡同"
            },
            "jinglu_02": {
              "name": "京路龍鱗"
            },
            "jinglu_03": {
              "name": "京路龍脈"
            },
            "longyin_01": {
              "name": "龍吟巷"
            },
            "longyin_02": {
              "name": "龍吟華軒"
            },
            "longyin_03": {
              "name": "龍吟梧宮"
            },
            "longxin_01": {
              "name": "龍心宝庫"
            },
            "longxin_02": {
              "name": "龍心霊壇"
            },
            "longxin_03": {
              "name": "龍心雲闕"
            }
          },
          "badges": [
            "organic",
            "serpentine"
          ]
        },
        "scholar_archive": {
          "name": "翰林書庫",
          "description": "書架と閲覧室が層を成す学術空間",
          "blocks": {
            "hanlin_01": {
              "name": "翰林序館"
            },
            "hanlin_02": {
              "name": "翰林内庫"
            },
            "hanlin_03": {
              "name": "翰林秘閣"
            },
            "wenxin_01": {
              "name": "文心閲廊"
            },
            "wenxin_02": {
              "name": "文心秘庫"
            },
            "wenxin_03": {
              "name": "文心玉架"
            },
            "hanxin_01": {
              "name": "翰心星閲"
            },
            "hanxin_02": {
              "name": "翰心霜庫"
            },
            "hanxin_03": {
              "name": "翰心辰宮"
            }
          },
          "badges": [
            "library",
            "archive"
          ]
        },
        "moonlit_waterways": {
          "name": "月影水路",
          "description": "氷の水路と舟着き場が連なる夜景",
          "blocks": {
            "yueliang_01": {
              "name": "月梁水街"
            },
            "yueliang_02": {
              "name": "月梁寒渠"
            },
            "yueliang_03": {
              "name": "月梁霜港"
            },
            "liangyue_01": {
              "name": "涼月津"
            },
            "liangyue_02": {
              "name": "涼月霜渠"
            },
            "liangyue_03": {
              "name": "涼月天港"
            },
            "yuexiang_01": {
              "name": "月香流光"
            },
            "yuexiang_02": {
              "name": "月香寒波"
            },
            "yuexiang_03": {
              "name": "月香雪港"
            }
          },
          "badges": [
            "water",
            "ice",
            "canal"
          ]
        },
        "celestial_observatory": {
          "name": "天穹観星塔",
          "description": "天体観測儀が巡る星環と星図の腕が伸びる天空迷宮",
          "blocks": {
            "tianwen_01": {
              "name": "天文前庭"
            },
            "tianwen_02": {
              "name": "天文星塔"
            },
            "tianwen_03": {
              "name": "天文極殿"
            },
            "xingguan_01": {
              "name": "星観迴廊"
            },
            "xingguan_02": {
              "name": "星観塔層"
            },
            "xingguan_03": {
              "name": "星観穹宮"
            },
            "starcrest_01": {
              "name": "星冠観測"
            },
            "starcrest_02": {
              "name": "星冠律塔"
            },
            "starcrest_03": {
              "name": "星冠穹儀"
            },
            "constellation_01": {
              "name": "星羅雲殿"
            },
            "constellation_02": {
              "name": "星羅宙宮"
            },
            "constellation_03": {
              "name": "星羅永極"
            },
            "jrpg_legends_story_06": {
              "name": "Legends Story VI"
            },
            "jrpg_legends_adventure_06": {
              "name": "Adventure VI"
            },
            "jrpg_legends_trial_06": {
              "name": "Trial VI"
            },
            "jrpg_legends_raid_03": {
              "name": "Raid III"
            }
          },
          "badges": [
            "astral",
            "rings",
            "ritual",
            "sky",
            "symmetry"
          ]
        },
        "jade_terraces": {
          "name": "翠玉連台",
          "description": "段々畑のように広がる翠玉の庭園",
          "blocks": {
            "cuitai_01": {
              "name": "翠台浅園"
            },
            "cuitai_02": {
              "name": "翠台深苑"
            },
            "cuitai_03": {
              "name": "翠台玉峰"
            },
            "yuta_01": {
              "name": "玉台浅苑"
            },
            "yuta_02": {
              "name": "玉台翠庭"
            },
            "yuta_03": {
              "name": "玉台霊峰"
            },
            "emerald_01": {
              "name": "翡翠段陵"
            },
            "emerald_02": {
              "name": "翡翠雲壇"
            },
            "emerald_03": {
              "name": "翡翠霊峰"
            },
            "emeraldcrest_01": {
              "name": "翠冠梯苑"
            },
            "emeraldcrest_02": {
              "name": "翠冠霊台"
            },
            "emeraldcrest_03": {
              "name": "翠冠仙壇"
            }
          },
          "badges": [
            "garden",
            "terrace",
            "water"
          ]
        },
        "lantern_festival": {
          "name": "燈海嘉年",
          "description": "連なる提灯と露店が彩る祝祭の街路",
          "blocks": {
            "denghai_01": {
              "name": "燈海市街"
            },
            "denghai_02": {
              "name": "燈海慶宴"
            },
            "denghai_03": {
              "name": "燈海宵宮"
            },
            "zhaohui_01": {
              "name": "照輝街巷"
            },
            "zhaohui_02": {
              "name": "照輝夜市"
            },
            "zhaohui_03": {
              "name": "照輝長廊"
            },
            "festival_01": {
              "name": "灯宴極街"
            },
            "festival_02": {
              "name": "灯宴宵城"
            },
            "festival_03": {
              "name": "灯宴星都"
            },
            "radiantgala_01": {
              "name": "燈耀宵宴"
            },
            "radiantgala_02": {
              "name": "燈耀星街"
            },
            "radiantgala_03": {
              "name": "燈耀霓京"
            }
          },
          "badges": [
            "festival",
            "lantern",
            "market"
          ]
        },
        "opera_house": {
          "name": "梨園大戯",
          "description": "舞台と客席が重層する大劇場",
          "blocks": {
            "liyuan_01": {
              "name": "梨園雅台"
            },
            "liyuan_02": {
              "name": "梨園霓殿"
            },
            "liyuan_03": {
              "name": "梨園極舞"
            },
            "liyuan_04": {
              "name": "梨園雅席"
            },
            "liyuan_05": {
              "name": "梨園錦幕"
            },
            "grandopera_01": {
              "name": "戯都雅廊"
            },
            "grandopera_02": {
              "name": "戯都彩殿"
            },
            "grandopera_03": {
              "name": "戯都霓穹"
            },
            "royalopera_01": {
              "name": "戯皇瑠殿"
            },
            "royalopera_02": {
              "name": "戯皇星舞"
            },
            "royalopera_03": {
              "name": "戯皇虹蓋"
            }
          },
          "badges": [
            "theater",
            "stage",
            "crescent"
          ]
        },
        "crane_sanctuary": {
          "name": "仙鶴雲苑",
          "description": "雲水庭園に橋が螺旋する聖域",
          "blocks": {
            "xianhe_01": {
              "name": "仙鶴水苑"
            },
            "xianhe_02": {
              "name": "仙鶴雲台"
            },
            "xianhe_03": {
              "name": "仙鶴星舞"
            },
            "xianhe_04": {
              "name": "仙鶴霧橋"
            },
            "xianhe_05": {
              "name": "仙鶴雲路"
            },
            "cranecloud_01": {
              "name": "鶴雲環洲"
            },
            "cranecloud_02": {
              "name": "鶴雲聖蓮"
            },
            "cranecloud_03": {
              "name": "鶴雲霊橋"
            },
            "cranesummit_01": {
              "name": "鶴頂浮洲"
            },
            "cranesummit_02": {
              "name": "鶴頂翔庭"
            },
            "cranesummit_03": {
              "name": "鶴頂雲極"
            }
          },
          "badges": [
            "garden",
            "water",
            "sanctuary"
          ]
        },
        "tea_pavilion": {
          "name": "香茗雲亭",
          "description": "茶亭と座敷が連なる静謐な庭園",
          "blocks": {
            "xiangming_01": {
              "name": "香茗茶肆"
            },
            "xiangming_02": {
              "name": "香茗御亭"
            },
            "xiangming_03": {
              "name": "香茗霧榭"
            },
            "xiangming_04": {
              "name": "香茗茶舟"
            },
            "xiangming_05": {
              "name": "香茗花亭"
            },
            "pavilion_01": {
              "name": "茗亭雲居"
            },
            "pavilion_02": {
              "name": "茗亭霧軒"
            },
            "pavilion_03": {
              "name": "茗亭香閣"
            },
            "jadebrew_01": {
              "name": "茗冠香庭"
            },
            "jadebrew_02": {
              "name": "茗冠霧亭"
            },
            "jadebrew_03": {
              "name": "茗冠星閣"
            }
          },
          "badges": [
            "tea",
            "terrace",
            "pavilion"
          ]
        },
        "churning_karst": {
          "name": "奔流石灰洞",
          "description": "石灰質が侵食された水流迷宮。複層の地下水脈が洞窟を削り続ける。",
          "blocks": {
            "karst_theme_01": {
              "name": "Karst Rapids I"
            },
            "karst_theme_02": {
              "name": "Karst Rapids II"
            },
            "karst_theme_03": {
              "name": "Karst Rapids III"
            },
            "karst_theme_04": {
              "name": "Karst Rapids IV"
            },
            "karst_core_01": {
              "name": "Karst Core I"
            },
            "karst_core_02": {
              "name": "Karst Core II"
            },
            "karst_core_03": {
              "name": "Karst Core III"
            },
            "karst_core_04": {
              "name": "Karst Core IV"
            },
            "karst_relic_01": {
              "name": "Karst Relic I"
            },
            "karst_relic_02": {
              "name": "Karst Relic II"
            },
            "karst_relic_03": {
              "name": "Karst Relic III"
            }
          },
          "badges": [
            "cave",
            "water",
            "erosion"
          ]
        },
        "royal_keep": {
          "name": "王都城郭",
          "description": "王城の大広間と城郭塔が広がるシンメトリなダンジョン",
          "blocks": {
            "jrpg_legends_story_01": {
              "name": "Legends Story I"
            },
            "jrpg_legends_adventure_01": {
              "name": "Adventure I"
            },
            "jrpg_legends_trial_01": {
              "name": "Trial I"
            }
          },
          "badges": [
            "castle",
            "symmetry",
            "royal"
          ]
        },
        "mystic_wood": {
          "name": "精霊の森回廊",
          "description": "複数の聖なる林と小道がつながる自然派ダンジョン",
          "blocks": {
            "jrpg_legends_story_02": {
              "name": "Legends Story II"
            },
            "jrpg_legends_adventure_02": {
              "name": "Adventure II"
            },
            "jrpg_legends_trial_02": {
              "name": "Trial II"
            }
          },
          "badges": [
            "forest",
            "organic",
            "nature"
          ]
        },
        "crystal_depths": {
          "name": "星晶洞窟",
          "description": "光る星晶の迷路を彷徨う王道ファンタジーの地下洞窟",
          "blocks": {
            "jrpg_legends_story_03": {
              "name": "Legends Story III"
            },
            "jrpg_legends_adventure_03": {
              "name": "Adventure III"
            },
            "jrpg_legends_trial_03": {
              "name": "Trial III"
            }
          },
          "badges": [
            "cave",
            "crystal",
            "mystic"
          ]
        },
        "sacred_sanctum": {
          "name": "聖堂回廊",
          "description": "聖印が幾重にも刻まれた礼拝堂型迷宮",
          "blocks": {
            "jrpg_legends_story_04": {
              "name": "Legends Story IV"
            },
            "jrpg_legends_adventure_04": {
              "name": "Adventure IV"
            },
            "jrpg_legends_trial_04": {
              "name": "Trial IV"
            }
          },
          "badges": [
            "temple",
            "holy",
            "structured"
          ]
        },
        "dragon_forge": {
          "name": "竜骨熔鉱炉",
          "description": "竜の息吹で灼けた熔鉱炉と溶岩の河が交差する灼熱ダンジョン",
          "blocks": {
            "jrpg_legends_story_05": {
              "name": "Legends Story V"
            },
            "jrpg_legends_adventure_05": {
              "name": "Adventure V"
            },
            "jrpg_legends_trial_05": {
              "name": "Trial V"
            }
          },
          "badges": [
            "lava",
            "forge",
            "dragon"
          ]
        },
        "ancient_aqueduct": {
          "name": "古代水路迷宮",
          "description": "水脈が幾重にも流れるアクアダクトを辿る迷宮都市",
          "blocks": {
            "jrpg_legends_story_07": {
              "name": "Legends Story VII"
            },
            "jrpg_legends_adventure_07": {
              "name": "Adventure VII"
            },
            "jrpg_legends_trial_07": {
              "name": "Trial VII"
            }
          },
          "badges": [
            "water",
            "engineered",
            "city"
          ]
        },
        "mirror_catacomb": {
          "name": "鏡写しの地下墓所",
          "description": "鏡合わせの回廊が交差し霊廟が整然と並ぶ地下墓所",
          "blocks": {
            "jrpg_legends_story_08": {
              "name": "Legends Story VIII"
            },
            "jrpg_legends_adventure_08": {
              "name": "Adventure VIII"
            },
            "jrpg_legends_trial_08": {
              "name": "Trial VIII"
            },
            "jrpg_legends_raid_07": {
              "name": "Raid VII"
            }
          },
          "badges": [
            "crypt",
            "symmetry",
            "labyrinth"
          ]
        },
        "floating_archipelago": {
          "name": "浮遊諸島遺跡",
          "description": "浮かぶ島々と雲橋を渡る空中遺跡の多島海ダンジョン",
          "blocks": {
            "jrpg_legends_story_09": {
              "name": "Legends Story IX"
            },
            "jrpg_legends_adventure_09": {
              "name": "Adventure IX"
            },
            "jrpg_legends_trial_09": {
              "name": "Trial IX"
            },
            "jrpg_legends_raid_04": {
              "name": "Raid IV"
            }
          },
          "badges": [
            "floating",
            "bridge",
            "open"
          ]
        },
        "arcane_library": {
          "name": "封印図書迷宮",
          "description": "無数の書庫と閲覧回廊が格子状に連なる魔導図書館",
          "blocks": {
            "jrpg_legends_story_10": {
              "name": "Legends Story X"
            },
            "jrpg_legends_adventure_10": {
              "name": "Adventure X"
            },
            "jrpg_legends_raid_05": {
              "name": "Raid V"
            }
          },
          "badges": [
            "library",
            "grid",
            "mystic"
          ]
        },
        "ember_chasm": {
          "name": "焔裂の深淵",
          "description": "熾火の裂け目と火橋が放射状に伸びる火口迷宮",
          "blocks": {
            "jrpg_legends_trial_10": {
              "name": "Trial X"
            },
            "jrpg_legends_raid_01": {
              "name": "Raid I"
            },
            "jrpg_legends_raid_08": {
              "name": "Raid VIII"
            }
          },
          "badges": [
            "lava",
            "abyss",
            "bridge"
          ]
        },
        "glacial_bastion": {
          "name": "氷晶の要塞",
          "description": "氷晶の輪郭が幾層にも重なる極寒の星型砦ダンジョン",
          "blocks": {
            "jrpg_legends_raid_02": {
              "name": "Raid II"
            },
            "jrpg_legends_raid_06": {
              "name": "Raid VI"
            }
          },
          "badges": [
            "ice",
            "fortress",
            "radial"
          ]
        },
        "radiant_citadel": {
          "name": "光輝王城環",
          "description": "黄金の星環と光条が幾層に放たれる聖なる王城ダンジョン",
          "blocks": {
            "jrpg_legends_story_11": {
              "name": "Legends Story XI"
            },
            "jrpg_legends_adventure_11": {
              "name": "Adventure XI"
            },
            "jrpg_legends_trial_11": {
              "name": "Trial XI"
            },
            "jrpg_legends_raid_09": {
              "name": "Raid IX"
            }
          },
          "badges": [
            "holy",
            "castle",
            "radial"
          ]
        },
        "moonlit_cloister": {
          "name": "月影の回廊院",
          "description": "月光が射す十字回廊と水鏡庭園が静かに連なる修道院迷宮",
          "blocks": {
            "jrpg_legends_story_12": {
              "name": "Legends Story XII"
            },
            "jrpg_legends_adventure_12": {
              "name": "Adventure XII"
            },
            "jrpg_legends_trial_12": {
              "name": "Trial XII"
            },
            "jrpg_legends_raid_10": {
              "name": "Raid X"
            }
          },
          "badges": [
            "cloister",
            "symmetric",
            "water"
          ]
        },
        "verdant_terraces": {
          "name": "翠嶺段丘",
          "description": "段丘庭園と水路が縦横に巡る大地のテラス迷宮",
          "blocks": {
            "jrpg_legends_story_13": {
              "name": "Legends Story XIII"
            },
            "jrpg_legends_adventure_13": {
              "name": "Adventure XIII"
            },
            "jrpg_legends_trial_13": {
              "name": "Trial XIII"
            },
            "jrpg_legends_raid_11": {
              "name": "Raid XI"
            }
          },
          "badges": [
            "garden",
            "layered",
            "nature"
          ]
        },
        "tempest_bastion": {
          "name": "嵐輪の城塞",
          "description": "旋風が描く螺旋導路と雷柱が交わる暴風城塞ダンジョン",
          "blocks": {
            "jrpg_legends_story_14": {
              "name": "Legends Story XIV"
            },
            "jrpg_legends_adventure_14": {
              "name": "Adventure XIV"
            },
            "jrpg_legends_trial_14": {
              "name": "Trial XIV"
            },
            "jrpg_legends_raid_12": {
              "name": "Raid XII"
            }
          },
          "badges": [
            "storm",
            "spiral",
            "fortress"
          ]
        },
        "sunken_arcadia": {
          "name": "沈瑠璃の古都",
          "description": "水没した回廊都市と碧い水庭が格子状に広がる幻想水都",
          "blocks": {
            "jrpg_legends_story_15": {
              "name": "Legends Story XV"
            },
            "jrpg_legends_adventure_15": {
              "name": "Adventure XV"
            },
            "jrpg_legends_trial_15": {
              "name": "Trial XV"
            },
            "jrpg_legends_raid_13": {
              "name": "Raid XIII"
            }
          },
          "badges": [
            "water",
            "city",
            "ritual"
          ]
        },
        "clockwork_labyrinth": {
          "name": "機構迷宮",
          "description": "歯車のような同心回廊が広がる機械仕掛けの迷宮",
          "blocks": {
            "clock_theme_01": {
              "name": "Clock Theme I"
            },
            "clock_theme_02": {
              "name": "Clock Theme II"
            },
            "clock_theme_03": {
              "name": "Clock Theme III"
            },
            "clock_theme_04": {
              "name": "Clock Theme IV"
            },
            "clock_theme_05": {
              "name": "Clock Theme V"
            },
            "gear_core_01": {
              "name": "Gear Core I"
            },
            "gear_core_02": {
              "name": "Gear Core II"
            },
            "gear_core_03": {
              "name": "Gear Core III"
            },
            "gear_core_04": {
              "name": "Gear Core IV"
            },
            "gear_core_05": {
              "name": "Gear Core V"
            },
            "gear_relic_01": {
              "name": "Gear Relic I"
            },
            "gear_relic_02": {
              "name": "Gear Relic II"
            },
            "gear_relic_03": {
              "name": "Gear Relic III"
            },
            "gear_relic_04": {
              "name": "Gear Relic IV"
            },
            "gear_relic_05": {
              "name": "Gear Relic V"
            }
          },
          "badges": [
            "structured",
            "mechanical"
          ]
        },
        "conveyor_foundry": {
          "name": "コンベヤー鋳造所",
          "description": "流れるベルトと狭い作業路が入り組む機械工場跡",
          "blocks": {
            "conveyor_foundry_a": {
              "name": "鋳造ライン"
            },
            "conveyor_foundry_b": {
              "name": "搬入区画"
            },
            "conveyor_foundry_core": {
              "name": "中枢制御室"
            },
            "conveyor_foundry_boss": {
              "name": "炉心プラットフォーム"
            }
          },
          "badges": [
            "mechanical",
            "hazard"
          ]
        },
        "coral_garden": {
          "name": "珊瑚庭園",
          "description": "潮騒に包まれた珊瑚と海藻の迷路",
          "blocks": {
            "coral_theme_01": {
              "name": "Coral Theme I"
            },
            "coral_theme_02": {
              "name": "Coral Theme II"
            },
            "coral_theme_03": {
              "name": "Coral Theme III"
            },
            "coral_theme_04": {
              "name": "Coral Theme IV"
            },
            "coral_theme_05": {
              "name": "Coral Theme V"
            },
            "coral_theme_06": {
              "name": "Coral Theme VI"
            },
            "coral_theme_07": {
              "name": "Coral Theme VII"
            },
            "coral_core_01": {
              "name": "Coral Core I"
            },
            "coral_core_02": {
              "name": "Coral Core II"
            },
            "coral_core_03": {
              "name": "Coral Core III"
            },
            "coral_core_04": {
              "name": "Coral Core IV"
            },
            "coral_core_05": {
              "name": "Coral Core V"
            },
            "coral_core_06": {
              "name": "Coral Core VI"
            },
            "coral_core_07": {
              "name": "Coral Core VII"
            },
            "coral_relic_01": {
              "name": "Coral Relic I"
            },
            "coral_relic_02": {
              "name": "Coral Relic II"
            },
            "coral_relic_03": {
              "name": "Coral Relic III"
            },
            "coral_relic_04": {
              "name": "Coral Relic IV"
            },
            "coral_relic_05": {
              "name": "Coral Relic V"
            },
            "coral_relic_06": {
              "name": "Coral Relic VI"
            }
          },
          "badges": [
            "water",
            "reef",
            "undersea"
          ]
        },
        "crossroads_3wide": {
          "name": "交差点部屋",
          "badges": [
            "grid"
          ]
        },
        "horizontal_stripes": {
          "name": "一本道横部屋",
          "badges": [
            "corridor"
          ]
        },
        "vertical_stripes": {
          "name": "一本道縦部屋",
          "badges": [
            "corridor"
          ]
        },
        "perforated_grid": {
          "name": "格子壁穴あき部屋",
          "badges": [
            "grid"
          ]
        },
        "ladder_room": {
          "name": "梯子のような部屋",
          "badges": [
            "corridor"
          ]
        },
        "branching_corridors_narrow": {
          "name": "通路が枝分かれ（狭い）",
          "badges": [
            "maze"
          ]
        },
        "branching_corridors_thick": {
          "name": "通路が枝分かれ（太い）",
          "badges": [
            "maze"
          ]
        },
        "shadowed_caverns": {
          "name": "暗い洞窟",
          "description": "視界の効かない湿った洞窟網",
          "blocks": {
            "shadow_cave_theme_01": {
              "name": "Shadow Caverns I"
            },
            "shadow_cave_theme_02": {
              "name": "Shadow Caverns II"
            },
            "shadow_cave_theme_03": {
              "name": "Shadow Caverns III"
            },
            "shadow_cave_core_01": {
              "name": "Gloom Core I"
            },
            "shadow_cave_core_02": {
              "name": "Gloom Core II"
            },
            "shadow_cave_relic_01": {
              "name": "Luminous Relic"
            }
          },
          "badges": [
            "cave",
            "dark"
          ]
        },
        "scorched_desert": {
          "name": "砂漠",
          "description": "照りつける砂と風紋が続く砂漠地帯",
          "blocks": {
            "desert_theme_01": {
              "name": "Desert Theme I"
            },
            "desert_theme_02": {
              "name": "Desert Theme II"
            },
            "desert_theme_03": {
              "name": "Desert Theme III"
            },
            "desert_theme_04": {
              "name": "Desert Theme IV"
            },
            "desert_theme_05": {
              "name": "Desert Theme V"
            },
            "desert_core_01": {
              "name": "Desert Core I"
            },
            "desert_core_02": {
              "name": "Desert Core II"
            },
            "desert_core_03": {
              "name": "Desert Core III"
            },
            "desert_core_04": {
              "name": "Desert Core IV"
            },
            "desert_core_05": {
              "name": "Desert Core V"
            },
            "desert_relic_01": {
              "name": "Desert Relic I"
            },
            "desert_relic_02": {
              "name": "Desert Relic II"
            },
            "desert_relic_03": {
              "name": "Desert Relic III"
            },
            "desert_relic_04": {
              "name": "Desert Relic IV"
            },
            "desert_relic_05": {
              "name": "Desert Relic V"
            }
          },
          "badges": [
            "field",
            "desert"
          ]
        },
        "echo_vaults": {
          "name": "残響聖窟",
          "description": "音が共鳴して形作られた聖堂のような洞窟。音の波紋が床面を彩る。",
          "blocks": {
            "echo_vault_theme_01": {
              "name": "Echo Vault I"
            },
            "echo_vault_theme_02": {
              "name": "Echo Vault II"
            },
            "echo_vault_theme_03": {
              "name": "Echo Vault III"
            },
            "echo_core_01": {
              "name": "Echo Core I"
            },
            "echo_core_02": {
              "name": "Echo Core II"
            },
            "echo_core_03": {
              "name": "Echo Core III"
            },
            "echo_relic_01": {
              "name": "Echo Relic I"
            },
            "echo_relic_02": {
              "name": "Echo Relic II"
            },
            "echo_relic_03": {
              "name": "Echo Relic III"
            }
          },
          "badges": [
            "cave",
            "resonance",
            "structure"
          ]
        },
        "sun_kings_processional": {
          "name": "太陽王の葬祭道",
          "description": "中央の葬祭道が続く荘厳な地下墓所のレイアウト",
          "badges": [
            "ruins",
            "desert",
            "ceremonial"
          ]
        },
        "sun_kings_terraced_courts": {
          "name": "階段式太陽庭園",
          "description": "階段状の聖域と水鏡の庭を備えた視覚重視の複合寺院",
          "badges": [
            "ruins",
            "desert",
            "symmetry"
          ]
        },
        "sun_kings_sunken_sanctum": {
          "name": "沈みゆく聖域回廊",
          "description": "青い沈殿池と放射状の回廊が広がる地下聖域",
          "badges": [
            "ruins",
            "desert",
            "grand"
          ]
        },
        "emberglass_caverns": {
          "name": "灼輝硝洞",
          "description": "灼熱の溶岩流が固まり硝子となった螺旋洞。余熱が揺らめく。",
          "blocks": {
            "emberglass_theme_01": {
              "name": "Emberglass I"
            },
            "emberglass_theme_02": {
              "name": "Emberglass II"
            },
            "emberglass_theme_03": {
              "name": "Emberglass III"
            },
            "ember_core_01": {
              "name": "Ember Core I"
            },
            "ember_core_02": {
              "name": "Ember Core II"
            },
            "ember_core_03": {
              "name": "Ember Core III"
            },
            "ember_relic_01": {
              "name": "Ember Relic I"
            },
            "ember_relic_02": {
              "name": "Ember Relic II"
            },
            "ember_relic_03": {
              "name": "Ember Relic III"
            }
          },
          "badges": [
            "cave",
            "lava",
            "crystal"
          ]
        },
        "verdant_forest": {
          "name": "森林洞窟",
          "description": "苔むした森林の洞窟。緑濃い壁と黄緑の床が続く",
          "blocks": {
            "forest_theme_01": {
              "name": "Forest Theme I"
            },
            "forest_theme_02": {
              "name": "Forest Theme II"
            },
            "forest_theme_03": {
              "name": "Forest Theme III"
            },
            "forest_theme_04": {
              "name": "Forest Theme IV"
            },
            "forest_theme_05": {
              "name": "Forest Theme V"
            },
            "forest_core_01": {
              "name": "Forest Core I"
            },
            "forest_core_02": {
              "name": "Forest Core II"
            },
            "forest_core_03": {
              "name": "Forest Core III"
            },
            "forest_core_04": {
              "name": "Forest Core IV"
            },
            "forest_core_05": {
              "name": "Forest Core V"
            },
            "forest_relic_01": {
              "name": "Forest Relic I"
            },
            "forest_relic_02": {
              "name": "Forest Relic II"
            },
            "forest_relic_03": {
              "name": "Forest Relic III"
            },
            "forest_relic_04": {
              "name": "Forest Relic IV"
            },
            "forest_relic_05": {
              "name": "Forest Relic V"
            }
          },
          "badges": [
            "cave",
            "forest"
          ]
        },
        "fungal_bloom": {
          "name": "菌糸繁茂洞",
          "description": "胞子嚢と菌糸の網目が広がる有機的な洞窟",
          "blocks": {
            "fungal_theme_01": {
              "name": "Fungal Theme I"
            },
            "fungal_theme_02": {
              "name": "Fungal Theme II"
            },
            "fungal_theme_03": {
              "name": "Fungal Theme III"
            },
            "fungal_theme_04": {
              "name": "Fungal Theme IV"
            },
            "fungal_theme_05": {
              "name": "Fungal Theme V"
            },
            "mycel_core_01": {
              "name": "Mycel Core I"
            },
            "mycel_core_02": {
              "name": "Mycel Core II"
            },
            "mycel_core_03": {
              "name": "Mycel Core III"
            },
            "mycel_core_04": {
              "name": "Mycel Core IV"
            },
            "mycel_core_05": {
              "name": "Mycel Core V"
            },
            "spore_relic_01": {
              "name": "Spore Relic I"
            },
            "spore_relic_02": {
              "name": "Spore Relic II"
            },
            "spore_relic_03": {
              "name": "Spore Relic III"
            },
            "spore_relic_04": {
              "name": "Spore Relic IV"
            },
            "spore_relic_05": {
              "name": "Spore Relic V"
            }
          },
          "badges": [
            "organic",
            "poison",
            "cave"
          ]
        },
        "ring_linked_rooms": {
          "name": "リング連結部屋",
          "badges": [
            "rooms"
          ]
        },
        "hex_lattice_rooms": {
          "name": "六角格子部屋",
          "badges": [
            "sf",
            "grid"
          ]
        },
        "bubble_rooms": {
          "name": "バブル部屋",
          "badges": [
            "organic",
            "rooms"
          ]
        },
        "spiral_room": {
          "name": "螺旋部屋",
          "badges": [
            "maze"
          ]
        },
        "circular_tower": {
          "name": "円の塔",
          "badges": [
            "rooms"
          ]
        },
        "square_tower": {
          "name": "四角の塔",
          "badges": [
            "rooms"
          ]
        },
        "diamond_room": {
          "name": "ダイヤの部屋",
          "badges": [
            "single"
          ]
        },
        "triangle_room": {
          "name": "三角の部屋",
          "badges": [
            "single"
          ]
        },
        "structure_mosaic": {
          "name": "構造モザイク",
          "badges": [
            "rooms",
            "modular"
          ]
        },
        "geo_fixed_labyrinth": {
          "name": "固定幾何ラビリンス",
          "description": "固定マップを用いた幾何学迷宮。各階層のレイアウトを固定しつつ構造APIのテンプレートとして利用できます。",
          "blocks": {
            "geo_fixed_trial": {
              "name": "Geo Fixed Trial"
            }
          },
          "badges": [
            "fixed",
            "rooms"
          ]
        },
        "grand_medieval_city": {
          "name": "荘厳なる中世都市",
          "description": "巨大な城壁と大通りが張り巡らされた中世ヨーロッパ風の街区",
          "blocks": {
            "grand_city_theme_01": {
              "name": "Grand City Theme I"
            },
            "grand_city_theme_02": {
              "name": "Grand City Theme II"
            },
            "grand_city_theme_03": {
              "name": "Grand City Theme III"
            },
            "grand_city_theme_04": {
              "name": "Grand City Theme IV"
            },
            "grand_city_theme_05": {
              "name": "Grand City Theme V"
            },
            "grand_city_theme_06": {
              "name": "Grand City Theme VI"
            },
            "grand_city_theme_07": {
              "name": "Grand City Theme VII"
            },
            "guild_row_01": {
              "name": "Guild Row I"
            },
            "guild_row_02": {
              "name": "Guild Row II"
            },
            "guild_row_03": {
              "name": "Guild Row III"
            },
            "guild_row_04": {
              "name": "Guild Row IV"
            },
            "guild_row_05": {
              "name": "Guild Row V"
            },
            "guild_row_06": {
              "name": "Guild Row VI"
            },
            "guild_row_07": {
              "name": "Guild Row VII"
            },
            "cathedral_01": {
              "name": "Cathedral I"
            },
            "cathedral_02": {
              "name": "Cathedral II"
            },
            "cathedral_03": {
              "name": "Cathedral III"
            },
            "cathedral_04": {
              "name": "Cathedral IV"
            },
            "cathedral_05": {
              "name": "Cathedral V"
            },
            "cathedral_06": {
              "name": "Cathedral VI"
            },
            "harbor_quarter_01": {
              "name": "Harbor Quarter I"
            },
            "harbor_quarter_02": {
              "name": "Harbor Quarter II"
            },
            "harbor_quarter_03": {
              "name": "Harbor Quarter III"
            },
            "harbor_quarter_04": {
              "name": "Harbor Quarter IV"
            },
            "harbor_quarter_05": {
              "name": "Harbor Quarter V"
            },
            "artisan_quarter_01": {
              "name": "Artisan Quarter I"
            },
            "artisan_quarter_02": {
              "name": "Artisan Quarter II"
            },
            "artisan_quarter_03": {
              "name": "Artisan Quarter III"
            },
            "artisan_quarter_04": {
              "name": "Artisan Quarter IV"
            },
            "artisan_quarter_05": {
              "name": "Artisan Quarter V"
            },
            "commons_plaza_01": {
              "name": "Commons Plaza I"
            },
            "commons_plaza_02": {
              "name": "Commons Plaza II"
            },
            "commons_plaza_03": {
              "name": "Commons Plaza III"
            },
            "commons_plaza_04": {
              "name": "Commons Plaza IV"
            },
            "commons_plaza_05": {
              "name": "Commons Plaza V"
            },
            "garden_court_01": {
              "name": "Garden Court I"
            },
            "garden_court_02": {
              "name": "Garden Court II"
            },
            "garden_court_03": {
              "name": "Garden Court III"
            },
            "garden_court_04": {
              "name": "Garden Court IV"
            }
          }
        },
        "grand_medieval_city_canals": {
          "name": "荘厳なる中世都市：水路と港湾",
          "description": "運河と港湾地区が交差する水辺の中世都市区画"
        },
        "grand_medieval_city_hill": {
          "name": "荘厳なる中世都市：城塞丘陵",
          "description": "段丘状に城塞がそびえる丘陵の王城地区"
        },
        "grand_medieval_city_markets": {
          "name": "荘厳なる中世都市：商人ギルド街",
          "description": "ギルド街と市場が格子状に連なる商業区画"
        },
        "blood_vein_catacombs": {
          "name": "血脈の地下納骨堂",
          "description": "脈打つ血管のような通路が絡み合う、鉄錆と瘴気の迷宮。",
          "blocks": {
            "horror_theme_entrance": {
              "name": "血霧の門前"
            },
            "horror_theme_suture": {
              "name": "縫合回廊"
            },
            "horror_theme_bloodlake": {
              "name": "赤沼バシリカ"
            },
            "horror_core_vein": {
              "name": "血脈中枢"
            },
            "horror_core_crypt": {
              "name": "骨の心室"
            },
            "horror_relic_fetish": {
              "name": "血誓の護符"
            }
          },
          "badges": [
            "horror",
            "organic",
            "maze"
          ]
        },
        "shattered_manor": {
          "name": "砕けたゴーストマナー",
          "description": "崩壊した邸宅の残響が漂う、冷たい空間と鋭角な廊下。",
          "blocks": {
            "horror_theme_manor": {
              "name": "幽霊館の奥庭"
            },
            "horror_theme_chapel": {
              "name": "破戒礼拝堂"
            },
            "horror_core_gallery": {
              "name": "歪額の回廊"
            },
            "horror_relic_lantern": {
              "name": "嘆きの提灯"
            },
            "horror_relic_attic": {
              "name": "歪んだ屋根裏箱"
            }
          },
          "badges": [
            "horror",
            "rooms",
            "trap"
          ]
        },
        "midnight_carnival": {
          "name": "真夜中カーニバル跡地",
          "description": "歪んだ観覧輪と仮面の笑い声が残る霧の会場。",
          "blocks": {
            "horror_theme_carnival": {
              "name": "月下カーニバル"
            },
            "horror_theme_voidwheel": {
              "name": "虚空観覧輪"
            },
            "horror_core_stage": {
              "name": "幻影ステージ"
            },
            "horror_core_orbit": {
              "name": "月輪の心核"
            },
            "horror_relic_mask": {
              "name": "笑い哭く仮面"
            },
            "horror_relic_redmoon": {
              "name": "赤月の彗核"
            }
          },
          "badges": [
            "horror",
            "festival",
            "ring"
          ]
        },
        "ashen_asylum": {
          "name": "灰羽の収容院",
          "description": "冷ややかな病棟と格子の廊下が交差する無機質な隔離施設。",
          "blocks": {
            "horror_theme_asylum": {
              "name": "灰羽の隔離棟"
            },
            "horror_core_asylum": {
              "name": "隔離病棟核"
            },
            "horror_relic_feather": {
              "name": "灰羽の束縛枷"
            }
          },
          "badges": [
            "horror",
            "rooms",
            "grid"
          ]
        },
        "phantom_haunted_house": {
          "name": "亡霊の大屋敷",
          "description": "薄暗い紫の廊下と秘密部屋が連なるお化け屋敷。",
          "blocks": {
            "horror_theme_haunt": {
              "name": "怨霊の回廊館"
            },
            "horror_core_haunt": {
              "name": "怨影の心臓"
            },
            "horror_relic_curtain": {
              "name": "幽紫の緞帳"
            }
          },
          "badges": [
            "horror",
            "rooms",
            "haunted"
          ]
        },
        "dusk_graveyard": {
          "name": "薄暮の墓苑",
          "description": "朽ちた墓標と霧の小径が絡む呪われた墓地。",
          "blocks": {
            "horror_theme_graveyard": {
              "name": "朽ち墓の夜園"
            },
            "horror_core_graveyard": {
              "name": "黄昏墓標核"
            },
            "horror_relic_urn": {
              "name": "薄暮の葬灰壺"
            }
          },
          "badges": [
            "horror",
            "outdoor",
            "graveyard"
          ]
        },
        "wailing_mire": {
          "name": "慟哭の泥溜り",
          "description": "水気を帯びた赤い霧が漂う、底無しの沼地迷宮。",
          "blocks": {
            "horror_theme_mire": {
              "name": "泣き淵の沼道"
            },
            "horror_core_mire": {
              "name": "慟哭沼の眼"
            },
            "horror_relic_tear": {
              "name": "慟哭の滴瓶"
            }
          },
          "badges": [
            "horror",
            "organic",
            "swamp"
          ]
        },
        "bell_foundry": {
          "name": "無鳴鐘の鋳造所",
          "description": "血錆に染まった鐘楼と螺旋の足場が続く火葬工房。",
          "blocks": {
            "horror_theme_foundry": {
              "name": "血錆の鋳場"
            },
            "horror_core_foundry": {
              "name": "沈鐘炉心"
            },
            "horror_relic_bell": {
              "name": "静哀の鐘"
            }
          },
          "badges": [
            "horror",
            "industrial",
            "radial"
          ]
        },
        "gallows_spiral": {
          "name": "吊環の大回廊",
          "description": "吊るされた影と螺旋通路が絡む無限回廊。",
          "blocks": {
            "horror_theme_gallows": {
              "name": "連吊り大回廊"
            },
            "horror_core_gallows": {
              "name": "吊環螺旋核"
            },
            "horror_relic_spiral": {
              "name": "螺吊の指輪"
            }
          },
          "badges": [
            "horror",
            "spiral",
            "vertical"
          ]
        },
        "icy_caverns": {
          "name": "氷窟",
          "description": "セルオートマトン平滑化の広間と棚氷",
          "blocks": {
            "frost_theme_01": {
              "name": "Frost Theme I"
            },
            "frost_theme_02": {
              "name": "Frost Theme II"
            },
            "frost_theme_03": {
              "name": "Frost Theme III"
            },
            "frost_theme_04": {
              "name": "Frost Theme IV"
            },
            "frost_theme_05": {
              "name": "Frost Theme V"
            },
            "glacier_01": {
              "name": "Glacier I"
            },
            "glacier_02": {
              "name": "Glacier II"
            },
            "glacier_03": {
              "name": "Glacier III"
            },
            "glacier_04": {
              "name": "Glacier IV"
            },
            "glacier_05": {
              "name": "Glacier V"
            },
            "blizzard_01": {
              "name": "Blizzard I"
            },
            "blizzard_02": {
              "name": "Blizzard II"
            },
            "blizzard_03": {
              "name": "Blizzard III"
            },
            "blizzard_04": {
              "name": "Blizzard IV"
            },
            "blizzard_05": {
              "name": "Blizzard V"
            }
          },
          "badges": [
            "cave",
            "organic"
          ]
        },
        "irradiated_plains": {
          "name": "放射線の平原",
          "description": "毒霧に侵された危険な平原地帯",
          "blocks": {
            "irradiated_theme_01": {
              "name": "Fallout Plains I"
            },
            "irradiated_theme_02": {
              "name": "Fallout Plains II"
            },
            "irradiated_core_01": {
              "name": "Core Fallout"
            },
            "irradiated_relic_01": {
              "name": "Radiant Relic"
            }
          },
          "badges": [
            "field",
            "poison"
          ]
        },
        "lava_caves": {
          "name": "Lava Caves",
          "description": "溶岩地形",
          "blocks": {
            "lava_theme_01": {
              "name": "Lava Theme I"
            },
            "lava_theme_02": {
              "name": "Lava Theme II"
            },
            "lava_theme_03": {
              "name": "Lava Theme III"
            },
            "lava_theme_04": {
              "name": "Lava Theme IV"
            },
            "lava_theme_05": {
              "name": "Lava Theme V"
            },
            "lava_theme_06": {
              "name": "Lava Theme VI"
            },
            "lava_theme_07": {
              "name": "Lava Theme VII"
            },
            "lava_theme_08": {
              "name": "Lava Theme VIII"
            },
            "lava_theme_09": {
              "name": "Lava Theme IX"
            },
            "lava_theme_10": {
              "name": "Lava Theme X"
            },
            "basalt_01": {
              "name": "Basalt I"
            },
            "basalt_02": {
              "name": "Basalt II"
            },
            "basalt_03": {
              "name": "Basalt III"
            },
            "basalt_04": {
              "name": "Basalt IV"
            },
            "basalt_05": {
              "name": "Basalt V"
            },
            "basalt_06": {
              "name": "Basalt VI"
            },
            "basalt_07": {
              "name": "Basalt VII"
            },
            "basalt_08": {
              "name": "Basalt VIII"
            },
            "basalt_09": {
              "name": "Basalt IX"
            },
            "basalt_10": {
              "name": "Basalt X"
            },
            "magma_01": {
              "name": "Magma I"
            },
            "magma_02": {
              "name": "Magma II"
            },
            "magma_03": {
              "name": "Magma III"
            },
            "magma_04": {
              "name": "Magma IV"
            },
            "magma_05": {
              "name": "Magma V"
            },
            "magma_06": {
              "name": "Magma VI"
            },
            "magma_07": {
              "name": "Magma VII"
            },
            "magma_08": {
              "name": "Magma VIII"
            },
            "magma_09": {
              "name": "Magma IX"
            },
            "magma_10": {
              "name": "Magma X"
            }
          },
          "badges": [
            "cave"
          ]
        },
        "luminescent_glade": {
          "name": "光る木立",
          "description": "発光する水たまりが点在する神秘的な木立のダンジョン",
          "blocks": {
            "lumigrove_theme_01": {
              "name": "Glade Theme I"
            },
            "lumigrove_theme_02": {
              "name": "Glade Theme II"
            },
            "lumigrove_theme_03": {
              "name": "Glade Theme III"
            },
            "lumigrove_theme_04": {
              "name": "Glade Theme IV"
            },
            "lumigrove_theme_05": {
              "name": "Glade Theme V"
            },
            "lumigrove_theme_06": {
              "name": "Glade Theme VI"
            },
            "lumigrove_theme_07": {
              "name": "Glade Theme VII"
            },
            "lumigrove_core_01": {
              "name": "Glade Core I"
            },
            "lumigrove_core_02": {
              "name": "Glade Core II"
            },
            "lumigrove_core_03": {
              "name": "Glade Core III"
            },
            "lumigrove_core_04": {
              "name": "Glade Core IV"
            },
            "lumigrove_core_05": {
              "name": "Glade Core V"
            },
            "lumigrove_core_06": {
              "name": "Glade Core VI"
            },
            "lumigrove_core_07": {
              "name": "Glade Core VII"
            },
            "lumigrove_relic_01": {
              "name": "Glade Relic I"
            },
            "lumigrove_relic_02": {
              "name": "Glade Relic II"
            },
            "lumigrove_relic_03": {
              "name": "Glade Relic III"
            },
            "lumigrove_relic_04": {
              "name": "Glade Relic IV"
            },
            "lumigrove_relic_05": {
              "name": "Glade Relic V"
            },
            "lumigrove_relic_06": {
              "name": "Glade Relic VI"
            }
          },
          "badges": [
            "forest",
            "bioluminescent",
            "mystic"
          ]
        },
        "medieval_stronghold": {
          "name": "中世要塞都市",
          "description": "城郭、礼拝堂、市場が彩る中世の要塞都市を生成する。彩り豊かな床や壁で雰囲気を強調。",
          "blocks": {
            "medieval_story_01": {
              "name": "Stronghold Frontier"
            },
            "medieval_story_02": {
              "name": "Stronghold Artery"
            },
            "medieval_story_03": {
              "name": "Stronghold Citadel"
            },
            "medieval_story_04": {
              "name": "Stronghold Crown"
            },
            "medieval_story_05": {
              "name": "Stronghold Heart"
            },
            "medieval_core_01": {
              "name": "Keep Quarter"
            },
            "medieval_core_02": {
              "name": "Noble Quarter"
            },
            "medieval_core_03": {
              "name": "Sacred Quarter"
            },
            "medieval_core_04": {
              "name": "Guild Quarter"
            },
            "medieval_core_05": {
              "name": "Royal Quarter"
            },
            "medieval_relic_01": {
              "name": "Relic Ward"
            },
            "medieval_relic_02": {
              "name": "Banner Ward"
            },
            "medieval_relic_03": {
              "name": "Sanctum Ward"
            },
            "medieval_relic_04": {
              "name": "Knightly Ward"
            },
            "medieval_relic_05": {
              "name": "Dynasty Ward"
            }
          },
          "badges": [
            "castle",
            "city",
            "medieval"
          ]
        },
        "winding_country_road": {
          "name": "Winding Country Road",
          "blocks": {
            "roadways_country_path": {
              "name": "街道探訪"
            },
            "roadways_country_route": {
              "name": "街道縦走"
            },
            "roadways_country_relic": {
              "name": "街道遺構"
            }
          }
        },
        "deep_forest_road": {
          "name": "Deep Forest Road",
          "blocks": {
            "roadways_forest_patrol": {
              "name": "森の街道探訪"
            },
            "roadways_forest_route": {
              "name": "森の街道縦走"
            },
            "roadways_forest_relic": {
              "name": "森の街道遺構"
            }
          }
        },
        "neo_research_atrium": {
          "name": "シンセ研究アトリウム",
          "description": "多層リングと研究ポッドが広がる中枢アトリウム区画。",
          "blocks": {
            "neo-atrium-01": {
              "name": "実験アトリウム基層"
            },
            "neo-atrium-02": {
              "name": "ポッドラボ回廊"
            },
            "neo-atrium-advanced-01": {
              "name": "研究ドーム外郭"
            },
            "neo-atrium-advanced-02": {
              "name": "シンセ循環路"
            },
            "neo-atrium-core": {
              "name": "アトリウム主制御核"
            }
          },
          "badges": [
            "futuristic",
            "research",
            "circular"
          ]
        },
        "neo_circuit_grid": {
          "name": "量子回路グリッド",
          "description": "幾何学的な配線と交差ノードを持つ都市制御層。",
          "blocks": {
            "neo-grid-01": {
              "name": "都市基板グリッド"
            },
            "neo-grid-02": {
              "name": "監視ノード街区"
            },
            "neo-grid-advanced-01": {
              "name": "統合制御街区"
            },
            "neo-grid-advanced-02": {
              "name": "データセンタープラザ"
            },
            "neo-grid-core": {
              "name": "都市管制メッシュ核"
            },
            "neo-grid-overseer": {
              "name": "オーバーシア制御床"
            }
          },
          "badges": [
            "urban",
            "lab",
            "grid"
          ]
        },
        "neo_skyrail_tiered": {
          "name": "階層スカイレール",
          "description": "空中回廊と垂直連絡路が縦横に走る都市交通層。",
          "blocks": {
            "neo-skyrail-01": {
              "name": "スカイレール回廊"
            },
            "neo-skyrail-02": {
              "name": "昇降連絡棟"
            },
            "neo-skyrail-advanced-01": {
              "name": "上層トランジット網"
            },
            "neo-skyrail-advanced-02": {
              "name": "ヘリックス連絡橋"
            },
            "neo-skyrail-core": {
              "name": "スカイレール統括塔"
            }
          },
          "badges": [
            "transport",
            "future",
            "open"
          ]
        },
        "neo_quantum_helix": {
          "name": "量子螺旋試験場",
          "description": "螺旋加速路と収束ノードが絡み合う実験施設。",
          "blocks": {
            "neo-helix-01": {
              "name": "螺旋試験フロア"
            },
            "neo-helix-advanced-01": {
              "name": "量子束縛回廊"
            },
            "neo-helix-advanced-02": {
              "name": "収束パルサーハブ"
            },
            "neo-helix-core": {
              "name": "量子螺旋炉心"
            },
            "neo-helix-singularity": {
              "name": "シンギュラリティ観測室"
            }
          },
          "badges": [
            "research",
            "quantum",
            "dynamic"
          ]
        },
        "neo_biodome_cascade": {
          "name": "バイオドームカスケード",
          "description": "バイオ球体と生態廊が連なる多段アトリウム。",
          "blocks": {
            "neo-biodome-01": {
              "name": "バイオアトリウム層"
            },
            "neo-biodome-02": {
              "name": "生態観測廊"
            },
            "neo-biodome-advanced-01": {
              "name": "生態連結庭園"
            },
            "neo-biodome-core": {
              "name": "バイオドーム母艦"
            },
            "neo-biodome-warden": {
              "name": "遺伝子監視核"
            }
          },
          "badges": [
            "bio",
            "garden",
            "future"
          ]
        },
        "neo_coolant_vault": {
          "name": "冷却コア金庫",
          "description": "複合制御層と冷却プールを備えた地下保守区画。",
          "blocks": {
            "neo-coolant-01": {
              "name": "冷却整備区画"
            },
            "neo-coolant-advanced-01": {
              "name": "冷却配管制御層"
            },
            "neo-coolant-core": {
              "name": "冷却封鎖コア"
            },
            "neo-coolant-reactor": {
              "name": "冷却炉心制御座"
            }
          },
          "badges": [
            "industrial",
            "maintenance",
            "lab"
          ]
        },
        "neo_holo_district": {
          "name": "ホロシティ中枢",
          "description": "ホログラム広場と多角コアが点在する都市核。",
          "blocks": {
            "neo-holo-01": {
              "name": "ホロシティ遊歩"
            },
            "neo-holo-02": {
              "name": "投影交差コンコース"
            },
            "neo-holo-advanced-01": {
              "name": "ホログラム展望区"
            },
            "neo-holo-advanced-02": {
              "name": "多角プラザ制御核"
            },
            "neo-holo-core": {
              "name": "ホロシティ統合核"
            },
            "neo-holo-prism": {
              "name": "ホロプリズム神殿"
            }
          },
          "badges": [
            "urban",
            "hologram",
            "future"
          ]
        },
        "oneway_labyrinth": {
          "name": "矢印迷宮",
          "description": "一方通行の回廊が重なり合う複雑な迷宮",
          "blocks": {
            "oneway_labyrinth_a": {
              "name": "矢印回廊"
            },
            "oneway_labyrinth_b": {
              "name": "交差広間"
            },
            "oneway_labyrinth_core": {
              "name": "迷いの核"
            },
            "oneway_labyrinth_boss": {
              "name": "終端円環"
            }
          },
          "badges": [
            "labyrinth",
            "hazard"
          ]
        },
        "overgrown_ruins": {
          "name": "蔦覆遺跡",
          "description": "部屋主体＋蔦のような追加回廊でループが多い遺跡",
          "blocks": {
            "ruin_theme_01": {
              "name": "Ruin Theme I"
            },
            "ruin_theme_02": {
              "name": "Ruin Theme II"
            },
            "ruin_theme_03": {
              "name": "Ruin Theme III"
            },
            "ruin_theme_04": {
              "name": "Ruin Theme IV"
            },
            "ruin_theme_05": {
              "name": "Ruin Theme V"
            },
            "ivy_01": {
              "name": "Ivy I"
            },
            "ivy_02": {
              "name": "Ivy II"
            },
            "ivy_03": {
              "name": "Ivy III"
            },
            "ivy_04": {
              "name": "Ivy IV"
            },
            "ivy_05": {
              "name": "Ivy V"
            },
            "idol_01": {
              "name": "Idol I"
            },
            "idol_02": {
              "name": "Idol II"
            },
            "idol_03": {
              "name": "Idol III"
            },
            "idol_04": {
              "name": "Idol IV"
            },
            "idol_05": {
              "name": "Idol V"
            }
          },
          "badges": [
            "rooms"
          ]
        },
        "paddy_field_paths": {
          "name": "田園あぜ道",
          "description": "黄緑の田んぼと茶色のあぜ道、水色の水路が格子状に広がる農村の景観",
          "blocks": {
            "paddy_paths_theme_01": {
              "name": "Paddy Paths Theme I"
            },
            "paddy_paths_theme_02": {
              "name": "Paddy Paths Theme II"
            },
            "paddy_paths_theme_03": {
              "name": "Paddy Paths Theme III"
            },
            "paddy_paths_theme_04": {
              "name": "Paddy Paths Theme IV"
            },
            "paddy_paths_theme_05": {
              "name": "Paddy Paths Theme V"
            },
            "paddy_paths_core_01": {
              "name": "Paddy Paths Core I"
            },
            "paddy_paths_core_02": {
              "name": "Paddy Paths Core II"
            },
            "paddy_paths_core_03": {
              "name": "Paddy Paths Core III"
            },
            "paddy_paths_core_04": {
              "name": "Paddy Paths Core IV"
            },
            "paddy_paths_core_05": {
              "name": "Paddy Paths Core V"
            },
            "paddy_paths_relic_01": {
              "name": "Paddy Paths Relic I"
            },
            "paddy_paths_relic_02": {
              "name": "Paddy Paths Relic II"
            },
            "paddy_paths_relic_03": {
              "name": "Paddy Paths Relic III"
            },
            "paddy_paths_relic_04": {
              "name": "Paddy Paths Relic IV"
            },
            "paddy_paths_relic_05": {
              "name": "Paddy Paths Relic V"
            }
          },
          "badges": [
            "field",
            "agriculture",
            "rural"
          ]
        },
        "toxic_boglands": {
          "name": "毒沼空間",
          "description": "広い空間に点在する毒沼が漂う湿地帯",
          "blocks": {
            "bog_theme_01": {
              "name": "Bog Theme I"
            },
            "bog_theme_02": {
              "name": "Bog Theme II"
            },
            "bog_theme_03": {
              "name": "Bog Theme III"
            },
            "bog_theme_04": {
              "name": "Bog Theme IV"
            },
            "bog_theme_05": {
              "name": "Bog Theme V"
            },
            "bog_core_01": {
              "name": "Bog Core I"
            },
            "bog_core_02": {
              "name": "Bog Core II"
            },
            "bog_core_03": {
              "name": "Bog Core III"
            },
            "bog_core_04": {
              "name": "Bog Core IV"
            },
            "bog_core_05": {
              "name": "Bog Core V"
            },
            "bog_relic_01": {
              "name": "Bog Relic I"
            },
            "bog_relic_02": {
              "name": "Bog Relic II"
            },
            "bog_relic_03": {
              "name": "Bog Relic III"
            },
            "bog_relic_04": {
              "name": "Bog Relic IV"
            },
            "bog_relic_05": {
              "name": "Bog Relic V"
            }
          },
          "badges": [
            "open-space",
            "poison"
          ]
        },
        "prismatic_stalactites": {
          "name": "虹晶鍾乳洞",
          "description": "虹彩の鍾乳石が連なる光屈折の洞窟",
          "blocks": {
            "prism_stal_theme_01": {
              "name": "Prism Stalactites I"
            },
            "prism_stal_theme_02": {
              "name": "Prism Stalactites II"
            },
            "prism_stal_theme_03": {
              "name": "Prism Stalactites III"
            },
            "prism_stal_theme_04": {
              "name": "Prism Stalactites IV"
            },
            "prism_core_01": {
              "name": "Prism Core I"
            },
            "prism_core_02": {
              "name": "Prism Core II"
            },
            "prism_core_03": {
              "name": "Prism Core III"
            },
            "prism_core_04": {
              "name": "Prism Core IV"
            },
            "prism_relic_01": {
              "name": "Prism Relic I"
            },
            "prism_relic_02": {
              "name": "Prism Relic II"
            },
            "prism_relic_03": {
              "name": "Prism Relic III"
            }
          },
          "badges": [
            "cave",
            "crystal",
            "light"
          ]
        },
        "retro_overworld": {
          "name": "レトロ風フィールドマップ",
          "description": "大陸や島々、橋や街道が広がる往年のJRPGフィールド風地形",
          "blocks": {
            "retro_overworld_01": {
              "name": "Retro Overworld I"
            },
            "retro_overworld_02": {
              "name": "Retro Overworld II"
            },
            "retro_overworld_03": {
              "name": "Retro Overworld III"
            },
            "retro_overworld_04": {
              "name": "Retro Overworld IV"
            },
            "retro_overworld_05": {
              "name": "Retro Overworld V"
            },
            "retro_overworld_core_01": {
              "name": "Retro Overworld Core I"
            },
            "retro_overworld_core_02": {
              "name": "Retro Overworld Core II"
            },
            "retro_overworld_core_03": {
              "name": "Retro Overworld Core III"
            },
            "retro_overworld_core_04": {
              "name": "Retro Overworld Core IV"
            },
            "retro_overworld_core_05": {
              "name": "Retro Overworld Core V"
            },
            "retro_overworld_relic_01": {
              "name": "Retro Overworld Relic I"
            },
            "retro_overworld_relic_02": {
              "name": "Retro Overworld Relic II"
            },
            "retro_overworld_relic_03": {
              "name": "Retro Overworld Relic III"
            },
            "retro_overworld_relic_04": {
              "name": "Retro Overworld Relic IV"
            },
            "retro_overworld_relic_05": {
              "name": "Retro Overworld Relic V"
            }
          },
          "badges": [
            "field",
            "overworld",
            "retro",
            "biome"
          ]
        },
        "ring_city": {
          "name": "環都市",
          "description": "同心円の街路と放射状の道",
          "blocks": {
            "ring_theme_01": {
              "name": "Ring Theme I"
            },
            "ring_theme_02": {
              "name": "Ring Theme II"
            },
            "ring_theme_03": {
              "name": "Ring Theme III"
            },
            "ring_theme_04": {
              "name": "Ring Theme IV"
            },
            "ring_theme_05": {
              "name": "Ring Theme V"
            },
            "spokes_01": {
              "name": "Spokes I"
            },
            "spokes_02": {
              "name": "Spokes II"
            },
            "spokes_03": {
              "name": "Spokes III"
            },
            "spokes_04": {
              "name": "Spokes IV"
            },
            "spokes_05": {
              "name": "Spokes V"
            },
            "citadel_01": {
              "name": "Citadel I"
            },
            "citadel_02": {
              "name": "Citadel II"
            },
            "citadel_03": {
              "name": "Citadel III"
            },
            "citadel_04": {
              "name": "Citadel IV"
            },
            "citadel_05": {
              "name": "Citadel V"
            }
          },
          "badges": [
            "structured",
            "rooms"
          ]
        },
        "ruined_labyrinth": {
          "name": "遺跡迷宮",
          "description": "迷路の壁が崩れ、所々で大きく開いた遺跡の迷宮",
          "blocks": {
            "ruined_lab_theme_01": {
              "name": "Ruined Labyrinth I"
            },
            "ruined_lab_theme_02": {
              "name": "Ruined Labyrinth II"
            },
            "ruined_lab_theme_03": {
              "name": "Ruined Labyrinth III"
            },
            "ruined_lab_theme_04": {
              "name": "Ruined Labyrinth IV"
            },
            "ruined_lab_theme_05": {
              "name": "Ruined Labyrinth V"
            },
            "ruined_lab_core_01": {
              "name": "Ruined Core I"
            },
            "ruined_lab_core_02": {
              "name": "Ruined Core II"
            },
            "ruined_lab_core_03": {
              "name": "Ruined Core III"
            },
            "ruined_lab_core_04": {
              "name": "Ruined Core IV"
            },
            "ruined_lab_core_05": {
              "name": "Ruined Core V"
            },
            "ruined_lab_relic_01": {
              "name": "Ancient Relic I"
            },
            "ruined_lab_relic_02": {
              "name": "Ancient Relic II"
            },
            "ruined_lab_relic_03": {
              "name": "Ancient Relic III"
            },
            "ruined_lab_relic_04": {
              "name": "Ancient Relic IV"
            },
            "ruined_lab_relic_05": {
              "name": "Ancient Relic V"
            }
          },
          "badges": [
            "maze",
            "ruins"
          ]
        },
        "sandstorm_dunes": {
          "name": "砂嵐の砂漠",
          "description": "砂嵐で視界が閉ざされた灼熱の砂漠地帯",
          "blocks": {
            "sandstorm_theme_01": {
              "name": "Sandstorm Theme I"
            },
            "sandstorm_theme_02": {
              "name": "Sandstorm Theme II"
            },
            "sandstorm_core_01": {
              "name": "Dune Core"
            },
            "sandstorm_relic_01": {
              "name": "Storm Eye Relic"
            }
          },
          "badges": [
            "field",
            "desert",
            "dark"
          ]
        },
        "serpentine_river": {
          "name": "蛇行河",
          "description": "蛇行する本流と分流の回廊",
          "blocks": {
            "river_theme_01": {
              "name": "River Theme I"
            },
            "river_theme_02": {
              "name": "River Theme II"
            },
            "river_theme_03": {
              "name": "River Theme III"
            },
            "river_theme_04": {
              "name": "River Theme IV"
            },
            "river_theme_05": {
              "name": "River Theme V"
            },
            "delta_01": {
              "name": "Delta I"
            },
            "delta_02": {
              "name": "Delta II"
            },
            "delta_03": {
              "name": "Delta III"
            },
            "delta_04": {
              "name": "Delta IV"
            },
            "delta_05": {
              "name": "Delta V"
            },
            "serpent_01": {
              "name": "Serpent I"
            },
            "serpent_02": {
              "name": "Serpent II"
            },
            "serpent_03": {
              "name": "Serpent III"
            },
            "serpent_04": {
              "name": "Serpent IV"
            },
            "serpent_05": {
              "name": "Serpent V"
            }
          },
          "badges": [
            "snake",
            "corridor"
          ]
        },
        "spaceship_core": {
          "name": "Spaceship Core",
          "blocks": {
            "sf-reactor-floor": {
              "name": "プラズマ反応床"
            },
            "sf-magnetic-wall": {
              "name": "磁束壁板"
            },
            "sf-reactor-heart": {
              "name": "炉心安定床"
            }
          }
        },
        "spaceship_hab": {
          "name": "Spaceship Hab",
          "blocks": {
            "sf-hab-garden": {
              "name": "ハイドロポニクス床"
            }
          }
        },
        "spaceship_ai": {
          "name": "Spaceship Ai",
          "blocks": {
            "sf-ai-server": {
              "name": "AIサーバーパネル"
            },
            "sf-ai-overmind": {
              "name": "オーバーマインド核"
            }
          }
        },
        "cyber_grid": {
          "name": "Cyber Grid",
          "blocks": {
            "sf-grid-node": {
              "name": "グリッドノード床"
            }
          }
        },
        "cyber_vault": {
          "name": "Cyber Vault",
          "blocks": {
            "sf-firewall-wall": {
              "name": "ファイアウォール壁"
            },
            "sf-cyber-cache": {
              "name": "データキャッシュ床"
            },
            "sf-data-spike": {
              "name": "データスパイク"
            },
            "sf-vault-guardian": {
              "name": "ICEガーディアン床"
            }
          }
        },
        "cyber_glitch": {
          "name": "Cyber Glitch",
          "blocks": {
            "sf-glitch-tile": {
              "name": "グリッチタイル"
            },
            "sf-glitch-singularity": {
              "name": "グリッチ特異点"
            }
          }
        },
        "cyber_stream": {
          "name": "Cyber Stream",
          "blocks": {
            "sf-stream-bridge": {
              "name": "信号橋梁"
            },
            "sf-cyber-wave": {
              "name": "波形パネル壁"
            },
            "sf-cyber-cascade": {
              "name": "情報カスケード床"
            }
          }
        },
        "future_plaza": {
          "name": "Future Plaza",
          "blocks": {
            "sf-plaza-holo": {
              "name": "ホログラム床"
            },
            "sf-plaza-crown": {
              "name": "王冠ホロ床"
            }
          }
        },
        "future_industrial": {
          "name": "Future Industrial",
          "blocks": {
            "sf-industrial-conveyor": {
              "name": "メガライン床"
            },
            "sf-industrial-forge": {
              "name": "星鋳炉床"
            }
          }
        },
        "future_sky": {
          "name": "Future Sky",
          "blocks": {
            "sf-sky-lift": {
              "name": "垂直リフト床"
            },
            "sf-future-aero": {
              "name": "エアロバリア壁"
            },
            "sf-sky-zenith": {
              "name": "ゼニス浮遊床"
            }
          }
        },
        "future_core": {
          "name": "Future Core",
          "blocks": {
            "sf-core-glass": {
              "name": "強化監視壁"
            },
            "sf-future-transit": {
              "name": "リニアトランジット床"
            },
            "sf-laser-grid": {
              "name": "レーザーグリッド罠"
            }
          }
        },
        "spaceship_medbay": {
          "name": "Spaceship Medbay",
          "blocks": {
            "sf-medbay-sterile": {
              "name": "無菌メディカル床"
            },
            "sf-medbay-overseer": {
              "name": "メディカル監督核"
            }
          }
        },
        "spaceship_engineering": {
          "name": "Spaceship Engineering",
          "blocks": {
            "sf-engineering-grate": {
              "name": "エンジニアリンググレーチング"
            },
            "sf-engineering-core": {
              "name": "エンジン制御心核"
            }
          }
        },
        "cyber_forum": {
          "name": "Cyber Forum",
          "blocks": {
            "sf-forum-stage": {
              "name": "ソーシャルホール舞台床"
            },
            "sf-forum-oracle": {
              "name": "フォーラムオラクル床"
            }
          }
        },
        "cyber_subroutine": {
          "name": "Cyber Subroutine",
          "blocks": {
            "sf-subroutine-panel": {
              "name": "サブルーチン診断床"
            },
            "sf-subroutine-kernel": {
              "name": "サブルーチン核壁"
            }
          }
        },
        "future_residential": {
          "name": "Future Residential",
          "blocks": {
            "sf-residential-terrace": {
              "name": "テラスフロア"
            }
          }
        },
        "future_underworks": {
          "name": "Future Underworks",
          "blocks": {
            "sf-underworks-catwalk": {
              "name": "アンダーワークス猫歩き床"
            }
          }
        },
        "xeno_jungle": {
          "name": "Xeno Jungle",
          "blocks": {
            "sf-xeno-jungle-floor": {
              "name": "バイオルミ床板"
            },
            "sf-bio-spore": {
              "name": "胞子散布床"
            }
          }
        },
        "colony_commons": {
          "name": "Colony Commons",
          "blocks": {
            "sf-colony-commons-floor": {
              "name": "コモンズ共有床"
            }
          }
        },
        "spaceship_warp": {
          "name": "Spaceship Warp",
          "blocks": {
            "sf-warp-pad": {
              "name": "ワープパッド床"
            },
            "sf-warp-conduit": {
              "name": "ワープ導管柱"
            },
            "sf-warp-singularity": {
              "name": "ワープ特異核"
            }
          }
        },
        "spaceship_observatory": {
          "name": "Spaceship Observatory",
          "blocks": {
            "sf-observatory-plate": {
              "name": "観測ドーム床板"
            },
            "sf-observatory-array": {
              "name": "観測アレイ床"
            },
            "sf-observatory-core": {
              "name": "観測中枢核"
            }
          }
        },
        "cyber_arena": {
          "name": "Cyber Arena",
          "blocks": {
            "sf-arena-track": {
              "name": "アリーナトラック床"
            },
            "sf-arena-barrier": {
              "name": "アリーナ障壁"
            },
            "sf-arena-champion": {
              "name": "アリーナチャンピオン床"
            }
          }
        },
        "cyber_mirror": {
          "name": "Cyber Mirror",
          "blocks": {
            "sf-mirror-panel": {
              "name": "ミラーパネル壁"
            },
            "sf-mirror-spire": {
              "name": "ミラースパイア"
            },
            "sf-mirror-overseer": {
              "name": "ミラーオーバーシア壁"
            }
          }
        },
        "future_metro": {
          "name": "Future Metro",
          "blocks": {
            "sf-metro-strut": {
              "name": "メトロ支持梁"
            },
            "sf-metro-switch": {
              "name": "メトロ分岐床"
            },
            "sf-metro-command": {
              "name": "メトロ司令床"
            }
          }
        },
        "future_cloudport": {
          "name": "Future Cloudport",
          "blocks": {
            "sf-cloud-dock-floor": {
              "name": "クラウドドック床"
            },
            "sf-cloud-anchor": {
              "name": "浮遊アンカー"
            },
            "sf-cloud-throne": {
              "name": "クラウドスローン床"
            }
          }
        },
        "orbital_scrapyard": {
          "name": "Orbital Scrapyard",
          "blocks": {
            "sf-scrap-plating": {
              "name": "スクラップ装甲板"
            },
            "sf-scrap-gantry": {
              "name": "スクラップガントリー"
            },
            "sf-scrap-overseer": {
              "name": "スクラップ監督核"
            }
          }
        },
        "orbital_listening": {
          "name": "Orbital Listening",
          "blocks": {
            "sf-listening-array": {
              "name": "リスニングアレイ床"
            },
            "sf-listening-dish": {
              "name": "傍受ディッシュ"
            },
            "sf-listening-core": {
              "name": "リスニング中枢"
            }
          }
        },
        "xeno_reef": {
          "name": "Xeno Reef",
          "blocks": {
            "sf-reef-trellis": {
              "name": "リーフトレリス床"
            },
            "sf-reef-bloom": {
              "name": "リーフブルーム"
            },
            "sf-reef-titan": {
              "name": "リーフタイタン床"
            }
          }
        },
        "xeno_hive": {
          "name": "Xeno Hive",
          "blocks": {
            "sf-hive-pith": {
              "name": "ハイブピス床"
            },
            "sf-hive-resonator": {
              "name": "ハイブレゾネーター"
            },
            "sf-hive-queen": {
              "name": "ハイブクイーン床"
            }
          }
        },
        "colony_arcology": {
          "name": "Colony Arcology",
          "blocks": {
            "sf-arcology-floor": {
              "name": "アーコロジーフロア"
            },
            "sf-arcology-bridge": {
              "name": "アーコロジーブリッジ"
            },
            "sf-arcology-nexus": {
              "name": "アーコロジーネクサス"
            }
          }
        },
        "colony_vault": {
          "name": "Colony Vault",
          "blocks": {
            "sf-vault-plate": {
              "name": "備蓄庫床板"
            },
            "sf-vault-lockdown": {
              "name": "ロックダウン装置"
            },
            "sf-vault-command": {
              "name": "備蓄指令核"
            }
          }
        },
        "orbital_ring": {
          "name": "Orbital Ring",
          "blocks": {
            "sf-orbit-ring-floor": {
              "name": "軌道リング床"
            },
            "sf-orbit-solar": {
              "name": "ソーラー壁板"
            },
            "sf-gravity-inverter": {
              "name": "重力反転装置"
            }
          }
        },
        "orbital_lab": {
          "name": "Orbital Lab",
          "blocks": {
            "sf-orbit-lab": {
              "name": "零G実験床"
            },
            "sf-orbit-null": {
              "name": "無重力制御床"
            }
          }
        },
        "orbital_armory": {
          "name": "Orbital Armory",
          "blocks": {
            "sf-orbit-armory": {
              "name": "反応装甲床"
            },
            "sf-orbit-guardian": {
              "name": "軌道防衛壁"
            }
          }
        },
        "quantum_reactor": {
          "name": "Quantum Reactor",
          "blocks": {
            "sf-quantum-column": {
              "name": "量子束柱"
            },
            "sf-quantum-phasewall": {
              "name": "位相壁"
            },
            "sf-quantum-core": {
              "name": "量子核床"
            }
          }
        },
        "quantum_archive": {
          "name": "Quantum Archive",
          "blocks": {
            "sf-quantum-archive": {
              "name": "時間結晶棚"
            }
          }
        },
        "quantum_void": {
          "name": "Quantum Void",
          "blocks": {
            "sf-quantum-anchor": {
              "name": "次元アンカー"
            },
            "sf-quantum-rift": {
              "name": "量子リフト裂け目"
            },
            "sf-quantum-horizon": {
              "name": "地平遮蔽壁"
            }
          }
        },
        "orbital_greenhouse": {
          "name": "Orbital Greenhouse",
          "blocks": {
            "sf-greenhouse-canopy": {
              "name": "温室キャノピー床"
            }
          }
        },
        "orbital_command": {
          "name": "Orbital Command",
          "blocks": {
            "sf-command-console": {
              "name": "指令コンソール壁"
            }
          }
        },
        "quantum_prism": {
          "name": "Quantum Prism",
          "blocks": {
            "sf-quantum-prism": {
              "name": "プリズム導光床"
            }
          }
        },
        "chrono_station": {
          "name": "Chrono Station",
          "blocks": {
            "sf-chrono-platform": {
              "name": "時間駅プラットフォーム"
            }
          }
        },
        "chrono_loop": {
          "name": "Chrono Loop",
          "blocks": {
            "sf-loop-gate": {
              "name": "ループゲート壁"
            },
            "sf-temporal-loop": {
              "name": "時間ループ罠"
            },
            "sf-chrono-paradox": {
              "name": "パラドックス交差床"
            }
          }
        },
        "xeno_crystal": {
          "name": "Xeno Crystal",
          "blocks": {
            "sf-xeno-crystal-spire": {
              "name": "結晶尖塔床"
            },
            "sf-crystal-resonator": {
              "name": "結晶レゾネーター"
            }
          }
        },
        "xeno_ruins": {
          "name": "Xeno Ruins",
          "blocks": {
            "sf-xeno-ruins-pillar": {
              "name": "遺跡支柱壁"
            },
            "sf-xeno-elder": {
              "name": "異星守護床"
            }
          }
        },
        "colony_foundry": {
          "name": "Colony Foundry",
          "blocks": {
            "sf-colony-foundry-crane": {
              "name": "鋳造クレーン床"
            },
            "sf-nanite-surge": {
              "name": "ナナイトサージ"
            }
          }
        },
        "quantum_flux": {
          "name": "Quantum Flux",
          "blocks": {
            "sf-flux-ribbon": {
              "name": "フラックスリボン床"
            },
            "sf-flux-heart": {
              "name": "フラックス心核"
            }
          }
        },
        "chrono_archive": {
          "name": "Chrono Archive",
          "blocks": {
            "sf-chrono-weave": {
              "name": "クロノ織路"
            },
            "sf-chrono-vault": {
              "name": "クロノヴォールト床"
            }
          }
        },
        "chrono_fracture": {
          "name": "Chrono Fracture",
          "blocks": {
            "sf-fracture-gate": {
              "name": "断層ゲート"
            },
            "sf-fracture-core": {
              "name": "断層中核"
            }
          }
        },
        "xeno_tide": {
          "name": "Xeno Tide",
          "blocks": {
            "sf-xeno-maelstrom": {
              "name": "潮汐メイルストロム床"
            }
          }
        },
        "colony_reactor": {
          "name": "Colony Reactor",
          "blocks": {
            "sf-colony-reactor-heart": {
              "name": "コロニー炉心核"
            }
          }
        },
        "skyrim_legends": {
          "name": "Skyrim Legends",
          "blocks": {
            "skyrim_saga_01": {
              "name": "ノルドの伝承 I"
            },
            "skyrim_saga_02": {
              "name": "ノルドの伝承 II"
            },
            "skyrim_saga_03": {
              "name": "ノルドの伝承 III"
            },
            "skyrim_saga_04": {
              "name": "ノルドの伝承 IV"
            },
            "skyrim_saga_05": {
              "name": "ノルドの伝承 V"
            },
            "skyrim_saga_06": {
              "name": "ノルドの伝承 VI"
            },
            "skyrim_saga_07": {
              "name": "ノルドの伝承 VII"
            },
            "skyrim_saga_08": {
              "name": "ノルドの伝承 VIII"
            },
            "skyrim_saga_09": {
              "name": "ノルドの伝承 IX"
            },
            "skyrim_saga_10": {
              "name": "ノルドの伝承 X"
            },
            "skyrim_saga_11": {
              "name": "ノルドの伝承 XI"
            },
            "skyrim_saga_12": {
              "name": "ノルドの伝承 XII"
            },
            "skyrim_trial_01": {
              "name": "氷刃の試練 I"
            },
            "skyrim_trial_02": {
              "name": "氷刃の試練 II"
            },
            "skyrim_trial_03": {
              "name": "氷刃の試練 III"
            },
            "skyrim_trial_04": {
              "name": "氷刃の試練 IV"
            },
            "skyrim_trial_05": {
              "name": "氷刃の試練 V"
            },
            "skyrim_trial_06": {
              "name": "氷刃の試練 VI"
            },
            "skyrim_trial_07": {
              "name": "氷刃の試練 VII"
            },
            "skyrim_trial_08": {
              "name": "氷刃の試練 VIII"
            },
            "skyrim_trial_09": {
              "name": "氷刃の試練 IX"
            },
            "skyrim_relic_01": {
              "name": "古代ノルドの遺宝 I"
            },
            "skyrim_relic_02": {
              "name": "古代ノルドの遺宝 II"
            },
            "skyrim_relic_03": {
              "name": "古代ノルドの遺宝 III"
            },
            "skyrim_relic_04": {
              "name": "古代ノルドの遺宝 IV"
            },
            "skyrim_relic_05": {
              "name": "古代ノルドの遺宝 V"
            },
            "skyrim_relic_06": {
              "name": "古代ノルドの遺宝 VI"
            },
            "skyrim_relic_07": {
              "name": "古代ノルドの遺宝 VII"
            },
            "skyrim_relic_08": {
              "name": "古代ノルドの遺宝 VIII"
            },
            "skyrim_relic_09": {
              "name": "古代ノルドの遺宝 IX"
            }
          }
        },
        "skyrim_legends_gauntlet": {
          "name": "Skyrim Legends Gauntlet",
          "blocks": {
            "skyrim_gauntlet_01": {
              "name": "熔鋼の防衛線 I"
            },
            "skyrim_gauntlet_02": {
              "name": "熔鋼の防衛線 II"
            },
            "skyrim_gauntlet_03": {
              "name": "熔鋼の防衛線 III"
            },
            "skyrim_gauntlet_04": {
              "name": "熔鋼の防衛線 IV"
            },
            "skyrim_gauntlet_05": {
              "name": "熔鋼の防衛線 V"
            },
            "skyrim_gauntlet_06": {
              "name": "熔鋼の防衛線 VI"
            }
          }
        },
        "skyrim_legends_pilgrimage": {
          "name": "Skyrim Legends Pilgrimage",
          "blocks": {
            "skyrim_pilgrimage_01": {
              "name": "霜露の巡礼 I"
            },
            "skyrim_pilgrimage_02": {
              "name": "霜露の巡礼 II"
            },
            "skyrim_pilgrimage_03": {
              "name": "霜露の巡礼 III"
            },
            "skyrim_pilgrimage_04": {
              "name": "霜露の巡礼 IV"
            },
            "skyrim_pilgrimage_05": {
              "name": "霜露の巡礼 V"
            },
            "skyrim_pilgrimage_06": {
              "name": "霜露の巡礼 VI"
            }
          }
        },
        "skyrim_legends_siege": {
          "name": "Skyrim Legends Siege",
          "blocks": {
            "skyrim_siege_01": {
              "name": "氷砦の攻城 I"
            },
            "skyrim_siege_02": {
              "name": "氷砦の攻城 II"
            },
            "skyrim_siege_03": {
              "name": "氷砦の攻城 III"
            },
            "skyrim_siege_04": {
              "name": "氷砦の攻城 IV"
            },
            "skyrim_siege_05": {
              "name": "氷砦の攻城 V"
            },
            "skyrim_siege_06": {
              "name": "氷砦の攻城 VI"
            }
          }
        },
        "skyrim_legends_aurora": {
          "name": "Skyrim Legends Aurora",
          "blocks": {
            "skyrim_aurora_01": {
              "name": "極光幻想 I"
            },
            "skyrim_aurora_02": {
              "name": "極光幻想 II"
            },
            "skyrim_aurora_03": {
              "name": "極光幻想 III"
            },
            "skyrim_aurora_04": {
              "name": "極光幻想 IV"
            },
            "skyrim_aurora_05": {
              "name": "極光幻想 V"
            },
            "skyrim_aurora_06": {
              "name": "極光幻想 VI"
            }
          }
        },
        "skyrim_legends_deepdelve": {
          "name": "Skyrim Legends Deepdelve",
          "blocks": {
            "skyrim_deepdelve_01": {
              "name": "鍛冶の深淵 I"
            },
            "skyrim_deepdelve_02": {
              "name": "鍛冶の深淵 II"
            },
            "skyrim_deepdelve_03": {
              "name": "鍛冶の深淵 III"
            },
            "skyrim_deepdelve_04": {
              "name": "鍛冶の深淵 IV"
            },
            "skyrim_deepdelve_05": {
              "name": "鍛冶の深淵 V"
            },
            "skyrim_deepdelve_06": {
              "name": "鍛冶の深淵 VI"
            }
          }
        },
        "skyrim_legends_barrowmarch": {
          "name": "Skyrim Legends Barrowmarch",
          "blocks": {
            "skyrim_barrow_01": {
              "name": "古墳の夜行 I"
            },
            "skyrim_barrow_02": {
              "name": "古墳の夜行 II"
            },
            "skyrim_barrow_03": {
              "name": "古墳の夜行 III"
            },
            "skyrim_barrow_04": {
              "name": "古墳の夜行 IV"
            },
            "skyrim_barrow_05": {
              "name": "古墳の夜行 V"
            },
            "skyrim_barrow_06": {
              "name": "古墳の夜行 VI"
            }
          }
        },
        "skyrim_legends_blizzardwatch": {
          "name": "Skyrim Legends Blizzardwatch",
          "blocks": {
            "skyrim_blizzard_01": {
              "name": "吹雪の監視線 I"
            },
            "skyrim_blizzard_02": {
              "name": "吹雪の監視線 II"
            },
            "skyrim_blizzard_03": {
              "name": "吹雪の監視線 III"
            },
            "skyrim_blizzard_04": {
              "name": "吹雪の監視線 IV"
            },
            "skyrim_blizzard_05": {
              "name": "吹雪の監視線 V"
            },
            "skyrim_blizzard_06": {
              "name": "吹雪の監視線 VI"
            }
          }
        },
        "skyward_bastions": {
          "name": "天空の砦",
          "description": "浮遊島と氷の橋で構成された空中要塞",
          "blocks": {
            "skyward_theme_01": {
              "name": "Skyward Theme I"
            },
            "skyward_theme_02": {
              "name": "Skyward Theme II"
            },
            "skyward_theme_03": {
              "name": "Skyward Theme III"
            },
            "skyward_theme_04": {
              "name": "Skyward Theme IV"
            },
            "skyward_theme_05": {
              "name": "Skyward Theme V"
            },
            "bastion_core_01": {
              "name": "Bastion Core I"
            },
            "bastion_core_02": {
              "name": "Bastion Core II"
            },
            "bastion_core_03": {
              "name": "Bastion Core III"
            },
            "bastion_core_04": {
              "name": "Bastion Core IV"
            },
            "bastion_core_05": {
              "name": "Bastion Core V"
            },
            "airy_relic_01": {
              "name": "Airy Relic I"
            },
            "airy_relic_02": {
              "name": "Airy Relic II"
            },
            "airy_relic_03": {
              "name": "Airy Relic III"
            },
            "airy_relic_04": {
              "name": "Airy Relic IV"
            },
            "airy_relic_05": {
              "name": "Airy Relic V"
            }
          },
          "badges": [
            "void",
            "bridge",
            "ice"
          ]
        },
        "starlit_canopy": {
          "name": "星影樹海",
          "description": "夜空の星々が照らす高木の樹海",
          "blocks": {
            "starlit_theme_01": {
              "name": "Canopy Theme I"
            },
            "starlit_theme_02": {
              "name": "Canopy Theme II"
            },
            "starlit_theme_03": {
              "name": "Canopy Theme III"
            },
            "starlit_theme_04": {
              "name": "Canopy Theme IV"
            },
            "starlit_theme_05": {
              "name": "Canopy Theme V"
            },
            "starlit_theme_06": {
              "name": "Canopy Theme VI"
            },
            "starlit_theme_07": {
              "name": "Canopy Theme VII"
            },
            "starlit_core_01": {
              "name": "Canopy Core I"
            },
            "starlit_core_02": {
              "name": "Canopy Core II"
            },
            "starlit_core_03": {
              "name": "Canopy Core III"
            },
            "starlit_core_04": {
              "name": "Canopy Core IV"
            },
            "starlit_core_05": {
              "name": "Canopy Core V"
            },
            "starlit_core_06": {
              "name": "Canopy Core VI"
            },
            "starlit_core_07": {
              "name": "Canopy Core VII"
            },
            "starlit_relic_01": {
              "name": "Canopy Relic I"
            },
            "starlit_relic_02": {
              "name": "Canopy Relic II"
            },
            "starlit_relic_03": {
              "name": "Canopy Relic III"
            },
            "starlit_relic_04": {
              "name": "Canopy Relic IV"
            },
            "starlit_relic_05": {
              "name": "Canopy Relic V"
            },
            "starlit_relic_06": {
              "name": "Canopy Relic VI"
            }
          },
          "badges": [
            "forest",
            "night",
            "celestial"
          ]
        },
        "tidal_catacombs": {
          "name": "潮汐墓所",
          "description": "潮の干満で削れた階段状の洞窟と潮溜まり",
          "blocks": {
            "tidal_theme_01": {
              "name": "Tidal Theme I"
            },
            "tidal_theme_02": {
              "name": "Tidal Theme II"
            },
            "tidal_theme_03": {
              "name": "Tidal Theme III"
            },
            "tidal_theme_04": {
              "name": "Tidal Theme IV"
            },
            "tidal_theme_05": {
              "name": "Tidal Theme V"
            },
            "tidal_core_01": {
              "name": "Tidal Core I"
            },
            "tidal_core_02": {
              "name": "Tidal Core II"
            },
            "tidal_core_03": {
              "name": "Tidal Core III"
            },
            "tidal_core_04": {
              "name": "Tidal Core IV"
            },
            "tidal_core_05": {
              "name": "Tidal Core V"
            },
            "tidal_relic_01": {
              "name": "Tidal Relic I"
            },
            "tidal_relic_02": {
              "name": "Tidal Relic II"
            },
            "tidal_relic_03": {
              "name": "Tidal Relic III"
            },
            "tidal_relic_04": {
              "name": "Tidal Relic IV"
            },
            "tidal_relic_05": {
              "name": "Tidal Relic V"
            }
          },
          "badges": [
            "water",
            "tiered"
          ]
        },
        "underground_prison": {
          "name": "地下牢",
          "description": "広い回廊と規則正しい牢房が並ぶ地下監獄",
          "blocks": {
            "prison_theme_01": {
              "name": "Prison Theme I"
            },
            "prison_theme_02": {
              "name": "Prison Theme II"
            },
            "prison_theme_03": {
              "name": "Prison Theme III"
            },
            "prison_theme_04": {
              "name": "Prison Theme IV"
            },
            "prison_theme_05": {
              "name": "Prison Theme V"
            },
            "prison_core_01": {
              "name": "Prison Core I"
            },
            "prison_core_02": {
              "name": "Prison Core II"
            },
            "prison_core_03": {
              "name": "Prison Core III"
            },
            "prison_core_04": {
              "name": "Prison Core IV"
            },
            "prison_core_05": {
              "name": "Prison Core V"
            },
            "prison_relic_01": {
              "name": "Prison Relic I"
            },
            "prison_relic_02": {
              "name": "Prison Relic II"
            },
            "prison_relic_03": {
              "name": "Prison Relic III"
            },
            "prison_relic_04": {
              "name": "Prison Relic IV"
            },
            "prison_relic_05": {
              "name": "Prison Relic V"
            }
          },
          "badges": [
            "structured",
            "rooms"
          ]
        },
        "visceral_chambers": {
          "name": "臓腑血溜り回廊",
          "description": "鼓動する肉腔が連結する血の池。拍動する管が冒険者を包囲する。",
          "blocks": {
            "visceral_gorecell_i": {
              "name": "臓膜膿槽 I: 滴り胞室"
            },
            "visceral_gorecell_ii": {
              "name": "臓膜膿槽 II: 拍動腔"
            },
            "visceral_gorecell_reliquary": {
              "name": "臓膜膿槽・血栓保管室"
            },
            "visceral_gorecell_court": {
              "name": "臓膜膿槽宮廷"
            }
          },
          "badges": [
            "organic",
            "horror",
            "pulse"
          ]
        },
        "arterial_sprawl": {
          "name": "動脈樹の腫瘍巣",
          "description": "奔流する血管が網状に広がり、血栓の巣が点在する粘性ダンジョン。",
          "blocks": {
            "arterial_tangle_i": {
              "name": "動脈瘤樹 I: 滲出路"
            },
            "arterial_tangle_ii": {
              "name": "動脈瘤樹 II: 血潮回廊"
            },
            "arterial_tangle_spine": {
              "name": "動脈瘤樹脊索"
            },
            "arterial_tangle_nexus": {
              "name": "動脈瘤樹の核滞留"
            }
          },
          "badges": [
            "organic",
            "network",
            "hazard"
          ]
        },
        "necrotic_warrens": {
          "name": "壊死した蠢動坑",
          "description": "壊死した肉塊が崩落し続ける洞穴。腐臭の靄が立ち込める。",
          "blocks": {
            "necrotic_burrow_i": {
              "name": "壊死巣穴 I: 黒腐の溝"
            },
            "necrotic_burrow_ii": {
              "name": "壊死巣穴 II: 腐血斜坑"
            },
            "necrotic_burrow_hatchery": {
              "name": "壊死巣穴・膿芽窟"
            },
            "necrotic_burrow_throne": {
              "name": "壊死巣穴王座"
            }
          },
          "badges": [
            "cavern",
            "decay",
            "maze"
          ]
        },
        "clotted_catacombs": {
          "name": "凝血の地下納骨堂",
          "description": "凝り固まった血塊で形成された部屋と廊下が重層に交わる。",
          "blocks": {
            "clot_catacomb_i": {
              "name": "凝血納骨堂 I: 瘤室"
            },
            "clot_catacomb_ii": {
              "name": "凝血納骨堂 II: 凝滞廊"
            },
            "clot_catacomb_ossuary": {
              "name": "凝血納骨堂・血骨庫"
            },
            "clot_catacomb_basilica": {
              "name": "凝血納骨堂大聖血"
            }
          },
          "badges": [
            "catacomb",
            "grid",
            "hazard"
          ]
        },
        "cadaverous_labyrinth": {
          "name": "屍迷の検死迷宮",
          "description": "収容された遺体の袋が通路を侵食し、恐怖の血路が迷走する。",
          "blocks": {
            "cadaver_labyrinth_i": {
              "name": "屍迷宮 I: 包帯回廊"
            },
            "cadaver_labyrinth_ii": {
              "name": "屍迷宮 II: 解剖導線"
            },
            "cadaver_labyrinth_archive": {
              "name": "屍迷宮・遺体保管庫"
            },
            "cadaver_labyrinth_cathedra": {
              "name": "屍迷宮血壇"
            }
          },
          "badges": [
            "maze",
            "organic",
            "ambient"
          ]
        },
        "surgical_theatre": {
          "name": "血濡れ手術劇場",
          "description": "円形の観覧席が血の舞台を囲い、焦げた鉄の匂いが漂う。",
          "blocks": {
            "surgical_theatre_i": {
              "name": "血劇場 I: 第一観血席"
            },
            "surgical_theatre_ii": {
              "name": "血劇場 II: 焦痕席"
            },
            "surgical_theatre_gallery": {
              "name": "血劇場・解剖観覧廊"
            },
            "surgical_theatre_sanctum": {
              "name": "血劇場術者聖壇"
            }
          },
          "badges": [
            "arena",
            "ritual",
            "hazard"
          ]
        },
        "forensic_gallery": {
          "name": "検死標本ギャラリー",
          "description": "血で封じられた展示室が連なる。標本棚には凍った証拠が煌めく。",
          "blocks": {
            "forensic_vitrine_i": {
              "name": "検死標本陳列 I: 凍結棚"
            },
            "forensic_vitrine_ii": {
              "name": "検死標本陳列 II: 血浸室"
            },
            "forensic_vitrine_archive": {
              "name": "検死標本保全庫"
            },
            "forensic_vitrine_court": {
              "name": "検死標本審問廷"
            }
          },
          "badges": [
            "gallery",
            "puzzle",
            "organic"
          ]
        },
        "coagulated_pits": {
          "name": "血餅の落とし穴群",
          "description": "血餅だまりが底無しの落とし穴となり、噛み締めるように獲物を沈める。",
          "blocks": {
            "coagulated_sink_i": {
              "name": "血餅沈溝 I: 粘稠路"
            },
            "coagulated_sink_ii": {
              "name": "血餅沈溝 II: 侵蝕堀"
            },
            "coagulated_sink_well": {
              "name": "血餅沈溝・窖壺"
            },
            "coagulated_sink_maw": {
              "name": "血餅沈溝咬孔"
            }
          },
          "badges": [
            "pit",
            "hazard",
            "organic"
          ]
        },
        "morgue_silos": {
          "name": "屍庫垂直筒",
          "description": "垂直に伸びる収容筒と搬送路が格子状に組み合わさる冷たい死庫。",
          "blocks": {
            "morgue_silo_i": {
              "name": "屍庫筒 I: 下層搬入口"
            },
            "morgue_silo_ii": {
              "name": "屍庫筒 II: 吊架廊"
            },
            "morgue_silo_stack": {
              "name": "屍庫筒・積層架"
            },
            "morgue_silo_chimney": {
              "name": "屍庫筒煙槽"
            }
          },
          "badges": [
            "industrial",
            "vertical",
            "horror"
          ]
        },
        "thanatology_sanctum": {
          "name": "死生学の聖域",
          "description": "死を解析する祭壇が幾重にも広がる幾何学的な血の聖堂。",
          "blocks": {
            "thanatology_nave_i": {
              "name": "死生聖堂 I: 血碑廊"
            },
            "thanatology_nave_ii": {
              "name": "死生聖堂 II: 解剖翼"
            },
            "thanatology_nave_sacrarium": {
              "name": "死生聖堂・供血室"
            },
            "thanatology_nave_reliquary": {
              "name": "死生聖堂血遺庫"
            }
          },
          "badges": [
            "ritual",
            "sacred",
            "labyrinth"
          ]
        },
        "frontier_main_street": {
          "name": "Frontier Main Street",
          "blocks": {
            "western_story_01": {
              "name": "Western Story I"
            },
            "western_story_02": {
              "name": "Western Story II"
            },
            "western_story_03": {
              "name": "Western Story III"
            },
            "western_story_04": {
              "name": "Western Story IV"
            },
            "western_story_05": {
              "name": "Western Story V"
            },
            "frontier_relic_04": {
              "name": "Frontier Relic IV"
            },
            "sheriff_legacy_01": {
              "name": "Sheriff Legacy I"
            }
          }
        },
        "canyon_meanders": {
          "name": "Canyon Meanders",
          "blocks": {
            "mesa_border_01": {
              "name": "Mesa Border I"
            },
            "mesa_border_02": {
              "name": "Mesa Border II"
            },
            "mesa_border_03": {
              "name": "Mesa Border III"
            },
            "mesa_border_04": {
              "name": "Mesa Border IV"
            },
            "frontier_relic_02": {
              "name": "Frontier Relic II"
            },
            "sheriff_legacy_04": {
              "name": "Sheriff Legacy IV"
            }
          }
        },
        "ghost_town_hollows": {
          "name": "Ghost Town Hollows",
          "blocks": {
            "ghost_hollow_01": {
              "name": "Ghost Hollow I"
            },
            "ghost_hollow_02": {
              "name": "Ghost Hollow II"
            },
            "ghost_hollow_03": {
              "name": "Ghost Hollow III"
            },
            "frontier_relic_01": {
              "name": "Frontier Relic I"
            },
            "sheriff_legacy_02": {
              "name": "Sheriff Legacy II"
            }
          }
        },
        "sunset_badlands": {
          "name": "Sunset Badlands",
          "blocks": {
            "badlands_trail_01": {
              "name": "Badlands Trail I"
            },
            "badlands_trail_02": {
              "name": "Badlands Trail II"
            },
            "badlands_trail_03": {
              "name": "Badlands Trail III"
            },
            "badlands_trail_04": {
              "name": "Badlands Trail IV"
            },
            "badlands_legend_01": {
              "name": "Badlands Legend I"
            }
          }
        },
        "sagebrush_basin": {
          "name": "Sagebrush Basin",
          "blocks": {
            "sagebrush_circle_01": {
              "name": "Sagebrush Circle I"
            },
            "sagebrush_circle_02": {
              "name": "Sagebrush Circle II"
            },
            "sagebrush_circle_03": {
              "name": "Sagebrush Circle III"
            },
            "sagebrush_legacy_01": {
              "name": "Sagebrush Legacy I"
            }
          }
        },
        "thunder_mesa": {
          "name": "Thunder Mesa",
          "blocks": {
            "thunderfront_01": {
              "name": "Thunderfront I"
            },
            "thunderfront_02": {
              "name": "Thunderfront II"
            },
            "thunderfront_legend": {
              "name": "Thunderfront Legend"
            }
          }
        },
        "frontier_citadel": {
          "name": "Frontier Citadel",
          "blocks": {
            "citadel_patrol_01": {
              "name": "Citadel Patrol I"
            },
            "citadel_patrol_02": {
              "name": "Citadel Patrol II"
            },
            "citadel_patrol_03": {
              "name": "Citadel Patrol III"
            }
          }
        },
        "hoodoo_needles": {
          "name": "Hoodoo Needles",
          "blocks": {
            "hoodoo_column_01": {
              "name": "Hoodoo Columns I"
            },
            "hoodoo_column_02": {
              "name": "Hoodoo Columns II"
            },
            "hoodoo_column_03": {
              "name": "Hoodoo Columns III"
            }
          }
        },
        "wagon_yard_sprawl": {
          "name": "Wagon Yard Sprawl",
          "blocks": {
            "wagon_depot_01": {
              "name": "Wagon Depot I"
            },
            "wagon_depot_02": {
              "name": "Wagon Depot II"
            },
            "wagon_depot_03": {
              "name": "Wagon Depot III"
            }
          }
        },
        "silver_creek_crossing": {
          "name": "Silver Creek Crossing",
          "blocks": {
            "silver_crossing_01": {
              "name": "Silver Crossing I"
            },
            "silver_crossing_02": {
              "name": "Silver Crossing II"
            },
            "silver_crossing_03": {
              "name": "Silver Crossing III"
            }
          }
        },
        "painted_switchbacks": {
          "name": "Painted Switchbacks",
          "blocks": {
            "painted_switchbacks_01": {
              "name": "Painted Switchbacks I"
            },
            "painted_switchbacks_02": {
              "name": "Painted Switchbacks II"
            },
            "painted_switchbacks_03": {
              "name": "Painted Switchbacks III"
            }
          }
        },
        "coyote_den_network": {
          "name": "Coyote Den Network",
          "blocks": {
            "coyote_den_01": {
              "name": "Coyote Den I"
            },
            "coyote_den_02": {
              "name": "Coyote Den II"
            },
            "coyote_den_03": {
              "name": "Coyote Den III"
            }
          }
        },
        "railway_warrens": {
          "name": "Railway Warrens",
          "blocks": {
            "railspur_01": {
              "name": "Railspur I"
            },
            "railspur_02": {
              "name": "Railspur II"
            },
            "railspur_03": {
              "name": "Railspur III"
            },
            "railspur_04": {
              "name": "Railspur IV"
            },
            "railspur_05": {
              "name": "Railspur V"
            },
            "frontier_relic_03": {
              "name": "Frontier Relic III"
            }
          }
        },
        "stampede_ridge": {
          "name": "Stampede Ridge",
          "blocks": {
            "stampede_pass_01": {
              "name": "Stampede Pass I"
            },
            "stampede_pass_02": {
              "name": "Stampede Pass II"
            },
            "stampede_pass_03": {
              "name": "Stampede Pass III"
            },
            "stampede_pass_04": {
              "name": "Stampede Pass IV"
            },
            "sheriff_legacy_03": {
              "name": "Sheriff Legacy III"
            }
          }
        },
        "salt_flat_ruins": {
          "name": "Salt Flat Ruins",
          "blocks": {
            "saltway_01": {
              "name": "Saltway I"
            },
            "saltway_02": {
              "name": "Saltway II"
            },
            "saltway_03": {
              "name": "Saltway III"
            },
            "saltway_04": {
              "name": "Saltway IV"
            },
            "frontier_relic_05": {
              "name": "Frontier Relic V"
            }
          }
        },
        "abs_prism_spiral": {
          "name": "プリズム螺旋界",
          "description": "虹色の渦と光輪が幾層にも折り重なる抽象螺旋世界。",
          "blocks": {
            "abs_prism_spiral_entry": {
              "name": "プリズム螺旋界：導入層"
            },
            "abs_prism_spiral_core": {
              "name": "プリズム螺旋界：中核層"
            },
            "abs_prism_spiral_apex": {
              "name": "プリズム螺旋界：極致層"
            },
            "abs_prism_spiral_anomaly": {
              "name": "プリズム螺旋界：異相断面"
            }
          }
        },
        "abs_chroma_delta": {
          "name": "クロマデルタ原野",
          "description": "彩色されたデルタが波紋のように広がる平原型の抽象地形。",
          "blocks": {
            "abs_chroma_delta_entry": {
              "name": "クロマデルタ原野：導入層"
            },
            "abs_chroma_delta_core": {
              "name": "クロマデルタ原野：中核層"
            },
            "abs_chroma_delta_apex": {
              "name": "クロマデルタ原野：極致層"
            },
            "abs_chroma_delta_anomaly": {
              "name": "クロマデルタ原野：異相断面"
            }
          }
        },
        "abs_vapor_strata": {
          "name": "蒸気層の聖域",
          "description": "蒸気の層が幾筋もの水平面を描く夢幻の聖域。",
          "blocks": {
            "abs_vapor_strata_entry": {
              "name": "蒸気層の聖域：導入層"
            },
            "abs_vapor_strata_core": {
              "name": "蒸気層の聖域：中核層"
            },
            "abs_vapor_strata_apex": {
              "name": "蒸気層の聖域：極致層"
            },
            "abs_vapor_strata_anomaly": {
              "name": "蒸気層の聖域：異相断面"
            }
          }
        },
        "abs_lattice_halo": {
          "name": "格子の光環",
          "description": "格子状の輝きが光環となって幾何学的に重なる領域。",
          "blocks": {
            "abs_lattice_halo_entry": {
              "name": "格子の光環：導入層"
            },
            "abs_lattice_halo_core": {
              "name": "格子の光環：中核層"
            },
            "abs_lattice_halo_apex": {
              "name": "格子の光環：極致層"
            },
            "abs_lattice_halo_anomaly": {
              "name": "格子の光環：異相断面"
            }
          }
        },
        "abs_gossamer_drift": {
          "name": "薄紗漂流層",
          "description": "薄紗のような繊維が漂い、紐が絡み合う漂流空間。",
          "blocks": {
            "abs_gossamer_drift_entry": {
              "name": "薄紗漂流層：導入層"
            },
            "abs_gossamer_drift_core": {
              "name": "薄紗漂流層：中核層"
            },
            "abs_gossamer_drift_apex": {
              "name": "薄紗漂流層：極致層"
            },
            "abs_gossamer_drift_anomaly": {
              "name": "薄紗漂流層：異相断面"
            }
          }
        },
        "abs_celadon_fragment": {
          "name": "青磁フラグメント",
          "description": "青磁色の破片が浮遊し、欠片が繋ぎ合わさる断片界。",
          "blocks": {
            "abs_celadon_fragment_entry": {
              "name": "青磁フラグメント：導入層"
            },
            "abs_celadon_fragment_core": {
              "name": "青磁フラグメント：中核層"
            },
            "abs_celadon_fragment_apex": {
              "name": "青磁フラグメント：極致層"
            },
            "abs_celadon_fragment_anomaly": {
              "name": "青磁フラグメント：異相断面"
            }
          }
        },
        "abs_neon_river_mesh": {
          "name": "ネオン河の網界",
          "description": "ネオン色の河が網目のように走る流線型の世界。",
          "blocks": {
            "abs_neon_river_mesh_entry": {
              "name": "ネオン河の網界：導入層"
            },
            "abs_neon_river_mesh_core": {
              "name": "ネオン河の網界：中核層"
            },
            "abs_neon_river_mesh_apex": {
              "name": "ネオン河の網界：極致層"
            },
            "abs_neon_river_mesh_anomaly": {
              "name": "ネオン河の網界：異相断面"
            }
          }
        },
        "abs_opaline_reservoir": {
          "name": "オパール貯留層",
          "description": "オパールの光が水面のように反射する貯留層。",
          "blocks": {
            "abs_opaline_reservoir_entry": {
              "name": "オパール貯留層：導入層"
            },
            "abs_opaline_reservoir_core": {
              "name": "オパール貯留層：中核層"
            },
            "abs_opaline_reservoir_apex": {
              "name": "オパール貯留層：極致層"
            },
            "abs_opaline_reservoir_anomaly": {
              "name": "オパール貯留層：異相断面"
            }
          }
        },
        "abs_aurora_petals": {
          "name": "オーロラ花弁界",
          "description": "オーロラが花弁となって開く幻想的な空中庭園。",
          "blocks": {
            "abs_aurora_petals_entry": {
              "name": "オーロラ花弁界：導入層"
            },
            "abs_aurora_petals_core": {
              "name": "オーロラ花弁界：中核層"
            },
            "abs_aurora_petals_apex": {
              "name": "オーロラ花弁界：極致層"
            },
            "abs_aurora_petals_anomaly": {
              "name": "オーロラ花弁界：異相断面"
            }
          }
        },
        "abs_echo_veil": {
          "name": "エコーヴェイル回廊",
          "description": "音の残響が薄いヴェイルとなって延びる回廊。",
          "blocks": {
            "abs_echo_veil_entry": {
              "name": "エコーヴェイル回廊：導入層"
            },
            "abs_echo_veil_core": {
              "name": "エコーヴェイル回廊：中核層"
            },
            "abs_echo_veil_apex": {
              "name": "エコーヴェイル回廊：極致層"
            },
            "abs_echo_veil_anomaly": {
              "name": "エコーヴェイル回廊：異相断面"
            }
          }
        },
        "abs_fractal_orchard": {
          "name": "フラクタル果樹苑",
          "description": "フラクタル樹冠が幾何学的な果実園を形成する空間。",
          "blocks": {
            "abs_fractal_orchard_entry": {
              "name": "フラクタル果樹苑：導入層"
            },
            "abs_fractal_orchard_core": {
              "name": "フラクタル果樹苑：中核層"
            },
            "abs_fractal_orchard_apex": {
              "name": "フラクタル果樹苑：極致層"
            },
            "abs_fractal_orchard_anomaly": {
              "name": "フラクタル果樹苑：異相断面"
            }
          }
        },
        "abs_glass_mandala": {
          "name": "玻璃マンダラ",
          "description": "ガラスの破片が曼荼羅のように広がる聖域。",
          "blocks": {
            "abs_glass_mandala_entry": {
              "name": "玻璃マンダラ：導入層"
            },
            "abs_glass_mandala_core": {
              "name": "玻璃マンダラ：中核層"
            },
            "abs_glass_mandala_apex": {
              "name": "玻璃マンダラ：極致層"
            },
            "abs_glass_mandala_anomaly": {
              "name": "玻璃マンダラ：異相断面"
            }
          }
        },
        "abs_glyphfield_drift": {
          "name": "グリフフィールドの漂い",
          "description": "古代グリフが漂う野原状の抽象空間。",
          "blocks": {
            "abs_glyphfield_drift_entry": {
              "name": "グリフフィールドの漂い：導入層"
            },
            "abs_glyphfield_drift_core": {
              "name": "グリフフィールドの漂い：中核層"
            },
            "abs_glyphfield_drift_apex": {
              "name": "グリフフィールドの漂い：極致層"
            },
            "abs_glyphfield_drift_anomaly": {
              "name": "グリフフィールドの漂い：異相断面"
            }
          }
        },
        "abs_origami_horizon": {
          "name": "折紙地平",
          "description": "折り紙の折線が地平線のように続く曲面世界。",
          "blocks": {
            "abs_origami_horizon_entry": {
              "name": "折紙地平：導入層"
            },
            "abs_origami_horizon_core": {
              "name": "折紙地平：中核層"
            },
            "abs_origami_horizon_apex": {
              "name": "折紙地平：極致層"
            },
            "abs_origami_horizon_anomaly": {
              "name": "折紙地平：異相断面"
            }
          }
        },
        "abs_crystal_cascade": {
          "name": "クリスタルカスケード",
          "description": "結晶の滝が階段状に連なる抽象瀑布。",
          "blocks": {
            "abs_crystal_cascade_entry": {
              "name": "クリスタルカスケード：導入層"
            },
            "abs_crystal_cascade_core": {
              "name": "クリスタルカスケード：中核層"
            },
            "abs_crystal_cascade_apex": {
              "name": "クリスタルカスケード：極致層"
            },
            "abs_crystal_cascade_anomaly": {
              "name": "クリスタルカスケード：異相断面"
            }
          }
        },
        "abs_ember_shroud": {
          "name": "残燼の被膜",
          "description": "残り火が薄い被膜となって漂う陰影空間。",
          "blocks": {
            "abs_ember_shroud_entry": {
              "name": "残燼の被膜：導入層"
            },
            "abs_ember_shroud_core": {
              "name": "残燼の被膜：中核層"
            },
            "abs_ember_shroud_apex": {
              "name": "残燼の被膜：極致層"
            },
            "abs_ember_shroud_anomaly": {
              "name": "残燼の被膜：異相断面"
            }
          }
        },
        "abs_lunar_tessellation": {
          "name": "月面テッセレーション",
          "description": "月面を思わせるタイルがテッセレーションを描く領域。",
          "blocks": {
            "abs_lunar_tessellation_entry": {
              "name": "月面テッセレーション：導入層"
            },
            "abs_lunar_tessellation_core": {
              "name": "月面テッセレーション：中核層"
            },
            "abs_lunar_tessellation_apex": {
              "name": "月面テッセレーション：極致層"
            },
            "abs_lunar_tessellation_anomaly": {
              "name": "月面テッセレーション：異相断面"
            }
          }
        },
        "abs_saffron_tempest": {
          "name": "サフランテンペスト",
          "description": "サフラン色の嵐が筋状に走る灼熱の抽象地帯。",
          "blocks": {
            "abs_saffron_tempest_entry": {
              "name": "サフランテンペスト：導入層"
            },
            "abs_saffron_tempest_core": {
              "name": "サフランテンペスト：中核層"
            },
            "abs_saffron_tempest_apex": {
              "name": "サフランテンペスト：極致層"
            },
            "abs_saffron_tempest_anomaly": {
              "name": "サフランテンペスト：異相断面"
            }
          }
        },
        "abs_verdigris_tangle": {
          "name": "緑青タングル",
          "description": "緑青色の線が絡み合うタングル構造の迷界。",
          "blocks": {
            "abs_verdigris_tangle_entry": {
              "name": "緑青タングル：導入層"
            },
            "abs_verdigris_tangle_core": {
              "name": "緑青タングル：中核層"
            },
            "abs_verdigris_tangle_apex": {
              "name": "緑青タングル：極致層"
            },
            "abs_verdigris_tangle_anomaly": {
              "name": "緑青タングル：異相断面"
            }
          }
        },
        "abs_iridescent_delta": {
          "name": "玉虫デルタ",
          "description": "玉虫色のデルタが光の筋で区切られた幻想地形。",
          "blocks": {
            "abs_iridescent_delta_entry": {
              "name": "玉虫デルタ：導入層"
            },
            "abs_iridescent_delta_core": {
              "name": "玉虫デルタ：中核層"
            },
            "abs_iridescent_delta_apex": {
              "name": "玉虫デルタ：極致層"
            },
            "abs_iridescent_delta_anomaly": {
              "name": "玉虫デルタ：異相断面"
            }
          }
        },
        "abs_quantum_dunes": {
          "name": "量子砂丘",
          "description": "量子揺らぎが砂丘に干渉して揺れる不規則な波紋。",
          "blocks": {
            "abs_quantum_dunes_entry": {
              "name": "量子砂丘：導入層"
            },
            "abs_quantum_dunes_core": {
              "name": "量子砂丘：中核層"
            },
            "abs_quantum_dunes_apex": {
              "name": "量子砂丘：極致層"
            }
          }
        },
        "abs_velvet_abyss": {
          "name": "ベルベット深淵",
          "description": "ベルベットのように柔らかい闇が広がる深淵。",
          "blocks": {
            "abs_velvet_abyss_entry": {
              "name": "ベルベット深淵：導入層"
            },
            "abs_velvet_abyss_core": {
              "name": "ベルベット深淵：中核層"
            },
            "abs_velvet_abyss_apex": {
              "name": "ベルベット深淵：極致層"
            }
          }
        },
        "abs_radiant_cathedral": {
          "name": "光輝カテドラル",
          "description": "光が柱とアーチを形成する抽象聖堂。",
          "blocks": {
            "abs_radiant_cathedral_entry": {
              "name": "光輝カテドラル：導入層"
            },
            "abs_radiant_cathedral_core": {
              "name": "光輝カテドラル：中核層"
            },
            "abs_radiant_cathedral_apex": {
              "name": "光輝カテドラル：極致層"
            }
          }
        },
        "abs_mirage_loom": {
          "name": "蜃気楼織機",
          "description": "蜃気楼が織機の糸のように交差する幻影世界。",
          "blocks": {
            "abs_mirage_loom_entry": {
              "name": "蜃気楼織機：導入層"
            },
            "abs_mirage_loom_core": {
              "name": "蜃気楼織機：中核層"
            },
            "abs_mirage_loom_apex": {
              "name": "蜃気楼織機：極致層"
            }
          }
        },
        "abs_vapor_prism_towers": {
          "name": "蒸気プリズム塔",
          "description": "蒸気とプリズムが塔のように立ち昇る垂直世界。",
          "blocks": {
            "abs_vapor_prism_towers_entry": {
              "name": "蒸気プリズム塔：導入層"
            },
            "abs_vapor_prism_towers_core": {
              "name": "蒸気プリズム塔：中核層"
            },
            "abs_vapor_prism_towers_apex": {
              "name": "蒸気プリズム塔：極致層"
            }
          }
        },
        "abs_celestial_foldspace": {
          "name": "星界フォールドスペース",
          "description": "星明かりが折り畳まれた空間へと折り重なる異界。",
          "blocks": {
            "abs_celestial_foldspace_entry": {
              "name": "星界フォールドスペース：導入層"
            },
            "abs_celestial_foldspace_core": {
              "name": "星界フォールドスペース：中核層"
            },
            "abs_celestial_foldspace_apex": {
              "name": "星界フォールドスペース：極致層"
            }
          }
        },
        "abs_sapphire_ridge": {
          "name": "サファイアリッジ",
          "description": "青い稜線が幾何学的に折り重なる稜堡空間。",
          "blocks": {
            "abs_sapphire_ridge_entry": {
              "name": "サファイアリッジ：導入層"
            },
            "abs_sapphire_ridge_core": {
              "name": "サファイアリッジ：中核層"
            },
            "abs_sapphire_ridge_apex": {
              "name": "サファイアリッジ：極致層"
            }
          }
        },
        "abs_emberglass_ribbons": {
          "name": "焔玻璃リボン",
          "description": "火と玻璃がリボンとなって絡み合う空間。",
          "blocks": {
            "abs_emberglass_ribbons_entry": {
              "name": "焔玻璃リボン：導入層"
            },
            "abs_emberglass_ribbons_core": {
              "name": "焔玻璃リボン：中核層"
            },
            "abs_emberglass_ribbons_apex": {
              "name": "焔玻璃リボン：極致層"
            }
          }
        },
        "abs_pale_greenwave": {
          "name": "蒼波グリーンウェイブ",
          "description": "青緑の波動が静かに打ち寄せる抽象潮汐界。",
          "blocks": {
            "abs_pale_greenwave_entry": {
              "name": "蒼波グリーンウェイブ：導入層"
            },
            "abs_pale_greenwave_core": {
              "name": "蒼波グリーンウェイブ：中核層"
            },
            "abs_pale_greenwave_apex": {
              "name": "蒼波グリーンウェイブ：極致層"
            }
          }
        },
        "abs_twilight_circuit": {
          "name": "薄暮回路",
          "description": "薄暮の光が回路となって都市のように流れる空間。",
          "blocks": {
            "abs_twilight_circuit_entry": {
              "name": "薄暮回路：導入層"
            },
            "abs_twilight_circuit_core": {
              "name": "薄暮回路：中核層"
            },
            "abs_twilight_circuit_apex": {
              "name": "薄暮回路：極致層"
            }
          }
        },
        "abs_obsidian_sonar": {
          "name": "黒曜ソナー",
          "description": "黒曜石の反響が波紋を描くソナー空間。",
          "blocks": {
            "abs_obsidian_sonar_entry": {
              "name": "黒曜ソナー：導入層"
            },
            "abs_obsidian_sonar_core": {
              "name": "黒曜ソナー：中核層"
            },
            "abs_obsidian_sonar_apex": {
              "name": "黒曜ソナー：極致層"
            }
          }
        },
        "abs_cobalt_mistways": {
          "name": "コバルト霧道",
          "description": "コバルト色の霧が道筋となって流れる幻想通路。",
          "blocks": {
            "abs_cobalt_mistways_entry": {
              "name": "コバルト霧道：導入層"
            },
            "abs_cobalt_mistways_core": {
              "name": "コバルト霧道：中核層"
            },
            "abs_cobalt_mistways_apex": {
              "name": "コバルト霧道：極致層"
            }
          }
        },
        "abs_crimson_moire": {
          "name": "深紅モアレ",
          "description": "モアレ干渉が深紅の層を揺らす抽象地帯。",
          "blocks": {
            "abs_crimson_moire_entry": {
              "name": "深紅モアレ：導入層"
            },
            "abs_crimson_moire_core": {
              "name": "深紅モアレ：中核層"
            },
            "abs_crimson_moire_apex": {
              "name": "深紅モアレ：極致層"
            }
          }
        },
        "abs_spectral_brushwork": {
          "name": "スペクトル筆致",
          "description": "絵筆のような筆致が色彩スペクトルを描くアトリエ世界。",
          "blocks": {
            "abs_spectral_brushwork_entry": {
              "name": "スペクトル筆致：導入層"
            },
            "abs_spectral_brushwork_core": {
              "name": "スペクトル筆致：中核層"
            },
            "abs_spectral_brushwork_apex": {
              "name": "スペクトル筆致：極致層"
            }
          }
        },
        "abs_porcelain_trench": {
          "name": "磁器トレンチ",
          "description": "磁器質の断面が幾重にも走る深いトレンチ。",
          "blocks": {
            "abs_porcelain_trench_entry": {
              "name": "磁器トレンチ：導入層"
            },
            "abs_porcelain_trench_core": {
              "name": "磁器トレンチ：中核層"
            },
            "abs_porcelain_trench_apex": {
              "name": "磁器トレンチ：極致層"
            }
          }
        },
        "abs_azure_pendulum": {
          "name": "蒼の振り子",
          "description": "振り子運動の軌跡が蒼い軌道を描く世界。",
          "blocks": {
            "abs_azure_pendulum_entry": {
              "name": "蒼の振り子：導入層"
            },
            "abs_azure_pendulum_core": {
              "name": "蒼の振り子：中核層"
            },
            "abs_azure_pendulum_apex": {
              "name": "蒼の振り子：極致層"
            }
          }
        },
        "abs_gilded_vortex": {
          "name": "金渦殿",
          "description": "黄金の渦が宮殿のように螺旋を描く神秘空間。",
          "blocks": {
            "abs_gilded_vortex_entry": {
              "name": "金渦殿：導入層"
            },
            "abs_gilded_vortex_core": {
              "name": "金渦殿：中核層"
            },
            "abs_gilded_vortex_apex": {
              "name": "金渦殿：極致層"
            }
          }
        },
        "abs_monochrome_mountain": {
          "name": "モノクローム山脈",
          "description": "モノクロームの陰影が山脈の抽象形を描き出す。",
          "blocks": {
            "abs_monochrome_mountain_entry": {
              "name": "モノクローム山脈：導入層"
            },
            "abs_monochrome_mountain_core": {
              "name": "モノクローム山脈：中核層"
            },
            "abs_monochrome_mountain_apex": {
              "name": "モノクローム山脈：極致層"
            }
          }
        },
        "abs_auric_confluence": {
          "name": "金色コンフルエンス",
          "description": "金色の流線が一点に収束するコンフルエンス界。",
          "blocks": {
            "abs_auric_confluence_entry": {
              "name": "金色コンフルエンス：導入層"
            },
            "abs_auric_confluence_core": {
              "name": "金色コンフルエンス：中核層"
            },
            "abs_auric_confluence_apex": {
              "name": "金色コンフルエンス：極致層"
            }
          }
        },
        "abs_noctilucent_threadsea": {
          "name": "夜光糸の海",
          "description": "夜光虫のような糸が海原に漂う幻想世界。",
          "blocks": {
            "abs_noctilucent_threadsea_entry": {
              "name": "夜光糸の海：導入層"
            },
            "abs_noctilucent_threadsea_core": {
              "name": "夜光糸の海：中核層"
            },
            "abs_noctilucent_threadsea_apex": {
              "name": "夜光糸の海：極致層"
            }
          }
        },
        "mist_rainforest": {
          "name": "霧雨熱帯林",
          "description": "濃い霧と川筋が絡み合う湿潤な熱帯林の迷路。苔むした床と水路が交差する。",
          "blocks": {
            "nature_mist-rainforest_theme": {
              "name": "霧雨熱帯林 探索"
            },
            "nature_mist-rainforest_core": {
              "name": "霧雨熱帯林 中層"
            },
            "nature_mist-rainforest_relic": {
              "name": "霧雨熱帯林 遺構"
            }
          }
        },
        "blossom_valley": {
          "name": "花香る渓谷",
          "description": "大地が花畑に覆われた渓谷。中央の草地を緩やかな小川が横切る。",
          "blocks": {
            "nature_blossom-valley_theme": {
              "name": "花香る渓谷 探索"
            },
            "nature_blossom-valley_core": {
              "name": "花香る渓谷 中層"
            },
            "nature_blossom-valley_relic": {
              "name": "花香る渓谷 遺構"
            }
          }
        },
        "aurora_taiga": {
          "name": "オーロラ泰伽",
          "description": "凍てついた大地にオーロラの光が揺らめく北方の針葉樹地帯。雪の回廊と氷の湖が点在する。",
          "blocks": {
            "nature_aurora-taiga_theme": {
              "name": "オーロラ泰伽 探索"
            },
            "nature_aurora-taiga_core": {
              "name": "オーロラ泰伽 中層"
            },
            "nature_aurora-taiga_relic": {
              "name": "オーロラ泰伽 遺構"
            }
          }
        },
        "mangrove_delta": {
          "name": "マングローブ三角州",
          "description": "複雑に分岐した水路と小島が点在する湿地帯。根が絡み合い、歩ける小道が浮かぶ。",
          "blocks": {
            "nature_mangrove-delta_theme": {
              "name": "マングローブ三角州 探索"
            },
            "nature_mangrove-delta_core": {
              "name": "マングローブ三角州 中層"
            },
            "nature_mangrove-delta_relic": {
              "name": "マングローブ三角州 遺構"
            }
          }
        },
        "sunken_springs": {
          "name": "沈みし泉洞",
          "description": "地底に湧き出る泉が複数湧く洞。青白く光る鉱石と静かな水面が広がる。",
          "blocks": {
            "nature_sunken-springs_theme": {
              "name": "沈みし泉洞 探索"
            },
            "nature_sunken-springs_core": {
              "name": "沈みし泉洞 中層"
            },
            "nature_sunken-springs_relic": {
              "name": "沈みし泉洞 遺構"
            }
          }
        },
        "crimson_ravine": {
          "name": "錦秋紅葉渓谷",
          "description": "断崖に沿って紅葉が燃える秋の渓谷。落ち葉が敷き詰められ、裂け目を小川が縫う。",
          "blocks": {
            "nature_crimson-ravine_theme": {
              "name": "錦秋紅葉渓谷 探索"
            },
            "nature_crimson-ravine_core": {
              "name": "錦秋紅葉渓谷 中層"
            },
            "nature_crimson-ravine_relic": {
              "name": "錦秋紅葉渓谷 遺構"
            }
          }
        },
        "opaline_reef": {
          "name": "虹彩珊瑚礁",
          "description": "澄んだ海中に浮かぶ珊瑚礁。虹色に輝く珊瑚帯が迷路状に広がる。",
          "blocks": {
            "nature_opaline-reef_theme": {
              "name": "虹彩珊瑚礁 探索"
            },
            "nature_opaline-reef_core": {
              "name": "虹彩珊瑚礁 中層"
            },
            "nature_opaline-reef_relic": {
              "name": "虹彩珊瑚礁 遺構"
            }
          }
        },
        "sunset_savanna": {
          "name": "茜陽サバンナ",
          "description": "夕焼け色に染まるサバンナ。草海の中に獣道が絡み、バオバブが点在する。",
          "blocks": {
            "nature_sunset-savanna_theme": {
              "name": "茜陽サバンナ 探索"
            },
            "nature_sunset-savanna_core": {
              "name": "茜陽サバンナ 中層"
            },
            "nature_sunset-savanna_relic": {
              "name": "茜陽サバンナ 遺構"
            }
          }
        },
        "glacier_fjord": {
          "name": "蒼氷フィヨルド",
          "description": "切り立つ氷壁と深い入江が連なるフィヨルド。氷河が削った溝に海水が満ちる。",
          "blocks": {
            "nature_glacier-fjord_theme": {
              "name": "蒼氷フィヨルド 探索"
            },
            "nature_glacier-fjord_core": {
              "name": "蒼氷フィヨルド 中層"
            },
            "nature_glacier-fjord_relic": {
              "name": "蒼氷フィヨルド 遺構"
            }
          }
        },
        "luminous_lotus": {
          "name": "蛍光蓮湿原",
          "description": "夜光を放つ蓮が水面を覆う湿原。薄霧に光が反射し幻想的な色彩を描く。",
          "blocks": {
            "nature_luminous-lotus_theme": {
              "name": "蛍光蓮湿原 探索"
            },
            "nature_luminous-lotus_core": {
              "name": "蛍光蓮湿原 中層"
            },
            "nature_luminous-lotus_relic": {
              "name": "蛍光蓮湿原 遺構"
            }
          }
        },
        "azure_oasis": {
          "name": "蒼穹オアシス",
          "description": "焼け付く砂丘に蒼い泉が散在する砂漠の安息地。砂紋が波打つ中に椰子が立つ。",
          "blocks": {
            "nature_azure-oasis_theme": {
              "name": "蒼穹オアシス 探索"
            },
            "nature_azure-oasis_core": {
              "name": "蒼穹オアシス 中層"
            },
            "nature_azure-oasis_relic": {
              "name": "蒼穹オアシス 遺構"
            }
          }
        },
        "whispering_bamboo": {
          "name": "風鳴竹林",
          "description": "風が囁く竹林に小川が流れる静謐な迷路。竹の幹が並び、苔の地面が柔らかい。",
          "blocks": {
            "nature_whispering-bamboo_theme": {
              "name": "風鳴竹林 探索"
            },
            "nature_whispering-bamboo_core": {
              "name": "風鳴竹林 中層"
            },
            "nature_whispering-bamboo_relic": {
              "name": "風鳴竹林 遺構"
            }
          }
        },
        "thunderhead_highlands": {
          "name": "雷雲高原",
          "description": "切り立つ岩棚と稲妻に照らされた高原。窪地に雨水が溜まり、荒れた草が揺れる。",
          "blocks": {
            "nature_thunderhead-highlands_theme": {
              "name": "雷雲高原 探索"
            },
            "nature_thunderhead-highlands_core": {
              "name": "雷雲高原 中層"
            },
            "nature_thunderhead-highlands_relic": {
              "name": "雷雲高原 遺構"
            }
          }
        },
        "crystal_cascades": {
          "name": "翠晶段瀑",
          "description": "翡翠色の段瀑が幾重にも落ちる渓谷。水飛沫が光を乱反射し、水晶が岩壁を飾る。",
          "blocks": {
            "nature_crystal-cascades_theme": {
              "name": "翠晶段瀑 探索"
            },
            "nature_crystal-cascades_core": {
              "name": "翠晶段瀑 中層"
            },
            "nature_crystal-cascades_relic": {
              "name": "翠晶段瀑 遺構"
            }
          }
        },
        "starfall_grotto": {
          "name": "星滴苔窟",
          "description": "天井から滴る水滴が星のように輝く苔むした洞。静かな水盆が散在する。",
          "blocks": {
            "nature_starfall-grotto_theme": {
              "name": "星滴苔窟 探索"
            },
            "nature_starfall-grotto_core": {
              "name": "星滴苔窟 中層"
            },
            "nature_starfall-grotto_relic": {
              "name": "星滴苔窟 遺構"
            }
          }
        },
        "spring_blossom_hills": {
          "name": "春霞桜丘",
          "description": "霞む丘陵に桜が連なる春の迷路。花びらが舞い、段丘に小道が続く。",
          "blocks": {
            "nature_spring-blossom-hills_theme": {
              "name": "春霞桜丘 探索"
            },
            "nature_spring-blossom-hills_core": {
              "name": "春霞桜丘 中層"
            },
            "nature_spring-blossom-hills_relic": {
              "name": "春霞桜丘 遺構"
            }
          }
        },
        "aurora_jungle_delta": {
          "name": "極光密林デルタ",
          "description": "極光ツンドラと密林と湿地が入り混じる大規模デルタ地形。",
          "blocks": {
            "aurora_jungle_delta_blocks1_I": {
              "name": "Aurora Delta Convergence I"
            },
            "aurora_jungle_delta_blocks2_II": {
              "name": "Aurora Delta Convergence II"
            },
            "aurora_jungle_delta_blocks3_III": {
              "name": "Aurora Delta Convergence III"
            },
            "aurora_jungle_delta_blocks4_IV": {
              "name": "Aurora Delta Convergence IV"
            }
          }
        },
        "ember_tide_fissures": {
          "name": "紅潮裂溝群",
          "description": "火山の割れ目と深い海溝が交差する熱水噴出帯。",
          "blocks": {
            "ember_tide_fissures_blocks1_I": {
              "name": "Ember Tide Convergence I"
            },
            "ember_tide_fissures_blocks2_II": {
              "name": "Ember Tide Convergence II"
            },
            "ember_tide_fissures_blocks3_III": {
              "name": "Ember Tide Convergence III"
            },
            "ember_tide_fissures_blocks4_IV": {
              "name": "Ember Tide Convergence IV"
            }
          }
        },
        "shifting_dune_forest": {
          "name": "砂林蜃気楼地帯",
          "description": "砂漠と針葉樹林と遺跡が交互に現れる蜃気楼地帯。",
          "blocks": {
            "shifting_dune_forest_blocks1_I": {
              "name": "Mirage Expanse Convergence I"
            },
            "shifting_dune_forest_blocks2_II": {
              "name": "Mirage Expanse Convergence II"
            },
            "shifting_dune_forest_blocks3_III": {
              "name": "Mirage Expanse Convergence III"
            },
            "shifting_dune_forest_blocks4_IV": {
              "name": "Mirage Expanse Convergence IV"
            }
          }
        },
        "cinder_frost_warrens": {
          "name": "熾氷迷宮網",
          "description": "火の洞窟と氷晶洞と地下迷宮が絡み合う極地の巣穴。",
          "blocks": {
            "cinder_frost_warrens_blocks1_I": {
              "name": "Cinder Frost Convergence I"
            },
            "cinder_frost_warrens_blocks2_II": {
              "name": "Cinder Frost Convergence II"
            },
            "cinder_frost_warrens_blocks3_III": {
              "name": "Cinder Frost Convergence III"
            },
            "cinder_frost_warrens_blocks4_IV": {
              "name": "Cinder Frost Convergence IV"
            }
          }
        },
        "lumina_spore_basin": {
          "name": "燐光胞子盆地",
          "description": "光る茸と湿原の湖沼が交互に沈む盆地群。",
          "blocks": {
            "lumina_spore_basin_blocks1_I": {
              "name": "Lumina Basin Convergence I"
            },
            "lumina_spore_basin_blocks2_II": {
              "name": "Lumina Basin Convergence II"
            },
            "lumina_spore_basin_blocks3_III": {
              "name": "Lumina Basin Convergence III"
            },
            "lumina_spore_basin_blocks4_IV": {
              "name": "Lumina Basin Convergence IV"
            }
          }
        },
        "stormroot_plateaus": {
          "name": "嵐根段丘",
          "description": "雷鳴轟く高原に湿地と古樹が根を下ろす段丘群。",
          "blocks": {
            "stormroot_plateaus_blocks1_I": {
              "name": "Stormroot Convergence I"
            },
            "stormroot_plateaus_blocks2_II": {
              "name": "Stormroot Convergence II"
            },
            "stormroot_plateaus_blocks3_III": {
              "name": "Stormroot Convergence III"
            },
            "stormroot_plateaus_blocks4_IV": {
              "name": "Stormroot Convergence IV"
            }
          }
        },
        "gale_coral_highlands": {
          "name": "風珊瑚高地",
          "description": "浮遊する珊瑚礁と風の断崖が連なる高地帯。",
          "blocks": {
            "gale_coral_highlands_blocks1_I": {
              "name": "Gale Coral Convergence I"
            },
            "gale_coral_highlands_blocks2_II": {
              "name": "Gale Coral Convergence II"
            },
            "gale_coral_highlands_blocks3_III": {
              "name": "Gale Coral Convergence III"
            },
            "gale_coral_highlands_blocks4_IV": {
              "name": "Gale Coral Convergence IV"
            }
          }
        },
        "obsidian_bloom_bastion": {
          "name": "黒耀花壁帯",
          "description": "黒曜石の峡谷と花咲く段丘と霧の谷が入り混じる防壁地形。",
          "blocks": {
            "obsidian_bloom_bastion_blocks1_I": {
              "name": "Obsidian Bloom Convergence I"
            },
            "obsidian_bloom_bastion_blocks2_II": {
              "name": "Obsidian Bloom Convergence II"
            },
            "obsidian_bloom_bastion_blocks3_III": {
              "name": "Obsidian Bloom Convergence III"
            },
            "obsidian_bloom_bastion_blocks4_IV": {
              "name": "Obsidian Bloom Convergence IV"
            }
          }
        },
        "crystal_mire_depths": {
          "name": "晶泥深淵",
          "description": "結晶化した湿地と底無しの淵が交差する輝く深層。",
          "blocks": {
            "crystal_mire_depths_blocks1_I": {
              "name": "Crystal Mire Convergence I"
            },
            "crystal_mire_depths_blocks2_II": {
              "name": "Crystal Mire Convergence II"
            },
            "crystal_mire_depths_blocks3_III": {
              "name": "Crystal Mire Convergence III"
            },
            "crystal_mire_depths_blocks4_IV": {
              "name": "Crystal Mire Convergence IV"
            }
          }
        },
        "verdant_cinder_barrens": {
          "name": "翠灼荒原",
          "description": "燃え残る灰原に芽吹く草木と熱風の荒野が共存する。",
          "blocks": {
            "verdant_cinder_barrens_blocks1_I": {
              "name": "Verdant Cinder Convergence I"
            },
            "verdant_cinder_barrens_blocks2_II": {
              "name": "Verdant Cinder Convergence II"
            },
            "verdant_cinder_barrens_blocks3_III": {
              "name": "Verdant Cinder Convergence III"
            },
            "verdant_cinder_barrens_blocks4_IV": {
              "name": "Verdant Cinder Convergence IV"
            }
          }
        },
        "deepwood_cavernfall": {
          "name": "深林洞瀑領域",
          "description": "巨大な洞窟内に樹海と滝と霧が混在する垂直世界。",
          "blocks": {
            "deepwood_cavernfall_blocks1_I": {
              "name": "Cavernfall Convergence I"
            },
            "deepwood_cavernfall_blocks2_II": {
              "name": "Cavernfall Convergence II"
            },
            "deepwood_cavernfall_blocks3_III": {
              "name": "Cavernfall Convergence III"
            },
            "deepwood_cavernfall_blocks4_IV": {
              "name": "Cavernfall Convergence IV"
            }
          }
        },
        "arcanum_glasswastes": {
          "name": "秘術玻璃荒野",
          "description": "秘術で融解した砂漠と結晶化した峡谷が広がる荒野。",
          "blocks": {
            "arcanum_glasswastes_blocks1_I": {
              "name": "Glasswastes Convergence I"
            },
            "arcanum_glasswastes_blocks2_II": {
              "name": "Glasswastes Convergence II"
            },
            "arcanum_glasswastes_blocks3_III": {
              "name": "Glasswastes Convergence III"
            },
            "arcanum_glasswastes_blocks4_IV": {
              "name": "Glasswastes Convergence IV"
            }
          }
        },
        "twilight_lotus_marsh": {
          "name": "黄昏蓮湿原",
          "description": "夕暮れに染まる蓮池と霞む湿原と影の森が交錯する。",
          "blocks": {
            "twilight_lotus_marsh_blocks1_I": {
              "name": "Twilight Lotus Convergence I"
            },
            "twilight_lotus_marsh_blocks2_II": {
              "name": "Twilight Lotus Convergence II"
            },
            "twilight_lotus_marsh_blocks3_III": {
              "name": "Twilight Lotus Convergence III"
            },
            "twilight_lotus_marsh_blocks4_IV": {
              "name": "Twilight Lotus Convergence IV"
            }
          }
        },
        "stellar_reef_sanctum": {
          "name": "星珊瑚聖域",
          "description": "星屑のように輝く珊瑚と夜光虫の海底が入り混じる聖域。",
          "blocks": {
            "stellar_reef_sanctum_blocks1_I": {
              "name": "Stellar Reef Convergence I"
            },
            "stellar_reef_sanctum_blocks2_II": {
              "name": "Stellar Reef Convergence II"
            },
            "stellar_reef_sanctum_blocks3_III": {
              "name": "Stellar Reef Convergence III"
            },
            "stellar_reef_sanctum_blocks4_IV": {
              "name": "Stellar Reef Convergence IV"
            }
          }
        },
        "ashen_aurora_ridge": {
          "name": "灰極光稜線",
          "description": "灰の雪原に極光が差す山脈と蒼い洞窟が混在する稜線。",
          "blocks": {
            "ashen_aurora_ridge_blocks1_I": {
              "name": "Ashen Aurora Convergence I"
            },
            "ashen_aurora_ridge_blocks2_II": {
              "name": "Ashen Aurora Convergence II"
            },
            "ashen_aurora_ridge_blocks3_III": {
              "name": "Ashen Aurora Convergence III"
            },
            "ashen_aurora_ridge_blocks4_IV": {
              "name": "Ashen Aurora Convergence IV"
            }
          }
        },
        "chaos_biome": {
          "name": "カオスバイオーム",
          "description": "全てのバイオームが渦巻く極大融合領域。色彩と気候が刻々と変化する混沌空間。",
          "blocks": {
            "chaos_biome_blocks1_I": {
              "name": "Chaos Biome Convergence I"
            },
            "chaos_biome_blocks2_II": {
              "name": "Chaos Biome Convergence II"
            },
            "chaos_biome_blocks3_III": {
              "name": "Chaos Biome Convergence III"
            },
            "chaos_biome_blocks4_IV": {
              "name": "Chaos Biome Convergence IV"
            }
          }
        },
        "sealed_radio_den": {
          "name": "電波の閉ざされた密室",
          "description": "遮断された鋼壁と微かな警告灯が点滅する、閉ざされた通信遮断エリア。",
          "blocks": {
            "sealed-radio-den_theme_1": {
              "name": "電波の閉ざされた密室・外殻"
            },
            "sealed-radio-den_core_1": {
              "name": "電波の閉ざされた密室・中枢"
            },
            "sealed-radio-den_relic_1": {
              "name": "電波の閉ざされた密室・信号核"
            }
          }
        },
        "phantasmagoric_woods": {
          "name": "幻妖の森",
          "description": "幻光のツタが絡み合い、霧の奥からノイズ混じりの囁きが響く幽玄の森域。",
          "blocks": {
            "phantasmagoric-woods_theme_2": {
              "name": "幻妖の森・外殻"
            },
            "phantasmagoric-woods_core_2": {
              "name": "幻妖の森・中枢"
            },
            "phantasmagoric-woods_relic_2": {
              "name": "幻妖の森・信号核"
            }
          }
        },
        "ultra_secure_base": {
          "name": "超機密基地",
          "description": "多重遮蔽された制御区画。乱れた干渉波が監視網を走査している。",
          "blocks": {
            "ultra-secure-base_theme_3": {
              "name": "超機密基地・外殻"
            },
            "ultra-secure-base_core_3": {
              "name": "超機密基地・中枢"
            },
            "ultra-secure-base_relic_3": {
              "name": "超機密基地・信号核"
            }
          }
        },
        "echo_control_sector": {
          "name": "残響制御区画",
          "description": "電磁反響を閉じ込める層が幾重にも並ぶ、計測用の調整セクター。",
          "blocks": {
            "echo-control-sector_theme_4": {
              "name": "残響制御区画・外殻"
            },
            "echo-control-sector_core_4": {
              "name": "残響制御区画・中枢"
            },
            "echo-control-sector_relic_4": {
              "name": "残響制御区画・信号核"
            }
          }
        },
        "phantom_circuit_grove": {
          "name": "幻影回路庭園",
          "description": "生体回路が発光し、虚像の枝葉が交錯する電磁庭園。暗闇に潜む音が錯綜する。",
          "blocks": {
            "phantom-circuit-grove_theme_5": {
              "name": "幻影回路庭園・外殻"
            },
            "phantom-circuit-grove_core_5": {
              "name": "幻影回路庭園・中枢"
            },
            "phantom-circuit-grove_relic_5": {
              "name": "幻影回路庭園・信号核"
            }
          }
        },
        "quantum_barrier_command": {
          "name": "量子障壁司令塔",
          "description": "量子障壁発生装置が林立する司令塔。干渉波の縞模様が空間を歪ませる。",
          "blocks": {
            "quantum-barrier-command_theme_6": {
              "name": "量子障壁司令塔・外殻"
            },
            "quantum-barrier-command_core_6": {
              "name": "量子障壁司令塔・中枢"
            },
            "quantum-barrier-command_relic_6": {
              "name": "量子障壁司令塔・信号核"
            }
          }
        },
        "starmist_signal_hall": {
          "name": "星霧交信の間",
          "description": "星霧が舞い、失われた星間通信が残響する聖堂。暗闇を彩るノイズが波打つ。",
          "blocks": {
            "starmist-signal-hall_theme_7": {
              "name": "星霧交信の間・外殻"
            },
            "starmist-signal-hall_core_7": {
              "name": "星霧交信の間・中枢"
            },
            "starmist-signal-hall_relic_7": {
              "name": "星霧交信の間・信号核"
            }
          }
        },
        "rupture_wave_reservoir": {
          "name": "断絶波動集積庫",
          "description": "隔離されたエネルギー庫。断絶波動が積層し、赤熱した配管が軋む。",
          "blocks": {
            "rupture-wave-reservoir_theme_8": {
              "name": "断絶波動集積庫・外殻"
            },
            "rupture-wave-reservoir_core_8": {
              "name": "断絶波動集積庫・中枢"
            },
            "rupture-wave-reservoir_relic_8": {
              "name": "断絶波動集積庫・信号核"
            }
          }
        },
        "sakura_ravine": {
          "name": "桜渓谷",
          "description": "桜花の舞い散る渓流と小橋が続く迷宮",
          "blocks": {
            "jp_sakura-ravine_journey": {
              "name": "桜渓谷 逍遥"
            },
            "jp_sakura-ravine_core": {
              "name": "桜渓谷 中核"
            },
            "jp_sakura-ravine_legend": {
              "name": "桜渓谷 伝承"
            }
          }
        },
        "zen_garden": {
          "name": "枯山水庭苑",
          "description": "白砂を波紋状に引き整えた静謐な庭園",
          "blocks": {
            "jp_zen-garden_journey": {
              "name": "枯山水庭苑 逍遥"
            },
            "jp_zen-garden_core": {
              "name": "枯山水庭苑 中核"
            },
            "jp_zen-garden_legend": {
              "name": "枯山水庭苑 祭事"
            }
          }
        },
        "pagoda_quarter": {
          "name": "塔郭街区",
          "description": "多層の塔と瓦屋根が並ぶ古都の街並み",
          "blocks": {
            "jp_pagoda-quarter_journey": {
              "name": "塔郭街区 逍遥"
            },
            "jp_pagoda-quarter_core": {
              "name": "塔郭街区 中核"
            },
            "jp_pagoda-quarter_legend": {
              "name": "塔郭街区 伝承"
            }
          }
        },
        "shogun_keep": {
          "name": "将軍居城",
          "description": "堀と石垣で守られた堅牢な城郭",
          "blocks": {
            "jp_shogun-keep_journey": {
              "name": "将軍居城 逍遥"
            },
            "jp_shogun-keep_core": {
              "name": "将軍居城 中核"
            },
            "jp_shogun-keep_legend": {
              "name": "将軍居城 伝承"
            }
          }
        },
        "tea_house_lanes": {
          "name": "茶屋小路",
          "description": "茶屋が点在する石畳の横丁",
          "blocks": {
            "jp_tea-house-lanes_journey": {
              "name": "茶屋小路 逍遥"
            },
            "jp_tea-house-lanes_core": {
              "name": "茶屋小路 中核"
            },
            "jp_tea-house-lanes_legend": {
              "name": "茶屋小路 祭事"
            }
          }
        },
        "torii_ridge": {
          "name": "鳥居の尾根道",
          "description": "朱塗りの鳥居が連なる山道",
          "blocks": {
            "jp_torii-ridge_journey": {
              "name": "鳥居の尾根道 逍遥"
            },
            "jp_torii-ridge_core": {
              "name": "鳥居の尾根道 中核"
            },
            "jp_torii-ridge_legend": {
              "name": "鳥居の尾根道 伝承"
            }
          }
        },
        "koi_garden": {
          "name": "錦鯉庭園",
          "description": "池と太鼓橋が彩る庭園迷宮",
          "blocks": {
            "jp_koi-garden_journey": {
              "name": "錦鯉庭園 逍遥"
            },
            "jp_koi-garden_core": {
              "name": "錦鯉庭園 中核"
            },
            "jp_koi-garden_legend": {
              "name": "錦鯉庭園 祭事"
            }
          }
        },
        "onsen_terraces": {
          "name": "温泉段丘",
          "description": "湯煙が立ち昇る段丘状の温泉郷",
          "blocks": {
            "jp_onsen-terraces_journey": {
              "name": "温泉段丘 逍遥"
            },
            "jp_onsen-terraces_core": {
              "name": "温泉段丘 中核"
            },
            "jp_onsen-terraces_legend": {
              "name": "温泉段丘 伝承"
            }
          }
        },
        "rice_terraces": {
          "name": "棚田山里",
          "description": "段々に広がる棚田と山里の迷路",
          "blocks": {
            "jp_rice-terraces_journey": {
              "name": "棚田山里 逍遥"
            },
            "jp_rice-terraces_core": {
              "name": "棚田山里 中核"
            },
            "jp_rice-terraces_legend": {
              "name": "棚田山里 祭事"
            }
          }
        },
        "momiji_cliffs": {
          "name": "紅葉断崖",
          "description": "燃える紅葉と苔むした断崖が交差する峡谷迷路",
          "blocks": {
            "jp_momiji-cliffs_journey": {
              "name": "紅葉断崖 逍遥"
            },
            "jp_momiji-cliffs_core": {
              "name": "紅葉断崖 中核"
            },
            "jp_momiji-cliffs_legend": {
              "name": "紅葉断崖 伝承"
            }
          }
        },
        "moonlit_bamboo": {
          "name": "月竹幽境",
          "description": "月光と蛍が揺らめく竹林の秘境",
          "blocks": {
            "jp_moonlit-bamboo_journey": {
              "name": "月竹幽境 逍遥"
            },
            "jp_moonlit-bamboo_core": {
              "name": "月竹幽境 中核"
            },
            "jp_moonlit-bamboo_legend": {
              "name": "月竹幽境 祭事"
            }
          }
        },
        "snow_view_shrine": {
          "name": "雪見神苑",
          "description": "雪灯籠と社殿が静かに佇む冬の神苑",
          "blocks": {
            "jp_snow-view-shrine_journey": {
              "name": "雪見神苑 逍遥"
            },
            "jp_snow-view-shrine_core": {
              "name": "雪見神苑 中核"
            },
            "jp_snow-view-shrine_legend": {
              "name": "雪見神苑 伝承"
            }
          }
        },
        "ukiyo_district": {
          "name": "浮世絵長屋",
          "description": "色鮮やかな暖簾と格子が並ぶ町人街の迷廊",
          "blocks": {
            "jp_ukiyo-district_journey": {
              "name": "浮世絵長屋 逍遥"
            },
            "jp_ukiyo-district_core": {
              "name": "浮世絵長屋 中核"
            },
            "jp_ukiyo-district_legend": {
              "name": "浮世絵長屋 祭事"
            }
          }
        },
        "nebuta_floats": {
          "name": "ねぶた行列",
          "description": "巨大な灯籠山車が進む祭列の大路",
          "blocks": {
            "jp_nebuta-floats_journey": {
              "name": "ねぶた行列 逍遥"
            },
            "jp_nebuta-floats_core": {
              "name": "ねぶた行列 中核"
            },
            "jp_nebuta-floats_legend": {
              "name": "ねぶた行列 伝承"
            }
          }
        },
        "wisteria_veil": {
          "name": "藤花回廊",
          "description": "藤棚が紫の幕を垂らす幻想的な回廊庭園",
          "blocks": {
            "jp_wisteria-veil_journey": {
              "name": "藤花回廊 逍遥"
            },
            "jp_wisteria-veil_core": {
              "name": "藤花回廊 中核"
            },
            "jp_wisteria-veil_legend": {
              "name": "藤花回廊 祭事"
            }
          }
        },
        "grand_shrine_precincts": {
          "name": "大神社境内",
          "description": "朱塗りの鳥居と拝殿が連なる厳かな神社の境内",
          "blocks": {
            "jp_grand-shrine-precincts_journey": {
              "name": "大神社境内 逍遥"
            },
            "jp_grand-shrine-precincts_core": {
              "name": "大神社境内 中核"
            },
            "jp_grand-shrine-precincts_legend": {
              "name": "大神社境内 伝承"
            }
          }
        },
        "mountain_temple_terraces": {
          "name": "山寺石段",
          "description": "山肌に沿って石段と堂宇が連なる静謐な山寺",
          "blocks": {
            "jp_mountain-temple-terraces_journey": {
              "name": "山寺石段 逍遥"
            },
            "jp_mountain-temple-terraces_core": {
              "name": "山寺石段 中核"
            },
            "jp_mountain-temple-terraces_legend": {
              "name": "山寺石段 祭事"
            }
          }
        },
        "sunrise_bamboo_sea": {
          "name": "朝霧竹海",
          "description": "朝霧の差し込む竹林を縫う爽やかな小径",
          "blocks": {
            "jp_sunrise-bamboo-sea_journey": {
              "name": "朝霧竹海 逍遥"
            },
            "jp_sunrise-bamboo-sea_core": {
              "name": "朝霧竹海 中核"
            },
            "jp_sunrise-bamboo-sea_legend": {
              "name": "朝霧竹海 伝承"
            }
          }
        },
        "solitary_farmstead": {
          "name": "山里一軒家",
          "description": "山里にぽつんと佇む茅葺きの一軒家と畑",
          "blocks": {
            "jp_solitary-farmstead_journey": {
              "name": "山里一軒家 逍遥"
            },
            "jp_solitary-farmstead_core": {
              "name": "山里一軒家 中核"
            },
            "jp_solitary-farmstead_legend": {
              "name": "山里一軒家 祭事"
            }
          }
        },
        "mountain_pass_trail": {
          "name": "峠山道",
          "description": "崖と樹林の間を縫う細い山道と茶屋の跡",
          "blocks": {
            "jp_mountain-pass-trail_journey": {
              "name": "峠山道 逍遥"
            },
            "jp_mountain-pass-trail_core": {
              "name": "峠山道 中核"
            },
            "jp_mountain-pass-trail_legend": {
              "name": "峠山道 伝承"
            }
          }
        },
        "ancestral_graveyard": {
          "name": "里山墓地",
          "description": "苔むした石塔と供養灯籠が並ぶ静かな墓地",
          "blocks": {
            "jp_ancestral-graveyard_journey": {
              "name": "里山墓地 逍遥"
            },
            "jp_ancestral-graveyard_core": {
              "name": "里山墓地 中核"
            },
            "jp_ancestral-graveyard_legend": {
              "name": "里山墓地 祭事"
            }
          }
        },
        "prismatic_cities": {
          "name": "プリズマティック都市層",
          "description": "光の輪と浮遊都市が折り重なる幻想の大通り。虹色の軌道が多層構造を描く",
          "blocks": {
            "prism_strider_blocks1_1": {
              "name": "Prism Strider I"
            },
            "prism_strider_blocks1_2": {
              "name": "Prism Strider II"
            },
            "prism_strider_blocks1_3": {
              "name": "Prism Strider III"
            },
            "prism_strider_blocks1_4": {
              "name": "Prism Strider IV"
            },
            "prism_strider_blocks1_5": {
              "name": "Prism Strider V"
            },
            "prism_strider_blocks2_1": {
              "name": "Prism Strider I"
            },
            "prism_strider_blocks2_2": {
              "name": "Prism Strider II"
            },
            "prism_strider_blocks2_3": {
              "name": "Prism Strider III"
            },
            "prism_strider_blocks2_4": {
              "name": "Prism Strider IV"
            },
            "prism_strider_blocks2_5": {
              "name": "Prism Strider V"
            },
            "prism_strider_blocks3_1": {
              "name": "Prism Strider I"
            },
            "prism_strider_blocks3_2": {
              "name": "Prism Strider II"
            },
            "prism_strider_blocks3_3": {
              "name": "Prism Strider III"
            },
            "prism_strider_blocks3_4": {
              "name": "Prism Strider IV"
            },
            "prism_strider_blocks3_5": {
              "name": "Prism Strider V"
            }
          }
        },
        "neon_orbitarium": {
          "name": "ネオン軌道庭園",
          "description": "重力がねじれた軌道庭園。プラズマの水路とホログラムが交差し惑星庭園が浮遊する",
          "blocks": {
            "orbit_gardener_blocks1_1": {
              "name": "Orbit Gardener I"
            },
            "orbit_gardener_blocks1_2": {
              "name": "Orbit Gardener II"
            },
            "orbit_gardener_blocks1_3": {
              "name": "Orbit Gardener III"
            },
            "orbit_gardener_blocks1_4": {
              "name": "Orbit Gardener IV"
            },
            "orbit_gardener_blocks1_5": {
              "name": "Orbit Gardener V"
            },
            "orbit_gardener_blocks2_1": {
              "name": "Orbit Gardener I"
            },
            "orbit_gardener_blocks2_2": {
              "name": "Orbit Gardener II"
            },
            "orbit_gardener_blocks2_3": {
              "name": "Orbit Gardener III"
            },
            "orbit_gardener_blocks2_4": {
              "name": "Orbit Gardener IV"
            },
            "orbit_gardener_blocks2_5": {
              "name": "Orbit Gardener V"
            },
            "orbit_gardener_blocks3_1": {
              "name": "Orbit Gardener I"
            },
            "orbit_gardener_blocks3_2": {
              "name": "Orbit Gardener II"
            },
            "orbit_gardener_blocks3_3": {
              "name": "Orbit Gardener III"
            },
            "orbit_gardener_blocks3_4": {
              "name": "Orbit Gardener IV"
            },
            "orbit_gardener_blocks3_5": {
              "name": "Orbit Gardener V"
            }
          }
        },
        "lucid_reef": {
          "name": "ルシッドリーフ",
          "description": "夢見のリーフ海底。睡蓮のようなプラズマが揺らぎ、潮流は極光に染まる",
          "blocks": {
            "reef_phantom_blocks1_1": {
              "name": "Reef Phantom I"
            },
            "reef_phantom_blocks1_2": {
              "name": "Reef Phantom II"
            },
            "reef_phantom_blocks1_3": {
              "name": "Reef Phantom III"
            },
            "reef_phantom_blocks1_4": {
              "name": "Reef Phantom IV"
            },
            "reef_phantom_blocks1_5": {
              "name": "Reef Phantom V"
            },
            "reef_phantom_blocks2_1": {
              "name": "Reef Phantom I"
            },
            "reef_phantom_blocks2_2": {
              "name": "Reef Phantom II"
            },
            "reef_phantom_blocks2_3": {
              "name": "Reef Phantom III"
            },
            "reef_phantom_blocks2_4": {
              "name": "Reef Phantom IV"
            },
            "reef_phantom_blocks2_5": {
              "name": "Reef Phantom V"
            },
            "reef_phantom_blocks3_1": {
              "name": "Reef Phantom I"
            },
            "reef_phantom_blocks3_2": {
              "name": "Reef Phantom II"
            },
            "reef_phantom_blocks3_3": {
              "name": "Reef Phantom III"
            },
            "reef_phantom_blocks3_4": {
              "name": "Reef Phantom IV"
            },
            "reef_phantom_blocks3_5": {
              "name": "Reef Phantom V"
            }
          }
        },
        "chrono_forge": {
          "name": "クロノフォージ",
          "description": "時間を鍛える時計仕掛けの工廠。時限炉心と回転式の路線が絡み合う",
          "blocks": {
            "chrono_mason_blocks1_1": {
              "name": "Chrono Mason I"
            },
            "chrono_mason_blocks1_2": {
              "name": "Chrono Mason II"
            },
            "chrono_mason_blocks1_3": {
              "name": "Chrono Mason III"
            },
            "chrono_mason_blocks1_4": {
              "name": "Chrono Mason IV"
            },
            "chrono_mason_blocks1_5": {
              "name": "Chrono Mason V"
            },
            "chrono_mason_blocks2_1": {
              "name": "Chrono Mason I"
            },
            "chrono_mason_blocks2_2": {
              "name": "Chrono Mason II"
            },
            "chrono_mason_blocks2_3": {
              "name": "Chrono Mason III"
            },
            "chrono_mason_blocks2_4": {
              "name": "Chrono Mason IV"
            },
            "chrono_mason_blocks2_5": {
              "name": "Chrono Mason V"
            },
            "chrono_mason_blocks3_1": {
              "name": "Chrono Mason I"
            },
            "chrono_mason_blocks3_2": {
              "name": "Chrono Mason II"
            },
            "chrono_mason_blocks3_3": {
              "name": "Chrono Mason III"
            },
            "chrono_mason_blocks3_4": {
              "name": "Chrono Mason IV"
            },
            "chrono_mason_blocks3_5": {
              "name": "Chrono Mason V"
            }
          }
        },
        "dreamway_spirals": {
          "name": "ドリームウェイスパイラル",
          "description": "多層の螺旋がどこまでも降りていく幻夢の通路。螺旋は別世界の入り口へ連結する",
          "blocks": {
            "dream_weaver_blocks1_1": {
              "name": "Dream Weaver I"
            },
            "dream_weaver_blocks1_2": {
              "name": "Dream Weaver II"
            },
            "dream_weaver_blocks1_3": {
              "name": "Dream Weaver III"
            },
            "dream_weaver_blocks1_4": {
              "name": "Dream Weaver IV"
            },
            "dream_weaver_blocks1_5": {
              "name": "Dream Weaver V"
            },
            "dream_weaver_blocks2_1": {
              "name": "Dream Weaver I"
            },
            "dream_weaver_blocks2_2": {
              "name": "Dream Weaver II"
            },
            "dream_weaver_blocks2_3": {
              "name": "Dream Weaver III"
            },
            "dream_weaver_blocks2_4": {
              "name": "Dream Weaver IV"
            },
            "dream_weaver_blocks2_5": {
              "name": "Dream Weaver V"
            },
            "dream_weaver_blocks3_1": {
              "name": "Dream Weaver I"
            },
            "dream_weaver_blocks3_2": {
              "name": "Dream Weaver II"
            },
            "dream_weaver_blocks3_3": {
              "name": "Dream Weaver III"
            },
            "dream_weaver_blocks3_4": {
              "name": "Dream Weaver IV"
            },
            "dream_weaver_blocks3_5": {
              "name": "Dream Weaver V"
            }
          }
        },
        "astral_symbiosis": {
          "name": "アストラル共鳴苑",
          "description": "星屑樹とサイバーロータスが共存する庭園。軌跡と根が交互に織り込まれる",
          "blocks": {
            "symbiont_keeper_blocks1_1": {
              "name": "Symbiont Keeper I"
            },
            "symbiont_keeper_blocks1_2": {
              "name": "Symbiont Keeper II"
            },
            "symbiont_keeper_blocks1_3": {
              "name": "Symbiont Keeper III"
            },
            "symbiont_keeper_blocks1_4": {
              "name": "Symbiont Keeper IV"
            },
            "symbiont_keeper_blocks1_5": {
              "name": "Symbiont Keeper V"
            },
            "symbiont_keeper_blocks2_1": {
              "name": "Symbiont Keeper I"
            },
            "symbiont_keeper_blocks2_2": {
              "name": "Symbiont Keeper II"
            },
            "symbiont_keeper_blocks2_3": {
              "name": "Symbiont Keeper III"
            },
            "symbiont_keeper_blocks2_4": {
              "name": "Symbiont Keeper IV"
            },
            "symbiont_keeper_blocks2_5": {
              "name": "Symbiont Keeper V"
            },
            "symbiont_keeper_blocks3_1": {
              "name": "Symbiont Keeper I"
            },
            "symbiont_keeper_blocks3_2": {
              "name": "Symbiont Keeper II"
            },
            "symbiont_keeper_blocks3_3": {
              "name": "Symbiont Keeper III"
            },
            "symbiont_keeper_blocks3_4": {
              "name": "Symbiont Keeper IV"
            },
            "symbiont_keeper_blocks3_5": {
              "name": "Symbiont Keeper V"
            }
          }
        },
        "mirrored_citadel": {
          "name": "鏡映城郭界",
          "description": "上下反転の城郭が重なり、鏡面軸が光る。重力に逆らう城壁が伸びる",
          "blocks": {
            "mirror_sentinel_blocks1_1": {
              "name": "Mirror Sentinel I"
            },
            "mirror_sentinel_blocks1_2": {
              "name": "Mirror Sentinel II"
            },
            "mirror_sentinel_blocks1_3": {
              "name": "Mirror Sentinel III"
            },
            "mirror_sentinel_blocks1_4": {
              "name": "Mirror Sentinel IV"
            },
            "mirror_sentinel_blocks1_5": {
              "name": "Mirror Sentinel V"
            },
            "mirror_sentinel_blocks2_1": {
              "name": "Mirror Sentinel I"
            },
            "mirror_sentinel_blocks2_2": {
              "name": "Mirror Sentinel II"
            },
            "mirror_sentinel_blocks2_3": {
              "name": "Mirror Sentinel III"
            },
            "mirror_sentinel_blocks2_4": {
              "name": "Mirror Sentinel IV"
            },
            "mirror_sentinel_blocks2_5": {
              "name": "Mirror Sentinel V"
            },
            "mirror_sentinel_blocks3_1": {
              "name": "Mirror Sentinel I"
            },
            "mirror_sentinel_blocks3_2": {
              "name": "Mirror Sentinel II"
            },
            "mirror_sentinel_blocks3_3": {
              "name": "Mirror Sentinel III"
            },
            "mirror_sentinel_blocks3_4": {
              "name": "Mirror Sentinel IV"
            },
            "mirror_sentinel_blocks3_5": {
              "name": "Mirror Sentinel V"
            }
          }
        },
        "biotech_sanctum": {
          "name": "バイオテックの聖環",
          "description": "有機機械と発光植物が共鳴する螺旋聖堂。生命と回路が絡み合う",
          "blocks": {
            "bioengine_archon_blocks1_1": {
              "name": "Bioengine Archon I"
            },
            "bioengine_archon_blocks1_2": {
              "name": "Bioengine Archon II"
            },
            "bioengine_archon_blocks1_3": {
              "name": "Bioengine Archon III"
            },
            "bioengine_archon_blocks1_4": {
              "name": "Bioengine Archon IV"
            },
            "bioengine_archon_blocks1_5": {
              "name": "Bioengine Archon V"
            },
            "bioengine_archon_blocks2_1": {
              "name": "Bioengine Archon I"
            },
            "bioengine_archon_blocks2_2": {
              "name": "Bioengine Archon II"
            },
            "bioengine_archon_blocks2_3": {
              "name": "Bioengine Archon III"
            },
            "bioengine_archon_blocks2_4": {
              "name": "Bioengine Archon IV"
            },
            "bioengine_archon_blocks2_5": {
              "name": "Bioengine Archon V"
            },
            "bioengine_archon_blocks3_1": {
              "name": "Bioengine Archon I"
            },
            "bioengine_archon_blocks3_2": {
              "name": "Bioengine Archon II"
            },
            "bioengine_archon_blocks3_3": {
              "name": "Bioengine Archon III"
            },
            "bioengine_archon_blocks3_4": {
              "name": "Bioengine Archon IV"
            },
            "bioengine_archon_blocks3_5": {
              "name": "Bioengine Archon V"
            }
          }
        },
        "vaporwave_transit": {
          "name": "ヴェイパートランジット",
          "description": "幻想都市を結ぶ浮遊鉄道。モジュラーな駅とチューブが滑らかに曲線を描く",
          "blocks": {
            "transit_conductor_blocks1_1": {
              "name": "Transit Conductor I"
            },
            "transit_conductor_blocks1_2": {
              "name": "Transit Conductor II"
            },
            "transit_conductor_blocks1_3": {
              "name": "Transit Conductor III"
            },
            "transit_conductor_blocks1_4": {
              "name": "Transit Conductor IV"
            },
            "transit_conductor_blocks1_5": {
              "name": "Transit Conductor V"
            },
            "transit_conductor_blocks2_1": {
              "name": "Transit Conductor I"
            },
            "transit_conductor_blocks2_2": {
              "name": "Transit Conductor II"
            },
            "transit_conductor_blocks2_3": {
              "name": "Transit Conductor III"
            },
            "transit_conductor_blocks2_4": {
              "name": "Transit Conductor IV"
            },
            "transit_conductor_blocks2_5": {
              "name": "Transit Conductor V"
            },
            "transit_conductor_blocks3_1": {
              "name": "Transit Conductor I"
            },
            "transit_conductor_blocks3_2": {
              "name": "Transit Conductor II"
            },
            "transit_conductor_blocks3_3": {
              "name": "Transit Conductor III"
            },
            "transit_conductor_blocks3_4": {
              "name": "Transit Conductor IV"
            },
            "transit_conductor_blocks3_5": {
              "name": "Transit Conductor V"
            }
          }
        },
        "abyssal_aurora": {
          "name": "アビサルオーロラ海淵",
          "description": "深海と星霊が交わる海淵。極光が渦巻き、暗黒の柱が立ち上る",
          "blocks": {
            "abyssal_lantern_blocks1_1": {
              "name": "Abyssal Lantern I"
            },
            "abyssal_lantern_blocks1_2": {
              "name": "Abyssal Lantern II"
            },
            "abyssal_lantern_blocks1_3": {
              "name": "Abyssal Lantern III"
            },
            "abyssal_lantern_blocks1_4": {
              "name": "Abyssal Lantern IV"
            },
            "abyssal_lantern_blocks1_5": {
              "name": "Abyssal Lantern V"
            },
            "abyssal_lantern_blocks2_1": {
              "name": "Abyssal Lantern I"
            },
            "abyssal_lantern_blocks2_2": {
              "name": "Abyssal Lantern II"
            },
            "abyssal_lantern_blocks2_3": {
              "name": "Abyssal Lantern III"
            },
            "abyssal_lantern_blocks2_4": {
              "name": "Abyssal Lantern IV"
            },
            "abyssal_lantern_blocks2_5": {
              "name": "Abyssal Lantern V"
            },
            "abyssal_lantern_blocks3_1": {
              "name": "Abyssal Lantern I"
            },
            "abyssal_lantern_blocks3_2": {
              "name": "Abyssal Lantern II"
            },
            "abyssal_lantern_blocks3_3": {
              "name": "Abyssal Lantern III"
            },
            "abyssal_lantern_blocks3_4": {
              "name": "Abyssal Lantern IV"
            },
            "abyssal_lantern_blocks3_5": {
              "name": "Abyssal Lantern V"
            }
          }
        },
        "quantum_dunes": {
          "name": "量子砂海",
          "description": "砂漠と量子回路が重なり合う砂海。砂粒が量子化され波打つ",
          "blocks": {
            "quantum_rider_blocks1_1": {
              "name": "Quantum Rider I"
            },
            "quantum_rider_blocks1_2": {
              "name": "Quantum Rider II"
            },
            "quantum_rider_blocks1_3": {
              "name": "Quantum Rider III"
            },
            "quantum_rider_blocks1_4": {
              "name": "Quantum Rider IV"
            },
            "quantum_rider_blocks1_5": {
              "name": "Quantum Rider V"
            },
            "quantum_rider_blocks2_1": {
              "name": "Quantum Rider I"
            },
            "quantum_rider_blocks2_2": {
              "name": "Quantum Rider II"
            },
            "quantum_rider_blocks2_3": {
              "name": "Quantum Rider III"
            },
            "quantum_rider_blocks2_4": {
              "name": "Quantum Rider IV"
            },
            "quantum_rider_blocks2_5": {
              "name": "Quantum Rider V"
            },
            "quantum_rider_blocks3_1": {
              "name": "Quantum Rider I"
            },
            "quantum_rider_blocks3_2": {
              "name": "Quantum Rider II"
            },
            "quantum_rider_blocks3_3": {
              "name": "Quantum Rider III"
            },
            "quantum_rider_blocks3_4": {
              "name": "Quantum Rider IV"
            },
            "quantum_rider_blocks3_5": {
              "name": "Quantum Rider V"
            }
          }
        },
        "chrono_mirage": {
          "name": "クロノミラージュ回廊",
          "description": "時の蜃気楼が階層化した回廊を生む。時間差で異なる路線が交差する",
          "blocks": {
            "chrono_specter_blocks1_1": {
              "name": "Chrono Specter I"
            },
            "chrono_specter_blocks1_2": {
              "name": "Chrono Specter II"
            },
            "chrono_specter_blocks1_3": {
              "name": "Chrono Specter III"
            },
            "chrono_specter_blocks1_4": {
              "name": "Chrono Specter IV"
            },
            "chrono_specter_blocks1_5": {
              "name": "Chrono Specter V"
            },
            "chrono_specter_blocks2_1": {
              "name": "Chrono Specter I"
            },
            "chrono_specter_blocks2_2": {
              "name": "Chrono Specter II"
            },
            "chrono_specter_blocks2_3": {
              "name": "Chrono Specter III"
            },
            "chrono_specter_blocks2_4": {
              "name": "Chrono Specter IV"
            },
            "chrono_specter_blocks2_5": {
              "name": "Chrono Specter V"
            },
            "chrono_specter_blocks3_1": {
              "name": "Chrono Specter I"
            },
            "chrono_specter_blocks3_2": {
              "name": "Chrono Specter II"
            },
            "chrono_specter_blocks3_3": {
              "name": "Chrono Specter III"
            },
            "chrono_specter_blocks3_4": {
              "name": "Chrono Specter IV"
            },
            "chrono_specter_blocks3_5": {
              "name": "Chrono Specter V"
            }
          }
        },
        "spectral_archive": {
          "name": "スペクトラルアーカイブ",
          "description": "霊光図書の回廊。資料を守るアーカイブサーバが星霊の階段と融合する",
          "blocks": {
            "archive_curator_blocks1_1": {
              "name": "Archive Curator I"
            },
            "archive_curator_blocks1_2": {
              "name": "Archive Curator II"
            },
            "archive_curator_blocks1_3": {
              "name": "Archive Curator III"
            },
            "archive_curator_blocks1_4": {
              "name": "Archive Curator IV"
            },
            "archive_curator_blocks1_5": {
              "name": "Archive Curator V"
            },
            "archive_curator_blocks2_1": {
              "name": "Archive Curator I"
            },
            "archive_curator_blocks2_2": {
              "name": "Archive Curator II"
            },
            "archive_curator_blocks2_3": {
              "name": "Archive Curator III"
            },
            "archive_curator_blocks2_4": {
              "name": "Archive Curator IV"
            },
            "archive_curator_blocks2_5": {
              "name": "Archive Curator V"
            },
            "archive_curator_blocks3_1": {
              "name": "Archive Curator I"
            },
            "archive_curator_blocks3_2": {
              "name": "Archive Curator II"
            },
            "archive_curator_blocks3_3": {
              "name": "Archive Curator III"
            },
            "archive_curator_blocks3_4": {
              "name": "Archive Curator IV"
            },
            "archive_curator_blocks3_5": {
              "name": "Archive Curator V"
            }
          }
        },
        "dream_mesa": {
          "name": "夢幻メサ浮島",
          "description": "浮遊メサが光の橋で繋がり、夢幻の砂が空に舞う",
          "blocks": {
            "mesa_walker_blocks1_1": {
              "name": "Mesa Walker I"
            },
            "mesa_walker_blocks1_2": {
              "name": "Mesa Walker II"
            },
            "mesa_walker_blocks1_3": {
              "name": "Mesa Walker III"
            },
            "mesa_walker_blocks1_4": {
              "name": "Mesa Walker IV"
            },
            "mesa_walker_blocks1_5": {
              "name": "Mesa Walker V"
            },
            "mesa_walker_blocks2_1": {
              "name": "Mesa Walker I"
            },
            "mesa_walker_blocks2_2": {
              "name": "Mesa Walker II"
            },
            "mesa_walker_blocks2_3": {
              "name": "Mesa Walker III"
            },
            "mesa_walker_blocks2_4": {
              "name": "Mesa Walker IV"
            },
            "mesa_walker_blocks2_5": {
              "name": "Mesa Walker V"
            },
            "mesa_walker_blocks3_1": {
              "name": "Mesa Walker I"
            },
            "mesa_walker_blocks3_2": {
              "name": "Mesa Walker II"
            },
            "mesa_walker_blocks3_3": {
              "name": "Mesa Walker III"
            },
            "mesa_walker_blocks3_4": {
              "name": "Mesa Walker IV"
            },
            "mesa_walker_blocks3_5": {
              "name": "Mesa Walker V"
            }
          }
        },
        "starlit_workshop": {
          "name": "星灯りの工房軌道",
          "description": "星灯りが指す軌道工房。カラフルなラインが工作機械へ繋がる",
          "blocks": {
            "stellar_artisan_blocks1_1": {
              "name": "Stellar Artisan I"
            },
            "stellar_artisan_blocks1_2": {
              "name": "Stellar Artisan II"
            },
            "stellar_artisan_blocks1_3": {
              "name": "Stellar Artisan III"
            },
            "stellar_artisan_blocks1_4": {
              "name": "Stellar Artisan IV"
            },
            "stellar_artisan_blocks1_5": {
              "name": "Stellar Artisan V"
            },
            "stellar_artisan_blocks2_1": {
              "name": "Stellar Artisan I"
            },
            "stellar_artisan_blocks2_2": {
              "name": "Stellar Artisan II"
            },
            "stellar_artisan_blocks2_3": {
              "name": "Stellar Artisan III"
            },
            "stellar_artisan_blocks2_4": {
              "name": "Stellar Artisan IV"
            },
            "stellar_artisan_blocks2_5": {
              "name": "Stellar Artisan V"
            },
            "stellar_artisan_blocks3_1": {
              "name": "Stellar Artisan I"
            },
            "stellar_artisan_blocks3_2": {
              "name": "Stellar Artisan II"
            },
            "stellar_artisan_blocks3_3": {
              "name": "Stellar Artisan III"
            },
            "stellar_artisan_blocks3_4": {
              "name": "Stellar Artisan IV"
            },
            "stellar_artisan_blocks3_5": {
              "name": "Stellar Artisan V"
            }
          }
        },
        "singularity_canopy": {
          "name": "シンギュラリティ樹冠",
          "description": "重力が反転する樹冠都市。量子樹液が光路をつくり、樹冠に都市が編み込まれる",
          "blocks": {
            "singularity_canopy_blocks1_1": {
              "name": "Singularity Canopy I"
            },
            "singularity_canopy_blocks1_2": {
              "name": "Singularity Canopy II"
            },
            "singularity_canopy_blocks1_3": {
              "name": "Singularity Canopy III"
            },
            "singularity_canopy_blocks1_4": {
              "name": "Singularity Canopy IV"
            },
            "singularity_canopy_blocks1_5": {
              "name": "Singularity Canopy V"
            },
            "singularity_canopy_blocks2_1": {
              "name": "Singularity Canopy I"
            },
            "singularity_canopy_blocks2_2": {
              "name": "Singularity Canopy II"
            },
            "singularity_canopy_blocks2_3": {
              "name": "Singularity Canopy III"
            },
            "singularity_canopy_blocks2_4": {
              "name": "Singularity Canopy IV"
            },
            "singularity_canopy_blocks2_5": {
              "name": "Singularity Canopy V"
            },
            "singularity_canopy_blocks3_1": {
              "name": "Singularity Canopy I"
            },
            "singularity_canopy_blocks3_2": {
              "name": "Singularity Canopy II"
            },
            "singularity_canopy_blocks3_3": {
              "name": "Singularity Canopy III"
            },
            "singularity_canopy_blocks3_4": {
              "name": "Singularity Canopy IV"
            },
            "singularity_canopy_blocks3_5": {
              "name": "Singularity Canopy V"
            }
          }
        },
        "chrono_pulse_transit": {
          "name": "クロノパルス輸送環",
          "description": "時間脈を滑るトラムと多層リング。脈動するホログラムが路線を導く",
          "blocks": {
            "chrono_pulse_conductor_blocks1_1": {
              "name": "Chrono Pulse Conductor I"
            },
            "chrono_pulse_conductor_blocks1_2": {
              "name": "Chrono Pulse Conductor II"
            },
            "chrono_pulse_conductor_blocks1_3": {
              "name": "Chrono Pulse Conductor III"
            },
            "chrono_pulse_conductor_blocks1_4": {
              "name": "Chrono Pulse Conductor IV"
            },
            "chrono_pulse_conductor_blocks1_5": {
              "name": "Chrono Pulse Conductor V"
            },
            "chrono_pulse_conductor_blocks2_1": {
              "name": "Chrono Pulse Conductor I"
            },
            "chrono_pulse_conductor_blocks2_2": {
              "name": "Chrono Pulse Conductor II"
            },
            "chrono_pulse_conductor_blocks2_3": {
              "name": "Chrono Pulse Conductor III"
            },
            "chrono_pulse_conductor_blocks2_4": {
              "name": "Chrono Pulse Conductor IV"
            },
            "chrono_pulse_conductor_blocks2_5": {
              "name": "Chrono Pulse Conductor V"
            },
            "chrono_pulse_conductor_blocks3_1": {
              "name": "Chrono Pulse Conductor I"
            },
            "chrono_pulse_conductor_blocks3_2": {
              "name": "Chrono Pulse Conductor II"
            },
            "chrono_pulse_conductor_blocks3_3": {
              "name": "Chrono Pulse Conductor III"
            },
            "chrono_pulse_conductor_blocks3_4": {
              "name": "Chrono Pulse Conductor IV"
            },
            "chrono_pulse_conductor_blocks3_5": {
              "name": "Chrono Pulse Conductor V"
            }
          }
        },
        "aurora_manufactorum": {
          "name": "オーロラ製造都市",
          "description": "極光炉と浮遊クレーンが交差する製造層。彩光のラインが機構を結ぶ",
          "blocks": {
            "aurora_fabricator_blocks1_1": {
              "name": "Aurora Fabricator I"
            },
            "aurora_fabricator_blocks1_2": {
              "name": "Aurora Fabricator II"
            },
            "aurora_fabricator_blocks1_3": {
              "name": "Aurora Fabricator III"
            },
            "aurora_fabricator_blocks1_4": {
              "name": "Aurora Fabricator IV"
            },
            "aurora_fabricator_blocks1_5": {
              "name": "Aurora Fabricator V"
            },
            "aurora_fabricator_blocks2_1": {
              "name": "Aurora Fabricator I"
            },
            "aurora_fabricator_blocks2_2": {
              "name": "Aurora Fabricator II"
            },
            "aurora_fabricator_blocks2_3": {
              "name": "Aurora Fabricator III"
            },
            "aurora_fabricator_blocks2_4": {
              "name": "Aurora Fabricator IV"
            },
            "aurora_fabricator_blocks2_5": {
              "name": "Aurora Fabricator V"
            },
            "aurora_fabricator_blocks3_1": {
              "name": "Aurora Fabricator I"
            },
            "aurora_fabricator_blocks3_2": {
              "name": "Aurora Fabricator II"
            },
            "aurora_fabricator_blocks3_3": {
              "name": "Aurora Fabricator III"
            },
            "aurora_fabricator_blocks3_4": {
              "name": "Aurora Fabricator IV"
            },
            "aurora_fabricator_blocks3_5": {
              "name": "Aurora Fabricator V"
            }
          }
        },
        "dream_turbine_gardens": {
          "name": "夢風タービン庭苑",
          "description": "風夢タービンが浮遊花園を撹拌する。睡蓮の光と風洞が重なる庭苑層",
          "blocks": {
            "dream_turbine_blocks1_1": {
              "name": "Dream Turbine Custodian I"
            },
            "dream_turbine_blocks1_2": {
              "name": "Dream Turbine Custodian II"
            },
            "dream_turbine_blocks1_3": {
              "name": "Dream Turbine Custodian III"
            },
            "dream_turbine_blocks1_4": {
              "name": "Dream Turbine Custodian IV"
            },
            "dream_turbine_blocks1_5": {
              "name": "Dream Turbine Custodian V"
            },
            "dream_turbine_blocks2_1": {
              "name": "Dream Turbine Custodian I"
            },
            "dream_turbine_blocks2_2": {
              "name": "Dream Turbine Custodian II"
            },
            "dream_turbine_blocks2_3": {
              "name": "Dream Turbine Custodian III"
            },
            "dream_turbine_blocks2_4": {
              "name": "Dream Turbine Custodian IV"
            },
            "dream_turbine_blocks2_5": {
              "name": "Dream Turbine Custodian V"
            },
            "dream_turbine_blocks3_1": {
              "name": "Dream Turbine Custodian I"
            },
            "dream_turbine_blocks3_2": {
              "name": "Dream Turbine Custodian II"
            },
            "dream_turbine_blocks3_3": {
              "name": "Dream Turbine Custodian III"
            },
            "dream_turbine_blocks3_4": {
              "name": "Dream Turbine Custodian IV"
            },
            "dream_turbine_blocks3_5": {
              "name": "Dream Turbine Custodian V"
            }
          }
        },
        "prism_oracle_vault": {
          "name": "プリズム神託庫",
          "description": "光の神託を格納した聖蔵。屈折回廊と光の井戸が交差する",
          "blocks": {
            "prism_oracle_blocks1_1": {
              "name": "Prism Oracle Keeper I"
            },
            "prism_oracle_blocks1_2": {
              "name": "Prism Oracle Keeper II"
            },
            "prism_oracle_blocks1_3": {
              "name": "Prism Oracle Keeper III"
            },
            "prism_oracle_blocks1_4": {
              "name": "Prism Oracle Keeper IV"
            },
            "prism_oracle_blocks1_5": {
              "name": "Prism Oracle Keeper V"
            },
            "prism_oracle_blocks2_1": {
              "name": "Prism Oracle Keeper I"
            },
            "prism_oracle_blocks2_2": {
              "name": "Prism Oracle Keeper II"
            },
            "prism_oracle_blocks2_3": {
              "name": "Prism Oracle Keeper III"
            },
            "prism_oracle_blocks2_4": {
              "name": "Prism Oracle Keeper IV"
            },
            "prism_oracle_blocks2_5": {
              "name": "Prism Oracle Keeper V"
            },
            "prism_oracle_blocks3_1": {
              "name": "Prism Oracle Keeper I"
            },
            "prism_oracle_blocks3_2": {
              "name": "Prism Oracle Keeper II"
            },
            "prism_oracle_blocks3_3": {
              "name": "Prism Oracle Keeper III"
            },
            "prism_oracle_blocks3_4": {
              "name": "Prism Oracle Keeper IV"
            },
            "prism_oracle_blocks3_5": {
              "name": "Prism Oracle Keeper V"
            }
          }
        },
        "nebular_cascade_plaza": {
          "name": "星雲カスケード広場",
          "description": "星雲の滝と浮遊層が交差する広場都市。霧と水脈が多層に重なる",
          "blocks": {
            "nebula_cascade_blocks1_1": {
              "name": "Nebula Cascade Marshal I"
            },
            "nebula_cascade_blocks1_2": {
              "name": "Nebula Cascade Marshal II"
            },
            "nebula_cascade_blocks1_3": {
              "name": "Nebula Cascade Marshal III"
            },
            "nebula_cascade_blocks1_4": {
              "name": "Nebula Cascade Marshal IV"
            },
            "nebula_cascade_blocks1_5": {
              "name": "Nebula Cascade Marshal V"
            },
            "nebula_cascade_blocks2_1": {
              "name": "Nebula Cascade Marshal I"
            },
            "nebula_cascade_blocks2_2": {
              "name": "Nebula Cascade Marshal II"
            },
            "nebula_cascade_blocks2_3": {
              "name": "Nebula Cascade Marshal III"
            },
            "nebula_cascade_blocks2_4": {
              "name": "Nebula Cascade Marshal IV"
            },
            "nebula_cascade_blocks2_5": {
              "name": "Nebula Cascade Marshal V"
            },
            "nebula_cascade_blocks3_1": {
              "name": "Nebula Cascade Marshal I"
            },
            "nebula_cascade_blocks3_2": {
              "name": "Nebula Cascade Marshal II"
            },
            "nebula_cascade_blocks3_3": {
              "name": "Nebula Cascade Marshal III"
            },
            "nebula_cascade_blocks3_4": {
              "name": "Nebula Cascade Marshal IV"
            },
            "nebula_cascade_blocks3_5": {
              "name": "Nebula Cascade Marshal V"
            }
          }
        },
        "astral_chorus_wells": {
          "name": "星界合唱井戸",
          "description": "星界の歌声が反響する井戸群。波紋と共鳴が交差する聖域",
          "blocks": {
            "astral_chorus_blocks1_1": {
              "name": "Astral Chorus Cantor I"
            },
            "astral_chorus_blocks1_2": {
              "name": "Astral Chorus Cantor II"
            },
            "astral_chorus_blocks1_3": {
              "name": "Astral Chorus Cantor III"
            },
            "astral_chorus_blocks1_4": {
              "name": "Astral Chorus Cantor IV"
            },
            "astral_chorus_blocks1_5": {
              "name": "Astral Chorus Cantor V"
            },
            "astral_chorus_blocks2_1": {
              "name": "Astral Chorus Cantor I"
            },
            "astral_chorus_blocks2_2": {
              "name": "Astral Chorus Cantor II"
            },
            "astral_chorus_blocks2_3": {
              "name": "Astral Chorus Cantor III"
            },
            "astral_chorus_blocks2_4": {
              "name": "Astral Chorus Cantor IV"
            },
            "astral_chorus_blocks2_5": {
              "name": "Astral Chorus Cantor V"
            },
            "astral_chorus_blocks3_1": {
              "name": "Astral Chorus Cantor I"
            },
            "astral_chorus_blocks3_2": {
              "name": "Astral Chorus Cantor II"
            },
            "astral_chorus_blocks3_3": {
              "name": "Astral Chorus Cantor III"
            },
            "astral_chorus_blocks3_4": {
              "name": "Astral Chorus Cantor IV"
            },
            "astral_chorus_blocks3_5": {
              "name": "Astral Chorus Cantor V"
            }
          }
        },
        "mirrored_spire_sanctum": {
          "name": "鏡晶尖塔聖堂",
          "description": "鏡面尖塔が層をなす聖堂。光の回廊が反射し続ける",
          "blocks": {
            "mirror_spire_blocks1_1": {
              "name": "Mirror Spire Warden I"
            },
            "mirror_spire_blocks1_2": {
              "name": "Mirror Spire Warden II"
            },
            "mirror_spire_blocks1_3": {
              "name": "Mirror Spire Warden III"
            },
            "mirror_spire_blocks1_4": {
              "name": "Mirror Spire Warden IV"
            },
            "mirror_spire_blocks1_5": {
              "name": "Mirror Spire Warden V"
            },
            "mirror_spire_blocks2_1": {
              "name": "Mirror Spire Warden I"
            },
            "mirror_spire_blocks2_2": {
              "name": "Mirror Spire Warden II"
            },
            "mirror_spire_blocks2_3": {
              "name": "Mirror Spire Warden III"
            },
            "mirror_spire_blocks2_4": {
              "name": "Mirror Spire Warden IV"
            },
            "mirror_spire_blocks2_5": {
              "name": "Mirror Spire Warden V"
            },
            "mirror_spire_blocks3_1": {
              "name": "Mirror Spire Warden I"
            },
            "mirror_spire_blocks3_2": {
              "name": "Mirror Spire Warden II"
            },
            "mirror_spire_blocks3_3": {
              "name": "Mirror Spire Warden III"
            },
            "mirror_spire_blocks3_4": {
              "name": "Mirror Spire Warden IV"
            },
            "mirror_spire_blocks3_5": {
              "name": "Mirror Spire Warden V"
            }
          }
        },
        "techno_sylvan_helix": {
          "name": "テクノ森螺旋",
          "description": "バイオルミナスの森と量子回路が螺旋を描く居住層",
          "blocks": {
            "techno_helix_blocks1_1": {
              "name": "Techno Helix Ranger I"
            },
            "techno_helix_blocks1_2": {
              "name": "Techno Helix Ranger II"
            },
            "techno_helix_blocks1_3": {
              "name": "Techno Helix Ranger III"
            },
            "techno_helix_blocks1_4": {
              "name": "Techno Helix Ranger IV"
            },
            "techno_helix_blocks1_5": {
              "name": "Techno Helix Ranger V"
            },
            "techno_helix_blocks2_1": {
              "name": "Techno Helix Ranger I"
            },
            "techno_helix_blocks2_2": {
              "name": "Techno Helix Ranger II"
            },
            "techno_helix_blocks2_3": {
              "name": "Techno Helix Ranger III"
            },
            "techno_helix_blocks2_4": {
              "name": "Techno Helix Ranger IV"
            },
            "techno_helix_blocks2_5": {
              "name": "Techno Helix Ranger V"
            },
            "techno_helix_blocks3_1": {
              "name": "Techno Helix Ranger I"
            },
            "techno_helix_blocks3_2": {
              "name": "Techno Helix Ranger II"
            },
            "techno_helix_blocks3_3": {
              "name": "Techno Helix Ranger III"
            },
            "techno_helix_blocks3_4": {
              "name": "Techno Helix Ranger IV"
            },
            "techno_helix_blocks3_5": {
              "name": "Techno Helix Ranger V"
            }
          }
        },
        "chrono_rift_tramway": {
          "name": "クロノリフト路線",
          "description": "時間裂け目を縫う昇降トラム。リング状のゲートが上下階層を束ねる",
          "blocks": {
            "chrono_rift_tram_blocks1_1": {
              "name": "Chrono Rift Tram Chief I"
            },
            "chrono_rift_tram_blocks1_2": {
              "name": "Chrono Rift Tram Chief II"
            },
            "chrono_rift_tram_blocks1_3": {
              "name": "Chrono Rift Tram Chief III"
            },
            "chrono_rift_tram_blocks1_4": {
              "name": "Chrono Rift Tram Chief IV"
            },
            "chrono_rift_tram_blocks1_5": {
              "name": "Chrono Rift Tram Chief V"
            },
            "chrono_rift_tram_blocks2_1": {
              "name": "Chrono Rift Tram Chief I"
            },
            "chrono_rift_tram_blocks2_2": {
              "name": "Chrono Rift Tram Chief II"
            },
            "chrono_rift_tram_blocks2_3": {
              "name": "Chrono Rift Tram Chief III"
            },
            "chrono_rift_tram_blocks2_4": {
              "name": "Chrono Rift Tram Chief IV"
            },
            "chrono_rift_tram_blocks2_5": {
              "name": "Chrono Rift Tram Chief V"
            },
            "chrono_rift_tram_blocks3_1": {
              "name": "Chrono Rift Tram Chief I"
            },
            "chrono_rift_tram_blocks3_2": {
              "name": "Chrono Rift Tram Chief II"
            },
            "chrono_rift_tram_blocks3_3": {
              "name": "Chrono Rift Tram Chief III"
            },
            "chrono_rift_tram_blocks3_4": {
              "name": "Chrono Rift Tram Chief IV"
            },
            "chrono_rift_tram_blocks3_5": {
              "name": "Chrono Rift Tram Chief V"
            }
          }
        },
        "voidglass_estuary": {
          "name": "虚玻の河口",
          "description": "虚無と光の河口都市。透徹した水脈と浮遊堤が交わる",
          "blocks": {
            "voidglass_estuary_blocks1_1": {
              "name": "Voidglass Estuary Guide I"
            },
            "voidglass_estuary_blocks1_2": {
              "name": "Voidglass Estuary Guide II"
            },
            "voidglass_estuary_blocks1_3": {
              "name": "Voidglass Estuary Guide III"
            },
            "voidglass_estuary_blocks1_4": {
              "name": "Voidglass Estuary Guide IV"
            },
            "voidglass_estuary_blocks1_5": {
              "name": "Voidglass Estuary Guide V"
            },
            "voidglass_estuary_blocks2_1": {
              "name": "Voidglass Estuary Guide I"
            },
            "voidglass_estuary_blocks2_2": {
              "name": "Voidglass Estuary Guide II"
            },
            "voidglass_estuary_blocks2_3": {
              "name": "Voidglass Estuary Guide III"
            },
            "voidglass_estuary_blocks2_4": {
              "name": "Voidglass Estuary Guide IV"
            },
            "voidglass_estuary_blocks2_5": {
              "name": "Voidglass Estuary Guide V"
            },
            "voidglass_estuary_blocks3_1": {
              "name": "Voidglass Estuary Guide I"
            },
            "voidglass_estuary_blocks3_2": {
              "name": "Voidglass Estuary Guide II"
            },
            "voidglass_estuary_blocks3_3": {
              "name": "Voidglass Estuary Guide III"
            },
            "voidglass_estuary_blocks3_4": {
              "name": "Voidglass Estuary Guide IV"
            },
            "voidglass_estuary_blocks3_5": {
              "name": "Voidglass Estuary Guide V"
            }
          }
        },
        "harmonic_dream_artery": {
          "name": "調律夢動脈",
          "description": "夢動脈が共鳴し、音律が光と交差する調律回廊",
          "blocks": {
            "harmonic_artery_blocks1_1": {
              "name": "Harmonic Artery Maestro I"
            },
            "harmonic_artery_blocks1_2": {
              "name": "Harmonic Artery Maestro II"
            },
            "harmonic_artery_blocks1_3": {
              "name": "Harmonic Artery Maestro III"
            },
            "harmonic_artery_blocks1_4": {
              "name": "Harmonic Artery Maestro IV"
            },
            "harmonic_artery_blocks1_5": {
              "name": "Harmonic Artery Maestro V"
            },
            "harmonic_artery_blocks2_1": {
              "name": "Harmonic Artery Maestro I"
            },
            "harmonic_artery_blocks2_2": {
              "name": "Harmonic Artery Maestro II"
            },
            "harmonic_artery_blocks2_3": {
              "name": "Harmonic Artery Maestro III"
            },
            "harmonic_artery_blocks2_4": {
              "name": "Harmonic Artery Maestro IV"
            },
            "harmonic_artery_blocks2_5": {
              "name": "Harmonic Artery Maestro V"
            },
            "harmonic_artery_blocks3_1": {
              "name": "Harmonic Artery Maestro I"
            },
            "harmonic_artery_blocks3_2": {
              "name": "Harmonic Artery Maestro II"
            },
            "harmonic_artery_blocks3_3": {
              "name": "Harmonic Artery Maestro III"
            },
            "harmonic_artery_blocks3_4": {
              "name": "Harmonic Artery Maestro IV"
            },
            "harmonic_artery_blocks3_5": {
              "name": "Harmonic Artery Maestro V"
            }
          }
        }
      },
      "badges": {
        "abyss": "深淵",
        "agriculture": "農耕",
        "ambient": "環境",
        "ancient": "古代",
        "arcane": "秘儀",
        "archaeology": "考古",
        "archive": "書庫",
        "arena": "闘技場",
        "astral": "星界",
        "autumn": "秋季",
        "bamboo": "竹林",
        "beach": "海岸",
        "bio": "生体",
        "bioluminescent": "生物発光",
        "biome": "バイオーム",
        "bomb": "爆裂",
        "bridge": "橋梁",
        "canal": "運河",
        "castle": "城塞",
        "catacomb": "地下墓地",
        "cave": "洞窟",
        "cavern": "大洞窟",
        "celestial": "天界",
        "ceremonial": "儀礼",
        "ceremony": "式典",
        "circular": "円環",
        "city": "都市",
        "cloister": "回廊",
        "corridor": "廊下",
        "crescent": "三日月",
        "crypt": "石棺",
        "crystal": "水晶",
        "dark": "暗黒",
        "decay": "腐敗",
        "defense": "防衛",
        "desert": "砂漠",
        "dragon": "竜",
        "dynamic": "動態",
        "engineered": "機構",
        "erosion": "侵食",
        "festival": "祭典",
        "field": "平原",
        "fixed": "固定",
        "floating": "浮遊",
        "forest": "森林",
        "forge": "鍛造",
        "fortress": "要塞",
        "future": "未来",
        "futuristic": "近未来",
        "gallery": "画廊",
        "garden": "庭園",
        "grand": "壮大",
        "graveyard": "墓地",
        "grid": "格子",
        "haunted": "幽霊",
        "hazard": "危険",
        "heat": "熱源",
        "hologram": "ホログラム",
        "holy": "聖域",
        "horror": "ホラー",
        "ice": "氷結",
        "imperial": "帝国",
        "industrial": "工業",
        "lab": "研究室",
        "labyrinth": "迷宮",
        "lantern": "提灯",
        "lava": "溶岩",
        "layered": "層構造",
        "library": "図書館",
        "light": "光輝",
        "maintenance": "保守",
        "market": "市場",
        "maze": "迷路",
        "mechanical": "機械",
        "medieval": "中世",
        "mirage": "蜃気楼",
        "mist": "霧",
        "modular": "モジュール",
        "mystery": "謎",
        "mystic": "神秘",
        "nature": "自然",
        "network": "ネットワーク",
        "night": "夜間",
        "open": "開放",
        "open-space": "開空間",
        "organic": "有機",
        "outdoor": "屋外",
        "overworld": "地上",
        "pavilion": "楼閣",
        "pit": "坑",
        "poison": "毒",
        "pulse": "脈動",
        "puzzle": "パズル",
        "quantum": "量子",
        "radial": "放射",
        "reef": "珊瑚礁",
        "research": "研究",
        "resonance": "共鳴",
        "retro": "レトロ",
        "ring": "リング",
        "rings": "多重環",
        "ritual": "儀式",
        "rooms": "部屋群",
        "royal": "王侯",
        "ruins": "廃墟",
        "rural": "田園",
        "sacred": "聖堂",
        "sanctuary": "聖域",
        "serpentine": "蛇行",
        "sf": "SF",
        "single": "単間",
        "sky": "天空",
        "snake": "蛇行通路",
        "spiral": "螺旋",
        "stage": "舞台",
        "storm": "嵐",
        "stream": "水流",
        "structure": "構造",
        "structured": "構築",
        "swamp": "湿地",
        "symmetric": "対称",
        "symmetry": "シンメトリー",
        "tea": "茶庭",
        "temple": "神殿",
        "terrace": "段丘",
        "theater": "劇場",
        "tiered": "層段",
        "transport": "輸送",
        "trap": "罠",
        "underground": "地下",
        "undersea": "海底",
        "urban": "都市",
        "vertical": "垂直",
        "void": "虚空",
        "water": "水域",
        "wind": "風"
      },
      "blockdim": {
        "blocks": {
          "b1004": {
            "name": "朽ちた"
          },
          "b1044": {
            "name": "ネオン薄光"
          },
          "b1051": {
            "name": "ナイトTokyo"
          },
          "b1058": {
            "name": "失われた広場"
          },
          "b1045": {
            "name": "朽都ルインズ"
          },
          "b1052": {
            "name": "新宿Backstreet"
          },
          "b1059": {
            "name": "さみだれ交差点"
          },
          "b1005": {
            "name": "忘却の"
          },
          "b1046": {
            "name": "錆色アベニュー"
          },
          "b1053": {
            "name": "渋谷の残響"
          },
          "b1060": {
            "name": "Ruinの屋上"
          },
          "b1047": {
            "name": "すきまの横丁"
          },
          "b1054": {
            "name": "ほこりのビル群"
          },
          "b1061": {
            "name": "下北沢Alley"
          },
          "b1048": {
            "name": "グレイ灰街"
          },
          "b1055": {
            "name": "Rustドック"
          },
          "b1062": {
            "name": "沈む工場港"
          },
          "b1049": {
            "name": "雨宿りアーケード"
          },
          "b1056": {
            "name": "煙る湾岸"
          },
          "b1063": {
            "name": "港区の影"
          },
          "b1024": {
            "name": "こもれびの径"
          },
          "b1029": {
            "name": "朝霧ハイランド"
          },
          "b1034": {
            "name": "青葉テラス"
          },
          "b1039": {
            "name": "Verdant原"
          },
          "b1050": {
            "name": "廃線メモリー"
          },
          "b1057": {
            "name": "チルな雑居"
          },
          "b1006": {
            "name": "静寂の"
          },
          "b1019": {
            "name": "双影の"
          },
          "b1025": {
            "name": "翠雨Meadow"
          },
          "b1030": {
            "name": "風花の岬"
          },
          "b1035": {
            "name": "やまなみロード"
          },
          "b1040": {
            "name": "さざなみ平原"
          },
          "b1016": {
            "name": "黄金の"
          },
          "b1022": {
            "name": "薄暮の"
          },
          "b1026": {
            "name": "朧の里"
          },
          "b1031": {
            "name": "みずいろ野"
          },
          "b1036": {
            "name": "フォレスト小径"
          },
          "b1041": {
            "name": "鎌倉Green"
          },
          "b1084": {
            "name": "水鏡ラグーン"
          },
          "b1089": {
            "name": "氷雨テラス"
          },
          "b1094": {
            "name": "凍土ひだまり"
          },
          "b1099": {
            "name": "霧笛の埠頭"
          },
          "b1018": {
            "name": "木霊する"
          },
          "b1027": {
            "name": "ひなたの丘"
          },
          "b1032": {
            "name": "Mossの苔庭"
          },
          "b1037": {
            "name": "しずくの森"
          },
          "b1042": {
            "name": "奈良の野辺"
          },
          "b1085": {
            "name": "うすもや水路"
          },
          "b1090": {
            "name": "ミスト渓谷"
          },
          "b1095": {
            "name": "しぶきの汀"
          },
          "b1100": {
            "name": "ひょうの路地"
          },
          "b1002": {
            "name": "翠緑の"
          },
          "b1009": {
            "name": "幽影の"
          },
          "b1017": {
            "name": "紫紺の"
          },
          "b1028": {
            "name": "ブリーズ渓谷"
          },
          "b1033": {
            "name": "そよ風パセオ"
          },
          "b1038": {
            "name": "霞む谷戸"
          },
          "b1043": {
            "name": "上野の風景"
          },
          "b1086": {
            "name": "霜夜バレー"
          },
          "b1091": {
            "name": "雪白プロムナード"
          },
          "b1096": {
            "name": "Glacial横町"
          },
          "b1012": {
            "name": "月下の"
          },
          "b1087": {
            "name": "アイスの洞"
          },
          "b1092": {
            "name": "こおりの巣"
          },
          "b1097": {
            "name": "露光の池"
          },
          "b1001": {
            "name": "蒼穹の"
          },
          "b1008": {
            "name": "燐光の"
          },
          "b1064": {
            "name": "星明りプラットフォーム"
          },
          "b1073": {
            "name": "蒼星テラス"
          },
          "b1082": {
            "name": "ミルキー峡"
          },
          "b1088": {
            "name": "さざ波ガーデン"
          },
          "b1093": {
            "name": "フロスト街"
          },
          "b1098": {
            "name": "みぞれ街道"
          },
          "b1023": {
            "name": "氷雪の"
          },
          "b1065": {
            "name": "天穹ドーム"
          },
          "b1074": {
            "name": "オーロラ橋"
          },
          "b1083": {
            "name": "時雨Constellation"
          },
          "b1003": {
            "name": "深紅の"
          },
          "b1010": {
            "name": "凍てつく"
          },
          "b1020": {
            "name": "聖別の"
          },
          "b1066": {
            "name": "ほしなみ回廊"
          },
          "b1075": {
            "name": "つきかげ広場"
          },
          "b1021": {
            "name": "呪詛の"
          },
          "b1067": {
            "name": "セレスティア京"
          },
          "b1076": {
            "name": "Stardust路"
          },
          "b1014": {
            "name": "嵐の"
          },
          "b1068": {
            "name": "夜風オービタ"
          },
          "b1077": {
            "name": "大気ステップ"
          },
          "b1007": {
            "name": "咆哮する"
          },
          "b1069": {
            "name": "Eclipseの庭"
          },
          "b1078": {
            "name": "ほのぼの星屑"
          },
          "b1013": {
            "name": "灼熱の"
          },
          "b1070": {
            "name": "銀河バルコニー"
          },
          "b1079": {
            "name": "Gravity坂"
          },
          "b1071": {
            "name": "しじまの宙"
          },
          "b1080": {
            "name": "宙港うらら"
          },
          "b1011": {
            "name": "星霜の"
          },
          "b1072": {
            "name": "Nebula小町"
          },
          "b1081": {
            "name": "ひかりアトリウム"
          },
          "b1015": {
            "name": "奈落の"
          },
          "b1g001": {
            "name": "格子の回廊"
          },
          "b1o001": {
            "name": "空の広間"
          },
          "b2002": {
            "name": "錆びた"
          },
          "b2012": {
            "name": "ひび割れた"
          },
          "b2009": {
            "name": "かすかな"
          },
          "b2044": {
            "name": "鉄屑ヤード"
          },
          "b2049": {
            "name": "油膜の床"
          },
          "b2054": {
            "name": "クランク横丁"
          },
          "b2059": {
            "name": "マシナリ京都"
          },
          "b2024": {
            "name": "慟哭の祠"
          },
          "b2030": {
            "name": "狂喜の広間"
          },
          "b2036": {
            "name": "やすらぎの縁"
          },
          "b2042": {
            "name": "怨念アトリウム"
          },
          "b2045": {
            "name": "スプロケット通り"
          },
          "b2050": {
            "name": "錆鉄プラットホーム"
          },
          "b2055": {
            "name": "溶接アーケード"
          },
          "b2060": {
            "name": "Sparkの坑"
          },
          "b2013": {
            "name": "忘れられた"
          },
          "b2022": {
            "name": "人知れぬ"
          },
          "b2025": {
            "name": "さびしさの路"
          },
          "b2031": {
            "name": "哀歌の回廊"
          },
          "b2037": {
            "name": "ざわめく霊園"
          },
          "b2043": {
            "name": "希望のランタン街"
          },
          "b2046": {
            "name": "きしむ工廠"
          },
          "b2051": {
            "name": "ギアの祠"
          },
          "b2056": {
            "name": "ワイヤー橋"
          },
          "b2061": {
            "name": "ピストン広場"
          },
          "b2005": {
            "name": "眠れる"
          },
          "b2017": {
            "name": "谺する"
          },
          "b2026": {
            "name": "怒りの砦"
          },
          "b2032": {
            "name": "Lonely塔"
          },
          "b2038": {
            "name": "祈りのクレプス"
          },
          "b2047": {
            "name": "Rustベイ"
          },
          "b2052": {
            "name": "ボルトの迷路"
          },
          "b2057": {
            "name": "こてさび通路"
          },
          "b2062": {
            "name": "鋼の肺"
          },
          "b2064": {
            "name": "風鳴りデューン"
          },
          "b2069": {
            "name": "すなじの街路"
          },
          "b2074": {
            "name": "ハマダーン路"
          },
          "b2079": {
            "name": "カスバ小径"
          },
          "b2003": {
            "name": "水没した"
          },
          "b2014": {
            "name": "密やかな"
          },
          "b2020": {
            "name": "灰の"
          },
          "b2027": {
            "name": "憂鬱カタコンベ"
          },
          "b2033": {
            "name": "Melancholy坂"
          },
          "b2039": {
            "name": "しじまの墓域"
          },
          "b2048": {
            "name": "歯車アベニュー"
          },
          "b2053": {
            "name": "蒸気の小路"
          },
          "b2058": {
            "name": "スモッグファクトリ"
          },
          "b2063": {
            "name": "ガス灯の棟"
          },
          "b2065": {
            "name": "ささやきの砂原"
          },
          "b2070": {
            "name": "旋風パサージュ"
          },
          "b2075": {
            "name": "Dustの双丘"
          },
          "b2080": {
            "name": "奈良Sirocco"
          },
          "b2084": {
            "name": "蔦絡む巣"
          },
          "b2089": {
            "name": "みどりの巣穴"
          },
          "b2094": {
            "name": "ひそやかな巣窟"
          },
          "b2099": {
            "name": "熊笹の径"
          },
          "b2001": {
            "name": "古の"
          },
          "b2010": {
            "name": "緻密な"
          },
          "b2018": {
            "name": "縛られた"
          },
          "b2028": {
            "name": "悲嘆の地下室"
          },
          "b2034": {
            "name": "儚いネクロポリス"
          },
          "b2040": {
            "name": "Furyの洞"
          },
          "b2066": {
            "name": "音叉の谷"
          },
          "b2071": {
            "name": "わずかな足跡群"
          },
          "b2076": {
            "name": "からっ風の岡"
          },
          "b2081": {
            "name": "風紋ギャラリー"
          },
          "b2085": {
            "name": "けものみち"
          },
          "b2090": {
            "name": "猛獣の檻庭"
          },
          "b2095": {
            "name": "スパイク窪地"
          },
          "b2100": {
            "name": "狼煙の丘"
          },
          "b2008": {
            "name": "螺旋の"
          },
          "b2011": {
            "name": "有棘の"
          },
          "b2016": {
            "name": "灼けた"
          },
          "b2019": {
            "name": "燦めく"
          },
          "b2029": {
            "name": "ときめきの小径"
          },
          "b2035": {
            "name": "呪縛の蔵"
          },
          "b2041": {
            "name": "Calmの庭"
          },
          "b2067": {
            "name": "シロッコ坂"
          },
          "b2072": {
            "name": "笛吹く峡"
          },
          "b2077": {
            "name": "こだまの盆地"
          },
          "b2082": {
            "name": "さらさら峡谷"
          },
          "b2086": {
            "name": "朽ち葉ガーデン"
          },
          "b2091": {
            "name": "かげる樹海"
          },
          "b2096": {
            "name": "暗獣の巣"
          },
          "b2006": {
            "name": "断絶した"
          },
          "b2015": {
            "name": "歪なる"
          },
          "b2023": {
            "name": "原初の"
          },
          "b2068": {
            "name": "Mirageの浜"
          },
          "b2073": {
            "name": "うたかたのオアシス"
          },
          "b2078": {
            "name": "ドラムサンド"
          },
          "b2083": {
            "name": "Whisper砂丘"
          },
          "b2087": {
            "name": "毒霧の沼"
          },
          "b2092": {
            "name": "Venom谷"
          },
          "b2097": {
            "name": "霞むバイオーム"
          },
          "b2004": {
            "name": "機械仕掛けの"
          },
          "b2021": {
            "name": "虚ろなる"
          },
          "b2088": {
            "name": "クローの洞"
          },
          "b2093": {
            "name": "さびし森"
          },
          "b2098": {
            "name": "ポイズンの泉"
          },
          "b2007": {
            "name": "無窮の"
          },
          "b2g001": {
            "name": "格子街路"
          },
          "b2o001": {
            "name": "大空間ホール"
          },
          "b3001": {
            "name": "庭園"
          },
          "b3003": {
            "name": "迷宮"
          },
          "b3004": {
            "name": "回廊"
          },
          "b3005": {
            "name": "遺跡"
          },
          "b3011": {
            "name": "樹海"
          },
          "b3009": {
            "name": "砂海"
          },
          "b3010": {
            "name": "洞窟"
          },
          "b3022": {
            "name": "浮遊島"
          },
          "b3085": {
            "name": "地下の鼓動"
          },
          "b3090": {
            "name": "ひそみの坑"
          },
          "b3095": {
            "name": "ツタの横穴"
          },
          "b3100": {
            "name": "ざらつく床"
          },
          "b3015": {
            "name": "監獄"
          },
          "b3065": {
            "name": "まぼろしの街"
          },
          "b3070": {
            "name": "幻想パサージュ"
          },
          "b3075": {
            "name": "Dreamの階"
          },
          "b3080": {
            "name": "うつろいの路"
          },
          "b3086": {
            "name": "きのこカタコンベ"
          },
          "b3091": {
            "name": "Rootの迷路"
          },
          "b3096": {
            "name": "じわりの堆"
          },
          "b3002": {
            "name": "聖堂"
          },
          "b3008": {
            "name": "研究所"
          },
          "b3013": {
            "name": "祭壇"
          },
          "b3021": {
            "name": "境界域"
          },
          "b3045": {
            "name": "雪灯の野"
          },
          "b3050": {
            "name": "Frost京"
          },
          "b3055": {
            "name": "北極光テラス"
          },
          "b3060": {
            "name": "ツンドラ横町"
          },
          "b3066": {
            "name": "夢見のプロムナード"
          },
          "b3071": {
            "name": "Illusion丘"
          },
          "b3076": {
            "name": "ふわりの小町"
          },
          "b3081": {
            "name": "異邦アーケード"
          },
          "b3087": {
            "name": "胞子の回廊"
          },
          "b3092": {
            "name": "暗渠の川辺"
          },
          "b3097": {
            "name": "コロニーの隙"
          },
          "b3012": {
            "name": "地下墓地"
          },
          "b3018": {
            "name": "氷窟"
          },
          "b3025": {
            "name": "王都アーケイディア"
          },
          "b3032": {
            "name": "Temple小径"
          },
          "b3039": {
            "name": "Ruinsの中庭"
          },
          "b3046": {
            "name": "白氷の窪地"
          },
          "b3051": {
            "name": "氷霞の路"
          },
          "b3056": {
            "name": "アイシクルの庭"
          },
          "b3061": {
            "name": "寒月の辻"
          },
          "b3067": {
            "name": "フェイブル回廊"
          },
          "b3072": {
            "name": "白昼夢テラス"
          },
          "b3077": {
            "name": "影絵の館"
          },
          "b3082": {
            "name": "イマジナリ京都"
          },
          "b3088": {
            "name": "マイセリア庭"
          },
          "b3093": {
            "name": "朽ち縄の井戸"
          },
          "b3098": {
            "name": "Sporeの街"
          },
          "b3006": {
            "name": "城砦"
          },
          "b3014": {
            "name": "神殿"
          },
          "b3020": {
            "name": "闘技場"
          },
          "b3026": {
            "name": "いにしえの柱廊"
          },
          "b3033": {
            "name": "礎のドーム"
          },
          "b3040": {
            "name": "伽藍の回向"
          },
          "b3047": {
            "name": "こごえる街路"
          },
          "b3052": {
            "name": "ミルク色の平原"
          },
          "b3057": {
            "name": "霧氷ハーバー"
          },
          "b3062": {
            "name": "ふぶきの峰"
          },
          "b3068": {
            "name": "フィクションの庭"
          },
          "b3073": {
            "name": "うつつの割れ目"
          },
          "b3078": {
            "name": "さざめく世界端"
          },
          "b3083": {
            "name": "Mirageの街角"
          },
          "b3089": {
            "name": "脈打つ洞"
          },
          "b3094": {
            "name": "菌糸の広間"
          },
          "b3099": {
            "name": "地下街アンダー"
          },
          "b3016": {
            "name": "機械塔"
          },
          "b3027": {
            "name": "レリクス石庭"
          },
          "b3034": {
            "name": "祈祷のテラス"
          },
          "b3041": {
            "name": "石畳プロムナード"
          },
          "b3048": {
            "name": "オーロラの丘"
          },
          "b3053": {
            "name": "吹雪の回廊"
          },
          "b3058": {
            "name": "セイバン雪脈"
          },
          "b3063": {
            "name": "しらゆきの里"
          },
          "b3069": {
            "name": "ねむり雲"
          },
          "b3074": {
            "name": "虚実の塔"
          },
          "b3079": {
            "name": "きらめく泡沫"
          },
          "b3084": {
            "name": "まどろみの凹室"
          },
          "b3007": {
            "name": "廃都"
          },
          "b3017": {
            "name": "要塞"
          },
          "b3023": {
            "name": "聖域"
          },
          "b3028": {
            "name": "祭壇の間"
          },
          "b3035": {
            "name": "古代のオベリスク"
          },
          "b3042": {
            "name": "正殿の階"
          },
          "b3049": {
            "name": "霜星の峡"
          },
          "b3054": {
            "name": "しずかな氷穴"
          },
          "b3059": {
            "name": "Gelidの湾"
          },
          "b3064": {
            "name": "Aurora橋上"
          },
          "b3019": {
            "name": "火山窟"
          },
          "b3029": {
            "name": "聖塔の回廊"
          },
          "b3036": {
            "name": "きよき大路"
          },
          "b3043": {
            "name": "古城の翼廊"
          },
          "b3030": {
            "name": "奈良神苑"
          },
          "b3037": {
            "name": "アーカイブの庫"
          },
          "b3044": {
            "name": "聖都Galleria"
          },
          "b3024": {
            "name": "裂け目"
          },
          "b3031": {
            "name": "祠宮の庭"
          },
          "b3038": {
            "name": "朱雀門プラザ"
          },
          "b3g001": {
            "name": "グリッド回廊"
          },
          "b3o001": {
            "name": "虚空の広間"
          }
        }
      },
      "structures": {
        "sf_cross_hub": {
          "name": "クロス制御室"
        },
        "sf_reactor_core": {
          "name": "リアクターハート"
        },
        "sf_datagrid_cell": {
          "name": "データセル"
        },
        "sf_glitch_shard": {
          "name": "グリッチ欠片"
        },
        "sf_forum_ring": {
          "name": "フォーラムリング"
        },
        "sf_plaza_podium": {
          "name": "ホロポディウム"
        },
        "sf_industrial_line": {
          "name": "コンベアライン"
        },
        "sf_sky_platform": {
          "name": "浮遊プラットフォーム"
        },
        "sf_residential_quad": {
          "name": "住居クアッド"
        },
        "sf_underworks_loop": {
          "name": "メンテナンスループ"
        },
        "sf_greenhouse_cell": {
          "name": "温室セル"
        },
        "sf_command_bridge": {
          "name": "管制ブリッジ"
        },
        "sf_quantum_focus": {
          "name": "量子フォーカス"
        },
        "sf_archive_stack": {
          "name": "記録スタック"
        },
        "sf_chrono_platform": {
          "name": "クロノホーム"
        },
        "sf_xeno_grove": {
          "name": "異星グローブ"
        },
        "sf_xeno_gate": {
          "name": "遺構ゲート"
        },
        "sf_colony_commons": {
          "name": "コモンズホール"
        },
        "sf_warp_gate": {
          "name": "ワープゲートリング"
        },
        "sf_observatory_grid": {
          "name": "観測グリッド"
        },
        "sf_arena_mesh": {
          "name": "アリーナメッシュ"
        },
        "sf_metro_cross": {
          "name": "メトロ交差"
        },
        "sf_cloud_dock": {
          "name": "クラウドドック"
        },
        "sf_scrap_node": {
          "name": "スクラップノード"
        },
        "sf_listening_spire": {
          "name": "リスニングスパイア"
        },
        "sf_flux_cell": {
          "name": "フラックスセル"
        },
        "sf_chrono_stack": {
          "name": "時間アーカイブスタック"
        },
        "sf_fracture_node": {
          "name": "断層ノード"
        },
        "sf_hive_chamber": {
          "name": "ハイブチャンバー"
        },
        "sf_reef_arc": {
          "name": "リーフアーチ"
        },
        "sf_vault_ring": {
          "name": "備蓄リング"
        },
        "sf_arcology_core": {
          "name": "アーコロジー核"
        }
      }
    },

    "minigame": {
      "clock_hub": {
        "errors": {
          "noContainer": "Clock Hubにはコンテナが必要です"
        },
        "header": {
          "title": "時計ユーティリティハブ",
          "subtitle": "デジタル／アナログ／詳細情報を切り替え",
          "exp": "獲得EXP: {xp}"
        },
        "tabs": {
          "digital": "デジタル時計",
          "analog": "アナログ時計",
          "detail": "詳細"
        },
        "detailTabs": {
          "overview": "概要",
          "progress": "進捗率",
          "remain": "残り時間",
          "stats": "情報一覧",
          "calendar": "カレンダー"
        },
        "digital": {
          "format": {
            "24h": "24時間制",
            "12h": "12時間制"
          },
          "period": {
            "am": "午前",
            "pm": "午後"
          },
          "dateLine": "{year}年{month}月{day}日（{weekday}）",
          "timeLine12": "{period}{hour}時{minute}分{second}秒",
          "timeLine24": "{hour}時{minute}分{second}秒"
        },
        "analog": {
          "type": {
            "12h": "通常アナログ時計",
            "24h": "24時間制アナログ時計"
          }
        },
        "weekdays": {
          "0": "日",
          "1": "月",
          "2": "火",
          "3": "水",
          "4": "木",
          "5": "金",
          "6": "土"
        },
        "dates": {
          "full": "{year}年{month}月{day}日（{weekday}）"
        },
        "era": {
          "reiwa": "令和",
          "heisei": "平成",
          "showa": "昭和",
          "taisho": "大正",
          "meiji": "明治",
          "format": "{era}{year}年",
          "unknown": "不明"
        },
        "eto": {
          "stems": {
            "0": "甲",
            "1": "乙",
            "2": "丙",
            "3": "丁",
            "4": "戊",
            "5": "己",
            "6": "庚",
            "7": "辛",
            "8": "壬",
            "9": "癸"
          },
          "branches": {
            "0": "子",
            "1": "丑",
            "2": "寅",
            "3": "卯",
            "4": "辰",
            "5": "巳",
            "6": "午",
            "7": "未",
            "8": "申",
            "9": "酉",
            "10": "戌",
            "11": "亥"
          },
          "format": "{stem}{branch}"
        },
        "season": {
          "winter": "冬",
          "spring": "春",
          "summer": "夏",
          "autumn": "秋",
          "unknown": "不明"
        },
        "solarTerms": {
          "risshun": "立春",
          "usui": "雨水",
          "keichitsu": "啓蟄",
          "shunbun": "春分",
          "seimei": "清明",
          "kokuu": "穀雨",
          "rikka": "立夏",
          "shoman": "小満",
          "boshu": "芒種",
          "geshi": "夏至",
          "shosho": "小暑",
          "taisho": "大暑",
          "risshu": "立秋",
          "shoshoLimitHeat": "処暑",
          "hakuro": "白露",
          "shubun": "秋分",
          "kanro": "寒露",
          "soko": "霜降",
          "rittou": "立冬",
          "shosetsu": "小雪",
          "taisetsu": "大雪",
          "touji": "冬至",
          "shokan": "小寒",
          "dahan": "大寒",
          "nextDate": "{year}年{month}月{day}日",
          "description": "{previous} → 次は{next}（{nextDate}、{duration}）"
        },
        "duration": {
          "prefix": {
            "future": "あと",
            "past": "前"
          },
          "unit": {
            "year": "{value}年",
            "day": "{value}日",
            "hour": "{value}時間",
            "minute": "{value}分",
            "second": "{value}秒"
          },
          "joiner": ""
        },
        "progress": {
          "labels": {
            "millennium": "千年紀",
            "century": "世紀",
            "decade": "年代",
            "year": "年",
            "month": "月",
            "day": "日",
            "hour": "時",
            "minute": "分",
            "second": "秒"
          },
          "percent": "{value}%"
        },
        "remaining": {
          "labels": {
            "nextSecond": "次の秒",
            "nextMinute": "次の分",
            "nextHour": "次の時",
            "nextDay": "次の日",
            "nextMonth": "次の月",
            "nextYear": "次の年"
          },
          "delta": "（±{millis}ms）",
          "value": "{duration}{delta}"
        },
        "stats": {
          "labels": {
            "unix": "UNIX時間",
            "ticks": "経過ミリ秒",
            "iso": "ISO 8601",
            "yearday": "年内通算日",
            "daySeconds": "今日の経過秒",
            "timezone": "タイムゾーン",
            "locale": "ロケール"
          },
          "yeardayValue": "第{value}日目",
          "daySecondsValue": "{value}秒",
          "timezoneFallback": "ローカル",
          "localeFallback": "不明"
        },
        "calendar": {
          "settings": {
            "title": "休暇／出勤日のカスタム設定",
            "holidayTitle": "祝日・休暇として登録",
            "workdayTitle": "出勤日として登録",
            "add": "追加",
            "empty": "登録なし",
            "remove": "削除"
          },
          "info": {
            "summary": "日付: {date}",
            "era": "和暦: {era}｜干支: {eto}",
            "season": "季節: {season}｜四半期: 第{quarter}四半期",
            "progress": "年内通算日: 第{dayOfYear}日｜ISO週番号: 第{isoWeek}週｜月内第{weekOfMonth}週",
            "status": "区分: {status}"
          },
          "status": {
            "rest": "休み",
            "workday": "出勤日想定",
            "holiday": "祝日登録あり",
            "workdayOverride": "出勤登録あり",
            "separator": " / "
          },
          "controls": {
            "prev": "← 前月",
            "next": "翌月 →",
            "today": "今日"
          },
          "monthLabel": "{year}年{month}月",
          "today": "本日: {date}"
        },
        "common": {
          "yes": "はい",
          "no": "いいえ"
        },
        "overview": {
          "gregorian": "西暦: {year}年 {month}月{day}日（{weekday}）",
          "era": "和暦: {era}",
          "eto": "干支: {eto}｜皇紀: {imperial}",
          "season": "季節: {season}｜二十四節気: {solarTerm}",
          "leapYear": "うるう年: {value}"
        },
        "xp": {
          "note": "秒:+{second} / 分:+{minute} / 時:+{hour} / 日:+{day} / 月:+{month} / 年:+{year} / 世紀:+{century} / 千年紀:+{millennium}"
        }
      },
      "xiangqi": {
        "header": {
          "title": "シャンチー",
          "subtitle": "{color}が先手"
        },
        "controls": {
          "reset": "初期配置に戻す"
        },
        "board": {
          "riverLabel": "楚河　漢界"
        },
        "color": {
          "red": "赤",
          "black": "黒",
          "redPlayer": "赤（下）",
          "blackPlayer": "黒（上）"
        },
        "pieces": {
          "general": "将",
          "advisor": "士",
          "elephant": "象",
          "horse": "馬",
          "chariot": "車",
          "cannon": "砲",
          "soldier": "卒"
        },
        "expLabel": "EXP",
        "piece": {
          "description": "{color}の{piece}"
        },
        "status": {
          "turnLine": "手番: {turn}",
          "turn": {
            "red": "{color}の番です",
            "black": "{color}の番です"
          },
          "scoreLine": "合計スコア: {score}",
          "capture": "{actor}が{target}を取りました (+{exp}{expLabel})",
          "move": "{piece}が移動しました",
          "win": "{loser}が詰みました。{winner}の勝利！",
          "stalemate": "持将軍（合法手がありません）",
          "check": "{defender}が王手を受けています (+{exp}{expLabel})"
        }
      },
      "mancala": {
        "actions": {
          "restart": "リスタート",
          "hint": "ヒント"
        },
        "hud": {
          "score": {
            "player": "あなた",
            "ai": "AI",
            "separator": "："
          }
        },
        "board": {
          "store": {
            "player": "あなた",
            "ai": "AI"
          },
          "pitLabel": {
            "player": "自{index}",
            "ai": "AI{index}"
          }
        },
        "status": {
          "start": "あなたのターン ― 種をまく穴を選んでください",
          "extraTurn": {
            "player": "追加ターン！別の穴を選びましょう。",
            "ai": "AIがもう一度ターンを獲得しました…"
          },
          "turn": {
            "player": "あなたのターン",
            "aiThinking": "AIが考えています…"
          },
          "result": {
            "draw": "引き分け！ {player} 対 {ai}",
            "win": "勝利！ {player} 対 {ai}",
            "loss": "敗北… {player} 対 {ai}"
          },
          "hint": "ヒント: 穴{pit}が有望です"
        },
        "history": {
          "who": {
            "player": "あなた",
            "ai": "AI"
          },
          "entry": {
            "pit": "穴{number}",
            "store": "ストア +{amount}",
            "capture": "捕獲 {amount}",
            "extraTurn": "追加ターン",
            "separator": " ／ "
          }
        }
      },
      "system": {
        "header": {
          "title": "システムユーティリティ",
          "subtitle": "PC / OS / ブラウザ / ネットワーク情報をまとめて確認",
          "sessionXp": "セッションEXP {xp}"
        },
        "tabs": {
          "pc": "PC",
          "os": "OS",
          "browser": "ブラウザ",
          "ip": "IP"
        },
        "pcSubTabs": {
          "pc-info": "情報",
          "pc-monitor": "ハードウェアモニター"
        },
        "controls": {
          "copySummary": "概要をコピー",
          "refreshHardware": "最新情報を取得",
          "refreshOs": "再読み込み",
          "refreshBrowser": "再分析",
          "fetchIp": "IP情報を取得",
          "cancelIp": "取得を中止",
          "copyIp": "結果をコピー"
        },
        "sections": {
          "pcInfo": { "title": "システム情報" },
          "monitor": {
            "title": "リアルタイムモニター",
            "note": "ブラウザの標準APIを用いた推定値です。実際のシステム使用率とは異なる場合があります。"
          },
          "os": { "title": "OS情報" },
          "browser": { "title": "ブラウザ情報" },
          "ip": { "title": "IP情報" }
        },
        "pcInfo": {
          "motherboard": "マザーボード",
          "cpuFamily": "CPUファミリー",
          "cpuThreads": "CPUスレッド数",
          "cpuFrequency": "CPU周波数",
          "architecture": "アーキテクチャ",
          "memory": "メモリ容量",
          "jsHeap": "JSヒープ上限",
          "storage": "ストレージ推定",
          "touch": "タッチポイント",
          "gpuVendor": "GPUベンダー",
          "gpuName": "GPU名",
          "gpuMemory": "GPUメモリ",
          "battery": "バッテリー",
          "notes": {
            "motherboardUnavailable": "ブラウザからはマザーボード情報にアクセスできません。",
            "cpuFrequencyUnavailable": "CPU周波数はWeb標準APIでは公開されていません。",
            "jsHeapChromeOnly": "Chrome系ブラウザのみ提供されます。",
            "storageEstimate": "navigator.storage.estimate() による推定値",
            "gpuWebgl": "WEBGL_debug_renderer_infoから取得",
            "gpuDisabled": "WebGLが無効化されている可能性があります。",
            "gpuMemoryUnavailable": "ブラウザはGPUメモリの総量を公開しません。",
            "batteryUnavailable": "Battery Status APIは利用できないか、許可されていません。"
          },
          "battery": {
            "charging": "充電中",
            "discharging": "放電中"
          },
          "values": {
            "cpuThreads": "{threads} スレッド",
            "deviceMemory": "{memory} GB (navigator.deviceMemory)",
            "battery": "{level} ({state})"
          }
        },
        "monitor": {
          "cpu": "CPU使用率 (推定)",
          "loopLag": "イベントループ遅延",
          "fps": "描画更新 (FPS)",
          "jsHeap": "JSヒープ使用量",
          "deviceMemory": "実メモリ (推定)",
          "notes": {
            "cpuUsage": "イベントループ遅延から推定",
            "loopLag": "setInterval基準との差分",
            "fps": "requestAnimationFrameの結果",
            "memoryUsage": "使用率 {percent}",
            "memoryChromeOnly": "Chrome系でのみ利用可能",
            "memoryUnavailable": "performance.memory が利用できません",
            "deviceMemoryEstimate": "navigator.deviceMemoryによる概算"
          }
        },
        "os": {
          "name": "OS名称",
          "version": "バージョン",
          "build": "ビルド",
          "bitness": "ビット数",
          "platform": "プラットフォーム",
          "timezone": "タイムゾーン",
          "locale": "ロケール",
          "languages": "利用言語",
          "uptime": "起動時間 (推定)",
          "lastChecked": "最終更新",
          "notes": {
            "buildUnavailable": "ブラウザは詳細なビルド番号を提供しません。",
            "uptime": "OSの起動時間は取得できないためブラウザ稼働時間を表示"
          },
          "values": {
            "uptime": "{hours} 時間 (ブラウザ稼働時間)"
          }
        },
        "browser": {
          "name": "ブラウザ名",
          "version": "バージョン",
          "engine": "レンダリングエンジン",
          "agent": "ユーザーエージェント",
          "brands": "ブランド情報",
          "vendor": "ベンダー",
          "doNotTrack": "Do Not Track",
          "online": "オンライン状態",
          "cookies": "Cookie",
          "storage": "ストレージAPI",
          "features": "主な技術",
          "html5": "HTML5サポート (主要API)",
          "status": {
            "online": "オンライン",
            "offline": "オフライン",
            "dntEnabled": "有効",
            "dntDisabled": "無効",
            "cookiesEnabled": "利用可能",
            "cookiesDisabled": "無効"
          },
          "notes": {
            "noFeatures": "主要API情報なし",
            "html5Unknown": "判定不可"
          }
        },
        "ip": {
          "statusIdle": "ネットワークアクセスが必要です。取得ボタンを押してください。",
          "statusSource": "{source} から取得",
          "ip": "IPアドレス",
          "hostname": "ホスト名",
          "city": "都市",
          "region": "地域",
          "country": "国",
          "loc": "緯度経度",
          "org": "組織 / ISP",
          "postal": "郵便番号",
          "timezone": "タイムゾーン",
          "asn": "ASN",
          "userAgent": "エージェント",
          "updated": "最終取得"
        },
        "status": {
          "unavailable": "取得不可",
          "unknown": "不明",
          "notAvailable": "-",
          "loading": "取得中…",
          "failed": "取得失敗"
        },
        "errors": {
          "hardwareFetch": "情報の取得に失敗しました",
          "ipCancelled": "取得を中止しました。",
          "ipFetch": "IP情報の取得に失敗しました。ファイアウォールやオフライン環境では取得できません。"
        },
        "summary": {
          "header": "[システム概要] {timestamp}",
          "cpu": "CPU: {family} / {threads} threads / arch {arch}",
          "memory": "Memory: {memory} (JS heap limit {heap})",
          "gpu": "GPU: {name} (vendor {vendor})",
          "os": "OS: {name} {version} ({bitness})",
          "browser": "Browser: {name} {version} ({engine})",
          "ip": "IP: {ip} @ {city}, {country}"
        }
      },
      "falling_puyos": {
        "floating": {
          "clear": "CLEAR!",
          "chain": "{chain}連鎖!"
        },
        "hud": {
          "title": "ぷよぷよ風",
          "difficulty": "難易度: {difficulty}",
          "totalCleared": "消去数: {value}",
          "maxChain": "最大連鎖: {value}",
          "lastClear": "直近消去: {value}"
        },
        "panel": {
          "next": "NEXT"
        },
        "overlay": {
          "gameOver": "ゲームオーバー",
          "restartHint": "Rキーで再開 / 再挑戦"
        },
        "badge": {
          "chain": "{chain}連鎖!"
        },
        "difficulty": {
          "easy": "EASY",
          "normal": "NORMAL",
          "hard": "HARD"
        }
      },
      "pinball_xp": {
        "ui": {
          "controls": {
            "flippers": "左右フリッパー: ← / → または A / D",
            "plunger": "プランジャー: スペースキー長押しでショット",
            "reset": "Rキー: リセット"
          },
          "mission": {
            "label": "ミッション:",
            "none": "なし",
            "hint": "L/M/Rレーンを揃えて新しいミッションを開始",
            "progress": "進行: {progressText} / {targetText}（残り{remainingSecondsText}s）"
          },
          "skillShot": {
            "active": "スキルショット: {lane} レーン / 残り {secondsText}s",
            "ready": "スキルショット準備完了: {lane} レーンを狙おう！",
            "next": "次のスキルショット標的: {lane} レーン"
          },
          "holdHint": "スペースでショット"
        },
        "missions": {
          "bumperBlitz": {
            "name": "バンパーブリッツ",
            "description": "バンパーに6回ヒットしよう"
          },
          "slingStorm": {
            "name": "スリングストーム",
            "description": "スリングショットを4回作動させる"
          },
          "laneMaster": {
            "name": "レーンマスター",
            "description": "L/M/Rレーンセットを2回完成"
          },
          "postChallenge": {
            "name": "ポストチャレンジ",
            "description": "ポストに5回ヒット"
          }
        },
        "announcements": {
          "missionStart": {
            "named": "{mission} 開始！",
            "generic": "ミッション開始！"
          },
          "missionComplete": {
            "named": "{mission} クリア！ +{rewardText}EXP",
            "generic": "ミッション完了！ +{rewardText}EXP"
          },
          "missionFailed": {
            "named": "{mission} 失敗…",
            "generic": "ミッション失敗…"
          },
          "combo": "コンボ {countText}！ +{xpText}EXP",
          "skillShotSuccess": "スキルショット成功！ +{xpText}EXP"
        },
        "hud": {
          "combo": {
            "none": "-"
          },
          "status": "ボール: {livesText} / スコア: {scoreText} / EXP: {expText} / チェイン: x{chainText} / コンボ: {comboText}"
        }
      },
      "trump_games": {
        "layout": {
          "navHeader": "トランプゲーム",
          "title": "トランプセレクション",
          "difficulty": "難易度 {difficulty} ×{multiplier}",
          "settings": "設定"
        },
        "placeholder": {
          "primary": "左のリストからゲームを選んでください。",
          "separator": " / ",
          "phaseInfo": "フェーズ {phase}: {games}"
        },
        "status": {
          "selectGame": "ゲームを選択してください。",
          "comingSoon": "開発中のゲームです。今後のアップデートをお待ちください。",
          "devPlaceholder": "現在は開発中です。"
        },
        "actions": {
          "returnToHub": "セレクションに戻る",
          "default": "操作",
          "backToList": "一覧に戻る"
        },
        "list": {
          "badge": {
            "comingSoon": "準備中",
            "bestScore": "ベスト {score}"
          },
          "unimplemented": {
            "phase": "フェーズ {phase} で実装予定です。",
            "status": "実装準備中です。"
          }
        },
        "errors": {
          "initToast": "ゲームの初期化に失敗しました。",
          "initFallback": "初期化に失敗しました。別のゲームを試してください。"
        },
        "settings": {
          "heading": "設定",
          "cardBack": "カード裏面テーマ",
          "autoFlip": "神経衰弱で不一致カードを自動で裏返す"
        },
        "cardBacks": {
          "classic": {
            "label": "クラシック",
            "description": "ネイビーの王道パターン"
          },
          "modern": {
            "label": "モダン",
            "description": "ビビッドなサイバー柄"
          },
          "forest": {
            "label": "フォレスト",
            "description": "深緑と金のグラデ"
          }
        },
        "games": {
          "memory": {
            "title": "神経衰弱",
            "description": "ペアを揃える定番記憶ゲーム。"
          },
          "blackjack": {
            "title": "ブラックジャック",
            "description": "21を目指してディーラーと勝負。"
          },
          "baba": {
            "title": "ババ抜き",
            "description": "ジョーカーを最後まで残さないように。"
          },
          "klondike": {
            "title": "ソリティア（クロンダイク）",
            "description": "7列の場札から台札を揃えるソリティア。"
          },
          "spider": {
            "title": "スパイダーソリティア",
            "description": "完成した列を確実に作る耐久ソリティア。"
          },
          "freecell": {
            "title": "フリーセル",
            "description": "4つのセルを駆使するソリティア。"
          },
          "hearts": {
            "title": "ハーツ",
            "description": "ハートを避けるトリックテイキング。"
          },
          "sevens": {
            "title": "七並べ",
            "description": "7を基点にカードを並べる。"
          },
          "poker": {
            "title": "ポーカー（ドロー）",
            "description": "役を完成させて高得点を狙う。"
          },
          "jiji": {
            "title": "ジジ抜き",
            "description": "ジョーカー設定可のババ抜き拡張。"
          },
          "daifugo": {
            "title": "大富豪",
            "description": "革命必至の手札管理ゲーム。"
          },
          "pageone": {
            "title": "ページワン",
            "description": "UNOの祖先とされる定番ゲーム。"
          }
        },
        "common": {
          "actions": {
            "hint": "ヒント (H)",
            "restart": "リスタート (R)",
            "returnToList": "ゲーム一覧 (B)",
            "newGame": "新しいゲーム (R)",
            "rematch": "再戦する"
          },
          "hud": {
            "scoreSummary": "通算 {plays} 回 / ベスト {best} / 手札 {hand} 枚",
            "noRecord": "---",
            "bestPlace": "{place} 位"
          },
          "status": {
            "turn": "{name} の番"
          },
          "youSuffix": " (You)",
          "hand": {
            "empty": "手札なし",
            "cleared": "上がり ({place}位)"
          },
          "player": {
            "finished": "{place} 位確定"
          }
        },
        "klondike": {
          "labels": {
            "stock": "山札",
            "waste": "捨て札",
            "foundation": "{symbol} 台札"
          },
          "info": {
            "initial": "山札をめくるか、場札を選択して移動しましょう。",
            "selectDestination": "移動先をクリックしてください。空列にはキングのみ置けます。",
            "recyclePrompt": "捨て札をクリックして山札に戻しましょう。",
            "finished": "おめでとうございます！新しいゲームで腕試ししましょう。"
          },
          "actions": {
            "drawStock": "山札をめくる (D)",
            "autoFoundation": "自動で台札へ (A)",
            "newGame": "新しいゲーム (R)"
          },
          "status": {
            "summary": "移動 {moves} 手 ・ 再構築 {recycles} 回 ・ 山札 {stock} ・ 捨て札 {waste} ・ 台札 {foundation}"
          },
          "hud": {
            "bestMoves": "{moves} 手",
            "scoreSummary": "通算 {plays} 回 / 勝利 {wins} 回 / ベスト {best}"
          },
          "placeholders": {
            "recycle": "返す",
            "empty": "空"
          },
          "toast": {
            "newLayout": "新しい配置でゲームを開始しました。",
            "emptyStock": "山札も捨て札も空です。",
            "recycledWaste": "捨て札を山札に戻しました。",
            "noFoundationSpace": "台札に置ける場所がありません。",
            "invalidTableauMove": "その列には移動できません。",
            "lockedCard": "このカードはまだ表にできません。",
            "cleared": "クロンダイクをクリアしました！"
          }
        },
        "memory": {
          "actions": {
            "retry": "もう一度 (R)"
          },
          "toast": {
            "resolveOpenCards": "開いたカードを戻してから次をめくってください。",
            "manualReset": "不一致です。カードをタップして裏返してください。",
            "cleared": "クリア！タイム {time} / ミス {misses}"
          },
          "flip": {
            "auto": "自動",
            "manual": "手動"
          },
          "status": {
            "summary": "ペア {matches}/{pairs} ・ ミス {misses} ・ 経過 {time} ・ 裏返し {mode}"
          },
          "hud": {
            "bestSeconds": "{seconds} 秒",
            "scoreSummary": "通算 {plays} 回 / ベスト {best}"
          }
        },
        "hearts": {
          "actions": {
            "newDeal": "新しいディール (R)",
            "nextDeal": "次のディール (R)"
          },
          "status": {
            "summary": "トリック {trick}/13 ・ ハート解禁 {status}",
            "heartsBroken": {
              "yes": "済",
              "no": "未"
            }
          }
        },
        "spider": {
          "actions": {
            "dealStock": "山札を配る (D)"
          }
        },
        "baba": {
          "status": {
            "humanTurn": "あなたの番：右隣のカードをクリックしてください。（手札 {cards} 枚）"
          },
          "toast": {
            "hint": "右隣のプレイヤーのカードをクリックして引きましょう。",
            "start": "ゲーム開始！右隣のプレイヤーからカードを引きましょう。",
            "finish": "上がり！順位 {place}",
            "loser": "{name} がジョーカーを持っています。ゲーム終了！"
          }
        },
        "jiji": {
          "table": {
            "label": "台札",
            "rank": "ランク: {rank}",
            "none": "台札なし"
          },
          "controls": {
            "swap": {
              "enable": "交換モード",
              "disable": "交換モード解除"
            }
          },
          "status": {
            "humanTurn": "あなたの番：必要なら台札と交換し、右隣からカードを引きましょう。",
            "selectSwap": "交換するカードを自分の手札から選んでください。",
            "humanDraw": "台札と交換するか、右隣からカードを引いてください。"
          },
          "toast": {
            "noTable": "交換できる台札がありません。",
            "hint": "台札と同じランクを揃えると手札を減らせます。",
            "swapped": "台札と交換しました。",
            "exitSwap": "交換モードを終了してください。",
            "loser": "{name} がジジを持っています。ゲーム終了！",
            "tableMissing": "台札がありません。",
            "cannotPlaceJiji": "ジジは台札に置けません。",
            "finish": "上がり！順位 {place}"
          }
        },
        "blackjack": {
          "labels": {
            "dealer": "ディーラー",
            "player": "プレイヤー"
          },
          "actions": {
            "hit": "ヒット (H)",
            "stand": "スタンド (S)",
            "restart": "リスタート (R)",
            "nextHand": "次のハンド (N)"
          },
          "messages": {
            "chooseAction": "HIT / STAND を選択してください。",
            "chooseActionAlt": "HIT または STAND を選択してください。",
            "blackjackPlayer": "ブラックジャック！",
            "blackjackDealer": "ディーラーがブラックジャック…",
            "blackjackPush": "両者ブラックジャック。プッシュ！",
            "bust": "バースト ({value})",
            "totalPrompt": "合計 {value} / HIT or STAND",
            "dealerBust": "ディーラーがバースト ({value})",
            "dealerVsPlayer": "ディーラー {dealer} 対 {player}",
            "playerWin": "勝利！{player} 対 {dealer}",
            "push": "プッシュ ({value})"
          },
          "status": {
            "tally": "勝利 {wins} / 敗北 {losses} / プッシュ {pushes}"
          },
          "hud": {
            "score": "通算プレイ {plays} ・ 勝利 {wins}"
          },
          "toast": {
            "consolation": "残念！次は勝てるはず。"
          }
        }
      },
      "gamble_hall": {
        "nav": {
          "title": "ゲームセレクト",
          "items": {
            "roulette": {
              "label": "ルーレット",
              "detail": "欧州式37マス"
            },
            "slot": {
              "label": "パチンコスロット",
              "detail": "3リール＋スター配当"
            },
            "dice": {
              "label": "ラッキーダイス",
              "detail": "5種のベットモード"
            }
          }
        },
        "sidebar": {
          "balanceLabel": "残高",
          "sessionNetLabel": "セッション収支",
          "maxWinLabel": "最大勝利"
        },
        "header": {
          "balanceLabel": "利用可能EXP",
          "betLabel": "ベット額",
          "sessionNet": "セッション収支",
          "biggestWin": "最大獲得",
          "betPlaceholder": "10",
          "betAdjust": {
            "plus10": "+10",
            "plus50": "+50",
            "max": "MAX"
          }
        },
        "hud": {
          "expValue": "{value} EXP",
          "netValue": "{delta} EXP"
        },
        "history": {
          "title": "直近の結果",
          "empty": "まだ履歴がありません。",
          "betLabel": "BET {bet}",
          "meta": "{bet} / {detail}",
          "netDelta": "{delta}",
          "roulette": {
            "detail": "{result} / {outcome}"
          },
          "slot": {
            "detail": "{symbols} / {result}"
          },
          "dice": {
            "detail": "{faces} / 合計{totalFormatted}"
          }
        },
        "roulette": {
          "spin": "スピン",
          "numberOption": "No.{number}",
          "result": {
            "numberLabel": "No.{number}",
            "detail": "No.{number} {color}"
          },
          "betTypes": {
            "colorRed": "赤",
            "colorBlack": "黒",
            "colorGreen": "緑(0)",
            "parityEven": "偶数",
            "parityOdd": "奇数",
            "number": "番号指定"
          },
          "colors": {
            "red": "赤",
            "black": "黒",
            "green": "緑",
            "unknown": "不明"
          },
          "results": {
            "colorRed": {
              "hit": "赤的中",
              "miss": "赤ハズレ"
            },
            "colorBlack": {
              "hit": "黒的中",
              "miss": "黒ハズレ"
            },
            "colorGreen": {
              "hit": "0ヒット！",
              "miss": "0ハズレ"
            },
            "parityEven": {
              "hit": "偶数的中",
              "miss": "偶数ハズレ"
            },
            "parityOdd": {
              "hit": "奇数的中",
              "miss": "奇数ハズレ"
            },
            "number": {
              "hit": "{number} 的中！",
              "miss": "{number} ハズレ"
            },
            "miss": "ハズレ"
          }
        },
        "slot": {
          "start": "スタート",
          "hint": "同じ絵柄やスター付きペアで配当アップ！",
          "results": {
            "jackpot": "777ジャックポット！",
            "barTriple": "BAR揃い！",
            "triple": "トリプルヒット！",
            "pairWithStar": "{symbol} ペア＋スター！",
            "pair": "{symbol} ペア！",
            "miss": "ハズレ…"
          }
        },
        "dice": {
          "buttons": {
            "roll": "ロール"
          },
          "mode": {
            "option": "{label} x{multiplier}",
            "hintDisplay": "{hint} (x{multiplier})"
          },
          "modes": {
            "high": {
              "label": "ハイ (11-18)",
              "hint": "合計が11以上で配当x2。ゾロ目は対象外。"
            },
            "low": {
              "label": "ロー (3-10)",
              "hint": "合計が10以下で配当x2。ゾロ目は対象外。"
            },
            "lucky7": {
              "label": "ラッキー7",
              "hint": "合計7ちょうどで高配当！"
            },
            "allDiff": {
              "label": "バラバラ",
              "hint": "3つとも違う目で配当x4。"
            },
            "triple": {
              "label": "ゾロ目",
              "hint": "全て同じ目で超高配当！"
            },
            "unknown": "不明"
          },
          "rollingLabel": "ロール中…",
          "resultLine": "出目 {faces} (合計 {totalFormatted})",
          "results": {
            "hit": "的中！",
            "miss": "ハズレ…"
          }
        },
        "status": {
          "ready": "ベットしてゲームを始めましょう。",
          "betRequired": "ベット額を入力してください。",
          "slotBusy": "リール停止を待っています…",
          "notEnoughExp": "EXPが不足しています。",
          "slotSpinning": "リール回転中…",
          "slotResult": "{game}: {result} {net}",
          "diceBusy": "結果表示をお待ちください…",
          "diceRolling": "ダイスを振っています…",
          "diceResult": "{game}: {mode} {outcome} {net}",
          "rouletteBusy": "ルーレットが回転中です…",
          "noExp": "利用可能なEXPがありません。",
          "rouletteSpinning": "ルーレットを回しています…",
          "rouletteResult": "{game}: {result} ({detail}) {net}"
        }
      },
      "breakout_k": {
        "hud": {
          "lives": "ライフ: {count}",
          "destroyed": "破壊: {count}",
          "difficulty": "難易度: {difficulty}",
          "controls": "← / → または A / D でバー操作"
        }
      },
      "login_bonus": {
        "title": "ログインボーナスカレンダー",
        "subtitle": "毎日ログインして特典を獲得しましょう。獲得情報は自動保存されます。",
        "summary": {
          "total": "累計受け取り: {countFormatted}回",
          "month": "{year}年{month}月の受け取り: {countFormatted}回"
        },
        "calendar": {
          "monthLabel": "{year}年{month}月",
          "weekdayShort": {
            "sun": "日",
            "mon": "月",
            "tue": "火",
            "wed": "水",
            "thu": "木",
            "fri": "金",
            "sat": "土"
          },
          "badge": {
            "claimed": "受取済み"
          }
        },
        "buttons": {
          "claimToday": "今日のボーナスを受け取る"
        },
        "detail": {
          "descriptionTemplate": "{description}\n{effect}",
          "status": {
            "claimed": "受取済み ({time})",
            "today": "本日受け取れます。",
            "expired": "期間終了。受け取り済みの場合のみ記録が残ります。",
            "locked": "まだ受け取れません。ログイン可能日までお待ちください。"
          }
        },
        "messages": {
          "alreadyClaimed": "既に受け取り済みです。",
          "onlyToday": "本日のボーナスのみ受け取れます。",
          "grant": {
            "header": "{date} のボーナスを受け取りました。",
            "exp": "経験値 +{amount} を獲得。",
            "itemReceived": "{item} x{amount} を獲得しました。",
            "itemFailed": "{item}を受け取れませんでした（API未対応の可能性があります）。",
            "itemGeneric": "アイテム報酬を受け取りました。",
            "itemsReceived": "以下のアイテムを獲得しました: {summary}",
            "itemsFailed": "以下のアイテム付与はホストAPI未対応のため反映されませんでした: {summary}",
            "spFilled": "SPが最大まで回復しました。",
            "spFillFailed": "SPは既に最大か、APIが未対応でした。",
            "spRecovered": "SPが{amount}回復しました。",
            "spReduced": "SPが{amount}減少しました。",
            "spNoChange": "SPに変化はありませんでした。",
            "spChanged": "SPが変化します。",
            "default": "報酬を受け取りました。",
            "specialTag": "特別イベント: {tag}"
          }
        },
        "describe": {
          "exp": "経験値 +{amount}",
          "itemQuantity": "{item}を{amount}個受け取れます。",
          "itemSingle": "{item}を受け取れます。",
          "itemGeneric": "アイテム報酬を受け取れます。",
          "itemsList": "以下のアイテムを受け取れます: {summary}",
          "spFill": "SPが最大まで回復します。",
          "spRecover": "SPが{amount}回復します。",
          "spReduce": "SPが{amount}減少します。",
          "spChange": "SPが変化します。"
        },
        "format": {
          "itemSummary": "{item} x{amount}",
          "itemSummarySeparator": " / ",
          "longDate": "{formatted}"
        },
        "items": {
          "potion30": "回復アイテム",
          "hpBoost": "HPブースト",
          "atkBoost": "攻撃力ブースト",
          "defBoost": "防御力ブースト"
        },
        "rewards": {
          "exp333": {
            "label": "EXP{amount}",
            "description": "ログインで経験値{amount}を獲得できます。"
          },
          "exp777": {
            "label": "EXP{amount}",
            "description": "ログインで経験値{amount}を獲得できます。"
          },
          "exp2000": {
            "label": "EXP{amount}（{levels}レベルアップ）",
            "description": "経験値{amount}で一気にレベルアップ！"
          },
          "heal10": {
            "label": "回復アイテムx{amount}",
            "description": "{item}をまとめて{amount}個獲得。冒険前に備えましょう。"
          },
          "item_set": {
            "label": "アイテムセット（全種類{amount}個ずつ）",
            "description": "主要アイテムを各{amount}個ずつ受け取れます。"
          },
          "sp_full": {
            "label": "SP満タン",
            "description": "SPが最大まで回復します。スキル連発のチャンス！"
          },
          "exp1300": {
            "label": "EXP{amount}",
            "description": "経験値{amount}でさらなる成長。"
          },
          "unknown": {
            "label": "不明な報酬",
            "description": "報酬内容を取得できませんでした。"
          }
        },
        "specialRewards": {
          "monthEnd": {
            "label": "月末ボーナス EXP{amount}",
            "description": "月末ログインで経験値{amount}！来月への準備も万端です。"
          },
          "newYear": {
            "label": "新年スペシャル EXP{amount}",
            "description": "1月1日は大盤振る舞い！経験値{amount}を獲得できます。"
          },
          "sunday": {
            "label": "回復アイテムx{amount}",
            "description": "毎週日曜日は{item}を{amount}個プレゼント！"
          }
        },
        "specialTags": {
          "monthEnd": "月末スペシャル",
          "newYear": "新年限定",
          "sunday": "サンデーボーナス"
        }
      },
      "timer": {
        "title": "タイマー",
        "subtitle": "集中や休憩の時間管理に。シンプルなカウントダウンとストップウォッチ。",
        "xpBadge": {
          "current": "今回獲得 {amount} EXP"
        },
        "modes": {
          "countdown": "カウントダウン",
          "stopwatch": "ストップウォッチ"
        },
        "inputs": {
          "hours": "時間",
          "minutes": "分",
          "seconds": "秒"
        },
        "quickButtons": {
          "plus1m": "+1分",
          "plus5m": "+5分",
          "plus10m": "+10分",
          "minus1m": "-1分",
          "pomodoro": "25分ポモドーロ"
        },
        "buttons": {
          "start": "開始",
          "pause": "一時停止",
          "resume": "再開",
          "reset": "リセット"
        },
        "status": {
          "readyGeneric": "準備完了",
          "readyCountdown": "カウントダウンの準備完了",
          "readyStopwatch": "ストップウォッチの準備完了",
          "countdownRunning": "カウント中…",
          "countdownResumed": "再開しました",
          "paused": "一時停止中",
          "completed": "完了！お疲れさまでした",
          "stopwatchRunning": "計測中…",
          "stopwatchMinute": "{minutes}分経過",
          "stopwatchMinuteWithXp": "{minutes}分経過！"
        },
        "history": {
          "title": "最近のログ",
          "labels": {
            "complete": "完了",
            "start": "開始",
            "stopwatchMinute": "経過",
            "default": "達成"
          },
          "expGain": "{label}: +{xp} EXP",
          "completeNoXp": "タイマー完了！"
        }
      },
      "exceler": {
        "header": {
          "title": "表計算エクセラー",
          "subtitle": "{filename} — {sheet}",
          "buttons": {
            "new": "新規",
            "import": "インポート",
            "export": "エクスポート",
            "compatibility": "互換性"
          }
        },
        "ribbon": {
          "tabs": {
            "home": "ホーム",
            "formulas": "数式",
            "view": "表示"
          },
          "groups": {
            "clipboard": "クリップボード",
            "font": "フォント",
            "alignment": "配置 / 罫線",
            "number": "数値",
            "functionLibrary": "関数ライブラリ",
            "formulaHelper": "数式アシスト",
            "display": "表示設定",
            "zoom": "ズーム"
          },
          "buttons": {
            "undo": "↺ 元に戻す",
            "redo": "↻ やり直し",
            "alignLeft": "⟸ 左寄せ",
            "alignCenter": "⇔ 中央",
            "alignRight": "⟹ 右寄せ",
            "alignTop": "⇑ 上",
            "alignMiddle": "⇕ 中央",
            "alignBottom": "⇓ 下",
            "insertFunction": "関数を挿入",
            "insertSum": "Σ SUM",
            "insertAverage": "AVG",
            "insertIf": "IF"
          },
          "tooltips": {
            "fontSize": "フォントサイズ",
            "borderColor": "罫線色"
          },
          "borderOptions": {
            "placeholder": "罫線スタイル",
            "outline": "外枠",
            "all": "格子",
            "top": "上罫線",
            "bottom": "下罫線",
            "left": "左罫線",
            "right": "右罫線",
            "clear": "罫線を消去"
          },
          "numberFormats": {
            "general": "標準",
            "number": "数値",
            "currency": "通貨",
            "percent": "パーセント",
            "comma": "桁区切り",
            "scientific": "指数",
            "date": "日付",
            "time": "時刻"
          }
        },
        "formula": {
          "placeholder": "数式を入力 (例: =SUM(A1:B3))"
        },
        "functions": {
          "descriptions": {
            "SUM": "数値の合計を求めます。",
            "AVERAGE": "数値の平均を返します。",
            "MIN": "最小値を返します。",
            "MAX": "最大値を返します。",
            "COUNT": "数値が入力されたセルをカウントします。",
            "COUNTA": "空白でないセルをカウントします。",
            "IF": "条件に応じて値を切り替えます。",
            "ROUND": "指定した桁数で四捨五入します。",
            "ROUNDUP": "指定した桁数で切り上げます。",
            "ROUNDDOWN": "指定した桁数で切り捨てます。",
            "ABS": "絶対値を返します。",
            "INT": "整数部分を返します。",
            "MOD": "除算の余りを返します。",
            "POWER": "累乗を計算します。",
            "SQRT": "平方根を求めます。",
            "CONCAT": "文字列を結合します。",
            "CONCATENATE": "文字列を結合します。",
            "TEXT": "数値を書式設定して文字列にします。",
            "LEN": "文字列の長さを返します。",
            "SUBTOTAL": "指定した集計を実行します。",
            "SUMIF": "条件に一致する値の合計を計算します。",
            "COUNTIF": "条件に一致するセルを数えます。",
            "AVERAGEIF": "条件に一致する値の平均を計算します。",
            "IFERROR": "エラー時に代替値を返します。",
            "PRODUCT": "数値をすべて乗算します。",
            "VLOOKUP": "縦方向に検索して値を返します。",
            "HLOOKUP": "横方向に検索して値を返します。",
            "INDEX": "範囲から行・列を指定して値を取得します。",
            "MATCH": "範囲内で検索値の位置を返します。",
            "TODAY": "本日の日付を返します。",
            "NOW": "現在の日付と時刻を返します。",
            "DATE": "年・月・日から日付を生成します。",
            "TIME": "時刻を生成します。",
            "UPPER": "文字列を大文字に変換します。",
            "LOWER": "文字列を小文字に変換します。",
            "LEFT": "先頭から指定文字数を取得します。",
            "RIGHT": "末尾から指定文字数を取得します。",
            "MID": "指定位置から文字列を取得します。",
            "TRIM": "余分な空白を除去します。"
          }
        },
        "view": {
          "showGrid": "グリッド線を表示"
        },
        "sheet": {
          "tab": { "tooltip": "クリックで切り替え、ダブルクリックで名前変更、右クリックでタブ色を変更" },
          "add": { "tooltip": "新しいシートを追加" },
          "color": { "tooltip": "現在のシートタブの色を変更 (右クリックでクリア)" },
          "renamePrompt": "シート名を入力",
          "duplicateName": "同じ名前のシートがあります。"
        },
        "status": {
          "sessionXp": "セッションEXP: {value}"
        },
        "confirm": {
          "unsavedChanges": "未保存の変更があります。続行しますか？"
        },
        "filename": {
          "newWorkbook": "新しいブック.xlsx",
          "defaultExport": "ワークシート.xlsx"
        },
        "warning": {
          "newWorkbook": "新規ブックは互換性制限があります。図形/マクロは未対応です。",
          "importLimited": "互換性注意: 図形・マクロ・外部参照・一部の書式は読み込まれていません。"
        },
        "alert": {
          "fileTooLarge": "ファイルが大きすぎます (5MB まで)",
          "importUnsupported": "互換性注意: 未対応の機能は破棄されます。",
          "importFailed": "読み込みに失敗しました: {message}",
          "exportCompatibility": "互換性注意: 図形・マクロ・一部の書式や関数は保存されません。",
          "exportFailed": "書き出しに失敗しました: {message}"
        },
        "errors": {
          "parseFailed": "式の解析に失敗しました",
          "unterminatedString": "文字列リテラルが閉じられていません",
          "unknownToken": "未知のトークン: {token}",
          "incompleteExpression": "式が不完全です",
          "missingClosingParen": ") が必要です",
          "unknownIdentifier": "未知の識別子: {identifier}",
          "invalidRangeEnd": "範囲の終端が不正です",
          "unparsableToken": "解析できないトークン",
          "sheetNotFound": "シートが見つかりません"
        },
        "modal": {
          "compatibility": "互換性について\n- 複数シート/タブ色は簡易サポート (高度な設定は失われます)\n- 図形・マクロ・ピボット・外部リンクは未対応\n- 条件付き書式・結合セルは保持されません"
        }
      },
      "electro_instrument": {
        "title": "電子楽器スタジオ",
        "badge": "TOY MOD",
        "description": "ピアノ鍵盤で自由に演奏し、音色を切り替えてサウンドメイク。各音を奏でるたびにEXPを獲得します。キーボードでも演奏可能です。",
        "controls": {
          "instrument": "音色",
          "masterVolume": "マスターボリューム"
        },
        "hud": {
          "sessionExp": "セッションEXP"
        },
        "legend": {
          "whiteKey": "白鍵：基本音",
          "blackKey": "黒鍵：半音"
        },
        "activity": {
          "latest": "最新のフレーズ",
          "limit": "(最大10音)",
          "placeholder": {
            "start": "キーを押して演奏開始",
            "empty": "まだ音がありません"
          }
        },
        "instruments": {
          "piano": "スタジオピアノ",
          "synth_pad": "シンセパッド",
          "electric_organ": "エレクトリックオルガン",
          "digital_strings": "デジタルストリングス"
        }
      },
      "music_player": {
        "title": "ミュージックプレイヤー",
        "subtitle": "ローカル音源を再生するユーティリティ",
        "actions": {
          "import": "音源を追加"
        },
        "settings": {
          "shuffle": "シャッフル再生",
          "loopMode": "ループモード",
          "clearLibrary": "ライブラリを全削除"
        },
        "controls": {
          "volume": "音量",
          "playbackRate": "再生速度"
        },
        "playlist": {
          "title": "プレイリスト",
          "search": "検索...",
          "count": "{count} 曲"
        },
        "status": {
          "playlist": "曲数: {count} / {max} | 合計時間: {duration}",
          "session": "セッションEXP: {exp}"
        },
        "eq": {
          "title": "イコライザー",
          "presets": {
            "flat": "フラット",
            "rock": "ロック",
            "vocal": "ボーカル",
            "bassBoost": "低音強調",
            "custom": "カスタム"
          }
        },
        "loop": {
          "none": "ループなし",
          "one": "1曲リピート",
          "all": "全曲リピート"
        },
        "visualizer": {
          "oscilloscope": "オシロスコープ",
          "frequency": "周波数スペクトラム"
        },
        "toast": {
          "audioInitFailed": "オーディオコンテキストを初期化できませんでした",
          "fileTooLarge": "{name} はサイズ上限 ({maxBytes} バイト) を超えています",
          "libraryCleared": "ライブラリをクリアしました",
          "libraryLoadFailed": "ライブラリの読み込みに失敗しました",
          "loadFailed": "音源の読み込みに失敗しました",
          "noTracks": "再生するトラックがありません",
          "playFailed": "再生を開始できませんでした",
          "playlistFull": "プレイリストの上限に達しました（最大 {max} 曲）",
          "removed": "{name} を削除しました",
          "saveFailed": "{name} を保存できませんでした",
          "trackMissing": "トラックが見つかりません"
        },
        "dialog": {
          "renamePrompt": "トラック名を入力",
          "clearConfirm": "すべての音源を削除しますか？"
        },
        "track": {
          "untitled": "名称未設定"
        },
        "header": {
          "measuring": "長さ計測中",
          "playing": "再生中 • {duration}"
        }
      },
      "counter_pad": {
        "title": "カウンターパッド",
        "subtitle": "複数のカウントを素早く管理。増減操作は自動保存されます。",
        "defaults": {
          "counterName": "カウンター{index}",
          "newCounter": "新しいカウンター"
        },
        "form": {
          "namePlaceholder": "カウンター名",
          "initialValuePlaceholder": "初期値 (0)",
          "stepPlaceholder": "ステップ (1)",
          "addButton": "追加"
        },
        "summary": {
          "count": "カウンター {count}件",
          "total": "合計 {value}",
          "sessionXp": "セッションEXP {value}"
        },
        "emptyState": "まだカウンターがありません。上のフォームから追加してください。",
        "counter": {
          "delete": "削除",
          "deleteConfirm": "{name} を削除しますか？",
          "stepLabel": "ステップ",
          "reset": "リセット"
        },
        "alerts": {
          "limitReached": "これ以上は追加できません (最大{max}件)"
        }
      },
      "calculator": {
        "modes": {
          "standard": "標準",
          "programmer": "プログラマー",
          "summary": {
            "standard": "標準モード (10進)",
            "programmer": "プログラマーモード / 基数{base}"
          }
        },
        "programmer": {
          "baseNames": {
            "2": "2進",
            "4": "4進",
            "6": "6進",
            "8": "8進",
            "10": "10進",
            "16": "16進",
            "24": "24進",
            "30": "30進"
          },
          "baseOption": "{baseName} (基数{base})",
          "baseSuffix": " (基数{base})"
        },
        "history": {
          "title": "履歴",
          "clear": "クリア",
          "empty": "履歴はありません。",
          "status": "履歴: {count}",
          "statusWithBase": "履歴: {count} / 基数{base}"
        },
        "status": {
          "memoryEmpty": "M: --",
          "memory": "M: {value}",
          "memoryWithBase": "M: {value} (基数{base})"
        },
        "error": "エラー"
      },
      "calc_combo": {
        "name": "計算コンボ",
        "title": "{name} ({difficulty})",
        "difficulty": {
          "easy": "EASY",
          "normal": "NORMAL",
          "hard": "HARD"
        },
        "stats": {
          "correct": "正解",
          "mistake": "ミス",
          "combo": "コンボ",
          "xp": "累計EXP"
        },
        "input": {
          "answerPlaceholder": "答えを入力"
        },
        "buttons": {
          "submit": "回答"
        },
        "shortcuts": {
          "submitOrSkip": "Enterで回答 / Escでスキップ"
        },
        "history": {
          "title": "履歴 (直近{count}問)",
          "correctEntry": "○ {expression}",
          "mistakeEntry": "× {expression} = {answer}",
          "streakEntry": "★ {combo}連続ボーナス",
          "gain": "+{value} EXP",
          "loss": "{value} EXP",
          "neutral": "±0 EXP"
        },
        "question": {
          "loading": "準備中…",
          "prompt": "{expression} = ?"
        },
        "pop": {
          "correct": "正解！ 基本{base} + コンボ{combo} + スピード{speed}",
          "streak": "コンボ{combo}達成！ボーナス+{bonus}",
          "mistake": "正解は {answer}",
          "emptyAnswer": "入力してから回答してください",
          "invalidAnswer": "数値で入力してください"
        }
      },
      "circuit_simulator": {
        "title": "電気回路シミュレータ",
        "subtitle": "電源・受動素子・計器をつないでDC/AC回路をリアルタイム解析します。",
        "tools": {
          "header": "ツール",
          "select": "選択・移動",
          "addNode": "ノード追加"
        },
        "components": {
          "wire": {
            "label": "導線",
            "name": "導線{index}",
            "description": "抵抗値ほぼ0の線"
          },
          "resistor": {
            "label": "抵抗",
            "name": "抵抗{index}",
            "description": "オーム抵抗"
          },
          "capacitor": {
            "label": "コンデンサ",
            "name": "コンデンサ{index}",
            "description": "容量性リアクタンス素子"
          },
          "inductor": {
            "label": "インダクタ",
            "name": "インダクタ{index}",
            "description": "誘導性リアクタンス素子"
          },
          "power": {
            "label": "電源",
            "name": "電源{index}",
            "description": "理想電圧源＋内部抵抗"
          },
          "ac_source": {
            "label": "AC電源",
            "name": "AC電源{index}",
            "description": "正弦波電圧源（RMS設定）"
          },
          "current_source": {
            "label": "電流源",
            "name": "電流源{index}",
            "description": "理想定電流源"
          },
          "ammeter": {
            "label": "電流計",
            "name": "電流計{index}",
            "description": "回路電流を計測（ほぼ0Ω）"
          },
          "voltmeter": {
            "label": "電圧計",
            "name": "電圧計{index}",
            "description": "ノード間電位差を測定"
          },
          "wattmeter": {
            "label": "電力計",
            "name": "電力計{index}",
            "description": "ノード間電力を測定"
          }
        },
        "defaults": {
          "nodes": {
            "a": "ノードA",
            "b": "ノードB",
            "ground": "グラウンド"
          },
          "elements": {
            "power": "電源",
            "resistor": "抵抗{index}",
            "wire": "ライン"
          }
        },
        "nodes": {
          "autoName": "ノード{index}"
        },
        "analysis": {
          "header": "解析モード",
          "mode": {
            "dc": "DC解析",
            "ac": "AC解析"
          },
          "frequency": {
            "label": "解析周波数 (Hz)",
            "hintActive": "AC解析で有効。0Hz〜1MHzまで設定可能。",
            "hintInactive": "AC解析を有効化すると周波数を調整できます。"
          }
        },
        "status": {
          "analysisMode": {
            "dc": "解析モード: DC解析",
            "ac": "解析モード: AC解析 ({frequency}Hz)"
          },
          "angularFrequency": "角周波数: {value} rad/s",
          "activeTool": "操作ツール: {tool}",
          "connectionStart": "接続開始: {node}",
          "ground": {
            "set": "グラウンド: {node}",
            "unset": "グラウンド: 未設定"
          },
          "warningItem": "⚠ {message}",
          "diagnostics": {
            "header": "診断:",
            "item": "・{message}"
          }
        },
        "summary": {
          "pending": "解析待ちです",
          "powerDelivered": "供給電力: {value}",
          "powerDissipated": "消費電力: {value}",
          "powerFactor": "力率: {value}",
          "maxNodeVoltage": "最大ノード電位: {node} = {value}",
          "maxBranchCurrent": "最大枝電流: {value} {unit}",
          "sessionXp": "セッションXP: {value}",
          "nodeVoltagesHeader": "ノード電位:",
          "nodeVoltageItem": "- {node}: {value}"
        },
        "canvas": {
          "labels": {
            "voltage": "V",
            "current": "I",
            "power": "P",
            "reactivePower": "Q"
          }
        },
        "inspector": {
          "title": "インスペクタ",
          "prompt": "ノードまたはコンポーネントを選択してください。",
          "node": {
            "title": "ノード: {node}",
            "notFound": "ノードが見つかりません",
            "potential": "電位: {value}",
            "setGround": "このノードをグラウンドに設定",
            "delete": "ノード削除",
            "deleteConfirm": "このノードと接続部品を削除しますか？"
          },
          "element": {
            "title": "{component}",
            "notFound": "コンポーネントが見つかりません",
            "delete": "コンポーネント削除",
            "deleteConfirm": "このコンポーネントを削除しますか？"
          },
          "fields": {
            "name": "名称",
            "resistance": "抵抗 (Ω)",
            "voltage": "電圧 (V)",
            "internalResistance": "内部抵抗 (Ω)",
            "acVoltage": "電圧（RMS, V）",
            "phase": "位相 (°)",
            "capacitance": "容量 (F)",
            "inductance": "インダクタンス (H)",
            "current": "電流 (A)"
          },
          "meterNote": "計器は回路には影響しません。ノード間の実測値を表示します。",
          "connection": "接続: {nodeA} ↔ {nodeB}",
          "reactive": {
            "capacitor": "リアクタンス Xc: {value} Ω",
            "capacitorInfinite": "リアクタンス Xc: ∞ Ω",
            "inductor": "リアクタンス Xl: {value} Ω",
            "inductorInfinite": "リアクタンス Xl: —"
          },
          "stats": {
            "voltage": "電圧",
            "current": "電流",
            "power": "電力"
          }
        },
        "solver": {
          "warnings": {
            "noNodes": "ノードがありません",
            "noSolution": "回路の解が求まりませんでした"
          },
          "errors": {
            "singular": "行列が特異なため解けません"
          },
          "diagnostics": {
            "isolatedNode": "ノード「{node}」は非導電要素により孤立しています",
            "dcCapacitor": "DC解析ではコンデンサが開放状態として扱われます",
            "dcInductor": "DC解析ではインダクタはほぼ短絡として扱われます",
            "acZeroFrequency": "AC解析の周波数が0Hzのため、結果はDCと同一です"
          }
        }
      },
      "acchimuitehoi": {
        "instructions": {
          "rpsTitle": "1. じゃんけんで攻守決定",
          "rpsHint": "勝ったら攻め、負けたら防御",
          "directionTitle": "2. あっち向いてホイ",
          "directionHint": "制限時間 {seconds} 秒以内に方向を選択",
          "logTitle": "戦況ログ"
        },
        "ui": {
          "stage": {
            "rps": "じゃんけんで攻守を決めよう",
            "attack": "攻撃フェーズ：指す方向を素早く選ぼう",
            "defense": "防御フェーズ：相手と違う方向を素早く選ぼう"
          }
        },
        "hands": {
          "rock": "グー",
          "scissors": "チョキ",
          "paper": "パー"
        },
        "direction": {
          "up": "上",
          "down": "下",
          "left": "左",
          "right": "右"
        },
        "role": {
          "attack": "攻め",
          "defense": "守り"
        },
        "countdown": {
          "idle": "残り --.- 秒",
          "remaining": "残り {seconds} 秒"
        },
        "score": {
          "primary": "攻め成功: {attackWins}／防御成功: {defenseWins}",
          "secondary": "攻め連続: {attackStreak}（最高 {bestAttackStreak}）／防御連続: {defenseStreak}（最高 {bestDefenseStreak}）",
          "tertiaryWithRate": "決着数: {rounds}／成功率: {successRate}%",
          "tertiaryEmpty": "決着数: 0／成功率: --%"
        },
        "status": {
          "ready": "手を選んでミニゲーム開始！",
          "tie": "あいこで {hand}！もう一度",
          "playerWin": "あなたの勝ち！制限内に指す方向を選んでヒットを狙おう",
          "cpuWin": "相手が攻め！制限内に別方向を選んで回避",
          "attack": {
            "hit": "ヒット！{direction}で{exp}EXP",
            "hitBonus": "ヒット！{direction}で{exp}EXP（連続{streak}）",
            "miss": "外した…CPUは{cpuDirection}を向いた",
            "timeout": "時間切れ…指しそびれた"
          },
          "defense": {
            "success": "回避成功！{cpuDirection}を避けた！{exp}EXP",
            "successBonus": "回避成功！{cpuDirection}を避けた（連続{streak}）",
            "fail": "回避失敗…同じ{direction}を向いた",
            "timeout": "時間切れ…反応できずヒット"
          },
          "paused": "一時停止中"
        },
        "log": {
          "tie": "あいこ続行",
          "rpsResult": "じゃんけん結果: あなた={playerHand}／相手={cpuHand} → {role}",
          "attackSuccess": "攻め成功：CPUは{cpuDirection} → {exp}EXP",
          "attackFail": "攻め失敗：CPU {cpuDirection}／あなた {playerDirection}",
          "defenseSuccess": "防御成功：相手 {cpuDirection}／あなた {playerDirection} → {exp}EXP",
          "defenseFail": "防御失敗：同方向でヒット",
          "attackTimeout": "攻め時間切れ：チャンスを逃した",
          "defenseTimeout": "防御時間切れ：反応が遅れた"
        }
      },
      "sudoku": {
        "title": "ナンプレ (数独)",
        "description": "1〜9の数字を使い、各行・列・3×3ブロックに同じ数字が入らないよう埋めてください。クリックまたはキーボード（数字/矢印/Backspace）で操作できます。",
        "info": {
          "difficultyLabel": "難易度",
          "progressLabel": "進行",
          "progressValue": "{filledFormatted}/{totalFormatted}",
          "mistakesLabel": "ミス",
          "mistakesValue": "{formatted}",
          "timeLabel": "タイム"
        },
        "difficulty": {
          "easy": "EASY",
          "normal": "NORMAL",
          "hard": "HARD"
        },
        "time": {
          "display": "{minutesFormatted}:{secondsFormatted}"
        },
        "keypad": {
          "clear": "消す"
        },
        "actions": {
          "reset": "リセット",
          "newBoard": "新しい盤面"
        },
        "status": {
          "invalid": "その数字は入れられません。",
          "selectCell": "マスを選択してください。",
          "reset": "リセットしました。",
          "newBoard": "新しい盤面を生成しました。",
          "cleared": "クリア！タイム {time} / ミス {mistakes}。"
        }
      },
      "taiko_drum": {
        "title": "太鼓リズム（{difficulty}）",
        "tips": "F/J/Space = ドン（赤）、D/K = カッ（青）。大音符は両方同時！タップもOK。",
        "controls": {
          "difficultyLabel": "難易度"
        },
        "buttons": {
          "start": "スタート"
        },
        "difficulty": {
          "easy": "EASY",
          "normal": "NORMAL",
          "hard": "HARD"
        },
        "judgement": {
          "good": "良",
          "ok": "可",
          "pass": "普",
          "miss": "不"
        },
        "hud": {
          "progressTemplate": "{label}: {value}%",
          "progressLabel": "進行度",
          "judgementTemplate": "{goodLabel}: {good} / {okLabel}: {ok} / {passLabel}: {pass} / {missLabel}: {miss}",
          "comboTemplate": "{comboLabel}: {combo} ({maxLabel} {maxCombo}) | {accuracyLabel}: {accuracy}% | {expLabel}: {exp}",
          "comboLabel": "コンボ",
          "maxComboLabel": "最大",
          "accuracyLabel": "精度",
          "expLabel": "EXP"
        },
      "result": {
        "title": "結果",
        "judgementTemplate": "{goodLabel}: {good} / {okLabel}: {ok} / {passLabel}: {pass} / {missLabel}: {miss}",
        "summaryTemplate": "{maxLabel} {maxCombo} | {totalExpLabel} {score} ({bonusLabel} {clearBonus}) | {goodRateLabel} {rate}%",
        "totalExpLabel": "総EXP",
        "clearBonusLabel": "クリアボーナス",
        "goodRateLabel": "良率"
      }
    },
      "minesweeper": {
        "controls": {
          "restart": "再開/再起動 ({key})"
        },
        "hud": {
          "info": "難易度:{difficulty} 地雷:{mines} 残り旗:{flags} 時間:{timeWithUnit} 開放:{opened}",
          "timeUnit": {
            "seconds": "秒"
          }
        },
        "difficulty": {
          "easy": "かんたん",
          "normal": "ふつう",
          "hard": "むずかしい"
        }
      },
      "sliding_puzzle": {
        "title": "{sizeText}×{sizeText} スライドパズル",
        "description": "空きマスにタイルをスライドして1→Nの順に並べよう。タイルをクリックするか矢印キー/WASDで操作できます。",
        "controls": {
          "reset": "リセット ({keyLabel})"
        },
        "info": {
          "moves": "手数",
          "time": "タイム",
          "best": "ベスト",
          "clears": "クリア数"
        },
        "status": {
          "cleared": "クリア！ {moves} 手 / {time} 取得EXP: {xp}",
          "intro": "難易度で盤面サイズが変わります：EASYは{easySize}×{easySize}、NORMALは{normalSize}×{normalSize}、HARDは{hardSize}×{hardSize}です。"
        }
      },
      "same": {
        "hud": {
          "title": "セイムゲーム",
          "removed": "消去数",
          "status": "{title} | {difficulty} | {removedLabel}: {removed}"
        },
        "difficulty": {
          "easy": "かんたん",
          "normal": "ふつう",
          "hard": "むずかしい"
        },
        "hint": {
          "popup": "{size}個 / 予想+{expFormatted}EXP"
        }
      },
      "piano_tiles": {
        "tips": "タップ or D/F/J/Kキーでレーンを叩き、長いノーツは離さずにホールド。",
        "hud": {
          "template": "{difficultyLabel}: {difficulty} | {hitsLabel}: {hits} | {missesLabel}: {misses} | {comboLabel}: {combo} ({maxLabel} {maxCombo}) | {accuracyLabel}: {accuracy}%",
          "difficultyLabel": "難易度",
          "hitsLabel": "成功",
          "missesLabel": "ミス",
          "comboLabel": "コンボ",
          "maxLabel": "最大",
          "accuracyLabel": "精度"
        },
        "difficulty": {
          "easy": "EASY",
          "normal": "NORMAL",
          "hard": "HARD"
        }
      },
      "janken": {
        "title": "じゃんけん 10EXP",
        "subtitle": "3連勝以上でボーナスEXP！",
        "status": {
          "prompt": "手を選ぶと掛け声が始まるよ",
          "winStreak": "連勝{streak}！次は？",
          "winNext": "ナイス！次の手を選んでね",
          "lose": "切り替えて次こそ勝とう！",
          "tie": "あいこ！そのままもう一度",
          "paused": "一時停止中"
        },
        "chant": {
          "step1": "最初はグー…",
          "step2": "じゃんけん…",
          "step3": "ぽん！"
        },
        "choices": {
          "rock": "グー",
          "scissors": "チョキ",
          "paper": "パー"
        },
        "log": {
          "title": "直近の結果",
          "intro": "勝てば10EXP！",
          "entry": "[第{round}戦] {message}"
        },
        "stats": {
          "primary": "勝ち: {wins}／負け: {losses}／あいこ: {ties}",
          "secondary": "連勝: {streak}（最高 {best}）／勝率: {winRate}%"
        },
        "messages": {
          "win": "勝ち！あなた={player}／相手={cpu} → {xp}EXP",
          "lose": "負け… あなた={player}／相手={cpu}",
          "tie": "あいこ：{player} vs {cpu} もう一度！"
        }
      },
      "darumasan": {
        "guard": {
          "title": "見張りの様子",
          "hint": "スペース / ↑ で前進",
          "state": {
            "idle": "準備中…",
            "safe": "今だ！前進！",
            "warning": "そろそろ振り向く！",
            "watch": "見てる！止まって！"
          },
          "countdown": {
            "placeholder": "残り --.- 秒",
            "safe": "安全残り {seconds} 秒",
            "warning": "あと {seconds} 秒で振り向く！",
            "watch": "監視中… {seconds} 秒我慢"
          }
        },
        "movement": {
          "stopped": "停止中",
          "moving": "移動中"
        },
        "progress": {
          "title": "進行状況",
          "detail": "距離 {distance}% / 経過 {time} 秒",
          "bestPlaceholder": "ベストタイム: --.- 秒",
          "best": "ベストタイム: {time} 秒"
        },
        "status": {
          "initial": "スタートで開始",
          "running": "だるまさんがころんだ！安全な時だけ前進しよう",
          "pause": "一時停止中",
          "success": "クリア！50EXP獲得！所要 {time} 秒",
          "fail": "動いているのを見られた…失敗"
        }
      },
      "populite": {
        "title": "ポピュラス風 ミニ神様モード",
        "hud": {
          "faithStatus": "信仰状態",
          "timeRemaining": "残り時間",
          "mana": "マナ",
          "population": "人口",
          "disasterTimer": "災害タイマー",
          "nextDisaster": "次の災害",
          "bestRecord": "最速達成",
          "paused": "一時停止中",
          "manaValue": "{current} / {max}",
          "populationValue": "{current} / {target}",
          "disasterCountdown": "{value} 秒",
          "bestTimeValue": "{value}秒"
        },
        "controls": {
          "title": "操作と魔法",
          "instructions": "左ドラッグ: 整地（Shiftで掘削） / 右クリック: 祈りで信者を招く<br>スペース: 一時停止 / 数字キー1:守護 2:隆起 3:浄化雨"
        },
        "spells": {
          "barrier": "1) 守護バリア ({cost})",
          "uplift": "2) 隆起 ({cost})",
          "purify": "3) 浄化雨 ({cost})"
        },
        "status": {
          "manaShort": "マナが不足しています…",
          "prayerCooldown": "祈りはまだ冷却中です…",
          "noSettlements": "守るべき集落がありません",
          "victory": "人口目標を達成しました！",
          "defeatPopulation": "信者がいなくなってしまった…",
          "timeout": "時間切れです…",
          "paused": "一時停止中",
          "resumed": "再開"
        },
        "log": {
          "title": "出来事ログ",
          "prayerStarted": "祈りの力で信者が集まり始めた！",
          "tsunami": "🌊 津波が低地を襲います！",
          "volcano": "🌋 火山が噴火！ ({x},{y})",
          "newSettlement": "新しい集落が誕生 ({x},{y}) 高さ{level}",
          "populationMilestone": "人口が{population}人を突破！",
          "settlementDestroyed": "集落({x},{y})が壊滅してしまった…",
          "settlementDamaged": "集落({x},{y})が{lost}人の被害",
          "barrierCast": "守護バリアが集落({x},{y})を包み込む",
          "upliftCast": "大地が隆起し安全な高地が生まれた ({x},{y})",
          "purifyCast": "浄化の雨で災害の兆候が洗い流された",
          "inventoryFull": "インベントリに空きがなく聖なる欠片は見送られた…",
          "bestRecord": "最速記録を更新！ {time}秒",
          "result": "▶ 結果: {message}",
          "difficulty": "難易度: {difficulty}",
          "goal": "人口目標 {target} / 制限時間 {duration}秒"
        },
        "popup": {
          "buildingLevel": "建築Lv{level}",
          "populationGain": "+{value}信者",
          "barrierBlocked": "バリアが防いだ！"
        }
      },
      "checkers": {
        "hud": {
          "turn": {
            "playerPrompt": "あなたの番 - 駒を選択して移動",
            "aiThinking": "AI思考中..."
          },
          "expHint": "移動: +1EXP / 捕獲: +6EXP×駒 / 王冠昇格: +12EXP"
        },
        "overlay": {
          "defaultTitle": "ゲーム終了",
          "restartHint": "Rキーでリスタート",
          "result": {
            "win": "勝利！",
            "loss": "敗北..."
          }
        }
      },
      "pacman": {
        "hud": {
          "livesLabel": "残機",
          "pelletsLabel": "ドット",
          "statusTemplate": "{livesLabel}:{lives}  {pelletsLabel}:{pelletsCollected}/{pelletsTotal}"
        },
        "overlay": {
          "title": "ゲーム終了",
          "restartHint": "Rで再開/再起動"
        }
      },
      "invaders": {
        "hud": {
          "livesLabel": "残機",
          "killsLabel": "撃破",
          "waveLabel": "ウェーブ",
          "statusLine": "{livesLabel}:{lives}  {killsLabel}:{kills}  {waveLabel}:{wave}"
        },
        "overlay": {
          "title": "Game Over",
          "restartHint": "Rで再開/再起動"
        }
      },
      "forced_scroll_jump": {
        "hud": {
          "score": "スコア: {score}",
          "coinStreak": "CX連続: {streak}",
          "lives": "ライフ: {lives}"
        },
        "overlay": {
          "title": "ゲームオーバー",
          "rank": "ランク: {rank}",
          "summary": "スコア {score} / ボーナスXP +{bonus}",
          "restart": "スペースかクリックでリスタート"
        },
        "rank": {
          "extreme": "極めて",
          "superb": "非常に",
          "great": "すごい",
          "notable": "かなり",
          "fair": "わりと",
          "steady": "そこそこ",
          "modest": "まあまあ"
        }
      },
      "pseudo3d_race": {
        "scenery": {
          "billboard": "ブースト"
        },
        "hud": {
          "speed": "速度 {speed}{unit}",
          "distance": "距離 {distance}{unit}",
          "time": "残り {time}{unit}",
          "crash": "クラッシュ {crashes}/{limit}",
          "paused": "一時停止",
          "nitro": "ニトロ",
          "progress": "コース進捗",
          "upcomingTurn": {
            "right": "右カーブ",
            "left": "左カーブ"
          }
        },
        "help": {
          "controls": "操作: ←/→ または A/D でステアリング ・ ↑/W でアクセル ・ ↓/S でブレーキ ・ スペースでニトロ",
          "objective": "目的: 制限時間内に距離を稼ぎ、交通を安全に追い越そう",
          "shortcuts": "H でヘルプ切替 / P で一時停止"
        },
        "end": {
          "title": "ゲームオーバー",
          "restart": "Rでリスタート",
          "pause": "Pで一時停止/再開"
        },
        "countdown": {
          "go": "スタート!"
        },
        "popup": {
          "nitro": "ニトロ!"
        },
        "controls": {
          "nitro": "ニトロ",
          "pause": "一時停止"
        }
      },
      "othello": {
        "hud": {
          "status": {
            "ended": "ゲーム終了",
            "playerTurn": "あなたの番（クリックで配置）",
            "aiTurn": "AIの番"
          }
        },
        "overlay": {
          "title": "ゲーム終了",
          "restartHint": "Rで再開 / 再起動できます",
          "result": {
            "win": "あなたの勝ち！",
            "loss": "あなたの負け…",
            "draw": "引き分け"
          }
        },
        "popup": {
          "movePreview": "{flips}枚 / 予想+{xp}EXP"
        }
      },
      "pomodoro": {
        "title": "ポモドーロタイマー",
        "subtitle": "集中と休憩をリズム良く切り替え、完了ごとにEXPを獲得します。",
        "phase": {
          "focus": "集中",
          "shortBreak": "小休憩",
          "longBreak": "長休憩",
          "badge": "{phase}モード"
        },
        "buttons": {
          "start": "▶ 開始",
          "pause": "⏸ 一時停止",
          "skip": "⏭ 次へ",
          "reset": "↺ リセット",
          "save": "設定を保存"
        },
        "stats": {
          "title": "進捗サマリー",
          "focusLabel": "集中セッション",
          "breakLabel": "休憩回数",
          "streakLabel": "連続集中",
          "xpLabel": "累計EXP",
          "focusValue": "{count} 回",
          "breakValue": "{count} 回",
          "streakValue": "{count} 回",
          "xpValue": "{xp} XP",
          "todaySummary": "今日: 集中 {focus} 回 / 休憩 {breaks} 回 / 獲得EXP +{xp}"
        },
        "history": {
          "title": "直近の履歴",
          "empty": "記録はまだありません。",
          "entry": "集中 {focus} / 休憩 {breaks} / +{xp}XP"
        },
        "settings": {
          "title": "タイマー設定",
          "focusLabel": "集中 (分)",
          "shortBreakLabel": "小休憩 (分)",
          "longBreakLabel": "長休憩 (分)",
          "cyclesLabel": "長休憩までの集中回数",
          "autoBreak": "集中完了後に自動で休憩を開始",
          "autoFocus": "休憩完了後に自動で集中を開始",
          "savedBadge": "設定を保存しました"
        },
        "cycle": {
          "longBreakSoon": "この集中で長休憩に入ります",
          "untilLong": "長休憩まであと {count} セッション",
          "longBreakActive": "長休憩中：しっかりリフレッシュしましょう"
        },
        "upcoming": {
          "generic": "次は {label} ({minutes}分)",
          "focus": "次は 集中 ({minutes}分)"
        },
        "badges": {
          "focusComplete": "集中セッション達成",
          "shortBreakComplete": "ショートブレイク完了",
          "longBreakComplete": "ロングブレイク完了",
          "gainTemplate": "{label} +{xp}XP"
        }
      },
      "falling_shooter": {
        "overlay": {
          "title": "ゲームオーバー",
          "restartHint": "Rで再開/再起動"
        }
      },
      "connect6": {
        "hud": {
          "status": {
            "ended": "ゲーム終了",
            "playerTurn": "あなたの番",
            "aiTurn": "AIの番"
          }
        },
        "overlay": {
          "title": "ゲーム終了",
          "restartHint": "Rキーでリセットできます",
          "result": {
            "win": "あなたの勝ち！",
            "draw": "引き分け",
            "loss": "AIの勝ち…"
          }
        },
        "popups": {
          "defense": "防手",
          "checkmate": "詰み手",
          "winning": "勝ち手",
          "pressured": "追われ手",
          "chasing": "追い手"
        }
      },
      "gomoku": {
        "hud": {
          "status": {
            "ended": "ゲーム終了",
            "playerTurn": "あなたの番",
            "aiTurn": "AIの番"
          }
        },
        "overlay": {
          "title": "ゲーム終了",
          "restartHint": "Rキーでリセットできます",
          "result": {
            "win": "あなたの勝ち！",
            "draw": "引き分け",
            "loss": "AIの勝ち…"
          }
        },
        "popups": {
          "defense": "防手",
          "checkmate": "詰み手",
          "winning": "勝ち手",
          "pressured": "追われ手",
          "chasing": "追い手"
        }
      },
      "renju": {
        "hud": {
          "status": {
            "ended": "ゲーム終了",
            "playerTurn": "あなたの番",
            "aiTurn": "AIの番"
          }
        },
        "overlay": {
          "title": "ゲーム終了",
          "restartHint": "Rキーでリセットできます",
          "result": {
            "win": "あなたの勝ち！",
            "draw": "引き分け",
            "loss": "AIの勝ち…"
          }
        },
        "popups": {
          "defense": "防手",
          "checkmate": "詰み手",
          "winning": "勝ち手",
          "pressured": "追われ手",
          "chasing": "追い手"
        },
        "renju": {
          "foulLabel": {
            "overline": "禁手: 長連",
            "doubleFour": "禁手: 四々",
            "doubleThree": "禁手: 三々"
          },
          "genericFoul": "禁手"
        }
      },
      "connect4": {
        "hud": {
          "status": {
            "ended": "ゲーム終了",
            "playerTurn": "あなたの番",
            "aiTurn": "AIの番"
          }
        },
        "overlay": {
          "title": "ゲーム終了",
          "restartHint": "Rキーでリセットできます",
          "result": {
            "win": "あなたの勝ち！",
            "draw": "引き分け",
            "loss": "AIの勝ち…"
          }
        },
        "popups": {
          "defense": "防手",
          "checkmate": "詰み手",
          "winning": "勝ち手",
          "pressured": "追われ手",
          "chasing": "追い手"
        }
      },
      "nine_mens_morris": {
        "header": {
          "title": "ナイン・メンズ・モリス — あなたが先手"
        },
        "tips": {
          "controls": "操作: 盤上をクリックして配置 / 駒→移動先をクリックして移動。<br>ミル成立時は赤枠の相手駒を選択して除去。"
        },
        "hud": {
          "info": {
            "player": "プレイヤー駒: <strong>{piecesFormatted}</strong> / 捕獲: {capturedFormatted}",
            "ai": "AI駒: <strong>{piecesFormatted}</strong> / 捕獲: {capturedFormatted}"
          },
          "phaseInfo": "あなた: {playerPhase}（残り配置 {playerRemaining}）<br>AI: {aiPhase}（残り配置 {aiRemaining}）"
        },
        "phase": {
          "place": "配置フェーズ",
          "slide": "移動フェーズ",
          "fly": "フライトモード"
        },
        "status": {
          "removalPrompt": "ミル成立！除去する相手駒を選んでください。",
          "aiThinking": "AIが思考中…",
          "playerTurn": "あなたの番です。",
          "aiTurn": "AIの番です…"
        },
        "result": {
          "win": "あなたの勝ち！AIの駒を封じました。",
          "lose": "敗北… AIに駒を封じられました。"
        }
      },
      "dungeon_td": {
        "controls": {
          "startWave": "ウェーブ開始"
        },
        "hud": {
          "hint": "床タイルをクリックで砲塔を設置 (Shift+クリックで砲塔強化)。敵がコアに到達すると耐久が減ります。",
          "wave": "Wave {currentFormatted}{suffix}",
          "coins": "資金 {formatted} G",
          "baseHp": "コア耐久 {valueFormatted}/{maxFormatted}",
          "exp": "獲得EXP {formatted}"
        },
        "status": {
          "tileUnavailable": "そのタイルには砲塔を設置できません",
          "insufficientFunds": "資金が不足しています",
          "towerPlaced": "砲塔を設置しました",
          "upgradeInsufficientFunds": "強化に必要な資金が不足しています ({costFormatted} G)",
          "towerUpgraded": "砲塔をLv{levelFormatted}に強化しました",
          "noPath": "経路を構成できませんでした",
          "waveStarted": "Wave {waveFormatted} が始まりました！",
          "allWavesCleared": "全ウェーブ防衛成功！ボーナス {bonusCoinsFormatted}G / EXP +{bonusXpFormatted}",
          "waveCleared": "Wave {waveFormatted} を防衛！ 資金+{bonusCoinsFormatted} / EXP +{bonusXpFormatted}",
          "coreDestroyed": "コアが破壊されました…ウェーブ失敗",
          "fullClearBonus": "完全防衛達成！追加ボーナスEXP +{bonusFormatted}",
          "coreBreached": "敵がコアに侵入しました…",
          "coreDamaged": "敵がコアに到達！耐久が減少",
          "apiUnavailable": "ダンジョンAPIを利用できません",
          "generatingStage": "ステージ生成中…",
          "pathFailedRetry": "経路の確保に失敗しました。再読み込みしてください。",
          "ready": "砲塔を配置してウェーブ開始を押してください",
          "stageGenerationFailed": "ステージ生成に失敗しました",
          "upgradeHint": "Shift+クリックで砲塔を強化できます"
        }
      },
      "physics_sandbox": {
        "toolbar": {
          "tools": {
            "select": { "label": "選択", "title": "図形やエミッタを選択・ドラッグ" },
            "godFinger": { "label": "神の指", "title": "シミュレーション中の物体を直接つかんで動かす" },
            "addCircle": { "label": "円", "title": "円形の剛体を追加" },
            "addBox": { "label": "箱", "title": "箱型の剛体を追加" },
            "addCloth": { "label": "布", "title": "布のソフトボディを追加" },
            "addWall": { "label": "絶対壁", "title": "壊れない壁を描画" },
            "addFire": { "label": "火", "title": "炎エミッタを追加" },
            "addWater": { "label": "水", "title": "水エミッタを追加" },
            "addIce": { "label": "氷", "title": "氷結エミッタを追加" },
            "addWind": { "label": "風", "title": "風のエミッタを追加" },
            "addVine": { "label": "ツタ", "title": "ツタエミッタを追加" },
            "addLightning": { "label": "雷", "title": "雷エミッタを追加" },
            "addAcid": { "label": "酸", "title": "酸性エミッタを追加" },
            "addCircuit": { "label": "回路", "title": "回路ノードを追加" }
          },
          "actions": {
            "start": { "label": "開始", "title": "シミュレーションを開始/再開" },
            "pause": { "label": "停止", "title": "シミュレーションを一時停止" },
            "reset": { "label": "リセット", "title": "初期状態へ戻す" },
            "delete": { "label": "削除", "title": "選択中の図形/エミッタを削除" },
            "save": { "label": "保存", "title": "現在の配置を保存" },
            "load": { "label": "読み込み", "title": "保存した配置を読み込む" }
          }
        },
        "hud": {
          "summary": "図形 {bodyCount} / エミッタ {emitterCount} / 布 {clothCount} / 粒子 {particleCount}",
          "powerGravityExp": "通電 {poweredCount} / 重力 {gravity} / EXP {exp}",
          "solver": "ソルバ {iterations}回 × サブステップ {substeps}",
          "temperature": "平均温度 {average}°C / 周囲 {ambient}°C / 最高 {max}°C",
          "phases": "状態 固体{solid} / 液体{liquid} / 気体{gas}",
          "wind": "風ガスト {gusts} / 風エミッタ {emitters}"
        },
        "inspector": {
          "title": "設定",
          "world": {
            "gravityY": "重力Y ({value})",
            "airDrag": "空気抵抗 ({value})",
            "iterations": "反復回数 ({value})",
            "substeps": "サブステップ ({value})",
            "ambientTemperature": "周囲温度 ({value}°C)",
            "boundary": {
              "label": "外周モード",
              "options": {
                "wall": "壁 (外周で反射)",
                "void": "奈落 (外に落下)"
              },
              "voidHint": "奈落: 図形が外に出ると一定距離で消滅します。"
            }
          },
          "noSelection": "上部ツールから図形を追加して選択すると詳細設定が表示されます。",
          "savedLayouts": {
            "title": "保存データ",
            "load": "読み込み",
            "delete": "削除"
          },
          "common": {
            "unknown": "不明"
          },
          "body": {
            "title": "図形プロパティ",
            "state": "状態: {state}",
            "damage": "損耗度: {percent}%",
            "integrity": "健全度: {percent}%",
            "stress": "応力指標: {value} kPa相当",
            "strain": "ひずみ: {percent}%",
            "heatFlux": "熱流指標: {value}",
            "fracture": "破断閾値: {threshold} / 破片生成 {fragments}回",
            "reactionCooldown": "化学反応クールダウン: {seconds}s",
            "materialPreset": "素材プリセット",
            "mass": "質量 (推定 {value})",
            "angleInfo": "角度 {angle}° / 角速度 {angular}rad/s",
            "static": "固定する",
            "restitution": "反発 ({value})",
            "friction": "摩擦 ({value})",
            "wallNote": "絶対壁は素材と物性が固定されています。サイズと位置のみ変更できます。",
            "radius": "半径 ({value})",
            "width": "幅 ({value})",
            "height": "高さ ({value})",
            "color": "色",
            "chemical": {
              "formula": "化学式: {formula}",
              "components": "構成元素: {list}",
              "molarMass": "モル質量: {mass} g/mol",
              "hazards": "性質: {list}"
            },
            "phase": {
              "solid": "固体",
              "liquid": "液体",
              "gas": "気体"
            }
          },
          "customMaterial": {
            "alertAddElement": "元素を1種類以上追加してください。",
            "title": "化学式カスタマイザ",
            "components": "構成: {list}",
            "componentsEmpty": "構成: 追加された元素はありません",
            "formulaPreview": "化学式プレビュー: {formula}",
            "molarMass": "推定モル質量: {mass} g/mol",
            "suggestedDensity": "元素平均密度: {average} (現在 {current})",
            "removeComponent": "削除",
            "addElement": "元素追加",
            "nameLabel": "素材名",
            "namePlaceholder": "カスタム素材名",
            "density": "密度 ({value})",
            "baseTemperature": "基準温度 ({value}°C)",
            "meltingPoint": "融点 ({value}°C)",
            "boilingPoint": "沸点 ({value}°C)",
            "ignitionPoint": "発火点 ({value}°C)",
            "hazardTitle": "性質タグ",
            "appliedHazards": "適用タグ: {list}",
            "apply": "カスタム素材を適用",
            "reset": "構成クリア",
            "hazards": {
              "flammable": "可燃性",
              "conductive": "導電性",
              "elastic": "弾性体",
              "insulator": "絶縁体",
              "aqueous": "水溶性",
              "superheated": "超高温",
              "ionized": "電離",
              "alkali-metal": "アルカリ金属",
              "water-reactive": "水と激しく反応",
              "acidic": "酸性",
              "corrosive": "腐食性",
              "toxic": "有毒",
              "inert": "不活性",
              "oxidizer": "助燃性",
              "explosive": "爆発性",
              "cryogenic": "超低温",
              "refractory": "耐火性",
              "catalytic": "触媒性"
            }
          },
          "emitter": {
            "title": "エミッタ設定",
            "type": "タイプ: {kind}",
            "rate": "レート ({value}/s)",
            "power": "強さ ({value})",
            "direction": "向き ({value}°)",
            "circuit": {
              "alwaysOn": "常時通電させる",
              "connections": "接続ノード",
              "disconnect": "切断",
              "cancel": "接続キャンセル",
              "connect": "接続モード"
            }
          },
          "cloth": {
            "title": "布プロパティ",
            "integrity": "健全度 {percent}%",
            "links": "節点 {cols}×{rows} / 結合 {intact}/{total}",
            "strain": "平均伸長 {average}% / 最大 {max}%",
            "fatigue": "疲労蓄積 {value}",
            "structural": "張力 ({value})",
            "shear": "せん断 ({value})",
            "bend": "しなり ({value})",
            "damping": "減衰 ({value})",
            "tearFactor": "破断倍率 ({value})",
            "windInfluence": "風反応 ({value})",
            "color": "色",
            "pinTop": "上辺を固定",
            "unpinAll": "固定解除"
          }
        }
      },
      "imperial_realm": {
        "ui": {
          "logTitle": "作戦ログ",
          "waveTitle": "ウェーブ情報",
          "intelTitle": "戦況インテリジェンス",
          "selectionTitle": "選択情報",
          "populationLabel": "人口"
        },
        "resources": {
          "food": "食料",
          "wood": "木材",
          "gold": "金",
          "stone": "石",
          "costEntry": "{resource}{amount}",
          "costSeparator": " / "
        },
        "hud": {
          "nextWave": "次のウェーブ",
          "ready": "準備完了",
          "countdown": "{seconds}秒",
          "defending": "防衛中！",
          "waveStatus": "ウェーブ {current} / {total}",
          "waveInfo": "現在の波: {wave}/{total}\n敵TC耐久: {hp} / {max}",
          "commanderGoal": "司令官討伐",
          "finalStand": "終局戦",
          "ageHeading": "帝国段階: {age}",
          "ageProgress": "進化中… 残り{remaining}秒",
          "ageReady": "進化可能",
          "ageNext": "次: {age} / {requirement}",
          "ageMax": "帝国期を維持しています。",
          "momentumTitle": "帝国士気",
          "momentumDetail": "攻撃補正 +{bonus}%"
        },
        "intel": {
          "summary": "村人: {villagers}\n軍事: {army}\n建物: {structures}"
        },
        "selection": {
          "empty": "何も選択されていません。",
          "unitEntry": "{name} HP {current}/{max}",
          "structureEntry": "{name} HP {current}/{max}{status}",
          "underConstruction": "（建設中）",
          "separator": "---"
        },
        "actions": {
          "build": {
            "house": {
              "label": "建設: 家",
              "description": "+5人口、建設時間短"
            },
            "barracks": {
              "label": "建設: 兵舎",
              "description": "民兵の訓練"
            },
            "archery": {
              "label": "建設: 弓兵小屋",
              "description": "弓兵の訓練"
            },
            "tower": {
              "label": "建設: 見張り塔",
              "description": "自動射撃タワー"
            },
            "blacksmith": {
              "label": "建設: 鍛冶場",
              "description": "武具を鍛え士気を高める"
            },
            "stable": {
              "label": "建設: 厩舎",
              "description": "騎士の訓練施設"
            },
            "siegeWorkshop": {
              "label": "建設: 攻城工房",
              "description": "攻城兵器を製造"
            }
          },
          "ageUp": {
            "label": "時代進化: {age}",
            "time": "進化時間: {time}秒"
          },
          "requireAge": "必要時代: {age}",
          "badge": {
            "ageUp": "時代"
          },
          "train": {
            "button": "訓練: {unit}",
            "details": "{cost} / {time}秒"
          }
        },
        "logs": {
          "missionStart": "作戦開始。タウンセンターと村人3名が配置されています。",
          "insufficientResources": "資源が不足しています。",
          "placementPrompt": "{label} の建設位置を指定してください。",
          "gatherOrder": "村人に{resource}採集を指示しました。",
          "attackOrder": "攻撃命令を実行。",
          "populationCap": "人口上限です。家を建てましょう。",
          "trainingStarted": "{unit} の訓練を開始しました。",
          "buildingStarted": "{structure} を建設開始しました。",
          "unitComplete": "{unit} が完成しました。",
          "structureComplete": "{structure} が完成しました。",
          "enemyDefeated": "敵を撃破しました。",
          "resourceDepleted": "{resource}の資源が枯渇しました。",
          "commanderArrived": "敵将軍が戦場に現れました！",
          "waveIncoming": "敵ウェーブ{wave}が接近中！",
          "waveCleared": "ウェーブ{wave}を撃退！補給物資を受領しました。",
          "requireAge": "{age} に到達すると建設可能です。",
          "ageResearchInProgress": "既に時代進化を研究中です。",
          "ageResearchStarted": "{age} への進化を開始しました。",
          "ageResearchCancelled": "タウンセンター喪失により時代進化が中断されました。",
          "ageAdvanced": "{age} に進化しました！",
          "victory": "勝利！",
          "defeat": "敗北…"
        },
        "gameOver": {
          "message": {
            "ownTownCenterDestroyed": "タウンセンターが破壊された。",
            "enemyTownCenterDestroyed": "敵のタウンセンターを破壊した。",
            "allVillagersLost": "村人が全滅した。"
          },
          "overlay": {
            "victory": "勝利",
            "defeat": "敗北"
          }
        },
        "units": {
          "villager": "村人",
          "militia": "民兵",
          "archer": "弓兵",
          "spearman": "槍兵",
          "crossbowman": "クロスボウ兵",
          "raider": "略奪兵",
          "knight": "騎士",
          "horseArcher": "騎馬弓兵",
          "commander": "敵将軍",
          "ram": "破城槌"
        },
        "structures": {
          "townCenter": "タウンセンター",
          "house": "家",
          "barracks": "兵舎",
          "archery": "弓兵小屋",
          "tower": "見張り塔",
          "blacksmith": "鍛冶場",
          "stable": "厩舎",
          "siegeWorkshop": "攻城工房"
        },
        "age": {
          "labels": {
            "frontier": "開拓期",
            "feudal": "封建期",
            "castle": "城塞期",
            "imperial": "帝国期"
          },
          "summaries": {
            "frontier": "村落の礎を築き、生存を優先する段階。",
            "feudal": "歩兵の再編と防衛線の強化が可能になる。",
            "castle": "重装兵と騎兵の整備で攻勢に転じられる。",
            "imperial": "最先端の軍制で決定的な優位を築く。"
          }
        }
      },
      "tic_tac_toe": {
        "hud": {
          "status": {
            "ended": "ゲーム終了",
            "playerTurn": "あなたの番",
            "aiTurn": "AIの番"
          }
        },
        "overlay": {
          "title": "ゲーム終了",
          "restartHint": "Rキーでリセットできます",
          "result": {
            "win": "あなたの勝ち！",
            "draw": "引き分け",
            "loss": "AIの勝ち…"
          }
        },
        "popups": {
          "defense": "防手",
          "checkmate": "詰み手",
          "winning": "勝ち手",
          "pressured": "追われ手",
          "chasing": "追い手"
        }
      },
      "riichi_mahjong": {
        "title": "リーチ麻雀ライト",
        "subtitle": "シンプルな東風戦（1局）を3人のAIと対局。リーチ/ツモ/ロン対応。",
        "info": {
          "roundLabel": "局情報",
          "dealerLabel": "親",
          "doraLabel": "ドラ",
          "remainingLabel": "山残り",
          "riichiSticksLabel": "リーチ棒",
          "roundValue": "{seat}{round}局",
          "none": "なし",
          "doraLine": "ドラ: {tiles}",
          "potLine": "供託:{sticks}点 / 残り:{tiles}"
        },
        "buttons": {
          "tsumo": "ツモ",
          "ron": "ロン",
          "riichi": "リーチ",
          "cancel": "キャンセル"
        },
        "players": {
          "youWithSeat": "あなた ({seat})",
          "aiWithSeat": "AI{seat}"
        },
        "seats": {
          "E": "東",
          "S": "南",
          "W": "西",
          "N": "北"
        },
        "tiles": {
          "suits": {
            "m": "{rank}萬",
            "p": "{rank}筒",
            "s": "{rank}索"
          },
          "honors": {
            "E": "東",
            "S": "南",
            "W": "西",
            "N": "北",
            "P": "白",
            "F": "發",
            "C": "中"
          }
        },
        "hud": {
          "scoreValue": "{value}点",
          "tags": {
            "dealer": "親",
            "riichi": "立直"
          },
          "waits": "待ち: {tiles}"
        },
        "yaku": {
          "chiitoitsu": "七対子",
          "riichi": "立直",
          "menzenTsumo": "門前清自摸和",
          "tanyao": "断么九",
          "dora": "ドラ",
          "yakuhai": "役牌",
          "pinfu": "平和"
        },
        "fuReasons": {
          "closedRon": "門前ロン+10",
          "selfDraw": "ツモ+2",
          "seatWindPair": "自風雀頭+2",
          "roundWindPair": "場風雀頭+2",
          "dragonPair": "三元牌雀頭+2",
          "terminalKan": "槓子扱い端牌刻子+8",
          "middleTriplet": "中張刻子+4",
          "honorTriplet": "字牌刻子+8"
        },
        "result": {
          "tsumoDealer": "ツモ {value}点オール",
          "tsumoNonDealer": "ツモ 親{dealer} / 子{other}",
          "ron": "ロン {value}点"
        },
        "log": {
          "roundStart": "--- {seat}{round}局開始 親: {dealer} ---",
          "doraIndicator": "ドラ表示牌: {indicator} → ドラ {dora}",
          "draw": "自摸: {tile}",
          "riichiInsufficient": "持ち点不足でリーチ不可",
          "riichiDeclaration": "リーチ宣言！場に1000点棒を供託。",
          "discardPlayer": "捨牌: {tile}",
          "ronWin": "{player} が {tile} でロン！",
          "handWin": "{player} の和了！ {han}翻 {fu}符 {description}",
          "yaku": "役: {list}",
          "riichiBonus": "リーチ棒 {sticks}本を獲得 (+{bonus})",
          "drawRound": "流局 ({reason})",
          "tenpaiList": "テンパイ者: {list}",
          "allNoten": "全員ノーテン",
          "tenpaiSplit": "テンパイ料を分配",
          "finalResult": "最終結果: {list}",
          "tsumoWin": "{player} が自摸上がり！",
          "aiRiichi": "{player} がリーチ！",
          "discardOther": "{player} の捨牌: {tile}",
          "drawReason": {
            "exhaustive": "荒牌流局"
          }
        },
        "rewards": {
          "riichiDeclaration": "リーチ宣言",
          "ronWin": "ロン和了",
          "tsumoWin": "自摸和了",
          "matchComplete": "対局終了"
        }
      }
    },
    "miniexp": {
      "games": {
        "tosochu": {
          "ui": {
            "timer": "残り {seconds}s",
            "exp": "蓄積EXP {exp}",
            "missionNotReady": "ミッション: まだ発動していません",
            "missionActive": "ミッション: {label}{optionalSuffix}：残り{seconds}s (地点: {coords})",
            "missionComplete": "ミッション完了：成功{success}/{total}",
            "missionSuccess": "{label}：成功！",
            "missionFailed": "{label}：失敗…",
            "surrender": "自首する",
            "surrenderCountdown": "自首中...{seconds}s"
          },
          "status": {
            "hunterAdded": "ハンターが追加投入された！",
            "hunterRetreat": "ミッション成功！ハンター1体が撤退",
            "missionActivated": "ミッション発動：{label}",
            "escapeSuccess": "逃走成功！+{total} EXP (内訳 {base}+{bonus})",
            "surrenderSuccess": "自首。蓄積{exp}EXPを獲得",
            "caught": "捕まってしまった…獲得EXPなし",
            "dungeonUnavailable": "ダンジョンAPI利用不可",
            "stageGenerationFailed": "ステージ生成に失敗しました",
            "runStart": "逃走開始！",
            "runPaused": "一時停止中",
            "standby": "逃走中スタンバイ",
            "surrenderZoneHint": "自首ゾーンに入ってからボタンを押してください",
            "surrenderAttempt": "自首を試みています…{duration}s耐え抜け！",
            "surrenderCancelled": "自首を中断しました",
            "beaconSuccess": "ビーコン成功！電波妨害を強化",
            "beaconFail": "ビーコン失敗…ハンターが警戒強化",
            "dataSuccess": "極秘情報を確保！報酬が増加",
            "dataFail": "警報が鳴った！高速ハンターが出現",
            "boxSuccess": "解除成功！ハンターボックスの発動が遅延",
            "boxFail": "解除失敗…ハンターが追加投入",
            "vaultSuccess": "大金獲得！しかし狙われやすくなった",
            "vaultFail": "金庫防衛が発動…ハンターが二体解放"
          },
          "missions": {
            "optionalSuffix": "（任意）",
            "beacon": { "label": "ビーコンに接触せよ" },
            "data": { "label": "情報端末をハック" },
            "box": { "label": "ハンターボックスを解除" },
            "vault": { "label": "ハイリスク金庫を解錠" }
          }
        }
      }
    },
    "tools": {
      "sidebar": {
        "ariaLabel": "ツール一覧",
        "modMaker": {
          "label": "ダンジョンタイプMod作成",
          "hint": "構造や生成アルゴリズムを組み立てて `registerDungeonAddon` ファイルを出力します。"
        },
        "sandbox": {
          "label": "サンドボックスダンジョン",
          "hint": "自由なマップと敵配置でテスト用ダンジョンを組み立てられます（経験値は獲得できません）。"
        },
        "blockdata": {
          "label": "BlockData編集",
          "hint": "BlockDim向けのブロック定義をGUIで確認・編集し、JSONをエクスポートできます。"
        },
        "imageViewer": {
          "label": "画像ビューア",
          "hint": "スクリーンショットなどを拡大・回転・遠近表示しながらメタ情報を確認できます。"
        },
        "stateManager": {
          "label": "状態管理",
          "hint": "ゲームとツールの全データをまとめてエクスポート／インポートします。",
          "summary": {
            "default": "エクスポート／インポートの概要がここに表示されます。",
            "exportedAt": "エクスポート日時: {value}",
            "player": "プレイヤー: Lv {level} / HP {hp}",
            "dungeon": "現在階層: {floor}F / 難易度: {difficulty}",
            "miniExp": "MiniExp: 選択 {selected} / 記録 {records}件",
            "blockDim": "BlockDim: 履歴 {history}件 / ブックマーク {bookmarks}件",
            "tools": "ツールデータ: {names}",
            "noTools": "ツールデータ: なし",
            "toolSeparator": "、"
          },
          "toolNames": {
            "modMaker": "Mod作成",
            "blockDataEditor": "BlockData編集",
            "sandbox": "サンドボックス",
            "imageViewer": "画像ビューア"
          },
          "status": {
            "exportPreparing": "全体エクスポートを準備しています…",
            "exportSuccess": "{fileName} として保存しました。",
            "exportError": "エクスポートに失敗しました。コンソールログを確認してください。",
            "importReading": "{fileName} を読み込み中です…",
            "importSuccess": "全体インポートが完了しました。",
            "importError": "インポートに失敗しました。ファイル形式を確認してください。"
          },
          "messages": {
            "importComplete": "状態データをインポートしました。"
          }
        }
      },
      "sandbox": {
        "controls": {
          "domain": {
            "noneAvailable": "配置可能なクリスタルなし"
          }
        }
      },
      "blockdataEditor": {
        "panelAriaLabel": "ブロックデータ編集ツール",
        "header": {
          "title": "BlockDataビジュアルエディタ",
          "description": "blockdata.json を読み込み、BlockDimブロックの一覧・編集・書き出しを行います。"
        },
        "sidebar": {
          "ariaLabel": "ブロック一覧",
          "groupLabel": "対象セット",
          "groupAriaLabel": "BlockDataセット",
          "groups": {
            "blocks1": "1stブロック",
            "blocks2": "2ndブロック",
            "blocks3": "3rdブロック"
          },
          "searchLabel": "検索",
          "searchPlaceholder": "名前 / キーで絞り込み",
          "create": "+ 新規ブロック",
          "listAriaLabel": "ブロック候補",
          "empty": {
            "noData": "データが読み込まれていません。",
            "noMatches": "該当するブロックがありません。",
            "noBlocks": "ブロックがありません。"
          },
          "untitled": "(無題)"
        },
        "main": {
          "versionLabel": "バージョン",
          "actions": {
            "reload": "再読込",
            "import": "インポート",
            "copy": "コピー",
            "download": "ダウンロード"
          },
          "formLegend": "ブロック詳細",
          "fields": {
            "key": { "label": "キー", "placeholder": "例: b3999" },
            "name": { "label": "名前", "placeholder": "ブロック名" },
            "level": { "label": "推奨Lv" },
            "size": { "label": "サイズ" },
            "depth": { "label": "深さ" },
            "chest": { "label": "宝箱" },
            "type": { "label": "タイプ", "placeholder": "例: maze" },
            "bossFloors": { "label": "ボス階層", "placeholder": "カンマ区切り (例: 5,10)" },
            "extras": { "label": "追加プロパティ(JSON)" }
          },
          "formActions": {
            "save": "選択を保存",
            "delete": "削除"
          },
          "preview": {
            "ariaLabel": "JSONプレビュー",
            "title": "blockdata.jsonプレビュー",
            "size": "{lines} 行 / {bytes} bytes"
          },
          "dirty": {
            "dirty": "未保存の変更があります。エクスポートまたはコピーを忘れずに。",
            "clean": "最新の状態です。"
          },
          "status": {
            "loading": "blockdata.json を読み込んでいます…",
            "loadSuccess": "blockdata.json を読み込みました。",
            "loadError": "{source} の読み込みに失敗しました。インポートから読み込んでください。",
            "noData": "データが読み込まれていません。",
            "creating": "新規ブロックを作成中です。必要な項目を入力してください。",
            "importSuccess": "{name} を読み込みました。",
            "importParseError": "JSONの読み込みに失敗しました。形式を確認してください。",
            "importReadError": "ファイルを読み込めませんでした。",
            "saved": "ブロックを保存しました。",
            "deleteNoSelection": "削除対象のブロックが選択されていません。",
            "deleted": "ブロックを削除しました。",
            "copyEmpty": "コピーする内容がありません。",
            "copied": "クリップボードにコピーしました。",
            "copyFailed": "コピーできませんでした。",
            "downloadEmpty": "ダウンロードする内容がありません。",
            "downloaded": "JSONファイルをダウンロードしました。"
          },
          "confirm": {
            "reload": "未エクスポートの変更が失われます。再読込しますか？",
            "delete": "選択したブロックを削除しますか？",
            "discard": "編集中の内容が破棄されます。続行しますか？"
          },
          "list": {
            "levelValue": "Lv {level}",
            "levelUnknown": "Lv -",
            "meta": "{key} · {level}"
          }
        },
        "errors": {
          "extrasObject": "追加プロパティはJSONオブジェクトで入力してください。",
          "missingKey": "キーを入力してください。",
          "missingName": "名前を入力してください。",
          "duplicateKey": "同じキーのブロックが既に存在します。",
          "invalidBossFloor": "ボス階層に数値ではない値があります: {value}"
        }
      },
      "modMaker": {
        "panelAriaLabel": "ダンジョンタイプMod作成ツール",
        "header": {
          "title": "ダンジョンタイプ追加Mod作成ツール",
          "description": "メタ情報、構造パターン、生成アルゴリズム、BlockDimブロック定義をまとめてアドオンJSとして出力します。"
        },
        "meta": {
          "title": "アドオン情報",
          "fields": {
            "id": {
              "label": "アドオンID",
              "placeholder": "例: custom_pack"
            },
            "name": {
              "label": "表示名",
              "placeholder": "例: Custom Dungeon Pack"
            },
            "version": {
              "label": "バージョン"
            },
            "author": {
              "label": "作者",
              "placeholder": "あなたの名前"
            },
            "description": {
              "label": "説明",
              "placeholder": "アドオン全体の説明"
            }
          }
        },
        "structures": {
          "title": "構造ライブラリ",
          "actions": {
            "add": "+ 構造を追加",
            "remove": "選択を削除"
          },
          "listAria": "構造一覧",
          "fields": {
            "id": {
              "label": "ID",
              "placeholder": "例: custom_room"
            },
            "name": {
              "label": "名前",
              "placeholder": "表示用の名前"
            },
            "anchorX": {
              "label": "アンカーX"
            },
            "anchorY": {
              "label": "アンカーY"
            },
            "tags": {
              "label": "タグ（カンマ区切り）",
              "placeholder": "例: rooms,geo"
            },
            "allowRotate": {
              "label": "回転を許可"
            },
            "allowMirror": {
              "label": "反転を許可"
            },
            "width": {
              "label": "幅"
            },
            "height": {
              "label": "高さ"
            },
            "preview": {
              "label": "パターンプレビュー"
            }
          },
          "grid": {
            "hint": "セルをクリックして「空白 → 床 → 壁」の順で切り替え",
            "fillEmpty": "全て空白",
            "fillFloor": "全て床",
            "fillWall": "全て壁",
            "ariaLabel": "構造パターン"
          },
          "defaultItem": "構造{index}"
        },
        "placeholders": {
          "structurePreview": "構造を追加するとここにプレビューが表示されます。",
          "fixedDisabled": "固定マップを有効にすると編集できます。",
          "fixedAddFloor": "階層を追加してください。"
        },
        "fixed": {
          "title": "固定マップ",
          "enable": {
            "label": "固定マップを利用"
          },
          "fields": {
            "floorCount": {
              "label": "フロア数"
            },
            "bossFloors": {
              "label": "ボス階層（カンマ区切り）",
              "placeholder": "例: 5,10"
            },
            "width": {
              "label": "幅"
            },
            "height": {
              "label": "高さ"
            }
          },
          "note": "アルゴリズムで <code>ctx.fixedMaps.applyCurrent()</code> を呼ぶと、その階層の固定マップが適用されます。",
          "floorListAria": "固定マップ階層",
          "actions": {
            "copyPrevious": "前の階層をコピー"
          },
          "grid": {
            "hint": "セルをクリックして「壁 → 床 → 空白」の順に切り替え",
            "fillWall": "全て壁",
            "fillFloor": "全て床",
            "fillVoid": "全て空白",
            "ariaLabel": "固定マップパターン"
          }
        },
        "generators": {
          "title": "生成アルゴリズム",
          "actions": {
            "add": "+ 生成タイプを追加",
            "remove": "選択を削除"
          },
          "listAria": "生成タイプ一覧",
          "fields": {
            "id": {
              "label": "ID",
              "placeholder": "例: custom-dungeon"
            },
            "name": {
              "label": "名前",
              "placeholder": "ダンジョン名"
            },
            "description": {
              "label": "説明",
              "placeholder": "一覧に表示する説明"
            },
            "normalMix": {
              "label": "Normal混合参加率"
            },
            "blockMix": {
              "label": "Block次元混合参加率"
            },
            "tags": {
              "label": "タグ（カンマ区切り）",
              "placeholder": "例: rooms,organic"
            },
            "dark": {
              "label": "暗い（視界半径5）"
            },
            "poison": {
              "label": "毒霧（通常床が毒床扱い）"
            },
            "code": {
              "label": "アルゴリズムコード"
            }
          },
          "template": {
            "label": "テンプレート",
            "options": {
              "blank": "空のテンプレート",
              "rooms": "部屋と通路サンプル",
              "structure": "構造配置サンプル",
              "fixed": "固定マップ適用テンプレート"
            },
            "apply": "選択テンプレートを適用"
          },
          "defaultItem": "生成タイプ{index}"
        },
        "blocks": {
          "title": "BlockDimブロック定義",
          "actions": {
            "addFirst": "+ 1st",
            "addSecond": "+ 2nd",
            "addThird": "+ 3rd"
          },
          "tiers": {
            "firstHeading": "1st Blocks",
            "secondHeading": "2nd Blocks",
            "thirdHeading": "3rd Blocks",
            "firstAria": "1st Blocks",
            "secondAria": "2nd Blocks",
            "thirdAria": "3rd Blocks"
          },
          "empty": "未定義です。右上の追加ボタンで作成できます。",
          "remove": "削除",
          "fields": {
            "key": {
              "label": "キー"
            },
            "name": {
              "label": "名前"
            },
            "level": {
              "label": "レベル補正",
              "placeholder": "例: +0"
            },
            "size": {
              "label": "サイズ補正",
              "placeholder": "例: +1"
            },
            "depth": {
              "label": "深さ補正",
              "placeholder": "例: +1"
            },
            "chest": {
              "label": "宝箱タイプ",
              "placeholder": "normal/more/less"
            },
            "type": {
              "label": "タイプID",
              "placeholder": "例: custom-dungeon"
            },
            "bossFloors": {
              "label": "ボス階層",
              "placeholder": "例: 5,10,15"
            },
            "description": {
              "label": "説明・メモ"
            }
          },
          "defaultTitle": "{tier} #{index}"
        },
        "output": {
          "title": "出力"
        },
        "actions": {
          "copy": "クリップボードにコピー",
          "download": ".jsファイルとしてダウンロード"
        },
        "status": {
          "errorHeading": "⚠️ {count} 件の確認事項があります",
          "ready": "✅ 出力できます"
        },
        "feedback": {
          "copySuccess": "コピーしました",
          "copyFailed": "コピーできませんでした"
        },
        "templates": {
          "todoComment": "  // TODO: ctx.map などを編集してダンジョンを生成してください。"
        },
        "errors": {
          "missingAddonId": "アドオンIDを入力してください。",
          "invalidAddonId": "アドオンIDは英数字・ハイフン・アンダースコアのみ使用できます。",
          "structureMissingId": "構造{index}のIDを入力してください。",
          "structureDuplicateId": "構造ID「{id}」が重複しています。",
          "structureAnchorOutOfRange": "構造{index}のアンカー位置が範囲外です。",
          "generatorMissing": "生成タイプを最低1つ追加してください。",
          "generatorMissingId": "生成タイプ{index}のIDを入力してください。",
          "generatorDuplicateId": "生成タイプID「{id}」が重複しています。",
          "generatorNormalRange": "生成タイプ{index}のNormal混合参加率は0〜1で指定してください。",
          "generatorBlockRange": "生成タイプ{index}のBlock次元混合参加率は0〜1で指定してください。",
          "generatorMissingCode": "生成タイプ{index}のアルゴリズムコードを入力してください。",
          "blockMissingKey": "{tier} ブロック{index}のキーを入力してください。",
          "blockDuplicateKey": "ブロックキー「{key}」が重複しています。",
          "generatorFixedMissing": "生成タイプ{index}の固定マップが未設定です。",
          "generatorFixedFloorMissing": "生成タイプ{index}の{floor}F固定マップが不足しています。",
          "generatorFixedFloorEmpty": "生成タイプ{index}の{floor}F固定マップに床がありません。"
        }
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
      "difficulty": {
        "unplayed": "未攻略",
        "labels": {
          "veryEasy": "とても易しい",
          "easy": "易しい",
          "normal": "ノーマル",
          "second": "セカンド",
          "hard": "ハード",
          "veryHard": "ベリーハード"
        }
      },
      "summary": {
        "comingSoon": "Coming Soon",
        "categoryRatio": "{unlocked}/{total}",
        "highlights": {
          "playTime": "総プレイ時間",
          "dungeonsCleared": "攻略ダンジョン",
          "highestDifficulty": "最高難易度",
          "totalExp": "累計EXP",
          "totalExpValue": "{value} EXP",
          "hatenaTriggered": "ハテナ発動回数",
          "hatenaTriggeredValue": "{value} 回",
          "hatenaPositiveRate": "ハテナ好影響率",
          "hatenaPositiveRateValue": "{value}%"
        }
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
      "stats": {
        "sections": {
          "core": { "title": "ダンジョンの記録" },
          "blockdim": { "title": "ブロック次元の記録" },
          "hatena": { "title": "ハテナブロックの記録" },
          "tools": { "title": "ツール利用状況" }
        },
        "entries": {
          "core": {
            "playTime": { "label": "総プレイ時間", "description": "ゲームを起動していた累計時間。" },
            "totalSteps": { "label": "総移動距離", "description": "これまでに歩いたマスの合計。", "value": "{value} マス" },
            "floorsAdvanced": { "label": "踏破した階層数", "description": "階段で進んだ累積階層。" },
            "highestFloorReached": { "label": "最高到達階層", "description": "これまでに到達した最も深い階層。", "value": "{value}F" },
            "dungeonsCleared": { "label": "攻略したダンジョン数", "description": "通常・ブロック次元を含む攻略回数。" },
            "enemiesDefeated": { "label": "撃破した敵", "description": "倒した敵の合計数。" },
            "bossesDefeated": { "label": "ボス撃破数", "description": "撃破したボスの数。" },
            "totalExpEarned": { "label": "累計獲得EXP", "description": "探索やミニゲームで得た経験値の合計。", "value": "{value} EXP" },
            "damageDealt": { "label": "累計与ダメージ", "description": "敵に与えたダメージ総量。" },
            "damageTaken": { "label": "累計被ダメージ", "description": "敵やギミックから受けたダメージ総量。" },
            "chestsOpened": { "label": "開けた宝箱", "description": "探索中に開封した宝箱の数。" },
            "rareChestsOpened": { "label": "開けたレア宝箱", "description": "開封したレア宝箱の数。" },
            "normalChestsOpened": { "label": "開けた通常宝箱", "description": "通常宝箱を開封した回数。" },
            "healingItemsUsed": { "label": "使用した回復アイテム", "description": "ポーションやHP強化などを使用した回数。" },
            "autoItemsTriggered": { "label": "オートアイテム発動回数", "description": "HPが減ったとき自動で発動した回復アイテムの回数。" },
            "deaths": { "label": "戦闘不能回数", "description": "ゲームオーバーになった回数。" },
            "highestDifficultyIndex": { "label": "最高攻略難易度", "description": "これまで攻略した最も高い難易度。" }
          },
          "blockdim": {
            "gatesOpened": { "label": "Gate 起動回数", "description": "ブロック次元へ突入した回数。" },
            "bookmarksAdded": { "label": "ブックマーク登録数", "description": "保存したブックマークの数。" },
            "randomSelections": { "label": "ランダム選択回数", "description": "等確率ランダム選択を使った回数。" },
            "weightedSelections": { "label": "重み付き選択回数", "description": "狙い撃ちランダムを使った回数。" }
          },
          "hatena": {
            "blocksAppeared": { "label": "出現したブロック", "description": "探索中に見つけたハテナブロックの総数。", "value": "{value} 個" },
            "blocksTriggered": { "label": "発動したブロック", "description": "踏んで発動させたハテナブロックの回数。", "value": "{value} 回" },
            "positiveEffects": { "label": "好影響の回数", "description": "好影響（レベルアップ、報酬など）になった回数。", "value": "{value} 回" },
            "neutralEffects": { "label": "中立効果の回数", "description": "好影響でも悪影響でもなかった結果の回数。", "value": "{value} 回" },
            "negativeEffects": { "label": "悪影響の回数", "description": "悪影響（被弾や弱体化など）になった回数。", "value": "{value} 回" },
            "expGained": { "label": "累計獲得EXP", "description": "ハテナブロックから得た経験値の合計。", "value": "{value} EXP" },
            "expLost": { "label": "累計消失EXP", "description": "ハテナブロックで失った経験値の合計。", "value": "{value} EXP" },
            "bombDamageTaken": { "label": "爆発による被ダメージ", "description": "爆発効果で受けたダメージの総量。", "value": "{value} ダメージ" },
            "bombHealed": { "label": "爆発で回復したHP", "description": "爆発の回復効果で得たHPの総量。", "value": "{value} HP" },
            "bombGuards": { "label": "ガード発動回数", "description": "爆発ガード効果でダメージを軽減した回数。", "value": "{value} 回" },
            "normalChestsSpawned": { "label": "通常宝箱生成数", "description": "通常宝箱を生成した回数。", "value": "{value} 個" },
            "rareChestsSpawned": { "label": "レア宝箱生成数", "description": "レア宝箱を生成した回数。", "value": "{value} 個" },
            "itemsGranted": { "label": "獲得アイテム数", "description": "報酬として受け取ったアイテムの数。", "value": "{value} 個" },
            "enemyAmbushes": { "label": "奇襲された敵数", "description": "奇襲イベントで出現した敵の総数。", "value": "{value} 体" },
            "bombsTriggered": { "label": "爆発イベント回数", "description": "爆発の効果を引いた回数。", "value": "{value} 回" },
            "levelUps": { "label": "レベルアップ回数", "description": "ハテナブロックの効果でレベルアップした回数。", "value": "{value} 回" },
            "levelUpLevels": { "label": "累計上昇レベル", "description": "ハテナブロックで獲得したレベルの合計。", "value": "{value} レベル" },
            "levelDowns": { "label": "レベルダウン回数", "description": "ハテナブロックの効果でレベルダウンした回数。", "value": "{value} 回" },
            "levelDownLevels": { "label": "累計減少レベル", "description": "ハテナブロックで失ったレベルの合計。", "value": "{value} レベル" },
            "statusesApplied": { "label": "状態異常付与回数", "description": "ハテナブロックで状態異常を受けた回数。", "value": "{value} 回" },
            "statusesResisted": { "label": "状態異常無効化", "description": "ハテナブロックの状態異常を打ち消した回数。", "value": "{value} 回" },
            "abilityUps": { "label": "能力上昇回数", "description": "ハテナブロックでステータスが上昇した回数。", "value": "{value} 回" },
            "abilityDowns": { "label": "能力低下回数", "description": "ハテナブロックでステータスが低下した回数。", "value": "{value} 回" }
          },
          "tools": {
            "tabVisits": { "label": "ツールズタブ訪問回数", "description": "ツールズタブを開いた回数。" },
            "modExports": { "label": "Mod 出力回数", "description": "Mod 作成ツールで出力した回数。" },
            "blockdataSaves": { "label": "BlockData 保存回数", "description": "BlockData エディタで保存した回数。" },
            "blockdataDownloads": { "label": "BlockData ダウンロード回数", "description": "BlockData エディタからダウンロードした回数。" },
            "sandboxSessions": { "label": "サンドボックス操作回数", "description": "サンドボックスUIを開いた回数。" }
          }
        }
      },
      "custom": {
        "empty": "カスタム実績はまだありません。フォームから追加できます。",
        "actions": {
          "delete": "削除",
          "reset": "リセット"
        },
        "todo": {
          "statusCompleted": "状態: 完了済み",
          "statusIncomplete": "状態: 未完了",
          "markComplete": "完了にする",
          "markIncomplete": "未完了に戻す"
        },
        "repeatable": {
          "info": "累計達成回数: {count} 回",
          "infoWithTarget": "累計達成回数: {count} 回 / 目標 {target} 回"
        },
        "counter": {
          "info": "現在値: {value}",
          "infoWithTarget": "現在値: {value} / 目標 {target}"
        },
        "defaultTitle": "カスタム実績",
        "confirmDelete": "このカスタム実績を削除しますか？"
      },
      "ui": {
        "subtabs": {
          "ariaLabel": "実績と統計のサブタブ",
          "achievements": "実績",
          "stats": "統計"
        },
        "achievements": {
          "title": "実績",
          "description": "冒険やツールの利用状況に応じて自動的に更新されます。カテゴリごとの進捗を確認しましょう。"
        },
        "stats": {
          "title": "統計",
          "description": "冒険やツール操作で蓄積された累積記録が一覧表示されます。"
        },
        "fallback": "実績システムを読み込み中です… この表示が続く場合は再読み込みしてください。",
        "custom": {
          "title": "カスタマイズ能動実績",
          "description": "自分で目標や報酬を設定し、ToDoリストや周回目標として使える実績です。",
          "form": {
            "legend": "新しいカスタム実績を追加",
            "title": {
              "label": "タイトル",
              "placeholder": "例: 毎日ログイン"
            },
            "description": {
              "label": "説明",
              "placeholder": "何を達成するのか"
            },
            "reward": {
              "label": "報酬メモ",
              "placeholder": "ご褒美や備考をメモ"
            },
            "type": {
              "label": "タイプ",
              "todo": "ToDo（1回の完了）",
              "repeatable": "繰り返し達成",
              "counter": "カウント管理"
            },
            "target": {
              "label": "目標回数（任意）",
              "placeholder": "例: 10"
            },
            "submit": "実績を追加"
          }
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
    },
    "enemy": {
      "modal": {
        "noiseBlocked": "ノイズがひどくて敵の情報を読み取れない…",
        "title": {
          "boss": "ボスの情報",
          "standard": "敵の情報"
        },
        "sections": {
          "damage": "ダメージ予測"
        },
        "labels": {
          "level": "レベル:",
          "type": "種類:",
          "hp": "HP:",
          "attack": "攻撃力:",
          "defense": "防御力:",
          "damageDeal": "与ダメージ範囲:",
          "damageTake": "被ダメージ範囲:",
          "hitRate": "命中率:",
          "enemyHitRate": "敵の命中率:"
        },
        "levelFormat": "Lv.{level}",
        "typeDescription": {
          "suppressed": "{description}（レベル差により特殊効果は無効化中）"
        },
        "damage": {
          "invincibleLabel": "領域無敵",
          "invincible": "0 ({label})",
          "critLabel": "クリ",
          "reverseLabel": "回復",
          "reverseRange": "{reverseLabel} {min}-{max} ({critLabel}: {critMin}-{critMax})",
          "range": "{min}-{max} ({critLabel}: {critMin}-{critMax})"
        },
        "hitRate": "{value}%",
        "enemyHitRate": "{value}%"
      },
      "types": {
        "normal": {
          "label": "通常",
          "description": "特別な行動は行わない。"
        },
        "statusCaster": {
          "label": "状態異常使い",
          "description": "攻撃命中時に毒や麻痺などの状態異常を付与してくる。"
        },
        "warper": {
          "label": "転移者",
          "description": "攻撃命中時にプレイヤーを別の位置へワープさせることがある。"
        },
        "executioner": {
          "label": "死神",
          "description": "低確率で即死攻撃を放つ危険な敵。"
        },
        "knockback": {
          "label": "突撃兵",
          "description": "攻撃でプレイヤーを吹き飛ばし、壁に激突すると追加ダメージ。"
        },
        "swift": {
          "label": "迅速兵",
          "description": "素早く、プレイヤー1ターン中に2回行動する。"
        }
      }
    },
    "dungeon": {
      "types": {
        "field": "フィールド型",
        "cave": "洞窟型",
        "maze": "迷路型",
        "rooms": "部屋＆通路型",
        "single-room": "単部屋型",
        "circle": "円型",
        "narrow-maze": "狭い迷路型",
        "wide-maze": "幅広迷路型",
        "snake": "スネーク型",
        "mixed": "混合型",
        "circle-rooms": "円型部屋＆通路型",
        "grid": "格子型",
        "open-space": "空間型"
      }
    },
    "dungeons": {
      "base": {
        "1": {
          "name": "初心者の森",
          "description": "広い草原に点在する障害物。"
        },
        "11": {
          "name": "暗闇の洞窟",
          "description": "曲がりくねった洞窟システム。"
        },
        "21": {
          "name": "迷宮の遺跡",
          "description": "細かく複雑な迷路構造の古代遺跡。"
        },
        "31": {
          "name": "地下神殿",
          "description": "部屋と通路で構成された神殿。"
        },
        "41": {
          "name": "魔法の庭園",
          "description": "魔力に満ちた円形の庭園。"
        },
        "51": {
          "name": "水晶の洞窟",
          "description": "蛇行する水晶の洞窟。"
        },
        "61": {
          "name": "古代の迷宮",
          "description": "時を超えた巨大迷宮。"
        },
        "71": {
          "name": "竜の巣窟",
          "description": "円形の部屋が連なる竜の巣穴。"
        },
        "81": {
          "name": "星の平原",
          "description": "星空が美しい一つの大きな部屋。"
        },
        "91": {
          "name": "終焉の塔",
          "description": "様々な構造が混在する世界の終わりの塔。"
        },
        "X": {
          "name": "極限の地",
          "description": "25階層の終極ダンジョン。"
        }
      }
    },
    "game": {
      "toolbar": {
        "back": "戻る",
        "items": "アイテム",
        "skills": "スキル",
        "status": "ステータス",
        "import": "インポート",
        "export": "エクスポート",
        "toggleDungeonName": "ダンジョン名を表示する",
        "sandboxMenu": "インタラクティブ",
        "godConsole": "創造神コンソール",
        "floor": {
          "heading": "現在のフロア",
          "label": "FLOOR"
        }
      },
      "dungeonOverlay": {
        "label": "ダンジョン特徴",
        "titleFallback": "ダンジョン",
        "typePlaceholder": "フィールド型",
        "descriptionPlaceholder": "ダンジョンの特徴がここに表示されます。",
        "badge": {
          "none": "特記事項なし",
          "dark": {
            "active": "暗い",
            "suppressed": "暗い（抑制中）"
          },
          "poison": {
            "active": "毒霧",
            "suppressed": "毒霧（抑制中）"
          },
          "noise": {
            "active": "ノイズ",
            "suppressed": "ノイズ（抑制中）"
          },
          "nested": "NESTED x{value}"
        }
      },
      "blockDim": {
        "preview": {
          "selection": "NESTED {nested} ／ 次元 {dimension}：{block1}・{block2}・{block3}"
        }
      },
      "playerStats": {
        "labels": {
          "level": "レベル",
          "attackShort": "攻撃",
          "defenseShort": "防御",
          "hp": "HP",
          "satiety": "満腹度",
          "exp": "EXP",
          "sp": "SP"
        }
      },
      "statuses": {
        "poison": "毒",
        "paralysis": "麻痺",
        "abilityUp": "能力強化",
        "abilityDown": "能力低下",
        "levelDown": "レベル低下"
      },
      "autoItem": {
        "status": "オートアイテムON：回復アイテム x {count}"
      },
      "common": {
        "count": "x {count}",
        "none": "なし",
        "floor": "{floor}F"
      },
      "miniExp": {
        "dinoRunner": {
          "comboLabel": "コンボ {combo}",
          "startPromptPrimary": "スペース / クリックでスタート",
          "startPromptSecondary": "↑またはスペースでジャンプ、↓でしゃがみ",
          "gameOver": "GAME OVER",
          "restartHint": "スペース / R でリスタート",
          "distanceLabel": "距離 {distance}"
        },
        "ultimateTtt": {
          "status": {
            "player": "あなたの番",
            "ai": "AIの番",
            "ended": "ゲーム終了"
          },
          "activeBoard": "指定盤: ({x}, {y})",
          "overlay": {
            "restartHint": "Rキーで再開できます"
          },
          "result": {
            "playerWin": "あなたの勝ち！",
            "aiWin": "AIの勝ち…",
            "draw": "引き分け"
          }
        }
      },
      "backgammon": {
        "actor": {
          "player": "プレイヤー",
          "ai": "AI"
        },
        "difficulty": {
          "easy": "イージー",
          "normal": "ノーマル",
          "hard": "ハード"
        },
        "point": "ポイント{point}",
        "bar": "バー",
        "dice": {
          "none": "-"
        },
        "board": {
          "playerOff": "{actor} OFF（{countFormatted}）",
          "aiOff": "{actor} OFF（{countFormatted}）",
          "barText": "{label}"
        },
        "action": {
          "roll": "ダイスを振る",
          "rematch": "再戦"
        },
        "badge": {
          "difficulty": "難易度: {difficulty}",
          "hits": "ヒット: {hitsFormatted}",
          "score": "スコア: {scoreFormatted}"
        },
        "ui": {
          "turn": "手番: {actor}{status}",
          "turnFinishedSuffix": "（終了）",
          "dice": {
            "empty": "ダイス: -",
            "detail": "ダイス: [{diceFormatted}] / 残り [{remainingFormatted}]"
          },
          "bar": "{bar}: {playerLabel} {playerFormatted} / {aiLabel} {aiFormatted}",
          "bearOff": {
            "title": "ベアオフ",
            "summary": "{title}: {playerLabel} {playerFormatted} / {aiLabel} {aiFormatted}"
          }
        },
        "log": {
          "bearOff": "{actor} が{fromLabel}からベアオフ（{dieFormatted}）",
          "barHit": "{actor} が{bar}から{toLabel}へエントリー（{dieFormatted}）：ヒット！",
          "barEntry": "{actor} が{bar}から{toLabel}へエントリー（{dieFormatted}）",
          "moveHit": "{actor} が{fromLabel} → {toLabel}（{dieFormatted}）：ヒット！",
          "move": "{actor} が{fromLabel} → {toLabel}（{dieFormatted}）",
          "win": {
            "player": "{actor}の勝利！{rewardFormatted} EXP 獲得",
            "ai": "AIの勝利…再挑戦しよう"
          },
          "aiDice": "{actor}のダイス: {diceFormatted}",
          "aiNoMove": "AIは動けない",
          "playerDice": "{actor}のダイス: {diceFormatted}",
          "noMoves": "動かせる手がありません",
          "newGame": "新しいゲームを開始。プレイヤーの手番です"
        }
      },
      "runResult": {
        "defaultCause": "ゲームオーバー"
      },
      "death": {
        "cause": {
          "generic": "ゲームオーバー",
          "poison": "毒で倒れた…ゲームオーバー",
          "starvation": "空腹で倒れた…ゲームオーバー",
          "wallCollision": "壁への激突で倒れた…ゲームオーバー",
          "instantKill": "敵の即死攻撃を受けた…ゲームオーバー",
          "autoItemBackfire": "オートアイテムの暴発で倒れてしまった…ゲームオーバー",
          "reversedPotion": "反転した回復薬で倒れてしまった…ゲームオーバー"
        }
      },
      "items": {
        "modal": {
          "title": "アイテム"
        },
        "countPrefix": "x",
        "actions": {
          "use": "使用",
          "eat": "食べる",
          "offer": "捧げる",
          "cleanse": "状態異常を一つ治す",
          "throw": "投げつける",
          "enable": "有効にする",
          "close": "閉じる"
        },
        "autoItem": {
          "label": "オートアイテム",
          "hint": "HPが30%以下になったとき自動で回復します"
        },
        "potion30": {
          "label": "HP30%回復ポーション"
        },
        "hpBoost": {
          "label": "最大HP強化アイテム"
        },
        "atkBoost": {
          "label": "攻撃力強化アイテム"
        },
        "defBoost": {
          "label": "防御力強化アイテム"
        },
        "hpBoostMajor": {
          "label": "最大HP特大強化アイテム (+25)"
        },
        "atkBoostMajor": {
          "label": "攻撃力特大強化アイテム (+10)"
        },
        "defBoostMajor": {
          "label": "防御力特大強化アイテム (+10)"
        },
        "spElixir": {
          "label": "SPエリクサー"
        },
        "passiveOrbs": {
          "header": "パッシブオーブ"
        },
        "skillCharms": {
          "header": "スキル護符（各10ターン）"
        },
        "errors": {
          "noHealingItem": "回復アイテムを持っていない。",
          "noStatusToCleanse": "治療できる状態異常がない。"
        }
      },
      "passiveOrb": {
        "summary": "合計 {total}個（{unique}種）",
        "empty": "パッシブオーブを所持していません。",
        "noEffects": "効果はありません。",
        "countDetail": "所持数 {count}",
        "detailSeparator": " / ",
        "obtainDetail": "（{details}）",
        "obtain": "パッシブオーブ「{label}」を手に入れた！{detail}",
        "orbs": {
          "attackBoost": { "name": "攻撃力+1%の玉" },
          "defenseBoost": { "name": "防御力+1%の玉" },
          "abilityBoost": { "name": "能力+1%の玉" },
          "maxHpBoost": { "name": "最大HP+10%の玉" },
          "statusGuard": { "name": "状態異常耐性の玉" },
          "enemySpecialGuard": { "name": "敵特殊行動耐性の玉" },
          "poisonResist": { "name": "毒耐性の玉" },
          "paralysisResist": { "name": "麻痺耐性の玉" },
          "abilityDownResist": { "name": "能力低下耐性の玉" },
          "levelDownResist": { "name": "レベル低下耐性の玉" },
          "instantDeathResist": { "name": "即死耐性の玉" },
          "knockbackResist": { "name": "吹き飛び耐性の玉" },
          "poisonDamageGuard": { "name": "毒ダメージ軽減の玉" },
          "bombDamageGuard": { "name": "爆弾ダメージ軽減の玉" },
          "skillPowerBoost": { "name": "スキル威力+10%の玉" },
          "damageDealtBoost": { "name": "与ダメージ+10%の玉" },
          "damageTakenGuard": { "name": "被ダメージ-10%の玉" },
          "evasionBoost": { "name": "回避率+1%の玉" },
          "accuracyBoost": { "name": "命中率+1%の玉" },
          "critDamageBoost": { "name": "クリティカルダメージ+10%の玉" }
        },
        "labels": {
          "maxHpMul": "最大HP",
          "attackMul": "攻撃力",
          "defenseMul": "防御力",
          "damageDealtMul": "与ダメージ",
          "damageTakenMul": "被ダメージ",
          "skillPowerMul": "スキル威力",
          "accuracyMul": "命中率",
          "evasionMul": "回避率",
          "critDamageMul": "クリティカルダメージ",
          "statusChanceMul": "状態異常確率",
          "enemySpecialChanceMul": "敵特殊行動確率",
          "poisonStatusChanceMul": "毒付与確率",
          "paralysisStatusChanceMul": "麻痺付与確率",
          "levelDownStatusChanceMul": "レベルダウン確率",
          "instantDeathChanceMul": "即死確率",
          "knockbackChanceMul": "吹き飛ばし確率",
          "poisonDamageMul": "毒ダメージ",
          "bombDamageMul": "爆弾ダメージ",
          "abilityDownPenaltyMul": "能力低下幅",
          "status:poison": "毒付与確率",
          "status:paralysis": "麻痺付与確率",
          "status:levelDown": "レベルダウン確率",
          "instantDeath": "即死確率",
          "enemySpecial:knockback": "吹き飛ばし確率",
          "poison": "毒ダメージ",
          "bomb": "爆弾ダメージ",
          "abilityDownPenalty": "能力低下幅"
        }
      },
      "skillCharms": {
        "use": "使用",
        "empty": "所持していません。"
      },
      "events": {
        "hatena": {
          "spawnSingle": "怪しげなハテナブロックが現れた…！",
          "spawnMultiple": "怪しげなハテナブロックが{count}個出現した…！",
          "bombGuard": "爆発の衝撃を無効化した！",
          "bombHeal": "爆発のエネルギーが反転し、HPが{amount}回復した！",
          "bombDamage": "爆発で{amount}のダメージ！",
          "bombDeath": "爆発に巻き込まれて倒れた…ゲームオーバー",
          "itemObtained": "{item}を1つ手に入れた！",
          "trigger": "ハテナブロックを踏んだ！",
          "levelUp": "レベルが{amount}上昇した！",
          "levelNoChange": "しかしレベルは変わらなかった。",
          "levelDown": "レベルが{amount}下がってしまった…",
          "levelDownNoEffect": "これ以上レベルは下がらなかった。",
          "expGain": "経験値を{amount}獲得した！",
          "expGainNone": "経験値は増えなかった。",
          "expLoss": "経験値を{amount}失った…",
          "expLossNone": "失う経験値はなかった。",
          "enemyAmbush": "周囲に敵が現れた！",
          "noEnemies": "しかし敵は現れなかった。",
          "poisonGuarded": "毒は無効化された。",
          "statusNone": "状態異常は発生しなかった。",
          "buffFailed": "能力強化の効果は発揮されなかった。",
          "debuffNone": "能力低下は発生しなかった。",
          "rareChest": "煌びやかなレア宝箱が出現した！",
          "chestNoSpace": "宝箱を置く場所が見つからなかった。",
          "chest": "宝箱が出現した！",
          "noChest": "宝箱は現れなかった。",
          "chestRing": "宝箱に囲まれた！",
          "nothing": "しかし何も起きなかった。"
        },
        "skills": {
          "statusGuarded": "スキル効果により状態異常を無効化した！"
        },
        "sp": {
          "unlocked": "SPが解放された！",
          "notUnlocked": "SPが解放されていない。",
          "notEnough": "SPが足りない。",
          "maxIncreased": "SP上限が{value}に上昇した！",
          "gained": "SPを{amount}獲得した。",
          "spent": "SPを{amount}消費した。",
          "offered": "回復アイテムを捧げ、SPを{amount}獲得した。",
          "offerLocked": "SPシステムが解放されてから捧げられる。",
          "notUnlockedForItem": "SPが解放されていないため使用できない。",
          "noCapacity": "SP上限が0のため効果がない。",
          "alreadyFull": "SPはすでに最大だ。",
          "elixirUsed": "SPエリクサーを使用！SPが{amount}回復した。",
          "fullyRestored": "SPが全快した。（+{amount}）"
        },
        "exp": {
          "bossBonusSuffix": " (ボスボーナス!)",
          "enemyGain": "経験値を {amount} 獲得！{bonus}",
          "spent": "経験値を {amount} 消費。（{context}）",
          "gained": "経験値を {amount} 獲得！（{context}）"
        },
        "status": {
          "paralyzed": "体が痺れて動けない…",
          "paralyzedRemaining": "体が痺れて動けない… (残り{turns}ターン)",
          "cured": {
            "poison": "毒が治った。",
            "paralysis": "体の痺れが解けた。",
            "abilityUp": "能力強化の効果が切れた。",
            "abilityDown": "能力低下から解放された。",
            "levelDown": "一時的なレベル低下が解除された。"
          },
          "applied": {
            "poison": "毒に侵された！ ({turns}ターン)",
            "paralysis": "体が痺れて動けない！ ({turns}ターン)",
            "abilityUp": "能力が高まった！最大HP/攻撃/防御が上昇 ({turns}ターン)",
            "abilityDown": "能力が低下した…最大HP/攻撃/防御が下がる ({turns}ターン)",
            "levelDown": "レベルが一時的に低下した！ ({turns}ターン)"
          }
        },
        "levelUp": {
          "log": "レベルアップ！\nレベル：{level} (+{levelDelta})\n最大HP：{maxHp}(+{maxHpDelta})\n攻撃力：{attack}(+{attackDelta})\n防御力：{defense}(+{defenseDelta})"
        },
        "sandbox": {
          "noExp": "サンドボックスでは経験値は獲得できません。",
          "started": "サンドボックスを開始しました。経験値は獲得できません。"
        },
        "console": {
          "executed": "創造神コンソールがコードを実行しました。",
          "error": "創造神コンソール エラー: {message}"
        },
        "unlocks": {
          "nestedLegend": "NESTED 99999999 のダンジョンを攻略し、アノス級の神格を得た！",
          "consoleAlwaysOn": "創造神コンソールとサンドボックス切替が常時利用可能になった。"
        },
        "actions": {
          "wallDestroyed": "壁を破壊した！"
        },
        "dungeon": {
          "darkness": "暗闇が視界を包み、見通しが悪い…",
          "poisonFog": "毒霧が漂っている！通常の床も危険だ。"
        },
        "charms": {
          "unknown": "未知の護符は使用できない。",
          "notOwned": "その護符は所持していない。",
          "activated": "{label}の護符が発動！効果は{turns}ターン持続する。"
        },
        "satiety": {
          "enabled": "満腹度システムが発動した！",
          "disabled": "満腹度システムが解除された。",
          "cannotEat": "満腹度システムが有効な時だけ食べられる。",
          "alreadyFull": "満腹度は既に最大値です。",
          "damage": "空腹で {amount} のダメージを受けた！"
        },
        "chest": {
          "prefix": {
            "normal": "宝箱を開けた！",
            "rare": "黄金の宝箱を開けた！"
          },
          "reward": {
            "potion30": "{prefix}HP30%回復ポーションを手に入れた！",
            "hpBoost": "{prefix}最大HP強化アイテムを手に入れた！",
            "atkBoost": "{prefix}攻撃力強化アイテムを手に入れた！",
            "defBoost": "{prefix}防御力強化アイテムを手に入れた！"
          }
        },
        "goldenChest": {
          "modal": {
            "title": "黄金の宝箱",
            "status": "タイミングバーを中央で止めよう！（Space/Enter）",
            "stop": "ストップ",
            "hint": "Space / Enter キーでも止められます。"
          },
          "elixir": "黄金の宝箱から特製SPエリクサーを手に入れた！SPが大幅に回復する。",
          "openedSafely": "黄金の宝箱を安全に開けた！",
          "prompt": "黄金の宝箱だ！タイミングバーを狙おう。",
          "major": {
            "hp": "黄金の宝箱から最大HP+{amount}の秘薬を手に入れた！",
            "atk": "黄金の宝箱から攻撃力+{amount}の戦術オーブを手に入れた！",
            "def": "黄金の宝箱から防御力+{amount}の護りの盾札を手に入れた！"
          },
          "skillCharm": "黄金の宝箱からスキル効果「{effectName}」の護符を手に入れた！（{turns}ターン）"
        },
        "combat": {
          "noEnemyInDirection": "その方向には敵がいない！",
          "sureHitIneffective": "敵のレベルが高すぎて必中攻撃の効果が及ばない…",
          "miss": "Miss",
          "enemyDefeated": "敵を倒した！",
          "bossGate": "ボスを倒すまでは進めない！",
          "enemyMissed": "敵は外した！",
          "enemyWarped": "敵の転移攻撃でワープさせられた！",
          "enemyAttackDamage": "敵はプレイヤーに {amount} のダメージを与えた！",
          "enemyWarpPopup": "ワープ",
          "statusResistedByLevel": "レベル差で状態異常を防いだ！",
          "teleportResistedByLevel": "レベル差で転移攻撃を耐えた！",
          "instantDeathResisted": "レベル差で即死攻撃を無効化した！",
          "instantDeathHit": "敵の即死攻撃が命中した…！",
          "knockbackResistedByLevel": "レベル差で吹き飛ばしを踏ん張った！",
          "playerDamage": "プレイヤーは敵に {amount} のダメージを与えた！",
          "knockbackCollision": "壁に激突して{amount}のダメージ！"
        },
        "orb": {
          "statusAttackNegated": "オーブの加護で状態異常攻撃を無効化した！",
          "statusAttackPrevented": "オーブの加護で状態異常攻撃を防いだ！",
          "statusPrevented": "オーブの加護で状態異常を防いだ！",
          "teleportNegated": "オーブの加護で転移攻撃を無効化した！",
          "teleportPrevented": "オーブの加護で転移攻撃を防いだ！",
          "instantDeathNegated": "オーブの加護で即死攻撃を無効化した！",
          "instantDeathPrevented": "オーブの加護で即死攻撃を耐えた！",
          "knockbackNegated": "オーブの加護で吹き飛ばしを無効化した！",
          "knockbackPrevented": "オーブの加護で吹き飛ばしを防いだ！"
        },
        "items": {
          "noPotion": "ポーションを持っていない。",
          "noOfferingItem": "捧げる回復アイテムがない。",
          "throwNoEnemies": "投げつける範囲に敵がいない。",
          "throwNoHealingItem": "投げつける回復アイテムがない。",
          "throwNoTarget": "投げつける相手が見つからなかった。",
          "throwIneffective": "敵のレベルが高すぎて投げつけても効果がなかった…",
          "throwNoEffect": "回復アイテムを投げつけたが効果がなかった。",
          "throwDamage": "回復アイテムを投げつけ、敵に{damage}のダメージを与えた！",
          "autoSatietyRecovered": "オートアイテムが発動！満腹度が{amount}回復",
          "potionSatietyRecovered": "ポーションを食べた！満腹度が{amount}回復",
          "autoReversedDamage": "オートアイテムが暴発し、{amount}のダメージを受けた！",
          "potionReversedDamage": "ポーションが反転し、{amount}のダメージを受けた！",
          "autoHpRecovered": "オートアイテムが発動！HPが{amount}回復",
          "potionHpRecovered": "ポーションを使用！HPが{amount}回復",
          "autoNoEffect": "オートアイテムが発動したが体調に変化はなかった。",
          "potionNoEffect": "ポーションを使用したが体調に変化はなかった。",
          "cleansedStatus": "回復アイテムを消費し、{status}の状態異常を治した。",
          "hpBoostUsed": "最大HP強化アイテムを使用！最大HPが5増加！",
          "attackBoostUsed": "攻撃力強化アイテムを使用！攻撃力が1増加！",
          "defenseBoostUsed": "防御力強化アイテムを使用！防御力が1増加！",
          "hpBoostMajorUsed": "最大HP特大強化アイテムを使用！最大HPが{amount}増加！",
          "attackBoostMajorUsed": "攻撃力特大強化アイテムを使用！攻撃力が{amount}増加！",
          "defenseBoostMajorUsed": "防御力特大強化アイテムを使用！防御力が{amount}増加！",
          "notOwned": "そのアイテムは所持していない。",
          "noSpElixir": "SPエリクサーを所持していない。"
        },
        "data": {
          "imported": "データをインポートしました"
        },
        "blockdim": {
          "selectionIncomplete": "ブロック選択が不完全です"
        },
        "progress": {
          "dungeonCleared": "ダンジョンを攻略した！",
          "nextFloor": "次の階層に進んだ！（{floor}F）"
        }
      }
    },
    "godConsole": {
      "mode": {
        "current": "現在: {mode}",
        "sandbox": "サンドボックスモード",
        "normal": "探索モード",
        "toggle": {
          "toSandbox": "サンドボックスモードに入る",
          "toNormal": "探索モードに戻る"
        }
      },
      "status": {
        "prompt": "コードを入力し、創造の力を解き放ちましょう。",
        "notAwakened": "創造神の力がまだ覚醒していません。",
        "enterCode": "コードを入力してください。",
        "running": "コードを実行中…",
        "executedWithReturn": "コードを実行しました（返値: {value}）",
        "executed": "コードを実行しました。",
        "error": "エラー: {message}",
        "requiresGodPower": "創造神の力が必要です。",
        "toggleRestricted": "ダンジョン探索中のみ切り替えできます。",
        "sandboxEnabled": "サンドボックスモードを有効化しました。",
        "sandboxDisabled": "探索モードに戻りました。",
        "sampleInserted": "サンプルコードを挿入しました。",
        "cleared": "入力をクリアしました。"
      }
    },
    "games": {
      "timer": {
        "header": {
          "title": "タイマー",
          "subtitle": "集中や休憩の時間管理に。シンプルなカウントダウンとストップウォッチ"
        },
        "xpBadge": "今回獲得 {formattedXp} EXP",
        "modes": {
          "countdown": "カウントダウン",
          "stopwatch": "ストップウォッチ"
        },
        "inputs": {
          "hours": "時間",
          "minutes": "分",
          "seconds": "秒"
        },
        "quickButtons": {
          "addMinutes": "+{minutes}分",
          "subtractMinutes": "-{minutes}分",
          "pomodoro": "{minutes}分ポモドーロ"
        },
        "controls": {
          "start": "開始",
          "pause": "一時停止",
          "resume": "再開",
          "reset": "リセット"
        },
        "status": {
          "ready": "準備完了",
          "countdownReady": "カウントダウンの準備完了",
          "stopwatchReady": "ストップウォッチの準備完了",
          "countdownRunning": "カウント中…",
          "resumed": "再開しました",
          "paused": "一時停止中",
          "stopwatchRunning": "計測中…",
          "stopwatchMinuteAwarded": "{minutes}分経過！",
          "stopwatchMinute": "{minutes}分経過",
          "completed": "完了！お疲れさまでした"
        },
        "history": {
          "title": "最近のログ",
          "labels": {
            "complete": "完了",
            "start": "開始",
            "stopwatchMinute": "経過",
            "generic": "達成"
          },
          "xpAward": "{label}: +{formattedXp} EXP",
          "timerComplete": "タイマー完了！"
        }
      },
      "stopwatch": {
        "header": {
          "title": "ストップウォッチ Pro"
        },
        "statusBadge": {
          "running": "計測中",
          "stopped": "停止中"
        },
        "info": {
          "lapCount": "ラップ: {count}",
          "lastLap": "前ラップ: {time}",
          "lastLapNone": "前ラップ: -",
          "sessionXp": "セッションEXP: {xp}"
        },
        "buttons": {
          "start": "スタート",
          "pause": "一時停止",
          "resume": "再開",
          "lap": "ラップ",
          "reset": "リセット"
        },
        "laps": {
          "title": "ラップ記録",
          "subtitle": "最新順に表示",
          "empty": "ラップを記録するとここに表示されます",
          "label": "ラップ {index}"
        }
      },
      "diagramMaker": {
        "errors": {
          "containerMissing": "MiniExp Diagram Maker を表示するコンテナが必要です",
          "pngSignature": "PNG署名を認識できませんでした",
          "pngDataMissing": "PNG内にdraw.ioデータが見つかりませんでした",
          "inflateUnsupported": "圧縮データの展開に対応していない環境です",
          "parseXml": "XMLを解析できませんでした",
          "diagramMissing": "diagram 要素が見つかりません",
          "mxGraphMissing": "mxGraphModel が見つかりません",
          "diagramDecodeFailed": "diagram データを展開できませんでした",
          "mxGraphRootMissing": "mxGraphModel root が見つかりません",
          "loadFailed": "読み込みに失敗しました: {error}",
          "saveFailed": "保存に失敗しました: {error}",
          "exportFailed": "書き出しに失敗しました: {error}"
        },
        "defaults": {
          "fileName": "未保存の図.drawio",
          "layerName": "レイヤー {index}",
          "pageName": "ページ {index}",
          "textPlaceholder": "テキスト",
          "nodePlaceholder": "新しいノード"
        },
        "tools": {
          "select": "選択",
          "rectangle": "四角",
          "ellipse": "楕円",
          "text": "テキスト",
          "connector": "コネクタ",
          "delete": "削除"
        },
        "actions": {
          "new": "新規",
          "open": "開く",
          "save": "保存",
          "export": "書き出し",
          "exportFormat": "{formatLabel} で書き出し",
          "undo": "元に戻す",
          "redo": "やり直す"
        },
        "sections": {
          "properties": "プロパティ"
        },
        "fields": {
          "x": "X",
          "y": "Y",
          "width": "幅",
          "height": "高さ",
          "fill": "塗り",
          "stroke": "線",
          "strokeWidth": "線幅",
          "textColor": "文字色",
          "fontSize": "文字サイズ",
          "text": "テキスト"
        },
        "toggles": {
          "grid": "グリッド",
          "snap": "スナップ"
        },
        "labels": {
          "exp": "EXP: {value}"
        },
        "confirm": {
          "newDocument": "保存されていない変更があります。新規作成しますか？"
        }
      },
      "clockHub": {
        "errors": {
          "noContainer": "Clock Hubにはコンテナが必要です"
        },
        "header": {
          "title": "時計ユーティリティハブ",
          "subtitle": "デジタル／アナログ／詳細情報を切り替え",
          "exp": "獲得EXP: {xp}"
        },
        "tabs": {
          "digital": "デジタル時計",
          "analog": "アナログ時計",
          "detail": "詳細"
        },
        "detailTabs": {
          "overview": "概要",
          "progress": "進捗率",
          "remain": "残り時間",
          "stats": "情報一覧",
          "calendar": "カレンダー"
        },
        "digital": {
          "format": {
            "24h": "24時間制",
            "12h": "12時間制"
          },
          "period": {
            "am": "午前",
            "pm": "午後"
          },
          "dateLine": "{year}年{month}月{day}日（{weekday}）",
          "timeLine12": "{period}{hour}時{minute}分{second}秒",
          "timeLine24": "{hour}時{minute}分{second}秒"
        },
        "analog": {
          "type": {
            "12h": "通常アナログ時計",
            "24h": "24時間制アナログ時計"
          }
        },
        "weekdays": {
          "0": "日",
          "1": "月",
          "2": "火",
          "3": "水",
          "4": "木",
          "5": "金",
          "6": "土"
        },
        "dates": {
          "full": "{year}年{month}月{day}日（{weekday}）"
        },
        "era": {
          "reiwa": "令和",
          "heisei": "平成",
          "showa": "昭和",
          "taisho": "大正",
          "meiji": "明治",
          "format": "{era}{year}年",
          "unknown": "不明"
        },
        "eto": {
          "stems": {
            "0": "甲",
            "1": "乙",
            "2": "丙",
            "3": "丁",
            "4": "戊",
            "5": "己",
            "6": "庚",
            "7": "辛",
            "8": "壬",
            "9": "癸"
          },
          "branches": {
            "0": "子",
            "1": "丑",
            "2": "寅",
            "3": "卯",
            "4": "辰",
            "5": "巳",
            "6": "午",
            "7": "未",
            "8": "申",
            "9": "酉",
            "10": "戌",
            "11": "亥"
          },
          "format": "{stem}{branch}"
        },
        "season": {
          "winter": "冬",
          "spring": "春",
          "summer": "夏",
          "autumn": "秋",
          "unknown": "不明"
        },
        "solarTerms": {
          "risshun": "立春",
          "usui": "雨水",
          "keichitsu": "啓蟄",
          "shunbun": "春分",
          "seimei": "清明",
          "kokuu": "穀雨",
          "rikka": "立夏",
          "shoman": "小満",
          "boshu": "芒種",
          "geshi": "夏至",
          "shosho": "小暑",
          "taisho": "大暑",
          "risshu": "立秋",
          "shoshoLimitHeat": "処暑",
          "hakuro": "白露",
          "shubun": "秋分",
          "kanro": "寒露",
          "soko": "霜降",
          "rittou": "立冬",
          "shosetsu": "小雪",
          "taisetsu": "大雪",
          "touji": "冬至",
          "shokan": "小寒",
          "dahan": "大寒",
          "nextDate": "{year}年{month}月{day}日",
          "description": "{previous} → 次は{next}（{nextDate}、{duration}）"
        },
        "duration": {
          "prefix": {
            "future": "あと",
            "past": "前"
          },
          "unit": {
            "year": "{value}年",
            "day": "{value}日",
            "hour": "{value}時間",
            "minute": "{value}分",
            "second": "{value}秒"
          },
          "joiner": ""
        },
        "progress": {
          "labels": {
            "millennium": "千年紀",
            "century": "世紀",
            "decade": "年代",
            "year": "年",
            "month": "月",
            "day": "日",
            "hour": "時",
            "minute": "分",
            "second": "秒"
          },
          "percent": "{value}%"
        },
        "remaining": {
          "labels": {
            "nextSecond": "次の秒",
            "nextMinute": "次の分",
            "nextHour": "次の時",
            "nextDay": "次の日",
            "nextMonth": "次の月",
            "nextYear": "次の年"
          },
          "delta": "（±{millis}ms）",
          "value": "{duration}{delta}"
        },
        "stats": {
          "labels": {
            "unix": "UNIX時間",
            "ticks": "経過ミリ秒",
            "iso": "ISO 8601",
            "yearday": "年内通算日",
            "daySeconds": "今日の経過秒",
            "timezone": "タイムゾーン"
          },
          "yeardayValue": "第{value}日目",
          "daySecondsValue": "{value}秒",
          "timezoneFallback": "ローカル"
        },
        "calendar": {
          "settings": {
            "title": "休暇／出勤日のカスタム設定",
            "holidayTitle": "祝日・休暇として登録",
            "workdayTitle": "出勤日として登録",
            "add": "追加",
            "empty": "登録なし",
            "remove": "削除"
          },
          "info": {
            "summary": "日付: {date}",
            "era": "和暦: {era}｜干支: {eto}",
            "season": "季節: {season}｜四半期: 第{quarter}四半期",
            "progress": "年内通算日: 第{dayOfYear}日｜ISO週番号: 第{isoWeek}週｜月内第{weekOfMonth}週",
            "status": "区分: {status}"
          },
          "status": {
            "rest": "休み",
            "workday": "出勤日想定",
            "holiday": "祝日登録あり",
            "workdayOverride": "出勤登録あり",
            "separator": " / "
          },
          "controls": {
            "prev": "← 前月",
            "next": "翌月 →",
            "today": "今日"
          },
          "monthLabel": "{year}年{month}月",
          "today": "本日: {date}"
        },
        "common": {
          "yes": "はい",
          "no": "いいえ"
        },
        "overview": {
          "gregorian": "西暦: {year}年 {month}月{day}日（{weekday}）",
          "era": "和暦: {era}",
          "eto": "干支: {eto}｜皇紀: {imperial}",
          "season": "季節: {season}｜二十四節気: {solarTerm}",
          "leapYear": "うるう年: {value}"
        },
        "xp": {
          "note": "秒:+{second} / 分:+{minute} / 時:+{hour} / 日:+{day} / 月:+{month} / 年:+{year} / 世紀:+{century} / 千年紀:+{millennium}"
        }
      }
    },

    "statusModal": {
      "title": "プレイヤーステータス",
      "sections": {
        "basic": "基本ステータス",
        "inventory": "所持アイテム",
        "settings": "ゲーム設定",
        "dungeon": "ダンジョン情報"
      },
      "labels": {
        "level": "レベル",
        "exp": "経験値",
        "hp": "HP",
        "satiety": "満腹度",
        "sp": "SP",
        "attack": "攻撃力",
        "defense": "防御力",
        "statusEffects": "状態異常",
        "skillEffects": "スキル効果",
        "floor": "現在階層"
      },
      "settings": {
        "world": "選択世界",
        "difficulty": "難易度"
      },
      "dungeon": {
        "structure": "構成",
        "type": "タイプ"
      },
      "effects": {
        "none": "状態異常なし",
        "remaining": "{label} 残り{turns}ターン",
        "entry": "{label} 残り{turns}ターン"
      },
      "skillCharms": {
        "entry": "{label} x{count}"
      },
      "world": {
        "normal": "{world}世界",
        "blockdim": "BlockDim NESTED {nested} / {dimension}"
      },
      "dungeonSummary": {
        "normal": "{world}世界：{dungeon}",
        "blockdim": "NESTED {nested} ／ 次元 {dimension}：{block1}・{block2}・{block3}"
      },
      "details": {
        "floor": "階層: {floor}",
        "hpBaseSuffix": " (基{base})",
        "level": "Lv.{value}",
        "hp": "HP {current}/{max}{baseSuffix}",
        "attack": "攻{value}",
        "defense": "防{value}",
        "satiety": "満{current}/{max}",
        "line": "{level} {hp} {attack} {defense} {satiety}"
      },
      "stats": {
        "valueWithBase": "{effective} (基{base})",
        "levelWithBase": "Lv.{effective} (基{base})",
        "hp": "{current}/{max}{baseSuffix}"
      }
    },
    "miniPaint": {
      "appName": "ペイント",
      "windowTitle": "{marker}{fileName} - {appName}",
      "defaultFileName": "未タイトル.png",
      "importedFileName": "インポート画像.png",
      "menu": {
        "new": "新規",
        "import": "読み込み",
        "save": "保存",
        "saveAs": "名前を付けて保存",
        "export": "エクスポート",
        "clear": "クリア",
        "undo": "元に戻す",
        "redo": "やり直す",
        "gridOn": "グリッド: ON",
        "gridOff": "グリッド: OFF"
      },
      "tools": {
        "brush": "ブラシ",
        "pencil": "鉛筆",
        "marker": "マーカー",
        "eraser": "消しゴム",
        "line": "直線",
        "rectangle": "四角",
        "ellipse": "楕円",
        "fill": "塗りつぶし",
        "picker": "スポイト",
        "fillMode": "形を塗りつぶす"
      },
      "labels": {
        "size": "サイズ",
        "zoom": "ズーム",
        "primary": "前景",
        "secondary": "背景",
        "sizeValue": "{value}px",
        "zoomValue": "{value}%",
        "primaryColorTitle": "前景色",
        "secondaryColorTitle": "背景色"
      },
      "status": {
        "position": "座標: {x}, {y}",
        "positionIdle": "座標: -",
        "brushSize": "太さ: {value}px",
        "zoom": "ズーム: {value}%",
        "exp": "獲得EXP: {value}"
      },
      "prompts": {
        "closeConfirm": "変更を破棄してペイントを閉じますか？",
        "clearConfirm": "現在のキャンバスを消去しますか？",
        "newConfirm": "保存せずに新規キャンバスを作成しますか？",
        "saveFileName": "保存するファイル名を入力してください"
      },
      "messages": {
        "saveFailed": "画像の保存に失敗しました。",
        "imageLoadFailed": "画像の読み込みに失敗しました。",
        "fileLoadFailed": "ファイルの読み込みに失敗しました。"
      }
    },
    "games": {
      "todoList": {
        "defaults": {
          "untitled": "名称未設定"
        },
        "header": {
          "title": "ToDoリスト",
          "today": "{date}",
          "stats": "未完了: {pending}件 / 完了: {completed}件"
        },
        "form": {
          "titleCreate": "新規ToDoを登録",
          "titleEdit": "ToDoを編集",
          "name": "名前",
          "namePlaceholder": "例: 日次レポートを送信",
          "xp": "獲得EXP",
          "color": "カラー",
          "memo": "メモ",
          "memoPlaceholder": "補足情報やチェックポイントなどを入力",
          "submitCreate": "追加",
          "submitUpdate": "更新",
          "cancel": "キャンセル"
        },
        "sections": {
          "pending": "未完了タスク",
          "completed": "完了済みタスク",
          "emptyPending": "未完了のToDoはありません。",
          "emptyCompleted": "完了したToDoはまだありません。"
        },
        "task": {
          "xpChip": "{xp} EXP",
          "memoEmpty": "メモなし",
          "createdAt": "登録: {date}",
          "completedAt": "完了: {date}",
          "statusCompleted": "成功",
          "statusFailed": "失敗",
          "actions": {
            "complete": "完了",
            "fail": "失敗",
            "edit": "編集",
            "delete": "削除"
          }
        },
        "dialogs": {
          "confirmDelete": "このToDoを削除しますか？",
          "requireName": "名前を入力してください。"
        }
      },
      "notepad": {
        "defaultFileName": "タイトルなし.txt",
        "confirm": {
          "discardChanges": "変更を破棄して閉じますか？",
          "newWithoutSaving": "変更を保存せずに新しいファイルを開きますか？"
        },
        "menu": {
          "file": "ファイル",
          "edit": "編集",
          "view": {
            "label": "表示",
            "enableWordWrap": "折り返しを有効化",
            "disableWordWrap": "折り返しを無効化",
            "showStatusBar": "ステータスバーを表示",
            "hideStatusBar": "ステータスバーを非表示"
          },
          "fileNew": "新規",
          "fileOpen": "開く...",
          "fileSave": "上書き保存",
          "fileSaveAs": "名前を付けて保存...",
          "filePrint": "印刷...",
          "editUndo": "元に戻す",
          "editRedo": "やり直し",
          "editCut": "切り取り",
          "editCopy": "コピー",
          "editPaste": "貼り付け",
          "editDelete": "削除",
          "editFind": "検索...",
          "editReplace": "置換...",
          "editSelectAll": "すべて選択",
          "viewZoomIn": "ズームイン",
          "viewZoomOut": "ズームアウト",
          "viewZoomReset": "ズームを既定に戻す"
        },
        "commands": {
          "heading": "見出しを切り替え",
          "bullet": "箇条書きを切り替え",
          "bold": "太字 (Markdown)",
          "italic": "斜体 (Markdown)",
          "underline": "下線タグ",
          "wordWrap": "折り返しを切り替え",
          "zoomReset": "ズームを既定に戻す",
          "settings": "設定"
        },
        "settings": {
          "title": "設定",
          "wordWrap": "折り返し",
          "statusBar": "ステータスバー",
          "zoom": "ズーム",
          "zoomReset": "リセット",
          "insertTimestamp": "日時を挿入"
        },
        "prompts": {
          "search": "検索する文字列を入力してください",
          "saveFileName": "保存するファイル名を入力してください",
          "replaceTarget": "置換する文字列を入力してください",
          "replaceWith": "置換後の文字列を入力してください"
        },
        "alerts": {
          "searchNotFound": "見つかりませんでした。",
          "replaceNotFound": "対象の文字列が見つかりませんでした。",
          "fileReadFailed": "ファイルの読み込みに失敗しました。",
          "printPopupBlocked": "印刷ウィンドウを開けませんでした。ポップアップを許可してください。"
        },
        "print": {
          "label": "印刷",
          "windowTitleFallback": "メモ帳"
        },
        "status": {
          "position": "行 {line}, 列 {column}",
          "length": "{count} 文字",
          "typeText": "テキスト",
          "lineEnding": {
            "lf": "Unix (LF)",
            "crlf": "Windows (CRLF)"
          }
        },
        "timestamp": {
          "pattern": "{year}-{month}-{day} {hour}:{minute}:{second}"
        }
      },
      "wording": {
        "name": "Wording",
        "description": "編集+1 / 書式+2 / 保存+6 EXP のワープロ",
        "defaultTitle": "文書1",
        "autoTitle": "文書{formattedNumber}",
        "quickBar": {
          "open": "開く (Ctrl+O)",
          "save": "上書き保存 (Ctrl+S)",
          "saveAs": "名前を付けて保存 (Ctrl+Shift+S)",
          "undo": "元に戻す (Ctrl+Z)",
          "redo": "やり直し (Ctrl+Y)",
          "print": "印刷"
        },
        "tabs": {
          "home": "ホーム",
          "insert": "挿入",
          "layout": "レイアウト",
          "review": "校閲",
          "view": "表示"
        },
        "groups": {
          "clipboard": "クリップボード",
          "font": "フォント",
          "paragraph": "段落",
          "style": "スタイル",
          "insert": "挿入",
          "media": "メディア",
          "theme": "テーマ",
          "columns": "列",
          "margins": "余白",
          "proofing": "校閲ツール",
          "comments": "コメント",
          "lineHeight": "行間",
          "guides": "ガイド",
          "paper": "紙の色"
        },
        "buttons": {
          "rename": "名前の変更",
          "paste": "貼り付け",
          "copy": "コピー",
          "cut": "切り取り",
          "bold": "太字",
          "italic": "斜体",
          "underline": "下線",
          "strikethrough": "取り消し線",
          "superscript": "上付き",
          "subscript": "下付き",
          "bullets": "箇条書き",
          "numberedList": "番号付きリスト",
          "alignLeft": "左揃え",
          "alignCenter": "中央揃え",
          "alignRight": "右揃え",
          "alignJustify": "両端揃え",
          "outdent": "インデント解除",
          "indent": "インデント追加",
          "blockParagraph": "本文",
          "blockHeading": "見出し {level}",
          "blockQuote": "引用",
          "insertDate": "日付",
          "insertTime": "時刻",
          "insertHorizontalRule": "横罫線",
          "insertEmoji": "スタンプ",
          "insertImage": "画像",
          "insertTextbox": "テキストボックス",
          "insertToc": "目次",
          "commentInsert": "コメント挿入",
          "changeSummary": "変更サマリ",
          "wordCount": "文字数カウント",
          "readingTime": "読了目安",
          "reviewHighlightOn": "長文検出",
          "reviewHighlightOff": "長文解除",
          "columnsOption": "{formattedCount} 列",
          "lineHeightOption": "{formattedValue} 倍",
          "marginNarrow": "狭い",
          "marginNormal": "標準",
          "marginWide": "広い",
          "themeLight": "ライト",
          "themeDark": "ダーク紙",
          "showRuler": "ルーラー表示",
          "hideRuler": "ルーラー非表示",
          "showStatus": "ステータス表示",
          "hideStatus": "ステータス隠す",
          "paperWhite": "ホワイト",
          "paperCream": "クリーム",
          "paperGray": "グレー",
          "zoomOut": "ズームアウト",
          "zoomIn": "ズームイン"
        },
        "messages": {
          "printUnavailable": "印刷ダイアログは近日対応予定です",
          "noContent": "本文がありません",
          "wordCount": "文字数: {characters} / 単語: {words} / 段落: {paragraphs}",
          "readingTime": "およそ {minutes} 分 {secondsPadded} 秒で読めます",
          "changeSummarySaved": "保存済み: 差分はありません",
          "changeSummaryDiff": "未保存の差分目安: 約 {difference} 文字"
        },
        "prompts": {
          "rename": "文書名を入力してください",
          "saveFile": "保存するファイル名 (.wording.html)",
          "comment": "コメントを入力してください"
        },
        "confirm": {
          "closeWithoutSave": "保存せずに閉じますか？",
          "newWithoutSave": "保存されていない変更があります。新規作成しますか？"
        },
        "fonts": {
          "yuGothic": "游ゴシック",
          "yuMincho": "游明朝",
          "meiryo": "メイリオ",
          "hiraginoKaku": "ヒラギノ角ゴ",
          "monospace": "等幅 (Consolas)"
        },
        "fontSize": {
          "option": "{formattedSize} pt"
        },
        "insert": {
          "tocTemplate": "<ol><li>はじめに</li><li>本題</li><li>まとめ</li></ol>",
          "textboxLabel": "テキストボックス"
        },
        "editor": {
          "welcomeHtml": "<p>ようこそ、Wording へ！ここで文章作成を始めましょう。</p>",
          "newDocumentHtml": "<p>新しい文書を開始しましょう。</p>"
        },
        "status": {
          "summary": "ページ {pageCurrent} / {pageTotal} | 文字数: {characters} | 単語: {words}"
        },
        "search": {
          "title": "検索と置換",
          "placeholder": "検索語",
          "replacePlaceholder": "置換文字列",
          "enterQuery": "検索語を入力してください",
          "noMatch": "一致はありません",
          "next": "次を検索",
          "replace": "置換",
          "replaceAll": "すべて置換",
          "close": "閉じる",
          "replacedCount": "{count} 件置換しました",
          "progress": "全{total}件中 {current}件目"
        }
      },
      "games": {
        "bowlingDuel": {
          "title": "ボウリング対決 MOD",
          "legend": "ボタンを押して狙い→カーブ→パワーの順にゲージを止め、投球しよう！",
          "history": {
            "title": "ログ",
            "placeholder": "---"
          },
          "buttons": {
            "throw": "🎳 ボールを投げる",
            "reset": "🔄 リセット",
            "throwing": "🎳 投球中…"
          },
          "scoreboard": {
            "you": "あなた",
            "cpu": "CPU",
            "total": "合計"
          },
          "sliders": {
            "aim": {
              "label": "狙い位置",
              "center": "中央",
              "right": "右 {value}",
              "left": "左 {value}"
            },
            "curve": {
              "label": "カーブ量",
              "none": "なし",
              "right": "右曲がり {value}",
              "left": "左曲がり {value}"
            },
            "power": {
              "label": "投球パワー",
              "format": "{value}%"
            }
          },
          "status": {
            "introHint": "ゲージをタイミング良く止めてストライクを狙おう！",
            "framePlayer": "第{frame}フレーム あなたの番です。",
            "frameCpu": "第{frame}フレーム CPUの番です…",
            "remainingPins": "残りピン: {count} 本。もう一投！",
            "playerStrike": "ストライク！",
            "cpuStrike": "CPUがストライク！",
            "victory": "勝利！ スコア {player} - {cpu}",
            "draw": "引き分け… スコア {player} - {cpu}",
            "defeat": "敗北… スコア {player} - {cpu}"
          },
          "stage": {
            "aim": {
              "prompt": "狙いゲージが往復中…止めるタイミングでボタン！",
              "button": "🛑 狙いを止める",
              "confirm": "狙い位置を {value} にセット！"
            },
            "curve": {
              "prompt": "カーブゲージ調整中…ボタンでストップ！",
              "button": "🛑 カーブを止める",
              "confirm": "カーブ量は {value} に決定！"
            },
            "power": {
              "prompt": "パワーゲージを注視…ボタンで投球！",
              "button": "🛑 パワーを止める",
              "confirm": "パワー {value} で投球！"
            }
          },
          "logs": {
            "playerShot": "あなた: aim {aim}, curve {curve}, power {power}% → <strong>{pins}</strong>",
            "cpuShot": "CPU: aim {aim}, curve {curve}, power {power}% → <strong>{pins}</strong>",
            "victory": "<strong>勝利！</strong> +{exp}EXP",
            "draw": "<strong>引き分け</strong> +{exp}EXP",
            "defeat": "<strong>敗北</strong> +{exp}EXP"
          }
        },
      "treasureHunt": {
          "ui": {
            "mapTitle": "マップ",
            "start": "探索開始",
            "pause": "一時停止",
            "hint": "WASD/矢印で移動。宝箱と自分の距離が遠いほど基礎EXPが増え、素早く拾うほど倍率が上がります。"
          },
          "labels": {
            "round": "ラウンド: {value}",
            "time": "タイム: {value}",
            "distance": "距離: {value}",
            "totalExp": "合計EXP: {value}",
            "timeValue": "{value}s",
            "distanceValue": "{value}マス",
            "none": "-",
            "lastResult": "前回 {time} で {exp}EXP 獲得{best}",
            "bestSuffix": " / ベスト {time}"
          },
          "status": {
            "preparing": "ステージを生成します…",
            "generating": "ステージ生成中…",
            "generateFailed": "ステージ生成に失敗しました",
            "noApi": "ダンジョンAPIが利用できません",
            "placingFailed": "生成したマップで宝配置に失敗…再生成します",
            "ready": "ラウンド{round} 開始位置に移動しました",
            "running": "ラウンド{round} 探索中…",
            "paused": "一時停止中",
            "found": "宝を発見！次のラウンドを生成中…"
          }
        },
        "logs": {
          "playerShot": "あなた: aim {aim}, curve {curve}, power {power}% → <strong>{pins}</strong>",
          "cpuShot": "CPU: aim {aim}, curve {curve}, power {power}% → <strong>{pins}</strong>",
          "victory": "<strong>勝利！</strong> +{exp}EXP",
          "draw": "<strong>引き分け</strong> +{exp}EXP",
          "defeat": "<strong>敗北</strong> +{exp}EXP"
        }
      },
    },
      "games": {
        "bowlingDuel": {
          "title": "ボウリング対決 MOD",
          "legend": "ボタンを押して狙い→カーブ→パワーの順にゲージを止め、投球しよう！",
          "history": {
            "title": "ログ",
            "placeholder": "---"
          },
          "buttons": {
            "throw": "🎳 ボールを投げる",
            "reset": "🔄 リセット",
            "throwing": "🎳 投球中…"
          },
          "scoreboard": {
            "you": "あなた",
            "cpu": "CPU",
            "total": "合計"
          },
          "sliders": {
            "aim": {
              "label": "狙い位置",
              "center": "中央",
              "right": "右 {value}",
              "left": "左 {value}"
            },
            "curve": {
              "label": "カーブ量",
              "none": "なし",
              "right": "右曲がり {value}",
              "left": "左曲がり {value}"
            },
            "power": {
              "label": "投球パワー",
              "format": "{value}%"
            }
          },
          "status": {
            "introHint": "ゲージをタイミング良く止めてストライクを狙おう！",
            "framePlayer": "第{frame}フレーム あなたの番です。",
            "frameCpu": "第{frame}フレーム CPUの番です…",
            "remainingPins": "残りピン: {count} 本。もう一投！",
            "playerStrike": "ストライク！",
            "cpuStrike": "CPUがストライク！",
            "victory": "勝利！ スコア {player} - {cpu}",
            "draw": "引き分け… スコア {player} - {cpu}",
            "defeat": "敗北… スコア {player} - {cpu}"
          },
          "stage": {
            "aim": {
              "prompt": "狙いゲージが往復中…止めるタイミングでボタン！",
              "button": "🛑 狙いを止める",
              "confirm": "狙い位置を {value} にセット！"
            },
            "curve": {
              "prompt": "カーブゲージ調整中…ボタンでストップ！",
              "button": "🛑 カーブを止める",
              "confirm": "カーブ量は {value} に決定！"
            },
            "power": {
              "prompt": "パワーゲージを注視…ボタンで投球！",
              "button": "🛑 パワーを止める",
              "confirm": "パワー {value} で投球！"
            }
          },
          "logs": {
            "playerShot": "あなた: aim {aim}, curve {curve}, power {power}% → <strong>{pins}</strong>",
            "cpuShot": "CPU: aim {aim}, curve {curve}, power {power}% → <strong>{pins}</strong>",
            "victory": "<strong>勝利！</strong> +{exp}EXP",
            "draw": "<strong>引き分け</strong> +{exp}EXP",
            "defeat": "<strong>敗北</strong> +{exp}EXP"
          }
        },
        "timer": {
          "header": {
            "title": "タイマー",
            "subtitle": "カウントダウンやストップウォッチで集中時間や休憩をスマートに管理"
          },
          "xpBadge": "今回獲得 {formattedXp} EXP",
          "modes": {
            "countdown": "カウントダウン",
            "stopwatch": "ストップウォッチ"
          },
          "inputs": {
            "hours": "時間",
            "minutes": "分",
            "seconds": "秒"
          },
          "quickButtons": {
            "addMinutes": "+{minutes}分",
            "subtractMinutes": "-{minutes}分",
            "pomodoro": "{minutes}分ポモドーロ"
          },
          "controls": {
            "start": "開始",
            "pause": "一時停止",
            "resume": "再開",
            "reset": "リセット"
          },
          "status": {
            "ready": "準備完了",
            "countdownReady": "カウントダウンの準備完了",
            "stopwatchReady": "ストップウォッチの準備完了",
            "countdownRunning": "カウント中…",
            "resumed": "再開しました",
            "paused": "一時停止中",
            "stopwatchRunning": "計測中…",
            "stopwatchMinuteAwarded": "{minutes}分経過！",
            "stopwatchMinute": "{minutes}分経過",
            "completed": "完了！お疲れさまでした"
          },
          "history": {
            "title": "最近のログ",
            "labels": {
              "complete": "完了",
              "start": "開始",
              "stopwatchMinute": "経過",
              "generic": "達成"
            },
            "xpAward": "{label}: +{formattedXp} EXP",
            "timerComplete": "タイマー完了！"
          }
        },
        "diagramMaker": {
          "errors": {
            "containerMissing": "MiniExp Diagram Maker を表示するコンテナが必要です",
            "pngSignature": "PNG署名を認識できませんでした",
            "pngDataMissing": "PNG内にdraw.ioデータが見つかりませんでした",
            "inflateUnsupported": "圧縮データの展開に対応していない環境です",
            "parseXml": "XMLを解析できませんでした",
            "diagramMissing": "diagram 要素が見つかりません",
            "mxGraphMissing": "mxGraphModel が見つかりません",
            "diagramDecodeFailed": "diagram データを展開できませんでした",
            "mxGraphRootMissing": "mxGraphModel root が見つかりません",
            "loadFailed": "読み込みに失敗しました: {error}",
            "saveFailed": "保存に失敗しました: {error}",
            "exportFailed": "書き出しに失敗しました: {error}"
          },
          "defaults": {
            "fileName": "未保存の図.drawio",
            "layerName": "レイヤー {index}",
            "pageName": "ページ {index}",
            "textPlaceholder": "テキスト",
            "nodePlaceholder": "新しいノード"
          },
          "tools": {
            "select": "選択",
            "rectangle": "四角",
            "ellipse": "楕円",
            "text": "テキスト",
            "connector": "コネクタ",
            "delete": "削除"
          },
          "actions": {
            "new": "新規",
            "open": "開く",
            "save": "保存",
            "export": "書き出し",
            "exportFormat": "{formatLabel} で書き出し",
            "undo": "元に戻す",
            "redo": "やり直す"
          },
          "sections": {
            "properties": "プロパティ"
          },
          "fields": {
            "x": "X",
            "y": "Y",
            "width": "幅",
            "height": "高さ",
            "fill": "塗り",
            "stroke": "線",
            "strokeWidth": "線幅",
            "textColor": "文字色",
            "fontSize": "文字サイズ",
            "text": "テキスト"
          },
          "toggles": {
            "grid": "グリッド",
            "snap": "スナップ"
          },
          "labels": {
            "exp": "EXP: {value}"
          },
          "confirm": {
            "newDocument": "保存されていない変更があります。新規作成しますか？"
          }
        },
        "sugorokuLife": {
        "ui": {
          "currencySuffix": "G",
          "expUnit": "EXP",
          "expAmount": "{formatted} {unit}",
          "hud": {
            "turn": "ターン",
            "money": "所持金",
            "salary": "年収(概算)",
            "exp": "獲得EXP"
          },
          "controls": {
            "roll": "サイコロを振る",
            "restart": "もう一度プレイ"
          },
          "welcome": {
            "title": "ようこそ人生すごろくへ",
            "message": "サイコロを振ってコマを進め、イベントの結果でEXPを獲得しましょう。"
          },
          "log": {
            "title": "出来事ログ",
            "noMoneyDelta": "±0G",
            "expText": "EXP {formatted}",
            "meta": "{money} / {exp}"
          },
          "event": {
            "expText": "EXP {formatted}",
            "delta": "{money} / {exp}"
          },
          "summary": {
            "rank": "最終ランク {grade}",
            "money": "最終所持金: {money}",
            "bonus": "ボーナスEXP: {formatted}",
            "total": "累計獲得EXP: {formatted}"
          },
          "restart": {
            "title": "再スタート！",
            "message": "もう一度人生を駆け抜けましょう。"
          }
        },
        "board": {
          "start": { "label": "スタート", "sub": "キャリアの幕開け" },
          "orientation": { "label": "キャリア設計", "sub": "将来をイメージ" },
          "chance": {
            "label": "チャンスカード",
            "unknown": "未知の出来事",
            "mixed": "良くも悪くも",
            "fate": "運命の一枚",
            "twist": "予想外の展開",
            "shift": "状況一変"
          },
          "sidejob": { "label": "副業準備", "sub": "週末プロジェクト" },
          "travel": { "label": "リフレッシュ旅行", "sub": "感性が磨かれる" },
          "salary": { "label": "給料日", "sub": "努力の実り" },
          "family": { "label": "家族イベント", "sub": "大切な時間" },
          "qualification": { "label": "資格取得", "sub": "勉強の成果" },
          "living": { "label": "生活費", "sub": "固定費の支払い" },
          "health": { "label": "健康診断", "sub": "体調を見直す" },
          "project": { "label": "大型プロジェクト", "sub": "責任重大" },
          "donation": { "label": "社会貢献", "sub": "寄付活動" },
          "payday": { "label": "昇給ボーナス", "sub": "成果が評価された" },
          "mentor": { "label": "メンタリング", "sub": "後輩育成" },
          "expense": { "label": "突発出費", "sub": "想定外の修理" },
          "team": { "label": "チームビルド", "sub": "信頼を築く" },
          "innovation": { "label": "新規事業提案", "sub": "挑戦のとき" },
          "tax": { "label": "税金の支払い", "sub": "社会の一員として" },
          "festival": { "label": "地域フェス", "sub": "人脈を広げる" },
          "savings": { "label": "資産運用", "sub": "堅実に増やす" },
          "final": { "label": "ゴール", "sub": "人生の集大成" }
        },
        "events": {
          "start": { "title": "社会人生活スタート！", "message": "初任給で生活の基盤を整えよう。" },
          "orientation": { "title": "キャリアプランを描いた", "message": "自己分析セミナーで視界がクリアに。将来の基礎が固まった。" },
          "sidejob": { "title": "副業プロジェクト始動", "message": "学んだスキルを活かした副業で早速収益が発生！" },
          "travel": { "title": "旅で感性が豊かに", "message": "景色と文化に触れて視野が拡大した。" },
          "salary": { "title": "給料日！", "message": "今月も頑張った。生活費と貯蓄をバランスよく管理しよう。" },
          "family": { "title": "家族との思い出", "message": "大切な時間はプライスレス。心が満たされた。" },
          "qualification": { "title": "資格を取得！", "message": "専門資格で年収がアップ。今後の給料に反映される。" },
          "living": { "title": "生活費を支払った", "message": "節約術を磨けばもっと余裕が生まれるかも。" },
          "health": { "title": "健康診断で安心", "message": "定期的なケアで万全の体制。将来のリスクを減らせる。" },
          "project": { "title": "大型案件を成功させた", "message": "チームを率いて成果を出し、大幅昇給のチャンス！" },
          "donation": { "title": "地域へ寄付した", "message": "社会貢献で得た信頼が今後の活動にもプラスに働きそう。" },
          "payday": { "title": "昇給ボーナス獲得！", "message": "努力が認められ年収がさらにアップ。" },
          "mentor": { "title": "後輩のメンターに", "message": "人を育てる経験は自分の成長にもつながる。" },
          "expense": { "title": "突発的な修理費", "message": "冷静に対応して被害を最小限に抑えた。" },
          "team": { "title": "チームビルディング合宿", "message": "チームの絆が深まりプロジェクトが進めやすくなった。" },
          "innovation": { "title": "新規事業がヒット", "message": "市場のニーズを読み切り、部署の柱となる事業が完成した。" },
          "tax": { "title": "税金を納めた", "message": "社会への還元。次のチャンスに備えて家計を見直そう。" },
          "festival": { "title": "地域フェスで交流", "message": "人脈が広がり次の仕事のヒントを得た。" },
          "savings": { "title": "資産運用が好調", "message": "分散投資が功を奏し堅実に資産が増えた。" },
          "goal": {
            "logTitle": "ゴール！",
            "logDetail": "最終資産 {money} / グレード{grade} / 追加EXP {bonusFormatted}",
            "title": "人生の総決算",
            "message": "最終資産 {money}。グレード{grade}達成！所持金に応じたボーナスEXPを獲得しました。"
          }
        },
        "chance": {
          "startup": { "label": "スタートアップ投資", "description": "先見の明で投資したスタートアップが大成功！" },
          "travel": { "label": "世界一周の旅", "description": "人生経験は増えたが旅費がかさんだ。" },
          "innovation": { "label": "イノベーション賞", "description": "社内ハッカソンで優勝し賞金を獲得！" },
          "carRepair": { "label": "車の修理費", "description": "突然の故障で修理費が必要になった……。" },
          "mentor": { "label": "メンターとの出会い", "description": "優秀なメンターに出会いキャリアが開けた。" },
          "sideBusiness": { "label": "副業ヒット", "description": "週末に始めた副業が話題になり売上が伸びた！" },
          "medicalBill": { "label": "医療費の支払い", "description": "体調を崩して入院。治療費は痛い出費だが健康第一。" },
          "community": { "label": "地域イベント主催", "description": "地域イベントの主催で感謝され、経験も積めた。" },
          "award": { "label": "年間表彰", "description": "社内年間表彰で表彰金を獲得！" },
          "market": { "label": "相場急落", "description": "投資していた銘柄が急落。冷静に受け止めよう。" }
        }
      },
      "triominoColumns": {
      "menu": {
        "title": "トリオミノコラムス",
        "subtitle": "モードを選んでください",
        "options": {
          "endless": {
            "label": "ENDLESS - ゲームオーバーまで",
            "description": "基本のひとり用モード"
          },
          "vsCpu": {
            "label": "VS.RIVAL - CPU戦",
            "description": "GEARSキャラクター達と対戦"
          },
          "vs2p": {
            "label": "VS.2P - ふたりで対戦",
            "description": "ローカル対戦用（WASD + JK）"
          }
        }
      },
      "cpuSelect": {
        "title": "VS.RIVAL - 対戦相手選択",
        "subtitle": "挑戦したいライバルを選んでください",
        "detail": "速さLv.{speedLevel} / 攻撃性 {aggression}%",
        "hint": "※ ハグルマンレディは連勝で解放。？？？はノーコンティニュー＆15分以内で解放。",
        "back": "← モード選択に戻る",
        "lockReasons": {
          "lady": "条件: 連勝でハグルマン軍を突破",
          "hidden": "条件: ノーコンティニュー15分以内で解放",
          "default": "条件: 直前のライバルに勝利"
        },
        "rivals": {
          "0": { "name": "カラクリン" },
          "1": { "name": "ハグルマンJr." },
          "2": { "name": "からくり忍者" },
          "3": { "name": "ハグルマン2号" },
          "4": { "name": "ハグルマン3号" },
          "5": { "name": "シャドウハグル" },
          "6": { "name": "ハグルマンレディ" },
          "7": { "name": "？？？" }
        }
      },
      "marks": {
        "sun": "太陽",
        "leaf": "葉っぱ",
        "aqua": "しずく",
        "berry": "ベリー",
        "rose": "ローズ",
        "amber": "アンバー"
      },
      "blocks": {
        "multi": "マルチ"
      },
      "messages": {
        "garbageAttack": "{target}におじゃま!",
        "lineSpark": "ラインスパーク!",
        "vs2pStart": "VS 2P スタート!",
        "vsCpuStart": "VS RIVAL: {name}",
        "combo": "{target}: {combo}連鎖!"
      },
      "floating": {
        "clear": "{count} CLEAR",
        "combo": "{combo}連鎖!",
        "spark": "SPARK!"
      },
      "boards": {
        "player": "プレイヤー",
        "p1": "P1",
        "p2": "P2"
      },
      "results": {
        "gameOver": "Game Over",
        "victoryTitle": "{name} 勝利!",
        "drawTitle": "引き分け",
        "endlessStats": "ライン {lines} / コンボ {combos} / スパーク {spark}",
        "buttons": {
          "retryEndless": "もう一度ENDLESS",
          "backToMenu": "モード選択に戻る"
        },
        "vsCpu": {
          "victoryMessage": "勝利！タイム {duration}秒 / 総経過 {total}秒",
          "defeatMessage": "敗北… タイム {duration}秒",
          "nextRival": "次のライバル ({name})",
          "retrySame": "同じ相手に再挑戦",
          "backToSelect": "対戦相手選択に戻る"
        },
        "vs2p": {
          "retry": "もう一度対戦",
          "hint": "キーボード同士で再戦できます。"
        }
      },
      "panel": {
        "next": "NEXT",
        "hold": "HOLD",
        "stats": "STATS",
        "lines": "ライン: {value}",
        "combo": "コンボ: {value}",
        "spark": "スパーク: {value}",
        "attack": "アタック: {value}"
      },
      "miniStats": {
        "lines": "ライン {value}",
        "comboSpark": "コンボ {combo} / スパーク {spark}"
      },
      "modeLabels": {
        "endless": "ENDLESS モード",
        "vsCpu": "VS.RIVAL モード",
        "vs2p": "VS.2P モード"
      }
      },
      "treasureHunt": {
        "ui": {
          "mapTitle": "マップ",
          "start": "探索開始",
          "pause": "一時停止",
          "hint": "WASD/矢印で移動。宝箱と自分の距離が遠いほど基礎EXPが増え、素早く拾うほど倍率が上がります。",
          "hintNoMap": "WASD/矢印で移動。宝箱と自分の距離が遠いほど基礎EXPが増えます。NORMAL以上ではマップが非表示なのでステータスのヒントを頼りに探索しましょう。"
        },
        "labels": {
          "round": "ラウンド: {value}",
          "time": "タイム: {value}",
          "distance": "距離: {value}",
          "totalExp": "合計EXP: {value}",
          "timeValue": "{value}s",
          "distanceValue": "{value}マス",
          "none": "-",
          "lastResult": "前回 {time} で {exp}EXP 獲得{best}",
          "bestSuffix": " / ベスト {time}"
        },
        "status": {
          "preparing": "ステージを生成します…",
          "generating": "ステージ生成中…",
          "generateFailed": "ステージ生成に失敗しました",
          "noApi": "ダンジョンAPIが利用できません",
          "placingFailed": "生成したマップで宝配置に失敗…再生成します",
          "ready": "ラウンド{round} 開始位置に移動しました",
          "running": "ラウンド{round} 探索中…",
          "paused": "一時停止中",
          "found": "宝を発見！次のラウンドを生成中…"
        }
      },
      "todoList": {
        "defaults": {
          "untitled": "名称未設定"
        },
        "header": {
          "title": "ToDoリスト",
          "today": "{date}",
          "stats": "未完了: {pending}件 / 完了: {completed}件"
        },
        "form": {
          "titleCreate": "新規ToDoを登録",
          "titleEdit": "ToDoを編集",
          "name": "名前",
          "namePlaceholder": "例: 日次レポートを送信",
          "xp": "獲得EXP",
          "color": "カラー",
          "memo": "メモ",
          "memoPlaceholder": "補足情報やチェックポイントなどを入力",
          "submitCreate": "追加",
          "submitUpdate": "更新",
          "cancel": "キャンセル"
        },
        "sections": {
          "pending": "未完了タスク",
          "completed": "完了済みタスク",
          "emptyPending": "未完了のToDoはありません。",
          "emptyCompleted": "完了したToDoはまだありません。"
        },
        "task": {
          "xpChip": "{xp} EXP",
          "memoEmpty": "メモなし",
          "createdAt": "登録: {date}",
          "completedAt": "完了: {date}",
          "statusCompleted": "成功",
          "statusFailed": "失敗",
          "actions": {
            "complete": "完了",
            "fail": "失敗",
            "edit": "編集",
            "delete": "削除"
          }
        },
        "dialogs": {
          "confirmDelete": "このToDoを削除しますか？",
          "requireName": "名前を入力してください。"
        }
      },
      "notepad": {
        "defaultFileName": "タイトルなし.txt",
        "confirm": {
          "discardChanges": "変更を破棄して閉じますか？",
          "newWithoutSaving": "変更を保存せずに新しいファイルを開きますか？"
        },
        "menu": {
          "file": "ファイル",
          "edit": "編集",
          "view": {
            "label": "表示",
            "enableWordWrap": "折り返しを有効化",
            "disableWordWrap": "折り返しを無効化",
            "showStatusBar": "ステータスバーを表示",
            "hideStatusBar": "ステータスバーを非表示"
          },
          "fileNew": "新規",
          "fileOpen": "開く...",
          "fileSave": "上書き保存",
          "fileSaveAs": "名前を付けて保存...",
          "filePrint": "印刷...",
          "editUndo": "元に戻す",
          "editRedo": "やり直し",
          "editCut": "切り取り",
          "editCopy": "コピー",
          "editPaste": "貼り付け",
          "editDelete": "削除",
          "editFind": "検索...",
          "editReplace": "置換...",
          "editSelectAll": "すべて選択",
          "viewZoomIn": "ズームイン",
          "viewZoomOut": "ズームアウト",
          "viewZoomReset": "ズームを既定に戻す"
        },
        "commands": {
          "heading": "見出しを切り替え",
          "bullet": "箇条書きを切り替え",
          "bold": "太字 (Markdown)",
          "italic": "斜体 (Markdown)",
          "underline": "下線タグ",
          "wordWrap": "折り返しを切り替え",
          "zoomReset": "ズームを既定に戻す",
          "settings": "設定"
        },
        "settings": {
          "title": "設定",
          "wordWrap": "折り返し",
          "statusBar": "ステータスバー",
          "zoom": "ズーム",
          "zoomReset": "リセット",
          "insertTimestamp": "日時を挿入"
        },
        "prompts": {
          "search": "検索する文字列を入力してください",
          "saveFileName": "保存するファイル名を入力してください",
          "replaceTarget": "置換する文字列を入力してください",
          "replaceWith": "置換後の文字列を入力してください"
        },
        "alerts": {
          "searchNotFound": "見つかりませんでした。",
          "replaceNotFound": "対象の文字列が見つかりませんでした。",
          "fileReadFailed": "ファイルの読み込みに失敗しました。",
          "printPopupBlocked": "印刷ウィンドウを開けませんでした。ポップアップを許可してください。"
        },
        "print": {
          "label": "印刷",
          "windowTitleFallback": "メモ帳"
        },
        "status": {
          "position": "行 {line}, 列 {column}",
          "length": "{count} 文字",
          "typeText": "テキスト",
          "lineEnding": {
            "lf": "Unix (LF)",
            "crlf": "Windows (CRLF)"
          }
        },
        "timestamp": {
          "pattern": "{year}-{month}-{day} {hour}:{minute}:{second}"
        }
      }
    }

  };
  var mathLabLocale = (locale.games && locale.games.math_lab) ? locale.games.math_lab : {};
  locale.mathLab = mathLabLocale;
  if (locale.games) {
    locale.games.mathLab = mathLabLocale;
  }
  store['ja'] = locale;
  if (!store['ja']) {
    store['ja'] = {};
  }
  if (!store['ja'].games) {
    store['ja'].games = {};
  }
  var jaGames = store['ja'].games;
  if (!jaGames.stopwatch) {
    jaGames.stopwatch = {
      "header": {
        "title": "ストップウォッチ Pro"
      },
      "statusBadge": {
        "running": "計測中",
        "stopped": "停止中"
      },
      "info": {
        "lapCount": "ラップ: {count}",
        "lastLap": "前ラップ: {time}",
        "lastLapNone": "前ラップ: -",
        "sessionXp": "セッションEXP: {xp}"
      },
      "buttons": {
        "start": "スタート",
        "pause": "一時停止",
        "resume": "再開",
        "lap": "ラップ",
        "reset": "リセット"
      },
      "laps": {
        "title": "ラップ記録",
        "subtitle": "最新順に表示",
        "empty": "ラップを記録するとここに表示されます",
        "label": "ラップ {index}"
        }
      };
  }
  if (!jaGames.wording) {
    jaGames.wording = {
        "name": "Wording",
        "description": "編集+1 / 書式+2 / 保存+6 EXP のワープロ",
        "defaultTitle": "文書1",
        "autoTitle": "文書{formattedNumber}",
        "quickBar": {
          "open": "開く (Ctrl+O)",
          "save": "上書き保存 (Ctrl+S)",
          "saveAs": "名前を付けて保存 (Ctrl+Shift+S)",
          "undo": "元に戻す (Ctrl+Z)",
          "redo": "やり直し (Ctrl+Y)",
          "print": "印刷"
        },
        "tabs": {
          "home": "ホーム",
          "insert": "挿入",
          "layout": "レイアウト",
          "review": "校閲",
          "view": "表示"
        },
        "groups": {
          "clipboard": "クリップボード",
          "font": "フォント",
          "paragraph": "段落",
          "style": "スタイル",
          "insert": "挿入",
          "media": "メディア",
          "theme": "テーマ",
          "columns": "列",
          "margins": "余白",
          "proofing": "校閲ツール",
          "comments": "コメント",
          "lineHeight": "行間",
          "guides": "ガイド",
          "paper": "紙の色"
        },
        "buttons": {
          "rename": "名前の変更",
          "paste": "貼り付け",
          "copy": "コピー",
          "cut": "切り取り",
          "bold": "太字",
          "italic": "斜体",
          "underline": "下線",
          "strikethrough": "取り消し線",
          "superscript": "上付き",
          "subscript": "下付き",
          "bullets": "箇条書き",
          "numberedList": "番号付きリスト",
          "alignLeft": "左揃え",
          "alignCenter": "中央揃え",
          "alignRight": "右揃え",
          "alignJustify": "両端揃え",
          "outdent": "インデント解除",
          "indent": "インデント追加",
          "blockParagraph": "本文",
          "blockHeading": "見出し {level}",
          "blockQuote": "引用",
          "insertDate": "日付",
          "insertTime": "時刻",
          "insertHorizontalRule": "横罫線",
          "insertEmoji": "スタンプ",
          "insertImage": "画像",
          "insertTextbox": "テキストボックス",
          "insertToc": "目次",
          "commentInsert": "コメント挿入",
          "changeSummary": "変更サマリ",
          "wordCount": "文字数カウント",
          "readingTime": "読了目安",
          "reviewHighlightOn": "長文検出",
          "reviewHighlightOff": "長文解除",
          "columnsOption": "{formattedCount} 列",
          "lineHeightOption": "{formattedValue} 倍",
          "marginNarrow": "狭い",
          "marginNormal": "標準",
          "marginWide": "広い",
          "themeLight": "ライト",
          "themeDark": "ダーク紙",
          "showRuler": "ルーラー表示",
          "hideRuler": "ルーラー非表示",
          "showStatus": "ステータス表示",
          "hideStatus": "ステータス隠す",
          "paperWhite": "ホワイト",
          "paperCream": "クリーム",
          "paperGray": "グレー",
          "zoomOut": "ズームアウト",
          "zoomIn": "ズームイン"
        },
        "messages": {
          "printUnavailable": "印刷ダイアログは近日対応予定です",
          "noContent": "本文がありません",
          "wordCount": "文字数: {characters} / 単語: {words} / 段落: {paragraphs}",
          "readingTime": "およそ {minutes} 分 {secondsPadded} 秒で読めます",
          "changeSummarySaved": "保存済み: 差分はありません",
          "changeSummaryDiff": "未保存の差分目安: 約 {difference} 文字"
        },
        "prompts": {
          "rename": "文書名を入力してください",
          "saveFile": "保存するファイル名 (.wording.html)",
          "comment": "コメントを入力してください"
        },
        "confirm": {
          "closeWithoutSave": "保存せずに閉じますか？",
          "newWithoutSave": "保存されていない変更があります。新規作成しますか？"
        },
        "fonts": {
          "yuGothic": "游ゴシック",
          "yuMincho": "游明朝",
          "meiryo": "メイリオ",
          "hiraginoKaku": "ヒラギノ角ゴ",
          "monospace": "等幅 (Consolas)"
        },
        "fontSize": {
          "option": "{formattedSize} pt"
        },
        "insert": {
          "tocTemplate": "<ol><li>はじめに</li><li>本題</li><li>まとめ</li></ol>",
          "textboxLabel": "テキストボックス"
        },
        "editor": {
          "welcomeHtml": "<p>ようこそ、Wording へ！ここで文章作成を始めましょう。</p>",
          "newDocumentHtml": "<p>新しい文書を開始しましょう。</p>"
        },
        "status": {
          "summary": "ページ {pageCurrent} / {pageTotal} | 文字数: {characters} | 単語: {words}"
        },
        "search": {
          "title": "検索と置換",
          "placeholder": "検索語",
          "replacePlaceholder": "置換文字列",
          "enterQuery": "検索語を入力してください",
          "noMatch": "一致はありません",
          "next": "次を検索",
          "replace": "置換",
          "replaceAll": "すべて置換",
          "close": "閉じる",
          "replacedCount": "{count} 件置換しました",
          "progress": "全{total}件中 {current}件目"
        }
      };
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);

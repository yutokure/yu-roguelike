(function (root) {
  if (!root) return;
  var store = root.__i18nLocales = root.__i18nLocales || {};
  var locale =
  {
    "meta": {
      "title": "Yu Roguelike"
    },
    "header": {
      "title": "Yu Roguelike",
      "manual": "阅读手册",
      "minigameManual": "阅读迷你游戏手册"
    },
    "ui": {
      "language": {
        "label": "语言",
        "ariaLabel": "语言选择器",
        "option": {
          "ja": "日语",
          "en": "英语",
          "fr": "法语",
          "zh": "简体中文",
          "ko": "韩语"
        }
      },
      "runResult": {
        "title": "结果",
        "reason": {
          "gameOver": "游戏结束",
          "clear": "地牢通关",
          "retreat": "地牢撤退",
          "return": "运行摘要"
        },
        "stats": {
          "level": "等级",
          "totalExp": "获得的总经验值",
          "totalDamage": "受到的总伤害",
          "healingItems": "使用的治疗物品"
        },
        "actions": {
          "return": "返回基地",
          "retry": "重试"
        },
        "onigokko": {
          "timer": {
            "remaining": "剩余时间：{seconds}s"
          },
          "status": {
            "start": "追逐开始！使用箭头键/WASD 移动。",
            "paused": "已暂停",
            "loading": "加载阶段…",
            "ready": "准备好了！按开始开始追逐。",
            "stage_generation_failed": "阶段生成失败",
            "api_unavailable": "地下城API不可用",
            "caught": "捕获！",
            "caught_no_reward": "捕获！没有获得经验值。",
            "escaped": "逃脱！干得好！",
            "escape_success": "转义成功！"
          }
        }
      }
    },
    "messages": {
      "domainCrystal": {
        "spawn": "本层出现了神秘的领域水晶...！"
      },
      "domainEffect": {
        "enter": "进入领域效应“{label}”的影响！",
        "exit": "离开领域效果的影响。"
      },
      "domain": {
        "poisonNegated": "域效应使毒药伤害无效！",
        "poisonReversed": "毒药的疼痛逆转并恢复{amount} HP！",
        "poisonDamage": "毒药造成{amount}伤害！",
        "rareChestGuarded": "金色宝箱爆炸，但域效应保护了你！",
        "rareChestReversed": "金色宝箱爆炸逆转并恢复 {amount} 生命值！",
        "rareChestDamage": "金箱爆炸！生命值减少{damage}（计时关闭{timing}%）。",
        "rareChestDeath": "陷入金色宝箱爆炸...游戏结束。",
        "damageBlocked": "领域效应阻止你造成伤害...",
        "enemyHealed": "领域效果治疗敌人{amount}！",
        "poisonFloorNegated": "领域效果使毒层伤害无效！",
        "poisonFloorReversed": "毒层能量反转并恢复 {amount} HP！",
        "poisonFloorDamage": "有毒地板造成伤害！生命值减少{amount}。",
        "poisonFloorDeath": "毒地板打败了你...游戏结束。",
        "bombGuarded": "领域效应阻挡爆炸！",
        "bombReversed": "爆炸力反转并恢复{amount} HP！",
        "bombDamage": "炸弹爆炸了！ HP减少{amount}。",
        "bombDeath": "捕获 在炸弹爆炸中...游戏结束。",
        "bombSafe": "炸弹爆炸，但你没有受到任何伤害！",
        "enemyAttackGuarded": "域效应保护你免受损坏！",
        "enemyAttackReversed": "领域效果将敌人的攻击转化为治疗！恢复{amount} HP。"
      },
      "skills": {
        "cannotUse": "无法使用技能：{reason}",
        "notEnoughSp": "SP不够。",
        "genericKill": "击败敌人！",
        "effects": {
          "applied": "{label}已激活！ （{turns} 转）",
          "gimmickNullifyExpired": "噱头无效化消失。",
          "statusGuardExpired": "状态屏障消失。",
          "enemyNullifyExpired": "效果密封已磨损 ",
          "sureHitExpired": "必胜效果结束。"
        },
        "breakWall": {
          "noWall": "前面没有可打破的墙。",
          "notBreakable": "那堵墙无法被摧毁。",
          "success": "SP技能：墙壁被打碎！"
        },
        "buildWall": {
          "noFloor": "前面没有地板可以变成墙。",
          "cannotBuild": "你不能在那里创建墙。",
          "success": "SP技能：一堵墙被创建了！"
        },
        "gimmickNullify": {
          "tooHard": "这个副本太难了——机关无效化没有效果……"
        },
        "stairWarp": {
          "noDestination": "楼梯附近没有安全的扭曲目的地。",
          "success": "在楼梯旁边扭曲！"
        },
        "strongStrike": {
          "noTarget": "没有敌人可以释放力量打击。",
          "sureHitFailed": "敌人等级太高——必中失败...",
          "miss": "错过了电源罢工。",
          "damage": "强力打击造成{damage}伤害！",
          "kill": "用强力打击击败敌人！"
        },
        "rangedAttack": {
          "noTarget": "远程攻击范围内没有敌人。",
          "miss": "远程攻击未击中...",
          "damage": "远程攻击造成{damage}伤害！",
          "kill": "用远程攻击击败敌人！"
        },
        "areaSkill": {
          "noTargets": "范围内没有敌人。",
          "activated": "使用{skillName}！",
          "sureHitFailed": "高等级敌人抵抗 效果...",
          "kill": "用{skillName}击败敌人！",
          "noneHit": "它 无人命中……"
        },
        "floorSkill": {
          "noTargets": "没有目标敌人。",
          "activated": "释放{skillName}！",
          "sureHitFailed": "高级别敌人不受影响...",
          "kill": "用{skillName}击败敌人！",
          "noneHit": "它没有对任何人造成伤害。"
        },
        "ruinAnnihilation": {
          "start": "释放毁灭之力！",
          "kill": "消灭敌人带着毁灭性的火焰！",
          "resisted": "一些高级敌人抵抗了 毁了...",
          "cleared": "地牢的墙壁和机关消失了！"
        }
      }
    },
    "skills": {
      "meta": {
        "currentSp": "当前SP：{value}",
        "currentSpLabel": "当前SP",
        "costAndCurrent": "SP成本：{cost} /电流：{current}",
        "reasonSuffix": "({reason})",
        "remainingTurns": "活动：{turns}向左转动",
        "use": "使用"
      },
      "modal": {
        "title": "技能"
      },
      "availability": {
        "unlockLevel": "Lv100解锁",
        "maxSpShortage": "SP上限太低",
        "notEnoughSp": "SP不足",
        "tooHard": "在此难度下无效",
        "noWallAhead": "前面没有墙",
        "noFloorAhead": "前方没有楼层",
        "noRangedTarget": "没有可到达的目标",
        "noFrontEnemy": "前方无敌人",
        "noAreaTargets": "范围内没有敌人",
        "noEnemies": "没有敌人在场",
        "noWarpDestination": "没有扭曲目的地",
        "notYourTurn": "轮不到你",
        "paralyzed": "瘫痪"
      },
      "effects": {
        "gimmickNullify": {
          "label": "噱头无效"
        },
        "statusGuard": {
          "label": "地位障碍"
        },
        "enemyNullify": {
          "label": "效果印章"
        },
        "sureHit": {
          "label": "必击"
        }
      },
      "breakWall": {
        "name": "破墙",
        "description": "摧毁正前方的墙壁 你。"
      },
      "buildWall": {
        "name": "创建墙",
        "description": "将你面前的地板变成墙壁。"
      },
      "rangedAttack": {
        "name": "远程攻击",
        "description": "用必击攻击对前方直线上的敌人造成三分之一的正常伤害。被墙壁阻挡。"
      },
      "gimmickNullify": {
        "name": "噱头消除器",
        "description": "使地下城噱头无效10回合。如果推荐水平超过您的水平 8 或更多，则无效。"
      },
      "statusGuard": {
        "name": "地位障碍",
        "description": "阻止所有异常状态10回合。"
      },
      "enemyNullify": {
        "name": "效果印章",
        "description": "使敌人的特殊效果无效10回合。"
      },
      "sureHit": {
        "name": "必击",
        "description": "保证普通攻击命中10回合。对高于你 8 级以上的敌人无效。"
      },
      "stairWarp": {
        "name": "楼梯扭曲",
        "description": "扭曲到与 楼梯。"
      },
      "strongStrike": {
        "name": "强力打击",
        "description": "对敌人造成3倍伤害前面。"
      },
      "areaAttack": {
        "name": "区域攻击",
        "description": "对附近敌人造成正常区域伤害。"
      },
      "surehitArea": {
        "name": "必击区域攻击",
        "description": "对附近的敌人造成一定范围的伤害。"
      },
      "strongArea": {
        "name": "强力区域攻击",
        "description": "对附近敌人造成3倍范围伤害。"
      },
      "surehitStrongArea": {
        "name": "必击威力区域",
        "description": "对附近的敌人造成必中的3倍范围伤害。"
      },
      "surehitFloor": {
        "name": "一击落地攻击",
        "description": "以必胜的攻击打击地板上的所有敌人。"
      },
      "ruinAnnihilation": {
        "name": "毁灭歼灭",
        "description": "释放对所有敌人造成 3 倍必中伤害，消除墙壁并 噱头，并索取任何宝箱。对高等级敌人无效。"
      }
    },
    "selection": {
      "title": "地下城选择",
      "difficulty": {
        "label": "难度",
        "option": {
          "veryEasy": "非常简单",
          "easy": "简单",
          "normal": "普通",
          "second": "第二",
          "hard": "困难",
          "veryHard": "非常困难"
        }
      },
      "dungeons": {
        "tooltip": "推荐等级：{level}"
      },
      "playerStatus": {
        "title": "玩家状态",
        "toggle": {
          "expand": "展开",
          "collapse": "崩溃"
        },
        "labels": {
          "level": "等级",
          "hp": "HP",
          "satiety": "饱腹感",
          "exp": "EXP",
          "sp": "SP",
          "attack": "攻击",
          "defense": "防御"
        }
      },
      "tabs": {
        "ariaLabel": "地下城选择选项卡",
        "normal": "普通",
        "blockdim": "块Dimension",
        "miniexp": "小游戏体验",
        "tools": "工具",
        "achievements": "成就与统计"
      },
      "normal": {
        "worlds": "世界",
        "dungeons": "地下城",
        "detail": {
          "name": "副本名称",
          "typeLabel": "类型：",
          "typeValue": "场",
          "recommendedLabel": "推荐级别：",
          "damageLabel": "伤害倍数：",
          "damageValue": "成交：1.6x / 成交：0.5x",
          "damageMultiplier": "交易：{deal}x / 获取：{take}x",
          "descriptionLabel": "说明：",
          "description": "地下城描述",
          "start": "进入地牢"
        }
      },
      "blockdim": {
        "nested": {
          "label": "嵌套尺寸",
          "title": "嵌套维度：推荐等级增加2600*(N-1)"
        },
        "dimension": {
          "label": "维度",
          "listLabel": "维度",
          "first": "第一",
          "second": "第2",
          "third": "第3"
        },
        "card": {
          "title": "合成预览",
          "selection": "选择",
          "level": "推荐等级",
          "type": "类型",
          "depth": "深度",
          "size": "大小",
          "chest": "宝箱",
          "boss": "Boss楼层",
          "note": "相同的选择产生相同的世代（固定种子）。",
          "gate": "大门",
          "addBookmark": "★ 添加书签",
          "addBookmarkTitle": "为当前组合添加书签",
          "clearHistory": "清除历史记录",
          "clearHistoryTitle": "清除所有门历史",
          "random": "🎲 随机选择（第一/第二/第三）",
          "randomTitle": "随机选择第1/2/3个",
          "randomTarget": "目标Lv（块 总计）",
          "randomTargetTitle": "忽略基础维度等级；只求三个方块等级的总和。",
          "randomType": "类型优先",
          "randomTypeTitle": "优先匹配类型",
          "randomTypeNone": "无偏好",
          "weightedRandom": "🎯加权随机",
          "weightedRandomTitle": "根据目标等级和类型优先级进行随机选择"
        },
        "history": {
          "title": "门历史记录",
          "empty": "尚无历史记录。",
          "entryLabel": "嵌套 {nested} | {dimension} | {block1} · {block2} · {block3}",
          "entryTooltip": "Lv{level} / {type} / 深度 {depth} / 种子 {seed}",
          "confirmClear": "清除所有门历史记录？",
          "delete": "删除"
        },
        "bookmarks": {
          "title": "区块书签",
          "empty": "还没有书签。",
          "entryTooltip": "Lv{level} / {type} / 深度 {depth} / 种子 {seed}",
          "delete": "删除"
        },
        "test": {
          "title": "地下城测试",
          "description": "用随机种子生成每个已注册的地下城类型，以验证BlockDim是否安全。如果发生无限循环，则会记录错误，并且运行永远不会完成。",
          "run": "🧪 运行地下城测试",
          "idle": "空闲",
          "status": {
            "initializing": "初始化…",
            "noTargets": "没有目标",
            "running": "奔跑({current}/{total})",
            "completedWithFailures": "完成（失败：{count}）",
            "completedSuccess": "已完成（全部通过）",
            "error": "出现错误"
          },
          "log": {
            "addonLoadError": "插件加载错误：{error}",
            "noTargets": "未找到可供测试的地下城类型。",
            "targetCount": "测试目标：{count}类型",
            "start": "▶开始{name}({id})的生成测试",
            "success": "✅成功： {name} ({id}) 种子={seed} 尺寸={width}×{height} 楼层={floors} 实际={actual}",
            "failure": "❌失败： {name} ({id})seed={seed}",
            "summary": "完成：成功{success} /失败{failure} /持续时间{duration}ms",
            "fatal": "严重错误：{error}"
          }
        },
        "hud": {
          "summary": "形状{bodyCount}/发射器{emitterCount}/布料{clothCount}/粒子{particleCount}",
          "powerGravityExp": "动力 {poweredCount} / 重力 {gravity} / EXP {exp}",
          "solver": "解算器{iterations} iter × {substeps} sub",
          "temperature": "平均温度 {average}°C / 环境 {ambient}°C / 最高 {max}°C",
          "phases": "状态固体{solid} /液体{liquid} /气体{gas}",
          "wind": "阵风{gusts} / 风发射器{emitters}"
        },
        "inspector": {
          "title": "设置",
          "world": {
            "gravityY": "重力Y ({value})",
            "airDrag": "空气阻力 ({value})",
            "iterations": "求解器迭代({value})",
            "substeps": "子步骤 ({value})",
            "ambientTemperature": "环境温度 ({value}°C)",
            "boundary": {
              "label": "边界模式",
              "options": {
                "wall": "墙壁（在边缘弹跳）",
                "void": "无效（脱落）"
              },
              "voidHint": "虚空：离开边界的物体将在移动一段距离后消失。"
            }
          },
          "noSelection": "从工具栏中添加形状并选择它们以查看详细设置。",
          "savedLayouts": {
            "title": "已保存的布局",
            "load": "加载",
            "delete": "删除"
          },
          "common": {
            "unknown": "未知"
          },
          "body": {
            "title": "身体属性",
            "state": "状态：{state}",
            "damage": "磨损：{percent}%",
            "integrity": "完整性：{percent}%",
            "stress": "压力指数：{value} kPa",
            "strain": "应变：{percent}%",
            "heatFlux": "热通量指数：{value}",
            "fracture": "断裂阈值：{threshold} / 碎片 {fragments}",
            "reactionCooldown": "反应冷却时间：{seconds}s",
            "materialPreset": "材质预设",
            "mass": "弥撒（预计{value}）",
            "angleInfo": "角度{angle}° / 角度 速度{angular} rad/s",
            "static": "制作静态",
            "restitution": "恢复原状({value})",
            "friction": "摩擦({value})",
            "wallNote": "绝对墙有固定的材料。只能更改大小和位置。",
            "radius": "半径({value})",
            "width": "宽度 ({value})",
            "height": "高度({value})",
            "color": "颜色",
            "chemical": {
              "formula": "公式：{formula}",
              "components": "组件：{list}",
              "molarMass": "摩尔质量：{mass} g/mol",
              "hazards": "属性：{list}"
            },
            "phase": {
              "solid": "可靠",
              "liquid": "液体",
              "gas": "气体"
            }
          },
          "customMaterial": {
            "alertAddElement": "请添加至少一个元素。",
            "title": "化学定制器",
            "components": "组件：{list}",
            "componentsEmpty": "组件：未添加元素",
            "formulaPreview": "公式预览：{formula}",
            "molarMass": "估计摩尔质量：{mass} g/mol",
            "suggestedDensity": "平均元素密度：{average}（当前{current}）",
            "removeComponent": "删除",
            "addElement": "添加元素",
            "nameLabel": "材料名称",
            "namePlaceholder": "自定义材料名称",
            "density": "密度 ({value})",
            "baseTemperature": "基础温度({value}°C)",
            "meltingPoint": "熔点({value}°C)",
            "boilingPoint": "沸点({value}°C)",
            "ignitionPoint": "燃点 ({value}°C)",
            "hazardTitle": "危险标签",
            "appliedHazards": "应用标签：{list}",
            "apply": "应用自定义材料",
            "reset": "清晰构图",
            "hazards": {
              "flammable": "易燃",
              "conductive": "导电",
              "elastic": "弹性",
              "insulator": "绝缘子",
              "aqueous": "水溶性",
              "superheated": "过热",
              "ionized": "电离",
              "alkali-metal": "碱金属",
              "water-reactive": "水反应性",
              "acidic": "酸性",
              "corrosive": "腐蚀性",
              "toxic": "有毒的",
              "inert": "惰性",
              "oxidizer": "氧化剂",
              "explosive": "爆炸",
              "cryogenic": "低温",
              "refractory": "耐火",
              "catalytic": "催化"
            }
          },
          "emitter": {
            "title": "发射器设置",
            "type": "类型：{kind}",
            "rate": "速率（{value}/s）",
            "power": "力量（{value}）",
            "direction": "方向({value}°)",
            "circuit": {
              "alwaysOn": "保持供电",
              "connections": "连接节点",
              "disconnect": "断开连接",
              "cancel": "取消链接",
              "connect": "链接模式"
            }
          },
          "cloth": {
            "title": "布料 属性",
            "integrity": "完整性{percent}%",
            "links": "节点{cols}×{rows} /链接{intact}/{total}",
            "strain": "平均应变{average}% / 最大{max}%",
            "fatigue": "疲劳{value}",
            "structural": "结构({value})",
            "shear": "剪切({value})",
            "bend": "弯曲({value})",
            "damping": "阻尼（{value}）",
            "tearFactor": "撕裂因子({value})",
            "windInfluence": "风响应 ({value})",
            "color": "颜色",
            "pinTop": "钉顶边缘",
            "unpinAll": "取消固定全部"
          }
        }
      },
      "miniexp": {
        "categories": "类别列表",
        "displayModes": "显示模式",
        "displayMode": {
          "tile": "平铺",
          "list": "列表",
          "wrap": "包裹",
          "detail": "细节"
        },
        "search": {
          "label": "搜索",
          "placeholder": "按名称或说明搜索",
          "groupLabel": "搜索与筛选"
        },
        "filters": {
          "source": {
            "label": "来源",
            "all": "全部",
            "builtin": "内置",
            "mod": "MOD / 社区"
          },
          "favoritesOnly": "仅显示收藏"
        },
        "actions": {
          "select": "选择",
          "selected": "选定",
          "favorite": "加入收藏",
          "unfavorite": "从收藏移除"
        },
        "list": {
          "label": "小游戏列表",
          "empty": "没有找到该类别的迷你游戏。在 games/ 下添加更多内容。",
          "noMatch": "没有符合筛选条件的小游戏。请调整条件后重试。"
        },
        "favorites": {
          "title": "收藏",
          "empty": "尚未收藏任何小游戏。"
        },
        "category": {
          "all": "全部",
          "action": "行动",
          "board": "棋盘",
          "shooting": "射手",
          "puzzle": "谜",
          "utility": "实用程序",
          "rhythm": "节奏",
          "gambling": "赌博",
          "toy": "玩具",
          "simulation": "模拟",
          "skill": "技能",
          "misc": "其他"
        },
        "games": {
          "snake": {
            "name": "贪吃蛇",
            "description": "收集颗粒以增长更长的时间并赚取经验值。"
          },
          "othello": {
            "name": "奥赛罗",
            "description": "翻转圆盘以摆动棋盘并赢得奖励经验。"
          },
          "othello_weak": {
            "name": "最弱的黑白棋",
            "description": "一个糟糕的转折，更少的圆盘获胜和更高的难度使人工智能故意犯错。"
          },
          "checkers": {
            "name": "跳棋",
            "description": "在经典的棋盘决斗中跳跃敌人的棋子并为你的人加冕。"
          },
          "chess": {
            "name": "国际象棋",
            "description": "通过战术捕获和检查来智胜国王以获得 EXP。",
            "title": "国际象棋",
            "difficultyTag": "难度：{value}",
            "difficultyValue": {
              "easy": "简单",
              "normal": "普通",
              "hard": "困难"
            },
            "status": {
              "stopped": "已停止",
              "turnLabel": "转动：",
              "yourTurn": "你的举动",
              "aiThinking": "AI正在思考…",
              "scoreLabel": "得分："
            },
            "messages": {
              "checkmateWin": "将死！你赢了。",
              "checkmateLoss": "将死…",
              "stalemate": "陷入僵局。这场比赛是平局。",
              "draw": "比赛记录为平局。",
              "playerCheck": "检查！",
              "playerInCheck": "已过关！",
              "selectMove": "选择一个目标方格。"
            },
            "prompts": {
              "promotion": "选择一个促销片(Q/R/B/N)"
            },
            "controls": {
              "restart": "重新启动"
            }
          },
          "xiangqi": {
            "name": "象棋",
            "description": "中国象棋。通过吃子、将军和将死获取经验值。",
            "header": {
              "title": "象棋",
              "subtitle": "{color}先手"
            },
            "controls": {
              "reset": "恢复初始布局"
            },
            "board": {
              "riverLabel": "楚河　汉界"
            },
            "color": {
              "red": "红方",
              "black": "黑方",
              "redPlayer": "红方（下）",
              "blackPlayer": "黑方（上）"
            },
            "pieces": {
              "general": "帅",
              "advisor": "仕",
              "elephant": "相",
              "horse": "马",
              "chariot": "车",
              "cannon": "炮",
              "soldier": "兵"
            },
            "expLabel": "EXP",
            "piece": {
              "description": "{color}{piece}"
            },
            "status": {
              "turnLine": "回合：{turn}",
              "turn": {
                "red": "{color}行动",
                "black": "{color}行动"
              },
              "scoreLine": "总分：{score}",
              "capture": "{actor}吃掉了{target}(+{exp}{expLabel})",
              "move": "{piece}移动了。",
              "win": "{loser}被将死，{winner}获胜！",
              "stalemate": "僵局（无合法着法）。",
              "check": "{defender}被将军 (+{exp}{expLabel})"
            }
          },
          "shogi": {
            "name": "将棋",
            "description": "正统将棋。善用持驹和升变，通过着手、吃子与将军获得经验值。",
            "ui": {
              "title": "将棋",
              "subtitle": "MiniExp 版",
              "legend": "着手:+{moveExpFormatted} EXP / 打入:+{dropExpFormatted} EXP / 吃子奖励 / 升变:+{promoteExpFormatted} EXP / 将军:+{checkExpFormatted} EXP / 胜利奖励",
              "hands": {
                "aiLabel": "先手 (CPU)",
                "playerLabel": "后手 (你)",
                "empty": "无",
                "chip": "{piece}×{countFormatted}",
                "total": "{countFormatted}枚",
                "totalNone": "无"
              },
              "actions": {
                "restart": "重新开始"
              },
              "confirm": {
                "promote": "要升变吗？"
              }
            },
            "status": {
              "playerTurn": "轮到你。请选择棋子或手持棋。",
              "aiThinking": "CPU正在思考…",
              "playerInCheck": "你被将军了！请应对。",
              "aiInCheck": "将军！寻找制胜一手。"
            },
            "result": {
              "playerWin": "将死！你赢了",
              "playerLose": "被将死…失败",
              "draw": "持将棋 / 千日手，平局"
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
            "name": "立直麻将精简版",
            "description": "与3名AI进行一局东风战立直麻将，支持立直/自摸/荣和与点棒结算。"
          },
          "connect6": {
            "name": "连六棋",
            "description": "每回合落两子争夺六连。落子+1EXP、形成威胁+10EXP、胜利奖励丰厚。"
          },
          "gomoku": {
            "name": "五子棋",
            "description": "每次落子+1EXP、形成冲四等威胁+10EXP、胜利可获额外奖励。"
          },
          "renju": {
            "name": "连珠",
            "description": "带禁手规则的五子棋。落子+1EXP、形成威胁+10EXP、胜利奖励。"
          },
          "connect4": {
            "name": "四子连线",
            "description": "棋子会下落的四子连线。落子+1EXP、形成威胁+10EXP、胜利按难度提供EXP。"
          },
          "tic_tac_toe": {
            "name": "井字棋",
            "description": "经典三子棋。落子+1EXP、形成威胁+10EXP、胜利奖励较为克制。"
          },
          "go": {
            "name": "围棋",
            "description": "落子+1 / 吃子奖励 / 胜利经验值",
            "info": {
              "intro": "围棋 9×9 — 你执黑先行"
            },
            "hud": {
              "turn": {
                "player": "你的回合（黑）",
                "ai": "AI 的回合（白）"
              },
              "status": "{turn} ｜ 黑 提子:{blackCaptures} ｜ 白 提子:{whiteCaptures} (贴目+{komi})",
              "passNotice": "{actor}选择了停着（连续{count}次）",
              "aiThinking": "AI 正在思考…"
            },
            "buttons": {
              "pass": "停着",
              "resign": "认输"
            },
            "messages": {
              "koViolation": "该手因劫争禁止。"
            },
            "actors": {
              "player": "你",
              "ai": "AI"
            },
            "result": {
              "win": "你赢了！",
              "loss": "AI 获胜…",
              "draw": "持棋（平局）",
              "summary": "{result} ｜ 黑 {blackScore} - 白 {whiteScore}"
            }
          },
          "backgammon": {
            "name": "西洋双陆棋",
            "description": "在 24 个点位之间奔走，争取率先完成撤子。击打对手棋子和完成撤子都会获得 EXP。"
          },
          "mancala": {
            "name": "曼卡拉",
            "description": "在 Kalah 规则设置中播种并捕获坑，以超越 AI 获得经验。"
          },
          "breakout": {
            "name": "突破",
            "description": "偏转桨以粉碎砖块并获得每块经验值。"
          },
          "breakout_k": {
            "name": "突破（键盘）",
            "description": "用键盘控制的清除砖块以获得经验奖励。"
          },
          "pinball_xp": {
            "name": "XP 弹球",
            "description": "拍摄复古3D风格的桌子、照明车道和保险杠来收获经验。"
          },
          "dungeon_td": {
            "name": "地下城塔防",
            "description": "将炮塔放置在混合地下城中并阻止敌方波浪以升级经验值。"
          },
          "pong": {
            "name": "Pong",
            "description": "赢得乒乓球在更高的难度下集会以升级 EXP。"
          },
          "same": {
            "name": "同一游戏",
            "description": "弹出匹配的颜色簇以获得经验奖励。"
          },
          "match3": {
            "name": "匹配3",
            "description": "交换宝石组成链条，更长的比赛和连击可提升经验。",
            "hud": {
              "title": "匹配3",
              "cleared": "已清除",
              "status": "{title} | {difficulty} | {clearedLabel}：{tiles}"
            },
            "difficulty": {
              "easy": "简单",
              "normal": "普通",
              "hard": "困难"
            },
            "popup": {
              "chain": "链{chain}！"
            }
          },
          "minesweeper": {
            "name": "扫雷",
            "description": "安全清除棋盘，获得揭露和完全清除的经验。"
          },
          "sudoku": {
            "name": "数字位置",
            "description": "在网格中填写正确的数字以获得经验值和完成奖励。"
          },
          "ultimate_ttt": {
            "name": "终极井字游戏",
            "description": "控制迷你板并获得分层经验奖励的宏观胜利。"
          },
          "nine_mens_morris": {
            "name": "九人莫里斯",
            "description": "放置磨坊以移除敌方棋子并确保经验值。"
          },
          "sugoroku_life": {
            "name": "生命双六",
            "description": "驾驭生活事件，增长你的资产，并在职业棋盘游戏中积累经验。"
          },
          "arrow_escape": {
            "name": "箭头脱出",
            "description": "按照逆向生成的顺序让箭头方块依次逃出棋盘。"
          },
          "sliding_puzzle": {
            "name": "滑动拼图",
            "description": "解决8、15-和24格滑动谜题以获得经验。"
          },
          "invaders": {
            "name": "太空侵略者",
            "description": "射击下降的外星人以获得经验值，清除波浪会有意外之财。"
          },
          "pacman": {
            "name": "吃豆人克隆",
            "description": "吃掉颗粒并清扫迷宫以获得巨额EXP奖励。"
          },
          "bomberman": {
            "name": "克隆人炸弹人",
            "description": "用炸弹爆炸软块和敌人，积累经验值。"
          },
          "tetris": {
            "name": "俄罗斯方块克隆",
            "description": "堆叠方块以用于REN链和T-旋转以最大化经验值。"
          },
          "falling_puyos": {
            "name": "噗哟噗哟克隆",
            "description": "连锁四色清除以放大经验乘数。"
          },
          "triomino_columns": {
            "name": "三联柱",
            "description": "放下带有线火花的三件式柱并按住以构建EXP。"
          },
          "watermelon_stack": {
            "name": "西瓜叠叠乐",
            "description": "投下相同的水果让它们合体成长，朝着巨大的西瓜前进！每次合体都会获得经验值。"
          },
          "game2048": {
            "name": "2048",
            "description": "在 2048 年之前合并瓷砖，根据 log2 获得经验值总结。",
            "setup": {
              "sizeLabel": "棋盘尺寸：",
              "startButton": "开始",
              "boardSizeOption": "{size}×{size}"
            }
          },
          "todo_list": {
            "name": "待办事项列表",
            "description": "完成你设置的任务以获得可配置的EXP。"
          },
          "counter_pad": {
            "name": "计数器垫",
            "description": "通过自动保存调整的多计数器按钮跟踪数字。"
          },
          "random_tool": {
            "name": "随机工具箱",
            "description": "集合骰子、轮盘、列表抽取以及数字/文本生成的便利工具。"
          },
          "notepad": {
            "name": "记事本",
            "description": "编写、编辑和保存笔记以赚取增量经验。"
          },
          "wording": {
            "name": "措辞",
            "description": "文字处理器奖励EXP：编辑+1/格式+2/保存 +6"
          },
          "exceler": {
            "name": "Exceler电子表格",
            "description": "使用公式和格式进行轻量级 XLSX 编辑，以提高生产力 EXP。"
          },
          "paint": {
            "name": "绘制",
            "description": "绘制并填充图稿，然后保存画布以提高经验值。"
          },
          "diagram_maker": {
            "name": "Diagram Maker",
            "description": "使用draw.io XML导出和图像输出创建图表以获得EXP。"
          },
          "clock_hub": {
            "name": "时钟集线器",
            "description": "浏览丰富的时钟小部件和时间数据，收集里程碑经验。"
          },
          "login_bonus": {
            "name": "登录奖励",
            "description": "在日历上标记每日签到即可领取经验奖励。"
          },
          "stopwatch": {
            "name": "秒表",
            "description": "精确测量圈数，每次操作都积累经验。"
          },
          "calculator": {
            "name": "计算器",
            "description": "输入数字并完成计算以赚取 经验."
          },
          "timer": {
            "name": "计时器",
            "description": "管理倒计时和秒表以保持 EXP 计划。"
          },
          "math_lab": {
            "name": "数学实验室",
            "description": "探索高级数学工具——函数、转换、图表，甚至四分法——以获得EXP。",
            "keypad": {
              "groups": {
                "standard": "标准功能",
                "trigonometry": "三角函数和双曲线",
                "complex": "复数和矩阵",
                "analysis": "分析与特殊功能",
                "statistics": "概率与统计",
                "numerical": "数值方法",
                "programmer": "程序员和信息",
                "constants": "常数和单位"
              }
            },
            "units": {
              "templates": {
                "length": "长度：5厘米→英寸",
                "mass": "质量：70公斤→磅",
                "energy": "能量：1kWh→J",
                "temperature": "温度：25 degC → degF",
                "speed": "速度：100 km/h→m/s"
              }
            },
            "ui": {
              "unitTemplates": {
                "title": "单位转换预设",
                "insert": "插入"
              },
              "worksheet": {
                "title": "工作表"
              },
              "inputMode": {
                "classic": "功能符号",
                "pretty": "数学符号"
              },
              "preview": {
                "title": "表达式预览"
              },
              "actions": {
                "evaluate": "评估(Shift+Enter)",
                "clear": "重置",
                "copyResult": "复制结果"
              },
              "history": {
                "title": "历史",
                "empty": "您的计算历史记录将出现在此处。"
              },
              "variables": {
                "title": "范围变量",
                "reset": "在",
                "empty": "(无变量 已定义）"
              },
              "angle": {
                "radians": "弧度",
                "degrees": "度"
              }
            },
            "placeholders": {
              "worksheet": {
                "classic": "输入表达式或命令（例如，integra(sin(x), x)，solveEq(sin(x)=0.5, x, 1)， solveSystem([\"x+y=3\",\"x-y=1\"],[\"x\",\"y\"]))",
                "pretty": "示例：√(2) + 1/3、2π、(x+1)/(x−1)（使用数学符号）"
              },
              "preview": {
                "expression": "（输入的表达式将在此处可视化）"
              },
              "graph": {
                "expression": "输入f(x)（例如sin(x) / x)"
              }
            },
            "status": {
              "initializing": "初始化…",
              "loading": "加载数学引擎...",
              "copySuccess": "将结果复制到剪贴板。",
              "copyFailure": "无法复制到剪贴板。",
              "scopeReset": "范围重置。",
              "inputModeClassic": "输入模式：函数符号",
              "inputModePretty": "输入模式：数学符号",
              "resultModeSymbolic": "结果模式：分数/符号",
              "resultModeNumeric": "结果方式：小数",
              "angleRadians": "角度单位： 弧度",
              "angleDegrees": "角度单位：度",
              "worksheetCleared": "已清除工作表。",
              "engineWaiting": "等待数学引擎初始化...",
              "enterExpression": "进入 ",
              "calculationComplete": "计算完成。",
              "error": "错误：{message}",
              "enterGraphExpression": "输入要绘制的表达式。",
              "ready": "数学实验室已准备就绪。",
              "engineInitialized": "数学 引擎初始化。",
              "loadFailed": "无法加载数学引擎。检查您的互联网连接。"
            },
            "results": {
              "title": "结果",
              "symbolicToggle": "分数/符号",
              "numericToggle": "十进制",
              "symbolicLabel": "精确 /象征性",
              "numericLabel": "近似值(基数10)",
              "moreDigits": "更多数字",
              "moreDigitsHint": "将小数输出扩展+5位",
              "errorLabel": "错误"
            },
            "graph": {
              "title": "图表",
              "plot": "绘图",
              "range": "范围(xmin,xmax)",
              "info": "轴自动缩放。带单位、向量/矩阵和复虚部的值被省略。",
              "parseFailed": "解析表达式失败：{message}",
              "invalidRange": "范围必须是有限的，xmin < xmax。",
              "noPoints": "没有可绘制点{detail}。",
              "noPointsDetail": "（排除：{reasons}）",
              "summary": "绘制点：{count} / {total}",
              "summaryExtra": "/排除{items}",
              "reasons": {
                "units": "单位：{count}",
                "composite": "矢量/矩阵：{count}",
                "complex": "复数：{count}"
              }
            },
            "errors": {
              "radixRange": "基数必须是 2 到 30 之间的整数。",
              "radixInvalidCharacter": "该值包含对所选基数无效的字符。",
              "expressionParse": "无法解释该表达式。提供字符串或 math.js 节点。",
              "notFinite": "值必须是有限数。",
              "numberConversion": "无法将值转换为数字。",
              "positiveRealRequired": "需要一个正实数。",
              "complexRealOnly": "不能仅使用复数的实部。",
              "matrixToScalar": "无法将矩阵转换为标量。",
              "arrayToScalar": "无法将数组转换为标量。",
              "graphUnitsUnsupported": "带有单位的数值无法绘制图表。",
              "tetraRealOnly": "tetra 只为真实参数定义。",
              "slogPositiveBase": "slog需要正基数和实参。",
              "slogBaseSeparated": "选择一个距离 1 足够远的艰苦基地。",
              "divideByZero": "不允许除零。",
              "integralNotReady": "在集成之前等待数学引擎初始化。",
              "integralSymbolicFailed": "无法计算分析积分。尝试数字积分。",
              "integralRange": "积分界限必须是有限实数。",
              "integralBounds": "提供明确的下限和上限积分。",
              "newtonInitialValue": "初始值必须是有限数字。",
              "newtonDerivativeZero": "牛顿法失败：导数接近零。",
              "iterationDiverged": "迭代计算发散。",
              "iterationNotConverged": "未能在指定的迭代内收敛。",
              "linearSolverUnavailable": "线性方程解算器不可用。",
              "systemEquationsArray": "提供一系列方程。",
              "systemVariableCount": "变量列表必须与方程的数量相匹配。",
              "jacobianSolveFailed": "无法求解雅可比行列式 系统.",
              "maximizeFoundMinimum": "搜索在起始位置附近找到最小值 点，而不是最大值。",
              "minimizeFoundMaximum": "搜索在起点附近找到最大值，而不是最小值。",
              "digammaFinite": "digamma 需要有限的真实输入。",
              "digammaPositive": "digamma仅针对正实数输入定义。",
              "polygammaOrder": "多伽玛阶数必须是≥ 0 的整数。",
              "polygammaPositive": "多伽玛仅针对正实数输入定义。",
              "harmonicFirstArg": "谐波要求整数 n ≥ 1。",
              "harmonicSecondArg": "harmonic 的第二个参数必须是正实数。",
              "zetaFinite": "zeta参数必须是有限实数。",
              "zetaOneDiverges": "zeta(1)发散。",
              "zetaPositiveRegion": "此简化实现仅在实部为正的情况下定义。",
              "logGammaFinite": "logGamma需要有限的实数输入。",
              "logGammaPositive": "logGamma仅针对正实输入定义。",
              "gammaFinite": "需要有限的实际输入。",
              "gammaPositive": "伽玛仅针对正实数输入定义。",
              "betaFirstArg": "beta的第一个参数必须是正实数。",
              "betaSecondArg": "beta的第二个参数必须是正实数。",
              "lambertFinite": "lambertW 参数必须是有限实数。",
              "lambertBranchInteger": "lambertW分支必须是一个整数。",
              "lambertBranchRange": "此实现仅支持分支 0 和 -1。",
              "lambertPrincipalDomain": "lambertW主分支仅定义为x≥-1/e。",
              "lambertNegativeDomain": "labertW 分支 -1 仅定义为 -1/e ≤ x < 0。",
              "lambertNotConverged": "兰伯特W计算未收敛。",
              "normalPdfMean": "正常Pdf均值必须是有限实数。",
              "normalPdfSigma": "正常Pdf标准差必须为正实数。",
              "normalPdfInput": "正常Pdf输入必须是有限实数。",
              "normalCdfMean": "normalCdf 平均值必须是有限实数。",
              "normalCdfSigma": "normalCdf 标准差 必须为正实数。",
              "normalCdfInput": "正常Cdf输入必须是有限实数。",
              "normalInvProbability": "正常输入概率必须是有限实数。",
              "normalInvProbabilityRange": "正常Inv概率必须满足0 < p < 1。",
              "normalInvSigma": "normalInv标准偏差必须为正实数 编号。",
              "poissonMean": "泊松Pmf均值必须是正实数。",
              "poissonCount": "泊松Pmf计数必须是≥0的整数。",
              "poissonCdfMean": "poissonCdf 均值必须是正实数。",
              "poissonCdfCount": "泊松Cdf计数必须是≥0的整数。",
              "binomialTrials": "二项式Pmf试验必须是≥ 0的整数。",
              "binomialSuccesses": "二项式 Pmf 成功必须是 ≥ 0 的整数。",
              "binomialProbability": "二项式Pmf成功概率必须在0和1之间。",
              "binomialCdfTrials": "二项式Cdf试验必须是≥ 0的整数。",
              "binomialCdfSuccesses": "二项式Cdf成功必须是≥0的整数。",
              "binomialCdfProbability": "二项式Cdf成功概率必须在0到1之间。",
              "logitFinite": "logit参数必须是有限实数。",
              "logitRange": "logit 参数必须满足 0 < x < 1。",
              "sigmoidFinite": "sigmoid 参数必须是有限实数。",
              "factorialNumeric": "阶乘参数必须是数字。",
              "factorialFinite": "阶乘参数必须是有限实数。",
              "factorialReal": "阶乘参数必须为实数。",
              "factorialGreaterThanMinusOne": "阶乘参数必须大于-1。",
              "factorialNegativeInteger": "负整数的阶乘未定义。",
              "factorialNonNegativeInteger": "阶乘参数必须是非负整数。",
              "permutationsRange": "排列第二个参数必须是不超过第一个参数的整数。",
              "permutationsInteger": "排列参数必须是≥ 0的整数。",
              "combinationsRange": "组合第二个参数必须是不超过第一个的整数。",
              "combinationsSecondArg": "组合第二个参数必须是≥ 0的整数。",
              "combinationsInteger": "组合参数必须是≥ 0的整数。",
              "lnUnavailable": "自然对数函数 ln 为不可用。",
              "erfcUnavailable": "erfc当前不可用。"
            }
          },
          "calc_combo": {
            "name": "计算组合",
            "description": "解决最多两位数的快速射击算术以构建组合EXP."
          },
          "blockcode": {
            "name": "区块代码实验室",
            "description": "使用可视块进行实验以安全地编写MiniExp API。",
            "defaults": {
              "projectName": "新项目"
            },
            "categories": {
              "events": "事件",
              "actions": "操作",
              "control": "控制",
              "variables": "变量",
              "utility": "实用程序"
            },
            "ui": {
              "title": "区块代码实验室",
              "variableSelect": {
                "placeholder": "--变量--"
              },
              "workspace": {
                "elseLabel": "否则"
              },
              "stage": {
                "placeholder": "组装块并按运行。"
              },
              "status": {
                "running": "运行",
                "stopped": "已停止"
              },
              "toolbar": {
                "snapOn": "捕捉：开",
                "snapOff": "捕捉： OFF",
                "speedLabel": "速度{value}x",
                "undo": "撤消",
                "redo": "重做",
                "zoomReset": "重置缩放",
                "gridToggle": "切换网格"
              },
              "summary": "{name}·块{blocks}·变量 {variables}",
              "projectStats": "块{blocks}·变量{variables}",
              "tabs": {
                "logs": "Logs",
                "variables": "变量观察"
              },
              "buttons": {
                "new": "新",
                "save": "保存",
                "load": "加载",
                "share": "分享 代码",
                "run": "运行",
                "stop": "停止",
                "duplicate": "重复",
                "delete": "删除",
                "cancel": "取消",
                "ok": "确定",
                "addVariable": "添加变量"
              },
              "inputs": {
                "variableName": "变量名称",
                "variableInitial": "初始值",
                "memo": "备注（可选）"
              },
              "alerts": {
                "duplicateVariable": "已存在同名变量。",
                "noSavedProjects": "未找到已保存的项目。",
                "decodeFailed": "解析分享代码失败。"
              },
              "prompts": {
                "confirmStopForNew": "项目正在运行。停止并创建一个新项目？",
                "confirmDiscard": "放弃当前项目并开始一个新项目？"
              },
              "messages": {
                "projectCreated": "创建一个新项目。",
                "projectSaved": "保存的项目“{name}”。",
                "projectLoaded": "加载项目“{name}”。",
                "shareImported": "导入“{name}”自共享代码。",
                "undoUnavailable": "尚未实现撤消。",
                "redoUnavailable": "重做尚未实现。",
                "needHat": "需要启动事件块。",
                "executionStopped": "执行停止。",
                "runComplete": "执行完毕。",
                "genericError": "发生错误。"
              },
              "share": {
                "title": "分享 代码",
                "importLabel": "粘贴分享代码导入",
                "importPlaceholder": "分享码",
                "importButton": "导入",
                "copyButton": "复制代码",
                "copied": "复制！"
              },
              "variableList": {
                "initialValue": "首字母：{value}",
                "empty": "否变量."
              },
              "variableTypes": {
                "number": "数字",
                "string": "弦",
                "boolean": "布尔值"
              }
            },
            "blocks": {
              "whenGameStarts": {
                "label": "游戏开始时",
                "description": "事件处理程序运行时 项目开始。"
              },
              "whenKeyPressed": {
                "label": "当按键{key}时按下",
                "description": "按下指定键时运行。",
                "inputs": {
                  "key": {
                    "placeholder": "按键"
                  }
                }
              },
              "movePlayer": {
                "label": "将玩家移动 {steps} 格",
                "description": "移动沙盒播放器。"
              },
              "setTile": {
                "label": "将图块（{x}，{y}）设置为{color}",
                "description": "更改舞台图块颜色。",
                "inputs": {
                  "color": {
                    "placeholder": "#RRGGBB"
                  }
                }
              },
              "waitSeconds": {
                "label": "等待{seconds}秒",
                "description": "等待指定秒数。"
              },
              "repeatTimes": {
                "label": "重复 {count} 次",
                "description": "重复指定次数。"
              },
              "foreverLoop": {
                "label": "永远重复",
                "description": "以安全迭代限制重复。"
              },
              "ifCondition": {
                "label": "如果 {condition}",
                "description": "条件成立时运行。",
                "inputs": {
                  "condition": {
                    "placeholder": "条件（例如分数> 5）"
                  }
                }
              },
              "logMessage": {
                "label": "日志：{message}",
                "description": "向日志选项卡输出一条消息。",
                "inputs": {
                  "message": {
                    "default": "Hello MiniExp！"
                  }
                }
              },
              "awardXp": {
                "label": "获得经验值{amount}",
                "description": "奖励 XP。"
              },
              "setVariable": {
                "label": "将变量 {variable} 设置为 {value}",
                "description": "为变量赋值。",
                "inputs": {
                  "value": {
                    "placeholder": "价值或表达"
                  }
                }
              },
              "changeVariable": {
                "label": "更改变量{variable}通过 {delta}",
                "description": "递增或递减一个变量。"
              },
              "broadcast": {
                "label": "广播 {channel}",
                "description": "触发虚拟事件。"
              },
              "stopAll": {
                "label": "停止一切",
                "description": "停止执行。"
              }
            },
            "worker": {
              "foreverLimit": "永远循环停止后 {limit} 次迭代。",
              "broadcast": "广播：{channel}",
              "noStart": "未找到启动事件块。",
              "stopped": "行刑被停止。"
            }
          },
          "video_player": {
            "name": "视频播放器",
            "description": "观看本地文件或YouTube剪辑以累积观看经验。",
            "title": "视频播放器",
            "sessionXp": "会话经验： {exp}",
            "info": {
              "source": "来源",
              "title": "标题",
              "duration": "持续时间",
              "status": "状态",
              "sourceLocal": "本地",
              "sourceYoutube": "YouTube",
              "untitled": "无标题"
            },
            "tabs": {
              "local": "本地文件",
              "youtube": "YouTube URL"
            },
            "local": {
              "hint": "选择你的浏览器可以播放的视频，例如 MP4/WebM/Ogg。",
              "noFile": "未选择文件",
              "loading": "正在加载本地视频..."
            },
            "youtube": {
              "placeholder": "https://www.youtube.com/watch?v=...",
              "loadButton": "加载",
              "hint": "输入 YouTube URL 或视频 ID。当IFrame API不可用时，将使用简化模式。",
              "loading": "加载 YouTube 视频…",
              "ready": "YouTube视频已加载。按播放开始。",
              "prepared": "YouTube视频准备就绪。",
              "simple": "已加载YouTube（简单模式）。",
              "fallbackTitle": "YouTube 视频 ({id})"
            },
            "placeholder": "选择要播放的视频。",
            "status": {
              "noSource": "未选择来源。",
              "loadingLocal": "正在加载本地视频...",
              "loadingYoutube": "加载 YouTube 视频…",
              "localReady": "本地视频已加载。按开始键。",
              "youtubeReady": "YouTube视频已加载。按播放开始。",
              "youtubePrepared": "YouTube视频准备就绪。",
              "youtubeSimple": "已加载YouTube（简单模式）。",
              "playing": "玩",
              "paused": "已暂停",
              "ended": "播放完毕",
              "error": "加载错误",
              "youtubeError": "YouTube播放器错误",
              "buffering": "缓冲..."
            },
            "message": {
              "reselectLocal": "再次选择相同的视频文件。",
              "historyCleared": "已清除观看历史。",
              "localLoading": "正在加载本地视频...",
              "localLoaded": "已加载本地视频。",
              "localError": "加载视频时出错。尝试不同的文件。",
              "localSelectFile": "请选择视频文件。",
              "youtubeSimpleLoaded": "以简单模式加载YouTube视频。",
              "youtubeLoaded": "YouTube 视频已加载。",
              "youtubeError": "无法加载 YouTube 视频。",
              "youtubeInvalid": "输入有效的 YouTube URL 或视频 ID。"
            },
            "history": {
              "title": "观看历史记录",
              "clear": "清除历史记录",
              "empty": "尚未观看视频。",
              "typeLocal": "本地",
              "typeYoutube": "YouTube",
              "untitled": "无标题"
            },
            "shortcuts": {
              "title": "快捷方式和提示",
              "playPause": "空间：播放/暂停（本地视频或带API的YouTube）",
              "seek": "← / →：寻找-5/+5秒（本地视频或带API的YouTube）",
              "history": "单击历史记录条目以重播它。本地视频会提示您重新选择文件。",
              "simpleMode": "在YouTube简单模式下，使用YouTube播放器快捷方式。"
            }
          },
          "pomodoro": {
            "name": "番茄定时器",
            "description": "循环焦点和休息，完成EXP支出的会话。"
          },
          "music_player": {
            "name": "音乐播放器",
            "description": "使用可视化工具和EQ导入并播放曲目以收集EXP。"
          },
          "tester": {
            "name": "JS 测试仪",
            "description": "基准 JavaScript 功能并为 EXP 构建方块冒险。",
            "title": "JS Tester / MiniExp MOD",
            "subtitle": "运行JavaScript自检、CPU基准测试和基于块的冒险制作器。",
            "tabs": {
              "tests": "功能测试",
              "benchmark": "CPU基准",
              "blocks": "方块冒险"
            },
            "tests": {
              "heading": "JavaScript自检实验室",
              "description": "一键快速验证代表性浏览器功能。共享输出以简化调试。",
              "runAll": "全部运行",
              "runSingle": "操作系统",
              "running": "运行…",
              "defs": {
                "numbers": {
                  "name": "数字/BigInt",
                  "description": "练习浮点数学、BigInt 和数学助手。",
                  "errors": {
                    "bigInt": "BigInt算法不符合预期",
                    "hypot": "Math.hypot 返回一个意想不到的 价值"
                  }
                },
                "json": {
                  "name": "JSON 和结构化克隆",
                  "description": "验证 JSON 序列化和结构化克隆行为。",
                  "errors": {
                    "restore": "无法从 JSON 恢复",
                    "clone": "结构化克隆无法保留地图"
                  }
                },
                "intl": {
                  "name": "国际格式化",
                  "description": "确认Intl.DateTimeFormat和NumberFormat输出。",
                  "errors": {
                    "date": "日期格式与预期不同",
                    "currency": "货币格式与预期不同"
                  }
                },
                "crypto": {
                  "name": "加密API",
                  "description": "生成加密随机性并散列样本缓冲区。",
                  "errors": {
                    "random": "crypto.getRandomValues 不可用"
                  }
                },
                "storage": {
                  "name": "存储API",
                  "description": "验证localStorage/sessionStorage读写操作。",
                  "errors": {
                    "read": "存储读写失败",
                    "blocked": "存储访问被阻止"
                  }
                },
                "canvas": {
                  "name": "画布和离屏",
                  "description": "渲染到 Canvas 并检查 OffscreenCanvas 支持。",
                  "errors": {
                    "sample": "画布像素采样失败"
                  }
                }
              }
            },
            "benchmark": {
              "heading": "CPU基准-每秒增量",
              "description": "持续在整数上加 1 一秒钟以衡量爆发性能。",
              "labels": {
                "current": "最新（操作/秒）",
                "best": "个人最好成绩（操作/秒）",
                "runs": "总跑数"
              },
              "start": "开始基准测试（1秒）",
              "notice": "基准运行时 UI 可能会冻结一秒钟。",
              "log": {
                "start": "开始基准测试…",
                "record": "新记录： {value} 操作次数/秒",
                "result": "结果：{value} 操作/秒"
              }
            },
            "blocks": {
              "controls": {
                "add": "添加方块",
                "clear": "全部清除"
              },
              "alert": {
                "title": "自定义警报功能",
                "description": "编写接收消息和上下文的函数体。使用 context.flags 和 context.log 以获得更丰富的效果。",
                "template": "// message: string\\n// context: { flags, log, awardXp }\\nconst box = document.createElement('div');\\nbox.textContent = message;\\nbox.style.padding = '16px';\\nbox.style.background = 'rgba(96,165,250,0.15)';\\nbox.style.border = '1px 实心 rgba(96,165,250,0.4)';\\nbox.style.borderRadius = '12px';\\nbox.style.margin = '6px 0';\\ncontext.log(box);\\n",
                "apply": "应用",
                "test": "测试运行",
                "statusDefault": "默认：写入日志。您可以切换回alert()。",
                "statusApplied": "✅ 应用自定义警报处理程序。",
                "statusError": "❌错误： {message}",
                "testMessage": "这是一个自定义警报测试。",
                "statusTestSent": "✅发送测试信息。",
                "statusTestError": "❌运行时错误：{message}"
              },
              "story": {
                "title": "块故事跑者",
                "play": "播放故事",
                "stop": "停止",
                "logStart": "▶ 故事开始了（{count} 块）",
                "logAborted": "⚠执行中止：{message}",
                "logEnd": "■ 故事已完成",
                "logUserStop": "■ 被用户停止",
                "logEmpty": "⚠未定义任何块。"
              },
              "variables": {
                "title": "旗帜查看器（旗帜）",
                "empty": "（空）"
              },
              "defaults": {
                "choiceQuestion": "你会做什么？",
                "choiceGo": "开始",
                "choiceStop": "停止",
                "controlMessage": "继续？",
                "yes": "是",
                "no": "不",
                "message": "信息",
                "prompt": "请输入你的名字"
              },
              "text": {
                "placeholder": "显示消息",
                "delivery": {
                  "log": "发送到日志",
                  "alert": "自定义提醒",
                  "both": "两者"
                },
                "nextLabel": "下一个块（#或空白）",
                "nextPlaceholder": "留空自动前进"
              },
              "choice": {
                "questionPlaceholder": "选项上方显示的文本",
                "storePlaceholder": "存储选择的变量（例如选择）",
                "labelPlaceholder": "按钮标签",
                "valuePlaceholder": "存储值",
                "targetPlaceholder": "下一个方块#",
                "addOption": "添加选择",
                "newOption": "新选项",
                "logLabel": "选择",
                "buttonFallback": "选择",
                "logSelection": "▶选择：{value}",
                "noOptions": "※ 没有选择配置"
              },
              "set": {
                "namePlaceholder": "变量名称",
                "valuePlaceholder": "值（字符串）",
                "nextPlaceholder": "下一个区块（空白=顺序）"
              },
              "jump": {
                "namePlaceholder": "要比较的变量",
                "equalsPlaceholder": "比较值（字符串）",
                "targetPlaceholder": "匹配时阻止#",
                "elsePlaceholder": "区块#不匹配（空白=下一个）"
              },
              "award": {
                "amountPlaceholder": "EXP 授予（允许负数）",
                "nextPlaceholder": "下一个区块（空白=顺序）"
              },
              "types": {
                "text": "文本",
                "choice": "选择",
                "set": "设置",
                "jump": "跳跃",
                "award": "奖励",
                "control": "控制"
              },
              "control": {
                "modeLabel": "类型",
                "modeConfirm": "确认（是/否）",
                "modePrompt": "输入字段",
                "messagePlaceholder": "显示消息",
                "storePlaceholder": "存储结果的变量名称（空白=无）",
                "yesLabel": "为是的标签按钮",
                "yesValue": "选择“是”时存储的值",
                "yesTarget": "是之后的下一个块#（空白 =下）",
                "noLabel": "无按钮标签",
                "noValue": "选择“否”时存储数值",
                "noTarget": "否后的下一个区块#（空白=下一个）",
                "labelPrompt": "输入",
                "labelConfirm": "确认",
                "okLabel": "确认",
                "cancelLabel": "取消",
                "errorRequired": "请输入数值。",
                "errorNumber": "输入有效数字。",
                "summaryStored": "▶ {variable} = {value}",
                "summaryValueOnly": "▶价值={value}",
                "summaryCancelStored": "▶取消（{variable} = {value}）",
                "summaryCancel": "▶ 输入 已取消",
                "summaryChoiceStored": "▶ 已选择{label} → {variable} = {value}",
                "summaryChoice": "▶ 已选择{label}"
              },
              "prompt": {
                "messagePlaceholder": "输入前显示的文本字段",
                "storePlaceholder": "变量名称 输入",
                "inputTypeText": "文本",
                "inputTypeNumber": "数字",
                "defaultValue": "默认值（文字）",
                "defaultFrom": "提供默认值的变量（空白=文字）",
                "allowEmpty": "允许空输入",
                "okLabel": "确认按钮标签",
                "okTarget": "确认后的区块#（空白=下一个）",
                "cancelLabel": "取消按钮标签",
                "cancelValue": "取消时存储的值",
                "cancelTarget": "取消后的区块#（空白=下一个）"
              },
              "logs": {
                "jumpMatch": "匹配",
                "jumpMismatch": "没有对手",
                "jump": "[JUMP] {name}={value} => {status}",
                "alertError": "❌警报错误：{message}"
              },
              "errors": {
                "tooManySteps": "执行的步骤太多。可能循环？"
              }
            }
          },
          "system": {
            "name": "系统监察员",
            "description": "在一个 EXP 就绪仪表板中检查 PC、操作系统、浏览器和网络详细信息。"
          },
          "aim": {
            "name": "瞄准训练器",
            "description": "击中目标获得 1-3 EXP 并保持连续状态以获得奖金。",
            "hud": {
              "time": "时间：{time}",
              "hitsAccuracy": "命中：{hits} ACC：{accuracy}%",
              "combo": "COMBO x{combo}"
            },
            "overlay": {
              "timeUp": "时间到",
              "restartHint": "按R重新启动"
            }
          },
          "dodge_race": {
            "name": "道奇赛车",
            "description": "编织网格危险以拉长你的距离EXP。"
          },
          "pseudo3d_race": {
            "name": "高速公路追击者",
            "description": "沿着伪3D高速公路比赛，超越交通以获得EXP。"
          },
          "bowling_duel": {
            "name": "保龄球决斗",
            "description": "曲线射击并选择你的路线以在十帧中击败CPU。"
          },
          "topdown_race": {
            "name": "极光电路",
            "description": "驾驶自上而下的赛道，从圈数中获得经验值并完成订单。",
            "difficulty": {
              "EASY": "EASY",
              "NORMAL": "正常",
              "HARD": "困难"
            },
            "hud": {
              "title": "极光回路({difficulty})",
              "lap": "圈数：<strong>{current}/{total}</strong>（下一个{next}）",
              "lapTime": "单圈时间：{time}",
              "bestLap": "最佳单圈：{time}",
              "turbo": "Turbo：{percent}%{active}",
              "turboActive": "（积极的）",
              "position": "位置：<strong>{position}/{total}</strong>",
              "rivals": "对手",
              "rivalLapSuffix": "·圈{current}/{total}",
              "secondsSuffix": "s"
            },
            "overlay": {
              "idlePrompt": "按开始",
              "go": "GO！"
            },
            "results": {
              "title": "比赛成绩",
              "totalTime": "总时间{time}",
              "headers": {
                "position": "位置",
                "driver": "司机",
                "finish": "完成"
              },
              "expSummary": "获得经验：圈{lap} /最佳{best} /提升{boost} /完成{finish}",
              "restartHint": "按 {key} 重新启动"
            },
            "instructions": {
              "controls": "↑/W：加速↓/S：刹车←→/A·D：转向<br>空间：涡轮 R：重启"
            },
            "status": {
              "you": "你",
              "dnf": "地下城与勇士",
              "fin": "FIN"
            }
          },
          "falling_shooter": {
            "name": "落块射击",
            "description": "爆炸下降的方块——它们越大，你获得的经验值就越多。"
          },
          "bubble_shooter": {
            "name": "泡泡射手",
            "description": "发射彩色气泡以匹配三个并掉落簇以获得经验。"
          },
          "virus_buster": {
            "name": "病毒克星",
            "description": "堆叠胶囊以匹配颜色并清除病毒以获取经验。",
            "title": "病毒克星",
            "hud": {
              "level": "级别 {level}",
              "viruses": "病毒{count}",
              "cleared": "已清除{count}",
              "chainLabel": "{chain}链！",
              "chainNice": "很好！",
              "chainVirus": "病毒 x{count}",
              "stageClear": "通关！",
              "controls": "控制：←→移动/↓软下降/↑或X旋转/空格硬下降/R重置"
            },
            "floating": {
              "drop": "DROP！",
              "virus": "病毒 x{count}",
              "stageClear": "阶段清除！"
            },
            "status": {
              "gameOver": "游戏结束",
              "restartHint": "按R重新启动"
            }
          },
          "sichuan": {
            "name": "四川谜题",
            "description": "将匹配的麻将牌连接两圈或更少即可清除棋盘。"
          },
          "piano_tiles": {
            "name": "节奏瓷砖",
            "description": "及时点击并按住四道钢琴音符，以保持连击经验值不断攀升。"
          },
          "taiko_drum": {
            "name": "太鼓节奏",
            "description": "演奏两张太鼓鼓表，进行经典判断并获得组合经验奖励。"
          },
          "river_crossing": {
            "name": "河流穿越",
            "description": "将青蛙安全地推向目标以获得经验值，并在远处获得大奖。"
          },
          "whack_a_mole": {
            "name": "打地鼠",
            "description": "快速粉碎地鼠并保持连胜以获得额外的经验值。"
          },
          "xp_crane": {
            "name": "XP起重机捕手",
            "description": "操作起重机抓取EXP胶囊，连锁捕获以获得奖励。"
          },
          "steady_wire": {
            "name": "稳定线",
            "description": "在不接触边缘的情况下追踪随机迷宫以收集经验值。",
            "status": {
              "selectControl": "选择控制方式",
              "hitObstacle": "你撞到了电线...",
              "clearedWithTime": "通关！干得好（{time}s）",
              "cleared": "通关！干得好！",
              "leftCourse": "你离开了球场...",
              "pointerLeft": "指针离开走廊...",
              "mouseInstructions": "鼠标：单击开始 圆圈开始移动",
              "keyboardInstructions": "键盘：用箭头键或WASD移动",
              "mouseDrag": "小心拖动圆点——留在走廊内"
            },
            "overlay": {
              "modePrompt": "选择一种控制方法开始！",
              "retryPrompt": "你已经到达边缘了！再试一次？",
              "clearedWithTime": "清除！在 {time} 秒内完成 {difficulty}！",
              "cleared": "清除！您征服了{difficulty}！",
              "selectControlFirst": "先选择控制方式",
              "welcome": "欢迎来到稳定线！\n选择鼠标或键盘控制即可开始。\n呆在走廊里，到达右边的目标。"
            },
            "buttons": {
              "startMouse": "从鼠标开始",
              "startKeyboard": "从键盘开始",
              "retrySameMode": "使用相同的控件重试"
            },
            "difficulty": {
              "label": {
                "easy": "简单",
                "normal": "普通",
                "hard": "困难"
              }
            },
            "canvas": {
              "startLabel": "开始",
              "goalLabel": "目标"
            }
          },
          "flappy_bird": {
            "name": "Flappy Bird克隆",
            "description": "滑过管道间隙以获得经验并与条纹相乘。",
            "ui": {
              "combo": "组合{combo}",
              "start": "按空格键/单击开始",
              "gameOver": "游戏结束",
              "restart": "按空格/R重新启动",
              "finalScore": "分数{formattedScore}"
            }
          },
          "dino_runner": {
            "name": "恐龙跑者",
            "description": "像恐龙一样跳过障碍，将距离转化为经验值。"
          },
          "floor_descent": {
            "name": "楼层下降生存",
            "description": "从尖刺天花板下降，使用平台生存为 轮到 EXP.",
            "hud": {
              "life": "寿命",
              "floor": "楼层{floor}",
              "best": "最佳{floor}",
              "gameOver": "游戏结束",
              "reachedFloor": "到达楼层{floor}",
              "retryHint": "按空格键重试"
            }
          },
          "treasure_hunt": {
            "name": "地下城寻宝",
            "description": "探索混合风格的地下城寻找宝藏——更长的路径会提高基础经验值，更快的清除速度会成倍增加。"
          },
          "forced_scroll_jump": {
            "name": "强制滚动跳跃",
            "description": "冲过强制滚动的关卡，收集 CX 标记以获得更高的排名和 EXP。"
          },
          "tosochu": {
            "name": "为钱而跑",
            "description": "在电视式的追逐、银行业务中躲避猎人如果你坚持或投降，将获得大量经验值 ",
            "ui": {
              "timer": "剩余时间 {seconds}s",
              "exp": "存储的经验值{exp}",
              "missionNotReady": "任务：尚未激活",
              "missionActive": "任务：{label}{optionalSuffix} - 剩余{seconds}s（坐标： {coords})",
              "missionComplete": "任务完成：{success}/{total} 成功",
              "missionSuccess": "{label}： 成功！",
              "missionFailed": "{label}：失败...",
              "surrender": "投降",
              "surrenderCountdown": "投降...{seconds}s"
            },
            "status": {
              "hunterAdded": "有猎人加入追逐！",
              "hunterRetreat": "任务成功！一名猎人撤退",
              "missionActivated": "任务激活：{label}",
              "escapeSuccess": "逃脱！ +{total} EXP（故障{base}+{bonus}）",
              "surrenderSuccess": "投降了。存入 {exp} EXP",
              "caught": "发现...没有获得经验",
              "dungeonUnavailable": "地下城API不可用",
              "stageGenerationFailed": "生成舞台失败",
              "runStart": "追逐开始！",
              "runPaused": "已暂停",
              "standby": "待机",
              "surrenderZoneHint": "进入投降区，然后按按钮",
              "surrenderAttempt": "尝试投降……忍耐{duration}秒！",
              "surrenderCancelled": "取消投降",
              "beaconSuccess": "信标安全！信号干扰加强",
              "beaconFail": "信标失败...猎人处于戒备状态",
              "dataSuccess": "获得机密情报！奖励增加",
              "dataFail": "警报触发！快速猎人出现",
              "boxSuccess": "解除武装！猎人盒子延迟",
              "boxFail": "撤防失败...部署了额外的猎人",
              "vaultSuccess": "大奖！但你现在是主要目标",
              "vaultFail": "避难所被防守...两名猎人被释放"
            },
            "missions": {
              "optionalSuffix": "（可选）",
              "beacon": {
                "label": "到达信标"
              },
              "data": {
                "label": "入侵数据终端"
              },
              "box": {
                "label": "解除猎人箱的武装"
              },
              "vault": {
                "label": "破解高危金库"
              }
            }
          },
          "sanpo": {
            "name": "散步",
            "description": "在随机生成的迷宫中散步，每一步获得 1 点经验。",
            "ui": {
              "regenerate": "重新生成关卡",
              "zoomLabel": "缩放",
              "minimapTitle": "小地图",
              "stageInfo": "类型：{type} / 尺寸：{size} / 单元：{tileSize}",
              "seedInfo": "种子：{seed}",
              "stepsInfo": "步数：{steps}",
              "stageInfoEmpty": "类型：-",
              "seedInfoEmpty": "种子：-",
              "stepsInfoEmpty": "步数：0",
              "zoomInfo": "缩放：{value}x",
              "zoomDisplay": "{value}x",
              "hideMap": "小地图关闭",
              "showMap": "小地图开启",
              "status": {
                "paused": "已暂停",
                "walk": "散步中… 使用 WASD/方向键移动。按 M 切换小地图，[ / ] 缩放。",
                "noApi": "迷宫 API 不可用",
                "generating": "正在生成关卡…",
                "failed": "关卡生成失败",
                "ready": "准备就绪！按开始按钮开始散步。",
                "initializing": "加载中…"
              }
            }
          },
          "ten_ten": {
            "name": "1010谜题",
            "description": "放置方块来清除线，十字清除使你的经验加倍。",
            "hint": "将块拖到板上/按 R 即可 重启",
            "hud": {
              "lines": "行数：{total} / 最大空白：{max}",
              "moves": "移动次数：{moves}/剩余方块：{remaining}",
              "combo": {
                "base": "连击：{combo}（最大{max}）/XP：{xp}",
                "detail": "/最后：+{lastXp}XP（{lines}行）"
              }
            },
            "end": {
              "title": "游戏结束",
              "reasons": {
                "noSpace": "没有空间",
                "generationFailed": "无法生成可放置的棋子"
              },
              "retryHint": "按R重新启动"
            },
            "shelf": {
              "refilling": "重新填充碎片..."
            },
            "errors": {
              "cannotGenerate": "无法生成可放置的棋子"
            }
          },
          "trump_games": {
            "name": "王牌选择",
            "description": "玩一系列纸牌游戏——专注、二十一点和老处女——以获得经验值。"
          },
          "gamble_hall": {
            "name": "Gamble Hall",
            "description": "在轮盘赌和帕奇斯洛风格的机器上下注 EXP。"
          },
          "electro_instrument": {
            "name": "电子乐器工作室",
            "description": "在具有多种音色的虚拟键盘上卡住，每张可赚取经验值性能。"
          },
          "graphics_tester": {
            "name": "3D图形测试仪",
            "description": "运行视觉演示和光线追踪风格渲染以达到经验值基准。"
          },
          "graphicsTester": {
            "title": "3D图形测试仪",
            "badges": {
              "webgl2": "WebGL2",
              "rayMarching": "雷行进",
              "benchmark": "基准"
            },
            "errors": {
              "webgl2Unavailable": "WebGL2不可用",
              "webglInitFailed": "无法初始化WebGL2上下文。"
            },
            "gpuInfo": {
              "title": "GPU信息",
              "unsupported": {
                "message": "不支持或禁用 WebGL2。",
                "description": "该模块需要支持 WebGL2 的设备或浏览器。启用WebGL2或尝试兼容的浏览器。"
              },
              "unknown": "未知",
              "antialias": {
                "enabled": "开启",
                "disabled": "关闭"
              },
              "entries": {
                "vendor": "供应商：{value}",
                "renderer": "渲染器：{value}",
                "version": "WebGL：{value}",
                "shading": "GLSL: {value}",
                "maxTextureSize": "最大纹理尺寸：{value}",
                "maxCubeMap": "最大立方图：{value}",
                "textureUnits": "纹理单位：{value}",
                "antialias": "抗锯齿： {value}"
              }
            },
            "controls": {
              "demoSelect": {
                "label": "演示",
                "options": {
                  "objectLab": "对象实验室（放置演示）",
                  "ray": "光线追踪风格演示",
                  "gallery": "科技图库"
                },
                "note": "拖动至轨道并滚动至缩放。光线追踪演示是 GPU 密集型的，在进行基准测试之前关闭其他选项卡。"
              },
              "objectLab": {
                "title": "对象放置",
                "actions": {
                  "addCube": "添加立方体",
                  "addSphere": "添加球体",
                  "addCylinder": "添加圆柱体",
                  "clear": "清除全部",
                  "autoRotate": "自动旋转"
                },
                "autoRotateState": {
                  "on": "开启",
                  "off": "关闭"
                },
                "logs": {
                  "addCube": "添加了一个立方体。",
                  "addSphere": "添加了一个球体。",
                  "addCylinder": "增加了一个气瓶。",
                  "cleared": "已清除的展示位置。",
                  "autoRotate": "自动旋转： {state}"
                }
              },
              "ray": {
                "title": "光线追踪设置",
                "bounces": "跳出计数",
                "exposure": "曝光"
              },
              "gallery": {
                "title": "科技图库控件",
                "description": "探索环实例、动态运动模糊和材质效果。"
              },
              "benchmark": {
                "title": "基准",
                "start": "运行 6 秒基准测试"
              }
            },
            "log": {
              "demoSwitch": "切换演示：{label}",
              "benchmarkStart": "开始基准测试（高负载）",
              "benchmarkResult": "平均 FPS：{fps} / 绘制对象：{count}"
            },
            "overlay": {
              "fps": "FPS：{value}",
              "objects": "对象：{count}",
              "bounces": "弹跳：{count}",
              "gallery": "画廊演示"
            }
          },
          "physics_sandbox": {
            "name": "物理沙盒",
            "description": "在一个有趣的物理实验室中结合火、水、藤蔓、闪电和电路。"
          },
          "populite": {
            "name": "人口普利特",
            "description": "重塑地形并引导追随者达到经验值的人口目标。"
          },
          "logic_circuit": {
            "name": "逻辑电路模拟器",
            "description": "连接输入、门和输出以模拟 EXP 的逻辑系统。"
          },
          "circuit_simulator": {
            "name": "电路模拟器",
            "description": "用仪器和组件构建DC/AC电路以实验EXP。"
          },
          "memo_studio": {
            "name": "记忆工作室",
            "description": "学习闪卡 间隔重复，强化EXP记忆。",
            "title": "记忆工作室",
            "badge": "TOY MOD",
            "controls": {
              "addDeck": "+ 添加牌组",
              "export": "导出(JSON)",
              "import": "导入(JSON)"
            },
            "filters": {
              "tag": {
                "label": "标签过滤器",
                "placeholder": "输入逗号分隔标签"
              }
            },
            "form": {
              "title": "登记卡",
              "fields": {
                "front": "正面（提示）",
                "back": "返回（回答）",
                "hint": "提示/说明（可选）",
                "tags": "标签（逗号分隔）",
                "interval": "初始间隔（天）"
              },
              "preview": {
                "label": "后预览",
                "empty": "输入文字后会出现预览。"
              },
              "submit": "添加卡",
              "validation": {
                "missingSides": "正面和背面都需要。"
              }
            },
            "review": {
              "controls": {
                "show": "显示",
                "good": "知道了",
                "hard": "困难",
                "again": "重新学习",
                "note": "注释"
              },
              "deckName": "{name}（{count}卡）",
              "noDeck": "未选择套牌。",
              "queueInfo": "{count} 剩余",
              "empty": "没有需要审查的卡片。添加或导入卡牌。",
              "hintPrefix": "提示："
            },
            "dialogs": {
              "addDeck": {
                "prompt": "输入新牌组的名称。",
                "defaultName": "新牌组"
              }
            },
            "import": {
              "error": {
                "invalidJson": "无法解析 JSON。",
                "read": "读取文件失败。"
              }
            },
            "sparkline": {
              "tooltip": "{date} / 已审核{reviewed} / 准确度{accuracy}% / {xp} XP",
              "empty": "无历史记录"
            },
            "deck": {
              "empty": "还没有牌组。添加一个。",
              "defaultName": "新牌组",
              "metrics": {
                "total": "{count}卡片",
                "due": "由于{count}",
                "accuracy": "准确度 {percent}%"
              }
            },
            "hud": {
              "reviewed": {
                "label": "已审阅",
                "value": "{count}卡片"
              },
              "accuracy": {
                "label": "准确度",
                "value": "{percent}%"
              },
              "sessionXp": {
                "label": "会话经验值",
                "value": "{xp} XP"
              },
              "elapsed": {
                "label": "过去了",
                "value": "{minutes}m {secondsPadded}s"
              }
            },
            "note": {
              "title": "{front}",
              "actions": {
                "cancel": "关闭",
                "save": "保存"
              }
            },
            "defaults": {
              "deckName": "入门牌组",
              "tags": {
                "web": "网页"
              },
              "cards": {
                "html": {
                  "front": "超文本标记语言",
                  "back": "超文本标记语言",
                  "hint": "网页的结构"
                },
                "css": {
                  "front": "CSS",
                  "back": "层叠样式表",
                  "hint": "风格演示"
                },
                "javascript": {
                  "front": "JavaScript",
                  "back": "在浏览器中运行的编程语言",
                  "hint": "互动"
                }
              }
            }
          },
          "onigokko": {
            "name": "标签逃逸",
            "description": "在混合地牢中奔跑以躲避追逐者并生存以获得经验值。",
            "timer": {
              "remaining": "剩余时间：{seconds}s"
            },
            "status": {
              "start": "追逐开始！使用箭头键/WASD 移动。",
              "paused": "已暂停",
              "loading": "加载阶段…",
              "ready": "准备好了！按开始开始追逐。",
              "stage_generation_failed": "阶段生成失败",
              "api_unavailable": "地下城API不可用",
              "caught": "捕获！",
              "caught_no_reward": "捕获！没有获得经验值。",
              "escaped": "逃脱！干得好！",
              "escape_success": "转义成功！"
            }
          },
          "darumasan": {
            "name": "Darumasan ga Koronda",
            "description": "观看时冻结并向前冲刺以赢得 50 EXP。"
          },
          "acchimuitehoi": {
            "name": "看这边",
            "description": "赢得反应决斗 - 攻击 15 EXP，防御 5 EXP。"
          },
          "janken": {
            "name": "石头剪刀布",
            "description": "玩经典janken 并赚取 10 EXP 每 胜利。"
          },
          "typing": {
            "name": "打字挑战",
            "description": "准确输入推60秒 WPM 和 EXP。",
            "controls": {
              "difficulty": "难度",
              "target": "目标WPM",
              "targetValue": "{targetWpm} WPM",
              "difficultyOptions": {
                "easy": "简单",
                "normal": "普通",
                "hard": "困难"
              }
            },
            "words": {
              "nextEmpty": "下一个：-",
              "nextWithValue": "下一步：{word}"
            },
            "input": {
              "placeholder": "键入显示的单词（空格/回车确认）"
            },
            "buttons": {
              "reset": "重置",
              "retry": "重试"
            },
            "stats": {
              "labels": {
                "accuracy": "ACC",
                "wpm": "WPM",
                "combo": "连击",
                "sessionXp": "会话XP"
              },
              "targetInfo": {
                "pending": "目标{targetWpm} WPM/进度-",
                "active": "目标{targetWpm} WPM /进度{progress}%"
              }
            },
            "result": {
              "title": "结果",
              "labels": {
                "accuracy": "准确度",
                "wpm": "平均WPM",
                "words": "正确 字符",
                "combo": "最大连击数"
              },
              "wordsValue": "{count}字符"
            },
            "xp": {
              "title": "经验明细",
              "none": "本次比赛没有获得经验值",
              "wordLabel": "字 {index}",
              "word": "{label}：+{xp} EXP",
              "wordWithMilestones": "{label}：+{xp} EXP ({milestones})",
              "milestoneEntry": "x{combo}+{bonus}",
              "milestoneSeparator": ", ",
              "accuracyLabel": "准确度加成({accuracyPercent}%)",
              "accuracy": "{label}：+{xp} EXP",
              "generic": "+{xp} EXP"
            },
            "toasts": {
              "start": "60秒挑战开始！祝你好运！",
              "mistype": "输入错误！",
              "completeBeforeConfirm": "在确认之前输入完整的单词！",
              "comboMilestone": "组合x{combo}！ +{bonus} EXP",
              "comboSeparator": "/"
            }
          },
          "imperial_realm": {
            "name": "帝域",
            "description": "命令村民和军队抵御海浪并摧毁敌人的要塞以获得经验。"
          }
        },
        "logicCircuit": {
          "categories": {
            "input": "输入",
            "gate": "大门",
            "wiring": "连线",
            "composite": "复合",
            "sequential": "顺序",
            "measurement": "测量",
            "output": "输出",
            "other": "其他",
            "misc": "其他"
          },
          "common": {
            "high": "HIGH",
            "low": "低",
            "on": "开启",
            "off": "关闭",
            "set": "设置",
            "reset": "重置",
            "neutral": "---",
            "metastable": "亚稳态",
            "metastableIndicator": "S=R=1（无效）",
            "metastableMessage": "S和R均为1。输出不稳定。",
            "warning": "警告",
            "toggleState": "切换状态",
            "previousClock": "以前的时钟",
            "periodMs": "周期（毫秒）",
            "outLabel": "输出：{value}",
            "muxStatus": "输出：{out} (SEL={sel})"
          },
          "chips": {
            "sessionXp": "会话经验：{value}",
            "elapsedTime": "经过时间：{value}ms"
          },
          "ui": {
            "title": "逻辑电路模拟器",
            "subtitle": "安排输入和门以实时验证组合逻辑",
            "clearCanvas": "重置画布",
            "clearTool": "清除工具(Esc)",
            "step": "⏭步骤",
            "stepLabel": "步长(ms)",
            "pause": "⏸暂停",
            "resume": "▶恢复",
            "sessionXp": "会话经验：{value}",
            "elapsedTime": "经过时间：{value}ms"
          },
          "hints": {
            "board": "选择一个工具，然后单击画布上的空白处放置它。单击输出端口，然后单击输入端口以绘制电线。按删除删除选定的组件。",
            "wires": "单击电线路径将其删除。 Alt+单击输入端口可断开其传入线路。",
            "footer": "提示：切换输入以立即检查结果。暂停或步进模拟以分析顺序行为。"
          },
          "inspector": {
            "title": "组件检查器",
            "empty": "选择一个组件以查看其详细信息以及最多3个输入的自动生成的真值表。",
            "truthTitle": "真值表",
            "connectionCount": "{count}线",
            "delayValue": "{value} 纳秒",
            "clockPeriodValue": "{value} 毫秒",
            "truthTable": {
              "input": "IN{index}"
            },
            "fields": {
              "id": "ID",
              "type": "类型",
              "inputs": "输入端口",
              "outputs": "输出端口",
              "lastInputs": "最后输入",
              "lastOutputs": "最后输出",
              "inputConnections": "输入连接",
              "outputConnections": "输出连接",
              "delay": "传播延迟（大约）",
              "description": "描述"
            }
          },
          "truthTable": {
            "out": "OUT"
          },
          "ports": {
            "output": "输出#{index}",
            "input": "输入#{index}"
          },
          "components": {
            "toggle": {
              "label": "切换输入",
              "description": "单击时切换开/关的基本输入",
              "buttonOn": "打开",
              "buttonOff": "关闭"
            },
            "clock": {
              "label": "时钟",
              "description": "时钟输入以固定间隔振荡"
            },
            "const_high": {
              "label": "常量1",
              "description": "始终输出HIGH的恒定源"
            },
            "constHigh": {
              "label": "常量1",
              "description": "始终输出HIGH的恒定源"
            },
            "const_low": {
              "label": "常量0",
              "description": "始终输出低的恒定源"
            },
            "constLow": {
              "label": "常量0",
              "description": "始终输出低的恒定源"
            },
            "buffer": {
              "label": "缓冲区",
              "description": "输出输入的缓冲区原样"
            },
            "not": {
              "label": "不",
              "description": "反转输入的NOT门"
            },
            "and": {
              "label": "AND",
              "description": "当所有输入均为高电平时输出为高电平"
            },
            "nand": {
              "label": "NAND",
              "description": "反转与门"
            },
            "or": {
              "label": "或",
              "description": "当任何输入为高电平时输出为高电平"
            },
            "nor": {
              "label": "NOR",
              "description": "反向或门"
            },
            "xor": {
              "label": "异或",
              "description": "当 HIGH 数量时输出 HIGH输入是奇数"
            },
            "xnor": {
              "label": "XNOR",
              "description": "逆异或门"
            },
            "splitter": {
              "label": "分离器",
              "description": "将一个输入复制到多个输出"
            },
            "mux2": {
              "label": "2:1 MUX",
              "description": "由选择信号控制的双输入多路复用器"
            },
            "decoder2": {
              "label": "2-4解码器",
              "description": "解码器从2位输入产生one-hot输出"
            },
            "d_ff": {
              "label": "D触发器",
              "description": "边沿触发触发器 上升时钟上的锁存器D（带异步复位）",
              "inspect": {
                "0": {
                  "label": "锁定状态"
                },
                "1": {
                  "label": "以前的时钟"
                }
              }
            },
            "dff": {
              "label": "D触发器",
              "description": "边沿触发触发器 上升时钟上的锁存器D（带异步复位）",
              "indicator": "Q={q} / Q̅={qbar}",
              "status": "Q={value}",
              "inspectLatch": "锁定状态"
            },
            "sr_latch": {
              "label": "SR锁存器",
              "description": "基本NOR SR锁存。 S设定，R重置。",
              "inspect": {
                "0": {
                  "label": "警告"
                }
              }
            },
            "srLatch": {
              "label": "SR锁存器",
              "description": "基本NOR SR锁存。 S设定，R重置。",
              "qStatus": "Q={value}"
            },
            "t_ff": {
              "label": "T触发器",
              "description": "当 T 输入为高电平时，在每个时钟上升沿切换输出。包括重置输入。",
              "inspect": {
                "0": {
                  "label": "切换状态"
                },
                "1": {
                  "label": "以前的时钟"
                }
              }
            },
            "tff": {
              "label": "T触发器",
              "description": "当 T 输入为高电平时，在每个时钟上升沿切换输出。包括重置输入。",
              "status": "Q={value}"
            },
            "probe": {
              "label": "探针",
              "description": "监控输入值的测量节点"
            },
            "led": {
              "label": "LED",
              "description": "输入为HIGH时灯亮"
            }
          }
        },
        "difficulty": {
          "label": "难度",
          "easy": "EASY",
          "normal": "正常",
          "hard": "困难"
        },
        "start": "开始",
        "pause": "暂停",
        "resume": "恢复",
        "restart": "恢复/重启",
        "quit": "退出",
        "hud": {
          "level": "Lv",
          "sp": "SP",
          "expLabel": "EXP"
        },
        "placeholder": {
          "default": "从左侧列表中选择一个小游戏。",
          "loading": "加载中...",
          "loadFailed": "加载失败。",
          "chooseFromCategory": "从类别中选择一个游戏。",
          "gameLoading": "加载小游戏...",
          "gameLoadFailed": "加载小游戏失败",
          "gameStartFailed": "无法启动小游戏。",
          "selected": "选择{name}。",
          "chooseSequence": "选择一个类别，然后选择一个游戏。"
        },
        "records": {
          "bestScore": "最高分",
          "totalPlays": "总播放次数",
          "totalExp": "总EXP赢得",
          "totalExpValue": "{sign}{value}"
        }
      }
    },
    "dungeon": {
      "types": {
        "field": "字段类型",
        "cave": "洞穴类型",
        "maze": "迷宫类型",
        "imperfect-maze": "不完全迷宫",
        "rooms": "房间和走廊",
        "single-room": "单人间",
        "circle": "圆形型",
        "narrow-maze": "狭窄迷宫",
        "wide-maze": "广阔迷宫",
        "snake": "蛇型",
        "mixed": "混合类型",
        "circle-rooms": "圆形房间与走廊",
        "grid": "网格类型",
        "open-space": "开放空间"
      }
    },
    "minigame": {
      "clock_hub": {
        "errors": {
          "noContainer": "时钟集线器需要 容器"
        },
        "header": {
          "title": "时钟实用集线器",
          "subtitle": "在数字、模拟和详细时间视图之间切换",
          "exp": "获得经验：{xp}"
        },
        "tabs": {
          "digital": "数字时钟",
          "analog": "模拟时钟",
          "detail": "详情"
        },
        "detailTabs": {
          "overview": "概述",
          "progress": "进度",
          "remain": "剩余时间",
          "stats": "信息",
          "calendar": "日历"
        },
        "digital": {
          "format": {
            "24h": "24小时格式",
            "12h": "12 小时格式"
          },
          "period": {
            "am": "AM",
            "pm": "PM"
          },
          "dateLine": "{weekday}、{month}/{day}/{year}",
          "timeLine12": "{period} {hour}:{minute}:{second}",
          "timeLine24": "{hour}:{minute}:{second}"
        },
        "analog": {
          "type": {
            "12h": "标准模拟时钟",
            "24h": "24小时模拟时钟"
          }
        },
        "weekdays": {
          "0": "太阳",
          "1": "周一",
          "2": "周二",
          "3": "周三",
          "4": "周四",
          "5": "周五",
          "6": "周六"
        },
        "dates": {
          "full": "{weekday}、{month}/{day}/{year}"
        },
        "era": {
          "reiwa": "令和",
          "heisei": "平成",
          "showa": "昭和",
          "taisho": "大正",
          "meiji": "明治",
          "format": "{era}年份{year}",
          "unknown": "未知"
        },
        "eto": {
          "stems": {
            "0": "Kinoe",
            "1": "Kinoto",
            "2": "日野",
            "3": "Hinoto",
            "4": "Tsuchinoe",
            "5": "Tsuchinoto",
            "6": "卡诺",
            "7": "卡诺托",
            "8": "水之江",
            "9": "Mizunoto"
          },
          "branches": {
            "0": "老鼠",
            "1": "Ox",
            "2": "老虎",
            "3": "兔子",
            "4": "龙",
            "5": "贪吃蛇",
            "6": "马",
            "7": "山羊",
            "8": "猴子",
            "9": "Rooster",
            "10": "狗",
            "11": "野猪"
          },
          "format": "{stem}-{branch}"
        },
        "season": {
          "winter": "冬季",
          "spring": "Spring",
          "summer": "夏天",
          "autumn": "秋天",
          "unknown": "未知"
        },
        "solarTerms": {
          "risshun": "立春",
          "usui": "雨水",
          "keichitsu": "昆虫觉醒",
          "shunbun": "春分",
          "seimei": "清晰明亮",
          "kokuu": "谷雨",
          "rikka": "立夏",
          "shoman": "谷物满",
          "boshu": "谷物在耳",
          "geshi": "夏至",
          "shosho": "较小的热量",
          "taisho": "更热",
          "risshu": "立秋",
          "shoshoLimitHeat": "热量限制",
          "hakuro": "白露",
          "shubun": "秋分",
          "kanro": "冷露",
          "soko": "冰霜下降",
          "rittou": "立冬",
          "shosetsu": "小雪",
          "taisetsu": "更大的雪",
          "touji": "冬至",
          "shokan": "小冷",
          "dahan": "更寒冷",
          "nextDate": "{month}/{day}/{year}",
          "description": "上一张{previous} → 下一张{next} ({nextDate}, {duration})"
        },
        "duration": {
          "prefix": {
            "future": "运行测试",
            "past": "前"
          },
          "unit": {
            "year": "{value}年",
            "day": "{value} 天",
            "hour": "{value} h",
            "minute": "{value} 分钟",
            "second": "{value} s"
          },
          "joiner": " "
        },
        "progress": {
          "labels": {
            "millennium": "千年",
            "century": "世纪",
            "decade": "十年",
            "year": "年",
            "month": "月份",
            "day": "日",
            "hour": "小时",
            "minute": "分钟",
            "second": "第二"
          },
          "percent": "{value}%"
        },
        "remaining": {
          "labels": {
            "nextSecond": "下一秒",
            "nextMinute": "下一分钟",
            "nextHour": "下一小时",
            "nextDay": "第二天",
            "nextMonth": "下个月",
            "nextYear": "明年"
          },
          "delta": "（±{millis}毫秒）",
          "value": "{duration}{delta}"
        },
        "stats": {
          "labels": {
            "unix": "UNIX时间",
            "ticks": "已用毫秒数",
            "iso": "ISO 8601",
            "yearday": "一年中的某一天",
            "daySeconds": "今天秒",
            "timezone": "时区",
            "locale": "语言环境"
          },
          "yeardayValue": "日 {value}",
          "daySecondsValue": "{value} s",
          "timezoneFallback": "本地",
          "localeFallback": "未知"
        },
        "calendar": {
          "settings": {
            "title": "定制假期/工作日 设置",
            "holidayTitle": "添加为假期",
            "workdayTitle": "添加为工作日",
            "add": "添加",
            "empty": "没有任何",
            "remove": "删除"
          },
          "info": {
            "summary": "日期：{date}",
            "era": "日文纪元：{era} |星座：{eto}",
            "season": "季节：{season} |季度{quarter}",
            "progress": "日{dayOfYear} | ISO 周 {isoWeek} |每月第 {weekOfMonth} 周",
            "status": "状态：{status}"
          },
          "status": {
            "rest": "休息日",
            "workday": "预期工作日",
            "holiday": "标记假期",
            "workdayOverride": "标记工作日",
            "separator": "/"
          },
          "controls": {
            "prev": "← 上一页",
            "next": "下一步 →",
            "today": "今天"
          },
          "monthLabel": "{year}-{month}",
          "today": "今天：{date}"
        },
        "common": {
          "yes": "是",
          "no": "不"
        },
        "overview": {
          "gregorian": "公历： {month}/{day}/{year} ({weekday})",
          "era": "日本时代：{era}",
          "eto": "星座：{eto} |帝国年份：{imperial}",
          "season": "季节： {season} |节气：{solarTerm}",
          "leapYear": "闰年：{value}"
        },
        "xp": {
          "note": "秒：+{second} /分钟：+{minute} /小时：+{hour} /日：+{day} / 月份：+{month} / 年：+{year} / 世纪：+{century} / 千年：+{millennium}"
        }
      },
      "xiangqi": {
        "header": {
          "title": "象棋",
          "subtitle": "{color}移动"
        },
        "controls": {
          "reset": "重置位置"
        },
        "board": {
          "riverLabel": "楚河汉疆"
        },
        "color": {
          "red": "红色",
          "black": "黑色",
          "redPlayer": "红色（下）",
          "blackPlayer": "黑色(上)"
        },
        "pieces": {
          "general": "一般",
          "advisor": "顾问",
          "elephant": "大象",
          "horse": "马",
          "chariot": "战车",
          "cannon": "大炮",
          "soldier": "士兵"
        },
        "expLabel": "EXP",
        "piece": {
          "description": "{color} {piece}"
        },
        "status": {
          "turnLine": "转动：{turn}",
          "turn": {
            "red": "这是{color}的动作。",
            "black": "这是{color}的动作。"
          },
          "scoreLine": "总分：{score}",
          "capture": "{actor}捕获{target} (+{exp}{expLabel})",
          "move": "{piece}移动。",
          "win": "{loser}被将死。 {winner}获胜！",
          "stalemate": "僵局（无合法动作）。",
          "check": "{defender}处于检查状态"
        }
      },
      "mancala": {
        "actions": {
          "restart": "重新启动",
          "hint": "提示"
        },
        "hud": {
          "score": {
            "player": "你",
            "ai": "AI",
            "separator": "："
          }
        },
        "board": {
          "store": {
            "player": "你",
            "ai": "AI"
          },
          "pitLabel": {
            "player": "你{index}",
            "ai": "人工智能{index}"
          }
        },
        "status": {
          "start": "轮到你—选择播种坑。",
          "extraTurn": {
            "player": "额外回合！再选一个坑。",
            "ai": "AI又获得了一个回合..."
          },
          "turn": {
            "player": "轮到你了",
            "aiThinking": "AI正在思考…"
          },
          "result": {
            "draw": "抽奖！ {player}到{ai}",
            "win": "胜利！ {player}至{ai}",
            "loss": "击败…{player}至{ai}"
          },
          "hint": "提示：坑{pit}看起来很有前途"
        },
        "history": {
          "who": {
            "player": "你",
            "ai": "AI"
          },
          "entry": {
            "pit": "坑{number}",
            "store": "商店+{amount}",
            "capture": "捕获 {amount}",
            "extraTurn": "额外回合",
            "separator": "/"
          }
        }
      },
      "system": {
        "header": {
          "title": "系统监察员",
          "subtitle": "在一个仪表板中查看 PC、操作系统、浏览器和网络信息",
          "sessionXp": "会话经验 {xp}"
        },
        "tabs": {
          "pc": "PC",
          "os": "清除变量",
          "browser": "浏览器",
          "ip": "知识产权"
        },
        "pcSubTabs": {
          "pc-info": "概述",
          "pc-monitor": "硬件监控"
        },
        "controls": {
          "copySummary": "文案摘要",
          "refreshHardware": "刷新硬件 统计",
          "refreshOs": "重新加载",
          "refreshBrowser": "重新分析",
          "fetchIp": "获取IP信息",
          "cancelIp": "取消获取",
          "copyIp": "复制结果"
        },
        "sections": {
          "pcInfo": {
            "title": "系统信息"
          },
          "monitor": {
            "title": "实时监控",
            "note": "估计使用标准浏览器API。值可能与实际系统使用情况不同。"
          },
          "os": {
            "title": "操作系统详情"
          },
          "browser": {
            "title": "浏览器详情"
          },
          "ip": {
            "title": "知识产权详情"
          }
        },
        "pcInfo": {
          "motherboard": "主板",
          "cpuFamily": "CPU系列",
          "cpuThreads": "CPU线程",
          "cpuFrequency": "CPU频率",
          "architecture": "建筑学",
          "memory": "内存容量",
          "jsHeap": "JS堆限制",
          "storage": "存储估算",
          "touch": "接触点",
          "gpuVendor": "GPU 供应商",
          "gpuName": "GPU名称",
          "gpuMemory": "GPU内存",
          "battery": {
            "charging": "正在充电",
            "discharging": "放电"
          },
          "notes": {
            "motherboardUnavailable": "浏览器无法暴露主板信息。",
            "cpuFrequencyUnavailable": "CPU频率不是 通过网络标准公开。",
            "jsHeapChromeOnly": "仅由基于 Chromium 的浏览器报告。",
            "storageEstimate": "通过 navigator.storage.estimate() 进行估算。",
            "gpuWebgl": " 从 WEBGL_debug_renderer_info 检索。",
            "gpuDisabled": "WebGL 可能被禁用。",
            "gpuMemoryUnavailable": "浏览器不会显示总GPU内存。",
            "batteryUnavailable": "电池状态 API 不可用或不允许。"
          },
          "values": {
            "cpuThreads": "{threads}线程",
            "deviceMemory": "{memory} GB (navigator.deviceMemory)",
            "battery": "{level} ({state})"
          }
        },
        "monitor": {
          "cpu": "CPU使用率（估计）",
          "loopLag": "事件循环滞后",
          "fps": "帧更新 (FPS)",
          "jsHeap": "JS堆使用",
          "deviceMemory": "物理内存（估计）",
          "notes": {
            "cpuUsage": "根据事件循环延迟估计。",
            "loopLag": "与setInterval基线的差异。",
            "fps": "源自requestAnimationFrame。",
            "memoryUsage": "利用{percent}",
            "memoryChromeOnly": "仅在Chromium浏览器中可用。",
            "memoryUnavailable": "性能.内存不可用。",
            "deviceMemoryEstimate": "来自 navigator.deviceMemory 的近似值。"
          }
        },
        "os": {
          "name": "操作系统名称",
          "version": "版本",
          "build": "构建",
          "bitness": "位数",
          "platform": "平台",
          "timezone": "时区",
          "locale": "语言环境",
          "languages": "首选语言",
          "uptime": "正常运行时间（估计）",
          "lastChecked": "最后更新",
          "notes": {
            "buildUnavailable": "浏览器不提供详细的构建编号。",
            "uptime": "操作系统正常运行时间不可用；显示浏览器运行时。"
          },
          "values": {
            "uptime": "{hours}小时（浏览器运行时间）"
          }
        },
        "browser": {
          "name": "浏览器名称",
          "version": "版本",
          "engine": "渲染引擎",
          "agent": "用户代理",
          "brands": "品牌信息",
          "vendor": "供应商",
          "doNotTrack": "请勿追踪",
          "online": "在线状态",
          "cookies": "饼干",
          "storage": "存储API",
          "features": "密钥 API",
          "html5": "HTML5 支持（核心 API）",
          "status": {
            "online": "在线",
            "offline": "离线",
            "dntEnabled": "启用",
            "dntDisabled": "禁用",
            "cookiesEnabled": "可用",
            "cookiesDisabled": "禁用"
          },
          "notes": {
            "noFeatures": "未检测到主要 API。",
            "html5Unknown": "无法确定。"
          }
        },
        "ip": {
          "statusIdle": "需要网络访问。按获取按钮。",
          "statusSource": "通过{source}",
          "ip": "IP地址",
          "hostname": "主机名",
          "city": "城市",
          "region": "地区",
          "country": "国家",
          "loc": "纬度/经度",
          "org": "组织/ISP",
          "postal": "邮政代码",
          "timezone": "时区",
          "asn": "ASN",
          "userAgent": "特工",
          "updated": "上次检索"
        },
        "status": {
          "unavailable": "不可用",
          "unknown": "未知",
          "notAvailable": "-",
          "loading": "加载中…",
          "failed": "失败"
        },
        "errors": {
          "hardwareFetch": "获取信息失败。",
          "ipCancelled": "获取取消。",
          "ipFetch": "无法获取 IP 详细信息。防火墙或离线环境可能会阻止访问。"
        },
        "summary": {
          "header": "[系统摘要] {timestamp}",
          "cpu": "CPU：{family} / {threads}线程/arch {arch}",
          "memory": "内存：{memory}（JS堆限制{heap}）",
          "gpu": "GPU：{name}（供应商{vendor}）",
          "os": "操作系统：{name} {version} ({bitness})",
          "browser": "浏览器：{name} {version} ({engine})",
          "ip": "IP：{ip} @ {city}，{country}"
        }
      },
      "falling_puyos": {
        "floating": {
          "clear": "清除！",
          "chain": "{chain}链！"
        },
        "hud": {
          "title": "掉落的 Puyos",
          "difficulty": "难度：{difficulty}",
          "totalCleared": "清除：{value}",
          "maxChain": "最大链：{value}",
          "lastClear": "最后通关：{value}"
        },
        "panel": {
          "next": "下一个"
        },
        "overlay": {
          "gameOver": "游戏结束",
          "restartHint": "按R恢复/重试"
        },
        "badge": {
          "chain": "{chain}链！"
        },
        "difficulty": {
          "easy": "EASY",
          "normal": "正常",
          "hard": "困难"
        }
      },
      "pinball_xp": {
        "ui": {
          "controls": {
            "flippers": "翻板：← / → 或 A/D",
            "plunger": "柱塞：按住空格充电并发射",
            "reset": "重置：按R"
          },
          "mission": {
            "label": "任务：",
            "none": "没有任何",
            "hint": "完成左/中/右通道以开始新任务",
            "progress": "进度：{progressText} / {targetText}（还剩{remainingSecondsText}）"
          },
          "skillShot": {
            "active": "技能射击：剩余 {lane} / {secondsText} 条巷",
            "ready": "技能射击准备就绪：瞄准{lane}车道！",
            "next": "下一个技能射击目标：车道{lane}"
          },
          "holdHint": "按空格键启动"
        },
        "missions": {
          "bumperBlitz": {
            "name": "保险杠闪电战",
            "description": "击中保险杠6次。"
          },
          "slingStorm": {
            "name": "吊索风暴",
            "description": "触发弹弓 4 次。"
          },
          "laneMaster": {
            "name": "巷长",
            "description": "完成L/M/R车道设置两次。"
          },
          "postChallenge": {
            "name": "挑战后",
            "description": "点击帖子 5 次。"
          }
        },
        "announcements": {
          "missionStart": {
            "named": "任务开始：{mission}",
            "generic": "任务开始！"
          },
          "missionComplete": {
            "named": "任务完成：{mission}！ +{rewardText} 经验值",
            "generic": "任务完成！ +{rewardText} EXP"
          },
          "missionFailed": {
            "named": "任务失败： {mission}…",
            "generic": "任务失败..."
          },
          "combo": "组合{countText}！ +{xpText} 经验值",
          "skillShotSuccess": "技能射击！ +{xpText} EXP"
        },
        "hud": {
          "combo": {
            "none": "-"
          },
          "status": "球：{livesText} / 得分：{scoreText} / 经验：{expText} / 链：x{chainText} / 连击：{comboText}"
        }
      },
      "trump_games": {
        "layout": {
          "navHeader": "纸牌游戏",
          "title": "王牌选择",
          "difficulty": "难度{difficulty} ×{multiplier}",
          "settings": "设置"
        },
        "placeholder": {
          "primary": "从左侧列表中选择一个游戏。",
          "separator": "/",
          "phaseInfo": "阶段{phase}： {games}"
        },
        "status": {
          "selectGame": "选择一个游戏开始。",
          "comingSoon": "该游戏仍在开发中。请期待未来的更新。",
          "devPlaceholder": "目前正在开发"
        },
        "actions": {
          "returnToHub": "返回选择",
          "default": "行动",
          "backToList": "返回列表"
        },
        "list": {
          "badge": {
            "comingSoon": "即将推出",
            "bestScore": "最佳{score}"
          },
          "unimplemented": {
            "phase": "预定阶段 {phase}。",
            "status": "准备内容。"
          }
        },
        "errors": {
          "initToast": "初始化游戏失败。",
          "initFallback": "初始化失败。请尝试不同的游戏。"
        },
        "settings": {
          "heading": "设置",
          "cardBack": "卡背主题",
          "autoFlip": "自动翻转浓度中不匹配的牌"
        },
        "cardBacks": {
          "classic": {
            "label": "经典",
            "description": "海军经典图案"
          },
          "modern": {
            "label": "现代",
            "description": "生动的网络风格"
          },
          "forest": {
            "label": "森林",
            "description": "带有金色口音的深绿色渐变"
          }
        },
        "games": {
          "memory": {
            "title": "浓度",
            "description": "翻转卡片以找到匹配对。"
          },
          "blackjack": {
            "title": "Blackjack",
            "description": "与庄家战斗达到21。"
          },
          "baba": {
            "title": "老处女",
            "description": "避免是最后一个持有的玩家 小丑。"
          },
          "klondike": {
            "title": "纸牌 (Klondike)",
            "description": "对七列画面进行排序，建立基础。"
          },
          "spider": {
            "title": "蜘蛛纸牌",
            "description": "完成全套套装序列以清除栏。"
          },
          "freecell": {
            "title": "空当接龙",
            "description": "使用四个空闲单元解决每个布局。"
          },
          "hearts": {
            "title": "红心",
            "description": "躲避红心的戏法游戏。"
          },
          "sevens": {
            "title": "七人",
            "description": "从每张七张牌开始向外打牌。"
          },
          "poker": {
            "title": "抽扑克牌",
            "description": "打造强大的扑克牌，获得大分。"
          },
          "jiji": {
            "title": "吉吉老处女",
            "description": "可配置的老女仆变体小丑。"
          },
          "daifugo": {
            "title": "大风宫",
            "description": "高风险的革命蜕变游戏。"
          },
          "pageone": {
            "title": "第一页",
            "description": "经典脱落 启发UNO的游戏。"
          },
          "uno": {
            "title": "UNO",
            "description": "在 UNO 风格的游戏中匹配颜色和数字。"
          }
        },
        "common": {
          "actions": {
            "hint": "提示(H)",
            "restart": "重新启动（R）",
            "returnToList": "游戏列表(B)",
            "newGame": "新游戏（R）",
            "rematch": "再玩一次"
          },
          "hud": {
            "scoreSummary": "总{plays}游戏/最佳{best} /手牌{hand}卡牌",
            "noRecord": "---",
            "bestPlace": "放置{place}"
          },
          "status": {
            "turn": "轮到{name}了"
          },
          "youSuffix": "（你）",
          "hand": {
            "empty": "无卡",
            "cleared": "完成（地点{place}）"
          },
          "labels": {
            "empty": "---"
          },
          "player": {
            "finished": "安全地点{place}"
          }
        },
        "sevens": {
          "players": {
            "you": "你",
            "north": "北",
            "east": "东",
            "west": "西方"
          },
          "log": {
            "startingCard": "{name}放置{card}开始。",
            "playCard": "{name}放置在{card}。",
            "pass": "{name}通过。"
          },
          "toast": {
            "invalidCard": "你不能打那张牌。",
            "cardsAvailable": "你仍然有可以打的牌。",
            "everyonePassed": "大家都通过了。等到情况发生变化。",
            "victory": "{name}获胜！"
          },
          "actions": {
            "restart": "重赛 (R)",
            "pass": "通过"
          },
          "player": {
            "handCount": "手中有 {count} 卡"
          },
          "status": {
            "turn": "回合：{name} ・连续通过{passes}"
          },
          "hud": {
            "leaderDetail": "{name}（{count}卡）",
            "noLeader": "-",
            "score": "最少卡：{summary}"
          }
        },
        "daifugo": {
          "players": {
            "you": "你",
            "north": "北",
            "east": "东",
            "west": "西方"
          },
          "pile": {
            "title": "当前场地",
            "reset": "重置",
            "requirement": "必填值：{value}"
          },
          "status": {
            "lead": "主角：{name}",
            "playAny": "打出任意一张牌。",
            "mustBeatOrPass": "发挥更强 卡片或通行证（P）。",
            "roundEnd": "轮次完成"
          },
          "history": {
            "playCard": "{name}: {card}",
            "pass": "{name}：通过"
          },
          "toast": {
            "invalidCard": "你不能打那张牌。",
            "cannotPassLead": "你不能 传递开局线索。"
          },
          "actions": {
            "pass": "通过（P）",
            "restart": "重新启动（R）",
            "nextRound": "下一轮 (R)"
          },
          "playersMeta": {
            "finished": "放置{place}",
            "handCount": "{count}卡片"
          },
          "hud": {
            "bestPlace": "放置{place}",
            "noRecord": "---",
            "scoreSummary": "总 {plays} 场比赛 / 胜利 {wins} / 最佳 {best}"
          }
        },
        "klondike": {
          "labels": {
            "stock": "库存",
            "waste": "浪费",
            "foundation": "{symbol}基础"
          },
          "info": {
            "initial": "从库存中抽取或移动工作牌。",
            "selectDestination": "选择目的地。只有国王可以填充空列。",
            "recyclePrompt": "点击废物堆回收库存。",
            "finished": "恭喜！尝试新的交易来测试您的技能。"
          },
          "actions": {
            "drawStock": "绘制库存(D)",
            "autoFoundation": "自动转为基础(A)",
            "newGame": "新政（R）"
          },
          "status": {
            "summary": "移动{moves} ・回收{recycles} ・库存{stock} ・废物{waste} ・基础{foundation}"
          },
          "hud": {
            "bestMoves": "{moves} 移动",
            "scoreSummary": "总 {plays} 场比赛 / 胜利 {wins} / 最佳 {best}"
          },
          "placeholders": {
            "recycle": "Redeal",
            "empty": "空"
          },
          "toast": {
            "newLayout": "开始新的交易。",
            "emptyStock": "库存和废物都是空的。",
            "recycledWaste": "将废物返回库存。",
            "noFoundationSpace": "地基上没有可用空间。",
            "invalidTableauMove": "你不能移动到该列。",
            "lockedCard": "你还不能翻转这张牌。",
            "cleared": "清除克朗代克！"
          }
        },
        "memory": {
          "actions": {
            "retry": "再玩一次 (R)"
          },
          "toast": {
            "resolveOpenCards": "关闭打开的卡片，然后再翻转另一张。",
            "manualReset": "不匹配。点击卡片将其正面朝下。",
            "cleared": "清除！时间 {time} / 错过 {misses}"
          },
          "flip": {
            "auto": "自动",
            "manual": "手动"
          },
          "status": {
            "summary": "对{matches}/{pairs} ・未击中{misses} ・时间{time} ・翻转{mode}"
          },
          "hud": {
            "bestSeconds": "{seconds}s",
            "scoreSummary": "总{plays}游戏/最佳{best}"
          }
        },
        "hearts": {
          "actions": {
            "newDeal": "新政（R）",
            "nextDeal": "下一笔交易(R)"
          },
          "players": {
            "you": "你",
            "north": "北",
            "east": "东",
            "west": "西方",
            "meta": "手牌{hand}卡/回合{round}分/总计{total}积分"
          },
          "status": {
            "summary": "技巧 {trick}/13 ・ 心碎 {status}",
            "heartsBroken": {
              "yes": "损坏",
              "no": "尚未"
            }
          },
          "hud": {
            "scoreEntry": "{name} {score} 分",
            "scoreSummary": "{you} / {north} / {east} / {west}"
          },
          "summary": {
            "heartStatus": {
              "yes": "是",
              "no": "不"
            },
            "heartsBroken": "心碎：{status}",
            "rankingEntry": "{name}: {score}点",
            "roundResult": "回合结果：{ranking}",
            "turn": "{name} 了。",
            "lead": "{name}线索。"
          },
          "toast": {
            "roundWin": "赢得红心交易！",
            "invalidCard": "你不能打那张牌。"
          }
        },
        "spider": {
          "actions": {
            "dealStock": "发牌股票(D)",
            "playAgain": "再玩一次 (R)"
          },
          "toast": {
            "suitRunOnly": "你只能移动相同花色的棋子。",
            "invalidDrop": "你不能在该列上放置卡片。",
            "noDealToEmpty": "当列为空时无法处理。",
            "sequenceComplete": "完成了{card}套装序列！",
            "cleared": "蜘蛛纸牌已通关！"
          },
          "meta": {
            "stock": "库存交易{count}",
            "completed": "已完成{completed} / 8"
          },
          "status": {
            "summary": "移动{moves} ・完成{completed}/8 ・库存{stock}"
          },
          "hud": {
            "score": "分数 {score} ・ 正面朝上{columns}"
          }
        },
        "freecell": {
          "toast": {
            "alternatingRun": "只有交替颜色序列可以移动。",
            "notEnoughSpace": "没有足够的可用单元或空列。",
            "invalidColumnDrop": "仅交替颜色降序 ",
            "cellSingle": "单元格只能容纳一张卡。",
            "cellOccupied": "该单元格已经有一张牌。",
            "foundationOneAtATime": "基础一次接受一张卡。",
            "foundationSuit": "卡牌必须与花色相符。",
            "foundationExpected": "预计{rank}。",
            "noMoves": "没有可用的移动。",
            "cleared": "空当接龙已清除！恭喜。"
          },
          "hint": {
            "moveToEmpty": "{card}可以移动到一个空列。",
            "moveToStack": "{card}可以移动到{target}。",
            "moveToFoundation": "{card}可以移动到地基。"
          },
          "status": {
            "summary": "行动{moves} ・免费细胞{freeCells} ・基金会{foundations}"
          },
          "hud": {
            "bestMoves": "{value} 移动",
            "scoreSummary": "总 {plays} 场比赛 / 胜利 {wins} / 最佳 {best}"
          }
        },
        "baba": {
          "status": {
            "humanTurn": "你的回合：点击你右边玩家的牌。 （手{cards}卡）"
          },
          "toast": {
            "hint": "点击右侧的玩家抽一张牌。",
            "start": "游戏开始！从你右边的玩家中抽一张牌。",
            "finish": "完成！地点{place}",
            "loser": "{name}拿着小丑。游戏结束！"
          }
        },
        "poker": {
          "playerTitle": "你的手牌",
          "status": {
            "selectHolds": "选择要持有的牌，然后按抽奖键。",
            "resultSummary": "获奖者：{winners} ・您放置了{placement} ({hand})"
          },
          "hud": {
            "scoreSummary": "总共 {plays} 手/胜利 {wins} / 最佳 {best}"
          },
          "players": {
            "you": "你"
          },
          "opponents": {
            "ai1": "AI-1",
            "ai2": "人工智能2",
            "ai3": "AI-3"
          },
          "actions": {
            "draw": "绘制（D）",
            "showdown": "对决(S)",
            "newHand": "新手(R)",
            "nextHand": "下一手（R）"
          },
          "toast": {
            "holdHint": "将卡片标记为HOLD以保留 ",
            "strategyHint": "计划好你的握点以追逐强手。",
            "atLeastOneHold": "保留至少一张牌。",
            "maxDiscards": "你最多可以丢弃三张牌。"
          },
          "opponent": {
            "waiting": "等待抽奖…"
          },
          "summary": {
            "holdHint": "卡牌一直显示HOLD。",
            "deckCount": "牌组：{count}卡牌",
            "placement": "落点：{place}"
          },
          "hands": {
            "highCard": "高卡",
            "onePair": "一对",
            "twoPair": "两对",
            "threeKind": "三个同类",
            "straight": "直线",
            "flush": "同花",
            "fullHouse": "满屋",
            "fourKind": "四类",
            "straightFlush": "同花顺",
            "royalFlush": "同花顺"
          }
        },
        "pageone": {
          "players": {
            "you": "你",
            "north": "北",
            "east": "东",
            "west": "西方"
          },
          "labels": {
            "deck": "甲板",
            "discard": "丢弃",
            "deckCount": "{count}卡片"
          },
          "status": {
            "playable": "玩一张匹配等级或花色的牌。",
            "currentCard": "当前桩：{card}",
            "yourTurn": "轮到你了。",
            "turnOf": "轮到{name}了",
            "winner": "{name}获胜！"
          },
          "actions": {
            "draw": "绘制（D）",
            "declare": "宣告(P)",
            "restart": "重新启动（R）"
          },
          "toast": {
            "declareReminder": "还剩一张卡！按“声明”。",
            "alreadyDeclared": "你已经声明了。",
            "invalidDeclare": "只能声明一张牌。",
            "pageOne": "第一页！",
            "missedDeclare": "无声明--10 EXP。",
            "invalidCard": "你不能打那张牌。"
          },
          "opponents": {
            "meta": "{count}卡片",
            "metaDeclared": "{count}卡/声明"
          },
          "hud": {
            "scoreSummary": "总共 {plays} 局 / 胜利 {wins}"
          }
        },
        "uno": {
          "players": {
            "you": "你",
            "north": "北",
            "east": "东",
            "west": "西方"
          },
          "labels": {
            "deck": "牌堆",
            "discard": "弃牌堆",
            "deckCount": "{count}张牌",
            "currentColor": "当前颜色: {color}",
            "unoDeclared": "UNO!"
          },
          "colors": {
            "red": "红色",
            "yellow": "黄色",
            "green": "绿色",
            "blue": "蓝色",
            "none": "未指定"
          },
          "cards": {
            "skip": "跳过",
            "reverse": "反转",
            "draw2": "抽两张",
            "wild": "万能牌",
            "wild4": "万能抽四"
          },
          "actions": {
            "draw": "抽牌 (D)",
            "pass": "过牌 (Space)",
            "declare": "喊UNO (U)",
            "restart": "重新开始 (R)",
            "choose": {
              "red": "选红色",
              "yellow": "选黄色",
              "green": "选绿色",
              "blue": "选蓝色"
            }
          },
          "status": {
            "yourTurn": "轮到你了。",
            "turnOf": "轮到{name}了",
            "chooseColor": "请选择要宣告的颜色。",
            "winner": "{name}获胜！",
            "currentCard": "牌堆: {card}",
            "currentColor": "当前颜色: {color}",
            "directionClockwise": "顺时针",
            "directionCounterClockwise": "逆时针"
          },
          "toast": {
            "missedUno": "忘记喊 UNO！罚抽 2 张。",
            "aiMissedUno": "{name} 忘记喊 UNO，被罚抽 2 张。",
            "invalidDeclare": "只剩 1 张牌时才能喊 UNO。",
            "alreadyDeclared": "已经喊过 UNO。",
            "declared": "UNO！",
            "drawLimit": "每回合只能抽 1 张牌。",
            "emptyDeck": "没有可抽的牌。",
            "drawnPlayable": "抽到 1 张牌，可以出符合条件的牌。",
            "noPlayable": "没有可出的牌，自动过牌。",
            "mustDraw": "过牌前请先抽一张。",
            "invalidCard": "这张牌无法出。",
            "reminderUno": "只剩 1 张牌！请按“喊UNO”。",
            "aiUno": "{name} 喊了 UNO！",
            "colorChosen": "已选择 {color}。",
            "forcedDraw": "{name} 抽了 {count} 张牌。",
            "skip": "{name} 被跳过。"
          },
          "hud": {
            "scoreSummary": "总共 {plays} 局 / 胜利 {wins}"
          },
          "opponent": {
            "handCount": "{count}张牌"
          }
        },
        "jiji": {
          "table": {
            "label": "桌卡空间",
            "rank": "排名：{rank}",
            "none": "无桌卡"
          },
          "controls": {
            "swap": {
              "enable": "交换模式",
              "disable": "退出交换模式"
            }
          },
          "status": {
            "humanTurn": "你的回合：需要时与桌子交换，然后从你右边的玩家中抽奖。",
            "selectSwap": "从手牌中选择一张牌进行交换。",
            "humanDraw": "与牌桌交换或从右手玩家处抽牌。"
          },
          "toast": {
            "noTable": "没有可交换的桌卡。",
            "hint": "匹配牌桌等级即可从手牌中脱牌。",
            "swapped": "与表卡交换。",
            "exitSwap": "退出交换模式第一。",
            "loser": "{name} 被 Jiji 困住了。游戏结束！",
            "tableMissing": "没有可用的表卡。",
            "cannotPlaceJiji": "不能将吉吉放在桌牌上。",
            "finish": "完成！地点{place}"
          }
        },
        "blackjack": {
          "labels": {
            "dealer": "荷官",
            "player": "玩家"
          },
          "actions": {
            "hit": "点击(H)",
            "stand": "立场(S)",
            "restart": "重新启动（R）",
            "nextHand": "下一手牌 (N)"
          },
          "messages": {
            "chooseAction": "选择击中或站立。",
            "chooseActionAlt": "选择“HIT”或“STAND”。",
            "blackjackPlayer": "黑杰克！",
            "blackjackDealer": "庄家有二十一点...",
            "blackjackPush": "两者都有二十一点。按下！",
            "bust": "胸围({value})",
            "totalPrompt": "总{value} / HIT或STAND",
            "dealerBust": "经销商被查封 ({value})",
            "dealerVsPlayer": "经销商 {dealer} 与 {player}",
            "playerWin": "你赢了！ {player} vs {dealer}",
            "push": "按({value})"
          },
          "status": {
            "tally": "获胜{wins} / 失败{losses} /推动{pushes}"
          },
          "hud": {
            "score": "总玩数{plays}/胜数{wins}"
          },
          "toast": {
            "consolation": "运气不好！下次你会得到它们。"
          }
        }
      },
      "gamble_hall": {
        "nav": {
          "title": "游戏选择",
          "items": {
            "roulette": {
              "label": "轮盘",
              "detail": "欧式37格"
            },
            "slot": {
              "label": "帕奇斯洛老虎机",
              "detail": "3 个卷轴 + 星星奖励"
            },
            "dice": {
              "label": "幸运骰子",
              "detail": "5种投注模式"
            }
          }
        },
        "sidebar": {
          "balanceLabel": "余额",
          "sessionNetLabel": "会话网络",
          "maxWinLabel": "Max Win"
        },
        "header": {
          "balanceLabel": "可用EXP",
          "betLabel": "下注金额",
          "sessionNet": "会话网络",
          "biggestWin": "最大胜利",
          "betPlaceholder": "10",
          "betAdjust": {
            "plus10": "+10",
            "plus50": "+50",
            "max": "MAX"
          }
        },
        "hud": {
          "expValue": "{value} EXP",
          "netValue": "{delta} 经验值"
        },
        "history": {
          "title": "最近结果",
          "empty": "还没有游戏历史记录。",
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
            "detail": "{faces} / 总{totalFormatted}"
          }
        },
        "roulette": {
          "spin": "旋转",
          "numberOption": "编号{number}",
          "result": {
            "numberLabel": "编号{number}",
            "detail": "号{number} {color}"
          },
          "betTypes": {
            "colorRed": "红色",
            "colorBlack": "黑色",
            "colorGreen": "绿色(0)",
            "parityEven": "甚至",
            "parityOdd": "奇数",
            "number": "选择一个数字"
          },
          "colors": {
            "red": "红色",
            "black": "黑色",
            "green": "绿色",
            "unknown": "未知"
          },
          "results": {
            "colorRed": {
              "hit": "红色点击",
              "miss": "红色小姐"
            },
            "colorBlack": {
              "hit": "黑色命中",
              "miss": "黑色未击中"
            },
            "colorGreen": {
              "hit": "0 命中！",
              "miss": "0 小姐"
            },
            "parityEven": {
              "hit": "连击",
              "miss": "即使错过"
            },
            "parityOdd": {
              "hit": "奇怪的命中",
              "miss": "奇怪的小姐"
            },
            "number": {
              "hit": "击中{number}！",
              "miss": "{number}小姐"
            },
            "miss": "小姐"
          }
        },
        "slot": {
          "start": "开始",
          "hint": "匹配符号或地星对以获得更大的奖金！",
          "results": {
            "jackpot": "第777章 大奖！",
            "barTriple": "三重BAR！",
            "triple": "三连击！",
            "pairWithStar": "{symbol}对+星星！",
            "pair": "{symbol}对！",
            "miss": "未命中…"
          }
        },
        "dice": {
          "buttons": {
            "roll": "滚动"
          },
          "mode": {
            "option": "{label} x{multiplier}",
            "hintDisplay": "{hint} (x{multiplier})"
          },
          "modes": {
            "high": {
              "label": "高 (11-18)",
              "hint": "总计 11 或更多支付 x2。三元组除外。"
            },
            "low": {
              "label": "低(3-10)",
              "hint": "总共10个或以下支付x2。排除三元组。"
            },
            "lucky7": {
              "label": "幸运7",
              "hint": "总共7个即可获得高额奖金！"
            },
            "allDiff": {
              "label": "所有不同",
              "hint": "所有三个面都不同 支付 x4。"
            },
            "triple": {
              "label": "三重",
              "hint": "所有面孔都匹配巨额赔付！"
            },
            "unknown": "未知"
          },
          "rollingLabel": "滚动...",
          "resultLine": "滚动{faces}（总计{totalFormatted}）",
          "results": {
            "hit": "胜利！",
            "miss": "未命中…"
          }
        },
        "status": {
          "ready": "下注开始游戏。",
          "betRequired": "输入下注金额。",
          "slotBusy": "请等待卷轴停止...",
          "notEnoughExp": "经验不足。",
          "slotSpinning": "旋转卷轴...",
          "slotResult": "{game}: {result} {net}",
          "diceBusy": "请等待结果...",
          "diceRolling": "掷骰子…",
          "diceResult": "{game}：{mode} {outcome} {net}",
          "rouletteBusy": "轮子仍在旋转...",
          "noExp": "没有可用的经验值。",
          "rouletteSpinning": "转动轮子……",
          "rouletteResult": "{game}: {result} ({detail}) {net}"
        }
      },
      "breakout_k": {
        "hud": {
          "lives": "生命：{count}",
          "destroyed": "已毁：{count}",
          "difficulty": "难度：{difficulty}",
          "controls": "使用← / →或A / D移动"
        }
      },
      "login_bonus": {
        "title": "登录奖励日历",
        "subtitle": "每天登录即可领取奖励。您的进度会自动保存。",
        "summary": {
          "total": "总索赔数：{countFormatted}",
          "month": "{monthName} {year}中的声明：{countFormatted}"
        },
        "calendar": {
          "monthLabel": "{monthName} {year}",
          "weekdayShort": {
            "sun": "太阳",
            "mon": "周一",
            "tue": "周二",
            "wed": "周三",
            "thu": "周四",
            "fri": "周五",
            "sat": "周六"
          },
          "badge": {
            "claimed": "已声明"
          }
        },
        "buttons": {
          "claimToday": "领取今日奖励"
        },
        "detail": {
          "descriptionTemplate": "{description}\n{effect}",
          "status": {
            "claimed": "已认领 ({time})",
            "today": "你可以认领这个 今天。",
            "expired": "已过期。仅记录先前领取的条目。",
            "locked": "尚不可用。请等到登录日期。"
          }
        },
        "messages": {
          "alreadyClaimed": "你已经领取了这个奖励。",
          "onlyToday": "只能领取今天的奖金。",
          "grant": {
            "header": "领取{date}的奖励。",
            "exp": "获得 +{amount} EXP。",
            "itemReceived": "已收到 {item} x{amount}。",
            "itemFailed": "无法接收{item}（不支持主机API？）。",
            "itemGeneric": "收到物品奖励。",
            "itemsReceived": "收到以下物品：{summary}",
            "itemsFailed": "由于主机API不支持，无法授予以下物品：{summary}",
            "spFilled": "SP完全恢复。",
            "spFillFailed": "SP已满或主机API不支持。",
            "spRecovered": "SP 由 {amount} 恢复。",
            "spReduced": "SP 减少 {amount}。",
            "spNoChange": "SP没有改变。",
            "spChanged": "SP会改变。",
            "default": "已领取奖励。",
            "specialTag": "特别活动：{tag}"
          }
        },
        "describe": {
          "exp": "EXP +{amount}",
          "itemQuantity": "{item} x{amount}可以领取。",
          "itemSingle": "你可以认领{item}。",
          "itemGeneric": "可领取物品奖励。",
          "itemsList": "你可以领取以下物品：{summary}",
          "spFill": "SP完全恢复。",
          "spRecover": "SP恢复{amount}。",
          "spReduce": "SP减少{amount}。",
          "spChange": "SP会改变。"
        },
        "format": {
          "itemSummary": "{item} x{amount}",
          "itemSummarySeparator": "/",
          "longDate": "{formatted}"
        },
        "items": {
          "potion30": "治疗物品",
          "hpBoost": "生命值提升",
          "atkBoost": "攻击力提升",
          "defBoost": "防御提升"
        },
        "rewards": {
          "exp333": {
            "label": "经验值{amount}",
            "description": "登录以接收 {amount} EXP。"
          },
          "exp777": {
            "label": "经验值{amount}",
            "description": "登录以接收 {amount} EXP。"
          },
          "exp2000": {
            "label": "EXP {amount}（{levels} 级别 ups)",
            "description": "以{amount} EXP向前跳跃！"
          },
          "heal10": {
            "label": "治疗物品x{amount}",
            "description": "立即抓取{amount} {item}。冒险前的完美准备。"
          },
          "item_set": {
            "label": "项目集（各{amount}）",
            "description": "接收每个核心项目的{amount}。"
          },
          "sp_full": {
            "label": "SP全恢复",
            "description": "完全恢复你的SP并释放你的技能！"
          },
          "exp1300": {
            "label": "经验值{amount}",
            "description": "另一个提升{amount} EXP的增长。"
          },
          "unknown": {
            "label": "未知奖励",
            "description": "奖励无法解决。"
          }
        },
        "specialRewards": {
          "monthEnd": {
            "label": "月末额外经验值{amount}",
            "description": "在月底登录以获得 {amount} EXP！强势开始下个月。"
          },
          "newYear": {
            "label": "新年特别经验{amount}",
            "description": "庆祝1月1日！领取{amount} EXP。"
          },
          "sunday": {
            "label": "治疗物品x{amount}",
            "description": "每周日，获得{amount} {item}！"
          }
        },
        "specialTags": {
          "monthEnd": "月末特殊",
          "newYear": "新年限定",
          "sunday": "周日奖励"
        }
      },
      "timer": {
        "title": "计时器",
        "subtitle": "通过简单的倒计时和秒表管理焦点和休息。",
        "xpBadge": {
          "current": "会话 EXP {amount}"
        },
        "modes": {
          "countdown": "倒计时",
          "stopwatch": "秒表"
        },
        "inputs": {
          "hours": "小时",
          "minutes": "分钟数",
          "seconds": "秒数"
        },
        "quickButtons": {
          "plus1m": "+1 分钟",
          "plus5m": "+5分钟",
          "plus10m": "+10 分钟",
          "minus1m": "-1 分钟",
          "pomodoro": "25分钟番茄钟"
        },
        "buttons": {
          "start": "开始",
          "pause": "暂停",
          "resume": "恢复",
          "reset": "重置"
        },
        "status": {
          "readyGeneric": "就绪",
          "readyCountdown": "倒计时就绪",
          "readyStopwatch": "秒表就绪",
          "countdownRunning": "计数...",
          "countdownResumed": "恢复",
          "paused": "已暂停",
          "completed": "完成！干得好",
          "stopwatchRunning": "运行...",
          "stopwatchMinute": "{minutes}分钟已过",
          "stopwatchMinuteWithXp": "{minutes}分钟已过去！"
        },
        "history": {
          "title": "最近日志",
          "labels": {
            "complete": "完成",
            "start": "开始",
            "stopwatchMinute": "过去了",
            "default": "进度"
          },
          "expGain": "{label}：+{xp} EXP",
          "completeNoXp": "计时器完成！"
        }
      },
      "exceler": {
        "header": {
          "title": "Exceler电子表格",
          "subtitle": "{filename} — {sheet}",
          "buttons": {
            "new": "新",
            "import": "导入",
            "export": "导出",
            "compatibility": "兼容性"
          }
        },
        "ribbon": {
          "tabs": {
            "home": "首页",
            "formulas": "公式",
            "view": "视图"
          },
          "groups": {
            "clipboard": "剪贴板",
            "font": "字体",
            "alignment": "对齐与边界",
            "number": "数字",
            "functionLibrary": "函数库",
            "formulaHelper": "配方辅助",
            "display": "显示",
            "zoom": "缩放"
          },
          "buttons": {
            "undo": "↺撤消",
            "redo": "↻获取重做",
            "alignLeft": "⟸左对齐",
            "alignCenter": "⇔对齐中心",
            "alignRight": "⟹对齐 右",
            "alignTop": "⇑对齐顶部",
            "alignMiddle": "⇕ 对齐中间",
            "alignBottom": "⇓对齐底部",
            "insertFunction": "插入功能",
            "insertSum": "Σ SUM",
            "insertAverage": "AVG",
            "insertIf": "IF"
          },
          "tooltips": {
            "fontSize": "字体大小",
            "borderColor": "边框颜色"
          },
          "borderOptions": {
            "placeholder": "边框样式",
            "outline": "大纲",
            "all": "所有边界",
            "top": "顶部边框",
            "bottom": "底部边框",
            "left": "左边界",
            "right": "右边框",
            "clear": "清除边界"
          },
          "numberFormats": {
            "general": "一般",
            "number": "数字",
            "currency": "货币",
            "percent": "百分比",
            "comma": "数千",
            "scientific": "科学",
            "date": "日期",
            "time": "时间"
          }
        },
        "formula": {
          "placeholder": "输入公式（例如 =SUM(A1:B3)）"
        },
        "functions": {
          "descriptions": {
            "SUM": "返回数字总和。",
            "AVERAGE": "返回数字的平均值。",
            "MIN": "返回最小值。",
            "MAX": "返回最大值。",
            "COUNT": "计算包含数字的单元格。",
            "COUNTA": "计算非空单元格数。",
            "IF": "根据条件返回一个值。",
            "ROUND": "四舍五入到指定的数字。",
            "ROUNDUP": "四舍五入到指定数字。",
            "ROUNDDOWN": "向下舍入到指定数字。",
            "ABS": "返回绝对值。",
            "INT": "返回整数部分。",
            "MOD": "返回除法的余数。",
            "POWER": "计算数字的幂。",
            "SQRT": "返回平方根。",
            "CONCAT": "将文本字符串连接在一起。",
            "CONCATENATE": "将文本字符串连接在一起。",
            "TEXT": "将数字格式化为文本。",
            "LEN": "返回文本字符串的长度。",
            "SUBTOTAL": "执行指定的小计计算。",
            "SUMIF": "对符合条件的值进行求和。",
            "COUNTIF": "对符合条件的单元进行计数。",
            "AVERAGEIF": "符合条件的平均值。",
            "IFERROR": "发生错误时返回备用值。",
            "PRODUCT": "将所有数字相乘。",
            "VLOOKUP": "查找 垂直数值并返回结果。",
            "HLOOKUP": "水平查找值并返回结果。",
            "INDEX": "按行和列从一定范围内返回一个值。",
            "MATCH": "返回查找值的位置。",
            "TODAY": "返回当前日期。",
            "NOW": "返回当前日期并 时间.",
            "DATE": "根据年、月、日建立日期。",
            "TIME": "构建时间值。",
            "UPPER": "将文本转换为大写.",
            "LOWER": "将文本转换为小写。",
            "LEFT": "从头开始返回字符。",
            "RIGHT": "从末尾返回字符。",
            "MID": "从中间返回字符。",
            "TRIM": "删除多余的空格。"
          }
        },
        "view": {
          "showGrid": "显示网格线"
        },
        "sheet": {
          "tab": {
            "tooltip": "点击 切换，双击重命名，右键更改选项卡颜色"
          },
          "add": {
            "tooltip": "添加新工作表"
          },
          "color": {
            "tooltip": "更改当前工作表选项卡颜色（右键单击可清除）"
          },
          "renamePrompt": "输入图纸名称",
          "duplicateName": "具有该名称的工作表已存在。"
        },
        "status": {
          "sessionXp": "会话经验：{value}"
        },
        "confirm": {
          "unsavedChanges": "您有未保存的更改。继续？"
        },
        "filename": {
          "newWorkbook": "新工作簿.xlsx",
          "defaultExport": "工作表.xlsx"
        },
        "warning": {
          "newWorkbook": "新工作簿有兼容性限制。不支持形状和宏。",
          "importLimited": "兼容性提示：形状、宏、外部参考和一些格式未导入。"
        },
        "alert": {
          "fileTooLarge": "文件太大（最多 5 MB）。",
          "importUnsupported": "兼容性提示：不支持的功能将被丢弃。",
          "importFailed": "加载失败： {message}",
          "exportCompatibility": "兼容性通知：形状、宏和某些格式/功能将不会被保存。",
          "exportFailed": "导出失败：{message}"
        },
        "errors": {
          "parseFailed": "解析公式失败。",
          "unterminatedString": "字符串文字未关闭。",
          "unknownToken": "未知标记：{token}",
          "incompleteExpression": "公式不完整。",
          "missingClosingParen": "缺少结束)。",
          "unknownIdentifier": "未知标识符： {identifier}",
          "invalidRangeEnd": "无效范围结束。",
          "unparsableToken": "无法解析令牌。",
          "sheetNotFound": "未找到表格。"
        },
        "modal": {
          "compatibility": "兼容性\n- 多个工作表/选项卡颜色的支持有限（高级设置丢失）\n- 不支持形状、宏、枢轴和外部链接\n- 不保留条件格式和合并单元格"
        }
      },
      "electro_instrument": {
        "title": "电子乐器工作室",
        "badge": "TOY MOD",
        "description": "在钢琴键盘上自由弹奏，交换音色来塑造您的声音。通过每个音符赚取 EXP，并可通过按键进行演奏。",
        "controls": {
          "instrument": "音色",
          "masterVolume": "主音量"
        },
        "hud": {
          "sessionExp": "会话经验值"
        },
        "legend": {
          "whiteKey": "白键：自然音符",
          "blackKey": "黑键：意外事件"
        },
        "activity": {
          "latest": "最新短语",
          "limit": "(最多10个音符)",
          "placeholder": {
            "start": "按一个键开始播放",
            "empty": "还没有注释"
          }
        },
        "instruments": {
          "piano": "工作室钢琴",
          "synth_pad": "合成器",
          "electric_organ": "电动琴",
          "digital_strings": "数字字符串"
        }
      },
      "music_player": {
        "title": "音乐播放器",
        "subtitle": "使用可视化工具和均衡器播放本地曲目。",
        "actions": {
          "import": "导入曲目"
        },
        "settings": {
          "shuffle": "随机播放",
          "loopMode": "循环模式",
          "clearLibrary": "清除库"
        },
        "controls": {
          "volume": "体积",
          "playbackRate": "播放速度"
        },
        "playlist": {
          "title": "播放列表",
          "search": "搜索...",
          "count": "轨迹 {count}"
        },
        "status": {
          "playlist": "曲目：{count} / {max} |总时间：{duration}",
          "session": "会话经验： {exp}"
        },
        "eq": {
          "title": "均衡器",
          "presets": {
            "flat": "平",
            "rock": "岩石",
            "vocal": "声音",
            "bassBoost": "Bass Boost",
            "custom": "风俗"
          }
        },
        "loop": {
          "none": "不循环",
          "one": "重复一",
          "all": "全部重复"
        },
        "visualizer": {
          "oscilloscope": "示波器",
          "frequency": "频谱"
        },
        "toast": {
          "audioInitFailed": "无法初始化音频上下文。",
          "fileTooLarge": "{name}超出大小限制({maxBytes}字节)。",
          "libraryCleared": "图书馆被清除。",
          "libraryLoadFailed": "加载库失败。",
          "loadFailed": "加载曲目失败。",
          "noTracks": "没有曲目可播放。",
          "playFailed": "无法开始播放。",
          "playlistFull": "达到播放列表限制（{max}曲目）。",
          "removed": "删除{name}。",
          "saveFailed": "无法保存{name}。",
          "trackMissing": "未找到轨道。"
        },
        "dialog": {
          "renamePrompt": "输入轨道名称",
          "clearConfirm": "删除所有轨迹？"
        },
        "track": {
          "untitled": "无标题"
        },
        "header": {
          "measuring": "测量长度",
          "playing": "播放 • {duration}"
        }
      },
      "counter_pad": {
        "title": "计数器垫",
        "subtitle": "快速跟踪多个计数器。调整自动保存。",
        "defaults": {
          "counterName": "计数器{index}",
          "newCounter": "新计数器"
        },
        "form": {
          "namePlaceholder": "计数器名称",
          "initialValuePlaceholder": "初始值 (0)",
          "stepPlaceholder": "步骤(1)",
          "addButton": "添加"
        },
        "summary": {
          "count": "计数器{count}",
          "total": "总计{value}",
          "sessionXp": "会话 EXP {value}"
        },
        "emptyState": "尚无计数器。使用上面的表格添加一个。",
        "counter": {
          "delete": "删除",
          "deleteConfirm": "删除{name}？",
          "stepLabel": "步骤",
          "reset": "重置"
        },
        "alerts": {
          "limitReached": "无法添加更多指示物（限制{max}）"
        }
      },
      "random_tool": {
        "title": "随机工具箱",
        "subtitle": "将掷骰子、轮盘、列表抽选以及随机数字/文本生成整合为一体的实用工具。",
        "tabs": {
          "dice": "骰子",
          "roulette": "轮盘",
          "choice": "随机选择",
          "text": "随机文本",
          "number": "随机数字"
        },
        "dice": {
          "countLabel": "骰子数量",
          "roll": "掷骰子",
          "placeholder": "掷骰子后会显示结果。",
          "summary": "结果：<strong>{values}</strong>",
          "total": "合计 <strong>{total}</strong>",
          "xp": "+{xp} EXP 获得！"
        },
        "roulette": {
          "spin": "旋转轮盘",
          "spinning": "旋转中…",
          "placeholder": "设置名称和经验值，然后旋转轮盘。",
          "addSegment": "添加区块",
          "namePlaceholder": "名称",
          "xpPlaceholder": "EXP",
          "removeSegment": "删除此区块",
          "noSegments": "请先添加至少一个区块。",
          "defaultName": "EXP100",
          "result": "结果：<strong>{name}</strong>",
          "xp": "+{xp} EXP 获得！"
        },
        "choice": {
          "placeholder": "每行输入一个选项",
          "pick": "随机选择",
          "resultPlaceholder": "按下按钮即可抽选结果。",
          "empty": "没有选项，请先添加。",
          "result": "抽选结果：<strong>{choice}</strong>"
        },
        "text": {
          "lengthLabel": "长度",
          "charactersTitle": "字符集合",
          "additionalOptions": "更多选项",
          "lowercase": "小写字母 (a-z)",
          "uppercase": "大写字母 (A-Z)",
          "numbers": "数字 (0-9)",
          "symbols": "符号 (!@# 等)",
          "includeSpaces": "包含空格（仅用于文本生成）",
          "allowAmbiguous": "包含易混淆字符（O/0/I/1/| 等）",
          "customLabel": "自定义字符",
          "customPlaceholder": "添加额外字符",
          "customHelper": "重复字符会自动移除，最多 200 个。",
          "generatePassword": "生成密码",
          "generateText": "生成文本",
          "resultHeading": "生成结果",
          "passwordLabel": "密码生成结果",
          "textLabel": "文本生成结果",
          "placeholder": "生成的字符串会显示在这里。",
          "copy": "复制",
          "errorNoCharset": "请至少选择一个字符集合。",
          "errorLength": "所选字符集合至少需要 {min} 个字符长度。",
          "copied": "已复制到剪贴板！",
          "copyFailed": "复制失败。"
        },
        "number": {
          "minLabel": "最小值",
          "maxLabel": "最大值",
          "generate": "生成数字",
          "placeholder": "设置范围后生成随机数字。",
          "invalid": "范围无效。",
          "result": "结果：<strong>{value}</strong>"
        }
      },
      "calculator": {
        "modes": {
          "standard": "标准",
          "programmer": "程序员",
          "summary": {
            "standard": "标准模式（基数 10）",
            "programmer": "程序员模式/基础 {base}"
          }
        },
        "programmer": {
          "baseNames": {
            "2": "二进制",
            "4": "四元",
            "6": "Senary",
            "8": "八进制",
            "10": "十进制",
            "16": "十六进制",
            "24": "24 基数",
            "30": "Base-30"
          },
          "baseOption": "{baseName}（基地{base}）",
          "baseSuffix": "（基地{base}）"
        },
        "history": {
          "title": "历史",
          "clear": "清除",
          "empty": "尚无历史记录。",
          "status": "历史：{count}",
          "statusWithBase": "历史：{count} /基础{base}"
        },
        "status": {
          "memoryEmpty": "M：--",
          "memory": "M：{value}",
          "memoryWithBase": "M：{value}（基础{base}）"
        },
        "error": "错误"
      },
      "calc_combo": {
        "name": "计算组合",
        "title": "{name} ({difficulty})",
        "difficulty": {
          "easy": "简单",
          "normal": "普通",
          "hard": "困难"
        },
        "stats": {
          "correct": "正确",
          "mistake": "小姐",
          "combo": "组合",
          "xp": "总 EXP"
        },
        "input": {
          "answerPlaceholder": "输入你的答案"
        },
        "buttons": {
          "submit": "提交"
        },
        "shortcuts": {
          "submitOrSkip": "Enter 提交/Esc 跳过"
        },
        "history": {
          "title": "历史（最后{count}问题）",
          "correctEntry": "○{expression}",
          "mistakeEntry": "× {expression} = {answer}",
          "streakEntry": "★连击加成{combo}",
          "gain": "+{value} EXP",
          "loss": "{value} EXP",
          "neutral": "±0 EXP"
        },
        "question": {
          "loading": "正在准备……",
          "prompt": "{expression} = ?"
        },
        "pop": {
          "correct": "正确的！基础{base} +组合{combo} +速度{speed}",
          "streak": "实现组合{combo}！奖励+{bonus}",
          "mistake": "正确答案：{answer}",
          "emptyAnswer": "提交前输入答案",
          "invalidAnswer": "请输入数字"
        }
      },
      "circuit_simulator": {
        "title": "电路模拟器",
        "subtitle": "连接源、无源元件和仪器以实时分析直流/交流电路。",
        "tools": {
          "header": "工具",
          "select": "选择并移动",
          "addNode": "添加节点"
        },
        "components": {
          "wire": {
            "label": "Wire",
            "name": "电线 {index}",
            "description": "近零阻力线"
          },
          "resistor": {
            "label": "电阻",
            "name": "电阻{index}",
            "description": "欧姆电阻"
          },
          "capacitor": {
            "label": "电容器",
            "name": "电容器{index}",
            "description": "容抗分量"
          },
          "inductor": {
            "label": "感应器",
            "name": "电感器{index}",
            "description": "感抗成分"
          },
          "power": {
            "label": "DC源",
            "name": "DC源{index}",
            "description": "带内阻的理想电压源"
          },
          "ac_source": {
            "label": "AC源",
            "name": "AC源{index}",
            "description": "正弦波电压源（RMS设置）"
          },
          "current_source": {
            "label": "当前来源",
            "name": "电流来源{index}",
            "description": "理想的恒流源"
          },
          "ammeter": {
            "label": "电流表",
            "name": "电流表 {index}",
            "description": "测量电路电流 (≈0 Ω)"
          },
          "voltmeter": {
            "label": "电压表",
            "name": "电压表{index}",
            "description": "测量节点之间的潜在差异"
          },
          "wattmeter": {
            "label": "瓦特计",
            "name": "瓦特计{index}",
            "description": "测量节点之间的功率"
          }
        },
        "defaults": {
          "nodes": {
            "a": "节点A",
            "b": "节点B",
            "ground": "地面"
          },
          "elements": {
            "power": "DC源",
            "resistor": "电阻{index}",
            "wire": "线"
          }
        },
        "nodes": {
          "autoName": "节点{index}"
        },
        "analysis": {
          "header": "分析模式",
          "mode": {
            "dc": "DC分析",
            "ac": "AC 分析"
          },
          "frequency": {
            "label": "分析频率(Hz)",
            "hintActive": "可在交流分析中找到。可调范围为 0 Hz 至 1 MHz。",
            "hintInactive": "启用AC分析以调整频率。"
          }
        },
        "status": {
          "analysisMode": {
            "dc": "分析：DC模式",
            "ac": "分析：AC模式（{frequency} Hz)"
          },
          "angularFrequency": "角频率：{value} rad/s",
          "activeTool": "活动工具：{tool}",
          "connectionStart": "开始连接: {node}",
          "ground": {
            "set": "接地： {node}",
            "unset": "地面：未设置"
          },
          "warningItem": "⚠ {message}",
          "diagnostics": {
            "header": "诊断：",
            "item": "• {message}"
          }
        },
        "summary": {
          "pending": "分析待处理",
          "powerDelivered": "供电： {value}",
          "powerDissipated": "功耗：{value}",
          "powerFactor": "功率因数：{value}",
          "maxNodeVoltage": "最高节点电压：{node} = {value}",
          "maxBranchCurrent": "最大分支电流：{value} {unit}",
          "sessionXp": "会话经验：{value}",
          "nodeVoltagesHeader": "节点电压：",
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
          "title": "督察",
          "prompt": "选择节点或组件。",
          "node": {
            "title": "节点：{node}",
            "notFound": "未找到节点",
            "potential": "潜力：{value}",
            "setGround": "将此节点设为地面",
            "delete": "删除节点",
            "deleteConfirm": "删除该节点和连接的组件？"
          },
          "element": {
            "title": "{component}",
            "notFound": "未找到组件",
            "delete": "删除组件",
            "deleteConfirm": "删除这个组件？"
          },
          "fields": {
            "name": "名称",
            "resistance": "阻力 (Ω)",
            "voltage": "电压(V)",
            "internalResistance": "内阻 (Ω)",
            "acVoltage": "电压（RMS，V）",
            "phase": "相位 (°)",
            "capacitance": "电容（F）",
            "inductance": "电感（H）",
            "current": "当前 (A)"
          },
          "meterNote": "乐器不影响电路。它们显示节点之间的测量值。",
          "connection": "连接：{nodeA} ↔ {nodeB}",
          "reactive": {
            "capacitor": "电抗Xc： {value} Ω",
            "capacitorInfinite": "电抗 Xc: ∞ Ω",
            "inductor": "电抗Xl：{value} Ω",
            "inductorInfinite": "电抗 Xl：—"
          },
          "stats": {
            "voltage": "电压",
            "current": "当前",
            "power": "力量"
          }
        },
        "solver": {
          "warnings": {
            "noNodes": "未定义节点。",
            "noSolution": "无法求解电路。"
          },
          "errors": {
            "singular": "矩阵为奇异且无法解决。"
          },
          "diagnostics": {
            "isolatedNode": "节点“{node}”被非导电元件隔离。",
            "dcCapacitor": "在直流分析中，电容器被视为开路。",
            "dcInductor": "在DC分析中， 感应器的行为几乎像短裤。",
            "acZeroFrequency": "AC分析频率为0Hz，因此结果与DC匹配。"
          }
        }
      },
      "acchimuitehoi": {
        "instructions": {
          "rpsTitle": "1。用剪刀石头布决定角色",
          "rpsHint": "胜则攻，败则守。",
          "directionTitle": "2。 Acchi Muite Hoi",
          "directionHint": "在{seconds}秒内选择一个方向。",
          "logTitle": "战斗日志"
        },
        "ui": {
          "stage": {
            "rps": "以 石头剪刀布",
            "attack": "攻击阶段：快速选择指向的方向。",
            "defense": "防御阶段：快速选择不同的方向。"
          }
        },
        "hands": {
          "rock": "岩石",
          "scissors": "剪刀",
          "paper": "纸张"
        },
        "direction": {
          "up": "向上",
          "down": "向下",
          "left": "左",
          "right": "右"
        },
        "role": {
          "attack": "攻击",
          "defense": "防御"
        },
        "countdown": {
          "idle": "时间--.- 剩余时间",
          "remaining": "还剩 {seconds} 秒"
        },
        "score": {
          "primary": "命中命中：{attackWins}/闪避：{defenseWins}",
          "secondary": "攻击连胜：{attackStreak}（最佳{bestAttackStreak}）/防御连胜：{defenseStreak}（最佳{bestDefenseStreak}）",
          "tertiaryWithRate": "轮次：{rounds} / 成功率：{successRate}%",
          "tertiaryEmpty": "回合数：0 / 成功率：--%"
        },
        "status": {
          "ready": "选择一只手开始！",
          "tie": "与 {hand} 并列！再试一次。",
          "playerWin": "你赢了！及时指出方向，击中目标。",
          "cpuWin": "CPU攻击！及时选择不同方向进行躲避。",
          "attack": {
            "hit": "打！ {direction} 获得 {exp} EXP。",
            "hitBonus": "打！ {direction} 获得 {exp} EXP（连续 {streak}）。",
            "miss": "错过…CPU看起来{cpuDirection}。",
            "timeout": "时间到了……你错过了机会。"
          },
          "defense": {
            "success": "躲闪！避免{cpuDirection}！ {exp} EXP.",
            "successBonus": "躲开了！避免{cpuDirection}（连续{streak}）。",
            "fail": "躲避失败…还看了{direction}。",
            "timeout": "时间到了……受到打击。"
          },
          "paused": "已暂停"
        },
        "log": {
          "tie": "领带：继续。",
          "rpsResult": "RPS：你={playerHand} / CPU={cpuHand} → {role}",
          "attackSuccess": "进攻成功：CPU 看起来 {cpuDirection} → {exp} EXP",
          "attackFail": "攻击未命中：CPU {cpuDirection} / 你{playerDirection}",
          "defenseSuccess": "防御成功：CPU {cpuDirection} /你{playerDirection} → {exp} EXP",
          "defenseFail": "防御失败：被匹配方向击中。",
          "attackTimeout": "进攻超时：机会溜走。",
          "defenseTimeout": "防御超时：反应太晚。"
        }
      },
      "sudoku": {
        "title": "数字位置（数独）",
        "description": "用数字1-9填充每一行、每一列和3×3方框，不要重复。单击单元格或使用键盘（数字/箭头/退格键）。",
        "info": {
          "difficultyLabel": "难度",
          "progressLabel": "进度",
          "progressValue": "{filledFormatted}/{totalFormatted}",
          "mistakesLabel": "错误",
          "mistakesValue": "{formatted}",
          "timeLabel": "时间"
        },
        "difficulty": {
          "easy": "简单",
          "normal": "普通",
          "hard": "困难"
        },
        "time": {
          "display": "{minutesFormatted}:{secondsFormatted}"
        },
        "keypad": {
          "clear": "清除"
        },
        "actions": {
          "reset": "重置",
          "newBoard": "新谜题"
        },
        "status": {
          "invalid": "这个数字不能到那里。",
          "selectCell": "首先选择一个单元格。",
          "reset": "棋盘重置。",
          "newBoard": "生成了一个新谜题。",
          "cleared": "解决了！时间{time}/错误{mistakes}。"
        }
      },
      "taiko_drum": {
        "title": "太鼓节奏（{difficulty}）",
        "tips": "F/J/空格 = Don（红色），D/K = Ka（蓝色）。同时按下两个键即可获得大音符！触摸输入也有效。",
        "controls": {
          "difficultyLabel": "难度"
        },
        "buttons": {
          "start": "开始"
        },
        "difficulty": {
          "easy": "简单",
          "normal": "普通",
          "hard": "困难"
        },
        "judgement": {
          "good": "良好",
          "ok": "确定",
          "pass": "通过",
          "miss": "小姐"
        },
        "hud": {
          "progressTemplate": "{label}：{value}%",
          "progressLabel": "进度",
          "judgementTemplate": "{goodLabel}: {good} / {okLabel}: {ok} / {passLabel}: {pass} / {missLabel}：{miss}",
          "comboTemplate": "{comboLabel}：{combo}（{maxLabel} {maxCombo}）| {accuracyLabel}: {accuracy}% | {expLabel}：{exp}",
          "comboLabel": "组合",
          "maxComboLabel": "最大",
          "accuracyLabel": "准确度",
          "expLabel": "EXP"
        },
        "result": {
          "title": "结果",
          "judgementTemplate": "{goodLabel}: {good} / {okLabel}: {ok} / {passLabel}: {pass} / {missLabel}：{miss}",
          "summaryTemplate": "{maxLabel} {maxCombo} | {totalExpLabel} {score} ({bonusLabel} {clearBonus}) | {goodRateLabel} {rate}%",
          "totalExpLabel": "总 EXP",
          "clearBonusLabel": "清除奖励",
          "goodRateLabel": "好评率"
        }
      },
      "minesweeper": {
        "controls": {
          "restart": "重新开始({key})"
        },
        "hud": {
          "info": "{difficultyLabel}: {difficulty} |地雷：{mines} |剩余标志：{flags} |时间：{timeWithUnit} |已公布：{opened}",
          "timeUnit": {
            "seconds": "s"
          }
        },
        "difficulty": {
          "easy": "简单",
          "normal": "普通",
          "hard": "困难"
        }
      },
      "arrow_escape": {
        "title": "箭头脱出 ({difficulty})",
        "description": "点击箭头方块，让它沿箭头方向滑出棋盘；路径被阻挡时无法移动。",
        "actions": {
          "reset": "重置"
        },
        "info": {
          "remaining": "剩余方块",
          "escaped": "已逃出",
          "time": "耗时",
          "clears": "通关次数"
        },
        "status": {
          "clear": "通关！ {time} / 经验 {xp}",
          "intro": "观察逆向生成的顺序，规划每一步的脱出路线。"
        },
        "block": {
          "ariaLabel": "{direction} 方块"
        }
      },
      "sliding_puzzle": {
        "title": "{sizeText}×{sizeText} 滑动拼图",
        "description": "将图块滑入空白处，按顺序排列 1 到 N。单击图块或使用箭头键/WASD 进行移动。",
        "controls": {
          "reset": "重置 ({keyLabel})"
        },
        "info": {
          "moves": "移动",
          "time": "时间",
          "best": "最好的",
          "clears": "清除"
        },
        "status": {
          "cleared": "解决了！ {moves} 移动 / {time} 获得经验值：{xp}",
          "intro": "板尺寸变化困难：EASY {easySize}×{easySize}、NORMAL {normalSize}×{normalSize}、HARD {hardSize}×{hardSize}。"
        }
      },
      "same": {
        "hud": {
          "title": "同一游戏",
          "removed": "已删除",
          "status": "{title} | {difficulty} | {removedLabel}：{removed}"
        },
        "difficulty": {
          "easy": "简单",
          "normal": "普通",
          "hard": "困难"
        },
        "hint": {
          "popup": "组{size} / +{expFormatted} EXP"
        }
      },
      "piano_tiles": {
        "tips": "点击泳道或按D/F/J/K键，并按住长音符。",
        "hud": {
          "template": "{difficultyLabel}: {difficulty} | {hitsLabel}：{hits} | {missesLabel}：{misses} | {comboLabel}：{combo} ({maxLabel} {maxCombo}) | {accuracyLabel}：{accuracy}%",
          "difficultyLabel": "难度",
          "hitsLabel": "命中",
          "missesLabel": "未命中",
          "comboLabel": "组合",
          "maxLabel": "最大",
          "accuracyLabel": "准确度"
        },
        "difficulty": {
          "easy": "简单",
          "normal": "普通",
          "hard": "困难"
        }
      },
      "janken": {
        "title": "石头剪刀布 10 EXP",
        "subtitle": "连续赢3+即可获得奖励EXP!",
        "status": {
          "prompt": "挑选一只手开始念诵。",
          "winStreak": "连胜{streak}！接下来怎么办？",
          "winNext": "好！选择你的下一只手。",
          "lose": "摆脱它并赢得下一个！",
          "tie": "抽奖！再去一次。",
          "paused": "已暂停"
        },
        "chant": {
          "step1": "摇滚第一...",
          "step2": "詹肯...",
          "step3": "射击！"
        },
        "choices": {
          "rock": "岩石",
          "scissors": "剪刀",
          "paper": "纸张"
        },
        "log": {
          "title": "最近结果",
          "intro": "获胜获得10 EXP！",
          "entry": "[回合{round}] {message}"
        },
        "stats": {
          "primary": "胜：{wins} / 输：{losses} / 平局：{ties}",
          "secondary": "连胜：{streak}（最佳{best}）/胜率：{winRate}%"
        },
        "messages": {
          "win": "获胜！你={player} / 对手={cpu} → {xp} EXP",
          "lose": "击败...你={player} /对手={cpu}",
          "tie": "抽奖：{player} vs {cpu}。再试一次！"
        }
      },
      "darumasan": {
        "guard": {
          "title": "观察者状态",
          "hint": "按住空格/↑前进",
          "state": {
            "idle": "正在准备...",
            "safe": "前往现在！",
            "warning": "快转了！",
            "watch": "看着！冻结！"
          },
          "countdown": {
            "placeholder": "剩余时间 --.- s",
            "safe": "安全于{seconds}s",
            "warning": "转入{seconds}s！",
            "watch": "正在监视...保持 {seconds}s"
          }
        },
        "movement": {
          "stopped": "已停止",
          "moving": "移动"
        },
        "progress": {
          "title": "进度",
          "detail": "距离{distance}%/经过{time}秒",
          "bestPlaceholder": "最佳：--.- s",
          "best": "最佳：{time} s"
        },
        "status": {
          "initial": "按开始开始",
          "running": "红灯，绿灯！仅在安全时移动。",
          "pause": "已暂停",
          "success": "清除！在 {time} 秒内+50 经验值",
          "fail": "捕捉移动...失败"
        }
      },
      "populite": {
        "title": "Populite-迷你神模式",
        "hud": {
          "faithStatus": "信仰状态",
          "timeRemaining": "剩余时间",
          "mana": "法力",
          "population": "人口",
          "disasterTimer": "灾难计时器",
          "nextDisaster": "连续下一个灾难",
          "bestRecord": "最佳时间",
          "paused": "已暂停",
          "manaValue": "{current} / {max}",
          "populationValue": "{current} / {target}",
          "disasterCountdown": "{value}s",
          "bestTimeValue": "{value}s"
        },
        "controls": {
          "title": "控制与奇迹",
          "instructions": "左拖：压平（Shift键挖掘）/右键：祈祷邀请追随者<br>空格键：暂停/数字键1：护盾2：提升3：净化雨"
        },
        "spells": {
          "barrier": "1) 守护屏障({cost})",
          "uplift": "2)提升({cost})",
          "purify": "3) 净化之雨 ({cost})"
        },
        "status": {
          "manaShort": "法力不足...",
          "prayerCooldown": "祈祷仍在冷却中...",
          "noSettlements": "没有定居点需要保护",
          "victory": "达到人口目标！",
          "defeatPopulation": "所有追随者都丢失了...",
          "timeout": "时间已到...",
          "paused": "已暂停",
          "resumed": "恢复"
        },
        "log": {
          "title": "事件日志",
          "prayerStarted": "追随者通过祈祷聚集！",
          "tsunami": "🌊海啸淹没了低地！",
          "volcano": "🌋火山在({x},{y})处爆发",
          "newSettlement": "在({x},{y})高度{level}",
          "populationMilestone": "人口超过{population}人！",
          "settlementDestroyed": "定居点({x},{y})被消灭...",
          "settlementDamaged": "结算（{x}，{y}）失去{lost}人",
          "barrierCast": "屏障护盾沉降({x},{y})",
          "upliftCast": "大地升起，创造安全高地 ({x},{y})",
          "purifyCast": "净化雨水冲走了 预兆",
          "inventoryFull": "无库存空间；神圣碎片被抛在后面...",
          "bestRecord": "新纪录！ {time}s",
          "result": "▶ 结果：{message}",
          "difficulty": "难度：{difficulty}",
          "goal": "人口目标{target} /时间限制{duration}s"
        },
        "popup": {
          "buildingLevel": "构建Lv{level}",
          "populationGain": "+{value}追随者",
          "barrierBlocked": "屏障挡住了它！"
        }
      },
      "checkers": {
        "hud": {
          "turn": {
            "playerPrompt": "轮到你了-选择要移动的棋子",
            "aiThinking": "人工智能思维..."
          },
          "expHint": "移动：+1 EXP / 捕获：每件 +6 EXP / 提升： +12 经验"
        },
        "overlay": {
          "defaultTitle": "游戏结束",
          "restartHint": "按R重新启动",
          "result": {
            "win": "胜利！",
            "loss": "击败..."
          }
        }
      },
      "pacman": {
        "hud": {
          "livesLabel": "生活",
          "pelletsLabel": "弹丸",
          "statusTemplate": "{livesLabel}:{lives} {pelletsLabel}:{pelletsCollected}/{pelletsTotal}"
        }
      },
      "invaders": {
        "hud": {
          "livesLabel": "生命",
          "killsLabel": "击杀",
          "waveLabel": "波",
          "statusLine": "{livesLabel}: {lives} {killsLabel}: {kills} {waveLabel}: {wave}"
        },
        "overlay": {
          "title": "游戏结束",
          "restartHint": "按R重新启动"
        }
      },
      "forced_scroll_jump": {
        "hud": {
          "score": "分数：{score}",
          "coinStreak": "CX条纹：{streak}",
          "lives": "生命：{lives}"
        },
        "overlay": {
          "title": "游戏结束",
          "rank": "排名：{rank}",
          "summary": "得分 {score} / 额外经验值 +{bonus}",
          "restart": "按空格键或点击重新开始"
        },
        "rank": {
          "extreme": "极限",
          "superb": "超级",
          "great": "优秀",
          "notable": "值得注意",
          "fair": "公平",
          "steady": "稳定",
          "modest": "谦虚"
        }
      },
      "pseudo3d_race": {
        "scenery": {
          "billboard": "BOOST"
        },
        "hud": {
          "speed": "速度{speed} {unit}",
          "distance": "距离{distance} {unit}",
          "time": "时间{time}{unit}",
          "crash": "CRASH {crashes}/{limit}",
          "paused": "暂停",
          "nitro": "硝基",
          "progress": "课程进度",
          "upcomingTurn": {
            "right": "右转",
            "left": "左转"
          }
        },
        "help": {
          "controls": "控制：用←/→或A/D转向•用↑/W加速•用刹车↓/S • 按下 Nitro",
          "objective": "目标：在时间耗尽之前跑完一段距离并安全地超越交通。",
          "shortcuts": "H切换帮助/P暂停"
        },
        "end": {
          "title": "游戏结束",
          "restart": "按R重新启动",
          "pause": "按P暂停/恢复"
        },
        "countdown": {
          "go": "GO！"
        },
        "popup": {
          "nitro": "NITRO！"
        },
        "controls": {
          "nitro": "硝基",
          "pause": "暂停"
        }
      },
      "othello": {
        "hud": {
          "status": {
            "ended": "游戏结束",
            "playerTurn": "轮到你（点击放置）",
            "aiTurn": "AI回合"
          }
        },
        "overlay": {
          "title": "游戏结束",
          "restartHint": "按R重新启动",
          "result": {
            "win": "你赢了！",
            "loss": "你输了…",
            "draw": "抽牌"
          }
        },
        "popup": {
          "movePreview": "{flips}翻转/约+{xp} EXP"
        }
      },
      "othello_weak": {
        "hud": {
          "status": {
            "ended": "游戏结束",
            "playerTurn": "轮到你（点击放置）",
            "aiTurn": "AI回合"
          },
          "discCount": "你：{player} / AI：{ai}",
          "rule": "目标：以更少的棋子结束"
        },
        "overlay": {
          "title": "游戏结束",
          "summary": "你{player} • 人工智能 {ai}",
          "restartHint": "按R重新启动",
          "result": {
            "win": "更少的光盘 — 你赢了！",
            "loss": "太多光盘 - 你失去了......",
            "draw": "抽牌"
          }
        },
        "popup": {
          "movePreview": "{flips}翻转/约+{xp} EXP"
        }
      },
      "pomodoro": {
        "title": "番茄定时器",
        "subtitle": "交替焦点和休息以每次完成获得经验。",
        "phase": {
          "focus": "焦点",
          "shortBreak": "短暂中断",
          "longBreak": "长断裂",
          "badge": "{phase} 模式"
        },
        "buttons": {
          "start": "▶开始",
          "pause": "⏸暂停",
          "skip": "⏭跳过",
          "reset": "↺重置",
          "save": "保存设置"
        },
        "stats": {
          "title": "进度摘要",
          "focusLabel": "焦点会话",
          "breakLabel": "中断会话",
          "streakLabel": "焦点条纹",
          "xpLabel": "总 EXP",
          "focusValue": "{count} 次会议",
          "breakValue": "{count}断裂",
          "streakValue": "{count}",
          "xpValue": "{xp} XP",
          "todaySummary": "今天：焦点{focus}/休息{breaks}/EXP +{xp}"
        },
        "history": {
          "title": "近代历史",
          "empty": "尚无历史记录。",
          "entry": "聚焦{focus} / 中断{breaks} / +{xp} XP"
        },
        "settings": {
          "title": "定时器设置",
          "focusLabel": "专注（分钟）",
          "shortBreakLabel": "短暂休息（分钟）",
          "longBreakLabel": "长休息(分钟)",
          "cyclesLabel": "长时间休息前的集中训练",
          "autoBreak": "焦点会议后自动开始休息",
          "autoFocus": "休息后自动恢复焦点",
          "savedBadge": "已保存设置"
        },
        "cycle": {
          "longBreakSoon": "本次焦点会议后的长时间休息",
          "untilLong": "长期突破 {count} 次",
          "longBreakActive": "长时间休息：好好休息"
        },
        "upcoming": {
          "generic": "下一个：{label}（{minutes} 分钟）",
          "focus": "下一步：聚焦({minutes} 分钟)"
        },
        "badges": {
          "focusComplete": "焦点会话完成",
          "shortBreakComplete": "短暂休息完成",
          "longBreakComplete": "长假完成",
          "gainTemplate": "{label} +{xp}XP"
        }
      },
      "falling_shooter": {
        "overlay": {
          "title": "游戏结束",
          "restartHint": "按R重新启动"
        }
      },
      "connect6": {
        "hud": {
          "status": {
            "ended": "游戏结束",
            "playerTurn": "轮到你了",
            "aiTurn": "AI回合"
          }
        },
        "overlay": {
          "title": "游戏结束",
          "restartHint": "按R重置",
          "result": {
            "win": "你赢了！",
            "draw": "抽牌",
            "loss": "AI获胜..."
          }
        },
        "popups": {
          "defense": "计数",
          "checkmate": "将死威胁",
          "winning": "必胜之举",
          "pressured": "加压出招",
          "chasing": "追逐移动"
        }
      },
      "gomoku": {
        "hud": {
          "status": {
            "ended": "游戏结束",
            "playerTurn": "轮到你了",
            "aiTurn": "AI回合"
          }
        },
        "overlay": {
          "title": "游戏结束",
          "restartHint": "按R重置",
          "result": {
            "win": "你赢了！",
            "draw": "抽牌",
            "loss": "AI获胜..."
          }
        },
        "popups": {
          "defense": "计数",
          "checkmate": "将死威胁",
          "winning": "必胜之举",
          "pressured": "加压出招",
          "chasing": "追逐移动"
        }
      },
      "renju": {
        "hud": {
          "status": {
            "ended": "游戏结束",
            "playerTurn": "轮到你了",
            "aiTurn": "AI回合"
          }
        },
        "overlay": {
          "title": "游戏结束",
          "restartHint": "按R重置",
          "result": {
            "win": "你赢了！",
            "draw": "抽牌",
            "loss": "AI获胜..."
          }
        },
        "popups": {
          "defense": "计数",
          "checkmate": "将死威胁",
          "winning": "必胜之举",
          "pressured": "加压出招",
          "chasing": "追逐移动"
        },
        "renju": {
          "foulLabel": {
            "overline": "禁止动作：上划线",
            "doubleFour": "禁忌动作：双四",
            "doubleThree": "禁止走法：双三"
          },
          "genericFoul": "禁止移动"
        }
      },
      "connect4": {
        "hud": {
          "status": {
            "ended": "游戏结束",
            "playerTurn": "轮到你了",
            "aiTurn": "AI回合"
          }
        },
        "overlay": {
          "title": "游戏结束",
          "restartHint": "按R重置",
          "result": {
            "win": "你赢了！",
            "draw": "抽牌",
            "loss": "AI获胜..."
          }
        },
        "popups": {
          "defense": "计数",
          "checkmate": "将死威胁",
          "winning": "必胜之举",
          "pressured": "加压出招",
          "chasing": "追逐移动"
        }
      },
      "nine_mens_morris": {
        "header": {
          "title": "九人莫里斯 — 你先移动"
        },
        "tips": {
          "controls": "控制：单击一个点来放置棋子/选择一个棋子，然后单击一个目的地来移动。<br>当你形成一个磨坊时，选择一个红色突出显示的敌方棋子来移除。"
        },
        "hud": {
          "info": {
            "player": "玩家棋子：<strong>{piecesFormatted}</strong>/捕获：{capturedFormatted}",
            "ai": "AI棋子：<strong>{piecesFormatted}</strong>/捕获：{capturedFormatted}"
          },
          "phaseInfo": "你：{playerPhase}（剩余位置{playerRemaining}）<br>人工智能：{aiPhase}（剩余位置{aiRemaining}）"
        },
        "phase": {
          "place": "放置相位",
          "slide": "滑相",
          "fly": "飞行阶段"
        },
        "status": {
          "removalPrompt": "铣削成型！选择一个敌方棋子来消除。",
          "aiThinking": "AI正在思考…",
          "playerTurn": "轮到你了。",
          "aiTurn": "AI的回合..."
        },
        "result": {
          "win": "胜利！你锁定了人工智能的碎片。",
          "lose": "失败...AI已锁定你的棋子。"
        }
      },
      "dungeon_td": {
        "controls": {
          "startWave": "开始波"
        },
        "hud": {
          "hint": "单击地砖放置炮塔（Shift+单击升级）。到达核心的敌人会降低其耐久度。",
          "wave": "波{currentFormatted}{suffix}",
          "coins": "资金{formatted} G",
          "baseHp": "核心生命{valueFormatted}/{maxFormatted}",
          "exp": "EXP赢得 {formatted}"
        },
        "status": {
          "tileUnavailable": "你不能在该图块上放置炮塔。",
          "insufficientFunds": "资金不够。",
          "towerPlaced": "放置炮塔。",
          "upgradeInsufficientFunds": "资金不足升级({costFormatted} G)。",
          "towerUpgraded": "升级炮塔至Lv{levelFormatted}。",
          "noPath": "无法计算有效路径。",
          "waveStarted": "一波{waveFormatted}已经开始！",
          "allWavesCleared": "全波防御！奖金{bonusCoinsFormatted} G / EXP +{bonusXpFormatted}",
          "waveCleared": "防御波{waveFormatted}！资金 +{bonusCoinsFormatted} / EXP +{bonusXpFormatted}",
          "coreDestroyed": "核心被破坏…挥波失败。",
          "fullClearBonus": "完美防守！额外 EXP +{bonusFormatted}",
          "coreBreached": "敌人突破了核心…",
          "coreDamaged": "敌人到达核心！耐久性下降。",
          "apiUnavailable": "地下城API不可用。",
          "generatingStage": "生成阶段...",
          "pathFailedRetry": "无法确保路径。请重新加载。",
          "ready": "放置炮塔并按Start Wave。",
          "stageGenerationFailed": "舞台生成失败。",
          "upgradeHint": "Shift+点击升级炮塔."
        }
      },
      "physics_sandbox": {
        "toolbar": {
          "tools": {
            "select": {
              "label": "选择",
              "title": "选择并拖动物体或发射器"
            },
            "godFinger": {
              "label": "神指",
              "title": "在过程中直接抓取活体模拟"
            },
            "addCircle": {
              "label": "圈",
              "title": "添加一个圆形刚体"
            },
            "addBox": {
              "label": "盒子",
              "title": "添加一个盒子刚体"
            },
            "addCloth": {
              "label": "布料",
              "title": "添加布料软体"
            },
            "addWall": {
              "label": "绝对墙",
              "title": "画出坚不可摧的墙"
            },
            "addFire": {
              "label": "开火",
              "title": "添加火焰发射器"
            },
            "addWater": {
              "label": "水",
              "title": "添加水发射器"
            },
            "addIce": {
              "label": "Ice",
              "title": "添加冰发射器"
            },
            "addWind": {
              "label": "风",
              "title": "添加风发射器"
            },
            "addVine": {
              "label": "藤蔓",
              "title": "添加藤蔓发射器"
            },
            "addLightning": {
              "label": "闪电",
              "title": "添加闪电发射器"
            },
            "addAcid": {
              "label": "酸性",
              "title": "添加酸 发射器"
            },
            "addCircuit": {
              "label": "电路",
              "title": "添加赛道节点"
            }
          },
          "actions": {
            "start": {
              "label": "开始",
              "title": "开始或恢复模拟"
            },
            "pause": {
              "label": "暂停",
              "title": "暂停模拟"
            },
            "reset": {
              "label": "重置",
              "title": "重置为初始状态"
            },
            "delete": {
              "label": "删除",
              "title": "移除选定的主体或发射器"
            },
            "save": {
              "label": "保存",
              "title": "保存当前布局"
            },
            "load": {
              "label": "加载",
              "title": "加载保存的布局"
            }
          }
        },
        "hud": {
          "summary": "形状{bodyCount}/发射器{emitterCount}/布料{clothCount}/粒子{particleCount}",
          "powerGravityExp": "动力 {poweredCount} / 重力 {gravity} / EXP {exp}",
          "solver": "解算器{iterations} iter × {substeps} sub",
          "temperature": "平均温度 {average}°C / 环境 {ambient}°C / 最高 {max}°C",
          "phases": "状态固体{solid} /液体{liquid} /气体{gas}",
          "wind": "阵风{gusts} / 风发射器{emitters}"
        },
        "inspector": {
          "title": "设置",
          "world": {
            "gravityY": "重力Y ({value})",
            "airDrag": "空气阻力 ({value})",
            "iterations": "求解器迭代({value})",
            "substeps": "子步骤 ({value})",
            "ambientTemperature": "环境温度 ({value}°C)",
            "boundary": {
              "label": "边界模式",
              "options": {
                "wall": "墙壁（在边缘弹跳）",
                "void": "无效（脱落）"
              },
              "voidHint": "虚空：离开边界的物体将在移动一段距离后消失。"
            }
          },
          "noSelection": "从工具栏中添加形状并选择它们以查看详细设置。",
          "savedLayouts": {
            "title": "已保存的布局",
            "load": "加载",
            "delete": "删除"
          },
          "common": {
            "unknown": "未知"
          },
          "body": {
            "title": "身体属性",
            "state": "状态：{state}",
            "damage": "磨损：{percent}%",
            "integrity": "完整性：{percent}%",
            "stress": "压力指数：{value} kPa",
            "strain": "应变：{percent}%",
            "heatFlux": "热通量指数：{value}",
            "fracture": "断裂阈值：{threshold} / 碎片 {fragments}",
            "reactionCooldown": "反应冷却时间：{seconds}s",
            "materialPreset": "材质预设",
            "mass": "弥撒（预计{value}）",
            "angleInfo": "角度{angle}° / 角度 速度{angular} rad/s",
            "static": "制作静态",
            "restitution": "恢复原状({value})",
            "friction": "摩擦({value})",
            "wallNote": "绝对墙有固定的材料。只能更改大小和位置。",
            "radius": "半径({value})",
            "width": "宽度 ({value})",
            "height": "高度({value})",
            "color": "颜色",
            "chemical": {
              "formula": "公式：{formula}",
              "components": "组件：{list}",
              "molarMass": "摩尔质量：{mass} g/mol",
              "hazards": "属性：{list}"
            },
            "phase": {
              "solid": "可靠",
              "liquid": "液体",
              "gas": "气体"
            }
          },
          "customMaterial": {
            "alertAddElement": "请添加至少一个元素。",
            "title": "化学定制器",
            "components": "组件：{list}",
            "componentsEmpty": "组件：未添加元素",
            "formulaPreview": "公式预览：{formula}",
            "molarMass": "估计摩尔质量：{mass} g/mol",
            "suggestedDensity": "平均元素密度：{average}（当前{current}）",
            "removeComponent": "删除",
            "addElement": "添加元素",
            "nameLabel": "材料名称",
            "namePlaceholder": "自定义材料名称",
            "density": "密度 ({value})",
            "baseTemperature": "基础温度({value}°C)",
            "meltingPoint": "熔点({value}°C)",
            "boilingPoint": "沸点({value}°C)",
            "ignitionPoint": "燃点 ({value}°C)",
            "hazardTitle": "危险标签",
            "appliedHazards": "应用标签：{list}",
            "apply": "应用自定义材料",
            "reset": "清晰构图",
            "hazards": {
              "flammable": "易燃",
              "conductive": "导电",
              "elastic": "弹性",
              "insulator": "绝缘子",
              "aqueous": "水溶性",
              "superheated": "过热",
              "ionized": "电离",
              "alkali-metal": "碱金属",
              "water-reactive": "水反应性",
              "acidic": "酸性",
              "corrosive": "腐蚀性",
              "toxic": "有毒的",
              "inert": "惰性",
              "oxidizer": "氧化剂",
              "explosive": "爆炸",
              "cryogenic": "低温",
              "refractory": "耐火",
              "catalytic": "催化"
            }
          },
          "emitter": {
            "title": "发射器设置",
            "type": "类型：{kind}",
            "rate": "速率（{value}/s）",
            "power": "力量（{value}）",
            "direction": "方向({value}°)",
            "circuit": {
              "alwaysOn": "保持供电",
              "connections": "连接节点",
              "disconnect": "断开连接",
              "cancel": "取消链接",
              "connect": "链接模式"
            }
          },
          "cloth": {
            "title": "布料 属性",
            "integrity": "完整性{percent}%",
            "links": "节点{cols}×{rows} /链接{intact}/{total}",
            "strain": "平均应变{average}% / 最大{max}%",
            "fatigue": "疲劳{value}",
            "structural": "结构({value})",
            "shear": "剪切({value})",
            "bend": "弯曲({value})",
            "damping": "阻尼（{value}）",
            "tearFactor": "撕裂因子({value})",
            "windInfluence": "风响应 ({value})",
            "color": "颜色",
            "pinTop": "钉顶边缘",
            "unpinAll": "取消固定全部"
          }
        }
      },
      "imperial_realm": {
        "ui": {
          "logTitle": "操作 日志",
          "waveTitle": "Wave英特尔",
          "intelTitle": "战斗情报",
          "selectionTitle": "选择信息",
          "populationLabel": "人口"
        },
        "resources": {
          "food": "食物",
          "wood": "木",
          "gold": "黄金",
          "stone": "石头",
          "costEntry": "{resource} {amount}",
          "costSeparator": "/"
        },
        "age": {
          "labels": {
            "frontier": "前沿时代",
            "feudal": "封建时代",
            "castle": "城堡时代",
            "imperial": "帝国时代"
          },
          "summaries": {
            "frontier": "铺设定居点立足根本，注重生存。",
            "feudal": "重组步兵并加强防线。",
            "castle": "装备重步兵和骑兵进攻。",
            "imperial": "部署尖端军队，夺取决定性的霸权。"
          }
        },
        "hud": {
          "nextWave": "下一波",
          "ready": "就绪",
          "countdown": "{seconds}s",
          "defending": "防守！",
          "waveStatus": "波 {current} / {total}",
          "waveInfo": "电流 波浪：{wave}/{total}\n敌方TC生命值：{hp} / {max}",
          "commanderGoal": "击败指挥官",
          "finalStand": "最后一站",
          "ageHeading": "帝国时代：{age}",
          "ageProgress": "前进... 剩余{remaining}s",
          "ageReady": "准备好前进",
          "ageNext": "下一步：{age} / {requirement}",
          "ageMax": "维护帝国时代。",
          "momentumTitle": "帝国士气",
          "momentumDetail": "攻击奖金 +{bonus}%"
        },
        "intel": {
          "summary": "村民：{villagers}\n军事：{army}\n结构：{structures}"
        },
        "selection": {
          "empty": "未选择任何内容。",
          "unitEntry": "{name} HP {current}/{max}",
          "structureEntry": "{name}生命值{current}/{max}{status}",
          "underConstruction": "（建筑）",
          "separator": "---"
        },
        "actions": {
          "build": {
            "house": {
              "label": "建造：房屋",
              "description": "+5人口，快速构建"
            },
            "barracks": {
              "label": "建造：兵营",
              "description": "训练民兵"
            },
            "archery": {
              "label": "建造：射箭场",
              "description": "训练弓箭手"
            },
            "tower": {
              "label": "构建：瞭望塔",
              "description": "自主防御塔"
            },
            "blacksmith": {
              "label": "建造：铁匠",
              "description": "锻造装备以提高士气"
            },
            "stable": {
              "label": "构建：稳定",
              "description": "火车骑士"
            },
            "siegeWorkshop": {
              "label": "构建：攻城工坊",
              "description": "制作攻城引擎"
            }
          },
          "ageUp": {
            "label": "提前年龄：{age}",
            "time": "研究时间：{time}s"
          },
          "requireAge": "需要年龄：{age}",
          "badge": {
            "ageUp": "年龄"
          },
          "train": {
            "button": "列车：{unit}",
            "details": "{cost} / {time}s"
          }
        },
        "logs": {
          "missionStart": "操作开始。城镇中心和三个村民已部署。",
          "insufficientResources": "资源不足。",
          "placementPrompt": "选择构建位置{label}。",
          "gatherOrder": "命令村民收集{resource}。",
          "attackOrder": "发出攻击命令。",
          "populationCap": "达到人口上限。建造更多房屋。",
          "trainingStarted": "训练{unit}已开始。",
          "buildingStarted": "开始构建：{structure}。",
          "unitComplete": "{unit}训练完成。",
          "structureComplete": "{structure}已完成。",
          "enemyDefeated": "消灭敌人。",
          "resourceDepleted": "{resource}押金耗尽。",
          "commanderArrived": "敌方指挥官已进入战场！",
          "waveIncoming": "敌波 {wave} 来袭！",
          "waveCleared": "波{wave}被击退！补给箱已固定。",
          "requireAge": "到达{age}后可用。",
          "ageResearchInProgress": "年龄提升已在进行中。",
          "ageResearchStarted": "开始前进到{age}。",
          "ageResearchCancelled": "年龄失去城镇中心后进度取消。",
          "ageAdvanced": "进阶到{age}！",
          "victory": "胜利！",
          "defeat": "击败..."
        },
        "gameOver": {
          "message": {
            "ownTownCenterDestroyed": "镇中心被毁。",
            "enemyTownCenterDestroyed": "敌方城镇中心被毁。",
            "allVillagersLost": "所有村民都失踪了。"
          },
          "overlay": {
            "victory": "胜利",
            "defeat": "失败"
          }
        },
        "units": {
          "villager": "村民",
          "militia": "民兵",
          "archer": "Archer",
          "spearman": "矛兵",
          "crossbowman": "弩手",
          "raider": "Raider",
          "knight": "骑士",
          "horseArcher": "弓箭手",
          "commander": "敌方指挥官",
          "ram": "攻城锤"
        },
        "structures": {
          "townCenter": "城镇中心",
          "house": "房屋",
          "barracks": "兵营",
          "archery": "射箭场",
          "tower": "瞭望塔",
          "blacksmith": "铁匠",
          "stable": "稳定",
          "siegeWorkshop": "攻城工坊"
        }
      },
      "tic_tac_toe": {
        "hud": {
          "status": {
            "ended": "游戏结束",
            "playerTurn": "轮到你了",
            "aiTurn": "AI回合"
          }
        },
        "overlay": {
          "title": "游戏结束",
          "restartHint": "按R重置",
          "result": {
            "win": "你赢了！",
            "draw": "抽牌",
            "loss": "AI获胜..."
          }
        },
        "popups": {
          "defense": "计数",
          "checkmate": "将死威胁",
          "winning": "必胜之举",
          "pressured": "加压出招",
          "chasing": "追逐移动"
        }
      },
      "riichi_mahjong": {
        "title": "立直麻将精简版",
        "subtitle": "用立直/tsumo/ron与三个AI对手进行单手立直麻将。",
        "info": {
          "roundLabel": "回合",
          "dealerLabel": "荷官",
          "doraLabel": "朵拉",
          "remainingLabel": "剩余图块",
          "riichiSticksLabel": "立直棒",
          "roundValue": "{seat} {round}",
          "none": "没有任何",
          "doraLine": "朵拉：{tiles}",
          "potLine": "木棍：{sticks} / 剩余方块：{tiles}"
        },
        "buttons": {
          "tsumo": "Tsumo",
          "ron": "罗恩",
          "riichi": "立直",
          "cancel": "取消"
        },
        "players": {
          "youWithSeat": "你({seat})",
          "aiWithSeat": "AI {seat}"
        },
        "seats": {
          "E": "东",
          "S": "南",
          "W": "西方",
          "N": "北"
        },
        "tiles": {
          "suits": {
            "m": "{rank} Man",
            "p": "{rank} 引脚",
            "s": "{rank} Sout"
          },
          "honors": {
            "E": "东",
            "S": "南",
            "W": "西方",
            "N": "北",
            "P": "白色",
            "F": "绿色",
            "C": "红色"
          }
        },
        "hud": {
          "scoreValue": "{value} 分",
          "tags": {
            "dealer": "荷官",
            "riichi": "立直"
          },
          "waits": "等待：{tiles}"
        },
        "yaku": {
          "chiitoitsu": "Chiitoitsu",
          "riichi": "立直",
          "menzenTsumo": "Menzen Tsumo",
          "tanyao": "探妖",
          "dora": "朵拉",
          "yakuhai": "夜空",
          "pinfu": "平夫"
        },
        "fuReasons": {
          "closedRon": "闭合 ron +10",
          "selfDraw": "Tsumo +2",
          "seatWindPair": "座风对+2",
          "roundWindPair": "轮风对+2",
          "dragonPair": "龙对+2",
          "terminalKan": "终端三元组+8的注释",
          "middleTriplet": "简单三连体+4",
          "honorTriplet": "荣誉三元组 +8"
        },
        "result": {
          "tsumoDealer": "Tsumo {value}全部",
          "tsumoNonDealer": "Tsumo庄家{dealer} /非庄家{other}",
          "ron": "Ron {value}"
        },
        "log": {
          "roundStart": "--- {seat} {round} 经销商：{dealer} ---",
          "doraIndicator": "多拉指示器： {indicator} → 朵拉 {dora}",
          "draw": "抽奖：{tile}",
          "riichiInsufficient": "没有足够的点数来声明立直",
          "riichiDeclaration": "立一宣布！放置了一根 1000 点的棍子。",
          "discardPlayer": "丢弃：{tile}",
          "ronWin": "{player} 被 ron 与 {tile} 获胜！",
          "handWin": "{player} 获胜！ {han} 韩 {fu} 付 {description}",
          "yaku": "药久：{list}",
          "riichiBonus": "收集{sticks}立直棒(+{bonus})",
          "drawRound": "绘制 ({reason})",
          "tenpaiList": "天牌：{list}",
          "allNoten": "记录中的所有玩家",
          "tenpaiSplit": "分布式笔记付款",
          "finalResult": "最终结果：{list}",
          "tsumoWin": "{player}被tsumo赢了！",
          "aiRiichi": "{player} 宣布立直！",
          "discardOther": "{player}丢弃{tile}",
          "drawReason": {
            "exhaustive": "详尽抽奖"
          }
        },
        "rewards": {
          "riichiDeclaration": "立市宣言",
          "ronWin": "罗恩·温",
          "tsumoWin": "Tsumo获胜",
          "matchComplete": "匹配完成"
        }
      }
    },
    "miniexp": {
      "games": {
        "tosochu": {
          "ui": {
            "timer": "剩余时间 {seconds}s",
            "exp": "存储的经验值{exp}",
            "missionNotReady": "任务：尚未激活",
            "missionActive": "任务：{label}{optionalSuffix} - 剩余{seconds}s（坐标： {coords})",
            "missionComplete": "任务完成：{success}/{total} 成功",
            "missionSuccess": "{label}： 成功！",
            "missionFailed": "{label}：失败...",
            "surrender": "投降",
            "surrenderCountdown": "投降...{seconds}s"
          },
          "status": {
            "hunterAdded": "有猎人加入追逐！",
            "hunterRetreat": "任务成功！一名猎人撤退",
            "missionActivated": "任务激活：{label}",
            "escapeSuccess": "逃脱！ +{total} EXP（故障{base}+{bonus}）",
            "surrenderSuccess": "投降了。存入 {exp} EXP",
            "caught": "发现...没有获得经验",
            "dungeonUnavailable": "地下城API不可用",
            "stageGenerationFailed": "生成舞台失败",
            "runStart": "追逐开始！",
            "runPaused": "已暂停",
            "standby": "待机",
            "surrenderZoneHint": "进入投降区，然后按按钮",
            "surrenderAttempt": "尝试投降……忍耐{duration}秒！",
            "surrenderCancelled": "取消投降",
            "beaconSuccess": "信标安全！信号干扰加强",
            "beaconFail": "信标失败...猎人处于戒备状态",
            "dataSuccess": "获得机密情报！奖励增加",
            "dataFail": "警报触发！快速猎人出现",
            "boxSuccess": "解除武装！猎人盒子延迟",
            "boxFail": "撤防失败...部署了额外的猎人",
            "vaultSuccess": "大奖！但你现在是主要目标",
            "vaultFail": "避难所被防守...两名猎人被释放"
          },
          "missions": {
            "optionalSuffix": "（可选）",
            "beacon": {
              "label": "到达信标"
            },
            "data": {
              "label": "入侵数据终端"
            },
            "box": {
              "label": "解除猎人箱的武装"
            },
            "vault": {
              "label": "破解高危金库"
            }
          }
        }
      }
    },
    "tools": {
      "sidebar": {
        "ariaLabel": "工具列表",
        "modMaker": {
          "label": "Dungeon Mod Maker",
          "hint": "组装结构和算法以导出`registerDungeonAddon`文件。"
        },
        "sandbox": {
          "label": "沙盒地下城",
          "hint": "构建具有自由布局和敌人的测试地下城（无EXP）。"
        },
        "blockdata": {
          "label": "块数据编辑器",
          "hint": "通过GUI检查和编辑BlockDim块定义并导出JSON。"
        },
        "imageViewer": {
          "label": "图像查看器",
          "hint": "查看缩放、旋转、透视和元数据的屏幕截图。"
        },
        "stateManager": {
          "label": "状态经理",
          "hint": "导出或导入一个包中的所有游戏和工具数据。",
          "panelAriaLabel": "状态管理器工具",
          "header": {
            "title": "状态经理",
            "description": "立即备份和恢复地牢进度、MiniExp 和 BlockDim 历史记录以及每个“工具”选项卡实用程序。"
          },
          "body": {
            "description": "使用“完全导出”将当前状态保存为单个JSON文件，然后“完全导入”加载该文件并完全恢复游戏。"
          },
          "actions": {
            "export": "全程出口",
            "import": "完全导入"
          },
          "summary": {
            "default": "导出/导入摘要将出现在这里。",
            "exportedAt": "导出于：{value}",
            "player": "玩家：等级{level} / 生命{hp}",
            "dungeon": "当前楼层：{floor}F/难度：{difficulty}",
            "miniExp": "迷你经验：选定{selected}/记录{records}",
            "blockDim": "BlockDim：历史{history} /书签{bookmarks}",
            "tools": "工具数据：{names}",
            "noTools": "工具数据：无",
            "toolSeparator": ", "
          },
          "toolNames": {
            "modMaker": "Mod Maker",
            "blockDataEditor": "块数据编辑器",
            "sandbox": "沙盒",
            "imageViewer": "图像查看器"
          },
          "status": {
            "exportPreparing": "准备全面导出...",
            "exportSuccess": "保存为 {fileName}。",
            "exportError": "导出失败。检查控制台日志。",
            "importReading": "正在加载 {fileName}...",
            "importSuccess": "完全导入完成。",
            "importError": "导入失败。验证文件格式。"
          },
          "messages": {
            "importComplete": "导入状态数据。"
          }
        }
      },
      "sandbox": {
        "panelAriaLabel": "沙盒地下城工具",
        "header": {
          "title": "沙盒地下城",
          "description": "使用自定义地图和敌人位置即时组装一个测试地下城，而不影响经验获取。"
        },
        "map": {
          "title": "地图设置",
          "actions": {
            "fillFloor": "填充地板",
            "fillWall": "填满墙壁",
            "resetMarkers": "重置楼梯/开始"
          },
          "fields": {
            "width": {
              "label": "宽度"
            },
            "height": {
              "label": "身高"
            }
          },
          "brush": {
            "ariaLabel": "画笔选择",
            "modes": {
              "select": "选择",
              "floor": "楼层",
              "wall": "墙",
              "start": "起点",
              "stairs": "楼梯",
              "gate": "大门",
              "enemy": "敌人放置",
              "domain": "领域"
            }
          },
          "selectedCell": {
            "hint": "单击单元格进行编辑。",
            "selectedWithDescription": "选定单元格：{description}",
            "selected": "选定的单元格：({x}, {y})"
          },
          "list": {
            "title": "地图列表",
            "actions": {
              "add": "+添加地图",
              "node": "节点地图",
              "setEntry": "设置为入口地图"
            },
            "ariaLabel": "地图列表",
            "fields": {
              "name": {
                "label": "名称"
              },
              "floor": {
                "label": "楼层"
              },
              "branch": {
                "label": "分支键"
              }
            }
          },
          "options": {
            "title": "画笔选项",
            "floorType": {
              "label": "楼层类型",
              "options": {
                "normal": "普通",
                "ice": "Ice",
                "poison": "毒",
                "bomb": "炸弹",
                "conveyor": "传送带",
                "oneWay": "单向",
                "vertical": "仅限垂直",
                "horizontal": "仅水平"
              }
            },
            "floorDirection": {
              "label": "方向",
              "options": {
                "none": "没有任何",
                "up": "↑向上",
                "right": "→右",
                "down": "↓向下",
                "left": "←左"
              },
              "hint": "与传送带/单向方块一起使用"
            },
            "floorColor": {
              "label": "地板颜色"
            },
            "wallColor": {
              "label": "墙 颜色"
            },
            "color": {
              "auto": "自动"
            }
          },
          "palette": {
            "title": "调色板",
            "ariaLabel": "保存的颜色",
            "actions": {
              "saveFloor": "保存地板颜色",
              "saveWall": "保存墙壁颜色",
              "clear": "清除调色板",
              "eyedropper": "吸管"
            }
          },
          "notes": {
            "apply": "对选定的单元格应用颜色和地板类型或填充目标。"
          },
          "preview": {
            "title": "地图预览",
            "ariaLabel": "沙盒地图",
            "legend": {
              "wall": "墙",
              "floor": "楼层",
              "start": "开始",
              "stairs": "楼梯",
              "enemy": "敌人",
              "ice": "冰层",
              "poison": "毒层",
              "bomb": "炸弹地板",
              "conveyor": "传送带地板",
              "oneWay": "单向地板",
              "vertical": "仅垂直楼层",
              "horizontal": "仅水平楼层"
            }
          },
          "cell": {
            "types": {
              "floor": "楼层",
              "wall": "墙"
            },
            "base": "{type} ({x}, {y})",
            "details": {
              "playerStart": "开始",
              "stairs": "楼梯",
              "gate": "大门",
              "gateWithLabel": "登机口：{label}",
              "floorType": "楼层类型：{label}{suffix}",
              "floorTypeDirectionSuffix": "({icon})",
              "floorColor": "地板颜色：{color}",
              "wallColor": "墙壁颜色：{color}",
              "enemy": {
                "singleNamed": "敌人：{name}",
                "singleNamedBoss": "敌人：{name}（Boss）",
                "singleBoss": "敌人：Boss x1",
                "single": "敌人：x1",
                "bossSuffix": "（Boss）",
                "nameSeparator": ", ",
                "multipleNamed": "敌人：{list}",
                "multipleAllBoss": "敌人：{count}老大",
                "multipleWithBoss": "敌人：{count}（包括 {bossCount} boss)",
                "multiple": "敌人: {count}"
              },
              "domain": {
                "effectSeparator": ", ",
                "separator": "/",
                "effectNone": "没有效果",
                "named": "{name}: {effects}",
                "unnamed": "{effects}",
                "summary": "域名：{summary}"
              },
              "joiner": "/"
            },
            "summary": "{base} - {details}"
          },
          "domain": {
            "effects": {
              "attackUp": "向上攻击",
              "defenseUp": "防御 up",
              "attackDown": "攻击下降",
              "defenseDown": "防御下降",
              "allyBoost": "盟友提升",
              "enemyBoost": "敌人增强",
              "enemyOverpower": "压倒敌人",
              "levelUp": "上级",
              "levelDown": "下 等级",
              "abilityUp": "能力提升",
              "abilityDown": "能力下降",
              "enemyInvincible": "敌人无敌",
              "allInvincible": "无敌",
              "damageReverse": "损害逆转",
              "slow": "慢",
              "fast": "快",
              "ailment": "状态异常"
            }
          }
        },
        "playerPreview": {
          "stats": "HP {hp} / ATK {attack} / DEF {defense}"
        },
        "player": {
          "title": "玩家设置",
          "level": {
            "label": "玩家等级"
          },
          "preview": {
            "label": "预计统计数据"
          },
          "note": "沙盒运行不会奖励经验值，之后你的等级会恢复正常。",
          "interactive": {
            "label": "启用交互模式",
            "note": "打开运行菜单调整参数瞬间。"
          }
        },
        "common": {
          "actions": {
            "select": "选择",
            "delete": "删除",
            "duplicate": "重复"
          },
          "axes": {
            "x": "X",
            "y": "Y"
          }
        },
        "gimmickSuite": {
          "title": "噱头/电线",
          "toolbarAria": "噱头控制",
          "addTypeLabel": "添加类型",
          "add": "+添加噱头",
          "autoLayout": "自动布局",
          "listAria": "玩法列表",
          "fields": {
            "name": "名称",
            "namePlaceholder": "噱头名称",
            "type": "类型",
            "tags": "标签（逗号分隔）",
            "tagsPlaceholder": "例如谜题,门",
            "locked": "在布局中锁定位置",
            "tileX": "Tile X",
            "tileY": "平铺Y",
            "tileXPlaceholder": "X",
            "tileYPlaceholder": "Y",
            "notes": "注释",
            "notesPlaceholder": "注释或警告"
          },
          "actions": {
            "useSelected": "使用选定的单元格",
            "clearTile": "清除",
            "clearSelection": "清除选择"
          },
          "subheaders": {
            "config": "配置",
            "wires": "连接"
          },
          "wireEditorAria": "连线编辑器区域"
        },
        "enemies": {
          "title": "敌人布置",
          "add": "+ 添加敌人",
          "note": "选择一个敌人，然后用敌人绘制其位置 ",
          "empty": "尚未放置敌人。使用“添加敌人”创建一个。",
          "defaultName": "敌人{index}",
          "generatedName": "敌人{index}",
          "fields": {
            "name": "名称",
            "level": "等级",
            "hp": "HP",
            "attack": "攻击",
            "defense": "防御",
            "x": "X位置",
            "y": "Y位置",
            "boss": "标记为boss"
          }
        },
        "domains": {
          "title": "领域水晶",
          "add": "+添加水晶",
          "note": "选择一个水晶，然后使用领域画笔设定其位置和半径。",
          "empty": "尚未放置水晶。使用“添加水晶”来创建一个。",
          "defaultName": "水晶{index}",
          "generatedName": "领域{index}",
          "fields": {
            "name": "名称",
            "radius": "半径",
            "effects": "效果"
          },
          "params": {
            "target": "{effect} 目标"
          }
        },
        "portals": {
          "title": "门户/大门",
          "add": "+添加传送门",
          "note": "选择一个传送门，然后使用 楼梯或门笔刷将其放置在地图上。",
          "empty": "尚未放置传送门。使用“添加传送门”创建一个。",
          "defaultName": "传送门{index}",
          "fields": {
            "name": "名称",
            "type": "类型",
            "targetMap": "目的地地图",
            "targetX": "目标X",
            "targetY": "目标Y"
          },
          "types": {
            "stairs": "楼梯",
            "gate": "大门"
          }
        },
        "gimmicks": {
          "empty": "还没有噱头。使用上面的按钮添加一个。",
          "config": {
            "noAdditionalSettings": "无需额外配置。"
          },
          "pushableCrate": {
            "label": "箱子",
            "defaultName": "箱子",
            "config": {
              "mass": {
                "label": "重量"
              },
              "snapToGrid": {
                "label": "捕捉到地板网格"
              },
              "sticky": {
                "label": "开关时坚持"
              }
            },
            "outputs": {
              "pressed": "加载 ON",
              "released": "关闭负载",
              "moved": "移动"
            }
          },
          "floorSwitch": {
            "label": "楼层开关",
            "defaultName": "开关",
            "config": {
              "mode": {
                "label": "模式",
                "options": {
                  "momentary": "按住保持活动",
                  "toggle": "每次按下时切换",
                  "sticky": "第一次按下后锁定"
                }
              },
              "defaultOn": {
                "label": "开始"
              },
              "resettable": {
                "label": "允许重置信号"
              }
            },
            "inputs": {
              "set": "强制开启",
              "reset": "强制OFF"
            },
            "outputs": {
              "activated": "开启",
              "deactivated": "关闭",
              "state": "状态"
            }
          },
          "door": {
            "label": "门",
            "defaultName": "门",
            "config": {
              "initialState": {
                "label": "初始状态",
                "options": {
                  "open": "打开",
                  "closed": "封闭"
                }
              },
              "autoClose": {
                "label": "自动关闭"
              },
              "autoCloseDelay": {
                "label": "自动关闭秒数"
              }
            },
            "inputs": {
              "open": "打开",
              "close": "关闭",
              "toggle": "切换"
            },
            "outputs": {
              "opened": "已开通",
              "closed": "封闭",
              "state": "状态"
            }
          },
          "sensor": {
            "label": "传感器",
            "defaultName": "传感器",
            "config": {
              "target": {
                "label": "目标",
                "options": {
                  "player": "玩家",
                  "enemy": "敌人",
                  "ally": "盟友",
                  "any": "任何"
                }
              },
              "radius": {
                "label": "探测半径"
              },
              "los": {
                "label": "需要视线"
              }
            },
            "inputs": {
              "enable": "启用",
              "disable": "禁用"
            },
            "outputs": {
              "detected": "检测到",
              "lost": "丢失的",
              "count": "计数"
            }
          },
          "logic": {
            "label": "逻辑节点",
            "defaultName": "逻辑",
            "config": {
              "operator": {
                "label": "操作员",
                "options": {
                  "and": "AND",
                  "or": "或",
                  "xor": "异或",
                  "nand": "NAND",
                  "nor": "NOR",
                  "xnor": "XNOR",
                  "not": "不"
                }
              },
              "inputCount": {
                "label": "输入"
              },
              "inverted": {
                "label": "反转输出"
              }
            },
            "inputs": {
              "in1": "输入1",
              "in2": "输入2"
            },
            "outputs": {
              "true": "正确",
              "false": "False",
              "state": "状态"
            }
          },
          "script": {
            "label": "脚本节点",
            "defaultName": "脚本",
            "config": {
              "language": {
                "label": "语言",
                "options": {
                  "js": "JavaScript",
                  "lua": "卢阿"
                }
              },
              "autoRun": {
                "label": "在没有信号的情况下运行每个刻度"
              },
              "code": {
                "label": "代码"
              }
            },
            "inputs": {
              "run": "运行",
              "param": "参数"
            },
            "outputs": {
              "done": "完成",
              "result": "结果",
              "error": "错误"
            }
          },
          "io": {
            "label": "I/O节点",
            "defaultName": "I/O",
            "config": {
              "mode": {
                "label": "操作",
                "options": {
                  "read": "已读",
                  "write": "写",
                  "append": "追加"
                }
              },
              "path": {
                "label": "路径"
              },
              "format": {
                "label": "格式",
                "options": {
                  "json": "JSON",
                  "text": "文本",
                  "binary": "二进制"
                }
              },
              "throttle": {
                "label": "冷却时间"
              }
            },
            "inputs": {
              "execute": "执行",
              "payload": "负载"
            },
            "outputs": {
              "success": "成功",
              "data": "结果",
              "failure": "失败"
            }
          },
          "alert": {
            "label": "提醒",
            "defaultName": "提醒",
            "config": {
              "message": {
                "label": "信息"
              },
              "level": {
                "label": "等级",
                "options": {
                  "info": "信息",
                  "warning": "警告",
                  "error": "错误"
                }
              },
              "cooldown": {
                "label": "冷却时间"
              }
            },
            "inputs": {
              "trigger": "显示",
              "setMessage": "设置消息"
            },
            "outputs": {
              "shown": "显示"
            }
          }
        },
        "wires": {
          "empty": "尚未连接。单击一个输出端口来创建一个。",
          "signal": {
            "binary": "二进制",
            "pulse": "脉冲",
            "value": "价值"
          },
          "status": {
            "outputPort": "输出端口",
            "selectTarget": "点击一个目标{label}.",
            "addGimmick": "添加一个噱头来配置连接。",
            "ready": "单击输出端口开始新连接。",
            "selectOutputFirst": "先选择一个输出端口。",
            "samePort": "无法与自身连接同一端口。"
          }
        },
        "palette": {
          "empty": "尚未保存颜色。",
          "apply": "应用颜色",
          "remove": "去除颜色"
        },
        "nodeMap": {
          "empty": "没有可用的地图。"
        },
        "maps": {
          "empty": "还没有地图。使用“添加地图”创建一张。"
        },
        "validation": {
          "ready": "准备开始",
          "enemies": {
            "overLimit": "超过敌人上限({max})。消灭敌人。",
            "limitReached": "达到敌人限制 ({max})。删除一个敌人以添加另一个敌人。"
          },
          "gimmicks": {
            "limitReached": "达到噱头限制（{max}）。删除现有的噱头。"
          },
          "wires": {
            "limitReached": "达到线限制（{max}）。删除现有连接。"
          },
          "brush": {
            "enemySelect": "在使用敌人画笔之前选择一个敌人。",
            "domainSelect": "使用域刷之前选择一个域水晶。"
          }
        },
        "start": {
          "title": "启动",
          "actions": {
            "launch": "启动沙箱",
            "export": "导出设置",
            "import": "导入设置"
          },
          "warning": "沙盒运行不会奖励 EXP。",
          "defaultError": "启动沙箱失败。"
        },
        "io": {
          "export": {
            "success": "导出沙盒设置。",
            "failure": "导出失败。"
          },
          "import": {
            "noFile": "未选择文件。",
            "loading": "加载中...",
            "readError": "无法读取文件。",
            "unsupported": "不支持的文件格式。",
            "genericFailure": "导入失败。",
            "success": "导入沙盒设置。",
            "unknownError": "发生未知错误。",
            "failedWithReason": "导入失败：{reason}"
          }
        },
        "controls": {
          "domain": {
            "noneAvailable": "没有可用的领域水晶"
          }
        }
      },
      "imageViewer": {
        "panelAriaLabel": "图像查看器",
        "header": {
          "title": "图像查看器",
          "description": "用于查看带有平移、缩放、旋转、拉伸和透视变换的屏幕截图的实用程序预览（仅限预览）。"
        },
        "stage": {
          "ariaLabel": "图像预览区域",
          "placeholder": "选择图像文件或将其拖放到此处。",
          "hint": "使用鼠标滚轮缩放，拖动平移，双击重置视图。",
          "imageAlt": "预览所选图像"
        },
        "upload": {
          "select": "选择图像文件",
          "resetView": "重置视图",
          "resetAll": "全部重置"
        },
        "controls": {
          "zoom": "缩放",
          "rotation": "旋转",
          "stretchX": "水平拉伸",
          "stretchY": "垂直拉伸",
          "perspective": "视角距离",
          "rotateX": "透视X旋转",
          "rotateY": "透视Y旋转"
        },
        "meta": {
          "title": "元数据",
          "name": "文件名",
          "type": "类型",
          "size": "大小",
          "dimensions": "图像尺寸",
          "modified": "最后修改",
          "nameFallback": "(无标题)",
          "typeFallback": "未知",
          "dimensionsValue": "{width} × {height} px"
        },
        "messages": {
          "loadSuccess": "图像已加载。",
          "loadError": "加载图像失败。",
          "invalidType": "仅支持图像文件。",
          "loading": "加载图像…",
          "resetView": "视图设置重置。",
          "resetAll": "图像查看器已重置。"
        },
        "errors": {
          "missingElements": "[ImageViewer]未找到所需元素。"
        }
      },
      "blockdataEditor": {
        "panelAriaLabel": "区块数据编辑",
        "header": {
          "title": "BlockData可视化编辑器",
          "description": "加载 blockdata.json 以查看、编辑和导出 BlockDim 块定义。"
        },
        "sidebar": {
          "ariaLabel": "块列表",
          "groupLabel": "目标设置",
          "groupAriaLabel": "区块数据集",
          "groups": {
            "blocks1": "第一个区块",
            "blocks2": "第二块",
            "blocks3": "第三块"
          },
          "searchLabel": "搜索",
          "searchPlaceholder": "按名称或按键过滤",
          "create": "+新方块",
          "listAriaLabel": "候选区块",
          "empty": {
            "noData": "未加载数据。",
            "noMatches": "没有与过滤器匹配的块。",
            "noBlocks": "没有可用的块。"
          },
          "untitled": "(无标题)"
        },
        "main": {
          "versionLabel": "版本",
          "actions": {
            "reload": "重新加载",
            "import": "导入",
            "copy": "复制",
            "download": "下载"
          },
          "formLegend": "区块详细信息",
          "fields": {
            "key": {
              "label": "按键",
              "placeholder": "例如b3999"
            },
            "name": {
              "label": "名称",
              "placeholder": "模块名称"
            },
            "level": {
              "label": "推荐等级"
            },
            "size": {
              "label": "大小"
            },
            "depth": {
              "label": "深度"
            },
            "chest": {
              "label": "宝箱"
            },
            "type": {
              "label": "类型",
              "placeholder": "例如迷宫"
            },
            "bossFloors": {
              "label": "Boss楼层",
              "placeholder": "逗号分隔（如5,10）"
            },
            "extras": {
              "label": "额外属性（JSON）"
            }
          },
          "formActions": {
            "save": "保存选择",
            "delete": "删除"
          },
          "preview": {
            "ariaLabel": "JSON预览",
            "title": "blockdata.json预览",
            "size": "{lines}线/{bytes}字节"
          },
          "dirty": {
            "dirty": "检测到未保存的更改。请记住导出或复制您的数据。",
            "clean": "所有更改已保存。"
          },
          "status": {
            "loading": "加载blockdata.json...",
            "loadSuccess": "加载的blockdata.json。",
            "loadError": "无法加载{source}。请从导入操作中导入。",
            "noData": "未加载数据。",
            "creating": "创建一个新区块。填写必填字段。",
            "importSuccess": "已加载 {name}.",
            "importParseError": "解析JSON失败。请验证格式。",
            "importReadError": "无法读取文件。",
            "saved": "方块已保存。",
            "deleteNoSelection": "未选择删除任何方块。",
            "deleted": "块已删除。",
            "copyEmpty": "没什么可复制的。",
            "copied": "复制到剪贴板。",
            "copyFailed": "复制失败。",
            "downloadEmpty": "无需下载。",
            "downloaded": "下载 JSON 文件。"
          },
          "confirm": {
            "reload": "未保存的更改将丢失。还是要重新加载吗？",
            "delete": "删除所选块？",
            "discard": "放弃正在进行的编辑？"
          },
          "list": {
            "levelValue": "Lv {level}",
            "levelUnknown": "Lv -",
            "meta": "{key} · {level}"
          }
        },
        "errors": {
          "extrasObject": "额外属性必须是JSON对象。",
          "missingKey": "输入密钥。",
          "missingName": "输入名称。",
          "duplicateKey": "已经有相同键的方块存在。",
          "invalidBossFloor": "Boss楼层包含非数字值：{value}"
        }
      },
      "modMaker": {
        "panelAriaLabel": "地下城类型模组制作",
        "header": {
          "title": "地下城类型模组制作",
          "description": "导出带有元数据、结构模式、生成算法和BlockDim的插件JS块。"
        },
        "meta": {
          "title": "附加信息",
          "fields": {
            "id": {
              "label": "Addon ID",
              "placeholder": "例如定制包"
            },
            "name": {
              "label": "显示名称",
              "placeholder": "例如自定义地牢包"
            },
            "version": {
              "label": "版本"
            },
            "author": {
              "label": "作者",
              "placeholder": "你的名字"
            },
            "description": {
              "label": "描述",
              "placeholder": "插件总体说明"
            }
          }
        },
        "structures": {
          "title": "结构库",
          "actions": {
            "add": "+添加结构",
            "remove": "删除选择"
          },
          "listAria": "结构列表",
          "fields": {
            "id": {
              "label": "ID",
              "placeholder": "例如自定义房间"
            },
            "name": {
              "label": "名称",
              "placeholder": "显示标签"
            },
            "anchorX": {
              "label": "锚点 X"
            },
            "anchorY": {
              "label": "锚Y"
            },
            "tags": {
              "label": "标签（逗号分隔）",
              "placeholder": "例如房间，地理"
            },
            "allowRotate": {
              "label": "允许旋转"
            },
            "allowMirror": {
              "label": "允许镜像"
            },
            "width": {
              "label": "宽度"
            },
            "height": {
              "label": "身高"
            },
            "preview": {
              "label": "图案预览"
            }
          },
          "grid": {
            "hint": "单击单元格即可循环：空→地板→墙",
            "fillEmpty": "全部为空",
            "fillFloor": "全部楼层",
            "fillWall": "全部墙",
            "ariaLabel": "结构模式"
          },
          "defaultItem": "结构{index}"
        },
        "placeholders": {
          "structurePreview": "添加结构以预览。",
          "fixedDisabled": "启用固定地图来编辑它们。",
          "fixedAddFloor": "添加楼层配置固定布局。"
        },
        "fixed": {
          "title": "固定地图",
          "enable": {
            "label": "使用固定贴图"
          },
          "fields": {
            "floorCount": {
              "label": "楼层数"
            },
            "bossFloors": {
              "label": "Boss楼层（以逗号分隔）",
              "placeholder": "例如5,10"
            },
            "width": {
              "label": "宽度"
            },
            "height": {
              "label": "身高"
            }
          },
          "note": "在算法中调用<code>ctx.fixedMaps.applyCurrent()</code>以应用该楼层的固定值 地图.",
          "floorListAria": "固定地图楼层",
          "actions": {
            "copyPrevious": "复制上一层"
          },
          "grid": {
            "hint": "点击单元格循环：墙→地板→空",
            "fillWall": "所有墙壁",
            "fillFloor": "全部楼层",
            "fillVoid": "全部为空",
            "ariaLabel": "固定地图图案"
          }
        },
        "generators": {
          "title": "生成算法",
          "actions": {
            "add": "+添加发电机",
            "remove": "删除选择"
          },
          "listAria": "生成器列表",
          "fields": {
            "id": {
              "label": "ID",
              "placeholder": "例如自定义地牢"
            },
            "name": {
              "label": "名称",
              "placeholder": "地下城名称"
            },
            "description": {
              "label": "描述",
              "placeholder": "列表中显示的摘要"
            },
            "normalMix": {
              "label": "正常混合比例"
            },
            "blockMix": {
              "label": "BlockDim混合比例"
            },
            "tags": {
              "label": "标签（逗号分隔）",
              "placeholder": "例如房间，有机"
            },
            "dark": {
              "label": "黑暗（视野半径5）"
            },
            "poison": {
              "label": "毒雾（普通牌变成毒药）"
            },
            "code": {
              "label": "算法代码"
            }
          },
          "template": {
            "label": "模板",
            "options": {
              "blank": "空模板",
              "rooms": "房间和走廊样品",
              "structure": "结构放置示例",
              "fixed": "固定地图助手"
            },
            "apply": "应用所选模板"
          },
          "defaultItem": "生成器 {index}"
        },
        "blocks": {
          "title": "BlockDim区块定义",
          "actions": {
            "addFirst": "+ 第一名",
            "addSecond": "+ 2nd",
            "addThird": "+第3次"
          },
          "tiers": {
            "firstHeading": "第一个区块",
            "secondHeading": "第二块",
            "thirdHeading": "第三块",
            "firstAria": "第一块层",
            "secondAria": "第二块层",
            "thirdAria": "第 3 次 块层"
          },
          "empty": "暂无条目。使用上面的添加按钮创建一个。",
          "remove": "删除",
          "fields": {
            "key": {
              "label": "按键"
            },
            "name": {
              "label": "名称"
            },
            "level": {
              "label": "电平偏移",
              "placeholder": "例如+0"
            },
            "size": {
              "label": "尺寸偏移",
              "placeholder": "例如+1"
            },
            "depth": {
              "label": "深度偏移",
              "placeholder": "例如+1"
            },
            "chest": {
              "label": "胸型",
              "placeholder": "正常/更多/更少"
            },
            "type": {
              "label": "类型 ID",
              "placeholder": "例如自定义地牢"
            },
            "bossFloors": {
              "label": "Boss楼层",
              "placeholder": "例如5,10,15"
            },
            "description": {
              "label": "注释/描述"
            }
          },
          "defaultTitle": "{tier} #{index}"
        },
        "output": {
          "title": "输出"
        },
        "actions": {
          "copy": "复制到剪贴板",
          "download": "下载为.js文件"
        },
        "status": {
          "errorHeading": "⚠️ {count} 问题需要审查",
          "ready": "✅准备导出"
        },
        "feedback": {
          "copySuccess": "复制！",
          "copyFailed": "复制失败"
        },
        "templates": {
          "todoComment": " // TODO：编辑ctx.map生成副本。"
        },
        "errors": {
          "missingAddonId": "需要插件ID。",
          "invalidAddonId": "插件 ID 只能使用字母数字字符、连字符或下划线。",
          "structureMissingId": "输入结构ID {index}.",
          "structureDuplicateId": "结构ID“{id}”重复。",
          "structureAnchorOutOfRange": "结构 {index} 主播超出范围。",
          "generatorMissing": "添加至少一台发电机。",
          "generatorMissingId": "输入发电机 {index} 的 ID。",
          "generatorDuplicateId": "生成器 ID“{id}”重复。",
          "generatorNormalRange": "生成器 {index} 正常混合必须在 0 到 1 之间。",
          "generatorBlockRange": "生成器 {index} BlockDim 混合必须介于 0 和 1 之间。",
          "generatorMissingCode": "输入生成器{index}的算法代码。",
          "blockMissingKey": "输入{tier}块的密钥{index}.",
          "blockDuplicateKey": "块密钥“{key}”重复。",
          "generatorFixedMissing": "生成器{index}缺少固定地图布局。",
          "generatorFixedFloorMissing": "生成器{index}缺少楼层{floor}的固定地图。",
          "generatorFixedFloorEmpty": "生成器 {index} 楼层 {floor} 固定地图没有地砖。"
        }
      }
    },
    "achievements": {
      "categories": {
        "dungeon": "地下城",
        "blockdim": "块Dimension",
        "hatena": "哈特纳方块",
        "tools": "工具",
        "mini": "小游戏"
      },
      "messages": {
        "categoryComingSoon": "成果即将推出。",
        "emptyCategory": "未注册任何成就"
      },
      "status": {
        "comingSoon": "即将推出",
        "unlocked": "解锁",
        "locked": "锁定"
      },
      "rewardMemo": "奖励备注：{reward}",
      "difficulty": {
        "unplayed": "未清除",
        "labels": {
          "veryEasy": "非常简单",
          "easy": "简单",
          "normal": "普通",
          "second": "第二",
          "hard": "困难",
          "veryHard": "非常困难"
        }
      },
      "summary": {
        "comingSoon": "即将推出",
        "categoryRatio": "{unlocked}/{total}",
        "highlights": {
          "playTime": "总游戏时间",
          "dungeonsCleared": "地下城通关",
          "highestDifficulty": "最高难度",
          "totalExp": "总 EXP",
          "totalExpValue": "{value} EXP",
          "hatenaTriggered": "哈特纳激活",
          "hatenaTriggeredValue": "{value} 次",
          "hatenaPositiveRate": "哈特纳好评率",
          "hatenaPositiveRateValue": "{value}%"
        }
      },
      "meta": {
        "repeatableCount": "总完成数：{count}",
        "counterCount": "计数：{count}"
      },
      "progress": {
        "ratio": "{current} / {target}",
        "floorRatio": "{current}F / {target}F",
        "bossDefeated": "{count} 击败 Boss",
        "nextRuns": "{count}运行到下一个里程碑",
        "completed": "已完成！",
        "remaining": "{count}还有更多",
        "actions": "{count} 动作",
        "duration": {
          "full": "{hours}h出现新的聚落形式{minutesValue}米 {secondsValue}s",
          "minutes": "{minutes}m {secondsValue}s",
          "seconds": "{seconds}s",
          "ratio": "{current} / {target}"
        }
      },
      "stats": {
        "sections": {
          "core": {
            "title": "副本记录"
          },
          "blockdim": {
            "title": "方块维度记录"
          },
          "hatena": {
            "title": "哈特纳块记录"
          },
          "tools": {
            "title": "工具使用"
          },
          "addons": {
            "title": "插件状态"
          }
        },
        "entries": {
          "core": {
            "playTime": {
              "label": "总游戏时间",
              "description": "游戏已运行的总时间。"
            },
            "totalSteps": {
              "label": "总步数",
              "description": "移动的总方块数远。",
              "value": "{value}图块"
            },
            "floorsAdvanced": {
              "label": "高级楼层",
              "description": "通过楼梯爬上楼层。"
            },
            "highestFloorReached": {
              "label": "到达最深楼层",
              "description": "目前到达的最深楼层。",
              "value": "楼层{value}"
            },
            "dungeonsCleared": {
              "label": "地下城通关",
              "description": "常规维度和区块维度的总通关数地下城."
            },
            "enemiesDefeated": {
              "label": "击败敌人",
              "description": "击败敌人总数。"
            },
            "bossesDefeated": {
              "label": "击败头目",
              "description": "击败的 Boss 总数。"
            },
            "totalExpEarned": {
              "label": "获得的总经验值",
              "description": "从探索和迷你游戏中获得的经验。",
              "value": "{value} EXP"
            },
            "damageDealt": {
              "label": "总伤害",
              "description": "对敌人造成的总伤害。"
            },
            "damageTaken": {
              "label": "受到的总伤害",
              "description": "来自敌人和敌人的总伤害"
            },
            "chestsOpened": {
              "label": "宝箱已打开",
              "description": "运行期间打开的箱子数量。"
            },
            "rareChestsOpened": {
              "label": "打开稀有宝箱",
              "description": "打开稀有宝箱数量。"
            },
            "normalChestsOpened": {
              "label": "普通宝箱已打开",
              "description": "打开的标准宝箱数量。"
            },
            "healingItemsUsed": {
              "label": "使用的治疗物品",
              "description": "药水或HP提升的次数使用过。"
            },
            "autoItemsTriggered": {
              "label": "自动物品触发",
              "description": "次自动治愈项目激活。"
            },
            "deaths": {
              "label": "失败次数",
              "description": "游戏结束次数"
            },
            "highestDifficultyIndex": {
              "label": "最高通关难度",
              "description": "迄今为止通关的最高难度。"
            }
          },
          "blockdim": {
            "gatesOpened": {
              "label": "门激活",
              "description": "通过门输入块尺寸的次数。"
            },
            "bookmarksAdded": {
              "label": "已添加书签",
              "description": "保存的块维度书签数量。"
            },
            "randomSelections": {
              "label": "随机选择",
              "description": "使用等权重随机选择的次数。"
            },
            "weightedSelections": {
              "label": "加权选择",
              "description": "使用加权随机选择的次数。"
            }
          },
          "hatena": {
            "blocksAppeared": {
              "label": "遇到的块",
              "description": "运行中发现Hatena区块。",
              "value": "{value}块"
            },
            "blocksTriggered": {
              "label": "触发区块",
              "description": "踩踏激活哈特纳方块。",
              "value": "{value}触发"
            },
            "positiveEffects": {
              "label": "积极成果",
              "description": "次数哈特纳方块产生积极效果。",
              "value": "{value} 次"
            },
            "neutralEffects": {
              "label": "中立结果",
              "description": "Times Hatena 块产生中性结果。",
              "value": "{value} 次"
            },
            "negativeEffects": {
              "label": "负面结果",
              "description": "哈泰纳方块产生负面影响的次数。",
              "value": "{value} 次"
            },
            "expGained": {
              "label": "获得经验",
              "description": "从 Hatena 方块获得的经验。",
              "value": "{value} EXP"
            },
            "expLost": {
              "label": "经验损失",
              "description": "哈特纳区块的经验丢失。",
              "value": "{value} EXP"
            },
            "bombDamageTaken": {
              "label": "炸弹造成的伤害",
              "description": "Hatena炸弹效果受到的总伤害。",
              "value": "{value} 伤害"
            },
            "bombHealed": {
              "label": "炸弹治疗",
              "description": "通过哈特纳炸弹治疗效果恢复总生命值。",
              "value": "{value} HP"
            },
            "bombGuards": {
              "label": "炸弹守卫",
              "description": "倍数守卫效果减少炸弹伤害。",
              "value": "{value} 次"
            },
            "normalChestsSpawned": {
              "label": "正常宝箱生成",
              "description": "由Hatena方块创建的普通宝箱。",
              "value": "{value}宝箱"
            },
            "rareChestsSpawned": {
              "label": "生成稀有宝箱",
              "description": "由哈特纳方块创造的稀有箱子。",
              "value": "{value}宝箱"
            },
            "itemsGranted": {
              "label": "授予的项目",
              "description": "由 Hatena 方块授予的物品。",
              "value": "{value} 物品"
            },
            "enemyAmbushes": {
              "label": "敌人伏击",
              "description": "通过伏击事件产生敌人。",
              "value": "{value}敌人"
            },
            "bombsTriggered": {
              "label": "炸弹事件",
              "description": "由哈特纳方块触发的炸弹效果。",
              "value": "{value} 次"
            },
            "levelUps": {
              "label": "升级",
              "description": "Hatena块增加你的等级的次数。",
              "value": "{value} 次"
            },
            "levelUpLevels": {
              "label": "获得等级",
              "description": "从Hatena块获得的总级别。",
              "value": "{value}级"
            },
            "levelDowns": {
              "label": "级别下降",
              "description": "多次哈特纳区块降低了你的等级。",
              "value": "{value} 次"
            },
            "levelDownLevels": {
              "label": "失落等级",
              "description": "Hatena 方块损失的总等级。",
              "value": "{value}级"
            },
            "statusesApplied": {
              "label": "造成的状态",
              "description": "次数Hatena格挡造成状态 疾病。",
              "value": "{value} 次"
            },
            "statusesResisted": {
              "label": "抵抗状态",
              "description": "Hatena 状态无效的次数。",
              "value": "{value} 次"
            },
            "abilityUps": {
              "label": "能力提升",
              "description": "多次哈特纳方块提高了你的属性。",
              "value": "{value} 次"
            },
            "abilityDowns": {
              "label": "能力下降",
              "description": "哈泰娜方块降低你的统计数据的次数。",
              "value": "{value} 次"
            }
          },
          "tools": {
            "tabVisits": {
              "label": "工具选项卡访问",
              "description": "打开“工具”选项卡的次数。"
            },
            "modExports": {
              "label": "模组出口",
              "description": "在模组创建工具中执行导出。"
            },
            "blockdataSaves": {
              "label": "BlockData Saves",
              "description": "时间数据保存在 BlockData 编辑器中。"
            },
            "blockdataDownloads": {
              "label": "块数据下载",
              "description": "时间数据是从 BlockData 编辑器下载的。"
            },
            "sandboxSessions": {
              "label": "沙盒会话",
              "description": "沙盒界面的时间打开。"
            }
          },
          "addons": {
            "activeGenerators": {
              "label": "活动生成类型",
              "description": "当前加载的已注册插件生成类型的数量。",
              "value": "{value}类型"
            },
            "miniGameMods": {
              "label": "迷你游戏模组",
              "description": "计数 mods提供的MiniExp游戏的数量。",
              "value": "{value}标题"
            }
          }
        }
      },
      "custom": {
        "empty": "尚无自定义成就。使用表格添加一个。",
        "actions": {
          "delete": "删除",
          "reset": "重置"
        },
        "todo": {
          "statusCompleted": "状态：已完成",
          "statusIncomplete": "状态：不完全",
          "markComplete": "标记为已完成",
          "markIncomplete": "标记为不完整"
        },
        "repeatable": {
          "info": "总完成数：{count}",
          "infoWithTarget": "总完成数：{count} /目标{target}"
        },
        "counter": {
          "info": "当前值：{value}",
          "infoWithTarget": "当前值：{value} / 目标{target}"
        },
        "defaultTitle": "自定义成就",
        "confirmDelete": "删除这个自定义成就？"
      },
      "ui": {
        "subtabs": {
          "ariaLabel": "成就和统计子选项卡",
          "achievements": "成就",
          "stats": "统计数据"
        },
        "achievements": {
          "title": "成就",
          "description": "根据你的冒险和工具使用情况自动更新。查看每个类别的进度。"
        },
        "stats": {
          "title": "统计数据",
          "description": "查看你的冒险和工具交互的累积记录。"
        },
        "fallback": "加载成就系统…如果此消息仍然存在，请重新加载页面。",
        "custom": {
          "title": "自定义活动 成就",
          "description": "设置自己的目标和奖励，以将成就用作待办事项列表或农业跟踪器。",
          "form": {
            "legend": "添加一个新的自定义成就",
            "title": {
              "label": "标题",
              "placeholder": "例如，每天登录"
            },
            "description": {
              "label": "描述",
              "placeholder": "你想实现什么目的？"
            },
            "reward": {
              "label": "奖励备注",
              "placeholder": "记下奖励或备注"
            },
            "type": {
              "label": "类型",
              "todo": "待办事项（单次完成）",
              "repeatable": "可重复",
              "counter": "反击"
            },
            "target": {
              "label": "目标数 （可选）",
              "placeholder": "例如，10"
            },
            "submit": "添加成就"
          }
        }
      },
      "auto": {
        "dungeon_first_clear": {
          "title": "第一次胜利",
          "description": "清除任何地牢。",
          "reward": "标题：“新手冒险家”"
        },
        "dungeon_hard_clear": {
          "title": "困难征服者",
          "description": "在困难或以上难度下通关地下城。",
          "reward": "高难度 纪念章"
        },
        "dungeon_step_1000": {
          "title": "千步",
          "description": "总行进距离达到1,000格。",
          "reward": "运动知识笔记"
        },
        "dungeon_boss_hunter": {
          "title": "首领猎人",
          "description": "打败Boss直接计入此成就。",
          "reward": "标题：“猎人”"
        },
        "dungeon_loop_runner": {
          "title": "循环 主人",
          "description": "每通关 5 个地下城获得进度。",
          "reward": "循环日志卡"
        },
        "dungeon_floor_master": {
          "title": "深渊行者",
          "description": "到达 30 层或更深。",
          "reward": "标题：“深渊行者”"
        },
        "dungeon_healing_specialist": {
          "title": "紧急治疗师",
          "description": "使用治疗物品25次。",
          "reward": "治疗 手册"
        },
        "dungeon_auto_guardian": {
          "title": "汽车卫士",
          "description": "触发自动项目 10 次。",
          "reward": "自动恢复核心"
        },
        "dungeon_playtime_30min": {
          "title": "冒险开始",
          "description": "总播放时间达到30分钟。",
          "reward": "袖珍沙漏"
        },
        "dungeon_playtime_3hour": {
          "title": "迷失时间",
          "description": "总游戏时间达到3小时。",
          "reward": "老兵冒险家手表"
        },
        "dungeon_playtime_12hour": {
          "title": "无尽的探索者",
          "description": "达到12小时的总游戏时间。",
          "reward": "计时指南针"
        },
        "dungeon_rare_collector": {
          "title": "稀有收藏家",
          "description": "打开 10 个稀有宝箱。",
          "reward": "稀有钥匙碎片"
        },
        "dungeon_iron_wall": {
          "title": "铁幸存者",
          "description": "受到的总伤害为 10,000。",
          "reward": "铁壁盾"
        },
        "blockdim_first_gate": {
          "title": "门启动",
          "description": "输入 首次通过门进入方块维度。",
          "reward": "门激活日志"
        },
        "blockdim_bookmark_collector": {
          "title": "书签收藏家",
          "description": "注册5个方块维度书签。",
          "reward": "组合研究笔记"
        },
        "blockdim_weighted_explorer": {
          "title": "神枪手合成",
          "description": "使用加权随机选择。",
          "reward": "神枪手公式"
        },
        "hatena_first_trigger": {
          "title": "神秘遭遇",
          "description": "触发仇恨方块 第一次。",
          "reward": "调查日志“？”"
        },
        "hatena_block_researcher": {
          "title": "Hatena 研究团队",
          "description": "触发仇恨方块25次。",
          "reward": "观察日志表"
        },
        "hatena_lucky_chain": {
          "title": "幸运探索者",
          "description": "获得 15 个积极的仇恨效果。",
          "reward": "幸运符"
        },
        "hatena_unlucky_survivor": {
          "title": "不幸幸存者",
          "description": "抵御 10 种负面仇恨效应。",
          "reward": "耐力奖章"
        },
        "hatena_rare_hunter": {
          "title": "财运亨通",
          "description": "从哈泰纳方块中生成 3 个稀有宝箱。",
          "reward": "宝物鉴定镜头"
        },
        "tools_first_visit": {
          "title": "创意工坊首次亮相",
          "description": "打开工具选项卡。",
          "reward": "工作日志"
        },
        "tools_mod_export": {
          "title": "插件生成器",
          "description": "从模组创建工具中导出代码。",
          "reward": "Mod签名印记"
        },
        "tools_blockdata_saver": {
          "title": "数据维护者",
          "description": "从区块数据编辑器保存或下载数据。",
          "reward": "维护徽章"
        },
        "tools_sandbox_session": {
          "title": "模拟爱好者",
          "description": "打开沙盒界面并编辑。",
          "reward": "测试通过"
        },
        "minigame_coming_soon": {
          "title": "小游戏成就",
          "description": "即将推出 - 迷你游戏成就即将到来。",
          "reward": ""
        }
      }
    },
    "enemy": {
      "modal": {
        "noiseBlocked": "噪音太强，无法读取敌人的数据...",
        "title": {
          "boss": "Boss信息",
          "standard": "敌人信息"
        },
        "sections": {
          "damage": "损坏预测"
        },
        "labels": {
          "level": "级别：",
          "type": "类型：",
          "hp": "生命值：",
          "attack": "攻击：",
          "defense": "防御：",
          "damageDeal": "造成伤害：",
          "damageTake": "受到的伤害：",
          "hitRate": "命中率：",
          "enemyHitRate": "敌人命中率："
        },
        "levelFormat": "Lv.{level}",
        "typeDescription": {
          "suppressed": "{description}（由于关卡差距而抑制特效）"
        },
        "damage": {
          "invincibleLabel": "无敌",
          "invincible": "0 ({label})",
          "critLabel": "暴击",
          "reverseLabel": "治疗量",
          "reverseRange": "{reverseLabel} {min}-{max} ({critLabel}: {critMin}-{critMax})",
          "range": "{min}-{max} ({critLabel}: {critMin}-{critMax})"
        },
        "hitRate": "{value}%",
        "enemyHitRate": "{value}%"
      },
      "types": {
        "normal": {
          "label": "标准",
          "description": "不执行任何特殊操作。"
        },
        "statusCaster": {
          "label": "状态施法者",
          "description": "当其攻击连接时可能会造成中毒或麻痹。"
        },
        "warper": {
          "label": "Warper",
          "description": "5月 击中时将播放器扭曲到另一个方块。"
        },
        "executioner": {
          "label": "执行器",
          "description": "危险的敌人，即时死亡攻击的几率很低。"
        },
        "knockback": {
          "label": "充电器",
          "description": "将玩家击退；与墙壁碰撞造成额外伤害。"
        },
        "swift": {
          "label": "迅捷战斗机",
          "description": "快速移动，在玩家的过程中采取两次行动转。"
        }
      }
    },
    "dungeons": {
      "base": {
        "1": {
          "name": "初学者森林",
          "description": "障碍物散布在广阔的草地上。"
        },
        "11": {
          "name": "幽暗洞穴",
          "description": "黑暗洞穴的蜿蜒网络。"
        },
        "21": {
          "name": "已毁 迷宫",
          "description": "古老的废墟充满了错综复杂的迷宫。"
        },
        "31": {
          "name": "地下神殿",
          "description": "由相互连接的房间和走廊组成的寺庙。"
        },
        "41": {
          "name": "魔法花园",
          "description": "一个充满魔法的圆形花园。"
        },
        "51": {
          "name": "水晶洞",
          "description": "蛇形洞穴，内衬水晶。"
        },
        "61": {
          "name": "远古迷宫",
          "description": "永恒、广阔的迷宫。"
        },
        "71": {
          "name": "龙之巢穴",
          "description": "龙巢内连接的圆形房间。"
        },
        "81": {
          "name": "星空",
          "description": "星空下的一座巨大大厅。"
        },
        "91": {
          "name": "暮光之塔",
          "description": "世界尽头的一座塔，融合了多种布局。"
        },
        "X": {
          "name": "极限境界",
          "description": "25层终极地下城。"
        }
      }
    },
    "game": {
      "toolbar": {
        "back": "返回",
        "items": "项目",
        "skills": "技能",
        "status": "状态",
        "import": "导入",
        "export": "导出",
        "toggleDungeonName": "显示地下城名称",
        "sandboxMenu": "互动",
        "godConsole": "创作者控制台",
        "floor": {
          "heading": "当前楼层",
          "label": "FLOOR"
        }
      },
      "dungeonOverlay": {
        "label": "副本特征",
        "titleFallback": "地下城",
        "typePlaceholder": "字段类型",
        "descriptionPlaceholder": "地下城特征出现在此处。",
        "badge": {
          "none": "没有显着特征",
          "dark": {
            "active": "黑暗",
            "suppressed": "黑暗（抑制）"
          },
          "poison": {
            "active": "毒药 雾",
            "suppressed": "毒雾（抑制）"
          },
          "noise": {
            "active": "噪音",
            "suppressed": "噪音（已抑制）"
          },
          "nested": "嵌套x{value}"
        }
      },
      "blockDim": {
        "preview": {
          "selection": "嵌套{nested} /尺寸{dimension}: {block1} · {block2} · {block3}"
        }
      },
      "playerStats": {
        "labels": {
          "level": "等级",
          "attackShort": "ATK",
          "defenseShort": "DEF",
          "hp": "HP",
          "satiety": "饱腹感",
          "exp": "EXP",
          "sp": "SP"
        }
      },
      "controlsCheatsheet": {
        "title": "操作速查表",
        "subtitle": "首次冒险前先确认这些基本操作。",
        "dismiss": "不再显示",
        "labels": {
          "arrows": "方向键",
          "space": "空格键",
          "toolbar": "工具栏快捷键"
        },
        "descriptions": {
          "arrows": "移动、探索，碰到敌人即可攻击。",
          "space": "原地朝面对的方向攻击。",
          "toolbar": "通过顶部工具栏快速打开返回、道具、技能、状态以及导入/导出。"
        }
      },
      "statuses": {
        "poison": "毒",
        "paralysis": "瘫痪",
        "abilityUp": "通电",
        "abilityDown": "状态下降",
        "levelDown": "降低等级"
      },
      "autoItem": {
        "status": "自动物品开启：治疗物品 x {count}"
      },
      "common": {
        "count": "x {count}",
        "none": "没有任何",
        "floor": "楼层{floor}"
      },
      "miniExp": {
        "dinoRunner": {
          "comboLabel": "组合{combo}",
          "startPromptPrimary": "按空格键/单击开始",
          "startPromptSecondary": "按↑或空格键跳跃，按↓键躲避",
          "gameOver": "游戏结束",
          "restartHint": "按空格/R重新启动",
          "distanceLabel": "距离{distance}"
        },
        "ultimateTtt": {
          "status": {
            "player": "轮到你了",
            "ai": "轮到AI了",
            "ended": "游戏结束"
          },
          "activeBoard": "目标板：({x}，{y})",
          "overlay": {
            "restartHint": "按R重新启动"
          },
          "result": {
            "playerWin": "你赢了！",
            "aiWin": "AI获胜...",
            "draw": "抽牌"
          }
        }
      },
      "backgammon": {
        "actor": {
          "player": "玩家",
          "ai": "AI"
        },
        "difficulty": {
          "easy": "简单",
          "normal": "普通",
          "hard": "困难"
        },
        "point": "点{point}",
        "bar": "栏",
        "dice": {
          "none": "-"
        },
        "board": {
          "playerOff": "{actor}关闭 ({countFormatted})",
          "aiOff": "{actor}关闭 ({countFormatted})",
          "barText": "{label}"
        },
        "action": {
          "roll": "滚动骰子",
          "rematch": "重新比赛"
        },
        "badge": {
          "difficulty": "难度：{difficulty}",
          "hits": "命中：{hitsFormatted}",
          "score": "得分： {scoreFormatted}"
        },
        "ui": {
          "turn": "转动：{actor}{status}",
          "turnFinishedSuffix": " （已完成）",
          "dice": {
            "empty": "骰子：-",
            "detail": "骰子：[{diceFormatted}]/剩余[{remainingFormatted}]"
          },
          "bar": "{bar}: {playerLabel} {playerFormatted} / {aiLabel} {aiFormatted}",
          "bearOff": {
            "title": "停止",
            "summary": "{title}：{playerLabel} {playerFormatted} / {aiLabel} {aiFormatted}"
          }
        },
        "log": {
          "bearOff": "{actor} 从 {fromLabel} ({dieFormatted})出发",
          "barHit": "{actor} 从{bar} 至 {toLabel} ({dieFormatted})：命中！",
          "barEntry": "{actor} 从 {bar} 到 {toLabel} ({dieFormatted})",
          "moveHit": "{actor} 移动 {fromLabel} → {toLabel} ({dieFormatted})：击中！",
          "move": "{actor}移动{fromLabel} → {toLabel} ({dieFormatted})",
          "win": {
            "player": "玩家获胜！ {rewardFormatted} EXP获得。",
            "ai": "AI获胜...重试。"
          },
          "aiDice": "AI骰子：{diceFormatted}",
          "aiNoMove": "AI 无法移动。",
          "playerDice": "玩家骰子：{diceFormatted}",
          "noMoves": "没有可用的合法移动。",
          "newGame": "新比赛开始。玩家先行。"
        }
      },
      "runResult": {
        "defaultCause": "游戏结束"
      },
      "death": {
        "cause": {
          "generic": "游戏结束",
          "poison": "中毒...游戏结束。",
          "starvation": "因饥饿而崩溃...游戏结束。",
          "wallCollision": "撞到墙上后摔倒...游戏结束。",
          "instantKill": "被即时死亡攻击击倒...游戏结束。",
          "autoItemBackfire": "自动项目适得其反，你摔倒了......游戏结束。",
          "reversedPotion": "反转的药水压倒你...游戏结束。"
        }
      },
      "items": {
        "modal": {
          "title": "项目"
        },
        "countPrefix": "x",
        "actions": {
          "use": "使用",
          "eat": "消耗",
          "offer": "提供",
          "cleanse": "清除状态异常",
          "throw": "先投掷",
          "enable": "启用",
          "close": "关闭"
        },
        "autoItem": {
          "label": "自动物品",
          "hint": "生命值低于30%时自动恢复。"
        },
        "potion30": {
          "label": "30% HP 药水"
        },
        "hpBoost": {
          "label": "最大HP提升物品"
        },
        "atkBoost": {
          "label": "攻击提升项目"
        },
        "defBoost": {
          "label": "防御强化物品"
        },
        "hpBoostMajor": {
          "label": "最大生命值伟大的推动 (+25)"
        },
        "atkBoostMajor": {
          "label": "攻击大提升（+10）"
        },
        "defBoostMajor": {
          "label": "防御大提升(+10)"
        },
        "spElixir": {
          "label": "SP灵药"
        },
        "passiveOrbs": {
          "header": "被动宝珠"
        },
        "skillCharms": {
          "header": "技能魅力（各10回合）"
        },
        "errors": {
          "noHealingItem": "没有可用的治疗物品。",
          "noStatusToCleanse": "没有需要清除的异常状态。"
        }
      },
      "passiveOrb": {
        "summary": "总计{total}（{unique}类型）",
        "empty": "你没有被动球体。",
        "noEffects": "没有效果。",
        "countDetail": "拥有{count}",
        "detailSeparator": "/",
        "obtainDetail": "({details})",
        "obtain": "获得被动球“{label}”！{detail}",
        "obtainMultiple": "获得被动宝珠“{label}”×{delta}!{detail}",
        "orbs": {
          "attackBoost": {
            "name": "攻击力+1% Orb"
          },
          "defenseBoost": {
            "name": "防御力+1%宝珠"
          },
          "abilityBoost": {
            "name": "所有统计数据+1%宝珠"
          },
          "maxHpBoost": {
            "name": "最大生命值+10%宝珠"
          },
          "statusGuard": {
            "name": "疾病防护球"
          },
          "enemySpecialGuard": {
            "name": "敌方特卫球"
          },
          "poisonResist": {
            "name": "防毒球"
          },
          "paralysisResist": {
            "name": "麻痹抵抗球"
          },
          "abilityDownResist": {
            "name": "Stat Down 抗性宝珠"
          },
          "levelDownResist": {
            "name": "降级抵抗球"
          },
          "instantDeathResist": {
            "name": "瞬死抗性球"
          },
          "knockbackResist": {
            "name": "击退抗性宝珠"
          },
          "poisonDamageGuard": {
            "name": "毒药伤害防护球"
          },
          "bombDamageGuard": {
            "name": "炸弹伤害防护球"
          },
          "skillPowerBoost": {
            "name": "技能强度+10%宝珠"
          },
          "damageDealtBoost": {
            "name": "造成的伤害+10%宝珠"
          },
          "damageTakenGuard": {
            "name": "受到的伤害 -10% 宝珠"
          },
          "evasionBoost": {
            "name": "闪避+1% 法球"
          },
          "accuracyBoost": {
            "name": "精度+1% Orb"
          },
          "critDamageBoost": {
            "name": "暴击伤害+10%宝珠"
          }
        },
        "labels": {
          "maxHpMul": "最大生命值",
          "attackMul": "攻击",
          "defenseMul": "防御",
          "damageDealtMul": "造成的伤害",
          "damageTakenMul": "受到的伤害",
          "skillPowerMul": "技能强度",
          "accuracyMul": "准确度",
          "evasionMul": "躲避",
          "critDamageMul": "暴击伤害",
          "statusChanceMul": "状态机会",
          "enemySpecialChanceMul": "敌人特殊机会",
          "poisonStatusChanceMul": "中毒几率",
          "paralysisStatusChanceMul": "麻痹机会",
          "levelDownStatusChanceMul": "降级机会",
          "instantDeathChanceMul": "瞬死率",
          "knockbackChanceMul": "击退几率",
          "poisonDamageMul": "毒害伤害",
          "bombDamageMul": "炸弹伤害",
          "abilityDownPenaltyMul": "状态下降严重程度",
          "status:poison": "中毒几率",
          "status:paralysis": "麻痹机会",
          "status:levelDown": "降级机会",
          "instantDeath": "瞬死率",
          "enemySpecial:knockback": "击退几率",
          "poison": "毒害伤害",
          "bomb": "炸弹伤害",
          "abilityDownPenalty": "状态下降严重程度"
        }
      },
      "skillCharms": {
        "use": "使用",
        "empty": "没有拥有符咒。"
      },
      "events": {
        "hatena": {
          "spawnSingle": "一个神秘的？区块出现！",
          "spawnMultiple": "{count}神秘？方块出现！",
          "bombGuard": "爆炸影响已无效！",
          "bombHeal": "爆炸逆转并恢复{amount}生命值！",
          "bombDamage": "爆炸造成{amount}伤害！",
          "bombDeath": "你被困在爆炸中...游戏结束。",
          "itemObtained": "收到{item}！",
          "trigger": "你踩到了？方块！",
          "levelUp": "等级增加了 {amount}！",
          "levelNoChange": "但你的等级没有改变。",
          "levelDown": "等级降低了 {amount}...",
          "levelDownNoEffect": "你的等级不能下降任何",
          "expGain": "获得{amount} EXP！",
          "expGainNone": "没有获得经验值。",
          "expLoss": "丢失{amount} EXP...",
          "expLossNone": "没有经验值丢失。",
          "enemyAmbush": "敌人出现在你周围！",
          "noEnemies": "但没有敌人出现。",
          "poisonGuarded": "中毒被阻止！",
          "statusNone": "没有出现状态异常。",
          "buffFailed": "强化失败。",
          "debuffNone": "没有出现减益。",
          "rareChest": "出现耀眼的稀有宝箱！",
          "chestNoSpace": "没有足够的空间放置箱子。",
          "chest": "出现一个宝箱！",
          "noChest": "没有出现胸部。",
          "chestRing": "你被 宝箱！",
          "nothing": "但什么也没发生。"
        },
        "skills": {
          "statusGuarded": "技能效果使状态异常无效！"
        },
        "sp": {
          "unlocked": "SP系统解锁！",
          "notUnlocked": "SP尚未解锁",
          "notEnough": "SP不够。",
          "maxIncreased": "SP上限增加到{value}！",
          "gained": "获得{amount} SP。",
          "spent": "花费{amount} SP。",
          "offered": "提供治疗物品并获得{amount} SP。",
          "offerLocked": "SP系统解锁后即可提供物品。",
          "notUnlockedForItem": "SP解锁之前你不能使用它。",
          "noCapacity": "你的SP上限为0，所以没有任何效果。",
          "alreadyFull": "SP已满。",
          "elixirUsed": "使用了SP Elixir！恢复{amount} SP。",
          "fullyRestored": "SP完全恢复(+{amount})。"
        },
        "exp": {
          "bossBonusSuffix": "（Boss奖励！）",
          "enemyGain": "获得{amount}经验值！{bonus}",
          "spent": "已用{amount} EXP。 ({context})",
          "gained": "已获得 {amount} EXP！ ({context})"
        },
        "status": {
          "paralyzed": "你瘫痪不能动...",
          "paralyzedRemaining": "你瘫痪并且无法移动...（{turns}向左转）",
          "cured": {
            "poison": "毒药尽了。",
            "paralysis": "你摆脱了麻痹。",
            "abilityUp": "通电效果已过期。",
            "abilityDown": "统计惩罚 褪色。",
            "levelDown": "你的临时等级下降结束。"
          },
          "applied": {
            "poison": "你中毒了！ （{turns} 转）",
            "paralysis": "你瘫痪了，无法动弹！ （{turns} 圈）",
            "abilityUp": "你的能量激增！最大生命/攻击/防御提升（{turns}回合）",
            "abilityDown": "你的统计数据下降...最大HP/ATK/DEF下降（{turns}回合）",
            "levelDown": "你的等级暂时下降！ ({turns}转)"
          }
        },
        "levelUp": {
          "log": "升级！\n级别：{level} (+{levelDelta})\n最大生命值：{maxHp} (+{maxHpDelta})\n攻击力：{attack} (+{attackDelta})\nDEF: {defense} (+{defenseDelta})"
        },
        "sandbox": {
          "noExp": "沙盒模式不 奖EXP。",
          "started": "沙盒模式已启动。不奖励经验值。"
        },
        "console": {
          "executed": "创建者控制台执行代码。",
          "error": "创作者控制台错误：{message}"
        },
        "unlocks": {
          "nestedLegend": "完成嵌套99999999并获得阿诺斯级神性！",
          "consoleAlwaysOn": "创作者控制台和沙盒切换现在始终可用。"
        },
        "actions": {
          "wallDestroyed": "你摧毁了墙壁！"
        },
        "dungeon": {
          "darkness": "黑暗笼罩你的视野...",
          "poisonFog": "毒雾弥漫整个区域！即使是标准瓷砖也是危险的。"
        },
        "charms": {
          "unknown": "无法使用未知的符咒。",
          "notOwned": "你没有那个魅力。",
          "activated": "激活{label}魅力！效果持续{turns}回合。"
        },
        "satiety": {
          "enabled": "饱腹感系统已启用！",
          "disabled": "饱腹感系统已禁用。",
          "cannotEat": "只能在饱腹感系统激活时进食。",
          "alreadyFull": "饱腹感已达到最大。",
          "damage": "因饥饿而受到 {amount} 伤害！"
        },
        "chest": {
          "prefix": {
            "normal": "开胸了！",
            "rare": "打开黄金宝箱！ "
          },
          "reward": {
            "potion30": "{prefix}获得HP 30%药水！",
            "hpBoost": "{prefix}获得 最大生命值提升项目！",
            "atkBoost": "{prefix}获得攻击提升物品！",
            "defBoost": "{prefix}获得防御强化物品！"
          }
        },
        "goldenChest": {
          "modal": {
            "title": "金宝箱",
            "status": "将计时条停在中央！ (空格/回车)",
            "stop": "停止",
            "hint": "您也可以按空格键或 Enter 键。"
          },
          "elixir": "在金色宝箱中发现了特殊的SP药剂！ SP大幅度恢复。",
          "openedSafely": "安全打开金宝箱！",
          "prompt": "金色宝箱！用杠铃计时。",
          "major": {
            "hp": "在金色宝箱中发现最大生命值+{amount}灵丹妙药！",
            "atk": "在金色宝箱中发现一颗攻击力+{amount}战术球！",
            "def": "在金色宝箱中发现一张 DEF +{amount} 守护盾卡！"
          },
          "skillCharm": "在金色宝箱中发现了技能符咒“{effectName}”！ （{turns} 圈）"
        },
        "combat": {
          "noEnemyInDirection": "该方向没有敌人！",
          "sureHitIneffective": "等级差距使必发效果无效...",
          "miss": "小姐",
          "enemyDefeated": "击败敌人！",
          "bossGate": "你不能继续，直到boss被打倒！",
          "enemyMissed": "敌人未击中！",
          "enemyWarped": "被敌人的传送攻击扭曲！",
          "enemyAttackDamage": "敌人对你造成了 {amount} 伤害！",
          "enemyWarpPopup": "变形",
          "statusResistedByLevel": "等级差距阻止了状态 疾病！",
          "teleportResistedByLevel": "关卡差距让你经受住扭曲！",
          "instantDeathResisted": "等级差距使瞬死攻击无效！",
          "instantDeathHit": "敌人的即死攻击落地…！",
          "knockbackResistedByLevel": "等级差距让你抵抗击退！",
          "playerDamage": "你对敌人造成{amount}伤害！",
          "knockbackCollision": "撞到墙上并受到{amount}伤害！"
        },
        "orb": {
          "statusAttackNegated": "宝珠的祝福使状态攻击无效！",
          "statusAttackPrevented": "宝珠的祝福挡住了状态攻击！",
          "statusPrevented": "宝珠的祝福阻止状态异常！",
          "teleportNegated": "宝珠的祝福使扭曲攻击无效！",
          "teleportPrevented": "奥布的祝福阻止了扭曲攻击！",
          "instantDeathNegated": "奥布的祝福使即时死亡攻击无效！",
          "instantDeathPrevented": "奥布的祝福让你承受即死攻击！",
          "knockbackNegated": "宝珠的祝福取消了 击退！",
          "knockbackPrevented": "宝珠的祝福阻止了击退！"
        },
        "items": {
          "noPotion": "你没有任何药水。",
          "noOfferingItem": "没有可用的治疗物品优惠。",
          "throwNoEnemies": "投掷范围内没有敌人。",
          "throwNoHealingItem": "没有可投掷的治疗物品。",
          "throwNoTarget": "找不到可投掷的目标。",
          "throwIneffective": "敌人等级太高；投掷没有效果...",
          "throwNoEffect": "你扔了一个治疗物品，但什么也没发生。",
          "throwDamage": "抛出治疗物品并对物体造成{damage}伤害 敌人！",
          "autoSatietyRecovered": "自动项目触发！ {amount} 恢复了饱腹感。",
          "potionSatietyRecovered": "吃药水！饱腹感由{amount}恢复。",
          "autoReversedDamage": "自动项目失火了！受到{amount}伤害！",
          "potionReversedDamage": "药水逆转并造成 {amount} 伤害！",
          "autoHpRecovered": "自动物品触发！恢复{amount}生命值。",
          "potionHpRecovered": "使用了药水！已恢复{amount}生命值。",
          "autoNoEffect": "自动项目已触发，但什么也没发生。",
          "potionNoEffect": "使用了 药水，但什么也没发生。",
          "cleansedStatus": "使用治疗物品并治愈{status}。",
          "hpBoostUsed": "使用最大生命值提升！生命上限增加5！",
          "attackBoostUsed": "使用了攻击增强！攻击力增加1！",
          "defenseBoostUsed": "使用防御提升！防御力提升1！",
          "hpBoostMajorUsed": "使用了 Grand Max HP Boost！最大生命增加{amount}！",
          "attackBoostMajorUsed": "使用了大攻击增强！攻击力增加{amount}！",
          "defenseBoostMajorUsed": "使用了大防御提升！防御增加{amount}！",
          "notOwned": "您没有该项目。",
          "noSpElixir": "你没有SP Elixir。"
        },
        "data": {
          "imported": "数据 导入。"
        },
        "blockdim": {
          "selectionIncomplete": "块选择是 不完整。"
        },
        "progress": {
          "dungeonCleared": "副本通关！",
          "nextFloor": "进阶到下一层！ ({floor}F)"
        }
      }
    },
    "godConsole": {
      "mode": {
        "current": "当前：{mode}",
        "sandbox": "沙盒模式",
        "normal": "探索模式",
        "toggle": {
          "toSandbox": "进入沙盒模式",
          "toNormal": "返回探索模式"
        }
      },
      "status": {
        "prompt": "输入代码并释放你的创造力。",
        "notAwakened": "造物主的力量还没有觉醒。",
        "enterCode": "请输入代码。",
        "running": "运行代码...",
        "executedWithReturn": "执行代码（返回值：{value}）",
        "executed": "代码执行。",
        "error": "错误：{message}",
        "requiresGodPower": "需要创作者能力。",
        "toggleRestricted": "只能在探索地牢时切换。",
        "sandboxEnabled": "启用沙盒模式。",
        "sandboxDisabled": "返回探索模式。",
        "sampleInserted": "插入示例代码。",
        "cleared": "输入清除。"
      }
    },
    "games": {
      "bowlingDuel": {
        "title": "保龄球决斗MOD",
        "legend": "按下按钮依次停止瞄准→曲线→功率计并滚动球！",
        "history": {
          "title": "日志",
          "placeholder": "---"
        },
        "buttons": {
          "throw": "🎳投掷球",
          "reset": "🔄重置",
          "throwing": "🎳滚动…"
        },
        "scoreboard": {
          "you": "你",
          "cpu": "CPU",
          "total": "总计"
        },
        "sliders": {
          "aim": {
            "label": "瞄准位置",
            "center": "中心",
            "right": "右{value}",
            "left": "左{value}"
          },
          "curve": {
            "label": "曲线量",
            "none": "没有任何",
            "right": "向右挂钩{value}",
            "left": "左钩 {value}"
          },
          "power": {
            "label": "投掷功率",
            "format": "{value}%"
          }
        },
        "status": {
          "introHint": "停止每个在正确的时刻移动仪表 追逐打击！",
          "framePlayer": "框架 {frame}：轮到你了。",
          "frameCpu": "Frame {frame}: CPU转…",
          "remainingPins": "左侧别针：{count}。再试一次！",
          "playerStrike": "出击！",
          "cpuStrike": "CPU罢工！",
          "victory": "胜利！得分{player} - {cpu}",
          "draw": "平局…分数{player} - {cpu}",
          "defeat": "击败…得分 {player} - {cpu}"
        },
        "stage": {
          "aim": {
            "prompt": "瞄准仪表振荡-按下将其锁定！",
            "button": "🛑停止瞄准",
            "confirm": "目标设置为{value}！"
          },
          "curve": {
            "prompt": "曲线仪移动——用按钮停止它！",
            "button": "🛑停止曲线",
            "confirm": "曲线锁定在{value}！"
          },
          "power": {
            "prompt": "观看功率计——按下滚动！",
            "button": "🛑停止力量",
            "confirm": "与 {value} 一起滚动！"
          }
        },
        "logs": {
          "playerShot": "你：瞄准{aim}，曲线{curve}，电源 {power}% → <strong>{pins}</strong>",
          "cpuShot": "CPU：目标{aim}、曲线{curve}、功率{power}% → <strong>{pins}</strong>",
          "victory": "<strong>胜利！</strong> +{exp}EXP",
          "draw": "<strong>抽奖</strong> +{exp}EXP",
          "defeat": "<strong>失败</strong> +{exp}EXP"
        }
      },
      "timer": {
        "header": {
          "title": "计时器",
          "subtitle": "集中倒计时或用秒表跟踪任务。"
        },
        "xpBadge": "会话经验{formattedXp}",
        "modes": {
          "countdown": "倒计时",
          "stopwatch": "秒表"
        },
        "inputs": {
          "hours": "小时",
          "minutes": "分钟数",
          "seconds": "秒数"
        },
        "quickButtons": {
          "addMinutes": "+{minutes}分钟",
          "subtractMinutes": "-{minutes} min",
          "pomodoro": "番茄钟{minutes}分钟"
        },
        "controls": {
          "start": "开始",
          "pause": "暂停",
          "resume": "恢复",
          "reset": "重置"
        },
        "status": {
          "ready": "就绪",
          "countdownReady": "倒计时就绪",
          "stopwatchReady": "秒表就绪",
          "countdownRunning": "倒计时…",
          "resumed": "恢复",
          "paused": "已暂停",
          "stopwatchRunning": "秒表正在运行…",
          "stopwatchMinuteAwarded": "{minutes}分钟已过去！",
          "stopwatchMinute": "{minutes}分钟已过",
          "completed": "完成！伟大的工作"
        },
        "history": {
          "title": "最近的日志",
          "labels": {
            "complete": "完成",
            "start": "开始",
            "stopwatchMinute": "分钟",
            "generic": "里程碑"
          },
          "xpAward": "{label}: +{formattedXp} EXP",
          "timerComplete": "计时器完成！"
        }
      },
      "diagramMaker": {
        "errors": {
          "containerMissing": "MiniExp图表制作需要一个容器",
          "pngSignature": "无法识别PNG签名",
          "pngDataMissing": "在 PNG 中未找到任何 draw.io 数据",
          "inflateUnsupported": "此环境不支持膨胀压缩数据",
          "parseXml": "无法解析 XML",
          "diagramMissing": "未找到图表元素",
          "mxGraphMissing": "未找到 mxGraphModel 元素",
          "diagramDecodeFailed": "解码图表数据失败",
          "mxGraphRootMissing": "mxGraphModel根元素缺失",
          "loadFailed": "加载失败：{error}",
          "saveFailed": "保存失败：{error}",
          "exportFailed": "导出失败： {error}"
        },
        "defaults": {
          "fileName": "无标题图.drawio",
          "layerName": "图层{index}",
          "pageName": "页{index}",
          "textPlaceholder": "文本",
          "nodePlaceholder": "新节点"
        },
        "tools": {
          "select": "选择",
          "rectangle": "矩形",
          "ellipse": "椭圆",
          "text": "文本",
          "connector": "连接器",
          "delete": "删除"
        },
        "actions": {
          "new": "新",
          "open": "打开",
          "save": "保存",
          "export": "导出",
          "exportFormat": "导出为{formatLabel}",
          "undo": "撤消",
          "redo": "重做"
        },
        "sections": {
          "properties": "属性"
        },
        "fields": {
          "x": "X",
          "y": "Y",
          "width": "宽度",
          "height": "身高",
          "fill": "补",
          "stroke": "行程",
          "strokeWidth": "行程宽度",
          "textColor": "文字颜色",
          "fontSize": "字体大小",
          "text": "文本"
        },
        "toggles": {
          "grid": "网格",
          "snap": "折断"
        },
        "labels": {
          "exp": "EXP：{value}"
        },
        "confirm": {
          "newDocument": "您有未保存的更改。创建新图表？"
        }
      },
      "sugorokuLife": {
        "ui": {
          "currencySuffix": "G",
          "expUnit": "EXP",
          "expAmount": "{formatted} {unit}",
          "hud": {
            "turn": "转",
            "money": "手头现金",
            "salary": "估计年收入",
            "exp": "获得经验"
          },
          "controls": {
            "roll": "掷骰子",
            "restart": "再玩一次"
          },
          "welcome": {
            "title": "欢迎来到生活双六",
            "message": "掷骰子，前进你的棋子，并从每个生活事件中获得经验值。"
          },
          "log": {
            "title": "事件日志",
            "noMoneyDelta": "±0G",
            "expText": "EXP {formatted}",
            "meta": "{money} / {exp}"
          },
          "event": {
            "expText": "EXP {formatted}",
            "delta": "{money} / {exp}"
          },
          "summary": {
            "rank": "最终排名{grade}",
            "money": "最终资金：{money}",
            "bonus": "奖励经验：{formatted}",
            "total": "获得的总经验值：{formatted}"
          },
          "restart": {
            "title": "重启！",
            "message": "再次冲过人生。"
          }
        },
        "board": {
          "start": {
            "label": "开始",
            "sub": "职业生涯开始"
          },
          "orientation": {
            "label": "职业规划",
            "sub": "想象你的未来"
          },
          "chance": {
            "label": "机会卡",
            "unknown": "意外事件",
            "mixed": "两种选择都可以",
            "fate": "命运抽签",
            "twist": "令人惊讶的发展",
            "shift": "突然的变化"
          },
          "sidejob": {
            "label": "副业准备",
            "sub": "周末项目"
          },
          "travel": {
            "label": "刷新 行程",
            "sub": "敏锐你的感觉"
          },
          "salary": {
            "label": "发薪日",
            "sub": "功夫不负有心人"
          },
          "family": {
            "label": "家庭活动",
            "sub": "珍惜时间"
          },
          "qualification": {
            "label": "认证",
            "sub": "学习有回报"
          },
          "living": {
            "label": "生活费用",
            "sub": "支付账单"
          },
          "health": {
            "label": "健康检查",
            "sub": "查看你的健康状况"
          },
          "project": {
            "label": "主要项目",
            "sub": "高责任"
          },
          "donation": {
            "label": "社区贡献",
            "sub": "慈善事业"
          },
          "payday": {
            "label": "提升奖励",
            "sub": "获得认可"
          },
          "mentor": {
            "label": "指导",
            "sub": "训练少年"
          },
          "expense": {
            "label": "意外开支",
            "sub": "紧急修复"
          },
          "team": {
            "label": "团队建设",
            "sub": "建立信任"
          },
          "innovation": {
            "label": "新的风险投资",
            "sub": "挑战时间"
          },
          "tax": {
            "label": "缴税",
            "sub": "社会的一部分"
          },
          "festival": {
            "label": "社区节",
            "sub": "扩展你的网络"
          },
          "savings": {
            "label": "资产管理",
            "sub": "稳步成长"
          },
          "final": {
            "label": "目标",
            "sub": "生命巅峰"
          }
        },
        "events": {
          "start": {
            "title": "职业生涯开始！",
            "message": "用你的第一笔薪水建立稳定的生活。"
          },
          "orientation": {
            "title": "绘制你的职业生涯",
            "message": "自我分析研讨会明确你的目标。"
          },
          "sidejob": {
            "title": "副业启动",
            "message": "您的周末项目立即扭亏为盈！"
          },
          "travel": {
            "title": "来自旅行的灵感",
            "message": "新的风景和文化扩大你的视野。"
          },
          "salary": {
            "title": "发薪日！",
            "message": "又一个月的努力。平衡生活成本与储蓄。"
          },
          "family": {
            "title": "家庭记忆",
            "message": "无价的在一起时光充满了你的心。"
          },
          "qualification": {
            "title": "获得认证！",
            "message": "专业证书将提升你未来的薪水。"
          },
          "living": {
            "title": "带薪生活费",
            "message": "养成节俭的习惯可以释放更多资金。"
          },
          "health": {
            "title": "健康检查完成",
            "message": "日常护理让你做好准备并减少未来的风险风险。"
          },
          "project": {
            "title": "重大项目成功",
            "message": "带领团队取得成果打开了大幅加薪的大门！"
          },
          "donation": {
            "title": "捐赠给社区",
            "message": "回馈赢得的信任，这将有助于未来的努力。"
          },
          "payday": {
            "title": "获得提升奖励！",
            "message": "你的成就得到了认可，你的收入再次攀升。"
          },
          "mentor": {
            "title": "成为导师",
            "message": "帮助他人成长也可以增强您自己的技能。"
          },
          "expense": {
            "title": "紧急维修费用",
            "message": "冷静的行动将伤害降到最低。"
          },
          "team": {
            "title": "团队建设静修",
            "message": "更强的纽带使即将进行的项目更顺利。"
          },
          "innovation": {
            "title": "新创业成功",
            "message": "你了解市场并为该部门建立了旗舰业务。"
          },
          "tax": {
            "title": "缴税",
            "message": "回馈社会的价值提示下一次机会的预算审查。"
          },
          "festival": {
            "title": "在当地节日联网",
            "message": "连接扩展并激发了你的下一个想法。"
          },
          "savings": {
            "title": "投资表现良好",
            "message": "多样化使您的资产稳步增长。"
          },
          "goal": {
            "logTitle": "目标！",
            "logDetail": "最终资产 {money} / 等级 {grade} / 奖励 EXP {bonusFormatted}",
            "title": "生命分类关闭",
            "message": "最终资产{money}。达到 {grade} 级！根据您的储蓄奖励经验值。"
          }
        },
        "chance": {
          "startup": {
            "label": "启动投资",
            "description": "你的远见支持了一家绝对起飞的初创企业！"
          },
          "travel": {
            "label": "世界巡演",
            "description": "这次旅行拓宽了你的经验，但花费也很大。"
          },
          "innovation": {
            "label": "创新奖",
            "description": "您赢得了公司黑客马拉松和奖金！"
          },
          "carRepair": {
            "label": "汽车维修",
            "description": "突然的故障迫使你支付修复费用..."
          },
          "mentor": {
            "label": "遇到了一位导师",
            "description": "一位出色的导师指导你，解锁你的职业生涯。"
          },
          "sideBusiness": {
            "label": "副业命中",
            "description": "您的周末演出迅速走红，销量激增！"
          },
          "medicalBill": {
            "label": "医疗费用",
            "description": "住院费用昂贵，但健康是第一位的。"
          },
          "community": {
            "label": "主持社区活动",
            "description": "你当地活动赢得了感激和宝贵的经验。"
          },
          "award": {
            "label": "年度奖",
            "description": "您获得了公司年终奖和奖金！"
          },
          "market": {
            "label": "市场崩溃",
            "description": "你的投资暴跌——保持冷静，安然度过。"
          }
        }
      },
      "triominoColumns": {
        "menu": {
          "title": "三联柱",
          "subtitle": "选择一个模式",
          "options": {
            "endless": {
              "label": "无尽 - 玩到游戏结束",
              "description": "核心单人游戏模式"
            },
            "vsCpu": {
              "label": "VS.RIVAL - CPU战斗",
              "description": "与GEARS角色对战"
            },
            "vs2p": {
              "label": "VS.2P-两人对战",
              "description": "本地战斗（WASD + JK控制）"
            }
          }
        },
        "cpuSelect": {
          "title": "VS.RIVAL - 选择对手",
          "subtitle": "选择你要挑战的对手",
          "detail": "速度Lv.{speedLevel}/攻击力{aggression}%",
          "hint": "※ Hugleman Lady 通过以下方式解锁 连续胜利。 ??? 15分钟内不继续通关即可解锁。",
          "back": "←返回模式选择",
          "lockReasons": {
            "lady": "要求：一举突破Hugleman小队",
            "hidden": "要求：15分钟内通关，不继续",
            "default": "要求：击败前任对手"
          },
          "rivals": {
            "0": {
              "name": "卡拉库林"
            },
            "1": {
              "name": "Hugleman Jr."
            },
            "2": {
              "name": "机关忍者"
            },
            "3": {
              "name": "休格曼 Mk-II"
            },
            "4": {
              "name": "Hugleman Mk-III"
            },
            "5": {
              "name": "阴影 哈格尔"
            },
            "6": {
              "name": "Hugleman Lady"
            },
            "7": {
              "name": "???"
            }
          }
        },
        "marks": {
          "sun": "太阳",
          "leaf": "叶子",
          "aqua": "水滴",
          "berry": "浆果",
          "rose": "玫瑰",
          "amber": "琥珀色"
        },
        "blocks": {
          "multi": "多"
        },
        "messages": {
          "garbageAttack": "将垃圾发送到{target}！",
          "lineSpark": "Line Spark！",
          "vs2pStart": "VS 2P开始！",
          "vsCpuStart": "VS RIVAL：{name}",
          "combo": "{target}: {combo}-链！"
        },
        "floating": {
          "clear": "{count}清除",
          "combo": "{combo}链！",
          "spark": "火花！"
        },
        "boards": {
          "player": "玩家",
          "p1": "P1",
          "p2": "P2"
        },
        "results": {
          "gameOver": "游戏结束",
          "victoryTitle": "{name} 胜利！",
          "drawTitle": "抽牌",
          "endlessStats": "线路 {lines} / 连击 {combos} / 火花 {spark}",
          "buttons": {
            "retryEndless": "再玩无尽",
            "backToMenu": "返回模式选择"
          },
          "vsCpu": {
            "victoryMessage": "胜利！时间 {duration}s / 总计 {total}s",
            "defeatMessage": "击败…时间{duration}s",
            "nextRival": "下一个对手({name})",
            "retrySame": "重赛相同对手",
            "backToSelect": "返回对手选择"
          },
          "vs2p": {
            "retry": "重新比赛",
            "hint": "你可以使用相同的键盘设置再次战斗。"
          }
        },
        "panel": {
          "next": "下一个",
          "hold": "HOLD",
          "stats": "统计",
          "lines": "台词：{value}",
          "combo": "组合：{value}",
          "spark": "火花：{value}",
          "attack": "攻击：{value}"
        },
        "miniStats": {
          "lines": "线条{value}",
          "comboSpark": "组合{combo}/火花{spark}"
        },
        "modeLabels": {
          "endless": "ENDLESS模式",
          "vsCpu": "VS.RIVAL模式",
          "vs2p": "VS.2P模式"
        }
      },
      "treasureHunt": {
        "ui": {
          "mapTitle": "地图",
          "start": "开始",
          "pause": "暂停",
          "hint": "移动WASD 或 方向键。更长的宝藏距离会提高基础经验值，更快的拾取速度会成倍增加奖励。",
          "hintNoMap": "使用 WASD 或箭头键移动。更大的宝藏距离会提高基础经验值。在“正常”及以上模式下，小地图是隐藏的，因此需要依靠状态提示来导航。"
        },
        "labels": {
          "round": "轮：{value}",
          "time": "时间：{value}",
          "distance": "距离：{value}",
          "totalExp": "总经验：{value}",
          "timeValue": "{value}s",
          "distanceValue": "{value}图块",
          "none": "-",
          "lastResult": "最后一轮{time}为{exp} EXP{best}",
          "bestSuffix": "/最佳{time}"
        },
        "status": {
          "preparing": "准备阶段...",
          "generating": "生成阶段...",
          "generateFailed": "生成舞台失败",
          "noApi": "地下城 API 不可用",
          "placingFailed": "宝藏放置失败—正在重新生成",
          "ready": "开始第{round}回合",
          "running": "探索回合{round}…",
          "paused": "已暂停",
          "found": "发现宝藏！构建下一轮…"
        }
      },
      "todoList": {
        "defaults": {
          "untitled": "无标题"
        },
        "header": {
          "title": "待办事项列表",
          "today": "今天·{date}",
          "stats": "待处理：{pending} / 已完成：{completed} / 成就：{achievements}"
        },
        "form": {
          "titleCreate": "添加新待办事项",
          "titleEdit": "编辑待办事项",
          "name": "名称",
          "namePlaceholder": "例如，发送每日报告",
          "type": "类型",
          "typeSingle": "单张",
          "typeRepeatable": "可重复",
          "xp": "经验变化（负数为扣除）",
          "randomRange": {
            "toggle": "使用随机范围",
            "min": "最小值",
            "max": "最大值"
          },
          "rewards": {
            "title": "额外奖励",
            "passiveOrb": {
              "label": "被动宝珠",
              "placeholder": "例如，攻击Boost",
              "selectPlaceholder": "选择一个被动球体",
              "customOption": "{value}（已保存）",
              "amount": "数量（负数为扣除）",
              "addEntry": "添加"
            },
            "item": {
              "label": "项目",
              "placeholder": "药水30",
              "selectPlaceholder": "选择项目",
              "customOption": "{value}（已保存）",
              "amount": "数量（负数为扣除）",
              "addEntry": "添加",
              "lootTable": {
                "label": "掉落表",
                "addEntry": "添加",
                "dropChance": "掉落率(%)",
                "weight": "权重"
              },
              "defaults": {
                "potion30": "药水(30%)",
                "hpBoost": "生命值提升",
                "atkBoost": "攻击力提升",
                "defBoost": "DEF提升",
                "hpBoostMajor": "大马力提升",
                "atkBoostMajor": "高攻击力提升",
                "defBoostMajor": "大DEF提升",
                "spElixir": "SP灵药"
              }
            },
            "sp": {
              "label": "SP",
              "amount": "变化量（负数为扣除）"
            }
          },
          "color": "颜色",
          "memo": "注释",
          "memoPlaceholder": "添加注释或检查点",
          "submitCreate": "添加",
          "submitUpdate": "更新",
          "cancel": "取消"
        },
        "sections": {
          "pending": "待处理任务",
          "completed": "已完成任务",
          "emptyPending": "没有待办事项。",
          "emptyCompleted": "没有完成的待办事项 还没有。"
        },
        "task": {
          "xpChip": "{xp} 经验值",
          "rewards": {
            "passiveOrb": "宝珠：{orb} ×{amount}",
            "item": "{item} ×{amount}",
            "sp": "SP {amount}",
            "loot": "抽取{chance}%"
          },
          "memoEmpty": "无注释",
          "createdAt": "创建：{date}",
          "completedAt": "已完成：{date}",
          "repeatableCount": "已达成：{count}次",
          "statusCompleted": "成功",
          "statusFailed": "失败",
          "actions": {
            "achieve": "实现",
            "complete": "完成",
            "fail": "失败",
            "edit": "编辑",
            "delete": "删除"
          }
        },
        "dialogs": {
          "confirmDelete": "删除此待办事项？",
          "requireName": "输入名称。"
        }
      },
      "notepad": {
        "defaultFileName": "Untitled.txt",
        "confirm": {
          "discardChanges": "放弃更改并关闭？",
          "newWithoutSaving": "开始一个新文件而不保存更改？"
        },
        "menu": {
          "file": "文件",
          "edit": "编辑",
          "view": {
            "label": "视图",
            "enableWordWrap": "启用自动换行",
            "disableWordWrap": "禁用自动换行",
            "showStatusBar": "显示状态栏",
            "hideStatusBar": "隐藏状态栏"
          },
          "fileNew": "新",
          "fileOpen": "打开...",
          "fileSave": "保存",
          "fileSaveAs": "另存为...",
          "filePrint": "打印...",
          "editUndo": "撤消",
          "editRedo": "重做",
          "editCut": "切割",
          "editCopy": "复制",
          "editPaste": "粘贴",
          "editDelete": "删除",
          "editFind": "寻找...",
          "editReplace": "替换...",
          "editSelectAll": "全选",
          "viewZoomIn": "放大",
          "viewZoomOut": "缩小",
          "viewZoomReset": "重置缩放"
        },
        "commands": {
          "heading": "切换标题级别",
          "bullet": "切换项目符号列表",
          "bold": "粗体(Markdown)",
          "italic": "斜体（Markdown）",
          "underline": "下划线标签",
          "wordWrap": "切换自动换行",
          "zoomReset": "重置缩放",
          "settings": "设置"
        },
        "settings": {
          "title": "设置",
          "wordWrap": "自动换行",
          "statusBar": "状态栏",
          "zoom": "缩放",
          "zoomReset": "重置",
          "insertTimestamp": "插入时间戳"
        },
        "prompts": {
          "search": "输入文字查找",
          "saveFileName": "输入文件名保存",
          "replaceTarget": "输入要替换的文字",
          "replaceWith": "输入替换文本"
        },
        "alerts": {
          "searchNotFound": "未找到匹配项。",
          "replaceNotFound": "没有找到可替换的内容。",
          "fileReadFailed": "读取文件失败。",
          "printPopupBlocked": "无法打开打印窗口。请允许弹出窗口。"
        },
        "print": {
          "label": "打印",
          "windowTitleFallback": "记事本"
        },
        "status": {
          "position": "Ln {line}, Col {column}",
          "length": "{count}人物",
          "typeText": "文本",
          "lineEnding": {
            "lf": "Unix (LF)",
            "crlf": "Windows (CRLF)"
          }
        },
        "timestamp": {
          "pattern": "{month}/{day}/{year} {hour}:{minute}:{second}"
        }
      },
      "mathLab": {},
      "stopwatch": {
        "header": {
          "title": "秒表专业版"
        },
        "statusBadge": {
          "running": "运行",
          "stopped": "已停止"
        },
        "info": {
          "lapCount": "圈数： {count}",
          "lastLap": "上一圈：{time}",
          "lastLapNone": "最后一圈：-",
          "sessionXp": "会话经验：{xp}"
        },
        "buttons": {
          "start": "开始",
          "pause": "暂停",
          "resume": "恢复",
          "lap": "圈",
          "reset": "重置"
        },
        "laps": {
          "title": "单圈历史记录",
          "subtitle": "最近的第一个",
          "empty": "记录后你的圈数将出现在此处。",
          "label": "圈{index}"
        }
      },
      "sanpo": {
        "name": "散步",
        "description": "在随机生成的迷宫中散步，每一步获得 1 点经验。",
        "ui": {
          "regenerate": "重新生成关卡",
          "zoomLabel": "缩放",
          "minimapTitle": "小地图",
          "stageInfo": "类型：{type} / 尺寸：{size} / 单元：{tileSize}",
          "seedInfo": "种子：{seed}",
          "stepsInfo": "步数：{steps}",
          "stageInfoEmpty": "类型：-",
          "seedInfoEmpty": "种子：-",
          "stepsInfoEmpty": "步数：0",
          "zoomInfo": "缩放：{value}x",
          "zoomDisplay": "{value}x",
          "hideMap": "小地图关闭",
          "showMap": "小地图开启",
          "status": {
            "paused": "已暂停",
            "walk": "散步中… 使用 WASD/方向键移动。按 M 切换小地图，[ / ] 缩放。",
            "noApi": "迷宫 API 不可用",
            "generating": "正在生成关卡…",
            "failed": "关卡生成失败",
            "ready": "准备就绪！按开始按钮开始散步。",
            "initializing": "加载中…"
          }
        }
      },
      "wording": {
        "name": "措辞",
        "description": "文字处理器奖励EXP：编辑+1/格式+2/保存 +6",
        "defaultTitle": "文件1",
        "autoTitle": "文档{formattedNumber}",
        "quickBar": {
          "open": "打开（Ctrl+O）",
          "save": "保存(Ctrl+S)",
          "saveAs": "另存为（Ctrl+Shift+S）",
          "undo": "撤消(Ctrl+Z)",
          "redo": "重做(Ctrl+Y)",
          "print": "打印"
        },
        "tabs": {
          "home": "首页",
          "insert": "插入",
          "layout": "布局",
          "review": "回顾",
          "view": "视图"
        },
        "groups": {
          "clipboard": "剪贴板",
          "font": "字体",
          "paragraph": "段落",
          "style": "风格",
          "insert": "插入",
          "media": "媒体",
          "theme": "主题",
          "columns": "专栏",
          "margins": "Margins",
          "proofing": "校对工具",
          "comments": "评论",
          "lineHeight": "行距",
          "guides": "指南",
          "paper": "页面颜色"
        },
        "buttons": {
          "rename": "重命名",
          "paste": "粘贴",
          "copy": "复制",
          "cut": "切割",
          "bold": "粗体",
          "italic": "斜体",
          "underline": "下划线",
          "strikethrough": "删除线",
          "superscript": "上标",
          "subscript": "下标",
          "bullets": "项目符号列表",
          "numberedList": "编号列表",
          "alignLeft": "左对齐",
          "alignCenter": "对齐中心",
          "alignRight": "右对齐",
          "alignJustify": "Justify",
          "outdent": "减少缩进",
          "indent": "增加缩进",
          "blockParagraph": "正文",
          "blockHeading": "标题{level}",
          "blockQuote": "报价",
          "insertDate": "日期",
          "insertTime": "时间",
          "insertHorizontalRule": "水平尺",
          "insertEmoji": "表情符号",
          "insertImage": "图片",
          "insertTextbox": "文本框",
          "insertToc": "目录",
          "commentInsert": "插入评论",
          "changeSummary": "变更摘要",
          "wordCount": "文字计数",
          "readingTime": "阅读时间",
          "reviewHighlightOn": "高亮长文本",
          "reviewHighlightOff": "清晰的亮点",
          "columnsOption": "{formattedCount} 山口",
          "lineHeightOption": "{formattedValue}x",
          "marginNarrow": "窄",
          "marginNormal": "普通",
          "marginWide": "宽",
          "themeLight": "轻",
          "themeDark": "黑纸",
          "showRuler": "显示标尺",
          "hideRuler": "隐藏标尺",
          "showStatus": "显示状态栏",
          "hideStatus": "隐藏状态栏",
          "paperWhite": "白色",
          "paperCream": "奶油色",
          "paperGray": "灰色",
          "zoomOut": "缩小",
          "zoomIn": "放大"
        },
        "messages": {
          "printUnavailable": "打印对话框支持即将推出。",
          "noContent": "没有可分析的内容。",
          "wordCount": "字符：{characters}/字数：{words}/段落：{paragraphs}",
          "readingTime": "大约。 {minutes} 分 {secondsPadded} 秒读取",
          "changeSummarySaved": "保存：未检测到差异",
          "changeSummaryDiff": "未保存的变化估计：大约{difference}个字符"
        },
        "prompts": {
          "rename": "输入文档名称",
          "saveFile": "输入文件名保存(.wording.html)",
          "comment": "输入注释"
        },
        "confirm": {
          "closeWithoutSave": "不保存就关闭？",
          "newWithoutSave": "还有未保存变化。开始一个新文档？"
        },
        "fonts": {
          "yuGothic": "Yu Gothic",
          "yuMincho": "于明朝",
          "meiryo": "Meiryo",
          "hiraginoKaku": "Hiragino Sans",
          "monospace": "等宽空间（Consolas）"
        },
        "fontSize": {
          "option": "{formattedSize} pt"
        },
        "insert": {
          "tocTemplate": "<ol><li>简介</li><li>主要 内容</li><li>摘要</li></ol>",
          "textboxLabel": "文本框"
        },
        "editor": {
          "welcomeHtml": "<p>欢迎使用Wording！在这里开始起草你的文档。</p>",
          "newDocumentHtml": "<p>让我们开始一个新文档。</p>"
        },
        "status": {
          "summary": "页码{pageCurrent} / {pageTotal} |字符：{characters} |文字：{words}"
        },
        "search": {
          "title": "查找和替换",
          "placeholder": "搜索词",
          "replacePlaceholder": "替换文本",
          "enterQuery": "输入搜索词",
          "noMatch": "未找到匹配项",
          "next": "查找下一个",
          "replace": "替换",
          "replaceAll": "替换 全部",
          "close": "关闭",
          "replacedCount": "替换{count}匹配",
          "progress": "匹配{total}的{current}"
        }
      }
    },
    "statusModal": {
      "title": "玩家状态",
      "sections": {
        "basic": "基本统计",
        "inventory": "物品栏",
        "settings": "游戏设置",
        "dungeon": "地下城信息"
      },
      "labels": {
        "level": "等级",
        "exp": "经验",
        "hp": "HP",
        "satiety": "饱腹感",
        "sp": "SP",
        "attack": "攻击",
        "defense": "防御",
        "statusEffects": "状态 效果",
        "skillEffects": "技能效果",
        "floor": "当前楼层"
      },
      "settings": {
        "world": "选择世界",
        "difficulty": "难度"
      },
      "dungeon": {
        "structure": "布局",
        "type": "类型"
      },
      "effects": {
        "none": "无状态异常。",
        "remaining": "剩余 {label} {turns} 圈",
        "entry": "剩余 {label} {turns} 圈"
      },
      "skillCharms": {
        "entry": "{label} x{count}"
      },
      "world": {
        "normal": "{world}世界",
        "blockdim": "BlockDim 嵌套 {nested} / {dimension}"
      },
      "dungeonSummary": {
        "normal": "{world}世界：{dungeon}",
        "blockdim": "嵌套{nested} /尺寸{dimension}: {block1} · {block2} · {block3}"
      },
      "details": {
        "floor": "楼层：{floor}",
        "hpBaseSuffix": "（基地{base}）",
        "level": "Lv.{value}",
        "hp": "HP {current}/{max}{baseSuffix}",
        "attack": "攻击力{value}",
        "defense": "DEF {value}",
        "satiety": "周六{current}/{max}",
        "line": "{level} {hp} {attack} {defense} {satiety}"
      },
      "stats": {
        "valueWithBase": "{effective} (基础 {base})",
        "levelWithBase": "Lv.{effective} (基础{base})",
        "hp": "{current}/{max}{baseSuffix}"
      }
    },
    "miniPaint": {
      "appName": "绘制",
      "windowTitle": "{marker}{fileName} - {appName}",
      "defaultFileName": "无标题.png",
      "importedFileName": "导入图片.png",
      "menu": {
        "new": "新",
        "import": "导入",
        "save": "保存",
        "saveAs": "另存为",
        "export": "导出",
        "clear": "清除",
        "undo": "撤消",
        "redo": "重做",
        "gridOn": "网格：ON",
        "gridOff": "网格：OFF"
      },
      "tools": {
        "brush": "刷",
        "pencil": "铅笔",
        "marker": "标记",
        "eraser": "橡皮擦",
        "line": "线",
        "rectangle": "矩形",
        "ellipse": "椭圆",
        "fill": "补",
        "picker": "吸管",
        "fillMode": "填充形状"
      },
      "labels": {
        "size": "大小",
        "zoom": "缩放",
        "primary": "前台",
        "secondary": "背景",
        "sizeValue": "{value}px",
        "zoomValue": "{value}%",
        "primaryColorTitle": "前景色",
        "secondaryColorTitle": "背景颜色"
      },
      "status": {
        "position": "坐标：{x}，{y}",
        "positionIdle": "坐标：-",
        "brushSize": "大小：{value}px",
        "zoom": "缩放：{value}%",
        "exp": "获得经验：{value}"
      },
      "prompts": {
        "closeConfirm": "放弃更改并关闭绘画？",
        "clearConfirm": "清除当前画布？",
        "newConfirm": "创建新画布而不保存？",
        "saveFileName": "输入文件名保存"
      },
      "messages": {
        "saveFailed": "保存图像失败。",
        "imageLoadFailed": "加载图像失败。",
        "fileLoadFailed": "读取文件失败。"
      }
    },
    "mathLab": {}
  };

  store['zh'] = locale;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);

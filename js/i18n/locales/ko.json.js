(function (root) {
  if (!root) return;
  var store = root.__i18nLocales = root.__i18nLocales || {};
  var locale = {
    "meta": {
      "title": "유 로그라이크"
    },
    "header": {
      "title": "유 로그라이크",
      "manual": "매뉴얼 읽기",
      "minigameManual": "미니게임 매뉴얼 읽기"
    },
    "ui": {
      "language": {
        "label": "언어",
        "ariaLabel": "언어 선택기",
        "option": {
          "ja": "일본어",
          "en": "영어",
          "fr": "프랑스어",
          "zh": "중국어(간체)",
          "ko": "한국어"
        }
      },
      "runResult": {
        "title": "결과",
        "reason": {
          "gameOver": "게임 오버",
          "clear": "던전 클리어",
          "retreat": "던전 퇴각",
          "return": "모험 결과"
        },
        "stats": {
          "level": "레벨",
          "totalExp": "총 획득 경험치",
          "totalDamage": "받은 총 피해",
          "healingItems": "사용된 힐링 아이템"
        },
        "actions": {
          "return": "거점으로 돌아가기",
          "retry": "다시 도전"
        },
        "onigokko": {
          "timer": {
            "remaining": "남은 시간: {seconds}s"
          },
          "status": {
            "start": "추격 시작! 화살표 키/WASD로 이동합니다.",
            "paused": "일시중지됨",
            "loading": "로딩 단계…",
            "ready": "준비가 된! 추적을 시작하려면 시작을 누르세요.",
            "stage_generation_failed": "단계 생성 실패",
            "api_unavailable": "던전 API를 사용할 수 없습니다",
            "caught": "잡았다!",
            "caught_no_reward": "잡았다! 경험치 획득이 없습니다.",
            "escaped": "탈출했어요! 정말 잘했어요!",
            "escape_success": "탈출 성공!"
          }
        }
      }
    },
    "messages": {
      "domainCrystal": {
        "spawn": "신비한 영역 크리스탈이 이 층에 나타났다…!"
      },
      "domainEffect": {
        "enter": "영역 효과 \"{label}\"의 영향에 들어섰다!",
        "exit": "영역 효과의 영향에서 해방되었다."
      },
      "domain": {
        "poisonNegated": "영역 효과로 독 데미지를 무효화했다!",
        "poisonReversed": "독의 고통이 반전되어 HP가 {amount} 회복되었다!",
        "poisonDamage": "독으로 {amount}의 피해!",
        "rareChestGuarded": "황금 보물이 폭발했지만 영역 효과가 보호해줬다!",
        "rareChestReversed": "황금 보물의 폭발이 반전되어 HP가 {amount} 회복되었다!",
        "rareChestDamage": "황금 보물이 폭발! HP가 {damage} 감소 (타이밍 차이 {timing}%)",
        "rareChestDeath": "황금 보물 폭발에 휩쓸렸다… 게임 오버",
        "damageBlocked": "영역 효과에 막혀 피해를 줄 수 없었다…",
        "enemyHealed": "영역 효과로 적이 {amount} 회복했다!",
        "poisonFloorNegated": "영역 효과로 독바닥의 피해를 무효화했다!",
        "poisonFloorReversed": "독바닥의 에너지가 반전되어 HP가 {amount} 회복되었다!",
        "poisonFloorDamage": "독바닥으로 피해! HP가 {amount} 감소",
        "poisonFloorDeath": "독바닥에서 쓰러졌다… 게임 오버",
        "bombGuarded": "영역 효과가 폭풍을 막아냈다!",
        "bombReversed": "폭풍의 힘이 반전되어 HP가 {amount} 회복되었다!",
        "bombDamage": "폭탄이 폭발! HP가 {amount} 감소",
        "bombDeath": "폭탄에 휩쓸려 쓰러졌다… 게임 오버",
        "bombSafe": "폭탄이 터졌지만 피해는 없었다!",
        "enemyAttackGuarded": "영역 효과가 지켜줘 피해를 입지 않았다!",
        "enemyAttackReversed": "영역 효과로 적의 공격이 회복으로 변했다! HP가 {amount} 회복"
      },
      "skills": {
        "cannotUse": "스킬을 사용할 수 없음: {reason}",
        "notEnoughSp": "SP가 부족하다.",
        "genericKill": "적을 쓰러뜨렸다!",
        "effects": {
          "applied": "{label} 효과 발동! ({turns}턴)",
          "gimmickNullifyExpired": "기믹 무효화 효과가 끝났다.",
          "statusGuardExpired": "상태 이상 무효 효과가 끝났다.",
          "enemyNullifyExpired": "특수 효과 무효 효과가 끝났다.",
          "sureHitExpired": "필중 공격 효과가 끝났다."
        },
        "breakWall": {
          "noWall": "앞에 부술 수 있는 벽이 없다.",
          "notBreakable": "그 벽은 파괴할 수 없었다.",
          "success": "SP 스킬: 벽을 부쉈다!"
        },
        "buildWall": {
          "noFloor": "앞에 벽으로 바꿀 바닥이 없다.",
          "cannotBuild": "거기에 벽을 만들 수 없다.",
          "success": "SP 스킬: 벽을 생성했다!"
        },
        "gimmickNullify": {
          "tooHard": "이 던전에서는 기믹 무효화가 통하지 않는다…"
        },
        "stairWarp": {
          "noDestination": "계단 주변에 안전한 워프 지점이 없다.",
          "success": "계단 앞에 순간이동했다!"
        },
        "strongStrike": {
          "noTarget": "강공격을 쓸 적이 없다.",
          "sureHitFailed": "적 레벨이 너무 높아 필중이 통하지 않았다…",
          "miss": "강공격이 빗나갔다.",
          "damage": "강공격으로 {damage}의 피해!",
          "kill": "강공격으로 적을 쓰러뜨렸다!"
        },
        "rangedAttack": {
          "noTarget": "전방에 원거리 공격이 닿을 적이 없다.",
          "miss": "원거리 공격이 빗나갔다….",
          "damage": "원거리 공격으로 {damage}의 피해!",
          "kill": "원거리 공격으로 적을 쓰러뜨렸다!"
        },
        "areaSkill": {
          "noTargets": "범위 내에 적이 없다.",
          "activated": "{skillName}을 발동했다!",
          "sureHitFailed": "고레벨 적에게는 효과가 약했다…",
          "kill": "{skillName}으로 적을 쓰러뜨렸다!",
          "noneHit": "아무에게도 맞지 않았다…"
        },
        "floorSkill": {
          "noTargets": "공격 대상이 될 적이 없다.",
          "activated": "{skillName}을 사용했다!",
          "sureHitFailed": "고레벨 적에게는 효과가 없었다…",
          "kill": "{skillName}으로 적을 쓰러뜨렸다!",
          "noneHit": "아무에게도 피해를 줄 수 없었다."
        },
        "ruinAnnihilation": {
          "start": "파멸의 힘을 해방했다!",
          "kill": "파멸의 불길로 적을 소멸시켰다!",
          "resisted": "일부 고레벨 적에게는 파멸의 힘이 닿지 않았다…",
          "cleared": "던전의 벽과 기믹이 사라졌다!"
        }
      }
    },
    "skills": {
      "meta": {
        "currentSp": "현재 SP: {value}",
        "currentSpLabel": "현재 SP",
        "costAndCurrent": "SP 소비: {cost} / 현재: {current}",
        "reasonSuffix": " ({reason})",
        "remainingTurns": "지속 중: {turns}턴 남음",
        "use": "사용"
      },
      "modal": {
        "title": "스킬"
      },
      "availability": {
        "unlockLevel": "Lv100에서 해금",
        "maxSpShortage": "SP 최대치가 부족합니다",
        "notEnoughSp": "SP가 부족합니다",
        "tooHard": "이 난이도에서는 효과가 없습니다",
        "noWallAhead": "앞에 벽이 없습니다",
        "noFloorAhead": "앞에 바닥이 없습니다",
        "noRangedTarget": "닿는 대상이 없습니다",
        "noFrontEnemy": "정면에 적이 없습니다",
        "noAreaTargets": "범위 내에 적이 없습니다",
        "noEnemies": "적이 없습니다",
        "noWarpDestination": "워프 목적지가 없습니다",
        "notYourTurn": "당신의 턴이 아닙니다",
        "paralyzed": "마비 상태입니다"
      },
      "effects": {
        "gimmickNullify": { "label": "기믹 무효화" },
        "statusGuard": { "label": "상태 장벽" },
        "enemyNullify": { "label": "특수 효과 봉인" },
        "sureHit": { "label": "필중" }
      },
      "breakWall": {
        "name": "벽 파괴",
        "description": "정면의 벽을 파괴합니다."
      },
      "buildWall": {
        "name": "벽 생성",
        "description": "앞의 바닥을 벽으로 전환합니다."
      },
      "rangedAttack": {
        "name": "원거리 공격",
        "description": "정면의 일직선에 있는 적을 필중 공격으로 공격해 통상 피해의 1/3을 줍니다. 벽에 막힙니다."
      },
      "gimmickNullify": {
        "name": "기믹 차단기",
        "description": "던전 기믹을 10턴 동안 무효화합니다. 권장 레벨이 자신보다 8 이상 높으면 효과가 없습니다."
      },
      "statusGuard": {
        "name": "상태 장벽",
        "description": "10턴 동안 모든 상태 이상을 막습니다."
      },
      "enemyNullify": {
        "name": "효과 봉인",
        "description": "10턴 동안 적의 특수 효과를 무효화합니다."
      },
      "sureHit": {
        "name": "필중",
        "description": "10턴 동안 통상 공격이 반드시 적중합니다. 자신보다 레벨이 8 이상 높은 적에게는 통하지 않습니다."
      },
      "stairWarp": {
        "name": "계단 워프",
        "description": "계단 주변 칸으로 순간이동합니다."
      },
      "strongStrike": {
        "name": "강타",
        "description": "정면의 적에게 3배 피해의 필중 공격을 가합니다."
      },
      "areaAttack": {
        "name": "범위 공격",
        "description": "주변 적에게 통상 범위 피해를 줍니다."
      },
      "surehitArea": {
        "name": "필중 범위 공격",
        "description": "주변 적에게 필중 범위 피해를 줍니다."
      },
      "strongArea": {
        "name": "강력 범위 공격",
        "description": "주변 적에게 3배 범위 피해를 줍니다."
      },
      "surehitStrongArea": {
        "name": "필중 강력 범위",
        "description": "주변 적에게 필중 3배 범위 피해를 줍니다."
      },
      "surehitFloor": {
        "name": "필중 전층 공격",
        "description": "이 층의 모든 적에게 필중 공격을 가합니다."
      },
      "ruinAnnihilation": {
        "name": "파멸 섬멸",
        "description": "모든 적에게 3배의 필중 피해를 주고 벽과 기믹을 소멸시키며 보물상자를 획득합니다. 고레벨 적에게는 효과가 없습니다."
      }
    },
    "dungeon": {
      "types": {
        "field": "필드형",
        "cave": "동굴형",
        "maze": "미궁형",
        "rooms": "방과 복도",
        "single-room": "단일 방",
        "circle": "원형",
        "narrow-maze": "협소 미궁",
        "wide-maze": "광활 미궁",
        "snake": "뱀형",
        "mixed": "혼합형",
        "circle-rooms": "원형 방과 복도",
        "grid": "격자형",
        "open-space": "개방 공간"
      }
    },
    "dungeons": {
      "base": {
        "1": {
          "name": "초보자의 숲",
          "description": "넓은 초원 곳곳에 장애물이 있는 던전."
        },
        "11": {
          "name": "암흑 동굴",
          "description": "어두운 동굴이 얽힌 미로."
        },
        "21": {
          "name": "폐허 미궁",
          "description": "정교한 미로가 펼쳐진 고대 유적."
        },
        "31": {
          "name": "지하 신전",
          "description": "방과 복도로 구성된 신전."
        },
        "41": {
          "name": "마법 정원",
          "description": "마력이 가득한 원형 정원."
        },
        "51": {
          "name": "수정 동굴",
          "description": "수정이 늘어선 구불구불한 동굴."
        },
        "61": {
          "name": "고대 미궁",
          "description": "시공을 초월한 거대한 미궁."
        },
        "71": {
          "name": "용의 둥지",
          "description": "용의 소굴에 이어진 원형 방들."
        },
        "81": {
          "name": "별빛 평원",
          "description": "별빛이 비추는 거대한 단일 홀."
        },
        "91": {
          "name": "황혼의 탑",
          "description": "다양한 구조가 뒤섞인 세계의 끝 탑."
        },
        "X": {
          "name": "극한의 영역",
          "description": "25층으로 이루어진 궁극의 던전."
        }
      }
    },
    "game": {
      "toolbar": {
        "back": "돌아가기",
        "items": "아이템",
        "skills": "스킬",
        "status": "상태",
        "import": "가져오기",
        "export": "내보내기",
        "toggleDungeonName": "던전 이름 표시",
        "sandboxMenu": "인터랙티브",
        "godConsole": "창조자 콘솔",
        "floor": {
          "heading": "현재 층",
          "label": "FLOOR"
        }
      },
      "dungeonOverlay": {
        "label": "던전 특성",
        "titleFallback": "던전",
        "typePlaceholder": "필드 유형",
        "descriptionPlaceholder": "던전 특성이 여기에 표시됩니다.",
        "badge": {
          "none": "특이 사항 없음",
          "dark": {
            "active": "어둠",
            "suppressed": "어둠 (억제됨)"
          },
          "poison": {
            "active": "독 안개",
            "suppressed": "독 안개 (억제됨)"
          },
          "noise": {
            "active": "소음",
            "suppressed": "소음 (억제됨)"
          },
          "nested": "NESTED x{value}"
        }
      },
      "blockDim": {
        "preview": {
          "selection": "NESTED {nested} / 차원 {dimension}: {block1} · {block2} · {block3}"
        }
      },
      "playerStats": {
        "labels": {
          "level": "레벨",
          "attackShort": "공격",
          "defenseShort": "방어",
          "hp": "HP",
          "satiety": "포만감",
          "exp": "EXP",
          "sp": "SP"
        }
      },
      "statuses": {
        "poison": "독",
        "paralysis": "마비",
        "abilityUp": "능력 상승",
        "abilityDown": "능력 저하",
        "levelDown": "레벨 감소"
      },
      "autoItem": {
        "status": "오토 아이템 ON: 회복 아이템 x {count}"
      },
      "common": {
        "count": "x {count}",
        "none": "없음",
        "floor": "{floor}F"
      },
      "miniExp": {
        "dinoRunner": {
          "comboLabel": "콤보 {combo}",
          "startPromptPrimary": "Space / 클릭으로 시작",
          "startPromptSecondary": "점프: ↑ 또는 Space, 숙이기: ↓",
          "gameOver": "GAME OVER",
          "restartHint": "Space / R 키로 재시작",
          "distanceLabel": "거리 {distance}"
        },
        "ultimateTtt": {
          "status": {
            "player": "당신의 차례",
            "ai": "AI의 차례",
            "ended": "게임 오버"
          },
          "activeBoard": "목표 보드: ({x}, {y})",
          "overlay": {
            "restartHint": "R 키로 재시작"
          },
          "result": {
            "playerWin": "당신의 승리!",
            "aiWin": "AI의 승리…",
            "draw": "무승부"
          }
        }
      },
      "backgammon": {
        "actor": {
          "player": "플레이어",
          "ai": "AI"
        },
        "difficulty": {
          "easy": "쉬움",
          "normal": "보통",
          "hard": "어려움"
        },
        "point": "{point} 포인트",
        "bar": "바",
        "dice": {
          "none": "-"
        },
        "board": {
          "playerOff": "{actor} 반출 ({countFormatted})",
          "aiOff": "{actor} 반출 ({countFormatted})",
          "barText": "{label}"
        },
        "action": {
          "roll": "주사위 굴리기",
          "rematch": "재대전"
        },
        "badge": {
          "difficulty": "난이도: {difficulty}",
          "hits": "히트: {hitsFormatted}",
          "score": "점수: {scoreFormatted}"
        },
        "ui": {
          "turn": "턴: {actor}{status}",
          "turnFinishedSuffix": " (완료)",
          "dice": {
            "empty": "주사위: -",
            "detail": "주사위: [{diceFormatted}] / 남은 수 [{remainingFormatted}]"
          },
          "bar": "{bar}: {playerLabel} {playerFormatted} / {aiLabel} {aiFormatted}",
          "bearOff": {
            "title": "반출",
            "summary": "{title}: {playerLabel} {playerFormatted} / {aiLabel} {aiFormatted}"
          }
        },
        "log": {
          "bearOff": "{actor}이(가) {fromLabel}에서 반출 ({dieFormatted})",
          "barHit": "{actor}이(가) {bar}에서 {toLabel}로 진입 ({dieFormatted}): 히트!",
          "barEntry": "{actor}이(가) {bar}에서 {toLabel}로 진입 ({dieFormatted})",
          "moveHit": "{actor}이(가) {fromLabel} → {toLabel} 이동 ({dieFormatted}): 히트!",
          "move": "{actor}이(가) {fromLabel} → {toLabel} 이동 ({dieFormatted})",
          "win": {
            "player": "플레이어 승리! {rewardFormatted} EXP 획득.",
            "ai": "AI 승리… 다시 도전해 보세요."
          },
          "aiDice": "AI 주사위: {diceFormatted}",
          "aiNoMove": "AI가 움직일 수 없습니다.",
          "playerDice": "플레이어 주사위: {diceFormatted}",
          "noMoves": "합법적인 수가 없습니다.",
          "newGame": "새 게임이 시작되었습니다. 플레이어가 선공입니다."
        }
      },
      "runResult": {
        "defaultCause": "게임 오버"
      },
      "death": {
        "cause": {
          "generic": "게임 오버",
          "poison": "독에 쓰러졌다… 게임 오버.",
          "starvation": "굶주림으로 쓰러졌다… 게임 오버.",
          "wallCollision": "벽에 부딪혀 쓰러졌다… 게임 오버.",
          "instantKill": "즉사 공격에 당했다… 게임 오버.",
          "autoItemBackfire": "오토 아이템이 폭주해 쓰러졌다… 게임 오버.",
          "reversedPotion": "뒤집힌 포션에 휘말려 쓰러졌다… 게임 오버."
        }
      },
      "items": {
        "modal": {
          "title": "아이템"
        },
        "countPrefix": "x",
        "actions": {
          "use": "사용",
          "eat": "섭취",
          "offer": "봉헌",
          "cleanse": "상태 이상 해제",
          "throw": "던지기",
          "enable": "사용 설정",
          "close": "닫기"
        },
        "autoItem": {
          "label": "오토 아이템",
          "hint": "HP가 30% 미만으로 떨어지면 자동으로 회복합니다."
        },
        "potion30": {
          "label": "HP 30% 포션"
        },
        "hpBoost": {
          "label": "최대 HP 강화 아이템"
        },
        "atkBoost": {
          "label": "공격력 강화 아이템"
        },
        "defBoost": {
          "label": "방어력 강화 아이템"
        },
        "hpBoostMajor": {
          "label": "최대 HP 특대 강화 (+25)"
        },
        "atkBoostMajor": {
          "label": "공격력 특대 강화 (+10)"
        },
        "defBoostMajor": {
          "label": "방어력 특대 강화 (+10)"
        },
        "spElixir": {
          "label": "SP 엘릭서"
        },
        "passiveOrbs": {
          "header": "패시브 오브"
        },
        "skillCharms": {
          "header": "스킬 부적 (각 10턴)"
        },
        "errors": {
          "noHealingItem": "회복 아이템이 없습니다.",
          "noStatusToCleanse": "해제할 상태 이상이 없습니다."
        }
      },
      "passiveOrb": {
        "summary": "총 {total}개 ({unique}종)",
        "empty": "보유한 패시브 오브가 없습니다.",
        "noEffects": "효과 없음.",
        "countDetail": "보유 {count}개",
        "detailSeparator": " / ",
        "obtainDetail": " ({details})",
        "obtain": "패시브 오브 \"{label}\"을(를) 획득!{detail}",
        "obtainMultiple": "패시브 오브 \"{label}\" ×{delta}을(를) 획득!{detail}",
        "orbs": {
          "attackBoost": {
            "name": "공격 +1% 오브"
          },
          "defenseBoost": {
            "name": "방어 +1% 오브"
          },
          "abilityBoost": {
            "name": "모든 능력 +1% 오브"
          },
          "maxHpBoost": {
            "name": "최대 HP +10% 오브"
          },
          "statusGuard": {
            "name": "상태 이상 가드 오브"
          },
          "enemySpecialGuard": {
            "name": "적 특수 방어 오브"
          },
          "poisonResist": {
            "name": "독 내성 오브"
          },
          "paralysisResist": {
            "name": "마비 내성 오브"
          },
          "abilityDownResist": {
            "name": "능력 저하 내성 오브"
          },
          "levelDownResist": {
            "name": "레벨 감소 내성 오브"
          },
          "instantDeathResist": {
            "name": "즉사 내성 오브"
          },
          "knockbackResist": {
            "name": "넉백 내성 오브"
          },
          "poisonDamageGuard": {
            "name": "독 피해 가드 오브"
          },
          "bombDamageGuard": {
            "name": "폭탄 피해 가드 오브"
          },
          "skillPowerBoost": {
            "name": "스킬 위력 +10% 오브"
          },
          "damageDealtBoost": {
            "name": "가한 피해 +10% 오브"
          },
          "damageTakenGuard": {
            "name": "받는 피해 -10% 오브"
          },
          "evasionBoost": {
            "name": "회피 +1% 오브"
          },
          "accuracyBoost": {
            "name": "명중 +1% 오브"
          },
          "critDamageBoost": {
            "name": "치명타 피해 +10% 오브"
          }
        },
        "labels": {
          "maxHpMul": "최대 HP",
          "attackMul": "공격",
          "defenseMul": "방어",
          "damageDealtMul": "가한 피해",
          "damageTakenMul": "받는 피해",
          "skillPowerMul": "스킬 위력",
          "accuracyMul": "명중",
          "evasionMul": "회피",
          "critDamageMul": "치명타 피해",
          "statusChanceMul": "상태 이상 확률",
          "enemySpecialChanceMul": "적 특수 확률",
          "poisonStatusChanceMul": "독 부여 확률",
          "paralysisStatusChanceMul": "마비 부여 확률",
          "levelDownStatusChanceMul": "레벨 감소 확률",
          "instantDeathChanceMul": "즉사 확률",
          "knockbackChanceMul": "넉백 확률",
          "poisonDamageMul": "독 피해",
          "bombDamageMul": "폭탄 피해",
          "abilityDownPenaltyMul": "능력 저하 심각도",
          "status:poison": "독 부여 확률",
          "status:paralysis": "마비 부여 확률",
          "status:levelDown": "레벨 감소 확률",
          "instantDeath": "즉사 확률",
          "enemySpecial:knockback": "넉백 확률",
          "poison": "독 피해",
          "bomb": "폭탄 피해",
          "abilityDownPenalty": "능력 저하 심각도"
        }
      },
      "skillCharms": {
        "use": "사용",
        "empty": "보유한 부적이 없습니다."
      },
      "events": {
        "hatena": {
          "spawnSingle": "수수께끼 ? 블록이 나타났다!",
          "spawnMultiple": "{count}개의 수수께끼 ? 블록이 나타났다!",
          "bombGuard": "폭발의 충격이 무효화됐다!",
          "bombHeal": "폭발이 반전되어 HP가 {amount} 회복됐다!",
          "bombDamage": "폭발로 {amount}의 피해를 입었다!",
          "bombDeath": "폭발에 휘말려 쓰러졌다… 게임 오버.",
          "itemObtained": "{item}을(를) 얻었다!",
          "trigger": "? 블록을 밟았다!",
          "levelUp": "레벨이 {amount} 올랐다!",
          "levelNoChange": "하지만 레벨은 변하지 않았다.",
          "levelDown": "레벨이 {amount} 내려갔다...",
          "levelDownNoEffect": "더 이상 레벨이 내려가지 않았다.",
          "expGain": "{amount}의 EXP를 획득했다!",
          "expGainNone": "EXP는 늘어나지 않았다.",
          "expLoss": "{amount}의 EXP를 잃었다...",
          "expLossNone": "잃을 EXP는 없었다.",
          "enemyAmbush": "주위에 적이 나타났다!",
          "noEnemies": "하지만 적은 나타나지 않았다.",
          "poisonGuarded": "독이 무효화됐다!",
          "statusNone": "상태 이상은 일어나지 않았다.",
          "buffFailed": "능력 상승 효과가 발동하지 않았다.",
          "debuffNone": "능력 저하는 발생하지 않았다.",
          "rareChest": "눈부신 레어 보물상자가 나타났다!",
          "chestNoSpace": "보물상자를 둘 공간이 없었다.",
          "chest": "보물상자가 나타났다!",
          "noChest": "보물상자는 나타나지 않았다.",
          "chestRing": "보물상자에게 둘러싸였다!",
          "nothing": "하지만 아무 일도 일어나지 않았다."
        },
        "skills": {
          "statusGuarded": "스킬 효과로 상태 이상을 무효화했다!"
        },
        "sp": {
          "unlocked": "SP 시스템이 해방됐다!",
          "notUnlocked": "SP가 아직 해방되지 않았다.",
          "notEnough": "SP가 부족하다.",
          "maxIncreased": "SP 최대치가 {value}로 증가했다!",
          "gained": "SP를 {amount} 획득했다.",
          "spent": "SP를 {amount} 소비했다.",
          "offered": "회복 아이템을 바쳐 SP를 {amount} 획득했다.",
          "offerLocked": "SP 시스템이 해방된 후에 바칠 수 있다.",
          "notUnlockedForItem": "SP가 해방되지 않아 사용할 수 없다.",
          "noCapacity": "SP 최대치가 0이라 효과가 없다.",
          "alreadyFull": "SP가 이미 가득 찼다.",
          "elixirUsed": "SP 엘릭서를 사용! SP가 {amount} 회복됐다.",
          "fullyRestored": "SP가 전부 회복됐다 (+{amount})."
        },
        "exp": {
          "bossBonusSuffix": " (보스 보너스!)",
          "enemyGain": "{amount} EXP를 획득했다!{bonus}",
          "spent": "{amount} EXP를 소비했다. ({context})",
          "gained": "{amount} EXP를 획득했다! ({context})"
        },
        "status": {
          "paralyzed": "몸이 저려 움직일 수 없다...",
          "paralyzedRemaining": "몸이 저려 움직일 수 없다... (남은 {turns}턴)",
          "cured": {
            "poison": "독이 사라졌다.",
            "paralysis": "마비에서 벗어났다.",
            "abilityUp": "능력 상승 효과가 끝났다.",
            "abilityDown": "능력 저하에서 회복했다.",
            "levelDown": "일시적인 레벨 감소가 해제됐다."
          },
          "applied": {
            "poison": "독에 걸렸다! ({turns}턴)",
            "paralysis": "몸이 저려 움직일 수 없다! ({turns}턴)",
            "abilityUp": "힘이 넘친다! 최대 HP/공격/방어 상승 ({turns}턴)",
            "abilityDown": "능력이 떨어졌다... 최대 HP/공격/방어 감소 ({turns}턴)",
            "levelDown": "레벨이 일시적으로 내려갔다! ({turns}턴)"
          }
        },
        "levelUp": {
          "log": "레벨 업!\n레벨: {level} (+{levelDelta})\n최대 HP: {maxHp} (+{maxHpDelta})\n공격력: {attack} (+{attackDelta})\n방어력: {defense} (+{defenseDelta})"
        },
        "sandbox": {
          "noExp": "샌드박스 모드에서는 EXP를 얻을 수 없습니다.",
          "started": "샌드박스 모드를 시작했습니다. EXP는 지급되지 않습니다."
        },
        "console": {
          "executed": "창조자 콘솔이 코드를 실행했습니다.",
          "error": "창조자 콘솔 오류: {message}"
        },
        "unlocks": {
          "nestedLegend": "NESTED 99999999을 클리어해 아노스급 신격을 얻었습니다!",
          "consoleAlwaysOn": "창조자 콘솔과 샌드박스 전환을 항상 사용할 수 있게 되었습니다."
        },
        "actions": {
          "wallDestroyed": "벽을 파괴했다!"
        },
        "dungeon": {
          "darkness": "어둠이 시야를 뒤덮어 앞이 잘 보이지 않는다...",
          "poisonFog": "독 안개가 자욱하다! 일반 바닥도 위험하다."
        },
        "charms": {
          "unknown": "알 수 없는 부적은 사용할 수 없습니다.",
          "notOwned": "그 부적은 가지고 있지 않습니다.",
          "activated": "{label} 부적을 발동! 효과는 {turns}턴 지속됩니다."
        },
        "satiety": {
          "enabled": "포만감 시스템이 활성화됐다!",
          "disabled": "포만감 시스템이 해제됐다.",
          "cannotEat": "포만감 시스템이 켜졌을 때만 먹을 수 있다.",
          "alreadyFull": "포만감이 이미 최대치입니다.",
          "damage": "허기로 {amount}의 피해를 입었다!"
        },
        "chest": {
          "prefix": {
            "normal": "보물상자를 열었다! ",
            "rare": "황금 보물상자를 열었다! "
          },
          "reward": {
            "potion30": "{prefix}HP 30% 회복 포션을 손에 넣었다!",
            "hpBoost": "{prefix}최대 HP 강화 아이템을 손에 넣었다!",
            "atkBoost": "{prefix}공격력 강화 아이템을 손에 넣었다!",
            "defBoost": "{prefix}방어력 강화 아이템을 손에 넣었다!"
          }
        },
        "goldenChest": {
          "modal": {
            "title": "황금 보물상자",
            "status": "타이밍 바를 중앙에 맞추세요! (Space/Enter)",
            "stop": "정지",
            "hint": "Space / Enter 키로도 멈출 수 있습니다."
          },
          "elixir": "황금 보물상자에서 특제 SP 엘릭서를 손에 넣었다! SP가 크게 회복된다.",
          "openedSafely": "황금 보물상자를 안전하게 열었다!",
          "prompt": "황금 보물상자다! 타이밍 바를 노리자.",
          "major": {
            "hp": "황금 보물상자에서 최대 HP +{amount} 엘릭서를 발견했다!",
            "atk": "황금 보물상자에서 ATK +{amount} 전술 오브를 발견했다!",
            "def": "황금 보물상자에서 DEF +{amount} 가디언 실드 카드를 발견했다!"
          },
          "skillCharm": "황금 보물상자에서 스킬 부적 \"{effectName}\"을(를) 발견했다! ({turns}턴)"
        },
        "combat": {
          "noEnemyInDirection": "그 방향에는 적이 없다!",
          "sureHitIneffective": "레벨 차이로 필중 효과가 무효가 됐다...",
          "miss": "빗나감",
          "enemyDefeated": "적을 쓰러뜨렸다!",
          "bossGate": "보스를 쓰러뜨려야 진행할 수 있다!",
          "enemyMissed": "적이 공격을 빗나갔다!",
          "enemyWarped": "적의 순간이동 공격에 휘말려 이동했다!",
          "enemyAttackDamage": "적이 {amount}의 피해를 입혔다!",
          "enemyWarpPopup": "워프",
          "statusResistedByLevel": "레벨 차이로 상태 이상을 막았다!",
          "teleportResistedByLevel": "레벨 차이로 워프 공격을 버텼다!",
          "instantDeathResisted": "레벨 차이로 즉사 공격을 무효화했다!",
          "instantDeathHit": "적의 즉사 공격이 적중했다…!",
          "knockbackResistedByLevel": "레벨 차이로 넉백을 견뎠다!",
          "playerDamage": "적에게 {amount}의 피해를 주었다!",
          "knockbackCollision": "벽에 부딪혀 {amount}의 피해를 입었다!"
        },
        "orb": {
          "statusAttackNegated": "오브의 가호가 상태 공격을 무효화했다!",
          "statusAttackPrevented": "오브의 가호가 상태 공격을 막았다!",
          "statusPrevented": "오브의 가호가 상태 이상을 막았다!",
          "teleportNegated": "오브의 가호가 워프 공격을 무효화했다!",
          "teleportPrevented": "오브의 가호가 워프 공격을 막았다!",
          "instantDeathNegated": "오브의 가호가 즉사 공격을 무효화했다!",
          "instantDeathPrevented": "오브의 가호로 즉사 공격을 버텼다!",
          "knockbackNegated": "오브의 가호가 넉백을 무효화했다!",
          "knockbackPrevented": "오브의 가호가 넉백을 막았다!"
        },
        "items": {
          "noPotion": "포션이 없다.",
          "noOfferingItem": "봉헌할 회복 아이템이 없다.",
          "throwNoEnemies": "던질 범위에 적이 없다.",
          "throwNoHealingItem": "던질 회복 아이템이 없다.",
          "throwNoTarget": "던질 대상을 찾지 못했다.",
          "throwIneffective": "적의 레벨이 높아 던져도 효과가 없었다...",
          "throwNoEffect": "회복 아이템을 던졌지만 아무 일도 없었다.",
          "throwDamage": "회복 아이템을 던져 적에게 {damage}의 피해를 입혔다!",
          "autoSatietyRecovered": "오토 아이템 발동! 포만감이 {amount} 회복.",
          "potionSatietyRecovered": "포션을 먹었다! 포만감이 {amount} 회복.",
          "autoReversedDamage": "오토 아이템이 폭주해 {amount}의 피해를 입었다!",
          "potionReversedDamage": "포션이 반전되어 {amount}의 피해를 입었다!",
          "autoHpRecovered": "오토 아이템 발동! HP가 {amount} 회복.",
          "potionHpRecovered": "포션을 사용! HP가 {amount} 회복.",
          "autoNoEffect": "오토 아이템이 발동했지만 변화가 없었다.",
          "potionNoEffect": "포션을 사용했지만 변화가 없었다.",
          "cleansedStatus": "회복 아이템으로 {status} 상태 이상을 치료했다.",
          "hpBoostUsed": "최대 HP 강화 아이템 사용! 최대 HP가 5 증가!",
          "attackBoostUsed": "공격력 강화 아이템 사용! 공격력이 1 증가!",
          "defenseBoostUsed": "방어력 강화 아이템 사용! 방어력이 1 증가!",
          "hpBoostMajorUsed": "최대 HP 특대 강화 아이템 사용! 최대 HP가 {amount} 증가!",
          "attackBoostMajorUsed": "공격력 특대 강화 아이템 사용! 공격력이 {amount} 증가!",
          "defenseBoostMajorUsed": "방어력 특대 강화 아이템 사용! 방어력이 {amount} 증가!",
          "notOwned": "그 아이템은 가지고 있지 않다.",
          "noSpElixir": "SP 엘릭서를 가지고 있지 않다."
        },
        "data": {
          "imported": "데이터를 가져왔습니다."
        },
        "blockdim": {
          "selectionIncomplete": "블록 선택이 완전하지 않습니다."
        },
        "progress": {
          "dungeonCleared": "던전을 클리어했다!",
          "nextFloor": "다음 층으로 올라갔다! ({floor}F)"
        }
      }
    },
    "godConsole": {
      "mode": {
        "current": "현재: {mode}",
        "sandbox": "샌드박스 모드",
        "normal": "탐험 모드",
        "toggle": {
          "toSandbox": "샌드박스 모드로 전환",
          "toNormal": "탐험 모드로 돌아가기"
        }
      },
      "status": {
        "prompt": "코드를 입력해 창조의 힘을 발휘하세요.",
        "notAwakened": "창조자의 힘이 아직 깨어나지 않았습니다.",
        "enterCode": "코드를 입력하세요.",
        "running": "코드를 실행 중…",
        "executedWithReturn": "코드를 실행했습니다 (반환값: {value})",
        "executed": "코드를 실행했습니다.",
        "error": "에러: {message}",
        "requiresGodPower": "창조자의 힘이 필요합니다.",
        "toggleRestricted": "던전을 탐험 중에만 전환할 수 있습니다.",
        "sandboxEnabled": "샌드박스 모드를 활성화했습니다.",
        "sandboxDisabled": "탐험 모드로 돌아왔습니다.",
        "sampleInserted": "샘플 코드를 삽입했습니다.",
        "cleared": "입력을 지웠습니다."
      }
    },
    "enemy": {
      "modal": {
        "noiseBlocked": "잡음이 심해 적 정보를 읽을 수 없다...",
        "title": {
          "boss": "보스 정보",
          "standard": "적 정보"
        },
        "sections": {
          "damage": "피해 예측"
        },
        "labels": {
          "level": "레벨:",
          "type": "종류:",
          "hp": "HP:",
          "attack": "공격력:",
          "defense": "방어력:",
          "damageDeal": "가한 피해:",
          "damageTake": "받는 피해:",
          "hitRate": "명중률:",
          "enemyHitRate": "적 명중률:"
        },
        "levelFormat": "Lv.{level}",
        "typeDescription": {
          "suppressed": "{description} (레벨 차이로 특수 효과 억제)"
        },
        "damage": {
          "invincibleLabel": "무적",
          "invincible": "0 ({label})",
          "critLabel": "크리",
          "reverseLabel": "회복",
          "reverseRange": "{reverseLabel} {min}-{max} ({critLabel}: {critMin}-{critMax})",
          "range": "{min}-{max} ({critLabel}: {critMin}-{critMax})"
        },
        "hitRate": "{value}%",
        "enemyHitRate": "{value}%"
      },
      "types": {
        "normal": {
          "label": "통상형",
          "description": "특별한 행동을 하지 않습니다."
        },
        "statusCaster": {
          "label": "상태 이상사",
          "description": "공격이 맞으면 독이나 마비를 걸 수 있습니다."
        },
        "warper": {
          "label": "워퍼",
          "description": "공격이 적중하면 플레이어를 다른 칸으로 워프시킬 수 있습니다."
        },
        "executioner": {
          "label": "집행자",
          "description": "낮은 확률로 즉사 공격을 쓰는 위험한 적입니다."
        },
        "knockback": {
          "label": "돌격자",
          "description": "플레이어를 밀쳐내며, 벽에 부딪히면 추가 피해를 줍니다."
        },
        "swift": {
          "label": "쾌속 전사",
          "description": "빠르게 움직여 플레이어 턴 중 두 번 행동합니다."
        }
      }
    },
    "statusModal": {
      "title": "플레이어 상태",
      "sections": {
        "basic": "기본 스탯",
        "inventory": "인벤토리",
        "settings": "게임 설정",
        "dungeon": "던전 정보"
      },
      "labels": {
        "level": "레벨",
        "exp": "경험치",
        "hp": "HP",
        "satiety": "포만감",
        "sp": "SP",
        "attack": "공격",
        "defense": "방어",
        "statusEffects": "상태 이상",
        "skillEffects": "스킬 효과",
        "floor": "현재 층"
      },
      "settings": {
        "world": "선택한 월드",
        "difficulty": "난이도"
      },
      "dungeon": {
        "structure": "구조",
        "type": "유형"
      },
      "effects": {
        "none": "상태 이상이 없습니다.",
        "remaining": "{label} {turns}턴 남음",
        "entry": "{label} {turns}턴 남음"
      },
      "skillCharms": {
        "entry": "{label} x{count}"
      },
      "world": {
        "normal": "{world} 월드",
        "blockdim": "BlockDim NESTED {nested} / {dimension}"
      },
      "dungeonSummary": {
        "normal": "{world} 월드: {dungeon}",
        "blockdim": "NESTED {nested} / 차원 {dimension}: {block1} · {block2} · {block3}"
      },
      "details": {
        "floor": "층: {floor}",
        "hpBaseSuffix": " (기본 {base})",
        "level": "Lv.{value}",
        "hp": "HP {current}/{max}{baseSuffix}",
        "attack": "ATK {value}",
        "defense": "DEF {value}",
        "satiety": "포만감 {current}/{max}",
        "line": "{level} {hp} {attack} {defense} {satiety}"
      },
      "stats": {
        "valueWithBase": "{effective} (기본 {base})",
        "levelWithBase": "Lv.{effective} (기본 {base})",
        "hp": "{current}/{max}{baseSuffix}"
      }
    },
    "selection": {
      "title": "던전 선택",
      "difficulty": {
        "label": "난이도",
        "option": {
          "veryEasy": "매우 쉬움",
          "easy": "쉬움",
          "normal": "보통",
          "second": "세컨드",
          "hard": "어려움",
          "veryHard": "매우 어려움"
        }
      },
      "dungeons": {
        "tooltip": "권장 레벨: {level}"
      },
      "playerStatus": {
        "title": "플레이어 상태",
        "toggle": {
          "expand": "펼치기",
          "collapse": "접기"
        },
        "labels": {
          "level": "레벨",
          "hp": "HP",
          "satiety": "포만감",
          "exp": "경험치",
          "sp": "SP",
          "attack": "공격",
          "defense": "방어"
        }
      },
      "tabs": {
        "ariaLabel": "던전 선택 탭",
        "normal": "일반",
        "blockdim": "블록 차원",
        "miniexp": "미니게임 경험",
        "tools": "도구",
        "achievements": "업적 · 통계"
      },
      "normal": {
        "worlds": "월드",
        "dungeons": "던전",
        "detail": {
          "name": "던전 이름",
          "typeLabel": "유형:",
          "typeValue": "필드",
          "recommendedLabel": "권장 레벨:",
          "damageLabel": "피해 배수:",
          "damageValue": "가하는 피해: 1.6배 / 받는 피해: 0.5배",
          "damageMultiplier": "가하는 피해: {deal}배 / 받는 피해: {take}배",
          "descriptionLabel": "설명:",
          "description": "던전 설명",
          "start": "던전 입장"
        }
      },
      "blockdim": {
        "nested": {
          "label": "NESTED 차원",
          "title": "NESTED 차원: 권장 레벨 2600*(N-1) 증가"
        },
        "dimension": {
          "label": "차원",
          "listLabel": "차원",
          "first": "1번째",
          "second": "2번째",
          "third": "3번째"
        },
        "card": {
          "title": "합성 미리보기",
          "selection": "선택",
          "level": "권장 레벨",
          "type": "유형",
          "depth": "깊이",
          "size": "크기",
          "chest": "보물상자",
          "boss": "보스층",
          "note": "동일한 조합은 동일한 생성 결과를 만듭니다(고정 시드).",
          "gate": "게이트",
          "addBookmark": "★ 북마크 추가",
          "addBookmarkTitle": "현재 조합을 북마크에 추가하세요",
          "clearHistory": "기록 지우기",
          "clearHistoryTitle": "모든 게이트 기록 지우기",
          "random": "🎲 무작위 선택 (1차/2차/3차)",
          "randomTitle": "1차/2차/3차 무작위 선택",
          "randomTarget": "목표 Lv(블록 합계)",
          "randomTargetTitle": "기본 차원 수준을 무시합니다. 세 가지 블록 수준만 합산합니다.",
          "randomType": "유형 우선순위",
          "randomTypeTitle": "어울리는 유형을 선호하세요",
          "randomTypeNone": "특혜 없음",
          "weightedRandom": "🎯 가중 무작위",
          "weightedRandomTitle": "목표 레벨 및 유형 우선순위에 따라 가중치가 부여된 무작위 선택"
        },
        "history": {
          "title": "게이트 역사",
          "empty": "아직 기록이 없습니다.",
          "entryLabel": "중첩된 {nested} | {dimension} | {block1} · {block2} · {block3}",
          "entryTooltip": "Lv{level} / {type} / 깊이 {depth} / 시드 {seed}",
          "confirmClear": "Gate 기록을 모두 삭제하시겠습니까?",
          "delete": "삭제"
        },
        "bookmarks": {
          "title": "북마크 차단",
          "empty": "아직 북마크가 없습니다.",
          "entryTooltip": "Lv{level} / {type} / 깊이 {depth} / 시드 {seed}",
          "delete": "삭제"
        },
        "test": {
          "title": "던전 테스트",
          "description": "BlockDim이 안전한지 확인하기 위해 등록된 모든 던전 유형을 무작위 시드로 생성합니다. 오류가 기록되고 무한 루프가 발생하면 실행이 완료되지 않습니다.",
          "run": "🧪 던전 테스트 실행",
          "idle": "게으른",
          "status": {
            "initializing": "초기화 중…",
            "noTargets": "타겟 없음",
            "running": "실행 중({current}/{total})",
            "completedWithFailures": "완료됨(실패: {count})",
            "completedSuccess": "완료(모두 합격)",
            "error": "오류가 발생했습니다"
          },
          "log": {
            "addonLoadError": "애드온 로드 오류: {error}",
            "noTargets": "테스트할 던전 유형이 없습니다.",
            "targetCount": "테스트 대상: {count} 유형",
            "start": "▶ {name}({id}) 생성 테스트 시작",
            "success": "✅ 성공: {name} ({id}) 시드={seed} 크기={width}×{height} 층수={floors} 실제={actual}",
            "failure": "❌ 실패: {name} ({id}) 시드={seed}",
            "summary": "완료: 성공 {success} / 실패 {failure} / 기간 {duration}ms",
            "fatal": "심각한 오류: {error}"
          }
        },
        "hud": {
          "summary": "모양 {bodyCount} / 이미터 {emitterCount} / 천 {clothCount} / 입자 {particleCount}",
          "powerGravityExp": "동력 {poweredCount} / 중력 {gravity} / EXP {exp}",
          "solver": "솔버 {iterations} iter × {substeps} sub",
          "temperature": "평균 온도 {average}°C / 주변 {ambient}°C / 최대 {max}°C",
          "phases": "상태 고체 {solid} / 액체 {liquid} / 기체 {gas}",
          "wind": "돌풍 {gusts} / 바람 방출기 {emitters}"
        },
        "inspector": {
          "title": "설정",
          "world": {
            "gravityY": "중력 Y({value})",
            "airDrag": "에어 드래그({value})",
            "iterations": "솔버 반복({value})",
            "substeps": "하위 단계({value})",
            "ambientTemperature": "주변 온도({value}°C)",
            "boundary": {
              "label": "경계 모드",
              "options": {
                "wall": "벽(가장자리에서 바운스)",
                "void": "공허(떨어지다)"
              },
              "voidHint": "공허: 경계를 벗어난 시체는 거리를 이동한 후 사라집니다."
            }
          },
          "noSelection": "도구 모음에서 도형을 추가하고 선택하면 자세한 설정을 볼 수 있습니다.",
          "savedLayouts": {
            "title": "저장된 레이아웃",
            "load": "짐",
            "delete": "삭제"
          },
          "common": {
            "unknown": "알려지지 않은"
          },
          "body": {
            "title": "신체 속성",
            "state": "상태: {state}",
            "damage": "착용률: {percent}%",
            "integrity": "무결성: {percent}%",
            "stress": "스트레스 지수: {value} kPa",
            "strain": "변형률: {percent}%",
            "heatFlux": "열유속 지수: {value}",
            "fracture": "골절 임계값: {threshold} / 조각 {fragments}",
            "reactionCooldown": "반응 쿨다운: {seconds}s",
            "materialPreset": "머티리얼 프리셋",
            "mass": "질량(예상 {value})",
            "angleInfo": "각도 {angle}° / 각속도 {angular} rad/s",
            "static": "정적으로 만들기",
            "restitution": "배상({value})",
            "friction": "마찰({value})",
            "wallNote": "절대 벽에는 고정된 재료가 있습니다. 크기와 위치만 변경할 수 있습니다.",
            "radius": "반경({value})",
            "width": "너비({value})",
            "height": "높이({value})",
            "color": "색상",
            "chemical": {
              "formula": "수식: {formula}",
              "components": "구성요소: {list}",
              "molarMass": "몰 질량: {mass} g/mol",
              "hazards": "속성: {list}"
            },
            "phase": {
              "solid": "단단한",
              "liquid": "액체",
              "gas": "가스"
            }
          },
          "customMaterial": {
            "alertAddElement": "요소를 하나 이상 추가하세요.",
            "title": "화학제품 커스터마이저",
            "components": "구성요소: {list}",
            "componentsEmpty": "구성 요소: 요소가 추가되지 않았습니다.",
            "formulaPreview": "수식 미리보기: {formula}",
            "molarMass": "추정 몰 질량: {mass} g/mol",
            "suggestedDensity": "평균 요소 밀도: {average}(현재 {current})",
            "removeComponent": "제거하다",
            "addElement": "요소 추가",
            "nameLabel": "재료 이름",
            "namePlaceholder": "맞춤 재료 이름",
            "density": "밀도({value})",
            "baseTemperature": "기본 온도({value}°C)",
            "meltingPoint": "녹는점({value}°C)",
            "boilingPoint": "끓는점({value}°C)",
            "ignitionPoint": "발화점({value}°C)",
            "hazardTitle": "위험 태그",
            "appliedHazards": "적용된 태그: {list}",
            "apply": "사용자 정의 재질 적용",
            "reset": "명확한 구성",
            "hazards": {
              "flammable": "가연성",
              "conductive": "전도성",
              "elastic": "탄력 있는",
              "insulator": "절연체",
              "aqueous": "수용성",
              "superheated": "과열됨",
              "ionized": "이온화",
              "alkali-metal": "알칼리 금속",
              "water-reactive": "물 반응성",
              "acidic": "산성",
              "corrosive": "신랄한",
              "toxic": "독성",
              "inert": "둔한",
              "oxidizer": "산화제",
              "explosive": "폭발물",
              "cryogenic": "극저온",
              "refractory": "내화 물질",
              "catalytic": "촉매"
            }
          },
          "emitter": {
            "title": "이미터 설정",
            "type": "유형: {kind}",
            "rate": "속도({value}/초)",
            "power": "힘 ({value})",
            "direction": "방향({value}°)",
            "circuit": {
              "alwaysOn": "전원 유지",
              "connections": "연결된 노드",
              "disconnect": "연결 끊기",
              "cancel": "연결 취소",
              "connect": "링크 모드"
            }
          },
          "cloth": {
            "title": "옷감 속성",
            "integrity": "무결성 {percent}%",
            "links": "노드 {cols}×{rows} / 링크 {intact}/{total}",
            "strain": "평균 변형률 {average}% / 최대 {max}%",
            "fatigue": "피로 {value}",
            "structural": "구조적({value})",
            "shear": "전단({value})",
            "bend": "벤드({value})",
            "damping": "댐핑({value})",
            "tearFactor": "찢어짐 계수({value})",
            "windInfluence": "바람 반응({value})",
            "color": "색상",
            "pinTop": "상단 가장자리 고정",
            "unpinAll": "모두 고정 해제"
          }
        }
      },
      "miniexp": {
        "categories": "카테고리 목록",
        "displayModes": "디스플레이 모드",
        "displayMode": {
          "tile": "타일",
          "list": "목록",
          "wrap": "포장하다",
          "detail": "세부 사항"
        },
        "search": {
          "label": "검색",
          "placeholder": "이름이나 설명으로 검색",
          "groupLabel": "검색 및 필터"
        },
        "filters": {
          "source": {
            "label": "출처",
            "all": "전체",
            "builtin": "공식",
            "mod": "MOD/커뮤니티"
          },
          "favoritesOnly": "즐겨찾기만 표시"
        },
        "actions": {
          "select": "선택하다",
          "selected": "선택된",
          "favorite": "즐겨찾기에 추가",
          "unfavorite": "즐겨찾기에서 제거"
        },
        "list": {
          "label": "미니게임 목록",
          "empty": "해당 카테고리에 해당하는 미니게임이 없습니다. games/ 아래에 더 추가하세요.",
          "noMatch": "조건에 맞는 미니게임을 찾지 못했습니다. 필터를 조정하세요."
        },
        "favorites": {
          "title": "즐겨찾기",
          "empty": "즐겨찾기에 등록한 미니게임이 아직 없습니다."
        },
        "category": {
          "all": "모두",
          "action": "행동",
          "board": "판자",
          "shooting": "사수",
          "puzzle": "퍼즐",
          "utility": "공익사업",
          "rhythm": "율",
          "gambling": "도박",
          "toy": "장난감",
          "simulation": "시뮬레이션",
          "skill": "기능",
          "misc": "기타"
        },
        "games": {
          "snake": {
            "name": "뱀",
            "description": "펠릿을 모아서 더 오래 성장하고 경험치를 획득하세요."
          },
          "othello": {
            "name": "오델로",
            "description": "디스크를 뒤집어 보드를 휘두르고 승리하여 보너스 경험치를 얻으세요."
          },
          "othello_weak": {
            "name": "가장 약한 오델로",
            "description": "더 적은 수의 디스크가 승리하고 더 높은 난이도로 인해 AI가 의도적으로 실수를 저지르는 비참한 트위스트입니다."
          },
          "checkers": {
            "name": "체커",
            "description": "클래식 보드 결투에서 적의 기물을 뛰어넘고 부하들에게 왕관을 씌워보세요."
          },
          "chess": {
            "name": "체스",
            "description": "전술적 포획과 점검으로 왕을 따돌리고 EXP를 얻으세요.",
            "title": "체스",
            "difficultyTag": "난이도: {value}",
            "difficultyValue": {
              "easy": "쉬운",
              "normal": "정상",
              "hard": "딱딱한"
            },
            "status": {
              "stopped": "중지됨",
              "turnLabel": "회전하다:",
              "yourTurn": "당신의 움직임",
              "aiThinking": "AI는 생각하고 있다…",
              "scoreLabel": "점수:"
            },
            "messages": {
              "checkmateWin": "장군! 당신이 승리합니다.",
              "checkmateLoss": "체크메이트…",
              "stalemate": "수가 막히게 하다. 게임은 무승부입니다.",
              "draw": "경기는 무승부로 기록됐다.",
              "playerCheck": "확인하다!",
              "playerInCheck": "당신은 확인 중입니다!",
              "selectMove": "대상 광장을 선택하세요."
            },
            "prompts": {
              "promotion": "프로모션 작품 선택(Q/R/B/N)"
            },
            "controls": {
              "restart": "다시 시작"
            }
          },
          "xiangqi": {
            "name": "샹치",
            "description": "중국 장기. 기물을 포획하고 장군·체크메이트로 경험치를 얻으세요.",
            "header": {
              "title": "샹치",
              "subtitle": "{color}이 선공"
            },
            "controls": {
              "reset": "초기 배치로 리셋"
            },
            "board": {
              "riverLabel": "楚河　漢界"
            },
            "color": {
              "red": "홍",
              "black": "흑",
              "redPlayer": "홍 (아래)",
              "blackPlayer": "흑 (위)"
            },
            "pieces": {
              "general": "장군",
              "advisor": "사",
              "elephant": "상",
              "horse": "마",
              "chariot": "차",
              "cannon": "포",
              "soldier": "졸"
            },
            "expLabel": "EXP",
            "piece": {
              "description": "{color} {piece}"
            },
            "status": {
              "turnLine": "턴: {turn}",
              "turn": {
                "red": "{color} 차례입니다.",
                "black": "{color} 차례입니다."
              },
              "scoreLine": "총 점수: {score}",
              "capture": "{actor}이(가) {target}을(를) 잡았습니다 (+{exp}{expLabel})",
              "move": "{piece}이(가) 이동했습니다.",
              "win": "{loser}이(가) 체크메이트당했습니다. {winner} 승리!",
              "stalemate": "스테일메이트 (합법 수 없음).",
              "check": "{defender}이(가) 장군을 당했습니다 (+{exp}{expLabel})"
            }
          },
          "shogi": {
            "name": "쇼기",
            "description": "정통 쇼기. 손패와 승급을 활용해 체크메이트를 노리고, 착수·포획·장군으로 경험치를 얻으세요.",
            "ui": {
              "title": "쇼기",
              "subtitle": "MiniExp 버전",
              "legend": "수:+{moveExpFormatted} EXP / 손패 투입:+{dropExpFormatted} EXP / 포획 보너스 / 승급:+{promoteExpFormatted} EXP / 장군:+{checkExpFormatted} EXP / 승리 보너스",
              "hands": {
                "aiLabel": "선수 (CPU)",
                "playerLabel": "후수 (당신)",
                "empty": "없음",
                "chip": "{piece}×{countFormatted}",
                "total": "{countFormatted}개",
                "totalNone": "없음"
              },
              "actions": {
                "restart": "재시작"
              },
              "confirm": {
                "promote": "승급하시겠습니까?"
              }
            },
            "status": {
              "playerTurn": "당신의 차례입니다. 기물 또는 손패를 선택하세요.",
              "aiThinking": "CPU가 수를 계산 중…",
              "playerInCheck": "장군을 당했습니다! 대응하세요.",
              "aiInCheck": "장군! 마무리를 노려 보세요."
            },
            "result": {
              "playerWin": "체크메이트! 당신의 승리",
              "playerLose": "체크메이트 당했습니다… 패배",
              "draw": "지장 / 천일수 무승부"
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
            "name": "리치 마작 라이트",
            "description": "3명의 AI와 동풍 1국을 치르는 간단한 리치 마작. 리치/쯔모/론과 점봉 정산을 지원합니다."
          },
          "connect6": {
            "name": "커넥트 식스",
            "description": "차례마다 돌 두 개를 놓아 여섯 줄을 노리는 대결. 착수 +1EXP, 위협 +10EXP, 승리 시 높은 보상."
          },
          "gomoku": {
            "name": "오목",
            "description": "돌을 놓을 때마다 +1EXP, 위협을 만들면 +10EXP, 승리 보너스가 지급됩니다."
          },
          "renju": {
            "name": "렌주",
            "description": "금수 규칙이 적용된 오목. 착수 +1EXP, 위협 +10EXP, 승리 보너스."
          },
          "connect4": {
            "name": "커넥트 포",
            "description": "말이 떨어지는 사목 게임. 착수 +1EXP, 위협 +10EXP, 난이도에 따라 승리 EXP가 주어집니다."
          },
          "tic_tac_toe": {
            "name": "틱택토",
            "description": "고전 삼목 게임. 착수 +1EXP, 위협 +10EXP, 승리는 소폭 보너스입니다."
          },
          "go": {
            "name": "바둑",
            "description": "돌을 두면 +1 / 포획 보너스 / 승리 EXP",
            "info": {
              "intro": "바둑 9×9 — 당신이 선공 (흑)"
            },
            "hud": {
              "turn": {
                "player": "당신의 차례 (흑)",
                "ai": "AI 차례 (백)"
              },
              "status": "{turn} ｜ 흑 포획:{blackCaptures} ｜ 백 포획:{whiteCaptures} (덤+{komi})",
              "passNotice": "{actor}이(가) 패스했습니다 (연속 {count})",
              "aiThinking": "AI가 수를 생각 중…"
            },
            "buttons": {
              "pass": "패스",
              "resign": "기권"
            },
            "messages": {
              "koViolation": "그 수는 패 상황이라 둘 수 없습니다"
            },
            "actors": {
              "player": "당신",
              "ai": "AI"
            },
            "result": {
              "win": "당신의 승리!",
              "loss": "AI의 승리…",
              "draw": "빅 (무승부)",
              "summary": "{result} ｜ 흑 {blackScore} - 백 {whiteScore}"
            }
          },
          "backgammon": {
            "name": "백개먼",
            "description": "24개의 포인트를 누비며 베어오프를 노리는 백개먼입니다. 히트와 베어오프로 EXP를 획득하세요."
          },
          "mancala": {
            "name": "만칼라",
            "description": "EXP에 대해 AI를 능가하는 Kalah 규칙 세트에서 씨앗을 뿌리고 구덩이를 캡처하세요."
          },
          "breakout": {
            "name": "브레이크아웃",
            "description": "패들의 방향을 바꿔 벽돌을 부수고 모든 블록에서 경험치를 획득하세요."
          },
          "breakout_k": {
            "name": "브레이크아웃(키보드)",
            "description": "경험치 보상을 위해 키보드 전용 패들 컨트롤을 사용하여 벽돌을 클리어하세요."
          },
          "pinball_xp": {
            "name": "XP 핀볼",
            "description": "복고풍의 3D 스타일 테이블, 조명 레인, 범퍼를 촬영하여 EXP를 획득하세요."
          },
          "dungeon_td": {
            "name": "던전 타워 디펜스",
            "description": "하이브리드 던전에 포탑을 설치하고 적의 파도를 막아 경험치 레벨을 높이세요."
          },
          "pong": {
            "name": "탁구",
            "description": "더 높은 난이도에서 EXP를 높여 탁구 랠리에서 승리하세요."
          },
          "same": {
            "name": "같은게임",
            "description": "일치하는 색상 클러스터를 터뜨려 EXP 보너스를 받으세요."
          },
          "match3": {
            "name": "매치 3",
            "description": "보석을 교환하여 사슬을 만드세요. 더 긴 매치와 콤보를 통해 EXP를 높일 수 있습니다.",
            "hud": {
              "title": "매치-3",
              "cleared": "삭제됨",
              "status": "{title} | {difficulty} | {clearedLabel}: {tiles}"
            },
            "difficulty": {
              "easy": "쉬운",
              "normal": "정상",
              "hard": "딱딱한"
            },
            "popup": {
              "chain": "체인 {chain}!"
            }
          },
          "minesweeper": {
            "name": "지뢰 찾기",
            "description": "보드를 안전하게 클리어하고 공개 및 전체 클리어를 통해 EXP를 획득하세요."
          },
          "sudoku": {
            "name": "번호 장소",
            "description": "경험치와 완료 보너스를 얻으려면 올바른 숫자로 그리드를 채우세요."
          },
          "ultimate_ttt": {
            "name": "궁극의 틱택토",
            "description": "미니보드를 제어하고 다양한 경험치 보상으로 큰 승리를 거두세요."
          },
          "nine_mens_morris": {
            "name": "나인 멘스 모리스",
            "description": "밀을 설치하여 적의 조각을 제거하고 경험치를 확보하세요."
          },
          "sugoroku_life": {
            "name": "라이프 스고로쿠",
            "description": "커리어 보드 게임에서 인생의 사건을 탐색하고, 자산을 늘리고, 경험치를 쌓으세요."
          },
          "sliding_puzzle": {
            "name": "슬라이딩 퍼즐",
            "description": "EXP를 위해 8타일, 15타일, 24타일 슬라이딩 퍼즐을 풀어보세요."
          },
          "invaders": {
            "name": "스페이스 인베이더",
            "description": "하강하는 외계인을 쏘아 EXP를 얻으세요. 파도를 치려면 횡재가 필요합니다."
          },
          "pacman": {
            "name": "팩맨 클론",
            "description": "펠릿을 먹고 미로를 깨끗하게 청소하여 막대한 EXP 보상을 받으세요."
          },
          "bomberman": {
            "name": "봄버맨 클론",
            "description": "경험치를 축적하기 위해 폭탄으로 소프트 블록과 적을 폭파하세요."
          },
          "tetris": {
            "name": "테트리스 클론",
            "description": "REN 체인과 T-스핀용 테트리미노를 쌓아 경험치를 최대화하세요."
          },
          "falling_puyos": {
            "name": "뿌요뿌요 클론",
            "description": "경험치 배율을 증폭시키기 위해 4가지 색상을 연결하세요."
          },
          "triomino_columns": {
            "name": "트리오미노 기둥",
            "description": "라인 스파크와 홀드가 있는 세 조각 기둥을 떨어뜨려 EXP를 쌓으세요."
          },
          "game2048": {
            "name": "2048년",
            "description": "2048년을 향해 타일을 병합하고 log2 합계를 기준으로 경험치를 얻습니다.",
            "setup": {
              "sizeLabel": "보드 크기:",
              "startButton": "시작",
              "boardSizeOption": "{size}×{size}"
            }
          },
          "todo_list": {
            "name": "할 일 목록",
            "description": "구성 가능한 EXP를 받으려면 설정한 작업을 완료하세요."
          },
          "counter_pad": {
            "name": "카운터 패드",
            "description": "조정 내용을 자동 저장하는 다중 카운터 버튼으로 번호를 추적하세요."
          },
          "random_tool": {
            "name": "랜덤 툴킷",
            "description": "주사위 굴리기, 룰렛, 목록 추첨, 난수/문자열 생성을 모은 유틸리티."
          },
          "notepad": {
            "name": "메모장",
            "description": "메모를 작성하고, 편집하고, 저장하여 추가 EXP를 얻으세요."
          },
          "wording": {
            "name": "말씨",
            "description": "워드 프로세서 보상 경험치: 편집 +1 / 서식 +2 / 저장 +6"
          },
          "exceler": {
            "name": "엑셀러 스프레드시트",
            "description": "생산성 EXP를 위한 수식 및 서식을 사용한 경량 XLSX 편집."
          },
          "paint": {
            "name": "페인트",
            "description": "아트웍을 그리고 채운 다음 EXP 부스트를 위해 캔버스를 저장하세요."
          },
          "diagram_maker": {
            "name": "다이어그램 메이커",
            "description": "draw.io XML 내보내기 및 이미지 출력을 사용하여 다이어그램을 만들어 EXP를 얻으세요."
          },
          "clock_hub": {
            "name": "시계 허브",
            "description": "풍부한 시계 위젯과 시간 데이터를 탐색하고 마일스톤 EXP를 수집하세요."
          },
          "login_bonus": {
            "name": "로그인 보너스",
            "description": "달력에 일일 체크인을 표시해 EXP 보상을 받으세요."
          },
          "stopwatch": {
            "name": "스톱워치",
            "description": "랩을 정확하게 측정하고 각 작업마다 EXP를 적립하세요."
          },
          "calculator": {
            "name": "계산자",
            "description": "숫자를 입력하고 계산을 마무리하여 EXP를 획득하세요."
          },
          "timer": {
            "name": "시간제 노동자",
            "description": "EXP 일정에 맞춰 카운트다운과 스톱워치를 관리하세요."
          },
          "math_lab": {
            "name": "수학 연구실",
            "description": "EXP를 위한 고급 수학 도구(함수, 변환, 그래프, 심지어 테트라레이션까지)를 살펴보세요.",
            "keypad": {
              "groups": {
                "standard": "표준 기능",
                "trigonometry": "삼각법 및 쌍곡선",
                "complex": "복소수 및 행렬",
                "analysis": "분석 및 특수 기능",
                "statistics": "확률 및 통계",
                "numerical": "수치적 방법",
                "programmer": "프로그래머 및 정보",
                "constants": "상수 및 단위"
              }
            },
            "units": {
              "templates": {
                "length": "길이: 5 cm → 인치",
                "mass": "질량: 70kg → lb",
                "energy": "에너지: 1kWh → J",
                "temperature": "온도: 25°C → degF",
                "speed": "속도: 100km/h → m/s"
              }
            },
            "ui": {
              "unitTemplates": {
                "title": "단위 변환 사전 설정",
                "insert": "끼워 넣다"
              },
              "worksheet": {
                "title": "워크시트"
              },
              "inputMode": {
                "classic": "함수 표기법",
                "pretty": "수학 기호"
              },
              "preview": {
                "title": "표현식 미리보기"
              },
              "actions": {
                "evaluate": "평가(Shift+Enter)",
                "clear": "다시 놓기",
                "copyResult": "결과 복사"
              },
              "history": {
                "title": "역사",
                "empty": "계산 기록이 여기에 표시됩니다."
              },
              "variables": {
                "title": "범위 변수",
                "reset": "변수 지우기",
                "empty": "(변수가 정의되지 않음)"
              },
              "angle": {
                "radians": "라디안",
                "degrees": "학위"
              }
            },
            "placeholders": {
              "worksheet": {
                "classic": "표현식 또는 명령 입력(예: 통합(sin(x), x),solveEq(sin(x)=0.5, x, 1),solveSystem([\"x+y=3\",\"x-y=1\"],[\"x\",\"y\"]))",
                "pretty": "예: 수학 기호를 사용한 √(2) + 1/3, 2π, (x+1)/(x−1)"
              },
              "preview": {
                "expression": "(입력된 표현식이 여기에 시각화됩니다)"
              },
              "graph": {
                "expression": "f(x)를 입력합니다(예: sin(x) / x)"
              }
            },
            "status": {
              "initializing": "초기화 중…",
              "loading": "수학 엔진 로드 중…",
              "copySuccess": "결과를 클립보드에 복사했습니다.",
              "copyFailure": "클립보드에 복사하지 못했습니다.",
              "scopeReset": "범위 재설정.",
              "inputModeClassic": "입력 모드: 함수 표기법",
              "inputModePretty": "입력 모드: 수학 기호",
              "resultModeSymbolic": "결과 모드: 분수/기호",
              "resultModeNumeric": "결과 모드: 십진수",
              "angleRadians": "각도 단위: 라디안",
              "angleDegrees": "각도 단위: 도",
              "worksheetCleared": "워크시트가 지워졌습니다.",
              "engineWaiting": "수학 엔진 초기화를 기다리는 중…",
              "enterExpression": "표현식을 입력하세요.",
              "calculationComplete": "계산이 완료되었습니다.",
              "error": "오류: {message}",
              "enterGraphExpression": "플롯할 표현식을 입력하세요.",
              "ready": "수학 실험실이 준비되었습니다.",
              "engineInitialized": "수학 엔진이 초기화되었습니다.",
              "loadFailed": "수학 엔진을 로드하지 못했습니다. 인터넷 연결을 확인하세요."
            },
            "results": {
              "title": "결과",
              "symbolicToggle": "분수/기호",
              "numericToggle": "소수",
              "symbolicLabel": "정확/기호적",
              "numericLabel": "근사치(기본 10)",
              "moreDigits": "더 많은 자릿수",
              "moreDigitsHint": "십진수 출력을 +5자리 확장",
              "errorLabel": "오류"
            },
            "graph": {
              "title": "그래프",
              "plot": "구성",
              "range": "범위(x최소, x최대)",
              "info": "축 자동 크기 조정. 단위, 벡터/행렬, 복소수 허수부가 포함된 값은 생략됩니다.",
              "parseFailed": "표현식 구문 분석 실패: {message}",
              "invalidRange": "범위는 xmin < xmax로 유한해야 합니다.",
              "noPoints": "플롯 가능한 지점이 없습니다{detail}.",
              "noPointsDetail": "(제외됨: {reasons})",
              "summary": "표시된 점: {count} / {total}",
              "summaryExtra": "/ 제외됨 {items}",
              "reasons": {
                "units": "단위 포함: {count}",
                "composite": "벡터/행렬: {count}",
                "complex": "복소수: {count}"
              }
            },
            "errors": {
              "radixRange": "기수는 2에서 30 사이의 정수여야 합니다.",
              "radixInvalidCharacter": "값에 선택한 기수에 유효하지 않은 문자가 포함되어 있습니다.",
              "expressionParse": "표현을 해석할 수 없습니다. 문자열 또는 math.js 노드를 제공하세요.",
              "notFinite": "값은 유한한 숫자여야 합니다.",
              "numberConversion": "값을 숫자로 변환할 수 없습니다.",
              "positiveRealRequired": "양의 실수가 필요합니다.",
              "complexRealOnly": "복소수의 실수부만 사용할 수 없습니다.",
              "matrixToScalar": "행렬을 스칼라로 변환할 수 없습니다.",
              "arrayToScalar": "배열을 스칼라로 변환할 수 없습니다.",
              "graphUnitsUnsupported": "단위가 있는 값은 그래프로 표시할 수 없습니다.",
              "tetraRealOnly": "tetra는 실수 인수에 대해서만 정의됩니다.",
              "slogPositiveBase": "slog에는 긍정적인 근거와 실제 주장이 필요합니다.",
              "slogBaseSeparated": "1에서 충분히 멀리 떨어진 슬로그 베이스를 선택합니다.",
              "divideByZero": "0으로 나누는 것은 허용되지 않습니다.",
              "integralNotReady": "통합하기 전에 수학 엔진이 초기화될 때까지 기다립니다.",
              "integralSymbolicFailed": "분석 적분을 계산할 수 없습니다. 숫자 통합을 시도해 보세요.",
              "integralRange": "적분 범위는 유한한 실수여야 합니다.",
              "integralBounds": "정적분에 대한 하한과 상한을 모두 제공합니다.",
              "newtonInitialValue": "초기값은 유한한 숫자여야 합니다.",
              "newtonDerivativeZero": "뉴턴의 방법은 실패했습니다. 도함수는 0에 가깝습니다.",
              "iterationDiverged": "반복 계산이 다양해졌습니다.",
              "iterationNotConverged": "지정된 반복 내에서 수렴하지 못했습니다.",
              "linearSolverUnavailable": "선형 방정식 솔버를 사용할 수 없습니다.",
              "systemEquationsArray": "방정식의 배열을 제공합니다.",
              "systemVariableCount": "변수 목록은 방정식 수와 일치해야 합니다.",
              "jacobianSolveFailed": "야코비안 시스템을 풀 수 없습니다.",
              "maximizeFoundMinimum": "검색에서 최대값이 아닌 시작점 근처에서 최소값을 찾았습니다.",
              "minimizeFoundMaximum": "검색에서 최소값이 아닌 시작점 근처에서 최대값을 찾았습니다.",
              "digammaFinite": "디감마에는 유한한 실수 입력이 필요합니다.",
              "digammaPositive": "디감마는 양의 실수 입력에 대해서만 정의됩니다.",
              "polygammaOrder": "폴리감마 차수는 정수 ≥ 0이어야 합니다.",
              "polygammaPositive": "폴리감마는 양의 실수 입력에 대해서만 정의됩니다.",
              "harmonicFirstArg": "고조파에는 정수 n ≥ 1이 필요합니다.",
              "harmonicSecondArg": "고조파의 두 번째 매개변수는 양의 실수여야 합니다.",
              "zetaFinite": "zeta 인수는 유한한 실수여야 합니다.",
              "zetaOneDiverges": "제타(1)은 발산합니다.",
              "zetaPositiveRegion": "이 단순화된 구현은 실수 부분이 양수인 경우에만 정의됩니다.",
              "logGammaFinite": "logGamma에는 유한한 실수 입력이 필요합니다.",
              "logGammaPositive": "logGamma는 양의 실수 입력에 대해서만 정의됩니다.",
              "gammaFinite": "감마에는 유한한 실수 입력이 필요합니다.",
              "gammaPositive": "감마는 양의 실수 입력에 대해서만 정의됩니다.",
              "betaFirstArg": "베타의 첫 번째 인수는 양의 실수여야 합니다.",
              "betaSecondArg": "베타의 두 번째 인수는 양의 실수여야 합니다.",
              "lambertFinite": "LambertW 인수는 유한한 실수여야 합니다.",
              "lambertBranchInteger": "LambertW 분기는 정수여야 합니다.",
              "lambertBranchRange": "이 구현은 분기 0과 -1만 지원합니다.",
              "lambertPrincipalDomain": "LambertW 주요 분기는 x ≥ -1/e에 대해서만 정의됩니다.",
              "lambertNegativeDomain": "LambertW 분기 -1은 -1/e ≤ x < 0에 대해서만 정의됩니다.",
              "lambertNotConverged": "LambertW 계산이 수렴되지 않았습니다.",
              "normalPdfMean": "NormalPdf 평균은 유한한 실수여야 합니다.",
              "normalPdfSigma": "NormalPdf 표준편차는 양의 실수여야 합니다.",
              "normalPdfInput": "NormalPdf 입력은 유한한 실수여야 합니다.",
              "normalCdfMean": "NormalCdf 평균은 유한한 실수여야 합니다.",
              "normalCdfSigma": "NormalCdf 표준편차는 양의 실수여야 합니다.",
              "normalCdfInput": "NormalCdf 입력은 유한한 실수여야 합니다.",
              "normalInvProbability": "NormalInv 확률은 유한한 실수여야 합니다.",
              "normalInvProbabilityRange": "NormalInv 확률은 0 < p < 1을 충족해야 합니다.",
              "normalInvSigma": "NormalInv 표준편차는 양의 실수여야 합니다.",
              "poissonMean": "poissonPmf 평균은 양의 실수여야 합니다.",
              "poissonCount": "poissonPmf 개수는 0보다 큰 정수여야 합니다.",
              "poissonCdfMean": "poissonCdf 평균은 양의 실수여야 합니다.",
              "poissonCdfCount": "poissonCdf 개수는 정수 ≥ 0이어야 합니다.",
              "binomialTrials": "binomialPmf 시행은 정수 ≥ 0이어야 합니다.",
              "binomialSuccesses": "binomialPmf 성공은 정수 ≥ 0이어야 합니다.",
              "binomialProbability": "binomialPmf 성공 확률은 0과 1 사이여야 합니다.",
              "binomialCdfTrials": "binomialCdf 시행은 정수 ≥ 0이어야 합니다.",
              "binomialCdfSuccesses": "binomialCdf 성공은 정수 ≥ 0이어야 합니다.",
              "binomialCdfProbability": "binomialCdf 성공 확률은 0과 1 사이여야 합니다.",
              "logitFinite": "로짓 인수는 유한한 실수여야 합니다.",
              "logitRange": "로짓 인수는 0 < x < 1을 충족해야 합니다.",
              "sigmoidFinite": "시그모이드 인수는 유한한 실수여야 합니다.",
              "factorialNumeric": "계승 인수는 숫자여야 합니다.",
              "factorialFinite": "계승 인수는 유한한 실수여야 합니다.",
              "factorialReal": "계승 논증은 실수여야 합니다.",
              "factorialGreaterThanMinusOne": "계승 인수는 -1보다 커야 합니다.",
              "factorialNegativeInteger": "음의 정수에 대해서는 계승이 정의되지 않습니다.",
              "factorialNonNegativeInteger": "계승 인수는 음수가 아닌 정수여야 합니다.",
              "permutationsRange": "순열의 두 번째 인수는 첫 번째 인수를 초과하지 않는 정수여야 합니다.",
              "permutationsInteger": "순열 인수는 정수 ≥ 0이어야 합니다.",
              "combinationsRange": "조합의 두 번째 인수는 첫 번째 인수를 초과하지 않는 정수여야 합니다.",
              "combinationsSecondArg": "조합의 두 번째 인수는 정수 ≥ 0이어야 합니다.",
              "combinationsInteger": "조합 인수는 정수 ≥ 0이어야 합니다.",
              "lnUnavailable": "자연 로그 함수 ln을 사용할 수 없습니다.",
              "erfcUnavailable": "erfc는 현재 사용할 수 없습니다."
            }
          },
          "calc_combo": {
            "name": "계산 콤보",
            "description": "콤보 EXP를 구축하려면 최대 두 자리의 속사포 연산을 풀어보세요."
          },
          "blockcode": {
            "name": "블록코드 연구실",
            "description": "MiniExp API를 안전하게 스크립팅하기 위해 시각적 블록을 실험해보세요.",
            "defaults": {
              "projectName": "새 프로젝트"
            },
            "categories": {
              "events": "이벤트",
              "actions": "행위",
              "control": "제어",
              "variables": "변수",
              "utility": "공익사업"
            },
            "ui": {
              "title": "블록코드 연구실",
              "variableSelect": {
                "placeholder": "-- 변수 --"
              },
              "workspace": {
                "elseLabel": "그렇지 않으면"
              },
              "stage": {
                "placeholder": "블록을 조립하고 실행을 누르세요."
              },
              "status": {
                "running": "달리기",
                "stopped": "중지됨"
              },
              "toolbar": {
                "snapOn": "스냅: 켜짐",
                "snapOff": "스냅: 꺼짐",
                "speedLabel": "속도 {value}x",
                "undo": "끄르다",
                "redo": "다시 하다",
                "zoomReset": "확대/축소 재설정",
                "gridToggle": "그리드 전환"
              },
              "summary": "{name} · 블록 {blocks} · 변수 {variables}",
              "projectStats": "블록 {blocks} · 변수 {variables}",
              "tabs": {
                "logs": "로그",
                "variables": "가변 시계"
              },
              "buttons": {
                "new": "새로운",
                "save": "구하다",
                "load": "짐",
                "share": "코드 공유",
                "run": "달리다",
                "stop": "멈추다",
                "duplicate": "복제하다",
                "delete": "삭제",
                "cancel": "취소",
                "ok": "좋아요",
                "addVariable": "변수 추가"
              },
              "inputs": {
                "variableName": "변수 이름",
                "variableInitial": "초기값",
                "memo": "메모(선택사항)"
              },
              "alerts": {
                "duplicateVariable": "같은 이름의 변수가 이미 존재합니다.",
                "noSavedProjects": "저장된 프로젝트가 없습니다.",
                "decodeFailed": "공유 코드를 구문 분석하지 못했습니다."
              },
              "prompts": {
                "confirmStopForNew": "프로젝트가 실행 중입니다. 중지하고 새 프로젝트를 만드시겠습니까?",
                "confirmDiscard": "현재 프로젝트를 취소하고 새 프로젝트를 시작하시겠습니까?"
              },
              "messages": {
                "projectCreated": "새 프로젝트를 만들었습니다.",
                "projectSaved": "\"{name}\" 프로젝트를 저장했습니다.",
                "projectLoaded": "\"{name}\" 프로젝트를 로드했습니다.",
                "shareImported": "공유 코드에서 \"{name}\"을(를) 가져왔습니다.",
                "undoUnavailable": "실행 취소는 아직 구현되지 않았습니다.",
                "redoUnavailable": "Redo는 아직 구현되지 않았습니다.",
                "needHat": "시작 이벤트 블록이 필요합니다.",
                "executionStopped": "실행이 중지되었습니다.",
                "runComplete": "실행이 완료되었습니다.",
                "genericError": "오류가 발생했습니다."
              },
              "share": {
                "title": "코드 공유",
                "importLabel": "가져올 공유 코드 붙여넣기",
                "importPlaceholder": "코드 공유",
                "importButton": "수입",
                "copyButton": "코드 복사",
                "copied": "복사되었습니다!"
              },
              "variableList": {
                "initialValue": "이니셜: {value}",
                "empty": "변수가 없습니다."
              },
              "variableTypes": {
                "number": "숫자",
                "string": "끈",
                "boolean": "부울"
              }
            },
            "blocks": {
              "whenGameStarts": {
                "label": "게임이 시작되면",
                "description": "프로젝트가 시작될 때 실행되는 이벤트 핸들러입니다."
              },
              "whenKeyPressed": {
                "label": "{key} 키를 누르면",
                "description": "지정된 키를 누르면 실행됩니다.",
                "inputs": {
                  "key": {
                    "placeholder": "열쇠"
                  }
                }
              },
              "movePlayer": {
                "label": "{steps} 타일만큼 플레이어 이동",
                "description": "샌드박스 플레이어를 이동합니다."
              },
              "setTile": {
                "label": "타일({x}, {y})을 {color}로 설정",
                "description": "무대 타일 색상을 변경합니다.",
                "inputs": {
                  "color": {
                    "placeholder": "#RRGGBB"
                  }
                }
              },
              "waitSeconds": {
                "label": "{seconds}초 동안 기다리세요",
                "description": "지정된 초 동안 기다립니다."
              },
              "repeatTimes": {
                "label": "{count}회 반복",
                "description": "주어진 횟수만큼 반복합니다."
              },
              "foreverLoop": {
                "label": "영원히 반복",
                "description": "안전 반복 제한을 사용하여 반복합니다."
              },
              "ifCondition": {
                "label": "{condition}인 경우",
                "description": "조건이 true일 때 실행됩니다.",
                "inputs": {
                  "condition": {
                    "placeholder": "조건(예: 점수 > 5)"
                  }
                }
              },
              "logMessage": {
                "label": "로그: {message}",
                "description": "로그 탭에 메시지를 출력합니다.",
                "inputs": {
                  "message": {
                    "default": "안녕하세요 MiniExp 입니다!"
                  }
                }
              },
              "awardXp": {
                "label": "XP {amount} 획득",
                "description": "보상 XP."
              },
              "setVariable": {
                "label": "변수 {variable}을(를) {value}(으)로 설정",
                "description": "변수에 값을 할당합니다.",
                "inputs": {
                  "value": {
                    "placeholder": "값 또는 표현"
                  }
                }
              },
              "changeVariable": {
                "label": "{delta}로 변수 {variable} 변경",
                "description": "변수를 증가시키거나 감소시킵니다."
              },
              "broadcast": {
                "label": "{channel} 방송",
                "description": "가상 이벤트를 시작합니다."
              },
              "stopAll": {
                "label": "모든 것을 멈춰라",
                "description": "실행을 중지합니다."
              }
            },
            "worker": {
              "foreverLimit": "{limit} 반복 후 Forever 루프가 중지되었습니다.",
              "broadcast": "방송: {channel}",
              "noStart": "시작 이벤트 블록을 찾을 수 없습니다.",
              "stopped": "실행이 중지되었습니다."
            }
          },
          "video_player": {
            "name": "비디오 플레이어",
            "description": "로컬 파일이나 YouTube 클립을 시청하여 시청 경험치를 축적하세요.",
            "title": "비디오 플레이어",
            "sessionXp": "세션 경험치: {exp}",
            "info": {
              "source": "원천",
              "title": "제목",
              "duration": "지속",
              "status": "상태",
              "sourceLocal": "현지의",
              "sourceYoutube": "유튜브",
              "untitled": "제목 없음"
            },
            "tabs": {
              "local": "로컬 파일",
              "youtube": "유튜브 URL"
            },
            "local": {
              "hint": "브라우저에서 재생할 수 있는 MP4/WebM/Ogg와 같은 비디오를 선택하세요.",
              "noFile": "선택한 파일이 없습니다.",
              "loading": "로컬 동영상 로드 중…"
            },
            "youtube": {
              "placeholder": "https://www.youtube.com/watch?v=...",
              "loadButton": "짐",
              "hint": "YouTube URL 또는 동영상 ID를 입력하세요. IFrame API를 사용할 수 없으면 단순화된 모드가 사용됩니다.",
              "loading": "YouTube 동영상 로드 중…",
              "ready": "YouTube 동영상이 로드되었습니다. 재생을 눌러 시작하세요.",
              "prepared": "유튜브 영상이 준비되었습니다.",
              "simple": "YouTube(간단 모드)가 로드되었습니다.",
              "fallbackTitle": "YouTube 동영상({id})"
            },
            "placeholder": "재생할 동영상을 선택하세요.",
            "status": {
              "noSource": "선택한 소스가 없습니다.",
              "loadingLocal": "로컬 동영상 로드 중…",
              "loadingYoutube": "YouTube 동영상 로드 중…",
              "localReady": "로컬 비디오가 로드되었습니다. 재생을 눌러 시작하세요.",
              "youtubeReady": "YouTube 동영상이 로드되었습니다. 재생을 눌러 시작하세요.",
              "youtubePrepared": "유튜브 영상이 준비되었습니다.",
              "youtubeSimple": "YouTube(간단 모드)가 로드되었습니다.",
              "playing": "재생",
              "paused": "일시중지됨",
              "ended": "재생이 완료되었습니다.",
              "error": "로드 오류",
              "youtubeError": "YouTube 플레이어 오류",
              "buffering": "버퍼링 중…"
            },
            "message": {
              "reselectLocal": "동일한 비디오 파일을 다시 선택하세요.",
              "historyCleared": "시청 기록을 삭제했습니다.",
              "localLoading": "로컬 동영상 로드 중…",
              "localLoaded": "로컬 비디오가 로드되었습니다.",
              "localError": "동영상을 로드하는 중에 오류가 발생했습니다. 다른 파일을 사용해 보세요.",
              "localSelectFile": "동영상 파일을 선택해주세요.",
              "youtubeSimpleLoaded": "단순 모드로 YouTube 동영상을 로드했습니다.",
              "youtubeLoaded": "YouTube 동영상이 로드되었습니다.",
              "youtubeError": "YouTube 동영상을 로드하지 못했습니다.",
              "youtubeInvalid": "유효한 YouTube URL 또는 동영상 ID를 입력하세요."
            },
            "history": {
              "title": "시청 기록",
              "clear": "기록 지우기",
              "empty": "아직 시청한 동영상이 없습니다.",
              "typeLocal": "현지의",
              "typeYoutube": "유튜브",
              "untitled": "제목 없음"
            },
            "shortcuts": {
              "title": "단축키 및 팁",
              "playPause": "스페이스: 재생/일시 중지(API가 있는 로컬 비디오 또는 YouTube)",
              "seek": "← / →: -5/+5초 탐색(로컬 비디오 또는 API가 있는 YouTube)",
              "history": "재생하려면 기록 항목을 클릭하세요. 로컬 비디오에 파일을 다시 선택하라는 메시지가 표시됩니다.",
              "simpleMode": "YouTube 간편 모드에서는 YouTube 플레이어 단축키를 사용하세요."
            }
          },
          "pomodoro": {
            "name": "뽀모도로 타이머",
            "description": "집중과 휴식을 순환하고 EXP 지급을 위한 세션을 마무리합니다."
          },
          "music_player": {
            "name": "뮤직 플레이어",
            "description": "EXP를 수집하려면 비주얼라이저와 EQ를 사용하여 트랙을 가져오고 재생하세요."
          },
          "tester": {
            "name": "JS 테스터",
            "description": "EXP용 JavaScript 기능을 벤치마크하고 블록 모험을 구축합니다.",
            "title": "JS 테스터 / MiniExp MOD",
            "subtitle": "JavaScript 자가 점검, CPU 벤치마크, 블록 기반 어드벤처 메이커를 실행해 보세요.",
            "tabs": {
              "tests": "기능 테스트",
              "benchmark": "CPU 벤치마크",
              "blocks": "블록 어드벤처"
            },
            "tests": {
              "heading": "자바스크립트 자가진단 연구실",
              "description": "탭 한 번으로 대표적인 브라우저 기능을 빠르게 확인할 수 있습니다. 디버깅을 간소화하기 위해 출력을 공유합니다.",
              "runAll": "모두 실행",
              "runSingle": "테스트 실행",
              "running": "달리기…",
              "defs": {
                "numbers": {
                  "name": "숫자/BigInt",
                  "description": "부동 소수점 수학, BigInt 및 Math 도우미를 연습합니다.",
                  "errors": {
                    "bigInt": "BigInt 연산이 기대와 일치하지 않습니다.",
                    "hypot": "Math.hypot이 예상치 못한 값을 반환했습니다."
                  }
                },
                "json": {
                  "name": "JSON 및 구조화된클론",
                  "description": "JSON 직렬화 및 StructuredClone 동작을 검증합니다.",
                  "errors": {
                    "restore": "JSON에서 복원하지 못했습니다.",
                    "clone": "StructuredClone이 맵을 보존할 수 없습니다."
                  }
                },
                "intl": {
                  "name": "국제 형식",
                  "description": "Intl.DateTimeFormat 및 NumberFormat 출력을 확인합니다.",
                  "errors": {
                    "date": "날짜 형식이 예상과 달랐습니다.",
                    "currency": "통화 형식이 예상과 달랐습니다."
                  }
                },
                "crypto": {
                  "name": "암호화 API",
                  "description": "암호화 임의성을 생성하고 샘플 버퍼를 해시합니다.",
                  "errors": {
                    "random": "crypto.getRandomValues를 사용할 수 없습니다."
                  }
                },
                "storage": {
                  "name": "스토리지 API",
                  "description": "localStorage/sessionStorage 읽기 및 쓰기 작업을 확인합니다.",
                  "errors": {
                    "read": "저장소 읽기/쓰기 실패",
                    "blocked": "저장소 액세스가 차단되었습니다."
                  }
                },
                "canvas": {
                  "name": "캔버스 및 오프스크린",
                  "description": "Canvas로 렌더링하고 OffscreenCanvas 지원을 확인하세요.",
                  "errors": {
                    "sample": "캔버스 픽셀을 샘플링하지 못했습니다."
                  }
                }
              }
            },
            "benchmark": {
              "heading": "CPU 벤치마크 – 초당 증가",
              "description": "버스트 성능을 측정하려면 1초 동안 정수에 1을 계속 추가하세요.",
              "labels": {
                "current": "최신(작업/초)",
                "best": "개인 최고 기록(작업/초)",
                "runs": "총 실행"
              },
              "start": "벤치마크 시작(1초)",
              "notice": "벤치마크가 실행되는 동안 UI가 1초 동안 정지될 수 있습니다.",
              "log": {
                "start": "벤치마크 시작 중…",
                "record": "새로운 기록: {value} 작업/초",
                "result": "결과: {value} 작업/초"
              }
            },
            "blocks": {
              "controls": {
                "add": "블록 추가",
                "clear": "모두 지우기"
              },
              "alert": {
                "title": "맞춤 알림 기능",
                "description": "메시지와 컨텍스트를 수신하는 함수의 본문을 작성합니다. 더 풍부한 효과를 얻으려면 context.flags 및 context.log를 사용하세요.",
                "template": "// 메시지: 문자열\\n// 컨텍스트: { flags, log, awardXp }\\nconst box = document.createElement('div');\\nbox.textContent = message;\\nbox.style.padding = '16px';\\nbox.style.Background = 'rgba(96,165,250,0.15)';\\nbox.style.border = '1px 솔리드 rgba(96,165,250,0.4)';\\nbox.style.borderRadius = '12px';\\nbox.style.margin = '6px 0';\\ncontext.log(box);\\n",
                "apply": "적용하다",
                "test": "테스트 실행",
                "statusDefault": "기본값: 로그에 기록합니다. 경고()로 다시 전환할 수 있습니다.",
                "statusApplied": "✅ 사용자 정의 경고 핸들러를 적용했습니다.",
                "statusError": "❌ 오류: {message}",
                "testMessage": "맞춤 알림 테스트입니다.",
                "statusTestSent": "✅ 테스트 메시지를 보냈습니다.",
                "statusTestError": "❌ 런타임 오류: {message}"
              },
              "story": {
                "title": "블록 스토리 러너",
                "play": "플레이 스토리",
                "stop": "멈추다",
                "logStart": "▶ 스토리 시작됨({count} 블록)",
                "logAborted": "⚠ 실행이 중단되었습니다: {message}",
                "logEnd": "■ 스토리 종료",
                "logUserStop": "■ 사용자에 의해 중지됨",
                "logEmpty": "⚠ 정의된 블록이 없습니다."
              },
              "variables": {
                "title": "플래그 뷰어(플래그)",
                "empty": "(비어 있는)"
              },
              "defaults": {
                "choiceQuestion": "당신은 무엇을 할 것인가?",
                "choiceGo": "가다",
                "choiceStop": "멈추다",
                "controlMessage": "진행하다?",
                "yes": "예",
                "no": "아니요",
                "message": "메시지",
                "prompt": "이름을 입력해주세요"
              },
              "text": {
                "placeholder": "표시할 메시지",
                "delivery": {
                  "log": "로그로 보내기",
                  "alert": "맞춤 알림",
                  "both": "둘 다"
                },
                "nextLabel": "다음 블록(# 또는 공백)",
                "nextPlaceholder": "자동으로 진행하려면 비워두세요."
              },
              "choice": {
                "questionPlaceholder": "선택 항목 위에 표시되는 텍스트",
                "storePlaceholder": "선택 사항을 저장하는 변수(예: 선택 사항)",
                "labelPlaceholder": "버튼 라벨",
                "valuePlaceholder": "저장된 가치",
                "targetPlaceholder": "다음 블록 #",
                "addOption": "선택사항 추가",
                "newOption": "새로운 옵션",
                "logLabel": "선택",
                "buttonFallback": "선택하다",
                "logSelection": "▶ 선택 : {value}",
                "noOptions": "※ 선택 항목이 구성되지 않았습니다."
              },
              "set": {
                "namePlaceholder": "변수 이름",
                "valuePlaceholder": "값(문자열)",
                "nextPlaceholder": "다음 블록(공백 = 순차적)"
              },
              "jump": {
                "namePlaceholder": "비교할 변수",
                "equalsPlaceholder": "비교값(문자열)",
                "targetPlaceholder": "일치 시 # 차단",
                "elsePlaceholder": "불일치 시 블록 #(공백 = 다음)"
              },
              "award": {
                "amountPlaceholder": "부여할 EXP(음수 허용)",
                "nextPlaceholder": "다음 블록(공백 = 순차적)"
              },
              "types": {
                "text": "텍스트",
                "choice": "선택",
                "set": "세트",
                "jump": "도약",
                "award": "상",
                "control": "제어"
              },
              "control": {
                "modeLabel": "유형",
                "modeConfirm": "확인(예/아니요)",
                "modePrompt": "입력 필드",
                "messagePlaceholder": "표시할 메시지",
                "storePlaceholder": "결과를 저장할 변수 이름(공백 = 없음)",
                "yesLabel": "예 버튼 라벨",
                "yesValue": "Yes를 선택한 경우 저장되는 값",
                "yesTarget": "예 뒤의 다음 블록 #(공백 = 다음)",
                "noLabel": "아니요 버튼 라벨",
                "noValue": "No를 선택한 경우 저장되는 값",
                "noTarget": "아니요 뒤의 다음 블록 #(공백 = 다음)",
                "labelPrompt": "입력",
                "labelConfirm": "확인하다",
                "okLabel": "확인하다",
                "cancelLabel": "취소",
                "errorRequired": "값을 입력하세요.",
                "errorNumber": "유효한 숫자를 입력하세요.",
                "summaryStored": "▶ {variable} = {value}",
                "summaryValueOnly": "▶ 값 = {value}",
                "summaryCancelStored": "▶ 취소({variable} = {value})",
                "summaryCancel": "▶ 입력이 취소되었습니다.",
                "summaryChoiceStored": "▶ {label} → {variable} = {value} 선택됨",
                "summaryChoice": "▶ {label} 선택됨"
              },
              "prompt": {
                "messagePlaceholder": "입력 필드 앞에 표시되는 텍스트",
                "storePlaceholder": "입력의 변수 이름",
                "inputTypeText": "텍스트",
                "inputTypeNumber": "숫자",
                "defaultValue": "기본값(리터럴)",
                "defaultFrom": "기본값을 제공하는 변수(공백 = 리터럴)",
                "allowEmpty": "빈 입력 허용",
                "okLabel": "확인 버튼 라벨",
                "okTarget": "확인 후 # 차단(공백 = 다음)",
                "cancelLabel": "취소 버튼 라벨",
                "cancelValue": "취소 시 저장된 값",
                "cancelTarget": "취소 후 블록 #(공백 = 다음)"
              },
              "logs": {
                "jumpMatch": "성냥",
                "jumpMismatch": "일치하지 않음",
                "jump": "[점프] {name}={value} => {status}",
                "alertError": "❌ 경고 오류: {message}"
              },
              "errors": {
                "tooManySteps": "실행된 단계가 너무 많습니다. 아마도 루핑?"
              }
            }
          },
          "system": {
            "name": "시스템 검사기",
            "description": "하나의 EXP 지원 대시보드에서 PC, OS, 브라우저 및 네트워크 세부정보를 확인하세요."
          },
          "aim": {
            "name": "조준 트레이너",
            "description": "1~3 EXP로 목표를 달성하고 연속 연속 보너스를 받으세요.",
            "hud": {
              "time": "시간: {time}",
              "hitsAccuracy": "적중: {hits} ACC: {accuracy}%",
              "combo": "콤보 x{combo}"
            },
            "overlay": {
              "timeUp": "타임업",
              "restartHint": "다시 시작하려면 R을 누르세요."
            }
          },
          "dodge_race": {
            "name": "닷지 레이스",
            "description": "거리 EXP를 늘리기 위해 그리드 위험을 헤쳐나가세요."
          },
          "pseudo3d_race": {
            "name": "고속도로 체이서",
            "description": "가상의 3D 고속도로를 달리며 교통량을 추월하고 EXP를 획득하세요."
          },
          "bowling_duel": {
            "name": "볼링 결투",
            "description": "샷을 커브하고 라인을 선택하여 10프레임에 걸쳐 CPU를 능가하세요."
          },
          "topdown_race": {
            "name": "오로라 서킷",
            "description": "하향식 서킷을 주행하고 랩과 완료 순서를 통해 EXP를 획득하세요.",
            "difficulty": {
              "EASY": "쉬운",
              "NORMAL": "정상",
              "HARD": "딱딱한"
            },
            "hud": {
              "title": "오로라 서킷({difficulty})",
              "lap": "랩: <strong>{current}/{total}</strong>(다음 {next})",
              "lapTime": "랩 시간: {time}",
              "bestLap": "최고 랩: {time}",
              "turbo": "터보: {percent}%{active}",
              "turboActive": "(활동적인)",
              "position": "위치: <strong>{position}/{total}</strong>",
              "rivals": "라이벌",
              "rivalLapSuffix": "· 랩 {current}/{total}",
              "secondsSuffix": "에스"
            },
            "overlay": {
              "idlePrompt": "시작을 누르세요",
              "go": "가다!"
            },
            "results": {
              "title": "레이스 결과",
              "totalTime": "총 시간 {time}",
              "headers": {
                "position": "위치",
                "driver": "운전사",
                "finish": "마치다"
              },
              "expSummary": "획득한 경험치: 랩 {lap} / 최고 {best} / 부스트 {boost} / 완료 {finish}",
              "restartHint": "다시 시작하려면 {key}을 누르세요."
            },
            "instructions": {
              "controls": "↑/W: 가속 ↓/S: 브레이크 ←→/A·D: 스티어링<br>스페이스: 터보 R: 재시동"
            },
            "status": {
              "you": "너",
              "dnf": "DNF",
              "fin": "지느러미"
            }
          },
          "falling_shooter": {
            "name": "떨어지는 블록 슈터",
            "description": "하강하는 블록을 폭파하세요. 블록이 클수록 더 많은 경험치를 얻을 수 있습니다."
          },
          "bubble_shooter": {
            "name": "버블 슈터",
            "description": "세 개의 일치하는 색깔의 거품을 발사하고 경험치를 위해 클러스터를 떨어뜨립니다."
          },
          "virus_buster": {
            "name": "바이러스 버스터",
            "description": "색상을 일치하도록 캡슐을 쌓고 바이러스를 닦아 EXP를 얻으세요.",
            "title": "바이러스 버스터",
            "hud": {
              "level": "레벨 {level}",
              "viruses": "바이러스 {count}",
              "cleared": "{count} 삭제됨",
              "chainLabel": "{chain} 체인!",
              "chainNice": "멋진!",
              "chainVirus": "바이러스 x{count}",
              "stageClear": "스테이지 클리어!",
              "controls": "컨트롤: ←→ 이동 / ↓ 소프트 드롭 / ↑ 또는 X 회전 / 스페이스 하드 드롭 / R 재설정"
            },
            "floating": {
              "drop": "떨어지다!",
              "virus": "바이러스 x{count}",
              "stageClear": "스테이지 클리어!"
            },
            "status": {
              "gameOver": "게임 오버",
              "restartHint": "다시 시작하려면 R을 누르세요."
            }
          },
          "sichuan": {
            "name": "사천 퍼즐",
            "description": "두 번 이하로 일치하는 마작 타일을 연결하여 보드를 클리어하세요."
          },
          "piano_tiles": {
            "name": "리듬 타일",
            "description": "콤보 EXP 상승을 유지하려면 시간에 맞춰 4레인 피아노 음을 길게 탭하세요."
          },
          "taiko_drum": {
            "name": "타이코 리듬",
            "description": "클래식 판단과 콤보 EXP 보너스로 두 개의 타이코 드럼 차트를 플레이하세요."
          },
          "river_crossing": {
            "name": "강 건너기",
            "description": "먼 은행에서 잭팟을 터뜨려 EXP 목표를 향해 안전하게 개구리를 전진시키세요."
          },
          "whack_a_mole": {
            "name": "두더지 잡기",
            "description": "두더지를 빠르게 부수고 연속으로 유지하여 추가 경험치를 얻으세요."
          },
          "xp_crane": {
            "name": "XP 크레인 포수",
            "description": "크레인을 작동하여 EXP 캡슐을 획득하고 캐치를 연결하여 보너스를 획득하세요."
          },
          "steady_wire": {
            "name": "꾸준한 와이어",
            "description": "경험치를 수집하기 위해 가장자리를 건드리지 않고 무작위 미로를 추적하세요.",
            "status": {
              "selectControl": "제어 방법을 선택하세요",
              "hitObstacle": "전선에 부딪혔잖아...",
              "clearedWithTime": "클리어! 잘했어요({time}s)",
              "cleared": "클리어! 정말 잘했어요!",
              "leftCourse": "코스를 떠났습니다...",
              "pointerLeft": "포인터가 복도를 떠났습니다…",
              "mouseInstructions": "마우스: 시작 원을 클릭하여 이동을 시작합니다.",
              "keyboardInstructions": "키보드: 화살표 키 또는 WASD로 이동",
              "mouseDrag": "점을 조심스럽게 드래그하세요. 복도 안에 머무르세요."
            },
            "overlay": {
              "modePrompt": "시작하려면 제어 방법을 선택하세요!",
              "retryPrompt": "당신은 가장자리에 부딪쳤다! 다시 시도하시겠습니까?",
              "clearedWithTime": "클리어! {time}초 만에 {difficulty} 완료!",
              "cleared": "클리어! {difficulty}을(를) 정복했습니다!",
              "selectControlFirst": "먼저 제어 방법을 선택하세요",
              "welcome": "스테디 와이어에 오신 것을 환영합니다!\n시작하려면 마우스 또는 키보드 컨트롤을 선택하세요.\n복도에 머물면서 오른쪽 목표에 도달하십시오."
            },
            "buttons": {
              "startMouse": "마우스로 시작",
              "startKeyboard": "키보드로 시작",
              "retrySameMode": "동일한 컨트롤로 다시 시도"
            },
            "difficulty": {
              "label": {
                "easy": "쉬운",
                "normal": "정상",
                "hard": "딱딱한"
              }
            },
            "canvas": {
              "startLabel": "시작",
              "goalLabel": "목표"
            }
          },
          "flappy_bird": {
            "name": "플래피 버드 클론",
            "description": "경험치를 얻기 위해 파이프 틈새를 통과하고 줄무늬를 곱하세요.",
            "ui": {
              "combo": "콤보 {combo}",
              "start": "스페이스바를 누르거나 시작하려면 클릭하세요.",
              "gameOver": "게임 종료",
              "restart": "다시 시작하려면 Space / R을 누르세요.",
              "finalScore": "점수 {formattedScore}"
            }
          },
          "dino_runner": {
            "name": "디노러너",
            "description": "공룡이 되어 장애물을 뛰어넘어 거리를 경험치로 전환하세요."
          },
          "floor_descent": {
            "name": "바닥 하강 생존",
            "description": "EXP를 위해 생존하려면 플랫폼을 사용하여 스파이크 천장에서 내려오세요.",
            "hud": {
              "life": "삶",
              "floor": "{floor}층",
              "best": "최고 {floor}",
              "gameOver": "게임 오버",
              "reachedFloor": "{floor}층에 도달함",
              "retryHint": "다시 시도하려면 스페이스바를 누르세요."
            }
          },
          "treasure_hunt": {
            "name": "보물찾기 던전",
            "description": "다양한 스타일의 던전을 탐험하여 보물을 찾으세요. 경로가 길수록 기본 경험치가 올라가고, 클리어 속도가 빨라지면 기하급수적으로 늘어납니다."
          },
          "forced_scroll_jump": {
            "name": "강제 스크롤 점프",
            "description": "강제 스크롤 단계를 통과하여 더 높은 순위와 경험치를 위해 CX 마크를 수집하세요."
          },
          "tosochu": {
            "name": "돈을 위해 달려라",
            "description": "TV 스타일의 추격전에서 사냥꾼을 피하세요. 버티거나 안전하게 항복하면 막대한 경험치를 획득할 수 있습니다.",
            "ui": {
              "timer": "남은 시간 {seconds}s",
              "exp": "저장된 EXP {exp}",
              "missionNotReady": "임무: 아직 활성화되지 않음",
              "missionActive": "임무: {label}{optionalSuffix} — {seconds}s 남음(좌표: {coords})",
              "missionComplete": "임무 완료: {success}/{total} 성공",
              "missionSuccess": "{label}: 성공했습니다!",
              "missionFailed": "{label}: 실패했습니다…",
              "surrender": "항복",
              "surrenderCountdown": "항복합니다...{seconds}s"
            },
            "status": {
              "hunterAdded": "사냥꾼이 추격에 합류했습니다!",
              "hunterRetreat": "미션 성공! 사냥꾼 한 명이 퇴각했다",
              "missionActivated": "활성화된 임무: {label}",
              "escapeSuccess": "탈출했어요! +{total} EXP(내역 {base}+{bonus})",
              "surrenderSuccess": "항복했습니다. 은행에 {exp} EXP",
              "caught": "잡혔습니다... 경험치를 획득하지 못했습니다.",
              "dungeonUnavailable": "던전 API를 사용할 수 없습니다",
              "stageGenerationFailed": "단계를 생성하지 못했습니다.",
              "runStart": "추격전이 시작됩니다!",
              "runPaused": "일시중지됨",
              "standby": "대기",
              "surrenderZoneHint": "버튼을 누르기 전에 항복 구역에 들어가세요",
              "surrenderAttempt": "항복을 시도합니다… {duration}s 동안 견뎌보세요!",
              "surrenderCancelled": "항복이 취소되었습니다.",
              "beaconSuccess": "비콘 확보! 신호 방해 강화",
              "beaconFail": "비콘이 실패했습니다... 사냥꾼들이 경계하고 있습니다",
              "dataSuccess": "기밀 정보를 확보했습니다! 보상 증가",
              "dataFail": "경보가 발동되었습니다! 빠른 사냥꾼이 나타났다",
              "boxSuccess": "무장해제! 헌터박스가 지연되네요",
              "boxFail": "무장해제 실패...추가 사냥꾼 배치",
              "vaultSuccess": "공동 자금! 하지만 이제 당신은 주요 목표입니다",
              "vaultFail": "Vault 방어... 사냥꾼 2명 석방"
            },
            "missions": {
              "optionalSuffix": "(선택 과목)",
              "beacon": {
                "label": "비콘에 도달하세요"
              },
              "data": {
                "label": "데이터 터미널 해킹"
              },
              "box": {
                "label": "헌터박스를 무장 해제하세요"
              },
              "vault": {
                "label": "고위험 금고를 크랙하세요"
              }
            }
          },
          "sanpo": {
            "name": "산책",
            "description": "무작위로 생성된 던전을 산책하며 걸음 수 ×1 EXP를 획득하세요.",
            "ui": {
              "regenerate": "스테이지 재생성",
              "zoomLabel": "줌",
              "minimapTitle": "미니맵",
              "stageInfo": "타입: {type} / 크기: {size} / 타일: {tileSize}",
              "seedInfo": "시드: {seed}",
              "stepsInfo": "걸음 수: {steps}",
              "stageInfoEmpty": "타입: -",
              "seedInfoEmpty": "시드: -",
              "stepsInfoEmpty": "걸음 수: 0",
              "zoomInfo": "줌: {value}x",
              "zoomDisplay": "{value}x",
              "hideMap": "미니맵 끄기",
              "showMap": "미니맵 켜기",
              "status": {
                "paused": "일시 정지",
                "walk": "산책 중… WASD/화살표 키로 이동하세요. M으로 미니맵, [ / ]로 줌을 조절하세요.",
                "noApi": "던전 API를 사용할 수 없습니다",
                "generating": "스테이지 생성 중…",
                "failed": "스테이지 생성에 실패했습니다",
                "ready": "준비 완료! 시작을 눌러 산책을 시작하세요.",
                "initializing": "불러오는 중…"
              }
            }
          },
          "ten_ten": {
            "name": "1010 퍼즐",
            "description": "라인을 클리어하기 위해 블록을 배치하고 크로스 클리어를 통해 EXP를 두 배로 늘리세요.",
            "hint": "블록을 보드로 드래그하거나 R을 눌러 다시 시작하세요.",
            "hud": {
              "lines": "라인: {total} / 가장 큰 클리어: {max}",
              "moves": "이동 횟수: {moves} / 남은 블록: {remaining}",
              "combo": {
                "base": "콤보: {combo} (최대 {max}) / XP: {xp}",
                "detail": "/ 마지막: +{lastXp}XP({lines}줄)"
              }
            },
            "end": {
              "title": "게임 오버",
              "reasons": {
                "noSpace": "사용 가능한 공간이 없습니다.",
                "generationFailed": "배치 가능한 조각을 생성할 수 없습니다"
              },
              "retryHint": "다시 시작하려면 R을 누르세요."
            },
            "shelf": {
              "refilling": "조각을 채우는 중..."
            },
            "errors": {
              "cannotGenerate": "배치 가능한 조각을 생성할 수 없습니다"
            }
          },
          "trump_games": {
            "name": "트럼프 선택",
            "description": "EXP를 위해 Concentration, Blackjack, Old Maid 등의 카드 게임 허브를 플레이하세요."
          },
          "gamble_hall": {
            "name": "갬블 홀",
            "description": "룰렛과 파치슬로에서 영감을 받은 기계에 EXP를 베팅하세요."
          },
          "electro_instrument": {
            "name": "전자악기 스튜디오",
            "description": "다양한 음색을 갖춘 가상 키보드를 연주해 연주당 EXP를 획득하세요."
          },
          "graphics_tester": {
            "name": "3D 그래픽 테스터",
            "description": "EXP에 대한 벤치마크를 위해 시각적 데모와 광선 추적 스타일 렌더링을 실행하세요."
          },
          "graphicsTester": {
            "title": "3D 그래픽 테스터",
            "badges": {
              "webgl2": "WebGL2",
              "rayMarching": "레이 행진",
              "benchmark": "기준"
            },
            "errors": {
              "webgl2Unavailable": "WebGL2를 사용할 수 없습니다",
              "webglInitFailed": "WebGL2 컨텍스트를 초기화하지 못했습니다."
            },
            "gpuInfo": {
              "title": "GPU 정보",
              "unsupported": {
                "message": "WebGL2가 지원되지 않거나 비활성화되었습니다.",
                "description": "이 모듈에는 WebGL2 지원 장치 또는 브라우저가 필요합니다. WebGL2를 활성화하거나 호환되는 브라우저를 사용해 보세요."
              },
              "unknown": "알려지지 않은",
              "antialias": {
                "enabled": "에",
                "disabled": "끄다"
              },
              "entries": {
                "vendor": "공급업체: {value}",
                "renderer": "렌더러: {value}",
                "version": "WebGL: {value}",
                "shading": "GLSL: {value}",
                "maxTextureSize": "최대 텍스처 크기: {value}",
                "maxCubeMap": "최대 큐브 지도: {value}",
                "textureUnits": "텍스처 단위: {value}",
                "antialias": "앤티앨리어싱: {value}"
              }
            },
            "controls": {
              "demoSelect": {
                "label": "데모",
                "options": {
                  "objectLab": "개체 랩(배치 데모)",
                  "ray": "광선 추적 스타일 데모",
                  "gallery": "기술 갤러리"
                },
                "note": "드래그하여 궤도를 그리며 스크롤하여 확대/축소합니다. 광선 추적 데모는 GPU를 많이 사용하므로 벤치마킹하기 전에 다른 탭을 닫으세요."
              },
              "objectLab": {
                "title": "개체 배치",
                "actions": {
                  "addCube": "큐브 추가",
                  "addSphere": "구 추가",
                  "addCylinder": "원통 추가",
                  "clear": "모두 지우기",
                  "autoRotate": "자동 회전"
                },
                "autoRotateState": {
                  "on": "에",
                  "off": "끄다"
                },
                "logs": {
                  "addCube": "큐브를 추가했습니다.",
                  "addSphere": "구체를 추가했습니다.",
                  "addCylinder": "실린더를 추가했습니다.",
                  "cleared": "게재위치가 삭제되었습니다.",
                  "autoRotate": "자동 회전: {state}"
                }
              },
              "ray": {
                "title": "광선 추적 설정",
                "bounces": "반송 횟수",
                "exposure": "노출"
              },
              "gallery": {
                "title": "기술 갤러리 컨트롤",
                "description": "링 인스턴싱, 다이내믹 모션 블러, 머티리얼 효과를 살펴보세요."
              },
              "benchmark": {
                "title": "기준",
                "start": "6초 벤치마크 실행"
              }
            },
            "log": {
              "demoSwitch": "전환된 데모: {label}",
              "benchmarkStart": "벤치마크 시작(고부하)",
              "benchmarkResult": "평균 FPS: {fps} / 그려진 개체: {count}"
            },
            "overlay": {
              "fps": "FPS: {value}",
              "objects": "개체: {count}",
              "bounces": "반송: {count}",
              "gallery": "갤러리 데모"
            }
          },
          "physics_sandbox": {
            "name": "물리 샌드박스",
            "description": "재미있는 물리학 실험실에서 불, 물, 덩굴, 번개, 회로를 결합하세요."
          },
          "populite": {
            "name": "인기 있는",
            "description": "지형을 재형성하고 추종자들을 안내하여 EXP 인구 목표를 달성하세요."
          },
          "logic_circuit": {
            "name": "논리 회로 시뮬레이터",
            "description": "EXP의 논리 시스템을 시뮬레이션하기 위해 입력, 게이트 및 출력을 연결합니다."
          },
          "circuit_simulator": {
            "name": "전기 회로 시뮬레이터",
            "description": "EXP 실험을 위해 계측기와 부품으로 DC/AC 회로를 구축하세요."
          },
          "memo_studio": {
            "name": "메모리 스튜디오",
            "description": "EXP에 대한 기억력을 강화하기 위해 간격을 두고 반복하는 플래시 카드를 공부하세요.",
            "title": "메모리 스튜디오",
            "badge": "장난감 모드",
            "controls": {
              "addDeck": "+ 덱 추가",
              "export": "내보내기(JSON)",
              "import": "가져오기(JSON)"
            },
            "filters": {
              "tag": {
                "label": "태그 필터",
                "placeholder": "쉼표로 구분된 태그를 입력하세요."
              }
            },
            "form": {
              "title": "카드등록",
              "fields": {
                "front": "전면(프롬프트)",
                "back": "뒤로 (답변)",
                "hint": "힌트/설명(선택)",
                "tags": "태그(쉼표로 구분)",
                "interval": "초기 간격(일)"
              },
              "preview": {
                "label": "뒤로 미리보기",
                "empty": "텍스트를 입력하면 미리보기가 나타납니다."
              },
              "submit": "카드 추가",
              "validation": {
                "missingSides": "앞면과 뒷면이 필요합니다."
              }
            },
            "review": {
              "controls": {
                "show": "드러내다",
                "good": "알았어요",
                "hard": "딱딱한",
                "again": "다시 배우기",
                "note": "메모"
              },
              "deckName": "{name} ({count} 카드)",
              "noDeck": "선택된 덱이 없습니다.",
              "queueInfo": "{count} 남음",
              "empty": "검토할 카드가 없습니다. 카드를 추가하거나 가져옵니다.",
              "hintPrefix": "힌트:"
            },
            "dialogs": {
              "addDeck": {
                "prompt": "새 데크의 이름을 입력합니다.",
                "defaultName": "새로운 덱"
              }
            },
            "import": {
              "error": {
                "invalidJson": "JSON을 구문 분석하지 못했습니다.",
                "read": "파일을 읽지 못했습니다."
              }
            },
            "sparkline": {
              "tooltip": "{date} / 검토됨 {reviewed} / 정확도 {accuracy}% / {xp} XP",
              "empty": "기록 없음"
            },
            "deck": {
              "empty": "아직 데크가 없습니다. 하나를 추가하세요.",
              "defaultName": "새로운 덱",
              "metrics": {
                "total": "{count} 카드",
                "due": "마감일 {count}",
                "accuracy": "정확도 {percent}%"
              }
            },
            "hud": {
              "reviewed": {
                "label": "검토됨",
                "value": "{count} 카드"
              },
              "accuracy": {
                "label": "정확성",
                "value": "{percent}%"
              },
              "sessionXp": {
                "label": "세션 EXP",
                "value": "{xp} XP"
              },
              "elapsed": {
                "label": "경과됨",
                "value": "{minutes}분 {secondsPadded}초"
              }
            },
            "note": {
              "title": "{front}에 대한 메모",
              "actions": {
                "cancel": "닫다",
                "save": "구하다"
              }
            },
            "defaults": {
              "deckName": "스타터 덱",
              "tags": {
                "web": "편물"
              },
              "cards": {
                "html": {
                  "front": "HTML",
                  "back": "하이퍼텍스트 마크업 언어",
                  "hint": "웹페이지의 구조"
                },
                "css": {
                  "front": "CSS",
                  "back": "계단식 스타일 시트",
                  "hint": "스타일 프리젠테이션"
                },
                "javascript": {
                  "front": "자바스크립트",
                  "back": "브라우저에서 실행되는 프로그래밍 언어",
                  "hint": "인터랙티브"
                }
              }
            }
          },
          "onigokko": {
            "name": "태그 이스케이프",
            "description": "혼합 던전을 뛰어다니며 추격자를 피하고 살아남아 EXP를 획득하세요.",
            "timer": {
              "remaining": "남은 시간: {seconds}s"
            },
            "status": {
              "start": "추격 시작! 화살표 키/WASD로 이동합니다.",
              "paused": "일시중지됨",
              "loading": "로딩 단계…",
              "ready": "준비가 된! 추적을 시작하려면 시작을 누르세요.",
              "stage_generation_failed": "단계 생성 실패",
              "api_unavailable": "던전 API를 사용할 수 없습니다",
              "caught": "잡았다!",
              "caught_no_reward": "잡았다! 경험치 획득이 없습니다.",
              "escaped": "탈출했어요! 정말 잘했어요!",
              "escape_success": "탈출 성공!"
            }
          },
          "darumasan": {
            "name": "다루마산가 코론다",
            "description": "지켜보는 동안 얼어붙고 들키지 않고 앞으로 돌진하여 경험치 50을 획득하세요."
          },
          "acchimuitehoi": {
            "name": "이쪽을 보세요",
            "description": "반응 결투에서 승리하세요. 공격하면 경험치 15를 받고 방어하면 경험치 5를 얻습니다."
          },
          "janken": {
            "name": "가위바위보",
            "description": "클래식 잔켄을 플레이하고 승리할 때마다 경험치 10을 획득하세요."
          },
          "typing": {
            "name": "타이핑 챌린지",
            "description": "60초 동안 정확하게 입력하여 WPM과 EXP를 누릅니다.",
            "controls": {
              "difficulty": "어려움",
              "target": "목표 WPM",
              "targetValue": "{targetWpm} WPM",
              "difficultyOptions": {
                "easy": "쉬운",
                "normal": "정상",
                "hard": "딱딱한"
              }
            },
            "words": {
              "nextEmpty": "다음: -",
              "nextWithValue": "다음: {word}"
            },
            "input": {
              "placeholder": "표시된 단어를 입력하세요(확인하려면 스페이스바/Enter)"
            },
            "buttons": {
              "reset": "다시 놓기",
              "retry": "다시 시도해 보세요"
            },
            "stats": {
              "labels": {
                "accuracy": "ACC",
                "wpm": "WPM",
                "combo": "콤보",
                "sessionXp": "세션 XP"
              },
              "targetInfo": {
                "pending": "목표 {targetWpm} WPM / 진행률 -",
                "active": "목표 {targetWpm} WPM / 진행률 {progress}%"
              }
            },
            "result": {
              "title": "결과",
              "labels": {
                "accuracy": "정확성",
                "wpm": "평균 WPM",
                "words": "올바른 문자",
                "combo": "최대 콤보"
              },
              "wordsValue": "{count}자"
            },
            "xp": {
              "title": "경험치 내역",
              "none": "이번 실행에서는 EXP를 얻지 못했습니다.",
              "wordLabel": "단어 {index}",
              "word": "{label}: +{xp} 경험치",
              "wordWithMilestones": "{label}: +{xp} 경험치({milestones})",
              "milestoneEntry": "x{combo}+{bonus}",
              "milestoneSeparator": ",",
              "accuracyLabel": "정확도 보너스({accuracyPercent}%)",
              "accuracy": "{label}: +{xp} 경험치",
              "generic": "+{xp} 경험치"
            },
            "toasts": {
              "start": "60초 챌린지가 시작되었습니다! 행운을 빌어요!",
              "mistype": "잘못 입력했어요!",
              "completeBeforeConfirm": "확인하기 전에 전체 단어를 입력하세요!",
              "comboMilestone": "콤보 x{combo}! +{bonus} EXP",
              "comboSeparator": "/"
            }
          },
          "imperial_realm": {
            "name": "제국 왕국",
            "description": "마을 주민과 군대에 명령을 내려 파도를 견디고 적의 요새를 무너뜨려 경험치를 얻으세요."
          }
        },
        "logicCircuit": {
          "categories": {
            "input": "입력",
            "gate": "문",
            "wiring": "배선",
            "composite": "합성물",
            "sequential": "잇달아 일어나는",
            "measurement": "측정",
            "output": "산출",
            "other": "다른",
            "misc": "다른"
          },
          "common": {
            "high": "높은",
            "low": "낮은",
            "on": "에",
            "off": "끄다",
            "set": "세트",
            "reset": "다시 놓기",
            "neutral": "---",
            "metastable": "준안정",
            "metastableIndicator": "S=R=1(잘못됨)",
            "metastableMessage": "S와 R이 모두 1입니다. 출력이 불안정합니다.",
            "warning": "경고",
            "toggleState": "상태 전환",
            "previousClock": "이전 시계",
            "periodMs": "기간(밀리초)",
            "outLabel": "종료: {value}",
            "muxStatus": "출발:{out}(SEL={sel})"
          },
          "chips": {
            "sessionXp": "세션 경험치: {value}",
            "elapsedTime": "경과 시간: {value}ms"
          },
          "ui": {
            "title": "논리 회로 시뮬레이터",
            "subtitle": "입력과 게이트를 배열하여 조합 논리를 실시간으로 검증합니다.",
            "clearCanvas": "캔버스 재설정",
            "clearTool": "도구 지우기(Esc)",
            "step": "⏭ 단계",
            "stepLabel": "단계(밀리초)",
            "pause": "⏸ 일시 정지",
            "resume": "▶ 이력서",
            "sessionXp": "세션 경험치: {value}",
            "elapsedTime": "경과 시간: {value}ms"
          },
          "hints": {
            "board": "도구를 선택하고 캔버스의 빈 곳을 클릭하여 배치합니다. 출력 포트를 클릭한 다음 입력 포트를 클릭하여 와이어를 그립니다. 선택한 구성 요소를 제거하려면 삭제를 누르세요.",
            "wires": "와이어 경로를 클릭하여 제거합니다. Alt 키를 누른 채 입력 포트를 클릭하면 들어오는 와이어를 분리할 수 있습니다.",
            "footer": "팁: 입력을 전환하여 결과를 즉시 검사하세요. 시뮬레이션을 일시 중지하거나 단계적으로 진행하여 순차적 동작을 분석합니다."
          },
          "inspector": {
            "title": "구성요소 검사기",
            "empty": "구성 요소를 선택하면 세부 정보와 최대 3개의 입력에 대해 자동 생성된 진리표를 볼 수 있습니다.",
            "truthTitle": "진리표",
            "connectionCount": "{count}줄",
            "delayValue": "{value} ns",
            "clockPeriodValue": "{value}밀리초",
            "truthTable": {
              "input": "IN{index}"
            },
            "fields": {
              "id": "ID",
              "type": "유형",
              "inputs": "입력 포트",
              "outputs": "출력 포트",
              "lastInputs": "마지막 입력",
              "lastOutputs": "마지막 출력",
              "inputConnections": "입력 연결",
              "outputConnections": "출력 연결",
              "delay": "전파 지연(대략)",
              "description": "설명"
            }
          },
          "truthTable": {
            "out": "밖으로"
          },
          "ports": {
            "output": "출력 #{index}",
            "input": "#{index}을 입력하세요."
          },
          "components": {
            "toggle": {
              "label": "입력 전환",
              "description": "클릭하면 ON/OFF가 전환되는 기본 입력",
              "buttonOn": "켜다",
              "buttonOff": "끄다"
            },
            "clock": {
              "label": "시계",
              "description": "고정된 간격으로 진동하는 클록 입력"
            },
            "const_high": {
              "label": "상수 1",
              "description": "항상 HIGH를 출력하는 상수 소스"
            },
            "constHigh": {
              "label": "상수 1",
              "description": "항상 HIGH를 출력하는 상수 소스"
            },
            "const_low": {
              "label": "상수 0",
              "description": "항상 LOW를 출력하는 상수 소스"
            },
            "constLow": {
              "label": "상수 0",
              "description": "항상 LOW를 출력하는 상수 소스"
            },
            "buffer": {
              "label": "완충기",
              "description": "입력을 있는 그대로 출력하는 버퍼"
            },
            "not": {
              "label": "아니다",
              "description": "입력을 반전시키는 NOT 게이트"
            },
            "and": {
              "label": "그리고",
              "description": "모든 입력이 HIGH일 때 HIGH를 출력합니다."
            },
            "nand": {
              "label": "낸드",
              "description": "반전된 AND 게이트"
            },
            "or": {
              "label": "또는",
              "description": "입력이 HIGH이면 HIGH를 출력합니다."
            },
            "nor": {
              "label": "도 아니다",
              "description": "반전된 OR 게이트"
            },
            "xor": {
              "label": "XOR",
              "description": "HIGH 입력 개수가 홀수개일 때 HIGH를 출력합니다."
            },
            "xnor": {
              "label": "XNOR",
              "description": "반전된 XOR 게이트"
            },
            "splitter": {
              "label": "쪼개는 도구",
              "description": "하나의 입력을 여러 출력에 복제"
            },
            "mux2": {
              "label": "2:1 MUX",
              "description": "선택 신호로 제어되는 2입력 멀티플렉서"
            },
            "decoder2": {
              "label": "2-4 디코더",
              "description": "2비트 입력에서 원-핫 출력을 생성하는 디코더"
            },
            "d_ff": {
              "label": "D 플립플롭",
              "description": "상승 클록에서 D를 래치하는 에지 트리거 플립플롭(비동기 재설정 사용)",
              "inspect": {
                "0": {
                  "label": "래치 상태"
                },
                "1": {
                  "label": "이전 시계"
                }
              }
            },
            "dff": {
              "label": "D 플립플롭",
              "description": "상승 클록에서 D를 래치하는 에지 트리거 플립플롭(비동기 재설정 사용)",
              "indicator": "Q={q} / Q̅={qbar}",
              "status": "질문={value}",
              "inspectLatch": "래치 상태"
            },
            "sr_latch": {
              "label": "SR 래치",
              "description": "기본 NOR SR 래치. S 세트, R 재설정.",
              "inspect": {
                "0": {
                  "label": "경고"
                }
              }
            },
            "srLatch": {
              "label": "SR 래치",
              "description": "기본 NOR SR 래치. S 세트, R 재설정.",
              "qStatus": "질문={value}"
            },
            "t_ff": {
              "label": "T 플립플롭",
              "description": "T 입력이 HIGH일 때 각 상승 클록 에지에서 출력을 토글합니다. 리셋 입력을 포함합니다.",
              "inspect": {
                "0": {
                  "label": "상태 전환"
                },
                "1": {
                  "label": "이전 시계"
                }
              }
            },
            "tff": {
              "label": "T 플립플롭",
              "description": "T 입력이 HIGH일 때 각 상승 클록 에지에서 출력을 토글합니다. 리셋 입력을 포함합니다.",
              "status": "질문={value}"
            },
            "probe": {
              "label": "조사",
              "description": "입력 값을 모니터링하는 측정 노드"
            },
            "led": {
              "label": "주도의",
              "description": "입력이 HIGH일 때 켜집니다."
            }
          }
        },
        "difficulty": {
          "label": "어려움",
          "easy": "쉬운",
          "normal": "정상",
          "hard": "딱딱한"
        },
        "start": "시작",
        "pause": "정지시키다",
        "resume": "재개하다",
        "restart": "재개/다시 시작",
        "quit": "그만두다",
        "hud": {
          "level": "레벨",
          "sp": "SP",
          "expLabel": "경험치"
        },
        "placeholder": {
          "default": "왼쪽 목록에서 미니게임을 선택하세요.",
          "loading": "로드 중...",
          "loadFailed": "로드하지 못했습니다.",
          "chooseFromCategory": "카테고리에서 게임을 선택하세요.",
          "gameLoading": "미니게임 로딩 중...",
          "gameLoadFailed": "미니게임을 불러오지 못했습니다.",
          "gameStartFailed": "미니게임을 시작하지 못했습니다.",
          "selected": "{name}을(를) 선택했습니다.",
          "chooseSequence": "카테고리를 선택한 다음 게임을 선택하세요."
        },
        "records": {
          "bestScore": "최고 점수",
          "totalPlays": "총 플레이 수",
          "totalExp": "총 획득 경험치",
          "totalExpValue": "{sign}{value}"
        }
      }
    },
    "minigame": {
      "random_tool": {
        "title": "랜덤 툴킷",
        "subtitle": "주사위, 룰렛, 목록 추첨, 난수/문자열 생성을 한곳에 모은 편리한 도구입니다.",
        "tabs": {
          "dice": "주사위",
          "roulette": "룰렛",
          "choice": "무작위 선택",
          "text": "랜덤 텍스트",
          "number": "무작위 숫자"
        },
        "dice": {
          "countLabel": "주사위 개수",
          "roll": "주사위 굴리기",
          "placeholder": "주사위를 굴리면 결과가 표시됩니다.",
          "summary": "결과: <strong>{values}</strong>",
          "total": "합계 <strong>{total}</strong>",
          "xp": "+{xp} EXP 획득!"
        },
        "roulette": {
          "spin": "룰렛 돌리기",
          "spinning": "회전 중…",
          "placeholder": "이름과 EXP를 설정한 뒤 룰렛을 돌리세요.",
          "addSegment": "섹션 추가",
          "namePlaceholder": "이름",
          "xpPlaceholder": "EXP",
          "removeSegment": "이 섹션 삭제",
          "noSegments": "최소 한 개 이상의 섹션을 추가하세요.",
          "defaultName": "EXP100",
          "result": "결과: <strong>{name}</strong>",
          "xp": "+{xp} EXP 획득!"
        },
        "choice": {
          "placeholder": "행마다 하나씩 옵션을 입력",
          "pick": "무작위 선택",
          "resultPlaceholder": "버튼을 눌러 결과를 확인하세요.",
          "empty": "옵션이 없습니다. 위에 추가하세요.",
          "result": "선택 결과: <strong>{choice}</strong>"
        },
        "text": {
          "lengthLabel": "길이",
          "charactersTitle": "사용할 문자",
          "additionalOptions": "추가 설정",
          "lowercase": "소문자 (a-z)",
          "uppercase": "대문자 (A-Z)",
          "numbers": "숫자 (0-9)",
          "symbols": "기호 (!@# 등)",
          "includeSpaces": "공백 포함(텍스트 생성 전용)",
          "allowAmbiguous": "헷갈리는 문자 포함 (O/0/I/1/| 등)",
          "customLabel": "추가 문자",
          "customPlaceholder": "추가할 문자를 입력",
          "customHelper": "중복 문자는 자동으로 제거되며 최대 200자까지 가능합니다.",
          "generatePassword": "비밀번호 생성",
          "generateText": "텍스트 생성",
          "resultHeading": "생성 결과",
          "passwordLabel": "비밀번호 생성 결과",
          "textLabel": "텍스트 생성 결과",
          "placeholder": "생성된 문자열이 여기에 표시됩니다.",
          "copy": "복사",
          "errorNoCharset": "최소 한 가지 문자 종류를 선택하세요.",
          "errorLength": "선택한 문자 종류에는 최소 {min}자 이상이 필요합니다.",
          "copied": "클립보드에 복사했습니다!",
          "copyFailed": "복사에 실패했습니다."
        },
        "number": {
          "minLabel": "최소값",
          "maxLabel": "최대값",
          "generate": "숫자 생성",
          "placeholder": "범위를 설정한 후 숫자를 생성하세요.",
          "invalid": "범위가 올바르지 않습니다.",
          "result": "결과: <strong>{value}</strong>"
        }
      }
    },
    "achievements": {
      "categories": {
        "dungeon": "지하 감옥",
        "blockdim": "블록 차원",
        "hatena": "하테나 블록",
        "tools": "도구",
        "mini": "미니게임"
      },
      "messages": {
        "categoryComingSoon": "성과가 곧 나올 예정입니다.",
        "emptyCategory": "아직 등록된 업적이 없습니다."
      },
      "status": {
        "comingSoon": "출시 예정",
        "unlocked": "잠금 해제됨",
        "locked": "잠김"
      },
      "rewardMemo": "보상 메모: {reward}",
      "difficulty": {
        "unplayed": "지워지지 않음",
        "labels": {
          "veryEasy": "매우 쉬움",
          "easy": "쉬운",
          "normal": "정상",
          "second": "두번째",
          "hard": "딱딱한",
          "veryHard": "매우 단단함"
        }
      },
      "summary": {
        "comingSoon": "출시 예정",
        "categoryRatio": "{unlocked}/{total}",
        "highlights": {
          "playTime": "총 플레이 시간",
          "dungeonsCleared": "던전 클리어",
          "highestDifficulty": "최고 난이도",
          "totalExp": "총 경험치",
          "totalExpValue": "{value} 경험치",
          "hatenaTriggered": "하테나 활성화",
          "hatenaTriggeredValue": "{value}회",
          "hatenaPositiveRate": "하테나 긍정률",
          "hatenaPositiveRateValue": "{value}%"
        }
      },
      "meta": {
        "repeatableCount": "총 완료 횟수: {count}",
        "counterCount": "개수: {count}"
      },
      "progress": {
        "ratio": "{current} / {target}",
        "floorRatio": "{current}F / {target}F",
        "bossDefeated": "{count} 보스 패배",
        "nextRuns": "{count}은 다음 마일스톤까지 실행됩니다.",
        "completed": "완전한!",
        "remaining": "{count} 더 남았습니다",
        "actions": "{count} 작업",
        "duration": {
          "full": "{hours}시간 {minutesValue}분 {secondsValue}초",
          "minutes": "{minutes}분 {secondsValue}초",
          "seconds": "{seconds}s",
          "ratio": "{current} / {target}"
        }
      },
      "stats": {
        "sections": {
          "core": {
            "title": "던전 기록"
          },
          "blockdim": {
            "title": "블록 차원 레코드"
          },
          "hatena": {
            "title": "하테나 블록 레코드"
          },
          "tools": {
            "title": "도구 사용법"
          },
          "addons": {
            "title": "애드온 상태"
          }
        },
        "entries": {
          "core": {
            "playTime": {
              "label": "총 플레이 시간",
              "description": "게임이 실행된 총 시간입니다."
            },
            "totalSteps": {
              "label": "총 단계",
              "description": "지금까지 이동한 총 타일 수입니다.",
              "value": "{value} 타일"
            },
            "floorsAdvanced": {
              "label": "플로어 고급",
              "description": "층계는 계단을 통해 올라갔습니다."
            },
            "highestFloorReached": {
              "label": "가장 깊은 층에 도달함",
              "description": "지금까지 도달한 가장 깊은 층.",
              "value": "{value}층"
            },
            "dungeonsCleared": {
              "label": "던전 클리어",
              "description": "일반 및 블록 차원 던전의 총 클리어 수입니다."
            },
            "enemiesDefeated": {
              "label": "적 처치",
              "description": "패배한 적의 총 수입니다."
            },
            "bossesDefeated": {
              "label": "보스 처치",
              "description": "패배한 총 보스 수입니다."
            },
            "totalExpEarned": {
              "label": "총 획득 경험치",
              "description": "탐험과 미니게임을 통해 얻은 경험치입니다.",
              "value": "{value} 경험치"
            },
            "damageDealt": {
              "label": "총 피해량",
              "description": "적에게 입힌 총 피해량입니다."
            },
            "damageTaken": {
              "label": "받은 총 피해",
              "description": "적과 위험 요소로부터 받은 총 피해입니다."
            },
            "chestsOpened": {
              "label": "상자 열림",
              "description": "실행 중에 열리는 상자 수입니다."
            },
            "rareChestsOpened": {
              "label": "희귀 상자 열림",
              "description": "열린 희귀 상자 수입니다."
            },
            "normalChestsOpened": {
              "label": "일반 상자 열림",
              "description": "열린 표준 상자 수."
            },
            "healingItemsUsed": {
              "label": "사용된 힐링 아이템",
              "description": "물약이나 HP 부스트가 사용된 횟수입니다."
            },
            "autoItemsTriggered": {
              "label": "자동 항목이 트리거됨",
              "description": "자동 회복 아이템이 활성화된 횟수입니다."
            },
            "deaths": {
              "label": "패배",
              "description": "게임 오버 횟수."
            },
            "highestDifficultyIndex": {
              "label": "클리어 난이도 최고",
              "description": "지금까지의 최고 난이도를 클리어했습니다."
            }
          },
          "blockdim": {
            "gatesOpened": {
              "label": "게이트 활성화",
              "description": "Gate를 통해 블록 차원이 입력된 횟수입니다."
            },
            "bookmarksAdded": {
              "label": "북마크가 추가됨",
              "description": "저장된 블록 차원 북마크 수입니다."
            },
            "randomSelections": {
              "label": "무작위 선택",
              "description": "동일 가중치 무작위 선택이 사용된 횟수입니다."
            },
            "weightedSelections": {
              "label": "가중치가 부여된 선택",
              "description": "가중 무작위 선택이 사용된 횟수입니다."
            }
          },
          "hatena": {
            "blocksAppeared": {
              "label": "발생한 블록",
              "description": "실행 중에 발견된 하테나 블록.",
              "value": "{value} 블록"
            },
            "blocksTriggered": {
              "label": "블록이 실행됨",
              "description": "하테나 블록을 밟으면 활성화됩니다.",
              "value": "{value} 트리거"
            },
            "positiveEffects": {
              "label": "긍정적인 결과",
              "description": "하테나 블록은 긍정적인 효과를 가져온 적이 있었습니다.",
              "value": "{value}회"
            },
            "neutralEffects": {
              "label": "중립적인 결과",
              "description": "하테나 블록은 중립적인 결과를 낳았습니다.",
              "value": "{value}회"
            },
            "negativeEffects": {
              "label": "부정적인 결과",
              "description": "하테나 블록은 부정적인 영향을 미쳤습니다.",
              "value": "{value}회"
            },
            "expGained": {
              "label": "경험치 획득",
              "description": "하테나 블록에서 얻은 경험치입니다.",
              "value": "{value} 경험치"
            },
            "expLost": {
              "label": "경험치 상실",
              "description": "하테나 블록으로 인해 경험치가 손실되었습니다.",
              "value": "{value} 경험치"
            },
            "bombDamageTaken": {
              "label": "받은 폭탄 피해",
              "description": "하테나 폭탄 효과로 인해 입은 총 피해량입니다.",
              "value": "{value} 피해"
            },
            "bombHealed": {
              "label": "폭탄 치유",
              "description": "하테나 폭탄 회복 효과로 회복된 총 HP입니다.",
              "value": "{value} HP"
            },
            "bombGuards": {
              "label": "폭탄 경비대",
              "description": "가드 효과로 인해 폭탄 피해가 감소했습니다.",
              "value": "{value}회"
            },
            "normalChestsSpawned": {
              "label": "일반 상자 생성",
              "description": "하테나 블록으로 만든 일반 상자입니다.",
              "value": "{value} 상자"
            },
            "rareChestsSpawned": {
              "label": "희귀한 상자 생성",
              "description": "하테나 블록으로 생성된 희귀 상자입니다.",
              "value": "{value} 상자"
            },
            "itemsGranted": {
              "label": "부여된 항목",
              "description": "하테나 블록이 제공하는 아이템입니다.",
              "value": "{value} 항목"
            },
            "enemyAmbushes": {
              "label": "적의 매복",
              "description": "매복 이벤트를 통해 생성된 적.",
              "value": "{value} 적"
            },
            "bombsTriggered": {
              "label": "폭탄 이벤트",
              "description": "하테나 블록으로 인해 발생하는 폭탄 효과.",
              "value": "{value}회"
            },
            "levelUps": {
              "label": "레벨 업",
              "description": "하테나 블록 횟수가 레벨을 올렸습니다.",
              "value": "{value}회"
            },
            "levelUpLevels": {
              "label": "획득한 레벨",
              "description": "하테나 블록으로 획득한 총 레벨입니다.",
              "value": "{value} 레벨"
            },
            "levelDowns": {
              "label": "레벨 다운",
              "description": "하테나를 막으면 레벨이 감소하는 횟수가 발생합니다.",
              "value": "{value}회"
            },
            "levelDownLevels": {
              "label": "레벨 상실",
              "description": "하테나 블록으로 인해 손실된 총 레벨입니다.",
              "value": "{value} 레벨"
            },
            "statusesApplied": {
              "label": "적용된 상태",
              "description": "하테나가 상태 이상을 막는 경우가 있습니다.",
              "value": "{value}회"
            },
            "statusesResisted": {
              "label": "저항된 상태",
              "description": "하테나 상태가 무효화된 횟수.",
              "value": "{value}회"
            },
            "abilityUps": {
              "label": "능력치 증가",
              "description": "하테나 블록이 스텟을 높인 횟수입니다.",
              "value": "{value}회"
            },
            "abilityDowns": {
              "label": "능력이 감소합니다",
              "description": "하테나 블록으로 인해 스텟이 낮아진 횟수.",
              "value": "{value}회"
            }
          },
          "tools": {
            "tabVisits": {
              "label": "도구 탭 방문",
              "description": "도구 탭이 열린 횟수입니다."
            },
            "modExports": {
              "label": "모드 수출",
              "description": "모드 생성 도구에서 내보내기가 수행됩니다."
            },
            "blockdataSaves": {
              "label": "블록데이터 저장",
              "description": "BlockData 편집기에 시간 데이터가 저장되었습니다."
            },
            "blockdataDownloads": {
              "label": "블록데이터 다운로드",
              "description": "BlockData 편집기에서 다운로드된 횟수 데이터입니다."
            },
            "sandboxSessions": {
              "label": "샌드박스 세션",
              "description": "샌드박스 인터페이스가 열린 횟수입니다."
            }
          },
          "addons": {
            "activeGenerators": {
              "label": "활성 세대 유형",
              "description": "현재 로드된 등록된 애드온 생성 유형 수입니다.",
              "value": "{value} 유형"
            },
            "miniGameMods": {
              "label": "미니 게임 모드",
              "description": "모드에서 제공하는 MiniExp 게임 수입니다.",
              "value": "{value} 타이틀"
            }
          }
        }
      },
      "custom": {
        "empty": "아직 맞춤 업적이 없습니다. 양식을 사용하여 추가하세요.",
        "actions": {
          "delete": "삭제",
          "reset": "다시 놓기"
        },
        "todo": {
          "statusCompleted": "상태: 완료됨",
          "statusIncomplete": "상태: 미완료",
          "markComplete": "완료로 표시",
          "markIncomplete": "미완료로 표시"
        },
        "repeatable": {
          "info": "총 완료 횟수: {count}",
          "infoWithTarget": "총 완료 횟수: {count} / 목표 {target}"
        },
        "counter": {
          "info": "현재 가치: {value}",
          "infoWithTarget": "현재 값: {value} / 목표 {target}"
        },
        "defaultTitle": "맞춤 업적",
        "confirmDelete": "이 맞춤 업적을 삭제하시겠습니까?"
      },
      "ui": {
        "subtabs": {
          "ariaLabel": "업적 및 통계 하위 탭",
          "achievements": "업적",
          "stats": "통계"
        },
        "achievements": {
          "title": "업적",
          "description": "모험과 도구 사용에 따라 자동으로 업데이트됩니다. 각 카테고리의 진행 상황을 검토하세요."
        },
        "stats": {
          "title": "통계",
          "description": "모험과 도구 상호작용을 통해 축적된 기록을 확인하세요."
        },
        "fallback": "업적 시스템 로딩중... 이 메시지가 계속되면 페이지를 새로고침해주세요.",
        "custom": {
          "title": "맞춤형 활성 업적",
          "description": "자신만의 목표와 보상을 설정하여 업적을 할 일 목록이나 농업 추적기로 사용하세요.",
          "form": {
            "legend": "새로운 맞춤 업적 추가",
            "title": {
              "label": "제목",
              "placeholder": "예: 매일 로그인"
            },
            "description": {
              "label": "설명",
              "placeholder": "무엇을 성취하려고 하시나요?"
            },
            "reward": {
              "label": "보상메모",
              "placeholder": "보상이나 비고를 참고하세요."
            },
            "type": {
              "label": "유형",
              "todo": "할 일(단일 완료)",
              "repeatable": "반복 가능",
              "counter": "계수기"
            },
            "target": {
              "label": "목표 수(선택 사항)",
              "placeholder": "예: 10"
            },
            "submit": "업적 추가"
          }
        }
      },
      "auto": {
        "dungeon_first_clear": {
          "title": "첫 번째 승리",
          "description": "던전을 클리어하세요.",
          "reward": "제목: \"신인 모험가\""
        },
        "dungeon_hard_clear": {
          "title": "어려운 정복자",
          "description": "어려움 난이도 이상으로 던전을 클리어하세요.",
          "reward": "고난이도 기념메달"
        },
        "dungeon_step_1000": {
          "title": "천 걸음",
          "description": "총 이동 거리 1,000타일을 달성하세요.",
          "reward": "무브먼트 노하우 노트"
        },
        "dungeon_boss_hunter": {
          "title": "보스헌터",
          "description": "보스 패배는 이 업적에 직접적으로 적용됩니다.",
          "reward": "제목: \"헌터\""
        },
        "dungeon_loop_runner": {
          "title": "루프 마스터",
          "description": "5번의 던전을 클리어할 때마다 진척도를 얻습니다.",
          "reward": "루프 로그 카드"
        },
        "dungeon_floor_master": {
          "title": "어비스워커",
          "description": "30층 이상에 도달하세요.",
          "reward": "제목: \"어비스 워커\""
        },
        "dungeon_healing_specialist": {
          "title": "응급치료사",
          "description": "치유 아이템을 25번 사용하세요.",
          "reward": "힐링 매뉴얼"
        },
        "dungeon_auto_guardian": {
          "title": "자동 가디언",
          "description": "자동 아이템을 10번 발동하세요.",
          "reward": "자동 복구 코어"
        },
        "dungeon_playtime_30min": {
          "title": "모험이 시작됩니다",
          "description": "총 플레이 시간이 30분에 도달했습니다.",
          "reward": "포켓 모래시계"
        },
        "dungeon_playtime_3hour": {
          "title": "시간 속에서 길을 잃다",
          "description": "총 플레이 시간 3시간을 달성하세요.",
          "reward": "베테랑 모험가 시계"
        },
        "dungeon_playtime_12hour": {
          "title": "끝없는 탐험가",
          "description": "총 플레이 시간이 12시간에 도달했습니다.",
          "reward": "크로노 나침반"
        },
        "dungeon_rare_collector": {
          "title": "희귀 수집가",
          "description": "희귀 상자 10개를 엽니다.",
          "reward": "희귀 열쇠 조각"
        },
        "dungeon_iron_wall": {
          "title": "철 생존자",
          "description": "총 피해량 10,000을 경험하세요.",
          "reward": "철벽방패"
        },
        "blockdim_first_gate": {
          "title": "게이트 개시",
          "description": "처음으로 Gate를 통해 블록 차원에 들어갑니다.",
          "reward": "게이트 활성화 로그"
        },
        "blockdim_bookmark_collector": {
          "title": "북마크 수집기",
          "description": "블록차원 북마크를 5개 등록합니다.",
          "reward": "조합 연구 노트"
        },
        "blockdim_weighted_explorer": {
          "title": "명사수 합성",
          "description": "가중치가 부여된 무작위 선택을 사용합니다.",
          "reward": "명사수 공식"
        },
        "hatena_first_trigger": {
          "title": "미스터리한 만남",
          "description": "처음으로 하테나 블록을 발동시킵니다.",
          "reward": "조사 기록 \"?\""
        },
        "hatena_block_researcher": {
          "title": "하테나 연구팀",
          "description": "하테나 블록을 25회 발동시키세요.",
          "reward": "관찰 기록 시트"
        },
        "hatena_lucky_chain": {
          "title": "행운을 찾는 사람",
          "description": "15개의 긍정적인 하테나 효과를 얻습니다.",
          "reward": "행운의 부적"
        },
        "hatena_unlucky_survivor": {
          "title": "불행한 생존자",
          "description": "부정적인 하테나 효과 10회에서 살아남으세요.",
          "reward": "지구력 메달"
        },
        "hatena_rare_hunter": {
          "title": "빛나는 행운",
          "description": "하테나 블록에서 희귀 상자 3개를 생성합니다.",
          "reward": "보물 감정 렌즈"
        },
        "tools_first_visit": {
          "title": "워크샵 데뷔",
          "description": "도구 탭을 엽니다.",
          "reward": "업무일지"
        },
        "tools_mod_export": {
          "title": "애드온 빌더",
          "description": "모드 생성 도구에서 코드를 내보냅니다.",
          "reward": "모드 서명 스탬프"
        },
        "tools_blockdata_saver": {
          "title": "데이터 유지관리자",
          "description": "BlockData 편집기에서 데이터를 저장하거나 다운로드하세요.",
          "reward": "유지보수 배지"
        },
        "tools_sandbox_session": {
          "title": "시뮬레이션 매니아",
          "description": "샌드박스 인터페이스를 열고 편집하세요.",
          "reward": "테스트 합격"
        },
        "minigame_coming_soon": {
          "title": "미니게임 성과",
          "description": "출시 예정 – 미니 게임 성과가 곧 시작됩니다.",
          "reward": ""
        }
      }
    }
  };
  store["ko"] = locale;
  if (!store["ko"]) { store["ko"] = {}; }
  if (!store["ko"].games) { store["ko"].games = {}; }
  var koGames = store["ko"].games;
  koGames.sanpo = {
    "name": "산책",
    "description": "무작위로 생성된 던전을 산책하며 걸음 수 ×1 EXP를 획득하세요.",
    "ui": {
      "regenerate": "스테이지 재생성",
      "zoomLabel": "줌",
      "minimapTitle": "미니맵",
      "stageInfo": "타입: {type} / 크기: {size} / 타일: {tileSize}",
      "seedInfo": "시드: {seed}",
      "stepsInfo": "걸음 수: {steps}",
      "stageInfoEmpty": "타입: -",
      "seedInfoEmpty": "시드: -",
      "stepsInfoEmpty": "걸음 수: 0",
      "zoomInfo": "줌: {value}x",
      "zoomDisplay": "{value}x",
      "hideMap": "미니맵 끄기",
      "showMap": "미니맵 켜기",
      "status": {
        "paused": "일시 정지",
        "walk": "산책 중… WASD/화살표 키로 이동하세요. M으로 미니맵, [ / ]로 줌을 조절하세요.",
        "noApi": "던전 API를 사용할 수 없습니다",
        "generating": "스테이지 생성 중…",
        "failed": "스테이지 생성에 실패했습니다",
        "ready": "준비 완료! 시작을 눌러 산책을 시작하세요.",
        "initializing": "불러오는 중…"
      }
    }
  };
  koGames.todoList = koGames.todoList || {};
  koGames.todoList.form = koGames.todoList.form || {};
  koGames.todoList.form.randomRange = koGames.todoList.form.randomRange || {
    "toggle": "무작위 범위 사용",
    "min": "최소값",
    "max": "최대값"
  };
  koGames.todoList.form.rewards = koGames.todoList.form.rewards || {};
  koGames.todoList.form.rewards.item = koGames.todoList.form.rewards.item || {};
  koGames.todoList.form.rewards.item.lootTable = koGames.todoList.form.rewards.item.lootTable || {
    "label": "드랍 테이블",
    "addEntry": "추가",
    "dropChance": "드랍 확률(%)",
    "weight": "가중치"
  };
  koGames.todoList.task = koGames.todoList.task || {};
  koGames.todoList.task.rewards = koGames.todoList.task.rewards || {};
  if (!koGames.todoList.task.rewards.loot) {
    koGames.todoList.task.rewards.loot = "드랍 {chance}%";
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this);

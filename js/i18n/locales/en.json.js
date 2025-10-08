(function (root) {
  if (!root) return;
  var store = root.__i18nLocales = root.__i18nLocales || {};
  store['en'] = {
    "meta": {
      "title": "Yu Roguelike"
    },

    "header": {
      "title": "Yu Roguelike"
    },

    "ui": {
      "language": {
        "label": "Language",
        "ariaLabel": "Language selector",
        "option": {
          "ja": "Japanese",
          "en": "English"
        }
      },
      "runResult": {
        "title": "Results",
        "reason": {
          "gameOver": "Game Over",
          "clear": "Dungeon Cleared",
          "retreat": "Dungeon Retreat",
          "return": "Run Summary"
        },
        "stats": {
          "level": "Level",
          "totalExp": "Total EXP Earned",
          "totalDamage": "Total Damage Taken",
          "healingItems": "Healing Items Used"
        },
        "actions": {
          "return": "Return to Base",
          "retry": "Retry"
        }
      }
    },

    "messages": {
      "domainCrystal": {
        "spawn": "A mysterious domain crystal has appeared on this floor...!"
      },
      "domainEffect": {
        "enter": "Entered the influence of domain effect \"{label}\"!",
        "exit": "Left the domain effect's influence."
      },
      "domain": {
        "poisonNegated": "The domain effect nullified the poison damage!",
        "poisonReversed": "The poison's pain reversed and restored {amount} HP!",
        "poisonDamage": "Poison dealt {amount} damage!",
        "rareChestGuarded": "The golden chest exploded, but the domain effect protected you!",
        "rareChestReversed": "The golden chest explosion reversed and restored {amount} HP!",
        "rareChestDamage": "The golden chest exploded! HP decreased by {damage} (timing off by {timing}%).",
        "rareChestDeath": "Caught in the golden chest explosion... Game over.",
        "damageBlocked": "The domain effect prevented you from dealing damage...",
        "enemyHealed": "The domain effect healed the enemy for {amount}!",
        "poisonFloorNegated": "The domain effect nullified the poison floor's damage!",
        "poisonFloorReversed": "The poison floor's energy reversed and restored {amount} HP!",
        "poisonFloorDamage": "The poison floor dealt damage! HP decreased by {amount}.",
        "poisonFloorDeath": "The poison floor defeated you... Game over.",
        "bombGuarded": "The domain effect blocked the blast!",
        "bombReversed": "The blast's force reversed and restored {amount} HP!",
        "bombDamage": "The bomb exploded! HP decreased by {amount}.",
        "bombDeath": "Caught in the bomb blast... Game over.",
        "bombSafe": "The bomb exploded but you took no damage!",
        "enemyAttackGuarded": "The domain effect protected you from damage!",
        "enemyAttackReversed": "The domain effect turned the enemy attack into healing! Restored {amount} HP."
      },
      "skills": {
        "cannotUse": "Cannot use skill: {reason}",
        "notEnoughSp": "Not enough SP.",
        "genericKill": "Defeated the enemy!",
        "effects": {
          "applied": "{label} activated! ({turns} turns)",
          "gimmickNullifyExpired": "The gimmick nullifier wore off.",
          "statusGuardExpired": "The status barrier faded.",
          "enemyNullifyExpired": "The effect seal wore off.",
          "sureHitExpired": "The sure-hit effect ended."
        },
        "breakWall": {
          "noWall": "There is no breakable wall ahead.",
          "notBreakable": "That wall could not be destroyed.",
          "success": "SP Skill: The wall was shattered!"
        },
        "buildWall": {
          "noFloor": "There is no floor ahead to transform into a wall.",
          "cannotBuild": "You cannot create a wall there.",
          "success": "SP Skill: A wall was created!"
        },
        "gimmickNullify": {
          "tooHard": "This dungeon is too difficult—the gimmick nullifier has no effect..."
        },
        "stairWarp": {
          "noDestination": "There is no safe warp destination near the stairs.",
          "success": "Warped next to the stairs!"
        },
        "strongStrike": {
          "noTarget": "No enemy to unleash the power strike on.",
          "sureHitFailed": "The enemy's level was too high—the sure hit failed...",
          "miss": "The power strike missed.",
          "damage": "Power strike dealt {damage} damage!",
          "kill": "Defeated the enemy with a power strike!"
        },
        "rangedAttack": {
          "noTarget": "No enemy in range for the ranged attack.",
          "miss": "The ranged attack missed...",
          "damage": "Ranged attack dealt {damage} damage!",
          "kill": "Defeated the enemy with a ranged attack!"
        },
        "areaSkill": {
          "noTargets": "No enemies in range.",
          "activated": "Used {skillName}!",
          "sureHitFailed": "High-level enemies resisted the effect...",
          "kill": "Defeated an enemy with {skillName}!",
          "noneHit": "It hit no one..."
        },
        "floorSkill": {
          "noTargets": "No enemies to target.",
          "activated": "Unleashed {skillName}!",
          "sureHitFailed": "High-level enemies were unaffected...",
          "kill": "Defeated an enemy with {skillName}!",
          "noneHit": "It dealt damage to no one."
        },
        "ruinAnnihilation": {
          "start": "Unleashed the power of ruin!",
          "kill": "Obliterated the enemy with ruinous flames!",
          "resisted": "Some high-level enemies resisted the power of ruin...",
          "cleared": "The dungeon's walls and gimmicks vanished!"
        }
      }
    },

    "skills": {
      "meta": {
        "currentSp": "Current SP: {value}",
        "currentSpLabel": "Current SP",
        "costAndCurrent": "SP Cost: {cost} / Current: {current}",
        "reasonSuffix": " ({reason})",
        "remainingTurns": "Active: {turns} turns left",
        "use": "Use"
      },
      "modal": {
        "title": "Skills"
      },
      "availability": {
        "unlockLevel": "Unlocks at Lv100",
        "maxSpShortage": "SP cap too low",
        "notEnoughSp": "Not enough SP",
        "tooHard": "Ineffective at this difficulty",
        "noWallAhead": "No wall ahead",
        "noFloorAhead": "No floor ahead",
        "noRangedTarget": "No reachable target",
        "noFrontEnemy": "No enemy in front",
        "noAreaTargets": "No enemies in range",
        "noEnemies": "No enemies present",
        "noWarpDestination": "No warp destination",
        "notYourTurn": "Not your turn",
        "paralyzed": "Paralyzed"
      },
      "effects": {
        "gimmickNullify": { "label": "Gimmick Nullify" },
        "statusGuard": { "label": "Status Barrier" },
        "enemyNullify": { "label": "Effect Seal" },
        "sureHit": { "label": "Sure Hit" }
      },
      "breakWall": {
        "name": "Break Wall",
        "description": "Destroy the wall directly in front of you."
      },
      "buildWall": {
        "name": "Create Wall",
        "description": "Convert the floor in front of you into a wall."
      },
      "rangedAttack": {
        "name": "Ranged Attack",
        "description": "Strike enemies in a straight line ahead with a sure-hit attack dealing one-third normal damage. Blocked by walls."
      },
      "gimmickNullify": {
        "name": "Gimmick Nullifier",
        "description": "Nullify dungeon gimmicks for 10 turns. Ineffective if the recommended level exceeds yours by 8 or more."
      },
      "statusGuard": {
        "name": "Status Barrier",
        "description": "Block all status ailments for 10 turns."
      },
      "enemyNullify": {
        "name": "Effect Seal",
        "description": "Nullify special enemy effects for 10 turns."
      },
      "sureHit": {
        "name": "Sure Hit",
        "description": "Guarantee normal attacks hit for 10 turns. Ineffective against enemies 8+ levels above you."
      },
      "stairWarp": {
        "name": "Stair Warp",
        "description": "Warp to a tile adjacent to the stairs."
      },
      "strongStrike": {
        "name": "Power Strike",
        "description": "Deliver a sure-hit attack dealing 3× damage to the enemy in front."
      },
      "areaAttack": {
        "name": "Area Attack",
        "description": "Deal normal area damage to nearby enemies."
      },
      "surehitArea": {
        "name": "Sure-Hit Area Attack",
        "description": "Deal sure-hit area damage to nearby enemies."
      },
      "strongArea": {
        "name": "Power Area Attack",
        "description": "Deal 3× area damage to nearby enemies."
      },
      "surehitStrongArea": {
        "name": "Sure-Hit Power Area",
        "description": "Deal sure-hit, 3× area damage to nearby enemies."
      },
      "surehitFloor": {
        "name": "Sure-Hit Floor Attack",
        "description": "Strike every enemy on the floor with a sure-hit attack."
      },
      "ruinAnnihilation": {
        "name": "Ruin Annihilation",
        "description": "Unleash 3× sure-hit damage to all enemies, erase walls and gimmicks, and claim any chests. Ineffective on high-level foes."
      }
    },

    "selection": {
      "title": "Dungeon Selection",
      "difficulty": {
        "label": "Difficulty",
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
        "tooltip": "Recommended Lv: {level}"
      },
      "playerStatus": {
        "title": "Player Status",
        "toggle": {
          "expand": "Expand",
          "collapse": "Collapse"
        },
        "labels": {
          "level": "Level",
          "hp": "HP",
          "satiety": "Satiety",
          "exp": "EXP",
          "sp": "SP",
          "attack": "Attack",
          "defense": "Defense"
        }
      },
      "tabs": {
        "ariaLabel": "Dungeon selection tabs",
        "normal": "Normal",
        "blockdim": "Block Dimension",
        "miniexp": "Mini-Game Experience",
        "tools": "Tools",
        "achievements": "Achievements & Stats"
      },
      "normal": {
        "worlds": "Worlds",
        "dungeons": "Dungeons",
        "detail": {
          "name": "Dungeon Name",
          "typeLabel": "Type:",
          "typeValue": "Field",
          "recommendedLabel": "Recommended Level:",
          "damageLabel": "Damage Multipliers:",
          "damageValue": "Deal: 1.6x / Take: 0.5x",
          "damageMultiplier": "Deal: {deal}x / Take: {take}x",
          "descriptionLabel": "Description:",
          "description": "Dungeon description",
          "start": "Enter Dungeon"
        }
      },
      "blockdim": {
        "nested": {
          "label": "NESTED Dimension",
          "title": "NESTED dimension: recommended level increases by 2600*(N-1)"
        },
        "dimension": {
          "label": "Dimension",
          "listLabel": "Dimension",
          "first": "1st",
          "second": "2nd",
          "third": "3rd"
        },
        "card": {
          "title": "Synthesis Preview",
          "selection": "Selection",
          "level": "Recommended Lv",
          "type": "Type",
          "depth": "Depth",
          "size": "Size",
          "chest": "Chest",
          "boss": "Boss Floor",
          "note": "Identical selections produce identical generation (fixed seed).",
          "gate": "Gate",
          "addBookmark": "★ Add Bookmark",
          "addBookmarkTitle": "Bookmark current combination",
          "clearHistory": "Clear History",
          "clearHistoryTitle": "Clear all Gate history",
          "random": "🎲 Random Select (1st/2nd/3rd)",
          "randomTitle": "Pick 1st/2nd/3rd randomly",
          "randomTarget": "Target Lv (block total)",
          "randomTargetTitle": "Ignore base dimension level; only sum the three block levels.",
          "randomType": "Type Priority",
          "randomTypeTitle": "Prefer matching type",
          "randomTypeNone": "No preference",
          "weightedRandom": "🎯 Weighted Random",
          "weightedRandomTitle": "Random selection weighted by target level and type priority"
        },
        "history": {
          "title": "Gate History"
        },
        "bookmarks": {
          "title": "Block Bookmarks"
        },
        "test": {
          "title": "Dungeon Test",
          "description": "Generates every registered dungeon type with random seeds to verify BlockDim is safe. Errors are logged and the run never finishes if an infinite loop occurs.",
          "run": "🧪 Run Dungeon Test",
          "idle": "Idle"
        }
      },
      "miniexp": {
        "categories": "Category list",
        "displayModes": "Display modes",
        "displayMode": {
          "tile": "Tile",
          "list": "List",
          "wrap": "Wrap",
          "detail": "Detail"
        },
        "list": "Mini-game list",
        "category": {
          "all": "All",
          "action": "Action",
          "board": "Board",
          "shooting": "Shooter",
          "puzzle": "Puzzle",
          "utility": "Utility",
          "rhythm": "Rhythm",
          "gambling": "Gambling",
          "toy": "Toy",
          "simulation": "Simulation",
          "skill": "Skill",
          "misc": "Misc"
        },
        "games": {
          "snake": {
            "name": "Snake",
            "description": "Collect pellets to grow longer and earn EXP."
          },
          "othello": {
            "name": "Othello",
            "description": "Flip discs to swing the board and win for bonus EXP."
          },
          "checkers": {
            "name": "Checkers",
            "description": "Jump enemy pieces and crown your men in a classic board duel."
          },
          "chess": {
            "name": "Chess",
            "description": "Outmaneuver the king with tactical captures and checks to gain EXP."
          },
          "xiangqi": {
            "name": "Xiangqi",
            "description": "Command Chinese chess pieces, scoring EXP for captures, checks, and mates."
          },
          "shogi": {
            "name": "Shogi",
            "description": "Use drops and promotions in Japanese chess to rack up move and capture EXP."
          },
          "riichi_mahjong": {
            "name": "Riichi Mahjong Lite",
            "description": "Play a quick east-round against three AI rivals and score EXP for riichi, tsumo, and ron wins."
          },
          "connect6": {
            "name": "Connect Six",
            "description": "Place twin stones to build six in a row and earn big EXP for reaches and victories."
          },
          "gomoku": {
            "name": "Gomoku",
            "description": "Form five in a row on a 15x15 grid, banking EXP for setups and wins."
          },
          "renju": {
            "name": "Renju",
            "description": "Master forbidden-move Gomoku rules and earn EXP for careful threats and triumphs."
          },
          "go": {
            "name": "Go",
            "description": "Surround territory, capture stones, and score EXP for smart invasions and victories."
          },
          "backgammon": {
            "name": "Backgammon",
            "description": "Race your checkers home, hit blots, and bear off to collect EXP."
          },
          "connect4": {
            "name": "Connect Four",
            "description": "Drop discs into a vertical board and earn EXP for creating four in a row."
          },
          "tic_tac_toe": {
            "name": "Tic-Tac-Toe",
            "description": "Line up three marks before the AI to grab quick EXP."
          },
          "mancala": {
            "name": "Mancala",
            "description": "Sow seeds and capture pits in the Kalah rule set to outscore the AI for EXP."
          },
          "breakout": {
            "name": "Breakout",
            "description": "Deflect the paddle to smash bricks and earn EXP with every block."
          },
          "breakout_k": {
            "name": "Breakout (Keyboard)",
            "description": "Clear bricks with keyboard-only paddle control for EXP rewards."
          },
          "pinball_xp": {
            "name": "XP Pinball",
            "description": "Shoot a retro 3D-style table, lighting lanes and bumpers to harvest EXP."
          },
          "dungeon_td": {
            "name": "Dungeon Tower Defense",
            "description": "Place turrets in a hybrid dungeon and stop enemy waves to level up EXP."
          },
          "pong": {
            "name": "Pong",
            "description": "Win table-tennis rallies for escalating EXP on higher difficulties."
          },
          "same": {
            "name": "SameGame",
            "description": "Pop matching color clusters to claim EXP bonuses."
          },
          "match3": {
            "name": "Match 3",
            "description": "Swap gems to make chains, with longer matches and combos boosting EXP."
          },
          "minesweeper": {
            "name": "Minesweeper",
            "description": "Clear the board safely, earning EXP for reveals and full clears."
          },
          "sudoku": {
            "name": "Number Place",
            "description": "Fill the grid with correct digits to gain EXP and a completion bonus."
          },
          "ultimate_ttt": {
            "name": "Ultimate Tic-Tac-Toe",
            "description": "Control mini-boards and claim the macro victory for layered EXP rewards."
          },
          "nine_mens_morris": {
            "name": "Nine Men's Morris",
            "description": "Place mills to remove enemy pieces and secure EXP."
          },
          "sugoroku_life": {
            "name": "Life Sugoroku",
            "description": "Navigate life events, grow your assets, and rack up EXP in a career board game."
          },
          "sliding_puzzle": {
            "name": "Sliding Puzzle",
            "description": "Solve 8-, 15-, and 24-tile sliding puzzles for EXP."
          },
          "invaders": {
            "name": "Space Invaders",
            "description": "Shoot descending aliens for EXP, with a windfall for clearing the wave."
          },
          "pacman": {
            "name": "Pac-Man Clone",
            "description": "Eat pellets and sweep the maze clean for a huge EXP payout."
          },
          "bomberman": {
            "name": "Bomberman Clone",
            "description": "Blast soft blocks and enemies with bombs to accumulate EXP."
          },
          "tetris": {
            "name": "Tetris Clone",
            "description": "Stack Tetriminos for REN chains and T-Spins to maximize EXP."
          },
          "falling_puyos": {
            "name": "Puyo Puyo Clone",
            "description": "Chain four-color clears to amplify EXP multipliers."
          },
          "triomino_columns": {
            "name": "Triomino Columns",
            "description": "Drop tri-piece columns with line sparks and holds to build EXP."
          },
          "game2048": {
            "name": "2048",
            "description": "Merge tiles toward 2048, earning EXP based on log2 sums."
          },
          "todo_list": {
            "name": "To-Do List",
            "description": "Complete tasks you set to receive configurable EXP."
          },
          "counter_pad": {
            "name": "Counter Pad",
            "description": "Track numbers with multi-counter buttons that auto-save your adjustments."
          },
          "notepad": {
            "name": "Notepad",
            "description": "Write, edit, and save notes to earn incremental EXP."
          },
          "exceler": {
            "name": "Exceler Spreadsheet",
            "description": "Lightweight XLSX editing with formulas and formatting for productivity EXP."
          },
          "paint": {
            "name": "Paint",
            "description": "Draw and fill artwork, then save canvases for EXP boosts."
          },
          "diagram_maker": {
            "name": "Diagram Maker",
            "description": "Create diagrams with draw.io XML export and image output to gain EXP."
          },
          "clock_hub": {
            "name": "Clock Hub",
            "description": "Browse rich clock widgets and time data, collecting milestone EXP."
          },
          "login_bonus": {
            "name": "Login Bonus",
            "description": "Mark daily check-ins on the calendar to claim EXP rewards."
          },
          "stopwatch": {
            "name": "Stopwatch",
            "description": "Measure laps precisely and bank EXP with each operation."
          },
          "calculator": {
            "name": "Calculator",
            "description": "Input numbers and finalize calculations to earn EXP."
          },
          "timer": {
            "name": "Timer",
            "description": "Manage countdowns and stopwatches to stay on schedule for EXP."
          },
          "math_lab": {
            "name": "Math Lab",
            "description": "Explore advanced math tools—functions, conversions, graphs, even tetration—for EXP."
          },
          "calc_combo": {
            "name": "Calc Combo",
            "description": "Solve rapid-fire arithmetic up to two digits to build combo EXP."
          },
          "blockcode": {
            "name": "Blockcode Lab",
            "description": "Experiment with visual blocks to safely script MiniExp APIs."
          },
          "wording": {
            "name": "Wording",
            "description": "Edit, format, and save documents in a word processor to gain EXP."
          },
          "video_player": {
            "name": "Video Player",
            "description": "Watch local files or YouTube clips to accumulate viewing EXP."
          },
          "pomodoro": {
            "name": "Pomodoro Timer",
            "description": "Cycle focus and breaks, finishing sessions for EXP payouts."
          },
          "music_player": {
            "name": "Music Player",
            "description": "Import and play tracks with visualizers and EQ to collect EXP."
          },
          "tester": {
            "name": "JS Tester",
            "description": "Benchmark JavaScript features and build block adventures for EXP."
          },
          "system": {
            "name": "System Inspector",
            "description": "Check PC, OS, browser, and network details in one EXP-ready dashboard."
          },
          "aim": {
            "name": "Aim Trainer",
            "description": "Hit targets for 1–3 EXP and keep streaks alive for bonuses."
          },
          "dodge_race": {
            "name": "Dodge Race",
            "description": "Weave through grid hazards to stretch your distance EXP."
          },
          "pseudo3d_race": {
            "name": "Highway Chaser",
            "description": "Race down a pseudo-3D highway, overtaking traffic for EXP."
          },
          "bowling_duel": {
            "name": "Bowling Duel",
            "description": "Curve shots and pick your line to beat the CPU across ten frames."
          },
          "topdown_race": {
            "name": "Aurora Circuit",
            "description": "Drive a top-down circuit, earning EXP from laps and finishing order."
          },
          "falling_shooter": {
            "name": "Falling Block Shooter",
            "description": "Blast descending blocks—the bigger they are, the more EXP you earn."
          },
          "bubble_shooter": {
            "name": "Bubble Shooter",
            "description": "Fire colored bubbles to match three and drop clusters for EXP."
          },
          "virus_buster": {
            "name": "Virus Buster",
            "description": "Stack capsules to match colors and wipe viruses for EXP."
          },
          "sichuan": {
            "name": "Sichuan Puzzle",
            "description": "Connect matching mahjong tiles with two turns or fewer to clear the board."
          },
          "piano_tiles": {
            "name": "Rhythm Tiles",
            "description": "Tap and hold four-lane piano notes in time to keep combo EXP climbing."
          },
          "taiko_drum": {
            "name": "Taiko Rhythm",
            "description": "Play two taiko drum charts with classic judgments and combo EXP bonuses."
          },
          "river_crossing": {
            "name": "River Crossing",
            "description": "Advance frogs safely toward the goal for EXP, with a jackpot at the far bank."
          },
          "whack_a_mole": {
            "name": "Whack-a-Mole",
            "description": "Smash moles quickly and maintain streaks for extra EXP."
          },
          "xp_crane": {
            "name": "XP Crane Catcher",
            "description": "Operate a crane to grab EXP capsules, chaining catches for bonuses."
          },
          "steady_wire": {
            "name": "Steady Wire",
            "description": "Trace randomized mazes without touching the edge to collect EXP."
          },
          "flappy_bird": {
            "name": "Flappy Bird Clone",
            "description": "Slip through pipe gaps for EXP and multiply it with streaks."
          },
          "dino_runner": {
            "name": "Dino Runner",
            "description": "Leap over obstacles as a dinosaur, converting distance into EXP."
          },
          "floor_descent": {
            "name": "Floor Descent Survival",
            "description": "Descend away from a spiked ceiling, using platforms to survive for EXP."
          },
          "forced_scroll_jump": {
            "name": "Forced Scroll Jump",
            "description": "Dash through forced scrolling stages, gathering CX marks for higher ranks and EXP."
          },
          "tosochu": {
            "name": "Run for Money",
            "description": "Evade hunters in a TV-style chase, banking massive EXP if you last or surrender safely."
          },
          "ten_ten": {
            "name": "1010 Puzzle",
            "description": "Place blocks to clear lines, with cross clears doubling your EXP."
          },
          "trump_games": {
            "name": "Trump Selection",
            "description": "Play a hub of card games—Concentration, Blackjack, and Old Maid—for EXP."
          },
          "gamble_hall": {
            "name": "Gamble Hall",
            "description": "Wager EXP on roulette and pachislo-inspired machines."
          },
          "electro_instrument": {
            "name": "Electronic Instrument Studio",
            "description": "Jam on a virtual keyboard with multiple timbres, earning EXP per performance."
          },
          "graphics_tester": {
            "name": "3D Graphics Tester",
            "description": "Run visual demos and ray-tracing style renders to benchmark for EXP."
          },
          "physics_sandbox": {
            "name": "Physics Sandbox",
            "description": "Combine fire, water, vines, lightning, and circuits in a playful physics lab."
          },
          "populite": {
            "name": "Populite",
            "description": "Reshape terrain and guide followers to hit population goals for EXP."
          },
          "logic_circuit": {
            "name": "Logic Circuit Simulator",
            "description": "Wire inputs, gates, and outputs to simulate logic systems for EXP."
          },
          "circuit_simulator": {
            "name": "Electric Circuit Simulator",
            "description": "Build DC/AC circuits with instruments and components to experiment for EXP."
          },
          "memo_studio": {
            "name": "Memory Studio",
            "description": "Study flash cards with spaced repetition to strengthen memory for EXP."
          },
          "onigokko": {
            "name": "Tag Escape",
            "description": "Run around a mixed dungeon to dodge the chaser and survive for EXP."
          },
          "darumasan": {
            "name": "Darumasan ga Koronda",
            "description": "Freeze when watched and dash forward unseen to win 50 EXP."
          },
          "acchimuitehoi": {
            "name": "Look This Way",
            "description": "Win reaction duels—attack for 15 EXP, defend for 5 EXP."
          },
          "janken": {
            "name": "Rock-Paper-Scissors",
            "description": "Play classic janken and earn 10 EXP per victory."
          },
          "typing": {
            "name": "Typing Challenge",
            "description": "Type accurately for 60 seconds to push WPM and EXP."
          },
          "imperial_realm": {
            "name": "Imperial Realm",
            "description": "Command villagers and armies to withstand waves and crush enemy keeps for EXP."
          }
        },

        "difficulty": {
          "label": "Difficulty",
          "easy": "EASY",
          "normal": "NORMAL",
          "hard": "HARD"
        },
        "start": "Start",
        "pause": "Pause",
        "restart": "Resume/Restart",
        "quit": "Quit",
        "hud": {
          "level": "Lv",
          "sp": "SP",
          "expLabel": "EXP "
        },
        "placeholder": "Select a mini-game from the list on the left."
      }
    },

    dungeon: {
      "packs": {
        "abyssal_whorl_pack": {
          "name": "Abyssal Whorl Pack"
        },

        "abstract_spectrum_pack": {
          "name": "Abstract Spectrum Generation Pack"
        },

        "amber_marsh_pack": {
          "name": "Amber Marsh Pack"
        },

        "ancient_enigma_pack": {
          "name": "Ancient Enigma Excavation Pack"
        },

        "arabian_legends_pack": {
          "name": "Arabian Legends Pack",
          "description": "A large Arabian-inspired expansion with 16 generation algorithms covering oases, fortresses, markets, sky gardens, astral sanctums, and more alongside 50+ themed blocks."
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
          "name": "Celestial Dynasty Pack"
        },

        "churning_karst_pack": {
          "name": "Churning Karst Pack"
        },

        "classic_jrpg_legends_pack": {
          "name": "Classic Jrpg Legends Pack"
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
          "name": "Fantasical & Sci-Fi Dream Pack"
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
          "name": "Neo Research Arcology Expansion",
          "description": "A large expansion set in a futuristic research arcology, adding seven generation types—multi-layer rings, spiral experiment routes, biodomes, coolant vaults, holo cities—and 36 blocks across four dimensional bands."
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
          "description": "A massive sci-fi generation pack spanning starships, cyberspace, future cities, orbital facilities, quantum/time research, alien biomes, and mega colonies with 50 dungeon types and five dimensional expansions."
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
          "name": "Visceral Crime Scene Pack"
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
          "name": "Abyssal Whorl",
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

          "badges": ["cave", "abyss", "wind"]
        },

        "amber_marsh": {
          "name": "Amber Marsh",
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

          "badges": ["swamp", "autumn", "mist"]
        },

        "ancient_enigma_strata": {
          "name": "Ancient Enigma Strata",
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

          "badges": ["puzzle", "ancient", "archaeology"]
        },

        "ancient_enigma_crypt": {
          "name": "Ancient Enigma Crypt",
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

          "badges": ["labyrinth", "ancient", "ritual"]
        },

        "ancient_enigma_aquifer": {
          "name": "Ancient Enigma Aquifer",
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

          "badges": ["water", "ancient", "mystery"]
        },

        "mirage_caravan": {
          "name": "Mirage Caravan",
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

          "badges": ["desert", "field", "maze"]
        },

        "moonlit_oasis": {
          "name": "Moonlit Oasis",
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

          "badges": ["water", "desert", "ritual"]
        },

        "saffron_citadel": {
          "name": "Saffron Citadel",
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

          "badges": ["fortress", "desert"]
        },

        "labyrinthine_souk": {
          "name": "Labyrinthine Souk",
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

          "badges": ["maze", "urban", "market"]
        },

        "windspire_minarets": {
          "name": "Windspire Minarets",
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

          "badges": ["vertical", "sky", "desert"]
        },

        "sunken_qanat": {
          "name": "Sunken Qanat",
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

          "badges": ["water", "underground"]
        },

        "star_sand_garden": {
          "name": "Star Sand Garden",
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

          "badges": ["ritual", "desert"]
        },

        "gilded_tombs": {
          "name": "Gilded Tombs",
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

          "badges": ["crypt", "desert"]
        },

        "storm_djinn_forge": {
          "name": "Storm Djinn Forge",
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

          "badges": ["forge", "arcane", "storm"]
        },

        "celestial_astrolabe": {
          "name": "Celestial Astrolabe",
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

          "badges": ["ritual", "astral"]
        },

        "aurora_dune_sea": {
          "name": "Aurora Dune Sea",
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

          "badges": ["desert", "mirage", "open-space"]
        },

        "sapphire_madrasa": {
          "name": "Sapphire Madrasa",
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

          "badges": ["ritual", "urban", "sacred"]
        },

        "prismatic_carpet_gallery": {
          "name": "Prismatic Carpet Gallery",
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

          "badges": ["market", "maze", "festival"]
        },

        "hanging_garden_terraces": {
          "name": "Hanging Garden Terraces",
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

          "badges": ["garden", "fortress"]
        },

        "emberglass_sanctum": {
          "name": "Emberglass Sanctum",
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

          "badges": ["forge", "ritual", "heat"]
        },

        "astral_mirage_archive": {
          "name": "Astral Mirage Archive",
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

          "badges": ["astral", "library", "ritual"]
        },

        "axis_gallery": {
          "name": "Axis Gallery",
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

          "badges": ["gallery", "hazard"]
        },

        "bamboo_hollows": {
          "name": "Bamboo Hollows",
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

          "badges": ["forest", "bamboo", "stream"]
        },

        "sunlit_shore": {
          "name": "Sunlit Shore",
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

          "badges": ["beach", "water"]
        },

        "minefield_expanse": {
          "name": "Minefield Expanse",
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

          "badges": ["open-space", "bomb"]
        },

        "shrapnel_barracks": {
          "name": "Shrapnel Barracks",
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

          "badges": ["rooms", "bomb"]
        },

        "fuse_labyrinth": {
          "name": "Fuse Labyrinth",
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

          "badges": ["maze", "bomb"]
        },

        "imperial_courtyard": {
          "name": "Imperial Courtyard",
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

          "badges": ["imperial", "symmetry", "ceremony"]
        },

        "lotus_labyrinth": {
          "name": "Lotus Labyrinth",
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

          "badges": ["garden", "ring", "water"]
        },

        "silk_market": {
          "name": "Silk Market",
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

          "badges": ["market", "grid", "urban"]
        },

        "great_wall_terrace": {
          "name": "Great Wall Terrace",
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

          "badges": ["fortress", "grid", "defense"]
        },

        "dragon_spine": {
          "name": "Dragon Spine",
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

          "badges": ["organic", "serpentine"]
        },

        "scholar_archive": {
          "name": "Scholar Archive",
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

          "badges": ["library", "archive"]
        },

        "moonlit_waterways": {
          "name": "Moonlit Waterways",
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

          "badges": ["water", "ice", "canal"]
        },

        "celestial_observatory": {
          "name": "Celestial Observatory",
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

          "badges": ["astral", "rings", "ritual", "sky", "symmetry"]
        },

        "jade_terraces": {
          "name": "Jade Terraces",
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

          "badges": ["garden", "terrace", "water"]
        },

        "lantern_festival": {
          "name": "Lantern Festival",
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

          "badges": ["festival", "lantern", "market"]
        },

        "opera_house": {
          "name": "Opera House",
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

          "badges": ["theater", "stage", "crescent"]
        },

        "crane_sanctuary": {
          "name": "Crane Sanctuary",
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

          "badges": ["garden", "water", "sanctuary"]
        },

        "tea_pavilion": {
          "name": "Tea Pavilion",
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

          "badges": ["tea", "terrace", "pavilion"]
        },

        "churning_karst": {
          "name": "Churning Karst",
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

          "badges": ["cave", "water", "erosion"]
        },

        "royal_keep": {
          "name": "Royal Keep",
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

          "badges": ["castle", "symmetry", "royal"]
        },

        "mystic_wood": {
          "name": "Mystic Wood",
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

          "badges": ["forest", "organic", "nature"]
        },

        "crystal_depths": {
          "name": "Crystal Depths",
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

          "badges": ["cave", "crystal", "mystic"]
        },

        "sacred_sanctum": {
          "name": "Sacred Sanctum",
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

          "badges": ["temple", "holy", "structured"]
        },

        "dragon_forge": {
          "name": "Dragon Forge",
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

          "badges": ["lava", "forge", "dragon"]
        },

        "ancient_aqueduct": {
          "name": "Ancient Aqueduct",
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

          "badges": ["water", "engineered", "city"]
        },

        "mirror_catacomb": {
          "name": "Mirror Catacomb",
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

          "badges": ["crypt", "symmetry", "labyrinth"]
        },

        "floating_archipelago": {
          "name": "Floating Archipelago",
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

          "badges": ["floating", "bridge", "open"]
        },

        "arcane_library": {
          "name": "Arcane Library",
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

          "badges": ["library", "grid", "mystic"]
        },

        "ember_chasm": {
          "name": "Ember Chasm",
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

          "badges": ["lava", "abyss", "bridge"]
        },

        "glacial_bastion": {
          "name": "Glacial Bastion",
          "description": "氷晶の輪郭が幾層にも重なる極寒の星型砦ダンジョン",

          "blocks": {
            "jrpg_legends_raid_02": {
              "name": "Raid II"
            },

            "jrpg_legends_raid_06": {
              "name": "Raid VI"
            }
          },

          "badges": ["ice", "fortress", "radial"]
        },

        "radiant_citadel": {
          "name": "Radiant Citadel",
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

          "badges": ["holy", "castle", "radial"]
        },

        "moonlit_cloister": {
          "name": "Moonlit Cloister",
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

          "badges": ["cloister", "symmetric", "water"]
        },

        "verdant_terraces": {
          "name": "Verdant Terraces",
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

          "badges": ["garden", "layered", "nature"]
        },

        "tempest_bastion": {
          "name": "Tempest Bastion",
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

          "badges": ["storm", "spiral", "fortress"]
        },

        "sunken_arcadia": {
          "name": "Sunken Arcadia",
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

          "badges": ["water", "city", "ritual"]
        },

        "clockwork_labyrinth": {
          "name": "Clockwork Labyrinth",
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

          "badges": ["structured", "mechanical"]
        },

        "conveyor_foundry": {
          "name": "Conveyor Foundry",
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

          "badges": ["mechanical", "hazard"]
        },

        "coral_garden": {
          "name": "Coral Garden",
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

          "badges": ["water", "reef", "undersea"]
        },

        "crossroads_3wide": {
          "name": "Crossroads 3wide",
          "badges": ["grid"]
        },

        "horizontal_stripes": {
          "name": "Horizontal Stripes",
          "badges": ["corridor"]
        },

        "vertical_stripes": {
          "name": "Vertical Stripes",
          "badges": ["corridor"]
        },

        "perforated_grid": {
          "name": "Perforated Grid",
          "badges": ["grid"]
        },

        "ladder_room": {
          "name": "Ladder Room",
          "badges": ["corridor"]
        },

        "branching_corridors_narrow": {
          "name": "Branching Corridors Narrow",
          "badges": ["maze"]
        },

        "branching_corridors_thick": {
          "name": "Branching Corridors Thick",
          "badges": ["maze"]
        },

        "shadowed_caverns": {
          "name": "Shadowed Caverns",
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

          "badges": ["cave", "dark"]
        },

        "scorched_desert": {
          "name": "Scorched Desert",
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

          "badges": ["field", "desert"]
        },

        "echo_vaults": {
          "name": "Echo Vaults",
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

          "badges": ["cave", "resonance", "structure"]
        },

        "sun_kings_processional": {
          "name": "Sun Kings Processional",
          "description": "中央の葬祭道が続く荘厳な地下墓所のレイアウト",
          "badges": ["ruins", "desert", "ceremonial"]
        },

        "sun_kings_terraced_courts": {
          "name": "Sun Kings Terraced Courts",
          "description": "階段状の聖域と水鏡の庭を備えた視覚重視の複合寺院",
          "badges": ["ruins", "desert", "symmetry"]
        },

        "sun_kings_sunken_sanctum": {
          "name": "Sun Kings Sunken Sanctum",
          "description": "青い沈殿池と放射状の回廊が広がる地下聖域",
          "badges": ["ruins", "desert", "grand"]
        },

        "emberglass_caverns": {
          "name": "Emberglass Caverns",
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

          "badges": ["cave", "lava", "crystal"]
        },

        "verdant_forest": {
          "name": "Verdant Forest",
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

          "badges": ["cave", "forest"]
        },

        "fungal_bloom": {
          "name": "Fungal Bloom",
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

          "badges": ["organic", "poison", "cave"]
        },

        "ring_linked_rooms": {
          "name": "Ring Linked Rooms",
          "badges": ["rooms"]
        },

        "hex_lattice_rooms": {
          "name": "Hex Lattice Rooms",
          "badges": ["sf", "grid"]
        },

        "bubble_rooms": {
          "name": "Bubble Rooms",
          "badges": ["organic", "rooms"]
        },

        "spiral_room": {
          "name": "Spiral Room",
          "badges": ["maze"]
        },

        "circular_tower": {
          "name": "Circular Tower",
          "badges": ["rooms"]
        },

        "square_tower": {
          "name": "Square Tower",
          "badges": ["rooms"]
        },

        "diamond_room": {
          "name": "Diamond Room",
          "badges": ["single"]
        },

        "triangle_room": {
          "name": "Triangle Room",
          "badges": ["single"]
        },

        "structure_mosaic": {
          "name": "Structure Mosaic",
          "badges": ["rooms", "modular"]
        },

        "geo_fixed_labyrinth": {
          "name": "Geo Fixed Labyrinth",
          "description": "固定マップを用いた幾何学迷宮。各階層のレイアウトを固定しつつ構造APIのテンプレートとして利用できます。",

          "blocks": {
            "geo_fixed_trial": {
              "name": "Geo Fixed Trial"
            }
          },

          "badges": ["fixed", "rooms"]
        },

        "grand_medieval_city": {
          "name": "Grand Medieval City",
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
          "name": "Grand Medieval City Canals",
          "description": "運河と港湾地区が交差する水辺の中世都市区画"
        },

        "grand_medieval_city_hill": {
          "name": "Grand Medieval City Hill",
          "description": "段丘状に城塞がそびえる丘陵の王城地区"
        },

        "grand_medieval_city_markets": {
          "name": "Grand Medieval City Markets",
          "description": "ギルド街と市場が格子状に連なる商業区画"
        },

        "blood_vein_catacombs": {
          "name": "Blood Vein Catacombs",
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

          "badges": ["horror", "organic", "maze"]
        },

        "shattered_manor": {
          "name": "Shattered Manor",
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

          "badges": ["horror", "rooms", "trap"]
        },

        "midnight_carnival": {
          "name": "Midnight Carnival",
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

          "badges": ["horror", "festival", "ring"]
        },

        "ashen_asylum": {
          "name": "Ashen Asylum",
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

          "badges": ["horror", "rooms", "grid"]
        },

        "phantom_haunted_house": {
          "name": "Phantom Haunted House",
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

          "badges": ["horror", "rooms", "haunted"]
        },

        "dusk_graveyard": {
          "name": "Dusk Graveyard",
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

          "badges": ["horror", "outdoor", "graveyard"]
        },

        "wailing_mire": {
          "name": "Wailing Mire",
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

          "badges": ["horror", "organic", "swamp"]
        },

        "bell_foundry": {
          "name": "Bell Foundry",
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

          "badges": ["horror", "industrial", "radial"]
        },

        "gallows_spiral": {
          "name": "Gallows Spiral",
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

          "badges": ["horror", "spiral", "vertical"]
        },

        "icy_caverns": {
          "name": "Icy Caverns",
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

          "badges": ["cave", "organic"]
        },

        "irradiated_plains": {
          "name": "Irradiated Plains",
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

          "badges": ["field", "poison"]
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

          "badges": ["cave"]
        },

        "luminescent_glade": {
          "name": "Luminescent Glade",
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

          "badges": ["forest", "bioluminescent", "mystic"]
        },

        "medieval_stronghold": {
          "name": "Medieval Stronghold",
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

          "badges": ["castle", "city", "medieval"]
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
          "name": "Neo Research Atrium",
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

          "badges": ["futuristic", "research", "circular"]
        },

        "neo_circuit_grid": {
          "name": "Neo Circuit Grid",
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

          "badges": ["urban", "lab", "grid"]
        },

        "neo_skyrail_tiered": {
          "name": "Neo Skyrail Tiered",
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

          "badges": ["transport", "future", "open"]
        },

        "neo_quantum_helix": {
          "name": "Neo Quantum Helix",
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

          "badges": ["research", "quantum", "dynamic"]
        },

        "neo_biodome_cascade": {
          "name": "Neo Biodome Cascade",
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

          "badges": ["bio", "garden", "future"]
        },

        "neo_coolant_vault": {
          "name": "Neo Coolant Vault",
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

          "badges": ["industrial", "maintenance", "lab"]
        },

        "neo_holo_district": {
          "name": "Neo Holo District",
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

          "badges": ["urban", "hologram", "future"]
        },

        "oneway_labyrinth": {
          "name": "Oneway Labyrinth",
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

          "badges": ["labyrinth", "hazard"]
        },

        "overgrown_ruins": {
          "name": "Overgrown Ruins",
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

          "badges": ["rooms"]
        },

        "paddy_field_paths": {
          "name": "Paddy Field Paths",
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

          "badges": ["field", "agriculture", "rural"]
        },

        "toxic_boglands": {
          "name": "Toxic Boglands",
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

          "badges": ["open-space", "poison"]
        },

        "prismatic_stalactites": {
          "name": "Prismatic Stalactites",
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

          "badges": ["cave", "crystal", "light"]
        },

        "retro_overworld": {
          "name": "Retro Overworld",
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

          "badges": ["field", "overworld", "retro", "biome"]
        },

        "ring_city": {
          "name": "Ring City",
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

          "badges": ["structured", "rooms"]
        },

        "ruined_labyrinth": {
          "name": "Ruined Labyrinth",
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

          "badges": ["maze", "ruins"]
        },

        "sandstorm_dunes": {
          "name": "Sandstorm Dunes",
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

          "badges": ["field", "desert", "dark"]
        },

        "serpentine_river": {
          "name": "Serpentine River",
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

          "badges": ["snake", "corridor"]
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
          "name": "Skyward Bastions",
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

          "badges": ["void", "bridge", "ice"]
        },

        "starlit_canopy": {
          "name": "Starlit Canopy",
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

          "badges": ["forest", "night", "celestial"]
        },

        "tidal_catacombs": {
          "name": "Tidal Catacombs",
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

          "badges": ["water", "tiered"]
        },

        "underground_prison": {
          "name": "Underground Prison",
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

          "badges": ["structured", "rooms"]
        },

        "visceral_chambers": {
          "name": "Visceral Chambers",
          "description": "鼓動する肉腔が連結する血の池。拍動する管が冒険者を包囲する。",
          "badges": ["organic", "horror", "pulse"]
        },

        "arterial_sprawl": {
          "name": "Arterial Sprawl",
          "description": "奔流する血管が網状に広がり、血栓の巣が点在する粘性ダンジョン。",
          "badges": ["organic", "network", "hazard"]
        },

        "necrotic_warrens": {
          "name": "Necrotic Warrens",
          "description": "壊死した肉塊が崩落し続ける洞穴。腐臭の靄が立ち込める。",
          "badges": ["cavern", "decay", "maze"]
        },

        "clotted_catacombs": {
          "name": "Clotted Catacombs",
          "description": "凝り固まった血塊で形成された部屋と廊下が重層に交わる。",
          "badges": ["catacomb", "grid", "hazard"]
        },

        "cadaverous_labyrinth": {
          "name": "Cadaverous Labyrinth",
          "description": "収容された遺体の袋が通路を侵食し、恐怖の血路が迷走する。",
          "badges": ["maze", "organic", "ambient"]
        },

        "surgical_theatre": {
          "name": "Surgical Theatre",
          "description": "円形の観覧席が血の舞台を囲い、焦げた鉄の匂いが漂う。",
          "badges": ["arena", "ritual", "hazard"]
        },

        "forensic_gallery": {
          "name": "Forensic Gallery",
          "description": "血で封じられた展示室が連なる。標本棚には凍った証拠が煌めく。",
          "badges": ["gallery", "puzzle", "organic"]
        },

        "coagulated_pits": {
          "name": "Coagulated Pits",
          "description": "血餅だまりが底無しの落とし穴となり、噛み締めるように獲物を沈める。",
          "badges": ["pit", "hazard", "organic"]
        },

        "morgue_silos": {
          "name": "Morgue Silos",
          "description": "垂直に伸びる収容筒と搬送路が格子状に組み合わさる冷たい死庫。",
          "badges": ["industrial", "vertical", "horror"]
        },

        "thanatology_sanctum": {
          "name": "Thanatology Sanctum",
          "description": "死を解析する祭壇が幾重にも広がる幾何学的な血の聖堂。",
          "badges": ["ritual", "sacred", "labyrinth"]
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
        }
      },

      "badges": {
        "abyss": "Abyss",
        "agriculture": "Agriculture",
        "ambient": "Ambient",
        "ancient": "Ancient",
        "arcane": "Arcane",
        "archaeology": "Archaeology",
        "archive": "Archive",
        "arena": "Arena",
        "astral": "Astral",
        "autumn": "Autumn",
        "bamboo": "Bamboo",
        "beach": "Beach",
        "bio": "Bio",
        "bioluminescent": "Bioluminescent",
        "biome": "Biome",
        "bomb": "Bomb",
        "bridge": "Bridge",
        "canal": "Canal",
        "castle": "Castle",
        "catacomb": "Catacomb",
        "cave": "Cave",
        "cavern": "Cavern",
        "celestial": "Celestial",
        "ceremonial": "Ceremonial",
        "ceremony": "Ceremony",
        "circular": "Circular",
        "city": "City",
        "cloister": "Cloister",
        "corridor": "Corridor",
        "crescent": "Crescent",
        "crypt": "Crypt",
        "crystal": "Crystal",
        "dark": "Dark",
        "decay": "Decay",
        "defense": "Defense",
        "desert": "Desert",
        "dragon": "Dragon",
        "dynamic": "Dynamic",
        "engineered": "Engineered",
        "erosion": "Erosion",
        "festival": "Festival",
        "field": "Field",
        "fixed": "Fixed",
        "floating": "Floating",
        "forest": "Forest",
        "forge": "Forge",
        "fortress": "Fortress",
        "future": "Future",
        "futuristic": "Futuristic",
        "gallery": "Gallery",
        "garden": "Garden",
        "grand": "Grand",
        "graveyard": "Graveyard",
        "grid": "Grid",
        "haunted": "Haunted",
        "hazard": "Hazard",
        "heat": "Heat",
        "hologram": "Hologram",
        "holy": "Holy",
        "horror": "Horror",
        "ice": "Ice",
        "imperial": "Imperial",
        "industrial": "Industrial",
        "lab": "Lab",
        "labyrinth": "Labyrinth",
        "lantern": "Lantern",
        "lava": "Lava",
        "layered": "Layered",
        "library": "Library",
        "light": "Light",
        "maintenance": "Maintenance",
        "market": "Market",
        "maze": "Maze",
        "mechanical": "Mechanical",
        "medieval": "Medieval",
        "mirage": "Mirage",
        "mist": "Mist",
        "modular": "Modular",
        "mystery": "Mystery",
        "mystic": "Mystic",
        "nature": "Nature",
        "network": "Network",
        "night": "Night",
        "open": "Open",
        "open-space": "Open Space",
        "organic": "Organic",
        "outdoor": "Outdoor",
        "overworld": "Overworld",
        "pavilion": "Pavilion",
        "pit": "Pit",
        "poison": "Poison",
        "pulse": "Pulse",
        "puzzle": "Puzzle",
        "quantum": "Quantum",
        "radial": "Radial",
        "reef": "Reef",
        "research": "Research",
        "resonance": "Resonance",
        "retro": "Retro",
        "ring": "Ring",
        "rings": "Rings",
        "ritual": "Ritual",
        "rooms": "Rooms",
        "royal": "Royal",
        "ruins": "Ruins",
        "rural": "Rural",
        "sacred": "Sacred",
        "sanctuary": "Sanctuary",
        "serpentine": "Serpentine",
        "sf": "Sf",
        "single": "Single",
        "sky": "Sky",
        "snake": "Snake",
        "spiral": "Spiral",
        "stage": "Stage",
        "storm": "Storm",
        "stream": "Stream",
        "structure": "Structure",
        "structured": "Structured",
        "swamp": "Swamp",
        "symmetric": "Symmetric",
        "symmetry": "Symmetry",
        "tea": "Tea",
        "temple": "Temple",
        "terrace": "Terrace",
        "theater": "Theater",
        "tiered": "Tiered",
        "transport": "Transport",
        "trap": "Trap",
        "underground": "Underground",
        "undersea": "Undersea",
        "urban": "Urban",
        "vertical": "Vertical",
        "void": "Void",
        "water": "Water",
        "wind": "Wind"
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
      }
    },

    "minigame": {
      "checkers": {
        "hud": {
          "turn": {
            "playerPrompt": "Your turn - select a piece to move",
            "aiThinking": "AI thinking..."
          },
          "expHint": "Move: +1 EXP / Capture: +6 EXP per piece / Promotion: +12 EXP"
        },
        "overlay": {
          "defaultTitle": "Game Over",
          "restartHint": "Press R to restart",
          "result": {
            "win": "Victory!",
            "loss": "Defeat..."
          }
        }
      },
      "othello": {
        "hud": {
          "status": {
            "ended": "Game Over",
            "playerTurn": "Your turn (click to place)",
            "aiTurn": "AI turn"
          }
        },
        "overlay": {
          "title": "Game Over",
          "restartHint": "Press R to restart",
          "result": {
            "win": "You win!",
            "loss": "You lose…",
            "draw": "Draw"
          }
        },
        "popup": {
          "movePreview": "{flips} flips / approx +{xp} EXP"
        }
      },
      "connect6": {
        "hud": {
          "status": {
            "ended": "Game Over",
            "playerTurn": "Your turn",
            "aiTurn": "AI turn"
          }
        },
        "overlay": {
          "title": "Game Over",
          "restartHint": "Press R to reset",
          "result": {
            "win": "You win!",
            "draw": "Draw",
            "loss": "AI wins..."
          }
        },
        "popups": {
          "defense": "Countered",
          "checkmate": "Checkmate threat",
          "winning": "Winning move",
          "pressured": "Pressured move",
          "chasing": "Chasing move"
        }
      },
      "gomoku": {
        "hud": {
          "status": {
            "ended": "Game Over",
            "playerTurn": "Your turn",
            "aiTurn": "AI turn"
          }
        },
        "overlay": {
          "title": "Game Over",
          "restartHint": "Press R to reset",
          "result": {
            "win": "You win!",
            "draw": "Draw",
            "loss": "AI wins..."
          }
        },
        "popups": {
          "defense": "Countered",
          "checkmate": "Checkmate threat",
          "winning": "Winning move",
          "pressured": "Pressured move",
          "chasing": "Chasing move"
        }
      },
      "renju": {
        "hud": {
          "status": {
            "ended": "Game Over",
            "playerTurn": "Your turn",
            "aiTurn": "AI turn"
          }
        },
        "overlay": {
          "title": "Game Over",
          "restartHint": "Press R to reset",
          "result": {
            "win": "You win!",
            "draw": "Draw",
            "loss": "AI wins..."
          }
        },
        "popups": {
          "defense": "Countered",
          "checkmate": "Checkmate threat",
          "winning": "Winning move",
          "pressured": "Pressured move",
          "chasing": "Chasing move"
        },
        "renju": {
          "foulLabel": {
            "overline": "Forbidden move: Overline",
            "doubleFour": "Forbidden move: Double four",
            "doubleThree": "Forbidden move: Double three"
          },
          "genericFoul": "Forbidden move"
        }
      },
      "connect4": {
        "hud": {
          "status": {
            "ended": "Game Over",
            "playerTurn": "Your turn",
            "aiTurn": "AI turn"
          }
        },
        "overlay": {
          "title": "Game Over",
          "restartHint": "Press R to reset",
          "result": {
            "win": "You win!",
            "draw": "Draw",
            "loss": "AI wins..."
          }
        },
        "popups": {
          "defense": "Countered",
          "checkmate": "Checkmate threat",
          "winning": "Winning move",
          "pressured": "Pressured move",
          "chasing": "Chasing move"
        }
      },
      "tic_tac_toe": {
        "hud": {
          "status": {
            "ended": "Game Over",
            "playerTurn": "Your turn",
            "aiTurn": "AI turn"
          }
        },
        "overlay": {
          "title": "Game Over",
          "restartHint": "Press R to reset",
          "result": {
            "win": "You win!",
            "draw": "Draw",
            "loss": "AI wins..."
          }
        },
        "popups": {
          "defense": "Countered",
          "checkmate": "Checkmate threat",
          "winning": "Winning move",
          "pressured": "Pressured move",
          "chasing": "Chasing move"
        }
      },
      "riichi_mahjong": {
        "title": "Riichi Mahjong Lite",
        "subtitle": "Play a single-hand riichi mahjong round against three AI opponents with riichi/tsumo/ron.",
        "info": {
          "roundLabel": "Round",
          "dealerLabel": "Dealer",
          "doraLabel": "Dora",
          "remainingLabel": "Tiles left",
          "riichiSticksLabel": "Riichi sticks",
          "roundValue": "{seat} {round}",
          "none": "None",
          "doraLine": "Dora: {tiles}",
          "potLine": "Sticks: {sticks} / Tiles left: {tiles}"
        },
        "buttons": {
          "tsumo": "Tsumo",
          "ron": "Ron",
          "riichi": "Riichi",
          "cancel": "Cancel"
        },
        "players": {
          "youWithSeat": "You ({seat})",
          "aiWithSeat": "AI {seat}"
        },
        "seats": {
          "E": "East",
          "S": "South",
          "W": "West",
          "N": "North"
        },
        "tiles": {
          "suits": {
            "m": "{rank} Man",
            "p": "{rank} Pin",
            "s": "{rank} Sou"
          },
          "honors": {
            "E": "East",
            "S": "South",
            "W": "West",
            "N": "North",
            "P": "White",
            "F": "Green",
            "C": "Red"
          }
        },
        "hud": {
          "scoreValue": "{value} pts",
          "tags": {
            "dealer": "Dealer",
            "riichi": "Riichi"
          },
          "waits": "Waits: {tiles}"
        },
        "yaku": {
          "chiitoitsu": "Chiitoitsu",
          "riichi": "Riichi",
          "menzenTsumo": "Menzen Tsumo",
          "tanyao": "Tanyao",
          "dora": "Dora",
          "yakuhai": "Yakuhai",
          "pinfu": "Pinfu"
        },
        "fuReasons": {
          "closedRon": "Closed ron +10",
          "selfDraw": "Tsumo +2",
          "seatWindPair": "Seat wind pair +2",
          "roundWindPair": "Round wind pair +2",
          "dragonPair": "Dragon pair +2",
          "terminalKan": "Terminal triplet +8",
          "middleTriplet": "Simple triplet +4",
          "honorTriplet": "Honor triplet +8"
        },
        "result": {
          "tsumoDealer": "Tsumo {value} all",
          "tsumoNonDealer": "Tsumo dealer {dealer} / non-dealer {other}",
          "ron": "Ron {value}"
        },
        "log": {
          "roundStart": "--- {seat} {round} Dealer: {dealer} ---",
          "doraIndicator": "Dora indicator: {indicator} → Dora {dora}",
          "draw": "Draw: {tile}",
          "riichiInsufficient": "Not enough points to declare riichi",
          "riichiDeclaration": "Riichi declared! Placed a 1000-point stick.",
          "discardPlayer": "Discard: {tile}",
          "ronWin": "{player} won by ron with {tile}!",
          "handWin": "{player} wins! {han} han {fu} fu {description}",
          "yaku": "Yaku: {list}",
          "riichiBonus": "Collected {sticks} riichi sticks (+{bonus})",
          "drawRound": "Draw ({reason})",
          "tenpaiList": "Tenpai: {list}",
          "allNoten": "All players in noten",
          "tenpaiSplit": "Distributed noten payments",
          "finalResult": "Final result: {list}",
          "tsumoWin": "{player} won by tsumo!",
          "aiRiichi": "{player} declared riichi!",
          "discardOther": "{player} discarded {tile}",
          "drawReason": {
            "exhaustive": "Exhaustive draw"
          }
        },
        "rewards": {
          "riichiDeclaration": "Riichi declaration",
          "ronWin": "Ron win",
          "tsumoWin": "Tsumo win",
          "matchComplete": "Match complete"
        }
      }
    },
    "tools": {
      "sidebar": {
        "ariaLabel": "Tools list",
        "modMaker": {
          "label": "Dungeon Mod Maker",
          "hint": "Assemble structures and algorithms to export a `registerDungeonAddon` file."
        },
        "sandbox": {
          "label": "Sandbox Dungeon",
          "hint": "Build test dungeons with free layouts and enemies (no EXP)."
        },
        "blockdata": {
          "label": "BlockData Editor",
          "hint": "Inspect and edit BlockDim block definitions via GUI and export JSON."
        },
        "imageViewer": {
          "label": "Image Viewer",
          "hint": "Review screenshots with zoom, rotation, perspective, and metadata."
        },
        "stateManager": {
          "label": "State Manager",
          "hint": "Export or import all game and tool data in one bundle."
        }
      },
      "modMaker": {
        "panelAriaLabel": "Dungeon Type Mod Maker",
        "header": {
          "title": "Dungeon Type Mod Maker",
          "description": "Export addon JS with metadata, structure patterns, generation algorithms, and BlockDim blocks."
        },
        "meta": {
          "title": "Addon Info",
          "fields": {
            "id": {
              "label": "Addon ID",
              "placeholder": "e.g. custom_pack"
            },
            "name": {
              "label": "Display Name",
              "placeholder": "e.g. Custom Dungeon Pack"
            },
            "version": {
              "label": "Version"
            },
            "author": {
              "label": "Author",
              "placeholder": "Your name"
            },
            "description": {
              "label": "Description",
              "placeholder": "Overall addon description"
            }
          }
        },
        "structures": {
          "title": "Structure Library",
          "actions": {
            "add": "+ Add Structure",
            "remove": "Remove Selection"
          },
          "listAria": "Structure list",
          "fields": {
            "id": {
              "label": "ID",
              "placeholder": "e.g. custom_room"
            },
            "name": {
              "label": "Name",
              "placeholder": "Display label"
            },
            "anchorX": {
              "label": "Anchor X"
            },
            "anchorY": {
              "label": "Anchor Y"
            },
            "tags": {
              "label": "Tags (comma-separated)",
              "placeholder": "e.g. rooms,geo"
            },
            "allowRotate": {
              "label": "Allow rotation"
            },
            "allowMirror": {
              "label": "Allow mirroring"
            },
            "width": {
              "label": "Width"
            },
            "height": {
              "label": "Height"
            },
            "preview": {
              "label": "Pattern Preview"
            }
          },
          "grid": {
            "hint": "Click cells to cycle: empty → floor → wall",
            "fillEmpty": "All empty",
            "fillFloor": "All floor",
            "fillWall": "All wall",
            "ariaLabel": "Structure pattern"
          },
          "defaultItem": "Structure {index}"
        },
        "placeholders": {
          "structurePreview": "Add a structure to preview it here.",
          "fixedDisabled": "Enable fixed maps to edit them.",
          "fixedAddFloor": "Add floors to configure fixed layouts."
        },
        "fixed": {
          "title": "Fixed Maps",
          "enable": {
            "label": "Use fixed maps"
          },
          "fields": {
            "floorCount": {
              "label": "Floor count"
            },
            "bossFloors": {
              "label": "Boss floors (comma-separated)",
              "placeholder": "e.g. 5,10"
            },
            "width": {
              "label": "Width"
            },
            "height": {
              "label": "Height"
            }
          },
          "note": "Call <code>ctx.fixedMaps.applyCurrent()</code> in the algorithm to apply that floor's fixed map.",
          "floorListAria": "Fixed map floors",
          "actions": {
            "copyPrevious": "Copy previous floor"
          },
          "grid": {
            "hint": "Click cells to cycle: wall → floor → empty",
            "fillWall": "All walls",
            "fillFloor": "All floor",
            "fillVoid": "All empty",
            "ariaLabel": "Fixed map pattern"
          }
        },
        "generators": {
          "title": "Generation Algorithms",
          "actions": {
            "add": "+ Add Generator",
            "remove": "Remove Selection"
          },
          "listAria": "Generator list",
          "fields": {
            "id": {
              "label": "ID",
              "placeholder": "e.g. custom-dungeon"
            },
            "name": {
              "label": "Name",
              "placeholder": "Dungeon name"
            },
            "description": {
              "label": "Description",
              "placeholder": "Summary shown in lists"
            },
            "normalMix": {
              "label": "Normal mix ratio"
            },
            "blockMix": {
              "label": "BlockDim mix ratio"
            },
            "tags": {
              "label": "Tags (comma-separated)",
              "placeholder": "e.g. rooms,organic"
            },
            "dark": {
              "label": "Dark (vision radius 5)"
            },
            "poison": {
              "label": "Poison fog (normal tiles become poison)"
            },
            "code": {
              "label": "Algorithm Code"
            }
          },
          "template": {
            "label": "Template",
            "options": {
              "blank": "Empty template",
              "rooms": "Rooms & corridors sample",
              "structure": "Structure placement sample",
              "fixed": "Fixed map helper"
            },
            "apply": "Apply selected template"
          },
          "defaultItem": "Generator {index}"
        },
        "blocks": {
          "title": "BlockDim Block Definitions",
          "actions": {
            "addFirst": "+ 1st",
            "addSecond": "+ 2nd",
            "addThird": "+ 3rd"
          },
          "tiers": {
            "firstHeading": "1st Blocks",
            "secondHeading": "2nd Blocks",
            "thirdHeading": "3rd Blocks",
            "firstAria": "1st block tier",
            "secondAria": "2nd block tier",
            "thirdAria": "3rd block tier"
          },
          "empty": "No entries yet. Use the add buttons above to create one.",
          "remove": "Remove",
          "fields": {
            "key": {
              "label": "Key"
            },
            "name": {
              "label": "Name"
            },
            "level": {
              "label": "Level offset",
              "placeholder": "e.g. +0"
            },
            "size": {
              "label": "Size offset",
              "placeholder": "e.g. +1"
            },
            "depth": {
              "label": "Depth offset",
              "placeholder": "e.g. +1"
            },
            "chest": {
              "label": "Chest type",
              "placeholder": "normal/more/less"
            },
            "type": {
              "label": "Type ID",
              "placeholder": "e.g. custom-dungeon"
            },
            "bossFloors": {
              "label": "Boss floors",
              "placeholder": "e.g. 5,10,15"
            },
            "description": {
              "label": "Notes / description"
            }
          },
          "defaultTitle": "{tier} #{index}"
        },
        "output": {
          "title": "Output"
        },
        "actions": {
          "copy": "Copy to clipboard",
          "download": "Download as .js file"
        },
        "status": {
          "errorHeading": "⚠️ {count} issue(s) to review",
          "ready": "✅ Ready to export"
        },
        "feedback": {
          "copySuccess": "Copied!",
          "copyFailed": "Copy failed"
        },
        "templates": {
          "todoComment": "  // TODO: edit ctx.map to generate the dungeon."
        },
        "errors": {
          "missingAddonId": "Addon ID is required.",
          "invalidAddonId": "Addon ID may only use alphanumeric characters, hyphen, or underscore.",
          "structureMissingId": "Enter an ID for structure {index}.",
          "structureDuplicateId": "Structure ID \"{id}\" is duplicated.",
          "structureAnchorOutOfRange": "Structure {index} anchor is out of range.",
          "generatorMissing": "Add at least one generator.",
          "generatorMissingId": "Enter an ID for generator {index}.",
          "generatorDuplicateId": "Generator ID \"{id}\" is duplicated.",
          "generatorNormalRange": "Generator {index} normal mix must be between 0 and 1.",
          "generatorBlockRange": "Generator {index} BlockDim mix must be between 0 and 1.",
          "generatorMissingCode": "Enter algorithm code for generator {index}.",
          "blockMissingKey": "Enter the key for {tier} block {index}.",
          "blockDuplicateKey": "Block key \"{key}\" is duplicated.",
          "generatorFixedMissing": "Generator {index} is missing fixed map layouts.",
          "generatorFixedFloorMissing": "Generator {index} is missing the fixed map for floor {floor}.",
          "generatorFixedFloorEmpty": "Generator {index} floor {floor} fixed map has no floor tiles."
        }
      }
    },

    "achievements": {
      "categories": {
        "dungeon": "Dungeon",
        "blockdim": "Block Dimension",
        "hatena": "Hatena Blocks",
        "tools": "Tools",
        "mini": "Mini-Games"
      },
      "messages": {
        "categoryComingSoon": "Achievements are coming soon.",
        "emptyCategory": "No achievements are registered yet."
      },
      "status": {
        "comingSoon": "COMING SOON",
        "unlocked": "Unlocked",
        "locked": "Locked"
      },
      "rewardMemo": "Reward memo: {reward}",
      "summary": {
        "comingSoon": "Coming Soon"
      },
      "meta": {
        "repeatableCount": "Total completions: {count}",
        "counterCount": "Count: {count}"
      },
      "progress": {
        "ratio": "{current} / {target}",
        "floorRatio": "{current}F / {target}F",
        "bossDefeated": "{count} bosses defeated",
        "nextRuns": "{count} runs until next milestone",
        "completed": "Completed!",
        "remaining": "{count} more to go",
        "actions": "{count} actions",
        "duration": {
          "full": "{hours}h {minutesValue}m {secondsValue}s",
          "minutes": "{minutes}m {secondsValue}s",
          "seconds": "{seconds}s",
          "ratio": "{current} / {target}"
        }
      },
      "auto": {
        "dungeon_first_clear": {
          "title": "First Victory",
          "description": "Clear any dungeon.",
          "reward": "Title: \"Rookie Adventurer\""
        },
        "dungeon_hard_clear": {
          "title": "Hard Conqueror",
          "description": "Clear a dungeon on Hard difficulty or above.",
          "reward": "High-Difficulty Commemorative Medal"
        },
        "dungeon_step_1000": {
          "title": "A Thousand Steps",
          "description": "Reach a total travel distance of 1,000 tiles.",
          "reward": "Movement Know-How Notes"
        },
        "dungeon_boss_hunter": {
          "title": "Boss Hunter",
          "description": "Boss defeats count directly toward this achievement.",
          "reward": "Title: \"Hunter\""
        },
        "dungeon_loop_runner": {
          "title": "Loop Master",
          "description": "Gain progress every 5 dungeon clears.",
          "reward": "Loop Log Card"
        },
        "dungeon_floor_master": {
          "title": "Abyss Walker",
          "description": "Reach floor 30 or deeper.",
          "reward": "Title: \"Abyss Walker\""
        },
        "dungeon_healing_specialist": {
          "title": "Emergency Healer",
          "description": "Use healing items 25 times.",
          "reward": "Healing Manual"
        },
        "dungeon_auto_guardian": {
          "title": "Auto Guardian",
          "description": "Trigger auto items 10 times.",
          "reward": "Auto-Recovery Core"
        },
        "dungeon_playtime_30min": {
          "title": "Adventure Begins",
          "description": "Reach 30 minutes of total play time.",
          "reward": "Pocket Hourglass"
        },
        "dungeon_playtime_3hour": {
          "title": "Lost in Time",
          "description": "Reach 3 hours of total play time.",
          "reward": "Veteran Adventurer Watch"
        },
        "dungeon_playtime_12hour": {
          "title": "Endless Explorer",
          "description": "Reach 12 hours of total play time.",
          "reward": "Chrono Compass"
        },
        "dungeon_rare_collector": {
          "title": "Rare Collector",
          "description": "Open 10 rare chests.",
          "reward": "Rare Key Fragment"
        },
        "dungeon_iron_wall": {
          "title": "Iron Survivor",
          "description": "Experience 10,000 total damage taken.",
          "reward": "Iron Wall Shield"
        },
        "blockdim_first_gate": {
          "title": "Gate Initiation",
          "description": "Enter the block dimension via Gate for the first time.",
          "reward": "Gate Activation Log"
        },
        "blockdim_bookmark_collector": {
          "title": "Bookmark Collector",
          "description": "Register 5 block dimension bookmarks.",
          "reward": "Combination Research Notes"
        },
        "blockdim_weighted_explorer": {
          "title": "Sharpshooter Synthesist",
          "description": "Use a weighted random selection.",
          "reward": "Sharpshooting Formula"
        },
        "hatena_first_trigger": {
          "title": "Mystery Encounter",
          "description": "Trigger a hatena block for the first time.",
          "reward": "Investigation Log \"?\""
        },
        "hatena_block_researcher": {
          "title": "Hatena Research Team",
          "description": "Trigger hatena blocks 25 times.",
          "reward": "Observation Log Sheet"
        },
        "hatena_lucky_chain": {
          "title": "Luck Seeker",
          "description": "Gain 15 positive hatena effects.",
          "reward": "Lucky Charm"
        },
        "hatena_unlucky_survivor": {
          "title": "Misfortune Survivor",
          "description": "Survive 10 negative hatena effects.",
          "reward": "Endurance Medal"
        },
        "hatena_rare_hunter": {
          "title": "Shining Fortune",
          "description": "Spawn 3 rare chests from hatena blocks.",
          "reward": "Treasure Appraisal Lens"
        },
        "tools_first_visit": {
          "title": "Workshop Debut",
          "description": "Open the Tools tab.",
          "reward": "Work Logbook"
        },
        "tools_mod_export": {
          "title": "Addon Builder",
          "description": "Export code from the mod creation tool.",
          "reward": "Mod Signature Stamp"
        },
        "tools_blockdata_saver": {
          "title": "Data Maintainer",
          "description": "Save or download data from the BlockData editor.",
          "reward": "Maintenance Badge"
        },
        "tools_sandbox_session": {
          "title": "Simulation Enthusiast",
          "description": "Open the sandbox interface and edit.",
          "reward": "Test Pass"
        },
        "minigame_coming_soon": {
          "title": "Mini-Game Achievements",
          "description": "COMING SOON – mini-game achievements are on the way.",
          "reward": ""
        }
      }
    },
    "enemy": {
      "modal": {
        "noiseBlocked": "The noise is too strong to read the enemy's data...",
        "title": {
          "boss": "Boss Information",
          "standard": "Enemy Information"
        },
        "sections": {
          "damage": "Damage Forecast"
        },
        "labels": {
          "level": "Level:",
          "type": "Type:",
          "hp": "HP:",
          "attack": "Attack:",
          "defense": "Defense:",
          "damageDeal": "Damage Dealt:",
          "damageTake": "Damage Taken:",
          "hitRate": "Hit Rate:",
          "enemyHitRate": "Enemy Hit Rate:"
        },
        "levelFormat": "Lv.{level}",
        "typeDescription": {
          "suppressed": "{description} (Special effects suppressed due to level gap)"
        },
        "damage": {
          "invincibleLabel": "Invincible",
          "invincible": "0 ({label})",
          "critLabel": "Crit",
          "reverseLabel": "Heal",
          "reverseRange": "{reverseLabel} {min}-{max} ({critLabel}: {critMin}-{critMax})",
          "range": "{min}-{max} ({critLabel}: {critMin}-{critMax})"
        },
        "hitRate": "{value}%",
        "enemyHitRate": "{value}%"
      },
      "types": {
        "normal": {
          "label": "Standard",
          "description": "Performs no special actions."
        },
        "statusCaster": {
          "label": "Status Caster",
          "description": "May inflict poison or paralysis when its attacks connect."
        },
        "warper": {
          "label": "Warper",
          "description": "May warp the player to another tile on hit."
        },
        "executioner": {
          "label": "Executioner",
          "description": "A dangerous foe with a low chance of instant-death attacks."
        },
        "knockback": {
          "label": "Charger",
          "description": "Knocks the player back; colliding with walls deals extra damage."
        },
        "swift": {
          "label": "Swift Fighter",
          "description": "Moves quickly, taking two actions during the player's turn."
        }
      }
    },
    "dungeon": {
      "types": {
        "field": "Field Type",
        "cave": "Cave Type",
        "maze": "Maze Type",
        "rooms": "Rooms & Corridors",
        "single-room": "Single Room",
        "circle": "Circular Type",
        "narrow-maze": "Narrow Maze",
        "wide-maze": "Wide Maze",
        "snake": "Snake Type",
        "mixed": "Mixed Type",
        "circle-rooms": "Circular Rooms & Corridors",
        "grid": "Grid Type",
        "open-space": "Open Space"
      }
    },
    "dungeons": {
      "base": {
        "1": {
          "name": "Beginner's Forest",
          "description": "Obstacles scattered across a wide grassland."
        },
        "11": {
          "name": "Cavern of Gloom",
          "description": "A winding network of dark caves."
        },
        "21": {
          "name": "Ruined Labyrinth",
          "description": "Ancient ruins filled with an intricate maze."
        },
        "31": {
          "name": "Subterranean Temple",
          "description": "A temple composed of interconnected rooms and corridors."
        },
        "41": {
          "name": "Enchanted Garden",
          "description": "A circular garden overflowing with magic."
        },
        "51": {
          "name": "Crystal Caves",
          "description": "Serpentine caverns lined with crystal."
        },
        "61": {
          "name": "Ancient Labyrinth",
          "description": "A timeless, sprawling labyrinth."
        },
        "71": {
          "name": "Dragon's Lair",
          "description": "Circular chambers linked within a dragon's den."
        },
        "81": {
          "name": "Starry Expanse",
          "description": "A single vast hall beneath a star-filled sky."
        },
        "91": {
          "name": "Tower of Twilight",
          "description": "A tower at the world's end blending many layouts."
        },
        "X": {
          "name": "Realm of Extremes",
          "description": "A 25-floor ultimate dungeon."
        }
      }
    },
    "game": {
      "toolbar": {
        "back": "Back",
        "items": "Items",
        "skills": "Skills",
        "status": "Status",
        "import": "Import",
        "export": "Export",
        "toggleDungeonName": "Show dungeon name",
        "sandboxMenu": "Interactive",
        "godConsole": "Creator Console",
        "floor": {
          "heading": "Current Floor",
          "label": "FLOOR"
        }
      },
      "dungeonOverlay": {
        "label": "Dungeon Traits",
        "titleFallback": "Dungeon",
        "typePlaceholder": "Field Type",
        "descriptionPlaceholder": "Dungeon traits appear here.",
        "badge": {
          "none": "No notable traits",
          "dark": {
            "active": "Dark",
            "suppressed": "Dark (Suppressed)"
          },
          "poison": {
            "active": "Poison Fog",
            "suppressed": "Poison Fog (Suppressed)"
          },
          "noise": {
            "active": "Noise",
            "suppressed": "Noise (Suppressed)"
          },
          "nested": "NESTED x{value}"
        }
      },
      "playerStats": {
        "labels": {
          "level": "Level",
          "attackShort": "ATK",
          "defenseShort": "DEF",
          "hp": "HP",
          "satiety": "Satiety",
          "exp": "EXP",
          "sp": "SP"
        }
      },
      "autoItem": {
        "status": "Auto Items ON: Healing Items x {count}"
      },
      "common": {
        "count": "x {count}",
        "none": "None",
        "floor": "Floor {floor}"
      },
      "runResult": {
        "defaultCause": "Game Over"
      },
      "items": {
        "modal": {
          "title": "Items"
        },
        "countPrefix": "x",
        "actions": {
          "use": "Use",
          "eat": "Consume",
          "offer": "Offer",
          "cleanse": "Cleanse a status ailment",
          "throw": "Throw",
          "enable": "Enable",
          "close": "Close"
        },
        "autoItem": {
          "label": "Auto Item",
          "hint": "Automatically heals when HP falls below 30%."
        },
        "potion30": {
          "label": "30% HP Potion"
        },
        "hpBoost": {
          "label": "Max HP Boost Item"
        },
        "atkBoost": {
          "label": "Attack Boost Item"
        },
        "defBoost": {
          "label": "Defense Boost Item"
        },
        "hpBoostMajor": {
          "label": "Max HP Grand Boost (+25)"
        },
        "atkBoostMajor": {
          "label": "Attack Grand Boost (+10)"
        },
        "defBoostMajor": {
          "label": "Defense Grand Boost (+10)"
        },
        "spElixir": {
          "label": "SP Elixir"
        },
        "passiveOrbs": {
          "header": "Passive Orbs"
        },
        "skillCharms": {
          "header": "Skill Charms (10 turns each)"
        },
        "errors": {
          "noHealingItem": "No healing items available.",
          "noStatusToCleanse": "No status ailments to cleanse."
        }
      },
      "passiveOrb": {
        "summary": "Total {total} ({unique} types)",
        "empty": "You have no passive orbs.",
        "noEffects": "No effects.",
        "countDetail": "Owned {count}",
        "detailSeparator": " / ",
        "obtainDetail": " ({details})",
        "obtain": "Obtained passive orb \"{label}\"!{detail}",
        "orbs": {
          "attackBoost": { "name": "Attack +1% Orb" },
          "defenseBoost": { "name": "Defense +1% Orb" },
          "abilityBoost": { "name": "All Stats +1% Orb" },
          "maxHpBoost": { "name": "Max HP +10% Orb" },
          "statusGuard": { "name": "Ailment Guard Orb" },
          "enemySpecialGuard": { "name": "Enemy Special Guard Orb" },
          "poisonResist": { "name": "Poison Resist Orb" },
          "paralysisResist": { "name": "Paralysis Resist Orb" },
          "abilityDownResist": { "name": "Stat Down Resist Orb" },
          "levelDownResist": { "name": "Level Down Resist Orb" },
          "instantDeathResist": { "name": "Instant Death Resist Orb" },
          "knockbackResist": { "name": "Knockback Resist Orb" },
          "poisonDamageGuard": { "name": "Poison Damage Guard Orb" },
          "bombDamageGuard": { "name": "Bomb Damage Guard Orb" },
          "skillPowerBoost": { "name": "Skill Power +10% Orb" },
          "damageDealtBoost": { "name": "Damage Dealt +10% Orb" },
          "damageTakenGuard": { "name": "Damage Taken -10% Orb" },
          "evasionBoost": { "name": "Evasion +1% Orb" },
          "accuracyBoost": { "name": "Accuracy +1% Orb" },
          "critDamageBoost": { "name": "Critical Damage +10% Orb" }
        },
        "labels": {
          "maxHpMul": "Max HP",
          "attackMul": "Attack",
          "defenseMul": "Defense",
          "damageDealtMul": "Damage Dealt",
          "damageTakenMul": "Damage Taken",
          "skillPowerMul": "Skill Power",
          "accuracyMul": "Accuracy",
          "evasionMul": "Evasion",
          "critDamageMul": "Critical Damage",
          "statusChanceMul": "Status Chance",
          "enemySpecialChanceMul": "Enemy Special Chance",
          "poisonStatusChanceMul": "Poison Chance",
          "paralysisStatusChanceMul": "Paralysis Chance",
          "levelDownStatusChanceMul": "Level Down Chance",
          "instantDeathChanceMul": "Instant Death Chance",
          "knockbackChanceMul": "Knockback Chance",
          "poisonDamageMul": "Poison Damage",
          "bombDamageMul": "Bomb Damage",
          "abilityDownPenaltyMul": "Stat Down Severity",
          "status:poison": "Poison Chance",
          "status:paralysis": "Paralysis Chance",
          "status:levelDown": "Level Down Chance",
          "instantDeath": "Instant Death Chance",
          "enemySpecial:knockback": "Knockback Chance",
          "poison": "Poison Damage",
          "bomb": "Bomb Damage",
          "abilityDownPenalty": "Stat Down Severity"
        }
      },
      "skillCharms": {
        "use": "Use",
        "empty": "No charms owned."
      },
      "events": {
        "hatena": {
          "spawnSingle": "A mysterious ? block appeared!",
          "spawnMultiple": "{count} mysterious ? blocks appeared!",
          "bombGuard": "The explosion's impact was nullified!",
          "bombHeal": "The explosion reversed and restored {amount} HP!",
          "bombDamage": "The explosion dealt {amount} damage!",
          "bombDeath": "You were caught in the explosion… Game Over.",
          "itemObtained": "Received {item}!",
          "trigger": "You stepped on a ? block!",
          "levelUp": "Level increased by {amount}!",
          "levelNoChange": "But your level didn't change.",
          "levelDown": "Level decreased by {amount}...",
          "levelDownNoEffect": "Your level couldn't drop any further.",
          "expGain": "Gained {amount} EXP!",
          "expGainNone": "No EXP gained.",
          "expLoss": "Lost {amount} EXP...",
          "expLossNone": "No EXP was lost.",
          "enemyAmbush": "Enemies appeared around you!",
          "noEnemies": "But no enemies showed up.",
          "poisonGuarded": "Poison was prevented!",
          "statusNone": "No status ailment occurred.",
          "buffFailed": "The power-up failed to take effect.",
          "debuffNone": "No debuff occurred.",
          "rareChest": "A dazzling rare chest appeared!",
          "chestNoSpace": "No space was available for a chest.",
          "chest": "A chest appeared!",
          "noChest": "No chest appeared.",
          "chestRing": "You're surrounded by chests!",
          "nothing": "But nothing happened."
        },
        "skills": {
          "statusGuarded": "Skill effect nullified the status ailment!"
        },
        "sp": {
          "unlocked": "SP system unlocked!",
          "notUnlocked": "SP hasn't been unlocked yet.",
          "notEnough": "Not enough SP.",
          "maxIncreased": "SP cap increased to {value}!",
          "gained": "Gained {amount} SP.",
          "spent": "Spent {amount} SP.",
          "offered": "Offered a healing item and gained {amount} SP.",
          "offerLocked": "You can offer items once the SP system is unlocked.",
          "notUnlockedForItem": "You can't use that until SP is unlocked.",
          "noCapacity": "Your SP cap is 0, so it has no effect.",
          "alreadyFull": "SP is already full.",
          "elixirUsed": "Used an SP Elixir! Restored {amount} SP.",
          "fullyRestored": "SP fully restored (+{amount})."
        },
        "exp": {
          "bossBonusSuffix": " (Boss Bonus!)",
          "enemyGain": "Earned {amount} EXP!{bonus}",
          "spent": "Spent {amount} EXP. ({context})",
          "gained": "Earned {amount} EXP! ({context})"
        },
        "status": {
          "paralyzed": "You're paralyzed and can't move...",
          "paralyzedRemaining": "You're paralyzed and can't move... ({turns} turns left)",
          "cured": {
            "poison": "The poison wore off.",
            "paralysis": "You shook off the paralysis.",
            "abilityUp": "The power-up effect expired.",
            "abilityDown": "The stat penalty faded.",
            "levelDown": "Your temporary level drop ended."
          },
          "applied": {
            "poison": "You've been poisoned! ({turns} turns)",
            "paralysis": "You're paralyzed and can't move! ({turns} turns)",
            "abilityUp": "Power surges through you! Max HP/ATK/DEF up ({turns} turns)",
            "abilityDown": "Your stats dropped... Max HP/ATK/DEF down ({turns} turns)",
            "levelDown": "Your level temporarily decreased! ({turns} turns)"
          }
        },
        "sandbox": {
          "noExp": "Sandbox mode does not award EXP.",
          "started": "Sandbox mode started. EXP will not be awarded."
        },
        "console": {
          "executed": "Creator Console executed the code.",
          "error": "Creator Console Error: {message}"
        },
        "unlocks": {
          "nestedLegend": "Cleared NESTED 99999999 and attained Anos-class divinity!",
          "consoleAlwaysOn": "Creator Console and Sandbox toggle are now always available."
        },
        "actions": {
          "wallDestroyed": "You destroyed the wall!"
        },
        "dungeon": {
          "darkness": "Darkness shrouds your vision...",
          "poisonFog": "Poison fog fills the area! Even standard tiles are dangerous."
        },
        "charms": {
          "unknown": "An unknown charm can't be used.",
          "notOwned": "You don't own that charm.",
          "activated": "Activated the {label} charm! Effect lasts {turns} turns."
        },
        "satiety": {
          "enabled": "Satiety system enabled!",
          "disabled": "Satiety system disabled.",
          "cannotEat": "You can only eat while the satiety system is active.",
          "alreadyFull": "Satiety is already at maximum.",
          "damage": "Took {amount} damage from hunger!"
        },
        "chest": {
          "prefix": {
            "normal": "Opened the chest! ",
            "rare": "Opened the golden chest! "
          },
          "reward": {
            "potion30": "{prefix}Obtained an HP 30% potion!",
            "hpBoost": "{prefix}Obtained a Max HP Boost item!",
            "atkBoost": "{prefix}Obtained an Attack Boost item!",
            "defBoost": "{prefix}Obtained a Defense Boost item!"
          }
        },
        "goldenChest": {
          "elixir": "Found a special SP Elixir in the golden chest! SP greatly restored.",
          "openedSafely": "Opened the golden chest safely!",
          "prompt": "A golden chest! Time your press with the bar.",
          "major": {
            "hp": "Found a Max HP +{amount} elixir in the golden chest!",
            "atk": "Found an ATK +{amount} tactical orb in the golden chest!",
            "def": "Found a DEF +{amount} guardian shield card in the golden chest!"
          },
          "skillCharm": "Found a skill charm \"{effectName}\" in the golden chest! ({turns} turns)"
        },
        "combat": {
          "noEnemyInDirection": "No enemy in that direction!",
          "sureHitIneffective": "The level gap nullified the sure-hit effect...",
          "miss": "Miss",
          "enemyDefeated": "Defeated the enemy!",
          "bossGate": "You can't proceed until the boss is down!",
          "enemyMissed": "The enemy missed!",
          "enemyWarped": "Warped by the enemy's teleport attack!",
          "enemyAttackDamage": "The enemy dealt {amount} damage to you!",
          "enemyWarpPopup": "Warp",
          "statusResistedByLevel": "Level gap prevented the status ailment!",
          "teleportResistedByLevel": "Level gap let you withstand the warp!",
          "instantDeathResisted": "Level gap nullified the instant-death attack!",
          "instantDeathHit": "The enemy's instant-death attack landed…!",
          "knockbackResistedByLevel": "Level gap let you resist the knockback!",
          "playerDamage": "You dealt {amount} damage to the enemy!",
          "knockbackCollision": "Slammed into the wall and took {amount} damage!"
        },
        "orb": {
          "statusAttackNegated": "Orb's blessing nullified the status attack!",
          "statusAttackPrevented": "Orb's blessing blocked the status attack!",
          "statusPrevented": "Orb's blessing prevented the status ailment!",
          "teleportNegated": "Orb's blessing nullified the warp attack!",
          "teleportPrevented": "Orb's blessing blocked the warp attack!",
          "instantDeathNegated": "Orb's blessing nullified the instant-death attack!",
          "instantDeathPrevented": "Orb's blessing let you endure the instant-death attack!",
          "knockbackNegated": "Orb's blessing nullified the knockback!",
          "knockbackPrevented": "Orb's blessing blocked the knockback!"
        },
        "items": {
          "noPotion": "You don't have any potions.",
          "noOfferingItem": "No healing items available to offer.",
          "throwNoEnemies": "No enemies within throwing range.",
          "throwNoHealingItem": "No healing items to throw.",
          "throwNoTarget": "Found no target to throw at.",
          "throwIneffective": "The enemy's level is too high; the throw had no effect...",
          "throwNoEffect": "You threw a healing item, but nothing happened.",
          "throwDamage": "Threw a healing item and dealt {damage} damage to the enemy!",
          "autoSatietyRecovered": "Auto item triggered! Satiety recovered by {amount}.",
          "potionSatietyRecovered": "Ate a potion! Satiety recovered by {amount}.",
          "autoReversedDamage": "Auto item misfired! Took {amount} damage!",
          "potionReversedDamage": "The potion reversed and dealt {amount} damage!",
          "autoHpRecovered": "Auto item triggered! Recovered {amount} HP.",
          "potionHpRecovered": "Used a potion! Recovered {amount} HP.",
          "autoNoEffect": "Auto item triggered but nothing happened.",
          "potionNoEffect": "Used a potion but nothing happened.",
          "cleansedStatus": "Used a healing item and cured {status}.",
          "hpBoostUsed": "Used a Max HP Boost! Max HP increased by 5!",
          "attackBoostUsed": "Used an Attack Boost! Attack increased by 1!",
          "defenseBoostUsed": "Used a Defense Boost! Defense increased by 1!",
          "hpBoostMajorUsed": "Used a Grand Max HP Boost! Max HP increased by {amount}!",
          "attackBoostMajorUsed": "Used a Grand Attack Boost! Attack increased by {amount}!",
          "defenseBoostMajorUsed": "Used a Grand Defense Boost! Defense increased by {amount}!",
          "notOwned": "You don't have that item.",
          "noSpElixir": "You don't have an SP Elixir."
        },
        "data": {
          "imported": "Data imported."
        },
        "blockdim": {
          "selectionIncomplete": "Block selection is incomplete."
        },
        "progress": {
          "dungeonCleared": "Dungeon cleared!",
          "nextFloor": "Advanced to the next floor! ({floor}F)"
        }
      }
    },
    "statusModal": {
      "title": "Player Status",
      "sections": {
        "basic": "Basic Stats",
        "inventory": "Inventory",
        "settings": "Game Settings",
        "dungeon": "Dungeon Info"
      },
      "labels": {
        "level": "Level",
        "exp": "Experience",
        "hp": "HP",
        "satiety": "Satiety",
        "sp": "SP",
        "attack": "Attack",
        "defense": "Defense",
        "statusEffects": "Status Effects",
        "skillEffects": "Skill Effects",
        "floor": "Current Floor"
      },
      "settings": {
        "world": "Selected World",
        "difficulty": "Difficulty"
      },
      "dungeon": {
        "structure": "Layout",
        "type": "Type"
      },
      "effects": {
        "none": "No status ailments.",
        "remaining": "{label} {turns} turns remaining",
        "entry": "{label} {turns} turns remaining"
      },
      "skillCharms": {
        "entry": "{label} x{count}"
      },
      "world": {
        "normal": "{world} World",
        "blockdim": "BlockDim NESTED {nested} / {dimension}"
      },
      "dungeonSummary": {
        "normal": "{world} World: {dungeon}",
        "blockdim": "NESTED {nested} / Dimension {dimension}: {block1} · {block2} · {block3}"
      },
      "details": {
        "floor": "Floor: {floor}",
        "hpBaseSuffix": " (Base {base})",
        "level": "Lv.{value}",
        "hp": "HP {current}/{max}{baseSuffix}",
        "attack": "ATK {value}",
        "defense": "DEF {value}",
        "satiety": "Sat {current}/{max}",
        "line": "{level} {hp} {attack} {defense} {satiety}"
      },
      "stats": {
        "valueWithBase": "{effective} (Base {base})",
        "levelWithBase": "Lv.{effective} (Base {base})",
        "hp": "HP {current}/{max}{baseSuffix}"
      }
    }
  };
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);

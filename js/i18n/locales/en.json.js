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
    }
  };
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);

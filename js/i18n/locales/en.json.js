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

(function (root) {
  if (!root) return;
  var store = root.__i18nLocales = root.__i18nLocales || {};
  var locale = {
    "meta": {
      "title": "Yu Roguelike"
    },

    "header": {
      "title": "Yu Roguelike",
      "manual": "Lire le manuel",
      "minigameManual": "Lire le manuel des mini-jeux"
    },

    "ui": {
      "language": {
        "label": "Langue",
        "ariaLabel": "Sélecteur de langue",
        "option": {
          "ja": "Japonais",
          "en": "Anglais",
          "fr": "Français",
          "zh": "Chinois (simplifié)",
          "ko": "Coréen"
        }
      },
      "runResult": {
        "title": "Résultats",
        "reason": {
          "gameOver": "Game Over",
          "clear": "Donjon terminé",
          "retreat": "Retraite du donjon",
          "return": "Résumé de la partie"
        },
        "stats": {
          "level": "Niveau",
          "totalExp": "EXP totale obtenue",
          "totalDamage": "Dégâts totaux subis",
          "healingItems": "Objets de soin utilisés"
        },
        "actions": {
          "return": "Retour à la base",
          "retry": "Recommencer"
        },
        "onigokko": {
          "timer": {
            "remaining": "Temps restant : {seconds}s"
          },
          "status": {
            "start": "La poursuite commence ! Déplacez-vous avec les flèches / WASD.",
            "paused": "En pause",
            "loading": "Chargement du niveau…",
            "ready": "Prêt ! Appuyez sur Démarrer pour lancer la poursuite.",
            "stage_generation_failed": "Échec de génération du niveau",
            "api_unavailable": "API de donjon indisponible",
            "caught": "Attrapé !",
            "caught_no_reward": "Attrapé ! Aucune EXP obtenue.",
            "escaped": "Évasion réussie ! Bravo !",
            "escape_success": "Évasion réussie !"
          }
        }
      }
    },
    "messages": {
      "domainCrystal": {
        "spawn": "Un mystérieux cristal de domaine est apparu à cet étage… !"
      },
      "domainEffect": {
        "enter": "Vous êtes entré dans l'influence de l'effet de domaine \"{label}\" !",
        "exit": "Vous quittez l'influence de l'effet de domaine."
      },
      "domain": {
        "poisonNegated": "L'effet de domaine a annulé les dégâts de poison !",
        "poisonReversed": "La douleur du poison s'est inversée et a restauré {amount} PV !",
        "poisonDamage": "Le poison inflige {amount} dégâts !",
        "rareChestGuarded": "Le coffre doré a explosé, mais l'effet de domaine vous a protégé !",
        "rareChestReversed": "L'explosion du coffre doré s'est inversée et a restauré {amount} PV !",
        "rareChestDamage": "Le coffre doré a explosé ! PV -{damage} (décalage de synchronisation {timing} %).",
        "rareChestDeath": "Pris dans l'explosion du coffre doré… Game Over.",
        "damageBlocked": "L'effet de domaine vous a empêché d'infliger des dégâts…",
        "enemyHealed": "L'effet de domaine soigne l'ennemi de {amount} PV !",
        "poisonFloorNegated": "L'effet de domaine a annulé les dégâts du sol empoisonné !",
        "poisonFloorReversed": "L'énergie du sol empoisonné s'est inversée et a restauré {amount} PV !",
        "poisonFloorDamage": "Le sol empoisonné inflige des dégâts ! PV -{amount}.",
        "poisonFloorDeath": "Le sol empoisonné vous a vaincu… Game Over.",
        "bombGuarded": "L'effet de domaine bloque l'explosion !",
        "bombReversed": "La puissance de l'explosion s'est inversée et restaure {amount} PV !",
        "bombDamage": "La bombe explose ! PV -{amount}.",
        "bombDeath": "Emporté par l'explosion… Game Over.",
        "bombSafe": "La bombe a explosé mais vous n'avez subi aucun dégât !",
        "enemyAttackGuarded": "L'effet de domaine vous protège de l'attaque !",
        "enemyAttackReversed": "L'effet de domaine convertit l'attaque ennemie en soins ! PV restaurés +{amount}."
      },
      "skills": {
        "cannotUse": "Impossible d'utiliser la compétence : {reason}",
        "notEnoughSp": "SP insuffisants.",
        "genericKill": "Ennemi vaincu !",
        "effects": {
          "applied": "{label} activé ! ({turns} tours)",
          "gimmickNullifyExpired": "L'annulateur de piège s'est dissipé.",
          "statusGuardExpired": "La barrière d'altération s'est dissipée.",
          "enemyNullifyExpired": "Le sceau d'effet s'est dissipé.",
          "sureHitExpired": "L'effet coup sûr s'est terminé."
        },
        "breakWall": {
          "noWall": "Aucun mur destructible devant vous.",
          "notBreakable": "Ce mur ne peut pas être détruit.",
          "success": "Compétence SP : le mur a été détruit !"
        },
        "buildWall": {
          "noFloor": "Aucun sol devant vous à transformer en mur.",
          "cannotBuild": "Impossible de créer un mur ici.",
          "success": "Compétence SP : un mur a été créé !"
        },
        "gimmickNullify": {
          "tooHard": "Ce donjon est trop difficile : l'annulateur de piège est sans effet…"
        },
        "stairWarp": {
          "noDestination": "Aucune destination de téléportation sûre près des escaliers.",
          "success": "Téléporté près des escaliers !"
        },
        "strongStrike": {
          "noTarget": "Aucun ennemi pour déclencher la frappe puissante.",
          "sureHitFailed": "Le niveau de l'ennemi était trop élevé : le coup sûr a échoué…",
          "miss": "La frappe puissante rate sa cible.",
          "damage": "La frappe puissante inflige {damage} dégâts !",
          "kill": "Ennemi vaincu par la frappe puissante !"
        },
        "rangedAttack": {
          "noTarget": "Aucun ennemi à portée de l'attaque à distance.",
          "miss": "L'attaque à distance a raté…",
          "damage": "L'attaque à distance inflige {damage} dégâts !",
          "kill": "Ennemi vaincu par l'attaque à distance !"
        },
        "areaSkill": {
          "noTargets": "Aucun ennemi dans la zone.",
          "activated": "{skillName} utilisé !",
          "sureHitFailed": "Des ennemis de haut niveau ont résisté à l'effet…",
          "kill": "Ennemi vaincu avec {skillName} !",
          "noneHit": "Cela n'a touché personne…"
        },
        "floorSkill": {
          "noTargets": "Aucun ennemi à cibler.",
          "activated": "{skillName} déclenché !",
          "sureHitFailed": "Les ennemis de haut niveau n'ont pas été affectés…",
          "kill": "Ennemi vaincu avec {skillName} !",
          "noneHit": "Cela n'a touché personne."
        },
        "ruinAnnihilation": {
          "start": "Le pouvoir de ruine est libéré !",
          "kill": "L'ennemi est anéanti par les flammes de ruine !",
          "resisted": "Certains ennemis de haut niveau ont résisté au pouvoir de ruine…",
          "cleared": "Les murs et les pièges du donjon se dissipent !"
        }
      }
    },
    "skills": {
      "meta": {
        "currentSp": "SP actuels : {value}",
        "currentSpLabel": "SP actuels",
        "costAndCurrent": "Coût SP : {cost} / Actuels : {current}",
        "reasonSuffix": " ({reason})",
        "remainingTurns": "Actif : {turns} tours restants",
        "use": "Utiliser"
      },
      "modal": {
        "title": "Compétences"
      },
      "availability": {
        "unlockLevel": "Déverrouillé au Nv100",
        "maxSpShortage": "Cap SP trop bas",
        "notEnoughSp": "SP insuffisants",
        "tooHard": "Inefficace à cette difficulté",
        "noWallAhead": "Aucun mur devant",
        "noFloorAhead": "Aucun sol devant",
        "noRangedTarget": "Aucune cible atteignable",
        "noFrontEnemy": "Aucun ennemi devant",
        "noAreaTargets": "Aucun ennemi dans la zone",
        "noEnemies": "Aucun ennemi présent",
        "noWarpDestination": "Aucune destination de téléportation",
        "notYourTurn": "Ce n'est pas votre tour",
        "paralyzed": "Paralysé"
      },
      "effects": {
        "gimmickNullify": { "label": "Annulateur de piège" },
        "statusGuard": { "label": "Barrière d'altération" },
        "enemyNullify": { "label": "Sceau d'effet" },
        "sureHit": { "label": "Coup sûr" }
      },
      "breakWall": {
        "name": "Briser le mur",
        "description": "Détruit le mur directement devant vous."
      },
      "buildWall": {
        "name": "Créer un mur",
        "description": "Transforme la case devant vous en mur."
      },
      "rangedAttack": {
        "name": "Attaque à distance",
        "description": "Frappe les ennemis en ligne droite devant avec un coup sûr infligeant un tiers des dégâts normaux. Bloqué par les murs."
      },
      "gimmickNullify": {
        "name": "Annulateur de piège",
        "description": "Annule les gimmicks du donjon pendant 10 tours. Sans effet si le niveau recommandé dépasse le vôtre de 8 ou plus."
      },
      "statusGuard": {
        "name": "Barrière d'altération",
        "description": "Bloque toutes les altérations d'état pendant 10 tours."
      },
      "enemyNullify": {
        "name": "Sceau d'effet",
        "description": "Annule les effets spéciaux des ennemis pendant 10 tours."
      },
      "sureHit": {
        "name": "Coup sûr",
        "description": "Garantit les attaques normales pendant 10 tours. Sans effet sur les ennemis 8 niveaux au-dessus."
      },
      "stairWarp": {
        "name": "Warp d'escalier",
        "description": "Se téléporte sur une case adjacente aux escaliers."
      },
      "strongStrike": {
        "name": "Frappe puissante",
        "description": "Porter un coup sûr infligeant 3× dégâts à l'ennemi devant."
      },
      "areaAttack": {
        "name": "Attaque de zone",
        "description": "Inflige des dégâts normaux de zone aux ennemis proches."
      },
      "surehitArea": {
        "name": "Zone coup sûr",
        "description": "Inflige des dégâts de zone garantis aux ennemis proches."
      },
      "strongArea": {
        "name": "Zone puissante",
        "description": "Inflige 3× dégâts de zone aux ennemis proches."
      },
      "surehitStrongArea": {
        "name": "Zone puissante coup sûr",
        "description": "Inflige des dégâts de zone garantis ×3 aux ennemis proches."
      },
      "surehitFloor": {
        "name": "Coup sûr global",
        "description": "Frappe chaque ennemi de l'étage avec un coup sûr."
      },
      "ruinAnnihilation": {
        "name": "Annihilation ruineuse",
        "description": "Libère des dégâts ×3 garantis sur tous les ennemis, détruit murs et pièges et récupère les coffres. Sans effet sur les ennemis trop puissants."
      }
    },

    "selection": {
      "title": "Sélection du donjon",
      "difficulty": {
        "label": "Difficulté",
        "option": {
          "veryEasy": "Très facile",
          "easy": "Facile",
          "normal": "Normal",
          "second": "Deuxième",
          "hard": "Difficile",
          "veryHard": "Très difficile"
        }
      },
      "dungeons": {
        "tooltip": "Niveau recommandé : {level}"
      },
      "playerStatus": {
        "title": "Statut du joueur",
        "toggle": {
          "expand": "Développer",
          "collapse": "Réduire"
        },
        "labels": {
          "level": "Niveau",
          "hp": "PV",
          "satiety": "Satiété",
          "exp": "EXP",
          "sp": "SP",
          "attack": "Attaque",
          "defense": "Défense"
        }
      },
      "tabs": {
        "ariaLabel": "Onglets de sélection de donjon",
        "normal": "Normal",
        "blockdim": "Dimension de blocs",
        "miniexp": "Expérience mini-jeux",
        "tools": "Outils",
        "achievements": "Succès & statistiques"
      },
      "normal": {
        "worlds": "Mondes",
        "dungeons": "Donjons",
        "detail": {
          "name": "Nom du donjon",
          "typeLabel": "Type :",
          "typeValue": "Terrain",
          "recommendedLabel": "Niveau recommandé :",
          "damageLabel": "Multiplicateurs de dégâts :",
          "damageValue": "Inflige : 1,6× / Subit : 0,5×",
          "damageMultiplier": "Inflige : {deal}× / Subit : {take}×",
          "descriptionLabel": "Description :",
          "description": "Description du donjon",
          "start": "Entrer dans le donjon"
        }
      }
    },
    "game": {
      "toolbar": {
        "back": "Retour",
        "items": "Objets",
        "skills": "Compétences",
        "status": "Statut",
        "import": "Importer",
        "export": "Exporter",
        "toggleDungeonName": "Afficher le nom du donjon",
        "sandboxMenu": "Interactif",
        "godConsole": "Console du créateur",
        "floor": {
          "heading": "Étage actuel",
          "label": "ÉTAGE"
        }
      },
      "dungeonOverlay": {
        "label": "Caractéristiques du donjon",
        "titleFallback": "Donjon",
        "typePlaceholder": "Type de terrain",
        "descriptionPlaceholder": "Les caractéristiques du donjon apparaîtront ici.",
        "badge": {
          "none": "Aucun trait notable",
          "dark": {
            "active": "Obscurité",
            "suppressed": "Obscurité (annulée)"
          },
          "poison": {
            "active": "Brouillard toxique",
            "suppressed": "Brouillard toxique (annulé)"
          },
          "noise": {
            "active": "Bruit",
            "suppressed": "Bruit (annulé)"
          },
          "nested": "IMBRIQUÉ x{value}"
        }
      },
      "blockDim": {
        "preview": {
          "selection": "IMBRIQUÉ {nested} / Dimension {dimension} : {block1} · {block2} · {block3}"
        }
      },
      "playerStats": {
        "labels": {
          "level": "Niveau",
          "attackShort": "ATQ",
          "defenseShort": "DEF",
          "hp": "PV",
          "satiety": "Satiété",
          "exp": "EXP",
          "sp": "SP"
        }
      },
      "statuses": {
        "poison": "Poison",
        "paralysis": "Paralysie",
        "abilityUp": "Renforcement",
        "abilityDown": "Affaiblissement",
        "levelDown": "Niveau réduit"
      },
      "autoItem": {
        "status": "Objets auto ON : objets de soin x {count}"
      },
      "common": {
        "count": "x {count}",
        "none": "Aucun",
        "floor": "Étage {floor}"
      },
      "miniExp": {
        "dinoRunner": {
          "comboLabel": "COMBO {combo}",
          "startPromptPrimary": "Espace / clic pour démarrer",
          "startPromptSecondary": "↑ ou Espace pour sauter, ↓ pour se baisser",
          "gameOver": "GAME OVER",
          "restartHint": "Espace / R pour recommencer",
          "distanceLabel": "DIST {distance}"
        },
        "ultimateTtt": {
          "status": {
            "player": "À vous de jouer",
            "ai": "Tour de l'IA",
            "ended": "Fin de partie"
          },
          "activeBoard": "Plateau cible : ({x}, {y})",
          "overlay": {
            "restartHint": "Appuyez sur R pour recommencer"
          },
          "result": {
            "playerWin": "Vous gagnez !",
            "aiWin": "L'IA gagne…",
            "draw": "Match nul"
          }
        }
      },
      "backgammon": {
        "actor": {
          "player": "Joueur",
          "ai": "IA"
        },
        "difficulty": {
          "easy": "Facile",
          "normal": "Normal",
          "hard": "Difficile"
        },
        "point": "Point {point}",
        "bar": "Barre",
        "dice": {
          "none": "-"
        },
        "board": {
          "playerOff": "{actor} SORT ({countFormatted})",
          "aiOff": "{actor} SORT ({countFormatted})",
          "barText": "{label}"
        },
        "action": {
          "roll": "Lancer les dés",
          "rematch": "Revanche"
        },
        "badge": {
          "difficulty": "Difficulté : {difficulty}",
          "hits": "Touchers : {hitsFormatted}",
          "score": "Score : {scoreFormatted}"
        },
        "ui": {
          "turn": "Tour : {actor}{status}",
          "turnFinishedSuffix": " (Terminé)",
          "dice": {
            "empty": "Dés : -",
            "detail": "Dés : [{diceFormatted}] / Restants [{remainingFormatted}]"
          },
          "bar": "{bar} : {playerLabel} {playerFormatted} / {aiLabel} {aiFormatted}",
          "bearOff": {
            "title": "Sortie",
            "summary": "{title} : {playerLabel} {playerFormatted} / {aiLabel} {aiFormatted}"
          }
        },
        "log": {
          "bearOff": "{actor} sort depuis {fromLabel} ({dieFormatted})",
          "barHit": "{actor} entre depuis {bar} vers {toLabel} ({dieFormatted}) : Touché !",
          "barEntry": "{actor} entre depuis {bar} vers {toLabel} ({dieFormatted})",
          "moveHit": "{actor} déplace {fromLabel} → {toLabel} ({dieFormatted}) : Touché !",
          "move": "{actor} déplace {fromLabel} → {toLabel} ({dieFormatted})",
          "win": {
            "player": "Le joueur gagne ! {rewardFormatted} EXP obtenues.",
            "ai": "L'IA gagne… Réessayez."
          },
          "aiDice": "Dés de l'IA : {diceFormatted}",
          "aiNoMove": "L'IA ne peut pas jouer.",
          "playerDice": "Dés du joueur : {diceFormatted}",
          "noMoves": "Aucun coup légal disponible.",
          "newGame": "Nouvelle partie. Le joueur commence."
        }
      },
      "runResult": {
        "defaultCause": "Game Over"
      },
      "death": {
        "cause": {
          "generic": "Game Over",
          "poison": "Vaincu par le poison… Game Over.",
          "starvation": "Vous vous êtes effondré de faim… Game Over.",
          "wallCollision": "Après un choc contre un mur, vous tombez… Game Over.",
          "instantKill": "Abattu par une attaque mortelle… Game Over.",
          "autoItemBackfire": "L'objet automatique a mal tourné et vous tombez… Game Over.",
          "reversedPotion": "La potion inversée vous a submergé… Game Over."
        }
      },
      "items": {
        "modal": {
          "title": "Objets"
        },
        "countPrefix": "x",
        "actions": {
          "use": "Utiliser",
          "eat": "Consommer",
          "offer": "Offrir",
          "cleanse": "Purger un malus d'état",
          "throw": "Lancer",
          "enable": "Activer",
          "close": "Fermer"
        },
        "autoItem": {
          "label": "Objet auto",
          "hint": "Soigne automatiquement quand les PV passent sous 30 %."
        },
        "potion30": {
          "label": "Potion de PV 30 %"
        },
        "hpBoost": {
          "label": "Objet d'augmentation de PV max"
        },
        "atkBoost": {
          "label": "Objet d'augmentation d'attaque"
        },
        "defBoost": {
          "label": "Objet d'augmentation de défense"
        },
        "hpBoostMajor": {
          "label": "Grand boost de PV max (+25)"
        },
        "atkBoostMajor": {
          "label": "Grand boost d'attaque (+10)"
        },
        "defBoostMajor": {
          "label": "Grand boost de défense (+10)"
        },
        "spElixir": {
          "label": "Élixir de SP"
        },
        "passiveOrbs": {
          "header": "Orbes passifs"
        },
        "skillCharms": {
          "header": "Charms de compétence (10 tours chacun)"
        },
        "errors": {
          "noHealingItem": "Aucun objet de soin disponible.",
          "noStatusToCleanse": "Aucun malus d'état à purger."
        }
      },
      "passiveOrb": {
        "summary": "Total {total} ({unique} types)",
        "empty": "Vous n'avez aucun orbe passif.",
        "noEffects": "Aucun effet.",
        "countDetail": "En possession {count}",
        "detailSeparator": " / ",
        "obtainDetail": " ({details})",
        "obtain": "Orbe passif \"{label}\" obtenu !{detail}",
        "obtainMultiple": "Orbe passif \"{label}\" ×{delta} obtenus !{detail}",
        "orbs": {
          "attackBoost": {
            "name": "Orbe ATQ +1 %"
          },
          "defenseBoost": {
            "name": "Orbe DEF +1 %"
          },
          "abilityBoost": {
            "name": "Orbe stats +1 %"
          },
          "maxHpBoost": {
            "name": "Orbe PV max +10 %"
          },
          "statusGuard": {
            "name": "Orbe garde d'altération"
          },
          "enemySpecialGuard": {
            "name": "Orbe garde spéciale ennemie"
          },
          "poisonResist": {
            "name": "Orbe résistance au poison"
          },
          "paralysisResist": {
            "name": "Orbe résistance à la paralysie"
          },
          "abilityDownResist": {
            "name": "Orbe résistance à l'affaiblissement"
          },
          "levelDownResist": {
            "name": "Orbe résistance au niveau réduit"
          },
          "instantDeathResist": {
            "name": "Orbe résistance à la mort subite"
          },
          "knockbackResist": {
            "name": "Orbe résistance au repoussement"
          },
          "poisonDamageGuard": {
            "name": "Orbe garde dégâts de poison"
          },
          "bombDamageGuard": {
            "name": "Orbe garde dégâts d'explosion"
          },
          "skillPowerBoost": {
            "name": "Orbe puissance de compétence +10 %"
          },
          "damageDealtBoost": {
            "name": "Orbe dégâts infligés +10 %"
          },
          "damageTakenGuard": {
            "name": "Orbe dégâts subis -10 %"
          },
          "evasionBoost": {
            "name": "Orbe esquive +1 %"
          },
          "accuracyBoost": {
            "name": "Orbe précision +1 %"
          },
          "critDamageBoost": {
            "name": "Orbe dégâts critiques +10 %"
          }
        },
        "labels": {
          "maxHpMul": "PV max",
          "attackMul": "Attaque",
          "defenseMul": "Défense",
          "damageDealtMul": "Dégâts infligés",
          "damageTakenMul": "Dégâts subis",
          "skillPowerMul": "Puissance de compétence",
          "accuracyMul": "Précision",
          "evasionMul": "Esquive",
          "critDamageMul": "Dégâts critiques",
          "statusChanceMul": "Chances d'altération",
          "enemySpecialChanceMul": "Chances de spécial ennemi",
          "poisonStatusChanceMul": "Chances de poison",
          "paralysisStatusChanceMul": "Chances de paralysie",
          "levelDownStatusChanceMul": "Chances de baisse de niveau",
          "instantDeathChanceMul": "Chances de mort subite",
          "knockbackChanceMul": "Chances de repoussement",
          "poisonDamageMul": "Dégâts de poison",
          "bombDamageMul": "Dégâts d'explosion",
          "abilityDownPenaltyMul": "Sévérité de l'affaiblissement",
          "status:poison": "Chances de poison",
          "status:paralysis": "Chances de paralysie",
          "status:levelDown": "Chances de baisse de niveau",
          "instantDeath": "Chances de mort subite",
          "enemySpecial:knockback": "Chances de repoussement",
          "poison": "Dégâts de poison",
          "bomb": "Dégâts d'explosion",
          "abilityDownPenalty": "Sévérité de l'affaiblissement"
        }
      },
      "skillCharms": {
        "use": "Utiliser",
        "empty": "Aucun charm en possession."
      },
      "events": {
        "hatena": {
          "spawnSingle": "Un mystérieux bloc ? est apparu !",
          "spawnMultiple": "{count} mystérieux blocs ? sont apparus !",
          "bombGuard": "L'impact de l'explosion a été annulé !",
          "bombHeal": "L'explosion s'est inversée et a restauré {amount} PV !",
          "bombDamage": "L'explosion a infligé {amount} dégâts !",
          "bombDeath": "Vous avez été pris dans l'explosion… Game Over.",
          "itemObtained": "Vous recevez {item} !",
          "trigger": "Vous avez marché sur un bloc ? !",
          "levelUp": "Niveau augmenté de {amount} !",
          "levelNoChange": "Mais votre niveau n'a pas changé.",
          "levelDown": "Niveau réduit de {amount}…",
          "levelDownNoEffect": "Votre niveau ne peut pas descendre davantage.",
          "expGain": "Vous gagnez {amount} EXP !",
          "expGainNone": "Aucune EXP gagnée.",
          "expLoss": "Vous perdez {amount} EXP…",
          "expLossNone": "Aucune EXP perdue.",
          "enemyAmbush": "Des ennemis apparaissent autour de vous !",
          "noEnemies": "Mais aucun ennemi n'est apparu.",
          "poisonGuarded": "Le poison a été empêché !",
          "statusNone": "Aucun malus d'état ne s'est déclenché.",
          "buffFailed": "Le renforcement a échoué.",
          "debuffNone": "Aucun affaiblissement ne s'est produit.",
          "rareChest": "Un coffre rare étincelant est apparu !",
          "chestNoSpace": "Aucun espace disponible pour un coffre.",
          "chest": "Un coffre est apparu !",
          "noChest": "Aucun coffre n'est apparu.",
          "chestRing": "Vous êtes entouré de coffres !",
          "nothing": "Mais il ne s'est rien passé."
        },
        "skills": {
          "statusGuarded": "L'effet de la compétence a annulé l'altération !"
        },
        "sp": {
          "unlocked": "Système de SP déverrouillé !",
          "notUnlocked": "Le SP n'est pas encore déverrouillé.",
          "notEnough": "SP insuffisants.",
          "maxIncreased": "Capacité de SP augmentée à {value} !",
          "gained": "{amount} SP obtenus.",
          "spent": "{amount} SP dépensés.",
          "offered": "Vous offrez un objet de soin et gagnez {amount} SP.",
          "offerLocked": "Vous pourrez offrir des objets une fois le SP déverrouillé.",
          "notUnlockedForItem": "Vous ne pouvez pas l'utiliser tant que le SP n'est pas déverrouillé.",
          "noCapacity": "Votre capacité de SP est 0, aucun effet.",
          "alreadyFull": "Les SP sont déjà au maximum.",
          "elixirUsed": "Élixir de SP utilisé ! {amount} SP restaurés.",
          "fullyRestored": "SP totalement restaurés (+{amount})."
        },
        "exp": {
          "bossBonusSuffix": " (Bonus de boss !)",
          "enemyGain": "{amount} EXP gagnées !{bonus}",
          "spent": "{amount} EXP dépensées. ({context})",
          "gained": "{amount} EXP gagnées ! ({context})"
        },
        "status": {
          "paralyzed": "Vous êtes paralysé et ne pouvez pas bouger…",
          "paralyzedRemaining": "Vous êtes paralysé et ne pouvez pas bouger… (reste {turns} tours)",
          "cured": {
            "poison": "Le poison s'est dissipé.",
            "paralysis": "Vous n'êtes plus paralysé.",
            "abilityUp": "L'effet de renforcement a pris fin.",
            "abilityDown": "Le malus de stats a disparu.",
            "levelDown": "La baisse temporaire de niveau est terminée."
          },
          "applied": {
            "poison": "Vous êtes empoisonné ! ({turns} tours)",
            "paralysis": "Vous êtes paralysé et ne pouvez pas bouger ! ({turns} tours)",
            "abilityUp": "Une puissance vous envahit ! PV max/ATQ/DEF augmentent ({turns} tours)",
            "abilityDown": "Vos stats diminuent… PV max/ATQ/DEF réduits ({turns} tours)",
            "levelDown": "Votre niveau baisse temporairement ! ({turns} tours)"
          }
        },
        "levelUp": {
          "log": "Montée de niveau !\nNiveau : {level} (+{levelDelta})\nPV max : {maxHp} (+{maxHpDelta})\nATQ : {attack} (+{attackDelta})\nDEF : {defense} (+{defenseDelta})"
        },
        "sandbox": {
          "noExp": "Le mode bac à sable ne donne pas d'EXP.",
          "started": "Mode bac à sable activé. Aucune EXP ne sera donnée."
        },
        "console": {
          "executed": "La console du créateur a exécuté le code.",
          "error": "Erreur de la console du créateur : {message}"
        },
        "unlocks": {
          "nestedLegend": "Vous avez vaincu IMBRIQUÉ 99999999 et atteint la divinité de classe Anos !",
          "consoleAlwaysOn": "La console du créateur et l'interrupteur bac à sable sont désormais toujours disponibles."
        },
        "actions": {
          "wallDestroyed": "Vous avez détruit le mur !"
        },
        "dungeon": {
          "darkness": "L'obscurité voile votre vision…",
          "poisonFog": "Un brouillard toxique envahit la zone ! Même les cases normales sont dangereuses."
        },
        "charms": {
          "unknown": "Un charm inconnu ne peut pas être utilisé.",
          "notOwned": "Vous ne possédez pas ce charm.",
          "activated": "Charm {label} activé ! Effet pendant {turns} tours."
        },
        "satiety": {
          "enabled": "Système de satiété activé !",
          "disabled": "Système de satiété désactivé.",
          "cannotEat": "Vous ne pouvez manger que lorsque la satiété est active.",
          "alreadyFull": "La satiété est déjà au maximum.",
          "damage": "Vous subissez {amount} dégâts de faim !"
        },
        "chest": {
          "prefix": {
            "normal": "Coffre ouvert ! ",
            "rare": "Coffre doré ouvert ! "
          },
          "reward": {
            "potion30": "{prefix}Potion PV 30 % obtenue !",
            "hpBoost": "{prefix}Objet d'augmentation de PV max obtenu !",
            "atkBoost": "{prefix}Objet d'augmentation d'attaque obtenu !",
            "defBoost": "{prefix}Objet d'augmentation de défense obtenu !"
          }
        },
        "goldenChest": {
          "modal": {
            "title": "Coffre doré",
            "status": "Arrêtez la jauge au centre ! (Espace/Entrée)",
            "stop": "Stop",
            "hint": "Vous pouvez aussi appuyer sur Espace ou Entrée."
          },
          "elixir": "Vous trouvez un élixir de SP spécial dans le coffre doré ! Les SP sont grandement restaurés.",
          "openedSafely": "Le coffre doré a été ouvert sans encombre !",
          "prompt": "Un coffre doré ! Synchronisez votre pression avec la barre.",
          "major": {
            "hp": "Élixir PV max +{amount} trouvé dans le coffre doré !",
            "atk": "Orbe tactique ATQ +{amount} trouvé dans le coffre doré !",
            "def": "Carte bouclier DEF +{amount} trouvée dans le coffre doré !"
          },
          "skillCharm": "Charm de compétence \"{effectName}\" trouvé dans le coffre doré ! ({turns} tours)"
        },
        "combat": {
          "noEnemyInDirection": "Aucun ennemi dans cette direction !",
          "sureHitIneffective": "L'écart de niveau a annulé l'effet de coup sûr…",
          "miss": "Raté",
          "enemyDefeated": "Ennemi vaincu !",
          "bossGate": "Vous ne pouvez pas avancer tant que le boss n'est pas vaincu !",
          "enemyMissed": "L'ennemi a raté !",
          "enemyWarped": "Vous êtes téléporté par l'attaque de l'ennemi !",
          "enemyAttackDamage": "L'ennemi vous inflige {amount} dégâts !",
          "enemyWarpPopup": "Warp",
          "statusResistedByLevel": "L'écart de niveau a empêché l'altération !",
          "teleportResistedByLevel": "L'écart de niveau vous a permis de résister à la téléportation !",
          "instantDeathResisted": "L'écart de niveau a annulé l'attaque mortelle !",
          "instantDeathHit": "L'attaque mortelle de l'ennemi a touché… !",
          "knockbackResistedByLevel": "L'écart de niveau vous a permis de résister au repoussement !",
          "playerDamage": "Vous infligez {amount} dégâts à l'ennemi !",
          "knockbackCollision": "Projété contre le mur, vous subissez {amount} dégâts !"
        },
        "orb": {
          "statusAttackNegated": "La bénédiction de l'orbe a annulé l'attaque d'altération !",
          "statusAttackPrevented": "La bénédiction de l'orbe a bloqué l'attaque d'altération !",
          "statusPrevented": "La bénédiction de l'orbe a empêché l'altération !",
          "teleportNegated": "La bénédiction de l'orbe a annulé la téléportation !",
          "teleportPrevented": "La bénédiction de l'orbe a bloqué la téléportation !",
          "instantDeathNegated": "La bénédiction de l'orbe a annulé l'attaque mortelle !",
          "instantDeathPrevented": "La bénédiction de l'orbe vous a permis de survivre à l'attaque mortelle !",
          "knockbackNegated": "La bénédiction de l'orbe a annulé le repoussement !",
          "knockbackPrevented": "La bénédiction de l'orbe a bloqué le repoussement !"
        },
        "items": {
          "noPotion": "Vous n'avez pas de potion.",
          "noOfferingItem": "Aucun objet de soin à offrir.",
          "throwNoEnemies": "Aucun ennemi à portée de lancer.",
          "throwNoHealingItem": "Aucun objet de soin à lancer.",
          "throwNoTarget": "Aucune cible à atteindre.",
          "throwIneffective": "Le niveau de l'ennemi est trop élevé ; le lancer n'a eu aucun effet…",
          "throwNoEffect": "Vous lancez un objet de soin, mais rien ne se passe.",
          "throwDamage": "Objet de soin lancé : {damage} dégâts infligés à l'ennemi !",
          "autoSatietyRecovered": "Objet auto déclenché ! Satiété restaurée de {amount}.",
          "potionSatietyRecovered": "Potion consommée ! Satiété restaurée de {amount}.",
          "autoReversedDamage": "Objet auto défectueux ! Vous subissez {amount} dégâts !",
          "potionReversedDamage": "La potion s'est inversée et inflige {amount} dégâts !",
          "autoHpRecovered": "Objet auto déclenché ! {amount} PV restaurés.",
          "potionHpRecovered": "Potion utilisée ! {amount} PV restaurés.",
          "autoNoEffect": "Objet auto déclenché mais sans effet.",
          "potionNoEffect": "Potion utilisée mais aucun effet.",
          "cleansedStatus": "Objet de soin utilisé : {status} soigné.",
          "hpBoostUsed": "Boost de PV max utilisé ! PV max +5 !",
          "attackBoostUsed": "Boost d'attaque utilisé ! Attaque +1 !",
          "defenseBoostUsed": "Boost de défense utilisé ! Défense +1 !",
          "hpBoostMajorUsed": "Grand boost de PV max utilisé ! PV max +{amount} !",
          "attackBoostMajorUsed": "Grand boost d'attaque utilisé ! Attaque +{amount} !",
          "defenseBoostMajorUsed": "Grand boost de défense utilisé ! Défense +{amount} !",
          "notOwned": "Vous ne possédez pas cet objet.",
          "noSpElixir": "Vous n'avez pas d'élixir de SP."
        },
        "data": {
          "imported": "Données importées."
        },
        "blockdim": {
          "selectionIncomplete": "La sélection de blocs est incomplète."
        },
        "progress": {
          "dungeonCleared": "Donjon terminé !",
          "nextFloor": "Vous passez à l'étage suivant ! ({floor}F)"
        }
      }
    }
  };

  store['fr'] = locale;

  var enLocale = store['en'];
  if (enLocale) {
    var clone = function (obj) {
      try {
        return JSON.parse(JSON.stringify(obj));
      } catch (error) {
        return obj;
      }
    };

    if ((!locale.selection || !locale.selection.blockdim) && enLocale.selection && enLocale.selection.blockdim) {
      locale.selection = locale.selection || {};
      locale.selection.blockdim = clone(enLocale.selection.blockdim);
    }
    if ((!locale.selection || !locale.selection.miniexp) && enLocale.selection && enLocale.selection.miniexp) {
      locale.selection = locale.selection || {};
      locale.selection.miniexp = clone(enLocale.selection.miniexp);
    }
    if (!locale.dungeon && enLocale.dungeon) {
      locale.dungeon = clone(enLocale.dungeon);
    }
    if (!locale.minigame && enLocale.minigame) {
      locale.minigame = clone(enLocale.minigame);
    }
    if (!locale.miniexp && enLocale.miniexp) {
      locale.miniexp = clone(enLocale.miniexp);
    }
    if (!locale.tools && enLocale.tools) {
      locale.tools = clone(enLocale.tools);
    }
    if (!locale.achievements && enLocale.achievements) {
      locale.achievements = clone(enLocale.achievements);
    }
    if (!locale.enemy && enLocale.enemy) {
      locale.enemy = clone(enLocale.enemy);
    }
    if (!locale.dungeons && enLocale.dungeons) {
      locale.dungeons = clone(enLocale.dungeons);
    }
    if (!locale.godConsole && enLocale.godConsole) {
      locale.godConsole = clone(enLocale.godConsole);
    }
    if (!locale.games && enLocale.games) {
      locale.games = clone(enLocale.games);
    }
    if (locale.games) {
      locale.games.sanpo = {
        "name": "Balade",
        "description": "Parcourez un donjon généré aléatoirement et gagnez des EXP à raison de 1 par pas.",
        "ui": {
          "regenerate": "Régénérer la zone",
          "zoomLabel": "Zoom",
          "minimapTitle": "Mini-carte",
          "stageInfo": "Type : {type} / Taille : {size} / Tuile : {tileSize}",
          "seedInfo": "Graine : {seed}",
          "stepsInfo": "Pas : {steps}",
          "stageInfoEmpty": "Type : -",
          "seedInfoEmpty": "Graine : -",
          "stepsInfoEmpty": "Pas : 0",
          "zoomInfo": "Zoom : {value}x",
          "zoomDisplay": "{value}x",
          "hideMap": "Mini-carte OFF",
          "showMap": "Mini-carte ON",
          "status": {
            "paused": "En pause",
            "walk": "En balade… Déplacez-vous avec WASD/flèches. M pour la mini-carte, [ / ] pour le zoom.",
            "noApi": "API de donjon indisponible",
            "generating": "Génération de la zone…",
            "failed": "Échec de la génération de la zone",
            "ready": "Prêt ! Appuyez sur Démarrer pour lancer la balade.",
            "initializing": "Chargement…"
          }
        }
      };
    }
    if (locale.selection && locale.selection.miniexp && locale.selection.miniexp.games) {
      locale.selection.miniexp.games.sanpo = {
        "name": "Balade",
        "description": "Parcourez un donjon généré aléatoirement et gagnez 1 EXP par pas."
      };
    }
    if (!locale.statusModal && enLocale.statusModal) {
      locale.statusModal = clone(enLocale.statusModal);
    }
    if (!locale.miniPaint && enLocale.miniPaint) {
      locale.miniPaint = clone(enLocale.miniPaint);
    }
    if (!locale.mathLab && enLocale.mathLab) {
      locale.mathLab = clone(enLocale.mathLab);
    }
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);

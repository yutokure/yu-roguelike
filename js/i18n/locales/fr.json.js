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
    }
  };

  store['fr'] = locale;
})(typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : this);

(function(){
  const STYLE_ID = 'minigame-card-battle-style';
  const ATTRIBUTES = ['FIRE', 'WATER', 'WIND', 'EARTH', 'LIGHT', 'DARK', 'ARCANE'];
  const ATTRIBUTE_LABELS = {
    FIRE: '炎',
    WATER: '水',
    WIND: '風',
    EARTH: '地',
    LIGHT: '光',
    DARK: '闇',
    ARCANE: '秘'
  };
  const ATTRIBUTE_ADVANTAGE = {
    FIRE: ['WIND'],
    WIND: ['EARTH'],
    EARTH: ['LIGHT'],
    LIGHT: ['DARK'],
    DARK: ['WATER'],
    WATER: ['FIRE']
  };

  const RULES = [
    {
      id: 'standard',
      label: 'スタンダード',
      description: 'LP4000/手札5枚。先攻初ターンはドローなし。属性有利で+400、1ターンに1枚だけ行動。',
      initialLife: 4000,
      handSize: 5,
      deckSize: 24,
      attributeBonus: 400,
      skipFirstDraw: true,
      extraDraw: 0,
      deckBias: null
    },
    {
      id: 'surge',
      label: '属性サージ',
      description: '属性ボーナス+600。デッキは2属性中心で構築され、属性効果が決まりやすい。',
      initialLife: 4000,
      handSize: 5,
      deckSize: 24,
      attributeBonus: 600,
      skipFirstDraw: true,
      extraDraw: 0,
      deckBias: 'attribute'
    },
    {
      id: 'rapid',
      label: 'ラピッドデュエル',
      description: 'LP3000/手札4枚。毎ターン追加で1枚ドロー。属性ボーナス+350でスピード勝負。',
      initialLife: 3000,
      handSize: 4,
      deckSize: 18,
      attributeBonus: 350,
      skipFirstDraw: false,
      extraDraw: 1,
      deckBias: null
    }
  ];
  const RULE_MAP = Object.fromEntries(RULES.map(r => [r.id, r]));

  function ensureStyles(){
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .card-battle-root{font-family:"BIZ UDPGothic","Segoe UI",sans-serif;background:radial-gradient(circle at top,#0f172a 0%,#020617 70%);color:#e2e8f0;border-radius:20px;padding:18px 20px;box-shadow:0 18px 60px rgba(2,6,23,0.65);display:flex;flex-direction:column;gap:16px;position:relative;overflow:hidden;min-height:560px;}
      .card-battle-root::before{content:'';position:absolute;inset:-40%;background:conic-gradient(from 45deg,rgba(59,130,246,0.08),rgba(14,165,233,0.12),rgba(236,72,153,0.08),rgba(99,102,241,0.1));filter:blur(60px);animation:cb-aurora 22s linear infinite;}
      .card-battle-root > *{position:relative;z-index:1;}
      @keyframes cb-aurora{0%{transform:rotate(0deg) scale(1.05);}100%{transform:rotate(360deg) scale(1.05);}}
      .cb-header{display:flex;flex-wrap:wrap;gap:16px;align-items:flex-end;justify-content:space-between;}
      .cb-title{display:flex;flex-direction:column;gap:6px;}
      .cb-title h2{margin:0;font-size:22px;letter-spacing:0.08em;text-transform:uppercase;color:#38bdf8;}
      .cb-title p{margin:0;font-size:13px;color:#94a3b8;letter-spacing:0.04em;}
      .cb-controls{display:flex;flex-wrap:wrap;gap:12px;align-items:center;}
      .cb-controls label{font-size:12px;color:#94a3b8;letter-spacing:0.04em;}
      .cb-controls select{padding:8px 12px;border-radius:10px;border:1px solid rgba(148,163,184,0.28);background:rgba(15,23,42,0.75);color:#e2e8f0;font-size:13px;}
      .cb-controls button{padding:9px 16px;border-radius:12px;border:1px solid rgba(59,130,246,0.55);background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#0f172a;font-weight:700;letter-spacing:0.05em;cursor:pointer;box-shadow:0 12px 26px rgba(14,165,233,0.35);transition:transform 0.18s,box-shadow 0.18s;}
      .cb-controls button:hover{transform:translateY(-1px);box-shadow:0 16px 34px rgba(14,165,233,0.38);}
      .cb-status{display:flex;flex-wrap:wrap;gap:12px;align-items:stretch;}
      .cb-life-panel{flex:1 1 240px;border-radius:16px;padding:14px 16px;background:rgba(15,23,42,0.6);border:1px solid rgba(148,163,184,0.2);display:flex;flex-direction:column;gap:6px;box-shadow:0 12px 30px rgba(2,6,23,0.4);}
      .cb-life-panel.enemy{align-items:flex-end;text-align:right;}
      .cb-life-panel strong{font-size:20px;letter-spacing:0.05em;}
      .cb-life{font-size:26px;font-weight:700;color:#f8fafc;}
      .cb-life.critical{color:#f87171;}
      .cb-hand-count{font-size:12px;color:#94a3b8;}
      .cb-turn-info{flex:1 1 200px;display:flex;flex-direction:column;gap:6px;justify-content:center;align-items:center;border-radius:16px;padding:14px 16px;background:rgba(30,41,59,0.55);border:1px solid rgba(148,163,184,0.2);text-align:center;}
      .cb-turn-info strong{font-size:16px;letter-spacing:0.06em;}
      .cb-rule-desc{font-size:12px;color:#94a3b8;line-height:1.5;}
      .cb-field{display:grid;grid-template-columns:1fr;gap:10px;padding:12px;border-radius:18px;background:rgba(15,23,42,0.55);border:1px solid rgba(148,163,184,0.18);}
      .cb-side{display:flex;flex-direction:column;gap:6px;}
      .cb-side.enemy{align-items:flex-end;}
      .cb-field-card{width:100%;min-height:140px;border-radius:16px;border:1px dashed rgba(148,163,184,0.25);padding:10px;background:rgba(15,23,42,0.45);display:flex;flex-direction:column;justify-content:center;align-items:center;gap:6px;position:relative;overflow:hidden;}
      .cb-field-card.filled{border-style:solid;border-color:rgba(59,130,246,0.35);background:linear-gradient(160deg,rgba(30,41,59,0.8),rgba(2,6,23,0.85));box-shadow:inset 0 0 0 1px rgba(148,163,184,0.15);}
      .cb-field-card .cb-card-name{font-weight:700;font-size:15px;letter-spacing:0.05em;}
      .cb-field-card .cb-card-stats{font-size:12px;color:#cbd5f5;display:flex;gap:12px;}
      .cb-field-card .cb-card-tags{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;}
      .cb-chip{padding:2px 8px;border-radius:999px;font-size:11px;letter-spacing:0.04em;background:rgba(59,130,246,0.22);color:#e2e8f0;}
      .cb-chip.attr-fire{background:rgba(248,113,113,0.22);color:#fecaca;}
      .cb-chip.attr-water{background:rgba(56,189,248,0.24);color:#bae6fd;}
      .cb-chip.attr-wind{background:rgba(74,222,128,0.24);color:#bbf7d0;}
      .cb-chip.attr-earth{background:rgba(163,230,53,0.26);color:#d9f99d;}
      .cb-chip.attr-light{background:rgba(250,204,21,0.28);color:#fef08a;}
      .cb-chip.attr-dark{background:rgba(148,163,184,0.26);color:#e2e8f0;}
      .cb-chip.attr-arcane{background:rgba(244,114,182,0.24);color:#fbcfe8;}
      .cb-card-mode{font-size:11px;color:#94a3b8;letter-spacing:0.04em;}
      .cb-grave{display:flex;gap:6px;flex-wrap:wrap;max-width:100%;}
      .cb-grave-card{padding:4px 8px;border-radius:10px;background:rgba(30,41,59,0.6);border:1px solid rgba(148,163,184,0.2);font-size:11px;color:#94a3b8;}
      .cb-hand-area{display:flex;flex-direction:column;gap:12px;}
      .cb-hand{display:flex;flex-wrap:wrap;gap:12px;align-items:stretch;}
      .cb-card{flex:1 1 160px;min-width:160px;max-width:220px;border-radius:14px;padding:10px 12px;background:linear-gradient(160deg,rgba(30,41,59,0.8),rgba(15,23,42,0.9));border:1px solid rgba(148,163,184,0.28);box-shadow:0 10px 24px rgba(2,6,23,0.45);display:flex;flex-direction:column;gap:6px;cursor:pointer;transition:transform 0.18s,box-shadow 0.18s,border-color 0.18s;}
      .cb-card:hover{transform:translateY(-2px);border-color:rgba(59,130,246,0.55);box-shadow:0 16px 32px rgba(14,165,233,0.28);}
      .cb-card.selected{border-color:rgba(236,72,153,0.75);box-shadow:0 18px 40px rgba(236,72,153,0.35);}
      .cb-card h3{margin:0;font-size:15px;letter-spacing:0.05em;color:#e2e8f0;}
      .cb-card p{margin:0;font-size:12px;color:#cbd5f5;line-height:1.5;}
      .cb-card .cb-card-meta{display:flex;gap:10px;font-size:11px;color:#94a3b8;}
      .cb-card .cb-card-effect{font-size:12px;color:#cbd5f5;min-height:48px;}
      .cb-card-detail{border-radius:16px;padding:14px 16px;background:rgba(15,23,42,0.6);border:1px solid rgba(148,163,184,0.2);display:flex;flex-direction:column;gap:10px;min-height:140px;}
      .cb-card-detail h4{margin:0;font-size:15px;color:#38bdf8;}
      .cb-card-detail p{margin:0;font-size:12px;color:#cbd5f5;line-height:1.6;}
      .cb-card-detail .cb-card-actions{display:flex;flex-wrap:wrap;gap:10px;}
      .cb-card-detail button{padding:8px 14px;border-radius:12px;border:1px solid rgba(59,130,246,0.5);background:rgba(59,130,246,0.18);color:#e2e8f0;cursor:pointer;font-size:12px;letter-spacing:0.05em;transition:transform 0.15s,background 0.15s;}
      .cb-card-detail button:hover{background:rgba(59,130,246,0.28);transform:translateY(-1px);}
      .cb-card-detail button:disabled{opacity:0.5;cursor:not-allowed;}
      .cb-actions{display:flex;flex-wrap:wrap;gap:10px;}
      .cb-actions button{flex:1 1 160px;padding:12px 16px;border-radius:14px;border:1px solid rgba(148,163,184,0.28);background:rgba(30,41,59,0.75);color:#e2e8f0;font-weight:600;cursor:pointer;transition:transform 0.18s,box-shadow 0.18s,border-color 0.18s;}
      .cb-actions button.primary{background:linear-gradient(135deg,#22d3ee,#6366f1);color:#0f172a;border-color:rgba(59,130,246,0.45);box-shadow:0 12px 28px rgba(14,165,233,0.3);}
      .cb-actions button:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 16px 32px rgba(14,165,233,0.26);}
      .cb-actions button:disabled{opacity:0.5;cursor:not-allowed;box-shadow:none;}
      .cb-log{border-radius:16px;padding:12px 14px;background:rgba(15,23,42,0.55);border:1px solid rgba(148,163,184,0.18);max-height:160px;overflow:auto;}
      .cb-log h4{margin:0 0 6px;font-size:13px;color:#94a3b8;letter-spacing:0.05em;}
      .cb-log ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:4px;}
      .cb-log li{font-size:12px;color:#cbd5f5;line-height:1.4;}
      .cb-win-banner{position:absolute;inset:12px;border-radius:18px;border:1px solid rgba(250,204,21,0.4);background:rgba(250,204,21,0.08);backdrop-filter:blur(2px);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;z-index:5;text-align:center;padding:20px;}
      .cb-win-banner h3{margin:0;font-size:24px;letter-spacing:0.08em;color:#facc15;}
      .cb-win-banner p{margin:0;font-size:14px;color:#fef08a;}
      @media(max-width:720px){
        .card-battle-root{padding:16px;}
        .cb-hand{flex-direction:column;}
        .cb-card{max-width:none;}
      }
    `;
    document.head.appendChild(style);
  }

  function monster(def){
    return Object.assign({ kind: 'Monster', type: '戦士', level: 4, limit: 2, aiScore: 6 }, def);
  }

  function spell(def){
    return Object.assign({ kind: 'Spell', limit: 2, aiScore: 5 }, def);
  }

  const CARD_POOL = [
    monster({
      id: 'blazing_drake',
      name: '焔竜ブレイズ',
      attribute: 'FIRE',
      type: 'ドラゴン',
      level: 6,
      attack: 2300,
      defense: 1600,
      limit: 1,
      effectText: '召喚時に自身の攻撃力+300。炎属性が有利を取ると与えるダメージ+200。',
      aiScore: 8,
      onSummon(ctx){
        ctx.modifySelf({ bonusAttack: 300 });
        ctx.source.flags = ctx.source.flags || {};
        ctx.source.flags.bonusBurn = true;
        ctx.log('焔竜ブレイズの咆哮！攻撃力が300上昇。');
        ctx.rewardXp(4);
      }
    }),
    monster({
      id: 'scarlet_duelist',
      name: '紅狐のデュエリスト',
      attribute: 'FIRE',
      type: '獣戦士',
      level: 4,
      attack: 1700,
      defense: 1200,
      effectText: '召喚時、自身の攻撃力+200。相手モンスターが守備表示なら200ダメージ。',
      aiScore: 6.5,
      onSummon(ctx){
        ctx.modifySelf({ bonusAttack: 200 });
        if (ctx.opponent.field.monster && ctx.opponent.field.monster.mode === 'DEFENSE'){
          ctx.damageOpponent(200);
          ctx.log('守備の相手に紅狐が奇襲を仕掛けた！');
        }
      }
    }),
    monster({
      id: 'inferno_mechanist',
      name: 'インフェルノ・メカニスト',
      attribute: 'FIRE',
      type: '機械',
      level: 5,
      attack: 1800,
      defense: 1500,
      effectText: '墓地の魔法カードが1枚以上なら200ダメージ。さらに自身の攻撃力+150。',
      aiScore: 6.8,
      onSummon(ctx){
        const spellCount = ctx.owner.graveyard.filter(c => c.def.kind === 'Spell').length;
        if (spellCount > 0){
          ctx.damageOpponent(200);
          ctx.log('インフェルノ・メカニストがエネルギーを放出！200ダメージ。');
        }
        ctx.modifySelf({ bonusAttack: 150 });
      }
    }),
    monster({
      id: 'aqua_oracle',
      name: '水界の神託者ミリア',
      attribute: 'WATER',
      type: '魔法使い',
      level: 4,
      attack: 1500,
      defense: 1800,
      effectText: '召喚時に1枚ドローし、自分のLPを200回復。',
      aiScore: 6.5,
      onSummon(ctx){
        ctx.draw(1);
        ctx.heal(200);
        ctx.log('ミリアの神託で手札を補充しLPを回復。');
        ctx.rewardXp(3);
      }
    }),
    monster({
      id: 'tide_leviathan',
      name: '潮牙のリヴァイアサン',
      attribute: 'WATER',
      type: '海竜',
      level: 6,
      attack: 1200,
      defense: 2400,
      limit: 1,
      effectText: '召喚時は守備表示で出し、守備力+200。次に受けるダメージを200軽減。',
      aiScore: 7,
      onSummon(ctx){
        ctx.modifySelf({ bonusDefense: 200, mode: 'DEFENSE' });
        ctx.owner.barrier += 200;
        ctx.log('潮牙の防壁が発動。バリアで200ダメージを軽減できる。');
      }
    }),
    monster({
      id: 'glacial_sentinel',
      name: '氷甲のセンチネル',
      attribute: 'WATER',
      type: '戦士',
      level: 5,
      attack: 1300,
      defense: 2200,
      effectText: '召喚時に守備力+200し、自分のLPを300回復。',
      aiScore: 6.6,
      onSummon(ctx){
        ctx.modifySelf({ bonusDefense: 200, mode: 'DEFENSE' });
        ctx.heal(300);
        ctx.log('氷甲のセンチネルが氷壁を展開。');
      }
    }),
    monster({
      id: 'zephyr_striker',
      name: '疾風のストライカー',
      attribute: 'WIND',
      type: '戦士',
      level: 4,
      attack: 1900,
      defense: 1300,
      effectText: '召喚時、相手モンスターを守備表示にし、その守備力を200下げる。',
      aiScore: 6.9,
      onSummon(ctx){
        if (ctx.opponent.field.monster){
          ctx.weakenOpponent({ forceDefense: true, tempDefense: -200 });
          ctx.log('疾風のストライカーが守備を崩す！');
        }
        ctx.rewardXp(3);
      }
    }),
    monster({
      id: 'storm_harpist',
      name: 'ストーム・ハーピスト',
      attribute: 'WIND',
      type: '鳥獣',
      level: 4,
      attack: 1600,
      defense: 1400,
      effectText: '墓地に魔法があればこのターン攻撃力+400、なければ永続で+100。',
      aiScore: 6.2,
      onSummon(ctx){
        const hasSpell = ctx.owner.graveyard.some(c => c.def.kind === 'Spell');
        if (hasSpell){
          ctx.modifySelf({ tempAttack: 400 });
          ctx.log('ハーピストが魔風を纏い攻撃力が一時的に上昇！');
        } else {
          ctx.modifySelf({ bonusAttack: 100 });
          ctx.log('魔法が無くとも風の旋律で攻撃力が上昇。');
        }
      }
    }),
    monster({
      id: 'terra_bulwark',
      name: '大地のブルワーク',
      attribute: 'EARTH',
      type: '岩石',
      level: 4,
      attack: 1400,
      defense: 2100,
      effectText: '召喚時に守備表示で出し、守備力+300。',
      aiScore: 6.7,
      onSummon(ctx){
        ctx.modifySelf({ bonusDefense: 300, mode: 'DEFENSE' });
        ctx.log('大地のブルワークが堅牢な壁を築く。');
      }
    }),
    monster({
      id: 'verdant_channeler',
      name: '翠緑のチャネラー',
      attribute: 'EARTH',
      type: '魔法使い',
      level: 4,
      attack: 1500,
      defense: 1600,
      effectText: '墓地のモンスター1体を手札に戻し、自分のLPを100回復。',
      aiScore: 6.4,
      onSummon(ctx){
        const target = ctx.takeFromGrave(card => card.def.kind === 'Monster');
        if (target){
          ctx.addToHand(target);
          ctx.heal(100);
          ctx.log(`${target.def.name}を手札に呼び戻した。`);
        } else {
          ctx.log('墓地にモンスターが存在しない。');
        }
      }
    }),
    monster({
      id: 'quartz_colossus',
      name: '晶岩のコロッサス',
      attribute: 'EARTH',
      type: '岩石',
      level: 5,
      attack: 1900,
      defense: 2100,
      limit: 1,
      effectText: '相手攻撃力が2000以上ならこのターンその攻撃力-300。そうでなければ自身+200。',
      aiScore: 7,
      onSummon(ctx){
        if (ctx.opponent.field.monster && ctx.opponent.field.monster.def.attack >= 2000){
          ctx.weakenOpponent({ tempAttack: -300 });
          ctx.log('晶岩のコロッサスが敵の力を削ぐ。');
        } else {
          ctx.modifySelf({ bonusAttack: 200 });
          ctx.log('コロッサスが屈強な体躯で攻撃力を底上げ。');
        }
      }
    }),
    monster({
      id: 'lumina_paladin',
      name: '光翼のパラディン',
      attribute: 'LIGHT',
      type: '戦士',
      level: 4,
      attack: 1800,
      defense: 1500,
      effectText: '召喚時にLPを400回復し、自分フィールドのモンスター1体の攻撃力+200。',
      aiScore: 7,
      onSummon(ctx){
        ctx.heal(400);
        const ally = ctx.owner.field.monster && ctx.owner.field.monster !== ctx.source ? ctx.owner.field.monster : ctx.source;
        if (ally){
          ctx.modifyCard(ally, { bonusAttack: 200 });
        }
        ctx.log('光翼のパラディンが仲間を鼓舞する。');
        ctx.rewardXp(4);
      }
    }),
    monster({
      id: 'radiant_valkyrie',
      name: '輝鎧のヴァルキリー',
      attribute: 'LIGHT',
      type: '天使',
      level: 5,
      attack: 2000,
      defense: 1700,
      effectText: '召喚時、このターン自身攻撃力+300。墓地に光属性があれば永続で+200。',
      aiScore: 7.2,
      onSummon(ctx){
        ctx.modifySelf({ tempAttack: 300 });
        const hasLight = ctx.owner.graveyard.some(c => c.def.attribute === 'LIGHT');
        if (hasLight){
          ctx.modifySelf({ bonusAttack: 200 });
          ctx.log('光の記憶がヴァルキリーを強化！');
        }
      }
    }),
    monster({
      id: 'chrono_engineer',
      name: 'クロノ・エンジニア',
      attribute: 'LIGHT',
      type: '機械',
      level: 4,
      attack: 1600,
      defense: 1500,
      effectText: '召喚時、相手モンスターの攻撃力をこのターン300下げ、自身は200上がる。',
      aiScore: 6.6,
      onSummon(ctx){
        ctx.modifySelf({ bonusAttack: 200 });
        ctx.weakenOpponent({ tempAttack: -300 });
        ctx.log('クロノ・エンジニアが時間場を歪め攻防を操作。');
      }
    }),
    monster({
      id: 'umbra_assassin',
      name: '影刃のアサシン',
      attribute: 'DARK',
      type: '戦士',
      level: 4,
      attack: 1900,
      defense: 1100,
      effectText: '召喚時、相手攻撃力2000以下のモンスターを破壊し、自分は200ダメージ。できなければ自身+200。',
      aiScore: 6.9,
      onSummon(ctx){
        if (ctx.opponent.field.monster && ctx.opponent.field.monster.def.attack <= 2000){
          const destroyed = ctx.removeOpponentMonster();
          if (destroyed){
            ctx.damageSelf(200);
            ctx.log('影刃のアサシンが敵を瞬殺。しかし反動で200ダメージ。');
            ctx.rewardXp(4);
            return;
          }
        }
        ctx.modifySelf({ bonusAttack: 200 });
        ctx.log('標的がいないため暗器を磨ぐ。');
      }
    }),
    monster({
      id: 'nocturne_ravager',
      name: '夜想のラヴェジャー',
      attribute: 'DARK',
      type: '悪魔',
      level: 4,
      attack: 1700,
      defense: 1400,
      effectText: '墓地のカード2枚につき攻撃力+100（最大+400）。',
      aiScore: 6.5,
      onSummon(ctx){
        const bonus = Math.min(4, Math.floor(ctx.owner.graveyard.length / 2)) * 100;
        if (bonus > 0){
          ctx.modifySelf({ bonusAttack: bonus });
          ctx.log(`墓地の影響で攻撃力が${bonus}上昇。`);
        }
      }
    }),
    monster({
      id: 'abyss_librarian',
      name: '深淵の司書',
      attribute: 'DARK',
      type: '魔法使い',
      level: 4,
      attack: 1500,
      defense: 1600,
      effectText: '墓地の魔法1枚を手札に加える。なければデッキトップを墓地へ送る。',
      aiScore: 6.3,
      onSummon(ctx){
        const spell = ctx.takeFromGrave(card => card.def.kind === 'Spell');
        if (spell){
          ctx.addToHand(spell);
          ctx.log('深淵の司書が失われた魔法を回収。');
        } else {
          ctx.millDeck(1);
          ctx.log('司書は資料を探すも見つからず、デッキトップを墓地へ。');
        }
      }
    }),
    monster({
      id: 'arcane_archivist',
      name: '秘紋のアーキビスト',
      attribute: 'ARCANE',
      type: '魔法使い',
      level: 4,
      attack: 1400,
      defense: 1500,
      effectText: '召喚時に1枚ドロー。このターンに魔法を使っていれば攻撃力+200、そうでなければ次の被ダメージ100軽減。',
      aiScore: 6.4,
      onSummon(ctx){
        ctx.draw(1);
        if ((ctx.owner.turnFlags.spellsUsed || 0) > 0){
          ctx.modifySelf({ bonusAttack: 200 });
          ctx.log('秘紋のアーキビストが魔法反響で攻撃力アップ。');
        } else {
          ctx.owner.barrier += 100;
          ctx.log('魔法の準備で結界を張り、次のダメージを100軽減。');
        }
      }
    }),
    monster({
      id: 'stellar_enchanter',
      name: '星紋のエンチャンター',
      attribute: 'ARCANE',
      type: '天使',
      level: 5,
      attack: 1750,
      defense: 1800,
      effectText: '召喚時、任意の味方モンスターの攻撃・守備をそれぞれ+150。自身が対象の場合さらに+150。',
      aiScore: 6.8,
      onSummon(ctx){
        const ally = ctx.owner.field.monster && ctx.owner.field.monster !== ctx.source ? ctx.owner.field.monster : ctx.source;
        if (ally){
          ctx.modifyCard(ally, { bonusAttack: 150, bonusDefense: 150 });
          if (ally === ctx.source){
            ctx.modifySelf({ bonusAttack: 150, bonusDefense: 150 });
          }
          ctx.log('星紋のエンチャンターが星霊強化を施す。');
        }
      }
    }),
    spell({
      id: 'nova_burst',
      name: 'ノヴァ・バースト',
      attribute: 'FIRE',
      effectText: '相手に400ダメージ。自分フィールドに炎属性がいればさらに+200。',
      aiScore: 7,
      onPlay(ctx){
        let damage = 400;
        const monster = ctx.field('self').monster;
        if (monster && monster.def.attribute === 'FIRE'){ damage += 200; }
        ctx.damageOpponent(damage);
        ctx.log(`ノヴァ・バーストが炸裂し${damage}ダメージ！`);
        ctx.rewardXp(3);
      }
    }),
    spell({
      id: 'cascade_renewal',
      name: 'カスケード・リニューアル',
      attribute: 'WATER',
      effectText: '自分のLPを500回復。水属性モンスターがいれば1枚ドロー。',
      aiScore: 6.5,
      onPlay(ctx){
        ctx.heal(500);
        const monster = ctx.field('self').monster;
        if (monster && monster.def.attribute === 'WATER'){
          ctx.draw(1);
          ctx.log('水流の加護で更に1枚ドロー。');
        } else {
          ctx.log('潤いの波動がLPを満たす。');
        }
      }
    }),
    spell({
      id: 'gale_formation',
      name: 'ゲイル・フォーメーション',
      attribute: 'WIND',
      effectText: '味方モンスター1体の攻撃力をこのターン+400。風属性なら追加で+200。モンスターがいなければ1枚ドロー。',
      aiScore: 6.8,
      onPlay(ctx){
        const monster = ctx.field('self').monster;
        if (monster){
          ctx.modifyCard(monster, { tempAttack: 400 });
          if (monster.def.attribute === 'WIND'){
            ctx.modifyCard(monster, { tempAttack: 200 });
          }
          ctx.log('ゲイル・フォーメーションで追い風が吹く！');
        } else {
          ctx.draw(1);
          ctx.log('モンスターが不在のためドローに変換。');
        }
      }
    }),
    spell({
      id: 'earthen_resurgence',
      name: 'アースン・リザージェンス',
      attribute: 'EARTH',
      effectText: '墓地のモンスター1体を手札に戻す。地属性なら200回復。墓地にいない場合は1枚ドロー。',
      aiScore: 6.4,
      onPlay(ctx){
        const target = ctx.takeFromGrave(card => card.def.kind === 'Monster');
        if (target){
          ctx.addToHand(target);
          if (target.def.attribute === 'EARTH'){ ctx.heal(200); }
          ctx.log(`${target.def.name}を手札に戻した。`);
        } else {
          ctx.draw(1);
          ctx.log('復活させるモンスターがいないためドロー。');
        }
      }
    }),
    spell({
      id: 'luminal_barrier',
      name: 'ルミナル・バリア',
      attribute: 'LIGHT',
      effectText: '自分のLPを400回復し、味方モンスターの守備力+200。さらに200ダメージ分のシールドを得る。',
      aiScore: 6.6,
      onPlay(ctx){
        ctx.heal(400);
        const monster = ctx.field('self').monster;
        if (monster){
          ctx.modifyCard(monster, { bonusDefense: 200 });
        }
        ctx.owner.barrier += 200;
        ctx.log('ルミナル・バリアが光壁を展開。');
      }
    }),
    spell({
      id: 'shadow_exchange',
      name: 'シャドウ・エクスチェンジ',
      attribute: 'DARK',
      effectText: '相手モンスターの攻撃力をこのターン400下げる。自分フィールドに闇属性がいれば相手に200ダメージ。',
      aiScore: 6.7,
      onPlay(ctx){
        ctx.weakenOpponent({ tempAttack: -400 });
        const monster = ctx.field('self').monster;
        if (monster && monster.def.attribute === 'DARK'){
          ctx.damageOpponent(200);
          ctx.log('闇の取引で200ダメージを追加。');
        } else {
          ctx.log('影の交換で敵の力を削ぐ。');
        }
      }
    }),
    spell({
      id: 'arcane_compass',
      name: 'アーケイン・コンパス',
      attribute: 'ARCANE',
      limit: 3,
      effectText: '2枚ドローし、手札からランダムに1枚をデッキボトムへ戻す。',
      aiScore: 6.9,
      onPlay(ctx){
        ctx.draw(2);
        const removed = ctx.removeRandomFromHand();
        if (removed){
          ctx.returnToDeckBottom(removed);
          ctx.log(`${removed.def.name}をデッキボトムに戻した。`);
        } else {
          ctx.log('戻すカードがないため効果は終了。');
        }
      }
    })
  ];

  function hasAttributeAdvantage(attacker, defender){
    if (!attacker || !defender) return false;
    const list = ATTRIBUTE_ADVANTAGE[attacker];
    return Array.isArray(list) && list.includes(defender);
  }

  function shuffle(array){
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function buildDeck(rule){
    const counts = new Map();
    const deck = [];
    let focus = [];
    if (rule.deckBias === 'attribute'){
      const choices = shuffle(ATTRIBUTES.filter(a => a !== 'ARCANE'));
      focus = choices.slice(0, 2);
    }
    let guard = 0;
    while (deck.length < rule.deckSize && guard < 400){
      guard += 1;
      let pool = CARD_POOL;
      if (focus.length){
        pool = CARD_POOL.filter(card => card.kind === 'Spell' || card.attribute === 'ARCANE' || focus.includes(card.attribute));
        if (pool.length === 0) pool = CARD_POOL;
      }
      const card = pool[Math.floor(Math.random() * pool.length)];
      if (!card) break;
      const limit = card.limit || 2;
      const current = counts.get(card.id) || 0;
      if (current >= limit) continue;
      counts.set(card.id, current + 1);
      deck.push(card);
    }
    if (deck.length < rule.deckSize){
      // fallback fill ignoring limits
      const pool = CARD_POOL;
      while (deck.length < rule.deckSize){
        const card = pool[Math.floor(Math.random() * pool.length)];
        deck.push(card);
      }
    }
    return { deck, focus };
  }

  function createCardInstance(def, ownerId){
    return {
      def,
      owner: ownerId,
      instanceId: `${def.id}-${Math.random().toString(36).slice(2, 10)}`,
      bonusAttack: 0,
      bonusDefense: 0,
      tempAttack: 0,
      tempDefense: 0,
      mode: 'ATTACK',
      flags: {}
    };
  }

  function cloneDefinition(def){
    return Object.assign({}, def);
  }

  function applyCardModification(card, opts){
    if (!card || !opts) return;
    if (Number.isFinite(opts.bonusAttack)) card.bonusAttack = (card.bonusAttack || 0) + opts.bonusAttack;
    if (Number.isFinite(opts.bonusDefense)) card.bonusDefense = (card.bonusDefense || 0) + opts.bonusDefense;
    if (Number.isFinite(opts.tempAttack)) card.tempAttack = (card.tempAttack || 0) + opts.tempAttack;
    if (Number.isFinite(opts.tempDefense)) card.tempDefense = (card.tempDefense || 0) + opts.tempDefense;
    if (opts.forceDefense || opts.mode === 'DEFENSE') card.mode = 'DEFENSE';
    if (opts.forceAttack || opts.mode === 'ATTACK') card.mode = 'ATTACK';
  }

  function create(root, awardXp){
    ensureStyles();
    if (!root) return;
    root.textContent = '';
    const container = document.createElement('div');
    container.className = 'card-battle-root';
    root.appendChild(container);

    // Header
    const header = document.createElement('div');
    header.className = 'cb-header';
    container.appendChild(header);

    const titleBox = document.createElement('div');
    titleBox.className = 'cb-title';
    const title = document.createElement('h2');
    title.textContent = 'Element Chronicle';
    const subtitle = document.createElement('p');
    subtitle.textContent = '属性シナジーと多彩なカードで戦うミニカードバトル';
    titleBox.appendChild(title);
    titleBox.appendChild(subtitle);
    header.appendChild(titleBox);

    const controls = document.createElement('div');
    controls.className = 'cb-controls';
    const ruleLabel = document.createElement('label');
    ruleLabel.textContent = 'ルール';
    ruleLabel.setAttribute('for', 'cb-rule-select');
    const ruleSelect = document.createElement('select');
    ruleSelect.id = 'cb-rule-select';
    RULES.forEach(rule => {
      const option = document.createElement('option');
      option.value = rule.id;
      option.textContent = rule.label;
      ruleSelect.appendChild(option);
    });
    const newDuelBtn = document.createElement('button');
    newDuelBtn.type = 'button';
    newDuelBtn.textContent = '新しいデュエル';
    controls.appendChild(ruleLabel);
    controls.appendChild(ruleSelect);
    controls.appendChild(newDuelBtn);
    header.appendChild(controls);

    // Status area
    const status = document.createElement('div');
    status.className = 'cb-status';
    container.appendChild(status);

    function createLifePanel(name, enemy){
      const panel = document.createElement('div');
      panel.className = 'cb-life-panel' + (enemy ? ' enemy' : '');
      const nameEl = document.createElement('strong');
      nameEl.textContent = name;
      const lifeEl = document.createElement('div');
      lifeEl.className = 'cb-life';
      lifeEl.textContent = '0';
      const handEl = document.createElement('div');
      handEl.className = 'cb-hand-count';
      handEl.textContent = '手札: 0';
      panel.appendChild(nameEl);
      panel.appendChild(lifeEl);
      panel.appendChild(handEl);
      return { panel, lifeEl, handEl };
    }

    const enemyPanel = createLifePanel('AIアークナイト', true);
    const playerPanel = createLifePanel('プレイヤー', false);

    const turnInfo = document.createElement('div');
    turnInfo.className = 'cb-turn-info';
    const turnLabel = document.createElement('strong');
    turnLabel.textContent = '準備中';
    const turnMeta = document.createElement('div');
    turnMeta.className = 'cb-rule-desc';
    turnMeta.textContent = '';
    turnInfo.appendChild(turnLabel);
    turnInfo.appendChild(turnMeta);

    status.appendChild(enemyPanel.panel);
    status.appendChild(turnInfo);
    status.appendChild(playerPanel.panel);

    // Field
    const field = document.createElement('div');
    field.className = 'cb-field';
    container.appendChild(field);

    function createFieldSide(enemy){
      const side = document.createElement('div');
      side.className = 'cb-side' + (enemy ? ' enemy' : '');
      const cardSlot = document.createElement('div');
      cardSlot.className = 'cb-field-card';
      const grave = document.createElement('div');
      grave.className = 'cb-grave';
      side.appendChild(cardSlot);
      side.appendChild(grave);
      return { side, cardSlot, grave };
    }

    const enemyField = createFieldSide(true);
    const playerField = createFieldSide(false);
    field.appendChild(enemyField.side);
    field.appendChild(playerField.side);

    // Hand and detail
    const handArea = document.createElement('div');
    handArea.className = 'cb-hand-area';
    const handList = document.createElement('div');
    handList.className = 'cb-hand';
    const cardDetail = document.createElement('div');
    cardDetail.className = 'cb-card-detail';
    cardDetail.innerHTML = '<h4>カード詳細</h4><p>手札からカードを選択してください。</p>';
    handArea.appendChild(handList);
    handArea.appendChild(cardDetail);
    container.appendChild(handArea);

    // Actions
    const actions = document.createElement('div');
    actions.className = 'cb-actions';
    const battleBtn = document.createElement('button');
    battleBtn.className = 'primary';
    battleBtn.textContent = 'バトルフェイズ';
    const endTurnBtn = document.createElement('button');
    endTurnBtn.textContent = 'ターン終了';
    actions.appendChild(battleBtn);
    actions.appendChild(endTurnBtn);
    container.appendChild(actions);

    // Log
    const logBox = document.createElement('div');
    logBox.className = 'cb-log';
    const logTitle = document.createElement('h4');
    logTitle.textContent = 'デュエルログ';
    const logList = document.createElement('ul');
    logBox.appendChild(logTitle);
    logBox.appendChild(logList);
    container.appendChild(logBox);

    const winBanner = document.createElement('div');
    winBanner.className = 'cb-win-banner';
    winBanner.style.display = 'none';
    const winTitle = document.createElement('h3');
    const winText = document.createElement('p');
    winBanner.appendChild(winTitle);
    winBanner.appendChild(winText);
    container.appendChild(winBanner);

    const state = {
      root,
      container,
      awardXp: typeof awardXp === 'function' ? awardXp : null,
      rule: RULES[0],
      players: null,
      logs: [],
      turnPlayer: null,
      turnCount: 0,
      firstPlayer: null,
      winner: null,
      ui: { selectedCardId: null },
      paused: true,
      destroyed: false
    };

    const elements = {
      ruleSelect,
      newDuelBtn,
      enemyLife: enemyPanel.lifeEl,
      enemyHand: enemyPanel.handEl,
      playerLife: playerPanel.lifeEl,
      playerHand: playerPanel.handEl,
      turnLabel,
      turnMeta,
      enemyField: enemyField.cardSlot,
      playerField: playerField.cardSlot,
      enemyGrave: enemyField.grave,
      playerGrave: playerField.grave,
      handList,
      cardDetail,
      battleBtn,
      endTurnBtn,
      logList,
      winBanner,
      winTitle,
      winText
    };

    const activeTimeouts = new Set();
    const pausedTasks = [];

    function scheduleTask(fn, delay){
      if (state.destroyed) return null;
      const task = { fn };
      task.id = setTimeout(() => {
        activeTimeouts.delete(task);
        if (state.destroyed) return;
        if (state.paused){
          pausedTasks.push(fn);
          return;
        }
        fn();
      }, delay);
      activeTimeouts.add(task);
      return task.id;
    }

    // Helper functions inside create
    function award(amount, meta){
      if (!amount || !state.awardXp) return;
      try { state.awardXp(amount, Object.assign({ game: 'card_battle' }, meta || {})); } catch {}
    }

    function pushLog(text){
      if (!text) return;
      state.logs.unshift({ text, id: Math.random().toString(36).slice(2) });
      if (state.logs.length > 60) state.logs.length = 60;
      renderLogs();
    }

    function renderLogs(){
      elements.logList.innerHTML = '';
      state.logs.slice(0, 40).forEach(entry => {
        const li = document.createElement('li');
        li.textContent = entry.text;
        elements.logList.appendChild(li);
      });
    }

    function resetTemps(card){
      if (!card) return;
      card.tempAttack = 0;
      card.tempDefense = 0;
    }

    function computeAttackValue(card, opponentCard, bonus){
      if (!card) return 0;
      const base = (card.def.attack || 0) + (card.bonusAttack || 0) + (card.tempAttack || 0);
      let value = base;
      if (opponentCard && hasAttributeAdvantage(card.def.attribute, opponentCard.def.attribute)){
        value += state.rule.attributeBonus;
        if (card.flags && card.flags.bonusBurn) value += 200;
      }
      if (bonus && Number.isFinite(bonus.attack)) value += bonus.attack;
      return Math.max(0, Math.round(value));
    }

    function computeDefenseValue(card, opponentCard){
      if (!card) return 0;
      const base = (card.def.defense || 0) + (card.bonusDefense || 0) + (card.tempDefense || 0);
      let value = base;
      if (opponentCard && hasAttributeAdvantage(opponentCard.def.attribute, card.def.attribute)){
        value -= Math.floor(state.rule.attributeBonus / 2);
      }
      return Math.max(0, Math.round(value));
    }

    function renderFieldSide(side){
      const player = state.players ? state.players[side] : null;
      const fieldEl = side === 'player' ? elements.playerField : elements.enemyField;
      fieldEl.innerHTML = '';
      fieldEl.classList.remove('filled');
      if (!player || !player.field.monster){
        fieldEl.textContent = 'モンスターなし';
        return;
      }
      const card = player.field.monster;
      fieldEl.classList.add('filled');
      const nameEl = document.createElement('div');
      nameEl.className = 'cb-card-name';
      nameEl.textContent = card.def.name;
      const attrChip = document.createElement('span');
      attrChip.className = `cb-chip attr-${(card.def.attribute || 'ARCANE').toLowerCase()}`;
      attrChip.textContent = ATTRIBUTE_LABELS[card.def.attribute] || card.def.attribute;
      const statsEl = document.createElement('div');
      statsEl.className = 'cb-card-stats';
      const opponent = state.players ? state.players[side === 'player' ? 'ai' : 'player'] : null;
      const opponentCard = opponent ? opponent.field.monster : null;
      const atk = computeAttackValue(card, opponentCard);
      const def = computeDefenseValue(card, opponentCard);
      statsEl.textContent = `ATK ${atk} / DEF ${def}`;
      const modeEl = document.createElement('div');
      modeEl.className = 'cb-card-mode';
      modeEl.textContent = card.mode === 'DEFENSE' ? '守備表示' : '攻撃表示';
      const tags = document.createElement('div');
      tags.className = 'cb-card-tags';
      if (card.flags && card.flags.bonusBurn){
        const chip = document.createElement('span');
        chip.className = 'cb-chip';
        chip.textContent = '炎痕 +200';
        tags.appendChild(chip);
      }
      fieldEl.appendChild(nameEl);
      fieldEl.appendChild(attrChip);
      fieldEl.appendChild(statsEl);
      fieldEl.appendChild(modeEl);
      if (tags.childNodes.length) fieldEl.appendChild(tags);
    }

    function renderGrave(side){
      const player = state.players ? state.players[side] : null;
      const graveEl = side === 'player' ? elements.playerGrave : elements.enemyGrave;
      graveEl.innerHTML = '';
      if (!player) return;
      player.graveyard.slice(0, 8).forEach(card => {
        const item = document.createElement('div');
        item.className = 'cb-grave-card';
        item.textContent = card.def.name;
        graveEl.appendChild(item);
      });
    }

    function renderHand(){
      elements.handList.innerHTML = '';
      const player = state.players ? state.players.player : null;
      if (!player){
        elements.handList.textContent = '';
        return;
      }
      if (player.hand.length === 0){
        const empty = document.createElement('div');
        empty.className = 'cb-card';
        empty.textContent = '手札がありません。';
        empty.style.opacity = '0.6';
        elements.handList.appendChild(empty);
        return;
      }
      player.hand.forEach(card => {
        const cardEl = document.createElement('div');
        cardEl.className = 'cb-card';
        if (state.ui.selectedCardId === card.instanceId) cardEl.classList.add('selected');
        const name = document.createElement('h3');
        name.textContent = card.def.name;
        const attr = document.createElement('span');
        attr.className = `cb-chip attr-${(card.def.attribute || 'ARCANE').toLowerCase()}`;
        attr.textContent = ATTRIBUTE_LABELS[card.def.attribute] || card.def.attribute;
        const meta = document.createElement('div');
        meta.className = 'cb-card-meta';
        if (card.def.kind === 'Monster'){
          meta.textContent = `Lv${card.def.level} / ${card.def.type}`;
        } else {
          meta.textContent = `魔法 / 属性:${ATTRIBUTE_LABELS[card.def.attribute] || card.def.attribute}`;
        }
        const stats = document.createElement('div');
        stats.className = 'cb-card-meta';
        if (card.def.kind === 'Monster'){
          stats.textContent = `ATK ${card.def.attack} / DEF ${card.def.defense}`;
        } else {
          stats.textContent = '速攻発動可';
        }
        const effect = document.createElement('p');
        effect.className = 'cb-card-effect';
        effect.textContent = card.def.effectText || '';
        cardEl.appendChild(name);
        cardEl.appendChild(attr);
        cardEl.appendChild(meta);
        cardEl.appendChild(stats);
        cardEl.appendChild(effect);
        cardEl.addEventListener('click', () => {
          state.ui.selectedCardId = card.instanceId;
          renderDetail();
          renderHand();
        });
        elements.handList.appendChild(cardEl);
      });
    }

    function renderDetail(){
      const detail = elements.cardDetail;
      detail.innerHTML = '';
      const player = state.players ? state.players.player : null;
      if (!player){
        detail.innerHTML = '<h4>カード詳細</h4><p>準備中...</p>';
        return;
      }
      const card = player.hand.find(c => c.instanceId === state.ui.selectedCardId);
      if (!card){
        detail.innerHTML = '<h4>カード詳細</h4><p>手札からカードを選択してください。</p>';
        return;
      }
      const title = document.createElement('h4');
      title.textContent = card.def.name;
      const attr = document.createElement('p');
      attr.textContent = `属性: ${ATTRIBUTE_LABELS[card.def.attribute] || card.def.attribute}`;
      const info = document.createElement('p');
      if (card.def.kind === 'Monster'){
        info.textContent = `Lv${card.def.level} / ${card.def.type} / ATK ${card.def.attack} / DEF ${card.def.defense}`;
      } else {
        info.textContent = '魔法カード';
      }
      const effect = document.createElement('p');
      effect.textContent = card.def.effectText || '';
      const actionsBox = document.createElement('div');
      actionsBox.className = 'cb-card-actions';
      const canAct = state.turnPlayer === 'player' && !state.winner && state.players.player && !state.players.player.actionUsed;
      if (card.def.kind === 'Monster'){
        const summonAtk = document.createElement('button');
        summonAtk.textContent = '攻撃表示で召喚';
        summonAtk.disabled = !canAct;
        summonAtk.addEventListener('click', () => handleSummon('player', card.instanceId, 'ATTACK'));
        const summonDef = document.createElement('button');
        summonDef.textContent = '守備表示で召喚';
        summonDef.disabled = !canAct;
        summonDef.addEventListener('click', () => handleSummon('player', card.instanceId, 'DEFENSE'));
        actionsBox.appendChild(summonAtk);
        actionsBox.appendChild(summonDef);
      } else {
        const activate = document.createElement('button');
        activate.textContent = '発動';
        activate.disabled = !canAct;
        activate.addEventListener('click', () => handleSpell('player', card.instanceId));
        actionsBox.appendChild(activate);
      }
      detail.appendChild(title);
      detail.appendChild(attr);
      detail.appendChild(info);
      detail.appendChild(effect);
      detail.appendChild(actionsBox);
    }

    function renderPanels(){
      const player = state.players ? state.players.player : null;
      const enemy = state.players ? state.players.ai : null;
      if (player){
        elements.playerLife.textContent = player.life;
        elements.playerLife.classList.toggle('critical', player.life <= Math.max(500, state.rule.initialLife * 0.25));
        elements.playerHand.textContent = `手札: ${player.hand.length}`;
      }
      if (enemy){
        elements.enemyLife.textContent = enemy.life;
        elements.enemyLife.classList.toggle('critical', enemy.life <= Math.max(500, state.rule.initialLife * 0.25));
        elements.enemyHand.textContent = `手札: ${enemy.hand.length}`;
      }
      if (state.winner){
        elements.turnLabel.textContent = 'デュエル終了';
        elements.turnMeta.textContent = '新しいデュエルで再挑戦しよう';
      } else if (state.turnPlayer){
        elements.turnLabel.textContent = `${state.turnPlayer === 'player' ? 'プレイヤー' : 'AI'}のターン`;
        elements.turnMeta.textContent = `ターン${state.turnCount} / ${state.rule.label}`;
      } else {
        elements.turnLabel.textContent = '準備中';
        elements.turnMeta.textContent = state.rule.description;
      }
    }

    function renderActions(){
      const player = state.players ? state.players.player : null;
      const canBattle = state.turnPlayer === 'player' && !state.winner && player && player.field.monster && !player.attackedThisTurn;
      elements.battleBtn.disabled = !canBattle;
      const canEnd = state.turnPlayer === 'player' && !state.winner;
      elements.endTurnBtn.disabled = !canEnd;
    }

    function renderWinBanner(){
      if (!state.winner){
        elements.winBanner.style.display = 'none';
        return;
      }
      elements.winBanner.style.display = 'flex';
      if (state.winner === 'player'){
        elements.winTitle.textContent = '勝利！';
        elements.winText.textContent = 'カードの力でAIに勝利しました。新たなデッキで再挑戦しよう。';
      } else {
        elements.winTitle.textContent = '敗北...';
        elements.winText.textContent = 'AIに敗北しました。カードの組み合わせを見直してみましょう。';
      }
    }

    function renderAll(){
      renderPanels();
      renderFieldSide('player');
      renderFieldSide('ai');
      renderGrave('player');
      renderGrave('ai');
      renderHand();
      renderDetail();
      renderActions();
      renderLogs();
      renderWinBanner();
    }

    function createPlayerState(id, rule){
      return {
        id,
        name: id === 'player' ? 'プレイヤー' : 'AIアークナイト',
        life: rule.initialLife,
        deck: [],
        hand: [],
        graveyard: [],
        field: { monster: null },
        barrier: 0,
        turnShield: 0,
        turnFlags: { spellsUsed: 0 },
        focusAttributes: [],
        actionUsed: false,
        summonedThisTurn: false,
        attackedThisTurn: false
      };
    }

    function instantiateDeck(player, rule, info){
      player.deck = shuffle(info.deck.map(cloneDefinition));
      player.focusAttributes = info.focus || [];
    }

    function drawCard(side, opts = {}){
      const player = state.players ? state.players[side] : null;
      if (!player || state.winner) return null;
      if (player.deck.length === 0){
        pushLog(`${player.name}のデッキが尽きた！`);
        declareWinner(side === 'player' ? 'ai' : 'player', 'deckout');
        return null;
      }
      const def = player.deck.pop();
      const instance = createCardInstance(def, side);
      player.hand.push(instance);
      if (!opts.silent){
        if (side === 'player') pushLog(`あなたは『${def.name}』をドロー。`);
        else pushLog('AIがカードをドロー。');
      }
      return instance;
    }

    function millDeck(side, count){
      const player = state.players ? state.players[side] : null;
      if (!player || count <= 0) return;
      for (let i = 0; i < count; i += 1){
        if (player.deck.length === 0) break;
        const def = player.deck.pop();
        const inst = createCardInstance(def, side);
        player.graveyard.unshift(inst);
      }
    }

    function healLife(side, amount){
      const player = state.players ? state.players[side] : null;
      if (!player || amount <= 0) return;
      player.life = Math.min(player.life + Math.round(amount), state.rule.initialLife);
      if (side === 'player') award(1, { type: 'heal' });
    }

    function damageLife(targetId, amount, opts){
      const player = state.players ? state.players[targetId] : null;
      if (!player || amount <= 0) return 0;
      let remaining = Math.round(amount);
      if (player.turnShield > 0){
        const use = Math.min(remaining, player.turnShield);
        remaining -= use;
        player.turnShield -= use;
        if (use > 0) pushLog(`${player.name}のターンシールドが${use}ダメージを無効化！`);
      }
      if (player.barrier > 0 && remaining > 0){
        const use = Math.min(remaining, player.barrier);
        remaining -= use;
        player.barrier -= use;
        if (use > 0) pushLog(`${player.name}のバリアが${use}ダメージを肩代わり。`);
      }
      if (remaining <= 0) return 0;
      player.life = Math.max(0, player.life - remaining);
      if (targetId === 'ai') award(Math.max(1, Math.floor(remaining / 200)), { type: opts && opts.type || 'damage' });
      return remaining;
    }

    function sendToGrave(side, card, reason){
      if (!card) return;
      const player = state.players ? state.players[side] : null;
      if (!player) return;
      if (player.field.monster === card){
        player.field.monster = null;
      }
      resetTemps(card);
      card.mode = 'GRAVE';
      player.graveyard.unshift(card);
      if (player.graveyard.length > 30) player.graveyard.length = 30;
      if (reason === 'battle' && side === 'ai') award(5, { type: 'destroy' });
    }

    function removeFromHand(side, instanceId){
      const player = state.players ? state.players[side] : null;
      if (!player) return null;
      const idx = player.hand.findIndex(c => c.instanceId === instanceId);
      if (idx < 0) return null;
      return player.hand.splice(idx, 1)[0];
    }

    function triggerSummonEffects(side, card){
      if (!card || typeof card.def.onSummon !== 'function') return;
      const ctx = createEffectContext(side, card);
      try {
        card.def.onSummon(ctx);
      } catch (error){
        console.error('card summon effect error', error);
      }
      renderAll();
    }

    function handleSummon(side, instanceId, mode){
      if (state.paused || state.destroyed) return;
      if (state.winner || state.turnPlayer !== side) return;
      const player = state.players[side];
      if (!player || player.actionUsed) return;
      const card = removeFromHand(side, instanceId);
      if (!card) return;
      if (player.field.monster){
        sendToGrave(side, player.field.monster, 'replace');
        pushLog(`${player.name}はフィールドのモンスターを墓地へ送った。`);
      }
      card.mode = mode === 'DEFENSE' ? 'DEFENSE' : 'ATTACK';
      player.field.monster = card;
      player.actionUsed = true;
      player.summonedThisTurn = true;
      if (side === 'player'){
        pushLog(`あなたは『${card.def.name}』を${card.mode === 'DEFENSE' ? '守備表示' : '攻撃表示'}で召喚！`);
        award(5, { type: 'summon' });
      } else {
        pushLog(`AIは『${card.def.name}』を${card.mode === 'DEFENSE' ? '守備表示' : '攻撃表示'}で召喚。`);
      }
      triggerSummonEffects(side, card);
      state.ui.selectedCardId = null;
      renderAll();
    }

    function handleSpell(side, instanceId){
      if (state.paused || state.destroyed) return;
      if (state.winner || state.turnPlayer !== side) return;
      const player = state.players[side];
      if (!player || player.actionUsed) return;
      const card = removeFromHand(side, instanceId);
      if (!card) return;
      player.actionUsed = true;
      player.turnFlags.spellsUsed = (player.turnFlags.spellsUsed || 0) + 1;
      if (side === 'player'){
        pushLog(`あなたは魔法『${card.def.name}』を発動！`);
        award(4, { type: 'spell' });
      } else {
        pushLog(`AIは魔法『${card.def.name}』を発動。`);
      }
      if (typeof card.def.onPlay === 'function'){
        const ctx = createEffectContext(side, card);
        try {
          card.def.onPlay(ctx);
        } catch (error){
          console.error('spell effect error', error);
        }
      }
      sendToGrave(side, card, 'spell');
      if (side === 'player') state.ui.selectedCardId = null;
      renderAll();
    }

    function createEffectContext(ownerId, source){
      const owner = state.players ? state.players[ownerId] : null;
      const opponentId = ownerId === 'player' ? 'ai' : 'player';
      const opponent = state.players ? state.players[opponentId] : null;
      return {
        owner,
        opponent,
        ownerId,
        opponentId,
        source,
        state,
        log: pushLog,
        rewardXp: amount => award(amount, { type: 'effect' }),
        draw: count => {
          for (let i = 0; i < (count || 1); i += 1) drawCard(ownerId);
          renderAll();
        },
        heal: amount => {
          healLife(ownerId, amount);
          renderAll();
        },
        damageOpponent: amount => {
          damageLife(opponentId, amount, { type: 'effect' });
          renderAll();
        },
        damageSelf: amount => {
          damageLife(ownerId, amount, { type: 'effect' });
          renderAll();
        },
        modifySelf: opts => {
          applyCardModification(source, opts);
          renderAll();
        },
        modifyCard: (card, opts) => {
          applyCardModification(card, opts);
          renderAll();
        },
        modifyFriendly: opts => {
          if (!owner || !owner.field.monster) return null;
          applyCardModification(owner.field.monster, opts);
          renderAll();
        },
        weakenOpponent: opts => {
          if (!opponent || !opponent.field.monster) return null;
          applyCardModification(opponent.field.monster, opts);
          renderAll();
        },
        takeFromGrave: predicate => {
          if (!owner) return null;
          const idx = owner.graveyard.findIndex(predicate || (() => true));
          if (idx < 0) return null;
          const card = owner.graveyard.splice(idx, 1)[0];
          renderAll();
          return card;
        },
        addToHand: card => {
          if (!owner || !card) return;
          card.owner = ownerId;
          owner.hand.push(card);
          renderAll();
        },
        millDeck: count => {
          millDeck(ownerId, count);
          renderAll();
        },
        removeOpponentMonster: () => {
          if (!opponent || !opponent.field.monster) return null;
          const card = opponent.field.monster;
          sendToGrave(opponentId, card, 'effect');
          renderAll();
          return card;
        },
        field: which => {
          if (which === 'opponent') return opponent ? opponent.field : { monster: null };
          return owner ? owner.field : { monster: null };
        },
        hasAttributeInGrave: attr => owner ? owner.graveyard.some(c => c.def.attribute === attr) : false,
        removeRandomFromHand: () => {
          if (!owner || owner.hand.length === 0) return null;
          const idx = Math.floor(Math.random() * owner.hand.length);
          const card = owner.hand.splice(idx, 1)[0];
          renderAll();
          return card;
        },
        returnToDeckBottom: card => {
          if (!owner || !card) return;
          owner.deck.unshift(card.def);
          renderAll();
        }
      };
    }

    function resolveBattle(attackerId){
      if (state.paused || state.destroyed) return;
      if (state.winner) return;
      const attacker = state.players[attackerId];
      const defenderId = attackerId === 'player' ? 'ai' : 'player';
      const defender = state.players[defenderId];
      if (!attacker || !defender) return;
      const atkCard = attacker.field.monster;
      const defCard = defender.field.monster;
      if (!atkCard){
        pushLog('攻撃できるモンスターが存在しない。');
        return;
      }
      attacker.attackedThisTurn = true;
      if (!defCard){
        const damage = computeAttackValue(atkCard, null);
        const dealt = damageLife(defenderId, damage, { type: 'direct' });
        pushLog(`${atkCard.def.name}のダイレクトアタック！${dealt}ダメージ。`);
        resetTemps(atkCard);
        checkWinner();
        renderAll();
        return;
      }
      const atkValue = computeAttackValue(atkCard, defCard);
      const defValue = defCard.mode === 'DEFENSE'
        ? computeDefenseValue(defCard, atkCard)
        : computeAttackValue(defCard, atkCard);
      let summary = '';
      if (defCard.mode === 'DEFENSE'){
        if (atkValue > defValue){
          sendToGrave(defenderId, defCard, 'battle');
          summary = `${atkCard.def.name}が守備を突破！`; 
        } else if (atkValue < defValue){
          const recoil = defValue - atkValue;
          const taken = damageLife(attackerId, recoil, { type: 'counter' });
          summary = `守備が硬く、${attacker.name}が${taken}ダメージを受けた。`;
        } else {
          summary = '互角の守備で均衡。';
        }
      } else {
        if (atkValue > defValue){
          const diff = atkValue - defValue;
          sendToGrave(defenderId, defCard, 'battle');
          const dealt = damageLife(defenderId, diff, { type: 'battle' });
          summary = `${atkCard.def.name}が撃破！${dealt}の戦闘ダメージ。`;
        } else if (atkValue < defValue){
          const diff = defValue - atkValue;
          sendToGrave(attackerId, atkCard, 'battle');
          const dealt = damageLife(attackerId, diff, { type: 'battle' });
          summary = `${defCard.def.name}の反撃で${dealt}ダメージを受けた！`;
        } else {
          sendToGrave(attackerId, atkCard, 'battle');
          sendToGrave(defenderId, defCard, 'battle');
          summary = '相打ち！両者のモンスターが墓地へ。';
        }
      }
      pushLog(summary);
      resetTemps(atkCard);
      resetTemps(defCard);
      checkWinner();
      renderAll();
    }

    function checkWinner(){
      if (!state.players || state.winner) return;
      if (state.players.player.life <= 0){
        declareWinner('ai', 'life');
      } else if (state.players.ai.life <= 0){
        declareWinner('player', 'life');
      }
    }

    function declareWinner(winnerId, reason){
      if (state.winner) return;
      state.winner = winnerId;
      if (winnerId === 'player'){
        pushLog('勝利！デュエルを制しました。');
        award(120, { type: 'win', reason });
      } else {
        pushLog('敗北……デッキを調整して再挑戦しよう。');
      }
      renderWinBanner();
    }

    function endTurn(side){
      if (state.paused || state.destroyed) return;
      if (state.turnPlayer !== side || state.winner) return;
      pushLog(`${state.players[side].name}のターン終了。`);
      const next = side === 'player' ? 'ai' : 'player';
      scheduleTask(() => beginTurn(next), 450);
    }

    function beginTurn(side, opts = {}){
      if (state.paused || state.destroyed) return;
      if (state.winner) return;
      state.turnPlayer = side;
      state.turnCount += 1;
      const player = state.players[side];
      if (!player) return;
      player.actionUsed = false;
      player.summonedThisTurn = false;
      player.attackedThisTurn = false;
      player.turnShield = 0;
      player.turnFlags = { spellsUsed: 0 };
      const initial = opts.initial === true;
      const skipFirstDraw = initial && state.rule.skipFirstDraw && side === state.firstPlayer;
      const drawTotal = 1 + (state.rule.extraDraw || 0);
      for (let i = 0; i < drawTotal; i += 1){
        if (skipFirstDraw && i === 0) continue;
        drawCard(side);
      }
      if (side === 'player'){
        pushLog('あなたのターン。');
        renderAll();
      } else {
        pushLog('AIのターン。');
        renderAll();
        scheduleTask(() => aiTakeTurn(), 650);
      }
    }

    function aiTakeTurn(){
      if (state.paused || state.destroyed) return;
      if (state.winner || state.turnPlayer !== 'ai') return;
      const ai = state.players.ai;
      if (!ai) return;
      const choice = chooseAiCard();
      if (choice){
        if (choice.def.kind === 'Spell'){
          handleSpell('ai', choice.instanceId);
        } else {
          const mode = choice.def.defense + choice.bonusDefense > choice.def.attack + choice.bonusAttack + 150 ? 'DEFENSE' : 'ATTACK';
          handleSummon('ai', choice.instanceId, mode);
        }
      }
      renderAll();
      scheduleTask(() => {
        if (state.paused || state.destroyed) return;
        if (state.winner) return;
        if (ai.field.monster && !ai.attackedThisTurn){
          resolveBattle('ai');
        }
        if (!state.winner){
          scheduleTask(() => endTurn('ai'), 600);
        }
      }, 600);
    }

    function chooseAiCard(){
      const ai = state.players.ai;
      if (!ai || ai.hand.length === 0) return null;
      let best = null;
      let bestScore = -Infinity;
      ai.hand.forEach(card => {
        let score = card.def.aiScore || 0;
        if (card.def.kind === 'Monster'){
          score += (card.def.attack || 0) / 50;
          if (ai.field.monster){
            const current = ai.field.monster.def.attack + ai.field.monster.bonusAttack;
            if (card.def.attack > current + 200) score += 3;
            else score -= 2;
          }
        } else {
          score += 2;
        }
        if (score > bestScore){
          bestScore = score;
          best = card;
        }
      });
      return best;
    }

    function startNewDuel(ruleId){
      if (state.destroyed) return;
      const rule = RULE_MAP[ruleId] || RULES[0];
      state.rule = rule;
      state.turnCount = 0;
      state.winner = null;
      state.logs = [];
      state.turnPlayer = null;
      state.ui.selectedCardId = null;
      const playerState = createPlayerState('player', rule);
      const aiState = createPlayerState('ai', rule);
      const playerDeck = buildDeck(rule);
      const aiDeck = buildDeck(rule);
      instantiateDeck(playerState, rule, playerDeck);
      instantiateDeck(aiState, rule, aiDeck);
      state.players = { player: playerState, ai: aiState };
      for (let i = 0; i < rule.handSize; i += 1){
        drawCard('player', { silent: true });
        drawCard('ai', { silent: true });
      }
      pushLog(`『${rule.label}』ルールでデュエル開始！`);
      renderAll();
      const first = Math.random() < 0.5 ? 'player' : 'ai';
      state.firstPlayer = first;
      scheduleTask(() => beginTurn(first, { initial: true }), 500);
    }

    function chooseRule(ruleId){
      if (!RULE_MAP[ruleId]) return;
      ruleSelect.value = ruleId;
      state.rule = RULE_MAP[ruleId];
      renderPanels();
    }

    // Event bindings
    const onRuleChange = () => {
      if (state.paused || state.destroyed) return;
      chooseRule(ruleSelect.value);
    };

    const onNewDuelClick = () => {
      if (state.paused || state.destroyed) return;
      startNewDuel(ruleSelect.value);
    };

    const onBattleClick = () => {
      if (state.paused || state.destroyed) return;
      if (state.turnPlayer !== 'player' || state.winner) return;
      resolveBattle('player');
    };

    const onEndTurnClick = () => {
      if (state.paused || state.destroyed) return;
      endTurn('player');
    };

    ruleSelect.addEventListener('change', onRuleChange);

    newDuelBtn.addEventListener('click', onNewDuelClick);

    battleBtn.addEventListener('click', onBattleClick);

    endTurnBtn.addEventListener('click', onEndTurnClick);

    // initialize
    chooseRule(RULES[0].id);
    startNewDuel(RULES[0].id);

    function start(){
      if (state.destroyed){
        return;
      }
      const wasPaused = state.paused;
      state.paused = false;
      if (!wasPaused) return;
      while (!state.paused && pausedTasks.length){
        const task = pausedTasks.shift();
        try {
          task();
        } catch (error){
          console.error(error);
        }
      }
    }

    function stop(opts = {}){
      if (state.destroyed) return;
      if (state.paused && !opts.discardPending) return;
      state.paused = true;
      activeTimeouts.forEach(task => {
        clearTimeout(task.id);
        if (!opts.discardPending){
          pausedTasks.push(task.fn);
        }
      });
      activeTimeouts.clear();
      if (opts.discardPending){
        pausedTasks.length = 0;
      }
    }

    function destroy(){
      if (state.destroyed) return;
      stop({ discardPending: true });
      state.destroyed = true;
      ruleSelect.removeEventListener('change', onRuleChange);
      newDuelBtn.removeEventListener('click', onNewDuelClick);
      battleBtn.removeEventListener('click', onBattleClick);
      endTurnBtn.removeEventListener('click', onEndTurnClick);
      container.remove();
    }

    return {
      start,
      stop,
      destroy
    };
  }

  if (typeof window !== 'undefined' && typeof window.registerMiniGame === 'function'){
    window.registerMiniGame({
      id: 'card_battle',
      name: 'カードバトル：エレメントクロニクル',
      nameKey: 'selection.miniexp.games.card_battle.name',
      description: '属性シナジーと多彩な効果で戦う本格カードバトル。ルール選択やデッキ自動構築に対応。',
      descriptionKey: 'selection.miniexp.games.card_battle.description',
      categoryIds: ['board'],
      entry: 'games/card_battle.js',
      version: '0.1.0',
      author: 'mod',
      create
    });
  }
})();

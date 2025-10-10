(function(){
  const STYLE_ID = 'mini-sugoroku-style';
  const PATH = [
    20, 21, 22, 23, 24,
    19, 14, 9, 4,
    3, 2, 1, 0,
    5, 10, 15,
    16, 17, 18,
    13, 8, 7, 6,
    11, 12
  ];

  const I18N = typeof window !== 'undefined' ? window.I18n : null;
  const I18N_PREFIX = 'games.sugorokuLife';

  function translate(path, fallback, params) {
    const key = `${I18N_PREFIX}.${path}`;
    if (I18N && typeof I18N.t === 'function') {
      try {
        const translated = I18N.t(key, params);
        if (typeof translated === 'string' && translated !== key) {
          return translated;
        }
      } catch (error) {
        console.warn('[sugoroku_life] Failed to translate', key, error);
      }
    }
    if (typeof fallback === 'function') {
      return fallback(params || {});
    }
    return fallback !== undefined ? fallback : '';
  }

  function formatNumber(value, options) {
    if (I18N && typeof I18N.formatNumber === 'function') {
      try {
        return I18N.formatNumber(value, options);
      } catch (error) {
        console.warn('[sugoroku_life] Failed to format number', value, error);
      }
    }
    return value.toLocaleString(undefined, options);
  }

  function formatMoney(value) {
    const sign = value >= 0 ? '' : '-';
    const abs = Math.abs(value);
    const formatted = formatNumber(abs, { maximumFractionDigits: 0 });
    const unit = translate('ui.currencySuffix', 'G');
    return `${sign}${formatted}${unit}`;
  }

  function formatExp(value) {
    const rounded = Math.round(value);
    const unit = translate('ui.expUnit', 'EXP');
    const number = formatNumber(rounded, { maximumFractionDigits: 0 });
    return translate('ui.expAmount', () => `${number} ${unit}`, { value: rounded, formatted: number, unit });
  }

  const DIFFICULTY_PRESETS = {
    EASY: {
      startMoney: 2200,
      salary: 680,
      bonusMultiplier: 1.1,
      riskMultiplier: 0.85,
      xpPerMoney: 1 / 42,
      resilienceRate: 0.45,
      finalDivisor: 120
    },
    NORMAL: {
      startMoney: 1800,
      salary: 620,
      bonusMultiplier: 1,
      riskMultiplier: 1,
      xpPerMoney: 1 / 48,
      resilienceRate: 0.4,
      finalDivisor: 150
    },
    HARD: {
      startMoney: 1500,
      salary: 580,
      bonusMultiplier: 0.9,
      riskMultiplier: 1.2,
      xpPerMoney: 1 / 52,
      resilienceRate: 0.35,
      finalDivisor: 180
    }
  };

  const CHANCE_CARDS = [
    {
      id: 'startup',
      label: 'スタートアップ投資',
      description: '先見の明で投資したスタートアップが大成功！',
      money: () => 400 + Math.round(Math.random() * 300),
      xpMultiplier: 1.4
    },
    {
      id: 'travel',
      label: '世界一周の旅',
      description: '人生経験は増えたが旅費がかさんだ。',
      money: () => -300 - Math.round(Math.random() * 250),
      resilienceBonus: 6
    },
    {
      id: 'innovation',
      label: 'イノベーション賞',
      description: '社内ハッカソンで優勝し賞金を獲得！',
      money: () => 350 + Math.round(Math.random() * 200),
      xpMultiplier: 1.2
    },
    {
      id: 'carRepair',
      label: '車の修理費',
      description: '突然の故障で修理費が必要になった……。',
      money: () => -250 - Math.round(Math.random() * 200),
      resilienceBonus: 5
    },
    {
      id: 'mentor',
      label: 'メンターとの出会い',
      description: '優秀なメンターに出会いキャリアが開けた。',
      money: () => 0,
      flatXp: 15
    },
    {
      id: 'sideBusiness',
      label: '副業ヒット',
      description: '週末に始めた副業が話題になり売上が伸びた！',
      money: () => 260 + Math.round(Math.random() * 220),
      xpMultiplier: 1.15
    },
    {
      id: 'medicalBill',
      label: '医療費の支払い',
      description: '体調を崩して入院。治療費は痛い出費だが健康第一。',
      money: () => -340 - Math.round(Math.random() * 180),
      resilienceBonus: 8
    },
    {
      id: 'community',
      label: '地域イベント主催',
      description: '地域イベントの主催で感謝され、経験も積めた。',
      money: () => -120 - Math.round(Math.random() * 120),
      flatXp: 18
    },
    {
      id: 'award',
      label: '年間表彰',
      description: '社内年間表彰で表彰金を獲得！',
      money: () => 420 + Math.round(Math.random() * 260),
      xpMultiplier: 1.35
    },
    {
      id: 'market',
      label: '相場急落',
      description: '投資していた銘柄が急落。冷静に受け止めよう。',
      money: () => -280 - Math.round(Math.random() * 250),
      resilienceBonus: 7
    }
  ];

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .mini-sugoroku{position:relative;display:flex;flex-wrap:wrap;gap:18px;padding:18px 22px;background:linear-gradient(135deg,#0f172a 0%,#1e293b 40%,#111827 100%);border-radius:20px;color:#e2e8f0;font-family:"Segoe UI","Hiragino Sans","BIZ UDPGothic",sans-serif;box-shadow:0 18px 42px rgba(15,23,42,0.55);overflow:hidden;}
      .mini-sugoroku::before{content:'';position:absolute;inset:-40% 10% 30% -30%;background:radial-gradient(circle at 30% 20%,rgba(56,189,248,0.25),transparent 60%),radial-gradient(circle at 70% 80%,rgba(129,140,248,0.22),transparent 55%);filter:blur(18px);opacity:0.8;pointer-events:none;}
      .mini-sugoroku > *{position:relative;z-index:1;}
      .mini-sugoroku-board{flex:1 1 340px;min-width:320px;display:grid;grid-template-columns:repeat(5,1fr);grid-template-rows:repeat(5,minmax(58px,1fr));gap:10px;padding:18px;border-radius:18px;background:rgba(15,23,42,0.75);border:1px solid rgba(148,163,184,0.28);box-shadow:inset 0 0 18px rgba(2,6,23,0.65);}
      .mini-sugoroku-cell{position:relative;border-radius:14px;padding:10px 10px 10px 12px;display:flex;flex-direction:column;justify-content:space-between;transition:transform 0.25s ease,box-shadow 0.25s ease,border 0.25s ease;background:rgba(30,41,59,0.6);border:1px solid rgba(148,163,184,0.25);overflow:hidden;}
      .mini-sugoroku-cell::after{content:attr(data-step);position:absolute;top:6px;right:8px;font-size:11px;color:rgba(226,232,240,0.6);}
      .mini-sugoroku-cell .label{font-weight:600;font-size:14px;line-height:1.3;}
      .mini-sugoroku-cell .sub{font-size:11px;color:rgba(226,232,240,0.78);line-height:1.35;}
      .mini-sugoroku-cell.theme-start{background:linear-gradient(135deg,rgba(74,222,128,0.25),rgba(30,41,59,0.7));border-color:rgba(74,222,128,0.6);}
      .mini-sugoroku-cell.theme-income{background:linear-gradient(135deg,rgba(59,130,246,0.25),rgba(30,41,59,0.7));border-color:rgba(59,130,246,0.6);}
      .mini-sugoroku-cell.theme-expense{background:linear-gradient(135deg,rgba(248,113,113,0.22),rgba(30,41,59,0.72));border-color:rgba(248,113,113,0.55);}
      .mini-sugoroku-cell.theme-life{background:linear-gradient(135deg,rgba(244,114,182,0.22),rgba(30,41,59,0.72));border-color:rgba(244,114,182,0.55);}
      .mini-sugoroku-cell.theme-growth{background:linear-gradient(135deg,rgba(129,140,248,0.28),rgba(30,41,59,0.72));border-color:rgba(129,140,248,0.55);}
      .mini-sugoroku-cell.theme-chance{background:linear-gradient(135deg,rgba(192,132,252,0.24),rgba(30,41,59,0.72));border-color:rgba(192,132,252,0.55);}
      .mini-sugoroku-cell.theme-final{background:linear-gradient(135deg,rgba(250,204,21,0.25),rgba(30,41,59,0.72));border-color:rgba(250,204,21,0.55);}
      .mini-sugoroku-cell.active{transform:translateY(-2px) scale(1.02);box-shadow:0 16px 28px rgba(14,165,233,0.4);}
      .mini-sugoroku-cell.visited{border-style:dashed;opacity:0.92;}
      .mini-sugoroku-piece{position:absolute;width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#38bdf8,#6366f1);border:3px solid rgba(15,23,42,0.85);box-shadow:0 10px 18px rgba(14,165,233,0.45);top:50%;left:12px;transform:translate(-50%,-50%);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#0f172a;}
      .mini-sugoroku-side{flex:0 1 260px;display:flex;flex-direction:column;gap:14px;min-width:260px;}
      .mini-sugoroku-hud{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;padding:14px;border-radius:16px;background:rgba(15,23,42,0.7);border:1px solid rgba(148,163,184,0.25);}
      .mini-sugoroku-hud .item{display:flex;flex-direction:column;gap:4px;}
      .mini-sugoroku-hud .item span{font-size:11px;color:rgba(226,232,240,0.65);letter-spacing:0.04em;}
      .mini-sugoroku-hud .item strong{font-size:18px;color:#f8fafc;font-weight:700;}
      .mini-sugoroku-roll{padding:14px 18px;border-radius:16px;border:none;background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#f8fafc;font-weight:700;font-size:16px;cursor:pointer;box-shadow:0 16px 32px rgba(14,165,233,0.35);transition:transform 0.15s ease,box-shadow 0.2s ease;}
      .mini-sugoroku-roll:disabled{cursor:default;opacity:0.6;box-shadow:none;transform:none;}
      .mini-sugoroku-roll:not(:disabled):active{transform:translateY(1px);box-shadow:0 8px 18px rgba(14,165,233,0.35);}
      .mini-sugoroku-event{padding:16px;border-radius:16px;background:rgba(30,41,59,0.75);border:1px solid rgba(148,163,184,0.28);min-height:120px;display:flex;flex-direction:column;gap:8px;}
      .mini-sugoroku-event h3{margin:0;font-size:15px;color:#f1f5f9;}
      .mini-sugoroku-event p{margin:0;font-size:13px;color:#cbd5f5;line-height:1.5;}
      .mini-sugoroku-event .delta{font-weight:600;font-size:13px;}
      .mini-sugoroku-event .delta.positive{color:#4ade80;}
      .mini-sugoroku-event .delta.negative{color:#f87171;}
      .mini-sugoroku-event .delta.neutral{color:#cbd5f5;}
      .mini-sugoroku-log{flex:1;min-height:140px;background:rgba(15,23,42,0.7);border-radius:16px;border:1px solid rgba(148,163,184,0.22);padding:14px;display:flex;flex-direction:column;gap:10px;}
      .mini-sugoroku-log h4{margin:0;font-size:12px;color:#94a3b8;letter-spacing:0.05em;}
      .mini-sugoroku-log ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px;max-height:180px;overflow:auto;}
      .mini-sugoroku-log li{padding:10px 12px;border-radius:12px;background:rgba(30,41,59,0.75);display:flex;flex-direction:column;gap:4px;font-size:12px;line-height:1.4;border-left:3px solid rgba(148,163,184,0.3);}
      .mini-sugoroku-log li.positive{border-left-color:#4ade80;}
      .mini-sugoroku-log li.negative{border-left-color:#f87171;}
      .mini-sugoroku-log li.neutral{border-left-color:#94a3b8;}
      .mini-sugoroku-log li strong{font-size:13px;color:#f8fafc;}
      .mini-sugoroku-resume{padding:10px 14px;border-radius:12px;border:1px solid rgba(148,163,184,0.35);background:rgba(30,41,59,0.8);color:#e2e8f0;font-size:12px;}
      .mini-sugoroku-summary{padding:14px;border-radius:14px;background:rgba(15,23,42,0.8);border:1px solid rgba(148,163,184,0.28);display:flex;flex-direction:column;gap:6px;}
      .mini-sugoroku-summary strong{font-size:15px;color:#fbbf24;}
      .mini-sugoroku-restart{padding:10px 14px;border-radius:12px;border:1px solid rgba(59,130,246,0.4);background:linear-gradient(135deg,#22d3ee,#6366f1);color:#0f172a;font-weight:700;cursor:pointer;box-shadow:0 10px 24px rgba(59,130,246,0.35);}
      @media (max-width:720px){
        .mini-sugoroku{flex-direction:column;}
        .mini-sugoroku-side{width:100%;}
      }
    `;
    document.head.appendChild(style);
  }

  function createBoardDefinitions(config) {
    return [
      {
        key: 'start',
        label: translate('board.start.label', 'スタート'),
        sub: translate('board.start.sub', 'キャリアの幕開け'),
        theme: 'start',
        onLand: (ctx) => {
          const gain = Math.round(config.salary * 0.8);
          ctx.addMoney(gain);
          const xp = ctx.awardMoneyXp(gain, { multiplier: 1.3, reason: 'first-pay' });
          return {
            title: translate('events.start.title', '社会人生活スタート！'),
            message: translate('events.start.message', '初任給で生活の基盤を整えよう。'),
            moneyDelta: gain,
            xpEarned: xp
          };
        }
      },
      {
        key: 'orientation',
        label: translate('board.orientation.label', 'キャリア設計'),
        sub: translate('board.orientation.sub', '将来をイメージ'),
        theme: 'growth',
        onLand: (ctx) => {
          const cost = Math.round(160 * ctx.config.riskMultiplier);
          ctx.addMoney(-cost);
          const xp = ctx.grantFixedXp(12, { reason: 'career-plan' });
          return {
            title: translate('events.orientation.title', 'キャリアプランを描いた'),
            message: translate('events.orientation.message', '自己分析セミナーで視界がクリアに。将来の基礎が固まった。'),
            moneyDelta: -cost,
            xpEarned: xp
          };
        }
      },
      {
        key: 'chance',
        label: translate('board.chance.label', 'チャンスカード'),
        sub: translate('board.chance.unknown', '未知の出来事'),
        theme: 'chance',
        onLand: (ctx) => ctx.drawChance()
      },
      {
        key: 'sidejob',
        label: translate('board.sidejob.label', '副業準備'),
        sub: translate('board.sidejob.sub', '週末プロジェクト'),
        theme: 'growth',
        onLand: (ctx) => {
          const invest = Math.round(220 * ctx.config.riskMultiplier);
          ctx.addMoney(-invest);
          const gain = Math.round(280 * ctx.config.bonusMultiplier + Math.random() * 90);
          ctx.addMoney(gain);
          const net = gain - invest;
          const xp = net > 0
            ? ctx.awardMoneyXp(net, { multiplier: 1.1, reason: 'side-job' })
            : ctx.grantFixedXp(Math.round(10 * ctx.config.resilienceRate), { reason: 'side-job-resilience' });
          return {
            title: translate('events.sidejob.title', '副業プロジェクト始動'),
            message: translate('events.sidejob.message', '学んだスキルを活かした副業で早速収益が発生！'),
            moneyDelta: gain - invest,
            xpEarned: xp
          };
        }
      },
      {
        key: 'travel',
        label: translate('board.travel.label', 'リフレッシュ旅行'),
        sub: translate('board.travel.sub', '感性が磨かれる'),
        theme: 'life',
        onLand: (ctx) => {
          const cost = Math.round(260 * ctx.config.riskMultiplier);
          ctx.addMoney(-cost);
          const xp = ctx.grantFixedXp(10, { reason: 'travel' });
          return {
            title: translate('events.travel.title', '旅で感性が豊かに'),
            message: translate('events.travel.message', '景色と文化に触れて視野が拡大した。'),
            moneyDelta: -cost,
            xpEarned: xp
          };
        }
      },
      {
        key: 'salary',
        label: translate('board.salary.label', '給料日'),
        sub: translate('board.salary.sub', '努力の実り'),
        theme: 'income',
        onLand: (ctx) => {
          const gain = Math.round((ctx.state.salary + ctx.state.salaryBonus) * (0.9 + Math.random() * 0.3) * ctx.config.bonusMultiplier);
          ctx.addMoney(gain);
          const xp = ctx.awardMoneyXp(gain, { multiplier: 1.15, reason: 'salary' });
          return {
            title: translate('events.salary.title', '給料日！'),
            message: translate('events.salary.message', '今月も頑張った。生活費と貯蓄をバランスよく管理しよう。'),
            moneyDelta: gain,
            xpEarned: xp
          };
        }
      },
      {
        key: 'family',
        label: translate('board.family.label', '家族イベント'),
        sub: translate('board.family.sub', '大切な時間'),
        theme: 'life',
        onLand: (ctx) => {
          const cost = Math.round(200 * ctx.config.riskMultiplier + Math.random() * 120);
          ctx.addMoney(-cost);
          const xp = ctx.grantFixedXp(14, { reason: 'family' });
          return {
            title: translate('events.family.title', '家族との思い出'),
            message: translate('events.family.message', '大切な時間はプライスレス。心が満たされた。'),
            moneyDelta: -cost,
            xpEarned: xp
          };
        }
      },
      {
        key: 'qualification',
        label: translate('board.qualification.label', '資格取得'),
        sub: translate('board.qualification.sub', '勉強の成果'),
        theme: 'growth',
        onLand: (ctx) => {
          const cost = Math.round(240 * ctx.config.riskMultiplier);
          ctx.addMoney(-cost);
          ctx.state.salaryBonus += 70;
          const xp = ctx.grantFixedXp(18, { reason: 'qualification' });
          return {
            title: translate('events.qualification.title', '資格を取得！'),
            message: translate('events.qualification.message', '専門資格で年収がアップ。今後の給料に反映される。'),
            moneyDelta: -cost,
            xpEarned: xp
          };
        }
      },
      {
        key: 'living',
        label: translate('board.living.label', '生活費'),
        sub: translate('board.living.sub', '固定費の支払い'),
        theme: 'expense',
        onLand: (ctx) => {
          const cost = Math.round((180 + Math.random() * 120) * ctx.config.riskMultiplier);
          ctx.addMoney(-cost);
          const xp = ctx.grantFixedXp(Math.round(8 * ctx.config.resilienceRate * 2.4), { reason: 'living-cost' });
          return {
            title: translate('events.living.title', '生活費を支払った'),
            message: translate('events.living.message', '節約術を磨けばもっと余裕が生まれるかも。'),
            moneyDelta: -cost,
            xpEarned: xp
          };
        }
      },
      {
        key: 'chance',
        label: translate('board.chance.label', 'チャンスカード'),
        sub: translate('board.chance.mixed', '良くも悪くも'),
        theme: 'chance',
        onLand: (ctx) => ctx.drawChance()
      },
      {
        key: 'health',
        label: translate('board.health.label', '健康診断'),
        sub: translate('board.health.sub', '体調を見直す'),
        theme: 'life',
        onLand: (ctx) => {
          const cost = Math.round(140 * ctx.config.riskMultiplier);
          ctx.addMoney(-cost);
          const xp = ctx.grantFixedXp(9, { reason: 'health-check' });
          return {
            title: translate('events.health.title', '健康診断で安心'),
            message: translate('events.health.message', '定期的なケアで万全の体制。将来のリスクを減らせる。'),
            moneyDelta: -cost,
            xpEarned: xp
          };
        }
      },
      {
        key: 'project',
        label: translate('board.project.label', '大型プロジェクト'),
        sub: translate('board.project.sub', '責任重大'),
        theme: 'growth',
        onLand: (ctx) => {
          const gain = Math.round(340 * ctx.config.bonusMultiplier + Math.random() * 160);
          ctx.addMoney(gain);
          const xp = ctx.awardMoneyXp(gain, { multiplier: 1.25, reason: 'project' });
          return {
            title: translate('events.project.title', '大型案件を成功させた'),
            message: translate('events.project.message', 'チームを率いて成果を出し、大幅昇給のチャンス！'),
            moneyDelta: gain,
            xpEarned: xp
          };
        }
      },
      {
        key: 'donation',
        label: translate('board.donation.label', '社会貢献'),
        sub: translate('board.donation.sub', '寄付活動'),
        theme: 'life',
        onLand: (ctx) => {
          const cost = Math.round(180 * ctx.config.riskMultiplier);
          ctx.addMoney(-cost);
          const xp = ctx.grantFixedXp(16, { reason: 'donation' });
          return {
            title: translate('events.donation.title', '地域へ寄付した'),
            message: translate('events.donation.message', '社会貢献で得た信頼が今後の活動にもプラスに働きそう。'),
            moneyDelta: -cost,
            xpEarned: xp
          };
        }
      },
      {
        key: 'payday',
        label: translate('board.payday.label', '昇給ボーナス'),
        sub: translate('board.payday.sub', '成果が評価された'),
        theme: 'income',
        onLand: (ctx) => {
          const gain = Math.round((ctx.state.salary + ctx.state.salaryBonus) * 1.4 * ctx.config.bonusMultiplier);
          ctx.addMoney(gain);
          const xp = ctx.awardMoneyXp(gain, { multiplier: 1.35, reason: 'raise' });
          ctx.state.salaryBonus += 40;
          return {
            title: translate('events.payday.title', '昇給ボーナス獲得！'),
            message: translate('events.payday.message', '努力が認められ年収がさらにアップ。'),
            moneyDelta: gain,
            xpEarned: xp
          };
        }
      },
      {
        key: 'chance',
        label: translate('board.chance.label', 'チャンスカード'),
        sub: translate('board.chance.fate', '運命の一枚'),
        theme: 'chance',
        onLand: (ctx) => ctx.drawChance()
      },
      {
        key: 'mentor',
        label: translate('board.mentor.label', 'メンタリング'),
        sub: translate('board.mentor.sub', '後輩育成'),
        theme: 'growth',
        onLand: (ctx) => {
          const xp = ctx.grantFixedXp(15, { reason: 'mentoring' });
          return {
            title: translate('events.mentor.title', '後輩のメンターに'),
            message: translate('events.mentor.message', '人を育てる経験は自分の成長にもつながる。'),
            moneyDelta: 0,
            xpEarned: xp
          };
        }
      },
      {
        key: 'expense',
        label: translate('board.expense.label', '突発出費'),
        sub: translate('board.expense.sub', '想定外の修理'),
        theme: 'expense',
        onLand: (ctx) => {
          const cost = Math.round((220 + Math.random() * 180) * ctx.config.riskMultiplier);
          ctx.addMoney(-cost);
          const xp = ctx.grantFixedXp(Math.round(10 * ctx.config.resilienceRate * 2.2), { reason: 'unexpected-cost' });
          return {
            title: translate('events.expense.title', '突発的な修理費'),
            message: translate('events.expense.message', '冷静に対応して被害を最小限に抑えた。'),
            moneyDelta: -cost,
            xpEarned: xp
          };
        }
      },
      {
        key: 'team',
        label: translate('board.team.label', 'チームビルド'),
        sub: translate('board.team.sub', '信頼を築く'),
        theme: 'life',
        onLand: (ctx) => {
          const cost = Math.round(150 * ctx.config.riskMultiplier);
          ctx.addMoney(-cost);
          const xp = ctx.grantFixedXp(13, { reason: 'team-build' });
          return {
            title: translate('events.team.title', 'チームビルディング合宿'),
            message: translate('events.team.message', 'チームの絆が深まりプロジェクトが進めやすくなった。'),
            moneyDelta: -cost,
            xpEarned: xp
          };
        }
      },
      {
        key: 'chance',
        label: translate('board.chance.label', 'チャンスカード'),
        sub: translate('board.chance.twist', '予想外の展開'),
        theme: 'chance',
        onLand: (ctx) => ctx.drawChance()
      },
      {
        key: 'innovation',
        label: translate('board.innovation.label', '新規事業提案'),
        sub: translate('board.innovation.sub', '挑戦のとき'),
        theme: 'growth',
        onLand: (ctx) => {
          const invest = Math.round(260 * ctx.config.riskMultiplier);
          ctx.addMoney(-invest);
          const gain = Math.round(420 * ctx.config.bonusMultiplier + Math.random() * 190);
          ctx.addMoney(gain);
          const net = gain - invest;
          const xp = net > 0
            ? ctx.awardMoneyXp(net, { multiplier: 1.3, reason: 'new-business' })
            : ctx.grantFixedXp(Math.round(12 * ctx.config.resilienceRate), { reason: 'new-business-resilience' });
          return {
            title: translate('events.innovation.title', '新規事業がヒット'),
            message: translate('events.innovation.message', '市場のニーズを読み切り、部署の柱となる事業が完成した。'),
            moneyDelta: gain - invest,
            xpEarned: xp
          };
        }
      },
      {
        key: 'tax',
        label: translate('board.tax.label', '税金の支払い'),
        sub: translate('board.tax.sub', '社会の一員として'),
        theme: 'expense',
        onLand: (ctx) => {
          const cost = Math.round((260 + Math.random() * 140) * ctx.config.riskMultiplier);
          ctx.addMoney(-cost);
          const xp = ctx.grantFixedXp(Math.round(9 * ctx.config.resilienceRate * 2.6), { reason: 'tax' });
          return {
            title: translate('events.tax.title', '税金を納めた'),
            message: translate('events.tax.message', '社会への還元。次のチャンスに備えて家計を見直そう。'),
            moneyDelta: -cost,
            xpEarned: xp
          };
        }
      },
      {
        key: 'chance',
        label: translate('board.chance.label', 'チャンスカード'),
        sub: translate('board.chance.shift', '状況一変'),
        theme: 'chance',
        onLand: (ctx) => ctx.drawChance()
      },
      {
        key: 'festival',
        label: translate('board.festival.label', '地域フェス'),
        sub: translate('board.festival.sub', '人脈を広げる'),
        theme: 'life',
        onLand: (ctx) => {
          const cost = Math.round(160 * ctx.config.riskMultiplier);
          ctx.addMoney(-cost);
          const xp = ctx.grantFixedXp(17, { reason: 'festival' });
          return {
            title: translate('events.festival.title', '地域フェスで交流'),
            message: translate('events.festival.message', '人脈が広がり次の仕事のヒントを得た。'),
            moneyDelta: -cost,
            xpEarned: xp
          };
        }
      },
      {
        key: 'savings',
        label: translate('board.savings.label', '資産運用'),
        sub: translate('board.savings.sub', '堅実に増やす'),
        theme: 'income',
        onLand: (ctx) => {
          const gain = Math.round((260 + Math.random() * 200) * ctx.config.bonusMultiplier);
          ctx.addMoney(gain);
          const xp = ctx.awardMoneyXp(gain, { multiplier: 1.2, reason: 'investment' });
          return {
            title: translate('events.savings.title', '資産運用が好調'),
            message: translate('events.savings.message', '分散投資が功を奏し堅実に資産が増えた。'),
            moneyDelta: gain,
            xpEarned: xp
          };
        }
      },
      {
        key: 'final',
        label: translate('board.final.label', 'ゴール'),
        sub: translate('board.final.sub', '人生の集大成'),
        theme: 'final',
        onLand: (ctx) => ctx.reachGoal()
      }
    ];
  }

  function create(root, awardXp, opts) {
    ensureStyles();
    const config = DIFFICULTY_PRESETS[opts?.difficulty] || DIFFICULTY_PRESETS.NORMAL;
    const state = {
      position: 0,
      money: config.startMoney,
      salary: config.salary,
      salaryBonus: 0,
      turn: 0,
      finished: false,
      totalXp: 0,
      history: [],
      paused: false
    };
    const timers = new Set();
    const resumeQueue = [];
    const boardDefs = createBoardDefinitions(config);

    const layout = document.createElement('div');
    layout.className = 'mini-sugoroku';
    root.appendChild(layout);

    const boardEl = document.createElement('div');
    boardEl.className = 'mini-sugoroku-board';
    layout.appendChild(boardEl);

    const cells = [];
    for (let i = 0; i < 25; i++) {
      const cell = document.createElement('div');
      cell.className = 'mini-sugoroku-cell';
      cell.dataset.step = '';
      cells.push(cell);
      boardEl.appendChild(cell);
    }

    const pathCells = PATH.map((index, step) => {
      const def = boardDefs[Math.min(step, boardDefs.length - 1)];
      const cell = cells[index];
      cell.dataset.step = `${step + 1}`;
      cell.classList.add(`theme-${def.theme}`);
      const label = document.createElement('div');
      label.className = 'label';
      label.textContent = def.label;
      const sub = document.createElement('div');
      sub.className = 'sub';
      sub.textContent = def.sub;
      cell.appendChild(label);
      cell.appendChild(sub);
      return cell;
    });

    const piece = document.createElement('div');
    piece.className = 'mini-sugoroku-piece';
    piece.textContent = '◎';

    const side = document.createElement('div');
    side.className = 'mini-sugoroku-side';
    layout.appendChild(side);

    const hud = document.createElement('div');
    hud.className = 'mini-sugoroku-hud';
    side.appendChild(hud);

    function createHudItem(label) {
      const wrapper = document.createElement('div');
      wrapper.className = 'item';
      const title = document.createElement('span');
      title.textContent = label;
      const strong = document.createElement('strong');
      wrapper.appendChild(title);
      wrapper.appendChild(strong);
      hud.appendChild(wrapper);
      return strong;
    }

    const turnValue = createHudItem(translate('ui.hud.turn', 'ターン'));
    const moneyValue = createHudItem(translate('ui.hud.money', '所持金'));
    const salaryValue = createHudItem(translate('ui.hud.salary', '年収(概算)'));
    const xpValue = createHudItem(translate('ui.hud.exp', '獲得EXP'));

    const rollButton = document.createElement('button');
    rollButton.className = 'mini-sugoroku-roll';
    rollButton.textContent = translate('ui.controls.roll', 'サイコロを振る');
    side.appendChild(rollButton);

    const eventPanel = document.createElement('div');
    eventPanel.className = 'mini-sugoroku-event';
    const welcomeTitle = document.createElement('h3');
    welcomeTitle.textContent = translate('ui.welcome.title', 'ようこそ人生すごろくへ');
    const welcomeMessage = document.createElement('p');
    welcomeMessage.textContent = translate('ui.welcome.message', 'サイコロを振ってコマを進め、イベントの結果でEXPを獲得しましょう。');
    eventPanel.appendChild(welcomeTitle);
    eventPanel.appendChild(welcomeMessage);
    side.appendChild(eventPanel);

    const logPanel = document.createElement('div');
    logPanel.className = 'mini-sugoroku-log';
    const logTitle = document.createElement('h4');
    logTitle.textContent = translate('ui.log.title', '出来事ログ');
    const logList = document.createElement('ul');
    logPanel.appendChild(logTitle);
    logPanel.appendChild(logList);
    side.appendChild(logPanel);

    const summaryPanel = document.createElement('div');
    summaryPanel.className = 'mini-sugoroku-summary';
    summaryPanel.style.display = 'none';
    side.appendChild(summaryPanel);

    const restartButton = document.createElement('button');
    restartButton.className = 'mini-sugoroku-restart';
    restartButton.textContent = translate('ui.controls.restart', 'もう一度プレイ');
    restartButton.style.display = 'none';
    side.appendChild(restartButton);

    const ctx = {
      state,
      config,
      awardMoneyXp(amount, opts = {}) {
        const base = Math.abs(amount);
        if (!base) return 0;
        const multiplier = opts.multiplier ?? 1;
        const xpRaw = Math.round(base * config.xpPerMoney * multiplier);
        if (!xpRaw) return 0;
        const granted = awardXp(xpRaw, { type: opts.reason || 'money', amount }) ?? xpRaw;
        state.totalXp += granted;
        updateHud();
        return granted;
      },
      grantFixedXp(amount, meta) {
        const xpRaw = Math.max(0, Math.round(amount));
        if (!xpRaw) return 0;
        const granted = awardXp(xpRaw, meta) ?? xpRaw;
        state.totalXp += granted;
        updateHud();
        return granted;
      },
      addMoney(delta) {
        state.money += delta;
        updateHud();
      },
      drawChance() {
        const card = CHANCE_CARDS[Math.floor(Math.random() * CHANCE_CARDS.length)];
        const title = translate(`chance.${card.id}.label`, card.label);
        const description = translate(`chance.${card.id}.description`, card.description);
        const baseMoney = typeof card.money === 'function' ? card.money(state) : (card.money || 0);
        const scaled = Math.round(baseMoney >= 0 ? baseMoney * config.bonusMultiplier : baseMoney * config.riskMultiplier);
        let xp = 0;
        if (card.flatXp) {
          xp += ctx.grantFixedXp(card.flatXp, { reason: `chance:${card.id}` });
        }
        if (scaled !== 0) {
          ctx.addMoney(scaled);
          const moneyXp = ctx.awardMoneyXp(Math.abs(scaled), { multiplier: scaled > 0 ? (card.xpMultiplier ?? 1.1) : config.resilienceRate, reason: `chance:${card.id}` });
          xp += moneyXp;
        } else if (!card.flatXp) {
          xp += ctx.grantFixedXp(8, { reason: `chance:${card.id}` });
        }
        if (card.resilienceBonus) {
          xp += ctx.grantFixedXp(card.resilienceBonus, { reason: `chance:${card.id}:resilience` });
        }
        return {
          title,
          message: description,
          moneyDelta: scaled,
          xpEarned: xp
        };
      },
      reachGoal() {
        state.finished = true;
        rollButton.disabled = true;
        const finalBonus = Math.max(0, Math.floor(state.money / config.finalDivisor));
        const finalXp = ctx.grantFixedXp(finalBonus, { reason: 'retire-bonus' });
        const grade = state.money >= 5000 ? 'S' : state.money >= 3800 ? 'A' : state.money >= 2600 ? 'B' : state.money >= 1500 ? 'C' : 'D';
        const summaryMoney = formatMoney(state.money);
        const bonusAmount = Math.round(finalXp);
        const bonusText = formatNumber(bonusAmount, { maximumFractionDigits: 0 });
        showSummary({
          grade,
          finalXp,
          money: state.money
        });
        logEvent({
          tone: 'positive',
          title: translate('events.goal.logTitle', 'ゴール！'),
          detail: translate('events.goal.logDetail', () => `最終資産 ${summaryMoney} / グレード${grade} / 追加EXP ${bonusText}`, { money: summaryMoney, grade, bonus: bonusAmount, bonusFormatted: bonusText })
        });
        return {
          title: translate('events.goal.title', '人生の総決算'),
          message: translate('events.goal.message', () => `最終資産 ${summaryMoney}。グレード${grade}達成！所持金に応じたボーナスEXPを獲得しました。`, { money: summaryMoney, grade, bonus: bonusAmount, bonusFormatted: bonusText }),
          moneyDelta: 0,
          xpEarned: finalXp
        };
      }
    };

    function updateHud() {
      turnValue.textContent = formatNumber(state.turn, { maximumFractionDigits: 0 });
      moneyValue.textContent = formatMoney(state.money);
      salaryValue.textContent = formatMoney(Math.round(state.salary + state.salaryBonus));
      xpValue.textContent = formatExp(state.totalXp);
    }

    function logEvent(entry) {
      state.history.unshift({
        tone: entry.tone || (entry.moneyDelta > 0 ? 'positive' : entry.moneyDelta < 0 ? 'negative' : 'neutral'),
        title: entry.title,
        detail: entry.detail,
        moneyDelta: entry.moneyDelta ?? 0,
        xp: entry.xp ?? 0
      });
      if (state.history.length > 7) state.history.pop();
      renderLog();
    }

    function renderLog() {
      logList.innerHTML = '';
      for (const item of state.history) {
        const li = document.createElement('li');
        li.classList.add(item.tone);
        const title = document.createElement('strong');
        title.textContent = item.title;
        const detail = document.createElement('div');
        detail.textContent = item.detail || '';
        const meta = document.createElement('div');
        meta.className = 'mini-sugoroku-resume';
        const moneyText = item.moneyDelta ? formatMoney(item.moneyDelta) : translate('ui.log.noMoneyDelta', '±0G');
        const expAmount = Math.round(item.xp);
        const expFormatted = formatNumber(expAmount, { maximumFractionDigits: 0 });
        const expText = translate('ui.log.expText', () => `EXP ${expFormatted}`, { value: expAmount, formatted: expFormatted });
        meta.textContent = translate('ui.log.meta', () => `${moneyText} / ${expText}`, { money: moneyText, exp: expText, expValue: expAmount, expFormatted });
        li.appendChild(title);
        if (item.detail) li.appendChild(detail);
        li.appendChild(meta);
        logList.appendChild(li);
      }
    }

    function showEventResult(result) {
      eventPanel.innerHTML = '';
      const h3 = document.createElement('h3');
      h3.textContent = result.title;
      const message = document.createElement('p');
      message.textContent = result.message;
      const delta = document.createElement('div');
      delta.className = 'delta';
      if (result.moneyDelta > 0) delta.classList.add('positive');
      else if (result.moneyDelta < 0) delta.classList.add('negative');
      else delta.classList.add('neutral');
      const deltaExpAmount = Math.round(result.xpEarned || 0);
      const deltaExpFormatted = formatNumber(deltaExpAmount, { maximumFractionDigits: 0 });
      const deltaExpText = translate('ui.event.expText', () => `EXP ${deltaExpFormatted}`, { value: deltaExpAmount, formatted: deltaExpFormatted });
      const moneyDeltaText = formatMoney(result.moneyDelta);
      delta.textContent = translate('ui.event.delta', () => `${moneyDeltaText} / ${deltaExpText}`, { money: moneyDeltaText, exp: deltaExpText, expValue: deltaExpAmount, expFormatted: deltaExpFormatted });
      eventPanel.appendChild(h3);
      eventPanel.appendChild(message);
      eventPanel.appendChild(delta);
    }

    function showSummary({ grade, finalXp, money }) {
      summaryPanel.style.display = 'flex';
      summaryPanel.innerHTML = '';
      const title = document.createElement('strong');
      title.textContent = translate('ui.summary.rank', () => `最終ランク ${grade}`, { grade });
      const moneyLine = document.createElement('div');
      const finalMoneyText = formatMoney(money);
      moneyLine.textContent = translate('ui.summary.money', () => `最終所持金: ${finalMoneyText}`, { money: finalMoneyText });
      const bonusLine = document.createElement('div');
      const bonusAmount = Math.round(finalXp);
      const bonusFormatted = formatNumber(bonusAmount, { maximumFractionDigits: 0 });
      bonusLine.textContent = translate('ui.summary.bonus', () => `ボーナスEXP: ${bonusFormatted}`, { value: bonusAmount, formatted: bonusFormatted });
      const totalLine = document.createElement('div');
      const totalAmount = Math.round(state.totalXp);
      const totalFormatted = formatNumber(totalAmount, { maximumFractionDigits: 0 });
      totalLine.textContent = translate('ui.summary.total', () => `累計獲得EXP: ${totalFormatted}`, { value: totalAmount, formatted: totalFormatted });
      summaryPanel.appendChild(title);
      summaryPanel.appendChild(moneyLine);
      summaryPanel.appendChild(bonusLine);
      summaryPanel.appendChild(totalLine);
      restartButton.style.display = 'block';
    }

    function schedule(fn, delay) {
      const timer = setTimeout(() => {
        timers.delete(timer);
        if (state.paused) {
          resumeQueue.push(fn);
        } else {
          fn();
        }
      }, delay);
      timers.add(timer);
    }

    function movePieceTo(position) {
      pathCells.forEach((cell, index) => {
        cell.classList.toggle('active', index === position);
        if (index < position) {
          cell.classList.add('visited');
        }
      });
      const target = pathCells[position];
      if (target && piece.parentNode !== target) {
        target.appendChild(piece);
      }
    }

    function applySquare(index) {
      const def = boardDefs[index];
      const result = def.onLand(ctx);
      if (result) {
        showEventResult(result);
        logEvent({
          title: result.title,
          detail: result.message,
          moneyDelta: result.moneyDelta || 0,
          xp: result.xpEarned || 0
        });
      }
    }

    function advance(steps) {
      if (!steps.length) {
        applySquare(state.position);
        return;
      }
      const next = steps.shift();
      state.position = next;
      movePieceTo(next);
      schedule(() => advance(steps), 380);
    }

    function rollDice() {
      if (state.finished || state.paused) return;
      rollButton.disabled = true;
      const roll = Math.floor(Math.random() * 6) + 1;
      state.turn += 1;
      updateHud();
      const startPos = state.position;
      const dest = Math.min(startPos + roll, boardDefs.length - 1);
      const steps = [];
      for (let i = startPos + 1; i <= dest; i++) steps.push(i);
      const stepCount = steps.length;
      advance(steps);
      schedule(() => {
        rollButton.disabled = state.finished;
      }, 420 * (stepCount + 1));
    }

    rollButton.addEventListener('click', rollDice);
    restartButton.addEventListener('click', resetGame);

    function resetGame() {
      stopAllTimers();
      resumeQueue.length = 0;
      state.paused = false;
      state.position = 0;
      state.money = config.startMoney;
      state.salary = config.salary;
      state.salaryBonus = 0;
      state.turn = 0;
      state.finished = false;
      state.totalXp = 0;
      state.history = [];
      summaryPanel.style.display = 'none';
      restartButton.style.display = 'none';
      pathCells.forEach((cell) => cell.classList.remove('visited', 'active'));
      movePieceTo(0);
      eventPanel.innerHTML = '';
      const restartTitle = document.createElement('h3');
      restartTitle.textContent = translate('ui.restart.title', '再スタート！');
      const restartMessage = document.createElement('p');
      restartMessage.textContent = translate('ui.restart.message', 'もう一度人生を駆け抜けましょう。');
      eventPanel.appendChild(restartTitle);
      eventPanel.appendChild(restartMessage);
      rollButton.disabled = false;
      updateHud();
      applySquare(0);
      renderLog();
    }

    movePieceTo(0);
    updateHud();
    applySquare(0);

    function stopAllTimers() {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    }

    return {
      start() {
        if (!state.paused) return;
        state.paused = false;
        while (resumeQueue.length) {
          const fn = resumeQueue.shift();
          try {
            fn();
          } catch (err) {
            console.error(err);
          }
        }
      },
      stop() {
        state.paused = true;
      },
      destroy() {
        stopAllTimers();
        resumeQueue.length = 0;
        rollButton.removeEventListener('click', rollDice);
        restartButton.removeEventListener('click', resetGame);
        layout.remove();
      },
      getScore() {
        return state.money;
      }
    };
  }

  window.registerMiniGame({
    id: 'sugoroku_life',
    name: '人生すごろく', nameKey: 'selection.miniexp.games.sugoroku_life.name',
    description: '疑似人生ゲーム形式のすごろく。サイコロで進み、資産とEXPを伸ばそう。', descriptionKey: 'selection.miniexp.games.sugoroku_life.description', categoryIds: ['board'],
    create
  });
})();

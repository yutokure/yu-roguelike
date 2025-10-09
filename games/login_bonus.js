(function(){
  const STORAGE_KEY = 'mini_login_bonus_claims_v1';

  function makeReward(def = {}){
    const {
      id,
      label,
      labelKey = null,
      labelParams = null,
      description,
      descriptionKey = null,
      descriptionParams = null,
      payload,
      specialTag = null,
      specialTagKey = null,
      specialTagParams = null
    } = def;
    return {
      id,
      payload: Object.assign({}, payload || {}),
      labelFallback: label,
      labelKey,
      labelParams,
      descriptionFallback: description,
      descriptionKey,
      descriptionParams,
      specialTagFallback: specialTag,
      specialTagKey,
      specialTagParams
    };
  }

  const ITEM_DEFS = {
    potion30: { labelKey: '.items.potion30', labelFallback: '回復アイテム' },
    hpBoost: { labelKey: '.items.hpBoost', labelFallback: 'HPブースト' },
    atkBoost: { labelKey: '.items.atkBoost', labelFallback: '攻撃力ブースト' },
    defBoost: { labelKey: '.items.defBoost', labelFallback: '防御力ブースト' }
  };

  const BASE_REWARD_DEFS = [
    makeReward({
      id: 'exp333',
      label: 'EXP333',
      labelKey: '.rewards.exp333.label',
      labelParams: ({ formatNumber }) => ({ amount: formatNumber(333) }),
      description: 'ログインで経験値333を獲得できます。',
      descriptionKey: '.rewards.exp333.description',
      descriptionParams: ({ formatNumber }) => ({ amount: formatNumber(333) }),
      payload: { type: 'exp', amount: 333 }
    }),
    makeReward({
      id: 'exp777',
      label: 'EXP777',
      labelKey: '.rewards.exp777.label',
      labelParams: ({ formatNumber }) => ({ amount: formatNumber(777) }),
      description: 'ログインで経験値777を獲得できます。',
      descriptionKey: '.rewards.exp777.description',
      descriptionParams: ({ formatNumber }) => ({ amount: formatNumber(777) }),
      payload: { type: 'exp', amount: 777 }
    }),
    makeReward({
      id: 'exp2000',
      label: 'EXP2000（2レベルアップ）',
      labelKey: '.rewards.exp2000.label',
      labelParams: ({ formatNumber }) => ({ amount: formatNumber(2000), levels: formatNumber(2) }),
      description: '経験値2000で一気にレベルアップ！',
      descriptionKey: '.rewards.exp2000.description',
      descriptionParams: ({ formatNumber }) => ({ amount: formatNumber(2000) }),
      payload: { type: 'exp', amount: 2000 }
    }),
    makeReward({
      id: 'heal10',
      label: '回復アイテムx10',
      labelKey: '.rewards.heal10.label',
      labelParams: ({ formatItemLabel, formatNumber }) => ({ item: formatItemLabel('potion30'), amount: formatNumber(10) }),
      description: 'ポーションをまとめて10個獲得。冒険前に備えましょう。',
      descriptionKey: '.rewards.heal10.description',
      descriptionParams: ({ formatItemLabel, formatNumber }) => ({ item: formatItemLabel('potion30'), amount: formatNumber(10) }),
      payload: { type: 'item', item: 'potion30', amount: 10 }
    }),
    makeReward({
      id: 'item_set',
      label: 'アイテムセット（全種類3つずつ）',
      labelKey: '.rewards.item_set.label',
      description: '主要アイテムを各3個ずつ受け取れます。',
      descriptionKey: '.rewards.item_set.description',
      descriptionParams: ({ formatNumber }) => ({ amount: formatNumber(3) }),
      payload: {
        type: 'items',
        items: { potion30: 3, hpBoost: 3, atkBoost: 3, defBoost: 3 }
      }
    }),
    makeReward({
      id: 'sp_full',
      label: 'SP満タン',
      labelKey: '.rewards.sp_full.label',
      description: 'SPが最大まで回復します。スキル連発のチャンス！',
      descriptionKey: '.rewards.sp_full.description',
      payload: { type: 'sp', mode: 'fill' }
    }),
    makeReward({
      id: 'exp1300',
      label: 'EXP1300',
      labelKey: '.rewards.exp1300.label',
      labelParams: ({ formatNumber }) => ({ amount: formatNumber(1300) }),
      description: '経験値1300でさらなる成長。',
      descriptionKey: '.rewards.exp1300.description',
      descriptionParams: ({ formatNumber }) => ({ amount: formatNumber(1300) }),
      payload: { type: 'exp', amount: 1300 }
    })
  ];

  const SPECIAL_REWARD_DEFS = {
    monthEnd: makeReward({
      id: 'month_end_exp',
      label: '月末ボーナス EXP2500',
      labelKey: '.specialRewards.monthEnd.label',
      description: '月末ログインで経験値2500！来月への準備も万端です。',
      descriptionKey: '.specialRewards.monthEnd.description',
      descriptionParams: ({ formatNumber }) => ({ amount: formatNumber(2500) }),
      payload: { type: 'exp', amount: 2500 },
      specialTag: '月末スペシャル',
      specialTagKey: '.specialTags.monthEnd'
    }),
    newYear: makeReward({
      id: 'new_year',
      label: '新年スペシャル EXP10000',
      labelKey: '.specialRewards.newYear.label',
      description: '1月1日は大盤振る舞い！経験値10000を獲得できます。',
      descriptionKey: '.specialRewards.newYear.description',
      descriptionParams: ({ formatNumber }) => ({ amount: formatNumber(10000) }),
      payload: { type: 'exp', amount: 10000 },
      specialTag: '新年限定',
      specialTagKey: '.specialTags.newYear'
    }),
    sunday: makeReward({
      id: 'sunday_heal',
      label: '回復アイテムx10',
      labelKey: '.specialRewards.sunday.label',
      labelParams: ({ formatItemLabel, formatNumber }) => ({ item: formatItemLabel('potion30'), amount: formatNumber(10) }),
      description: '毎週日曜日は回復アイテムを10個プレゼント！',
      descriptionKey: '.specialRewards.sunday.description',
      descriptionParams: ({ formatItemLabel, formatNumber }) => ({ item: formatItemLabel('potion30'), amount: formatNumber(10) }),
      payload: { type: 'item', item: 'potion30', amount: 10 },
      specialTag: 'サンデーボーナス',
      specialTagKey: '.specialTags.sunday'
    })
  };

  function formatIsoDate(date){
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function loadClaims(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return {};
      return Object.keys(parsed).reduce((acc, key) => {
        const value = parsed[key];
        if (!value || typeof value !== 'object') return acc;
        const date = typeof value.date === 'string' ? value.date : key;
        if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date)) return acc;
        const rewardId = typeof value.rewardId === 'string' ? value.rewardId : null;
        const claimedAt = Number.isFinite(value.claimedAt) ? value.claimedAt : Date.now();
        acc[date] = { rewardId, claimedAt };
        return acc;
      }, {});
    } catch {
      return {};
    }
  }

  function writeClaims(claims){
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(claims));
    } catch {}
  }

  function getMonthLastDate(year, month){
    return new Date(year, month + 1, 0).getDate();
  }

  function canClaim(date, today){
    return formatIsoDate(date) === formatIsoDate(today);
  }

  function create(root, awardXp, opts = {}){
    if (!root) throw new Error('MiniExp Login Bonus requires a container');

    const today = new Date();
    const state = {
      claims: loadClaims(),
      viewYear: today.getFullYear(),
      viewMonth: today.getMonth(),
      selectedDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      sessionXp: 0
    };

    const playerApi = opts?.player || {};
    const localization = opts?.localization || (typeof window !== 'undefined' && typeof window.createMiniGameLocalization === 'function'
      ? window.createMiniGameLocalization({ id: 'login_bonus' })
      : null);

    const text = (key, fallback, params) => {
      if (localization && typeof localization.t === 'function'){
        return localization.t(key, fallback, params);
      }
      if (typeof fallback === 'function') return fallback();
      return fallback ?? '';
    };

    const getLocale = () => (localization && typeof localization.getLocale === 'function'
      ? localization.getLocale()
      : undefined);

    const formatNumber = (value, options) => {
      let numeric = Number(value);
      if (!Number.isFinite(numeric)){
        numeric = Number.isFinite(Number(value)) ? Number(value) : Number.NaN;
      }
      if (localization && typeof localization.formatNumber === 'function'){
        try {
          if (Number.isFinite(numeric)){
            return localization.formatNumber(numeric, options);
          }
          return localization.formatNumber(value, options);
        } catch {}
      }
      try {
        const locale = getLocale();
        if (Number.isFinite(numeric)){
          return new Intl.NumberFormat(locale, options).format(numeric);
        }
        return new Intl.NumberFormat(locale, options).format(value);
      } catch {
        if (value == null) return '0';
        if (typeof value === 'number' && Number.isFinite(value)) return String(value);
        return String(value);
      }
    };

    const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const WEEKDAY_FALLBACK = ['日', '月', '火', '水', '木', '金', '土'];

    const formatItemLabel = (id) => {
      const meta = ITEM_DEFS[id];
      if (!meta) return id;
      if (meta.labelKey){
        return text(meta.labelKey, () => meta.labelFallback ?? id);
      }
      return meta.labelFallback ?? id;
    };

    const formatItemSummary = (map) => {
      const entries = Object.entries(map || {}).filter(([, amt]) => Number(amt));
      if (!entries.length) return '';
      const separator = text('.format.itemSummarySeparator', ' / ');
      return entries.map(([id, amt]) => {
        const amountValue = Number(amt);
        const formattedAmount = formatNumber(Number.isFinite(amountValue) ? amountValue : amt);
        const itemLabel = formatItemLabel(id);
        return text('.format.itemSummary', () => `${itemLabel} x${formattedAmount}`, {
          item: itemLabel,
          amount: formattedAmount
        });
      }).join(separator);
    };

    const formatSpAmount = (value) => {
      if (!Number.isFinite(value)) return '∞';
      const rounded = Math.round(value * 100) / 100;
      return formatNumber(rounded);
    };

    const formatTime = (ts) => {
      if (!Number.isFinite(ts)) return '-';
      const date = new Date(ts);
      try {
        return date.toLocaleString(getLocale());
      } catch {
        return date.toISOString();
      }
    };

    const getWeekdayNames = () => WEEKDAY_KEYS.map((key, index) => text(`.calendar.weekdayShort.${key}`,
      () => WEEKDAY_FALLBACK[index]));

    const getMonthName = (year, monthIndex) => {
      try {
        return new Intl.DateTimeFormat(getLocale(), { month: 'long' }).format(new Date(year, monthIndex, 1));
      } catch {
        return '';
      }
    };

    const formatLongDate = (date) => {
      if (!(date instanceof Date)) return '';
      let formatted = null;
      try {
        formatted = date.toLocaleDateString(getLocale(), { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
      } catch {}
      const fallback = () => {
        const weekdays = getWeekdayNames();
        const wd = weekdays[date.getDay()] || '';
        return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日(${wd})`;
      };
      const fallbackValue = fallback();
      return text('.format.longDate', () => formatted || fallbackValue, {
        year: formatNumber(date.getFullYear()),
        month: formatNumber(date.getMonth() + 1),
        day: formatNumber(date.getDate()),
        weekday: getWeekdayNames()[date.getDay()],
        formatted: formatted || fallbackValue
      });
    };

    const formatMonthLabel = (year, monthIndex) => {
      const monthName = getMonthName(year, monthIndex);
      return text('.calendar.monthLabel', () => `${year}年${monthIndex + 1}月`, {
        year: formatNumber(year),
        month: formatNumber(monthIndex + 1),
        monthName: monthName || ''
      });
    };

    const paramHelpers = {
      formatNumber,
      formatItemLabel,
      formatItemSummary,
      formatSpAmount
    };

    const resolveParams = (params, meta) => {
      if (!params) return undefined;
      if (typeof params === 'function'){
        try {
          return params(paramHelpers, meta);
        } catch (error) {
          console.warn('[login_bonus] Failed to resolve params for reward', meta && meta.id, error);
          return undefined;
        }
      }
      if (typeof params === 'object') return params;
      return undefined;
    };

    const resolveRewardMeta = (meta) => {
      if (!meta){
        return {
          id: 'unknown',
          label: text('.rewards.unknown.label', '不明な報酬'),
          description: text('.rewards.unknown.description', '報酬内容を取得できませんでした。'),
          payload: {}
        };
      }
      const labelParams = resolveParams(meta.labelParams, meta);
      const descriptionParams = resolveParams(meta.descriptionParams, meta);
      const specialTagParams = resolveParams(meta.specialTagParams, meta);
      const labelFallback = meta.labelFallback ?? meta.id ?? '';
      const descriptionFallback = meta.descriptionFallback ?? labelFallback;
      let label = labelFallback;
      if (meta.labelKey){
        label = text(meta.labelKey, () => labelFallback, labelParams);
      }
      let description = descriptionFallback;
      if (meta.descriptionKey){
        description = text(meta.descriptionKey, () => descriptionFallback, descriptionParams);
      }
      let specialTag = null;
      if (meta.specialTagKey){
        specialTag = text(meta.specialTagKey, () => meta.specialTagFallback ?? '', specialTagParams) || null;
      } else if (meta.specialTagFallback){
        specialTag = meta.specialTagFallback;
      }
      return {
        id: meta.id,
        label,
        description,
        payload: Object.assign({}, meta.payload || {}),
        specialTag: specialTag || null
      };
    };

    const getRewardForDate = (date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();
      const weekday = date.getDay();
      const iso = formatIsoDate(date);

      if (month === 0 && day === 1){
        return Object.assign({ iso }, resolveRewardMeta(SPECIAL_REWARD_DEFS.newYear));
      }

      const lastDay = getMonthLastDate(year, month);
      if (day === lastDay){
        return Object.assign({ iso }, resolveRewardMeta(SPECIAL_REWARD_DEFS.monthEnd));
      }

      if (weekday === 0){
        return Object.assign({ iso }, resolveRewardMeta(SPECIAL_REWARD_DEFS.sunday));
      }

      const rewardMeta = BASE_REWARD_DEFS[(day - 1) % BASE_REWARD_DEFS.length];
      return Object.assign({ iso }, resolveRewardMeta(rewardMeta));
    };

    const describeReward = (reward) => {
      if (!reward) return '';
      const payload = reward.payload || {};
      switch (payload.type){
        case 'exp': {
          const amountText = formatNumber(Number(payload.amount) || 0);
          return text('.describe.exp', () => `経験値 +${amountText}`, { amount: amountText });
        }
        case 'item': {
          if (payload.item){
            const label = formatItemLabel(payload.item);
            if (Number.isFinite(payload.amount) && payload.amount > 0){
              const amountText = formatNumber(payload.amount);
              return text('.describe.itemQuantity', () => `${label}を${amountText}個受け取れます。`, { item: label, amount: amountText });
            }
            return text('.describe.itemSingle', () => `${label}を受け取れます。`, { item: label });
          }
          return text('.describe.itemGeneric', 'アイテム報酬を受け取れます。');
        }
        case 'items': {
          const entries = Object.entries(payload.items || {}).filter(([, amt]) => Number(amt) > 0);
          if (!entries.length){
            return text('.describe.itemGeneric', 'アイテム報酬を受け取れます。');
          }
          const summary = formatItemSummary(Object.fromEntries(entries));
          return text('.describe.itemsList', () => `以下のアイテムを受け取れます: ${summary}`, { summary });
        }
        case 'sp': {
          if (payload.mode === 'fill'){
            return text('.describe.spFill', 'SPが最大まで回復します。');
          }
          if (Number(payload.amount) > 0){
            const amountText = formatSpAmount(payload.amount);
            return text('.describe.spRecover', () => `SPが${amountText}回復します。`, { amount: amountText });
          }
          if (Number(payload.amount) < 0){
            const amountText = formatSpAmount(Math.abs(payload.amount));
            return text('.describe.spReduce', () => `SPが${amountText}減少します。`, { amount: amountText });
          }
          return text('.describe.spChange', 'SPが変化します。');
        }
        default:
          return reward.description || reward.label;
      }
    };

    let isRunning = false;

    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.justifyContent = 'center';
    wrapper.style.background = 'linear-gradient(135deg, rgba(14,116,144,0.1), rgba(15,23,42,0.78))';
    wrapper.style.fontFamily = '"Noto Sans JP", "Hiragino Sans", sans-serif';
    wrapper.style.color = '#111827';

    const panel = document.createElement('div');
    panel.style.width = 'min(1080px, 94%)';
    panel.style.maxHeight = '96%';
    panel.style.background = 'rgba(255,255,255,0.94)';
    panel.style.borderRadius = '18px';
    panel.style.boxShadow = '0 28px 64px rgba(15,23,42,0.25)';
    panel.style.display = 'flex';
    panel.style.flexDirection = 'column';
    panel.style.padding = '28px clamp(16px, 4vw, 36px)';
    panel.style.boxSizing = 'border-box';
    panel.style.gap = '24px';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.flexWrap = 'wrap';
    header.style.alignItems = 'center';
    header.style.justifyContent = 'space-between';
    header.style.gap = '16px';

    const titleWrap = document.createElement('div');
    titleWrap.style.display = 'flex';
    titleWrap.style.flexDirection = 'column';
    titleWrap.style.gap = '6px';

    const title = document.createElement('h2');
    title.textContent = text('.title', 'ログインボーナスカレンダー');
    title.style.margin = '0';
    title.style.fontSize = '26px';
    title.style.color = '#0f172a';

    const subtitle = document.createElement('div');
    subtitle.textContent = text('.subtitle', '毎日ログインして特典を獲得しましょう。獲得情報は自動保存されます。');
    subtitle.style.fontSize = '14px';
    subtitle.style.color = '#475569';

    titleWrap.appendChild(title);
    titleWrap.appendChild(subtitle);

    const summary = document.createElement('div');
    summary.style.display = 'flex';
    summary.style.flexDirection = 'column';
    summary.style.gap = '6px';
    summary.style.fontSize = '14px';
    summary.style.color = '#1f2937';

    header.appendChild(titleWrap);
    header.appendChild(summary);

    const body = document.createElement('div');
    body.style.display = 'grid';
    body.style.gridTemplateColumns = '1.7fr 1fr';
    body.style.gap = '24px';
    body.style.alignItems = 'stretch';
    body.style.minHeight = '420px';

    const calendarCard = document.createElement('div');
    calendarCard.style.background = '#f8fafc';
    calendarCard.style.border = '1px solid #e2e8f0';
    calendarCard.style.borderRadius = '16px';
    calendarCard.style.display = 'flex';
    calendarCard.style.flexDirection = 'column';
    calendarCard.style.padding = '20px';
    calendarCard.style.gap = '16px';

    const calendarHeader = document.createElement('div');
    calendarHeader.style.display = 'flex';
    calendarHeader.style.alignItems = 'center';
    calendarHeader.style.justifyContent = 'space-between';

    const monthLabel = document.createElement('div');
    monthLabel.style.fontSize = '20px';
    monthLabel.style.fontWeight = '600';
    monthLabel.style.color = '#0f172a';

    const navWrap = document.createElement('div');
    navWrap.style.display = 'flex';
    navWrap.style.gap = '8px';

    function createNavButton(textContent){
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = textContent;
      btn.style.padding = '6px 10px';
      btn.style.borderRadius = '8px';
      btn.style.border = '1px solid rgba(15,23,42,0.15)';
      btn.style.background = '#fff';
      btn.style.cursor = 'pointer';
      btn.style.fontSize = '13px';
      btn.style.color = '#0f172a';
      btn.addEventListener('mouseenter', () => { btn.style.background = '#e2e8f0'; });
      btn.addEventListener('mouseleave', () => { btn.style.background = '#fff'; });
      return btn;
    }

    const prevBtn = createNavButton('◀');
    const nextBtn = createNavButton('▶');

    prevBtn.addEventListener('click', () => {
      state.viewMonth -= 1;
      if (state.viewMonth < 0){
        state.viewMonth = 11;
        state.viewYear -= 1;
      }
      renderCalendar();
    });

    nextBtn.addEventListener('click', () => {
      state.viewMonth += 1;
      if (state.viewMonth > 11){
        state.viewMonth = 0;
        state.viewYear += 1;
      }
      renderCalendar();
    });

    navWrap.appendChild(prevBtn);
    navWrap.appendChild(nextBtn);

    calendarHeader.appendChild(monthLabel);
    calendarHeader.appendChild(navWrap);

    const weekdayRow = document.createElement('div');
    weekdayRow.style.display = 'grid';
    weekdayRow.style.gridTemplateColumns = 'repeat(7, 1fr)';
    weekdayRow.style.gap = '6px';

    const weekdayNodes = [];
    WEEKDAY_FALLBACK.forEach((_, index) => {
      const wd = document.createElement('div');
      wd.style.textAlign = 'center';
      wd.style.fontSize = '12px';
      wd.style.fontWeight = '600';
      wd.style.color = index === 0 ? '#dc2626' : (index === 6 ? '#2563eb' : '#475569');
      weekdayRow.appendChild(wd);
      weekdayNodes.push(wd);
    });

    const refreshWeekdayRow = () => {
      const labels = getWeekdayNames();
      weekdayNodes.forEach((node, index) => {
        node.textContent = labels[index] || '';
      });
    };

    const calendarGrid = document.createElement('div');
    calendarGrid.style.display = 'grid';
    calendarGrid.style.gridTemplateColumns = 'repeat(7, 1fr)';
    calendarGrid.style.gap = '6px';
    calendarGrid.style.flex = '1';

    calendarCard.appendChild(calendarHeader);
    calendarCard.appendChild(weekdayRow);
    calendarCard.appendChild(calendarGrid);

    const detailCard = document.createElement('div');
    detailCard.style.background = '#0f172a';
    detailCard.style.color = '#f8fafc';
    detailCard.style.borderRadius = '16px';
    detailCard.style.padding = '24px';
    detailCard.style.display = 'flex';
    detailCard.style.flexDirection = 'column';
    detailCard.style.gap = '16px';

    const detailDate = document.createElement('div');
    detailDate.style.fontSize = '18px';
    detailDate.style.fontWeight = '600';

    const detailLabel = document.createElement('div');
    detailLabel.style.fontSize = '22px';
    detailLabel.style.fontWeight = '700';

    const detailDescription = document.createElement('div');
    detailDescription.style.fontSize = '14px';
    detailDescription.style.lineHeight = '1.6';
    detailDescription.style.color = 'rgba(248,250,252,0.85)';

    const detailStatus = document.createElement('div');
    detailStatus.style.fontSize = '13px';
    detailStatus.style.color = '#bae6fd';

    const specialTagEl = document.createElement('span');
    specialTagEl.style.display = 'inline-flex';
    specialTagEl.style.alignItems = 'center';
    specialTagEl.style.gap = '6px';
    specialTagEl.style.padding = '4px 10px';
    specialTagEl.style.borderRadius = '999px';
    specialTagEl.style.background = 'rgba(56,189,248,0.2)';
    specialTagEl.style.color = '#bae6fd';
    specialTagEl.style.fontSize = '12px';
    specialTagEl.style.fontWeight = '600';
    specialTagEl.style.alignSelf = 'flex-start';

    const claimButton = document.createElement('button');
    claimButton.type = 'button';
    claimButton.textContent = text('.buttons.claimToday', '今日のボーナスを受け取る');
    claimButton.style.padding = '12px 16px';
    claimButton.style.fontSize = '16px';
    claimButton.style.fontWeight = '600';
    claimButton.style.border = 'none';
    claimButton.style.borderRadius = '12px';
    claimButton.style.background = 'linear-gradient(135deg, #38bdf8, #0ea5e9)';
    claimButton.style.color = '#0f172a';
    claimButton.style.cursor = 'pointer';
    claimButton.style.marginTop = '8px';
    claimButton.style.transition = 'transform 0.15s ease, filter 0.15s ease';
    claimButton.addEventListener('mouseenter', () => { claimButton.style.transform = 'translateY(-1px)'; claimButton.style.filter = 'brightness(1.05)'; });
    claimButton.addEventListener('mouseleave', () => { claimButton.style.transform = 'translateY(0)'; claimButton.style.filter = 'none'; });

    const messageLog = document.createElement('div');
    messageLog.style.fontSize = '13px';
    messageLog.style.color = '#e0f2fe';
    messageLog.style.lineHeight = '1.5';
    messageLog.style.minHeight = '38px';

    detailCard.appendChild(detailDate);
    detailCard.appendChild(detailLabel);
    detailCard.appendChild(detailDescription);
    detailCard.appendChild(specialTagEl);
    detailCard.appendChild(detailStatus);
    detailCard.appendChild(claimButton);
    detailCard.appendChild(messageLog);

    body.appendChild(calendarCard);
    body.appendChild(detailCard);

    panel.appendChild(header);
    panel.appendChild(body);
    wrapper.appendChild(panel);
    root.appendChild(wrapper);

    function updateSummary(){
      const claimDates = Object.keys(state.claims);
      const totalClaims = claimDates.length;
      const thisMonthKey = `${state.viewYear}-${String(state.viewMonth + 1).padStart(2, '0')}`;
      const monthClaims = claimDates.filter(d => d.startsWith(thisMonthKey)).length;
      const monthName = getMonthName(state.viewYear, state.viewMonth);
      summary.innerHTML = '';
      const total = document.createElement('div');
      const totalCount = formatNumber(totalClaims);
      total.textContent = text('.summary.total', () => `累計受け取り: ${totalCount}回`, {
        count: totalClaims,
        countFormatted: totalCount
      });
      const month = document.createElement('div');
      const monthCount = formatNumber(monthClaims);
      month.textContent = text('.summary.month', () => `${state.viewYear}年${state.viewMonth + 1}月の受け取り: ${monthCount}回`, {
        year: state.viewYear,
        month: state.viewMonth + 1,
        monthName: monthName || '',
        count: monthClaims,
        countFormatted: monthCount
      });
      summary.appendChild(total);
      summary.appendChild(month);
    }

    function renderCalendar(){
      refreshWeekdayRow();
      monthLabel.textContent = formatMonthLabel(state.viewYear, state.viewMonth);
      calendarGrid.innerHTML = '';
      const firstDate = new Date(state.viewYear, state.viewMonth, 1);
      const startWeekday = firstDate.getDay();
      const lastDate = getMonthLastDate(state.viewYear, state.viewMonth);

      if (state.selectedDate.getFullYear() !== state.viewYear || state.selectedDate.getMonth() !== state.viewMonth){
        const targetDay = Math.min(state.selectedDate.getDate(), lastDate);
        state.selectedDate = new Date(state.viewYear, state.viewMonth, targetDay);
      }

      for (let i = 0; i < startWeekday; i += 1){
        const placeholder = document.createElement('div');
        placeholder.style.minHeight = '84px';
        calendarGrid.appendChild(placeholder);
      }

      for (let day = 1; day <= lastDate; day += 1){
        const cellDate = new Date(state.viewYear, state.viewMonth, day);
        const reward = getRewardForDate(cellDate);
        const iso = reward.iso;
        const claimed = state.claims[iso];
        const isSelected = formatIsoDate(cellDate) === formatIsoDate(state.selectedDate);
        const isToday = canClaim(cellDate, today);

        const cell = document.createElement('div');
        cell.style.display = 'flex';
        cell.style.flexDirection = 'column';
        cell.style.gap = '6px';
        cell.style.padding = '10px';
        cell.style.borderRadius = '12px';
        cell.style.border = isSelected ? '2px solid rgba(14,165,233,0.6)' : '1px solid rgba(148,163,184,0.4)';
        cell.style.background = isSelected ? 'rgba(224,242,254,0.8)' : '#fff';
        cell.style.cursor = 'pointer';
        cell.style.minHeight = '84px';
        cell.style.boxShadow = isSelected ? '0 0 0 2px rgba(14,165,233,0.15)' : 'none';

        const dayEl = document.createElement('div');
        dayEl.textContent = formatNumber(day);
        dayEl.style.fontSize = '16px';
        dayEl.style.fontWeight = '600';
        dayEl.style.color = isToday ? '#0284c7' : '#0f172a';

        const rewardEl = document.createElement('div');
        rewardEl.textContent = reward.label;
        rewardEl.style.fontSize = '12px';
        rewardEl.style.color = '#475569';

        if (claimed){
          const badge = document.createElement('span');
          badge.textContent = text('.calendar.badge.claimed', '受取済み');
          badge.style.alignSelf = 'flex-end';
          badge.style.fontSize = '11px';
          badge.style.padding = '2px 6px';
          badge.style.borderRadius = '999px';
          badge.style.background = 'rgba(14,165,233,0.25)';
          badge.style.color = '#0369a1';
          cell.appendChild(badge);
        }

        cell.appendChild(dayEl);
        cell.appendChild(rewardEl);

        cell.addEventListener('click', () => {
          state.selectedDate = cellDate;
          renderCalendar();
          updateDetail();
        });

        calendarGrid.appendChild(cell);
      }

      updateSummary();
    }

    function updateDetail(){
      const selected = state.selectedDate;
      const iso = formatIsoDate(selected);
      const reward = getRewardForDate(selected);
      const claimed = state.claims[iso];
      const isToday = canClaim(selected, today);

      detailDate.textContent = formatLongDate(selected);
      detailLabel.textContent = reward.label;
      const effect = describeReward(reward);
      const combinedDescription = text('.detail.descriptionTemplate', () => {
        return [reward.description, effect].filter(Boolean).join('\n');
      }, {
        description: reward.description,
        effect
      });
      detailDescription.textContent = combinedDescription;

      if (reward.specialTag){
        specialTagEl.style.display = 'inline-flex';
        specialTagEl.textContent = reward.specialTag;
      } else {
        specialTagEl.style.display = 'none';
      }

      if (claimed){
        const timeText = formatTime(claimed.claimedAt);
        detailStatus.textContent = text('.detail.status.claimed', () => `受取済み (${timeText})`, { time: timeText });
      } else if (isToday){
        detailStatus.textContent = text('.detail.status.today', '本日受け取れます。');
      } else if (selected < new Date(today.getFullYear(), today.getMonth(), today.getDate())){
        detailStatus.textContent = text('.detail.status.expired', '期間終了。受け取り済みの場合のみ記録が残ります。');
      } else {
        detailStatus.textContent = text('.detail.status.locked', 'まだ受け取れません。ログイン可能日までお待ちください。');
      }

      claimButton.disabled = !isToday || !!claimed;
      claimButton.style.opacity = claimButton.disabled ? '0.55' : '1';
      claimButton.style.cursor = claimButton.disabled ? 'not-allowed' : 'pointer';
      messageLog.textContent = '';
    }

    function applyInventoryChanges(map, meta){
      if (!map || typeof map !== 'object') return null;
      const normalized = {};
      for (const [key, amount] of Object.entries(map)){
        const numeric = Number(amount);
        if (!Number.isFinite(numeric) || Math.abs(numeric) < 1e-6) continue;
        const delta = numeric > 0 ? Math.floor(numeric) : Math.ceil(numeric);
        if (delta === 0) continue;
        normalized[key] = delta;
      }
      if (!Object.keys(normalized).length) return null;
      const payload = Object.assign({ silent: true }, meta || {});
      const tryCall = (name) => {
        if (!playerApi || typeof playerApi[name] !== 'function') return null;
        try {
          return playerApi[name](Object.assign({}, normalized), payload);
        } catch (err) {
          console.error(`[login_bonus] playerApi.${name} failed`, err);
          return null;
        }
      };
      return tryCall('awardItems') || tryCall('adjustItems');
    }

    function grantReward(date, reward){
      const iso = formatIsoDate(date);
      if (state.claims[iso]) return;
      const payload = reward.payload || {};
      const metaBase = { gameId: 'login_bonus', type: 'login_bonus', rewardId: reward.id, date: iso };
      let gainedXp = 0;
      if (payload.type === 'exp' && Number.isFinite(payload.amount) && payload.amount > 0 && typeof awardXp === 'function'){
        try {
          const res = awardXp(payload.amount, metaBase);
          if (Number.isFinite(res)) gainedXp = res;
          else gainedXp = Number(payload.amount) || 0;
        } catch {
          gainedXp = Number(payload.amount) || 0;
        }
      } else if (typeof awardXp === 'function'){
        try { awardXp(0, metaBase); } catch {}
      }
      state.claims[iso] = { rewardId: reward.id, claimedAt: Date.now() };
      if (gainedXp > 0){
        state.sessionXp += gainedXp;
      }
      writeClaims(state.claims);
      renderCalendar();
      updateDetail();
      const lines = [];
      const formattedDate = formatLongDate(date);
      lines.push(text('.messages.grant.header', () => `${formattedDate} のボーナスを受け取りました。`, { date: formattedDate }));
      switch (payload.type){
        case 'exp': {
          const amountText = formatNumber(Math.floor(gainedXp || payload.amount));
          lines.push(text('.messages.grant.exp', () => `経験値 +${amountText} を獲得。`, { amount: amountText }));
          break;
        }
        case 'item': {
          if (payload.item && Number.isFinite(payload.amount) && payload.amount > 0){
            const grants = { [payload.item]: payload.amount };
            const applied = applyInventoryChanges(grants, metaBase);
            if (applied && Number(applied[payload.item]) > 0){
              const amountText = formatNumber(applied[payload.item]);
              const label = formatItemLabel(payload.item);
              lines.push(text('.messages.grant.itemReceived', () => `${label} x${amountText} を獲得しました。`, { item: label, amount: amountText }));
            } else {
              const label = formatItemLabel(payload.item);
              lines.push(text('.messages.grant.itemFailed', () => `${label}を受け取れませんでした（API未対応の可能性があります）。`, { item: label }));
            }
          } else {
            lines.push(text('.messages.grant.itemGeneric', 'アイテム報酬を受け取りました。'));
          }
          break;
        }
        case 'items': {
          const grants = {};
          for (const [key, amount] of Object.entries(payload.items || {})){
            const numeric = Number(amount);
            if (!Number.isFinite(numeric) || numeric <= 0) continue;
            grants[key] = Math.floor(numeric);
          }
          if (Object.keys(grants).length){
            const applied = applyInventoryChanges(grants, metaBase);
            if (applied && Object.values(applied).some(v => Number(v) > 0)){
              const summaryText = formatItemSummary(applied);
              lines.push(text('.messages.grant.itemsReceived', () => `以下のアイテムを獲得しました: ${summaryText}`, { summary: summaryText }));
            } else {
              const summaryText = formatItemSummary(grants);
              lines.push(text('.messages.grant.itemsFailed', () => `以下のアイテム付与はホストAPI未対応のため反映されませんでした: ${summaryText}`, { summary: summaryText }));
            }
          } else {
            lines.push(text('.messages.grant.itemGeneric', 'アイテム報酬を受け取りました。'));
          }
          break;
        }
        case 'sp': {
          let applied = 0;
          if (payload.mode === 'fill'){
            if (playerApi && typeof playerApi.fillSp === 'function'){
              try {
                applied = playerApi.fillSp(Object.assign({ silent: true }, metaBase));
              } catch (err) {
                console.error('[login_bonus] playerApi.fillSp failed', err);
                applied = 0;
              }
            }
            if (!Number.isFinite(applied) || applied > 0){
              lines.push(text('.messages.grant.spFilled', 'SPが最大まで回復しました。'));
            } else {
              lines.push(text('.messages.grant.spFillFailed', 'SPは既に最大か、APIが未対応でした。'));
            }
          } else if (Number.isFinite(payload.amount) && payload.amount !== 0){
            if (playerApi && typeof playerApi.adjustSp === 'function'){
              try {
                applied = playerApi.adjustSp(payload.amount, Object.assign({ silent: true }, metaBase));
              } catch (err) {
                console.error('[login_bonus] playerApi.adjustSp failed', err);
                applied = 0;
              }
            }
            if (applied > 0){
              const amountText = formatSpAmount(applied);
              lines.push(text('.messages.grant.spRecovered', () => `SPが${amountText}回復しました。`, { amount: amountText }));
            } else if (applied < 0){
              const amountText = formatSpAmount(-applied);
              lines.push(text('.messages.grant.spReduced', () => `SPが${amountText}減少しました。`, { amount: amountText }));
            } else {
              lines.push(text('.messages.grant.spNoChange', 'SPに変化はありませんでした。'));
            }
          } else {
            lines.push(text('.messages.grant.spChanged', 'SPが変化します。'));
          }
          break;
        }
        default:
          lines.push(text('.messages.grant.default', '報酬を受け取りました。'));
      }
      if (reward.specialTag){
        lines.push(text('.messages.grant.specialTag', () => `特別イベント: ${reward.specialTag}`, { tag: reward.specialTag }));
      }
      messageLog.textContent = lines.join('\n');
    }

    claimButton.addEventListener('click', () => {
      const selected = state.selectedDate;
      const iso = formatIsoDate(selected);
      if (state.claims[iso]){
        messageLog.textContent = text('.messages.alreadyClaimed', '既に受け取り済みです。');
        return;
      }
      if (!canClaim(selected, today)){
        messageLog.textContent = text('.messages.onlyToday', '本日のボーナスのみ受け取れます。');
        return;
      }
      const reward = getRewardForDate(selected);
      grantReward(selected, reward);
    });

    function start(){
      if (isRunning) return;
      isRunning = true;
      refreshWeekdayRow();
      renderCalendar();
      updateDetail();
    }

    function stop(){
      if (!isRunning) return;
      isRunning = false;
      writeClaims(state.claims);
    }

    let detachLocale = null;

    function destroy(){
      stop();
      try {
        if (typeof detachLocale === 'function'){
          detachLocale();
        }
      } catch {}
      detachLocale = null;
      try {
        if (root.contains(wrapper)) root.removeChild(wrapper);
      } catch {}
    }

    start();

    if (localization && typeof localization.onChange === 'function'){
      detachLocale = localization.onChange(() => {
        title.textContent = text('.title', 'ログインボーナスカレンダー');
        subtitle.textContent = text('.subtitle', '毎日ログインして特典を獲得しましょう。獲得情報は自動保存されます。');
        claimButton.textContent = text('.buttons.claimToday', '今日のボーナスを受け取る');
        renderCalendar();
        updateDetail();
      });
    }

    return {
      start,
      stop,
      destroy,
      getScore(){
        return state.sessionXp;
      }
    };
  }

  window.registerMiniGame({
    id: 'login_bonus',
    name: 'ログインボーナス', nameKey: 'selection.miniexp.games.login_bonus.name',
    description: '日々のログインで経験値やアイテムを受け取れるユーティリティカレンダー', descriptionKey: 'selection.miniexp.games.login_bonus.description', categoryIds: ['utility'],
    category: 'ユーティリティ',
    version: '0.1.0',
    author: 'mod',
    create
  });
})();

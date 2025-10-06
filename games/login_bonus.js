(function(){
  const STORAGE_KEY = 'mini_login_bonus_claims_v1';
  const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];
  const ITEM_LABELS = {
    potion30: '回復アイテム',
    hpBoost: 'HPブースト',
    atkBoost: '攻撃力ブースト',
    defBoost: '防御力ブースト'
  };
  const BASE_REWARDS = [
    makeReward('exp333', 'EXP333', 'ログインで経験値333を獲得できます。', { type: 'exp', amount: 333 }),
    makeReward('exp777', 'EXP777', 'ログインで経験値777を獲得できます。', { type: 'exp', amount: 777 }),
    makeReward('exp2000', 'EXP2000（2レベルアップ）', '経験値2000で一気にレベルアップ！', { type: 'exp', amount: 2000 }),
    makeReward('heal10', '回復アイテムx10', 'ポーションをまとめて10個獲得。冒険前に備えましょう。', { type: 'item', item: 'potion30', amount: 10 }),
    makeReward('item_set', 'アイテムセット（全種類3つずつ）', '主要アイテムを各3個ずつ受け取れます。', {
      type: 'items',
      items: { potion30: 3, hpBoost: 3, atkBoost: 3, defBoost: 3 }
    }),
    makeReward('sp_full', 'SP満タン', 'SPが最大まで回復します。スキル連発のチャンス！', { type: 'sp', mode: 'fill' }),
    makeReward('exp1300', 'EXP1300', '経験値1300でさらなる成長。', { type: 'exp', amount: 1300 })
  ];

  const SPECIAL_REWARDS = {
    monthEnd: makeReward('month_end_exp', '月末ボーナス EXP2500', '月末ログインで経験値2500！来月への準備も万端です。', { type: 'exp', amount: 2500 }, '月末スペシャル'),
    newYear: makeReward('new_year', '新年スペシャル EXP10000', '1月1日は大盤振る舞い！経験値10000を獲得できます。', { type: 'exp', amount: 10000 }, '新年限定'),
    sunday: makeReward('sunday_heal', '回復アイテムx10', '毎週日曜日は回復アイテムを10個プレゼント！', { type: 'item', item: 'potion30', amount: 10 }, 'サンデーボーナス')
  };

  function makeReward(id, label, description, payload, specialTag = null){
    return {
      id,
      label,
      description,
      payload: Object.assign({}, payload || {}),
      specialTag
    };
  }

  function formatItemLabel(id){
    return ITEM_LABELS[id] || id;
  }

  function formatItemSummary(map){
    return Object.entries(map || {})
      .filter(([, amt]) => Number(amt))
      .map(([id, amt]) => `${formatItemLabel(id)} x${amt}`)
      .join(' / ');
  }

  function formatSpAmount(value){
    if (!Number.isFinite(value)) return '∞';
    const rounded = Math.round(value * 100) / 100;
    return `${rounded}`;
  }

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

  function getRewardForDate(date){
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const weekday = date.getDay();
    const iso = formatIsoDate(date);

    if (month === 0 && day === 1){
      return Object.assign({ iso }, SPECIAL_REWARDS.newYear);
    }

    const lastDay = getMonthLastDate(year, month);
    if (day === lastDay){
      return Object.assign({ iso }, SPECIAL_REWARDS.monthEnd);
    }

    if (weekday === 0){
      return Object.assign({ iso }, SPECIAL_REWARDS.sunday);
    }

    const reward = BASE_REWARDS[(day - 1) % BASE_REWARDS.length];
    return Object.assign({ iso }, reward);
  }

  function formatLongDate(date){
    try {
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
    } catch {
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日(${WEEKDAYS[date.getDay()]})`;
    }
  }

  function canClaim(date, today){
    const iso = formatIsoDate(date);
    return iso === formatIsoDate(today);
  }

  function describeReward(reward){
    if (!reward) return '';
    const payload = reward.payload || {};
    switch (payload.type){
      case 'exp':
        return `経験値 +${payload.amount}`;
      case 'item':
        if (payload.item){
          const label = formatItemLabel(payload.item);
          if (payload.amount){
            return `${label}を${payload.amount}個受け取れます。`;
          }
          return `${label}を受け取れます。`;
        }
        return 'アイテム報酬を受け取れます。';
      case 'items': {
        const entries = Object.entries(payload.items || {}).filter(([, amt]) => Number(amt) > 0);
        if (!entries.length) return 'アイテム報酬を受け取れます。';
        const summary = entries.map(([id, amt]) => `${formatItemLabel(id)} x${amt}`).join(' / ');
        return `以下のアイテムを受け取れます: ${summary}`;
      }
      case 'sp':
        if (payload.mode === 'fill') return 'SPが最大まで回復します。';
        if (Number(payload.amount) > 0) return `SPが${payload.amount}回復します。`;
        if (Number(payload.amount) < 0) return `SPが${Math.abs(payload.amount)}減少します。`;
        return 'SPが変化します。';
      default:
        return reward.description || reward.label;
    }
  }

  function formatTime(ts){
    if (!Number.isFinite(ts)) return '-';
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return new Date(ts).toISOString();
    }
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
    title.textContent = 'ログインボーナスカレンダー';
    title.style.margin = '0';
    title.style.fontSize = '26px';
    title.style.color = '#0f172a';

    const subtitle = document.createElement('div');
    subtitle.textContent = '毎日ログインして特典を獲得しましょう。獲得情報は自動保存されます。';
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

    function createNavButton(text){
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = text;
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
    WEEKDAYS.forEach((day, index) => {
      const wd = document.createElement('div');
      wd.textContent = day;
      wd.style.textAlign = 'center';
      wd.style.fontSize = '12px';
      wd.style.fontWeight = '600';
      wd.style.color = index === 0 ? '#dc2626' : (index === 6 ? '#2563eb' : '#475569');
      weekdayRow.appendChild(wd);
    });

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
    claimButton.textContent = '今日のボーナスを受け取る';
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
      summary.innerHTML = '';
      const total = document.createElement('div');
      total.textContent = `累計受け取り: ${totalClaims}回`;
      const month = document.createElement('div');
      month.textContent = `${state.viewYear}年${state.viewMonth + 1}月の受け取り: ${monthClaims}回`;
      summary.appendChild(total);
      summary.appendChild(month);
    }

    function renderCalendar(){
      monthLabel.textContent = `${state.viewYear}年${state.viewMonth + 1}月`;
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
        placeholder.style.minHeight = '86px';
        calendarGrid.appendChild(placeholder);
      }

      for (let day = 1; day <= lastDate; day += 1){
        const cellDate = new Date(state.viewYear, state.viewMonth, day);
        const iso = formatIsoDate(cellDate);
        const reward = getRewardForDate(cellDate);
        const claimed = state.claims[iso];
        const isToday = iso === formatIsoDate(today);
        const isSelected = iso === formatIsoDate(state.selectedDate);

        const cell = document.createElement('button');
        cell.type = 'button';
        cell.style.display = 'flex';
        cell.style.flexDirection = 'column';
        cell.style.alignItems = 'flex-start';
        cell.style.justifyContent = 'space-between';
        cell.style.padding = '12px';
        cell.style.minHeight = '86px';
        cell.style.borderRadius = '12px';
        cell.style.border = isSelected ? '2px solid #0ea5e9' : '1px solid rgba(148,163,184,0.4)';
        cell.style.background = claimed ? 'rgba(14,165,233,0.12)' : '#fff';
        cell.style.cursor = 'pointer';
        cell.style.transition = 'transform 0.15s ease, box-shadow 0.15s ease';
        cell.addEventListener('mouseenter', () => { cell.style.transform = 'translateY(-1px)'; cell.style.boxShadow = '0 8px 20px rgba(15,23,42,0.12)'; });
        cell.addEventListener('mouseleave', () => { cell.style.transform = 'translateY(0)'; cell.style.boxShadow = 'none'; });

        const dayEl = document.createElement('div');
        dayEl.textContent = String(day);
        dayEl.style.fontSize = '18px';
        dayEl.style.fontWeight = '600';
        dayEl.style.color = isToday ? '#0ea5e9' : '#1f2937';

        const rewardEl = document.createElement('div');
        rewardEl.textContent = reward.label;
        rewardEl.style.fontSize = '12px';
        rewardEl.style.color = '#475569';

        if (claimed){
          const badge = document.createElement('span');
          badge.textContent = '受取済み';
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
      detailDescription.textContent = reward.description + '\n' + describeReward(reward);

      if (reward.specialTag){
        specialTagEl.style.display = 'inline-flex';
        specialTagEl.textContent = reward.specialTag;
      } else {
        specialTagEl.style.display = 'none';
      }

    if (claimed){
      detailStatus.textContent = `受取済み (${formatTime(claimed.claimedAt)})`;
    } else if (isToday){
      detailStatus.textContent = '本日受け取れます。';
    } else if (selected < new Date(today.getFullYear(), today.getMonth(), today.getDate())){
      detailStatus.textContent = '期間終了。受け取り済みの場合のみ記録が残ります。';
    } else {
      detailStatus.textContent = 'まだ受け取れません。ログイン可能日までお待ちください。';
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
      lines.push(`${formatLongDate(date)} のボーナスを受け取りました。`);
      switch (payload.type){
        case 'exp':
          lines.push(`経験値 +${Math.floor(gainedXp || payload.amount)} を獲得。`);
          break;
        case 'item': {
          if (payload.item && Number.isFinite(payload.amount) && payload.amount > 0){
            const grants = { [payload.item]: payload.amount };
            const applied = applyInventoryChanges(grants, metaBase);
            if (applied && Number(applied[payload.item]) > 0){
              lines.push(`${formatItemLabel(payload.item)} x${applied[payload.item]} を獲得しました。`);
            } else {
              lines.push(`${formatItemLabel(payload.item)}を受け取れませんでした（API未対応の可能性があります）。`);
            }
          } else {
            lines.push('アイテム報酬を受け取りました。');
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
              lines.push(`以下のアイテムを獲得しました: ${formatItemSummary(applied)}`);
            } else {
              lines.push(`以下のアイテム付与はホストAPI未対応のため反映されませんでした: ${formatItemSummary(grants)}`);
            }
          } else {
            lines.push('アイテム報酬を受け取りました。');
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
              lines.push('SPが最大まで回復しました。');
            } else {
              lines.push('SPは既に最大か、APIが未対応でした。');
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
              lines.push(`SPが${formatSpAmount(applied)}回復しました。`);
            } else if (applied < 0){
              lines.push(`SPが${formatSpAmount(-applied)}減少しました。`);
            } else {
              lines.push('SPに変化はありませんでした。');
            }
          } else {
            lines.push('SPが変化します。');
          }
          break;
        }
        default:
          lines.push('報酬を受け取りました。');
      }
      if (reward.specialTag){
        lines.push(`特別イベント: ${reward.specialTag}`);
      }
      messageLog.textContent = lines.join('\n');
    }

    claimButton.addEventListener('click', () => {
      const selected = state.selectedDate;
      const iso = formatIsoDate(selected);
      if (state.claims[iso]){
        messageLog.textContent = '既に受け取り済みです。';
        return;
      }
      if (!canClaim(selected, today)){
        messageLog.textContent = '本日のボーナスのみ受け取れます。';
        return;
      }
      const reward = getRewardForDate(selected);
      grantReward(selected, reward);
    });

    function start(){
      if (isRunning) return;
      isRunning = true;
      renderCalendar();
      updateDetail();
    }

    function stop(){
      if (!isRunning) return;
      isRunning = false;
      writeClaims(state.claims);
    }

    function destroy(){
      stop();
      try {
        if (root.contains(wrapper)) root.removeChild(wrapper);
      } catch {}
    }

    start();

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

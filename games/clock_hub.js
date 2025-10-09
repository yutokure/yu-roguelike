(function(){
  const globalScope = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null);
  const i18n = globalScope && globalScope.I18n ? globalScope.I18n : null;
  const KEY_BASE = 'games.clockHub';

  function translate(key, fallback, params){
    if (key && i18n && typeof i18n.t === 'function'){
      try {
        const value = i18n.t(key, params);
        if (typeof value === 'string' && value !== key){
          return value;
        }
      } catch (error){
        console.warn('[clock_hub] Failed to translate key', key, error);
      }
    }
    if (typeof fallback === 'function'){
      try {
        const result = fallback();
        return typeof result === 'string' ? result : (result ?? '');
      } catch (error){
        console.warn('[clock_hub] Failed to evaluate fallback for', key, error);
        return '';
      }
    }
    return fallback ?? '';
  }

  function t(path, fallback, params){
    return translate(path ? `${KEY_BASE}.${path}` : null, fallback, params);
  }

  function formatNumberLocalized(value, options){
    if (i18n && typeof i18n.formatNumber === 'function'){
      try {
        return i18n.formatNumber(value, options);
      } catch (error){
        console.warn('[clock_hub] Failed to format number via i18n:', error);
      }
    }
    try {
      return new Intl.NumberFormat(i18n && typeof i18n.getLocale === 'function' ? i18n.getLocale() : undefined, options).format(value);
    } catch (error){
      console.warn('[clock_hub] Intl.NumberFormat failed:', error);
      return String(value ?? '');
    }
  }

  const STORAGE_KEY = 'clock_hub_prefs_v1';
  const UPDATE_INTERVAL = 50;
  const DETAIL_TABS = [
    { id: 'overview', labelKey: 'detailTabs.overview', labelFallback: '概要' },
    { id: 'progress', labelKey: 'detailTabs.progress', labelFallback: '進捗率' },
    { id: 'remain', labelKey: 'detailTabs.remain', labelFallback: '残り時間' },
    { id: 'stats', labelKey: 'detailTabs.stats', labelFallback: '情報一覧' },
    { id: 'calendar', labelKey: 'detailTabs.calendar', labelFallback: 'カレンダー' }
  ];
  const ERA_DATA = [
    { nameKey: 'era.reiwa', nameFallback: '令和', start: new Date(2019, 4, 1) },
    { nameKey: 'era.heisei', nameFallback: '平成', start: new Date(1989, 0, 8) },
    { nameKey: 'era.showa', nameFallback: '昭和', start: new Date(1926, 11, 25) },
    { nameKey: 'era.taisho', nameFallback: '大正', start: new Date(1912, 6, 30) },
    { nameKey: 'era.meiji', nameFallback: '明治', start: new Date(1868, 0, 25) }
  ];
  const TENKAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const JUNISHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const WEEKDAY_DEFAULTS = ['日', '月', '火', '水', '木', '金', '土'];
  const SOLAR_TERMS = [
    { labelKey: 'solarTerms.risshun', labelFallback: '立春', month: 1, day: 4 },
    { labelKey: 'solarTerms.usui', labelFallback: '雨水', month: 1, day: 19 },
    { labelKey: 'solarTerms.keichitsu', labelFallback: '啓蟄', month: 2, day: 5 },
    { labelKey: 'solarTerms.shunbun', labelFallback: '春分', month: 2, day: 20 },
    { labelKey: 'solarTerms.seimei', labelFallback: '清明', month: 3, day: 4 },
    { labelKey: 'solarTerms.kokuu', labelFallback: '穀雨', month: 3, day: 19 },
    { labelKey: 'solarTerms.rikka', labelFallback: '立夏', month: 4, day: 5 },
    { labelKey: 'solarTerms.shoman', labelFallback: '小満', month: 4, day: 20 },
    { labelKey: 'solarTerms.boshu', labelFallback: '芒種', month: 5, day: 5 },
    { labelKey: 'solarTerms.geshi', labelFallback: '夏至', month: 5, day: 21 },
    { labelKey: 'solarTerms.shosho', labelFallback: '小暑', month: 6, day: 6 },
    { labelKey: 'solarTerms.taisho', labelFallback: '大暑', month: 6, day: 22 },
    { labelKey: 'solarTerms.risshu', labelFallback: '立秋', month: 7, day: 7 },
    { labelKey: 'solarTerms.shoshoLimitHeat', labelFallback: '処暑', month: 7, day: 22 },
    { labelKey: 'solarTerms.hakuro', labelFallback: '白露', month: 8, day: 7 },
    { labelKey: 'solarTerms.shubun', labelFallback: '秋分', month: 8, day: 23 },
    { labelKey: 'solarTerms.kanro', labelFallback: '寒露', month: 9, day: 8 },
    { labelKey: 'solarTerms.soko', labelFallback: '霜降', month: 9, day: 23 },
    { labelKey: 'solarTerms.rittou', labelFallback: '立冬', month: 10, day: 7 },
    { labelKey: 'solarTerms.shosetsu', labelFallback: '小雪', month: 10, day: 22 },
    { labelKey: 'solarTerms.taisetsu', labelFallback: '大雪', month: 11, day: 7 },
    { labelKey: 'solarTerms.touji', labelFallback: '冬至', month: 11, day: 21 },
    { labelKey: 'solarTerms.shokan', labelFallback: '小寒', month: 0, day: 5 },
    { labelKey: 'solarTerms.dahan', labelFallback: '大寒', month: 0, day: 20 }
  ];
  const XP_REWARDS = {
    second: 0.5,
    minute: 50,
    hour: 980,
    day: 7690,
    month: 32768,
    year: 260000,
    century: 10000000,
    millennium: 100000000
  };

  const TAB_CONFIG = {
    digital: { key: 'tabs.digital', fallback: 'デジタル時計' },
    analog: { key: 'tabs.analog', fallback: 'アナログ時計' },
    detail: { key: 'tabs.detail', fallback: '詳細' }
  };

  const PROGRESS_ITEMS = [
    { id: 'millennium', labelKey: 'progress.labels.millennium', labelFallback: '千年紀' },
    { id: 'century', labelKey: 'progress.labels.century', labelFallback: '世紀' },
    { id: 'decade', labelKey: 'progress.labels.decade', labelFallback: '年代' },
    { id: 'year', labelKey: 'progress.labels.year', labelFallback: '年' },
    { id: 'month', labelKey: 'progress.labels.month', labelFallback: '月' },
    { id: 'day', labelKey: 'progress.labels.day', labelFallback: '日' },
    { id: 'hour', labelKey: 'progress.labels.hour', labelFallback: '時' },
    { id: 'minute', labelKey: 'progress.labels.minute', labelFallback: '分' },
    { id: 'second', labelKey: 'progress.labels.second', labelFallback: '秒' }
  ];

  const REMAINING_CONFIG = [
    {
      id: 'nextSecond',
      labelKey: 'remaining.labels.nextSecond',
      labelFallback: '次の秒',
      compute(now){
        return new Date(now.getTime() + 1000 - now.getMilliseconds());
      }
    },
    {
      id: 'nextMinute',
      labelKey: 'remaining.labels.nextMinute',
      labelFallback: '次の分',
      compute(now){
        return new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + 1);
      }
    },
    {
      id: 'nextHour',
      labelKey: 'remaining.labels.nextHour',
      labelFallback: '次の時',
      compute(now){
        return new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1);
      }
    },
    {
      id: 'nextDay',
      labelKey: 'remaining.labels.nextDay',
      labelFallback: '次の日',
      compute(now){
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      }
    },
    {
      id: 'nextMonth',
      labelKey: 'remaining.labels.nextMonth',
      labelFallback: '次の月',
      compute(now){
        return new Date(now.getFullYear(), now.getMonth() + 1, 1);
      }
    },
    {
      id: 'nextYear',
      labelKey: 'remaining.labels.nextYear',
      labelFallback: '次の年',
      compute(now){
        return new Date(now.getFullYear() + 1, 0, 1);
      }
    }
  ];

  const STATS_LABELS = {
    unix: { key: 'stats.labels.unix', fallback: 'UNIX時間' },
    ticks: { key: 'stats.labels.ticks', fallback: '経過ミリ秒' },
    iso: { key: 'stats.labels.iso', fallback: 'ISO 8601' },
    yearday: { key: 'stats.labels.yearday', fallback: '年内通算日' },
    daySeconds: { key: 'stats.labels.daySeconds', fallback: '今日の経過秒' },
    timezone: { key: 'stats.labels.timezone', fallback: 'タイムゾーン' }
  };

  const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

  function sanitizeDateKeys(list){
    if (!Array.isArray(list)) return [];
    const unique = new Set();
    list.forEach(item => {
      if (typeof item === 'string' && DATE_KEY_RE.test(item)){
        unique.add(item);
      }
    });
    return Array.from(unique).sort();
  }

  function loadPrefs(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      const calendarPref = parsed.calendar && typeof parsed.calendar === 'object' ? parsed.calendar : {};
      const holidays = sanitizeDateKeys(calendarPref.holidays);
      const workdays = sanitizeDateKeys(calendarPref.workdays);
      return {
        digitalFormat: parsed.digitalFormat === '12h' ? '12h' : '24h',
        analogType: parsed.analogType === '24h' ? '24h' : '12h',
        detailTab: DETAIL_TABS.some(tab => tab.id === parsed.detailTab) ? parsed.detailTab : 'overview',
        calendar: {
          holidays,
          workdays
        }
      };
    } catch {
      return null;
    }
  }

  function savePrefs(prefs){
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        digitalFormat: prefs.digitalFormat,
        analogType: prefs.analogType,
        detailTab: prefs.detailTab,
        calendar: {
          holidays: sanitizeDateKeys(prefs.calendar && prefs.calendar.holidays ? prefs.calendar.holidays : []),
          workdays: sanitizeDateKeys(prefs.calendar && prefs.calendar.workdays ? prefs.calendar.workdays : [])
        }
      }));
    } catch {}
  }

  function formatDateKey(date){
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function parseDateKey(key){
    if (!DATE_KEY_RE.test(key)) return null;
    const [year, month, day] = key.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  function getIsoWeek(date){
    const tmp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = tmp.getUTCDay() || 7;
    tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
    return Math.ceil(((tmp - yearStart) / 86400000 + 1) / 7);
  }

  function getDayOfYear(date){
    const start = new Date(date.getFullYear(), 0, 0);
    return Math.floor((date - start) / 86400000);
  }

  function getWeekOfMonth(date){
    const first = new Date(date.getFullYear(), date.getMonth(), 1);
    return Math.floor((date.getDate() + first.getDay() - 1) / 7) + 1;
  }

  function getQuarter(monthIndex){
    return Math.floor(monthIndex / 3) + 1;
  }

  function getWeekdayLabel(index){
    const fallback = WEEKDAY_DEFAULTS[index] || '';
    return t(`weekdays.${index}`, fallback);
  }

  function getStemLabel(index){
    const base = TENKAN.length;
    const normalized = ((index % base) + base) % base;
    return t(`eto.stems.${normalized}`, TENKAN[normalized] || '');
  }

  function getBranchLabel(index){
    const base = JUNISHI.length;
    const normalized = ((index % base) + base) % base;
    return t(`eto.branches.${normalized}`, JUNISHI[normalized] || '');
  }

  function getSolarTermLabel(term){
    return t(term.labelKey, term.labelFallback);
  }

  function formatLocalizedDate(date){
    const params = {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      weekday: getWeekdayLabel(date.getDay())
    };
    return t('dates.full', () => `${params.year}年${params.month}月${params.day}日（${params.weekday}）`, params);
  }

  function getYesNo(value){
    return value ? t('common.yes', 'はい') : t('common.no', 'いいえ');
  }

  function pad(num){
    return num.toString().padStart(2, '0');
  }

  function formatDigital(date, mode){
    const params = {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      weekday: getWeekdayLabel(date.getDay())
    };
    const dateLine = t('digital.dateLine', () => `${params.year}年${params.month}月${params.day}日（${params.weekday}）`, params);
    let timeLine = '';
    const minute = pad(date.getMinutes());
    const second = pad(date.getSeconds());
    if (mode === '12h'){
      const hours24 = date.getHours();
      const am = hours24 < 12;
      let hours = hours24 % 12;
      if (hours === 0) hours = 12;
      const period = am ? t('digital.period.am', '午前') : t('digital.period.pm', '午後');
      const timeParams = { period, hour: hours, minute, second };
      timeLine = t('digital.timeLine12', () => `${period}${hours}時${minute}分${second}秒`, timeParams);
    } else {
      const hour = pad(date.getHours());
      const timeParams = { hour, minute, second };
      timeLine = t('digital.timeLine24', () => `${hour}時${minute}分${second}秒`, timeParams);
    }
    return { dateLine, timeLine };
  }

  function getEra(date){
    for (const era of ERA_DATA){
      if (date >= era.start){
        const eraYear = date.getFullYear() - era.start.getFullYear() + 1;
        const eraName = t(era.nameKey, era.nameFallback);
        return t('era.format', () => `${eraName}${eraYear}年`, { era: eraName, year: eraYear });
      }
    }
    return t('era.unknown', '不明');
  }

  function getEto(year){
    const stem = getStemLabel(year - 4);
    const branch = getBranchLabel(year - 4);
    return t('eto.format', () => `${stem}${branch}`, { stem, branch });
  }

  function getSeason(monthIndex){
    if (monthIndex === 11 || monthIndex <= 1) return t('season.winter', '冬');
    if (monthIndex >= 2 && monthIndex <= 4) return t('season.spring', '春');
    if (monthIndex >= 5 && monthIndex <= 7) return t('season.summer', '夏');
    if (monthIndex >= 8 && monthIndex <= 10) return t('season.autumn', '秋');
    return t('season.unknown', '不明');
  }

  function getSolarTermInfo(date){
    const year = date.getFullYear();
    const terms = [];
    [-1, 0, 1].forEach(offset => {
      SOLAR_TERMS.forEach(item => {
        terms.push({
          label: getSolarTermLabel(item),
          date: new Date(year + offset, item.month, item.day, 0, 0, 0)
        });
      });
    });
    terms.sort((a, b) => a.date - b.date);
    const prev = [...terms].reverse().find(term => term.date <= date) || terms[terms.length - 1];
    const next = terms.find(term => term.date > date) || terms[0];
    return { prev, next };
  }

  function isLeapYear(year){
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  function elapsedFraction(start, end, now){
    return Math.max(0, Math.min(1, (now - start) / (end - start)));
  }

  function timeDiffComponents(target, now){
    const diffMs = target - now;
    const sign = diffMs >= 0 ? 1 : -1;
    const abs = Math.abs(diffMs);
    const seconds = Math.floor(abs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const years = Math.floor(days / 365);
    return {
      sign,
      years,
      days: days % 365,
      hours: hours % 24,
      minutes: minutes % 60,
      seconds: seconds % 60,
      millis: abs % 1000
    };
  }

  function formatDuration(diff){
    const prefix = diff.sign >= 0 ? t('duration.prefix.future', 'あと') : t('duration.prefix.past', '前');
    const parts = [];
    if (diff.years) parts.push(t('duration.unit.year', () => `${diff.years}年`, { value: diff.years }));
    if (diff.days) parts.push(t('duration.unit.day', () => `${diff.days}日`, { value: diff.days }));
    if (diff.hours) parts.push(t('duration.unit.hour', () => `${diff.hours}時間`, { value: diff.hours }));
    if (diff.minutes) parts.push(t('duration.unit.minute', () => `${diff.minutes}分`, { value: diff.minutes }));
    parts.push(t('duration.unit.second', () => `${diff.seconds}秒`, { value: diff.seconds }));
    const joiner = t('duration.joiner', '');
    return `${prefix}${parts.join(joiner)}`;
  }

  function drawAnalogClock(ctx, size, date, mode){
    const radius = size / 2;
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(radius, radius);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, radius - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    const divisions = mode === '24h' ? 24 : 12;
    for (let i = 0; i < divisions; i++){
      const angle = (Math.PI * 2 * i) / divisions;
      const inner = radius - 10;
      const outer = radius - 2;
      ctx.beginPath();
      ctx.moveTo(inner * Math.sin(angle), -inner * Math.cos(angle));
      ctx.lineTo(outer * Math.sin(angle), -outer * Math.cos(angle));
      ctx.stroke();
    }

    ctx.fillStyle = '#0f172a';
    ctx.font = `${mode === '24h' ? 12 : 14}px "Segoe UI", "Noto Sans JP", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (mode === '24h'){
      for (let i = 0; i < 24; i++){
        const angle = (Math.PI * 2 * i) / 24;
        const r = radius - 22;
        ctx.fillText(i.toString(), r * Math.sin(angle), -r * Math.cos(angle));
      }
    } else {
      for (let i = 1; i <= 12; i++){
        const angle = (Math.PI * 2 * i) / 12;
        const r = radius - 24;
        ctx.fillText(i.toString(), r * Math.sin(angle), -r * Math.cos(angle));
      }
    }

    const sec = date.getSeconds() + date.getMilliseconds() / 1000;
    const min = date.getMinutes() + sec / 60;
    const hour = date.getHours() + min / 60;

    const hourDivisor = mode === '24h' ? 24 : 12;
    const hourAngle = (Math.PI * 2 * (mode === '24h' ? hour : hour % 12)) / hourDivisor;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo((radius - 40) * Math.sin(hourAngle), -(radius - 40) * Math.cos(hourAngle));
    ctx.stroke();

    const minuteAngle = (Math.PI * 2 * min) / 60;
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo((radius - 26) * Math.sin(minuteAngle), -(radius - 26) * Math.cos(minuteAngle));
    ctx.stroke();

    const secondAngle = (Math.PI * 2 * sec) / 60;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo((radius - 18) * Math.sin(secondAngle), -(radius - 18) * Math.cos(secondAngle));
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function createProgressRow(){
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.flexDirection = 'column';
    row.style.gap = '4px';

    const label = document.createElement('div');
    label.style.display = 'flex';
    label.style.justifyContent = 'space-between';
    label.style.fontSize = '14px';
    label.style.color = '#0f172a';

    const progressWrap = document.createElement('div');
    progressWrap.style.width = '100%';
    progressWrap.style.height = '8px';
    progressWrap.style.background = '#e2e8f0';
    progressWrap.style.borderRadius = '999px';
    progressWrap.style.overflow = 'hidden';

    const bar = document.createElement('div');
    bar.style.height = '100%';
    bar.style.width = '0%';
    bar.style.background = 'linear-gradient(90deg, #2563eb, #38bdf8)';

    progressWrap.appendChild(bar);
    row.appendChild(label);
    row.appendChild(progressWrap);

    const labelLeft = document.createElement('span');
    const labelRight = document.createElement('span');
    label.appendChild(labelLeft);
    label.appendChild(labelRight);

    return { row, labelLeft, labelRight, bar };
  }

  function create(root, awardXp){
    if (!root) throw new Error(t('errors.noContainer', 'Clock Hub requires a container'));
    const prefs = loadPrefs() || {
      digitalFormat: '24h',
      analogType: '12h',
      detailTab: 'overview',
      calendar: { holidays: [], workdays: [] }
    };
    const state = {
      running: false,
      sessionXp: 0,
      prefs
    };
    if (!state.prefs.calendar){
      state.prefs.calendar = { holidays: [], workdays: [] };
    }
    if (!Array.isArray(state.prefs.calendar.holidays)) state.prefs.calendar.holidays = [];
    if (!Array.isArray(state.prefs.calendar.workdays)) state.prefs.calendar.workdays = [];
    let timer = null;
    let lastSegments = null;
    const initialDate = new Date();
    const calendarState = {
      currentYear: initialDate.getFullYear(),
      currentMonth: initialDate.getMonth(),
      selectedKey: formatDateKey(initialDate)
    };
    let calendarCells = new Map();
    let calendarSignature = '';
    let calendarDetailKey = '';

    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.justifyContent = 'center';
    wrapper.style.background = 'linear-gradient(135deg, rgba(30,64,175,0.12), rgba(15,23,42,0.78))';
    wrapper.style.fontFamily = '"Noto Sans JP", "Hiragino Sans", sans-serif';

    const frame = document.createElement('div');
    frame.style.width = 'min(1040px, 96%)';
    frame.style.minHeight = 'min(560px, 94%)';
    frame.style.display = 'flex';
    frame.style.flexDirection = 'column';
    frame.style.background = 'rgba(248,250,252,0.95)';
    frame.style.backdropFilter = 'blur(6px)';
    frame.style.borderRadius = '18px';
    frame.style.boxShadow = '0 24px 60px rgba(15,23,42,0.35)';
    frame.style.border = '1px solid rgba(148,163,184,0.35)';
    frame.style.overflow = 'hidden';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.padding = '20px 28px';
    header.style.background = 'rgba(255,255,255,0.85)';
    header.style.borderBottom = '1px solid rgba(148,163,184,0.25)';

    const titleBox = document.createElement('div');
    const title = document.createElement('h2');
    title.textContent = t('header.title', '時計ユーティリティハブ');
    title.style.margin = '0';
    title.style.fontSize = '24px';
    title.style.color = '#0f172a';
    const subtitle = document.createElement('div');
    subtitle.style.fontSize = '14px';
    subtitle.style.color = '#475569';
    subtitle.textContent = t('header.subtitle', 'デジタル／アナログ／詳細情報を切り替え');
    titleBox.appendChild(title);
    titleBox.appendChild(subtitle);

    const xpBadge = document.createElement('div');
    xpBadge.style.padding = '6px 12px';
    xpBadge.style.background = '#1d4ed8';
    xpBadge.style.color = '#ffffff';
    xpBadge.style.borderRadius = '999px';
    xpBadge.style.fontWeight = '600';

    header.appendChild(titleBox);
    header.appendChild(xpBadge);

    function setXpBadgeText(value){
      const formatted = formatNumberLocalized(value, { maximumFractionDigits: 3, minimumFractionDigits: 0 });
      xpBadge.textContent = t('header.exp', () => `獲得EXP: ${formatted}`, { xp: formatted });
    }

    setXpBadgeText(state.sessionXp);

    const tabBar = document.createElement('div');
    tabBar.style.display = 'flex';
    tabBar.style.gap = '8px';
    tabBar.style.padding = '16px 24px 0 24px';
    tabBar.style.background = 'rgba(255,255,255,0.8)';

    const tabButtons = {};
    const tabContents = {};
    const tabIds = ['digital', 'analog', 'detail'];

    const contentArea = document.createElement('div');
    contentArea.style.flex = '1';
    contentArea.style.display = 'flex';
    contentArea.style.flexDirection = 'column';
    contentArea.style.padding = '24px 28px 32px';
    contentArea.style.gap = '24px';

    tabIds.forEach(id => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const tabCfg = TAB_CONFIG[id];
      btn.textContent = tabCfg ? t(tabCfg.key, tabCfg.fallback) : '';
      btn.style.padding = '10px 18px';
      btn.style.borderRadius = '999px';
      btn.style.border = '1px solid rgba(59,130,246,0.3)';
      btn.style.background = 'rgba(255,255,255,0.85)';
      btn.style.color = '#1d4ed8';
      btn.style.fontWeight = '600';
      btn.style.cursor = 'pointer';
      btn.addEventListener('click', () => switchTab(id));
      tabBar.appendChild(btn);
      tabButtons[id] = btn;

      const section = document.createElement('div');
      section.style.display = 'none';
      section.style.flex = '1';
      section.style.flexDirection = 'column';
      section.style.gap = '20px';
      section.style.height = '100%';
      tabContents[id] = section;
      contentArea.appendChild(section);
    });

    // Digital tab content
    const digitalSection = tabContents.digital;
    digitalSection.style.display = 'flex';
    digitalSection.style.flexDirection = 'column';
    digitalSection.style.alignItems = 'center';
    digitalSection.style.justifyContent = 'center';
    digitalSection.style.gap = '24px';

    const digitalDisplay = document.createElement('div');
    digitalDisplay.style.display = 'flex';
    digitalDisplay.style.flexDirection = 'column';
    digitalDisplay.style.alignItems = 'center';
    digitalDisplay.style.gap = '12px';

    const digitalDateLine = document.createElement('div');
    digitalDateLine.style.fontSize = '28px';
    digitalDateLine.style.fontWeight = '600';
    digitalDateLine.style.color = '#0f172a';

    const digitalTimeLine = document.createElement('div');
    digitalTimeLine.style.fontSize = '48px';
    digitalTimeLine.style.fontWeight = '700';
    digitalTimeLine.style.color = '#1d4ed8';

    digitalDisplay.appendChild(digitalDateLine);
    digitalDisplay.appendChild(digitalTimeLine);

    const digitalToggle = document.createElement('div');
    digitalToggle.style.display = 'flex';
    digitalToggle.style.gap = '16px';
    digitalToggle.style.alignItems = 'center';
    digitalToggle.style.justifyContent = 'center';

    ['24h', '12h'].forEach(mode => {
      const label = document.createElement('label');
      label.style.display = 'flex';
      label.style.alignItems = 'center';
      label.style.gap = '6px';
      label.style.fontSize = '16px';
      label.style.color = '#0f172a';

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'clock-hub-digital-format';
      radio.value = mode;
      if (prefs.digitalFormat === mode) radio.checked = true;
      radio.addEventListener('change', () => {
        if (radio.checked){
          state.prefs.digitalFormat = mode;
          savePrefs(state.prefs);
        }
      });

      label.appendChild(radio);
      const labelText = mode === '24h'
        ? t('digital.format.24h', '24時間制')
        : t('digital.format.12h', '12時間制');
      label.appendChild(document.createTextNode(labelText));
      digitalToggle.appendChild(label);
    });

    digitalSection.appendChild(digitalDisplay);
    digitalSection.appendChild(digitalToggle);

    // Analog tab content
    const analogSection = tabContents.analog;
    analogSection.style.display = 'flex';
    analogSection.style.flexDirection = 'column';
    analogSection.style.alignItems = 'center';
    analogSection.style.gap = '24px';

    const canvas = document.createElement('canvas');
    const canvasSize = 320;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    canvas.style.width = `${canvasSize}px`;
    canvas.style.height = `${canvasSize}px`;
    canvas.style.background = '#f8fafc';
    canvas.style.borderRadius = '50%';
    canvas.style.boxShadow = '0 20px 40px rgba(15,23,42,0.15)';

    const ctx = canvas.getContext('2d');

    const analogToggle = document.createElement('div');
    analogToggle.style.display = 'flex';
    analogToggle.style.gap = '16px';
    analogToggle.style.alignItems = 'center';
    analogToggle.style.justifyContent = 'center';

    ['12h', '24h'].forEach(mode => {
      const label = document.createElement('label');
      label.style.display = 'flex';
      label.style.alignItems = 'center';
      label.style.gap = '6px';
      label.style.fontSize = '16px';
      label.style.color = '#0f172a';

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'clock-hub-analog-type';
      radio.value = mode;
      if (prefs.analogType === mode) radio.checked = true;
      radio.addEventListener('change', () => {
        if (radio.checked){
          state.prefs.analogType = mode;
          savePrefs(state.prefs);
        }
      });

      label.appendChild(radio);
      const labelText = mode === '12h'
        ? t('analog.type.12h', '通常アナログ時計')
        : t('analog.type.24h', '24時間制アナログ時計');
      label.appendChild(document.createTextNode(labelText));
      analogToggle.appendChild(label);
    });

    analogSection.appendChild(canvas);
    analogSection.appendChild(analogToggle);

    // Detail tab content
    const detailSection = tabContents.detail;
    detailSection.style.display = 'flex';
    detailSection.style.flexDirection = 'column';
    detailSection.style.gap = '16px';

    const detailTabBar = document.createElement('div');
    detailTabBar.style.display = 'flex';
    detailTabBar.style.gap = '8px';

    const detailButtons = {};
    const detailViews = {};

    DETAIL_TABS.forEach(tab => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = t(tab.labelKey, tab.labelFallback);
      btn.style.padding = '8px 16px';
      btn.style.borderRadius = '10px';
      btn.style.border = '1px solid rgba(148,163,184,0.4)';
      btn.style.background = 'rgba(255,255,255,0.85)';
      btn.style.cursor = 'pointer';
      btn.style.fontWeight = '600';
      btn.style.color = '#0f172a';
      btn.addEventListener('click', () => switchDetailTab(tab.id));
      detailTabBar.appendChild(btn);
      detailButtons[tab.id] = btn;

      const view = document.createElement('div');
      view.style.display = 'none';
      view.style.background = '#ffffff';
      view.style.border = '1px solid rgba(148,163,184,0.25)';
      view.style.borderRadius = '12px';
      view.style.padding = '16px';
      view.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.9)';
      view.style.display = 'none';
      view.style.minHeight = '180px';
      detailViews[tab.id] = view;
      detailSection.appendChild(view);
    });

    detailSection.insertBefore(detailTabBar, detailSection.firstChild);

    const overviewContent = document.createElement('div');
    overviewContent.style.display = 'flex';
    overviewContent.style.flexDirection = 'column';
    overviewContent.style.gap = '6px';
    detailViews.overview.appendChild(overviewContent);
    const overviewLines = [
      document.createElement('div'),
      document.createElement('div'),
      document.createElement('div'),
      document.createElement('div'),
      document.createElement('div')
    ];
    overviewLines.forEach(line => {
      line.style.fontSize = '15px';
      line.style.color = '#0f172a';
      overviewContent.appendChild(line);
    });

    const progressContainer = document.createElement('div');
    progressContainer.style.display = 'flex';
    progressContainer.style.flexDirection = 'column';
    progressContainer.style.gap = '12px';
    detailViews.progress.appendChild(progressContainer);

    const remainingList = document.createElement('div');
    remainingList.style.display = 'grid';
    remainingList.style.gridTemplateColumns = 'repeat(auto-fit, minmax(180px, 1fr))';
    remainingList.style.gap = '12px';
    detailViews.remain.appendChild(remainingList);

    const statsList = document.createElement('div');
    statsList.style.display = 'flex';
    statsList.style.flexDirection = 'column';
    statsList.style.gap = '6px';
    detailViews.stats.appendChild(statsList);

    const progressRows = {};
    PROGRESS_ITEMS.forEach(item => {
      const row = createProgressRow();
      row.labelLeft.textContent = t(item.labelKey, item.labelFallback);
      progressContainer.appendChild(row.row);
      progressRows[item.id] = row;
    });

    const remainingItems = {};
    REMAINING_CONFIG.forEach(item => {
      const card = document.createElement('div');
      card.style.background = 'rgba(248,250,252,0.9)';
      card.style.border = '1px solid rgba(148,163,184,0.25)';
      card.style.borderRadius = '10px';
      card.style.padding = '12px';
      card.style.display = 'flex';
      card.style.flexDirection = 'column';
      card.style.gap = '4px';

      const titleLabel = document.createElement('div');
      titleLabel.style.fontSize = '14px';
      titleLabel.style.color = '#475569';
      titleLabel.textContent = t(item.labelKey, item.labelFallback);

      const value = document.createElement('div');
      value.style.fontSize = '16px';
      value.style.fontWeight = '600';
      value.style.color = '#0f172a';

      card.appendChild(titleLabel);
      card.appendChild(value);
      remainingList.appendChild(card);
      remainingItems[item.id] = value;
    });

    const statsItems = {};
    Object.keys(STATS_LABELS).forEach(key => {
      const line = document.createElement('div');
      line.style.display = 'flex';
      line.style.justifyContent = 'space-between';
      line.style.fontSize = '14px';
      line.style.color = '#0f172a';
      const label = document.createElement('span');
      const cfg = STATS_LABELS[key];
      label.textContent = t(cfg.key, cfg.fallback);
      const value = document.createElement('span');
      value.style.fontFamily = '"Roboto Mono", "Cascadia Code", monospace';
      line.appendChild(label);
      line.appendChild(value);
      statsList.appendChild(line);
      statsItems[key] = value;
    });

    const calendarView = detailViews.calendar;
    calendarView.style.display = 'flex';
    calendarView.style.flexDirection = 'column';
    calendarView.style.gap = '16px';

    const calendarHeader = document.createElement('div');
    calendarHeader.style.display = 'flex';
    calendarHeader.style.justifyContent = 'space-between';
    calendarHeader.style.alignItems = 'center';

    const calendarTitle = document.createElement('div');
    calendarTitle.style.display = 'flex';
    calendarTitle.style.flexDirection = 'column';
    calendarTitle.style.gap = '2px';
    const calendarMonthLabel = document.createElement('div');
    calendarMonthLabel.style.fontSize = '20px';
    calendarMonthLabel.style.fontWeight = '600';
    calendarMonthLabel.style.color = '#0f172a';
    const calendarTodayLabel = document.createElement('div');
    calendarTodayLabel.style.fontSize = '13px';
    calendarTodayLabel.style.color = '#475569';
    calendarTitle.appendChild(calendarMonthLabel);
    calendarTitle.appendChild(calendarTodayLabel);

    const calendarControls = document.createElement('div');
    calendarControls.style.display = 'flex';
    calendarControls.style.gap = '8px';

    function createCalendarButton(key, fallback){
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = t(key, fallback);
      btn.style.padding = '6px 12px';
      btn.style.borderRadius = '8px';
      btn.style.border = '1px solid rgba(148,163,184,0.4)';
      btn.style.background = 'rgba(255,255,255,0.9)';
      btn.style.cursor = 'pointer';
      btn.style.color = '#0f172a';
      btn.style.fontWeight = '600';
      return btn;
    }

    const prevMonthBtn = createCalendarButton('calendar.controls.prev', '← 前月');
    const nextMonthBtn = createCalendarButton('calendar.controls.next', '翌月 →');
    const todayBtn = createCalendarButton('calendar.controls.today', '今日');

    calendarControls.appendChild(prevMonthBtn);
    calendarControls.appendChild(todayBtn);
    calendarControls.appendChild(nextMonthBtn);

    calendarHeader.appendChild(calendarTitle);
    calendarHeader.appendChild(calendarControls);

    const weekdayHeader = document.createElement('div');
    weekdayHeader.style.display = 'grid';
    weekdayHeader.style.gridTemplateColumns = 'repeat(7, minmax(0, 1fr))';
    weekdayHeader.style.gap = '6px';
    WEEKDAY_DEFAULTS.forEach((_, index) => {
      const cell = document.createElement('div');
      const label = getWeekdayLabel(index);
      cell.textContent = label;
      cell.style.textAlign = 'center';
      cell.style.fontSize = '13px';
      cell.style.fontWeight = '600';
      cell.style.padding = '4px 0';
      cell.style.borderRadius = '8px';
      cell.style.background = 'rgba(226,232,240,0.6)';
      cell.style.color = index === 0 ? '#ef4444' : index === 6 ? '#2563eb' : '#0f172a';
      weekdayHeader.appendChild(cell);
    });

    const calendarGrid = document.createElement('div');
    calendarGrid.style.display = 'grid';
    calendarGrid.style.gridTemplateColumns = 'repeat(7, minmax(0, 1fr))';
    calendarGrid.style.gap = '6px';

    const calendarInfoCard = document.createElement('div');
    calendarInfoCard.style.background = 'rgba(248,250,252,0.9)';
    calendarInfoCard.style.border = '1px solid rgba(148,163,184,0.25)';
    calendarInfoCard.style.borderRadius = '12px';
    calendarInfoCard.style.padding = '14px 16px';
    calendarInfoCard.style.display = 'flex';
    calendarInfoCard.style.flexDirection = 'column';
    calendarInfoCard.style.gap = '6px';

    const calendarInfoItems = {
      summary: document.createElement('div'),
      era: document.createElement('div'),
      season: document.createElement('div'),
      progress: document.createElement('div'),
      status: document.createElement('div')
    };
    Object.values(calendarInfoItems).forEach(item => {
      item.style.fontSize = '14px';
      item.style.color = '#0f172a';
      calendarInfoCard.appendChild(item);
    });

    const calendarSettingsCard = document.createElement('div');
    calendarSettingsCard.style.background = '#ffffff';
    calendarSettingsCard.style.border = '1px solid rgba(148,163,184,0.25)';
    calendarSettingsCard.style.borderRadius = '12px';
    calendarSettingsCard.style.padding = '16px';
    calendarSettingsCard.style.display = 'flex';
    calendarSettingsCard.style.flexDirection = 'column';
    calendarSettingsCard.style.gap = '12px';

    const calendarSettingsTitle = document.createElement('div');
    calendarSettingsTitle.textContent = t('calendar.settings.title', '休暇／出勤日のカスタム設定');
    calendarSettingsTitle.style.fontSize = '15px';
    calendarSettingsTitle.style.fontWeight = '600';
    calendarSettingsTitle.style.color = '#0f172a';
    calendarSettingsCard.appendChild(calendarSettingsTitle);

    const calendarSettingsGrid = document.createElement('div');
    calendarSettingsGrid.style.display = 'grid';
    calendarSettingsGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(220px, 1fr))';
    calendarSettingsGrid.style.gap = '16px';

    function createSettingsSection(config){
      const section = document.createElement('div');
      section.style.display = 'flex';
      section.style.flexDirection = 'column';
      section.style.gap = '8px';

      const title = document.createElement('div');
      title.textContent = t(config.titleKey, config.titleFallback);
      title.style.fontSize = '14px';
      title.style.fontWeight = '600';
      title.style.color = '#0f172a';

      const controlRow = document.createElement('div');
      controlRow.style.display = 'flex';
      controlRow.style.gap = '6px';

      const dateInput = document.createElement('input');
      dateInput.type = 'date';
      dateInput.style.flex = '1';
      dateInput.style.padding = '6px 8px';
      dateInput.style.border = '1px solid rgba(148,163,184,0.4)';
      dateInput.style.borderRadius = '8px';

      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.textContent = t(config.buttonKey, config.buttonFallback);
      addBtn.style.padding = '6px 10px';
      addBtn.style.borderRadius = '8px';
      addBtn.style.border = '1px solid rgba(37,99,235,0.4)';
      addBtn.style.background = 'rgba(37,99,235,0.12)';
      addBtn.style.color = '#1d4ed8';
      addBtn.style.cursor = 'pointer';

      controlRow.appendChild(dateInput);
      controlRow.appendChild(addBtn);

      const list = document.createElement('div');
      list.style.display = 'flex';
      list.style.flexDirection = 'column';
      list.style.gap = '4px';
      list.style.maxHeight = '150px';
      list.style.overflowY = 'auto';
      list.style.paddingRight = '4px';

      section.appendChild(title);
      section.appendChild(controlRow);
      section.appendChild(list);

      return { section, dateInput, addBtn, list };
    }

    const holidaySection = createSettingsSection({
      titleKey: 'calendar.settings.holidayTitle',
      titleFallback: '祝日・休暇として登録',
      buttonKey: 'calendar.settings.add',
      buttonFallback: '追加'
    });
    const workdaySection = createSettingsSection({
      titleKey: 'calendar.settings.workdayTitle',
      titleFallback: '出勤日として登録',
      buttonKey: 'calendar.settings.add',
      buttonFallback: '追加'
    });

    calendarSettingsGrid.appendChild(holidaySection.section);
    calendarSettingsGrid.appendChild(workdaySection.section);
    calendarSettingsCard.appendChild(calendarSettingsGrid);

    calendarView.appendChild(calendarHeader);
    calendarView.appendChild(weekdayHeader);
    calendarView.appendChild(calendarGrid);
    calendarView.appendChild(calendarInfoCard);
    calendarView.appendChild(calendarSettingsCard);

    function computeCalendarSignature(){
      const holidays = (state.prefs.calendar.holidays || []).slice().sort().join('|');
      const workdays = (state.prefs.calendar.workdays || []).slice().sort().join('|');
      return `${calendarState.currentYear}-${calendarState.currentMonth}-${holidays}-${workdays}`;
    }

    function isCustomHoliday(key){
      return (state.prefs.calendar.holidays || []).includes(key);
    }

    function isCustomWorkday(key){
      return (state.prefs.calendar.workdays || []).includes(key);
    }

    function isRestDay(key, date){
      if (!date) return false;
      if (isCustomWorkday(key)) return false;
      if (isCustomHoliday(key)) return true;
      const weekday = date.getDay();
      return weekday === 0 || weekday === 6;
    }

    function updateCalendarCellStyles(now){
      const todayKey = formatDateKey(now);
      calendarCells.forEach((cell, key) => {
        const date = parseDateKey(key);
        if (!date) return;
        const inMonth = date.getFullYear() === calendarState.currentYear && date.getMonth() === calendarState.currentMonth;
        cell.style.opacity = inMonth ? '1' : '0.55';
        let textColor = inMonth ? '#0f172a' : '#64748b';
        if (date.getDay() === 0) textColor = inMonth ? '#dc2626' : '#f87171';
        if (date.getDay() === 6) textColor = inMonth ? '#2563eb' : '#60a5fa';
        cell.style.color = textColor;
        cell.style.border = key === calendarState.selectedKey ? '2px solid #f97316' : '1px solid rgba(148,163,184,0.35)';
        cell.style.boxShadow = todayKey === key ? '0 0 0 2px rgba(37,99,235,0.35)' : 'none';
        let background = inMonth ? 'rgba(255,255,255,0.92)' : 'rgba(241,245,249,0.6)';
        if (isRestDay(key, date)) background = 'rgba(254,226,226,0.85)';
        if (key === calendarState.selectedKey){
          background = isRestDay(key, date) ? 'rgba(254,242,242,0.95)' : 'rgba(255,255,255,1)';
        }
        cell.style.background = background;
      });
    }

    function updateCalendarDetail(now){
      const selectedDate = parseDateKey(calendarState.selectedKey) || now;
      const key = formatDateKey(selectedDate);
      if (calendarDetailKey === key && calendarInfoItems.summary.textContent) return;
      calendarDetailKey = key;
      const holidayRegistered = isCustomHoliday(key);
      const workdayRegistered = isCustomWorkday(key);
      const rest = isRestDay(key, selectedDate);
      const summaryDate = formatLocalizedDate(selectedDate);
      calendarInfoItems.summary.textContent = t('calendar.info.summary', () => `日付: ${summaryDate}`, { date: summaryDate });
      const eraLabel = getEra(selectedDate);
      const etoLabel = getEto(selectedDate.getFullYear());
      calendarInfoItems.era.textContent = t('calendar.info.era', () => `和暦: ${eraLabel}｜干支: ${etoLabel}`, {
        era: eraLabel,
        eto: etoLabel
      });
      const seasonLabel = getSeason(selectedDate.getMonth());
      const quarter = getQuarter(selectedDate.getMonth());
      calendarInfoItems.season.textContent = t('calendar.info.season', () => `季節: ${seasonLabel}｜四半期: 第${quarter}四半期`, {
        season: seasonLabel,
        quarter
      });
      const dayOfYear = getDayOfYear(selectedDate);
      const isoWeek = getIsoWeek(selectedDate);
      const weekOfMonth = getWeekOfMonth(selectedDate);
      calendarInfoItems.progress.textContent = t('calendar.info.progress', () => `年内通算日: 第${dayOfYear}日｜ISO週番号: 第${isoWeek}週｜月内第${weekOfMonth}週`, {
        dayOfYear,
        isoWeek,
        weekOfMonth
      });
      const statusParts = [];
      if (rest) statusParts.push(t('calendar.status.rest', '休み')); else statusParts.push(t('calendar.status.workday', '出勤日想定'));
      if (holidayRegistered) statusParts.push(t('calendar.status.holiday', '祝日登録あり'));
      if (workdayRegistered) statusParts.push(t('calendar.status.workdayOverride', '出勤登録あり'));
      const statusSeparator = t('calendar.status.separator', ' / ');
      const statusText = statusParts.join(statusSeparator);
      calendarInfoItems.status.textContent = t('calendar.info.status', () => `区分: ${statusText}`, { status: statusText });
    }

    function renderCalendar(force = false){
      const signature = computeCalendarSignature();
      if (!force && signature === calendarSignature) return;
      calendarSignature = signature;
      const monthParams = {
        year: calendarState.currentYear,
        month: calendarState.currentMonth + 1
      };
      calendarMonthLabel.textContent = t('calendar.monthLabel', () => `${monthParams.year}年${monthParams.month}月`, monthParams);
      calendarGrid.innerHTML = '';
      calendarCells = new Map();
      const firstOfMonth = new Date(calendarState.currentYear, calendarState.currentMonth, 1);
      const startDate = new Date(calendarState.currentYear, calendarState.currentMonth, 1 - firstOfMonth.getDay());
      for (let i = 0; i < 42; i++){
        const cellDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
        const key = formatDateKey(cellDate);
        const inMonth = cellDate.getFullYear() === calendarState.currentYear && cellDate.getMonth() === calendarState.currentMonth;
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.textContent = cellDate.getDate().toString();
        cell.style.display = 'flex';
        cell.style.alignItems = 'center';
        cell.style.justifyContent = 'center';
        cell.style.padding = '12px 0';
        cell.style.borderRadius = '10px';
        cell.style.border = '1px solid rgba(148,163,184,0.35)';
        cell.style.background = inMonth ? 'rgba(255,255,255,0.92)' : 'rgba(241,245,249,0.6)';
        cell.style.cursor = 'pointer';
        cell.style.fontSize = '14px';
        cell.style.fontWeight = '600';
        cell.dataset.key = key;
        cell.addEventListener('click', () => {
          calendarState.selectedKey = key;
          if (!inMonth){
            setCalendarMonth(cellDate.getFullYear(), cellDate.getMonth());
          } else {
            updateCalendar(new Date());
          }
        });
        calendarGrid.appendChild(cell);
        calendarCells.set(key, cell);
      }
      renderCalendarSettingsLists();
      calendarDetailKey = '';
    }

    function renderCalendarSettingsLists(){
      renderSettingsList(holidaySection.list, state.prefs.calendar.holidays || [], 'holiday');
      renderSettingsList(workdaySection.list, state.prefs.calendar.workdays || [], 'workday');
    }

    function renderSettingsList(container, items, type){
      container.innerHTML = '';
      const sorted = items.slice().sort();
      if (!sorted.length){
        const empty = document.createElement('div');
        empty.textContent = t('calendar.settings.empty', '登録なし');
        empty.style.fontSize = '13px';
        empty.style.color = '#94a3b8';
        container.appendChild(empty);
        return;
      }
      sorted.forEach(key => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'center';
        row.style.fontSize = '13px';
        row.style.color = '#0f172a';
        row.style.background = 'rgba(248,250,252,0.8)';
        row.style.border = '1px solid rgba(148,163,184,0.2)';
        row.style.borderRadius = '8px';
        row.style.padding = '4px 8px';
        const label = document.createElement('span');
        label.textContent = key;
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.textContent = t('calendar.settings.remove', '削除');
        remove.style.border = 'none';
        remove.style.background = 'rgba(239,68,68,0.12)';
        remove.style.color = '#ef4444';
        remove.style.borderRadius = '6px';
        remove.style.padding = '4px 8px';
        remove.style.cursor = 'pointer';
        remove.addEventListener('click', () => {
          if (type === 'holiday'){
            removeHoliday(key);
          } else {
            removeWorkday(key);
          }
        });
        row.appendChild(label);
        row.appendChild(remove);
        container.appendChild(row);
      });
    }

    function shiftCalendarMonth(delta){
      let year = calendarState.currentYear;
      let month = calendarState.currentMonth + delta;
      while (month < 0){
        month += 12;
        year -= 1;
      }
      while (month > 11){
        month -= 12;
        year += 1;
      }
      const firstDayKey = formatDateKey(new Date(year, month, 1));
      calendarState.currentYear = year;
      calendarState.currentMonth = month;
      calendarState.selectedKey = firstDayKey;
      calendarSignature = '';
      updateCalendar(new Date());
    }

    function setCalendarMonth(year, month){
      calendarState.currentYear = year;
      calendarState.currentMonth = month;
      calendarSignature = '';
      updateCalendar(new Date());
    }

    function addHoliday(key){
      if (!key || !DATE_KEY_RE.test(key)) return;
      const holidays = state.prefs.calendar.holidays || [];
      if (!holidays.includes(key)) holidays.push(key);
      const workdays = state.prefs.calendar.workdays || [];
      const index = workdays.indexOf(key);
      if (index >= 0) workdays.splice(index, 1);
      savePrefs(state.prefs);
      calendarSignature = '';
      updateCalendar(new Date());
    }

    function addWorkday(key){
      if (!key || !DATE_KEY_RE.test(key)) return;
      const workdays = state.prefs.calendar.workdays || [];
      if (!workdays.includes(key)) workdays.push(key);
      const holidays = state.prefs.calendar.holidays || [];
      const index = holidays.indexOf(key);
      if (index >= 0) holidays.splice(index, 1);
      savePrefs(state.prefs);
      calendarSignature = '';
      updateCalendar(new Date());
    }

    function removeHoliday(key){
      const holidays = state.prefs.calendar.holidays || [];
      const index = holidays.indexOf(key);
      if (index >= 0){
        holidays.splice(index, 1);
        savePrefs(state.prefs);
        calendarSignature = '';
        updateCalendar(new Date());
      }
    }

    function removeWorkday(key){
      const workdays = state.prefs.calendar.workdays || [];
      const index = workdays.indexOf(key);
      if (index >= 0){
        workdays.splice(index, 1);
        savePrefs(state.prefs);
        calendarSignature = '';
        updateCalendar(new Date());
      }
    }

    prevMonthBtn.addEventListener('click', () => shiftCalendarMonth(-1));
    nextMonthBtn.addEventListener('click', () => shiftCalendarMonth(1));
    todayBtn.addEventListener('click', () => {
      const today = new Date();
      calendarState.currentYear = today.getFullYear();
      calendarState.currentMonth = today.getMonth();
      calendarState.selectedKey = formatDateKey(today);
      calendarSignature = '';
      updateCalendar(today);
    });

    holidaySection.addBtn.addEventListener('click', () => {
      addHoliday(holidaySection.dateInput.value);
      holidaySection.dateInput.value = '';
    });

    holidaySection.dateInput.addEventListener('keydown', event => {
      if (event.key === 'Enter'){
        event.preventDefault();
        addHoliday(holidaySection.dateInput.value);
        holidaySection.dateInput.value = '';
      }
    });

    workdaySection.addBtn.addEventListener('click', () => {
      addWorkday(workdaySection.dateInput.value);
      workdaySection.dateInput.value = '';
    });

    workdaySection.dateInput.addEventListener('keydown', event => {
      if (event.key === 'Enter'){
        event.preventDefault();
        addWorkday(workdaySection.dateInput.value);
        workdaySection.dateInput.value = '';
      }
    });

    renderCalendar(true);
    updateCalendar(initialDate);

    const xpNote = document.createElement('div');
    xpNote.style.fontSize = '13px';
    xpNote.style.color = '#475569';
    const xpNoteValues = Object.keys(XP_REWARDS).reduce((acc, key) => {
      acc[key] = formatNumberLocalized(XP_REWARDS[key], { maximumFractionDigits: 3 });
      return acc;
    }, {});
    xpNote.textContent = t(
      'xp.note',
      () => `秒:+${xpNoteValues.second} / 分:+${xpNoteValues.minute} / 時:+${xpNoteValues.hour} / 日:+${xpNoteValues.day} / 月:+${xpNoteValues.month} / 年:+${xpNoteValues.year} / 世紀:+${xpNoteValues.century} / 千年紀:+${xpNoteValues.millennium}`,
      xpNoteValues
    );
    detailSection.appendChild(xpNote);

    frame.appendChild(header);
    frame.appendChild(tabBar);
    frame.appendChild(contentArea);
    wrapper.appendChild(frame);
    root.appendChild(wrapper);

    switchTab('digital');
    switchDetailTab(prefs.detailTab);

    function switchTab(id){
      Object.keys(tabButtons).forEach(key => {
        const active = key === id;
        tabButtons[key].style.background = active ? 'linear-gradient(135deg, #2563eb, #38bdf8)' : 'rgba(255,255,255,0.85)';
        tabButtons[key].style.color = active ? '#ffffff' : '#1d4ed8';
        tabButtons[key].style.boxShadow = active ? '0 6px 18px rgba(37,99,235,0.35)' : 'none';
        tabContents[key].style.display = active ? 'flex' : 'none';
      });
    }

    function switchDetailTab(id){
      Object.keys(detailButtons).forEach(key => {
        const active = key === id;
        detailButtons[key].style.background = active ? 'linear-gradient(135deg, #818cf8, #6366f1)' : 'rgba(255,255,255,0.85)';
        detailButtons[key].style.color = active ? '#ffffff' : '#0f172a';
        detailButtons[key].style.boxShadow = active ? '0 6px 16px rgba(99,102,241,0.35)' : 'none';
        detailViews[key].style.display = active ? 'block' : 'none';
      });
      state.prefs.detailTab = id;
      savePrefs(state.prefs);
    }

    function update(){
      const now = new Date();
      const digitalFormatted = formatDigital(now, state.prefs.digitalFormat);
      if (digitalDateLine.textContent !== digitalFormatted.dateLine) digitalDateLine.textContent = digitalFormatted.dateLine;
      if (digitalTimeLine.textContent !== digitalFormatted.timeLine) digitalTimeLine.textContent = digitalFormatted.timeLine;

      drawAnalogClock(ctx, canvasSize, now, state.prefs.analogType);

      updateOverview(now);
      updateProgress(now);
      updateRemaining(now);
      updateStats(now);
      updateCalendar(now);
      updateXp(now);
    }

    function updateOverview(now){
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      const weekday = getWeekdayLabel(now.getDay());
      const eraLabel = getEra(now);
      const etoLabel = getEto(year);
      const imperial = year + 660;
      const season = getSeason(now.getMonth());
      const solarTerm = describeSolarTerm(now);
      const leapValue = getYesNo(isLeapYear(year));
      const lines = [
        t('overview.gregorian', () => `西暦: ${year}年 ${month}月${day}日（${weekday}）`, { year, month, day, weekday }),
        t('overview.era', () => `和暦: ${eraLabel}`, { era: eraLabel }),
        t('overview.eto', () => `干支: ${etoLabel}｜皇紀: ${imperial}`, { eto: etoLabel, imperial }),
        t('overview.season', () => `季節: ${season}｜二十四節気: ${solarTerm}`, { season, solarTerm }),
        t('overview.leapYear', () => `うるう年: ${leapValue}`, { value: leapValue })
      ];
      for (let i = 0; i < overviewLines.length; i++){
        overviewLines[i].textContent = lines[i] || '';
      }
    }

  function describeSolarTerm(now){
    const info = getSolarTermInfo(now);
    const prev = info.prev;
    const next = info.next;
    const diff = timeDiffComponents(next.date, now);
    const dateParts = {
      year: next.date.getFullYear(),
      month: next.date.getMonth() + 1,
      day: next.date.getDate()
    };
    const nextDate = t('solarTerms.nextDate', () => `${dateParts.year}年${dateParts.month}月${dateParts.day}日`, dateParts);
    const duration = formatDuration(diff);
    return t('solarTerms.description', () => `${prev.label} → 次は${next.label}（${nextDate}、${duration}）`, {
      previous: prev.label,
      next: next.label,
      nextDate,
      duration
    });
  }

    function updateProgress(now){
      const year = now.getFullYear();
      const month = now.getMonth();
      const day = now.getDate();
      const startOfDay = new Date(year, month, day);
      const endOfDay = new Date(year, month, day + 1);
      const startOfHour = new Date(year, month, day, now.getHours());
      const endOfHour = new Date(year, month, day, now.getHours() + 1);
      const startOfMinute = new Date(year, month, day, now.getHours(), now.getMinutes());
      const endOfMinute = new Date(year, month, day, now.getHours(), now.getMinutes() + 1);
      const startOfSecond = new Date(year, month, day, now.getHours(), now.getMinutes(), now.getSeconds());
      const endOfSecond = new Date(year, month, day, now.getHours(), now.getMinutes(), now.getSeconds() + 1);
      const startOfMonth = new Date(year, month, 1);
      const endOfMonth = new Date(year, month + 1, 1);
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year + 1, 0, 1);
      const centuryStartYear = Math.floor((year - 1) / 100) * 100 + 1;
      const centuryEndYear = centuryStartYear + 100;
      const decadeStartYear = Math.floor(year / 10) * 10;
      const decadeEndYear = decadeStartYear + 10;
      const millenniumStartYear = Math.floor((year - 1) / 1000) * 1000 + 1;
      const millenniumEndYear = millenniumStartYear + 1000;

      setProgress('second', elapsedFraction(startOfSecond, endOfSecond, now));
      setProgress('minute', elapsedFraction(startOfMinute, endOfMinute, now));
      setProgress('hour', elapsedFraction(startOfHour, endOfHour, now));
      setProgress('day', elapsedFraction(startOfDay, endOfDay, now));
      setProgress('month', elapsedFraction(startOfMonth, endOfMonth, now));
      setProgress('year', elapsedFraction(startOfYear, endOfYear, now));
      setProgress('decade', (year + elapsedFraction(startOfYear, endOfYear, now) - decadeStartYear) / (decadeEndYear - decadeStartYear));
      setProgress('century', (year + elapsedFraction(startOfYear, endOfYear, now) - centuryStartYear) / (centuryEndYear - centuryStartYear));
      setProgress('millennium', (year + elapsedFraction(startOfYear, endOfYear, now) - millenniumStartYear) / (millenniumEndYear - millenniumStartYear));
    }

    function setProgress(id, fraction){
      const row = progressRows[id];
      if (!row) return;
      const clamped = Math.max(0, Math.min(1, fraction));
      const percentValue = clamped * 100;
      const formatted = formatNumberLocalized(percentValue, {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4
      });
      const valueText = t('progress.percent', () => `${formatted}%`, { value: formatted });
      if (row.labelRight.textContent !== valueText) row.labelRight.textContent = valueText;
      row.bar.style.width = `${clamped * 100}%`;
    }

    function updateRemaining(now){
      REMAINING_CONFIG.forEach(item => {
        const target = item.compute(now);
        const diff = timeDiffComponents(target, now);
        const durationText = formatDuration(diff);
        const deltaText = t('remaining.delta', () => `（±${diff.millis}ms）`, { millis: diff.millis });
        const combined = t('remaining.value', () => `${durationText}${deltaText}`, {
          duration: durationText,
          delta: deltaText,
          millis: diff.millis
        });
        const node = remainingItems[item.id];
        if (node) node.textContent = combined;
      });
    }

    function updateStats(now){
      statsItems.unix.textContent = formatNumberLocalized(Math.floor(now.getTime() / 1000));
      statsItems.ticks.textContent = formatNumberLocalized(now.getTime());
      statsItems.iso.textContent = now.toISOString();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const dayOfYear = Math.floor((now - startOfYear) / 86400000) + 1;
      const dayOfYearFormatted = formatNumberLocalized(dayOfYear);
      statsItems.yearday.textContent = t('stats.yeardayValue', () => `${dayOfYearFormatted}日目`, { value: dayOfYearFormatted });
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const seconds = ((now - startOfDay) / 1000).toFixed(0);
      const secondsFormatted = formatNumberLocalized(Number(seconds));
      statsItems.daySeconds.textContent = t('stats.daySecondsValue', () => `${secondsFormatted}秒`, { value: secondsFormatted });
      statsItems.timezone.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone || t('stats.timezoneFallback', 'Local');
    }

    function updateCalendar(now){
      const todayText = formatLocalizedDate(now);
      calendarTodayLabel.textContent = t('calendar.today', () => `本日: ${todayText}`, { date: todayText });
      renderCalendar();
      updateCalendarCellStyles(now);
      updateCalendarDetail(now);
    }

    function updateXp(now){
      const segments = {
        second: now.getSeconds(),
        minute: now.getMinutes(),
        hour: now.getHours(),
        day: now.getDate(),
        month: now.getMonth(),
        year: now.getFullYear(),
        century: Math.floor((now.getFullYear() - 1) / 100),
        millennium: Math.floor((now.getFullYear() - 1) / 1000)
      };
      if (!lastSegments){
        lastSegments = segments;
        return;
      }
      let gained = 0;
      Object.keys(segments).forEach(key => {
        if (segments[key] !== lastSegments[key]){
          const reward = XP_REWARDS[key];
          if (reward){
            awardXp(reward);
            gained += reward;
          }
        }
      });
      if (gained){
        state.sessionXp += gained;
        setXpBadgeText(state.sessionXp);
      }
      lastSegments = segments;
    }

    function start(){
      if (state.running) return;
      state.running = true;
      timer = setInterval(update, UPDATE_INTERVAL);
      lastSegments = null;
      update();
    }

    function stop(){
      if (!state.running) return;
      state.running = false;
      if (timer){
        clearInterval(timer);
        timer = null;
      }
    }

    function destroy(){
      stop();
      try { wrapper.remove(); } catch {}
    }

    function quit(){
      destroy();
    }

    return { start, stop, destroy, quit };
  }

  window.registerMiniGame({
    id: 'clock_hub',
    name: '時計ハブ', nameKey: 'selection.miniexp.games.clock_hub.name',
    description: 'デジタル・アナログ・詳細情報を備えた時計ユーティリティ。時の節目でEXP獲得', descriptionKey: 'selection.miniexp.games.clock_hub.description', categoryIds: ['utility'],
    create
  });
})();

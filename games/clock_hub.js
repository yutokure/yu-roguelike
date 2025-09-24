(function(){
  const STORAGE_KEY = 'clock_hub_prefs_v1';
  const UPDATE_INTERVAL = 50;
  const DETAIL_TABS = [
    { id: 'overview', label: '概要' },
    { id: 'progress', label: '進捗率' },
    { id: 'remain', label: '残り時間' },
    { id: 'stats', label: '情報一覧' }
  ];
  const ERA_DATA = [
    { name: '令和', start: new Date(2019, 4, 1) },
    { name: '平成', start: new Date(1989, 0, 8) },
    { name: '昭和', start: new Date(1926, 11, 25) },
    { name: '大正', start: new Date(1912, 6, 30) },
    { name: '明治', start: new Date(1868, 0, 25) }
  ];
  const TENKAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const JUNISHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const WEEKDAY_JP = ['日', '月', '火', '水', '木', '金', '土'];
  const SOLAR_TERMS = [
    { label: '立春', month: 1, day: 4 },
    { label: '雨水', month: 1, day: 19 },
    { label: '啓蟄', month: 2, day: 5 },
    { label: '春分', month: 2, day: 20 },
    { label: '清明', month: 3, day: 4 },
    { label: '穀雨', month: 3, day: 19 },
    { label: '立夏', month: 4, day: 5 },
    { label: '小満', month: 4, day: 20 },
    { label: '芒種', month: 5, day: 5 },
    { label: '夏至', month: 5, day: 21 },
    { label: '小暑', month: 6, day: 6 },
    { label: '大暑', month: 6, day: 22 },
    { label: '立秋', month: 7, day: 7 },
    { label: '処暑', month: 7, day: 22 },
    { label: '白露', month: 8, day: 7 },
    { label: '秋分', month: 8, day: 23 },
    { label: '寒露', month: 9, day: 8 },
    { label: '霜降', month: 9, day: 23 },
    { label: '立冬', month: 10, day: 7 },
    { label: '小雪', month: 10, day: 22 },
    { label: '大雪', month: 11, day: 7 },
    { label: '冬至', month: 11, day: 21 },
    { label: '小寒', month: 0, day: 5 },
    { label: '大寒', month: 0, day: 20 }
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

  function loadPrefs(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      return {
        digitalFormat: parsed.digitalFormat === '12h' ? '12h' : '24h',
        analogType: parsed.analogType === '24h' ? '24h' : '12h',
        detailTab: DETAIL_TABS.some(tab => tab.id === parsed.detailTab) ? parsed.detailTab : 'overview'
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
        detailTab: prefs.detailTab
      }));
    } catch {}
  }

  function pad(num){
    return num.toString().padStart(2, '0');
  }

  function formatDigital(date, mode){
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = WEEKDAY_JP[date.getDay()];
    const dateLine = `${year}年${month}月${day}日（${weekday}）`;
    let timeLine = '';
    if (mode === '12h'){
      const hours24 = date.getHours();
      const am = hours24 < 12;
      let hours = hours24 % 12;
      if (hours === 0) hours = 12;
      timeLine = `${am ? '午前' : '午後'}${hours}時${pad(date.getMinutes())}分${pad(date.getSeconds())}秒`;
    } else {
      timeLine = `${pad(date.getHours())}時${pad(date.getMinutes())}分${pad(date.getSeconds())}秒`;
    }
    return { dateLine, timeLine };
  }

  function getEra(date){
    for (const era of ERA_DATA){
      if (date >= era.start){
        const eraYear = date.getFullYear() - era.start.getFullYear() + 1;
        return `${era.name}${eraYear}年`;
      }
    }
    return '不明';
  }

  function getEto(year){
    const stem = TENKAN[(year - 4) % 10];
    const branch = JUNISHI[(year - 4) % 12];
    return `${stem}${branch}`;
  }

  function getSeason(monthIndex){
    if (monthIndex === 11 || monthIndex <= 1) return '冬';
    if (monthIndex >= 2 && monthIndex <= 4) return '春';
    if (monthIndex >= 5 && monthIndex <= 7) return '夏';
    if (monthIndex >= 8 && monthIndex <= 10) return '秋';
    return '不明';
  }

  function getSolarTermInfo(date){
    const year = date.getFullYear();
    const terms = [];
    [-1, 0, 1].forEach(offset => {
      SOLAR_TERMS.forEach(item => {
        terms.push({ label: item.label, date: new Date(year + offset, item.month, item.day, 0, 0, 0) });
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
    const prefix = diff.sign >= 0 ? 'あと' : '前';
    const parts = [];
    if (diff.years) parts.push(`${diff.years}年`);
    if (diff.days) parts.push(`${diff.days}日`);
    if (diff.hours) parts.push(`${diff.hours}時間`);
    if (diff.minutes) parts.push(`${diff.minutes}分`);
    parts.push(`${diff.seconds}秒`);
    return `${prefix}${parts.join('')}`;
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
    if (!root) throw new Error('Clock Hub requires a container');
    const prefs = loadPrefs() || { digitalFormat: '24h', analogType: '12h', detailTab: 'overview' };
    const state = {
      running: false,
      sessionXp: 0,
      prefs
    };
    let timer = null;
    let lastSegments = null;

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
    title.textContent = '時計ユーティリティハブ';
    title.style.margin = '0';
    title.style.fontSize = '24px';
    title.style.color = '#0f172a';
    const subtitle = document.createElement('div');
    subtitle.style.fontSize = '14px';
    subtitle.style.color = '#475569';
    subtitle.textContent = 'デジタル／アナログ／詳細情報を切り替え';
    titleBox.appendChild(title);
    titleBox.appendChild(subtitle);

    const xpBadge = document.createElement('div');
    xpBadge.style.padding = '6px 12px';
    xpBadge.style.background = '#1d4ed8';
    xpBadge.style.color = '#ffffff';
    xpBadge.style.borderRadius = '999px';
    xpBadge.style.fontWeight = '600';
    xpBadge.textContent = '獲得EXP: 0';

    header.appendChild(titleBox);
    header.appendChild(xpBadge);

    const tabBar = document.createElement('div');
    tabBar.style.display = 'flex';
    tabBar.style.gap = '8px';
    tabBar.style.padding = '16px 24px 0 24px';
    tabBar.style.background = 'rgba(255,255,255,0.8)';

    const tabButtons = {};
    const tabContents = {};
    const tabIds = ['digital', 'analog', 'detail'];
    const tabLabels = { digital: 'デジタル時計', analog: 'アナログ時計', detail: '詳細' };

    const contentArea = document.createElement('div');
    contentArea.style.flex = '1';
    contentArea.style.display = 'flex';
    contentArea.style.flexDirection = 'column';
    contentArea.style.padding = '24px 28px 32px';
    contentArea.style.gap = '24px';

    tabIds.forEach(id => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = tabLabels[id];
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
      label.appendChild(document.createTextNode(mode === '24h' ? '24時間制' : '12時間制'));
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
      label.appendChild(document.createTextNode(mode === '12h' ? '通常アナログ時計' : '24時間制アナログ時計'));
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
      btn.textContent = tab.label;
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
    const progressItems = [
      { id: 'millennium', label: '千年紀' },
      { id: 'century', label: '世紀' },
      { id: 'decade', label: '年代' },
      { id: 'year', label: '年' },
      { id: 'month', label: '月' },
      { id: 'day', label: '日' },
      { id: 'hour', label: '時' },
      { id: 'minute', label: '分' },
      { id: 'second', label: '秒' }
    ];
    progressItems.forEach(item => {
      const row = createProgressRow();
      row.labelLeft.textContent = item.label;
      progressContainer.appendChild(row.row);
      progressRows[item.id] = row;
    });

    const remainingItems = {};
    ['次の秒', '次の分', '次の時', '次の日', '次の月', '次の年'].forEach(label => {
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
      titleLabel.textContent = label;

      const value = document.createElement('div');
      value.style.fontSize = '16px';
      value.style.fontWeight = '600';
      value.style.color = '#0f172a';

      card.appendChild(titleLabel);
      card.appendChild(value);
      remainingList.appendChild(card);
      remainingItems[label] = value;
    });

    const statsItems = {};
    const statsLabels = {
      unix: 'UNIX時間',
      ticks: '経過ミリ秒',
      iso: 'ISO 8601',
      yearday: '年内通算日',
      daySeconds: '今日の経過秒',
      timezone: 'タイムゾーン'
    };
    Object.keys(statsLabels).forEach(key => {
      const line = document.createElement('div');
      line.style.display = 'flex';
      line.style.justifyContent = 'space-between';
      line.style.fontSize = '14px';
      line.style.color = '#0f172a';
      const label = document.createElement('span');
      label.textContent = statsLabels[key];
      const value = document.createElement('span');
      value.style.fontFamily = '"Roboto Mono", "Cascadia Code", monospace';
      line.appendChild(label);
      line.appendChild(value);
      statsList.appendChild(line);
      statsItems[key] = value;
    });

    const xpNote = document.createElement('div');
    xpNote.style.fontSize = '13px';
    xpNote.style.color = '#475569';
    xpNote.textContent = '秒:+0.5 / 分:+50 / 時:+980 / 日:+7690 / 月:+32768 / 年:+260000 / 世紀:+10000000 / 千年紀:+100000000';
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
      updateXp(now);
    }

    function updateOverview(now){
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      const lines = [
        `西暦: ${year}年 ${month}月${day}日（${WEEKDAY_JP[now.getDay()]}）`,
        `和暦: ${getEra(now)}`,
        `干支: ${getEto(year)}｜皇紀: ${year + 660}`,
        `季節: ${getSeason(now.getMonth())}｜二十四節気: ${describeSolarTerm(now)}`,
        `うるう年: ${isLeapYear(year) ? 'はい' : 'いいえ'}`
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
      const nextDate = `${next.date.getFullYear()}年${next.date.getMonth() + 1}月${next.date.getDate()}日`;
      return `${prev.label} → 次は${next.label}（${nextDate}、${formatDuration(diff)}）`;
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
      const percent = (clamped * 100).toFixed(4);
      const valueText = `${percent}%`;
      if (row.labelRight.textContent !== valueText) row.labelRight.textContent = valueText;
      row.bar.style.width = `${clamped * 100}%`;
    }

    function updateRemaining(now){
      const year = now.getFullYear();
      const month = now.getMonth();
      const day = now.getDate();
      const targets = {
        '次の秒': new Date(now.getTime() + 1000 - now.getMilliseconds()),
        '次の分': new Date(year, month, day, now.getHours(), now.getMinutes() + 1),
        '次の時': new Date(year, month, day, now.getHours() + 1),
        '次の日': new Date(year, month, day + 1),
        '次の月': new Date(year, month + 1, 1),
        '次の年': new Date(year + 1, 0, 1)
      };
      Object.keys(targets).forEach(label => {
        const diff = timeDiffComponents(targets[label], now);
        remainingItems[label].textContent = `${formatDuration(diff)}（±${diff.millis}ms）`;
      });
    }

    function updateStats(now){
      statsItems.unix.textContent = Math.floor(now.getTime() / 1000).toString();
      statsItems.ticks.textContent = now.getTime().toString();
      statsItems.iso.textContent = now.toISOString();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const dayOfYear = Math.floor((now - startOfYear) / 86400000) + 1;
      statsItems.yearday.textContent = `${dayOfYear}日目`;
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const seconds = ((now - startOfDay) / 1000).toFixed(0);
      statsItems.daySeconds.textContent = `${seconds}秒`;
      statsItems.timezone.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
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
        xpBadge.textContent = `獲得EXP: ${state.sessionXp.toLocaleString()}`;
      }
      lastSegments = segments;
    }

    timer = setInterval(update, UPDATE_INTERVAL);
    state.running = true;
    update();

    function quit(){
      if (!state.running) return;
      clearInterval(timer);
      state.running = false;
      wrapper.remove();
    }

    return { quit };
  }

  window.registerMiniGame({
    id: 'clock_hub',
    name: '時計ハブ',
    description: 'デジタル・アナログ・詳細情報を備えた時計ユーティリティ。時の節目でEXP獲得',
    create
  });
})();

(function(){
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 320;
  const HIT_CIRCLE_X = 180;
  const NOTE_TRAVEL_TIME = 2200; // ms from spawn to hit circle
  const DON_COLOR = '#fb7185';
  const KA_COLOR = '#38bdf8';
  const BIG_RING_COLOR = '#facc15';

  const DIFFICULTIES = {
    EASY: {
      bpm: 110,
      chart: `d---d-k---d-k---|d---d-k---d-k---|d-dk-d-dk-d---k---|d---k---d---d---`,
      goodWindow: 46,
      okWindow: 96,
      passWindow: 140,
      comboBonus: 0.24,
      baseExp: { 良: 5.8, 可: 3.2, 普: 1.4 },
      bigNoteBonus: 2.4
    },
    NORMAL: {
      bpm: 132,
      chart: `d-dk-dk-dK-dk-dk|d-kd-dk-dK-dk--|d-dk-dk-dK-dk-dk|d---k-d--dK-d---`,
      goodWindow: 42,
      okWindow: 84,
      passWindow: 128,
      comboBonus: 0.32,
      baseExp: { 良: 6.6, 可: 3.6, 普: 1.6 },
      bigNoteBonus: 2.8
    },
    HARD: {
      bpm: 152,
      chart: `dK-dk-dK-dk-dK-dk|dK-dk-dK-dk-dK-dk|dK-dk-d-dK-dk-dK|d-kd-dK-dk-dK-d-`,
      goodWindow: 36,
      okWindow: 72,
      passWindow: 118,
      comboBonus: 0.38,
      baseExp: { 良: 7.4, 可: 4.0, 普: 1.8 },
      bigNoteBonus: 3.0
    }
  };

  const KEY_BINDINGS = {
    don: ['f', 'j', ' '],
    ka: ['d', 'k']
  };

  const POINTER_REGIONS = {
    don: { x: HIT_CIRCLE_X - 36, y: CANVAS_HEIGHT / 2 - 36, size: 72 },
    ka: { x: HIT_CIRCLE_X + 48, y: CANVAS_HEIGHT / 2 - 36, size: 72 }
  };

  const judgementOrder = ['良', '可', '普', '不'];
  const judgementPriority = judgementOrder.reduce((map, name, idx) => { map[name] = idx; return map; }, {});

  const JUDGEMENT_TEXT_META = {
    '良': { key: '.judgement.good', fallback: '良' },
    '可': { key: '.judgement.ok', fallback: '可' },
    '普': { key: '.judgement.pass', fallback: '普' },
    '不': { key: '.judgement.miss', fallback: '不' }
  };

  const DIFFICULTY_TEXT_META = {
    EASY: { key: '.difficulty.easy', fallback: 'EASY' },
    NORMAL: { key: '.difficulty.normal', fallback: 'NORMAL' },
    HARD: { key: '.difficulty.hard', fallback: 'HARD' }
  };

  function parseChart(def, bpm){
    const beatLength = 60000 / bpm; // quarter note
    const step = beatLength / 4; // 16th resolution
    let time = 0;
    const notes = [];
    for (const ch of def.replace(/\s+/g, '')){
      if (ch === '|') {
        continue;
      }
      if (ch === '-') {
        time += step;
        continue;
      }
      const big = ch === 'D' || ch === 'K';
      const type = (ch === 'd' || ch === 'D') ? 'don' : 'ka';
      notes.push({ time, type, big, hit: false, judged: false, expAwarded: false, hitCount: 0, bestJudgement: null, firstHitTs: null });
      time += step;
    }
    return notes;
  }

  function createResultHud(){
    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.flexWrap = 'wrap';
    wrap.style.gap = '12px';
    wrap.style.alignItems = 'center';
    wrap.style.justifyContent = 'space-between';
    wrap.style.background = 'rgba(15,23,42,0.6)';
    wrap.style.color = '#e2e8f0';
    wrap.style.padding = '10px 14px';
    wrap.style.borderRadius = '12px';
    wrap.style.fontFamily = "'Segoe UI', 'Yu Gothic UI', sans-serif";
    wrap.style.fontSize = '14px';
    return wrap;
  }

  function create(root, awardXp, opts){
    const difficulty = (opts && opts.difficulty) || 'NORMAL';
    const cfg = { ...DIFFICULTIES.NORMAL, ...(DIFFICULTIES[difficulty] || {}) };

    const localization = (opts && opts.localization) || (typeof window !== 'undefined' && typeof window.createMiniGameLocalization === 'function'
      ? window.createMiniGameLocalization({ id: 'taiko_drum' })
      : null);
    const text = (key, fallback, params) => {
      if (localization && typeof localization.t === 'function'){
        return localization.t(key, fallback, params);
      }
      if (typeof fallback === 'function') return fallback();
      return fallback ?? '';
    };
    const formatNumber = (value, options) => {
      if (localization && typeof localization.formatNumber === 'function'){
        try {
          return localization.formatNumber(value, options);
        } catch {}
      }
      try {
        const locale = localization && typeof localization.getLocale === 'function'
          ? localization.getLocale()
          : undefined;
        return new Intl.NumberFormat(locale, options).format(value);
      } catch {
        if (value == null || Number.isNaN(value)) return '0';
        if (typeof value === 'number') return value.toString();
        return String(value);
      }
    };
    const formatTemplate = (template, params = {}) => {
      const str = template == null ? '' : String(template);
      return str.replace(/\{([^{}]+)\}/g, (_, key) => {
        const normalized = key.trim();
        if (!normalized) return '';
        const value = params.hasOwnProperty(normalized) ? params[normalized] : '';
        return value == null ? '' : String(value);
      });
    };

    let labelCache = null;
    let cachedLocale = null;
    const difficultyOptionNodes = new Map();
    let detachLocale = null;
    let lastHudProgress = 0;
    let lastClearBonus = 0;
    let lastGoodRate = 0;

    const refreshLabelCache = (force = false) => {
      const localeId = localization && typeof localization.getLocale === 'function'
        ? localization.getLocale()
        : 'default';
      if (!force && labelCache && cachedLocale === localeId) return labelCache;
      cachedLocale = localeId;
      labelCache = {
        titleTemplate: text('.title', '太鼓リズム（{difficulty}）'),
        tips: text('.tips', 'F/J/Space = ドン（赤）、D/K = カッ（青）。大音符は両方同時！タップもOK。'),
        difficultyLabel: text('.controls.difficultyLabel', '難易度'),
        startLabel: text('.buttons.start', 'スタート'),
        progressTemplate: text('.hud.progressTemplate', '{label}: {value}%'),
        progressLabel: text('.hud.progressLabel', '進行度'),
        judgementTemplate: text('.hud.judgementTemplate', '{goodLabel}: {good} / {okLabel}: {ok} / {passLabel}: {pass} / {missLabel}: {miss}'),
        comboTemplate: text('.hud.comboTemplate', '{comboLabel}: {combo} ({maxLabel} {maxCombo}) | {accuracyLabel}: {accuracy}% | {expLabel}: {exp}'),
        comboLabel: text('.hud.comboLabel', 'コンボ'),
        maxLabel: text('.hud.maxComboLabel', '最大'),
        accuracyLabel: text('.hud.accuracyLabel', '精度'),
        expLabel: text('.hud.expLabel', 'EXP'),
        judgementLabels: Object.fromEntries(judgementOrder.map((name) => {
          const meta = JUDGEMENT_TEXT_META[name];
          return [name, meta ? text(meta.key, meta.fallback) : name];
        })),
        difficultyOptions: Object.fromEntries(Object.entries(DIFFICULTY_TEXT_META).map(([id, meta]) => [id, text(meta.key, meta.fallback)])),
        resultTitle: text('.result.title', '結果'),
        resultJudgementTemplate: text('.result.judgementTemplate', '{goodLabel}: {good} / {okLabel}: {ok} / {passLabel}: {pass} / {missLabel}: {miss}'),
        resultSummaryTemplate: text('.result.summaryTemplate', '{maxLabel} {maxCombo} | {totalExpLabel} {score} ({bonusLabel} {clearBonus}) | {goodRateLabel} {rate}%'),
        totalExpLabel: text('.result.totalExpLabel', '総EXP'),
        clearBonusLabel: text('.result.clearBonusLabel', 'クリアボーナス'),
        goodRateLabel: text('.result.goodRateLabel', '良率')
      };
      return labelCache;
    };

    const resolveDifficultyLabel = (id) => {
      const cache = refreshLabelCache();
      return (cache.difficultyOptions && cache.difficultyOptions[id]) || id;
    };

    const getJudgementLabel = (name) => {
      const cache = refreshLabelCache();
      return (cache.judgementLabels && cache.judgementLabels[name]) || name;
    };

    const container = document.createElement('div');
    container.style.maxWidth = CANVAS_WIDTH + 'px';
    container.style.margin = '0 auto';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '12px';

    const baseFont = "'Segoe UI', 'Yu Gothic UI', sans-serif";

    const headerCard = document.createElement('div');
    headerCard.style.display = 'flex';
    headerCard.style.flexDirection = 'column';
    headerCard.style.alignItems = 'center';
    headerCard.style.gap = '8px';
    headerCard.style.padding = '12px 18px';
    headerCard.style.borderRadius = '16px';
    headerCard.style.background = 'rgba(15,23,42,0.9)';
    headerCard.style.border = '1px solid rgba(148,163,184,0.4)';
    headerCard.style.boxShadow = '0 14px 28px rgba(15,23,42,0.35)';

    const title = document.createElement('h2');
    title.style.margin = '0';
    title.style.fontSize = '20px';
    title.style.textAlign = 'center';
    title.style.color = '#f8fafc';
    title.style.fontFamily = baseFont;
    headerCard.appendChild(title);

    const tips = document.createElement('div');
    tips.style.fontSize = '12px';
    tips.style.color = 'rgba(226,232,240,0.85)';
    tips.style.textAlign = 'center';
    tips.style.fontFamily = baseFont;
    headerCard.appendChild(tips);

    container.appendChild(headerCard);

    const hud = createResultHud();
    container.appendChild(hud);
    let resultNode = null;

    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    canvas.style.background = '#0f172a';
    canvas.style.borderRadius = '16px';
    canvas.style.boxShadow = '0 12px 28px rgba(8,11,30,0.5)';
    canvas.style.touchAction = 'none';
    container.appendChild(canvas);

    const controlRow = document.createElement('div');
    controlRow.style.display = 'flex';
    controlRow.style.gap = '8px';
    controlRow.style.justifyContent = 'center';
    controlRow.style.alignItems = 'center';
    controlRow.style.flexWrap = 'wrap';

    const diffLabel = document.createElement('label');
    diffLabel.style.color = '#cbd5f5';
    diffLabel.style.fontFamily = hud.style.fontFamily;
    controlRow.appendChild(diffLabel);

    const select = document.createElement('select');
    select.style.padding = '6px 10px';
    select.style.borderRadius = '8px';
    select.style.background = '#1f2937';
    select.style.color = '#e2e8f0';
    select.style.border = '1px solid rgba(148,163,184,0.4)';
    select.style.fontFamily = hud.style.fontFamily;
    for (const key of Object.keys(DIFFICULTIES)){
      const option = document.createElement('option');
      option.value = key;
      option.textContent = resolveDifficultyLabel(key);
      if (key === difficulty) option.selected = true;
      select.appendChild(option);
      difficultyOptionNodes.set(key, option);
    }
    controlRow.appendChild(select);

    const startBtn = document.createElement('button');
    startBtn.style.padding = '6px 12px';
    startBtn.style.borderRadius = '8px';
    startBtn.style.border = 'none';
    startBtn.style.background = '#34d399';
    startBtn.style.color = '#0f172a';
    startBtn.style.fontWeight = '600';
    startBtn.style.cursor = 'pointer';
    controlRow.appendChild(startBtn);
    container.appendChild(controlRow);

    root.appendChild(container);

    const updateTitle = () => {
      const cache = refreshLabelCache();
      const difficultyLabel = resolveDifficultyLabel(select.value || difficulty || 'NORMAL');
      title.textContent = formatTemplate(cache.titleTemplate || '{difficulty}', { difficulty: difficultyLabel });
    };

    const updateLocalizedStaticTexts = () => {
      const cache = refreshLabelCache(true);
      tips.textContent = cache.tips;
      diffLabel.textContent = cache.difficultyLabel;
      startBtn.textContent = cache.startLabel;
      for (const [id, node] of difficultyOptionNodes.entries()){
        if (node) node.textContent = resolveDifficultyLabel(id);
      }
      updateTitle();
      updateHud(lastHudProgress);
      renderResultSummary();
    };

    const ctx = canvas.getContext('2d');

    let notes = parseChart(cfg.chart, cfg.bpm);
    let running = false;
    let startTime = 0;
    let raf = null;
    let currentCfg = cfg;
    let totalDuration = notes.length ? notes[notes.length - 1].time + 4000 : 0;
    let pointerActive = null;

    const stats = {
      良: 0,
      可: 0,
      普: 0,
      不: 0,
      combo: 0,
      maxCombo: 0,
      score: 0,
      totalNotes: notes.length
    };

    const formatInteger = (value) => {
      return formatNumber(Number.isFinite(value) ? value : 0, { maximumFractionDigits: 0 });
    };

    const formatDecimal = (value, digits = 1) => {
      return formatNumber(Number.isFinite(value) ? value : 0, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
      });
    };

    const createJudgementParams = () => {
      const cache = refreshLabelCache();
      return {
        goodLabel: getJudgementLabel('良'),
        good: formatInteger(stats.良),
        okLabel: getJudgementLabel('可'),
        ok: formatInteger(stats.可),
        passLabel: getJudgementLabel('普'),
        pass: formatInteger(stats.普),
        missLabel: getJudgementLabel('不'),
        miss: formatInteger(stats.不)
      };
    };

    function renderResultSummary(){
      if (!resultNode) return;
      const cache = refreshLabelCache();
      const judgementLine = formatTemplate((cache.resultJudgementTemplate || cache.judgementTemplate || ''), createJudgementParams());
      const summaryLine = formatTemplate(cache.resultSummaryTemplate || '{maxLabel} {maxCombo}', {
        maxLabel: cache.maxLabel,
        maxCombo: formatInteger(stats.maxCombo),
        totalExpLabel: cache.totalExpLabel,
        score: formatDecimal(stats.score, 1),
        bonusLabel: cache.clearBonusLabel,
        clearBonus: formatDecimal(lastClearBonus, 1),
        goodRateLabel: cache.goodRateLabel,
        rate: formatInteger(lastGoodRate)
      });
      resultNode.innerHTML = `${cache.resultTitle}: ${judgementLine}<br>${summaryLine}`;
    }

    function resetStats(){
      for (const key of judgementOrder){
        stats[key] = 0;
      }
      stats.combo = 0;
      stats.maxCombo = 0;
      stats.score = 0;
      stats.totalNotes = notes.length;
      updateHud(0);
    }

    function updateHud(progress){
      lastHudProgress = progress;
      const cache = refreshLabelCache();
      const clamped = Math.max(0, Math.min(progress || 0, 1));
      const progressValue = formatDecimal(clamped * 100, 1);
      const accuracy = stats.totalNotes === 0 ? 0 : ((stats.良 + 0.6 * stats.可 + 0.3 * stats.普) / stats.totalNotes) * 100;
      const accuracyText = formatDecimal(accuracy, 1);
      const comboText = formatInteger(stats.combo);
      const maxComboText = formatInteger(stats.maxCombo);
      const expText = formatDecimal(stats.score, 1);
      const progressLine = formatTemplate(cache.progressTemplate || '{label}: {value}%', {
        label: cache.progressLabel,
        value: progressValue
      });
      const judgementLine = formatTemplate(cache.judgementTemplate || '{goodLabel}: {good} / {okLabel}: {ok} / {passLabel}: {pass} / {missLabel}: {miss}', createJudgementParams());
      const comboLine = formatTemplate(cache.comboTemplate || '{comboLabel}: {combo} ({maxLabel} {maxCombo}) | {accuracyLabel}: {accuracy}% | {expLabel}: {exp}', {
        comboLabel: cache.comboLabel,
        combo: comboText,
        maxLabel: cache.maxLabel,
        maxCombo: maxComboText,
        accuracyLabel: cache.accuracyLabel,
        accuracy: accuracyText,
        expLabel: cache.expLabel,
        exp: expText
      });
      hud.innerHTML = `${progressLine}<br>${judgementLine}<br>${comboLine}`;
    }

    function getJudgement(diffMs){
      const ad = Math.abs(diffMs);
      if (ad <= currentCfg.goodWindow) return '良';
      if (ad <= currentCfg.okWindow) return '可';
      if (ad <= currentCfg.passWindow) return '普';
      return '不';
    }

    function awardForJudgement(judgement, note, comboBefore){
      if (!awardXp) return;
      if (judgement === '不') return;
      const base = currentCfg.baseExp[judgement];
      const comboBonus = comboBefore * currentCfg.comboBonus;
      const bigBonus = note.big ? currentCfg.bigNoteBonus : 0;
      const gain = base + comboBonus + bigBonus;
      stats.score += gain;
      awardXp(gain, {
        type: 'judgement',
        grade: judgement,
        combo: stats.combo,
        big: note.big
      });
    }

    function handleHit(type){
      if (!running) return;
      const now = performance.now();
      const elapsed = now - startTime;
      const windowLimit = currentCfg.passWindow + 60;
      let candidate = null;
      let candidateDiff = Infinity;
      for (const note of notes){
        if (note.judged) continue;
        if (note.type !== type) continue;
        const diff = note.time - elapsed;
        if (Math.abs(diff) < Math.abs(candidateDiff)){
          candidate = note;
          candidateDiff = diff;
        }
      }
      if (!candidate) return;
      if (Math.abs(candidateDiff) > windowLimit) return;

      const judgement = getJudgement(candidateDiff);
      if (candidate.big){
        if (judgement === '不'){
          registerMiss(candidate);
          return;
        }
        candidate.hitCount += 1;
        candidate.firstHitTs = candidate.firstHitTs || now;
        if (!candidate.bestJudgement){
          candidate.bestJudgement = judgement;
        } else {
          const currentPriority = judgementPriority[candidate.bestJudgement];
          const newPriority = judgementPriority[judgement];
          if (newPriority > currentPriority){
            candidate.bestJudgement = judgement;
          }
        }
        flashHit(type, 1);
        if (candidate.hitCount >= 2 && Math.abs(now - candidate.firstHitTs) <= currentCfg.passWindow){
          finalizeHit(candidate, candidate.bestJudgement);
        }
        return;
      }

      if (judgement === '不'){
        registerMiss(candidate);
        return;
      }
      finalizeHit(candidate, judgement);
    }

    function finalizeHit(note, judgement){
      note.hit = true;
      note.judged = true;
      stats[judgement] += 1;
      stats.combo += 1;
      if (stats.combo > stats.maxCombo) stats.maxCombo = stats.combo;
      awardForJudgement(judgement, note, stats.combo - 1);
      updateHud(Math.min((performance.now() - startTime) / totalDuration, 1));
      flashHit(note.type, note.big ? 1 : 0);
    }

    function registerMiss(note){
      note.judged = true;
      note.hit = false;
      note.hitCount = 0;
      note.bestJudgement = null;
      note.firstHitTs = null;
      stats['不'] += 1;
      stats.combo = 0;
      updateHud(Math.min((performance.now() - startTime) / totalDuration, 1));
      if (awardXp){
        awardXp(0, { type: 'miss' });
      }
    }

    let laneFlash = { don: 0, ka: 0 };

    function flashHit(type, intensity){
      const base = type === 'don' ? 'don' : 'ka';
      laneFlash[base] = 0.9 + intensity * 0.4;
      if (intensity > 0){
        laneFlash[base === 'don' ? 'ka' : 'don'] = Math.max(laneFlash[base === 'don' ? 'ka' : 'don'], 0.5);
      }
    }

    function draw(now){
      const elapsed = now - startTime;
      const progress = totalDuration ? Math.min(elapsed / totalDuration, 1) : 0;
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // track lines
      ctx.strokeStyle = 'rgba(148,163,184,0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(HIT_CIRCLE_X, 40);
      ctx.lineTo(HIT_CIRCLE_X, CANVAS_HEIGHT - 40);
      ctx.stroke();

      // progress bar
      ctx.fillStyle = 'rgba(59,130,246,0.3)';
      ctx.fillRect(40, CANVAS_HEIGHT - 24, (CANVAS_WIDTH - 80) * progress, 8);
      ctx.strokeStyle = 'rgba(59,130,246,0.8)';
      ctx.strokeRect(40, CANVAS_HEIGHT - 24, CANVAS_WIDTH - 80, 8);

      const lanePulseDon = Math.max(laneFlash.don - 0.02, 0);
      const lanePulseKa = Math.max(laneFlash.ka - 0.02, 0);
      laneFlash.don = lanePulseDon;
      laneFlash.ka = lanePulseKa;

      const donGradient = ctx.createRadialGradient(HIT_CIRCLE_X, CANVAS_HEIGHT/2, 10, HIT_CIRCLE_X, CANVAS_HEIGHT/2, 70);
      donGradient.addColorStop(0, `rgba(251,113,133,${0.2 + lanePulseDon})`);
      donGradient.addColorStop(1, 'rgba(251,113,133,0)');
      ctx.fillStyle = donGradient;
      ctx.beginPath();
      ctx.arc(HIT_CIRCLE_X, CANVAS_HEIGHT / 2, 70, 0, Math.PI * 2);
      ctx.fill();

      const kaGradient = ctx.createRadialGradient(HIT_CIRCLE_X + 120, CANVAS_HEIGHT/2, 10, HIT_CIRCLE_X + 120, CANVAS_HEIGHT/2, 70);
      kaGradient.addColorStop(0, `rgba(56,189,248,${0.2 + lanePulseKa})`);
      kaGradient.addColorStop(1, 'rgba(56,189,248,0)');
      ctx.fillStyle = kaGradient;
      ctx.beginPath();
      ctx.arc(HIT_CIRCLE_X + 120, CANVAS_HEIGHT / 2, 70, 0, Math.PI * 2);
      ctx.fill();

      // hit circles
      ctx.fillStyle = DON_COLOR;
      ctx.beginPath();
      ctx.arc(HIT_CIRCLE_X, CANVAS_HEIGHT/2, 38, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = KA_COLOR;
      ctx.beginPath();
      ctx.arc(HIT_CIRCLE_X + 120, CANVAS_HEIGHT/2, 32, 0, Math.PI * 2);
      ctx.fill();

      const spawnX = CANVAS_WIDTH + 60;
      for (const note of notes){
        if (note.judged) continue;
        const timeUntil = note.time - elapsed;
        if (timeUntil < -currentCfg.passWindow - 120){
          if (!note.judged) registerMiss(note);
          continue;
        }
        if (timeUntil > NOTE_TRAVEL_TIME) continue;
        const travelProgress = Math.min(Math.max(1 - timeUntil / NOTE_TRAVEL_TIME, 0), 1);
        const x = spawnX - (spawnX - HIT_CIRCLE_X) * travelProgress;
        const y = CANVAS_HEIGHT / 2;
        const color = note.type === 'don' ? DON_COLOR : KA_COLOR;
        const radius = note.big ? 42 : 28;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        if (note.big){
          ctx.strokeStyle = BIG_RING_COLOR;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(x, y, radius + 8, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      updateHud(progress);

      for (const note of notes){
        if (!note.big || note.judged) continue;
        if (note.hitCount > 0 && note.firstHitTs && now - note.firstHitTs > currentCfg.passWindow){
          registerMiss(note);
        }
      }

      if (elapsed >= totalDuration && running){
        finishGame();
      } else if (running){
        raf = requestAnimationFrame(draw);
      }
    }

    function finishGame(){
      running = false;
      if (raf){
        cancelAnimationFrame(raf);
        raf = null;
      }
      if (resultNode && resultNode.parentElement){
        resultNode.parentElement.removeChild(resultNode);
      }
      const clearBonus = Math.max(0, 10 + stats.maxCombo * 0.6 + stats.良 * 0.4);
      if (awardXp && clearBonus > 0){
        stats.score += clearBonus;
        awardXp(clearBonus, { type: 'clear', combo: stats.maxCombo, good: stats.良 });
      } else {
        stats.score += clearBonus;
      }

      const summary = document.createElement('div');
      summary.style.background = 'rgba(30,41,59,0.8)';
      summary.style.color = '#f1f5f9';
      summary.style.padding = '12px';
      summary.style.borderRadius = '10px';
      summary.style.marginTop = '8px';
      summary.style.fontFamily = hud.style.fontFamily;
      const rate = stats.totalNotes ? Math.round((stats.良 / stats.totalNotes) * 100) : 0;
      lastClearBonus = clearBonus;
      lastGoodRate = rate;
      container.appendChild(summary);
      resultNode = summary;
      renderResultSummary();
      updateHud(1);
      startBtn.disabled = false;
      select.disabled = false;
    }

    function startGame(){
      if (running) return;
      if (resultNode && resultNode.parentElement){
        resultNode.parentElement.removeChild(resultNode);
        resultNode = null;
      }
      lastClearBonus = 0;
      lastGoodRate = 0;
      startBtn.disabled = true;
      select.disabled = true;
      laneFlash = { don: 0, ka: 0 };
      notes = parseChart(currentCfg.chart, currentCfg.bpm);
      totalDuration = notes.length ? notes[notes.length - 1].time + 4000 : 0;
      resetStats();
      running = true;
      startTime = performance.now() + 600;
      if (raf){
        cancelAnimationFrame(raf);
      }
      raf = requestAnimationFrame(function step(ts){
        if (!running) return;
        if (ts < startTime){
          raf = requestAnimationFrame(step);
          return;
        }
        draw(ts);
      });
    }

    startBtn.addEventListener('click', () => {
      const selected = select.value;
      currentCfg = { ...DIFFICULTIES.NORMAL, ...(DIFFICULTIES[selected] || DIFFICULTIES.NORMAL) };
      startGame();
    });

    select.addEventListener('change', () => {
      if (running) return;
      const selected = select.value;
      currentCfg = { ...DIFFICULTIES.NORMAL, ...(DIFFICULTIES[selected] || DIFFICULTIES.NORMAL) };
      notes = parseChart(currentCfg.chart, currentCfg.bpm);
      totalDuration = notes.length ? notes[notes.length - 1].time + 4000 : 0;
      resetStats();
      updateTitle();
    });

    function keyHandler(e){
      const key = e.key.toLowerCase();
      if (KEY_BINDINGS.don.includes(key)){
        handleHit('don');
        e.preventDefault();
      } else if (KEY_BINDINGS.ka.includes(key)){
        handleHit('ka');
        e.preventDefault();
      }
    }

    document.addEventListener('keydown', keyHandler);

    function pointerDown(e){
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (isInside(x, y, POINTER_REGIONS.don)){
        handleHit('don');
        pointerActive = 'don';
      } else if (isInside(x, y, POINTER_REGIONS.ka)){
        handleHit('ka');
        pointerActive = 'ka';
      }
    }

    function pointerUp(){
      pointerActive = null;
    }

    function pointerMove(e){
      if (!pointerActive) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const region = POINTER_REGIONS[pointerActive];
      if (!isInside(x, y, region)){
        pointerActive = null;
      }
    }

    canvas.addEventListener('pointerdown', pointerDown);
    window.addEventListener('pointerup', pointerUp);
    canvas.addEventListener('pointermove', pointerMove);

    updateLocalizedStaticTexts();
    if (localization && typeof localization.onChange === 'function'){
      detachLocale = localization.onChange(() => {
        try {
          updateLocalizedStaticTexts();
        } catch (error) {
          console.warn('[MiniExp][taiko_drum] Failed to refresh locale:', error);
        }
      });
    }

    function isInside(px, py, region){
      return px >= region.x && px <= region.x + region.size && py >= region.y && py <= region.y + region.size;
    }

    resetStats();

    return {
      destroy(){
        running = false;
        if (raf){
          cancelAnimationFrame(raf);
          raf = null;
        }
        document.removeEventListener('keydown', keyHandler);
        canvas.removeEventListener('pointerdown', pointerDown);
        window.removeEventListener('pointerup', pointerUp);
        canvas.removeEventListener('pointermove', pointerMove);
        if (typeof detachLocale === 'function'){
          try { detachLocale(); } catch {}
          detachLocale = null;
        }
        if (resultNode && resultNode.parentElement){
          try { resultNode.parentElement.removeChild(resultNode); } catch {}
          resultNode = null;
        }
      }
    };
  }

  if (!window.MiniGameMods) window.MiniGameMods = {};
  window.MiniGameMods.taiko_drum = { create };
  if (!window.MINIEXP) window.MINIEXP = {};
  window.MINIEXP.taiko_drum = { create };
  if (window.registerMiniGame){
    window.registerMiniGame({
      id: 'taiko_drum',
      name: '太鼓リズム', nameKey: 'selection.miniexp.games.taiko_drum.name',
      description: '太鼓の達人風の2面譜面。良/可/普/不の判定とコンボEXPボーナスを搭載',
      descriptionKey: 'selection.miniexp.games.taiko_drum.description',
      categoryIds: ['rhythm'],
      localizationKey: 'minigame.taiko_drum',
      create
    });
  }
})();

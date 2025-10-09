(function(){
  const LANES = 4;
  const BASE_WIDTH = 420;
  const BASE_HEIGHT = 640;
  const HIT_LINE_OFFSET = 140;
  const LANE_PADDING = 14;
  const KEY_MAP = { d: 0, f: 1, j: 2, k: 3 };

  const DIFFICULTY_CFG = {
    EASY: {
      scrollSpeed: 220,
      spawnInterval: [620, 840],
      holdChance: 0.28,
      noteHeight: 86,
      holdLength: [160, 260],
      hitWindow: 64,
      perfectWindow: 18,
      greatWindow: 34,
      holdReleaseWindow: 32
    },
    NORMAL: {
      scrollSpeed: 280,
      spawnInterval: [540, 760],
      holdChance: 0.36,
      noteHeight: 78,
      holdLength: [190, 320],
      hitWindow: 54,
      perfectWindow: 16,
      greatWindow: 30,
      holdReleaseWindow: 28
    },
    HARD: {
      scrollSpeed: 340,
      spawnInterval: [460, 660],
      holdChance: 0.43,
      noteHeight: 70,
      holdLength: [210, 360],
      hitWindow: 48,
      perfectWindow: 14,
      greatWindow: 26,
      holdReleaseWindow: 24
    }
  };

  const DIFFICULTY_TEXT_META = {
    EASY: { key: '.difficulty.easy', fallback: 'EASY' },
    NORMAL: { key: '.difficulty.normal', fallback: 'NORMAL' },
    HARD: { key: '.difficulty.hard', fallback: 'HARD' }
  };

  function clamp(v, min, max){
    return v < min ? min : v > max ? max : v;
  }

  function randRange(min, max){
    return min + Math.random() * (max - min);
  }

  function chooseLane(){
    return Math.floor(Math.random() * LANES);
  }

  function create(root, awardXp, opts){
    const difficulty = (opts && opts.difficulty) || 'NORMAL';
    const cfg = { ...DIFFICULTY_CFG.NORMAL, ...(DIFFICULTY_CFG[difficulty] || {}) };

    const localization = (opts && opts.localization) || (typeof window !== 'undefined' && typeof window.createMiniGameLocalization === 'function'
      ? window.createMiniGameLocalization({ id: 'piano_tiles' })
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
        const value = Object.prototype.hasOwnProperty.call(params, normalized) ? params[normalized] : '';
        return value == null ? '' : String(value);
      });
    };

    let labelCache = null;
    let cachedLocale = null;
    let detachLocale = null;

    const refreshLabelCache = (force = false) => {
      const localeId = localization && typeof localization.getLocale === 'function'
        ? localization.getLocale()
        : 'default';
      if (!force && labelCache && cachedLocale === localeId) return labelCache;
      cachedLocale = localeId;
      labelCache = {
        tips: text('.tips', 'タップ or D/F/J/Kキーでレーンを叩き、長いノーツは離さずにホールド。'),
        hudTemplate: text('.hud.template', '{difficultyLabel}: {difficulty} | {hitsLabel}: {hits} | {missesLabel}: {misses} | {comboLabel}: {combo} ({maxLabel} {maxCombo}) | {accuracyLabel}: {accuracy}%'),
        hudDifficultyLabel: text('.hud.difficultyLabel', '難易度'),
        hudHitsLabel: text('.hud.hitsLabel', '成功'),
        hudMissesLabel: text('.hud.missesLabel', 'ミス'),
        hudComboLabel: text('.hud.comboLabel', 'コンボ'),
        hudMaxLabel: text('.hud.maxLabel', '最大'),
        hudAccuracyLabel: text('.hud.accuracyLabel', '精度')
      };
      return labelCache;
    };

    const resolveDifficultyLabel = (id) => {
      const meta = DIFFICULTY_TEXT_META[id];
      if (!meta) return id;
      return text(meta.key, meta.fallback);
    };

    const container = document.createElement('div');
    container.style.maxWidth = BASE_WIDTH + 'px';
    container.style.margin = '0 auto';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'stretch';
    container.style.gap = '8px';

    const hud = document.createElement('div');
    hud.style.fontFamily = "'Segoe UI', 'Yu Gothic UI', sans-serif";
    hud.style.fontSize = '14px';
    hud.style.color = '#e2e8f0';
    hud.style.display = 'flex';
    hud.style.flexWrap = 'wrap';
    hud.style.justifyContent = 'space-between';
    hud.style.background = 'rgba(15,23,42,0.72)';
    hud.style.padding = '8px 12px';
    hud.style.borderRadius = '10px';
    hud.style.backdropFilter = 'blur(2px)';
    container.appendChild(hud);

    const tips = document.createElement('div');
    tips.style.fontSize = '12px';
    tips.style.opacity = '0.75';
    tips.style.marginTop = '-4px';
    container.appendChild(tips);

    const canvas = document.createElement('canvas');
    canvas.width = BASE_WIDTH;
    canvas.height = BASE_HEIGHT;
    canvas.style.borderRadius = '18px';
    canvas.style.background = '#020617';
    canvas.style.boxShadow = '0 8px 24px rgba(8,11,32,0.45)';
    canvas.style.touchAction = 'none';
    container.appendChild(canvas);

    root.appendChild(container);

    const ctx = canvas.getContext('2d');
    const laneWidth = canvas.width / LANES;
    const hitLineY = canvas.height - HIT_LINE_OFFSET;
    const notes = [];
    const laneFlash = Array.from({ length: LANES }, () => 0);
    const pointerHolds = new Map(); // pointerId -> note
    const keyHolds = new Map(); // key -> note

    let spawnTimer = 0;
    let spawnGap = randRange(cfg.spawnInterval[0], cfg.spawnInterval[1]);
    let running = true;
    let raf = 0;
    let lastTs = performance.now();
    let ended = false;

    const stats = {
      hits: 0,
      misses: 0,
      combo: 0,
      maxCombo: 0
    };

    function updateHud(){
      const total = stats.hits + stats.misses;
      const accuracy = total === 0 ? 100 : Math.round((stats.hits / total) * 1000) / 10;
      const formattedAccuracy = formatNumber(accuracy, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
      const cache = refreshLabelCache();
      const message = formatTemplate(cache.hudTemplate, {
        difficultyLabel: cache.hudDifficultyLabel,
        difficulty: resolveDifficultyLabel(difficulty),
        hitsLabel: cache.hudHitsLabel,
        hits: formatNumber(stats.hits),
        missesLabel: cache.hudMissesLabel,
        misses: formatNumber(stats.misses),
        comboLabel: cache.hudComboLabel,
        combo: formatNumber(stats.combo),
        maxLabel: cache.hudMaxLabel,
        maxCombo: formatNumber(stats.maxCombo),
        accuracyLabel: cache.hudAccuracyLabel,
        accuracy: formattedAccuracy
      });
      hud.textContent = message;
    }

    const updateLocalizedStaticTexts = (force = false) => {
      const cache = refreshLabelCache(force);
      tips.textContent = cache.tips;
      updateHud();
    };

    function spawnNote(){
      const lane = chooseLane();
      const isHold = Math.random() < cfg.holdChance;
      const length = isHold ? randRange(cfg.holdLength[0], cfg.holdLength[1]) : cfg.noteHeight;
      notes.push({
        id: Math.random().toString(36).slice(2),
        lane,
        y: -length - 80,
        length,
        type: isHold ? 'hold' : 'tap',
        state: 'pending',
        hit: false,
        holdGrade: null,
        pointerId: null,
        keyId: null,
        spawnedAt: performance.now()
      });
    }

    function registerHit(note, grade, type){
      stats.hits += 1;
      stats.combo += 1;
      if (stats.combo > stats.maxCombo) stats.maxCombo = stats.combo;
      laneFlash[note.lane] = 1.2;
      updateHud();
      if (awardXp){
        const base = type === 'hold' ? 5.5 : 3.2;
        const gradeBonus = grade === 'perfect' ? 2.2 : grade === 'great' ? 1.2 : 0.6;
        const comboBonus = Math.min(stats.combo * 0.32, 4.5);
        const gain = base + gradeBonus + comboBonus;
        awardXp(gain, { type: 'hit', noteType: type, grade, combo: stats.combo });
        if (window.showTransientPopupAt){
          window.showTransientPopupAt(canvas.width - 110, 48, `+${gain.toFixed(1)}`, { variant: 'combo', level: Math.min(5, Math.floor(stats.combo / 5)) });
        }
      }
    }

    function registerMiss(note, reason){
      if (note.hit || note.state === 'done') return;
      note.state = 'done';
      note.hit = false;
      stats.misses += 1;
      stats.combo = 0;
      laneFlash[note.lane] = -0.6;
      updateHud();
      if (awardXp){
        awardXp(0, { type: 'miss', noteType: note.type, reason });
      }
    }

    function gradeForDiff(diff){
      if (diff <= cfg.perfectWindow) return 'perfect';
      if (diff <= cfg.greatWindow) return 'great';
      return 'good';
    }

    function startHit(lane, inputId, source){
      for (const note of notes){
        if (note.lane !== lane) continue;
        if (note.state === 'done') continue;
        if (note.type === 'tap'){
          const diff = Math.abs((note.y + note.length) - hitLineY);
          if (diff <= cfg.hitWindow){
            const grade = gradeForDiff(diff);
            note.hit = true;
            note.state = 'done';
            registerHit(note, grade, 'tap');
            return { success: true };
          }
          if ((note.y + note.length) > (hitLineY + cfg.hitWindow)){
            registerMiss(note, 'late');
            return { success: false };
          }
          // too early
          return { success: false };
        } else if (note.type === 'hold'){
          if (note.state === 'pending'){
            const diff = Math.abs(note.y - hitLineY);
            if (diff <= cfg.hitWindow){
              note.state = 'holding';
              note.holdGrade = gradeForDiff(diff);
              if (source === 'pointer'){
                note.pointerId = inputId;
              } else {
                note.keyId = inputId;
              }
              return { success: true, holdNote: note };
            }
            if (note.y > hitLineY + cfg.hitWindow){
              registerMiss(note, 'late_hold_start');
              return { success: false };
            }
            return { success: false };
          }
        }
      }
      return { success: false };
    }

    function completeHold(note){
      if (!note || note.state !== 'holding') return;
      note.hit = true;
      note.state = 'done';
      const grade = note.holdGrade || 'good';
      registerHit(note, grade, 'hold');
      if (note.pointerId !== null){
        const held = pointerHolds.get(note.pointerId);
        if (held && held.note === note){
          pointerHolds.delete(note.pointerId);
        }
        try {
          canvas.releasePointerCapture(note.pointerId);
        } catch (err){}
        note.pointerId = null;
      }
      if (note.keyId){
        const heldKey = keyHolds.get(note.keyId);
        if (heldKey === note){
          keyHolds.delete(note.keyId);
        }
        note.keyId = null;
      }
    }

    function pointerDown(e){
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const lane = clamp(Math.floor(x / laneWidth), 0, LANES - 1);
      const res = startHit(lane, e.pointerId, 'pointer');
      if (res && res.holdNote){
        pointerHolds.set(e.pointerId, { lane, note: res.holdNote });
        try {
          canvas.setPointerCapture(e.pointerId);
        } catch (err){}
      }
    }

    function pointerUp(e){
      const info = pointerHolds.get(e.pointerId);
      if (!info) return;
      pointerHolds.delete(e.pointerId);
      if (info.note.state === 'holding'){
        registerMiss(info.note, 'hold_released');
      }
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch (err){}
    }

    function pointerCancel(e){
      pointerUp(e);
    }

    function keyDown(e){
      const key = e.key.toLowerCase();
      if (!(key in KEY_MAP)) return;
      if (keyHolds.has(key)) return;
      e.preventDefault();
      const lane = KEY_MAP[key];
      const res = startHit(lane, key, 'key');
      if (res && res.holdNote){
        keyHolds.set(key, res.holdNote);
      }
    }

    function keyUp(e){
      const key = e.key.toLowerCase();
      const note = keyHolds.get(key);
      if (!note) return;
      keyHolds.delete(key);
      if (note.state === 'holding'){
        registerMiss(note, 'hold_released');
      }
    }

    canvas.addEventListener('pointerdown', pointerDown);
    canvas.addEventListener('pointerup', pointerUp);
    canvas.addEventListener('pointercancel', pointerCancel);
    canvas.addEventListener('pointerout', pointerCancel);
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);

    updateLocalizedStaticTexts(true);
    if (localization && typeof localization.onChange === 'function'){
      detachLocale = localization.onChange(() => {
        try {
          updateLocalizedStaticTexts(true);
        } catch (error) {
          console.warn('[MiniExp][piano_tiles] Failed to refresh locale:', error);
        }
      });
    }

    function drawLanes(){
      for (let i=0; i<LANES; i++){
        const x = i * laneWidth;
        ctx.fillStyle = '#0b1120';
        ctx.fillRect(x, 0, laneWidth, canvas.height);
        const flash = laneFlash[i];
        if (flash > 0){
          ctx.fillStyle = `rgba(14,165,233,${Math.min(0.75, flash)})`;
          ctx.fillRect(x, 0, laneWidth, canvas.height);
        } else if (flash < 0){
          ctx.fillStyle = `rgba(248,113,113,${Math.min(0.5, Math.abs(flash))})`;
          ctx.fillRect(x, 0, laneWidth, canvas.height);
        }
        ctx.fillStyle = 'rgba(15,23,42,0.6)';
        ctx.fillRect(x + laneWidth - 2, 0, 2, canvas.height);
      }
    }

    function drawNotes(){
      const noteWidth = laneWidth - LANE_PADDING * 2;
      for (const note of notes){
        if (note.state === 'done' && note.y > canvas.height + 10) continue;
        const x = note.lane * laneWidth + LANE_PADDING;
        const height = note.length;
        const y = note.y;
        if (note.type === 'tap'){
          ctx.fillStyle = note.hit ? '#22d3ee' : '#38bdf8';
        } else {
          if (note.state === 'holding'){
            ctx.fillStyle = '#f0abfc';
          } else if (note.state === 'done' && note.hit){
            ctx.fillStyle = '#c084fc';
          } else {
            ctx.fillStyle = '#f472b6';
          }
        }
        ctx.beginPath();
        const radius = 12;
        ctx.moveTo(x, y + radius);
        ctx.arcTo(x, y, x + radius, y, radius);
        ctx.lineTo(x + noteWidth - radius, y);
        ctx.arcTo(x + noteWidth, y, x + noteWidth, y + radius, radius);
        ctx.lineTo(x + noteWidth, y + height - radius);
        ctx.arcTo(x + noteWidth, y + height, x + noteWidth - radius, y + height, radius);
        ctx.lineTo(x + radius, y + height);
        ctx.arcTo(x, y + height, x, y + height - radius, radius);
        ctx.closePath();
        ctx.fill();
        if (note.type === 'hold'){
          ctx.fillStyle = 'rgba(15,23,42,0.35)';
          ctx.fillRect(x + 8, y + 12, noteWidth - 16, height - 24);
        }
      }
    }

    function drawHitLine(){
      ctx.strokeStyle = 'rgba(148,163,184,0.8)';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 8]);
      ctx.beginPath();
      ctx.moveTo(0, hitLineY);
      ctx.lineTo(canvas.width, hitLineY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    function cleanupNotes(){
      for (let i = notes.length - 1; i >= 0; i--){
        const note = notes[i];
        if (note.y > canvas.height + note.length + 120){
          notes.splice(i, 1);
        }
      }
    }

    function update(dt){
      spawnTimer += dt;
      if (spawnTimer >= spawnGap){
        spawnTimer -= spawnGap;
        spawnGap = randRange(cfg.spawnInterval[0], cfg.spawnInterval[1]);
        spawnNote();
      }

      for (const note of notes){
        note.y += cfg.scrollSpeed * (dt / 1000);
        if (note.type === 'tap'){
          if (!note.hit && note.y + note.length >= hitLineY + cfg.hitWindow + 24){
            registerMiss(note, 'late');
          }
        } else if (note.type === 'hold'){
          if (note.state === 'pending' && note.y >= hitLineY + cfg.hitWindow + 20){
            registerMiss(note, 'late_hold');
          }
          if (note.state === 'holding' && note.y + note.length >= hitLineY + cfg.holdReleaseWindow){
            completeHold(note);
          }
        }
      }

      for (let i=0; i<LANES; i++){
        if (laneFlash[i] > 0){
          laneFlash[i] = Math.max(0, laneFlash[i] - dt / 450);
        } else if (laneFlash[i] < 0){
          laneFlash[i] = Math.min(0, laneFlash[i] + dt / 320);
        }
      }

      cleanupNotes();
    }

    function draw(){
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawLanes();
      drawNotes();
      drawHitLine();
    }

    function step(ts){
      if (!running) return;
      const dt = ts - lastTs;
      lastTs = ts;
      update(dt);
      draw();
      raf = requestAnimationFrame(step);
    }

    raf = requestAnimationFrame(step);

    function destroy(){
      if (ended) return;
      ended = true;
      running = false;
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', pointerDown);
      canvas.removeEventListener('pointerup', pointerUp);
      canvas.removeEventListener('pointercancel', pointerCancel);
      canvas.removeEventListener('pointerout', pointerCancel);
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
      if (typeof detachLocale === 'function'){
        try { detachLocale(); } catch {}
        detachLocale = null;
      }
      container.remove();
    }

    return { destroy };
  }

  if (!window.MiniGameMods) window.MiniGameMods = {};
  window.MiniGameMods.pianoTiles = { create };
  if (window.registerMiniGame){
    window.registerMiniGame({
      id: 'piano_tiles',
      name: 'リズムタイル', nameKey: 'selection.miniexp.games.piano_tiles.name',
      description: '4レーンのタップ＆ホールド譜面をタイミング良く刻むリズムゲーム', descriptionKey: 'selection.miniexp.games.piano_tiles.description', categoryIds: ['rhythm'],
      localizationKey: 'minigame.piano_tiles',
      create
    });
  }
})();

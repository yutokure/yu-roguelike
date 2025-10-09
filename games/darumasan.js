(function(){
  /** MiniExp: だるまさんがころんだ
   *  - Hold Space/Up to advance while the watcher looks away
   *  - Stop immediately when the watcher turns!
   */
  function create(root, awardXp, opts){
    const shortcuts = opts?.shortcuts;
    const i18n = window.I18n;

    function computeFallback(fallback, params){
      if (typeof fallback === 'function'){
        try {
          const value = fallback(params || {});
          return value == null ? '' : String(value);
        } catch (error){
          console.warn('[darumasan] Failed to evaluate fallback text:', error);
          return '';
        }
      }
      return fallback ?? '';
    }

    function text(key, fallback, params){
      if (i18n && typeof i18n.t === 'function'){
        try {
          const result = i18n.t(key, params);
          if (typeof result === 'string' && result !== key) return result;
          if (result !== undefined && result !== null && result !== key) return result;
        } catch (error){
          console.warn('[darumasan] Failed to translate key:', key, error);
        }
      }
      return computeFallback(fallback, params);
    }

    function formatNumberLocalized(value, options, fallbackDigits = 0){
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) return '0';
      if (i18n && typeof i18n.formatNumber === 'function'){
        try {
          return i18n.formatNumber(numeric, options);
        } catch (error){
          console.warn('[darumasan] Failed to format number:', value, error);
        }
      }
      if (options && typeof options.minimumFractionDigits === 'number' && typeof options.maximumFractionDigits === 'number'){
        if (options.minimumFractionDigits === options.maximumFractionDigits){
          return numeric.toFixed(options.minimumFractionDigits);
        }
        try {
          return numeric.toLocaleString(undefined, options);
        } catch {}
      }
      if (typeof fallbackDigits === 'number'){
        return numeric.toFixed(fallbackDigits);
      }
      return String(numeric);
    }

    function createCard(){
      const card = document.createElement('div');
      card.style.background = 'rgba(2,6,23,0.92)';
      card.style.borderRadius = '12px';
      card.style.padding = '16px';
      card.style.boxShadow = '0 12px 24px rgba(2,6,23,0.55)';
      card.style.display = 'grid';
      card.style.gap = '6px';
      return card;
    }

    const wrapper = document.createElement('div');
    wrapper.style.display = 'grid';
    wrapper.style.gap = '14px';
    wrapper.style.fontFamily = 'system-ui, sans-serif';
    wrapper.style.color = '#e2e8f0';
    wrapper.style.maxWidth = '420px';
    wrapper.style.margin = '0 auto';

    const guardCard = createCard();
    const guardTitle = document.createElement('div');
    guardTitle.style.fontSize = '0.95rem';
    guardTitle.style.opacity = '0.7';

    const guardStateLabel = document.createElement('div');
    guardStateLabel.style.fontSize = '1.4rem';
    guardStateLabel.style.fontWeight = '700';

    const guardCountdownLabel = document.createElement('div');
    guardCountdownLabel.style.fontSize = '0.9rem';
    guardCountdownLabel.style.color = '#fef3c7';

    const moveIndicator = document.createElement('div');
    moveIndicator.style.fontSize = '0.85rem';
    moveIndicator.style.opacity = '0.85';
    moveIndicator.style.color = '#cbd5f5';

    const hintLabel = document.createElement('div');
    hintLabel.style.fontSize = '0.85rem';
    hintLabel.style.opacity = '0.7';

    guardCard.appendChild(guardTitle);
    guardCard.appendChild(guardStateLabel);
    guardCard.appendChild(guardCountdownLabel);
    guardCard.appendChild(moveIndicator);
    guardCard.appendChild(hintLabel);

    const progressCard = createCard();
    const progressTitle = document.createElement('div');
    progressTitle.style.fontSize = '0.95rem';
    progressTitle.style.opacity = '0.7';

    const progressWrapper = document.createElement('div');
    progressWrapper.style.background = 'rgba(15,23,42,0.85)';
    progressWrapper.style.borderRadius = '999px';
    progressWrapper.style.height = '16px';
    const progressFill = document.createElement('div');
    progressFill.style.background = 'linear-gradient(90deg, #38bdf8, #60a5fa)';
    progressFill.style.height = '100%';
    progressFill.style.width = '0%';
    progressFill.style.borderRadius = '999px';
    progressWrapper.appendChild(progressFill);

    const progressDetailLabel = document.createElement('div');
    progressDetailLabel.style.fontSize = '0.85rem';
    progressDetailLabel.style.opacity = '0.85';

    const bestRecordLabel = document.createElement('div');
    bestRecordLabel.style.fontSize = '0.8rem';
    bestRecordLabel.style.opacity = '0.6';

    progressCard.appendChild(progressTitle);
    progressCard.appendChild(progressWrapper);
    progressCard.appendChild(progressDetailLabel);
    progressCard.appendChild(bestRecordLabel);

    const statusCard = createCard();
    statusCard.style.padding = '14px';
    const statusLabel = document.createElement('div');
    statusLabel.style.fontSize = '0.95rem';
    statusCard.appendChild(statusLabel);

    wrapper.appendChild(guardCard);
    wrapper.appendChild(progressCard);
    wrapper.appendChild(statusCard);
    root.appendChild(wrapper);

    let running = false;
    let raf = 0;
    let lastTs = 0;
    let progress = 0;
    let guardState = 'idle';
    let guardTimer = 0;
    let warningWindow = 0;
    let moving = false;
    let success = false;
    let fail = false;
    let lastMovingReported = null;
    let timeElapsed = 0;
    let bestTime = null;
    let statusMode = 'initial';
    let statusParams = {};

    const total = 100;
    const MOVE_SPEED = 22; // units per second
    const WATCH_DURATION_RANGE = [1.05, 1.8];
    const SAFE_DURATION_RANGE = [1.7, 2.9];

    function updateGuardPresentation(){
      if (guardState === 'watch'){
        guardStateLabel.textContent = text('minigame.darumasan.guard.state.watch', '見てる！止まって！');
        guardStateLabel.style.color = '#f87171';
        guardCountdownLabel.style.color = '#fca5a5';
      } else if (guardState === 'warning'){
        guardStateLabel.textContent = text('minigame.darumasan.guard.state.warning', 'そろそろ振り向く！');
        guardStateLabel.style.color = '#fbbf24';
        guardCountdownLabel.style.color = '#fef08a';
      } else if (guardState === 'safe'){
        guardStateLabel.textContent = text('minigame.darumasan.guard.state.safe', '今だ！前進！');
        guardStateLabel.style.color = '#34d399';
        guardCountdownLabel.style.color = '#bbf7d0';
      } else {
        guardStateLabel.textContent = text('minigame.darumasan.guard.state.idle', '準備中…');
        guardStateLabel.style.color = '#e2e8f0';
        guardCountdownLabel.style.color = '#fef3c7';
      }
      updateGuardCountdown();
    }

    function updateGuardCountdown(){
      if (guardState === 'safe'){
        const seconds = formatNumberLocalized(Math.max(0, guardTimer), { minimumFractionDigits: 2, maximumFractionDigits: 2 }, 2);
        guardCountdownLabel.textContent = text('minigame.darumasan.guard.countdown.safe', ({ seconds: s }) => `安全残り ${s} 秒`, { seconds });
      } else if (guardState === 'warning'){
        const seconds = formatNumberLocalized(Math.max(0, guardTimer), { minimumFractionDigits: 2, maximumFractionDigits: 2 }, 2);
        guardCountdownLabel.textContent = text('minigame.darumasan.guard.countdown.warning', ({ seconds: s }) => `あと ${s} 秒で振り向く！`, { seconds });
      } else if (guardState === 'watch'){
        const seconds = formatNumberLocalized(Math.max(0, guardTimer), { minimumFractionDigits: 2, maximumFractionDigits: 2 }, 2);
        guardCountdownLabel.textContent = text('minigame.darumasan.guard.countdown.watch', ({ seconds: s }) => `監視中… ${s} 秒我慢`, { seconds });
      } else {
        guardCountdownLabel.textContent = text('minigame.darumasan.guard.countdown.placeholder', '残り --.- 秒');
      }
    }

    function disableHost(){ shortcuts?.disableKey?.('r'); }
    function enableHost(){ shortcuts?.enableKey?.('r'); }

    function scheduleGuard(state){
      guardState = state;
      if (state === 'watch'){
        guardTimer = WATCH_DURATION_RANGE[0] + Math.random() * (WATCH_DURATION_RANGE[1] - WATCH_DURATION_RANGE[0]);
        updateGuardPresentation();
      } else if (state === 'warning'){
        guardTimer = Math.max(0.35, warningWindow);
        updateGuardPresentation();
      } else if (state === 'safe'){
        const totalSafe = SAFE_DURATION_RANGE[0] + Math.random() * (SAFE_DURATION_RANGE[1] - SAFE_DURATION_RANGE[0]);
        warningWindow = Math.min(0.9, totalSafe * 0.45);
        let steadySafe = totalSafe - warningWindow;
        if (steadySafe < 0.35){
          steadySafe = totalSafe * 0.55;
          warningWindow = Math.max(0.3, totalSafe - steadySafe);
        }
        guardTimer = steadySafe;
        updateGuardPresentation();
      } else {
        guardTimer = 0;
        updateGuardPresentation();
      }
    }

    function keyDown(e){
      if (e.repeat) return;
      if (e.code === 'Space' || e.key === 'ArrowUp' || e.key === 'Up'){
        e.preventDefault();
        moving = true;
      }
    }

    function keyUp(e){
      if (e.code === 'Space' || e.key === 'ArrowUp' || e.key === 'Up'){
        moving = false;
      }
    }

    function updateProgressDisplay(){
      const pct = Math.min(100, Math.max(0, (progress / total) * 100));
      progressFill.style.width = pct.toFixed(1) + '%';
      const distance = formatNumberLocalized(pct, { minimumFractionDigits: 1, maximumFractionDigits: 1 }, 1);
      const timeText = formatNumberLocalized(timeElapsed, { minimumFractionDigits: 1, maximumFractionDigits: 1 }, 1);
      progressDetailLabel.textContent = text(
        'minigame.darumasan.progress.detail',
        ({ distance: d, time: t }) => `距離 ${d}% / 経過 ${t} 秒`,
        { distance, time: timeText }
      );
      if (bestTime != null){
        const bestTimeText = formatNumberLocalized(bestTime, { minimumFractionDigits: 1, maximumFractionDigits: 1 }, 1);
        bestRecordLabel.textContent = text(
          'minigame.darumasan.progress.best',
          ({ time }) => `ベストタイム: ${time} 秒`,
          { time: bestTimeText }
        );
      } else {
        bestRecordLabel.textContent = text('minigame.darumasan.progress.bestPlaceholder', 'ベストタイム: --.- 秒');
      }
    }

    const STATUS_CONFIG = {
      initial: {
        key: 'minigame.darumasan.status.initial',
        fallback: () => 'スタートで開始'
      },
      running: {
        key: 'minigame.darumasan.status.running',
        fallback: () => 'だるまさんがころんだ！安全な時だけ前進しよう'
      },
      pause: {
        key: 'minigame.darumasan.status.pause',
        fallback: () => '一時停止中'
      },
      success: {
        key: 'minigame.darumasan.status.success',
        fallback: ({ time }) => `クリア！50EXP獲得！所要 ${time ?? '0.0'} 秒`
      },
      fail: {
        key: 'minigame.darumasan.status.fail',
        fallback: () => '動いているのを見られた…失敗'
      }
    };

    function setStatus(mode, params){
      const config = STATUS_CONFIG[mode] || STATUS_CONFIG.initial;
      const effectiveParams = params ? { ...params } : {};
      statusMode = config ? mode : 'initial';
      statusParams = effectiveParams;
      statusLabel.textContent = text(config.key, config.fallback, effectiveParams);
    }

    function endGame(result){
      running = false;
      cancelAnimationFrame(raf);
      enableHost();
      moving = false;
      updateMovementIndicator();
      if (result === 'success'){
        success = true;
        if (bestTime == null || timeElapsed < bestTime){
          bestTime = timeElapsed;
        }
        const elapsedText = formatNumberLocalized(timeElapsed, { minimumFractionDigits: 1, maximumFractionDigits: 1 }, 1);
        setStatus('success', { time: elapsedText });
        updateProgressDisplay();
        awardXp(50, { reason: 'clear', gameId: 'darumasan' });
      } else if (result === 'fail'){
        fail = true;
        setStatus('fail');
      }
    }

    function loop(ts){
      const now = ts * 0.001;
      if (!lastTs) lastTs = now;
      const dt = Math.min(0.2, now - lastTs);
      lastTs = now;

      guardTimer -= dt;
      if (guardTimer <= 0){
        if (guardState === 'safe'){
          scheduleGuard('warning');
        } else if (guardState === 'warning'){
          scheduleGuard('watch');
        } else if (guardState === 'watch'){
          scheduleGuard('safe');
        }
      }
      updateGuardCountdown();

      if (guardState === 'safe' && moving && !success && !fail){
        progress += MOVE_SPEED * dt;
        if (progress >= total){
          progress = total;
          updateProgressDisplay();
          endGame('success');
          return;
        }
      }

      if (guardState === 'warning' && moving && !success && !fail && guardTimer <= 0.12){
        endGame('fail');
        return;
      }

      if (guardState === 'watch' && moving && !success && !fail){
        endGame('fail');
        return;
      }

      if (running && !success && !fail){
        timeElapsed += dt;
      }

      updateProgressDisplay();
      updateMovementIndicator();
      if (running) raf = requestAnimationFrame(loop);
    }

    function updateMovementIndicator(){
      if (lastMovingReported === moving) return;
      lastMovingReported = moving;
      if (moving){
        moveIndicator.textContent = text('minigame.darumasan.movement.moving', '移動中');
        moveIndicator.style.color = '#bae6fd';
      } else {
        moveIndicator.textContent = text('minigame.darumasan.movement.stopped', '停止中');
        moveIndicator.style.color = '#cbd5f5';
      }
    }

    function start(){
      if (running) return;
      if (success || fail){
        progress = 0;
        success = false;
        fail = false;
      }
      timeElapsed = 0;
      updateProgressDisplay();
      running = true;
      scheduleGuard('safe');
      setStatus('running');
      lastTs = 0;
      lastMovingReported = null;
      disableHost();
      updateMovementIndicator();
      updateGuardCountdown();
      raf = requestAnimationFrame(loop);
    }

    function stop(){
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
      enableHost();
      setStatus('pause');
    }

    function destroy(){
      cancelAnimationFrame(raf);
      enableHost();
      document.removeEventListener('keydown', keyDown);
      document.removeEventListener('keyup', keyUp);
      document.removeEventListener('i18n:locale-changed', handleLocaleChange);
      try { wrapper.remove(); } catch {}
    }

    function getScore(){
      return progress;
    }

    function refreshStaticTexts(){
      guardTitle.textContent = text('minigame.darumasan.guard.title', '見張りの様子');
      hintLabel.textContent = text('minigame.darumasan.guard.hint', 'スペース / ↑ で前進');
      progressTitle.textContent = text('minigame.darumasan.progress.title', '進行状況');
      updateGuardPresentation();
      lastMovingReported = null;
      updateMovementIndicator();
      updateProgressDisplay();
      setStatus(statusMode, statusParams);
    }

    function handleLocaleChange(){
      refreshStaticTexts();
    }

    document.addEventListener('keydown', keyDown, { passive: false });
    document.addEventListener('keyup', keyUp, { passive: true });
    document.addEventListener('i18n:locale-changed', handleLocaleChange);
    scheduleGuard('idle');
    refreshStaticTexts();

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({ id: 'darumasan', name: 'だるまさんがころんだ', nameKey: 'selection.miniexp.games.darumasan.name', description: '引っかからずにゴールできれば50EXP', descriptionKey: 'selection.miniexp.games.darumasan.description', categoryIds: ['toy'], create });
})();

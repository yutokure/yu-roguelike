(function(){
  /** MiniExp: だるまさんがころんだ
   *  - Hold Space/Up to advance while the watcher looks away
   *  - Stop immediately when the watcher turns!
   */
  function create(root, awardXp, opts){
    const shortcuts = opts?.shortcuts;

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
    guardTitle.textContent = '見張りの様子';
    guardTitle.style.fontSize = '0.95rem';
    guardTitle.style.opacity = '0.7';

    const guardStateLabel = document.createElement('div');
    guardStateLabel.style.fontSize = '1.4rem';
    guardStateLabel.style.fontWeight = '700';
    guardStateLabel.textContent = '準備中…';

    const guardCountdownLabel = document.createElement('div');
    guardCountdownLabel.style.fontSize = '0.9rem';
    guardCountdownLabel.style.color = '#fef3c7';
    guardCountdownLabel.textContent = '残り --.- 秒';

    const moveIndicator = document.createElement('div');
    moveIndicator.style.fontSize = '0.85rem';
    moveIndicator.style.opacity = '0.85';
    moveIndicator.style.color = '#cbd5f5';
    moveIndicator.textContent = '停止中';

    const hintLabel = document.createElement('div');
    hintLabel.style.fontSize = '0.85rem';
    hintLabel.style.opacity = '0.7';
    hintLabel.textContent = 'スペース / ↑ で前進';

    guardCard.appendChild(guardTitle);
    guardCard.appendChild(guardStateLabel);
    guardCard.appendChild(guardCountdownLabel);
    guardCard.appendChild(moveIndicator);
    guardCard.appendChild(hintLabel);

    const progressCard = createCard();
    const progressTitle = document.createElement('div');
    progressTitle.textContent = '進行状況';
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
    progressDetailLabel.textContent = '距離 0% / 経過 0.0 秒';

    const bestRecordLabel = document.createElement('div');
    bestRecordLabel.style.fontSize = '0.8rem';
    bestRecordLabel.style.opacity = '0.6';
    bestRecordLabel.textContent = 'ベストタイム: --.- 秒';

    progressCard.appendChild(progressTitle);
    progressCard.appendChild(progressWrapper);
    progressCard.appendChild(progressDetailLabel);
    progressCard.appendChild(bestRecordLabel);

    const statusCard = createCard();
    statusCard.style.padding = '14px';
    const statusLabel = document.createElement('div');
    statusLabel.style.fontSize = '0.95rem';
    statusLabel.textContent = 'スタートで開始';
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

    const total = 100;
    const MOVE_SPEED = 22; // units per second
    const WATCH_DURATION_RANGE = [1.05, 1.8];
    const SAFE_DURATION_RANGE = [1.7, 2.9];

    function updateGuardPresentation(){
      if (guardState === 'watch'){
        guardStateLabel.textContent = '見てる！止まって！';
        guardStateLabel.style.color = '#f87171';
        guardCountdownLabel.style.color = '#fca5a5';
      } else if (guardState === 'warning'){
        guardStateLabel.textContent = 'そろそろ振り向く！';
        guardStateLabel.style.color = '#fbbf24';
        guardCountdownLabel.style.color = '#fef08a';
      } else if (guardState === 'safe'){
        guardStateLabel.textContent = '今だ！前進！';
        guardStateLabel.style.color = '#34d399';
        guardCountdownLabel.style.color = '#bbf7d0';
      } else {
        guardStateLabel.textContent = '準備中…';
        guardStateLabel.style.color = '#e2e8f0';
        guardCountdownLabel.style.color = '#fef3c7';
      }
      updateGuardCountdown();
    }

    function updateGuardCountdown(){
      if (guardState === 'safe'){
        guardCountdownLabel.textContent = `安全残り ${(Math.max(0, guardTimer)).toFixed(2)} 秒`;
      } else if (guardState === 'warning'){
        guardCountdownLabel.textContent = `あと ${(Math.max(0, guardTimer)).toFixed(2)} 秒で振り向く！`;
      } else if (guardState === 'watch'){
        guardCountdownLabel.textContent = `監視中… ${(Math.max(0, guardTimer)).toFixed(2)} 秒我慢`; 
      } else {
        guardCountdownLabel.textContent = '残り --.- 秒';
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
      progressDetailLabel.textContent = `距離 ${pct.toFixed(1)}% / 経過 ${timeElapsed.toFixed(1)} 秒`;
      if (bestTime != null){
        bestRecordLabel.textContent = `ベストタイム: ${bestTime.toFixed(1)} 秒`;
      }
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
          bestRecordLabel.textContent = `ベストタイム: ${bestTime.toFixed(1)} 秒`;
        }
        statusLabel.textContent = `クリア！50EXP獲得！所要 ${timeElapsed.toFixed(1)} 秒`;
        awardXp(50, { reason: 'clear', gameId: 'darumasan' });
      } else if (result === 'fail'){
        fail = true;
        statusLabel.textContent = '動いているのを見られた…失敗';
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
        moveIndicator.textContent = '移動中';
        moveIndicator.style.color = '#bae6fd';
      } else {
        moveIndicator.textContent = '停止中';
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
      statusLabel.textContent = 'だるまさんがころんだ！安全な時だけ前進しよう';
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
      statusLabel.textContent = '一時停止中';
    }

    function destroy(){
      cancelAnimationFrame(raf);
      enableHost();
      document.removeEventListener('keydown', keyDown);
      document.removeEventListener('keyup', keyUp);
      try { wrapper.remove(); } catch {}
    }

    function getScore(){
      return progress;
    }

    document.addEventListener('keydown', keyDown, { passive: false });
    document.addEventListener('keyup', keyUp, { passive: true });
    scheduleGuard('idle');

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({ id: 'darumasan', name: 'だるまさんがころんだ', nameKey: 'selection.miniexp.games.darumasan.name', description: '引っかからずにゴールできれば50EXP', descriptionKey: 'selection.miniexp.games.darumasan.description', categoryIds: ['toy'], create });
})();

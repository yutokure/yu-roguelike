(function(){
  /** MiniExp: だるまさんがころんだ
   *  - Hold Space/Up to advance while the watcher looks away
   *  - Stop immediately when the watcher turns!
   */
  function create(root, awardXp, opts){
    const shortcuts = opts?.shortcuts;

    const wrapper = document.createElement('div');
    wrapper.style.display = 'grid';
    wrapper.style.gap = '12px';
    wrapper.style.fontFamily = 'system-ui, sans-serif';
    wrapper.style.color = '#e2e8f0';

    const guardCard = document.createElement('div');
    guardCard.style.background = 'linear-gradient(135deg, #1f2937, #0f172a)';
    guardCard.style.borderRadius = '12px';
    guardCard.style.padding = '16px';
    guardCard.style.display = 'flex';
    guardCard.style.alignItems = 'center';
    guardCard.style.justifyContent = 'space-between';

    const guardStateLabel = document.createElement('span');
    guardStateLabel.style.fontSize = '1.4rem';
    guardStateLabel.style.fontWeight = '700';
    guardStateLabel.textContent = '準備中…';

    const hintLabel = document.createElement('span');
    hintLabel.style.fontSize = '0.9rem';
    hintLabel.textContent = 'スペース / ↑ で前進';

    guardCard.appendChild(guardStateLabel);
    guardCard.appendChild(hintLabel);

    const progressWrapper = document.createElement('div');
    progressWrapper.style.background = 'rgba(15,23,42,0.9)';
    progressWrapper.style.borderRadius = '999px';
    progressWrapper.style.height = '16px';
    const progressFill = document.createElement('div');
    progressFill.style.background = 'linear-gradient(90deg, #38bdf8, #60a5fa)';
    progressFill.style.height = '100%';
    progressFill.style.width = '0%';
    progressFill.style.borderRadius = '999px';
    progressWrapper.appendChild(progressFill);

    const statusLabel = document.createElement('div');
    statusLabel.style.fontSize = '0.95rem';
    statusLabel.style.padding = '4px 0';
    statusLabel.textContent = 'スタートで開始';

    wrapper.appendChild(guardCard);
    wrapper.appendChild(progressWrapper);
    wrapper.appendChild(statusLabel);
    root.appendChild(wrapper);

    let running = false;
    let raf = 0;
    let lastTs = 0;
    let progress = 0;
    let guardState = 'idle';
    let guardTimer = 0;
    let moving = false;
    let success = false;
    let fail = false;

    const total = 100;
    const MOVE_SPEED = 22; // units per second
    const WATCH_DURATION_RANGE = [1.0, 1.7];
    const SAFE_DURATION_RANGE = [1.6, 2.8];

    function disableHost(){ shortcuts?.disableKey?.('r'); }
    function enableHost(){ shortcuts?.enableKey?.('r'); }

    function scheduleGuard(state){
      guardState = state;
      if (state === 'watch'){
        guardStateLabel.textContent = '見てる！止まって！';
        guardStateLabel.style.color = '#f87171';
        guardTimer = WATCH_DURATION_RANGE[0] + Math.random() * (WATCH_DURATION_RANGE[1] - WATCH_DURATION_RANGE[0]);
      } else if (state === 'safe'){
        guardStateLabel.textContent = '今だ！';
        guardStateLabel.style.color = '#34d399';
        guardTimer = SAFE_DURATION_RANGE[0] + Math.random() * (SAFE_DURATION_RANGE[1] - SAFE_DURATION_RANGE[0]);
      } else {
        guardStateLabel.textContent = '準備中…';
        guardStateLabel.style.color = '#e2e8f0';
        guardTimer = 0;
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
    }

    function endGame(result){
      running = false;
      cancelAnimationFrame(raf);
      enableHost();
      moving = false;
      if (result === 'success'){
        success = true;
        statusLabel.textContent = 'クリア！50EXP獲得！';
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
        if (guardState === 'safe') scheduleGuard('watch');
        else scheduleGuard('safe');
      }

      if (guardState === 'safe' && moving && !success && !fail){
        progress += MOVE_SPEED * dt;
        if (progress >= total){
          progress = total;
          updateProgressDisplay();
          endGame('success');
          return;
        }
      }

      if (guardState === 'watch' && moving && !success && !fail){
        endGame('fail');
        return;
      }

      updateProgressDisplay();
      if (running) raf = requestAnimationFrame(loop);
    }

    function start(){
      if (running) return;
      if (success || fail){
        progress = 0;
        success = false;
        fail = false;
        updateProgressDisplay();
      }
      running = true;
      guardState = 'safe';
      scheduleGuard('safe');
      statusLabel.textContent = 'だるまさんがころんだ！安全な時だけ前進しよう';
      lastTs = 0;
      disableHost();
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

  window.registerMiniGame({ id: 'darumasan', name: 'だるまさんがころんだ', description: '引っかからずにゴールできれば50EXP', create });
})();

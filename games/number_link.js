(function(){
  function create(root, awardXp, opts){
    const difficulty = (opts && opts.difficulty) || 'NORMAL';
    const localization = opts?.localization || (typeof window !== 'undefined' && typeof window.createMiniGameLocalization === 'function'
      ? window.createMiniGameLocalization({ id: 'number_link' })
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
        try { return localization.formatNumber(value, options); } catch {}
      }
      if (typeof Intl !== 'undefined' && typeof Intl.NumberFormat === 'function'){
        try { return new Intl.NumberFormat(undefined, options).format(value); } catch {}
      }
      if (value != null && typeof value.toLocaleString === 'function'){
        try { return value.toLocaleString(undefined, options); } catch {}
      }
      return String(value ?? '');
    };

    const configMap = {
      EASY: {
        width: 5,
        height: 5,
        pairs: 3,
        minPath: 5,
        maxPath: 9,
        pairXp: 6,
        clearXp: 65
      },
      NORMAL: {
        width: 6,
        height: 6,
        pairs: 4,
        minPath: 6,
        maxPath: 11,
        pairXp: 11,
        clearXp: 140
      },
      HARD: {
        width: 7,
        height: 7,
        pairs: 5,
        minPath: 7,
        maxPath: 13,
        pairXp: 18,
        clearXp: 260
      }
    };
    const config = configMap[difficulty] || configMap.NORMAL;

    const wrapper = document.createElement('div');
    wrapper.style.maxWidth = '640px';
    wrapper.style.margin = '0 auto';
    wrapper.style.padding = '18px 20px 24px';
    wrapper.style.boxSizing = 'border-box';
    wrapper.style.background = '#0b1220';
    wrapper.style.borderRadius = '20px';
    wrapper.style.boxShadow = '0 18px 36px rgba(8,15,40,0.65)';
    wrapper.style.color = '#f8fafc';
    wrapper.style.fontFamily = "'Segoe UI', system-ui, sans-serif";
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.gap = '16px';

    const title = document.createElement('div');
    title.style.fontSize = '22px';
    title.style.fontWeight = '700';
    title.style.letterSpacing = '0.01em';
    wrapper.appendChild(title);

    const description = document.createElement('div');
    description.style.fontSize = '13px';
    description.style.lineHeight = '1.5';
    description.style.opacity = '0.88';
    wrapper.appendChild(description);

    const infoBar = document.createElement('div');
    infoBar.style.display = 'grid';
    infoBar.style.gridTemplateColumns = 'repeat(auto-fit, minmax(120px, 1fr))';
    infoBar.style.gap = '10px';
    infoBar.style.fontSize = '13px';
    infoBar.style.background = 'rgba(15,23,42,0.55)';
    infoBar.style.padding = '10px 14px';
    infoBar.style.borderRadius = '12px';
    wrapper.appendChild(infoBar);

    const infoItems = [];
    function createInfo(labelKey, fallback){
      const block = document.createElement('div');
      block.style.display = 'flex';
      block.style.flexDirection = 'column';
      block.style.gap = '2px';
      const label = document.createElement('span');
      label.style.opacity = '0.7';
      const value = document.createElement('span');
      value.style.fontWeight = '600';
      value.style.fontVariantNumeric = 'tabular-nums';
      block.appendChild(label);
      block.appendChild(value);
      infoBar.appendChild(block);
      const item = {
        labelKey,
        labelFallback: fallback,
        label,
        value,
        refreshLabel(){ label.textContent = text(labelKey, fallback); }
      };
      item.refreshLabel();
      infoItems.push(item);
      return item;
    }

    const infoDifficulty = createInfo('.info.difficulty', '難易度');
    const infoProgress = createInfo('.info.progress', '接続済み');
    const infoPathCells = createInfo('.info.pathCells', '使用マス');

    const canvasFrame = document.createElement('div');
    canvasFrame.style.background = 'rgba(15,23,42,0.72)';
    canvasFrame.style.borderRadius = '18px';
    canvasFrame.style.padding = '16px';
    canvasFrame.style.boxShadow = '0 0 0 1px rgba(148,163,184,0.18) inset, 0 20px 35px rgba(2,6,23,0.55) inset';
    canvasFrame.style.display = 'flex';
    canvasFrame.style.justifyContent = 'center';
    canvasFrame.style.alignItems = 'center';

    const canvas = document.createElement('canvas');
    canvas.width = 520;
    canvas.height = 520;
    canvas.style.maxWidth = '100%';
    canvas.style.height = 'auto';
    canvas.style.borderRadius = '12px';
    canvas.style.background = '#020617';
    canvas.style.touchAction = 'none';
    canvasFrame.appendChild(canvas);
    wrapper.appendChild(canvasFrame);

    const actions = document.createElement('div');
    actions.style.display = 'flex';
    actions.style.flexWrap = 'wrap';
    actions.style.gap = '10px';

    function makeButton(labelKey, fallback){
      const btn = document.createElement('button');
      btn.textContent = text(labelKey, fallback);
      btn.style.padding = '10px 16px';
      btn.style.borderRadius = '999px';
      btn.style.border = 'none';
      btn.style.background = 'linear-gradient(135deg, #22d3ee, #6366f1)';
      btn.style.color = '#0f172a';
      btn.style.fontWeight = '600';
      btn.style.cursor = 'pointer';
      btn.style.boxShadow = '0 10px 25px rgba(99,102,241,0.35)';
      btn.style.transition = 'transform 0.15s ease';
      btn.addEventListener('pointerenter', ()=>{ btn.style.transform = 'translateY(-1px)'; });
      btn.addEventListener('pointerleave', ()=>{ btn.style.transform = 'translateY(0)'; });
      btn.refreshLabel = ()=>{ btn.textContent = text(labelKey, fallback); };
      return btn;
    }

    const resetButton = makeButton('.actions.reset', 'リセット');
    const shuffleButton = makeButton('.actions.shuffle', '新しいパズル');
    actions.appendChild(resetButton);
    actions.appendChild(shuffleButton);
    wrapper.appendChild(actions);

    root.appendChild(wrapper);

    const ctx = canvas.getContext('2d');

    function shuffle(array){
      for (let i = array.length - 1; i > 0; i--){
        const j = (Math.random() * (i + 1)) | 0;
        const tmp = array[i];
        array[i] = array[j];
        array[j] = tmp;
      }
      return array;
    }

    function indexOf(x, y, width){
      return y * width + x;
    }
    function toPoint(index, width){
      return { x: index % width, y: Math.floor(index / width) };
    }

    function fallbackPaths(params){
      const { width, height } = params;
      if (width === 5 && height === 5){
        return [
          [indexOf(0, 0, width), indexOf(0, 1, width), indexOf(0, 2, width), indexOf(0, 3, width), indexOf(0, 4, width)],
          [indexOf(4, 0, width), indexOf(3, 0, width), indexOf(3, 1, width), indexOf(3, 2, width), indexOf(3, 3, width), indexOf(4, 3, width), indexOf(4, 4, width)],
          [indexOf(2, 0, width), indexOf(2, 1, width), indexOf(1, 1, width), indexOf(1, 2, width), indexOf(2, 2, width), indexOf(2, 3, width), indexOf(2, 4, width)]
        ];
      }
      if (width === 6 && height === 6){
        return [
          [indexOf(0, 0, width), indexOf(0, 1, width), indexOf(0, 2, width), indexOf(0, 3, width), indexOf(0, 4, width), indexOf(0, 5, width)],
          [indexOf(5, 0, width), indexOf(5, 1, width), indexOf(5, 2, width), indexOf(5, 3, width), indexOf(5, 4, width), indexOf(5, 5, width)],
          [indexOf(1, 2, width), indexOf(2, 2, width), indexOf(3, 2, width), indexOf(4, 2, width)],
          [indexOf(1, 4, width), indexOf(2, 4, width), indexOf(3, 4, width), indexOf(4, 4, width)]
        ];
      }
      if (width === 7 && height === 7){
        return [
          [indexOf(0, 0, width), indexOf(0, 1, width), indexOf(0, 2, width), indexOf(0, 3, width), indexOf(0, 4, width), indexOf(0, 5, width), indexOf(0, 6, width)],
          [indexOf(6, 0, width), indexOf(6, 1, width), indexOf(6, 2, width), indexOf(6, 3, width), indexOf(6, 4, width), indexOf(6, 5, width), indexOf(6, 6, width)],
          [indexOf(1, 0, width), indexOf(2, 0, width), indexOf(3, 0, width), indexOf(4, 0, width), indexOf(5, 0, width)],
          [indexOf(1, 6, width), indexOf(2, 6, width), indexOf(3, 6, width), indexOf(4, 6, width), indexOf(5, 6, width)],
          [indexOf(1, 3, width), indexOf(2, 3, width), indexOf(3, 3, width), indexOf(4, 3, width), indexOf(5, 3, width)]
        ];
      }
      return null;
    }

    function generatePuzzle(params){
      const { width, height, pairs, minPath, maxPath } = params;
      const totalCells = width * height;
      const minLenClamp = Math.max(2, minPath);
      const maxLenClamp = Math.max(minLenClamp, maxPath);

      function attempt(minLen, maxLen){
        const occupied = new Set();
        const cells = [];
        for (let y = 0; y < height; y++){
          for (let x = 0; x < width; x++){
            cells.push(indexOf(x, y, width));
          }
        }
        const pairPaths = [];
        for (let pairIndex = 0; pairIndex < pairs; pairIndex++){
          const remainingPairs = pairs - pairIndex;
          const remainingCells = totalCells - occupied.size;
          let usableMax = Math.min(maxLen, remainingCells - (remainingPairs - 1) * minLen);
          let usableMin = Math.min(minLen, usableMax);
          if (usableMax < 2 || usableMin < 2){
            return null;
          }
          let found = false;
          const availableStarts = cells.filter(idx => !occupied.has(idx));
          shuffle(availableStarts);
          for (let startIdx of availableStarts){
            const startPoint = toPoint(startIdx, width);
            const neighbors = [];
            const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
            for (const [dx, dy] of dirs){
              const nx = startPoint.x + dx;
              const ny = startPoint.y + dy;
              if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
              const nIdx = indexOf(nx, ny, width);
              if (!occupied.has(nIdx)) neighbors.push(nIdx);
            }
            if (neighbors.length === 0) continue;
            for (let trial = 0; trial < 120; trial++){
              const targetLen = usableMin + ((Math.random() * (Math.max(1, usableMax - usableMin + 1))) | 0);
              const path = [startIdx];
              const visited = new Set(path);
              let successWalk = false;
              for (let step = 0; step < targetLen * 4; step++){
                const current = path[path.length - 1];
                const point = toPoint(current, width);
                const moves = [];
                for (const [dx, dy] of dirs){
                  const nx = point.x + dx;
                  const ny = point.y + dy;
                  if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
                  const nIdx = indexOf(nx, ny, width);
                  if (occupied.has(nIdx) || visited.has(nIdx)) continue;
                  moves.push(nIdx);
                }
                if (moves.length === 0){
                  break;
                }
                const choice = moves[(Math.random() * moves.length) | 0];
                path.push(choice);
                visited.add(choice);
                if (path.length >= targetLen){
                  if (path[path.length - 1] !== path[0]){
                    successWalk = true;
                  }
                  if (path.length >= targetLen && (path.length >= usableMax || Math.random() < 0.4)){
                    break;
                  }
                }
              }
              if (successWalk && path.length >= usableMin && path[0] !== path[path.length - 1]){
                found = true;
                pairPaths.push(path);
                for (const idx of path){
                  occupied.add(idx);
                }
                break;
              }
            }
            if (found) break;
          }
          if (!found) return null;
        }
        return pairPaths;
      }

      let minLen = minLenClamp;
      let maxLen = maxLenClamp;
      for (let attempt = 0; attempt < 60; attempt++){
        const result = attempt(minLen, maxLen);
        if (result) return result;
        if (minLen > 3){
          minLen -= 1;
        } else if (maxLen > minLen){
          maxLen -= 1;
        } else {
          break;
        }
      }
      return null;
    }

    function colorStroke(index){
      const hue = (index * 67) % 360;
      return `hsl(${hue} 82% 58%)`;
    }
    function colorFill(index){
      const hue = (index * 67) % 360;
      return `hsla(${hue} 82% 58% / 0.24)`;
    }

    let puzzle = null;
    let pairsState = [];
    let numbersMap = new Map();
    let occupancy = [];
    let running = false;
    let solved = false;
    let activePairId = -1;
    let pointerActive = false;
    let awardedClear = false;

    function setupPuzzle(){
      let rawPaths = generatePuzzle(config);
      if (!rawPaths){
        rawPaths = fallbackPaths(config);
      }
      if (!rawPaths){
        throw new Error('Failed to generate puzzle');
      }
      puzzle = {
        width: config.width,
        height: config.height,
        totalCells: config.width * config.height,
        solutions: rawPaths
      };
      numbersMap = new Map();
      pairsState = rawPaths.map((indices, pairIdx) => {
        const first = indices[0];
        const last = indices[indices.length - 1];
        const firstPoint = toPoint(first, puzzle.width);
        const lastPoint = toPoint(last, puzzle.width);
        numbersMap.set(first, { pairId: pairIdx, value: pairIdx + 1 });
        numbersMap.set(last, { pairId: pairIdx, value: pairIdx + 1 });
        return {
          id: pairIdx,
          value: pairIdx + 1,
          solution: indices.slice(),
          path: [],
          endpoints: [
            { index: first, x: firstPoint.x, y: firstPoint.y },
            { index: last, x: lastPoint.x, y: lastPoint.y }
          ],
          completed: false,
          awarded: false
        };
      });
      occupancy = new Array(puzzle.totalCells).fill(-1);
      solved = false;
      activePairId = -1;
      pointerActive = false;
      awardedClear = false;
      updateTexts();
      draw();
    }

    function resetPaths(){
      pairsState.forEach(pair => {
        pair.path = [];
        pair.completed = false;
        pair.awarded = false;
      });
      occupancy.fill(-1);
      solved = false;
      awardedClear = false;
      activePairId = -1;
      pointerActive = false;
      updateTexts();
      draw();
    }

    function indexFromEvent(e){
      const rect = canvas.getBoundingClientRect();
      const size = Math.min(canvas.width, canvas.height);
      const padding = 24;
      const cellSize = Math.floor((size - padding * 2) / Math.max(puzzle.width, puzzle.height));
      const boardSizeX = cellSize * puzzle.width;
      const boardSizeY = cellSize * puzzle.height;
      const startX = (canvas.width - boardSizeX) / 2;
      const startY = (canvas.height - boardSizeY) / 2;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const gridX = Math.floor((x - startX) / cellSize);
      const gridY = Math.floor((y - startY) / cellSize);
      if (gridX < 0 || gridX >= puzzle.width || gridY < 0 || gridY >= puzzle.height){
        return -1;
      }
      return indexOf(gridX, gridY, puzzle.width);
    }

    function rebuildOccupancy(){
      occupancy.fill(-1);
      pairsState.forEach(pair => {
        pair.path.forEach(idx => {
          occupancy[idx] = pair.id;
        });
      });
    }

    function isAdjacent(a, b){
      if (a === -1 || b === -1) return false;
      const ax = a % puzzle.width;
      const ay = Math.floor(a / puzzle.width);
      const bx = b % puzzle.width;
      const by = Math.floor(b / puzzle.width);
      return (Math.abs(ax - bx) + Math.abs(ay - by)) === 1;
    }

    function ensurePairPath(pair, startIdx){
      if (pair.completed){
        // allow rebuilding path from endpoint
        const isEndpoint = pair.endpoints.some(ep => ep.index === startIdx);
        if (!isEndpoint) return false;
        pair.path = [];
        pair.completed = false;
      }
      if (pair.path.length === 0){
        pair.path = [startIdx];
        rebuildOccupancy();
        return true;
      }
      const currentIndex = pair.path.indexOf(startIdx);
      if (currentIndex === -1){
        const isEndpoint = pair.endpoints.some(ep => ep.index === startIdx);
        if (!isEndpoint) return false;
        pair.path = [startIdx];
        rebuildOccupancy();
        return true;
      }
      if (currentIndex === pair.path.length - 1){
        return true;
      }
      if (currentIndex === 0){
        pair.path.reverse();
        return true;
      }
      pair.path = pair.path.slice(0, currentIndex + 1);
      rebuildOccupancy();
      return true;
    }

    function updatePairCompletion(pair){
      const [a, b] = pair.endpoints.map(ep => ep.index);
      if (pair.path.length >= 2 && ((pair.path[0] === a && pair.path[pair.path.length - 1] === b) || (pair.path[0] === b && pair.path[pair.path.length - 1] === a))){
        if (!pair.completed){
          pair.completed = true;
          if (!pair.awarded && typeof awardXp === 'function'){
            try {
              awardXp(config.pairXp, { pair: pair.value, difficulty });
            } catch {}
          }
          pair.awarded = true;
        }
      } else {
        if (pair.completed){
          pair.completed = false;
        }
      }
    }

    function checkSolved(){
      const allComplete = pairsState.every(pair => pair.completed);
      if (allComplete && !solved){
        solved = true;
        if (!awardedClear && typeof awardXp === 'function'){
          awardedClear = true;
          try {
            awardXp(config.clearXp, { difficulty, clear: true });
          } catch {}
        }
      } else if (!allComplete){
        solved = false;
      }
    }

    function updateTexts(){
      title.textContent = text('.title', 'ナンバーリンク');
      description.textContent = text('.description', '同じ数字のペアを一筆書きでつなげるロジックパズル。線は交差できません。すべてのペアを結んでクリアを目指しましょう。');
      infoDifficulty.value.textContent = text(`difficulty.${difficulty.toLowerCase()}`, () => difficulty, { difficulty });
      const connected = pairsState.filter(pair => pair.completed).length;
      const progressLabel = text('.info.progressValue', () => `${connected}/${pairsState.length}`, {
        connected,
        total: pairsState.length
      });
      infoProgress.value.textContent = progressLabel;
      const usedCells = pairsState.reduce((acc, pair) => acc + pair.path.length, 0);
      infoPathCells.value.textContent = formatNumber(usedCells, { maximumFractionDigits: 0 });
      infoItems.forEach(item => item.refreshLabel());
      resetButton.refreshLabel();
      shuffleButton.refreshLabel();
    }

    function draw(){
      if (!puzzle) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const pad = 24;
      const cellSize = Math.floor((Math.min(canvas.width, canvas.height) - pad * 2) / Math.max(puzzle.width, puzzle.height));
      const boardW = cellSize * puzzle.width;
      const boardH = cellSize * puzzle.height;
      const originX = (canvas.width - boardW) / 2;
      const originY = (canvas.height - boardH) / 2;

      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(148,163,184,0.25)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= puzzle.width; x++){
        const px = originX + x * cellSize + 0.5;
        ctx.beginPath();
        ctx.moveTo(px, originY);
        ctx.lineTo(px, originY + boardH);
        ctx.stroke();
      }
      for (let y = 0; y <= puzzle.height; y++){
        const py = originY + y * cellSize + 0.5;
        ctx.beginPath();
        ctx.moveTo(originX, py);
        ctx.lineTo(originX + boardW, py);
        ctx.stroke();
      }

      function cellCenter(idx){
        const pt = toPoint(idx, puzzle.width);
        return {
          x: originX + pt.x * cellSize + cellSize / 2,
          y: originY + pt.y * cellSize + cellSize / 2
        };
      }

      pairsState.forEach(pair => {
        if (pair.path.length < 2) return;
        ctx.save();
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.lineWidth = cellSize * 0.55;
        ctx.strokeStyle = colorStroke(pair.id);
        ctx.globalAlpha = pair.id === activePairId ? 0.95 : 0.78;
        ctx.beginPath();
        const firstCenter = cellCenter(pair.path[0]);
        ctx.moveTo(firstCenter.x, firstCenter.y);
        for (let i = 1; i < pair.path.length; i++){
          const c = cellCenter(pair.path[i]);
          ctx.lineTo(c.x, c.y);
        }
        ctx.stroke();
        ctx.restore();
      });

      pairsState.forEach(pair => {
        pair.path.forEach(idx => {
          const pt = toPoint(idx, puzzle.width);
          const x = originX + pt.x * cellSize + 1;
          const y = originY + pt.y * cellSize + 1;
          ctx.fillStyle = colorFill(pair.id);
          ctx.globalAlpha = 1;
          ctx.fillRect(x, y, cellSize - 2, cellSize - 2);
        });
      });

      numbersMap.forEach((info, idx) => {
        const pair = pairsState[info.pairId];
        const center = cellCenter(idx);
        ctx.beginPath();
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = colorStroke(pair.id);
        ctx.lineWidth = 3;
        ctx.arc(center.x, center.y, cellSize * 0.32, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#f8fafc';
        ctx.font = `${Math.floor(cellSize * 0.4)}px "Segoe UI", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(info.value), center.x, center.y + 1);
      });

      if (solved){
        const message = text('.status.cleared', 'クリア！');
        ctx.fillStyle = 'rgba(15,118,110,0.82)';
        ctx.font = '28px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(message, canvas.width / 2, originY - 12);
      }
    }

    function handlePointerDown(e){
      if (!running || !puzzle) return;
      const idx = indexFromEvent(e);
      if (idx < 0) return;
      const occupying = occupancy[idx];
      const numberInfo = numbersMap.get(idx);
      const pairId = occupying >= 0 ? occupying : (numberInfo ? numberInfo.pairId : -1);
      if (pairId < 0) return;
      const pair = pairsState[pairId];
      if (occupying >= 0 && occupying !== pairId) return;
      if (!ensurePairPath(pair, idx)) return;
      activePairId = pairId;
      pointerActive = true;
      canvas.setPointerCapture(e.pointerId);
      updatePairCompletion(pair);
      checkSolved();
      updateTexts();
      draw();
    }

    function handlePointerMove(e){
      if (!running || !pointerActive) return;
      const idx = indexFromEvent(e);
      if (idx < 0) return;
      const pair = pairsState[activePairId];
      const last = pair.path[pair.path.length - 1];
      if (idx === last) return;
      if (!isAdjacent(last, idx)) return;
      const occupying = occupancy[idx];
      if (occupying >= 0 && occupying !== pair.id){
        return;
      }
      const pos = pair.path.indexOf(idx);
      if (pos >= 0){
        pair.path = pair.path.slice(0, pos + 1);
      } else {
        pair.path.push(idx);
      }
      rebuildOccupancy();
      updatePairCompletion(pair);
      checkSolved();
      updateTexts();
      draw();
    }

    function handlePointerUp(e){
      if (!pointerActive) return;
      pointerActive = false;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {}
      const pair = pairsState[activePairId];
      updatePairCompletion(pair);
      checkSolved();
      updateTexts();
      draw();
    }

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);

    resetButton.addEventListener('click', () => {
      resetPaths();
      if (typeof awardXp === 'function'){
        try { awardXp(0, { reset: true }); } catch {}
      }
    });
    shuffleButton.addEventListener('click', () => {
      setupPuzzle();
    });

    let detachLocale = null;
    if (localization && typeof localization.on === 'function'){
      detachLocale = localization.on('change', () => {
        updateTexts();
        draw();
      });
    }

    setupPuzzle();

    function start(){
      running = true;
    }
    function stop(){
      running = false;
      pointerActive = false;
      activePairId = -1;
    }
    function destroy(){
      stop();
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
      resetButton.remove();
      shuffleButton.remove();
      wrapper.remove();
      if (detachLocale) try { detachLocale(); } catch {}
    }
    function getScore(){
      const completed = pairsState.filter(pair => pair.completed).length;
      return completed / pairsState.length;
    }

    return { start, stop, destroy, getScore };
  }

  if (typeof window !== 'undefined' && typeof window.registerMiniGame === 'function'){
    window.registerMiniGame({
      id: 'number_link',
      name: 'ナンバーリンク',
      nameKey: 'selection.miniexp.games.number_link.name',
      description: '同じ数字を線で結ぶロジックパズル',
      descriptionKey: 'selection.miniexp.games.number_link.description',
      categoryIds: ['puzzle'],
      categories: ['パズル'],
      category: 'パズル',
      create
    });
  }
})();

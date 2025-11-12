(function(){
  const STYLE_ID = 'numbersum-sudoku-style';
  const STYLE_CONTENT = `
    .numbersum-root{font-family:'Segoe UI',system-ui,sans-serif;color:#0f172a;background:linear-gradient(135deg,#f8fafc,#e0f2fe);padding:20px 22px;border-radius:18px;box-shadow:0 18px 40px rgba(15,23,42,0.18);max-width:720px;margin:0 auto;box-sizing:border-box;}
    .numbersum-root h2{margin:0 0 6px;font-size:24px;font-weight:700;color:#0f172a;}
    .numbersum-root p{margin:0 0 12px;line-height:1.6;font-size:14px;color:#1e293b;}
    .numbersum-controls{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;align-items:center;}
    .numbersum-mode-toggle{display:flex;border-radius:999px;background:#dbeafe;padding:4px;gap:4px;}
    .numbersum-mode-toggle button{border:none;background:transparent;color:#1e3a8a;font-weight:600;padding:8px 18px;border-radius:999px;font-size:13px;cursor:pointer;transition:background 0.2s,color 0.2s;}
    .numbersum-mode-toggle button.active{background:#1d4ed8;color:#f8fafc;box-shadow:0 4px 14px rgba(29,78,216,0.28);}
    .numbersum-mode-toggle button:focus-visible{outline:2px solid rgba(37,99,235,0.6);outline-offset:2px;}
    .numbersum-reset{margin-left:auto;padding:8px 14px;font-size:12px;border-radius:10px;border:none;background:#f8fafc;color:#1e293b;box-shadow:0 2px 10px rgba(15,23,42,0.12);cursor:pointer;font-weight:600;transition:background 0.2s,color 0.2s;}
    .numbersum-reset:hover{background:#1e293b;color:#e0f2fe;}
    .numbersum-board{display:grid;grid-template-columns:48px repeat(var(--numbersum-size),68px) 48px;grid-template-rows:48px repeat(var(--numbersum-size),68px) 48px;gap:4px;align-items:stretch;justify-items:stretch;margin:0 auto;}
    .numbersum-top-labels,.numbersum-bottom-labels{display:grid;grid-template-columns:repeat(var(--numbersum-size),1fr);gap:4px;}
    .numbersum-left-labels,.numbersum-right-labels{display:grid;grid-template-rows:repeat(var(--numbersum-size),1fr);gap:4px;}
    .numbersum-edge-label{background:#1e3a8a;color:#e0f2fe;border-radius:12px;padding:8px 6px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:12px;box-shadow:0 6px 16px rgba(30,58,138,0.26);transition:transform 0.2s,background 0.2s,box-shadow 0.2s;min-width:0;}
    .numbersum-edge-label .numbersum-target{font-weight:700;font-size:15px;}
    .numbersum-edge-label .numbersum-current{font-size:11px;opacity:0.75;}
    .numbersum-edge-label.ok{background:#16a34a;box-shadow:0 6px 16px rgba(22,163,74,0.32);}
    .numbersum-edge-label.ok .numbersum-current{opacity:1;}
    .numbersum-edge-label.over{background:#b91c1c;box-shadow:0 6px 16px rgba(185,28,28,0.32);}
    .numbersum-edge-label.under{background:#334155;}
    .numbersum-grid{display:grid;grid-template-columns:repeat(var(--numbersum-size),68px);grid-template-rows:repeat(var(--numbersum-size),68px);gap:4px;}
    .numbersum-cell{position:relative;border:none;border-radius:16px;background:var(--numbersum-cell-bg,#bfdbfe);box-shadow:0 10px 24px rgba(30,64,175,0.22);color:#0f172a;font-weight:700;font-size:24px;cursor:pointer;transition:transform 0.15s,box-shadow 0.15s;display:flex;align-items:center;justify-content:center;}
    .numbersum-cell:hover{transform:translateY(-2px);box-shadow:0 14px 30px rgba(30,64,175,0.28);}
    .numbersum-cell.circled::after{content:'';position:absolute;inset:12px;border:4px solid rgba(15,23,42,0.9);border-radius:999px;pointer-events:none;box-shadow:0 0 0 2px rgba(255,255,255,0.45);}
    .numbersum-grid[data-mode='erase'] .numbersum-cell{cursor:not-allowed;}
    .numbersum-cell .numbersum-region-label{position:absolute;top:8px;left:10px;font-size:11px;font-weight:600;color:rgba(15,23,42,0.88);background:rgba(255,255,255,0.78);padding:2px 6px;border-radius:999px;box-shadow:0 2px 8px rgba(15,23,42,0.18);display:flex;gap:4px;align-items:center;transition:background 0.2s,color 0.2s,box-shadow 0.2s;}
    .numbersum-region-label .numbersum-target{font-weight:700;}
    .numbersum-region-label .numbersum-current{opacity:0.8;}
    .numbersum-region-label.ok{background:rgba(134,239,172,0.92);color:#052e16;box-shadow:0 4px 12px rgba(21,128,61,0.28);}
    .numbersum-region-label.over{background:rgba(248,113,113,0.92);color:#450a0a;}
    .numbersum-region-label.under{background:rgba(255,255,255,0.7);color:#0f172a;}
    .numbersum-status{margin-top:16px;padding:12px 14px;border-radius:12px;background:#1e293b;color:#e2e8f0;font-size:13px;line-height:1.5;box-shadow:0 10px 30px rgba(15,23,42,0.25);display:flex;gap:12px;align-items:flex-start;}
    .numbersum-status-icon{font-size:18px;line-height:1;}
    .numbersum-status p{margin:0;}
    @media (max-width:680px){
      .numbersum-board{grid-template-columns:32px repeat(var(--numbersum-size),minmax(48px,1fr)) 32px;grid-template-rows:32px repeat(var(--numbersum-size),minmax(48px,1fr)) 32px;}
      .numbersum-cell{font-size:18px;border-radius:12px;}
      .numbersum-cell.circled::after{inset:10px;border-width:3px;}
      .numbersum-edge-label{padding:6px 4px;border-radius:10px;font-size:11px;}
      .numbersum-edge-label .numbersum-target{font-size:13px;}
    }
  `;

  const DEFAULT_PUZZLE = {
    size: 5,
    grid: [
      [4, 3, 6, 1, 2],
      [5, 2, 1, 7, 6],
      [9, 1, 8, 2, 3],
      [7, 6, 2, 5, 4],
      [3, 8, 4, 6, 9]
    ],
    rowTargets: [10, 9, 12, 8, 13],
    columnTargets: [13, 8, 12, 7, 12],
    regions: [
      {
        id: 'r1',
        color: '#fca5a5',
        target: 6,
        cells: [[0,0],[0,1],[1,0],[1,1]],
        labelAt: [0,0]
      },
      {
        id: 'r2',
        color: '#bfdbfe',
        target: 16,
        cells: [[0,2],[0,3],[0,4],[1,3],[1,4],[2,4]],
        labelAt: [0,3]
      },
      {
        id: 'r3',
        color: '#fde68a',
        target: 9,
        cells: [[1,2],[2,0],[2,1],[2,2],[2,3],[3,0]],
        labelAt: [2,1]
      },
      {
        id: 'r4',
        color: '#c4b5fd',
        target: 12,
        cells: [[3,1],[3,2],[3,3],[4,1],[4,2]],
        labelAt: [3,2]
      },
      {
        id: 'r5',
        color: '#6ee7b7',
        target: 9,
        cells: [[3,4],[4,0],[4,3],[4,4]],
        labelAt: [4,4]
      }
    ],
    solution: new Set(['0,0','0,2','1,1','1,3','2,0','2,4','3,1','3,2','4,2','4,4'])
  };

  function ensureStyle(){
    if (typeof document === 'undefined') return;
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.type = 'text/css';
    style.textContent = STYLE_CONTENT;
    document.head.appendChild(style);
  }

  function normalizePuzzle(raw){
    if (!raw || typeof raw !== 'object') return DEFAULT_PUZZLE;
    const grid = Array.isArray(raw.grid) ? raw.grid.map(row => Array.isArray(row) ? row.slice() : []) : [];
    const size = Number.isInteger(raw.size) ? raw.size : grid.length;
    if (!size || size <= 0) return DEFAULT_PUZZLE;
    if (grid.length !== size || grid.some(row => row.length !== size)) return DEFAULT_PUZZLE;
    const rowTargets = Array.isArray(raw.rowTargets) && raw.rowTargets.length === size
      ? raw.rowTargets.slice()
      : DEFAULT_PUZZLE.rowTargets.slice();
    const columnTargets = Array.isArray(raw.columnTargets) && raw.columnTargets.length === size
      ? raw.columnTargets.slice()
      : DEFAULT_PUZZLE.columnTargets.slice();
    const regionDefs = Array.isArray(raw.regions) ? raw.regions : DEFAULT_PUZZLE.regions;
    const regions = regionDefs.map((region, idx) => {
      const fallback = DEFAULT_PUZZLE.regions[idx] || DEFAULT_PUZZLE.regions[0];
      const cells = Array.isArray(region?.cells) && region.cells.every(cell => Array.isArray(cell) && cell.length === 2)
        ? region.cells.map(cell => [Number(cell[0]), Number(cell[1])])
        : fallback.cells;
      return {
        id: String(region?.id || fallback.id || `region-${idx}`),
        color: region?.color || fallback.color,
        target: Number.isFinite(region?.target) ? Number(region.target) : fallback.target,
        cells,
        labelAt: Array.isArray(region?.labelAt) && region.labelAt.length === 2 ? [Number(region.labelAt[0]), Number(region.labelAt[1])] : (fallback.labelAt || cells[0])
      };
    });
    const solution = raw.solution instanceof Set
      ? new Set(Array.from(raw.solution))
      : Array.isArray(raw.solution)
        ? new Set(raw.solution.map(String))
        : (DEFAULT_PUZZLE.solution instanceof Set ? new Set(Array.from(DEFAULT_PUZZLE.solution)) : new Set());
    return { size, grid, rowTargets, columnTargets, regions, solution };
  }

  function create(root, awardXp, opts){
    if (!root) throw new Error('Number Sum Sudoku requires a root element');
    ensureStyle();

    const localization = opts?.localization || (typeof window !== 'undefined' && typeof window.createMiniGameLocalization === 'function'
      ? window.createMiniGameLocalization({ id: 'number_sum_sudoku', textKeyPrefix: 'miniexp.games.number_sum_sudoku' })
      : null);
    const text = (key, fallback, params) => {
      if (localization && typeof localization.t === 'function'){
        return localization.t(key, fallback, params);
      }
      if (typeof fallback === 'function') return fallback(params);
      return fallback ?? '';
    };

    const puzzle = normalizePuzzle(opts?.puzzle || DEFAULT_PUZZLE);
    const cellToRegion = Array.from({ length: puzzle.size }, () => Array(puzzle.size).fill(null));
    const regionIndexMap = new Map();
    puzzle.regions.forEach((region, index) => {
      regionIndexMap.set(region.id, index);
      region.cells.forEach(([r,c]) => {
        if (r >= 0 && r < puzzle.size && c >= 0 && c < puzzle.size){
          cellToRegion[r][c] = region;
        }
      });
    });

    const state = {
      mode: 'circle',
      circled: new Set(),
      completed: false
    };

    const cleanupTasks = [];
    const rootContainer = document.createElement('div');
    rootContainer.className = 'numbersum-root';
    root.appendChild(rootContainer);

    const title = document.createElement('h2');
    const description = document.createElement('p');
    rootContainer.appendChild(title);
    rootContainer.appendChild(description);

    const controls = document.createElement('div');
    controls.className = 'numbersum-controls';

    const toggle = document.createElement('div');
    toggle.className = 'numbersum-mode-toggle';
    const circleBtn = document.createElement('button');
    circleBtn.textContent = '○ マーク';
    circleBtn.classList.add('active');
    const eraseBtn = document.createElement('button');
    eraseBtn.textContent = '消去';
    toggle.appendChild(circleBtn);
    toggle.appendChild(eraseBtn);
    controls.appendChild(toggle);

    const resetBtn = document.createElement('button');
    resetBtn.className = 'numbersum-reset';
    resetBtn.textContent = 'リセット';
    controls.appendChild(resetBtn);

    rootContainer.appendChild(controls);

    const board = document.createElement('div');
    board.className = 'numbersum-board';
    board.style.setProperty('--numbersum-size', String(puzzle.size));

    const topLabels = document.createElement('div');
    topLabels.className = 'numbersum-top-labels';
    topLabels.style.gridColumn = '2 / span ' + puzzle.size;
    const bottomLabels = document.createElement('div');
    bottomLabels.className = 'numbersum-bottom-labels';
    bottomLabels.style.gridColumn = '2 / span ' + puzzle.size;

    const leftLabels = document.createElement('div');
    leftLabels.className = 'numbersum-left-labels';
    leftLabels.style.gridRow = '2 / span ' + puzzle.size;
    const rightLabels = document.createElement('div');
    rightLabels.className = 'numbersum-right-labels';
    rightLabels.style.gridRow = '2 / span ' + puzzle.size;

    const grid = document.createElement('div');
    grid.className = 'numbersum-grid';
    grid.setAttribute('data-mode', state.mode);

    board.appendChild(document.createElement('div'));
    board.appendChild(topLabels);
    board.appendChild(document.createElement('div'));
    board.appendChild(leftLabels);
    board.appendChild(grid);
    board.appendChild(rightLabels);
    board.appendChild(document.createElement('div'));
    board.appendChild(bottomLabels);
    board.appendChild(document.createElement('div'));

    rootContainer.appendChild(board);

    const statusBox = document.createElement('div');
    statusBox.className = 'numbersum-status';
    const statusIcon = document.createElement('div');
    statusIcon.className = 'numbersum-status-icon';
    const statusText = document.createElement('p');
    statusBox.appendChild(statusIcon);
    statusBox.appendChild(statusText);
    rootContainer.appendChild(statusBox);

    const rowLabelEntries = [];
    const columnLabelEntries = [];
    const regionLabelEntries = [];

    function makeEdgeLabel(target){
      const label = document.createElement('div');
      label.className = 'numbersum-edge-label';
      const targetSpan = document.createElement('div');
      targetSpan.className = 'numbersum-target';
      targetSpan.textContent = String(target);
      const currentSpan = document.createElement('div');
      currentSpan.className = 'numbersum-current';
      currentSpan.textContent = '0';
      label.appendChild(targetSpan);
      label.appendChild(currentSpan);
      return { element: label, current: currentSpan, target: targetSpan };
    }

    puzzle.columnTargets.forEach(target => {
      const topEntry = makeEdgeLabel(target);
      const bottomEntry = makeEdgeLabel(target);
      topLabels.appendChild(topEntry.element);
      bottomLabels.appendChild(bottomEntry.element);
      columnLabelEntries.push({ main: topEntry, mirror: bottomEntry });
    });

    puzzle.rowTargets.forEach(target => {
      const leftEntry = makeEdgeLabel(target);
      const rightEntry = makeEdgeLabel(target);
      leftLabels.appendChild(leftEntry.element);
      rightLabels.appendChild(rightEntry.element);
      rowLabelEntries.push({ main: leftEntry, mirror: rightEntry });
    });

    const regionLabelMap = new Map();

    puzzle.regions.forEach(region => {
      const label = document.createElement('div');
      label.className = 'numbersum-region-label';
      const targetSpan = document.createElement('span');
      targetSpan.className = 'numbersum-target';
      targetSpan.textContent = String(region.target);
      const currentSpan = document.createElement('span');
      currentSpan.className = 'numbersum-current';
      currentSpan.textContent = '0';
      label.appendChild(targetSpan);
      label.appendChild(currentSpan);
      regionLabelMap.set(`${region.labelAt?.[0]},${region.labelAt?.[1]}`, { element: label, current: currentSpan, target: targetSpan, region });
      regionLabelEntries.push({ element: label, current: currentSpan, target: targetSpan, region });
    });

    function keyFor(row, col){
      return `${row},${col}`;
    }

    function setMode(mode){
      if (mode !== 'circle' && mode !== 'erase') return;
      state.mode = mode;
      grid.setAttribute('data-mode', mode);
      if (mode === 'circle'){
        circleBtn.classList.add('active');
        eraseBtn.classList.remove('active');
      } else {
        eraseBtn.classList.add('active');
        circleBtn.classList.remove('active');
      }
    }

    function reset(){
      state.circled.clear();
      state.completed = false;
      setMode('circle');
      Array.from(grid.querySelectorAll('.numbersum-cell')).forEach(cell => {
        cell.classList.remove('circled');
      });
      updateSums();
      updateStatus('🧩', text('status.reset', '合計が一致するように数字を○で囲みましょう。'));
    }

    function updateStatus(icon, message){
      statusIcon.textContent = icon;
      statusText.textContent = message;
    }

    function updateSums(){
      const rowSums = Array(puzzle.size).fill(0);
      const colSums = Array(puzzle.size).fill(0);
      const regionSums = Array(puzzle.regions.length).fill(0);

      state.circled.forEach(key => {
        const [rowStr, colStr] = key.split(',');
        const row = Number(rowStr);
        const col = Number(colStr);
        if (Number.isNaN(row) || Number.isNaN(col)) return;
        const value = puzzle.grid[row]?.[col];
        if (!Number.isFinite(value)) return;
        rowSums[row] += value;
        colSums[col] += value;
        const region = cellToRegion[row]?.[col];
        if (region){
          const idx = regionIndexMap.get(region.id);
          if (idx !== undefined){
            regionSums[idx] += value;
          }
        }
      });

      rowLabelEntries.forEach((entry, idx) => {
        const current = rowSums[idx];
        [entry.main, entry.mirror].forEach(item => {
          item.current.textContent = String(current);
          item.element.classList.remove('ok','over','under');
          if (current === puzzle.rowTargets[idx]){
            item.element.classList.add('ok');
          } else if (current > puzzle.rowTargets[idx]){
            item.element.classList.add('over');
          } else {
            item.element.classList.add('under');
          }
        });
      });

      columnLabelEntries.forEach((entry, idx) => {
        const current = colSums[idx];
        [entry.main, entry.mirror].forEach(item => {
          item.current.textContent = String(current);
          item.element.classList.remove('ok','over','under');
          if (current === puzzle.columnTargets[idx]){
            item.element.classList.add('ok');
          } else if (current > puzzle.columnTargets[idx]){
            item.element.classList.add('over');
          } else {
            item.element.classList.add('under');
          }
        });
      });

      regionLabelEntries.forEach((entry, idx) => {
        const region = puzzle.regions[idx];
        const current = regionSums[idx];
        entry.current.textContent = String(current);
        const element = entry.element;
        element.classList.remove('ok','over','under');
        if (current === region.target){
          element.classList.add('ok');
        } else if (current > region.target){
          element.classList.add('over');
        } else {
          element.classList.add('under');
        }
      });

      const allRowsOk = rowSums.every((sum, idx) => sum === puzzle.rowTargets[idx]);
      const allColsOk = colSums.every((sum, idx) => sum === puzzle.columnTargets[idx]);
      const allRegionsOk = regionSums.every((sum, idx) => sum === puzzle.regions[idx].target);

      if (!state.completed && allRowsOk && allColsOk && allRegionsOk && state.circled.size > 0){
        state.completed = true;
        updateStatus('🎉', text('status.completed', 'お見事！すべての合計が揃いました。'));
        if (typeof awardXp === 'function'){
          try {
            awardXp(220, 'number_sum_sudoku.clear');
          } catch {}
        }
      } else if (!state.completed){
        updateStatus('🧩', text('status.keepGoing', '行・列・エリアの合計が示された値になるよう調整しましょう。'));
      }
    }

    for (let row = 0; row < puzzle.size; row += 1){
      for (let col = 0; col < puzzle.size; col += 1){
        const cell = document.createElement('button');
        cell.className = 'numbersum-cell';
        const region = cellToRegion[row][col];
        if (region){
          cell.style.setProperty('--numbersum-cell-bg', region.color);
        }
        cell.textContent = String(puzzle.grid[row][col]);
        const key = keyFor(row, col);
        if (regionLabelMap.has(key)){
          cell.appendChild(regionLabelMap.get(key).element);
        }
        cell.addEventListener('click', () => {
          if (state.completed) return;
          if (state.mode === 'circle'){
            if (!state.circled.has(key)){
              state.circled.add(key);
              cell.classList.add('circled');
              updateSums();
            }
          } else {
            if (state.circled.delete(key)){
              cell.classList.remove('circled');
              updateSums();
            }
          }
        });
        grid.appendChild(cell);
      }
    }

    const handleCircleClick = () => setMode('circle');
    const handleEraseClick = () => setMode('erase');
    const handleResetClick = () => reset();

    circleBtn.addEventListener('click', handleCircleClick);
    eraseBtn.addEventListener('click', handleEraseClick);
    resetBtn.addEventListener('click', handleResetClick);

    cleanupTasks.push(() => {
      circleBtn.removeEventListener('click', handleCircleClick);
      eraseBtn.removeEventListener('click', handleEraseClick);
      resetBtn.removeEventListener('click', handleResetClick);
    });

    function refreshLocaleTexts(){
      title.textContent = text('title', 'ナンバーサム合計ナンプレ');
      description.textContent = text('description', '行・列・エリア横の合計に一致する数字を○で囲むパズルです。モードを切り替えて○を付けたり外したりしましょう。');
      circleBtn.textContent = text('controls.circle', '○ マーク');
      eraseBtn.textContent = text('controls.erase', '消去');
      resetBtn.textContent = text('controls.reset', 'リセット');
      if (!state.completed){
        updateStatus('🧩', text('status.keepGoing', '行・列・エリアの合計が示された値になるよう調整しましょう。'));
      } else {
        updateStatus('🎉', text('status.completed', 'お見事！すべての合計が揃いました。'));
      }
    }

    refreshLocaleTexts();
    updateSums();

    let detachLocale = null;
    if (localization && typeof localization.onChange === 'function'){
      detachLocale = localization.onChange(() => {
        try {
          refreshLocaleTexts();
        } catch {}
      });
    }

    function destroy(){
      if (detachLocale){
        try { detachLocale(); } catch {}
        detachLocale = null;
      }
      cleanupTasks.forEach(fn => {
        try { fn(); } catch {}
      });
      cleanupTasks.length = 0;
      if (rootContainer.parentNode){
        rootContainer.parentNode.removeChild(rootContainer);
      }
    }

    function start(){ }
    function stop(){ }

    return { start, stop, destroy };
  }

  if (typeof window !== 'undefined' && typeof window.registerMiniGame === 'function'){
    window.registerMiniGame({
      id: 'number_sum_sudoku',
      name: 'ナンバーサム合計ナンプレ',
      nameKey: 'selection.miniexp.games.number_sum_sudoku.name',
      description: '行と列、エリアの合計を満たす数字を○で囲む推理パズル',
      descriptionKey: 'selection.miniexp.games.number_sum_sudoku.description',
      category: 'パズル',
      categories: ['パズル'],
      categoryIds: ['puzzle'],
      create
    });
  }
})();

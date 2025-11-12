(function(){
  /** MiniExp MOD: Rubik's Cube (2D Net)
   *  - All six faces visible simultaneously as a 2D net
   *  - Difficulty controls scramble length
   *  - Rotate faces with buttons to restore solved state
   */
  const FACE_ORDER = ['U', 'L', 'F', 'R', 'B', 'D'];
  const FACE_NAMES = {
    U: '上面 (U)',
    D: '下面 (D)',
    L: '左面 (L)',
    R: '右面 (R)',
    F: '前面 (F)',
    B: '背面 (B)'
  };
  const FACE_COLORS = {
    U: '#f8fafc',      // white
    D: '#facc15',      // yellow
    L: '#f97316',      // orange
    R: '#ef4444',      // red
    F: '#22c55e',      // green
    B: '#3b82f6'       // blue
  };
  const FACE_TEXT_COLORS = {
    U: '#0f172a',
    D: '#0f172a',
    L: '#0f172a',
    R: '#0f172a',
    F: '#0f172a',
    B: '#0f172a'
  };
  const FACE_AXES = { U: 'y', D: 'y', L: 'x', R: 'x', F: 'z', B: 'z' };
  const BASE_MOVES = ['U', 'D', 'L', 'R', 'F', 'B'];

  function createSolvedCube(){
    return {
      U: Array(9).fill('U'),
      D: Array(9).fill('D'),
      L: Array(9).fill('L'),
      R: Array(9).fill('R'),
      F: Array(9).fill('F'),
      B: Array(9).fill('B')
    };
  }

  function rotateFaceCW(face){
    const [a,b,c,d,e,f,g,h,i] = face;
    face[0] = g; face[1] = d; face[2] = a;
    face[3] = h; face[4] = e; face[5] = b;
    face[6] = i; face[7] = f; face[8] = c;
  }

  const BASE_OPERATIONS = {
    U(cube){
      rotateFaceCW(cube.U);
      const t = [cube.F[0], cube.F[1], cube.F[2]];
      [cube.F[0], cube.F[1], cube.F[2]] = [cube.R[0], cube.R[1], cube.R[2]];
      [cube.R[0], cube.R[1], cube.R[2]] = [cube.B[0], cube.B[1], cube.B[2]];
      [cube.B[0], cube.B[1], cube.B[2]] = [cube.L[0], cube.L[1], cube.L[2]];
      [cube.L[0], cube.L[1], cube.L[2]] = t;
    },
    D(cube){
      rotateFaceCW(cube.D);
      const t = [cube.F[6], cube.F[7], cube.F[8]];
      [cube.F[6], cube.F[7], cube.F[8]] = [cube.L[6], cube.L[7], cube.L[8]];
      [cube.L[6], cube.L[7], cube.L[8]] = [cube.B[6], cube.B[7], cube.B[8]];
      [cube.B[6], cube.B[7], cube.B[8]] = [cube.R[6], cube.R[7], cube.R[8]];
      [cube.R[6], cube.R[7], cube.R[8]] = t;
    },
    F(cube){
      rotateFaceCW(cube.F);
      const t = [cube.U[6], cube.U[7], cube.U[8]];
      [cube.U[6], cube.U[7], cube.U[8]] = [cube.L[8], cube.L[5], cube.L[2]];
      [cube.L[8], cube.L[5], cube.L[2]] = [cube.D[2], cube.D[1], cube.D[0]];
      [cube.D[2], cube.D[1], cube.D[0]] = [cube.R[0], cube.R[3], cube.R[6]];
      [cube.R[0], cube.R[3], cube.R[6]] = t;
    },
    B(cube){
      rotateFaceCW(cube.B);
      const t = [cube.U[0], cube.U[1], cube.U[2]];
      [cube.U[0], cube.U[1], cube.U[2]] = [cube.R[2], cube.R[5], cube.R[8]];
      [cube.R[2], cube.R[5], cube.R[8]] = [cube.D[8], cube.D[7], cube.D[6]];
      [cube.D[8], cube.D[7], cube.D[6]] = [cube.L[6], cube.L[3], cube.L[0]];
      [cube.L[6], cube.L[3], cube.L[0]] = t;
    },
    L(cube){
      rotateFaceCW(cube.L);
      const t = [cube.U[0], cube.U[3], cube.U[6]];
      [cube.U[0], cube.U[3], cube.U[6]] = [cube.B[8], cube.B[5], cube.B[2]];
      [cube.B[8], cube.B[5], cube.B[2]] = [cube.D[6], cube.D[3], cube.D[0]];
      [cube.D[6], cube.D[3], cube.D[0]] = [cube.F[0], cube.F[3], cube.F[6]];
      [cube.F[0], cube.F[3], cube.F[6]] = t;
    },
    R(cube){
      rotateFaceCW(cube.R);
      const t = [cube.U[2], cube.U[5], cube.U[8]];
      [cube.U[2], cube.U[5], cube.U[8]] = [cube.F[2], cube.F[5], cube.F[8]];
      [cube.F[2], cube.F[5], cube.F[8]] = [cube.D[2], cube.D[5], cube.D[8]];
      [cube.D[2], cube.D[5], cube.D[8]] = [cube.B[6], cube.B[3], cube.B[0]];
      [cube.B[6], cube.B[3], cube.B[0]] = t;
    }
  };

  function applyBaseOperation(cube, face){
    const op = BASE_OPERATIONS[face];
    if (op) op(cube);
  }

  function applyMove(cube, move){
    if (!move) return;
    const face = move[0];
    const suffix = move.slice(1);
    if (!BASE_OPERATIONS[face]) return;
    if (!suffix){
      applyBaseOperation(cube, face);
    } else if (suffix === "'"){
      applyBaseOperation(cube, face);
      applyBaseOperation(cube, face);
      applyBaseOperation(cube, face);
    } else if (suffix === '2'){
      applyBaseOperation(cube, face);
      applyBaseOperation(cube, face);
    }
  }

  function inverseMove(move){
    if (move.endsWith("'")) return move.slice(0, -1);
    if (move.endsWith('2')) return move;
    return move + "'";
  }

  function isSolved(cube){
    return FACE_ORDER.every((face) => cube[face].every((value) => value === face));
  }

  function randomScramble(cube, steps){
    let previousFace = '';
    let previousAxis = '';
    const sequence = [];
    const options = ['', "'", '2'];
    for (let i = 0; i < steps; i++){
      let face = BASE_MOVES[Math.floor(Math.random() * BASE_MOVES.length)];
      let axis = FACE_AXES[face];
      while (face === previousFace || axis === previousAxis){
        face = BASE_MOVES[Math.floor(Math.random() * BASE_MOVES.length)];
        axis = FACE_AXES[face];
      }
      previousFace = face;
      previousAxis = axis;
      const suffix = options[Math.floor(Math.random() * options.length)];
      const move = face + suffix;
      sequence.push(move);
      applyMove(cube, move);
    }
    return sequence;
  }

  function formatMoveSequence(sequence){
    if (!sequence || !sequence.length) return '-';
    return sequence.join(' ');
  }

  function create(root, awardXp, opts){
    if (!root) throw new Error('Rubik\'s Cube mini-game requires a container element');

    const difficulty = (opts && opts.difficulty) || 'NORMAL';
    const shortcuts = opts?.shortcuts;
    const localization = (opts && opts.localization) || (typeof window !== 'undefined' && typeof window.createMiniGameLocalization === 'function'
      ? window.createMiniGameLocalization({ id: 'rubiks_cube' })
      : null);

    const text = (key, fallback, params) => {
      if (localization && typeof localization.t === 'function'){
        try {
          const result = localization.t(key, fallback, params);
          if (result != null) return result;
        } catch {}
      }
      if (typeof fallback === 'function'){
        try {
          const computed = fallback();
          return typeof computed === 'string' ? computed : (computed ?? '');
        } catch { return ''; }
      }
      return fallback ?? '';
    };

    const formatNumber = (value, options) => {
      if (localization && typeof localization.formatNumber === 'function'){
        try { return localization.formatNumber(value, options); } catch {}
      }
      if (typeof Intl !== 'undefined' && typeof Intl.NumberFormat === 'function'){
        try { return new Intl.NumberFormat(undefined, options).format(value); } catch {}
      }
      if (value == null) return '0';
      return String(value);
    };

    const scrambleStepsMap = { EASY: 12, NORMAL: 25, HARD: 45 };
    const moveXpMap = { EASY: 0.35, NORMAL: 0.5, HARD: 0.75 };
    const solveXpMap = { EASY: 24, NORMAL: 60, HARD: 120 };
    const scrambleSteps = scrambleStepsMap[difficulty] || scrambleStepsMap.NORMAL;
    const moveXp = moveXpMap[difficulty] ?? moveXpMap.NORMAL;
    const solveXp = solveXpMap[difficulty] ?? solveXpMap.NORMAL;

    let cube = createSolvedCube();
    let running = false;
    let solved = true;
    let moves = 0;
    let solves = 0;
    let scrambleSequence = [];
    let moveHistory = [];
    let detachLocale = null;

    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.maxWidth = '760px';
    wrapper.style.margin = '0 auto';
    wrapper.style.padding = '18px';
    wrapper.style.boxSizing = 'border-box';
    wrapper.style.fontFamily = "'Segoe UI', system-ui, sans-serif";
    wrapper.style.color = '#e2e8f0';
    wrapper.style.background = '#0b1220';
    wrapper.style.borderRadius = '18px';
    wrapper.style.boxShadow = '0 18px 40px rgba(15,23,42,0.55)';

    const titleEl = document.createElement('div');
    titleEl.style.fontSize = '22px';
    titleEl.style.fontWeight = '600';
    titleEl.style.marginBottom = '6px';
    const descriptionEl = document.createElement('div');
    descriptionEl.style.fontSize = '13px';
    descriptionEl.style.opacity = '0.85';
    descriptionEl.style.lineHeight = '1.5';
    descriptionEl.style.marginBottom = '14px';

    const infoRow = document.createElement('div');
    infoRow.style.display = 'flex';
    infoRow.style.flexWrap = 'wrap';
    infoRow.style.gap = '12px 20px';
    infoRow.style.fontSize = '13px';
    infoRow.style.marginBottom = '16px';

    function createInfo(label, value){
      const item = document.createElement('span');
      item.style.display = 'flex';
      item.style.gap = '6px';
      const labelEl = document.createElement('span');
      labelEl.style.opacity = '0.7';
      labelEl.textContent = label;
      const valueEl = document.createElement('span');
      valueEl.style.fontVariantNumeric = 'tabular-nums';
      valueEl.textContent = value;
      item.appendChild(labelEl);
      item.appendChild(valueEl);
      return { element: item, labelEl, valueEl };
    }

    const difficultyInfo = createInfo(text('.info.difficulty.label', '難易度'), difficulty);
    const scrambleInfo = createInfo(text('.info.scramble.label', 'スクランブル'), String(scrambleSteps));
    const movesInfo = createInfo(text('.info.moves.label', '手数'), '0');
    const solvesInfo = createInfo(text('.info.solves.label', 'クリア数'), '0');
    const sequenceInfo = createInfo(text('.info.sequence.label', '現在のスクランブル'), '-');
    sequenceInfo.valueEl.style.whiteSpace = 'nowrap';
    sequenceInfo.valueEl.style.maxWidth = '420px';
    sequenceInfo.valueEl.style.overflow = 'hidden';
    sequenceInfo.valueEl.style.textOverflow = 'ellipsis';

    infoRow.appendChild(difficultyInfo.element);
    infoRow.appendChild(scrambleInfo.element);
    infoRow.appendChild(movesInfo.element);
    infoRow.appendChild(solvesInfo.element);
    infoRow.appendChild(sequenceInfo.element);

    const layout = document.createElement('div');
    layout.style.display = 'grid';
    layout.style.gridTemplateColumns = 'repeat(4, minmax(0, 1fr))';
    layout.style.gridTemplateRows = 'repeat(3, auto)';
    layout.style.gap = '16px';
    layout.style.marginBottom = '18px';
    layout.style.alignItems = 'stretch';

    const facePositions = {
      U: { row: 1, col: 2 },
      L: { row: 2, col: 1 },
      F: { row: 2, col: 2 },
      R: { row: 2, col: 3 },
      B: { row: 2, col: 4 },
      D: { row: 3, col: 2 }
    };

    const stickerElements = {
      U: [], D: [], L: [], R: [], F: [], B: []
    };
    const faceLabelElements = {};

    function createFace(face){
      const container = document.createElement('div');
      const pos = facePositions[face];
      container.style.gridColumn = `${pos.col} / span 1`;
      container.style.gridRow = `${pos.row} / span 1`;
      container.style.justifySelf = 'center';
      container.style.width = '100%';
      container.style.maxWidth = '180px';
      container.style.position = 'relative';

      const faceCard = document.createElement('div');
      faceCard.style.background = 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.95))';
      faceCard.style.borderRadius = '14px';
      faceCard.style.padding = '10px';
      faceCard.style.boxShadow = '0 0 0 1px rgba(148,163,184,0.28) inset, 0 16px 24px rgba(15,23,42,0.45)';
      faceCard.style.aspectRatio = '1 / 1';
      faceCard.style.display = 'flex';
      faceCard.style.flexDirection = 'column';

      const faceHeader = document.createElement('div');
      faceHeader.style.fontSize = '12px';
      faceHeader.style.opacity = '0.75';
      faceHeader.style.marginBottom = '6px';
      faceHeader.textContent = FACE_NAMES[face];
      faceLabelElements[face] = faceHeader;

      const grid = document.createElement('div');
      grid.style.flex = '1';
      grid.style.display = 'grid';
      grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
      grid.style.gridTemplateRows = 'repeat(3, 1fr)';
      grid.style.gap = '5px';

      for (let i = 0; i < 9; i++){
        const sticker = document.createElement('div');
        sticker.style.borderRadius = '8px';
        sticker.style.boxShadow = '0 0 0 1px rgba(15,23,42,0.4) inset, 0 3px 6px rgba(15,23,42,0.45)';
        sticker.style.display = 'flex';
        sticker.style.alignItems = 'center';
        sticker.style.justifyContent = 'center';
        sticker.style.fontSize = '12px';
        sticker.style.fontWeight = '600';
        sticker.style.color = FACE_TEXT_COLORS[face] || '#0f172a';
        sticker.style.background = FACE_COLORS[face] || '#64748b';
        sticker.textContent = face;
        sticker.dataset.face = face;
        sticker.dataset.index = String(i);
        stickerElements[face].push(sticker);
        grid.appendChild(sticker);
      }

      faceCard.appendChild(faceHeader);
      faceCard.appendChild(grid);
      container.appendChild(faceCard);
      layout.appendChild(container);
    }

    FACE_ORDER.forEach(createFace);

    const statusBar = document.createElement('div');
    statusBar.style.minHeight = '22px';
    statusBar.style.fontSize = '13px';
    statusBar.style.marginBottom = '16px';
    statusBar.style.opacity = '0.9';

    const controls = document.createElement('div');
    controls.style.display = 'flex';
    controls.style.flexWrap = 'wrap';
    controls.style.gap = '8px';
    controls.style.alignItems = 'center';

    const moveGroups = [
      { face: 'U', label: 'U', moves: ['U', "U'", 'U2'] },
      { face: 'D', label: 'D', moves: ['D', "D'", 'D2'] },
      { face: 'L', label: 'L', moves: ['L', "L'", 'L2'] },
      { face: 'R', label: 'R', moves: ['R', "R'", 'R2'] },
      { face: 'F', label: 'F', moves: ['F', "F'", 'F2'] },
      { face: 'B', label: 'B', moves: ['B', "B'", 'B2'] }
    ];

    const moveButtonHandlers = [];

    function createButton(label){
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.style.padding = '8px 14px';
      button.style.borderRadius = '999px';
      button.style.border = '1px solid rgba(148,163,184,0.35)';
      button.style.background = 'rgba(15,23,42,0.35)';
      button.style.color = '#e2e8f0';
      button.style.cursor = 'pointer';
      button.style.fontSize = '13px';
      button.style.fontWeight = '600';
      button.style.transition = 'background 0.2s ease, border-color 0.2s ease';
      button.addEventListener('focus', () => {
        button.style.borderColor = 'rgba(148,163,184,0.55)';
      });
      button.addEventListener('blur', () => {
        button.style.borderColor = 'rgba(148,163,184,0.35)';
      });
      return button;
    }

    moveGroups.forEach((group) => {
      const groupBox = document.createElement('div');
      groupBox.style.display = 'flex';
      groupBox.style.alignItems = 'center';
      groupBox.style.gap = '6px';

      const badge = document.createElement('span');
      badge.textContent = group.label;
      badge.style.padding = '4px 10px';
      badge.style.borderRadius = '999px';
      badge.style.background = 'rgba(30,41,59,0.75)';
      badge.style.border = '1px solid rgba(148,163,184,0.35)';
      badge.style.fontSize = '12px';
      badge.style.opacity = '0.85';
      groupBox.appendChild(badge);

      group.moves.forEach((move) => {
        const btn = createButton(move);
        const handler = () => performMove(move);
        btn.addEventListener('click', handler);
        moveButtonHandlers.push({ button: btn, handler });
        groupBox.appendChild(btn);
      });

      controls.appendChild(groupBox);
    });

    const scrambleButton = createButton(text('.controls.scramble', '再スクランブル'));
    scrambleButton.style.marginTop = '6px';
    const scrambleHandler = () => {
      newScramble();
    };
    scrambleButton.addEventListener('click', scrambleHandler);

    const undoButton = createButton(text('.controls.undo', '直前の手を戻す'));
    undoButton.style.marginTop = '6px';
    const undoHandler = () => {
      undoLastMove();
    };
    undoButton.addEventListener('click', undoHandler);

    const historyEl = document.createElement('div');
    historyEl.style.marginTop = '12px';
    historyEl.style.fontSize = '12px';
    historyEl.style.opacity = '0.85';
    historyEl.style.lineHeight = '1.45';

    controls.appendChild(scrambleButton);
    controls.appendChild(undoButton);

    wrapper.appendChild(titleEl);
    wrapper.appendChild(descriptionEl);
    wrapper.appendChild(infoRow);
    wrapper.appendChild(layout);
    wrapper.appendChild(statusBar);
    wrapper.appendChild(controls);
    wrapper.appendChild(historyEl);
    root.appendChild(wrapper);

    function disableHostRestart(){ shortcuts?.disableKey?.('r'); }
    function enableHostRestart(){ shortcuts?.enableKey?.('r'); }

    function updateTexts(){
      titleEl.textContent = text('.title', 'ルービック・キューブ');
      descriptionEl.textContent = text('.description', () => `2Dネットで6面を同時に眺めながら揃えるミニゲームです。難易度${difficulty}はスクランブル${scrambleSteps}手。ボタンで面を回転し、全ての色を揃えましょう。`);
      difficultyInfo.labelEl.textContent = text('.info.difficulty.label', '難易度');
      scrambleInfo.labelEl.textContent = text('.info.scramble.label', 'スクランブル');
      movesInfo.labelEl.textContent = text('.info.moves.label', '手数');
      solvesInfo.labelEl.textContent = text('.info.solves.label', 'クリア数');
      sequenceInfo.labelEl.textContent = text('.info.sequence.label', '現在のスクランブル');
      scrambleButton.textContent = text('.controls.scramble', '再スクランブル');
      undoButton.textContent = text('.controls.undo', '直前の手を戻す');
      FACE_ORDER.forEach((face) => {
        faceLabelElements[face].textContent = text(`.faces.${face.toLowerCase()}`, FACE_NAMES[face]);
      });
      updateStatus();
      updateHistory();
    }

    function renderCube(){
      FACE_ORDER.forEach((face) => {
        const stickers = stickerElements[face];
        const values = cube[face];
        for (let i = 0; i < 9; i++){
          const value = values[i];
          const sticker = stickers[i];
          const color = FACE_COLORS[value] || '#475569';
          const textColor = FACE_TEXT_COLORS[value] || '#0f172a';
          sticker.style.background = color;
          sticker.style.color = textColor;
          sticker.textContent = value;
        }
      });
    }

    function updateInfo(){
      movesInfo.valueEl.textContent = formatNumber(moves, { maximumFractionDigits: 0 });
      solvesInfo.valueEl.textContent = formatNumber(solves, { maximumFractionDigits: 0 });
      sequenceInfo.valueEl.textContent = formatMoveSequence(scrambleSequence);
    }

    function updateHistory(){
      historyEl.textContent = text('.history.moves', () => {
        if (!moveHistory.length) return '履歴: (なし)';
        return `履歴: ${moveHistory.join(' ')}`;
      });
    }

    function updateStatus(){
      if (solved){
        const xpText = formatNumber(solveXp, { maximumFractionDigits: 2 });
        statusBar.style.color = '#facc15';
        statusBar.textContent = text('.status.cleared', () => `クリア！ 合計${moves}手。クリア報酬 ${xpText} EXP`);
      } else if (running){
        statusBar.style.color = '#bae6fd';
        statusBar.textContent = text('.status.running', () => `スクランブル: ${scrambleSequence.length} 手 / 現在 ${moves} 手`);
      } else {
        statusBar.style.color = '#94a3b8';
        statusBar.textContent = text('.status.ready', 'スクランブルを開始するとプレイできます。');
      }
    }

    function performMove(move){
      if (!running) return;
      applyMove(cube, move);
      moves += 1;
      moveHistory.push(move);
      if (moveHistory.length > 30){
        moveHistory = moveHistory.slice(moveHistory.length - 30);
      }
      awardXp(moveXp, { reason: 'move', move, difficulty });
      renderCube();
      updateInfo();
      updateHistory();
      if (isSolved(cube)){
        solved = true;
        running = false;
        solves += 1;
        awardXp(solveXp, { reason: 'solve', moves, difficulty });
        enableHostRestart();
        updateInfo();
        updateStatus();
      } else {
        updateStatus();
      }
    }

    function undoLastMove(){
      if (solved) return;
      if (!moveHistory.length) return;
      const last = moveHistory.pop();
      const inverse = inverseMove(last);
      applyMove(cube, inverse);
      moves = Math.max(0, moves - 1);
      const nowSolved = isSolved(cube);
      solved = nowSolved;
      running = !nowSolved;
      if (running){
        disableHostRestart();
      }
      renderCube();
      updateInfo();
      updateHistory();
      updateStatus();
    }

    function newScramble(){
      moves = 0;
      moveHistory = [];
      solved = false;
      running = true;
      let attempts = 0;
      do {
        cube = createSolvedCube();
        scrambleSequence = randomScramble(cube, scrambleSteps);
        attempts += 1;
      } while (isSolved(cube) && attempts < 4);
      disableHostRestart();
      renderCube();
      updateInfo();
      updateHistory();
      updateStatus();
    }

    function start(){
      newScramble();
    }

    function stop(opts = {}){
      if (!running) return;
      running = false;
      if (!opts.keepShortcutsDisabled){
        enableHostRestart();
      }
      updateStatus();
    }

    function destroy(){
      stop();
      moveButtonHandlers.forEach(({ button, handler }) => {
        try { button.removeEventListener('click', handler); } catch {}
      });
      try { scrambleButton.removeEventListener('click', scrambleHandler); } catch {}
      try { undoButton.removeEventListener('click', undoHandler); } catch {}
      if (typeof detachLocale === 'function'){
        try { detachLocale(); } catch {}
        detachLocale = null;
      }
      wrapper.remove();
    }

    function getScore(){
      return solves;
    }

    if (localization && typeof localization.onLocaleChanged === 'function'){
      try {
        detachLocale = localization.onLocaleChanged(() => {
          updateTexts();
        });
      } catch {}
    }

    updateTexts();
    renderCube();
    updateInfo();
    updateStatus();

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({
    id: 'rubiks_cube',
    name: 'ルービック・キューブ',
    nameKey: 'selection.miniexp.games.rubiks_cube.name',
    description: '6面同時表示のルービック・キューブ。スクランブルを解いて揃えよう',
    descriptionKey: 'selection.miniexp.games.rubiks_cube.description',
    categoryIds: ['puzzle'],
    create
  });
})();

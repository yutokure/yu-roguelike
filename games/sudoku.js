(function(){
  /** MiniExp MOD: Sudoku (Number Place) */
  function create(root, awardXp, opts){
    const difficulty = (opts && opts.difficulty) || 'NORMAL';
    const xpPerFill = { EASY: 0.35, NORMAL: 0.5, HARD: 0.9 };
    const xpClear = { EASY: 45, NORMAL: 120, HARD: 260 };
    const fillXp = xpPerFill[difficulty] || xpPerFill.NORMAL;
    const clearXp = xpClear[difficulty] || xpClear.NORMAL;

    const PUZZLES = {
      EASY: [
        {
          solution: '534678912672195348198342567859761423426853791713924856961537284287419635345286179',
          mask: '111010111101111001101010101110101010111010111010101011101010101100111010111010111'
        },
        {
          solution: '426853791713924856859761423961537284345286179287419635198342567672195348534678912',
          mask: '111010111010101011110101010101010101111010111100111010101010101101111001111010111'
        },
        {
          solution: '291354687834762159756918324342589716179246835685173942428691573563827491917435268',
          mask: '111111001100011111110011001001110110111111001101100110110011001001010111111111001'
        }
      ],
      NORMAL: [
        {
          solution: '534678912672195348198342567859761423426853791713924856961537284287419635345286179',
          mask: '101001100010110010001010101110001010001110100010100011100010010011001010001100101'
        },
        {
          solution: '426853791713924856859761423961537284345286179287419635198342567672195348534678912',
          mask: '001110100010100011110001010100010010001100101011001010001010101010110010101001100'
        },
        {
          solution: '291354687834762159756918324342589716179246835685173942428691573563827491917435268',
          mask: '010011010001100101110001001001110010010001101101100100001010001001101010110001100'
        }
      ],
      HARD: [
        {
          solution: '534678912672195348198342567859761423426853791713924856961537284287419635345286179',
          mask: '110010000100111000011000010100010001100101001100010001010000110000111001000010011'
        },
        {
          solution: '426853791713924856859761423961537284345286179287419635198342567672195348534678912',
          mask: '100101001100010001100010001010000110000010011000111001011000010100111000110010000'
        },
        {
          solution: '291354687834762159756918324342589716179246835685173942428691573563827491917435268',
          mask: '000110001000010111001101000100010001100010110100010001011100000100000111101000001'
        }
      ]
    };

    const digitList = ['1','2','3','4','5','6','7','8','9'];
    function shuffleDigits(){
      const pool = digitList.slice();
      for(let i=pool.length-1;i>0;i--){
        const j = (Math.random()*(i+1))|0;
        const t = pool[i]; pool[i] = pool[j]; pool[j] = t;
      }
      const map = {};
      digitList.forEach((d,idx)=>{ map[d] = pool[idx]; });
      return map;
    }
    function applyDigitMap(str, map){
      return str.replace(/[1-9]/g, ch => map[ch] || ch);
    }

    const pool = PUZZLES[difficulty] || PUZZLES.NORMAL;
    const base = pool[(Math.random()*pool.length)|0];
    const digitMap = shuffleDigits();
    const solutionStr = applyDigitMap(base.solution, digitMap);
    const maskStr = base.mask;

    const solution = solutionStr.split('');
    const initial = solution.map((digit, idx) => maskStr[idx] === '1' ? digit : '');
    const givenSet = new Set();
    initial.forEach((v, idx)=>{ if(v) givenSet.add(idx); });

    let boardValues = initial.slice();
    let awardedCells = new Set();
    let mistakes = 0;
    let solved = false;
    let running = false;
    let started = false;
    let selectedIndex = -1;
    let startTime = 0;
    let elapsedMs = 0;
    let timerId = null;

    const wrapper = document.createElement('div');
    wrapper.style.maxWidth = '620px';
    wrapper.style.margin = '0 auto';
    wrapper.style.padding = '16px 18px 20px';
    wrapper.style.boxSizing = 'border-box';
    wrapper.style.background = '#020617';
    wrapper.style.borderRadius = '18px';
    wrapper.style.boxShadow = '0 16px 36px rgba(2,6,23,0.7)';
    wrapper.style.color = '#f8fafc';
    wrapper.style.fontFamily = "'Segoe UI', system-ui, sans-serif";

    const title = document.createElement('div');
    title.textContent = 'ナンプレ (数独)';
    title.style.fontSize = '22px';
    title.style.fontWeight = '700';
    title.style.marginBottom = '6px';

    const description = document.createElement('div');
    description.textContent = '1〜9の数字を使い、各行・列・3×3ブロックに同じ数字が入らないよう埋めてください。クリックまたはキーボード(数字/矢印/Backspace)に対応。';
    description.style.fontSize = '13px';
    description.style.opacity = '0.85';
    description.style.lineHeight = '1.5';
    description.style.marginBottom = '12px';

    const infoBar = document.createElement('div');
    infoBar.style.display = 'flex';
    infoBar.style.flexWrap = 'wrap';
    infoBar.style.gap = '8px 16px';
    infoBar.style.fontSize = '13px';
    infoBar.style.marginBottom = '12px';

    function infoItem(label){
      const span = document.createElement('span');
      span.style.display = 'flex';
      span.style.gap = '4px';
      const key = document.createElement('span'); key.textContent = label; key.style.opacity = '0.7';
      const value = document.createElement('span'); value.style.fontVariantNumeric = 'tabular-nums';
      span.appendChild(key); span.appendChild(value);
      infoBar.appendChild(span);
      return value;
    }

    const infoDifficulty = infoItem('難易度'); infoDifficulty.textContent = difficulty;
    const infoProgress = infoItem('進行');
    const infoMistakes = infoItem('ミス');
    const infoTime = infoItem('タイム'); infoTime.textContent = '0:00';

    const boardFrame = document.createElement('div');
    boardFrame.style.position = 'relative';
    boardFrame.style.background = '#020617';
    boardFrame.style.borderRadius = '16px';
    boardFrame.style.padding = '12px';
    boardFrame.style.boxShadow = '0 0 0 1px rgba(148,163,184,0.25) inset, 0 18px 32px rgba(15,23,42,0.65) inset';

    const boardEl = document.createElement('div');
    boardEl.setAttribute('tabindex', '0');
    boardEl.style.display = 'grid';
    boardEl.style.gridTemplateColumns = 'repeat(9, 1fr)';
    boardEl.style.gridTemplateRows = 'repeat(9, 1fr)';
    boardEl.style.gap = '2px';
    boardEl.style.minHeight = '0';
    boardEl.style.aspectRatio = '1 / 1';

    boardFrame.appendChild(boardEl);

    const keypad = document.createElement('div');
    keypad.style.marginTop = '12px';
    keypad.style.display = 'grid';
    keypad.style.gridTemplateColumns = 'repeat(5, minmax(0, 1fr))';
    keypad.style.gap = '8px';

    const actionsBar = document.createElement('div');
    actionsBar.style.display = 'flex';
    actionsBar.style.flexWrap = 'wrap';
    actionsBar.style.gap = '10px';
    actionsBar.style.marginTop = '12px';

    function createButton(label){
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.style.padding = '8px 12px';
      btn.style.border = 'none';
      btn.style.borderRadius = '10px';
      btn.style.background = 'rgba(30,41,59,0.85)';
      btn.style.color = '#f1f5f9';
      btn.style.cursor = 'pointer';
      btn.style.fontSize = '14px';
      btn.style.fontWeight = '600';
      btn.style.boxShadow = '0 3px 10px rgba(15,23,42,0.4)';
      btn.style.transition = 'background 120ms ease, transform 120ms ease';
      btn.onmouseenter = () => { btn.style.background = 'rgba(37,99,235,0.65)'; };
      btn.onmouseleave = () => { btn.style.background = 'rgba(30,41,59,0.85)'; btn.style.transform = 'none'; };
      btn.onmousedown = () => { btn.style.transform = 'scale(0.97)'; };
      btn.onmouseup = () => { btn.style.transform = 'none'; };
      return btn;
    }

    const statusBar = document.createElement('div');
    statusBar.style.marginTop = '10px';
    statusBar.style.minHeight = '20px';
    statusBar.style.fontSize = '13px';
    statusBar.style.opacity = '0.9';

    wrapper.appendChild(title);
    wrapper.appendChild(description);
    wrapper.appendChild(infoBar);
    wrapper.appendChild(boardFrame);
    wrapper.appendChild(keypad);
    wrapper.appendChild(actionsBar);
    wrapper.appendChild(statusBar);
    root.appendChild(wrapper);

    const cells = [];
    const baseColors = [];

    for(let i=0;i<81;i++){
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.dataset.index = String(i);
      cell.style.position = 'relative';
      cell.style.display = 'flex';
      cell.style.alignItems = 'center';
      cell.style.justifyContent = 'center';
      cell.style.aspectRatio = '1 / 1';
      cell.style.fontSize = '18px';
      cell.style.fontWeight = '600';
      cell.style.border = 'none';
      cell.style.borderRadius = '6px';
      cell.style.color = '#e2e8f0';
      cell.style.cursor = givenSet.has(i) ? 'default' : 'pointer';
      cell.style.userSelect = 'none';
      const row = Math.floor(i / 9);
      const col = i % 9;
      const baseColor = ((Math.floor(row/3) + Math.floor(col/3)) % 2 === 0) ? '#0b1221' : '#0f172a';
      baseColors.push(baseColor);
      cell.style.background = baseColor;
      if (givenSet.has(i)){
        cell.style.background = '#172554';
        cell.style.color = '#bfdbfe';
      }
      const thick = '2px solid rgba(59,130,246,0.55)';
      if ((col+1) % 3 === 0 && col !== 8){
        cell.style.marginRight = '4px';
      }
      if ((row+1) % 3 === 0 && row !== 8){
        cell.style.marginBottom = '4px';
      }
      cell.addEventListener('click', function(){
        if (!running) return;
        if (selectedIndex === i){
          selectedIndex = -1;
        } else {
          selectedIndex = i;
        }
        refreshHighlights();
      });
      cells.push(cell);
      boardEl.appendChild(cell);
    }

    function updateCellContent(idx){
      const cell = cells[idx];
      const val = boardValues[idx];
      cell.textContent = val || '';
      if (givenSet.has(idx)){
        cell.style.fontWeight = '700';
        cell.style.color = '#bfdbfe';
      } else {
        cell.style.fontWeight = '600';
        cell.style.color = val ? '#f8fafc' : '#94a3b8';
      }
    }

    function refreshHighlights(){
      const sel = selectedIndex;
      const selRow = sel >= 0 ? Math.floor(sel / 9) : -1;
      const selCol = sel >= 0 ? sel % 9 : -1;
      const selDigit = sel >=0 ? boardValues[sel] : '';
      for(let idx=0; idx<cells.length; idx++){
        const cell = cells[idx];
        const row = Math.floor(idx / 9);
        const col = idx % 9;
        let bg = givenSet.has(idx) ? '#172554' : baseColors[idx];
        let border = 'none';
        if (sel >= 0){
          const sameRow = row === selRow;
          const sameCol = col === selCol;
          const sameBox = Math.floor(row/3) === Math.floor(selRow/3) && Math.floor(col/3) === Math.floor(selCol/3);
          if (sameRow || sameCol || sameBox){
            bg = givenSet.has(idx) ? '#1d2a5b' : '#152039';
          }
          if (selDigit && boardValues[idx] === selDigit && idx !== sel){
            bg = '#1d4ed8';
            cell.style.color = '#e2e8f0';
          } else if (!givenSet.has(idx)){
            cell.style.color = boardValues[idx] ? '#f8fafc' : '#94a3b8';
          }
          if (idx === sel){
            border = '2px solid #38bdf8';
            cell.style.color = '#f8fafc';
            bg = '#2563eb';
          }
        } else {
          if (!givenSet.has(idx)){
            cell.style.color = boardValues[idx] ? '#f8fafc' : '#94a3b8';
          }
        }
        cell.style.background = bg;
        cell.style.boxShadow = border === 'none' ? 'none' : '0 0 0 2px rgba(56,189,248,0.85)';
      }
    }

    function setStatus(text){
      statusBar.textContent = text || '';
    }

    function updateProgress(){
      const filled = boardValues.reduce((acc, v)=> acc + (v ? 1 : 0), 0);
      infoProgress.textContent = `${filled}/81`;
      infoMistakes.textContent = String(mistakes);
    }

    function formatTime(ms){
      const totalSeconds = Math.floor(ms / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${seconds.toString().padStart(2,'0')}`;
    }

    function updateTime(){
      const baseMs = solved ? elapsedMs : Date.now() - startTime;
      infoTime.textContent = formatTime(baseMs);
    }

    function startTimer(){
      if (timerId) clearInterval(timerId);
      timerId = setInterval(updateTime, 250);
    }

    function stopTimer(){
      if (timerId){ clearInterval(timerId); timerId = null; }
    }

    function checkSolved(){
      for(let i=0;i<81;i++){
        if (boardValues[i] !== solution[i]) return false;
      }
      return true;
    }

    function onSolved(){
      solved = true;
      running = false;
      elapsedMs = Date.now() - startTime;
      stopTimer();
      document.removeEventListener('keydown', onKeyDown);
      setStatus(`クリア！タイム ${formatTime(elapsedMs)} / ミス ${mistakes}。`);
      awardXp(clearXp, { type:'clear', mistakes, timeSec: Math.floor(elapsedMs/1000), difficulty });
      refreshHighlights();
      updateTime();
    }

    function flashCell(idx){
      const cell = cells[idx];
      const original = cell.style.background;
      cell.style.background = '#b91c1c';
      cell.style.color = '#f8fafc';
      setTimeout(()=>{
        refreshHighlights();
      }, 220);
    }

    function setCellValue(idx, value){
      if (!running) return;
      if (givenSet.has(idx)) return;
      if (solved) return;
      if (value === ''){
        boardValues[idx] = '';
        updateCellContent(idx);
        refreshHighlights();
        updateProgress();
        return;
      }
      if (solution[idx] === value){
        const alreadyCorrect = boardValues[idx] === value;
        boardValues[idx] = value;
        updateCellContent(idx);
        if (!awardedCells.has(idx) && !alreadyCorrect){
          awardedCells.add(idx);
          awardXp(fillXp, { type:'fill', index: idx, difficulty });
        }
        refreshHighlights();
        updateProgress();
        if (checkSolved()){
          onSolved();
        }
      } else {
        mistakes += 1;
        infoMistakes.textContent = String(mistakes);
        setStatus('その数字は入れられません。');
        flashCell(idx);
      }
    }

    function handleNumberInput(value){
      if (selectedIndex < 0){ setStatus('マスを選択してください。'); return; }
      setCellValue(selectedIndex, value);
    }

    function handleClear(){
      if (selectedIndex < 0) return;
      setCellValue(selectedIndex, '');
    }

    function resetBoard(){
      boardValues = initial.slice();
      awardedCells = new Set();
      givenSet.forEach(idx => { awardedCells.add(idx); });
      mistakes = 0;
      solved = false;
      elapsedMs = 0;
      startTime = Date.now();
      stopTimer();
      if (running){ startTimer(); }
      boardValues.forEach((_, idx)=>{ updateCellContent(idx); });
      selectedIndex = -1;
      setStatus('リセットしました。');
      updateProgress();
      updateTime();
      refreshHighlights();
    }

    function newPuzzle(){
      // regenerate using same base definitions
      const next = pool[(Math.random()*pool.length)|0];
      const nextDigitMap = shuffleDigits();
      const nextSolutionStr = applyDigitMap(next.solution, nextDigitMap);
      const nextMask = next.mask;
      const nextSolution = nextSolutionStr.split('');
      const nextInitial = nextSolution.map((digit, idx) => nextMask[idx] === '1' ? digit : '');
      boardValues = nextInitial.slice();
      awardedCells = new Set();
      givenSet.clear();
      nextInitial.forEach((v, idx)=>{ if(v) givenSet.add(idx); });
      for(let idx=0; idx<81; idx++){
        if (nextMask[idx] === '1'){ awardedCells.add(idx); }
        solution[idx] = nextSolution[idx];
        initial[idx] = nextInitial[idx];
        updateCellContent(idx);
        const cell = cells[idx];
        cell.style.cursor = givenSet.has(idx) ? 'default' : 'pointer';
      }
      mistakes = 0;
      solved = false;
      elapsedMs = 0;
      selectedIndex = -1;
      startTime = Date.now();
      stopTimer();
      if (running){ startTimer(); }
      setStatus('新しい盤面を生成しました。');
      updateProgress();
      updateTime();
      refreshHighlights();
    }

    function createKeypadButton(label, value){
      const btn = createButton(label);
      btn.style.fontSize = '16px';
      btn.onclick = function(){
        if (!running) return;
        if (value === '') handleClear();
        else handleNumberInput(value);
      };
      return btn;
    }

    for(let n=1;n<=9;n++){
      const btn = createKeypadButton(String(n), String(n));
      keypad.appendChild(btn);
    }
    keypad.appendChild(createKeypadButton('消す', ''));

    const resetBtn = createButton('リセット');
    resetBtn.onclick = () => { if (!running) return; resetBoard(); };
    const newBtn = createButton('新しい盤面');
    newBtn.onclick = () => { if (!running) return; newPuzzle(); };
    actionsBar.appendChild(resetBtn);
    actionsBar.appendChild(newBtn);

    function onKeyDown(e){
      if (!running) return;
      const key = e.key;
      if (key >= '1' && key <= '9'){
        e.preventDefault();
        handleNumberInput(key);
        return;
      }
      if (key === 'Backspace' || key === 'Delete' || key === '0' || key === ' '){
        e.preventDefault();
        handleClear();
        return;
      }
      if (key === 'ArrowUp' || key === 'w' || key === 'W'){
        e.preventDefault();
        moveSelection(0, -1);
        return;
      }
      if (key === 'ArrowDown' || key === 's' || key === 'S'){
        e.preventDefault();
        moveSelection(0, 1);
        return;
      }
      if (key === 'ArrowLeft' || key === 'a' || key === 'A'){
        e.preventDefault();
        moveSelection(-1, 0);
        return;
      }
      if (key === 'ArrowRight' || key === 'd' || key === 'D'){
        e.preventDefault();
        moveSelection(1, 0);
        return;
      }
      if (key === 'Enter'){
        e.preventDefault();
        if (selectedIndex >= 0){ handleNumberInput(solution[selectedIndex]); }
      }
    }

    function moveSelection(dx, dy){
      if (selectedIndex < 0){ selectedIndex = 0; refreshHighlights(); return; }
      const row = Math.floor(selectedIndex / 9);
      const col = selectedIndex % 9;
      const nr = (row + dy + 9) % 9;
      const nc = (col + dx + 9) % 9;
      selectedIndex = nr * 9 + nc;
      refreshHighlights();
    }

    function start(){
      if (running) return;
      running = true;
      if (!started){
        awardedCells = new Set();
        givenSet.forEach(idx => awardedCells.add(idx));
        boardValues.forEach((_, idx)=> updateCellContent(idx));
        updateProgress();
        started = true;
        startTime = Date.now();
      } else {
        startTime = Date.now() - elapsedMs;
      }
      setStatus('');
      document.addEventListener('keydown', onKeyDown);
      startTimer();
      updateTime();
      refreshHighlights();
    }

    function stop(){
      if (!running) return;
      running = false;
      elapsedMs = solved ? elapsedMs : Date.now() - startTime;
      stopTimer();
      document.removeEventListener('keydown', onKeyDown);
    }

    function destroy(){
      stop();
      try { wrapper.remove(); } catch {}
    }

    function getScore(){
      if (solved){
        const seconds = Math.max(1, Math.floor(elapsedMs / 1000));
        return Math.max(1, Math.floor(500000 / seconds) - mistakes * 250);
      }
      const filled = boardValues.reduce((acc, v)=>acc + (v ? 1 : 0), 0);
      return filled - mistakes * 3;
    }

    // Initialize display
    boardValues.forEach((_, idx)=> updateCellContent(idx));
    updateProgress();
    refreshHighlights();
    givenSet.forEach(idx => awardedCells.add(idx));

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({
    id: 'sudoku',
    name: 'ナンプレ', nameKey: 'selection.miniexp.games.sudoku.name',
    description: '1〜9の数字で行・列・ブロックを揃える定番ロジックパズル。正解入力とクリアでEXP獲得。', descriptionKey: 'selection.miniexp.games.sudoku.description', categoryIds: ['puzzle'],
    category: 'パズル',
    create
  });
})();

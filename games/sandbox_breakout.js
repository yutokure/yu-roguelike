(function(){
  const CANVAS_WIDTH = 720;
  const CANVAS_HEIGHT = 480;
  const EDIT_BG = '#0f172a';
  const PLAY_BG = '#020617';
  const GRID_MARGIN = 32;
  const STAGE_TOP = 72;
  const STAGE_HEIGHT = CANVAS_HEIGHT * 0.55;
  const DEFAULT_COLS = 12;
  const DEFAULT_ROWS = 10;
  const MIN_COLS = 6;
  const MAX_COLS = 18;
  const MIN_ROWS = 4;
  const MAX_ROWS = 16;
  const BALL_SPEED = 4.6;
  const PADDLE_WIDTH = 120;
  const PADDLE_HEIGHT = 14;
  const PADDLE_Y = CANVAS_HEIGHT - 48;
  const PADDLE_SPEED = 10;
  const BALL_RADIUS = 8;
  const BLOCK_GAP = 4;
  const MAX_CUSTOM_HARDNESS = 12;

  const BLOCK_TYPES = [
    { id: 'empty', labelKey: 'blocks.empty', labelFallback: '空', color: 'rgba(255,255,255,0)', editorOnly: true },
    { id: 'normal', labelKey: 'blocks.normal', labelFallback: '通常ブロック', color: '#38bdf8', hp: 1, score: 100, xp: 1 },
    { id: 'hard', labelKey: 'blocks.hard', labelFallback: '硬いブロック(2)', color: '#f97316', hp: 2, score: 200, xp: 2 },
    { id: 'unbreakable', labelKey: 'blocks.unbreakable', labelFallback: '壊れないブロック', color: '#94a3b8', hp: Infinity, score: 0, xp: 0 },
    { id: 'bonus', labelKey: 'blocks.bonus', labelFallback: '高得点ブロック', color: '#facc15', hp: 1, score: 500, xp: 5 },
    { id: 'custom', labelKey: 'blocks.custom', labelFallback: 'カスタム硬さ', color: '#34d399', hp: 3, score: 150, xp: 1 }
  ];

  function cloneStage(stage){
    return stage.map(row => row.map(cell => ({ type: cell.type, hardness: cell.hardness })));
  }

  function create(root, awardXp, opts){
    const localization = opts?.localization
      || (typeof window !== 'undefined' && typeof window.createMiniGameLocalization === 'function'
        ? window.createMiniGameLocalization({ id: 'sandbox_breakout', textKeyPrefix: 'games.sandboxBreakout' })
        : null);

    function computeFallback(fallback, params){
      if (typeof fallback === 'function'){
        try {
          const value = fallback(params || {});
          return value == null ? '' : String(value);
        } catch (error){
          console.warn('[sandbox_breakout] Failed to evaluate fallback text:', error);
          return '';
        }
      }
      if (fallback == null) return '';
      try {
        return String(fallback);
      } catch (error){
        console.warn('[sandbox_breakout] Failed to stringify fallback text:', error);
        return '';
      }
    }

    function text(key, fallback, params){
      if (localization && typeof localization.t === 'function'){
        try {
          const translated = localization.t(key, fallback, params);
          if (translated != null) return typeof translated === 'string' ? translated : String(translated);
        } catch (error){
          console.warn('[sandbox_breakout] Failed to translate key via localization:', key, error);
        }
      }
      return computeFallback(fallback, params);
    }

    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '12px';
    container.style.maxWidth = CANVAS_WIDTH + 40 + 'px';
    container.style.margin = '0 auto';
    container.style.fontFamily = "'Noto Sans JP', 'Segoe UI', sans-serif";
    container.style.color = '#e2e8f0';
    container.style.background = 'linear-gradient(160deg, rgba(2,6,23,0.95), rgba(15,23,42,0.92))';
    container.style.padding = '18px 18px 22px';
    container.style.borderRadius = '18px';
    container.style.boxShadow = '0 18px 42px rgba(15,23,42,0.55)';

    const title = document.createElement('h2');
    title.textContent = text('title', 'サンドボックスブロック崩し');
    title.style.textAlign = 'center';
    title.style.margin = '12px 0 0 0';
    title.style.fontSize = '20px';
    container.appendChild(title);

    const modeInfo = document.createElement('div');
    modeInfo.style.textAlign = 'center';
    modeInfo.style.fontSize = '13px';
    modeInfo.textContent = text('modeInfo', 'エディタで配置 → そのままプレイ / ステージのインポート・エクスポートに対応');
    container.appendChild(modeInfo);

    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    canvas.style.background = EDIT_BG;
    canvas.style.borderRadius = '12px';
    canvas.style.boxShadow = '0 12px 32px rgba(15,23,42,0.45)';
    canvas.style.cursor = 'pointer';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const toolbar = document.createElement('div');
    toolbar.style.display = 'flex';
    toolbar.style.flexWrap = 'wrap';
    toolbar.style.gap = '8px';
    toolbar.style.alignItems = 'center';
    toolbar.style.justifyContent = 'center';
    container.appendChild(toolbar);

    const modeLabel = document.createElement('span');
    modeLabel.textContent = text('mode.label.edit', 'モード: 編集');
    modeLabel.style.fontWeight = '600';
    toolbar.appendChild(modeLabel);

    const playButton = document.createElement('button');
    playButton.textContent = text('buttons.play', '▶ プレイ開始');
    styleButton(playButton);
    toolbar.appendChild(playButton);

    const editButton = document.createElement('button');
    editButton.textContent = text('buttons.returnToEdit', '⏹ 編集に戻る');
    styleButton(editButton);
    editButton.disabled = true;
    toolbar.appendChild(editButton);

    const clearButton = document.createElement('button');
    clearButton.textContent = text('buttons.clearAll', '全消去');
    styleButton(clearButton);
    toolbar.appendChild(clearButton);

    const gridControls = document.createElement('div');
    gridControls.style.display = 'flex';
    gridControls.style.gap = '12px';
    gridControls.style.alignItems = 'center';
    gridControls.style.justifyContent = 'center';
    gridControls.style.flexWrap = 'wrap';
    container.appendChild(gridControls);

    const colsInput = labelledNumber(text('grid.columns', '列'), DEFAULT_COLS, MIN_COLS, MAX_COLS);
    const rowsInput = labelledNumber(text('grid.rows', '行'), DEFAULT_ROWS, MIN_ROWS, MAX_ROWS);
    gridControls.appendChild(colsInput.wrapper);
    gridControls.appendChild(rowsInput.wrapper);

    const palette = document.createElement('div');
    palette.style.display = 'flex';
    palette.style.flexWrap = 'wrap';
    palette.style.gap = '6px';
    palette.style.justifyContent = 'center';
    palette.style.margin = '4px 0 0';
    container.appendChild(palette);

    const paletteLabel = document.createElement('div');
    paletteLabel.textContent = text('palette.label', '配置するブロック:');
    paletteLabel.style.textAlign = 'center';
    paletteLabel.style.fontSize = '13px';
    paletteLabel.style.marginBottom = '4px';
    container.insertBefore(paletteLabel, palette);

    const hardnessWrapper = document.createElement('label');
    hardnessWrapper.style.display = 'flex';
    hardnessWrapper.style.justifyContent = 'center';
    hardnessWrapper.style.alignItems = 'center';
    hardnessWrapper.style.gap = '6px';
    hardnessWrapper.style.fontSize = '13px';
    hardnessWrapper.style.marginBottom = '4px';
    const hardnessLabel = document.createElement('span');
    hardnessLabel.textContent = text('hardness.label', 'カスタム硬さ:');
    const hardnessInput = document.createElement('input');
    hardnessInput.type = 'number';
    hardnessInput.min = '1';
    hardnessInput.max = String(MAX_CUSTOM_HARDNESS);
    hardnessInput.value = '3';
    hardnessInput.style.width = '60px';
    hardnessInput.style.padding = '4px';
    hardnessInput.style.borderRadius = '6px';
    hardnessInput.style.border = '1px solid rgba(148,163,184,0.4)';
    hardnessInput.style.background = '#0f172a';
    hardnessInput.style.color = '#e2e8f0';
    hardnessWrapper.appendChild(hardnessLabel);
    hardnessWrapper.appendChild(hardnessInput);
    container.insertBefore(hardnessWrapper, palette.nextSibling);

    const exportArea = document.createElement('textarea');
    exportArea.placeholder = text('io.placeholder', 'インポート/エクスポート用JSONがここに表示されます');
    exportArea.style.width = '100%';
    exportArea.style.minHeight = '80px';
    exportArea.style.padding = '8px';
    exportArea.style.borderRadius = '10px';
    exportArea.style.border = '1px solid rgba(148,163,184,0.35)';
    exportArea.style.background = '#0b1220';
    exportArea.style.color = '#cbd5f5';
    exportArea.style.fontFamily = 'monospace';

    const ioControls = document.createElement('div');
    ioControls.style.display = 'flex';
    ioControls.style.gap = '8px';
    ioControls.style.flexWrap = 'wrap';
    ioControls.style.justifyContent = 'center';
    ioControls.style.alignItems = 'center';

    const exportButton = document.createElement('button');
    exportButton.textContent = text('buttons.export', 'エクスポート');
    styleButton(exportButton);
    const importButton = document.createElement('button');
    importButton.textContent = text('buttons.import', 'インポート');
    styleButton(importButton);
    const copyButton = document.createElement('button');
    copyButton.textContent = text('buttons.copy', 'コピー');
    styleButton(copyButton);

    const message = document.createElement('div');
    message.style.textAlign = 'center';
    message.style.minHeight = '20px';
    message.style.fontSize = '13px';
    message.style.color = '#fde68a';

    container.appendChild(exportArea);
    container.appendChild(ioControls);
    ioControls.appendChild(exportButton);
    ioControls.appendChild(importButton);
    ioControls.appendChild(copyButton);
    container.appendChild(message);

    root.appendChild(container);

    let paletteButtons = [];
    let selectedBlockId = 'normal';

    for (const block of BLOCK_TYPES) {
      if (block.id === 'empty') continue;
      const btn = document.createElement('button');
      styleButton(btn);
      btn.textContent = text(block.labelKey, block.labelFallback);
      btn.style.background = 'linear-gradient(135deg, ' + lighten(block.color, 0.2) + ', ' + block.color + ')';
      btn.style.border = '2px solid transparent';
      btn.dataset.blockId = block.id;
      if (block.id === selectedBlockId) {
        btn.style.borderColor = '#facc15';
      }
      btn.addEventListener('click', () => {
        selectedBlockId = block.id;
        updatePaletteSelection();
      });
      palette.appendChild(btn);
      paletteButtons.push(btn);
    }

    function updatePaletteSelection(){
      for (const btn of paletteButtons) {
        btn.style.borderColor = btn.dataset.blockId === selectedBlockId ? '#facc15' : 'transparent';
      }
    }

    let stage = createEmptyStage(DEFAULT_ROWS, DEFAULT_COLS);
    let mode = 'edit';
    let rafId = 0;
    let pointerDown = false;
    let eraseMode = false;

    const paddle = { x: (CANVAS_WIDTH - PADDLE_WIDTH)/2, y: PADDLE_Y, w: PADDLE_WIDTH, h: PADDLE_HEIGHT };
    const ball = { x: CANVAS_WIDTH/2, y: PADDLE_Y - 30, dx: BALL_SPEED * (Math.random() < 0.5 ? -1 : 1), dy: -BALL_SPEED, r: BALL_RADIUS };
    let bricks = [];
    let lives = 3;
    let score = 0;
    let hits = 0;

    function resetBall(){
      ball.x = CANVAS_WIDTH/2;
      ball.y = PADDLE_Y - 30;
      const angle = (Math.random()*0.8 + 0.3) * Math.PI;
      ball.dx = BALL_SPEED * Math.cos(angle);
      ball.dy = -Math.abs(BALL_SPEED * Math.sin(angle));
    }

    function resetPlayState(){
      lives = 3;
      score = 0;
      hits = 0;
      paddle.x = (CANVAS_WIDTH - PADDLE_WIDTH)/2;
      resetBall();
      bricks = buildBricksFromStage(stage);
    }

    function buildBricksFromStage(stageData){
      const rows = stageData.length;
      const cols = stageData[0].length;
      const blockWidth = Math.floor((CANVAS_WIDTH - GRID_MARGIN*2 - BLOCK_GAP*(cols-1)) / cols);
      const blockHeight = Math.floor((STAGE_HEIGHT - BLOCK_GAP*(rows-1)) / rows);
      const bricksArr = [];
      for (let r=0; r<rows; r++) {
        for (let c=0; c<cols; c++) {
          const cell = stageData[r][c];
          if (!cell || cell.type === 'empty') continue;
          const def = getBlockDef(cell.type);
          const hardness = cell.type === 'custom' ? Math.max(1, Math.min(MAX_CUSTOM_HARDNESS, cell.hardness || 1)) : def.hp;
          bricksArr.push({
            x: GRID_MARGIN + c * (blockWidth + BLOCK_GAP),
            y: STAGE_TOP + r * (blockHeight + BLOCK_GAP),
            w: blockWidth,
            h: blockHeight,
            type: cell.type,
            hp: hardness === Infinity ? Infinity : hardness,
            maxHp: hardness,
            def
          });
        }
      }
      return bricksArr;
    }

    function getBlockDef(typeId){
      return BLOCK_TYPES.find(b => b.id === typeId) || BLOCK_TYPES[1];
    }

    function createEmptyStage(rows, cols){
      const arr = [];
      for (let r=0; r<rows; r++) {
        const row = [];
        for (let c=0; c<cols; c++) {
          row.push({ type: 'empty', hardness: 0 });
        }
        arr.push(row);
      }
      return arr;
    }

    function resizeStage(rows, cols){
      rows = Math.max(MIN_ROWS, Math.min(MAX_ROWS, rows));
      cols = Math.max(MIN_COLS, Math.min(MAX_COLS, cols));
      const newStage = createEmptyStage(rows, cols);
      const minRows = Math.min(rows, stage.length);
      const minCols = Math.min(cols, stage[0].length);
      for (let r=0; r<minRows; r++) {
        for (let c=0; c<minCols; c++) {
          newStage[r][c] = { ...stage[r][c] };
        }
      }
      stage = newStage;
      draw();
    }

    function styleButton(btn){
      btn.style.padding = '6px 12px';
      btn.style.borderRadius = '999px';
      btn.style.border = '1px solid rgba(148,163,184,0.4)';
      btn.style.background = 'rgba(30,41,59,0.8)';
      btn.style.color = '#e2e8f0';
      btn.style.cursor = 'pointer';
      btn.style.fontSize = '13px';
    }

    function labelledNumber(labelText, value, min, max){
      const wrapper = document.createElement('label');
      wrapper.style.display = 'flex';
      wrapper.style.flexDirection = 'column';
      wrapper.style.alignItems = 'center';
      wrapper.style.fontSize = '12px';
      const span = document.createElement('span');
      span.textContent = labelText;
      span.style.marginBottom = '2px';
      const input = document.createElement('input');
      input.type = 'number';
      input.value = String(value);
      input.min = String(min);
      input.max = String(max);
      input.style.width = '64px';
      input.style.padding = '4px';
      input.style.borderRadius = '6px';
      input.style.border = '1px solid rgba(148,163,184,0.4)';
      input.style.background = '#0f172a';
      input.style.color = '#e2e8f0';
      wrapper.appendChild(span);
      wrapper.appendChild(input);
      return { wrapper, input };
    }

    function lighten(color, amount){
      if (color.startsWith('#')) {
        let r = parseInt(color.substr(1,2), 16);
        let g = parseInt(color.substr(3,2), 16);
        let b = parseInt(color.substr(5,2), 16);
        r = Math.min(255, Math.floor(r + (255-r)*amount));
        g = Math.min(255, Math.floor(g + (255-g)*amount));
        b = Math.min(255, Math.floor(b + (255-b)*amount));
        return `rgb(${r},${g},${b})`;
      }
      return color;
    }

    function draw(){
      ctx.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
      ctx.fillStyle = mode === 'edit' ? EDIT_BG : PLAY_BG;
      ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
      if (mode === 'edit') {
        drawStageEditor();
      } else {
        drawGameplay();
      }
    }

    function drawStageEditor(){
      const rows = stage.length;
      const cols = stage[0].length;
      const blockWidth = Math.floor((CANVAS_WIDTH - GRID_MARGIN*2 - BLOCK_GAP*(cols-1)) / cols);
      const blockHeight = Math.floor((STAGE_HEIGHT - BLOCK_GAP*(rows-1)) / Math.max(1, rows));
      ctx.save();
      ctx.translate(GRID_MARGIN, STAGE_TOP);
      for (let r=0; r<rows; r++) {
        for (let c=0; c<cols; c++) {
          const cell = stage[r][c];
          const x = c * (blockWidth + BLOCK_GAP);
          const y = r * (blockHeight + BLOCK_GAP);
          const def = getBlockDef(cell.type);
          if (cell.type !== 'empty') {
            ctx.fillStyle = def.color;
            ctx.fillRect(x, y, blockWidth, blockHeight);
            if (cell.type === 'custom') {
              ctx.fillStyle = '#0f172a';
              ctx.font = `${Math.max(12, Math.floor(blockHeight*0.6))}px bold sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(String(cell.hardness || 1), x + blockWidth/2, y + blockHeight/2);
            }
          } else {
            ctx.fillStyle = 'rgba(15,23,42,0.6)';
            ctx.fillRect(x, y, blockWidth, blockHeight);
          }
          ctx.strokeStyle = 'rgba(148,163,184,0.35)';
          ctx.lineWidth = 1;
          ctx.strokeRect(x+0.5, y+0.5, blockWidth-1, blockHeight-1);
        }
      }
      ctx.restore();
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(
        text(
          'hud.editHint',
          ({ blockCount }) => `編集モード: クリックで配置、右クリックで削除 / ブロック数: ${blockCount}`,
          { blockCount: countBlocks(stage) }
        ),
        20,
        CANVAS_HEIGHT - 24
      );
    }

    function drawGameplay(){
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0,0,CANVAS_WIDTH,48);
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '16px sans-serif';
      ctx.fillText(text('hud.score', ({ score }) => `SCORE ${score}`, { score }), 20, 28);
      ctx.fillText(text('hud.lives', ({ lives }) => `LIVES ${lives}`, { lives }), 180, 28);
      ctx.fillText(text('hud.hits', ({ hits }) => `HITS ${hits}`, { hits }), 300, 28);
      ctx.fillText(text('hud.returnHint', '編集中に戻るとリセット'), CANVAS_WIDTH - 220, 28);
      for (const brick of bricks) {
        if (Number.isFinite(brick.hp) && brick.hp <= 0) continue;
        const { x,y,w,h,type,hp,maxHp,def } = brick;
        ctx.fillStyle = def.color;
        ctx.fillRect(x, y, w, h);
        if (type === 'custom' && Number.isFinite(maxHp)) {
          ctx.fillStyle = '#0f172a';
          ctx.font = `${Math.max(12, Math.floor(h*0.55))}px bold sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(Math.max(0, Math.round(hp))), x + w/2, y + h/2);
        } else if (type === 'hard' && Number.isFinite(hp) && hp > 0 && hp <= 2) {
          ctx.fillStyle = '#0f172a';
          ctx.font = `${Math.max(12, Math.floor(h*0.5))}px bold sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(Math.round(hp)), x + w/2, y + h/2);
        }
      }
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2);
      ctx.fillStyle = '#fbbf24';
      ctx.fill();
    }

    function countBlocks(stageData){
      let total = 0;
      for (const row of stageData) for (const cell of row) if (cell.type !== 'empty') total++;
      return total;
    }

    function toStageCoords(x, y){
      const rows = stage.length;
      const cols = stage[0].length;
      const blockWidth = Math.floor((CANVAS_WIDTH - GRID_MARGIN*2 - BLOCK_GAP*(cols-1)) / cols);
      const blockHeight = Math.floor((STAGE_HEIGHT - BLOCK_GAP*(rows-1)) / Math.max(1, rows));
      const gridX = x - GRID_MARGIN;
      const gridY = y - STAGE_TOP;
      if (gridX < 0 || gridY < 0) return null;
      const col = Math.floor(gridX / (blockWidth + BLOCK_GAP));
      const row = Math.floor(gridY / (blockHeight + BLOCK_GAP));
      if (col < 0 || col >= cols || row < 0 || row >= rows) return null;
      return { row, col };
    }

    function placeBlock(row, col, typeId, hardness){
      if (!stage[row] || !stage[row][col]) return;
      if (typeId === 'empty') {
        stage[row][col] = { type: 'empty', hardness: 0 };
      } else if (typeId === 'custom') {
        const value = Math.max(1, Math.min(MAX_CUSTOM_HARDNESS, hardness || parseInt(hardnessInput.value, 10) || 1));
        stage[row][col] = { type: 'custom', hardness: value };
      } else {
        stage[row][col] = { type: typeId, hardness: getBlockDef(typeId).hp };
      }
      draw();
    }

    function loop(){
      update();
      draw();
      if (mode === 'play') {
        rafId = requestAnimationFrame(loop);
      }
    }

    function update(){
      ball.x += ball.dx;
      ball.y += ball.dy;

      if (ball.x < ball.r) {
        ball.x = ball.r;
        ball.dx *= -1;
      }
      if (ball.x > CANVAS_WIDTH - ball.r) {
        ball.x = CANVAS_WIDTH - ball.r;
        ball.dx *= -1;
      }
      if (ball.y < STAGE_TOP + ball.r) {
        ball.y = STAGE_TOP + ball.r;
        ball.dy *= -1;
      }

      if (ball.y > CANVAS_HEIGHT + ball.r) {
        lives -= 1;
        if (lives <= 0) {
          resetPlayState();
        } else {
          resetBall();
        }
        return;
      }

      if (ball.dy > 0 && intersect(ball, paddle)) {
        const relative = (ball.x - (paddle.x + paddle.w/2)) / (paddle.w/2);
        const speed = Math.hypot(ball.dx, ball.dy);
        const angle = relative * (Math.PI/3);
        ball.dx = speed * Math.sin(angle);
        ball.dy = -Math.abs(speed * Math.cos(angle));
        ball.y = paddle.y - ball.r - 0.1;
      }

      for (const brick of bricks) {
        if (brick.hp <= 0) continue;
        if (circleRectCollision(ball, brick)) {
          handleBrickHit(brick);
          const overlapX = Math.min(Math.abs(ball.x - brick.x), Math.abs(ball.x - (brick.x + brick.w)));
          const overlapY = Math.min(Math.abs(ball.y - brick.y), Math.abs(ball.y - (brick.y + brick.h)));
          if (overlapX < overlapY) {
            ball.dx *= -1;
          } else {
            ball.dy *= -1;
          }
          break;
        }
      }

      const speed = Math.hypot(ball.dx, ball.dy);
      const targetSpeed = BALL_SPEED;
      if (Math.abs(speed - targetSpeed) > 0.01) {
        const ratio = targetSpeed / speed;
        ball.dx *= ratio;
        ball.dy *= ratio;
      }
    }

    function handleBrickHit(brick){
      if (!Number.isFinite(brick.hp)) {
        // unbreakable bounce only
        hits += 1;
        return;
      }
      brick.hp -= 1;
      hits += 1;
      if (brick.hp <= 0) {
        score += brick.def.score;
        if (awardXp && brick.def.xp) awardXp(brick.def.xp, { type: 'hit', blockType: brick.type });
      } else if (brick.type === 'custom') {
        score += 25;
        if (awardXp) awardXp(0.5, { type: 'damage', blockType: brick.type });
      }
      const remaining = bricks.some(b => Number.isFinite(b.hp) && b.hp > 0);
      if (!remaining) {
        if (awardXp) awardXp(25, { type: 'clear' });
        resetPlayState();
      }
    }

    function intersect(ball, rect){
      return ball.x + ball.r > rect.x && ball.x - ball.r < rect.x + rect.w && ball.y + ball.r > rect.y && ball.y - ball.r < rect.y + rect.h;
    }

    function circleRectCollision(circle, rect){
      const nx = Math.max(rect.x, Math.min(circle.x, rect.x + rect.w));
      const ny = Math.max(rect.y, Math.min(circle.y, rect.y + rect.h));
      const dx = circle.x - nx;
      const dy = circle.y - ny;
      return dx*dx + dy*dy <= circle.r * circle.r;
    }

    function startPlay(){
      if (mode === 'play') return;
      if (countBlocks(stage) === 0) {
        message.textContent = text('messages.placeBlocks', 'ブロックを配置してください');
        return;
      }
      message.textContent = '';
      mode = 'play';
      modeLabel.textContent = text('mode.label.play', 'モード: プレイ');
      playButton.disabled = true;
      editButton.disabled = false;
      canvas.style.cursor = 'none';
      canvas.style.background = PLAY_BG;
      resetPlayState();
      draw();
      rafId = requestAnimationFrame(loop);
      window.addEventListener('keydown', keyHandler);
      canvas.addEventListener('mousemove', mouseMovePlay);
      canvas.addEventListener('touchmove', touchMovePlay, { passive: false });
    }

    function stopPlay(){
      if (mode === 'edit') return;
      mode = 'edit';
      modeLabel.textContent = text('mode.label.edit', 'モード: 編集');
      playButton.disabled = false;
      editButton.disabled = true;
      canvas.style.cursor = 'pointer';
      canvas.style.background = EDIT_BG;
      cancelAnimationFrame(rafId);
      rafId = 0;
      window.removeEventListener('keydown', keyHandler);
      canvas.removeEventListener('mousemove', mouseMovePlay);
      canvas.removeEventListener('touchmove', touchMovePlay);
      resetBall();
      draw();
    }

    function keyHandler(e){
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        paddle.x = Math.max(0, paddle.x - PADDLE_SPEED);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        paddle.x = Math.min(CANVAS_WIDTH - paddle.w, paddle.x + PADDLE_SPEED);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        stopPlay();
      }
    }

    function mouseMovePlay(e){
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      paddle.x = Math.max(0, Math.min(CANVAS_WIDTH - paddle.w, x - paddle.w/2));
    }

    function touchMovePlay(e){
      e.preventDefault();
      const touch = e.touches[0];
      if (!touch) return;
      const rect = canvas.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      paddle.x = Math.max(0, Math.min(CANVAS_WIDTH - paddle.w, x - paddle.w/2));
    }

    canvas.addEventListener('mousedown', (e) => {
      if (mode !== 'edit') return;
      pointerDown = true;
      eraseMode = (e.button === 2);
      const rect = canvas.getBoundingClientRect();
      const pos = toStageCoords(e.clientX - rect.left, e.clientY - rect.top);
      if (pos) {
        placeBlock(pos.row, pos.col, eraseMode ? 'empty' : selectedBlockId);
      }
    });

    canvas.addEventListener('mousemove', (e) => {
      if (mode !== 'edit' || !pointerDown) return;
      const rect = canvas.getBoundingClientRect();
      const pos = toStageCoords(e.clientX - rect.left, e.clientY - rect.top);
      if (pos) {
        placeBlock(pos.row, pos.col, eraseMode ? 'empty' : selectedBlockId);
      }
    });

    canvas.addEventListener('mouseup', () => { pointerDown = false; eraseMode = false; });
    canvas.addEventListener('mouseleave', () => { pointerDown = false; eraseMode = false; });
    canvas.addEventListener('contextmenu', (e) => { if (mode === 'edit') e.preventDefault(); });

    playButton.addEventListener('click', startPlay);
    editButton.addEventListener('click', stopPlay);

    clearButton.addEventListener('click', () => {
      stage = createEmptyStage(stage.length, stage[0].length);
      draw();
    });

    colsInput.input.addEventListener('change', () => {
      const cols = parseInt(colsInput.input.value, 10);
      if (!Number.isFinite(cols)) return;
      resizeStage(stage.length, cols);
    });
    rowsInput.input.addEventListener('change', () => {
      const rows = parseInt(rowsInput.input.value, 10);
      if (!Number.isFinite(rows)) return;
      resizeStage(rows, stage[0].length);
    });

    hardnessInput.addEventListener('change', () => {
      const val = Math.max(1, Math.min(MAX_CUSTOM_HARDNESS, parseInt(hardnessInput.value, 10) || 1));
      hardnessInput.value = String(val);
    });

    exportButton.addEventListener('click', () => {
      const data = {
        rows: stage.length,
        cols: stage[0].length,
        cells: cloneStage(stage)
      };
      exportArea.value = JSON.stringify(data);
      message.textContent = text('messages.exported', 'ステージデータをエクスポートしました。');
    });

    importButton.addEventListener('click', () => {
      try {
        const parsed = JSON.parse(exportArea.value);
        if (!parsed || !Array.isArray(parsed.cells)) throw new Error(text('errors.invalidCells', 'cellsが不正です'));
        let rows = Math.max(MIN_ROWS, Math.min(MAX_ROWS, parsed.rows || parsed.cells.length));
        let cols = Math.max(MIN_COLS, Math.min(MAX_COLS, parsed.cols || (parsed.cells[0] ? parsed.cells[0].length : MIN_COLS)));
        const newStage = createEmptyStage(rows, cols);
        for (let r=0; r<rows; r++) {
          for (let c=0; c<cols; c++) {
            const cell = parsed.cells[r] && parsed.cells[r][c];
            if (cell && typeof cell.type === 'string' && getBlockDef(cell.type)) {
              if (cell.type === 'custom') {
                const hardness = Math.max(1, Math.min(MAX_CUSTOM_HARDNESS, cell.hardness || 1));
                newStage[r][c] = { type: 'custom', hardness };
              } else if (cell.type === 'empty') {
                newStage[r][c] = { type: 'empty', hardness: 0 };
              } else {
                newStage[r][c] = { type: cell.type, hardness: getBlockDef(cell.type).hp };
              }
            }
          }
        }
        stage = newStage;
        colsInput.input.value = String(cols);
        rowsInput.input.value = String(rows);
        message.textContent = text('messages.imported', 'ステージをインポートしました。');
        draw();
      } catch (err) {
        const errorMessage = err?.message || String(err);
        message.textContent = text('messages.importFailed', ({ error }) => `インポートに失敗しました: ${error}`, { error: errorMessage });
      }
    });

    copyButton.addEventListener('click', async () => {
      if (!navigator.clipboard) {
        message.textContent = text('messages.copyUnsupported', 'クリップボード非対応のためコピーできません');
        return;
      }
      try {
        await navigator.clipboard.writeText(exportArea.value);
        message.textContent = text('messages.copySuccess', 'コピーしました');
      } catch (err) {
        const errorMessage = err?.message || String(err);
        message.textContent = text('messages.copyFailed', ({ error }) => `コピーに失敗: ${error}`, { error: errorMessage });
      }
    });

    function destroy(){
      stopPlay();
      window.removeEventListener('keydown', keyHandler);
      canvas.removeEventListener('mousemove', mouseMovePlay);
      canvas.removeEventListener('touchmove', touchMovePlay);
      root && root.removeChild(container);
    }

    draw();

    return {
      start(){},
      stop(){ stopPlay(); },
      destroy,
      getScore(){ return score; }
    };
  }

  window.registerMiniGame({
    id: 'sandbox_breakout',
    name: 'サンドボックスブロック崩し',
    nameKey: 'selection.miniexp.games.sandbox_breakout.name',
    description: 'ステージを自分で作り、そのままプレイできるブロック崩し。カスタム硬さ・インポート/エクスポート対応',
    descriptionKey: 'selection.miniexp.games.sandbox_breakout.description',
    categoryIds: ['action'],
    create
  });
})();

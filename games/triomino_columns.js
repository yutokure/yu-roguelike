(function(){
  /** MiniExp: Triomino Columns (トリオミノコラムス) */
  function create(root, awardXp, opts){
    const wrapper = document.createElement('div');
    wrapper.className = 'triomino-columns-root';
    wrapper.style.position = 'relative';
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    root.appendChild(wrapper);

    const menu = document.createElement('div');
    menu.className = 'triomino-columns-menu';
    menu.style.position = 'absolute';
    menu.style.inset = '0';
    menu.style.display = 'flex';
    menu.style.flexDirection = 'column';
    menu.style.alignItems = 'center';
    menu.style.justifyContent = 'center';
    menu.style.gap = '16px';
    menu.style.background = 'rgba(5,10,20,0.85)';
    menu.style.backdropFilter = 'blur(4px)';
    function clearMenu(){
      menu.innerHTML = '';
      menu.style.display = 'flex';
    }

    function makeMenuButton(label, handler){
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.style.padding = '12px 18px';
      btn.style.borderRadius = '12px';
      btn.style.background = 'linear-gradient(135deg,#334155,#1e293b)';
      btn.style.color = '#e2e8f0';
      btn.style.border = '1px solid rgba(148,163,184,0.4)';
      btn.style.fontSize = '16px';
      btn.style.cursor = 'pointer';
      btn.style.minWidth = '240px';
      btn.style.boxShadow = '0 8px 24px rgba(15,23,42,0.35)';
      btn.style.transition = 'transform 0.12s ease, box-shadow 0.12s ease';
      btn.addEventListener('pointerenter', () => {
        btn.style.transform = 'translateY(-2px)';
        btn.style.boxShadow = '0 12px 30px rgba(15,23,42,0.45)';
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.transform = 'translateY(0)';
        btn.style.boxShadow = '0 8px 24px rgba(15,23,42,0.35)';
      });
      btn.addEventListener('click', handler);
      return btn;
    }

    function renderMainMenu(){
      clearMenu();
      const title = document.createElement('div');
      title.style.color = '#f8fafc';
      title.style.fontSize = '26px';
      title.style.fontWeight = '600';
      title.style.textShadow = '0 3px 8px rgba(0,0,0,0.4)';
      title.textContent = 'トリオミノコラムス';
      const subtitle = document.createElement('div');
      subtitle.style.color = '#cbd5f5';
      subtitle.style.fontSize = '14px';
      subtitle.textContent = 'モードを選んでください';
      menu.appendChild(title);
      menu.appendChild(subtitle);
      const btnWrap = document.createElement('div');
      btnWrap.style.display = 'flex';
      btnWrap.style.flexDirection = 'column';
      btnWrap.style.gap = '12px';
      const configs = [
        { label: 'ENDLESS - ゲームオーバーまで', desc: '基本のひとり用モード', handler: () => startMode('ENDLESS') },
        { label: 'VS.RIVAL - CPU戦', desc: 'GEARSキャラクター達と対戦', handler: () => renderCpuSelect() },
        { label: 'VS.2P - ふたりで対戦', desc: 'ローカル対戦用（WASD + JK）', handler: () => startMode('VS_2P') }
      ];
      configs.forEach(cfg => {
        const item = document.createElement('div');
        item.style.textAlign = 'center';
        const btn = makeMenuButton(cfg.label, cfg.handler);
        const desc = document.createElement('div');
        desc.textContent = cfg.desc;
        desc.style.fontSize = '12px';
        desc.style.color = '#94a3b8';
        item.appendChild(btn);
        item.appendChild(desc);
        btnWrap.appendChild(item);
      });
      menu.appendChild(btnWrap);
    }

    function renderCpuSelect(){
      clearMenu();
      const title = document.createElement('div');
      title.style.color = '#f8fafc';
      title.style.fontSize = '24px';
      title.style.fontWeight = '600';
      title.textContent = 'VS.RIVAL - 対戦相手選択';
      const subtitle = document.createElement('div');
      subtitle.style.color = '#94a3b8';
      subtitle.style.fontSize = '13px';
      subtitle.textContent = '挑戦したいライバルを選んでください';
      menu.appendChild(title);
      menu.appendChild(subtitle);
      const grid = document.createElement('div');
      grid.style.display = 'grid';
      grid.style.gridTemplateColumns = 'repeat(2, minmax(200px, 1fr))';
      grid.style.gap = '12px';
      CPU_RIVALS.forEach((rival, idx) => {
        const card = document.createElement('button');
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.alignItems = 'flex-start';
        card.style.padding = '14px';
        card.style.borderRadius = '12px';
        card.style.background = 'linear-gradient(135deg,#1e293b,#0f172a)';
        card.style.color = '#e2e8f0';
        card.style.border = '1px solid rgba(148,163,184,0.35)';
        card.style.cursor = 'pointer';
        card.style.transition = 'transform 0.12s ease, box-shadow 0.12s ease';
        card.addEventListener('pointerenter', () => {
          card.style.transform = 'translateY(-2px)';
          card.style.boxShadow = '0 12px 30px rgba(15,23,42,0.45)';
        });
        card.addEventListener('pointerleave', () => {
          card.style.transform = 'translateY(0)';
          card.style.boxShadow = '0 6px 18px rgba(15,23,42,0.3)';
        });
        const locked = isRivalLocked(idx);
        if (locked){
          card.style.opacity = '0.45';
          card.style.cursor = 'not-allowed';
        }
        const name = document.createElement('div');
        name.style.fontSize = '16px';
        name.style.fontWeight = '600';
        name.textContent = `${idx+1}. ${rival.name}`;
        const detail = document.createElement('div');
        detail.style.fontSize = '12px';
        detail.style.color = '#cbd5f5';
        detail.textContent = locked ? lockReason(idx) : `速さLv.${rival.speedLevel} / 攻撃性 ${(rival.aggression*100)|0}%`;
        card.appendChild(name);
        card.appendChild(detail);
        if (!locked) card.addEventListener('click', () => startVsCpuChain(idx));
        grid.appendChild(card);
      });
      menu.appendChild(grid);
      const hint = document.createElement('div');
      hint.style.fontSize = '11px';
      hint.style.color = '#94a3b8';
      hint.textContent = '※ ハグルマンレディは連勝で解放。？？？はノーコンティニュー＆15分以内で解放。';
      menu.appendChild(hint);
      const back = makeMenuButton('← モード選択に戻る', () => renderMainMenu());
      back.style.marginTop = '8px';
      menu.appendChild(back);
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(520, Math.min(720, root.clientWidth || 640));
    canvas.height = Math.max(420, Math.min(640, root.clientHeight || 480));
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    canvas.style.background = '#020617';
    canvas.style.borderRadius = '10px';
   canvas.style.boxShadow = '0 12px 28px rgba(8,15,30,0.6)';
   wrapper.appendChild(canvas);
   wrapper.appendChild(menu);
    const overlay = document.createElement('div');
    overlay.style.position = 'absolute';
    overlay.style.inset = '0';
    overlay.style.display = 'none';
    overlay.style.background = 'rgba(2,6,12,0.78)';
    overlay.style.backdropFilter = 'blur(4px)';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.flexDirection = 'column';
    overlay.style.gap = '18px';
    overlay.style.color = '#e2e8f0';
    overlay.style.zIndex = '3';
    overlay.className = 'triomino-columns-overlay';
    wrapper.appendChild(overlay);
    renderMainMenu();

    function hideOverlay(){
      overlay.style.display = 'none';
      overlay.innerHTML = '';
    }

    function showResultOverlay(config){
      overlay.innerHTML = '';
      overlay.style.display = 'flex';
      const title = document.createElement('div');
      title.textContent = config.title || '';
      title.style.fontSize = '24px';
      title.style.fontWeight = '600';
      title.style.textShadow = '0 4px 12px rgba(0,0,0,0.45)';
      overlay.appendChild(title);
      if (config.message){
        const body = document.createElement('div');
        body.style.fontSize = '14px';
        body.style.color = '#cbd5f5';
        body.style.textAlign = 'center';
        body.style.maxWidth = '320px';
        body.textContent = config.message;
        overlay.appendChild(body);
      }
      const btnRow = document.createElement('div');
      btnRow.style.display = 'flex';
      btnRow.style.flexDirection = 'column';
      btnRow.style.gap = '10px';
      (config.buttons || []).forEach(btnCfg => {
        const btn = makeMenuButton(btnCfg.label, () => {
          hideOverlay();
          btnCfg.onClick && btnCfg.onClick();
        });
        if (btnCfg.primary){
          btn.style.background = 'linear-gradient(135deg,#3f83f8,#1d4ed8)';
          btn.style.border = '1px solid rgba(59,130,246,0.6)';
        }
        btnRow.appendChild(btn);
      });
      overlay.appendChild(btnRow);
    }
    const ctx = canvas.getContext('2d');

    const COLS = 5;
    const VISIBLE_ROWS = 10;
    const HIDDEN_ROWS = 2;
    const ROWS = VISIBLE_ROWS + HIDDEN_ROWS;

    const GRAVITY_TABLE = {
      ENDLESS: [0.8, 0.65, 0.5, 0.35, 0.25, 0.18, 0.12, 0.08],
      VS_CPU: [0.7, 0.55, 0.42, 0.3, 0.2, 0.14, 0.1, 0.075],
      VS_2P: [0.65, 0.5, 0.38, 0.26, 0.18],
    };

    const MARKS = [
      { id: 'sun', color: '#f97316', name: '太陽' },
      { id: 'leaf', color: '#22c55e', name: '葉っぱ' },
      { id: 'aqua', color: '#38bdf8', name: 'しずく' },
      { id: 'berry', color: '#a855f7', name: 'ベリー' },
      { id: 'rose', color: '#f43f5e', name: 'ローズ' },
      { id: 'amber', color: '#facc15', name: 'アンバー' }
    ];
    const MULTI_COLOR = '#e2e8f0';
    const GARBAGE_COLOR = '#0f172a';
    const POST_LOCK_DELAY = 0.18;
    const BASE_SHAPES = {
      I: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }],
      L: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
    };

    function normalizeCells(cells){
      const minX = Math.min(...cells.map(c => c.x));
      const minY = Math.min(...cells.map(c => c.y));
      return cells.map(c => ({ x: c.x - minX, y: c.y - minY }));
    }

    function rotateCellsCW(cells){
      return cells.map(({ x, y }) => ({ x: y, y: -x }));
    }

    function buildShapeRotations(baseCells){
      const variants = [];
      let current = baseCells.map(c => ({ ...c }));
      for (let i = 0; i < 4; i++){
        const norm = normalizeCells(current);
        const width = Math.max(...norm.map(c => c.x)) + 1;
        const height = Math.max(...norm.map(c => c.y)) + 1;
        variants.push({ width, height, cells: norm.map(c => ({ ...c })) });
        current = rotateCellsCW(current);
      }
      return variants;
    }

    const SHAPES = Object.fromEntries(
      Object.entries(BASE_SHAPES).map(([key, cells]) => [key, { rotations: buildShapeRotations(cells) }])
    );
    const SHAPE_KEYS = Object.keys(SHAPES);

    const KEYMAP_P1 = {
      left: ['ArrowLeft'],
      right: ['ArrowRight'],
      soft: ['ArrowDown'],
      hard: ['Space'],
      rotateCW: ['ArrowUp', 'KeyX'],
      rotateCCW: ['KeyZ'],
      hold: ['ShiftRight', 'KeyC'],
      pause: ['Escape'],
    };
    const KEYMAP_P2 = {
      left: ['KeyA'],
      right: ['KeyD'],
      soft: ['KeyS'],
      hard: ['KeyF'],
      rotateCW: ['KeyW', 'KeyR'],
      rotateCCW: ['KeyE'],
      hold: ['KeyQ'],
    };

    const nowMs = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());

    function cloneBlocks(blocks){
      return blocks.map(c => ({ ...c }));
    }

    function makeRotationIndex(shapeKey, rotation){
      const defs = SHAPES[shapeKey].rotations;
      const len = defs.length;
      return ((rotation % len) + len) % len;
    }

    function getRotationDefFor(shapeKey, rotation){
      const idx = makeRotationIndex(shapeKey, rotation);
      return SHAPES[shapeKey].rotations[idx];
    }

    function forEachPieceCell(piece, px, py, rotationIndex, callback){
      const rot = getRotationDefFor(piece.shape, rotationIndex);
      const blocks = piece.blocks;
      rot.cells.forEach((pos, idx) => {
        const block = blocks[idx] || blocks[blocks.length - 1] || null;
        callback(px + pos.x, py + pos.y, block, idx);
      });
    }

    function createProtoPiece(shapeKey, blocks, multiInjected){
      return {
        shape: shapeKey,
        rotation: 0,
        blocks: cloneBlocks(blocks),
        multiInjected: multiInjected || 0,
      };
    }

    function activatePiece(proto){
      const piece = {
        shape: proto.shape,
        rotation: makeRotationIndex(proto.shape, proto.rotation || 0),
        blocks: cloneBlocks(proto.blocks),
        multiInjected: proto.multiInjected || 0,
        x: 0,
        y: 0,
        fallTimer: 0,
        lockTimer: 0,
      };
      applyMultiInjection(piece);
      const rot = getRotationDefFor(piece.shape, piece.rotation);
      piece.x = Math.floor((COLS - rot.width) / 2);
      piece.y = -rot.height;
      return piece;
    }

    function detachPiece(piece){
      return {
        shape: piece.shape,
        rotation: 0,
        blocks: cloneBlocks(piece.blocks),
        multiInjected: piece.multiInjected || 0,
      };
    }

    let currentMode = null;
    let running = false;
    let rafHandle = 0;
    let lastTs = 0;
    let boards = [];
    let infoMessage = '';
    let infoTimer = 0;

    function createGrid(){
      return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    }

    function cloneGrid(grid){
      return grid.map(row => row.map(cell => cell ? { ...cell } : null));
    }

    function randomMark(){
      const idx = Math.floor(Math.random() * MARKS.length);
      return MARKS[idx];
    }

    function makePiece({ forceMulti = false } = {}){
      const shapeKey = SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)];
      const blocks = [];
      for (let i = 0; i < 3; i++) {
        const mk = randomMark();
        blocks.push({ mark: mk.id, color: mk.color, name: mk.name, multi: false });
      }
      const proto = createProtoPiece(shapeKey, blocks, forceMulti ? 1 : 0);
      if (forceMulti) {
        proto.blocks[0] = { mark: 'multi', color: MULTI_COLOR, name: 'マルチ', multi: true };
      }
      applyMultiInjection(proto);
      return proto;
    }

    function spawnPiece(boardState, opts = {}){
      const nextProto = boardState.queue.shift() || makePiece();
      boardState.queue.push(makePiece());
      const piece = activatePiece(nextProto);
      boardState.current = piece;
      boardState.holdLocked = false;
      boardState.pendingSpawn = false;
      if (opts.forceMulti) {
        piece.multiInjected = Math.max(piece.multiInjected || 0, 1);
        applyMultiInjection(piece);
      }
      if (collides(boardState, piece, piece.x, piece.y, piece.rotation)) {
        boardState.alive = false;
        boardState.topOut = true;
      }
    }

    function collides(boardState, piece, px = piece.x, py = piece.y, rotationIndex = piece.rotation){
      let hit = false;
      forEachPieceCell(piece, px, py, rotationIndex, (gx, gy) => {
        if (hit) return;
        if (gx < 0 || gx >= COLS) { hit = true; return; }
        if (gy >= ROWS) { hit = true; return; }
        if (gy >= 0 && boardState.grid[gy][gx]) { hit = true; }
      });
      return hit;
    }

    function movePiece(boardState, dx){
      const piece = boardState.current;
      if (!piece) return;
      const nx = piece.x + dx;
      if (!collides(boardState, piece, nx, piece.y, piece.rotation)) {
        piece.x = nx;
      }
    }

    function rotatePiece(boardState, dir){
      const piece = boardState.current;
      if (!piece) return false;
      const shape = SHAPES[piece.shape];
      const len = shape.rotations.length;
      const targetRot = makeRotationIndex(piece.shape, piece.rotation + dir);
      const kicks = [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 }];
      const ox = piece.x;
      const oy = piece.y;
      for (const kick of kicks){
        const nx = ox + kick.x;
        const ny = oy + kick.y;
        if (!collides(boardState, piece, nx, ny, targetRot)) {
          piece.rotation = targetRot;
          piece.x = nx;
          piece.y = ny;
          return true;
        }
      }
      return false;
    }

    function hardDrop(boardState){
      const piece = boardState.current;
      if (!piece) return;
      while (!collides(boardState, piece, piece.x, piece.y + 1, piece.rotation)) {
        piece.y += 1;
      }
      lockPiece(boardState, { hard: true });
    }

    function softDrop(boardState){
      const piece = boardState.current;
      if (!piece) return;
      if (!collides(boardState, piece, piece.x, piece.y + 1, piece.rotation)) {
        piece.y += 1;
        awardXp(0.1, { type: 'softdrop' });
      } else {
        piece.lockTimer += 0.1;
      }
    }

    function holdPiece(boardState){
      if (!boardState.current || boardState.holdLocked) return;
      const currentPiece = boardState.current;
      const proto = detachPiece(currentPiece);
      boardState.current = null;
      if (!boardState.hold) {
        boardState.hold = proto;
        spawnPiece(boardState);
      } else {
        const swappedProto = boardState.hold;
        boardState.hold = proto;
        const nextPiece = activatePiece(swappedProto);
        boardState.current = nextPiece;
        if (collides(boardState, nextPiece, nextPiece.x, nextPiece.y, nextPiece.rotation)) {
          boardState.alive = false;
          boardState.topOut = true;
        }
      }
      boardState.holdLocked = true;
    }

    function lockPiece(boardState, meta = {}){
      const piece = boardState.current;
      if (!piece) return;
      const baseGrid = boardState.grid.map(row => row.slice());
      const newBlocks = [];
      forEachPieceCell(piece, piece.x, piece.y, piece.rotation, (gx, gy, cell) => {
        newBlocks.push({
          x: gx,
          y: gy,
          cell: { mark: cell.mark, color: cell.color, multi: !!cell.multi },
        });
      });

      const { grid: mergedGrid, topOut } = settleNewBlocks(baseGrid, newBlocks);
      boardState.grid = mergedGrid;
      if (topOut) {
        boardState.alive = false;
        boardState.topOut = true;
      }
      boardState.current = null;
      boardState.lastLockWasHard = !!meta.hard;
      boardState.postSettleTimer = POST_LOCK_DELAY;
      boardState.pendingSpawn = boardState.alive;
    }

    function resolveBoard(boardState){
      let combo = 0;
      let totalCleared = 0;
      let totalSpark = 0;
      let largestGroup = 0;
      let multiRewards = [];
      let multiShowerCount = 0;
      let attackMeter = 0;
      const sparkMarks = new Set();

      while (true) {
        const { toClear, groupInfo, sparks } = findMatches(boardState.grid);
        if (!toClear.size) break;
        combo += 1;
        const cleared = applyClear(boardState.grid, toClear);
        totalCleared += cleared;
        if (sparks.length) {
          sparks.forEach(sp => {
            sparkMarks.add(sp.mark);
          });
          totalSpark += sparks.length;
        }
        const biggest = Math.max(0, ...groupInfo.map(g => g.size));
        if (biggest > largestGroup) largestGroup = biggest;
        groupInfo.forEach(g => {
          if (g.size >= 6 && !g.multiOnly) {
            const count = g.size >= 8 ? 3 : g.size >= 7 ? 2 : 1;
            multiRewards.push(count);
            if (g.size >= 9) multiShowerCount += 1;
          }
          if (g.size >= 3) attackMeter += Math.max(0, g.size - 2);
        });
        applyGravity(boardState.grid);
      }

      return {
        combo,
        totalCleared,
        totalSpark,
        largestGroup,
        multiRewards,
        multiShowerCount,
        attackMeter,
        sparkMarks: Array.from(sparkMarks),
      };
    }

    function findMatches(grid){
      const toClear = new Set();
      const groups = [];
      const sparks = [];

      // Line Spark check
      for (let y = 0; y < ROWS; y++){
        let filled = true;
        let base = null;
        let multiCount = 0;
        for (let x = 0; x < COLS; x++){
          const cell = grid[y][x];
          if (!cell || cell.garbage) { filled = false; break; }
          if (cell.multi) { multiCount += 1; continue; }
          if (!base) base = cell.mark;
          else if (cell.mark !== base) { filled = false; break; }
        }
        if (filled && base) {
          sparks.push({ mark: base, row: y });
          for (let x = 0; x < COLS; x++) toClear.add(coordKey(x, y));
          for (let yy = 0; yy < ROWS; yy++)
            for (let xx = 0; xx < COLS; xx++)
              if (grid[yy][xx] && grid[yy][xx].mark === base && !grid[yy][xx].garbage)
                toClear.add(coordKey(xx, yy));
        }
      }

      function consumeRun(run){
        if (run.cells.length >= 3 && run.baseMark){
          const keyCells = [];
          run.cells.forEach(({ x, y }) => {
            toClear.add(coordKey(x, y));
            keyCells.push({ x, y });
          });
          groups.push({ size: run.cells.length, mark: run.baseMark, multiOnly: run.multiCount === run.cells.length, cells: keyCells });
        }
      }

      // Horizontal runs
      for (let y = 0; y < ROWS; y++){
        let run = { cells: [], baseMark: null, multiCount: 0 };
        for (let x = 0; x < COLS; x++){
          const cell = grid[y][x];
          if (!cell || cell.garbage) {
            consumeRun(run);
            run = { cells: [], baseMark: null, multiCount: 0 };
            continue;
          }
          if (cell.multi) {
            run.cells.push({ x, y });
            run.multiCount += 1;
          } else {
            if (!run.baseMark) run.baseMark = cell.mark;
            if (run.baseMark !== cell.mark) {
              consumeRun(run);
              run = { cells: [{ x, y }], baseMark: cell.mark, multiCount: 0 };
            } else {
              run.cells.push({ x, y });
            }
          }
          if (run.cells.length >= 3 && !run.baseMark) run.baseMark = cell && !cell.multi ? cell.mark : run.baseMark;
        }
        consumeRun(run);
      }

      // Vertical runs
      for (let x = 0; x < COLS; x++){
        let run = { cells: [], baseMark: null, multiCount: 0 };
        for (let y = 0; y < ROWS; y++){
          const cell = grid[y][x];
          if (!cell || cell.garbage) {
            consumeRun(run);
            run = { cells: [], baseMark: null, multiCount: 0 };
            continue;
          }
          if (cell.multi) {
            run.cells.push({ x, y });
            run.multiCount += 1;
          } else {
            if (!run.baseMark) run.baseMark = cell.mark;
            if (run.baseMark !== cell.mark) {
              consumeRun(run);
              run = { cells: [{ x, y }], baseMark: cell.mark, multiCount: 0 };
            } else {
              run.cells.push({ x, y });
            }
          }
          if (run.cells.length >= 3 && !run.baseMark) run.baseMark = cell && !cell.multi ? cell.mark : run.baseMark;
        }
        consumeRun(run);
      }

      return { toClear, groupInfo: groups, sparks };
    }

    function coordKey(x, y){ return `${x}:${y}`; }

    function applyClear(grid, toClear){
      const queue = Array.from(toClear, key => key.split(':').map(Number));
      const extra = [];
      queue.forEach(([x, y]) => {
        const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
        dirs.forEach(([dx, dy]) => {
          const nx = x + dx, ny = y + dy;
          if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS){
            const ncell = grid[ny][nx];
            if (ncell && ncell.garbage) extra.push(`${nx}:${ny}`);
          }
        });
      });
      extra.forEach(k => toClear.add(k));
      let cleared = 0;
      toClear.forEach(key => {
        const [x, y] = key.split(':').map(Number);
        if (grid[y] && grid[y][x]) {
          grid[y][x] = null;
          cleared += 1;
        }
      });
      return cleared;
    }

    function applyGravity(grid){
      for (let x = 0; x < COLS; x++){
        let writeRow = ROWS - 1;
        for (let y = ROWS - 1; y >= 0; y--){
          const cell = grid[y][x];
          if (cell) {
            if (writeRow !== y) {
              grid[writeRow][x] = cell;
              grid[y][x] = null;
            }
            writeRow -= 1;
          }
        }
        for (let y = writeRow; y >= 0; y--) grid[y][x] = null;
      }
    }

    function settleNewBlocks(baseGrid, blocks){
      const snapshot = baseGrid.map(row => row.slice());
      const active = blocks.map(block => ({
        x: block.x,
        y: block.y,
        cell: { mark: block.cell.mark, color: block.cell.color, multi: !!block.cell.multi },
        settled: false,
      }));

      const coordKey = (x, y) => `${x}:${y}`;
      const settledSet = new Set();
      let iterations = 0;
      while (true) {
        let moved = false;
        let anyUnsettled = false;
        // process from lowest y to highest so bottom blocks settle first
        active.sort((a, b) => b.y - a.y);
        for (const block of active) {
          if (block.settled) continue;
          const belowY = block.y + 1;
          let supported = false;
          if (belowY >= ROWS) {
            supported = true;
          } else if (snapshot[belowY][block.x]) {
            supported = true;
          } else if (settledSet.has(coordKey(block.x, belowY))) {
            supported = true;
          }
          if (supported) {
            block.settled = true;
            settledSet.add(coordKey(block.x, block.y));
          } else {
            anyUnsettled = true;
          }
        }

        if (!active.some(b => !b.settled)) {
          break;
        }

        for (const block of active) {
          if (block.settled) continue;
          block.y += 1;
          moved = true;
        }

        iterations += 1;
        if (!moved || iterations > ROWS * 4) {
          // Force settle remaining to avoid infinite loop
          active.forEach(block => {
            if (!block.settled) {
              block.settled = true;
              settledSet.add(coordKey(block.x, block.y));
            }
          });
          break;
        }
      }

      const newGrid = snapshot.map(row => row.slice());
      let topOut = false;
      for (const block of active) {
        if (block.y < 0) {
          topOut = true;
          continue;
        }
        if (block.y >= ROWS) continue;
        newGrid[block.y][block.x] = {
          mark: block.cell.mark,
          color: block.cell.color,
          multi: !!block.cell.multi,
          garbage: false,
        };
      }

      if (!topOut && isOverTop(newGrid)) topOut = true;

      return { grid: newGrid, topOut };
    }

    function handleAfterClear(boardState, result){
      if (!result) return;
      if (result.totalCleared > 0) {
        boardState.stats.lines += result.totalCleared;
        awardXp(result.totalCleared * 0.6, { type: 'clear', cells: result.totalCleared, mode: currentMode });
      }
      if (result.combo >= 2) {
        boardState.stats.combos += 1;
        showInfo(`${boardState.name}: ${result.combo}連鎖!`);
        awardXp(result.combo * 2, { type: 'combo', combo: result.combo });
      }
      if (result.totalSpark > 0) {
        boardState.stats.spark += result.totalSpark;
        showInfo('ラインスパーク!');
        if (boards.length > 1) {
          boards.forEach(other => {
            if (other !== boardState && other.alive) {
              other.pendingGarbage += result.totalSpark;
            }
          });
        }
      }
      if (result.multiRewards && result.multiRewards.length) {
        applyMultiRewards(boardState, result.multiRewards);
      }
      if (result.multiShowerCount) {
        boardState.multiShower += result.multiShowerCount;
      }
      if (result.attackMeter > 0 && boards.length > 1) {
        boardState.attackGauge += result.attackMeter;
      }
    }

    function applyMultiRewards(boardState, rewards){
      rewards.forEach(count => injectMultiToFuturePiece(boardState, count));
    }

    function injectMultiToFuturePiece(boardState, count){
      if (!boardState.queue || !boardState.queue.length) return;
      const desired = Math.max(1, Math.min(3, count | 0));
      let targetIndex = 1;
      while (true) {
        while (boardState.queue.length <= targetIndex) {
          boardState.queue.push(makePiece());
        }
        const piece = boardState.queue[targetIndex];
        const current = piece.multiInjected || 0;
        if (current >= 3) {
          targetIndex += 1;
          continue;
        }
        piece.multiInjected = Math.max(current, desired);
        applyMultiInjection(piece);
        break;
      }
    }

    function applyMultiInjection(piece){
      if (!piece || !piece.blocks) return;
      const order = [1, 0, 2];
      const desired = Math.min(piece.blocks.length, Math.min(3, Math.max(0, piece.multiInjected | 0)));
      if (!desired) return;
      let existing = piece.blocks.reduce((acc, block) => acc + (block && block.multi ? 1 : 0), 0);
      for (let i = 0; i < order.length && existing < desired; i++){
        const idx = order[i];
        const base = piece.blocks[idx] || {};
        if (base.multi) continue;
        piece.blocks[idx] = { mark: 'multi', color: MULTI_COLOR, name: 'マルチ', multi: true, garbage: false };
        existing += 1;
      }
      piece.multiInjected = Math.max(desired, existing);
    }

    function processPostSettle(boardState){
      boardState.postSettleTimer = 0;
      if (!boardState.alive) {
        boardState.pendingSpawn = false;
        return;
      }
      const result = resolveBoard(boardState);
      handleAfterClear(boardState, result);
      if (boardState.pendingSpawn) {
        spawnPiece(boardState);
        boardState.pendingSpawn = false;
      }
    }

    function pushGarbage(boardState, rows, opts = {}){
      for (let r = 0; r < rows; r++) {
        for (let y = 0; y < ROWS - 1; y++)
          for (let x = 0; x < COLS; x++)
            boardState.grid[y][x] = boardState.grid[y+1][x];
        const newRow = Array.from({ length: COLS }, () => ({ mark: 'garbage', color: GARBAGE_COLOR, garbage: true, multi: false }));
        boardState.grid[ROWS - 1] = newRow;
      }
      if (boardState.current){
        boardState.current.y = Math.max(boardState.current.y - rows, -3);
      }
      if (opts.fromLineSpark) {
        showInfo(`${boardState.name}におじゃま!`);
      }
      if (isOverTop(boardState.grid)) {
        boardState.alive = false;
        boardState.topOut = true;
      }
    }

    function isOverTop(grid){
      for (let y = 0; y < HIDDEN_ROWS; y++)
        for (let x = 0; x < COLS; x++)
          if (grid[y][x]) return true;
      return false;
    }

    function showInfo(msg){
      infoMessage = msg;
      infoTimer = 2.2;
    }

    function startMode(mode, opts = {}){
      currentMode = mode;
      menu.style.display = 'none';
      hideOverlay();
      if (mode !== 'VS_CPU') vsCpuState = null;
      setupMode(mode, opts);
      running = true;
      lastTs = 0;
      rafHandle = requestAnimationFrame(loop);
    }

    const CPU_RIVALS = [
      { name: 'カラクリン', speedLevel: 1, aggression: 0.6 },
      { name: 'ハグルマンJr.', speedLevel: 2, aggression: 0.7 },
      { name: 'からくり忍者', speedLevel: 3, aggression: 0.75 },
      { name: 'ハグルマン2号', speedLevel: 4, aggression: 0.8 },
      { name: 'ハグルマン3号', speedLevel: 5, aggression: 0.85 },
      { name: 'シャドウハグル', speedLevel: 6, aggression: 0.9 },
      { name: 'ハグルマンレディ', speedLevel: 7, aggression: 0.95 },
      { name: '？？？', speedLevel: 8, aggression: 1.0 }
    ];

    let vsCpuProgress = { bestReached: 0, ladyUnlocked: false, hiddenUnlocked: false, fastestClear: null };
    let vsCpuState = null;

    function isRivalLocked(idx){
      if (idx === 0) return false;
      if (idx === 6) {
        if (vsCpuProgress.ladyUnlocked) return false;
        return vsCpuProgress.bestReached < 5;
      }
      if (idx === 7) {
        return !vsCpuProgress.hiddenUnlocked;
      }
      return idx > vsCpuProgress.bestReached + 1;
    }

    function lockReason(idx){
      if (idx === 6) return '条件: 連勝でハグルマン軍を突破';
      if (idx === 7) return '条件: ノーコンティニュー15分以内で解放';
      return '条件: 直前のライバルに勝利';
    }

    function startVsCpuChain(index, opts = {}){
      const now = nowMs();
      vsCpuState = {
        rivalIndex: index,
        totalRunTime: opts.totalRunTime || 0,
        wins: opts.wins || 0,
        noContinue: opts.noContinue !== false,
        originIndex: typeof opts.originIndex === 'number' ? opts.originIndex : index,
        matchStart: now,
      };
      startMode('VS_CPU', { rivalIndex: index });
    }

    function continueVsCpu(index){
      if (!vsCpuState) {
        startVsCpuChain(index);
        return;
      }
      startVsCpuChain(index, {
        totalRunTime: vsCpuState.totalRunTime,
        wins: vsCpuState.wins,
        noContinue: vsCpuState.noContinue,
        originIndex: vsCpuState.originIndex,
      });
    }

    function goToMainMenu(){
      running = false;
      currentMode = null;
      boards = [];
      vsCpuState = null;
      menu.style.display = 'flex';
      renderMainMenu();
      draw();
    }

    function goToCpuSelect(){
      running = false;
      currentMode = null;
      boards = [];
      vsCpuState = null;
      menu.style.display = 'flex';
      renderCpuSelect();
      draw();
    }

    function createBoardState(name, opts = {}){
      return {
        name,
        grid: createGrid(),
        current: null,
        queue: [makePiece(), makePiece(), makePiece(), makePiece()],
        hold: null,
        holdLocked: false,
        alive: true,
        topOut: false,
        stats: { lines: 0, combos: 0, spark: 0, wins: 0 },
        pendingGarbage: 0,
        attackGauge: 0,
        multiShower: 0,
        inputs: {},
        cpu: opts.cpu || null,
        dropLevel: 0,
        lastAttackAt: 0,
        postSettleTimer: 0,
        pendingSpawn: false,
      };
    }

    function setupMode(mode, opts = {}){
      boards = [];
      if (mode === 'ENDLESS'){
        const player = createBoardState('プレイヤー');
        boards.push(player);
        spawnPiece(player);
      } else if (mode === 'VS_CPU') {
        const rivalIndex = typeof opts.rivalIndex === 'number' ? opts.rivalIndex : (vsCpuState ? vsCpuState.rivalIndex : 0);
        const rivalInfo = CPU_RIVALS[rivalIndex] || CPU_RIVALS[0];
        const player = createBoardState('プレイヤー');
        const rival = createBoardState(rivalInfo.name, { cpu: { rivalIndex, plan: null, info: rivalInfo } });
        boards.push(player, rival);
        spawnPiece(player);
        spawnPiece(rival);
        showInfo(`VS RIVAL: ${rivalInfo.name}`);
        if (!vsCpuState) vsCpuState = { rivalIndex, totalRunTime: 0, wins: 0, noContinue: true, matchStart: nowMs(), originIndex: rivalIndex };
        vsCpuState.rivalIndex = rivalIndex;
        vsCpuState.matchStart = nowMs();
      } else if (mode === 'VS_2P') {
        const p1 = createBoardState('P1');
        const p2 = createBoardState('P2');
        boards.push(p1, p2);
        spawnPiece(p1);
        spawnPiece(p2);
        showInfo('VS 2P スタート!');
      }
    }

    document.addEventListener('keydown', onKeyDown);

    function onKeyDown(e){
      if (!running) return;
      if (!currentMode) return;
      if (currentMode === 'ENDLESS' || currentMode === 'VS_CPU') handlePlayerInput(boards[0], e, true);
      else if (currentMode === 'VS_2P') {
        handlePlayerInput(boards[0], e, true, KEYMAP_P1);
        handlePlayerInput(boards[1], e, true, KEYMAP_P2);
      }
    }

    function handlePlayerInput(boardState, e, pressed, keymap = KEYMAP_P1){
      if (!boardState.alive) return;
      if (!pressed) return;
      if (keymap.left.includes(e.code)) { movePiece(boardState, -1); e.preventDefault(); }
      else if (keymap.right.includes(e.code)) { movePiece(boardState, +1); e.preventDefault(); }
      else if (keymap.soft.includes(e.code)) { softDrop(boardState); e.preventDefault(); }
      else if (keymap.hard.includes(e.code)) { hardDrop(boardState); e.preventDefault(); }
      else if (keymap.rotateCW.includes(e.code)) { if (rotatePiece(boardState, 1)) awardXp(0.05, { type:'rotate', dir:'cw' }); e.preventDefault(); }
      else if (keymap.rotateCCW.includes(e.code)) { if (rotatePiece(boardState, -1)) awardXp(0.05, { type:'rotate', dir:'ccw' }); e.preventDefault(); }
      else if (keymap.hold.includes(e.code)) { holdPiece(boardState); e.preventDefault(); }
    }

    function update(dt){
      if (!running) return;
      infoTimer = Math.max(0, infoTimer - dt);
      if (currentMode === 'VS_CPU') updateVsCpu(dt);
      boards.forEach((board, idx) => {
        if (!board.alive) return;
        if (board.postSettleTimer > 0) {
          board.postSettleTimer -= dt;
          if (board.postSettleTimer <= 0) {
            processPostSettle(board);
          }
          return;
        }
        if (!board.current) {
          if (board.pendingSpawn) {
            spawnPiece(board);
            board.pendingSpawn = false;
          }
          return;
        }
        const level = Math.min(GRAVITY_TABLE[currentMode].length - 1, Math.floor(board.stats.lines / 30));
        board.dropLevel = level;
        const gravity = GRAVITY_TABLE[currentMode][level];
        const piece = board.current;
        piece.fallTimer += dt;
        const lockDelay = 0.6;
        if (!collides(board, piece, piece.x, piece.y + 1, piece.rotation)){
          if (piece.fallTimer >= gravity){
            piece.y += 1;
            piece.fallTimer = 0;
          }
          piece.lockTimer = 0;
        } else {
          piece.lockTimer += dt;
          if (piece.lockTimer >= lockDelay) {
            lockPiece(board);
          }
        }
        if (board.multiShower > 0) {
          dropMultiShower(board);
          board.multiShower -= 1;
        }
      });
      resolveAttacks();
      checkWinConditions();
    }

    function dropMultiShower(board){
      const row = Array.from({ length: COLS }, () => ({ mark: 'multi', color: MULTI_COLOR, multi: true, garbage: false }));
      board.grid.unshift(row);
      board.grid.pop();
    }

    function resolveAttacks(){
      if (boards.length <= 1) return;
      const [a, b] = boards;
      transferAttack(a, b);
      transferAttack(b, a);
    }

    function transferAttack(src, dst){
      if (!src.alive || !dst.alive) return;
      const threshold = 6;
      while (src.attackGauge >= threshold){
        src.attackGauge -= threshold;
        dst.pendingGarbage += 1;
      }
      if (dst.pendingGarbage > 0){
        pushGarbage(dst, dst.pendingGarbage, { fromLineSpark: true });
        dst.pendingGarbage = 0;
      }
    }

    function checkWinConditions(){
      if (currentMode === 'ENDLESS'){
        if (!boards[0].alive) finishGame('Game Over', boards[0]);
      } else {
        const alive = boards.filter(b => b.alive);
        if (alive.length === 1){
          const winner = alive[0];
          winner.stats.wins += 1;
          awardXp(40, { type: 'victory', mode: currentMode, name: winner.name });
          finishGame(`${winner.name} Win!`, winner);
        } else if (alive.length === 0) {
          finishGame('Draw', null);
        }
      }
    }

    function finishGame(message, winner){
      running = false;
      showInfo(message);
      const now = nowMs();
      if (currentMode === 'ENDLESS'){
        const stats = boards[0]?.stats || { lines:0, combos:0, spark:0 };
        showResultOverlay({
          title: message,
          message: `ライン ${stats.lines} / コンボ ${stats.combos} / スパーク ${stats.spark}`,
          buttons: [
            { label: 'もう一度ENDLESS', primary: true, onClick: () => startMode('ENDLESS') },
            { label: 'モード選択に戻る', onClick: () => goToMainMenu() }
          ]
        });
        return;
      }

      if (currentMode === 'VS_CPU'){
        const player = boards[0];
        const cpu = boards[1];
        const playerWin = winner && winner === player;
        const duration = vsCpuState ? ((now - vsCpuState.matchStart) / 1000) : 0;
        if (vsCpuState) {
          vsCpuState.totalRunTime += duration;
          if (!playerWin) vsCpuState.noContinue = false;
          if (playerWin) vsCpuState.wins += 1;
        }
        if (playerWin){
          vsCpuProgress.bestReached = Math.max(vsCpuProgress.bestReached, vsCpuState?.rivalIndex ?? 0);
          if ((vsCpuState?.rivalIndex ?? 0) >= 5) vsCpuProgress.ladyUnlocked = true;
          if ((vsCpuState?.rivalIndex ?? 0) === 6 && vsCpuState && vsCpuState.noContinue && vsCpuState.totalRunTime <= 900){
            vsCpuProgress.hiddenUnlocked = true;
            if (!vsCpuProgress.fastestClear || vsCpuState.totalRunTime < vsCpuProgress.fastestClear){
              vsCpuProgress.fastestClear = vsCpuState.totalRunTime;
            }
          }
        }
        const nextIndex = Math.min(CPU_RIVALS.length - 1, (vsCpuState?.rivalIndex ?? 0) + 1);
        const buttons = [];
        const infoMessage = playerWin
          ? `勝利！タイム ${duration.toFixed(1)}秒 / 総経過 ${(vsCpuState?.totalRunTime ?? 0).toFixed(1)}秒`
          : `敗北… タイム ${duration.toFixed(1)}秒`;
        if (playerWin && nextIndex < CPU_RIVALS.length && !isRivalLocked(nextIndex)){
          buttons.push({ label: `次のライバル (${CPU_RIVALS[nextIndex].name})`, primary: true, onClick: () => continueVsCpu(nextIndex) });
        }
        buttons.push({ label: '同じ相手に再挑戦', onClick: () => continueVsCpu(vsCpuState?.rivalIndex ?? 0) });
        buttons.push({ label: '対戦相手選択に戻る', onClick: () => goToCpuSelect() });
        buttons.push({ label: 'モード選択に戻る', onClick: () => goToMainMenu() });
        showResultOverlay({ title: message, message: infoMessage, buttons });
        return;
      }

      if (currentMode === 'VS_2P'){
        const buttons = [
          { label: 'もう一度対戦', primary: true, onClick: () => startMode('VS_2P') },
          { label: 'モード選択に戻る', onClick: () => goToMainMenu() }
        ];
        showResultOverlay({ title: message, message: 'キーボード同士で再戦できます。', buttons });
      }
    }

    function updateVsCpu(dt){
      const cpu = boards[1];
      if (!cpu || !cpu.alive) return;
      if (!cpu.cpu.plan || cpu.cpu.plan.pieceId !== cpu.current){
        cpu.cpu.plan = planCpuMove(cpu);
      }
      executeCpu(cpu, dt);
    }

    function planCpuMove(boardState){
      const current = boardState.current;
      if (!current) return null;
      const proto = detachPiece(current);
      const aggression = boardState.cpu?.info?.aggression || 0.7;
      const shape = SHAPES[proto.shape];
      let best = null;
      for (let rotIdx = 0; rotIdx < shape.rotations.length; rotIdx++){
        const rot = shape.rotations[rotIdx];
        for (let col = 0; col <= COLS - rot.width; col++){
          const sim = simulatePlacement(boardState.grid, proto, rotIdx, col);
          if (!sim) continue;
          const score = (sim.cleared * 2.2 + sim.combo * 4 + sim.spark * 7) * aggression - sim.height * 0.4;
          if (!best || score > best.score){
            best = {
              column: col,
              rotation: rotIdx,
              score,
              pieceId: boardState.current,
            };
          }
        }
      }
      return best;
    }

    function simulatePlacement(grid, proto, rotationIdx, startX){
      const baseGrid = grid.map(row => row.slice());
      const rot = getRotationDefFor(proto.shape, rotationIdx);
      let y = -rot.height;
      while (!collidesWithGrid(baseGrid, proto, startX, y + 1, rotationIdx)) {
        y += 1;
      }
      const blocks = [];
      let hasVisibleCell = false;
      forEachPieceCell(proto, startX, y, rotationIdx, (gx, gy, block) => {
        if (gy >= 0) hasVisibleCell = true;
        blocks.push({ x: gx, y: gy, cell: { mark: block.mark, color: block.color, multi: !!block.multi } });
      });
      if (!hasVisibleCell) return null;
      const { grid: mergedGrid } = settleNewBlocks(baseGrid, blocks);
      const simGrid = mergedGrid.map(row => row.slice());
      const result = resolveSimGrid(simGrid);
      const height = computeBoardHeight(simGrid);
      return { cleared: result.cleared, combo: result.combo, spark: result.spark, height };
    }

    function collidesWithGrid(grid, proto, px, py, rotationIdx){
      const rot = getRotationDefFor(proto.shape, rotationIdx);
      for (const cell of rot.cells){
        const gx = px + cell.x;
        const gy = py + cell.y;
        if (gx < 0 || gx >= COLS) return true;
        if (gy >= ROWS) return true;
        if (gy >= 0 && grid[gy][gx]) return true;
      }
      return false;
    }

    function resolveSimGrid(simGrid){
      let combo = 0;
      let cleared = 0;
      let spark = 0;
      while (true){
        const { toClear, sparks } = findMatches(simGrid);
        if (!toClear.size) break;
        combo += 1;
        const c = applyClear(simGrid, toClear);
        cleared += c;
        if (sparks.length) spark += sparks.length;
        applyGravity(simGrid);
      }
      return { combo, cleared, spark };
    }

    function computeBoardHeight(grid){
      for (let y = 0; y < ROWS; y++){
        for (let x = 0; x < COLS; x++){
          if (grid[y][x]) return ROWS - y;
        }
      }
      return 0;
    }

    function executeCpu(boardState, dt){
      const plan = boardState.cpu.plan;
      if (!plan || !boardState.current) return;
      if (plan.pieceId !== boardState.current) {
        boardState.cpu.plan = null;
        return;
      }
      const piece = boardState.current;
      const shape = SHAPES[piece.shape];
      const rotationTarget = makeRotationIndex(piece.shape, plan.rotation);
      if (piece.rotation !== rotationTarget) {
        const diff = (rotationTarget - piece.rotation + shape.rotations.length) % shape.rotations.length;
        if (diff === 1 || (shape.rotations.length > 2 && diff === 3)) rotatePiece(boardState, diff === 3 ? -1 : 1);
        else rotatePiece(boardState, diff > 1 ? -1 : 1);
        return;
      }
      if (piece.x < plan.column) {
        movePiece(boardState, 1);
        return;
      }
      if (piece.x > plan.column) {
        movePiece(boardState, -1);
        return;
      }
      hardDrop(boardState);
      boardState.cpu.plan = null;
    }

    function loop(timestamp){
      const now = timestamp * 0.001;
      const dt = lastTs ? Math.min(0.033, now - lastTs) : 0;
      lastTs = now;
      update(dt);
      draw();
      if (running) rafHandle = requestAnimationFrame(loop);
    }

    function draw(){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle = '#020617';
      ctx.fillRect(0,0,canvas.width,canvas.height);
      const boardCount = boards.length || 1;
      const margin = 32;
      const infoHeight = 60;
      const availableW = canvas.width - margin * 2;
      const boardSpacing = 40;
      const widthBased = Math.floor((availableW - boardSpacing * (boardCount - 1)) / (COLS * boardCount));
      const heightRoom = canvas.height - (margin + infoHeight) - 120;
      const heightBased = Math.floor(heightRoom / VISIBLE_ROWS);
      const cellSize = Math.max(20, Math.min(48, widthBased, heightBased));
      const boardWidth = cellSize * COLS;
      const boardHeight = cellSize * VISIBLE_ROWS;
      const top = margin + infoHeight;
      boards.forEach((board, idx) => {
        const left = margin + idx * (boardWidth + boardSpacing);
        drawBoard(board, left, top, boardWidth, boardHeight, cellSize, idx, boardCount);
      });
      drawHud();
      if (infoTimer > 0 && infoMessage){
        ctx.fillStyle = `rgba(248,250,252,${Math.min(1, infoTimer)})`;
        ctx.font = '22px "M PLUS Rounded 1c", system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(infoMessage, canvas.width/2, margin + 28);
        ctx.textAlign = 'start';
      }
    }

    function drawBoard(board, left, top, width, height, cellSize, boardIndex, totalBoards){
      ctx.save();
      ctx.translate(left, top);
      drawRoundRectPath(ctx, 0, 0, width, height, 10);
      ctx.clip();
      ctx.fillStyle = '#0b1120';
      ctx.fillRect(0,0,width,height);
      // grid
      for (let y = 0; y < VISIBLE_ROWS; y++){
        for (let x = 0; x < COLS; x++){
          const gy = y + HIDDEN_ROWS;
          const cell = board.grid[gy][x];
          const px = x * cellSize;
          const py = y * cellSize;
          ctx.strokeStyle = 'rgba(148,163,184,0.15)';
          ctx.strokeRect(px + 0.5, py + 0.5, cellSize - 1, cellSize - 1);
          if (cell) {
            ctx.fillStyle = cell.multi ? MULTI_COLOR : (cell.garbage ? GARBAGE_COLOR : cell.color || '#94a3b8');
            ctx.fillRect(px + 2, py + 2, cellSize - 4, cellSize - 4);
          }
        }
      }
      // active piece
      if (board.current && board.alive) {
        forEachPieceCell(board.current, board.current.x, board.current.y, board.current.rotation, (gx, gy, cell) => {
          if (gy < HIDDEN_ROWS || gy >= ROWS) return;
          const displayY = gy - HIDDEN_ROWS;
          if (displayY < 0 || displayY >= VISIBLE_ROWS) return;
          const px = gx * cellSize;
          const py = displayY * cellSize;
          const color = cell && (cell.multi ? MULTI_COLOR : (cell.color || '#94a3b8'));
          ctx.fillStyle = color || '#94a3b8';
          ctx.fillRect(px + 2, py + 2, cellSize - 4, cellSize - 4);
          ctx.strokeStyle = 'rgba(15,23,42,0.6)';
          ctx.strokeRect(px + 2, py + 2, cellSize - 4, cellSize - 4);
        });
      }
      ctx.restore();
      ctx.save();
      ctx.translate(left, top);
      ctx.strokeStyle = 'rgba(148,163,184,0.35)';
      ctx.lineWidth = 1.2;
      drawRoundRectPath(ctx, 0, 0, width, height, 10);
      ctx.stroke();
      ctx.restore();
      // side panels
      if (totalBoards === 1) {
        drawPanels(board, left + width + 10, top, cellSize);
      } else {
        drawMiniStats(board, left, top + height + 10, width);
      }
      // name tag
      ctx.fillStyle = board.alive ? '#e2e8f0' : 'rgba(226,232,240,0.4)';
      ctx.font = '16px "M PLUS Rounded 1c", system-ui';
      ctx.fillText(board.name, left, top - 8);
    }

    function drawPanels(board, x, y, cellSize){
      const queueBoxH = 120;
      const holdBoxH = 80;
      drawPanelBox(x, y, 120, queueBoxH, 'NEXT');
      board.queue.slice(0,3).forEach((piece, idx) => {
        drawPiecePreview(piece, x + 60, y + 26 + idx * 36, cellSize * 0.5);
      });
      drawPanelBox(x, y + queueBoxH + 12, 120, holdBoxH, 'HOLD');
      if (board.hold) drawPiecePreview(board.hold, x + 60, y + queueBoxH + 12 + 44, cellSize * 0.6);
      drawPanelBox(x, y + queueBoxH + holdBoxH + 24, 120, 120, 'STATS');
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px system-ui';
      const statY = y + queueBoxH + holdBoxH + 48;
      ctx.fillText(`Lines: ${board.stats.lines}`, x + 12, statY);
      ctx.fillText(`Combo: ${board.stats.combos}`, x + 12, statY + 16);
      ctx.fillText(`Spark: ${board.stats.spark}`, x + 12, statY + 32);
      if (currentMode !== 'ENDLESS') ctx.fillText(`Attack: ${Math.floor(board.attackGauge)}`, x + 12, statY + 48);
    }

    function drawPanelBox(x,y,w,h,title){
      ctx.save();
      drawRoundRectPath(ctx, x, y, w, h, 10);
      ctx.clip();
      ctx.fillStyle = 'rgba(15,23,42,0.85)';
      ctx.fillRect(x, y, w, h);
      ctx.restore();
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '11px system-ui';
      ctx.fillText(title, x + 10, y + 16);
    }

    function drawMiniStats(board, x, y, width){
      ctx.save();
      drawRoundRectPath(ctx, x, y, width, 48, 10);
      ctx.clip();
      ctx.fillStyle = 'rgba(15,23,42,0.85)';
      ctx.fillRect(x, y, width, 48);
      ctx.restore();
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '12px system-ui';
      ctx.fillText(`Lines ${board.stats.lines}`, x + 12, y + 20);
      ctx.fillText(`Combo ${board.stats.combos} / Spark ${board.stats.spark}`, x + 12, y + 36);
    }

    function drawPiecePreview(pieceProto, cx, cy, size){
      if (!pieceProto) return;
      const shapeKey = pieceProto.shape || 'I';
      const rotation = makeRotationIndex(shapeKey, pieceProto.rotation || 0);
      const rot = getRotationDefFor(shapeKey, rotation);
      const blocks = pieceProto.blocks || [];
      const blockSize = Math.max(8, size - 4);
      const offsetX = cx - (rot.width * size) / 2;
      const offsetY = cy - (rot.height * size) / 2;
      rot.cells.forEach((pos, idx) => {
        const block = blocks[idx] || blocks[blocks.length - 1] || { color: '#94a3b8' };
        const px = offsetX + pos.x * size + (size - blockSize) / 2;
        const py = offsetY + pos.y * size + (size - blockSize) / 2;
        ctx.fillStyle = block.multi ? MULTI_COLOR : (block.color || '#94a3b8');
        ctx.save();
        drawRoundRectPath(ctx, px, py, blockSize, blockSize, 6);
        ctx.fill();
        drawRoundRectPath(ctx, px, py, blockSize, blockSize, 6);
        ctx.strokeStyle = 'rgba(8,15,30,0.45)';
        ctx.stroke();
        ctx.restore();
      });
    }

    function drawHud(){
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '18px "M PLUS Rounded 1c", system-ui';
      ctx.fillText(modeLabel(currentMode), 30, 36);
    }

    function modeLabel(mode){
      if (!mode) return '';
      if (mode === 'ENDLESS') return 'ENDLESS モード';
      if (mode === 'VS_CPU') return 'VS.RIVAL モード';
      if (mode === 'VS_2P') return 'VS.2P モード';
      return mode;
    }

    function drawRoundRectPath(ctx, x, y, w, h, r){
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }

    function destroy(){
      cancelAnimationFrame(rafHandle);
      document.removeEventListener('keydown', onKeyDown);
      try { wrapper.remove(); } catch {}
    }

    draw();

    return { start(){}, stop(){ running = false; }, destroy };
  }

  window.registerMiniGame({
    id: 'triomino_columns',
    name: 'トリオミノコラムス',
    description: 'トリオトスDX風の5列落ち物パズル。ラインスパーク＆マルチブロック搭載。',
    create
  });
})();

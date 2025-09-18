(function(){
  /** MiniExp MOD: 1010-style block puzzle (v0.1.0) */
  const BOARD_SIZE = 10;
  const XP_TABLE = { 1:2, 2:10, 3:25, 4:50, 5:150 };
  const PALETTE = ['#38bdf8','#f97316','#34d399','#facc15','#f87171','#a78bfa','#fb7185','#94a3b8'];
  const DIFF_WEIGHTS = {
    EASY:   { 1:6.5, 2:2.0, 3:0.45, irregular:0.55 },
    NORMAL: { 1:3.6, 2:3.0, 3:1.2, irregular:1.0 },
    HARD:   { 1:1.6, 2:2.9, 3:2.9, irregular:1.8 }
  };

  function makeShape(id, matrix, complexity, irregular){
    const h = matrix.length;
    const w = matrix[0].length;
    const cells = [];
    for (let y = 0; y < h; y++){
      for (let x = 0; x < w; x++){
        if (matrix[y][x]) cells.push({ x, y });
      }
    }
    return { id, matrix, cells, width: w, height: h, size: cells.length, complexity, irregular: !!irregular };
  }

  const SHAPES = [
    makeShape('single', [[1]], 1, false),
    makeShape('domino-h', [[1,1]], 1, false),
    makeShape('domino-v', [[1],[1]], 1, false),
    makeShape('line3-h', [[1,1,1]], 1, false),
    makeShape('line3-v', [[1],[1],[1]], 1, false),
    makeShape('line4-h', [[1,1,1,1]], 1, false),
    makeShape('line4-v', [[1],[1],[1],[1]], 1, false),
    makeShape('line5-h', [[1,1,1,1,1]], 1, false),
    makeShape('line5-v', [[1],[1],[1],[1],[1]], 1, false),
    makeShape('square2', [[1,1],[1,1]], 1, false),
    makeShape('rect3x2', [[1,1,1],[1,1,1]], 2, false),
    makeShape('rect2x3', [[1,1],[1,1],[1,1]], 2, false),
    makeShape('square3', [[1,1,1],[1,1,1],[1,1,1]], 2, false),
    makeShape('L-small-a', [[1,0],[1,0],[1,1]], 2, true),
    makeShape('L-small-b', [[0,1],[0,1],[1,1]], 2, true),
    makeShape('L-flat-a', [[1,1,1],[1,0,0],[1,0,0]], 3, true),
    makeShape('L-flat-b', [[1,1,1],[0,0,1],[0,0,1]], 3, true),
    makeShape('L-wide-a', [[1,0,0],[1,1,1]], 2, true),
    makeShape('L-wide-b', [[0,0,1],[1,1,1]], 2, true),
    makeShape('T-small-a', [[1,1,1],[0,1,0]], 2, true),
    makeShape('T-small-b', [[0,1,0],[1,1,1]], 2, true),
    makeShape('zig-a', [[0,1,1],[1,1,0]], 3, true),
    makeShape('zig-b', [[1,1,0],[0,1,1]], 3, true),
    makeShape('plus', [[0,1,0],[1,1,1],[0,1,0]], 3, true),
    makeShape('u-arch', [[1,0,1],[1,1,1]], 3, true),
    makeShape('step-a', [[1,1,0],[0,1,1]], 2, true),
    makeShape('step-b', [[0,1,1],[1,1,0]], 2, true),
    makeShape('hook', [[1,1],[0,1],[0,1]], 2, true),
    makeShape('bar3x3-left', [[1,1,1],[1,0,0],[1,0,0]], 3, true),
    makeShape('bar3x3-right', [[1,1,1],[0,0,1],[0,0,1]], 3, true)
  ];

  function xpForLines(n){
    if (n <= 0) return 0;
    if (n >= 5) return XP_TABLE[5];
    return XP_TABLE[n] || 0;
  }

  function pickShape(difficultyKey){
    const weights = DIFF_WEIGHTS[difficultyKey] || DIFF_WEIGHTS.NORMAL;
    let total = 0;
    const acc = [];
    for (const shape of SHAPES){
      let w = weights[shape.complexity] || 1;
      const sizeFactor = 1 / Math.max(0.65, 0.35 + shape.size * 0.18);
      w *= sizeFactor;
      if (shape.size <= 3) w *= 1.2;
      if (shape.size >= 7) w *= 0.7;
      if (shape.irregular) w *= weights.irregular || 1;
      total += w;
      acc.push(total);
    }
    const r = Math.random() * total;
    for (let i = 0; i < acc.length; i++){
      if (r <= acc[i]) return SHAPES[i];
    }
    return SHAPES[SHAPES.length - 1];
  }

  function create(root, awardXp, opts){
    const difficulty = (opts && opts.difficulty) || 'NORMAL';
    const difficultyKey = DIFF_WEIGHTS[difficulty] ? difficulty : 'NORMAL';
    const baseWidth = Math.max(400, Math.min(640, root.clientWidth || 520));
    const cellPx = Math.floor(Math.max(28, Math.min(52, baseWidth / (BOARD_SIZE + 2))));
    const boardPx = cellPx * BOARD_SIZE;

    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.width = `${boardPx}px`;
    container.style.margin = '0 auto';
    container.style.userSelect = 'none';

    const hud = document.createElement('div');
    hud.style.display = 'flex';
    hud.style.justifyContent = 'space-between';
    hud.style.alignItems = 'center';
    hud.style.padding = '6px 4px 10px';
    hud.style.font = '600 12px system-ui, sans-serif';
    hud.style.color = '#e2e8f0';

    const lineInfo = document.createElement('div');
    const moveInfo = document.createElement('div');
    hud.appendChild(lineInfo);
    hud.appendChild(moveInfo);

    const boardCanvas = document.createElement('canvas');
    boardCanvas.width = boardPx;
    boardCanvas.height = boardPx;
    boardCanvas.style.display = 'block';
    boardCanvas.style.margin = '0 auto';
    boardCanvas.style.borderRadius = '10px';
    boardCanvas.style.background = '#0f172a';
    boardCanvas.style.touchAction = 'none';
    const boardCtx = boardCanvas.getContext('2d');

    const shelf = document.createElement('div');
    shelf.style.display = 'flex';
    shelf.style.justifyContent = 'space-between';
    shelf.style.alignItems = 'center';
    shelf.style.marginTop = '12px';
    shelf.style.gap = '6px';

    const hint = document.createElement('div');
    hint.textContent = 'ブロックをドラッグして盤面に配置 / Rでリスタート';
    hint.style.font = '11px system-ui, sans-serif';
    hint.style.color = 'rgba(226,232,240,0.75)';
    hint.style.marginTop = '8px';
    hint.style.textAlign = 'center';

    container.appendChild(hud);
    container.appendChild(boardCanvas);
    container.appendChild(shelf);
    container.appendChild(hint);
    root.appendChild(container);

    let board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
    let currentPieces = [];
    let dragging = null;
    let hover = null;
    let dragCanvas = null;
    let totalLines = 0;
    let moves = 0;
    let ended = false;
    let endText = '';
    let flashRows = [];
    let flashCols = [];
    let flashTimer = 0;

    function drawBoard(){
      boardCtx.clearRect(0, 0, boardPx, boardPx);
      boardCtx.fillStyle = '#0f172a';
      boardCtx.fillRect(0, 0, boardPx, boardPx);
      boardCtx.strokeStyle = 'rgba(148,163,184,0.18)';
      boardCtx.lineWidth = 1;
      for (let y = 0; y <= BOARD_SIZE; y++){
        const yy = y * cellPx + 0.5;
        boardCtx.beginPath();
        boardCtx.moveTo(0, yy);
        boardCtx.lineTo(boardPx, yy);
        boardCtx.stroke();
      }
      for (let x = 0; x <= BOARD_SIZE; x++){
        const xx = x * cellPx + 0.5;
        boardCtx.beginPath();
        boardCtx.moveTo(xx, 0);
        boardCtx.lineTo(xx, boardPx);
        boardCtx.stroke();
      }

      for (let y = 0; y < BOARD_SIZE; y++){
        for (let x = 0; x < BOARD_SIZE; x++){
          const cell = board[y][x];
          if (cell){
            boardCtx.fillStyle = cell.color;
            boardCtx.fillRect(x * cellPx + 2, y * cellPx + 2, cellPx - 4, cellPx - 4);
          }
        }
      }

      if (hover && hover.piece){
        const ok = hover.valid;
        boardCtx.save();
        boardCtx.globalAlpha = ok ? 0.55 : 0.35;
        boardCtx.fillStyle = ok ? hover.piece.color : '#f87171';
        for (const cell of hover.piece.shape.cells){
          const gx = (hover.x + cell.x);
          const gy = (hover.y + cell.y);
          if (gx < 0 || gy < 0 || gx >= BOARD_SIZE || gy >= BOARD_SIZE) continue;
          boardCtx.fillRect(gx * cellPx + 4, gy * cellPx + 4, cellPx - 8, cellPx - 8);
        }
        boardCtx.restore();
      }

      if (flashTimer > 0){
        const alpha = Math.max(0, Math.min(1, flashTimer / 200));
        boardCtx.save();
        boardCtx.globalAlpha = alpha;
        boardCtx.fillStyle = 'rgba(190,242,100,0.65)';
        for (const ry of flashRows){
          boardCtx.fillRect(0, ry * cellPx, boardPx, cellPx);
        }
        for (const cx of flashCols){
          boardCtx.fillRect(cx * cellPx, 0, cellPx, boardPx);
        }
        boardCtx.restore();
      }

      if (ended){
        boardCtx.fillStyle = 'rgba(15,23,42,0.78)';
        boardCtx.fillRect(0, 0, boardPx, boardPx);
        boardCtx.fillStyle = '#f8fafc';
        boardCtx.textAlign = 'center';
        boardCtx.font = 'bold 20px system-ui, sans-serif';
        boardCtx.fillText('Game Over', boardPx / 2, boardPx / 2 - 6);
        boardCtx.font = '12px system-ui, sans-serif';
        boardCtx.fillText(endText || '置ける場所がありません', boardPx / 2, boardPx / 2 + 14);
        boardCtx.fillText('Rで再開/再起動', boardPx / 2, boardPx / 2 + 32);
      }
    }

    function xpPopup(xp, level){
      if (!xp) return;
      try{
        if (!window.showTransientPopupAt) return;
        const containerEl = document.getElementById('miniexp-container');
        if (!containerEl) return;
        const boardRect = boardCanvas.getBoundingClientRect();
        const parentRect = containerEl.getBoundingClientRect();
        const px = (boardRect.left - parentRect.left) + boardPx / 2;
        const py = (boardRect.top - parentRect.top) + boardPx / 2;
        window.showTransientPopupAt(px, py, `+${xp}`, { variant: 'combo', level: Math.max(1, level || 1) });
      } catch {}
    }

    function xpAward(rows, cols){
      const major = Math.max(rows, cols);
      let xp = 0;
      if (rows && cols){
        xp = xpForLines(major) * 2;
      } else {
        xp = xpForLines(major);
      }
      if (xp > 0) awardXp(xp, { type: 'lineclear', rows, cols, difficulty });
      const level = rows + cols ? rows + cols : major;
      xpPopup(xp, level);
    }

    function setFlash(rows, cols){
      flashRows = rows.slice();
      flashCols = cols.slice();
      flashTimer = 220;
      setTimeout(() => {
        flashTimer = 0;
        drawBoard();
      }, 180);
    }

    function fits(x, y, shape){
      for (const cell of shape.cells){
        const gx = x + cell.x;
        const gy = y + cell.y;
        if (gx < 0 || gy < 0 || gx >= BOARD_SIZE || gy >= BOARD_SIZE) return false;
        if (board[gy][gx]) return false;
      }
      return true;
    }

    function placePiece(x, y, piece){
      for (const cell of piece.shape.cells){
        const gx = x + cell.x;
        const gy = y + cell.y;
        board[gy][gx] = { color: piece.color };
      }
    }

    function clearLines(){
      const filledRows = [];
      const filledCols = [];
      for (let y = 0; y < BOARD_SIZE; y++){
        if (board[y].every(Boolean)) filledRows.push(y);
      }
      for (let x = 0; x < BOARD_SIZE; x++){
        let full = true;
        for (let y = 0; y < BOARD_SIZE; y++){
          if (!board[y][x]){ full = false; break; }
        }
        if (full) filledCols.push(x);
      }
      if (!filledRows.length && !filledCols.length) return false;
      for (const y of filledRows){
        board[y] = Array(BOARD_SIZE).fill(null);
      }
      if (filledCols.length){
        for (let y = 0; y < BOARD_SIZE; y++){
          for (const x of filledCols){
            board[y][x] = null;
          }
        }
      }
      totalLines += filledRows.length + filledCols.length;
      xpAward(filledRows.length, filledCols.length);
      setFlash(filledRows, filledCols);
      return true;
    }

    function updateHud(){
      lineInfo.textContent = `ライン: ${totalLines}`;
      moveInfo.textContent = `手番: ${moves} / 残ブロック: ${currentPieces.length}`;
    }

    function hasPlacement(piece){
      for (let y = 0; y <= BOARD_SIZE - piece.shape.height; y++){
        for (let x = 0; x <= BOARD_SIZE - piece.shape.width; x++){
          if (fits(x, y, piece.shape)) return true;
        }
      }
      return false;
    }

    function anyMoveAvailable(){
      return currentPieces.some(p => hasPlacement(p));
    }

    function endGame(reason){
      ended = true;
      endText = reason || '置ける場所がありません';
      updateHud();
      drawBoard();
    }

    function createPiece(){
      const shape = pickShape(difficultyKey);
      const color = PALETTE[(Math.random() * PALETTE.length) | 0];
      return { id: `${shape.id}-${Math.random().toString(16).slice(2,6)}`, shape, color };
    }

    function generateSet(initial){
      const attempts = 8;
      for (let i = 0; i < attempts; i++){
        currentPieces = [createPiece(), createPiece(), createPiece()];
        if (anyMoveAvailable()) break;
      }
      if (!anyMoveAvailable()){
        if (initial){
          board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
        }
        endGame('置けるピースが生成できませんでした');
      }
      renderShelf();
      updateHud();
    }

    function renderShelf(){
      shelf.textContent = '';
      if (!currentPieces.length){
        const placeholder = document.createElement('div');
        placeholder.textContent = 'ピース補充中...';
        placeholder.style.flex = '1';
        placeholder.style.textAlign = 'center';
        placeholder.style.color = 'rgba(148,163,184,0.8)';
        placeholder.style.font = '12px system-ui, sans-serif';
        shelf.appendChild(placeholder);
        return;
      }
      for (const piece of currentPieces){
        const pad = Math.max(4, Math.floor(cellPx * 0.18));
        const width = piece.shape.width * cellPx + pad * 2;
        const height = piece.shape.height * cellPx + pad * 2;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.style.background = '#0b1626';
        canvas.style.borderRadius = '8px';
        canvas.style.flex = '1';
        canvas.style.maxWidth = `${Math.max(width, cellPx * 3)}px`;
        canvas.style.touchAction = 'none';
        canvas.style.cursor = 'grab';
        canvas.style.boxShadow = 'inset 0 0 0 1px rgba(148,163,184,0.18)';
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = piece.color;
        for (const cell of piece.shape.cells){
          ctx.fillRect(pad + cell.x * cellPx + 2, pad + cell.y * cellPx + 2, cellPx - 4, cellPx - 4);
        }
        canvas.addEventListener('pointerdown', (ev) => startDrag(ev, piece, canvas, pad));
        shelf.appendChild(canvas);
        piece.element = canvas;
        piece.pad = pad;
      }
    }

    function resetHover(){
      hover = null;
    }

    function startDrag(ev, piece, sourceCanvas, pad){
      if (ended || !piece) return;
      ev.preventDefault();
      if (dragging) return;
      const rect = sourceCanvas.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const offsetX = ev.clientX - rect.left;
      const offsetY = ev.clientY - rect.top;
      const anchorOffsetX = offsetX - pad;
      const anchorOffsetY = offsetY - pad;
      dragCanvas = document.createElement('canvas');
      dragCanvas.width = sourceCanvas.width;
      dragCanvas.height = sourceCanvas.height;
      dragCanvas.style.position = 'absolute';
      dragCanvas.style.pointerEvents = 'none';
      dragCanvas.style.zIndex = '15';
      const dc = dragCanvas.getContext('2d');
      dc.drawImage(sourceCanvas, 0, 0);
      dragCanvas.style.left = `${rect.left - containerRect.left}px`;
      dragCanvas.style.top = `${rect.top - containerRect.top}px`;
      container.appendChild(dragCanvas);
      sourceCanvas.style.opacity = '0.25';
      dragging = {
        piece,
        source: sourceCanvas,
        pad,
        offsetX,
        offsetY,
        anchorOffsetX,
        anchorOffsetY,
        pointerId: ev.pointerId
      };
      sourceCanvas.setPointerCapture(ev.pointerId);
      window.addEventListener('pointermove', onDragMove, { passive: false });
      window.addEventListener('pointerup', onDragEnd, { passive: false });
      window.addEventListener('pointercancel', onDragEnd, { passive: false });
      updateDragPosition(ev);
    }

    function updateDragPosition(ev){
      if (!dragging || !dragCanvas) return;
      const containerRect = container.getBoundingClientRect();
      dragCanvas.style.left = `${ev.clientX - containerRect.left - dragging.offsetX}px`;
      dragCanvas.style.top = `${ev.clientY - containerRect.top - dragging.offsetY}px`;
      const boardRect = boardCanvas.getBoundingClientRect();
      const withinX = ev.clientX >= boardRect.left - cellPx && ev.clientX <= boardRect.right + cellPx;
      const withinY = ev.clientY >= boardRect.top - cellPx && ev.clientY <= boardRect.bottom + cellPx;
      if (!withinX || !withinY){
        resetHover();
        drawBoard();
        return;
      }
      const gridX = Math.round((ev.clientX - boardRect.left - dragging.anchorOffsetX) / cellPx);
      const gridY = Math.round((ev.clientY - boardRect.top - dragging.anchorOffsetY) / cellPx);
      const piece = dragging.piece;
      const valid = fits(gridX, gridY, piece.shape);
      hover = { piece, x: gridX, y: gridY, valid };
      drawBoard();
    }

    function onDragMove(ev){
      if (!dragging) return;
      ev.preventDefault();
      updateDragPosition(ev);
    }

    function removePieceFromShelf(piece){
      const idx = currentPieces.indexOf(piece);
      if (idx !== -1) currentPieces.splice(idx, 1);
      renderShelf();
    }

    function onDragEnd(ev){
      if (!dragging) return;
      if (ev && ev.preventDefault) ev.preventDefault();
      const { piece, source, pointerId } = dragging;
      try { if (source && source.hasPointerCapture(pointerId)) source.releasePointerCapture(pointerId); } catch {}
      source.style.opacity = '';
      if (dragCanvas && dragCanvas.parentNode) dragCanvas.parentNode.removeChild(dragCanvas);
      dragCanvas = null;
      const dropHover = hover && hover.piece === piece ? hover : null;
      dragging = null;
      resetHover();
      window.removeEventListener('pointermove', onDragMove);
      window.removeEventListener('pointerup', onDragEnd);
      window.removeEventListener('pointercancel', onDragEnd);
      if (ended){ drawBoard(); return; }
      if (dropHover && dropHover.valid){
        placePiece(dropHover.x, dropHover.y, piece);
        moves += 1;
        removePieceFromShelf(piece);
        clearLines();
        if (!currentPieces.length && !ended){
          generateSet(false);
        }
        if (!ended && !anyMoveAvailable()){
          endGame('置ける場所がありません');
        }
      }
      drawBoard();
      updateHud();
    }

    function reset(){
      board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
      totalLines = 0;
      moves = 0;
      ended = false;
      endText = '';
      flashRows = [];
      flashCols = [];
      flashTimer = 0;
      currentPieces = [];
      renderShelf();
      generateSet(true);
      drawBoard();
      updateHud();
    }

    function onKey(ev){
      if (ev.key === 'r' || ev.key === 'R'){
        ev.preventDefault();
        reset();
      }
    }

    document.addEventListener('keydown', onKey, { passive: false });

    updateHud();
    reset();

    function start(){ drawBoard(); }
    function stop(){
      if (dragging){
        onDragEnd({ pointerId: dragging.pointerId || 0, preventDefault(){} });
      }
    }
    function destroy(){
      try { document.removeEventListener('keydown', onKey); } catch {}
      window.removeEventListener('pointermove', onDragMove);
      window.removeEventListener('pointerup', onDragEnd);
      window.removeEventListener('pointercancel', onDragEnd);
      try { if (dragCanvas && dragCanvas.parentNode) dragCanvas.parentNode.removeChild(dragCanvas); } catch {}
      dragCanvas = null;
      dragging = null;
      resetHover();
      try { root.removeChild(container); } catch {}
    }
    function getScore(){ return totalLines; }

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({ id:'ten_ten', name:'1010パズル', description:'ライン消去でEXP / クロス消しは倍増', create });
})();

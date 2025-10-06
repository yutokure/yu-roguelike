(function(){
  function create(root, awardXp, opts){
    const diff = (opts && opts.difficulty) || 'NORMAL';
    const diffCfg = {
      EASY:   { cols: 12, rows: 6, types: 12, shufflePenalty: 1 },
      NORMAL: { cols: 14, rows: 6, types: 16, shufflePenalty: 2 },
      HARD:   { cols: 16, rows: 8, types: 20, shufflePenalty: 3 }
    };
    const cfg = diffCfg[diff] || diffCfg.NORMAL;
    const COLS = cfg.cols;
    const ROWS = cfg.rows;
    const OUTER_COLS = COLS + 2;
    const OUTER_ROWS = ROWS + 2;

    const canvas = document.createElement('canvas');
    const W = 720;
    const H = 520;
    canvas.width = W;
    canvas.height = H;
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    canvas.style.background = '#0b1220';
    canvas.style.borderRadius = '12px';
    canvas.style.boxShadow = '0 0 12px rgba(15,23,42,0.65)';
    root.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const TILE_PAD = 10;
    const tileW = Math.min(Math.floor((W - TILE_PAD * 2) / COLS), 64);
    const tileH = Math.min(Math.floor((H - TILE_PAD * 2) / ROWS), 80);
    const gridOffsetX = Math.floor((W - tileW * COLS) / 2);
    const gridOffsetY = Math.floor((H - tileH * ROWS) / 2) + 20;

    const DIRS = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1]
    ];

    const faces = [
      '🀇','🀈','🀉','🀊','🀋','🀌','🀍','🀎','🀏','🀙','🀚','🀛','🀜','🀝','🀞','🀟',
      '🀠','🀡','🀐','🀑','🀒','🀓','🀔','🀕','🀖','🀗','🀘','🀀','🀁','🀂','🀃','🀄'
    ];
    const palette = faces.map((_, idx) => `hsl(${(idx * 43) % 360} 62% 60%)`);

    const board = Array.from({ length: OUTER_ROWS }, () => Array(OUTER_COLS).fill(0));

    function initBoard(){
      const pairCount = (COLS * ROWS) / 2;
      const bag = [];
      for(let i=0;i<pairCount;i++){
        bag.push(1 + (i % cfg.types));
        bag.push(1 + (i % cfg.types));
      }
      for(let y=1;y<=ROWS;y++){
        for(let x=1;x<=COLS;x++){
          const idx = (Math.random() * bag.length) | 0;
          board[y][x] = bag.splice(idx, 1)[0];
        }
      }
    }

    initBoard();

    let running = false;
    let selected = null; // {x,y}
    let lastPath = null; // [[x,y], ...]
    let messageTimer = 0;
    let messageText = '';
    let chain = 0;
    let lastMatchAt = 0;
    let clearedPairs = 0;
    let shuffles = 0;
    let hovering = null;

    function toCanvas(x, y){
      return [gridOffsetX + (x - 1) * tileW, gridOffsetY + (y - 1) * tileH];
    }

    function inGrid(px, py){
      const gx = Math.floor((px - gridOffsetX) / tileW) + 1;
      const gy = Math.floor((py - gridOffsetY) / tileH) + 1;
      if (gx < 1 || gx > COLS || gy < 1 || gy > ROWS) return null;
      return { x: gx, y: gy };
    }

    function showMessage(txt){
      messageText = txt;
      messageTimer = 120;
    }

    function isCleared(){
      for(let y=1;y<=ROWS;y++){
        for(let x=1;x<=COLS;x++){
          if(board[y][x] !== 0) return false;
        }
      }
      return true;
    }

    function reconstructPath(endState, prev){
      const pts = [];
      let cur = endState;
      while(cur){
        pts.push([cur.x, cur.y]);
        cur = prev[cur.y][cur.x][cur.dir];
      }
      pts.reverse();
      return pts;
    }

    function canConnect(ax, ay, bx, by){
      if(ax === bx && ay === by) return null;
      const visited = Array.from({ length: OUTER_ROWS }, () => Array.from({ length: OUTER_COLS }, () => Array(4).fill(3)));
      const prev = Array.from({ length: OUTER_ROWS }, () => Array.from({ length: OUTER_COLS }, () => Array(4).fill(null)));
      const queue = [];
      for(let dir=0; dir<4; dir++){
        visited[ay][ax][dir] = 0;
        queue.push({ x: ax, y: ay, dir, turns: 0 });
        prev[ay][ax][dir] = null;
      }
      while(queue.length){
        const cur = queue.shift();
        const dx = DIRS[cur.dir][0];
        const dy = DIRS[cur.dir][1];
        const nx = cur.x + dx;
        const ny = cur.y + dy;
        if(nx < 0 || nx >= OUTER_COLS || ny < 0 || ny >= OUTER_ROWS) continue;
        if(!(nx === bx && ny === by) && board[ny][nx] !== 0) continue;
        const turns = cur.turns;
        if(nx === bx && ny === by){
          prev[ny][nx][cur.dir] = { x: cur.x, y: cur.y, dir: cur.dir, turns };
          return reconstructPath({ x: nx, y: ny, dir: cur.dir }, prev);
        }
        if(turns < visited[ny][nx][cur.dir]){
          visited[ny][nx][cur.dir] = turns;
          prev[ny][nx][cur.dir] = { x: cur.x, y: cur.y, dir: cur.dir, turns };
          queue.push({ x: nx, y: ny, dir: cur.dir, turns });
        }
        for(let nd = 0; nd < 4; nd++){
          if(nd === cur.dir) continue;
          const nturns = turns + 1;
          if(nturns > 2) continue;
          if(visited[cur.y][cur.x][nd] <= nturns) continue;
          visited[cur.y][cur.x][nd] = nturns;
          prev[cur.y][cur.x][nd] = { x: cur.x, y: cur.y, dir: cur.dir, turns };
          queue.push({ x: cur.x, y: cur.y, dir: nd, turns: nturns });
        }
      }
      return null;
    }

    function shuffleRemaining(){
      const tiles = [];
      for(let y=1;y<=ROWS;y++) for(let x=1;x<=COLS;x++) if(board[y][x] !== 0) tiles.push(board[y][x]);
      for(let y=1;y<=ROWS;y++) for(let x=1;x<=COLS;x++) if(board[y][x] !== 0) board[y][x] = tiles.splice((Math.random()*tiles.length)|0, 1)[0];
      shuffles++;
      showMessage('行き詰まり！盤面をシャッフルしました');
      awardXp && awardXp(Math.max(1, 5 - cfg.shufflePenalty));
    }

    function hasMoves(){
      const coords = [];
      for(let y=1;y<=ROWS;y++){
        for(let x=1;x<=COLS;x++){
          if(board[y][x] !== 0) coords.push({ x, y, v: board[y][x] });
        }
      }
      for(let i=0;i<coords.length;i++){
        const a = coords[i];
        for(let j=i+1;j<coords.length;j++){
          const b = coords[j];
          if(a.v !== b.v) continue;
          const path = canConnect(a.x, a.y, b.x, b.y);
          if(path) return true;
        }
      }
      return false;
    }

    function afterRemoval(){
      if(isCleared()){
        awardXp && awardXp(150 + chain * 10, { cleared: true });
        showMessage('全消し成功！四川省クリアボーナス');
      }else if(!hasMoves()){
        shuffleRemaining();
      }
    }

    function handleMatch(a, b){
      const now = performance.now();
      if(now - lastMatchAt < 7000){
        chain++;
      }else{
        chain = 1;
      }
      lastMatchAt = now;
      const base = 6;
      const bonus = Math.floor(chain * 2.5);
      const xp = base + bonus;
      awardXp && awardXp(xp, { chain, pair: true });
      clearedPairs++;
      showMessage(`ペア消去！+${xp}EXP / 連続:${chain}`);
      board[a.y][a.x] = 0;
      board[b.y][b.x] = 0;
      lastPath = null;
      setTimeout(afterRemoval, 50);
    }

    function draw(){
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#0b1220';
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = '#cbd5f5';
      ctx.font = '20px "Noto Sans JP", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`四川省 ${diff}`, 24, 36);
      ctx.font = '14px "Noto Sans JP", sans-serif';
      ctx.fillText(`消去ペア: ${clearedPairs} / シャッフル: ${shuffles} / 連続: ${Math.max(chain, 0)}`, 24, 58);
      if(messageTimer > 0){
        ctx.fillStyle = 'rgba(226,232,240,0.9)';
        ctx.fillText(messageText, 24, 80);
        messageTimer--;
      }

      // grid background
      ctx.fillStyle = 'rgba(15,23,42,0.65)';
      ctx.fillRect(gridOffsetX - 12, gridOffsetY - 12, tileW * COLS + 24, tileH * ROWS + 24);

      // draw last path highlight
      if(lastPath && lastPath.length >= 2){
        ctx.strokeStyle = 'rgba(248,250,252,0.7)';
        ctx.lineWidth = 6;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        for(let i=0;i<lastPath.length;i++){
          const [gx, gy] = lastPath[i];
          const [cx, cy] = toCanvas(gx, gy);
          const centerX = cx + tileW/2;
          const centerY = cy + tileH/2;
          if(i === 0) ctx.moveTo(centerX, centerY);
          else ctx.lineTo(centerX, centerY);
        }
        ctx.stroke();
      }

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${Math.floor(tileH * 0.6)}px "Noto Sans JP", sans-serif`;

      for(let y=1;y<=ROWS;y++){
        for(let x=1;x<=COLS;x++){
          const val = board[y][x];
          const [cx, cy] = toCanvas(x, y);
          ctx.save();
          ctx.translate(cx, cy);
          ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
          ctx.fillRect(0, 0, tileW - 6, tileH - 6);
          if(val !== 0){
            const pal = palette[(val - 1) % palette.length];
            ctx.fillStyle = pal;
            ctx.fillRect(0, 0, tileW - 6, tileH - 6);
            ctx.fillStyle = '#0f172a';
            ctx.fillText(faces[(val - 1) % faces.length], (tileW - 6)/2, (tileH - 6)/2 + 2);
          }else{
            ctx.fillStyle = 'rgba(148, 163, 184, 0.2)';
            ctx.fillRect(0, 0, tileW - 6, tileH - 6);
          }
          ctx.restore();
          if(selected && selected.x === x && selected.y === y){
            ctx.strokeStyle = '#f1f5f9';
            ctx.lineWidth = 4;
            ctx.strokeRect(cx - 2, cy - 2, tileW - 2, tileH - 2);
          }else if(hovering && hovering.x === x && hovering.y === y){
            ctx.strokeStyle = 'rgba(226, 232, 240, 0.6)';
            ctx.lineWidth = 2;
            ctx.strokeRect(cx - 1, cy - 1, tileW - 4, tileH - 4);
          }
        }
      }
    }

    function onMove(e){
      const rect = canvas.getBoundingClientRect();
      const p = inGrid(e.clientX - rect.left, e.clientY - rect.top);
      hovering = p;
      draw();
    }

    function onClick(e){
      const rect = canvas.getBoundingClientRect();
      const p = inGrid(e.clientX - rect.left, e.clientY - rect.top);
      if(!p) return;
      const val = board[p.y][p.x];
      if(val === 0){
        selected = null;
        draw();
        return;
      }
      if(!selected){
        selected = p;
        if(window.showTransientPopupAt){
          const [cx, cy] = toCanvas(p.x, p.y);
          window.showTransientPopupAt(rect.left + cx + tileW/2, rect.top + cy, `${faces[(val - 1) % faces.length]}`);
        }
        draw();
        return;
      }
      if(selected.x === p.x && selected.y === p.y){
        selected = null;
        draw();
        return;
      }
      if(board[selected.y][selected.x] !== val){
        selected = p;
        draw();
        return;
      }
      const path = canConnect(selected.x, selected.y, p.x, p.y);
      if(path){
        lastPath = path;
        draw();
        setTimeout(()=>{
          handleMatch(selected, p);
          selected = null;
          draw();
        }, 120);
      }else{
        showMessage('そのペアは繋がりません');
        selected = p;
        draw();
      }
    }

    function start(){
      if(running) return;
      running = true;
      canvas.addEventListener('mousemove', onMove);
      canvas.addEventListener('click', onClick);
      draw();
    }
    function stop(){
      if(!running) return;
      running = false;
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('click', onClick);
    }
    function destroy(){
      try{ stop(); root && root.removeChild(canvas); }catch{}
    }
    function getScore(){
      return clearedPairs * 10 - shuffles * 5;
    }

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({
    id: 'sichuan',
    name: '四川省パズル', nameKey: 'selection.miniexp.games.sichuan.name',
    description: '麻雀牌のペアを繋いで消す四川省。連続消去でボーナスEXP', descriptionKey: 'selection.miniexp.games.sichuan.description', categoryIds: ['puzzle'],
    create
  });
})();

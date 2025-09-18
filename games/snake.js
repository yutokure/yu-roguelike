(function(){
  const CELL = 18;
  const COLS = 24;
  const ROWS = 16;
  const DIRS = { ArrowUp:[0,-1], ArrowDown:[0,1], ArrowLeft:[-1,0], ArrowRight:[1,0] };

  function create(root, awardXp, opts){
    const difficulty = (opts && opts.difficulty)||'NORMAL';
    let speedMs = 140;
    if (difficulty==='EASY') speedMs = 180;
    if (difficulty==='NORMAL') speedMs = 140;
    if (difficulty==='HARD') speedMs = 90;

    const canvas = document.createElement('canvas');
    canvas.width = COLS*CELL; canvas.height = ROWS*CELL;
    canvas.style.display='block'; canvas.style.margin='0 auto';
    canvas.style.background = '#0f172a';
    canvas.style.borderRadius = '8px';
    root.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let timer = null;
    let running = false;
    let snake = [{x:Math.floor(COLS/2), y:Math.floor(ROWS/2)}];
    let dir = [1,0];
    let nextDir = [1,0];
    let food = spawnFood();
    let grow = 0;
    let lastKey = 'ArrowRight';

    function spawnFood(){
      while(true){
        const f = { x: (Math.random()*COLS|0), y:(Math.random()*ROWS|0) };
        if (!snake.some(s=>s.x===f.x && s.y===f.y)) return f;
      }
    }

    function keydown(e){
      const map = { 'w':'ArrowUp','W':'ArrowUp','s':'ArrowDown','S':'ArrowDown','a':'ArrowLeft','A':'ArrowLeft','d':'ArrowRight','D':'ArrowRight' };
      const key = map[e.key] || e.key;
      if (!DIRS[key]) return;
      const nd = DIRS[key];
      // prevent reverse
      if (nd[0] === -dir[0] && nd[1] === -dir[1]) return;
      nextDir = nd; lastKey = e.key;
      e.preventDefault();
    }

    function step(){
      dir = nextDir;
      const head = { x: snake[0].x + dir[0], y: snake[0].y + dir[1] };
      // wrap
      if (head.x<0) head.x = COLS-1; if (head.x>=COLS) head.x = 0;
      if (head.y<0) head.y = ROWS-1; if (head.y>=ROWS) head.y = 0;
      // collision with self
      if (snake.some(s=>s.x===head.x && s.y===head.y)) {
        // award EXP based on current length and difficulty
        const len = snake.length;
        const factor = (difficulty==='HARD') ? 0.75 : (difficulty==='NORMAL') ? 0.5 : 0.25;
        awardXp && awardXp(len * factor, { type:'fail' });
        // reset
        snake = [ {x:Math.floor(COLS/2), y:Math.floor(ROWS/2)} ];
        dir = [1,0]; nextDir = [1,0]; grow = 0; food = spawnFood();
      } else {
        snake.unshift(head);
        if (head.x===food.x && head.y===food.y) {
          grow += 1;
          awardXp && awardXp(1);
          food = spawnFood();
        }
        if (grow>0) { grow--; } else { snake.pop(); }
      }
      draw();
    }

    function draw(){
      ctx.fillStyle = '#0b1220'; ctx.fillRect(0,0,canvas.width,canvas.height);
      // grid (subtle)
      ctx.strokeStyle = 'rgba(148,163,184,0.12)';
      ctx.lineWidth = 1; ctx.beginPath();
      for(let x=0;x<=COLS;x++){ ctx.moveTo(x*CELL+0.5,0); ctx.lineTo(x*CELL+0.5,canvas.height); }
      for(let y=0;y<=ROWS;y++){ ctx.moveTo(0,y*CELL+0.5); ctx.lineTo(canvas.width,y*CELL+0.5); }
      ctx.stroke();
      // food
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(food.x*CELL+2, food.y*CELL+2, CELL-4, CELL-4);
      // snake
      for(let i=snake.length-1;i>=0;i--){
        const s = snake[i];
        const c = i===0 ? '#22c55e' : '#86efac';
        ctx.fillStyle = c;
        ctx.fillRect(s.x*CELL+2, s.y*CELL+2, CELL-4, CELL-4);
      }
    }

    function start(){ if (!running){ running=true; timer = setInterval(step, speedMs); window.addEventListener('keydown',keydown,{passive:false}); draw(); } }
    function stop(){ if (running){ running=false; clearInterval(timer); timer=null; window.removeEventListener('keydown',keydown); } }
    function destroy(){ try{ stop(); root && root.removeChild(canvas); }catch{} }
    function getScore(){ return snake.length; }

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({ id:'snake', name:'スネーク', description:'餌でEXP', create });
})();

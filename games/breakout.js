(function(){
  function create(root, awardXp, opts){
    const W = 600, H = 400;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    canvas.style.display='block'; canvas.style.margin='0 auto'; canvas.style.background='#0b1220'; canvas.style.borderRadius='8px';
    root.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const diff = (opts && opts.difficulty) || 'NORMAL';
    const cfg = {
      EASY:   { paddleW: 120, ballSpeed: 3.4, lives: 5, move: 7,  clearBonus: 10 },
      NORMAL: { paddleW: 90,  ballSpeed: 4.2, lives: 3, move: 9,  clearBonus: 50 },
      HARD:   { paddleW: 66,  ballSpeed: 5.2, lives: 2, move: 11, clearBonus: 100 }
    }[diff];

    // Paddle
    let paddle = { w: cfg.paddleW, h: 12, x: (W-cfg.paddleW)/2, y: H-24 };
    // Ball
    let ball = { x: W/2, y: H*0.6, r: 7, dx: cfg.ballSpeed*(Math.random()<0.5?-1:1), dy: -cfg.ballSpeed };
    // Bricks
    const cols = 10, rows = 5, pad = 4, offTop = 40, offLeft = 24;
    const bw = Math.floor((W - offLeft*2 - pad*(cols-1)) / cols), bh = 18;
    let bricks = [];
    function resetBricks(){
      bricks = []; for(let c=0;c<cols;c++){ bricks[c]=[]; for(let r=0;r<rows;r++){ bricks[c][r] = { x: offLeft + c*(bw+pad), y: offTop + r*(bh+pad), live: 1 }; } }
    }
    resetBricks();

    // Game state
    let running=false, rafId=0, keys={left:false,right:false};
    let lives = cfg.lives;
    let destroyed = 0;

    function keyDown(e){ if(e.key==='ArrowLeft'){ keys.left=true; e.preventDefault(); } else if(e.key==='ArrowRight'){ keys.right=true; e.preventDefault(); } }
    function keyUp(e){ if(e.key==='ArrowLeft'){ keys.left=false; } else if(e.key==='ArrowRight'){ keys.right=false; } }
    function mouseMove(e){ const rect = canvas.getBoundingClientRect(); const mx = e.clientX - rect.left; paddle.x = Math.max(0, Math.min(W-paddle.w, mx - paddle.w/2)); }

    function drawHUD(){
      ctx.fillStyle='#e2e8f0'; ctx.font='12px sans-serif';
      ctx.fillText(`Lives: ${lives}`, 8, 16);
      ctx.fillText(`Destroyed: ${destroyed}`, 80, 16);
      ctx.fillText(`Diff: ${diff}`, 190, 16);
    }

    function draw(){
      ctx.clearRect(0,0,W,H);
      // backdrop
      ctx.fillStyle='#0b1220'; ctx.fillRect(0,0,W,H);
      // bricks
      for(let c=0;c<cols;c++) for(let r=0;r<rows;r++){
        const b = bricks[c][r]; if(!b.live) continue;
        ctx.fillStyle = `hsl(${(r*50+c*7)%360} 70% 58%)`;
        ctx.fillRect(b.x, b.y, bw, bh);
      }
      // paddle
      ctx.fillStyle='#22c55e'; ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
      // ball
      ctx.beginPath(); ctx.fillStyle='#f59e0b'; ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2); ctx.fill();
      drawHUD();
    }

    function collideBallRect(rx,ry,rw,rh){
      // AABB vs circle
      const nx = Math.max(rx, Math.min(ball.x, rx+rw));
      const ny = Math.max(ry, Math.min(ball.y, ry+rh));
      const dx = ball.x - nx, dy = ball.y - ny;
      return (dx*dx + dy*dy) <= (ball.r*ball.r);
    }

    const sparks=[]; // {x,y,vx,vy,t}
    function addSparks(x,y,n=8){ for(let i=0;i<n;i++){ sparks.push({ x, y, vx:(Math.random()*2-1)*2.4, vy:(Math.random()*-2.2), t: 18 }); } }

    function step(){
      // paddle move
      if(keys.left) paddle.x = Math.max(0, paddle.x - cfg.move);
      if(keys.right) paddle.x = Math.min(W - paddle.w, paddle.x + cfg.move);

      // ball move
      ball.x += ball.dx; ball.y += ball.dy;
      if (ball.x < ball.r) { ball.x = ball.r; ball.dx *= -1; }
      if (ball.x > W - ball.r) { ball.x = W - ball.r; ball.dx *= -1; }
      if (ball.y < ball.r) { ball.y = ball.r; ball.dy *= -1; }

      // paddle bounce
      if (collideBallRect(paddle.x, paddle.y, paddle.w, paddle.h) && ball.dy > 0) {
        const hit = (ball.x - (paddle.x + paddle.w/2)) / (paddle.w/2);
        const speed = Math.hypot(ball.dx, ball.dy);
        const angle = hit * (Math.PI/3); // -60..+60deg
        ball.dx = speed * Math.sin(angle);
        ball.dy = -Math.abs(speed * Math.cos(angle));
        ball.y = paddle.y - ball.r - 0.1;
      }

      // brick collisions (coarse scan)
      outer: for(let c=0;c<cols;c++) for(let r=0;r<rows;r++){
        const b = bricks[c][r]; if(!b.live) continue;
        if (collideBallRect(b.x, b.y, bw, bh)){
          b.live = 0; destroyed++;
          awardXp && awardXp(1);
          addSparks(ball.x, ball.y, 10);
          // reflect: choose axis by penetration depth
          const cx = Math.max(b.x, Math.min(ball.x, b.x+bw));
          const cy = Math.max(b.y, Math.min(ball.y, b.y+bh));
          const dx = (ball.x - cx), dy = (ball.y - cy);
          if (Math.abs(dx) > Math.abs(dy)) ball.dx *= -1; else ball.dy *= -1;
          break outer;
        }
      }

      // bottom out
      if (ball.y > H + ball.r){
        lives--;
        if (lives <= 0) {
          // reset game state
          lives = cfg.lives; destroyed = 0; resetBricks();
        }
        // reset ball & paddle
        paddle.x = (W - paddle.w)/2; ball.x = W/2; ball.y = H*0.6; ball.dx = cfg.ballSpeed*(Math.random()<0.5?-1:1); ball.dy = -cfg.ballSpeed;
      }

      // level clear -> next layout
      if (destroyed > 0) {
        let remain = 0; for(let c=0;c<cols;c++) for(let r=0;r<rows;r++) if(bricks[c][r].live) remain++;
        if (remain === 0){ awardXp && awardXp(cfg.clearBonus, { type:'clear' }); resetBricks(); /* keep score and speed */ }
      }

      // particles
      for(let i=sparks.length-1;i>=0;i--){ const p=sparks[i]; p.x+=p.vx; p.y+=p.vy; p.vy+=0.15; p.t--; if(p.t<=0) sparks.splice(i,1); }
      draw();
      // draw sparks
      for(const p of sparks){ ctx.fillStyle=`rgba(250,250,250,${p.t/18})`; ctx.fillRect(p.x, p.y, 2, 2); }
      if (running) rafId = requestAnimationFrame(step);
    }

    function start(){ if(!running){ running=true; window.addEventListener('keydown',keyDown,{passive:false}); window.addEventListener('keyup',keyUp); canvas.addEventListener('mousemove',mouseMove); draw(); rafId = requestAnimationFrame(step); } }
    function stop(){ if(running){ running=false; cancelAnimationFrame(rafId); rafId=0; window.removeEventListener('keydown',keyDown); window.removeEventListener('keyup',keyUp); canvas.removeEventListener('mousemove',mouseMove); } }
    function destroy(){ try{ stop(); root && root.removeChild(canvas); }catch{} }
    function getScore(){ return destroyed; }

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({ id:'breakout', name:'ブロック崩し', nameKey: 'selection.miniexp.games.breakout.name', description:'ブロック破壊で+1EXP', descriptionKey: 'selection.miniexp.games.breakout.description', categoryIds: ['action'], create });
})();

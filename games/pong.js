(function(){
  function create(root, awardXp, opts){
    const W = 600, H = 360;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    canvas.style.display='block'; canvas.style.margin='0 auto'; canvas.style.background='#0b1220'; canvas.style.borderRadius='8px';
    root.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const diff = (opts && opts.difficulty) || 'NORMAL';
    const cfg = {
      EASY:   { paddleH: 70, paddleSpeed: 7,  aiLag: 0.25, ballSpeed: 4.0, pointXp: 1,  finalXp: 20 },
      NORMAL: { paddleH: 60, paddleSpeed: 8.5,aiLag: 0.18, ballSpeed: 4.8, pointXp: 3,  finalXp: 100 },
      HARD:   { paddleH: 52, paddleSpeed: 10, aiLag: 0.10, ballSpeed: 5.6, pointXp: 10, finalXp: 400 }
    }[diff];

    const PADDLE_W = 10;
    let left = { x: 14, y: H/2 - cfg.paddleH/2, w: PADDLE_W, h: cfg.paddleH, dy: 0 };
    let right = { x: W-14-PADDLE_W, y: H/2 - cfg.paddleH/2, w: PADDLE_W, h: cfg.paddleH, dy: 0 };
    let ball = { x: W/2, y: H/2, r: 6, dx: cfg.ballSpeed*(Math.random()<0.5?-1:1), dy: cfg.ballSpeed*(Math.random()*0.6-0.3) };

    let running=false, rafId=0, keys={up:false,down:false};
    const trail=[]; // last ball positions
    let scoreL = 0, scoreR = 0; // player (left) vs AI (right)
    const TARGET = 5;

    function keyDown(e){ if(e.key==='ArrowUp' || e.key==='w' || e.key==='W'){ keys.up=true; e.preventDefault(); } else if(e.key==='ArrowDown' || e.key==='s' || e.key==='S'){ keys.down=true; e.preventDefault(); } }
    function keyUp(e){ if(e.key==='ArrowUp' || e.key==='w' || e.key==='W'){ keys.up=false; } else if(e.key==='ArrowDown' || e.key==='s' || e.key==='S'){ keys.down=false; } }

    function resetBall(dir){ ball.x=W/2; ball.y=H/2; const sp=cfg.ballSpeed; ball.dx = sp*(dir|| (Math.random()<0.5?-1:1)); ball.dy = sp*(Math.random()*0.8-0.4); }

    function draw(){
      ctx.fillStyle='#0b1220'; ctx.fillRect(0,0,W,H);
      // mid line
      ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.setLineDash([6,10]); ctx.beginPath(); ctx.moveTo(W/2,0); ctx.lineTo(W/2,H); ctx.stroke(); ctx.setLineDash([]);
      // paddles
      ctx.fillStyle='#22c55e'; ctx.fillRect(left.x,left.y,left.w,left.h);
      ctx.fillStyle='#f43f5e'; ctx.fillRect(right.x,right.y,right.w,right.h);
      // ball
      ctx.beginPath(); ctx.fillStyle='#eab308'; ctx.arc(ball.x,ball.y, ball.r, 0, Math.PI*2); ctx.fill();
      // score
      ctx.fillStyle='#e2e8f0'; ctx.font='bold 28px system-ui, sans-serif';
      ctx.fillText(String(scoreL), W*0.25, 36);
      ctx.fillText(String(scoreR), W*0.75, 36);
      ctx.font='12px sans-serif'; ctx.fillText(`First to ${TARGET} | ${diff}`, 10, H-10);
    }

    function step(){
      // player move
      if (keys.up) left.y -= cfg.paddleSpeed;
      if (keys.down) left.y += cfg.paddleSpeed;
      left.y = Math.max(0, Math.min(H-left.h, left.y));

      // AI move (predictive with lag)
      const targetY = ball.y - right.h/2;
      const delta = targetY - right.y;
      right.y += Math.sign(delta) * Math.min(Math.abs(delta)*cfg.aiLag + 1, cfg.paddleSpeed*0.95);
      right.y = Math.max(0, Math.min(H-right.h, right.y));

      // ball
      ball.x += ball.dx; ball.y += ball.dy; trail.push({x:ball.x,y:ball.y}); if (trail.length>10) trail.shift();
      if (ball.y < ball.r) { ball.y = ball.r; ball.dy *= -1; }
      if (ball.y > H - ball.r) { ball.y = H - ball.r; ball.dy *= -1; }

      // collide with paddles
      if (ball.x - ball.r < left.x + left.w && ball.y > left.y && ball.y < left.y + left.h && ball.dx < 0){
        const rel = (ball.y - (left.y + left.h/2)) / (left.h/2);
        const speed = Math.hypot(ball.dx, ball.dy) * 1.03;
        const angle = rel * (Math.PI/3);
        ball.dx = Math.abs(speed * Math.cos(angle));
        ball.dy = speed * Math.sin(angle);
        ball.x = left.x + left.w + ball.r + 0.1;
      }
      if (ball.x + ball.r > right.x && ball.y > right.y && ball.y < right.y + right.h && ball.dx > 0){
        const rel = (ball.y - (right.y + right.h/2)) / (right.h/2);
        const speed = Math.hypot(ball.dx, ball.dy) * 1.03;
        const angle = rel * (Math.PI/3);
        ball.dx = -Math.abs(speed * Math.cos(angle));
        ball.dy = speed * Math.sin(angle);
        ball.x = right.x - ball.r - 0.1;
      }

      // score
      if (ball.x < -ball.r){
        // AI scored
        scoreR++; resetBall(+1);
      } else if (ball.x > W + ball.r){
        // Player scored
        scoreL++; awardXp && awardXp(cfg.pointXp, { type:'point' }); resetBall(-1);
      }

      // match end
      if (scoreL >= TARGET || scoreR >= TARGET){
        if (scoreL > scoreR) { awardXp && awardXp(cfg.finalXp, { type:'win' }); }
        // reset match
        scoreL = 0; scoreR = 0; left.y = H/2 - left.h/2; right.y = H/2 - right.h/2; resetBall();
      }

      draw();
      // trail
      for(let i=0;i<trail.length;i++){ const t=trail[i]; const a = (i+1)/trail.length * 0.35; ctx.beginPath(); ctx.fillStyle=`rgba(234,179,8,${a})`; ctx.arc(t.x,t.y, 4, 0, Math.PI*2); ctx.fill(); }
      if (running) rafId = requestAnimationFrame(step);
    }

    function start(){ if(!running){ running=true; window.addEventListener('keydown',keyDown,{passive:false}); window.addEventListener('keyup',keyUp); draw(); rafId = requestAnimationFrame(step); } }
    function stop(){ if(running){ running=false; cancelAnimationFrame(rafId); rafId=0; window.removeEventListener('keydown',keyDown); window.removeEventListener('keyup',keyUp); } }
    function destroy(){ try{ stop(); root && root.removeChild(canvas); }catch{} }
    function getScore(){ return scoreL; }

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({ id:'pong', name:'ピンポン', nameKey: 'selection.miniexp.games.pong.name', description:'マッチ勝利で難易度別EXP', descriptionKey: 'selection.miniexp.games.pong.description', categoryIds: ['action'], create });
})();

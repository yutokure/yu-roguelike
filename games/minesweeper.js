(function(){
  /** MiniExp: Minesweeper (v0.1.0) */
  function create(root, awardXp, opts){
    const difficulty = (opts && opts.difficulty) || 'NORMAL';
    const cfg = (
      difficulty==='HARD'   ? { w:30, h:16, m:99,  bonus:1600 } :
      difficulty==='EASY'   ? { w:9,  h:9,  m:10,  bonus:25   } :
                              { w:16, h:16, m:40,  bonus:200  }
    );

    const canvas = document.createElement('canvas');
    canvas.width = Math.min(640, root.clientWidth||640);
    canvas.height = Math.round(canvas.width * (cfg.h/cfg.w));
    canvas.style.display='block'; canvas.style.margin='0 auto'; canvas.style.borderRadius='6px';
    const topBar = document.createElement('div');
    topBar.className = 'ms-topbar';
    const info = document.createElement('span');
    const btnR = document.createElement('button'); btnR.textContent='再開/再起動 (R)';
    topBar.appendChild(info); topBar.appendChild(btnR);
    root.appendChild(topBar);
    root.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let cellSize = Math.floor(Math.min(canvas.width/cfg.w, canvas.height/cfg.h));
    let gridOffsetX = Math.floor((canvas.width - cellSize*cfg.w)/2);
    let gridOffsetY = Math.floor((canvas.height - cellSize*cfg.h)/2);

    let board = []; // {mine,open,flag,num}
    let firstClickDone = false;
    let openedSafe = 0; // for score
    let running = false, ended = false;
    let startTime = 0, clearTime = 0;

    function initBoard(){
      board = Array.from({length:cfg.h},()=>Array.from({length:cfg.w},()=>({mine:false,open:false,flag:false,num:0})));
      firstClickDone = false; openedSafe = 0; ended=false; clearTime=0; startTime=Date.now();
    }
    initBoard();

    function forEachCell(fn){ for(let y=0;y<cfg.h;y++) for(let x=0;x<cfg.w;x++) fn(x,y,board[y][x]); }
    function inb(x,y){ return x>=0 && x<cfg.w && y>=0 && y<cfg.h; }
    function around(x,y,fn){ for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++){ if(!dx&&!dy)continue; const nx=x+dx,ny=y+dy; if(inb(nx,ny)) fn(nx,ny,board[ny][nx]); } }

    function placeMines(sx,sy){
      let need = cfg.m; const cells=[]; forEachCell((x,y)=>{ cells.push({x,y}); });
      // ensure first click cell (sx,sy) and its neighbors are safe
      const safe = new Set(); safe.add(`${sx},${sy}`); around(sx,sy,(x,y)=>safe.add(`${x},${y}`));
      const cand = cells.filter(c=>!safe.has(`${c.x},${c.y}`));
      for(let i=cand.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; const t=cand[i]; cand[i]=cand[j]; cand[j]=t; }
      for(let i=0;i<need && i<cand.length;i++){ const {x,y}=cand[i]; board[y][x].mine=true; }
      // numbers
      forEachCell((x,y,c)=>{ if(c.mine){ c.num=-1; } else { let n=0; around(x,y,(ax,ay,ac)=>{ if(ac.mine) n++; }); c.num=n; } });
    }

    function draw(){
      const cs = cellSize; ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle = '#0f172a'; ctx.fillRect(0,0,canvas.width,canvas.height);
      // grid
      for(let y=0;y<cfg.h;y++){
        for(let x=0;x<cfg.w;x++){
          const c = board[y][x]; const px = gridOffsetX + x*cs; const py = gridOffsetY + y*cs;
          ctx.strokeStyle = '#1f2937'; ctx.strokeRect(px+0.5,py+0.5,cs-1,cs-1);
          if (!c.open){ ctx.fillStyle = c.flag?'#7c3aed':'#111827'; ctx.fillRect(px+1,py+1,cs-2,cs-2); }
          else {
            ctx.fillStyle = '#0b3d2e'; ctx.fillRect(px+1,py+1,cs-2,cs-2);
            if (c.mine){ ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(px+cs/2, py+cs/2, cs*0.25, 0, Math.PI*2); ctx.fill(); }
            else if (c.num>0){ ctx.fillStyle = '#e5e7eb'; ctx.font = `${Math.max(12,Math.floor(cs*0.55))}px system-ui,sans-serif`; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(String(c.num), px+cs/2, py+cs/2+1); }
          }
        }
      }
      // top info
      const elapsed = Math.floor(((ended?clearTime:Date.now()) - startTime)/1000);
      const bombsLeft = cfg.m - (function(){ let f=0; forEachCell((x,y,c)=>{ if(c.flag) f++; }); return f; })();
      info.textContent = `難易度:${difficulty} 地雷:${cfg.m} 残り旗:${bombsLeft} 時間:${elapsed}s 開放:${openedSafe}`;
    }

    function floodOpen(sx,sy){
      const q=[[sx,sy]]; const visited=new Set(); let opened=0;
      while(q.length){ const [x,y]=q.shift(); const key=`${x},${y}`; if(visited.has(key)) continue; visited.add(key); const c=board[y][x]; if(c.open||c.flag) continue; c.open=true; if(!c.mine) opened++; if(c.num===0){ around(x,y,(nx,ny,nc)=>{ if(!nc.open && !nc.mine) q.push([nx,ny]); }); } }
      return opened;
    }

    function checkClear(){
      for(let y=0;y<cfg.h;y++) for(let x=0;x<cfg.w;x++){ const c=board[y][x]; if(!c.mine && !c.open) return false; }
      return true;
    }

    function handleOpen(x,y){ if(ended) return; const c=board[y][x]; if(c.open||c.flag) return; if(!firstClickDone){ placeMines(x,y); firstClickDone=true; }
      if(c.mine){ c.open=true; ended=true; clearTime=Date.now(); draw(); return; }
      const newly = floodOpen(x,y); if(newly>0){ openedSafe += newly; awardXp(newly*0.1, { type:'open' }); }
      if(checkClear()){ ended=true; clearTime=Date.now(); awardXp(cfg.bonus, { type:'clear' }); }
      draw();
    }

    function toggleFlag(x,y){ if(ended) return; const c=board[y][x]; if(c.open) return; c.flag=!c.flag; draw(); }

    function eventToCell(e){ const rect = canvas.getBoundingClientRect(); const mx = e.clientX-rect.left, my=e.clientY-rect.top; const x=Math.floor((mx-gridOffsetX)/cellSize), y=Math.floor((my-gridOffsetY)/cellSize); if(x<0||x>=cfg.w||y<0||y>=cfg.h) return null; return {x,y}; }

    function onClick(e){ if(!running) return; const p=eventToCell(e); if(!p) return; handleOpen(p.x,p.y); }
    function onContext(e){ e.preventDefault(); if(!running) return; const p=eventToCell(e); if(!p) return; toggleFlag(p.x,p.y); }
    function onKey(e){ if(e.key==='r' || e.key==='R'){ e.preventDefault(); restart(); } }

    function start(){ if(running) return; running=true; canvas.addEventListener('click', onClick); canvas.addEventListener('contextmenu', onContext); document.addEventListener('keydown', onKey); btnR.onclick = restart; draw(); }
    function stop(){ if(!running) return; running=false; canvas.removeEventListener('click', onClick); canvas.removeEventListener('contextmenu', onContext); document.removeEventListener('keydown', onKey); }
    function destroy(){ try{ stop(); canvas.remove(); topBar.remove(); }catch{} }
    function restart(){ stop(); initBoard(); start(); }
    function getScore(){ return ended && openedSafe>0 ? Math.floor(1000000/Math.max(1,(clearTime-startTime))) : openedSafe; }

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({ id:'minesweeper', name:'マインスイーパー', description:'開放×0.1 / クリア: 25/200/1600', create });
})();


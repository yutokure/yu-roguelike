(function(){
  /** MiniExp: 2048 (v0.1.0) */
  function create(root, awardXp, opts){
    const shortcuts = opts?.shortcuts;
    const panel = document.createElement('div'); panel.className='g2048-panel';
    const form = document.createElement('div'); form.className='g2048-setup'; form.innerHTML = '<label>盤面サイズ: </label>';
    const sel = document.createElement('select'); for(let n=4;n<=16;n++){ const o=document.createElement('option'); o.value=String(n); o.textContent=`${n}×${n}`; if(n===4) o.selected=true; sel.appendChild(o); }
    const btn = document.createElement('button'); btn.textContent='開始';
    form.appendChild(sel); form.appendChild(btn); panel.appendChild(form); root.appendChild(panel);

    let N = 4; let board=null; let moved=false; let running=false; let ended=false; let maxTile=2; let awarded2048=false;
    const canvas=document.createElement('canvas'); canvas.style.display='none'; panel.appendChild(canvas); const ctx=canvas.getContext('2d');

    function disableHostRestart(){
      shortcuts?.disableKey('r');
    }

    function enableHostRestart(){
      shortcuts?.enableKey('r');
    }

    function init(n){ N=n; awarded2048=false; maxTile=2; board=Array.from({length:N},()=>Array(N).fill(0)); addRand(); addRand(); resize(); draw(); document.addEventListener('keydown', onKey, { passive:false }); running=true; ended=false; disableHostRestart(); }
    function resize(){ const W = Math.min(520, root.clientWidth||520); const H=W; canvas.width=W; canvas.height=H; canvas.style.display='block'; }
    function addRand(){ const empt=[]; for(let y=0;y<N;y++) for(let x=0;x<N;x++) if(board[y][x]===0) empt.push([x,y]); if(!empt.length) return; const [x,y]=empt[(Math.random()*empt.length)|0]; board[y][x] = Math.random()<0.9?2:4; }
    function draw(){ const W=canvas.width, H=canvas.height; const s=W/(N+1); const pad=s/(N>8?10:6); const cell=s; ctx.fillStyle='#0b1020'; ctx.fillRect(0,0,W,H); ctx.font=`${Math.max(10, Math.floor(cell*0.35))}px system-ui,sans-serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
      for(let y=0;y<N;y++) for(let x=0;x<N;x++){ const v=board[y][x]; const px = pad + x*(cell) + cell/2; const py = pad + y*(cell) + cell/2; ctx.fillStyle=v?tileColor(v):'#111827'; ctx.fillRect(px-cell/2+1, py-cell/2+1, cell-2, cell-2); if(v){ ctx.fillStyle=v>=8?'#f8fafc':'#e5e7eb'; ctx.fillText(String(v), px, py); } }
    }
    function tileColor(v){ const m=Math.log2(v)|0; const palette=['#1f2937','#64748b','#94a3b8','#cbd5e1','#60a5fa','#34d399','#f59e0b','#ef4444','#a78bfa','#22d3ee','#fb7185','#84cc16']; return palette[m%palette.length]; }
    function compress(line){ const arr=line.filter(v=>v!==0); while(arr.length<line.length) arr.push(0); return arr; }
    function mergeLine(line){ let exp=0; line=compress(line); for(let i=0;i<line.length-1;i++){ if(line[i]!==0 && line[i]===line[i+1]){ const nv=line[i]*2; line[i]=nv; line[i+1]=0; exp += Math.log2(nv); maxTile=Math.max(maxTile,nv); i++; } } line=compress(line); return { line, exp }; }
    function moveLeft(){ let totalExp=0, changed=false; for(let y=0;y<N;y++){ const { line, exp } = mergeLine(board[y]); if(board[y].some((v,i)=>v!==line[i])) changed=true; board[y]=line; totalExp+=exp; }
      if(totalExp>0) awardXp(totalExp, { type:'merge' });
      // 4x4のときだけ2048到達で+777し、即終了。それ以外のサイズは継続。
      if(!awarded2048 && maxTile>=2048){
        if (N===4){
          awardXp(777, { type:'2048', boardSize:N });
          awarded2048=true;
          finishGame();
        }
      }
      return changed;
    }
    function rotateBoard(times){ for(let t=0;t<times;t++){ const nb=Array.from({length:N},()=>Array(N).fill(0)); for(let y=0;y<N;y++) for(let x=0;x<N;x++){ nb[x][N-1-y]=board[y][x]; } board=nb; } }
    function move(dir){ // 0=left,1=up,2=right,3=down
      if(dir===0) return moveLeft(); if(dir===2){ rotateBoard(2); const ch=moveLeft(); rotateBoard(2); return ch; } if(dir===1){ rotateBoard(3); const ch=moveLeft(); rotateBoard(1); return ch; } if(dir===3){ rotateBoard(1); const ch=moveLeft(); rotateBoard(3); return ch; }
    }
    function hasMoves(){ for(let y=0;y<N;y++) for(let x=0;x<N;x++){ if(board[y][x]===0) return true; const v=board[y][x]; if(x+1<N && board[y][x+1]===v) return true; if(y+1<N && board[y+1][x]===v) return true; } return false; }

    function onKey(e){ if(!running) return; const map={ArrowLeft:0,ArrowUp:1,ArrowRight:2,ArrowDown:3}; if(map[e.code]!==undefined){ e.preventDefault(); const ch=move(map[e.code]);
        // 2048到達による即終了時は乱数タイル追加をスキップ
        if(!running){ draw(); return; }
        if(ch){ addRand(); draw(); if(!hasMoves()){ finishGame(); } }
      }
      if((e.key==='r'||e.key==='R') && !running){ restart(); }
    }

    btn.addEventListener('click', ()=>{ const n=parseInt(sel.value,10); form.style.display='none'; init(n); });
    function finishGame(){
      if (!ended){
        ended = true;
        enableHostRestart();
      }
      running = false;
    }

    function start(){ /* waits for setup */ }
    function stop(opts = {}){ running=false; document.removeEventListener('keydown', onKey); if (!opts.keepShortcutsDisabled){ enableHostRestart(); } }
    function destroy(){ try{ stop(); panel.remove(); }catch{} }
    function restart(){ stop(); form.style.display='block'; canvas.style.display='none'; awarded2048=false; maxTile=2; }
    function getScore(){ return maxTile; }

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({ id:'game2048', name:'2048', nameKey: 'selection.miniexp.games.game2048.name', description:'合成log2 / 4x4で2048:+777', descriptionKey: 'selection.miniexp.games.game2048.description', categoryIds: ['puzzle'], create });
})();

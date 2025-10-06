(function(){
  /**
   * MiniExp MOD: Riichi Mahjong Lite
   * A streamlined single-hand riichi mahjong experience with simple AI opponents.
   * Focuses on closed-hand play (no calls except ron) while covering core rules,
   * riichi/tsumo/ron handling, yaku evaluation (riichi / tsumo / tanyao / pinfu / yakuhai),
   * scoring, dora, riichi sticks, and round progression.
   */
  function create(root, awardXp, opts){
    const difficulty = (opts && opts.difficulty) || 'NORMAL';
    const difficulties = ['EASY','NORMAL','HARD'];
    const diffIdx = Math.max(0, difficulties.indexOf(difficulty));

    // --- Tile definitions ---------------------------------------------------
    const SUITS = ['m','p','s']; // manzu, pinzu, souzu
    const HONORS = ['E','S','W','N','P','F','C']; // East, South, West, North, Haku, Hatsu, Chun
    const TILE_ORDER = [];
    const TILE_LABEL = {};
    const TILE_TO_INDEX = {};

    function pushTile(base, label){
      const idx = TILE_ORDER.length;
      TILE_ORDER.push(base);
      TILE_LABEL[base] = label;
      TILE_TO_INDEX[base] = idx;
    }

    SUITS.forEach((suit, suitIdx)=>{
      for(let num=1; num<=9; num++){
        const base = suit + num;
        const kanjiSuit = suit === 'm' ? '萬' : suit === 'p' ? '筒' : '索';
        pushTile(base, `${num}${kanjiSuit}`);
      }
    });
    HONORS.forEach((honor, idx)=>{
      const names = {
        E: '東', S: '南', W: '西', N: '北',
        P: '白', F: '發', C: '中'
      };
      pushTile('z' + (idx+1), names[honor]);
    });

    function baseOf(tileCode){
      return tileCode.split('-')[0];
    }

    function createWall(){
      const wall = [];
      TILE_ORDER.forEach(base => {
        for(let i=0;i<4;i++){
          wall.push(`${base}-${i}`);
        }
      });
      for(let i=wall.length-1;i>0;i--){
        const j = (Math.random()*(i+1))|0;
        const t = wall[i]; wall[i] = wall[j]; wall[j] = t;
      }
      return wall;
    }

    function cloneCounts(counts){
      return counts.slice();
    }

    function toCounts(tileList){
      const counts = new Array(TILE_ORDER.length).fill(0);
      tileList.forEach(code => {
        const base = baseOf(code);
        const idx = TILE_TO_INDEX[base];
        counts[idx]++;
      });
      return counts;
    }

    function sortHand(hand){
      return hand.sort((a,b)=>{
        const idxA = TILE_TO_INDEX[baseOf(a)];
        const idxB = TILE_TO_INDEX[baseOf(b)];
        if (idxA === idxB) return a.localeCompare(b);
        return idxA - idxB;
      });
    }

    // --- Hand analysis ------------------------------------------------------
    function isSuitTileIndex(idx){
      return idx < 9 * 3; // first 27 indices are suits
    }

    function tileNumber(idx){
      if (!isSuitTileIndex(idx)) return null;
      return (idx % 9) + 1;
    }

    function suitForIndex(idx){
      if (!isSuitTileIndex(idx)) return null;
      return SUITS[Math.floor(idx / 9)];
    }

    function tryStandardHand(counts){
      const patterns = [];
      function removeMelds(working, melds){
        let first = -1;
        for(let i=0;i<working.length;i++){
          if (working[i] > 0){ first = i; break; }
        }
        if (first === -1){
          patterns.push({ melds: melds.map(m => ({...m})) });
          return true;
        }
        let found = false;
        if (working[first] >= 3){
          working[first] -= 3;
          melds.push({ type: 'pon', index: first });
          if (removeMelds(working, melds)) found = true;
          melds.pop();
          working[first] += 3;
        }
        if (isSuitTileIndex(first)){
          const suit = suitForIndex(first);
          const num = tileNumber(first);
          if (num <= 7){
            const i2 = first + 1;
            const i3 = first + 2;
            if (suitForIndex(i2) === suit && suitForIndex(i3) === suit && working[i2] > 0 && working[i3] > 0){
              working[first]--; working[i2]--; working[i3]--;
              melds.push({ type: 'chi', index: first });
              if (removeMelds(working, melds)) found = true;
              melds.pop();
              working[first]++; working[i2]++; working[i3]++;
            }
          }
        }
        return found;
      }

      for(let i=0;i<counts.length;i++){
        if (counts[i] >= 2){
          const working = cloneCounts(counts);
          working[i] -= 2;
          const melds = [];
          if (removeMelds(working, melds)){
            patterns.push({ pair: i, melds, type: 'standard' });
          }
        }
      }
      return patterns;
    }

    function isChiitoitsu(counts){
      let pairs = 0;
      for(let i=0;i<counts.length;i++){
        if (counts[i] === 2) pairs++;
        else if (counts[i] !== 0) return false;
      }
      return pairs === 7;
    }

    function analyzeWinningHand(tileList){
      if (tileList.length !== 14) return null;
      const counts = toCounts(tileList);
      const totalTiles = counts.reduce((a,b)=>a+b,0);
      if (totalTiles !== 14) return null;

      if (isChiitoitsu(counts)){
        return { type: 'chiitoitsu', pairList: counts.map((c,idx)=>c===2?idx:null).filter(v=>v!==null) };
      }

      const patterns = tryStandardHand(counts);
      if (patterns.length > 0){
        return patterns[0];
      }
      return null;
    }

    function listWaitTiles(hand){
      if (hand.length !== 13) return [];
      const waits = [];
      const counts = toCounts(hand);
      for(let idx=0; idx<counts.length; idx++){
        if (counts[idx] >= 4) continue;
        counts[idx]++;
        const expanded = [];
        counts.forEach((c,i)=>{ for(let t=0;t<c;t++) expanded.push(TILE_ORDER[i]); });
        if (analyzeWinningHand(expanded.map((base, occurrenceIdx)=>`${base}-${occurrenceIdx}`))){
          waits.push(idx);
        }
        counts[idx]--;
      }
      return waits;
    }

    function hasTerminalOrHonor(idx){
      if (!isSuitTileIndex(idx)) return true;
      const num = tileNumber(idx);
      return num === 1 || num === 9;
    }

    function isTanyao(handIndices){
      return handIndices.every(idx => !hasTerminalOrHonor(idx));
    }

    function countYakuhai(melds, seatWindIdx, roundWindIdx){
      let count = 0;
      melds.forEach(m => {
        if (m.type !== 'pon') return;
        const idx = m.index;
        if (!isSuitTileIndex(idx)){
          const honorPos = idx - 27;
          if (honorPos === seatWindIdx || honorPos === roundWindIdx || honorPos >= 4){
            count++;
          }
        }
      });
      return count;
    }

    function isPinfu(pattern, pairIdx, seatWindIdx, roundWindIdx){
      if (!pattern || pattern.type !== 'standard') return false;
      if (!pattern.melds.every(m=>m.type === 'chi')) return false;
      if (!isSuitTileIndex(pairIdx)){
        const honor = pairIdx - 27;
        if (honor === seatWindIdx || honor === roundWindIdx || honor >= 4) return false;
      } else {
        const num = tileNumber(pairIdx);
        if (num === 1 || num === 9) return false;
      }
      return true;
    }

    function evaluateHand(tileCodes, optsEval){
      const { riichi, tsumo, seatWindIdx, roundWindIdx, doraTiles } = optsEval;
      const analysis = analyzeWinningHand(tileCodes);
      if (!analysis) return null;

      let han = 0;
      const yaku = [];
      const indices = tileCodes.map(c => TILE_TO_INDEX[baseOf(c)]);

      if (analysis.type === 'chiitoitsu'){
        han += 2;
        yaku.push('七対子');
        if (riichi){ han += 1; yaku.push('立直'); }
        if (tsumo){ han += 1; yaku.push('門前清自摸和'); }
        if (isTanyao(indices)) { han += 1; yaku.push('断么九'); }
        // Dora count
        const doraCount = countDora(indices, doraTiles);
        for(let i=0;i<doraCount;i++){ han += 1; yaku.push('ドラ'); }
        const fu = 25; // chiitoitsu fixed
        const points = calculatePoints(han, fu, optsEval.isDealer);
        return { han, fu, yaku, points, type: analysis.type };
      }

      const melds = analysis.melds;
      const pairIdx = analysis.pair;
      const yakuhaiCount = countYakuhai(melds, seatWindIdx, roundWindIdx);
      if (yakuhaiCount > 0){
        han += yakuhaiCount;
        for(let i=0;i<yakuhaiCount;i++){ yaku.push('役牌'); }
      }
      if (riichi){ han += 1; yaku.push('立直'); }
      if (tsumo){ han += 1; yaku.push('門前清自摸和'); }
      if (isTanyao(indices)) { han += 1; yaku.push('断么九'); }
      if (isPinfu(analysis, pairIdx, seatWindIdx, roundWindIdx)){
        han += 1; yaku.push('平和');
      }
      const doraCount = countDora(indices, doraTiles);
      if (doraCount > 0){
        for(let i=0;i<doraCount;i++){ han += 1; yaku.push('ドラ'); }
      }
      if (han === 0) return null; // no yaku => cannot win

      let fu = 20;
      let fuReason = [];
      if (!tsumo){
        fu += 10; fuReason.push('門前ロン+10');
      }
      if (tsumo && !yaku.includes('平和')){
        fu += 2; fuReason.push('ツモ+2');
      }
      if (!isSuitTileIndex(pairIdx)){
        const honor = pairIdx - 27;
        if (honor === seatWindIdx){ fu += 2; fuReason.push('自風雀頭+2'); }
        if (honor === roundWindIdx){ fu += 2; fuReason.push('場風雀頭+2'); }
        if (honor >= 4){ fu += 2; fuReason.push('三元牌雀頭+2'); }
      }
      melds.forEach(m => {
        const idx = m.index;
        const closed = true;
        if (m.type === 'pon'){
          if (isSuitTileIndex(idx)){
            const num = tileNumber(idx);
            if (num === 1 || num === 9){
              fu += closed ? 8 : 4;
              fuReason.push('槓子扱い端牌刻子+8');
            } else {
              fu += closed ? 4 : 2;
              fuReason.push('中張刻子+4');
            }
          } else {
            fu += closed ? 8 : 4;
            fuReason.push('字牌刻子+8');
          }
        }
      });
      fu = Math.max(20, fu);
      fu = Math.ceil(fu / 10) * 10;
      if (fu === 20 && !tsumo){ fu = 30; }

      const points = calculatePoints(han, fu, optsEval.isDealer);
      return { han, fu, yaku, points, fuReason, type: 'standard' };
    }

    function countDora(indices, doraTiles){
      if (!doraTiles || doraTiles.length === 0) return 0;
      const counts = new Map();
      indices.forEach(idx => {
        counts.set(idx, (counts.get(idx) || 0) + 1);
      });
      let dora = 0;
      doraTiles.forEach(doraIdx => {
        dora += counts.get(doraIdx) || 0;
      });
      return dora;
    }

    function calculatePoints(han, fu, isDealer){
      let basePoints;
      let limit = null;
      if (han >= 13){ basePoints = 8000; limit = '役満'; }
      else if (han >= 11){ basePoints = 6000; limit = '三倍満'; }
      else if (han >= 8){ basePoints = 4000; limit = '倍満'; }
      else if (han >= 6){ basePoints = 3000; limit = '跳満'; }
      else if (han >= 5){ basePoints = 2000; limit = '満貫'; }
      else {
        basePoints = fu * Math.pow(2, 2 + han);
        if (basePoints > 2000){
          basePoints = 2000;
          limit = '満貫';
        }
      }

      function roundToHundred(value){
        return Math.ceil(value / 100) * 100;
      }

      const ron = roundToHundred(basePoints * (isDealer ? 6 : 4));
      const tsumoDealer = roundToHundred(basePoints * 2);
      const tsumoNonDealer = {
        dealer: roundToHundred(basePoints * 2),
        other: roundToHundred(basePoints)
      };
      return { basePoints, limit, ron, tsumoDealer, tsumoNonDealer };
    }

    function describePoints(result, isDealer, tsumo){
      if (!result) return '';
      const points = result.points;
      if (tsumo){
        if (isDealer){
          return `ツモ ${points.tsumoDealer}点オール`;
        }
        return `ツモ 親${points.tsumoNonDealer.dealer} / 子${points.tsumoNonDealer.other}`;
      }
      return `ロン ${points.ron}点`;
    }

    // --- Game state ---------------------------------------------------------
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '12px';
    container.style.padding = '16px';
    container.style.boxSizing = 'border-box';
    container.style.color = '#e2e8f0';
    container.style.background = 'linear-gradient(180deg,#0f172a,#111827)';
    container.style.borderRadius = '18px';
    container.style.boxShadow = '0 16px 36px rgba(15,23,42,0.6)';
    container.style.fontFamily = "'Noto Sans JP', 'Segoe UI', system-ui, sans-serif";
    root.appendChild(container);

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.flexDirection = 'column';
    header.style.gap = '6px';
    const title = document.createElement('div');
    title.textContent = 'リーチ麻雀ライト';
    title.style.fontSize = '24px';
    title.style.fontWeight = '700';
    const subtitle = document.createElement('div');
    subtitle.textContent = 'シンプルな東風戦（1局）を3人のAIと対局。リーチ/ツモ/ロン対応。';
    subtitle.style.opacity = '0.8';
    subtitle.style.fontSize = '14px';
    header.appendChild(title);
    header.appendChild(subtitle);
    container.appendChild(header);

    const infoBar = document.createElement('div');
    infoBar.style.display = 'grid';
    infoBar.style.gridTemplateColumns = 'repeat(auto-fit,minmax(160px,1fr))';
    infoBar.style.gap = '8px';
    container.appendChild(infoBar);

    function createInfo(label){
      const wrap = document.createElement('div');
      wrap.style.background = 'rgba(15,23,42,0.7)';
      wrap.style.border = '1px solid rgba(148,163,184,0.3)';
      wrap.style.borderRadius = '10px';
      wrap.style.padding = '8px 12px';
      wrap.style.display = 'flex';
      wrap.style.flexDirection = 'column';
      wrap.style.gap = '4px';
      const lbl = document.createElement('div');
      lbl.textContent = label;
      lbl.style.fontSize = '12px';
      lbl.style.opacity = '0.65';
      const value = document.createElement('div');
      value.style.fontSize = '16px';
      value.style.fontWeight = '600';
      value.style.fontVariantNumeric = 'tabular-nums';
      wrap.appendChild(lbl);
      wrap.appendChild(value);
      infoBar.appendChild(wrap);
      return value;
    }

    const infoRound = createInfo('局情報');
    const infoDealer = createInfo('親');
    const infoDora = createInfo('ドラ');
    const infoRemaining = createInfo('山残り');
    const infoRiichiSticks = createInfo('リーチ棒');

    const scoreBoard = document.createElement('div');
    scoreBoard.style.display = 'grid';
    scoreBoard.style.gridTemplateColumns = 'repeat(auto-fit,minmax(180px,1fr))';
    scoreBoard.style.gap = '8px';
    container.appendChild(scoreBoard);

    const playerPanels = [];
    function createPlayerPanel(name){
      const panel = document.createElement('div');
      panel.style.background = 'rgba(15,23,42,0.6)';
      panel.style.border = '1px solid rgba(148,163,184,0.25)';
      panel.style.borderRadius = '12px';
      panel.style.padding = '10px 12px';
      panel.style.display = 'flex';
      panel.style.flexDirection = 'column';
      panel.style.gap = '4px';
      const nameEl = document.createElement('div');
      nameEl.textContent = name;
      nameEl.style.fontWeight = '600';
      nameEl.style.display = 'flex';
      nameEl.style.alignItems = 'center';
      nameEl.style.justifyContent = 'space-between';
      const statusEl = document.createElement('span');
      statusEl.style.fontSize = '12px';
      statusEl.style.opacity = '0.75';
      statusEl.textContent = '';
      nameEl.appendChild(statusEl);
      const scoreEl = document.createElement('div');
      scoreEl.style.fontSize = '20px';
      scoreEl.style.fontVariantNumeric = 'tabular-nums';
      const waitsEl = document.createElement('div');
      waitsEl.style.fontSize = '12px';
      waitsEl.style.opacity = '0.7';
      const discardsEl = document.createElement('div');
      discardsEl.style.display = 'flex';
      discardsEl.style.flexWrap = 'wrap';
      discardsEl.style.gap = '4px';
      discardsEl.style.fontSize = '12px';
      panel.appendChild(nameEl);
      panel.appendChild(scoreEl);
      panel.appendChild(waitsEl);
      panel.appendChild(discardsEl);
      scoreBoard.appendChild(panel);
      playerPanels.push({ panel, nameEl, statusEl, scoreEl, discardsEl, waitsEl });
    }

    createPlayerPanel('あなた (東)');
    createPlayerPanel('AI南');
    createPlayerPanel('AI西');
    createPlayerPanel('AI北');

    const tableArea = document.createElement('div');
    tableArea.style.background = 'radial-gradient(circle at center, rgba(30,64,175,0.35), rgba(15,23,42,0.85))';
    tableArea.style.border = '1px solid rgba(96,165,250,0.25)';
    tableArea.style.borderRadius = '18px';
    tableArea.style.padding = '18px';
    tableArea.style.display = 'flex';
    tableArea.style.flexDirection = 'column';
    tableArea.style.gap = '12px';
    container.appendChild(tableArea);

    const opponentRow = document.createElement('div');
    opponentRow.style.display = 'flex';
    opponentRow.style.justifyContent = 'space-between';
    opponentRow.style.gap = '16px';
    tableArea.appendChild(opponentRow);

    const opponentHands = [];
    for(let i=1;i<4;i++){
      const opp = document.createElement('div');
      opp.style.flex = '1';
      opp.style.background = 'rgba(15,23,42,0.6)';
      opp.style.borderRadius = '12px';
      opp.style.padding = '8px 10px';
      opp.style.display = 'flex';
      opp.style.flexDirection = 'column';
      opp.style.gap = '6px';
      const name = ['南','西','北'][i-1];
      const headerOpp = document.createElement('div');
      headerOpp.textContent = `AI${name}の手牌`; headerOpp.style.fontSize = '13px'; headerOpp.style.opacity = '0.75';
      const tileRow = document.createElement('div');
      tileRow.style.display = 'flex';
      tileRow.style.gap = '6px';
      tileRow.style.justifyContent = 'center';
      opp.appendChild(headerOpp);
      opp.appendChild(tileRow);
      opponentRow.appendChild(opp);
      opponentHands.push(tileRow);
    }

    const centerInfo = document.createElement('div');
    centerInfo.style.alignSelf = 'center';
    centerInfo.style.background = 'rgba(15,23,42,0.8)';
    centerInfo.style.padding = '12px 16px';
    centerInfo.style.borderRadius = '12px';
    centerInfo.style.border = '1px solid rgba(148,163,184,0.3)';
    centerInfo.style.display = 'flex';
    centerInfo.style.flexDirection = 'column';
    centerInfo.style.gap = '6px';
    const doraDisplay = document.createElement('div');
    doraDisplay.style.fontSize = '18px';
    doraDisplay.style.fontWeight = '600';
    const potDisplay = document.createElement('div');
    potDisplay.style.fontSize = '13px';
    potDisplay.style.opacity = '0.75';
    centerInfo.appendChild(doraDisplay);
    centerInfo.appendChild(potDisplay);
    tableArea.appendChild(centerInfo);

    const playerHandSection = document.createElement('div');
    playerHandSection.style.display = 'flex';
    playerHandSection.style.flexDirection = 'column';
    playerHandSection.style.gap = '10px';
    tableArea.appendChild(playerHandSection);

    const playerHandRow = document.createElement('div');
    playerHandRow.style.display = 'flex';
    playerHandRow.style.flexWrap = 'wrap';
    playerHandRow.style.justifyContent = 'center';
    playerHandRow.style.gap = '8px';
    playerHandSection.appendChild(playerHandRow);

    const actionRow = document.createElement('div');
    actionRow.style.display = 'flex';
    actionRow.style.flexWrap = 'wrap';
    actionRow.style.gap = '8px';
    actionRow.style.justifyContent = 'center';
    playerHandSection.appendChild(actionRow);

    function createButton(label){
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.style.padding = '8px 14px';
      btn.style.borderRadius = '999px';
      btn.style.border = '1px solid rgba(96,165,250,0.5)';
      btn.style.background = 'rgba(37,99,235,0.15)';
      btn.style.color = '#bfdbfe';
      btn.style.cursor = 'pointer';
      btn.style.fontSize = '14px';
      btn.style.transition = 'all 0.15s ease';
      btn.addEventListener('mouseenter', ()=>{ btn.style.background = 'rgba(59,130,246,0.3)'; });
      btn.addEventListener('mouseleave', ()=>{ btn.style.background = 'rgba(37,99,235,0.15)'; });
      return btn;
    }

    const btnTsumo = createButton('ツモ');
    const btnRon = createButton('ロン');
    const btnRiichi = createButton('リーチ');
    const btnCancel = createButton('キャンセル');
    actionRow.append(btnTsumo, btnRon, btnRiichi, btnCancel);

    const logArea = document.createElement('div');
    logArea.style.background = 'rgba(15,23,42,0.55)';
    logArea.style.border = '1px solid rgba(148,163,184,0.25)';
    logArea.style.borderRadius = '12px';
    logArea.style.padding = '10px 12px';
    logArea.style.height = '180px';
    logArea.style.overflowY = 'auto';
    logArea.style.fontSize = '13px';
    logArea.style.lineHeight = '1.5';
    container.appendChild(logArea);

    function log(message){
      const div = document.createElement('div');
      div.textContent = message;
      logArea.appendChild(div);
      logArea.scrollTop = logArea.scrollHeight;
      logBuffer.push(message);
      if (logBuffer.length > 200) logBuffer.shift();
    }

    const logBuffer = [];

    // --- Players ------------------------------------------------------------
    const seatWinds = ['E','S','W','N'];
    function seatWindIndex(playerIdx){
      const wind = seatWinds[playerIdx];
      return ['E','S','W','N'].indexOf(wind);
    }
    const roundWindIdx = 0; // East round only

    const players = [
      { name: 'あなた', seat: 'E', hand: [], discards: [], score: 25000, riichi: false, furiten: false, waitCache: [], lastDraw: null, autoRiichi: false },
      { name: 'AI南', seat: 'S', hand: [], discards: [], score: 25000, riichi: false, furiten: false, waitCache: [], lastDraw: null, autoRiichi: false },
      { name: 'AI西', seat: 'W', hand: [], discards: [], score: 25000, riichi: false, furiten: false, waitCache: [], lastDraw: null, autoRiichi: false },
      { name: 'AI北', seat: 'N', hand: [], discards: [], score: 25000, riichi: false, furiten: false, waitCache: [], lastDraw: null, autoRiichi: false }
    ];
    let dealerIndex = 0;

    let wall = [];
    let doraIndicators = [];
    let doraTiles = [];
    let currentTurn = 0;
    let phase = 'idle';
    let running = false;
    let riichiSticks = 0;
    let roundNumber = 1;
    let roundEnded = false;
    let forcedDiscardIndex = null;

    function tileDisplay(base){
      return TILE_LABEL[base] || base;
    }

    function renderOpponentHands(){
      for(let i=1;i<4;i++){
        const player = players[i];
        const row = opponentHands[i-1];
        row.innerHTML = '';
        const tileCount = player.hand.length;
        for(let j=0;j<tileCount;j++){
          const tile = document.createElement('div');
          tile.textContent = '🀫';
          tile.style.fontSize = '20px';
          tile.style.opacity = '0.8';
          row.appendChild(tile);
        }
      }
    }

    function renderDiscards(){
      players.forEach((player, idx)=>{
        const panel = playerPanels[idx];
        panel.discardsEl.innerHTML = '';
        player.discards.forEach(code => {
          const div = document.createElement('span');
          div.textContent = tileDisplay(baseOf(code));
          div.style.background = 'rgba(51,65,85,0.6)';
          div.style.padding = '2px 6px';
          div.style.borderRadius = '6px';
          panel.discardsEl.appendChild(div);
        });
        if (idx === 0){
          const waits = player.waitCache;
          if (waits && waits.length){
            panel.waitsEl.textContent = '待ち: ' + waits.map(idx => TILE_LABEL[TILE_ORDER[idx]]).join(' ');
          } else {
            panel.waitsEl.textContent = '';
          }
        } else {
          panel.waitsEl.textContent = '';
        }
      });
    }

    function renderScores(){
      players.forEach((player, idx)=>{
        const panel = playerPanels[idx];
        panel.scoreEl.textContent = `${player.score.toLocaleString()} 点`;
        const tags = [];
        if (idx === dealerIndex) tags.push('親');
        if (player.riichi) tags.push('立直');
        panel.statusEl.textContent = tags.join(' / ');
      });
      infoRound.textContent = `東${roundNumber}局`;
      infoDealer.textContent = `${players[dealerIndex].name}`;
      infoDora.textContent = doraTiles.map(idx => TILE_LABEL[TILE_ORDER[idx]]).join(' ');
      infoRemaining.textContent = `${wall.length}`;
      infoRiichiSticks.textContent = `${riichiSticks}`;
      doraDisplay.textContent = `ドラ: ${doraTiles.map(idx => TILE_LABEL[TILE_ORDER[idx]]).join(' ') || 'なし'}`;
      potDisplay.textContent = `供託:${riichiSticks * 1000}点 / 残り:${wall.length}`;
    }

    function renderPlayerHand(){
      playerHandRow.innerHTML = '';
      const player = players[0];
      const sorted = sortHand(player.hand.slice());
      player.hand = sorted;
      sorted.forEach((code, handIdx)=>{
        const base = baseOf(code);
        const btn = document.createElement('button');
        btn.textContent = tileDisplay(base);
        btn.style.padding = '10px 14px';
        btn.style.fontSize = '16px';
        btn.style.borderRadius = '10px';
        btn.style.border = '1px solid rgba(148,163,184,0.4)';
        btn.style.background = 'rgba(30,41,59,0.6)';
        btn.style.color = '#f8fafc';
        btn.style.cursor = 'pointer';
        btn.style.transition = 'all 0.15s ease';
        if (forcedDiscardIndex !== null && base !== forcedDiscardIndex){
          btn.disabled = true;
          btn.style.opacity = '0.6';
        }
        btn.addEventListener('mouseenter', ()=>{ if(!btn.disabled) btn.style.background = 'rgba(59,130,246,0.35)'; });
        btn.addEventListener('mouseleave', ()=>{ btn.style.background = 'rgba(30,41,59,0.6)'; });
        btn.addEventListener('click', ()=>{
          if (phase !== 'player_discard') return;
          performPlayerDiscard(code);
        });
        playerHandRow.appendChild(btn);
      });
    }

    function updateUI(){
      renderOpponentHands();
      renderPlayerHand();
      renderScores();
      renderDiscards();
    }

    function resetRound(){
      players.forEach(p => {
        p.hand = [];
        p.discards = [];
        p.riichi = false;
        p.furiten = false;
        p.waitCache = [];
        p.lastDraw = null;
        p.autoRiichi = false;
      });
      wall = createWall();
      doraIndicators = [wall.pop()];
      doraTiles = doraIndicators.map(ind => TILE_TO_INDEX[nextDora(baseOf(ind))]);
      forcedDiscardIndex = null;
      dealTiles();
      currentTurn = dealerIndex;
      phase = 'draw';
      roundEnded = false;
      log(`--- 東${roundNumber}局開始 親: ${players[dealerIndex].name} ---`);
      log(`ドラ表示牌: ${tileDisplay(baseOf(doraIndicators[0]))} → ドラ ${TILE_LABEL[TILE_ORDER[doraTiles[0]]]}`);
      updateUI();
      if (currentTurn === 0){
        schedulePlayerDraw();
      } else {
        setTimeout(aiTurn, 600);
      }
    }

    function dealTiles(){
      for(let r=0;r<3;r++){
        for(let p=0;p<4;p++){
          for(let c=0;c<4;c++){
            players[(dealerIndex + p) % 4].hand.push(wall.pop());
          }
        }
      }
      for(let p=0;p<4;p++){
        players[(dealerIndex + p) % 4].hand.push(wall.pop());
      }
      players[dealerIndex].hand.push(wall.pop());
      players.forEach(p => sortHand(p.hand));
    }

    function nextDora(base){
      const idx = TILE_TO_INDEX[base];
      if (isSuitTileIndex(idx)){
        const suit = suitForIndex(idx);
        const num = tileNumber(idx);
        const nextNum = num === 9 ? 1 : num + 1;
        return suit + nextNum;
      }
      const honorCycle = ['z1','z2','z3','z4','z5','z6','z7'];
      const pos = honorCycle.indexOf(base);
      return honorCycle[(pos + 1) % honorCycle.length];
    }

    function schedulePlayerDraw(){
      phase = 'player_draw';
      setTimeout(()=>{
        drawTileFor(0);
        evaluatePlayerState();
      }, 300);
    }

    function drawTileFor(idx){
      if (wall.length === 0){
        endInDraw('荒牌流局');
        return;
      }
      const tile = wall.pop();
      players[idx].hand.push(tile);
      players[idx].lastDraw = tile;
      sortHand(players[idx].hand);
      infoRemaining.textContent = `${wall.length}`;
      if (idx === 0){
        log(`自摸: ${tileDisplay(baseOf(tile))}`);
      }
      return tile;
    }

    function evaluatePlayerState(){
      const player = players[0];
      const tiles = player.hand.slice();
      const result = evaluateHand(tiles, {
        riichi: player.riichi,
        tsumo: true,
        seatWindIdx: seatWindIndex(0),
        roundWindIdx,
        doraTiles,
        isDealer: dealerIndex === 0
      });
      btnTsumo.disabled = !result;
      btnTsumo.onclick = ()=>{
        if (!result) return;
        handleWin(0, null, result, true);
      };

      const baseHand = player.hand.slice();
      if (player.lastDraw){
        const removeIdx = baseHand.indexOf(player.lastDraw);
        if (removeIdx !== -1){
          baseHand.splice(removeIdx, 1);
        }
      }
      const waits = listWaitTiles(baseHand);
      player.waitCache = waits;
      renderDiscards();

      const canRiichi = !player.riichi && player.score >= 1000 && waits.length > 0;
      btnRiichi.disabled = !(canRiichi);
      btnRiichi.onclick = ()=>{
        if (player.riichi) return;
        if (waits.length === 0) return;
        if (player.score < 1000){
          log('持ち点不足でリーチ不可');
          return;
        }
        player.riichi = true;
        player.autoRiichi = true;
        player.score -= 1000;
        riichiSticks += 1;
        forcedDiscardIndex = baseOf(player.lastDraw);
        log('リーチ宣言！場に1000点棒を供託');
        awardXp(25, 'リーチ宣言');
        updateUI();
        phase = 'player_discard';
      };

      forcedDiscardIndex = player.riichi ? baseOf(player.lastDraw) : null;
      btnRon.disabled = true;
      btnCancel.disabled = true;
      renderPlayerHand();
      phase = 'player_discard';
    }

    function performPlayerDiscard(tileCode){
      const player = players[0];
      const idx = player.hand.indexOf(tileCode);
      if (idx === -1) return;
      const [removed] = player.hand.splice(idx,1);
      player.discards.push(removed);
      log(`捨牌: ${tileDisplay(baseOf(removed))}`);
      renderPlayerHand();
      renderDiscards();
      phase = 'after_player_discard';
      forcedDiscardIndex = null;
      checkRonOnDiscard(0, removed, ()=>{
        advanceTurn();
      });
    }

    function checkRonOnDiscard(discarderIdx, tileCode, callback){
      const base = baseOf(tileCode);
      let claimed = false;
      let winnerIdx = null;
      let winResult = null;
      const tileIdx = TILE_TO_INDEX[base];
      const checkOrder = [1,2,3,0].map(offset => (discarderIdx + offset) % 4).filter(idx=>idx !== discarderIdx);
      function processNext(){
        if (!checkOrder.length){
          if (!claimed) callback();
          return;
        }
        const idx = checkOrder.shift();
        const player = players[idx];
        const hand = player.hand.slice();
        hand.push(`${base}-${(Math.random()*4)|0}`);
        const result = evaluateHand(hand, {
          riichi: player.riichi,
          tsumo: false,
          seatWindIdx: seatWindIndex(idx),
          roundWindIdx,
          doraTiles,
          isDealer: dealerIndex === idx
        });
        if (result){
          claimed = true;
          winnerIdx = idx;
          winResult = result;
          log(`${player.name} が ${tileDisplay(base)} でロン！`);
          awardXp(idx === 0 ? 200 : 100, 'ロン和了');
          handleWin(idx, discarderIdx, result, false);
        } else {
          processNext();
        }
      }
      processNext();
      if (!claimed){
        callback();
      }
    }

    function handleWin(winnerIdx, discarderIdx, result, tsumo){
      if (roundEnded) return;
      roundEnded = true;
      phase = 'round_end';
      const winner = players[winnerIdx];
      const description = describePoints(result, winnerIdx === dealerIndex, tsumo);
      log(`${winner.name} の和了！ ${result.han}翻 ${result.fu}符 ${description}`);
      log(`役: ${result.yaku.join(' / ')}`);
      const basePoints = result.points;
      if (tsumo){
        if (winnerIdx === dealerIndex){
          players.forEach((p, idx)=>{
            if (idx === winnerIdx) return;
            const pay = basePoints.tsumoDealer;
            p.score -= pay;
            winner.score += pay;
          });
        } else {
          players.forEach((p, idx)=>{
            if (idx === winnerIdx) return;
            if (idx === dealerIndex){
              const pay = basePoints.tsumoNonDealer.dealer;
              p.score -= pay;
              winner.score += pay;
            } else {
              const pay = basePoints.tsumoNonDealer.other;
              p.score -= pay;
              winner.score += pay;
            }
          });
        }
      } else {
        const loser = players[discarderIdx];
        const pay = basePoints.ron;
        loser.score -= pay;
        winner.score += pay;
      }
      if (riichiSticks > 0){
        const bonus = riichiSticks * 1000;
        winner.score += bonus;
        log(`リーチ棒 ${riichiSticks}本を獲得 (+${bonus}点)`);
        riichiSticks = 0;
      }
      renderScores();
      awardXp(winnerIdx === 0 ? 400 : 150, tsumo ? '自摸和了' : 'ロン和了');
      setTimeout(()=>{
        endGame();
      }, 2000);
    }

    function endInDraw(reason){
      if (roundEnded) return;
      log(`流局 (${reason})`);
      phase = 'round_end';
      roundEnded = true;
      const tenpaiPlayers = players.filter((p, idx)=>{
        const waits = listWaitTiles(p.hand.slice());
        if (waits.length > 0){
          p.waitCache = waits;
          return true;
        }
        return false;
      });
      if (tenpaiPlayers.length > 0){
        log(`テンパイ者: ${tenpaiPlayers.map(p=>p.name).join(', ')}`);
      } else {
        log('全員ノーテン');
      }
      const tenpaiCount = tenpaiPlayers.length;
      const notenCount = 4 - tenpaiCount;
      if (tenpaiCount > 0 && notenCount > 0){
        const notenPenalty = Math.floor(3000 / notenCount);
        const tenpaiReward = Math.floor(3000 / tenpaiCount);
        players.forEach(p => {
          if (p.waitCache && p.waitCache.length){
            p.score += tenpaiReward;
          } else {
            p.score -= notenPenalty;
          }
        });
        log('テンパイ料を分配');
      }
      renderScores();
      setTimeout(()=>{
        endGame();
      }, 2000);
    }

    function endGame(){
      running = false;
      phase = 'idle';
      const standings = players.map(p=>({ name: p.name, score: p.score })).sort((a,b)=>b.score-a.score);
      log(`最終結果: ${standings.map(s=>`${s.name} ${s.score}`).join(' / ')}`);
      awardXp(Math.max(50, Math.floor(players[0].score / 120)), '対局終了');
    }

    function advanceTurn(){
      currentTurn = (currentTurn + 1) % 4;
      if (currentTurn === 0){
        schedulePlayerDraw();
      } else {
        setTimeout(aiTurn, 600);
      }
    }

    function aiTurn(){
      if (phase === 'round_end' || roundEnded) return;
      const player = players[currentTurn];
      drawTileFor(currentTurn);
      const tiles = player.hand.slice();
      const result = evaluateHand(tiles, {
        riichi: player.riichi,
        tsumo: true,
        seatWindIdx: seatWindIndex(currentTurn),
        roundWindIdx,
        doraTiles,
        isDealer: dealerIndex === currentTurn
      });
      if (result){
        log(`${player.name} が自摸上がり！`);
        handleWin(currentTurn, null, result, true);
        return;
      }
      if (!player.riichi){
        const waits = listWaitTiles(player.hand.slice(0, player.hand.length-1));
        if (waits.length > 0 && player.score >= 1000){
          const willRiichi = diffIdx >= 1 ? Math.random() < (0.25 + diffIdx * 0.15) : false;
          if (willRiichi){
            player.riichi = true;
            player.autoRiichi = true;
            player.score -= 1000;
            riichiSticks += 1;
            log(`${player.name} がリーチ！`);
          }
        }
      }
      let discard = null;
      if (player.riichi){
        discard = player.lastDraw;
      } else {
        discard = chooseAiDiscard(player);
      }
      const idx = player.hand.indexOf(discard);
      player.hand.splice(idx,1);
      player.discards.push(discard);
      log(`${player.name} の捨牌: ${tileDisplay(baseOf(discard))}`);
      renderDiscards();
      checkRonOnDiscard(currentTurn, discard, ()=>{
        advanceTurn();
      });
    }

    function chooseAiDiscard(player){
      const hand = player.hand.slice();
      const counts = toCounts(hand);
      const tiles = hand.map(code => ({ code, idx: TILE_TO_INDEX[baseOf(code)] }));
      let worstTile = tiles[0];
      let worstScore = Infinity;
      tiles.forEach(tile => {
        const idx = tile.idx;
        counts[idx]--;
        const score = evaluateTileValue(counts);
        if (score < worstScore){
          worstScore = score;
          worstTile = tile;
        }
        counts[idx]++;
      });
      return worstTile.code;
    }

    function evaluateTileValue(counts){
      let value = 0;
      for(let i=0;i<counts.length;i++){
        const c = counts[i];
        if (c === 0) continue;
        value += c * c * 2;
        if (isSuitTileIndex(i)){
          const num = tileNumber(i);
          if (num > 1) value += counts[i-1] || 0;
          if (num < 9) value += counts[i+1] || 0;
          if (num > 2) value += (counts[i-2] || 0) * 0.5;
          if (num < 8) value += (counts[i+2] || 0) * 0.5;
        } else {
          value += c * 3;
        }
      }
      return value;
    }

    function start(){
      if (running) return;
      running = true;
      roundNumber = 1;
      riichiSticks = 0;
      resetRound();
    }

    function stop(){
      running = false;
    }

    function destroy(){
      stop();
      try { root.removeChild(container); } catch{}
    }

    function getScore(){
      return Math.max(0, players[0].score - 25000);
    }

    updateUI();

    return { start, stop, destroy, getScore };
  }

  window.registerMiniGame({
    id: 'riichi_mahjong',
    name: 'リーチ麻雀ライト', nameKey: 'selection.miniexp.games.riichi_mahjong.name',
    description: 'リーチとツモ/ロンを備えた簡易東風戦。AI 3人と1局勝負で点棒を競う本格寄り麻雀MOD。', descriptionKey: 'selection.miniexp.games.riichi_mahjong.description', categoryIds: ['board'],
    category: 'ボード',
    create
  });
})();

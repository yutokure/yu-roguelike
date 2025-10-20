/*
  Quick self-play benchmark for Ex-Othello pattern tuning.
  Usage:
    node tools/exothello-benchmark.js [--games 6] [--size 8] [--walls 0.12]
*/
const path = require('path');
const { __exothelloTestAPI: api } = require(path.join('..', 'games', 'exothello.js'));

// Seedable RNG to reduce variance across runs
function createLCG(seed) {
  let s = BigInt(seed) & 0xffffffffn;
  return function rand() {
    // Numerical Recipes LCG
    s = (1664525n * s + 1013904223n) & 0xffffffffn;
    return Number(s) / 0x100000000;
  };
}

function withSeed(seed, fn){
  const saved = Math.random;
  const rng = createLCG(seed);
  Math.random = rng;
  try { return fn(); } finally { Math.random = saved; }
}

function cloneBoard(board){
  return board.map(r => r.slice());
}

function playGame({ board, victory = 'most', diff = 'EASY', patternScaleA = 1.0, patternScaleB = 0.0, seed = 1 }){
  return withSeed(seed, () => {
    const { TUNING, legalMoves, applyMove, pickAIMove, countPieces } = api;
    const C = api.constants;
    let current = C.BLACK;
    let passStreak = 0;
    // Debug board size at start
    console.log('board size', board[0].length, board.length);
    while (true){
      const moves = legalMoves(board, current);
      if (moves.length === 0){
        passStreak++;
        if (passStreak >= 2) break;
        current = -current; // pass
        continue;
      }
      passStreak = 0;
      // Switch pattern tuning per side
      TUNING.enablePatterns = true;
      TUNING.patternScale = current === C.BLACK ? patternScaleA : patternScaleB;
      const mv = pickAIMove(board, null, victory, diff, current);
      if (!mv) { passStreak++; current = -current; continue; }
      applyMove(board, mv, current);
      current = -current;
      // Early exit if no empties
      const counts = countPieces(board);
      if (counts.empty <= 0) break;
      // Safety cap
      if ((counts.black + counts.white) > (board.length * board[0].length * 3)) break;
    }
    const counts = api.countPieces(board);
    // detect unknown cells
    let unknown = 0;
    for (let y=0;y<board.length;y++){
      for (let x=0;x<board[0].length;x++){
        const v = board[y][x];
        if (v !== C.EMPTY && v !== C.WALL && v !== C.BLACK && v !== C.WHITE) unknown++;
      }
    }
    if (unknown) console.log('unknown cells', unknown);
    console.log('final size', board[0].length, board.length);
    const margin = counts.black - counts.white;
    return { counts, margin };
  });
}

function buildBoard(type, width, height, wallRatio, seed){
  const { createBoard, placeStandardOpening, placeRandomWalls } = api;
  const C = api.constants;
  const board = createBoard(width, height, C.EMPTY);
  if (type === 'corner_walls'){
    board[0][0] = C.WALL;
    board[0][width-1] = C.WALL;
    board[height-1][0] = C.WALL;
    board[height-1][width-1] = C.WALL;
  } else if (type === 'random_walls'){
    withSeed(seed, () => placeRandomWalls(board, Math.floor(width * height * wallRatio)));
  }
  placeStandardOpening(board);
  return board;
}

async function main(){
  const args = process.argv.slice(2);
  const getArg = (name, def) => {
    const idx = args.indexOf(name);
    if (idx >= 0 && args[idx+1]) return args[idx+1];
    return def;
  };
  const games = parseInt(getArg('--games', process.env.FAST ? '1' : '4'), 10);
  const size = parseInt(getArg('--size', '8'), 10);
  const wallRatio = parseFloat(getArg('--walls', '0.12'));

  const scenarios = process.env.FAST
    ? [{ id: 'normal', build: () => buildBoard('normal', size, size, wallRatio, 7) }]
    : [
      { id: 'normal', build: () => buildBoard('normal', size, size, wallRatio, 7) },
      { id: 'corner_walls', build: () => buildBoard('corner_walls', size, size, wallRatio, 11) },
      { id: 'random_walls', build: () => buildBoard('random_walls', size, size, wallRatio, 13) },
    ];

  const scales = process.env.FAST ? [0.0, 1.0] : [0.0, 0.5, 1.0, 1.5];
  const results = [];
  for (const sc of scenarios){
    for (const scale of scales){
      let sumMargin = 0;
      let wins = 0;
      let losses = 0;
      for (let g = 0; g < games; g++){
        const board = sc.build();
        const res = playGame({ board, victory: 'most', diff: 'EASY', patternScaleA: scale, patternScaleB: 0.0, seed: 100 + g });
        console.log(`[dbg] ${sc.id} scale=${scale} g=${g} margin=${res.margin} counts=${JSON.stringify(res.counts)}`);
        sumMargin += res.margin;
        if (res.margin > 0) wins++; else if (res.margin < 0) losses++;
      }
      results.push({ scenario: sc.id, scale, wins, losses, avgMargin: (sumMargin / games).toFixed(2) });
    }
  }
  // Print table
  console.log('Ex-Othello Pattern Scale Benchmark (A = pattern scale, B = 0.0)');
  for (const r of results){
    console.log(`${r.scenario.padEnd(13)} | scale=${r.scale.toFixed(1)} | W:${r.wins} L:${r.losses} | avgMargin:${r.avgMargin}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });

// MiniExp manifest (JS) — file:// 対応版
// グローバルに配列を公開します。main.js 側がこれを読み込みます。
window.MINIEXP_MANIFEST = [
  { id: 'snake',       name: 'スネーク',        entry: 'games/snake.js',       version: '0.1.0', author: 'builtin', description: '餌を取ると+1EXP', category: 'アクション' },
  { id: 'othello',     name: 'オセロ',          entry: 'games/othello.js',     version: '0.1.0', author: 'builtin', description: 'ひっくり返し×0.5EXP＋勝利ボーナス', category: 'ボード' },
  { id: 'connect6',    name: 'コネクトシックス', entry: 'games/stone_board_games.js', version: '0.1.0', author: 'mod', description: '六目並べ。配置+1/リーチ+10/勝利で高EXP', category: 'ボード' },
  { id: 'gomoku',      name: '五目並べ',        entry: 'games/stone_board_games.js', version: '0.1.0', author: 'mod', description: '配置+1/リーチ+10/勝利ボーナス', category: 'ボード' },
  { id: 'connect4',    name: '四目並べ',        entry: 'games/stone_board_games.js', version: '0.1.0', author: 'mod', description: '落下式四目。配置+1/リーチ+10', category: 'ボード' },
  { id: 'tic_tac_toe', name: '三目並べ',        entry: 'games/stone_board_games.js', version: '0.1.0', author: 'mod', description: '配置+1/リーチ+10/シンプル勝利EXP', category: 'ボード' },
  { id: 'breakout',    name: 'ブロック崩し',    entry: 'games/breakout.js',    version: '0.1.0', author: 'builtin', description: 'ブロック破壊で+1EXP', category: 'アクション' },
  { id: 'breakout_k',  name: 'ブロック崩しk',  entry: 'games/breakout_keyboard.js', version: '0.1.0', author: 'builtin', description: 'バー操作はキーボード限定', category: 'アクション' },
  { id: 'pong',        name: 'ピンポン',        entry: 'games/pong.js',        version: '0.1.0', author: 'builtin', description: 'マッチ勝利で EASY+1 / NORMAL+5 / HARD+25', category: 'アクション' },
  { id: 'same',        name: 'セイムゲーム',    entry: 'games/same.js',        version: '0.1.0', author: 'builtin', description: '同色まとめ消し×0.5EXP', category: 'パズル' },
  { id: 'match3',      name: 'マッチ3',          entry: 'games/match3.js',      version: '0.1.0', author: 'builtin', description: '3:+1 / 4:+3 / 5:+10、連鎖×1.5', category: 'パズル' },
  { id: 'minesweeper', name: 'マインスイーパー', entry: 'games/minesweeper.js', version: '0.1.0', author: 'builtin', description: '開放×0.1 / クリア: 25/200/1600', category: 'パズル' },
  { id: 'ultimate_ttt', name: 'スーパー三目並べ', entry: 'games/ultimate_ttt.js', version: '0.1.0', author: 'mod', description: '小盤制覇+25/配置+1/リーチ+10/勝利ボーナス', category: 'ボード' },
  { id: 'sliding_puzzle', name: 'スライドパズル', entry: 'games/sliding_puzzle.js', version: '0.1.0', author: 'mod', description: '難易度で8/15/24のスライドパズル', category: 'パズル' },
  { id: 'invaders',    name: 'インベーダー風',    entry: 'games/invaders.js',   version: '0.1.0', author: 'builtin', description: '撃破+1 / 全滅+50', category: 'シューティング' },
  { id: 'pacman',      name: 'パックマン風',      entry: 'games/pacman.js',     version: '0.1.0', author: 'builtin', description: '餌+0.5 / 全取得+100', category: 'アクション' },
  { id: 'tetris',      name: 'テトリス風',        entry: 'games/tetris.js',     version: '0.1.0', author: 'builtin', description: 'REN×1.5^n / T-Spin', category: 'パズル' },
  { id: 'game2048',    name: '2048',             entry: 'games/2048.js',       version: '0.1.0', author: 'builtin', description: '合成log2 / 2048で+777', category: 'パズル' },
  // New mini-games (MOD)
  { id: 'aim',           name: '的あて（エイム）',     entry: 'games/aim.js',             version: '0.1.0', author: 'builtin', description: '命中で1〜3EXP／連続命中ボーナス', category: 'シューティング' },
  { id: 'dodge_race',    name: '回避レース',           entry: 'games/dodge_race.js',       version: '0.1.0', author: 'builtin', description: '距離で微量EXP／CP+5', category: 'アクション' },
  { id: 'falling_shooter', name: '落下ブロック・シューター', entry: 'games/falling_shooter.js', version: '0.1.0', author: 'builtin', description: '破壊で1〜数EXP（大きいほど高EXP）', category: 'シューティング' },
  { id: 'river_crossing', name: '川渡り',               entry: 'games/river_crossing.js',   version: '0.1.0', author: 'builtin', description: '1段前進+1／到達+50', category: 'アクション' },
  { id: 'whack_a_mole',  name: 'モグラたたき',         entry: 'games/whack_a_mole.js',     version: '0.1.0', author: 'builtin', description: '命中でEXP／連続命中ボーナス', category: 'アクション' },
  { id: 'flappy_bird',   name: 'フラッピーバード風',   entry: 'games/flappy_bird.js',      version: '0.1.0', author: 'mod', description: 'パイプ通過でEXP。連続成功でボーナス', category: 'アクション' },
  { id: 'dino_runner',   name: 'ダイノランナー',       entry: 'games/dino_runner.js',      version: '0.1.0', author: 'mod', description: '恐竜で障害物ジャンプ／距離EXP', category: 'アクション' },
  { id: 'ten_ten',       name: '1010パズル',           entry: 'games/ten_ten.js',          version: '0.1.0', author: 'builtin', description: 'ラインでEXP／クロス消しは倍増', category: 'パズル' }
];

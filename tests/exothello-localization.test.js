const assert = require('node:assert/strict');

require('../js/i18n/locales/ja.json.js');
require('../js/i18n/locales/en.json.js');

const locales = global.__i18nLocales || {};
const ja = locales.ja || {};
const en = locales.en || {};

assert.ok(ja, 'Japanese locale should load');
assert.ok(ja.selection?.miniexp?.games?.exothello, 'Selection metadata for Ex-Othello should exist');
assert.ok(ja.minigame?.exothello, 'Minigame translations for Ex-Othello should exist');
assert.ok(ja.miniexp?.games?.exothello, 'MiniExp translations for Ex-Othello should exist');

assert.ok(en, 'English locale should load');
assert.ok(en.minigame?.exothello, 'English minigame translations for Ex-Othello should exist');
assert.ok(en.miniexp?.games?.exothello, 'English MiniExp translations for Ex-Othello should be linked');

const exothello = ja.miniexp.games.exothello;
const exothelloEn = en.miniexp.games.exothello;

assert.equal(exothello.title, '拡張オセロ');
assert.equal(exothello.controls.start, 'ゲーム開始');
assert.equal(exothello.status.preparing, '盤面を準備中...');
assert.equal(exothello.result.win, '勝利！');
assert.equal(exothello.color.black, '黒');
assert.equal(exothello.turn.player, 'あなたの番');
assert.equal(exothello.sandbox.tool.wall, '壁');

assert.equal(exothelloEn.controls.start, 'Start Game');
assert.equal(exothelloEn.status.preparing, 'Preparing board...');
assert.equal(exothelloEn.result.win, 'You win!');
assert.equal(exothelloEn.turn.player, 'Your turn');

console.log('Ex-Othello Japanese localization is configured for MiniExp.');
console.log('Ex-Othello English localization is linked to MiniExp.');

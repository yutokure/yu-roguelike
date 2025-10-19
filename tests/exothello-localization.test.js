const assert = require('node:assert/strict');

require('../js/i18n/locales/ja.json.js');

const locales = global.__i18nLocales || {};
const ja = locales.ja || {};

assert.ok(ja, 'Japanese locale should load');
assert.ok(ja.selection?.miniexp?.games?.exothello, 'Selection metadata for Ex-Othello should exist');
assert.ok(ja.minigame?.exothello, 'Minigame translations for Ex-Othello should exist');
assert.ok(ja.miniexp?.games?.exothello, 'MiniExp translations for Ex-Othello should exist');

const exothello = ja.miniexp.games.exothello;

assert.equal(exothello.title, '拡張オセロ');
assert.equal(exothello.controls.start, 'ゲーム開始');
assert.equal(exothello.status.preparing, '盤面を準備中...');
assert.equal(exothello.result.win, '勝利！');
assert.equal(exothello.color.black, '黒');
assert.equal(exothello.turn.player, 'あなたの番');
assert.equal(exothello.sandbox.tool.wall, '壁');

console.log('Ex-Othello Japanese localization is configured for MiniExp.');

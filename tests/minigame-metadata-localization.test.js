const assert = require('node:assert/strict');

require('../js/i18n/locales/ja.json.js');
require('../js/i18n/locales/en.json.js');
require('../js/i18n/locales/zh.json.js');
require('../js/i18n/locales/ko.json.js');

const store = globalThis.__i18nLocales || {};

const TARGET_GAMES = [
  'riichi_mahjong',
  'connect6',
  'gomoku',
  'renju',
  'connect4',
  'tic_tac_toe'
];

const LOCALES = ['ja', 'en', 'zh', 'ko'];

function getMetadata(locale) {
  const localeData = store[locale] || {};
  return (
    localeData.selection &&
    localeData.selection.miniexp &&
    localeData.selection.miniexp.games
  ) || {};
}

for (const locale of LOCALES) {
  const games = getMetadata(locale);
  assert.ok(Object.keys(games).length > 0, `Locale ${locale} should provide mini-game metadata.`);
  for (const id of TARGET_GAMES) {
    const entry = games[id];
    assert.ok(entry, `Locale ${locale} should define metadata for ${id}.`);
    assert.equal(typeof entry.name, 'string', `Locale ${locale} metadata for ${id} must include a name string.`);
    assert.ok(entry.name.trim().length > 0, `Locale ${locale} metadata for ${id} should have a non-empty name.`);
    assert.equal(typeof entry.description, 'string', `Locale ${locale} metadata for ${id} must include a description string.`);
    assert.ok(entry.description.trim().length > 0, `Locale ${locale} metadata for ${id} should have a non-empty description.`);
  }
}

const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');

function createI18n(translations, initialLocale = 'ja') {
  let locale = initialLocale;
  const listeners = new Set();

  const format = (template, params) => {
    if (typeof template !== 'string') return template;
    if (!params) return template;
    return template.replace(/\{([^{}]+)\}/g, (match, key) => {
      const value = params[key];
      return value == null ? match : String(value);
    });
  };

  return {
    t(key, params) {
      const table = translations[locale] || {};
      const template = table[key];
      if (typeof template !== 'string') return key;
      return format(template, params);
    },
    onLocaleChanged(handler) {
      if (typeof handler !== 'function') return () => {};
      listeners.add(handler);
      return () => { listeners.delete(handler); };
    },
    getLocale() { return locale; },
    setLocale(nextLocale) {
      locale = nextLocale;
      listeners.forEach(listener => {
        try { listener(nextLocale); } catch (error) {
          console.warn('[test] listener error', error);
        }
      });
    }
  };
}

function setupLocalizationEnvironment(window) {
  const translations = {
    ja: {
      'games.bowlingDuel.title': 'ボウリング対決 MOD',
      'games.bowlingDuel.legend': 'ボタンを押して狙い→カーブ→パワーの順にゲージを止め、投球しよう！',
      'games.bowlingDuel.history.title': 'ログ',
      'games.bowlingDuel.history.placeholder': '---',
      'games.bowlingDuel.buttons.throw': '🎳 ボールを投げる',
      'games.bowlingDuel.scoreboard.you': 'あなた',
      'games.bowlingDuel.status.framePlayer': '第{frame}フレーム あなたの番です。'
    },
    en: {
      'games.bowlingDuel.title': 'Bowling Duel MOD',
      'games.bowlingDuel.legend': 'Press the button to stop the Aim → Curve → Power gauges in order and roll the ball!',
      'games.bowlingDuel.history.title': 'Log',
      'games.bowlingDuel.history.placeholder': '---',
      'games.bowlingDuel.buttons.throw': '🎳 Throw Ball',
      'games.bowlingDuel.scoreboard.you': 'You',
      'games.bowlingDuel.status.framePlayer': 'Frame {frame}: Your turn.'
    }
  };

  const I18n = createI18n(translations, 'ja');
  window.I18n = I18n;
  window.i18n = I18n;

  window.createMiniGameLocalization = function(def = {}) {
    const prefixes = [];
    const addPrefix = (value) => {
      if (!value) return;
      const normalized = String(value);
      if (!normalized) return;
      if (!prefixes.includes(normalized)) prefixes.push(normalized);
    };
    addPrefix(def.localizationKey);
    addPrefix(def.textKeyPrefix);
    if (def.id) {
      addPrefix(`minigame.${def.id}`);
      addPrefix(`miniexp.games.${def.id}`);
      addPrefix(`selection.miniexp.games.${def.id}`);
    }
    if (!prefixes.length) addPrefix('minigame');

    const listeners = new Set();
    const detach = I18n.onLocaleChanged(locale => {
      listeners.forEach(listener => {
        try { listener(locale); } catch (error) {
          console.warn('[test] helper listener error', error);
        }
      });
    });

    const buildCandidates = (key) => {
      if (!key) return prefixes.slice();
      const result = [];
      prefixes.forEach(prefix => {
        result.push(`${prefix}.${key}`);
      });
      result.push(key);
      return result;
    };

    return {
      t(key, fallback, params) {
        const candidates = buildCandidates(key);
        for (const candidate of candidates) {
          const translated = I18n.t(candidate, params);
          if (typeof translated === 'string' && translated !== candidate) {
            return translated;
          }
        }
        if (typeof fallback === 'function') return fallback();
        return fallback ?? '';
      },
      onChange(handler) {
        if (typeof handler !== 'function') return () => {};
        listeners.add(handler);
        return () => { listeners.delete(handler); };
      },
      destroy() {
        detach();
        listeners.clear();
      }
    };
  };

  return I18n;
}

async function main() {
  const dom = new JSDOM('<!doctype html><html><head></head><body><div id="root"></div></body></html>', { url: 'http://localhost' });
  const { window } = dom;
  global.window = window;
  global.document = window.document;
  global.HTMLElement = window.HTMLElement;
  global.Node = window.Node;
  global.navigator = window.navigator;
  global.getComputedStyle = window.getComputedStyle.bind(window);
  window.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16);
  window.cancelAnimationFrame = (id) => clearTimeout(id);

  const I18n = setupLocalizationEnvironment(window);

  let registeredGame = null;
  window.registerMiniGame = function(def) {
    registeredGame = def;
  };

  require('../games/bowling.js');
  assert(registeredGame, 'Bowling duel should register itself');

  const root = document.getElementById('root');
  const api = registeredGame.create(root, () => {}, {});

  await new Promise(resolve => setTimeout(resolve, 25));

  const title = root.querySelector('h2');
  assert.equal(title.textContent, 'ボウリング対決 MOD');

  const throwButton = root.querySelector('.controls button');
  assert.equal(throwButton.textContent, '🎳 ボールを投げる');

  const statusLine = root.querySelector('.status-line');
  assert.equal(statusLine.textContent, '第1フレーム あなたの番です。');

  const getHistoryTitle = () => {
    const el = root.querySelector('.history-log strong');
    return el ? el.textContent : null;
  };
  assert.equal(getHistoryTitle(), 'ログ');

  const playerLabel = root.querySelector('.player-label');
  assert.equal(playerLabel.textContent, 'あなた');

  I18n.setLocale('en');
  await new Promise(resolve => setTimeout(resolve, 25));

  assert.equal(title.textContent, 'Bowling Duel MOD');
  assert.equal(throwButton.textContent, '🎳 Throw Ball');
  assert.equal(statusLine.textContent, 'Frame 1: Your turn.');
  assert.equal(getHistoryTitle(), 'Log');
  assert.equal(playerLabel.textContent, 'You');

  api.destroy();
  await new Promise(resolve => setTimeout(resolve, 0));

  I18n.setLocale('ja');
  await new Promise(resolve => setTimeout(resolve, 0));
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});

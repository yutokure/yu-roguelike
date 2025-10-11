const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');

async function setupLocalization(window) {
  window.document.dispatchEvent = () => true;
  window.localStorage = {
    getItem() { return null; },
    setItem() {},
    removeItem() {}
  };

  window.globalThis = window;
  global.window = window;
  global.document = window.document;

  require('../js/i18n/locales/ja.json.js');
  require('../js/i18n/locales/en.json.js');
  require('../js/i18n/index.js');

  const I18n = window.I18n;
  await I18n.init('en');

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

    const buildCandidates = (key) => {
      if (!key) return prefixes.slice();
      const result = [];
      prefixes.forEach(prefix => {
        if (key.startsWith(prefix)) {
          result.push(key);
        } else if (key.startsWith('.')) {
          result.push(`${prefix}${key}`);
        } else {
          result.push(`${prefix}.${key}`);
        }
      });
      if (!result.includes(key)) result.push(key);
      return result;
    };

    const listeners = new Set();
    const detach = I18n.onLocaleChanged(locale => {
      listeners.forEach(listener => {
        try {
          listener(locale);
        } catch (error) {
          console.warn('[test] helper listener error', error);
        }
      });
    });

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
        return () => listeners.delete(handler);
      },
      formatNumber(value) {
        try {
          return I18n.formatNumber(value, { maximumFractionDigits: 1, minimumFractionDigits: 1 });
        } catch (error) {
          return typeof value === 'number' ? value.toLocaleString('en-US', { maximumFractionDigits: 1, minimumFractionDigits: 1 }) : String(value ?? '');
        }
      },
      getLocale() { return I18n.getLocale(); },
      destroy() {
        detach();
        listeners.clear();
      }
    };
  };

  return I18n;
}

function createStubStage(window, tileSize = 32) {
  const width = 12;
  const height = 9;
  const tiles = Array.from({ length: height }, () => Array(width).fill(0));

  const toIndex = (x, y) => `${x},${y}`;

  const pickFloor = (excludeSet = new Set()) => {
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const id = toIndex(x, y);
        if (!excludeSet.has(id)) {
          excludeSet.add(id);
          return { x, y };
        }
      }
    }
    return { x: 2, y: 2 };
  };

  return {
    width,
    height,
    tileSize,
    tiles,
    pickFloorPositions(count, { exclude } = {}) {
      const excludeSet = new Set((exclude || []).map(pos => toIndex(pos.x, pos.y)));
      const result = [];
      for (let i = 0; i < count; i++) {
        result.push(pickFloor(excludeSet));
      }
      return result;
    },
    pickFloorPosition({ exclude } = {}) {
      const excludeSet = new Set((exclude || []).map(pos => toIndex(pos.x, pos.y)));
      return pickFloor(excludeSet);
    },
    tileCenter(x, y) {
      return { x: x * tileSize + tileSize / 2, y: y * tileSize + tileSize / 2 };
    },
    clampPosition(x, y) {
      const minX = tileSize;
      const minY = tileSize;
      const maxX = (width - 1) * tileSize;
      const maxY = (height - 1) * tileSize;
      return {
        x: Math.min(Math.max(x, minX), maxX),
        y: Math.min(Math.max(y, minY), maxY)
      };
    },
    collidesCircle() { return false; },
    createCamera({ viewTilesX, viewTilesY }) {
      const cameraWidth = viewTilesX * tileSize;
      const cameraHeight = viewTilesY * tileSize;
      let centerX = cameraWidth / 2;
      let centerY = cameraHeight / 2;

      return {
        width: cameraWidth,
        height: cameraHeight,
        setCenter(x, y) {
          centerX = x;
          centerY = y;
        },
        getBounds() {
          return {
            x: centerX - cameraWidth / 2,
            y: centerY - cameraHeight / 2,
            width: cameraWidth,
            height: cameraHeight
          };
        },
        contains() { return true; },
        project(x, y) {
          const bounds = this.getBounds();
          return { x: x - bounds.x, y: y - bounds.y };
        }
      };
    }
  };
}

function setupCanvas(window) {
  window.HTMLCanvasElement.prototype.getContext = function() {
    return {
      clearRect() {},
      drawImage() {},
      fillRect() {},
      strokeRect() {},
      beginPath() {},
      arc() {},
      fill() {},
      stroke() {},
      set fillStyle(value) { this._fillStyle = value; },
      get fillStyle() { return this._fillStyle; },
      set strokeStyle(value) { this._strokeStyle = value; },
      get strokeStyle() { return this._strokeStyle; },
      set lineWidth(value) { this._lineWidth = value; },
      get lineWidth() { return this._lineWidth; }
    };
  };
}

async function main() {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost' });
  const { window } = dom;
  global.window = window;
  global.document = window.document;
  global.HTMLElement = window.HTMLElement;
  global.Node = window.Node;
  global.navigator = window.navigator;
  setupCanvas(window);

  window.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16);
  window.cancelAnimationFrame = (id) => clearTimeout(id);
  global.requestAnimationFrame = window.requestAnimationFrame;
  global.cancelAnimationFrame = window.cancelAnimationFrame;

  const I18n = await setupLocalization(window);

  let registeredGame = null;
  window.registerMiniGame = function(def) {
    registeredGame = def;
  };

  require('../games/tosochu.js');
  assert(registeredGame, 'tosochu should register itself');

  const root = document.getElementById('root');
  const stage = createStubStage(window);
  const backgroundCanvas = document.createElement('canvas');
  backgroundCanvas.width = stage.width * stage.tileSize;
  backgroundCanvas.height = stage.height * stage.tileSize;

  const dungeonApi = {
    async generateStage() {
      return stage;
    },
    renderStage() {
      return { canvas: backgroundCanvas };
    }
  };

  const api = registeredGame.create(root, () => {}, { dungeon: dungeonApi, locale: 'en' });
  assert(api, 'create should return control API');

  await new Promise(resolve => setTimeout(resolve, 50));

  const spans = root.querySelectorAll('.mini-tosochu div span');
  assert.equal(spans.length >= 3, true, 'should render timer, exp, and status labels');
  const [timerLabel, expLabel, statusLabel] = spans;
  assert.equal(timerLabel.textContent, 'Time Left 180.0s');
  assert.equal(expLabel.textContent, 'Stored EXP 0.0');
  assert.equal(statusLabel.textContent, 'Standby');

  const missionPanel = root.querySelector('.mini-tosochu > div:nth-child(2)');
  assert(missionPanel, 'mission panel should exist');
  assert.equal(missionPanel.textContent, 'Mission: Not yet activated');

  const surrenderButton = root.querySelector('.mini-tosochu button');
  assert(surrenderButton, 'surrender button should exist');
  assert.equal(surrenderButton.textContent, 'Surrender');

  api.destroy();
  await new Promise(resolve => setTimeout(resolve, 0));

  I18n.setLocale('ja');
  await new Promise(resolve => setTimeout(resolve, 0));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

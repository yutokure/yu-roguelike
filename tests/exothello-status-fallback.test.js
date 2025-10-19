const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');

const { create } = require('../games/exothello.js');

const dom = new JSDOM('<!DOCTYPE html><div id="root"></div>', {
  url: 'http://localhost/',
  pretendToBeVisual: true
});

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.Option = dom.window.Option;
const originalGetContext = dom.window.HTMLCanvasElement.prototype.getContext;
dom.window.HTMLCanvasElement.prototype.getContext = () => ({
  clearRect() {},
  fillRect() {},
  beginPath() {},
  moveTo() {},
  lineTo() {},
  stroke() {},
  arc() {},
  fill() {},
  save() {},
  restore() {}
});

try {
  const root = document.getElementById('root');
  const instance = create(root, () => {}, { localization: null });
  const statusBox = root.querySelector('.exothello-status');
  const selects = Array.from(root.querySelectorAll('select.exothello-input'));
  const modeSelect = selects[0];

  const expectStatus = (modeId, expected) => {
    modeSelect.value = modeId;
    modeSelect.dispatchEvent(new window.Event('change', { bubbles: true }));
    assert.equal(statusBox.textContent, expected, `Status text should describe ${modeId}`);
  };

  expectStatus('normal', 'Classic Othello rules on a flexible board size.');
  expectStatus('corner_walls', 'Corner squares are locked as walls, reshaping opening play.');
  expectStatus('least', 'Aim for the fewest discs to win instead of the most.');
  expectStatus('river64', 'Fight along a 64×32 river channel carved through solid walls.');
  expectStatus('dungeon', 'Battle through a procedurally carved dungeon of rooms and corridors.');

  if (instance && typeof instance.destroy === 'function'){
    instance.destroy();
  }
} finally {
  delete global.window;
  delete global.document;
  delete global.navigator;
  delete global.Option;
  if (originalGetContext){
    dom.window.HTMLCanvasElement.prototype.getContext = originalGetContext;
  } else {
    delete dom.window.HTMLCanvasElement.prototype.getContext;
  }
}

console.log('Ex-Othello status fallback text is displayed without localization.');

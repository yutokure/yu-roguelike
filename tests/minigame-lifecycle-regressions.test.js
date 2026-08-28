const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

function createCanvasContext(tracker){
  return new Proxy({}, {
    get(target, property){
      if (property === 'measureText') return () => ({ width: 0 });
      if (property === 'createLinearGradient' || property === 'createRadialGradient'){
        return () => ({ addColorStop() {} });
      }
      if (typeof property === 'string'){
        return (...args) => {
          if (property === 'clearRect' && tracker) tracker.clearRect += 1;
        };
      }
      return undefined;
    },
    set(){
      return true;
    }
  });
}

function setupDom(tracker = { clearRect: 0 }){
  const dom = new JSDOM('<!doctype html><div id="root"></div>', {
    url: 'http://localhost/',
    pretendToBeVisual: true
  });
  const context = createCanvasContext(tracker);
  dom.window.HTMLCanvasElement.prototype.getContext = () => context;

  let nextAnimationFrameId = 1;
  const animationTimers = new Map();
  const requestAnimationFrame = callback => {
    const id = nextAnimationFrameId++;
    const timer = setTimeout(() => {
      animationTimers.delete(id);
      callback(Date.now());
    }, 0);
    animationTimers.set(id, timer);
    return id;
  };
  const cancelAnimationFrame = id => {
    const timer = animationTimers.get(id);
    if (timer !== undefined) clearTimeout(timer);
    animationTimers.delete(id);
  };

  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;
  global.Option = dom.window.Option;
  global.requestAnimationFrame = requestAnimationFrame;
  global.cancelAnimationFrame = cancelAnimationFrame;
  dom.window.requestAnimationFrame = requestAnimationFrame;
  dom.window.cancelAnimationFrame = cancelAnimationFrame;

  return { dom, tracker };
}

function cleanupDom(dom){
  dom.window.close();
  delete global.window;
  delete global.document;
  delete global.navigator;
  delete global.Option;
  delete global.requestAnimationFrame;
  delete global.cancelAnimationFrame;
}

function loadRegisteredDefinition(relativePath){
  let definition = null;
  window.registerMiniGame = value => {
    definition = value;
  };
  const absolutePath = path.resolve(__dirname, '..', relativePath);
  delete require.cache[absolutePath];
  const moduleExports = require(absolutePath);
  assert.ok(definition, `${relativePath} should register a mini-game definition`);
  return { definition, moduleExports };
}

function wait(ms){
  return new Promise(resolve => setTimeout(resolve, ms));
}

function testColorSortPauseResume(){
  const { dom } = setupDom();
  let runtime = null;
  try {
    const { definition } = loadRegisteredDefinition('games/color_sort.js');
    const root = document.getElementById('root');
    runtime = definition.create(root, () => {}, { difficulty: 'NORMAL', shortcuts: {} });
    const buttons = Array.from(root.querySelectorAll('button[data-index]'));
    const source = buttons.find(button => Array.from(button.children).some(child => child.style.background));
    const target = buttons.find(button => !Array.from(button.children).some(child => child.style.background));
    assert.ok(source, 'Color Sort should have a non-empty source tube');
    assert.ok(target, 'Color Sort should have an empty target tube');

    source.click();
    const targetIndex = target.dataset.index;
    root.querySelector(`button[data-index="${targetIndex}"]`).click();
    assert.equal(runtime.getScore().moves, 1, 'Color Sort should record the valid pour');

    runtime.stop();
    runtime.start();
    assert.equal(runtime.getScore().moves, 1, 'Color Sort resume should preserve the current round');
  } finally {
    if (runtime) runtime.destroy();
    cleanupDom(dom);
  }
}

async function testOthelloStopCancelsAi(relativePath){
  const { dom } = setupDom();
  let runtime = null;
  try {
    const { definition } = loadRegisteredDefinition(relativePath);
    const root = document.getElementById('root');
    runtime = definition.create(root, () => {}, { difficulty: 'NORMAL', localization: null });
    runtime.start();
    const canvas = root.querySelector('canvas');
    const beforeMove = runtime.getScore();
    canvas.dispatchEvent(new window.MouseEvent('click', {
      bubbles: true,
      clientX: 150,
      clientY: 210
    }));
    const afterMove = runtime.getScore();
    assert.notEqual(afterMove, beforeMove, `${relativePath} should accept a legal opening move`);

    runtime.stop();
    await wait(180);
    assert.equal(
      runtime.getScore(),
      afterMove,
      `${relativePath} should not apply a delayed AI move after stop`
    );
  } finally {
    if (runtime) runtime.destroy();
    cleanupDom(dom);
  }
}

async function testCheckersStopCancelsAi(){
  const tracker = { clearRect: 0 };
  const { dom } = setupDom(tracker);
  let runtime = null;
  try {
    const { definition } = loadRegisteredDefinition('games/checkers.js');
    const root = document.getElementById('root');
    runtime = definition.create(root, () => {}, { difficulty: 'NORMAL', localization: null });
    runtime.start();
    const canvas = root.querySelector('canvas');
    canvas.dispatchEvent(new window.MouseEvent('click', {
      bubbles: true,
      clientX: 30,
      clientY: 370
    }));
    canvas.dispatchEvent(new window.MouseEvent('click', {
      bubbles: true,
      clientX: 90,
      clientY: 310
    }));
    assert.ok(tracker.clearRect >= 3, 'Checkers should render the move before scheduling the AI');

    const drawsAtStop = tracker.clearRect;
    runtime.stop();
    await wait(240);
    assert.equal(tracker.clearRect, drawsAtStop, 'Checkers AI should not render after stop');
  } finally {
    if (runtime) runtime.destroy();
    cleanupDom(dom);
  }
}

function testExOthelloLifecycleApi(){
  const { dom } = setupDom();
  let runtime = null;
  try {
    const { definition } = loadRegisteredDefinition('games/exothello.js');
    const root = document.getElementById('root');
    runtime = definition.create(root, () => {}, { localization: null });
    assert.equal(typeof runtime.start, 'function', 'Ex-Othello should expose start for the host');
    assert.equal(typeof runtime.stop, 'function', 'Ex-Othello should expose stop for the host');
    runtime.start();
    runtime.stop();
    runtime.destroy();
    runtime = null;
    assert.equal(root.children.length, 0, 'Ex-Othello destroy should remove its UI');
  } finally {
    if (runtime) runtime.destroy();
    cleanupDom(dom);
  }
}

function testChineseDrawLabels(){
  const localePath = path.resolve(__dirname, '..', 'js/i18n/locales/zh.json.js');
  delete require.cache[localePath];
  require(localePath);
  const zh = global.__i18nLocales?.zh;
  assert.equal(zh?.minigame?.othello?.overlay?.result?.draw, '平局');
  assert.equal(zh?.minigame?.othello_weak?.overlay?.result?.draw, '平局');
}

function testSnakeFullBoardGuard(){
  const source = fs.readFileSync(path.resolve(__dirname, '..', 'games/snake.js'), 'utf8');
  assert.doesNotMatch(source, /while\s*\(\s*true\s*\)/, 'Snake food placement must be finite');
  assert.match(
    source,
    /if\s*\(!food\)\s*\{\s*resetRound\(\);\s*draw\(\);\s*return;/s,
    'Snake should safely reset when no food cell remains'
  );
}

(async () => {
  testColorSortPauseResume();
  await testOthelloStopCancelsAi('games/othello.js');
  await testOthelloStopCancelsAi('games/othello_weak.js');
  await testCheckersStopCancelsAi();
  testExOthelloLifecycleApi();
  testChineseDrawLabels();
  testSnakeFullBoardGuard();
  console.log('Mini-game lifecycle and edge-case regressions passed.');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

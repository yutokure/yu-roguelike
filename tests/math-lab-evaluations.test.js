const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');

function setupMathLab() {
  const dom = new JSDOM('<!doctype html><body></body></html>', { url: 'http://localhost/' });
  global.window = dom.window;
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;
  window.MathJax = {
    tex2chtmlPromise: () => Promise.resolve(),
    startup: { promise: Promise.resolve() },
    tex: { inlineMath: [] },
    chtml: {},
    svg: {}
  };
  let registered = null;
  window.registerMiniGame = (config) => { registered = config; };
  window.math = require('../libs/math.js');
  require('../games/math_lab.js');
  assert.ok(registered, 'math_lab should register itself as a mini-game');
  registered.create(document.body, () => {}, {});
}

function findButton(label) {
  return Array.from(document.querySelectorAll('button')).find((btn) => btn.textContent.includes(label));
}

function getResultElements() {
  const containers = Array.from(document.querySelectorAll('[data-raw-value]'));
  const approx = containers.find((div) => div.style.fontFamily?.includes('Fira Code'));
  const exact = containers.find((div) => div.style.fontFamily?.includes('Noto Sans Math'));
  return { approx, exact };
}

async function evaluateExpression(expr) {
  const textarea = document.querySelector('textarea');
  textarea.value = expr;
  const evalBtn = findButton('計算');
  assert.ok(evalBtn, 'Evaluate button should exist');
  evalBtn.click();
  for (let i = 0; i < 5; i++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
    const results = getResultElements();
    if (results.approx?.dataset?.rawValue && results.exact?.dataset?.rawValue) {
      return results;
    }
  }
  return getResultElements();
}

(async () => {
  setupMathLab();
  await new Promise((resolve) => setTimeout(resolve, 0));

  const integral = await evaluateExpression('numericIntegrate(sin(x), x, 0, pi)');
  assert.ok(integral.exact && integral.approx, 'Result elements should exist for integral');
  const integralApprox = parseFloat(integral.approx.dataset.rawValue);
  assert.ok(Number.isFinite(integralApprox), 'Integral approximation should be numeric');
  assert.ok(Math.abs(integralApprox - 2) < 1e-6, 'Integral should evaluate close to 2');

  const equation = await evaluateExpression('solveEq(sin(x)=0.5, x, 1)');
  assert.ok(equation.exact && equation.approx, 'Result elements should exist for solveEq');
  const equationApprox = parseFloat(equation.approx.dataset.rawValue);
  assert.ok(Number.isFinite(equationApprox), 'Equation approximation should be numeric');
  assert.ok(Math.abs(equationApprox - Math.PI / 6) < 1e-6, 'Equation root should be close to π/6');
})();

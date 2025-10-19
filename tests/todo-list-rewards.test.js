const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');

function setupEnvironment(){
  delete require.cache[require.resolve('../games/todo_list.js')];
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://example.com' });
  const { window } = dom;
  global.window = window;
  global.document = window.document;
  global.navigator = window.navigator;
  global.localStorage = window.localStorage;
  const crypto = window.crypto || {};
  if (typeof crypto.getRandomValues !== 'function'){
    crypto.getRandomValues = (array) => {
      for (let i = 0; i < array.length; i += 1){
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    };
  }
  if (typeof crypto.randomUUID !== 'function'){
    let counter = 0;
    crypto.randomUUID = () => {
      counter += 1;
      return `00000000-0000-4000-8000-${counter.toString().padStart(12, '0')}`;
    };
  }
  window.crypto = crypto;
  global.crypto = crypto;

  if (typeof window.requestAnimationFrame !== 'function'){
    window.requestAnimationFrame = (callback) => setTimeout(() => callback(Date.now()), 16);
  }
  if (typeof window.cancelAnimationFrame !== 'function'){
    window.cancelAnimationFrame = (id) => clearTimeout(id);
  }
  global.requestAnimationFrame = window.requestAnimationFrame.bind(window);
  global.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);

  window.registerMiniGame = (definition) => {
    global.__todoListCreate = definition.create;
  };

  require('../games/todo_list.js');
  const create = global.__todoListCreate;
  delete global.__todoListCreate;
  assert.equal(typeof create, 'function', 'Mini game should register create function');

  window.localStorage.clear();

  const root = document.createElement('div');
  document.body.appendChild(root);

  const awardXpCalls = [];
  const awardXp = (amount, meta) => {
    awardXpCalls.push({ amount, meta });
    return amount + 1;
  };

  const playerCalls = {
    adjustSp: [],
    awardItems: [],
    adjustItems: [],
    awardPassiveOrb: []
  };

  const playerApi = {
    adjustSp(amount, meta){
      playerCalls.adjustSp.push({ amount, meta });
    },
    awardItems(items, opts){
      playerCalls.awardItems.push({ items: { ...items }, opts: { ...opts } });
    },
    adjustItems(items, opts){
      playerCalls.adjustItems.push({ items: { ...items }, opts: { ...opts } });
    },
    awardPassiveOrb(orbId, amount, meta){
      playerCalls.awardPassiveOrb.push({ orbId, amount, meta });
    }
  };

  const runtime = create(root, awardXp, { player: playerApi });

  const cleanup = () => {
    try {
      runtime.destroy();
    } catch {}
    if (root.parentNode){
      root.parentNode.removeChild(root);
    }
    dom.window.close();
    delete global.window;
    delete global.document;
    delete global.navigator;
    delete global.localStorage;
    delete global.crypto;
    delete global.requestAnimationFrame;
    delete global.cancelAnimationFrame;
  };

  return { runtime, dom, awardXpCalls, playerCalls, cleanup };
}

function withRandomSequence(sequence, fn){
  const values = Array.isArray(sequence) ? sequence.slice() : [];
  const originalRandom = Math.random;
  let index = 0;
  Math.random = () => {
    const fallback = values.length ? values[values.length - 1] : 0;
    const value = index < values.length ? values[index] : fallback;
    index += 1;
    return typeof value === 'number' ? value : fallback;
  };
  try {
    return fn();
  } finally {
    Math.random = originalRandom;
  }
}

// Test reward resolution logic, including random ranges and loot tables.
(() => {
  const env = setupEnvironment();
  const { runtime, awardXpCalls, playerCalls, cleanup } = env;
  try {
    const utils = runtime.__test;
    assert.ok(utils, 'Test utilities should be exposed');

    const task = {
      xp: 12,
      xpRange: { enabled: true, min: 10, max: 20 },
      rewards: {
        sp: { enabled: true, amount: 7, range: { enabled: true, min: 5, max: 10 } },
        items: {
          enabled: true,
          entries: [
            { key: 'item_a', amount: 3, range: { enabled: true, min: 2, max: 5 } },
            { key: 'item_b', amount: -2 }
          ],
          lootTable: {
            enabled: true,
            dropChance: 40,
            entries: [
              { key: 'loot_low', amount: 1, weight: 1 },
              { key: 'loot_high', amount: 2, weight: 3, range: { enabled: true, min: 1, max: 3 } }
            ]
          }
        },
        passiveOrbs: {
          enabled: true,
          entries: [
            { orbId: 'orb_a', amount: -1, range: { enabled: true, min: -3, max: -1 } }
          ]
        }
      }
    };

    const sequence = [0.5, 0.75, 0.6, 0.5, 0.3, 0.8, 0.9];
    const result = withRandomSequence(sequence, () => utils.applyTaskRewards(task, { type: 'test' }));

    assert.equal(awardXpCalls.length, 1, 'awardXp should be called exactly once');
    assert.equal(awardXpCalls[0].amount, 15, 'awardXp should receive resolved XP amount');
    assert.equal(result.xp, 16, 'Result XP should reflect awardXp return value');

    assert.equal(playerCalls.adjustSp.length, 1, 'adjustSp should be invoked for SP rewards');
    assert.equal(playerCalls.adjustSp[0].amount, 9, 'SP reward should resolve to random value inside range');
    assert.equal(result.sp, 9, 'Result should include resolved SP amount');

    assert.equal(playerCalls.awardItems.length, 1, 'awardItems should be called for positive item rewards');
    assert.deepEqual(playerCalls.awardItems[0].items, { item_a: 4, loot_high: 3 });
    assert.equal(playerCalls.awardItems[0].opts.allowNegative, false);

    assert.equal(playerCalls.adjustItems.length, 1, 'adjustItems should be used for negative item adjustments');
    assert.deepEqual(playerCalls.adjustItems[0].items, { item_b: -2 });
    assert.equal(playerCalls.adjustItems[0].opts.allowNegative, true);

    assert.equal(playerCalls.awardPassiveOrb.length, 1, 'Passive orb rewards should be processed');
    assert.deepEqual(playerCalls.awardPassiveOrb[0], {
      orbId: 'orb_a',
      amount: -2,
      meta: { source: 'test' }
    });

    assert.deepEqual(result.items.gained, [
      { key: 'item_a', amount: 4 },
      { key: 'loot_high', amount: 3 }
    ]);
    assert.deepEqual(result.items.removed, [
      { key: 'item_b', amount: 2 }
    ]);
    assert.deepEqual(result.passiveOrbs.removed, [
      { orbId: 'orb_a', amount: 2 }
    ]);

    assert.equal(result.loot.enabled, true, 'Loot table should be marked enabled');
    assert.equal(result.loot.attempted, true, 'Loot table should note attempt');
    assert.equal(result.loot.dropped, true, 'Loot table should mark successful drop');
    assert.deepEqual(result.loot.entry, { key: 'loot_high', amount: 3 });
    assert.equal(result.loot.dropChance, 40);
  } finally {
    cleanup();
  }
})();

// Ensure translation node tracking stays consistent when entries are added/removed.
(() => {
  const env = setupEnvironment();
  const { runtime, cleanup } = env;
  try {
    const utils = runtime.__test;
    const baseline = utils.getTranslationNodeCounts();

    const passiveEntry = utils.addPassiveEntry();
    let counts = utils.getTranslationNodeCounts();
    assert.equal(counts.randomRangeToggle, baseline.randomRangeToggle + 1);
    passiveEntry.removeBtn.click();
    counts = utils.getTranslationNodeCounts();
    assert.deepEqual(counts, baseline, 'Removing passive entry should restore baseline translation nodes');

    const itemEntry = utils.addItemEntry();
    counts = utils.getTranslationNodeCounts();
    assert.equal(counts.randomRangeToggle, baseline.randomRangeToggle + 1);
    itemEntry.removeBtn.click();
    counts = utils.getTranslationNodeCounts();
    assert.deepEqual(counts, baseline, 'Removing item entry should restore baseline translation nodes');

    const lootEntry = utils.addLootEntry();
    counts = utils.getTranslationNodeCounts();
    assert.equal(counts.randomRangeToggle, baseline.randomRangeToggle + 1);
    assert.equal(counts.lootWeight, baseline.lootWeight + 1);
    lootEntry.removeBtn.click();
    counts = utils.getTranslationNodeCounts();
    assert.deepEqual(counts, baseline, 'Removing loot entry should restore baseline translation nodes');
  } finally {
    cleanup();
  }
})();

// Validate loot input sanitization behaviour.
(() => {
  const env = setupEnvironment();
  const { runtime, cleanup } = env;
  try {
    const utils = runtime.__test;
    const lootChanceInput = utils.getLootChanceInput();

    lootChanceInput.value = '150';
    lootChanceInput.dispatchEvent(new window.Event('change', { bubbles: true }));
    assert.equal(lootChanceInput.value, '100');

    lootChanceInput.value = '-5';
    lootChanceInput.dispatchEvent(new window.Event('change', { bubbles: true }));
    assert.equal(lootChanceInput.value, '0');

    lootChanceInput.value = '12.3456';
    lootChanceInput.dispatchEvent(new window.Event('change', { bubbles: true }));
    assert.equal(lootChanceInput.value, '12.35');

    const lootEntry = utils.addLootEntry();
    const weightInput = lootEntry.weightInput;
    const maxWeight = utils.constants.MAX_REWARD_WEIGHT;

    weightInput.value = '0';
    weightInput.dispatchEvent(new window.Event('change', { bubbles: true }));
    assert.equal(weightInput.value, '1');

    weightInput.value = '0.2';
    weightInput.dispatchEvent(new window.Event('change', { bubbles: true }));
    assert.equal(weightInput.value, '1');

    weightInput.value = String(maxWeight * 10);
    weightInput.dispatchEvent(new window.Event('change', { bubbles: true }));
    assert.equal(weightInput.value, String(maxWeight));

    lootEntry.removeBtn.click();
  } finally {
    cleanup();
  }
})();

console.log('todo-list reward tests passed');

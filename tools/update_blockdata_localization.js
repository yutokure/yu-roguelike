const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..');
const jsonPath = path.join(BASE_DIR, 'blockdata.json');
const jsPath = path.join(BASE_DIR, 'blockdata.js');

function ensureNameKey(block) {
  if (!block || typeof block !== 'object') return;
  if (!block.key || typeof block.key !== 'string') return;
  if (block.nameKey) return;
  block.nameKey = `dungeon.blockdim.blocks.${block.key}.name`;
  if (block.description && !block.descriptionKey) {
    block.descriptionKey = `dungeon.blockdim.blocks.${block.key}.description`;
  } else if (!block.description) {
    delete block.descriptionKey;
  }
}

function process() {
  const raw = fs.readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(raw);
  Object.keys(data).forEach(section => {
    if (!/^blocks\d+$/i.test(section)) return;
    const list = data[section];
    if (Array.isArray(list)) list.forEach(ensureNameKey);
  });
  const jsonString = JSON.stringify(data, null, 2);
  fs.writeFileSync(jsonPath, jsonString + '\n', 'utf8');

  const jsRaw = fs.readFileSync(jsPath, 'utf8');
  const match = jsRaw.match(/window.__BLOCKDATA\s*=\s*(\{[\s\S]*\})\s*;?\s*$/);
  if (!match) throw new Error('Failed to parse blockdata.js');
  const jsData = JSON.parse(match[1]);
  Object.keys(jsData).forEach(section => {
    if (!/^blocks\d+$/i.test(section)) return;
    const list = jsData[section];
    if (Array.isArray(list)) list.forEach(ensureNameKey);
  });
  const jsString = `window.__BLOCKDATA =\n${JSON.stringify(jsData, null, 2)};\n`;
  fs.writeFileSync(jsPath, jsString, 'utf8');
}

if (require.main === module) {
  process();
}

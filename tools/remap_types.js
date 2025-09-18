#!/usr/bin/env node
// Reassign all block `type` fields across blocks1/2/3 in blockdata.json and blockdata.js
// to a balanced, deterministic random distribution covering all supported types.
// Notes:
// - Excludes 'mixed' from the pool to avoid recursive generation.
// - Includes 'maze', 'grid', 'open-space', 'circle-rooms' (supported by main.js).
// - Uses a fixed seed for reproducibility across files.

const fs = require('fs');
const path = require('path');
const USER_SEED = (process.argv[2] || '').trim();

const JSON_PATH = path.resolve(process.cwd(), 'blockdata.json');
const JS_PATH = path.resolve(process.cwd(), 'blockdata.js');

const TYPES = [
  'field', 'cave', 'maze', 'rooms', 'single-room', 'circle',
  'narrow-maze', 'wide-maze', 'snake', 'grid', 'open-space', 'circle-rooms'
];

// Deterministic PRNG (Mulberry32)
function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function seedFrom(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function seededShuffle(arr, rng) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function assignBalancedTypes(blocks, seedText) {
  const seed = seedFrom((USER_SEED ? USER_SEED + '|' : '') + seedText + ':' + blocks.length);
  const rng = mulberry32(seed);
  // Stable order by key to keep deterministic mapping
  const sorted = blocks.map((b, i) => ({i, key: String(b.key || ''), b}))
                      .sort((a,b)=> a.key.localeCompare(b.key));
  const n = sorted.length;
  const t = TYPES.length;
  const base = Math.floor(n / t);
  let remainder = n % t;
  const R = [...TYPES];
  seededShuffle(R, rng);
  const bucket = [];
  for (const type of TYPES) for (let k = 0; k < base; k++) bucket.push(type);
  for (let k = 0; k < remainder; k++) bucket.push(R[k]);
  // Final randomization of assignment order (but deterministic)
  seededShuffle(bucket, rng);
  // Apply back in sorted order
  for (let idx = 0; idx < n; idx++) {
    sorted[idx].b.type = bucket[idx];
  }
  // Restore original order
  const out = new Array(n);
  for (const {i,b} of sorted) out[i] = b;
  return out;
}

function processJSON() {
  const raw = fs.readFileSync(JSON_PATH, 'utf-8');
  const data = JSON.parse(raw);
  for (const name of ['blocks1','blocks2','blocks3']) {
    if (!Array.isArray(data[name])) continue;
    data[name] = assignBalancedTypes(data[name], 'json:' + name);
  }
  fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2), 'utf-8');
  return data;
}

function processJS() {
  const raw = fs.readFileSync(JS_PATH, 'utf-8');
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) throw new Error('Failed to locate JSON in blockdata.js');
  const jsonText = raw.slice(start, end + 1);
  const data = JSON.parse(jsonText);
  for (const name of ['blocks1','blocks2','blocks3']) {
    if (!Array.isArray(data[name])) continue;
    data[name] = assignBalancedTypes(data[name], 'js:' + name);
  }
  const newJs = raw.slice(0, start) + JSON.stringify(data, null, 2) + raw.slice(end + 1);
  fs.writeFileSync(JS_PATH, newJs, 'utf-8');
  return data;
}

function countTypes(data) {
  const byArr = {};
  for (const name of ['blocks1','blocks2','blocks3']) {
    const c = {};
    for (const t of TYPES) c[t] = 0;
    for (const e of (data[name] || [])) {
      if (TYPES.includes(e.type)) c[e.type]++;
    }
    byArr[name] = c;
  }
  return byArr;
}

function fmtCounts(counts) {
  const lines = [];
  for (const name of ['blocks1','blocks2','blocks3']) {
    const c = counts[name];
    const parts = Object.entries(c).map(([k,v])=>`${k}:${v}`).join(', ');
    lines.push(`${name}: ${parts}`);
  }
  return lines.join('\n');
}

try {
  // Optional custom seed via CLI arg to produce a different mapping on demand
  const userSeed = (process.argv[2] || '').trim();
  if (userSeed) {
    // monkey-patch seedFrom to incorporate userSeed without rewiring code above
    const origSeedFrom = seedFrom;
    global.seedFrom = (s) => origSeedFrom(userSeed + '|' + s);
  }
  const outJson = processJSON();
  const outJs = processJS();
  console.log('Remapped types in blockdata.json and blockdata.js');
  if (userSeed) console.log('Seed:', userSeed);
  console.log('JSON counts:\n' + fmtCounts(countTypes(outJson)));
  console.log('JS   counts:\n' + fmtCounts(countTypes(outJs)));
} catch (e) {
  console.error('Failed:', e);
  process.exit(1);
}

const fs = require('fs');
const path = require('path');

const dataPath = '/tmp/dungeon_locale.json';
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

function toTitle(str) {
  return str
    .replace(/[_\-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function hasNonAscii(str) {
  return /[^\x00-\x7F]/.test(str);
}

const tagJaDict = {
  abyss: '深淵',
  agriculture: '農耕',
  ambient: '環境',
  ancient: '古代',
  arcane: '秘儀',
  archaeology: '考古',
  archive: '書庫',
  arena: '闘技場',
  astral: '星界',
  autumn: '秋季',
  bamboo: '竹林',
  beach: '海岸',
  bio: '生体',
  bioluminescent: '生物発光',
  biome: 'バイオーム',
  bomb: '爆裂',
  bridge: '橋梁',
  canal: '運河',
  castle: '城塞',
  catacomb: '地下墓地',
  cave: '洞窟',
  cavern: '大洞窟',
  celestial: '天界',
  ceremonial: '儀礼',
  ceremony: '式典',
  circular: '円環',
  city: '都市',
  cloister: '回廊',
  corridor: '廊下',
  crescent: '三日月',
  crypt: '石棺',
  crystal: '水晶',
  dark: '暗黒',
  decay: '腐敗',
  defense: '防衛',
  desert: '砂漠',
  dragon: '竜',
  dynamic: '動態',
  engineered: '機構',
  erosion: '侵食',
  festival: '祭典',
  field: '平原',
  fixed: '固定',
  floating: '浮遊',
  forest: '森林',
  forge: '鍛造',
  fortress: '要塞',
  future: '未来',
  futuristic: '近未来',
  gallery: '画廊',
  garden: '庭園',
  grand: '壮大',
  graveyard: '墓地',
  grid: '格子',
  haunted: '幽霊',
  hazard: '危険',
  heat: '熱源',
  hologram: 'ホログラム',
  holy: '聖域',
  horror: 'ホラー',
  ice: '氷結',
  imperial: '帝国',
  industrial: '工業',
  lab: '研究室',
  labyrinth: '迷宮',
  lantern: '提灯',
  lava: '溶岩',
  layered: '層構造',
  library: '図書館',
  light: '光輝',
  maintenance: '保守',
  market: '市場',
  maze: '迷路',
  mechanical: '機械',
  medieval: '中世',
  mirage: '蜃気楼',
  mist: '霧',
  modular: 'モジュール',
  mystery: '謎',
  mystic: '神秘',
  nature: '自然',
  network: 'ネットワーク',
  night: '夜間',
  open: '開放',
  'open-space': '開空間',
  organic: '有機',
  outdoor: '屋外',
  overworld: '地上',
  pavilion: '楼閣',
  pit: '坑',
  poison: '毒',
  pulse: '脈動',
  puzzle: 'パズル',
  quantum: '量子',
  radial: '放射',
  reef: '珊瑚礁',
  research: '研究',
  resonance: '共鳴',
  retro: 'レトロ',
  ring: 'リング',
  rings: '多重環',
  ritual: '儀式',
  rooms: '部屋群',
  royal: '王侯',
  ruins: '廃墟',
  rural: '田園',
  sacred: '聖堂',
  sanctuary: '聖域',
  serpentine: '蛇行',
  sf: 'SF',
  single: '単間',
  sky: '天空',
  snake: '蛇行通路',
  spiral: '螺旋',
  stage: '舞台',
  storm: '嵐',
  stream: '水流',
  structure: '構造',
  structured: '構築',
  swamp: '湿地',
  symmetric: '対称',
  symmetry: 'シンメトリー',
  tea: '茶庭',
  temple: '神殿',
  terrace: '段丘',
  theater: '劇場',
  tiered: '層段',
  transport: '輸送',
  trap: '罠',
  underground: '地下',
  undersea: '海底',
  urban: '都市',
  vertical: '垂直',
  void: '虚空',
  water: '水域',
  wind: '風' 
};

function buildLocale(locale) {
  const result = { packs: {}, types: {}, badges: {}, blockdim: { blocks: {} } };
  for (const [key, pack] of Object.entries(data.packs)) {
    const name = locale === 'ja' ? pack.name : hasNonAscii(pack.name) ? toTitle(pack.id) : pack.name;
    result.packs[key] = { name };
    if (pack.description) result.packs[key].description = pack.description;
  }

  for (const [key, type] of Object.entries(data.types)) {
    const name = locale === 'ja'
      ? (type.name || toTitle(type.id))
      : (!type.name || hasNonAscii(type.name) ? toTitle(type.id) : type.name);
    const typeEntry = { name };
    if (type.description) typeEntry.description = type.description;
    if (Object.keys(type.blocks).length) {
      typeEntry.blocks = {};
      for (const [blockKey, block] of Object.entries(type.blocks)) {
        const blockName = block.name;
        const blockEntry = { name: blockName };
        if (block.description) blockEntry.description = block.description;
        typeEntry.blocks[blockKey] = blockEntry;
      }
    }
    if (type.tags && type.tags.length) {
      typeEntry.badges = type.tags;
    }
    result.types[key] = typeEntry;
  }

  data.tags.forEach(tag => {
    const labelEn = toTitle(tag);
    result.badges[tag] = locale === 'ja' ? (tagJaDict[tag] || labelEn) : labelEn;
  });

  for (const [key, block] of Object.entries(data.blockDim)) {
    const blockEntry = { name: block.name };
    if (block.description) blockEntry.description = block.description;
    result.blockdim.blocks[key] = blockEntry;
  }

  return result;
}

const enLocale = buildLocale('en');
const jaLocale = buildLocale('ja');

fs.writeFileSync('/tmp/dungeon_locale_en.json', JSON.stringify(enLocale, null, 2));
fs.writeFileSync('/tmp/dungeon_locale_ja.json', JSON.stringify(jaLocale, null, 2));

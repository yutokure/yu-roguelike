# ダンジョン生成追加API書（DungeonType/BlockDim MOD v1）

本書は「ダンジョン生成タイプ」と「ブロック次元の追加ブロック」を一体的に拡張するためのMOD APIの設計です。`dungeontypes/` フォルダに置いた JS モジュールを動的に読み込み、
- 生成アルゴリズム（=新しいダンジョンタイプ）を追加
- BlockDim 用のブロック（1st/2nd/3rd）や次元リストを追加
- 追加タイプを Normal の混合型・BlockDim の混合型へ重み付きで参加
を可能にします。

対象バージョン: 2025-09-15 時点の `main.js` 実装（BlockDim/ミニゲームMOD実装済み）

---

## 1. 目的と方針
- 目的: ユーザーが JS 1ファイルで「新しい地形生成」と「それを指すブロック」を同梱し、すぐ使えること。
- 互換: 既存の通常ワールド、BlockDim UI、セーブ/ロードとは非破壊で併存。
- 実行: `file://` でも動くよう、`manifest.json.js`（JSマニフェスト）を基本とし、必要に応じて `<script>` フォールバックを許可。
- セキュリティ: ローカルJSを実行するため信頼前提（外部配布は自己責任）。

---

## 2. ディレクトリ構成
```
/ (プロジェクトルート)
├─ index.html
├─ main.js
├─ dungeontypes/
│  ├─ manifest.json.js        // 追加MODの一覧（推奨, file://対応のJSマニフェスト）
│  ├─ lava_caves.js           // 例: 生成＋ブロック定義を含む1ファイル
│  ├─ ring_rooms.js           // 例: 複数置ける
│  └─ autoload.js             // file: フォールバック用（任意）
```

JSマニフェスト（`manifest.json.js`）が基本です。HTTP環境かつCORSが許す場合のみJSON版をオプションとして扱っても構いません（後述）。

---

## 3. ホストが提供するレジストリとローダ（設計）
ホスト（`main.js` 側）が以下を用意します。

### 3.1 グローバル登録関数
```js
// 追加JSが呼ぶ
window.registerDungeonAddon(def: DungeonAddon): void;
```
- 登録は複数回可。`id` が重複した場合は末尾の登録で上書き（警告ログ）。

### 3.2 レジストリ（設計）
```ts
// 生成タイプレジストリ
Map<string, DungeonGeneratorDef> DungeonGenRegistry; // key = genTypeId

// BlockDim 追加テーブル（起動時に blockdata.json を読み込み後、追記）
interface BlockTables {
  dimensions: Dimension[]; // a..z に追加も可
  blocks1: BlockSpec[];
  blocks2: BlockSpec[];
  blocks3: BlockSpec[];
}
```
- 生成タイプは `generateMap()` → `switch(genType)` の分岐に先立ち、汎用フックで呼べる形にする（詳細は§7）。
- BlockDim テーブルは `loadBlockDataOnce()` 完了後にマージし、UIを再構築。

### 3.3 ロード手順（推奨）
1) 起動時に `loadBlockDataOnce()` を実行
2) `loadDungeonAddons()` を呼び、以下の順で試行
   - まず `<script src="dungeontypes/manifest.json.js">` を挿入し、`window.DUNGEONTYPE_MANIFEST` の配列を取得
   - `DUNGEONTYPE_MANIFEST` の各 `entry` を `<script>` で逐次読み込み
   - 失敗時: `location.protocol==='file:'` かつマニフェストが無い場合は `dungeontypes/autoload.js` を読み込む（任意）
   - さらにHTTP環境ではオプションで `fetch('dungeontypes/manifest.json')` にフォールバック可
3) エントリJSが `window.registerDungeonAddon(def)` を呼ぶ
4) ホストが `def.blocks` を BlockDim テーブルへマージ、`def.generators` を `DungeonGenRegistry` へ登録
5) BlockDim UI を再構築（必要なら）

---

## 4. 型定義（論理）
TypeScript 風の論理定義です。実装はプレーンJSでOK。

```ts
type ChestBias = 'less' | 'normal' | 'more';

/** BlockDim のブロック（1st/2nd/3rd 用）。`ブロック次元の設計.md` 準拠 */
interface BlockSpec {
  key: string;              // 一意キー（英数・ハイフン）
  name?: string;            // 表示名（任意）
  level?: number;           // 推奨Lv補正（±）
  size?: number;            // マップサイズ係数（-2..+2）
  depth?: number;           // 深さ補正（±）
  chest?: ChestBias;        // 宝箱バイアス
  type?: string | null;     // ダンジョンタイプ（= genTypeId）。null なら無指定
  bossFloors?: number[];    // 指定階にボス（1..depth）
  // 拡張:
  weight?: number;          // Weightedランダム用（UIの「重み付きランダム」向け）
}

interface Dimension { key:string; name?:string; baseLevel:number }

/** ダンジョン生成アルゴリズム */
interface DungeonGeneratorDef {
  id: string;               // 例: 'lava-caves'
  name?: string;            // 表示名
  description?: string;
  // 生成アルゴリズム本体。ctx.map を壁(1)/床(0)で直接書き換えるか、2次元配列を返しても良い。
  algorithm: (ctx: GenContext) => void | number[][];
  // 混合型への参加設定
  mixin?: {
    normalMixed?: number;   // Normal の 'mixed' に出現する確率重み（0 なら不参加）
    blockDimMixed?: number; // BlockDim の 'mixed' へ（typePool 未指定時や許可時）
    tags?: string[];        // 例: ['maze','organic']。今後のフィルタ用
  };
}

interface GenContext {
  width: number; height: number;
  map: number[][];          // 1=壁, 0=床（外周は後で壁に固定される）
  random: () => number;     // 0..1（BlockDimではシード固定）。Math.random 互換
  inBounds(x:number,y:number): boolean; // 外周(1,1)-(w-2,h-2) を推奨
  set(x:number,y:number,v:0|1): void;   // map[y][x]=v の糖衣
  get(x:number,y:number): 0|1;          // map[y][x]
  ensureConnectivity(): void;           // 連結性の確保（ホスト実装に委譲）
  carvePath(path:{x:number,y:number}[], width?:number): void; // 掘削ユーティリティ
  aStar(start:{x:number,y:number}, goal:{x:number,y:number}, opts?:AStarOpts): {x:number,y:number}[];
  setFloorColor(x:number,y:number,color:string): void; // 床カラー（CSSカラー文字列）
  setWallColor(x:number,y:number,color:string): void;  // 壁カラー（CSSカラー文字列）
  setFloorType(x:number,y:number,type:'normal'|'ice'|'poison'): void; // 床の特性
  clearTileMeta(x:number,y:number): void; // カラー/特性の初期化
  getTileMeta(x:number,y:number): { floorColor?:string; wallColor?:string; floorType?:string } | null;
}
```

- `floorType` の意味
  - `'normal'` : 従来の床
  - `'ice'`    : プレイヤーが進入すると同じ方向に滑走し、非氷床か障害物で停止
  - `'poison'` : 通過するたびにプレイヤーが最大HPの10%（最低1）ダメージ
- `setFloorColor` / `setWallColor` を省略した場合はデフォルト色（床: `#ced6e0`, 壁: `#2f3542`）が使用されます。`floorType` が `ice`/`poison` の場合は未指定でも視認しやすい補助色が自動適用されます。

---

## 5. MOD 定義オブジェクト
MOD は 1 つ以上のブロック追加と、0 個以上の生成タイプを含められます。

```ts
interface DungeonAddon {
  id: string;                       // 一意
  name?: string;
  version?: string;                 // '1.0.0' など
  author?: string;
  description?: string;
  api?: string;                     // 互換のため '1' / '1.x' など

  // BlockDim のテーブル拡張
  blocks?: {
    dimensions?: Dimension[];       // 追加次元（任意）
    blocks1?: BlockSpec[];
    blocks2?: BlockSpec[];
    blocks3?: BlockSpec[];
  };

  // 生成タイプの追加
  generators?: DungeonGeneratorDef[];
}
```

登録は JS 内で以下のように行います。
```js
window.registerDungeonAddon({ id:'lava_pack', blocks:{ /*...*/ }, generators:[ /*...*/ ] });
```

---

## 6. 例: Lava Caves（最小）
`dungeontypes/lava_caves.js`
```js
(function(){
  const gen = {
    id: 'lava-caves',
    name: 'Lava Caves',
    description: '溶岩地形。ウォーカー + 軽い平滑化',
    algorithm(ctx){
      const { width:W, height:H, map, random, set, inBounds, ensureConnectivity } = ctx;
      // 1) 全壁はホスト側で初期化済み。内部をドランカーで掘削
      const area = (W-2)*(H-2);
      const target = Math.floor(area*0.42);
      let dug = 0;
      let x = 1+Math.floor(random()*(W-2));
      let y = 1+Math.floor(random()*(H-2));
      while (dug < target) {
        if (inBounds(x,y) && map[y][x]===1) { set(x,y,0); dug++; }
        // 少し曲がりやすいランダムウォーク
        const r = random();
        if (r < 0.25) x++; else if (r < 0.5) x--; else if (r < 0.75) y++; else y--;
        if (x<1) x=1; if (x>W-2) x=W-2; if (y<1) y=1; if (y>H-2) y=H-2;
      }
      ensureConnectivity();
    },
    mixin: { normalMixed: 0.6, blockDimMixed: 0.7, tags:['cave'] }
  };

  // BlockDim へ 1st/2nd/3rd を追加（type に上の id を指定）
  const blocks = {
    blocks1: [ { key:'lava_theme', name:'Lava Theme', level:+10, size:0, depth:+1, chest:'less', type:'lava-caves', bossFloors:[10] } ],
    blocks2: [ { key:'basalt',     name:'Basalt',     level:+15, size:+1, depth: 0, chest:'normal', type:'lava-caves' } ],
    blocks3: [ { key:'magma',      name:'Magma',      level:  0, size: 0, depth:+2, chest:'more',   type:'lava-caves', bossFloors:[5,15] } ]
  };

  window.registerDungeonAddon({ id:'lava_pack', name:'Lava Pack', version:'1.0.0', blocks, generators:[gen] });
})();
```

`dungeontypes/manifest.json.js`
```js
// グローバルに配列を公開（MiniExpの `MINIEXP_MANIFEST` と同様の方式）
window.DUNGEONTYPE_MANIFEST = [
  { id: 'lava_pack', name: 'Lava Pack', entry: 'dungeontypes/lava_caves.js', version: '1.0.0', author: 'you' }
];
```

---

## 7. ホスト側フック設計（実装指針）
実装は段階導入が可能です。最小では「登録→ BlockDim へブロック追記」「登録→ mixed 抽選に参加」から始め、次に「新タイプの直接選択」を対応します。

### 7.1 ローダ
```js
async function loadDungeonAddons(){
  // 1) すでにJSマニフェストが存在するなら採用
  let manifest = Array.isArray(window.DUNGEONTYPE_MANIFEST) ? window.DUNGEONTYPE_MANIFEST : null;
  // 2) 無ければ <script> で manifest.json.js を読み込む（file://対応）
  if (!manifest) {
    try {
      await injectScript('dungeontypes/manifest.json.js');
      if (Array.isArray(window.DUNGEONTYPE_MANIFEST)) manifest = window.DUNGEONTYPE_MANIFEST;
    } catch {}
  }
  // 3) HTTP環境ならJSONフォールバック（任意）
  if (!manifest) {
    try {
      const res = await fetch('dungeontypes/manifest.json', { cache:'no-store' });
      if (res.ok) manifest = await res.json();
    } catch {}
  }
  // 4) 最後のフォールバック: autoload.js（任意）
  if (!manifest) {
    try { await injectScript('dungeontypes/autoload.js'); } catch {}
    return;
  }
  // 5) 各entryを読み込む
  for (const m of manifest) {
    if (m && m.entry) await injectScript(m.entry);
  }
}
function injectScript(src){
  return new Promise((ok, ng)=>{ const s=document.createElement('script'); s.src=src; s.onload=ok; s.onerror=ng; document.head.appendChild(s); });
}

// 受け口
const __addons = new Map();
window.registerDungeonAddon = function(def){
  if (!def || !def.id) return console.error('addon id が必須');
  __addons.set(def.id, def);
  // 生成タイプ登録
  for (const g of (def.generators||[])) DungeonGenRegistry.set(g.id, g);
  // BlockDim テーブルへ追記（読み込み済みなら即時、未読なら一時キュー）
  mergeBlocksIntoTables(def.blocks);
  // mixed 参加重みは DungeonGenRegistry 側の g.mixin から参照
  console.log('[addon registered]', def.id);
};
```

### 7.2 `generateMap()` への統合
- 既存の `switch(genType)` 前に「アドオン定義に一致するか」を見る：
```js
if (DungeonGenRegistry.has(genType)) {
  runAddonGenerator(genType); // 外周壁固定や安全フォールバックは既存と同じ
  return finalizeMap();
}
```
- `mixed` の場合、従来ロジックの抽選に「アドオン生成タイプ」を混ぜる：
  - Normal: `g.mixin?.normalMixed>0` のタイプをプールに加える
  - BlockDim: `spec.typePool` が空/未指定の場合のみ `g.mixin?.blockDimMixed>0` をプールに加える（`typePool` 指定時はそれを優先）

### 7.3 生成コンテキストの提供
```js
function runAddonGenerator(id){
  const g = DungeonGenRegistry.get(id);
  const ctx = makeGenContext(); // map/random/inBounds/set/get/ensureConnectivity/aStar/carvePath を束ねる
  // map は既定で全壁(1)初期化済み
  const out = g.algorithm(ctx);
  if (Array.isArray(out)) map = out; // 返却型にも対応
  // 外周は常に壁
  fixBorders();
  ensureMinimumFloors(10);
}
```

---

## 8. BlockDim への反映ルール
- `def.blocks.dimensions` があれば `blockDimTables.dimensions` 末尾に追加（key 重複は上書き）。
- `blocks1/2/3` は各配列の末尾に追加。`key` 重複は上書き。
- UI の「重み付きランダム」は `weight` を優先（なければ既定=1）。
- `composeSpec()` は既存どおり（`typePool` = 3ブロックの `type` 和集合）。アドオンの `type` はそのまま `genTypeId` として扱われる。

---

## 9. エラーハンドリング/ガード
- 例外はアドオン内で握るのが望ましいが、ホスト側でも try/catch で保護。
- `algorithm()` 実行後に床タイル数が閾値未満なら `ensureMinimumFloors()` を適用（既存と同等）。
- 重複IDは `console.warn` を出しつつ上書き。
- 互換性: `api` が将来増えた場合は `api` を比較して警告（例: `api.startsWith('1')` 以外はウォーニング）。

---

## 10. 開発Tips
- 反復速度重視: `file:` 実行でも `autoload.js` で `<script>` 読み込み可能。
- デバッグ: `console.log` で `ctx.map` のカウントや経路を出す。生成時間が長い場合は `performance.now()` で計測。
- 乱数: BlockDim では階層ごとにシード固定済み（`Math.random` が差し換わる）。Normal は既定乱数。
- パフォーマンス: 大型マップでは `for` ループと整数演算を優先。`Array.prototype` 連鎖は避ける。

---

## 11. チェックリスト（MOD制作者向け）
- [ ] `window.registerDungeonAddon({ id, ... })` を末尾で呼んだ
- [ ] 生成タイプ `generators[].id` をユニークにした
- [ ] `algorithm(ctx)` で `map` を壁/床で正しく設定した
- [ ] `blocks1/2/3` の `type` に自作 `id` を入れた（BlockDim 混合で出現）
- [ ] `manifest.json.js` に `entry` を追加（または `autoload.js` を用意）
- [ ] 例外処理と最小床数の安全確保を行った

---

## 12. マニフェスト形式
`manifest.json.js`（推奨）
```js
window.DUNGEONTYPE_MANIFEST = [
  { id: 'lava_pack', name: 'Lava Pack', entry: 'dungeontypes/lava_caves.js', version: '1.0.0', author: 'you' }
];
```
（オプション）HTTP環境のみ `manifest.json`（JSON配列）もサポート可能です。
項目はミニゲームの `games/manifest.json(.js)` と同等の最小形。ホストは `entry` を参照し、登録は各JSが行います。

---

## 13. 将来拡張（案）
- 生成タイプの「事前プレビュー画像」提供（Small PNG/Canvas 関数）
- `ctx.noise2D(x,y)` などの組込みノイズ関数
- 敵/宝箱配置へアドオン側のフック（例: `afterGenerate(ctx, entities)`）
- Normal 側にも新タイプを直接選択できる UI セクション

---

## 14. 付録: JSDoc（エディタ補完用）
```ts
/** @typedef {'less'|'normal'|'more'} ChestBias */
/** @typedef {{key:string,name?:string,baseLevel:number}} Dimension */
/** @typedef {{key:string,name?:string,level?:number,size?:number,depth?:number,chest?:ChestBias,type?:string|null,bossFloors?:number[],weight?:number}} BlockSpec */
/** @typedef {{width:number,height:number,map:number[][],random:Function,inBounds:(x:number,y:number)=>boolean,set:(x:number,y:number,v:0|1)=>void,get:(x:number,y:number)=>0|1,ensureConnectivity:Function,carvePath:Function,aStar:Function}} GenContext */
/** @typedef {{id:string,name?:string,description?:string,algorithm:(ctx:GenContext)=>void|number[][],mixin?:{normalMixed?:number,blockDimMixed?:number,tags?:string[]}}} DungeonGeneratorDef */
/** @typedef {{id:string,name?:string,version?:string,author?:string,description?:string,api?:string,blocks?:{dimensions?:Dimension[],blocks1?:BlockSpec[],blocks2?:BlockSpec[],blocks3?:BlockSpec[]},generators?:DungeonGeneratorDef[]}} DungeonAddon */
```

---

最終更新: 2025-09-15

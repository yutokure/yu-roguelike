# ミニゲームAPI書（MiniExp MOD API v0.2）

本書は「ミニゲー経験」タブに統合されるミニゲーム（以下、MOD）の作成・導入・実行に関するAPI仕様です。最小の手順で作れること、リアルタイムにプレイヤーEXPへ反映されること、既存のUI/保存と矛盾しないことを目的とします。

## 概要
- 実行場所: 選択画面の `ミニゲー経験` タブ内パネル。
- 目的: ミニゲームのスコアや操作イベントに応じて `awardXp(n)` を呼ぶことで、即時にプレイヤーへEXPを付与（1000でレベルアップ）。
- 表示: タブ右下に常時HUD（Lv/EXP）、右上にEXPポップ。付与のたびに自動更新します。
- 互換: 既存の探索/ブロック次元とは独立。EXP・レベルのみ共有します。

## 仕組みの流れ
1) `games/manifest.json.js`（`window.MINIEXP_MANIFEST` を公開するJS）を読み込み、一覧とカテゴリを構築（失敗時は内蔵定義を使用）。
2) ユーザーが選択→「開始」でエントリJS（`entry`）を `<script>` として読み込み。
3) 読み込み済みスクリプトは `window.registerMiniGame(def)` を呼び、ホストへ登録。
4) ホストが `def.create(root, awardXp, { difficulty })` を呼び、返ってきた `runtime.start()` を実行。
5) `awardXp(n)` を呼ぶたびにEXPが加算され、HUD/ポップが更新されます（戻り値は実際に加算された数値）。
6) 「終了」で `runtime.stop()`→`runtime.destroy()`→コンテナを解放。

7) 記録（records）: ホストはゲームごとに以下を自動で集計/保存します。
   - `totalExpEarned`: `awardXp` 呼び出しで実際に加算されたEXPの通算（四捨五入せず小数含むが保存は数値）。
   - `totalPlays`: 「開始→終了」の1サイクルで+1。
   - `bestScore`: `runtime.getScore?.()` を終了時に呼び、最大値を保持（未実装なら無視）。
   - `lastPlayedAt`: 終了時に `Date.now()` を保存。

## マニフェスト（games/manifest.json.js）
- 形式: `window.MINIEXP_MANIFEST = [...];` を格納したJS（`file://` 実行でも `<script>` で読み込めるようJSONではなくJSファイル）。
- 要素スキーマ:
  - `id` string: 一意なID（英数・ハイフン推奨）
  - `name` string: 一覧表示名
  - `entry` string: エントリJSの相対パス（例: `games/snake.js`）
  - `version` string: 任意。`vX.Y.Z` 推奨
  - `author` string: 任意
  - `icon` string: 任意（相対パス）
  - `description` string: 任意（一覧の説明文）
  - `category` string | string[]: カテゴリ（例: "パズル" / "アクション" / "シューティング" など）。複数所属も可。ホストはカテゴリごとのフィルターボタンを自動生成します。

例:
```json
[
  { "id": "snake", "name": "スネーク", "entry": "games/snake.js", "version": "0.1.0", "author": "builtin", "description": "餌を取ると+1EXP", "category": "アクション" }
]
```

## 登録API（グローバル）
- シグネチャ: `window.registerMiniGame(def: MiniGameDef): void`
- 用途: MOD側が自身をホストへ登録します（ロード完了時に1回呼ぶ）。

MiniGameDef:
```ts
interface MiniGameDef {
  id: string;                 // マニフェストの id と一致させる
  name: string;               // 表示名（任意、マニフェスト優先で良い）
  description?: string;       // 概要
  create: (root: HTMLElement,
           awardXp: (n: number, meta?: any) => number|void,
           opts: { difficulty: 'EASY'|'NORMAL'|'HARD' }) => MiniGameRuntime;
}

interface MiniGameRuntime {
  start(): void;   // 実行開始または再開（Pause→Resumeでも呼ばれる）
  stop(): void;    // 一時停止 or 終了（タイマー停止、必要なら状態保持）
  destroy(): void; // 完全破棄（DOM/イベント/タイマーを必ず解放）
  getScore?(): number; // 任意：記録表示や保存に使う
}
```

備考:
- `awardXp(n, meta)` は EXP を即時加算し、HUD/ポップを更新します。戻り値として実際に加算された数値（number）を返します。
- `opts.difficulty` はタブのUIから選択された値（`EASY|NORMAL|HARD`）。ゲームロジックやスピードに反映してください。
- MODは `create()` 内で自前のイベントリスナーを追加し、`destroy()` で必ず除去してください。
- `start()` はホストの一時停止解除でも呼ばれるため、停止→再開で複数回呼ばれても安全な実装（idempotent）にしてください。

## 推奨実装パターン
- ループ: `requestAnimationFrame` で60FPS目安。タイムステップが必要な場合のみ `setInterval` を使用。
- 入力: キー/マウス/タッチは必要に応じ `e.preventDefault()` を活用（タブ内でスクロールが起きやすいため）。
- キャンバスサイズ: ルート要素の幅に合わせる場合は `ResizeObserver` 等で追従。
- 効果音: `awardXp` 呼び出し時にホスト側でピックアップ音が鳴ります。追加音を鳴らす場合は `window.ensureAudio?.()` → `window.playSfx?.('attack'|'damage'|'pickup'|'stair')` を任意で利用可能（存在チェック推奨）。
- HUDポップ: `awardXp` が呼ばれるたびにホストが `+N EXP` のバッジを表示します。必要に応じて `window.showTransientPopupAt(x,y,text,opts)` でカスタムポップを追加可能（存在チェック推奨）。
- セーブ: 現状、各ミニゲーム固有のスコアはホストが自動保存しません。必要なら内部でlocalStorageを使うか、今後の `miniExpState.records` 連携を待ってください。
 - 記録: ホストが `totalExpEarned/totalPlays/bestScore/lastPlayedAt` を自動保存（`miniExpState.records`）。`getScore()` を実装すると `bestScore` が更新されます。

## エラーとガード
- `entry` のロード失敗時: 一覧パネルにエラーメッセージを表示し、開始は行われません。
- 二重起動防止: 既に起動中は「開始」を無効化。`quit` で `stop()`→`destroy()` を呼んでから再度「開始」。
- クリーンアップ: `destroy()` は必ず idempotent（複数回呼ばれても安全）にしてください。

## 難易度の意味（参考）
- EASY: 学習/低速/許容大の想定
- NORMAL: 既定
- HARD: 反応速度UP/敵AI強化/許容小の想定
具体的な経験値テーブルは各ゲーム設計に従ってください（例: スネーク=餌+1）。

## 例: スネーク（最小）
```js
(function(){
  function create(root, awardXp, opts){
    const speed = opts.difficulty==='HARD'?90:opts.difficulty==='EASY'?180:140;
    const canvas = document.createElement('canvas');
    root.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    // ... 初期化（省略） ...
    let timer=null; function start(){ timer=setInterval(step, speed); }
    function step(){ /* 餌取得時 */ awardXp(1); }
    function stop(){ clearInterval(timer); }
    function destroy(){ stop(); canvas.remove(); }
    return { start, stop, destroy };
  }
  window.registerMiniGame({ id:'snake', name:'スネーク', create });
})();
```

## 開発/デバッグTips
- `console.log` は標準で使用可。
- `file:` 実行でも `<script>` 注入で動的ロード可能な設計です。
- 外部アセットは `games/` 配下に相対パスで配置してください。

## バージョン
- API: MiniExp MOD API v0.1
- 後方互換方針: `create`/`start`/`stop`/`destroy`/`registerMiniGame`/`awardXp`/`difficulty` の基本形は維持予定。

---

## 付録A: 必須遵守事項（安定動作のために）
- DOMの追加・変更は `create(root, ...)` で受け取る `root` 要素配下に限定する。
- `window`/`document` へ追加したイベントリスナーは、`stop()` で無効化し、`destroy()` で必ず除去する。
- 例外はMOD内で握る（try/catch）か、少なくともゲームを継続可能にする。
- ネットワークアクセスやクロスオリジンのスクリプト注入は行わない。
- `localStorage` のキー衝突を避ける（必要なら `mini_<modId>_*` プレフィックスを推奨）。

## 付録B: ホスト提供ユーティリティ（存在チェック推奨）
- `window.ensureAudio?(): void` — AudioContextの遅延初期化。
- `window.playSfx?(type: 'attack'|'pickup'|'damage'|'stair')` — 簡易SE。
- `window.showTransientPopupAt?(x:number, y:number, text:string, opts?:{variant?:'combo',level?:number})` — ミニゲーム領域上に一時ポップを表示。
- これらは環境により未定義のことがあるため、呼び出し時は `window.playSfx && window.playSfx('pickup')` のように防御的に利用する。

## 付録C: 入力・レイアウト・一時停止の指針
- キー: `addEventListener('keydown', handler, { passive:false })`。スクロール抑止が必要なキーでのみ `preventDefault()`。
- 画面: `#miniexp-container` は最小高 ~360px。キャンバスは `root.clientWidth` に追従し、縦横比を固定するか、内部グリッドをスケール。
- 一時停止: `visibilitychange` やホストの Pause 操作で `stop()`、復帰時に `start()` を推奨。ホストは P キーショートカットからも `stop()`/`start()` を呼びます。

## 付録D: JSDoc 型定義（エディタ補完用）
```ts
/** @typedef {'EASY'|'NORMAL'|'HARD'} MiniDifficulty */
/** @callback AwardXp */
/** @param {number} n @param {any=} meta @returns {number|void} */
/**
 * @typedef MiniGameRuntime
 * @property {()=>void} start
 * @property {()=>void} stop
 * @property {()=>void} destroy
 * @property {()=>number=} getScore
 */
/**
 * @typedef MiniGameDef
 * @property {string} id
 * @property {string} name
 * @property {string=} description
 * @property {(root:HTMLElement, awardXp:AwardXp, opts:{difficulty:MiniDifficulty})=>MiniGameRuntime} create
 */
```

## 付録E: 実装チェックリスト
- [ ] 末尾で `window.registerMiniGame({ id, name, create })` を呼んだ
- [ ] `create(root, awardXp, { difficulty })` を実装
- [ ] DOMは `root` 配下のみ変更
- [ ] `start/stop/destroy` でタイマー・イベントを適切に管理
- [ ] `awardXp` の呼び出し頻度は視認性に配慮（必要なら合算）
- [ ] 例外処理とエラー復帰がある
- [ ] `visibilitychange` で停止/再開（推奨）

最終更新: 2025-02-17

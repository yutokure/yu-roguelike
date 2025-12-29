# GameEngine への状態移管メモ

## 対象となるグローバル状態（main.js）

現在グローバルに保持されているゲーム進行・選択系の状態を `GameEngine` に集約する。

- `gameOverSequence`（ゲームオーバー演出状態）
- `currentRunContext`（ダンジョン走行中の計測データ）
- `difficulty`（難易度選択）
- `selectedWorld`（ワールド選択）
- `selectedDungeonBase`（ダンジョン選択）

補足候補（今後の拡張で同様に集約可能）
- `currentMode`（モード切替）
- `dungeonLevel`（現在階層）
- 選択画面の UI 状態（`selectionFooterCollapsed` など）

## GameEngine 側の移管方針

- 上記の状態は `GameEngine` のプロパティとして保持する。
- 既存の関数群は段階的に `GameEngine` のメソッドへ移動し、まずは薄いラッパーで移行する。
- 既存の呼び出し側は `engine.beginDungeonRunContext()` のように `engine` 経由に置き換え、依存を明示化する。

## 進行系 API の移管（段階的）

以下は当面「薄いラッパー」で `GameEngine` へ移行し、後段でロジック本体を `GameEngine` に移す。

- `beginDungeonRunContext(meta)` → `engine.beginDungeonRunContext(meta)`
- `resetDungeonRunContext()` → `engine.resetDungeonRunContext()`
- `trackRunEvent(type, payload)` → `engine.trackRunEvent(type, payload)`

`GameEngine` が内部で `currentRunContext` を保持し、呼び出し側の依存を切り替える。

## UI 層通知（EventBus / コールバック）

`GameEngine` から UI 層へ通知するため、イベント発行インターフェースを用意する。

- `engine.on(eventName, handler)`：UI 側が購読する。
- `engine.emit(eventName, payload)`：`GameEngine` がイベントを通知する。

例: `runContextStarted`, `runContextReset`, `runEventTracked`

将来的には共通 `EventBus` に委譲するか、`engine` の `onEvent` コールバックで統一する。

## 移行のチェックポイント

- 既存の UI 更新ロジックは `engine` のプロパティ参照へ統一。
- `GameEngine` の初期値が既存のデフォルトと一致することを確認。
- 既存の保存/復元やサンドボックススナップショットが `engine` と整合することを確認。

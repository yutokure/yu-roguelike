# Yuローグライク（dungeon-game-html）

Yuローグライクは、ブラウザだけで遊べるダンジョン探索ゲームです。難易度や世界、ダンジョンを選んで冒険しつつ、豊富なミニゲームや開発者向けツールで遊び方を拡張できます。HTML/CSS/JavaScript のみで構築されているため、カスタマイズや教材利用にも最適です。詳細は同梱の [マニュアル](https://yutokure.github.io/yu-roguelike/manual/index.html) を参照してください。

## 主な特徴
- シンプルな構成でダンジョンやデータを自由に追加・編集可能。
- 通常探索に加えてブロック次元や実績・統計、開発者用ツールなど複数のタブを搭載。
- 456種類のダンジョン生成アルゴリズムと75種類のミニゲームを搭載。
- 75 in 1のミニゲーム。
- レベル100以降に解放される SP、推奨レベル300以上で有効になる満腹度システムなど、ハイレベル向けの仕掛けが多数。
- サンドボックス用のインタラクティブパネルや創造神コンソールで検証・チートが可能。

各機能の背景や詳細は「[ゲーム全体の概要](https://yutokure.github.io/yu-roguelike/manual/overview.html)」「[画面と操作の解説](https://yutokure.github.io/yu-roguelike/manual/ui.html)」「[このゲームの遊び方](https://yutokure.github.io/yu-roguelike/manual/how-to-play.html)」を参照してください。

## 必要な環境
- モダンブラウザ（Chrome / Edge / Firefox / Safari など）
- テキストエディター（VS Code など）
- プロジェクト一式（`git clone` または ZIP ダウンロード）

推奨ツールやディレクトリ準備のポイントは「[必要な環境と準備](https://yutokure.github.io/yu-roguelike/manual/environment.html)」にまとまっています。

## フォルダー構成
| 主要パス | 役割 |
| --- | --- |
| `index.html` | ゲーム画面のレイアウト定義 |
| `style.css` | UI 全体の配色・余白・フォント定義 |
| `main.js` | タブ切り替えやボタンなどメインの UI ロジック |
| `js/` | 機能別の JavaScript モジュール |
| `dungeontypes/` | ダンジョン定義の JSON 群 |
| `games/` | ミニゲームなど追加コンテンツのデータ |
| `tools/` | 制作者向けツールとテンプレート |
| `blockdata.js` / `blockdata.json` | ブロック次元モード向けのデータ |

より詳細な整理方法や命名規則は「[フォルダーとファイル構成](https://yutokure.github.io/yu-roguelike/manual/structure.html)」で確認できます。

## はじめての起動
1. プロジェクトをダウンロードまたはクローンします。
2. `index.html` をブラウザで開きます。
3. タイトル画面が表示されたら準備完了です。

VS Code の Live Server 拡張を使うと、保存と同時にブラウザへ反映できます。手順やトラブルシューティングは「[はじめての起動](https://yutokure.github.io/yu-roguelike/manual/start.html)」を参照してください。

## 開発・テスト
- JavaScript の構成や主要関数は「[JavaScript の仕組み](https://yutokure.github.io/yu-roguelike/manual/development.html)」にまとめています。
- 単体テストは Node.js で実行できます。

```bash
npm install
npm test
```

## カスタマイズガイド
- ダンジョン追加：`dungeontypes/` に JSON を作成し、`main.js` の読み込み対象へ追加。
- 難易度調整：各ダンジョンデータのダメージ倍率や敵設定を編集。
- 見た目変更：`style.css` を中心に背景・配色・ボタンスタイルを編集。

具体的な手順やヒントは「[コンテンツの追加・変更](https://yutokure.github.io/yu-roguelike/manual/customize.html)」を参照してください。

## プレイチップス
- 選択画面のタブから通常探索・ブロック次元・ミニゲー経験・実績/統計・ツールズへ移動できます。
- 推奨レベル300以上のダンジョンでは満腹度管理が重要。推奨レベルとの差で床ギミックや宝箱イベントの挙動が変化します。
- サンドボックスモードやアノス級解放後はインタラクティブ/創造神コンソールでゴッドモードやスクリプト操作が可能です。

探索の流れや操作一覧、リザルト画面の見方などは「[このゲームの遊び方](https://yutokure.github.io/yu-roguelike/manual/how-to-play.html)」「[画面と操作の解説](https://yutokure.github.io/yu-roguelike/manual/ui.html)」に詳細があります。

## 追加ドキュメント
- 日本語マニュアル: [`manual/`](https://yutokure.github.io/yu-roguelike/manual/index.html)
- 英語マニュアル: [`manual/en/`](https://yutokure.github.io/yu-roguelike/manual/en/index.html)
- 仕様・設計資料: リポジトリ直下の各種 `.md` / `.txt` ドキュメント

不明点があればマニュアルの FAQ やリファレンス章を参照し、必要に応じて Issue や PR で報告してください。

--------

# Yu Roguelike (dungeon-game-html)

Yu Roguelike is a dungeon crawler that runs entirely in the browser. Pick a world, dungeon, and difficulty, then expand your adventure with optional mini-games and creator tools. Because it is built only with HTML, CSS, and JavaScript, it is easy to customize or repurpose for learning. See the bundled [manual](https://yutokure.github.io/yu-roguelike/manual/en/index.html) for complete documentation.

## Highlights
- Simple project structure that makes it easy to add or edit dungeons and data.
- Multiple tabs covering core exploration, Block Dimension, achievements/statistics, and creator-focused tools.
- 456 dungeon generation types included.
- 75 in 1 mini-games.
- Late-game mechanics such as SP (unlocked after level 100) and the fullness system (recommended level 300+) keep high-level play engaging.
- Interactive Sandbox panel and Creator God console for debugging, experiments, or cheats.

Background and feature explanations live in "[Game Overview](https://yutokure.github.io/yu-roguelike/manual/en/overview.html)", "[Screens & Controls](https://yutokure.github.io/yu-roguelike/manual/en/ui.html)", and "[How to Play](https://yutokure.github.io/yu-roguelike/manual/en/how-to-play.html)".

## Requirements
- Modern browser (Chrome / Edge / Firefox / Safari, etc.)
- Text editor (VS Code, etc.)
- Project files (`git clone` or ZIP download)

Recommended tooling tips and workspace setup are covered in "[Environment & Preparation](https://yutokure.github.io/yu-roguelike/manual/en/environment.html)".

## Folder Structure
| Path | Description |
| --- | --- |
| `index.html` | Defines the game layout |
| `style.css` | Global UI colors, spacing, and typography |
| `main.js` | Tab switching and primary UI logic |
| `js/` | Feature-specific JavaScript modules |
| `dungeontypes/` | JSON definitions for dungeons |
| `games/` | Data for mini-games and extra content |
| `tools/` | Creator tools and templates |
| `blockdata.js` / `blockdata.json` | Assets used by the Block Dimension mode |

Additional naming conventions and organization tips are in "[Folders & Files](https://yutokure.github.io/yu-roguelike/manual/en/structure.html)".

## Getting Started
1. Download or clone the repository.
2. Open `index.html` in your browser.
3. Once the title screen appears, you are ready to play.

Using VS Code with Live Server lets you reload the browser automatically when saving. Refer to "[First Launch](https://yutokure.github.io/yu-roguelike/manual/en/start.html)" for troubleshooting steps.

## Development & Testing
- Core JavaScript architecture is summarized in "[JavaScript Internals](https://yutokure.github.io/yu-roguelike/manual/en/development.html)".
- Unit tests can be executed with Node.js.

```bash
npm install
npm test
```

## Customization Guide
- Add dungeons: create JSON files in `dungeontypes/` and include them in the loader within `main.js`.
- Adjust difficulty: tweak damage multipliers and enemy configurations in each dungeon file.
- Change visuals: update backgrounds, colors, and button styles primarily in `style.css`.

Detailed walkthroughs and tips are available in "[Add & Modify Content](https://yutokure.github.io/yu-roguelike/manual/en/customize.html)".

## Gameplay Tips
- Use the tabbed menu to switch between the main exploration, Block Dimension, mini-game experience, achievements/statistics, and tools.
- Manage fullness carefully in dungeons recommended for level 300 or higher—the gap between your level and the recommendation influences traps and treasure behavior.
- After unlocking Sandbox mode or the Anos tier, use the interactive console or Creator God console for god-mode controls and scripting.

Gameplay flow, controls, and result screen explanations are documented in "[How to Play](https://yutokure.github.io/yu-roguelike/manual/en/how-to-play.html)" and "[Screens & Controls](https://yutokure.github.io/yu-roguelike/manual/en/ui.html)".

## Additional Documentation
- Japanese manual: [`manual/`](https://yutokure.github.io/yu-roguelike/manual/index.html)
- English manual: [`manual/en/`](https://yutokure.github.io/yu-roguelike/manual/en/index.html)
- Specs and design docs: Assorted `.md` / `.txt` files at the repository root

Check the manual's FAQ and reference chapters, and report open questions via Issues or PRs when necessary.

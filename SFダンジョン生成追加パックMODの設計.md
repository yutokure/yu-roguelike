# SFダンジョン生成追加パックMOD 設計書（API v1 実装準拠）

## 1. 概要
- **目的**: 既存ゲームの `registerDungeonAddon` API に沿って、宇宙船・サイバー空間・未来都市を中心とした SF テーマのダンジョン生成と大量の BlockDim ブロックを追加する。
- **対象バージョン**: `main.js`（2025-09-16 時点）で公開されている DungeonType/BlockDim MOD API v1。
- **主な特徴**:
  - ダンジョンタイプ系統を10カテゴリ・計50タイプまで拡張し、Normal/BlockDim 両モードの混合抽選に対応。
  - 各タイプは床/壁/アクセント色のカラーパレットと照明設定を JSON 定義で提供し、光源タグを最大3色まで許容。
  - 110種の BlockDim ブロック（1st/2nd/3rd 段階 32/43/35 構成）と5次元追加、危険ギミック・ユーティリティを含めた豊富なバリエーション。
  - `ctx.structures.place`・`ctx.carvePath`・`ctx.ensureConnectivity` など現行 API が提供するユーティリティを活用した生成アルゴリズムを設計。
  - マニフェスト/レジストリ統合フロー、テスト計画、将来拡張のブレインストーミングを整理。

## 2. API連携とモジュール構成
### 2.1 ファイル構造
```
dungeontypes/
  ├─ manifest.json.js  // window.DUNGEONTYPE_MANIFEST を定義
  ├─ sf_expansion.js   // 本アドオン本体
  ├─ structures.json   // 任意: 構造テンプレート別出力
  └─ palettes.json     // 任意: カラーパレット設定
```

### 2.2 登録手順
1. `manifest.json.js` に `{ id: 'sf_pack', entry: 'dungeontypes/sf_expansion.js', name: 'SF Expansion' }` を追加。
2. `sf_expansion.js` は即時関数で `window.registerDungeonAddon(addonDef);` を呼び出す。`addonDef` は以下のプロパティを持つ:
   - `id: 'sf_pack'`
   - `api: '1.0.0'`（API バージョン）
   - `blocks: { dimensions, blocks1, blocks2, blocks3 }`
   - `structures: [...]`（必要な静的パターン）
  - `generators: [...]`（後述50タイプを定義）
3. `main.js` 側は読み込み時に `DungeonGenRegistry` と BlockDim テーブルへ統合する。

### 2.3 BlockSpec の割り当て規則
- `type` フィールドに対応する生成タイプ ID を格納。Normal 混合向けには `mixin.normalMixed` を 0.2〜0.5 程度で調整。
- `level`/`size`/`depth`/`chest` などはゲーム内バランスと連携。極端な値は避け、±2 程度の補正幅を基本とする。
- 追加ディメンションには `baseLevel` と `description` を付与し、BlockDim UI に表示されるようにする。

### 2.4 サンプルスケルトン
```js
(function(){
  const addon = {
    id: 'sf_pack',
    name: 'SF Expansion Pack',
    api: '1.0.0',
    description: '宇宙船・サイバー空間・未来都市など50タイプを収録した大規模SF拡張。',
    structures: createStructures(),
    blocks: createBlocks(),
    generators: createGenerators()
  };
  window.registerDungeonAddon(addon);
})();
```
`createGenerators()` で返す各タイプの `algorithm(ctx)` 内では、`ctx.set(x, y, 0|1)`・`ctx.carvePath(x1, y1, x2, y2)`・`ctx.ensureConnectivity()`・`ctx.aStar(start, goal)` を組み合わせる。

## 3. 追加ダンジョンタイプ体系
### 3.1 テーマカテゴリ一覧
| 系統 | タイプID | 名称 | 床/壁/アクセント色 | 主な追加ブロック | Normal混合 | BlockDim混合 |
|------|----------|------|--------------------|------------------|------------|--------------|
| 宇宙船セクション | `spaceship_core` | 機関部ノード | #0F1E33 / #08111F / #2FD3FF | リアクターハブ、磁束導管、プラズマ遮蔽壁 | 0.30 | 0.50 |
| | `spaceship_hab` | 居住区モジュール | #1F2D3F / #32465A / #4BE2C2 | スリープポッド、循環農園床、生活配線 | 0.25 | 0.40 |
| | `spaceship_dock` | ドックベイ | #15283B / #071421 / #5AA4FF | ドッキングクランプ、貨物軌条、強化観測窓 | 0.35 | 0.50 |
| | `spaceship_ai` | 指令AI中枢 | #112233 / #050B11 / #7E5CFF | 演算コア、監視ノード、シールドハッチ | 0.20 | 0.35 |
| | `spaceship_medbay` | メディカルベイ | #143347 / #0B1E2B / #55F3E9 | 滅菌床、救急ポッド、バイタルサージ壁 | 0.22 | 0.35 |
| | `spaceship_engineering` | 保守機関層 | #1A2639 / #0A141F / #FFB347 | 熱交換床、補修アーム、補強梁 | 0.28 | 0.45 |
| | `spaceship_warp` | ワープハンガー | #081F38 / #050D18 / #5C9DFF | ワープ導管、ゲートリング、遮蔽隔壁 | 0.18 | 0.32 |
| | `spaceship_observatory` | 星間観測ドーム | #0C1F33 / #091423 / #7DE9FF | 星図投影床、観測アレイ、透明ドーム | 0.20 | 0.34 |
| サイバー空間層 | `cyber_grid` | データグリッド | #090513 / #211A6B / #45E0FF | 光子タイル、量子ゲート、グリッドノード | 0.30 | 0.45 |
| | `cyber_vault` | セキュリティヴォールト | #12132A / #2E1B4B / #8F53FF | ファイアウォール壁、暗号鍵ポッド、ICE塔 | 0.25 | 0.40 |
| | `cyber_glitch` | グリッチ領域 | #0A3B3C / #0F1F20 / #C1FF2E | グリッチ床、デシンク壁、乱数ポータル | 0.15 | 0.35 |
| | `cyber_stream` | 情報フロー帯 | #051B2C / #0B3857 / #1BFF9F | フローライン床、信号橋、バンド幅調整器 | 0.30 | 0.40 |
| | `cyber_forum` | ソーシャルホール | #1A0D3A / #3A1266 / #FF4BD1 | ホログラム座席、議論リング、共鳴壁 | 0.28 | 0.42 |
| | `cyber_subroutine` | サブルーチン回廊 | #051F2A / #04353F / #5CFF8F | サブルーチン床、診断壁、同期ゲート | 0.32 | 0.45 |
| | `cyber_arena` | シミュレーションアリーナ | #0A1230 / #1C2461 / #FF43B9 | ホログラム壁、訓練リング、シールドポール | 0.26 | 0.40 |
| | `cyber_mirror` | ミラールーム | #071428 / #1D305A / #7CFFEE | 反射壁、ミラーシャード、折り畳み回廊 | 0.21 | 0.36 |
| 未来都市区画 | `future_plaza` | ホログラム広場 | #124652 / #1D6F7A / #3BFFFF | ホロパネル、空中歩道、広告塔 | 0.35 | 0.50 |
| | `future_industrial` | メガ工場層 | #1E2B3C / #3A5169 / #FFBF3B | コンベア、ナノ炉、補強支柱 | 0.30 | 0.45 |
| | `future_sky` | スカイドメイン | #101A33 / #233A66 / #77F6FF | 浮遊プラットフォーム、垂直エレベーター、風制御壁 | 0.25 | 0.40 |
| | `future_core` | 都市制御局 | #162938 / #0C141D / #49FFB5 | コントロール卓、データ塔、監視ガラス | 0.20 | 0.35 |
| | `future_residential` | コロニー住居帯 | #1B2F39 / #223B44 / #7FFFD7 | モジュラーフロア、隣接バルコニー、遮光壁 | 0.32 | 0.45 |
| | `future_underworks` | アンダーワークス | #0D1724 / #121E2D / #88FF52 | 保守トンネル、廃熱管、補修橋 | 0.26 | 0.38 |
| | `future_metro` | ハイパーメトロ網 | #142A38 / #1B3C4F / #54FFE2 | リニア軌条、乗換プラットフォーム、信号塔 | 0.33 | 0.48 |
| | `future_cloudport` | クラウドポート | #12284C / #152036 / #8DFFFA | 浮遊港、気流橋、アンカータワー | 0.24 | 0.38 |
| 軌道・星間施設 | `orbital_ring` | 軌道リング廊 | #111B28 / #202F45 / #64FFE3 | 慣性制御床、ソーラーパネル壁、軌道ハブ | 0.30 | 0.45 |
| | `orbital_lab` | 真空ラボ | #132435 / #06121E / #7BD8FF | 真空ロック、零G実験床、封印カプセル | 0.25 | 0.35 |
| | `orbital_armory` | 軍備庫層 | #1B1E2B / #2F3547 / #FF4F64 | 軍事ラック、磁気弾薬庫、反応装甲壁 | 0.20 | 0.35 |
| | `orbital_greenhouse` | 宇宙温室帯 | #123123 / #071A10 / #6CFF7A | 水耕床、光合成パネル、気圧バリア | 0.22 | 0.35 |
| | `orbital_command` | 指令甲板 | #0F1626 / #1D2740 / #4CF0FF | 指揮卓、センサー壁、緊急転送床 | 0.18 | 0.32 |
| | `orbital_scrapyard` | 軌道スクラップ場 | #1B1F2C / #242F3D / #FF7B42 | 廃船板、修繕クレーン、浮遊支柱 | 0.27 | 0.38 |
| | `orbital_listening` | リスニングステーション | #0E1D2F / #142A3F / #4CF2FF | アンテナアレイ、傍受ディッシュ、共鳴床 | 0.19 | 0.32 |
| 量子・時間研究群 | `quantum_reactor` | 量子炉チャンバー | #170B2C / #2A1752 / #FF3CF0 | 量子束柱、位相制御床、特異点遮蔽 | 0.20 | 0.30 |
| | `quantum_archive` | 記録保管層 | #1F142E / #2C1F43 / #3CE3FF | 時間結晶書架、クロノ端末、安定化壁 | 0.15 | 0.30 |
| | `quantum_void` | 位相虚空 | #04070E / #000000 / #66FFAA | 虚空タイル、位相門、次元杭 | 0.10 | 0.25 |
| | `quantum_prism` | プリズム観測塔 | #1E0E36 / #2F125A / #FFD84F | プリズム床、光束導鏡、スペクトラム壁 | 0.18 | 0.28 |
| | `quantum_flux` | フラックス遷移域 | #150926 / #26103F / #FF72ED | 位相リボン、共鳴柱、フラックスゲート | 0.17 | 0.30 |
| | `chrono_station` | 時間駅 | #14243E / #233861 / #FF6BC4 | 時間導線床、停滞ホーム、クロノ壁 | 0.16 | 0.30 |
| | `chrono_archive` | 時間アーカイブ | #111C31 / #19273F / #FF85D6 | 年代書架、クロノ織路、位相索引 | 0.15 | 0.29 |
| | `chrono_loop` | 反復ループ域 | #0B1A21 / #132A32 / #74FFE5 | ループ床、逆再生ポータル、時間梁 | 0.14 | 0.28 |
| | `chrono_fracture` | 時空断層帯 | #0A1A24 / #121F2C / #74FFF4 | 断層ゲート、時間楔、乱流裂け目 | 0.13 | 0.28 |
| 異星バイオーム | `xeno_jungle` | 異星樹海 | #093326 / #042018 / #5BFF8C | バイオルミ床、樹液壁、寄生蔓 | 0.28 | 0.38 |
| | `xeno_crystal` | 結晶洞 | #0B1430 / #16224A / #7DFFFB | 結晶床、共鳴壁、光子芽 | 0.22 | 0.34 |
| | `xeno_ruins` | 古代遺構 | #1E1B26 / #2C2433 / #FFAA54 | 遺跡床、刻印壁、動力オベリスク | 0.24 | 0.36 |
| | `xeno_tide` | 潮汐ラボ | #0A1E3F / #083A5C / #4DF6FF | 潮汐床、液体壁、波動橋 | 0.20 | 0.32 |
| | `xeno_desert` | 微粒砂層 | #2B1C0F / #3A2815 / #FFC66B | 砂丘床、シルト壁、耐砂ブリッジ | 0.26 | 0.35 |
| | `xeno_hive` | 異星ハイブ | #132C1C / #0B1A11 / #83FF5A | 胞巣床、共鳴蔓、樹脂壁 | 0.29 | 0.40 |
| | `xeno_reef` | 星間リーフ | #0C2430 / #16353F / #5EFFF7 | 珊瑚梁、光苔床、潮流ゲート | 0.25 | 0.36 |
| メガコロニー支柱 | `colony_foundry` | 鋳造区画 | #1F1F2D / #2D2D44 / #FF7A3C | モールド床、レーザー炉壁、補給レール | 0.30 | 0.44 |
| | `colony_spire` | 管制スパイア | #101B2C / #1C2F46 / #5AF0FF | スパイア床、通信梁、護衛壁 | 0.18 | 0.30 |
| | `colony_commons` | コモンズ | #1A2D2E / #223B3C / #94FFDD | コモンズ床、交流モジュール、ミスト壁 | 0.34 | 0.48 |
| | `colony_reactor` | コロニー炉心 | #220F2C / #331635 / #FF57B0 | 炉心床、イオン壁、余熱導管 | 0.22 | 0.34 |
| | `colony_vault` | 戦略備蓄庫 | #1A1E32 / #242B3F / #FF9A4F | 備蓄庫床、封鎖扉、監視塔 | 0.20 | 0.33 |
| | `colony_arcology` | アーコロジースパイン | #101C2A / #172535 / #4CFFF4 | 垂直街区、環状ブリッジ、上昇シャフト | 0.31 | 0.46 |

- **追加アルゴリズムスタイル**:
  - `sector`: 放射状リングと扇状分岐で構成する星系ハブ向け。`spaceship_warp` や `orbital_listening` で使用。
  - `weave`: 交差する帯状コリドーを織り込むスタイル。`future_metro`、`spaceship_observatory`、`chrono_archive` などで利用。
  - `cluster`: 離散した円盤群と連結ラインで浮遊構造を表現。`orbital_scrapyard`、`xeno_hive`、`cyber_mirror` などが該当。

- **照明方針**: タイプごとに `neon_light`（色温度差あり）と `plasma_beam` のカラーバリエーションを同梱。アクセント色を HSL で +20% 輝度にし、`ctx.lightmap`（内部API）へ転送するユーティリティを提供。
- **サウンド環境**: `addon.generators[].meta.soundscape` にキーを設定し、ゲーム側が将来参照できるようタグを付与（例: `soundscape: 'ship-engine'`).

### 3.2 構造テンプレート
- `structures` には 33 個の標準パターンを登録（例: 放射状制御室、六角ハブ、グリッドトンネル、垂直昇降井戸、ワープゲートリング、観測グリッド、シミュレーションメッシュ、メトロ交差、スクラップノード、フラックスセル、時間アーカイブスタック、ハイブチャンバー、アーコロジー核など）。
- `ctx.structures.pick({ tags: ['sf_pack', 'orbital'] })` で系統別に抽選し、`opts.rotation` を 45 度単位でランダム化。`chrono_loop` 系は `opts.mirror` を true にして左右反転パターンを生成する。

## 4. BlockDim 拡張設計
### 4.1 追加ディメンション
| key | 名称 | baseLevel | 説明 |
|-----|------|-----------|------|
| `sf-deep-orbit` | ディープオービット | 120 | 宇宙船/軌道基地を再現した高層ダンジョン帯。 |
| `sf-cyber-lattice` | サイバーラティス | 150 | 情報層へ侵入するデジタル迷宮。 |
| `sf-quantum-fold` | 量子折り畳み階層 | 180 | 位相空間が交錯する高難度エリア。 |
| `sf-stellar-halo` | ステラーハローベルト | 200 | 星間ワープ路やアンテナ群を再現する最終帯域。 |
| `sf-bio-cascade` | バイオカスケード | 135 | 異星生態系と都市境界が混ざり合う中層エリア。 |

### 4.2 追加ブロック一覧
50タイプの特徴を支える 110 種の BlockDim ブロックを 1st/2nd/3rd に段階別で配分する（32/43/35）。
#### 1st ブロック（探索導入〜中盤向け、推奨Lv 110〜160）
| key | 名称 | level | size | type | chest | カラー |
|-----|------|-------|------|------|-------|--------|
| `sf-reactor-floor` | プラズマ反応床 | +1 | 0 | `spaceship_core` | normal | #1B2F4C |
| `sf-magnetic-wall` | 磁束壁板 | +1 | 0 | `spaceship_core` | less | #0F1727 |
| `sf-hab-garden` | ハイドロポニクス床 | 0 | 0 | `spaceship_hab` | more | #2F7A59 |
| `sf-ai-server` | AI サーバーパネル | +2 | +1 | `spaceship_ai` | less | #372B6F |
| `sf-grid-node` | グリッドノード床 | +1 | 0 | `cyber_grid` | normal | #122060 |
| `sf-firewall-wall` | ファイアウォール壁 | +2 | 0 | `cyber_vault` | less | #2B1456 |
| `sf-glitch-tile` | グリッチタイル | 0 | -1 | `cyber_glitch` | less | #1AA186 |
| `sf-stream-bridge` | 信号橋梁 | +1 | +1 | `cyber_stream` | normal | #0F3F66 |
| `sf-plaza-holo` | ホログラム床 | 0 | 0 | `future_plaza` | more | #29CBDD |
| `sf-industrial-conveyor` | メガライン床 | +2 | +1 | `future_industrial` | normal | #F2A43A |
| `sf-sky-lift` | 垂直リフト床 | +1 | +1 | `future_sky` | less | #59E8FF |
| `sf-core-glass` | 強化監視壁 | +1 | 0 | `future_core` | less | #1D3E57 |
| `sf-medbay-sterile` | 無菌メディカル床 | 0 | 0 | `spaceship_medbay` | more | #2DAECC |
| `sf-engineering-grate` | エンジニアリンググレーチング | +1 | 0 | `spaceship_engineering` | normal | #FF9F45 |
| `sf-forum-stage` | ソーシャルホール舞台床 | 0 | -1 | `cyber_forum` | less | #AF46FF |
| `sf-subroutine-panel` | サブルーチン診断床 | +1 | 0 | `cyber_subroutine` | normal | #3CE89B |
| `sf-residential-terrace` | テラスフロア | 0 | 0 | `future_residential` | more | #4ED9C3 |
| `sf-underworks-catwalk` | アンダーワークス猫歩き床 | +1 | 0 | `future_underworks` | less | #78FF4C |
| `sf-xeno-jungle-floor` | バイオルミ床板 | +1 | 0 | `xeno_jungle` | normal | #1AE978 |
| `sf-colony-commons-floor` | コモンズ共有床 | 0 | 0 | `colony_commons` | more | #6BFFE4 |
| `sf-warp-pad` | ワープパッド床 | +2 | 0 | `spaceship_warp` | less | #1A2F48 |
| `sf-observatory-plate` | 観測ドーム床板 | +1 | 0 | `spaceship_observatory` | normal | #1C3954 |
| `sf-arena-track` | アリーナトラック床 | +1 | 0 | `cyber_arena` | more | #221C58 |
| `sf-mirror-panel` | ミラーパネル壁 | +1 | 0 | `cyber_mirror` | less | #1F2F56 |
| `sf-metro-strut` | メトロ支持梁 | +2 | +1 | `future_metro` | normal | #2A4C60 |
| `sf-cloud-dock-floor` | クラウドドック床 | +1 | 0 | `future_cloudport` | normal | #1A3655 |
| `sf-scrap-plating` | スクラップ装甲板 | +1 | 0 | `orbital_scrapyard` | less | #272C38 |
| `sf-listening-array` | リスニングアレイ床 | +1 | 0 | `orbital_listening` | normal | #1B3142 |
| `sf-reef-trellis` | リーフトレリス床 | +1 | 0 | `xeno_reef` | more | #144456 |
| `sf-hive-pith` | ハイブピス床 | +2 | 0 | `xeno_hive` | less | #193722 |
| `sf-arcology-floor` | アーコロジーフロア | +2 | +1 | `colony_arcology` | normal | #1A3245 |
| `sf-vault-plate` | 備蓄庫床板 | +1 | 0 | `colony_vault` | less | #21283A |

#### 2nd ブロック（中盤〜終盤、推奨Lv 150〜190）
| key | 名称 | level | size | depth | type | chest | カラー |
|-----|------|-------|------|-------|------|-------|--------|
| `sf-orbit-ring-floor` | 軌道リング床 | +2 | +1 | +1 | `orbital_ring` | normal | #244F68 |
| `sf-orbit-solar` | ソーラー壁板 | +2 | 0 | +1 | `orbital_ring` | less | #3CD0FF |
| `sf-orbit-lab` | 零G実験床 | +3 | 0 | +1 | `orbital_lab` | less | #2B6EA1 |
| `sf-orbit-armory` | 反応装甲床 | +3 | +1 | +1 | `orbital_armory` | less | #47273A |
| `sf-quantum-column` | 量子束柱 | +4 | 0 | +2 | `quantum_reactor` | less | #8A1CFF |
| `sf-quantum-phasewall` | 位相壁 | +3 | 0 | +2 | `quantum_reactor` | less | #43117E |
| `sf-quantum-archive` | 時間結晶棚 | +2 | 0 | +1 | `quantum_archive` | normal | #1E7DAF |
| `sf-quantum-anchor` | 次元アンカー | +4 | +1 | +2 | `quantum_void` | less | #46FFAF |
| `sf-cyber-cache` | データキャッシュ床 | +2 | +1 | +1 | `cyber_vault` | more | #3B2D74 |
| `sf-cyber-wave` | 波形パネル壁 | +3 | 0 | +1 | `cyber_stream` | less | #1B64B2 |
| `sf-future-transit` | リニアトランジット床 | +3 | +1 | +1 | `future_core` | normal | #3CD3A3 |
| `sf-future-aero` | エアロバリア壁 | +2 | 0 | +1 | `future_sky` | less | #2F83A9 |
| `sf-greenhouse-canopy` | 温室キャノピー床 | +2 | +1 | +1 | `orbital_greenhouse` | more | #4CFF8B |
| `sf-command-console` | 指令コンソール壁 | +3 | 0 | +1 | `orbital_command` | less | #3B76FF |
| `sf-quantum-prism` | プリズム導光床 | +3 | 0 | +2 | `quantum_prism` | normal | #FFC94F |
| `sf-chrono-platform` | 時間駅プラットフォーム | +2 | +1 | +1 | `chrono_station` | normal | #FF7BD1 |
| `sf-loop-gate` | ループゲート壁 | +3 | 0 | +2 | `chrono_loop` | less | #5DFFF2 |
| `sf-xeno-crystal-spire` | 結晶尖塔床 | +2 | +1 | +1 | `xeno_crystal` | normal | #5CF7FF |
| `sf-xeno-ruins-pillar` | 遺跡支柱壁 | +3 | 0 | +1 | `xeno_ruins` | less | #FFB86B |
| `sf-colony-foundry-crane` | 鋳造クレーン床 | +3 | +1 | +1 | `colony_foundry` | normal | #FF9055 |
| `sf-warp-conduit` | ワープ導管柱 | +3 | 0 | +1 | `spaceship_warp` | less | #5C9DFF |
| `sf-observatory-array` | 観測アレイ床 | +2 | +1 | +1 | `spaceship_observatory` | normal | #7DE9FF |
| `sf-arena-barrier` | アリーナ障壁 | +3 | 0 | +1 | `cyber_arena` | less | #FF43B9 |
| `sf-mirror-spire` | ミラースパイア | +2 | 0 | +1 | `cyber_mirror` | less | #7CFFEE |
| `sf-metro-switch` | メトロ分岐床 | +3 | +1 | +1 | `future_metro` | normal | #54FFE2 |
| `sf-cloud-anchor` | 浮遊アンカー | +2 | 0 | +1 | `future_cloudport` | less | #8DFFFA |
| `sf-scrap-gantry` | スクラップガントリー | +2 | +1 | +1 | `orbital_scrapyard` | normal | #FF7B42 |
| `sf-listening-dish` | 傍受ディッシュ | +3 | 0 | +1 | `orbital_listening` | less | #4CF2FF |
| `sf-flux-ribbon` | フラックスリボン床 | +3 | 0 | +2 | `quantum_flux` | normal | #FF72ED |
| `sf-chrono-weave` | クロノ織路 | +2 | +1 | +1 | `chrono_archive` | normal | #FF85D6 |
| `sf-fracture-gate` | 断層ゲート | +3 | 0 | +2 | `chrono_fracture` | less | #74FFF4 |
| `sf-hive-resonator` | ハイブレゾネーター | +2 | 0 | +1 | `xeno_hive` | less | #83FF5A |
| `sf-reef-bloom` | リーフブルーム | +2 | +1 | +1 | `xeno_reef` | normal | #5EFFF7 |
| `sf-vault-lockdown` | ロックダウン装置 | +3 | 0 | +1 | `colony_vault` | less | #FF9A4F |
| `sf-arcology-bridge` | アーコロジーブリッジ | +3 | +1 | +1 | `colony_arcology` | normal | #4CFFF4 |

#### 3rd ブロック（終盤〜エンドコンテンツ、推奨Lv 180〜220）
| key | 名称 | level | size | depth | bossFloors | type | chest | カラー |
|-----|------|-------|------|-------|------------|------|-------|--------|
| `sf-reactor-heart` | 炉心安定床 | +5 | +2 | +2 | [10,20] | `spaceship_core` | normal | #2FF5FF |
| `sf-ai-overmind` | オーバーマインド核 | +6 | +1 | +2 | [15] | `spaceship_ai` | less | #8F6CFF |
| `sf-glitch-singularity` | グリッチ特異点 | +6 | +1 | +3 | [12, 18] | `cyber_glitch` | less | #BCFF4D |
| `sf-vault-guardian` | ICE ガーディアン床 | +5 | +2 | +3 | [20] | `cyber_vault` | less | #5830C9 |
| `sf-sky-zenith` | ゼニス浮遊床 | +4 | +2 | +2 | [9, 18] | `future_sky` | more | #7FFFF8 |
| `sf-industrial-forge` | 星鋳炉床 | +5 | +2 | +2 | [14] | `future_industrial` | normal | #FFCB42 |
| `sf-orbit-guardian` | 軌道防衛壁 | +5 | +1 | +2 | [16] | `orbital_armory` | less | #FF546E |
| `sf-orbit-null` | 無重力制御床 | +5 | +1 | +2 | [12] | `orbital_lab` | normal | #66C9FF |
| `sf-quantum-core` | 量子核床 | +6 | +2 | +3 | [20] | `quantum_reactor` | less | #E23BFF |
| `sf-quantum-horizon` | 地平遮蔽壁 | +6 | +1 | +3 | [18] | `quantum_void` | less | #53FFCC |
| `sf-cyber-cascade` | 情報カスケード床 | +5 | +1 | +2 | [10, 15] | `cyber_stream` | normal | #35FFC0 |
| `sf-plaza-crown` | 王冠ホロ床 | +4 | +2 | +2 | [12] | `future_plaza` | more | #51FFFF |
| `sf-medbay-overseer` | メディカル監督核 | +5 | +1 | +2 | [8, 14] | `spaceship_medbay` | less | #66FFF3 |
| `sf-engineering-core` | エンジン制御心核 | +5 | +2 | +3 | [16] | `spaceship_engineering` | normal | #FFBE5C |
| `sf-forum-oracle` | フォーラムオラクル床 | +6 | +1 | +3 | [15] | `cyber_forum` | less | #D36BFF |
| `sf-subroutine-kernel` | サブルーチン核壁 | +5 | +1 | +2 | [11, 17] | `cyber_subroutine` | less | #4CFFB1 |
| `sf-chrono-paradox` | パラドックス交差床 | +6 | +2 | +3 | [13, 19] | `chrono_loop` | normal | #89FFF5 |
| `sf-xeno-elder` | 異星守護床 | +5 | +2 | +3 | [18] | `xeno_ruins` | less | #FFCD7A |
| `sf-xeno-maelstrom` | 潮汐メイルストロム床 | +5 | +2 | +3 | [10, 20] | `xeno_tide` | normal | #5DF7FF |
| `sf-colony-reactor-heart` | コロニー炉心核 | +6 | +2 | +3 | [20] | `colony_reactor` | less | #FF6CC4 |
| `sf-warp-singularity` | ワープ特異核 | +6 | +2 | +3 | [18] | `spaceship_warp` | less | #5C9DFF |
| `sf-observatory-core` | 観測中枢核 | +5 | +1 | +2 | [14] | `spaceship_observatory` | normal | #7DE9FF |
| `sf-arena-champion` | アリーナチャンピオン床 | +5 | +2 | +3 | [16] | `cyber_arena` | more | #FF43B9 |
| `sf-mirror-overseer` | ミラーオーバーシア壁 | +5 | +1 | +2 | [13] | `cyber_mirror` | less | #7CFFEE |
| `sf-metro-command` | メトロ司令床 | +5 | +2 | +2 | [15,22] | `future_metro` | normal | #54FFE2 |
| `sf-cloud-throne` | クラウドスローン床 | +5 | +2 | +2 | [12,19] | `future_cloudport` | more | #8DFFFA |
| `sf-scrap-overseer` | スクラップ監督核 | +5 | +1 | +2 | [17] | `orbital_scrapyard` | less | #FF7B42 |
| `sf-listening-core` | リスニング中枢 | +5 | +1 | +2 | [11,18] | `orbital_listening` | less | #4CF2FF |
| `sf-flux-heart` | フラックス心核 | +6 | +2 | +3 | [21] | `quantum_flux` | less | #FF72ED |
| `sf-chrono-vault` | クロノヴォールト床 | +5 | +1 | +2 | [13,20] | `chrono_archive` | normal | #FF85D6 |
| `sf-fracture-core` | 断層中核 | +6 | +1 | +3 | [19] | `chrono_fracture` | less | #74FFF4 |
| `sf-hive-queen` | ハイブクイーン床 | +5 | +2 | +3 | [18,24] | `xeno_hive` | more | #83FF5A |
| `sf-reef-titan` | リーフタイタン床 | +5 | +2 | +2 | [16] | `xeno_reef` | normal | #5EFFF7 |
| `sf-vault-command` | 備蓄指令核 | +6 | +1 | +2 | [19] | `colony_vault` | less | #FF9A4F |
| `sf-arcology-nexus` | アーコロジーネクサス | +6 | +2 | +3 | [22] | `colony_arcology` | normal | #4CFFF4 |

### 4.3 危険ブロック・ギミック
- `sf-laser-grid`（範囲ダメージ、周期3ターン）
- `sf-gravity-inverter`（上下反転、BlockDim 深度+1）
- `sf-data-spike`（データ破損デバフ、サイバー系）
- `sf-quantum-rift`（瞬間移動罠、位相ノード指定）
- `sf-arena-barrier`（ホログラム壁の開閉ギミック、周期4ターン）
- `sf-cloud-anchor`（強風ノックバック、浮遊ステージ）
- `sf-listening-dish`（信号パルスによる視界阻害）
- `sf-fracture-gate`（時間断層ワープ、接触で再配置）
- `sf-hive-resonator`（バフ/デバフ拡散、バイオ系）
- `sf-vault-lockdown`（ロックダウンで宝箱封鎖、解除条件付き）
- `sf-temporal-loop`（1ターン行動停止、`chrono_loop` 区画で高確率）
- `sf-crystal-resonator`（共鳴による範囲スタン、`xeno_crystal` 系）
- `sf-bio-spore`（継続毒ダメージ、`xeno_jungle` 系で拡散）
- `sf-nanite-surge`（装備耐久低下、`colony_foundry`/`future_underworks` で発生）

### 4.4 ユーティリティ/装飾ブロック案
- `sf-neon-beacon`（照明強化、`future_plaza`/`cyber_forum` で演出値+5）
- `sf-holo-directory`（案内端末、`future_core`/`colony_commons` でイベント誘発）
- `sf-zeroG-anchor`（浮遊制御、`orbital_lab`/`orbital_greenhouse` で移動速度+1）
- `sf-time-marker`（チェックポイント、`chrono_station` で復帰地点設定）
- `sf-xeno-pollen`（環境バフ、`xeno_jungle` でHP再生+継続毒の相殺）

## 5. 生成アルゴリズム詳細
### 5.1 共通フェーズ
1. **初期化**: `ctx.map` を壁で埋め、`ctx.random` をテーマごとにシード補正。
2. **層分割**: `Core/Support/Peripheral` を `ctx.height` に応じて帯域化。`spaceship_core` など特定タイプは Core の比率を 40% 以上に設定。
3. **ルーム敷設**: `ctx.structures.place` で中核構造を固定し、周辺は `ctx.carvePath` とランダムルーム生成（矩形/楕円/フラクタル）を組み合わせる。
4. **通路接続**: `ctx.aStar` でメインステーションを連結後、`ctx.ensureConnectivity()` で孤立領域を統合。
5. **ギミック配置**: `PoissonDiskSampler`（内部ユーティリティを addon 内に同梱）で候補点を生成し、`ctx.set` で罠/装飾を配置。危険密度は難易度スライダーから取得できる `ctx.meta.dangerLevel`（無い場合は推定）で調整。
6. **出口/ボス処理**: `ctx.fixedMaps.available` を確認し、固定マップが無い場合は最深部にボスルーム構造を配置。

### 5.2 タイプ別カスタマイズ例
- **`spaceship_core`**: 中央のリアクターチャンバーを `structures` の「放射状制御室」で生成。周囲に 6 本のベクタートンネルを `ctx.carvePath` で引き、`sf-reactor-heart` 系ブロックを優先配置。`ctx.meta.gravityVector`（Addon 内部管理）を階層ごとに変更し、プレイヤー向けに視覚エフェクトをタグ付け。
- **`spaceship_dock`**: MAP 全体を 3x3 の巨大セクションに分割し、中央に格納庫空間を確保。`ctx.structures.placePattern` で大型扉パターンを左右に設置し、`sf-magnetic-wall` を境界に使う。
- **`cyber_glitch`**: 乱数シードを 4 つ用意し、各ルームで `openSimplex2D` を適用して壁の歪みを計算。`ctx.set` で 5% の確率で `sf-glitch-singularity` を設置し、`ctx.structures.place` で断片パターンをランダム回転。
- **`cyber_stream`**: `ctx.carvePath` をベジエ補間（addon 内の `carveSpline` ヘルパー）で滑らかな曲線に変換。主要ルートには `sf-stream-bridge` を敷き、分岐点に `sf-cyber-cascade` を配置。
- **`future_sky`**: `ctx.height` を 3 層に分け、各層をフローティングプラットフォームとして `ctx.structures.place`。垂直連結は `createElevatorShaft(ctx)` ヘルパーで `sf-sky-lift` を連続配置。
- **`future_industrial`**: `ctx.width` をベルトラインに沿ってグリッド化し、`sf-industrial-conveyor` をストリーム配置。`ctx.ensureConnectivity()` 後に不要な壁を 20% 削除し、回遊動線を確保。
- **`future_metro`**: `weave` スタイルで水平・垂直ラインを編み込み、`ctx.scheduleTrain` でリニア車両を流す。`sf-metro-switch` と `sf-metro-command` をノードに置き、`ctx.meta.metroSignals` へ時刻表を保存。
- **`orbital_lab`**: `ctx.meta.zeroGravity = true` をセットし、プレイヤー向けに漂う通路を `ctx.structures.place` で小規模ハブとして配置。`sf-orbit-null` を 3D的に配置するため `scaleY` を 0.5 にしたパターンを用意。
- **`future_cloudport`**: `cluster` スタイルで浮遊港を構築し、`ctx.meta.windField` をノイズで生成。`sf-cloud-anchor` の座標で突風イベントを起こし、足場移動をダイナミックに演出。
- **`quantum_void`**: 基本レイアウトを `ctx.carvePath` で作らず、`ctx.structures.placePattern` でフラクタル型の空間を生成。`ctx.meta.phaseSlipPoints` を3箇所登録し、ワープリンクを `ctx.meta.warpPairs` に設定。
- **`quantum_flux`**: `sector` スタイルで多重リングを構築し、`ctx.meta.fluxPhase` を進行度で更新。リング交点に `sf-flux-ribbon` を配置し、中心に `sf-flux-heart` を据えてフェーズ変調ライトを演出。
- **`spaceship_medbay`**: `ctx.meta.infectionLevel` を管理し、滅菌ゾーン（Safe）と感染ゾーン（Risk）を色で明示。`sf-medbay-sterile` を Safe へ集中配置し、危険ゾーンには `sf-bio-spore` を混在させる。
- **`spaceship_engineering`**: `ctx.structures.grid` を使い、配管シャフトを縦横に巡らせる。`sf-engineering-grate` の連鎖でプレイヤー導線を暗示し、`sf-engineering-core` をボス部屋に固定。
- **`spaceship_warp`**: `sector` スタイルで 7 分割リングを生成し、`ctx.meta.warpPairs` に出入口ペアを設定。扇状アーム終端に `sf-warp-conduit` と `sf-warp-singularity` を配置し、緊急ベント用の `ctx.toggleDoor` ルーチンを追加。
- **`spaceship_observatory`**: `weave` スタイルで格子状の観測廊下を生成し、`ctx.meta.skybox` に星図IDを記録。交差点に `sf-observatory-array`、中央に `sf-observatory-core` を据えて光源を青白系に調整。
- **`cyber_forum`**: `ctx.meta.discussionNodes` を生成し、各ノードを `ctx.carvePath` で円形に接続。`sf-forum-stage` 周辺は `ctx.lightmap` にピンク系ネオンを追加。
- **`cyber_subroutine`**: `ctx.random.weightedPick` で補助ルーチン（回復/防御/攻撃）の比率を制御し、タイル種を `sf-subroutine-panel`・`sf-subroutine-kernel` で切り替える。
- **`cyber_arena`**: `weave` パターンをベースにラウンド数を `ctx.meta.arenaRounds` で制御。`sf-arena-barrier` の周期を4ターンで回し、敵ウェーブ生成を `ctx.scheduleEvent` に登録。
- **`cyber_mirror`**: `cluster` スタイルでミラーノードを生成し、`ctx.meta.reflectionPairs` を用意。`sf-mirror-spire` を中継して `ctx.teleport` 演出を挟み、色反転シェーダを割り当て。
- **`future_residential`**: 住居クラスターを `ctx.partitionGrid(4,4)` で生成し、共有スペースに `sf-colony-commons-floor` を取り込む。`ctx.meta.population` を算出し、イベントトリガー候補を記録。
- **`orbital_greenhouse`**: `ctx.meta.gravityVector` を微振動させ、植物プラットフォームを `sf-greenhouse-canopy` でリング状に配置。中央に `sf-zeroG-anchor` を置き浮遊を抑制。
- **`orbital_scrapyard`**: `cluster` スタイルのノードを `ctx.meta.scrapClusters` に記録し、`sf-scrap-gantry` で橋渡し。局所的に重力方向を反転させ、浮遊破片イベントを追加。
- **`orbital_listening`**: `sector` スタイルでアンテナリングを展開し、`ctx.meta.signalSweep` を時間更新。`sf-listening-dish` のパルスでマップ全体に一時的な霧を発生させる。
- **`chrono_station`/`chrono_loop`**: `ctx.timeline.split()`（addon 内ヘルパー）で時刻帯を分割し、`sf-chrono-platform`→`sf-loop-gate` の順に接続。時間逆行ルートは `sf-chrono-paradox` を通してショートカット化。
- **`chrono_archive`**: `weave` スタイルのアーカイブ路を `ctx.timeline.archives` に記録し、`sf-chrono-weave` と `sf-chrono-vault` を連結。取得したタイムログを `ctx.meta.timelineArtifacts` に保存してイベント連動を可能にする。
- **`chrono_fracture`**: `cluster` スタイルで断層ゲートを配置し、`ctx.timeline.fractures` に遅延イベントを追加。`sf-fracture-gate` の接触でプレイヤーを別セクターへ転送し、復帰地点に `ctx.markReturnPoint` を設定。
- **`xeno_jungle`**: `ctx.noise.fractal` で密度マップを生成し、密林セルに `sf-xeno-jungle-floor` と `sf-bio-spore` を 30% 比率で配置。開けた場所には `sf-xeno-elder` を配置し、イベント旗を立てる。
- **`xeno_hive`**: `cluster` スタイルで胞巣を生成し、`ctx.meta.hiveLanes` を敵AI経路として保持。`sf-hive-pith` と `sf-hive-queen` にフェロモン効果タグを付与し、出現敵のバフ制御に利用。
- **`xeno_reef`**: `weave` + ノイズ補正で潮流ルートを形成。`sf-reef-trellis` を主航路に、`sf-reef-bloom` を資源ポイントに配置し、`ctx.meta.tideCycle` で波周期を管理。
- **`colony_foundry`**: `ctx.structures.placeLine` でクレーン走行路を構築し、`sf-colony-foundry-crane` をチェックポイントに。`sf-nanite-surge` の配置密度でリスクコントロールを行う。
- **`colony_vault`**: `sector` スタイルで多重セキュリティリングを構築。`sf-vault-lockdown` が作動すると `ctx.lockDoors` で一定時間封鎖し、解除キーを `ctx.meta.vaultAccess` に格納。
- **`colony_arcology`**: `weave` スタイルで垂直街区を形成し、`sf-arcology-bridge` を高さ差分に応じて配置。`sf-arcology-nexus` を都市管理ノードとし、`ctx.meta.arcologyState` に住民動態を保存。

### 5.3 データ構造
- `addon.generators[].algorithm` 内では `ctx.meta` にカスタム情報を格納（例: `ctx.meta.gravityVector`, `ctx.meta.warpPairs`）。これらは `afterGenerate` コールバック（将来拡張）でも利用できるようキーを整理。
- `structures` の `tags` に `['sf_pack', 系統ID]` を付与し、他アドオンとの衝突を避けるため ID をネームスペース化。

## 6. データ定義ファイル
- `palettes.json`: `{ typeId: { floor: '#...', wall: '#...', accent: '#...', light: '#...' } }` 形式。`createGenerators()` 内で読み込み、`ctx.meta.palette` に付与。
- `structures.json`: ツールズタブで生成したパターンを収録。`importStructures()` で JSON を JS オブジェクトへ変換し、`addon.structures` に注入。
- `sf_pack_testcases.json`: 自動テスト用に、生成条件（難易度・乱数シード・プレイヤーレベル）を列挙するファイル。

## 7. ゲームプレイ連携
- `blockdata.json` 読み込み後に `blocks1/2/3` をマージするため、`key` が既存と衝突しないよう `sf-` プレフィックスを統一。
- Normal モードでは `mixin.normalMixed` を設定し、`DungeonGenRegistry` で重み付け抽選に参加。BlockDim 専用にしたい場合は `blockDimMixed` のみ設定。
- 敵・宝箱は既存テーブルを利用しつつ、`sf_spawn_rules.json` で推奨設定を別途提案（将来の敵拡張向け）。

## 8. テスト計画
1. **自動回帰**: `npm run test:dungeon -- --addon=sf_pack --count=1000`（ツールズタブ提供スクリプト）で 1000 回生成し、床タイル比率・平均経路長・ギミック密度を記録。
2. **視覚検証**: `tools/dungeon_viewer.html` を使い、各タイプ10回ずつスクリーンショット化。色ズレがあれば `palettes.json` を修正。
3. **性能測定**: `performance.now()` で `algorithm` 実行時間を取得し、1 回あたり 8ms 以内を目標。
4. **プレイテスト**: Normal/BlockDim でそれぞれ 3 階層攻略し、ギミック挙動とブロック出現率を確認。

## 9. ブレインストーミングノート
- **イベント**: 
  - 宇宙船系: 暴走 AI のシステムリブート、航行モード切替による環境変化。
  - サイバー系: ICE とハッカーの攻防戦、同期ノードの奪還タイムアタック。
  - 未来都市系: 空中交通を操作して経路制御、住民避難の護衛ミッション。
  - 軌道/量子系: ソーラー嵐の回避、位相崩壊を抑えるリアルタイムギミック。
- **協力プレイ**: 役割別（エンジニア・ハッカー・スカウト・クロノマンサー）に応じた補助ドローンを `ctx.meta.supportDrones` で制御する案。
- **拡張ブロック案**: 反射レーザー壁、時限ブリッジ、音響パズルタイル。`BlockSpec.meta` に挙動パラメータを持たせてスクリプト拡張。
- **追加生成タイプ候補**:
  - `spaceship_memorial`: 英雄記念ホール。追悼イベントとメモリアルデータログを配置。
  - `cyber_arena`: 対戦シミュレーション用アリーナ。プレイヤーとの模擬戦ギミック。
  - `future_harbor`: 空中港湾をテーマにして離着陸ルートと輸送ドローン管理を組み込む。
  - `xeno_reef`: 発光珊瑚の海底遺跡。水中重力と呼吸管理ギミックを追加。
  - `colony_archive`: 植民地の歴史資料庫。プレイヤーがログを収集して報酬獲得。
- **UI 連携**: BlockDim タブに「SF フィルター」を追加し、`type` が `sf_pack` で始まるブロックをまとめて表示するフィルタボタンを提案。
- **敵タイプ**: 位相ハンター、磁束セントリー、ホログラム幻影を想定し、将来の `sf_spawn_rules.json` 拡張に記録。


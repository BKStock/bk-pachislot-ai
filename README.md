# BK Pachislot AI

パチスロロジックエンジン — [pokie](https://github.com/sta-ger/pokie) フレームワークベース

## 🏯 吉宗（大都技研・4号機）エンジン

`src/yoshimune/` に実装済み。

### モジュール構成

| ファイル | 内容 |
|---|---|
| `YoshimuneConfig.ts` | 設定1-6の確率テーブル、モード定義、天井、払い出し定数 |
| `YoshimuneModeManager.ts` | 通常A/通常B/天国の3モード管理、天井カウント、モード移行抽選 |
| `YoshimuneBonusStock.ts` | ストック制御、BIG中の次回ボーナス抽選（最大4連） |
| `YoshimuneSymbols.ts` | シンボルID定義（7/BAR/チェリー/松/スイカ/ベル/リプレイ） |
| `YoshimuneReels.ts` | 3リール×21コマのリール配列 |
| `YoshimuneSession.ts` | メインゲームセッション（全モジュール統合） |

### 吉宗の内部仕様

- **モード制御**: 通常A (BB:RB=6:4), 通常B (BB:RB=4:6), 天国 (BB:RB=6:4, 天井193G)
- **天井**: 通常A/B=1921G, 天国=193G
- **ボーナス**: BIG=711枚, REG=127枚
- **ストック**: BIG中に1/8で次回ボーナス当選→1G連（最大4連蓄積）
- **小役解除**: チェリー1/32, 松1/160(天国確定), チャンス目1/13, 純ハズレ1/3276〜1/1092
- **設定差**: 設定1(機械割93%)〜設定6(機械割119%)

### デモ実行

```bash
npx tsx examples/yoshimune-demo.ts
```

設定1〜6で各1000G回し、ボーナス回数・機械割・天井到達回数などを表示します。

## セットアップ

```bash
npm install
```

## ライセンス

ISC

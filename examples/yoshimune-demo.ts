#!/usr/bin/env npx tsx
/**
 * 吉宗デモ — 設定1〜6で各1000G回してスタッツ表示
 */

import {
  YoshimuneSession,
  YoshimuneSetting,
  SETTING_TABLE,
} from "../src/yoshimune/index.js";

const TOTAL_GAMES = 1000;

function runSimulation(setting: YoshimuneSetting): void {
  const session = new YoshimuneSession(setting, 50000);
  const bonusGames: number[] = [];

  for (let i = 0; i < TOTAL_GAMES; i++) {
    if (!session.canPlay()) break;
    const result = session.spin();
    if (result.bonusTriggered) {
      bonusGames.push(result.game);
    }
  }

  const stats = session.getStats();
  const expectedPayout = SETTING_TABLE[setting].payout;

  console.log(`\n${"=".repeat(50)}`);
  console.log(`【設定${setting}】 理論機械割: ${expectedPayout}%`);
  console.log(`${"=".repeat(50)}`);
  console.log(`  総ゲーム数:  ${stats.totalGames}`);
  console.log(`  総IN:        ${stats.totalIn}枚`);
  console.log(`  総OUT:       ${stats.totalOut}枚`);
  console.log(`  実機械割:    ${stats.payout.toFixed(1)}%`);
  console.log(`  BIG回数:     ${stats.bigCount}`);
  console.log(`  REG回数:     ${stats.regCount}`);
  console.log(`  天井到達:    ${stats.ceilingCount}回`);
  console.log(`  ストック消費: ${stats.stockCount}回`);
  console.log(`  残クレジット: ${session.getCredits()}`);

  if (bonusGames.length > 0) {
    const intervals: number[] = [];
    for (let i = 1; i < bonusGames.length; i++) {
      intervals.push(bonusGames[i] - bonusGames[i - 1]);
    }
    const avgInterval =
      intervals.length > 0
        ? (intervals.reduce((a, b) => a + b, 0) / intervals.length).toFixed(0)
        : "N/A";
    console.log(`  平均ボーナス間隔: ${avgInterval}G`);
  }
}

console.log("🏯 吉宗シミュレーション（各設定 1000G）");
console.log(`  初期クレジット: 50000枚`);

for (const s of [1, 2, 3, 4, 5, 6] as YoshimuneSetting[]) {
  runSimulation(s);
}

console.log(`\n${"=".repeat(50)}`);
console.log("シミュレーション完了 🎰");

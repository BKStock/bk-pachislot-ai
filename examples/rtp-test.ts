import { YoshimuneSession } from "../src/yoshimune/YoshimuneSession.js";
import { YoshimuneSetting, SETTING_TABLE } from "../src/yoshimune/YoshimuneConfig.js";

const GAMES = 500000;

console.log(`\n🎰 吉宗 RTP検証 (${GAMES.toLocaleString()}G × 6設定)\n`);

for (let s = 1; s <= 6; s++) {
  const setting = s as YoshimuneSetting;
  const session = new YoshimuneSession(setting, 999999);
  
  for (let i = 0; i < GAMES; i++) {
    if (!session.canPlay()) break;
    session.spin();
  }
  
  const stats = session.getStats();
  const target = SETTING_TABLE[setting].payout;
  const diff = stats.payout - target;
  const ok = Math.abs(diff) < 3 ? "✅" : "❌";
  
  console.log(`設定${s}: 目標${target}% → 実測${stats.payout.toFixed(1)}% (差${diff > 0 ? '+' : ''}${diff.toFixed(1)}) ${ok} | BIG:${stats.bigCount} REG:${stats.regCount} 天井:${stats.ceilingCount} Stock:${stats.stockCount}`);
}

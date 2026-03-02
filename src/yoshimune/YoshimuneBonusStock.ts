/**
 * 吉宗ボーナスストック制御
 * BIG中に次回ボーナス抽選 → 当選で1G連（最大4連蓄積）
 */

import { BIG_STOCK_PROB_DENUM, MAX_STOCK } from "./YoshimuneConfig.js";

export type BonusType = "BIG" | "REG";

export class YoshimuneBonusStock {
  private stock: BonusType[] = [];

  getStockCount(): number {
    return this.stock.length;
  }

  hasStock(): boolean {
    return this.stock.length > 0;
  }

  /** ストックからボーナスを消費 */
  consumeStock(): BonusType | null {
    return this.stock.shift() ?? null;
  }

  /** BIG消化中のストック抽選（BIG1回につき1回抽選） */
  lotDuringBig(bbRatio: number): void {
    if (this.stock.length >= MAX_STOCK) return;

    // BIG中の次回ボーナスストック抽選
    if (Math.random() < 1 / BIG_STOCK_PROB_DENUM) {
      const type: BonusType = Math.random() < bbRatio ? "BIG" : "REG";
      this.stock.push(type);
    }
  }

  /** 直接ストックを追加（天井到達時など） */
  addStock(type: BonusType): void {
    if (this.stock.length < MAX_STOCK) {
      this.stock.push(type);
    }
  }

  reset(): void {
    this.stock = [];
  }
}

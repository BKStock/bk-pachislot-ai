/**
 * 吉宗メインゲームセッション — 全モジュール統合
 */

import {
  YoshimuneSetting,
  YoshimuneMode,
  SETTING_TABLE,
  KOYAKU_PROB,
  KOYAKU_KAIJO,
  MODE_BB_RATIO,
  BIG_PAYOUT,
  REG_PAYOUT,
  BET_PER_GAME,
} from "./YoshimuneConfig.js";
import { YoshimuneModeManager } from "./YoshimuneModeManager.js";
import { YoshimuneBonusStock, BonusType } from "./YoshimuneBonusStock.js";
import { REELS, REEL_LENGTH } from "./YoshimuneReels.js";
import { SymbolId, SYMBOLS } from "./YoshimuneSymbols.js";

export type KoyakuResult =
  | "cherry"
  | "matsu"
  | "suika"
  | "bell"
  | "replay"
  | "chance"
  | "hazure";

export interface SpinResult {
  game: number;
  mode: YoshimuneMode;
  reelStops: [SymbolId, SymbolId, SymbolId];
  koyaku: KoyakuResult;
  bonusTriggered: BonusType | null;
  bonusPayout: number;
  isCeiling: boolean;
  isStock: boolean;
  credits: number;
}

export interface SessionStats {
  totalGames: number;
  totalIn: number;
  totalOut: number;
  bigCount: number;
  regCount: number;
  ceilingCount: number;
  stockCount: number;
  payout: number;
}

export class YoshimuneSession {
  private setting: YoshimuneSetting;
  private modeManager: YoshimuneModeManager;
  private bonusStock: YoshimuneBonusStock;
  private credits: number;
  private totalGames = 0;
  private totalIn = 0;
  private totalOut = 0;
  private bigCount = 0;
  private regCount = 0;
  private ceilingCount = 0;
  private stockTriggerCount = 0;

  constructor(setting: YoshimuneSetting = 1, initialCredits = 50000) {
    this.setting = setting;
    this.credits = initialCredits;
    this.modeManager = new YoshimuneModeManager(setting);
    this.bonusStock = new YoshimuneBonusStock();
  }

  getSetting(): YoshimuneSetting {
    return this.setting;
  }

  getCredits(): number {
    return this.credits;
  }

  getMode(): YoshimuneMode {
    return this.modeManager.getMode();
  }

  getGamesSinceBonus(): number {
    return this.modeManager.getGamesSinceBonus();
  }

  getStats(): SessionStats {
    return {
      totalGames: this.totalGames,
      totalIn: this.totalIn,
      totalOut: this.totalOut,
      bigCount: this.bigCount,
      regCount: this.regCount,
      ceilingCount: this.ceilingCount,
      stockCount: this.stockTriggerCount,
      payout: this.totalIn > 0 ? (this.totalOut / this.totalIn) * 100 : 0,
    };
  }

  /** リールストップをランダム生成 */
  private spinReels(): [SymbolId, SymbolId, SymbolId] {
    return REELS.map((reel) => {
      const pos = Math.floor(Math.random() * REEL_LENGTH);
      return reel[pos];
    }) as [SymbolId, SymbolId, SymbolId];
  }

  /** 小役抽選（確率ベース） */
  private drawKoyaku(): KoyakuResult {
    const r = Math.random();
    let cumulative = 0;

    const probs: [KoyakuResult, number][] = [
      ["replay", 1 / KOYAKU_PROB.replay],
      ["bell", 1 / KOYAKU_PROB.bell],
      ["suika", 1 / KOYAKU_PROB.suika],
      ["cherry", 1 / KOYAKU_PROB.cherry],
      ["matsu", 1 / KOYAKU_PROB.matsu],
      ["chance", 1 / KOYAKU_PROB.chance],
    ];

    for (const [name, prob] of probs) {
      cumulative += prob;
      if (r < cumulative) return name;
    }
    return "hazure";
  }

  /** 小役からのボーナス解除抽選 */
  private checkKoyakuKaijo(koyaku: KoyakuResult): boolean {
    switch (koyaku) {
      case "cherry":
        return Math.random() < 1 / KOYAKU_KAIJO.cherry;
      case "matsu":
        return Math.random() < 1 / KOYAKU_KAIJO.matsu;
      case "chance":
        return Math.random() < 1 / KOYAKU_KAIJO.chance;
      case "hazure": {
        const denum = SETTING_TABLE[this.setting].junkHazureKaijoDenum;
        return Math.random() < 1 / denum;
      }
      default:
        return false;
    }
  }

  /** ボーナスタイプを決定 */
  private determineBonusType(forceTengoku = false): BonusType {
    if (forceTengoku) return "BIG"; // 松解除は天国確定、BIG優遇
    const bbRatio = MODE_BB_RATIO[this.modeManager.getMode()];
    return Math.random() < bbRatio ? "BIG" : "REG";
  }

  /** ボーナス消化 */
  private processBonus(type: BonusType): number {
    const payout = type === "BIG" ? BIG_PAYOUT : REG_PAYOUT;

    if (type === "BIG") {
      this.bigCount++;
      // BIG中にストック抽選
      const bbRatio = MODE_BB_RATIO[this.modeManager.getMode()];
      this.bonusStock.lotDuringBig(bbRatio);
    } else {
      this.regCount++;
    }

    this.credits += payout;
    this.totalOut += payout;
    return payout;
  }

  /** 小役の払い出し枚数 */
  private koyakuPayout(koyaku: KoyakuResult): number {
    switch (koyaku) {
      case "bell": return 10;
      case "suika": return 5;
      case "cherry": return 2;
      case "matsu": return 2;
      case "replay": return BET_PER_GAME; // リプレイ（BET返還）
      default: return 0;
    }
  }

  /** 1ゲーム実行 */
  spin(): SpinResult {
    this.totalGames++;
    this.credits -= BET_PER_GAME;
    this.totalIn += BET_PER_GAME;

    const reelStops = this.spinReels();
    const koyaku = this.drawKoyaku();

    // 小役払い出し
    const kPay = this.koyakuPayout(koyaku);
    if (koyaku !== "replay") {
      this.credits += kPay;
      this.totalOut += kPay;
    } else {
      // リプレイはBET返還
      this.credits += BET_PER_GAME;
      this.totalIn -= BET_PER_GAME;
    }

    this.modeManager.incrementGames();

    let bonusTriggered: BonusType | null = null;
    let bonusPayout = 0;
    let isCeiling = false;
    let isStock = false;

    // ストック消費チェック（1G連）
    if (this.bonusStock.hasStock()) {
      bonusTriggered = this.bonusStock.consumeStock();
      isStock = true;
      this.stockTriggerCount++;
    }
    // 天井チェック
    else if (this.modeManager.isCeilingReached()) {
      bonusTriggered = this.determineBonusType();
      isCeiling = true;
      this.ceilingCount++;
    }
    // 小役解除チェック
    else if (this.checkKoyakuKaijo(koyaku)) {
      const forceTengoku = koyaku === "matsu";
      bonusTriggered = this.determineBonusType(forceTengoku);
    }

    // ボーナス処理
    if (bonusTriggered) {
      bonusPayout = this.processBonus(bonusTriggered);
      this.modeManager.resetGames();

      // モード移行（松解除は天国確定）
      const forceTengoku = koyaku === "matsu" && !isStock && !isCeiling;
      this.modeManager.transitionMode(forceTengoku);
    }

    return {
      game: this.totalGames,
      mode: this.modeManager.getMode(),
      reelStops,
      koyaku,
      bonusTriggered,
      bonusPayout,
      isCeiling,
      isStock,
      credits: this.credits,
    };
  }

  canPlay(): boolean {
    return this.credits >= BET_PER_GAME;
  }
}

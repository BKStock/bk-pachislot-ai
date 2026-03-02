/**
 * 吉宗モード管理 — RTテーブルによる規定G数放出 + 天井管理
 * 
 * 実機の吉宗はストック機で、内部RTテーブルに基づく規定G数消化が
 * メインのボーナス放出契機。天井はRTテーブルの最大値。
 */

import {
  YoshimuneMode,
  YoshimuneSetting,
  SETTING_TABLE,
  MODE_CEILING,
  MODE_TRANSITION,
} from "./YoshimuneConfig.js";

/**
 * 内部RTテーブル — モード別の規定G数振り分け
 * 吉宗は規定G数消化でボーナスを放出するストック機
 */
const RT_TABLE: Record<YoshimuneMode, { games: number; weight: number }[]> = {
  [YoshimuneMode.NORMAL_A]: [
    { games: 200, weight: 3 },
    { games: 400, weight: 5 },
    { games: 600, weight: 8 },
    { games: 800, weight: 12 },
    { games: 1000, weight: 15 },
    { games: 1200, weight: 15 },
    { games: 1400, weight: 12 },
    { games: 1600, weight: 10 },
    { games: 1800, weight: 8 },
    { games: 1921, weight: 12 },  // 天井
  ],
  [YoshimuneMode.NORMAL_B]: [
    { games: 200, weight: 2 },
    { games: 400, weight: 4 },
    { games: 600, weight: 6 },
    { games: 800, weight: 10 },
    { games: 1000, weight: 14 },
    { games: 1200, weight: 16 },
    { games: 1400, weight: 14 },
    { games: 1600, weight: 12 },
    { games: 1800, weight: 10 },
    { games: 1921, weight: 12 },
  ],
  [YoshimuneMode.TENGOKU]: [
    { games: 1, weight: 30 },
    { games: 10, weight: 10 },
    { games: 32, weight: 10 },
    { games: 64, weight: 10 },
    { games: 100, weight: 15 },
    { games: 128, weight: 10 },
    { games: 193, weight: 15 },  // 天国天井
  ],
};

/** RTテーブルから規定G数を抽選（設定による深さ補正あり） */
function drawRTGames(mode: YoshimuneMode, setting: YoshimuneSetting = 1): number {
  const table = RT_TABLE[mode];
  const factor = SETTING_TABLE[setting].rtDepthFactor;
  const totalWeight = table.reduce((sum, e) => sum + e.weight, 0);
  let r = Math.random() * totalWeight;
  for (const entry of table) {
    r -= entry.weight;
    if (r <= 0) {
      // 設定による深さ補正（高設定ほど浅くなる）
      const adjusted = Math.max(1, Math.round(entry.games * factor));
      const ceiling = MODE_CEILING[mode];
      return Math.min(adjusted, ceiling);
    }
  }
  return table[table.length - 1].games;
}

export class YoshimuneModeManager {
  private mode: YoshimuneMode = YoshimuneMode.NORMAL_A;
  private gamesSinceBonusHit = 0;
  private targetGames: number;
  private setting: YoshimuneSetting;

  constructor(setting: YoshimuneSetting = 1) {
    this.setting = setting;
    this.targetGames = drawRTGames(this.mode, this.setting);
  }

  getMode(): YoshimuneMode {
    return this.mode;
  }

  getGamesSinceBonus(): number {
    return this.gamesSinceBonusHit;
  }

  /** 1ゲーム進行 */
  incrementGames(): void {
    this.gamesSinceBonusHit++;
  }

  /** 規定G数到達チェック（天井含む） */
  isCeilingReached(): boolean {
    return this.gamesSinceBonusHit >= this.targetGames;
  }

  /** ボーナス当選時にゲーム数リセット */
  resetGames(): void {
    this.gamesSinceBonusHit = 0;
  }

  /** ボーナス終了時のモード移行抽選 + 新しいRTテーブル抽選 */
  transitionMode(forceTengoku = false): YoshimuneMode {
    if (forceTengoku) {
      this.mode = YoshimuneMode.TENGOKU;
    } else {
      const table = MODE_TRANSITION[this.mode];
      const rand = Math.random();

      if (rand < table.normalA) {
        this.mode = YoshimuneMode.NORMAL_A;
      } else if (rand < table.normalA + table.normalB) {
        this.mode = YoshimuneMode.NORMAL_B;
      } else {
        this.mode = YoshimuneMode.TENGOKU;
      }
    }

    // 新しい規定G数を抽選
    this.targetGames = drawRTGames(this.mode, this.setting);
    return this.mode;
  }

  getCeiling(): number {
    return MODE_CEILING[this.mode];
  }

  getTargetGames(): number {
    return this.targetGames;
  }
}

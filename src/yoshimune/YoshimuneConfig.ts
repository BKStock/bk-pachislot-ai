/**
 * 吉宗（大都技研・4号機）設定テーブル
 */

export type YoshimuneSetting = 1 | 2 | 3 | 4 | 5 | 6;

export enum YoshimuneMode {
  NORMAL_A = "NORMAL_A",
  NORMAL_B = "NORMAL_B",
  TENGOKU = "TENGOKU",
}

export interface SettingConfig {
  /** 純ハズレからの解除確率 (分母) */
  junkHazureKaijoDenum: number;
  /** 機械割 (%) */
  payout: number;
  /** BIG確率 (通常時合算, 分母) */
  bigProbDenum: number;
  /** REG確率 (通常時合算, 分母) */
  regProbDenum: number;
  /** RTテーブル重心補正 (1.0=標準, <1.0=浅い, >1.0=深い) */
  rtDepthFactor: number;
}

/** 設定別パラメータ */
export const SETTING_TABLE: Record<YoshimuneSetting, SettingConfig> = {
  1: { junkHazureKaijoDenum: 3276, payout: 93, bigProbDenum: 380, regProbDenum: 630, rtDepthFactor: 1.15 },
  2: { junkHazureKaijoDenum: 2730, payout: 97, bigProbDenum: 355, regProbDenum: 580, rtDepthFactor: 1.06 },
  3: { junkHazureKaijoDenum: 2184, payout: 101, bigProbDenum: 330, regProbDenum: 530, rtDepthFactor: 0.84 },
  4: { junkHazureKaijoDenum: 1638, payout: 106, bigProbDenum: 290, regProbDenum: 460, rtDepthFactor: 0.76 },
  5: { junkHazureKaijoDenum: 1310, payout: 112, bigProbDenum: 250, regProbDenum: 390, rtDepthFactor: 0.60 },
  6: { junkHazureKaijoDenum: 1092, payout: 119, bigProbDenum: 215, regProbDenum: 340, rtDepthFactor: 0.48 },
};

/** 小役確率 (全設定共通, 分母) */
/** 小役確率 (全設定共通, 分母) */
export const KOYAKU_PROB = {
  cherry: 33,    // チェリー 約1/33
  matsu: 400,    // 松 約1/400
  suika: 64,     // スイカ 約1/64
  bell: 8,       // ベル 約1/8
  replay: 7.3,   // リプレイ 約1/7.3
  chance: 100,   // チャンス目 約1/100
} as const;

/** 小役からの解除確率 (分母) */
export const KOYAKU_KAIJO = {
  cherry: 40,    // チェリー成立時 1/40で解除
  matsu: 200,    // 松成立時 1/200で解除（天国確定）
  chance: 20,    // チャンス目 1/20で解除
} as const;

/** モード別天井 */
export const MODE_CEILING: Record<YoshimuneMode, number> = {
  [YoshimuneMode.NORMAL_A]: 1921,
  [YoshimuneMode.NORMAL_B]: 1921,
  [YoshimuneMode.TENGOKU]: 193,
};

/** モード別 BB:RB 比率 (BBの割合) */
export const MODE_BB_RATIO: Record<YoshimuneMode, number> = {
  [YoshimuneMode.NORMAL_A]: 0.6,
  [YoshimuneMode.NORMAL_B]: 0.4,
  [YoshimuneMode.TENGOKU]: 0.6,
};

/** ボーナス払い出し枚数 */
export const BIG_PAYOUT = 711;
export const REG_PAYOUT = 127;

/** BIG中の次回ボーナスストック当選確率 (分母) — BIG中の24G中に1回抽選 */
export const BIG_STOCK_PROB_DENUM = 32;

/** 最大ストック数 */
export const MAX_STOCK = 4;

/** 1ゲームあたりのコイン消費 */
export const BET_PER_GAME = 3;

/** モード移行確率テーブル (ボーナス終了時) */
/** モード移行確率テーブル (ボーナス終了時) */
export const MODE_TRANSITION: Record<YoshimuneMode, { normalA: number; normalB: number; tengoku: number }> = {
  [YoshimuneMode.NORMAL_A]: { normalA: 0.55, normalB: 0.30, tengoku: 0.15 },
  [YoshimuneMode.NORMAL_B]: { normalA: 0.40, normalB: 0.35, tengoku: 0.25 },
  [YoshimuneMode.TENGOKU]:  { normalA: 0.40, normalB: 0.20, tengoku: 0.40 },
};

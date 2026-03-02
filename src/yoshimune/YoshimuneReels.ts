/**
 * 吉宗リール配列（3リール × 21コマ）
 * 実機を参考にした配列
 */

import { SYMBOLS, SymbolId } from "./YoshimuneSymbols.js";

const S = SYMBOLS;

/** 左リール (21コマ) */
export const LEFT_REEL: SymbolId[] = [
  S.SEVEN, S.BLANK, S.BELL, S.SUIKA, S.REPLAY, S.CHERRY, S.BELL,
  S.BLANK, S.MATSU, S.BELL, S.REPLAY, S.BLANK, S.BAR, S.BELL,
  S.CHERRY, S.SUIKA, S.REPLAY, S.BLANK, S.BELL, S.BLANK, S.BELL,
];

/** 中リール (21コマ) */
export const CENTER_REEL: SymbolId[] = [
  S.SEVEN, S.BLANK, S.BELL, S.REPLAY, S.SUIKA, S.BLANK, S.BELL,
  S.CHERRY, S.BLANK, S.BELL, S.REPLAY, S.BAR, S.BLANK, S.BELL,
  S.SUIKA, S.BLANK, S.REPLAY, S.BELL, S.MATSU, S.BLANK, S.BELL,
];

/** 右リール (21コマ) */
export const RIGHT_REEL: SymbolId[] = [
  S.SEVEN, S.BLANK, S.BELL, S.REPLAY, S.BLANK, S.SUIKA, S.BELL,
  S.BLANK, S.BELL, S.CHERRY, S.REPLAY, S.BLANK, S.BELL, S.BAR,
  S.BLANK, S.BELL, S.SUIKA, S.REPLAY, S.MATSU, S.BLANK, S.BELL,
];

export const REELS = [LEFT_REEL, CENTER_REEL, RIGHT_REEL] as const;
export const REEL_LENGTH = 21;

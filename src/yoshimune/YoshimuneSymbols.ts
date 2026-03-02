/**
 * 吉宗シンボル定義
 */

export const SYMBOLS = {
  SEVEN: "7",
  BAR: "BAR",
  CHERRY: "CHR",
  MATSU: "MTU",
  SUIKA: "SUI",
  BELL: "BEL",
  REPLAY: "RPL",
  BLANK: "BLK",
} as const;

export type SymbolId = (typeof SYMBOLS)[keyof typeof SYMBOLS];

export const SYMBOL_NAMES: Record<SymbolId, string> = {
  [SYMBOLS.SEVEN]: "七",
  [SYMBOLS.BAR]: "BAR",
  [SYMBOLS.CHERRY]: "チェリー",
  [SYMBOLS.MATSU]: "松",
  [SYMBOLS.SUIKA]: "スイカ",
  [SYMBOLS.BELL]: "ベル",
  [SYMBOLS.REPLAY]: "リプレイ",
  [SYMBOLS.BLANK]: "ハズレ",
};

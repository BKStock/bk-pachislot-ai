/**
 * 吉宗数理エンジン — TypeScript版をJavaScriptに移植
 */

// === Symbols ===
const SYMBOLS = {
  SEVEN: "7", BAR: "BAR", CHERRY: "CHR", MATSU: "MTU",
  SUIKA: "SUI", BELL: "BEL", REPLAY: "RPL", BLANK: "BLK",
};

const SYMBOL_DISPLAY = {
  "7": { text: "7", color: "#ff2222", fontSize: 1.3, img: "img/seven.svg" },
  "BAR": { text: "BAR", color: "#ffffff", fontSize: 0.7, img: "img/bar.svg" },
  "CHR": { text: "CHR", color: null, fontSize: 1.0, img: "img/cherry.svg" },
  "MTU": { text: "MTU", color: null, fontSize: 1.0, img: "img/matsu.svg" },
  "SUI": { text: "SUI", color: null, fontSize: 1.0, img: "img/suika.svg" },
  "BEL": { text: "BEL", color: null, fontSize: 1.0, img: "img/bell.svg" },
  "RPL": { text: "RPL", color: null, fontSize: 1.0, img: "img/replay.svg" },
  "BLK": { text: "－", color: "#666666", fontSize: 0.8, img: "img/blank.svg" },
};

const SYMBOL_NAMES = {
  "7": "七", "BAR": "BAR", "CHR": "チェリー", "MTU": "松",
  "SUI": "スイカ", "BEL": "ベル", "RPL": "リプレイ", "BLK": "ハズレ",
};

// === Reels ===
const S = SYMBOLS;
const LEFT_REEL = [
  S.SEVEN, S.BLANK, S.BELL, S.SUIKA, S.REPLAY, S.CHERRY, S.BELL,
  S.BLANK, S.MATSU, S.BELL, S.REPLAY, S.BLANK, S.BAR, S.BELL,
  S.CHERRY, S.SUIKA, S.REPLAY, S.BLANK, S.BELL, S.BLANK, S.BELL,
];
const CENTER_REEL = [
  S.SEVEN, S.BLANK, S.BELL, S.REPLAY, S.SUIKA, S.BLANK, S.BELL,
  S.CHERRY, S.BLANK, S.BELL, S.REPLAY, S.BAR, S.BLANK, S.BELL,
  S.SUIKA, S.BLANK, S.REPLAY, S.BELL, S.MATSU, S.BLANK, S.BELL,
];
const RIGHT_REEL = [
  S.SEVEN, S.BLANK, S.BELL, S.REPLAY, S.BLANK, S.SUIKA, S.BELL,
  S.BLANK, S.BELL, S.CHERRY, S.REPLAY, S.BLANK, S.BELL, S.BAR,
  S.BLANK, S.BELL, S.SUIKA, S.REPLAY, S.MATSU, S.BLANK, S.BELL,
];
const REELS = [LEFT_REEL, CENTER_REEL, RIGHT_REEL];
const REEL_LENGTH = 21;

// === Config ===
const YoshimuneMode = { NORMAL_A: "NORMAL_A", NORMAL_B: "NORMAL_B", TENGOKU: "TENGOKU" };

const SETTING_TABLE = {
  1: { junkHazureKaijoDenum: 3276, payout: 93, bigProbDenum: 380, regProbDenum: 630, rtDepthFactor: 1.15 },
  2: { junkHazureKaijoDenum: 2730, payout: 97, bigProbDenum: 355, regProbDenum: 580, rtDepthFactor: 1.06 },
  3: { junkHazureKaijoDenum: 2184, payout: 101, bigProbDenum: 330, regProbDenum: 530, rtDepthFactor: 0.84 },
  4: { junkHazureKaijoDenum: 1638, payout: 106, bigProbDenum: 290, regProbDenum: 460, rtDepthFactor: 0.76 },
  5: { junkHazureKaijoDenum: 1310, payout: 112, bigProbDenum: 250, regProbDenum: 390, rtDepthFactor: 0.60 },
  6: { junkHazureKaijoDenum: 1092, payout: 119, bigProbDenum: 215, regProbDenum: 340, rtDepthFactor: 0.48 },
};

const KOYAKU_PROB = { cherry: 33, matsu: 400, suika: 64, bell: 8, replay: 7.3, chance: 100 };
const KOYAKU_KAIJO = { cherry: 40, matsu: 200, chance: 20 };

const MODE_CEILING = {
  [YoshimuneMode.NORMAL_A]: 1921, [YoshimuneMode.NORMAL_B]: 1921, [YoshimuneMode.TENGOKU]: 193,
};
const MODE_BB_RATIO = {
  [YoshimuneMode.NORMAL_A]: 0.6, [YoshimuneMode.NORMAL_B]: 0.4, [YoshimuneMode.TENGOKU]: 0.6,
};
const MODE_TRANSITION = {
  [YoshimuneMode.NORMAL_A]: { normalA: 0.55, normalB: 0.30, tengoku: 0.15 },
  [YoshimuneMode.NORMAL_B]: { normalA: 0.40, normalB: 0.35, tengoku: 0.25 },
  [YoshimuneMode.TENGOKU]:  { normalA: 0.40, normalB: 0.20, tengoku: 0.40 },
};

const BIG_PAYOUT = 711;
const REG_PAYOUT = 127;
const BIG_STOCK_PROB_DENUM = 32;
const MAX_STOCK = 4;
const BET_PER_GAME = 3;

// === RT Table ===
const RT_TABLE = {
  [YoshimuneMode.NORMAL_A]: [
    { games: 200, weight: 3 }, { games: 400, weight: 5 }, { games: 600, weight: 8 },
    { games: 800, weight: 12 }, { games: 1000, weight: 15 }, { games: 1200, weight: 15 },
    { games: 1400, weight: 12 }, { games: 1600, weight: 10 }, { games: 1800, weight: 8 },
    { games: 1921, weight: 12 },
  ],
  [YoshimuneMode.NORMAL_B]: [
    { games: 200, weight: 2 }, { games: 400, weight: 4 }, { games: 600, weight: 6 },
    { games: 800, weight: 10 }, { games: 1000, weight: 14 }, { games: 1200, weight: 16 },
    { games: 1400, weight: 14 }, { games: 1600, weight: 12 }, { games: 1800, weight: 10 },
    { games: 1921, weight: 12 },
  ],
  [YoshimuneMode.TENGOKU]: [
    { games: 1, weight: 30 }, { games: 10, weight: 10 }, { games: 32, weight: 10 },
    { games: 64, weight: 10 }, { games: 100, weight: 15 }, { games: 128, weight: 10 },
    { games: 193, weight: 15 },
  ],
};

function drawRTGames(mode, setting = 1) {
  const table = RT_TABLE[mode];
  const factor = SETTING_TABLE[setting].rtDepthFactor;
  const totalWeight = table.reduce((sum, e) => sum + e.weight, 0);
  let r = Math.random() * totalWeight;
  for (const entry of table) {
    r -= entry.weight;
    if (r <= 0) {
      const adjusted = Math.max(1, Math.round(entry.games * factor));
      return Math.min(adjusted, MODE_CEILING[mode]);
    }
  }
  return table[table.length - 1].games;
}

// === BonusStock ===
class YoshimuneBonusStock {
  constructor() { this.stock = []; }
  getStockCount() { return this.stock.length; }
  hasStock() { return this.stock.length > 0; }
  consumeStock() { return this.stock.shift() ?? null; }
  lotDuringBig(bbRatio) {
    if (this.stock.length >= MAX_STOCK) return;
    if (Math.random() < 1 / BIG_STOCK_PROB_DENUM) {
      this.stock.push(Math.random() < bbRatio ? "BIG" : "REG");
    }
  }
  addStock(type) { if (this.stock.length < MAX_STOCK) this.stock.push(type); }
  reset() { this.stock = []; }
}

// === ModeManager ===
class YoshimuneModeManager {
  constructor(setting = 1) {
    this.setting = setting;
    this.mode = YoshimuneMode.NORMAL_A;
    this.gamesSinceBonusHit = 0;
    this.targetGames = drawRTGames(this.mode, this.setting);
  }
  getMode() { return this.mode; }
  getGamesSinceBonus() { return this.gamesSinceBonusHit; }
  incrementGames() { this.gamesSinceBonusHit++; }
  isCeilingReached() { return this.gamesSinceBonusHit >= this.targetGames; }
  resetGames() { this.gamesSinceBonusHit = 0; }
  transitionMode(forceTengoku = false) {
    if (forceTengoku) {
      this.mode = YoshimuneMode.TENGOKU;
    } else {
      const table = MODE_TRANSITION[this.mode];
      const rand = Math.random();
      if (rand < table.normalA) this.mode = YoshimuneMode.NORMAL_A;
      else if (rand < table.normalA + table.normalB) this.mode = YoshimuneMode.NORMAL_B;
      else this.mode = YoshimuneMode.TENGOKU;
    }
    this.targetGames = drawRTGames(this.mode, this.setting);
    return this.mode;
  }
  getCeiling() { return MODE_CEILING[this.mode]; }
  getTargetGames() { return this.targetGames; }
}

// === Session ===
class YoshimuneSession {
  constructor(setting = 1, initialCredits = 5000) {
    this.setting = setting;
    this.credits = initialCredits;
    this.modeManager = new YoshimuneModeManager(setting);
    this.bonusStock = new YoshimuneBonusStock();
    this.totalGames = 0;
    this.totalIn = 0;
    this.totalOut = 0;
    this.bigCount = 0;
    this.regCount = 0;
    this.ceilingCount = 0;
    this.stockTriggerCount = 0;
  }

  getSetting() { return this.setting; }
  getCredits() { return this.credits; }
  getMode() { return this.modeManager.getMode(); }
  getGamesSinceBonus() { return this.modeManager.getGamesSinceBonus(); }

  getStats() {
    return {
      totalGames: this.totalGames, totalIn: this.totalIn, totalOut: this.totalOut,
      bigCount: this.bigCount, regCount: this.regCount,
      ceilingCount: this.ceilingCount, stockCount: this.stockTriggerCount,
      payout: this.totalIn > 0 ? (this.totalOut / this.totalIn) * 100 : 0,
    };
  }

  spinReels() {
    return REELS.map(reel => {
      const pos = Math.floor(Math.random() * REEL_LENGTH);
      return reel[pos];
    });
  }

  // Return full reel stop positions (indices) for animation
  spinReelPositions() {
    return REELS.map(reel => Math.floor(Math.random() * REEL_LENGTH));
  }

  drawKoyaku() {
    const r = Math.random();
    let cum = 0;
    const probs = [
      ["replay", 1 / KOYAKU_PROB.replay], ["bell", 1 / KOYAKU_PROB.bell],
      ["suika", 1 / KOYAKU_PROB.suika], ["cherry", 1 / KOYAKU_PROB.cherry],
      ["matsu", 1 / KOYAKU_PROB.matsu], ["chance", 1 / KOYAKU_PROB.chance],
    ];
    for (const [name, prob] of probs) {
      cum += prob;
      if (r < cum) return name;
    }
    return "hazure";
  }

  checkKoyakuKaijo(koyaku) {
    switch (koyaku) {
      case "cherry": return Math.random() < 1 / KOYAKU_KAIJO.cherry;
      case "matsu": return Math.random() < 1 / KOYAKU_KAIJO.matsu;
      case "chance": return Math.random() < 1 / KOYAKU_KAIJO.chance;
      case "hazure": return Math.random() < 1 / SETTING_TABLE[this.setting].junkHazureKaijoDenum;
      default: return false;
    }
  }

  determineBonusType(forceTengoku = false) {
    if (forceTengoku) return "BIG";
    return Math.random() < MODE_BB_RATIO[this.modeManager.getMode()] ? "BIG" : "REG";
  }

  processBonus(type) {
    const payout = type === "BIG" ? BIG_PAYOUT : REG_PAYOUT;
    if (type === "BIG") {
      this.bigCount++;
      this.bonusStock.lotDuringBig(MODE_BB_RATIO[this.modeManager.getMode()]);
    } else {
      this.regCount++;
    }
    this.credits += payout;
    this.totalOut += payout;
    return payout;
  }

  koyakuPayout(koyaku) {
    switch (koyaku) {
      case "bell": return 10;
      case "suika": return 5;
      case "cherry": return 2;
      case "matsu": return 2;
      case "replay": return BET_PER_GAME;
      default: return 0;
    }
  }

  spin() {
    this.totalGames++;
    this.credits -= BET_PER_GAME;
    this.totalIn += BET_PER_GAME;

    const reelPositions = this.spinReelPositions();
    const reelStops = reelPositions.map((pos, i) => REELS[i][pos]);
    const koyaku = this.drawKoyaku();

    const kPay = this.koyakuPayout(koyaku);
    if (koyaku !== "replay") {
      this.credits += kPay;
      this.totalOut += kPay;
    } else {
      this.credits += BET_PER_GAME;
      this.totalIn -= BET_PER_GAME;
    }

    this.modeManager.incrementGames();

    let bonusTriggered = null;
    let bonusPayout = 0;
    let isCeiling = false;
    let isStock = false;

    if (this.bonusStock.hasStock()) {
      bonusTriggered = this.bonusStock.consumeStock();
      isStock = true;
      this.stockTriggerCount++;
    } else if (this.modeManager.isCeilingReached()) {
      bonusTriggered = this.determineBonusType();
      isCeiling = true;
      this.ceilingCount++;
    } else if (this.checkKoyakuKaijo(koyaku)) {
      const forceTengoku = koyaku === "matsu";
      bonusTriggered = this.determineBonusType(forceTengoku);
    }

    if (bonusTriggered) {
      bonusPayout = this.processBonus(bonusTriggered);
      this.modeManager.resetGames();
      const forceTengoku = koyaku === "matsu" && !isStock && !isCeiling;
      this.modeManager.transitionMode(forceTengoku);
    }

    return {
      game: this.totalGames, mode: this.modeManager.getMode(),
      reelStops, reelPositions, koyaku, bonusTriggered, bonusPayout,
      isCeiling, isStock, credits: this.credits,
      koyakuPay: kPay, gamesSinceBonus: this.modeManager.getGamesSinceBonus(),
    };
  }

  canPlay() { return this.credits >= BET_PER_GAME; }
  setSetting(s) {
    this.setting = s;
    this.modeManager = new YoshimuneModeManager(s);
    this.bonusStock = new YoshimuneBonusStock();
    this.totalGames = 0; this.totalIn = 0; this.totalOut = 0;
    this.bigCount = 0; this.regCount = 0; this.ceilingCount = 0; this.stockTriggerCount = 0;
    this.credits = 5000;
  }
}

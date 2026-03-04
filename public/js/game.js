/**
 * 吉宗パチスロ UI — Canvas-free DOM + CSS Animation版
 */

const session = new YoshimuneSession(1, 5000);
let spinning = false;
let reelsStopped = [true, true, true];
let reelAnimFrames = [null, null, null];
let reelOffsets = [0, 0, 0]; // current pixel offset
let stopPositions = [0, 0, 0]; // target reel positions after spin
let lastResult = null;
let bonusActive = false;
let bonusRemaining = 0;
let bonusType = null;
let bonusWon = 0;

// DOM refs
const leverBtn = document.getElementById('lever-btn');
const stopBtns = [
  document.getElementById('stop-left'),
  document.getElementById('stop-center'),
  document.getElementById('stop-right'),
];
const creditVal = document.getElementById('credit-val');
const betVal = document.getElementById('bet-val');
const winVal = document.getElementById('win-val');
const winDisplay = document.getElementById('win-display');
const flashOverlay = document.getElementById('flash-overlay');
const bonusBanner = document.getElementById('bonus-banner');
const bonusBar = document.getElementById('bonus-bar');
const debugInfo = document.getElementById('debug-info');
const debugToggle = document.getElementById('debug-toggle');

// Reel DOM setup
const reelCols = document.querySelectorAll('.reel-strip');
const CELL_COUNT = 3; // visible cells
const SYMBOLS_EXTENDED = 5; // render extra for scrolling

function getSymbolHTML(symbolId) {
  const d = SYMBOL_DISPLAY[symbolId];
  if (!d) return `<span>?</span>`;
  let cls = `reel-cell symbol-${symbolId}`;
  if (d.img) {
    return `<div class="${cls}"><img src="${d.img}" alt="${d.text}" draggable="false"></div>`;
  }
  return `<div class="${cls}">${d.text}</div>`;
}

function getCellHeight() {
  const rw = document.getElementById('reel-window');
  return rw.clientHeight / CELL_COUNT;
}

function renderReelStrip(reelIndex, position) {
  const reel = REELS[reelIndex];
  const strip = reelCols[reelIndex];
  const cellH = getCellHeight();
  let html = '';
  // Render enough symbols for smooth display (extra above and below)
  for (let i = -1; i <= CELL_COUNT; i++) {
    const idx = ((position + i) % REEL_LENGTH + REEL_LENGTH) % REEL_LENGTH;
    html += getSymbolHTML(reel[idx]);
  }
  strip.innerHTML = html;
  // Style cells
  strip.querySelectorAll('.reel-cell').forEach(c => {
    c.style.height = cellH + 'px';
    c.style.fontSize = Math.min(cellH * 0.6, 48) + 'px';
  });
  strip.style.top = -cellH + 'px'; // offset for the extra top symbol
}

function initReels() {
  for (let i = 0; i < 3; i++) {
    stopPositions[i] = Math.floor(Math.random() * REEL_LENGTH);
    renderReelStrip(i, stopPositions[i]);
  }
}

// === Reel Animation ===
function startReelSpin(reelIndex) {
  const strip = reelCols[reelIndex];
  const reel = REELS[reelIndex];
  let pos = stopPositions[reelIndex];
  const cellH = getCellHeight();
  let offset = 0;
  const speed = 8 + reelIndex * 2; // px per frame, slight variation

  function animate() {
    offset += speed;
    if (offset >= cellH) {
      offset -= cellH;
      pos = (pos + 1) % REEL_LENGTH;
      renderReelStrip(reelIndex, pos);
    }
    strip.style.top = (-cellH + offset) + 'px';
    reelAnimFrames[reelIndex] = requestAnimationFrame(animate);
  }

  reelAnimFrames[reelIndex] = requestAnimationFrame(animate);

  // Store current rolling position
  const updatePos = () => { stopPositions[reelIndex] = pos; };
  strip._updatePos = updatePos;
  strip._getPos = () => pos;
}

function stopReel(reelIndex, targetPos) {
  return new Promise(resolve => {
    cancelAnimationFrame(reelAnimFrames[reelIndex]);
    const strip = reelCols[reelIndex];
    const cellH = getCellHeight();

    // Snap to target
    stopPositions[reelIndex] = targetPos;
    renderReelStrip(reelIndex, targetPos);
    strip.style.top = -cellH + 'px';

    reelsStopped[reelIndex] = true;
    stopBtns[reelIndex].classList.add('stopped');
    resolve();
  });
}

// === Game Flow ===
function updateDisplay(result) {
  creditVal.textContent = session.getCredits();
  betVal.textContent = '3';

  // Update info bar
  const stats = session.getStats();
  document.getElementById('game-count').textContent = stats.totalGames;
  document.getElementById('big-count').textContent = stats.bigCount;
  document.getElementById('reg-count').textContent = stats.regCount;

  if (result) {
    const koyakuNames = {
      cherry: 'チェリー', matsu: '松', suika: 'スイカ',
      bell: 'ベル', replay: 'リプレイ', chance: 'チャンス目', hazure: '',
    };
    if (result.bonusTriggered) {
      winDisplay.textContent = `${result.bonusTriggered} BONUS! +${result.bonusPayout}枚`;
    } else if (result.koyakuPay > 0 && result.koyaku !== 'replay') {
      winDisplay.textContent = `${koyakuNames[result.koyaku]} +${result.koyakuPay}枚`;
    } else if (result.koyaku === 'replay') {
      winDisplay.textContent = 'リプレイ';
    } else {
      winDisplay.textContent = '';
    }
    winVal.textContent = result.bonusPayout || result.koyakuPay || 0;
  }

  updateDebug();
}

function updateDebug() {
  if (!debugInfo.classList.contains('visible')) return;
  const stats = session.getStats();
  debugInfo.innerHTML = `
    モード: <b>${session.getMode()}</b> | ゲーム数: ${stats.totalGames}<br>
    ボーナス後: ${session.getGamesSinceBonus()}G<br>
    BIG: ${stats.bigCount} / REG: ${stats.regCount}<br>
    天井: ${stats.ceilingCount} / ストック: ${stats.stockCount}<br>
    IN: ${stats.totalIn} / OUT: ${stats.totalOut}<br>
    機械割: ${stats.payout.toFixed(1)}%
  `;
}

function triggerFlash(type) {
  flashOverlay.className = '';
  void flashOverlay.offsetWidth; // force reflow
  flashOverlay.classList.add(type.toLowerCase());

  bonusBanner.className = '';
  bonusBanner.textContent = type === 'BIG' ? 'BIG BONUS' : 'REG BONUS';
  bonusBanner.style.color = type === 'BIG' ? '#ff4444' : '#4488ff';
  void bonusBanner.offsetWidth;
  bonusBanner.classList.add('show');
}

async function doSpin() {
  if (spinning || !session.canPlay()) return;
  spinning = true;
  leverBtn.disabled = true;
  winDisplay.textContent = '';
  winVal.textContent = '0';

  // Engine spin
  const result = session.spin();
  lastResult = result;

  // Start all reels
  reelsStopped = [false, false, false];
  stopBtns.forEach((btn, i) => {
    btn.disabled = false;
    btn.classList.remove('stopped');
  });

  for (let i = 0; i < 3; i++) {
    startReelSpin(i);
  }

  // Wait for all stops
  await new Promise(resolve => {
    const check = setInterval(() => {
      if (reelsStopped.every(s => s)) {
        clearInterval(check);
        resolve();
      }
    }, 50);
  });

  // Result processing
  updateDisplay(result);

  if (result.bonusTriggered) {
    triggerFlash(result.bonusTriggered);
    // Wait for flash
    await new Promise(r => setTimeout(r, 1800));
  }

  spinning = false;
  leverBtn.disabled = false;

  // Auto-play during bonus (simplified: already counted in engine)
  creditVal.textContent = session.getCredits();

  if (!session.canPlay()) {
    leverBtn.disabled = true;
    winDisplay.textContent = 'クレジット不足...';
  }
}

function handleStop(reelIndex) {
  if (reelsStopped[reelIndex]) return;

  // Stop order enforcement: must stop left→center→right or any order
  // For simplicity, allow any order
  const targetPos = lastResult.reelPositions[reelIndex];
  stopReel(reelIndex, targetPos);
  stopBtns[reelIndex].disabled = true;
}

// === Event Listeners ===
leverBtn.addEventListener('click', doSpin);
// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !spinning) { e.preventDefault(); doSpin(); }
  if (e.code === 'KeyJ' || e.code === 'Digit1') handleStop(0);
  if (e.code === 'KeyK' || e.code === 'Digit2') handleStop(1);
  if (e.code === 'KeyL' || e.code === 'Digit3') handleStop(2);
});

stopBtns[0].addEventListener('click', () => handleStop(0));
stopBtns[1].addEventListener('click', () => handleStop(1));
stopBtns[2].addEventListener('click', () => handleStop(2));

// Settings
document.querySelectorAll('.setting-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const s = parseInt(btn.dataset.setting);
    session.setSetting(s);
    document.querySelectorAll('.setting-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    initReels();
    updateDisplay(null);
    winDisplay.textContent = `設定${s}に変更`;
    creditVal.textContent = session.getCredits();
    leverBtn.disabled = false;
  });
});

// Debug toggle
debugToggle.addEventListener('click', () => {
  debugInfo.classList.toggle('visible');
  updateDebug();
});

// Resize handler
window.addEventListener('resize', () => {
  for (let i = 0; i < 3; i++) {
    if (reelsStopped[i]) renderReelStrip(i, stopPositions[i]);
  }
});

// Init
initReels();
updateDisplay(null);
creditVal.textContent = session.getCredits();

//  Gradual Darkening and Tick Audio ===

let selectedWord = '';
let correctLetters = [];
let wrongLetters = [];
let level = 0;
let score = 0;
let time = 30;
let timerInterval;
const maxAttempts = 6;

const canvas = document.getElementById('hangman-canvas');
const ctx = canvas.getContext('2d');
const wordDisplay = document.getElementById('word');
const keyboard = document.getElementById('keyboard');
const wrongLettersSpan = document.getElementById('wrong-letters');
const attemptsSpan = document.getElementById('attempts');
const message = document.getElementById('message');
const scoreSpan = document.getElementById('score');
const timerSpan = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const toggleBtn = document.getElementById('toggle-theme');

const wordLevels = [
  ['cat', 'sun', 'eat', 'dog'],
  ['horse', 'apple', 'grape', 'plane'],
  ['wycombe', 'wizard', 'rhythm', 'jumble'],
  ['awkward', 'cryptic', 'dwarves', 'xylophone']
];

const popup = document.createElement('div');
popup.className = 'popup-box';
document.body.appendChild(popup);
popup.style.display = 'none';

const tickSound = new Audio('tick.mp3');
tickSound.loop = true;
tickSound.volume = 0;

function showPopup(text) {
  popup.textContent = text;
  popup.style.display = 'block';
  setTimeout(() => popup.style.display = 'none', 3500);
}

function startGame() {
  if (level >= wordLevels.length) level = wordLevels.length - 1;
  const words = wordLevels[level];
  selectedWord = words[Math.floor(Math.random() * words.length)].toUpperCase();

  correctLetters = [];
  wrongLetters = [];
  updateDisplay();
  message.textContent = '';
  generateKeyboard();
  clearCanvas();
  resetTimer();
  document.body.style.backgroundColor = '';
  popup.style.display = 'none';
}

function resetTimer() {
  clearInterval(timerInterval);
  time = 30;
  timerSpan.textContent = time;
  tickSound.volume = 0;
  timerInterval = setInterval(() => {
    time--;
    timerSpan.textContent = time;

    // Gradual darkening from 23s to 1s
    if (time <= 23 && time >= 1) {
      const intensity = (23 - time) / 22;
      document.body.style.backgroundColor = `rgba(0, 0, 0, ${intensity})`;
    }

    // Tick audio logic
    if (time <= 23 && time >= 3) {
      const volumeLevel = (23 - time) / 20;
      tickSound.volume = Math.min(1, volumeLevel);
      if (tickSound.paused) {
        tickSound.play().catch(() => {});
      }
    }

    // Silence tick at 1
    if (time === 1) {
      tickSound.pause();
      tickSound.currentTime = 0;
    }

    // Flash and show popup at 0
    if (time === 0) {
      clearInterval(timerInterval);
      flashScreen();
      setTimeout(() => {
        showPopup(`⏰ Time’s up! The word was: ${selectedWord}`);
      }, 300);
      document.body.style.backgroundColor = '';
      disableKeyboard();
    }
  }, 1000);
}

function flashScreen() {
  document.body.classList.add('flash');
  setTimeout(() => document.body.classList.remove('flash'), 300);
}

function updateDisplay() {
  wordDisplay.innerHTML = selectedWord
    .split('')
    .map(letter => (correctLetters.includes(letter) ? letter : '_'))
    .join(' ');
  wrongLettersSpan.textContent = `Wrong: ${wrongLetters.join(', ')}`;
  attemptsSpan.textContent = maxAttempts - wrongLetters.length;
}

function generateKeyboard() {
  keyboard.innerHTML = '';
  const layout = [
    'QWERTYUIOP',
    'ASDFGHJKL',
    'ZXCVBNM'
  ];
  layout.forEach(row => {
    const rowDiv = document.createElement('div');
    rowDiv.classList.add('keyboard-row');
    row.split('').forEach(letter => {
      const button = document.createElement('button');
      button.textContent = letter;
      button.className = 'key';
      button.setAttribute('data-letter', letter);
      button.addEventListener('click', () => handleGuess(letter));
      rowDiv.appendChild(button);
    });
    keyboard.appendChild(rowDiv);
  });
}

function handleGuess(letter) {
  if (selectedWord.includes(letter)) {
    if (!correctLetters.includes(letter)) {
      correctLetters.push(letter);
    }
  } else {
    if (!wrongLetters.includes(letter)) {
      wrongLetters.push(letter);
      drawHangman(wrongLetters.length);
      showPopup(`Wrong! Attempts left: ${maxAttempts - wrongLetters.length}`);
    }
  }
  updateDisplay();
  checkGameStatus();
}

function checkGameStatus() {
  if (!selectedWord.split('').some(letter => !correctLetters.includes(letter))) {
    message.textContent = '🎉 You Won!';
    score += 10;
    scoreSpan.textContent = score;
    level++;
    disableKeyboard();
    clearInterval(timerInterval);
    setTimeout(startGame, 1500);
  }
  if (wrongLetters.length >= maxAttempts) {
    disableKeyboard();
    clearInterval(timerInterval);
    flashScreen();
    setTimeout(() => {
      showPopup(`💀 You Lost! The word was: ${selectedWord}`);
    }, 300);
  }
}

function disableKeyboard() {
  const buttons = keyboard.querySelectorAll('button');
  buttons.forEach(btn => btn.disabled = true);
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBase();
}

function drawBase() {
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(10, 240); ctx.lineTo(190, 240);
  ctx.moveTo(50, 240); ctx.lineTo(50, 20);
  ctx.lineTo(130, 20);
  ctx.lineTo(130, 40);
  ctx.stroke();
}

function drawHangman(wrongCount) {
  const animations = [
    () => ctx.arc(130, 60, 20, 0, Math.PI * 2),
    () => animateLine(130, 80, 130, 140),
    () => animateLine(130, 100, 100, 120),
    () => animateLine(130, 100, 160, 120),
    () => animateLine(130, 140, 100, 180),
    () => animateLine(130, 140, 160, 180)
  ];
  if (wrongCount > 0 && wrongCount <= animations.length) {
    ctx.beginPath();
    animations[wrongCount - 1]();
    ctx.stroke();
  }
}

function animateLine(x1, y1, x2, y2) {
  let progress = 0, steps = 15;
  function step() {
    const dx = (x2 - x1) * (progress / steps);
    const dy = (y2 - y1) * (progress / steps);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + dx, y1 + dy);
    ctx.stroke();
    if (++progress <= steps) requestAnimationFrame(step);
  }
  step();
}

startBtn.addEventListener('click', () => {
  score = 0;
  level = 0;
  scoreSpan.textContent = score;
  message.textContent = '';
  startBtn.style.display = 'none';
  restartBtn.style.display = 'inline-block';
  startGame();
});

restartBtn.addEventListener('click', () => {
  message.textContent = '';
  restartBtn.style.display = 'none';
  startBtn.style.display = 'inline-block';
  clearInterval(timerInterval);
  tickSound.pause();
  tickSound.currentTime = 0;
  score = 0;
  level = 0;
  scoreSpan.textContent = score;
  timerSpan.textContent = 30;
  correctLetters = [];
  wrongLetters = [];
  clearCanvas();
  disableKeyboard();
  wordDisplay.textContent = '';
  wrongLettersSpan.textContent = '';
  attemptsSpan.textContent = maxAttempts;
  document.body.style.backgroundColor = '';
  popup.style.display = 'none';
});

toggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  toggleBtn.textContent = document.body.classList.contains('dark-mode') ? '🌙' : '🌞';
});

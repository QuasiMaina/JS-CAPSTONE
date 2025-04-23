// Game state variables
const totalTime = 50; // ⬅️ ADDED: Total timer duration
let time = totalTime; // ⬅️ MODIFIED: Initial time uses totalTime
let selectedWord = '';
let correctLetters = [];
let wrongLetters = [];
let level = 0;
let score = 0;
let timerInterval;
const maxAttempts = 6;

// DOM Elements
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
  ['awkward', 'cryptic', 'dwarves', 'xylophone'],
];

const allRoasts = [
  "Haujui kuguess?",
  "Did you try turning your brain on?",
  "Haujui hii?",
  "You're the reason the hangman lost his job.",
  "Hope you’re better at life than this game.",
  "English not Englishing?",
  "Oof. That word was easier than breathing.",
  "If bad guesses were art, you'd be Picasso.",
  "Even autocorrect gave up on you.",
  "You spelled disaster correctly at least."
];

let roastQueue = shuffleArray([...allRoasts]);

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getRandomRoast() {
  if (roastQueue.length === 0) roastQueue = shuffleArray([...allRoasts]);
  return roastQueue.pop();
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
}

function resetTimer() {
  clearInterval(timerInterval);
  time = totalTime; // ⬅️ MODIFIED
  timerSpan.textContent = totalTime; // ⬅️ MODIFIED
  document.body.style.backgroundColor = ''; // ⬅️ ADDED: reset background
  timerInterval = setInterval(() => {
    time--;
    timerSpan.textContent = time;
    updateDarkness(); // ⬅️ ADDED
    drawRadialTimer(); // ⬅️ ADDED
    if (time <= 0) {
      clearInterval(timerInterval);
      dramaticFlash(); // ⬅️ ADDED
      setTimeout(() => {
        document.body.style.backgroundColor = '';
        message.textContent = `⏰ Time’s up! ${getRandomRoast()} Word was: ${selectedWord}`;
        disableKeyboard();
      }, 200);
    }
  }, 1000);
}

function updateDarkness() { // ⬅️ ADDED
  const darkness = Math.max(0, Math.min(1, 1 - (time - 2) / (totalTime - 2)));
  document.body.style.backgroundColor = `rgba(0, 0, 0, ${darkness * 0.8})`;
}

function dramaticFlash() { // ⬅️ ADDED
  document.body.style.backgroundColor = '#fff';
  setTimeout(() => document.body.style.backgroundColor = '#000', 100);
}

function drawRadialTimer() { // ⬅️ ADDED
  const radius = 30;
  const centerX = canvas.width - 50;
  const centerY = 50;
  const startAngle = -0.5 * Math.PI;
  const endAngle = startAngle + (2 * Math.PI * (time / totalTime));

  ctx.clearRect(canvas.width - 100, 0, 100, 100);

  // background circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 5;
  ctx.stroke();

  // timer arc
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, startAngle, endAngle);
  ctx.strokeStyle = '#f00';
  ctx.lineWidth = 5;
  ctx.stroke();
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
    message.textContent = `💀 You Lost! ${getRandomRoast()} Word was: ${selectedWord}`;
    disableKeyboard();
    clearInterval(timerInterval);
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
    () => ctx.arc(130, 60, 20, 0, Math.PI * 2), // head
    () => animateLine(130, 80, 130, 140),      // body
    () => animateLine(130, 100, 100, 120),     // left arm
    () => animateLine(130, 100, 160, 120),     // right arm
    () => animateLine(130, 140, 100, 180),     // left leg
    () => animateLine(130, 140, 160, 180)      // right leg
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

// Start and Restart
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
  score = 0;
  level = 0;
  scoreSpan.textContent = score;
  timerSpan.textContent = totalTime; // ⬅️ MODIFIED
  correctLetters = [];
  wrongLetters = [];
  clearCanvas();
  disableKeyboard();
  wordDisplay.textContent = '';
  wrongLettersSpan.textContent = '';
  attemptsSpan.textContent = maxAttempts;
});

// Theme Toggle
toggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  toggleBtn.textContent = document.body.classList.contains('dark-mode') ? '🌙' : '🌞';
});

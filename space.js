let correctLetters = [];
let wrongLetters = [];
let selectedWord = '';
let score = 0;
let time = 30;
let timerInterval;
let level = 0;
const maxAttempts = 6;

const scoreSpan = document.getElementById('score');
const timerSpan = document.getElementById('timer');
const toggleBtn = document.getElementById('toggle-theme');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const canvas = document.getElementById('hangman-canvas');
const ctx = canvas.getContext('2d');
const wordDisplay = document.getElementById('word');
const keyboard = document.getElementById('keyboard');
const wrongLettersSpan = document.getElementById('wrong-letters');
const attemptsSpan = document.getElementById('attempts');
const message = document.getElementById('message');

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
  if (roastQueue.length === 0) {
    roastQueue = shuffleArray([...allRoasts]);
  }
  return roastQueue.pop();
}

const wordLevels = [
  ['cat', 'sun', 'eat', 'dog'],
  ['horse', 'apple', 'grape', 'plane'],
  ['wycombe', 'wizard', 'rhythm', 'jumble'],
  ['awkward', 'cryptic', 'dwarves', 'xylophone']
];

function startGame() {
  if (level >= wordLevels.length) level = wordLevels.length - 1;
  const words = wordLevels[level];
  selectedWord = words[Math.floor(Math.random() * words.length)];
  correctLetters = [];
  wrongLetters = [];
  updateDisplay();
  generateKeyboard();
  clearCanvas();
  message.textContent = '';
  resetTimer();
}

function updateDisplay() {
  wordDisplay.innerHTML = selectedWord
    .split('')
    .map(letter => (correctLetters.includes(letter) ? letter : '_'))
    .join(' ');

  wrongLettersSpan.textContent = `Wrong: ${wrongLetters.join(', ')}`;
  attemptsSpan.textContent = maxAttempts - wrongLetters.length;
}

function handleGuess(letter) {
  letter = letter.toLowerCase();

  if (selectedWord.includes(letter)) {
    if (!correctLetters.includes(letter)) {
      correctLetters.push(letter);
      updateDisplay();
      checkWin();
    }
  } else {
    if (!wrongLetters.includes(letter)) {
      wrongLetters.push(letter);
      updateDisplay();
      drawNextPart();
      checkLose();
    }
  }
}

function checkWin() {
  const isComplete = selectedWord.split('').every(letter => correctLetters.includes(letter));
  if (isComplete) {
    message.textContent = '🎉 You Won!';
    score += 10;
    scoreSpan.textContent = score;
    level++;
    disableKeyboard();
    clearInterval(timerInterval);
    setTimeout(startGame, 1500);
  }
}

function checkLose() {
  if (wrongLetters.length >= maxAttempts) {
    message.textContent = `💀 You Lost! ${getRandomRoast()} Word was: ${selectedWord}`;
    disableKeyboard();
    clearInterval(timerInterval);
  }
}

function generateKeyboard() {
  keyboard.innerHTML = '';
  const layout = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

  layout.forEach(row => {
    const rowDiv = document.createElement('div');
    rowDiv.classList.add('keyboard-row');

    row.split('').forEach(letter => {
      const button = document.createElement('button');
      button.textContent = letter;
      button.setAttribute('data-letter', letter);
      button.classList.add('key');
      button.addEventListener('click', () => handleGuess(letter));
      rowDiv.appendChild(button);
    });

    keyboard.appendChild(rowDiv);
  });
}

function disableKeyboard() {
  const buttons = keyboard.querySelectorAll('button');
  buttons.forEach(btn => (btn.disabled = true));
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
  ctx.lineTo(130, 20); ctx.lineTo(130, 40);
  ctx.stroke();
}

function drawHangman(wrongCount) {
  const animations = [
    () => { ctx.beginPath(); ctx.arc(130, 60, 20, 0, Math.PI * 2); ctx.stroke(); },
    () => { animateLine(130, 80, 130, 140); },
    () => { animateLine(130, 100, 100, 120); },
    () => { animateLine(130, 100, 160, 120); },
    () => { animateLine(130, 140, 100, 180); },
    () => { animateLine(130, 140, 160, 180); }
  ];

  if (wrongCount > 0 && wrongCount <= animations.length) {
    animations[wrongCount - 1]();
  }
}

function animateLine(x1, y1, x2, y2) {
  let progress = 0;
  const steps = 15;

  function step() {
    const dx = (x2 - x1) * (progress / steps);
    const dy = (y2 - y1) * (progress / steps);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + dx, y1 + dy);
    ctx.stroke();

    progress++;
    if (progress <= steps) {
      requestAnimationFrame(step);
    }
  }
  step();
}

function resetTimer() {
  clearInterval(timerInterval);
  time = 30;
  timerSpan.textContent = time;
  timerInterval = setInterval(() => {
    time--;
    timerSpan.textContent = time;
    if (time <= 0) {
      clearInterval(timerInterval);
      message.textContent = `⏰ Time’s up! ${getRandomRoast()} Word was: ${selectedWord}`;
      disableKeyboard();
    }
  }, 1000);
}

// Start Button
startBtn.addEventListener('click', () => {
  score = 0;
  level = 0;
  scoreSpan.textContent = score;
  startBtn.style.display = 'none';
  restartBtn.style.display = 'inline-block';
  startGame();
});

// Restart Button
restartBtn.addEventListener('click', () => {
  message.textContent = '';
  restartBtn.style.display = 'none';
  startBtn.style.display = 'inline-block';
  clearInterval(timerInterval);
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
});

// Dark/Light Mode
toggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  toggleBtn.textContent = document.body.classList.contains('dark-mode') ? '🌙' : '🌞';
});

// Initial state
disableKeyboard();
restartBtn.style.display = 'none';

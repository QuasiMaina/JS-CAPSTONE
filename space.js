// === Cleaned & Updated JavaScript for Hangman with Ticking Clock ===

// Game state variables
let selectedWord = '';
let correctLetters = [];
let wrongLetters = [];
let level = 0;
let score = 0;
let time = 30;
let timerInterval;
const maxAttempts = 6;

// Audio setup
const tickSound = new Audio('ticking sound.mp3');
tickSound.loop = true;
tickSound.volume = 0;

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

// Create popup
const popup = document.createElement('div');
popup.className = 'popup';
popup.style.display = 'none';
popup.style.position = 'fixed';
popup.style.top = '50%';
popup.style.left = '50%';
popup.style.transform = 'translate(-50%, -50%)';
popup.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
popup.style.color = 'white';
popup.style.padding = '2rem';
popup.style.borderRadius = '12px';
popup.style.boxShadow = '0 0 20px rgba(255,255,255,0.2)';
popup.style.zIndex = '9999';
popup.style.textAlign = 'center';
popup.style.maxWidth = '300px';
popup.style.fontSize = '1.2rem';
popup.style.transition = 'opacity 0.3s ease';
popup.innerHTML = '<p></p><button>OK</button>';
document.body.appendChild(popup);
const popupText = popup.querySelector('p');
const popupBtn = popup.querySelector('button');
popupBtn.style.marginTop = '1rem';
popupBtn.addEventListener('click', () => {
  popup.style.display = 'none';
});

// Roast logic
const allRoasts = [
  "Haujui kuguess?", "Did you try turning your brain on?",
  "Haujui hii?", "You're the reason the hangman lost his job.",
  "Hope you’re better at life than this game.",
  "English not Englishing?", "Oof. That word was easier than breathing.",
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

function showPopup(message) {
  popupText.innerHTML = message;
  popup.style.display = 'block';
}

const wordLevels = [
  ['cat', 'sun', 'eat', 'dog'],
  ['horse', 'apple', 'grape', 'plane'],
  ['wycombe', 'wizard', 'rhythm', 'jumble'],
  ['awkward', 'cryptic', 'dwarves', 'xylophone'],
];

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
}

function resetTimer() {
  clearInterval(timerInterval);
  time = 30;
  timerSpan.textContent = time;
  tickSound.pause();
  tickSound.currentTime = 0;
  tickSound.volume = 0;

  timerInterval = setInterval(() => {
    time--;
    timerSpan.textContent = time;

    // Start ticking at 23s
    if (time === 23) {
      tickSound.play().catch(() => {}); // Try play, ignore error if blocked
    }

    // Volume ramping from 23s to 3s
    if (time <= 23 && time >= 1) {
      const volume = (23 - time) / 20; // Goes from 0 to ~1
      tickSound.volume = Math.min(1, volume);
    }

    // Silence at 1s
    if (time === 1) {
      tickSound.pause();
      tickSound.currentTime = 0;
      document.body.style.backgroundColor = 'black';
    }

    // Gradual darkening from 10s down
    if (time <= 10 && time > 2) {
      const intensity = (10 - time) / 10;
      document.body.style.backgroundColor = `rgba(0, 0, 0, ${intensity})`;
    }

    // Time’s up
    if (time === 0) {
      clearInterval(timerInterval);
      flashScreen();
      setTimeout(() => {
        document.body.style.backgroundColor = '';
        disableKeyboard();
        const roast = getRandomRoast();
        showPopup(`⏰ Time’s up!<br><br>${roast}<br><br>Word was: <strong>${selectedWord}</strong>`);
      }, 300);
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
  const layout = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
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
    if (!correctLetters.includes(letter)) correctLetters.push(letter);
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
    score += 10;
    scoreSpan.textContent = score;
    level++;
    disableKeyboard();
    clearInterval(timerInterval);
    tickSound.pause();
    setTimeout(startGame, 1500);
  }

  if (wrongLetters.length >= maxAttempts) {
    clearInterval(timerInterval);
    tickSound.pause();
    disableKeyboard();
    const roast = getRandomRoast();
    showPopup(`💀 You Lost!<br><br>${roast}<br><br>Word was: <strong>${selectedWord}</strong>`);
  }
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
});

toggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  toggleBtn.textContent = document.body.classList.contains('dark-mode') ? '🌙' : '🌞';
});

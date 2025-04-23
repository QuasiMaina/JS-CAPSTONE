function resetTimer() {
  clearInterval(timerInterval);
  time = totalTime;
  timerSpan.textContent = time;

  if (darkOverlay) darkOverlay.style.opacity = 0;

  timerInterval = setInterval(() => {
    time--;
    timerSpan.textContent = time;

    // === Darkness ramps up until 2 seconds left ===
    if (darkOverlay) {
      if (time > 2) {
        const maxDarkness = 1;
        const rampTime = totalTime - 2; // from 30 to 2 seconds
        const elapsed = totalTime - time;
        const darkness = Math.min((elapsed / rampTime) * maxDarkness, maxDarkness);
        darkOverlay.style.opacity = darkness;
      } else if (time === 0) {
        // === Revert overlay back to transparent ===
        darkOverlay.style.transition = 'opacity 1s';
        darkOverlay.style.opacity = 0;
      }
    }

    if (time <= 0) {
      clearInterval(timerInterval);
      message.textContent = `⏰ Time’s up! ${getRandomRoast()} Word was: ${selectedWord}`;
      disableKeyboard();
    }
  }, 1000);
}

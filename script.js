document.addEventListener('DOMContentLoaded', function () {
  const rollBtn = document.getElementById('roll-dice-btn');
  const diceContainer = document.getElementById('dice-container');
  const removedDiceContainer = document.getElementById('removed-dice');
  const totalScoreDisplay = document.getElementById('total-score');
  const gameOverDiv = document.getElementById('game-over');
  const finalScoreDisplay = document.getElementById('final-score');
  const nameInput = document.getElementById('name-input');
  const submitScoreBtn = document.getElementById('submit-score-btn');
  const leaderboardDiv = document.getElementById('leaderboard');
  const leaderboardTable = document.getElementById('leaderboard-table');
  const instructionsBtn = document.getElementById('instructions-btn');
  const instructionsModal = document.getElementById('instructions-modal');
  const closeBtns = document.querySelectorAll('.close');
  const closeLeaderboardBtn = document.getElementById('close-leaderboard');

  let dice = [];
  let removedDice = [];
  let totalScore = 0;
  let canRoll = true;

  // Event listener for roll button
  rollBtn.addEventListener('click', function () {
    if (canRoll) {
      rollDice();
      renderDice();
      rollBtn.disabled = true;
      canRoll = false;
    }
  });

  // Event listener for clicking on dice
  diceContainer.addEventListener('click', function (event) {
    const die = event.target;
    if (!die.classList.contains('die')) return;

    if (confirm('Are you sure you want to remove this die?')) {
      const value = parseInt(die.textContent);
      totalScore += (value === 3) ? 0 : value;
      removedDice.push(value);
      removedDiceContainer.appendChild(die);
      updateTotalScore();
      updateDiceCounter();
      canRoll = true;
    }
  });

  // Event listener for submitting score
  submitScoreBtn.addEventListener('click', function () {
    const name = nameInput.value.trim();
    if (name === '') {
      alert('Please enter your name.');
      return;
    }

    // Calculate final score
    let finalScore = totalScore;
    if (checkAllSixes()) {
      finalScore = -1;
    }

    saveScore(name, finalScore);
    const showLeaderboard = confirm('Would you like to see the leaderboard?');
    if (showLeaderboard) {
      showLeaderboardPage();
    } else {
      resetGame();
    }
  });

  // Event listener for instructions button
  instructionsBtn.addEventListener('click', function () {
    instructionsModal.style.display = 'block';
  });

  // Event listeners for closing modals
  closeBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      const modal = btn.parentElement.parentElement;
      modal.style.display = 'none';
      if (modal === instructionsModal) {
        resetGame();
      }
    });
  });

  // Event listener for the close button in the leaderboard modal
  closeLeaderboardBtn.addEventListener('click', function () {
    leaderboardDiv.style.display = 'none'; // Hide leaderboard modal
    resetGame(); // Restart the game
  });

  // Function to roll the dice
  function rollDice() {
    dice = [];
    for (let i = 0; i < 5 - removedDice.length; i++) {
      dice.push(Math.floor(Math.random() * 6) + 1);
    }
  }

  // Function to check if all dice are sixes
  function checkAllSixes() {
    return dice.every(value => value === 6);
  }

  // Function to render the dice
  function renderDice() {
    diceContainer.innerHTML = '';
    dice.forEach(value => {
      const die = document.createElement('div');
      die.classList.add('die');
      die.textContent = value;
      diceContainer.appendChild(die);
    });
  }

  // Function to update the total score display
  function updateTotalScore() {
    totalScoreDisplay.textContent = `Total Score: ${totalScore}`;
  }

  // Function to update the dice counter
  function updateDiceCounter() {
    const remainingDiceCount = 5 - removedDice.length;
    if (remainingDiceCount === 0) {
      gameOver();
    } else {
      rollBtn.disabled = false;
    }
  }

  // Function to handle the game over scenario
  function gameOver() {
    gameOverDiv.classList.remove('hidden');
    if (checkAllSixes()) {
      totalScore = -1;
    }
    finalScoreDisplay.textContent = `Final Score: ${totalScore}`;
  }

  // Function to save the score and name in local storage
  function saveScore(name, score) {
    const scores = JSON.parse(localStorage.getItem('threesScores')) || [];
    const newScore = { name, score, date: new Date().toLocaleString() };
    scores.push(newScore);
    scores.sort((a, b) => a.score - b.score);
    if (scores.length > 33) {
      scores.splice(33);
    }
    localStorage.setItem('threesScores', JSON.stringify(scores));
  }

  // Function to show the leaderboard page
  function showLeaderboardPage() {
    const scores = JSON.parse(localStorage.getItem('threesScores')) || [];
    const top11Scores = scores.slice(0, 11); // Show only top 11 scores
    leaderboardTable.innerHTML = '';
    top11Scores.forEach((entry, index) => {
      const row = document.createElement('div');
      row.textContent = `${index + 1}. ${entry.name} - Score: ${entry.score} - Date: ${entry.date}`;
      leaderboardTable.appendChild(row);
    });
    leaderboardDiv.classList.remove('hidden');
    leaderboardDiv.style.display = 'block'; // Ensure the leaderboard is visible

    // Display leaderboard modal as overlay
    leaderboardDiv.classList.add('modal-overlay');
  }

  // Function to reset the game
  function resetGame() {
    diceContainer.innerHTML = '';
    removedDiceContainer.innerHTML = '';
    totalScore = 0;
    totalScoreDisplay.textContent = 'Total Score: 0';
    gameOverDiv.classList.add('hidden');
    leaderboardDiv.classList.add('hidden');
    instructionsModal.style.display = 'none'; // Hide instructions modal
    rollBtn.disabled = false;
    removedDice = [];
    canRoll = true;
  }
});

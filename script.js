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
  const rollsCounter = document.getElementById('rolls-counter');

  let dice = [];
  let removedDice = [];
  let totalScore = 0;
  let rollsCount = 0;
  let canRoll = true;

  // Retrieve rolls count from local storage if available
  const storedRollsCount = localStorage.getItem('threesRollsCount');
  if (storedRollsCount) {
    rollsCount = parseInt(storedRollsCount);
  }

  // Update rolls counter display
  rollsCounter.textContent = `Number of Rolls: ${rollsCount}`;

  // Event listener for roll button
  rollBtn.addEventListener('click', function () {
    if (canRoll) {
      rollDice();
      renderDice();
      rollBtn.disabled = true;
      canRoll = false;
      rollsCount++; // Increase rolls count
      rollsCounter.textContent = `Number of Rolls: ${rollsCount}`; // Update rolls counter display
      localStorage.setItem('threesRollsCount', rollsCount); // Store rolls count in local storage
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
    if (finalScore === 30) {
      totalScore = -1;
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
        // Do not reset game when closing instructions modal
        return;
      }
      if (modal === leaderboardDiv) {
        resetGame(); // Restart the game when closing leaderboard modal
      }
    });
  });

  // Function to roll the dice
  function rollDice() {
    dice = [];
    for (let i = 0; i < 5 - removedDice.length; i++) {
      dice.push(Math.floor(Math.random() * 6) + 1);
    }
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
    finalScoreDisplay.textContent = `Final Score: ${totalScore}`;
  }

  // Function to save the score and name in local storage
  function saveScore(name, score) {
    const scores = JSON.parse(localStorage.getItem('threesScores')) || [];
    const newScore = { name, score, date: new Date().toLocaleString(), rolls: rollsCount }; // Add rolls count to the new score
    scores.push(newScore);
    scores.sort((a, b) => {
      if (a.score !== b.score) {
        return a.score - b.score;
      } else {
        // If scores are equal, the one with fewer rolls is better
        return (a.rolls || 0) - (b.rolls || 0);
      }
    });
    if (scores.length > 33) {
      scores.splice(33);
    }
    localStorage.setItem('threesScores', JSON.stringify(scores));
    // Reset rolls count in local storage
    localStorage.removeItem('threesRollsCount');
  }

  // Function to show the leaderboard page
  function showLeaderboardPage() {
    const scores = JSON.parse(localStorage.getItem('threesScores')) || [];
    const topScores = scores.slice(0, 11); // Get the top 11 scores
    leaderboardTable.innerHTML = '';
    topScores.forEach((entry, index) => {
      const row = document.createElement('div');
      row.textContent = `${index + 1}. ${entry.name} - Score: ${entry.score} - Date: ${entry.date} - Rolls: ${entry.rolls || ''}`; // Display rolls count if available
      leaderboardTable.appendChild(row);
    });
    leaderboardDiv.classList.remove('hidden');
    leaderboardDiv.style.display = 'block'; // Ensure the leaderboard is visible
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
    rollsCount = 0; // Reset rolls count
    rollsCounter.textContent = `Number of Rolls: ${rollsCount}`; // Update rolls counter display
  }
});

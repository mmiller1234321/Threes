document.addEventListener('DOMContentLoaded', function () {
  const rollBtn = document.getElementById('roll-dice-btn');
  const diceContainer = document.getElementById('dice-container');
  const removedDiceContainer = document.getElementById('removed-dice');
  const totalScoreDisplay = document.getElementById('total-score');
  const gameOverDiv = document.getElementById('game-over');
  const finalScoreDisplay = document.getElementById('final-score');
  const nameInput = document.getElementById('name-input');
  const submitScoreForm = document.getElementById('submit-score-form');
  const leaderboardDiv = document.getElementById('leaderboard');
  const leaderboardTable = document.getElementById('leaderboard-table');
  const instructionsBtn = document.getElementById('instructions-btn');
  const closeBtns = document.querySelectorAll('.close');
  const rollsCounter = document.getElementById('rolls-counter');
  const leaderboardBtn = document.getElementById('leaderboard-btn'); // Added leaderboard button

  let dice = [];
  let removedDice = [];
  let totalScore = 0;
  let rollsCount = 0;
  let canRoll = true;

  // Event listener for roll button
  rollBtn.addEventListener('click', function () {
    if (canRoll) {
      rollDice();
      renderDice();
      rollBtn.disabled = true;
      canRoll = false;
      rollsCount++; // Increase rolls count
      rollsCounter.textContent = `Number of Rolls: ${rollsCount}`; // Update rolls counter display
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
  submitScoreForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const name = nameInput.value.trim();
    const score = totalScore;
    const rolls = rollsCount;

    fetch('/submit-score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, score, rolls })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Score submitted:', data);
      alert(`Name: ${data.name}\nFinal Score: ${data.score}\nRolls: ${data.rolls}`);
      resetGame();
    })
    .catch(error => {
      console.error('Error submitting score:', error);
      alert('Failed to submit score');
    });
  });

  // Event listener for leaderboard button
  leaderboardBtn.addEventListener('click', function () {
    fetch('/leaderboard')
      .then(response => response.json())
      .then(data => {
        displayLeaderboard(data);
        leaderboardDiv.classList.remove('hidden');
      })
      .catch(error => {
        console.error('Error fetching leaderboard:', error);
        alert('Failed to fetch leaderboard');
      });
  });

  function displayLeaderboard(scores) {
    leaderboardTable.innerHTML = ''; // Clear existing leaderboard
    scores.forEach((score, index) => {
      const row = document.createElement('div');
      row.classList.add('leaderboard-row');
      row.innerHTML = `
        <span class="leaderboard-rank">${index + 1}</span>
        <span class="leaderboard-name">${score.name}</span>
        <span class="leaderboard-score">${score.score}</span>
        <span class="leaderboard-rolls">${score.rolls}</span>
      `;
      leaderboardTable.appendChild(row);
    });
  }

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
    if (totalScore === 30) {
      totalScore = -1; // Set final score to -1 if it equals 30
    }
    gameOverDiv.classList.remove('hidden');
    finalScoreDisplay.textContent = `Final Score: ${totalScore}`;
  }

  // Function to reset the game
  function resetGame() {
    diceContainer.innerHTML = '';
    removedDiceContainer.innerHTML = '';
    totalScore = 0;
    totalScoreDisplay.textContent = 'Total Score: 0';
    gameOverDiv.classList.add('hidden');
    instructionsModal.style.display = 'none'; // Hide instructions modal
    rollBtn.disabled = false;
    removedDice = [];
    canRoll = true;
    rollsCount = 0; // Reset rolls count
    rollsCounter.textContent = `Number of Rolls: ${rollsCount}`; // Update rolls counter display
  }
});

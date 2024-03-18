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
  const leaderboardBtn = document.getElementById('leaderboard-btn');
  const instructionsModal = document.getElementById('instructions-modal');
  const closeBtns = document.querySelectorAll('.close');
  const rollsCounter = document.getElementById('rolls-counter');

  let dice = [];
  let removedDice = [];
  let totalScore = 0;
  let rollsCount = 0;
  let canRoll = true;

  rollBtn.addEventListener('click', function () {
    if (canRoll) {
      rollDice();
      renderDice();
      rollBtn.disabled = true;
      canRoll = false;
      rollsCount++;
      rollsCounter.textContent = `Number of Rolls: ${rollsCount}`;
    }
  });

  leaderboardBtn.addEventListener('click', function () {
    fetchLeaderboard();
  });

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
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
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

  instructionsBtn.addEventListener('click', function () {
    instructionsModal.style.display = 'block';
  });

  closeBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      const modal = btn.parentElement.parentElement;
      modal.style.display = 'none';
      if (modal === instructionsModal) {
        return;
      }
      if (modal === leaderboardDiv) {
        resetGame();
      }
    });
  });

  function rollDice() {
    dice = [];
    for (let i = 0; i < 5 - removedDice.length; i++) {
      dice.push(Math.floor(Math.random() * 6) + 1);
    }
  }

  function renderDice() {
    diceContainer.innerHTML = '';
    dice.forEach(value => {
      const die = document.createElement('div');
      die.classList.add('die');
      die.textContent = value;
      diceContainer.appendChild(die);
    });
  }

  function updateTotalScore() {
    totalScoreDisplay.textContent = `Total Score: ${totalScore}`;
  }

  function updateDiceCounter() {
    const remainingDiceCount = 5 - removedDice.length;
    if (remainingDiceCount === 0) {
      gameOver();
    } else {
      rollBtn.disabled = false;
    }
  }

  function gameOver() {
    if (totalScore === 30) {
      totalScore = -1;
    }
    gameOverDiv.classList.remove('hidden');
    finalScoreDisplay.textContent = `Final Score: ${totalScore}`;
  }

  function resetGame() {
    diceContainer.innerHTML = '';
    removedDiceContainer.innerHTML = '';
    totalScore = 0;
    totalScoreDisplay.textContent = 'Total Score: 0';
    gameOverDiv.classList.add('hidden');
    instructionsModal.style.display = 'none';
    rollBtn.disabled = false;
    removedDice = [];
    canRoll = true;
    rollsCount = 0;
    rollsCounter.textContent = `Number of Rolls: ${rollsCount}`;
  }

  function fetchLeaderboard() {
    fetch('/leaderboard')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        const leaderboardRows = data.map(row => `${row.name}: ${row.score}, Rolls: ${row.rolls}`).join('\n');
        alert(`Top 11 Leaderboard:\n${leaderboardRows}`);
      })
      .catch(error => {
        console.error('Error fetching leaderboard:', error);
        alert('Failed to fetch leaderboard');
      });
  }
});

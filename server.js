// server.js

const sequelize = require('./sequelize.js');
const Leaderboard = require('./leaderboard.js');

// Rest of your code...

// Test the connection
sequelize.authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

// Sync the Leaderboard model with the database
(async () => {
    try {
        await sequelize.sync(); // Remove { force: true }
        console.log('Leaderboard table synchronized successfully.');
    } catch (error) {
        console.error('Error synchronizing leaderboard table:', error);
    }
})();

// Function to save the score and name in local storage and database
async function saveScore(name, score) {
    const newScore = { name, score, date: new Date(), rolls: rollsCount };
    
    try {
        await Leaderboard.create(newScore); // Save score to database
        console.log('Score saved to leaderboard table.');
    } catch (error) {
        console.error('Error saving score to leaderboard table:', error);
    }
}

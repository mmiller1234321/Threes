const express = require('express');
const sequelize = require('./sequelize.js');
const Leaderboard = require('./leaderboard.js');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

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
    await sequelize.sync();
    console.log('Leaderboard table synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing leaderboard table:', error);
  }
})();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

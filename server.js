const { Client } = require('pg');
const express = require('express');
const cors = require('cors');
const path = require('path');
const Filter = require('bad-words');

// PostgreSQL database connection configuration
const dbConfig = {
  user: 'results_db_sjfx_user',
  host: 'dpg-cnqc81q1hbls73f7l6sg-a.ohio-postgres.render.com',
  database: 'results_db_sjfx',
  password: '4V8RryOH4CFAFsFTeB1sCoUCYLluNFVV',
  port: 5432,
  ssl: {
    rejectUnauthorized: false // This is used to accept self-signed certificates, you should provide the appropriate SSL configuration for your environment
  }
};

const client = new Client(dbConfig);

// Express app setup
const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3000;

// Serve static files (HTML, CSS, JavaScript)
app.use(express.static(path.join(__dirname, 'public')));

// Connect to PostgreSQL database
client.connect()
  .then(() => {
    console.log('Connected to PostgreSQL database');
    // Create the "results" table if it doesn't exist
    createResultsTable();
    createLeaderboardTable();

  })
  .catch(error => {
    console.error('Error connecting to PostgreSQL database:', error);
  });

// Function to create the "results" table
async function createResultsTable() {
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS results (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        score INTEGER NOT NULL,
        rolls INTEGER NOT NULL,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Results table created successfully');
  } catch (error) {
    console.error('Error creating results table:', error);
  }
}

// Function to create the "leaderboard" table
async function createLeaderboardTable() {
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS leaderboard (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        score INTEGER NOT NULL,
        rolls INTEGER NOT NULL
      )
    `);
    console.log('Leaderboard table created successfully');
  } catch (error) {
    console.error('Error creating leaderboard table:', error);
  }
}

// API endpoint to submit score
app.post('/submit-score', async (req, res) => {
  const { name, score, rolls } = req.body;
  const filteredName = filterName(name);

  try {
    // we always want to store the score in the results table
    const result = await client.query(
      'INSERT INTO results (name, score, rolls) VALUES ($1, $2, $3) RETURNING name, score, rolls',
      [filteredName, score, rolls]
    );
    // lets check to see if it's a top 11 score
    const isTop11 = checkTop11() // either true or false
    // Update leaderboard if so
    if(isTop11) updateLeaderboard();
    
    const insertedScore = result.rows[0];
    res.json(insertedScore); // Return only the player's name, score, and rolls
  } catch (error) {
    console.error('Error inserting score:', error);
    res.status(500).send('Error submitting score');
  }
});

// Function to update the leaderboard
async function updateLeaderboard() {
  try {
    await client.query(`
      DELETE FROM leaderboard;
      INSERT INTO leaderboard (name, score, rolls)
      SELECT name, score, rolls
      FROM results
      ORDER BY score, rolls
      LIMIT 11;
    `);
    console.log('Leaderboard updated successfully');
  } catch (error) {
    console.error('Error updating leaderboard:', error);
  }
}

// Filter out inappropriate words from the player's name
function filterName(name) {
  const filter = new Filter();
  return filter.clean(name);
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

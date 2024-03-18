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

// Instantiate Filter
const filter = new Filter();

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
    // Insert the score into the results table
    await client.query(
      'INSERT INTO results (name, score, rolls) VALUES ($1, $2, $3)',
      [filteredName, score, rolls]
    );

    // Update leaderboard
    await updateLeaderboard();

    res.status(200).json({ name: filteredName, score, rolls }); // Return JSON response
  } catch (error) {
    console.error('Error submitting score:', error);
    res.status(500).json({ error: 'Error submitting score' }); // Return JSON response
  }
});

// Endpoint to get the leaderboard
app.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await getLeaderboard();
    res.json(leaderboard);
  } catch (error) {
    console.error('Error retrieving leaderboard:', error);
    res.status(500).send('Error retrieving leaderboard');
  }
});

async function getLeaderboard() {
  try {
    const result = await client.query(`
      SELECT name, score, rolls
      FROM leaderboard
      ORDER BY score ASC, rolls ASC
      LIMIT 11
    `);
    return result.rows;
  } catch (error) {
    console.error('Error retrieving leaderboard:', error);
    throw error;
  }
}

// Function to update the leaderboard
async function updateLeaderboard() {
  try {
    // Clear existing entries in the leaderboard table
    await client.query('DELETE FROM leaderboard');

    // Insert the top 11 scores from the results table into the leaderboard
    await client.query(`
      INSERT INTO leaderboard (name, score, rolls)
      SELECT name, score, rolls
      FROM results
      WHERE score >= -1 AND score <= 29 AND rolls > 0 AND rolls < 5 -- Added condition
      ORDER BY score ASC, rolls ASC
      LIMIT 11
    `);

    console.log('Leaderboard updated successfully');
  } catch (error) {
    console.error('Error updating leaderboard:', error);
  }
}

// Filter out inappropriate words from the player's name
function filterName(name) {
  return filter.clean(name);
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

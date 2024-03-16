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

// API endpoint to submit score
app.post('/submit-score', async (req, res) => {
  const { name, score, rolls } = req.body;
  const filteredName = filterName(name);

  try {
    const result = await client.query(
      'INSERT INTO results (name, score, rolls) VALUES ($1, $2, $3) RETURNING name, score, rolls',
      [filteredName, score, rolls]
    );
    const insertedScore = result.rows[0];
    res.json(insertedScore); // Return only the player's name, score, and rolls
  } catch (error) {
    console.error('Error inserting score:', error);
    res.status(500).send('Error submitting score');
  }
});

// Filter out inappropriate words from the player's name
function filterName(name) {
  const filter = new Filter();
  return filter.clean(name);
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

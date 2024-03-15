const { Client } = require('pg');
const express = require('express');
const bodyParser = require('body-parser');

// PostgreSQL database connection configuration
const dbConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'results_db', // Change the database name to "results_db"
  password: '1102',
  port: 5432,
};

const client = new Client(dbConfig);

// Express app setup
const app = express();
app.use(bodyParser.json());
const port = 3000;

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
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        rolls INTEGER
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

  try {
    const result = await client.query(
      'INSERT INTO results (name, score, rolls) VALUES ($1, $2, $3) RETURNING *',
      [name, score, rolls]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error inserting score:', error);
    res.status(500).send('Error submitting score');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
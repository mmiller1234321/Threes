import { Client } from 'pg';
import express from 'express';
import cors from 'cors';
import path from 'path';
import Filter from 'bad-words';

import dbConfig from './dbConfig';
import { createResultsTable, createLeaderboardTable, updateLeaderboard, getLeaderboard } from './database';

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 3000;

const client = new Client(dbConfig);

const filter = new Filter();

client.connect()
  .then(() => {
    console.log('Connected to PostgreSQL database');
    createResultsTable();
    createLeaderboardTable();
  })
  .catch(error => {
    console.error('Error connecting to PostgreSQL database:', error);
  });

app.post('/submit-score', async (req, res) => {
  const { name, score, rolls } = req.body;
  const filteredName = filterName(name);

  try {
    await client.query(
      'INSERT INTO results (name, score, rolls) VALUES ($1, $2, $3)',
      [filteredName, score, rolls]
    );

    await updateLeaderboard();

    res.status(200).json({ name: filteredName, score, rolls });
  } catch (error) {
    console.error('Error submitting score:', error);
    res.status(500).json({ error: 'Error submitting score' });
  }
});

app.get('/leaderboard', async (_, res) => {
  try {
    const leaderboard = await getLeaderboard();
    res.json(leaderboard);
  } catch (error) {
    console.error('Error retrieving leaderboard:', error);
    res.status(500).send('Error retrieving leaderboard');
  }
});

function filterName(name) {
  return filter.clean(name);
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

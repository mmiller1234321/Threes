CREATE TABLE results (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    score INTEGER NOT NULL,
    date TIMESTAMP NOT NULL,
    rolls INTEGER
);

CREATE TABLE leaderboard (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  score INTEGER NOT NULL,
  rolls INTEGER NOT NULL
);

// Keep this and use for later to keep all queries here
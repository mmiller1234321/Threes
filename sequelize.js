const { Sequelize } = require('sequelize');
require('dotenv').config();

// Read the DATABASE_URL environment variable
const databaseUrl = process.env.DATABASE_URL;

// Initialize Sequelize instance with DATABASE_URL
const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres'
});

// Test the connection
sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Export the Sequelize instance
module.exports = sequelize;

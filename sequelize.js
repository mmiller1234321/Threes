// sequelize.js

const { Sequelize } = require('sequelize');

// Initialize Sequelize instance
const sequelize = new Sequelize('postgres://postgres:1102@localhost:5432/postgres', {
  dialect: 'postgres'
});

// Create the database if it doesn't exist
sequelize.queryInterface.createDatabase('results_db')
  .then(() => {
    console.log('Database "results_db" created successfully.');
  })
  .catch(error => {
    console.error('Error creating database:', error);
  });

module.exports = sequelize;

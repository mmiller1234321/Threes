const { Sequelize } = require('sequelize');

// Read the DATABASE_URL environment variable
const databaseUrl = process.env.DATABASE_URL;

// Initialize Sequelize instance with DATABASE_URL
const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres'
});

// Export the Sequelize instance
module.exports = sequelize;

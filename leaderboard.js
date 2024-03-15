const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize.js');

const Leaderboard = sequelize.define('Leaderboard', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      is: /^[a-zA-Z\s]+$/,
      len: [3, 50]
    }
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  rolls: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
});

module.exports = Leaderboard;

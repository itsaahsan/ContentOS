const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Like = sequelize.define('Like', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  post_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'posts', key: 'id' },
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
}, {
  tableName: 'likes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { unique: true, fields: ['post_id', 'user_id'] },
  ],
});

module.exports = Like;

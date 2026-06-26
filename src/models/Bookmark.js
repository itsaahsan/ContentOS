const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Bookmark = sequelize.define('Bookmark', {
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
  tableName: 'bookmarks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { unique: true, fields: ['post_id', 'user_id'] },
  ],
});

module.exports = Bookmark;

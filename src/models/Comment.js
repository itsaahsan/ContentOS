const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/database');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true,
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
  parent_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'comments', key: 'id' },
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: { len: [1, 2000] },
  },
  is_approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  likes_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'comments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Comment;

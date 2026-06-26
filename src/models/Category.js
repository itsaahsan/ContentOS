const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  slug: {
    type: DataTypes.STRING(120),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  color: {
    type: DataTypes.STRING(7),
    allowNull: true,
    defaultValue: '#6366F1',
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  post_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = Category;

const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/database');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(300),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(350),
    allowNull: false,
    unique: true,
  },
  excerpt: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  cover_image: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  author_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'categories', key: 'id' },
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'draft',
    validate: { isIn: [['draft', 'published', 'archived']] },
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  view_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  reading_time: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  published_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'posts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: (post) => {
      if (post.content) {
        const wordsPerMinute = 200;
        const words = post.content.split(/\s+/).length;
        post.reading_time = Math.max(1, Math.ceil(words / wordsPerMinute));
      }
    },
    beforeUpdate: (post) => {
      if (post.changed('content')) {
        const wordsPerMinute = 200;
        const words = post.content.split(/\s+/).length;
        post.reading_time = Math.max(1, Math.ceil(words / wordsPerMinute));
      }
    },
  },
});

module.exports = Post;

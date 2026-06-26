const sequelize = require('../config/database');
const User = require('./User');
const Post = require('./Post');
const Category = require('./Category');
const Tag = require('./Tag');
const Comment = require('./Comment');
const Like = require('./Like');
const Bookmark = require('./Bookmark');
const Follow = require('./Follow');
const Notification = require('./Notification');

User.hasMany(Post, { foreignKey: 'author_id', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

Category.hasMany(Post, { foreignKey: 'category_id', as: 'posts' });
Post.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

Post.belongsToMany(Tag, { through: 'post_tags', foreignKey: 'post_id', as: 'tags' });
Tag.belongsToMany(Post, { through: 'post_tags', foreignKey: 'tag_id', as: 'posts' });

Post.hasMany(Comment, { foreignKey: 'post_id', as: 'comments' });
Comment.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Comment.hasMany(Comment, { foreignKey: 'parent_id', as: 'replies' });
Comment.belongsTo(Comment, { foreignKey: 'parent_id', as: 'parent' });

Post.hasMany(Like, { foreignKey: 'post_id', as: 'likes' });
Like.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

User.hasMany(Like, { foreignKey: 'user_id', as: 'likes' });
Like.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Post.hasMany(Bookmark, { foreignKey: 'post_id', as: 'bookmarks' });
Bookmark.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

User.hasMany(Bookmark, { foreignKey: 'user_id', as: 'bookmarks' });
Bookmark.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.belongsToMany(User, {
  through: Follow,
  foreignKey: 'follower_id',
  otherKey: 'following_id',
  as: 'following',
});
User.belongsToMany(User, {
  through: Follow,
  foreignKey: 'following_id',
  otherKey: 'follower_id',
  as: 'followers',
});

Follow.belongsTo(User, { foreignKey: 'follower_id', as: 'follower' });
Follow.belongsTo(User, { foreignKey: 'following_id', as: 'following' });

User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = {
  sequelize,
  User,
  Post,
  Category,
  Tag,
  Comment,
  Like,
  Bookmark,
  Follow,
  Notification,
};

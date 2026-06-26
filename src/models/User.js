const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50],
      isAlphanumeric: true,
    },
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: { len: [6, 255] },
  },
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  avatar_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  role: {
    type: DataTypes.STRING(20),
    defaultValue: 'reader',
    validate: { isIn: [['admin', 'author', 'reader']] },
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  refresh_token: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    },
  },
});

User.prototype.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toSafeJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  delete values.refresh_token;
  return values;
};

module.exports = User;

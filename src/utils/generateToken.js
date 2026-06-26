const jwt = require('jsonwebtoken');
require('dotenv').config();

const generateAccessToken = (userId) => {
  const expiresIn = parseInt(process.env.JWT_EXPIRE, 10) || 1800;
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn,
  });
};

const generateRefreshToken = (userId) => {
  const expiresIn = parseInt(process.env.JWT_REFRESH_EXPIRE, 10) || 604800;
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn,
  });
};

const generateResetToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_RESET_EXPIRE || '600',
  });
};

const verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  verifyToken,
};

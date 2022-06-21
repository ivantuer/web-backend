const jwt = require('jsonwebtoken');
const config = require('../config');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(403).send('A token is required for authentication');
  }
  try {
    const decoded = jwt.verify(token, config.tokenKey);
    req.user = decoded;
  } catch (err) {
    return res.status(401).send('Invalid Token');
  }
  return next();
};

const verifyAdmin = (req, res, next) => {
  const isAdmin = req.user.role === 'admin';

  if (!isAdmin) {
    return res.status(403).send('You don`t have permissions');
  }

  return next();
};

const getUserFromToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.tokenKey);

    return decoded;
  } catch (err) {
    return null;
  }
};

module.exports = { verifyToken, getUserFromToken, verifyAdmin };

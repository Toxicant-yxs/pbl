// server/middleware/auth.js - JWT 鉴权
const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/, '');
  if (!token) {
    return res.status(401).json({ code: 401, msg: '未提供 Token' });
  }
  try {
    const payload = jwt.verify(token, secret);
    req.user = { id: payload.id, username: payload.username };
    next();
  } catch (e) {
    return res.status(401).json({ code: 401, msg: 'Token 无效或已过期' });
  }
};

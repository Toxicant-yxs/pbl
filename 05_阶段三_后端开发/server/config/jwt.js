// server/config/jwt.js
module.exports = {
  secret: process.env.JWT_SECRET || 'todo-app-secret-2024',
  expiresIn: '7d'
};

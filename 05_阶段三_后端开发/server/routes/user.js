// server/routes/user.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const pool = require('../config/db');
const { secret, expiresIn } = require('../config/jwt');
const auth = require('../middleware/auth');

// POST /api/user/register
router.post('/register', [
  body('username').isLength({ min: 4, max: 20 }).withMessage('用户名长度 4-20'),
  body('password').isLength({ min: 6, max: 20 }).withMessage('密码长度 6-20'),
  body('nickname').optional().isLength({ max: 50 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ code: 400, msg: errors.array()[0].msg, data: null });
  }
  const { username, password, nickname = '' } = req.body;

  // 检查是否已存在
  const [rows] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
  if (rows.length) {
    return res.status(409).json({ code: 409, msg: '用户名已存在' });
  }

  // 加密入库
  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    'INSERT INTO users (username, password, nickname) VALUES (?, ?, ?)',
    [username, hash, nickname]
  );

  // 自动创建默认分类
  const defaults = [
    { name: '学习', color: '#1a1612' },
    { name: '工作', color: '#c8462c' },
    { name: '生活', color: '#4a6b4a' },
    { name: '健康', color: '#c8973a' }
  ];
  for (const c of defaults) {
    await pool.query(
      'INSERT INTO categories (user_id, name, color) VALUES (?, ?, ?)',
      [result.insertId, c.name, c.color]
    );
  }

  res.json({ code: 0, msg: '注册成功', data: { id: result.insertId } });
});

// POST /api/user/login
router.post('/login', [
  body('username').notEmpty(),
  body('password').notEmpty()
], async (req, res) => {
  const { username, password } = req.body;
  const [rows] = await pool.query(
    'SELECT id, username, password, nickname, avatar FROM users WHERE username = ?',
    [username]
  );
  if (!rows.length) {
    return res.status(401).json({ code: 401, msg: '用户名或密码错误' });
  }
  const user = rows[0];
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(401).json({ code: 401, msg: '用户名或密码错误' });
  }
  const token = jwt.sign({ id: user.id, username: user.username }, secret, { expiresIn });
  delete user.password;
  res.json({ code: 0, msg: '登录成功', data: { token, user } });
});

// GET /api/user/profile
router.get('/profile', auth, async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, username, nickname, avatar, created_at FROM users WHERE id = ?',
    [req.user.id]
  );
  if (!rows.length) return res.status(404).json({ code: 404, msg: '用户不存在' });
  const [stats] = await pool.query(
    `SELECT
       COUNT(*) AS totalTodos,
       SUM(is_completed = 1) AS completed
     FROM todos WHERE user_id = ?`,
    [req.user.id]
  );
  const user = rows[0];
  const s = stats[0];
  user.stats = {
    totalTodos: Number(s.totalTodos) || 0,
    completed: Number(s.completed) || 0,
    completionRate: s.totalTodos ? (s.completed / s.totalTodos) : 0
  };
  res.json({ code: 0, data: user });
});

// PUT /api/user/profile
router.put('/profile', auth, async (req, res) => {
  const { nickname, avatar } = req.body;
  await pool.query(
    'UPDATE users SET nickname = COALESCE(?, nickname), avatar = COALESCE(?, avatar) WHERE id = ?',
    [nickname, avatar, req.user.id]
  );
  res.json({ code: 0, msg: '更新成功' });
});

module.exports = router;

// server/routes/stats.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/stats/overview
router.get('/overview', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT
       COUNT(*) AS total,
       SUM(is_completed = 1) AS completed,
       SUM(is_completed = 0) AS pending
     FROM todos WHERE user_id = ?`,
    [req.user.id]
  );
  const r = rows[0];
  const total = Number(r.total) || 0;
  const completed = Number(r.completed) || 0;
  const pending = Number(r.pending) || 0;
  // 连续打卡：今天向前连续有完成的天数
  const [streakRows] = await pool.query(
    `SELECT DISTINCT DATE(completed_at) AS d FROM todos
     WHERE user_id = ? AND is_completed = 1 ORDER BY d DESC LIMIT 60`,
    [req.user.id]
  );
  const dates = streakRows.map(r => r.d);
  let streak = 0;
  const today = new Date(); today.setHours(0,0,0,0);
  for (let i = 0; i < dates.length; i++) {
    const d = new Date(dates[i]);
    const diffDays = Math.round((today - d) / 86400000);
    if (diffDays === i) streak++;
    else break;
  }
  res.json({
    code: 0,
    data: {
      total, completed, pending,
      completionRate: total ? completed / total : 0,
      streakDays: streak
    }
  });
});

// GET /api/stats/daily?days=7
router.get('/daily', async (req, res) => {
  const days = Math.min(60, Number(req.query.days) || 7);
  const [rows] = await pool.query(
    `SELECT DATE(completed_at) AS date, COUNT(*) AS count
     FROM todos
     WHERE user_id = ? AND is_completed = 1
       AND completed_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
     GROUP BY DATE(completed_at) ORDER BY date`,
    [req.user.id, days - 1]
  );
  res.json({ code: 0, data: rows });
});

// GET /api/stats/category
router.get('/category', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT c.name AS category, c.color, COUNT(t.id) AS count
     FROM categories c LEFT JOIN todos t ON t.category_id = c.id AND t.user_id = c.user_id
     WHERE c.user_id = ? GROUP BY c.id ORDER BY count DESC`,
    [req.user.id]
  );
  res.json({ code: 0, data: rows });
});

// GET /api/stats/streak
router.get('/streak', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT DISTINCT DATE(completed_at) AS d FROM todos
     WHERE user_id = ? AND is_completed = 1 ORDER BY d DESC`,
    [req.user.id]
  );
  const today = new Date(); today.setHours(0,0,0,0);
  let streak = 0;
  for (let i = 0; i < rows.length; i++) {
    const d = new Date(rows[i].d);
    const diff = Math.round((today - d) / 86400000);
    if (diff === i) streak++; else break;
  }
  res.json({ code: 0, data: { days: streak, lastDate: rows[0]?.d || null } });
});

module.exports = router;

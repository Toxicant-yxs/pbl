// server/routes/reminder.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/subscribe', async (req, res) => {
  const { todo_id } = req.body;
  await pool.query(
    'UPDATE reminders SET is_sent = 0 WHERE todo_id = ? AND user_id = ?',
    [todo_id, req.user.id]
  );
  res.json({ code: 0, msg: '订阅成功' });
});

router.get('/pending', auth, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT r.*, t.title FROM reminders r
     JOIN todos t ON r.todo_id = t.id
     WHERE r.is_sent = 0 AND r.remind_time <= NOW() AND t.is_completed = 0
     ORDER BY r.remind_time LIMIT 100`
  );
  res.json({ code: 0, data: rows });
});

module.exports = router;

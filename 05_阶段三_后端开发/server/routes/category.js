// server/routes/category.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT c.id, c.name, c.color, c.sort_order,
       (SELECT COUNT(*) FROM todos t WHERE t.category_id = c.id) AS count
     FROM categories c WHERE c.user_id = ? ORDER BY c.sort_order, c.id`,
    [req.user.id]
  );
  res.json({ code: 0, data: rows });
});

router.post('/', async (req, res) => {
  const { name, color = '#1a1612' } = req.body;
  const [r] = await pool.query(
    'INSERT INTO categories (user_id, name, color) VALUES (?, ?, ?)',
    [req.user.id, name, color]
  );
  res.json({ code: 0, data: { id: r.insertId } });
});

router.put('/:id', async (req, res) => {
  const { name, color, sort_order } = req.body;
  await pool.query(
    `UPDATE categories SET
       name = COALESCE(?, name),
       color = COALESCE(?, color),
       sort_order = COALESCE(?, sort_order)
     WHERE id = ? AND user_id = ?`,
    [name, color, sort_order, req.params.id, req.user.id]
  );
  res.json({ code: 0, msg: '更新成功' });
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM categories WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  res.json({ code: 0, msg: '删除成功' });
});

module.exports = router;

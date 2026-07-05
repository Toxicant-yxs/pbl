// server/routes/todo.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/todos
router.get('/', async (req, res) => {
  const { status = 'all', category_id, priority, deadline_range, keyword } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(100, Number(req.query.pageSize) || 20);
  const offset = (page - 1) * pageSize;

  const where = ['t.user_id = ?'];
  const params = [req.user.id];

  if (status === 'pending')  where.push('t.is_completed = 0');
  if (status === 'completed') where.push('t.is_completed = 1');
  if (category_id) { where.push('t.category_id = ?'); params.push(category_id); }
  if (priority !== undefined && priority !== '') { where.push('t.priority = ?'); params.push(Number(priority)); }
  if (deadline_range) {
    if (deadline_range === 'today')     where.push('DATE(t.deadline) = CURDATE()');
    if (deadline_range === 'tomorrow')  where.push('DATE(t.deadline) = DATE_ADD(CURDATE(), INTERVAL 1 DAY)');
    if (deadline_range === 'week')      where.push('YEARWEEK(t.deadline) = YEARWEEK(CURDATE())');
    if (deadline_range === 'overdue')   where.push('t.deadline < NOW() AND t.is_completed = 0');
  }
  if (keyword) { where.push('(t.title LIKE ? OR t.description LIKE ?)'); params.push(`%${keyword}%`, `%${keyword}%`); }

  const whereSql = where.join(' AND ');

  const [list] = await pool.query(
    `SELECT t.*, c.name AS cat_name, c.color AS cat_color
     FROM todos t LEFT JOIN categories c ON t.category_id = c.id
     WHERE ${whereSql}
     ORDER BY t.is_pinned DESC, t.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );
  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM todos t WHERE ${whereSql}`,
    params
  );

  const list2 = list.map(t => ({
    ...t,
    is_pinned: !!t.is_pinned,
    is_completed: !!t.is_completed,
    category: t.cat_name ? { id: t.category_id, name: t.cat_name, color: t.cat_color } : null,
    cat_name: undefined, cat_color: undefined
  }));
  res.json({ code: 0, data: { list: list2, total: countRows[0].total, page, pageSize } });
});

// POST /api/todos
router.post('/', [
  body('title').isLength({ min: 1, max: 200 }).withMessage('标题必填且不超过200字')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ code: 400, msg: errors.array()[0].msg });
  const { title, description, category_id, priority = 0, deadline, remind_at, is_pinned = false } = req.body;

  const [r] = await pool.query(
    `INSERT INTO todos (user_id, category_id, title, description, priority, deadline, remind_at, is_pinned)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.user.id, category_id, title, description, priority, deadline, remind_at, is_pinned ? 1 : 0]
  );

  if (remind_at) {
    await pool.query(
      'INSERT INTO reminders (todo_id, user_id, remind_time) VALUES (?, ?, ?)',
      [r.insertId, req.user.id, remind_at]
    );
  }

  res.json({ code: 0, msg: '创建成功', data: { id: r.insertId } });
});

// GET /api/todos/:id
router.get('/:id', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT t.*, c.name AS cat_name, c.color AS cat_color
     FROM todos t LEFT JOIN categories c ON t.category_id = c.id
     WHERE t.id = ? AND t.user_id = ?`,
    [req.params.id, req.user.id]
  );
  if (!rows.length) return res.status(404).json({ code: 404, msg: '待办不存在' });
  res.json({ code: 0, data: rows[0] });
});

// PUT /api/todos/:id
router.put('/:id', async (req, res) => {
  const { title, description, category_id, priority, deadline, remind_at, is_pinned } = req.body;
  await pool.query(
    `UPDATE todos SET
       title = COALESCE(?, title),
       description = ?,
       category_id = ?,
       priority = COALESCE(?, priority),
       deadline = ?,
       remind_at = ?,
       is_pinned = COALESCE(?, is_pinned)
     WHERE id = ? AND user_id = ?`,
    [title, description, category_id, priority, deadline, remind_at,
     is_pinned !== undefined ? (is_pinned ? 1 : 0) : null,
     req.params.id, req.user.id]
  );
  res.json({ code: 0, msg: '更新成功' });
});

// DELETE /api/todos/:id
router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM todos WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  res.json({ code: 0, msg: '删除成功' });
});

// PATCH /api/todos/:id/complete
router.patch('/:id/complete', async (req, res) => {
  const { is_completed } = req.body;
  const completedAt = is_completed ? new Date() : null;
  await pool.query(
    'UPDATE todos SET is_completed = ?, completed_at = ? WHERE id = ? AND user_id = ?',
    [is_completed ? 1 : 0, completedAt, req.params.id, req.user.id]
  );
  res.json({ code: 0, msg: '操作成功' });
});

// PATCH /api/todos/:id/pin
router.patch('/:id/pin', async (req, res) => {
  const { is_pinned } = req.body;
  await pool.query(
    'UPDATE todos SET is_pinned = ? WHERE id = ? AND user_id = ?',
    [is_pinned ? 1 : 0, req.params.id, req.user.id]
  );
  res.json({ code: 0, msg: '操作成功' });
});

module.exports = router;

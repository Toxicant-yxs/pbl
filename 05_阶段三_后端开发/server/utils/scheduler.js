// server/utils/scheduler.js - 定时提醒任务
const cron = require('node-cron');
const pool = require('../config/db');

function start() {
  // 每分钟扫描一次
  cron.schedule('* * * * *', async () => {
    try {
      const [rows] = await pool.query(
        `SELECT r.id, r.todo_id, r.user_id, t.title
         FROM reminders r JOIN todos t ON r.todo_id = t.id
         WHERE r.is_sent = 0 AND r.remind_time <= NOW() AND t.is_completed = 0
         LIMIT 50`
      );
      for (const r of rows) {
        // 实际项目：调用微信订阅消息 API 推送给 user
        // 此处仅做日志
        console.log(`[REMINDER] user=${r.user_id} todo=${r.todo_id} title=${r.title}`);
        await pool.query(
          'UPDATE reminders SET is_sent = 1, sent_at = NOW() WHERE id = ?',
          [r.id]
        );
      }
    } catch (e) {
      console.error('[Scheduler Error]', e.message);
    }
  });
  console.log('⏰ Reminder scheduler started');
}

module.exports = { start };

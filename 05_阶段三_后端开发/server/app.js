// server/app.js - Express 入口
require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// 路由
app.use('/api/user', require('./routes/user'));
app.use('/api/categories', require('./routes/category'));
app.use('/api/todos', require('./routes/todo'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/reminders', require('./routes/reminder'));

// 健康检查
app.get('/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(err.statusCode || 500).json({
    code: err.statusCode || 500,
    msg: err.message || '服务器内部错误',
    data: null
  });
});

// 启动定时提醒任务
require('./utils/scheduler').start();

// 404
app.use((req, res) => res.status(404).json({ code: 404, msg: '接口不存在' }));

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

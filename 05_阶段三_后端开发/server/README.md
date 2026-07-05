# 后端服务 - 个人待办事项管理小程序

## 技术栈
- Node.js 18 LTS
- Express 4.x
- MySQL 8.0
- JWT 鉴权
- bcrypt 加密
- node-cron 定时任务

## 启动

```bash
# 1. 安装依赖
npm install

# 2. 复制环境变量
cp .env.example .env
# 编辑 .env，填入数据库密码

# 3. 初始化数据库
mysql -uroot -p < sql/schema.sql

# 4. 启动
npm run dev   # 开发模式（nodemon 热重载）
npm start     # 生产模式
```

服务默认监听 `http://localhost:3000`

## 目录结构
```
server/
├── app.js              # 入口
├── config/             # 配置（数据库、JWT）
├── middleware/         # 中间件（auth、error）
├── routes/             # 路由
├── utils/              # 工具（scheduler、bcrypt）
└── sql/                # 数据库脚本
```

## API 文档
详见 [API接口文档.md](../03_阶段二_系统设计/API接口文档.md)

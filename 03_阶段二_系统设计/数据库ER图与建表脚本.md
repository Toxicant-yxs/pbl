# 数据库设计 · ER 图与建表脚本

> 第 20 号课题 · 个人待办事项管理小程序  
> 编写：李四（后端） / 张桂莲 审核

## 1. ER 图

```
┌──────────────────────────┐
│          users           │
├──────────────────────────┤
│ PK  id              INT  │
│     username        VARCHAR(50)  UNIQUE│
│     password        VARCHAR(255)│
│     nickname        VARCHAR(50) │
│     avatar          VARCHAR(255)│
│     created_at      DATETIME    │
└──────────┬───────────────┘
           │ 1
           │
           │ N
┌──────────▼───────────────┐         ┌──────────────────────────┐
│       categories         │         │        reminders         │
├──────────────────────────┤         ├──────────────────────────┤
│ PK  id              INT  │         │ PK  id              INT  │
│ FK  user_id         INT  │         │ FK  todo_id         INT  │
│     name            VARCHAR(30)   │ FK  user_id         INT  │
│     color           VARCHAR(20)   │     remind_time     DATETIME│
│     sort_order      INT           │     is_sent         TINYINT│
│     created_at      DATETIME      │     sent_at         DATETIME│
└──────────┬───────────────┘         └──────────────────────────┘
           │ 1                                ▲  N
           │                                  │
           │ N                                │
┌──────────▼────────────────────────────┐     │
│                todos                  │─────┘
├───────────────────────────────────────┤
│ PK  id              INT               │
│ FK  user_id         INT               │
│ FK  category_id     INT  (NULL)       │
│     title           VARCHAR(200)      │
│     description     TEXT              │
│     priority        TINYINT  (0~3)    │
│     deadline        DATETIME (NULL)   │
│     remind_at       DATETIME (NULL)   │
│     is_completed    TINYINT  (0/1)    │
│     is_pinned       TINYINT  (0/1)    │
│     completed_at    DATETIME (NULL)   │
│     created_at      DATETIME          │
│     updated_at      DATETIME          │
└───────────────────────────────────────┘
```

**关系说明**：
- `users (1) ──< (N) todos`：一个用户拥有多条待办
- `users (1) ──< (N) categories`：一个用户拥有多个分类
- `categories (1) ──< (N) todos`：一个分类下有多条待办
- `todos (1) ──< (N) reminders`：一条待办可有多次提醒记录

## 2. 建表脚本（schema.sql）

```sql
-- ============================================
-- 个人待办事项管理小程序 - 数据库建表脚本
-- 数据库：MySQL 8.0
-- 字符集：utf8mb4
-- ============================================

CREATE DATABASE IF NOT EXISTS todo_app
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE todo_app;

-- 1. 用户表
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id           INT            NOT NULL AUTO_INCREMENT,
  username     VARCHAR(50)    NOT NULL COMMENT '账号',
  password     VARCHAR(255)   NOT NULL COMMENT 'bcrypt 加密密码',
  nickname     VARCHAR(50)    DEFAULT '' COMMENT '昵称',
  avatar       VARCHAR(255)   DEFAULT '' COMMENT '头像URL',
  created_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 2. 分类表
DROP TABLE IF EXISTS categories;
CREATE TABLE categories (
  id          INT            NOT NULL AUTO_INCREMENT,
  user_id     INT            NOT NULL COMMENT '所属用户',
  name        VARCHAR(30)    NOT NULL COMMENT '分类名',
  color       VARCHAR(20)    DEFAULT '#1a1612' COMMENT '主题色',
  sort_order  INT            NOT NULL DEFAULT 0 COMMENT '排序',
  created_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user (user_id),
  CONSTRAINT fk_cat_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='待办分类表';

-- 3. 待办事项表
DROP TABLE IF EXISTS todos;
CREATE TABLE todos (
  id            INT            NOT NULL AUTO_INCREMENT,
  user_id       INT            NOT NULL COMMENT '所属用户',
  category_id   INT            DEFAULT NULL COMMENT '分类ID',
  title         VARCHAR(200)   NOT NULL COMMENT '待办标题',
  description   TEXT           COMMENT '详细描述',
  priority      TINYINT        NOT NULL DEFAULT 0 COMMENT '0无 1较低 2中等 3紧急',
  deadline      DATETIME       DEFAULT NULL COMMENT '截止时间',
  remind_at     DATETIME       DEFAULT NULL COMMENT '提醒时间',
  is_completed  TINYINT        NOT NULL DEFAULT 0 COMMENT '是否完成 0否1是',
  is_pinned     TINYINT        NOT NULL DEFAULT 0 COMMENT '是否置顶 0否1是',
  completed_at  DATETIME       DEFAULT NULL COMMENT '完成时间',
  created_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_completed (user_id, is_completed),
  KEY idx_deadline (deadline),
  KEY idx_pinned (user_id, is_pinned DESC, created_at DESC),
  KEY idx_category (category_id),
  CONSTRAINT fk_todo_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_todo_cat  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='待办事项表';

-- 4. 提醒记录表
DROP TABLE IF EXISTS reminders;
CREATE TABLE reminders (
  id           INT            NOT NULL AUTO_INCREMENT,
  todo_id      INT            NOT NULL,
  user_id      INT            NOT NULL,
  remind_time  DATETIME       NOT NULL COMMENT '计划提醒时间',
  is_sent      TINYINT        NOT NULL DEFAULT 0 COMMENT '是否已发送',
  sent_at      DATETIME       DEFAULT NULL,
  created_at   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_pending (is_sent, remind_time),
  KEY idx_todo (todo_id),
  CONSTRAINT fk_rem_todo FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE,
  CONSTRAINT fk_rem_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='提醒记录表';
```

## 3. 初始数据脚本（seed.sql）

```sql
USE todo_app;

-- 默认管理员账号（密码：admin123，已 bcrypt 加密）
INSERT INTO users (username, password, nickname) VALUES
('demo', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '演示用户');

-- 默认 4 个分类（颜色对应界面设计稿）
INSERT INTO categories (user_id, name, color, sort_order) VALUES
(1, '学习', '#1a1612', 1),
(1, '工作', '#c8462c', 2),
(1, '生活', '#4a6b4a', 3),
(1, '健康', '#c8973a', 4);

-- 演示待办数据
INSERT INTO todos (user_id, category_id, title, description, priority, deadline, is_pinned, is_completed) VALUES
(1, 1, '提交PBL训练营选题表', '向指导老师提交小组选题确认表', 1, '2024-11-13 10:00:00', 1, 1),
(1, 1, '完成《Node.js+Express》后端接口开发', '完成待办模块全部 6 个 RESTful 接口', 3, '2024-11-13 18:00:00', 1, 0),
(1, 3, '采购生活用品与水果', '纸巾、洗洁精、苹果、橙子', 2, '2024-11-14 12:00:00', 0, 0),
(1, 2, '小组会议：评审原型图', '评审 UI 设计稿与系统设计文档', 3, '2024-11-13 15:00:00', 1, 0),
(1, 1, '背诵英语单词30个', '完成每日单词打卡', 1, '2024-11-13 08:00:00', 0, 1),
(1, 4, '跑步 3 公里', '校园操场 5 圈', 2, '2024-11-13 19:30:00', 0, 0);
```

## 4. 索引优化说明

| 索引 | 作用 | 命中查询 |
|------|------|----------|
| `uk_username` | 登录时按用户名快速定位 | `SELECT * FROM users WHERE username=?` |
| `idx_user_completed` | 列表按完成状态过滤 | `WHERE user_id=? AND is_completed=0` |
| `idx_deadline` | 提醒扫描与按截止时间排序 | `WHERE deadline IS NOT NULL ORDER BY deadline` |
| `idx_pinned` | 首页「置顶在前」 | `WHERE user_id=? ORDER BY is_pinned DESC, created_at DESC` |
| `idx_pending` | 提醒任务扫描未发送 | `WHERE is_sent=0 AND remind_time <= NOW()` |

# API 接口文档

> Base URL：`http://localhost:3000/api`  
> 鉴权：除 `/user/register`、`/user/login` 外，其余接口需在 Header 添加 `Authorization: Bearer <token>`  
> 数据格式：JSON，UTF-8  
> 错误响应统一格式：`{ "code": 错误码, "msg": "错误描述", "data": null }`

## 1. 通用约定

### 1.1 错误码

| code | 含义 |
|------|------|
| 0 | 成功 |
| 400 | 参数错误 |
| 401 | 未登录 / Token 失效 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 409 | 资源冲突（如用户名已存在） |
| 500 | 服务器内部错误 |

### 1.2 时间格式
所有时间字段统一采用 **ISO 8601** 字符串，例如：`2024-11-15T18:00:00+08:00`

---

## 2. 用户模块

### 2.1 用户注册
- **POST** `/api/user/register`
- **请求体**：
  ```json
  {
    "username": "zhangsan",
    "password": "123456",
    "nickname": "张三"
  }
  ```
- **响应**（200）：
  ```json
  { "code": 0, "msg": "注册成功", "data": { "id": 2 } }
  ```
- **错误**：409 用户名已存在 | 400 参数不合法

### 2.2 用户登录
- **POST** `/api/user/login`
- **请求体**：
  ```json
  { "username": "zhangsan", "password": "123456" }
  ```
- **响应**（200）：
  ```json
  {
    "code": 0,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": { "id": 2, "username": "zhangsan", "nickname": "张三", "avatar": "" }
    }
  }
  ```
- **错误**：401 用户名或密码错误

### 2.3 获取个人信息
- **GET** `/api/user/profile`
- **响应**：
  ```json
  {
    "code": 0,
    "data": {
      "id": 2, "username": "zhangsan", "nickname": "张三", "avatar": "",
      "stats": { "totalTodos": 89, "completed": 76, "completionRate": 0.85 }
    }
  }
  ```

### 2.4 修改个人信息
- **PUT** `/api/user/profile`
- **请求体**：`{ "nickname": "三哥", "avatar": "https://..." }`

---

## 3. 分类模块

### 3.1 获取分类列表
- **GET** `/api/categories`
- **响应**：
  ```json
  {
    "code": 0,
    "data": [
      { "id": 1, "name": "学习", "color": "#1a1612", "count": 12 },
      { "id": 2, "name": "工作", "color": "#c8462c", "count": 6 }
    ]
  }
  ```

### 3.2 新建分类
- **POST** `/api/categories`
- **请求体**：`{ "name": "学习", "color": "#1a1612" }`

### 3.3 修改分类
- **PUT** `/api/categories/:id`
- **请求体**：`{ "name": "学习", "color": "#1a1612", "sort_order": 1 }`

### 3.4 删除分类
- **DELETE** `/api/categories/:id`
- **说明**：删除后，对应 todos 的 category_id 自动置为 NULL

---

## 4. 待办模块

### 4.1 查询待办列表
- **GET** `/api/todos`
- **Query 参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 否 | `all` / `pending` / `completed`，默认 all |
| category_id | int | 否 | 分类 ID |
| priority | int | 否 | 0~3 |
| deadline_range | string | 否 | `today` / `tomorrow` / `week` / `overdue` |
| keyword | string | 否 | 关键词 |
| page | int | 否 | 默认 1 |
| pageSize | int | 否 | 默认 20，最大 100 |

- **响应**：
  ```json
  {
    "code": 0,
    "data": {
      "list": [
        {
          "id": 101,
          "title": "完成课程设计报告初稿",
          "description": "梳理系统设计章节",
          "priority": 3,
          "deadline": "2024-11-15T23:59:00+08:00",
          "is_pinned": true,
          "is_completed": false,
          "category": { "id": 2, "name": "学习", "color": "#1a1612" },
          "created_at": "2024-11-13T09:41:00+08:00"
        }
      ],
      "total": 12,
      "page": 1,
      "pageSize": 20
    }
  }
  ```

### 4.2 新建待办
- **POST** `/api/todos`
- **请求体**：
  ```json
  {
    "title": "完成课程设计报告初稿",
    "description": "梳理系统设计章节",
    "category_id": 2,
    "priority": 3,
    "deadline": "2024-11-15T23:59:00+08:00",
    "remind_at": "2024-11-15T20:00:00+08:00",
    "is_pinned": true
  }
  ```
- **响应**：`{ "code": 0, "data": { "id": 101, "created_at": "..." } }`

### 4.3 待办详情
- **GET** `/api/todos/:id`

### 4.4 修改待办
- **PUT** `/api/todos/:id`
- **请求体**：同 4.2

### 4.5 删除待办
- **DELETE** `/api/todos/:id`

### 4.6 标记完成 / 取消完成
- **PATCH** `/api/todos/:id/complete`
- **请求体**：`{ "is_completed": true }`

### 4.7 切换置顶
- **PATCH** `/api/todos/:id/pin`
- **请求体**：`{ "is_pinned": true }`

---

## 5. 统计模块

### 5.1 总览数据
- **GET** `/api/stats/overview`
- **响应**：
  ```json
  {
    "code": 0,
    "data": {
      "total": 30,
      "completed": 21,
      "pending": 9,
      "completionRate": 0.70,
      "streakDays": 5
    }
  }
  ```

### 5.2 每日完成趋势
- **GET** `/api/stats/daily?days=7`
- **响应**：
  ```json
  {
    "code": 0,
    "data": [
      { "date": "2024-11-07", "count": 3 },
      { "date": "2024-11-08", "count": 5 },
      { "date": "2024-11-13", "count": 9 }
    ]
  }
  ```

### 5.3 分类分布
- **GET** `/api/stats/category`
- **响应**：
  ```json
  {
    "code": 0,
    "data": [
      { "category": "学习", "color": "#1a1612", "count": 12 },
      { "category": "工作", "color": "#c8462c", "count": 6 }
    ]
  }
  ```

### 5.4 连续打卡
- **GET** `/api/stats/streak`
- **响应**：`{ "code": 0, "data": { "days": 5, "lastDate": "2024-11-13" } }`

---

## 6. 提醒模块

### 6.1 订阅消息授权（前端记录）
- **POST** `/api/reminders/subscribe`
- **请求体**：`{ "todo_id": 101 }`

### 6.2 待发送提醒（内部 cron 调用）
- **GET** `/api/reminders/pending`
- **响应**：内部使用，列出 `is_sent=0 AND remind_time <= NOW()` 的提醒

---

## 7. 接口变更日志

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0 | 2024-11-13 | 首版发布 |

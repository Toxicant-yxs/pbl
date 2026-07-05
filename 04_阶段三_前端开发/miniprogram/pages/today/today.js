// pages/today/today.js
const { request } = require('../../utils/request');
const { isLoggedIn } = require('../../utils/auth');

Page({
  data: {
    today: '',
    avatarText: '我',
    totalCount: 0,
    completedCount: 0,
    pendingCount: 0,
    progressPercent: 0,
    todoList: [],
    priorityText: { 0: '无', 1: '较低', 2: '中等', 3: '紧急' }
  },

  onLoad() {
    if (!isLoggedIn()) {
      wx.reLaunch({ url: '/pages/login/login' });
      return;
    }
    this.setData({
      today: this.formatDate(new Date()),
      avatarText: (wx.getStorageSync('userInfo')?.nickname || '我').slice(0, 1)
    });
  },

  onShow() { this.loadTodos(); },

  formatDate(d) {
    const days = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
    return `${days[d.getDay()]} · ${d.getMonth()+1}月 ${d.getDate()}日`;
  },

  async loadTodos() {
    try {
      const data = await request({ url: '/todos?status=all&pageSize=50' });
      const list = data.list.map(it => ({
        ...it,
        deadlineText: this.formatDeadline(it.deadline)
      }));
      const completed = list.filter(t => t.is_completed).length;
      const total = list.length;
      this.setData({
        todoList: list,
        totalCount: total,
        completedCount: completed,
        pendingCount: total - completed,
        progressPercent: total ? Math.round(completed * 100 / total) : 0
      });
    } catch (e) { console.error(e); }
  },

  formatDeadline(d) {
    if (!d) return '';
    const dt = new Date(d);
    const now = new Date();
    if (dt.toDateString() === now.toDateString()) return `今天 ${dt.getHours()}:${String(dt.getMinutes()).padStart(2,'0')}`;
    const diff = (dt - now) / 86400000;
    if (diff > 0 && diff < 1) return '明天';
    if (diff < 0) return '已过期';
    return `${dt.getMonth()+1}/${dt.getDate()}`;
  },

  async toggleComplete(e) {
    const { id, completed } = e.currentTarget.dataset;
    try {
      await request({ url: `/todos/${id}/complete`, method: 'PATCH', data: { is_completed: !completed } });
      this.loadTodos();
    } catch (e) {}
  },

  goAdd()    { wx.navigateTo({ url: '/pages/todo-add/todo-add' }); },
  goDetail(e) { wx.navigateTo({ url: `/pages/todo-detail/todo-detail?id=${e.currentTarget.dataset.id}` }); },
  goFilter() { wx.navigateTo({ url: '/pages/category/category' }); }
});

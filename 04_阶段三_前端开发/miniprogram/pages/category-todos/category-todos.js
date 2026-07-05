// pages/category-todos/category-todos.js
const { request } = require('../../utils/request');

Page({
  data: {
    categoryId: null,
    categoryName: '',
    todoList: [],
    priorityText: { 0: '无', 1: '较低', 2: '中等', 3: '紧急' }
  },

  onLoad(options) {
    this.setData({
      categoryId: options.id,
      categoryName: decodeURIComponent(options.name || '分类')
    });
    wx.setNavigationBarTitle({ title: this.data.categoryName });
  },

  onShow() { this.loadTodos(); },

  async loadTodos() {
    try {
      const data = await request({ url: `/todos?category_id=${this.data.categoryId}&pageSize=100` });
      const list = data.list.map(it => ({
        ...it,
        deadlineText: this.formatDeadline(it.deadline)
      }));
      this.setData({ todoList: list });
    } catch (e) {}
  },

  formatDeadline(d) {
    if (!d) return '';
    const dt = new Date(d);
    const now = new Date();
    if (dt.toDateString() === now.toDateString()) return `今天 ${dt.getHours()}:${String(dt.getMinutes()).padStart(2,'0')}`;
    if (dt < now && !isNaN(dt)) return '已过期';
    return `${dt.getMonth()+1}/${dt.getDate()}`;
  },

  async toggleComplete(e) {
    const { id, completed } = e.currentTarget.dataset;
    try {
      await request({ url: `/todos/${id}/complete`, method: 'PATCH', data: { is_completed: !completed } });
      this.loadTodos();
    } catch (e) {}
  },

  goDetail(e) {
    wx.navigateTo({ url: `/pages/todo-detail/todo-detail?id=${e.currentTarget.dataset.id}` });
  },

  goBack() { wx.navigateBack(); }
});

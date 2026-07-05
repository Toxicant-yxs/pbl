// pages/todo-detail/todo-detail.js
const { request } = require('../../utils/request');

Page({
  data: {
    id: null,
    todo: null,
    priorityText: { 0: '无', 1: '较低', 2: '中等', 3: '紧急' }
  },

  onLoad(options) {
    this.setData({ id: options.id });
  },

  onShow() { this.loadTodo(); },

  async loadTodo() {
    try {
      const data = await request({ url: `/todos/${this.data.id}` });
      const todo = {
        ...data,
        deadlineText: this.formatDateTime(data.deadline),
        createdText: this.formatDateTime(data.created_at),
        isCompleted: !!data.is_completed,
        isPinned: !!data.is_pinned
      };
      this.setData({ todo });
      wx.setNavigationBarTitle({ title: '待办详情' });
    } catch (e) {
      wx.showToast({ title: '待办不存在', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1000);
    }
  },

  formatDateTime(d) {
    if (!d) return '未设置';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return '未设置';
    const pad = n => String(n).padStart(2, '0');
    return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  },

  async toggleComplete() {
    const todo = this.data.todo;
    try {
      await request({ url: `/todos/${this.data.id}/complete`, method: 'PATCH', data: { is_completed: !todo.isCompleted } });
      this.loadTodo();
    } catch (e) {}
  },

  async togglePin() {
    const todo = this.data.todo;
    try {
      await request({ url: `/todos/${this.data.id}/pin`, method: 'PATCH', data: { is_pinned: !todo.isPinned } });
      this.loadTodo();
    } catch (e) {}
  },

  goEdit() {
    wx.navigateTo({ url: `/pages/todo-edit/todo-edit?id=${this.data.id}` });
  },

  onDelete() {
    wx.showModal({
      title: '删除待办',
      content: '确定要删除这条待办吗？此操作不可撤销。',
      confirmColor: '#c8462c',
      success: async (res) => {
        if (!res.confirm) return;
        try {
          await request({ url: `/todos/${this.data.id}`, method: 'DELETE' });
          wx.showToast({ title: '已删除' });
          setTimeout(() => wx.navigateBack(), 800);
        } catch (e) {}
      }
    });
  },

  goBack() { wx.navigateBack(); }
});

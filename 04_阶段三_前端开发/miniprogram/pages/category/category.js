// pages/category/category.js
const { request } = require('../../utils/request');

Page({
  data: {
    categories: [],
    showAdd: false,
    newName: '',
    colors: ['#1a1612', '#c8462c', '#4a6b4a', '#c8973a', '#5b6ee1', '#8a4f9e']
  },

  onShow() { this.loadCategories(); },

  async loadCategories() {
    try {
      const data = await request({ url: '/categories' });
      this.setData({ categories: data });
    } catch (e) {}
  },

  toggleAdd() {
    this.setData({ showAdd: !this.data.showAdd, newName: '' });
  },

  onNameInput(e) { this.setData({ newName: e.detail.value }); },

  async onAddCategory() {
    const name = this.data.newName.trim();
    if (!name) return wx.showToast({ title: '请输入分类名', icon: 'none' });
    const color = this.data.colors[Math.floor(Math.random() * this.data.colors.length)];
    try {
      await request({ url: '/categories', method: 'POST', data: { name, color } });
      this.setData({ showAdd: false, newName: '' });
      this.loadCategories();
      wx.showToast({ title: '添加成功' });
    } catch (e) {}
  },

  goCategoryTodos(e) {
    const { id, name } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/category-todos/category-todos?id=${id}&name=${encodeURIComponent(name)}` });
  },

  async onDelete(e) {
    const { id } = e.currentTarget.dataset;
    const res = await new Promise(r => wx.showModal({ title: '提示', content: '删除分类后该分类下待办将变为无分类，确定？', success: r }));
    if (!res.confirm) return;
    try {
      await request({ url: `/categories/${id}`, method: 'DELETE' });
      this.loadCategories();
      wx.showToast({ title: '已删除' });
    } catch (e) {}
  }
});

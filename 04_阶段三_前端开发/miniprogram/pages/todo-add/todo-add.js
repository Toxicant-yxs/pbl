// pages/todo-add/todo-add.js
const { request } = require('../../utils/request');

Page({
  data: {
    form: {
      title: '',
      description: '',
      priority: 2,
      category_id: null,
      deadline: '',
      remind_time: '',
      remind_enabled: true,
      is_pinned: false
    },
    categories: []
  },

  onLoad() { this.loadCategories(); },

  async loadCategories() {
    const data = await request({ url: '/categories' });
    this.setData({ categories: data, 'form.category_id': data[0]?.id || null });
  },

  onTitle(e)  { this.setData({ 'form.title': e.detail.value }); },
  onDesc(e)   { this.setData({ 'form.description': e.detail.value }); },
  setPriority(e) { this.setData({ 'form.priority': Number(e.currentTarget.dataset.p) }); },
  setCategory(e) { this.setData({ 'form.category_id': Number(e.currentTarget.dataset.id) }); },
  onDate(e)    { this.setData({ 'form.deadline': e.detail.value }); },
  onTime(e)    { this.setData({ 'form.remind_time': e.detail.value }); },
  onRemindSwitch(e) { this.setData({ 'form.remind_enabled': e.detail.value }); },
  onPinSwitch(e)     { this.setData({ 'form.is_pinned': e.detail.value }); },

  goBack() { wx.navigateBack(); },

  async onSave() {
    const f = this.data.form;
    if (!f.title.trim()) return wx.showToast({ title: '请输入待办内容', icon: 'none' });

    // 组装截止时间
    let deadline = null, remind_at = null;
    if (f.deadline) {
      const t = f.remind_time || '23:59';
      deadline = new Date(`${f.deadline}T${t}:00+08:00`).toISOString();
      if (f.remind_enabled) remind_at = deadline;
    }

    try {
      await request({
        url: '/todos',
        method: 'POST',
        data: {
          title: f.title.trim(),
          description: f.description,
          category_id: f.category_id,
          priority: f.priority,
          deadline,
          remind_at,
          is_pinned: f.is_pinned
        }
      });
      wx.showToast({ title: '保存成功' });
      // 引导订阅消息
      if (f.remind_enabled && remind_at) this.requestSubscribe();
      setTimeout(() => wx.navigateBack(), 800);
    } catch (e) {}
  },

  requestSubscribe() {
    wx.requestSubscribeMessage({
      tmplIds: ['TEMPLATE_ID_HERE'], // 替换为实际模板 ID
      success: () => console.log('订阅成功'),
      fail: () => console.log('订阅失败/拒绝')
    });
  }
});

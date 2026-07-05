// pages/todo-edit/todo-edit.js
const { request } = require('../../utils/request');

Page({
  data: {
    id: null,
    loading: true,
    form: {
      title: '',
      description: '',
      priority: 2,
      category_id: null,
      deadline: '',
      remind_time: '',
      is_pinned: false
    },
    categories: []
  },

  onLoad(options) {
    this.setData({ id: options.id });
    this.loadData();
  },

  async loadData() {
    try {
      const [todo, cats] = await Promise.all([
        request({ url: `/todos/${this.data.id}` }),
        request({ url: '/categories' })
      ]);

      let deadline = '', remindTime = '';
      if (todo.deadline) {
        const dt = new Date(todo.deadline);
        const pad = n => String(n).padStart(2, '0');
        deadline = `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}`;
        remindTime = `${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
      }

      this.setData({
        loading: false,
        categories: cats,
        form: {
          title: todo.title || '',
          description: todo.description || '',
          priority: todo.priority ?? 2,
          category_id: todo.category_id != null ? todo.category_id : (cats[0]?.id ?? null),
          deadline,
          remind_time: remindTime || '23:59',
          is_pinned: !!todo.is_pinned
        }
      });
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1000);
    }
  },

  onTitle(e)  { this.setData({ 'form.title': e.detail.value }); },
  onDesc(e)   { this.setData({ 'form.description': e.detail.value }); },
  setPriority(e) { this.setData({ 'form.priority': Number(e.currentTarget.dataset.p) }); },
  setCategory(e) { this.setData({ 'form.category_id': Number(e.currentTarget.dataset.id) }); },
  onDate(e)    { this.setData({ 'form.deadline': e.detail.value }); },
  onTime(e)    { this.setData({ 'form.remind_time': e.detail.value }); },
  onPinSwitch(e) { this.setData({ 'form.is_pinned': e.detail.value }); },

  goBack() { wx.navigateBack(); },

  async onSave() {
    const f = this.data.form;
    if (!f.title.trim()) return wx.showToast({ title: '请输入待办内容', icon: 'none' });

    let deadline = null;
    if (f.deadline) {
      const t = f.remind_time || '23:59';
      deadline = new Date(`${f.deadline}T${t}:00+08:00`).toISOString();
    }

    try {
      await request({
        url: `/todos/${this.data.id}`,
        method: 'PUT',
        data: {
          title: f.title.trim(),
          description: f.description,
          category_id: f.category_id,
          priority: f.priority,
          deadline,
          remind_at: deadline,
          is_pinned: f.is_pinned
        }
      });
      wx.showToast({ title: '保存成功' });
      setTimeout(() => wx.navigateBack(), 800);
    } catch (e) {}
  }
});

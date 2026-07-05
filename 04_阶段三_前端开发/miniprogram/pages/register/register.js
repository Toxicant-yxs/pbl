// pages/register/register.js
const { request } = require('../../utils/request');

Page({
  data: { username: '', password: '', nickname: '' },
  onUsername(e) { this.setData({ username: e.detail.value }); },
  onPassword(e) { this.setData({ password: e.detail.value }); },
  onNickname(e) { this.setData({ nickname: e.detail.value }); },

  goLogin() { wx.navigateBack(); },

  async onRegister() {
    const { username, password, nickname } = this.data;
    if (!username || !password) {
      return wx.showToast({ title: '请填写账号和密码', icon: 'none' });
    }
    if (username.length < 4) {
      return wx.showToast({ title: '用户名至少4位', icon: 'none' });
    }
    if (password.length < 6) {
      return wx.showToast({ title: '密码至少6位', icon: 'none' });
    }
    try {
      await request({
        url: '/user/register',
        method: 'POST',
        data: { username, password, nickname: nickname || username },
        auth: false
      });
      wx.showToast({ title: '注册成功，请登录' });
      setTimeout(() => wx.navigateBack(), 1200);
    } catch (e) {}
  }
});

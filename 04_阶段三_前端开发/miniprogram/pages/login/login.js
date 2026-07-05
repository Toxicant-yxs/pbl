// pages/login/login.js
const { request } = require('../../utils/request');
const { setAuth } = require('../../utils/auth');

Page({
  data: { username: '', password: '' },
  onUsername(e) { this.setData({ username: e.detail.value }); },
  onPassword(e) { this.setData({ password: e.detail.value }); },

  async onLogin() {
    const { username, password } = this.data;
    if (!username || !password) {
      return wx.showToast({ title: '请填写完整', icon: 'none' });
    }
    try {
      const data = await request({
        url: '/user/login',
        method: 'POST',
        data: { username, password },
        auth: false
      });
      setAuth(data.token, data.user);
      wx.showToast({ title: '登录成功' });
      setTimeout(() => wx.switchTab({ url: '/pages/today/today' }), 800);
    } catch (e) { /* request 已统一提示 */ }
  },

  goRegister() { wx.navigateTo({ url: '/pages/register/register' }); }
});

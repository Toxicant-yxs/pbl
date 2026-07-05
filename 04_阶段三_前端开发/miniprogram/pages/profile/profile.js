// pages/profile/profile.js
const { request } = require('../../utils/request');
const { clearAuth } = require('../../utils/auth');

Page({
  data: {
    user: {},
    avatarText: '我',
    profile: {},
    completionRateText: '0%'
  },

  onShow() {
    const user = wx.getStorageSync('userInfo') || {};
    this.setData({ user, avatarText: (user.nickname || '我').slice(0, 1) });
    this.loadProfile();
  },

  async loadProfile() {
    try {
      const data = await request({ url: '/user/profile' });
      const stats = data.stats || {};
      const rate = Math.round((stats.completionRate || 0) * 100);
      this.setData({ profile: stats, completionRateText: rate + '%' });
    } catch (e) {}
  },

  goStats()    { wx.switchTab({ url: '/pages/stats/stats' }); },
  goCategory() { wx.switchTab({ url: '/pages/category/category' }); },

  onLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          clearAuth();
          wx.reLaunch({ url: '/pages/login/login' });
        }
      }
    });
  }
});

// app.js - 小程序入口
App({
  onLaunch() {
    // 启动时检查本地是否有 token
    const token = wx.getStorageSync('token');
    const userInfo = wx.getStorageSync('userInfo');
    if (token) {
      this.globalData.token = token;
      this.globalData.userInfo = userInfo;
    }
    // 获取系统信息（用于适配胶囊按钮）
    const windowInfo = wx.getWindowInfo();
    this.globalData.statusBarHeight = windowInfo.statusBarHeight;
    this.globalData.menuButton = wx.getMenuButtonBoundingClientRect();
  },

  globalData: {
    apiBase: 'http://localhost:3000/api',
    token: '',
    userInfo: null,
    statusBarHeight: 0,
    menuButton: null
  }
});

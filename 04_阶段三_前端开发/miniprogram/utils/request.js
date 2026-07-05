// utils/request.js - 网络请求封装
const app = getApp();

/**
 * 统一请求方法
 * @param {Object} options
 * @param {string} options.url     - 不含 baseURL 的路径，如 '/user/login'
 * @param {string} options.method  - HTTP 方法，默认 GET
 * @param {Object} options.data    - 请求体
 * @param {boolean} options.auth   - 是否需要鉴权，默认 true
 * @param {boolean} options.hideLoading - 是否隐藏 loading
 */
function request({ url, method = 'GET', data = {}, auth = true, hideLoading = false }) {
  if (!hideLoading) wx.showLoading({ title: '加载中', mask: true });

  const header = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = wx.getStorageSync('token');
    if (token) header.Authorization = 'Bearer ' + token;
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: app.globalData.apiBase + url,
      method,
      data,
      header,
      success: (res) => {
        wx.hideLoading();
        if (res.statusCode === 401) {
          // Token 失效
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          wx.showToast({ title: '请重新登录', icon: 'none' });
          setTimeout(() => wx.reLaunch({ url: '/pages/login/login' }), 1000);
          return reject(res.data);
        }
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (res.data.code === 0) return resolve(res.data.data);
          wx.showToast({ title: res.data.msg || '操作失败', icon: 'none' });
          return reject(res.data);
        }
        wx.showToast({ title: '网络异常', icon: 'none' });
        reject(res.data);
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({ title: '网络异常，请检查', icon: 'none' });
        reject(err);
      }
    });
  });
}

module.exports = { request };

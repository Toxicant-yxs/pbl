// utils/auth.js - 鉴权工具
function setAuth(token, userInfo) {
  wx.setStorageSync('token', token);
  wx.setStorageSync('userInfo', userInfo);
}

function clearAuth() {
  wx.removeStorageSync('token');
  wx.removeStorageSync('userInfo');
}

function isLoggedIn() {
  return !!wx.getStorageSync('token');
}

module.exports = { setAuth, clearAuth, isLoggedIn };

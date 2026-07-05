// pages/stats/stats.js
const { request } = require('../../utils/request');

Page({
  data: {
    completionRate: 0,
    overview: { total: 0, completed: 0, pending: 0, streakDays: 0 },
    delta: { completed: 0, pending: 0 },
    avgPerDay: 0,
    daily: []
  },

  onShow() { this.loadStats(); },

  async loadStats() {
    try {
      const [overview, daily] = await Promise.all([
        request({ url: '/stats/overview' }),
        request({ url: '/stats/daily?days=14' })
      ]);

      // 拆分近7天（本周）和前7天（上周）用于对比
      const last7 = daily.slice(-7);
      const prev7 = daily.slice(-14, -7);
      const weekCompleted = last7.reduce((s, d) => s + d.count, 0);
      const prevWeekCompleted = prev7.reduce((s, d) => s + d.count, 0);
      const deltaCompleted = weekCompleted - prevWeekCompleted;

      const peak = Math.max(...last7.map(d => d.count), 1);
      const weekMap = ['日','一','二','三','四','五','六'];

      this.setData({
        completionRate: Math.round((overview.completionRate || 0) * 100),
        overview,
        delta: { completed: Math.max(0, deltaCompleted), pending: 0 },
        avgPerDay: (weekCompleted / 7).toFixed(1),
        daily: last7.map(d => ({
          date: d.date,
          count: d.count,
          week: weekMap[new Date(d.date).getDay()],
          height: Math.round(d.count / peak * 100),
          isPeak: d.count === peak
        }))
      });
    } catch (e) { console.error(e); }
  }
});

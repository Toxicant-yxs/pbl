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
        request({ url: '/stats/daily?days=7' })
      ]);

      const rate = overview.completionRate;
      const peak = Math.max(...daily.map(d => d.count), 1);
      const weekMap = ['日','一','二','三','四','五','六'];

      this.setData({
        completionRate: Math.round(rate * 100),
        overview,
        delta: { completed: 12, pending: 3 },
        avgPerDay: (overview.completed / 7).toFixed(1),
        daily: daily.map(d => ({
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

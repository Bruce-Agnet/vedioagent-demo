(function () {
  const _now = Date.now();
  const _day = 86400000;
  const rnd = (seed) => {
    // 简单 hashing 伪随机，保证刷新数据稳定
    let x = seed;
    return function () {
      x = (x * 9301 + 49297) % 233280;
      return x / 233280;
    };
  };

  // ---------- 用户列表 ----------
  const phonePrefixes = ['138', '139', '136', '152', '155', '158', '170', '132'];
  function genPhone(seed) {
    const r = rnd(seed);
    const prefix = phonePrefixes[Math.floor(r() * phonePrefixes.length)];
    let rest = '';
    for (let i = 0; i < 8; i++) rest += Math.floor(r() * 10);
    return prefix + rest;
  }

  const users = [];
  for (let i = 1; i <= 32; i++) {
    const r = rnd(i * 31 + 7);
    const registeredAt = _now - Math.floor(r() * 180) * _day;
    const lastActiveAt = _now - Math.floor(r() * 14) * _day;
    const totalRecharged = Math.round((Math.floor(r() * 200) + 1) * 500);
    const totalSpent = Math.round(totalRecharged * (0.1 + r() * 0.6));
    const balance = Math.max(0, totalRecharged - totalSpent - Math.round(r() * 5000));
    const projectCount = Math.floor(r() * 6) + 1;
    const status = r() > 0.92 ? 'banned' : 'active';
    users.push({
      id: 'u-' + i,
      phone: genPhone(i * 17 + 3),
      registeredAt,
      lastActiveAt,
      totalRecharged,
      totalSpent,
      balance,
      projectCount,
      status,
    });
  }
  // 把 demo 用户钉在最前面（与前台一致）
  users.unshift({
    id: 'u-demo',
    phone: '13800000123',
    registeredAt: _now - 120 * _day,
    lastActiveAt: _now - 60000,
    totalRecharged: 88003,
    totalSpent: 15310,
    balance: 38003,
    projectCount: 3,
    status: 'active',
  });

  // ---------- 订单 ----------
  const orders = [];
  const payMethods = ['wechat', 'alipay', 'card'];
  const statusPool = ['paid', 'paid', 'paid', 'paid', 'paid', 'pending', 'refunded', 'failed'];
  for (let i = 1; i <= 60; i++) {
    const r = rnd(i * 41 + 13);
    const u = users[Math.floor(r() * users.length)];
    const createdAt = _now - Math.floor(r() * 30 * 86400 * 1000);
    orders.push({
      id: 'ord-' + (1000 + i),
      userId: u.id,
      userPhone: u.phone,
      amount: [100, 500, 1000, 2000, 5000, 10000][Math.floor(r() * 6)],
      status: statusPool[Math.floor(r() * statusPool.length)],
      paymentMethod: payMethods[Math.floor(r() * payMethods.length)],
      createdAt,
    });
  }
  orders.sort((a, b) => b.createdAt - a.createdAt);

  // ---------- 模型与计价 ----------
  const models = [
    { id: 'm-img-1', name: 'GPT image 2',     category: 'image', unitCost: 50,  status: 'active', updatedAt: _now - 2 * _day },
    { id: 'm-img-2', name: 'Nano Banana 2',   category: 'image', unitCost: 30,  status: 'active', updatedAt: _now - 8 * _day },
    { id: 'm-img-3', name: 'Imagen 4',        category: 'image', unitCost: 60,  status: 'active', updatedAt: _now - 3 * _day },
    { id: 'm-img-4', name: 'DALL·E 3',        category: 'image', unitCost: 45,  status: 'offline', updatedAt: _now - 20 * _day },
    { id: 'm-vid-1', name: 'Seedance 2.0',    category: 'video', unitCost: 200, status: 'active', updatedAt: _now - 1 * _day },
    { id: 'm-vid-2', name: 'Kling 2.1 Pro',   category: 'video', unitCost: 300, status: 'active', updatedAt: _now - 5 * _day },
    { id: 'm-vid-3', name: 'Veo 3',           category: 'video', unitCost: 500, status: 'active', updatedAt: _now - 1 * _day },
    { id: 'm-vid-4', name: 'Sora 1',          category: 'video', unitCost: 450, status: 'offline', updatedAt: _now - 30 * _day },
    { id: 'm-txt-1', name: 'DeepSeek Pro',    category: 'text',  unitCost: 5,   status: 'active', updatedAt: _now - 4 * _day },
    { id: 'm-txt-2', name: 'GPT 5',           category: 'text',  unitCost: 15,  status: 'active', updatedAt: _now - 2 * _day },
    { id: 'm-txt-3', name: 'Claude Opus 4.7', category: 'text',  unitCost: 20,  status: 'active', updatedAt: _now - 6 * _day },
  ];

  // ---------- 营收趋势（30 天，含波动） ----------
  function buildSeries(days, seed, base, variance) {
    const r = rnd(seed);
    const arr = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(_now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      arr.push({
        date: d.getTime(),
        amount: Math.round(base + (r() - 0.4) * variance),
      });
    }
    return arr;
  }
  const revenue30d = buildSeries(30, 7, 12000, 18000);
  const spend30d = buildSeries(30, 17, 8000, 10000);

  // ---------- Top 项目 ----------
  const topProjects = [
    { name: '短剧 · 林汉风',    owner: '138****0123', spent: 15310 },
    { name: '奶茶广告 30s',     owner: '139****8821', spent: 9870 },
    { name: '婚纱样片 V2',      owner: '136****4422', spent: 7230 },
    { name: '游戏角色试稿',     owner: '155****9933', spent: 5680 },
    { name: '美食带货 Demo',    owner: '170****0011', spent: 4250 },
  ];

  // ---------- 模型调用分布 ----------
  const modelDistribution = [
    { name: 'Seedance 2.0',    calls: 1850, share: 26 },
    { name: 'GPT image 2',     calls: 1620, share: 23 },
    { name: 'Claude Opus 4.7', calls: 1100, share: 16 },
    { name: 'Kling 2.1 Pro',   calls: 980,  share: 14 },
    { name: 'Veo 3',           calls: 720,  share: 10 },
    { name: '其他',             calls: 780,  share: 11 },
  ];

  // ---------- KPI 概览 ----------
  const totalSpendAll = users.reduce((s, u) => s + (u.totalSpent || 0), 0);
  const totalRechargedAll = users.reduce((s, u) => s + (u.totalRecharged || 0), 0);
  const todayRevenue = orders
    .filter(o => o.status === 'paid' && _now - o.createdAt < _day)
    .reduce((s, o) => s + o.amount, 0);
  const monthRevenue = orders
    .filter(o => o.status === 'paid' && _now - o.createdAt < 30 * _day)
    .reduce((s, o) => s + o.amount, 0);
  const overview = {
    dau: 218,
    mau: 1463,
    revenueToday: todayRevenue,
    revenueMonth: monthRevenue,
    totalUsers: users.length,
    totalProjects: users.reduce((s, u) => s + u.projectCount, 0),
    totalSpend: totalSpendAll,
    totalRecharged: totalRechargedAll,
  };

  // ---------- Admin Account ----------
  const adminAccount = {
    id: 'admin-1',
    name: '运营管理员',
    role: 'super',
    loggedAt: _now - 3600000,
  };

  window.MOCK_ADMIN = {
    adminAccount,
    users,
    orders,
    models,
    metrics: {
      overview,
      revenue30d,
      spend30d,
      topProjects,
      modelDistribution,
    },
  };
})();

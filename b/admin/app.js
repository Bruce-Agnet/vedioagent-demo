(function () {
  'use strict';
  const D = window.MOCK_ADMIN;

  // ---------- State ----------
  const State = {
    // 用户管理
    userSearch: '',
    userStatusFilter: 'all',       // 'all' | 'active' | 'banned'
    userDrawerOpen: false,
    userDrawerUserId: null,
    giftModalOpen: false,
    giftTargetUserId: null,
    giftAmount: 1000,
    userActionMenuOpen: null,      // userId
    banConfirmId: null,
    // 订单
    orderStatusFilter: 'all',
    orderPayFilter: 'all',
    orderRangeFilter: 'all',       // 'today' | '7d' | '30d' | 'all'
    refundConfirmOrderId: null,
    // 模型
    modelTab: 'image',
    modelEditOpen: false,
    modelEditId: null,
    modelEditCost: 0,
    modelEditStatus: 'active',
    // 通用
    theme: localStorage.getItem('vb-admin-theme') || 'light',
  };

  // ---------- 工具函数（复用前台） ----------
  function maskPhone(p) {
    if (!p || p.length < 11) return p || '';
    return p.slice(0, 3) + '****' + p.slice(7);
  }
  function formatCostShort(n) {
    if (n == null) return '0';
    return Number(n).toLocaleString('en-US');
  }
  function formatRelative(ts) {
    if (!ts) return '';
    const now = Date.now();
    const diff = Math.max(0, now - ts);
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return '刚刚';
    const min = Math.floor(sec / 60);
    if (min < 60) return min + ' 分钟前';
    const hr = Math.floor(min / 60);
    if (hr < 24) return hr + ' 小时前';
    const day = Math.floor(hr / 24);
    if (day < 7) return day + ' 天前';
    const d = new Date(ts);
    const nowD = new Date();
    if (d.getFullYear() === nowD.getFullYear()) {
      return (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日';
    }
    return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
  }
  function formatAbsolute(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const pad = (n) => String(n).padStart(2, '0');
    return d.getFullYear() + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate())
      + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function formatDate(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
  }

  // ---------- h() helper ----------
  function h(tag, attrs, ...children) {
    const el = document.createElement(tag);
    if (attrs) Object.entries(attrs).forEach(([k, v]) => {
      if (v === false || v == null) return;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else el.setAttribute(k, v);
    });
    children.flat().forEach(c => {
      if (c == null || c === false) return;
      el.append(c.nodeType ? c : document.createTextNode(c));
    });
    return el;
  }
  function $(s) { return document.querySelector(s); }

  // ---------- ICO ----------
  const ICO = {
    dashboard: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></svg>',
    users: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="2.2"/><path d="M2 13.5c0-2.2 1.8-4 4-4s4 1.8 4 4"/><circle cx="11" cy="5.5" r="1.7"/><path d="M10.5 9.5c1.8 0 3.5 1.3 3.5 4"/></svg>',
    orders: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4h12l-1 9H3z"/><path d="M5 4V2.5h6V4"/></svg>',
    models: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="12" height="10" rx="2"/><path d="M2 7h12"/><circle cx="5" cy="10" r="1"/></svg>',
    sun: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="3"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.5 3.5l1.4 1.4M11.1 11.1l1.4 1.4M3.5 12.5l1.4-1.4M11.1 4.9l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M11 1.5c-3.6.7-6.3 3.9-6.3 7.7 0 4.3 3.5 7.8 7.8 7.8 3.8 0 7-2.7 7.7-6.3-1 .5-2.1.8-3.3.8-3.9 0-7-3.1-7-7 0-1.2.3-2.3.8-3.3z"/></svg>',
    search: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5l3 3"/></svg>',
    close: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 3l10 10M13 3L3 13"/></svg>',
    more: '<svg viewBox="0 0 16 16" fill="currentColor"><circle cx="3" cy="8" r="1.4"/><circle cx="8" cy="8" r="1.4"/><circle cx="13" cy="8" r="1.4"/></svg>',
    chevronDown: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,6 8,11 13,6"/></svg>',
  };

  // ---------- Toast ----------
  let _toastTimer = null;
  function showToast(msg, opts) {
    const dur = (opts && opts.duration) || 1800;
    let el = document.querySelector('.admin-toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'admin-toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    if (_toastTimer) clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => { el.classList.remove('show'); }, dur);
  }

  // ---------- Router ----------
  function route() {
    const hash = location.hash.replace(/^#\/?/, '');
    const seg = (hash || '').split('?')[0];
    return seg || 'dashboard';
  }

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', State.theme);
  }
  function setTheme(t) {
    State.theme = t;
    localStorage.setItem('vb-admin-theme', t);
    render();
  }

  // ---------- Shell（sidenav + main） ----------
  function adminSidenav() {
    const r = route();
    const items = [
      { key: 'dashboard', label: '数据看板', ico: ICO.dashboard },
      { key: 'users',     label: '用户管理', ico: ICO.users },
      { key: 'orders',    label: '订单与计费', ico: ICO.orders },
      { key: 'models',    label: '模型与计价', ico: ICO.models },
    ];
    return h('aside', { class: 'admin-sidenav' },
      h('div', { class: 'admin-brand' },
        h('span', { class: 'admin-brand-mark' }, 'F'),
        h('span', { class: 'admin-brand-name' }, 'fuyao'),
        h('span', { class: 'admin-brand-sub' }, '管理后台'),
      ),
      h('nav', { class: 'admin-nav' },
        ...items.map(it => h('a', {
          class: 'admin-nav-item' + (r === it.key ? ' active' : ''),
          href: '#/' + it.key,
        },
          h('span', { class: 'admin-nav-ico', html: it.ico }),
          h('span', null, it.label),
        )),
      ),
      h('div', { class: 'admin-sidenav-foot' },
        h('div', { class: 'admin-theme-toggle' },
          h('button', {
            class: (State.theme === 'light' ? 'on' : ''),
            onClick: () => setTheme('light'),
            title: 'Light',
            html: ICO.sun,
          }),
          h('button', {
            class: (State.theme === 'dark' ? 'on' : ''),
            onClick: () => setTheme('dark'),
            title: 'Dark',
            html: ICO.moon,
          }),
        ),
        h('div', { class: 'admin-user-chip' },
          h('span', { class: 'admin-user-avatar' }, '运'),
          h('span', { class: 'admin-user-name' }, D.adminAccount.name),
        ),
      ),
    );
  }

  function adminTopbar(title, sub) {
    return h('header', { class: 'admin-topbar' },
      h('div', null,
        h('h1', { class: 'admin-page-title' }, title),
        sub && h('div', { class: 'admin-page-sub' }, sub),
      ),
    );
  }

  function adminShell(view, title, sub) {
    return h('div', { class: 'admin-shell' },
      adminSidenav(),
      h('div', { class: 'admin-main-wrap' },
        adminTopbar(title, sub),
        h('main', { class: 'admin-main' }, view),
      ),
    );
  }

  // ---------- viewDashboard ----------
  function kpiCard(num, label, sub) {
    return h('div', { class: 'kpi-card' },
      h('div', { class: 'kpi-num' }, num),
      h('div', { class: 'kpi-label' }, label),
      sub && h('div', { class: 'kpi-sub' }, sub),
    );
  }

  function svgBarChart(series, height) {
    if (!series || series.length === 0) return null;
    const max = Math.max(1, ...series.map(s => s.amount));
    const w = 100; // viewBox width %
    const barW = w / series.length;
    return h('svg', {
      class: 'bar-chart-svg',
      viewBox: '0 0 ' + w + ' ' + height,
      preserveAspectRatio: 'none',
    },
      ...series.map((s, i) => {
        const hPct = (s.amount / max) * (height - 4);
        const y = height - hPct;
        return h('rect', {
          x: (i * barW + 0.5) + '',
          y: y + '',
          width: (barW - 1) + '',
          height: hPct + '',
          rx: '0.5',
          class: 'bar-chart-rect',
        });
      }),
    );
  }

  function viewDashboard() {
    const m = D.metrics;
    const o = m.overview;
    const inner = h('div', { class: 'dashboard-inner' },
      // KPI 4 卡
      h('div', { class: 'kpi-grid' },
        kpiCard(formatCostShort(o.dau), 'DAU', '日活用户'),
        kpiCard(formatCostShort(o.mau), 'MAU', '月活用户'),
        kpiCard(formatCostShort(o.revenueMonth), '本月收入（积分）'),
        kpiCard(formatCostShort(o.totalUsers), '累计用户'),
      ),
      // 营收趋势 + Top 项目
      h('div', { class: 'admin-row two-col' },
        h('div', { class: 'admin-card' },
          h('div', { class: 'admin-card-head' },
            h('h3', null, '营收趋势 · 近 30 天'),
            h('span', { class: 'admin-card-sub' }, '累计 ' + formatCostShort(m.revenue30d.reduce((s, x) => s + x.amount, 0))),
          ),
          h('div', { class: 'chart-wrap' }, svgBarChart(m.revenue30d, 40)),
          h('div', { class: 'chart-axis' },
            h('span', null, formatDate(m.revenue30d[0].date)),
            h('span', null, formatDate(m.revenue30d[m.revenue30d.length - 1].date)),
          ),
        ),
        h('div', { class: 'admin-card' },
          h('div', { class: 'admin-card-head' },
            h('h3', null, 'Top 项目 · 累计消耗'),
          ),
          h('div', { class: 'rank-list' },
            ...m.topProjects.map((p, i) => h('div', { class: 'rank-row' },
              h('span', { class: 'rank-idx' }, '#' + (i + 1)),
              h('div', { class: 'rank-main' },
                h('div', { class: 'rank-name' }, p.name),
                h('div', { class: 'rank-meta' }, p.owner),
              ),
              h('span', { class: 'rank-val mono' }, formatCostShort(p.spent)),
            )),
          ),
        ),
      ),
      // 模型调用 + 最近订单
      h('div', { class: 'admin-row two-col' },
        h('div', { class: 'admin-card' },
          h('div', { class: 'admin-card-head' },
            h('h3', null, '模型调用分布'),
          ),
          h('div', { class: 'dist-list' },
            ...m.modelDistribution.map(d => h('div', { class: 'dist-row' },
              h('span', { class: 'dist-name' }, d.name),
              h('div', { class: 'dist-bar' },
                h('div', { class: 'dist-fill', style: { width: d.share + '%' } }),
              ),
              h('span', { class: 'dist-val mono' }, formatCostShort(d.calls) + ' · ' + d.share + '%'),
            )),
          ),
        ),
        h('div', { class: 'admin-card' },
          h('div', { class: 'admin-card-head' },
            h('h3', null, '最近订单'),
            h('a', { class: 'admin-card-link', href: '#/orders' }, '查看全部 →'),
          ),
          h('div', { class: 'recent-orders' },
            ...D.orders.slice(0, 6).map(ord => h('div', { class: 'recent-order-row' },
              h('span', { class: 'mono' }, maskPhone(ord.userPhone)),
              h('span', { class: 'mono' }, '+' + formatCostShort(ord.amount)),
              h('span', { class: 'status-chip ' + ord.status }, orderStatusLabel(ord.status)),
              h('span', { class: 'subtle' }, formatRelative(ord.createdAt)),
            )),
          ),
        ),
      ),
    );
    return adminShell(inner, '数据看板', '平台运营全景');
  }

  // ---------- viewUsers ----------
  function applyUserFilter() {
    let list = D.users.slice();
    const q = (State.userSearch || '').trim();
    if (q) list = list.filter(u => u.phone.indexOf(q) >= 0);
    if (State.userStatusFilter !== 'all') {
      list = list.filter(u => u.status === State.userStatusFilter);
    }
    return list;
  }
  function userStatusLabel(s) {
    return s === 'banned' ? '已封禁' : '正常';
  }
  function openUserDrawer(uid) {
    State.userDrawerOpen = true;
    State.userDrawerUserId = uid;
    State.userActionMenuOpen = null;
    render();
  }
  function closeUserDrawer() {
    State.userDrawerOpen = false;
    State.userDrawerUserId = null;
    render();
  }
  function openGiftModal(uid) {
    State.giftModalOpen = true;
    State.giftTargetUserId = uid;
    State.giftAmount = 1000;
    State.userActionMenuOpen = null;
    render();
  }
  function closeGiftModal() {
    State.giftModalOpen = false;
    State.giftTargetUserId = null;
    render();
  }
  function commitGift() {
    const uid = State.giftTargetUserId;
    const u = D.users.find(x => x.id === uid);
    const amt = parseInt(State.giftAmount, 10);
    if (!u || isNaN(amt) || amt <= 0) { showToast('请输入有效金额'); return; }
    u.balance = (u.balance || 0) + amt;
    u.totalRecharged = (u.totalRecharged || 0) + amt;
    closeGiftModal();
    showToast('已赠送 ' + formatCostShort(amt) + ' 积分给 ' + maskPhone(u.phone));
  }
  function toggleBan(uid) {
    const u = D.users.find(x => x.id === uid);
    if (!u) return;
    if (u.status === 'banned') {
      u.status = 'active';
      showToast('已解封 ' + maskPhone(u.phone));
    } else {
      if (State.banConfirmId === uid) {
        u.status = 'banned';
        State.banConfirmId = null;
        showToast('已封禁 ' + maskPhone(u.phone));
      } else {
        State.banConfirmId = uid;
        showToast('再点一次封禁按钮确认');
        setTimeout(() => {
          if (State.banConfirmId === uid) { State.banConfirmId = null; render(); }
        }, 3000);
      }
    }
    State.userActionMenuOpen = null;
    render();
  }

  function viewUsers() {
    const list = applyUserFilter();
    const inner = h('div', { class: 'page-inner' },
      // 筛选行
      h('div', { class: 'admin-filters' },
        h('div', { class: 'admin-search' },
          h('span', { class: 'admin-search-ico', html: ICO.search }),
          h('input', {
            type: 'text',
            placeholder: '搜索手机号',
            value: State.userSearch,
            onInput: (e) => { State.userSearch = e.target.value; render(); },
          }),
        ),
        h('select', {
          class: 'admin-select',
          value: State.userStatusFilter,
          onChange: (e) => { State.userStatusFilter = e.target.value; render(); },
        },
          h('option', { value: 'all' }, '全部状态'),
          h('option', { value: 'active' }, '正常'),
          h('option', { value: 'banned' }, '已封禁'),
        ),
        h('span', { class: 'admin-filters-count' }, list.length + ' 条'),
      ),
      // 表格
      h('div', { class: 'admin-table-wrap' },
        h('table', { class: 'admin-table' },
          h('thead', null,
            h('tr', null,
              h('th', null, '手机号'),
              h('th', null, '注册时间'),
              h('th', null, '状态'),
              h('th', { class: 'num' }, '累计充值'),
              h('th', { class: 'num' }, '累计消耗'),
              h('th', { class: 'num' }, '项目数'),
              h('th', null, '最近活跃'),
              h('th', { style: { width: '110px' } }, ''),
            ),
          ),
          h('tbody', null,
            ...list.map(u => h('tr', {
              onClick: () => openUserDrawer(u.id),
            },
              h('td', { class: 'mono' }, maskPhone(u.phone)),
              h('td', null, formatDate(u.registeredAt)),
              h('td', null, h('span', { class: 'status-chip ' + u.status }, userStatusLabel(u.status))),
              h('td', { class: 'num mono' }, formatCostShort(u.totalRecharged)),
              h('td', { class: 'num mono' }, formatCostShort(u.totalSpent)),
              h('td', { class: 'num mono' }, u.projectCount),
              h('td', { class: 'subtle' }, formatRelative(u.lastActiveAt)),
              h('td', { class: 'admin-table-actions', onClick: (e) => e.stopPropagation() },
                h('button', {
                  class: 'admin-link-btn',
                  onClick: () => openUserDrawer(u.id),
                }, '详情'),
                h('div', { class: 'admin-action-menu-wrap' },
                  h('button', {
                    class: 'admin-icon-btn',
                    title: '更多',
                    html: ICO.more,
                    onClick: (e) => {
                      e.stopPropagation();
                      State.userActionMenuOpen = State.userActionMenuOpen === u.id ? null : u.id;
                      render();
                    },
                  }),
                  State.userActionMenuOpen === u.id && h('div', { class: 'admin-action-menu' },
                    h('button', { onClick: () => openGiftModal(u.id) }, '赠送积分'),
                    h('button', {
                      class: u.status === 'banned' ? '' : 'danger',
                      onClick: () => toggleBan(u.id),
                    },
                      u.status === 'banned' ? '解封' :
                        (State.banConfirmId === u.id ? '再点确认封禁' : '封禁'),
                    ),
                  ),
                ),
              ),
            )),
          ),
        ),
        list.length === 0 && h('div', { class: 'admin-empty' }, '无匹配用户'),
      ),
    );
    return adminShell(inner, '用户管理', '平台用户列表 · 共 ' + D.users.length + ' 人');
  }

  function userDrawer() {
    if (!State.userDrawerOpen) return null;
    const u = D.users.find(x => x.id === State.userDrawerUserId);
    if (!u) return null;
    return h('div', { class: 'admin-drawer-mask', onClick: (e) => { if (e.target.classList.contains('admin-drawer-mask')) closeUserDrawer(); } },
      h('aside', { class: 'admin-drawer' },
        h('div', { class: 'admin-drawer-head' },
          h('div', null,
            h('h2', null, maskPhone(u.phone)),
            h('div', { class: 'subtle' }, '注册于 ' + formatDate(u.registeredAt) + ' · ' + userStatusLabel(u.status)),
          ),
          h('button', { class: 'admin-icon-btn', html: ICO.close, onClick: closeUserDrawer, title: '关闭' }),
        ),
        h('div', { class: 'admin-drawer-body' },
          h('div', { class: 'drawer-section' },
            h('h4', null, '账户'),
            h('div', { class: 'drawer-stats' },
              h('div', { class: 'drawer-stat' },
                h('div', { class: 'drawer-stat-num mono' }, formatCostShort(u.balance)),
                h('div', { class: 'drawer-stat-label' }, '当前余额'),
              ),
              h('div', { class: 'drawer-stat' },
                h('div', { class: 'drawer-stat-num mono' }, formatCostShort(u.totalRecharged)),
                h('div', { class: 'drawer-stat-label' }, '累计充值'),
              ),
              h('div', { class: 'drawer-stat' },
                h('div', { class: 'drawer-stat-num mono' }, formatCostShort(u.totalSpent)),
                h('div', { class: 'drawer-stat-label' }, '累计消耗'),
              ),
            ),
          ),
          h('div', { class: 'drawer-section' },
            h('h4', null, '项目'),
            h('div', { class: 'subtle' }, '管理项目数：', h('span', { class: 'mono' }, u.projectCount)),
          ),
          h('div', { class: 'drawer-section' },
            h('h4', null, '操作'),
            h('div', { class: 'drawer-actions' },
              h('button', {
                class: 'admin-btn primary',
                onClick: () => openGiftModal(u.id),
              }, '赠送积分'),
              h('button', {
                class: 'admin-btn ' + (u.status === 'banned' ? '' : 'danger'),
                onClick: () => toggleBan(u.id),
              }, u.status === 'banned' ? '解封' :
                  (State.banConfirmId === u.id ? '再点确认封禁' : '封禁')),
            ),
          ),
        ),
      ),
    );
  }

  function giftModal() {
    if (!State.giftModalOpen) return null;
    const u = D.users.find(x => x.id === State.giftTargetUserId);
    if (!u) return null;
    return h('div', {
      class: 'admin-modal-mask',
      onClick: (e) => { if (e.target.classList.contains('admin-modal-mask')) closeGiftModal(); },
    },
      h('div', { class: 'admin-modal gift-modal' },
        h('div', { class: 'admin-modal-head' },
          h('div', null,
            h('h3', null, '赠送积分'),
            h('div', { class: 'subtle' }, '给 ', maskPhone(u.phone), ' 赠送积分'),
          ),
          h('button', { class: 'admin-icon-btn', html: ICO.close, onClick: closeGiftModal }),
        ),
        h('div', { class: 'admin-modal-body' },
          h('div', { class: 'admin-field' },
            h('label', null, '金额（积分）'),
            h('input', {
              type: 'number',
              value: State.giftAmount,
              min: 1,
              onInput: (e) => { State.giftAmount = e.target.value; },
            }),
          ),
          h('div', { class: 'admin-modal-presets' },
            ...[100, 500, 1000, 5000].map(v => h('button', {
              class: 'admin-modal-preset' + (Number(State.giftAmount) === v ? ' on' : ''),
              onClick: () => { State.giftAmount = v; render(); },
            }, formatCostShort(v))),
          ),
        ),
        h('div', { class: 'admin-modal-foot' },
          h('button', { class: 'admin-btn ghost', onClick: closeGiftModal }, '取消'),
          h('button', { class: 'admin-btn primary', onClick: commitGift }, '确认赠送'),
        ),
      ),
    );
  }

  // ---------- viewOrders ----------
  function orderStatusLabel(s) {
    return s === 'paid' ? '已支付' :
           s === 'pending' ? '待支付' :
           s === 'refunded' ? '已退款' :
           s === 'failed' ? '失败' : s;
  }
  function payMethodLabel(m) {
    return m === 'wechat' ? '微信' : m === 'alipay' ? '支付宝' : m === 'card' ? '银行卡' : m;
  }
  function applyOrderFilter() {
    let list = D.orders.slice();
    if (State.orderStatusFilter !== 'all') list = list.filter(o => o.status === State.orderStatusFilter);
    if (State.orderPayFilter !== 'all') list = list.filter(o => o.paymentMethod === State.orderPayFilter);
    if (State.orderRangeFilter !== 'all') {
      const day = 86400000;
      const span = State.orderRangeFilter === 'today' ? day :
                   State.orderRangeFilter === '7d' ? 7 * day :
                   State.orderRangeFilter === '30d' ? 30 * day : Infinity;
      const now = Date.now();
      list = list.filter(o => now - o.createdAt <= span);
    }
    return list;
  }
  function confirmRefund(orderId) {
    if (State.refundConfirmOrderId === orderId) {
      const ord = D.orders.find(o => o.id === orderId);
      if (ord) {
        ord.status = 'refunded';
        showToast('已退款 ' + formatCostShort(ord.amount) + ' 积分');
      }
      State.refundConfirmOrderId = null;
    } else {
      State.refundConfirmOrderId = orderId;
      showToast('再点一次确认退款');
      setTimeout(() => {
        if (State.refundConfirmOrderId === orderId) { State.refundConfirmOrderId = null; render(); }
      }, 3000);
    }
    render();
  }

  function viewOrders() {
    const list = applyOrderFilter();
    const day = 86400000;
    const todayPaid = D.orders.filter(o => o.status === 'paid' && Date.now() - o.createdAt < day);
    const todayTotal = todayPaid.reduce((s, o) => s + o.amount, 0);
    const monthRefunded = D.orders.filter(o => o.status === 'refunded' && Date.now() - o.createdAt < 30 * day).length;
    const monthAll = D.orders.filter(o => Date.now() - o.createdAt < 30 * day).length;
    const refundRate = monthAll > 0 ? Math.round(monthRefunded / monthAll * 1000) / 10 : 0;
    const inner = h('div', { class: 'page-inner' },
      h('div', { class: 'kpi-grid kpi-3' },
        kpiCard(formatCostShort(todayPaid.length), '今日订单'),
        kpiCard(formatCostShort(todayTotal), '今日金额'),
        kpiCard(refundRate + '%', '本月退款率'),
      ),
      h('div', { class: 'admin-filters' },
        h('select', {
          class: 'admin-select',
          value: State.orderStatusFilter,
          onChange: (e) => { State.orderStatusFilter = e.target.value; render(); },
        },
          h('option', { value: 'all' }, '全部状态'),
          h('option', { value: 'paid' }, '已支付'),
          h('option', { value: 'pending' }, '待支付'),
          h('option', { value: 'refunded' }, '已退款'),
          h('option', { value: 'failed' }, '失败'),
        ),
        h('select', {
          class: 'admin-select',
          value: State.orderPayFilter,
          onChange: (e) => { State.orderPayFilter = e.target.value; render(); },
        },
          h('option', { value: 'all' }, '全部支付方式'),
          h('option', { value: 'wechat' }, '微信'),
          h('option', { value: 'alipay' }, '支付宝'),
          h('option', { value: 'card' }, '银行卡'),
        ),
        h('select', {
          class: 'admin-select',
          value: State.orderRangeFilter,
          onChange: (e) => { State.orderRangeFilter = e.target.value; render(); },
        },
          h('option', { value: 'today' }, '今天'),
          h('option', { value: '7d' }, '近 7 天'),
          h('option', { value: '30d' }, '近 30 天'),
          h('option', { value: 'all' }, '全部'),
        ),
        h('span', { class: 'admin-filters-count' }, list.length + ' 条'),
      ),
      h('div', { class: 'admin-table-wrap' },
        h('table', { class: 'admin-table' },
          h('thead', null,
            h('tr', null,
              h('th', null, '订单 ID'),
              h('th', null, '用户'),
              h('th', { class: 'num' }, '金额'),
              h('th', null, '状态'),
              h('th', null, '支付方式'),
              h('th', null, '时间'),
              h('th', { style: { width: '90px' } }, ''),
            ),
          ),
          h('tbody', null,
            ...list.map(o => h('tr', null,
              h('td', { class: 'mono' }, o.id),
              h('td', { class: 'mono' }, maskPhone(o.userPhone)),
              h('td', { class: 'num mono' }, '+' + formatCostShort(o.amount)),
              h('td', null, h('span', { class: 'status-chip ' + o.status }, orderStatusLabel(o.status))),
              h('td', null, payMethodLabel(o.paymentMethod)),
              h('td', { class: 'subtle', title: formatAbsolute(o.createdAt) }, formatRelative(o.createdAt)),
              h('td', { class: 'admin-table-actions' },
                o.status === 'paid' && h('button', {
                  class: 'admin-link-btn' + (State.refundConfirmOrderId === o.id ? ' danger' : ''),
                  onClick: () => confirmRefund(o.id),
                }, State.refundConfirmOrderId === o.id ? '再点确认' : '退款'),
              ),
            )),
          ),
        ),
        list.length === 0 && h('div', { class: 'admin-empty' }, '无匹配订单'),
      ),
    );
    return adminShell(inner, '订单与计费', '充值订单与退款管理');
  }

  // ---------- viewModels ----------
  function openModelEdit(id) {
    const m = D.models.find(x => x.id === id);
    if (!m) return;
    State.modelEditOpen = true;
    State.modelEditId = id;
    State.modelEditCost = m.unitCost;
    State.modelEditStatus = m.status;
    render();
  }
  function closeModelEdit() {
    State.modelEditOpen = false;
    State.modelEditId = null;
    render();
  }
  function commitModelEdit() {
    const m = D.models.find(x => x.id === State.modelEditId);
    if (!m) { closeModelEdit(); return; }
    const cost = parseInt(State.modelEditCost, 10);
    if (isNaN(cost) || cost <= 0) { showToast('请输入有效单价'); return; }
    m.unitCost = cost;
    m.status = State.modelEditStatus;
    m.updatedAt = Date.now();
    closeModelEdit();
    showToast('已更新「' + m.name + '」');
  }
  function toggleModelStatus(id) {
    const m = D.models.find(x => x.id === id);
    if (!m) return;
    m.status = m.status === 'active' ? 'offline' : 'active';
    m.updatedAt = Date.now();
    showToast('已' + (m.status === 'active' ? '上架' : '下架') + ' ' + m.name);
    render();
  }
  function viewModels() {
    const list = D.models.filter(m => m.category === State.modelTab);
    const tabs = [
      { key: 'image', label: '图片' },
      { key: 'video', label: '视频' },
      { key: 'text',  label: '文本' },
    ];
    const inner = h('div', { class: 'page-inner' },
      h('div', { class: 'admin-tabs' },
        ...tabs.map(t => h('span', {
          class: 'admin-tab' + (State.modelTab === t.key ? ' on' : ''),
          onClick: () => { State.modelTab = t.key; render(); },
        }, t.label)),
      ),
      h('div', { class: 'admin-table-wrap' },
        h('table', { class: 'admin-table' },
          h('thead', null,
            h('tr', null,
              h('th', null, '模型名'),
              h('th', { class: 'num' }, '单价（积分/次）'),
              h('th', null, '状态'),
              h('th', null, '更新时间'),
              h('th', { style: { width: '160px' } }, ''),
            ),
          ),
          h('tbody', null,
            ...list.map(m => h('tr', null,
              h('td', { class: 'mono' }, m.name),
              h('td', { class: 'num mono' }, formatCostShort(m.unitCost)),
              h('td', null, h('span', { class: 'status-chip ' + (m.status === 'active' ? 'paid' : 'banned') },
                m.status === 'active' ? '上架' : '下架')),
              h('td', { class: 'subtle' }, formatRelative(m.updatedAt)),
              h('td', { class: 'admin-table-actions' },
                h('button', { class: 'admin-link-btn', onClick: () => openModelEdit(m.id) }, '编辑'),
                h('button', {
                  class: 'admin-link-btn',
                  onClick: () => toggleModelStatus(m.id),
                }, m.status === 'active' ? '下架' : '上架'),
              ),
            )),
          ),
        ),
        list.length === 0 && h('div', { class: 'admin-empty' }, '该分类暂无模型'),
      ),
    );
    return adminShell(inner, '模型与计价', '模型上下架与单价管理');
  }

  function modelEditModal() {
    if (!State.modelEditOpen) return null;
    const m = D.models.find(x => x.id === State.modelEditId);
    if (!m) return null;
    return h('div', {
      class: 'admin-modal-mask',
      onClick: (e) => { if (e.target.classList.contains('admin-modal-mask')) closeModelEdit(); },
    },
      h('div', { class: 'admin-modal' },
        h('div', { class: 'admin-modal-head' },
          h('div', null,
            h('h3', null, '编辑模型'),
            h('div', { class: 'subtle' }, m.name),
          ),
          h('button', { class: 'admin-icon-btn', html: ICO.close, onClick: closeModelEdit }),
        ),
        h('div', { class: 'admin-modal-body' },
          h('div', { class: 'admin-field' },
            h('label', null, '单价（积分/次）'),
            h('input', {
              type: 'number',
              value: State.modelEditCost,
              min: 1,
              onInput: (e) => { State.modelEditCost = e.target.value; },
            }),
          ),
          h('div', { class: 'admin-field' },
            h('label', null, '状态'),
            h('select', {
              class: 'admin-select',
              value: State.modelEditStatus,
              onChange: (e) => { State.modelEditStatus = e.target.value; render(); },
            },
              h('option', { value: 'active' }, '上架'),
              h('option', { value: 'offline' }, '下架'),
            ),
          ),
        ),
        h('div', { class: 'admin-modal-foot' },
          h('button', { class: 'admin-btn ghost', onClick: closeModelEdit }, '取消'),
          h('button', { class: 'admin-btn primary', onClick: commitModelEdit }, '保存'),
        ),
      ),
    );
  }

  // ---------- Render ----------
  function render() {
    const app = $('#app');
    app.innerHTML = '';
    const r = route();
    if (r === 'users')          app.append(viewUsers());
    else if (r === 'orders')    app.append(viewOrders());
    else if (r === 'models')    app.append(viewModels());
    else                        app.append(viewDashboard());

    // Modals
    const drawer = userDrawer();
    if (drawer) app.append(drawer);
    const gift = giftModal();
    if (gift) app.append(gift);
    const modelEdit = modelEditModal();
    if (modelEdit) app.append(modelEdit);

    applyTheme();
  }

  window.addEventListener('hashchange', () => {
    // 关掉跨页 popover
    State.userActionMenuOpen = null;
    State.refundConfirmOrderId = null;
    State.banConfirmId = null;
    render();
  });
  window.addEventListener('click', (e) => {
    // 点击空白处关闭 action menu
    if (State.userActionMenuOpen && !e.target.closest('.admin-action-menu-wrap')) {
      State.userActionMenuOpen = null;
      render();
    }
  });
  window.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    render();
  });
})();

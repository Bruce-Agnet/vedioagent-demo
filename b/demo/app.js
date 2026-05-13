// Version-B Demo SPA — restored to prototype layout
// Home: full-width topbar + centered tabs+composer + 4-card project row + banana AD
// Tool/Canvas/Asset: topbar + 3-col (sidenav + col-mid + col-right)
(function () {
  const D = window.MOCK_B;

  // ---------- State ----------
  const State = {
    theme: localStorage.getItem('vb-theme') || 'light',
    projectId: localStorage.getItem('vb-project') || 'p1',
    homeTab: 'text',
    activeSession: {
      image: D.defaultSessions['p1'].image,
      video: D.defaultSessions['p1'].video,
      text: D.defaultSessions['p1'].text,
    },
    assetTab: 'video',
    assetTag: 'all',
    assetSource: 'all',
    assetSearch: '',
    assetSort: 'time-desc', // 'time-desc' | 'time-asc' | 'duration' | 'name'
    assetSortOpen: false,
    skill: 'storyboard',
    midCollapsed: localStorage.getItem('vb-mid-collapsed') === '1',
    workView: 'feed', // 'feed' | 'grid'
    assetSourceOpen: false,
    assetSourceCol: 'tool', // 'tool' | 'canvas' (left column hovered/active)
    assetSourcePick: null,  // { col: 'tool'|'canvas', item: '...' } once selected
    assetBatchDeleteConfirm: false,
    assetSinglePendingDelete: null,
    // ---- Project Members ----
    membersSelectedPid: null,
    memberQuotaModalOpen: false,
    memberQuotaMode: null,        // 'invite' | 'edit'
    memberQuotaTargetPid: null,
    memberQuotaTargetMemberId: null,
    memberQuotaDraftPhone: '',
    memberQuotaDraftType: 'period',
    memberQuotaDraftAmount: 20000,
    memberQuotaDraftPeriod: 'monthly',
    memberPendingDelete: null,    // { pid, mid }
    // ---- Usage Log ----
    usageSelectedPid: null,
    usageRangePreset: '30d',      // 'today' | '7d' | '30d' | 'all'
    usageMemberFilter: 'all',     // 'all' | 'owner' | phone
    usageActionFilter: 'all',     // 'all' | 'image' | 'video' | 'text' | 'edit'
    usageDetailOpen: false,
    usageDetailPayload: null,
    usagePageSize: 30,
    usageDistModalOpen: false,
    usageDistModalPid: null,
    sparkAllOpen: false,
    sparkAllPid: null,
    // ---- 账户 / 项目预算 ----
    budgetEditOpen: false,
    budgetEditPid: null,
    budgetEditDraft: 0,
    accountPanelOpen: false,
    rechargeOpen: false,
    rechargeDraft: 1000,
    tagsModalOpen: false,
    tagEditingId: null,
    tagDraftName: '',
    tagCreating: false,
    tagPendingDelete: null,
    // Template library (prompt + skill) — user-level, persisted in localStorage
    customSkills: (function () {
      try { return JSON.parse(localStorage.getItem('vb-custom-skills') || '[]'); }
      catch (e) { return []; }
    })(),
    userPrompts: (function () {
      try {
        const stored = JSON.parse(localStorage.getItem('vb-user-prompts') || 'null');
        if (Array.isArray(stored) && stored.length > 0) return stored;
      } catch (e) {}
      // Seed: 1 demo prompt with linked asset (so 详情 modal shows 关联产出)
      const seedAsset = (D.assets || []).find(a => a.starred && a.kind === 'image' && a.aspect === '9:16');
      if (!seedAsset) return [];
      return [
        {
          id: 'p-demo-1',
          name: '林深角色卡 · 冷光电影感',
          content: '基于「分镜脚本 V2」和剧情 V2，生成钢铁侠 + 林汉风时空风穿戴的高质量画像。冷光、电影质感、9:16 竖屏，强调专业感细节。',
          imageSrc: seedAsset.src,
          sourceAssetId: seedAsset.id,
          requestMeta: { model: 'GPT image 2', ratio: '9:16', resolution: '720P' },
          source: 'collect',
          creatorPhone: '13800001234',
          createdAt: Date.now() - 86400000,
          updatedAt: Date.now() - 86400000,
        },
      ];
    })(),
    // Already-picked examples in current composer (image/video, ephemeral)
    composedExamples: [],
    // Unified template editor modal (used by both prompt and skill libraries)
    tplModalOpen: false,
    tplModalKind: null,    // 'prompt' | 'skill'
    tplModalMode: null,    // 'create' | 'edit'
    tplEditingId: null,
    tplDraftName: '',
    tplDraftDesc: '',
    tplDraftContent: '',
    // 关联示例上传草稿（仅 prompt kind 使用）
    tplDraftMediaSrc: null,        // dataURL
    tplDraftMediaType: null,       // 'image' | 'video'
    tplDraftMediaName: '',
    tplPendingDelete: null, // { kind, id } — inline confirmation in list row
    // Add-example popover (image/video composer, attached to chip)
    examplePopOpen: false,
    examplePopAnchor: null, // { left, bottom } captured from chip rect at open time
    examplePickerSelected: null, // 当前选中提示词 id（单选）
    // Skill picker popover (text composer, attached to pill)
    skillPopOpen: false,
    skillPopAnchor: null, // { left, bottom } captured from pill rect at open time
    // Favorite collect modal (collecting a generated result as a prompt)
    favCollectOpen: false,
    favCollectDraftName: '',
    favCollectPayload: null, // { content, imageSrc?, videoSrc?, sourceAssetId? }
    // Template detail modal (read-only viewer)
    tplDetailOpen: false,
    tplDetailKind: null, // 'prompt' | 'skill'
    tplDetailId: null,
    // Asset detail modal (large image/video + meta), opened from prompt detail thumbnail
    assetDetailOpen: false,
    assetDetailPayload: null, // { src, type, prompt, model, ratio, resolution, duration, createdAt }
    // ---- Composer attach (Plan: 对话框附件引入) ----
    composedRefs: [], // [{ id, type, name, src?, sourceAssetId?, isUpload?, savedToAssets? }]
    attachMenuOpen: false,
    attachMenuAnchor: null, // { left, bottom } from attach-card rect
    attachMenuToolKey: null, // remember which composer triggered (image|video|text)
    assetPickerOpen: false,
    assetPickerKind: 'image', // 'image' | 'video' | 'doc'
    assetPickerSelected: [], // asset.id list
    uploadModalOpen: false,
    uploadDraftFiles: [], // [{ id, name, type, size, src? }] — v3: 多文件数组
    uploadDraftSaveToAssets: false, // 单一全局开关，应用到本次所有文件
    // ---- 创建项目 modal ----
    createProjectModalOpen: false,
    createProjectDraftName: '',
    // ---- Auth ----
    session: null, // { phone, loggedAt, via? } loaded from localStorage on init
    authPhoneDraft: '',
    authCodeDraft: '',
    authCodeCountdown: 0,
    authAgreementChecked: false,
    // User menu
    userMenuOpen: false,
    userMenuAnchor: null,
    // ---- Tag picker (assign tags to doc assets / messages) ----
    tagPickerOpen: false,
    tagPickerAnchor: null,
    tagPickerTargetType: null, // 'message' | 'asset'
    tagPickerTargetId: null,   // assetId or messageKey
    tagPickerCreating: false,
    tagPickerDraftName: '#',
    // Per-message tags overlay (since D.conv messages don't have stable id)
    // Keyed by `${sessionId}-${msgIndex}` → string[]
    messageTagsByKey: {},
    // ---- Text page selection mode (batch ops) ----
    selectionMode: false,
    selectedAssetIds: [],
    // ---- Session row inline ops ----
    sessionEditingId: null,
    sessionDraftName: '',
    sessionPendingDeleteId: null,
    // ---- Filter (multi-dim: tags + date range) ----
    filter: { tags: [], dateStart: null, dateEnd: null },
    filterPopOpen: false,
    filterPopAnchor: null,
  };

  // v3: 单会话 composedRefs 总量上限（含资产选 + 上传）
  const ATTACH_MAX_COUNT = 8;

  // Helper: live tags for current project (mutated in place by CRUD handlers)
  function currentProjectTags() {
    return D.projectTags[State.projectId] || [];
  }
  function closeTagsModal() {
    State.tagsModalOpen = false;
    State.tagEditingId = null;
    State.tagCreating = false;
    State.tagDraftName = '';
    State.tagPendingDelete = null;
    render();
  }
  function startCreateTag() {
    State.tagCreating = true;
    State.tagEditingId = null;
    State.tagPendingDelete = null;
    State.tagDraftName = '#';
    render();
  }
  function commitCreateTag() {
    const name = (State.tagDraftName || '').trim();
    if (!name || name === '#') return;
    const list = currentProjectTags();
    if (list.some(t => t.name === name)) { alert('已存在同名标签'); return; }
    list.unshift({ id: 'tag-' + Date.now(), name, count: 0 });
    saveProjectTags();
    State.tagCreating = false;
    State.tagDraftName = '';
    render();
  }
  function startEditTag(tag) {
    State.tagEditingId = tag.id;
    State.tagDraftName = tag.name;
    State.tagCreating = false;
    State.tagPendingDelete = null;
    render();
  }
  function commitEditTag() {
    const name = (State.tagDraftName || '').trim();
    if (!name || name === '#') return;
    const list = currentProjectTags();
    const t = list.find(x => x.id === State.tagEditingId);
    if (!t) { State.tagEditingId = null; render(); return; }
    if (list.some(x => x.id !== t.id && x.name === name)) { alert('已存在同名标签'); return; }
    t.name = name;
    saveProjectTags();
    State.tagEditingId = null;
    State.tagDraftName = '';
    render();
  }
  function startDeleteTag(tag) {
    State.tagPendingDelete = tag.id;
    State.tagEditingId = null;
    State.tagCreating = false;
    render();
  }
  function confirmDeleteTag(tag) {
    const list = currentProjectTags();
    const idx = list.findIndex(t => t.id === tag.id);
    if (idx >= 0) list.splice(idx, 1);
    saveProjectTags();
    State.tagPendingDelete = null;
    render();
  }

  // ---------- Template library (Prompt + Skill) ----------
  function saveCustomSkills() {
    localStorage.setItem('vb-custom-skills', JSON.stringify(State.customSkills));
  }
  function saveUserPrompts() {
    localStorage.setItem('vb-user-prompts', JSON.stringify(State.userPrompts));
  }
  // ---- Persistence: projects / projectTags / messageTags ----
  function saveProjects() {
    try { localStorage.setItem('vb-projects', JSON.stringify(D.projects || [])); } catch (e) {}
  }
  function loadProjectsOverlay() {
    try {
      const stored = JSON.parse(localStorage.getItem('vb-projects') || 'null');
      if (Array.isArray(stored) && stored.length > 0) {
        // Replace D.projects with stored (seeded from mock + user creations)
        D.projects.length = 0;
        stored.forEach(p => D.projects.push(p));
      }
    } catch (e) {}
  }
  function saveProjectTags() {
    try { localStorage.setItem('vb-project-tags', JSON.stringify(D.projectTags || {})); } catch (e) {}
  }
  function loadProjectTagsOverlay() {
    try {
      const stored = JSON.parse(localStorage.getItem('vb-project-tags') || 'null');
      if (stored && typeof stored === 'object') {
        Object.keys(stored).forEach(pid => { D.projectTags[pid] = stored[pid]; });
      }
    } catch (e) {}
  }
  function saveMessageTags() {
    try { localStorage.setItem('vb-message-tags', JSON.stringify(State.messageTagsByKey || {})); } catch (e) {}
  }
  function loadMessageTagsOverlay() {
    try {
      const stored = JSON.parse(localStorage.getItem('vb-message-tags') || 'null');
      if (stored && typeof stored === 'object') {
        State.messageTagsByKey = stored;
      }
    } catch (e) {}
  }
  function saveProjectMembers() {
    try { localStorage.setItem('vb-project-members', JSON.stringify(D.projectMembers || {})); } catch (e) {}
  }
  function loadProjectMembersOverlay() {
    try {
      const stored = JSON.parse(localStorage.getItem('vb-project-members') || 'null');
      if (stored && typeof stored === 'object') {
        if (!D.projectMembers) D.projectMembers = {};
        Object.keys(stored).forEach(pid => { D.projectMembers[pid] = stored[pid]; });
      }
    } catch (e) {}
  }
  function saveAccount() {
    try {
      const s = State.session || {};
      localStorage.setItem('vb-account', JSON.stringify({
        balance: s.balance || 0,
        totalRecharged: s.totalRecharged || 0,
        rechargeHistory: s.rechargeHistory || [],
      }));
    } catch (e) {}
  }
  function loadAccountOverlay() {
    try {
      const stored = JSON.parse(localStorage.getItem('vb-account') || 'null');
      if (stored && typeof stored === 'object') {
        if (!State.session) State.session = {};
        if (typeof stored.balance === 'number') State.session.balance = stored.balance;
        if (typeof stored.totalRecharged === 'number') State.session.totalRecharged = stored.totalRecharged;
        if (Array.isArray(stored.rechargeHistory)) State.session.rechargeHistory = stored.rechargeHistory;
      }
    } catch (e) {}
  }
  function ensureAccountSeed() {
    if (!State.session) return;
    if (typeof State.session.balance !== 'number') State.session.balance = 50000;
    // 累计充值守恒：充值 = 当前余额 + 所有项目已分配（钱从充值进来，要么在账户里，要么在项目预算里）
    if (typeof State.session.totalRecharged !== 'number') {
      const initialAllocated = (D.projects || []).reduce((s, p) => s + (p.budgetAllocated || 0), 0);
      State.session.totalRecharged = (State.session.balance || 0) + initialAllocated;
    }
    if (!Array.isArray(State.session.rechargeHistory)) State.session.rechargeHistory = [];
  }
  function saveBudgetHistory() {
    try { localStorage.setItem('vb-budget-history', JSON.stringify(D.budgetHistory || {})); } catch (e) {}
  }
  function loadBudgetHistoryOverlay() {
    try {
      const stored = JSON.parse(localStorage.getItem('vb-budget-history') || 'null');
      if (stored && typeof stored === 'object') {
        if (!D.budgetHistory) D.budgetHistory = {};
        Object.keys(stored).forEach(pid => { D.budgetHistory[pid] = stored[pid]; });
      } else if (!D.budgetHistory) {
        D.budgetHistory = {};
      }
    } catch (e) { if (!D.budgetHistory) D.budgetHistory = {}; }
  }
  function pushBudgetHistory(pid, delta, balBefore, balAfter, budBefore, budAfter) {
    if (!D.budgetHistory) D.budgetHistory = {};
    if (!D.budgetHistory[pid]) D.budgetHistory[pid] = [];
    D.budgetHistory[pid].unshift({
      id: 'bh-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
      when: Date.now(),
      delta,
      balanceBefore: balBefore,
      balanceAfter: balAfter,
      budgetBefore: budBefore,
      budgetAfter: budAfter,
    });
  }
  function getBudgetHistoryFlat(limit) {
    const all = [];
    const map = D.budgetHistory || {};
    Object.keys(map).forEach(pid => {
      (map[pid] || []).forEach(h => { all.push(Object.assign({ pid }, h)); });
    });
    all.sort((a, b) => b.when - a.when);
    return typeof limit === 'number' ? all.slice(0, limit) : all;
  }
  // Initialize overlays on boot (D is already populated from MOCK_B)
  loadProjectsOverlay();
  loadProjectTagsOverlay();
  loadMessageTagsOverlay();
  loadProjectMembersOverlay();
  function allSkills() {
    return [...(D.builtinSkills || []), ...State.customSkills];
  }
  function currentSkillObj() {
    const list = allSkills();
    return list.find(s => s.id === State.skill)
      || list.find(s => s.id === 'storyboard')
      || list[0]
      || null;
  }
  function tplKindLabel(kind) {
    return kind === 'prompt' ? '提示词' : '技能';
  }
  function genId(prefix) {
    return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
  }

  function openTplCreate(kind) {
    State.tplModalOpen = true;
    State.tplModalKind = kind;
    State.tplModalMode = 'create';
    State.tplEditingId = null;
    State.tplDraftName = '';
    State.tplDraftDesc = '';
    State.tplDraftContent = '';
    State.tplDraftMediaSrc = null;
    State.tplDraftMediaType = null;
    State.tplDraftMediaName = '';
    render();
  }
  function openTplEdit(kind, item) {
    State.tplModalOpen = true;
    State.tplModalKind = kind;
    State.tplModalMode = 'edit';
    State.tplEditingId = item.id;
    State.tplDraftName = item.name || '';
    State.tplDraftDesc = item.description || '';
    State.tplDraftContent = item.content || '';
    if (kind === 'prompt') {
      if (item.imageSrc) {
        State.tplDraftMediaSrc = item.imageSrc;
        State.tplDraftMediaType = 'image';
        State.tplDraftMediaName = '';
      } else if (item.videoSrc) {
        State.tplDraftMediaSrc = item.videoSrc;
        State.tplDraftMediaType = 'video';
        State.tplDraftMediaName = '';
      } else {
        State.tplDraftMediaSrc = null;
        State.tplDraftMediaType = null;
        State.tplDraftMediaName = '';
      }
    } else {
      State.tplDraftMediaSrc = null;
      State.tplDraftMediaType = null;
      State.tplDraftMediaName = '';
    }
    render();
  }
  function closeTplModal() {
    State.tplModalOpen = false;
    State.tplModalKind = null;
    State.tplModalMode = null;
    State.tplEditingId = null;
    State.tplDraftName = '';
    State.tplDraftDesc = '';
    State.tplDraftContent = '';
    State.tplDraftMediaSrc = null;
    State.tplDraftMediaType = null;
    State.tplDraftMediaName = '';
    render();
  }
  function onTplMediaPick(file) {
    if (!file) return;
    const isImg = file.type && file.type.startsWith('image/');
    const isVid = file.type && file.type.startsWith('video/');
    if (!isImg && !isVid) { showToast('仅支持图片或视频'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      State.tplDraftMediaSrc = ev.target.result;
      State.tplDraftMediaType = isImg ? 'image' : 'video';
      State.tplDraftMediaName = file.name || '';
      render();
    };
    reader.onerror = () => showToast('「' + (file.name || '文件') + '」读取失败');
    try { reader.readAsDataURL(file); } catch (e) { showToast('读取失败'); }
  }
  function clearTplMedia() {
    State.tplDraftMediaSrc = null;
    State.tplDraftMediaType = null;
    State.tplDraftMediaName = '';
    render();
  }
  function commitTpl() {
    const name = (State.tplDraftName || '').trim();
    const content = (State.tplDraftContent || '').trim();
    if (!name) { alert('请填写名称'); return; }
    if (!content) { alert('请填写内容'); return; }
    const kind = State.tplModalKind;
    const now = Date.now();

    if (kind === 'prompt') {
      const mediaSrc = State.tplDraftMediaSrc || null;
      const mediaType = State.tplDraftMediaType || null;
      if (State.tplModalMode === 'create') {
        State.userPrompts.unshift({
          id: genId('p'),
          name, content,
          imageSrc: mediaType === 'image' ? mediaSrc : null,
          videoSrc: mediaType === 'video' ? mediaSrc : null,
          source: 'create',
          creatorPhone: (State.session && State.session.phone) || null,
          createdAt: now, updatedAt: now,
        });
      } else {
        const item = State.userPrompts.find(p => p.id === State.tplEditingId);
        if (item) {
          item.name = name; item.content = content; item.updatedAt = now;
          item.imageSrc = mediaType === 'image' ? mediaSrc : null;
          item.videoSrc = mediaType === 'video' ? mediaSrc : null;
        }
      }
      saveUserPrompts();
    } else {
      const desc = (State.tplDraftDesc || '').trim();
      if (State.tplModalMode === 'create') {
        State.customSkills.unshift({
          id: genId('s'),
          name, description: desc || '点编辑添加内容',
          content, builtin: false,
          source: 'create',
          creatorPhone: (State.session && State.session.phone) || null,
          createdAt: now, updatedAt: now,
        });
      } else {
        const item = State.customSkills.find(s => s.id === State.tplEditingId);
        if (item) {
          item.name = name;
          item.description = desc || '点编辑添加内容';
          item.content = content;
          item.updatedAt = now;
        }
      }
      saveCustomSkills();
    }
    closeTplModal();
  }
  function startDeleteTpl(kind, id) {
    State.tplPendingDelete = { kind, id };
    render();
  }
  function cancelDeleteTpl() {
    State.tplPendingDelete = null;
    render();
  }
  function confirmDeleteTpl(kind, id) {
    if (kind === 'prompt') {
      const idx = State.userPrompts.findIndex(p => p.id === id);
      if (idx >= 0) State.userPrompts.splice(idx, 1);
      saveUserPrompts();
    } else {
      const idx = State.customSkills.findIndex(s => s.id === id);
      if (idx >= 0) State.customSkills.splice(idx, 1);
      saveCustomSkills();
      // If the deleted skill was active, fall back to default
      if (State.skill === id) State.skill = 'storyboard';
    }
    State.tplPendingDelete = null;
    render();
  }

  // ---------- Composer add-example popover (image/video) ----------
  function openExamplePop(anchorEl) {
    if (anchorEl) {
      const r = anchorEl.getBoundingClientRect();
      // 以 chip 右边为锚向左展开 popover（chip 通常在 composer 右下角，避免溢出右边）
      State.examplePopAnchor = {
        right: Math.round(window.innerWidth - r.right),
        bottom: Math.round(window.innerHeight - r.top + 8),
      };
    } else {
      State.examplePopAnchor = null;
    }
    State.examplePopOpen = true;
    render();
  }
  function closeExamplePop() {
    State.examplePopOpen = false;
    State.examplePopAnchor = null;
    State.examplePickerSelected = null;
    render();
  }
  function toggleComposedExample(p) {
    const idx = State.composedExamples.findIndex(x => x.id === p.id);
    if (idx >= 0) State.composedExamples.splice(idx, 1);
    else State.composedExamples.push({ id: p.id, name: p.name, content: p.content });
    render();
  }
  function clearComposedExamples(e) {
    if (e) e.stopPropagation();
    State.composedExamples = [];
    render();
  }
  function selectExamplePromptInPicker(p) {
    State.examplePickerSelected = p.id;
    render();
  }
  function _writeComposerTextarea(text) {
    // closeExamplePop 会触发 render 重建 textarea；异步写入新 DOM。
    setTimeout(() => {
      const ta = document.querySelector('.input-card .prompt-area');
      if (ta) {
        ta.value = text;
        try { ta.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) {}
        try { ta.focus(); } catch (e) {}
      }
    }, 0);
  }
  function useExamplePromptToCompose() {
    const id = State.examplePickerSelected;
    const p = (State.userPrompts || []).find(x => x.id === id);
    if (!p) return;
    const text = p.content || '';
    closeExamplePop();
    _writeComposerTextarea(text);
    showToast('已使用「' + (p.name || '提示词') + '」');
  }
  function aiUpgradeWithExample() {
    const id = State.examplePickerSelected;
    const p = (State.userPrompts || []).find(x => x.id === id);
    if (!p) return;
    // 在关 popover 之前抓 textarea 当前内容
    const taPre = document.querySelector('.input-card .prompt-area');
    const cur = ((taPre && taPre.value) || '').trim();
    if (!cur) { showToast('请先在对话框中输入内容'); return; }
    closeExamplePop();
    showToast('AI 提升中…');
    setTimeout(() => {
      const refined = cur + '\n\n[已参考「' + (p.name || '提示词') + '」AI 提升]';
      _writeComposerTextarea(refined);
      showToast('AI 提升完成');
    }, 800);
  }

  // ---------- Skill picker popover (text composer, attached to pill) ----------
  function openSkillPop(anchorEl) {
    if (anchorEl) {
      const r = anchorEl.getBoundingClientRect();
      State.skillPopAnchor = {
        left: Math.round(r.left),
        bottom: Math.round(window.innerHeight - r.top + 6),
      };
    } else {
      State.skillPopAnchor = null;
    }
    State.skillPopOpen = true;
    render();
  }
  function closeSkillPop() {
    State.skillPopOpen = false;
    State.skillPopAnchor = null;
    render();
  }
  function toggleSkillPop(e) {
    if (State.skillPopOpen) { closeSkillPop(); return; }
    e.stopPropagation();
    openSkillPop(e.currentTarget || e.target.closest('.pill'));
  }

  // ---------- Favorite collect (collecting result as prompt example) ----------
  function openFavCollect(req, result, sourceAssetId) {
    const text = (req && req.text) || '';
    const defaultName = text.slice(0, 12) || '未命名';
    State.favCollectDraftName = defaultName;
    State.favCollectPayload = {
      content: text,
      imageSrc: result && result.type === 'image' ? result.src : null,
      videoSrc: result && result.type === 'video' ? result.src : null,
      sourceAssetId: sourceAssetId || null,
      requestMeta: req ? { model: req.model, ratio: req.ratio, resolution: req.resolution, duration: req.duration } : null,
    };
    State.favCollectOpen = true;
    render();
  }
  function closeFavCollect() {
    State.favCollectOpen = false;
    State.favCollectDraftName = '';
    State.favCollectPayload = null;
    render();
  }
  function commitFavCollect() {
    const name = (State.favCollectDraftName || '').trim();
    if (!name) { alert('请填写名称'); return; }
    const payload = State.favCollectPayload || {};
    const now = Date.now();
    State.userPrompts.unshift({
      id: genId('p'),
      name,
      content: payload.content || '',
      imageSrc: payload.imageSrc || null,
      videoSrc: payload.videoSrc || null,
      sourceAssetId: payload.sourceAssetId || null,
      requestMeta: payload.requestMeta || null,
      source: 'collect',
      creatorPhone: (State.session && State.session.phone) || null,
      createdAt: now, updatedAt: now,
    });
    saveUserPrompts();
    closeFavCollect();
    showToast('已收藏到提示词库');
  }

  // ---------- Template detail modal (read-only viewer) ----------
  function openTplDetail(kind, id) {
    State.tplDetailKind = kind;
    State.tplDetailId = id;
    State.tplDetailOpen = true;
    render();
  }
  function closeTplDetail() {
    State.tplDetailOpen = false;
    State.tplDetailKind = null;
    State.tplDetailId = null;
    State.tplPendingDelete = null;
    render();
  }
  function getTplDetailItem() {
    if (!State.tplDetailOpen) return null;
    if (State.tplDetailKind === 'prompt') {
      return State.userPrompts.find(p => p.id === State.tplDetailId);
    }
    return allSkills().find(s => s.id === State.tplDetailId);
  }

  // ---------- Asset detail modal (large image/video + meta) ----------
  function openAssetDetail(payload) {
    State.assetDetailPayload = payload;
    State.assetDetailOpen = true;
    render();
  }
  function closeAssetDetail() {
    State.assetDetailOpen = false;
    State.assetDetailPayload = null;
    render();
  }

  // ---------- AI upgrade button (demo placeholder) ----------
  function aiUpgradeDemo() {
    showToast('AI 提升中…');
    setTimeout(() => showToast('已完成'), 1500);
  }

  // ---------- Tag picker / asset tags / download ----------
  // Stable fake HH:MM:SS based on a seed (so refresh keeps same time per asset)
  function fakeTimeStr(seed) {
    const s = String(seed == null ? '' : seed);
    let h = 0;
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    h = Math.abs(h);
    const hh = String(h % 24).padStart(2, '0');
    const mm = String(Math.floor(h / 60) % 60).padStart(2, '0');
    const ss = String(Math.floor(h / 3600) % 60).padStart(2, '0');
    return hh + ':' + mm + ':' + ss;
  }
  function formatAssetDateTime(a) {
    const d = (a && a.date) || '';
    if (!d) return fakeTimeStr(a && a.id);
    return d + ' ' + fakeTimeStr(a && a.id);
  }
  // 相对时间：刚刚 / N 分钟前 / N 小时前 / N 天前 / X 月 X 日（跨年带年份）
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
    const sameYear = d.getFullYear() === nowD.getFullYear();
    return sameYear
      ? (d.getMonth() + 1) + ' 月 ' + d.getDate() + ' 日'
      : d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
  }
  function formatAbsolute(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const pad = (n) => String(n).padStart(2, '0');
    return d.getFullYear() + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate())
      + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function getAssetTags(a) {
    if (!a) return [];
    if (Array.isArray(a.tags)) return a.tags.slice();
    if (a.tag) return [a.tag];
    return [];
  }
  function setAssetTags(a, tags) {
    if (!a) return;
    a.tags = (tags || []).slice();
    if ('tag' in a) delete a.tag;
  }
  function getMessageTags(key) {
    return (State.messageTagsByKey[key] || []).slice();
  }
  function setMessageTags(key, tags) {
    State.messageTagsByKey[key] = (tags || []).slice();
    saveMessageTags();
  }
  function getCurrentProjectTagList() {
    return D.projectTags[State.projectId] || [];
  }

  function openTagPicker(anchorEl, type, id) {
    if (anchorEl) {
      const r = anchorEl.getBoundingClientRect();
      State.tagPickerAnchor = {
        right: Math.round(window.innerWidth - r.right),
        top: Math.round(r.bottom + 6),
      };
    } else {
      State.tagPickerAnchor = null;
    }
    State.tagPickerTargetType = type;
    State.tagPickerTargetId = id;
    State.tagPickerCreating = false;
    State.tagPickerDraftName = '#';
    State.tagPickerOpen = true;
    render();
  }
  function closeTagPicker() {
    State.tagPickerOpen = false;
    State.tagPickerAnchor = null;
    State.tagPickerTargetType = null;
    State.tagPickerTargetId = null;
    State.tagPickerCreating = false;
    State.tagPickerDraftName = '#';
    render();
  }
  function getTargetTags() {
    if (State.tagPickerTargetType === 'asset') {
      const a = (D.assets || []).find(x => String(x.id) === String(State.tagPickerTargetId));
      return getAssetTags(a);
    }
    if (State.tagPickerTargetType === 'message') {
      return getMessageTags(State.tagPickerTargetId);
    }
    if (State.tagPickerTargetType === 'batch') {
      // Intersection: tags that ALL selected assets have
      const ids = State.selectedAssetIds || [];
      if (ids.length === 0) return [];
      const sets = ids.map(id => new Set(getAssetTags((D.assets || []).find(x => String(x.id) === String(id)))));
      const [first, ...rest] = sets;
      if (!first) return [];
      return Array.from(first).filter(t => rest.every(s => s.has(t)));
    }
    return [];
  }
  function setTargetTags(tags) {
    if (State.tagPickerTargetType === 'asset') {
      const a = (D.assets || []).find(x => String(x.id) === String(State.tagPickerTargetId));
      if (a) setAssetTags(a, tags);
    } else if (State.tagPickerTargetType === 'message') {
      setMessageTags(State.tagPickerTargetId, tags);
    }
  }
  function toggleTargetTag(tagName) {
    if (State.tagPickerTargetType === 'batch') {
      const ids = State.selectedAssetIds || [];
      const assets = ids.map(id => (D.assets || []).find(x => String(x.id) === String(id))).filter(Boolean);
      const allHave = assets.length > 0 && assets.every(a => getAssetTags(a).includes(tagName));
      assets.forEach(a => {
        const tags = getAssetTags(a);
        if (allHave) {
          setAssetTags(a, tags.filter(t => t !== tagName));
        } else if (!tags.includes(tagName)) {
          setAssetTags(a, [...tags, tagName]);
        }
      });
      render();
      return;
    }
    const cur = new Set(getTargetTags());
    if (cur.has(tagName)) cur.delete(tagName);
    else cur.add(tagName);
    setTargetTags(Array.from(cur));
    render();
  }

  function startInlineCreateTag() {
    State.tagPickerCreating = true;
    State.tagPickerDraftName = '#';
    render();
  }
  function cancelInlineCreateTag() {
    State.tagPickerCreating = false;
    State.tagPickerDraftName = '#';
    render();
  }
  function commitInlineCreateTag() {
    let name = (State.tagPickerDraftName || '').trim();
    if (!name || name === '#') { showToast('请输入标签名'); return; }
    if (!name.startsWith('#')) name = '#' + name;
    const list = D.projectTags[State.projectId] || (D.projectTags[State.projectId] = []);
    if (list.some(t => t.name === name)) { showToast('已存在同名标签'); return; }
    list.unshift({ id: 'tag-' + Date.now(), name, count: 0 });
    saveProjectTags();
    // Auto-check on current target (works for asset / message / batch)
    if (State.tagPickerTargetType === 'batch') {
      // toggle adds it (allHave=false since just created)
      toggleTargetTag(name);
    } else {
      const cur = getTargetTags();
      if (!cur.includes(name)) setTargetTags([...cur, name]);
    }
    State.tagPickerCreating = false;
    State.tagPickerDraftName = '#';
    render();
  }

  // ---------- Selection mode (batch operations) ----------
  function enterSelectionMode() {
    State.selectionMode = true;
    State.selectedAssetIds = [];
    render();
  }
  function exitSelectionMode() {
    State.selectionMode = false;
    State.selectedAssetIds = [];
    render();
  }
  function toggleSelectAsset(id) {
    const arr = State.selectedAssetIds;
    const idx = arr.indexOf(id);
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push(id);
    render();
  }
  function getSelectedAssets() {
    const ids = new Set(State.selectedAssetIds);
    return (D.assets || []).filter(a => ids.has(a.id));
  }
  function batchDownload() {
    const items = getSelectedAssets();
    if (items.length === 0) { showToast('未选择项'); return; }
    items.forEach((a, i) => {
      setTimeout(() => {
        downloadDocFromAsset(a);
      }, i * 300);
    });
    setTimeout(() => {
      showToast('已下载 ' + items.length + ' 个文件');
      exitSelectionMode();
    }, items.length * 300);
  }
  function downloadDocFromAsset(a) {
    downloadDoc({
      title: a.title || ('文档-' + a.id),
      prompt: a.desc || '',
    });
  }
  function batchTag(anchorEl) {
    if (State.selectedAssetIds.length === 0) { showToast('未选择项'); return; }
    openTagPicker(anchorEl, 'batch', null);
  }

  // ---------- Session row helpers (pin/edit/delete) ----------
  function openNewChat(toolKey) {
    const id = toolKey + '-' + Date.now();
    const sessions = D.sessions[State.projectId] || (D.sessions[State.projectId] = []);
    const count = sessions.filter(s => s.tool === toolKey).length + 1;
    sessions.unshift({
      id,
      tool: toolKey,
      name: '新会话 ' + count,
      subtitle: '空白起步',
      updated: '刚刚',
      kind: 'recent',
      episode: '',
    });
    State.activeSession[toolKey] = id;
    showToast('已创建新对话');
    render();
  }
  function togglePinSession(s) {
    s.kind = (s.kind === 'pinned') ? 'recent' : 'pinned';
    render();
  }
  function startEditSession(s) {
    State.sessionEditingId = s.id;
    State.sessionDraftName = s.name || '';
    State.sessionPendingDeleteId = null;
    render();
  }
  function cancelEditSession() {
    State.sessionEditingId = null;
    State.sessionDraftName = '';
    render();
  }
  function commitEditSession(s) {
    const name = (State.sessionDraftName || '').trim();
    if (!name) { showToast('请输入名称'); return; }
    s.name = name;
    State.sessionEditingId = null;
    State.sessionDraftName = '';
    render();
  }
  function startDeleteSession(s) {
    State.sessionPendingDeleteId = s.id;
    State.sessionEditingId = null;
    render();
  }
  function cancelDeleteSession() {
    State.sessionPendingDeleteId = null;
    render();
  }
  function confirmDeleteSession(s, toolKey) {
    const sessions = D.sessions[State.projectId] || [];
    const idx = sessions.findIndex(x => x.id === s.id);
    if (idx >= 0) sessions.splice(idx, 1);
    State.sessionPendingDeleteId = null;
    // If deleted active session, fallback to first remaining of this tool
    if (State.activeSession[toolKey] === s.id) {
      const remaining = sessions.filter(x => x.tool === toolKey);
      State.activeSession[toolKey] = remaining[0] ? remaining[0].id : null;
    }
    showToast('已删除');
    render();
  }

  // ---------- Filter (multi-dim: tags + date range) ----------
  function getActiveFilter() {
    return State.filter || (State.filter = { tags: [], dateStart: null, dateEnd: null });
  }
  function isFilterActive() {
    const f = getActiveFilter();
    return (f.tags && f.tags.length > 0) || !!f.dateStart || !!f.dateEnd;
  }
  function clearFilter() {
    State.filter = { tags: [], dateStart: null, dateEnd: null };
  }
  function toggleFilterTag(name) {
    const f = getActiveFilter();
    const idx = f.tags.indexOf(name);
    if (idx >= 0) f.tags.splice(idx, 1);
    else f.tags.push(name);
    render();
  }
  function ymd(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }
  function setFilterPreset(key) {
    const f = getActiveFilter();
    const now = new Date();
    if (key === 'all') {
      f.dateStart = null; f.dateEnd = null;
    } else if (key === 'today') {
      const t = ymd(now);
      f.dateStart = t; f.dateEnd = t;
    } else if (key === 'thisweek') {
      const start = new Date(now);
      const dow = now.getDay() || 7; // Mon-based
      start.setDate(now.getDate() - (dow - 1));
      f.dateStart = ymd(start);
      f.dateEnd = ymd(now);
    } else if (key === 'thismonth') {
      f.dateStart = ymd(new Date(now.getFullYear(), now.getMonth(), 1));
      f.dateEnd = ymd(now);
    }
    render();
  }
  function isPresetActive(key) {
    const f = getActiveFilter();
    const now = new Date();
    if (key === 'all') return !f.dateStart && !f.dateEnd;
    if (key === 'today') {
      const t = ymd(now);
      return f.dateStart === t && f.dateEnd === t;
    }
    if (key === 'thisweek') {
      const start = new Date(now);
      const dow = now.getDay() || 7;
      start.setDate(now.getDate() - (dow - 1));
      return f.dateStart === ymd(start) && f.dateEnd === ymd(now);
    }
    if (key === 'thismonth') {
      const start = ymd(new Date(now.getFullYear(), now.getMonth(), 1));
      return f.dateStart === start && f.dateEnd === ymd(now);
    }
    return false;
  }
  function parseAssetDateYMD(s) {
    if (!s) return null;
    const m = String(s).match(/(\d+)\s*月\s*(\d+)\s*日/);
    if (!m) return null;
    const now = new Date();
    return now.getFullYear() + '-' + String(parseInt(m[1])).padStart(2, '0') + '-' + String(parseInt(m[2])).padStart(2, '0');
  }
  function applyAdvancedFilter(list) {
    const f = getActiveFilter();
    let r = list;
    if (f.tags && f.tags.length > 0) {
      const set = new Set(f.tags);
      r = r.filter(a => getAssetTags(a).some(t => set.has(t)));
    }
    if (f.dateStart || f.dateEnd) {
      r = r.filter(a => {
        const d = parseAssetDateYMD(a.date);
        if (!d) return false;
        if (f.dateStart && d < f.dateStart) return false;
        if (f.dateEnd && d > f.dateEnd) return false;
        return true;
      });
    }
    return r;
  }
  function docMatchesFilter(m, sessionId, msgIdx) {
    const f = getActiveFilter();
    if (f.tags && f.tags.length > 0) {
      const tags = getMessageTags(sessionId + '-' + msgIdx);
      if (!f.tags.some(t => tags.includes(t))) return false;
    }
    // Date filter is ignored for feed messages (no date field)
    return true;
  }
  function filterButtonLabel() {
    const f = getActiveFilter();
    const parts = [];
    if (f.tags && f.tags.length > 0) parts.push(f.tags.length + ' 标签');
    if (f.dateStart && f.dateEnd) {
      const startMD = f.dateStart.slice(5).replace('-', '/');
      const endMD = f.dateEnd.slice(5).replace('-', '/');
      if (f.dateStart === f.dateEnd) parts.push(startMD);
      else parts.push(startMD + '~' + endMD);
    } else if (f.dateStart) parts.push(f.dateStart.slice(5).replace('-', '/') + ' 起');
    else if (f.dateEnd) parts.push('至 ' + f.dateEnd.slice(5).replace('-', '/'));
    return parts.length === 0 ? '全部' : parts.join(' · ');
  }
  function openFilterPop(anchorEl) {
    if (anchorEl) {
      const r = anchorEl.getBoundingClientRect();
      State.filterPopAnchor = {
        right: Math.round(window.innerWidth - r.right),
        top: Math.round(r.bottom + 6),
      };
    } else {
      State.filterPopAnchor = null;
    }
    State.filterPopOpen = true;
    render();
  }
  function closeFilterPop() {
    State.filterPopOpen = false;
    State.filterPopAnchor = null;
    render();
  }

  // ---------- Download media result (image/video) ----------
  function downloadMediaResult(res, req) {
    if (!res || !res.src) { showToast('无可下载内容'); return; }
    const ext = res.type === 'video' ? 'mp4' : 'png';
    const ts = Date.now();
    const baseName = (req && req.text) ? String(req.text).slice(0, 18).replace(/[\\/:*?"<>|]/g, '_') : 'media';
    const a = document.createElement('a');
    a.href = res.src;
    a.download = baseName + '-' + ts + '.' + ext;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('已下载');
  }

  // ---------- Download (demo: Blob → .txt) ----------
  function downloadDoc(item) {
    const title = item.title || '未命名文档';
    const lines = [
      title,
      item.version ? 'Version: ' + item.version : null,
      item.note ? 'Note: ' + item.note : null,
      '──────────────',
      '',
      item.prompt || item.desc || '（无内容）',
    ].filter(s => s !== null);
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = title + '.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('已下载');
  }

  // ---------- Create project (modal + helpers) ----------
  function openCreateProject() {
    State.createProjectModalOpen = true;
    State.createProjectDraftName = '';
    render();
  }
  function closeCreateProject() {
    State.createProjectModalOpen = false;
    State.createProjectDraftName = '';
    render();
  }
  function commitCreateProject() {
    const name = (State.createProjectDraftName || '').trim();
    if (!name) { showToast('请输入项目名称'); return; }
    // 重名校验
    if ((D.projects || []).some(p => p.name === name)) {
      showToast('已存在同名项目');
      return;
    }
    const today = new Date();
    const formatted = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const newId = 'p-' + Date.now();
    const newProject = {
      id: newId,
      name,
      updatedAt: formatted,
      stats: { videos: 0, images: 0, docs: 0 },
      ownerPhone: (State.session && State.session.phone) || null,
      budgetAllocated: 0,
    };
    D.projects.unshift(newProject);
    saveProjects();
    State.createProjectModalOpen = false;
    State.createProjectDraftName = '';
    setProject(newId);
    location.hash = '#/assets';
    showToast('项目已创建');
  }

  // ---------- Project Members helpers ----------
  function getOwnedProjects() {
    const sp = (State.session && State.session.phone) || '';
    return (D.projects || []).filter(p => !p.ownerPhone || p.ownerPhone === sp || p.ownerPhone === '13800000123');
  }
  function getProjectMembers(pid) {
    if (!D.projectMembers) D.projectMembers = {};
    return D.projectMembers[pid] || [];
  }
  function genMemberId() {
    return 'm-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
  }
  function periodLabel(p) {
    return p === 'daily' ? '每日' : p === 'weekly' ? '每周' : '每月';
  }
  function quotaSummary(m) {
    if (!m) return '';
    if (m.quotaType === 'unlimited') return '无限';
    if (m.quotaType === 'fixed') return '固定 ' + (m.quotaAmount || 0) + ' 积分';
    if (m.quotaType === 'period') return '周期 ' + (m.quotaAmount || 0) + ' / ' + periodLabel(m.quotaPeriod);
    return '';
  }
  function quotaProgress(m) {
    if (!m) return null;
    if (m.quotaType === 'fixed') return { used: m.used || 0, total: m.quotaAmount || 0 };
    if (m.quotaType === 'period') return { used: m.periodUsed || 0, total: m.quotaAmount || 0 };
    return null; // unlimited 不显示进度
  }
  function openMemberInvite(pid) {
    State.memberQuotaModalOpen = true;
    State.memberQuotaMode = 'invite';
    State.memberQuotaTargetPid = pid;
    State.memberQuotaTargetMemberId = null;
    State.memberQuotaDraftPhone = '';
    State.memberQuotaDraftType = 'period';
    State.memberQuotaDraftAmount = 20000;
    State.memberQuotaDraftPeriod = 'monthly';
    render();
  }
  function openMemberEdit(pid, mid) {
    const m = getProjectMembers(pid).find(x => x.id === mid);
    if (!m) return;
    State.memberQuotaModalOpen = true;
    State.memberQuotaMode = 'edit';
    State.memberQuotaTargetPid = pid;
    State.memberQuotaTargetMemberId = mid;
    State.memberQuotaDraftPhone = m.phone;
    State.memberQuotaDraftType = m.quotaType || 'period';
    State.memberQuotaDraftAmount = m.quotaAmount || 0;
    State.memberQuotaDraftPeriod = m.quotaPeriod || 'monthly';
    render();
  }
  function closeMemberQuotaModal() {
    State.memberQuotaModalOpen = false;
    State.memberQuotaMode = null;
    State.memberQuotaTargetPid = null;
    State.memberQuotaTargetMemberId = null;
    State.memberQuotaDraftPhone = '';
    render();
  }
  function commitMemberQuota() {
    const pid = State.memberQuotaTargetPid;
    if (!pid) return;
    const t = State.memberQuotaDraftType;
    const amount = parseInt(State.memberQuotaDraftAmount, 10) || 0;
    const period = State.memberQuotaDraftPeriod;
    if (!D.projectMembers) D.projectMembers = {};
    if (!D.projectMembers[pid]) D.projectMembers[pid] = [];

    if (State.memberQuotaMode === 'invite') {
      const phone = (State.memberQuotaDraftPhone || '').trim();
      if (!/^1\d{10}$/.test(phone)) { showToast('请输入 11 位手机号'); return; }
      const exists = D.projectMembers[pid].find(m => m.phone === phone);
      if (exists) { showToast('该成员已在项目中'); return; }
      const sp = (State.session && State.session.phone) || '';
      if (phone === sp) { showToast('不能邀请自己'); return; }
      if (t !== 'unlimited' && amount <= 0) { showToast('请输入有效额度'); return; }
      D.projectMembers[pid].push({
        id: genMemberId(),
        phone,
        role: 'member',
        quotaType: t,
        quotaAmount: t === 'unlimited' ? 0 : amount,
        quotaPeriod: t === 'period' ? period : null,
        used: 0,
        periodUsed: 0,
        periodResetAt: t === 'period' ? Date.now() + (period === 'daily' ? 86400000 : period === 'weekly' ? 604800000 : 2592000000) : null,
        joinedAt: Date.now(),
      });
      showToast('已邀请 ' + maskPhone(phone));
    } else {
      const mid = State.memberQuotaTargetMemberId;
      const m = D.projectMembers[pid].find(x => x.id === mid);
      if (!m) return;
      if (t !== 'unlimited' && amount <= 0) { showToast('请输入有效额度'); return; }
      m.quotaType = t;
      m.quotaAmount = t === 'unlimited' ? 0 : amount;
      m.quotaPeriod = t === 'period' ? period : null;
      if (t !== 'period') { m.periodUsed = 0; m.periodResetAt = null; }
      showToast('额度已更新');
    }
    saveProjectMembers();
    closeMemberQuotaModal();
  }
  function removeMember(pid, mid) {
    const cur = State.memberPendingDelete;
    if (cur && cur.pid === pid && cur.mid === mid) {
      const list = getProjectMembers(pid);
      const idx = list.findIndex(m => m.id === mid);
      if (idx >= 0) list.splice(idx, 1);
      State.memberPendingDelete = null;
      saveProjectMembers();
      showToast('已移除');
      render();
    } else {
      State.memberPendingDelete = { pid, mid };
      render();
      showToast('再点一次确认移除');
      setTimeout(() => {
        const c = State.memberPendingDelete;
        if (c && c.pid === pid && c.mid === mid) {
          State.memberPendingDelete = null;
          render();
        }
      }, 3000);
    }
  }

  // ---------- Usage Log helpers ----------
  function getProjectUsage(pid) {
    return (D.usageLogs && D.usageLogs[pid]) || [];
  }
  function actionLabel(a) {
    return a === 'image' ? '图片' : a === 'video' ? '视频' : a === 'text' ? '文本' : a === 'edit' ? '编辑' : a;
  }
  function actionIco(a) {
    return a === 'image' ? ICO.imageTool : a === 'video' ? ICO.videoTool : a === 'text' ? ICO.textTool : a === 'edit' ? ICO.edit : ICO.activity;
  }
  function formatCostShort(n) {
    if (n == null) return '0';
    return Number(n).toLocaleString('en-US');
  }
  function applyUsageFilter(list) {
    let out = list.slice();
    const range = State.usageRangePreset || '30d';
    if (range !== 'all') {
      const now = Date.now();
      const span = range === 'today' ? 86400000 : range === '7d' ? 7 * 86400000 : 30 * 86400000;
      out = out.filter(u => (now - u.when) <= span);
    }
    if (State.usageMemberFilter && State.usageMemberFilter !== 'all') {
      if (State.usageMemberFilter === 'owner') {
        out = out.filter(u => u.role === 'owner');
      } else {
        out = out.filter(u => u.memberPhone === State.usageMemberFilter);
      }
    }
    if (State.usageActionFilter && State.usageActionFilter !== 'all') {
      out = out.filter(u => u.action === State.usageActionFilter);
    }
    return out;
  }
  function usageStats(list) {
    const total = list.reduce((s, u) => s + (u.cost || 0), 0);
    const count = list.length;
    const peopleSet = new Set(list.map(u => u.memberPhone));
    const maxCost = list.reduce((m, u) => Math.max(m, u.cost || 0), 0);
    // by member: top 5
    const byMap = {};
    list.forEach(u => {
      const k = u.memberPhone || 'unknown';
      if (!byMap[k]) byMap[k] = { phone: k, role: u.role, total: 0, count: 0 };
      byMap[k].total += u.cost || 0;
      byMap[k].count += 1;
    });
    const byMember = Object.values(byMap).sort((a, b) => b.total - a.total);
    return { total, count, people: peopleSet.size, maxCost, byMember };
  }
  function openUsageDetail(payload) {
    State.usageDetailPayload = payload;
    State.usageDetailOpen = true;
    render();
  }
  function closeUsageDetail() {
    State.usageDetailOpen = false;
    State.usageDetailPayload = null;
    render();
  }
  function openUsageDistModal(pid) {
    State.usageDistModalOpen = true;
    State.usageDistModalPid = pid;
    render();
  }
  function closeUsageDistModal() {
    State.usageDistModalOpen = false;
    State.usageDistModalPid = null;
    render();
  }
  function openSparkAll(pid) {
    State.sparkAllOpen = true;
    State.sparkAllPid = pid;
    render();
  }
  function closeSparkAll() {
    State.sparkAllOpen = false;
    State.sparkAllPid = null;
    render();
  }
  function dayKey(ts) {
    const d = new Date(ts);
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }
  function dayShortLabel(ts) {
    const d = new Date(ts);
    return (d.getMonth() + 1) + '/' + d.getDate();
  }
  function dailyBuckets(logs, days) {
    // 返回最近 N 天（含今天，按时间升序排）
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const buckets = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      buckets.push({ when: d.getTime(), total: 0 });
    }
    const start = buckets[0].when;
    const end = today.getTime() + 86400000;
    logs.forEach(u => {
      if (!u.when || u.when < start || u.when >= end) return;
      const ud = new Date(u.when);
      ud.setHours(0, 0, 0, 0);
      const idx = Math.floor((ud.getTime() - start) / 86400000);
      if (idx >= 0 && idx < buckets.length) buckets[idx].total += (u.cost || 0);
    });
    return buckets;
  }
  function dailyBucketsAll(logs) {
    if (!logs || logs.length === 0) return [];
    const min = logs.reduce((m, u) => Math.min(m, u.when || Infinity), Infinity);
    if (!isFinite(min)) return [];
    const startDate = new Date(min);
    startDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Math.floor((today.getTime() - startDate.getTime()) / 86400000) + 1;
    return dailyBuckets(logs, days);
  }
  function resetUsagePage() {
    State.usagePageSize = 30;
  }

  // ---------- Budget helpers (账户/项目预算) ----------
  function getProjectBudget(pid) {
    const p = (D.projects || []).find(x => x.id === pid);
    return (p && p.budgetAllocated) || 0;
  }
  function projectSpent(pid) {
    return getProjectUsage(pid).reduce((s, u) => s + (u.cost || 0), 0);
  }
  function projectRemaining(pid) {
    return Math.max(0, getProjectBudget(pid) - projectSpent(pid));
  }
  function openBudgetEdit(pid) {
    State.budgetEditOpen = true;
    State.budgetEditPid = pid;
    State.budgetEditDraft = getProjectBudget(pid);
    render();
  }
  function closeBudgetEdit() {
    State.budgetEditOpen = false;
    State.budgetEditPid = null;
    State.budgetEditDraft = 0;
    render();
  }
  function commitBudgetEdit() {
    const pid = State.budgetEditPid;
    const project = (D.projects || []).find(p => p.id === pid);
    if (!project) { closeBudgetEdit(); return; }
    const newBudget = parseInt(State.budgetEditDraft, 10);
    if (isNaN(newBudget) || newBudget < 0) { showToast('请输入有效的预算金额'); return; }
    const oldBudget = getProjectBudget(pid);
    const delta = newBudget - oldBudget;
    if (!State.session) State.session = {};
    const balance = State.session.balance || 0;
    if (delta > balance) { showToast('账户余额不足，需充值 ' + formatCostShort(delta - balance) + ' 积分'); return; }
    const balBefore = balance;
    const balAfter = balance - delta;
    const budBefore = oldBudget;
    const budAfter = newBudget;
    project.budgetAllocated = newBudget;
    State.session.balance = balAfter;
    if (delta !== 0) {
      pushBudgetHistory(pid, delta, balBefore, balAfter, budBefore, budAfter);
      saveBudgetHistory();
    }
    saveProjects();
    saveAccount();
    closeBudgetEdit();
    if (delta > 0) showToast('已划拨 ' + formatCostShort(delta) + ' 积分');
    else if (delta < 0) showToast('已退回 ' + formatCostShort(-delta) + ' 积分');
    else showToast('预算未变更');
  }
  function openAccountPanel() {
    State.accountPanelOpen = true;
    render();
  }
  function closeAccountPanel() {
    State.accountPanelOpen = false;
    render();
  }
  function openRecharge() {
    State.rechargeOpen = true;
    State.rechargeDraft = 1000;
    render();
  }
  function closeRecharge() {
    State.rechargeOpen = false;
    render();
  }
  function commitRecharge() {
    const amt = parseInt(State.rechargeDraft, 10);
    if (isNaN(amt) || amt <= 0) { showToast('请输入有效金额'); return; }
    if (!State.session) State.session = {};
    State.session.balance = (State.session.balance || 0) + amt;
    State.session.totalRecharged = (State.session.totalRecharged || 0) + amt;
    if (!Array.isArray(State.session.rechargeHistory)) State.session.rechargeHistory = [];
    State.session.rechargeHistory.unshift({
      id: 'r-' + Date.now(),
      amount: amt,
      when: Date.now(),
    });
    saveAccount();
    closeRecharge();
    showToast('已充值 ' + formatCostShort(amt) + ' 积分');
  }

  // ---------- Project card helpers ----------
  function getProjectThumb(p) {
    const list = (D.assets || []).filter(a => a.projectId === p.id && a.kind !== 'doc');
    const starred = list.find(a => a.starred);
    return ((starred || list[0]) || {}).src || null;
  }
  function getProjectStats(p) {
    if (p.stats) return p.stats;
    const list = (D.assets || []).filter(a => a.projectId === p.id);
    return {
      videos: list.filter(a => a.kind === 'video').length,
      images: list.filter(a => a.kind === 'image').length,
      docs:   list.filter(a => a.kind === 'doc').length,
    };
  }
  function getProjectInitial(name) {
    const trimmed = (name || '').trim();
    if (!trimmed) return '?';
    return trimmed.charAt(0).toUpperCase();
  }
  // Pastel palette (300-series) — soft, low-saturation, pleasant on white cards
  const PROJECT_PALETTE = [
    '#fcd34d', // amber-300
    '#fdba74', // orange-300
    '#f9a8d4', // pink-300
    '#c4b5fd', // violet-300
    '#93c5fd', // blue-300
    '#6ee7b7', // emerald-300
    '#67e8f9', // cyan-300
    '#fde68a', // yellow-200 (额外暖色)
  ];
  function getProjectHashColor(name) {
    const s = String(name || '');
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    }
    return PROJECT_PALETTE[Math.abs(h) % PROJECT_PALETTE.length];
  }

  // ---------- Attach (composer file attach) helpers ----------
  function defaultPickerKindFor(toolKey) {
    if (toolKey === 'text') return 'doc';
    return 'image';
  }
  function openAttachMenu(anchorEl, toolKey) {
    if (anchorEl) {
      const r = anchorEl.getBoundingClientRect();
      State.attachMenuAnchor = {
        left: Math.round(r.left),
        bottom: Math.round(window.innerHeight - r.top + 6),
      };
    } else {
      State.attachMenuAnchor = null;
    }
    State.attachMenuOpen = true;
    State.attachMenuToolKey = toolKey || null;
    render();
  }
  function closeAttachMenu() {
    State.attachMenuOpen = false;
    State.attachMenuAnchor = null;
    render();
  }
  function openAssetPicker() {
    const tk = State.attachMenuToolKey || State.homeTab || 'image';
    State.assetPickerKind = defaultPickerKindFor(tk);
    State.assetPickerSelected = [];
    State.assetPickerOpen = true;
    State.attachMenuOpen = false;
    State.attachMenuAnchor = null;
    render();
  }
  function closeAssetPicker() {
    State.assetPickerOpen = false;
    State.assetPickerSelected = [];
    render();
  }
  function setAssetPickerKind(kind) {
    State.assetPickerKind = kind;
    render();
  }
  function toggleAssetPickerSelected(assetId) {
    const idx = State.assetPickerSelected.indexOf(assetId);
    if (idx >= 0) State.assetPickerSelected.splice(idx, 1);
    else State.assetPickerSelected.push(assetId);
    render();
  }
  function commitAssetPicker() {
    const ids = State.assetPickerSelected.slice();
    if (ids.length === 0) { closeAssetPicker(); return; }
    const all = D.assets || [];
    // v3: 数量上限拦截（composedRefs 总数 ≤ ATTACH_MAX_COUNT）
    const remaining = Math.max(0, ATTACH_MAX_COUNT - State.composedRefs.length);
    if (remaining === 0) {
      showToast('附件已达上限 ' + ATTACH_MAX_COUNT + ' 个，请先移除部分');
      return;
    }
    let added = 0;
    let skippedByLimit = 0;
    let skippedByDup = 0;
    ids.forEach(id => {
      const a = all.find(x => x.id === id);
      if (!a) return;
      if (State.composedRefs.some(r => r.sourceAssetId === a.id)) {
        skippedByDup++;
        return;
      }
      if (added >= remaining) {
        skippedByLimit++;
        return;
      }
      State.composedRefs.push({
        id: 'ref-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
        type: a.kind === 'doc' ? 'doc' : a.kind,
        name: a.title || (a.kind === 'doc' ? '文档' : (a.kind === 'video' ? '视频' : '图片')) + ' #' + a.id,
        src: a.src || null,
        sourceAssetId: a.id,
      });
      added++;
    });
    closeAssetPicker();
    if (skippedByLimit > 0) {
      showToast('已添加 ' + added + ' 项；超出 ' + skippedByLimit + ' 项未添加（上限 ' + ATTACH_MAX_COUNT + '）');
    } else if (added > 0) {
      showToast('已添加 ' + added + ' 项引用');
    }
  }
  function openUploadModal() {
    State.uploadDraftFiles = [];
    State.uploadDraftSaveToAssets = false;
    State.uploadModalOpen = true;
    State.attachMenuOpen = false;
    State.attachMenuAnchor = null;
    render();
  }
  function closeUploadModal() {
    State.uploadModalOpen = false;
    State.uploadDraftFiles = [];
    State.uploadDraftSaveToAssets = false;
    render();
  }
  function inferFileType(file) {
    if (file.type && file.type.startsWith('image/')) return 'image';
    if (file.type && file.type.startsWith('video/')) return 'video';
    return 'doc';
  }
  function pickUploadFiles(fileList) {
    if (!fileList || fileList.length === 0) return;
    // v3: 数量上限：composedRefs 已有数 + 当前 draft + 新选 ≤ MAX
    const used = State.composedRefs.length + State.uploadDraftFiles.length;
    const remaining = Math.max(0, ATTACH_MAX_COUNT - used);
    if (remaining === 0) {
      showToast('附件已达上限 ' + ATTACH_MAX_COUNT + ' 个');
      return;
    }
    const incoming = Array.from(fileList);
    const accepted = incoming.slice(0, remaining);
    const skipped = incoming.length - accepted.length;
    accepted.forEach(file => {
      const draftId = 'up-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
      const draft = {
        id: draftId,
        name: file.name,
        type: inferFileType(file),
        size: file.size,
        src: null,
      };
      State.uploadDraftFiles.push(draft);
      // Async preview for images
      if (draft.type === 'image') {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const found = State.uploadDraftFiles.find(d => d.id === draftId);
          if (found) {
            found.src = ev.target.result;
            render();
          }
        };
        reader.onerror = () => {
          showToast('「' + file.name + '」预览读取失败');
          const idx = State.uploadDraftFiles.findIndex(d => d.id === draftId);
          if (idx >= 0) State.uploadDraftFiles.splice(idx, 1);
          render();
        };
        try {
          reader.readAsDataURL(file);
        } catch (e) {
          showToast('「' + file.name + '」读取失败');
          const idx = State.uploadDraftFiles.findIndex(d => d.id === draftId);
          if (idx >= 0) State.uploadDraftFiles.splice(idx, 1);
        }
      }
    });
    if (skipped > 0) {
      showToast('最多 ' + ATTACH_MAX_COUNT + ' 个附件，超出 ' + skipped + ' 个未添加');
    }
    render();
  }
  function removeUploadDraft(id, e) {
    if (e) e.stopPropagation();
    const idx = State.uploadDraftFiles.findIndex(d => d.id === id);
    if (idx >= 0) State.uploadDraftFiles.splice(idx, 1);
    render();
  }
  function commitUpload() {
    const drafts = State.uploadDraftFiles.slice();
    if (drafts.length === 0) { showToast('请先选择文件'); return; }
    const today = new Date();
    const dateLabel = (today.getMonth() + 1) + ' 月 ' + today.getDate() + ' 日';
    let savedCount = 0;
    drafts.forEach(f => {
      let savedAssetId = null;
      if (State.uploadDraftSaveToAssets) {
        savedAssetId = 'a-up-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5);
        const newAsset = {
          id: savedAssetId,
          kind: f.type,
          projectId: State.projectId,
          sessionId: null,
          tool: f.type === 'doc' ? 'text' : f.type,
          source: 'tool',
          tag: '#上传',
          date: dateLabel,
          duration: null,
          aspect: '9:16',
          starred: false,
          seed: savedAssetId,
          src: f.src || null,
          title: f.type === 'doc' ? f.name : null,
          desc: f.type === 'doc' ? '上传文档' : null,
        };
        (D.assets || (D.assets = [])).push(newAsset);
        savedCount++;
      }
      State.composedRefs.push({
        id: 'ref-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5),
        type: f.type,
        name: f.name,
        src: f.src || null,
        isUpload: true,
        savedToAssets: !!State.uploadDraftSaveToAssets,
        sourceAssetId: savedAssetId,
      });
    });
    closeUploadModal();
    if (savedCount > 0) {
      showToast('已保存 ' + savedCount + ' 个文件到项目资产');
    } else {
      showToast('已添加 ' + drafts.length + ' 个附件');
    }
  }
  function removeComposedRef(refId, e) {
    if (e) e.stopPropagation();
    const idx = State.composedRefs.findIndex(r => r.id === refId);
    if (idx >= 0) State.composedRefs.splice(idx, 1);
    render();
  }

  // Close popovers on outside click
  document.addEventListener('click', (e) => {
    if (State.assetSourceOpen) {
      if (!e.target.closest('.a-chip-all') && !e.target.closest('.asset-source-pop')) {
        State.assetSourceOpen = false;
        render();
        return;
      }
    }
    if (State.examplePopOpen) {
      if (!e.target.closest('.example-pop') && !e.target.closest('.ex-chip')) {
        State.examplePopOpen = false;
        render();
      }
    }
    if (State.skillPopOpen) {
      if (!e.target.closest('.skill-pop') && !e.target.closest('.pill[data-role="skill-pill"]')) {
        State.skillPopOpen = false;
        State.skillPopAnchor = null;
        render();
      }
    }
    if (State.attachMenuOpen) {
      if (!e.target.closest('.attach-menu') && !e.target.closest('.attach-card[data-role="add"]')) {
        closeAttachMenu();
      }
    }
    if (State.userMenuOpen) {
      if (!e.target.closest('.user-menu') && !e.target.closest('.user-circle')) {
        closeUserMenu();
      }
    }
    if (State.tagPickerOpen) {
      if (!e.target.closest('.tag-picker-pop') && !e.target.closest('.doc-act-btn[data-act="tag"]') && !e.target.closest('.doc-tile-act-btn[data-act="tag"]') && !e.target.closest('[data-act="batch-tag"]')) {
        closeTagPicker();
      }
    }
    if (State.filterPopOpen) {
      if (!e.target.closest('.filter-pop') && !e.target.closest('[data-act="filter"]')) {
        closeFilterPop();
      }
    }
  });
  // ESC closes modals / popovers (priority order)
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (State.filterPopOpen) { closeFilterPop(); return; }
    if (State.tagPickerOpen) {
      if (State.tagPickerCreating) { cancelInlineCreateTag(); return; }
      closeTagPicker();
      return;
    }
    if (State.sessionEditingId) { cancelEditSession(); return; }
    if (State.sessionPendingDeleteId) { cancelDeleteSession(); return; }
    if (State.selectionMode) { exitSelectionMode(); return; }
    if (State.userMenuOpen) { closeUserMenu(); return; }
    if (State.createProjectModalOpen) { closeCreateProject(); return; }
    if (State.uploadModalOpen) { closeUploadModal(); return; }
    if (State.assetPickerOpen) { closeAssetPicker(); return; }
    if (State.attachMenuOpen) { closeAttachMenu(); return; }
    if (State.assetDetailOpen) { closeAssetDetail(); return; }
    if (State.tplDetailOpen) { closeTplDetail(); return; }
    if (State.favCollectOpen) { closeFavCollect(); return; }
    if (State.tplModalOpen) { closeTplModal(); return; }
    if (State.examplePopOpen) { closeExamplePop(); return; }
    if (State.skillPopOpen) { closeSkillPop(); return; }
    if (State.tagsModalOpen) { closeTagsModal(); return; }
  });

  function toggleMidPanel() {
    State.midCollapsed = !State.midCollapsed;
    localStorage.setItem('vb-mid-collapsed', State.midCollapsed ? '1' : '0');
    render();
  }

  // SVG icons used across the app
  const ICO = {
    panelToggle: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3.5" width="12" height="9" rx="2"/><line x1="9.5" y1="3.5" x2="9.5" y2="12.5"/></svg>',
    newChat: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M11 2.5h-7a1.5 1.5 0 0 0-1.5 1.5v8a1.5 1.5 0 0 0 1.5 1.5h8a1.5 1.5 0 0 0 1.5-1.5v-4"/><path d="M12.2 2.2l1.6 1.6-5.4 5.4H7v-1.4z"/></svg>',
    expand: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4l4 4-4 4"/></svg>',
    grid: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></svg>',
    feed: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="4" x2="13" y2="4"/><line x1="3" y1="8" x2="13" y2="8"/><line x1="3" y1="12" x2="13" y2="12"/></svg>',
    star: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1.5l1.9 4 4.4.6-3.2 3 .8 4.4L8 11.5l-3.9 2 .8-4.4-3.2-3 4.4-.6z"/></svg>',
    download: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v9"/><path d="M4 7l4 4 4-4"/><path d="M2 14h12"/></svg>',
    paperclip: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M11.5 4.5L6 10a2 2 0 0 0 2.83 2.83l5.17-5.17a3.5 3.5 0 1 0-4.95-4.95L4 7.17a5 5 0 0 0 7.07 7.07l3.43-3.43"/></svg>',
    docFile: '<svg viewBox="0 0 24 28" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 2h10l5 5v19H5z" fill="rgba(0,0,0,0.02)"/><path d="M15 2v5h5"/><line x1="9" y1="14" x2="16" y2="14"/><line x1="9" y1="18" x2="16" y2="18"/><line x1="9" y1="22" x2="13" y2="22"/></svg>',
    saveFolder: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4.5h4.5L8 6h6V13.5H2z"/><path d="M8 9v3.5"/><path d="M6.5 11l1.5 1.5L9.5 11"/></svg>',
    info: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6"/><line x1="8" y1="11" x2="8" y2="7.5"/><circle cx="8" cy="5.2" r="0.6" fill="currentColor"/></svg>',
    play: '<svg viewBox="0 0 16 16" fill="currentColor"><path d="M5 3.5v9l8-4.5z"/></svg>',
    edit3: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3l4 4-7.5 7.5H1.5V10L9 3z"/><path d="M9 3l4 4"/></svg>',
    refresh: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2v4h-4"/><path d="M2 14v-4h4"/><path d="M13 6a5 5 0 0 0-9-1.5L2 6"/><path d="M3 10a5 5 0 0 0 9 1.5L14 10"/></svg>',
    upload: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 11V2"/><path d="M4 6l4-4 4 4"/><path d="M2 13.5h12"/></svg>',
    filter: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3.5h12"/><path d="M4 8h8"/><path d="M6.5 12.5h3"/></svg>',
    infinity: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8c0-1.5 1-2.5 2.5-2.5S10.5 7 11 8s1 2.5 2.5 2.5S15.5 9.5 15.5 8 14.5 5.5 13 5.5 11 7 10.5 8s-1 2.5-2.5 2.5S5 9.5 5 8z" transform="translate(-2 0)"/></svg>',
    lock: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5 7V5a3 3 0 0 1 6 0v2"/></svg>',
    refreshCw: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4v4h-4"/><path d="M2 12V8h4"/><path d="M3 6a5 5 0 0 1 8.5-2L14 6"/><path d="M13 10a5 5 0 0 1-8.5 2L2 10"/></svg>',
    users: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="2.2"/><path d="M2 13.5c0-2.2 1.8-4 4-4s4 1.8 4 4"/><circle cx="11" cy="5.5" r="1.7"/><path d="M10.5 9.5c1.8 0 3.5 1.3 3.5 4"/></svg>',
    activity: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="1.5,9 4,9 6,4 9,12 11,7 14.5,7"/></svg>',
    sparkles: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 1.5l1.4 3.7L13 6.5l-3.6 1.3L8 11.5l-1.4-3.7L3 6.5l3.6-1.3z" fill="currentColor" stroke="none" opacity="0.9"/><path d="M12.5 11.5l.5 1.2 1.2.5-1.2.5-.5 1.2-.5-1.2-1.2-.5 1.2-.5z" fill="currentColor" stroke="none" opacity="0.7"/></svg>',
    chevronDown: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l4 4 4-4"/></svg>',
    chevronRight: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4l4 4-4 4"/></svg>',
    sun: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="3"/><line x1="8" y1="1.5" x2="8" y2="3"/><line x1="8" y1="13" x2="8" y2="14.5"/><line x1="1.5" y1="8" x2="3" y2="8"/><line x1="13" y1="8" x2="14.5" y2="8"/><line x1="3.4" y1="3.4" x2="4.5" y2="4.5"/><line x1="11.5" y1="11.5" x2="12.6" y2="12.6"/><line x1="3.4" y1="12.6" x2="4.5" y2="11.5"/><line x1="11.5" y1="4.5" x2="12.6" y2="3.4"/></svg>',
    moon: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 9.2A6 6 0 0 1 6.8 2.5 6 6 0 1 0 13.5 9.2z"/></svg>',
    plus: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="3" x2="8" y2="13"/><line x1="3" y1="8" x2="13" y2="8"/></svg>',
    diamond: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 1.5L14.5 6 8 14.5 1.5 6z"/><path d="M1.5 6h13"/><path d="M5.5 6L8 1.5l2.5 4.5"/></svg>',
    cpu: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="9" height="9" rx="1.5"/><rect x="6" y="6" width="4" height="4" rx="0.5"/><line x1="6" y1="1.5" x2="6" y2="3.5"/><line x1="10" y1="1.5" x2="10" y2="3.5"/><line x1="6" y1="12.5" x2="6" y2="14.5"/><line x1="10" y1="12.5" x2="10" y2="14.5"/><line x1="1.5" y1="6" x2="3.5" y2="6"/><line x1="1.5" y1="10" x2="3.5" y2="10"/><line x1="12.5" y1="6" x2="14.5" y2="6"/><line x1="12.5" y1="10" x2="14.5" y2="10"/></svg>',
    textTool: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="4" x2="13" y2="4"/><line x1="8" y1="4" x2="8" y2="13"/></svg>',
    imageTool: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="12" height="10" rx="1.5"/><circle cx="6" cy="7" r="1.2"/><path d="M14 11l-3.5-3.5L4 13"/></svg>',
    videoTool: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3.5" width="9" height="9" rx="1.5"/><path d="M11 6.5L14 4.5v7L11 9.5z"/></svg>',
    // Brand logos (simplified, single-color outlines, used in auth third-party row)
    wechat: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 4C4.6 4 1 7 1 10.7c0 2.1 1.2 4 3.1 5.2L3 18l2.6-1.4c.6.1 1.3.2 2 .3-.1-.5-.2-1-.2-1.6 0-3.4 3.1-6.2 7-6.2.4 0 .8 0 1.2.1C15.2 6.2 12.4 4 9 4zm-2.5 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm5 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm10 7c0-3.1-2.9-5.6-6.5-5.6S8.5 11.9 8.5 15s2.9 5.6 6.5 5.6c.7 0 1.4-.1 2.1-.3L19 21l-.7-1.7C20 18.5 21.5 16.9 21.5 15zm-9 0a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6zm5 0a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6z"/></svg>',
    feishu: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5.5 4.5h7.5c.6 0 1 .4 1 1V13c0 .6-.4 1-1 1H5.5c-.6 0-1-.4-1-1V5.5c0-.6.4-1 1-1zm9.5 4.6c.4-.3.9-.4 1.4-.2l3.5 1.7c.5.3.7.9.4 1.4l-2.4 4.5c-1.3 2.5-4.4 3.4-6.9 2.1L4 14.6V8.1l7 3.6c.7.3 1.5.3 2.1-.1l1.9-2.5z"/></svg>',
    dingtalk: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm5.6 9.2l-2.7 4.6c-.2.4-.6.5-.9.4l-1.4-.4c-.5-.1-.7-.7-.4-1.1l1.5-2.2H9.4c-.5 0-.9-.5-.7-1l1.4-3.4c.1-.3.4-.5.8-.5h5.7c.6 0 1 .6.7 1.1l-.6 1.1h.6c.6 0 1 .6.7 1.1z"/></svg>',
    tag: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 1.5H2.5V7.5L9 14l5.5-5.5z"/><circle cx="5.5" cy="4.5" r="0.9" fill="currentColor"/></svg>',
    pin: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><line x1="5.3" y1="2.5" x2="10.7" y2="2.5"/><path d="M6 2.5v4l-1.3 2.7v1.3h6.6v-1.3l-1.3-2.7v-4"/><line x1="8" y1="10.5" x2="8" y2="14"/></svg>',
    edit: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M11.5 2.5l2 2-8 8-3 1 1-3z"/><path d="M10 4l2 2"/></svg>',
    trash: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 4h11"/><path d="M6 4V2.5h4V4"/><path d="M3.5 4l.7 9.5h7.6L12.5 4"/><path d="M7 7v4M9 7v4"/></svg>',
    search: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="7" r="4.5"/><line x1="10.3" y1="10.3" x2="13.5" y2="13.5"/></svg>',
    checkbox: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="2.5" width="11" height="11" rx="2"/><path d="M5.5 8.2l2 2 3-4"/></svg>',
    canvas: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="12" height="12" rx="2"/><line x1="6" y1="2" x2="6" y2="14"/><line x1="2" y1="9" x2="14" y2="9"/></svg>',
    archive: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="12" height="3" rx="0.5"/><path d="M3 6v7.5h10V6"/><line x1="6.5" y1="9" x2="9.5" y2="9"/></svg>',
  };

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', State.theme);
    localStorage.setItem('vb-theme', State.theme);
    document.querySelectorAll('.theme-toggle button').forEach(b => {
      b.classList.toggle('on', b.dataset.theme === State.theme);
    });
  }
  function setTheme(v) { State.theme = v; applyTheme(); }
  function setProject(id) {
    State.projectId = id;
    localStorage.setItem('vb-project', id);
    State.activeSession = {
      image: (D.defaultSessions[id] || {}).image,
      video: (D.defaultSessions[id] || {}).video,
      text: (D.defaultSessions[id] || {}).text,
    };
    // Reset cross-project state to avoid leakage
    if (typeof clearFilter === 'function') clearFilter();
    if (State.composedRefs) State.composedRefs = [];
    if (State.composedExamples) State.composedExamples = [];
    if (State.selectedAssetIds) State.selectedAssetIds = [];
    State.selectionMode = false;
    // Usage 列表分页 & 筛选切项目时也重置（一期决策：保持顺手）
    if (typeof resetUsagePage === 'function') resetUsagePage();
    State.memberPendingDelete = null;
    render();
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
    if (tag === 'img') {
      el.addEventListener('error', () => {
        el.classList.add('img-broken');
        el.removeAttribute('src');
      });
    }
    return el;
  }
  function $(s, root = document) { return root.querySelector(s); }
  function currentProject() {
    return D.projects.find(p => p.id === State.projectId) || D.projects[0];
  }

  // ---------- Toast (lightweight, no deps) ----------
  let _toastTimer = null;
  function showToast(msg, opts) {
    const dur = (opts && opts.duration) || 1800;
    let el = document.querySelector('.vb-toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'vb-toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    if (_toastTimer) clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => { el.classList.remove('show'); }, dur);
  }

  // ---------- Auth (demo, localStorage-only, no real backend) ----------
  const AUTH_KEY = 'vb-user-session';
  function loadSession() {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function saveSession(s) {
    if (!s) return;
    localStorage.setItem(AUTH_KEY, JSON.stringify(s));
  }
  function clearSession() {
    localStorage.removeItem(AUTH_KEY);
  }
  function isLoggedIn() { return !!State.session; }
  function setSession(payload) {
    State.session = Object.assign({}, payload, { loggedAt: Date.now() });
    saveSession(State.session);
  }
  function logout() {
    clearSession();
    State.session = null;
    State.userMenuOpen = false;
    State.userMenuAnchor = null;
    showToast('已退出登录');
    location.hash = '#/login';
    render();
  }
  // Phone mask helper for display
  function maskPhone(phone) {
    if (!phone) return '';
    const s = String(phone);
    if (s.length < 7) return s;
    return s.slice(0, 3) + '****' + s.slice(-4);
  }
  function isValidPhone(p) { return /^1\d{10}$/.test(String(p || '').trim()); }

  // OTP countdown
  let _codeTimer = null;
  function startCodeCountdown() {
    State.authCodeCountdown = 60;
    if (_codeTimer) clearInterval(_codeTimer);
    _codeTimer = setInterval(() => {
      State.authCodeCountdown -= 1;
      if (State.authCodeCountdown <= 0) {
        State.authCodeCountdown = 0;
        clearInterval(_codeTimer);
        _codeTimer = null;
      }
      render();
    }, 1000);
  }
  function requestAuthCode() {
    const phone = (State.authPhoneDraft || '').trim();
    if (!isValidPhone(phone)) { showToast('请输入正确的手机号'); return; }
    if (State.authCodeCountdown > 0) return; // already counting
    showToast('验证码：1234');
    startCodeCountdown();
  }
  function commitAuthLogin() {
    const phone = (State.authPhoneDraft || '').trim();
    const code = (State.authCodeDraft || '').trim();
    if (!isValidPhone(phone)) { showToast('请输入正确的手机号'); return; }
    if (code !== '1234') { showToast('验证码错误（demo: 1234）'); return; }
    if (!State.authAgreementChecked) { showToast('请先同意服务条款'); return; }
    setSession({ phone, via: 'phone' });
    State.authPhoneDraft = '';
    State.authCodeDraft = '';
    State.authAgreementChecked = false;
    State.authCodeCountdown = 0;
    if (_codeTimer) { clearInterval(_codeTimer); _codeTimer = null; }
    showToast('登录成功');
    location.hash = '#/';
  }
  function commitAuthThirdParty(via) {
    const labelMap = { wechat: '微信用户', feishu: '飞书用户', dingtalk: '钉钉用户' };
    setSession({ phone: labelMap[via] || via, via });
    showToast('demo：模拟登录成功');
    location.hash = '#/';
  }

  // User menu
  function openUserMenu(anchorEl) {
    if (anchorEl) {
      const r = anchorEl.getBoundingClientRect();
      State.userMenuAnchor = {
        right: Math.round(window.innerWidth - r.right),
        top: Math.round(r.bottom + 8),
      };
    } else {
      State.userMenuAnchor = null;
    }
    State.userMenuOpen = true;
    render();
  }
  function closeUserMenu() {
    State.userMenuOpen = false;
    State.userMenuAnchor = null;
    render();
  }
  function toggleUserMenu(e) {
    e.stopPropagation();
    if (State.userMenuOpen) closeUserMenu();
    else openUserMenu(e.currentTarget);
  }

  // Initialize session on boot
  State.session = loadSession();
  loadAccountOverlay();
  ensureAccountSeed();
  loadBudgetHistoryOverlay();

  // ---------- Topbar (home only) ----------
  function topbar() {
    return h('header', { class: 'topbar' },
      h('a', { class: 'brand', href: '#/' },
        h('span', { class: 'logo-mark' }, 'F'),
        h('span', { class: 'name' }, 'fuyao'),
        h('span', { class: 'sub' }, '· AI 创作平台'),
      ),
      h('div', { class: 'topbar-right' },
        themeToggleEl(),
        creditPillEl(),
        userCircleEl(),
      ),
    );
  }

  function themeToggleEl() {
    return h('div', { class: 'theme-toggle' },
      h('button', { 'data-theme': 'light', onClick: () => setTheme('light'), title: 'Light', html: ICO.sun }),
      h('button', { 'data-theme': 'dark',  onClick: () => setTheme('dark'),  title: 'Dark',  html: ICO.moon }),
    );
  }
  function creditPillEl() {
    const balance = (State.session && State.session.balance) || 0;
    return h('span', {
      class: 'credit-pill clickable',
      onClick: () => { location.hash = '#/account'; },
      title: '点击查看账户',
    },
      h('span', { class: 'bolt', html: '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 1L2.5 8.2h3.8L6 13l5.5-7.2H7.7L8 1z" fill="currentColor" stroke="none"/></svg>' }),
      h('span', { class: 'mono', style: { fontWeight: '600' } }, formatCostShort(balance)),
      h('span', { class: 'sep' }),
      h('a', { class: 'upgrade', href: '#/upgrade', onClick: (e) => e.stopPropagation() }, '升级'),
    );
  }
  function userCircleEl() {
    const phone = (State.session && State.session.phone) || '';
    // Initial: first character (English/digit/Chinese all OK)
    let initial = 'U';
    if (phone) {
      const ch = phone.charAt(0);
      // For phone numbers, use last 2 digits looks weird; use 'U' or first char
      initial = /\d/.test(ch) ? phone.charAt(phone.length - 1) : ch;
    }
    return h('span', {
      class: 'user-circle' + (State.userMenuOpen ? ' open' : ''),
      title: '账户菜单',
      onClick: toggleUserMenu,
    }, initial.toUpperCase());
  }

  function userMenu() {
    if (!State.userMenuOpen) return null;
    const phone = (State.session && State.session.phone) || '';
    const isPhone = /^1\d{10}$/.test(phone);
    const display = isPhone ? maskPhone(phone) : phone;
    const anchor = State.userMenuAnchor;
    const style = anchor
      ? { right: anchor.right + 'px', top: anchor.top + 'px' }
      : null;
    return h('div', { class: 'user-menu', style: style },
      h('div', { class: 'user-menu-head' },
        h('span', { class: 'user-menu-name' }, display || '账户'),
        h('span', { class: 'user-menu-meta' }, isPhone ? '手机号登录' : (State.session && State.session.via ? '第三方登录' : '')),
      ),
      h('div', { class: 'user-menu-divider' }),
      h('div', { class: 'user-menu-item', onClick: () => { closeUserMenu(); showToast('账号信息 · 即将推出'); } },
        h('span', null, '账号信息'),
      ),
      h('div', { class: 'user-menu-item', onClick: () => { closeUserMenu(); showToast('设置 · 即将推出'); } },
        h('span', null, '设置'),
      ),
      h('div', { class: 'user-menu-divider' }),
      h('div', { class: 'user-menu-item danger', onClick: () => { closeUserMenu(); logout(); } },
        h('span', null, '退出登录'),
      ),
    );
  }

  // ---------- Sidenav (within tool / canvas / assets shells) ----------
  function sidenav(activeKey) {
    const proj = currentProject();
    const items = [
      { key: 'text',   label: '文本创作', svg: ICO.textTool },
      { key: 'image',  label: '图片创作', svg: ICO.imageTool },
      { key: 'video',  label: '视频创作', svg: ICO.videoTool },
    ];
    return h('aside', { class: 'sidenav' },
      h('div', { class: 'sidenav-top' },
        h('a', { class: 'home-btn', href: '#/', title: '回到 fuyao 首页' }, 'F'),
        h('div', { class: 'proj-pick', onClick: pickProject },
          h('span', null, proj.name),
          h('span', { class: 'caret', html: ICO.chevronDown }),
        ),
      ),
      h('div', { class: 'sidenav-body' },
        h('div', { class: 'nav-group' },
          h('div', { class: 'label' }, '创作工具'),
          ...items.map(t => h('a',
            { href: '#/' + t.key, class: 'nav-item' + (activeKey === t.key ? ' active' : '') },
            h('span', { class: 'ico', html: t.svg }), t.label,
          )),
        ),
        h('div', { class: 'nav-group' },
          h('div', { class: 'label' }, '创作画布'),
          h('a', { href: '#/canvas', class: 'nav-item' + (activeKey === 'canvas' ? ' active' : '') },
            h('span', { class: 'ico', html: ICO.canvas }), '智能画布',
          ),
        ),
        h('div', { class: 'nav-group' },
          h('div', { class: 'label' }, '资产管理'),
          h('a', { href: '#/assets', class: 'nav-item' + (activeKey === 'assets' ? ' active' : '') },
            h('span', { class: 'ico', html: ICO.archive }), '项目资产',
          ),
        ),
        h('div', { class: 'nav-group' },
          h('div', { class: 'label' }, '技能模版'),
          h('a', { href: '#/prompts', class: 'nav-item' + (activeKey === 'prompts' ? ' active' : '') },
            h('span', { class: 'ico', html: ICO.star }), '提示词库',
          ),
          h('a', { href: '#/skills', class: 'nav-item' + (activeKey === 'skills' ? ' active' : '') },
            h('span', { class: 'ico', html: ICO.sparkles }), '技能库',
          ),
        ),
        h('div', { class: 'nav-group' },
          h('div', { class: 'label' }, '项目管理'),
          h('a', { href: '#/members', class: 'nav-item' + (activeKey === 'members' ? ' active' : '') },
            h('span', { class: 'ico', html: ICO.users }), '项目成员',
          ),
          h('a', { href: '#/usage', class: 'nav-item' + (activeKey === 'usage' ? ' active' : '') },
            h('span', { class: 'ico', html: ICO.activity }), '积分明细',
          ),
        ),
      ),
      h('div', { class: 'sidenav-foot' },
        themeToggleEl(),
        creditPillEl(),
        userCircleEl(),
      ),
    );
  }

  function pickProject() {
    const idx = D.projects.findIndex(p => p.id === State.projectId);
    const next = D.projects[(idx + 1) % D.projects.length];
    setProject(next.id);
  }

  // ---------- Composer (legacy .input-card layout) ----------
  // Structure: .input-card > .attach-wrap (optional) + textarea + .controls-row > pills + send-btn
  function composer(toolKey, opts) {
    opts = opts || {};
    const modelList = D.models[toolKey] || D.models.video;
    const isText = toolKey === 'text';
    const placeholder = opts.placeholder || (isText
      ? '描述你想要的剧情、桥段或对话节奏。例如：基于剧本 V2 重新拆解第 1 集分镜，强调"专业感"细节。'
      : '上传 1–3 个文档素材，输入文字描述你的需求。例如：上传剧本后选择技能进行处理。');

    // Attach area: render filled cards from State.composedRefs + an add-card at the tail
    const showAttach = opts.showAttach !== false;
    const refs = State.composedRefs || [];
    function refTypeIcon(type) {
      if (type === 'video') return ICO.feed;
      if (type === 'doc')   return ICO.docFile;
      return ICO.paperclip;
    }
    const attachWrap = showAttach && h('div', { class: 'attach-wrap' },
      h('div', { class: 'attach-area' },
        ...refs.map(r => h('div', { class: 'attach-card filled', title: r.name },
          r.src
            ? h('img', { src: r.src, alt: r.name })
            : h('div', { class: 'placeholder-grad', style: { background: 'var(--preview-grad)' } }),
          !r.src && h('span', {
            class: 'attach-type-ico',
            html: refTypeIcon(r.type),
          }),
          h('button', {
            class: 'attach-rm',
            title: '移除',
            onClick: (e) => removeComposedRef(r.id, e),
          }, '✕'),
        )),
        h('div', {
          class: 'attach-card',
          'data-role': 'add',
          onClick: (e) => {
            e.stopPropagation();
            if (State.attachMenuOpen) closeAttachMenu();
            else openAttachMenu(e.currentTarget, toolKey);
          },
        },
          h('span', { class: 'ico-inline', html: ICO.paperclip }),
          h('span', { class: 'lbl' }, '添加'),
        ),
      ),
    );

    // Dynamic skill label for text composer (reads from current skill object)
    const cs = currentSkillObj();
    const skillLabel = cs ? cs.name : '分镜脚本';

    const isVisual = !isText;

    // Workbench row: 仅图片/视频 composer 显示「+ 引用提示词」chip（点击后弹 picker，
    // 在 picker 内单选并通过「使用」/「AI 提升」直接作用于 textarea，无持续状态）
    const workbench = isVisual && h('div', { class: 'composer-workbench' },
      h('span', { class: 'wb-spacer' }),
      h('span', {
        class: 'wb-chip wb-example clickable',
        onClick: (e) => {
          e.stopPropagation();
          if (State.examplePopOpen) closeExamplePop();
          else openExamplePop(e.currentTarget);
        },
      },
        h('span', { class: 'wb-chip-label' }, '+ 引用提示词'),
      ),
    );

    return h('div', { class: 'input-card' },
      attachWrap,
      h('textarea', { class: 'prompt-area', rows: 4, placeholder, maxlength: 2000 }),
      workbench,
      h('div', { class: 'controls-row' },
        // Model pill
        h('span', { class: 'pill' }, h('span', { class: 'pill-ico', html: ICO.cpu }), modelList[0], h('span', { class: 'caret', html: ICO.chevronDown })),
        // Reference mode (image/video only)
        !isText && h('span', { class: 'pill' }, h('span', { class: 'pill-ico', html: ICO.imageTool }), '全能参考', h('span', { class: 'caret', html: ICO.chevronDown })),
        // Ratio + Resolution (image/video only)
        !isText && h('span', { class: 'pill' }, h('span', { class: 'pill-ico', html: ICO.grid }), '16:9 · 720P', h('span', { class: 'caret', html: ICO.chevronDown })),
        // Duration (video only)
        toolKey === 'video' && h('span', { class: 'pill' }, h('span', { class: 'pill-ico', html: ICO.refresh }), '5s', h('span', { class: 'caret', html: ICO.chevronDown })),
        // Skill (text only) — label is dynamic, click to toggle attached popover
        isText && h('span', {
          class: 'pill clickable' + (State.skillPopOpen ? ' open' : ''),
          'data-role': 'skill-pill',
          onClick: toggleSkillPop,
        },
          h('span', { class: 'pill-ico', html: ICO.sparkles }),
          skillLabel,
          h('span', { class: 'caret', html: ICO.chevronDown }),
        ),
        h('span', { class: 'spacer' }),
        // Balance indicator (inline, dim)
        h('span', { class: 'balance-indicator' }, h('span', { class: 'pill-ico', html: ICO.diamond }), '10'),
        // Send button — 当前项目可用积分耗尽时禁用 + 提示
        (function () {
          const pid = State.projectId;
          const budget = getProjectBudget(pid);
          const spent = projectSpent(pid);
          const blocked = budget > 0 && spent >= budget;
          return h('button', {
            class: 'send-btn' + (blocked ? ' disabled' : ''),
            title: blocked ? '项目可用积分不足，请联系管理员补充' : '发送',
            onClick: blocked ? (e) => { e.preventDefault(); showToast('项目可用积分不足，请联系管理员补充'); } : null,
            html: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="13" x2="8" y2="3"/><polyline points="3,8 8,3 13,8"/></svg>',
          });
        })(),
      ),
    );
  }

  // ---------- Home View ----------
  // Reusable project card (used by home + viewProjects)
  function projCard(p) {
    const thumb = getProjectThumb(p);
    const stats = getProjectStats(p);
    return h('div', {
      class: 'proj-card',
      onClick: () => { setProject(p.id); location.hash = '#/assets'; },
    },
      h('div', {
        class: 'proj-card-thumb' + (thumb ? '' : ' empty'),
      },
        thumb
          ? h('img', { src: thumb, alt: '', loading: 'lazy' })
          : h('span', { class: 'proj-card-thumb-letter' }, getProjectInitial(p.name)),
      ),
      h('div', { class: 'proj-card-info' },
        h('div', { class: 'name' }, p.name),
        h('div', { class: 'desc' }, '更新于 ', p.updatedAt),
      ),
      h('div', { class: 'proj-card-stats' },
        h('span', null, String(stats.videos || 0), ' 视频'),
        h('span', { class: 'sep' }, '·'),
        h('span', null, String(stats.images || 0), ' 图片'),
        h('span', { class: 'sep' }, '·'),
        h('span', null, String(stats.docs || 0), ' 文档'),
      ),
    );
  }
  function projCreateCard() {
    return h('div', { class: 'proj-card create', onClick: openCreateProject },
      h('div', { class: 'proj-create-inner' },
        h('div', { class: 'proj-create-plus', html: ICO.plus }),
        h('div', { class: 'proj-create-text' },
          h('div', { class: 'name' }, '创建项目'),
          h('div', { class: 'desc' }, '空白起步'),
        ),
      ),
    );
  }

  function viewHome() {
    const tabs = [
      { key: 'text',  label: '文本创作', ico: ICO.textTool },
      { key: 'image', label: '图片创作', ico: ICO.imageTool },
      { key: 'video', label: '视频创作', ico: ICO.videoTool },
    ];
    // Home shows: create card + first 3 projects (4-col grid)
    const featured = (D.projects || []).slice(0, 3);
    return h('div', { class: 'home' },
      h('div', { class: 'creation-zone' },
        h('div', { class: 'tab-row' },
          ...tabs.map(t => h('span', {
            class: 'tab' + (State.homeTab === t.key ? ' on' : ''),
            onClick: () => { State.homeTab = t.key; render(); },
          },
            h('span', { class: 'tab-ico', html: t.ico }),
            h('span', null, t.label),
          )),
        ),
        composer(State.homeTab),
      ),
      h('section', null,
        h('div', { class: 'section-head' },
          h('h3', null, '项目管理'),
          h('a', { href: '#/projects', class: 'all-projects-link' },
            h('span', null, '全部项目'),
            h('span', { class: 'ico-inline', html: ICO.chevronRight }),
          ),
        ),
        h('div', { class: 'proj-row' },
          projCreateCard(),
          ...featured.map(projCard),
        ),
      ),
    );
  }

  // ---------- Projects List View ----------
  function viewMembers() {
    // 两栏：sidenav | 内容；当前项目跟随 sidenav 顶部 picker（State.projectId）
    const project = currentProject();
    return h('div', { class: 'shell members-page two-col', style: { gridTemplateColumns: '228px 1fr', display: 'grid', height: '100vh' } },
      sidenav('members'),
      h('div', { class: 'members-panel' },
        project ? membersPanel(project) : h('div', { class: 'empty-state empty-grid' },
          h('div', { class: 'empty-title' }, '请先选择项目'),
        ),
      ),
    );
  }

  function membersPanel(project) {
    const members = getProjectMembers(project.id);
    const ownerPhone = project.ownerPhone || (State.session && State.session.phone) || '';

    return h('div', { class: 'members-panel-inner' },
      h('div', { class: 'members-panel-head' },
        h('div', null,
          h('h2', null, project.name),
          h('div', { class: 'subtle', style: { fontSize: '12px', marginTop: '4px' } },
            '共 ' + (members.length + 1) + ' 名成员 · 创建于 ' + (project.updatedAt || ''),
          ),
        ),
        h('button', {
          class: 'btn primary sm',
          onClick: () => openMemberInvite(project.id),
        },
          h('span', { class: 'ico-inline', html: ICO.plus }),
          h('span', null, ' 邀请成员'),
        ),
      ),
      h('div', { class: 'members-rows' },
        // Owner 行（不在 D.projectMembers 里）
        memberRow({
          id: '__owner__',
          phone: ownerPhone,
          role: 'owner',
          quotaType: 'unlimited',
          used: 0,
        }, project.id, true),
        // Member 行
        ...members.map(m => memberRow(m, project.id, false)),
      ),
    );
  }

  function memberRow(m, pid, isOwner) {
    const phone = m.phone || '';
    const masked = phone ? maskPhone(phone) : '匿名';
    const avatar = phone ? phone.slice(-1) : '·';
    const sumLabel = isOwner ? '无限' : quotaSummary(m);
    const prog = isOwner ? null : quotaProgress(m);
    const pendingDel = State.memberPendingDelete
      && State.memberPendingDelete.pid === pid
      && State.memberPendingDelete.mid === m.id;

    return h('div', { class: 'member-row' + (pendingDel ? ' pending-del' : '') },
      h('span', { class: 'member-avatar' }, avatar),
      h('div', { class: 'member-info' },
        h('div', { class: 'member-info-line1' },
          h('span', { class: 'member-name' }, masked),
          h('span', { class: 'member-role' + (isOwner ? ' owner' : '') }, isOwner ? '管理员' : '成员'),
        ),
        h('div', { class: 'member-info-line2' }, sumLabel,
          prog && prog.total > 0 ? h('span', { class: 'member-progress-text' },
            ' · 已用 ' + prog.used + ' / ' + prog.total,
          ) : null,
        ),
        prog && prog.total > 0 ? h('div', { class: 'member-progress' },
          h('div', { class: 'member-progress-fill', style: { width: Math.min(100, Math.round(prog.used / prog.total * 100)) + '%' } }),
        ) : null,
      ),
      !isOwner && h('div', { class: 'member-actions' },
        h('button', {
          class: 'member-act',
          onClick: () => openMemberEdit(pid, m.id),
          title: '设置额度',
        }, '设置'),
        h('button', {
          class: 'member-act danger' + (pendingDel ? ' confirming' : ''),
          onClick: () => removeMember(pid, m.id),
          title: pendingDel ? '再点确认移除' : '移除成员',
        }, pendingDel ? '再点确认' : '移除'),
      ),
    );
  }

  // ---------- viewUsage（积分明细页 #/usage） ----------
  function viewUsage() {
    // 两栏：sidenav | 内容；当前项目跟随 State.projectId
    const project = currentProject();
    return h('div', { class: 'shell usage-page two-col', style: { gridTemplateColumns: '228px 1fr', display: 'grid', height: '100vh' } },
      sidenav('usage'),
      h('div', { class: 'members-panel' },
        project ? usagePanel(project) : h('div', { class: 'empty-state empty-grid' },
          h('div', { class: 'empty-title' }, '请先选择项目'),
        ),
      ),
    );
  }

  function usagePanel(project) {
    const allLogs = getProjectUsage(project.id);
    const filtered = applyUsageFilter(allLogs);
    const stats = usageStats(filtered);
    const members = getProjectMembers(project.id);
    const ownerPhone = project.ownerPhone || (State.session && State.session.phone) || '';

    // 成员名单（含 owner + 各 member）
    const memberOpts = [
      { value: 'all', label: '全部成员' },
      { value: 'owner', label: '管理员' },
      ...members.map(m => ({ value: m.phone, label: maskPhone(m.phone) })),
    ];

    const rangeOpts = [
      { value: 'today', label: '今天' },
      { value: '7d', label: '近 7 天' },
      { value: '30d', label: '近 30 天' },
      { value: 'all', label: '全部' },
    ];
    const actionOpts = [
      { value: 'all', label: '全部类型' },
      { value: 'image', label: '图片' },
      { value: 'video', label: '视频' },
      { value: 'text', label: '文本' },
    ];

    return h('div', { class: 'usage-panel-inner' },
      h('div', { class: 'members-panel-head' },
        h('div', null,
          h('h2', null, project.name),
          h('div', { class: 'subtle', style: { fontSize: '12px', marginTop: '4px' } },
            '消耗审计 · 共 ' + allLogs.length + ' 条记录',
          ),
        ),
      ),
      // KPI（项目预算 · 与筛选解耦） + 分布（与筛选耦合）
      (function () {
        const projBudget = getProjectBudget(project.id);
        const projSpent = projectSpent(project.id);
        const pct = projBudget > 0 ? Math.min(100, Math.round(projSpent / projBudget * 100)) : 0;
        const lowT = projBudget > 0 && projSpent / projBudget >= 0.9 && projSpent < projBudget;
        const exhausted = projBudget > 0 && projSpent >= projBudget;
        const fillClass = exhausted ? 'danger' : lowT ? 'warn' : '';
        const allLogsForStats = getProjectUsage(project.id);
        const totalCount = allLogsForStats.length;
        // 近 15 天柱状
        const buckets15 = totalCount > 0 ? dailyBuckets(allLogsForStats, 15) : [];
        const max15 = Math.max(1, ...buckets15.map(b => b.total));
        return h('div', { class: 'usage-overview' },
          h('div', { class: 'usage-kpi-card budget-kpi-inline' + (exhausted ? ' exhausted' : lowT ? ' low' : '') },
            // 上部分：可用积分（左数字+下标签 / 右调整按钮）
            h('div', { class: 'budget-kpi-section budget-kpi-top' },
              h('div', null,
                h('div', { class: 'budget-kpi-num' }, formatCostShort(projBudget)),
                h('div', { class: 'budget-kpi-label' }, '可用积分'),
              ),
              h('button', {
                class: 'btn sm budget-adjust-btn',
                onClick: () => openBudgetEdit(project.id),
              }, '调整预算'),
            ),
            h('div', { class: 'usage-kpi-divider' }),
            // 下部分：已用积分（数字+下标签，与上半部分一致）+ 「查看全部」
            h('div', { class: 'budget-kpi-section budget-kpi-bottom' },
              h('div', null,
                h('div', { class: 'budget-kpi-num' + (exhausted ? ' danger' : '') }, formatCostShort(projSpent)),
                h('div', { class: 'budget-kpi-label' }, '已用积分'),
              ),
              totalCount > 0 && h('button', {
                class: 'budget-spark-more',
                onClick: () => openSparkAll(project.id),
              }, '查看全部 →'),
            ),
            // 近 15 天柱状
            totalCount > 0 && h('div', { class: 'budget-spark' },
              ...buckets15.map(b => {
                const pctH = b.total > 0 ? Math.max(8, Math.round(b.total / max15 * 100)) : 0;
                return h('div', {
                  class: 'budget-spark-bar' + (b.total === 0 ? ' empty' : ''),
                  style: { height: pctH + '%' },
                  title: dayShortLabel(b.when) + '：' + formatCostShort(b.total) + ' 积分',
                });
              }),
            ),
            totalCount > 0 && h('div', { class: 'budget-spark-foot' },
              h('span', { class: 'mono' }, dayShortLabel(buckets15[0].when)),
              h('span', null, '近 15 天'),
              h('span', { class: 'mono' }, dayShortLabel(buckets15[buckets15.length - 1].when)),
            ),
          ),
        h('div', { class: 'usage-dist' },
          h('div', { class: 'usage-dist-head' }, '成员消耗分布'),
          stats.byMember.length === 0
            ? h('div', { class: 'subtle', style: { fontSize: '12px', padding: '8px 4px' } }, '当前筛选无数据')
            : h('div', { class: 'usage-dist-list' },
                ...stats.byMember.slice(0, 5).map(m => {
                  const pct = stats.total > 0 ? Math.round(m.total / stats.total * 100) : 0;
                  const isOwner = m.role === 'owner' || m.phone === ownerPhone;
                  return h('div', { class: 'usage-dist-row' },
                    h('span', { class: 'usage-dist-name' }, isOwner ? '管理员' : maskPhone(m.phone)),
                    h('div', { class: 'usage-dist-bar' },
                      h('div', { class: 'usage-dist-fill', style: { width: pct + '%' } }),
                    ),
                    h('span', { class: 'usage-dist-val' }, formatCostShort(m.total) + ' · ' + pct + '%'),
                  );
                }),
                stats.byMember.length > 5 && h('button', {
                  class: 'usage-dist-more',
                  onClick: () => openUsageDistModal(project.id),
                }, '查看全部 ' + stats.byMember.length + ' 人 →'),
              ),
        ),
      );
      })(),
      // 筛选行
      h('div', { class: 'usage-filters' },
        h('select', {
          value: State.usageRangePreset,
          onChange: (e) => { State.usageRangePreset = e.target.value; resetUsagePage(); render(); },
        },
          ...rangeOpts.map(o => h('option', { value: o.value }, o.label)),
        ),
        h('select', {
          value: State.usageMemberFilter,
          onChange: (e) => { State.usageMemberFilter = e.target.value; resetUsagePage(); render(); },
        },
          ...memberOpts.map(o => h('option', { value: o.value }, o.label)),
        ),
        h('select', {
          value: State.usageActionFilter,
          onChange: (e) => { State.usageActionFilter = e.target.value; resetUsagePage(); render(); },
        },
          ...actionOpts.map(o => h('option', { value: o.value }, o.label)),
        ),
        h('span', { class: 'usage-filters-spacer' }),
        h('span', { class: 'usage-filters-count' }, formatCostShort(filtered.length) + ' 条'),
      ),
      // 列表（无限滚动 slice）
      filtered.length === 0
        ? h('div', { class: 'empty-state empty-grid' },
            h('div', { class: 'empty-title' }, '当前筛选无消耗记录'),
            h('div', { class: 'empty-sub' }, '尝试切换时间范围或清空筛选'),
          )
        : (function () {
            const visible = filtered.slice(0, State.usagePageSize);
            const hasMore = filtered.length > visible.length;
            return h('div', { class: 'usage-rows' },
              ...visible.map(u => usageRow(u, ownerPhone)),
              hasMore && h('div', { class: 'usage-sentinel' },
                h('span', { class: 'usage-sentinel-text' }, '加载中…'),
              ),
            );
          })(),
    );
  }

  function usageRow(u, ownerPhone) {
    const isOwner = u.role === 'owner' || u.memberPhone === ownerPhone;
    const masked = u.memberPhone ? maskPhone(u.memberPhone) : '匿名';
    const avatar = u.memberPhone ? u.memberPhone.slice(-1) : '·';
    const rel = formatRelative(u.when);
    const abs = formatAbsolute(u.when);
    return h('div', {
      class: 'usage-row',
      onClick: () => openUsageDetail(u),
      title: '点击查看详情',
    },
      h('span', { class: 'member-avatar' }, avatar),
      h('div', { class: 'usage-row-info' },
        h('div', { class: 'usage-row-line1' },
          h('span', { class: 'usage-row-name' }, isOwner ? '管理员' : masked),
          h('span', { class: 'usage-row-sep' }, ' · '),
          h('span', { class: 'usage-row-action' },
            h('span', { class: 'usage-row-action-ico', html: actionIco(u.action) }),
            h('span', null, ' ' + actionLabel(u.action)),
          ),
          h('span', { class: 'usage-row-sep' }, ' · '),
          h('span', { class: 'usage-row-model mono' }, u.model || '—'),
        ),
        h('div', { class: 'usage-row-line2' },
          h('span', { class: 'usage-row-cost' }, '−' + formatCostShort(u.cost) + ' 积分'),
          h('span', { class: 'usage-row-sep' }, ' · '),
          h('span', { class: 'usage-row-time', title: abs }, rel),
        ),
      ),
    );
  }

  // ---------- 我的账户页（#/account · 顶级页面，无 sidenav） ----------
  function viewAccount() {
    const balance = (State.session && State.session.balance) || 0;
    const totalRecharged = (State.session && State.session.totalRecharged) || 0;
    const owned = getOwnedProjects();
    const allocatedAll = owned.reduce((s, p) => s + (p.budgetAllocated || 0), 0);
    const spentAll = owned.reduce((s, p) => s + projectSpent(p.id), 0);

    return h('div', { class: 'account-page-full' },
      h('div', { class: 'account-page-main' },
        h('div', { class: 'account-page-inner' },
          // 左上角返回
          h('a', {
            class: 'account-back-btn',
            href: '#/',
            title: '返回首页',
          },
            h('span', { class: 'ico-inline', html: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="10,3 5,8 10,13"/></svg>' }),
            h('span', null, ' 返回'),
          ),
          // Head
          h('div', { class: 'account-page-head' },
            h('h2', null, '我的账户'),
            h('div', { class: 'subtle', style: { fontSize: '12.5px', marginTop: '4px' } },
              '充值积分 · 给项目划拨预算',
            ),
          ),
          // 卡 1：账户当前状态（账户余额 = 已分配 + 可分配）
          (function () {
            const accountTotal = balance + allocatedAll;
            return h('div', { class: 'account-state-card' },
              h('div', { class: 'account-state-main' },
                h('div', { class: 'account-state-label' }, '账户余额'),
                h('div', { class: 'account-state-num-row' },
                  h('span', { class: 'account-state-num' }, formatCostShort(accountTotal)),
                  h('span', { class: 'account-state-unit' }, '积分'),
                ),
              ),
              h('button', {
                class: 'btn primary account-recharge-btn',
                onClick: openRecharge,
              },
                h('span', { class: 'ico-inline', html: ICO.plus }),
                h('span', null, ' 充值'),
              ),
              h('div', { class: 'account-state-divider' }),
              h('div', { class: 'account-state-sub' },
                h('div', { class: 'account-state-sub-cell' },
                  h('span', { class: 'account-state-sub-num mono' }, formatCostShort(allocatedAll)),
                  h('span', { class: 'account-state-sub-label' }, '已分配'),
                ),
                h('div', { class: 'account-state-sub-divider' }),
                h('div', { class: 'account-state-sub-cell' },
                  h('span', { class: 'account-state-sub-num mono' }, formatCostShort(balance)),
                  h('span', { class: 'account-state-sub-label' }, '可分配'),
                ),
              ),
            );
          })(),
          // 卡 2：收支总览
          h('div', { class: 'account-overview-card' },
            h('div', { class: 'account-overview-cell' },
              h('div', { class: 'account-overview-num' }, formatCostShort(totalRecharged)),
              h('div', { class: 'account-overview-label' }, '累计充值'),
            ),
            h('div', { class: 'account-overview-divider' }),
            h('div', { class: 'account-overview-cell' },
              h('div', { class: 'account-overview-num' }, formatCostShort(spentAll)),
              h('div', { class: 'account-overview-label' }, '累计消耗'),
            ),
          ),
          // 项目预算分布
          h('div', { class: 'account-section' },
            h('div', { class: 'account-section-head-row' },
              h('h3', null, '项目预算分布'),
              h('span', { class: 'subtle mono', style: { fontSize: '11.5px' } }, owned.length + ' 个项目'),
            ),
            owned.length === 0
              ? h('div', { class: 'empty-state', style: { padding: '40px 16px' } },
                  h('div', { class: 'empty-title' }, '还没有管理的项目'),
                  h('div', { class: 'empty-sub' }, '前往项目页创建你的第一个项目'),
                  h('div', { style: { marginTop: '12px' } },
                    h('a', { class: 'btn primary sm', href: '#/projects' }, '前往项目页'),
                  ),
                )
              : h('div', { class: 'account-budget-list page' },
                  ...owned.map(p => {
                    const b = getProjectBudget(p.id);
                    const s = projectSpent(p.id);
                    const pct = b > 0 ? Math.min(100, Math.round(s / b * 100)) : 0;
                    return h('div', { class: 'account-budget-row' },
                      h('div', { class: 'account-budget-name' }, p.name),
                      h('div', { class: 'account-budget-bar' },
                        h('div', { class: 'account-budget-fill', style: { width: pct + '%' } }),
                      ),
                      h('div', { class: 'account-budget-val' },
                        formatCostShort(s) + ' / ' + (b > 0 ? formatCostShort(b) : '0'),
                      ),
                      h('button', {
                        class: 'account-budget-adjust',
                        onClick: () => openBudgetEdit(p.id),
                      }, '调整'),
                    );
                  }),
                ),
          ),
        ),
      ),
    );
  }

  function viewProjects() {
    const list = D.projects || [];
    return h('div', { class: 'shell two-col', style: { gridTemplateColumns: '228px 1fr' } },
      sidenav(null), // no sidenav active state
      h('div', { class: 'col-right projects-page' },
        h('div', { class: 'work-head', style: { paddingRight: '28px' } },
          h('div', { class: 'left' },
            h('h2', null, '全部项目'),
            h('span', { class: 'mono subtle', style: { fontSize: '12px', marginLeft: '10px' } },
              '· 共 ', String(list.length), ' 个项目',
            ),
          ),
          h('div', { class: 'actions' },
            h('span', { class: 'btn primary sm', onClick: openCreateProject },
              h('span', { class: 'ico-inline', html: ICO.plus }),
              h('span', null, ' 创建项目'),
            ),
          ),
        ),
        h('div', { class: 'projects-grid-wrap' },
          h('div', { class: 'projects-grid' },
            projCreateCard(),
            ...list.map(projCard),
          ),
        ),
      ),
    );
  }

  // ---------- Auth View (#/login) ----------
  function viewAuth() {
    const phone = State.authPhoneDraft || '';
    const code = State.authCodeDraft || '';
    const cd = State.authCodeCountdown;
    const phoneOk = isValidPhone(phone);

    function thirdPartyBtn(via, label, brandClass, svg) {
      return h('button', {
        class: 'third-party-btn ' + brandClass,
        title: label,
        onClick: () => commitAuthThirdParty(via),
        html: svg,
      });
    }

    return h('div', { class: 'auth-page' },
      h('div', { class: 'auth-bg' }),
      h('div', { class: 'auth-card' },
        h('div', { class: 'auth-brand' },
          h('span', { class: 'auth-brand-mark' }, 'F'),
          h('div', { class: 'auth-brand-text' },
            h('div', { class: 'auth-brand-name' }, 'fuyao'),
            h('div', { class: 'auth-brand-slogan' }, 'AI 创作平台'),
          ),
        ),
        h('h2', { class: 'auth-title' }, '登录 / 创建账户'),
        h('div', { class: 'auth-form' },
          h('div', { class: 'auth-field' },
            h('label', null, '手机号'),
            h('div', { class: 'auth-phone-input' },
              h('span', { class: 'auth-phone-prefix' }, '+86'),
              h('input', {
                type: 'tel',
                name: 'phone',
                value: phone,
                placeholder: '请输入手机号',
                maxlength: '11',
                onInput: (e) => { State.authPhoneDraft = e.target.value.replace(/\D/g, ''); },
              }),
            ),
          ),
          h('div', { class: 'auth-field' },
            h('label', null, '验证码'),
            h('div', { class: 'auth-otp-row' },
              h('input', {
                type: 'text',
                name: 'code',
                value: code,
                placeholder: '4 位验证码',
                maxlength: '4',
                onInput: (e) => { State.authCodeDraft = e.target.value.replace(/\D/g, ''); },
                onKeydown: (e) => { if (e.key === 'Enter') commitAuthLogin(); },
              }),
              h('button', {
                class: 'otp-send-btn' + (cd > 0 || !phoneOk ? ' disabled' : ''),
                onClick: requestAuthCode,
                disabled: cd > 0 || !phoneOk ? '' : null,
              }, cd > 0 ? (cd + ' s') : '获取验证码'),
            ),
          ),
          h('label', { class: 'auth-agreement' },
            h('input', {
              type: 'checkbox',
              checked: State.authAgreementChecked ? '' : null,
              onChange: (e) => { State.authAgreementChecked = !!e.target.checked; },
            }),
            h('span', null, '我已阅读并同意 '),
            h('a', {
              href: '#',
              onClick: (e) => { e.preventDefault(); showToast('demo 不展示协议正文'); },
            }, '《服务条款》'),
            h('span', null, ' 与 '),
            h('a', {
              href: '#',
              onClick: (e) => { e.preventDefault(); showToast('demo 不展示协议正文'); },
            }, '《隐私政策》'),
          ),
          h('button', {
            class: 'auth-submit-btn',
            onClick: commitAuthLogin,
          }, '登录 · 创建账户'),
          h('div', { class: 'auth-footnote' },
            '首次登录将自动创建账户',
          ),
        ),
      ),
    );
  }

  // ---------- Canvas View ----------
  function viewCanvas() {
    return h('div', { class: 'shell two-col', style: { gridTemplateColumns: '228px 1fr' } },
      sidenav('canvas'),
      h('div', { class: 'col-right' },
        h('div', { class: 'work-head', style: { paddingRight: '28px' } },
          h('h2', null, '智能画布'),
          h('div', { class: 'crumbs' },
            h('span', null, currentProject().name), h('span', { class: 'sep' }, '/'),
            h('span', null, '智能画布'),
          ),
          h('div', { class: 'actions' },
            h('span', { class: 'btn ghost sm' }, '帮助'),
            h('span', { class: 'btn primary sm' }, '＋ 新画布'),
          ),
        ),
        h('div', { class: 'canvas-placeholder' },
          h('div', { class: 'badge' }, 'in design'),
          h('div', { class: 'label' }, 'Smart Canvas'),
          h('div', { class: 'sub' }, '— 自由布局 · 跨工具混排 · 设计中 —'),
        ),
      ),
    );
  }

  // ---------- Tool View ----------
  function viewTool(toolKey) {
    const sessions = (D.sessions[State.projectId] || []).filter(s => s.tool === toolKey);
    const activeId = State.activeSession[toolKey];
    const active = sessions.find(s => s.id === activeId) || sessions[0];

    const collapsed = State.midCollapsed;
    const isGrid = State.workView === 'grid';
    const inSelection = State.selectionMode && isGrid;

    function workHeadDefault() {
      return h('div', { class: 'work-head' },
        h('div', { class: 'left' },
          collapsed && h('span', {
            class: 'icon-btn',
            title: '展开面板',
            html: ICO.panelToggle,
            onClick: toggleMidPanel,
          }),
          h('h2', null, active.name),
        ),
        h('div', { class: 'actions' },
          // Group 1: 工具（仅 grid view 显示「批量」）
          isGrid && h('span', {
            class: 'btn ghost sm',
            onClick: () => enterSelectionMode(),
          },
            h('span', { class: 'ico-inline', html: ICO.checkbox }),
            ' 批量',
          ),
          isGrid && h('span', { class: 'work-head-divider' }),
          // Group 2: 视图切换 segmented control
          h('div', { class: 'view-switcher' },
            h('button', {
              class: 'vs-btn' + (isGrid ? ' on' : ''),
              title: '网格',
              html: ICO.grid,
              onClick: () => { State.workView = 'grid'; render(); },
            }),
            h('button', {
              class: 'vs-btn' + (!isGrid ? ' on' : ''),
              title: '对话流',
              html: ICO.feed,
              onClick: () => { State.workView = 'feed'; render(); },
            }),
          ),
          // Group 3: 筛选（grid + feed 都显示）
          h('span', { class: 'work-head-divider' }),
          h('span', {
            class: 'btn ghost sm' + (isFilterActive() ? ' active' : ''),
            'data-act': 'filter',
            onClick: (e) => { e.stopPropagation(); openFilterPop(e.currentTarget); },
          },
            h('span', null, filterButtonLabel()),
            h('span', { class: 'caret', html: ICO.chevronDown }),
          ),
        ),
      );
    }

    function workHeadSelection() {
      const n = State.selectedAssetIds.length;
      return h('div', { class: 'work-head selection-bar' },
        h('div', { class: 'left' },
          h('span', { class: 'sel-count-ico', html: ICO.checkbox }),
          h('h2', null, '已选 ', String(n), ' 项'),
        ),
        h('div', { class: 'actions' },
          h('span', {
            class: 'btn ghost sm' + (n === 0 ? ' disabled' : ''),
            onClick: () => batchDownload(),
          },
            h('span', { class: 'ico-inline', html: ICO.download }),
            ' 下载', n > 0 ? ' ' + n : '',
          ),
          h('span', {
            class: 'btn ghost sm' + (n === 0 ? ' disabled' : ''),
            'data-act': 'batch-tag',
            onClick: (e) => { e.stopPropagation(); if (n > 0) batchTag(e.currentTarget); },
          },
            h('span', { class: 'ico-inline', html: ICO.tag }),
            ' 标签', n > 0 ? ' ' + n : '',
          ),
          h('span', { class: 'work-head-divider' }),
          h('span', {
            class: 'btn ghost sm',
            onClick: exitSelectionMode,
          }, '取消'),
        ),
      );
    }

    return h('div', { class: 'shell three-col' + (collapsed ? ' mid-collapsed' : '') },
      sidenav(toolKey),
      h('div', { class: 'col-mid' },
        h('div', { class: 'col-mid-head' },
          h('span', null, '对话'),
          h('div', { class: 'right' },
            h('span', {
              class: 'icon-btn',
              title: '收起面板',
              html: ICO.panelToggle,
              onClick: toggleMidPanel,
            }),
          ),
        ),
        h('div', { class: 'session-list' },
          h('div', {
            class: 'new-conv',
            onClick: () => openNewChat(toolKey),
          },
            h('span', { class: 'icon', html: ICO.newChat }),
            h('span', null, '新对话'),
          ),
          sessions.length === 0
            ? h('div', { class: 'empty-state empty-sessions' },
                h('div', { class: 'empty-icon', html: ICO.newChat }),
                h('div', { class: 'empty-title' }, '还没有对话'),
                h('div', { class: 'empty-sub' }, '点击上方「新对话」开始'),
              )
            : [
                sessions.filter(s => s.kind === 'pinned').length > 0 && h('div', { class: 'session-section' }, '置顶'),
                ...sessions.filter(s => s.kind === 'pinned').map(s => sessionRow(s, toolKey)),
                sessions.filter(s => s.kind !== 'pinned').length > 0 && h('div', { class: 'session-section' }, '最近'),
                ...sessions.filter(s => s.kind !== 'pinned').map(s => sessionRow(s, toolKey)),
              ],
        ),
      ),
      h('div', { class: 'col-right' },
        active && (inSelection ? workHeadSelection() : workHeadDefault()),
        active
          ? (isGrid
              ? h('div', { class: 'work-body' }, gridView(toolKey))
              : h('div', { class: 'work-body' }, ...renderConversation(active)))
          : h('div', { class: 'work-body' },
              h('div', { class: 'empty-state empty-no-session' },
                h('div', { class: 'empty-icon', html: ICO.newChat }),
                h('div', { class: 'empty-title' }, '还没有对话'),
                h('div', { class: 'empty-sub' }, '从左侧创建一个新对话开始'),
              ),
            ),
        active && !isGrid && h('div', { class: 'work-foot' }, composer(toolKey)),
      ),
    );
  }


  // ---------- Grid view (dated tiles) ----------
  function gridView(toolKey) {
    const kindMap = { image: 'image', video: 'video', text: 'doc' };
    const targetKind = kindMap[toolKey];
    const all = D.assets.filter(a => a.projectId === State.projectId && a.kind === targetKind);
    const list = applyAdvancedFilter(all);

    if (list.length === 0) {
      const labelMap = { image: '图片', video: '视频', text: '文档' };
      const isFiltered = isFilterActive();
      return h('div', { class: 'empty-state empty-grid' },
        h('div', { class: 'empty-icon', html: isFiltered ? ICO.search : ICO.docFile }),
        h('div', { class: 'empty-title' },
          isFiltered ? '没有匹配的' + labelMap[toolKey] : '还没有作品',
        ),
        h('div', { class: 'empty-sub' },
          isFiltered ? '调整筛选或清除条件' : '在下方输入框开始创作',
        ),
        isFiltered && h('button', {
          class: 'btn ghost sm',
          style: { marginTop: '14px' },
          onClick: () => { clearFilter(); render(); },
        }, '清除筛选'),
      );
    }

    // Group by date
    const groups = {};
    const order = [];
    list.forEach(a => {
      if (!groups[a.date]) { groups[a.date] = []; order.push(a.date); }
      groups[a.date].push(a);
    });
    const showGroupHead = order.length > 1;

    return h('div', { class: 'media-grid-page' },
      ...order.map((date) => h('div', { class: 'media-group' },
        showGroupHead && h('div', { class: 'group-head' }, date),
        h('div', { class: 'media-grid grid-' + (toolKey === 'text' ? 'docs' : 'media') },
          ...groups[date].map(a => mediaTile(a, toolKey)),
        ),
      )),
    );
  }

  function openAssetDetailFromAsset(a) {
    const isVideo = a.kind === 'video';
    const isDoc = a.kind === 'doc';
    openAssetDetail({
      type: isDoc ? 'doc' : (isVideo ? 'video' : 'image'),
      src: a.src,
      title: a.title || (isDoc ? ('文档 #' + a.id) : null),
      prompt: a.prompt || a.desc || '',
      meta: {
        ratio: a.aspect,
        duration: a.duration,
      },
      createdAt: a.id,
    });
  }
  function deleteSingleAsset(a, e) {
    if (e) e.stopPropagation();
    if (State.assetSinglePendingDelete === a.id) {
      const idx = D.assets.findIndex(x => x.id === a.id);
      if (idx >= 0) D.assets.splice(idx, 1);
      State.assetSinglePendingDelete = null;
      showToast('已删除');
      render();
    } else {
      State.assetSinglePendingDelete = a.id;
      showToast('再点一次确认删除');
      render();
      setTimeout(() => {
        if (State.assetSinglePendingDelete === a.id) {
          State.assetSinglePendingDelete = null;
          render();
        }
      }, 3000);
    }
  }

  function mediaTile(a, toolKey) {
    const isVideo = a.kind === 'video';
    const isText = a.kind === 'doc';
    const inSelection = State.selectionMode;
    const isSelected = inSelection && State.selectedAssetIds.indexOf(a.id) >= 0;
    const pendingDel = State.assetSinglePendingDelete === a.id;
    function stop(e) { e.stopPropagation(); }

    if (isText) {
      const tags = getAssetTags(a);
      return h('div', {
        class: 'doc-tile' + (isSelected ? ' selected' : ''),
        onClick: inSelection ? (() => toggleSelectAsset(a.id)) : (() => openAssetDetailFromAsset(a)),
        title: inSelection ? '' : '点击查看详情',
      },
        inSelection && h('span', { class: 'tile-select-check' + (isSelected ? ' on' : '') }, isSelected ? '✓' : ''),
        h('div', { class: 'doc-icon', html: ICO.docFile }),
        h('div', { class: 'flex-1' },
          h('div', { style: { fontWeight: 500, fontSize: '13.5px', color: 'var(--ink)' } }, a.title || ('文档 #' + a.id)),
          h('div', { class: 'mono subtle', style: { fontSize: '11.5px', marginTop: '4px', letterSpacing: '.02em' } }, formatAssetDateTime(a)),
          tags.length > 0 && h('div', { class: 'doc-tags-row', style: { marginTop: '8px' } },
            ...tags.map(t => h('span', { class: 'doc-tag-chip' }, t)),
          ),
        ),
        !inSelection && h('div', { class: 'doc-tile-actions' },
          h('button', {
            class: 'doc-tile-act-btn',
            title: '选择标签',
            html: ICO.tag,
            onClick: (e) => { stop(e); openTagPicker(e.currentTarget, 'asset', a.id); },
          }),
          h('button', {
            class: 'doc-tile-act-btn',
            title: '下载文件',
            html: ICO.download,
            onClick: (e) => {
              stop(e);
              downloadDoc({ title: a.title || ('文档-' + a.id), prompt: a.desc || '' });
            },
          }),
          h('button', {
            class: 'doc-tile-act-btn' + (pendingDel ? ' danger-on' : ''),
            title: pendingDel ? '再点确认删除' : '删除',
            html: ICO.trash,
            onClick: (e) => deleteSingleAsset(a, e),
          }),
        ),
      );
    }
    // image / video tile
    const tags = getAssetTags(a);
    const primaryTag = tags[0];
    const extraCount = Math.max(0, tags.length - 1);
    const sizeLabel = a.aspect ? a.aspect : '';
    const dur = isVideo && a.duration ? secondsLabel(a.duration) : '';
    return h('div', {
      class: 'media-tile' + (a.starred ? ' starred' : '') + (isSelected ? ' selected' : '') + (pendingDel ? ' deleting' : ''),
      onClick: inSelection ? (() => toggleSelectAsset(a.id)) : (() => openAssetDetailFromAsset(a)),
      title: inSelection ? '' : '点击查看详情',
    },
      inSelection && h('span', { class: 'tile-select-check' + (isSelected ? ' on' : '') }, isSelected ? '✓' : ''),
      a.src && h('img', { src: a.src, alt: '', loading: 'lazy' }),
      isVideo && h('span', { class: 'video-overlay' }, h('span', { class: 'play-ring', html: ICO.play })),
      isVideo && h('span', { class: 'duration' }, a.duration),
      // hover 操作（右上：标签 + 删除）
      !inSelection && h('div', { class: 'media-tile-actions', onClick: stop },
        h('button', {
          class: 'media-tile-act',
          title: '选择标签',
          html: ICO.tag,
          onClick: (e) => { stop(e); openTagPicker(e.currentTarget, 'asset', a.id); },
        }),
        h('button', {
          class: 'media-tile-act' + (pendingDel ? ' danger-on' : ''),
          title: pendingDel ? '再点确认删除' : '删除',
          html: ICO.trash,
          onClick: (e) => deleteSingleAsset(a, e),
        }),
      ),
      // 底部 meta（信息密度：中等）
      h('div', { class: 'media-tile-meta' },
        h('span', { class: 'media-tile-meta-1' },
          dur ? h('span', null, dur) : null,
          dur && sizeLabel ? h('span', { class: 'sep' }, ' · ') : null,
          sizeLabel ? h('span', { class: 'mono' }, sizeLabel) : null,
        ),
        primaryTag && h('span', { class: 'media-tile-meta-2' },
          primaryTag,
          extraCount > 0 ? h('span', { class: 'extra' }, ' +' + extraCount) : null,
        ),
      ),
      // hover prompt 摘录（如有）
      (a.prompt || a.desc) && h('div', { class: 'media-tile-hint' },
        h('div', { class: 'media-tile-hint-text' }, (a.prompt || a.desc || '').slice(0, 80)),
      ),
    );
  }

  function sessionRow(s, toolKey) {
    const isActive = State.activeSession[toolKey] === s.id;
    const thumbIco = ({ image: ICO.imageTool, video: ICO.videoTool, text: ICO.textTool })[toolKey] || ICO.docFile;

    function stop(e) { e.stopPropagation(); }

    // Editing state: replace name with input
    if (State.sessionEditingId === s.id) {
      return h('div', { class: 'session-row editing' + (isActive ? ' active' : '') },
        h('div', { class: 'thumb', html: thumbIco }),
        h('div', { class: 'meta' },
          h('input', {
            class: 'session-edit-input',
            value: State.sessionDraftName,
            autofocus: '',
            onClick: stop,
            onInput: (e) => { State.sessionDraftName = e.target.value; },
            onKeydown: (e) => {
              stop(e);
              if (e.key === 'Enter') commitEditSession(s);
              else if (e.key === 'Escape') cancelEditSession();
            },
          }),
        ),
        h('div', { class: 'row-actions inline' },
          h('button', { class: 'btn primary sm', onClick: (e) => { stop(e); commitEditSession(s); } }, '确定'),
          h('button', { class: 'btn ghost sm', onClick: (e) => { stop(e); cancelEditSession(); } }, '取消'),
        ),
      );
    }

    // Pending delete state: inline confirm
    if (State.sessionPendingDeleteId === s.id) {
      return h('div', { class: 'session-row deleting' + (isActive ? ' active' : '') },
        h('div', { class: 'thumb', html: thumbIco }),
        h('div', { class: 'meta' },
          h('div', { class: 't' }, s.name),
          h('div', { class: 's danger' }, '确认删除？'),
        ),
        h('div', { class: 'row-actions inline' },
          h('button', { class: 'btn danger sm', onClick: (e) => { stop(e); confirmDeleteSession(s, toolKey); } }, '确认'),
          h('button', { class: 'btn ghost sm', onClick: (e) => { stop(e); cancelDeleteSession(); } }, '取消'),
        ),
      );
    }

    return h('div',
      {
        class: 'session-row' + (isActive ? ' active' : '') + (s.kind === 'pinned' ? ' pinned' : ''),
        onClick: () => { State.activeSession[toolKey] = s.id; render(); },
      },
      h('div', { class: 'thumb', html: thumbIco }),
      h('div', { class: 'meta' },
        h('div', { class: 't' }, s.name),
        h('div', { class: 's' }, s.updated),
      ),
      h('div', { class: 'row-actions' },
        h('span', {
          class: 'row-act' + (s.kind === 'pinned' ? ' on' : ''),
          title: s.kind === 'pinned' ? '取消置顶' : '置顶',
          html: ICO.pin,
          onClick: (e) => { stop(e); togglePinSession(s); },
        }),
        h('span', {
          class: 'row-act',
          title: '重命名',
          html: ICO.edit,
          onClick: (e) => { stop(e); startEditSession(s); },
        }),
        h('span', {
          class: 'row-act danger',
          title: '删除',
          html: ICO.trash,
          onClick: (e) => { stop(e); startDeleteSession(s); },
        }),
      ),
    );
  }

  // Legacy task labels (app.js:1341)
  const TASK_LABEL_MAP = { video: '视频生成', image: '图片生成', text: '文本生成', edit: '编辑视频' };

  // For image/video media: pair user.request with the following assistant.result into ONE block
  // For text: render user msg and assistant doc separately (chat-style)
  function renderConversation(session) {
    if (!session) return [h('div', { class: 'subtle center', style: { padding: '60px 0' } }, '此会话暂无内容')];
    const msgs = D.conv[session.id];
    if (!msgs) {
      return [h('div', { class: 'subtle center', style: { padding: '60px 0' } },
        '示例会话 · 在下方输入框开始创作。')];
    }
    const filterOn = isFilterActive();
    let docCountTotal = 0;
    let docCountMatched = 0;
    const out = [];
    for (let i = 0; i < msgs.length; i++) {
      const m = msgs[i];
      const next = msgs[i + 1];
      // Combine user request + next AI media result into one block
      if (m.role === 'user' && m.request && next && next.role === 'assistant' && next.result) {
        out.push(combinedMediaBlock(m.request, next.result, session.id, i));
        i++; // skip the result
        continue;
      }
      if (m.role === 'user') { out.push(userMsg(m)); continue; }
      if (m.result) { out.push(mediaResultStandalone(m)); continue; }
      if (m.kind === 'doc') {
        docCountTotal++;
        if (filterOn && !docMatchesFilter(m, session.id, i)) continue;
        docCountMatched++;
        out.push(docResult(m, session.id, i));
        continue;
      }
    }
    // Feed filter banner: when filter active and 0 docs matched (but had docs)
    if (filterOn && docCountTotal > 0 && docCountMatched === 0) {
      out.unshift(h('div', { class: 'feed-filter-banner' },
        h('span', { class: 'ico-inline', html: ICO.tag }),
        h('span', null, '当前筛选下无匹配文档（共 ', String(docCountTotal), ' 个被隐藏）'),
        h('button', {
          class: 'feed-filter-clear',
          onClick: () => { clearFilter(); render(); },
        }, '清除筛选'),
      ));
    } else if (filterOn && docCountTotal > 0 && docCountMatched < docCountTotal) {
      out.unshift(h('div', { class: 'feed-filter-banner subtle' },
        h('span', { class: 'ico-inline', html: ICO.tag }),
        h('span', null, '已隐藏 ', String(docCountTotal - docCountMatched), ' 个不匹配的文档'),
        h('button', {
          class: 'feed-filter-clear',
          onClick: () => { clearFilter(); render(); },
        }, '清除筛选'),
      ));
    }
    return out;
  }

  // ---------- Combined media block (legacy reference) ----------
  // Layout: avatar | body { prompt text, thumbs row, big media, meta line, 4 actions }
  function combinedMediaBlock(req, res, sessionId, msgIdx) {
    const isVideo = res.type === 'video';
    const msgKey = (sessionId || 'unk') + '-' + ((msgIdx == null ? 0 : msgIdx) + 1);
    const ratio = res.ratio || req.ratio || '16:9';
    const shape = ratio === '9:16' ? 'portrait' : (ratio === '1:1' ? 'square' : 'landscape');
    const refs = req.refs || [];
    const thumbSrcs = refs.map(r => r.src || r.thumb).filter(Boolean);

    const metaParts = [];
    if (req.model) metaParts.push({ label: '模型', value: req.model });
    if (req.ratio) metaParts.push({ label: '比例', value: req.ratio });
    if (req.resolution) metaParts.push({ label: '分辨率', value: req.resolution });
    if (isVideo && (req.duration || res.duration)) metaParts.push({ label: '秒数', value: res.duration || req.duration });
    metaParts.push({ label: '生成时间', value: nowStamp() });

    const hasThumbs = thumbSrcs.length > 0;
    return h('div', { class: 'rb-block' },
      h('div', { class: 'rb-card' },
        (hasThumbs || req.text) && h('div', { class: 'rb-prompt-row' },
          hasThumbs && h('div', { class: 'rb-thumbs' },
            ...thumbSrcs.slice(0, 4).map(src => h('img', { class: 'rb-thumb', src, alt: '' })),
          ),
          req.text && h('div', { class: 'rb-prompt' }, req.text),
        ),
        h('div', { class: 'rb-media-wrap ' + shape },
          h('img', { class: 'rb-media', src: res.src, alt: '', loading: 'lazy' }),
          h('div', { class: 'rb-overlay-top' },
            h('button', {
              class: 'ov-btn',
              'data-act': 'tag',
              html: ICO.tag,
              title: '选择标签',
              onClick: (e) => { e.stopPropagation(); openTagPicker(e.currentTarget, 'message', msgKey); },
            }),
            h('button', {
              class: 'ov-btn',
              html: ICO.download,
              title: '下载',
              onClick: (e) => { e.stopPropagation(); downloadMediaResult(res, req); },
            }),
          ),
          isVideo && h('div', { class: 'rb-timer' },
            h('span', { class: 'play-icon', html: ICO.play }),
            h('span', null, '00:00 / ', res.duration || '00:04'),
          ),
        ),
        h('div', { class: 'rb-meta' },
          ...metaParts.map((p, i) => [
            i > 0 && h('span', { class: 'meta-sep' }, '·'),
            h('span', { class: 'meta-item' },
              h('span', { class: 'meta-lbl' }, p.label),
              ' ',
              h('span', null, p.value),
            ),
          ]),
        ),
      ),
      h('div', { class: 'rb-actions' },
        h('button', { class: 'rb-act', onClick: () => showToast('demo: 即将打开重新编辑') },
          h('span', { class: 'ico-inline', html: ICO.edit3 }),
          h('span', null, '重新编辑'),
        ),
        h('button', { class: 'rb-act', onClick: () => { showToast('正在再次生成…'); setTimeout(() => showToast('demo: 已生成'), 1500); } },
          h('span', { class: 'ico-inline', html: ICO.refresh }),
          h('span', null, '再次生成'),
        ),
        h('button', { class: 'rb-act', onClick: () => openFavCollect(req, res, null) },
          h('span', { class: 'ico-inline', html: ICO.star }),
          h('span', null, '收藏到提示词库'),
        ),
      ),
    );
  }

  // For orphan AI media msgs (no preceding user request) — keep simple result card
  function mediaResultStandalone(m) {
    return mediaResult(m);
  }

  function nowStamp() {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  // ---------- User message ----------
  // text-only: simple bubble (with optional attachment line)
  // image/video request: rich .req-card with thumbs + task + refs + text + meta
  function userMsg(m) {
    if (m.request) return renderRequest(m.request);
    return h('div', { class: 'req-card simple' },
      h('div', { class: 'col req-col' },
        h('div', { class: 'bubble' }, m.text || ''),
        m.attachments && h('div', { class: 'att-line' },
          h('span', { class: 'att-icon', html: ICO.paperclip }),
          h('span', null, '引用：', m.attachments.join('、')),
        ),
      ),
    );
  }

  // Replicates legacy renderRequestCard (app.js:1343)
  function renderRequest(req) {
    const refs = req.refs || [];
    const thumbs = refs.filter(r => r.src || r.thumb).slice(0, 3);
    const frames = [];
    if (req.frames?.first) frames.push(req.frames.first);
    if (req.frames?.last)  frames.push(req.frames.last);

    const metaParts = [];
    if (req.model)    metaParts.push(req.model);
    if (req.skill)    metaParts.push(req.skill);
    if (req.duration) metaParts.push(req.duration);
    if (req.ratio)    metaParts.push(req.ratio + (req.resolution ? ' ' + req.resolution : ''));

    const hasThumbs = (thumbs.length + frames.length) > 0;
    return h('div', { class: 'req-card' },
      hasThumbs && h('div', { class: 'req-thumbs' },
        ...thumbs.map(r => h('img', { class: 'req-thumb', src: r.src || r.thumb, alt: '' })),
        ...frames.map(src => h('img', { class: 'req-thumb', src, alt: '' })),
      ),
      h('div', { class: 'req-body' },
        h('div', { class: 'req-head' },
          h('span', { class: 'req-task' }, TASK_LABEL_MAP[req.task] || '生成'),
          ...refs.map((r, i) => {
            const name = r.name || (r.type === 'video' ? '视频' + (i + 1) : '图片' + (i + 1));
            return h('span', { class: 'req-chip' },
              r.src ? h('img', { src: r.src, alt: '' }) : h('span', { class: 'req-chip-ico', html: r.type === 'video' ? ICO.feed : ICO.docFile }),
              h('span', null, '@', name),
            );
          }),
          req.text && h('span', { class: 'req-colon' }, ':'),
        ),
        req.text && h('div', { class: 'req-text' }, req.text),
        metaParts.length > 0 && h('div', { class: 'req-meta' },
          ...metaParts.map((p, i) => [
            i > 0 && h('span', { class: 'dot' }),
            h('span', null, p),
          ]),
          h('span', { class: 'dot' }),
          h('span', { class: 'req-detail' }, '详细信息 ', h('span', { class: 'ico-inline mini', html: ICO.info })),
        ),
      ),
    );
  }

  // ---------- AI media result (single src + overlay top + timer for video) ----------
  // Replicates legacy renderResultCard (app.js:1386)
  function mediaResult(m) {
    const r = m.result;
    const ratio = r.ratio || '16:9';
    const shape = ratio === '9:16' ? 'portrait' : (ratio === '1:1' ? 'square' : 'landscape');
    const isVideo = r.type === 'video';

    return h('div', { class: 'result-wrap' },
      h('div', { class: 'result-card ' + shape },
        h('img', { class: 'result-media', src: r.src, alt: '', loading: 'lazy' }),
        h('div', { class: 'result-overlay-top' },
          h('button', {
            class: 'ov-btn',
            html: ICO.saveFolder,
            title: '保存到文件夹',
            onClick: (e) => { e.stopPropagation(); alert('保存到文件夹'); },
          }),
          h('button', {
            class: 'ov-btn',
            html: ICO.download,
            title: '下载',
            onClick: (e) => { e.stopPropagation(); alert('下载'); },
          }),
        ),
        isVideo && h('div', { class: 'result-timer' },
          h('span', { class: 'play-icon', html: ICO.play }),
          h('span', null, '00:00 / ', r.duration || '00:04'),
        ),
      ),
      h('div', { class: 'result-actions' },
        h('button', { class: 'result-btn', onClick: () => showToast('demo: 即将打开重新编辑') },
          h('span', { class: 'ico-inline', html: ICO.edit3 }),
          h('span', null, '重新编辑'),
        ),
        h('button', { class: 'result-btn', onClick: () => { showToast('正在再次生成…'); setTimeout(() => showToast('demo: 已生成'), 1500); } },
          h('span', { class: 'ico-inline', html: ICO.refresh }),
          h('span', null, '再次生成'),
        ),
      ),
    );
  }

  function docResult(m, sessionId, msgIdx) {
    const msgKey = (sessionId || 'unk') + '-' + (msgIdx == null ? 0 : msgIdx);
    const tags = getMessageTags(msgKey);
    function stop(e) { e.stopPropagation(); }
    return h('div', { class: 'ai-msg' },
      h('p', { class: 'ai-text' }, m.prompt),
      h('div', {
        class: 'doc-card',
        onClick: () => openAssetDetail({
          type: 'doc',
          src: null,
          title: m.title,
          prompt: m.prompt,
          meta: { version: m.version, note: m.note },
          createdAt: Date.now(),
        }),
      },
        h('span', { class: 'doc-icon-file', html: ICO.docFile }),
        h('div', { class: 'doc-info' },
          h('div', { class: 'title' }, m.title),
          h('div', { class: 'meta' },
            'Document · ', m.version,
            m.note ? ' · ' + m.note : '',
          ),
          tags.length > 0 && h('div', { class: 'doc-tags-row' },
            ...tags.map(t => h('span', { class: 'doc-tag-chip' }, t)),
          ),
        ),
        h('div', { class: 'doc-actions' },
          h('button', {
            class: 'doc-act-btn',
            'data-act': 'tag',
            title: '选择标签',
            html: ICO.tag,
            onClick: (e) => {
              stop(e);
              openTagPicker(e.currentTarget, 'message', msgKey);
            },
          }),
          h('button', {
            class: 'doc-act-btn',
            'data-act': 'download',
            title: '下载文件',
            html: ICO.download,
            onClick: (e) => { stop(e); downloadDoc(m); },
          }),
        ),
      ),
    );
  }

  // ---------- Skill picker (text composer, attached to pill) ----------
  function skillPopover() {
    if (!State.skillPopOpen) return null;
    const builtin = D.builtinSkills || [];
    const custom = State.customSkills || [];

    function skItem(s) {
      return h('div',
        {
          class: 'sk' + (State.skill === s.id ? ' on' : ''),
          onClick: () => {
            State.skill = s.id;
            closeSkillPop();
          },
        },
        h('span', { class: 'sk-label' }, s.name),
        s.builtin && h('span', { class: 'sk-tag' }, '内置'),
      );
    }

    // Attached positioning: fixed, anchored relative to the pill
    const anchor = State.skillPopAnchor;
    const style = anchor
      ? { left: anchor.left + 'px', bottom: anchor.bottom + 'px', right: 'auto', top: 'auto' }
      : null;

    return h('div', { class: 'skill-pop attached', style: style },
      ...builtin.map(skItem),
      custom.length > 0 && h('div', { class: 'sk-divider' }),
      ...custom.map(skItem),
      custom.length === 0 && h('a', {
        class: 'sk-add',
        href: '#/skills',
        onClick: () => closeSkillPop(),
      }, '＋ 在技能库中新建'),
    );
  }

  // ---------- Example picker popover (image/video composer) ----------
  function examplePicker() {
    if (!State.examplePopOpen) return null;
    const list = State.userPrompts || [];
    const selectedId = State.examplePickerSelected;
    const hasSel = !!selectedId && list.some(p => p.id === selectedId);
    // AI 提升 需要 textarea 已有内容（否则没什么可"提升"）
    const _ta = document.querySelector('.input-card .prompt-area');
    const hasText = !!(_ta && _ta.value && _ta.value.trim());
    const aiEnabled = hasSel && hasText;

    // Attached positioning: anchor relative to the chip captured at open time
    const anchor = State.examplePopAnchor;
    const style = anchor
      ? { right: anchor.right + 'px', bottom: anchor.bottom + 'px', left: 'auto', top: 'auto' }
      : null;

    return h('div', { class: 'example-pop' + (anchor ? ' attached' : ''), style: style },
      h('div', { class: 'example-pop-head' },
        h('span', null, '选择提示词'),
      ),
      list.length === 0
        ? h('div', { class: 'example-pop-empty' },
            h('div', { style: { marginBottom: '8px' } }, '提示词库还为空'),
            h('a', { href: '#/prompts', onClick: closeExamplePop }, '去『提示词库』新建一些 →'),
          )
        : h('div', { class: 'example-pop-list' },
            ...list.map(p => {
              const isOn = selectedId === p.id;
              const desc = (p.content || '').split('\n').map(s => s.trim()).find(Boolean) || '';
              const thumbSrc = p.imageSrc || p.videoSrc || null;
              return h('div', {
                class: 'example-item' + (isOn ? ' on' : ''),
                onClick: () => selectExamplePromptInPicker(p),
              },
                h('span', { class: 'ex-thumb' + (thumbSrc ? '' : ' empty') },
                  thumbSrc && h('img', { src: thumbSrc, alt: '', loading: 'lazy' }),
                ),
                h('div', { class: 'ex-main' },
                  h('div', { class: 'ex-name' }, p.name),
                  desc && h('div', { class: 'ex-desc' }, desc),
                ),
              );
            }),
          ),
      list.length > 0 && h('div', { class: 'example-pop-foot' },
        h('span', { class: 'spacer', style: { flex: 1 } }),
        h('button', {
          class: 'btn sm',
          disabled: !hasSel,
          onClick: useExamplePromptToCompose,
        }, '使用'),
        h('button', {
          class: 'btn primary sm',
          disabled: !aiEnabled,
          title: !hasSel ? '请先选择提示词' : (!hasText ? '请先在对话框中输入内容' : ''),
          onClick: aiUpgradeWithExample,
        },
          h('span', { class: 'ico-inline', html: ICO.sparkles }),
          h('span', null, ' AI 提升'),
        ),
      ),
    );
  }

  // ---------- Filter Popover (multi-dim: tags + date range) ----------
  function filterPopover() {
    if (!State.filterPopOpen) return null;
    const f = getActiveFilter();
    const tagList = D.projectTags[State.projectId] || [];
    const anchor = State.filterPopAnchor;
    const style = anchor
      ? { right: anchor.right + 'px', top: anchor.top + 'px' }
      : null;

    function tagChip(t) {
      const on = (f.tags || []).includes(t.name);
      return h('span', {
        class: 'fp-tag-chip' + (on ? ' on' : ''),
        onClick: () => toggleFilterTag(t.name),
      }, t.name);
    }

    function presetBtn(label, key) {
      return h('button', {
        class: 'fp-preset-btn' + (isPresetActive(key) ? ' on' : ''),
        onClick: () => setFilterPreset(key),
      }, label);
    }

    return h('div', { class: 'filter-pop', style: style },
      h('div', { class: 'fp-head' },
        h('span', { class: 'fp-title' }, '筛选'),
        h('button', { class: 'fp-close', onClick: closeFilterPop, title: '关闭' }, '✕'),
      ),

      // Section: 标签
      h('div', { class: 'fp-section' },
        h('div', { class: 'fp-label' }, '标签'),
        tagList.length === 0
          ? h('div', { class: 'fp-empty' }, '当前项目暂无标签')
          : h('div', { class: 'fp-tag-list' },
              ...tagList.map(tagChip),
            ),
      ),

      h('div', { class: 'fp-divider' }),

      // Section: 时间
      h('div', { class: 'fp-section' },
        h('div', { class: 'fp-label' }, '时间'),
        h('div', { class: 'fp-presets' },
          presetBtn('今天', 'today'),
          presetBtn('本周', 'thisweek'),
          presetBtn('本月', 'thismonth'),
          presetBtn('全部', 'all'),
        ),
        h('div', { class: 'fp-date-row' },
          h('input', {
            type: 'date',
            class: 'fp-date-input',
            value: f.dateStart || '',
            onChange: (e) => { State.filter.dateStart = e.target.value || null; render(); },
          }),
          h('span', { class: 'fp-date-sep' }, '至'),
          h('input', {
            type: 'date',
            class: 'fp-date-input',
            value: f.dateEnd || '',
            onChange: (e) => { State.filter.dateEnd = e.target.value || null; render(); },
          }),
        ),
      ),

      h('div', { class: 'fp-divider' }),

      h('div', { class: 'fp-foot' },
        h('button', {
          class: 'btn ghost sm' + (isFilterActive() ? '' : ' disabled'),
          onClick: () => { clearFilter(); render(); },
        }, '清除'),
        h('span', { class: 'spacer', style: { flex: 1 } }),
        h('button', { class: 'btn primary sm', onClick: closeFilterPop }, '完成'),
      ),
    );
  }

  // ---------- Tag Picker Popover (attached to doc card icon) ----------
  function tagPickerPopover() {
    if (!State.tagPickerOpen) return null;
    const list = getCurrentProjectTagList();
    const selected = new Set(getTargetTags());
    const anchor = State.tagPickerAnchor;
    const style = anchor
      ? { right: anchor.right + 'px', top: anchor.top + 'px' }
      : null;

    function tagRowEl(t) {
      const isOn = selected.has(t.name);
      return h('div', {
        class: 'tag-pick-row' + (isOn ? ' on' : ''),
        onClick: () => toggleTargetTag(t.name),
      },
        h('span', { class: 'tag-pick-check' }, isOn ? '✓' : ''),
        h('span', { class: 'tag-pick-name' }, t.name),
      );
    }

    return h('div', { class: 'tag-picker-pop', style: style },
      h('div', { class: 'tag-picker-head' },
        h('span', null, '选择标签'),
        h('span', { class: 'subtle' }, '已选 ', String(selected.size)),
      ),
      h('div', { class: 'tag-picker-list' },
        list.length === 0 && !State.tagPickerCreating
          ? h('div', { class: 'tag-pick-empty' }, '当前项目暂无标签，点击下方新建')
          : list.map(tagRowEl),
      ),
      h('div', { class: 'tag-picker-divider' }),
      State.tagPickerCreating
        ? h('div', { class: 'tag-pick-create active' },
            h('input', {
              type: 'text',
              class: 'tag-pick-input',
              value: State.tagPickerDraftName,
              autofocus: '',
              onInput: (e) => {
                let v = e.target.value;
                if (!v.startsWith('#')) v = '#' + v.replace(/^#+/, '');
                State.tagPickerDraftName = v;
              },
              onKeydown: (e) => {
                if (e.key === 'Enter') { e.preventDefault(); commitInlineCreateTag(); }
                else if (e.key === 'Escape') { e.preventDefault(); cancelInlineCreateTag(); }
              },
            }),
            h('button', { class: 'btn primary sm', onClick: commitInlineCreateTag }, '创建'),
            h('button', { class: 'btn ghost sm', onClick: cancelInlineCreateTag }, '取消'),
          )
        : h('div', { class: 'tag-pick-create', onClick: startInlineCreateTag },
            h('span', { class: 'tag-pick-create-plus' }, '+'),
            h('span', null, '新建标签'),
          ),
      h('div', { class: 'tag-picker-foot' },
        h('span', { class: 'spacer', style: { flex: 1 } }),
        h('button', { class: 'btn primary sm', onClick: closeTagPicker }, '完成'),
      ),
    );
  }

  // ---------- Asset View ----------
  function applyAssetFilter(list) {
    let out = list.filter(a => a.kind === State.assetTab);
    // 标签 chip 筛选
    if (State.assetTag && State.assetTag !== 'all') {
      out = out.filter(a => {
        const tags = getAssetTags(a);
        return tags.indexOf(State.assetTag) >= 0;
      });
    }
    // 来源 cascade 筛选
    const pick = State.assetSourcePick;
    if (pick) {
      if (pick.col === 'tool' || pick.col === 'canvas') {
        // pick.col 是 source（tool/canvas），pick.item 是 session 标识（s1/s2）
        out = out.filter(a => {
          if (a.source !== pick.col) return false;
          if (pick.item === pick.col) return true; // leaf 选了一级
          const sid = (a.sessionId || '').toString();
          if (pick.item === 's1') return /1$/.test(sid) || /-1$/.test(sid);
          if (pick.item === 's2') return /2$/.test(sid) || /-2$/.test(sid);
          return true;
        });
      } else if (pick.col === 'upload') {
        out = out.filter(a => /^a-up-/.test(String(a.id)) || a.tag === '#上传');
      }
    }
    // 搜索
    const q = (State.assetSearch || '').trim().toLowerCase();
    if (q) {
      out = out.filter(a => {
        const fields = [
          a.title || '',
          a.desc || '',
          a.prompt || '',
          (getAssetTags(a) || []).join(' '),
          a.fileName || '',
        ].join(' ').toLowerCase();
        return fields.indexOf(q) >= 0;
      });
    }
    return out;
  }

  function isAssetFilterActive() {
    return State.assetTag !== 'all'
      || !!State.assetSourcePick
      || !!(State.assetSearch && State.assetSearch.trim());
  }

  function clearAssetFilter() {
    State.assetTag = 'all';
    State.assetSourcePick = null;
    State.assetSearch = '';
    render();
  }

  function sortAssetsInGroup(arr) {
    const sort = State.assetSort || 'time-desc';
    const list = arr.slice();
    if (sort === 'time-desc') list.sort((a, b) => (b.id || 0) - (a.id || 0));
    else if (sort === 'time-asc') list.sort((a, b) => (a.id || 0) - (b.id || 0));
    else if (sort === 'duration') {
      const sec = (a) => {
        if (!a.duration) return 0;
        const p = String(a.duration).split(':').map(Number);
        return p.length === 1 ? p[0] : p[0] * 60 + (p[1] || 0);
      };
      list.sort((a, b) => sec(b) - sec(a));
    } else if (sort === 'name') {
      list.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'zh'));
    }
    return list;
  }

  function batchDeleteAssets() {
    const items = getSelectedAssets();
    if (items.length === 0) { showToast('未选择项'); return; }
    if (State.assetBatchDeleteConfirm) {
      const ids = new Set(State.selectedAssetIds);
      const before = D.assets.length;
      const kept = D.assets.filter(a => !ids.has(a.id));
      D.assets.length = 0;
      kept.forEach(a => D.assets.push(a));
      const removed = before - kept.length;
      State.assetBatchDeleteConfirm = false;
      exitSelectionMode();
      showToast('已删除 ' + removed + ' 项');
    } else {
      State.assetBatchDeleteConfirm = true;
      render();
      showToast('再点一次确认删除 ' + items.length + ' 项');
      setTimeout(() => {
        if (State.assetBatchDeleteConfirm) {
          State.assetBatchDeleteConfirm = false;
          render();
        }
      }, 3000);
    }
  }

  function viewAssets() {
    const tabs = [
      { key: 'video', label: '视频' },
      { key: 'image', label: '图片' },
      { key: 'doc',   label: '文档' },
    ];
    const projTags = currentProjectTags();
    const all = D.assets.filter(a => a.projectId === State.projectId);
    const tabAssets = all.filter(a => a.kind === State.assetTab);

    // 标签 count（基于 tab 内的资产）
    const tagCounts = {};
    tabAssets.forEach(a => {
      getAssetTags(a).forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; });
    });

    const filtered = applyAssetFilter(all);

    const activeTabLabel = tabs.find(x => x.key === State.assetTab).label;
    const pick = State.assetSourcePick;

    const sortLabels = {
      'time-desc': '时间倒序',
      'time-asc': '时间正序',
      'duration': '时长降序',
      'name': '名称',
    };

    const inSelection = State.selectionMode;
    const selCount = State.selectedAssetIds.length;

    const head = inSelection
      ? h('div', { class: 'asset-head selection' },
          h('div', { class: 'asset-tabs-row' },
            h('div', { class: 'sel-info' }, h('strong', null, '已选 ' + selCount + ' 项')),
            h('div', { class: 'asset-actions' },
              h('button', {
                class: 'btn sm danger' + (State.assetBatchDeleteConfirm ? ' confirming' : ''),
                onClick: batchDeleteAssets,
                disabled: selCount === 0,
              }, State.assetBatchDeleteConfirm ? '再点确认' : '删除'),
              h('button', {
                class: 'btn ghost sm',
                onClick: (e) => batchTag(e.currentTarget),
                disabled: selCount === 0,
              }, '标签'),
              h('button', {
                class: 'btn ghost sm',
                onClick: batchDownload,
                disabled: selCount === 0,
              }, '下载'),
              h('button', { class: 'btn ghost sm', onClick: exitSelectionMode }, '取消'),
            ),
          ),
        )
      : h('div', { class: 'asset-head' },
          h('div', { class: 'asset-tabs-row' },
            h('div', { class: 'asset-tabs' },
              ...tabs.map(t => h('span',
                { class: 'a-tab' + (State.assetTab === t.key ? ' on' : ''), onClick: () => { State.assetTab = t.key; updateAssetHash(); render(); } },
                t.label,
              )),
            ),
            h('div', { class: 'asset-actions' },
              h('input', {
                class: 'asset-search',
                type: 'text',
                placeholder: '搜索名称、标签、Prompt',
                value: State.assetSearch,
                onInput: (e) => { State.assetSearch = e.target.value; updateAssetHash(); render(); },
              }),
              h('div', { class: 'asset-sort-wrap' },
                h('button', {
                  class: 'btn ghost sm asset-sort-btn',
                  onClick: (e) => {
                    e.stopPropagation();
                    State.assetSortOpen = !State.assetSortOpen;
                    render();
                  },
                },
                  sortLabels[State.assetSort] || '时间倒序',
                  h('span', { class: 'caret', style: { marginLeft: '4px' } }, '▾'),
                ),
                State.assetSortOpen && h('div', { class: 'asset-sort-pop' },
                  ...Object.keys(sortLabels).map(k => h('div', {
                    class: 'asset-sort-item' + (State.assetSort === k ? ' on' : ''),
                    onClick: (e) => {
                      e.stopPropagation();
                      State.assetSort = k;
                      State.assetSortOpen = false;
                      updateAssetHash();
                      render();
                    },
                  }, sortLabels[k])),
                ),
              ),
              h('span', {
                class: 'btn ghost sm',
                onClick: () => openUploadModal(),
              },
                h('span', { class: 'ico-inline', html: ICO.upload }),
                ' 上传文件',
              ),
              h('span', { class: 'btn ghost sm', onClick: enterSelectionMode }, '批量操作'),
              h('span', {
                class: 'btn ghost sm',
                onClick: () => { State.tagsModalOpen = true; render(); },
              }, '标签管理'),
            ),
          ),
          h('div', { class: 'asset-chips-row' },
            // "所有 X / 来源 cascade"
            h('div', { class: 'asset-source-wrap' },
              h('span',
                {
                  class: 'a-chip a-chip-all' + (State.assetTag === 'all' && !pick ? ' on' : '') + (State.assetSourceOpen ? ' menu-open' : ''),
                  onClick: (e) => {
                    e.stopPropagation();
                    State.assetTag = 'all';
                    State.assetSourceOpen = !State.assetSourceOpen;
                    updateAssetHash();
                    render();
                  },
                },
                h('span', null, pick ? (pick.colLabel + ' / ' + pick.itemLabel) : ('所有' + activeTabLabel)),
                h('span', { class: 'caret' }, '▾'),
              ),
              State.assetSourceOpen && assetSourceCascade(),
            ),
            ...projTags.map(t => h('span',
              {
                class: 'a-chip' + (State.assetTag === t.name ? ' on' : ''),
                onClick: () => { State.assetTag = t.name; updateAssetHash(); render(); },
              },
              t.name,
              tagCounts[t.name] ? h('span', { class: 'a-chip-count' }, ' · ' + tagCounts[t.name]) : null,
            )),
          ),
        );

    // 空态
    let body;
    if (filtered.length === 0) {
      const filterActive = isAssetFilterActive();
      body = h('div', { class: 'asset-grid-page', style: { flex: 1, overflowY: 'auto' } },
        h('div', { class: 'empty-state empty-grid' },
          h('div', { class: 'empty-icon', html: filterActive ? ICO.filter : ICO.upload }),
          h('div', { class: 'empty-title' }, filterActive ? '没有匹配的资产' : ('还没有' + activeTabLabel)),
          h('div', { class: 'empty-sub' }, filterActive ? '换个关键词或清除筛选试试' : ('点击右上角『上传文件』或前往' + activeTabLabel + '创作页')),
          h('div', { style: { marginTop: '14px' } },
            filterActive
              ? h('button', { class: 'btn primary sm', onClick: clearAssetFilter }, '清除筛选')
              : h('button', { class: 'btn primary sm', onClick: () => openUploadModal() }, '上传文件'),
          ),
        ),
      );
    } else {
      body = h('div', { class: 'asset-grid-page', style: { flex: 1, overflowY: 'auto' } },
        ...renderAssetGroups(filtered),
      );
    }

    return h('div', { class: 'shell', style: { display: 'grid', gridTemplateColumns: '228px 1fr', height: '100vh' } },
      sidenav('assets'),
      h('div', { class: 'col-right' },
        head,
        body,
      ),
    );
  }

  // ---------- Template Library Views (Prompt + Skill) ----------
  function viewLibraryPage(opts) {
    const items = opts.listFn();
    return h('div', { class: 'shell', style: { display: 'grid', gridTemplateColumns: '228px 1fr', height: '100vh' } },
      sidenav(opts.activeKey),
      h('div', { class: 'col-right tpl-page' },
        h('div', { class: 'tpl-head' },
          h('div', { class: 'tpl-head-main' },
            h('h2', null, opts.headTitle),
            h('div', { class: 'tpl-subtitle' }, opts.headSubtitle),
          ),
          h('button',
            { class: 'tpl-head-action', onClick: () => openTplCreate(opts.kind) },
            h('span', { class: 'ico-inline', html: ICO.plus }),
            h('span', null, opts.headActionLabel || '新建'),
          ),
        ),
        h('div', { class: 'tpl-list' },
          items.length === 0
            ? h('div', { class: 'tpl-empty' },
                opts.kind === 'prompt'
                  ? '还没有提示词模板，点击右上角「新建」添加一个吧'
                  : '还没有自定义技能（含 ' + (D.builtinSkills || []).length + ' 个内置技能可直接使用）',
              )
            : opts.kind === 'skill'
              ? h('div', { class: 'skill-tiles' },
                  ...items.map(it => tplSkillTile(it)),
                )
              : h('div', { class: 'tpl-cards' },
                  ...items.map(it => tplCard(it, opts.kind)),
                ),
        ),
      ),
    );
  }

  function viewPrompts() {
    return viewLibraryPage({
      activeKey: 'prompts',
      headTitle: '我的提示词示例',
      headSubtitle: '管理用于图片、视频创作的提示词模板',
      listFn: () => State.userPrompts,
      headActionLabel: '新建',
      kind: 'prompt',
    });
  }

  function viewSkills() {
    return viewLibraryPage({
      activeKey: 'skills',
      headTitle: '我的技能',
      headSubtitle: '管理用于剧本拆解、分镜脚本等的技能模板',
      listFn: () => allSkills(),
      headActionLabel: '新建',
      kind: 'skill',
    });
  }

  function tplSkillTile(item) {
    const kind = 'skill';
    const builtin = !!item.builtin;
    const pendingDel = State.tplPendingDelete
      && State.tplPendingDelete.kind === kind
      && State.tplPendingDelete.id === item.id;

    const ts = item.createdAt || item.updatedAt;
    const sourceLabel = item.source === 'collect' ? '收藏于' : '创建于';
    const relTime = ts ? formatRelative(ts) : '';
    const absTime = ts ? formatAbsolute(ts) : '';

    const sessionPhone = (State.session && State.session.phone) || '';
    const phone = item.creatorPhone || sessionPhone;
    const isSelf = !!phone && phone === sessionPhone;
    const userLabel = isSelf ? '我' : (phone ? maskPhone(phone) : '匿名');

    const metaText = builtin
      ? '内置 · 系统提供'
      : (userLabel + ' · ' + sourceLabel + ' ' + (relTime || '刚刚'));

    function stop(e) { e.stopPropagation(); }

    return h('div', {
      class: 'skill-tile' + (builtin ? ' builtin' : '') + (pendingDel ? ' deleting' : ''),
      onClick: () => openTplDetail(kind, item.id),
      title: '点击查看详情',
    },
      h('div', { class: 'skill-tile-icon', html: ICO.sparkles }),
      h('div', { class: 'skill-tile-info' },
        h('div', { class: 'skill-tile-title' }, item.name || '未命名'),
        h('div', { class: 'skill-tile-meta', title: builtin ? '内置技能' : absTime }, metaText),
      ),
      builtin && h('span', { class: 'skill-tile-builtin' }, '内置'),
      !builtin && h('div', { class: 'skill-tile-actions', onClick: stop },
        h('button', {
          class: 'skill-tile-act',
          title: '编辑',
          onClick: (e) => { stop(e); openTplEdit(kind, item); },
          html: ICO.edit,
        }),
        h('button', {
          class: 'skill-tile-act danger',
          title: '删除',
          onClick: (e) => { stop(e); startDeleteTpl(kind, item.id); },
          html: ICO.trash,
        }),
      ),
    );
  }

  function tplCard(item, kind) {
    const builtin = !!item.builtin;
    const pendingDel = State.tplPendingDelete
      && State.tplPendingDelete.kind === kind
      && State.tplPendingDelete.id === item.id;

    // tplCard 现在只服务于提示词库（技能库走 tplSkillTile）
    const isPrompt = kind === 'prompt';
    const thumbSrc = isPrompt ? (item.imageSrc || item.videoSrc) : null;
    const isVideo = isPrompt && !!item.videoSrc;
    const initial = (item.name || '').trim().charAt(0) || '·';

    const ts = item.createdAt || item.updatedAt;
    const sourceLabel = item.source === 'collect' ? '收藏于' : '创建于';
    const relTime = ts ? formatRelative(ts) : '';
    const absTime = ts ? formatAbsolute(ts) : '';

    const sessionPhone = (State.session && State.session.phone) || '';
    const phone = item.creatorPhone || sessionPhone;
    const isSelf = !!phone && phone === sessionPhone;
    const userLabel = isSelf ? '我' : (phone ? maskPhone(phone) : '匿名');
    const avatarChar = isSelf ? '我' : (phone ? phone.slice(0, 1) : '·');

    function stop(e) { e.stopPropagation(); }

    // Thumb 区渲染：图/视频/fallback（提示词库专用）
    const thumbInner = thumbSrc
      ? h('img', { src: thumbSrc, alt: '', loading: 'lazy' })
      : h('div', { class: 'tpl-card-thumb-fallback' },
          h('span', { class: 'tpl-card-thumb-ico', html: ICO.sparkles }),
          h('span', { class: 'tpl-card-thumb-letter' }, initial),
        );

    // Meta 区分支：内置 → "内置 · 系统提供"（sparkles avatar）；其他 → 用户 + 时间
    const metaTitle = builtin ? '内置技能' : absTime;

    return h('div', {
      class: 'tpl-card' + (builtin ? ' builtin' : '') + (pendingDel ? ' deleting' : ''),
      onClick: pendingDel ? null : () => openTplDetail(kind, item.id),
      title: pendingDel ? '' : '点击查看详情',
    },
      h('div', { class: 'tpl-card-thumb' + (isVideo ? ' video' : '') + (thumbSrc ? '' : ' empty') },
        thumbInner,
        isVideo && h('span', { class: 'tpl-card-play', html: ICO.play }),
        builtin && h('span', { class: 'tpl-card-builtin' }, '内置'),
        !builtin && h('div', { class: 'tpl-card-actions', onClick: stop },
          h('button', {
            class: 'tpl-card-act',
            title: '编辑',
            onClick: (e) => { stop(e); openTplEdit(kind, item); },
            html: ICO.edit,
          }),
          h('button', {
            class: 'tpl-card-act danger',
            title: '删除',
            onClick: (e) => { stop(e); startDeleteTpl(kind, item.id); },
            html: ICO.trash,
          }),
        ),
      ),
      h('div', { class: 'tpl-card-body' },
        h('div', { class: 'tpl-card-name' }, item.name || '未命名'),
        builtin
          ? h('div', { class: 'tpl-card-meta', title: metaTitle },
              h('span', { class: 'tpl-card-avatar builtin', html: ICO.sparkles }),
              h('span', { class: 'tpl-card-meta-text' }, '内置 · 系统提供'),
            )
          : h('div', { class: 'tpl-card-meta', title: metaTitle },
              h('span', { class: 'tpl-card-avatar' }, avatarChar),
              h('span', { class: 'tpl-card-meta-text' },
                userLabel,
                h('span', { class: 'tpl-card-meta-sep' }, ' · '),
                sourceLabel + ' ' + relTime,
              ),
            ),
      ),
      pendingDel && h('div', { class: 'tpl-card-confirm', onClick: stop },
        h('div', { class: 'tpl-card-confirm-text' }, '确认删除？'),
        h('div', { class: 'tpl-card-confirm-ops' },
          h('button', { class: 'btn ghost sm', onClick: (e) => { stop(e); cancelDeleteTpl(); } }, '取消'),
          h('button', { class: 'btn danger sm', onClick: (e) => { stop(e); confirmDeleteTpl(kind, item.id); } }, '删除'),
        ),
      ),
    );
  }

  // Group assets by date and render with date headers
  function renderAssetGroups(list) {
    if (list.length === 0) {
      return [h('div', { class: 'subtle center', style: { padding: '60px 24px', fontSize: '13px' } },
        '暂无资产')];
    }
    const groups = {};
    const order = [];
    list.forEach(a => {
      const date = a.date || '其他';
      if (!groups[date]) { groups[date] = []; order.push(date); }
      groups[date].push(a);
    });
    const isDocs = State.assetTab === 'doc';
    return order.map(date => h('div', { class: 'asset-date-group' },
      h('div', { class: 'asset-date-head' }, date),
      h('div', { class: 'asset-grid-inner' + (isDocs ? ' docs' : '') },
        ...sortAssetsInGroup(groups[date]).map(a => assetTile(a)),
      ),
    ));
  }

  function assetTile(a) {
    // 资产页用 mediaTile（统一样式 + 全功能 hover/选择/详情）
    if (a.kind === 'doc') return docAssetTile(a);
    return mediaTile(a, a.kind);
  }

  function docAssetTile(a) {
    const tags = getAssetTags(a);
    const inSelection = State.selectionMode;
    const isSelected = inSelection && State.selectedAssetIds.indexOf(a.id) >= 0;
    const pendingDel = State.assetSinglePendingDelete === a.id;
    function stop(e) { e.stopPropagation(); }
    return h('div', {
      class: 'asset-tile doc-tile-h' + (isSelected ? ' selected' : '') + (pendingDel ? ' deleting' : ''),
      onClick: inSelection ? (() => toggleSelectAsset(a.id)) : (() => openAssetDetailFromAsset(a)),
      title: inSelection ? '' : '点击查看详情',
    },
      inSelection && h('span', { class: 'tile-select-check' + (isSelected ? ' on' : '') }, isSelected ? '✓' : ''),
      h('div', { class: 'doc-icon-box', html: ICO.docFile }),
      h('div', { class: 'doc-info-col' },
        h('div', { class: 'doc-title' }, a.title || ('文档 #' + a.id)),
        h('div', { class: 'doc-updated' }, formatAssetDateTime(a)),
        tags.length > 0 && h('div', { class: 'doc-tags-row' },
          ...tags.map(t => h('span', { class: 'doc-tag-chip' }, t)),
        ),
      ),
      !inSelection && h('div', { class: 'doc-tile-actions' },
        h('button', {
          class: 'doc-tile-act-btn',
          title: '选择标签',
          html: ICO.tag,
          onClick: (e) => { stop(e); openTagPicker(e.currentTarget, 'asset', a.id); },
        }),
        h('button', {
          class: 'doc-tile-act-btn',
          title: '下载文件',
          html: ICO.download,
          onClick: (e) => { stop(e); downloadDoc({ title: a.title || ('文档-' + a.id), prompt: a.desc || '' }); },
        }),
        h('button', {
          class: 'doc-tile-act-btn' + (pendingDel ? ' danger-on' : ''),
          title: pendingDel ? '再点确认删除' : '删除',
          html: ICO.trash,
          onClick: (e) => deleteSingleAsset(a, e),
        }),
      ),
    );
  }

  function secondsLabel(d) {
    if (!d) return '';
    const parts = String(d).split(':').map(Number);
    if (parts.length === 1) return parts[0] + '秒';
    if (parts.length === 2) return (parts[0] * 60 + parts[1]) + '秒';
    return d;
  }

  // ---------- Tags Modal (CRUD) ----------
  function tagsModal() {
    if (!State.tagsModalOpen) return null;
    const list = currentProjectTags();
    const proj = currentProject();

    return h('div', {
      class: 'tags-modal-mask',
      onClick: (e) => { if (e.target.classList.contains('tags-modal-mask')) closeTagsModal(); },
    },
      h('div', { class: 'tags-modal' },
        h('div', { class: 'tags-modal-head' },
          h('div', null,
            h('h3', null, '标签管理'),
            h('div', { class: 'subtle', style: { fontSize: '12px', marginTop: '4px' } }, proj.name, ' · 共 ', String(list.length), ' 个标签'),
          ),
          h('button', { class: 'tags-close', onClick: closeTagsModal, title: '关闭' }, '✕'),
        ),
        h('div', { class: 'tags-modal-body' },
          h('div', { class: 'tags-actions' },
            h('button', {
              class: 'btn primary sm',
              onClick: startCreateTag,
            }, '＋ 新建标签'),
            h('span', { class: 'subtle', style: { fontSize: '12px' } }, '使用数表示当前项目内引用该标签的资产数量'),
          ),
          h('div', { class: 'tags-list' },
            // Creating row at top
            State.tagCreating && h('div', { class: 'tag-row creating' },
              h('input', {
                class: 'tag-input',
                value: State.tagDraftName,
                placeholder: '例如：#角色卡',
                autofocus: true,
                onInput: (e) => { State.tagDraftName = e.target.value; },
                onKeydown: (e) => {
                  if (e.key === 'Enter') commitCreateTag();
                  else if (e.key === 'Escape') { State.tagCreating = false; State.tagDraftName = ''; render(); }
                },
              }),
              h('span', { class: 'tag-ops' },
                h('button', { class: 'btn primary sm', onClick: commitCreateTag }, '创建'),
                h('button', { class: 'btn ghost sm', onClick: () => { State.tagCreating = false; State.tagDraftName = ''; render(); } }, '取消'),
              ),
            ),
            ...list.map(t => tagRow(t)),
            list.length === 0 && !State.tagCreating && h('div', { class: 'tags-empty' },
              h('div', { class: 'subtle', style: { padding: '40px 0', textAlign: 'center' } }, '暂无标签，点击「＋ 新建标签」开始'),
            ),
          ),
        ),
      ),
    );
  }

  function tagRow(t) {
    const isEditing = State.tagEditingId === t.id;
    const isPendingDelete = State.tagPendingDelete === t.id;
    const editSVG = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M11.5 2.5l2 2-8 8-3 1 1-3z"/><path d="M10 4l2 2"/></svg>';
    const trashSVG = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 4h11"/><path d="M6 4V2.5h4V4"/><path d="M3.5 4l.7 9.5h7.6L12.5 4"/><path d="M7 7v4M9 7v4"/></svg>';

    if (isEditing) {
      return h('div', { class: 'tag-row editing' },
        h('input', {
          class: 'tag-input',
          value: State.tagDraftName,
          autofocus: true,
          onInput: (e) => { State.tagDraftName = e.target.value; },
          onKeydown: (e) => {
            if (e.key === 'Enter') commitEditTag();
            else if (e.key === 'Escape') { State.tagEditingId = null; State.tagDraftName = ''; render(); }
          },
        }),
        h('span', { class: 'tag-count' }, String(t.count), ' 资产'),
        h('span', { class: 'tag-ops' },
          h('button', { class: 'btn primary sm', onClick: commitEditTag }, '确定'),
          h('button', { class: 'btn ghost sm', onClick: () => { State.tagEditingId = null; State.tagDraftName = ''; render(); } }, '取消'),
        ),
      );
    }

    if (isPendingDelete) {
      return h('div', { class: 'tag-row deleting' },
        h('span', { class: 'tag-name' }, t.name),
        h('span', { class: 'tag-confirm-text' }, '确认删除？该操作不可撤销'),
        h('span', { class: 'tag-ops' },
          h('button', { class: 'btn danger sm', onClick: () => confirmDeleteTag(t) }, '确认删除'),
          h('button', { class: 'btn ghost sm', onClick: () => { State.tagPendingDelete = null; render(); } }, '取消'),
        ),
      );
    }

    return h('div', { class: 'tag-row' },
      h('span', { class: 'tag-name' }, t.name),
      h('span', { class: 'tag-count' }, String(t.count), ' 资产'),
      h('span', { class: 'tag-ops' },
        h('button', { class: 'icon-btn', title: '重命名', html: editSVG, onClick: () => startEditTag(t) }),
        h('button', { class: 'icon-btn danger', title: '删除', html: trashSVG, onClick: () => startDeleteTag(t) }),
      ),
    );
  }

  // ---------- Template Editor Modal (shared by Prompt + Skill libraries) ----------
  function tplEditorModal() {
    if (!State.tplModalOpen) return null;
    const isPrompt = State.tplModalKind === 'prompt';
    const titlePrefix = State.tplModalMode === 'create' ? '新建' : '编辑';
    const kindLabel = tplKindLabel(State.tplModalKind);

    return h('div', {
      class: 'tags-modal-mask',
      onClick: (e) => { if (e.target.classList.contains('tags-modal-mask')) closeTplModal(); },
    },
      h('div', { class: 'tags-modal tpl-modal' },
        h('div', { class: 'tags-modal-head' },
          h('div', null,
            h('h3', null, titlePrefix + kindLabel),
            h('div', { class: 'subtle', style: { fontSize: '12px', marginTop: '4px' } },
              isPrompt
                ? '保存常用提示词，创作时可在图片/视频对话框「+ 引用提示词」中调用'
                : '管理用于不同任务的技能模板，发送时拼接到系统提示词',
            ),
          ),
          h('button', { class: 'tags-close', onClick: closeTplModal, title: '关闭' }, '✕'),
        ),
        h('div', { class: 'tags-modal-body' },
          h('div', { class: 'tpl-field' },
            h('label', null, '名称'),
            h('input', {
              type: 'text',
              value: State.tplDraftName,
              placeholder: isPrompt ? '例如：氛围空镜补拍' : '例如：剧本节奏分析',
              onInput: (e) => { State.tplDraftName = e.target.value; },
              onKeydown: (e) => { if (e.key === 'Enter') commitTpl(); },
              autofocus: true,
              'data-tpl-autofocus': '1',
            }),
          ),
          !isPrompt && h('div', { class: 'tpl-field' },
            h('label', null, '描述（可选）'),
            h('input', {
              type: 'text',
              value: State.tplDraftDesc,
              placeholder: '一句话简介，例如：把剧本拆为镜头节奏',
              onInput: (e) => { State.tplDraftDesc = e.target.value; },
              onKeydown: (e) => { if (e.key === 'Enter') commitTpl(); },
            }),
          ),
          h('div', { class: 'tpl-field' },
            h('label', null, isPrompt ? '提示词内容' : '技能内容（Markdown，发送时作为 system prompt）'),
            h('textarea', {
              rows: 12,
              maxlength: 5000,
              placeholder: isPrompt
                ? '输入你想保存的提示词文本……'
                : '# 角色\n你是一位……\n\n# 任务\n……\n\n# 输出要求\n- ……',
              onInput: (e) => { State.tplDraftContent = e.target.value; },
            }, State.tplDraftContent || ''),
          ),
          isPrompt && h('div', { class: 'tpl-field' },
            h('label', null,
              '关联示例',
              h('span', { class: 'tpl-field-hint' }, '（可选，可上传该提示词对应生成的图片或视频）'),
            ),
            State.tplDraftMediaSrc
              ? h('div', { class: 'tpl-media-preview' + (State.tplDraftMediaType === 'video' ? ' video' : '') },
                  State.tplDraftMediaType === 'video'
                    ? h('video', { src: State.tplDraftMediaSrc, muted: true, playsinline: true })
                    : h('img', { src: State.tplDraftMediaSrc, alt: '' }),
                  State.tplDraftMediaType === 'video' && h('span', { class: 'tpl-media-play', html: ICO.play }),
                  h('button', {
                    class: 'tpl-media-remove',
                    title: '移除',
                    onClick: clearTplMedia,
                  }, '✕'),
                )
              : h('label', { class: 'tpl-media-drop' },
                  h('span', { class: 'tpl-media-drop-ico', html: ICO.upload }),
                  h('span', { class: 'tpl-media-drop-text' }, '点击上传图片或视频'),
                  h('input', {
                    type: 'file',
                    accept: 'image/*,video/*',
                    style: { display: 'none' },
                    onChange: (e) => {
                      const f = e.target.files && e.target.files[0];
                      if (f) onTplMediaPick(f);
                      e.target.value = '';
                    },
                  }),
                ),
          ),
        ),
        h('div', { class: 'tpl-modal-foot' },
          h('button', { class: 'btn ghost sm', onClick: closeTplModal }, '取消'),
          h('button', { class: 'btn primary sm', onClick: commitTpl }, '保存'),
        ),
      ),
    );
  }

  // ---------- Favorite Collect Modal (collecting result as prompt example) ----------
  function favoriteCollectModal() {
    if (!State.favCollectOpen) return null;
    const payload = State.favCollectPayload || {};
    const hasMedia = !!(payload.imageSrc || payload.videoSrc);
    const isVideo = !!payload.videoSrc;

    return h('div', {
      class: 'tags-modal-mask',
      onClick: (e) => { if (e.target.classList.contains('tags-modal-mask')) closeFavCollect(); },
    },
      h('div', { class: 'tags-modal fav-collect-modal' },
        h('div', { class: 'tags-modal-head' },
          h('div', null,
            h('h3', null, '收藏到提示词库'),
            h('div', { class: 'subtle', style: { fontSize: '12px', marginTop: '4px' } },
              '保存到「提示词库」，下次创作时可在「+ 引用提示词」中复用',
            ),
          ),
          h('button', { class: 'tags-close', onClick: closeFavCollect, title: '关闭' }, '✕'),
        ),
        h('div', { class: 'tags-modal-body' },
          h('div', { class: 'tpl-field' },
            h('label', null, '名称'),
            h('input', {
              type: 'text',
              value: State.favCollectDraftName,
              placeholder: '为这个提示词起个名字',
              onInput: (e) => { State.favCollectDraftName = e.target.value; },
              onKeydown: (e) => { if (e.key === 'Enter') commitFavCollect(); },
            }),
          ),
          h('div', { class: 'fav-preview' },
            hasMedia && h('div', { class: 'fav-preview-thumb' + (isVideo ? ' video' : '') },
              h('img', { src: payload.imageSrc || payload.videoSrc, alt: '' }),
              isVideo && h('span', { class: 'fav-preview-play', html: ICO.play }),
            ),
            h('div', { class: 'fav-preview-text' },
              h('div', { class: 'fav-preview-label' }, '提示词内容'),
              h('div', { class: 'fav-preview-content' }, payload.content || '（空）'),
            ),
          ),
        ),
        h('div', { class: 'tpl-modal-foot' },
          h('button', { class: 'btn ghost sm', onClick: closeFavCollect }, '取消'),
          h('button', { class: 'btn primary sm', onClick: commitFavCollect }, '保存'),
        ),
      ),
    );
  }

  // ---------- Template Detail Modal (read-only viewer) ----------
  function tplDetailModal() {
    if (!State.tplDetailOpen) return null;
    const item = getTplDetailItem();
    if (!item) return null;
    const isPrompt = State.tplDetailKind === 'prompt';
    const isBuiltin = !!item.builtin;
    const thumbSrc = isPrompt ? (item.imageSrc || item.videoSrc) : null;
    const isVideo = isPrompt && !!item.videoSrc;

    function onEdit() {
      State.tplPendingDelete = null;
      closeTplDetail();
      openTplEdit(State.tplDetailKind, item);
    }
    function onDelete() {
      // 不关 modal，仅设置 pending → footer 切到确认态
      startDeleteTpl(State.tplDetailKind, item.id);
    }
    const pendingHere = State.tplPendingDelete
      && State.tplPendingDelete.kind === State.tplDetailKind
      && State.tplPendingDelete.id === item.id;

    return h('div', {
      class: 'tags-modal-mask',
      onClick: (e) => { if (e.target.classList.contains('tags-modal-mask')) closeTplDetail(); },
    },
      h('div', { class: 'tags-modal tpl-detail-modal' },
        h('div', { class: 'tags-modal-head' },
          h('div', { class: 'tpl-detail-titlewrap' },
            h('h3', null, item.name),
            isBuiltin && h('span', { class: 'tpl-builtin' }, '内置'),
          ),
          h('button', { class: 'tags-close', onClick: closeTplDetail, title: '关闭' }, '✕'),
        ),
        h('div', { class: 'tags-modal-body tpl-detail-body' },
          // Subtitle / meta
          isPrompt
            ? h('div', { class: 'tpl-detail-meta' },
                item.createdAt && h('span', null, '收藏于 ', new Date(item.createdAt).toLocaleString()),
                item.requestMeta && item.requestMeta.model && h('span', null, ' · ', item.requestMeta.model),
              )
            : item.description && h('div', { class: 'tpl-detail-meta' }, item.description),
          // Content section
          h('div', { class: 'tpl-detail-section' },
            h('div', { class: 'tpl-detail-label' }, isPrompt ? 'prompt 文本' : '完整内容'),
            h('pre', { class: 'tpl-detail-content' }, item.content || '（无内容）'),
          ),
          // Linked asset (prompt only)
          isPrompt && h('div', { class: 'tpl-detail-section' },
            h('div', { class: 'tpl-detail-label' }, '关联产出'),
            thumbSrc
              ? h('div', {
                  class: 'tpl-detail-thumb' + (isVideo ? ' video' : ''),
                  title: '点击查看大图详情',
                  onClick: () => {
                    openAssetDetail({
                      type: isVideo ? 'video' : 'image',
                      src: thumbSrc,
                      prompt: item.content,
                      meta: item.requestMeta || null,
                      createdAt: item.createdAt,
                    });
                  },
                },
                  h('img', { src: thumbSrc, alt: '' }),
                  isVideo && h('span', { class: 'tpl-detail-thumb-play', html: ICO.play }),
                )
              : h('div', { class: 'tpl-detail-empty' }, '无关联产出（手动创建的提示词）'),
          ),
        ),
        h('div', { class: 'tpl-modal-foot' + (pendingHere ? ' confirming' : '') },
          pendingHere
            ? [
                h('span', { class: 'danger-warn' }, '⚠ 确认删除？此操作不可撤销'),
                h('span', { class: 'spacer', style: { flex: 1 } }),
                h('button', { class: 'btn ghost sm', onClick: cancelDeleteTpl }, '取消'),
                h('button', {
                  class: 'btn danger sm',
                  onClick: () => confirmDeleteTpl(State.tplDetailKind, item.id),
                }, '确认删除'),
              ]
            : [
                !isBuiltin && h('button', { class: 'btn ghost sm', onClick: onEdit }, '编辑'),
                !isBuiltin && h('button', { class: 'btn ghost sm danger', onClick: onDelete }, '删除'),
                h('span', { class: 'spacer', style: { flex: 1 } }),
                h('button', { class: 'btn primary sm', onClick: closeTplDetail }, '关闭'),
              ],
        ),
      ),
    );
  }

  // ---------- Asset Detail Modal (large image/video + meta) ----------
  function assetDetailModal() {
    if (!State.assetDetailOpen) return null;
    const p = State.assetDetailPayload || {};
    const isVideo = p.type === 'video';
    const isDoc = p.type === 'doc';
    const meta = p.meta || {};

    const metaParts = [];
    if (meta.model)      metaParts.push(['模型', meta.model]);
    if (meta.ratio)      metaParts.push(['比例', meta.ratio]);
    if (meta.resolution) metaParts.push(['分辨率', meta.resolution]);
    if (isVideo && meta.duration) metaParts.push(['秒数', meta.duration]);
    if (meta.version)    metaParts.push(['版本', meta.version]);
    if (meta.note)       metaParts.push(['备注', meta.note]);
    if (p.createdAt)     metaParts.push(['生成时间', new Date(p.createdAt).toLocaleString()]);

    return h('div', {
      class: 'tags-modal-mask asset-detail-mask',
      onClick: (e) => { if (e.target.classList.contains('asset-detail-mask') || e.target.classList.contains('tags-modal-mask')) closeAssetDetail(); },
    },
      h('div', { class: 'tags-modal asset-detail-modal' },
        h('div', { class: 'tags-modal-head' },
          h('h3', null, isDoc ? (p.title || '文档详情') : '资产详情'),
          h('button', { class: 'tags-close', onClick: closeAssetDetail, title: '关闭' }, '✕'),
        ),
        h('div', { class: 'tags-modal-body asset-detail-body' },
          isDoc
            ? h('div', { class: 'asset-detail-doc' },
                h('span', { class: 'asset-detail-doc-icon', html: ICO.docFile }),
                h('div', { class: 'asset-detail-doc-title' }, p.title || '未命名文档'),
              )
            : h('div', { class: 'asset-detail-media' + (isVideo ? ' video' : '') },
                p.src && h('img', { src: p.src, alt: '' }),
                isVideo && h('span', { class: 'asset-detail-play', html: ICO.play }),
              ),
          p.prompt && h('div', { class: 'tpl-detail-section' },
            h('div', { class: 'tpl-detail-label' }, isDoc ? '正文内容' : '生成 prompt'),
            h('pre', { class: 'tpl-detail-content' }, p.prompt),
          ),
          metaParts.length > 0 && h('div', { class: 'tpl-detail-section' },
            h('div', { class: 'tpl-detail-label' }, '元数据'),
            h('div', { class: 'asset-detail-meta' },
              ...metaParts.map(([k, v]) => h('div', { class: 'asset-detail-meta-row' },
                h('span', { class: 'k' }, k),
                h('span', { class: 'v' }, v),
              )),
            ),
          ),
        ),
        h('div', { class: 'tpl-modal-foot' },
          h('span', { class: 'spacer', style: { flex: 1 } }),
          h('button', { class: 'btn primary sm', onClick: closeAssetDetail }, '关闭'),
        ),
      ),
    );
  }

  // ---------- Create Project Modal (small input dialog) ----------
  function createProjectModal() {
    if (!State.createProjectModalOpen) return null;
    return h('div', {
      class: 'tags-modal-mask',
      onClick: (e) => { if (e.target.classList.contains('tags-modal-mask')) closeCreateProject(); },
    },
      h('div', { class: 'tags-modal create-project-modal' },
        h('div', { class: 'tags-modal-head' },
          h('div', null,
            h('h3', null, '创建新项目'),
            h('div', { class: 'subtle', style: { fontSize: '12px', marginTop: '4px' } },
              '创建后跳转到项目资产开始你的创作',
            ),
          ),
          h('button', { class: 'tags-close', onClick: closeCreateProject, title: '关闭' }, '✕'),
        ),
        h('div', { class: 'tags-modal-body' },
          h('div', { class: 'tpl-field' },
            h('label', null, '项目名称'),
            h('input', {
              type: 'text',
              value: State.createProjectDraftName,
              placeholder: '例如：新短剧 · 第二季',
              onInput: (e) => { State.createProjectDraftName = e.target.value; },
              onKeydown: (e) => {
                if (e.key === 'Enter') { e.preventDefault(); commitCreateProject(); }
              },
            }),
          ),
        ),
        h('div', { class: 'tpl-modal-foot' },
          h('button', { class: 'btn ghost sm', onClick: closeCreateProject }, '取消'),
          h('button', { class: 'btn primary sm', onClick: commitCreateProject }, '创建'),
        ),
      ),
    );
  }

  // ---------- Member Quota Modal (invite + edit) ----------
  function memberQuotaModal() {
    if (!State.memberQuotaModalOpen) return null;
    const isInvite = State.memberQuotaMode === 'invite';
    const t = State.memberQuotaDraftType;

    function selType(next) { State.memberQuotaDraftType = next; render(); }

    const types = [
      { key: 'unlimited', label: '无额度限制', sub: '不限制成员消耗', ico: ICO.infinity },
      { key: 'period',    label: '周期额度',   sub: '周期内可重置', ico: ICO.refreshCw },
      { key: 'fixed',     label: '固定额度',   sub: '一次性总额', ico: ICO.lock },
    ];

    return h('div', {
      class: 'tags-modal-mask',
      onClick: (e) => { if (e.target.classList.contains('tags-modal-mask')) closeMemberQuotaModal(); },
    },
      h('div', { class: 'tags-modal member-quota-modal' },
        h('div', { class: 'tags-modal-head' },
          h('div', null,
            h('h3', null, isInvite ? '邀请成员' : '调整额度'),
            h('div', { class: 'subtle', style: { fontSize: '12px', marginTop: '4px' } },
              isInvite ? '成员将共享你的积分用于创作' : '设置成员的可用额度类型',
            ),
          ),
          h('button', { class: 'tags-close', onClick: closeMemberQuotaModal, title: '关闭' }, '✕'),
        ),
        h('div', { class: 'tags-modal-body' },
          isInvite && h('div', { class: 'tpl-field' },
            h('label', null, '手机号'),
            h('input', {
              type: 'tel',
              value: State.memberQuotaDraftPhone,
              placeholder: '11 位手机号',
              maxlength: 11,
              onInput: (e) => { State.memberQuotaDraftPhone = e.target.value.replace(/[^0-9]/g, ''); },
            }),
          ),
          h('div', { class: 'tpl-field' },
            h('label', null, '积分类型'),
            h('div', { class: 'member-quota-type-row' },
              ...types.map(opt => h('div', {
                class: 'member-quota-type' + (t === opt.key ? ' on' : ''),
                onClick: () => selType(opt.key),
              },
                h('span', { class: 'member-quota-type-ico', html: opt.ico }),
                h('span', { class: 'member-quota-type-label' }, opt.label),
                h('span', { class: 'member-quota-type-sub' }, opt.sub),
              )),
            ),
          ),
          t === 'period' && h('div', { class: 'member-quota-row' },
            h('div', { class: 'tpl-field' },
              h('label', null, '恢复周期'),
              h('select', {
                value: State.memberQuotaDraftPeriod,
                onChange: (e) => { State.memberQuotaDraftPeriod = e.target.value; render(); },
              },
                h('option', { value: 'daily' }, '每日'),
                h('option', { value: 'weekly' }, '每周'),
                h('option', { value: 'monthly' }, '每月'),
              ),
            ),
            h('div', { class: 'tpl-field' },
              h('label', null, '单期额度（积分）'),
              h('input', {
                type: 'number',
                value: State.memberQuotaDraftAmount,
                min: 1,
                onInput: (e) => { State.memberQuotaDraftAmount = e.target.value; },
              }),
            ),
          ),
          t === 'fixed' && h('div', { class: 'tpl-field' },
            h('label', null, '总额度（积分）'),
            h('input', {
              type: 'number',
              value: State.memberQuotaDraftAmount,
              min: 1,
              onInput: (e) => { State.memberQuotaDraftAmount = e.target.value; },
            }),
          ),
          t === 'unlimited' && h('div', { class: 'subtle', style: { fontSize: '12.5px', padding: '8px 0' } },
            '成员将无额度限制地使用你的积分',
          ),
        ),
        h('div', { class: 'tpl-modal-foot' },
          h('button', { class: 'btn ghost sm', onClick: closeMemberQuotaModal }, '取消'),
          h('button', { class: 'btn primary sm', onClick: commitMemberQuota },
            isInvite ? '发送邀请' : '保存',
          ),
        ),
      ),
    );
  }

  // ---------- Usage Detail Modal ----------
  function usageDetailModal() {
    if (!State.usageDetailOpen) return null;
    const u = State.usageDetailPayload || {};
    const isOwner = u.role === 'owner';
    const masked = u.memberPhone ? maskPhone(u.memberPhone) : '匿名';
    const rel = formatRelative(u.when);
    const abs = formatAbsolute(u.when);
    const refAsset = u.refAssetId ? (D.assets || []).find(a => a.id === u.refAssetId) : null;

    return h('div', {
      class: 'tags-modal-mask',
      onClick: (e) => { if (e.target.classList.contains('tags-modal-mask')) closeUsageDetail(); },
    },
      h('div', { class: 'tags-modal usage-detail-modal' },
        h('div', { class: 'tags-modal-head' },
          h('div', null,
            h('h3', null, '消耗详情'),
            h('div', { class: 'subtle', style: { fontSize: '12px', marginTop: '4px' } },
              '−' + formatCostShort(u.cost) + ' 积分 · ' + abs,
            ),
          ),
          h('button', { class: 'tags-close', onClick: closeUsageDetail, title: '关闭' }, '✕'),
        ),
        h('div', { class: 'tags-modal-body' },
          // 成员
          h('div', { class: 'usage-detail-section' },
            h('div', { class: 'usage-detail-label' }, '成员'),
            h('div', { class: 'usage-detail-member' },
              h('span', { class: 'member-avatar' }, isOwner ? 'O' : (u.memberPhone || '·').slice(-1)),
              h('span', { class: 'usage-detail-member-name' }, isOwner ? '管理员' : masked),
              h('span', { class: 'member-role' + (isOwner ? ' owner' : '') }, isOwner ? '管理员' : '成员'),
            ),
          ),
          // 时间
          h('div', { class: 'usage-detail-section' },
            h('div', { class: 'usage-detail-label' }, '时间'),
            h('div', { class: 'usage-detail-text' }, rel + '（' + abs + '）'),
          ),
          // 类型 + 模型 + 成本
          h('div', { class: 'usage-detail-section usage-detail-grid' },
            h('div', null,
              h('div', { class: 'usage-detail-label' }, '类型'),
              h('div', { class: 'usage-detail-text' }, actionLabel(u.action)),
            ),
            h('div', null,
              h('div', { class: 'usage-detail-label' }, '模型'),
              h('div', { class: 'usage-detail-text mono' }, u.model || '—'),
            ),
            h('div', null,
              h('div', { class: 'usage-detail-label' }, '成本'),
              h('div', { class: 'usage-detail-text mono' }, '−' + formatCostShort(u.cost) + ' 积分'),
            ),
          ),
          // prompt
          u.promptExcerpt && h('div', { class: 'usage-detail-section' },
            h('div', { class: 'usage-detail-label' }, 'Prompt'),
            h('pre', { class: 'tpl-detail-content' }, u.promptExcerpt),
          ),
          // 关联资产
          refAsset && h('div', { class: 'usage-detail-section' },
            h('div', { class: 'usage-detail-label' }, '关联资产'),
            h('div', {
              class: 'usage-detail-asset',
              onClick: () => {
                closeUsageDetail();
                openAssetDetail({
                  type: refAsset.kind,
                  src: refAsset.src,
                  title: refAsset.title || null,
                  prompt: refAsset.prompt || refAsset.desc || u.promptExcerpt || '',
                  meta: { ratio: refAsset.aspect, duration: refAsset.duration, model: u.model },
                  createdAt: u.when,
                });
              },
            },
              refAsset.src && h('img', { src: refAsset.src, alt: '' }),
              h('span', null, '查看资产 →'),
            ),
          ),
        ),
        h('div', { class: 'tpl-modal-foot' },
          h('span', { class: 'spacer', style: { flex: 1 } }),
          h('button', { class: 'btn primary sm', onClick: closeUsageDetail }, '关闭'),
        ),
      ),
    );
  }

  // ---------- Usage Distribution Modal (full member list) ----------
  function usageDistModal() {
    if (!State.usageDistModalOpen) return null;
    const pid = State.usageDistModalPid;
    if (!pid) return null;
    const project = (D.projects || []).find(p => p.id === pid);
    if (!project) return null;
    const allLogs = getProjectUsage(pid);
    const filtered = applyUsageFilter(allLogs);
    const stats = usageStats(filtered);
    const ownerPhone = project.ownerPhone || (State.session && State.session.phone) || '';

    return h('div', {
      class: 'tags-modal-mask',
      onClick: (e) => { if (e.target.classList.contains('tags-modal-mask')) closeUsageDistModal(); },
    },
      h('div', { class: 'tags-modal usage-dist-modal' },
        h('div', { class: 'tags-modal-head' },
          h('div', null,
            h('h3', null, '成员消耗分布'),
            h('div', { class: 'subtle', style: { fontSize: '12px', marginTop: '4px' } },
              project.name + ' · 共 ' + stats.byMember.length + ' 人 · ' + formatCostShort(stats.total) + ' 积分',
            ),
          ),
          h('button', { class: 'tags-close', onClick: closeUsageDistModal, title: '关闭' }, '✕'),
        ),
        h('div', { class: 'tags-modal-body usage-dist-modal-body' },
          stats.byMember.length === 0
            ? h('div', { class: 'subtle', style: { textAlign: 'center', padding: '32px 8px' } }, '当前筛选无数据')
            : h('div', { class: 'usage-dist-list' },
                ...stats.byMember.map(m => {
                  const pct = stats.total > 0 ? Math.round(m.total / stats.total * 100) : 0;
                  const isOwner = m.role === 'owner' || m.phone === ownerPhone;
                  return h('div', { class: 'usage-dist-row' },
                    h('span', { class: 'usage-dist-name' }, isOwner ? '管理员' : maskPhone(m.phone)),
                    h('div', { class: 'usage-dist-bar' },
                      h('div', { class: 'usage-dist-fill', style: { width: pct + '%' } }),
                    ),
                    h('span', { class: 'usage-dist-val' }, formatCostShort(m.total) + ' · ' + pct + '%'),
                  );
                }),
              ),
        ),
        h('div', { class: 'tpl-modal-foot' },
          h('span', { class: 'spacer', style: { flex: 1 } }),
          h('button', { class: 'btn primary sm', onClick: closeUsageDistModal }, '关闭'),
        ),
      ),
    );
  }

  // ---------- Spark All Modal（项目历史每日消耗柱状图） ----------
  function sparkAllModal() {
    if (!State.sparkAllOpen) return null;
    const pid = State.sparkAllPid;
    const project = (D.projects || []).find(p => p.id === pid);
    if (!project) return null;
    const logs = getProjectUsage(pid);
    const buckets = dailyBucketsAll(logs);
    const total = buckets.reduce((s, b) => s + b.total, 0);
    const max = Math.max(1, ...buckets.map(b => b.total));
    const avgPerDay = buckets.length > 0 ? Math.round(total / buckets.length) : 0;
    const peakDay = buckets.reduce((peak, b) => (b.total > peak.total ? b : peak), { total: 0, when: 0 });

    return h('div', {
      class: 'tags-modal-mask',
      onClick: (e) => { if (e.target.classList.contains('tags-modal-mask')) closeSparkAll(); },
    },
      h('div', { class: 'tags-modal spark-all-modal' },
        h('div', { class: 'tags-modal-head' },
          h('div', null,
            h('h3', null, '每日消耗趋势'),
            h('div', { class: 'subtle', style: { fontSize: '12px', marginTop: '4px' } },
              project.name + ' · 共 ' + buckets.length + ' 天 · 累计 ' + formatCostShort(total) + ' 积分',
            ),
          ),
          h('button', { class: 'tags-close', onClick: closeSparkAll, title: '关闭' }, '✕'),
        ),
        h('div', { class: 'tags-modal-body spark-all-body' },
          buckets.length === 0
            ? h('div', { class: 'subtle', style: { textAlign: 'center', padding: '32px 8px' } }, '尚无消耗记录')
            : h('div', null,
                h('div', { class: 'spark-all-stats' },
                  h('div', { class: 'spark-all-stat' },
                    h('div', { class: 'spark-all-stat-num' }, formatCostShort(avgPerDay)),
                    h('div', { class: 'spark-all-stat-label' }, '日均消耗'),
                  ),
                  h('div', { class: 'spark-all-stat' },
                    h('div', { class: 'spark-all-stat-num' }, formatCostShort(peakDay.total)),
                    h('div', { class: 'spark-all-stat-label' }, '单日最高（' + (peakDay.when ? dayShortLabel(peakDay.when) : '—') + '）'),
                  ),
                  h('div', { class: 'spark-all-stat' },
                    h('div', { class: 'spark-all-stat-num' }, buckets.length + ' 天'),
                    h('div', { class: 'spark-all-stat-label' }, '观测区间'),
                  ),
                ),
                h('div', { class: 'spark-all-chart-wrap' },
                  h('div', { class: 'spark-all-chart' },
                    ...buckets.map(b => {
                      const pctH = b.total > 0 ? Math.max(6, Math.round(b.total / max * 100)) : 0;
                      return h('div', {
                        class: 'spark-all-bar' + (b.total === 0 ? ' empty' : ''),
                        style: { height: pctH + '%' },
                        title: dayShortLabel(b.when) + '：' + formatCostShort(b.total) + ' 积分',
                      });
                    }),
                  ),
                ),
                h('div', { class: 'spark-all-axis' },
                  h('span', { class: 'mono' }, dayShortLabel(buckets[0].when)),
                  h('span', { class: 'mono' }, dayShortLabel(buckets[buckets.length - 1].when)),
                ),
              ),
        ),
        h('div', { class: 'tpl-modal-foot' },
          h('span', { class: 'spacer', style: { flex: 1 } }),
          h('button', { class: 'btn primary sm', onClick: closeSparkAll }, '关闭'),
        ),
      ),
    );
  }

  // Account Panel Modal 已废弃，迁移到 #/account 独立页面（viewAccount）

  // ---------- Recharge Modal ----------
  function rechargeModal() {
    if (!State.rechargeOpen) return null;
    const presets = [100, 500, 1000, 5000];
    const draft = State.rechargeDraft;

    return h('div', {
      class: 'tags-modal-mask',
      onClick: (e) => { if (e.target.classList.contains('tags-modal-mask')) closeRecharge(); },
    },
      h('div', { class: 'tags-modal recharge-modal' },
        h('div', { class: 'tags-modal-head' },
          h('div', null,
            h('h3', null, '账户充值'),
            h('div', { class: 'subtle', style: { fontSize: '12px', marginTop: '4px' } },
              'demo 模式 · 提交即生效（不接真实支付）',
            ),
          ),
          h('button', { class: 'tags-close', onClick: closeRecharge, title: '关闭' }, '✕'),
        ),
        h('div', { class: 'tags-modal-body' },
          h('div', { class: 'tpl-field' },
            h('label', null, '常用金额'),
            h('div', { class: 'recharge-presets' },
              ...presets.map(v => h('button', {
                class: 'recharge-preset' + (draft === v ? ' on' : ''),
                onClick: () => { State.rechargeDraft = v; render(); },
              }, formatCostShort(v))),
            ),
          ),
          h('div', { class: 'tpl-field' },
            h('label', null, '自定义金额'),
            h('input', {
              type: 'number',
              value: draft,
              min: 1,
              onInput: (e) => { State.rechargeDraft = e.target.value; },
            }),
          ),
        ),
        h('div', { class: 'tpl-modal-foot' },
          h('button', { class: 'btn ghost sm', onClick: closeRecharge }, '取消'),
          h('button', { class: 'btn primary sm', onClick: commitRecharge }, '确认充值'),
        ),
      ),
    );
  }

  // ---------- Budget Edit Modal ----------
  function budgetEditModal() {
    if (!State.budgetEditOpen) return null;
    const pid = State.budgetEditPid;
    const project = (D.projects || []).find(p => p.id === pid);
    if (!project) return null;
    const cur = getProjectBudget(pid);
    const spent = projectSpent(pid);
    const balance = (State.session && State.session.balance) || 0;
    // 账户视角字段
    const allocatedAll = (D.projects || []).reduce((s, p) => s + (p.budgetAllocated || 0), 0);
    const accountTotal = balance + allocatedAll;
    const newBudget = parseInt(State.budgetEditDraft, 10) || 0;
    const delta = newBudget - cur;
    const errInsufficient = delta > balance;
    const canSubmit = !errInsufficient && newBudget >= 0;

    return h('div', {
      class: 'tags-modal-mask',
      onClick: (e) => { if (e.target.classList.contains('tags-modal-mask')) closeBudgetEdit(); },
    },
      h('div', { class: 'tags-modal budget-edit-modal' },
        h('div', { class: 'tags-modal-head' },
          h('div', null,
            h('h3', null, '调整项目预算'),
            h('div', { class: 'subtle', style: { fontSize: '12px', marginTop: '4px' } }, project.name),
          ),
          h('button', { class: 'tags-close', onClick: closeBudgetEdit, title: '关闭' }, '✕'),
        ),
        h('div', { class: 'tags-modal-body' },
          // 可分配池：唯一权威数（操作的约束来源）
          h('div', { class: 'budget-pool-card' },
            h('div', { class: 'budget-pool-label' }, '可分配池'),
            h('div', { class: 'budget-pool-num' }, formatCostShort(balance)),
            h('div', { class: 'budget-pool-unit' }, '积分'),
          ),
          // 项目现状一行带过
          h('div', { class: 'budget-edit-current' },
            h('span', null, '本项目当前 ', h('span', { class: 'mono' }, formatCostShort(cur))),
            h('span', { class: 'sep' }, ' · '),
            h('span', null, '已用 ', h('span', { class: 'mono' }, formatCostShort(spent))),
          ),
          h('div', { class: 'tpl-field' },
            h('label', null, '新预算（积分）'),
            h('input', {
              type: 'number',
              value: State.budgetEditDraft,
              min: 0,
              onInput: (e) => { State.budgetEditDraft = e.target.value; render(); },
            }),
            errInsufficient && h('div', { class: 'budget-err' }, '可分配池不足，最多可再分配 ' + formatCostShort(balance) + ' 积分'),
          ),
          // 调整后预览（实时计算）
          delta !== 0 && !errInsufficient && h('div', { class: 'budget-preview-card' },
            h('div', { class: 'budget-preview-head' }, '调整后'),
            h('div', { class: 'budget-preview-row' },
              h('span', { class: 'budget-preview-label' }, '可分配池'),
              h('span', { class: 'budget-preview-val mono ' + (delta > 0 ? 'down' : 'up') },
                formatCostShort(balance - delta),
                h('span', { class: 'budget-preview-delta' },
                  delta > 0 ? '−' + formatCostShort(delta) : '+' + formatCostShort(-delta),
                ),
              ),
            ),
            h('div', { class: 'budget-preview-row' },
              h('span', { class: 'budget-preview-label' }, '本项目预算'),
              h('span', { class: 'budget-preview-val mono ' + (delta > 0 ? 'up' : 'down') },
                formatCostShort(newBudget),
                h('span', { class: 'budget-preview-delta' },
                  delta > 0 ? '+' + formatCostShort(delta) : '−' + formatCostShort(-delta),
                ),
              ),
            ),
          ),
        ),
        h('div', { class: 'tpl-modal-foot' },
          h('button', { class: 'btn ghost sm', onClick: closeBudgetEdit }, '取消'),
          h('button', {
            class: 'btn primary sm',
            disabled: !canSubmit,
            onClick: commitBudgetEdit,
          }, '保存'),
        ),
      ),
    );
  }

  // ---------- Attach Menu (popover next to add-card) ----------
  function attachMenu() {
    if (!State.attachMenuOpen) return null;
    const anchor = State.attachMenuAnchor;
    const style = anchor
      ? { left: anchor.left + 'px', bottom: anchor.bottom + 'px' }
      : null;
    return h('div', { class: 'attach-menu', style: style },
      h('div', { class: 'attach-menu-item', onClick: (e) => { e.stopPropagation(); openAssetPicker(); } },
        h('span', { class: 'attach-menu-ico' }, '📁'),
        h('span', null, '从资产选'),
      ),
      h('div', { class: 'attach-menu-item', onClick: (e) => { e.stopPropagation(); openUploadModal(); } },
        h('span', { class: 'attach-menu-ico ico-up', html: ICO.upload }),
        h('span', null, '上传新文件'),
      ),
    );
  }

  // ---------- Asset Picker Modal (single column, current project only) ----------
  function assetPickerModal() {
    if (!State.assetPickerOpen) return null;
    const proj = currentProject();
    const kind = State.assetPickerKind;
    const list = (D.assets || []).filter(a => a.projectId === State.projectId && a.kind === kind);
    const tabs = [
      { key: 'video', label: '视频' },
      { key: 'image', label: '图片' },
      { key: 'doc',   label: '文档' },
    ];
    const selectedSet = new Set(State.assetPickerSelected);

    function tile(a) {
      const isOn = selectedSet.has(a.id);
      const isVideo = a.kind === 'video';
      const isDoc   = a.kind === 'doc';
      return h('div', {
        class: 'ap-tile' + (isOn ? ' on' : '') + (isDoc ? ' doc' : ''),
        onClick: () => toggleAssetPickerSelected(a.id),
      },
        h('span', { class: 'ap-check' }, isOn ? '✓' : ''),
        isDoc
          ? h('div', { class: 'ap-doc' },
              h('div', { class: 'ap-doc-icon' }, '¶'),
              h('div', { class: 'ap-doc-info' },
                h('div', { class: 'ap-doc-title' }, a.title || ('文档 #' + a.id)),
                h('div', { class: 'ap-doc-meta' }, '更新于 ', a.date || ''),
              ),
            )
          : h('div', { class: 'ap-media' },
              a.src && h('img', { src: a.src, alt: '', loading: 'lazy' }),
              isVideo && h('span', { class: 'ap-video-overlay', html: ICO.play }),
              isVideo && a.duration && h('span', { class: 'ap-duration' }, secondsLabel(a.duration)),
            ),
      );
    }

    return h('div', {
      class: 'tags-modal-mask',
      onClick: (e) => { if (e.target.classList.contains('tags-modal-mask')) closeAssetPicker(); },
    },
      h('div', { class: 'tags-modal asset-picker-modal' },
        h('div', { class: 'tags-modal-head' },
          h('div', null,
            h('h3', null, '选择项目资产'),
            h('div', { class: 'subtle', style: { fontSize: '12px', marginTop: '4px' } }, proj.name),
          ),
          h('button', { class: 'tags-close', onClick: closeAssetPicker, title: '关闭' }, '✕'),
        ),
        h('div', { class: 'asset-picker-tabs' },
          ...tabs.map(t => h('span', {
            class: 'a-tab' + (kind === t.key ? ' on' : ''),
            onClick: () => setAssetPickerKind(t.key),
          }, t.label)),
        ),
        h('div', { class: 'asset-picker-body' },
          list.length === 0
            ? h('div', { class: 'ap-empty' }, '当前项目下暂无 ', tabs.find(t => t.key === kind).label, ' 资产')
            : h('div', { class: 'asset-picker-grid' + (kind === 'doc' ? ' docs' : '') },
                ...list.map(tile),
              ),
        ),
        h('div', { class: 'asset-picker-foot' },
          h('span', { class: 'ap-count' }, '已选 ', String(State.assetPickerSelected.length), ' 项'),
          h('span', { class: 'spacer', style: { flex: 1 } }),
          h('button', { class: 'btn ghost sm', onClick: closeAssetPicker }, '取消'),
          h('button', {
            class: 'btn primary sm' + (State.assetPickerSelected.length === 0 ? ' disabled' : ''),
            onClick: commitAssetPicker,
          }, '确认引用'),
        ),
      ),
    );
  }

  // ---------- Upload Attach Modal (demo: dataURL only) ----------
  function uploadAttachModal() {
    if (!State.uploadModalOpen) return null;
    const drafts = State.uploadDraftFiles || [];
    const hasFiles = drafts.length > 0;

    function fmtSize(bytes) {
      if (!bytes) return '';
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / 1024 / 1024).toFixed(1) + ' MB';
    }
    function onDropZoneClick(e) {
      e.stopPropagation();
      let inp = document.querySelector('#vbHiddenFileInput');
      if (!inp) {
        inp = document.createElement('input');
        inp.type = 'file';
        inp.id = 'vbHiddenFileInput';
        inp.multiple = true;
        inp.style.display = 'none';
        inp.accept = 'image/*,video/*,.pdf,.txt,.md,.doc,.docx';
        document.body.appendChild(inp);
      }
      inp.multiple = true;
      inp.value = '';
      inp.onchange = (ev) => {
        if (ev.target.files && ev.target.files.length) pickUploadFiles(ev.target.files);
      };
      inp.click();
    }
    function onDrop(e) {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
        pickUploadFiles(e.dataTransfer.files);
      }
    }

    function dropZone() {
      return h('div', {
        class: 'upload-dropzone' + (hasFiles ? ' compact' : ''),
        onClick: onDropZoneClick,
        onDragover: (e) => { e.preventDefault(); e.stopPropagation(); },
        onDrop: onDrop,
      },
        hasFiles
          ? h('div', { class: 'upload-dropzone-compact' },
              h('span', { class: 'upload-dropzone-ico', html: ICO.upload }),
              h('span', null, '继续添加（点击 / 拖拽）'),
            )
          : h('div', { class: 'upload-empty' },
              h('span', { class: 'upload-empty-ico', html: ICO.upload }),
              h('div', { class: 'upload-empty-title' }, '点击选择文件 / 拖拽到此处（支持多选）'),
              h('div', { class: 'upload-empty-sub' }, '支持图片、视频、文档'),
            ),
      );
    }

    function row(d) {
      return h('div', { class: 'upload-list-row' },
        h('span', { class: 'upload-list-thumb' + (d.type === 'video' ? ' video' : '') + (d.type === 'doc' ? ' doc' : '') },
          d.type === 'image' && d.src
            ? h('img', { src: d.src, alt: '' })
            : h('span', { class: 'upload-list-thumb-ico', html: d.type === 'video' ? ICO.feed : ICO.docFile }),
        ),
        h('div', { class: 'upload-list-main' },
          h('div', { class: 'upload-list-name' }, d.name),
          h('div', { class: 'upload-list-meta' }, d.type, ' · ', fmtSize(d.size)),
        ),
        h('button', {
          class: 'upload-list-rm',
          title: '移除',
          onClick: (e) => removeUploadDraft(d.id, e),
        }, '✕'),
      );
    }

    const usedTotal = State.composedRefs.length + drafts.length;

    return h('div', {
      class: 'tags-modal-mask',
      onClick: (e) => { if (e.target.classList.contains('tags-modal-mask')) closeUploadModal(); },
    },
      h('div', { class: 'tags-modal upload-modal' },
        h('div', { class: 'tags-modal-head' },
          h('div', null,
            h('h3', null, '上传新文件'),
            h('div', { class: 'subtle', style: { fontSize: '12px', marginTop: '4px' } },
              '默认仅本会话使用，不会写入项目资产；勾选下方可同步保存',
            ),
          ),
          h('button', { class: 'tags-close', onClick: closeUploadModal, title: '关闭' }, '✕'),
        ),
        h('div', { class: 'tags-modal-body' },
          dropZone(),
          hasFiles && h('div', { class: 'upload-list-head' },
            h('span', null, '已选 ', String(drafts.length), ' 个文件'),
            h('span', { class: 'subtle' }, '附件总数 ', String(usedTotal), ' / ', String(ATTACH_MAX_COUNT)),
          ),
          hasFiles && h('div', { class: 'upload-list' },
            ...drafts.map(row),
          ),
          h('label', { class: 'upload-checkbox' },
            h('input', {
              type: 'checkbox',
              checked: State.uploadDraftSaveToAssets ? '' : null,
              onChange: (e) => { State.uploadDraftSaveToAssets = !!e.target.checked; },
            }),
            h('span', null, '同时保存到项目资产库（应用到本次全部 ' + drafts.length + ' 个）'),
          ),
        ),
        h('div', { class: 'tpl-modal-foot' },
          h('button', { class: 'btn ghost sm', onClick: closeUploadModal }, '取消'),
          h('button', {
            class: 'btn primary sm' + (!hasFiles ? ' disabled' : ''),
            onClick: commitUpload,
          }, hasFiles ? ('确认上传 ' + drafts.length) : '确认上传'),
        ),
      ),
    );
  }

  function assetSourceCascade() {
    const col1Items = [
      { key: 'tool',   label: '创作工具', leaf: false },
      { key: 'canvas', label: '创作画布', leaf: false },
      { key: 'upload', label: '上传文件', leaf: true },
    ];
    const col2Items = [
      { key: 's1', label: '会话 1' },
      { key: 's2', label: '会话 2' },
    ];

    function pickItem(col, item, colLabel, itemLabel) {
      State.assetSourcePick = { col, item: item.key, colLabel, itemLabel };
      State.assetSourceOpen = false;
      render();
    }
    function pickLeaf(c) {
      // Leaf item (no sub-cascade): directly select
      State.assetSourcePick = { col: c.key, item: c.key, colLabel: c.label, itemLabel: c.label };
      State.assetSourceOpen = false;
      render();
    }
    function clearPick(e) {
      e.stopPropagation();
      State.assetSourcePick = null;
      State.assetSourceOpen = false;
      render();
    }

    const activeCol = col1Items.find(x => x.key === State.assetSourceCol);
    const showCol2 = activeCol && !activeCol.leaf;

    return h('div', { class: 'asset-source-pop' },
      h('div', { class: 'cascade-col' },
        ...col1Items.map(c => h('div',
          {
            class: 'cascade-item' + (State.assetSourceCol === c.key ? ' on' : ''),
            onMouseenter: () => { State.assetSourceCol = c.key; render(); },
            onClick: (e) => {
              e.stopPropagation();
              if (c.leaf) { pickLeaf(c); return; }
              State.assetSourceCol = c.key;
              render();
            },
          },
          h('span', null, c.label),
          !c.leaf && h('span', { class: 'caret-r' }, '›'),
        )),
        State.assetSourcePick && h('div',
          { class: 'cascade-clear', onClick: clearPick },
          '清除筛选',
        ),
      ),
      showCol2 && h('div', { class: 'cascade-col' },
        ...col2Items.map(item => {
          const colLabel = activeCol.label;
          const isOn = State.assetSourcePick && State.assetSourcePick.col === State.assetSourceCol && State.assetSourcePick.item === item.key;
          return h('div', {
            class: 'cascade-item' + (isOn ? ' on' : ''),
            onClick: (e) => { e.stopPropagation(); pickItem(State.assetSourceCol, item, colLabel, item.label); },
          }, item.label);
        }),
      ),
    );
  }

  // ---------- Router ----------
  function route() {
    const hash = location.hash.replace(/^#\/?/, '');
    const seg = (hash || '').split('?')[0];
    return seg || 'home';
  }
  function parseQuery() {
    const hash = location.hash || '';
    const qIdx = hash.indexOf('?');
    if (qIdx < 0) return {};
    const q = hash.slice(qIdx + 1);
    const out = {};
    q.split('&').forEach(kv => {
      if (!kv) return;
      const eq = kv.indexOf('=');
      const k = decodeURIComponent(eq < 0 ? kv : kv.slice(0, eq));
      const v = eq < 0 ? '' : decodeURIComponent(kv.slice(eq + 1));
      out[k] = v;
    });
    return out;
  }
  let _assetHashSync = false;
  function applyAssetHashToState() {
    if (route() !== 'assets') return;
    const q = parseQuery();
    if (q.tab && ['video', 'image', 'doc'].indexOf(q.tab) >= 0) State.assetTab = q.tab;
    if (typeof q.tag === 'string') State.assetTag = q.tag || 'all';
    if (typeof q.search === 'string') State.assetSearch = q.search;
    if (q.sort && ['time-desc', 'time-asc', 'duration', 'name'].indexOf(q.sort) >= 0) State.assetSort = q.sort;
  }
  function updateAssetHash() {
    if (_assetHashSync) return;
    if (route() !== 'assets') return;
    const parts = [];
    if (State.assetTab && State.assetTab !== 'video') parts.push('tab=' + encodeURIComponent(State.assetTab));
    if (State.assetTag && State.assetTag !== 'all') parts.push('tag=' + encodeURIComponent(State.assetTag));
    if (State.assetSearch) parts.push('search=' + encodeURIComponent(State.assetSearch));
    if (State.assetSort && State.assetSort !== 'time-desc') parts.push('sort=' + encodeURIComponent(State.assetSort));
    const next = '#/assets' + (parts.length ? '?' + parts.join('&') : '');
    if (location.hash !== next) {
      _assetHashSync = true;
      try { history.replaceState(null, '', next); } catch (e) { location.hash = next; }
      _assetHashSync = false;
    }
  }

  function render() {
    const r = route();
    const app = $('#app');
    app.innerHTML = '';

    // ---- Auth route guards (strict) ----
    // Not logged in → force #/login (always render viewAuth to avoid blank flash)
    if (!isLoggedIn() && r !== 'login') {
      if (location.hash !== '#/login') location.hash = '#/login';
      app.append(viewAuth());
      applyTheme();
      // Auto-focus phone input after auth view paint
      setTimeout(() => {
        const inp = document.querySelector('.auth-form input[name="phone"]');
        if (inp) inp.focus();
      }, 0);
      return;
    }
    // Logged in & on /login → bounce to home
    if (isLoggedIn() && r === 'login') {
      if (location.hash !== '#/') location.hash = '#/';
      // continue to render home below
    }

    const isHome = (r === '' || r === 'home');
    if (isHome) app.append(topbar());

    if (r === 'login')                 app.append(viewAuth());
    else if (isHome)                   app.append(viewHome());
    else if (r === 'canvas')           app.append(viewCanvas());
    else if (r === 'image' || r === 'video' || r === 'text') app.append(viewTool(r));
    else if (r === 'assets')           app.append(viewAssets());
    else if (r === 'prompts')          app.append(viewPrompts());
    else if (r === 'skills')           app.append(viewSkills());
    else if (r === 'projects')         app.append(viewProjects());
    else if (r === 'members')          app.append(viewMembers());
    else if (r === 'usage')            app.append(viewUsage());
    else if (r === 'account')          app.append(viewAccount());
    else                               app.append(h('div', { style: { padding: '60px', textAlign: 'center' } }, '404 · 路由未知'));

    // Modals & global popovers (rendered above all routes)
    const modal = tagsModal();
    if (modal) app.append(modal);
    const tplModal = tplEditorModal();
    if (tplModal) app.append(tplModal);
    // Skill picker (text composer, attached to pill)
    if (State.skillPopOpen) {
      const skPop = skillPopover();
      if (skPop) app.append(skPop);
    }
    // Example picker (image/video composer, multi-select)
    if (State.examplePopOpen) {
      const exPop = examplePicker();
      if (exPop) app.append(exPop);
    }
    // Favorite collect modal (collecting result as prompt example)
    const favModal = favoriteCollectModal();
    if (favModal) app.append(favModal);
    // Template detail modal (read-only viewer)
    const tplDetail = tplDetailModal();
    if (tplDetail) app.append(tplDetail);
    // Asset detail modal (large image/video + meta)
    const assetDetail = assetDetailModal();
    if (assetDetail) app.append(assetDetail);
    // Attach menu (composer add-card popover)
    const aMenu = attachMenu();
    if (aMenu) app.append(aMenu);
    // Asset picker modal (single column, current project)
    const apModal = assetPickerModal();
    if (apModal) app.append(apModal);
    // Upload attach modal (demo, dataURL)
    const upModal = uploadAttachModal();
    if (upModal) app.append(upModal);
    // Create project modal
    const createProj = createProjectModal();
    if (createProj) app.append(createProj);
    const memberQuota = memberQuotaModal();
    if (memberQuota) app.append(memberQuota);
    const usageDetail = usageDetailModal();
    if (usageDetail) app.append(usageDetail);
    const usageDist = usageDistModal();
    if (usageDist) app.append(usageDist);
    const sparkAll = sparkAllModal();
    if (sparkAll) app.append(sparkAll);
    const recharge = rechargeModal();
    if (recharge) app.append(recharge);
    const budgetEdit = budgetEditModal();
    if (budgetEdit) app.append(budgetEdit);
    // User menu (popover from avatar)
    const uMenu = userMenu();
    if (uMenu) app.append(uMenu);
    // Tag picker popover (from doc card)
    if (State.tagPickerOpen) {
      const tp = tagPickerPopover();
      if (tp) app.append(tp);
    }
    // Filter popover (from work-head 筛选)
    if (State.filterPopOpen) {
      const fp = filterPopover();
      if (fp) app.append(fp);
    }

    applyTheme();

    // Auto-focus tag inputs after render
    if (State.tagsModalOpen) {
      const input = document.querySelector('.tag-row.editing .tag-input, .tag-row.creating .tag-input');
      if (input) {
        input.focus();
        try { input.setSelectionRange(input.value.length, input.value.length); } catch (e) {}
      }
    }
    // Auto-focus create-project input
    if (State.createProjectModalOpen) {
      const input = document.querySelector('.create-project-modal input[type="text"]');
      if (input) {
        input.focus();
        try { input.setSelectionRange(input.value.length, input.value.length); } catch (e) {}
      }
    }
    // Auto-focus tag-picker inline create input
    if (State.tagPickerOpen && State.tagPickerCreating) {
      const inp = document.querySelector('.tag-picker-pop .tag-pick-input');
      if (inp) {
        inp.focus();
        try { inp.setSelectionRange(inp.value.length, inp.value.length); } catch (e) {}
      }
    }
    // Auto-focus session edit input
    if (State.sessionEditingId) {
      const inp = document.querySelector('.session-row.editing .session-edit-input');
      if (inp) {
        inp.focus();
        try { inp.setSelectionRange(inp.value.length, inp.value.length); } catch (e) {}
      }
    }
    // Auto-focus tplEditor 名称输入（创建态聚焦空字段，编辑态聚焦末尾）
    if (State.tplModalOpen) {
      const inp = document.querySelector('.tpl-modal input[data-tpl-autofocus]');
      if (inp) {
        inp.focus();
        try { inp.setSelectionRange(inp.value.length, inp.value.length); } catch (e) {}
      }
    }
    // Usage 列表无限滚动：滚动到接近底部时 +30（用 scroll 监听最稳）
    if (_usageScrollHandler) {
      try { _usageScrollEl && _usageScrollEl.removeEventListener('scroll', _usageScrollHandler); } catch (e) {}
      _usageScrollHandler = null;
      _usageScrollEl = null;
    }
    if (route() === 'usage' && document.querySelector('.usage-sentinel')) {
      const panel = document.querySelector('.members-panel');
      if (panel) {
        _usageScrollEl = panel;
        _usageScrollHandler = function () {
          const remaining = panel.scrollHeight - panel.scrollTop - panel.clientHeight;
          if (remaining < 200 && !_usageLoading) {
            _usageLoading = true;
            State.usagePageSize += 30;
            render();
            setTimeout(() => { _usageLoading = false; }, 50);
          }
        };
        panel.addEventListener('scroll', _usageScrollHandler, { passive: true });
      }
    }
  }
  let _usageScrollHandler = null;
  let _usageScrollEl = null;
  let _usageLoading = false;

  window.addEventListener('hashchange', () => {
    // Close transient popovers when navigating, but keep selections
    State.examplePopOpen = false;
    State.examplePopAnchor = null;
    State.skillPopOpen = false;
    State.skillPopAnchor = null;
    State.attachMenuOpen = false;
    State.attachMenuAnchor = null;
    State.userMenuOpen = false;
    State.userMenuAnchor = null;
    State.tagPickerOpen = false;
    State.tagPickerAnchor = null;
    State.filterPopOpen = false;
    State.filterPopAnchor = null;
    State.assetSortOpen = false;
    State.assetSourceOpen = false;
    // 进入 #/usage 时重置分页
    if (route() === 'usage') State.usagePageSize = 30;
    // 跨页清理批量选择态（避免一个页面进入选择模式后切到另一个页面继续滞留）
    State.selectionMode = false;
    State.selectedAssetIds = [];
    State.assetBatchDeleteConfirm = false;
    // 资产页深链：从 hash 同步到 state（仅在 #/assets 路由）
    if (route() === 'assets' && !_assetHashSync) {
      applyAssetHashToState();
    }
    render();
  });
  window.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    if (route() === 'assets') applyAssetHashToState();
    render();
  });
})();

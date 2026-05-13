// Mock data for AI Video Agent prototype — iteration 3
// Project / Session layering + project-level asset repository with versions.

window.MOCK = (function () {
  // Relative timestamps so sort-by-createdAt works deterministically
  const T = (minAgo) => Date.now() - minAgo * 60000;

  // ─── Project 1: 奶茶30秒广告 ─────────────────────────────────────────
  const milkteaSessions = [
    {
      id: 's_mt1', name: '会话1 · 剧本拆解', stage: 'script', defaultTask: 'text',
      refs: [],
      messages: [
        { role: 'user', text: '帮我做一支30秒的水蜜桃乌龙奶茶广告,目标人群Z世代女生,基调清新治愈。' },
        { role: 'ai',   text: '收到~ 我先生成了3版脚本方向,你看看哪个更贴近?\n\n• v1 · 治愈系日常: 校园午后, 一杯奶茶治愈一切\n• v2 · 都市轻喜剧: 加班女孩与奶茶的化学反应\n• v3 · 国风新中式: 茶园采摘到现代杯中' },
        { role: 'user', text: '用 v2,我喜欢都市感。' },
        { role: 'ai',   text: '好,基于 v2 我把需要的角色和场景也拆出来了。右侧可以看到角色卡和场景设定已经沉淀到项目仓库。' }
      ]
    },
    {
      id: 's_mt2', name: '会话2 · 角色场景生成', stage: 'visual', defaultTask: 'image',
      refs: ['a_char_v1', 'a_scene_v1'],
      messages: [
        { role: 'user', text: '@角色卡(v1) 根据这份设定给林深生成3版形象参考' },
        { role: 'ai',   text: '3版都出来了,在右侧图片 Tab。',
          taskCard: { id: 't_mt2a', label: '林深形象生成', total: 3, done: 3, status: 'done' } },
        { role: 'user', text: '第2版最合适。接下来 @场景设定(v1) 生成场景01和奶茶杯特写' },
        { role: 'ai',   text: '场景01 出了两版候选,奶茶杯一版。都沉淀到项目。' }
      ]
    },
    {
      id: 's_mt3', name: '会话3 · 视频合成', stage: 'video', defaultTask: 'video',
      refs: ['a_script_v2', 'a_lushen_v2', 'a_scene01_v1'],
      messages: [
        { role: 'user', text: '@脚本(v2) @林深(v2) @场景01(v1) 基于这些合成一版试片' },
        { role: 'ai',   text: '第一版试片完成,30 秒。',
          taskCard: { id: 't_mt3a', label: '视频合成', total: 1, done: 1, status: 'done' } },
        { role: 'user', text: '节奏再快一点,重试' },
        { role: 'ai',   text: '新版更紧凑了,看右侧 v2。',
          taskCard: { id: 't_mt3b', label: '视频重做', total: 1, done: 1, status: 'done' } }
      ]
    }
  ];

  const milkteaAssets = {
    text: [
      { id: 'a_script_v1', name: '脚本', type: 'text', version: 1,
        body: '【治愈系日常】校园午后, 阳光斜照, 三个女生分享一杯奶茶, 慢镜头捕捉笑容...',
        sourceSessionId: 's_mt1', createdAt: T(50) },
      { id: 'a_script_v2', name: '脚本', type: 'text', version: 2,
        body: '【都市轻喜剧 · 已选】\n\n【场景1】写字楼·夜\n加班的 Lucy 揉了揉眼,屏幕的反光照在她脸上。\n\n【场景2】茶水间·晚9点\n她从抽屉摸出那杯水蜜桃乌龙,吸管插下去的瞬间,办公室突然亮起暖光。\n\n【Tagline】一杯就够,把今天还给自己。',
        sourceSessionId: 's_mt1', createdAt: T(48) },
      { id: 'a_script_v3', name: '脚本', type: 'text', version: 3,
        body: '【国风新中式】清晨茶园, 露水未干, 采摘的手与茶叶特写, 转场到现代茶饮店...',
        sourceSessionId: 's_mt1', createdAt: T(47) },
      { id: 'a_char_v1', name: '角色卡', type: 'text', version: 1,
        body: '林深(男, 28, 都市白领)\n• 性格: 内敛、略社恐、内心丰富\n• 造型: 灰色西装、黑框眼镜、袖口永远整齐\n• 关键动作: 喝奶茶前会下意识整理一下杯套',
        sourceSessionId: 's_mt1', createdAt: T(45) },
      { id: 'a_scene_v1', name: '场景设定', type: 'text', version: 1,
        body: '场景01 · 深夜写字楼\n• 冷光, 蓝灰色调\n• 空荡的工位, 只剩他一人\n• 屏幕蓝光打在脸上\n\n场景02 · 茶水间\n• 温黄色灯, 对比写字楼的冷\n• 杯子蒸汽, 桃粉色奶茶',
        sourceSessionId: 's_mt1', createdAt: T(44) }
    ],
    image: [
      { id: 'a_lushen_v1',  name: '林深',   type: 'image', version: 1, src: 'assets/placeholder-image-h.svg', sourceSessionId: 's_mt2', createdAt: T(40),
        prompt: '28岁中国男性，灰色西装，黑框眼镜，正坐在写字楼夜晚的工位前，屏幕蓝光打在脸上，冷光，蓝灰色调，电影感中景，高细节写实。' },
      { id: 'a_lushen_v2',  name: '林深',   type: 'image', version: 2, src: 'assets/placeholder-image-h.svg', sourceSessionId: 's_mt2', createdAt: T(39),
        prompt: '28岁中国男性，灰色西装，正在整理袖口的手部特写，写字楼工位背景虚化，冷蓝调，电影感近景，高细节质感。' },
      { id: 'a_lushen_v3',  name: '林深',   type: 'image', version: 3, src: 'assets/placeholder-image-h.svg', sourceSessionId: 's_mt2', createdAt: T(38),
        prompt: '28岁都市白领男性侧脸，从抽屉拿出奶茶的瞬间，茶水间暖黄色灯光，对比窗外冷蓝，柔光，电影质感中景。' },
      { id: 'a_scene01_v1', name: '场景01', type: 'image', version: 1, src: 'assets/placeholder-image-h.svg', sourceSessionId: 's_mt2', createdAt: T(30),
        prompt: '深夜写字楼，开放工位，仅一人留下，屏幕蓝光，冷色调，俯拍空旷感，电影质感全景。' },
      { id: 'a_scene01_v2', name: '场景01', type: 'image', version: 2, src: 'assets/placeholder-image-h.svg', sourceSessionId: 's_mt2', createdAt: T(28),
        prompt: '深夜茶水间，温黄色灯光，桃粉色奶茶杯升起蒸汽，玻璃杯反光，对比窗外蓝光，电影质感中景。' },
      { id: 'a_cup_v1',     name: '奶茶杯', type: 'image', version: 1, src: 'assets/placeholder-image-h.svg', sourceSessionId: 's_mt2', createdAt: T(20),
        prompt: '水蜜桃乌龙奶茶产品特写，磨砂透明杯，桃粉色液体，冰块漂浮，杯身上凝结水珠，柔和暖光，简洁背景，商业广告级写实质感。' }
    ],
    video: [
      { id: 'a_final_v1', name: '成片', type: 'video', version: 1, src: 'assets/placeholder-video-h.svg', duration: '00:32', sourceSessionId: 's_mt3', createdAt: T(10),
        prompt: '都市轻喜剧奶茶广告 V1：写字楼夜景开场→主角拿出奶茶→茶水间暖光→产品特写→Tagline 收尾。30秒整体节奏，冷暖对比。' },
      { id: 'a_final_v2', name: '成片', type: 'video', version: 2, src: 'assets/placeholder-video-h.svg', duration: '00:30', sourceSessionId: 's_mt3', createdAt: T(5),
        prompt: '都市轻喜剧奶茶广告 V2 终版：节奏更紧凑，强化第一秒钩子，Tagline 提前到 25s 出现。冷暖对比 + 产品近景。' }
    ],
    audio: []
  };

  // ─── Project 2: 短剧 S1E1 ──────────────────────────────────────────
  // 这是一个"示例项目"，用三个会话演示从剧本拆解 → 图片生成 → 视频合成的完整链路。
  // 每个会话的产出物都通过 assetId 链接到 dramaAssets 中的真实资产。
  const dramaSessions = [
    {
      id: 's_dr1', name: '会话1 · 短剧拆解', stage: 'script', defaultTask: 'text', type: 'text',
      refs: [],
      messages: [
        { role: 'user', text: '上传 S1E1 第一集剧本初稿。任务：拆出主要角色卡、关键场景设定、核心道具，每个元素附 AI 出图提示词。',
          createdAt: T(8640) },
        { role: 'ref',  label: 'S1E1_初稿.docx', createdAt: T(8639) },
        { role: 'ai',   text: '收到。已用「剧本拆解」技能完成结构化整理：3 个主要角色 / 4 个场景 / 2 件关键道具，每条都带可直接用的图像提示词。详情见下方文档卡。',
          docCard: { title: 'S1E1 拆解报告', version: 1, type: 'script-breakdown' },
          assetId: 'a_dr_breakdown_v1', createdAt: T(8635) },
        { role: 'user', text: '林深的形象写得太单薄。补一下：身高、体态、眼神、说话方式，让美术好抓特征。',
          createdAt: T(7230) },
        { role: 'ai',   text: '已扩充林深角色卡。新增：178cm 偏瘦、习惯性低头、不擅目光接触、说话尾音偏轻。其他角色保留原版。',
          docCard: { title: 'S1E1 拆解报告', version: 2, type: 'script-breakdown', updateNote: '林深角色补充' },
          assetId: 'a_dr_breakdown_v2', createdAt: T(7228) }
      ]
    },
    {
      id: 's_dr_storyboard', name: '会话2 · 短剧分镜', stage: 'storyboard', defaultTask: 'text', type: 'text',
      refs: ['a_dr_breakdown_v2'],
      messages: [
        { role: 'user', text: '基于上一会话的拆解 V2，用「分镜脚本」技能拆出本集所有镜头。每个镜头要给出：景别、机位、时长、台词、动作描述，以及可直接用的视频 prompt。',
          createdAt: T(7100) },
        { role: 'ai',   text: '已用「分镜脚本」技能完成 14 个镜头的拆解。覆盖本集 7 个场景，总时长 6 分 28 秒。每个镜头都包含景别 / 机位 / 时长 / 台词 / 动作 + videoPrompt（可直接用于视频生成）。详情见下方文档卡。',
          docCard: { title: 'S1E1 分镜脚本', version: 1, type: 'storyboard' },
          assetId: 'a_dr_storyboard_v1', createdAt: T(7095) },
        { role: 'user', text: '镜头 03 的"林深惊醒"建议加更紧凑的节奏，时长压到 3 秒；镜头 07 苏离的入场可以加一个手部特写，强化"专业感"。',
          createdAt: T(6800) },
        { role: 'ai',   text: '已修订。镜头 03 时长 5s → 3s + 加快速心跳音效提示；镜头 07 增加苏离佩戴手套的手部特写（0.8s 嵌入）。其他镜头保留。',
          docCard: { title: 'S1E1 分镜脚本', version: 2, type: 'storyboard', updateNote: '节奏 + 苏离入场修订' },
          assetId: 'a_dr_storyboard_v2', createdAt: T(6798) }
      ]
    },
    {
      id: 's_dr2', name: '会话3 · 角色场景生成', stage: 'visual', defaultTask: 'image', type: 'image',
      refs: ['a_dr_breakdown_v2', 'a_dr_storyboard_v2'],
      messages: [
        { role: 'user', text: '基于上一会话拆解的「林深 V2」角色卡，生成 3 版近景。要求：冷光、电影质感、9:16 竖屏。',
          createdAt: T(4320),
          request: { text: '基于上一会话拆解的「林深 V2」角色卡，生成 3 版近景。要求：冷光、电影质感、9:16 竖屏。',
            refs: [{ name: '林深 V2 角色卡', src: 'assets/placeholder-image-v.svg', type: 'image' }],
            model: 'GPT Image 2', ratio: '9:16', resolution: '720P' } },
        { role: 'ai',   text: '已生成 3 版林深近景，整体风格一致细节略有差异。每张都可在右侧详情查看完整图像提示词。',
          taskCard: { id: 't_dr2a', label: '林深近景生成', total: 3, done: 3, status: 'done' },
          createdAt: T(4318) },
        { role: 'ai',   text: '版本 1：偏忧郁内敛。',
          result: { type: 'image', src: 'assets/placeholder-image-v.svg', ratio: '9:16', status: 'done' },
          assetId: 'a_dr_lushen_v1', createdAt: T(4316) },
        { role: 'ai',   text: '版本 2：眼神更锐利。',
          result: { type: 'image', src: 'assets/placeholder-image-v.svg', ratio: '9:16', status: 'done' },
          assetId: 'a_dr_lushen_v2', createdAt: T(4314) },
        { role: 'ai',   text: '版本 3：失眠疲惫感更强（建议优先选用）。',
          result: { type: 'image', src: 'assets/placeholder-image-v.svg', ratio: '9:16', status: 'done' },
          assetId: 'a_dr_lushen_v3', createdAt: T(4312) },
        { role: 'user', text: '补两张氛围镜：钥匙特写 + 林深房间空镜。要悬疑感。',
          createdAt: T(2910),
          request: { text: '补两张氛围镜：钥匙特写 + 林深房间空镜。要悬疑感。',
            refs: [],
            model: 'GPT Image 2', ratio: '9:16', resolution: '720P' } },
        { role: 'ai',   text: '已生成。两张都遵循冷蓝主调，与林深角色一致。',
          result: { type: 'image', src: 'assets/placeholder-image-v.svg', ratio: '9:16', status: 'done' },
          assetId: 'a_dr_key_v1', createdAt: T(2908) },
        { role: 'ai',   text: '',
          result: { type: 'image', src: 'assets/placeholder-image-v.svg', ratio: '9:16', status: 'done' },
          assetId: 'a_dr_room_v1', createdAt: T(2906) },
        { role: 'user', text: '基于「分镜脚本 V2」镜头 07 苏离的描述和拆解 V2 角色卡，生成苏离 2 版形象（含戴手套手部特写镜头预想）。',
          createdAt: T(2200),
          request: { text: '基于「分镜脚本 V2」和拆解 V2 苏离角色卡，生成 2 版苏离形象。',
            refs: [{ name: '分镜 V2', src: 'assets/placeholder-image-v.svg', type: 'image' }],
            model: 'GPT Image 2', ratio: '9:16', resolution: '720P' } },
        { role: 'ai',   text: '已生成苏离 V1（标准入场）和 V2（戴乳胶手套低头检查证物）。',
          result: { type: 'image', src: 'assets/placeholder-image-v.svg', ratio: '9:16', status: 'done' },
          assetId: 'a_dr_suli_v1', createdAt: T(2195) },
        { role: 'ai',   text: '',
          result: { type: 'image', src: 'assets/placeholder-image-v.svg', ratio: '9:16', status: 'done' },
          assetId: 'a_dr_suli_v2', createdAt: T(2193) },
        { role: 'user', text: '继续：周可 2 版（侦探）+ 李警官 + 黄医师各 1 版，配套分镜后半段镜头。',
          createdAt: T(1800),
          request: { text: '生成周可 2 版 + 李警官 + 黄医师。',
            refs: [],
            model: 'GPT Image 2', ratio: '9:16', resolution: '720P' } },
        { role: 'ai',   text: '4 个角色全部完成。周可 V1（雨夜街灯）、V2（监控室）；李警官（警局走廊）；黄医师（暖光）。',
          result: { type: 'image', src: 'assets/placeholder-image-v.svg', ratio: '9:16', status: 'done' },
          assetId: 'a_dr_zhouke_v1', createdAt: T(1795) },
        { role: 'user', text: '场景批量出图：法医室 / 警局走廊 / 监控室 / 雨夜街道 / 仓库 / 茶水间，按拆解 V2 的 imagePrompt 字段直接出。',
          createdAt: T(1200),
          request: { text: '场景批量生成。',
            refs: [{ name: '拆解 V2', src: 'assets/placeholder-image-v.svg', type: 'image' }],
            model: 'GPT Image 2', ratio: '9:16', resolution: '720P' } },
        { role: 'ai',   text: '6 个场景全部生成完成，整体冷蓝悬疑色调统一。茶水间作为对比的暖色点缀。',
          result: { type: 'image', src: 'assets/placeholder-image-v.svg', ratio: '9:16', status: 'done' },
          assetId: 'a_dr_lab_v1', createdAt: T(1195) },
        { role: 'user', text: '林深房间 V1 接受了我的批注，重新出 V2；同时补两个道具：录像带 + 笔记本特写。',
          createdAt: T(800),
          request: { text: '林深房间 V2 + 录像带 + 笔记本特写。',
            refs: [],
            model: 'GPT Image 2', ratio: '9:16', resolution: '720P' } },
        { role: 'ai',   text: '已生成。房间 V2 应用了"床头方向调整 + 散落衣物"批注；道具两张延续悬疑色调。',
          result: { type: 'image', src: 'assets/placeholder-image-v.svg', ratio: '9:16', status: 'done' },
          assetId: 'a_dr_room_v2', createdAt: T(795) }
      ]
    },
    {
      id: 's_dr3', name: '会话4 · 视频生成', stage: 'video', defaultTask: 'video', type: 'video',
      refs: ['a_dr_storyboard_v2', 'a_dr_key_v1', 'a_dr_room_v1', 'a_dr_lushen_v3'],
      messages: [
        { role: 'user', text: '用「钥匙特写」+「林深房间」生成一段慢推镜：5 秒，从钥匙拉到房间全景，配冷光氛围。',
          createdAt: T(180),
          request: { text: '用「钥匙特写」+「林深房间」生成一段慢推镜：5 秒，从钥匙拉到房间全景，配冷光氛围。',
            refs: [
              { name: '钥匙特写', src: 'assets/placeholder-image-v.svg', type: 'image' },
              { name: '林深房间', src: 'assets/placeholder-image-v.svg', type: 'image' }
            ],
            model: 'Seedance 2.0', ratio: '9:16', resolution: '720P' } },
        { role: 'ai',   text: '已合成。Seedance 2.0 模型，时长 5s，画幅 9:16。',
          result: { type: 'video', src: 'assets/placeholder-video-v.svg', ratio: '9:16', duration: '00:05', status: 'done' },
          assetId: 'a_dr_video_keypush_v1', createdAt: T(170) },
        { role: 'user', text: '再来一段：林深从床上惊醒，下意识按住床头。3 秒，要紧张感。',
          createdAt: T(60),
          request: { text: '再来一段：林深从床上惊醒，下意识按住床头。3 秒，要紧张感。',
            refs: [
              { name: '林深房间', src: 'assets/placeholder-image-v.svg', type: 'image' },
              { name: '林深 V3', src: 'assets/placeholder-image-v.svg', type: 'image' }
            ],
            model: 'Seedance 2.0', ratio: '9:16', resolution: '720P' } },
        { role: 'ai',   text: '已生成。3 秒紧张感片段，可作为开场钩子。',
          result: { type: 'video', src: 'assets/placeholder-video-v.svg', ratio: '9:16', duration: '00:03', status: 'done' },
          assetId: 'a_dr_video_wakeup_v1', createdAt: T(50) },
        { role: 'user', text: '继续按分镜 V2 顺序生成：镜头 01 清晨光柱（房间 V2，4 秒静态）+ 镜头 06 警局走廊跟拍（林深 V3 + 走廊场景，3 秒）。',
          createdAt: T(45),
          request: { text: '镜头 01 + 镜头 06 视频生成。',
            refs: [
              { name: '林深房间 V2', src: 'assets/placeholder-image-v.svg', type: 'image' },
              { name: '林深 V3', src: 'assets/placeholder-image-v.svg', type: 'image' },
              { name: '警局走廊', src: 'assets/placeholder-image-v.svg', type: 'image' }
            ],
            model: 'Seedance 2.0', ratio: '9:16', resolution: '720P' } },
        { role: 'ai',   text: '镜头 01 已合成（4s 静态光柱效果不错）。',
          result: { type: 'video', src: 'assets/placeholder-video-v.svg', ratio: '9:16', duration: '00:04', status: 'done' },
          assetId: 'a_dr_video_morning_v1', createdAt: T(40) },
        { role: 'ai',   text: '镜头 06 警局走廊跟拍完成。',
          result: { type: 'video', src: 'assets/placeholder-video-v.svg', ratio: '9:16', duration: '00:03', status: 'done' },
          assetId: 'a_dr_video_corridor_v1', createdAt: T(38) },
        { role: 'user', text: '镜头 07 苏离入场（关键镜头，含手部特写嵌入）+ 镜头 11 雨夜街道。',
          createdAt: T(20),
          request: { text: '镜头 07 + 镜头 11 视频生成。',
            refs: [
              { name: '苏离 V2', src: 'assets/placeholder-image-v.svg', type: 'image' },
              { name: '法医室', src: 'assets/placeholder-image-v.svg', type: 'image' },
              { name: '周可 V1', src: 'assets/placeholder-image-v.svg', type: 'image' },
              { name: '雨夜街道', src: 'assets/placeholder-image-v.svg', type: 'image' }
            ],
            model: 'Seedance 2.0', ratio: '9:16', resolution: '720P' } },
        { role: 'ai',   text: '两个镜头都完成。苏离入场的手部特写嵌入流畅；雨夜街道的霓虹反射很有质感。',
          result: { type: 'video', src: 'assets/placeholder-video-v.svg', ratio: '9:16', duration: '00:04', status: 'done' },
          assetId: 'a_dr_video_suli_intro_v1', createdAt: T(15) },
        { role: 'ai',   text: '',
          result: { type: 'video', src: 'assets/placeholder-video-v.svg', ratio: '9:16', duration: '00:05', status: 'done' },
          assetId: 'a_dr_video_street_v1', createdAt: T(13) }
      ]
    }
  ];

  // 短剧示例项目的"参考文件夹结构" — 演示如何把一集产出物按内容类型组织
  // 默认 / 剧本 / 角色（含林深子文件夹）/ 场景 / 道具 / 视频片段
  const dramaFolders = [
    { id: 'f_default',     name: '默认',     parentId: null, createdAt: T(120), isDefault: true },
    { id: 'f_dr_scripts',  name: '剧本',     parentId: null, createdAt: T(119) },
    { id: 'f_dr_chars',    name: '角色',     parentId: null, createdAt: T(118) },
    { id: 'f_dr_lushen',   name: '林深',     parentId: 'f_dr_chars', createdAt: T(117) },
    { id: 'f_dr_suli',     name: '苏离',     parentId: 'f_dr_chars', createdAt: T(116) },
    { id: 'f_dr_zhouke',   name: '周可',     parentId: 'f_dr_chars', createdAt: T(115) },
    { id: 'f_dr_scenes',   name: '场景',     parentId: null, createdAt: T(116) },
    { id: 'f_dr_props',    name: '道具',     parentId: null, createdAt: T(115) },
    { id: 'f_dr_videos',   name: '视频片段', parentId: null, createdAt: T(114) }
  ];

  const dramaAssets = {
    text: [
      { id: 'a_dr_breakdown_v1', name: 'S1E1 拆解报告', type: 'text', version: 1, folderId: 'f_dr_scripts',
        body: '【风格指南】\n艺术风格：写实悬疑电影质感\n色彩基调：冷蓝偏灰，重点处暖色点缀\n时代背景：当代都市\n\n【主要角色】\n\n林深（男，28岁，程序员）\n• 性格：内敛、失眠、善观察\n• 外貌：寸头略乱，眼下淡青\n• 服装：灰色帽衫 + 黑色运动裤\n• 关键动作：醒来下意识摸床头\n\n苏离（女，27岁，法医）\n• 性格：冷静、话少、眼神锐利\n• 外貌：齐肩黑直发，皮肤偏白\n• 服装：白色法医制服 / 深色风衣\n\n【关键场景】\n场景01 · 林深房间·清晨\n• 都市单身公寓，凌乱的床，窗帘半拉\n• 阳光从缝隙射入形成尘埃光柱\n• 冷蓝偏暖的对比色\n\n场景02 · 警局法医室·夜\n• 冷白光，金属台面，玻璃柜\n• 苏离背身整理工具\n\n【关键道具】\n钥匙：黄铜旧式，齿纹复杂，象征"另一个自己"\n监控录像带：90 年代旧式 VHS，磁带可见物理损伤',
        sourceSessionId: 's_dr1', createdAt: T(100) },
      { id: 'a_dr_breakdown_v2', name: 'S1E1 拆解报告', type: 'text', version: 2, folderId: 'f_dr_scripts',
        body: '【风格指南】\n艺术风格：写实悬疑电影质感\n色彩基调：冷蓝偏灰，重点处暖色点缀\n时代背景：当代都市\n\n【主要角色】\n\n林深（男，28岁，程序员）\n• 身高：178cm，偏瘦\n• 体态：习惯性低头，肩膀微缩\n• 眼神：很少与人对视，对话时盯着对方手部或地面\n• 说话方式：语速偏慢，尾音偏轻，常用"嗯"、"也不是"做缓冲\n• 性格：内敛、失眠、善观察\n• 外貌：寸头略乱，眼下淡青\n• 服装：灰色帽衫 + 黑色运动裤\n• 关键动作：醒来下意识摸床头\n• imagePrompt：28岁中国男性，寸头略乱，眼下淡青疲惫感，习惯性低头，灰色帽衫 + 黑色运动裤，9:16 竖屏，冷蓝侧光，胶片颗粒感，电影质感近景\n\n苏离（女，27岁，法医）\n• 性格：冷静、话少、眼神锐利\n• 外貌：齐肩黑直发，皮肤偏白\n• 服装：白色法医制服 / 深色风衣\n• 关键动作：戴手套时会先看一眼对方再低头\n• imagePrompt：27岁中国女性法医，齐肩黑直发，肤白，白色法医制服，眼神锐利，9:16 竖屏，冷白光，电影质感中景\n\n【关键场景】\n场景01 · 林深房间·清晨\n• 都市单身公寓，凌乱的床，窗帘半拉\n• 阳光从缝隙射入形成尘埃光柱\n• 冷蓝偏暖的对比色\n• imagePrompt：都市单身公寓清晨，凌乱的床，窗帘半拉，斜阳从缝隙射入形成尘埃光柱，蓝灰冷调暖色点缀，9:16 竖屏，电影质感全景\n\n场景02 · 警局法医室·凌晨3点\n• 冷白光，金属台面，玻璃柜\n• 苏离背身整理工具\n• imagePrompt：警局法医室深夜，冷白荧光灯，金属台面 + 玻璃柜，苏离背身整理工具，9:16 竖屏，悬疑氛围，电影质感全景\n\n【关键道具】\n钥匙：黄铜旧式，齿纹复杂，象征"另一个自己"\n• imagePrompt：陈旧黄铜钥匙特写，齿纹复杂，浅灰亚麻布上，侧光长阴影，悬疑氛围，胶片颗粒感，9:16 竖屏，超近景\n\n监控录像带：90 年代旧式 VHS，磁带可见物理损伤\n• imagePrompt：90年代旧式 VHS 录像带，磁带可见物理损伤，木桌面，冷光照明，悬疑氛围，9:16 竖屏，电影质感超近景',
        sourceSessionId: 's_dr1', createdAt: T(98),
        annotations: [
          { id: 'an_doc_1', text: '苏离的关键动作没有描写，需要补充', createdAt: T(60), author: 'Bruce' },
          { id: 'an_doc_2', text: '场景02 警局法医室缺少时间锚点，建议加"凌晨 3 点"', createdAt: T(40), author: 'Bruce' }
        ] },
      { id: 'a_dr_storyboard_v1', name: 'S1E1 分镜脚本', type: 'text', version: 1, folderId: 'f_dr_scripts',
        body: '【片名】S1E1 · 钥匙\n【时长】6 分 28 秒\n【镜头总数】14\n\n────────────────────\n镜头 01 · 林深房间 · 清晨 · 全景\n景别：全景｜机位：固定｜时长：4s\n动作：晨光从窗帘缝隙落到林深熟睡的脸上，尘埃在光柱中缓慢漂浮。\n台词：（无）\nvideoPrompt：清晨阳光斜射入凌乱的都市单身公寓，光柱中尘埃漂浮，4 秒静态全景，冷蓝偏暖，胶片颗粒，电影质感\n\n镜头 02 · 林深房间 · 床头 · 中景\n景别：中景｜机位：床尾正对｜时长：3s\n动作：林深翻身，眉头紧皱，呼吸渐促。\n台词：（无）\nvideoPrompt：男子在床上翻身呼吸渐促，眉头紧皱，3 秒中景，冷蓝光，电影质感写实\n\n镜头 03 · 林深房间 · 全景 · 惊醒\n景别：全景｜机位：床头俯拍｜时长：5s\n动作：林深从床上猛地坐起，眼神聚焦到床头柜，下意识按住床头。\n台词：（无）\nvideoPrompt：男子从床上猛地坐起惊醒，眼神聚焦到床头柜的钥匙，下意识按住床头，5 秒，紧张感，冷蓝主光暖色点缀，电影质感\n\n镜头 04 · 钥匙 · 超近景\n景别：超近景｜机位：床头柜｜时长：3s\n动作：黄铜钥匙静卧，齿纹清晰，侧光形成长阴影。\n台词：（无）\nvideoPrompt：陈旧黄铜钥匙特写，齿纹复杂，侧光长阴影，3 秒慢推，悬疑氛围，胶片颗粒感，电影质感超近景\n\n（…镜头 05-14 类似省略示意…）',
        sourceSessionId: 's_dr_storyboard', createdAt: T(7095) },
      { id: 'a_dr_storyboard_v2', name: 'S1E1 分镜脚本', type: 'text', version: 2, folderId: 'f_dr_scripts',
        body: '【片名】S1E1 · 钥匙\n【时长】6 分 24 秒（修订）\n【镜头总数】14\n【更新】镜头 03 时长 5s → 3s（节奏更紧）；镜头 07 苏离入场加手部特写\n\n────────────────────\n镜头 01 · 林深房间 · 清晨 · 全景\n景别：全景｜机位：固定｜时长：4s\n动作：晨光从窗帘缝隙落到林深熟睡的脸上，尘埃在光柱中缓慢漂浮。\nvideoPrompt：清晨阳光斜射入凌乱的都市单身公寓，光柱中尘埃漂浮，4 秒静态全景，冷蓝偏暖，胶片颗粒，电影质感\n\n镜头 02 · 林深房间 · 床头 · 中景\n景别：中景｜机位：床尾正对｜时长：3s\n动作：林深翻身，眉头紧皱，呼吸渐促。\nvideoPrompt：男子在床上翻身呼吸渐促，眉头紧皱，3 秒中景，冷蓝光，电影质感写实\n\n镜头 03 · 林深房间 · 全景 · 惊醒（修订：5s→3s）\n景别：全景｜机位：床头俯拍｜时长：3s\n动作：林深从床上猛地坐起，眼神聚焦到床头柜，下意识按住床头。心跳音效拍打节奏。\nvideoPrompt：男子从床上猛地坐起惊醒，眼神聚焦到床头柜的钥匙，下意识按住床头，3 秒紧张感节奏紧凑，冷蓝主光暖色点缀，电影质感\n\n镜头 04 · 钥匙 · 超近景\n景别：超近景｜机位：床头柜｜时长：3s\n动作：黄铜钥匙静卧，齿纹清晰，侧光形成长阴影。\nvideoPrompt：陈旧黄铜钥匙特写，齿纹复杂，侧光长阴影，3 秒慢推，悬疑氛围，胶片颗粒感，电影质感超近景\n\n镜头 05 · 林深 · 中近景 · 拿起钥匙\n景别：中近景｜机位：肩后视角｜时长：4s\n动作：林深伸手拾起钥匙，仔细端详。\nvideoPrompt：男子从肩后视角伸手拾起一把陈旧黄铜钥匙，仔细端详，4 秒，冷蓝光，电影质感\n\n镜头 06 · 警局走廊 · 全景 · 转场\n景别：全景｜机位：跟随｜时长：3s\n动作：林深推开警局玻璃门，走过冷白色走廊。\nvideoPrompt：男子推开警局玻璃门走过冷白色走廊，3 秒跟随镜头，蓝灰色调，电影质感\n\n镜头 07 · 法医室 · 苏离入场（修订：加手部特写）\n景别：中景 + 0.8s 手部特写嵌入｜机位：固定｜时长：4s\n动作：苏离背身整理工具；切手部特写：戴手套，动作精准；切回中景，她回头。\n台词：苏离："你迟了 17 分钟。"\nvideoPrompt：女法医背身在金属台前整理工具，0.8 秒切到戴手套手部特写然后回中景她回头说话，4 秒，冷白光，悬疑氛围，电影质感\n\n（…镜头 08-14 类似省略示意…）',
        sourceSessionId: 's_dr_storyboard', createdAt: T(6798),
        annotations: [
          { id: 'an_sb_1', text: '镜头 03 节奏改对了，但建议加心跳音效的具体频率（建议 90 BPM）', createdAt: T(50), author: 'Bruce' },
          { id: 'an_sb_2', text: '镜头 07 的"你迟了 17 分钟"台词很好，建议苏离不抬头说更显专业', createdAt: T(35), author: 'Bruce' }
        ] }
    ],
    image: [
      { id: 'a_dr_lushen_v1', name: '林深 V1', type: 'image', version: 1, src: 'assets/placeholder-image-v.svg', sourceSessionId: 's_dr2', createdAt: T(80), folderId: 'f_dr_lushen',
        prompt: '28岁中国男性，寸头略乱，眼下有淡青疲惫感，习惯性低头，灰色帽衫，9:16 竖屏，冷蓝光打在侧脸，胶片颗粒感，电影质感近景。' },
      { id: 'a_dr_lushen_v2', name: '林深 V2', type: 'image', version: 2, src: 'assets/placeholder-image-v.svg', sourceSessionId: 's_dr2', createdAt: T(78), folderId: 'f_dr_lushen',
        prompt: '28岁中国男性，眼神锐利专注盯着远方，寸头，灰色帽衫，9:16 竖屏，冷蓝侧光，电影质感近景，胶片颗粒感。' },
      { id: 'a_dr_lushen_v3', name: '林深 V3', type: 'image', version: 3, src: 'assets/placeholder-image-v.svg', sourceSessionId: 's_dr2', createdAt: T(76), folderId: 'f_dr_lushen',
        prompt: '28岁中国男性，失眠疲惫眼神涣散，寸头略乱，灰色帽衫，肩膀微缩，9:16 竖屏，冷蓝主光暖色点缀，电影质感近景，强细节写实。' },
      // 苏离（女主，法医） V1/V2
      { id: 'a_dr_suli_v1', name: '苏离 V1', type: 'image', version: 1, src: 'assets/placeholder-image-v.svg', sourceSessionId: 's_dr2', createdAt: T(74), folderId: 'f_dr_suli',
        prompt: '27岁中国女性法医，齐肩黑直发，肤白，白色法医制服，眼神锐利专注，9:16 竖屏，冷白光，电影质感中景。' },
      { id: 'a_dr_suli_v2', name: '苏离 V2', type: 'image', version: 2, src: 'assets/placeholder-image-v.svg', sourceSessionId: 's_dr2', createdAt: T(73), folderId: 'f_dr_suli',
        prompt: '27岁中国女性法医戴乳胶手套低头检查证物，齐肩黑直发，白色法医制服，9:16 竖屏，冷白荧光灯，专业感强，电影质感近景。',
        annotations: [
          { id: 'an_suli_1', text: '手套要用乳胶白色，不要黑色', createdAt: T(50), author: 'Bruce' }
        ] },
      // 周可（追查者）V1/V2
      { id: 'a_dr_zhouke_v1', name: '周可 V1', type: 'image', version: 1, src: 'assets/placeholder-image-v.svg', sourceSessionId: 's_dr2', createdAt: T(72), folderId: 'f_dr_zhouke',
        prompt: '32岁中国男性私家侦探，棕色风衣，络腮胡，深邃眼神，雨夜街灯下，9:16 竖屏，蓝灰冷调暖色点缀，电影质感中景。' },
      { id: 'a_dr_zhouke_v2', name: '周可 V2', type: 'image', version: 2, src: 'assets/placeholder-image-v.svg', sourceSessionId: 's_dr2', createdAt: T(71), folderId: 'f_dr_zhouke',
        prompt: '32岁中国男性私家侦探在监控室盯着多块屏幕，棕色风衣，络腮胡，眼神专注，9:16 竖屏，屏幕蓝光打在脸上，电影质感中近景。' },
      // 李警官（配角）V1
      { id: 'a_dr_lijing_v1', name: '李警官 V1', type: 'image', version: 1, src: 'assets/placeholder-image-v.svg', sourceSessionId: 's_dr2', createdAt: T(70), folderId: 'f_dr_chars',
        prompt: '40岁中国男性警官，黑色警服，国字脸，威严表情，警局走廊冷白光，9:16 竖屏，电影质感中景。' },
      // 黄医师（配角）V1
      { id: 'a_dr_huang_v1', name: '黄医师 V1', type: 'image', version: 1, src: 'assets/placeholder-image-v.svg', sourceSessionId: 's_dr2', createdAt: T(69), folderId: 'f_dr_chars',
        prompt: '50岁中国男性老中医，灰白头发，金丝眼镜，棕色羊毛背心，温润眼神，9:16 竖屏，暖黄灯下，电影质感近景。' },
      { id: 'a_dr_key_v1', name: '钥匙特写', type: 'image', version: 1, src: 'assets/placeholder-image-v.svg', sourceSessionId: 's_dr2', createdAt: T(68), folderId: 'f_dr_props',
        prompt: '一把陈旧黄铜钥匙的特写，齿纹复杂，放在浅灰色亚麻布上，光线从侧面斜射形成长阴影，悬疑氛围，胶片颗粒感，9:16 竖屏，电影质感超近景。',
        annotations: [
          { id: 'an_key_1', text: '钥匙锈迹再重一点，要那种被时间遗忘的感觉', createdAt: T(50), author: 'Bruce' },
          { id: 'an_key_2', text: '光线再暗一些，只让钥匙齿纹处有反光', createdAt: T(45), author: 'Bruce' }
        ] },
      { id: 'a_dr_room_v1', name: '林深房间', type: 'image', version: 1, src: 'assets/placeholder-image-v.svg', sourceSessionId: 's_dr2', createdAt: T(64), folderId: 'f_dr_scenes',
        prompt: '都市单身公寓清晨，凌乱的床，窗帘半拉，斜阳从缝隙射入形成尘埃光柱，悬疑色调，蓝灰偏冷暖色点缀，9:16 竖屏，电影质感全景。',
        annotations: [
          { id: 'an_room_1', text: '床头方向应该是窗户，光线从左上方进来', createdAt: T(48), author: 'Bruce' },
          { id: 'an_room_2', text: '地面再多一些散落的衣物，体现疲惫感', createdAt: T(42), author: 'Bruce' }
        ] },
      { id: 'a_dr_room_v2', name: '林深房间', type: 'image', version: 2, src: 'assets/placeholder-image-v.svg', sourceSessionId: 's_dr2', createdAt: T(63), folderId: 'f_dr_scenes',
        prompt: '都市单身公寓清晨，凌乱的床位于画面右侧（左上方有窗户），地面散落几件衣物体现疲惫感，左上方阳光从窗帘缝隙射入形成尘埃光柱，悬疑色调，蓝灰冷调暖色点缀，9:16 竖屏，电影质感全景。' },
      // 警局法医室（凌晨3点）
      { id: 'a_dr_lab_v1', name: '法医室·凌晨3点', type: 'image', version: 1, src: 'assets/placeholder-image-v.svg', sourceSessionId: 's_dr2', createdAt: T(62), folderId: 'f_dr_scenes',
        prompt: '警局法医室深夜凌晨3点，冷白荧光灯，金属台面 + 玻璃柜陈列证物，背景模糊有人影整理工具，9:16 竖屏，悬疑氛围，电影质感全景。' },
      // 警局走廊
      { id: 'a_dr_corridor_v1', name: '警局走廊', type: 'image', version: 1, src: 'assets/placeholder-image-v.svg', sourceSessionId: 's_dr2', createdAt: T(60), folderId: 'f_dr_scenes',
        prompt: '警局走廊，蓝灰冷色调，两侧玻璃门反射冷白光，地面瓷砖反光，深景纵深感强，9:16 竖屏，悬疑氛围，电影质感全景。' },
      // 监控室
      { id: 'a_dr_monitor_v1', name: '监控室', type: 'image', version: 1, src: 'assets/placeholder-image-v.svg', sourceSessionId: 's_dr2', createdAt: T(58), folderId: 'f_dr_scenes',
        prompt: '昏暗监控室，多块监视器墙面，每块屏幕显示不同摄像头画面，操作员剪影，蓝紫色调，9:16 竖屏，悬疑氛围，电影质感中景。' },
      // 雨夜街道
      { id: 'a_dr_street_v1', name: '雨夜街道', type: 'image', version: 1, src: 'assets/placeholder-image-v.svg', sourceSessionId: 's_dr2', createdAt: T(56), folderId: 'f_dr_scenes',
        prompt: '雨夜城市小巷，潮湿地面反射霓虹灯，远处一个孤独人影行走，蓝紫冷调，强对比度，9:16 竖屏，悬疑氛围，电影质感全景。' },
      // 仓库
      { id: 'a_dr_warehouse_v1', name: '废弃仓库', type: 'image', version: 1, src: 'assets/placeholder-image-v.svg', sourceSessionId: 's_dr2', createdAt: T(54), folderId: 'f_dr_scenes',
        prompt: '废弃仓库内部，蜡烛光从一侧照射高大空间，灰尘漂浮在光柱中，破旧木箱堆叠，9:16 竖屏，悬疑氛围，电影质感全景。' },
      // 茶水间
      { id: 'a_dr_pantry_v1', name: '警局茶水间', type: 'image', version: 1, src: 'assets/placeholder-image-v.svg', sourceSessionId: 's_dr2', createdAt: T(52), folderId: 'f_dr_scenes',
        prompt: '警局茶水间，暖黄壁灯下饮水机旁两人对话剪影，木桌椅，对比走廊冷白光，9:16 竖屏，电影质感全景。' },
      // 道具：录像带
      { id: 'a_dr_tape_v1', name: '监控录像带', type: 'image', version: 1, src: 'assets/placeholder-image-v.svg', sourceSessionId: 's_dr2', createdAt: T(50), folderId: 'f_dr_props',
        prompt: '90年代旧式 VHS 录像带特写，磁带可见物理损伤，木桌面，冷光照明，标签泛黄，9:16 竖屏，悬疑氛围，电影质感超近景。' },
      // 道具：笔记本
      { id: 'a_dr_notebook_v1', name: '林深笔记本', type: 'image', version: 1, src: 'assets/placeholder-image-v.svg', sourceSessionId: 's_dr2', createdAt: T(48), folderId: 'f_dr_props',
        prompt: '黑色硬皮笔记本特写翻开，纸页可见手写线索图，钢笔墨迹，台灯暖黄光从右上方照射，9:16 竖屏，悬疑氛围，电影质感超近景。' }
    ],
    video: [
      { id: 'a_dr_video_morning_v1', name: '清晨光柱', type: 'video', version: 1, src: 'assets/placeholder-video-v.svg', duration: '00:04', sourceSessionId: 's_dr3', createdAt: T(45), folderId: 'f_dr_videos',
        prompt: '镜头 01 · 清晨阳光斜射入凌乱的都市单身公寓，光柱中尘埃漂浮，4 秒静态全景，冷蓝偏暖，胶片颗粒，电影质感（基于场景：林深房间 V2）。',
        storyboardRef: 'shot-01' },
      { id: 'a_dr_video_wakeup_v1', name: '林深惊醒', type: 'video', version: 1, src: 'assets/placeholder-video-v.svg', duration: '00:03', sourceSessionId: 's_dr3', createdAt: T(40), folderId: 'f_dr_videos',
        prompt: '镜头 03 · 林深从床上猛地坐起惊醒，眼神聚焦到床头柜的钥匙，下意识按住床头，3 秒紧张感节奏紧凑，冷蓝主光暖色点缀，电影质感（基于角色：林深 V3 + 场景：林深房间 V2）。',
        storyboardRef: 'shot-03' },
      { id: 'a_dr_video_keypush_v1', name: '钥匙慢推镜', type: 'video', version: 1, src: 'assets/placeholder-video-v.svg', duration: '00:03', sourceSessionId: 's_dr3', createdAt: T(35), folderId: 'f_dr_videos',
        prompt: '镜头 04 · 陈旧黄铜钥匙特写，齿纹复杂，侧光长阴影，3 秒慢推，悬疑氛围，胶片颗粒感，电影质感超近景（基于道具：钥匙特写）。',
        storyboardRef: 'shot-04' },
      { id: 'a_dr_video_corridor_v1', name: '警局走廊跟拍', type: 'video', version: 1, src: 'assets/placeholder-video-v.svg', duration: '00:03', sourceSessionId: 's_dr3', createdAt: T(30), folderId: 'f_dr_videos',
        prompt: '镜头 06 · 男子推开警局玻璃门走过冷白色走廊，3 秒跟随镜头，蓝灰色调，电影质感（基于角色：林深 V3 + 场景：警局走廊）。',
        storyboardRef: 'shot-06' },
      { id: 'a_dr_video_suli_intro_v1', name: '苏离入场', type: 'video', version: 1, src: 'assets/placeholder-video-v.svg', duration: '00:04', sourceSessionId: 's_dr3', createdAt: T(25), folderId: 'f_dr_videos',
        prompt: '镜头 07 · 女法医背身在金属台前整理工具，0.8 秒切到戴乳胶手套手部特写然后回中景她回头说话"你迟了 17 分钟"，4 秒，冷白光，悬疑氛围，电影质感（基于角色：苏离 V2 + 场景：法医室）。',
        storyboardRef: 'shot-07',
        annotations: [
          { id: 'an_v_suli_1', text: '苏离不抬头说更显专业', createdAt: T(20), author: 'Bruce' }
        ] },
      { id: 'a_dr_video_street_v1', name: '雨夜街道全景', type: 'video', version: 1, src: 'assets/placeholder-video-v.svg', duration: '00:05', sourceSessionId: 's_dr3', createdAt: T(20), folderId: 'f_dr_videos',
        prompt: '镜头 11 · 雨夜城市小巷潮湿地面反射霓虹灯，远处人影逐渐走近，5 秒缓慢推进，蓝紫冷调，悬疑氛围，电影质感全景（基于角色：周可 V1 + 场景：雨夜街道）。',
        storyboardRef: 'shot-11' }
    ],
    audio: []
  };

  const dramaSessionFolders = [
    { id: 'sf_archive', name: '归档', parentId: null, isArchive: true, createdAt: T(120) }
  ];

  const projects = [
    { id: 'p_drama', name: '短剧S1E1', templateId: 'drama', createdAt: T(120),
      sessions: dramaSessions, assets: dramaAssets,
      folders: dramaFolders, sessionFolders: dramaSessionFolders }
  ];

  // ─── Input-bar config (unchanged from v1) ───────────────────────────
  const TASK_TYPES = [
    { id: 'video', label: '视频生成', icon: 'video' },
    { id: 'image', label: '图片生成', icon: 'image' },
    { id: 'text',  label: '文本生成', icon: 'file-text' }
  ];

  const MODELS = {
    video: ['Seedance 2.0', 'Seedance 2.0 Fast'],
    image: ['GPT Image 2', 'Nano Banana 2', 'Nano Banana Pro', 'Midjourney V7'],
    text:  ['DeepSeekv4pro', 'doubao', 'kimi2.6', 'GLM5.1']
  };

  const TEXT_SKILLS = [
    { id: 'script-breakdown', label: '短剧拆解', builtin: true },
    { id: 'storyboard',       label: '短剧分镜', builtin: true },
    { id: 'create-skill',     label: '创建技能', builtin: true, isCreate: true },
    { id: 'upload-skill',     label: '上传技能', builtin: true, isUpload: true }
  ];

  // Reference modes available per model (video task only)
  const MODEL_REF_MODES = {
    'Seedance 2.0':      ['全能参考', '首尾帧'],
    'Seedance 2.0 Fast': ['全能参考', '首尾帧']
  };

  const RATIO_SHAPES = {
    video: ['21:9', '16:9', '4:3', '1:1', '3:4', '9:16'],
    image: ['16:9', '4:3', '1:1', '3:4', '9:16']
  };

  const RESOLUTIONS = {
    video: ['720P', '1080P'],
    image: ['高清2K', '标清1K']
  };

  const DURATIONS = {
    video: ['4s', '5s', '6s', '7s', '8s', '9s', '10s', '11s', '12s', '13s', '14s', '15s']
  };

  const COUNTS = [1, 2, 4];

  const CONTROL_MATRIX = {
    video: ['model', 'refMode', 'ratio', 'duration', 'count', 'balance'],
    image: ['model', 'ratio', 'textFx', 'balance'],
    text:  ['model', 'skill', 'tokenUsage']
  };

  const COST_PER_CALL = { video: 12, image: 4, text: 0 };

  const BALANCE_LABEL = {
    video: '💎 210',
    image: '✨ 0/张',
    text:  '◔ 0'
  };

  const TEXT_TOKEN_LIMIT = 128000;

  const TEXT_DOC_MOCK = {
    title: '《水蜜桃乌龙奶茶》剧本拆解文档',
    content: `场景一：写字楼 · 夜

【场景描述】
深夜的写字楼，大部分工位已经熄灯。冷白色的荧光灯照在空荡荡的办公区，只有角落里一盏台灯还亮着。键盘敲击声在安静的空间里格外清晰。

【角色】
主角 - Lucy，26岁，初入职场的广告策划
· 穿着略皱的白衬衫，袖口卷到小臂
· 黑框眼镜，头发用铅笔随意别起
· 桌上堆着咖啡杯和便利贴

【对白】
Lucy：（揉眼睛，看了一眼时钟）"又是九点半……"
（她叹了口气，目光落在抽屉上）

【镜头指示】
· 开场：俯拍整个办公区，推进到 Lucy 工位（3s）
· 特写：Lucy 疲惫的眼神，屏幕蓝光打在脸上（2s）
· 中景：Lucy 打开抽屉（1.5s）

────────────────────────────

场景二：茶水间 · 晚9点

【场景描述】
从冷色调的办公区推门进入茶水间，灯光瞬间变为温暖的橘黄色。一个小型冰柜发出轻微的嗡嗡声。墙上挂着一幅桃花水彩画。

【角色】
Lucy - 从工位走来，手里拿着那杯水蜜桃乌龙

【对白】
Lucy：（插入吸管的瞬间，微笑）
旁白（OS）：一杯就够，把今天还给自己。

【镜头指示】
· 跟拍：Lucy 推开茶水间的门，冷暖光交接的瞬间（2s）
· 特写：吸管插入杯盖，桃粉色液面微微晃动（2s）
· 慢镜头：Lucy 第一口吸上来的表情变化（3s）
· 结尾定格：Logo + Tagline 叠加在温暖的画面上（2s）

────────────────────────────

场景三：走出写字楼 · 夜

【场景描述】
Lucy 拿着奶茶走出写字楼大门，街灯暖光洒下，她的步伐比来时轻快了许多。远处城市的灯火闪烁。

【镜头指示】
· 全景：Lucy 的背影走向街灯下（3s）
· 尾帧：品牌 Logo 渐入，画面定格`
  };

  // 演示模式初始收藏（首次访问时如果用户态空则注入）— 8 条不同风格
  const INITIAL_FAVORITES = [
    { name: '冷蓝主光人物近景', prompt: '28岁男性，失眠疲惫眼神涣散，灰色帽衫，9:16 竖屏，冷蓝主光暖色点缀，电影质感近景，胶片颗粒感。', imageSrc: 'assets/placeholder-image-v.svg', createdAt: T(2880) },
    { name: '法医戴手套低头检查', prompt: '27岁女性法医戴乳胶手套低头检查证物，齐肩黑直发，白色法医制服，9:16 竖屏，冷白荧光灯，专业感强，电影质感近景。', imageSrc: 'assets/placeholder-image-v.svg', createdAt: T(2700) },
    { name: '雨夜街道全景悬疑', prompt: '雨夜城市小巷潮湿地面反射霓虹灯，远处一个孤独人影行走，蓝紫冷调强对比度，9:16 竖屏，悬疑氛围，电影质感全景。', imageSrc: 'assets/placeholder-image-v.svg', createdAt: T(2520) },
    { name: '道具特写超近景', prompt: '陈旧黄铜钥匙特写，齿纹复杂，浅灰亚麻布上，侧光长阴影，悬疑氛围，胶片颗粒感，9:16 竖屏，电影质感超近景。', imageSrc: 'assets/placeholder-image-v.svg', createdAt: T(2340) },
    { name: '监控室多屏剪影', prompt: '昏暗监控室多块监视器墙面，每块屏幕显示不同摄像头画面，操作员剪影，蓝紫色调，9:16 竖屏，悬疑氛围，电影质感中景。', imageSrc: 'assets/placeholder-image-v.svg', createdAt: T(2160) },
    { name: '走廊跟拍纵深', prompt: '人物推开玻璃门走过冷白色走廊，跟随镜头，两侧玻璃门反射冷白光，地面瓷砖反光，深景纵深感强，9:16 竖屏，电影质感全景。', imageSrc: 'assets/placeholder-image-v.svg', createdAt: T(1980) },
    { name: '茶水间暖光对话', prompt: '警局茶水间暖黄壁灯下饮水机旁两人对话剪影，木桌椅，对比走廊冷白光，9:16 竖屏，电影质感全景。', imageSrc: 'assets/placeholder-image-v.svg', createdAt: T(1800) },
    { name: '废仓蜡烛光柱', prompt: '废弃仓库内部蜡烛光从一侧照射高大空间，灰尘漂浮在光柱中，破旧木箱堆叠，9:16 竖屏，悬疑氛围，电影质感全景。', imageSrc: 'assets/placeholder-image-v.svg', createdAt: T(1620) }
  ];

  return {
    projects,
    TASK_TYPES, MODELS, MODEL_REF_MODES, RATIO_SHAPES, RESOLUTIONS, DURATIONS, COUNTS,
    CONTROL_MATRIX, COST_PER_CALL, BALANCE_LABEL,
    TEXT_SKILLS, TEXT_TOKEN_LIMIT, TEXT_DOC_MOCK,
    INITIAL_FAVORITES
  };
})();

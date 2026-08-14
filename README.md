# 找到狡猾的猪腰 · 官网

「找到狡猾的猪腰」微信小程序的官方宣传单页，一个围绕**控卡减脂**展开的单页站，走「降妖铁馆 / 标本册档案室」的视觉设定。

> 访问：<https://fatti.ai-dddd.top>
> 小程序：微信搜索「找到狡猾的猪腰」

## 这是什么

FatTI 控卡小程序是一个 AI 减脂工具：填 5 步档案（身体、作息、常去的店、厨房里有什么），AI 按你的热量缺口和饮食习惯，出**当天四餐控卡单**——每餐标好时间、菜名和热量，吃完一餐勾一餐，用日历攒成控卡日程。

本仓库是它的官网，用真实的小程序界面截图 + 16 只「脂妖」插画 + 小程序码，把产品能力讲清楚，并引导用户扫码进入小程序。

## 页面板块

| 板块 | 内容 |
|------|------|
| Hero | 主视觉 + 控卡首页截图 + 小程序二维码，一键扫码直达 |
| 控卡单 | 24 格热量颗粒条 Signature + 5 大功能点：AI 出单 / 四餐计划 / 换菜 / 热量对账 / 打卡与日历 |
| 妖兽墙 | 16 只脂妖插画卡横排（测脂格彩蛋入口） |
| 使用步骤 | 三步进馆：打开小程序 → 填档案 → 出单照着吃 |
| FAQ | 常见问题手风琴 |
| 跟练教程 | 独立长文页 `tutorial.html`：从 0 到 1 用 AI 做出你的微信小程序（12 章 + 3 附录） |
| Footer | 免责声明 + 梗出处标注 |

## 跟练教程（tutorial.html）

内容源位于本仓库 `tutorial-md/*.md`（此前在 FatTI 仓库 `docs/ops/tutorial/`，已迁移并改为软链接），本仓库 `scripts/build-tutorial.mjs` 把源文编译为 `tutorial.html`（零依赖 markdown 子集解析 + 官网 tokens 模板），并自动生成 `assets/tutorial/Sxx.svg` 截图占位图。

```bash
# 内容更新后重新编译（不传参时默认使用本仓库 tutorial-md/）
node scripts/build-tutorial.mjs tutorial-md

# 上线自检（含教程页断言）
node scripts/verify.mjs
```

约定：
- 教程 md 源文只在本仓库 `tutorial-md/` 维护；FatTI 仓库 `docs/ops/tutorial/` 与规划文档均为指向此处的软链接
- 用户截图按 S01~S43 编号补充，替换 `assets/tutorial/Sxx.svg` 或改 `tutorial.html` 中对应 `src`
- 截图占位 / 章节结构 / 隐私占位符由 verify 与构建时 lint 双重把关

## 技术栈

- 纯静态站：HTML + CSS + 原生 JavaScript，零构建、零依赖
- 浅色档案室纸感：CSS 自定义属性 token 体系（颜色与小程序保持一致）
- 微交互：颗粒条滚入逐格填充、Hero 截图贴纸浮入、FAQ 手风琴
- 部署：GitHub Pages，自定义域名 `fatti.ai-dddd.top`

## 目录结构

```
├── index.html          # 单页全部板块
├── tutorial.html       # 跟练教程长文页（由脚本生成，勿手改）
├── tutorial-md/        # 教程 md 源文（00-preface.md 至 12-iterate.md + 3 附录 + 规划文档）
├── css/
│   ├── main.css        # 设计 token + 板块样式（响应式）
│   └── tutorial.css    # 教程页样式（复用 main.css tokens）
├── js/
│   ├── beasts.js       # 16 只脂妖数据 + 妖兽墙渲染
│   ├── granule.js      # 24 格热量颗粒条
│   ├── faq.js          # FAQ 手风琴
│   └── tutorial.js     # 教程目录滚动高亮 + 截图占位提示
├── assets/
│   ├── shots/          # 小程序模拟器截图（控卡首页/今日执行/餐次/日历）
│   ├── beasts/         # 16 张妖兽插画
│   ├── tutorial/       # 教程截图占位（S01~S43.svg）+ 技术栈关系图
│   └── mp-qrcode.jpg   # 小程序码
├── scripts/
│   ├── verify.mjs      # 上线自检脚本（含教程页断言）
│   └── build-tutorial.mjs  # md 源文 → tutorial.html 编译脚本
└── CNAME               # 自定义域名
```

## 本地预览与自检

```bash
# 本地预览
python3 -m http.server 8811

# 上线自检（图片存在 / 零 em-dash / 16 妖 / 5 功能点 / CTA 唯一 / 梗出处）
node scripts/verify.mjs
```

## 部署

`main` 分支直接部署 GitHub Pages：

- 改内容后 `git push origin main` 即自动重新部署。
- 域名 DNS 记录（在 `ai-dddd.top` 控制台配置）：

  ```
  fatti  CNAME  imklayhu.github.io
  ```

## 素材来源

- 控卡截图：微信开发者工具模拟器截图（`assets/shots/*.jpg`），来自小程序「控卡首页 / 今日执行 / 餐次详情 / 日程」页面。
- 妖兽插画：小程序插画资产（`assets/beasts/persona-*.png`），与小程序 16 只脂妖一一对应。
- 小程序码：微信小程序后台生成的普通链接二维码（`assets/mp-qrcode.jpg`）。

## 相关项目

- FatTI（私有仓库）：控卡小程序本体（Taro + React + TypeScript）。本仓库的截图、妖兽插画等素材均来自小程序运行时。

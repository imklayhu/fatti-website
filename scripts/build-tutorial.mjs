// scripts/build-tutorial.mjs —— node scripts/build-tutorial.mjs [md目录]
// 把本仓库 tutorial-md/*.md 编译为官网 tutorial.html。
// 零依赖 markdown 子集解析 + 官网 tokens 模板。可重复执行：
//   - 首次运行生成 assets/tutorial/Sxx.svg 占位图（S01~S43）
//   - 截图引用规则：assets/tutorial/ 下已有 Sxx.png 则引用 png（用户实拍截图），
//     否则回退到 Sxx.svg 占位图（png 优先、svg 兜底）。用户补截图只需把
//     png 放进 assets/tutorial/ 后重跑本脚本，无需手改 tutorial.html
//   - 内容更新后重跑本脚本即重新上线
// 用法（不传参时默认使用本仓库 tutorial-md/）：
//   node scripts/build-tutorial.mjs tutorial-md
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const mdDir = process.argv[2] ? resolve(process.argv[2]) : resolve(root, 'tutorial-md')
const outHtml = resolve(root, 'tutorial.html')
const shotDir = resolve(root, 'assets/tutorial')

// ---------- 章节顺序 ----------
const ORDER = [
  '00-preface.md', '01-scanning.md', '02-tools.md', '03-accounts.md',
  '04-skills.md', '05-skeleton.md', '06-content.md', '07-core-flow.md',
  '08-visual.md', '09-share.md', '10-backend.md', '11-launch.md',
  '12-iterate.md', 'appendix-a-pitfalls.md', 'appendix-b-budget.md',
  'appendix-c-glossary.md',
]

const NUM_MAP = {
  '00': '序', '01': '第 1 章', '02': '第 2 章', '03': '第 3 章', '04': '第 4 章',
  '05': '第 5 章', '06': '第 6 章', '07': '第 7 章', '08': '第 8 章', '09': '第 9 章',
  '10': '第 10 章', '11': '第 11 章', '12': '第 12 章',
  'appendix-a': '附录 A', 'appendix-b': '附录 B', 'appendix-c': '附录 C',
}

// ---------- 工具 ----------
const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function inline(text) {
  return esc(text)
    .replace(/`([^`]+)`/g, (m, c) => `<code>${c}</code>`)
    .replace(/\*\*([^*]+)\*\*/g, (m, c) => `<strong>${c}</strong>`)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, (m, t, url) => `<a href="${url}" target="_blank" rel="noopener">${t}</a>`)
}

// 构建时校验：内联文本反引号必须成对（奇数个反引号说明源文有歧义/错位）
function lintBackticks(text, where) {
  const n = (text.match(/`/g) || []).length
  if (n % 2 !== 0) {
    throw new Error(`内联反引号不成对（${n} 个）于 ${where}：${JSON.stringify(text.slice(0, 60))}`)
  }
}

// 截图占位符行 -> tut-shot figure（src 优先指向 assets/tutorial/Sxx.png，
// png 不存在时回退到 Sxx.svg 占位图）
function shotHtml(match, alt, src) {
  const id = (src.match(/S(\d{2})/) || [])[1] || src.replace(/\.(png|jpg|jpeg)$/, '')
  const fullId = `S${id}`
  const pngPath = resolve(shotDir, `${fullId}.png`)
  const imgSrc = existsSync(pngPath)
    ? `assets/tutorial/${fullId}.png`
    : `assets/tutorial/${fullId}.svg`
  const capText = alt.replace(/^S\d{2} ·\s*/, '')
  return (
    `<figure class="tut-shot" data-shot="${fullId}">\n` +
    `  <div class="tut-shot__frame">\n` +
    `    <img src="${imgSrc}" data-src="${imgSrc}" alt="${esc(alt.replace(/`/g, ''))}" loading="lazy">\n` +
    `  </div>\n` +
    `  <figcaption class="tut-shot__cap">截图 <span class="mono">${fullId}</span> · ${inline(capText)}</figcaption>\n` +
    `</figure>`
  )
}

// ---------- md 块解析 ----------
function parseBlocks(lines) {
  const blocks = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const t = line.trim()
    if (t === '') { i++; continue }
    if (t.startsWith('<!--')) { i++; continue }

    if (t.startsWith('```')) {
      const buf = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) { buf.push(lines[i]); i++ }
      i++
      blocks.push({ type: 'code', code: buf.join('\n') })
      continue
    }

    const h = t.match(/^(#{1,3}) (.*)$/)
    if (h) {
      blocks.push({ type: `h${h[1].length}`, text: h[2] })
      i++
      continue
    }

    if (/^\|.*\|$/.test(t)) {
      const rows = []
      while (i < lines.length && /^\|.*\|$/.test(lines[i].trim())) { rows.push(lines[i].trim()); i++ }
      blocks.push({ type: 'table', rows })
      continue
    }

    if (/^> /.test(t)) {
      const buf = []
      while (i < lines.length && /^> /.test(lines[i])) { buf.push(lines[i].replace(/^> /, '')); i++ }
      blocks.push({ type: 'quote', lines: buf })
      continue
    }

    if (/^[-*] /.test(t)) {
      const items = []
      while (i < lines.length && /^[-*] /.test(lines[i])) { items.push(lines[i].replace(/^[-*] /, '')); i++ }
      blocks.push({ type: 'ul', items })
      continue
    }

    if (/^\d+\. /.test(t)) {
      const items = []
      while (i < lines.length && /^\d+\. /.test(lines[i])) { items.push(lines[i].replace(/^\d+\. /, '')); i++ }
      blocks.push({ type: 'ol', items })
      continue
    }

    const buf = [line]
    i++
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(#{1,3} |```|\|.*\||> |[-*] |\d+\. )/.test(lines[i])
    ) { buf.push(lines[i]); i++ }
    blocks.push({ type: 'p', text: buf.join('\n') })
  }
  return blocks
}

function tableHtml(rows) {
  const cells = (row) => row.replace(/^\||\|$/g, '').split('|').map((c) => c.trim())
  const head = cells(rows[0])
  const bodyRows = rows.slice(2) // 跳过分隔行
  const thead = `<thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead>`
  const tbody = bodyRows.length
    ? `<tbody>${bodyRows.map((r) => `<tr>${cells(r).map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody>`
    : ''
  return `<div class="tut-table-wrap"><table class="tut-table">${thead}${tbody}</table></div>`
}

// ---------- 章节渲染 ----------
function renderChapter(file) {
  const raw = readFileSync(resolve(mdDir, file), 'utf8')
  const lines = raw.split('\n')
  const blocks = parseBlocks(lines)
  const slug = basename(file, '.md')
  const num = NUM_MAP[slug.split('-')[0]] || slug

  const h1 = blocks.find((b) => b.type === 'h1')
  const title = h1 ? h1.text.replace(/^第 \d+ 章 ·\s*/, '').replace(/^序 ·\s*/, '') : slug

  // 提取「本章目标」：第一个 quote 块中「本章目标：」开头的行
  let goal = ''
  const firstQuote = blocks.find((b) => b.type === 'quote')
  if (firstQuote) {
    const goalLine = firstQuote.lines.find((l) => l.includes('本章目标'))
    if (goalLine) goal = goalLine.replace(/^.*本章目标[:：]?\s*/, '').trim()
  }

  const parts = []
  let mode = '' // '' | 'checklist' | 'summary'
  let opened = false

  for (const b of blocks) {
    if (b.type === 'h1') continue // 已在章节卡

    if (b.type === 'h2') {
      if (b.text.includes('自查清单')) { mode = 'checklist'; opened = true; parts.push(`<div class="tut-checklist"><p class="tut-checklist__title mono">自查清单</p><ul>`); continue }
      if (b.text.includes('本章小结')) { mode = 'summary'; opened = true; parts.push(`<div class="tut-summary"><p class="tut-summary__title mono">本章小结</p><ul>`); continue }
      parts.push(`<h3>${inline(b.text)}</h3>`)
      continue
    }
    if (b.type === 'h3') { parts.push(`<h4>${inline(b.text)}</h4>`); continue }

    if (b.type === 'code') { parts.push(`<pre><code>${esc(b.code)}</code></pre>`); continue }

    if (b.type === 'table') { parts.push(tableHtml(b.rows)); continue }

    if (b.type === 'quote') {
      const text = b.lines.join('\n')
      lintBackticks(text, `${file} 引用块`)
      if (!text.includes('本章目标')) parts.push(`<div class="tut-note"><p>${inline(text)}</p></div>`)
      continue
    }

    if (b.type === 'ul' || b.type === 'ol') {
      const tag = b.type === 'ul' ? 'ul' : 'ol'
      if (mode === 'checklist') {
        const items = b.items.map((it) => `<li>${inline(it.replace(/^\[ ?\]\s*/, ''))}</li>`).join('')
        parts.push(items + '</ul></div>')
        mode = ''
        opened = false
        continue
      }
      if (mode === 'summary') {
        const items = b.items.map((it) => `<li>${inline(it)}</li>`).join('')
        parts.push(items + '</ul></div>')
        mode = ''
        opened = false
        continue
      }
      for (const it of b.items) lintBackticks(it, `${file} 列表项`)
      const items = b.items.map((it) => `<li>${inline(it)}</li>`).join('')
      parts.push(`<${tag}>${items}</${tag}>`)
      continue
    }

    if (b.type === 'p') {
      lintBackticks(b.text, `${file} 段落`)
      const img = b.text.match(/^!\[([^\]]+)\]\(([^)]+)\)$/)
      if (img) { parts.push(shotHtml(img[0], img[1], img[2])); continue }
      parts.push(`<p>${inline(b.text)}</p>`)
      if (slug === '01-scanning' && b.text.includes('技术栈关系图')) {
        parts.push(
          `<figure class="tut-shot">\n` +
          `  <div class="tut-shot__frame">\n` +
          `    <img src="assets/tutorial/tech-map.svg" alt="技术栈关系图" loading="lazy">\n` +
          `  </div>\n` +
          `  <figcaption class="tut-shot__cap">技术栈关系图：前端在用户手机里、后端在云服务器里、数据库在服务器里存数据，AI 工具在旁边帮你写代码</figcaption>\n` +
          `</figure>`
        )
      }
      continue
    }
  }

  if (mode === 'checklist' || mode === 'summary') {
    if (opened) parts.push('</ul></div>')
  }

  return {
    id: `ch-${slug}`,
    num,
    title,
    goal,
    content: parts.join('\n'),
    label: num,
  }
}

// ---------- 占位图 ----------
function ensureShotPlaceholders(chapters) {
  mkdirSync(shotDir, { recursive: true })
  const seen = new Set()
  let count = 0
  for (const ch of chapters) {
    const ids = [...ch.content.matchAll(/data-shot="(S\d{2})"/g)].map((m) => m[1])
    for (const id of ids) {
      if (seen.has(id)) continue
      seen.add(id)
      const p = resolve(shotDir, `${id}.svg`)
      // 已有用户实拍 png 时不再生成 svg 占位
      if (!existsSync(p) && !existsSync(resolve(shotDir, `${id}.png`))) {
        const svg =
          `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">\n` +
          `  <rect width="1200" height="800" fill="#f7f5f0"/>\n` +
          `  <rect x="48" y="48" width="1104" height="704" fill="#ffffff" stroke="#d5dae0" stroke-width="3" stroke-dasharray="10 8" rx="18"/>\n` +
          `  <text x="600" y="370" font-family="Menlo, monospace" font-size="56" fill="#c81e3a" text-anchor="middle">${id}</text>\n` +
          `  <text x="600" y="440" font-family="Menlo, monospace" font-size="26" fill="#5c6b7a" text-anchor="middle">这里放你的截图</text>\n` +
          `  <text x="600" y="486" font-family="Menlo, monospace" font-size="26" fill="#5c6b7a" text-anchor="middle">替换 assets/tutorial/${id}.png 后重跑构建即可</text>\n` +
          `</svg>\n`
        writeFileSync(p, svg)
        count++
      }
    }
  }
  return count
}

// ---------- 页面模板 ----------
function pageHtml(chapters) {
  const toc = chapters
    .map((c) => `<a href="#${c.id}">${c.label}</a>`)
    .join('\n      ')

  const body = chapters
    .map(
      (c) =>
        `<section class="tut-chapter" id="${c.id}">\n` +
        `  <div class="tut-chapter__head">\n` +
        `    <span class="tut-chapter__tape" aria-hidden="true"></span>\n` +
        `    <span class="tut-chapter__num mono">${c.num}</span>\n` +
        `    <h2 class="tut-chapter__title">${esc(c.title)}</h2>\n` +
        (c.goal ? `    <p class="tut-chapter__goal">${inline(c.goal)}</p>\n` : '') +
        `  </div>\n` +
        `  <div class="tut-content">\n${c.content}\n  </div>\n` +
        `</section>`
    )
    .join('\n\n')

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>从 0 到 1 用 AI 做出你的微信小程序 · 跟练教程 · FatTI</title>
  <meta name="description" content="手把手教你把一个小程序从 0 做到上线。全程使用 AI 编程工具，不需要会编程。以真实产品「找到狡猾的猪腰」为案例，预算首年千元内。">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="icon" href="assets/favicon.ico" sizes="48x48">
  <link rel="apple-touch-icon" href="assets/favicon-180.png">
  <link rel="stylesheet" href="css/main.css">
  <link rel="stylesheet" href="css/tutorial.css">
</head>
<body>
  <a class="skip-link" href="#tutorial">跳到主要内容</a>

  <header class="nav">
    <a class="nav__brand" href="index.html">FatTI · 找到狡猾的猪腰</a>
    <nav class="nav__links" aria-label="主导航">
      <a href="index.html#ration">控卡单</a>
      <a href="index.html#beasts">妖兽</a>
      <a href="index.html#howto">使用</a>
      <a href="tutorial.html" aria-current="page">跟练教程</a>
    </nav>
  </header>

  <main id="tutorial">
    <section class="tut-hero" aria-label="跟练教程介绍">
      <div class="container">
        <p class="tut-hero__eyebrow mono">跟练教程 · 真实案例：找到狡猾的猪腰</p>
        <h1>从 0 到 1 用 AI 做出<br>你的微信小程序</h1>
        <p class="tut-hero__sub">手把手教你把一个小程序从 0 做到上线，全程使用 AI 编程工具（Cursor），不需要你会编程。每一步都对应真实项目里真实踩过的坑和真实解法，以本网站的产品「找到狡猾的猪腰」为教材。</p>
        <div class="tut-hero__meta">
          <span class="tut-hero__pill">12 章 + 3 附录</span>
          <span class="tut-hero__pill">零成本起步：前 5 到 9 章不用花一分钱</span>
          <span class="tut-hero__pill">首年最省约 500 到 1000 元</span>
        </div>
        <div class="tut-hero__qr" role="img" aria-label="找到狡猾的猪腰小程序码">
          <img src="assets/mp-qrcode.jpg" alt="找到狡猾的猪腰小程序码" loading="lazy">
          <p class="tut-hero__qr-hint mono">成品在这 · 先扫一眼<br>长按识别 · 直达小程序</p>
        </div>
      </div>
    </section>

    <nav class="tut-toc" aria-label="章节目录">
      <div class="container tut-toc__inner">
      ${toc}
      </div>
    </nav>

    <section class="tut-body" aria-label="教程正文">
      <div class="container">

${body}

        <div class="tut-pager">
          <a href="#ch-00-preface"><span class="tut-pager__dir">从头开始</span>序 · 开始之前</a>
          <a class="is-next" href="#ch-12-iterate"><span class="tut-pager__dir">读完收尾</span>第 12 章 · 持续迭代</a>
        </div>
      </div>
    </section>

    <section class="tut-cta" aria-label="回到官网">
      <div class="container">
        <h2>看完教程，亲手打开成品看看？</h2>
        <p>微信搜「找到狡猾的猪腰」，扫一扫就能体验你将要亲手做出的小程序。</p>
        <a class="btn btn--primary" href="index.html">回到官网首页</a>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container footer__inner">
      <p class="footer__brand">老赵铁馆 · 降妖鉴定处</p>
      <p class="footer__tagline">世界上没有收不服的脂妖。只有不肯进铁馆的你。</p>
      <p class="footer__search mono">微信搜「找到狡猾的猪腰」</p>
      <p class="footer__contact"><a href="mailto:imklayhu@gmail.com">imklayhu@gmail.com</a></p>
      <p class="footer__disclaimer">本鉴定为互联网减脂玄学娱乐内容，妖物设定纯属虚构，不构成任何健康或医疗建议。梗出处：抖音 @兴文赵本希（降妖老师傅）。</p>
      <p class="footer__copy">© 2026 FatTI · 找到狡猾的猪腰</p>
    </div>
  </footer>

  <script src="js/tutorial.js" defer></script>
</body>
</html>
`
}

// ---------- 主流程 ----------
const chapters = ORDER.filter((f) => existsSync(resolve(mdDir, f))).map(renderChapter)
const generated = ensureShotPlaceholders(chapters)
writeFileSync(outHtml, pageHtml(chapters))

console.log(`build-tutorial: ${chapters.length} 章节 → ${basename(outHtml)}`)
console.log(`build-tutorial: 占位图新增 ${generated} 张（assets/tutorial/Sxx.svg）`)

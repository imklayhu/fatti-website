// scripts/verify.mjs —— node scripts/verify.mjs
// 官网零依赖验证：图片存在 / 零 dash / 妖兽 16 只 / 控卡 5 功能点 / CTA 唯一 / 免责梗出处
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
let failures = 0
const fail = (msg) => { failures++; console.error('FAIL ' + msg) }

const html = readFileSync(resolve(root, 'index.html'), 'utf8')

// ① 页面引用的所有静态图片/资源存在（静态 src 引用）
const images = [...html.matchAll(/src="([^"]+)"/g)].map((m) => m[1])
  .filter((src) => !src.startsWith('http') && !src.startsWith('data:'))
for (const src of images) {
  if (!existsSync(resolve(root, src))) fail(`缺资源: ${src}`)
}

// ② 零 em-dash 与 en-dash
for (const ch of ['\u2014', '\u2013']) {
  if (html.includes(ch)) fail(`含 em/en-dash: ${JSON.stringify(ch)}`)
}

// ③ 妖兽卡渲染数据 16 只 + 对应 16 张插画存在
const beastsSrc = readFileSync(resolve(root, 'js/beasts.js'), 'utf8')
const beastCodes = [...beastsSrc.matchAll(/code:\s*'([A-Z0-9]+)'/g)].map((m) => m[1])
if (beastCodes.length !== 16) fail(`妖兽应为 16 只, 实际 ${beastCodes.length}`)
for (const code of beastCodes) {
  const img = `assets/beasts/persona-${code}.png`
  if (!existsSync(resolve(root, img))) fail(`缺妖兽插画: ${img}`)
}

// ④ 控卡 5 个功能点存在
const featureCount = (html.match(/class="feature__kicker mono"/g) || []).length
if (featureCount < 5) fail(`控卡功能点应 ≥5, 实际 ${featureCount}`)

// ⑤ 主 CTA 意图唯一：主按钮「打开小程序 · 免费体验」恰好 1 次，
//    其余按钮是锚点导航（看看控卡单/妖兽档案），不算重复意图
const primaryCta = (html.match(/打开小程序 · 免费体验/g) || []).length
if (primaryCta === 0) fail('缺主 CTA「打开小程序 · 免费体验」')
if (primaryCta > 1) fail(`主 CTA「打开小程序 · 免费体验」出现 ${primaryCta} 次, 意图应唯一`)
const btnCount = (html.match(/class="btn btn--/g) || []).length
if (btnCount !== 3) fail(`预期 3 个按钮 (主 CTA/副 CTA/妖兽 CTA), 实际 ${btnCount}`)

// ⑥ 免责含「梗出处」
if (!html.includes('梗出处')) fail('缺免责「梗出处」')

// ⑦ favicon 全套存在且被引用（svg + ico + apple-touch-icon + 多尺寸）
const faviconLinks = [
  ['assets/favicon.svg', 'favicon.svg'],
  ['assets/favicon.ico', 'favicon.ico'],
  ['assets/favicon-180.png', 'apple-touch-icon'],
]
for (const [path, label] of faviconLinks) {
  if (!existsSync(resolve(root, path))) fail(`缺 favicon: ${path}`)
  if (!html.includes(path)) fail(`index.html 未引用 ${label} (${path})`)
}

console.log(failures === 0 ? 'verify: all ok' : `verify: ${failures} failures`)
process.exit(failures === 0 ? 0 : 1)

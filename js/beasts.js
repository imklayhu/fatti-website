// 16 只脂妖数据 · 顺序与 FatTI personas.ts 的 PERSONAS 键序一致
// 通缉号由 code 拼出：`TG-${code}`（如 TG-MSBT），T5 渲染时拼接
// danger 预留字段（本次小卡不展示）：由 stats.cheat 派生
//   cheat >= 6 → 极危（★5）
//   cheat == 5 → 高危（★4）
//   cheat == 4 → 中危（★3）
//   其余        → 低危（★2）
const BEASTS = [
  { code: 'HGBT', title: '走火入魔', tagline: '真练，真饿，信条全来自「我刷到个博主说」。', danger: 2 },
  { code: 'HGBN', title: '连夜邪修', tagline: '现在就开始，信条可以稍后对齐。', danger: 2 },
  { code: 'HGCT', title: '明天开练', tagline: '算得很清，练得很勤，就是明天才开练。', danger: 2 },
  { code: 'HGCN', title: '猎卡妖犬', tagline: '外卖先看热量，练完先称米饭。', danger: 2 },
  { code: 'HSBT', title: '沙发坐化', tagline: '真饿，真躺，沙发上一坐就是一整天。', danger: 3 },
  { code: 'HSBN', title: '卧推幻想精', tagline: '决策很快，决定今天继续躺。', danger: 4 },
  { code: 'HSCT', title: '理论镇宅', tagline: '什么都懂，今天先镇守沙发。', danger: 2 },
  { code: 'HSCN', title: '科学躺平', tagline: '热量算清了，结论是继续躺。', danger: 2 },
  { code: 'MGBT', title: '屯粉貔貅', tagline: '蛋白粉只进不出，像貔貅一样囤。', danger: 4 },
  { code: 'MGBN', title: '练完就吃', tagline: '练完必须奖励，奖励完再练。', danger: 4 },
  { code: 'MGCT', title: '当场炼化', tagline: '吃进去的，当场炼化掉。', danger: 3 },
  { code: 'MGCN', title: '吃完就练', tagline: '嘴馋当场下单，吃完立刻去练。', danger: 2 },
  { code: 'MSBT', title: '狡猾猪妖', tagline: '此妖常驻「明天开始」，通缉令悬赏 0 卡路里。', danger: 5 },
  { code: 'MSBN', title: '遁地外卖', tagline: '秒下单，秒到，秒吃完。', danger: 5 },
  { code: 'MSCT', title: '明天再算', tagline: '今天的热量失控，明天再算。', danger: 4 },
  { code: 'MSCN', title: '歪理精', tagline: '什么都能掰出个科学道理。', danger: 4 }
]

// T5：妖兽小卡渲染（插画 + 名字 + 通缉号 TG-{code}）。
// 渲染入口：遍历 BEASTS，用 assets/beasts/persona-${code}.png 出图，
// 16 张小卡横排滚动插入 #beast-strip（或传入的 container）。
function renderBeasts(container) {
  var el = container || document.getElementById('beast-strip')
  if (!el) return

  el.innerHTML = BEASTS.map(function (beast) {
    return (
      '<article class="beast-card">' +
        '<img src="assets/beasts/persona-' + beast.code + '.png" alt="' +
          beast.title + ' 妖兽插画" loading="lazy">' +
        '<div class="beast-card__info">' +
          '<span class="beast-card__name">' + beast.title + '</span>' +
          '<span class="beast-card__id mono">TG-' + beast.code + '</span>' +
        '</div>' +
      '</article>'
    )
  }).join('')
}

// 供后续脚本（T5）使用的导出结构：直接读 window.BEASTS / window.renderBeasts
if (typeof window !== 'undefined') {
  window.BEASTS = BEASTS
  window.renderBeasts = renderBeasts
}

// 自执行渲染入口（参照 js/granule.js 的 IIFE 写法）。
// 脚本以 defer 加载，执行时 DOM 已就绪，直接渲染到 #beast-strip。
// 渲染为静态 innerHTML、无入场动画，reduced-motion 与否都直接落终态，
// 故无需 matchMedia / IntersectionObserver 分流。
(() => {
  renderBeasts()
})()

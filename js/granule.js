// FatTI 脂格 · 热量颗粒条（CalorieGranuleBar）
// 24 格代表全天热量：已用逐格填充、超限整条转红。
// 滚入视口后按 --i 依次填充（只动 transform/opacity）；
// prefers-reduced-motion 下跳过监听，直接落终态。
(() => {
  const granules = document.querySelectorAll('.granule')
  if (!granules.length) return

  const reduceMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  granules.forEach((g) => {
    const budget = Number(g.dataset.budget) || 24
    const usedRaw = Number(g.dataset.used) || 0
    const over = usedRaw > budget
    const used = over ? budget : Math.max(0, usedRaw)

    const frag = document.createDocumentFragment()
    for (let i = 0; i < budget; i++) {
      const cell = document.createElement('span')
      cell.className = 'granule__cell' + (i < used || over ? ' granule__cell--on' : '')
      cell.style.setProperty('--i', String(i))
      frag.appendChild(cell)
    }
    g.appendChild(frag)
    if (over) g.classList.add('granule--over')

    if (reduceMotion) {
      g.classList.add('granule--live')
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            g.classList.add('granule--live')
            io.disconnect()
          }
        })
      },
      { threshold: 0.4 }
    )
    io.observe(g)
  })
})()

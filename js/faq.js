// FatTI 脂格 · FAQ 手风琴
// 点击问题按钮展开答案，一次只开一条（互斥）。
// 只切换 .faq__item--open 与 aria-expanded / aria-controls，
// 高度动效由 CSS grid-template-rows transition 承担；
// prefers-reduced-motion 由全局样式降级，无需 JS 分流。
(() => {
  const buttons = document.querySelectorAll('.faq__q')
  if (!buttons.length) return

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement
      const isOpen = item.classList.contains('faq__item--open')

      buttons.forEach((other) => {
        const otherItem = other.parentElement
        if (otherItem !== item && otherItem.classList.contains('faq__item--open')) {
          otherItem.classList.remove('faq__item--open')
          other.setAttribute('aria-expanded', 'false')
        }
      })

      item.classList.toggle('faq__item--open', !isOpen)
      btn.setAttribute('aria-expanded', String(!isOpen))
    })
  })
})()

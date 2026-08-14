// FatTI 官网 · 跟练教程页交互
// 1) sticky 章节目录：滚动时高亮当前章节（IntersectionObserver，reduced-motion 不影响）
// 2) 截图占位符：空态显示占位说明，图片加载后切换真实截图
(() => {
  // ---------- 章节目录滚动高亮 ----------
  const tocLinks = Array.from(document.querySelectorAll('.tut-toc a'))
  const chapters = Array.from(document.querySelectorAll('.tut-chapter'))
  if (tocLinks.length && chapters.length) {
    const ids = chapters
      .map((c) => c.id)
      .filter((id) => tocLinks.some((a) => a.getAttribute('href') === `#${id}`))

    if (ids.length) {
      const setActive = (id) => {
        tocLinks.forEach((a) => {
          a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`)
        })
      }

      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) setActive(e.target.id)
          })
        },
        { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
      )
      ids.forEach((id) => {
        const el = document.getElementById(id)
        if (el) io.observe(el)
      })
    }
  }

  // ---------- 截图占位符 ----------
  const shots = Array.from(document.querySelectorAll('.tut-shot__frame'))
  shots.forEach((frame) => {
    const img = frame.querySelector('img[data-src]')
    if (!img) return
    img.addEventListener('load', () => {
      frame.classList.remove('tut-shot--empty')
    })
    if (img.complete && img.naturalWidth > 0) {
      frame.classList.remove('tut-shot--empty')
    }
  })
})()

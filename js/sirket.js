// Adapptiv Digital sirket sayfasi: giristeki dizinde satirlar sirayla one
// cikar (alt cizgi dolarken). Fare ya da odak dizine gelince durur, giris
// ekrandan cikinca bekler. Ortak isler (tema, menu, donen kelime) site.js'te.
;(function () {
  var idx = document.querySelector('.idx')
  var rows = idx ? [].slice.call(idx.querySelectorAll('.idx-row')) : []
  if (rows.length < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return

  var STEP = 2800
  var current = -1
  var timer = null
  var hovering = false
  var visible = true

  var show = function (i) {
    current = i
    rows.forEach(function (r, k) {
      r.classList.toggle('is-active', k === i)
    })
  }
  var stop = function () {
    clearInterval(timer)
    timer = null
  }
  var start = function () {
    if (timer || hovering || !visible) return
    show((current + 1) % rows.length)
    timer = setInterval(function () {
      show((current + 1) % rows.length)
    }, STEP)
  }

  idx.style.setProperty('--idx-step', STEP + 'ms')
  idx.addEventListener('mouseenter', function () {
    hovering = true
    stop()
    show(-1)
  })
  idx.addEventListener('mouseleave', function () {
    hovering = false
    start()
  })
  idx.addEventListener('focusin', function () {
    stop()
    show(-1)
  })

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting
      if (visible) start()
      else stop()
    }).observe(idx)
  }
  // giris animasyonu bitince basla
  setTimeout(start, 1200)
})()

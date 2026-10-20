// Adapptiv tanitim sitesi: tema, menu, kaydirinca gorunme, donen baslik, sohbet
// ornegi, sayac, kurulum isigi, entegrasyon kablolari, fiyat secimi, ozel imlec.
// Gorunme islerinin hepsi IntersectionObserver ile.
;(function () {
  document.documentElement.classList.remove('no-js')

  // Ust menu: sayfa basindan ayrilinca arka plan gelir
  var nav = document.querySelector('.nav')
  var sentinel = document.querySelector('.nav-sentinel')
  if (nav && sentinel && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      nav.classList.toggle('is-scrolled', !entries[0].isIntersecting)
    }).observe(sentinel)
  }

  // Telefonda menu
  var menuBtn = document.querySelector('.menu-btn')
  if (nav && menuBtn) {
    menuBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open')
      menuBtn.setAttribute('aria-expanded', String(open))
      menuBtn.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç')
    })
    nav.querySelectorAll('.sheet a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('is-open')
        menuBtn.setAttribute('aria-expanded', 'false')
      })
    })
  }

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

  // Tema: varsayilan acik; secim hatirlanir (ilk boyama oncesi <head> ayarlar)
  var root = document.documentElement
  var themeMeta = document.querySelector('meta[name="theme-color"]')
  var themeBtns = document.querySelectorAll('.theme-btn')
  var syncTheme = function () {
    var dark = root.getAttribute('data-theme') === 'dark'
    themeBtns.forEach(function (b) {
      b.setAttribute('aria-pressed', String(dark))
      b.setAttribute('aria-label', dark ? 'Açık temaya geç' : 'Koyu temaya geç')
    })
    if (themeMeta) themeMeta.setAttribute('content', dark ? '#0b1120' : '#f4f6f9')
  }
  themeBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var dark = root.getAttribute('data-theme') !== 'dark'
      if (dark) root.setAttribute('data-theme', 'dark')
      else root.removeAttribute('data-theme')
      try {
        localStorage.setItem('adapptiv-tema', dark ? 'koyu' : 'acik')
      } catch (e) {}
      syncTheme()
    })
  })
  syncTheme()

  // Kaydirinca gorunme. Odak kutulari gorundukten sonra hizli gecislere doner.
  var settle = function (el) {
    if (!el.classList.contains('focus-card')) return
    var i = parseFloat(getComputedStyle(el).getPropertyValue('--i')) || 0
    setTimeout(function () {
      el.classList.add('is-settled')
    }, reduce ? 0 : 950 + i * 80)
  }
  var reveals = document.querySelectorAll('.reveal')
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            settle(e.target)
            io.unobserve(e.target)
          }
        })
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    )
    reveals.forEach(function (el) {
      io.observe(el)
    })
  } else {
    reveals.forEach(function (el) {
      el.classList.add('is-in')
      settle(el)
    })
  }

  // Giris basligi: donen kelime (eski siteden)
  var hlText = document.getElementById('hero-hl-text')
  if (hlText && !reduce) {
    var words = ['tamamı', 'randevuları', 'müşterileri', 'ekibi', 'satışları']
    var wi = 0
    var ci = words[0].length
    var deleting = true
    var tick = function () {
      var w = words[wi]
      if (!deleting) {
        ci++
        hlText.textContent = w.slice(0, ci)
        if (ci >= w.length) {
          deleting = true
          return setTimeout(tick, 1800)
        }
        return setTimeout(tick, 75)
      }
      ci--
      hlText.textContent = w.slice(0, ci)
      if (ci <= 0) {
        ci = 0
        deleting = false
        wi = (wi + 1) % words.length
        return setTimeout(tick, 250)
      }
      setTimeout(tick, 45)
    }
    setTimeout(tick, 2200)
  }

  // Sayilar gorununce sifirdan yukari sayar
  var counters = document.querySelectorAll('.count-up')
  var runCount = function (el) {
    var to = Number(el.dataset.count) || 0
    if (reduce) {
      el.textContent = String(to)
      return
    }
    var t0 = performance.now()
    var dur = 1300
    var step = function (now) {
      var p = Math.min(1, (now - t0) / dur)
      el.textContent = String(Math.round(to * (1 - Math.pow(1 - p, 3))))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            runCount(e.target)
            cio.unobserve(e.target)
          }
        })
      },
      { threshold: 0.6 },
    )
    counters.forEach(function (el) {
      cio.observe(el)
    })
  } else {
    counters.forEach(runCount)
  }

  // Kurulum adimlari: gorununce turuncu isik akmaya baslar
  var steps = document.querySelector('.steps')
  if (steps && 'IntersectionObserver' in window) {
    new IntersectionObserver(
      function (entries) {
        steps.classList.toggle('is-on', entries[0].isIntersecting)
      },
      { threshold: 0.3 },
    ).observe(steps)
  }

  // Entegrasyon: kutulardan merkeze kavisli kablolar
  var hub = document.querySelector('.hub')
  var core = hub && hub.querySelector('.hub-core')
  if (hub && core) {
    var NS = 'http://www.w3.org/2000/svg'
    var svg = document.createElementNS(NS, 'svg')
    svg.setAttribute('class', 'hub-wires')
    svg.setAttribute('aria-hidden', 'true')
    hub.insertBefore(svg, hub.firstChild)
    var drawWires = function () {
      var hr = hub.getBoundingClientRect()
      var cr = core.getBoundingClientRect()
      var cx = cr.left + cr.width / 2 - hr.left
      var cy = cr.top + cr.height / 2 - hr.top
      svg.setAttribute('viewBox', '0 0 ' + hr.width + ' ' + hr.height)
      svg.textContent = ''
      hub.querySelectorAll('.node').forEach(function (n, i) {
        var r = n.getBoundingClientRect()
        var left = r.right < cr.left
        var x = (left ? r.right : r.left) - hr.left
        var y = r.top + r.height / 2 - hr.top
        var mx = (x + cx) / 2
        var d = 'M' + x + ' ' + y + ' C' + mx + ' ' + y + ' ' + mx + ' ' + cy + ' ' + cx + ' ' + cy
        ;['wire', 'wire-glow'].forEach(function (cls) {
          var p = document.createElementNS(NS, 'path')
          p.setAttribute('d', d)
          p.setAttribute('class', cls)
          p.setAttribute('pathLength', '100')
          if (cls === 'wire-glow') p.style.animationDelay = i * 0.9 + 's'
          svg.appendChild(p)
        })
      })
    }
    drawWires()
    if ('ResizeObserver' in window) new ResizeObserver(drawWires).observe(hub)
    else addEventListener('resize', drawWires)
  }

  // Gunun tamami: sekmeli vitrin. Sekmeler sirayla kendiliginden ilerler;
  // kullanici bir sekmeye dokununca durur. Ekrandan cikinca bekler.
  var sc = document.querySelector('.showcase')
  if (sc) {
    var tabs = [].slice.call(sc.querySelectorAll('.sc-tab'))
    var panels = sc.querySelectorAll('.sc-panel')
    var row = sc.querySelector('.sc-tabs')
    var current = 0
    var select = function (i, focus) {
      current = (i + tabs.length) % tabs.length
      tabs.forEach(function (t, k) {
        var on = k === current
        t.setAttribute('aria-selected', String(on))
        t.tabIndex = on ? 0 : -1
        panels[k].classList.toggle('is-active', on)
        if (on) panels[k].removeAttribute('aria-hidden')
        else panels[k].setAttribute('aria-hidden', 'true')
        panels[k].inert = !on
      })
      if (focus) tabs[current].focus({ preventScroll: true })
      // telefonda secili sekme yatay listede gorunur kalsin
      if (row.scrollWidth > row.clientWidth) {
        row.scrollTo({ left: tabs[current].offsetLeft - 24, behavior: reduce ? 'auto' : 'smooth' })
      }
    }
    tabs.forEach(function (t, k) {
      t.addEventListener('click', function () {
        sc.classList.remove('is-auto')
        select(k)
      })
    })
    row.addEventListener('keydown', function (e) {
      var keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }
      if (e.key in keys) select(current + keys[e.key], true)
      else if (e.key === 'Home') select(0, true)
      else if (e.key === 'End') select(tabs.length - 1, true)
      else return
      e.preventDefault()
      sc.classList.remove('is-auto')
    })
    if (!reduce) {
      sc.classList.add('is-auto', 'is-paused')
      sc.addEventListener('animationend', function (e) {
        if (e.animationName === 'sc-progress' && sc.classList.contains('is-auto')) select(current + 1)
      })
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(
          function (entries) {
            sc.classList.toggle('is-paused', !entries[0].isIntersecting)
          },
          { threshold: 0.5 },
        ).observe(sc)
      } else sc.classList.remove('is-paused')
    }
  }

  // Sohbet ornegi: bolum gorununce bir kez oynar
  var chat = document.querySelector('.chat')
  if (chat && 'IntersectionObserver' in window) {
    new IntersectionObserver(
      function (entries, obs) {
        if (entries[0].isIntersecting) {
          chat.classList.add('is-playing')
          obs.disconnect()
        }
      },
      { threshold: 0.45 },
    ).observe(chat)
  } else if (chat) {
    chat.classList.add('is-playing')
  }

  var year = document.querySelector('[data-year]')
  if (year) year.textContent = String(new Date().getFullYear())

  // Yumusak kaydirma ve bolum bolum gecis (canli siteden, ayni sure ve egriyle)
  var NAV_H = 68
  var animateScrollTo = function (top, cb) {
    var startY = window.scrollY
    var delta = top - startY
    if (reduce || Math.abs(delta) < 2) {
      window.scrollTo(0, top)
      if (cb) cb()
      return
    }
    var duration = 520
    var startTime = null
    var ease = function (t) {
      return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
    }
    var step = function (ts) {
      if (!startTime) startTime = ts
      var p = Math.min((ts - startTime) / duration, 1)
      window.scrollTo(0, Math.round(startY + delta * ease(p)))
      if (p < 1) requestAnimationFrame(step)
      else if (cb) cb()
    }
    requestAnimationFrame(step)
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1)
      if (!id) return
      var target = document.getElementById(id)
      if (!target) return
      e.preventDefault()
      animateScrollTo(Math.max(0, Math.round(target.getBoundingClientRect().top + window.scrollY - NAV_H)))
    })
  })

  // Tek tekerlek hamlesi = sonraki/onceki bolum (masaustu fare kullanicilari).
  // Ekrandan uzun bolumde once icerik normal kayar, bolumun tamami gorulunce gecilir.
  // Canli sitedekinden tek farki: arada kalinca takilmadan en yakin bolume oturur.
  ;(function () {
    // yalniz ana sayfada (yasal sayfalar normal kayar)
    if (!document.querySelector('.hero') || !matchMedia('(pointer: fine)').matches) return
    var stops = [].slice.call(document.querySelectorAll('main > section'))
    var foot = document.querySelector('.foot')
    if (foot) stops.push(foot)
    if (stops.length < 2) return
    var locked = false

    var currentIndex = function () {
      var y = window.scrollY + NAV_H + 2
      var idx = 0
      for (var i = 0; i < stops.length; i++) {
        if (stops[i].offsetTop <= y) idx = i
      }
      return idx
    }

    var goTo = function (idx) {
      idx = Math.max(0, Math.min(stops.length - 1, idx))
      var target = stops[idx]
      animateScrollTo(Math.max(0, Math.round(target.getBoundingClientRect().top + window.scrollY - NAV_H)))
    }

    window.addEventListener(
      'wheel',
      function (e) {
        if (window.innerWidth < 980) return // dar ekranlarda normal kaydirma serbest
        if (locked) {
          e.preventDefault()
          return
        }
        var dir = e.deltaY > 0 ? 1 : -1
        var idx = currentIndex()
        var rect = stops[idx].getBoundingClientRect()
        // ekrana sigan bolumde iki bolum arasinda kalindiysa (kaydirma cubugu,
        // klavye, baglanti) hamle dogrudan en yakin bolume oturtur; yalniz
        // ekrandan uzun bolumde icerik once normal kayar
        var fits = rect.height <= window.innerHeight - NAV_H + 4
        var next = idx + dir
        if (dir > 0 && !fits && rect.bottom > window.innerHeight + 4) return // bolumun alti henuz gorunmuyor
        if (dir < 0 && rect.top < NAV_H - 4) {
          if (!fits) return // uzun bolumun ustu henuz gorunmuyor
          next = idx // arada kalindi: bu bolumun basina don
        }
        if (next < 0 || next > stops.length - 1) return
        e.preventDefault()
        locked = true
        goTo(next)
        setTimeout(
          function () {
            locked = false
          },
          reduce ? 250 : 700,
        )
      },
      { passive: false },
    )
  })()

  // Ozel imlec: hedef kilidi (eski siteden). Bosta kucuk dort koseli bir
  // retikul fareyi yumusakca takip edip doner; tiklanabilir bir ogenin ustune
  // gelince durur, dort kose o ogenin kenarlarina kilitlenir.
  if (matchMedia('(pointer: fine)').matches && !reduce) {
    var tc = document.createElement('div')
    tc.className = 'tcursor spin'
    ;['tl', 'tr', 'bl', 'br'].forEach(function (c) {
      var s = document.createElement('span')
      s.className = 'tcorner ' + c
      tc.appendChild(s)
    })
    document.body.appendChild(tc)
    document.body.classList.add('custom-cursor')

    var IDLE = 26
    var PAD = 8
    var mx = innerWidth / 2
    var my = innerHeight / 2
    var px = mx
    var py = my
    var started = false
    var locked = false
    var lockedEl = null

    var setIdleRect = function (x, y) {
      tc.style.left = x - IDLE / 2 + 'px'
      tc.style.top = y - IDLE / 2 + 'px'
      tc.style.width = IDLE + 'px'
      tc.style.height = IDLE + 'px'
    }
    var setLockedRect = function (el) {
      var r = el.getBoundingClientRect()
      tc.style.left = r.left - PAD + 'px'
      tc.style.top = r.top - PAD + 'px'
      tc.style.width = r.width + PAD * 2 + 'px'
      tc.style.height = r.height + PAD * 2 + 'px'
    }

    document.addEventListener(
      'mousemove',
      function (e) {
        mx = e.clientX
        my = e.clientY
        if (!started) {
          started = true
          px = mx
          py = my
          setIdleRect(px, py)
          tc.classList.add('show')
        }
      },
      { passive: true },
    )
    document.addEventListener('mouseleave', function () {
      tc.classList.remove('show')
    })
    document.addEventListener('mouseenter', function () {
      tc.classList.add('show')
    })

    var loop = function () {
      if (!locked) {
        px += (mx - px) * 0.25
        py += (my - py) * 0.25
        setIdleRect(px, py)
      }
      requestAnimationFrame(loop)
    }
    requestAnimationFrame(loop)

    // kutu kalkma animasyonu bitince cerceve yeni boyuta oturur
    var relock
    document.querySelectorAll('a, button, summary, .focus-card, .tile, .plan, .node, input, textarea, select').forEach(function (el) {
      el.addEventListener('mouseenter', function (e) {
        e.stopPropagation()
        locked = true
        lockedEl = el
        tc.classList.remove('spin')
        setLockedRect(el)
        clearTimeout(relock)
        relock = setTimeout(function () {
          if (lockedEl === el) setLockedRect(el)
        }, 240)
      })
      el.addEventListener('mouseleave', function () {
        // ic ice ogelerde (kutu icindeki baglanti) dis ogeye geri kilitlen
        var parent = el.parentElement && el.parentElement.closest('.focus-card, .tile, .plan, .node')
        if (parent && parent.matches(':hover')) {
          lockedEl = parent
          setLockedRect(parent)
          return
        }
        locked = false
        lockedEl = null
        tc.classList.add('spin')
        px = mx
        py = my
        setIdleRect(px, py)
      })
    })

    addEventListener(
      'scroll',
      function () {
        if (locked && lockedEl) setLockedRect(lockedEl)
      },
      { passive: true },
    )
  }
})()

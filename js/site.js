// Adapptiv tanitim sitesi: menu, kaydirinca gorunme, sohbet ornegi, fiyat secimi.
// Kaydirma dinleyicisi yok; hepsi IntersectionObserver ile.
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

  // Kaydirinca gorunme
  var reveals = document.querySelectorAll('.reveal')
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
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
    })
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

  // Fiyat: aylik / yillik
  var billing = document.querySelector('.billing')
  if (billing) {
    var buttons = billing.querySelectorAll('button')
    var set = function (mode) {
      buttons.forEach(function (b) {
        b.setAttribute('aria-checked', String(b.dataset.mode === mode))
      })
      document.querySelectorAll('[data-monthly]').forEach(function (el) {
        el.textContent = mode === 'yearly' ? el.dataset.yearly : el.dataset.monthly
      })
    }
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        set(b.dataset.mode)
      })
    })
  }

  var year = document.querySelector('[data-year]')
  if (year) year.textContent = String(new Date().getFullYear())
})()

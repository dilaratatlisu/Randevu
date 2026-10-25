// Tanitim sitesi: index.html'i sablondan uretir, yasal sayfalarin menu/alt
// bilgisini yeni tasarimla degistirir. Calistir: node build.cjs
const fs = require('fs')
const path = require('path')
const SITE = path.resolve(__dirname, '..')
const CR = String.fromCharCode(13)

function icon(name) {
  const svg = fs.readFileSync(path.join(SITE, 'assets/icons', name + '.svg'), 'utf8').trim()
  return svg.replace('<svg ', '<svg class="icon" aria-hidden="true" focusable="false" ')
}

function header(kind) {
  const p = kind === 'home' ? '' : '/'
  const links = [
    ['#chatbot', 'Asistan'],
    ['#hatirlatma', 'Hatırlatma'],
    ['#reklam', 'Reklam analizi'],
    ['#ozellikler', 'Özellikler'],
    ['#fiyat', 'Fiyatlar'],
  ]
  const a = links.map(([h, t]) => `<a href="${p}${h}">${t}</a>`).join('\n          ')
  return `<header class="nav">
    <div class="wrap nav-in">
      <a class="brand" href="/" aria-label="Adapptiv ana sayfa"><img src="/assets/logo-mark.png" alt="" width="30" height="30" />Adapptiv</a>
      <nav class="nav-links" aria-label="Ana menü">
          ${a}
      </nav>
      <button class="theme-btn" type="button" aria-pressed="false" aria-label="Koyu temaya geç">${icon('moon').replace('class="icon"', 'class="icon i-moon"')}${icon('sun').replace('class="icon"', 'class="icon i-sun"')}</button>
      <a class="btn btn-primary btn-sm nav-cta" href="${p}#fiyat">Ücretsiz başla</a>
      <button class="menu-btn" type="button" aria-expanded="false" aria-label="Menüyü aç" aria-controls="menu-sheet">${icon('list')}</button>
    </div>
    <div class="sheet" id="menu-sheet">
      <div>
        <nav aria-label="Mobil menü">
          ${a}
          <a class="btn btn-primary" href="${p}#fiyat">Ücretsiz başla</a>
        </nav>
      </div>
    </div>
  </header>`
}

function footer(kind) {
  const p = kind === 'home' ? '' : '/'
  return `<footer class="foot">
    <div class="wrap">
      <div class="foot-grid">
        <div>
          <a class="brand" href="/"><img src="/assets/logo-mark.png" alt="" width="30" height="30" />Adapptiv</a>
          <p>Kuaför ve güzellik salonları için randevu, müşteri, kasa ve WhatsApp asistanı.</p>
        </div>
        <div>
          <h4>Ürün</h4>
          <ul>
            <li><a href="${p}#ozellikler">Özellikler</a></li>
            <li><a href="${p}#chatbot">Asistan</a></li>
            <li><a href="${p}#fiyat">Fiyatlar</a></li>
            <li><a href="${p}#sss">Sık sorulanlar</a></li>
          </ul>
        </div>
        <div>
          <h4>Yasal</h4>
          <ul>
            <li><a href="/gizlilik">Gizlilik ve KVKK</a></li>
            <li><a href="/kullanim-sozlesmesi.html">Kullanım sözleşmesi</a></li>
            <li><a href="/veri-silme">Veri silme talebi</a></li>
            <li><a href="/privacy" lang="en">Privacy (EN)</a></li>
          </ul>
        </div>
        <div>
          <h4>İletişim</h4>
          <ul>
            <li><a href="mailto:info@adapptivdigital.com">info@adapptivdigital.com</a></li>
          </ul>
        </div>
      </div>
      <div class="foot-bottom">
        <span>© <span data-year>2026</span> Adapptiv</span>
        <span>Android, iOS ve web</span>
      </div>
    </div>
  </footer>`
}

// Sirket sayfasi (www.adapptivdigital.com, middleware.js / -> /sirket/)
function headerSirket() {
  const links = [
    ['#isletme', 'İşletme'],
    ['#kapsul360', 'Kapsül360'],
    ['#video', 'Video'],
    ['#meta', 'Meta reklam'],
    ['#web', 'Web'],
    ['#mobil', 'Mobil'],
  ]
  const a = links.map(([h, t]) => `<a href="${h}">${t}</a>`).join('\n          ')
  return `<header class="nav">
    <div class="wrap nav-in">
      <a class="brand" href="/" aria-label="Adapptiv Digital ana sayfa"><img src="/assets/logo-mark.png" alt="" width="30" height="30" />Adapptiv <span class="brand-sub" lang="en">Digital</span></a>
      <nav class="nav-links" aria-label="Ana menü">
          ${a}
      </nav>
      <button class="theme-btn" type="button" aria-pressed="false" aria-label="Koyu temaya geç">${icon('moon').replace('class="icon"', 'class="icon i-moon"')}${icon('sun').replace('class="icon"', 'class="icon i-sun"')}</button>
      <a class="btn btn-primary btn-sm nav-cta" href="#iletisim">Bize yazın</a>
      <button class="menu-btn" type="button" aria-expanded="false" aria-label="Menüyü aç" aria-controls="menu-sheet">${icon('list')}</button>
    </div>
    <div class="sheet" id="menu-sheet">
      <div>
        <nav aria-label="Mobil menü">
          ${a}
          <a class="btn btn-primary" href="#iletisim">Bize yazın</a>
        </nav>
      </div>
    </div>
  </header>`
}

function footerSirket() {
  return `<footer class="foot">
    <div class="wrap">
      <div class="foot-grid">
        <div>
          <a class="brand" href="/"><img src="/assets/logo-mark.png" alt="" width="30" height="30" />Adapptiv <span class="brand-sub" lang="en">Digital</span></a>
          <p>Yazılım ürünleri, web sitesi, mobil uygulama, reklam videosu ve Meta reklamları.</p>
        </div>
        <div>
          <h4>Ürünler</h4>
          <ul>
            <li><a href="https://isletme.adapptivdigital.com">Adapptiv İşletme</a></li>
            <li><a href="https://kapsul360.com">Kapsül360</a></li>
          </ul>
        </div>
        <div>
          <h4>Hizmetler</h4>
          <ul>
            <li><a href="#video">Reklam videosu</a></li>
            <li><a href="#meta">Meta reklamları</a></li>
            <li><a href="#web">Web sitesi</a></li>
            <li><a href="#mobil">Mobil uygulama</a></li>
          </ul>
        </div>
        <div>
          <h4>İletişim</h4>
          <ul>
            <li><a href="mailto:info@adapptivdigital.com">info@adapptivdigital.com</a></li>
            <li><a href="https://isletme.adapptivdigital.com/gizlilik">Gizlilik ve KVKK</a></li>
          </ul>
        </div>
      </div>
      <div class="foot-bottom">
        <span>© <span data-year>2026</span> Sis İnternet ve Yazılım Hizmetleri San. Tic. Ltd. Şti.</span>
        <span>MERSİS 0771064202700001 · Derecik Mah. 747. Sok. No: 2/3, İlkadım / Samsun</span>
      </div>
    </div>
  </footer>`
}

// Varsayilan acik tema; kullanici koyu secerse hatirlanir. Boyamadan once calisir.
const THEME_HEAD = `<meta name="theme-color" content="#f4f6f9" />
  <script>try{if(localStorage.getItem('adapptiv-tema')==='koyu')document.documentElement.setAttribute('data-theme','dark')}catch(e){}</script>`

function render(s, kind) {
  return s
    .replace('{{theme-head}}', THEME_HEAD)
    .replace(/\{\{i:([a-z0-9-]+)\}\}/g, (_, n) => icon(n))
    .replace('{{header:home}}', header(kind))
    .replace('{{footer:home}}', footer(kind))
    .replace('{{header:sirket}}', headerSirket())
    .replace('{{footer:sirket}}', footerSirket())
}

// 0) Sirket sayfasi
const sirketTpl = fs.readFileSync(path.join(__dirname, 'sirket.tpl.html'), 'utf8')
fs.writeFileSync(path.join(SITE, 'sirket/index.html'), render(sirketTpl, 'sirket'))
console.log('ok sirket/index.html')

// 1) Ana sayfa
const tpl = fs.readFileSync(path.join(__dirname, 'index.tpl.html'), 'utf8')
fs.writeFileSync(path.join(SITE, 'index.html'), render(tpl, 'home'))
console.log('ok index.html')

// 2) Yasal sayfalar: eski menu/alt bilgi, yazi tipi ve stil baglantilari degisir
const legal = ['gizlilik/index.html', 'privacy/index.html', 'veri-silme/index.html', 'data-deletion/index.html', 'kullanim-sozlesmesi.html']
for (const f of legal) {
  const file = path.join(SITE, f)
  const raw = fs.readFileSync(file, 'utf8')
  const crlf = raw.includes(CR + '\n')
  let s = raw.split(CR + '\n').join('\n')
  const swap = (start, end, repl) => {
    const i = s.indexOf(start)
    const j = s.indexOf(end, i)
    if (i < 0 || j < 0) throw new Error(f + ': bulunamadi ' + start)
    s = s.slice(0, i) + repl + s.slice(j + end.length)
  }
  // menu
  if (s.includes('<header class="nav" id="nav">')) swap('<header class="nav" id="nav">', '</header>', header('legal'))
  else if (s.includes('<header class="nav">')) swap('<header class="nav">', '</header>', header('legal'))
  // alt bilgi
  swap('<footer class="foot">', '</footer>', footer('legal'))
  // yazi tipleri + stil
  s = s.replace(/\s*<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">/g, '')
  s = s.replace(/\s*<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>/g, '')
  s = s.replace(/\s*<link\s+href="https:\/\/fonts\.googleapis\.com\/css2[^"]*"\s+rel="stylesheet">/g, '')
  s = s.replace(/<link rel="stylesheet" href="\/?css\/style\.css">/, '<link rel="icon" href="/assets/logo-mark.png" type="image/png" />\n  <link rel="stylesheet" href="/css/site.css" />')
  s = s.replace(/<script src="\/?js\/script\.js"><\/script>/, '<script src="/js/site.js" defer></script>')
  if (!s.includes('nav-sentinel')) s = s.replace(/<body([^>]*)>/, '<body$1>\n  <div class="nav-sentinel" aria-hidden="true"></div>')
  if (!s.includes('adapptiv-tema')) s = s.replace('<meta name="viewport" content="width=device-width, initial-scale=1" />', '<meta name="viewport" content="width=device-width, initial-scale=1" />\n  ' + THEME_HEAD)
  // legal-hero ic duzeni .wrap kullanir; geri linki sade
  fs.writeFileSync(file, crlf ? s.split('\n').join(CR + '\n') : s)
  console.log('ok', f)
}

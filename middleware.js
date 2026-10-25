// Bu Vercel projesi iki adrese hizmet veriyor:
//   www.adapptivdigital.com      → Adapptiv Digital sirket sayfasi (sirket/index.html,
//                                  kaynagi kaynak/sirket.tpl.html)
//   isletme.adapptivdigital.com  → Adapptiv Isletme urun sitesi (kok klasor, degismez)
// Vercel'de dosya sistemi vercel.json rewrite'larindan once geldigi icin
// (kokteki index.html hep kazanir) ayrim burada, dosya sisteminden once yapilir.
// Eski www linkleri (gizlilik, veri silme, WhatsApp baglama...) Meta ve
// uygulamada kayitli olabilir; urun sitesine kalici yonlendirilir.

const COMPANY_HOSTS = new Set(['www.adapptivdigital.com', 'adapptivdigital.com'])
const PRODUCT_SITE = 'https://isletme.adapptivdigital.com'
const PRODUCT_PATHS = /^\/(gizlilik|privacy|veri-silme|data-deletion|whatsapp-baglan)(\/|$)|^\/kullanim-sozlesmesi\.html$/

export default function middleware(request) {
  const url = new URL(request.url)
  if (!COMPANY_HOSTS.has(url.hostname)) return

  if (PRODUCT_PATHS.test(url.pathname)) {
    return Response.redirect(PRODUCT_SITE + url.pathname + url.search, 308)
  }
  // Sirket sayfasi urun sitesinin css/js/assets dosyalarini ortak kullanir;
  // yalniz ana sayfa yeniden yazilir, diger yollar oldugu gibi gecer.
  if (url.pathname !== '/' && url.pathname !== '/index.html') return

  const target = new URL('/sirket/index.html' + url.search, url)
  return new Response(null, { headers: { 'x-middleware-rewrite': target.toString() } })
}

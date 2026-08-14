(function(){
  "use strict";
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* daktilo efekti: h1 içindeki her karakter (vurgulanacak "tamamı"
     kelimesi dahil) ayrı bir span'e bölünüp sırayla görünür kılınır;
     yazma bitince "tamamı" kelimesinin arkasında kalem vurgusu belirir */
  var startTypewriter=function(){};
  (function(){
    var h1=document.getElementById("hero-h1");
    if(!h1)return;
    var hlWord=document.getElementById("hero-hl");
    var chars=[];
    function wrap(node){
      [].slice.call(node.childNodes).forEach(function(n){
        if(n.nodeType===3){
          var frag=document.createDocumentFragment();
          n.textContent.split("").forEach(function(ch){
            var s=document.createElement("span");
            s.className="tw-ch";
            s.textContent=ch;
            frag.appendChild(s);
            chars.push(s);
          });
          node.replaceChild(frag,n);
        }else if(n.nodeType===1){
          wrap(n);
        }
      });
    }
    wrap(h1);
    var cursor=document.createElement("span");
    cursor.className="tw-cursor tw-on";
    h1.appendChild(cursor);

    startTypewriter=function(){
      if(reduce){
        chars.forEach(function(c){c.classList.add("tw-shown");});
        if(hlWord)hlWord.classList.add("ph-show");
        cursor.classList.add("tw-off");
        return;
      }
      var i=0;
      function step(){
        if(i<chars.length){
          chars[i].classList.add("tw-shown");
          i++;
          setTimeout(step, 26+Math.random()*30);
        }else{
          if(hlWord)hlWord.classList.add("ph-show");
          setTimeout(function(){cursor.classList.add("tw-off");}, 900);
        }
      }
      setTimeout(step, 350);
    };
  })();

  /* açılış ekranı: logo animasyonla belirir, sayfa hazır olunca (en az bir
     süre gösterildikten sonra) kaybolur */
  var splash=document.getElementById("splash");
  var heroIn=document.querySelector(".hero-in");
  var revealHero=function(){
    if(heroIn)heroIn.classList.add("mask-show");
    startTypewriter();
  };
  if(splash){
    document.body.classList.add("splash-lock");
    var splashStart=Date.now();
    var splashDone=false;
    var hideSplash=function(){
      if(splashDone)return;
      splashDone=true;
      splash.classList.add("splash-out");
      document.body.classList.remove("splash-lock");
      revealHero();
      setTimeout(function(){
        if(splash.parentNode)splash.parentNode.removeChild(splash);
      }, reduce?0:650);
    };
    var minShow=reduce?150:1000;
    addEventListener("load",function(){
      setTimeout(hideSplash, Math.max(0, minShow-(Date.now()-splashStart)));
    });
    setTimeout(hideSplash, reduce?600:3200); /* load geç/gelmezse yine de kaybolsun */
  }else{
    revealHero();
  }

  /* hero pano: sayfanın en üstünde 3 boyutlu eğik durur, aşağı kaydırmaya
     başlayınca kaydırma miktarına bağlı olarak düzelip hafifçe büyür
     (aceternity "container scroll animation" mantığı); üstüne, sürekli
     hafifçe sağa sola dönen yavaş bir sallanma bineer */
  (function(){
    var heroDash=document.querySelector(".dash-stage .dash");
    if(!heroDash||reduce||!matchMedia("(min-width:860px)").matches)return;
    var dist=460;
    var t0=Date.now();
    (function loop(){
      var p=Math.max(0,Math.min(1,scrollY/dist));
      var sway=Math.sin((Date.now()-t0)/1000*1.8)*4; /* hafif sağa-sola dönme */
      var rotX=6-p*6, rotY=-10+p*10+sway, rotZ=1-p*1, scale=1+p*0.035;
      heroDash.style.transform="rotateX("+rotX+"deg) rotateY("+rotY+"deg) rotateZ("+rotZ+"deg) scale("+scale+")";
      requestAnimationFrame(loop);
    })();
  })();

/* =========================================================
   MACBOOK SCROLL
   TEK PARÇA MATRIX3D
   LAPTOPTAN ÇIKIŞ + EŞ ZAMANLI AŞAĞI HAREKET
   ========================================================= */

(function () {

  "use strict";

  const track =
    document.getElementById("mac-track");

  const bg =
    document.getElementById("mac-bg");

  const panel =
    document.getElementById("mac-panel");

  const stage =
    document.getElementById("mac-stage");

  const sticky =
    document.getElementById("mac-sticky");

  const title =
    document.getElementById("mac-title");

  const bottomText = 
    document.getElementById("mac-bottom-text");


  if (
    !track ||
    !bg ||
    !panel ||
    !stage ||
    !sticky
  ) {
    return;
  }


  const desktopQuery =
    window.matchMedia("(min-width:920px)");

  const reduceQuery =
    window.matchMedia(
      "(prefers-reduced-motion:reduce)"
    );


  /* =======================================================
     LAPTOP EKRAN KÖŞELERİ
     mac-mockup.png = 1080 x 1080
     ======================================================= */

  const LAPTOP = {

    topLeft: {
      x: 16,
      y: 278
    },

    topRight: {
      x: 690,
      y: 10
    },

    bottomRight: {
      x: 665,
      y: 500
    },

    bottomLeft: {
      x: 30,
      y: 794
    }

  };


  let stageWidth = 1;
  let stageHeight = 1;

  let finalWidth = 1;
  let finalHeight = 1;

  let progress = 0;

  let ticking = false;


  /* =======================================================
     EASING
     ======================================================= */

  function easeOutCubic(t) {

    return 1 -
      Math.pow(
        1 - t,
        3
      );

  }


  function easeInOutCubic(t) {

    return t < 0.5

      ? 4 * t * t * t

      : 1 -
        Math.pow(
          -2 * t + 2,
          3
        ) / 2;

  }


  function lerp(a, b, t) {

    return a +
      (b - a) * t;

  }


  function lerpPoint(a, b, t) {

    return {

      x:
        lerp(
          a.x,
          b.x,
          t
        ),

      y:
        lerp(
          a.y,
          b.y,
          t
        )

    };

  }


  /* =======================================================
     ÖLÇÜLER
     ======================================================= */

  function resize() {

    const stageRect =
      stage.getBoundingClientRect();

    const stickyRect =
      sticky.getBoundingClientRect();


    stageWidth =
      Math.max(
        1,
        stageRect.width
      );


    stageHeight =
      Math.max(
        1,
        stageRect.height
      );


    /*
      mac-flat oranı
    */

    const ratio =
      panel.naturalWidth &&
      panel.naturalHeight

        ? panel.naturalWidth /
          panel.naturalHeight

        : 1.6;


    /*
      ÖNEMLİ:

      Panel artık viewport'u dolduracak kadar
      büyümüyor.

      Yükseklik üzerinden de limit koyuyoruz.
      Böylece final durumda yukarı taşmayacak.
    */

    const maxByWidth =
      window.innerWidth * 0.72;


    const maxByHeight =
      stickyRect.height * 0.62 * ratio;


    finalWidth =
      Math.min(
        maxByWidth,
        maxByHeight
      );


    finalHeight =
      finalWidth /
      ratio;


    panel.style.width =
      finalWidth + "px";


    panel.style.height =
      finalHeight + "px";


    update();

  }


  /* =======================================================
     LAPTOP NOKTALARINI STAGE'E ÇEVİR
     ======================================================= */

  function laptopPoint(point) {

    return {

      x:
        point.x /
        1080 *
        stageWidth,

      y:
        point.y /
        1080 *
        stageHeight

    };

  }


  /* =======================================================
     LAPTOP KÖŞELERİ
     ======================================================= */

  function getLaptopCorners() {

    return {

      topLeft:
        laptopPoint(
          LAPTOP.topLeft
        ),

      topRight:
        laptopPoint(
          LAPTOP.topRight
        ),

      bottomRight:
        laptopPoint(
          LAPTOP.bottomRight
        ),

      bottomLeft:
        laptopPoint(
          LAPTOP.bottomLeft
        )

    };

  }


  /* =======================================================
     FINAL PANEL KÖŞELERİ
     ======================================================= */

  function getFinalCorners() {

    const stageRect =
      stage.getBoundingClientRect();

    const stickyRect =
      sticky.getBoundingClientRect();


    /*
      Sticky alanın GERÇEK ortası.
    */

    const centerX =
      stageWidth / 2;


    const viewportCenterY =
      stickyRect.top +
      stickyRect.height / 2;


    const centerY =
      viewportCenterY -
      stageRect.top;


    /*
      Final konum.
    */

    const left =
      centerX -
      finalWidth / 2;


   /*
  Final paneli viewport merkezinin biraz
  altında bitiriyoruz.

  Bu değerle oynayabilirsin:
  120 = hafif
  160 = belirgin
  200 = güçlü
*/
    const FINAL_Y_OFFSET = 290;

    const top =
      centerY -
      finalHeight / 2 +
      FINAL_Y_OFFSET;


    return {

      topLeft: {
        x: left,
        y: top
      },

      topRight: {
        x:
          left +
          finalWidth,

        y: top
      },

      bottomRight: {
        x:
          left +
          finalWidth,

        y:
          top +
          finalHeight
      },

      bottomLeft: {
        x: left,

        y:
          top +
          finalHeight
      }

    };

  }


  /* =======================================================
     ANİMASYON KÖŞELERİ

     BURASI ASIL DÜZELTME
     ======================================================= */

  function getAnimatedCorners(p) {

    const laptop =
      getLaptopCorners();

    const final =
      getFinalCorners();


    /*
      Perspektifin çözülme hızı.
    */

    const shapeP =
      easeOutCubic(
        p
      );


    /*
      Aşağı doğru transfer.

      İlk başta çok yavaş.

      Sonra düzleşmeye yaklaştıkça
      belirgin şekilde aşağı iner.

      Böylece panel laptop ekranından
      erken kopup yukarı kaçmaz.
    */

    const moveP =
      easeInOutCubic(
        Math.max(
          0,
          Math.min(
            1,
            (
              p -
              0.08
            ) /
            0.92
          )
        )
      );


    /*
      Ekstra aşağı transfer.

      Bu sadece geçiş hissini güçlendiriyor.
      Finalde sıfırlanıyor; final konumu yine
      tam merkez.
    */

    const transfer =
        500 *
        moveP;


    /*
      Önce dört köşeyi normal şekilde
      laptop → final arasında taşı.
    */

    const base = {

      topLeft:
        lerpPoint(
          laptop.topLeft,
          final.topLeft,
          shapeP
        ),

      topRight:
        lerpPoint(
          laptop.topRight,
          final.topRight,
          shapeP
        ),

      bottomRight:
        lerpPoint(
          laptop.bottomRight,
          final.bottomRight,
          shapeP
        ),

      bottomLeft:
        lerpPoint(
          laptop.bottomLeft,
          final.bottomLeft,
          shapeP
        )

    };


    /*
      Eş zamanlı aşağı hareket.

      NOT:
      Finalde transfer tekrar 0 oluyor,
      dolayısıyla panel final noktada
      tam merkeze oturuyor.
    */

    return {

      topLeft: {
        x:
          base.topLeft.x,

        y:
          base.topLeft.y +
          transfer
      },

      topRight: {
        x:
          base.topRight.x,

        y:
          base.topRight.y +
          transfer
      },

      bottomRight: {
        x:
          base.bottomRight.x,

        y:
          base.bottomRight.y +
          transfer
      },

      bottomLeft: {
        x:
          base.bottomLeft.x,

        y:
          base.bottomLeft.y +
          transfer
      }

    };

  }


  /* =======================================================
     HOMOGRAPHY
     ======================================================= */

  function solveHomography(
    src,
    dst
  ) {

    const A = [];
    const B = [];


    for (
      let i = 0;
      i < 4;
      i++
    ) {

      const x =
        src[i].x;

      const y =
        src[i].y;

      const X =
        dst[i].x;

      const Y =
        dst[i].y;


      A.push([
        x,
        y,
        1,
        0,
        0,
        0,
        -X * x,
        -X * y
      ]);

      B.push(X);


      A.push([
        0,
        0,
        0,
        x,
        y,
        1,
        -Y * x,
        -Y * y
      ]);

      B.push(Y);

    }


    for (
      let col = 0;
      col < 8;
      col++
    ) {

      let pivot =
        col;


      for (
        let row = col + 1;
        row < 8;
        row++
      ) {

        if (
          Math.abs(
            A[row][col]
          ) >
          Math.abs(
            A[pivot][col]
          )
        ) {

          pivot = row;

        }

      }


      if (
        Math.abs(
          A[pivot][col]
        ) <
        0.00000001
      ) {

        return null;

      }


      [
        A[col],
        A[pivot]
      ] = [
        A[pivot],
        A[col]
      ];


      [
        B[col],
        B[pivot]
      ] = [
        B[pivot],
        B[col]
      ];


      const div =
        A[col][col];


      for (
        let j = col;
        j < 8;
        j++
      ) {

        A[col][j] /=
          div;

      }


      B[col] /=
        div;


      for (
        let row = 0;
        row < 8;
        row++
      ) {

        if (
          row === col
        ) {
          continue;
        }


        const factor =
          A[row][col];


        for (
          let j = col;
          j < 8;
          j++
        ) {

          A[row][j] -=
            factor *
            A[col][j];

        }


        B[row] -=
          factor *
          B[col];

      }

    }


    return {

      a: B[0],
      b: B[1],
      c: B[2],

      d: B[3],
      e: B[4],
      f: B[5],

      g: B[6],
      h: B[7],

      i: 1

    };

  }


  /* =======================================================
     HOMOGRAPHY → CSS MATRIX3D
     ======================================================= */

  function homographyToMatrix(H) {

    return [

      H.a,
      H.d,
      0,
      H.g,

      H.b,
      H.e,
      0,
      H.h,

      0,
      0,
      1,
      0,

      H.c,
      H.f,
      0,
      H.i

    ];

  }


  /* =======================================================
     PANEL TRANSFORM
     ======================================================= */

  function setPanelTransform(
    corners
  ) {

    const source = [

      {
        x: 0,
        y: 0
      },

      {
        x:
          finalWidth,
        y: 0
      },

      {
        x:
          finalWidth,
        y:
          finalHeight
      },

      {
        x: 0,
        y:
          finalHeight
      }

    ];


    const H =
      solveHomography(
        source,
        [
          corners.topLeft,
          corners.topRight,
          corners.bottomRight,
          corners.bottomLeft
        ]
      );


    if (!H) {
      return;
    }


    const matrix =
      homographyToMatrix(
        H
      );


    panel.style.transform =
      `matrix3d(${matrix.join(",")})`;

  }


  /* =======================================================
     LAPTOP FADE
     ======================================================= */

  function updateLaptop() {

    /*
      Laptop biraz daha geç kaybolsun.

      Çünkü panel düzleşmeden laptop tamamen
      yok olmasın.
    */

    let fade =
      (
        progress -
        0.48
      ) /
      0.34;


    fade =
      Math.max(
        0,
        Math.min(
          1,
          fade
        )
      );


    const e =
      easeOutCubic(
        fade
      );


    bg.style.opacity =
      String(
        1 -
        e
      );


    bg.style.transform =
      `
        translateY(
          ${e * 12}px
        )
        scale(
          ${1 - e * 0.025}
        )
      `;

  }


  /* =======================================================
     BAŞLIK
     ======================================================= */

  function updateTitle() {

    if (!title) {
      return;
    }


    let p =
      progress /
      0.15;


    p =
      Math.max(
        0,
        Math.min(
          1,
          p
        )
      );


    const e =
      easeOutCubic(
        p
      );


    title.style.opacity =
      String(
        1 - e
      );


    title.style.transform =
      `
        translateY(
          ${e * 25}px
        )
      `;

  }

  /* =======================================================
     ALT METİN FADE IN
     ======================================================= */
  function updateBottomText() {

  if (!bottomText) return;

  if (
    !desktopQuery.matches ||
    reduceQuery.matches
  ) {

    bottomText.style.opacity = "1";
    bottomText.style.transform = "none";
    bottomText.style.pointerEvents = "auto";

    return;
  }


  /*
    Panel tamamen düzleştikten sonra
    yazı görünmeye başlasın.
  */

  let p =
    (progress - 0.92) /
    0.12;


  p =
    Math.max(
      0,
      Math.min(
        1,
        p
      )
    );


  const e =
    easeOutCubic(
      p
    );


  bottomText.style.opacity =
    String(e);


  bottomText.style.transform =
    `translateY(${(1 - e) * 40}px)`;


  bottomText.style.pointerEvents =
    e > 0.5
      ? "auto"
      : "none";
}

  /* =======================================================
     ANA UPDATE
     ======================================================= */

  function update() {

    ticking = false;


    const rect =
      track.getBoundingClientRect();


    const total =
      rect.height -
      window.innerHeight;


    progress =
      total > 0

        ? Math.max(
            0,
            Math.min(
              1,
              -rect.top /
              total
            )
          )

        : 0;


    /*
      Mobil
    */

    if (
      !desktopQuery.matches
    ) {

      panel.style.transform =
        "none";

      panel.style.width =
        "100%";

      panel.style.height =
        "auto";

      bg.style.opacity =
        "0";

      updateTitle();
      updateBottomText();

      return;

    }


    /*
      Reduced motion
    */

    if (
      reduceQuery.matches
    ) {

      const final =
        getFinalCorners();


      setPanelTransform(
        final
      );


      bg.style.opacity =
        "0";


      updateTitle();
      updateBottomText();

      return;

    }


    /*
      Animasyon %85'te tamamlanıyor.

      Böylece son %15'te panel sabit.
    */

    const animationP =
      Math.max(
        0,
        Math.min(
          1,
          progress /
          0.85
        )
      );


    const corners =
      getAnimatedCorners(
        animationP
      );


    setPanelTransform(
      corners
    );


    updateLaptop();

    updateTitle();
    updateBottomText();

  }


  /* =======================================================
     RAF
     ======================================================= */

  function requestUpdate() {

    if (ticking) {
      return;
    }


    ticking = true;


    requestAnimationFrame(
      update
    );

  }


  /* =======================================================
     EVENTS
     ======================================================= */

  window.addEventListener(
    "scroll",
    requestUpdate,
    {
      passive: true
    }
  );


  window.addEventListener(
    "resize",
    function () {

      resize();

      requestUpdate();

    }
  );


  /* =======================================================
     PANEL YÜKLENDİ
     ======================================================= */

  panel.onload =
    function () {

      resize();

      requestUpdate();

    };


  if (
    panel.complete &&
    panel.naturalWidth
  ) {

    resize();

    requestUpdate();

  }


})();

  /* mobil menü */
  var nav=document.getElementById("nav"), hamb=document.getElementById("hamb");
  hamb.addEventListener("click",function(){
    var o=nav.classList.toggle("open");
    hamb.setAttribute("aria-expanded",o?"true":"false");
  });
  document.querySelectorAll("#drawer a").forEach(function(a){
    a.addEventListener("click",function(){nav.classList.remove("open");hamb.setAttribute("aria-expanded","false");});
  });

  function animateScrollTo(top,cb){
    var startY=window.scrollY, delta=top-startY;
    if(reduce||Math.abs(delta)<2){window.scrollTo(0,top);if(cb)cb();return;}
    var duration=520, startTime=null;
    function ease(t){return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2;}
    function step(ts){
      if(!startTime)startTime=ts;
      var p=Math.min((ts-startTime)/duration,1);
      window.scrollTo(0,Math.round(startY+delta*ease(p)));
      if(p<1)requestAnimationFrame(step);
      else if(cb)cb();
    }
    requestAnimationFrame(step);
  }

  var navH=72;

  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener("click",function(e){
      var id=a.getAttribute("href").slice(1);
      if(!id)return;
      var target=document.getElementById(id);
      if(!target)return;
      e.preventDefault();
      var top=Math.max(0,Math.round(target.getBoundingClientRect().top+window.scrollY-navH));
      animateScrollTo(top);
    });
  });

  /* tek kaydırma = sonraki bölüm: fare tekerleğiyle her hamle bir sonraki/önceki
     bölüme kayarak gider (masaüstü fare kullanıcıları için). Şerit ayrı bir durak
     değil, hero'nun devamı sayılır. Ekrandan uzun bölümlerde önce içeriği normal
     kaydırmaya izin verilir, bölümün tamamı görülünce bir sonrakine geçilir. */
  (function(){
    var pointerFine = matchMedia("(pointer: fine)").matches;
    if(!pointerFine)return;
    var stops = [].slice.call(document.querySelectorAll("main > section"));
    var foot = document.querySelector(".foot");
    if(foot)stops.push(foot);
    if(stops.length < 2)return;

    var locked = false;

    function currentIndex(){
      var y = window.scrollY + navH + 2;
      var idx = 0;
      for(var i=0;i<stops.length;i++){
        if(stops[i].offsetTop <= y)idx = i;
      }
      return idx;
    }

    function goTo(idx){
      idx = Math.max(0, Math.min(stops.length - 1, idx));
      var target = stops[idx];
      var top = Math.max(0, Math.round(target.getBoundingClientRect().top + window.scrollY - navH));
      animateScrollTo(top);
    }

    window.addEventListener("wheel", function(e){
      if(window.innerWidth < 980)return; /* dar ekranlarda normal kaydırma serbest kalsın */
      if(locked){e.preventDefault();return;}
      var dir = e.deltaY > 0 ? 1 : -1;
      var idx = currentIndex();
      var current = stops[idx];
      var rect = current.getBoundingClientRect();

      if(dir > 0 && rect.bottom > window.innerHeight + 4){
        return; /* mevcut bölümün altı henüz görünmüyor, önce onu normal kaydır */
      }
      if(dir < 0 && rect.top < navH - 4){
        return; /* mevcut bölümün üstü henüz görünmüyor, önce onu normal kaydır */
      }

      var next = idx + dir;
      if(next < 0 || next > stops.length - 1)return; /* baştan/sondan taşma yok, normal davransın */
      e.preventDefault();
      locked = true;
      goTo(next);
      setTimeout(function(){locked = false;}, reduce ? 250 : 700);
    }, {passive:false});
  })();

  /* görünürlük animasyonu */
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(!e.isIntersecting)return;
      io.unobserve(e.target);
      var sibs=[].slice.call(e.target.parentNode.querySelectorAll("[data-r]"));
      var i=Math.max(0,sibs.indexOf(e.target));
      setTimeout(function(){e.target.classList.add("in");}, reduce?0:Math.min(i,5)*80);
    });
  },{threshold:.12,rootMargin:"0px 0px -6% 0px"});
  document.querySelectorAll("[data-r]").forEach(function(el){io.observe(el);});

  /* 3D harf çevirme başlık: her harf ayrı bir span'e bölünüp perspektifle
     -100deg'den 0'a dönerek sırayla belirir (reactbits "3D Letter Swap"
     mantığı, tek bir başlıkta kullanılıyor) */
  document.querySelectorAll(".letters-3d").forEach(function(h){

  var text = h.textContent;

  h.textContent = "";

  h.setAttribute(
    "aria-label",
    text
  );

  var i = 0;

  text.split("").forEach(function(ch){

    var span =
      document.createElement("span");

    span.className =
      "l3d-ch";

    span.style.setProperty(
      "--i",
      ch === " " ? i : i++
    );

    span.textContent = ch;

    h.appendChild(span);

  });

  h.setAttribute(
    "aria-hidden",
    "false"
  );


  var lio =
    new IntersectionObserver(
      function(es){

        es.forEach(function(e){

          if(!e.isIntersecting)
            return;

          lio.unobserve(e.target);

          e.target.classList.add(
            "l3d-show"
          );

        });

      },
      {
        threshold:.5
      }
    );

  lio.observe(h);

});

  /* kelime kelime beliren başlık: her kelime aşağıdan/hafif dönerek
     sırayla belirir (reactbits "Staggered Text" mantığı, tek bir
     başlıkta kullanılıyor) */
  document.querySelectorAll(".stagger-text").forEach(function(h){
    var words=h.textContent.trim().split(/\s+/);
    h.textContent="";
    words.forEach(function(w,i){
      var span=document.createElement("span");
      span.className="st-word";
      span.style.setProperty("--i",i);
      span.textContent=w;
      h.appendChild(span);
      if(i<words.length-1)h.appendChild(document.createTextNode(" "));
    });
    var sio=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting)return;
        sio.unobserve(e.target);
        e.target.classList.add("st-show");
      });
    },{threshold:.5});
    sio.observe(h);
  });

  /* bölüm başlıkları için farklı giriş animasyonları: bulanıklıktan
     netleşme, perde gibi açılma, harflerin dağınık yerlerden toplanması,
     alttan kayan pencere, daktilo — her bölüm başlığında farklısı
     kullanılıyor, sayfaya gelince tetikleniyor */
  (function(){
    function simpleReveal(sel){
      var els=[].slice.call(document.querySelectorAll(sel));
      if(!els.length)return;
      var io=new IntersectionObserver(function(es){
        es.forEach(function(e){
          if(!e.isIntersecting)return;
          io.unobserve(e.target);
          e.target.classList.add("anim-show");
        });
      },{threshold:.4});
      els.forEach(function(el){io.observe(el);});
    }
    simpleReveal(".anim-blur-in");

    /* perde: clip-path'i gözlenen elementin kendisine değil, içteki
       sarmalayıcıya uyguluyoruz (yoksa IntersectionObserver hiç tetiklenmiyor) */
    document.querySelectorAll(".anim-wipe").forEach(function(h){
      var inner=document.createElement("span");
      inner.className="wp-inner";
      inner.innerHTML=h.innerHTML;
      h.innerHTML="";
      h.appendChild(inner);
    });
    simpleReveal(".anim-wipe");

    /* harf dağılma: her harf rastgele bir noktadan/açıdan yerine gelir */
    document.querySelectorAll(".anim-scatter").forEach(function(h){
      var text=h.textContent;
      h.textContent="";
      var i=0;
      text.split("").forEach(function(ch){
        var s=document.createElement("span");
        s.className="sc-ch";
        s.style.setProperty("--i",ch===" "?i:i++);
        s.textContent=ch===" "?" ":ch;
        if(!reduce){
          var ang=Math.random()*360;
          var dist=18+Math.random()*22;
          var rot=(Math.random()*140-70).toFixed(1);
          var x=(Math.cos(ang*Math.PI/180)*dist).toFixed(1);
          var y=(Math.sin(ang*Math.PI/180)*dist).toFixed(1);
          s.style.transform="translate("+x+"px,"+y+"px) rotate("+rot+"deg)";
        }
        h.appendChild(s);
      });
      var chEls=[].slice.call(h.querySelectorAll(".sc-ch"));
      var scIo=new IntersectionObserver(function(es){
        es.forEach(function(e){
          if(!e.isIntersecting)return;
          scIo.unobserve(e.target);
          e.target.classList.add("anim-show");
          chEls.forEach(function(c){c.style.transform="translate(0,0) rotate(0deg)";});
        });
      },{threshold:.4});
      scIo.observe(h);
    });

    /* satır perdesi: metin alttaki bir pencereden yukarı doğru kayarak belirir */
    document.querySelectorAll(".anim-line-reveal").forEach(function(h){
      var inner=document.createElement("span");
      inner.className="lr-inner";
      inner.innerHTML=h.innerHTML;
      h.innerHTML="";
      h.appendChild(inner);
      var lrIo=new IntersectionObserver(function(es){
        es.forEach(function(e){
          if(!e.isIntersecting)return;
          lrIo.unobserve(e.target);
          e.target.classList.add("anim-show");
        });
      },{threshold:.4});
      lrIo.observe(h);
    });

    /* daktilo: harfler sırayla belirir, bitince imleç kaybolur */
    document.querySelectorAll(".anim-typewriter").forEach(function(h){
      var text=h.textContent;
      h.textContent="";
      var chars=[];
      text.split("").forEach(function(ch){
        var s=document.createElement("span");
        s.className="tw-ch";
        s.textContent=ch;
        h.appendChild(s);
        chars.push(s);
      });
      h.classList.add("typewriter");
      var cursor=document.createElement("span");
      cursor.className="tw-cursor tw-on";
      h.appendChild(cursor);
      var twIo=new IntersectionObserver(function(es){
        es.forEach(function(e){
          if(!e.isIntersecting)return;
          twIo.unobserve(e.target);
          if(reduce){
            chars.forEach(function(c){c.classList.add("tw-shown");});
            cursor.classList.add("tw-off");
            return;
          }
          var i=0;
          function step(){
            if(i<chars.length){
              chars[i].classList.add("tw-shown");
              i++;
              setTimeout(step, 22+Math.random()*26);
            }else{
              setTimeout(function(){cursor.classList.add("tw-off");}, 700);
            }
          }
          step();
        });
      },{threshold:.5});
      twIo.observe(h);
    });
  })();

  /* SSS */
  document.querySelectorAll(".item").forEach(function(item){
    var q=item.querySelector(".q"), a=item.querySelector(".a");
    q.setAttribute("aria-expanded","false");
    q.addEventListener("click",function(){
      var open=item.classList.contains("open");
      document.querySelectorAll(".item.open").forEach(function(o){
        o.classList.remove("open");
        o.querySelector(".a").style.maxHeight=null;
        o.querySelector(".q").setAttribute("aria-expanded","false");
      });
      if(!open){
        item.classList.add("open");
        a.style.maxHeight=a.scrollHeight+"px";
        q.setAttribute("aria-expanded","true");
      }
    });
  });
  addEventListener("resize",function(){
    var o=document.querySelector(".item.open");
    if(o){var a=o.querySelector(".a");a.style.maxHeight=a.scrollHeight+"px";}
  });

  /* sohbet demosu: mesajlar sırayla, aralarda "yazıyor" balonu */
  var chatDemo=document.getElementById("chat-demo");
  if(chatDemo){
    var steps=[].slice.call(chatDemo.querySelectorAll(".chat-step"));
    var typing1=document.getElementById("typing-1"), typing2=document.getElementById("typing-2");
    var chatBody=chatDemo.querySelector(".chat-body");
    var played=false;
    var chatIo=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting||played)return;
        played=true;
        chatIo.disconnect();
        if(reduce){
          steps.forEach(function(s){s.classList.add("shown");});
          return;
        }
        /* pembe arka planın büyüyüp küçülmemesi için kart yüksekliğini baştan sabitle
           (en kötü durumu, yani tüm mesajlar + yazıyor balonları aynı anda açıkken ölç) */
        if(chatBody){
          steps.forEach(function(s){s.classList.add("shown");});
          typing1.classList.add("shown");
          typing2.classList.add("shown");
          chatBody.style.minHeight=chatBody.getBoundingClientRect().height+"px";
          steps.forEach(function(s){s.classList.remove("shown");});
          typing1.classList.remove("shown");
          typing2.classList.remove("shown");
        }
        var t=400;
        setTimeout(function(){steps[0].classList.add("shown");},t); t+=700;
        setTimeout(function(){typing1.classList.add("shown");},t); t+=900;
        setTimeout(function(){typing1.classList.remove("shown");steps[1].classList.add("shown");},t); t+=700;
        setTimeout(function(){steps[2].classList.add("shown");},t); t+=600;
        setTimeout(function(){typing2.classList.add("shown");},t); t+=900;
        setTimeout(function(){typing2.classList.remove("shown");steps[3].classList.add("shown");},t);
      });
    },{threshold:.4});
    chatIo.observe(chatDemo);
  }

  /* sayaç animasyonu */
  var counters=[].slice.call(document.querySelectorAll(".count-up"));
  if(counters.length){
    var fmtTR=function(n){return Math.round(n).toLocaleString("tr-TR");};
    var countIo=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting)return;
        countIo.unobserve(e.target);
        var el=e.target, target=parseFloat(el.getAttribute("data-count"))||0;
        var isTR=el.getAttribute("data-format")==="tr";
        if(reduce){el.textContent=isTR?fmtTR(target):target;return;}
        var start=null, dur=900;
        function step(ts){
          if(!start)start=ts;
          var p=Math.min((ts-start)/dur,1);
          var eased=1-Math.pow(1-p,3);
          var val=target*eased;
          el.textContent=isTR?fmtTR(val):Math.round(val);
          if(p<1)requestAnimationFrame(step);
          else el.textContent=isTR?fmtTR(target):target;
        }
        requestAnimationFrame(step);
      });
    },{threshold:.4});
    counters.forEach(function(el){countIo.observe(el);});
  }

  /* sıralı kayan liste: her madde sırayla vurgulanıp (büyür, halka çıkar)
     sonra yeşile döner — aceternity "multi-step loader" mantığı */
  var seqLists=[].slice.call(document.querySelectorAll(".ticks-seq"));
  if(seqLists.length){
    var seqIo=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting)return;
        seqIo.unobserve(e.target);
        var items=[].slice.call(e.target.querySelectorAll(".tick"));
        if(reduce){items.forEach(function(it){it.classList.add("ts-done");});return;}
        var i=0;
        function next(){
          if(i>0)items[i-1].classList.replace("ts-active","ts-done");
          if(i>=items.length)return;
          items[i].classList.add("ts-active");
          i++;
          setTimeout(next,850);
        }
        setTimeout(next,400);
      });
    },{threshold:.5});
    seqLists.forEach(function(el){seqIo.observe(el);});
  }

  /* mıknatıs buton: fare butona yaklaşınca buton hafifçe fareye doğru kayar,
     uzaklaşınca yerine yumuşakça döner */
  if(matchMedia("(pointer: fine)").matches && !reduce){
    document.querySelectorAll(".magnetic-btn").forEach(function(btn){
      var radius=70, strength=0.35;
      btn.addEventListener("mousemove",function(e){
        var r=btn.getBoundingClientRect();
        var dx=e.clientX-(r.left+r.width/2), dy=e.clientY-(r.top+r.height/2);
        var dist=Math.sqrt(dx*dx+dy*dy);
        if(dist>radius){btn.style.transform="";return;}
        var pull=(1-dist/radius)*strength;
        btn.style.transform="translate("+(dx*pull)+"px,"+(dy*pull-2)+"px)";
      });
      btn.addEventListener("mouseleave",function(){btn.style.transform="";});
    });
  }

  /* kelimenin etrafına çizilen çerçeve + köşede beliren imleç ikonu
     (reactbits "Pointer Highlight" mantığı) — "tamamı" kelimesinde,
     daktilo bitince elle tetiklenir (data-trigger="manual"); başka
     .pointer-hl varsa normalde sayfaya gelince tetiklenir */
  (function(){
    document.querySelectorAll(".pointer-hl").forEach(function(el){
      var box=document.createElement("span");
      box.className="ph-box";
      box.setAttribute("aria-hidden","true");
      var cur=document.createElement("span");
      cur.className="ph-cursor";
      cur.setAttribute("aria-hidden","true");
      cur.innerHTML='<svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 3L11 20L13.5 12.5L21 10L4 3Z" fill="currentColor" stroke="white" stroke-width="1.2" stroke-linejoin="round"/></svg>';
      el.appendChild(box);
      el.appendChild(cur);
      if(el.getAttribute("data-trigger")==="manual")return;
      var ioP=new IntersectionObserver(function(es){
        es.forEach(function(e){
          if(!e.isIntersecting)return;
          ioP.unobserve(e.target);
          e.target.classList.add("ph-show");
        });
      },{threshold:.7});
      ioP.observe(el);
    });
  })();

  /* "Adapptiv" kelimesinin arkasında beliren fosforlu kalem vurgusu
     (reactbits "Hero Highlight" mantığı) — sayfaya gelince tetiklenir */
  (function(){
    var hlEls=[].slice.call(document.querySelectorAll(".hero-hl"));
    if(!hlEls.length)return;
    var hlIo=new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!e.isIntersecting)return;
        hlIo.unobserve(e.target);
        e.target.classList.add("hl-show");
      });
    },{threshold:.7});
    hlEls.forEach(function(el){hlIo.observe(el);});
  })();

  /* özel imleç: hedef kilidi. Boşta küçük dört köşeli bir reticül fareyi
     yumuşakça takip edip yavaşça döner; tıklanabilir bir öğenin üstüne
     gelince döner durur, dört köşe o öğenin kenarlarına kilitlenip
     çerçeveler (kaydırma sırasında da takip eder). */
  if(matchMedia("(pointer: fine)").matches && !reduce){
    var tc=document.createElement("div"); tc.className="tcursor spin";
    ["tl","tr","bl","br"].forEach(function(c){
      var s=document.createElement("span"); s.className="tcorner "+c; tc.appendChild(s);
    });
    document.body.appendChild(tc);
    document.body.classList.add("custom-cursor");

    var IDLE=26, PAD=8;
    var mx=innerWidth/2, my=innerHeight/2, px=mx, py=my, started=false;
    var locked=false, lockedEl=null;

    function setIdleRect(x,y){
      tc.style.left=(x-IDLE/2)+"px";
      tc.style.top=(y-IDLE/2)+"px";
      tc.style.width=IDLE+"px";
      tc.style.height=IDLE+"px";
    }
    function setLockedRect(el){
      var r=el.getBoundingClientRect();
      tc.style.left=(r.left-PAD)+"px";
      tc.style.top=(r.top-PAD)+"px";
      tc.style.width=(r.width+PAD*2)+"px";
      tc.style.height=(r.height+PAD*2)+"px";
    }

    document.addEventListener("mousemove",function(e){
      mx=e.clientX; my=e.clientY;
      if(!started){started=true;px=mx;py=my;setIdleRect(px,py);tc.classList.add("show");}
    },{passive:true});
    document.addEventListener("mouseleave",function(){tc.classList.remove("show");});
    document.addEventListener("mouseenter",function(){tc.classList.add("show");});

    function loop(){
      if(!locked){
        px+=(mx-px)*0.25;
        py+=(my-py)*0.25;
        setIdleRect(px,py);
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    document.querySelectorAll("a,button,.card,input,textarea,select").forEach(function(el){
      el.addEventListener("mouseenter",function(){
        locked=true; lockedEl=el;
        tc.classList.remove("spin");
        setLockedRect(el);
      });
      el.addEventListener("mouseleave",function(){
        locked=false; lockedEl=null;
        tc.classList.add("spin");
        px=mx; py=my;
        setIdleRect(px,py);
      });
    });

    addEventListener("scroll",function(){
      if(locked&&lockedEl)setLockedRect(lockedEl);
    },{passive:true});
  }
})();

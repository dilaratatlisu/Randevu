(function(){
  "use strict";
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  /* özel imleç: arka planla fark alan, hızlı harekette yönüne göre esneyen
     tek bir daire; tıklanabilir öğelerde büyür. Butonlar ayrıca imlece
     doğru hafifçe kayar (mıknatıs efekti). */
  if(matchMedia("(pointer: fine)").matches && !reduce){
    var cx=document.createElement("div"); cx.className="cursor-x";
    document.body.appendChild(cx);
    document.body.classList.add("custom-cursor");

    var mx=innerWidth/2, my=innerHeight/2, px=mx, py=my, started=false;
    document.addEventListener("mousemove",function(e){
      mx=e.clientX; my=e.clientY;
      if(!started){started=true;px=mx;py=my;cx.classList.add("show");}
    },{passive:true});
    document.addEventListener("mouseleave",function(){cx.classList.remove("show");});
    document.addEventListener("mouseenter",function(){cx.classList.add("show");});

    function cursorLoop(){
      var dx=mx-px, dy=my-py;
      px+=dx*0.2; py+=dy*0.2;
      var dist=Math.min(Math.sqrt(dx*dx+dy*dy),120);
      var stretch=dist/120*0.35;
      var angle=(dist>1)?Math.atan2(dy,dx)*180/Math.PI:0;
      cx.style.transform="translate("+px+"px,"+py+"px) rotate("+angle+"deg) scale("+(1+stretch)+","+(1-stretch*0.6)+")";
      requestAnimationFrame(cursorLoop);
    }
    requestAnimationFrame(cursorLoop);

    document.querySelectorAll("a,button,.card,input,textarea,select").forEach(function(el){
      el.addEventListener("mouseenter",function(){cx.classList.add("hover");});
      el.addEventListener("mouseleave",function(){cx.classList.remove("hover");});
    });

    /* mıknatıs: butonlar imlece doğru hafifçe çekilir */
    document.querySelectorAll(".btn").forEach(function(el){
      el.addEventListener("mousemove",function(e){
        var r=el.getBoundingClientRect();
        el.style.setProperty("--mx",((e.clientX-r.left-r.width/2)*0.3)+"px");
        el.style.setProperty("--my",((e.clientY-r.top-r.height/2)*0.3)+"px");
      });
      el.addEventListener("mouseleave",function(){
        el.style.setProperty("--mx","0px");
        el.style.setProperty("--my","0px");
      });
    });
  }
})();

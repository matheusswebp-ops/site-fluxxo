(function(){
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var desktop = window.matchMedia('(min-width:900px)').matches;

    // --- smooth scroll com inércia (Lenis) — só no desktop ---
    var lenis=null;
    if(!reduce && desktop && window.Lenis){
      lenis = new Lenis({ lerp:0.09, wheelMultiplier:0.9, smoothWheel:true, smoothTouch:false });
      (function raf(t){ lenis.raf(t); requestAnimationFrame(raf); })();
      // âncoras (menu) deslizando suave via Lenis
      document.querySelectorAll('a[href^="#"]').forEach(function(a){
        a.addEventListener('click',function(e){
          var id=a.getAttribute('href');
          if(id && id.length>1){
            var el=document.querySelector(id);
            if(el){ e.preventDefault(); lenis.scrollTo(el,{offset:-12,duration:1.15}); }
          }
        });
      });
    }

    // --- parallax do fundo: conecta as seções com profundidade ---
    if(!reduce){
      var blobs=[].slice.call(document.querySelectorAll('.page-fx b'));
      if(blobs.length){
        var cur=0;
        (function fxLoop(){
          var y=window.scrollY||window.pageYOffset||0;
          cur+=(y-cur)*0.09;
          for(var i=0;i<blobs.length;i++){
            var sp=parseFloat(blobs[i].getAttribute('data-sp'))||0;
            blobs[i].style.transform='translate3d(0,'+(cur*sp).toFixed(2)+'px,0)';
          }
          requestAnimationFrame(fxLoop);
        })();
      }
    }
  })();

  // ---- FAQ: acordeão (um aberto por vez) ----
  (function(){
    var items=[].slice.call(document.querySelectorAll('.faq-item'));
    if(!items.length) return;
    items.forEach(function(item){
      var btn=item.querySelector('.faq-q');
      btn.addEventListener('click',function(){
        var willOpen=!item.classList.contains('open');
        items.forEach(function(i){ i.classList.remove('open'); i.querySelector('.faq-q').setAttribute('aria-expanded','false'); });
        if(willOpen){ item.classList.add('open'); btn.setAttribute('aria-expanded','true'); }
      });
    });
  })();
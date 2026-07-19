(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var desktop = window.matchMedia('(min-width:900px)').matches;

  // --- smooth scroll com inércia (Lenis) — só no desktop, igual à home ---
  if(!reduce && desktop && window.Lenis){
    var lenis = new Lenis({ lerp:0.09, wheelMultiplier:0.9, smoothWheel:true, smoothTouch:false });
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
})();

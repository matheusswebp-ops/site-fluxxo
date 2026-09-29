/* Mentoria R80+ · Dra. Clara Aragão
   Link único do formulário, cabeçalho, entradas, luz que segue o mouse,
   checklist da dor, faixa do hero e trilho de resultados. */
(function(){
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, r){ return (r || document).querySelector(s); }
  function $$(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ---- link do formulário: um lugar só (data-form no body) ---- */
  var form = (document.body.getAttribute('data-form') || '').trim();
  if (form){
    $$('[data-aplicar]').forEach(function(a){ a.href = form; a.target = '_blank'; a.rel = 'noopener'; });
  }

  /* ---- cabeçalho e barra do celular ---- */
  var topo = $('#topo'), barra = $('#barra'), hero = $('.hero'), processoVisivel = false;
  function aoRolar(){
    var y = window.scrollY;
    topo.classList.toggle('solido', y > 30);
    barra.classList.toggle('visivel', y > hero.offsetHeight * .6 && !processoVisivel);
  }
  window.addEventListener('scroll', aoRolar, {passive:true});
  aoRolar();

  /* ---- entradas: cada peça sobe quando chega; irmãs em cascata ---- */
  if (reduz || !('IntersectionObserver' in window)){
    $$('.rv').forEach(function(e){ e.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function(itens){
      itens.forEach(function(i){
        if (!i.isIntersecting) return;
        var el = i.target, irmas = $$(':scope > .rv', el.parentNode);
        el.style.transitionDelay = Math.min(Math.max(irmas.indexOf(el), 0) * 90, 450) + 'ms';
        el.classList.add('in');
        io.unobserve(el);
      });
    }, {rootMargin:'0px 0px -8% 0px'});
    $$('.rv').forEach(function(e){ io.observe(e); });

    new IntersectionObserver(function(it){ processoVisivel = it[0].isIntersecting; aoRolar(); },
      {threshold:.25}).observe($('#processo'));
  }

  /* ---- luz que segue o mouse nos blocos escuros ---- */
  if (!reduz && window.matchMedia('(hover:hover)').matches){
    $$('[data-luz]').forEach(function(el){
      el.addEventListener('pointermove', function(e){
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---- faixa do hero: duplica para o loop sem emenda ---- */
  $$('.faixa-trilho').forEach(function(t){ t.innerHTML += t.innerHTML; });

  /* ---- dor: marcar o que parece com você ---- */
  $$('[data-dor] button').forEach(function(b){
    b.addEventListener('click', function(){
      b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    });
  });

  /* ---- resultados: setas e arrastar com o mouse ---- */
  var res = $('[data-res]');
  if (res){
    var ant = $('[data-res-ant]'), prox = $('[data-res-prox]');
    function passo(){ var c = res.children; return c[1] ? c[1].offsetLeft - c[0].offsetLeft : res.clientWidth; }
    function estado(){
      ant.disabled = res.scrollLeft <= 4;
      prox.disabled = res.scrollLeft >= res.scrollWidth - res.clientWidth - 4;
    }
    ant.addEventListener('click', function(){ res.scrollBy({left:-passo(), behavior:'smooth'}); });
    prox.addEventListener('click', function(){ res.scrollBy({left:passo(), behavior:'smooth'}); });
    res.addEventListener('scroll', estado, {passive:true});
    estado();
    var x0 = 0, s0 = 0, puxando = false;
    res.addEventListener('pointerdown', function(e){
      if (e.pointerType !== 'mouse') return;
      puxando = true; x0 = e.clientX; s0 = res.scrollLeft;
      res.classList.add('arrastando'); res.setPointerCapture(e.pointerId);
    });
    res.addEventListener('pointermove', function(e){ if (puxando) res.scrollLeft = s0 - (e.clientX - x0); });
    ['pointerup','pointercancel'].forEach(function(ev){
      res.addEventListener(ev, function(){ puxando = false; res.classList.remove('arrastando'); });
    });
  }
})();

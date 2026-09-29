/* Mentoria R80+ · Dra. Clara Aragão
   Link único do formulário, cabeçalho, entradas, checklist da dor,
   jornada (numerais enchem e o trilho desce até o 80+) e trilho de resultados. */
(function(){
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, r){ return (r || document).querySelector(s); }
  function $$(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function limita(v, a, b){ return Math.max(a, Math.min(b, v)); }

  /* ---- link do formulário: um lugar só (data-form no body) ---- */
  var form = (document.body.getAttribute('data-form') || '').trim();
  if (form){
    $$('[data-aplicar]').forEach(function(a){ a.href = form; a.target = '_blank'; a.rel = 'noopener'; });
  }

  /* ---- cabeçalho, progresso, barra do celular ---- */
  var topo = $('#topo'), prog = $('#progresso'), barra = $('#barra'), hero = $('.hero');
  var processoVisivel = false;
  function aoRolar(){
    var y = window.scrollY;
    topo.classList.toggle('solido', y > 30);
    var total = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.width = (total > 0 ? y / total * 100 : 0) + '%';
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
        el.style.transitionDelay = Math.min(irmas.indexOf(el) * 90, 450) + 'ms';
        el.classList.add('in');
        io.unobserve(el);
      });
    }, {rootMargin:'0px 0px -8% 0px'});
    $$('.rv').forEach(function(e){ io.observe(e); });

    new IntersectionObserver(function(it){ processoVisivel = it[0].isIntersecting; aoRolar(); },
      {threshold:.25}).observe($('#processo'));
  }

  /* ---- dor: marcar o que parece com você acende a faixa seguinte ---- */
  var virada = $('[data-virada]');
  $$('[data-dor] button').forEach(function(b, n, todos){
    b.addEventListener('click', function(){
      b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      var algum = todos.some(function(x){ return x.getAttribute('aria-pressed') === 'true'; });
      virada.classList.toggle('acesa', algum);
    });
  });

  /* ---- jornada ----
     O passo que cruza o meio da tela acende o numeral; os anteriores ficam
     preenchidos. O trilho acompanha a rolagem e, no fim, o 80+ se acende. */
  var jor = $('[data-jornada]');
  if (jor){
    var passos = $$('[data-passo]', jor), trilho = jor;
    function aoRolarJor(){
      var r = jor.getBoundingClientRect(), meio = window.innerHeight * .55;
      var p = limita((meio - r.top) / r.height, 0, 1);
      trilho.style.setProperty('--jp', p);
      var ativo = -1;
      passos.forEach(function(ps, i){ if (ps.getBoundingClientRect().top < meio) ativo = i; });
      passos.forEach(function(ps, i){
        ps.classList.toggle('ativo', i === ativo);
        ps.classList.toggle('feito', i < ativo);
      });
      var ultimo = passos[passos.length - 1].getBoundingClientRect();
      jor.classList.toggle('completa', ultimo.bottom < window.innerHeight * .85);
    }
    window.addEventListener('scroll', aoRolarJor, {passive:true});
    window.addEventListener('resize', aoRolarJor);
    aoRolarJor();
  }

  /* ---- resultados: setas, e arrastar com o mouse ---- */
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

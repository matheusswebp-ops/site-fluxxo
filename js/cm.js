/* Dr. Cassiano Machado · LP próstata aumentada / HoLEP
   WhatsApp único, cabeçalho, entradas, checador de sintomas,
   scrollytelling do bloco educativo e trilhos de avaliações. */
(function(){
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, r){ return (r || document).querySelector(s); }
  function $$(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ---- WhatsApp: número único no body; a mensagem cita os sintomas marcados ---- */
  var numero = document.body.getAttribute('data-whats');
  function linkWhats(){
    var marcados = $$('[data-sintomas] button[aria-pressed="true"] span').map(function(s){
      return '- ' + s.textContent.replace(/[;?.]+$/, '');
    });
    var msg = 'Olá! Vim pela página do Dr. Cassiano Machado e gostaria de agendar uma avaliação.';
    if (marcados.length) msg += '\n\nSintomas que tenho percebido:\n' + marcados.join('\n');
    return 'https://wa.me/' + numero + '?text=' + encodeURIComponent(msg);
  }
  $$('[data-whats-link]').forEach(function(a){
    a.target = '_blank'; a.rel = 'noopener';
    a.href = linkWhats();
    a.addEventListener('click', function(){ a.href = linkWhats(); });
  });

  /* ---- cabeçalho e barra do celular ---- */
  var topo = $('#topo'), barra = $('#barra'), hero = $('.hero'), finalVisivel = false;
  function aoRolar(){
    var y = window.scrollY;
    topo.classList.toggle('solido', y > 30);
    barra.classList.toggle('visivel', y > hero.offsetHeight * .8 && !finalVisivel);
  }
  window.addEventListener('scroll', aoRolar, {passive:true});
  aoRolar();

  /* ---- entradas ---- */
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
    new IntersectionObserver(function(it){ finalVisivel = it[0].isIntersecting; aoRolar(); },
      {threshold:.3}).observe($('#agendar'));
  }

  /* ---- checador de sintomas ---- */
  var sint = $('[data-sintomas]');
  if (sint){
    $$('button', sint).forEach(function(b){
      b.addEventListener('click', function(){
        b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
        sint.classList.toggle('marcou', !!$('button[aria-pressed="true"]', sint));
      });
    });
  }

  /* ---- educativo: o bloco no meio da tela troca a imagem presa ao lado ---- */
  var edu = $('[data-edu]');
  if (edu){
    var blocos = $$('.edu-bloco', edu), imgs = $$('.edu-img', edu), marcos = $$('.edu-marcos li', edu);
    function cena(n){
      imgs.forEach(function(i){ i.classList.toggle('on', i.getAttribute('data-cena') === String(n)); });
      blocos.forEach(function(b){ b.classList.toggle('on', b.getAttribute('data-cena') === String(n)); });
      marcos.forEach(function(m, k){ m.classList.toggle('on', k === n); });
    }
    function aoRolarEdu(){
      var meio = window.innerHeight * .55, atual = 0;
      blocos.forEach(function(b, k){ if (b.getBoundingClientRect().top < meio) atual = k; });
      cena(atual);
    }
    window.addEventListener('scroll', aoRolarEdu, {passive:true});
    aoRolarEdu();
  }

  /* ---- trilhos (avaliações e depoimentos): setas e arrastar com o mouse ---- */
  $$('[data-trilho]').forEach(function(t){
    var id = t.getAttribute('data-trilho');
    var ant = $('[data-ant="' + id + '"]'), prox = $('[data-prox="' + id + '"]');
    function passo(){ var c = t.children; return c[1] ? c[1].offsetLeft - c[0].offsetLeft : t.clientWidth; }
    function estado(){
      if (!ant) return;
      ant.disabled = t.scrollLeft <= 4;
      prox.disabled = t.scrollLeft >= t.scrollWidth - t.clientWidth - 4;
    }
    if (ant){
      ant.addEventListener('click', function(){ t.scrollBy({left:-passo(), behavior:'smooth'}); });
      prox.addEventListener('click', function(){ t.scrollBy({left:passo(), behavior:'smooth'}); });
    }
    t.addEventListener('scroll', estado, {passive:true});
    estado();
    var x0 = 0, s0 = 0, puxando = false;
    t.addEventListener('pointerdown', function(e){
      if (e.pointerType !== 'mouse') return;
      puxando = true; x0 = e.clientX; s0 = t.scrollLeft;
      t.classList.add('arrastando'); t.setPointerCapture(e.pointerId);
    });
    t.addEventListener('pointermove', function(e){ if (puxando) t.scrollLeft = s0 - (e.clientX - x0); });
    ['pointerup','pointercancel'].forEach(function(ev){
      t.addEventListener(ev, function(){ puxando = false; t.classList.remove('arrastando'); });
    });
  });
})();

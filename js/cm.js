/* Dr. Cassiano Machado · LP próstata aumentada / HoLEP
   WhatsApp único (com os sintomas marcados na mensagem), cabeçalho,
   entradas, cenas do bloco educativo, escada de tratamento, laser do
   HoLEP conduzido pela rolagem, critérios e trilhos. */
(function(){
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, r){ return (r || document).querySelector(s); }
  function $$(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function limita(v, a, b){ return Math.max(a, Math.min(b, v)); }

  /* ---- WhatsApp ---- */
  var numero = document.body.getAttribute('data-whats');
  function linkWhats(){
    var marcados = $$('[data-sintomas] button[aria-pressed="true"] .s-t').map(function(s){
      return '- ' + s.textContent.replace(/[\s;?.]+$/, '');
    });
    var msg = 'Olá! Vim pela página do Dr. Cassiano Machado e gostaria de agendar uma avaliação.';
    if (marcados.length) msg += '\n\nSintomas que tenho percebido:\n' + marcados.join('\n');
    return 'https://wa.me/' + numero + '?text=' + encodeURIComponent(msg);
  }
  $$('[data-whats-link]').forEach(function(a){
    a.target = '_blank'; a.rel = 'noopener'; a.href = linkWhats();
    a.addEventListener('click', function(){ a.href = linkWhats(); });
  });

  /* ---- sintomas ---- */
  var sint = $('[data-sintomas]');
  if (sint) $$('button', sint).forEach(function(b){
    b.addEventListener('click', function(){
      b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      sint.classList.toggle('marcou', !!$('button[aria-pressed="true"]', sint));
    });
  });

  /* ---- entradas ---- */
  if (reduz || !('IntersectionObserver' in window)){
    $$('.rv').forEach(function(e){ e.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function(itens){
      itens.forEach(function(i){
        if (!i.isIntersecting) return;
        var el = i.target, irmas = $$(':scope > .rv', el.parentNode);
        el.style.transitionDelay = Math.min(Math.max(irmas.indexOf(el), 0) * 90, 450) + 'ms';
        el.classList.add('in'); io.unobserve(el);
      });
    }, {rootMargin:'0px 0px -8% 0px'});
    $$('.rv').forEach(function(e){ io.observe(e); });
  }

  /* ---- tudo o que depende da rolagem, num quadro só ---- */
  var topo = $('#topo'), barra = $('#barra'), hero = $('.hero'), final = $('#agendar');
  var edu = $('[data-edu]'), blocos = edu ? $$('.edu-bloco', edu) : [], cenas = edu ? $$('.cena', edu) : [], marcos = edu ? $$('.edu-progresso li', edu) : [];
  var escada = $('.escada'), degraus = escada ? $$('.degrau', escada) : [];
  var holep = $('[data-holep]'), palco = holep ? $('.holep-palco', holep) : null;
  var cenaAtual = -1, pend = false;

  function cena(n){
    if (n === cenaAtual) return; cenaAtual = n;
    cenas.forEach(function(c){ c.classList.toggle('on', c.getAttribute('data-cena') === String(n)); });
    blocos.forEach(function(b){ b.classList.toggle('on', b.getAttribute('data-cena') === String(n)); });
    marcos.forEach(function(m, k){ m.classList.toggle('on', k === n); });
  }

  function quadro(){
    pend = false;
    var y = window.scrollY, vh = window.innerHeight;
    topo.classList.toggle('solido', y > 30);
    var f = final.getBoundingClientRect();
    barra.classList.toggle('visivel', y > hero.offsetHeight * .7 && f.top > vh * .6);

    if (blocos.length){
      var linha = vh * .55, n = 0;
      blocos.forEach(function(b, k){ if (b.getBoundingClientRect().top < linha) n = k; });
      cena(n);
    }

    if (escada){
      var r = escada.getBoundingClientRect();
      var p = limita((vh * .8 - r.top) / (r.height + vh * .2), 0, 1);
      escada.style.setProperty('--ep', reduz ? 1 : p);
      degraus.forEach(function(d, k){ d.classList.toggle('aceso', reduz || p >= (k / Math.max(degraus.length - 1, 1)) - .02); });
    }

    if (holep){
      var h = holep.getBoundingClientRect();
      var ph = limita((vh * .3 - h.top) / Math.max(h.height - vh * .3, 1), 0, 1);
      palco.style.setProperty('--p', reduz ? 1 : ph.toFixed(3));
    }
  }
  window.addEventListener('scroll', function(){ if (!pend){ pend = true; requestAnimationFrame(quadro); } }, {passive:true});
  window.addEventListener('resize', quadro);
  quadro();

  /* ---- critérios: grifam um a um quando entram ---- */
  var crit = $('[data-criterios]');
  if (crit && 'IntersectionObserver' in window){
    new IntersectionObserver(function(it, o){
      if (it[0].isIntersecting){ crit.classList.add('in'); o.disconnect(); }
    }, {threshold:.45}).observe(crit);
  }

  /* ---- trilhos: setas e arrastar com o mouse ---- */
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

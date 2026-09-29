/* Mentoria R80+ · Dra. Clara Aragão
   Entrada por seção, link único do formulário, checklist da dor,
   medidor de pontuação da jornada, alternador de momento e faixa de resultados. */
(function(){
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, r){ return (r || document).querySelector(s); }
  function $$(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ---- link do formulário: um lugar só (data-form no body) ---- */
  var form = (document.body.getAttribute('data-form') || '').trim();
  if (form){
    $$('[data-aplicar]').forEach(function(a){
      a.href = form; a.target = '_blank'; a.rel = 'noopener';
    });
  }

  /* ---- cabeçalho, progresso e barra do celular ---- */
  var topo = $('#topo'), prog = $('#progresso'), barra = $('#barraMobile'), hero = $('.hero-r80');
  var entrarVisivel = false;
  function aoRolar(){
    var y = window.scrollY;
    topo.classList.toggle('solido', y > 20);
    var total = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.width = (total > 0 ? (y / total) * 100 : 0) + '%';
    barra.classList.toggle('visivel', y > hero.offsetHeight * .7 && !entrarVisivel);
  }
  window.addEventListener('scroll', aoRolar, {passive:true});
  aoRolar();

  /* ---- entrada por seção, de ida e volta ---- */
  if (reduz || !('IntersectionObserver' in window)){
    $$('.reveal').forEach(function(e){ e.classList.add('in'); });
  } else {
    var obs = new IntersectionObserver(function(itens){
      itens.forEach(function(i){
        var pecas = i.target.querySelectorAll('.reveal');
        if (i.isIntersecting){
          pecas.forEach(function(p, n){ p.style.transitionDelay = Math.min(n * 70, 420) + 'ms'; p.classList.add('in'); });
        } else {
          pecas.forEach(function(p){ p.style.transitionDelay = '0ms'; p.classList.remove('in'); });
        }
      });
    }, {rootMargin:'0px 0px -12% 0px', threshold:0});
    $$('.sec,.hero-r80').forEach(function(s){ obs.observe(s); });

    new IntersectionObserver(function(it){ entrarVisivel = it[0].isIntersecting; aoRolar(); },
      {threshold:.2}).observe($('#como-entrar'));
  }

  /* ---- faixa de resultados: duplica o conteúdo para o loop sem emenda ---- */
  $$('[data-faixa] .faixa-trilho').forEach(function(t){
    $$(':scope > *', t).forEach(function(el){
      var c = el.cloneNode(true); c.setAttribute('aria-hidden', 'true'); t.appendChild(c);
    });
  });

  /* ---- dor: o leitor marca o que parece com ele ---- */
  var dor = $('[data-dor]');
  if (dor){
    var itens = $$('button', dor), contador = $('[data-dor-contador]', dor), virada = $('[data-virada]');
    itens.forEach(function(b){
      b.addEventListener('click', function(){
        b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
        var n = itens.filter(function(x){ return x.getAttribute('aria-pressed') === 'true'; }).length;
        dor.classList.toggle('marcou', n > 0);
        virada.classList.toggle('acesa', n > 0);
        contador.textContent = n === 0 ? 'Toque nos itens que parecem com você'
          : n === itens.length ? 'Você marcou os 5. A R80+ foi feita para o seu caso.'
          : 'Você marcou ' + n + ' de ' + itens.length;
      });
    });
  }

  /* ---- medidor da jornada ----
     O passo que cruza o meio da tela vira o ativo; o anel enche até a meta
     dele (80 = cheio) e o número conta até lá. */
  var medidor = $('[data-medidor]');
  if (medidor){
    var passos = $$('[data-passo]'), anel = $('[data-anel]', medidor), num = $('[data-pontos]', medidor);
    var rotPasso = $('[data-medidor-passo]', medidor), rotNome = $('[data-medidor-nome]', medidor);
    var marcas = $$('.medidor-trilha li', medidor);
    var valor = 0, alvo = 0, anim = null, atual = -1;

    function escreve(v){ num.textContent = (alvo >= 80 && v >= 80) ? '80+' : Math.round(v); }
    function conta(){
      cancelAnimationFrame(anim);
      if (reduz){ valor = alvo; escreve(valor); return; }
      var de = valor, ini = null;
      function q(t){
        if (!ini) ini = t;
        var k = Math.min(1, (t - ini) / 900), s = 1 - Math.pow(1 - k, 3);
        valor = de + (alvo - de) * s; escreve(valor);
        if (k < 1) anim = requestAnimationFrame(q);
      }
      anim = requestAnimationFrame(q);
    }
    function ativa(i){
      if (i === atual) return;
      atual = i;
      var p = passos[i];
      passos.forEach(function(x, n){ x.classList.toggle('ativo', n === i); });
      marcas.forEach(function(m, n){ m.classList.toggle('on', n <= i); });
      alvo = parseInt(p.getAttribute('data-meta'), 10);
      anel.style.strokeDashoffset = 100 - Math.min(100, alvo / 80 * 100);
      rotPasso.textContent = 'Passo ' + (i + 1) + ' de ' + passos.length;
      rotNome.textContent = p.getAttribute('data-nome');
      medidor.classList.toggle('completo', alvo >= 80);
      conta();
    }
    if ('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(it){
        it.forEach(function(e){ if (e.isIntersecting) ativa(parseInt(e.target.getAttribute('data-passo'), 10)); });
      }, {rootMargin:'-45% 0px -45% 0px', threshold:0});
      passos.forEach(function(p){ io.observe(p); });
    } else ativa(passos.length - 1);
  }

  /* ---- alternador internato / formado ---- */
  $$('[data-momento]').forEach(function(box){
    var abas = $$('[data-aba]', box), barraAbas = $('.momento-abas', box);
    abas.forEach(function(a){
      a.addEventListener('click', function(){
        var k = a.getAttribute('data-aba');
        barraAbas.setAttribute('data-lado', k);
        abas.forEach(function(o){ o.setAttribute('aria-selected', o === a ? 'true' : 'false'); });
        $$('[data-aba-conteudo]', box).forEach(function(c){ c.hidden = c.getAttribute('data-aba-conteudo') !== k; });
      });
    });
  });
})();

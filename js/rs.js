/* Dra. Rafaela Sandrin · Transplante capilar
   Tudo o que a página faz além de rolar: entrada por seção, player,
   antes/depois, carrossel, jornada, linha do tempo dos fios, faixas de
   depoimento, abas do NoShave e formulário que abre o WhatsApp. */
(function(){
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var WHATS = '5565996951441';
  function $(s, r){ return (r || document).querySelector(s); }
  function $$(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function limita(v, a, b){ return Math.max(a, Math.min(b, v)); }

  /* ---- cabeçalho, progresso e barra do celular ---- */
  var topo = $('#topo'), prog = $('#progresso'), barra = $('#barraMobile');
  var hero = $('.hero-rs'), formVisivel = false;
  function aoRolar(){
    var y = window.scrollY;
    topo.classList.toggle('solido', y > 20);
    var total = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.width = (total > 0 ? (y / total) * 100 : 0) + '%';
    barra.classList.toggle('visivel', y > hero.offsetHeight * .75 && !formVisivel);
  }
  window.addEventListener('scroll', aoRolar, {passive:true});
  aoRolar();

  /* ---- entrada por seção, de ida e volta (mesmo padrão das outras LPs) ---- */
  if (reduz || !('IntersectionObserver' in window)){
    $$('.reveal').forEach(function(e){ e.classList.add('in'); });
  } else {
    var obs = new IntersectionObserver(function(itens){
      itens.forEach(function(i){
        var pecas = i.target.querySelectorAll('.reveal');
        if (i.isIntersecting){
          pecas.forEach(function(p, n){
            p.style.transitionDelay = Math.min(n * 70, 420) + 'ms';
            p.classList.add('in');
          });
        } else {
          pecas.forEach(function(p){ p.style.transitionDelay = '0ms'; p.classList.remove('in'); });
        }
      });
    }, {rootMargin:'0px 0px -12% 0px', threshold:0});
    $$('.sec,.hero-rs').forEach(function(s){ obs.observe(s); });

    new IntersectionObserver(function(itens){
      formVisivel = itens[0].isIntersecting; aoRolar();
    }, {threshold:.15}).observe($('#agendar'));
  }

  /* ---- player VSL ----
     Enquanto data-embed estiver vazio, o play só avisa que o vídeo vem aí. */
  $$('.vsl-moldura').forEach(function(m){
    var play = $('.vsl-play', m), aviso = $('.vsl-aviso', m), t;
    play.addEventListener('click', function(){
      var url = (m.getAttribute('data-embed') || '').trim();
      if (!url){
        aviso.hidden = false; clearTimeout(t);
        t = setTimeout(function(){ aviso.hidden = true; }, 3200);
        return;
      }
      var f = document.createElement('iframe');
      f.src = url + (url.indexOf('?') < 0 ? '?' : '&') + 'autoplay=1';
      f.allow = 'autoplay; fullscreen; picture-in-picture';
      f.allowFullscreen = true;
      f.title = 'Vídeo da Dra. Rafaela Sandrin';
      m.appendChild(f); m.classList.add('tocando');
    });
  });

  /* ---- antes e depois ----
     Arrastar em qualquer ponto da foto move a divisória. touch-action:pan-y
     deixa a rolagem vertical com o navegador e o gesto lateral com a gente. */
  function posComp(c, p){
    p = limita(p, 0, 100);
    c.style.setProperty('--pos', p + '%');
    $('.comp-alca', c).setAttribute('aria-valuenow', Math.round(p));
  }
  var mexeuNaComp = false;
  $$('[data-comp]').forEach(function(c){
    var arrastando = false, toque = null;
    function segue(x){
      mexeuNaComp = true;
      var r = c.getBoundingClientRect();
      posComp(c, (x - r.left) / r.width * 100);
    }
    /* mouse e caneta: pointer events */
    c.addEventListener('pointerdown', function(e){
      if (e.pointerType === 'touch') return;
      arrastando = true; c.classList.add('arrastando');
      c.setPointerCapture(e.pointerId); segue(e.clientX);
    });
    c.addEventListener('pointermove', function(e){ if (arrastando && e.pointerType !== 'touch') segue(e.clientX); });
    ['pointerup','pointercancel'].forEach(function(ev){
      c.addEventListener(ev, function(e){
        if (e.pointerType === 'touch') return;
        arrastando = false; c.classList.remove('arrastando');
      });
    });
    /* toque: no celular, segurar o dedo disparava o menu de toque longo, que
       cancelava o pointer e travava a divisória. Com touch events o primeiro
       movimento decide: lateral move a divisória, vertical rola a página. */
    c.addEventListener('touchstart', function(e){
      var t = e.touches[0]; toque = {x:t.clientX, y:t.clientY, modo:null};
    }, {passive:true});
    c.addEventListener('touchmove', function(e){
      if (!toque) return;
      var t = e.touches[0], dx = t.clientX - toque.x, dy = t.clientY - toque.y;
      if (!toque.modo){
        if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
        toque.modo = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
        if (toque.modo === 'x') c.classList.add('arrastando');
      }
      if (toque.modo === 'x'){ e.preventDefault(); segue(t.clientX); }
    }, {passive:false});
    c.addEventListener('touchend', function(){
      if (toque && !toque.modo) segue(toque.x);   /* toque rápido leva a divisória até o dedo */
      toque = null; c.classList.remove('arrastando');
    });
    c.addEventListener('touchcancel', function(){ toque = null; c.classList.remove('arrastando'); });
    c.addEventListener('contextmenu', function(e){ e.preventDefault(); });
    $('.comp-alca', c).addEventListener('keydown', function(e){
      var atual = parseFloat(c.style.getPropertyValue('--pos')) || 50;
      if (e.key === 'ArrowLeft'){ posComp(c, atual - 5); e.preventDefault(); }
      if (e.key === 'ArrowRight'){ posComp(c, atual + 5); e.preventDefault(); }
    });
  });

  /* a primeira comparação balança uma vez quando aparece, para ensinar o gesto */
  var primeiro = $('[data-comp]');
  if (primeiro && !reduz && 'IntersectionObserver' in window){
    var io = new IntersectionObserver(function(it){
      if (!it[0].isIntersecting) return;
      io.disconnect();
      var ini = null, quadros = [50, 26, 74, 50];
      function passo(t){
        if (!ini) ini = t;
        var k = limita((t - ini) / 2000, 0, 1) * 3, i = Math.min(2, Math.floor(k)), f = k - i;
        var s = f * f * (3 - 2 * f);
        if (mexeuNaComp) return;   /* a pessoa já está arrastando: a demonstração para */
        posComp(primeiro, quadros[i] + (quadros[i + 1] - quadros[i]) * s);
        if (k < 3) requestAnimationFrame(passo);
      }
      setTimeout(function(){ requestAnimationFrame(passo); }, 500);
    }, {threshold:.6});
    io.observe(primeiro);
  }

  /* ---- carrossel dos casos ---- */
  $$('[data-carrossel]').forEach(function(car){
    var trilho = $('[data-trilho]', car), cards = $$('.caso', trilho);
    var pontos = $('[data-pontos]', car), ant = $('[data-ant]', car), prox = $('[data-prox]', car);
    cards.forEach(function(){ pontos.appendChild(document.createElement('i')); });
    function passo(){ return cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : trilho.clientWidth; }
    function atualiza(){
      var fim = trilho.scrollWidth - trilho.clientWidth - 2;
      var idx = Math.round(trilho.scrollLeft / passo());
      if (trilho.scrollLeft >= fim) idx = cards.length - 1;
      $$('i', pontos).forEach(function(p, n){ p.classList.toggle('on', n === idx); });
      ant.disabled = trilho.scrollLeft <= 2;
      prox.disabled = trilho.scrollLeft >= fim;
    }
    ant.addEventListener('click', function(){ trilho.scrollBy({left:-passo()}); });
    prox.addEventListener('click', function(){ trilho.scrollBy({left:passo()}); });
    trilho.addEventListener('scroll', atualiza, {passive:true});
    window.addEventListener('resize', atualiza);
    atualiza();
  });

  /* ---- crescimento dos fios (etapa 06) ----
     Os enxertos caem entre a linha frontal recuada e a linha planejada.
     Aleatório com semente fixa: o desenho é sempre o mesmo. */
  var fiosG = $('[data-fios]'), crostasG = $('[data-crostas]');
  var mesInput = $('[data-mes]'), mesRot = $('[data-mes-rotulo]'), mesFase = $('[data-mes-fase]');
  var fios = [], crostas = [], enxerto = null;
  (function(){
    if (!fiosG) return;
    var NS = 'http://www.w3.org/2000/svg', semente = 7;
    function rnd(){ semente = (semente * 16807) % 2147483647; return semente / 2147483647; }
    var recuo = [[124,108],[152,86],[180,102],[208,86],[236,108]];
    function linhaRecuada(x){
      for (var i = 0; i < recuo.length - 1; i++){
        var a = recuo[i], b = recuo[i + 1];
        if (x >= a[0] && x <= b[0]) return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]);
      }
      return 108;
    }
    function linhaPlanejada(x){ var u = (x - 180) / 54; return 118 - 11 * (1 - u * u); }

    /* a massa de cabelo que fecha as entradas: entre a linha recuada (por
       baixo do cabelo, para não deixar fresta) e a linha planejada */
    var d = 'M122 ' + (linhaRecuada(122) - 2).toFixed(1);
    for (var xa = 124; xa <= 238; xa += 2) d += ' L' + xa + ' ' + (linhaRecuada(xa) - 2).toFixed(1);
    for (var xb = 238; xb >= 122; xb -= 2) d += ' L' + xb + ' ' + linhaPlanejada(xb).toFixed(1);
    enxerto = document.createElementNS(NS, 'path');
    enxerto.setAttribute('d', d + 'Z'); enxerto.setAttribute('class', 'enxerto');
    fiosG.appendChild(enxerto);

    var tentativas = 0;
    while (fios.length < 220 && tentativas++ < 5000){
      var x = 123 + rnd() * 114, y0 = linhaRecuada(x) + 1, y1 = linhaPlanejada(x);
      if (y1 - y0 < 3) continue;
      var y = y0 + rnd() * (y1 - y0);
      var c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', x.toFixed(1)); c.setAttribute('cy', y.toFixed(1)); c.setAttribute('r', '1.5');
      if (fios.length % 2 === 0){ crostasG.appendChild(c); crostas.push(c); }
      var l = document.createElementNS(NS, 'line');
      l.setAttribute('x1', x.toFixed(1)); l.setAttribute('y1', y.toFixed(1));
      fiosG.appendChild(l);
      fios.push({el:l, x:x, y:y, t:rnd(), lado:(x - 180) / 54});
    }
  })();

  var FASES = [
    [1, 'Os folículos acabam de ser implantados. As pequenas crostas saem nas primeiras semanas.'],
    [3, 'É comum que os fios transplantados caiam nesta fase. O folículo permanece e volta a produzir o fio.'],
    [6, 'Os novos fios começam a nascer, ainda finos.'],
    [9, 'Os fios ganham espessura e a densidade fica mais visível.'],
    [99, 'O resultado se consolida ao longo do primeiro ano e é avaliado nos retornos.']
  ];
  function desenhaMes(m){
    if (!fiosG) return;
    var dens = m < 3 ? 0 : limita(.12 + (m - 3) / 6 * .88, 0, 1);
    var comp = m < 3 ? 0 : 2 + limita((m - 3) / 7, 0, 1) * 9;
    /* do 4º mês em diante a área vai fechando até ficar toda preenchida no 12º */
    enxerto.style.opacity = limita((m - 4) / 7, 0, 1);
    fios.forEach(function(f){
      var on = f.t < dens, L = on ? comp * (.75 + f.t * .35) : 0;
      f.el.setAttribute('x2', (f.x + f.lado * L * .5).toFixed(1));
      f.el.setAttribute('y2', (f.y + L * .8).toFixed(1));
      f.el.style.opacity = on ? .9 : 0;
    });
    var op = limita(1 - m / 1.2, 0, 1);
    crostas.forEach(function(c){ c.style.opacity = op; });
    mesInput.value = m;
    mesInput.style.setProperty('--p', (m / 12 * 100) + '%');
    mesRot.textContent = 'Mês ' + Math.round(m);
    if (mesFase) for (var i = 0; i < FASES.length; i++){ if (m < FASES[i][0]){ mesFase.textContent = FASES[i][1]; break; } }
  }
  var animMes = null;
  function tocaMeses(){
    if (reduz){ desenhaMes(12); return; }
    cancelAnimationFrame(animMes);
    var ini = null;
    function q(t){
      if (!ini) ini = t;
      var k = limita((t - ini) / 3600, 0, 1);
      desenhaMes(12 * (1 - Math.pow(1 - k, 2)));
      if (k < 1) animMes = requestAnimationFrame(q);
    }
    animMes = requestAnimationFrame(q);
  }
  if (mesInput){
    mesInput.addEventListener('input', function(){ cancelAnimationFrame(animMes); desenhaMes(parseFloat(mesInput.value)); });
    desenhaMes(0);
  }

  /* ---- jornada ----
     No desktop a seção prende na tela e a posição da rolagem escolhe a etapa.
     No celular e em telas baixas, a troca é por toque, setas ou deslize. */
  var jor = $('[data-jornada]');
  if (jor){
    var botoes = $$('[data-ir]', jor), paineis = $$('[data-painel]', jor);
    var linha = $('.jor-trilha', jor), contador = $('[data-jor-contador]', jor);
    var bAnt = $('[data-jor-ant]', jor), bProx = $('[data-jor-prox]', jor);
    /* a seção só prende quando cabe inteira na tela: mede o conteúdo em vez de
       fixar uma altura mínima, que ficava velha a cada mudança de texto */
    var secao = jor.closest('.jornada'), cabeca = $('.head-center', jor), grade = $('.jor-grade', jor);
    var modo = {matches:false};
    function avaliaModo(){
      var secY = parseFloat(getComputedStyle(document.body).getPropertyValue('--sec-y')) || 0;
      var precisa = grade.getBoundingClientRect().bottom - cabeca.getBoundingClientRect().top + secY + 24;
      var cabe = window.innerWidth >= 981 && precisa <= window.innerHeight;
      if (cabe !== modo.matches){ modo.matches = cabe; secao.classList.toggle('preso', cabe); }
    }
    var atual = -1, jaCresceu = false;

    function ativa(i){
      if (i === atual) return;
      atual = i;
      botoes.forEach(function(b, n){
        b.classList.toggle('ativo', n === i);
        b.classList.toggle('feito', n < i);
        b.setAttribute('aria-selected', n === i ? 'true' : 'false');
        b.tabIndex = n === i ? 0 : -1;
      });
      paineis.forEach(function(p, n){ p.classList.toggle('ativo', n === i); });
      contador.textContent = '0' + (i + 1) + ' / 06';
      bAnt.disabled = i === 0; bProx.disabled = i === paineis.length - 1;
      if (!modo.matches){
        linha.style.setProperty('--jp', i / 5);
        var b = botoes[i];
        linha.scrollTo({left:b.parentNode.offsetLeft - (linha.clientWidth - b.parentNode.offsetWidth) / 2, behavior: reduz ? 'auto' : 'smooth'});
      }
      if (i === 5 && !jaCresceu){ jaCresceu = true; tocaMeses(); }
    }

    function curso(){ return jor.offsetHeight - window.innerHeight; }
    function aoRolarJor(){
      if (!modo.matches) return;
      var p = limita(-jor.getBoundingClientRect().top / curso(), 0, 1);
      linha.style.setProperty('--jp', p);
      ativa(Math.min(5, Math.floor(p * 6)));
    }
    window.addEventListener('scroll', aoRolarJor, {passive:true});
    window.addEventListener('resize', function(){ avaliaModo(); aoRolarJor(); });

    function vai(i){
      i = limita(i, 0, paineis.length - 1);
      if (modo.matches){
        var topoJor = jor.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({top: topoJor + (i + .5) / 6 * curso(), behavior: reduz ? 'auto' : 'smooth'});
      } else ativa(i);
    }
    botoes.forEach(function(b, n){
      b.addEventListener('click', function(){ vai(n); });
      b.addEventListener('keydown', function(e){
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown'){ e.preventDefault(); vai(n + 1); botoes[Math.min(5, n + 1)].focus(); }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp'){ e.preventDefault(); vai(n - 1); botoes[Math.max(0, n - 1)].focus(); }
      });
    });
    bAnt.addEventListener('click', function(){ vai(atual - 1); });
    bProx.addEventListener('click', function(){ vai(atual + 1); });

    /* deslize lateral no painel troca a etapa (menos em cima da linha dos meses) */
    var x0 = null, y0 = null;
    var caixa = $('[data-paineis]', jor);
    caixa.addEventListener('touchstart', function(e){
      if (e.target.closest('.meses')){ x0 = null; return; }
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
    }, {passive:true});
    caixa.addEventListener('touchend', function(e){
      if (x0 === null || modo.matches) return;
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) vai(atual + (dx < 0 ? 1 : -1));
      x0 = null;
    });

    avaliaModo();
    ativa(0);
    aoRolarJor();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ avaliaModo(); aoRolarJor(); });
  }

  /* ---- faixas de depoimento: duplica o conteúdo para o loop sem emenda ---- */
  $$('[data-faixa] .faixa-trilho').forEach(function(t){
    $$(':scope > *', t).forEach(function(el){
      var c = el.cloneNode(true); c.setAttribute('aria-hidden', 'true'); t.appendChild(c);
    });
  });

  /* ---- abas do comparativo NoShave ---- */
  $$('[data-abas]').forEach(function(box){
    var abas = $$('[data-aba]', box), barraAbas = $('.ns-abas', box);
    abas.forEach(function(a){
      a.addEventListener('click', function(){
        var k = a.getAttribute('data-aba');
        barraAbas.setAttribute('data-lado', k);
        abas.forEach(function(o){ o.setAttribute('aria-selected', o === a ? 'true' : 'false'); });
        $$('[data-aba-conteudo]', box).forEach(function(c){ c.hidden = c.getAttribute('data-aba-conteudo') !== k; });
      });
    });
  });

  /* ---- formulário de qualificação: uma pergunta por tela ----
     P2 "Não", P3 "Ainda não tenho previsão" e P4 "não tenho condições"
     encerram na tela do Instagram. Quem passa por tudo chega ao botão do
     WhatsApp, com a mensagem pronta e as respostas logo abaixo. */
  var form = $('#form');
  if (form){
    var passos = $$('[data-passo]', form), TOTAL = passos.length;
    var barra = $('[data-barra]', form), voltar = $('[data-voltar]', form), erro = $('[data-erro]', form);
    var ENCERRA = {
      p2: 'Não, prefiro deixar para outro momento.',
      p3: 'Ainda não tenho previsão.',
      p4: 'No momento, não tenho condições financeiras para o procedimento.'
    };
    var historico = [1], trava = false;
    var passoAtual = function(){ return historico[historico.length - 1]; };

    /* no celular a tela nova pode começar acima da dobra: traz o cartão de volta */
    function enquadra(){
      var topo = form.getBoundingClientRect().top;
      if (topo < 70) window.scrollBy({top: topo - 80, behavior: reduz ? 'auto' : 'smooth'});
    }
    function mostra(n, foca){
      passos.forEach(function(ps){ ps.hidden = +ps.getAttribute('data-passo') !== n; });
      $$('[data-fim]', form).forEach(function(f){ f.hidden = true; });
      erro.hidden = true;
      voltar.hidden = historico.length < 2;
      barra.style.width = ((n - 1) / TOTAL * 100) + '%';
      if (foca){ $('legend', passos[n - 1]).focus({preventScroll:true}); enquadra(); }
    }
    function fim(qual){
      passos.forEach(function(ps){ ps.hidden = true; });
      voltar.hidden = false;
      erro.hidden = true;
      barra.style.width = '100%';
      var tela = $('[data-fim="' + qual + '"]', form);
      tela.hidden = false;
      $('h3', tela).focus({preventScroll:true});
      enquadra();
    }
    function avanca(){
      var n = passoAtual();
      historico.push(n + 1);
      mostra(n + 1, true);
    }

    passos.forEach(function(ps){
      $$('input[type=radio]', ps).forEach(function(r){
        /* click (e não change): quem volta e clica na mesma opção também avança */
        r.addEventListener('click', function(){
          if (trava) return;
          trava = true;
          setTimeout(function(){
            trava = false;
            if (ENCERRA[r.name] === r.value){ historico.push('ig'); fim('ig'); }
            else avanca();
          }, 220);
        });
      });
    });

    voltar.addEventListener('click', function(){
      if (historico.length < 2) return;
      historico.pop();
      mostra(passoAtual(), true);
    });

    var horario = form.elements.p8;
    $('[data-avancar]', form).addEventListener('click', function(){
      horario.classList.remove('invalido');
      if (!horario.value.trim()){
        horario.classList.add('invalido');
        erro.textContent = 'Informe o melhor horário para a equipe ligar.';
        erro.hidden = false; horario.focus(); return;
      }
      avanca();
    });
    horario.addEventListener('keydown', function(e){
      if (e.key === 'Enter'){ e.preventDefault(); $('[data-avancar]', form).click(); }
    });

    var tel = form.elements.whats;
    tel.addEventListener('input', function(){
      var d = tel.value.replace(/\D/g, '').slice(0, 11), s = d;
      if (d.length > 2) s = '(' + d.slice(0, 2) + ') ' + d.slice(2);
      if (d.length > 7) s = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(-4);
      tel.value = s;
    });

    form.addEventListener('submit', function(e){
      e.preventDefault();
      if (passoAtual() !== TOTAL) return;
      var f = form.elements, falta = [];
      [f.nome, f.whats, f.email, f.profissao].forEach(function(c){ c.classList.remove('invalido'); });
      if (f.nome.value.trim().length < 3) falta.push(f.nome);
      if (f.whats.value.replace(/\D/g, '').length < 10) falta.push(f.whats);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim())) falta.push(f.email);
      if (f.profissao.value.trim().length < 2) falta.push(f.profissao);
      if (falta.length){
        falta.forEach(function(c){ c.classList.add('invalido'); });
        erro.textContent = 'Confira os campos destacados para a equipe conseguir falar com você.';
        erro.hidden = false; falta[0].focus(); return;
      }
      var val = function(n){ var el = form.querySelector('input[name="' + n + '"]:checked'); return el ? el.value : ''; };
      var msg = 'Olá! Acabei de preencher o formulário e quero agendar minha consulta particular com a Dra. Rafaela Sandrin.\n\n' +
        'O que procuro: ' + val('p1') + '\n' +
        'Quando: ' + val('p3') + '\n' +
        'Situação: ' + val('p4') + '\n' +
        'Consulta ou tratamento anterior: ' + val('p5') + '\n' +
        'Principal queixa: ' + val('p6') + '\n' +
        'Contato: ' + val('p7') + '\n' +
        'Melhor horário para ligação: ' + f.p8.value.trim() + '\n\n' +
        'Nome: ' + f.nome.value.trim() + '\nTelefone: ' + f.whats.value + '\nE-mail: ' + f.email.value.trim() +
        '\nProfissão: ' + f.profissao.value.trim();
      $('[data-whats]', form).href = 'https://wa.me/' + WHATS + '?text=' + encodeURIComponent(msg);
      historico.push('ok');
      fim('ok');
    });
  }
})();

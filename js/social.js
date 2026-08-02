/* ============ /social · interações da página clara ============ */
(function () {
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // fundo do nav ao rolar
  var nav = document.getElementById('nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 20); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // menu mobile
  var burger = document.getElementById('burger');
  var mpanel = document.getElementById('mpanel');
  if (burger && mpanel) {
    burger.addEventListener('click', function () {
      var aberto = mpanel.classList.toggle('open');
      burger.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    });
    mpanel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mpanel.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // número fantasma dos cartões de problema (o CSS lê via attr)
  document.querySelectorAll('.pain-card').forEach(function (c) {
    var n = c.querySelector('.pnum');
    if (n) c.setAttribute('data-ghost', n.textContent.trim());
  });

  // escalonamento: cada item recebe seu índice dentro do próprio grupo,
  // então a entrada acontece em cascata e não tudo de uma vez
  document.querySelectorAll('.pain-grid, .dl-grid, .seg-grid, .steps, .faq-list').forEach(function (grupo) {
    var itens = grupo.children;
    for (var i = 0; i < itens.length; i++) {
      itens[i].style.setProperty('--i', i % 8);   // reinicia a cada 8 pra não atrasar demais
    }
  });

  // movimento reduzido: mostra tudo, sem vincular nada ao scroll
  if (reduz) {
    document.querySelectorAll('.rv').forEach(function (el) {
      el.style.opacity = 1; el.style.transform = 'none';
    });
    var st0 = document.querySelector('.steps'); if (st0) st0.classList.add('in-view');
    return;
  }

  {
    // ENTRADA VINCULADA AO SCROLL (ida e volta de verdade)
    // Antes era uma transição disparada: o elemento entrava sozinho em
    // .6s e a pessoa nem via. Agora a opacidade e o deslocamento saem da
    // POSIÇÃO do elemento na tela, calculados por frame — desce e a peça
    // nasce, sobe e ela desfaz, acompanhando o dedo/roda.
    var alvos = [].slice.call(document.querySelectorAll('.rv'));
    var rail = document.querySelector('.steps-rail');
    var dots = [].slice.call(document.querySelectorAll('.st-dot'));
    var steps = document.querySelector('.steps');
    var tick = false;

    function prog(r, vh, ini, fim) {
      // 1 quando o topo do elemento passa de `fim` da tela; 0 antes de `ini`
      return Math.max(0, Math.min(1, (vh * ini - r.top) / (vh * (ini - fim))));
    }

    function pintar() {
      tick = false;
      var vh = window.innerHeight;

      alvos.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -240 || r.top > vh + 240) return;   // fora de cena: não gasta frame
        var t = prog(r, vh, 0.94, 0.62);
        var e = t * t * (3 - 2 * t);                        // suaviza as pontas
        el.style.opacity = e;
        el.style.transform = 'translateY(' + (30 - 30 * e) + 'px)';
      });

      if (steps && rail) {
        var rs = steps.getBoundingClientRect();
        var ts = prog(rs, vh, 0.9, 0.45);
        rail.style.transform = 'scaleX(' + ts + ')';
        dots.forEach(function (d, i) {
          var atraso = i * 0.16;                            // cada bolinha entra um pouco depois
          var td = Math.max(0, Math.min(1, (ts - atraso) / (1 - atraso || 1)));
          var el = td * td * (3 - 2 * td);
          d.style.transform = 'scale(' + (0.2 + 0.8 * el) + ')';
        });
        steps.classList.toggle('in-view', ts > 0.02);        // liga o pulso do trilho
      }
    }

    function aoRolar() { if (!tick) { tick = true; requestAnimationFrame(pintar); } }
    window.addEventListener('scroll', aoRolar, { passive: true });
    window.addEventListener('resize', aoRolar, { passive: true });
    window.addEventListener('load', pintar);
    pintar();

  }



  // FAQ: abrir uma fecha a anterior (lista longa fica ilegível toda aberta)
  var qs = [].slice.call(document.querySelectorAll('.faq-list .q'));
  qs.forEach(function (q) {
    q.addEventListener('toggle', function () {
      if (!q.open) return;
      qs.forEach(function (o) { if (o !== q) o.open = false; });
    });
  });
})();

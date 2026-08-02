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
  document.querySelectorAll('.pain-grid, .dl-grid, .seg-grid, .logos-row, .steps, .faq-list').forEach(function (grupo) {
    var itens = grupo.children;
    for (var i = 0; i < itens.length; i++) {
      itens[i].style.setProperty('--i', i % 8);   // reinicia a cada 8 pra não atrasar demais
    }
  });

  if (reduz) {
    document.querySelectorAll('.rv').forEach(function (el) { el.classList.add('in'); });
    document.querySelectorAll('[data-count]').forEach(function (el) { el.textContent = el.dataset.count; });
    var st0 = document.querySelector('.steps'); if (st0) st0.classList.add('in-view');
    return;
  }

  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.rv').forEach(function (el) { el.classList.add('in'); });
    document.querySelectorAll('[data-count]').forEach(function (el) { el.textContent = el.dataset.count; });
    var st1 = document.querySelector('.steps'); if (st1) st1.classList.add('in-view');
  } else {
    // entradas: dispara com o elemento ainda subindo, não depois de parado
    var ioRv = new IntersectionObserver(function (ens) {
      ens.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); ioRv.unobserve(e.target); }
      });
    }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
    document.querySelectorAll('.rv').forEach(function (el) { ioRv.observe(el); });

    // linha do tempo: o trilho só se desenha quando a seção aparece
    var steps = document.querySelector('.steps');
    if (steps) {
      var ioSteps = new IntersectionObserver(function (ens) {
        ens.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in-view'); ioSteps.unobserve(e.target); }
        });
      }, { threshold: 0.25 });
      ioSteps.observe(steps);
    }

    // números do fechamento contam quando entram na tela
    var ioNum = new IntersectionObserver(function (ens) {
      ens.forEach(function (e) {
        if (!e.isIntersecting) return;
        ioNum.unobserve(e.target);
        contar(e.target);
      });
    }, { threshold: 0.6 });
    document.querySelectorAll('[data-count]').forEach(function (el) { ioNum.observe(el); });
  }

  function contar(el) {
    var alvo = parseInt(el.dataset.count, 10) || 0;
    if (alvo === 0) { el.textContent = '0'; return; }
    var dur = 1100, t0 = null;
    function passo(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      el.textContent = Math.round(alvo * (1 - Math.pow(1 - p, 3)));   // desacelera no fim
      if (p < 1) requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
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

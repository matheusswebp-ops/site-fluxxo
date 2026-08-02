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

  // entrada por scroll: dispara com o elemento ainda subindo, pra não
  // aparecer só depois de estar parado no meio da tela
  var rvs = [].slice.call(document.querySelectorAll('.rv'));
  if (rvs.length) {
    if (reduz || !('IntersectionObserver' in window)) {
      rvs.forEach(function (el) { el.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (ens) {
        ens.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
        });
      }, { threshold: 0, rootMargin: '0px 0px -12% 0px' });
      rvs.forEach(function (el) { io.observe(el); });
    }
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

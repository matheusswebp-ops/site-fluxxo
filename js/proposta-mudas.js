// ============ Página Proposta (E-commerce de Mudas): nav on scroll ============
(function () {
  'use strict';
  var nav = document.getElementById('nav');
  if (!nav) return;
  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 20); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

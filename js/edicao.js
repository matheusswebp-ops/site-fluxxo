// ============ Página Edição: nav on scroll + menu mobile ============
(function () {
  'use strict';
  var nav = document.getElementById('nav');
  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 20); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var burger = document.getElementById('burger');
  var mpanel = document.getElementById('mpanel');
  burger.addEventListener('click', function () {
    var open = mpanel.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  mpanel.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { mpanel.classList.remove('open'); });
  });

  document.querySelectorAll('.ed-card').forEach(function (card) {
    var video = card.querySelector('video');
    var play = card.querySelector('.ed-play');
    play.addEventListener('click', function () { video.play(); });
    video.addEventListener('play', function () { card.classList.add('playing'); });
    video.addEventListener('pause', function () { card.classList.remove('playing'); });
    video.addEventListener('ended', function () { card.classList.remove('playing'); });
  });
})();

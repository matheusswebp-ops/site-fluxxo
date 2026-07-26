// ============ Página Nutricionista: carrosséis, filtros, reveal e nav ============
// Tudo em IIFE pra não vazar globals (não colide com main.js de outras páginas).
(function () {
  'use strict';
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Carrosséis independentes ----------
  document.querySelectorAll('.carousel').forEach(function (car) {
    var slidesEl = car.querySelector('.slides');
    var slides = [].slice.call(car.querySelectorAll('.slide'));
    var dotsWrap = car.querySelector('.dots');
    var i = 0;

    slides.forEach(function (_, idx) {
      var b = document.createElement('button');
      b.setAttribute('aria-label', 'Slide ' + (idx + 1));
      b.addEventListener('click', function () { go(idx); });
      dotsWrap.appendChild(b);
    });
    var dots = [].slice.call(dotsWrap.children);

    function go(n) {
      i = (n + slides.length) % slides.length;
      slidesEl.style.transform = 'translateX(-' + (i * 100) + '%)';
      dots.forEach(function (d, k) { d.classList.toggle('on', k === i); });
    }
    function next() { go(i + 1); }
    function prev() { go(i - 1); }

    car.querySelector('.cnav.next').addEventListener('click', next);
    car.querySelector('.cnav.prev').addEventListener('click', prev);

    // swipe (touch)
    var x0 = null;
    car.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    car.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) { if (dx < 0) { next(); } else { prev(); } }
      x0 = null;
    });
    // teclado
    car.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    });

    go(0);
  });

  // ---------- Reveal on scroll (stagger) ----------
  var tiles = [].slice.call(document.querySelectorAll('.bento .tile'));
  if ('IntersectionObserver' in window && !reduz) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var el = e.target;
          setTimeout(function () { el.classList.add('in'); }, (el.dataset.delay || 0));
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12 });
    tiles.forEach(function (t, k) { t.dataset.delay = (k % 4) * 70; io.observe(t); });
  } else {
    tiles.forEach(function (t) { t.classList.add('in'); });
  }

  // ---------- Nav: scrolled + menu mobile ----------
  (function () {
    var nav = document.getElementById('nav');
    if (!nav) return;
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
    var burger = document.getElementById('burger'), mpanel = document.getElementById('mpanel');
    if (burger && mpanel) {
      burger.addEventListener('click', function () {
        burger.setAttribute('aria-expanded', mpanel.classList.toggle('open') ? 'true' : 'false');
      });
      mpanel.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          mpanel.classList.remove('open');
          burger.setAttribute('aria-expanded', 'false');
        });
      });
    }
  })();
})();

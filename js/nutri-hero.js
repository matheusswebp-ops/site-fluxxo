// ============ Página Nutricionista: hero claro (partículas suaves + parede + contadores) ============
// Tudo em IIFE pra não vazar globals.
(function () {
  'use strict';
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ============ Partículas discretas no hero claro ============
  // Pontos suaves em verde e pêssego flutuando devagar, como poeira de luz.
  (function () {
    var cv = document.getElementById('cine');
    if (!cv) return;
    var ctx = cv.getContext('2d');
    var hero = document.querySelector('.nhero');
    if (!hero) return;
    var W = 0, H = 0, DPR = 1;
    var CORES = ['#4e8a5a', '#7fae87', '#c98d5f', '#a3c2a8'];
    var mobile = window.matchMedia('(max-width:900px)').matches;

    function resize() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = hero.clientWidth; H = hero.clientHeight;
      cv.width = W * DPR; cv.height = H * DPR;
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    var N = mobile ? 36 : Math.min(90, Math.round((window.innerWidth * window.innerHeight) / 18000));
    var parts = [];
    function spawn() {
      parts = [];
      for (var i = 0; i < N; i++) {
        var z = .35 + Math.random() * .65;
        parts.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: 0, vy: 0, z: z,
          r: (.6 + Math.random() * 1.6) * z,
          c: CORES[i % CORES.length],
          seed: Math.random() * 1000
        });
      }
    }

    // ponteiro (repulsão sutil)
    var px = -9999, py = -9999;
    if (!mobile) {
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        px = e.clientX - r.left; py = e.clientY - r.top;
      }, { passive: true });
      hero.addEventListener('mouseleave', function () { px = -9999; py = -9999; });
    }

    var t0 = null, running = false, rafId = null;
    function frame(ts) {
      if (!t0) t0 = ts;
      var t = (ts - t0) / 1000;
      ctx.clearRect(0, 0, W, H);

      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        // deriva orgânica, levemente ascendente (leveza)
        var flow = Math.sin(p.y * .005 + t * .4 + p.seed) + Math.cos(p.x * .004 - t * .3 + p.seed);
        var ax = Math.cos(flow) * (.035 * p.z);
        var ay = Math.sin(flow) * (.035 * p.z) - .006 * p.z;

        // repulsão do mouse
        var dx = p.x - px, dy = p.y - py, d2 = dx * dx + dy * dy;
        if (d2 < 14400) {
          var d = Math.sqrt(d2) || 1, f = (120 - d) / 120 * .7;
          ax += dx / d * f; ay += dy / d * f;
        }

        p.vx = (p.vx + ax) * .92; p.vy = (p.vy + ay) * .92;
        p.x += p.vx; p.y += p.vy;

        if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20; if (p.y > H + 20) p.y = -20;

        var tw = .16 + .1 * Math.sin(t * 1.2 + p.seed * 7);
        ctx.globalAlpha = Math.min(.32, tw * p.z + .06);
        ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(frame);
    }

    function staticFrame() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        ctx.globalAlpha = .18 * p.z;
        ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function start() { if (running || reduz) return; running = true; t0 = null; rafId = requestAnimationFrame(frame); }
    function stop() { running = false; if (rafId) cancelAnimationFrame(rafId); }

    resize(); spawn();
    cv.classList.add('on');
    window.addEventListener('resize', function () { resize(); spawn(); if (reduz) staticFrame(); }, { passive: true });

    if (reduz) { staticFrame(); return; }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        en.forEach(function (e) { if (e.isIntersecting) { start(); } else { stop(); } });
      }, { threshold: .05 }).observe(hero);
    } else { start(); }
  })();

  // ============ Parede de placeholders inclina com o mouse e afunda no scroll ============
  (function () {
    var plane = document.getElementById('wallPlane');
    var hero = document.querySelector('.nhero');
    if (!plane || !hero || reduz) return;

    var mx = 0, my = 0, cx = 0, cy = 0;
    var fino = window.matchMedia('(pointer: fine)').matches;
    if (fino) {
      hero.addEventListener('mousemove', function (e) {
        mx = e.clientX / innerWidth - 0.5;
        my = e.clientY / innerHeight - 0.5;
      }, { passive: true });
      hero.addEventListener('mouseleave', function () { mx = 0; my = 0; }, { passive: true });
    }
    (function loop() {
      cx += (mx - cx) * 0.045; cy += (my - cy) * 0.045;
      var mergulho = Math.min(1, window.scrollY / innerHeight);
      plane.style.transform = 'translate(-50%,-50%)'
        + ' translateY(' + (mergulho * 90) + 'px)'
        + ' rotateX(' + (16 - cy * 7) + 'deg)'
        + ' rotateY(' + (-9 + cx * 9) + 'deg)'
        + ' rotateZ(4deg) scale(' + (1.08 + mergulho * 0.06) + ')';
      requestAnimationFrame(loop);
    })();
  })();


  // ============ Título do portfólio: revela palavra a palavra no scroll ============
  (function () {
    var h2 = document.querySelector('.port-head h2');
    if (!h2) return;

    function reparte(el) {
      if (!el || el.dataset.kin) return; el.dataset.kin = '1';
      (function anda(node) {
        [].slice.call(node.childNodes).forEach(function (ch) {
          if (ch.nodeType === 3) {
            var frag = document.createDocumentFragment();
            ch.textContent.split(/(\s+)/).forEach(function (tok) {
              if (!tok) return;
              if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
              var s = document.createElement('span'); s.className = 'kw'; s.textContent = tok;
              frag.appendChild(s);
            });
            node.replaceChild(frag, ch);
          } else if (ch.nodeType === 1 && ch.tagName !== 'BR' && ch.tagName !== 'SVG') { anda(ch); }
        });
      })(el);
      [].slice.call(el.querySelectorAll('.kw')).forEach(function (w, i) {
        w.style.transitionDelay = (i * 0.07) + 's';
      });
    }

    h2.classList.add('kin');
    reparte(h2);
    if (reduz || !('IntersectionObserver' in window)) { h2.classList.add('kin-in'); return; }
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('kin-in', e.isIntersecting); });
    }, { threshold: .4 }).observe(h2);
  })();

  // ============ Fundo da página muda de tom por seção (bem sutil, tons claros) ============
  (function () {
    if (reduz) return;
    var mapa = [
      ['.nhero', [250, 248, 243]],
      ['#trabalhos', [250, 248, 243]],
      ['.foot', [247, 242, 233]]
    ].map(function (par) {
      var el = document.querySelector(par[0]);
      return el ? { el: el, c: par[1] } : null;
    }).filter(Boolean);
    if (!mapa.length) return;

    var cur = [250, 248, 243];
    (function corLoop() {
      var meio = innerHeight / 2, melhor = null, menor = Infinity;
      mapa.forEach(function (m) {
        var r = m.el.getBoundingClientRect();
        var d = Math.abs((r.top + r.height / 2) - meio);
        if (d < menor) { menor = d; melhor = m; }
      });
      if (melhor) {
        for (var k = 0; k < 3; k++) cur[k] += (melhor.c[k] - cur[k]) * 0.04;
        document.body.style.backgroundColor = 'rgb(' + cur.map(Math.round).join(',') + ')';
      }
      requestAnimationFrame(corLoop);
    })();
  })();
})();

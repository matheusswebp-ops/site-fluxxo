// ============ Página Design: palco do hero (padrão da home) + página viva ============
(function () {
  'use strict';
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ============ HERO CINE · motor de partículas (importado da home) ============
  (function () {
    var cv = document.getElementById('cine');
    if (!cv) return;
    var ctx = cv.getContext('2d');
    var hero = document.querySelector('.dhero');
    if (!hero) return;
    var W = 0, H = 0, DPR = 1;
    var PURPLES = ['#7c4dff', '#a99cff', '#8a5cc4', '#6c4596'];
    var mobile = window.matchMedia('(max-width:900px)').matches;

    function resize() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = hero.clientWidth; H = hero.clientHeight;
      cv.width = W * DPR; cv.height = H * DPR;
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      buildCurves();
    }

    // ---------- partículas ----------
    var N = mobile ? 80 : Math.min(190, Math.round((window.innerWidth * window.innerHeight) / 9500));
    var parts = [];
    function spawn() {
      parts = [];
      for (var i = 0; i < N; i++) {
        var z = .35 + Math.random() * .65; // profundidade
        parts.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: 0, vy: 0, z: z,
          r: (.5 + Math.random() * 1.5) * z,
          c: PURPLES[i % PURPLES.length],
          seed: Math.random() * 1000,
          bright: Math.random() < .12
        });
      }
    }

    // ---------- linhas de fluxo (guias invisíveis do movimento) ----------
    var curves = [];
    function buildCurves() {
      curves = [];
      for (var k = 0; k < 3; k++) {
        var yBase = H * (.3 + k * .2) + (Math.random() * 40 - 20);
        curves.push({
          p0: { x: -W * .08, y: yBase + (Math.random() * 60 - 30) },
          p1: { x: W * .32, y: yBase + (Math.random() * 160 - 80) },
          p2: { x: W * .68, y: yBase + (Math.random() * 160 - 80) },
          p3: { x: W * 1.08, y: yBase + (Math.random() * 60 - 30) }
        });
      }
    }
    function bez(c, t) {
      var u = 1 - t;
      return {
        x: u * u * u * c.p0.x + 3 * u * u * t * c.p1.x + 3 * u * t * t * c.p2.x + t * t * t * c.p3.x,
        y: u * u * u * c.p0.y + 3 * u * u * t * c.p1.y + 3 * u * t * t * c.p2.y + t * t * t * c.p3.y
      };
    }

    // ---------- ciclo narrativo: caos -> reunir -> pulso -> soltar ----------
    var DUR = [3.6, 2.2, 2.2, 1.4], CYCLE = DUR[0] + DUR[1] + DUR[2] + DUR[3];
    function phaseAt(t) {
      var m = t % CYCLE, acc = 0;
      for (var i = 0; i < 4; i++) { if (m < acc + DUR[i]) return { i: i, p: (m - acc) / DUR[i] }; acc += DUR[i]; }
      return { i: 0, p: 0 };
    }

    // ---------- ponteiro (repulsão) / tilt no mobile ----------
    var px = -9999, py = -9999, tiltX = 0, tiltY = 0;
    if (!mobile) {
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        px = e.clientX - r.left; py = e.clientY - r.top;
      }, { passive: true });
      hero.addEventListener('mouseleave', function () { px = -9999; py = -9999; });
    } else if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', function (e) {
        if (e.gamma == null) return;
        tiltX = Math.max(-1, Math.min(1, (e.gamma || 0) / 30));
        tiltY = Math.max(-1, Math.min(1, ((e.beta || 0) - 45) / 30));
      }, { passive: true });
    }

    // ---------- render ----------
    var t0 = null, running = false, rafId = null;
    function frame(ts) {
      if (!t0) t0 = ts;
      var t = (ts - t0) / 1000;
      var ph = phaseAt(t);
      ctx.clearRect(0, 0, W, H);

      var cxo = tiltX * 30, cyo = tiltY * 30;
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        var flow = Math.sin(p.y * .006 + t * .5 + p.seed) + Math.cos(p.x * .005 - t * .35 + p.seed);
        var ax = Math.cos(flow) * (.05 * p.z), ay = Math.sin(flow) * (.05 * p.z);

        // fase reunir: atrai pro ponto da curva mais próxima
        if (ph.i === 1 || ph.i === 2) {
          var c3 = curves[i % curves.length];
          var tgt = bez(c3, (i / parts.length + p.seed % 1) % 1);
          var k3 = ph.i === 1 ? ph.p * .045 : .045;
          ax += (tgt.x - p.x) * k3 * .06; ay += (tgt.y - p.y) * k3 * .06;
        }
        // fase soltar: empurra pra fora
        if (ph.i === 3 && ph.p < .35) {
          ax += (p.x - W / 2) * .0009; ay += (p.y - H / 2) * .0009;
        }

        // repulsão do mouse
        var dx = p.x - px, dy = p.y - py, d2 = dx * dx + dy * dy;
        if (d2 < 16900) {
          var d = Math.sqrt(d2) || 1, f = (130 - d) / 130 * .9;
          ax += dx / d * f; ay += dy / d * f;
        }

        p.vx = (p.vx + ax) * .92; p.vy = (p.vy + ay) * .92;
        p.x += p.vx + cxo * .002 * p.z; p.y += p.vy + cyo * .002 * p.z;

        // wrap
        if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20; if (p.y > H + 20) p.y = -20;

        // brilho pulsa no compasso do ciclo
        var tw = .45 + .3 * Math.sin(t * 1.4 + p.seed * 7);
        var glow = ph.i === 2 ? .25 : 0;
        ctx.globalAlpha = Math.min(1, (tw + glow) * p.z);
        ctx.fillStyle = p.bright ? '#efe2ff' : p.c;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;

      rafId = requestAnimationFrame(frame);
    }

    // ---------- estático elegante p/ reduced-motion ----------
    function staticFrame() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        ctx.globalAlpha = .5 * p.z;
        ctx.fillStyle = p.bright ? '#efe2ff' : p.c;
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

    // pausa quando o hero sai da tela (bateria!)
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        en.forEach(function (e) { e.isIntersecting ? start() : stop(); });
      }, { threshold: .05 }).observe(hero);
    } else { start(); }
  })();

  // ============ A parede de artes inclina com o mouse e afunda no scroll ============
  (function () {
    var plane = document.getElementById('wallPlane');
    var hero = document.querySelector('.dhero');
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

  // ============ Contadores da faixa de números ============
  (function () {
    var stats = [].slice.call(document.querySelectorAll('.dh-stat'));
    if (!stats.length) return;

    // revela os cards com stagger
    if ('IntersectionObserver' in window && !reduz) {
      var ioR = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target;
          setTimeout(function () { el.classList.add('in'); }, (stats.indexOf(el) % 3) * 110);
          ioR.unobserve(el);
        });
      }, { threshold: .3 });
      stats.forEach(function (s) { ioR.observe(s); });
    } else {
      stats.forEach(function (s) { s.classList.add('in'); });
    }

    // números que contam
    if (reduz) return;
    var nums = [].slice.call(document.querySelectorAll('.dh-stat b'));
    nums.forEach(function (b) {
      var m = b.textContent.match(/\d+/);
      if (!m) return;
      b.dataset.alvo = m[0];
      b.dataset.tpl = b.textContent;
    });
    if (!('IntersectionObserver' in window)) return;
    var ioN = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var b = e.target, alvo = parseInt(b.dataset.alvo, 10), tpl = b.dataset.tpl;
        var ini = null;
        function passo(ts) {
          if (!ini) ini = ts;
          var t = Math.min(1, (ts - ini) / 1100);
          var v = Math.round(alvo * (t * t * (3 - 2 * t)));
          b.textContent = tpl.replace(/\d+/, v);
          if (t < 1) requestAnimationFrame(passo);
        }
        requestAnimationFrame(passo);
        ioN.unobserve(b);
      });
    }, { threshold: .6 });
    nums.forEach(function (b) { if (b.dataset.alvo) ioN.observe(b); });
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

  // ============ Fundo da página muda de cor por seção (sutil) ============
  (function () {
    if (reduz) return;
    var ident = document.getElementById('identidade');
    var mapa = [
      ['.dhero', [14, 8, 21]],
      ['.dh-stats', [23, 12, 35]],
      ['#trabalhos', [14, 8, 21]],
      ['.foot', [19, 9, 29]]
    ].map(function (par) {
      var el = document.querySelector(par[0]);
      return el ? { el: el, c: par[1] } : null;
    }).filter(Boolean);
    if (!mapa.length) return;

    var cur = [14, 8, 21];
    (function corLoop() {
      // modo identidade visual: a marca manda nas cores, o loop se cala
      if (ident && !ident.hidden) {
        if (document.body.style.backgroundColor) document.body.style.backgroundColor = '';
        requestAnimationFrame(corLoop);
        return;
      }
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

  // ============ Filtros: modo identidade acompanha os dois tons ============
  (function () {
    var botoes = document.querySelectorAll('.filters button');
    botoes.forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.body.classList.toggle('brand-mode', btn.dataset.filter === 'identidade');
      });
    });
  })();

  // ============ Filtros: re-stagger dos tiles ao trocar de categoria ============
  (function () {
    if (reduz) return;
    var botoes = document.querySelectorAll('.filters button');
    botoes.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.dataset.filter === 'identidade') return;
        requestAnimationFrame(function () {
          var vis = [].filter.call(document.querySelectorAll('.bento .tile'), function (t) {
            return t.style.display !== 'none';
          });
          vis.forEach(function (t, k) {
            t.classList.remove('in');
            setTimeout(function () { t.classList.add('in'); }, 50 + (k % 8) * 55);
          });
        });
      });
    });
  })();
})();

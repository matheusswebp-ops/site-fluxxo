// ============ Página Nutricionista: seções novas (demo, incluso, funciona, FAQ) ============
(function () {
  'use strict';
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  // ---------- Reveal genérico ao entrar na viewport ----------
  var reveals = [].slice.call(document.querySelectorAll('.reveal'));
  if (hasIO && !reduz) {
    var ioR = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        ioR.unobserve(e.target);
      });
    }, { threshold: .18 });
    reveals.forEach(function (el) { ioR.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  // ---------- Números que contam (cards "o que está incluso") ----------
  var counters = [].slice.call(document.querySelectorAll('[data-count]'));
  if (counters.length) {
    if (reduz || !hasIO) {
      counters.forEach(function (el) { el.textContent = el.dataset.count; });
    } else {
      var ioN = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target, alvo = parseInt(el.dataset.count, 10), ini = null;
          function passo(ts) {
            if (!ini) ini = ts;
            var t = Math.min(1, (ts - ini) / 900);
            var eased = 1 - Math.pow(1 - t, 3);
            el.textContent = Math.round(alvo * eased);
            if (t < 1) requestAnimationFrame(passo);
          }
          requestAnimationFrame(passo);
          ioN.unobserve(el);
        });
      }, { threshold: .6 });
      counters.forEach(function (el) { ioN.observe(el); });
    }
  }

  // ---------- Método Fluxxo · "O Fio" (mesma mecânica do js/site.js da home) ----------
  (function () {
    var palco = document.querySelector('.fio-stage');
    if (!palco || reduz) return;

    var trilho = document.getElementById('fioTrack');
    var caminho = document.getElementById('fioPath');
    var ponta = document.getElementById('fioTip');
    var ghost = document.getElementById('fioGhost');
    var num = document.getElementById('fioNum');
    var cards = [].slice.call(palco.querySelectorAll('.fio-card'));
    if (!trilho || !caminho || !cards.length) return;

    var limita = function (v, a, z) { return Math.max(a, Math.min(z, v)); };
    var fase = function (p, a, z) { return limita((p - a) / (z - a), 0, 1); };
    var suave = function (t) { return t * t * (3 - 2 * t); };

    var L = caminho.getTotalLength();
    caminho.style.strokeDasharray = L;
    caminho.style.strokeDashoffset = L;

    var atual = -1, pend = false;
    function desenha() {
      pend = false;
      var r = palco.getBoundingClientRect();
      var alcance = r.height - window.innerHeight;
      var p = alcance > 0 ? limita(-r.top / alcance, 0, 1) : 0;

      // o trilho anda na horizontal
      var desloc = Math.max(0, trilho.scrollWidth - window.innerWidth);
      trilho.style.transform = 'translateX(' + (-desloc * suave(fase(p, 0.06, 0.96))) + 'px)';

      // o fio se desenha com a faísca na ponta
      var d = fase(p, 0.04, 0.97);
      caminho.style.strokeDashoffset = L * (1 - d);
      if (ponta && caminho.getPointAtLength) {
        var pt = caminho.getPointAtLength(L * d);
        ponta.setAttribute('cx', pt.x);
        ponta.setAttribute('cy', pt.y);
      }

      // etapa ativa: o card mais perto do centro da tela
      var meio = window.innerWidth / 2, melhor = 0, menor = Infinity;
      cards.forEach(function (c, i) {
        var cr = c.getBoundingClientRect();
        var dist = Math.abs(cr.left + cr.width / 2 - meio);
        if (dist < menor) { menor = dist; melhor = i; }
      });
      cards.forEach(function (c, i) { c.classList.toggle('on', i === melhor); });

      if (melhor !== atual) {
        atual = melhor;
        var rotulo = '0' + (melhor + 1);
        if (ghost) {
          ghost.textContent = rotulo;
          if (ghost.animate) ghost.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 450, easing: 'ease-out' });
        }
        if (num) num.textContent = rotulo;
      }
    }
    function aoRolar() { if (!pend) { pend = true; requestAnimationFrame(desenha); } }
    window.addEventListener('scroll', aoRolar, { passive: true });
    window.addEventListener('resize', aoRolar, { passive: true });
    window.addEventListener('load', aoRolar);
    desenha();
  })();

  // ---------- A entrega do mês em conversa: digita, envia e recomeça ----------
  (function () {
    var chat = document.getElementById('prChat');
    if (!chat) return;
    var corpo = document.getElementById('chatBody');
    var digitando = document.getElementById('chatTyping');
    var status = document.getElementById('chatStatus');
    var replay = document.getElementById('chatReplay');
    var msgs = [].slice.call(corpo.querySelectorAll('.msg'));
    if (!msgs.length) return;

    // monta o calendário do mês dentro da conversa
    (function () {
      var grid = document.getElementById('calGrid');
      if (!grid) return;
      var VAZIOS = 2, DIAS = 31;
      var POSTS = [2, 7, 9, 14, 16, 21, 23, 28];   // carrossel / estático
      var REELS = [4, 11, 18, 25];                 // roteiro pra ela gravar
      for (var v = 0; v < VAZIOS; v++) {
        var oco = document.createElement('span');
        oco.className = 'cal-day';
        oco.style.visibility = 'hidden';
        grid.appendChild(oco);
      }
      for (var d = 1; d <= DIAS; d++) {
        var cel = document.createElement('span');
        cel.className = 'cal-day' +
          (POSTS.indexOf(d) > -1 ? ' has-post' : '') +
          (REELS.indexOf(d) > -1 ? ' has-reel' : '') +
          (d <= 30 ? ' has-story' : '');
        cel.style.setProperty('--d', VAZIOS + d);
        cel.textContent = d;
        grid.appendChild(cel);
      }
    })();

    var relogios = [], tocando = false;
    function parar() { relogios.forEach(clearTimeout); relogios = []; }
    function zerar() {
      msgs.forEach(function (m) { m.classList.remove('mount', 'show'); });
      digitando.classList.remove('show');
      replay.classList.remove('show');
      status.textContent = 'online';
      corpo.scrollTop = 0;
    }
    function fundo() { corpo.scrollTop = corpo.scrollHeight; }

    function tocar() {
      parar(); zerar();
      tocando = true;
      var t = 600;
      msgs.forEach(function (m, i) {
        var daFluxxo = m.classList.contains('in');
        if (daFluxxo) {
          relogios.push(setTimeout(function () {
            // o "digitando" fica no fim da fila, logo abaixo da última mensagem
            corpo.appendChild(digitando);
            digitando.classList.add('show');
            status.textContent = 'digitando...';
            fundo();
          }, t));
          t += 900;
        } else {
          t += 750;
        }
        relogios.push(setTimeout(function () {
          digitando.classList.remove('show');
          status.textContent = 'online';
          m.classList.add('mount');
          // entra no layout num quadro, anima no seguinte
          requestAnimationFrame(function () {
            requestAnimationFrame(function () { m.classList.add('show'); fundo(); });
          });
          fundo();
        }, t));
        t += (i === 1 ? 2200 : 1200);   // o calendário fica mais tempo na tela
      });
      relogios.push(setTimeout(function () { replay.classList.add('show'); }, t));
      relogios.push(setTimeout(function () { tocar(); }, t + 4500));   // recomeça
    }

    function tudoDeUmaVez() {
      parar(); tocando = false;
      msgs.forEach(function (m) { m.classList.add('mount', 'show'); });
      digitando.classList.remove('show');
      replay.classList.add('show');
    }

    replay.addEventListener('click', function () { tocar(); });

    if (reduz || !hasIO) { tudoDeUmaVez(); return; }

    // só roda enquanto está na tela
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { if (!tocando) tocar(); }
        else { parar(); tocando = false; }
      });
    }, { threshold: .25 }).observe(chat);
  })();

  // ---------- Demo: grade do Instagram antes/depois (lado a lado no desktop, clicável no mobile) ----------
  (function () {
    var demo = document.getElementById('igDemo');
    if (!demo) return;
    var btns = [].slice.call(demo.querySelectorAll('.ig-btn'));
    var cols = [].slice.call(demo.querySelectorAll('.ig-col'));
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var depois = b.dataset.state === 'depois';
        demo.classList.toggle('is-depois', depois);
        cols.forEach(function (c) {
          c.classList.toggle('on', c.classList.contains('ig-col-depois') === depois);
        });
        btns.forEach(function (x) {
          var on = x === b;
          x.classList.toggle('on', on);
          x.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
      });
    });
  })();

  // ---------- FAQ: accordion, um aberto por vez ----------
  (function () {
    var items = [].slice.call(document.querySelectorAll('.nfaq-item'));
    if (!items.length) return;
    items.forEach(function (item) {
      var q = item.querySelector('.nfaq-q');
      q.addEventListener('click', function () {
        var abrindo = !item.classList.contains('open');
        items.forEach(function (o) {
          o.classList.remove('open');
          o.querySelector('.nfaq-q').setAttribute('aria-expanded', 'false');
        });
        if (abrindo) {
          item.classList.add('open');
          q.setAttribute('aria-expanded', 'true');
        }
      });
    });
  })();
})();

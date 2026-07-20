// Editor de código digitando sozinho, em loop
  (function () {
    const body = document.getElementById('codeBody');
    if (!body) return;

    const lines = [
      [{ t: '// site otimizado para conversão', c: 'tk-com' }],
      [{ t: 'const ', c: 'tk-kw' }, { t: 'pagina', c: 'tk-var' }, { t: ' = ', c: 'tk-op' }, { t: "'landing-page'", c: 'tk-str' }, { t: ';', c: 'tk-op' }],
      [{ t: 'const ', c: 'tk-kw' }, { t: 'performance', c: 'tk-var' }, { t: ' = ', c: 'tk-op' }, { t: '99', c: 'tk-str' }, { t: ';', c: 'tk-op' }],
      [{ t: 'function ', c: 'tk-kw' }, { t: 'publicar', c: 'tk-var' }, { t: '(', c: 'tk-op' }, { t: 'pagina', c: 'tk-var' }, { t: ') {', c: 'tk-op' }],
      [{ t: '  return ', c: 'tk-kw' }, { t: 'testar', c: 'tk-var' }, { t: '(', c: 'tk-op' }, { t: 'pagina', c: 'tk-var' }, { t: ');', c: 'tk-op' }],
      [{ t: '}', c: 'tk-op' }]
    ];

    let lineIdx = 0, tokenIdx = 0, charIdx = 0;
    let currentLineEl = null;

    function typeStep() {
      if (lineIdx >= lines.length) {
        setTimeout(() => {
          body.innerHTML = '';
          lineIdx = 0; tokenIdx = 0; charIdx = 0;
          typeStep();
        }, 2200);
        return;
      }

      if (!currentLineEl) {
        currentLineEl = document.createElement('div');
        currentLineEl.className = 'code-line';
        body.appendChild(currentLineEl);
      }

      const line = lines[lineIdx];
      if (tokenIdx >= line.length) {
        currentLineEl = null;
        lineIdx++; tokenIdx = 0; charIdx = 0;
        setTimeout(typeStep, 220);
        return;
      }

      const token = line[tokenIdx];
      let span = currentLineEl.querySelector('span.typing-current');
      if (!span) {
        span = document.createElement('span');
        span.className = token.c + ' typing-current';
        currentLineEl.appendChild(span);
      }

      charIdx++;
      span.textContent = token.t.slice(0, charIdx);

      if (charIdx >= token.t.length) {
        span.classList.remove('typing-current');
        tokenIdx++; charIdx = 0;
      }

      setTimeout(typeStep, 26);
    }

    typeStep();
  })();

  // Nav (padrão da home): estado scrolled + menu mobile
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 10), { passive: true });

  const burger = document.getElementById('burger');
  const mpanel = document.getElementById('mpanel');
  if (burger && mpanel) {
    burger.addEventListener('click', () => burger.setAttribute('aria-expanded', mpanel.classList.toggle('open')));
    mpanel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      mpanel.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }));
  }

  // Clientes atendidos — marquee com logos reais
  const clients = [
    ['Flynow', 'img/logos/flynow.png', 'escuro'],   // logo branco: chip escuro
    ['Fader', 'img/logos/fader.png'],
    ['Iducali', 'img/logos/iducali.png'],
    ['IMEDF', 'img/logos/imedf.png'],
    ['Mentes Imob', 'img/logos/mentesimob.png'],
    ['PuraVive', 'img/logos/puravive.png'],
    ['Seller Pro', 'img/logos/sellerpro.png'],
    ['VD Marketing', 'img/logos/vd-marketing.png']
  ];

  function clientChip([name, logo, mod]) {
    return `<div class="client-chip${mod ? ' ' + mod : ''}"><img src="${logo}" alt="${name}" loading="lazy"></div>`;
  }

  function fillClients(el, list) { el.innerHTML = [...list, ...list].map(clientChip).join(''); }
  fillClients(document.getElementById('ctrack1'), clients);
  fillClients(document.getElementById('ctrack2'), [...clients].reverse());

  // Reveal bidirecional: anima ao entrar E ao sair (não usa unobserve)
  const ioTwoWay = new IntersectionObserver(entries => {
    entries.forEach(e => e.target.classList.toggle('in', e.isIntersecting));
  }, { threshold: 0.12, rootMargin: '-40px 0px -40px 0px' });
  document.querySelectorAll('.reveal-io, .tilt-in').forEach(el => ioTwoWay.observe(el));

  // Deslocamento no eixo X, sincronizado nos 3 cards, ativado depois que a seção passa da metade da tela
  const tiltEls = document.querySelectorAll('.tilt-in');
  const tiltContainer = document.querySelector('.trust-duo');
  let tiltTicking = false;

  function updateTiltX() {
    if (tiltContainer) {
      const vh = window.innerHeight;
      const rect = tiltContainer.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      // progresso 0 quando o centro da seção está na metade da tela, 1 quando já passou pro topo
      let progress = (vh / 2 - mid) / (vh / 2);
      progress = Math.min(Math.max(progress, 0), 1);
      const tx = progress * 46; // desloca até 46px no eixo X, igual e ao mesmo tempo nos 3

      tiltEls.forEach(el => el.style.setProperty('--tx', tx + 'px'));
    }
    tiltTicking = false;
  }

  function onScrollTiltX() {
    if (!tiltTicking) {
      requestAnimationFrame(updateTiltX);
      tiltTicking = true;
    }
  }

  if (tiltEls.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('scroll', onScrollTiltX, { passive: true });
    window.addEventListener('resize', onScrollTiltX);
    updateTiltX();
  }

  const items = document.querySelectorAll('.side-item');
  const panels = document.querySelectorAll('.stage-panel');
  function activate(target) {
    items.forEach(i => i.classList.toggle('active', i.dataset.target === target));
    panels.forEach(p => p.classList.toggle('active', p.dataset.panel === target));
  }
  items.forEach(item => item.addEventListener('click', () => activate(item.dataset.target)));

  if (window.matchMedia('(max-width: 1020px)').matches) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => e.target.classList.toggle('in-view', e.isIntersecting));
    }, { threshold: 0.5 });
    document.querySelectorAll('.browser').forEach(b => io.observe(b));
  }
// vídeos dos frames: tocam quando entram na tela, pausam quando saem
(function () {
  var vids = document.querySelectorAll('.frame-video');
  if (!vids.length) return;
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) { e.target.play().catch(function () {}); }
      else { e.target.pause(); }
    });
  }, { threshold: 0.25 });
  vids.forEach(function (v) { io.observe(v); });
})();

// ============ Página viva: títulos cinéticos, contadores, fundo que muda de cor ============
(function () {
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- títulos cinéticos ----
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
      w.style.transitionDelay = (i * 0.055) + 's';
    });
  }

  var alvos = [].slice.call(document.querySelectorAll('.hero h1, .section-head h2'));
  var finalH2 = document.querySelector('.final-inner h2');
  alvos.forEach(function (h) { h.classList.add('kin'); reparte(h); });
  if (finalH2) { finalH2.classList.add('kin', 'kin-big'); reparte(finalH2); }

  if (!reduz) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('kin-in', e.isIntersecting); });
    }, { threshold: 0.35 });
    alvos.concat(finalH2 ? [finalH2] : []).forEach(function (h) { io.observe(h); });
    // hero entra de primeira
    var hh = document.querySelector('.hero h1');
    if (hh) setTimeout(function () { hh.classList.add('kin-in'); }, 150);
  } else {
    alvos.concat(finalH2 ? [finalH2] : []).forEach(function (h) { h.classList.add('kin-in'); });
  }

  // ---- números que contam (prova social) ----
  var provas = [].slice.call(document.querySelectorAll('.proof-card b'));
  provas.forEach(function (b) {
    var m = b.textContent.match(/\d+/);
    if (!m) return;
    b.dataset.alvo = m[0];
    b.dataset.tpl = b.textContent;
  });
  if (!reduz && provas.length) {
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
    }, { threshold: 0.6 });
    provas.forEach(function (b) { if (b.dataset.alvo) ioN.observe(b); });
  }

  // ---- fundo da página muda de cor por seção ----
  if (!reduz) {
    var mapa = [
      ['.hero', [14, 8, 21]],
      ['.clients-section', [22, 11, 34]],
      ['#portfolio', [14, 8, 21]],
      ['#prova', [10, 15, 44]],
      ['.stack-section', [19, 8, 30]],
      ['#depoimentos', [33, 10, 27]],
      ['.final-section', [14, 8, 21]]
    ].map(function (par) {
      var el = document.querySelector(par[0]);
      return el ? { el: el, c: par[1] } : null;
    }).filter(Boolean);

    var cur = [14, 8, 21];
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
  }

  // ---- fechamento: varredura de cor + botão magnético ----
  var fs = document.querySelector('.final-section');
  if (fs) {
    if (!reduz) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { fs.classList.toggle('fs-in', e.isIntersecting); });
      }, { threshold: 0.3 }).observe(fs);
    } else { fs.classList.add('fs-in'); }

    var fogo = fs.querySelector('.btn-fire');
    if (fogo && !reduz && window.matchMedia('(pointer: fine)').matches) {
      var bx = 0, by = 0, tx = 0, ty = 0;
      fs.addEventListener('mousemove', function (e) {
        var r = fogo.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        var d = Math.hypot(dx, dy);
        if (d < 180) { var f = (1 - d / 180) * 0.4; tx = dx * f; ty = dy * f; }
        else { tx = 0; ty = 0; }
      }, { passive: true });
      (function magLoop() {
        bx += (tx - bx) * 0.14; by += (ty - by) * 0.14;
        fogo.style.transform = 'translate(' + bx + 'px,' + by + 'px)';
        requestAnimationFrame(magLoop);
      })();
    }
  }
})();

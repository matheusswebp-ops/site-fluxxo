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

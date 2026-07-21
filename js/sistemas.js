// ============ Sistemas: terminal vivo, colapso, calculadora e CTA magnético ============
(function () {
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var fase = function (p, a, b) { return clamp((p - a) / (b - a), 0, 1); };
  var suave = function (t) { return t * t * (3 - 2 * t); };
  var rnd = function (i) { var x = Math.sin(i * 173.3 + 71.7) * 43758.5453; return x - Math.floor(x); };

  // ---------- terminal vivo ----------
  var st = document.getElementById('stBody');
  if (st) {
    var LINHAS = [
      ['> novo pedido recebido no site', ''],
      ['> estoque atualizado', 'ok'],
      ['> nota fiscal emitida', 'ok'],
      ['> cliente avisado no WhatsApp', 'ok'],
      ['> follow-up agendado pra sexta', 'dim'],
      ['> relatório do dia enviado pro gestor', 'ok']
    ];
    if (reduz) {
      st.innerHTML = LINHAS.map(function (l) {
        return '<div class="' + l[1] + '">' + l[0] + (l[1] === 'ok' ? ' ✓' : '') + '</div>';
      }).join('');
    } else {
      var li = 0, ci = 0, atual = null;
      function tick() {
        if (!atual) {
          if (li >= LINHAS.length) {
            setTimeout(function () { st.innerHTML = ''; li = 0; tick(); }, 2600);
            return;
          }
          atual = document.createElement('div');
          atual.className = LINHAS[li][1];
          st.appendChild(atual);
          while (st.children.length > 4) st.removeChild(st.firstChild);
          ci = 0;
        }
        var texto = LINHAS[li][0];
        ci++;
        atual.innerHTML = texto.slice(0, ci) + '<span class="st-caret"></span>';
        if (ci >= texto.length) {
          atual.innerHTML = texto + (LINHAS[li][1] === 'ok' ? ' <span class="ok">✓</span>' : '');
          atual = null; li++;
          setTimeout(tick, 420);
        } else {
          setTimeout(tick, 22 + Math.random() * 30);
        }
      }
      tick();
    }
  }

  // ---------- o colapso ----------
  var stage = document.querySelector('.col-stage');
  if (stage && !reduz) {
    var chips = [].slice.call(stage.querySelectorAll('.col-chip'));
    var node = document.getElementById('colNode');
    var head = document.getElementById('colHead');
    var burst = document.getElementById('cnBurst');

    // posições espalhadas (determinísticas)
    var alvos = chips.map(function (c, i) {
      var ang = (i / chips.length) * Math.PI * 2 + rnd(i) * 0.9;
      var raio = 0.32 + rnd(i * 3) * 0.55;
      return {
        x: Math.cos(ang) * raio * (window.innerWidth < 700 ? 160 : 380),
        y: Math.sin(ang) * raio * (window.innerWidth < 700 ? 190 : 200),
        r: (rnd(i * 7) - 0.5) * 24
      };
    });

    var ticking = false;
    function render() {
      ticking = false;
      var r = stage.getBoundingClientRect();
      var p = clamp(-r.top / (r.height - innerHeight), 0, 1);

      var tCol = suave(fase(p, 0.22, 0.52));    // colapso pro centro
      var tNode = suave(fase(p, 0.46, 0.72));   // fluxo + resultado nascem e seguram até o fim

      head.style.opacity = suave(fase(p, 0, 0.06)) * (1 - suave(fase(p, 0.26, 0.42)));

      chips.forEach(function (c, i) {
        var a = alvos[i];
        var ini = (i / chips.length) * 0.2;
        var t1 = suave(fase(p, ini, ini + 0.1));
        var x = a.x * (1 - tCol);
        var y = a.y * (1 - tCol);
        var esc = (0.7 + 0.3 * t1) * (1 - tCol * 0.85);
        c.style.opacity = t1 * (1 - suave(fase(p, 0.4, 0.54)));
        c.style.transform = 'translate(-50%,-50%) translate(' + x + 'px,' + y + 'px) rotate(' + (a.r * (1 - tCol)) + 'deg) scale(' + esc + ')';
      });

      node.style.transform = 'translate(-50%,-50%) scale(' + tNode + ')';
      node.style.opacity = tNode;

      if (burst) {
        var tB = fase(p, 0.46, 0.72);
        burst.style.transform = 'scale(' + (0.4 + tB * 2) + ')';
        burst.style.opacity = (tB > 0 && tB < 1) ? (1 - tB) * 0.9 : 0;
      }
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(render); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    render();
  }

  // ---------- calculadora ----------
  var cH = document.getElementById('cHoras');
  if (cH) {
    var cV = document.getElementById('cValor');
    var outH = document.getElementById('outHoras');
    var outG = document.getElementById('outGrana');
    var cta = document.getElementById('calcCta');
    var brl = function (n) { return 'R$ ' + n.toLocaleString('pt-BR'); };

    function slider(el) {
      var pct = (el.value - el.min) / (el.max - el.min) * 100;
      el.style.setProperty('--fill', pct + '%');
    }
    function calcula() {
      var h = parseInt(cH.value, 10), v = parseInt(cV.value, 10);
      var horasAno = h * 52, grana = horasAno * v;
      document.getElementById('cHorasV').textContent = h + 'h';
      document.getElementById('cValorV').textContent = brl(v);
      outH.textContent = horasAno.toLocaleString('pt-BR') + ' horas';
      outG.textContent = brl(grana);
      slider(cH); slider(cV);
      var msg = 'Oi! Usei a calculadora da Fluxxo: perco ' + h + 'h por semana com tarefa repetitiva ('
        + horasAno.toLocaleString('pt-BR') + ' horas e ' + brl(grana) + ' por ano). Quero automatizar isso!';
      cta.href = 'https://wa.me/5585992657146?text=' + encodeURIComponent(msg);
    }
    cH.addEventListener('input', calcula);
    cV.addEventListener('input', calcula);
    calcula();
  }

  // ---------- sistemas no ar: vídeo real com placeholder de fallback ----------
  var sysVideos = [].slice.call(document.querySelectorAll('[data-sysvideo]'));
  if (sysVideos.length) {
    var vObserver = ('IntersectionObserver' in window) ? new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var v = entry.target;
        if (entry.isIntersecting) { if (v.play) v.play().catch(function () {}); }
        else if (v.pause) { v.pause(); }
      });
    }, { threshold: 0.35 }) : null;

    sysVideos.forEach(function (v) {
      var body = v.closest('.sl-body, .demo-canvas');
      var ph = body ? body.querySelector('[data-placeholder]') : null;
      function falhou() { if (ph) ph.classList.remove('is-hidden'); }
      function carregou() {
        if (ph) ph.classList.add('is-hidden');
        if (vObserver) vObserver.observe(v);
      }
      v.addEventListener('error', falhou, true);
      v.addEventListener('loadeddata', carregou);
      if (v.error) falhou();
    });
  }

  // ---------- showcase pinado (demos: 3 atos) ----------
  var showStage = document.querySelector('.show-stage');
  if (showStage && !reduz && window.innerWidth > 900) {
    var acts = [].slice.call(showStage.querySelectorAll('.show-act'));
    var railDots = [].slice.call(showStage.querySelectorAll('.show-rail i'));
    var showHead = showStage.querySelector('.show-head');
    var n = acts.length;
    var showTick = false;
    function showRender() {
      showTick = false;
      var r = showStage.getBoundingClientRect();
      var p = clamp(-r.top / (r.height - innerHeight), 0, 1);
      if (showHead) showHead.style.opacity = suave(fase(p, 0, 0.08));
      var ci = p * (n - 1);                          // ato 0 cheio em p=0, ato n-1 cheio em p=1
      acts.forEach(function (act, i) {
        var off = i - ci;
        act.style.transform = 'translateX(' + (off * 108) + '%)';
        act.style.opacity = clamp(1 - Math.abs(off) * 1.25, 0, 1);
        act.style.pointerEvents = Math.abs(off) < 0.5 ? 'auto' : 'none';
      });
      var active = clamp(Math.round(ci), 0, n - 1);
      railDots.forEach(function (dot, i) { dot.classList.toggle('on', i === active); });
    }
    function showScroll() { if (!showTick) { showTick = true; requestAnimationFrame(showRender); } }
    window.addEventListener('scroll', showScroll, { passive: true });
    window.addEventListener('resize', showScroll, { passive: true });
    showRender();
  }

  // ---------- segmentos: trilho horizontal ----------
  var segStage = document.querySelector('.seg-stage');
  var segTrack = document.getElementById('segTrack');
  if (segStage && segTrack && !reduz && window.innerWidth > 900) {
    var segCards = [].slice.call(segTrack.querySelectorAll('.seg-card'));
    var segHead = segStage.querySelector('.seg-head');
    var segBar = document.querySelector('#segProgress span');
    var segTick = false, segMax = 0;
    function segMeasure() {
      segMax = segCards.length > 1
        ? Math.max(0, segCards[segCards.length - 1].offsetLeft - segCards[0].offsetLeft)
        : 0;
    }
    function segRender() {
      segTick = false;
      var r = segStage.getBoundingClientRect();
      var p = clamp(-r.top / (r.height - innerHeight), 0, 1);
      if (segHead) segHead.style.opacity = suave(fase(p, 0.02, 0.13));
      segTrack.style.transform = 'translateX(' + (-suave(p) * segMax) + 'px)';
      if (segBar) segBar.style.width = (p * 100) + '%';
      var mid = innerWidth / 2, best = 1e9, bi = 0;
      segCards.forEach(function (c, i) {
        var b = c.getBoundingClientRect();
        var dist = Math.abs((b.left + b.width / 2) - mid);
        if (dist < best) { best = dist; bi = i; }
      });
      segCards.forEach(function (c, i) { c.classList.toggle('on', i === bi); });
    }
    function segScroll() { if (!segTick) { segTick = true; requestAnimationFrame(segRender); } }
    segMeasure();
    window.addEventListener('scroll', segScroll, { passive: true });
    window.addEventListener('resize', function () { segMeasure(); segScroll(); }, { passive: true });
    window.addEventListener('load', function () { segMeasure(); segScroll(); });
    segRender();
  }

  // ---------- fecho: texto se forma, flash, marca fluxxo ----------
  var scStage = document.querySelector('.sclose-stage');
  if (scStage && !reduz && window.innerWidth > 900) {
    var scLine = document.getElementById('scloseLine');
    var scWords = [].slice.call(scLine.querySelectorAll('span'));
    var scFinal = document.getElementById('scloseFinal');
    var scGlow = document.getElementById('scloseGlow');
    var scFlash = document.getElementById('scloseFlash');
    var scLetters = [].slice.call(document.querySelectorAll('#scloseBrand span'));
    var scSub = scFinal.querySelector('p');
    var scCta = document.getElementById('sisMag');
    var wN = scWords.length, scTick = false;
    function scRender() {
      scTick = false;
      var r = scStage.getBoundingClientRect();
      var p = clamp(-r.top / (r.height - innerHeight), 0, 1);

      var lineOut = suave(fase(p, 0.44, 0.56));   // linha sai
      scLine.style.opacity = 1 - lineOut;
      scLine.style.transform = 'translateY(' + (lineOut * -30) + 'px)';
      var step = 0.3 / wN;
      scWords.forEach(function (w, i) {
        var wt = suave(fase(p, 0.05 + i * step, 0.05 + i * step + 0.14));
        w.style.opacity = wt;
        w.style.transform = 'translateY(' + ((1 - wt) * 26) + 'px)';
      });

      if (scGlow) scGlow.style.opacity = suave(fase(p, 0.16, 0.46)) * (1 - suave(fase(p, 0.62, 0.82))) * 0.9 + suave(fase(p, 0.6, 0.85)) * 0.5;
      if (scFlash) { var fl = clamp(1 - Math.abs(p - 0.5) / 0.05, 0, 1); scFlash.style.opacity = fl * 0.55; }

      scFinal.style.opacity = suave(fase(p, 0.5, 0.6));
      scFinal.style.transform = 'translateY(' + ((1 - suave(fase(p, 0.5, 0.7))) * 16) + 'px)';
      scFinal.style.pointerEvents = p > 0.62 ? 'auto' : 'none';

      scLetters.forEach(function (l, i) {
        var lt = suave(fase(p, 0.56 + i * 0.028, 0.56 + i * 0.028 + 0.13));
        l.style.opacity = lt;
        l.style.transform = 'translateY(' + ((1 - lt) * 42) + 'px)';
      });

      var tail = suave(fase(p, 0.78, 0.92));
      if (scSub) { scSub.style.opacity = tail; scSub.style.transform = 'translateY(' + ((1 - tail) * 14) + 'px)'; }
      if (scCta) scCta.style.opacity = tail;
    }
    function scScroll() { if (!scTick) { scTick = true; requestAnimationFrame(scRender); } }
    window.addEventListener('scroll', scScroll, { passive: true });
    window.addEventListener('resize', scScroll, { passive: true });
    scRender();
  }

  // ---------- CTA magnético ----------
  var mag = document.getElementById('sisMag');
  if (mag && !reduz && window.matchMedia('(pointer: fine)').matches) {
    var card = mag.closest('.sclose-final');
    var bx = 0, by = 0, tx = 0, ty = 0;
    card.addEventListener('mousemove', function (e) {
      var r = mag.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      var d = Math.hypot(dx, dy);
      if (d < 170) { var f = (1 - d / 170) * 0.4; tx = dx * f; ty = dy * f; }
      else { tx = 0; ty = 0; }
    }, { passive: true });
    card.addEventListener('mouseleave', function () { tx = 0; ty = 0; }, { passive: true });
    (function loop() {
      bx += (tx - bx) * 0.14; by += (ty - by) * 0.14;
      mag.style.transform = 'translate(' + bx + 'px,' + by + 'px)';
      requestAnimationFrame(loop);
    })();
  }
})();

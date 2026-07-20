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


// ============ Palco do hero (importado da home) ============
var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// ============ HERO CINE · motor "caos -> fluxo" ============
  (function(){
    var cv=document.getElementById('cine');
    if(!cv) return;
    var ctx=cv.getContext('2d');
    var hero=document.querySelector('.hero');
    var W=0,H=0,DPR=1;
    var PURPLES=['#7c4dff','#a99cff','#8a5cc4','#6c4596'];
    var mobile=window.matchMedia('(max-width:900px)').matches;

    function resize(){
      DPR=Math.min(window.devicePixelRatio||1,2);
      W=hero.clientWidth; H=hero.clientHeight;
      cv.width=W*DPR; cv.height=H*DPR;
      cv.style.width=W+'px'; cv.style.height=H+'px';
      ctx.setTransform(DPR,0,0,DPR,0,0);
      buildCurves();
    }

    // ---------- partículas ----------
    var N = mobile ? 80 : Math.min(190, Math.round((window.innerWidth*window.innerHeight)/9500));
    var parts=[];
    function spawn(){
      parts=[];
      for(var i=0;i<N;i++){
        var z=.35+Math.random()*.65; // profundidade
        parts.push({
          x:Math.random()*W, y:Math.random()*H,
          vx:0, vy:0, z:z,
          r:(.5+Math.random()*1.5)*z,
          c:PURPLES[i%PURPLES.length],
          seed:Math.random()*1000,
          bright:Math.random()<.12 // algumas mais claras
        });
      }
    }

    // ---------- linhas de fluxo (3 curvas bezier) ----------
    var curves=[];
    function buildCurves(){
      curves=[];
      for(var k=0;k<3;k++){
        var yBase=H*(.3+k*.2)+(Math.random()*40-20);
        curves.push({
          p0:{x:-W*.08, y:yBase+(Math.random()*60-30)},
          p1:{x:W*.32,  y:yBase+(Math.random()*160-80)},
          p2:{x:W*.68,  y:yBase+(Math.random()*160-80)},
          p3:{x:W*1.08, y:yBase+(Math.random()*60-30)}
        });
      }
    }
    function bez(c,t){
      var u=1-t;
      return {
        x:u*u*u*c.p0.x+3*u*u*t*c.p1.x+3*u*t*t*c.p2.x+t*t*t*c.p3.x,
        y:u*u*u*c.p0.y+3*u*u*t*c.p1.y+3*u*t*t*c.p2.y+t*t*t*c.p3.y
      };
    }

    // ---------- ciclo narrativo ----------
    // fases: 0 caos (3.6s) -> 1 reunir (2.2s) -> 2 pulso (2.2s) -> 3 soltar (1.4s)
    var DUR=[3.6,2.2,2.2,1.4], CYCLE=DUR[0]+DUR[1]+DUR[2]+DUR[3];
    function phaseAt(t){
      var m=t%CYCLE, acc=0;
      for(var i=0;i<4;i++){ if(m<acc+DUR[i]) return {i:i, p:(m-acc)/DUR[i]}; acc+=DUR[i]; }
      return {i:0,p:0};
    }

    // ---------- ponteiro (repulsão) / tilt no mobile ----------
    var px=-9999, py=-9999, tiltX=0, tiltY=0;
    if(!mobile){
      hero.addEventListener('mousemove',function(e){
        var r=hero.getBoundingClientRect();
        px=e.clientX-r.left; py=e.clientY-r.top;
      },{passive:true});
      hero.addEventListener('mouseleave',function(){px=-9999;py=-9999;});
    } else if(window.DeviceOrientationEvent){
      window.addEventListener('deviceorientation',function(e){
        if(e.gamma==null) return;
        tiltX=Math.max(-1,Math.min(1,(e.gamma||0)/30));
        tiltY=Math.max(-1,Math.min(1,((e.beta||0)-45)/30));
      },{passive:true});
    }

    // ---------- render ----------
    var t0=null, running=false, rafId=null, sf=0;
    function frame(ts){
      if(!t0) t0=ts;
      var t=(ts-t0)/1000;
      var ph=phaseAt(t);
      ctx.clearRect(0,0,W,H);

      // brilho das curvas (nasce no reunir, vive no pulso, morre no soltar)
      var curveA = 0; // linhas desligadas: a parede de sites é o palco
      if(curveA>0.01){
        for(var k=0;k<curves.length;k++){
          var c=curves[k];
          var g=ctx.createLinearGradient(c.p0.x,c.p0.y,c.p3.x,c.p3.y);
          g.addColorStop(0,'rgba(124,77,255,0)');
          g.addColorStop(.5,'rgba(169,156,255,'+(curveA*.55)+')');
          g.addColorStop(1,'rgba(108,69,150,0)');
          ctx.strokeStyle=g; ctx.lineWidth=1;
          ctx.beginPath(); ctx.moveTo(c.p0.x,c.p0.y);
          ctx.bezierCurveTo(c.p1.x,c.p1.y,c.p2.x,c.p2.y,c.p3.x,c.p3.y);
          ctx.stroke();
        }
      }
      // pulso de luz percorrendo as curvas
      if(false){
        for(var k2=0;k2<curves.length;k2++){
          var tp=Math.min(1,ph.p*1.15-(k2*.06));
          if(tp<=0) continue;
          var pt=bez(curves[k2],tp);
          var rg=ctx.createRadialGradient(pt.x,pt.y,0,pt.x,pt.y,26);
          rg.addColorStop(0,'rgba(239,226,255,.9)');
          rg.addColorStop(.35,'rgba(169,156,255,.4)');
          rg.addColorStop(1,'rgba(124,77,255,0)');
          ctx.fillStyle=rg;
          ctx.beginPath(); ctx.arc(pt.x,pt.y,26,0,7); ctx.fill();
          // rastro
          for(var tr=1;tr<=5;tr++){
            var tt=tp-tr*.028; if(tt<=0) break;
            var pp=bez(curves[k2],tt);
            ctx.fillStyle='rgba(169,156,255,'+(0.28-(tr*.05))+')';
            ctx.beginPath(); ctx.arc(pp.x,pp.y,3.4-tr*.5,0,7); ctx.fill();
          }
        }
      }

      // campo de deriva (caos) — pseudo-ruído por senos
      var cxo=tiltX*30, cyo=tiltY*30;
      for(var i=0;i<parts.length;i++){
        var p=parts[i];
        var flow=Math.sin(p.y*.006+t*.5+p.seed)+Math.cos(p.x*.005-t*.35+p.seed);
        var ax=Math.cos(flow)*(.05*p.z), ay=Math.sin(flow)*(.05*p.z);

        // fase reunir: atrai pro ponto da curva mais próxima
        if(ph.i===1||ph.i===2){
          var c3=curves[i%curves.length];
          var tgt=bez(c3,(i/parts.length+p.seed%1)%1);
          var k3 = ph.i===1 ? ph.p*.045 : .045;
          ax+=(tgt.x-p.x)*k3*.06; ay+=(tgt.y-p.y)*k3*.06;
        }
        // fase soltar: empurra pra fora
        if(ph.i===3&&ph.p<.35){
          ax+=(p.x-W/2)*.0009; ay+=(p.y-H/2)*.0009;
        }

        // repulsão do mouse
        var dx=p.x-px, dy=p.y-py, d2=dx*dx+dy*dy;
        if(d2<16900){ var d=Math.sqrt(d2)||1, f=(130-d)/130*.9;
          ax+=dx/d*f; ay+=dy/d*f; }

        p.vx=(p.vx+ax)*.92; p.vy=(p.vy+ay)*.92;
        p.x+=p.vx+cxo*.002*p.z; p.y+=p.vy+cyo*.002*p.z;

        // wrap
        if(p.x<-20)p.x=W+20; if(p.x>W+20)p.x=-20;
        if(p.y<-20)p.y=H+20; if(p.y>H+20)p.y=-20;

        // brilho pulsa no compasso do ciclo
        var tw=.45+.3*Math.sin(t*1.4+p.seed*7);
        var glow = ph.i===2 ? .25 : 0;
        ctx.globalAlpha=Math.min(1,(tw+glow)*p.z);
        ctx.fillStyle=p.bright?'#efe2ff':p.c;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,7); ctx.fill();
      }
      ctx.globalAlpha=1;

      rafId=requestAnimationFrame(frame);
    }

    // ---------- estático elegante p/ reduced-motion ----------
    function staticFrame(){
      ctx.clearRect(0,0,W,H);
      for(var k=0;k<0;k++){
        var c=curves[k];
        var g=ctx.createLinearGradient(c.p0.x,c.p0.y,c.p3.x,c.p3.y);
        g.addColorStop(0,'rgba(124,77,255,0)'); g.addColorStop(.5,'rgba(169,156,255,.22)'); g.addColorStop(1,'rgba(108,69,150,0)');
        ctx.strokeStyle=g; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(c.p0.x,c.p0.y);
        ctx.bezierCurveTo(c.p1.x,c.p1.y,c.p2.x,c.p2.y,c.p3.x,c.p3.y); ctx.stroke();
      }
      for(var i=0;i<parts.length;i++){
        var p=parts[i];
        ctx.globalAlpha=.5*p.z;
        ctx.fillStyle=p.bright?'#efe2ff':p.c;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,7); ctx.fill();
      }
      ctx.globalAlpha=1;
    }

    function start(){ if(running||reduce) return; running=true; t0=null; rafId=requestAnimationFrame(frame); }
    function stop(){ running=false; if(rafId) cancelAnimationFrame(rafId); }

    resize(); spawn();
    cv.classList.add('on');
    window.addEventListener('resize',function(){ resize(); spawn(); if(reduce) staticFrame(); },{passive:true});

    if(reduce){ staticFrame(); return; }

    // pausa quando a hero sai da tela (bateria!)
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(en){
        en.forEach(function(e){ e.isIntersecting?start():stop(); });
      },{threshold:.05}).observe(hero);
    } else { start(); }
  })();

// ============ Hero: a parede de sites inclina com o mouse e afunda no scroll ============
(function () {
  var plane = document.getElementById('wallPlane');
  var hero = document.querySelector('.hero');
  if (!plane || !hero) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

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

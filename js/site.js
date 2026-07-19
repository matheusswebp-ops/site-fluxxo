var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // nav bg
  var nav=document.getElementById('nav');
  function onScroll(){ nav.classList.toggle('scrolled', window.scrollY>20); }
  onScroll(); window.addEventListener('scroll', onScroll, {passive:true});

  // mobile menu
  var burger=document.getElementById('burger'), mpanel=document.getElementById('mpanel');
  burger.addEventListener('click',function(){var o=mpanel.classList.toggle('open');burger.setAttribute('aria-expanded',o?'true':'false');});
  mpanel.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){mpanel.classList.remove('open');});});

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
      var curveA = ph.i===1 ? ph.p*.5 : ph.i===2 ? .5 : ph.i===3 ? (1-ph.p)*.5 : 0;
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
      if(ph.i===2){
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
      for(var k=0;k<curves.length;k++){
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

  // (a entrada por scroll da seção 2 agora é 100% CSS, view-timeline)

  // ---- contadores dos números (anima 0 -> valor ao entrar na tela) ----
  (function(){
    var nums=[].slice.call(document.querySelectorAll('.stat-cnt'));
    if(!nums.length) return;
    if(reduce){ nums.forEach(function(el){ el.textContent=el.getAttribute('data-to'); }); return; }
    function reset(el){
      if(el._raf) cancelAnimationFrame(el._raf);
      if(el._to) clearTimeout(el._to);
      el._raf=null; el._to=null; el.textContent='0';
    }
    function run(el, delay){
      reset(el);
      var to=parseInt(el.getAttribute('data-to'),10)||0, dur=1400, t0=null;
      function step(ts){
        if(!t0) t0=ts;
        var p=Math.min((ts-t0)/dur,1);
        var e=1-Math.pow(1-p,3); // easeOutCubic
        el.textContent=Math.round(to*e);
        if(p<1) el._raf=requestAnimationFrame(step);
      }
      el._to=setTimeout(function(){ el._raf=requestAnimationFrame(step); }, delay);
    }
    if('IntersectionObserver' in window){
      var io=new IntersectionObserver(function(en){
        en.forEach(function(e){
          var idx=nums.indexOf(e.target);
          if(e.isIntersecting){ run(e.target, idx*260); } // um por um
          else { reset(e.target); }                        // zera pra reanimar na volta
        });
      },{threshold:.4});
      nums.forEach(function(el){ el.textContent='0'; io.observe(el); });
    } else {
      nums.forEach(function(el){ run(el,0); });
    }
  })();
  // ---- entrada por scroll da Prova Social (JS, ida e volta) ----
  (function(){
    var rvs=[].slice.call(document.querySelectorAll('.proof .rv, .contact .rv, .clients .rv, .faq .rv'));
    if(!rvs.length) return;
    if(reduce || !('IntersectionObserver' in window)){ rvs.forEach(function(el){el.classList.add('in');}); return; }
    var io=new IntersectionObserver(function(en){
      en.forEach(function(e){ e.target.classList.toggle('in', e.isIntersecting); });
    },{threshold:0, rootMargin:'-12% 0px -12% 0px'});
    rvs.forEach(function(el){ io.observe(el); });
  })();
  // ---- contato: seleção de serviço + envio -> página de obrigado ----
  (function(){
    var form=document.getElementById('ctForm');
    if(!form) return;
    var svcBtns=[].slice.call(document.querySelectorAll('.ct-svc'));
    var grid=document.getElementById('ctSvcGrid');
    var submit=form.querySelector('.ct-submit');
    var nameEl=document.getElementById('ctName'), emailEl=document.getElementById('ctEmail');
    var chosen=null;

    svcBtns.forEach(function(b){
      b.addEventListener('click',function(){
        svcBtns.forEach(function(x){x.classList.remove('is-on');x.setAttribute('aria-pressed','false');});
        b.classList.add('is-on');b.setAttribute('aria-pressed','true');
        chosen=b.getAttribute('data-svc');
      });
    });

    form.addEventListener('submit',function(e){
      e.preventDefault();
      if(!chosen){ grid.classList.remove('shake'); void grid.offsetWidth; grid.classList.add('shake');
        grid.scrollIntoView({behavior:'smooth',block:'center'}); return; }
      if(!nameEl.value.trim() || !emailEl.checkValidity()){
        (nameEl.value.trim()?emailEl:nameEl).focus(); return; }
      submit.classList.add('loading'); submit.disabled=true;
      var msgEl=document.getElementById('ctMsg');
      var projeto=(msgEl&&msgEl.value.trim())?msgEl.value.trim():'Prefiro contar na conversa.';
      var texto='*Novo contato pelo site da Fluxxo*\n\n'
        +'*Nome:* '+nameEl.value.trim()+'\n'
        +'*E-mail:* '+emailEl.value.trim()+'\n'
        +'*Servico:* '+chosen+'\n'
        +'*Projeto:* '+projeto;
      setTimeout(function(){
        window.location.href='https://wa.me/5585992657146?text='+encodeURIComponent(texto);
        submit.classList.remove('loading'); submit.disabled=false;
      }, 500);
    });
  })();

// ============ MacBook cine-scroll: nasce, abre, acende e a câmera mergulha na tela ============
(function () {
  var stage = document.querySelector('.lap-stage');
  if (!stage) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var laptop = document.getElementById('laptop');
  var lid = document.getElementById('lapLid');
  var view = document.querySelector('.lap-view');
  var shot = document.getElementById('lapShot');
  var copy = document.getElementById('lapCopy');
  var hint = document.getElementById('lapHint');
  var cap = document.getElementById('lapCap');
  var shadow = document.querySelector('.lap-shadow');

  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var fase = function (p, ini, fim) { return clamp((p - ini) / (fim - ini), 0, 1); };
  var suave = function (t) { return t * t * (3 - 2 * t); };

  var ticking = false;
  function render() {
    ticking = false;
    var r = stage.getBoundingClientRect();
    var total = r.height - window.innerHeight;
    var p = clamp(-r.top / total, 0, 1);
    var mobile = window.innerWidth < 700;

    // título: entra no início, SAI antes da tampa terminar de abrir (sem atropelo)
    var tIn = suave(fase(p, 0, 0.14));
    var tOut = suave(fase(p, 0.3, 0.44));
    copy.style.opacity = tIn * (1 - tOut);
    copy.style.transform = 'translateY(' + (24 - 24 * tIn - 30 * tOut) + 'px)';

    // laptop nasce de baixo, pequeno e fechado
    var t2 = suave(fase(p, 0.06, 0.26));
    // tampa abre
    var t3 = suave(fase(p, 0.28, 0.56));
    lid.style.transform = 'rotateX(' + (-90 + 90 * t3) + 'deg)';
    // tela acende
    var t4 = suave(fase(p, 0.46, 0.62));
    view.style.filter = 'brightness(' + (0.1 + 0.9 * t4) + ')';
    // site rola dentro da tela
    var t5 = suave(fase(p, 0.6, 0.96));
    var alcance = Math.max(0, shot.offsetHeight - view.offsetHeight);
    shot.style.transform = 'translateY(-' + alcance * t5 * 0.6 + 'px)';

    // ZOOM: a câmera mergulha até a tela dominar o viewport
    var t6 = suave(fase(p, 0.58, 0.97));
    var escalaMax = mobile ? 1.55 : 2.1;
    var escala = (0.8 + 0.16 * t2) + (escalaMax - 0.96) * t6;
    var subida = 130 - 130 * t2;               // nascimento
    var mergulho = t6 * (mobile ? 9 : 13);      // desce um pouco pra tela centralizar no zoom
    // camera levemente de cima: 17deg com a tampa fechada, assenta em 8deg aberta
    var tilt = 17 - 9 * t3 - 4 * t6;
    laptop.style.opacity = t2;
    laptop.style.transform = 'translateY(' + subida + 'px) translateY(' + mergulho + 'vh) scale(' + escala + ') rotateX(' + tilt + 'deg)';
    shadow.style.opacity = t2 * 0.9 * (1 - t6);

    // dica de rolagem só no comecinho
    hint.style.opacity = t2 * (1 - suave(fase(p, 0.26, 0.36)));

    // legenda do projeto por cima do zoom final
    var t7 = suave(fase(p, 0.82, 0.92));
    cap.style.opacity = t7;
    cap.style.transform = 'translateY(' + (12 - 12 * t7) + 'px)';
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(render); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  if (shot.complete) render(); else shot.addEventListener('load', render);
})();

// ============ Manifesto cinético: letras se formam, fundo muda, spotlight segue ============
(function () {
  var stage = document.querySelector('.mani-stage');
  if (!stage) return;

  var phrases = [].slice.call(document.querySelectorAll('.mani-phrase'));

  // monta as letras (|trecho| = destaque)
  phrases.forEach(function (ph) {
    var raw = ph.getAttribute('data-text');
    ph.textContent = '';
    raw.split('|').forEach(function (seg, si) {
      if (!seg) return;
      var wrap = null;
      if (si % 2 === 1) { wrap = document.createElement('span'); wrap.className = 'm-hl'; ph.appendChild(wrap); }
      seg.split(' ').forEach(function (word, wi, arr) {
        if (!word) { (wrap || ph).appendChild(document.createTextNode(' ')); return; }
        var w = document.createElement('span'); w.className = 'm-w';
        for (var k = 0; k < word.length; k++) {
          var l = document.createElement('span'); l.className = 'm-l'; l.textContent = word[k];
          w.appendChild(l);
          // morph: depois do primeiro x de "fluxo." entra um segundo x fantasma
          if (ph.dataset.morph && word[k] === 'x') {
            var x2 = document.createElement('span'); x2.className = 'm-l m-x2'; x2.textContent = 'x';
            w.appendChild(x2);
          }
        }
        (wrap || ph).appendChild(w);
        if (wi < arr.length - 1) (wrap || ph).appendChild(document.createTextNode(' '));
      });
    });
    ph._letters = [].slice.call(ph.querySelectorAll('.m-l:not(.m-x2)'));
    ph._x2 = ph.querySelector('.m-x2');
    ph._hl = ph.querySelector('.m-hl');
  });

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var sticky = document.getElementById('maniSticky');
  var bg = document.getElementById('maniBg');
  var spot = document.getElementById('maniSpot');
  var dots = [].slice.call(document.querySelectorAll('#maniDots i'));

  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var fase = function (p, a, b) { return clamp((p - a) / (b - a), 0, 1); };
  var suave = function (t) { return t * t * (3 - 2 * t); };
  var rnd = function (i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  // paleta do fundo ao longo da rolagem
  var STOPS = [
    [0.00, [14, 8, 21]], [0.20, [14, 8, 21]],
    [0.30, [43, 10, 34]], [0.45, [43, 10, 34]],
    [0.55, [245, 242, 236]], [0.70, [245, 242, 236]],
    [0.80, [14, 8, 21]], [1.00, [14, 8, 21]]
  ];
  function bgColor(p) {
    for (var i = 0; i < STOPS.length - 1; i++) {
      var a = STOPS[i], b = STOPS[i + 1];
      if (p >= a[0] && p <= b[0]) {
        var t = suave(fase(p, a[0], b[0]));
        return [0, 1, 2].map(function (k) { return Math.round(a[1][k] + (b[1][k] - a[1][k]) * t); });
      }
    }
    return STOPS[STOPS.length - 1][1];
  }

  // spotlight segue o mouse com atraso gostoso
  var mx = innerWidth / 2, my = innerHeight / 2, sx = mx, sy = my, spotOn = false;
  stage.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });

  var W = 0.25; // janela de cada frase
  var ticking = false;
  function render() {
    ticking = false;
    var r = stage.getBoundingClientRect();
    var p = clamp(-r.top / (r.height - innerHeight), 0, 1);

    // fundo
    var c = bgColor(p);
    bg.style.backgroundColor = 'rgb(' + c.join(',') + ')';
    var luz = (c[0] * 0.299 + c[1] * 0.587 + c[2] * 0.114) / 255;
    sticky.classList.toggle('is-light', luz > 0.5);

    // frases
    phrases.forEach(function (ph, i) {
      var a = i * W, b = a + W;
      var ultima = i === phrases.length - 1;
      var out = ultima ? 0 : suave(fase(p, b - W * 0.16, b));
      var vis = p >= a - W * 0.05 && (ultima || p <= b + W * 0.05);
      ph.style.visibility = vis ? 'visible' : 'hidden';
      if (!vis) return;

      var n = ph._letters.length;
      ph._letters.forEach(function (l, k) {
        var ini = a + (k / n) * W * 0.42;
        var t = suave(fase(p, ini, ini + W * 0.26));
        var dx = (rnd(i * 97 + k) - 0.5) * 340 * (1 - t);
        var dy = (rnd(i * 57 + k * 3) - 0.5) * 260 * (1 - t) - out * (90 + rnd(k) * 120);
        var rot = (rnd(i * 31 + k * 7) - 0.5) * 70 * (1 - t) + out * (rnd(k * 5) - 0.5) * 40;
        l.style.opacity = t * (1 - out);
        l.style.transform = 'translate(' + dx + 'px,' + dy + 'px) rotate(' + rot + 'deg)';
        l.style.filter = 'blur(' + ((1 - t) * 7 + out * 5) + 'px)';
      });

      // sublinhado do destaque se desenha no meio da frase
      if (ph._hl) ph._hl.style.setProperty('--u', suave(fase(p, a + W * 0.5, a + W * 0.72)) * (1 - out));

      // morph fluxo -> fluxxo (frase final)
      if (ph._x2) {
        var m = suave(fase(p, a + W * 0.55, a + W * 0.78));
        ph._x2.style.maxWidth = (m * 0.62) + 'em';
        ph._x2.style.opacity = m;
      }
    });

    // pontinhos de progresso
    var atual = clamp(Math.floor(p / W), 0, 3);
    dots.forEach(function (d, i) { d.classList.toggle('on', i === atual); });

    spotOn = r.top < innerHeight && r.bottom > 0;
  }

  function loop() {
    if (spotOn) {
      sx += (mx - sx) * 0.08; sy += (my - sy) * 0.08;
      spot.style.transform = 'translate(-50%,-50%) translate(' + sx + 'px,' + sy + 'px)';
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(render); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  render();
})();

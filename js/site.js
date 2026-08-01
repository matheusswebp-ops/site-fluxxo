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
    // "p" NAO anda durante a entrada da secao: ele so sai de 0 quando o
    // topo da secao alcanca o topo da tela (o sticky travando). Toda a
    // primeira tela de rolagem fica em p=0 -- era por isso que a tampa
    // ficava fechada "rolando rolando" antes de abrir. pIn cobre esse
    // trecho: 0 com o topo da secao na base da tela, 1 quando trava.
    var pIn = clamp((window.innerHeight - r.top) / window.innerHeight, 0, 1);

    // título: a ENTRADA é a cascata CSS (.is-in); aqui só a saída — e o
    // inline só existe enquanto a saída roda, senão sobrescreveria a
    // cascata (inline ganha de classe). No desktop sai antes da tampa
    // abrir; no mobile ele FICA até a tampa fechar.
    var tOut = mobile ? suave(fase(p, 0.80, 0.95)) : suave(fase(p, 0.3, 0.44));
    copy.style.opacity = tOut > 0 ? String(1 - tOut) : '';
    copy.style.transform = tOut > 0 ? 'translateY(' + (-30 * tOut) + 'px)' : '';

    // laptop nasce de baixo, pequeno e fechado
    // no mobile o nascimento acompanha a ENTRADA (pIn): ele assenta
    // enquanto a secao sobe, nao depois
    var t2 = mobile ? suave(pIn) : suave(fase(p, 0.06, 0.26));
    // tampa abre junto com a entrada no mobile: meio aberta com a secao
    // meio na tela, toda aberta quando ela termina de entrar
    var t3 = mobile ? suave(pIn) : suave(fase(p, 0.28, 0.56));
    // ...e fecha de volta no fim: e o fechamento que encerra a cena, no lugar
    // de um zoom que recorta a moldura ou de uma cortina que apaga a tela
    // so no mobile: no desktop o final continua sendo o mergulho da camera,
    // e fechar a tampa no meio do zoom seria contraditorio
    var tFecha = mobile ? suave(fase(p, 0.78, 0.93)) : 0;
    lid.style.transform = 'rotateX(' + (-90 + 90 * t3 - 90 * tFecha) + 'deg)';
    // tela acende junto com a tampa abrindo (mobile: tambem na entrada)
    var t4 = mobile ? suave(fase(pIn, 0.45, 0.95)) : suave(fase(p, 0.46, 0.62));
    view.style.filter = 'brightness(' + (0.1 + 0.9 * t4 * (1 - tFecha)) + ')';   // tela apaga ao fechar
    // site rola dentro da tela. No mobile percorre o site inteiro e ocupa a
    // maior parte da secao: e ele que da vida, no lugar do zoom.
    var t5 = suave(fase(p, mobile ? 0.04 : 0.6, mobile ? 0.98 : 0.96));
    var alcance = Math.max(0, shot.offsetHeight - view.offsetHeight);
    shot.style.transform = 'translateY(-' + alcance * t5 * (mobile ? 1 : 0.6) + 'px)';

    // ZOOM: no desktop a câmera mergulha até a tela dominar o viewport.
    // No mobile NAO ha mergulho: passar da largura da tela recorta a moldura
    // e o notebook deixa de parecer um notebook. Ele cresce so ate assentar.
    var t6 = mobile ? 0 : suave(fase(p, 0.58, 0.97));
    var escalaMax = 2.1;
    var escala = mobile
      ? (0.9 + 0.1 * t2)
      : (0.8 + 0.16 * t2) + (escalaMax - 0.96) * t6;
    // nascimento: offset curto no mobile — 130px num celular vira um
    // buraco visivel entre o titulo e o notebook durante a entrada
    var nasc = mobile ? 44 : 130;
    var subida = nasc - nasc * t2;
    var mergulho = t6 * 13;                     // desce um pouco pra tela centralizar no zoom
    // camera levemente de cima: 17deg com a tampa fechada, assenta em 8deg aberta
    var tilt = 17 * (1 - t3);   // sem voltar a inclinar ao fechar: a caixa do 3D cresce e vaza a lateral // camera assenta frontal ao abrir: tampa e base viram um corpo so
    // opacidade é da cascata CSS (.is-in); o JS só escreve o transform
    // da cena (a cascata usa `translate`, que não conflita)
    laptop.style.transform = 'translateY(' + subida + 'px) translateY(' + mergulho + 'vh) scale(' + escala + ') rotateX(' + tilt + 'deg)';
    // sombra e dica: inline (com transition desligada, senão os .5s da
    // cascata atrasam o valor por-frame) só enquanto a saída roda
    if (t6 > 0.001) { shadow.style.transition = 'none'; shadow.style.opacity = String(0.9 * (1 - t6)); }
    else { shadow.style.transition = ''; shadow.style.opacity = ''; }
    var hOut = suave(fase(p, 0.26, 0.36));
    if (hOut > 0) { hint.style.transition = 'none'; hint.style.opacity = String(1 - hOut); }
    else { hint.style.transition = ''; hint.style.opacity = ''; }

    // legenda: no mobile entra cedo e fica, porque fecha o quadro embaixo
    // no mobile a legenda tambem entra durante a entrada (pIn), senao
    // fica um vazio embaixo do notebook ate o sticky travar
    var t7 = mobile ? suave(fase(pIn, 0.55, 1)) : suave(fase(p, 0.82, 0.92));
    cap.style.opacity = t7 * (1 - tFecha);
    cap.style.transform = 'translateY(' + (12 - 12 * t7) + 'px)';
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(render); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  if (shot.complete) render(); else shot.addEventListener('load', render);
})();

// ============ O Fio: a jornada do projeto presa ao scroll ============
(function () {
  var stage = document.querySelector('.fio-stage');
  if (!stage) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var track = document.getElementById('fioTrack');
  var path = document.getElementById('fioPath');
  var tip = document.getElementById('fioTip');
  var ghost = document.getElementById('fioGhost');
  var num = document.getElementById('fioNum');
  var cards = [].slice.call(stage.querySelectorAll('.fio-card'));

  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var fase = function (p, a, b) { return clamp((p - a) / (b - a), 0, 1); };
  var suave = function (t) { return t * t * (3 - 2 * t); };

  var L = path.getTotalLength();
  path.style.strokeDasharray = L;
  path.style.strokeDashoffset = L;

  var atual = -1, ticking = false;
  function render() {
    ticking = false;
    var r = stage.getBoundingClientRect();
    var p = clamp(-r.top / (r.height - innerHeight), 0, 1);

    // trilho anda na horizontal
    var desloc = Math.max(0, track.scrollWidth - innerWidth);
    var t = suave(fase(p, 0.06, 0.96));
    track.style.transform = 'translateX(' + (-desloc * t) + 'px)';

    // fio se desenha + faísca na ponta
    var d = fase(p, 0.04, 0.97);
    path.style.strokeDashoffset = L * (1 - d);
    var pt = path.getPointAtLength(L * d);
    tip.setAttribute('cx', pt.x); tip.setAttribute('cy', pt.y);

    // estação ativa: card com centro mais perto do centro da tela
    var meio = innerWidth / 2, melhor = 0, menor = Infinity;
    cards.forEach(function (c, i) {
      var cr = c.getBoundingClientRect();
      var dist = Math.abs(cr.left + cr.width / 2 - meio);
      if (dist < menor) { menor = dist; melhor = i; }
    });
    cards.forEach(function (c, i) { c.classList.toggle('on', i === melhor); });

    if (melhor !== atual) {
      atual = melhor;
      var label = '0' + (melhor + 1);
      ghost.textContent = label;
      num.textContent = label;
      if (ghost.animate) ghost.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        { duration: 450, easing: 'ease-out' }
      );
    }
  }

  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(render); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  render();
})();

// ============ Intro: limpa o overlay depois da cortina ============
(function () {
  var intro = document.getElementById('intro');
  if (!intro) return;
  setTimeout(function () { if (intro.parentNode) intro.parentNode.removeChild(intro); }, 1200);
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

// ============ A Máquina: laptop expande até a tela engolir o viewport ============
(function () {
  var stage = document.querySelector('.maq-stage');
  if (!stage) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var bg = document.getElementById('maqBg');
  var grid = document.getElementById('maqGrid');
  var head = document.getElementById('maqHead');
  var laptop = document.getElementById('maqLaptop');
  var view = document.getElementById('maqView');
  var chips = [document.getElementById('mChip1'), document.getElementById('mChip2'), document.getElementById('mChip3')];

  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var fase = function (p, a, b) { return clamp((p - a) / (b - a), 0, 1); };
  var suave = function (t) { return t * t * (3 - 2 * t); };

  var ticking = false;
  function render() {
    ticking = false;
    var r = stage.getBoundingClientRect();
    var p = clamp(-r.top / (r.height - innerHeight), 0, 1);
    // "p" fica em 0 durante toda a entrada da secao (so anda quando o
    // sticky trava). pIn cobre a entrada: 0 com o topo da secao na base
    // da tela, 1 quando ela termina de entrar.
    var pIn = clamp((innerHeight - r.top) / innerHeight, 0, 1);
    var mobile = window.innerWidth < 700;

    // fundo índigo + malha acendem durante a propria entrada
    var tbg = suave(fase(pIn, 0.1, 0.6));
    bg.style.opacity = tbg;
    grid.style.opacity = tbg * 0.9;

    // mesma cena da secao do primeiro notebook: o laptop so ASSENTA
    // (nasce de baixo e cresce de leve) junto com a entrada da secao --
    // sem zoom pra engolir o viewport, que era o que cortava a tela e
    // exigia meia pagina de scroll pra acontecer
    var t1 = suave(pIn);
    var nasc = mobile ? 44 : 90;
    laptop.style.transform = 'translateY(' + (nasc - nasc * t1) + 'px) scale(' + (0.9 + 0.1 * t1) + ')';

    // tags entram juntas, logo abaixo do notebook, durante a entrada
    // (como a legenda da 1a cena) -- nao ha mais fullscreen pra
    // sequenciar uma por uma em cima
    var tc = suave(fase(pIn, 0.6, 1));
    chips.forEach(function (c, i) {
      c.style.opacity = String(tc);
      c.style.transform = 'translateY(' + (16 - 16 * tc) + 'px)';
    });
  }

  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(render); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  render();
})();

// ============ Entrada em cascata: .is-in quando a seção entra na tela ============
// dispara com o topo da seção cruzando 80% do viewport — a anterior ainda
// está terminando e os elementos já vão aparecendo, um após o outro (os
// delays escalonados ficam no CSS). Uma vez só; não re-esconde na volta.
(function () {
  var stages = [].slice.call(document.querySelectorAll('.lap-stage, .maq-stage'));
  if (!stages.length) return;
  if (reduce || !('IntersectionObserver' in window)) {
    stages.forEach(function (s) { s.classList.add('is-in'); });
    return;
  }
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { threshold: 0, rootMargin: '0px 0px -20% 0px' });
  stages.forEach(function (s) { io.observe(s); });
})();

/* ---------- vídeo preguiçoso: só baixa quando a seção chega perto da tela ---------- */
(function () {
  var vids = [].slice.call(document.querySelectorAll('[data-lazyvideo]'));
  if (!vids.length) return;
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function liga(v) {
    if (v.dataset.ligado) return;
    v.dataset.ligado = '1';
    v.muted = true;         // iOS: a propriedade (não só o atributo) precisa estar true na hora do play()
    v.addEventListener('loadeddata', function () {
      v.classList.add('pronto');
      if (!reduz && v.play) v.play().catch(function () {});
    });
    v.addEventListener('error', function () { v.remove(); }, true);   // falhou: o mock em CSS reaparece
    v.src = v.dataset.src;
    v.load();
  }

  // iOS às vezes rejeita o play() sem gesto (ex.: modo economia de
  // energia) e o vídeo fica congelado no 1º frame. Retoma no próximo
  // toque/scroll e também num tique de 1s, porque a rejeição pode
  // acontecer depois — o arquivo é grande e o play() real vem tarde.
  function retomar() {
    if (reduz) return;
    vids.forEach(function (v) {
      if (!v.dataset.ligado || !v.paused || !v.isConnected) return;
      var r = v.getBoundingClientRect();
      if (r.bottom > 0 && r.top < innerHeight && v.play) { v.muted = true; v.play().catch(function () {}); }
    });
  }
  // NAO no evento de scroll: rodava dezenas de vezes por segundo fazendo
  // getBoundingClientRect + play() em cada video -- travava a rolagem e
  // derrubava a aba no iOS (a pagina "recarregava do nada"). Um toque e
  // algumas tentativas espacadas bastam.
  window.addEventListener('touchstart', retomar, { passive: true });
  var tentativas = 0;
  var tique = setInterval(function () {
    retomar();
    if (++tentativas >= 8 ||
        vids.every(function (v) { return !v.isConnected || (v.dataset.ligado && !v.paused); })) {
      clearInterval(tique);
    }
  }, 1500);

  if (!('IntersectionObserver' in window)) { vids.forEach(liga); return; }

  // carrega um pouco antes de aparecer, pra não engasgar na entrada
  var ioCarga = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { liga(e.target); ioCarga.unobserve(e.target); } });
  }, { rootMargin: '1200px 0px' });   // antecedencia suficiente pra bufferizar sem competir com a dobra

  // só toca enquanto está visível
  var ioPlay = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      var v = e.target;
      if (e.isIntersecting && !reduz) { if (v.play) v.play().catch(function () {}); }
      else if (v.pause) { v.pause(); }
    });
  }, { threshold: 0 });   // a cena do laptop escala e desloca no scroll:
                          // qualquer limiar acima de 0 faz o vídeo pausar no meio da animação

  vids.forEach(function (v) { ioCarga.observe(v); ioPlay.observe(v); });
})();

// ============ Portfolio no mobile: a pagina rola dentro do frame ============
// No desktop isso e o :hover. No touch nao existe hover, entao a tira anda
// conforme a pessoa rola a pagina -- amarrado a posicao, nao um timer.
(function () {
  if (reduce) return;
  if (!window.matchMedia('(max-width:1020px)').matches) return;
  var cards = [].slice.call(document.querySelectorAll('.site-card'));
  if (!cards.length) return;

  var alvos = cards.map(function (c) {
    return { janela: c.querySelector('.ws-view'), tira: c.querySelector('.ws-scroll'), card: c };
  }).filter(function (a) { return a.janela && a.tira; });
  if (!alvos.length) return;

  var ticking = false;
  function render() {
    ticking = false;
    alvos.forEach(function (a) {
      var r = a.card.getBoundingClientRect();
      if (r.bottom < -200 || r.top > innerHeight + 200) return;   // fora de cena: nao mexe
      var alcance = a.tira.offsetHeight - a.janela.offsetHeight;
      if (alcance <= 0) return;                                   // imagem ainda nao carregou
      // 0 = topo do card na base da tela, 1 = base do card no topo da tela
      var prog = (innerHeight - r.top) / (innerHeight + r.height);
      prog = Math.max(0, Math.min(1, prog));
      a.tira.style.transform = 'translateY(-' + (alcance * prog) + 'px)';
    });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(render); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  window.addEventListener('load', render);
  render();
})();

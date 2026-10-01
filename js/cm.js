/* Dr. Cassiano Machado · LP próstata aumentada / HoLEP
   WhatsApp único (com os sintomas marcados na mensagem), cabeçalho,
   entradas, ilustração anatômica em canvas conduzida pela rolagem
   (próstata crescendo / HoLEP desobstruindo), critérios e carrosséis. */
(function(){
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, r){ return (r || document).querySelector(s); }
  function $$(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function limita(v, a, b){ return Math.max(a, Math.min(b, v)); }
  function suave(v){ v = limita(v, 0, 1); return v * v * (3 - 2 * v); }

  /* ---- WhatsApp ---- */
  var numero = document.body.getAttribute('data-whats');
  var tocou = false;
  function linkWhats(){
    /* só leva os sintomas para a mensagem se a pessoa marcou com o dedo (não os da animação) */
    var marcados = (tocou ? $$('[data-sintomas] button[aria-pressed="true"] .s-t') : []).map(function(s){
      return '- ' + s.textContent.replace(/[\s;?.]+$/, '');
    });
    var msg = 'Olá! Vim pela página do Dr. Cassiano Machado e gostaria de agendar uma avaliação.';
    if (marcados.length) msg += '\n\nSintomas que tenho percebido:\n' + marcados.join('\n');
    return 'https://wa.me/' + numero + '?text=' + encodeURIComponent(msg);
  }
  $$('[data-whats-link]').forEach(function(a){
    a.target = '_blank'; a.rel = 'noopener'; a.href = linkWhats();
    a.addEventListener('click', function(){ a.href = linkWhats(); });
  });

  /* ---- sintomas ---- */
  var sint = $('[data-sintomas]');
  if (sint) $$('button', sint).forEach(function(b){
    b.addEventListener('click', function(){
      if (!tocou){ tocou = true; $$('button', sint).forEach(function(o){ if (o !== b) o.setAttribute('aria-pressed', 'false'); }); }
      b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      sint.classList.toggle('marcou', !!$('button[aria-pressed="true"]', sint));
    });
  });

  /* ---- entradas ---- */
  if (reduz || !('IntersectionObserver' in window)){
    $$('.rv').forEach(function(e){ e.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function(itens){
      itens.forEach(function(i){
        if (!i.isIntersecting) return;
        var el = i.target, irmas = $$(':scope > .rv', el.parentNode);
        el.style.transitionDelay = Math.min(Math.max(irmas.indexOf(el), 0) * 90, 450) + 'ms';
        el.classList.add('in'); io.unobserve(el);
      });
    }, {rootMargin:'0px 0px -8% 0px'});
    $$('.rv').forEach(function(e){ io.observe(e); });
  }

  /* ================================================================
     Ilustração anatômica (canvas, coordenadas 400x500)
     bexiga de vidro no alto, uretra descendo, próstata em volta dela.
     "obstrui": com a rolagem a próstata cresce, a uretra estreita e o
                fluxo de urina rareia.
     "holep":   a fibra entra pela uretra, o laser varre o tecido por
                dentro (fica só a cápsula) e o fluxo volta forte.
     ================================================================ */
  var W = 400, H = 500, PY = 322;
  function cx(y){ return 200 + 4 * Math.sin((y - 236) / 64); }

  function Anat(cv){
    var modo = cv.getAttribute('data-anat');
    var ctx = cv.getContext('2d');
    var camada = document.createElement('canvas'), cctx = camada.getContext('2d');
    var esc = 1, alvo = reduz ? 1 : 0, p = alvo, t = 0, parts = [], faiscas = [], acum = 0, visivel = false, ligado = false;

    function medir(){
      var r = cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = camada.width = Math.max(1, Math.round(r.width * dpr));
      cv.height = camada.height = Math.max(1, Math.round(r.width * 1.25 * dpr));
      esc = cv.width / W;
    }

    /* estado a partir do progresso */
    function estado(){
      var e = {g:0, k:0, cav:0, fibra:0, ponta:520, laser:0};
      if (modo === 'obstrui'){
        e.g = e.k = suave((p - .06) / .84);
      } else {
        var entra = suave(p / .16), r = suave((p - .18) / .6), sai = suave((p - .84) / .14);
        e.k = 1; e.cav = r; e.g = 1 - r;
        e.fibra = entra * (1 - sai);
        e.ponta = sai > 0 ? 300 + sai * 230 : (r > 0 ? PY + 34 - 52 * r : 520 - entra * 164);
        e.laser = (p > .18 && p < .8) ? Math.sin(limita((p - .18) / .62, 0, 1) * Math.PI) : 0;
      }
      return e;
    }

    function meiaLargura(y, e){
      var hw = 8.5 * (1 - .8 * e.g * Math.exp(-Math.pow((y - PY) / 40, 2)));
      hw += e.cav * 13 * Math.exp(-Math.pow((y - PY) / 50, 2));   /* depois do HoLEP a passagem fica ampla */
      if (y < 250) hw += (250 - y) * .3;                            /* colo da bexiga */
      return hw;
    }

    function bexigaPath(c){
      c.beginPath();
      c.moveTo(184, 232);
      c.bezierCurveTo(120, 215, 78, 175, 86, 128);
      c.bezierCurveTo(94, 78, 145, 52, 200, 52);
      c.bezierCurveTo(255, 52, 306, 78, 314, 128);
      c.bezierCurveTo(322, 175, 280, 215, 216, 232);
      c.closePath();
    }

    /* próstata: um órgão só, em forma de castanha (base larga junto à bexiga, ápice embaixo) */
    function orgaoPath(c, w, h){
      c.beginPath();
      c.moveTo(200 - w, PY - h * .55);
      c.bezierCurveTo(200 - w * 1.18, PY + h * .25, 200 - w * .5, PY + h, 200, PY + h);
      c.bezierCurveTo(200 + w * .5, PY + h, 200 + w * 1.18, PY + h * .25, 200 + w, PY - h * .55);
      c.bezierCurveTo(200 + w * .72, PY - h * 1.04, 200 - w * .72, PY - h * 1.04, 200 - w, PY - h * .55);
      c.closePath();
    }
    function lobos(c, e){
      var k = e.k, w = 50 + 34 * k, h = 52 + 26 * k;
      var gr = c.createRadialGradient(200 - w * .3, PY - h * .45, 4, 200, PY, Math.max(w, h) * 1.15);
      gr.addColorStop(0, 'rgba(232,243,252,.7)');
      gr.addColorStop(.4, 'rgba(150,190,224,.46)');
      gr.addColorStop(1, 'rgba(43,74,105,.34)');
      c.fillStyle = gr; orgaoPath(c, w, h); c.fill();
      /* fibras: contornos concêntricos finos */
      c.lineWidth = .8;
      for (var i = 1; i <= 5; i++){
        var f = 1 - i * .15;
        c.save(); c.translate(200, PY + i * 1.6); c.scale(f, f); c.translate(-200, -PY);
        c.strokeStyle = 'rgba(232,243,252,' + (.16 - i * .02).toFixed(3) + ')';
        orgaoPath(c, w, h); c.stroke(); c.restore();
      }
      c.strokeStyle = 'rgba(232,243,252,.62)'; c.lineWidth = 1.4;
      orgaoPath(c, w, h); c.stroke();
      return {rx:w, ry:h};
    }

    function desenha(){
      var e = estado();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.setTransform(esc, 0, 0, esc, 0, 0);

      /* ondas de ultrassom em volta da próstata */
      for (var i = 0; i < 3; i++){
        var rr = 60 + ((t * 18 + i * 50) % 150);
        ctx.strokeStyle = 'rgba(103,159,202,' + (.16 * (1 - (rr - 60) / 150)).toFixed(3) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(200, PY, rr, rr * .9, 0, 0, Math.PI * 2); ctx.stroke();
      }

      /* bexiga: vidro, líquido com onda, aro de luz (um pouco menor, ancorada no colo) */
      ctx.save();
      ctx.translate(200, 236); ctx.scale(.84, .84); ctx.translate(-200, -236);
      ctx.save();
      bexigaPath(ctx);
      var gb = ctx.createRadialGradient(165, 100, 10, 200, 140, 150);
      gb.addColorStop(0, 'rgba(214,231,245,.20)'); gb.addColorStop(1, 'rgba(103,159,202,.06)');
      ctx.fillStyle = gb; ctx.fill();
      ctx.clip();
      var nivel = 122 + (modo === 'obstrui' ? -14 * e.g : -14 * (1 - e.cav));
      ctx.beginPath(); ctx.moveTo(60, 260);
      for (var x = 60; x <= 340; x += 6) ctx.lineTo(x, nivel + Math.sin(x / 26 + t * 1.6) * 2.4 + Math.sin(x / 11 - t * 2.1) * .8);
      ctx.lineTo(340, 260); ctx.closePath();
      var gl = ctx.createLinearGradient(0, nivel, 0, 240);
      gl.addColorStop(0, 'rgba(156,195,227,.42)'); gl.addColorStop(1, 'rgba(62,99,135,.55)');
      ctx.fillStyle = gl; ctx.fill();
      ctx.strokeStyle = 'rgba(214,236,252,.55)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.restore();
      ctx.save();
      bexigaPath(ctx);
      ctx.shadowColor = 'rgba(156,195,227,.7)'; ctx.shadowBlur = 10;
      ctx.strokeStyle = 'rgba(226,239,250,.7)'; ctx.lineWidth = 1.4; ctx.stroke();
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.ellipse(200, 128, 96, 66, 0, Math.PI * 1.12, Math.PI * 1.38); ctx.stroke();
      ctx.restore();

      /* próstata (numa camada própria para recortar a cavidade do HoLEP) */
      cctx.setTransform(1, 0, 0, 1, 0, 0);
      cctx.clearRect(0, 0, camada.width, camada.height);
      cctx.setTransform(esc, 0, 0, esc, 0, 0);
      cctx.globalCompositeOperation = 'source-over';
      var dim = lobos(cctx, e);
      var crx = 0, cry = 0;
      if (e.cav > 0){
        /* o laser esvazia o órgão de dentro para fora: fica só a cápsula */
        var fc = .14 + .8 * e.cav;
        crx = dim.rx * fc; cry = dim.ry * fc;
        cctx.save();
        cctx.globalCompositeOperation = 'destination-out';
        cctx.shadowColor = '#000'; cctx.shadowBlur = 6 * esc;
        cctx.translate(200, PY); cctx.scale(fc, fc); cctx.translate(-200, -PY);
        cctx.fillStyle = '#000'; orgaoPath(cctx, dim.rx, dim.ry); cctx.fill();
        cctx.restore();
      }
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.shadowColor = 'rgba(103,159,202,.55)'; ctx.shadowBlur = 24 * esc;
      ctx.drawImage(camada, 0, 0);
      ctx.restore();
      ctx.setTransform(esc, 0, 0, esc, 0, 0);
      if (e.cav > 0){
        /* borda da cavidade, acesa enquanto o laser trabalha */
        ctx.save();
        ctx.strokeStyle = 'rgba(214,240,255,' + (.2 + .6 * e.laser).toFixed(3) + ')';
        ctx.shadowColor = 'rgba(160,225,255,.9)'; ctx.shadowBlur = 6 + 14 * e.laser; ctx.lineWidth = 1.2 / fc;
        ctx.translate(200, PY); ctx.scale(fc, fc); ctx.translate(-200, -PY);
        orgaoPath(ctx, dim.rx, dim.ry); ctx.stroke();
        ctx.restore();
      }

      /* uretra: canal escuro com paredes de luz */
      var esq = [], dir = [];
      for (var y = 232; y <= 520; y += 4){
        var hw = meiaLargura(y, e), c0 = cx(y);
        esq.push([c0 - hw, y]); dir.push([c0 + hw, y]);
      }
      ctx.beginPath(); ctx.moveTo(esq[0][0], esq[0][1]);
      esq.forEach(function(q){ ctx.lineTo(q[0], q[1]); });
      for (var j = dir.length - 1; j >= 0; j--) ctx.lineTo(dir[j][0], dir[j][1]);
      ctx.closePath();
      var gu = ctx.createLinearGradient(0, 232, 0, 520);
      gu.addColorStop(0, 'rgba(62,99,135,.55)'); gu.addColorStop(1, 'rgba(5,13,23,.0)');
      ctx.fillStyle = 'rgba(5,13,23,.82)'; ctx.fill();
      ctx.fillStyle = gu; ctx.fill();
      ctx.save();
      ctx.shadowColor = 'rgba(156,195,227,.8)'; ctx.shadowBlur = 8; ctx.lineWidth = 1.2;
      var gp = ctx.createLinearGradient(0, 232, 0, 500);
      gp.addColorStop(0, 'rgba(226,239,250,.85)'); gp.addColorStop(1, 'rgba(226,239,250,0)');
      ctx.strokeStyle = gp;
      [esq, dir].forEach(function(lado){
        ctx.beginPath(); ctx.moveTo(lado[0][0], lado[0][1]);
        lado.forEach(function(q){ ctx.lineTo(q[0], q[1]); }); ctx.stroke();
      });
      ctx.restore();

      /* fluxo de urina: gotas de luz descendo pela uretra */
      var fluxo = modo === 'obstrui' ? 1 - .86 * e.g : .14 + .86 * e.cav;
      acum += fluxo * .8;
      while (acum >= 1){ acum--; parts.push({y:236, u:Math.random() * 2 - 1, j:Math.random()}); }
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      [[3.2, .10], [1.4, .22], [.45, .5]].forEach(function(cam){
        ctx.beginPath();
        for (var yy = 240; yy <= 512; yy += 4){
          var lw = Math.min(meiaLargura(yy, e), 12);
          ctx.lineTo(cx(yy) + Math.sin(yy / 9 - t * 9) * .6 * fluxo, yy);
        }
        var gj = ctx.createLinearGradient(0, 240, 0, 512);
        gj.addColorStop(0, 'rgba(170,215,245,' + (cam[1] * (.25 + fluxo)).toFixed(3) + ')');
        gj.addColorStop(.85, 'rgba(170,215,245,' + (cam[1] * (.25 + fluxo)).toFixed(3) + ')');
        gj.addColorStop(1, 'rgba(170,215,245,0)');
        ctx.strokeStyle = gj; ctx.lineWidth = Math.max(1, cam[0] * (1 + 4 * fluxo) * (1 - .55 * e.g)); ctx.stroke();
      });
      parts = parts.filter(function(q){
        var hw = meiaLargura(q.y, e);
        q.y += Math.min((.7 + 2.3 * fluxo) * Math.sqrt(8.5 / Math.max(hw, 1.5)), 6);
        if (q.y > 515) return false;
        var x = cx(q.y) + q.u * Math.max(Math.min(hw, 14) - 2.5, .3) * .8;
        var a = (q.y > 470 ? (515 - q.y) / 45 : 1) * .7, raio = .8 + .8 * fluxo + q.j * .5;
        var gd = ctx.createRadialGradient(x, q.y, 0, x, q.y, raio * 3.2);
        gd.addColorStop(0, 'rgba(236,246,255,' + (.95 * a).toFixed(3) + ')');
        gd.addColorStop(.35, 'rgba(156,205,240,' + (.5 * a).toFixed(3) + ')');
        gd.addColorStop(1, 'rgba(103,159,202,0)');
        ctx.fillStyle = gd; ctx.beginPath(); ctx.arc(x, q.y, raio * 3.2, 0, Math.PI * 2); ctx.fill();
        return true;
      });
      ctx.restore();

      /* HoLEP: fibra, feixe e faíscas */
      if (modo === 'holep' && e.fibra > .01){
        var tx = cx(e.ponta);
        ctx.save();
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'rgba(200,215,230,.5)'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(cx(520), 520); ctx.lineTo(tx, e.ponta); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(cx(520), 520); ctx.lineTo(tx, e.ponta); ctx.stroke();
        ctx.globalCompositeOperation = 'lighter';
        var brilhoPonta = .35 + .65 * e.laser;
        var gt = ctx.createRadialGradient(tx, e.ponta, 0, tx, e.ponta, 18 + 16 * e.laser);
        gt.addColorStop(0, 'rgba(255,255,255,' + brilhoPonta.toFixed(3) + ')');
        gt.addColorStop(.3, 'rgba(140,225,255,' + (.6 * brilhoPonta).toFixed(3) + ')');
        gt.addColorStop(1, 'rgba(103,159,202,0)');
        ctx.fillStyle = gt; ctx.beginPath(); ctx.arc(tx, e.ponta, 34, 0, Math.PI * 2); ctx.fill();
        if (e.laser > .05 && crx > 0){
          var ang = -Math.PI / 2 + 1.3 * Math.sin(t * 2.4);
          var ex = 200 + Math.cos(ang) * crx, ey = PY + Math.sin(ang) * cry;
          ctx.strokeStyle = 'rgba(170,235,255,' + (.35 * e.laser).toFixed(3) + ')'; ctx.lineWidth = 6;
          ctx.beginPath(); ctx.moveTo(tx, e.ponta); ctx.lineTo(ex, ey); ctx.stroke();
          ctx.strokeStyle = 'rgba(255,255,255,' + (.95 * e.laser).toFixed(3) + ')'; ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.moveTo(tx, e.ponta); ctx.lineTo(ex, ey); ctx.stroke();
          var gi = ctx.createRadialGradient(ex, ey, 0, ex, ey, 16);
          gi.addColorStop(0, 'rgba(255,255,255,' + e.laser.toFixed(3) + ')'); gi.addColorStop(1, 'rgba(140,225,255,0)');
          ctx.fillStyle = gi; ctx.beginPath(); ctx.arc(ex, ey, 16, 0, Math.PI * 2); ctx.fill();
          if (!reduz) for (var s = 0; s < 2; s++){
            var av = ang + Math.PI + (Math.random() - .5) * 1.6, vel = .6 + Math.random() * 1.6;
            faiscas.push({x:ex, y:ey, vx:Math.cos(av) * vel, vy:Math.sin(av) * vel, v:1});
          }
        }
        ctx.restore();
      }
      if (faiscas.length){
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        faiscas = faiscas.filter(function(f){
          f.x += f.vx; f.y += f.vy; f.vy += .02; f.v -= .03;
          if (f.v <= 0) return false;
          ctx.fillStyle = 'rgba(200,240,255,' + (f.v * .9).toFixed(3) + ')';
          ctx.beginPath(); ctx.arc(f.x, f.y, .5 + f.v * 1.2, 0, Math.PI * 2); ctx.fill();
          return true;
        });
        ctx.restore();
      }
    }

    function quadro(){
      if (!visivel){ ligado = false; return; }
      p += (alvo - p) * .07;
      if (Math.abs(alvo - p) < .0005) p = alvo;
      t += 1 / 60;
      desenha();
      requestAnimationFrame(quadro);
    }
    function liga(){ if (!ligado){ ligado = true; requestAnimationFrame(quadro); } }

    medir(); desenha();
    window.addEventListener('resize', function(){ medir(); desenha(); });
    if ('IntersectionObserver' in window){
      new IntersectionObserver(function(it){
        visivel = it[0].isIntersecting; if (visivel) liga();
      }, {rootMargin:'100px 0px'}).observe(cv);
    } else { visivel = true; liga(); }

    return {
      cv: cv, modo: modo,
      define: function(v){ alvo = reduz ? 1 : limita(v, 0, 1); }
    };
  }

  var anats = $$('canvas[data-anat]').map(Anat);
  var holep = $('[data-holep]');

  /* ---- tudo o que depende da rolagem, num quadro só ---- */
  var topo = $('#topo'), barra = $('#barra'), hero = $('.hero'), final = $('#agendar');
  var criterios = $$('[data-criterios] li');
  var pend = false;

  function quadro(){
    pend = false;
    var y = window.scrollY, vh = window.innerHeight;
    topo.classList.toggle('solido', y > 30);
    var f = final.getBoundingClientRect();
    barra.classList.toggle('visivel', y > hero.offsetHeight * .7 && f.top > vh * .6);

    anats.forEach(function(a){
      var r = a.cv.getBoundingClientRect(), v;
      if (a.modo === 'holep' && window.innerWidth > 980 && holep){
        var h = holep.getBoundingClientRect();
        v = (vh * .55 - h.top) / Math.max(h.height - vh * .3, 1);
      } else {
        v = (vh * .92 - (r.top + r.height / 2)) / (vh * .55);
      }
      a.define(v);
    });

    /* celular: os sintomas do hero vão sendo marcados com a rolagem, e desmarcam na volta */
    if (sint && !tocou && window.innerWidth <= 768){
      var algum = false;
      $$('button', sint).forEach(function(b){
        var on = reduz || b.getBoundingClientRect().top + b.offsetHeight / 2 < vh * .62;
        b.setAttribute('aria-pressed', on ? 'true' : 'false'); if (on) algum = true;
      });
      sint.classList.toggle('marcou', algum);
    }

    criterios.forEach(function(li){ li.classList.toggle('on', reduz || li.getBoundingClientRect().top < vh * .72); });
  }
  window.addEventListener('scroll', function(){ if (!pend){ pend = true; requestAnimationFrame(quadro); } }, {passive:true});
  window.addEventListener('resize', quadro);
  quadro();

  /* ---- carrosséis em loop: rolam sozinhos, param no toque/mouse, dá pra arrastar ----
     O conteúdo é duplicado (cópia escondida de leitor de tela) e o scroll volta
     meia volta quando passa da metade, então o loop não tem emenda. */
  $$('[data-trilho]').forEach(function(t){
    $$(':scope > *', t).forEach(function(el){ var c = el.cloneNode(true); c.setAttribute('aria-hidden', 'true'); t.appendChild(c); });
    var parado = false, volta = 0, x0 = 0, s0 = 0, puxando = false, pos = 0;
    function metade(){ return t.scrollWidth / 2; }
    function passo(){
      if (!parado && !puxando && !reduz){
        pos += .45; if (pos >= metade()) pos -= metade();
        t.scrollLeft = pos;
      } else pos = t.scrollLeft;
      requestAnimationFrame(passo);
    }
    t.addEventListener('mouseenter', function(){ parado = true; });
    t.addEventListener('mouseleave', function(){ parado = false; });
    t.addEventListener('touchstart', function(){ parado = true; clearTimeout(volta); }, {passive:true});
    t.addEventListener('touchend', function(){ volta = setTimeout(function(){ parado = false; }, 2500); });
    t.addEventListener('scroll', function(){
      if (t.scrollLeft >= metade()){ t.scrollLeft -= metade(); }
      else if (t.scrollLeft <= 0 && (parado || puxando)){ t.scrollLeft += metade(); }
    }, {passive:true});
    t.addEventListener('pointerdown', function(e){
      if (e.pointerType !== 'mouse') return;
      puxando = true; x0 = e.clientX; s0 = t.scrollLeft;
      t.classList.add('arrastando'); t.setPointerCapture(e.pointerId);
    });
    t.addEventListener('pointermove', function(e){ if (puxando) t.scrollLeft = s0 - (e.clientX - x0); });
    ['pointerup','pointercancel'].forEach(function(ev){
      t.addEventListener(ev, function(){ puxando = false; t.classList.remove('arrastando'); });
    });
    requestAnimationFrame(passo);
  });
})();

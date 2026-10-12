/* Home nova da Fluxxo: menu, entrada dos elementos, UTMs e a ilustração da abertura. */
(function () {
  "use strict";

  var calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var WHATS = "5585992657146";
  var MENSAGENS = {
    menu: "Oi! Vim pelo site da Fluxxo e quero conversar sobre um projeto.",
    hero: "Oi! Vi o site da Fluxxo e quero conversar com a equipe sobre um projeto.",
    como: "Oi! Vi como a Fluxxo trabalha e quero conversar sobre um projeto.",
    digital: "Oi! Vim pelo site da Fluxxo e quero solicitar um projeto digital (site ou sistema).",
    atendimento: "Oi! Vim pelo site da Fluxxo e quero falar com a equipe.",
    proposta: "Oi! Quero uma proposta de design e conteúdo recorrente (social media) com a Fluxxo.",
    orcamento: "Oi! Quero um orçamento de produção criativa para uma entrega específica.",
    projeto: "Oi! Quero apresentar meu projeto de site ou sistema para a Fluxxo.",
    rodape: "Oi! Vim pelo rodapé do site da Fluxxo e quero conversar sobre um projeto."
  };

  /* ---------- Fundo: grade de vidro do tamanho da janela ---------- */
  var vidro = document.getElementById("vidro");
  function montarVidro() {
    if (!vidro) return;
    var passo = 52; // 46 px + 6 de espaço
    var cols = Math.max(1, Math.floor((vidro.clientWidth - 6) / passo));
    var linhas = Math.max(1, Math.floor((vidro.clientHeight - 6) / passo));
    var total = cols * linhas;
    if (vidro.childElementCount === total) return;
    vidro.innerHTML = new Array(total + 1).join("<i></i>");
  }

  /* ---------- UTMs: guarda na sessão e leva para os links internos ---------- */
  var CHAVES = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"];
  function lerUtms() {
    var guardadas = {};
    try { guardadas = JSON.parse(sessionStorage.getItem("fx_utm") || "{}") || {}; } catch (e) { guardadas = {}; }
    var url = new URLSearchParams(location.search);
    var achou = false;
    CHAVES.forEach(function (k) { if (url.get(k)) { guardadas[k] = url.get(k); achou = true; } });
    if (achou) { try { sessionStorage.setItem("fx_utm", JSON.stringify(guardadas)); } catch (e) {} }
    return guardadas;
  }
  var utms = lerUtms();
  function levarUtms() {
    var lista = Object.keys(utms);
    if (!lista.length) return;
    document.querySelectorAll("a[href]").forEach(function (a) {
      var href = a.getAttribute("href");
      if (!href || href.charAt(0) === "#" || /^(mailto|tel|javascript):/i.test(href)) return;
      var u;
      try { u = new URL(href, location.href); } catch (e) { return; }
      if (u.origin !== location.origin) return;
      lista.forEach(function (k) { if (!u.searchParams.has(k)) u.searchParams.set(k, utms[k]); });
      a.setAttribute("href", u.pathname + u.search + u.hash);
    });
  }

  /* ---------- WhatsApp: uma mensagem por origem ---------- */
  document.querySelectorAll("[data-wa]").forEach(function (a) {
    var texto = MENSAGENS[a.getAttribute("data-wa")] || MENSAGENS.menu;
    a.href = "https://wa.me/" + WHATS + "?text=" + encodeURIComponent(texto);
  });

  /* ---------- Menu: compacta ao rolar ---------- */
  var nav = document.getElementById("nav");
  var compacto = false;
  var claras = document.querySelectorAll("[data-claro]");
  function aoRolar() {
    var agora = window.scrollY > 28;
    if (agora !== compacto) { compacto = agora; nav.classList.toggle("compacto", agora); }
    // o menu fica claro quando está em cima de uma seção branca
    var meio = 42, claro = false;
    claras.forEach(function (sec) { var r = sec.getBoundingClientRect(); if (r.top <= meio && r.bottom >= meio) claro = true; });
    nav.classList.toggle("claro", claro);
  }
  window.addEventListener("scroll", aoRolar, { passive: true });
  aoRolar();

  /* ---------- Submenu de serviços ---------- */
  var caixa = document.getElementById("menuServicos");
  var botao = caixa && caixa.querySelector("button");
  var tempoFechar = null;
  function abrirMenu(abrir) {
    clearTimeout(tempoFechar);
    caixa.classList.toggle("aberto", abrir);
    botao.setAttribute("aria-expanded", abrir ? "true" : "false");
  }
  if (caixa) {
    var hoverReal = window.matchMedia("(hover: hover)").matches;
    if (hoverReal) {
      // pequena espera antes de abrir, para não piscar quando o mouse só passa por cima
      var tempoAbrir = null;
      caixa.addEventListener("mouseenter", function () { clearTimeout(tempoFechar); tempoAbrir = setTimeout(function () { abrirMenu(true); }, 90); });
      caixa.addEventListener("mouseleave", function () { clearTimeout(tempoAbrir); });
      caixa.addEventListener("mouseleave", function () { tempoFechar = setTimeout(function () { abrirMenu(false); }, 220); });
    }
    botao.addEventListener("click", function () { abrirMenu(!caixa.classList.contains("aberto")); });
    document.addEventListener("click", function (e) { if (!caixa.contains(e.target)) abrirMenu(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && caixa.classList.contains("aberto")) { abrirMenu(false); botao.focus(); } });
    caixa.querySelectorAll(".mega a").forEach(function (a) { a.addEventListener("click", function () { abrirMenu(false); }); });
  }

  /* ---------- Gaveta do celular ---------- */
  var burger = document.getElementById("burger");
  var gaveta = document.getElementById("gaveta");
  function gavetaAberta(abrir) {
    burger.setAttribute("aria-expanded", abrir ? "true" : "false");
    burger.setAttribute("aria-label", abrir ? "Fechar menu" : "Abrir menu");
    document.documentElement.style.overflow = abrir ? "hidden" : "";
    document.getElementById("nav").classList.toggle("menu-aberto", abrir);
    // o círculo nasce do centro do botão
    var r = burger.getBoundingClientRect();
    gaveta.style.setProperty("--gx", (r.left + r.width / 2) + "px");
    gaveta.style.setProperty("--gy", (r.top + r.height / 2) + "px");
    if (abrir) {
      gaveta.hidden = false;
      void gaveta.offsetWidth;
      gaveta.classList.add("aberta");
    } else {
      gaveta.classList.remove("aberta");
      setTimeout(function () { if (!gaveta.classList.contains("aberta")) gaveta.hidden = true; }, calmo ? 0 : 640);
    }
  }
  if (burger && gaveta) {
    burger.addEventListener("click", function () { gavetaAberta(burger.getAttribute("aria-expanded") !== "true"); });
    gaveta.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { gavetaAberta(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") gavetaAberta(false); });
    window.matchMedia("(min-width: 961px)").addEventListener("change", function (m) { if (m.matches) gavetaAberta(false); });
  }

  /* ---------- Entrada: anima ao entrar e reanima quando a pessoa volta ---------- */
  var revelar = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !calmo) {
    var io = new IntersectionObserver(function (itens) {
      itens.forEach(function (it) {
        if (it.isIntersecting) it.target.classList.add("in");
        else if (it.boundingClientRect.top > 0 || it.boundingClientRect.bottom < 0) it.target.classList.remove("in");
      });
    }, { threshold: 0.12 });
    revelar.forEach(function (el) { io.observe(el); });
  } else {
    revelar.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Ilustração da abertura: tela do Fluxxo Desk ---------- */
  // Fluxo contínuo: um pedido chega, vira demanda, anda pelo quadro, o cliente aprova.
  // Nada some de uma vez: os cartões antigos descem e saem por baixo da tela, cortados.
  var heroVis = document.getElementById("heroVis");
  var tela = document.getElementById("tela");
  var quadro = document.getElementById("quadro");
  var avisoPedido = document.getElementById("avisoPedido");
  var avisoAprovar = document.getElementById("avisoAprovar");
  var pedidoTxt = document.getElementById("pedidoTxt");
  var aprovarItem = document.getElementById("aprovarItem");
  var aprovarSt = document.getElementById("aprovarSt");
  var aprovar = document.getElementById("aprovar");
  var cursor = document.getElementById("cursor");

  var VISTA = 700; // largura da tela que precisa aparecer antes do corte

  function escalar() {
    if (!heroVis) return;
    var largura = window.innerWidth - heroVis.getBoundingClientRect().left;
    var s = Math.max(0.56, Math.min(1, largura / VISTA));
    if (window.innerWidth > 960) s = Math.min(1, Math.max(0.78, largura / VISTA));
    else s = s * 0.6; // no celular a tela fica 40% menor para o texto subir
    heroVis.style.setProperty("--s", s.toFixed(4));
  }

  var PEDIDOS = [
    { tag: "Social", titulo: "Carrossel · 8 posts", texto: "Precisamos de 8 posts para outubro." },
    { tag: "Vídeo", titulo: "Reels do evento", texto: "Precisamos editar 4 reels do evento." },
    { tag: "Site", titulo: "Landing page da campanha", texto: "Precisamos de uma landing page para a campanha." },
    { tag: "Sistema", titulo: "Painel de vendas", texto: "Precisamos de um painel com as vendas da semana." }
  ];
  var BASE = [
    [["Design", "Thumbnail do YouTube", "18 out"], ["Social", "Post de lançamento", "20 out"]],
    [["Vídeo", "Vídeo institucional", "16 out"], ["Sistema", "Cadastro de clientes", "22 out"]],
    [["Site", "Site institucional", "15 out"]],
    [["Design", "Identidade do evento", "14 out"]],
    [["Vídeo", "Reels de bastidores", "12 out"], ["Social", "Stories da semana", "11 out"]],
    [["Site", "Portfólio", "08 out"], ["Design", "Apresentação comercial", "07 out"]]
  ];

  var colunas = [[], [], [], [], [], []];
  function cartao(tag, titulo, data) {
    var el = document.createElement("div");
    el.className = "tk";
    el.innerHTML = "<em></em><b></b><span class=\"barra\"><i></i></span><span class=\"pe\"><span></span><i></i></span>" +
      "<svg class=\"ok\" viewBox=\"0 0 24 24\"><path d=\"M20 6 9 17l-5-5\"/></svg>";
    el.querySelector("em").textContent = tag;
    el.querySelector("b").textContent = titulo;
    el.querySelector(".pe span").textContent = data;
    quadro.appendChild(el);
    return el;
  }
  function posicionar() {
    colunas.forEach(function (lista, c) {
      lista.forEach(function (el, r) { el.style.setProperty("--c", c); el.style.setProperty("--r", r); });
      // o que passou da 5ª linha já saiu por baixo da tela: tira do quadro
      lista.splice(5).forEach(function (el) { setTimeout(function () { el.remove(); }, 900); });
    });
  }
  // entra no topo da coluna e empurra os outros para baixo
  function colocar(el, c) {
    colunas.forEach(function (lista) { var k = lista.indexOf(el); if (k > -1) lista.splice(k, 1); });
    colunas[c].unshift(el);
    posicionar();
  }
  function montarBase() {
    BASE.forEach(function (lista, c) {
      lista.forEach(function (d) {
        var el = cartao(d[0], d[1], d[2]);
        if (c >= 4) el.classList.add("ok-on");
        colunas[c].push(el);
      });
    });
    posicionar();
  }

  function alvo(el) {
    var x = 0, y = 0, n = el;
    while (n && n !== tela) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    return { x: x + el.offsetWidth * 0.55, y: y + el.offsetHeight * 0.55 };
  }

  var timers = [];
  var rodando = false;
  var vez = 0;
  function depois(ms, fn) { timers.push(setTimeout(fn, ms)); }
  function parar() { timers.forEach(clearTimeout); timers = []; rodando = false; }

  function digitar(texto) {
    var k = 0;
    (function passo() {
      pedidoTxt.textContent = texto.slice(0, ++k);
      if (k < texto.length) timers.push(setTimeout(passo, 30));
    })();
  }
  function dataDaVez() { var d = 21 + (vez % 8); return d + " out"; }

  function ciclo() {
    rodando = true;
    var p = PEDIDOS[vez % PEDIDOS.length];
    var el;

    // 1. o pedido sobe; o aviso de aprovação anterior desce
    avisoAprovar.classList.remove("on");
    cursor.classList.remove("visivel");
    pedidoTxt.textContent = "";
    depois(250, function () { avisoPedido.classList.add("on"); });
    depois(800, function () { digitar(p.texto); });
    // 2. vira demanda em A fazer
    depois(800 + p.texto.length * 30 + 500, function () {
      el = cartao(p.tag, p.titulo, dataDaVez());
      el.style.setProperty("--c", 0);
      el.style.setProperty("--r", 0);
      el.classList.add("nasce", "foco");
      colocar(el, 0);
    });
    var t = 800 + p.texto.length * 30 + 500;
    // 3. em andamento, com a barra de produção
    depois(t + 1300, function () { avisoPedido.classList.remove("on"); colocar(el, 1); el.classList.add("produzindo"); });
    // 4. em revisão
    depois(t + 3500, function () { el.classList.remove("produzindo"); colocar(el, 2); });
    // 5. aguardando cliente: o portal pede aprovação
    depois(t + 4800, function () {
      colocar(el, 3);
      aprovarItem.textContent = p.titulo;
      aprovarSt.className = "st";
      aprovarSt.textContent = "Para aprovar";
      aprovar.classList.remove("feito");
      avisoAprovar.classList.add("on");
    });
    depois(t + 5700, function () {
      var a = alvo(aprovar);
      cursor.classList.add("visivel");
      cursor.style.setProperty("--x", a.x + "px");
      cursor.style.setProperty("--y", a.y + "px");
    });
    depois(t + 6500, function () {
      cursor.classList.remove("clica"); void cursor.offsetWidth; cursor.classList.add("clica");
      aprovar.classList.add("clique", "feito");
      setTimeout(function () { aprovar.classList.remove("clique"); }, 160);
      aprovarSt.className = "st aprovado";
      aprovarSt.textContent = "Aprovado";
    });
    // 6. aprovado: segue para a coluna seguinte, que a tela corta
    depois(t + 7200, function () {
      colocar(el, 4);
      el.classList.remove("foco");
      el.classList.add("ok-on");
      cursor.style.setProperty("--x", "560px");
      cursor.style.setProperty("--y", "620px");
    });
    depois(t + 7600, function () { cursor.classList.remove("visivel"); });
    // a demanda aprovada mais antiga vira entregue
    depois(t + 8200, function () { var velho = colunas[4][colunas[4].length - 1]; if (velho && velho !== el) colocar(velho, 5); });
    depois(t + 9000, function () { vez++; if (rodando) ciclo(); });
  }

  function estadoParado() {
    var p = PEDIDOS[0];
    var el = cartao(p.tag, p.titulo, "21 out");
    el.classList.add("foco");
    colocar(el, 3);
    aprovarItem.textContent = p.titulo;
    avisoAprovar.classList.add("on");
  }

  if (tela && quadro) {
    escalar();
    montarBase();
    if (calmo || !("IntersectionObserver" in window)) {
      estadoParado();
    } else {
      new IntersectionObserver(function (itens) {
        itens.forEach(function (it) {
          // fora da tela, pausa; ao voltar, continua de onde estava
          if (it.isIntersecting && !rodando) ciclo();
          else if (!it.isIntersecting && rodando) parar();
        });
      }, { threshold: 0.2 }).observe(heroVis);
    }
  }

  /* ---------- Serviços: ilustrações só tocam com a seção na tela ---------- */
  var servicos = document.querySelector(".servicos");
  // Social Media: a legenda se escreve, o cursor agenda e o post entra na grade do perfil
  var visSocial = document.getElementById("visSocial");
  var pubSlides = document.getElementById("pubSlides");
  var pubPontos = visSocial ? visSocial.querySelectorAll(".pub-pontos i") : [];
  var pubLeg = document.getElementById("pubLeg");
  var pubBtn = document.getElementById("pubBtn");
  var pfGrade = document.getElementById("pfGrade");
  var pfPosts = document.getElementById("pfPosts");
  var mesProntos = document.getElementById("mesProntos");
  var mesBarra = document.getElementById("mesBarra");
  var curSocial = document.getElementById("curSocial");
  var LEGENDAS = [
    "5 dúvidas que todo cliente pergunta antes de fechar. Arrasta para o lado.",
    "Os bastidores de uma entrega, do briefing ao arquivo final.",
    "3 erros que fazem o site perder contato. O segundo é o mais comum."
  ];
  var sTimers = [], slideTimer = null, slide = 0, volta = 0, posts = 128, prontos = 9;
  function sDepois(ms, fn) { sTimers.push(setTimeout(fn, ms)); }
  function posGrade() {
    if (!pfGrade) return;
    Array.prototype.forEach.call(pfGrade.children, function (el, k) {
      el.style.setProperty("--col", k % 3);
      el.style.setProperty("--lin", Math.floor(k / 3));
    });
  }
  function mostrarSlide(n) {
    slide = n;
    pubSlides.style.setProperty("--sl", n);
    pubPontos.forEach(function (p, k) { p.classList.toggle("on", k === n); });
  }
  function cicloSocial() {
    var texto = LEGENDAS[volta % LEGENDAS.length];
    pubBtn.classList.remove("feito");
    pubLeg.textContent = "";
    var k = 0;
    sDepois(300, function passo() {
      pubLeg.textContent = texto.slice(0, ++k);
      if (k < texto.length) sTimers.push(setTimeout(passo, 26));
    });
    var t = 300 + texto.length * 26;
    sDepois(t + 300, function () {
      var b = pubBtn, x = b.offsetLeft + b.offsetWidth * 0.55, y = b.offsetTop + b.offsetHeight * 0.6, n = b.offsetParent;
      while (n && n !== visSocial) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
      curSocial.style.setProperty("--cx", x + "px");
      curSocial.style.setProperty("--cy", y + "px");
    });
    sDepois(t + 1100, function () { pubBtn.classList.add("feito"); });
    sDepois(t + 1500, function () {
      // o post agendado entra no começo da grade e empurra os outros
      var novo = document.createElement("i");
      novo.className = "gt novo";
      pfGrade.insertBefore(novo, pfGrade.firstChild);
      var velho = pfGrade.querySelector(".gt.novo:not(:first-child)");
      if (velho) velho.classList.remove("novo");
      while (pfGrade.children.length > 12) pfGrade.removeChild(pfGrade.lastChild);
      posGrade();
      pfPosts.textContent = ++posts;
      prontos = prontos >= 12 ? 9 : prontos + 1;
      mesProntos.textContent = prontos;
      mesBarra.style.width = (prontos / 12 * 100) + "%";
    });
    sDepois(t + 2200, function () { curSocial.style.setProperty("--cx", "300px"); curSocial.style.setProperty("--cy", "250px"); });
    sDepois(t + 4200, function () { volta++; cicloSocial(); });
  }
  // Design: a peça passa por Feed, Stories e Quadrado e é aprovada no fim da volta
  var peca = document.getElementById("peca");
  var fmtAbas = document.querySelectorAll(".fmt-abas span");
  var FORMATOS = ["f-feed", "f-stories", "f-quad"];
  var fmt = 0, fmtTimer = null;
  function trocarFormato() {
    fmt = (fmt + 1) % 4; // 0..2 formatos, 3 = aprovado no quadrado
    var f = Math.min(fmt, 2);
    FORMATOS.forEach(function (c) { peca.classList.remove(c); });
    peca.classList.add(FORMATOS[f]);
    peca.classList.toggle("aprovada", fmt === 3);
    fmtAbas.forEach(function (a, k) { a.classList.toggle("on", k === f); });
  }
  function tocarServicos(sim) {
    if (servicos) servicos.classList.toggle("rodando", sim);
    sTimers.forEach(clearTimeout); sTimers = [];
    clearInterval(slideTimer);
    clearInterval(fmtTimer);
    if (sim && peca && !calmo) fmtTimer = setInterval(trocarFormato, 1800);
    if (sim && visSocial && !calmo) {
      slideTimer = setInterval(function () { mostrarSlide((slide + 1) % 5); }, 1400);
      cicloSocial();
    }
  }
  if (visSocial) {
    posGrade();
    if (calmo) { pubLeg.textContent = LEGENDAS[0]; }
  }
  // largura da linha do tempo do vídeo, para a agulha ir até o fim
  document.querySelectorAll(".ed").forEach(function (ed) { ed.style.setProperty("--ed-w", ed.clientWidth + "px"); });
  if (servicos && "IntersectionObserver" in window) {
    new IntersectionObserver(function (itens) {
      itens.forEach(function (it) { tocarServicos(it.isIntersecting); });
    }, { threshold: 0.05 }).observe(servicos);
  } else {
    tocarServicos(true);
  }

  /* ---------- Como funciona: uma luz percorre as etapas sozinha (nada clicável) ---------- */
  var passos = document.getElementById("passos");
  if (passos) {
    var ps = passos.querySelectorAll(".ps");
    var luz = passos.querySelector(".trilho-luz");
    var psAtual = -1, psTimer = null;
    function psIr(n) {
      psAtual = n;
      ps.forEach(function (el, k) {
        el.classList.toggle("ativo", k === n);
        el.classList.toggle("passou", k < n);
      });
      // a luz vai até o ponto da etapa: na horizontal 0/33/66/100%; na vertical (celular) mede a posição real
      var trilho = luz.parentNode;
      var ate = Math.max(n, 0) / (ps.length - 1) * 100;
      if (trilho.offsetHeight > trilho.offsetWidth) {
        var alvoY = ps[Math.max(n, 0)].offsetTop + 28 - trilho.offsetTop;
        ate = Math.max(0, Math.min(100, alvoY / trilho.offsetHeight * 100));
      }
      luz.style.setProperty("--ate", ate + "%");
    }
    function psCiclo() {
      clearTimeout(psTimer);
      var prox = psAtual + 1;
      if (prox >= ps.length) {
        // terminou a volta: tudo concluído por um instante e recomeça
        ps.forEach(function (el) { el.classList.remove("ativo"); el.classList.add("passou"); });
        psTimer = setTimeout(function () { psAtual = -1; luz.style.transition = "none"; psIr(0); void luz.offsetWidth; luz.style.transition = ""; psTimer = setTimeout(psCiclo, 3400); }, 2200);
        return;
      }
      psIr(prox);
      psTimer = setTimeout(psCiclo, 3400);
    }
    if (calmo) {
      psIr(ps.length - 1);
    } else if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (itens) {
        itens.forEach(function (it) {
          if (it.isIntersecting && psAtual === -1) psCiclo();
          else if (it.isIntersecting && !psTimer) psCiclo();
          else if (!it.isIntersecting) { clearTimeout(psTimer); psTimer = null; }
        });
      }, { threshold: 0.3 }).observe(passos);
    }
  }

  /* ---------- Produção de conteúdo: o palco só anima com a seção na tela ---------- */
  var conteudo = document.getElementById("conteudo");
  if (conteudo && "IntersectionObserver" in window) {
    new IntersectionObserver(function (itens) {
      itens.forEach(function (it) { conteudo.classList.toggle("rodando", it.isIntersecting); });
    }, { threshold: 0.05 }).observe(conteudo);
  }

  /* ---------- Sites e sistemas: as ilustrações só animam com a seção na tela ---------- */
  var digital = document.getElementById("sites-sistemas");
  var nucleo = document.getElementById("dgNucleo");
  var dgLiga = digital && digital.querySelector(".dg-liga");
  var gotas = digital ? Array.prototype.map.call(digital.querySelectorAll(".dg-gota"), function (g, k) {
    var via = document.getElementById(g.getAttribute("data-via"));
    return { el: g, via: via, tam: via.getTotalLength(), fase: k / 2, ant: 1 };
  }) : [];
  var VIAGEM = 2600, carga = 0, dgRaf = 0, dgIni = 0, dgPausa = 0, cheioTimer = null;
  // cada ponto que chega carrega o núcleo; na 4ª carga ele acende e volta devagar
  function alimentar() {
    if (nucleo.classList.contains("cheio")) return;
    carga = Math.min(carga + 1, 4);
    nucleo.style.setProperty("--carga", carga);
    if (dgLiga) dgLiga.setAttribute("data-carga", carga);
    nucleo.classList.remove("pulso"); void nucleo.offsetWidth; nucleo.classList.add("pulso");
    if (carga === 4) {
      cheioTimer = setTimeout(function () {
        nucleo.classList.add("cheio");
        cheioTimer = setTimeout(function () {
          nucleo.classList.remove("cheio");
          carga = 0; nucleo.style.setProperty("--carga", 0);
          if (dgLiga) dgLiga.setAttribute("data-carga", 0);
        }, 1500);
      }, 250);
    }
  }
  function quadroDg(agora) {
    var t = (agora - dgIni) / VIAGEM;
    gotas.forEach(function (g) {
      var f = t - g.fase;
      if (f < 0) return;
      var p = f % 1;
      if (p < g.ant) { if (g.ant !== 1) alimentar(); }
      g.ant = p;
      var pt = g.via.getPointAtLength(p * g.tam);
      g.el.setAttribute("transform", "translate(" + pt.x + " " + pt.y + ")");
      g.el.classList.add("vai");
    });
    dgRaf = requestAnimationFrame(quadroDg);
  }
  function tocarDigital(sim) {
    digital.classList.toggle("rodando", sim);
    if (!nucleo || calmo) return;
    if (sim && !dgRaf) { dgIni = performance.now() - dgPausa; dgRaf = requestAnimationFrame(quadroDg); }
    else if (!sim && dgRaf) { cancelAnimationFrame(dgRaf); dgRaf = 0; dgPausa = performance.now() - dgIni; }
  }
  if (digital && "IntersectionObserver" in window) {
    new IntersectionObserver(function (itens) {
      itens.forEach(function (it) { tocarDigital(it.isIntersecting); });
    }, { threshold: 0.05 }).observe(digital);
  }

  /* ---------- Atendimento: conversa roteirizada que não para (as antigas sobem e saem por cima) ---------- */
  var atLista = document.getElementById("atLista");
  var atAnd = document.getElementById("atAnd");
  var OK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  var ROTEIRO = [
    { de: "cli", html: "Quero que os clientes consigam falar com a gente mais rápido pelo celular." },
    { de: "eq", html: "Dá para deixar um botão do WhatsApp fixo no canto da tela. Olha como fica:" },
    { de: "eq", html: '<span class="at-previa"><i class="at-cel"></i><span><b>Prévia da página</b><small>Versão para celular</small></span></span>' },
    { de: "cli", html: "Gostei. Dá para deixar o botão um pouco maior?" },
    { de: "eq", html: "Claro. Ajuste anotado, te envio a nova versão para aprovar.<br><span class=\"at-nota\">" + OK + "Revisão 1 de 2</span>", etapa: true },
    { de: "cli", html: '<span class="at-anexo"><i></i><span>referencia.png</span></span>Vi esse site e gostei das cores. Serve de ideia?' },
    { de: "eq", html: "Serve sim. Vamos usar como referência na página de serviços.", etapa: true }
  ];
  var atPasso = 0, atEtapa = 0, atTimer = null, atRodando = false, atPend = null;
  // guarda o próximo passo, para retomar do mesmo ponto quando a seção volta à tela
  function atAgendar(fn, ms) { atPend = fn; atTimer = setTimeout(function () { atPend = null; fn(); }, ms); }
  function atEtapas() {
    atAnd.querySelectorAll("li").forEach(function (li, k) {
      li.classList.toggle("feito", k < atEtapa);
      li.classList.toggle("agora", k === atEtapa);
    });
  }
  function atNova(de, html) {
    var m = document.createElement("div");
    m.className = "at-m " + de;
    m.innerHTML = '<div><div class="at-b">' + (de === "eq" ? '<span class="at-quem-m">Fluxxo</span>' : "") + html + "</div></div>";
    atLista.appendChild(m);
    void m.offsetHeight;
    m.classList.add("in");
    // as que já subiram para fora da caixa saem da lista
    while (atLista.children.length > 7) atLista.removeChild(atLista.firstChild);
    return m;
  }
  function atProx() {
    if (!atRodando) return;
    var r = ROTEIRO[atPasso];
    atPasso = (atPasso + 1) % ROTEIRO.length;
    if (r.de === "eq") {
      var dig = atNova("eq", '<span class="at-dig"><i></i><i></i><i></i></span>');
      atAgendar(function () {
        dig.querySelector(".at-b").innerHTML = '<span class="at-quem-m">Fluxxo</span>' + r.html;
        if (r.etapa) { atEtapa = (atEtapa + 1) % 4; atEtapas(); }
        atAgendar(atProx, 2200);
      }, 1100);
    } else {
      atNova("cli", r.html);
      atAgendar(atProx, 2000);
    }
  }
  if (atLista) {
    // começa com a conversa já em andamento, para a caixa nunca aparecer vazia
    ROTEIRO.slice(0, 3).forEach(function (r) { atNova(r.de, r.html).classList.add("in"); });
    atPasso = 3; atEtapa = 1; atEtapas();
    var atendSec = document.getElementById("atendimento");
    if (!calmo && "IntersectionObserver" in window) {
      new IntersectionObserver(function (itens) {
        itens.forEach(function (it) {
          if (it.isIntersecting && !atRodando) { atRodando = true; atAgendar(atPend || atProx, 900); }
          else if (!it.isIntersecting && atRodando) { atRodando = false; clearTimeout(atTimer); }
        });
      }, { threshold: 0.2 }).observe(atendSec);
    }
  }

  /* ---------- Portfólio: as faixas só correm com a seção na tela ---------- */
  var port = document.getElementById("portfolio");
  if (port && "IntersectionObserver" in window) {
    new IntersectionObserver(function (itens) {
      itens.forEach(function (it) { port.classList.toggle("rodando", it.isIntersecting); });
    }, { threshold: 0.05 }).observe(port);
  }

  /* ---------- Trabalhos por área: abas laterais (clicáveis); vídeos só tocam na aba aberta e com a seção na tela ---------- */
  var trab = document.getElementById("trabalhos");
  if (trab) {
    var tbAbas = trab.querySelectorAll(".tb-aba");
    var tbVisivel = false, tbAtual = "social";
    var sisVid = document.getElementById("tbSisVid");
    var sisUrl = document.getElementById("tbSisUrl");
    var sisBts = trab.querySelectorAll(".tb-sis-b");
    var sisN = "1";
    function carregar(v) { if (!v.getAttribute("src") && v.dataset.src) v.setAttribute("src", v.dataset.src); }
    function tocarVideos() {
      trab.querySelectorAll("video").forEach(function (v) {
        var painel = v.closest(".tb-painel");
        var deve = tbVisivel && !calmo && painel && !painel.hidden;
        if (deve) { carregar(v); var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
        else if (!v.paused) v.pause();
      });
    }
    function abrir(cat, foco) {
      tbAtual = cat;
      tbAbas.forEach(function (a) {
        var sim = a.getAttribute("data-aba") === cat;
        a.classList.toggle("on", sim);
        a.setAttribute("aria-selected", sim ? "true" : "false");
        a.tabIndex = sim ? 0 : -1;
        var p = document.getElementById(a.getAttribute("aria-controls"));
        p.hidden = !sim;
        if (sim && foco) a.focus({ preventScroll: true });
        // no celular as abas viram uma fileira que rola para o lado: traz a escolhida para a vista
        var fila = a.parentNode;
        if (sim && fila.scrollWidth > fila.clientWidth) fila.scrollTo({ left: a.offsetLeft - 16, behavior: calmo ? "auto" : "smooth" });
      });
      tocarVideos();
    }
    tbAbas.forEach(function (a, k) {
      a.tabIndex = k === 0 ? 0 : -1;
      a.addEventListener("click", function () { abrir(a.getAttribute("data-aba")); });
      // setas para cima/baixo (e para os lados no celular) andam entre as abas
      a.addEventListener("keydown", function (e) {
        var d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (!d) return;
        e.preventDefault();
        var n = (k + d + tbAbas.length) % tbAbas.length;
        abrir(tbAbas[n].getAttribute("data-aba"), true);
      });
    });
    // sistemas: um vídeo por vez; quando termina, passa para o outro
    function sistema(n) {
      sisN = n;
      sisBts.forEach(function (b) { b.classList.toggle("on", b.getAttribute("data-vid") === n); b.style.setProperty("--p", "0%"); });
      var b = trab.querySelector('.tb-sis-b[data-vid="' + n + '"]');
      sisUrl.textContent = b.getAttribute("data-url");
      sisVid.setAttribute("poster", "img/home/port/sistema-" + n + ".webp");
      sisVid.dataset.src = "video/home/sistema-" + n + ".mp4";
      sisVid.removeAttribute("src");
      sisVid.load();
      tocarVideos();
    }
    if (sisVid) {
      sisBts.forEach(function (b) { b.addEventListener("click", function () { sistema(b.getAttribute("data-vid")); }); });
      sisVid.addEventListener("timeupdate", function () {
        if (!sisVid.duration) return;
        var b = trab.querySelector('.tb-sis-b[data-vid="' + sisN + '"]');
        b.style.setProperty("--p", (sisVid.currentTime / sisVid.duration * 100) + "%");
      });
      sisVid.addEventListener("ended", function () { sistema(sisN === "1" ? "2" : "1"); });
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (itens) {
        itens.forEach(function (it) { tbVisivel = it.isIntersecting; trab.classList.toggle("rodando", tbVisivel); tocarVideos(); });
      }, { threshold: 0.15 }).observe(trab);
    }
  }

  /* ---------- Contratação: a borda de luz só gira com a seção na tela ---------- */
  var planos = document.getElementById("contratacao");
  if (planos && "IntersectionObserver" in window) {
    new IntersectionObserver(function (itens) {
      itens.forEach(function (it) { planos.classList.toggle("rodando", it.isIntersecting); });
    }, { threshold: 0.05 }).observe(planos);
  }

  var tempoTela;
  window.addEventListener("resize", function () {
    clearTimeout(tempoTela);
    tempoTela = setTimeout(function () { montarVidro(); escalar(); document.querySelectorAll(".ed").forEach(function (ed) { ed.style.setProperty("--ed-w", ed.clientWidth + "px"); }); }, 120);
  });
  montarVidro();
  levarUtms();
})();

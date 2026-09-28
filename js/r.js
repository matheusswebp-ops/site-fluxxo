/* Métricas do fluxxo.io — rastreador próprio, leve e sem cookie.
 *
 * O que ele guarda no navegador: um id aleatório do visitante e a sessão
 * atual (30 min parada encerra). Nada de nome, e-mail ou IP.
 * O que ele manda para /api/r: página aberta, saída da página (tempo ativo e
 * rolagem máxima), cliques de contato (WhatsApp, telefone, e-mail, CTA,
 * formulário), velocidade da página e um batimento a cada 15 s enquanto a
 * aba está visível — é isso que faz o "Agora" do painel ser ao vivo.
 */
(function () {
  "use strict";
  var FIM_DE_SESSAO = 30 * 60 * 1000;
  var BATIMENTO = 15000;
  var ENDERECO = "/api/r";

  var guardar = {
    ler: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    por: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  // Quem está logado no painel (o dono) não é contado.
  if (guardar.ler("fx_nao_contar") === "1") return;
  if (navigator.webdriver) return;
  if (document.visibilityState === "prerender") return;
  if (!window.fetch || !window.JSON) return;

  function novoId() {
    var a = new Uint8Array(12);
    (window.crypto || window.msCrypto).getRandomValues(a);
    var s = "";
    for (var i = 0; i < a.length; i++) s += ("0" + a[i].toString(16)).slice(-2);
    return s;
  }

  var visitante = guardar.ler("fx_v");
  if (!visitante || !/^[A-Za-z0-9_-]{8,40}$/.test(visitante)) { visitante = novoId(); guardar.por("fx_v", visitante); }

  var agora = Date.now();
  var sessao = null, sessaoNova = false;
  try { sessao = JSON.parse(guardar.ler("fx_s") || "null"); } catch (e) { sessao = null; }
  if (!sessao || !sessao.id || agora - (sessao.ultimo || 0) > FIM_DE_SESSAO) {
    sessao = { id: novoId(), ultimo: agora };
    sessaoNova = true;
  }
  function tocarSessao() { sessao.ultimo = Date.now(); guardar.por("fx_s", JSON.stringify(sessao)); }
  tocarSessao();

  var caminho = (location.pathname || "/").replace(/\.html$/, "").slice(0, 300) || "/";
  var titulo = (document.title || "").slice(0, 200);

  var fila = [];
  var ctx = null;
  var pv = novoId();   // esta visualização de página

  // A saída da página anterior que o navegador pode ter descartado ao trocar
  // de página (acontece, sobretudo no iPhone): a página seguinte da MESMA
  // sessão reenvia. O banco ignora se ela já tinha chegado (mesmo `pv`).
  try {
    var pend = JSON.parse(guardar.ler("fx_pend") || "null");
    if (pend && pend.s === sessao.id && pend.pv && pend.p) {
      fila.push({ t: "saida", p: pend.p, d: { tempo: pend.tempo || 0, rolagem: pend.rolagem || 0, pv: pend.pv } });
    }
  } catch (e) {}
  guardar.por("fx_pend", "");
  if (sessaoNova) {
    var q = new URLSearchParams(location.search);
    var ref = "";
    try { if (document.referrer && new URL(document.referrer).host !== location.host) ref = document.referrer; } catch (e) {}
    ctx = { entrada: caminho, ref: ref };
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(function (k) {
      var v = q.get(k); if (v) ctx[k] = v.slice(0, 120);
    });
  }

  // ── Tempo ativo e rolagem ─────────────────────────────────────────────
  var ativoDesde = document.visibilityState === "visible" ? Date.now() : 0;
  var ativoAcumulado = 0;   // desde o último batimento
  var ativoNaPagina = 0;    // total nesta página
  var rolagem = 0;
  function medirRolagem() {
    var alto = Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0);
    var visto = (window.scrollY || window.pageYOffset || 0) + window.innerHeight;
    var pct = alto > 0 ? Math.min(100, Math.round((visto / alto) * 100)) : 100;
    if (pct > rolagem) rolagem = pct;
  }
  function fecharAtivo() {
    if (ativoDesde) {
      var d = Math.round((Date.now() - ativoDesde) / 1000);
      ativoAcumulado += d; ativoNaPagina += d; ativoDesde = 0;
    }
  }

  // ── Envio ─────────────────────────────────────────────────────────────
  function lote(extra) {
    var l = { v: visitante, s: sessao.id, ev: fila.splice(0, 30), ativo: Math.min(ativoAcumulado, 120) };
    ativoAcumulado = 0;
    if (ctx) { l.ctx = ctx; ctx = null; }
    if (extra) for (var k in extra) l[k] = extra[k];
    return JSON.stringify(l);
  }
  function enviar(saindo) {
    var corpo = lote();
    tocarSessao();
    if (saindo && navigator.sendBeacon) {
      try { if (navigator.sendBeacon(ENDERECO, new Blob([corpo], { type: "application/json" }))) return; } catch (e) {}
    }
    try {
      fetch(ENDERECO, { method: "POST", body: corpo, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(function () {});
    } catch (e) {}
  }

  // ── Velocidade (onde o navegador mede: Chrome, Edge, Android) ─────────
  var vitais = {};
  try {
    new PerformanceObserver(function (l) {
      var e = l.getEntries(); var u = e[e.length - 1]; if (u) vitais.lcp = Math.round(u.startTime);
    }).observe({ type: "largest-contentful-paint", buffered: true });
  } catch (e) {}
  try {
    var cls = 0;
    new PerformanceObserver(function (l) {
      l.getEntries().forEach(function (e) { if (!e.hadRecentInput) cls += e.value; });
      vitais.cls = Math.round(cls * 1000) / 1000;
    }).observe({ type: "layout-shift", buffered: true });
  } catch (e) {}
  try {
    new PerformanceObserver(function (l) {
      l.getEntries().forEach(function (e) { if (e.interactionId && (!vitais.inp || e.duration > vitais.inp)) vitais.inp = Math.round(e.duration); });
    }).observe({ type: "event", buffered: true, durationThreshold: 40 });
  } catch (e) {}
  var vitaisEnviados = false;

  // ── Página aberta ─────────────────────────────────────────────────────
  fila.push({ t: "pagina", p: caminho, ti: titulo });
  medirRolagem();
  enviar(false);

  // Liga as gravações do Clarity ao mesmo visitante e sessão.
  if (typeof window.clarity === "function") {
    try { window.clarity("identify", visitante, sessao.id, caminho); } catch (e) {}
  }

  // ── Batimento ─────────────────────────────────────────────────────────
  function guardarPendente() {
    guardar.por("fx_pend", JSON.stringify({ s: sessao.id, pv: pv, p: caminho, tempo: ativoNaPagina, rolagem: rolagem }));
  }
  guardarPendente();
  setInterval(function () {
    if (document.visibilityState !== "visible") return;
    fecharAtivo(); ativoDesde = Date.now();
    guardarPendente();
    enviar(false);
  }, BATIMENTO);

  var rolagemGuardada = 0;
  window.addEventListener("scroll", function () {
    medirRolagem();
    if (rolagem - rolagemGuardada >= 10) { rolagemGuardada = rolagem; fecharAtivo(); if (document.visibilityState === "visible") ativoDesde = Date.now(); guardarPendente(); }
  }, { passive: true });

  // ── Saída da página (ou a aba escondida) ──────────────────────────────
  var saiu = false;
  function sair() {
    fecharAtivo();
    medirRolagem();
    if (!vitaisEnviados && (vitais.lcp || vitais.inp || vitais.cls !== undefined)) {
      fila.push({ t: "vitais", p: caminho, d: vitais }); vitaisEnviados = true;
    }
    guardarPendente();
    fila.push({ t: "saida", p: caminho, d: { tempo: ativoNaPagina, rolagem: rolagem, fim: true, pv: pv } });
    saiu = true;
    enviar(true);
  }
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") { sair(); }
    else {
      ativoDesde = Date.now();
      if (saiu) { saiu = false; enviar(false); }   // voltou para a aba: segue a sessão
    }
  });
  window.addEventListener("pagehide", function () { if (!saiu) sair(); });

  // ── Cliques de contato ────────────────────────────────────────────────
  document.addEventListener("click", function (ev) {
    var el = ev.target && ev.target.closest ? ev.target.closest("a,button") : null;
    if (!el) return;
    var href = (el.getAttribute("href") || "").toLowerCase();
    var alvo = null;
    if (/wa\.me|whatsapp\.com|api\.whatsapp/.test(href)) alvo = "whatsapp";
    else if (href.indexOf("tel:") === 0) alvo = "telefone";
    else if (href.indexOf("mailto:") === 0) alvo = "email";
    else if (el.hasAttribute("data-cta") || /(^|\s)(btn|cta|button)[\w-]*/i.test(el.className || "")) alvo = "cta";
    if (!alvo) return;
    var texto = (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60);
    fila.push({ t: "clique", p: caminho, d: { alvo: alvo, texto: texto } });
    enviar(true);
  }, true);
  document.addEventListener("submit", function () {
    fila.push({ t: "clique", p: caminho, d: { alvo: "formulario" } });
    enviar(true);
  }, true);
})();

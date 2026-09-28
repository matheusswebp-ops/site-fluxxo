/* Painel de métricas do fluxxo.io (fluxxo.io/painel).
 *
 * Lê do Supabase do Fluxxo OS com a sessão de quem entrou em /login. A RLS
 * só libera Dono/Admin da Fluxxo (migrations 0223–0225). Os números vêm
 * agregados pelas RPCs site_resumo / site_blog_rolagem / seo_resumo; o
 * "Agora" lê as sessões vistas no último minuto e escuta o Realtime.
 */
(function () {
  "use strict";
  var sb = window.FX_SB;
  var CLARITY = "https://clarity.microsoft.com/projects/view/xpoicaxxyd/impressions";
  var ONLINE_MS = 60 * 1000;

  // ── utilidades ──────────────────────────────────────────────────────
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  var nf = new Intl.NumberFormat("pt-BR");
  function num(n) { return nf.format(Math.round(Number(n) || 0)); }
  function dec(n) { return (Number(n) || 0).toLocaleString("pt-BR", { maximumFractionDigits: 1 }); }
  function tempo(s) { s = Math.max(0, Math.round(Number(s) || 0)); return s < 60 ? s + "s" : Math.floor(s / 60) + "m " + String(s % 60).padStart(2, "0") + "s"; }
  function tituloCurto(t, p) { t = (t || "").split(/\s[|·–—-]\s/)[0].trim(); return t || p || "/"; }
  function variacao(a, b, inverso) {
    a = Number(a) || 0; b = Number(b) || 0;
    if (!b) return a ? '<em class="sobe">novo</em>' : "";
    var v = Math.round(((a - b) / b) * 100);
    if (!v) return '<em style="color:var(--dim)">=</em>';
    var bom = inverso ? v < 0 : v > 0;
    return '<em class="' + (bom ? "sobe" : "desce") + '">' + (v > 0 ? "▲ " : "▼ ") + Math.abs(v) + "%</em>";
  }
  function toast(t) {
    var el = document.createElement("div"); el.className = "toast"; el.textContent = t;
    document.body.appendChild(el); setTimeout(function () { el.remove(); }, 2600);
  }
  function inicioDeHoje() {
    // Meia-noite em Brasília (UTC−3, sem horário de verão).
    var d = new Date(Date.now() - 3 * 3600e3); d.setUTCHours(0, 0, 0, 0);
    return new Date(d.getTime() + 3 * 3600e3);
  }
  function periodo(dias) {
    var ate = new Date();
    var de = dias === 0 ? inicioDeHoje() : new Date(ate.getTime() - dias * 864e5);
    var tam = ate.getTime() - de.getTime();
    return { de: de, ate: ate, antesDe: new Date(de.getTime() - tam), antesAte: de };
  }
  async function rpc(nome, args) {
    var r = await sb.rpc(nome, args);
    if (r.error) throw r.error;
    return r.data;
  }
  function barras(el, linhas) {
    if (!linhas.length) { el.innerHTML = '<p class="vazio">Sem dados no período.</p>'; return; }
    var m = Math.max.apply(null, linhas.map(function (l) { return l[1]; })) || 1;
    el.innerHTML = linhas.map(function (l) {
      return '<div class="barra-l"><span>' + esc(l[0]) + '</span><div class="t"><i style="width:' + (l[1] / m * 100) + '%;background:' + (l[2] || "var(--roxo)") + '"></i></div><b class="num">' + (l[3] != null ? esc(l[3]) : num(l[1])) + "</b></div>";
    }).join("");
  }
  var CORES_ORIGEM = { instagram: "#ff7aa8", google: "#5b8cff", "google ads": "#8fb0ff", direto: "#9b96ab", whatsapp: "#35d07f", facebook: "#6f8cff", "outros sites": "#f5b544", chatgpt: "#19c37d" };
  var NOME_ORIGEM = { instagram: "Instagram", google: "Google", "google ads": "Google Ads", direto: "Direto", whatsapp: "WhatsApp", facebook: "Facebook", "outros sites": "Outros sites", chatgpt: "ChatGPT", bing: "Bing", linkedin: "LinkedIn", youtube: "YouTube", x: "X", perplexity: "Perplexity" };
  function nomeOrigem(o) { return NOME_ORIGEM[o] || (o ? o.charAt(0).toUpperCase() + o.slice(1) : "Direto"); }
  function tagOrigem(o) { return o === "instagram" ? "ig" : (o === "google" || o === "google ads") ? "gg" : o === "whatsapp" ? "wa" : ""; }

  // ── entrada ─────────────────────────────────────────────────────────
  var dias = 7;
  var abaAtual = "agora";

  async function iniciar() {
    var s = await sb.auth.getSession();
    if (!s.data.session) { location.replace("/login"); return; }
    var email = (s.data.session.user.email || "M");
    $("eu").textContent = email.charAt(0).toUpperCase();
    try {
      await rpc("site_resumo", { de: inicioDeHoje().toISOString(), ate: new Date().toISOString() });
    } catch (e) {
      if (e && (e.code === "42501" || /sem acesso/i.test(e.message || ""))) { $("sem-acesso").hidden = false; return; }
      $("sem-acesso").hidden = false;
      $("sem-acesso").firstElementChild.textContent = "Não deu para carregar o painel agora. Recarregue a página.";
      return;
    }
    $("app").hidden = false;
    ligarAbas();
    carregarAgora();
    ligarAoVivo();
  }

  function ligarAbas() {
    document.querySelectorAll("[data-aba]").forEach(function (b) {
      b.addEventListener("click", function () {
        abaAtual = b.dataset.aba;
        document.querySelectorAll("[data-aba]").forEach(function (x) { x.setAttribute("aria-selected", x === b); });
        document.querySelectorAll(".painel").forEach(function (p) { p.hidden = p.id !== abaAtual; });
        $("periodo").hidden = abaAtual === "agora";
        carregarAba();
      });
    });
    document.querySelectorAll("#periodo button").forEach(function (b) {
      b.addEventListener("click", function () {
        dias = Number(b.dataset.dias);
        document.querySelectorAll("#periodo button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
        carregarAba();
      });
    });
    $("eu").addEventListener("click", function () { $("menu-eu").hidden = !$("menu-eu").hidden; });
    $("sair").addEventListener("click", async function () { await sb.auth.signOut(); location.replace("/login"); });
    $("trocar").addEventListener("click", async function (e) { e.preventDefault(); await sb.auth.signOut(); location.replace("/login"); });
  }
  function carregarAba() {
    if (abaAtual === "agora") carregarAgora();
    else if (abaAtual === "site") carregarSite();
    else if (abaAtual === "blog") carregarBlog();
    else if (abaAtual === "seo") carregarSeo();
  }

  // ═══════════════════ AGORA ═══════════════════
  var ICO = {
    celular: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg>',
    tablet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M11 18h2"/></svg>',
    computador: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
    olho: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z"/></svg>',
    clique: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 9l11 4-5 2-2 5z"/></svg>',
    sai: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><path d="M7 4v16l13-8z"/></svg>'
  };
  var CORES = ["#7c4dff", "#35d07f", "#f5b544", "#5b8cff", "#ff7aa8", "#a99cff"];
  function corDe(id) { var h = 0; for (var i = 0; i < id.length; i++) h = (h + id.charCodeAt(i)) % 997; return CORES[h % CORES.length]; }
  var online = [];

  async function carregarAgora() {
    var limite = new Date(Date.now() - ONLINE_MS).toISOString();
    var [ss, ev, hoje] = await Promise.all([
      sb.from("site_sessoes").select("id,visitante_id,numero_da_visita,inicio,visto_em,entrada,pagina_atual,titulo_atual,origem,utm_source,utm_campaign,aparelho,navegador,sistema,cidade,estado,paginas").gte("visto_em", limite).eq("encerrada", false).order("inicio", { ascending: false }).limit(60),
      sb.from("site_eventos").select("tipo,caminho,titulo,dado,em,sessao:site_sessoes(cidade,estado,origem)").in("tipo", ["pagina", "clique", "saida"]).order("em", { ascending: false }).limit(14),
      rpc("site_resumo", { de: inicioDeHoje().toISOString(), ate: new Date().toISOString() }).catch(function () { return null; })
    ]);
    online = ss.data || [];
    desenharPessoas();
    desenharFeed(ev.data || []);
    if (hoje) {
      var t = hoje.totais || {};
      var wa = (hoje.cliques || []).filter(function (c) { return c.alvo === "whatsapp"; }).reduce(function (s, c) { return s + c.total; }, 0);
      $("hoje").innerHTML =
        '<div><span>Visitantes hoje</span><b class="num">' + num(t.visitantes) + "</b></div>" +
        '<div><span>Páginas vistas hoje</span><b class="num">' + num(t.paginas) + "</b></div>" +
        '<div><span>Cliques no WhatsApp hoje</span><b class="num">' + num(wa) + "</b></div>" +
        '<div><span>Tempo médio hoje</span><b class="num">' + tempo(t.tempo_medio) + "</b></div>";
    }
  }

  function desenharPessoas() {
    $("online").textContent = online.length;
    $("online-sub").textContent = online.length === 1 ? "pessoa navegando neste momento" : "pessoas navegando neste momento";
    var cont = {};
    online.forEach(function (p) { var c = p.pagina_atual || "/"; cont[c] = (cont[c] || 0) + 1; });
    var pares = Object.keys(cont).map(function (k) { return [k, cont[k]]; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 6);
    var m = pares.length ? pares[0][1] : 1;
    $("onde").innerHTML = pares.length ? '<span style="font-size:12px;color:var(--dim)">Onde estão agora</span>' + pares.map(function (p) {
      return '<div class="onde-linha"><code>' + esc(p[0]) + '</code><span class="barra"><i style="width:' + (p[1] / m * 100) + '%"></i></span><b class="num" style="text-align:right;font-weight:500">' + p[1] + "</b></div>";
    }).join("") : "";

    if (!online.length) { $("pessoas").innerHTML = '<div class="card vazio">Ninguém no site neste minuto. Assim que alguém entrar, aparece aqui sozinho.</div>'; return; }
    $("pessoas").innerHTML = online.map(function (p) {
      var cor = corDe(p.visitante_id);
      var local = p.cidade ? p.cidade + (p.estado ? ", " + p.estado : "") : "Local desconhecido";
      var origem = p.utm_campaign ? nomeOrigem(p.origem) + " · " + p.utm_campaign : nomeOrigem(p.origem);
      var volta = p.numero_da_visita > 1 ? '<span class="tag volta">' + p.numero_da_visita + "ª visita</span>" : '<span class="tag nova">1ª visita</span>';
      var seg = Math.round((Date.now() - new Date(p.inicio).getTime()) / 1000);
      return '<article class="pessoa">' +
        '<div class="p-cab"><span class="avatar" style="background:' + cor + '22;color:' + cor + '">' + (ICO[p.aparelho] || ICO.computador) + "</span>" +
        "<div><b>" + esc(local) + "</b><span>" + esc((p.sistema || "?") + " · " + (p.navegador || "?")) + "</span></div>" +
        '<span class="tempo num" data-inicio="' + esc(p.inicio) + '">' + tempo(seg) + "</span></div>" +
        '<div class="p-pagina"><span class="ponto"></span><code>' + esc(tituloCurto(p.titulo_atual, p.pagina_atual)) + "</code></div>" +
        '<div class="tags"><span class="tag ' + tagOrigem(p.origem) + '">' + esc(origem) + "</span>" + volta + '<span class="tag num">' + p.paginas + (p.paginas === 1 ? " página" : " páginas") + "</span></div>" +
        '<div class="p-rodape"><span style="overflow:hidden;text-overflow:ellipsis">Entrou por ' + esc(p.entrada || "/") + '</span><button type="button" data-gravacao="' + esc(p.visitante_id) + '">' + ICO.play + " Ver gravação</button></div>" +
        "</article>";
    }).join("");
  }

  function desenharFeed(evs) {
    if (!evs.length) { $("feed").innerHTML = '<p class="vazio">Nada ainda.</p>'; return; }
    $("feed").innerHTML = evs.map(function (e) {
      var quem = (e.sessao && e.sessao.cidade) || "Alguém";
      var pag = tituloCurto(e.titulo, e.caminho);
      var ico = "olho", cor = "#7c4dff", txt;
      if (e.tipo === "pagina") txt = "<b>" + esc(quem) + "</b> <span>abriu</span> <b>" + esc(pag) + "</b>";
      else if (e.tipo === "saida") { ico = "sai"; cor = "#9b96ab"; txt = "<b>" + esc(quem) + "</b> <span>saiu de</span> <b>" + esc(e.caminho) + "</b> <span>depois de " + tempo(e.dado && e.dado.tempo) + "</span>"; }
      else {
        var alvo = (e.dado && e.dado.alvo) || "botão";
        ico = alvo === "whatsapp" ? "wa" : "clique"; cor = alvo === "whatsapp" ? "#35d07f" : "#f5b544";
        var nome = { whatsapp: "no WhatsApp", formulario: "enviou um formulário", telefone: "no telefone", email: "no e-mail", cta: "em “" + ((e.dado && e.dado.texto) || "botão") + "”" }[alvo] || "em um botão";
        txt = "<b>" + esc(quem) + "</b> <span>" + (alvo === "formulario" ? "" : "clicou ") + esc(nome) + " em</span> <b>" + esc(e.caminho) + "</b>";
      }
      return '<div class="feed-item"><span class="ico" style="background:' + cor + "1f;color:" + cor + '">' + ICO[ico] + "</span><div>" + txt + '</div><time data-em="' + esc(e.em) + '">' + ha(e.em) + "</time></div>";
    }).join("");
  }
  function ha(em) {
    var s = Math.max(0, Math.round((Date.now() - new Date(em).getTime()) / 1000));
    return s < 60 ? s + "s" : s < 3600 ? Math.floor(s / 60) + " min" : Math.floor(s / 3600) + " h";
  }

  var agendado = null;
  function agendar() { if (abaAtual !== "agora") return; clearTimeout(agendado); agendado = setTimeout(carregarAgora, 600); }
  function ligarAoVivo() {
    sb.channel("painel-agora")
      .on("postgres_changes", { event: "*", schema: "public", table: "site_sessoes" }, agendar)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "site_eventos" }, agendar)
      .subscribe();
    // Rede de segurança: quem some sem avisar sai da lista pelo tempo.
    setInterval(function () { if (abaAtual === "agora" && !document.hidden) carregarAgora(); }, 15000);
    setInterval(function () {
      document.querySelectorAll("[data-inicio]").forEach(function (el) { el.textContent = tempo((Date.now() - new Date(el.dataset.inicio).getTime()) / 1000); });
      document.querySelectorAll("[data-em]").forEach(function (el) { el.textContent = ha(el.dataset.em); });
    }, 1000);
    document.addEventListener("click", function (e) {
      var b = e.target.closest("[data-gravacao]");
      if (!b) return;
      var id = b.dataset.gravacao;
      var abrir = function () { window.open(CLARITY, "_blank", "noopener"); };
      if (navigator.clipboard) navigator.clipboard.writeText(id).then(function () { toast("Código copiado. No Clarity, filtre por “Custom user ID” e cole."); abrir(); }, abrir);
      else abrir();
    });
  }

  // ═══════════════════ SITE ═══════════════════
  async function carregarSite() {
    var p = periodo(dias);
    $("site").classList.add("carregando");
    try {
      var [r, a, vel] = await Promise.all([
        rpc("site_resumo", { de: p.de.toISOString(), ate: p.ate.toISOString() }),
        rpc("site_resumo", { de: p.antesDe.toISOString(), ate: p.antesAte.toISOString() }),
        sb.from("site_velocidade").select("dia,caminho,nota,lcp_ms").order("dia", { ascending: false }).limit(200)
      ]);
      var t = r.totais, ta = a.totais;
      var conv = { whatsapp: 0, formulario: 0, contato: 0 };
      var porPagina = {};
      (r.cliques || []).forEach(function (c) {
        if (c.alvo === "whatsapp") conv.whatsapp += c.total;
        else if (c.alvo === "formulario") conv.formulario += c.total;
        else if (c.alvo === "telefone" || c.alvo === "email") conv.contato += c.total;
        else return;
        porPagina[c.caminho] = (porPagina[c.caminho] || 0) + c.total;
      });
      var waAntes = (a.cliques || []).filter(function (c) { return c.alvo === "whatsapp"; }).reduce(function (s, c) { return s + c.total; }, 0);
      $("site-kpis").innerHTML =
        kpi("Visitantes", num(t.visitantes), variacao(t.visitantes, ta.visitantes)) +
        kpi("Novos", num(t.novos), variacao(t.novos, ta.novos)) +
        kpi("Páginas vistas", num(t.paginas), variacao(t.paginas, ta.paginas)) +
        kpi("Tempo médio", tempo(t.tempo_medio), variacao(t.tempo_medio, ta.tempo_medio)) +
        kpi('Saíram na 1ª página<i class="dica" tabindex="0" data-dica="De cada 100 visitas, quantas viram só uma página e foram embora. Quanto menor, melhor.">i</i>', num(t.saida_direta) + "%", variacao(t.saida_direta, ta.saida_direta, true)) +
        kpi("Cliques WhatsApp", num(conv.whatsapp), variacao(conv.whatsapp, waAntes));
      grafico(r.por_dia || [], p);
      barras($("origens"), (r.origens || []).slice(0, 7).map(function (o) { return [nomeOrigem(o.origem), o.sessoes, CORES_ORIGEM[o.origem] || "#a99cff"]; }));

      var ultimaNota = {};
      (vel.data || []).forEach(function (v) { if (!ultimaNota[v.caminho]) ultimaNota[v.caminho] = v; });
      var vitais = {};
      (r.vitais || []).forEach(function (v) { vitais[v.caminho] = v; });
      var pags = r.paginas_top || [];
      $("paginas").innerHTML = pags.length ? pags.slice(0, 12).map(function (g) {
        return "<tr><td><code>" + esc(tituloCurto(g.titulo, g.caminho)) + '</code><span class="sub">' + esc(g.caminho) + '</span></td><td class="n num">' + num(g.vistas) + '</td><td class="n num">' + num(g.visitantes) + '</td><td class="n num">' + tempo(g.tempo) + '</td><td class="n num">' + num(g.rolagem) + '%</td><td class="n">' + velocidade(ultimaNota[g.caminho], vitais[g.caminho]) + "</td></tr>";
      }).join("") : '<tr><td colspan="6" class="vazio">Sem visitas no período.</td></tr>';

      $("conv").innerHTML = '<div><span>WhatsApp</span><b class="num">' + num(conv.whatsapp) + '</b></div><div><span>Formulários</span><b class="num">' + num(conv.formulario) + '</b></div><div><span>Tel./e-mail</span><b class="num">' + num(conv.contato) + "</b></div>";
      var cp = Object.keys(porPagina).map(function (k) { return [k, porPagina[k]]; }).sort(function (x, y) { return y[1] - x[1]; }).slice(0, 6);
      $("conv-paginas").innerHTML = cp.length ? cp.map(function (c) { return "<tr><td><code>" + esc(c[0]) + '</code></td><td class="n num">' + num(c[1]) + "</td></tr>"; }).join("") : '<tr><td colspan="2" class="vazio">Nenhum clique de contato no período.</td></tr>';

      $("campanhas").innerHTML = (r.campanhas || []).length ? r.campanhas.slice(0, 8).map(function (c) {
        return "<tr><td>" + esc([c.source, c.medium].filter(Boolean).join(" / ") || "—") + (c.campaign ? '<span class="sub">' + esc(c.campaign) + "</span>" : "") + '</td><td class="n num">' + num(c.sessoes) + "</td></tr>";
      }).join("") : '<tr><td colspan="2" class="vazio">Nenhuma visita com UTM no período.</td></tr>';
      var NOME_AP = { celular: "Celular", computador: "Computador", tablet: "Tablet" };
      barras($("aparelhos"), (r.aparelhos || []).map(function (x, i) { return [NOME_AP[x.aparelho] || "?", x.sessoes, ["#7c4dff", "#a99cff", "#6b6680"][i] || "#6b6680"]; }));
      $("cidades").innerHTML = (r.cidades || []).length ? r.cidades.slice(0, 8).map(function (c) {
        return "<tr><td>" + esc(c.cidade) + ' <span class="sub">' + esc([c.estado, c.pais !== "BR" ? c.pais : ""].filter(Boolean).join(" · ")) + '</span></td><td class="n num">' + num(c.sessoes) + "</td></tr>";
      }).join("") : '<tr><td class="vazio">Sem dados no período.</td></tr>';
    } catch (e) { toast("Não deu para carregar agora. Tente de novo."); }
    $("site").classList.remove("carregando");
  }
  function kpi(rotulo, valor, delta) { return '<div class="kpi"><span>' + rotulo + '</span><b class="num">' + valor + "</b>" + (delta || "") + "</div>"; }
  function velocidade(teste, vit) {
    if (teste && teste.nota != null) {
      var c = teste.nota >= 90 ? "bom" : teste.nota >= 50 ? "meh" : "ruim";
      return '<span class="pill ' + c + '" title="Nota do Google PageSpeed no celular: ' + teste.nota + '/100">' + teste.nota + "</span>";
    }
    if (vit && vit.lcp) {
      var c2 = vit.lcp <= 2500 ? "bom" : vit.lcp <= 4000 ? "meh" : "ruim";
      return '<span class="pill ' + c2 + '" title="Tempo até o conteúdo principal aparecer, medido nos visitantes (Chrome/Android)">' + dec(vit.lcp / 1000) + "s</span>";
    }
    return '<span style="color:var(--dim)">—</span>';
  }
  function grafico(dados, p) {
    var mapa = {}; dados.forEach(function (d) { mapa[d.dia] = d.visitantes; });
    var serie = [], d = new Date(p.de.getTime() - 3 * 3600e3), fim = new Date(p.ate.getTime() - 3 * 3600e3);
    d.setUTCHours(0, 0, 0, 0);
    while (d <= fim && serie.length < 120) { var k = d.toISOString().slice(0, 10); serie.push([k, mapa[k] || 0]); d = new Date(d.getTime() + 864e5); }
    if (serie.length < 2) serie.unshift([serie[0] ? serie[0][0] : "", 0]);
    var W = 700, H = 220, pl = 34, pb = 26, pt = 12;
    var max = Math.max(4, Math.max.apply(null, serie.map(function (s) { return s[1]; })));
    var passo = Math.ceil(max / 4); max = passo * 4;
    var x = function (i) { return pl + i * (W - pl - 10) / (serie.length - 1); }, y = function (v) { return pt + (H - pt - pb) * (1 - v / max); };
    var s = "";
    for (var v = 0; v <= max; v += passo) s += '<line x1="' + pl + '" x2="' + (W - 10) + '" y1="' + y(v) + '" y2="' + y(v) + '" stroke="rgba(255,255,255,.06)"/><text x="' + (pl - 8) + '" y="' + (y(v) + 4) + '" fill="#6b6680" font-size="11" text-anchor="end">' + v + "</text>";
    var caminho = serie.map(function (q, i) { return (i ? "L" : "M") + x(i) + "," + y(q[1]); }).join("");
    s += '<defs><linearGradient id="ga" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#7c4dff" stop-opacity=".35"/><stop offset="1" stop-color="#7c4dff" stop-opacity="0"/></linearGradient></defs>';
    s += '<path d="' + caminho + "L" + x(serie.length - 1) + "," + y(0) + "L" + x(0) + "," + y(0) + 'Z" fill="url(#ga)"/>';
    s += '<path d="' + caminho + '" fill="none" stroke="#7c4dff" stroke-width="2.5" stroke-linejoin="round"/>';
    var cada = Math.ceil(serie.length / 8);
    serie.forEach(function (q, i) { if (i % cada === 0 || i === serie.length - 1) s += '<text x="' + x(i) + '" y="' + (H - 6) + '" fill="#6b6680" font-size="11" text-anchor="middle">' + q[0].slice(8, 10) + "/" + q[0].slice(5, 7) + "</text>"; });
    s += '<circle cx="' + x(serie.length - 1) + '" cy="' + y(serie[serie.length - 1][1]) + '" r="4.5" fill="#7c4dff" stroke="#0b0916" stroke-width="2"/>';
    $("graf").innerHTML = s;
  }

  // ═══════════════════ BLOG ═══════════════════
  async function carregarBlog() {
    var p = periodo(dias);
    $("blog").classList.add("carregando");
    try {
      var [r, a, rol] = await Promise.all([
        rpc("site_resumo", { de: p.de.toISOString(), ate: p.ate.toISOString() }),
        rpc("site_resumo", { de: p.antesDe.toISOString(), ate: p.antesAte.toISOString() }),
        rpc("site_blog_rolagem", { de: p.de.toISOString(), ate: p.ate.toISOString() })
      ]);
      var b = r.blog || [], ba = a.blog || [];
      var soma = function (l, k) { return l.reduce(function (s, x) { return s + (Number(x[k]) || 0); }, 0); };
      var leituras = soma(b, "leituras"), tempoMedio = leituras ? b.reduce(function (s, x) { return s + x.tempo * x.leituras; }, 0) / leituras : 0;
      $("blog-kpis").innerHTML =
        kpi("Leituras", num(leituras), variacao(leituras, soma(ba, "leituras"))) +
        kpi("Artigos lidos", num(b.length), "") +
        kpi("Tempo médio de leitura", tempo(tempoMedio), "") +
        kpi('Leram até o fim<i class="dica dir" tabindex="0" data-dica="De cada 100 leituras, quantas chegaram a 90% da página.">i</i>', num(rol.fim) + "%", "");
      $("artigos").innerHTML = b.length ? b.map(function (x) {
        var origens = x.origens || {}, top = Object.keys(origens).sort(function (m, n) { return origens[n] - origens[m]; })[0];
        var pct = top ? Math.round(origens[top] / x.leituras * 100) : 0;
        return "<tr><td><code>" + esc(tituloCurto(x.titulo, x.caminho)) + '</code><span class="sub">' + esc(x.caminho) + '</span></td><td class="n num">' + num(x.leituras) + '</td><td class="n num">' + num(x.leitores) + '</td><td class="n num">' + tempo(x.tempo) + '</td><td><div class="leu"><div class="t"><i style="width:' + num(x.ate_o_fim) + '%"></i></div><span class="num">' + num(x.ate_o_fim) + "%</span></div></td><td>" + (top ? '<span class="tag ' + tagOrigem(top) + '">' + esc(nomeOrigem(top)) + " " + pct + "%</span>" : "") + "</td></tr>";
      }).join("") : '<tr><td colspan="6" class="vazio">Nenhuma leitura de artigo no período.</td></tr>';
      barras($("funil"), rol.total ? [["Chegou a 25%", rol.p25, "var(--roxo)", rol.p25 + "%"], ["Chegou a 50%", rol.p50, "var(--roxo)", rol.p50 + "%"], ["Chegou a 75%", rol.p75, "var(--roxo)", rol.p75 + "%"], ["Até o fim", rol.fim, "var(--roxo-claro)", rol.fim + "%"]] : []);
    } catch (e) { toast("Não deu para carregar agora. Tente de novo."); }
    $("blog").classList.remove("carregando");
  }

  // ═══════════════════ SEO ═══════════════════
  function data(d) { return new Date(d.getTime() - 3 * 3600e3).toISOString().slice(0, 10); }
  function pillPosicao(v) { v = Number(v) || 0; if (!v) return "—"; var c = v <= 10 ? "bom" : v <= 20 ? "meh" : "ruim"; return '<span class="pill ' + c + '">' + Math.round(v) + "º</span>"; }
  async function carregarSeo() {
    var p = periodo(dias === 0 ? 1 : dias);
    $("seo").classList.add("carregando");
    try {
      var r = await rpc("seo_resumo", { de: data(p.de), ate: data(p.ate) });
      if (!r.conectado) {
        $("seo-aviso").innerHTML = '<div class="aviso-gsc"><div><b>Conecte o Google Search Console</b><br><span style="color:var(--muted)">Enquanto não conecta, os números do Google ficam vazios. A checagem das páginas, lá embaixo, já funciona.</span>' +
          "<ol><li>No Google Cloud, crie uma conta de serviço e ative a “Google Search Console API”.</li><li>No Search Console do fluxxo.io, em Configurações › Usuários, adicione o e-mail dessa conta (permissão Restrito).</li><li>Cole a chave JSON dela na variável <b>GSC_SERVICE_ACCOUNT</b> do projeto no Vercel.</li></ol></div></div>";
      } else {
        var ult = r.ultimo_dia ? new Date(r.ultimo_dia + "T12:00:00Z").toLocaleDateString("pt-BR") : "—";
        $("seo-aviso").innerHTML = '<p style="margin:0 0 12px;font-size:12px;color:var(--dim)">Dados do Google até ' + ult + " (o Google libera com 2 a 3 dias de atraso).</p>";
      }
      var t = r.totais || {};
      $("seo-cliques").textContent = num(t.cliques);
      $("seo-impressoes").textContent = num(t.impressoes);
      $("seo-ctr").textContent = dec(t.ctr) + "%";
      $("seo-posicao").textContent = t.posicao ? dec(t.posicao) : "—";
      $("termos").innerHTML = (r.termos || []).length ? r.termos.slice(0, 25).map(function (x) {
        return "<tr><td><code>" + esc(x.termo) + '</code></td><td class="n num">' + num(x.impressoes) + '</td><td class="n num">' + num(x.cliques) + '</td><td class="n num">' + dec(x.ctr) + '%</td><td class="n">' + pillPosicao(x.posicao) + "</td></tr>";
      }).join("") : '<tr><td colspan="5" class="vazio">Sem dados do Google no período.</td></tr>';
      $("seo-paginas").innerHTML = (r.paginas || []).length ? r.paginas.slice(0, 15).map(function (x) {
        var cam = x.pagina.replace(/^https?:\/\/[^/]+/, "") || "/";
        return "<tr><td><code>" + esc(cam) + '</code></td><td class="n num">' + num(x.impressoes) + '</td><td class="n num">' + num(x.cliques) + '</td><td class="n">' + pillPosicao(x.posicao) + "</td></tr>";
      }).join("") : '<tr><td colspan="4" class="vazio">Sem dados do Google no período.</td></tr>';
    } catch (e) { toast("Não deu para carregar o SEO agora."); }
    $("seo").classList.remove("carregando");
    checar();
  }

  var checado = false;
  async function checar() {
    if (checado) return; checado = true;
    var el = $("checagem");
    el.innerHTML = '<p class="vazio">Lendo as páginas do site…</p>';
    var noSitemap = new Set(), caminhos = new Set();
    try {
      var xml = await (await fetch("/sitemap.xml", { cache: "no-store" })).text();
      (xml.match(/<loc>([^<]+)<\/loc>/g) || []).forEach(function (l) {
        var c = l.replace(/<\/?loc>/g, "").replace(/^https?:\/\/[^/]+/, "").replace(/\/$/, "") || "/";
        noSitemap.add(c); caminhos.add(c);
      });
    } catch (e) {}
    try {
      var r = await rpc("site_resumo", { de: new Date(Date.now() - 30 * 864e5).toISOString(), ate: new Date().toISOString() });
      (r.paginas_top || []).forEach(function (g) { caminhos.add(g.caminho.replace(/\/$/, "") || "/"); });
    } catch (e) {}
    var lista = Array.from(caminhos).filter(function (c) { return !/^\/(painel|login)$/.test(c); }).slice(0, 40);
    var linhas = await Promise.all(lista.map(async function (c) {
      try {
        var html = await (await fetch(c, { cache: "no-store" })).text();
        var doc = new DOMParser().parseFromString(html, "text/html");
        var robots = (doc.querySelector('meta[name="robots"]') || {}).content || "";
        return {
          c: c, noindex: /noindex/i.test(robots),
          titulo: Boolean((doc.title || "").trim()),
          desc: Boolean(((doc.querySelector('meta[name="description"]') || {}).content || "").trim()),
          canon: Boolean(doc.querySelector('link[rel="canonical"]')),
          schema: Boolean(doc.querySelector('script[type="application/ld+json"]')),
          sitemap: noSitemap.has(c)
        };
      } catch (e) { return null; }
    }));
    linhas = linhas.filter(function (l) { return l && !l.noindex; })
      .sort(function (a, b) { var fa = [a.titulo, a.desc, a.canon, a.schema, a.sitemap].filter(Boolean).length, fb = [b.titulo, b.desc, b.canon, b.schema, b.sitemap].filter(Boolean).length; return fa - fb; });
    var ok = function (v) { return v ? '<i class="ok">✓</i>' : '<i class="nok">✕</i>'; };
    el.innerHTML = '<div class="check-l cab"><span></span><span>Título</span><span>Descrição</span><span>Endereço</span><span>Schema</span><span>Sitemap</span></div>' +
      (linhas.length ? linhas.map(function (l) { return '<div class="check-l"><code>' + esc(l.c) + "</code>" + ok(l.titulo) + ok(l.desc) + ok(l.canon) + ok(l.schema) + ok(l.sitemap) + "</div>"; }).join("") : '<p class="vazio">Não deu para ler as páginas.</p>');
  }

  iniciar();
})();

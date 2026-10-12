#!/usr/bin/env python3
"""Gera o blog com a key visual nova a partir das páginas do site antigo (tasks/originais).

- Menu, gaveta e rodapé saem da home (index.html) (links "#..." passam a apontar para a home).
- O texto de cada artigo sai intacto do artigo atual; só a casca muda.
- Saída: blog.html e os artigos na raiz do site (com SUFIXO="-nova", arquivos de prévia).

Rodar da raiz do repo:  python3 tasks/blog_nova.py
"""
import html
import json
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
HOME = "/"
PREVIA = False            # True gera com noindex (prévia)
SUFIXO = ""               # "-nova" gera arquivos de prévia ao lado
V = "10"                   # versão do css/js do blog (furar cache)

POSTS = [
    dict(arq="artigo.html", cat="conversao", tag="Conversão", data="18 jul 2026", min="8",
         img="img/blog-site-bonito.webp",
         titulo="Seu site é bonito. E daí? O que faz uma página vender de verdade",
         resumo="Estética atrai, mas é a estrutura que converte. Os 6 elementos que separam páginas que enfeitam de páginas que pagam boleto."),
    dict(arq="artigo-marca-visual.html", cat="design", tag="Design", data="14 jul 2026", min="6",
         img="img/blog-marca-visual.webp",
         titulo="5 sinais de que sua marca está perdendo cliente por causa do visual",
         resumo="Cliente não fala \"achei sua identidade fraca\". Ele só some. Aprenda a ler os sintomas antes do prejuízo."),
    dict(arq="artigo-velocidade-site.html", cat="web", tag="Web", data="10 jul 2026", min="6",
         img="img/blog-velocidade-site.webp",
         titulo="O checklist de velocidade: por que seu site demora e como resolver",
         resumo="Cada segundo de carregamento derruba a conversão. Os vilões mais comuns e a ordem certa de atacar cada um."),
    dict(arq="artigo-tarefas-manuais.html", cat="solucoes", tag="Soluções", data="28 jun 2026", min="6",
         img="img/blog-tarefas-manuais.webp",
         titulo="7 tarefas que sua empresa ainda faz na mão (e não devia)",
         resumo="Planilha copiada, mensagem repetida, relatório manual. O que dá pra automatizar hoje sem virar projeto de um ano."),
]

SETA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>'
VOLTA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>'


def nova(arq):
    return arq.replace(".html", SUFIXO + ".html")


def ler(nome):
    return (RAIZ / nome).read_text(encoding="utf-8")


def original(nome):
    """Página como era no site antigo (tag site-antigo-2026-10-12): fonte do SEO e do texto dos artigos."""
    return (RAIZ / "tasks/originais" / nome).read_text(encoding="utf-8")


def pedaco(texto, ini, fim):
    i = texto.index(ini)
    j = texto.index(fim, i) + len(fim)
    return texto[i:j]


# ---------- casca comum, tirada da home nova ----------
home = ler("index.html")
FONTES = "\n".join(l for l in home.splitlines() if "fonts.g" in l)
MENU = pedaco(home, '<header class="nav" id="nav">', "</header>")
GAVETA = pedaco(home, '<div class="gaveta" id="gaveta" hidden>', "</div>\n</div>")
RODAPE = pedaco(home, '<footer class="rodape"', "</footer>")


def links_para_home(trecho):
    # âncoras da home ("#servicos") passam a abrir a home nessa seção
    return re.sub(r'href="#(?!topo")([\w-]+)"', lambda m: f'href="{HOME}#{m.group(1)}"', trecho)


MENU = links_para_home(MENU).replace('href="/" aria-label="Fluxxo, página inicial"', f'href="{HOME}" aria-label="Fluxxo, página inicial"')
GAVETA = links_para_home(GAVETA)
RODAPE = links_para_home(RODAPE).replace('href="#topo" aria-label="Fluxxo, voltar ao topo"', f'href="{HOME}" aria-label="Fluxxo, página inicial"')
# o blog entra no rodapé (coluna Empresa)
RODAPE = RODAPE.replace(f'<a href="{HOME}#portfolio">Projetos</a>', f'<a href="{HOME}#portfolio">Projetos</a>\n        <a href="{nova("blog.html")}">Blog</a>')


def cabeca_original(texto):
    """SEO da página atual (título, descrição, canonical, og, twitter, ld+json, Clarity), sem o visual antigo."""
    head = texto[texto.index("<head>") + 6:texto.index("</head>")]
    fora = ("fonts.g", "stylesheet", "lenis", "<meta charset", "name=\"viewport\"", "theme-color", "r.js")
    linhas, pular = [], False
    for l in head.splitlines():
        if any(f in l for f in fora):
            continue
        linhas.append(l)
    return "\n".join(x for x in linhas if x.strip())


def favicon(page):
    """Favicon da marca nova (fundo roxo e X branco, do design system); v=4 fura o cache do ícone antigo."""
    page = page.replace("/favicon.ico?v=3", "/favicon.ico?v=4").replace("/favicon-32.png?v=3", "/favicon-32.png?v=4").replace("/apple-touch-icon.png?v=3", "/apple-touch-icon.png?v=4")
    if "favicon.svg" not in page:
        page = page.replace('<link rel="icon" href="/favicon-32.png?v=4" type="image/png" sizes="32x32">',
                            '<link rel="icon" href="/favicon-32.png?v=4" type="image/png" sizes="32x32">\n<link rel="icon" href="/favicon.svg?v=4" type="image/svg+xml">', 1)
    return page


def pagina(texto_original, corpo, classe):
    seo = cabeca_original(texto_original)
    robots = '<!-- prévia do blog novo: fora do Google até virar o blog -->\n<meta name="robots" content="noindex, nofollow">\n' if PREVIA else ""
    if PREVIA:
        seo = re.sub(r'\n?<link rel="canonical"[^>]*>', "", seo)
    return favicon(f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
{robots}<meta name="theme-color" content="#FFFFFF">
{seo}
{FONTES}
<link rel="stylesheet" href="css/home.css?v=12">
<link rel="stylesheet" href="css/blog-nova.css?v={V}">
<script>document.documentElement.classList.add("js")</script>
<script src="/js/r.js?v=2" defer></script>
<script src="js/home.js?v=11" defer></script>
<script src="js/blog-nova.js?v={V}" defer></script>
</head>
<body class="{classe}">

<!-- ============ MENU (igual ao da home nova) ============ -->
{MENU}

{GAVETA}

<main data-claro>
{corpo}
</main>

<!-- ============ RODAPÉ (igual ao da home nova) ============ -->
{RODAPE}

</body>
</html>
""")


def seo(page, titulo, desc, url, nome_curto, colecao=None, servico=None):
    """Título, descrição, compartilhamento e dados estruturados coerentes com o que a página mostra."""
    esc = html.escape
    page = re.sub(r"<title>[^<]*</title>", f"<title>{esc(titulo)}</title>", page, count=1)
    tags = (('name="description"', desc), ('property="og:type"', "website"), ('property="og:site_name"', "Fluxxo"),
            ('property="og:locale"', "pt_BR"), ('property="og:url"', url), ('property="og:title"', titulo),
            ('property="og:description"', desc), ('property="og:image"', "https://fluxxo.io/img/brand/og-cover.jpg?v=2"),
            ('name="twitter:card"', "summary_large_image"), ('name="twitter:title"', titulo), ('name="twitter:description"', desc),
            ('name="twitter:image"', "https://fluxxo.io/img/brand/og-cover.jpg?v=2"))
    for chave, valor in tags:
        nova = f'<meta {chave} content="{esc(valor, quote=True)}">'
        if f"<meta {chave}" in page:
            # troca só o que é do conteúdo; tipo, imagem e afins que já existem ficam como estão
            if chave in ('name="description"', 'property="og:title"', 'property="og:description"', 'name="twitter:title"', 'name="twitter:description"', 'property="og:url"'):
                page = re.sub(r'<meta ' + chave + r' content="[^"]*">', lambda m: nova, page, count=1)
        else:
            page = page.replace("</title>", "</title>\n" + nova, 1)
    if 'rel="canonical"' not in page and not PREVIA:
        page = page.replace("</title>", f'</title>\n<link rel="canonical" href="{url}">', 1)
    grafo = []
    if colecao:
        grafo.append({"@type": "CollectionPage", "name": colecao, "url": url, "description": desc, "inLanguage": "pt-BR",
                      "isPartOf": {"@id": "https://fluxxo.io/#site"}})
    if servico:
        grafo.append({"@type": "Service", "name": servico, "provider": {"@id": "https://fluxxo.io/#org"}, "areaServed": "BR"})
    grafo.append({"@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Início", "item": "https://fluxxo.io/"},
        {"@type": "ListItem", "position": 2, "name": nome_curto, "item": url}]})
    ld = '<script type="application/ld+json">' + json.dumps({"@context": "https://schema.org", "@graph": grafo}, ensure_ascii=False, separators=(",", ":")) + "</script>"
    if '<script type="application/ld+json">' in page:
        page = re.sub(r'<script type="application/ld\+json">.*?</script>', lambda m: ld, page, count=1, flags=re.S)
    else:
        page = page.replace("<!-- Microsoft Clarity -->", ld + "\n<!-- Microsoft Clarity -->", 1) if "<!-- Microsoft Clarity -->" in page else page.replace("</head>", ld + "\n</head>", 1)
    return page


def cartao(p, extra="", d=0):
    return f"""<a class="bn-card{extra}" href="{nova(p['arq'])}" data-cat="{p['cat']}" data-reveal style="--d:{d}ms">
        <span class="bn-capa"><img src="{p['img']}" alt="{html.escape(p['titulo'])}" width="1672" height="941" loading="lazy" decoding="async"></span>
        <span class="bn-corpo">
          <span class="bn-meta"><b class="bn-tag">{p['tag']}</b><span>{p['data']}</span><i>·</i><span>{p['min']} min</span></span>
          <strong>{p['titulo']}</strong>
          <span class="bn-resumo">{p['resumo']}</span>
          <span class="bn-ler">Ler artigo {SETA}</span>
        </span>
      </a>"""


# ---------- listagem (estrutura de revista) ----------
def capa_item(p, d):
    """Item da coluna da direita na capa: miniatura + categoria + título."""
    return f"""<a class="rv-mini" href="{nova(p['arq'])}" data-reveal style="--d:{d}ms">
          <span class="rv-mini-capa"><img src="{p['img']}" alt="" width="1672" height="941" loading="lazy" decoding="async"></span>
          <span class="rv-mini-txt"><span class="bn-meta"><b class="bn-tag">{p['tag']}</b><span>{p['data']}</span></span><strong>{p['titulo']}</strong></span>
        </a>"""


def linha(p, d):
    """Linha da lista de todos os artigos."""
    return f"""<a class="rv-linha" href="{nova(p['arq'])}" data-cat="{p['cat']}" data-reveal style="--d:{d}ms">
        <span class="rv-linha-capa"><img src="{p['img']}" alt="{html.escape(p['titulo'])}" width="1672" height="941" loading="lazy" decoding="async"></span>
        <span class="rv-linha-txt">
          <span class="bn-meta"><b class="bn-tag">{p['tag']}</b><span>{p['data']}</span><i>·</i><span>{p['min']} min de leitura</span></span>
          <strong>{p['titulo']}</strong>
          <span class="bn-resumo">{p['resumo']}</span>
        </span>
        <span class="rv-linha-seta" aria-hidden="true">{SETA}</span>
      </a>"""


def gerar_blog():
    orig = original("blog.html")
    dest, outros = POSTS[0], POSTS[1:4]
    filtros = [("all", "Todos"), ("design", "Design"), ("web", "Web"), ("conversao", "Conversão"), ("solucoes", "Soluções")]
    abas = "".join(
        f'<button type="button" class="bn-filtro{" on" if k == "all" else ""}" aria-pressed="{"true" if k == "all" else "false"}" data-filtro="{k}">{t}</button>'
        for k, t in filtros)
    minis = "\n        ".join(capa_item(p, 120 + 80 * i) for i, p in enumerate(outros))
    # cada artigo aparece uma vez só: a lista abaixo da capa só existe a partir do 5º artigo
    resto = POSTS[4:]
    linhas = "\n      ".join(linha(p, 60 * i) for i, p in enumerate(resto))
    todos = f"""<!-- ============ MAIS ARTIGOS ============ -->
<section class="rv-todos" aria-labelledby="todosTit">
  <div class="wrap">
    <div class="rv-todos-topo">
      <h2 class="rv-todos-tit" id="todosTit" data-reveal>Mais artigos</h2>
      <div class="bn-filtros" role="group" aria-label="Filtrar por categoria" data-reveal style="--d:60ms">{abas}</div>
    </div>
    <div class="rv-lista" id="bnLista">
      {linhas}
    </div>
    <p class="bn-vazio" id="bnVazio" hidden>Nenhum artigo nessa categoria ainda.</p>
  </div>
</section>

""" if resto else ""
    corpo = f"""<!-- ============ ABERTURA DO BLOG ============ -->
<section class="bn-topo rv-topo">
  <i class="bn-luz" aria-hidden="true"></i>
  <div class="wrap">
    <div class="rv-cab">
      <div>
        <p class="rotulo rotulo-cor" data-reveal><span class="pontos" aria-hidden="true"><b></b><b></b><b></b></span>Blog da Fluxxo</p>
        <h1 class="titulo-sec bn-tit" data-reveal style="--d:60ms"><span class="l">Ideias que fazem sua empresa</span> <span class="b">vender mais.</span></h1>
      </div>
      <p class="apoio-sec bn-apoio" data-reveal style="--d:120ms">Design, sites e estratégia sem enrolação. O que a gente aprende nos projetos, você lê aqui de graça.</p>
    </div>

    <!-- capa da revista: o mais novo grande e os seguintes empilhados -->
    <div class="rv-capa">
      <a class="rv-dest" href="{nova(dest['arq'])}" data-reveal style="--d:80ms">
        <span class="rv-dest-capa"><img src="{dest['img']}" alt="{html.escape(dest['titulo'])}" width="1672" height="941" decoding="async" fetchpriority="high"></span>
        <span class="bn-meta"><b class="bn-tag">{dest['tag']}</b><span>{dest['data']}</span><i>·</i><span>{dest['min']} min de leitura</span></span>
        <strong>{dest['titulo']}</strong>
        <span class="bn-resumo">{dest['resumo']}</span>
        <span class="bn-ler">Ler artigo {SETA}</span>
      </a>
      <div class="rv-lado">
        <p class="rv-lado-rot">Mais recentes</p>
        {minis}
      </div>
    </div>
  </div>
</section>

{todos}<!-- ============ ANÁLISE GRÁTIS ============ -->
<section class="bn-analise">
  <div class="wrap">
    <div class="bn-painel" data-reveal>
      <div>
        <p class="rotulo"><span class="pontos" aria-hidden="true"><b></b><b></b><b></b></span>Ferramenta gratuita</p>
        <h2>Quer saber como está <span>o seu site hoje?</span></h2>
        <p>Responda 12 perguntas em 3 minutos e receba a nota do seu site nos 4 pontos que mais derrubam venda. Sem cadastro.</p>
      </div>
      <a class="btn btn-p" href="analise.html">Fazer a análise {SETA}</a>
    </div>
  </div>
</section>"""
    (RAIZ / nova("blog.html")).write_text(pagina(orig, corpo, "pg-blog"), encoding="utf-8")


# ---------- artigos ----------
def gerar_artigo(p):
    orig = original(p["arq"])
    h1 = re.search(r"<h1>(.*?)</h1>", orig, re.S).group(1)
    partes = re.split(r"<br\s*/?>", h1)
    l = partes[0].strip()
    b = re.sub(r'</?span[^>]*>', "", partes[1]).strip() if len(partes) > 1 else ""
    titulo = f'<span class="l">{l}</span> <span class="b">{b}</span>' if b else f'<span class="b">{l}</span>'
    sub = re.search(r'<p class="art-sub">(.*?)</p>', orig, re.S).group(1)
    corpo_txt = orig[orig.index('<article class="art-body wrap">') + len('<article class="art-body wrap">'):orig.index("<!-- CTA -->")]
    corpo_txt = "\n".join(x for x in corpo_txt.strip().splitlines() if x.strip())
    cta = pedaco(orig, '<div class="art-cta', "</a>")
    cta_h3 = re.search(r"<h3>(.*?)</h3>", cta, re.S).group(1)
    cta_p = re.search(r"<p>(.*?)</p>", cta, re.S).group(1)
    a = re.search(r'<a href="([^"]+)"([^>]*)>(.*?)<', cta, re.S)
    cta_href, cta_attr, cta_txt = a.group(1), a.group(2).replace(' class="btn-primary"', ""), a.group(3).strip()
    wa = re.search(r'<a href="(https://wa\.me/\?text=[^"]+)"', orig).group(1)
    outros = [x for x in POSTS if x is not p]
    rel = "\n      ".join(cartao(x, d=80 * i) for i, x in enumerate(outros))
    corpo = f"""<div class="bn-progresso" aria-hidden="true"><i id="bnProgresso"></i></div>

<!-- ============ CABEÇALHO DO ARTIGO ============ -->
<header class="ar-topo">
  <i class="bn-luz" aria-hidden="true"></i>
  <div class="wrap ar-grade">
  <div class="ar-cab">
    <a class="ar-volta" href="{nova('blog.html')}" data-reveal>{VOLTA} Voltar pro blog</a>
    <!-- imagem primeiro, na largura do texto -->
    <figure class="ar-capa" data-reveal style="--d:40ms"><img src="{p['img']}" alt="{html.escape(p['titulo'])}" width="1672" height="941" decoding="async" fetchpriority="high"></figure>
    <p class="bn-meta ar-meta" data-reveal style="--d:40ms"><b class="bn-tag">{p['tag']}</b><span>{p['data']}</span><i>·</i><span>{p['min']} min de leitura</span></p>
    <h1 class="titulo-sec ar-titulo" data-reveal style="--d:80ms">{titulo}</h1>
    <p class="apoio-sec ar-sub" data-reveal style="--d:120ms">{sub}</p>
  </div>
  </div>
</header>

<!-- ============ TEXTO (original, intacto) ============ -->
<article class="ar-corpo">
  <div class="wrap ar-grade">
  <div class="ar-texto">
{corpo_txt}

    <aside class="ar-cta">
      <div>
        <h3>{cta_h3}</h3>
        <p>{cta_p}</p>
      </div>
      <a class="btn btn-p" href="{cta_href}"{cta_attr}>{cta_txt} {SETA}</a>
    </aside>

    <div class="ar-share">
      <span>Compartilhar:</span>
      <a href="{wa}" target="_blank" rel="noopener" aria-label="Compartilhar no WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.2-5.4A8.4 8.4 0 1 1 21 11.5z"/></svg></a>
      <a href="https://www.linkedin.com/sharing/share-offsite/" target="_blank" rel="noopener" aria-label="Compartilhar no LinkedIn" data-linkedin><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg></a>
      <button type="button" id="bnCopiar" aria-label="Copiar link"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg><em id="bnCopiado">Link copiado</em></button>
    </div>
  </div>
  <!-- índice montado pelo js a partir dos subtítulos; acende o trecho que está na tela -->
  <nav class="ar-indice" aria-label="Neste artigo"><b>Neste artigo</b><ol id="bnIndice"></ol><a class="ar-indice-cta" href="{cta_href}"{cta_attr}>{cta_txt} {SETA}</a></nav>
  </div>
</article>

<!-- ============ CONTINUE LENDO ============ -->
<section class="bn-posts ar-rel" aria-labelledby="relTit">
  <div class="wrap">
    <div class="ar-rel-topo">
      <p class="rotulo rotulo-cor" data-reveal><span class="pontos" aria-hidden="true"><b></b><b></b><b></b></span>Blog da Fluxxo</p>
      <h2 class="titulo-sec ar-rel-tit" id="relTit" data-reveal style="--d:60ms"><span class="l">Continue</span> <span class="b">lendo.</span></h2>
    </div>
    <div class="bn-lista">
      {rel}
    </div>
  </div>
</section>"""
    (RAIZ / nova(p["arq"])).write_text(pagina(orig, corpo, "pg-artigo"), encoding="utf-8")


if __name__ == "__main__":
    gerar_blog()
    for p in POSTS:
        gerar_artigo(p)
    print("ok:", nova("blog.html"), ", ".join(nova(p["arq"]) for p in POSTS))

#!/usr/bin/env python3
"""Gera a página de portfólio de design (prévia): mesma pegada da de sites, com cada peça
dentro de um mockup claro de post do Instagram.

As peças saem de design.html (lidas uma vez para tasks/design_pecas.json, imagens em img/home/design).
Rodar da raiz do repo:  python3 tasks/design_nova.py
"""
import html
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import blog_nova as base  # noqa: E402
import vitrine  # noqa: E402

V = "2"
SAIDA = "design" + base.SUFIXO + ".html"
POR_VEZ = 12  # peças visíveis antes do "Ver mais"

PECAS = json.loads((base.RAIZ / "tasks/design_pecas.json").read_text(encoding="utf-8"))
NOMES = {"carrossel": "Carrossel", "anuncio": "Anúncio", "imobiliaria": "Imobiliária", "suplementos": "Suplementos"}

ICONES = (
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/></svg>'
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>'
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>'
)
SALVAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>'


def peca(n, p):
    nome = NOMES[p["cat"]]
    primeira = p["imgs"][0]
    ratio = f'{primeira["w"]} / {primeira["h"]}'
    extra = " dz-mais" if n >= POR_VEZ else ""
    if p["carrossel"]:
        slides = "".join(
            f'<img src="{i["src"]}" alt="{html.escape(i["alt"])}" width="{i["w"]}" height="{i["h"]}" loading="lazy" decoding="async">'
            for i in p["imgs"])
        pontos = "".join(f'<i{" class=\"on\"" if k == 0 else ""}></i>' for k in range(len(p["imgs"])))
        midia = f'<div class="dz-slides" tabindex="0" aria-label="Carrossel com {len(p["imgs"])} slides">{slides}</div><span class="dz-cont">1/{len(p["imgs"])}</span><button type="button" class="dz-seta dz-ant" aria-label="Slide anterior" hidden><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg></button><button type="button" class="dz-seta dz-prox" aria-label="Próximo slide"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></button>'
        rodape_meio = f'<span class="dz-pontos">{pontos}</span>'
        topo_dir = f"{len(p['imgs'])} slides"
    else:
        midia = f'<img src="{primeira["src"]}" alt="{html.escape(primeira["alt"])}" width="{primeira["w"]}" height="{primeira["h"]}" loading="lazy" decoding="async">'
        rodape_meio = ""
        topo_dir = "Patrocinado" if p["cat"] != "carrossel" else ""
    return f"""
      <article class="dz{extra}" data-cat="{p['cat']}">
        <div class="dz-post">
          <div class="dz-topo"><span class="dz-av" aria-hidden="true"></span><span class="dz-quem"><b>{nome}</b><small>{topo_dir}</small></span><span class="dz-tres" aria-hidden="true">•••</span></div>
          <div class="dz-midia" style="aspect-ratio:{ratio}">{midia}</div>
          <div class="dz-acoes" aria-hidden="true"><span class="dz-ics">{ICONES}</span>{rodape_meio}<span class="dz-salva">{SALVAR}</span></div>
          <p class="dz-spec">{html.escape(p['spec'])}</p>
        </div>
      </article>"""


CAPAS = ["thumb-cpl-bingo", "thumb-live-01", "thumb-curriculo-forte", "thumb-muda-tudo", "thumb-04", "thumb-cpl-01",
         "thumb-live-02", "thumb-cpl-ultima-chance", "thumb-03", "thumb-live-03", "thumb-cpl-02", "thumb-live-04"]


def capa_video(n, nome):
    """Capa de vídeo num mockup claro de YouTube: imagem 16:9 + avatar, título e canal."""
    extra = " dz-mais" if n >= POR_VEZ else ""
    return f"""
      <article class="dz dz-yt{extra}" data-cat="capas">
        <div class="dz-post">
          <div class="dz-midia" style="aspect-ratio:16 / 9"><img src="img/home/video/{nome}.webp" alt="Capa de vídeo para YouTube" width="640" height="360" loading="lazy" decoding="async"><span class="dz-yt-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span></div>
          <div class="dz-topo dz-yt-info"><span class="dz-av" aria-hidden="true"></span><span class="dz-quem"><b>Capa de vídeo</b><small>YouTube · 1280×720</small></span><span class="dz-tres" aria-hidden="true">⋮</span></div>
        </div>
      </article>"""



def gerar():
    orig = base.original("design.html")
    pecas = "".join(peca(i, p) for i, p in enumerate(PECAS))
    # capas entram intercaladas depois das primeiras peças, para não ficarem todas no fim
    pecas += "".join(capa_video(POR_VEZ + i, n) for i, n in enumerate(CAPAS))
    opcoes = [("all", "Tudo"), ("carrossel", "Carrosséis"), ("anuncio", "Anúncios"), ("imobiliaria", "Imobiliária"), ("suplementos", "Suplementos"), ("capas", "Capas de vídeo")]
    filtros = "".join(
        f'<button type="button" class="wp-filtro{" on" if k == "all" else ""}" aria-pressed="{"true" if k == "all" else "false"}" data-filtro="{k}">{t}</button>'
        for k, t in opcoes)
    HERO = vitrine.abertura('Portfólio · Design', 'Peças para redes sociais', 'e anúncios.', 'Carrosséis, posts, anúncios e capas de vídeo que criamos para os nossos clientes, cada um na identidade visual da própria marca.', [('post', 'img/home/design/anuncio-estudio-de-rica.webp'), ('post', 'img/home/design/carrossel-google-ads-1.webp'), ('post', 'img/home/design/anuncio-viapty-carro.webp'), ('post', 'img/home/design/suplemento-feno-grego-01.webp'), ('post', 'img/home/design/carrossel-clinica-1.webp')])
    corpo = f"""{HERO}

<!-- ============ PEÇAS ============ -->
<section class="wp-lista" aria-label="Peças">
  <div class="wrap">
    <div class="wp-filtros" role="group" aria-label="Filtrar por tipo" data-reveal>{filtros}</div>
    <div class="dz-grade" id="dzGrade">{pecas}
    </div>
    <div class="dz-mais-wrap"><button type="button" class="btn btn-s" id="dzMais">Ver mais peças</button></div>
  </div>
</section>

<!-- ============ CHAMADA ============ -->
<section class="wp-fim">
  <div class="wrap">
    <div class="wp-painel" data-reveal>
      <div>
        <p class="rotulo"><span class="pontos" aria-hidden="true"><b></b><b></b><b></b></span>Design para redes sociais</p>
        <h2>Precisa de peças para <span>as suas redes?</span></h2>
        <p>Criamos posts, carrosséis e anúncios na identidade visual da sua empresa, com as revisões combinadas antes de começar.</p>
      </div>
      <a class="btn btn-p" data-wa="menu" href="https://wa.me/5585992657146" target="_blank" rel="noopener">Conversar com a equipe {base.SETA}</a>
    </div>
  </div>
</section>"""
    page = base.pagina(orig, corpo, "pg-portfolio pg-design")
    page = page.replace(f"css/blog-nova.css?v={base.V}", f"css/portfolio-nova.css?v=11\">\n<link rel=\"stylesheet\" href=\"css/design-nova.css?v=5")
    page = page.replace(f'<script src="js/blog-nova.js?v={base.V}" defer></script>', f'<script src="js/design-nova.js?v=4" defer></script>')
    page = page.replace('<main data-claro>', "<main>").replace('<meta name="theme-color" content="#FFFFFF">', '<meta name="theme-color" content="#070519">')
    page = base.seo(page, 'Portfólio de Design para Redes Sociais e Anúncios | Fluxxo', 'Carrosséis, posts, anúncios e capas de vídeo criados pela Fluxxo para clientes reais, cada um na identidade visual da própria marca.', 'https://fluxxo.io/design', 'Design', colecao='Portfólio de design da Fluxxo', servico='Design para redes sociais e anúncios')
    (base.RAIZ / SAIDA).write_text(page, encoding="utf-8")
    print("ok:", SAIDA)


if __name__ == "__main__":
    gerar()

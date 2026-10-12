#!/usr/bin/env python3
"""Gera a página só de portfólio de sites (prévia, fundo escuro, um projeto por vez).

Menu, gaveta e rodapé vêm do gerador do blog (que tira tudo de home-nova.html).
Rodar da raiz do repo:  python3 tasks/portfolio_web_nova.py
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import blog_nova as base  # noqa: E402
import vitrine  # noqa: E402

V = "11"
SAIDA = "webdesign" + base.SUFIXO + ".html"  # o portfólio de sites ocupa o endereço da antiga página de web

# textos tirados do portfólio da webdesign.html (nome, descrição e link reais)
SITES = [
    ("alvo", "Landing page", "Alvo AG", "Assessoria de marketing e crescimento", "alvoag.com.br", "https://alvoag.com.br/"),
    ("drasumaia", "Landing page", "Dra. Sumaia Jacob", "Página do programa Semanal", "drasumaiajacob.com", "https://drasumaiajacob.com/semanal/"),
    ("puravive", "E-commerce", "Pura Vive", "E-commerce de suplementos naturais", "puravive.com.br", "https://www.puravive.com.br/"),
    ("deia-glace", "Página de vendas", "Deia Cakes · Glacê de Ninho", "Página de vendas do curso", "deiacakes.com", "https://deiacakes.com/curso-glace-de-ninho-perfeito/"),
    ("marla-gestante", "Landing page", "Marla Lopes Coimbra", "Desafio Domine Gestante", "marlalopescoimbra.com.br", "https://www.marlalopescoimbra.com.br/desafio-domine-gestante-v1/"),
    ("formacao-gem", "Página de vendas", "Formação GEM", "Página de vendas da formação", "marlalopescoimbra.com.br", "https://www.marlalopescoimbra.com.br/formacao-gem/"),
    ("ana-lameu-pro", "Página de vendas", "Ana Lameu · Estúdio de Rica PRO", "Página de vendas", "analameu.com.br", "https://www.analameu.com.br/estudio-de-rica-pro/"),
    ("jose-tech", "Landing page", "José Oliveira.tech", "O Mapa do Jogo Tech", "joseoliveira.tech", "https://www.joseoliveira.tech/o-mapa-do-jogo-tech/"),
    ("deia-bolo-andar", "Página de vendas", "Deia Cakes · Bolo de Andar", "Página de vendas do curso", "deiacakes.com", "https://deiacakes.com/curso-meu-primeiro-bolo-de-andar/"),
    ("desintox", "Página de vendas", "Desintox Pro", "Página de vendas do suplemento", "desintoxpro.com.br", "https://www.desintoxpro.com.br/"),
    ("ana-lameu", "Página de vendas", "Ana Lameu · Estúdio de Rica", "Página de vendas", "analameu.com.br", "https://www.analameu.com.br/estudio-de-rica/"),
]

FORA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>'
CADEADO = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>'


def altura(img):
    """Altura real do WebP (para o tempo de rolagem ser proporcional ao tamanho da página)."""
    dados = (base.RAIZ / img).read_bytes()
    i = dados.find(b"VP8 ")
    if i >= 0:
        return int.from_bytes(dados[i + 14:i + 16], "little") & 0x3FFF
    i = dados.find(b"VP8X")
    return int.from_bytes(dados[i + 14:i + 17], "little") + 1


CATS = {"Landing page": "landing", "Página de vendas": "vendas", "E-commerce": "loja"}


def projeto(n, s):
    chave, tipo, nome, desc, dominio, url = s
    img = f"img/home/sites/{chave}.webp"
    h = altura(img)
    dur = max(10, round(h / 760 * 7))  # páginas longas rolam por mais tempo
    return f"""
      <article class="wp" data-cat="{CATS[tipo]}" data-reveal style="--d:{(n - 1) % 3 * 80}ms">
        <div class="wp-nav">
          <div class="wp-barra"><i></i><i></i><i></i><span>{CADEADO}{dominio}</span></div>
          <div class="wp-tela"><img src="{img}" alt="Página {nome}" width="760" height="{h}" loading="lazy" decoding="async" style="--dur:{dur}s"><span class="wp-dica"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg><span class="d-mouse">Passe o mouse para navegar</span><span class="d-dedo">Deslize para navegar</span></span></div>
        </div>
        <div class="wp-txt">
          <p class="wp-tipo">{tipo}</p>
          <h2>{nome}</h2>
          <p class="wp-desc">{desc}</p>
          <a class="wp-link" href="{url}" target="_blank" rel="noopener">Ver no ar {FORA}</a>
        </div>
      </article>"""



def gerar():
    orig = base.original("webdesign.html")
    projetos = "".join(projeto(i + 1, s) for i, s in enumerate(SITES))
    opcoes = [("all", "Todos"), ("landing", "Landing pages"), ("vendas", "Páginas de vendas"), ("loja", "E-commerce")]
    filtros = "".join(
        f'<button type="button" class="wp-filtro{" on" if k == "all" else ""}" aria-pressed="{"true" if k == "all" else "false"}" data-filtro="{k}">{t}</button>'
        for k, t in opcoes)
    HERO = vitrine.abertura('Portfólio · Sites', 'Sites e páginas', 'que colocamos no ar.', 'Cada página foi organizada a partir do que aquela pessoa precisava compreender antes de agir.', [('nav', 'img/home/sites/drasumaia.webp'), ('nav', 'img/home/sites/puravive.webp'), ('nav', 'img/home/sites/alvo.webp'), ('nav', 'img/home/sites/marla-gestante.webp'), ('nav', 'img/home/sites/deia-glace.webp')])
    corpo = f"""{HERO}

<!-- ============ PROJETOS, UM POR VEZ ============ -->
<section class="wp-lista" aria-label="Projetos">
  <div class="wrap">
    <div class="wp-filtros" role="group" aria-label="Filtrar por tipo" data-reveal>{filtros}</div>
    <div class="wp-grade" id="pfGrade">{projetos}
    </div>
  </div>
</section>

<!-- ============ CHAMADA ============ -->
<section class="wp-fim">
  <div class="wrap">
    <div class="wp-painel" data-reveal>
      <div>
        <p class="rotulo"><span class="pontos" aria-hidden="true"><b></b><b></b><b></b></span>Sites e sistemas</p>
        <h2>Quer colocar o seu <span>projeto no ar?</span></h2>
        <p>Conte o que você precisa. A gente organiza as páginas, o conteúdo e as funcionalidades antes de começar.</p>
      </div>
      <a class="btn btn-p" data-wa="digital" href="https://wa.me/5585992657146" target="_blank" rel="noopener">Solicitar um projeto digital {base.SETA}</a>
    </div>
  </div>
</section>"""
    html = base.pagina(orig, corpo, "pg-portfolio")
    # esta página usa o próprio css/js no lugar dos do blog
    html = html.replace(f"css/blog-nova.css?v={base.V}", f"css/portfolio-nova.css?v={V}")
    html = html.replace(f'<script src="js/blog-nova.js?v={base.V}" defer></script>', f'<script src="js/portfolio-nova.js?v={V}" defer></script>')
    html = html.replace('<main data-claro>', "<main>").replace('<meta name="theme-color" content="#FFFFFF">', '<meta name="theme-color" content="#070519">')
    html = base.seo(html, 'Portfólio de Sites e Landing Pages | Fluxxo', 'Sites, landing pages e lojas virtuais que a Fluxxo criou para clientes reais. Navegue pelas páginas e abra cada projeto no ar.', 'https://fluxxo.io/webdesign', 'Sites', colecao='Portfólio de sites da Fluxxo', servico='Criação de sites e landing pages')
    (base.RAIZ / SAIDA).write_text(html, encoding="utf-8")
    print("ok:", SAIDA)


if __name__ == "__main__":
    gerar()

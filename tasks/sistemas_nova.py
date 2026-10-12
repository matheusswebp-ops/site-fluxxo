#!/usr/bin/env python3
"""Gera a página de portfólio de sistemas (prévia): mesma pegada das de sites, design e vídeo.

Cada sistema real aparece num notebook prateado claro com a gravação rodando na tela
e etiquetas flutuando em volta. Textos tirados de sistemas.html.
Rodar da raiz do repo:  python3 tasks/sistemas_nova.py
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import blog_nova as base  # noqa: E402
import vitrine  # noqa: E402

V = "3"
SAIDA = "sistemas" + base.SUFIXO + ".html"

SISTEMAS = [
    dict(n="1", url="gestor-financeiro", tipo="Painel sob medida", nome="Gestor financeiro",
         desc="Saldo, orçamento por categoria e projeção do mês na mesma tela. Alertas aparecem quando uma categoria ultrapassa o limite definido.",
         itens=["Saldo e projeção do mês", "Orçamento por categoria", "Alerta quando passa do limite", "Assessor com IA"]),
    dict(n="2", url="painel-de-demandas", tipo="Gestão de tarefas", nome="Painel de demandas",
         desc="Tarefas visualizadas em lista, kanban ou calendário, com cliente, responsável e prazo no mesmo card.",
         itens=["Lista, kanban e calendário", "Cliente, responsável e prazo no card", "Automações entre etapas", "Acesso por pessoa da equipe"]),
]

OK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>'
RAIO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 3 14h9l-1 8 10-12h-9z"/></svg>'
CADEADO = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>'


def sistema(k, s):
    inv = " sz-inv" if k % 2 else ""
    itens = "".join(f"<li><span>{OK}</span>{t}</li>" for t in s["itens"])
    return f"""
    <article class="sz{inv}">
      <div class="sz-palco" data-reveal>
        <div class="sz-note">
          <div class="sz-tampa">
            <span class="sz-cam" aria-hidden="true"></span>
            <div class="sz-tela">
              <div class="sz-barra"><i></i><i></i><i></i><span>{CADEADO}app · {s['url']}</span></div>
              <video muted loop playsinline preload="none" poster="img/home/port/sistema-{s['n']}.webp" data-src="video/home/sistema-{s['n']}.mp4" aria-label="Gravação do {s['nome']} em uso"></video>
            </div>
          </div>
          <div class="sz-base" aria-hidden="true"><i></i></div>
        </div>
      </div>
      <div class="sz-txt" data-reveal style="--d:120ms">
        <span class="sz-num" aria-hidden="true">{k + 1:02d}</span>
        <p class="wp-tipo-s">{s['tipo']}</p>
        <h2>{s['nome']}</h2>
        <p class="sz-desc">{s['desc']}</p>
        <ul class="sz-itens">{itens}</ul>
        <p class="sz-nota"><span class="sz-ao-vivo"></span>Gravação real do sistema em uso</p>
      </div>
    </article>"""



def gerar():
    orig = base.original("sistemas.html")
    sistemas = "".join(sistema(k, s) for k, s in enumerate(SISTEMAS))
    HERO = vitrine.abertura('Portfólio · Sistemas', 'Sistemas que criamos', 'e que estão em uso.', 'Ferramentas desenvolvidas para processos específicos, com cadastros, painéis, automações e diferentes níveis de acesso.', [('tela', 'img/home/sistemas/s2-21.webp'), ('tela', 'img/home/sistemas/s1-15.webp'), ('tela', 'img/home/port/sistema-2.webp'), ('tela', 'img/home/sistemas/s1-27.webp'), ('tela', 'img/home/sistemas/s2-9.webp')])
    corpo = f"""{HERO}

<!-- ============ SISTEMAS ============ -->
<section class="sz-lista" aria-label="Sistemas">
  <div class="wrap">{sistemas}
  </div>
</section>

<!-- ============ CHAMADA ============ -->
<section class="wp-fim">
  <div class="wrap">
    <div class="wp-painel" data-reveal>
      <div>
        <p class="rotulo"><span class="pontos" aria-hidden="true"><b></b><b></b><b></b></span>Sistemas e SaaS</p>
        <h2>Tem um processo que ainda <span>roda em planilha?</span></h2>
        <p>Conte como ele funciona hoje. A gente define telas, recursos e integrações antes de começar a desenvolver.</p>
      </div>
      <a class="btn btn-p" data-wa="digital" href="https://wa.me/5585992657146" target="_blank" rel="noopener">Solicitar um projeto digital {base.SETA}</a>
    </div>
  </div>
</section>"""
    page = base.pagina(orig, corpo, "pg-portfolio pg-sistemas")
    page = page.replace(f"css/blog-nova.css?v={base.V}", f"css/portfolio-nova.css?v=11\">\n<link rel=\"stylesheet\" href=\"css/sistemas-nova.css?v={V}")
    page = page.replace(f'<script src="js/blog-nova.js?v={base.V}" defer></script>', f'<script src="js/sistemas-nova.js?v={V}" defer></script>')
    page = page.replace('<main data-claro>', "<main>").replace('<meta name="theme-color" content="#FFFFFF">', '<meta name="theme-color" content="#070519">')
    page = base.seo(page, 'Portfólio de Sistemas, Painéis e SaaS | Fluxxo', 'Sistemas sob medida criados pela Fluxxo e em uso: gestor financeiro e painel de demandas. Veja as gravações reais funcionando.', 'https://fluxxo.io/sistemas', 'Sistemas', colecao='Portfólio de sistemas da Fluxxo', servico='Desenvolvimento de sistemas e SaaS')
    (base.RAIZ / SAIDA).write_text(page, encoding="utf-8")
    print("ok:", SAIDA)


if __name__ == "__main__":
    gerar()

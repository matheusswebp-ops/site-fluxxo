#!/usr/bin/env python3
"""Gera a página de portfólio de vídeo (prévia): mesma pegada das de sites e design.

Reels num celular de moldura clara: prévia sem som com o mouse em cima, vídeo completo com som
num modal ao clicar. Capas de YouTube num mockup claro de vídeo.
Rodar da raiz do repo:  python3 tasks/video_nova.py
"""
import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import blog_nova as base  # noqa: E402
import vitrine  # noqa: E402

V = "2"
SAIDA = "edicao" + base.SUFIXO + ".html"

REELS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"]
CAPAS = ["thumb-cpl-bingo", "thumb-live-01", "thumb-curriculo-forte", "thumb-muda-tudo", "thumb-04", "thumb-cpl-01",
         "thumb-live-02", "thumb-cpl-ultima-chance", "thumb-03", "thumb-live-03", "thumb-cpl-02", "thumb-live-04"]

PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>'
SOM = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/></svg>'
LADO = (  # ícones da lateral do Reels (decorativos)
    '<span class="vz-lado" aria-hidden="true">'
    '<svg viewBox="0 0 24 24"><path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/></svg>'
    '<svg viewBox="0 0 24 24"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>'
    '<svg viewBox="0 0 24 24"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>'
    "</span>"
)


def duracao(arq):
    seg = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(base.RAIZ / arq)],
                               capture_output=True, text=True).stdout.strip())
    return f"{int(seg // 60)}:{int(round(seg % 60)):02d}"


def reel(k, n):
    completo = f"video/edicao/edicao-{n}.mp4"
    return f"""
      <article class="vz" data-cat="reels" data-reveal style="--d:{k % 4 * 70}ms">
        <button type="button" class="vz-cel" data-video="{completo}" aria-label="Assistir ao reels {k + 1} com som">
          <span class="vz-tela">
            <video muted loop playsinline preload="none" poster="img/home/video/reel-{n}.webp" data-src="video/home/reels/previa-{n}.mp4"></video>
            {LADO}
            <span class="vz-play">{PLAY}</span>
          </span>
        </button>
        <p class="vz-info"><span class="vz-tag">Reels</span><span>{duracao(completo)}</span><span class="vz-som">{SOM} Clique para ouvir</span></p>
      </article>"""


def capa(k, n):
    return f"""
      <article class="vz vz-yt" data-cat="capas" data-reveal style="--d:{k % 3 * 70}ms">
        <div class="vz-yt-card">
          <span class="vz-yt-img"><img src="img/home/video/{n}.webp" alt="Capa de vídeo para YouTube" width="640" height="360" loading="lazy" decoding="async"><span class="vz-yt-dur" aria-hidden="true">{PLAY}</span></span>
          <span class="vz-yt-txt"><span class="dz-av" aria-hidden="true"></span><span><b>Capa de vídeo</b><small>YouTube · 16:9</small></span></span>
        </div>
      </article>"""



def gerar():
    orig = base.original("edicao.html")
    reels = "".join(reel(k, n) for k, n in enumerate(REELS))
    opcoes = [("reels", "Reels"), ("capas", "Capas de vídeo")]
    filtros = "".join(
        f'<button type="button" class="wp-filtro{" on" if k == "reels" else ""}" aria-pressed="{"true" if k == "reels" else "false"}" data-filtro="{k}">{t}</button>'
        for k, t in opcoes)
    HERO = vitrine.abertura('Portfólio · Vídeo', 'Vídeos editados', 'para as redes.', 'Reels que editamos para os nossos clientes, com cortes, legendas, áudio e finalização. Passe o mouse para ver e clique para ouvir.', [('cel', 'img/home/video/reel-02.webp'), ('cel', 'img/home/video/reel-03.webp'), ('cel', 'img/home/video/reel-01.webp'), ('cel', 'img/home/video/reel-04.webp'), ('cel', 'img/home/video/reel-08.webp')])
    corpo = f"""{HERO}

<!-- ============ VÍDEOS ============ -->
<section class="wp-lista" aria-label="Vídeos">
  <div class="wrap">
    <div class="vz-grade" id="vzReels" data-grupo="reels">{reels}
    </div>
  </div>
</section>

<!-- ============ CHAMADA ============ -->
<section class="wp-fim">
  <div class="wrap">
    <div class="wp-painel" data-reveal>
      <div>
        <p class="rotulo"><span class="pontos" aria-hidden="true"><b></b><b></b><b></b></span>Edição de vídeo</p>
        <h2>Tem vídeos parados <span>esperando edição?</span></h2>
        <p>Você manda os arquivos brutos. A gente organiza o material e cuida dos cortes, das legendas, do áudio e da finalização.</p>
      </div>
      <a class="btn btn-p" data-wa="menu" href="https://wa.me/5585992657146" target="_blank" rel="noopener">Conversar com a equipe {base.SETA}</a>
    </div>
  </div>
</section>

<!-- vídeo completo, com som -->
<div class="vz-modal" id="vzModal" hidden>
  <div class="vz-modal-fundo" data-fechar></div>
  <div class="vz-modal-caixa" role="dialog" aria-modal="true" aria-label="Vídeo com som">
    <button type="button" class="vz-fechar" data-fechar aria-label="Fechar vídeo"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
    <video id="vzModalVideo" controls playsinline></video>
  </div>
</div>"""
    page = base.pagina(orig, corpo, "pg-portfolio pg-video")
    page = page.replace(f"css/blog-nova.css?v={base.V}",
                        f"css/portfolio-nova.css?v=11\">\n<link rel=\"stylesheet\" href=\"css/design-nova.css?v=4\">\n<link rel=\"stylesheet\" href=\"css/video-nova.css?v={V}")
    page = page.replace(f'<script src="js/blog-nova.js?v={base.V}" defer></script>', f'<script src="js/video-nova.js?v={V}" defer></script>')
    page = page.replace('<main data-claro>', "<main>").replace('<meta name="theme-color" content="#FFFFFF">', '<meta name="theme-color" content="#070519">')
    page = base.seo(page, 'Portfólio de Edição de Vídeo e Reels | Fluxxo', 'Reels editados pela Fluxxo para clientes reais, com cortes, legendas, áudio e finalização. Assista aos vídeos completos com som.', 'https://fluxxo.io/edicao', 'Vídeo', colecao='Portfólio de vídeo da Fluxxo', servico='Edição de vídeo para redes sociais')
    (base.RAIZ / SAIDA).write_text(page, encoding="utf-8")
    print("ok:", SAIDA)


if __name__ == "__main__":
    gerar()

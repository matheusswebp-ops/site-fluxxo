"""Abertura comum das páginas de portfólio (sites, design, vídeo, sistemas):
texto centralizado e, embaixo, 5 trabalhos reais em leque (o do meio maior).

Cada item é (tipo, imagem): 'nav' navegador com página, 'post' post claro do Instagram,
'cel' celular claro, 'tela' tela de sistema (paisagem).
"""

CADEADO = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>'


def _item(i, tipo, img):
    if tipo in ("nav", "tela"):
        dentro = f'<span class="vt-barra"><i></i><i></i><i></i></span><img src="{img}" alt="" decoding="async">'
    elif tipo == "post":
        dentro = f'<span class="vt-post-topo"><i></i><b></b></span><img src="{img}" alt="" decoding="async"><span class="vt-post-pe"><b></b><b></b><b></b></span>'
    elif i == 0 and img.endswith(".webp") and "/reel-" in img:  # celular do meio toca o reel (sem som)
        n = img.rsplit("reel-", 1)[1].split(".")[0]
        dentro = f'<video src="video/home/reels/previa-{n}.mp4" poster="{img}" muted loop autoplay playsinline preload="auto"></video>'
    else:  # cel
        dentro = f'<img src="{img}" alt="" decoding="async">'
    return f'<span class="vt-item vt-{tipo}" style="--i:{i}; --a:{abs(i)}">{dentro}</span>'


def abertura(rotulo, linha1, linha2, apoio, itens):
    leque = "".join(_item(k - 2, tipo, img) for k, (tipo, img) in enumerate(itens[:5]))
    return f"""<!-- ============ ABERTURA: texto centralizado + vitrine em leque ============ -->
<section class="wp-topo vt-topo">
  <div class="fundo" aria-hidden="true"><span class="luz"></span></div>
  <div class="wrap vt-cab">
    <p class="rotulo" data-reveal><span class="pontos" aria-hidden="true"><b></b><b></b><b></b></span>{rotulo}</p>
    <h1 class="titulo" data-reveal style="--d:60ms"><span class="l">{linha1}</span> <span class="b">{linha2}</span></h1>
    <p class="apoio" data-reveal style="--d:120ms">{apoio}</p>
  </div>
  <div class="vt-leque" aria-hidden="true">{leque}</div>
</section>"""

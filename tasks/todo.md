# Seção "1 em cada 2" — disfuncao-eretil.html (SEÇÃO 3, escura)

## Estado (2026-09-10, sessão nova)
- [x] Refeita (2ª vez na noite): `de-nivel-1.jpg` inteira (1536px) cobrindo a
      seção como fundo, nítida, sem máscara nem véu; cortina sólida de
      --dark-1 na esquerda abrindo para a direita, foto deslocada 24% para o
      homem ficar inteiro entre 64% e 83% da largura, fora da cortina.
      Texto à esquerda: número, frase, pilares em lista com fio, virada.
      A 1ª versão da noite (foto recortada + máscara em degradê + véu)
      foi reprovada: "lixo inutilizável" — virou névoa borrada em retina.
- [x] Mobile: foto vira o topo da seção, some pro navy embaixo, texto
      centralizado depois.
- [x] Capturas conferidas (desktop 1440 e mobile 390) e página inteira
      verificada: 12 `<section>` abrem e fecham, sem id duplicado.

## Foto do desktop (chegou 2026-09-11)
- [x] `img/de-consulta-desk.webp` (1920x850), do Mateus: paciente de costas e
      urologista mostrando a anatomia no tablet. Ela JÁ vem com a cortina
      navy embutida na esquerda, cor #112241 — a cortina do CSS usa a mesma
      cor, então não escurece duas vezes, e o `--ombro-cor` da seção foi
      trocado para #112241 para o platô não deixar emenda.
- [x] `<picture>`: a foto nova só no desktop (min-width:881px); no mobile
      segue a de-nivel-1, que é vertical o bastante para virar o topo.
- [x] Altura da seção apertada (--sec-y 64px, número 116px, listas mais
      justas) para a foto caber sem ser ampliada: em 1920px ela entra
      1:1 e sem corte nenhum; em 1413px sobra 22%, tudo navy chapado.
      `object-position:100% 50%` mantém o médico sempre no quadro.
- [x] Headline sem `font-size` próprio: usa a escala do site (--fs-h2),
      igual à das outras seções.

## Pendência
- [x] Mobile: `img/de-consulta-mob.webp` (800x1200), do Mateus. Foto no terço
      de cima terminando num navy chapado #0a1022; ela é desenhada em largura
      cheia a partir do topo e a figura ganha esse mesmo navy de fundo, então
      a foto continua no fundo da seção sem emenda. Texto começa em 62vw.
      Os 14vw finais da imagem somem no navy: sem isso a vinheta de canto da
      foto deixava um fio horizontal de ~10 pontos de azul na emenda.
- [ ] Viewmax segue sem crédito (0) — geração de imagem bloqueada.

## Tentativas reprovadas antes (não repetir)
1. Dois bustos com degradê e brilho — "tecnológico e sem sentido".
2. Fila de 10 homens, um aceso a cada dois — "um velho não entenderia".
3. Fila atravessando a largura + duas colunas — "sem sentido".
4. Só texto, número gigante — "precisa ficar visual".
5. Espaço de foto reservado (moldura tracejada) — "horrível".
6. Três andares tipográficos com fios — "horrenda, precisa ilustrar".

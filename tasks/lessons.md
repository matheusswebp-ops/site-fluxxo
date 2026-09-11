
## 2026-09-10 — Recorte de HTML por índice duplicou meia página

**O erro:** ao trocar o miolo do SVG do diagrama em `disfuncao-eretil.html`, usei
`fim = s.index('      </svg>')` sem passar o offset inicial. O `index` achou um
`</svg>` que vinha ANTES do trecho que eu queria trocar, então
`s[:ini] + novo + s[fim:]` colou de volta tudo que existia entre os dois pontos
— duplicou a seção inteira e jogou pedaços da seção anterior no meio da página.
Pior: o preview que eu tirei era só do `<figure>`, então a duplicação não
aparecia e eu subi quebrado.

**A regra:** ao cortar um arquivo por índice, o delimitador de fim SEMPRE é
`s.index(marcador, ini)`. E a verificação depois de qualquer edição estrutural
não é olhar o pedaço editado — é contar as âncoras do documento inteiro
(`<section>` abre/fecha, ids únicos, marcadores de seção) e comparar com o
esperado antes de commitar.

## 2026-09-10 — Chrome headless não desce de 500px de largura

**O erro:** capturei "mobile" com `--window-size=390,...` e o texto saiu cortado
à direita. Não era bug de CSS: o Chrome headless em modo desktop tem largura
mínima de 500px, então o layout foi feito a 500 e a imagem cortada em 390.
Quase fui mexer no CSS por causa de um artefato da captura.

**A regra:** antes de corrigir um "bug" que só aparece na captura, medir as
caixas (`getBoundingClientRect` + `--dump-dom`) e conferir `innerWidth`.
Para capturar abaixo de 500px, colocar a página num `<iframe>` da largura
desejada dentro de uma janela de 500+; as media queries respondem ao iframe.

## 2026-09-11 — Foto com máscara + véu virou "névoa"; verificar em retina largo

**O erro:** na seção "1 em cada 2" fiz a foto sangrar no navy com mask-image
em degradê + véu navy + recorte de 976px. Em 1440@1x parecia ok; na tela do
Mateus (1673 CSS px @2x) ficou uma névoa borrada, o homem caiu dentro da zona
do degradê e sobrou um vazio navy entre o texto e a foto. Reprovado como
"lixo inutilizável". Sete reprovações na mesma seção antes disso.

**A regra:**
1. Foto que "se funde com o fundo" = foto NÍTIDA cobrindo a seção + cortina
   sólida da cor do fundo por cima, abrindo onde está o assunto. Nunca
   máscara em degradê sobre a foto inteira, nunca véu por cima do assunto.
2. O assunto da foto (rosto, corpo) fica 100% fora da zona de transição.
   Se cair dentro, deslocar a imagem (left:N%), não afinar o degradê.
3. Usar sempre o maior arquivo disponível; nada de recorte menor que a
   largura em que vai ser exibido. Em retina qualquer upscale > 2x borra.
4. Capturar também em 1673px @2x (a tela dele), não só 1440@1x.

## 2026-09-11 — Foto de banner cortando: é a ALTURA da seção, não a foto

**O erro:** encaixei a de-consulta-desk.webp (1920x850) como fundo da seção e
ela aparecia ampliada e cortada. Culpei o enquadramento. A causa era outra: a
seção tinha 896px de altura em 1413px de largura, proporção 1.58 contra 2.26
da foto. Com `object-fit:cover` o navegador precisa AMPLIAR a foto (1,05x,
perdendo nitidez em retina) e jogar 30% dela para fora. Também tinha posto um
`font-size` próprio no h2 da seção, então a headline saía menor que a das
outras seções — o Mateus viu na hora que fugia do padrão.

**As regras:**
1. Foto de banner com proporção fixa: medir `secH` e comparar a proporção da
   caixa com a da imagem antes de culpar o enquadramento. Se a caixa for mais
   "quadrada" que a foto, a foto é ampliada e cortada — a correção é baixar a
   altura da seção (padding e tamanhos), não mexer no object-position.
2. `object-position` decide o que sai do quadro. Nessa foto o assunto mora na
   direita, então `100% 50%`: o que sobra para cortar é o navy chapado da
   esquerda, que a cortina do CSS repõe na mesma cor.
3. Nada de `font-size` próprio em `.h2` dentro de uma seção. A escala do site
   é `--fs-h2`; override só de `max-width`/`margin` quando a coluna exigir.

## 2026-09-11 — Vídeo que não roda no celular: o índice estava no fim do arquivo

**O erro:** o Mateus reportou duas vezes que o vídeo da página de preenchimento
peniano não rodava no celular. Na primeira eu mexi só no JavaScript (preload,
load() e nova tentativa no canplay) e reportei como corrigido sem conseguir
reproduzir. Não era o JavaScript. Era o arquivo: a caixa `moov`, que é o índice
do MP4, estava depois da `mdat`, no fim dos 3,8 MB. Sem o índice o navegador não
sabe decodificar nada, então precisa baixar o arquivo inteiro antes do primeiro
quadro. No desktop isso passa despercebido; no celular a pessoa rola a página
antes, o observador pausa, e o pôster fica parado para sempre.

**As regras:**
1. Vídeo que não toca: antes de mexer no player, olhar o ARQUIVO e o SERVIDOR.
   No servidor: `content-type`, `accept-ranges` e se um `Range` devolve 206
   (Safari exige). No arquivo: a ordem das caixas do MP4 — `moov` tem que vir
   antes de `mdat` (faststart).
2. Dá para mover o `moov` para o início sem ffmpeg: reescrever o arquivo na
   ordem ftyp, moov, mdat e somar o tamanho do `moov` a cada deslocamento em
   `stco`/`co64`. Depois conferir que todo chunk cai dentro do novo `mdat` e
   que o vídeo ainda abre com a mesma duração e resolução.
3. Nesta máquina não há ffmpeg. O `avconvert` do macOS existe, mas os presets
   dele ficaram MAIORES que o original (3,7 e 4,2 MB contra 3,8) — não serve
   para reduzir peso.
4. Não reportar como corrigido o que não foi reproduzido. Dizer o que foi
   verificado e o que continua sem prova.

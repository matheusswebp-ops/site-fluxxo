
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

## 2026-09-29 — Troca de copy alargou a página no celular

**O erro:** ao trocar o texto do botão do NoShave pela copy do documento
("Quero saber se a técnica no-shave é para mim"), o botão ficou mais largo
que a tela de 390px. Como os botões do celular são `white-space:nowrap`, a
coluna do grid cresceu junto e a página inteira passou a ter 436px (o
celular reduz o zoom para caber). Conferi a rolagem lateral com o celular
emulado só DEPOIS de subir.

**A regra:** toda troca de texto em botão, título ou rótulo conta como
mudança de layout. Antes de commitar, medir `scrollWidth === innerWidth`
com `isMobile:true` em 360, 390 e 414. Itens de grid com texto `nowrap`
levam `min-width:0`.

## 2026-09-29 — Altura mínima fixa para prender a jornada ficou velha

**O erro:** a jornada só prendia na rolagem com `min-height:860px`, número
tirado da altura do conteúdo naquele dia. Com a copy mais curta a seção
passou a caber em ~700px, mas telas de 720–859px continuavam sem a
animação — o Mateus viu como "a animação por scroll parou".

**A regra:** quando um comportamento depende do conteúdo caber na tela,
medir o conteúdo no script (`preso` quando cabe) em vez de fixar um número
na media query.

## 2026-09-30 — "Logo mude" era um lugar só, e eu escolhi o errado

**O erro:** o Mateus mandou a logo da Mentoria PPA com "logo mude". Troquei a
marca do cabeçalho (o "R80+" do canto) sem perguntar onde. Ele queria a logo
só no selo acima da headline do hero. Subi para produção no lugar errado.

**A regra:** quando um pedido de troca de imagem ou logo não diz o lugar e a
página tem mais de um candidato (cabeçalho, selo do hero, rodapé), trocar só
o mais visível da dobra citada. Na dúvida, perguntar antes de subir, e não
mexer em mais de um lugar.

## 2026-09-30 — Foto horizontal no celular: object-position não centraliza

**O erro:** no hero da R80+ no celular usei `object-position:90% 12%` para
"centralizar" a Clara numa foto 16:9. Numa caixa quase quadrada a foto quase
não tem sobra lateral, então nenhuma porcentagem põe o rosto no meio — e o
valor certo muda com a largura do aparelho. Reportei como alinhado sem medir;
o Mateus viu torto no celular dele (duas vezes).

**A regra:** para centralizar uma pessoa numa foto larga no celular, ampliar
a foto (width ~170%) e ancorar o ponto do rosto no meio: `left:50%;
transform:translateX(-X%)`, com X = posição do rosto na foto. Caixa com
`overflow:hidden`. Verificar medindo `rosto === innerWidth/2` em 320–768 e
conferir que a foto cobre as bordas, não só olhando uma captura.

## 2026-10-11 — Copy da home nova reprovada 3 vezes
- Erro: escrevi headline sem saber o que a Fluxxo mais vende, para quem e qual a prova real. Saiu genérico ("do briefing ao ar", lista de serviços, "redes que vendem").
- Regra: antes de escrever copy institucional, fechar com o dono (1) cliente principal, (2) serviço carro-chefe, (3) diferencial concreto, (4) provas reais, (5) uma copy de referência que ele goste. Sem isso, não mandar opção.
- Regra: copy literal, sem analogia; social media é o serviço principal da Fluxxo.

## 2026-10-12 · "Nada clicável" vale para ilustração, não para filtro de verdade
- Ele pediu "nada clicável" nas ilustrações (seção 4), mas no portfólio quis abas que a pessoa clica ("é melhor pra pessoa clicar").
- Regra: animação/ilustração toca sozinha; navegação real de conteúdo (filtro de portfólio, categorias) pode e deve ser clicável. Na dúvida, perguntar.

## 2026-10-12 · Blog: claro, estrutura escolhida por ele, sem repetir conteúdo
- Fiz o blog escuro igual à home e ele reprovou ("quero blog light"); depois reprovou a estrutura de grade e escolheu "Revista" numa pergunta com prévias.
- Ele não gosta do mesmo item aparecendo duas vezes na página (capa + lista com os mesmos artigos).
- Regra: página de leitura nasce clara; antes de montar uma página nova, mostrar 2–3 estruturas com prévia ASCII e deixar ele escolher; nunca listar o mesmo conteúdo duas vezes.
- Artigo: imagem de capa SEMPRE primeiro (logo após "Voltar"), na mesma largura e alinhamento da coluna de texto — conferir medindo left/width de capa, título e parágrafo.
- Copy herdada das páginas antigas também passa pelo filtro "literal": frase tipo "repare menos em um estilo X e mais em como cada projeto encontra uma linguagem própria" foi reprovada como sem sentido — trocar por o que é, para quem.
- Subhead de portfólio não lista ramos/nichos de cliente (ele reprovou "saúde, imobiliário, suplementos…"); dizer o que é e o diferencial.
- Mockup de tela (notebook/celular): nada sobreposto à tela; etiquetas flutuantes por cima foram reprovadas ("tá tampando").
- Ativos de marca (favicon, ícones, logos): baixar o arquivo oficial do design system (artifact 41sfSjrn1Q5LTCZLiXpczT, project/design-system.json → blob) em vez de montar. img/brand/fluxxo-simbolo-*.svg ainda é o símbolo ANTIGO (setas); o X novo está em img/home/fluxxo-simbolo-degrade.svg.
- Menu de site: sempre listar todas as páginas novas (portfólios, blog) ao trocar o site; conferir menu e gaveta antes de subir.

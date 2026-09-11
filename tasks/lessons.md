
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

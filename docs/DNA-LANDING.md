# DNA de Landing Page — padrão fixo

Extraído das referências aprovadas (Core / Dr. Bruno Monteiro e Método Não Trave / Dr. Guilherme Lara).
Este é o padrão. Toda landing de cliente nasce daqui.
Tokens e primitivos em código: [css/dna.css](../css/dna.css).

---

## 1. Tipografia

Geométrica sem serifa, sempre. **Nunca serifada.**
Família: Figtree (fallback Plus Jakarta Sans). Pesos usados: 400, 500, 600, 700.

| Papel | Tamanho (@1440) | Peso | Line-height | Tracking |
|---|---|---|---|---|
| H1 (hero) | 62px | 400 + 700 | 1.04 | -0.03em |
| H2 (seção) | 48px | 400 + 700 | 1.12 | -0.025em |
| H3 grande (nome, "É para você se") | 26px | 400 / 500 | 1.3 | -0.02em |
| Título de card | 17px | 600 | 1.3 | 0 |
| Lead (parágrafo sob o H2) | 16–17px | 400 | 1.65 | 0 |
| Corpo de card | 14.5px | 400 | 1.65 | 0 |
| Kicker | 11.5px | 700 caixa alta | 1 | 0.14em |
| Botão | 15px | 500 | 1 | 0 |
| Micro (prova social, nº 01) | 12.5px | 400 / 600 | 1 | 0 |

**Regra do título duotom** — a assinatura do sistema:
a primeira linha vai em peso 400 e a segunda em 700, quebrando em `<b>` block.
Nunca um H1/H2 inteiro em negrito. Nunca um inteiro em regular.

```
Especialista em          ← 400
ortopedia e              ← 700
traumatologia            ← 700
```

Variação: o negrito recebe a cor da marca em vez do tom de texto
(`Dor tem solução!`, `Aos poucos sua vida foi encolhendo`). Uma variação por página.

**Largura de linha:** lead no máximo 52ch, corpo de card 56ch. Nunca linha cheia.

**Partes importantes em negrito.** Todo parágrafo de corpo carrega uma ou duas
marcações em `<b>` — o trecho que sustenta o argumento, não a frase inteira. O corpo
roda em 400 e tom de apoio, então o negrito em 600 no tom cheio do texto salta
sozinho, sem precisar de cor. Se tudo está em negrito, nada está: no máximo duas
por parágrafo, e nenhuma em parágrafo de uma linha só.

**Título: no máximo 3 linhas.** Quatro linhas nunca. Vale para H1, H2 e
frase-costura, em qualquer largura de tela. Como o tamanho do corpo depende do
comprimento da copy, isso não se resolve chutando `max-width`: a página carrega
uma trava que mede as linhas renderizadas e reduz o corpo até caber em três
(piso de 62% do tamanho base). Se o título só couber muito pequeno, o problema
é a copy, não a tipografia.

**Nunca palavra viúva.** Nenhuma linha de título, lead ou frase-costura pode
terminar com uma palavra sozinha. `text-wrap:balance` em `.h1/.h2/.card h3/.lead`
e `text-wrap:pretty` nos parágrafos — mais um `max-width` em `ch` quando o título
ainda quebrar feio. Confere-se no olho, não no código.

---

## 2. Cor

Duas paletas prontas. A escolha é por temperatura do negócio, não por gosto.

### Preset A — Navy institucional (`.tema-navy`)
Autoridade, consultório, cirurgia, jurídico.

| Token | Hex | Uso |
|---|---|---|
| `--paper` | `#f6f6f4` | fundo da página |
| `--paper-2` | `#ffffff` | superfície de card |
| `--paper-tint` | `#eef2f4` | seção alternada |
| `--ink` | `#12294a` | texto |
| `--ink-soft` | `#5a6b80` | texto de apoio |
| `--brand` | `#0b4c74` | botão, ícones, ênfase |
| `--accent` | `#4e96a8` | kicker, filetes |
| `--dark-1 / --dark-2` | `#0a2342` → `#143a63` | seção escura |
| `--dark-ink-soft` | `#a9c4de` | apoio sobre escuro |

### Preset B — Azul vivo (`.tema-azul`)
Método, protocolo, fisio, performance, infoproduto.

| Token | Hex | Uso |
|---|---|---|
| `--paper` | `#f1f6fe` | fundo da página |
| `--paper-tint` | `#e4eefd` | seção alternada |
| `--ink` | `#0b1a33` | texto |
| `--ink-soft` | `#56657e` | texto de apoio |
| `--brand` | `#1668e3` | botão, ênfase, links |
| `--brand-soft` | `#dce9fd` | pílula de kicker, card tingido |
| `--alerta` | `#e4756a` | coluna de contraindicação |
| gradiente de imagem | `#4e9bff` → `#1257c9` | fundo de foto recortada |

**Regra do texto de apoio:** sobre fundo escuro o apoio é claro **tingido de azul**
(`--dark-ink-soft`), nunca cinza neutro. Cinza apagado em fundo escuro está proibido.

**Sombra:** só em elemento flutuante (chip, botão, card sobre imagem).
Card normal se define por borda de 1px, não por sombra.

---

## 3. Hero — padrão único da primeira dobra

A primeira dobra é **sempre** este layout. Não se inventa hero novo por cliente.

```
┌──────────────────────────────────────────────┐
│ [logo]                                       │
│                              ○ chip          │
│ — KICKER | ESPECIALIDADE      ╭─────────╮    │
│                               │  FOTO   │ ⊙ selo
│ Título linha 1 (400)          │ RECORTADA│   │
│ título linha 2 (700)      ○ chip  do     │   │
│                               │ CLIENTE │   │
│ Lead, 2–3 linhas, 42ch        │         │ ○ chip
│                               ╰─────────╯    │
│ ( Botão com halo  ↗ )                        │
│ ●●● +3.200 atendidos ★★★★★                   │
│                    ▼ notch                   │
└──────────────────────────────────────────────┘
```

- **Grid:** 44% texto / 56% foto. Altura `min(92vh, 860px)`.
- **Foto:** o cliente recortado, ancorado na base da coluna, olhando pra dentro
  da página. Fundo com brilho radial suave atrás — nunca foto em caixa retangular.
  Quando a copy pedir proporção fechada (4:5), vale o card arredondado de 20px sobre
  gradiente da marca — o mesmo tratamento do bloco de autoridade. Caixa de canto vivo,
  nunca.
- **Chips:** exatamente 3, em alturas diferentes (30%, 64%, 76%), dois à esquerda
  e um à direita. Carregam credencial concreta ("Membro da SBOT", "Atendimento em
  São Paulo"), nunca adjetivo. Nunca sobre o rosto.
- **Selo circular:** texto em volta girando + marca no centro. Um por página, só no hero.
- **Logo:** topo da coluna de texto, 44px de altura, com respiro de ~40px abaixo.
- **Ordem sagrada:** logo → kicker → título → lead → botão → prova social. Nada entre eles.
- Fecha com `notch` + chevron chamando a rolagem.

---

## 4. Gramática de seção

Cada seção montada com os mesmos 4 movimentos, nesta ordem:

1. **Kicker** — filete + caixa alta espaçada. Um filete quando alinhado à esquerda,
   dois quando centralizado. Variante em pílula com ponto (`● O QUE MUDA`) para
   páginas de método.
2. **H2 duotom** — 48px, duas linhas.
3. **Lead** — 1–2 linhas, tom de apoio, no máximo 56ch.
4. **Conteúdo** — um dos blocos abaixo.

### Blocos disponíveis

| Bloco | Forma | Quando |
|---|---|---|
| **Grid de serviços** | 3×2, card branco, ícone em quadrado arredondado navy 40px, título 17px/600, corpo 14.5px | listar especialidades / dores atendidas |
| **Diferenciais (escuro)** | 3 cards de vidro com filete de topo (52×3px, gradiente ciano) | por que me escolher |
| **Lista numerada** | split 38/62, coluna esquerda sticky com CTA, direita com itens `01…05` separados por hairline | procedimentos, entregas, etapas |
| **Agitação** | 2 colunas: texto + subgrid 2×2 de "o que você já tentou"; foto com legenda-âncora | dor / objeção |
| **Etapas do método** | 3 cards de imagem 3:4, painel inferior com número em badge + título + link | como funciona |
| **Qualificação** | 2 cards lado a lado: esquerdo tingido com checks azuis, direito neutro com triângulos coral | pra quem é / pra quem não é |
| **Autoridade** | card de imagem em gradiente com chips flutuantes + coluna de bio, credencial em azul, ícones sociais em círculo | quem ensina / quem atende |
| **Comparativo pareado** | grade 2×N: cabeçalho ✓ / ✕ e, abaixo, cada par na mesma linha, coluna boa tingida e ruim neutra, separados por fio | quando a copy entrega pares que se respondem (material A × material B) |

**Comparativo pareado ≠ Qualificação.** A Qualificação são duas listas independentes
lado a lado. O comparativo é usado quando cada item de um lado responde a um item
do outro: aí eles têm que cair na mesma altura, senão o leitor perde o par. No
celular a grade vira uma coluna e os pares continuam intercalados — e cada célula
passa a carregar o próprio micro-rótulo, porque sem o cabeçalho de coluna não dá
para saber de quem é a linha que se está lendo.

### Ordem canônica da página

```
Hero → Serviços (claro) → Diferenciais (ESCURO) → Procedimentos (claro)
→ Agitação (tint) → Método (claro) → Qualificação (tint) → Autoridade (claro)
→ CTA final
```

---

## 5. Alternância de fundo

Sequência: `claro → tint → escuro → claro`.
- Nunca duas seções escuras seguidas.
- No máximo **duas** seções escuras na página inteira — a escura é ênfase, não estilo.
- O rodapé é terminador, não seção: pode ser escuro chapado (sem brilho radial)
  sem consumir uma das duas.
- A seção escura recebe um brilho radial no topo (`ellipse 70% 55% at 50% 0%`),
  senão fica chapada.

---

## 6. Transição entre seções

**`.t-notch`** — aba arredondada (104×52px, raio inferior 52px) da cor da seção
anterior, descendo sobre a próxima, com chevron centralizado. É o "respire, continue".
Usar quando muda o assunto: hero → serviços, escuro → claro.
**No máximo 3 por página.** Mais que isso vira maneirismo.

**`.t-fade`** — sangria de 90px em gradiente entre duas seções claras de tom diferente.

**Corte seco** — quando as duas seções já se separam pela cor de fundo.

**Seção com virada não leva `content-visibility`.** O platô do ombro é desenhado
fora da caixa da seção, para dentro da anterior. `content-visibility:auto` (a
classe `.adiar`, que adia a renderização do que está longe da dobra) impõe
contenção de pintura e recorta tudo que sai da caixa — o ombro simplesmente
some, sem erro nenhum no console. Quem tem `.t-ombro` fica de fora do `.adiar`.

---

## 6b. Slots de imagem

Toda página nasce com mais quadros do que fotos prontas. O quadro vazio não pode
parecer imagem quebrada: ele recebe fundo próprio (mais fechado que o gradiente
de foto, com trama diagonal), uma etiqueta `IMAGEM` no canto e, no rodapé do
quadro, o briefing da foto que vai ali — proporção e o que a imagem precisa
comunicar. Some inteiro ao trocar a classe pelo `<img>`.

**A moldura declara `width:100%`.** O único filho dela é absoluto (a `<img>` ou a
legenda), então sem largura explícita ela mede zero. Em item de grade o *stretch*
disfarça — até alguém escrever `margin:0 auto` para centralizar, o que desliga o
stretch e derruba o quadro para 0×0 sem aviso.

---

## 7. CTA

Um único botão em toda a página: **pílula com anel-halo**.
Gradiente da marca 135°, texto branco 15px/500, ícone `↗` em círculo branco de 30px
à direita, anel externo de 7px em branco translúcido + sombra baixa.

**Prova social anda colada ao botão**, sempre logo abaixo:
pilha de 3 avatares (26px, sobreposição -9px, borda branca de 2px) + contagem
("+3.200 pacientes atendidos") + 5 estrelas na cor da marca.

**Ritmo de repetição:** o par botão+prova reaparece a cada 2 seções, precedido de
uma frase-costura duotom ("Agende sua consulta **e descubra como eu posso te ajudar**").
Nunca em duas seções seguidas.

**O botão nunca fica parado.** É o único elemento com animação em looping na
página: um anel pulsa para fora a cada 2,8s e um brilho atravessa a pílula a cada
5s, com descanso entre as passadas. No hover ele sobe 2px, o anel abre e acelera
para 1,3s, o brilho para 1,8s e a seta escapa na diagonal. Loop discreto o
bastante para não competir com a leitura — mas o olho sempre acha o botão.

**O botão nunca usa a cor do fundo em que está.** Proibido. Sobre seção escura ele
inverte: fundo branco, texto na cor da marca, ícone em círculo da marca com seta
branca. Sobre claro é o contrário — gradiente da marca com texto branco. Se o botão
some no fundo, o erro é do botão, não do fundo.

Link de texto com chevron `›` é o fecho de card — nunca um botão secundário.
Não existe botão fantasma / outline neste sistema.

---

## 8. Forma

| Elemento | Raio |
|---|---|
| Card | 12px |
| Card com imagem | 20px |
| Ícone em quadrado | 9px |
| Botão, chip, pílula | 999px |

Grid: largura máxima 1240px, gutter `clamp(20px, 4vw, 48px)`,
gap `clamp(18px, 1.8vw, 26px)`, respiro vertical de seção `clamp(54px, 5.2vw, 84px)`.

O respiro de seção já contou 124px de cada lado: em blocos curtos isso virava
45% da altura só de vazio. Medir a razão padding/conteúdo é o teste — passou
de um terço, está sobrando.

---

## 9. Movimento

Uma entrada só: sobe 20px e revela, `.6s cubic-bezier(.22,1,.36,1)`.

**A entrada é por seção, não por elemento.** O observador vigia a seção inteira;
quando ela encosta na viewport, marca a seção com `.in` e escalona os `.reveal`
de dentro de 70 em 70ms, com teto de 420ms para a seção não demorar a assentar.
É isso que dá a sensação de bloco entrando, em vez de peças soltas piscando.

A própria seção tem um movimento só: quando ela usa `.t-notch`, a aba desce
(`scaleY .2 → 1`) e o chevron acende logo depois. Na escada, o lance entre os
degraus se desenha (`clip-path`) depois que os cards assentam. Nada além disso.

Hover de card: `translateY(-3px)` + borda da marca.
Sem parallax, sem zoom, sem contador animado, sem texto letra a letra.
`prefers-reduced-motion` desliga tudo, inclusive o giro do selo.

**Diagramação antes de efeito.** Se a seção só funciona com a animação, a
diagramação está errada.

---

## 10. Checklist de aprovação

- [ ] Zero fonte serifada.
- [ ] Todo parágrafo de corpo tem o trecho decisivo em negrito (no máximo 2).
- [ ] Nenhum título com mais de 3 linhas.
- [ ] Nenhuma palavra viúva em título, lead ou frase-costura.
- [ ] Nenhum botão na mesma cor do fundo em que está.
- [ ] Botão com anel em looping e reação no hover.
- [ ] Hero no padrão: foto recortada do cliente, 3 chips, selo, halo no botão.
- [ ] Todo H1/H2 em duotom 400+700.
- [ ] Nenhum texto de apoio em cinza sobre fundo escuro.
- [ ] No máximo 2 seções escuras, nunca seguidas.
- [ ] No máximo 3 notches.
- [ ] Botão+prova social a cada 2 seções, nunca em duas seguidas.
- [ ] Um único estilo de botão na página inteira.
- [ ] Nenhuma linha de texto passando de 56ch.

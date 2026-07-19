// ============ Análise gratuita: seu site vende? ============
const WHATSAPP = '5585992657146';

// ---------- ícones (mesmo padrão stroke da home) ----------
const ICO = {
  clareza:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/></svg>',
  conversao:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m4 4 7.1 17 2.5-7.4L21 11.1 4 4z"/><path d="m14 14 6 6"/></svg>',
  confianca:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3.2V11c0 4.6-3 7.7-7 9-4-1.3-7-4.4-7-9V6.2z"/><path d="M9.2 12.2l2 2 3.6-4"/></svg>',
  tecnica:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12z"/></svg>',
  check:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  meio:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13c2.5-3 5.5-3 8 0s5.5 3 8 0"/></svg>',
  x:        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  duvida:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.2 9.2a2.8 2.8 0 1 1 4 2.5c-.9.5-1.2 1-1.2 1.9"/><circle cx="12" cy="17.6" r="1" fill="currentColor" stroke="none"/></svg>',
  alerta:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4 2.5 20h19z"/><path d="M12 10v4"/><circle cx="12" cy="17" r="1" fill="currentColor" stroke="none"/></svg>',
  trend:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>',
  olho:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>'
};

const CATS = {
  clareza:   { nome: 'Clareza',   desc: 'Sua mensagem' },
  conversao: { nome: 'Conversão', desc: 'Seu funil' },
  confianca: { nome: 'Confiança', desc: 'Sua prova' },
  tecnica:   { nome: 'Técnica',   desc: 'Velocidade e mobile' }
};

// peso: o quanto essa falha derruba venda na prática (usado na nota e na prioridade)
const PERGUNTAS = [
  {
    cat: 'clareza', peso: 3,
    q: 'Em 5 segundos, um estranho entende o que você vende?',
    why: 'É o tempo que o visitante dá antes de voltar pro Instagram.',
    diag: 'Sua primeira dobra não passa no teste dos 5 segundos.',
    fix: 'Reescreva a headline respondendo três coisas: o que é, pra quem é e o que a pessoa ganha. Frase de efeito genérica não conta.'
  },
  {
    cat: 'clareza', peso: 2,
    q: 'Sua headline fala do resultado do cliente, não de você?',
    why: '"Somos referência no mercado" não paga o boleto de ninguém.',
    diag: 'O site fala de você, mas o visitante quer saber dele.',
    fix: 'Troque "nós somos" e "nós fazemos" por "você consegue" e "você ganha". O cliente é o herói da página; seu negócio é o guia.'
  },
  {
    cat: 'conversao', peso: 3,
    q: 'Sua página pede UMA ação principal (e não cinco)?',
    why: 'Página que quer tudo não consegue nada.',
    diag: 'Muitos caminhos competindo pela mesma atenção.',
    fix: 'Escolha a única ação que gera negócio (orçamento, agenda, compra) e faça todos os botões da página apontarem pra ela.'
  },
  {
    cat: 'conversao', peso: 2,
    q: 'Dá pra entrar em contato sem rolar a página?',
    why: 'Lead quente não caça botão: ou acha na hora, ou desiste.',
    diag: 'Seu contato está escondido abaixo da dobra.',
    fix: 'Coloque o CTA principal na primeira tela e um botão de WhatsApp fixo acompanhando a rolagem.'
  },
  {
    cat: 'conversao', peso: 1.5,
    q: 'Seus botões dizem o que acontece depois do clique?',
    why: '"Saiba mais" e "Enviar" não vendem nada.',
    diag: 'Botões genéricos desperdiçam a última frase antes da decisão.',
    fix: 'Reescreva cada botão completando a frase "quero...". "Quero meu orçamento" converte; "Enviar" não.'
  },
  {
    cat: 'conversao', peso: 1.5,
    q: 'Seu formulário pede só o essencial (até 3 campos)?',
    why: 'Cada campo a mais é um pedágio no caminho do sim.',
    diag: 'Formulário longo está espantando lead quente.',
    fix: 'Corte pra nome + WhatsApp (ou e-mail). O resto você pergunta na conversa, quando a pessoa já disse sim.'
  },
  {
    cat: 'confianca', peso: 3,
    q: 'Tem prova visível: número real, depoimento ou resultado?',
    why: 'Promessa sem prova gera desconfiança, não desejo.',
    diag: 'Falta prova colada nas suas promessas.',
    fix: 'Ponha um número real, print de resultado ou depoimento com nome e contexto ao lado de cada promessa importante da página.'
  },
  {
    cat: 'confianca', peso: 1.5,
    q: 'Aparece gente de verdade: rosto, história, bastidor?',
    why: 'Pessoas compram de pessoas, não de fachadas.',
    diag: 'Seu site parece uma empresa sem gente dentro.',
    fix: 'Adicione foto real do time ou do processo e um parágrafo de história. Autenticidade converte mais que banco de imagem.'
  },
  {
    cat: 'confianca', peso: 1,
    q: 'Seu site foi atualizado nos últimos 6 meses?',
    why: 'Site parado passa impressão de negócio parado.',
    diag: 'Conteúdo velho mina a confiança, pro cliente e pro Google.',
    fix: 'Publique algo novo por mês: um caso, um depoimento, um post. Site vivo sinaliza negócio vivo.'
  },
  {
    cat: 'tecnica', peso: 2.5,
    q: 'No 4G do celular, seu site abre em menos de 3 segundos?',
    why: 'Mais da metade das visitas abandona o que demora.',
    diag: 'A velocidade derruba sua conversão antes da página aparecer.',
    fix: 'Comprima as imagens (WebP), corte plugin e script inútil e meça no PageSpeed Insights. Meta: abaixo de 3 segundos no celular.'
  },
  {
    cat: 'tecnica', peso: 2.5,
    q: 'No celular, dá pra ler e clicar em tudo sem dar zoom?',
    why: 'É onde a maioria dos seus clientes está te vendo.',
    diag: 'Experiência mobile falhando é venda escorrendo.',
    fix: 'Teste você mesmo no celular: texto legível sem zoom, botão com área de toque folgada, nada estourando a tela.'
  },
  {
    cat: 'tecnica', peso: 1.5,
    q: 'Você sabe quantas visitas viram contato todo mês?',
    why: 'O que não é medido não tem como melhorar.',
    diag: 'Sem medição, todo palpite sobre o site vale igual.',
    fix: 'Instale o Google Analytics (grátis) e acompanhe dois números: visitas e contatos. Só isso já muda suas decisões.'
  }
];

// fator: quanto da pontuação da pergunta a resposta preserva
const OPCOES = [
  { label: 'Sim',           fator: 1,    ico: 'check',  cls: 'op-sim'  },
  { label: 'Mais ou menos', fator: 0.45, ico: 'meio',   cls: 'op-meio' },
  { label: 'Não',           fator: 0,    ico: 'x',      cls: 'op-nao'  },
  { label: 'Não sei',       fator: 0.2,  ico: 'duvida', cls: 'op-nsei' }
];

const elStart = document.getElementById('anStart');
const elQuiz = document.getElementById('anQuiz');
const elResult = document.getElementById('anResult');

if (elStart && elQuiz && elResult) {
  const respostas = [];
  let atual = 0;

  const elBar = document.getElementById('anBar');
  const elStep = document.getElementById('anStep');
  const elCat = document.getElementById('anCat');
  const elQ = document.getElementById('anQuestion');
  const elWhy = document.getElementById('anWhy');
  const elOps = document.getElementById('anOptions');
  const elBack = document.getElementById('anBack');

  function mostraPergunta(n) {
    atual = n;
    const p = PERGUNTAS[n];
    elStep.textContent = (n + 1) + ' / ' + PERGUNTAS.length;
    elBar.style.width = (n / PERGUNTAS.length * 100) + '%';
    elCat.innerHTML = ICO[p.cat] + '<span>' + CATS[p.cat].nome + '</span>';
    elCat.className = 'an-cat-tag ct-' + p.cat;
    elQ.textContent = p.q;
    elWhy.textContent = p.why;
    elBack.hidden = n === 0;
    elOps.innerHTML = '';
    OPCOES.forEach((op, k) => {
      const b = document.createElement('button');
      b.className = 'an-op ' + op.cls;
      b.innerHTML = '<i class="an-op-ico">' + ICO[op.ico] + '</i><span>' + op.label + '</span>';
      if (respostas[n] === k) b.classList.add('sel');
      b.addEventListener('click', () => {
        respostas[n] = k;
        b.classList.add('sel');
        setTimeout(() => {
          if (n + 1 < PERGUNTAS.length) { mostraPergunta(n + 1); }
          else { mostraResultado(); }
        }, 160);
      });
      elOps.appendChild(b);
    });
    elQuiz.classList.remove('swap'); void elQuiz.offsetWidth; elQuiz.classList.add('swap');
  }

  function notaCategoria(cat) {
    let soma = 0, total = 0;
    PERGUNTAS.forEach((p, i) => {
      if (p.cat !== cat) return;
      total += p.peso;
      soma += p.peso * OPCOES[respostas[i]].fator;
    });
    return Math.round(soma / total * 100);
  }

  function mostraResultado() {
    // nota ponderada: pergunta que derruba mais venda pesa mais
    let soma = 0, pesoTotal = 0;
    PERGUNTAS.forEach((p, i) => {
      pesoTotal += p.peso;
      soma += p.peso * OPCOES[respostas[i]].fator;
    });
    const nota = Math.round(soma / pesoTotal * 100);

    elQuiz.hidden = true;
    elResult.hidden = false;
    elResult.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // ---------- veredito ----------
    let titulo, sub, tom, icoV;
    if (nota <= 35) {
      titulo = 'Site vitrine'; tom = 'ruim'; icoV = 'x';
      sub = 'Bonito ou não, hoje ele não trabalha pra você: está deixando venda na mesa todos os dias. A boa notícia: cada vazamento abaixo tem conserto conhecido.';
    } else if (nota <= 55) {
      titulo = 'Vazando forte'; tom = 'ruim'; icoV = 'alerta';
      sub = 'A base existe, mas os vazamentos estão levando embora boa parte do resultado. Siga o plano de ataque abaixo na ordem.';
    } else if (nota <= 75) {
      titulo = 'Quase lá'; tom = 'medio'; icoV = 'trend';
      sub = 'O grosso está de pé. O que separa você de um site que vende de verdade são os ajustes finos abaixo.';
    } else {
      titulo = 'Máquina afiada'; tom = 'bom'; icoV = 'check';
      sub = 'Seu site está acima da média do mercado. Os pontos abaixo são o fino que separa bom de imbatível.';
    }
    const badge = document.getElementById('anVerdictIco');
    badge.innerHTML = ICO[icoV];
    badge.className = 'an-verdict-ico vi-' + tom;
    document.getElementById('anVerdict').textContent = titulo;
    document.getElementById('anVerdictSub').textContent = sub;

    // ---------- gauge ----------
    const fill = document.getElementById('anGaugeFill');
    const circ = 2 * Math.PI * 52;
    fill.style.strokeDasharray = circ;
    fill.style.strokeDashoffset = circ;
    fill.classList.remove('ruim', 'medio', 'bom');
    fill.classList.add(tom);
    requestAnimationFrame(() => { fill.style.strokeDashoffset = circ * (1 - nota / 100); });

    const elScore = document.getElementById('anScore');
    let cur = 0;
    const passo = Math.max(1, Math.round(nota / 40));
    const timer = setInterval(() => {
      cur = Math.min(nota, cur + passo);
      elScore.textContent = cur;
      if (cur >= nota) clearInterval(timer);
    }, 28);

    // ---------- raio-x por pilar ----------
    const catNotas = {};
    Object.keys(CATS).forEach(c => { catNotas[c] = notaCategoria(c); });
    document.getElementById('anBars').innerHTML = Object.keys(CATS).map(c => {
      const v = catNotas[c];
      const t = v <= 40 ? 'ruim' : v <= 70 ? 'medio' : 'bom';
      return '<div class="an-bar-row">'
        + '<i class="an-bar-ico ct-' + c + '">' + ICO[c] + '</i>'
        + '<div class="an-bar-info"><b>' + CATS[c].nome + '</b><span>' + CATS[c].desc + '</span></div>'
        + '<div class="an-bar-track"><span class="an-bar-fill bf-' + t + '" style="width:0" data-w="' + v + '"></span></div>'
        + '<em class="an-bar-val">' + v + '</em>'
        + '</div>';
    }).join('');
    setTimeout(() => {
      document.querySelectorAll('.an-bar-fill').forEach(f => { f.style.width = f.dataset.w + '%'; });
    }, 350);

    // ---------- leitura inteligente (cruzamento de respostas) ----------
    const fator = i => OPCOES[respostas[i]].fator;
    const naoSei = respostas.filter(k => OPCOES[k].label === 'Não sei').length;
    const insights = [];
    if (fator(9) < 0.5 && fator(10) < 0.5) {
      insights.push('Alerta técnico: antes de mexer em texto ou design, resolva velocidade e mobile. Hoje boa parte dos visitantes desiste antes de ver o seu conteúdo.');
    } else if (catNotas.clareza <= 50) {
      insights.push('O padrão que mais se repete no seu resultado é de mensagem: o site fala, mas não diz. Clareza vem antes de estética, sempre.');
    } else if (catNotas.confianca <= 50) {
      insights.push('Seu maior vazamento é confiança: o visitante até entende a oferta, mas não encontra motivo pra acreditar nela. Prova resolve.');
    } else if (catNotas.conversao <= 50) {
      insights.push('Seu site informa bem, mas não conduz: falta caminho claro até o contato. Conversão é sobre facilitar o sim.');
    }
    if (naoSei >= 3) {
      insights.push('Você respondeu "não sei" ' + naoSei + ' vezes, e isso já é um diagnóstico: ninguém está olhando pros números do seu site. Medir é o primeiro conserto.');
    }
    const elIns = document.getElementById('anInsight');
    if (insights.length) {
      elIns.hidden = false;
      elIns.innerHTML = '<i>' + ICO.olho + '</i><div><b>Leitura da Fluxxo</b>'
        + insights.map(t => '<p>' + t + '</p>').join('') + '</div>';
    } else {
      elIns.hidden = true;
    }

    // ---------- plano de ataque: falhas ordenadas por impacto ----------
    const falhas = [];
    PERGUNTAS.forEach((p, i) => {
      const f = OPCOES[respostas[i]].fator;
      if (f < 1) falhas.push({ p, impacto: p.peso * (1 - f) });
    });
    falhas.sort((a, b) => b.impacto - a.impacto);
    const top = falhas.slice(0, 3);
    const resto = falhas.slice(3);

    const elPlan = document.getElementById('anPlan');
    if (falhas.length === 0) {
      elPlan.innerHTML = '<div class="an-diag-ok"><i>' + ICO.check + '</i>Nenhum vazamento encontrado. Sério, respeito: isso é raro por aqui.</div>';
    } else {
      elPlan.innerHTML = '<b class="an-diag-title">Plano de ataque, na ordem certa</b>'
        + top.map((f, k) =>
          '<div class="an-plan-item">'
          + '<span class="an-plan-n">0' + (k + 1) + '</span>'
          + '<div class="an-plan-body">'
          + '<i class="an-plan-cat ct-' + f.p.cat + '">' + ICO[f.p.cat] + CATS[f.p.cat].nome + '</i>'
          + '<b>' + f.p.diag + '</b>'
          + '<p><em>Como resolver:</em> ' + f.p.fix + '</p>'
          + '</div></div>'
        ).join('')
        + (resto.length
          ? '<b class="an-diag-title an-mt">Depois disso, olhe também</b>'
            + resto.map(f => '<div class="an-minor"><i class="ct-' + f.p.cat + '">' + ICO[f.p.cat] + '</i><span>' + f.p.diag + '</span></div>').join('')
          : '');
    }

    // ---------- WhatsApp com o diagnóstico completo ----------
    // acima de 85 o site já está redondo: não faz sentido oferecer plano de correção
    const elWhats = document.getElementById('anWhats');
    const elWhatsNote = document.getElementById('anWhatsNote');
    if (nota > 85) {
      elWhats.style.display = 'none';
      elWhatsNote.style.display = 'none';
    } else {
      elWhats.style.display = '';
      elWhatsNote.style.display = '';
      const url = (document.getElementById('anUrl').value || 'não informei').trim();
      const msg = '*Análise gratuita · Fluxxo*\n\n'
        + '*Nota:* ' + nota + '/100 (' + titulo + ')\n'
        + '*Meu site:* ' + url + '\n\n'
        + '*Raio-x por pilar*\n'
        + 'Clareza: ' + catNotas.clareza + '\n'
        + 'Conversão: ' + catNotas.conversao + '\n'
        + 'Confiança: ' + catNotas.confianca + '\n'
        + 'Técnica: ' + catNotas.tecnica + '\n\n'
        + (top.length ? '*Prioridade nº 1:* ' + top[0].p.diag + '\n\n' : '')
        + 'Quero o plano de correção completo!';
      elWhats.href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(msg);
    }
  }

  document.getElementById('anBegin').addEventListener('click', () => {
    elStart.hidden = true;
    elQuiz.hidden = false;
    mostraPergunta(0);
  });
  elBack.addEventListener('click', () => { if (atual > 0) mostraPergunta(atual - 1); });
  document.getElementById('anAgain').addEventListener('click', () => {
    respostas.length = 0;
    elResult.hidden = true;
    elStart.hidden = false;
    elStart.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

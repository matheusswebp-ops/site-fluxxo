// Painel de candidatos da vaga de design.
// Tudo que vem do candidato entra na tela por textContent (nunca innerHTML).
(() => {
  const API = '/api/candidaturas';
  const CHAVE = 'fluxxo_painel_vaga';
  const $ = id => document.getElementById(id);

  let senha = '';
  try { senha = sessionStorage.getItem(CHAVE) || ''; } catch {}
  let dados = [];
  let statusLista = ['novo', 'em análise', 'teste enviado', 'aprovado', 'reprovado'];

  const CAMPOS = [
    ['whatsapp', 'WhatsApp'], ['email', 'E-mail'], ['cidade', 'Cidade'], ['instagram', 'Instagram'],
    ['portfolio', 'Portfólio'], ['experiencia', 'Experiência'], ['ferramentas', 'Ferramentas'],
    ['formatos', 'Já entregou'], ['nichos', 'Nichos'], ['disponibilidade', 'Disponibilidade'],
    ['pecas_semana', 'Peças por semana'], ['outros_clientes', 'Outros clientes/emprego'], ['inicio', 'Início'],
    ['aceita_valor', 'Aceita R$ 1.000'], ['pretensao', 'Pretensão'], ['mei', 'Nota fiscal'],
    ['teste_pratico', 'Topa teste prático'], ['motivo', 'Por que a Fluxxo'],
    ['utm_source', 'utm_source'], ['utm_medium', 'utm_medium'], ['utm_campaign', 'utm_campaign'],
    ['utm_content', 'utm_content'], ['utm_term', 'utm_term'],
  ];

  function el(tag, attrs = {}, ...filhos) {
    const n = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'text') n.textContent = v;
      else if (k === 'class') n.className = v;
      else n.setAttribute(k, v);
    });
    filhos.flat().forEach(f => f && n.append(f));
    return n;
  }

  const texto = v => Array.isArray(v) ? v.join(', ') : (v || '');
  const data = iso => new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  const linkSeguro = url => {
    const u = /^https?:\/\//i.test(url) ? url : 'https://' + url;
    try { const p = new URL(u); return /^https?:$/.test(p.protocol) ? p.href : ''; } catch { return ''; }
  };

  async function api(metodo, corpo) {
    const r = await fetch(API, {
      method: metodo,
      headers: { authorization: 'Bearer ' + senha, ...(corpo ? { 'content-type': 'application/json' } : {}) },
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { const e = new Error(j.erro || 'HTTP ' + r.status); e.status = r.status; throw e; }
    return j;
  }

  function mostrarLogin(msg) {
    $('rpApp').hidden = true;
    $('rpLogin').hidden = false;
    $('rpLoginErr').hidden = !msg;
    $('rpLoginErr').textContent = msg || '';
    $('rpSenha').focus();
  }

  async function carregar() {
    try {
      const j = await api('GET');
      dados = j.candidaturas || [];
      if (j.status) statusLista = j.status;
      try { sessionStorage.setItem(CHAVE, senha); } catch {}
      $('rpLogin').hidden = true;
      $('rpApp').hidden = false;
      preencherFiltroStatus();
      render();
    } catch (e) {
      try { sessionStorage.removeItem(CHAVE); } catch {}
      mostrarLogin(e.status === 401 ? 'Senha incorreta.'
        : e.message === 'armazenamento_nao_configurado' ? 'O armazenamento ainda não foi ligado no Cloudflare.'
        : 'Não foi possível carregar agora.');
    }
  }

  function preencherFiltroStatus() {
    const s = $('fStatus');
    if (s.options.length > 1) return;
    statusLista.forEach(v => s.append(el('option', { value: v, text: v })));
  }

  function filtrados() {
    const q = $('fBusca').value.trim().toLowerCase();
    const t = $('fTeste').value, v = $('fValor').value, st = $('fStatus').value;
    return dados.filter(c =>
      (!t || c.teste_pratico === t) &&
      (!v || c.aceita_valor === v) &&
      (!st || c.status === st) &&
      (!q || JSON.stringify(c).toLowerCase().includes(q)));
  }

  function render() {
    $('sTotal').textContent = dados.length;
    $('sTeste').textContent = dados.filter(c => c.teste_pratico === 'Sim').length;
    $('sValor').textContent = dados.filter(c => c.aceita_valor === 'Sim').length;
    $('sAprov').textContent = dados.filter(c => c.status === 'aprovado').length;

    const lista = $('rpList');
    const abertos = new Set([...lista.querySelectorAll('details[open]')].map(d => d.dataset.id));
    lista.replaceChildren();
    const itens = filtrados();
    if (!itens.length) {
      lista.append(el('p', { class: 'rp-empty', text: dados.length ? 'Nenhum candidato com esses filtros.' : 'Nenhuma candidatura ainda.' }));
      return;
    }
    itens.forEach(c => lista.append(cartao(c, abertos.has(c.id))));
  }

  function tag(rotulo, valor) {
    const cls = valor === 'Sim' ? 'rp-tag ok' : valor === 'Não' ? 'rp-tag no' : 'rp-tag';
    return el('span', { class: cls, text: `${rotulo}: ${valor || '—'}` });
  }

  function cartao(c, aberto) {
    const det = el('details', { class: 'rp-card', 'data-id': c.id });
    if (aberto) det.open = true;

    det.append(el('summary', { class: 'rp-sum' },
      el('div', {},
        el('div', { class: 'rp-name', text: c.nome }),
        el('div', { class: 'rp-meta', text: `${c.cidade} · ${c.experiencia} · ${data(c.criado_em)}` })),
      el('div', { class: 'rp-tags' }, tag('Teste', c.teste_pratico), tag('R$ 1.000', c.aceita_valor), el('span', { class: 'rp-tag', text: c.pecas_semana + ' peças/sem' })),
      el('span', { class: 'rp-status', 'data-s': c.status, text: c.status })));

    const dl = el('dl', { class: 'rp-dl' });
    CAMPOS.forEach(([k, rotulo]) => {
      const v = texto(c[k]);
      if (!v) return;
      let dd;
      if (k === 'portfolio' && linkSeguro(v)) dd = el('dd', {}, el('a', { href: linkSeguro(v), target: '_blank', rel: 'noopener noreferrer', text: v }));
      else if (k === 'whatsapp') {
        const num = v.replace(/\D/g, '');
        dd = el('dd', {}, el('a', { href: 'https://wa.me/' + (num.length <= 11 ? '55' + num : num), target: '_blank', rel: 'noopener', text: v }));
      } else if (k === 'email') dd = el('dd', {}, el('a', { href: 'mailto:' + v, text: v }));
      else dd = el('dd', { text: v });
      dl.append(el('dt', { text: rotulo }), dd);
    });

    const sel = el('select', {});
    statusLista.forEach(s => {
      const o = el('option', { value: s, text: s });
      if (s === c.status) o.selected = true;
      sel.append(o);
    });
    const nota = el('textarea', { placeholder: 'Anotações internas sobre o candidato…' });
    nota.value = c.nota || '';
    const aviso = el('div', { class: 'rp-saved', text: c.atualizado_em ? 'Atualizado em ' + data(c.atualizado_em) : '' });
    const salvar = el('button', { class: 'rp-btn pri', type: 'button', text: 'Salvar' });

    salvar.addEventListener('click', async () => {
      salvar.disabled = true;
      aviso.textContent = 'Salvando…';
      try {
        const j = await api('PATCH', { id: c.id, status: sel.value, nota: nota.value });
        Object.assign(c, j.candidatura);
        render();
      } catch (e) {
        aviso.textContent = e.status === 401 ? 'Sessão expirou, entre de novo.' : 'Não salvou. Tente de novo.';
        salvar.disabled = false;
      }
    });

    det.append(el('div', { class: 'rp-body' },
      dl,
      el('div', { class: 'rp-side' },
        el('label', { text: 'Status' }), sel,
        el('label', { text: 'Anotações' }), nota,
        el('div', { class: 'rp-actions' }, salvar), aviso)));
    return det;
  }

  function baixarCsv() {
    const colunas = [['criado_em', 'Data'], ['nome', 'Nome'], ...CAMPOS, ['status', 'Status'], ['nota', 'Anotações']];
    const esc = v => {
      let s = texto(v);
      if (/^[=+\-@]/.test(s)) s = "'" + s; // evita fórmula ao abrir no Excel/Sheets
      return '"' + s.replace(/"/g, '""') + '"';
    };
    const linhas = [colunas.map(c => esc(c[1])).join(';')]
      .concat(filtrados().map(c => colunas.map(([k]) => esc(k === 'criado_em' ? data(c[k]) : c[k])).join(';')));
    const blob = new Blob(['﻿' + linhas.join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = el('a', { href: URL.createObjectURL(blob), download: 'candidatos-vaga-design.csv' });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  $('rpLoginForm').addEventListener('submit', e => {
    e.preventDefault();
    senha = $('rpSenha').value;
    carregar();
  });
  $('rpReload').addEventListener('click', carregar);
  $('rpCsv').addEventListener('click', baixarCsv);
  $('rpSair').addEventListener('click', () => {
    senha = '';
    try { sessionStorage.removeItem(CHAVE); } catch {}
    $('rpSenha').value = '';
    mostrarLogin();
  });
  ['fBusca', 'fTeste', 'fValor', 'fStatus'].forEach(id => $(id).addEventListener('input', render));

  if (senha) carregar(); else mostrarLogin();
})();

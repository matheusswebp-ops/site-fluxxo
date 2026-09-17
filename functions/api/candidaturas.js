// Candidaturas da vaga de design (fluxxo.io/vaga-design)
//
// POST  público   → grava uma candidatura
// GET             → lista todas (painel fluxxo.io/vaga-design-respostas)
// PATCH           → muda status/nota de uma candidatura
// Sem senha, por decisão do Mateus: o painel é aberto para quem tiver o endereço.
//
// Precisa, no projeto do Cloudflare Pages (Settings → Bindings):
//   KV namespace ligado como  CANDIDATURAS

const PREFIXO = 'c:';
const STATUS = ['novo', 'em análise', 'teste enviado', 'aprovado', 'reprovado'];

// campos aceitos: nome → [obrigatório, tamanho máximo]
const CAMPOS = {
  nome: [true, 120], email: [true, 160], whatsapp: [true, 30], cidade: [true, 120],
  instagram: [false, 120], portfolio: [true, 400],
  experiencia: [true, 40], nichos: [false, 400],
  disponibilidade: [true, 60], pecas_semana: [true, 40], outros_clientes: [true, 20], inicio: [true, 40],
  aceita_valor: [true, 40], pretensao: [false, 120], mei: [true, 40], teste_pratico: [true, 20],
  motivo: [false, 2000],
  utm_source: [false, 200], utm_medium: [false, 200], utm_campaign: [false, 200],
  utm_content: [false, 200], utm_term: [false, 200],
};
const LISTAS = { ferramentas: 12, formatos: 12 };

const json = (dados, status = 200) =>
  new Response(JSON.stringify(dados), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

const semArmazenamento = env => !env.CANDIDATURAS;

export async function onRequestPost({ request, env }) {
  if (semArmazenamento(env)) return json({ erro: 'armazenamento_nao_configurado' }, 503);
  if (Number(request.headers.get('content-length') || 0) > 20000) return json({ erro: 'muito_grande' }, 413);

  let corpo;
  try { corpo = await request.json(); } catch { return json({ erro: 'json_invalido' }, 400); }
  if (!corpo || typeof corpo !== 'object') return json({ erro: 'json_invalido' }, 400);

  // honeypot: humano não vê esse campo
  if (corpo.site_empresa) return json({ ok: true });

  const c = {};
  const faltando = [];
  for (const [campo, [obrigatorio, max]] of Object.entries(CAMPOS)) {
    const v = typeof corpo[campo] === 'string' ? corpo[campo].trim().slice(0, max) : '';
    if (obrigatorio && !v) faltando.push(campo);
    c[campo] = v;
  }
  for (const [campo, max] of Object.entries(LISTAS)) {
    const v = Array.isArray(corpo[campo]) ? corpo[campo] : [];
    c[campo] = v.filter(x => typeof x === 'string' && x.trim()).slice(0, max).map(x => x.trim().slice(0, 60));
    if (!c[campo].length) faltando.push(campo);
  }
  if (corpo.consentimento !== true) faltando.push('consentimento');
  if (c.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) faltando.push('email');
  if (faltando.length) return json({ erro: 'campos_invalidos', campos: faltando }, 422);

  const agora = Date.now();
  // chave com o tempo invertido: a listagem do KV já sai da mais nova pra mais antiga
  const id = PREFIXO + String(9999999999999 - agora).padStart(13, '0') + ':' + crypto.randomUUID().slice(0, 8);
  const registro = { id, criado_em: new Date(agora).toISOString(), status: 'novo', nota: '', ...c };

  await env.CANDIDATURAS.put(id, JSON.stringify(registro));
  return json({ ok: true });
}

export async function onRequestGet({ request, env }) {
  if (semArmazenamento(env)) return json({ erro: 'armazenamento_nao_configurado' }, 503);

  const chaves = [];
  let cursor;
  do {
    const pagina = await env.CANDIDATURAS.list({ prefix: PREFIXO, cursor });
    chaves.push(...pagina.keys.map(k => k.name));
    cursor = pagina.list_complete ? undefined : pagina.cursor;
  } while (cursor);

  const itens = await Promise.all(chaves.map(k => env.CANDIDATURAS.get(k, 'json')));
  return json({ candidaturas: itens.filter(Boolean), status: STATUS });
}

export async function onRequestPatch({ request, env }) {
  if (semArmazenamento(env)) return json({ erro: 'armazenamento_nao_configurado' }, 503);

  let corpo;
  try { corpo = await request.json(); } catch { return json({ erro: 'json_invalido' }, 400); }
  const id = corpo && typeof corpo.id === 'string' ? corpo.id : '';
  if (!id.startsWith(PREFIXO)) return json({ erro: 'id_invalido' }, 400);

  const atual = await env.CANDIDATURAS.get(id, 'json');
  if (!atual) return json({ erro: 'nao_encontrada' }, 404);

  if (typeof corpo.status === 'string') {
    if (!STATUS.includes(corpo.status)) return json({ erro: 'status_invalido' }, 400);
    atual.status = corpo.status;
  }
  if (typeof corpo.nota === 'string') atual.nota = corpo.nota.slice(0, 2000);
  atual.atualizado_em = new Date().toISOString();

  await env.CANDIDATURAS.put(id, JSON.stringify(atual));
  return json({ ok: true, candidatura: atual });
}

// Vaga de design: validação, UTMs e envio para /api/candidaturas
(() => {
  const form = document.getElementById('vgForm');
  if (!form) return;
  const errBox = document.getElementById('vgErr');
  const submit = form.querySelector('.ct-submit');
  const pretensao = document.getElementById('vgPretensao');
  const WHATS = 'https://wa.me/5585992657146?text=' + encodeURIComponent('Oi! Tentei me candidatar à vaga de design pelo site, mas o formulário deu erro.');

  // UTMs da URL para os campos ocultos
  const params = new URLSearchParams(location.search);
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(k => {
    if (params.get(k)) form.elements[k].value = params.get(k);
  });

  // pretensão só aparece se não aceitar o valor
  form.querySelectorAll('input[name="aceita_valor"]').forEach(r =>
    r.addEventListener('change', () => { pretensao.hidden = r.value !== 'Não' || !r.checked; }));

  // tira o erro assim que a pessoa corrige
  form.addEventListener('input', e => {
    e.target.closest('.is-err')?.classList.remove('is-err');
    if (!form.querySelector('.is-err')) errBox.hidden = true;
  });

  const valor = n => (form.elements[n]?.value || '').trim();
  const marcados = n => [...form.querySelectorAll(`input[name="${n}"]:checked`)].map(i => i.value);

  function coletar() {
    const d = {};
    ['nome', 'email', 'whatsapp', 'cidade', 'instagram', 'portfolio', 'nichos', 'pretensao', 'motivo', 'site_empresa',
     'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(n => { d[n] = valor(n); });
    ['experiencia', 'disponibilidade', 'pecas_semana', 'outros_clientes', 'inicio', 'aceita_valor', 'mei', 'teste_pratico']
      .forEach(n => { d[n] = marcados(n)[0] || ''; });
    d.ferramentas = marcados('ferramentas');
    d.formatos = marcados('formatos');
    d.consentimento = document.getElementById('fConsent').checked;
    if (d.aceita_valor !== 'Não') d.pretensao = '';
    return d;
  }

  function validar(d) {
    const erros = [];
    const texto = { nome: 'fNome', email: 'fEmail', whatsapp: 'fWhats', cidade: 'fCidade', portfolio: 'fPort' };
    Object.entries(texto).forEach(([k, id]) => {
      const ok = k === 'email' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)
        : k === 'whatsapp' ? d.whatsapp.replace(/\D/g, '').length >= 10
        : d[k].length > 1;
      if (!ok) { document.getElementById(id).closest('.ct-field').classList.add('is-err'); erros.push(id); }
    });
    ['experiencia', 'ferramentas', 'formatos', 'disponibilidade', 'pecas_semana', 'outros_clientes', 'inicio', 'aceita_valor', 'mei', 'teste_pratico']
      .forEach(k => {
        const vazio = Array.isArray(d[k]) ? !d[k].length : !d[k];
        if (vazio) { form.querySelector(`[data-q="${k}"]`).classList.add('is-err'); erros.push(k); }
      });
    if (!d.consentimento) { form.querySelector('[data-q="consentimento"]').classList.add('is-err'); erros.push('consentimento'); }
    return erros;
  }

  function mostrarErro(html) {
    errBox.innerHTML = html;
    errBox.hidden = false;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    errBox.hidden = true;
    form.querySelectorAll('.is-err').forEach(el => el.classList.remove('is-err'));
    // reinicia a animação de tremida
    void form.offsetWidth;

    const d = coletar();
    const erros = validar(d);
    if (erros.length) {
      mostrarErro('Faltou preencher algumas respostas, marcadas em rosa.');
      form.querySelector('.is-err')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    submit.classList.add('loading');
    submit.disabled = true;
    try {
      const r = await fetch('/api/candidaturas', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(d),
      });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      // página de obrigado levando os UTMs junto
      const utms = new URLSearchParams();
      params.forEach((v, k) => { if (k.startsWith('utm')) utms.set(k, v); });
      location.href = '/obrigado-vaga-design' + (utms.toString() ? '?' + utms : '');
      return;
    } catch (err) {
      mostrarErro(`Não conseguimos enviar agora. Tente de novo em instantes ou <a href="${WHATS}" target="_blank" rel="noopener">fale com a gente no WhatsApp</a>.`);
      // botão só volta se deu erro; no sucesso fica carregando até a página trocar
      submit.classList.remove('loading');
      submit.disabled = false;
    }
  });
})();

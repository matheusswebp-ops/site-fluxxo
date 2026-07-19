// Nav (padrão da home): estado scrolled + menu mobile
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 10), { passive: true });

const burger = document.getElementById('burger');
const mpanel = document.getElementById('mpanel');
if (burger && mpanel) {
  burger.addEventListener('click', () => burger.setAttribute('aria-expanded', mpanel.classList.toggle('open')));
  mpanel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mpanel.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }));
}

// Reveal ida e volta (mesma pegada das outras páginas)
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduce) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => e.target.classList.toggle('in', e.isIntersecting));
  }, { threshold: 0.12, rootMargin: '-40px 0px -40px 0px' });
  document.querySelectorAll('.b-rv').forEach(el => io.observe(el));
} else {
  document.querySelectorAll('.b-rv').forEach(el => el.classList.add('in'));
}

// Filtros por categoria (o destaque também respeita o filtro)
const cards = [...document.querySelectorAll('.b-card, .feat-card')];
document.querySelectorAll('.b-filters button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.b-filters .active')?.classList.remove('active');
    btn.classList.add('active');
    const f = btn.dataset.filter;
    cards.forEach(c => {
      const show = f === 'all' || c.dataset.cat === f;
      c.style.display = show ? '' : 'none';
    });
  });
});

// Newsletter (feedback visual; integrar com a ferramenta de e-mail depois)
const form = document.getElementById('newsForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('newsEmail');
    const btn = form.querySelector('.b-news-btn');
    if (!email.value || !email.value.includes('@')) { email.focus(); return; }
    btn.textContent = 'Recebido! ✓';
    btn.classList.add('ok');
    email.value = '';
    setTimeout(() => { btn.textContent = 'Quero receber'; btn.classList.remove('ok'); }, 3200);
  });
}

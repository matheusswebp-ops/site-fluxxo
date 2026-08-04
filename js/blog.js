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

// O formulario de newsletter foi removido do HTML: ele fingia sucesso e
// descartava o e-mail digitado, sem backend nenhum por tras. No lugar dele
// o bloco agora leva pra analise.html, que e uma entrega real.

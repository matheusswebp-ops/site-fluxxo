const ASSET_VERSION = '20260831c';

const slides = [
  'img/carrossel-basicus-v7-1.jpg',
  'img/carrossel-basicus-v7-2.jpg',
  'img/carrossel-basicus-v7-3.jpg',
  'img/carrossel-basicus-v7-4.jpg',
  'img/carrossel-basicus-v7-5.jpg'
].map(src => `${src}?v=${ASSET_VERSION}`);

const track = document.getElementById('track');
const dashesEl = document.getElementById('dashes');
const counterText = document.getElementById('counterText');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const stage = document.getElementById('stage');

let index = 0;

slides.forEach((src, i) => {
  const div = document.createElement('div');
  div.className = 'slide';
  const img = document.createElement('img');
  img.src = src;
  img.alt = '';
  img.draggable = false;
  img.loading = i === 0 ? 'eager' : 'lazy';
  div.appendChild(img);
  track.appendChild(div);
});

slides.forEach((_, i) => {
  const d = document.createElement('div');
  d.className = 'dash' + (i === 0 ? ' active' : '');
  dashesEl.appendChild(d);
});

function render() {
  track.style.transform = `translateX(-${index * 100}%)`;
  counterText.textContent = `${index + 1}/${slides.length}`;
  [...dashesEl.children].forEach((d, i) => d.classList.toggle('active', i === index));
  prevBtn.disabled = index === 0;
  nextBtn.disabled = index === slides.length - 1;
}

function goTo(i) {
  index = Math.max(0, Math.min(slides.length - 1, i));
  render();
}

prevBtn.addEventListener('click', () => goTo(index - 1));
nextBtn.addEventListener('click', () => goTo(index + 1));

let startX = null;
stage.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
stage.addEventListener('touchend', e => {
  if (startX === null) return;
  const dx = e.changedTouches[0].clientX - startX;
  if (Math.abs(dx) > 40) { dx < 0 ? goTo(index + 1) : goTo(index - 1); }
  startX = null;
});

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') goTo(index + 1);
  if (e.key === 'ArrowLeft') goTo(index - 1);
});

render();

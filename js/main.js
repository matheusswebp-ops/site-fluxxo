// ---------- Carrosséis independentes ----------
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('.carousel').forEach(car=>{
  const slidesEl = car.querySelector('.slides');
  const slides = [...car.querySelectorAll('.slide')];
  const dotsWrap = car.querySelector('.dots');
  let i = 0;

  slides.forEach((_,idx)=>{
    const b=document.createElement('button');
    b.setAttribute('aria-label','Slide '+(idx+1));
    b.addEventListener('click',()=>go(idx));
    dotsWrap.appendChild(b);
  });
  const dots=[...dotsWrap.children];

  function go(n){
    i=(n+slides.length)%slides.length;
    slidesEl.style.transform='translateX(-'+(i*100)+'%)';
    dots.forEach((d,k)=>d.classList.toggle('on',k===i));
  }
  function next(){go(i+1)}
  function prev(){go(i-1)}

  car.querySelector('.next').addEventListener('click',next);
  car.querySelector('.prev').addEventListener('click',prev);

  // swipe (touch)
  let x0=null;
  car.addEventListener('touchstart',e=>{x0=e.touches[0].clientX;},{passive:true});
  car.addEventListener('touchend',e=>{
    if(x0===null)return;
    const dx=e.changedTouches[0].clientX-x0;
    if(Math.abs(dx)>40){ dx<0?next():prev(); }
    x0=null;
  });
  // teclado
  car.addEventListener('keydown',e=>{
    if(e.key==='ArrowRight')next();
    if(e.key==='ArrowLeft')prev();
  });

  go(0);
});

// ---------- IDENTIDADE VISUAL: a página veste a marca ----------
// Para colocar o material real de cada marca:
//   logo: 'img/identidade/minha-marca/logo.png'  (ou deixe null p/ wordmark em texto)
//   apps: ['img/identidade/minha-marca/app-1.jpg', ...]  (mockups/aplicações)
//   cores: paper=fundo, paper2=superfície, ink=texto, soft=texto secundário, accent=destaque
const BRANDS = [
  {
    nome:'Fazenda', destaque:'Caverá',
    tagline:'Identidade completa para pecuária de corte: marca sólida que carrega a força da tradição com visão de evolução constante.',
    cores:{paper:'#f7f5ea', paper2:'#ffffff', ink:'#24402a', soft:'#6d7d63', accent:'#7f9c3f', line:'rgba(36,64,42,.16)'},
    logo:'img/identidade/fazenda-cavera/logo.jpg',
    appRatio:'16/9',
    // todas as 33 lâminas do deck, em ordem
    apps:Array.from({length:33},(_,k)=>'img/identidade/fazenda-cavera/lamina-'+String(k+1).padStart(2,'0')+'.jpg')
  },
  {
    nome:'China', destaque:'Tour',
    tagline:'Brandbook completo: conectando empresários brasileiros às oportunidades reais da China, com confiança, conexão e força.',
    cores:{paper:'#0A1B3A', paper2:'#13294f', ink:'#f4f6fb', soft:'#9fb0d0', accent:'#E31B23', line:'rgba(244,246,251,.14)'},
    logo:'img/identidade/chinatour/logo.jpg',
    appRatio:'16/9',
    // todas as 30 lâminas do brandbook, em ordem
    apps:Array.from({length:30},(_,k)=>'img/identidade/chinatour/lamina-'+String(k+1).padStart(2,'0')+'.jpg')
  },
  ];

const ROOT = document.documentElement;
const DEFAULT_VARS = ['--paper','--paper-2','--ink','--ink-soft','--cobalt','--cobalt-light','--line'];
let brandIdx = 0;

function aplicaTema(c){
  ROOT.style.setProperty('--paper', c.paper);
  ROOT.style.setProperty('--paper-2', c.paper2);
  ROOT.style.setProperty('--ink', c.ink);
  ROOT.style.setProperty('--ink-soft', c.soft);
  ROOT.style.setProperty('--cobalt', c.accent);
  ROOT.style.setProperty('--cobalt-light', c.accent);
  if(c.line){ ROOT.style.setProperty('--line', c.line); } else { ROOT.style.removeProperty('--line'); }
}
function limpaTema(){ DEFAULT_VARS.forEach(v=>ROOT.style.removeProperty(v)); }

function renderBrand(n){
  brandIdx=(n+BRANDS.length)%BRANDS.length;
  const b=BRANDS[brandIdx];
  const stage=document.getElementById('id-stage');
  stage.classList.add('swap');
  setTimeout(()=>{
    // logo
    const logo=document.getElementById('id-logo');
    logo.innerHTML = b.logo
      ? '<img src="'+b.logo+'" alt="Logo '+b.nome+' '+b.destaque+'">'
      : '<div class="id-wordmark">'+b.nome+'<em>'+b.destaque+'</em></div>';
    // tagline
    document.getElementById('id-tagline').textContent=b.tagline;
    // paleta
    document.getElementById('id-paleta').innerHTML =
      [b.cores.paper,b.cores.paper2,b.cores.soft,b.cores.ink,b.cores.accent]
      .map(hex=>'<div class="id-chip" style="background:'+hex+'"><span>'+hex+'</span></div>').join('');
    // deck de lâminas: uma por vez, setas + contador + swipe
    const apps=document.getElementById('id-apps');
    apps.style.setProperty('--app-ratio', b.appRatio || '4/5');
    const slidesHtml = b.apps.length
      ? b.apps.map((src,k)=>'<div class="slide"><img src="'+src+'" alt="Lâmina '+(k+1)+' da identidade '+b.nome+' '+b.destaque+'" loading="lazy"></div>').join('')
      : '<div class="slide vazio">lâminas da identidade<br>· em breve ·</div>';
    apps.innerHTML =
      '<div class="id-deck"><div class="slides">'+slidesHtml+'</div>'+
      '<button class="nav prev" aria-label="Lâmina anterior">‹</button>'+
      '<button class="nav next" aria-label="Próxima lâmina">›</button>'+
      '<span class="id-count"></span></div>';

    const deck=apps.querySelector('.id-deck');
    const deckSlides=deck.querySelector('.slides');
    const total=deck.querySelectorAll('.slide').length;
    const count=deck.querySelector('.id-count');
    let s=0;
    function goSlide(n){
      s=(n+total)%total;
      deckSlides.style.transform='translateX(-'+(s*100)+'%)';
      count.textContent=(s+1)+' / '+total;
    }
    deck.querySelector('.next').addEventListener('click',()=>goSlide(s+1));
    deck.querySelector('.prev').addEventListener('click',()=>goSlide(s-1));
    let dx0=null;
    deck.addEventListener('touchstart',e=>{dx0=e.touches[0].clientX;},{passive:true});
    deck.addEventListener('touchend',e=>{
      if(dx0===null)return;
      const dx=e.changedTouches[0].clientX-dx0;
      if(Math.abs(dx)>40){ dx<0?goSlide(s+1):goSlide(s-1); }
      dx0=null;
    });
    goSlide(0);
    // dots
    [...document.getElementById('id-dots').children].forEach((d,k)=>d.classList.toggle('on',k===brandIdx));
    aplicaTema(b.cores);
    stage.classList.remove('swap');
  },320);
}

// dots das marcas
const idDots=document.getElementById('id-dots');
BRANDS.forEach((b,k)=>{
  const d=document.createElement('button');
  d.setAttribute('aria-label','Marca '+b.nome);
  d.addEventListener('click',()=>renderBrand(k));
  idDots.appendChild(d);
});
document.getElementById('id-prev').addEventListener('click',()=>renderBrand(brandIdx-1));
document.getElementById('id-next').addEventListener('click',()=>renderBrand(brandIdx+1));

// ---------- Filtros + paginação (6 em 6, "ver mais") ----------
const tiles=[...document.querySelectorAll('.bento .tile')];
const bento=document.querySelector('.bento');
const identidade=document.getElementById('identidade');
const loadMoreWrap=document.getElementById('loadMoreWrap');
const loadMoreBtn=document.getElementById('loadMoreBtn');

const PAGE_SIZE=6;
let currentFilter='all';
let visibleCount=PAGE_SIZE;

function matchesFiltro(t){ return currentFilter==='all' || t.dataset.cat===currentFilter; }

function aplicaPaginacao(){
  const casados=tiles.filter(matchesFiltro);
  tiles.forEach(t=>{ t.style.display='none'; });
  casados.slice(0,visibleCount).forEach(t=>{ t.style.display=''; });
  loadMoreWrap.hidden = visibleCount>=casados.length;
  return casados;
}

document.querySelectorAll('.filters button').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelector('.filters .active')?.classList.remove('active');
    btn.classList.add('active');
    const f=btn.dataset.filter;

    if(f==='identidade'){
      bento.style.display='none';
      loadMoreWrap.hidden=true;
      identidade.hidden=false;
      renderBrand(brandIdx);           // entra vestindo a marca atual
      return;
    }
    // sai do modo identidade: devolve as cores originais do site
    identidade.hidden=true;
    bento.style.display='';
    limpaTema();

    currentFilter=f;
    visibleCount=PAGE_SIZE;            // toda categoria recomeça mostrando 6
    aplicaPaginacao();
  });
});

loadMoreBtn.addEventListener('click',()=>{
  const antes=visibleCount;
  visibleCount+=PAGE_SIZE;
  const casados=aplicaPaginacao();
  if(!reduce){
    casados.slice(antes,visibleCount).forEach((t,k)=>{
      t.classList.remove('in');
      setTimeout(()=>t.classList.add('in'), 50+(k%8)*55);
    });
  }
});

aplicaPaginacao();

// ---------- Reveal on scroll (stagger) ----------
if('IntersectionObserver' in window && !reduce){
  const io=new IntersectionObserver((entries)=>{
    entries.forEach((e)=>{
      if(e.isIntersecting){
        const el=e.target;
        setTimeout(()=>el.classList.add('in'), (el.dataset.delay||0));
        io.unobserve(el);
      }
    });
  },{threshold:0.12});
  tiles.forEach((t,k)=>{ t.dataset.delay=(k%4)*70; io.observe(t); });
} else {
  tiles.forEach(t=>t.classList.add('in'));
}

// ============ nav padrão (home): scrolled + menu mobile ============
(function () {
  var nav = document.getElementById('nav');
  if (!nav) return;
  window.addEventListener('scroll', function () {
    nav.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });
  var burger = document.getElementById('burger'), mpanel = document.getElementById('mpanel');
  if (burger && mpanel) {
    burger.addEventListener('click', function () {
      burger.setAttribute('aria-expanded', mpanel.classList.toggle('open') ? 'true' : 'false');
    });
    mpanel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mpanel.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }
})();

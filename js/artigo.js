// Barra de progresso de leitura
(function () {
  var bar = document.getElementById('readProgress');
  if (!bar) return;
  function update() {
    var h = document.documentElement;
    var total = h.scrollHeight - h.clientHeight;
    var pct = total > 0 ? (h.scrollTop || window.scrollY) / total * 100 : 0;
    bar.style.width = pct + '%';
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

// Copiar link do artigo
(function () {
  var btn = document.getElementById('copyLink');
  if (!btn) return;
  btn.addEventListener('click', function () {
    navigator.clipboard.writeText(window.location.href).then(function () {
      btn.classList.add('copiado');
      setTimeout(function () { btn.classList.remove('copiado'); }, 2200);
    });
  });
})();

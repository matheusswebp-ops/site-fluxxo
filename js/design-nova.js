/* Portfólio de design: filtro por tipo, "Ver mais", carrossel com setas
   (no celular também desliza com o dedo) e o mural do topo que só anda com o topo na tela.
   Menu, gaveta, entrada animada, UTMs e WhatsApp vêm de home.js. */
(function () {
  "use strict";
  var calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var pecas = document.querySelectorAll(".dz");
  var mais = document.getElementById("dzMais");
  var filtroAtual = "all";

  function aplicar() {
    var escondidas = 0;
    pecas.forEach(function (p) {
      var passa = filtroAtual === "all" || p.getAttribute("data-cat") === filtroAtual;
      p.hidden = !passa;
      if (passa && p.classList.contains("dz-mais") && !p.classList.contains("aberto")) escondidas++;
    });
    // num filtro, mostra tudo dele; no "Tudo", o botão abre o resto
    if (filtroAtual !== "all") pecas.forEach(function (p) { p.classList.add("aberto"); });
    if (mais) mais.parentNode.hidden = filtroAtual !== "all" || escondidas === 0;
  }
  var filtros = document.querySelectorAll(".wp-filtro");
  filtros.forEach(function (f) {
    f.addEventListener("click", function () {
      filtroAtual = f.getAttribute("data-filtro");
      filtros.forEach(function (x) { x.classList.toggle("on", x === f); x.setAttribute("aria-pressed", x === f ? "true" : "false"); });
      aplicar();
    });
  });
  if (mais) mais.addEventListener("click", function () {
    pecas.forEach(function (p) { p.classList.add("aberto"); });
    aplicar();
  });

  /* carrosséis: setas, pontos e contador acompanham a rolagem; no celular também desliza com o dedo */
  document.querySelectorAll(".dz-slides").forEach(function (trilho) {
    var card = trilho.closest(".dz");
    var pontos = card.querySelectorAll(".dz-pontos i");
    var cont = card.querySelector(".dz-cont");
    var ant = card.querySelector(".dz-ant");
    var prox = card.querySelector(".dz-prox");
    var total = trilho.children.length, atual = 0;
    function marcar() {
      var k = Math.round(trilho.scrollLeft / trilho.clientWidth);
      atual = k;
      pontos.forEach(function (p, j) { p.classList.toggle("on", j === k); });
      if (cont) cont.textContent = (k + 1) + "/" + total;
      if (ant) ant.hidden = k === 0;
      if (prox) prox.hidden = k === total - 1;
    }
    trilho.addEventListener("scroll", function () { requestAnimationFrame(marcar); }, { passive: true });
    function ir(k) {
      k = Math.max(0, Math.min(total - 1, k));
      trilho.scrollTo({ left: k * trilho.clientWidth, behavior: calmo ? "auto" : "smooth" });
    }
    if (ant) ant.addEventListener("click", function () { ir(atual - 1); });
    if (prox) prox.addEventListener("click", function () { ir(atual + 1); });
    trilho.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); ir(atual + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); ir(atual - 1); }
    });
  });

  aplicar();

  var topo = document.querySelector(".wp-topo");
  if (topo && "IntersectionObserver" in window) {
    new IntersectionObserver(function (itens) {
      itens.forEach(function (it) { topo.classList.toggle("parado", !it.isIntersecting); });
    }).observe(topo);
  }
})();

/* Portfólio de sites: filtro por tipo. A página de cada site só rola com o mouse em cima (CSS).
   Menu, gaveta, entrada animada, UTMs e WhatsApp vêm de home.js. */
(function () {
  "use strict";
  var projetos = document.querySelectorAll(".wp");
  if (!projetos.length) return;

  /* filtro por tipo de página */
  var filtros = document.querySelectorAll(".wp-filtro");
  filtros.forEach(function (f) {
    f.addEventListener("click", function () {
      var cat = f.getAttribute("data-filtro");
      filtros.forEach(function (x) { x.classList.toggle("on", x === f); x.setAttribute("aria-pressed", x === f ? "true" : "false"); });
      projetos.forEach(function (p) { p.hidden = cat !== "all" && p.getAttribute("data-cat") !== cat; });
    });
  });

  /* o mural do topo só anda com o topo na tela */
  var topo = document.querySelector(".wp-topo");
  if (topo && "IntersectionObserver" in window) {
    new IntersectionObserver(function (itens) {
      itens.forEach(function (it) { topo.classList.toggle("parado", !it.isIntersecting); });
    }).observe(topo);
  }
})();

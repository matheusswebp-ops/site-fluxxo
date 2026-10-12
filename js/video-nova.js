/* Portfólio de vídeo: prévia sem som com o mouse em cima,
   vídeo completo com som num modal ao clicar e o mural do topo que só anda com o topo na tela.
   Menu, gaveta, entrada animada, UTMs e WhatsApp vêm de home.js. */
(function () {
  "use strict";
  var calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var temMouse = window.matchMedia("(hover: hover)").matches;

  /* prévia: só carrega e toca com o mouse em cima; ao sair, volta para a capa */
  document.querySelectorAll(".vz-cel").forEach(function (bt) {
    var v = bt.querySelector("video");
    if (!v || !temMouse || calmo) return;
    bt.addEventListener("mouseenter", function () {
      if (!v.getAttribute("src")) v.setAttribute("src", v.dataset.src);
      var p = v.play(); if (p && p.catch) p.catch(function () {});
    });
    bt.addEventListener("mouseleave", function () { v.pause(); v.currentTime = 0; v.load(); });
  });

  /* modal com o vídeo completo e com som */
  var modal = document.getElementById("vzModal");
  var mv = document.getElementById("vzModalVideo");
  var origem = null;
  function abrir(bt) {
    origem = bt;
    mv.src = bt.getAttribute("data-video");
    modal.hidden = false;
    document.documentElement.style.overflow = "hidden";
    var p = mv.play(); if (p && p.catch) p.catch(function () {});
    modal.querySelector(".vz-fechar").focus();
  }
  function fechar() {
    mv.pause(); mv.removeAttribute("src"); mv.load();
    modal.hidden = true;
    document.documentElement.style.overflow = "";
    if (origem) origem.focus();
  }
  if (modal) {
    document.querySelectorAll(".vz-cel").forEach(function (bt) { bt.addEventListener("click", function () { abrir(bt); }); });
    modal.querySelectorAll("[data-fechar]").forEach(function (el) { el.addEventListener("click", fechar); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !modal.hidden) fechar(); });
  }

  var topo = document.querySelector(".wp-topo");
  if (topo && "IntersectionObserver" in window) {
    new IntersectionObserver(function (itens) {
      itens.forEach(function (it) { topo.classList.toggle("parado", !it.isIntersecting); });
    }).observe(topo);
  }
})();

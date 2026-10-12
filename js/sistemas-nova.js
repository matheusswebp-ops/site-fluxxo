/* Portfólio de sistemas: cada gravação só carrega e toca com o notebook na tela;
   o notebook endireita quando aparece. Mural do topo só anda com o topo na tela.
   Menu, gaveta, entrada animada, UTMs e WhatsApp vêm de home.js. */
(function () {
  "use strict";
  var calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!("IntersectionObserver" in window)) return;

  var io = new IntersectionObserver(function (itens) {
    itens.forEach(function (it) {
      var sz = it.target;
      var v = sz.querySelector("video");
      if (it.isIntersecting) {
        sz.classList.add("visto");
        if (calmo) return;
        if (!v.getAttribute("src")) v.setAttribute("src", v.dataset.src);
        var p = v.play(); if (p && p.catch) p.catch(function () {});
      } else if (!v.paused) {
        v.pause();
      }
    });
  }, { threshold: 0.35 });
  document.querySelectorAll(".sz").forEach(function (s) { io.observe(s); });

  var topo = document.querySelector(".wp-topo");
  if (topo) {
    new IntersectionObserver(function (itens) {
      itens.forEach(function (it) { topo.classList.toggle("parado", !it.isIntersecting); });
    }).observe(topo);
  }
})();

/* Blog novo: filtros da listagem, barra de leitura e compartilhar do artigo.
   Menu, gaveta, entrada animada, UTMs e WhatsApp vêm de home.js. */
(function () {
  "use strict";

  /* ---------- Listagem: filtros por categoria na lista de todos os artigos ---------- */
  var lista = document.getElementById("bnLista");
  if (lista) {
    var filtros = document.querySelectorAll(".bn-filtro");
    var cartoes = lista.querySelectorAll("[data-cat]");
    var vazio = document.getElementById("bnVazio");
    filtros.forEach(function (f) {
      f.addEventListener("click", function () {
        var cat = f.getAttribute("data-filtro");
        filtros.forEach(function (x) {
          var sim = x === f;
          x.classList.toggle("on", sim);
          x.setAttribute("aria-pressed", sim ? "true" : "false");
        });
        var algum = false;
        cartoes.forEach(function (c) {
          var mostra = cat === "all" || c.getAttribute("data-cat") === cat;
          c.hidden = !mostra;
          if (mostra) algum = true;
        });
        if (vazio) vazio.hidden = algum;
      });
    });
  }

  /* ---------- Artigo: barra de leitura ---------- */
  var barra = document.getElementById("bnProgresso");
  var texto = document.querySelector(".ar-corpo");
  if (barra && texto) {
    var pedido = false;
    function medir() {
      pedido = false;
      var r = texto.getBoundingClientRect();
      var total = r.height - window.innerHeight;
      var p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1;
      barra.style.setProperty("--p", p.toFixed(4));
    }
    window.addEventListener("scroll", function () { if (!pedido) { pedido = true; requestAnimationFrame(medir); } }, { passive: true });
    window.addEventListener("resize", medir);
    medir();
  }

  /* ---------- Artigo: índice "Neste artigo" a partir dos subtítulos ---------- */
  var indice = document.getElementById("bnIndice");
  var subs = document.querySelectorAll(".ar-texto h2");
  if (indice && subs.length) {
    var itens = [];
    subs.forEach(function (h, k) {
      if (!h.id) h.id = "parte-" + (k + 1);
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + h.id;
      a.textContent = h.textContent.replace(/^\d+\.\s*/, "");
      li.appendChild(a);
      indice.appendChild(li);
      itens.push(a);
    });
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (vistos) {
        vistos.forEach(function (v) {
          if (!v.isIntersecting) return;
          var k = Array.prototype.indexOf.call(subs, v.target);
          itens.forEach(function (a, j) { a.classList.toggle("on", j === k); });
        });
      }, { rootMargin: "-20% 0px -70% 0px" });
      subs.forEach(function (h) { io.observe(h); });
    }
  }

  /* ---------- Artigo: compartilhar com o link desta página ---------- */
  var linkedin = document.querySelector("[data-linkedin]");
  if (linkedin) linkedin.href = "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(location.href.split("?")[0]);
  var copiar = document.getElementById("bnCopiar");
  if (copiar) {
    copiar.addEventListener("click", function () {
      var url = location.href.split("?")[0];
      var feito = function () { copiar.classList.add("ok"); setTimeout(function () { copiar.classList.remove("ok"); }, 1800); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(feito, feito);
      else feito();
    });
  }
})();

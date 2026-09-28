/* Login do painel (fluxxo.io/login) — Supabase Auth, a mesma conta do Fluxxo OS.
   Se a conta tiver verificação em duas etapas, pede o código: sem isso o
   painel seria uma porta que pula o 2FA do app. */
(function () {
  "use strict";
  var sb = window.FX_SB;
  var form = document.getElementById("form-login");
  var erro = document.getElementById("erro");
  var botao = document.getElementById("entrar");
  var fator = null;

  function ir() { location.replace("/painel"); }
  function mostrarErro(t) { erro.textContent = t || ""; }

  async function precisaDeCodigo() {
    var nivel = await sb.auth.mfa.getAuthenticatorAssuranceLevel();
    if (nivel.data && nivel.data.nextLevel === "aal2" && nivel.data.currentLevel !== "aal2") {
      var fatores = await sb.auth.mfa.listFactors();
      fator = fatores.data && fatores.data.totp && fatores.data.totp[0];
      return Boolean(fator);
    }
    return false;
  }

  sb.auth.getSession().then(async function (r) {
    if (r.data.session && !(await precisaDeCodigo())) ir();
  });

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    mostrarErro("");
    botao.disabled = true;
    try {
      if (fator) {
        var codigo = document.getElementById("l-codigo").value.trim();
        var v = await sb.auth.mfa.challengeAndVerify({ factorId: fator.id, code: codigo });
        if (v.error) { mostrarErro("Código inválido. Confira no aplicativo e tente de novo."); return; }
        ir(); return;
      }
      var email = document.getElementById("l-email").value.trim();
      var senha = document.getElementById("l-senha").value;
      if (!email || !senha) { mostrarErro("Preencha o e-mail e a senha."); return; }
      var r = await sb.auth.signInWithPassword({ email: email, password: senha });
      if (r.error) {
        mostrarErro(/rate|many/i.test(r.error.message) ? "Muitas tentativas. Espere um pouco e tente de novo." : "E-mail ou senha incorretos.");
        return;
      }
      if (await precisaDeCodigo()) {
        document.getElementById("passo-senha").hidden = true;
        document.getElementById("passo-codigo").hidden = false;
        document.getElementById("l-codigo").focus();
        botao.textContent = "Confirmar código";
        return;
      }
      ir();
    } catch (x) {
      mostrarErro("Não deu para entrar agora. Tente de novo em instantes.");
    } finally {
      botao.disabled = false;
    }
  });
})();

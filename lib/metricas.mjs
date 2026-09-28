// Métricas do fluxxo.io — as regras puras usadas pela Function /api/r.
// Sem dependência de Cloudflare, para dar para testar com `node --test`.

const ROBO = /bot|crawl|spider|slurp|facebookexternalhit|embedly|preview|lighthouse|headlesschrome|pagespeed|gtmetrix|pingdom|uptime|curl|wget|python-requests|axios/i;

export function ehRobo(ua) {
  return !ua || ROBO.test(ua);
}

export function lerAparelho(ua = "") {
  const aparelho = /iPad|Tablet/i.test(ua) ? "tablet" : /Mobi|Android|iPhone|iPod/i.test(ua) ? "celular" : "computador";

  let navegador = "Outro";
  if (/Instagram/i.test(ua)) navegador = "Instagram";
  else if (/FBAN|FBAV|FB_IAB/i.test(ua)) navegador = "Facebook";
  else if (/Edg\//i.test(ua)) navegador = "Edge";
  else if (/OPR\/|Opera/i.test(ua)) navegador = "Opera";
  else if (/SamsungBrowser/i.test(ua)) navegador = "Samsung";
  else if (/CriOS|Chrome\//i.test(ua)) navegador = "Chrome";
  else if (/FxiOS|Firefox\//i.test(ua)) navegador = "Firefox";
  else if (/Safari\//i.test(ua)) navegador = "Safari";

  let sistema = "Outro";
  if (/iPhone|iPad|iPod/i.test(ua)) sistema = "iOS";
  else if (/Android/i.test(ua)) sistema = "Android";
  else if (/Windows/i.test(ua)) sistema = "Windows";
  else if (/CrOS/i.test(ua)) sistema = "ChromeOS";
  else if (/Mac OS X|Macintosh/i.test(ua)) sistema = "macOS";
  else if (/Linux/i.test(ua)) sistema = "Linux";

  return { aparelho, navegador, sistema };
}

const FONTES = [
  [/(^|\.)google\.[a-z]{2,3}(\.[a-z]{2})?$/, "google"],
  [/(^|\.)bing\.com$/, "bing"],
  [/(^|\.)(instagram\.com|l\.instagram\.com)$/, "instagram"],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, "facebook"],
  [/(^|\.)(t\.co|twitter\.com|x\.com)$/, "x"],
  [/(^|\.)(linkedin\.com|lnkd\.in)$/, "linkedin"],
  [/(^|\.)(youtube\.com|youtu\.be)$/, "youtube"],
  [/(^|\.)(wa\.me|whatsapp\.com)$/, "whatsapp"],
  [/(^|\.)(chatgpt\.com|openai\.com)$/, "chatgpt"],
  [/(^|\.)perplexity\.ai$/, "perplexity"],
  [/(^|\.)(duckduckgo\.com)$/, "duckduckgo"],
];

const APELIDOS = { ig: "instagram", insta: "instagram", fb: "facebook", wa: "whatsapp", zap: "whatsapp" };

/**
 * De onde a pessoa veio. A UTM manda (é o que o Owner coloca de propósito
 * nos links); depois o site de onde veio; depois o navegador de dentro de
 * app (o Instagram muitas vezes não passa o endereço de origem).
 */
export function classificarOrigem({ ref = "", utmSource = "", utmMedium = "", ua = "", meuHost = "fluxxo.io" } = {}) {
  const fonte = utmSource.trim().toLowerCase();
  if (fonte) {
    const nome = APELIDOS[fonte] ?? fonte.replace(/[^a-z0-9._-]/g, "").slice(0, 30);
    if (nome === "google" && /cpc|ads|paid|pago/i.test(utmMedium)) return "google ads";
    return nome || "outros sites";
  }
  let host = "";
  try {
    host = new URL(ref).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    host = "";
  }
  if (host && host !== meuHost && !host.endsWith(`.${meuHost}`)) {
    const achada = FONTES.find(([re]) => re.test(host));
    return achada ? achada[1] : "outros sites";
  }
  if (/Instagram/i.test(ua)) return "instagram";
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return "facebook";
  return "direto";
}

/** Só aceita o que vem do próprio site (e do ambiente local de teste). */
export function origemPermitida(origin = "") {
  try {
    const h = new URL(origin).hostname;
    return h === "fluxxo.io" || h.endsWith(".fluxxo.io") || h.endsWith(".site-fluxxo.pages.dev") || h === "localhost" || h === "127.0.0.1";
  } catch {
    return false;
  }
}

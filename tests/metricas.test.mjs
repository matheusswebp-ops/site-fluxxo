// node --test tests/  — regras puras da Function /api/r (lib/metricas.mjs)
import assert from "node:assert/strict";
import { test } from "node:test";
import { ehRobo, lerAparelho, classificarOrigem, origemPermitida } from "../lib/metricas.mjs";

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const IG = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 330.0.0.0";
const WIN = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36";
const ANDROID = "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0 Mobile Safari/537.36";

test("robôs não contam", () => {
  assert.equal(ehRobo("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"), true);
  assert.equal(ehRobo("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0 Safari/537.36"), true);
  assert.equal(ehRobo("Chrome-Lighthouse"), true);
  assert.equal(ehRobo(""), true);
  assert.equal(ehRobo(IPHONE), false);
});

test("aparelho, navegador e sistema", () => {
  assert.deepEqual(lerAparelho(IPHONE), { aparelho: "celular", navegador: "Safari", sistema: "iOS" });
  assert.deepEqual(lerAparelho(IG), { aparelho: "celular", navegador: "Instagram", sistema: "iOS" });
  assert.deepEqual(lerAparelho(WIN), { aparelho: "computador", navegador: "Chrome", sistema: "Windows" });
  assert.deepEqual(lerAparelho(ANDROID), { aparelho: "celular", navegador: "Samsung", sistema: "Android" });
});

test("origem: UTM manda, depois o site de onde veio, depois o app", () => {
  assert.equal(classificarOrigem({ utmSource: "ig", ref: "https://www.google.com/" }), "instagram");
  assert.equal(classificarOrigem({ utmSource: "google", utmMedium: "cpc" }), "google ads");
  assert.equal(classificarOrigem({ ref: "https://www.google.com.br/" }), "google");
  assert.equal(classificarOrigem({ ref: "https://l.instagram.com/?u=x" }), "instagram");
  assert.equal(classificarOrigem({ ref: "https://chatgpt.com/" }), "chatgpt");
  assert.equal(classificarOrigem({ ref: "https://blog.qualquer.com.br/post" }), "outros sites");
  assert.equal(classificarOrigem({ ua: IG }), "instagram", "o app do Instagram não passa referência");
  assert.equal(classificarOrigem({ ref: "https://fluxxo.io/webdesign" }), "direto", "navegação interna não é origem");
  assert.equal(classificarOrigem({}), "direto");
  assert.equal(classificarOrigem({ ref: "https://google.com.golpe.site/" }), "outros sites");
});

test("só o próprio site pode mandar", () => {
  assert.equal(origemPermitida("https://fluxxo.io"), true);
  assert.equal(origemPermitida("https://www.fluxxo.io"), true);
  assert.equal(origemPermitida("http://localhost:8788"), true);
  assert.equal(origemPermitida("https://fluxxo.io.golpe.site"), false);
  assert.equal(origemPermitida("https://outro.com"), false);
  assert.equal(origemPermitida(""), false);
});

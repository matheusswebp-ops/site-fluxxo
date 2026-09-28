// POST /api/r — a porta do rastreador do fluxxo.io (js/r.js).
//
// Recebe o lote do navegador, acrescenta o que só o servidor sabe (cidade e
// país pelo Cloudflare, aparelho pelo user-agent, de onde veio) e repassa
// para a RPC `site_registrar` no Supabase do Fluxxo OS (migration 0223).
//
// A chave abaixo é a ANON: pública por natureza (a mesma que qualquer app
// Supabase entrega ao navegador). A RPC valida tudo e só insere; ler as
// métricas exige login de Dono/Admin. IP não é guardado em lugar nenhum.

import { ehRobo, lerAparelho, classificarOrigem, origemPermitida } from "../../lib/metricas.mjs";

const SUPABASE_URL = "https://vtarixhhrpdmzjlixesy.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0YXJpeGhocnBkbXpqbGl4ZXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwODIxNzksImV4cCI6MjEwMjY1ODE3OX0.YtP_B7lqJ1qVPBzra1_hEWWhA5ZGIwLNQo7yklqTXPM";

const vazio = () => new Response(null, { status: 204, headers: { "cache-control": "no-store" } });

export async function onRequestPost({ request, waitUntil }) {
  const ua = request.headers.get("user-agent") || "";
  if (ehRobo(ua) || !origemPermitida(request.headers.get("origin") || request.headers.get("referer") || "")) {
    return vazio();
  }

  const texto = await request.text();
  if (texto.length > 16000) return vazio();
  let lote;
  try {
    lote = JSON.parse(texto);
  } catch {
    return vazio();
  }
  if (!lote || typeof lote !== "object") return vazio();

  if (lote.ctx && typeof lote.ctx === "object") {
    const cf = request.cf || {};
    const c = lote.ctx;
    lote.ctx = {
      entrada: typeof c.entrada === "string" ? c.entrada : null,
      ref: typeof c.ref === "string" ? c.ref.slice(0, 300) : null,
      utm_source: c.utm_source || null,
      utm_medium: c.utm_medium || null,
      utm_campaign: c.utm_campaign || null,
      utm_content: c.utm_content || null,
      utm_term: c.utm_term || null,
      origem: classificarOrigem({ ref: c.ref || "", utmSource: c.utm_source || "", utmMedium: c.utm_medium || "", ua }),
      ...lerAparelho(ua),
      pais: cf.country || null,
      estado: cf.region || null,
      cidade: cf.city || null,
    };
  }

  // Responde já; a gravação segue depois (o navegador não espera o banco).
  waitUntil(
    fetch(`${SUPABASE_URL}/rest/v1/rpc/site_registrar`, {
      method: "POST",
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}`, "Content-Type": "application/json" },
      body: JSON.stringify({ lote }),
    }).catch(() => {}),
  );
  return vazio();
}

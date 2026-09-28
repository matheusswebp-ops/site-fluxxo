/* Conexão do painel com o Supabase do Fluxxo OS. A chave é a ANON (pública);
   o que cada pessoa lê é decidido pela RLS: só Dono/Admin da Fluxxo. */
window.FX_SB = window.supabase.createClient("https://vtarixhhrpdmzjlixesy.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0YXJpeGhocnBkbXpqbGl4ZXN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwODIxNzksImV4cCI6MjEwMjY1ODE3OX0.YtP_B7lqJ1qVPBzra1_hEWWhA5ZGIwLNQo7yklqTXPM", {
  auth: { persistSession: true, autoRefreshToken: true, storageKey: "fx-painel-auth" }
});
// Quem usa o painel não é contado nas métricas do site.
try { localStorage.setItem("fx_nao_contar", "1"); } catch (e) {}

// Config publique pour le client Supabase (URL + clé anon = publiques par nature).
// La clé service_role N'EST JAMAIS exposée ici (réservée au serveur).
export default function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  if (!url || !anon) { res.status(500).json({ error: "Supabase non configuré (variables manquantes)" }); return; }
  res.setHeader("Cache-Control", "public, max-age=600");
  res.status(200).json({ supabaseUrl: url, supabaseAnonKey: anon });
}

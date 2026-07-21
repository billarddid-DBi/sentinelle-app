// Liste les établissements Google Maps correspondant à "enseigne + ville"
// (pour départager les enseignes multi-magasins : l'utilisateur CHOISIT le sien).
export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "Méthode non autorisée" }); return; }
  const key = process.env.GOOGLE_PLACES_KEY;
  if (!key) { res.status(200).json({ etabs: [] }); return; }
  try {
    const q = (((req.body || {}).q) || "").trim();
    if (!q) { res.status(400).json({ error: "q manquant" }); return; }
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(q)}&language=fr&region=fr&key=${key}`;
    const r = await fetch(url);
    const d = await r.json();
    const etabs = (d.results || []).slice(0, 6).map(x => ({
      nom: x.name,
      adresse: (x.formatted_address || "").replace(/, France$/, "")
    })).filter(x => x.adresse);
    res.status(200).json({ etabs });
  } catch (e) {
    res.status(200).json({ etabs: [] });
  }
}

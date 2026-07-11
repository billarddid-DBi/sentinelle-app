// CONCURRENCE — module SENTINELLE. On trouve les concurrents comme une recherche Google Maps :
// via l'IA + recherche web (le registre légal SIRENE ne connaît pas les enseignes/catégories,
// ex. un resto enregistré "SARL Dupont" est introuvable par "restaurant italien").
// Chaque adresse est ensuite géolocalisée (api-adresse.data.gouv.fr, gratuit) pour la carte.

const MODEL = "claude-haiku-4-5-20251001";
const API = "https://recherche-entreprises.api.gouv.fr";
const ADR = "https://api-adresse.data.gouv.fr";

function haversine(la1, lo1, la2, lo2) {
  const R = 6371, r = Math.PI / 180;
  const dla = (la2 - la1) * r, dlo = (lo2 - lo1) * r;
  const a = Math.sin(dla / 2) ** 2 + Math.cos(la1 * r) * Math.cos(la2 * r) * Math.sin(dlo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

const norm = s => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[-']/g, " ");

// Localise le prospect : d'abord le registre (coords + commune), sinon on géocode la ville.
async function locateProspect(nom, ville) {
  try {
    const q = encodeURIComponent([nom, ville].filter(Boolean).join(" "));
    const r = await fetch(`${API}/search?q=${q}&per_page=8`);
    if (r.ok) {
      const d = await r.json();
      const villeMain = norm(ville).split(" ").filter(Boolean)[0] || "";
      let best = null;
      for (const e of (d.results || [])) {
        const s = e.siege || {};
        const geo = s.latitude && s.longitude ? 1 : 0;
        const cm = villeMain && s.libelle_commune && norm(s.libelle_commune).indexOf(villeMain) !== -1 ? 2 : 0;
        const score = geo + cm;
        if (!best || score > best.score) best = { s, nom: e.nom_complet, score };
        if (score === 3) break;
      }
      if (best && best.s.latitude && best.s.longitude) {
        return { nom: best.nom || nom, commune: best.s.libelle_commune || ville, lat: parseFloat(best.s.latitude), long: parseFloat(best.s.longitude) };
      }
    }
  } catch (_) {}
  // Fallback : géocodage de la ville
  const g = await geocode(ville || nom);
  if (g) return { nom, commune: ville, lat: g.lat, long: g.long };
  return null;
}

async function geocode(q) {
  if (!q) return null;
  try {
    const r = await fetch(`${ADR}/search/?q=${encodeURIComponent(q)}&limit=1`);
    if (!r.ok) return null;
    const d = await r.json();
    const f = (d.features || [])[0];
    const c = f && f.geometry && f.geometry.coordinates;
    return c ? { long: c[0], lat: c[1] } : null;
  } catch (_) { return null; }
}

const SYS = `Tu repères les concurrents locaux d'une entreprise, exactement comme une recherche Google Maps, via l'outil de recherche web.
DONNÉES fournies : un métier (mot-clé), la ville du prospect, un rayon en km, et le nom du prospect (à EXCLURE des concurrents).
TÂCHE : trouve jusqu'à 8 entreprises RÉELLES de ce métier autour de cette ville (les plus proches et notables, telles qu'un client les trouve sur Google Maps). Renseigne aussi les infos du prospect.
Pour le prospect ET chaque concurrent : nom (commercial, celui connu du public), commune, adresse complète (numéro + rue + code postal + ville — INDISPENSABLE pour localiser), avis {note sur 5, nombre} (null si introuvable), présence (fort|moyen|faible : site + réseaux + fraîcheur), aura (note 0-100 SURTOUT selon les avis : 4,5+/5 avec du volume → 78-88 · 4 à 4,5 → 65-77 · 3 à 4 → 48-62 · <3 → 30-45 · sans avis → ~50 ; ±5 selon la présence), couleur d'aura (Doré/Rouge/Orange/Jaune/Vert/Turquoise/Bleu/Violet/Rose/Argent/Marron/Gris/Noir/Blanc), éclat (faible|moyen|fort), site (URL https ou "").
RÈGLES : n'invente AUCUNE entreprise (uniquement des vraies, trouvées via la recherche web) ; exclus le prospect des concurrents ; sois efficace puis DONNE directement le JSON final complet, sans rien laisser vide.
SORTIE : UNIQUEMENT ce JSON, pas de texte avant/après, pas de balise de code :
{"prospect":{"avis":{"note":<n|null>,"nombre":<n|null>,"resume":"<court>"},"presence":"fort|moyen|faible","aura":{"note":<int>,"couleur":"<couleur>","eclat":"<eclat>"},"site":"<url|>"},"concurrents":[{"nom":"<nom>","commune":"<commune>","adresse":"<adresse complète>","avis":{"note":<n|null>,"nombre":<n|null>,"resume":"<court>"},"presence":"fort|moyen|faible","aura":{"note":<int>,"couleur":"<couleur>","eclat":"<eclat>"},"site":"<url|>"}]}`;

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "Méthode non autorisée" }); return; }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) { res.status(500).json({ error: "Clé API manquante (ANTHROPIC_API_KEY)." }); return; }
  try {
    const { nom, ville, radius, keyword, prospectAura } = req.body || {};
    if (!nom) { res.status(400).json({ error: "Nom d'entreprise manquant." }); return; }
    const rad = Math.max(2, Math.min(50, parseInt(radius) || 20));
    const kw = (keyword || "").trim();
    if (!kw) { res.status(400).json({ error: "Entrez un mot-clé métier (ex : restaurant italien, pare-brise, plombier)." }); return; }

    const prospect = await locateProspect(nom, ville);
    if (!prospect || isNaN(prospect.lat)) { res.status(404).json({ error: "Impossible de localiser le prospect (vérifiez la ville)." }); return; }

    // 1) L'IA trouve + qualifie les concurrents (comme Google Maps)
    const user = `Métier : ${kw}\nVille du prospect : ${prospect.commune || ville}\nRayon : environ ${rad} km autour de cette ville\nProspect (à exclure des concurrents) : ${prospect.nom || nom}`;
    const areq = {
      model: MODEL, max_tokens: 4000, temperature: 0, system: SYS,
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 12 }],
      messages: [{ role: "user", content: [{ type: "text", text: user }] }]
    };
    const rr = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify(areq)
    });
    let parsed = { prospect: {}, concurrents: [] };
    if (rr.ok) {
      const dd = await rr.json();
      let out = "";
      for (const b of (dd.content || [])) if (b.type === "text") out += b.text;
      out = out.replace(/<\/?cite[^>]*>/gi, "").replace(/```json/gi, "").replace(/```/g, "");
      const s = out.indexOf("{"), e = out.lastIndexOf("}");
      if (s !== -1 && e !== -1) { try { parsed = JSON.parse(out.slice(s, e + 1)); } catch (_) {} }
    }
    const list = (parsed.concurrents || []).slice(0, 8);

    // 2) Géocodage des adresses des concurrents (gratuit) -> coords + distance
    const geocoded = await Promise.all(list.map(async c => {
      const g = c.adresse ? await geocode(c.adresse) : null;
      const dist = g ? Math.round(haversine(prospect.lat, prospect.long, g.lat, g.long) * 10) / 10 : null;
      return {
        nom: c.nom, commune: c.commune || "", lat: g ? g.lat : null, long: g ? g.long : null,
        distance: dist, avis: c.avis || null, presence: c.presence || null, aura: c.aura || null, site: c.site || null
      };
    }));
    geocoded.sort((a, b) => (a.distance == null ? 999 : a.distance) - (b.distance == null ? 999 : b.distance));

    const pp = parsed.prospect || {};
    const prospectRow = {
      nom: prospect.nom, commune: prospect.commune, lat: prospect.lat, long: prospect.long,
      avis: pp.avis || null, presence: pp.presence || null,
      aura: (prospectAura && typeof prospectAura.note === "number") ? { note: prospectAura.note, couleur: prospectAura.couleur || "Bleu", eclat: prospectAura.eclat || "moyen" } : (pp.aura || null),
      site: pp.site || null
    };

    res.status(200).json({ keyword: kw, radius: rad, prospect: prospectRow, concurrents: geocoded });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur", detail: String(err).slice(0, 300) });
  }
}

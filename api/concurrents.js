// CONCURRENCE — module SENTINELLE. Établissements du même code NAF autour du prospect,
// puis comparatif PUBLIC À AUJOURD'HUI (avis · présence · Index Aura), sans prévisions.
// Géo = API publique recherche-entreprises (gratuite). Comparatif = Claude + recherche web.

const MODEL = "claude-sonnet-5";
const API = "https://recherche-entreprises.api.gouv.fr";

function haversine(la1, lo1, la2, lo2) {
  const R = 6371, r = Math.PI / 180;
  const dla = (la2 - la1) * r, dlo = (lo2 - lo1) * r;
  const a = Math.sin(dla / 2) ** 2 + Math.cos(la1 * r) * Math.cos(la2 * r) * Math.sin(dlo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

async function resolveProspect(nom, ville) {
  const q = encodeURIComponent([nom, ville].filter(Boolean).join(" "));
  const r = await fetch(`${API}/search?q=${q}&per_page=1`);
  if (!r.ok) return null;
  const d = await r.json();
  const e = (d.results || [])[0];
  if (!e) return null;
  const s = e.siege || {};
  return {
    siren: e.siren, naf: e.activite_principale, nom: e.nom_complet,
    commune: s.libelle_commune, adresse: s.adresse,
    lat: parseFloat(s.latitude), long: parseFloat(s.longitude)
  };
}

async function nearby(naf, lat, long, radius, excludeSiren) {
  const items = [];
  for (let page = 1; page <= 2; page++) {
    const url = `${API}/near_point?activite_principale=${encodeURIComponent(naf)}&lat=${lat}&long=${long}&radius=${radius}&per_page=25&page=${page}`;
    const r = await fetch(url);
    if (!r.ok) break;
    const d = await r.json();
    const results = d.results || [];
    for (const e of results) {
      if (e.siren === excludeSiren) continue;
      const ets = (e.matching_etablissements && e.matching_etablissements.length)
        ? e.matching_etablissements : [e.siege].filter(Boolean);
      let best = null;
      for (const et of ets) {
        const la = parseFloat(et.latitude), lo = parseFloat(et.longitude);
        if (isNaN(la) || isNaN(lo)) continue;
        const dist = haversine(lat, long, la, lo);
        if (!best || dist < best.dist) best = { dist, la, lo, commune: et.libelle_commune };
      }
      if (!best) continue;
      items.push({ siren: e.siren, nom: e.nom_complet, commune: best.commune, lat: best.la, long: best.lo, distance: Math.round(best.dist * 10) / 10 });
    }
    if (results.length < 25) break;
  }
  const map = {};
  for (const it of items) { if (!map[it.siren] || it.distance < map[it.siren].distance) map[it.siren] = it; }
  return Object.values(map).filter(it => it.distance <= radius).sort((a, b) => a.distance - b.distance).slice(0, 8);
}

const SYS = `Tu compares des entreprises françaises sur leur image PUBLIQUE AUJOURD'HUI, via l'outil de recherche web. Pour CHAQUE entreprise de la liste (garde son index i), donne :
- avis : la note d'avis en ligne (Google/annuaires) sur 5 et le nombre d'avis. Si introuvable, note et nombre = null.
- presence : UN seul mot parmi "fort", "moyen", "faible" (site web, réseaux, fraîcheur, visibilité).
- aura : l'Index Aura ACTUEL = note entière 0-100 (niveau de confiance perçu), couleur d'aura, éclat.
INTERDIT : toute prévision, tout potentiel, toute projection. On décrit l'état d'aujourd'hui, point.
N'INVENTE JAMAIS : si une info est introuvable, mets null (avis) ou reste prudent. Couleur parmi : Doré, Rouge, Orange, Jaune, Vert, Turquoise, Bleu, Violet, Rose, Argent, Marron, Gris, Noir, Blanc. Éclat parmi : faible, moyen, fort.
SORTIE : UNIQUEMENT ce JSON, rien d'autre, aucune balise, aucune citation :
{"entreprises":[{"i":0,"avis":{"note":<number|null>,"nombre":<int|null>,"resume":"<courte synthèse ou 'Non trouvé publiquement'>"},"presence":"fort|moyen|faible","aura":{"note":<int 0-100>,"couleur":"<couleur>","eclat":"faible|moyen|fort"}}]}`;

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "Méthode non autorisée" }); return; }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) { res.status(500).json({ error: "Clé API manquante (ANTHROPIC_API_KEY)." }); return; }
  try {
    const { nom, ville, radius } = req.body || {};
    if (!nom) { res.status(400).json({ error: "Nom d'entreprise manquant." }); return; }
    const rad = Math.max(2, Math.min(100, parseInt(radius) || 25));

    const prospect = await resolveProspect(nom, ville);
    if (!prospect || isNaN(prospect.lat) || isNaN(prospect.long)) {
      res.status(404).json({ error: "Entreprise introuvable dans l'annuaire officiel (vérifiez le nom + la ville)." });
      return;
    }
    const concurrents = await nearby(prospect.naf, prospect.lat, prospect.long, rad, prospect.siren);

    const list = [prospect, ...concurrents];
    const lines = list.map((e, i) => `${i} = ${i === 0 ? "PROSPECT: " : ""}${e.nom} (${e.commune || ""})`).join("\n");
    const areq = {
      model: MODEL, max_tokens: 4000, system: SYS,
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 12 }],
      messages: [{ role: "user", content: [{ type: "text", text: "Entreprises à évaluer (conserve chaque index i) :\n" + lines }] }]
    };
    const rr = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify(areq)
    });
    let byi = {};
    if (rr.ok) {
      const dd = await rr.json();
      let out = "";
      for (const b of (dd.content || [])) if (b.type === "text") out += b.text;
      out = out.replace(/<\/?cite[^>]*>/gi, "");
      const s = out.indexOf("{"), e = out.lastIndexOf("}");
      if (s !== -1 && e !== -1) { try { const p = JSON.parse(out.slice(s, e + 1)); for (const it of (p.entreprises || [])) byi[it.i] = it; } catch (_) {} }
    }
    const enrich = (e, i) => { const x = byi[i] || {}; return { ...e, avis: x.avis || null, presence: x.presence || null, aura: x.aura || null }; };
    res.status(200).json({
      naf: prospect.naf, radius: rad,
      prospect: enrich(prospect, 0),
      concurrents: concurrents.map((c, idx) => enrich(c, idx + 1))
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur", detail: String(err).slice(0, 300) });
  }
}

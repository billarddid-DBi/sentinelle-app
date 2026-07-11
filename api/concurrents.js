// CONCURRENCE — module SENTINELLE. Concurrents = même code NAF (cohérence catégorie)
// FILTRÉ par mot-clé métier (le vrai métier), autour du prospect. Comparatif PUBLIC
// À AUJOURD'HUI (avis · présence · Index Aura), sans prévisions.
// Géo/registre = API publique recherche-entreprises (gratuite). Comparatif = Claude + web.

const MODEL = "claude-haiku-4-5-20251001"; // modèle rapide : tâche de comparaison simple, priorité vitesse + coût
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
    commune: s.libelle_commune, departement: s.departement,
    lat: parseFloat(s.latitude), long: parseFloat(s.longitude)
  };
}

// NAF (cohérence) + mot-clé (métier) dans le département, puis distance haversine -> 8 plus proches.
async function searchCompetitors(keyword, naf, departement, plat, plong, radius, excludeSiren) {
  const items = [];
  const kw = (keyword || "").trim();
  for (let page = 1; page <= 4; page++) {
    const params = new URLSearchParams();
    if (kw) params.set("q", kw);
    if (naf) params.set("activite_principale", naf);
    if (departement) params.set("departement", departement);
    params.set("per_page", "25");
    params.set("page", String(page));
    const r = await fetch(`${API}/search?${params.toString()}`);
    if (!r.ok) break;
    const d = await r.json();
    const results = d.results || [];
    for (const e of results) {
      if (e.siren === excludeSiren) continue;
      const s = e.siege || {};
      const la = parseFloat(s.latitude), lo = parseFloat(s.longitude);
      if (isNaN(la) || isNaN(lo)) continue;
      const dist = haversine(plat, plong, la, lo);
      items.push({ siren: e.siren, nom: e.nom_complet, commune: s.libelle_commune, lat: la, long: lo, distance: Math.round(dist * 10) / 10 });
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
- aura : note entière 0-100, fondée SURTOUT sur les avis (même logique que le prospect, pour comparer ce qui est comparable), de façon OBJECTIVE : 4,5+/5 avec du volume → 78-88 · 4 à 4,5 → 65-77 · 3 à 4 → 48-62 · <3 → 30-45 · peu ou pas d'avis → ~50. Ajuste de ±5 selon la présence web. Jamais au feeling. Donne aussi couleur d'aura et éclat.
- site : l'URL du site officiel si tu la vois pendant ta recherche d'avis (sinon "") — ne fais PAS de recherche dédiée juste pour le site.
INTERDIT : toute prévision, tout potentiel, toute projection. On décrit l'état d'aujourd'hui, point.
N'INVENTE JAMAIS : si une info est introuvable, mets null (avis) ou reste prudent. Couleur parmi : Doré, Rouge, Orange, Jaune, Vert, Turquoise, Bleu, Violet, Rose, Argent, Marron, Gris, Noir, Blanc. Éclat parmi : faible, moyen, fort.
SOIS EFFICACE : au MAXIMUM 1 recherche web par entreprise, puis DONNE directement le JSON final pour LES 9 entités. Termine TOUJOURS par le JSON complet, ne laisse AUCUNE entité vide (si tu manques d'info, mets avis null et estime l'aura ~50).
SORTIE : UNIQUEMENT ce JSON (pas de texte avant/après, pas de balise de code), aucune balise, aucune citation :
{"entreprises":[{"i":0,"avis":{"note":<number|null>,"nombre":<int|null>,"resume":"<courte synthèse ou 'Non trouvé publiquement'>"},"presence":"fort|moyen|faible","aura":{"note":<int 0-100>,"couleur":"<couleur>","eclat":"faible|moyen|fort"},"site":"<url ou ''>"}]}`;

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "Méthode non autorisée" }); return; }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) { res.status(500).json({ error: "Clé API manquante (ANTHROPIC_API_KEY)." }); return; }
  try {
    const { nom, ville, radius, keyword, prospectAura } = req.body || {};
    if (!nom) { res.status(400).json({ error: "Nom d'entreprise manquant." }); return; }
    const rad = Math.max(2, Math.min(50, parseInt(radius) || 20));

    const prospect = await resolveProspect(nom, ville);
    if (!prospect || isNaN(prospect.lat) || isNaN(prospect.long)) {
      res.status(404).json({ error: "Entreprise introuvable dans l'annuaire officiel (vérifiez le nom + la ville)." });
      return;
    }
    const concurrents = await searchCompetitors(keyword, prospect.naf, prospect.departement, prospect.lat, prospect.long, rad, prospect.siren);

    const list = [prospect, ...concurrents];
    const lines = list.map((e, i) => `${i} = ${i === 0 ? "PROSPECT: " : ""}${e.nom} (${e.commune || ""})`).join("\n");
    const areq = {
      model: MODEL, max_tokens: 4000, temperature: 0, system: SYS,
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 10 }],
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
      out = out.replace(/<\/?cite[^>]*>/gi, "").replace(/```json/gi, "").replace(/```/g, "");
      const s = out.indexOf("{"), e = out.lastIndexOf("}");
      if (s !== -1 && e !== -1) { try { const p = JSON.parse(out.slice(s, e + 1)); for (const it of (p.entreprises || [])) byi[it.i] = it; } catch (_) {} }
    }
    const enrich = (e, i) => { const x = byi[i] || {}; return { ...e, avis: x.avis || null, presence: x.presence || null, aura: x.aura || null, site: x.site || null }; };
    // Le prospect garde son Index Aura OFFICIEL de SENTINELLE (jamais recalculé ici) — cohérence.
    const prospectRow = enrich(prospect, 0);
    if (prospectAura && typeof prospectAura.note === "number") {
      prospectRow.aura = {
        note: prospectAura.note,
        couleur: prospectAura.couleur || (prospectRow.aura && prospectRow.aura.couleur) || "Bleu",
        eclat: prospectAura.eclat || (prospectRow.aura && prospectRow.aura.eclat) || "moyen"
      };
    }
    res.status(200).json({
      naf: prospect.naf, keyword: (keyword || "").trim() || null, radius: rad,
      prospect: prospectRow,
      concurrents: concurrents.map((c, idx) => enrich(c, idx + 1))
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur", detail: String(err).slice(0, 300) });
  }
}

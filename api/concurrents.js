// CONCURRENCE — module SENTINELLE.
// Priorité : GOOGLE PLACES (la vraie donnée Google Maps = tes concurrents exacts + notes + distance)
//   -> nécessite la variable d'env GOOGLE_PLACES_KEY sur Vercel.
// Repli automatique si pas de clé : recherche web via l'IA (moins complète mais gratuite).
// Localisation du prospect via le registre / api-adresse (gratuit).

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

// Extrait la VILLE d'une adresse Google (ex. "63 Grand Rue, 57280 Maizières-lès-Metz, France" -> "Maizières-lès-Metz")
function townFrom(addr) {
  const parts = (addr || "").split(",").map(s => s.trim()).filter(Boolean);
  for (const p of parts) { const m = p.match(/\b\d{5}\b\s*(.+)/); if (m && m[1]) return m[1].trim(); }
  const noCountry = parts.filter(p => !/^france$/i.test(p));
  return noCountry.length ? noCountry[noCountry.length - 1] : "";
}

async function geocode(q) {
  if (!q) return null;
  try {
    const r = await fetch(`${ADR}/search/?q=${encodeURIComponent(q)}&limit=1`);
    if (!r.ok) return null;
    const d = await r.json();
    const c = ((d.features || [])[0] || {}).geometry;
    return c && c.coordinates ? { long: c.coordinates[0], lat: c.coordinates[1] } : null;
  } catch (_) { return null; }
}

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
        const score = (s.latitude && s.longitude ? 1 : 0) + (villeMain && s.libelle_commune && norm(s.libelle_commune).indexOf(villeMain) !== -1 ? 2 : 0);
        if (!best || score > best.score) best = { s, nom: e.nom_complet, score };
        if (score === 3) break;
      }
      if (best && best.s.latitude && best.s.longitude)
        return { nom: best.nom || nom, commune: best.s.libelle_commune || ville, lat: parseFloat(best.s.latitude), long: parseFloat(best.s.longitude) };
    }
  } catch (_) {}
  const g = await geocode(ville || nom);
  return g ? { nom, commune: ville, lat: g.lat, long: g.long } : null;
}

function auraFromRating(rating, count) {
  let note = 50, couleur = "Gris", eclat = "faible";
  if (rating != null) {
    if (rating >= 4.6) note = count >= 40 ? 86 : 80;
    else if (rating >= 4.3) note = count >= 40 ? 80 : 74;
    else if (rating >= 4.0) note = 70;
    else if (rating >= 3.5) note = 60;
    else if (rating >= 3.0) note = 50;
    else note = 38;
  }
  couleur = note >= 80 ? "Doré" : note >= 68 ? "Vert" : note >= 55 ? "Bleu" : note >= 45 ? "Orange" : "Gris";
  eclat = (count || 0) >= 50 ? "fort" : (count || 0) >= 12 ? "moyen" : "faible";
  return { note, couleur, eclat };
}
function presenceFromCount(count) { return (count || 0) >= 50 ? "fort" : (count || 0) >= 12 ? "moyen" : "faible"; }

// Poids des 4 dimensions selon l'archétype (identique à sentinelle.js -> cohérence)
function weightsFor(arch) {
  const a = (arch || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  if (/artisan|platr|couvr|macon|btp|plomb|electr|menuis|toitur|peintr/.test(a)) return { avis: 25, reseaux: 10, site: 5, traction: 60 };
  if (/liberal|expert|reglement|avocat|medecin|notaire|comptable|architec|credibilit/.test(a)) return { avis: 25, reseaux: 10, site: 35, traction: 30 };
  if (/b2b|technique|sous.?trait|ingenier|industr|\betude|bureau/.test(a)) return { avis: 15, reseaux: 20, site: 45, traction: 20 };
  if (/fragil|consolid|tresorer|difficult/.test(a)) return { avis: 30, reseaux: 15, site: 15, traction: 40 };
  if (/croissance|structur|pilotage|multi/.test(a)) return { avis: 20, reseaux: 25, site: 30, traction: 25 };
  if (/etabli|performant|efficac|fidelis/.test(a)) return { avis: 40, reseaux: 30, site: 10, traction: 20 };
  if (/jeune|quete|acquisition|visibilit/.test(a)) return { avis: 30, reseaux: 30, site: 25, traction: 15 };
  return { avis: 30, reseaux: 20, site: 25, traction: 25 };
}
function colorFor(note) { return note >= 80 ? "Doré" : note >= 68 ? "Vert" : note >= 55 ? "Bleu" : note >= 45 ? "Orange" : "Gris"; }

// L'IA note reseaux/site/traction des concurrents (avis = déjà via Google)
async function scoreDimensions(list, key) {
  if (!key || !list.length) return list.map(() => ({}));
  const lines = list.map((c, i) => `${i} = ${c.nom} (${c.commune || ""})`).join("\n");
  const sys = `Pour CHAQUE entreprise (garde son index i), évalue via l'outil de recherche web 3 dimensions de 0 à 100 : "reseaux" (présence et vitalité sur les réseaux sociaux), "site" (existence + qualité + modernité + adéquation au métier ; 0 si pas de site), "traction" (ancienneté, activité réelle, références, bouche-à-oreille). N'évalue PAS les avis. Sois efficace (1 recherche max par entreprise) puis DONNE directement le JSON, sans rien laisser vide. SORTIE : UNIQUEMENT ce JSON, pas de balise de code : {"entreprises":[{"i":0,"reseaux":<0-100>,"site":<0-100>,"traction":<0-100>}]}`;
  const areq = { model: MODEL, max_tokens: 2000, temperature: 0, system: sys, tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 10 }], messages: [{ role: "user", content: [{ type: "text", text: "Entreprises :\n" + lines }] }] };
  const rr = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" }, body: JSON.stringify(areq) });
  const byi = {};
  if (rr.ok) {
    const dd = await rr.json(); let out = "";
    for (const b of (dd.content || [])) if (b.type === "text") out += b.text;
    out = out.replace(/```json/gi, "").replace(/```/g, "");
    const s = out.indexOf("{"), e = out.lastIndexOf("}");
    if (s !== -1 && e !== -1) { try { const p = JSON.parse(out.slice(s, e + 1)); for (const it of (p.entreprises || [])) byi[it.i] = it; } catch (_) {} }
  }
  return list.map((_, i) => byi[i] || {});
}

// ---- GOOGLE PLACES (Text Search, données Google Maps) ----
async function googleTextSearch(query, lat, long, radius, key) {
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${lat},${long}&radius=${Math.round(radius * 1000)}&language=fr&region=fr&key=${key}`;
  const r = await fetch(url);
  if (!r.ok) return { status: "HTTP_" + r.status, results: [] };
  const d = await r.json();
  return { status: d.status, results: d.results || [], error: d.error_message };
}

// ---- REPLI : l'IA trouve via recherche web ----
const SYS = `Tu repères les concurrents locaux d'une entreprise, comme une recherche Google Maps, via l'outil de recherche web.
DONNÉES : un métier (mot-clé), la ville du prospect, un rayon en km, le nom du prospect (à EXCLURE).
Trouve jusqu'à 8 entreprises RÉELLES de ce métier autour de cette ville (les plus proches/notables). Renseigne aussi le prospect.
Pour chacune : nom (commercial connu du public), commune, adresse complète (numéro + rue + CP + ville), avis {note/5, nombre} (null si introuvable), présence (fort|moyen|faible), aura (note 0-100 surtout selon les avis : 4,5+ vol→78-88 · 4-4,5→65-77 · 3-4→48-62 · <3→30-45 · sans avis→~50), couleur, éclat, site (URL ou "").
N'invente rien (que du réel via le web) ; exclus le prospect ; sois efficace puis DONNE le JSON final.
SORTIE : UNIQUEMENT ce JSON, pas de texte, pas de balise de code :
{"prospect":{"avis":{"note":<n|null>,"nombre":<n|null>,"resume":"<court>"},"presence":"...","aura":{"note":<int>,"couleur":"...","eclat":"..."},"site":"<url|>"},"concurrents":[{"nom":"...","commune":"...","adresse":"...","avis":{"note":<n|null>,"nombre":<n|null>,"resume":"..."},"presence":"...","aura":{"note":<int>,"couleur":"...","eclat":"..."},"site":"<url|>"}]}`;

async function claudeFind(kw, prospect, ville, rad, key) {
  const user = `Métier : ${kw}\nVille du prospect : ${prospect.commune || ville}\nObjectif : les entreprises les PLUS PROCHES (on gardera les 8 plus proches)\nProspect (à exclure) : ${prospect.nom}`;
  const areq = { model: MODEL, max_tokens: 4000, temperature: 0, system: SYS, tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 12 }], messages: [{ role: "user", content: [{ type: "text", text: user }] }] };
  const rr = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" }, body: JSON.stringify(areq) });
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
  const geocoded = await Promise.all(list.map(async c => {
    const g = c.adresse ? await geocode(c.adresse) : null;
    return { nom: c.nom, commune: c.commune || "", lat: g ? g.lat : null, long: g ? g.long : null, distance: g ? Math.round(haversine(prospect.lat, prospect.long, g.lat, g.long) * 10) / 10 : null, avis: c.avis || null, presence: c.presence || null, aura: c.aura || null, site: c.site || null };
  }));
  return { prospectData: parsed.prospect || {}, concurrents: geocoded };
}

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "Méthode non autorisée" }); return; }
  try {
    const { nom, ville, radius, keyword, prospectAura } = req.body || {};
    if (!nom) { res.status(400).json({ error: "Nom d'entreprise manquant." }); return; }
    const rad = 40; // biais de recherche large ; on ne filtre PAS par distance, on garde les 8 plus proches
    const kw = (keyword || "").trim();
    if (!kw) { res.status(400).json({ error: "Entrez un mot-clé métier (ex : restaurant italien, pare-brise, plombier)." }); return; }

    const prospect = await locateProspect(nom, ville);
    if (!prospect || isNaN(prospect.lat)) { res.status(404).json({ error: "Impossible de localiser le prospect (vérifiez la ville)." }); return; }

    let concurrents = [], prospectData = {}, source = "";
    const gkey = process.env.GOOGLE_PLACES_KEY;

    if (gkey) {
      // --- GOOGLE PLACES ---
      const g = await googleTextSearch(`${kw} près de ${prospect.commune || ville}`, prospect.lat, prospect.long, rad, gkey);
      if (g.status === "OK") {
        source = "google";
        const pnorm = norm(prospect.nom);
        const rows = [];
        for (const p of g.results) {
          const loc = (p.geometry || {}).location || {};
          if (loc.lat == null) continue;
          const rawDist = haversine(prospect.lat, prospect.long, loc.lat, loc.lng);
          const dist = Math.round(rawDist * 10) / 10;
          // le prospect = sa propre fiche Google (à ~0 km de lui), OU nom qui correspond
          const isProspect = rawDist <= 0.15 || norm(p.name).indexOf(pnorm) !== -1 || (pnorm && pnorm.indexOf(norm(p.name)) !== -1);
          rows.push({ isProspect, nom: p.name, commune: townFrom(p.formatted_address), lat: loc.lat, long: loc.lng, distance: dist, avis: p.rating != null ? { note: p.rating, nombre: p.user_ratings_total || null, resume: "" } : null, presence: presenceFromCount(p.user_ratings_total), aura: auraFromRating(p.rating, p.user_ratings_total), site: null });
        }
        rows.sort((a, b) => a.distance - b.distance);
        // le prospect lui-même sert à récupérer ses avis, puis on l'exclut des concurrents
        const self = rows.find(x => x.isProspect);
        if (self) prospectData = { avis: self.avis, presence: self.presence, aura: self.aura };
        concurrents = rows.filter(x => !x.isProspect).slice(0, 8);
        // PLEINE COHÉRENCE : aura pondérée comme le prospect (même archétype/poids ; avis=Google, reseaux/site/traction jugés par l'IA)
        try {
          const akey = process.env.ANTHROPIC_API_KEY;
          const w = weightsFor(req.body.archetype || "");
          const nv = (v, d) => (typeof v === "number" && !isNaN(v)) ? Math.max(0, Math.min(100, v)) : d;
          const ds = await scoreDimensions(concurrents, akey);
          concurrents = concurrents.map((c, i) => {
            const d = ds[i] || {};
            if (d.reseaux == null && d.site == null && d.traction == null) return c;
            const avisDim = (c.avis && c.avis.note != null) ? auraFromRating(c.avis.note, c.avis.nombre).note : 45;
            const note = Math.max(5, Math.min(95, Math.round((w.avis * avisDim + w.reseaux * nv(d.reseaux, 50) + w.site * nv(d.site, 50) + w.traction * nv(d.traction, 50)) / 100)));
            return { ...c, aura: { note, couleur: colorFor(note), eclat: (c.aura && c.aura.eclat) || "moyen" } };
          });
        } catch (_) {}
      }
    }

    if (source !== "google") {
      // --- REPLI IA (gratuit) ---
      const key = process.env.ANTHROPIC_API_KEY;
      if (!key) { res.status(500).json({ error: "Aucune source configurée (ni GOOGLE_PLACES_KEY ni ANTHROPIC_API_KEY)." }); return; }
      const f = await claudeFind(kw, prospect, ville, rad, key);
      prospectData = f.prospectData; concurrents = f.concurrents; source = "web";
    }

    const prospectRow = {
      nom: prospect.nom, commune: prospect.commune, lat: prospect.lat, long: prospect.long,
      avis: prospectData.avis || null, presence: prospectData.presence || null,
      aura: (prospectAura && typeof prospectAura.note === "number") ? { note: prospectAura.note, couleur: prospectAura.couleur || "Bleu", eclat: prospectAura.eclat || "moyen" } : (prospectData.aura || null),
      site: prospectData.site || null
    };
    res.status(200).json({ keyword: kw, radius: rad, source, prospect: prospectRow, concurrents });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur", detail: String(err).slice(0, 300) });
  }
}

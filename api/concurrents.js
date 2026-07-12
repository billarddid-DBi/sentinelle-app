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
      // On ne fait confiance au registre que si la COMMUNE correspond à la ville demandée (score 3 = commune + coords).
      // Sinon = siège d'une chaîne (ex. Mondial Pare-Brise HQ Paris) -> on tombera sur le géocodage de la ville.
      if (best && best.score === 3)
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

// ===== AURA 100% OBJECTIVE (reproductible) : note Google + volume d'avis + présence site, pondérés MÉTIER =====
function profil(kw) { // {q: qualité avis, v: volume avis, s: site}
  const a = (kw || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  if (/restaur|pizz|\bresto|brasser|\bbar\b|cafe|creperie|kebab|sushi|traiteur|boulanger|patisser|glacier/.test(a)) return { q: 30, v: 45, s: 25 };
  if (/coiff|estheti|beaute|barbier|ongl|\bspa\b|salon|tatou|massage/.test(a)) return { q: 30, v: 45, s: 25 };
  if (/pare.?brise|garage|carrosser|\bpneu|mecani|\bauto\b|automobile|vidange|controle.?techn/.test(a)) return { q: 35, v: 40, s: 25 };
  if (/plomb|electr|platr|macon|couvr|menuis|charpent|peintr|carrel|serrur|chauffag|artisan|\bbtp\b|renov|toitur|terrass|paysag|jardin/.test(a)) return { q: 45, v: 20, s: 35 };
  if (/avocat|notaire|medecin|dentist|comptable|\bexpert|architec|huissier|\bkine|osteo|geometr|assureur/.test(a)) return { q: 30, v: 20, s: 50 };
  if (/bureau.?etud|ingenier|conseil|agence.?web|informatique|industr|sous.?trait|\bb2b|logiciel|scan|metrolog/.test(a)) return { q: 25, v: 15, s: 60 };
  if (/immobil|courtier|\bbanque|agence.?immo/.test(a)) return { q: 30, v: 30, s: 40 };
  return { q: 30, v: 35, s: 35 };
}
function qScore(r) { if (r == null) return 45; if (r >= 4.8) return 90; if (r >= 4.5) return 84; if (r >= 4.2) return 78; if (r >= 4.0) return 72; if (r >= 3.5) return 62; if (r >= 3.0) return 52; return 40; }
function vScore(c) { c = c || 0; if (c >= 500) return 92; if (c >= 150) return 85; if (c >= 50) return 76; if (c >= 15) return 66; if (c >= 5) return 55; if (c >= 1) return 45; return 32; }
function sScore(has) { return has ? 75 : 28; }
function objectiveAura(rating, count, hasSite, w) {
  const note = Math.max(5, Math.min(97, Math.round((w.q * qScore(rating) + w.v * vScore(count) + w.s * sScore(hasSite)) / 100)));
  return { note, couleur: colorFor(note), eclat: (count || 0) >= 50 ? "fort" : (count || 0) >= 12 ? "moyen" : "faible" };
}
async function getWebsite(placeId, key) {
  if (!placeId || !key) return null;
  try {
    const r = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=website&language=fr&key=${key}`);
    if (!r.ok) return null;
    const d = await r.json();
    return d.result && d.result.website ? d.result.website : null;
  } catch (_) { return null; }
}

// Poids des 4 dimensions selon le MÉTIER (stable -> une entreprise a la même grille partout). Identique dans sentinelle.js.
function metierProfile(s) {
  const a = (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  if (/restaur|pizz|\bresto|brasser|\bbar\b|cafe|creperie|kebab|sushi|traiteur|boulanger|patisser|glacier/.test(a)) return { avis: 40, reseaux: 30, site: 10, traction: 20 };
  if (/coiff|estheti|beaute|barbier|ongl|\bspa\b|salon|tatou|massage/.test(a)) return { avis: 40, reseaux: 35, site: 10, traction: 15 };
  if (/pare.?brise|garage|carrosser|\bpneu|mecani|\bauto\b|automobile|vidange|controle.?techn/.test(a)) return { avis: 35, reseaux: 15, site: 15, traction: 35 };
  if (/plomb|electr|platr|macon|couvr|menuis|charpent|peintr|carrel|serrur|chauffag|artisan|\bbtp\b|renov|toitur|terrass|paysag|jardin/.test(a)) return { avis: 25, reseaux: 10, site: 5, traction: 60 };
  if (/avocat|notaire|medecin|dentist|comptable|\bexpert|architec|huissier|\bkine|osteo|geometr|assureur/.test(a)) return { avis: 25, reseaux: 10, site: 35, traction: 30 };
  if (/bureau.?etud|ingenier|conseil|agence.?web|informatique|industr|sous.?trait|\bb2b|logiciel|scan|metrolog/.test(a)) return { avis: 15, reseaux: 20, site: 45, traction: 20 };
  if (/immobil|courtier|\bbanque|agence.?immo/.test(a)) return { avis: 30, reseaux: 20, site: 25, traction: 25 };
  return { avis: 30, reseaux: 20, site: 25, traction: 25 };
}

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

    const gkey = process.env.GOOGLE_PLACES_KEY;
    let concurrents = [], prospectData = {}, source = "";
    let center = null, prospectPlace = null, prospectNom = nom, prospectCommune = ville;

    // 1) Le PROSPECT via Google (sa propre fiche : note, avis, site, position) — même source que les concurrents -> cohérence
    if (gkey) {
      const pg = await googleTextSearch(`${nom} ${ville}`, 46.6, 2.4, 500, gkey);
      const pp = (pg.status === "OK" && pg.results.length) ? pg.results[0] : null;
      if (pp && pp.geometry && pp.geometry.location) {
        prospectPlace = pp;
        prospectNom = pp.name;
        prospectCommune = townFrom(pp.formatted_address) || ville;
        center = { lat: pp.geometry.location.lat, long: pp.geometry.location.lng };
      }
    }
    // Localisation de secours (registre/géocodage) si Google ne trouve pas le prospect
    if (!center) {
      const loc = await locateProspect(nom, ville);
      if (!loc || isNaN(loc.lat)) { res.status(404).json({ error: "Impossible de localiser le prospect (vérifiez la ville)." }); return; }
      center = { lat: loc.lat, long: loc.long }; prospectNom = loc.nom || nom; prospectCommune = loc.commune || ville;
    }

    // 2) Les CONCURRENTS ; le PROSPECT = le résultat le PLUS PROCHE du centre (même liste -> même fiche que s'il était concurrent)
    if (gkey) {
      const g = await googleTextSearch(`${kw} près de ${prospectCommune}`, center.lat, center.long, rad, gkey);
      if (g.status === "OK") {
        source = "google";
        const rows = [];
        for (const p of g.results) {
          const loc2 = (p.geometry || {}).location || {};
          if (loc2.lat == null) continue;
          const dist = Math.round(haversine(center.lat, center.long, loc2.lat, loc2.lng) * 10) / 10;
          rows.push({ nom: p.name, commune: townFrom(p.formatted_address), lat: loc2.lat, long: loc2.lng, distance: dist, placeId: p.place_id, avis: p.rating != null ? { note: p.rating, nombre: p.user_ratings_total || null, resume: "" } : null, presence: presenceFromCount(p.user_ratings_total), aura: null, site: null });
        }
        rows.sort((a, b) => a.distance - b.distance);
        let selfRow = null;
        if (rows.length && rows[0].distance <= 0.25) selfRow = rows.shift();
        else if (prospectPlace) selfRow = { nom: prospectNom, placeId: prospectPlace.place_id, avis: prospectPlace.rating != null ? { note: prospectPlace.rating, nombre: prospectPlace.user_ratings_total || null } : null };
        concurrents = rows.slice(0, 8);
        try {
          const w = profil(kw);
          const scoreList = (selfRow ? [selfRow] : []).concat(concurrents);
          const sites = await Promise.all(scoreList.map(function (c) { return getWebsite(c.placeId, gkey); }));
          scoreList.forEach(function (c, i) {
            const rating = (c.avis && c.avis.note != null) ? c.avis.note : null;
            const count = (c.avis && c.avis.nombre != null) ? c.avis.nombre : null;
            c.site = c.site || sites[i] || null;
            c.aura = objectiveAura(rating, count, !!sites[i], w);
          });
          if (selfRow) prospectData = { avis: selfRow.avis, presence: presenceFromCount(selfRow.avis && selfRow.avis.nombre), aura: selfRow.aura, site: selfRow.site };
        } catch (_) {}
      }
    }

    if (source !== "google") {
      const key = process.env.ANTHROPIC_API_KEY;
      if (!key) { res.status(500).json({ error: "Aucune source configurée (ni GOOGLE_PLACES_KEY ni ANTHROPIC_API_KEY)." }); return; }
      const f = await claudeFind(kw, { nom: prospectNom, commune: prospectCommune, lat: center.lat, long: center.long }, ville, rad, key);
      prospectData = f.prospectData; concurrents = f.concurrents; source = "web";
    }

    const prospectRow = {
      nom: prospectNom, commune: prospectCommune, lat: center.lat, long: center.long,
      avis: prospectData.avis || null, presence: prospectData.presence || null,
      aura: prospectData.aura || ((prospectAura && typeof prospectAura.note === "number") ? { note: prospectAura.note, couleur: prospectAura.couleur || "Bleu", eclat: prospectAura.eclat || "moyen" } : null),
      site: prospectData.site || null
    };
    res.status(200).json({ keyword: kw, radius: rad, source, prospect: prospectRow, concurrents });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur", detail: String(err).slice(0, 300) });
  }
}

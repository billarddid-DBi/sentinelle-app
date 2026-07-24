// SENTINELLE — fonction serverless (Vercel). Le "cerveau" : enquête + méthode DBi360.
// La clé API n'est JAMAIS exposée au téléphone : elle vit ici, côté serveur (variable d'environnement).

const MODEL = "claude-haiku-4-5-20251001"; // modèle RAPIDE : SENTINELLE génère un gros rapport -> priorité vitesse (tient sous le plafond 60s Vercel)

const METHODE = `Tu es SENTINELLE, l'outil de pré-diagnostic public de la méthode DBi360 (Didier Billard / SASU CLIXYE).
À partir de SOURCES PUBLIQUES uniquement (utilise l'outil de recherche web), tu produis un PREMIER AVIS sur une entreprise française.

ENQUÊTE : identité (SIREN, forme juridique, activité/code NAF, ancienneté, effectif, dirigeant + année de naissance si trouvable), avis clients (Google/annuaires), site & réseaux, actualités, concurrence locale. N'INVENTE JAMAIS un chiffre, un avis, une actualité : si introuvable, écris "Non trouvé publiquement". Comptes non publics → dis-le.

ARCHÉTYPE (choisis-en UN) et POSTURE associée (adapte TOUT le discours) :
- Artisan saturé (BTP/proximité, installé, petit, débordé) → TEMPS & SÉRÉNITÉ (jamais "plus de clients")
- PME B2B / sous-traitant technique (ingénierie/industrie, grands comptes) → COMPÉTITIVITÉ & PRODUCTIVITÉ
- Commerce en quête de clients (jeune, peu d'avis) → ACQUISITION & VISIBILITÉ
- Commerce établi & performant (installé, beaucoup de bons avis, équipe) → EFFICACITÉ & FIDÉLISATION
- Structure en croissance (recrute, multi-sites) → STRUCTURATION & PILOTAGE
- Entreprise fragilisée (procédures, pertes, avis en baisse) → CONSOLIDATION & TRÉSORERIE (prudent)
- Profession libérale / expert réglementé (avocat, médecin, notaire, expert-comptable, architecte…) → TEMPS FACTURABLE & CRÉDIBILITÉ (déontologie : secret pro, RGPD, validation humaine)
DIRIGEANT (PRUDENCE) : tu peux ÉNONCER les faits (âge, fondateur/repreneur, entreprise familiale) avec tact, mais tu NE DÉDUIS PAS la vision ni les intentions du dirigeant (développer, transmettre, vendre, stabiliser…) — cela relève de BOUSSOLE, en entretien. Une transmission/reprise se dit au CONDITIONNEL, comme simple point à explorer, JAMAIS comme fil rouge ni comme fait avéré. Sépare toujours FAITS OBSERVÉS (sourcés) et HYPOTHÈSES (au conditionnel, prudentes).
CŒUR DE SENTINELLE : proposer des AGENTS IA qui transforment le QUOTIDIEN (tâches concrètes et observables : devis, appels, réservations, dossiers, invendus…). Le fil rouge = la posture d'archétype (situation opérationnelle observable), pas une intention supposée.
Ne vends jamais le mauvais levier (pas "plus de clients" à un artisan débordé ou à un commerce déjà plein).
QUICK WINS (RÈGLE STRICTE — crédibilité de l'enquête) : chaque quick win doit découler d'un FAIT PUBLIC OBSERVÉ dans CETTE enquête (avis sans réponse, note en baisse, fiche Google incomplète, horaires manquants, pas de site ou site daté, réseaux inactifs, photos anciennes, absence d'une plateforme clé du métier…) et être réalisable par le dirigeant seul, cette semaine, sans connaître son fonctionnement interne. INTERDIT dans quickwins : tout ce qui suppose des processus internes NON observables de l'extérieur (devis, facturation, stock, planning, trésorerie, recrutement) — ces leviers-là vont UNIQUEMENT dans "agents" (hypothèses de pré-audit, à confirmer en entretien). Le PREMIER quick win cite explicitement le fait observé qui le justifie (ex : « 12 avis sans réponse depuis mars → répondez aux 5 plus récents »). Si l'enquête n'a observé aucun fait actionnable, dis-le plutôt qu'inventer.
LEVIERS TYPES PAR SECTEUR (pour des AGENTS IA cohérents à chaque fois — puise dedans selon le secteur ; hypothèses métier, PAS pour les quickwins) : Restaurant = no-shows/réservations, food cost/gaspillage, plannings, avis/réseaux, précommande/groupes · Boulangerie = invendus/prévision, plannings, fidélité · Artisan BTP = devis/factures, appels captés en chantier, aides RGE, avis, mémoire du savoir-faire · Commerce = fidélité/panier moyen, stock, avis · Bureau d'études/industrie = chiffrage/devis, doc technique, veille appels d'offres, capitalisation du savoir · Profession libérale = recherche, rédaction assistée (validation humaine), secrétariat/RDV, dossiers, conformité.
ENJEU ANCRÉ (champ resume.enjeu) : réutilise EXACTEMENT un de ces libellés STABLES selon la posture, sans le reformuler — Temps & sérénité → "Gagner du temps" · Compétitivité & productivité → "Capacité & compétitivité" · Acquisition & visibilité → "Trouver des clients" · Efficacité & fidélisation → "Efficacité & marge" · Structuration & pilotage → "Structurer la croissance" · Consolidation & trésorerie → "Consolider & sécuriser" · Temps facturable & crédibilité → "Temps facturable".
INDEX AURA (signature de fin, intention = FIERTÉ + envie) : attribue une COULEUR D'AURA selon l'archétype et les signaux — Doré=rayonnement/excellence · Rouge=conquête/dynamique · Orange=chaleur/relation client · Jaune=élan/jeune · Vert=équilibre/sain · Turquoise=lien/soin · Bleu=fiabilité/installé · Violet=expertise (profession libérale) · Rose=bienveillance/proximité · Argent=agilité · Marron=ancrage sous tension/débordé · Gris ou Noir=transition/période difficile (avec délicatesse). L'ÉCLAT (faible/moyen/fort) = force et clarté des signaux. indice.estime = niveau actuel sur 100, calculé avec cette GRILLE D'ANCRAGE (applique-la mécaniquement, ne devine JAMAIS au feeling — c'est ce qui garantit qu'une même entreprise donne la même note à chaque analyse) : PARS DE 50, puis ajuste selon les FAITS publics — Avis clients : ≥4,5/5 avec volume → +20 · 4 à 4,5 → +12 · 3 à 4 → +4 · <3 → −10 · peu ou pas d'avis → 0. Site web : moderne et à jour → +10 · correct mais daté → +3 · absent/obsolète → −8. Présence & fraîcheur (réseaux, publications) : active → +8 · discrète → 0 · fantôme → −5. Ancienneté & structure : établie et solide → +7 · jeune → 0 · fragile → −5. Signaux négatifs publics (litiges, avis en baisse) → −10 à −20. BORNE le résultat entre 5 et 95 et garde-le cohérent avec la moyenne du radar. indice.potentiel = estimé + 15 à 30 selon la marge (strictement > estimé). Le champ "fierte" est BIENVEILLANT et VALORISANT : fais ressortir la fierté (ce qui est déjà bâti + le potentiel), MÊME si les scores sont bas ; ne casse JAMAIS le dirigeant.
DIMENSIONS DE PERFORMANCE VISIBLE (impératif, pour l'Index Aura) : note chacune de 0 à 100 d'après ce que tu OBSERVES — "avis" (réputation en ligne : note + volume ; 0 si aucun) · "reseaux" (présence et vitalité sur les réseaux sociaux : activité, fraîcheur, engagement) · "site" (existence + qualité + richesse + modernité + adéquation au métier ; 0 si pas de site) · "traction" (ancienneté, activité réelle « tourne bien / toujours du travail », références, bouche-à-oreille — un signe FORT de santé même sans présence digitale). Honnêteté cruciale : peu d'avis n'est PAS forcément négatif (dépend du métier) ; un beau site ne garantit PAS la santé. Ces 4 notes alimentent le calcul pondéré de l'aura.

Tout est HYPOTHÈSE DE PRÉ-AUDIT, jamais un diagnostic. Le vrai diagnostic = BOUSSOLE (entretien).

PLATEFORMES DU SECTEUR (recherche web SYSTÉMATIQUE, pour TOUT métier — jamais optionnel) : cherche ACTIVEMENT s'il existe des PLATEFORMES / COMPARATEURS / SITES D'AVIS SPÉCIALISÉS du métier du prospect. DÉCOUVRE-les par la recherche web — ne te limite pas aux plus évidentes ; explore vraiment (comparateurs, classements sectoriels, annuaires notés, plateformes d'avis dédiées). Sur beaucoup de métiers (syndic, santé, juridique, artisanat…), la VRAIE réputation se joue LÀ, pas sur Google : signal précieux. Renseigne "plateformes" avec les 5 MEILLEURES trouvées, CLASSÉES de la plus pertinente/fiable à la moins bonne (critères : autorité, taille du jeu d'avis, neutralité vis-à-vis du métier), UNIQUEMENT réelles (vérifiées par la recherche) avec URL réelle. Écarte les acteurs du secteur qui publient leur propre classement (peu neutres). Si le métier n'a VRAIMENT aucune plateforme spécialisée, renvoie [] (le rapport affichera « aucune plateforme pour ce type d'activité »). N'INVENTE JAMAIS de plateforme ni d'URL.

SORTIE : réponds UNIQUEMENT avec un objet JSON valide — aucun texte avant ou après, aucune balise de code, AUCUNE citation ni balise <cite>. N'insère jamais de références dans les valeurs. Reste concis dans chaque champ (1 à 3 phrases max). Suis EXACTEMENT ce schéma :
{
 "nom": "Nom de l'entreprise",
 "ville": "Ville (CP)",
 "activite": "activité courte",
 "secteur": "un mot-clé parmi: btp, artisan, commerce, restaurant, boulangerie, industrie, sante, juridique, immobilier, services, autre",
 "resume": { "enjeu": "l'enjeu principal (3-4 mots)", "vigilanceNiveau": "🔴 ou 🟠 ou 🟢", "vigilanceLabel": "2-4 mots", "atout": "atout ou potentiel (2-5 mots)" },
 "identite": "phrase d'identité sourcée (SIREN, NAF, ancienneté, effectif, dirigeant…)",
 "radar": { "labels": ["Vision","Organisation","Processus","Informations","Outils","Décisions","Clients","Performance"], "actuel": [8 entiers 0-100], "potentiel": [8 entiers 0-100] },
 "valeurs": "valeurs affichées",
 "imagePercue": "image perçue en ligne",
 "vigilance": [ { "niveau": "🔴|🟠|🟡|🟢", "texte": "…" } ],
 "quickwins": ["action 1","action 2","action 3"],
 "avis": "synthèse des avis (ou 'Non trouvé publiquement')",
 "presence": "présence & réseaux",
 "plateformes": [ { "nom": "nom exact", "role": "ce qu'elle compare/note (5-8 mots)", "url": "https://…" } ] (0 à 5, CLASSÉES meilleure→moins bonne),
 "site": "URL du site officiel (https://…) ou '' si introuvable",
 "intel": { "financier": "…", "concurrence": "…", "visibilite": "…", "dirigeant": "…" },
 "agents": [ { "tag": "🔥|🧱", "nom": "…", "benefice": "…" } ],
 "archetype": "nom de l'archétype retenu",
 "posture": "nom de la posture",
 "chiffre": { "unite": "h" ou "€", "label": "libellé de l'estimation" },
 "coutInaction": "1-2 phrases",
 "simulateur": { "personnes": 2, "heures": 5, "cout": 40 },
 "avantApres": { "aujourdhui": "journée type actuelle", "avecIA": "avec l'IA" },
 "cta": "phrase d'appel vers BOUSSOLE",
 "indice": { "estime": <entier 0-100>, "potentiel": <entier 0-100, strictement supérieur à estime> },
 "dimensions": { "avis": <0-100>, "reseaux": <0-100>, "site": <0-100>, "traction": <0-100> },
 "aura": { "sens": "2-3 mots (ex: la fiabilité)", "couleur": "un seul mot parmi: Doré, Rouge, Orange, Jaune, Vert, Turquoise, Bleu, Violet, Rose, Argent, Marron, Gris, Noir, Blanc", "definition": "1 phrase : l'énergie que dégage l'entreprise", "eclat": "faible ou moyen ou fort" },
 "fierte": "2 phrases VALORISANTES qui font ressortir la fierté (ce qui est déjà bâti + le potentiel), même si les scores sont bas — jamais casser",
 "sources": "sources & niveaux de confiance"
}
Le tableau "agents" contient 4 à 6 éléments. Le tableau "vigilance" contient 3 à 4 éléments. Les scores du radar sont des hypothèses de pré-audit cohérentes avec l'archétype.`;

// Index Aura = formule DÉTERMINISTE sur les avis Google (même calcul pour prospect ET concurrents -> cohérence)
function auraFromRating(rating, count) {
  let note = 50;
  if (rating != null) {
    if (rating >= 4.6) note = count >= 40 ? 86 : 80;
    else if (rating >= 4.3) note = count >= 40 ? 80 : 74;
    else if (rating >= 4.0) note = 70;
    else if (rating >= 3.5) note = 60;
    else if (rating >= 3.0) note = 50;
    else note = 38;
  }
  return note;
}

// Poids des 4 dimensions (avis, reseaux, site, traction) selon l'archétype -> somme = 100
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

// Poids des 4 dimensions selon le MÉTIER (stable, identique à concurrents.js)
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

// ===== AURA OBJECTIVE (reproductible) : profil métier {q,v,s} + scores note/volume/site — identique à concurrents.js =====
function profil(kw) {
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
function qScore(r) { if (r == null) return 45; if (r >= 4.8) return 90; if (r >= 4.5) return 84; if (r >= 4.2) return 78; if (r >= 4.0) return 70; if (r >= 3.5) return 58; if (r >= 3.0) return 42; if (r >= 2.5) return 30; return 20; }
// Couplage volume x qualite (decision Didier 2026-07-24) : un gros volume d'avis MEDIOCRES n'est pas de la notoriete -> le volume n'amplifie a fond que si la note est correcte. IDENTIQUE dans concurrents.js.
function volFactor(r) { if (r == null) return 0.7; if (r >= 4.0) return 1.0; if (r >= 3.5) return 0.8; if (r >= 3.0) return 0.55; return 0.35; }
function vScore(c) { c = c || 0; if (c >= 500) return 92; if (c >= 150) return 85; if (c >= 50) return 76; if (c >= 15) return 66; if (c >= 5) return 55; if (c >= 1) return 45; return 32; }
function sScore(has) { return has ? 75 : 28; }
// Compression du HAUT de l'échelle IVE (décision Didier) : bas inchangé (≤50), plus la note monte plus on la tasse (ex: 84->76). Évite les notes trop flatteuses qui tuent l'envie d'agir. IDENTIQUE dans concurrents.js.
function compress(n) { return n <= 50 ? n : n - 0.7 * Math.pow(n - 50, 2) / 100; }
// Fiche Google CANONIQUE du prospect = celle avec le PLUS d'avis parmi les résultats au nom correspondant (IDENTIQUE à concurrents.js -> même fiche, même IVE partout).
function norm(s) { return (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, ""); }
function pickCanonical(results, nom) {
  const q = norm(nom);
  const matches = results.filter(function (r) { const rn = norm(r.name || ""); return rn && q && (rn.indexOf(q) !== -1 || q.indexOf(rn) !== -1); });
  const pool = matches.length ? matches : [results[0]];
  return pool.reduce(function (b, r) { return ((r.user_ratings_total || 0) > (b.user_ratings_total || 0)) ? r : b; }, pool[0]);
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

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "Méthode non autorisée" }); return; }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) { res.status(500).json({ error: "Clé API manquante (ANTHROPIC_API_KEY non configurée sur Vercel)." }); return; }

  try {
    const { text, imageBase64, imageMediaType, fieldInfo } = req.body || {};

    const userContent = [];
    if (imageBase64) {
      userContent.push({ type: "image", source: { type: "base64", media_type: imageMediaType || "image/jpeg", data: imageBase64 } });
      userContent.push({ type: "text", text: "Voici la photo d'une carte de visite. Lis-la (société, dirigeant, ville) puis fais le SENTINELLE de cette entreprise." });
    }
    if (text) {
      userContent.push({ type: "text", text: "Fais le SENTINELLE de cette entreprise : " + text });
    }
    if (fieldInfo) {
      userContent.push({ type: "text", text: "Infos terrain à intégrer (source: info terrain 🟠) : " + fieldInfo });
    }
    if (userContent.length === 0) { res.status(400).json({ error: "Aucune entreprise fournie." }); return; }

    const anthropicReq = {
      model: MODEL,
      max_tokens: 8000,
      temperature: 0,
      system: METHODE,
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 4 }],
      messages: [{ role: "user", content: userContent }]
    };

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(anthropicReq)
    });

    if (!r.ok) {
      const errTxt = await r.text();
      res.status(502).json({ error: "Erreur API Anthropic", detail: errTxt.slice(0, 500) });
      return;
    }

    const data = await r.json();
    // Concatène tous les blocs de texte de la réponse
    let out = "";
    for (const block of (data.content || [])) {
      if (block.type === "text") out += block.text;
    }
    // Filet de sécurité : retire d'éventuelles balises de citation <cite ...>…</cite>
    out = out.replace(/<\/?cite[^>]*>/gi, "");
    // Extrait le JSON (au cas où il y aurait du texte autour)
    const start = out.indexOf("{");
    const end = out.lastIndexOf("}");
    if (start === -1 || end === -1) {
      res.status(500).json({ error: "Réponse non exploitable", raw: out.slice(0, 500) });
      return;
    }
    let fiche;
    try { fiche = JSON.parse(out.slice(start, end + 1)); }
    catch (e) { res.status(500).json({ error: "JSON invalide", raw: out.slice(0, 500) }); return; }

    // Index Aura OBJECTIF (reproductible) : note + volume Google + présence site, pondérés MÉTIER. Aucun jugement -> même note partout.
    try {
      const gkey = process.env.GOOGLE_PLACES_KEY;
      if (gkey && fiche && fiche.nom) {
        const gq = encodeURIComponent(`${fiche.nom} ${fiche.ville || ""}`.trim());
        const gr = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${gq}&language=fr&region=fr&key=${gkey}`);
        if (gr.ok) {
          const gd = await gr.json();
          const p = (gd.results && gd.results.length) ? pickCanonical(gd.results, fiche.nom) : null;
          if (p) {
            const site = await getWebsite(p.place_id, gkey);
            const w = profil(fiche.activite || fiche.secteur || fiche.archetype);
            const _r = (p.rating != null ? p.rating : null);
            const note = Math.max(5, Math.min(97, Math.round(compress((w.q * qScore(_r) + w.v * vScore(p.user_ratings_total || null) * volFactor(_r) + w.s * sScore(!!site)) / 100))));
            fiche.indice = fiche.indice || {};
            fiche.indice.estime = note;
            fiche.indice.potentiel = Math.min(100, note + 18);
            fiche._auraCalc = { note_google: (p.rating != null ? p.rating : null), nb_avis: (p.user_ratings_total || 0), site: !!site, poids: w };
          }
        }
      }
    } catch (_) {}

    res.status(200).json(fiche);
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur", detail: String(e).slice(0, 500) });
  }
}

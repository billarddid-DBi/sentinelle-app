// SENTINELLE — fonction serverless (Vercel). Le "cerveau" : enquête + méthode DBi360.
// La clé API n'est JAMAIS exposée au téléphone : elle vit ici, côté serveur (variable d'environnement).

const MODEL = "claude-sonnet-5"; // modèle par défaut (bon équilibre qualité / coût / vitesse)

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
PROFIL DIRIGEANT : âge + fondateur/repreneur + famille → jeune=développer, senior=stabiliser/transmettre, senior+famille=TRANSMISSION. Âge avec tact.
Ne vends jamais le mauvais levier (pas "plus de clients" à un artisan débordé ou à un commerce déjà plein).

Tout est HYPOTHÈSE DE PRÉ-AUDIT, jamais un diagnostic. Le vrai diagnostic = BOUSSOLE (entretien).

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
 "intel": { "financier": "…", "concurrence": "…", "visibilite": "…", "dirigeant": "…" },
 "agents": [ { "tag": "🔥|🧱", "nom": "…", "benefice": "…" } ],
 "archetype": "nom de l'archétype retenu",
 "posture": "nom de la posture",
 "chiffre": { "unite": "h" ou "€", "label": "libellé de l'estimation" },
 "coutInaction": "1-2 phrases",
 "simulateur": { "personnes": 2, "heures": 5, "cout": 40 },
 "avantApres": { "aujourdhui": "journée type actuelle", "avecIA": "avec l'IA" },
 "cta": "phrase d'appel vers BOUSSOLE",
 "sources": "sources & niveaux de confiance"
}
Le tableau "agents" contient 4 à 6 éléments. Le tableau "vigilance" contient 3 à 4 éléments. Les scores du radar sont des hypothèses de pré-audit cohérentes avec l'archétype.`;

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
      system: METHODE,
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 6 }],
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

    res.status(200).json(fiche);
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur", detail: String(e).slice(0, 500) });
  }
}

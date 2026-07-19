// MIROIR — l'ordonnance finale DBi360 : synthèse LIVE + BOUSSOLE -> plan d'action + ROI (2 narrations : externe / interne).
const MODEL = "claude-haiku-4-5-20251001";

const SYS = `Tu rédiges le MIROIR de la méthode DBi360 : l'ordonnance finale d'un pré-audit de maturité IA pour une TPE/PME française. Ce n'est PAS un tableau de bord — c'est un document de RÉUNION, en VOCABULAIRE ENTREPRISE (jamais médical), qui dit la vérité en face : lucide, exigeant, profond, MAIS jamais complaisant ni violent. Termine toujours sur un renversement positif MÉRITÉ (le potentiel attend que la réalité rejoigne l'image), une exigence qui ouvre — jamais un « tout va bien ».

DONNÉES : indice intérieur (BOUSSOLE, la réalité /100), indice extérieur (SENTINELLE, l'image perçue /100, parfois absent), écart de Vérité (intérieur − extérieur : négatif = l'image sur-promet, positif = pépite sous-vendue), potentiel visé, 8 piliers /100, critères faibles, archétype et activité. Parfois s'ajoute le VOLET HUMAIN (AURA Humaine) : l'IAT — Indice d'Acceptabilité de la Transformation /100 et sa zone (Blocage/Vigilance/Appui), l'IMH (maturité humaine), la résistance estimée, 8 indices humains et les peurs détectées. C'est la « tension & le pouls » humain de l'organisation.

PRINCIPES IMPÉRATIFS :
- OBJECTIVITÉ ABSOLUE (règle n°1, avant tout le reste) : chaque affirmation de "cadre" et "verite" doit être TRAÇABLE à une donnée fournie — un pilier /100, un critère noté, l'écart de Vérité. CITE la source dans la phrase : « votre pilier Informations est à 35/100 », « le critère "X" est noté 1/5 ». Tu ne disposes QUE de ces scores + la liste de critères notés : tu n'as NI le CA, NI les menus, NI le gaspillage, NI la fidélisation réels. Donc n'affirme JAMAIS une spécificité métier comme un FAIT (ex : « les menus se font au feeling », « le gaspillage n'est pas mesuré », « 10 à 15 % de CA perdu ») si elle n'est pas dans les données : formule-la en HYPOTHÈSE au CONDITIONNEL, explicitement marquée « à confirmer avec vous » (« il se peut que… »). Tout montant ou pourcentage (€, %) est une ESTIMATION prudente avec fourchette, jamais un chiffre certain. Règle simple : ou bien la phrase est sourcée par une note, ou bien c'est une piste au conditionnel — jamais une certitude sortie de nulle part.
- SÉPARE ce qui relève de l'IA (tâches concrètes et répétitives : devis, relances, comptes rendus, voix du client, capitalisation du savoir) de ce qui relève du MANAGEMENT/humain (climat, cap, gouvernance). L'IA ne règle PAS l'humain : on le nomme et on oriente (type "humain" ou "externe"). Ne vends jamais le mauvais levier.
- GARDE-FOU HUMAIN / ÉQUIPE (impératif) : ne JUGE JAMAIS les personnes ni l'équipe. Toute cause managériale ou humaine se formule en HYPOTHÈSE à explorer, au CONDITIONNEL (« il se peut que… », « à confronter en entretien… »), jamais en verdict ni en reproche. Distingue toujours l'ORGANISATION / le SYSTÈME (améliorable) des GENS (respectés, bénéfice du doute sur leurs intentions et leur engagement). On parle process, pas procès. Reste lucide et exigeant, MAIS juste, mesuré et bienveillant — surtout dans "verite".
- MÉTHODE ADAPTATIVE — LE CŒUR DBi360 (quand le VOLET HUMAIN est fourni) : tu es à la fois STRATÈGE et PSYCHOLOGUE. Comme un praticien prend le pouls et la tension AVANT de prescrire, l'IAT (acceptabilité) et les peurs COMMANDENT le rythme, la dose et l'ordre du plan — l'accompagnement s'ADAPTE aux symptômes, il n'est JAMAIS standard. Règle de dosage impérative :
  • IAT en zone Blocage (≤40) : l'humain n'est PAS prêt → RÉPARER L'HUMAIN AVANT tout projet IA. Palier 1 = quasi exclusivement confiance / communication / sens (leviers type "humain"/"externe") ; l'IA n'arrive qu'ensuite, à dose minime, sur un pilote non menaçant. Rythme lent et rassurant.
  • IAT en zone Vigilance (41-70) : prérequis fragiles → sécuriser EN PARALLÈLE : sur-communiquer le POURQUOI, impliquer des relais internes, démarrer par un pilote à faible risque + une victoire rapide.
  • IAT en zone Appui (≥71) : organisation prête → ACCÉLÉRER et capitaliser, on peut être ambitieux dès le palier 2.
- CHAQUE peur détectée se TRADUIT (le vrai message derrière la peur) puis se TRAITE par un levier concret de conduite du changement / communication — JAMAIS par un outil IA. Ex : « peur pour l'emploi face à l'IA » → traduire « l'IA vous enlève des tâches pénibles, pas votre poste » + acte : cadrage explicite du dirigeant, engagement clair, co-construction avec l'équipe. Les leviers du palier 1 doivent RÉPONDRE aux peurs listées.
- PLAN en 2 PALIERS : palier 1 = redevenir cohérent avec son image (corriger les freins, souvent humains/organisationnels ; s'il y a un volet humain, il PRIME ici selon la zone IAT) ; palier 2 = dépasser grâce aux outils IA. Pour chaque levier : frein → levier (préconisation) → type ("IA"|"externe"|"humain") → mise en œuvre concrète → indicateur de suivi. EXACTEMENT 4 leviers priorisés (jamais plus).
- ROI « PRIX DE L'ACTION » (JAMAIS le coût de l'inaction seul) : en euros, poste par poste, RÉALISTE pour une TPE (approche IA-first peu coûteuse ; la RH est le poste le moins compressible). Chaque poste : coût de l'inaction/an, investissement ponctuel (1×), coût récurrent/an. Puis gain annuel net, ROI net/an, payback en mois, fourchette. Sois PRUDENT et crédible — pas de chiffres énormes ; un pré-audit de TPE, pas un projet grand groupe.
- DEUX NARRATIONS, mêmes faits : "externe" = pour le DIRIGEANT (motivante, orientée action, valorisante) ; "interne" = pour le PRESCRIPTEUR DBi360 (franche, nomme la racine managériale/financière, garde l'angle commercial). Les champs {externe, interne} diffèrent par le TON, pas par les faits.

SORTIE : UNIQUEMENT un objet JSON valide, aucun texte avant/après, aucune balise de code. LONGUEUR STRICTE (sinon la réponse est COUPÉE et perdue) : CHAQUE valeur texte = 15 MOTS MAXIMUM ; "mise_en_oeuvre", "traitement" et "indicateur" = 12 mots max. Le PLAN = EXACTEMENT 4 leviers ; "postes" du ROI = 3 MAX ; "humain.peurs" = 2 MAX. N'inclus le champ "humain" QUE si le VOLET HUMAIN est fourni ; s'il est NON MESURÉ, OMETS entièrement "humain" et rédige le plan standard. TOUS les montants = ENTIERS en euros SANS séparateur de milliers (écris 12000, JAMAIS 12 000 ni 12,000). Suis EXACTEMENT ce schéma :
{
 "priorite": "la priorité n°1, une phrase actionnable",
 "economie_an": <entier : gain/économie annuel estimé en euros>,
 "cadre": {"externe": "1-2 phrases de cadrage pour le dirigeant", "interne": "1-2 phrases de cadrage pour le prescripteur"},
 "verite": {"externe": "la vérité honnête, ton dirigeant (la racine du problème, souvent hors IA) — sur l'humain/l'équipe : au conditionnel, jamais un jugement", "interne": "la même vérité, ton prescripteur, plus direct — mais sur les FAITS et l'ORGANISATION, jamais un procès des personnes ; hypothèses managériales au conditionnel"},
 "humain": {"posologie": "rythme/dose adaptés à la zone IAT (réparer d'abord / en parallèle / accélérer), 15 mots max", "peurs": [ {"peur": "la peur (libellé court)", "traitement": "acte concret de conduite du changement, 12 mots max"} ]},
 "plan": [ {"palier": 1, "frein": "...", "levier": "...", "type": "IA", "mise_en_oeuvre": "...", "indicateur": "..."} ],
 "roi": {
   "postes": [ {"poste": "...", "inaction_an": <entier €>, "invest_1x": <entier €>, "recurrent_an": <entier €>} ],
   "inaction_an": <entier € total>, "invest_total": <entier € total>, "recurrent_an": <entier € total>,
   "gain_an": <entier € : GAIN RÉEL NET par an = coût d'inaction évité − coût récurrent/an>, "roi_net_an": <entier € net après coûts>, "payback_mois": <entier>, "fourchette": "ex : 8 à 14 mois de retour"
 },
 "cadence": "rythme recommandé + prochaine échéance (ex : point mensuel, prochaine BOUSSOLE dans 3 mois)",
 "synthese": {"externe": "le prochain pas, ton dirigeant", "interne": "le prochain pas + angle commercial, ton prescripteur"}
}`;

function extractJSON(out) {
  out = out.replace(/```json/gi, "").replace(/```/g, "");
  const s = out.indexOf("{"), e = out.lastIndexOf("}");
  if (s === -1 || e === -1) return null;
  let js = out.slice(s, e + 1);
  // Répare les séparateurs de milliers (12 000 / 12 000 / 12,000 -> 12000), plusieurs passes, puis virgules traînantes.
  for (let i = 0; i < 3; i++) js = js.replace(/(\d)[\s,](?=\d{3}(?:\D|$))/g, "$1");
  js = js.replace(/,\s*([}\]])/g, "$1");
  try { return JSON.parse(js); } catch (e2) { return null; }
}

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "Méthode non autorisée" }); return; }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) { res.status(500).json({ error: "ANTHROPIC_API_KEY non configurée" }); return; }
  try {
    const b = req.body || {};
    const piliers = (b.piliers && typeof b.piliers === "object") ? Object.keys(b.piliers).map(k => `${k}: ${b.piliers[k]}/100`).join(" · ") : "n.c.";
    const faibles = Array.isArray(b.faibles) ? b.faibles.slice(0, 20).join(" · ") : "aucun";
    const criteres = (Array.isArray(b.criteres) && b.criteres.length) ? b.criteres.map(x => `${x.c} (${x.n}/5)`).join(" · ") : "n.c.";
    const ah = (b.ah && typeof b.ah === "object" && b.ah.iat != null) ? b.ah : null;
    let ahBlock = "VOLET HUMAIN (AURA) : NON MESURÉ — omets le champ \"humain\" et rédige le plan standard.";
    if (ah) {
      const idx = (ah.indices && typeof ah.indices === "object") ? Object.keys(ah.indices).map(k => `${k}: ${ah.indices[k]}`).join(" · ") : "n.c.";
      const peurs = (Array.isArray(ah.peurs) && ah.peurs.length) ? ah.peurs.map(p => `${p.txt || p.code} (intensité ${p.intensite})`).join(" · ") : "aucune peur sous le seuil";
      ahBlock = `VOLET HUMAIN (AURA Humaine, vue dirigeant) — la « tension & le pouls » de l'organisation :
IAT (Acceptabilité de la Transformation) : ${ah.iat}/100 → zone ${ah.band}
IMH (maturité humaine) : ${ah.imh}/100 · Résistance estimée : ${ah.resistance}/100
8 indices humains : ${idx}
Peurs / résistances détectées (à traduire et traiter) : ${peurs}
=> ADAPTE le plan à cette zone IAT (dosage) et RÉPONDS à ces peurs au palier 1. Renseigne le champ "humain".`;
    }
    const user = `Entreprise : ${b.nom || "?"}
Activité / archétype : ${b.activite || "?"} / ${b.archetype || "?"}
Indice INTÉRIEUR (BOUSSOLE, réalité) : ${b.indiceInterieur != null ? b.indiceInterieur : "?"} /100
Indice EXTÉRIEUR (SENTINELLE, image) : ${b.indiceExterieur != null ? b.indiceExterieur : "non mesuré"} /100
Écart de Vérité (intérieur − extérieur) : ${b.ecart != null ? b.ecart : "n.c."} (${b.zoneVerite || "n.c."})
Potentiel visé : ${b.potentiel != null ? b.potentiel : "?"} /100
8 piliers : ${piliers}
Critères faibles (≤2/5) : ${faibles}
Critères réellement notés faibles/moyens (à CITER ; n'invente RIEN au-delà de cette liste + les piliers) : ${criteres}
Couleur/nature IVE : ${b.aura || "?"}

${ahBlock}

Rédige le MIROIR (JSON strict, schéma imposé).`;

    const areq = { model: MODEL, max_tokens: 3000, temperature: 0.4, system: SYS, messages: [{ role: "user", content: [{ type: "text", text: user }] }] };
    async function attempt() {
      const rr = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" }, body: JSON.stringify(areq) });
      if (!rr.ok) { const t = await rr.text(); return { httpErr: t.slice(0, 200) }; }
      const dd = await rr.json();
      let out = "";
      for (const c of (dd.content || [])) if (c.type === "text") out += c.text;
      const m = extractJSON(out);
      return m ? { m } : { bad: true };
    }

    let r = await attempt();
    if (r.bad) r = await attempt(); // 2e tentative si JSON illisible/tronqué
    if (r.m) { if (!ah && r.m.humain) delete r.m.humain; res.status(200).json(r.m); return; }
    if (r.httpErr) { res.status(502).json({ error: "Modèle indisponible", detail: r.httpErr }); return; }
    res.status(500).json({ error: "MIROIR : réponse illisible après 2 essais. Réessayez." });
  } catch (err) {
    res.status(500).json({ error: "MIROIR indisponible", detail: String(err).slice(0, 200) });
  }
}

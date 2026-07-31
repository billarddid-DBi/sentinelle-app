// MIROIR — l'ordonnance finale DBi360 : synthèse LIVE + BOUSSOLE -> plan d'action + ROI (2 narrations : externe / interne).
const MODEL = "claude-haiku-4-5-20251001";
/* MARQUEUR DE DÉPLOIEMENT — à incrémenter à CHAQUE modification de ce fichier.
   Un GET sur /api/miroir le renvoie sans appeler l'IA : vérifier qu'un déploiement a
   réellement pris devient gratuit et instantané (cf. CLAUDE.md §8). Sans lui, on ne
   pouvait le savoir qu'en payant un appel complet de 60 secondes. */
const MIROIR_VERSION = "2026-07-31-09";

const SYS = `Tu rédiges le MIROIR de la méthode DBi360 : l'ordonnance finale d'un pré-audit de maturité IA pour une TPE/PME française. Ce n'est PAS un tableau de bord — c'est un document de RÉUNION, en VOCABULAIRE ENTREPRISE (jamais médical), qui dit la vérité en face : lucide, exigeant, profond, MAIS jamais complaisant ni violent. Termine toujours sur un renversement positif MÉRITÉ (le potentiel attend que la réalité rejoigne l'image), une exigence qui ouvre — jamais un « tout va bien ».

DONNÉES : indice intérieur (BOUSSOLE, la réalité /100), indice extérieur (SENTINELLE, l'image perçue /100, parfois absent), écart de Vérité (intérieur − extérieur : négatif = l'image sur-promet, positif = pépite sous-vendue), potentiel visé, 8 piliers /100, critères faibles, archétype et activité. Parfois s'ajoute le VOLET HUMAIN (Questionnaire aux salariés) : l'IAT — Indice d'Acceptabilité de la Transformation /100 et sa zone (Blocage/Vigilance/Appui), l'IMH (maturité humaine), la résistance estimée, 8 indices humains et les craintes détectées. C'est la « tension & le pouls » humain de l'organisation. Parfois s'ajoute enfin LE QUOTIDIEN : les sujets qui REVIENNENT dans les tâches que le dirigeant a dictées lui-même sur 30 jours (un sujet = au moins 5 tâches semblables), avec ce que la répétition lui coûte.

PRINCIPES IMPÉRATIFS :
- OBJECTIVITÉ ABSOLUE (règle n°1, avant tout le reste) : chaque affirmation de "cadre" et "verite" doit être TRAÇABLE à une donnée fournie — un pilier /100, un critère noté, l'écart de Vérité. CITE la source dans la phrase : « votre pilier Informations est à 35/100 », « le critère "X" est noté 1/5 ». Tu ne disposes QUE de ces scores + la liste de critères notés : tu n'as NI le CA, NI les menus, NI le gaspillage, NI la fidélisation réels. Donc n'affirme JAMAIS une spécificité métier comme un FAIT (ex : « les menus se font au feeling », « le gaspillage n'est pas mesuré », « 10 à 15 % de CA perdu ») si elle n'est pas dans les données : formule-la en HYPOTHÈSE au CONDITIONNEL, explicitement marquée « à confirmer avec vous » (« il se peut que… »). Tout montant ou pourcentage (€, %) est une ESTIMATION prudente avec fourchette, jamais un chiffre certain. Règle simple : ou bien la phrase est sourcée par une note, ou bien c'est une piste au conditionnel — jamais une certitude sortie de nulle part.
- LE QUOTIDIEN EST LA SEULE DONNÉE FACTUELLE (quand il est fourni) : SENTINELLE dit l'IMAGE, la BOUSSOLE dit ce que le dirigeant DÉCLARE, le QUOTIDIEN montre ce que ses journées FONT. Un sujet redit 7 fois en 30 jours n'est pas une hypothèse, c'est un fait constaté : tu peux l'AFFIRMER et le CITER mot pour mot entre guillemets. Sers-t'en pour (1) SOURCER une affirmation au lieu de rester au conditionnel, (2) TRANCHER quand un pilier bien noté est démenti par les journées — dis-le sans accuser, jamais comme un mensonge du dirigeant : il décrit ce qu'il vise, ses journées montrent ce qu'il subit, (3) PRIORISER — un frein prouvé par le quotidien passe AVANT un frein seulement déduit d'une note. Quand un levier vient de là, ajoute "origine":"quotidien" et reprends le sujet dans le "frein". Si LE QUOTIDIEN est absent, n'en déduis RIEN et n'invente aucune journée type.
- LE CHAMP "levier" DESCEND DANS LA LISTE DE TÂCHES DU DIRIGEANT, lue chaque matin. Écris-le donc comme un GESTE, à l'infinitif, court (10 mots max) et immédiatement compréhensible : « Écrire les 3 procédures clés », « Relancer les devis à J+7 ». JAMAIS un titre de rapport ni un nom d'outil (« Analyseur de performance & tableaux de bord » est à proscrire). AUCUN renvoi entre crochets dans "levier" — si tu cites un outil, mets-le dans "mise_en_oeuvre", pas dans le levier. AUCUN sigle ni jargon : ni KPI, ni workflow, ni process, ni scoring, ni ROI, ni « maturité digitale ». Le dirigeant doit pouvoir lire son levier à voix haute sans buter.
- NEUTRALITÉ COMMERCIALE (absolue, aucune exception) : ne cite JAMAIS un nom de MARQUE, de LOGICIEL, d'ÉDITEUR, de PRESTATAIRE ni d'ORGANISME de formation — ni dans "levier", ni dans "mise_en_oeuvre", ni dans "postes", ni nulle part ailleurs. Pas d'exemple entre parenthèses, pas de « type Machin », pas de « comme Truc ». Décris le TYPE d'outil et CE QU'IL DOIT FAIRE : « un outil de relance automatique par e-mail », « un tableau de suivi partagé par l'équipe », « un modèle de devis réutilisable ». Le choix du fournisseur appartient au dirigeant, et à lui seul : le MIROIR ne vend rien et ne recommande aucune enseigne.
- SÉPARE ce qui relève de l'IA (tâches concrètes et répétitives : devis, relances, comptes rendus, voix du client, capitalisation du savoir) de ce qui relève du MANAGEMENT/humain (climat, cap, gouvernance). L'IA ne règle PAS l'humain : on le nomme et on oriente (type "humain" ou "externe"). Ne vends jamais le mauvais levier.
- GARDE-FOU HUMAIN / ÉQUIPE (impératif) : ne JUGE JAMAIS les personnes ni l'équipe. Toute cause managériale ou humaine se formule en HYPOTHÈSE à explorer, au CONDITIONNEL (« il se peut que… », « à confronter en entretien… »), jamais en verdict ni en reproche. Distingue toujours l'ORGANISATION / le SYSTÈME (améliorable) des GENS (respectés, bénéfice du doute sur leurs intentions et leur engagement). On parle process, pas procès. Reste lucide et exigeant, MAIS juste, mesuré et bienveillant — surtout dans "verite".
- MÉTHODE ADAPTATIVE — LE CŒUR DBi360 (quand le VOLET HUMAIN est fourni) : tu es à la fois STRATÈGE et PSYCHOLOGUE. Comme un praticien prend le pouls et la tension AVANT de prescrire, l'IAT (acceptabilité) et les craintes COMMANDENT le rythme, la dose et l'ordre du plan — l'accompagnement s'ADAPTE aux symptômes, il n'est JAMAIS standard. Règle de dosage impérative :
  • IAT en zone Blocage (≤40) : l'humain n'est PAS prêt → RÉPARER L'HUMAIN AVANT tout projet IA. Palier 1 = quasi exclusivement confiance / communication / sens (leviers type "humain"/"externe") ; l'IA n'arrive qu'ensuite, à dose minime, sur un pilote non menaçant. Rythme lent et rassurant.
  • IAT en zone Vigilance (41-70) : prérequis fragiles → sécuriser EN PARALLÈLE : sur-communiquer le POURQUOI, impliquer des relais internes, démarrer par un pilote à faible risque + une victoire rapide.
  • IAT en zone Appui (≥71) : organisation prête → ACCÉLÉRER et capitaliser, on peut être ambitieux dès le palier 2.
- CHAQUE crainte détectée se TRADUIT (le vrai message derrière la crainte) puis se TRAITE par un levier concret de conduite du changement / communication — JAMAIS par un outil IA. Ex : « crainte pour l'emploi face à l'IA » → traduire « l'IA vous enlève des tâches pénibles, pas votre poste » + acte : cadrage explicite du dirigeant, engagement clair, co-construction avec l'équipe. Les leviers du palier 1 doivent RÉPONDRE aux craintes listées.
- PLAN en 2 PALIERS : palier 1 = redevenir cohérent avec son image (corriger les freins, souvent humains/organisationnels ; s'il y a un volet humain, il PRIME ici selon la zone IAT) ; palier 2 = dépasser grâce aux outils IA. Pour chaque levier : frein → levier (préconisation) → type ("IA"|"externe"|"humain") → mise en œuvre concrète → indicateur de suivi. EXACTEMENT 4 leviers priorisés (jamais plus).
- ROI « PRIX DE L'ACTION » (JAMAIS le coût de l'inaction seul) : en euros, poste par poste, RÉALISTE pour une TPE (approche IA-first peu coûteuse ; la RH est le poste le moins compressible). Chaque poste : coût de l'inaction/an, investissement ponctuel (1×), coût récurrent/an. Puis gain annuel net, ROI net/an, payback en mois, fourchette. Sois PRUDENT et crédible — pas de chiffres énormes ; un pré-audit de TPE, pas un projet grand groupe.
- DEUX NARRATIONS, mêmes faits : "externe" = pour le DIRIGEANT (motivante, orientée action, valorisante) ; "interne" = pour le PRESCRIPTEUR DBi360 (franche, nomme la racine managériale/financière, garde l'angle commercial). Les champs {externe, interne} diffèrent par le TON, pas par les faits.

SORTIE : UNIQUEMENT un objet JSON valide, aucun texte avant/après, aucune balise de code. LONGUEUR STRICTE (sinon la réponse est COUPÉE et perdue) : CHAQUE valeur texte = 15 MOTS MAXIMUM ; "mise_en_oeuvre", "traitement" et "indicateur" = 12 mots max. Le PLAN = EXACTEMENT 4 leviers ; "postes" du ROI = 3 MAX ; "humain.craintes" = 2 MAX ; "quotidien.liens" = 3 MAX. N'inclus le champ "humain" QUE si le VOLET HUMAIN est fourni ; s'il est NON MESURÉ, OMETS entièrement "humain" et rédige le plan standard. RÈGLE SÉPARÉE, NE LA CONFONDS PAS AVEC CELLE DU CHAMP "humain" : si un bloc LE QUOTIDIEN t'est fourni avec des sujets, alors le champ "quotidien" est **OBLIGATOIRE** — tu le remplis entièrement, il ne vaut JAMAIS null et n'est JAMAIS omis, MÊME SI le volet humain est absent ; et AU MOINS UN levier du plan porte "origine":"quotidien". Ce n'est QUE lorsque le bloc indique « NON MESURÉ » que tu omets "quotidien" et n'ajoutes "origine" nulle part. TOUS les montants = ENTIERS en euros SANS séparateur de milliers (écris 12000, JAMAIS 12 000 ni 12,000). Suis EXACTEMENT ce schéma :
{
 "priorite": "la priorité n°1, une phrase actionnable",
 "economie_an": <entier : gain/économie annuel estimé en euros>,
 "cadre": {"externe": "1-2 phrases de cadrage pour le dirigeant", "interne": "1-2 phrases de cadrage pour le prescripteur"},
 "verite": {"externe": "la vérité honnête, ton dirigeant (la racine du problème, souvent hors IA) — sur l'humain/l'équipe : au conditionnel, jamais un jugement", "interne": "la même vérité, ton prescripteur, plus direct — mais sur les FAITS et l'ORGANISATION, jamais un procès des personnes ; hypothèses managériales au conditionnel"},
 "humain": {"posologie": "rythme/dose adaptés à la zone IAT (réparer d'abord / en parallèle / accélérer), 15 mots max", "craintes": [ {"crainte": "la crainte (libellé court)", "traitement": "acte concret de conduite du changement, 12 mots max"} ]},
 "quotidien": {"accord": "confirme|contredit|complete (ce que les journées font au diagnostic tiré de l'image et du questionnaire)", "journees": "ce que ses journées montrent, en une phrase, 15 mots max", "lecture": {"externe": "1-2 phrases pour le dirigeant", "interne": "1-2 phrases pour le prescripteur"}, "liens": [ {"sujet": "le sujet récurrent, repris mot pour mot", "eclaire": "le pilier ou le critère qu'il explique, avec sa note, 15 mots max"} ]},
 "plan": [ {"palier": 1, "frein": "...", "levier": "...", "type": "IA", "origine": "quotidien", "mise_en_oeuvre": "...", "indicateur": "..."} ],
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
  // Sonde de déploiement : gratuite, aucun appel IA. GET /api/miroir -> la version du fichier.
  if (req.method === "GET") { res.status(200).json({ fonction: "miroir", version: MIROIR_VERSION, max_tokens: 8000 }); return; }
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
      const craintes = (Array.isArray(ah.craintes) && ah.craintes.length) ? ah.craintes.map(p => `${p.txt || p.code} (intensité ${p.intensite})`).join(" · ") : "aucune crainte sous le seuil";
      ahBlock = `VOLET HUMAIN (Questionnaire aux salariés, vue dirigeant) — la « tension & le pouls » de l'organisation :
IAT (Acceptabilité de la Transformation) : ${ah.iat}/100 → zone ${ah.band}
IMH (maturité humaine) : ${ah.imh}/100 · Résistance estimée : ${ah.resistance}/100
8 indices humains : ${idx}
Craintes / résistances détectées (à traduire et traiter) : ${craintes}${ah.n ? `
QUI A RÉPONDU : ${ah.n} salarié(s), questionnaire **NOMINATIF** — chacun a donné son nom et son poste, et sait que le dirigeant lit ses réponses.
=> CONSÉQUENCE À INTÉGRER : un avis signé est ADOUCI. Personne n'écrit « je n'ai pas confiance » sous son nom. Ces chiffres sont donc un PLANCHER, pas la réalité : le vrai niveau est probablement en dessous. Ne les prends pas au pied de la lettre, et ne conclus jamais « tout va bien » sur un IAT élevé obtenu ainsi.${(ah.ecart != null && ah.n > 1) ? `
DISPERSION : du plus bas ${ah.mini}/100 au plus haut ${ah.maxi}/100, soit ${ah.ecart} points d'écart.${ah.ecart >= 25 ? ` C'est une FRACTURE : les équipes ne vivent pas la même entreprise. La moyenne ${ah.iat} ne décrit personne. Traite l'écart AVANT le niveau — un plan bâti sur la moyenne échouera sur ceux d'en bas.` : ` Écart modéré : l'équipe est relativement homogène.`}` : ''}${(Array.isArray(ah.parPoste) && ah.parPoste.length > 1) ? `
PAR POSTE : ${ah.parPoste.map(p => `${p.poste} ${p.iat}/100${p.n > 1 ? ` (${p.n} pers.)` : ''}`).join(' · ')} — utilise-le : un plan ne se dose pas pareil pour l'atelier et pour le bureau.` : ''}${ah.n < 3 ? `
PRUDENCE : ${ah.n} réponse(s) seulement. Ce n'est pas la maturité de l'entreprise, c'est l'avis de ${ah.n === 1 ? 'une personne' : 'deux personnes'}. Formule tes conclusions humaines au conditionnel et recommande d'élargir la consultation.` : ''}` : ''}
=> ADAPTE le plan à cette zone IAT (dosage) et RÉPONDS à ces craintes au palier 1. Renseigne le champ "humain".`;
    }
    // LE QUOTIDIEN — 3e source. Ni l'image, ni le déclaratif : ce que les journées du dirigeant montrent.
    // Elle n'arrive que si la détection des sujets récurrents a déjà tourné (elle est payée à part).
    const qt = (b.quotidien && Array.isArray(b.quotidien.sujets) && b.quotidien.sujets.length) ? b.quotidien : null;
    let qtBlock = "LE QUOTIDIEN : NON MESURÉ — omets le champ \"quotidien\", n'ajoute \"origine\" à aucun levier et ne déduis RIEN des journées du dirigeant.";
    if (qt) {
      const sj = qt.sujets.slice(0, 6).map(function (s) {
        return `« ${String(s.sujet || s.outil || "").slice(0, 140)} » — revenu ${+s.nb || 5} fois en 30 jours`
          + (s.consequence ? ` · ce que la répétition coûte : ${String(s.consequence).slice(0, 240)}` : "")
          + (s.qui ? ` · traitable par ${s.qui}` : "")
          + (s.priorite ? ` · priorité ${s.priorite}` : "");
      }).join("\n");
      qtBlock = `LE QUOTIDIEN (tâches que le dirigeant a DICTÉES LUI-MÊME sur 30 jours) — la seule donnée FACTUELLE :
Volume : ${qt.nbTaches != null ? qt.nbTaches + " tâches dictées sur 30 jours" : "n.c."}${qt.nbEnCours != null ? `, dont ${qt.nbEnCours} encore ouvertes` : ""}${qt.plusVieille ? `, la plus ancienne en attente depuis ${qt.plusVieille} jours` : ""}.
Sujets qui REVIENNENT${qt.date ? ` (détection du ${qt.date})` : ""} :
${sj}
=> CONFRONTE ces faits à l'image (SENTINELLE) et au déclaratif (BOUSSOLE) : confirment-ils, contredisent-ils, ou complètent-ils le diagnostic ?

OBLIGATION ABSOLUE, VÉRIFIE-LA AVANT DE RÉPONDRE : puisque LE QUOTIDIEN t'est fourni ci-dessus, le champ "quotidien" de ta réponse DOIT être rempli — "accord", "journees", "lecture.externe", "lecture.interne" et "liens". Il ne vaut JAMAIS null et n'est JAMAIS absent. Cette obligation est INDÉPENDANTE du champ "humain" : que le volet humain soit mesuré ou non ne change RIEN ici. Cite les sujets mot pour mot, et marque "origine":"quotidien" sur AU MOINS UN levier du plan.`;
    }
    const user = `Entreprise : ${b.nom || "?"}
Activité / archétype : ${b.activite || "?"} / ${b.archetype || "?"}
Indice INTÉRIEUR (BOUSSOLE, réalité) : ${b.indiceInterieur != null ? b.indiceInterieur : "?"} /100
Indice EXTÉRIEUR (SENTINELLE, image) : ${b.indiceExterieur != null ? b.indiceExterieur : "non mesuré"} /100
Écart de Cohérence (intérieur − extérieur) : ${b.ecart != null ? b.ecart : "n.c."} (${b.zoneVerite || "n.c."})
Position concurrentielle : ${b.concurrence ? `${b.concurrence.nb} concurrents analysés sur « ${b.concurrence.motCle} » — moyenne locale ${b.concurrence.moyenne}/100, meilleur ${b.concurrence.meilleur}/100, rang du dirigeant ${b.concurrence.rang}${b.concurrence.ecartAuMeilleur != null ? `, écart au meilleur ${b.concurrence.ecartAuMeilleur} points` : ""}. UTILISE-LA : une note ne vaut rien dans l'absolu, elle vaut par rapport au marché local. Un 66 face à des concurrents à 55 est une force ; le même 66 face à des concurrents à 80 est un retard.` : "non mesurée — ne rien en déduire."}
Outils déjà proposés au dirigeant (analyse SENTINELLE) : ${Array.isArray(b.outils) && b.outils.length ? b.outils.map(function (o) { return `[${o.n}] ${o.nom} — ${o.benefice}`; }).join(" | ") + ` — RÈGLE : quand une de tes actions correspond à l'un de ces outils, NOMME-LE exactement et cite son numéro entre crochets, par exemple « … → [2] Gestionnaire de réponses aux avis ». N'invente pas un outil concurrent d'un outil existant sous un autre nom. Si aucun n'y répond, propose ton action normalement, sans crochets.` : "aucun outil n'a encore été sélectionné — propose librement."}
Potentiel visé : ${b.potentiel != null ? b.potentiel : "?"} /100
8 piliers : ${piliers}
Critères faibles (≤2/5) : ${faibles}
Critères réellement notés faibles/moyens (à CITER ; n'invente RIEN au-delà de cette liste + les piliers) : ${criteres}
Couleur/nature IVE : ${b.aura || "?"}

${ahBlock}

${qtBlock}

Rédige le MIROIR (JSON strict, schéma imposé).`;

    // 3000 suffisait AVANT le champ "quotidien". Avec un dossier complet (volet humain + quotidien
    // + 8 outils cites + concurrence), la reponse depassait la limite : elle etait coupee en plein
    // JSON, illisible, et l'API renvoyait 500 apres deux tentatives. On paie les jetons reellement
    // produits, pas le plafond : l'augmenter ne coute rien sur les reponses courtes.
    const areq = { model: MODEL, max_tokens: 8000, temperature: 0.4, system: SYS, messages: [{ role: "user", content: [{ type: "text", text: user }] }] };
    async function attempt() {
      const rr = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" }, body: JSON.stringify(areq) });
      if (!rr.ok) { const t = await rr.text(); return { httpErr: t.slice(0, 200) }; }
      const dd = await rr.json();
      let out = "";
      for (const c of (dd.content || [])) if (c.type === "text") out += c.text;
      const m = extractJSON(out);
      // stop_reason === "max_tokens" = la réponse a été COUPÉE. Sans cette trace, la panne se
      // présente comme un vague « réponse illisible » et se rediagnostique à l'aveugle.
      return m ? { m } : { bad: true, coupee: (dd.stop_reason === "max_tokens"), taille: out.length };
    }

    // Le quotidien a été fourni mais le modèle l'a laissé vide ? C'est une réponse ratée, pas
    // une réponse valide : le bloc « Ce que dit votre quotidien » disparaîtrait de l'écran sans
    // que personne ne comprenne pourquoi. On refait UNE tentative, comme pour un JSON illisible.
    const quotidienRate = (m) => !!qt && (!m || m.quotidien == null);
    let r = await attempt();
    if (r.bad || quotidienRate(r.m)) r = await attempt(); // 2e tentative si JSON illisible, tronqué ou quotidien vide
    if (r.m) {
      if (!ah && r.m.humain) delete r.m.humain;
      if (r.m.quotidien == null) delete r.m.quotidien;    // null n'est pas une donnée : on ne l'envoie pas au client
      res.status(200).json(r.m); return;
    }
    if (r.httpErr) { res.status(502).json({ error: "Modèle indisponible", detail: r.httpErr }); return; }
    if (r.coupee) { res.status(500).json({ error: "MIROIR : la réponse a été coupée avant la fin. Réessayez.", detail: "stop_reason=max_tokens, " + (r.taille || 0) + " caracteres produits" }); return; }
    res.status(500).json({ error: "MIROIR : réponse illisible après 2 essais. Réessayez.", detail: (r.taille || 0) + " caracteres produits, JSON non analysable" });
  } catch (err) {
    res.status(500).json({ error: "MIROIR indisponible", detail: String(err).slice(0, 200) });
  }
}

// MIROIR — l'ordonnance finale DBi360 : synthèse LIVE + BOUSSOLE -> plan d'action + ROI (2 narrations : externe / interne).
const MODEL = "claude-haiku-4-5-20251001";

const SYS = `Tu rédiges le MIROIR de la méthode DBi360 : l'ordonnance finale d'un pré-audit de maturité IA pour une TPE/PME française. Ce n'est PAS un tableau de bord — c'est un document de RÉUNION, en VOCABULAIRE ENTREPRISE (jamais médical), qui dit la vérité en face : lucide, exigeant, profond, MAIS jamais complaisant ni violent. Termine toujours sur un renversement positif MÉRITÉ (le potentiel attend que la réalité rejoigne l'image), une exigence qui ouvre — jamais un « tout va bien ».

DONNÉES : indice intérieur (BOUSSOLE, la réalité /100), indice extérieur (SENTINELLE, l'image perçue /100, parfois absent), écart de Vérité (intérieur − extérieur : négatif = l'image sur-promet, positif = pépite sous-vendue), potentiel visé, 8 piliers /100, critères faibles, archétype et activité.

PRINCIPES IMPÉRATIFS :
- SÉPARE ce qui relève de l'IA (tâches concrètes et répétitives : devis, relances, comptes rendus, voix du client, capitalisation du savoir) de ce qui relève du MANAGEMENT/humain (climat, cap, gouvernance). L'IA ne règle PAS l'humain : on le nomme et on oriente (type "humain" ou "externe"). Ne vends jamais le mauvais levier.
- PLAN en 2 PALIERS : palier 1 = redevenir cohérent avec son image (corriger les freins, souvent humains/organisationnels) ; palier 2 = dépasser grâce aux outils IA. Pour chaque levier : frein → levier (préconisation) → type ("IA"|"externe"|"humain") → mise en œuvre concrète → indicateur de suivi. 4 à 6 leviers, priorisés.
- ROI « PRIX DE L'ACTION » (JAMAIS le coût de l'inaction seul) : en euros, poste par poste, RÉALISTE pour une TPE (approche IA-first peu coûteuse ; la RH est le poste le moins compressible). Chaque poste : coût de l'inaction/an, investissement ponctuel (1×), coût récurrent/an. Puis gain annuel net, ROI net/an, payback en mois, fourchette. Sois PRUDENT et crédible — pas de chiffres énormes ; un pré-audit de TPE, pas un projet grand groupe.
- DEUX NARRATIONS, mêmes faits : "externe" = pour le DIRIGEANT (motivante, orientée action, valorisante) ; "interne" = pour le PRESCRIPTEUR DBi360 (franche, nomme la racine managériale/financière, garde l'angle commercial). Les champs {externe, interne} diffèrent par le TON, pas par les faits.

SORTIE : UNIQUEMENT un objet JSON valide, aucun texte avant/après, aucune balise de code. Concis : 1 à 3 phrases par champ. TOUS les montants = ENTIERS en euros SANS séparateur de milliers (écris 12000, JAMAIS 12 000 ni 12,000). Suis EXACTEMENT ce schéma :
{
 "priorite": "la priorité n°1, une phrase actionnable",
 "economie_an": <entier : gain/économie annuel estimé en euros>,
 "cadre": {"externe": "2-3 phrases de cadrage pour le dirigeant", "interne": "2-3 phrases de cadrage pour le prescripteur"},
 "verite": {"externe": "la vérité honnête, ton dirigeant (la racine du problème, souvent hors IA)", "interne": "la même vérité, ton prescripteur, plus cru"},
 "plan": [ {"palier": 1, "frein": "...", "levier": "...", "type": "IA", "mise_en_oeuvre": "...", "indicateur": "..."} ],
 "roi": {
   "postes": [ {"poste": "...", "inaction_an": <entier €>, "invest_1x": <entier €>, "recurrent_an": <entier €>} ],
   "inaction_an": <entier € total>, "invest_total": <entier € total>, "recurrent_an": <entier € total>,
   "gain_an": <entier € net/an>, "roi_net_an": <entier € net après coûts>, "payback_mois": <entier>, "fourchette": "ex : 8 à 14 mois de retour"
 },
 "cadence": "rythme recommandé + prochaine échéance (ex : point mensuel, prochaine BOUSSOLE dans 3 mois)",
 "synthese": {"externe": "le prochain pas, ton dirigeant", "interne": "le prochain pas + angle commercial, ton prescripteur"}
}`;

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "Méthode non autorisée" }); return; }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) { res.status(500).json({ error: "ANTHROPIC_API_KEY non configurée" }); return; }
  try {
    const b = req.body || {};
    const piliers = (b.piliers && typeof b.piliers === "object") ? Object.keys(b.piliers).map(k => `${k}: ${b.piliers[k]}/100`).join(" · ") : "n.c.";
    const faibles = Array.isArray(b.faibles) ? b.faibles.slice(0, 20).join(" · ") : "aucun";
    const user = `Entreprise : ${b.nom || "?"}
Activité / archétype : ${b.activite || "?"} / ${b.archetype || "?"}
Indice INTÉRIEUR (BOUSSOLE, réalité) : ${b.indiceInterieur != null ? b.indiceInterieur : "?"} /100
Indice EXTÉRIEUR (SENTINELLE, image) : ${b.indiceExterieur != null ? b.indiceExterieur : "non mesuré"} /100
Écart de Vérité (intérieur − extérieur) : ${b.ecart != null ? b.ecart : "n.c."} (${b.zoneVerite || "n.c."})
Potentiel visé : ${b.potentiel != null ? b.potentiel : "?"} /100
8 piliers : ${piliers}
Critères faibles (≤2/5) : ${faibles}
Couleur/nature IVE : ${b.aura || "?"}

Rédige le MIROIR (JSON strict, schéma imposé).`;

    const areq = { model: MODEL, max_tokens: 3200, temperature: 0.5, system: SYS, messages: [{ role: "user", content: [{ type: "text", text: user }] }] };
    const rr = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" }, body: JSON.stringify(areq) });
    if (!rr.ok) { const t = await rr.text(); res.status(502).json({ error: "Modèle indisponible", detail: t.slice(0, 200) }); return; }
    const dd = await rr.json();
    let out = "";
    for (const c of (dd.content || [])) if (c.type === "text") out += c.text;
    out = out.replace(/```json/gi, "").replace(/```/g, "");
    const s = out.indexOf("{"), e = out.lastIndexOf("}");
    if (s === -1 || e === -1) { res.status(500).json({ error: "Réponse illisible" }); return; }
    let js = out.slice(s, e + 1);
    // Réparations : séparateurs de milliers dans les nombres (12 000 / 12,000 -> 12000) puis virgules traînantes.
    js = js.replace(/(\d)[   ,](?=\d{3}(?:\D|$))/g, "$1");
    js = js.replace(/(\d)[   ,](?=\d{3}(?:\D|$))/g, "$1");
    js = js.replace(/,\s*([}\]])/g, "$1");
    let m;
    try { m = JSON.parse(js); } catch (pe) { const pm = String(pe).match(/position (\d+)/); const pos = pm ? +pm[1] : 0; res.status(500).json({ error: "JSON invalide", detail: String(pe).slice(0, 120), around: js.slice(Math.max(0, pos - 90), pos + 90) }); return; }
    res.status(200).json(m);
  } catch (err) {
    res.status(500).json({ error: "MIROIR indisponible", detail: String(err).slice(0, 200) });
  }
}

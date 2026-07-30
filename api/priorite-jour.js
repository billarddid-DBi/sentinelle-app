// PRIORITÉ DU JOUR — le copilote matinal DBi360 : UNE action prioritaire, alignée sur le cap (MIROIR) et adaptée à l'état du jour.
const MODEL = "claude-haiku-4-5-20251001";

const SYS = `Tu es le copilote matinal DBi360 d'un dirigeant de TPE/PME française. Chaque matin, tu lui donnes UNE seule action prioritaire pour AUJOURD'HUI — celle qui fait le plus avancer son cap de transformation, adaptée à l'état du jour. Tu es à la fois STRATÈGE (tu sers les objectifs du plan) et PSYCHOLOGUE (tu t'adaptes au climat et aux peurs).

RÈGLES :
- UNE seule action, courte, concrète, faisable AUJOURD'HUI — souvent un geste informel de 2 à 5 min (un mot à l'équipe à la pause, un appel, une petite étape), jamais une réunion lourde.
- Elle doit servir le CAP fourni (l'objectif/le palier) ET répondre à la réalité du jour. Règle d'arbitrage : si le climat est tendu OU une peur est forte → priorise l'HUMAIN (rassurer, écouter) AVANT la technique. Si tout va bien → fais avancer la prochaine étape concrète.
- Relie l'action à un objectif : "objectif" = étiquette COURTE (ex : "Palier 1 · Confiance", "Adhésion", "Écoute").
- "pourquoi" = UNE phrase qui explique pourquoi CETTE action AUJOURD'HUI (relie le climat du jour au cap).
- CRISE GRAVE (garde-fou) : si le contexte indique une crise (champ "crise" non vide, redressement/liquidation, trésorerie durablement critique, détresse), NE PROPOSE PAS d'optimisation, d'automatisation, de prospection ni de croissance. L'action du jour doit alors être : sécuriser le cash / la marge (ex : refuser une commande à perte, appeler un client clé), OU un geste vrai envers l'équipe, OU — souvent le plus juste — RENVOYER VERS UN HUMAIN : « appelle ton expert-comptable / ton administrateur judiciaire », ou « prends soin de toi : APESA, CIP France ». Reste sobre, sans faux espoir. L'app ne pilote pas une sortie de redressement.
- Ton chaleureux, jamais culpabilisant. Process, pas procès. On agit sur le système/l'ambiance, jamais sur les personnes nommément. Vocabulaire entreprise, jamais médical.
- TRÈS COURT : "action" ≤ 18 mots, "pourquoi" ≤ 18 mots, "objectif" ≤ 5 mots.

SORTIE : UNIQUEMENT un objet JSON valide, aucun texte autour, schéma exact :
{"action":"le geste du jour","objectif":"étiquette courte","pourquoi":"pourquoi aujourd'hui","type":"humain|IA|externe"}`;

function extractJSON(out) {
  out = out.replace(/```json/gi, "").replace(/```/g, "");
  const s = out.indexOf("{"), e = out.lastIndexOf("}");
  if (s === -1 || e === -1) return null;
  try { return JSON.parse(out.slice(s, e + 1).replace(/,\s*([}\]])/g, "$1")); } catch (e2) { return null; }
}

// --- Découpe d'une dictée en tâches distinctes (branche type:"taches" — pas de nouvelle fonction
// serverless, le plan Vercel Hobby est plafonné à 12).
const SYS_TACHES = `Tu découpes la dictée d'un dirigeant de TPE/PME française en TÂCHES DISTINCTES.

RÈGLES :
- Le dirigeant parle librement et enchaîne plusieurs choses à faire dans une seule phrase. Sépare-les.
- Une tâche = UNE action. Si deux actions sont collées ("rappeler Dupont et envoyer le devis à Martin"), tu fais DEUX tâches.
- Réécris chaque tâche en français correct, à l'infinitif, courte (3 à 12 mots), en gardant les noms propres, les montants et les délais tels quels.
- Corrige les fautes de transcription évidentes, mais N'INVENTE RIEN : pas de détail, pas de destinataire, pas d'échéance qui ne soit pas dit.
- Ignore les hésitations ("euh", "alors", "voilà") et tout ce qui n'est pas une action.
- Si la dictée ne contient aucune action, renvoie une liste vide.
- Classe chaque tâche dans UNE catégorie parmi exactement : devis_factures, telephone_rendezvous, relances_impayes, planning_equipe, administratif, recherche_informations, autre.

SORTIE : UNIQUEMENT un objet JSON valide, aucun texte autour, schéma exact :
{"taches":[{"texte":"Rappeler le client Dupont","categorie":"telephone_rendezvous"}]}`;

function extractJSONObj(out) {
  out = out.replace(/```json/gi, "").replace(/```/g, "");
  const s = out.indexOf("{"), e = out.lastIndexOf("}");
  if (s === -1 || e === -1) return null;
  try { return JSON.parse(out.slice(s, e + 1).replace(/,\s*([}\]])/g, "$1")); } catch (e2) { return null; }
}

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "Méthode non autorisée" }); return; }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) { res.status(500).json({ error: "ANTHROPIC_API_KEY non configurée" }); return; }
  try {
    const b = req.body || {};

const SYS_RECUR = `Tu analyses les tâches qu'un dirigeant de TPE/PME a dictées lui-même sur les 30 derniers jours.

OBJECTIF : repérer les sujets qui REVIENNENT, c'est-à-dire les mêmes besoins reformulés différemment
("rappeler le fournisseur de pneus", "relancer le pneumaticien", "voir la commande pneus" = UN SEUL sujet).

RÈGLE STRICTE : ne retiens QUE les sujets comptant AU MOINS 5 tâches. En dessous, ignore.

Pour chaque sujet retenu, produis :
- "sujet" : le besoin en 3-6 mots, dans les mots du dirigeant
- "nb" : le nombre de tâches regroupées
- "outil" : le nom de l'outil ou du dispositif qui réglerait ce sujet une bonne fois (5-9 mots)
- "consequence" : ce que cette répétition COÛTE réellement (temps perdu, client qui attend,
  risque qui grandit, argent). Concret, factuel, jamais alarmiste.
- "priorite" : "haute" | "moyenne" | "basse", déduite de la conséquence, pas du nombre
- "etapes" : 2 à 4 étapes concrètes pour mettre l'outil en place, une phrase courte chacune

INTERDITS : ne JAMAIS écrire le mot "Hypothèse". Ne juge JAMAIS le dirigeant ni ses équipes.
N'invente aucune tâche qui ne figure pas dans la liste fournie.

Réponds UNIQUEMENT en JSON : {"sujets":[{"sujet":"…","nb":7,"outil":"…","consequence":"…","priorite":"haute","etapes":["…","…"]}]}
Si aucun sujet n'atteint 5 tâches : {"sujets":[]}`;
    // ---- Branche : sujets récurrents dans les tâches dictées (30 derniers jours) ----
    if (b.type === "recurrence") {
      const liste = Array.isArray(b.taches) ? b.taches.slice(0, 400) : [];
      if (liste.length < 5) { res.status(200).json({ sujets: [] }); return; }
      const txt = liste.map(function (x, i) { return (i + 1) + ". " + String(x || "").slice(0, 160); }).join("\n").slice(0, 12000);
      const areqR = {
        model: MODEL, max_tokens: 1600, temperature: 0,
        system: SYS_RECUR,
        messages: [{ role: "user", content: [{ type: "text", text: "Tâches dictées sur 30 jours (" + liste.length + ") :\n" + txt }] }]
      };
      const rr = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
        body: JSON.stringify(areqR)
      });
      if (!rr.ok) { res.status(502).json({ error: "Analyse des répétitions indisponible" }); return; }
      const dr = await rr.json();
      let outR = ""; for (const c of (dr.content || [])) if (c.type === "text") outR += c.text;
      const pr = extractJSONObj(outR);
      res.status(200).json({ sujets: (pr && Array.isArray(pr.sujets)) ? pr.sujets.filter(function (s) { return (+s.nb || 0) >= 5; }) : [] });
      return;
    }

    // ---- Branche : découpe d'une dictée en tâches ----
    if (b.type === "taches") {
      const brut = String(b.texte || "").trim().slice(0, 2000);
      if (!brut) { res.status(200).json({ taches: [] }); return; }
      const areqT = {
        model: MODEL, max_tokens: 700, temperature: 0,
        system: SYS_TACHES,
        messages: [{ role: "user", content: [{ type: "text", text: "Dictée à découper :\n" + brut }] }]
      };
      const rt = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
        body: JSON.stringify(areqT)
      });
      if (!rt.ok) { res.status(502).json({ error: "Découpe indisponible" }); return; }
      const dt = await rt.json();
      let outT = ""; for (const c of (dt.content || [])) if (c.type === "text") outT += c.text;
      const parsed = extractJSONObj(outT);
      const CATS = ["devis_factures", "telephone_rendezvous", "relances_impayes", "planning_equipe", "administratif", "recherche_informations", "autre"];
      const taches = (parsed && Array.isArray(parsed.taches) ? parsed.taches : [])
        .map(t => ({
          texte: String((t && t.texte) || "").trim().slice(0, 160),
          categorie: CATS.indexOf((t && t.categorie) || "") > -1 ? t.categorie : "autre"
        }))
        .filter(t => t.texte.length > 1)
        .slice(0, 12);
      res.status(200).json({ taches });
      return;
    }

    const etapes = Array.isArray(b.etapes) && b.etapes.length
      ? b.etapes.slice(0, 10).map(e => `[${e.statut === "done" ? "fait" : e.statut === "blocked" ? "BLOQUÉE" : e.statut === "progress" ? "en cours" : "à faire"}] ${e.titre}`).join("\n")
      : "(pas de feuille de route détaillée disponible)";
    const peurs = Array.isArray(b.peurs) && b.peurs.length ? b.peurs.join(" · ") : "non renseignées";
    const user = `Entreprise : ${b.nom || "?"} (${b.activite || "?"})
CAP / objectif du moment : ${b.objectif || "progresser sur la maturité humaine"}
Acceptabilité (IAT) : ${b.iat != null ? b.iat + "/100 — zone " + (b.band || "?") : "non mesurée"}
Peurs présentes : ${peurs}
--- ÉTAT DE CE MATIN ---
Climat de l'équipe ressenti : ${b.climat || "non renseigné"}
Pouls trésorerie ressenti : ${b.treso || "non renseigné"}
SIGNAUX DE CRISE GRAVE : ${b.crise || "aucun"}
--- FEUILLE DE ROUTE ---
${etapes}

Donne LA priorité du jour (JSON strict).`;

    const areq = { model: MODEL, max_tokens: 400, temperature: 0.5, system: SYS, messages: [{ role: "user", content: [{ type: "text", text: user }] }] };
    async function attempt() {
      const rr = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" }, body: JSON.stringify(areq) });
      if (!rr.ok) return { httpErr: (await rr.text()).slice(0, 160) };
      const dd = await rr.json();
      let out = ""; for (const c of (dd.content || [])) if (c.type === "text") out += c.text;
      const m = extractJSON(out); return m ? { m } : { bad: true };
    }
    let r = await attempt(); if (r.bad) r = await attempt();
    if (r.m && r.m.action) { res.status(200).json(r.m); return; }
    res.status(502).json({ error: "Priorité indisponible" });
  } catch (err) {
    res.status(500).json({ error: "Priorité indisponible", detail: String(err).slice(0, 160) });
  }
}

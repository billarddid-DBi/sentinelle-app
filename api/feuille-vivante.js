// FEUILLE DE ROUTE VIVANTE — l'IA lit l'historique réel des tâches + le cap, et produit : la répartition cap/pompier + les "constats terrain" (tâches répétitives -> outil IA à greffer au plan).
const MODEL = "claude-haiku-4-5-20251001";

const SYS = `Tu es l'analyste DBi360 de la « feuille de route vivante » d'une TPE/PME française. On te donne le CAP (objectifs de transformation) et l'HISTORIQUE RÉEL des tâches quotidiennes du dirigeant + ses décisions en attente. Tu produis DEUX choses :

1. RÉPARTITION DE L'ÉNERGIE : estime la part des tâches qui fait AVANCER LE CAP (stratégique) vs celle qui relève du QUOTIDIEN / POMPIER (opérationnel, récurrent, intendance). Deux entiers qui somment à 100. Sois honnête : chez un dirigeant qui court, le pompier domine souvent.

2. CONSTATS TERRAIN : repère les tâches RÉPÉTITIVES (qui reviennent, ou souvent reportées) et, pour chacune, propose UN outil IA / une automatisation concrète qui l'enlèverait au dirigeant. MAX 3, les plus fréquentes/pénibles d'abord. C'est « le constat réel de son quotidien » qui vient enrichir son plan — pas l'entretien.

RÈGLES : bienveillant (un constat, jamais un reproche ; process pas procès). Concret et réaliste pour une TPE (outils IA simples, peu coûteux). Vocabulaire entreprise, jamais médical. Chaque champ COURT (constat ≤ 14 mots, outil ≤ 14 mots, objectif ≤ 5 mots, lecture ≤ 20 mots).

SORTIE : UNIQUEMENT un objet JSON valide, aucun texte autour, schéma exact :
{"repartition":{"cap":N,"pompier":N},"lecture":"une phrase de synthèse","constats":[{"constat":"le motif récurrent observé","outil":"l'outil IA proposé","objectif":"étiquette courte","type":"IA|externe|humain"}]}`;

function extractJSON(out) {
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
    const taches = Array.isArray(b.taches) && b.taches.length
      ? b.taches.map(t => `- ${t.t} [${t.statut || "?"}${t.reports ? ", reportée " + t.reports + "×" : ""}]`).join("\n")
      : "(aucune tâche enregistrée)";
    const decisions = Array.isArray(b.decisions) && b.decisions.length
      ? b.decisions.map(d => `- ${d.t} (en attente ${d.jours || 0} j)`).join("\n") : "(aucune)";
    const etapes = Array.isArray(b.etapes) && b.etapes.length
      ? b.etapes.map(e => `- ${e.titre} [${e.statut || "?"}]`).join("\n") : "(feuille de route non détaillée)";
    const user = `Entreprise : ${b.nom || "?"} (${b.activite || "?"})
CAP / objectif : ${b.objectif || "progresser sur la maturité"}
--- ÉTAPES DE L'AUDIT (feuille de route) ---
${etapes}
--- HISTORIQUE RÉEL DES TÂCHES ---
${taches}
--- DÉCISIONS EN ATTENTE ---
${decisions}

Analyse (JSON strict).`;

    const areq = { model: MODEL, max_tokens: 700, temperature: 0.5, system: SYS, messages: [{ role: "user", content: [{ type: "text", text: user }] }] };
    async function attempt() {
      const rr = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" }, body: JSON.stringify(areq) });
      if (!rr.ok) return { httpErr: (await rr.text()).slice(0, 160) };
      const dd = await rr.json();
      let out = ""; for (const c of (dd.content || [])) if (c.type === "text") out += c.text;
      const m = extractJSON(out); return m ? { m } : { bad: true };
    }
    let r = await attempt(); if (r.bad) r = await attempt();
    if (r.m && r.m.repartition) { res.status(200).json(r.m); return; }
    res.status(502).json({ error: "Analyse indisponible" });
  } catch (err) {
    res.status(500).json({ error: "Analyse indisponible", detail: String(err).slice(0, 160) });
  }
}

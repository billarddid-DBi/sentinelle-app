// COUP DE MAIN — micro-coaching DBi360 quand une étape de la feuille de route bloque.
// Ton : encourageant, jamais complaisant, jamais seul. Réponse courte et actionnable.
const MODEL = "claude-haiku-4-5-20251001";

const SYS = `Tu es le compagnon de suivi DBi360 d'un dirigeant de TPE/PME française. Une étape de son plan d'action BLOQUE. Tu l'aides à repartir, en VOCABULAIRE ENTREPRISE (jamais médical), avec un ton CHALEUREUX, LUCIDE et ENCOURAGEANT : le dirigeant ne doit JAMAIS se sentir seul ni jugé. Un blocage est une information, pas un échec.

RÈGLES :
- Ne juge JAMAIS le dirigeant ni son équipe. Les causes humaines se formulent au CONDITIONNEL, avec bienveillance (process, pas procès).
- Donne du CONCRET et du PETIT : 2 à 3 micro-actions simples, réalistes pour une TPE, faisables cette semaine. On débloque en réduisant la marche, pas en ajoutant de la pression.
- Si le blocage touche l'humain / la peur du changement, traite-le par la conduite du changement et la communication (rassurer, impliquer, co-construire), JAMAIS par un outil de plus.
- Adapte au contexte fourni (l'étape, ce que le dirigeant a écrit, la zone d'acceptabilité IAT, les peurs). Si l'acceptabilité est basse (Blocage), ralentis encore et sécurise l'humain d'abord.
- BREF : "message" = 1 à 2 phrases d'empathie qui remettent en confiance ; chaque piste = 1 phrase actionnable ; "encouragement" = 1 phrase qui relance, positive et méritée.

SORTIE : UNIQUEMENT un objet JSON valide, aucun texte avant/après, aucune balise de code. Schéma EXACT :
{"message":"1-2 phrases d'empathie + recadrage","pistes":["micro-action 1","micro-action 2","micro-action 3"],"encouragement":"1 phrase qui relance"}`;

function extractJSON(out) {
  out = out.replace(/```json/gi, "").replace(/```/g, "");
  const s = out.indexOf("{"), e = out.lastIndexOf("}");
  if (s === -1 || e === -1) return null;
  let js = out.slice(s, e + 1).replace(/,\s*([}\]])/g, "$1");
  try { return JSON.parse(js); } catch (e2) { return null; }
}

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "Méthode non autorisée" }); return; }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) { res.status(500).json({ error: "ANTHROPIC_API_KEY non configurée" }); return; }
  try {
    const b = req.body || {};
    const e = b.etape || {};
    const peurs = Array.isArray(b.peurs) && b.peurs.length ? b.peurs.join(" · ") : "non mesurées";
    const user = `Entreprise : ${b.nom || "?"} (${b.activite || "activité ?"})
Étape qui bloque : « ${e.titre || "?"} » (palier ${e.palier || "?"}, levier de type ${e.type || "?"})
Mise en œuvre prévue : ${e.detail || "n.c."}
Indicateur visé : ${e.indicateur || "n.c."}
Ce que le dirigeant décrit du blocage : ${b.note ? "« " + b.note + " »" : "(rien de précisé)"}
Acceptabilité humaine (IAT) : ${b.iat != null ? b.iat + "/100 — zone " + (b.band || "?") : "non mesurée"}
Peurs présentes dans l'équipe : ${peurs}

Aide ce dirigeant à débloquer cette étape (JSON strict, schéma imposé).`;

    const areq = { model: MODEL, max_tokens: 700, temperature: 0.6, system: SYS, messages: [{ role: "user", content: [{ type: "text", text: user }] }] };
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
    if (r.bad) r = await attempt();
    if (r.m) { res.status(200).json(r.m); return; }
    if (r.httpErr) { res.status(502).json({ error: "Modèle indisponible", detail: r.httpErr }); return; }
    res.status(500).json({ error: "Coup de main : réponse illisible. Réessayez." });
  } catch (err) {
    res.status(500).json({ error: "Coup de main indisponible", detail: String(err).slice(0, 200) });
  }
}

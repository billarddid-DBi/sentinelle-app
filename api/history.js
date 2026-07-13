// Liste les fiches déjà sauvegardées dans le dépôt GitHub (fiches/ + boussoles/).
// Permet de retrouver ses recherches depuis le téléphone, sans PC, en attendant la synchro.

const OWNER = "billarddid-DBi";
const REPO = "sentinelle-app";

async function listDir(token, folder, type) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${folder}`;
  const r = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "sentinelle-app"
    }
  });
  if (!r.ok) return [];
  const arr = await r.json();
  const items = [];
  for (const f of (Array.isArray(arr) ? arr : [])) {
    const m = (f.name || "").match(/^(\d{4}-\d{2}-\d{2})_(\d{2})(\d{2})_(.+)\.html$/);
    if (!m) continue;
    items.push({
      type,
      date: m[1],
      heure: m[2] + ":" + m[3],
      nom: m[4].replace(/_/g, " "),
      url: "/" + folder + "/" + f.name
    });
  }
  return items;
}

export default async function handler(req, res) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) { res.status(500).json({ error: "GITHUB_TOKEN non configuré" }); return; }
  try {
    const a = await listDir(token, "fiches", "SENTINELLE");
    // Mode "full" : toutes les fiches SENTINELLE (pour retrouver la couleur IVE d'une entreprise en BOUSSOLE).
    if (req.query && req.query.full) {
      const fiches = a.sort((x, y) => (y.date + y.heure).localeCompare(x.date + x.heure)).slice(0, 100);
      res.status(200).json({ items: fiches });
      return;
    }
    const b = await listDir(token, "boussoles", "BOUSSOLE");
    const all = a.concat(b).sort((x, y) => (y.date + y.heure).localeCompare(x.date + x.heure)).slice(0, 5);
    res.status(200).json({ items: all });
  } catch (e) {
    res.status(500).json({ error: "Historique indisponible", detail: String(e).slice(0, 200) });
  }
}

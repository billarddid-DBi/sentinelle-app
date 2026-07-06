// Enregistre une fiche SENTINELLE dans le dépôt GitHub (dossier /fiches).
// Utilise le jeton GITHUB_TOKEN (variable d'environnement Vercel).

const OWNER = "billarddid-DBi";
const REPO = "sentinelle-app";

function slug(s) {
  return (s || "ENTREPRISE")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")   // enlève les accents
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 60) || "ENTREPRISE";
}
function b64(str) { return Buffer.from(String(str), "utf8").toString("base64"); }

async function putFile(token, path, contentB64, message) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;
  const r = await fetch(url, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "sentinelle-app",
      "content-type": "application/json"
    },
    body: JSON.stringify({ message, content: contentB64, branch: "main" })
  });
  if (!r.ok) { const t = await r.text(); throw new Error("GitHub " + r.status + ": " + t.slice(0, 200)); }
  return r.json();
}

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "Méthode non autorisée" }); return; }
  const token = process.env.GITHUB_TOKEN;
  if (!token) { res.status(500).json({ error: "GITHUB_TOKEN non configuré sur Vercel" }); return; }
  try {
    const { nom, json, html } = req.body || {};
    if (!json) { res.status(400).json({ error: "Aucune fiche à enregistrer" }); return; }

    const now = new Date();
    const stamp = now.toISOString().slice(0, 16).replace("T", "_").replace(/:/g, "");
    const base = `fiches/${stamp}_${slug(nom)}`;

    await putFile(token, base + ".json", b64(JSON.stringify(json, null, 2)), "fiche " + (nom || "") + " (mobile)");
    if (html) {
      await putFile(token, base + ".html", b64(html), "fiche HTML " + (nom || "") + " (mobile)");
    }
    res.status(200).json({ ok: true, path: base });
  } catch (e) {
    res.status(500).json({ error: "Enregistrement impossible", detail: String(e).slice(0, 300) });
  }
}

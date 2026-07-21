// ENVOI D'UNE FACTURE PAR EMAIL (Gmail SMTP via nodemailer).
// Sécurité : réservé à l'admin — le jeton Supabase du demandeur est vérifié côté serveur,
// puis son rôle est lu via la clé service_role (qui ne quitte JAMAIS le serveur).
// Env requis : SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE, GMAIL_USER, GMAIL_APP_PASSWORD.
import nodemailer from "nodemailer";

const EUR = (n) => (+n).toFixed(2).replace(".", ",") + " €";
const esc = (s) => (s == null ? "" : "" + s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function factureHtml(f) {
  const em = f.emetteur || {}, cl = f.client || {};
  const lignes = (f.lignes || []).map(l =>
    `<tr><td style="padding:10px 12px;border-bottom:1px solid #e6e8ec">${esc(l.libelle)}</td>
     <td style="padding:10px 12px;border-bottom:1px solid #e6e8ec;text-align:right">${EUR(l.montant)}</td></tr>`).join("");
  return `<!doctype html><html><body style="margin:0;background:#f4f5f7;padding:24px 8px;">
  <div style="font-family:Segoe UI,Arial,sans-serif;color:#1C1C1C;max-width:680px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;font-size:14px;line-height:1.5">
    <table width="100%" style="border-collapse:collapse"><tr>
      <td><div style="font-size:22px;font-weight:700">L<span style="color:#E8541A">i</span>VE <span style="color:#6b7280;font-size:12px;font-weight:400">by DBi360</span></div>
        <div style="color:#6b7280;font-size:12px">${esc(em.nom)}<br>${esc(em.statut)}<br>${esc(em.adresse).replace(/\n/g, "<br>")}<br>SIREN : ${esc(em.siren)}${em.tel ? "<br>" + esc(em.tel) : ""}${em.email ? "<br>" + esc(em.email) : ""}</div></td>
      <td style="text-align:right;vertical-align:top"><div style="font-size:22px;font-weight:700">FACTURE</div>
        <div><b>${esc(f.numero)}</b></div><div style="color:#6b7280;font-size:12px">Émise le ${esc((f.emise_le || "").slice(0, 10))}</div></td>
    </tr></table>
    <table width="100%" style="border-collapse:separate;border-spacing:12px 0;margin:22px -12px"><tr>
      <td style="border:1px solid #e6e8ec;border-radius:10px;padding:12px 14px;vertical-align:top;width:50%">
        <div style="color:#6b7280;font-size:11px;margin-bottom:4px">FACTURÉ À</div>
        <b>${esc(cl.nom)}</b><br>${esc(cl.adresse).replace(/\n/g, "<br>")}${cl.siret ? "<br>SIRET : " + esc(cl.siret) : ""}${cl.email ? "<br>" + esc(cl.email) : ""}</td>
      <td style="border:1px solid #e6e8ec;border-radius:10px;padding:12px 14px;vertical-align:top">
        <div style="color:#6b7280;font-size:11px;margin-bottom:4px">PÉRIODE</div>
        Du <b>${esc(f.periode_debut)}</b> au <b>${esc(f.periode_fin)}</b><br>
        <span style="color:#6b7280">Formule ${f.plan === "annuel" ? "Annuelle" : "Mensuelle"}${f.type === "prorata" ? " · prorata d'entrée" : ""}</span></td>
    </tr></table>
    <table width="100%" style="border-collapse:collapse;margin:6px 0 0">
      <tr><th style="text-align:left;padding:10px 12px;background:#fafbfc;font-size:12px;color:#6b7280">Désignation</th>
          <th style="text-align:right;padding:10px 12px;background:#fafbfc;font-size:12px;color:#6b7280">Montant</th></tr>
      ${lignes}
      <tr><td style="padding:12px;text-align:right;font-size:17px;font-weight:700">TOTAL NET À PAYER</td>
          <td style="padding:12px;text-align:right;font-size:17px;font-weight:700">${EUR(f.montant)}</td></tr>
    </table>
    <div style="color:#6b7280;font-size:12px">${esc(em.mention_tva)}</div>
    ${em.iban ? `<div style="margin-top:14px"><b>Règlement par virement</b><br>IBAN : ${esc(em.iban)}${em.bic ? " · BIC : " + esc(em.bic) : ""}</div>` : ""}
    <div style="margin-top:24px;font-size:11px;color:#6b7280;border-top:1px solid #e6e8ec;padding-top:12px;white-space:pre-line">${esc(em.penalites)}</div>
  </div></body></html>`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "Méthode non autorisée" }); return; }
  const URL = process.env.SUPABASE_URL, ANON = process.env.SUPABASE_ANON_KEY, SR = process.env.SUPABASE_SERVICE_ROLE;
  const GU = process.env.GMAIL_USER, GP = process.env.GMAIL_APP_PASSWORD;
  if (!URL || !ANON || !SR) { res.status(500).json({ error: "Supabase non configuré" }); return; }
  if (!GU || !GP) { res.status(500).json({ error: "Email non configuré : ajoute GMAIL_USER et GMAIL_APP_PASSWORD dans Vercel." }); return; }
  try {
    // 1. Qui appelle ? (jeton de session transmis par la console)
    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (!token) { res.status(401).json({ error: "Non connecté" }); return; }
    const ur = await fetch(`${URL}/auth/v1/user`, { headers: { apikey: ANON, authorization: `Bearer ${token}` } });
    if (!ur.ok) { res.status(401).json({ error: "Session invalide" }); return; }
    const user = await ur.json();
    // 2. Est-il admin ? (lecture profils avec la clé serveur)
    const pr = await fetch(`${URL}/rest/v1/profils?id=eq.${user.id}&select=role`, { headers: { apikey: SR, authorization: `Bearer ${SR}` } });
    const prof = (await pr.json())[0];
    if (!prof || prof.role !== "admin") { res.status(403).json({ error: "Réservé à l'administrateur" }); return; }
    // 3. La facture
    const fid = parseInt((req.body || {}).factureId, 10);
    if (!fid) { res.status(400).json({ error: "factureId manquant" }); return; }
    const fr = await fetch(`${URL}/rest/v1/factures?id=eq.${fid}&select=*`, { headers: { apikey: SR, authorization: `Bearer ${SR}` } });
    const f = (await fr.json())[0];
    if (!f) { res.status(404).json({ error: "Facture introuvable" }); return; }
    const dest = (f.client && f.client.email || "").trim();
    if (!dest) { res.status(400).json({ error: "Pas d'email de facturation pour ce client" }); return; }
    // 4. Envoi Gmail
    const transporter = nodemailer.createTransport({ service: "gmail", auth: { user: GU, pass: GP } });
    const html = factureHtml(f);
    await transporter.sendMail({
      from: `"LIVE by DBi360" <${GU}>`,
      to: dest,
      subject: `Votre facture ${f.numero} — Abonnement LIVE (${EUR(f.montant)})`,
      html,
      attachments: [{ filename: `${f.numero}.html`, content: html, contentType: "text/html" }]
    });
    // 5. Statut → envoyée (sauf si déjà payée)
    if (f.statut === "emise") {
      await fetch(`${URL}/rest/v1/factures?id=eq.${fid}`, {
        method: "PATCH",
        headers: { apikey: SR, authorization: `Bearer ${SR}`, "content-type": "application/json", prefer: "return=minimal" },
        body: JSON.stringify({ statut: "envoyee" })
      });
    }
    res.status(200).json({ ok: true, envoyee_a: dest });
  } catch (err) {
    res.status(500).json({ error: "Envoi impossible", detail: String(err && err.message || err).slice(0, 200) });
  }
}

// MAIL DE BIENVENUE — envoyé automatiquement à l'inscription d'un dirigeant.
// Sécurité : n'envoie QU'À l'email du compte authentifié (le jeton de session est vérifié côté serveur).
// Env requis : SUPABASE_URL, SUPABASE_ANON_KEY, GMAIL_USER, GMAIL_APP_PASSWORD.
import nodemailer from "nodemailer";

const esc = (s) => (s == null ? "" : "" + s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const APP_URL = "https://sentinelle-app.vercel.app/";

function welcomeHtml(entreprise) {
  const nom = esc(entreprise) || "cher dirigeant";
  return `<!doctype html><html><body style="margin:0;background:#f4f5f7;padding:24px 8px;">
  <div style="font-family:Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;">
    <div style="background:#1C1C1C;color:#fff;padding:26px 24px;text-align:center;">
      <div style="font-size:30px;font-weight:800;letter-spacing:3px;">L<span style="color:#E8541A;">i</span>VE</div>
      <div style="font-size:9px;letter-spacing:2px;color:#9ca3af;margin-top:5px;">L'INDICE DE VALEUR D'ENTREPRISE</div>
    </div>
    <div style="padding:26px 24px;color:#1C1C1C;font-size:14.5px;line-height:1.6;">
      <p style="margin:0 0 14px;">Bonjour <b>${nom}</b>,</p>
      <p style="margin:0 0 14px;">Bienvenue chez <b>LIVE</b> 👋</p>
      <p style="margin:0 0 14px;">Vous venez de faire quelque chose que peu de dirigeants prennent le temps de faire : <b>regarder votre entreprise comme le monde extérieur la voit.</b></p>
      <p style="margin:0 0 14px;">En quelques minutes, SENTINELLE a analysé vos signaux publics — avis, visibilité, réputation, concurrence — et calculé votre <b>IVE</b>, l'Indice de Valeur d'Entreprise. <b>C'est votre point de départ.</b> Il ne bougera plus tout seul : à partir de maintenant, chaque action que vous menez peut le faire progresser, et vous le verrez.</p>
      <div style="background:#f8fafc;border-radius:10px;padding:14px 16px;margin:18px 0;">
        <div style="font-weight:700;margin-bottom:8px;">Ce que vous pouvez faire dès aujourd'hui :</div>
        <div style="margin-bottom:6px;">🎨 Consulter <b>votre note et sa couleur</b></div>
        <div style="margin-bottom:6px;">📈 La voir <b>évoluer chaque semaine</b></div>
        <div>📝 Noter les <b>infos que vous seul connaissez</b> sur votre entreprise</div>
      </div>
      <p style="margin:0 0 14px;"><b>Et après ?</b> SENTINELLE vous donne les <b>constats</b>. Quand vous voudrez le <b>plan d'action</b> — les causes, les priorités, les outils IA concrets pour votre métier — la <b>BOUSSOLE</b> prendra le relais.</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${APP_URL}" style="display:inline-block;background:#E8541A;color:#fff;text-decoration:none;border-radius:12px;padding:14px 28px;font-weight:800;font-size:14px;">Découvrir mon espace →</a>
      </div>
      <p style="margin:0 0 14px;color:#6b7280;font-size:13px;font-style:italic;">Une conviction nous guide : rendre visible ce que personne ne voit, pour que vous décidiez sur des faits, pas sur des impressions.</p>
      <p style="margin:18px 0 0;">À très vite dans votre espace,<br><b>Didier Billard</b><br><span style="color:#6b7280;font-size:13px;">Fondateur — LIVE by DBi360</span></p>
    </div>
    <div style="background:#f8fafc;padding:14px 24px;text-align:center;font-size:11px;color:#9ca3af;">🔒 Vos données sont protégées et ne sont jamais revendues.</div>
  </div></body></html>`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "Méthode non autorisée" }); return; }
  const URL = process.env.SUPABASE_URL, ANON = process.env.SUPABASE_ANON_KEY;
  const GU = process.env.GMAIL_USER, GP = process.env.GMAIL_APP_PASSWORD;
  if (!URL || !ANON) { res.status(500).json({ error: "Supabase non configuré" }); return; }
  if (!GU || !GP) { res.status(500).json({ error: "Email non configuré" }); return; }
  try {
    const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    if (!token) { res.status(401).json({ error: "Non connecté" }); return; }
    const ur = await fetch(`${URL}/auth/v1/user`, { headers: { apikey: ANON, authorization: `Bearer ${token}` } });
    if (!ur.ok) { res.status(401).json({ error: "Session invalide" }); return; }
    const user = await ur.json();
    const dest = (user.email || "").trim();
    if (!dest) { res.status(400).json({ error: "Email introuvable" }); return; }
    const entreprise = (user.user_metadata && (user.user_metadata.entreprise || user.user_metadata.name)) || "";
    const html = welcomeHtml(entreprise);
    const transporter = nodemailer.createTransport({ service: "gmail", auth: { user: GU, pass: GP } });
    await transporter.sendMail({
      from: `"LIVE by DBi360" <${GU}>`,
      to: dest,
      subject: "Bienvenue sur LIVE — votre entreprise vient de révéler ses premiers signaux 🎯",
      html
    });
    res.status(200).json({ ok: true, envoye_a: dest });
  } catch (err) {
    res.status(500).json({ error: "Envoi impossible", detail: String(err && err.message || err).slice(0, 200) });
  }
}

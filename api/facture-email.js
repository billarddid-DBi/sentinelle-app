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

const APP_URL = "https://sentinelle-app.vercel.app/";
function welcomeHtml(entreprise) {
  const nom = esc(entreprise) || "cher dirigeant";
  return `<!doctype html><html><body style="margin:0;background:#f4f5f7;padding:24px 8px;">
  <div style="font-family:Segoe UI,Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;">
    <div style="background:#1C1C1C;color:#fff;padding:26px 24px;text-align:center;">
      <div style="font-size:30px;font-weight:800;letter-spacing:3px;">L<span style="color:#E8541A;">i</span>VE</div>
      <div style="font-size:9px;letter-spacing:2px;color:#9ca3af;margin-top:5px;">L'INDICE DES VALEURS D'ENTREPRISES</div>
    </div>
    <div style="padding:26px 24px;color:#1C1C1C;font-size:14.5px;line-height:1.6;">
      <p style="margin:0 0 14px;">Bonjour <b>${nom}</b>,</p>
      <p style="margin:0 0 14px;">Bienvenue chez <b>LIVE</b> 👋</p>
      <p style="margin:0 0 14px;">Vous venez de faire quelque chose que peu de dirigeants prennent le temps de faire : <b>regarder votre entreprise comme le monde extérieur la voit.</b></p>
      <p style="margin:0 0 14px;">En quelques minutes, SENTINELLE a analysé vos signaux publics — avis, visibilité, réputation, concurrence — et calculé votre <b>IVE</b>, l'indice des valeurs d'entreprises. <b>C'est votre point de départ.</b> Il ne bougera plus tout seul : à partir de maintenant, chaque action que vous menez peut le faire progresser, et vous le verrez.</p>
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

// MÊMES valeurs que AURAS dans index.html (les 14 couleurs) — sinon le mail affiche une couleur fausse (ex. Marron -> bleu).
const AURA_HEX = { "Doré": "#eab308", "Rouge": "#ef4444", "Orange": "#f97316", "Jaune": "#facc15", "Vert": "#22c55e", "Turquoise": "#14b8a6", "Bleu": "#3b82f6", "Violet": "#8b5cf6", "Rose": "#ec4899", "Argent": "#94a3b8", "Marron": "#92643f", "Gris": "#9ca3af", "Noir": "#4b5563", "Blanc": "#cbd5e1" };
function sentinelleHtml(s) {
  s = s || {};
  const hex = AURA_HEX[s.couleur] || "#3b82f6";
  const gain = +s.gain || 0;
  const opp = +s.nbOpp || 0;
  const ive = s.ive != null ? esc(s.ive) : "—";
  const pot = s.potentiel != null ? esc(s.potentiel) : "—";
  const noteTxt = s.note_google != null ? String(s.note_google).replace(".", ",") : "n.c.";
  const rn = s.note_google != null ? Math.round(+s.note_google) : 0;
  let stars = ""; for (let i = 1; i <= 5; i++) stars += i <= rn ? "&#9733;" : "&#9734;";
  const IV_TAG = { "Bleu": "Votre image publique inspire confiance.", "Vert": "Une présence solide et rassurante.", "Or": "Une réputation d'excellence.", "Orange": "Une image dynamique et engageante.", "Violet": "Une image singulière et affirmée.", "Turquoise": "Une image moderne et accessible.", "Rouge": "Une image forte, à canaliser.", "Gris": "Une présence encore à révéler.", "Jaune": "Une image chaleureuse.", "Rose": "Une image accueillante." };
  const ivTag = IV_TAG[s.couleur] || "Votre présence en ligne, révélée.";
  const dateStr = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const prenom = (s.prenom || "").trim();
  // Puces « ce que révèle » : à partir des valeurs affichées + réputation
  const cap = (t) => t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
  let bullets = [];
  if (s.valeurs) bullets = String(s.valeurs).split(/[,;]/).map(x => x.replace(/\(.*$/, "").trim()).filter(Boolean).slice(0, 3).map(cap);
  if (s.note_google != null && +s.note_google >= 4) bullets.push("Bonne réputation auprès de vos clients");
  if (!bullets.length) bullets = ["Présence en ligne analysée sur données publiques"];
  const bulletsHtml = bullets.slice(0, 4).map(b =>
    `<tr><td valign="top" width="20" style="padding:5px 0;color:#2563EB;font-size:14px;font-weight:800;">&#10003;</td><td style="padding:5px 0;font-size:12.5px;color:#1C1C1C;line-height:1.4;">${esc(b)}</td></tr>`).join("");
  const nextItems = [
    `pourquoi votre score est de ${ive}`,
    `quels sont vos ${opp || "principaux"} leviers prioritaires`,
    `dans quel ordre agir`,
    `quelles solutions peuvent avoir le plus d'impact`
  ].map(t => `<tr><td valign="top" width="14" style="padding:4px 0;color:#E8541A;font-weight:800;font-size:12px;">&#9656;</td><td style="padding:4px 0;font-size:12px;color:#7c2d12;line-height:1.4;">${t}</td></tr>`).join("");
  // Tuile stat
  const tile = (bg, bd, col, icon, title, big, small, extra) =>
    `<td width="20%" valign="top" style="padding:0 3px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${bg};border:1px solid ${bd};border-radius:11px;"><tr><td align="center" style="padding:11px 3px;">
      <div style="font-size:17px;line-height:1;">${icon}</div>
      <div style="font-size:8px;letter-spacing:.2px;font-weight:800;color:${col};margin-top:4px;">${title}</div>
      <div style="font-size:20px;font-weight:800;color:#1C1C1C;margin-top:2px;line-height:1;">${big}</div>
      <div style="font-size:9px;color:#6b7280;line-height:1.25;margin-top:3px;">${small}</div>${extra || ""}</td></tr></table></td>`;
  const badge = (icon, title, sub) =>
    `<td width="25%" valign="top" style="padding:0 4px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #eef0f3;border-radius:10px;"><tr><td align="center" style="padding:11px 6px;">
      <div style="font-size:15px;">${icon}</div><div style="font-size:9px;font-weight:800;color:#2563EB;margin-top:4px;letter-spacing:.3px;">${title}</div><div style="font-size:8.5px;color:#9ca3af;line-height:1.25;margin-top:2px;">${sub}</div></td></tr></table></td>`;
  // Indicateurs (mêmes chiffres que la page — envoyés dans le payload)
  const band = (n) => n >= 75 ? { l: "Solide", c: "#16a34a" } : n >= 60 ? { l: "Bon niveau", c: "#2563EB" } : n >= 45 ? { l: "À renforcer", c: "#d97706" } : { l: "Fragile", c: "#dc2626" };
  const lb = (o) => `<div style="display:inline-block;margin-top:6px;font-size:8.5px;font-weight:700;color:${o.c};background:${o.c}1e;padding:2px 7px;border-radius:7px;">${o.l}</div>`;
  const est9 = '<span style="font-size:8px;color:#9ca3af;font-weight:600;">*</span>';
  const vis = +s.visibilite || 0, sen = +s.sentiment || 0, pos = +s.positionnement || 0, cfn = +s.confiance || 0;
  const uni = '<span style="font-size:10px;color:#6b7280;font-weight:400;">/100</span>';
  // Pastille RONDE : VML v:roundrect (arcsize 50% = cercle) pour Outlook ; border-radius pour les autres clients.
  const circle = (bg, label, val) => `<!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" style="height:72px;width:72px;v-text-anchor:middle;" arcsize="50%" stroke="f" fillcolor="${bg}"><w:anchorlock/><center style="color:#ffffff;font-family:Arial,sans-serif;"><span style="font-size:7px;font-weight:bold;letter-spacing:.3px;">${label}</span><br><span style="font-size:23px;font-weight:bold;">${val}</span></center></v:roundrect><![endif]--><!--[if !mso]><!--><table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" valign="middle" width="72" height="72" style="width:72px;height:72px;border-radius:50%;background:${bg};color:#ffffff;text-align:center;"><div style="font-size:7.5px;font-weight:700;letter-spacing:.3px;opacity:.9;">${label}</div><div style="font-size:25px;font-weight:800;line-height:1;">${val}</div></td></tr></table><!--<![endif]-->`;
  // Bloc concurrence (optionnel)
  let concuBlock = "";
  if (s.prospect && Array.isArray(s.concurrents) && s.concurrents.length) {
    const rowC = (c, pros) => `<tr>
      <td ${pros ? 'bgcolor="#FBE7DC" ' : ""}style="padding:8px 10px;border-bottom:1px solid #eef2f5;font-size:12px;${pros ? "font-weight:700;" : ""}${pros ? "background:#FBE7DC;" : ""}">${esc(c.nom)}${pros ? ' <span style="font-weight:400;color:#6b7280;font-size:10.5px;">(vous)</span>' : ""}<br><span style="color:#9ca3af;font-size:10.5px;">${esc(c.commune || "")}${(!pros && c.distance != null) ? " &middot; " + esc(c.distance) + " km" : ""}</span></td>
      <td ${pros ? 'bgcolor="#FBE7DC" ' : ""}align="center" style="padding:8px 10px;border-bottom:1px solid #eef2f5;font-size:11.5px;${pros ? "background:#FBE7DC;" : ""}">${c.note != null ? esc(c.note) + "/5" : "n.c."}</td>
      <td ${pros ? 'bgcolor="#FBE7DC" ' : ""}align="center" style="padding:8px 10px;border-bottom:1px solid #eef2f5;font-weight:700;font-size:12.5px;${pros ? "background:#FBE7DC;" : ""}">${c.ive != null ? esc(c.ive) : "—"}</td></tr>`;
    concuBlock = `<tr><td style="padding:4px 24px 8px;">
      <div style="font-size:12px;font-weight:800;color:#2563EB;letter-spacing:.5px;">VOTRE CONCURRENCE LOCALE${s.keyword ? " &mdash; &laquo; " + esc(s.keyword) + " &raquo;" : ""}</div>
      <div style="font-size:11px;color:#6b7280;margin:3px 0 8px;">Vous en 1re ligne, puis les concurrents <b>du plus proche au plus loin</b>.</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #eef0f3;border-radius:10px;overflow:hidden;">
        <tr><td bgcolor="#1C1C1C" style="background:#1C1C1C;color:#fff;padding:7px 10px;font-size:11px;">Entreprise</td><td bgcolor="#1C1C1C" align="center" style="background:#1C1C1C;color:#fff;padding:7px 10px;font-size:11px;">Avis</td><td bgcolor="#1C1C1C" align="center" style="background:#1C1C1C;color:#fff;padding:7px 10px;font-size:11px;">IVE</td></tr>
        ${rowC(s.prospect, true)}${s.concurrents.map(c => rowC(c, false)).join("")}
      </table></td></tr>`;
  }
  return `<!doctype html><html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><!--[if mso]><style>v\\:* { behavior:url(#default#VML); }</style><![endif]--></head>
<body style="margin:0;padding:0;background:#eef0f3;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef0f3;"><tr><td align="center" style="padding:22px 8px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;font-family:'Segoe UI',Arial,sans-serif;color:#1C1C1C;">

  <tr><td style="background:#0f1729;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td valign="middle" style="padding:16px 24px;"><span style="font-size:24px;font-weight:800;letter-spacing:1px;color:#ffffff;">L<span style="color:#E8541A;">i</span>VE</span></td>
      <td align="right" valign="middle" style="padding:16px 24px;"><div style="font-size:13px;font-weight:800;letter-spacing:1.5px;color:#ffffff;">&#9678; SENTINELLE</div><div style="font-size:10px;color:#9ca3af;margin-top:2px;">Le premier regard sur votre entreprise</div></td>
    </tr></table>
    <div style="height:3px;line-height:3px;font-size:0;background:#E8541A;">&nbsp;</div>
  </td></tr>

  <tr><td style="padding:22px 24px 4px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td valign="top" style="padding-right:10px;">
        <div style="font-size:19px;font-weight:800;">Bonjour${prenom ? " " + esc(prenom) : ""},</div>
        <div style="font-size:13px;color:#4b5563;line-height:1.5;margin-top:6px;">Voici le récapitulatif de votre analyse SENTINELLE pour <b>${esc(s.nom) || "votre entreprise"}</b>.</div>
        <div style="font-size:11.5px;color:#9ca3af;margin-top:8px;">&#128197; Analyse réalisée le ${dateStr}</div>
      </td>
      <td width="190" valign="top"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f6f8fb;border:1px solid #eef0f3;border-radius:10px;"><tr><td style="padding:12px 13px;font-size:11px;color:#4b5563;line-height:1.45;"><span style="font-size:15px;">&#128269;</span> SENTINELLE analyse ce qui est visible sur le web à partir de <b>plus de 30 sources publiques</b> vérifiées.</td></tr></table></td>
    </tr></table>
  </td></tr>

  <tr><td style="padding:10px 24px 4px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td width="48%" valign="top" style="padding-right:8px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f6f8fb;border:1px solid #eef0f3;border-radius:12px;"><tr><td style="padding:15px 16px;">
        <div style="font-size:22px;">&#127970;</div>
        <div style="font-size:15px;font-weight:800;margin-top:6px;line-height:1.25;">${esc(s.nom) || "Votre entreprise"}</div>
        <div style="font-size:11.5px;color:#6b7280;margin-top:4px;line-height:1.4;">${esc(s.activite || "")}</div>
        <div style="font-size:11.5px;color:#6b7280;margin-top:6px;">&#128205; ${esc(s.ville || "")}</div>
      </td></tr></table></td>
      <td width="52%" valign="top" style="padding-left:8px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eff5ff;border:1px solid #dbe7fb;border-radius:12px;"><tr><td align="center" style="padding:13px 8px;">
        <div style="font-size:10.5px;font-weight:800;color:#2563EB;letter-spacing:.3px;margin-bottom:9px;">&#8599; VOTRE POTENTIEL</div>
        <table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0"><tr>
          <td align="center" valign="middle">${circle(hex, "MON IVE", ive)}<div style="font-size:8.5px;color:#6b7280;margin-top:4px;">IVE ${esc(s.couleur || "")}</div></td>
          <td valign="middle" align="center" style="padding:0 8px;font-size:8.5px;color:#9ca3af;line-height:1.2;">&rarr;<br>objectif</td>
          <td align="center" valign="middle">${circle("#E8541A", "POTENTIEL", pot)}<div style="font-size:8.5px;color:#6b7280;margin-top:4px;">à viser</div></td>
        </tr></table>
        <div style="margin-top:10px;"><span style="display:inline-block;background:#fff7ed;border:1px solid #fed7aa;color:#c2410c;font-size:11px;font-weight:800;padding:4px 13px;border-radius:20px;">+${gain} points possibles</span></div>
      </td></tr></table></td>
    </tr></table>
  </td></tr>

  <tr><td style="padding:8px 20px 2px;">
    <div style="font-size:11px;font-weight:800;color:#6b7280;letter-spacing:.3px;padding:0 4px 6px;">VUE D'ENSEMBLE</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      ${tile("#eff5ff", "#dbe7fb", "#2563EB", "&#11088;", "RÉPUTATION", noteTxt + (s.note_google != null ? '<span style="font-size:10px;color:#6b7280;font-weight:400;">/5</span>' : ""), (s.nb_avis != null ? esc(s.nb_avis) + " avis" : "à construire"), '<div style="font-size:10px;color:#f0a500;letter-spacing:1px;margin-top:1px;">' + stars + "</div>" + lb({ l: (s.note_google != null && +s.note_google >= 4 ? "Au-dessus moy." : "À développer"), c: "#2563EB" }))}
      ${tile("#effaf3", "#cfeeda", "#16a34a", "&#128065;", "VISIBILITÉ", vis + uni + est9, "Présence web", lb(band(vis)))}
      ${tile("#fff4ee", "#fdd9c3", "#E8541A", "&#10084;", "SENTIMENT", sen + '<span style="font-size:10px;color:#6b7280;font-weight:400;">%</span>' + est9, "retours positifs", lb({ l: (sen >= 70 ? "Positif" : "Mitigé"), c: (sen >= 70 ? "#16a34a" : "#d97706") }))}
      ${tile("#eef0ff", "#dfe3ff", "#6366f1", "&#127970;", "POSITION.", pos + uni + est9, "différenciation", lb(band(pos)))}
      ${tile("#e0f2fe", "#c3e6fb", "#0ea5e9", "&#128737;", "CONFIANCE", cfn + uni + est9, "perçue en ligne", lb(band(cfn)))}
    </tr></table>
    <div style="font-size:9px;color:#9ca3af;padding:6px 4px 0;">* Visibilité, Sentiment, Positionnement et Confiance sont des indicateurs estimés à partir de données publiques.</div>
  </td></tr>

  <tr><td style="padding:10px 24px 6px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td width="52%" valign="top" style="padding-right:9px;">
        <div style="font-size:11.5px;font-weight:800;color:#2563EB;letter-spacing:.4px;">CE QUE RÉVÈLE DÉJÀ VOTRE PRÉSENCE EN LIGNE</div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:6px;">${bulletsHtml}</table>
      </td>
      <td width="48%" valign="top" style="padding-left:9px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;"><tr><td style="padding:13px 15px;">
        <div style="font-size:11.5px;font-weight:800;color:#c2410c;letter-spacing:.4px;">ET MAINTENANT ?</div>
        <div style="font-size:12px;color:#7c2d12;margin-top:4px;line-height:1.45;">SENTINELLE vous a montré ce qui est visible. <b>BOUSSOLE</b> vous explique :</div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:5px;">${nextItems}</table>
      </td></tr></table></td>
    </tr></table>
  </td></tr>

  ${concuBlock}

  <tr><td style="padding:8px 24px 6px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fff7ed;border:1px solid #fde3c7;border-radius:14px;"><tr>
      <td valign="middle" width="56" style="padding:16px 4px 16px 16px;text-align:center;font-size:32px;">&#129517;</td>
      <td valign="middle" style="padding:16px 8px;"><div style="font-size:14.5px;font-weight:800;color:#1C1C1C;line-height:1.3;">Avec BOUSSOLE, gardez le cap.<br>Peu importe la direction.</div></td>
      <td valign="middle" align="right" style="padding:16px 16px 16px 4px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-left:auto;"><tr><td bgcolor="#E8541A" style="background:#E8541A;border-radius:11px;"><a href="${APP_URL}" style="display:inline-block;padding:12px 20px;color:#ffffff;text-decoration:none;font-weight:800;font-size:13px;font-family:'Segoe UI',Arial,sans-serif;">Découvrir BOUSSOLE &rarr;</a></td></tr></table>
        <div style="font-size:9.5px;color:#9ca3af;margin-top:6px;text-align:center;">&#128274; Accès sécurisé</div>
      </td>
    </tr></table>
  </td></tr>

  <tr><td style="padding:2px 20px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      ${badge("&#128737;", "OBJECTIF", "Aucune intervention humaine")}
      ${badge("&#9989;", "FIABLE", "Données publiques vérifiées")}
      ${badge("&#9889;", "RAPIDE", "Résultats en quelques minutes")}
      ${badge("&#128274;", "CONFIDENTIEL", "Vos données sont sécurisées")}
    </tr></table>
  </td></tr>

  <tr><td style="background:#0f1729;padding:16px 24px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td valign="middle" style="color:#e5e7eb;font-size:12px;line-height:1.4;">&#127942; <b>SENTINELLE révèle. BOUSSOLE explique. Vous décidez.</b></td>
      <td align="right" valign="middle"><div style="font-size:17px;font-weight:800;color:#ffffff;">L<span style="color:#E8541A;">i</span>VE</div><div style="font-size:9px;color:#9ca3af;">L'Indice des Valeurs d'Entreprises</div></td>
    </tr></table>
  </td></tr>

  <tr><td align="center" style="padding:13px 24px;font-size:10.5px;color:#9ca3af;line-height:1.5;">Vous recevez cet email suite à votre analyse SENTINELLE sur LiVE by DBi360.</td></tr>

</table>
</td></tr></table>
</body></html>`;
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
    // BRANCHE « BIENVENUE » : tout compte authentifié peut s'envoyer SON mail de bienvenue (pas besoin d'admin)
    if (((req.body || {}).type) === "welcome") {
      const dest = (user.email || "").trim();
      if (!dest) { res.status(400).json({ error: "Email introuvable" }); return; }
      const entreprise = (user.user_metadata && (user.user_metadata.entreprise || user.user_metadata.name)) || "";
      const transporter = nodemailer.createTransport({ service: "gmail", auth: { user: GU, pass: GP } });
      await transporter.sendMail({
        from: `"LIVE by DBi360" <${GU}>`,
        to: dest,
        subject: "Bienvenue sur LIVE — votre entreprise vient de révéler ses premiers signaux 🎯",
        html: welcomeHtml(entreprise)
      });
      res.status(200).json({ ok: true, envoye_a: dest });
      return;
    }
    // BRANCHE « RÉCAP SENTINELLE » : le dirigeant s'envoie SON récap + relance BOUSSOLE (pas besoin d'admin)
    if (((req.body || {}).type) === "sentinelle") {
      const dest = (user.email || "").trim();
      if (!dest) { res.status(400).json({ error: "Email introuvable" }); return; }
      const sent = (req.body || {}).sent || {};
      const transporter = nodemailer.createTransport({ service: "gmail", auth: { user: GU, pass: GP } });
      await transporter.sendMail({
        from: `"LIVE by DBi360" <${GU}>`,
        to: dest,
        subject: `Votre récap SENTINELLE — ${sent.nom || "votre entreprise"} (IVE ${sent.ive != null ? sent.ive : "—"}/100)`,
        html: sentinelleHtml(sent)
      });
      res.status(200).json({ ok: true, envoye_a: dest });
      return;
    }
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

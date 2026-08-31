/* Liste les établissements Google Maps correspondant à « enseigne + ville » — l'utilisateur
   CHOISIT le sien, et c'est ce choix qui fait foi ensuite.

   ⚠️ L'IDENTIFIANT GOOGLE (`place_id`) PART AVEC CHAQUE LIGNE — C'EST TOUT L'INTÉRÊT DE CET
   ÉCRAN. Il était calculé ici puis jeté, et la fiche naissait sans lui. Résultat, mesuré dans
   la vraie base le 31/08/2026 : sur dix-sept fiches, trois seulement portaient un identifiant.
   Il a fallu tenter de les retrouver après coup, à partir du seul nom — et cette recherche a
   accroché cinq fiches « Feu Vert » de Chartres au même magasin et crédité une fiche d'essai
   de 2 473 avis. Aucun réglage ne rattrape cela : un NOM dans un fichier prospects ne suffit
   pas à désigner un ÉTABLISSEMENT.
   Ici, au contraire, personne ne devine : Didier voit le nom et l'adresse, il clique, et
   l'identifiant qu'il a choisi accompagne la fiche jusqu'à la base. « Soit elle n'existe pas,
   soit elle existe déjà », et plus jamais « peut-être que c'est celle-là ».

   La note et le nombre d'avis voyagent aussi : ils s'affichent dans la liste et permettent de
   distinguer un magasin de son atelier (« Feu Vert » 1 155 avis / « Feu Vert Services » 59, à
   la même adresse — cas réel de Chartres). */
export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "Méthode non autorisée" }); return; }
  const key = process.env.GOOGLE_PLACES_KEY;
  if (!key) { res.status(200).json({ etabs: [] }); return; }
  try {
    const q = (((req.body || {}).q) || "").trim();
    if (!q) { res.status(400).json({ error: "q manquant" }); return; }
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(q)}&language=fr&region=fr&key=${key}`;
    const r = await fetch(url);
    const d = await r.json();
    const etabs = (d.results || []).slice(0, 6).map(x => ({
      nom: x.name,
      adresse: (x.formatted_address || "").replace(/, France$/, ""),
      place_id: x.place_id || null,
      note: (x.rating != null ? x.rating : null),
      avis: (x.user_ratings_total != null ? x.user_ratings_total : 0),
      /* « Définitivement fermé » se voit AVANT l'analyse, pas après l'avoir payée. */
      statut: x.business_status || null
    })).filter(x => x.adresse && x.place_id);
    res.status(200).json({ etabs, statut: d.status || null });
  } catch (e) {
    res.status(200).json({ etabs: [] });
  }
}

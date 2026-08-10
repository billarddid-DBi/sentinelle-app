// SENTINELLE — fonction serverless (Vercel). Le "cerveau" : enquête + méthode DBi360.
// La clé API n'est JAMAIS exposée au téléphone : elle vit ici, côté serveur (variable d'environnement).

const MODEL = "claude-haiku-4-5-20251001"; // modèle RAPIDE : SENTINELLE génère un gros rapport -> priorité vitesse (tient sous le plafond 60s Vercel)

const METHODE = `Tu es SENTINELLE, l'outil de pré-diagnostic public de la méthode DBi360 (Didier Billard / SASU CLIXYE).
À partir de SOURCES PUBLIQUES uniquement (utilise l'outil de recherche web), tu produis un PREMIER AVIS sur une entreprise française.

ENQUÊTE : identité (SIREN, forme juridique, activité/code NAF, ancienneté, effectif, dirigeant + année de naissance si trouvable), avis clients (Google/annuaires), site & réseaux, actualités, concurrence locale. N'INVENTE JAMAIS un chiffre, un avis, une actualité : si introuvable, écris "Non trouvé publiquement". Comptes non publics → dis-le.

ARCHÉTYPE (choisis-en UN) et POSTURE associée (adapte TOUT le discours) :
- Artisan saturé (BTP/proximité, installé, petit, débordé) → TEMPS & SÉRÉNITÉ (jamais "plus de clients")
- PME B2B / sous-traitant technique (ingénierie/industrie, grands comptes) → COMPÉTITIVITÉ & PRODUCTIVITÉ
- Commerce en quête de clients (jeune, peu d'avis) → ACQUISITION & VISIBILITÉ
- Commerce établi & performant (installé, beaucoup de bons avis, équipe) → EFFICACITÉ & FIDÉLISATION
- Structure en croissance (recrute, multi-sites) → STRUCTURATION & PILOTAGE
- Entreprise fragilisée (procédures, pertes, avis en baisse) → CONSOLIDATION & TRÉSORERIE (prudent)
- Profession libérale / expert réglementé (avocat, médecin, notaire, expert-comptable, architecte…) → TEMPS FACTURABLE & CRÉDIBILITÉ (déontologie : secret pro, RGPD, validation humaine)
DIRIGEANT (PRUDENCE) : tu peux ÉNONCER les faits (âge, fondateur/repreneur, entreprise familiale) avec tact, mais tu NE DÉDUIS PAS la vision ni les intentions du dirigeant (développer, transmettre, vendre, stabiliser…) — cela relève de BOUSSOLE, en entretien. Une transmission/reprise se dit au CONDITIONNEL, comme simple point à explorer, JAMAIS comme fil rouge ni comme fait avéré. Sépare toujours FAITS OBSERVÉS (sourcés) et HYPOTHÈSES (au conditionnel, prudentes).
CŒUR DE SENTINELLE — ET SA LIMITE ABSOLUE : tu ne disposes QUE de données PUBLIQUES (avis, fiche d'établissement, annuaires, site, réseaux sociaux, presse). Tu vois la VITRINE, jamais l'atelier ni le bureau. Les "agents" que tu proposes sont donc des PISTES, et elles doivent TOUTES porter sur ce qui se voit du dehors : réputation et réponses aux avis, visibilité locale et exactitude des fiches, site et contenus, vitalité des réseaux, photos, prise de contact ou de rendez-vous en ligne, présence sur les plateformes clés du métier, veille des mentions. INTERDIT ABSOLU dans "agents" : tout ce qui suppose de connaître le fonctionnement INTERNE — devis, chiffrage, facturation, stock, invendus, plannings, trésorerie, recrutement, double saisie, transmission du savoir-faire, articulation des logiciels. Tu ne peux RIEN en savoir depuis le dehors : en proposer serait deviner et le faire passer pour un constat. Ces leviers-là relèvent du MIROIR, qui dispose du Questionnaire Dirigeant. Le fil rouge = la posture d'archétype (situation observable), pas une intention supposée.
Ne vends jamais le mauvais levier (pas "plus de clients" à un artisan débordé ou à un commerce déjà plein).
QUICK WINS (RÈGLE STRICTE — crédibilité de l'enquête) : chaque quick win doit découler d'un FAIT PUBLIC OBSERVÉ dans CETTE enquête (avis sans réponse, note en baisse, fiche Google incomplète, horaires manquants, pas de site ou site daté, réseaux inactifs, photos anciennes, absence d'une plateforme clé du métier…) et être réalisable par le dirigeant seul, cette semaine, sans connaître son fonctionnement interne. INTERDIT dans quickwins : tout ce qui suppose des processus internes NON observables de l'extérieur (devis, facturation, stock, planning, trésorerie, recrutement) — et ces leviers-là ne vont PAS davantage dans "agents" : ils ne relèvent NI de l'un NI de l'autre, mais du MIROIR, après le Questionnaire Dirigeant. Tu n'en dis donc RIEN. Le PREMIER quick win cite explicitement le fait observé qui le justifie (ex : « 12 avis sans réponse depuis mars → répondez aux 5 plus récents »). Si l'enquête n'a observé aucun fait actionnable, dis-le plutôt qu'inventer.
LEVIERS TYPES PAR SECTEUR (pour des PISTES cohérentes à chaque fois — puise dedans selon le secteur ; TOUS observables du dehors, aucun ne suppose de connaître l'intérieur) : Restaurant = réservation en ligne, carte et photos à jour, avis et réponses, réseaux, mentions locales · Boulangerie = fiche et horaires exacts, photos des produits, animation locale, avis · Artisan BTP = preuves de chantiers en images, avis et réponses, présence sur les annuaires du bâtiment, captation des demandes entrantes depuis le web (formulaire, messagerie) · Commerce = fiche et horaires, catalogue visible en ligne, avis, réseaux, animation de la clientèle locale · Bureau d'études/industrie = crédibilité du site et des références, veille des appels d'offres publiés, présence professionnelle en ligne · Profession libérale = prise de rendez-vous en ligne, exactitude de la fiche, avis dans le respect de la déontologie, contenus d'expertise.
ENJEU ANCRÉ (champ resume.enjeu) : réutilise EXACTEMENT un de ces libellés STABLES selon la posture, sans le reformuler — Temps & sérénité → "Gagner du temps" · Compétitivité & productivité → "Capacité & compétitivité" · Acquisition & visibilité → "Trouver des clients" · Efficacité & fidélisation → "Efficacité & marge" · Structuration & pilotage → "Structurer la croissance" · Consolidation & trésorerie → "Consolider & sécuriser" · Temps facturable & crédibilité → "Temps facturable".
INDEX AURA (signature de fin, intention = FIERTÉ + envie) : attribue une COULEUR D'AURA selon l'archétype et les signaux — Doré=rayonnement/excellence · Rouge=conquête/dynamique · Orange=chaleur/relation client · Jaune=élan/jeune · Vert=équilibre/sain · Turquoise=lien/soin · Bleu=fiabilité/installé · Violet=expertise (profession libérale) · Rose=bienveillance/proximité · Argent=agilité · Marron=ancrage sous tension/débordé · Gris ou Noir=transition/période difficile (avec délicatesse). L'ÉCLAT (faible/moyen/fort) = force et clarté des signaux. indice.estime = niveau actuel sur 100, calculé avec cette GRILLE D'ANCRAGE (applique-la mécaniquement, ne devine JAMAIS au feeling — c'est ce qui garantit qu'une même entreprise donne la même note à chaque analyse) : PARS DE 50, puis ajuste selon les FAITS publics — Avis clients : ≥4,5/5 avec volume → +20 · 4 à 4,5 → +12 · 3 à 4 → +4 · <3 → −10 · peu ou pas d'avis → 0. Site web : moderne et à jour → +10 · correct mais daté → +3 · absent/obsolète → −8. Présence & fraîcheur (réseaux, publications) : active → +8 · discrète → 0 · fantôme → −5. Ancienneté & structure : établie et solide → +7 · jeune → 0 · fragile → −5. Signaux négatifs publics (litiges, avis en baisse) → −10 à −20. BORNE le résultat entre 5 et 95 et garde-le cohérent avec la moyenne du radar. indice.potentiel = estimé + 15 à 30 selon la marge (strictement > estimé). Le champ "fierte" est BIENVEILLANT et VALORISANT : fais ressortir la fierté (ce qui est déjà bâti + le potentiel), MÊME si les scores sont bas ; ne casse JAMAIS le dirigeant.
DIMENSIONS DE PERFORMANCE VISIBLE (impératif, pour l'Index Aura) : note chacune de 0 à 100 d'après ce que tu OBSERVES — "avis" (réputation en ligne : note + volume ; 0 si aucun) · "reseaux" (présence et vitalité sur les réseaux sociaux : activité, fraîcheur, engagement) · "site" (existence + qualité + richesse + modernité + adéquation au métier ; 0 si pas de site) · "traction" (ancienneté, activité réelle « tourne bien / toujours du travail », références, bouche-à-oreille — un signe FORT de santé même sans présence digitale). Honnêteté cruciale : peu d'avis n'est PAS forcément négatif (dépend du métier) ; un beau site ne garantit PAS la santé. Ces 4 notes alimentent le calcul pondéré de l'aura.

Tout est HYPOTHÈSE DE PRÉ-AUDIT, jamais un diagnostic. Le vrai diagnostic = BOUSSOLE (entretien).

PLATEFORMES DU SECTEUR (recherche web SYSTÉMATIQUE, pour TOUT métier — jamais optionnel) : cherche ACTIVEMENT s'il existe des PLATEFORMES / COMPARATEURS / SITES D'AVIS SPÉCIALISÉS du métier du prospect. DÉCOUVRE-les par la recherche web — ne te limite pas aux plus évidentes ; explore vraiment (comparateurs, classements sectoriels, annuaires notés, plateformes d'avis dédiées). Sur beaucoup de métiers (syndic, santé, juridique, artisanat…), la VRAIE réputation se joue LÀ, pas sur Google : signal précieux. Renseigne "plateformes" avec les 5 MEILLEURES trouvées, CLASSÉES de la plus pertinente/fiable à la moins bonne (critères : autorité, taille du jeu d'avis, neutralité vis-à-vis du métier), UNIQUEMENT réelles (vérifiées par la recherche) avec URL réelle. Écarte les acteurs du secteur qui publient leur propre classement (peu neutres). Si le métier n'a VRAIMENT aucune plateforme spécialisée, renvoie [] (le rapport affichera « aucune plateforme pour ce type d'activité »).

⚠️ FACEBOOK COMPTE COMME UNE PLATEFORME D'AVIS. Si l'entreprise a une page Facebook (ou une page Instagram professionnelle) où figurent des avis, des recommandations ou une note, fais-en une des entrées de "plateformes", avec l'URL EXACTE de la page — pas celle d'une recherche. Didier, 10/08/2026 : « pourquoi tu ne mets pas Facebook ? » Beaucoup d'artisans et de commerces y ont plus d'avis que sur n'importe quel annuaire, et c'est souvent le seul endroit où leur clientèle locale s'exprime.
⚠️ RÉPONDRE À UN AVIS : SEULEMENT S'IL EST RÉCENT. On répond dans la semaine, au pire dans le mois. JAMAIS à un avis vieux de plusieurs mois ou de plusieurs années : une réponse tardive ne rassure personne et fait l'effet inverse — elle affiche publiquement qu'on ne regardait pas. Didier, 10/08/2026, sur un quick win qui proposait de répondre à des avis de 2020 : « tu ne réponds pas au bout de six ans, là tu passes pour un abruti. » Quand les avis sont anciens, la bonne action n'est pas de répondre : c'est d'en faire arriver de nouveaux (demander un avis en fin de prestation) et de répondre à ceux-là, vite. N'écris donc JAMAIS un quick win qui invite à répondre à des avis anciens.
⚠️ AUCUNE DATE NI DURÉE DU PASSÉ DANS LES QUICK WINS ET LA VIGILANCE. Pas de « dernier avis en 2020 », pas de « 6 ans sans réaction », pas de « depuis mars », pas de « 147 likes » : ces éléments viennent de pages que tu n'as pas lues, et ils seront retirés avant affichage. Décris le GESTE à faire, pas la statistique qui le justifie. Un quick win se juge à ce qu'il fait faire, pas au chiffre qu'il cite.
⚠️ L'URL EST LE CHAMP LE PLUS IMPORTANT DE CETTE LISTE — plus important que les chiffres. Après ta réponse, l'application OUVRE elle-même chaque page et y lit la note et le nombre d'avis publiés dans le code du site. Une URL exacte vaut donc un chiffre mesuré ; une URL approximative ne vaut rien, et aucun chiffre ne la rattrape. Donne l'adresse de la PAGE DE CETTE ENTREPRISE sur la plateforme, jamais celle de l'accueil du site ni d'une recherche.
"nb" ET "note" : renseigne-les seulement si tu les as VUS sur la page, sinon null. Ils ne servent que de secours quand la lecture automatique échoue, et l'écran indique alors qu'ils ne sont pas vérifiés. Vérifié le 10/08/2026 : le dernier avis PagesJaunes annoncé au 27/02/2020 datait en réalité du 06/04/2021 — une déduction affichée comme un relevé est un mensonge, et le dirigeant la vérifie en trois secondes devant toi.
⚠️ PAS DE DATE, MAIS UNE TRANCHE — ET LÀ, ON COMPTE SUR TOI. Didier, 10/08/2026 : « je ne veux pas une date précise, je veux quelque chose d'approché ». Le champ "fraicheur" prend UNE de ces cinq valeurs, et rien d'autre : "moins_3m", "3_6m", "6_12m", "1_2a", "plus_2a" — ou null.
COMMENT LA TROUVER : les pages d'avis et les extraits de recherche affichent presque toujours une ancienneté relative — « il y a 3 mois », « il y a 2 ans », « en mars 2024 ». C'est CELA que tu cherches, et c'est tout : tu n'as pas besoin du jour exact. Cherche-la vraiment, elle est le signal le plus utile du tableau : une note de 4,8 posée il y a quatre ans ne vaut pas une note de 4,1 nourrie ce mois-ci.
RÈGLE : si tu n'as vu AUCUNE indication d'ancienneté, mets null. Ne déduis pas la fraîcheur d'une autre plateforme, ni de l'ancienneté de l'entreprise, ni du nombre d'avis. Une tranche encaisse l'approximation — elle n'excuse pas l'invention.
La ligne Google fait exception : sa fraîcheur est calculée par l'application à partir de la date mesurée. N'y touche pas.
N'écris JAMAIS de date en toutes lettres, ni dans "resume", ni dans les quick wins, ni dans la vigilance : elle serait retirée avant affichage.
LA LIGNE GOOGLE NE T'APPARTIENT PAS NON PLUS : son nombre d'avis, sa note et la date de son dernier avis sont mesurés par l'application auprès de Google, après ta réponse. Le champ "avis" décrit uniquement CE QUE DISENT les avis Google, en une phrase, sans aucun chiffre et sans citer d'autre plateforme ; si tu n'as pas pu les lire, laisse-le vide plutôt que d'y résumer d'autres sites.
CE QUI EST ATTENDU DE TOI SUR CE SUJET, ET QUI A DE LA VALEUR : trouver les BONNES plateformes, leur VRAIE adresse, et dire ce que les clients y expriment. C'est précisément ce qu'aucune API ne donne — et personne d'autre ne peut le faire.
N'INVENTE JAMAIS de plateforme ni d'URL.

SORTIE : réponds UNIQUEMENT avec un objet JSON valide — aucun texte avant ou après, aucune balise de code, AUCUNE citation ni balise <cite>. N'insère jamais de références dans les valeurs. Reste concis dans chaque champ (1 à 3 phrases max). Suis EXACTEMENT ce schéma :
{
 "nom": "Nom de l'entreprise",
 "ville": "Ville (CP)",
 "activite": "activité courte",
 "secteur": "un mot-clé parmi: btp, artisan, commerce, restaurant, boulangerie, industrie, sante, juridique, immobilier, services, autre",
 "resume": { "enjeu": "l'enjeu principal (3-4 mots)", "vigilanceNiveau": "🔴 ou 🟠 ou 🟢", "vigilanceLabel": "2-4 mots", "atout": "atout ou potentiel (2-5 mots)" },
 "identite": "phrase d'identité sourcée (SIREN, NAF, ancienneté, effectif, dirigeant…)",
 "radar": { "labels": ["Vision","Organisation","Processus","Informations","Outils","Décisions","Clients","Performance"], "actuel": [8 entiers 0-100], "potentiel": [8 entiers 0-100] },
 "valeurs": "valeurs affichées",
 "imagePercue": "image perçue en ligne",
 "vigilance": [ { "niveau": "🔴|🟠|🟡|🟢", "texte": "…" } ],
 "quickwins": ["action 1","action 2","action 3"],
 "avis": "synthèse des avis Google (ou 'Non trouvé publiquement')",
 "avisDernier": "date du DERNIER avis Google publié, AAAA-MM-JJ (ou AAAA-MM), null si tu ne l'as pas vue",
 "presence": "présence & réseaux",
  "plateformes": [ { "nom": "nom exact", "role": "ce qu'elle compare/note (5-8 mots)", "url": "https://…", "nb": nombre d'avis publiés sur CETTE page (entier) ou null si tu ne l'as pas VU, "note": moyenne sur 5 (ex 4.2) ou null si tu ne l'as pas VUE, "fraicheur": "moins_3m" | "3_6m" | "6_12m" | "1_2a" | "plus_2a" | null, "resume": "ce que les clients y expriment, UNE phrase sur le fond, sans chiffre" } ],
 "site": "URL du site officiel (https://…) ou '' si introuvable",
 "intel": { "financier": "…", "concurrence": "…", "visibilite": "…", "dirigeant": "…" },
 "agents": [ { "tag": "🔥|🧱", "nom": "…", "benefice": "… (INTERDIT : ne JAMAIS écrire le mot Hypothèse ni de fourchette chiffrée spéculative dans ce champ — décris le bénéfice concret, point. Chaque piste doit pouvoir se justifier par un SIGNAL PUBLIC que tu as observé ; si tu n'en as aucun, n'inscris pas la piste)" } ],
 "archetype": "nom de l'archétype retenu",
 "posture": "nom de la posture",
 "chiffre": { "unite": "h" ou "€", "label": "libellé de l'estimation" },
 "coutInaction": "1-2 phrases",
 "simulateur": { "personnes": 2, "heures": 5, "cout": 40 },
 "avantApres": { "aujourdhui": "journée type actuelle", "avecIA": "avec l'IA" },
 "cta": "phrase d'appel vers BOUSSOLE",
 "indice": { "estime": <entier 0-100>, "potentiel": <entier 0-100, strictement supérieur à estime> },
 "dimensions": { "avis": <0-100>, "reseaux": <0-100>, "site": <0-100>, "traction": <0-100> },
 "aura": { "sens": "2-3 mots (ex: la fiabilité)", "couleur": "un seul mot parmi: Doré, Rouge, Orange, Jaune, Vert, Turquoise, Bleu, Violet, Rose, Argent, Marron, Gris, Noir, Blanc", "definition": "1 phrase : l'énergie que dégage l'entreprise", "eclat": "faible ou moyen ou fort" },
 "fierte": "2 phrases VALORISANTES qui font ressortir la fierté (ce qui est déjà bâti + le potentiel), même si les scores sont bas — jamais casser",
 "sources": "sources & niveaux de confiance"
}
Le tableau "agents" contient 3 à 5 éléments — n'en invente pas pour atteindre un nombre : mieux vaut 3 pistes réellement adossées à un signal public que 6 dont la moitié est devinée. Le tableau "vigilance" contient 3 à 4 éléments. Les scores du radar sont des hypothèses de pré-audit cohérentes avec l'archétype.`;

// Index Aura = formule DÉTERMINISTE sur les avis Google (même calcul pour prospect ET concurrents -> cohérence)
function auraFromRating(rating, count) {
  let note = 50;
  if (rating != null) {
    if (rating >= 4.6) note = count >= 40 ? 86 : 80;
    else if (rating >= 4.3) note = count >= 40 ? 80 : 74;
    else if (rating >= 4.0) note = 70;
    else if (rating >= 3.5) note = 60;
    else if (rating >= 3.0) note = 50;
    else note = 38;
  }
  return note;
}

// Poids des 4 dimensions (avis, reseaux, site, traction) selon l'archétype -> somme = 100
function weightsFor(arch) {
  const a = (arch || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  if (/artisan|platr|couvr|macon|btp|plomb|electr|menuis|toitur|peintr/.test(a)) return { avis: 25, reseaux: 10, site: 5, traction: 60 };
  if (/liberal|expert|reglement|avocat|medecin|notaire|comptable|architec|credibilit/.test(a)) return { avis: 25, reseaux: 10, site: 35, traction: 30 };
  if (/b2b|technique|sous.?trait|ingenier|industr|\betude|bureau/.test(a)) return { avis: 15, reseaux: 20, site: 45, traction: 20 };
  if (/fragil|consolid|tresorer|difficult/.test(a)) return { avis: 30, reseaux: 15, site: 15, traction: 40 };
  if (/croissance|structur|pilotage|multi/.test(a)) return { avis: 20, reseaux: 25, site: 30, traction: 25 };
  if (/etabli|performant|efficac|fidelis/.test(a)) return { avis: 40, reseaux: 30, site: 10, traction: 20 };
  if (/jeune|quete|acquisition|visibilit/.test(a)) return { avis: 30, reseaux: 30, site: 25, traction: 15 };
  return { avis: 30, reseaux: 20, site: 25, traction: 25 };
}

// Poids des 4 dimensions selon le MÉTIER (stable, identique à concurrents.js)
function metierProfile(s) {
  const a = (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  if (/restaur|pizz|\bresto|brasser|\bbar\b|cafe|creperie|kebab|sushi|traiteur|boulanger|patisser|glacier/.test(a)) return { avis: 40, reseaux: 30, site: 10, traction: 20 };
  if (/coiff|estheti|beaute|barbier|ongl|\bspa\b|salon|tatou|massage/.test(a)) return { avis: 40, reseaux: 35, site: 10, traction: 15 };
  if (/pare.?brise|garage|carrosser|\bpneu|mecani|\bauto\b|automobile|vidange|controle.?techn/.test(a)) return { avis: 35, reseaux: 15, site: 15, traction: 35 };
  if (/plomb|electr|platr|macon|couvr|menuis|charpent|peintr|carrel|serrur|chauffag|artisan|\bbtp\b|renov|toitur|terrass|paysag|jardin/.test(a)) return { avis: 25, reseaux: 10, site: 5, traction: 60 };
  if (/avocat|notaire|medecin|dentist|comptable|\bexpert|architec|huissier|\bkine|osteo|geometr|assureur/.test(a)) return { avis: 25, reseaux: 10, site: 35, traction: 30 };
  if (/bureau.?etud|ingenier|conseil|agence.?web|informatique|industr|sous.?trait|\bb2b|logiciel|scan|metrolog/.test(a)) return { avis: 15, reseaux: 20, site: 45, traction: 20 };
  if (/immobil|courtier|\bbanque|agence.?immo/.test(a)) return { avis: 30, reseaux: 20, site: 25, traction: 25 };
  return { avis: 30, reseaux: 20, site: 25, traction: 25 };
}

// ===== AURA OBJECTIVE (reproductible) : profil métier {q,v,s} + scores note/volume/site — identique à concurrents.js =====
function profil(kw) {
  const a = (kw || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  if (/restaur|pizz|\bresto|brasser|\bbar\b|cafe|creperie|kebab|sushi|traiteur|boulanger|patisser|glacier/.test(a)) return { q: 30, v: 45, s: 25 };
  if (/coiff|estheti|beaute|barbier|ongl|\bspa\b|salon|tatou|massage/.test(a)) return { q: 30, v: 45, s: 25 };
  if (/pare.?brise|garage|carrosser|\bpneu|mecani|\bauto\b|automobile|vidange|controle.?techn/.test(a)) return { q: 35, v: 40, s: 25 };
  if (/plomb|electr|platr|macon|couvr|menuis|charpent|peintr|carrel|serrur|chauffag|artisan|\bbtp\b|renov|toitur|terrass|paysag|jardin/.test(a)) return { q: 45, v: 20, s: 35 };
  if (/avocat|notaire|medecin|dentist|comptable|\bexpert|architec|huissier|\bkine|osteo|geometr|assureur/.test(a)) return { q: 30, v: 20, s: 50 };
  if (/bureau.?etud|ingenier|conseil|agence.?web|informatique|industr|sous.?trait|\bb2b|logiciel|scan|metrolog/.test(a)) return { q: 25, v: 15, s: 60 };
  if (/immobil|courtier|\bbanque|agence.?immo/.test(a)) return { q: 30, v: 30, s: 40 };
  return { q: 30, v: 35, s: 35 };
}
function qScore(r) { if (r == null) return 45; if (r >= 4.8) return 90; if (r >= 4.5) return 84; if (r >= 4.2) return 78; if (r >= 4.0) return 70; if (r >= 3.5) return 58; if (r >= 3.0) return 42; if (r >= 2.5) return 30; return 20; }
// Couplage volume x qualite (decision Didier 2026-07-24) : un gros volume d'avis MEDIOCRES n'est pas de la notoriete -> le volume n'amplifie a fond que si la note est correcte. IDENTIQUE dans concurrents.js.
function volFactor(r) { if (r == null) return 0.7; if (r >= 4.0) return 1.0; if (r >= 3.5) return 0.8; if (r >= 3.0) return 0.55; return 0.35; }
function vScore(c) { c = c || 0; if (c >= 500) return 92; if (c >= 150) return 85; if (c >= 50) return 76; if (c >= 15) return 66; if (c >= 5) return 55; if (c >= 1) return 45; return 32; }
function sScore(has) { return has ? 75 : 28; }
// Compression du HAUT de l'échelle IVE (décision Didier) : bas inchangé (≤50), plus la note monte plus on la tasse (ex: 84->76). Évite les notes trop flatteuses qui tuent l'envie d'agir. IDENTIQUE dans concurrents.js.
function compress(n) { return n <= 50 ? n : n - 0.7 * Math.pow(n - 50, 2) / 100; }
// Fiche Google CANONIQUE du prospect = celle avec le PLUS d'avis parmi les résultats au nom correspondant (IDENTIQUE à concurrents.js -> même fiche, même IVE partout).
function norm(s) { return (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, ""); }
function pickCanonical(results, nom) {
  const q = norm(nom);
  const matches = results.filter(function (r) { const rn = norm(r.name || ""); return rn && q && (rn.indexOf(q) !== -1 || q.indexOf(rn) !== -1); });
  const pool = matches.length ? matches : [results[0]];
  return pool.reduce(function (b, r) { return ((r.user_ratings_total || 0) > (b.user_ratings_total || 0)) ? r : b; }, pool[0]);
}
/* ⚠️ LA DATE DU DERNIER AVIS GOOGLE SE MESURE, ELLE NE SE DEMANDE PAS. Didier, 10/08/2026 :
   « tu dis que le dernier avis c'est février 2020 et je viens de voir sur Google que le dernier
   avis a été posté il y a trois mois. Tu ne vérifies pas ce que tu fais, c'est très dangereux. »

   Il avait raison, et la fiche disait elle-même d'où venait la faute : le texte portait
   « Avis Google : Non trouvé publiquement. PagesJaunes : … dernier avis 27/02/2020. » Le modèle
   n'avait PAS trouvé la date Google — il avait rempli le champ avec celle de PagesJaunes, et le
   tableau l'affichait dans la ligne Google. Une date recopiée d'une source vers une autre est
   pire qu'une case vide : elle a l'air vérifiée.

   Google Places renvoie les avis avec leur horodatage. On lit donc la vraie date, ici, au lieu
   de la demander à un modèle qui n'y a pas accès. `reviews_sort=newest` demande le plus récent
   d'abord ; si le tri est ignoré, le maximum des horodatages reste une mesure, jamais une
   supposition. */
async function getDetails(placeId, key) {
  const vide = { website: null, dernierAvis: null, statut: (key ? "SANS_LIEU" : "SANS_CLE"), detail: null };
  if (!placeId || !key) return vide;
  /* ⚠️ ON RETIENT CE QUE GOOGLE RÉPOND QUAND IL REFUSE. Didier, 10/08/2026 : « qu'est-ce que je
     dois vérifier dans la console Google Cloud pour pouvoir accéder à la date ? » Sans le
     message d'erreur, la réponse est une liste de suppositions à essayer une par une. Google
     dit précisément pourquoi il refuse — REQUEST_DENIED, OVER_QUERY_LIMIT, INVALID_REQUEST — et
     chacun désigne un réglage différent. On garde ce mot ; il ne contient aucun secret. */
  let statut = null, detail = null;
  const lire = async (url) => {
    const r = await fetch(url);
    if (!r.ok) { statut = "HTTP_" + r.status; return null; }
    const d = await r.json();
    if (d && d.status) statut = d.status;
    if (d && d.error_message) detail = String(d.error_message).slice(0, 160);
    if (!d || !d.result) return null;
    return d.result;
  };
  const base = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&language=fr&key=${key}`;
  try {
    /* ⚠️ TROIS TENTATIVES, DE LA PLUS PRÉCISE À LA PLUS SÛRE — ET L'ORDRE COMPTE. Didier,
       10/08/2026 : « pourquoi tu ne m'affiches pas la date dans le tableau ? » Le repli sautait
       directement du tri par date à la demande minimale : si Google refusait `reviews_sort`, on
       repartait SANS les avis, donc sans aucune date, et en silence. Un repli qui abandonne
       l'information qu'on cherchait n'est pas un repli, c'est un abandon.
       On redemande donc les avis SANS le tri avant de renoncer : même non triés, le plus récent
       de leurs horodatages reste une mesure. */
    let res = await lire(`${base}&fields=website,reviews&reviews_sort=newest`);
    if (!res) res = await lire(`${base}&fields=website,reviews`);
    /* Dernier recours : le strict minimum. Un paramètre refusé fait tomber TOUTE la réponse — on
       perdrait alors l'adresse du site, qui entre dans le calcul de la note. Elle baisserait de
       plusieurs points sans que personne sache que c'est une API qui a bougé, pas l'entreprise.
       Chercher une information de plus ne doit jamais coûter celle qu'on avait déjà. */
    if (!res) res = await lire(`${base}&fields=website`);
    if (!res) return { website: null, dernierAvis: null, statut: statut || "SANS_REPONSE", detail };
    let dernier = null;
    if (Array.isArray(res.reviews) && res.reviews.length) {
      const t = res.reviews.map(x => x && x.time).filter(x => typeof x === "number" && x > 0);
      if (t.length) dernier = new Date(Math.max.apply(null, t) * 1000).toISOString().slice(0, 10);
    }
    /* ⚠️ « OK SANS AVIS » N'EST PAS « OK ». Google peut répondre OK et ne renvoyer aucun avis :
       c'est le signe que le champ `reviews` n'est pas ouvert sur cette clé, pas que la fiche
       n'a pas d'avis. Les confondre ferait chercher le défaut du mauvais côté. */
    if (!dernier && statut === "OK") statut = "OK_SANS_AVIS";
    return { website: res.website || null, dernierAvis: dernier, statut: statut || "OK", detail };
  } catch (_) { return { website: null, dernierAvis: null, statut: statut || "ERREUR_RESEAU", detail }; }
}

/* ═══ LIRE LA NOTE ET LE NOMBRE D'AVIS SUR LA PAGE ELLE-MÊME ═══════════════════════════════
   Didier, 10/08/2026 : « je veux que tu me mettes, par plateforme, le nombre d'avis et la note.
   Le seul truc que je concède, c'est la date du dernier avis. »

   ⚠️ ON NE REDEMANDE PAS AU MODÈLE : ON VA LIRE. Il s'est trompé trois fois parce qu'il ne voit
   pas ces pages. Mais la plupart des sites d'avis publient leur note et leur compteur en clair
   dans le code de la page, au format standard schema.org `AggregateRating` — c'est ce que Google
   lui-même lit pour afficher les étoiles dans ses résultats. Ce n'est pas du contournement :
   c'est une donnée que le site publie POUR être lue par des machines.

   Trouvé → le chiffre est MESURÉ, et il vaut celui de Google. Pas trouvé → il reste celui que
   l'analyse annonce, et l'écran le dit. Les deux ne se confondent jamais. */
function extraireNote(html) {
  const nb = (v) => { const n = parseFloat(String(v).replace(",", ".")); return isFinite(n) ? n : null; };
  /* 1. Le JSON-LD, quand il est là : c'est la source la plus propre et la moins ambiguë. */
  const blocs = html.match(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi) || [];
  for (const b of blocs) {
    const brut = b.replace(/^[\s\S]*?>/, "").replace(/<\/script>$/i, "");
    let data; try { data = JSON.parse(brut); } catch (_) { continue; }
    const pile = [data];
    while (pile.length) {
      const x = pile.pop();
      if (!x || typeof x !== "object") continue;
      if (Array.isArray(x)) { x.forEach(y => pile.push(y)); continue; }
      const ar = x.aggregateRating;
      if (ar && typeof ar === "object") {
        const note = nb(ar.ratingValue);
        const compte = nb(ar.reviewCount != null ? ar.reviewCount : ar.ratingCount);
        if (note != null || compte != null) return { note, nb: compte != null ? Math.round(compte) : null };
      }
      Object.keys(x).forEach(k => pile.push(x[k]));
    }
  }
  /* 2. À défaut, les microdonnées en attributs — même vocabulaire, autre écriture. */
  const mN = html.match(/itemprop=["']ratingValue["'][^>]*content=["']([\d.,]+)["']/i)
          || html.match(/["']ratingValue["']\s*:\s*["']?([\d.,]+)/i);
  const mC = html.match(/itemprop=["'](?:reviewCount|ratingCount)["'][^>]*content=["'](\d+)["']/i)
          || html.match(/["'](?:reviewCount|ratingCount)["']\s*:\s*["']?(\d+)/i);
  if (mN || mC) return { note: mN ? nb(mN[1]) : null, nb: mC ? parseInt(mC[1], 10) : null };
  return null;
}
async function mesurerPlateforme(url) {
  if (!url || !/^https?:\/\//i.test(url)) return null;
  const stop = new AbortController();
  /* ⚠️ QUATRE SECONDES, PAS PLUS. La fonction entière tient sous 60 s et l'analyse est déjà
     longue : une plateforme lente ne doit jamais faire échouer l'enquête complète. */
  const minuteur = setTimeout(() => stop.abort(), 4000);
  try {
    const r = await fetch(url, {
      signal: stop.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SENTINELLE/1.0; +https://dbi360.fr)", "Accept-Language": "fr-FR,fr;q=0.9" }
    });
    if (!r.ok) return null;
    const html = (await r.text()).slice(0, 400000);   // au-delà, ce n'est plus de l'en-tête
    return extraireNote(html);
  } catch (_) { return null; }
  finally { clearTimeout(minuteur); }
}

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "Méthode non autorisée" }); return; }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) { res.status(500).json({ error: "Clé API manquante (ANTHROPIC_API_KEY non configurée sur Vercel)." }); return; }

  try {
    const { text, imageBase64, imageMediaType, fieldInfo } = req.body || {};

    const userContent = [];
    if (imageBase64) {
      userContent.push({ type: "image", source: { type: "base64", media_type: imageMediaType || "image/jpeg", data: imageBase64 } });
      userContent.push({ type: "text", text: "Voici la photo d'une carte de visite. Lis-la (société, dirigeant, ville) puis fais le SENTINELLE de cette entreprise." });
    }
    if (text) {
      userContent.push({ type: "text", text: "Fais le SENTINELLE de cette entreprise : " + text });
    }
    if (fieldInfo) {
      userContent.push({ type: "text", text: "Infos terrain à intégrer (source: info terrain 🟠) : " + fieldInfo });
    }
    if (userContent.length === 0) { res.status(400).json({ error: "Aucune entreprise fournie." }); return; }

    const anthropicReq = {
      model: MODEL,
      max_tokens: 8000,
      temperature: 0,
      system: METHODE,
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: 4 }],
      messages: [{ role: "user", content: userContent }]
    };

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(anthropicReq)
    });

    if (!r.ok) {
      const errTxt = await r.text();
      res.status(502).json({ error: "Erreur API Anthropic", detail: errTxt.slice(0, 500) });
      return;
    }

    const data = await r.json();
    // Concatène tous les blocs de texte de la réponse
    let out = "";
    for (const block of (data.content || [])) {
      if (block.type === "text") out += block.text;
    }
    // Filet de sécurité : retire d'éventuelles balises de citation <cite ...>…</cite>
    out = out.replace(/<\/?cite[^>]*>/gi, "");
    // Extrait le JSON (au cas où il y aurait du texte autour)
    const start = out.indexOf("{");
    const end = out.lastIndexOf("}");
    if (start === -1 || end === -1) {
      res.status(500).json({ error: "Réponse non exploitable", raw: out.slice(0, 500) });
      return;
    }
    let fiche;
    try { fiche = JSON.parse(out.slice(start, end + 1)); }
    catch (e) { res.status(500).json({ error: "JSON invalide", raw: out.slice(0, 500) }); return; }

    // Index Aura OBJECTIF (reproductible) : note + volume Google + présence site, pondérés MÉTIER. Aucun jugement -> même note partout.
    try {
      const gkey = process.env.GOOGLE_PLACES_KEY;
      if (gkey && fiche && fiche.nom) {
        const gq = encodeURIComponent(`${fiche.nom} ${fiche.ville || ""}`.trim());
        const gr = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${gq}&language=fr&region=fr&key=${gkey}`);
        if (gr.ok) {
          const gd = await gr.json();
          const p = (gd.results && gd.results.length) ? pickCanonical(gd.results, fiche.nom) : null;
          if (p) {
            const det = await getDetails(p.place_id, gkey);
            const site = det.website;
            const w = profil(fiche.activite || fiche.secteur || fiche.archetype);
            const _r = (p.rating != null ? p.rating : null);
            const note = Math.max(5, Math.min(97, Math.round(compress((w.q * qScore(_r) + w.v * vScore(p.user_ratings_total || null) * volFactor(_r) + w.s * sScore(!!site)) / 100))));
            fiche.indice = fiche.indice || {};
            fiche.indice.estime = note;
            fiche.indice.potentiel = Math.min(100, note + 18);
            fiche._auraCalc = { note_google: (p.rating != null ? p.rating : null), nb_avis: (p.user_ratings_total || 0), site: !!site, poids: w, dernier_avis: det.dernierAvis, google_statut: det.statut || null, google_detail: det.detail || null };
            /* ⚠️ ON EFFACE CE QUE LE MODÈLE AURAIT ÉCRIT LÀ. Le champ était sa porte d'entrée
               pour glisser la date d'une autre plateforme dans la ligne Google. Mesurée ou
               absente : il n'y a pas de troisième cas. */
            fiche.avisDernier = det.dernierAvis || null;
          }
        }
      }
    } catch (_) {}

    /* ═══ ON VA LIRE CHAQUE PLATEFORME, EN PARALLÈLE ═══════════════════════════════════════
       ⚠️ CINQ AU MAXIMUM, ET TOUTES EN MÊME TEMPS. En série, cinq pages à quatre secondes
       feraient vingt secondes ajoutées à une analyse déjà longue — le plafond de 60 s de la
       fonction est vite atteint, et c'est toute l'enquête qui tombe, pas seulement un chiffre.
       Un échec de lecture n'est jamais fatal : la plateforme garde alors le chiffre annoncé par
       l'analyse, et l'écran dira qu'il n'est pas vérifié. */
    try {
      const plats = Array.isArray(fiche.plateformes) ? fiche.plateformes.slice(0, 5) : [];
      if (plats.length) {
        const lus = await Promise.all(plats.map(p => mesurerPlateforme(p && p.url)));
        plats.forEach((p, i) => {
          const m = lus[i];
          if (!p || !m) return;
          if (m.note != null) { p.note = m.note; }
          if (m.nb != null) { p.nb = m.nb; }
          /* Le drapeau voyage AVEC le chiffre : sans lui, l'écran ne saurait plus distinguer une
             note lue sur la page d'une note annoncée par le modèle — et c'est exactement cette
             confusion qui a fait afficher trois dates fausses. */
          if (m.note != null || m.nb != null) p.mesure = true;
        });
      }
    } catch (_) {}

    /* ═══ C'EST ICI QUE LA FICHE EST RANGÉE (02/08/2026) ═══════════════════════════════════
       Avant, le navigateur recevait la fiche puis la renvoyait à Supabase. Il pouvait donc en
       renvoyer une AUTRE : la garde posée le matin même vérifiait la forme et la taille, jamais
       la sincérité du contenu. Tant que le navigateur écrivait, une fiche forgée restait
       possible — improbable, mais possible.

       On écrit donc au moment où on produit, avec la clé service_role qui ne quitte jamais le
       serveur. `sentinelle_poser` n'est exécutable QUE par ce rôle : les comptes clients ne
       peuvent plus écrire dans `sentinelles` du tout.

       ⚠️ UN ÉCHEC D'ENREGISTREMENT NE DOIT PAS PERDRE L'ANALYSE. Elle a coûté un appel IA et,
       côté client, des jetons. On renvoie donc la fiche dans tous les cas, et l'échec voyage
       avec elle (`_saveErr`) au lieu de faire échouer la requête. */
    try {
      const URL = process.env.SUPABASE_URL, SR = process.env.SUPABASE_SERVICE_ROLE;
      if (URL && SR && fiche && fiche.nom) {
        const rp = await fetch(`${URL}/rest/v1/rpc/sentinelle_poser`, {
          method: "POST",
          headers: { "content-type": "application/json", apikey: SR, Authorization: `Bearer ${SR}` },
          body: JSON.stringify({
            p_nom: fiche.nom,
            p_ville: fiche.ville || "",
            p_adresse: (req.body && req.body.adresse) || "",
            p_fiche: fiche
          })
        });
        if (!rp.ok) fiche._saveErr = `HTTP ${rp.status}`;
        else {
          const rj = await rp.json().catch(() => null);
          if (rj && rj.ok === false) fiche._saveErr = rj.error || "refus";
        }
      } else if (!URL || !SR) {
        fiche._saveErr = "Supabase non configuré côté serveur";
      }
    } catch (e) { fiche._saveErr = String(e).slice(0, 120); }

    res.status(200).json(fiche);
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur", detail: String(e).slice(0, 500) });
  }
}

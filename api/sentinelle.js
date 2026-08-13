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
⚠️ UNE PAGE SANS AVIS DOIT QUAND MÊME APPARAÎTRE — DANS "canaux". Didier, 12/08/2026 : « je vois qu'il y a une actualité très riche sur Facebook, et toi tu ne me mets rien du tout, donc ça ne va pas du tout. » Il a raison, et la faute vient de la consigne juste au-dessus : elle n'accepte Facebook QUE s'il y figure des avis. Une page très active mais sans recommandations était donc écartée en silence — alors qu'elle est parfois le seul endroit où l'entreprise s'adresse à ses clients.
Deux listes, deux natures, aucune confusion possible : "plateformes" = là où des CLIENTS écrivent (avis, notes, recommandations) · "canaux" = les pages que l'ENTREPRISE alimente (Facebook, Instagram, LinkedIn, YouTube, TikTok). Une même page Facebook va dans "plateformes" si elle porte des avis, dans "canaux" sinon — JAMAIS dans les deux.
DANS "canaux" : AUCUN CHIFFRE, AUCUNE DATE, AUCUN JUGEMENT DE VITALITÉ. Ni nombre de publications, ni abonnés, ni « page très active », ni « dernière publication en mars ». Ces pages ne te sont pas lisibles, et l'application retire ces mentions avant affichage. "quoi" dit seulement CE QU'ON Y TROUVE : « chantiers en photos », « nouveautés et horaires », « démonstrations produit ». Si tu ne peux pas le dire sans chiffre, laisse le champ vide.
L'URL doit être celle de la PAGE de cette entreprise, jamais une recherche, jamais l'accueil du réseau. Si tu n'as pas trouvé de page, renvoie une liste vide : "canaux": []. N'INVENTE JAMAIS une page.
LE NOMBRE D'ABONNÉS NE T'APPARTIENT PAS — exactement comme la ligne Google. N'écris aucun champ "abonnes" : après ta réponse, l'application ouvre elle-même chaque page et lit ce nombre s'il y est publié. Tout chiffre que tu écrirais là serait effacé avant affichage. Ton apport, ici comme ailleurs, c'est l'URL EXACTE : elle seule permet la mesure.
⚠️ RÉPONDRE À UN AVIS : SEULEMENT S'IL EST RÉCENT. On répond dans la semaine, au pire dans le mois. JAMAIS à un avis vieux de plusieurs mois ou de plusieurs années : une réponse tardive ne rassure personne et fait l'effet inverse — elle affiche publiquement qu'on ne regardait pas. Didier, 10/08/2026, sur un quick win qui proposait de répondre à des avis de 2020 : « tu ne réponds pas au bout de six ans, là tu passes pour un abruti. » Quand les avis sont anciens, la bonne action n'est pas de répondre : c'est d'en faire arriver de nouveaux (demander un avis en fin de prestation) et de répondre à ceux-là, vite. N'écris donc JAMAIS un quick win qui invite à répondre à des avis anciens.
⚠️ AUCUNE DATE NI DURÉE DU PASSÉ DANS LES QUICK WINS ET LA VIGILANCE. Pas de « dernier avis en 2020 », pas de « 6 ans sans réaction », pas de « depuis mars », pas de « 147 likes » : ces éléments viennent de pages que tu n'as pas lues, et ils seront retirés avant affichage. Décris le GESTE à faire, pas la statistique qui le justifie. Un quick win se juge à ce qu'il fait faire, pas au chiffre qu'il cite.
⚠️ L'URL EST LE CHAMP LE PLUS IMPORTANT DE CETTE LISTE — plus important que les chiffres. Après ta réponse, l'application OUVRE elle-même chaque page et y lit la note et le nombre d'avis publiés dans le code du site. Une URL exacte vaut donc un chiffre mesuré ; une URL approximative ne vaut rien, et aucun chiffre ne la rattrape. Donne l'adresse de la PAGE DE CETTE ENTREPRISE sur la plateforme, jamais celle de l'accueil du site ni d'une recherche.
"nb" ET "note" : renseigne-les seulement si tu les as VUS sur la page, sinon null. Ils ne servent que de secours quand la lecture automatique échoue, et l'écran indique alors qu'ils ne sont pas vérifiés. Vérifié le 10/08/2026 : le dernier avis PagesJaunes annoncé au 27/02/2020 datait en réalité du 06/04/2021 — une déduction affichée comme un relevé est un mensonge, et le dirigeant la vérifie en trois secondes devant toi.
═══ RÈGLE DE COLLECTE DES AVIS PUBLICS (dictée par Didier le 10/08/2026, appliquée mot pour mot) ═══
OÙ CHERCHER, dans cet ordre de valeur : Google/Google Maps · Facebook · LinkedIn · les plateformes MÉTIER ou sectorielles (comparateurs, classements, annuaires notés du métier) · Trustpilot · TripAdvisor si le métier s'y prête.
⚠️ N'ÉCRIS LE NOM D'AUCUN ANNUAIRE, NULLE PART. Didier, 13/08/2026 : « je ne veux plus voir apparaître PagesJaunes nulle part, ou autre réseau ou plateforme. Google, Facebook, LinkedIn et c'est tout. » Cela vaut pour TOUS tes champs, pas seulement la liste des plateformes : ni dans les quick wins, ni dans la vigilance, ni dans la présence, ni dans l'image perçue, ni dans l'intelligence stratégique, ni dans les pistes d'outils. PagesJaunes, Cylex, Kompass, Mappy, StarOfService, Vite-un-dépanneur, Yelp, Justacoté, Eldo, Infobel : ces noms sont retirés automatiquement de ta réponse, et une phrase amputée se lit plus mal qu'une phrase qui ne les cite pas. Écris directement « votre fiche Google », « votre page Facebook », « votre page LinkedIn ».
⚠️ TROIS SOURCES, ET TROIS SEULEMENT, SAUF CHIFFRE RÉELLEMENT LU. Didier, 13/08/2026 : « on se débarrasse de tous les réseaux sauf Google, Facebook et LinkedIn. » PagesJaunes, Cylex, Kompass, Mappy, StarOfService, Vite-un-dépanneur et leurs semblables recopient l'immatriculation et n'ont presque jamais d'avis : une ligne de plus dans le tableau, vide, qui fait passer les lignes utiles pour du détail. N'en cite une QUE si tu y as réellement vu des avis publiés — et l'application retire de toute façon celles dont aucun chiffre n'a pu être mesuré. Une URL exacte de Google, Facebook ou LinkedIn vaut mieux que six annuaires.
POUR CHAQUE PLATEFORME TROUVÉE, récupère autant que possible : la note moyenne, le nombre total d'avis, et la RÉCENCE du dernier avis publié.

⚠️ LA RÉCENCE : ON NE DEMANDE PAS UNE DATE EXACTE. L'objectif est de savoir si l'entreprise reçoit ENCORE des avis. Accepte donc les indications relatives ou approximatives : « il y a 2 semaines », « il y a 3 mois », « il y a 8 mois », « mars 2026 », « il y a un an ». Convertis-les approximativement — nous sommes en août 2026, donc « il y a 4 mois » ≈ avril 2026. Une précision d'un mois n'est PAS nécessaire.

⚠️ ARRÊTÉ LE 11/08/2026 : NE RENSEIGNE PLUS "fraicheur" DU TOUT. Trois tentatives, trois erreurs — une date empruntée à une autre plateforme, une date fausse à sa place, puis une tranche « moins de 3 mois » pour un dernier avis d'avril 2021. Ces pages ne te sont pas lisibles : tout ce que tu écris ici est une déduction présentée comme un relevé, et elle est retirée avant affichage. La fraîcheur n'est affichée que pour Google, où l'application la MESURE.
(Consigne conservée pour mémoire, sans effet : le champ est ignoré.) Le champ "fraicheur" prenait UNE de ces six valeurs :
  "moins_3m"    → Très récent, moins de 3 mois
  "3_6m"        → Récent, entre 3 et 6 mois
  "6_12m"       → Moyennement récent, entre 6 et 12 mois
  "1_2a"        → Ancien, entre 1 et 2 ans
  "plus_2a"     → Très ancien, plus de 2 ans
  "indetermine" → UNIQUEMENT si aucune information exploitable n'a été trouvée, après avoir vraiment cherché
NE RÉPONDS PAS « je ne peux pas trouver la date ». Tu dois poursuivre la recherche jusqu'à déterminer au minimum un ORDRE DE GRANDEUR.

⚠️ RECHERCHE INDIRECTE AUTORISÉE. Si la plateforme ne donne pas l'information directement, cherche des traces publiques secondaires : extraits de résultats de recherche, pages qui reprennent les avis, annuaires, agrégateurs, résultats indexés, pages locales ou sectorielles. Une information indirecte est recevable si elle permet raisonnablement d'évaluer la récence — dans ce cas mets "recence_estimee": true, et l'écran affichera « estimé ». NE PRÉSENTE JAMAIS UNE ESTIMATION COMME UNE DATE CERTAINE.
ORDRE DE RECHERCHE : 1) la date exacte · 2) sinon le mois approximatif · 3) sinon une indication relative · 4) sinon une tranche d'ancienneté · 5) en tout dernier recours seulement : "indetermine".
LE CRITÈRE MÉTIER PRIORITAIRE : « le dernier avis date-t-il de moins de 6 mois, de moins d'un an, de plus d'un an, ou de plusieurs années ? »

⚠️ NE JAMAIS MÉLANGER LES PLATEFORMES. Les avis Google, PagesJaunes, Facebook, Trustpilot sont des ENSEMBLES DIFFÉRENTS. N'additionne jamais leurs nombres d'avis pour produire un total : les mêmes clients peuvent figurer deux fois, et un total efface l'information utile — savoir OÙ la réputation se joue. Chaque plateforme reste sur sa ligne, avec ses propres chiffres.

La ligne Google fait exception à tout ceci : sa note, son nombre d'avis et sa fraîcheur sont MESURÉS par l'application après ta réponse. N'y touche pas.
N'écris JAMAIS de date en toutes lettres dans "resume", dans les quick wins ni dans la vigilance : elle serait retirée avant affichage.
⚠️ N'ÉCRIS JAMAIS QU'IL N'Y A PAS D'AVIS — NI DANS "vigilance", NI DANS LES QUICK WINS, NI NULLE PART. Tu réponds AVANT que l'application n'interroge Google : au moment où tu écris, tu n'as pas vu ses avis, et tu ne peux donc pas conclure qu'il n'y en a aucun. Constaté le 13/08/2026 : « Zéro avis clients publics (Google, PagesJaunes, Cylex) : absence totale de réputation en ligne » sur une entreprise qui affichait 11 avis Google à 4,1/5, dont un de la semaine. Ces phrases sont maintenant RETIRÉES automatiquement dès que la mesure les dément — tu perds donc ta place dans le document en les écrivant. Si l'absence d'avis te paraît être le sujet, décris ce que tu as VU (une page d'annuaire sans commentaire, par exemple) en nommant CETTE page, et laisse le total à l'application.
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
  "plateformes": [ { "nom": "nom exact", "role": "ce qu'elle compare/note (5-8 mots)", "url": "https://…", "nb": nombre d'avis publiés sur CETTE page (entier) ou null, "note": moyenne sur 5 (ex 4.2) ou null, "fraicheur": "moins_3m" | "3_6m" | "6_12m" | "1_2a" | "plus_2a" | "indetermine", "recence_estimee": true si la récence vient d'une source indirecte, false si elle est lue sur la page, "resume": "ce que les clients y expriment, UNE phrase sur le fond, sans chiffre" } ],
 "canaux": [ { "nom": "Facebook | Instagram | LinkedIn | YouTube | TikTok | autre", "url": "https://… (adresse EXACTE de la page de CETTE entreprise)", "quoi": "ce qu'on y trouve, 4-8 mots, SANS aucun chiffre ni date" } ],
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
    /* ⚠️ ON RETIENT LAQUELLE DES TROIS TENTATIVES A RÉPONDU. Sans ça, « moins de 3 mois » a la
       même allure qu'on ait reçu les avis TRIÉS PAR DATE ou les cinq « plus pertinents » : dans
       le second cas, le maximum de leurs horodatages n'est pas forcément le dernier avis de la
       fiche. Ça reste une mesure, mais pas la même — et le lecteur a le droit de le savoir.
       Didier, 12/08/2026 : « tu me dis dernier avis inférieur à trois mois, et en fait c'est
       juillet 2025. Tu ne respectes pas les conditions qu'on s'est données. » */
    /* ⚠️ ON DEMANDE AUSSI DE QUOI JUGER LA FICHE ELLE-MÊME. Didier, 13/08/2026 : « comment tu peux
       estimer que la fiche Google My Business n'est pas complètement remplie ? Est-ce une
       certitude ou une proposition ? »
       C'était une PROPOSITION, et rien à l'écran ne le disait. Le plan invitait à « ajouter des
       photos, les horaires, les services » avec un objectif et une échéance — l'apparence d'un
       diagnostic — alors que le modèle n'a jamais vu cette fiche. Elle pouvait être impeccable.
       Google renvoie pourtant tout cela dans le MÊME appel : photos, horaires, téléphone,
       description. On ne le demandait pas, donc on supposait. Maintenant on regarde. */
    /* ⚠️ ET LE RESTE DE CE QUE GOOGLE DONNE DÉJÀ. Didier, 13/08/2026 : « c'est même là que tu dois
       être proactif et me dire tout ce qu'on peut récupérer. C'est quand même fou de le découvrir
       que maintenant. » Il a raison : ces champs étaient disponibles depuis le premier jour, dans
       le même appel, sans un centime de plus. `business_status` surtout — savoir qu'un prospect a
       fermé définitivement AVANT de préparer un rendez-vous, ça n'a pas de prix. */
    const CHAMPS = "website,reviews,photos,opening_hours,formatted_phone_number,editorial_summary,price_level,business_status,types,formatted_address";
    let tri = false;
    let res = await lire(`${base}&fields=${CHAMPS}&reviews_sort=newest`);
    if (res) tri = true;
    if (!res) res = await lire(`${base}&fields=${CHAMPS}`);
    /* Dernier recours : le strict minimum. Un paramètre refusé fait tomber TOUTE la réponse — on
       perdrait alors l'adresse du site, qui entre dans le calcul de la note. Elle baisserait de
       plusieurs points sans que personne sache que c'est une API qui a bougé, pas l'entreprise.
       Chercher une information de plus ne doit jamais coûter celle qu'on avait déjà. */
    if (!res) res = await lire(`${base}&fields=website`);
    if (!res) return { website: null, dernierAvis: null, avisLus: 0, tri: false, fiche: null, statut: statut || "SANS_REPONSE", detail };
    let dernier = null, avisLus = 0, textes = [];
    if (Array.isArray(res.reviews) && res.reviews.length) {
      avisLus = res.reviews.length;
      const t = res.reviews.map(x => x && x.time).filter(x => typeof x === "number" && x > 0);
      if (t.length) dernier = new Date(Math.max.apply(null, t) * 1000).toISOString().slice(0, 10);
      /* ⚠️ ON GARDAIT L'HORODATAGE ET ON JETAIT LE RESTE. Didier, 13/08/2026 : « pourquoi je n'ai
         plus la synthèse des avis dans "ce qu'ils disent" ? »
         Cette colonne était remplie par le MODÈLE — qui ne lit pas les avis Google. Elle décrivait
         donc ce qu'il supposait qu'ils disent. Or Google nous renvoie leur TEXTE, avec leur note et
         leur date, dans la même réponse que nous payons déjà : on le prenait, on ne le lisait pas.
         Désormais on les garde. Ce ne sont plus des suppositions à résumer, ce sont des avis à
         relire — datés, notés, mot pour mot. */
      textes = res.reviews
        .filter(x => x && typeof x.time === "number" && x.time > 0)
        .sort((a, b) => b.time - a.time)
        .slice(0, 5)
        .map(x => ({
          date: new Date(x.time * 1000).toISOString().slice(0, 10),
          note: (typeof x.rating === "number" ? x.rating : null),
          /* Le nom de l'auteur ne sert à rien au consultant, et nous n'avons aucune raison de
             ranger des noms de tiers dans la base d'un client. La date et la note suffisent. */
          texte: String(x.text || "").replace(/\s+/g, " ").trim().slice(0, 400)
        }))
        .filter(x => x.texte || x.note != null);
    }
    /* ⚠️ « OK SANS AVIS » N'EST PAS « OK ». Google peut répondre OK et ne renvoyer aucun avis :
       c'est le signe que le champ `reviews` n'est pas ouvert sur cette clé, pas que la fiche
       n'a pas d'avis. Les confondre ferait chercher le défaut du mauvais côté. */
    if (!dernier && statut === "OK") statut = "OK_SANS_AVIS";
    /* ⚠️ CE QU'ON SAIT DE LA FICHE, ET RIEN DE PLUS. `null` veut dire « pas demandé » ou « pas
       renvoyé » — jamais « absent ». Un repli qui n'a pas demandé ces champs ne doit surtout pas
       faire conclure à une fiche vide : ce serait fabriquer le constat qu'on cherchait à éviter. */
    const fiche = {
      photos: Array.isArray(res.photos) ? res.photos.length : null,
      horaires: (res.opening_hours && Array.isArray(res.opening_hours.weekday_text) && res.opening_hours.weekday_text.length) ? true
                : (res.opening_hours ? true : null),
      telephone: res.formatted_phone_number ? true : null,
      description: (res.editorial_summary && res.editorial_summary.overview) ? true : null,
      /* OPERATIONAL · CLOSED_TEMPORARILY · CLOSED_PERMANENTLY — le mot de Google, tel quel. */
      statut: res.business_status || null,
      prix: (typeof res.price_level === "number") ? res.price_level : null,
      /* Comment Google CLASSE l'entreprise : ce n'est pas ce qu'elle dit d'elle-même, c'est ce que
         voit quelqu'un qui cherche. Les deux se comparent utilement. */
      types: Array.isArray(res.types) ? res.types.filter(t => t !== "point_of_interest" && t !== "establishment").slice(0, 4) : null,
      adresse: res.formatted_address || null
    };
    return { website: res.website || null, dernierAvis: dernier, avisLus, tri, textes, fiche, statut: statut || "OK", detail };
  } catch (_) { return { website: null, dernierAvis: null, avisLus: 0, tri: false, fiche: null, statut: statut || "ERREUR_RESEAU", detail }; }
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
/* ═══ LE NOMBRE D'ABONNÉS D'UNE PAGE PUBLIQUE, S'IL SE LAISSE LIRE ═════════════════════════
   Didier, 12/08/2026 : « as-tu la possibilité de voir le nombre d'abonnés ? »
   La voie officielle est fermée : lire les abonnés d'une page Facebook qu'on n'administre pas
   demande une autorisation spéciale de Meta, avec dossier et examen manuel. Reste la carte de
   visite que le réseau fournit aux moteurs de recherche (`og:description`), où figure parfois
   « 1 234 J'aime · 1 456 abonnés ». C'est INCONSTANT — souvent un mur de connexion répond à la
   place — et ça peut cesser du jour au lendemain.
   ⚠️ D'OÙ LA MÊME RÈGLE QUE PARTOUT : lu, on affiche ; pas lu, on n'écrit rien. Aucun repli sur
   le modèle, qui ne voit pas ces pages non plus.
   ⚠️ ET ON PRÉFÈRE LES ABONNÉS AUX « J'AIME » : les mentions J'aime sont un cumul historique
   qu'une page traîne depuis dix ans ; les abonnés disent qui suit encore. */
function extraireAbonnes(html) {
  /* ⚠️ ON NE MÉLANGE PAS LES DEUX GUILLEMETS DANS UNE MÊME CLASSE. Premier essai :
     content=["']([^"']*)["'] — une classe qui exclut À LA FOIS " et '. La description
     « 800 mentions J'aime » était donc coupée net sur l'apostrophe, et il ne restait que
     « 800 mentions J ». Or presque toutes ces pages sont en français, et le français est plein
     d'apostrophes : la fonction aurait échoué sur la quasi-totalité des cas réels — sans jamais
     se plaindre, puisque « rien trouvé » est une réponse normale ici. C'est le banc qui l'a vu,
     en la faisant tourner ; aucune lecture du code ne l'aurait montré.
     On traite donc chaque guillemet séparément : dans une valeur entre ", l'apostrophe est un
     caractère ordinaire. */
  const meta = html.match(/<meta[^>]+(?:property|name)=["'](?:og:description|description)["'][^>]*content="([^"]{0,600})"/i)
            || html.match(/<meta[^>]+(?:property|name)=["'](?:og:description|description)["'][^>]*content='([^']{0,600})'/i)
            || html.match(/<meta[^>]*content="([^"]{0,600})"[^>]*(?:property|name)=["'](?:og:description|description)["']/i)
            || html.match(/<meta[^>]*content='([^']{0,600})'[^>]*(?:property|name)=["'](?:og:description|description)["']/i);
  if (!meta) return null;
  /* ⚠️ ON DÉCODE TOUTES LES ÉCHAPPES NUMÉRIQUES, PAS UNE LISTE CHOISIE À LA MAIN. Vérifié le
     12/08/2026 sur la vraie page Facebook de Dronavia, telle que le serveur la reçoit :
        content="Dronavia, Remiremont. 2&#x202f;432 J&#x2019;aime · 1 en parlent …"
     Le séparateur de milliers est &#x202f; (espace fine) et l'apostrophe &#x2019; — deux échappes
     HEXADÉCIMALES. Ma liste ne décodait que quelques échappes décimales : le nombre restait
     « 2&#x202f;432 », le mot « J&#x2019;aime », et la fonction ne trouvait RIEN. Elle aurait
     échoué sur la totalité des pages Facebook françaises, en silence — « rien trouvé » étant ici
     une réponse parfaitement normale.
     C'est la deuxième fois que cette fonction se casse sur un détail d'écriture invisible à la
     relecture. On ne devine plus : on décode tout ce qui est numérique, décimal comme hexa. */
  const txt = meta[1]
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => { try { return String.fromCodePoint(parseInt(h, 16)); } catch (_) { return " "; } })
    .replace(/&#(\d+);/g, (_, d) => { try { return String.fromCodePoint(parseInt(d, 10)); } catch (_) { return " "; } })
    .replace(/&nbsp;/g, " ").replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
  /* « 1 234 », « 1,234 », « 1.234 », « 12 K », « 1,2 M » — tous vus sur ces pages. */
  const enNombre = (brut, suffixe) => {
    let n = parseFloat(String(brut).replace(/[   ]/g, "").replace(/\.(?=\d{3}\b)/g, "").replace(",", "."));
    if (!isFinite(n)) return null;
    if (/^k$/i.test(suffixe || "")) n *= 1000;
    if (/^m$/i.test(suffixe || "")) n *= 1000000;
    return Math.round(n);
  };
  const cherche = (mots) => {
    const re = new RegExp("([\\d][\\d  \\u202f.,]*)\\s*([KkMm])?\\s*(?:" + mots + ")", "i");
    const m = txt.match(re);
    return m ? enNombre(m[1], m[2]) : null;
  };
  /* L'apostrophe typographique ’ est celle que ces pages utilisent presque toujours : ne pas
     l'accepter, c'est ne rien trouver dans 90 % des cas. */
  const ab = cherche("abonn[ée]s?|followers?|personnes? suivent|s['’]abonnent");
  if (ab != null && ab > 0) return { abonnes: ab, source: "abonnes" };
  const ja = cherche("mentions? J['’]aime|J['’]aime|likes?");
  if (ja != null && ja > 0) return { abonnes: ja, source: "jaime" };
  return null;
}
/* ═══ CE QUE LA MESURE DÉMENT NE S'AFFICHE PAS ════════════════════════════════════════════
   Didier, 13/08/2026, capture de la fiche Dronavia : « Zéro avis clients publics (Google,
   PagesJaunes, Cylex) : absence totale de réputation en ligne » — alors que la même fiche
   affiche, trois centimètres plus haut, 11 avis Google à 4,1/5 dont un du 2 août.

   ⚠️ CE N'EST PAS UNE FAUTE DU MODÈLE, C'EST L'ORDRE DES OPÉRATIONS. Il répond AVANT que nous
   n'interrogions Google : au moment où il écrit, il n'a rien vu de ces 11 avis. Lui interdire
   d'en parler ne suffit pas — trois durcissements de consigne sur les dates l'ont prouvé. La
   seule règle qui tienne : quand la mesure arrive et qu'elle dit le contraire, c'est la mesure
   qui gagne, et la phrase saute.

   ⚠️ ON SUPPRIME, ON NE RÉÉCRIT PAS. Corriger « zéro » en « onze » produirait une phrase que
   personne n'a écrite et dont le raisonnement ne tient plus. Une observation fausse se retire ;
   les chiffres justes sont déjà dans le tableau, juste au-dessus. */
/* ⚠️ ON DÉTECTE SUR UNE FENÊTRE, PAS SUR L'ADJACENCE — ET C'EST LA LEÇON DU 13/08/2026. Premier
   motif : « absence (totale)? de avis », des mots collés. Le modèle a écrit « Absence
   quasi-totale d'avis clients publics » et il est passé au travers, sur la MÊME entreprise, à la
   relance suivante. Didier : « tu m'as remis la même merde. Mais arrête. »
   Il a raison. Poursuivre les tournures une par une est perdu d'avance : il y en a toujours une
   de plus. On cherche donc un mot de négation ET le sujet « avis » dans un voisinage court, sans
   franchir la ponctuation forte. Ce n'est plus une liste de phrases interdites, c'est une idée
   interdite — celle d'affirmer qu'il n'y a pas d'avis alors que nous venons d'en compter. */
/* « peu de » et « peu d'avis » : l'apostrophe est le piège habituel, on accepte les deux. */
const NIE_AVIS = /(z[ée]ro|aucun|absence|manque|sans|peu\s+d|quasi|d[ée]pourvu|inexistant|invisible|n[ée]ant|premi[eè]r)[^.;!?]{0,45}(avis|r[ée]putation|t[ée]moignage)/i;
const AUTRE_PLATEFORME = /pagesjaunes|cylex|kompass|trustpilot|tripadvisor|facebook|linkedin|instagram|mappy|yelp/i;
function dementiParLaMesure(txt, nbAvis) {
  if (!(nbAvis > 0)) return false;                 // rien de mesuré : on ne conteste rien
  const t = String(txt || "");
  if (!NIE_AVIS.test(t) && !/\b0\s+avis/i.test(t)) return false;
  if (/google/i.test(t)) return true;              // il nomme Google : la mesure tranche
  if (!AUTRE_PLATEFORME.test(t)) return true;      // affirmation globale : la mesure tranche aussi
  return false;                                    /* ne parle que d'une AUTRE plateforme : « aucun
                                                      avis sur PagesJaunes » peut être parfaitement
                                                      vrai, et on n'a pas mesuré celle-là. */
}
/* ⚠️ UNE FICHE GOOGLE DÉJÀ COMPLÈTE NE SE FAIT PAS « ENRICHIR ». Didier, 13/08/2026 : « comment
   tu peux estimer que la fiche Google My Business n'est pas complètement remplie ? »
   Il ne le pouvait pas — et nous non plus, jusqu'à maintenant. Le plan proposait d'ajouter des
   photos, les horaires, les services, avec un objectif et une échéance : l'apparence d'un
   diagnostic pour un conseil générique. Maintenant qu'on REGARDE la fiche, la tâche disparaît
   quand elle n'a pas lieu d'être. Trois photos suffisent à considérer qu'il y en a : le seuil
   n'est pas un jugement esthétique, c'est la limite entre « il n'y en a pas » et « il y en a ». */
const PARLE_DE_FICHE = /(fiche|page)\s+(google|d['’]?\s*[ée]tablissement)|google\s+my\s+business|google\s+business/i;
function ficheGoogleComplete(fg) {
  if (!fg) return false;                       // pas mesuré : on ne conclut rien
  return (fg.photos != null && fg.photos >= 3) && fg.horaires === true && fg.telephone === true;
}
/* ⚠️ UNE TÂCHE NE DOIT PLUS ENVOYER LE DIRIGEANT SUR UNE PLATEFORME QU'ON A RETIRÉE. Didier,
   13/08/2026 : le plan disait « mettre à jour les horaires sur Google Maps/PagesJaunes » alors
   qu'on venait de sortir PagesJaunes du tableau, faute d'y avoir jamais rien mesuré. Envoyer
   quelqu'un travailler sur une page qu'on juge sans valeur, c'est lui faire perdre son temps —
   et se contredire d'une section à l'autre. On retire le nom, on garde le geste. */
/* Didier, 13/08/2026 : « je ne veux plus voir apparaître PagesJaunes nulle part, ou autre réseau
   ou plateforme. Google, Facebook, LinkedIn et c'est tout. »
   ⚠️ RETIRER UN NOM DANS UNE PHRASE NE SE FAIT PAS EN L'EFFAÇANT. « présent sur PagesJaunes et
   Google » deviendrait « présent sur et Google » : un texte estropié se remarque plus qu'un nom
   de trop. On retire donc le nom AVEC le séparateur qui l'accompagne, des deux côtés, puis on
   recoud ce qui reste — virgules doublées, parenthèses vides, « et » orphelins. */
const NOM_ANNUAIRE = "pages\\s*jaunes|pagesjaunes|cylex|kompass|mappy|starofservice|star\\s+of\\s+service|vite-?un-?d[ée]panneur|118\\s*000|yelp|justacot[ée]|eldo|infobel|soci[ée]teinfo|yably";
function nettoyerAnnuaires(t) {
  let s = String(t || "");
  s = s.replace(new RegExp("\\s*(?:,|/|·|et|puis|ou)\\s*(?:" + NOM_ANNUAIRE + ")\\b", "gi"), "");
  s = s.replace(new RegExp("\\b(?:" + NOM_ANNUAIRE + ")\\s*(?:,|/|·|et|puis|ou)\\s*", "gi"), "");
  s = s.replace(new RegExp("\\b(?:" + NOM_ANNUAIRE + ")\\b", "gi"), "");
  return s
    .replace(/\(\s*[),]?\s*\)/g, "")          // parenthèses devenues vides
    .replace(/\(\s*,\s*/g, "(").replace(/\s*,\s*\)/g, ")")
    .replace(/\s*,\s*,+/g, ",")
    .replace(/\b(sur|dans|dont)\s+(et|ou)\s+/gi, "$1 ")
    .replace(/\s+(et|ou)\s*([.,;:]|$)/gi, "$2")
    /* ⚠️ ET LA PRÉPOSITION RESTÉE SEULE. « Fiche présente sur Mappy, Cylex et Kompass » devenait
       « Fiche présente sur. » — le nom avait disparu, la phrase boitait encore. */
    .replace(/\s+\b(sur|dans|chez|via|par)\b\s*([.,;:]|$)/gi, "$2")
    .replace(/\s{2,}/g, " ").replace(/\s+([,.;:])/g, "$1")
    .replace(/^[\s,;:/·-]+/, "").trim();
}
function retirerCeQueLaMesureDement(fiche) {
  /* ⚠️ PARTOUT, PAS SEULEMENT DANS LE TABLEAU. « Nulle part » veut dire nulle part : les quick
     wins, la vigilance, la présence, l'image perçue, le résumé des avis, les quatre champs
     d'intelligence, et jusqu'au bénéfice des pistes d'outils. Un nom retiré d'un endroit et
     laissé dans un autre, c'est la contradiction qu'on cherchait à supprimer. */
  if (Array.isArray(fiche.quickwins)) fiche.quickwins = fiche.quickwins.map(nettoyerAnnuaires).filter(Boolean);
  if (Array.isArray(fiche.vigilance)) fiche.vigilance.forEach(v => { if (v && v.texte) v.texte = nettoyerAnnuaires(v.texte); });
  ["presence", "imagePercue", "avis", "valeurs", "fierte", "coutInaction"].forEach(c => {
    if (typeof fiche[c] === "string") fiche[c] = nettoyerAnnuaires(fiche[c]);
  });
  if (fiche.intel && typeof fiche.intel === "object") {
    Object.keys(fiche.intel).forEach(k => { if (typeof fiche.intel[k] === "string") fiche.intel[k] = nettoyerAnnuaires(fiche.intel[k]); });
  }
  if (Array.isArray(fiche.agents)) fiche.agents.forEach(a => {
    if (a && typeof a.benefice === "string") a.benefice = nettoyerAnnuaires(a.benefice);
    if (a && typeof a.nom === "string") a.nom = nettoyerAnnuaires(a.nom);
  });
  /* La fiche Google d'abord : ce test-là ne dépend pas du nombre d'avis. */
  const fg = (fiche && fiche._auraCalc) ? fiche._auraCalc.fiche_google : null;
  if (ficheGoogleComplete(fg)) {
    if (Array.isArray(fiche.quickwins)) fiche.quickwins = fiche.quickwins.filter(q => !PARLE_DE_FICHE.test(String(q || "")));
    if (Array.isArray(fiche.vigilance)) fiche.vigilance = fiche.vigilance.filter(v => !PARLE_DE_FICHE.test(String((v && v.texte) || "")));
  }
  const nb = (fiche && fiche._auraCalc && fiche._auraCalc.nb_avis != null) ? +fiche._auraCalc.nb_avis : 0;
  if (!(nb > 0)) return fiche;
  if (Array.isArray(fiche.vigilance)) fiche.vigilance = fiche.vigilance.filter(v => !dementiParLaMesure(v && v.texte, nb));
  if (Array.isArray(fiche.quickwins)) fiche.quickwins = fiche.quickwins.filter(q => !dementiParLaMesure(q, nb));
  if (typeof fiche.avis === "string" && dementiParLaMesure(fiche.avis, nb)) fiche.avis = "";
  if (typeof fiche.imagePercue === "string" && dementiParLaMesure(fiche.imagePercue, nb)) fiche.imagePercue = "";
  return fiche;
}
/* ═══ LES REGISTRES : CE QUE L'ÉTAT SAIT DE L'ENTREPRISE ═════════════════════════════════════
   Didier, 13/08/2026 : « s'il faut regarder d'autres API, on le fait. »
   L'annuaire des entreprises (recherche-entreprises.api.gouv.fr) est public, gratuit, sans clé
   et sans quota gênant. Il donne ce que le modèle SUPPOSAIT jusqu'ici : la date de création —
   donc l'ancienneté EXACTE, au lieu du « malgré 9 ans d'activité » qu'il écrivait de mémoire —
   la tranche d'effectif, l'activité déclarée, et l'état administratif.
   ⚠️ CE DERNIER POINT VAUT À LUI SEUL LE DÉTOUR : une entreprise en cessation, on le sait AVANT
   de préparer un rendez-vous, pas pendant.
   ⚠️ ET ON VÉRIFIE QU'ON PARLE BIEN D'ELLE. Une recherche par nom ramène des homonymes — c'est
   le piège de l'Instagram russe et du profil Facebook « ceribe », en pire : ici les chiffres
   auraient l'air officiels. On exige donc que le code postal corresponde, ou à défaut que le nom
   corresponde de très près. Dans le doute, on ne retient rien. */
const EFFECTIFS = { "NN":null, "00":"aucun salarié", "01":"1 ou 2 salariés", "02":"3 à 5 salariés", "03":"6 à 9 salariés",
  "11":"10 à 19 salariés", "12":"20 à 49 salariés", "21":"50 à 99 salariés", "22":"100 à 199 salariés",
  "31":"200 à 249 salariés", "32":"250 à 499 salariés", "41":"500 à 999 salariés", "42":"1 000 à 1 999 salariés",
  "51":"2 000 à 4 999 salariés", "52":"5 000 à 9 999 salariés", "53":"10 000 salariés ou plus" };
function memeNom(a, b) {
  const n = s => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const x = n(a), y = n(b);
  if (!x || !y) return false;
  return x === y || x.indexOf(y) === 0 || y.indexOf(x) === 0;
}
async function chercherRegistre(nom, ville, cp) {
  if (!nom) return null;
  const stop = new AbortController();
  const minuteur = setTimeout(() => stop.abort(), 4000);
  try {
    const q = encodeURIComponent(`${nom} ${ville || ""}`.trim());
    const r = await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${q}&per_page=5`, { signal: stop.signal });
    if (!r.ok) return { statut: String(r.status) };
    const d = await r.json();
    const liste = Array.isArray(d.results) ? d.results : [];
    if (!liste.length) return { statut: "AUCUN_RESULTAT" };
    /* On ne prend PAS le premier venu : il faut que ce soit la même entreprise. */
    const memeLieu = e => {
      const s = (e && e.siege) || {};
      return (cp && s.code_postal && String(s.code_postal) === String(cp))
          || (ville && s.libelle_commune && memeNom(s.libelle_commune, ville));
    };
    const memeRaison = e => memeNom((e && (e.nom_complet || e.nom_raison_sociale)) || "", nom);
    let bon = liste.find(e => memeLieu(e) && memeRaison(e)), via = "nom+lieu";
    /* ⚠️ MON GARDE-FOU AURAIT REJETÉ LE CAS LE PLUS INTÉRESSANT. Vérifié le 13/08/2026 sur CERIBE :
       le registre la domicilie à CHESNY (57245) depuis son déménagement, quand Google et Facebook
       affichent encore AUGNY (57685). Exiger que la commune corresponde revenait à écarter
       l'entreprise précisément parce qu'elle a bougé — et à taire le fait le plus utile qu'on
       puisse apporter en rendez-vous.
       Quand la recherche ne ramène QU'UNE entreprise et que sa raison sociale correspond, on la
       retient — en disant par quoi on l'a rapprochée, pour que le lieu discordant se voie. */
    if (!bon && liste.length === 1 && memeRaison(liste[0])) { bon = liste[0]; via = "nom"; }
    if (!bon) return { statut: "SANS_CORRESPONDANCE", vus: liste.length };
    const s = bon.siege || {};
    return {
      statut: "OK",
      via: via,
      siren: bon.siren || null,
      nom: bon.nom_complet || bon.nom_raison_sociale || null,
      creation: bon.date_creation || null,
      effectif: (bon.tranche_effectif_salarie != null) ? (EFFECTIFS[String(bon.tranche_effectif_salarie)] || null) : null,
      activite: bon.activite_principale || null,
      /* « A » = active, « C » = cessée. On garde le mot brut à côté, sans l'interpréter. */
      etat: bon.etat_administratif || null,
      adresse: s.adresse || null,
      commune: s.libelle_commune || null,
      cp: s.code_postal || null,
      dirigeants: Array.isArray(bon.dirigeants)
        ? bon.dirigeants.slice(0, 3).map(x => [x.prenoms, x.nom].filter(Boolean).join(" ").trim() || x.denomination || "").filter(Boolean)
        : null
    };
  } catch (_) { return { statut: "SANS_REPONSE" }; }
  finally { clearTimeout(minuteur); }
}
/* ═══ LE SITE LU COMME UN ÉTAT DES LIEUX ═════════════════════════════════════════════════════
   Didier, 13/08/2026 : « as-tu d'autres pistes pour scruter depuis l'extérieur l'intérieur de
   l'entreprise ? »
   Le site en dit long sur le fonctionnement, sans qu'on ait rien à deviner : un formulaire de
   devis ou pas, une prise de rendez-vous en ligne ou un agenda tenu à la main, un espace client
   ou tout par mail. Ce sont des FAITS visibles, et ils remplissent le tour du propriétaire AVANT
   l'entretien — on arrive en sachant quoi demander.
   ⚠️ ON NE DIT JAMAIS « ILS N'ONT PAS ». On lit la page d'accueil, rien d'autre : un formulaire
   peut vivre sur une page « contact » qu'on n'a pas ouverte. Trouvé = constaté ; pas trouvé =
   « pas vu sur la page d'accueil », et c'est écrit comme ça. */
async function lireSite(url) {
  if (!url || !/^https?:\/\//i.test(url)) return null;
  const stop = new AbortController();
  const minuteur = setTimeout(() => stop.abort(), 5000);
  try {
    const r = await fetch(url, {
      signal: stop.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SENTINELLE/1.0; +https://dbi360.fr)", "Accept-Language": "fr-FR,fr;q=0.9" }
    });
    if (!r.ok) return { statut: String(r.status) };
    const h = (await r.text()).slice(0, 400000);
    const a = (re) => re.test(h);
    return {
      statut: "OK",
      https: /^https:/i.test(r.url || url),
      /* Un vrai formulaire : une balise <form> ET un champ de contact. Le seul mot « contact »
         ne prouve rien — toutes les pages en ont un dans leur menu. */
      formulaire: /<form[\s>]/i.test(h) && /type=["']?(?:email|tel)|name=["']?(?:email|mail|telephone|tel|message)/i.test(h),
      devis: a(/devis\s+(?:en\s+ligne|gratuit|imm[ée]diat)|demande\s+de\s+devis|obtenir\s+un\s+devis/i),
      rendezVous: a(/calendly|doctolib|planity|resalib|rendez-?vous\s+en\s+ligne|prendre\s+rendez-?vous|r[ée]server\s+en\s+ligne/i),
      espaceClient: a(/espace\s+client|mon\s+compte|se\s+connecter|suivi\s+de\s+commande/i),
      chat: a(/crisp\.chat|tawk\.to|intercom|livechat|smartsupp|messenger\/js|zendesk|hubspot.*conversations/i),
      boutique: a(/woocommerce|shopify|prestashop|panier|ajouter\s+au\s+panier/i),
      mentions: a(/mentions[\s-]l[ée]gales/i),
      rgpd: a(/politique\s+de\s+confidentialit[ée]|cookies?\s*(?:consent|banner)|tarteaucitron|axeptio|didomi/i),
      analytics: a(/googletagmanager|google-analytics|gtag\(|matomo|plausible/i)
    };
  } catch (_) { return { statut: "SANS_REPONSE" }; }
  finally { clearTimeout(minuteur); }
}
/* La date de la dernière page mise à jour, lue dans le plan du site — le fichier que les moteurs
   utilisent pour savoir quoi réindexer. Quand il existe, c'est une mesure ; quand il n'existe
   pas, on ne conclut rien. */
async function dateSite(url) {
  if (!url) return null;
  const stop = new AbortController();
  const minuteur = setTimeout(() => stop.abort(), 4000);
  try {
    const base = url.replace(/\/+$/, "").replace(/(https?:\/\/[^/]+).*/, "$1");
    const r = await fetch(base + "/sitemap.xml", { signal: stop.signal, headers: { "User-Agent": "Mozilla/5.0 (compatible; SENTINELLE/1.0)" } });
    if (!r.ok) return null;
    const x = (await r.text()).slice(0, 300000);
    const dates = (x.match(/<lastmod>\s*([^<]{4,40})\s*<\/lastmod>/gi) || [])
      .map(m => (m.match(/>([^<]+)</) || [])[1])
      .map(s => new Date(String(s).trim()))
      .filter(t => !isNaN(t) && t.getTime() < Date.now() + 86400000);
    if (!dates.length) return null;
    const max = new Date(Math.max.apply(null, dates.map(t => t.getTime())));
    const pages = (x.match(/<loc>/gi) || []).length || null;
    return { derniere: max.toISOString().slice(0, 10), pages };
  } catch (_) { return null; }
  finally { clearTimeout(minuteur); }
}

/* ═══ LES ANNONCES LÉGALES — BODACC ══════════════════════════════════════════════════════════
   Publications officielles, gratuites, sans clé. Créations, modifications, ventes, dépôts des
   comptes et — surtout — PROCÉDURES COLLECTIVES.
   ⚠️ ON PUBLIE LE FAIT, JAMAIS LA CONCLUSION. « Dernière annonce : dépôt des comptes, le
   09/11/2023 » est un relevé. « Ils ne déposent plus leurs comptes » serait une déduction : une
   société peut déposer avec déclaration de confidentialité, ou relever d'un régime différent.
   La nuance n'est pas un détail : c'est la différence entre un fait qu'on pose sur la table et
   une accusation qu'un dirigeant démonte en dix secondes. */
async function chercherAnnonces(siren) {
  if (!siren) return null;
  const stop = new AbortController();
  const minuteur = setTimeout(() => stop.abort(), 5000);
  try {
    const u = "https://bodacc-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/annonces-commerciales/records"
      + "?where=" + encodeURIComponent(`registre like "${String(siren).replace(/[^0-9]/g, "")}"`)
      + "&limit=20&order_by=" + encodeURIComponent("dateparution desc");
    const r = await fetch(u, { signal: stop.signal });
    if (!r.ok) return { statut: String(r.status) };
    const d = await r.json();
    const l = Array.isArray(d.results) ? d.results : [];
    if (!l.length) return { statut: "AUCUNE", total: 0 };
    const annonces = l.slice(0, 8).map(x => ({
      date: x.dateparution || null,
      famille: x.familleavis_lib || x.familleavis || null,
      ville: x.ville || null
    })).filter(x => x.date);
    /* Une procédure collective est la seule annonce qui change tout : on la remonte à part. */
    const proc = annonces.find(x => /proc[ée]dure|collective|sauvegarde|redressement|liquidation/i.test(x.famille || ""));
    return { statut: "OK", total: d.total_count || l.length, annonces, procedure: proc || null };
  } catch (_) { return { statut: "SANS_REPONSE" }; }
  finally { clearTimeout(minuteur); }
}
const RESEAUX = /facebook\.com|fb\.com|instagram\.com|linkedin\.com|youtube\.com|tiktok\.com|twitter\.com|\/\/(?:www\.)?x\.com/i;
/* ⚠️ UNE LISTE BLANCHE, PAS UNE LISTE NOIRE — ET C'EST MA DEUXIÈME ERREUR SUR LE MÊME SUJET.
   Didier, 13/08/2026 : « j'avais dit qu'on se débarrassait de tous les réseaux sauf Google,
   Facebook et LinkedIn, et là je vois encore plein d'autres trucs qui traînent. »
   Il avait dit exactement cela la veille, et j'avais codé l'inverse : une liste des annuaires à
   retirer (PagesJaunes, Cylex, Kompass…). Résultat, Vite-un-dépanneur, StarOfService et Mappy —
   que je n'avais pas prévus — sont restés. Une liste noire est toujours en retard d'un nom ;
   une liste blanche ne l'est jamais. C'est la même leçon que le filtre des tournures, deux
   heures plus tôt : on ne poursuit pas les cas un par un, on énonce la règle.
   ⚠️ AVEC UNE SEULE PORTE DE SORTIE : une plateforme dont les chiffres ont été RÉELLEMENT
   MESURÉS reste, quelle qu'elle soit. Un chiffre lu vaut mieux qu'une règle, et si un
   comparateur de métier publie sa note en clair, la jeter serait absurde. Un chiffre seulement
   ANNONCÉ par le modèle, lui, ne retient rien : c'est précisément ce qui remplissait le tableau
   de « 11° » et de « 4,5/5° » invérifiables. */
const GARDEES = /google|facebook\.com|fb\.com|linkedin\.com/i;
/* ⚠️ UNE FONCTION, PAS DIX LIGNES DANS LE HANDLER — POUR QU'ELLE SOIT ESSAYABLE. La leçon du
   jour : c'est en FAISANT TOURNER extraireAbonnes() que le banc a trouvé l'apostrophe qui la
   cassait ; aucune relecture ne l'avait vue. Un tri enfoui dans le handler ne s'essaie pas. */
function descendreReseaux(fiche) {
  const plats = Array.isArray(fiche.plateformes) ? fiche.plateformes : [];
  const restent = [], descendent = [];
  plats.forEach(p => {
    const u = (p && p.url) ? String(p.url) : "";
    /* Une page qui porte de VRAIS avis mesurés reste dans le tableau, à sa place. */
    const aDesAvis = !!(p && p.mesure && (p.nb != null || p.note != null));
    /* ⚠️ LES ANNUAIRES VIDES NE MÉRITENT PAS UNE LIGNE. Didier, 13/08/2026 : « on va oublier
       PagesJaunes, il n'y a rien là-dessus. C'est Google, Facebook, LinkedIn et basta. »
       Trois lignes de tirets donnaient au tableau l'air d'un relevé fourni alors qu'elles
       n'apprenaient rien — et faisaient passer les deux lignes utiles pour du détail.
       ⚠️ MAIS ON NE LES INTERDIT PAS : si l'une d'elles porte un jour de VRAIS avis mesurés,
       elle reste. On retire le vide, pas la source. Et les plateformes de métier (TripAdvisor
       pour un restaurant, un comparateur sectoriel) ne sont pas concernées : là, il y a
       vraiment quelque chose à lire. */
    /* Ni Google, ni Facebook, ni LinkedIn, et aucun chiffre mesuré : la ligne n'apprend rien.
       Une ligne sans nom d'URL non plus — on ne garde pas ce qu'on ne peut pas ouvrir. */
    if (!aDesAvis && !(u && GARDEES.test(u)) && !/google/i.test(p && p.nom || "")) return;
    if (u && RESEAUX.test(u) && !aDesAvis) descendent.push({ nom: (p.nom || "Page"), url: p.url, quoi: (p.resume || p.role || "") });
    else restent.push(p);
  });
  /* ⚠️ ON ÉCRIT LA LISTE DÈS QU'ELLE A CHANGÉ, PAS SEULEMENT QUAND UNE PAGE DESCEND. Le premier
     jet sortait ici quand `descendent` était vide — et une fiche dont on ne RETIRAIT que des
     annuaires (aucun réseau à déplacer) les gardait tous. C'est exactement le cas d'une fiche
     sans page Facebook ni LinkedIn, celui où le tableau est déjà le plus pauvre. Trouvé par le
     banc, jamais par la relecture : la sortie anticipée avait l'air anodine. */
  if (restent.length !== plats.length) fiche.plateformes = restent;
  if (!descendent.length) return fiche;
  fiche.plateformes = restent;
  const cans = Array.isArray(fiche.canaux) ? fiche.canaux : [];
  const deja = {};
  cans.forEach(c => { if (c && c.url) deja[String(c.url).replace(/\/+$/, "").toLowerCase()] = 1; });
  descendent.forEach(c => {
    const k = String(c.url).replace(/\/+$/, "").toLowerCase();
    if (!deja[k]) { deja[k] = 1; cans.push(c); }
  });
  fiche.canaux = cans;
  return fiche;
}
/* ⚠️ ON RAPPORTE TOUJOURS CE QUI S'EST PASSÉ, MÊME QUAND ON N'A RIEN TROUVÉ. Didier, 13/08/2026 :
   Facebook affichait ses 2 432 J'aime, LinkedIn rien du tout — et rien à l'écran ne disait
   pourquoi. « Page lue mais sans compteur » et « page qui refuse de répondre » sont deux
   situations opposées : la première se règle en cherchant ailleurs, la seconde ne se règle pas
   du tout. Confondues, elles ne produisent que des suppositions — et j'en ai déjà fait trois de
   trop sur les dates. On renvoie donc un compte rendu de lecture, jamais `null` en silence. */
async function mesurerCanal(url) {
  if (!url || !/^https?:\/\//i.test(url)) return null;
  const stop = new AbortController();
  const minuteur = setTimeout(() => stop.abort(), 4000);
  try {
    const r = await fetch(url, {
      signal: stop.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SENTINELLE/1.0; +https://dbi360.fr)", "Accept-Language": "fr-FR,fr;q=0.9" }
    });
    /* Un refus poli (401, 403) et le fameux 999 de LinkedIn disent la même chose : cette page ne
       se laisse pas lire par un serveur. On garde le nombre : il désigne le réglage, pas nous. */
    if (!r.ok) return { abonnes: null, statut: String(r.status), meta: false };
    const html = (await r.text()).slice(0, 300000);
    const a = extraireAbonnes(html);
    if (a) return { abonnes: a.abonnes, source: a.source, statut: "OK", meta: true };
    /* Page ouverte, mais rien à en tirer : reste à savoir si elle publie une carte de visite
       (et n'y met pas de compteur) ou si elle n'en publie aucune (mur de connexion). */
    return { abonnes: null, statut: "OK", meta: /og:description|name=["']description["']/i.test(html) };
  } catch (_) { return { abonnes: null, statut: "SANS_REPONSE", meta: false }; }
  finally { clearTimeout(minuteur); }
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

/* MARQUEUR DE DÉPLOIEMENT — à incrémenter à CHAQUE modification de ce fichier.
   Même convention que api/miroir.js : un GET le renvoie sans appeler l'IA ni Google. Vérifier
   qu'une mise en ligne a réellement pris devient gratuit et instantané ; sans lui, il fallait
   payer une analyse complète pour le savoir — ou pousser sans vérifier, ce qui revient à
   deviner. */
const SENTINELLE_VERSION = "2026-08-13-13";

/* ═══ LE CONTRÔLE TECHNIQUE DU SITE ══════════════════════════════════════════════════════════
   Didier, 13/08/2026 : « je ne connais pas PageSpeed, c'est quoi ? » puis « c'est activé, fais
   le bouton ».
   Jusqu'ici, dans le calcul de la note, le site valait OUI ou NON. Un site qui met neuf secondes
   à s'afficher sur un téléphone recevait donc exactement les mêmes points qu'un site impeccable —
   alors qu'il fait fuir plus de clients qu'il n'en garde. On mesurait une présence, pas une
   qualité.
   ⚠️ CETTE MESURE PREND 10 À 30 SECONDES, et une analyse SENTINELLE n'en a que 60 en tout. La
   glisser dans le même appel ferait courir le risque de tout perdre pour un chiffre de confort.
   Elle a donc sa propre porte, déclenchée à la demande — et comme le dossier api/ contient déjà
   les DOUZE fonctions que Vercel autorise, c'est une porte dans ce fichier, pas un treizième. */
async function mesurerSite(url) {
  const key = process.env.GOOGLE_PLACES_KEY;
  if (!url || !/^https?:\/\//i.test(url)) return { ok: false, statut: "SANS_URL" };
  if (!key) return { ok: false, statut: "SANS_CLE" };
  const stop = new AbortController();
  const minuteur = setTimeout(() => stop.abort(), 45000);
  try {
    const u = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=" + encodeURIComponent(url)
      + "&strategy=mobile&category=performance&category=accessibility&category=seo&key=" + key;
    const r = await fetch(u, { signal: stop.signal });
    if (!r.ok) {
      const t = await r.text();
      /* Le mot de Google, tel quel : c'est lui qui désigne le réglage à corriger. */
      return { ok: false, statut: String(r.status), detail: (t || "").slice(0, 200) };
    }
    const d = await r.json();
    const lh = d.lighthouseResult || {};
    const cat = lh.categories || {}, aud = lh.audits || {};
    const note = c => (cat[c] && typeof cat[c].score === "number") ? Math.round(cat[c].score * 100) : null;
    const val = a => (aud[a] && aud[a].displayValue) ? String(aud[a].displayValue) : null;
    return {
      ok: true, statut: "OK",
      perf: note("performance"), acces: note("accessibility"), seo: note("seo"),
      /* Les deux durées que le dirigeant comprend sans traduction : quand quelque chose apparaît,
         et quand la page est réellement utilisable. */
      premier: val("first-contentful-paint"), utilisable: val("interactive"),
      teste: lh.finalUrl || url
    };
  } catch (_) { return { ok: false, statut: "SANS_REPONSE" }; }
  finally { clearTimeout(minuteur); }
}

export default async function handler(req, res) {
  if (req.method === "GET") { res.status(200).json({ fonction: "sentinelle", version: SENTINELLE_VERSION }); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Méthode non autorisée" }); return; }
  /* La porte du contrôle technique, AVANT tout le reste : elle n'a besoin ni du modèle, ni de la
     clé Anthropic, ni d'un jeton — l'appel est gratuit chez Google. */
  if (req.body && req.body.pagespeed) {
    res.status(200).json(await mesurerSite(String(req.body.pagespeed))); return;
  }
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
            /* ⚠️ ON DIT SUR QUELLE FICHE GOOGLE ON A MESURÉ. Tous les chiffres de SENTINELLE —
               la note, le nombre d'avis, la date du dernier avis, et donc l'indice — viennent
               d'UN lieu choisi par pickCanonical() à partir d'une recherche « nom + ville ». Si
               ce choix se trompe d'établissement, tout est faux ensemble et rien à l'écran ne
               permet de s'en apercevoir : on lit des chiffres cohérents… d'une autre entreprise.
               Le nom et l'adresse retenus rendent l'erreur visible en une seconde.
               Didier, 12/08/2026, sur Dronavia : « rebelote pour les avis Google ». */
            fiche._auraCalc = { note_google: (p.rating != null ? p.rating : null), nb_avis: (p.user_ratings_total || 0), site: !!site, poids: w, dernier_avis: det.dernierAvis, google_statut: det.statut || null, google_detail: det.detail || null,
              place_nom: p.name || null, place_adresse: p.formatted_address || null, place_id: p.place_id || null,
              /* L'adresse du site telle que GOOGLE la connaît : c'est elle qu'on mesurera, pas
                 celle que le modèle a pu recopier de travers. */
              site_url: site || null,
              avis_lus: det.avisLus || 0, avis_tri: !!det.tri,
              /* Les avis eux-mêmes : datés, notés, mot pour mot. C'est la seule chose de cette
                 fiche que le dirigeant peut relire ligne à ligne et reconnaître. */
              avis_recents: Array.isArray(det.textes) ? det.textes : [],
              /* Ce que porte la fiche Google elle-même : photos, horaires, téléphone, description. */
              fiche_google: det.fiche || null };
            /* ⚠️ ON EFFACE CE QUE LE MODÈLE AURAIT ÉCRIT LÀ. Le champ était sa porte d'entrée
               pour glisser la date d'une autre plateforme dans la ligne Google. Mesurée ou
               absente : il n'y a pas de troisième cas. */
            fiche.avisDernier = det.dernierAvis || null;
            /* La mesure vient d'arriver : tout ce qu'elle dément part maintenant, avant que la
               fiche ne soit enregistrée — donc avant l'écran, le PDF et le MIROIR. */
            retirerCeQueLaMesureDement(fiche);
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

    /* ═══ UNE PAGE DE RÉSEAU SANS AVIS N'EST PAS UNE PLATEFORME D'AVIS ═════════════════════
       Didier, 12/08/2026, capture de Dronavia : Facebook et LinkedIn occupaient deux lignes du
       tableau des avis, avec un tiret dans « Avis », un tiret dans « Note » et un tiret dans
       « Dernier avis ». Trois cases vides sur une ligne ne disent rien à personne — et la page
       Facebook, elle, était bien vivante.
       ⚠️ LE TRI SE FAIT ICI, PAS DANS LA TÊTE DU MODÈLE. On lui a demandé de choisir entre deux
       listes ; il classe Facebook en « plateforme d'avis » parce que Facebook PEUT en porter.
       C'est défendable, et invérifiable de sa part. Nous, après la lecture, nous SAVONS : si
       aucun avis n'a pu être mesuré sur cette page, elle n'a rien à faire dans un tableau d'avis.
       Elle descend donc dans « Vos pages publiques », où le nombre d'abonnés sera tenté juste
       après — c'est-à-dire là où elle a quelque chose à dire.
       ⚠️ ET SEULEMENT CELLES-LÀ : une page Facebook qui porte de VRAIS avis mesurés reste dans le
       tableau, à sa place. */
    /* ═══ LES REGISTRES, EN MÊME TEMPS QUE LE RESTE ═══════════════════════════════════════════
       Gratuit, sans clé, 4 secondes au plus. Un échec n'est jamais fatal : la fiche part sans. */
    try {
      const cpG = (fiche._auraCalc && fiche._auraCalc.place_adresse)
        ? ((String(fiche._auraCalc.place_adresse).match(/\b(\d{5})\b/) || [])[1] || null) : null;
      fiche._registre = await chercherRegistre(fiche.nom, fiche.ville, cpG);
    } catch (_) { fiche._registre = null; }

    /* ═══ LE SITE ET LES ANNONCES LÉGALES, EN PARALLÈLE ═══════════════════════════════════════
       Trois lectures indépendantes, lancées ensemble : en série elles ajouteraient quatorze
       secondes à une analyse qui en a soixante. Aucune n'est fatale — la fiche part sans. */
    try {
      const urlSite = (fiche._auraCalc && fiche._auraCalc.site_url) ? fiche._auraCalc.site_url : null;
      const siren = (fiche._registre && fiche._registre.siren) ? fiche._registre.siren : null;
      const [vu, quand, bod] = await Promise.all([
        urlSite ? lireSite(urlSite) : Promise.resolve(null),
        urlSite ? dateSite(urlSite) : Promise.resolve(null),
        siren ? chercherAnnonces(siren) : Promise.resolve(null)
      ]);
      fiche._siteVu = vu || null;
      if (quand && fiche._siteVu) { fiche._siteVu.derniere = quand.derniere; fiche._siteVu.pages = quand.pages; }
      fiche._bodacc = bod || null;
    } catch (_) {}

    try { descendreReseaux(fiche); } catch (_) {}

    /* ═══ LES PAGES PUBLIQUES : ON TENTE LE NOMBRE D'ABONNÉS ═══════════════════════════════
       ⚠️ ON EFFACE D'ABORD CE QUE LE MODÈLE AURAIT ÉCRIT LÀ. Même règle que la ligne Google :
       ce champ ne lui appartient pas. Sans cet effacement, un « 800 abonnés » supposé passerait
       pour une lecture — l'erreur exacte des trois dates fausses, transposée aux réseaux.
       Quatre pages au maximum, en parallèle, quatre secondes chacune : un mur de connexion ne
       doit jamais coûter l'analyse entière. */
    try {
      const cans = Array.isArray(fiche.canaux) ? fiche.canaux.slice(0, 4) : [];
      cans.forEach(c => { if (c) { delete c.abonnes; delete c.mesure; delete c.lecture; } });
      if (cans.length) {
        const lus = await Promise.all(cans.map(c => mesurerCanal(c && c.url)));
        cans.forEach((c, i) => {
          const m = lus[i];
          if (!c || !m) return;
          /* Le compte rendu de lecture voyage TOUJOURS, même quand il n'y a pas de chiffre :
             c'est lui qui distingue « page vide » de « page qui refuse ». */
          c.lecture = { statut: m.statut || "?", meta: !!m.meta };
          if (m.abonnes == null) return;
          c.abonnes = m.abonnes;
          c.abonnesQuoi = m.source;     // « abonnes » ou « jaime » : ce n'est pas la même chose
          c.mesure = true;              // le drapeau voyage AVEC le chiffre
        });
      }
      if (Array.isArray(fiche.canaux)) fiche.canaux.slice(4).forEach(c => { if (c) { delete c.abonnes; delete c.mesure; delete c.lecture; } });
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

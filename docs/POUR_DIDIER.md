# POUR DIDIER — ce que TU dois faire (langage simple)

_Ce document ne contient AUCUN code. Il liste seulement ce que toi seul peux créer/fournir, ce que ça coûte, et l'essentiel RGPD. Tu peux tout faire à la souris, sans être développeur._

---

## 1. Ce que tu dois créer toi-même (30–40 min, une seule fois)

### A. Créer le compte et le projet Supabase
Supabase = le « coffre-fort » en ligne où seront rangées les données de tous tes clients (à la place des fichiers GitHub et du stockage sur ton téléphone).

1. Va sur **https://supabase.com** → **Start your project** → connecte-toi (avec Google ou GitHub, c'est le plus simple).
2. Clique **New project**.
   - **Name** : `dbi360`.
   - **Database Password** : clique « Generate a password », **copie-le et garde-le** dans ton gestionnaire de mots de passe (tu n'en auras presque jamais besoin, mais ne le perds pas).
   - **Region** : choisis **impérativement une région européenne** → « **West EU (Paris)** » ou « **Central EU (Frankfurt)** ». (C'est la ligne la plus importante pour le RGPD.)
   - **Plan** : laisse **Free**.
3. Clique **Create new project** et attends ~2 minutes que ça s'installe.

### B. Récupérer les 3 informations à me transmettre
Dans ton projet Supabase, va dans **Settings** (roue crantée, en bas à gauche) → **API**. Tu y trouves :

| À copier | Où | Sensible ? |
|---|---|---|
| **Project URL** (`https://xxxx.supabase.co`) | section « Project URL » | Non |
| **anon public** (clé « publishable ») | section « Project API keys » | Non (elle peut être publique) |
| **service_role** (clé « secret ») | section « Project API keys » (cliquer « Reveal ») | **OUI — ultra secret** |

**Comment me les transmettre sans risque** : la `service_role` est la clé « passe-partout ». Ne la colle **pas** dans un email ni dans un chat public. Le mieux : tu les mets **toi-même** dans Vercel (étape C), et tu me dis juste « c'est fait ». Si tu préfères que je m'en occupe, on utilise un canal privé et tu la régénéreras après (bouton « Roll » dans Supabase).

### C. Mettre les clés dans Vercel (là où ton app est déployée)
1. Va sur **https://vercel.com** → ton projet **sentinelle-app** → **Settings** → **Environment Variables**.
2. Ajoute ces 3 variables (bouton « Add ») :
   - `SUPABASE_URL` = la Project URL
   - `SUPABASE_ANON_KEY` = la clé anon public
   - `SUPABASE_SERVICE_ROLE` = la clé service_role (secret)
3. Coche les 3 environnements (Production/Preview/Development) puis **Save**.
   > Ces variables ne sont visibles que par toi ; elles ne partent jamais dans le code public. C'est exactement comme `ANTHROPIC_API_KEY` et `GITHUB_TOKEN` que tu as déjà.

### D. Créer TON compte admin (plus tard, quand le login sera en place)
Quand j'aurai ajouté l'écran de connexion dans l'app :
1. Tu entres ton email **billard.did@gmail.com**, tu reçois un lien, tu cliques → tu es connecté.
2. Tu me préviens : je lance **une** petite commande (déjà écrite, en bas du fichier `schema.sql`) qui te transforme en **admin** (celui qui voit tous les clients). Après ça, la console t'est réservée.

**C'est tout pour toi.** Le reste (créer les tables, le login, la console) c'est du code que je fais.

---

## 2. Combien ça coûte ?

### Supabase — offre gratuite (Free)
Limites du plan gratuit (largement au-dessus de tes besoins actuels) :
- **500 Mo** de base de données. Un client génère quelques Ko par mesure → tu peux stocker **des centaines de clients et des dizaines de milliers de mesures** avant d'y toucher.
- **50 000 utilisateurs actifs/mois** pour la connexion. Tu en as quelques dizaines.
- **1 Go** de stockage fichiers, **5 Go** de transfert/mois.
- ⚠️ Un seul vrai piège du plan gratuit : le projet se **met en pause après ~1 semaine sans activité**. Comme tes clients et toi vous connecterez régulièrement, ça ne devrait pas arriver ; s'il se met en pause, un simple clic le réveille.

**Quand ça devient payant** : le plan **Pro à ~25 $/mois** (≈ 23 €) ne devient utile que si tu dépasses 500 Mo de base OU si tu veux supprimer la mise en pause et avoir les sauvegardes automatiques longues. **Concrètement : 0 € tant que tu es en phase de lancement.** On passera au Pro le jour où tu auras un vrai portefeuille de clients payants — donc quand ce sera rentable.

### Vercel
Tu restes sur **Hobby (gratuit)**. Supabase ne change rien à ce coût. (Rappel : les fonctions coupent à 60 s, mais l'app parlera à Supabase en direct, donc ce n'est pas un souci pour les données.)

### Anthropic (IA Haiku)
Inchangé — c'est déjà ce que tu paies au compteur pour les diagnostics.

**Total pour démarrer : 0 €/mois.** Premier coût possible : ~23 €/mois de Supabase Pro, mais seulement plus tard et seulement si le volume l'exige.

---

## 3. Check-list RGPD (courte — à recouper avec ton volet juridique)

Tu manipules des données **B2B** (des entreprises et leurs dirigeants), c'est le cas le plus léger, mais quelques réflexes :

- [ ] **Hébergement UE** : ✅ réglé si tu as bien choisi la région Paris/Frankfurt à l'étape A.2 (à vérifier, c'est le point n°1).
- [ ] **Minimisation** : on ne stocke que l'utile (nom d'entreprise, secteur, ville, email du dirigeant, indices de maturité). **Pas** de données sensibles, pas de données personnelles des salariés nominatives (les diagnostics humains restent **agrégés/anonymisés** — des indices, jamais « M. Untel a peur »).
- [ ] **Information & consentement** : à la première connexion, une phrase claire type « Vos données de diagnostic sont hébergées en UE (Supabase) et utilisées uniquement pour votre accompagnement DBi360 ». Ajouter une courte **politique de confidentialité** (page ou lien).
- [ ] **Base légale** : l'accompagnement que tu vends = **exécution du contrat** (base légale simple pour du B2B).
- [ ] **Droit d'accès / d'effacement** : tu dois pouvoir, sur demande d'un client, exporter ou **supprimer** son compte et ses données. C'est facile avec Supabase (supprimer l'entreprise supprime en cascade ses mesures — c'est déjà prévu dans le schéma).
- [ ] **Sécurité** : ✅ les données sont cloisonnées par la « Row Level Security » (un client ne voit jamais les données d'un autre), et la clé secrète reste dans Vercel.
- [ ] **Sous-traitant** : Supabase est ton **sous-traitant** au sens RGPD → note-le dans ton registre et vérifie qu'ils fournissent un **DPA** (Data Processing Agreement) — ils en ont un standard, à archiver dans ton volet juridique.
- [ ] **Benchmark sectoriel** (plus tard) : il ne sera diffusé qu'en **moyennes par secteur avec au moins 5 entreprises** → impossible de ré-identifier un client. C'est déjà la règle prévue.

---

## 4. La toute première chose à faire, maintenant
👉 **Créer le projet Supabase en région EU (Paris ou Frankfurt) — étape 1.A ci-dessus — et me confirmer que c'est fait.** Sans ça, rien d'autre ne peut démarrer. Tout le reste s'enchaîne ensuite.

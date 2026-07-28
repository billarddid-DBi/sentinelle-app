# BRIEF DE CONSTRUCTION — Parcours dirigeant SENTINELLE → BOUSSOLE

> **Statut :** validé par Didier Billard le 26/07/2026.
> **Objet :** construire les étapes 4 à 7 du parcours (les 5 questions, l'écran du chiffre, la question de maturité, l'aiguillage) et réorganiser les blocs existants.
> **Fichiers liés :** `docs/organigramme-modules.xlsx` (arbitrage vierge) · `docs/organigramme-PROPOSITION-CLAUDE.xlsx` (proposition) · `docs/parcours-cible.svg` / `.png` (schéma).

---

## 1. Le principe directeur

Trois règles, non négociables, qui tranchent tous les arbitrages :

1. **SENTINELLE dit CE QUI EST** (gratuit) — **BOUSSOLE dit QUOI FAIRE** (payant).
2. **On ne demande jamais rien avant d'avoir donné.** La création de compte est le seul péage avant la révélation.
3. **Le chiffre en euros n'est jamais inventé** — c'est le dirigeant qui le donne, via les 5 questions.

**Ce que cherche un dirigeant au quotidien** (position de Didier, à respecter partout) : **l'argent, le temps, et les problèmes quotidiens qui s'accumulent**. Pas sa note, pas ses avis Google. Le coût d'un problème en attente **augmente avec son âge** — d'où la logique de « pile qui vieillit » plutôt que de to-do list plate.

---

## 2. Le parcours cible en 8 étapes

| # | Étape | Durée | Accès | État |
|---|---|---|---|---|
| 0 | **Le pitch** — « Qui sait ce qu'un client trouve sur son entreprise ? » | 10 s | hors app | — |
| 1 | **Le compte** — nom, ville, email | 30 s | Gratuit ★ *le lead* | ✅ existe |
| 2 | **Le scan** — 30+ sources publiques | 40 s | Gratuit | ✅ existe |
| 3 | **La révélation** — « Voilà ce que les autres voient » | — | Gratuit | ✅ existe *(à réordonner)* |
| 4 | **La preuve publique** — avis, présence, plateformes, vigilance | — | Gratuit | ✅ existe |
| 5 | **Les 5 questions** | 90 s | Gratuit | ❌ **à construire** |
| 6 | **VOTRE CHIFFRE** + la 6ᵉ question | — | Gratuit | ❌ **à construire** |
| 7 | **BOUSSOLE** | — | 🔒 Payant | ✅ existe *(à enrichir)* |

Boucle de rétention : **le quotidien** (Point du matin), gratuit, il y revient chaque matin.

---

## 3. Les 5 questions — spécification exacte

**Contraintes communes :** aucune saisie clavier (curseurs et tuiles uniquement) · 90 secondes montre en main · une question par écran, avec un fil de progression (1/5 … 5/5) · pas de jargon.

### Q1 — « Vous êtes combien à faire tourner la boîte au quotidien ? »
- **Format :** curseur `1 → 10+`, valeur par défaut 2
- **Variable :** `personnes`

### Q2 — « Qu'est-ce qui vous mange le plus de temps en ce moment ? »
- **Format :** 6 tuiles, **choix unique**
- **Options :** `Les devis et les factures` · `Le téléphone et les rendez-vous` · `Les relances et les impayés` · `Le planning et l'équipe` · `La paperasse et l'administratif` · `Chercher des infos, retrouver des documents`
- **Variable :** `poste_principal` — **la question la plus rentable** : elle oriente les outils IA recommandés en BOUSSOLE

### Q3 — « Combien d'heures par semaine partent dans ces tâches-là ? »
- **Format :** curseur `1 h → 15 h`, valeur par défaut 5
- **Variable :** `heures_semaine`

### Q4 — « Aujourd'hui, qu'est-ce qui traîne et que vous n'arrivez pas à traiter ? »
- **Format :** 5 tuiles, **choix multiple**
- **Options :** `Des devis pas envoyés` · `Des appels pas rappelés` · `Des factures pas relancées` · `Des décisions pas prises` · `Rien, je suis à jour`
- **Variable :** `ce_qui_traine[]` — alimente **aussi** l'écran quotidien (la pile qui vieillit)

### Q5 — « Une heure de travail chez vous, ça vaut combien ? »
- **Format :** curseur `20 € → 200 €`, **pré-positionné selon le métier** (option (a) retenue : le curseur pré-réglé enlève la gêne)
- **Variable :** `cout_horaire`

---

## 4. L'écran du chiffre (waouh n°2)

### Calcul — **réutiliser la formule existante**, ne pas en inventer une autre
```
heures_an = personnes × heures_semaine × 45          (45 semaines travaillées)
euros_an  = arrondi(heures_an × cout_horaire / 100) × 100
soirees   = arrondi(heures_an / 8)
```
> ⚠️ C'est **exactement** la formule de `window.__bouSim` / `__sentSim` dans `index.html`. **Source unique obligatoire** — si elle change, elle change partout (même principe que `synthVals()`).

### Maquette
> ### 1 350 heures par an
> ### soit ≈ 67 500 €
> Sur **les devis et les factures**, principalement.
> Et en ce moment, **3 choses traînent** chez vous.
>
> *Ce chiffre est le vôtre — c'est vous qui venez de nous le donner.*

- Y **fusionner** le message de fierté / clôture (`fierte`) — un seul moment de clôture, pas deux.
- Conserver le bouton **« Recevoir mon récap par email »** (c'est ce qui capte les prospects froids).
- **Enrichir l'email récap** avec ce chiffre.

---

## 5. La 6ᵉ question + l'aiguillage

> **« Si on vous montrait comment récupérer une partie de ces heures, vous seriez prêt à changer votre façon de faire ? »**
>
> `Oui, dès maintenant` · `Oui, si c'est simple et progressif` · `J'ai besoin d'y réfléchir`

**Placement impératif : APRÈS le chiffre, jamais avant.** Posée avant, elle demande un engagement à quelqu'un qui n'a rien vu, et elle casse le rythme des 5 questions.

**Pourquoi 3 choix et pas oui/non :** ça segmente les leads (chaud / tiède / froid) et ça pose la première pierre de l'IAT (cf. agent `aura-humaine`).

| Réponse | Aiguillage |
|---|---|
| Oui, dès maintenant | → directement l'offre BOUSSOLE : *« On commence par le questionnaire dirigeant. »* |
| Oui, si c'est simple | → d'abord la liste des outils débloqués, **puis** l'offre (rassurer avant de vendre) |
| J'ai besoin d'y réfléchir | → récap par email + « on vous rappelle » — il reste dans la base |

---

## 6. Réorganisation des blocs existants

### 6.1 — Ce qui remonte dans la page de synthèse
| Bloc | Mouvement | Pourquoi |
|---|---|---|
| **Le coût de ne rien faire** (`coutInaction`) | sous-slide Potentiel → **page 1, position 5** | Seul bloc gratuit qui parle argent ; aujourd'hui enterré |
| **« Ce que dit votre note »** | position 4 → **position 3** | Le sens avant l'objectif |
| **« Votre potentiel »** | position 3 → **position 4** | — |

**Nouvel ordre de la page de synthèse :** 1 Titre+aura · 2 Carte d'identité · 3 Ce que dit votre note · 4 Votre potentiel · 5 **Le coût de ne rien faire** · 6 Vue d'ensemble (5 tuiles) · 7 Évolution · 8 Méthodologie · 9 À propos.

### 6.2 — Les 7 déplacements vers BOUSSOLE
1. **Comment monter votre note** — c'est le « comment » par définition
2. **Recherche par mot-clé métier**
3. **Carte de la concurrence** (Leaflet)
4. **Tableau comparatif des concurrents**
5. **Intelligence stratégique** (`intel.*`) — trop dense pour le gratuit, forte valeur perçue
6. **Avant / Après** (`avantApres`) — aujourd'hui gâché dans le rapport admin
7. *(déjà en réserve)* **Vos forces / radar 8 piliers** et **Outils IA détaillés** → à sortir de la réserve dans BOUSSOLE

### 6.3 — Les 8 fusions (doublons à supprimer)
- **L'écran « Votre identité publique » disparaît entièrement** : carte d'identité, valeurs affichées et image perçue sont **déjà** dans la page de synthèse (3 doublons).
- **Double pastille** de la sous-slide Potentiel = doublon de l'encart Potentiel.
- **Message de clôture / fierté** → fusionné dans l'écran du chiffre.
- **Carte de concurrence côté BOUSSOLE** = le **même** bloc que celui retiré de SENTINELLE — surtout ne pas le dupliquer.
- **Quotidien :** to-do du jour + décisions en attente + « ce qui traîne » = **une seule pile**, triée par âge.

### 6.4 — Le quotidien (Point du matin)
Nouvel ordre : 1 **Pouls trésorerie** (l'angoisse n°1 du matin) · 2 Climat équipe · 3 **CE QUI TRAÎNE** (pile unique, triée par ancienneté, avec le coût qui monte) · 4 Priorité du jour IA — **qui doit piocher dans la pile la plus vieille**, pas donner un conseil générique · 5 Série · 6 Cap du trimestre (🔒 payant).

---

## 7. Le prix — à trancher avant tout paiement réel

**Analyse :** à 2,99 €/mois, le parcours dit « vous perdez 67 500 €/an » puis « la solution coûte 36 €/an » — **ratio 1 : 1 900**, qui décrédibilise le chiffre ET la méthode. C'est aussi le pire des deux mondes : trop bas pour être un revenu (100 abonnés = 299 €/mois), assez haut pour créer de la friction et coûter des leads. Enfin, ça sabote l'ancrage du conseil L_IVE (comment vendre 3 000 € ce qui est affiché à 2,99 €).

**Coûts réels estimés :** 1 scan ≈ 0,10 € · 1 analyse concurrence ≈ 0,25 € · un abonné actif ≈ 0,85 €/mois · **frais Stripe sur 2,99 € ≈ 0,29 €, soit 10 % du prix** (2,5 % seulement sur l'annuel).

**Erreur factuelle à corriger :** « Annuel 24,90 € · 2 mois offerts » est faux — 2,99 × 12 = 35,88 €, donc **3,7 mois offerts (−31 %)**. Soit afficher −31 %, soit passer l'annuel à 29,90 €.

**Recommandation : 19 €/mois · 190 €/an.** C'est moins qu'une demi-heure du temps du dirigeant, c'est déductible, c'est sous le seuil de validation par un tiers, et le ratio devient 1 : 355 — un argument de vente au lieu d'une invitation au doute.

**Pour la démo immédiate : ne rien changer** (le paiement est simulé, aucun impact).

---

## 8. Contraintes techniques à respecter

- **`index.html` est un fichier unique** (PWA statique, JS vanilla, navigation par `showView()`). Pas de build, pas de framework.
- **Vercel Hobby = 12 fonctions serverless maximum.** Il y en a déjà 12 dans `api/` → **ne jamais créer un nouveau fichier d'API** : ajouter une branche (`type: '...'`) dans un fichier existant.
- **Stockage des réponses aux 5 questions :** recommandation = une table Supabase `dirigeant_reponses` (RLS sur `user_id`) + miroir dans `localStorage` pour l'affichage immédiat. Pour la démo, `localStorage` seul suffit. *(à trancher)*
- **Source unique des chiffres** : `synthVals(d)` pour l'IVE ; la formule heures/euros pour le chiffre. Ne jamais recalculer ailleurs (c'est ce qui avait créé l'incohérence page ↔ email).
- **Recalibration IVE** (note durcie sous 4,0 + `volFactor`) : `api/sentinelle.js` et `api/concurrents.js` doivent rester **strictement identiques**.
- **« On protège les slides »** : le radar 8 piliers, les opportunités détaillées, le simulateur et la carte concurrence **ne doivent jamais être supprimés du code**, même s'ils paraissent inutilisés — ils servent à BOUSSOLE.
- **Zéro jargon à l'écran** : bannir IVE/indice/aura/algorithme/diagnostic/pré-audit dans les libellés vus par le dirigeant.
- **Déploiement** : `git push origin main`, puis attendre en interrogeant l'URL avec un **marqueur unique** (ne pas réutiliser une chaîne qui existait déjà — erreur commise). Vercel est parfois lent : relancer avec un commit vide.
- **Comptes** : admin = `billard.did@gmail.com` · compte de test = `billard.d@outlook.fr` · bouton de remise à zéro dans `console.html` (nécessite `docs/reset-test-account.sql` exécuté une fois dans Supabase).

---

## 9. Critères d'acceptation

- [ ] Les 5 questions s'enchaînent sans aucune saisie clavier, avec un fil de progression, en moins de 90 s.
- [ ] L'écran du chiffre affiche des heures **et** des euros, cohérents avec le simulateur de BOUSSOLE (même formule).
- [ ] Le chiffre cite le poste choisi en Q2 et le nombre d'éléments cochés en Q4.
- [ ] La 6ᵉ question apparaît **après** le chiffre et oriente vers 3 sorties différentes.
- [ ] Le coût de ne rien faire est visible en page 1 sans avoir à cliquer.
- [ ] L'écran « Votre identité publique » a disparu et aucune information n'est perdue.
- [ ] La carte de la concurrence n'est plus accessible gratuitement et fonctionne dans BOUSSOLE.
- [ ] L'email récap contient le chiffre en euros.
- [ ] Aucune régression : la révélation reste atteignable en moins d'une minute, sans saisie.

---

## 10. Ce qui reste à trancher

1. **Le prix** — 2,99 € (statu quo) ou 19 €/190 € (recommandé) ?
2. **Le stockage des réponses** — `localStorage` seul (démo) ou table Supabase (durable) ?
3. **Les plateformes du secteur** — gratuites (proposition) ou payantes ? C'est très différenciant.
4. **Le cap du trimestre** — payant (proposition) ou gratuit ? C'est un bloc de rétention.
5. **L'arbitrage complet** — Didier remplit `organigramme-modules.xlsx`, puis différentiel ligne à ligne avec la proposition.

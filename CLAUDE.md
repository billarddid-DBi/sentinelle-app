# L'IVE — SENTINELLE / BOUSSOLE

Projet de Didier Billard (SASU CLIXYE), méthode **DBi360**.
Ce fichier est lu automatiquement à chaque session : il contient tout ce qui ne change pas.
La mission du jour arrive séparément.

---

## 1. Ce qu'est le projet

**L'IVE est un système qui observe le quotidien du dirigeant, comprend progressivement comment
son entreprise fonctionne réellement, et révèle les meilleures opportunités d'amélioration grâce
à l'IA.** Ce n'est pas un gestionnaire de tâches.

Il doit, à terme, savoir : recueillir tâches, idées et irritants (écrit **ou voix**) · les classer
par thème · reconnaître les tâches récurrentes · détecter les pertes de temps et les activités à
faible valeur · mesurer fréquence et durée · rapprocher ces observations des réponses de BOUSSOLE ·
ne proposer une solution IA **qu'une fois le besoin démontré** · puis mesurer les gains obtenus.

**Phrase directrice, à garder en tête pour tout arbitrage :**

> SENTINELLE observe l'extérieur.
> BOUSSOLE comprend l'intérieur.
> L'IVE apprend du quotidien.
> Les solutions ne sont proposées qu'après avoir compris le besoin réel.

### Les deux moitiés

| | SENTINELLE | BOUSSOLE |
|---|---|---|
| Répond à | « Voilà ce que les autres voient » | « Voilà ce qui se passe réellement » |
| Source | données **publiques** uniquement | ce que **le dirigeant** raconte |
| Montre | constats, image extérieure, potentiel, *existence* d'opportunités | causes, priorités, outils IA, plan, suivi |
| Ne montre jamais | quoi faire, comment, quel outil, dans quel ordre | — |
| Modèle | **gratuit** | **payant** (après la révélation) |

BOUSSOLE **commence par écouter**, pas par exposer ses outils.

---

## 2. Architecture

- `index.html` — **fichier unique**, PWA mobile, JS vanilla, navigation par `showView()`. Pas de build, pas de framework.
- `api/` — fonctions serverless Vercel. **Il y en a déjà 12, et le plan Hobby en autorise 12 au maximum.**
- `console.html` — espace administrateur (KPIs, remise à zéro d'un compte de test).
- Supabase — authentification, base Postgres, RLS, RPC `SECURITY DEFINER`, `is_admin()`.
- Déploiement : Vercel, sur `git push origin main`.
- Dossier local : `C:\Users\didie\sentinelle-app`

## 3. Comptes

- Administrateur : `billard.did@gmail.com`
- Compte de test : `billard.d@outlook.fr` — remise à zéro par le bouton dédié dans `console.html`
  (nécessite que `docs/reset-test-account.sql` ait été exécuté une fois dans Supabase).
- Ne jamais coder en dur un mot de passe. Ne jamais exposer la `service_role` côté client.

---

## 4. Les 6 règles non négociables

1. **SENTINELLE dit ce qui est (gratuit). BOUSSOLE dit quoi faire (payant).**
2. **On ne demande jamais d'effort avant d'avoir donné de la valeur.** La création de compte est le
   seul péage autorisé avant la première révélation. Cette révélation reste atteignable en **moins
   d'une minute, sans saisie clavier, sans entretien, sans formulaire long**.
3. **Le chiffre en euros n'est jamais inventé.** Il provient toujours d'une réponse du dirigeant.
4. **Zéro jargon** dans les textes visibles (voir § 5).
5. **On protège les blocs existants.** Ne jamais supprimer du code : le radar 8 piliers, les
   opportunités détaillées, le simulateur, la carte concurrence, les composants de mesure, et tout
   élément destiné au futur contenu BOUSSOLE. Ils peuvent être **masqués ou déplacés**, jamais effacés.
6. **L'IVE n'est pas un gestionnaire de tâches.** Il observe, apprend, détecte, explique, recommande,
   mesure — dans cet ordre.

---

## 5. Vocabulaire

### Bannis des textes affichés
`IVE` · `indice` · `aura` · `algorithme` · `pré-audit` · `scoring` · `maturité numérique` ·
`transformation digitale` · `workflow` · `process` · `KPI` · `coût de l'inaction`

Ces mots restent autorisés **dans le code** (noms de variables, de champs, de fonctions).

> Le mot **« diagnostic » est autorisé** : il fait partie du métier de Didier et il est déjà employé
> partout dans l'application.

### À utiliser à la place
`votre situation` · `ce que les autres voient` · `votre quotidien` · `le temps mobilisé` ·
`vos priorités` · `vos opportunités` · `votre plan` · `vos progrès`

### Ton
Jamais culpabilisant. Un chiffre est une **prise de conscience**, pas un reproche.
Proscrire : « mauvaise gestion », « inefficacité », « retard organisationnel », « perte certaine ».

> **Décision actée :** le bloc aujourd'hui intitulé « LE COÛT DE NE RIEN FAIRE » (champ `coutInaction`)
> s'affiche désormais sous le titre **« Ce que ça représente aujourd'hui »**. Le nom du champ ne change pas.

---

## 6. Règles UX

Mobile d'abord. Une seule idée par écran. Titres courts, textes courts, gros boutons, aucun tableau
complexe, aucun paragraphe long, animations sobres.

Dans tout parcours en plusieurs écrans : **progression visible** (`1/5`), **retour arrière possible**,
**réponses conservées**, **aucune perte de données** à la navigation.

Identité graphique : noir `#1C1C1C`, blanc, orange `#E8541A`, bleu `#2563EB` quand pertinent, cartes
arrondies, typographie claire, premium mais simple.

BOUSSOLE doit évoquer l'orientation, le cap, la compréhension, la progression — jamais un
interrogatoire, un formulaire administratif ou une vente forcée.

---

## 7. Contraintes techniques

### Vercel — 12 fonctions maximum
`api/` contient déjà 12 fichiers. **Ne jamais créer un nouveau fichier d'API.**
Pour tout nouveau besoin : ajouter une branche `type: '...'` dans une fonction existante.

### Source unique de calcul — règle absolue
Un chiffre affiché à deux endroits doit venir d'**une seule** fonction. Une incohérence page ↔ e-mail
a déjà été causée par un calcul dupliqué.

| Famille | Fonction unique | Appelée par |
|---|---|---|
| Note et potentiel | `synthVals(d)` | page de synthèse, e-mail, slides de détail |
| Heures et euros | `iveGain({personnes, heuresSemaine, coutHoraire})` → `{heuresAn, eurosAn, soirees}` | écran du chiffre, simulateur BOUSSOLE (`__bouSim`), charge utile e-mail, console |

> `window.__bouSim` **n'est pas** une source de calcul : c'est du câblage DOM (il lit `#sP/#sH/#sC` et
> écrit dans `#heroV/#heroSub`). Il doit **appeler** `iveGain`, pas contenir la formule.

Formule de référence (déjà en production, ne pas la modifier) :
```
heuresAn = personnes × heuresSemaine × 45
eurosAn  = Math.round(heuresAn × coutHoraire / 100) × 100
soirees  = Math.round(heuresAn / 8)
```

**Les fonctions serverless ne recalculent rien.** `api/facture-email.js` affiche les valeurs qu'il
reçoit dans la charge utile.

### Parité des deux API
`api/sentinelle.js` et `api/concurrents.js` doivent rester **strictement identiques** sur
`qScore`, `vScore`, `sScore`, `volFactor` et `compress`. Toute modification de l'un est appliquée
à l'autre dans le même commit.

### Nommage des données
**Clés en français**, cohérentes avec l'existant (`personnes`, `heuresSemaine`, `coutHoraire`…).
Ne pas mélanger français et anglais. Tout objet de réponses porte un numéro de version `v: 1`.

---

## 8. Déploiement

```
git add -A
git commit -m "…"
git push origin main
```
En cas de rejet : `git pull --rebase origin main` puis repousser.

Puis **vérifier que la bonne version est réellement en ligne** :
- interroger l'URL publique avec un **marqueur unique nouvellement ajouté** ;
- ne **jamais** réutiliser une chaîne déjà présente dans le fichier (erreur déjà commise : le test
  passait alors que l'ancienne version était servie) ;
- recharger le navigateur sans cache avant de tester.

Vercel est parfois lent. Si le push ne déclenche rien :
```
git commit --allow-empty -m "Relance déploiement Vercel"
git push origin main
```

`vercel.json` envoie déjà `Cache-Control: no-cache` sur `/` et `/index.html`.

---

## 9. Avant de dire « c'est fait »

Vérifier **dans le navigateur**, sur la version en ligne, après rechargement :
parcours complet · retours arrière · conservation des réponses · exactitude des calculs ·
cohérence écran / e-mail / console · affichage mobile · console sans erreur ·
aucun bloc protégé supprimé · compte administrateur et bouton de remise à zéro fonctionnels.

**Ne jamais annoncer une fonctionnalité en ligne sans l'avoir réellement constatée.**
Le code local qui compile ne prouve rien.

---

## 10. Format du compte rendu

1. **Modifications** — vues et fonctions créées ou modifiées, données stockées, textes ajoutés.
2. **Calculs** — quelle fonction, appelée où, confirmation de non-duplication.
3. **Stockage** — support, structure, comportement au retour de l'utilisateur.
4. **Tests** — navigateur, compte, parcours testés, résultats **observés**.
5. **Déploiement** — commit, statut, URL, marqueur unique contrôlé.
6. **Limites** — ce qui reste provisoire, simulé, non connecté ou à développer.

Rapporter fidèlement : un test qui échoue se dit, avec sa sortie. Une étape sautée se dit.

---

## 11. Décisions actées — ne pas les rouvrir

- **Recalibration de la note** (24/07/2026) : note Google durcie sous 4,0 + couplage volume × qualité
  (`volFactor`). Un gros volume d'avis médiocres ne gonfle plus la note. Ne pas revenir en arrière.
- **Espace unique** : un seul parcours pour tous ; `billard.did@gmail.com` débloque la vue consultant.
- **Concurrence, forces (radar), opportunités détaillées, simulateur** : retirés de l'affichage
  SENTINELLE, **conservés dans le code**, destinés à BOUSSOLE.
- **Tarif** : 2,99 €/mois et 24,90 €/an restent affichés (paiement simulé, aucun enjeu en démo).
  Le libellé « 2 mois offerts » est **faux** — c'est **−31 %**. À corriger au premier passage sur
  cet écran. Le vrai débat tarifaire (19 €/mois recommandé) se tranchera avant tout paiement réel.
- **Ce qui traîne** : dans le quotidien, la to-do, les décisions en attente et les retards forment
  **une seule pile triée par ancienneté**, pas trois listes.

---

## 12. Documents de référence

| Fichier | Contenu |
|---|---|
| `docs/brief-construction-parcours.md` | **La référence fonctionnelle** (validée le 26/07/2026) |
| `docs/organigramme-modules.xlsx` | Inventaire des 61 blocs, colonnes d'arbitrage |
| `docs/organigramme-PROPOSITION-CLAUDE.xlsx` | Proposition de réorganisation |
| `docs/parcours-cible.svg` / `.png` | Schéma du parcours en 8 étapes |
| `docs/reset-test-account.sql` | RPC de remise à zéro (admin) |

**Lire le brief avant toute modification fonctionnelle.**

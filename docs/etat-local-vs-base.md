# Ce qui vit encore dans le navigateur — inventaire du 01/08/2026

Établi après la question de Didier : « je ne veux rien en local ; déjà, si mon PC a un problème,
on perd tout. Il faut que l'ensemble de l'app soit en ligne. »

C'est la décision du 30/07 qui n'est pas terminée : **la base devient la vérité, le navigateur
n'est qu'un affichage.** Voici où on en est réellement, vérifié dans le code, pas de mémoire.

---

## 1. DÉJÀ EN BASE — une table dédiée, la base fait foi

| Donnée | Table |
|---|---|
| Tâches | `taches` |
| Décisions | `decisions` |
| Journées | `journees` |
| Feuille de route | `feuille_route` |
| Les 5 analyses (SENTINELLE, aura, BOUSSOLE, MIROIR, feuille) | `fiches` |
| Instantanés de trajectoire | `snapshots` |
| Événements d'usage | `events` |
| Questionnaire salariés — lien et réponses | `enquetes_salaries`, `reponses_salaries` |
| Entreprise | `entreprises` |

Ces données survivent à la perte de l'appareil. Le navigateur n'en garde qu'un cache.

---

## 2. DANS LE BLOC `pm_data` — sauvegardé, mais en vrac

Un seul JSON par entreprise : `pm` (tâches), `snaps`, `fr`, `next`, `diag`.
C'est un filet de sécurité hérité, pas une structure. Il double ce que les tables portent déjà.

---

## 3. ⚠️ UNIQUEMENT DANS LE NAVIGATEUR — perdu si l'appareil meurt

Classé par ce que ça coûte au dirigeant.

| Donnée | Clé | Ce qu'on perd |
|---|---|---|
| **Questionnaire dirigeant** | `ive_grille_v2_` | **40 à 200 réponses.** La matière première de la BOUSSOLE et du MIROIR. Une à deux heures de travail. |
| **Jetons** | `ive_jetons_v1_` | Le solde. Ni sauvegardé, ni vérifiable : il ne quitte JAMAIS le navigateur. Effacer le navigateur remet le compteur à neuf. |
| **Carte de la concurrence** | `ive_conc_v1_` | Une analyse **payée 4 jetons**. |
| Mot-clé de la concurrence | `ive_conc_kw_` | Une saisie. |
| Repères de fraîcheur | `ive_maj_v1_` | Ce qui dit au MIROIR qu'il doit être rafraîchi. |
| Simulateur de gain | `ive_simu_v1_` | Effectif, heures, coût horaire. |
| Ce qui est « fait » | `ive_faits_v1_` | Les états des tuiles d'accueil. |
| Détail par critère | `ive_detail_v1_` | Le détail d'une analyse. |
| Récurrences | `ive_recur_v1_`, `ive_recurdec_v1_` | Les tâches et décisions qui reviennent. |
| Coffre | `ive_coffre_v1_` | — |
| Identité (nom, ville) | `ive_ident_v1_` | Re-saisissable. |
| MIROIR affiché | `ive_miroir_v1_` | Cache : la fiche est en base (`fiches`). |
| Formule | `ive_plan_` | Doublé dans les métadonnées du compte. |

**Purement local et c'est très bien** : `dbi_accounts`, `dbi_last_mail`, `intro_vu` — préférences
d'appareil, elles n'ont rien à faire ailleurs.

---

## 4. L'ORDRE DANS LEQUEL LE FAIRE

Trois chantiers, du plus coûteux au moins coûteux **pour le dirigeant qui perd son appareil**.

### A. Le questionnaire dirigeant — le plus urgent
Une table `reponses_dirigeant` : une ligne par critère, clé `(entreprise_id, critere)`, avec la
note et « vu ». Une ligne par critère et non un bloc JSON, pour la même raison que les tâches :
deux appareils qui répondent ne s'écrasent pas.
C'est aussi ce qui rend la reprise Express → Complet solide, aujourd'hui portée par le seul
navigateur.

### B. Les jetons — le plus sensible
Aujourd'hui le solde est dans le navigateur : falsifiable en trente secondes depuis la console,
et remis à neuf par un simple nettoyage. Il faut une table `jetons` et un **décompte par RPC
`SECURITY DEFINER`** — c'était déjà écrit dans la décision du 30/07. Tant que ce n'est pas fait,
on ne peut pas vendre sérieusement des jetons.

### C. Le reste — mécanique
Concurrence, repères de fraîcheur, simulateur, faits, détail, récurrences. Aucun n'est
compliqué ; ils suivent le même patron que `snapshots`.

---

## 5. CE QU'IL FAUDRA NE PAS OUBLIER

Deux pièges déjà payés le 31/07, notés pour ne pas les refaire sur ces tables-ci :

1. **Ne pas laisser un cache vide effacer la base.** Les suppressions ne partent en base que si
   la base a été lue une fois. Sur un appareil neuf, le local est vide : sans ce garde-fou il
   efface tout.
2. **Un seul envoi à la fois, sur l'état relu au moment de l'envoi.** Deux gestes rapprochés
   lançaient deux envois concurrents, et le premier effaçait ce que le second venait d'ajouter.

Et celui du 01/08, qui vient d'être payé sur le questionnaire :
3. **Un ensemble vide n'écrase jamais un ensemble rempli.** Une grille reconstruite sans avoir
   retrouvé les réponses s'enregistrait par-dessus.

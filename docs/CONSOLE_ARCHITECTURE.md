# CONSOLE DE GESTION LIVE / DBi360 — Blueprint d'architecture

_Version 1.0 — 2026-07-19 — cible : Didier (propriétaire, non-développeur)_

---

## 0. Résumé de la décision (à lire en premier)

**Stack retenu : Supabase (région EU / Francfort ou Paris).**
- Postgres managé + **Auth** intégrée (email/mot de passe, magic link) + **API REST/JS auto-générée** + **Row Level Security (RLS)** native + hébergement **UE (RGPD)** + **free tier** largement suffisant pour démarrer.
- Pour un solo non-dev, c'est le meilleur rapport simplicité / puissance / conformité. Voir §6 pour la comparaison.

**Modèle en 3 étages :**
```
   [1] APP-DIRIGEANT (index.html sur Vercel)          [3] CONSOLE (page /console, même app, login admin)
        │  écrit SES données via SDK Supabase                 │  lit TOUTES les données via RLS "admin"
        │  (auth = le dirigeant connecté)                      │  (auth = Didier, rôle admin)
        ▼                                                      ▼
   ┌──────────────────────────────────────────────────────────────────┐
   [2]                    BASE CENTRALE SUPABASE (UE)
        Postgres + Auth + RLS  —  une seule source de vérité
   └──────────────────────────────────────────────────────────────────┘
```

**Recommandation d'hébergement de la console : page `/console` DANS la même app Vercel**, protégée par login admin + RLS (pas une app séparée). Justification en §5.

---

## 1. Le problème à résoudre

Aujourd'hui :
- **Aucune authentification** : tout le monde partage la même app.
- Les fiches sont des **fichiers JSON commités dans GitHub** via `api/save.js` (jeton `GITHUB_TOKEN`) → ne scale pas, pas de notion de "compte", pas de droits, dossiers `fiches/ boussoles/ miroirs/ auras/ feuilles/`.
- La progression du dirigeant (snapshots, feuille de route, chat) est en **localStorage par appareil** (`cp_snaps_<slug>`, `fr_<slug>`, `cp_next_<slug>`) → invisible pour Didier, perdue si changement d'appareil, non multi-comptes.

Didier veut une **console PC** pour : voir tous les clients, leur avancement, leur **fréquentation** (dernière connexion, nb de contrôles, régularité), **repérer qui stagne/régresse** pour appeler au bon moment, ouvrir la **fiche détaillée** d'un client, et plus tard un **benchmark sectoriel anonymisé**.

---

## 2. Les 3 étages en détail

### Étage 1 — App-dirigeant (existant, à faire évoluer)
- Reste le **`index.html` mono-fichier** sur Vercel. On ajoute juste le **SDK Supabase** (une balise `<script>` CDN) + un petit **écran de login**.
- Après connexion, le dirigeant a un **`user.id`** (fourni par Supabase Auth) et une **entreprise** rattachée.
- À chaque étape franchie (BOUSSOLE terminée, AURA, MIROIR, contrôle…), l'app **écrit dans Supabase** au lieu de (ou en plus de) localStorage :
  - un **snapshot** daté (indices IVE/IAT/IMH…),
  - la **feuille de route** (étapes + statuts),
  - un **event** de fréquentation (connexion, mesure, action).
- **localStorage reste comme cache offline** (voir MIGRATION_PLAN §3) : l'app écrit d'abord en local, puis "pousse" vers Supabase quand le réseau est là. Zéro régression pour l'utilisateur.

### Étage 2 — Base centrale Supabase (le cœur)
- Un seul projet Supabase, région UE. C'est la **source de vérité unique**.
- Tables principales (détail dans `schema.sql`) :
  1. `entreprises` — un client = une entreprise (nom, secteur, taille, ville…).
  2. `profils` — un utilisateur applicatif (lié à `auth.users`), avec un **rôle** (`dirigeant` ou `admin`) et un rattachement à une entreprise.
  3. `snapshots` — chaque mesure datée (IVE, IAT, IMH, piliers, indices, peurs, % avancement).
  4. `feuille_route` — la feuille de route en cours (étapes + statuts + chat).
  5. `events` — journal de fréquentation (login, mesure, ouverture, action) → alimente les alertes.
  - (optionnel) `fiches` — copie structurée des fiches SENTINELLE/BOUSSOLE/MIROIR/AURA (remplace les JSON GitHub).
- **RLS activée partout** : les règles de sécurité vivent DANS la base, pas dans le code app. Même si le code front a un bug, un dirigeant ne peut pas lire les données d'un autre.

### Étage 3 — Console (côté Didier, PC)
- Une **vue `/console`** (ou un onglet caché) dans le même `index.html`, accessible **uniquement après login admin**.
- La console lit **toutes** les entreprises, snapshots, feuille_route, events — grâce à une politique RLS "l'admin voit tout".
- Elle calcule côté client : avancement %, tendance IAT/IVE (↑/↓/→), dernière activité, fréquence, et **alertes** (stagnation / régression / silence).
- Maquette = `console_mockup.html`.

---

## 3. Flux de données (qui écrit / qui lit)

| Acteur | Écrit | Lit | Portée (RLS) |
|---|---|---|---|
| Dirigeant (app) | ses snapshots, sa feuille de route, ses events | **ses** données uniquement | `entreprise_id = son entreprise` |
| Didier (console) | rien (lecture seule au départ ; annotations plus tard) | **tout** | rôle `admin` → toutes lignes |
| Fonctions serverless `api/*.js` | via **service_role key** (côté serveur only) | tout | bypass RLS, jamais exposé au navigateur |

**Écriture typique depuis l'app-dirigeant (illustration, pseudo-code) :**
```js
// le dirigeant vient de terminer un CONTRÔLE
await supabase.from('snapshots').insert({
  entreprise_id: monEntrepriseId,
  d: '2026-07-19', ive: 62, iat: 58, imh: 51, image: 40, pot: 70,
  resist: 30, piliers: {...}, indices: {...}, peurs: 3, av: 45
});
await supabase.from('events').insert({ entreprise_id: monEntrepriseId, type: 'controle' });
```
`entreprise_id` n'est même pas falsifiable utilement : la RLS vérifie qu'il correspond bien à l'entreprise du user connecté.

**Lecture typique côté console :**
```js
// Didier (admin) — liste de tous les clients avec leur dernier snapshot
const { data } = await supabase.from('v_console_clients').select('*');
```
`v_console_clients` = une **vue SQL** qui pré-agrège (dernier snapshot, avant-dernier pour la tendance, dernière activité, nb de contrôles). Ça évite de faire les calculs lourds dans le navigateur.

---

## 4. Modèle d'authentification

- **Supabase Auth** gère l'inscription/connexion. Deux méthodes recommandées :
  - **Magic link** (le dirigeant reçoit un lien par email, pas de mot de passe à retenir) — le plus simple pour des TPE/PME.
  - ou email + mot de passe classique.
- **Rôles** : stockés dans `profils.role` (`'dirigeant'` par défaut, `'admin'` pour Didier uniquement). Le rôle est aussi copié dans les **JWT claims** via un trigger (ou lu par la politique RLS) pour que la base sache "qui es-tu".
- **Onboarding d'un nouveau client** : Didier crée l'entreprise + invite le dirigeant (email) depuis la console → Supabase envoie l'invitation → le dirigeant se connecte, son `profil` est déjà rattaché à la bonne entreprise. (Au démarrage, ça peut être fait à la main dans le tableau de bord Supabase.)
- **Compte admin de Didier** : créé une seule fois, `role='admin'`. C'est la seule porte d'entrée de la console.

---

## 5. Sécurité (RLS) et hébergement de la console

### 5.1 Row Level Security — le principe en une phrase
> Chaque requête arrive avec l'identité du user connecté (`auth.uid()`), et Postgres n'autorise à lire/écrire QUE les lignes que les politiques permettent pour ce user.

Politiques (détaillées et commentées dans `schema.sql`) :
- **Dirigeant** : `SELECT/INSERT/UPDATE` autorisés seulement si `entreprise_id` = l'entreprise de son profil.
- **Admin (Didier)** : `SELECT` autorisé sur **toutes** les lignes de toutes les tables (et plus tard `UPDATE` pour annoter).
- **`events`, `snapshots`, `feuille_route`** : mêmes règles (isolé par entreprise pour le dirigeant, tout pour l'admin).
- Les tables sont **`ENABLE ROW LEVEL SECURITY`** + **`FORCE`** → aucun accès par défaut, on ouvre uniquement ce qui est déclaré.

### 5.2 Les clés (à ne pas confondre)
| Clé | Où | Peut-on l'exposer au navigateur ? |
|---|---|---|
| `anon` (publishable) | dans `index.html` (front) | **Oui** — inoffensive, la RLS protège tout |
| `service_role` | **uniquement** dans les fonctions `api/*.js` (env Vercel) | **NON, jamais** — elle bypass la RLS |

### 5.3 Où héberger la console : recommandation
**→ Page `/console` dans la même app Vercel** (option A), plutôt qu'une app séparée (option B).

| Critère | A. Page `/console` même app | B. Mini-app séparée |
|---|---|---|
| Effort (solo non-dev) | **Faible** (un `showView('console')` + garde admin) | Plus élevé (2e projet, 2e déploiement) |
| Coût | **0** (même déploiement Vercel) | Potentiellement 2e projet |
| Sécurité | Bonne : la vraie barrière est la **RLS**, pas l'URL | Idem (RLS reste la barrière) |
| Maintenance | **1 seul dépôt, 1 seul login system** | 2 bases de code à garder alignées |
| Risque | La vue existe dans le bundle public mais **ne renvoie aucune donnée sans token admin** | Isolation "visuelle" un peu meilleure |

**Justification** : pour un non-dev, tout garder dans un seul fichier/déploiement est bien plus maintenable. La sécurité ne repose PAS sur le secret de l'URL `/console` (security by obscurity = faux) mais sur **l'authentification admin + la RLS**. Un curieux qui tape `/console` voit un écran de login et, sans compte admin, **la base ne lui renvoie rien**. On peut en plus masquer l'entrée (aucun lien visible) et exiger un re-login récent.

> Évolution possible plus tard : si la console devient riche (graphes lourds, export…), la sortir en sous-domaine `console.dbi360...` sur un 2e projet Vercel qui pointe la **même** base Supabase. La base ne bouge pas ; seul le front déménage. Migration indolore.

### 5.4 Contrainte Vercel Hobby 60 s
- La console et l'app **parlent surtout en DIRECT à Supabase** (SDK JS navigateur → Supabase), **sans passer par les fonctions `api/*.js`**. Donc la limite 60 s des serverless ne s'applique quasiment pas aux lectures/écritures de données.
- Les fonctions `api/*.js` restent utilisées seulement pour : appels **Anthropic Haiku** (déjà le cas) et, en option, tâches admin nécessitant `service_role` (invitations, agrégats benchmark). Ces appels restent courts (< 60 s).

---

## 6. Pourquoi Supabase et pas un autre (challenge de la reco)

| Option | Auth incluse | RLS / multi-tenant | UE / RGPD | Courbe pour non-dev | Verdict |
|---|---|---|---|---|---|
| **Supabase** | ✅ intégrée | ✅ Postgres RLS natif | ✅ région EU | ✅ tableau de bord clair, SQL standard | **RETENU** |
| Firebase (Firestore) | ✅ | ⚠️ règles propriétaires, NoSQL | ⚠️ Google, localisation moins nette | ✅ mais modèle NoSQL déroutant pour du reporting | Non : reporting/agrégats moins naturels, RGPD moins net |
| Neon + Auth.js | ❌ (à câbler soi-même) | ✅ Postgres | ✅ EU | ❌ beaucoup de plomberie auth | Non : trop de code pour un solo |
| Rester GitHub+localStorage | ❌ | ❌ | ⚠️ | — | Non : ne scale pas, pas de comptes |

**Conclusion** : Supabase coche tout, en particulier **Auth + RLS + Postgres + UE** dans un seul produit, avec un free tier qui suffit largement au volume actuel (quelques dizaines de clients, quelques milliers de lignes). Voir `POUR_DIDIER.md` pour les seuils de coût.

---

## 7. Ce que ça change concrètement (avant / après)

| | Avant | Après |
|---|---|---|
| Identité | aucune | login dirigeant / admin |
| Données dirigeant | localStorage (1 appareil) | Supabase (multi-appareils) + cache local |
| Fiches | JSON dans GitHub | table `fiches` (option) / GitHub gardé en secours au début |
| Vue de Didier | aucune | console `/console` temps réel |
| Alertes | aucune | stagnation / régression / silence |
| Sécurité | nulle | RLS par entreprise + rôle admin |

Le tout **sans casser l'app** : on ajoute une couche, on garde localStorage en filet, on migre étape par étape (voir `MIGRATION_PLAN.md`).

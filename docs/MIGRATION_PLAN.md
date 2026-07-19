# MIGRATION_PLAN — de localStorage+GitHub vers Supabase

_Objectif : passer à une base centrale multi-comptes SANS jamais casser l'app en production._
_Principe directeur : chaque étape est indépendante, testable, et réversible. localStorage reste un filet de sécurité (cache offline) tant que la base n'est pas 100 % fiable._

Rappel contraintes : `index.html` mono-fichier, JS vanilla, fonctions `api/*.js` (Node), Vercel **Hobby (coupe à 60 s)**, déploiement = `git push`. Le SDK Supabase parle **en direct** au navigateur → la limite 60 s ne concerne PAS les lectures/écritures de données.

---

## Étape 0 — Ce que Didier doit fournir (préalable, bloquant)
**Objectif** : disposer du projet Supabase et des clés.
- Actions de Didier (détaillées dans `POUR_DIDIER.md`) :
  1. Créer un projet **Supabase région EU** (Paris/Francfort).
  2. Transmettre : **Project URL**, clé **anon (publishable)**, clé **service_role** (secrète).
  3. Confirmer l'email admin (`billard.did@gmail.com`).
- **Fichiers touchés** : aucun (côté Didier uniquement).
- **Risque** : nul.
- **Test de validation** : je peux ouvrir le SQL Editor et voir un projet vide en région EU.

---

## Étape 1 — Provisioning de la base
**Objectif** : créer toutes les tables + RLS + vue console.
- Actions :
  1. Coller `schema.sql` dans **Supabase > SQL Editor > Run**.
  2. Vérifier dans **Table Editor** que les 6 tables existent et que "RLS enabled" est affiché partout.
  3. Ajouter les clés dans **Vercel > Settings > Environment Variables** :
     - `SUPABASE_URL`, `SUPABASE_ANON_KEY` (utilisables côté front),
     - `SUPABASE_SERVICE_ROLE` (côté serveur uniquement, pour `api/*.js`).
- **Fichiers touchés** : aucun dans l'app (juste config Vercel).
- **Risque** : faible (création de schéma, aucune donnée réelle en jeu).
- **Test de validation** : dans le SQL Editor, `select public.is_admin();` renvoie `false` (pas encore connecté) sans erreur ; `select * from v_console_clients;` renvoie 0 ligne sans erreur.

---

## Étape 2 — Authentification / login dans l'app
**Objectif** : un dirigeant peut se connecter ; Didier peut devenir admin. **Sans encore toucher au stockage des données.**
- Actions :
  1. Ajouter dans `index.html` le SDK Supabase par CDN :
     `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>`
     puis `const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);`
     (les 2 valeurs peuvent être injectées via une petite fonction `api/config.js` qui renvoie `{url, anonKey}`, pour ne pas les coder en dur.)
  2. Ajouter une **vue login** (`showView('login')`) : champ email → **magic link** (`sb.auth.signInWithOtp`). Simple, pas de mot de passe.
  3. Au chargement, si `sb.auth.getSession()` a une session → app normale ; sinon → écran login.
  4. Didier crée son compte via le magic link, puis (une fois) exécuter le `update ... set role='admin'` de la fin de `schema.sql`.
- **Fichiers touchés** : `index.html` (ajout login + garde), nouveau `api/config.js` (optionnel).
- **Risque** : moyen — **mitigé** en gardant l'app utilisable même non connecté au début (login optionnel derrière un flag `AUTH_ON=false`), puis on bascule `AUTH_ON=true` quand c'est validé.
- **Test de validation** : Didier reçoit le lien, se connecte, `select public.is_admin()` renvoie `true` pour lui ; un compte test "dirigeant" renvoie `false`.

---

## Étape 3 — Migration du stockage (le cœur)
**Objectif** : les snapshots + feuille de route s'écrivent dans Supabase, avec **localStorage conservé comme cache offline**.
- Stratégie **double écriture puis lecture prioritaire base** (pas de big-bang) :
  1. **3a — Écriture miroir** : là où l'app fait aujourd'hui `localStorage.setItem('cp_snaps_<slug>', ...)`, ajouter juste après un `sb.from('snapshots').insert(...)` (et idem feuille_route en **upsert** sur `entreprise_id`). L'app continue de lire localStorage → **zéro changement visible**, mais la base se remplit.
  2. **3b — Lecture base d'abord** : au chargement d'un client, tenter `sb.from('snapshots').select()` ; si OK, utiliser la base ET rafraîchir le cache localStorage ; si hors ligne, retomber sur localStorage. C'est le pattern "**base = vérité, localStorage = cache**".
  3. **3c — Import de l'historique existant** : petit script/one-shot dans la console navigateur qui lit les clés `cp_snaps_*`, `fr_*`, `cp_next_*` de l'appareil de Didier et les `insert` dans Supabase (une fois par appareil qui contient des données). Les JSON GitHub existants peuvent aussi être importés via un script `api/import.js` ponctuel (lecture GitHub → insert Supabase avec `service_role`), à supprimer ensuite.
  4. **Rattachement entreprise** : mapper le `slug` localStorage vers `entreprises.slug` (créer les entreprises manquantes). Le champ `slug` du schéma sert exactement à ça.
- **Fichiers touchés** : `index.html` (fonctions de save/load des snapshots et de la feuille de route). `api/save.js`/`api/history.js` **restent en place** au début (secours), on les débranche seulement en fin d'étape 3.
- **Risque** : c'est l'étape la plus sensible → la double écriture rend le retour arrière trivial (il suffit de continuer à lire localStorage).
- **Test de validation** : faire un contrôle sur un compte test → la ligne apparaît dans `snapshots` (Table Editor) ET l'app affiche toujours la trajectoire ; couper le wifi → l'app fonctionne encore via cache.

---

## Étape 4 — Build de la console
**Objectif** : Didier voit tous ses clients.
- Actions :
  1. Ajouter une **vue `/console`** (`showView('console')`) dans `index.html`, visible seulement si `is_admin()` (sinon message "accès réservé").
  2. Elle lit `sb.from('v_console_clients').select('*')` → remplit la liste + panneau d'alertes (le `statut` est déjà calculé côté SQL).
  3. La "fiche client" détaillée lit `snapshots` (trajectoire) + `feuille_route` + `events` pour l'entreprise cliquée.
  4. Reprendre le HTML/CSS de `console_mockup.html` en remplaçant les données factices par les appels Supabase.
- **Fichiers touchés** : `index.html` (nouvelle vue console).
- **Risque** : faible — lecture seule, aucune écriture, la RLS protège même en cas de bug.
- **Test de validation** : connecté en admin, la console liste les clients ; connecté en dirigeant, `/console` refuse l'accès et la base ne renvoie rien.

---

## Étape 5 — Events de fréquentation + alertes
**Objectif** : mesurer l'usage et alerter Didier quand un client stagne, régresse ou disparaît.
- Actions :
  1. Insérer un `events` aux moments clés : à la connexion (`type:'login'`), à chaque contrôle/BOUSSOLE/AURA/MIROIR, à chaque maj de feuille de route.
  2. La console utilise le champ `statut` de `v_console_clients` (déjà : `silence` > 45 j sans activité, `regression` si delta IAT/IVE < 0, `stagnation` si delta = 0) pour le panneau d'alertes et le tri.
  3. (Option) Une fonction `api/alertes.js` (cron Vercel quotidien, < 60 s) qui envoie à Didier un email récap des clients "à rappeler". Facultatif, peut venir plus tard.
- **Fichiers touchés** : `index.html` (appels `events.insert`), option `api/alertes.js`.
- **Risque** : faible.
- **Test de validation** : générer un event, vérifier `derniere_activite` et `actions_30j` dans `v_console_clients` ; simuler une baisse d'IAT → statut passe à `regression`.

---

## Étape 6 (plus tard) — Benchmark sectoriel anonymisé
**Objectif** : moyennes par secteur, sans exposer un client précis.
- Vue SQL agrégée `v_benchmark_secteur` (moyenne IAT/IVE par `secteur`, **avec seuil** : n'afficher un secteur que s'il compte ≥ 5 entreprises → anonymat). Accès admin (et plus tard, restitution agrégée au dirigeant).
- **Risque** : faible ; bien respecter le seuil d'anonymat (RGPD).

---

## Ordre récapitulatif et bascule "sans casse"
```
0 fournir clés  →  1 provisioning  →  2 auth (flag OFF puis ON)
   →  3 double écriture (base se remplit, localStorage reste vérité)
   →  3b lecture base d'abord (base devient vérité, localStorage = cache)
   →  3c import historique  →  4 console  →  5 events+alertes  →  6 benchmark
```
- On ne **débranche `api/save.js`/GitHub** qu'après avoir vérifié pendant quelques jours que la base reçoit bien tout (étape 3 stable).
- À aucun moment l'app n'est indisponible : chaque ajout est additif, protégé par un flag ou par le filet localStorage.

## Points de vigilance Vercel Hobby (60 s)
- Lectures/écritures data = **SDK navigateur → Supabase** : hors du périmètre des 60 s.
- Les seules fonctions serverless concernées (Anthropic Haiku, import ponctuel, alertes cron) restent des appels courts. L'import massif d'historique se fait par **petits lots** (ex 50 lignes/appel) pour ne jamais approcher 60 s.

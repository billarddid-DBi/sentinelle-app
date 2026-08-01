-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 1000 ENTREPRISES RATTACHÉES À UN SEUL COMPTE — DIAGNOSTIC
-- Constaté par Didier le 01/08/2026 via l'écran « Contrôle des données ».
--
-- ⚠️ CE FICHIER NE MODIFIE RIEN. Toutes les requêtes ci-dessous LISENT seulement.
--    Aucun DELETE, aucun UPDATE : les tâches, les réponses de salariés et les analyses sont
--    rattachées à un entreprise_id. Supprimer une entreprise sans savoir ce qui pend dessous,
--    c'est effacer des données du dirigeant.
--
-- ⚠️ CORRIGÉ APRÈS COUP : la première version filtrait sur `auth.uid()`. Dans l'éditeur SQL de
--    Supabase, on n'est PAS un utilisateur authentifié — auth.uid() y vaut NULL, et toutes ces
--    requêtes auraient répondu « 0 ligne » en silence. Le pire des résultats : un faux
--    soulagement. On passe donc par l'email, qui, lui, existe dans auth.users.
--
-- POURQUOI C'EST SÉRIEUX : chaque écran lit UNE entreprise (frEntreprise → ensure_my_entreprise).
-- Si le compte en a mille, les tâches enregistrées hier peuvent être rattachées à une autre que
-- celle lue aujourd'hui — elles existent en base mais n'apparaissent plus à l'écran.
-- ═══════════════════════════════════════════════════════════════════════════════════════════


-- ═══ ÉTAPE 1 — CE QU'IL FAUT SAVOIR AVANT DE COMPTER ═══════════════════════════════════════
-- Ces trois requêtes ne dépendent d'AUCUNE hypothèse sur les noms de colonnes. C'est
-- volontaire : je ne sais pas comment la table relie une entreprise à son propriétaire, et
-- deviner un nom de colonne produirait une erreur ou, pire, un chiffre faux.


-- 1.a — LA STRUCTURE DE LA TABLE. Quelle colonne porte le propriétaire ?
select column_name, data_type, is_nullable
from information_schema.columns
where table_name = 'entreprises'
order by ordinal_position;


-- 1.b — LE CODE DE ensure_my_entreprise. C'EST LA REQUÊTE LA PLUS IMPORTANTE.
-- Cette fonction vit uniquement dans Supabase, elle n'est pas dans le dépôt. C'est elle qui
-- décide de RÉUTILISER l'entreprise du compte ou d'en créer une nouvelle. Son code dira
-- pourquoi mille lignes ont été créées.
select pg_get_functiondef(p.oid) as code
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where p.proname = 'ensure_my_entreprise';


-- 1.c — LES INDEX DE LA TABLE. Y a-t-il une contrainte d'unicité ?
-- Sans elle, rien n'empêche la base d'accepter mille lignes pour un compte. Corriger la
-- fonction ne suffirait pas : un autre chemin recréerait des doublons.
select indexname, indexdef
from pg_indexes
where tablename = 'entreprises';


-- ═══ ÉTAPE 2 — LE COMPTAGE ══════════════════════════════════════════════════════════════════
-- ⚠️ À N'EXÉCUTER QU'APRÈS l'étape 1 : le nom de colonne « proprietaire » ci-dessous est une
--    HYPOTHÈSE. Si 1.a montre un autre nom (owner, user_id, profil_id…), il faut le remplacer
--    partout avant de lancer. Une requête qui échoue est sans danger ; une requête qui répond
--    « 0 » parce qu'elle regarde la mauvaise colonne, c'est un faux soulagement.


-- 2.a — LE VRAI NOMBRE. L'écran affiche « 1000 » parce que Supabase plafonne une lecture à
-- mille lignes. Seul count(*) dit la vérité.
select count(*) as nb_entreprises
from entreprises
where proprietaire = (select id from auth.users where email = 'billard.did@gmail.com');


-- 2.b — LE RYTHME DES CRÉATIONS. Il raconte l'origine : toutes à la même minute = une boucle ;
-- étalées sur des semaines = une création à chaque passage.
select date_trunc('hour', cree_le) as heure, count(*) as creees
from entreprises
where proprietaire = (select id from auth.users where email = 'billard.did@gmail.com')
group by 1
order by 1 desc
limit 40;


-- 2.c — VIDES OU PLEINES : LE CHIFFRE QUI DÉCIDE DE TOUT.
-- Il sépare les lignes supprimables sans risque de celles qui portent des données du dirigeant.
-- On ne supprimera que ce dont on a la PREUVE qu'il est vide.
with charge as (
  select e.id,
         (select count(*) from taches            t where t.entreprise_id = e.id)
       + (select count(*) from reponses_salaries r where r.entreprise_id = e.id)
       + (select count(*) from enquetes_salaries q where q.entreprise_id = e.id)
       + (select count(*) from snapshots         s where s.entreprise_id = e.id)
       + (select count(*) from decisions         d where d.entreprise_id = e.id)
       + (select count(*) from feuille_route     f where f.entreprise_id = e.id)
       + (select count(*) from journees          j where j.entreprise_id = e.id)
       + (select count(*) from pm_data           p where p.entreprise_id = e.id) as n
  from entreprises e
  where e.proprietaire = (select id from auth.users where email = 'billard.did@gmail.com')
)
select count(*)                      as total,
       count(*) filter (where n = 0) as vides,
       count(*) filter (where n > 0) as avec_donnees
from charge;


-- 2.d — LE DÉTAIL DES ENTREPRISES QUI PORTENT QUELQUE CHOSE.
-- Celles-ci demanderont une décision, une par une : laquelle garder, quoi rattacher.
with charge as (
  select e.id, e.nom, e.cree_le,
         (select count(*) from taches            t where t.entreprise_id = e.id) as taches,
         (select count(*) from reponses_salaries r where r.entreprise_id = e.id) as reponses,
         (select count(*) from enquetes_salaries q where q.entreprise_id = e.id) as enquetes,
         (select count(*) from snapshots         s where s.entreprise_id = e.id) as snapshots,
         (select count(*) from decisions         d where d.entreprise_id = e.id) as decisions,
         (select count(*) from feuille_route     f where f.entreprise_id = e.id) as feuille,
         (select count(*) from journees          j where j.entreprise_id = e.id) as journees,
         (select count(*) from pm_data           p where p.entreprise_id = e.id) as pm_data
  from entreprises e
  where e.proprietaire = (select id from auth.users where email = 'billard.did@gmail.com')
)
select *
from charge
where taches + reponses + enquetes + snapshots + decisions + feuille + journees + pm_data > 0
order by cree_le asc;

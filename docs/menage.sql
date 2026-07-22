-- =============================================================================
-- MÉNAGE BASE SENTINELLE — garder l'essentiel, nettoyer les tests
-- À exécuter dans Supabase → SQL Editor.
-- On GARDE : comptes billard.did@gmail.com + billard.d@orange.fr
--            fiches SENTINELLE de DRONAVIA + ROMANA.
-- On SUPPRIME tout le reste (scans de test, comptes de test).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ÉTAPE 1 — INVENTAIRE (lance d'abord ces 2 SELECT pour voir ce qu'il y a)
-- -----------------------------------------------------------------------------

-- 1a. Toutes les fiches SENTINELLE enregistrées
select id, nom, ville, email, statut, cree_le::date as cree, maj_le::date as maj
from public.sentinelles
order by cree_le;

-- 1b. Tous les comptes (dirigeants) + l'entreprise saisie à l'inscription
select u.email,
       u.created_at::date as cree,
       u.raw_user_meta_data->>'entreprise' as entreprise,
       u.raw_user_meta_data->>'ville'      as ville,
       u.raw_user_meta_data->>'sent_nom'   as fiche_liee
from auth.users u
order by u.created_at;

-- -----------------------------------------------------------------------------
-- ÉTAPE 2 — NETTOYAGE DES FICHES SENTINELLE (garde ROMANA + DRONAVIA)
--           s_norm plie les accents + minuscule + alphanum : "La Romana" -> "laromana"
-- -----------------------------------------------------------------------------

-- Aperçu de ce qui SERA supprimé (vérifie avant de supprimer) :
select id, nom, ville, cree_le::date
from public.sentinelles
where nom_norm not like '%romana%'
  and nom_norm not like '%dronavia%'
order by cree_le;

-- Suppression (décommente la ligne ci-dessous pour l'exécuter) :
-- delete from public.sentinelles
--  where nom_norm not like '%romana%' and nom_norm not like '%dronavia%';

-- -----------------------------------------------------------------------------
-- ÉTAPE 3 — NETTOYAGE DES COMPTES DE TEST
--   ⚠️ Le plus SÛR : Supabase → Authentication → Users → supprimer à la main
--      tous les comptes SAUF billard.did@gmail.com et billard.d@orange.fr
--      (le dashboard gère proprement les dépendances/cascade).
--
--   Aperçu SQL des comptes qui seraient supprimés :
select u.email, u.created_at::date, u.raw_user_meta_data->>'entreprise' as entreprise
from auth.users u
where lower(u.email) not in ('billard.did@gmail.com','billard.d@orange.fr')
order by u.created_at;

--   Suppression SQL (à n'utiliser QUE si le dashboard n'est pas pratique ;
--   si une contrainte de clé étrangère bloque, supprime d'abord les lignes liées
--   dans profils/entreprises/pm_data pour ces utilisateurs) :
-- delete from auth.users
--  where lower(email) not in ('billard.did@gmail.com','billard.d@orange.fr');

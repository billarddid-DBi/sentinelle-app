-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- SUPPRIMER UN DOSSIER SANS RIEN DÉTRUIRE — 09/08/2026
--
-- ⚠️ À EXÉCUTER DANS L'ÉDITEUR SQL DE LA BASE DE L'IVE (cpsgkfgyywljwdnfalno).
--
-- POURQUOI. Didier, 09/08/2026 : « donne-moi la possibilité de supprimer dans la console — tu
-- ajoutes un bouton supprimer, mais tu crées un onglet pour les comptes supprimés. »
--
-- ⚠️ UN ONGLET « SUPPRIMÉS » VEUT DIRE QUE RIEN N'EST DÉTRUIT. C'est un archivage : la ligne
-- reste, elle sort des listes. Et c'est heureux, parce qu'une vraie suppression de `entreprises`
-- emporte DOUZE tables en cascade — analyses, feuille de route, tâches, décisions, journées,
-- instantanés, événements, quotidien, réponses du dirigeant, espace de données, mouvements ET
-- SOLDE DE JETONS — et détache le compte du dirigeant (`profils.entreprise_id` en set null),
-- qui se réveille sans entreprise, sans jetons et sans historique.
--
-- Une date plutôt qu'un booléen : on saura QUAND, et « restaurer » n'est qu'une remise à NULL.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

alter table public.entreprises add column if not exists supprime_le timestamptz;

-- Les listes lisent toutes « supprime_le is null » : l'index évite de parcourir les archives
-- à chaque affichage, et il ne porte que sur les lignes vivantes.
create index if not exists entreprises_vivantes
  on public.entreprises (nom) where supprime_le is null;

-- ═══ CONTRÔLES ══════════════════════════════════════════════════════════════════════════════
--   select count(*) filter (where supprime_le is null)  as vivantes,
--          count(*) filter (where supprime_le is not null) as archivees
--     from public.entreprises;
--   -- attendu au départ : toutes vivantes, aucune archivée
--
--   -- Pour tout ramener si un jour on se trompe :
--   -- update public.entreprises set supprime_le = null where supprime_le is not null;

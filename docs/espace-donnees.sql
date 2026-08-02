-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- L'ESPACE DE TRAVAIL PASSE EN BASE — 02/08/2026
--
-- ⚠️ CE FICHIER MODIFIE LA BASE : une table. Il ne supprime rien et ne touche à aucune
--    fonction existante.
--
-- ═══ CE QU'ON SAUVE ════════════════════════════════════════════════════════════════════════
-- Onze jeux de données ne vivaient que dans le navigateur. Un ordinateur en panne et tout
-- partait. Les deux qui coûtent vraiment :
--   · la CARTE DE LA CONCURRENCE, payée 4 jetons ;
--   · le COFFRE, qui est précisément ce qui évite de repayer une analyse déjà produite —
--     le perdre, c'est régénérer, donc redébiter.
-- Les autres (simulateur, repères de fraîcheur, mot-clé, identité, détail, récurrences,
-- rapport BOUSSOLE, états des tuiles) sont moins chers mais se re-saisissent à la main.
--
-- ═══ POURQUOI UNE SEULE TABLE, ET PAS ONZE ═════════════════════════════════════════════════
-- Ce sont onze petits blocs JSON déjà sérialisés, sans requête à faire dessus : personne ne
-- filtrera jamais « les entreprises dont le simulateur dépasse 12 heures ». Onze tables, ce
-- serait onze migrations, onze politiques RLS et onze occasions d'en oublier une.
-- Une clé (entreprise_id, cle) suffit — et un magasin ajouté demain ne demande AUCUN SQL.
--
-- ⚠️ Ce raisonnement ne vaut PAS pour le questionnaire dirigeant ni pour les tâches : là, deux
-- appareils écrivent la même chose en même temps, et il faut une ligne par élément pour qu'ils
-- ne s'écrasent pas. Ici chaque bloc n'a qu'un auteur à la fois, et l'arbitrage se fait sur
-- l'horodatage. Ne pas confondre les deux cas.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

create table if not exists public.espace_donnees (
  entreprise_id uuid        not null references public.entreprises(id) on delete cascade,
  cle           text        not null,          -- le préfixe du magasin, ex. 'ive_conc_v1_'
  valeur        jsonb       not null,
  maj_le        timestamptz not null default now(),
  primary key (entreprise_id, cle)
);

alter table public.espace_donnees enable row level security;

-- Le dirigeant lit et écrit SON espace, et rien d'autre. Contrairement aux jetons, il n'y a ici
-- aucune raison de lui interdire l'écriture : ce sont ses propres données de travail, et rien
-- de ce qu'il pourrait y mettre ne lui donne d'avantage — le solde, lui, est ailleurs.
drop policy if exists espace_lire on public.espace_donnees;
create policy espace_lire on public.espace_donnees
  for select using (is_admin() or entreprise_id = my_entreprise());
drop policy if exists espace_ecrire on public.espace_donnees;
create policy espace_ecrire on public.espace_donnees
  for insert with check (is_admin() or entreprise_id = my_entreprise());
drop policy if exists espace_maj on public.espace_donnees;
create policy espace_maj on public.espace_donnees
  for update using (is_admin() or entreprise_id = my_entreprise())
           with check (is_admin() or entreprise_id = my_entreprise());
drop policy if exists espace_suppr on public.espace_donnees;
create policy espace_suppr on public.espace_donnees
  for delete using (is_admin() or entreprise_id = my_entreprise());

grant select, insert, update, delete on public.espace_donnees to authenticated;


-- ═══ APRÈS INSTALLATION ════════════════════════════════════════════════════════════════════
-- 1. La table doit être vide et cloisonnée. Dans cet éditeur, auth.uid() est NULL, donc la
--    politique ne s'applique pas au rôle propriétaire : ce contrôle-ci ne prouve QUE l'existence.
--      select count(*) from espace_donnees;
--
-- 2. ⚠️ LE SEUL ESSAI QUI COMPTE : ouvrir l'application, aller sur la carte de la concurrence
--    (ou bouger le simulateur), puis relancer :
--      select cle, jsonb_typeof(valeur) as type, pg_column_size(valeur) as octets, maj_le
--        from espace_donnees order by maj_le desc;
--    Des lignes doivent apparaître, une par magasin touché.
--
-- 3. LA VRAIE PREUVE, celle qui répond à « si mon PC a un problème » : ouvrir l'application
--    depuis un AUTRE navigateur (ou une fenêtre privée), se connecter, et retrouver la carte
--    de la concurrence sans la repayer.

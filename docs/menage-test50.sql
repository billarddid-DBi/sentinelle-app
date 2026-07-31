-- =============================================================================
--  MENAGE DES 50 COMPTES DE SIMULATION
--  A coller dans Supabase > SQL Editor.
--
--  Ecrit AVANT toute creation de compte de test (31/07/2026), pour qu'aucune
--  donnee de simulation ne puisse rester coincee dans la base de production.
--
--  CONVENTION DE NOMMAGE — rien d'autre n'est touche :
--     comptes      : test50-01@dbi360.test  ...  test50-50@dbi360.test
--     entreprises  : nom commencant par 'ZZTEST '
--     sentinelles  : nom commencant par 'ZZTEST '
--  Le compte de Didier (billard.did@gmail.com) et le compte de test habituel
--  (billard.d@outlook.fr) ne correspondent a AUCUN de ces motifs.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- PARTIE A — INVENTAIRE. A executer EN PREMIER, ne supprime rien.
--            Donne exactement ce qui sera efface.
-- -----------------------------------------------------------------------------
select 'comptes de test'      as objet, count(*) as nombre from auth.users          where email like 'test50-%@dbi360.test'
union all
select 'entreprises de test',        count(*) from public.entreprises   where nom like 'ZZTEST %'
union all
select 'fiches liees',               count(*) from public.fiches        f join public.entreprises e on e.id=f.entreprise_id        where e.nom like 'ZZTEST %'
union all
select 'quotidien (pm_data) lie',    count(*) from public.pm_data       p join public.entreprises e on e.id=p.entreprise_id        where e.nom like 'ZZTEST %'
union all
select 'instantanes lies',           count(*) from public.snapshots     s join public.entreprises e on e.id=s.entreprise_id        where e.nom like 'ZZTEST %'
union all
select 'feuilles de route liees',    count(*) from public.feuille_route r join public.entreprises e on e.id=r.entreprise_id        where e.nom like 'ZZTEST %'
union all
select 'evenements lies',            count(*) from public.events        v join public.entreprises e on e.id=v.entreprise_id        where e.nom like 'ZZTEST %'
union all
select 'sentinelles de test',        count(*) from public.sentinelles   where nom like 'ZZTEST %'
order by 1;

-- Controle de securite : cette requete doit renvoyer 0 ligne.
-- Si elle renvoie quelque chose, NE PAS executer la partie B et me prevenir.
select id, email from auth.users
where email like 'test50-%@dbi360.test'
  and email in ('billard.did@gmail.com','billard.d@outlook.fr');


-- -----------------------------------------------------------------------------
-- PARTIE B — SUPPRESSION. A executer seulement apres avoir lu la partie A.
--            Tout est dans une seule transaction : en cas d'erreur, rien n'est
--            supprime. Les tables liees partent en cascade (fiches, pm_data,
--            snapshots, feuille_route, events suivent leur entreprise ;
--            profils et boussole_reponses suivent leur compte).
-- -----------------------------------------------------------------------------
begin;

  delete from public.sentinelles  where nom   like 'ZZTEST %';
  delete from public.entreprises  where nom   like 'ZZTEST %';
  delete from auth.users          where email like 'test50-%@dbi360.test';

commit;


-- -----------------------------------------------------------------------------
-- PARTIE C — VERIFICATION APRES MENAGE. Les huit lignes doivent afficher 0.
-- -----------------------------------------------------------------------------
select 'comptes de test'      as objet, count(*) as reste from auth.users        where email like 'test50-%@dbi360.test'
union all
select 'entreprises de test',        count(*) from public.entreprises   where nom like 'ZZTEST %'
union all
select 'sentinelles de test',        count(*) from public.sentinelles   where nom like 'ZZTEST %'
union all
select 'fiches orphelines',          count(*) from public.fiches        where entreprise_id is not null
                                                 and entreprise_id not in (select id from public.entreprises)
union all
select 'profils orphelins',          count(*) from public.profils       where id not in (select id from auth.users)
order by 1;

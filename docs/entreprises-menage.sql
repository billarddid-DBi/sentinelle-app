-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- MÉNAGE DES ENTREPRISES ORPHELINES — 01/08/2026
--
-- À exécuter APRÈS docs/ensure-my-entreprise-correction.sql. Sinon on vide pendant que ça se
-- remplit.
--
-- ⚠️ CE FICHIER EST EN DEUX PARTIES.
--    · La PARTIE A ne fait que LIRE. On la lance en premier, on regarde les chiffres.
--    · La PARTIE B SUPPRIME. Elle est volontairement laissée EN COMMENTAIRE : rien ne part
--      tant que la partie A n'a pas montré ce qu'on retire. Le 31/07, un exemple de SQL
--      exécutable a été pris pour une consigne et a ressuscité une tâche archivée — on ne
--      refait pas la même erreur avec des suppressions en masse.
-- ═══════════════════════════════════════════════════════════════════════════════════════════


-- ═══ PARTIE A — LECTURE SEULE ══════════════════════════════════════════════════════════════

-- A.0 — LA VÉRIFICATION QUE LA FUITE EST FERMÉE.
-- auth.uid() vaut NULL dans cet éditeur : c'est exactement le cas qui créait une ligne à chaque
-- appel. Les deux comptages doivent être IDENTIQUES.
select count(*) as avant from entreprises;
select ensure_my_entreprise('essai apres correction') as doit_etre_null;
select count(*) as apres from entreprises;


-- A.1 — L'ÉTAT DES LIEUX. Combien au total, combien rattachées à un compte, combien orphelines.
-- Une entreprise « rattachée » est celle qu'un profil désigne : c'est le seul lien qui existe.
select count(*)                                                            as total,
       count(*) filter (where exists (select 1 from profils p
                                       where p.entreprise_id = e.id))      as rattachees,
       count(*) filter (where not exists (select 1 from profils p
                                           where p.entreprise_id = e.id))  as orphelines
from entreprises e;


-- A.2 — PARMI LES ORPHELINES, LESQUELLES PORTENT ENCORE DES DONNÉES ?
-- C'EST LA REQUÊTE QUI DÉCIDE. Une orpheline VIDE ne manquera à personne. Une orpheline qui
-- porte des tâches ou des réponses de salariés, c'est le travail de quelqu'un : on ne la
-- supprime pas, on la garde de côté et on regarde à qui la rendre.
with orph as (
  select e.id, e.nom, e.cree_le,
         (select count(*) from taches            t where t.entreprise_id = e.id)
       + (select count(*) from reponses_salaries r where r.entreprise_id = e.id)
       + (select count(*) from enquetes_salaries q where q.entreprise_id = e.id)
       + (select count(*) from snapshots         s where s.entreprise_id = e.id)
       + (select count(*) from decisions         d where d.entreprise_id = e.id)
       + (select count(*) from feuille_route     f where f.entreprise_id = e.id)
       + (select count(*) from journees          j where j.entreprise_id = e.id)
       + (select count(*) from pm_data           m where m.entreprise_id = e.id)
       + (select count(*) from fiches            h where h.entreprise_id = e.id) as n
  from entreprises e
  where not exists (select 1 from profils p where p.entreprise_id = e.id)
)
select count(*)                      as orphelines,
       count(*) filter (where n = 0) as vides_supprimables,
       count(*) filter (where n > 0) as portent_des_donnees
from orph;


-- A.3 — LE DÉTAIL DE CELLES QUI PORTENT QUELQUE CHOSE.
-- Si A.2 rend 0 dans la colonne « portent_des_donnees », cette requête ne rendra rien et le
-- ménage est simple. Sinon, chaque ligne demande une décision.
with orph as (
  select e.id, e.nom, e.cree_le,
         (select count(*) from taches            t where t.entreprise_id = e.id) as taches,
         (select count(*) from reponses_salaries r where r.entreprise_id = e.id) as reponses,
         (select count(*) from enquetes_salaries q where q.entreprise_id = e.id) as enquetes,
         (select count(*) from snapshots         s where s.entreprise_id = e.id) as snapshots,
         (select count(*) from decisions         d where d.entreprise_id = e.id) as decisions,
         (select count(*) from feuille_route     f where f.entreprise_id = e.id) as feuille,
         (select count(*) from journees          j where j.entreprise_id = e.id) as journees,
         (select count(*) from pm_data           m where m.entreprise_id = e.id) as pm_data,
         (select count(*) from fiches            h where h.entreprise_id = e.id) as fiches
  from entreprises e
  where not exists (select 1 from profils p where p.entreprise_id = e.id)
)
select *
from orph
where taches+reponses+enquetes+snapshots+decisions+feuille+journees+pm_data+fiches > 0
order by cree_le;


-- ═══ PARTIE B — LA SUPPRESSION ═════════════════════════════════════════════════════════════
-- ⚠️ NE PAS EXÉCUTER AVANT D'AVOIR LU LES RÉSULTATS DE A.2 ET A.3.
--    Ces lignes sont en commentaire. Les décommenter est un acte volontaire.
--
-- CE QU'ELLE RETIRE, ET RIEN D'AUTRE : les entreprises qu'AUCUN profil ne désigne ET qui ne
-- portent AUCUNE donnée dans les neuf tables. Les deux conditions, pas une seule.
--
-- delete from entreprises e
--  where not exists (select 1 from profils p where p.entreprise_id = e.id)
--    and not exists (select 1 from taches            t where t.entreprise_id = e.id)
--    and not exists (select 1 from reponses_salaries r where r.entreprise_id = e.id)
--    and not exists (select 1 from enquetes_salaries q where q.entreprise_id = e.id)
--    and not exists (select 1 from snapshots         s where s.entreprise_id = e.id)
--    and not exists (select 1 from decisions         d where d.entreprise_id = e.id)
--    and not exists (select 1 from feuille_route     f where f.entreprise_id = e.id)
--    and not exists (select 1 from journees          j where j.entreprise_id = e.id)
--    and not exists (select 1 from pm_data           m where m.entreprise_id = e.id)
--    and not exists (select 1 from fiches            h where h.entreprise_id = e.id);
--
-- Puis on recompte, pour voir ce qui reste :
-- select count(*) from entreprises;

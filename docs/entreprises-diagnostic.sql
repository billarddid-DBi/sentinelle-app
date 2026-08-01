-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- 1000 ENTREPRISES RATTACHÉES À UN SEUL COMPTE — DIAGNOSTIC
-- Constaté par Didier le 01/08/2026 via l'écran « Contrôle des données ».
--
-- ⚠️ CE FICHIER NE MODIFIE RIEN. Toutes les requêtes ci-dessous LISENT seulement.
--    Aucun DELETE, aucun UPDATE : on regarde avant de toucher, parce que les tâches, les
--    réponses de salariés et les analyses sont rattachées à un entreprise_id. Supprimer une
--    entreprise sans savoir ce qui pend dessous, c'est effacer des données du dirigeant.
--
-- POURQUOI C'EST SÉRIEUX : chaque écran lit UNE entreprise (frEntreprise → ensure_my_entreprise).
-- Si le compte en a mille, les tâches enregistrées hier peuvent être rattachées à une autre que
-- celle lue aujourd'hui — elles existent en base mais n'apparaissent plus à l'écran.
--
-- À EXÉCUTER DANS : https://supabase.com/dashboard/project/_/sql/new
-- (choisir le projet SENTINELLE, puis coller une requête à la fois)
-- ═══════════════════════════════════════════════════════════════════════════════════════════


-- ── 1. COMBIEN, EXACTEMENT ? ────────────────────────────────────────────────────────────────
-- L'écran affiche « 1000 » parce que Supabase plafonne une lecture à mille lignes. Le vrai
-- nombre est peut-être bien supérieur : c'est count(*) qui le dit, pas une liste.
select count(*) as nb_entreprises
from entreprises
where proprietaire = auth.uid();


-- ── 2. QUAND ONT-ELLES ÉTÉ CRÉÉES ? ─────────────────────────────────────────────────────────
-- Le rythme raconte l'origine. Toutes le même jour à la même minute = une boucle. Étalées sur
-- des semaines = une création à chaque passage sur un écran.
select date_trunc('hour', cree_le) as heure,
       count(*)                    as creees
from entreprises
where proprietaire = auth.uid()
group by 1
order by 1 desc
limit 40;


-- ── 3. LESQUELLES PORTENT VRAIMENT QUELQUE CHOSE ? ──────────────────────────────────────────
-- LA REQUÊTE QUI COMPTE. Elle sépare les entreprises vides — supprimables sans risque — de
-- celles qui portent des données du dirigeant. On ne supprime que ce dont on a la preuve
-- qu'il est vide.
select e.id,
       e.nom,
       e.cree_le,
       (select count(*) from taches            t where t.entreprise_id = e.id) as taches,
       (select count(*) from reponses_salaries r where r.entreprise_id = e.id) as reponses,
       (select count(*) from enquetes_salaries q where q.entreprise_id = e.id) as enquetes,
       (select count(*) from snapshots         s where s.entreprise_id = e.id) as snapshots,
       (select count(*) from decisions         d where d.entreprise_id = e.id) as decisions,
       (select count(*) from feuille_route     f where f.entreprise_id = e.id) as feuille,
       (select count(*) from journees          j where j.entreprise_id = e.id) as journees,
       (select count(*) from pm_data           p where p.entreprise_id = e.id) as pm_data
from entreprises e
where e.proprietaire = auth.uid()
order by (taches + reponses + enquetes + snapshots + decisions + feuille + journees + pm_data) desc,
         e.cree_le asc
limit 60;


-- ── 4. LE RÉSUMÉ EN UNE LIGNE ───────────────────────────────────────────────────────────────
-- Combien sont vides, combien portent quelque chose. C'est ce chiffre qui dira si le ménage
-- est simple (999 vides) ou délicat (des données éparpillées sur des dizaines de lignes).
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
  where e.proprietaire = auth.uid()
)
select count(*)                          as total,
       count(*) filter (where n = 0)     as vides,
       count(*) filter (where n > 0)     as avec_donnees
from charge;


-- ── 5. LA CAUSE : LE CODE DE ensure_my_entreprise ───────────────────────────────────────────
-- Cette fonction vit UNIQUEMENT dans Supabase, elle n'est pas dans le dépôt — donc je ne peux
-- pas la lire d'ici. C'est elle qui décide de RÉUTILISER l'entreprise du compte ou d'en créer
-- une nouvelle. Le résultat de cette requête est ce qu'il me faut pour corriger la cause.
select pg_get_functiondef(p.oid)
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where p.proname = 'ensure_my_entreprise';


-- ── 6. Y A-T-IL UNE CONTRAINTE D'UNICITÉ ? ──────────────────────────────────────────────────
-- Sans index unique sur le propriétaire, rien n'empêche la base d'accepter mille lignes. C'est
-- le garde-fou qui manque probablement : la fonction peut être corrigée, mais tant que la base
-- accepte les doublons, un autre chemin les recréera.
select i.indexname, i.indexdef
from pg_indexes i
where i.tablename = 'entreprises';

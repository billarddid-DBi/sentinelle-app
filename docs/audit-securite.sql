-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- AUDIT DE SÉCURITÉ — 01/08/2026
--
-- ⚠️ CE FICHIER NE MODIFIE RIEN. Quatre requêtes de lecture, qui répondent à quatre questions
--    qu'on ne peut PAS trancher depuis le code : seule la base sait ce qu'elle protège.
--
-- POURQUOI MAINTENANT. Deux défauts de la même famille sont apparus aujourd'hui :
--   · ensure_my_entreprise créait une entreprise à chaque appel SANS session (auth.uid() NULL) —
--     mille lignes ;
--   · l'écran « Contrôle » lisait une table sans filtre et j'ai cru à une fuite alors que la
--     règle était bonne.
-- Dans les deux cas, la vérité était dans la base, pas dans le code. On va donc la lire.
-- ═══════════════════════════════════════════════════════════════════════════════════════════


-- ── 1. QUELLES TABLES NE SONT PAS PROTÉGÉES ? ───────────────────────────────────────────────
-- LA REQUÊTE LA PLUS IMPORTANTE. Sans RLS, n'importe quel compte connecté lit et écrit TOUT.
-- La clé « anon » de Supabase est publique par construction — elle est dans le code de la page,
-- visible par n'importe qui. Ce n'est pas un secret : c'est la RLS qui protège, elle seule.
select c.relname                as table_name,
       c.relrowsecurity         as rls_activee,
       (select count(*) from pg_policies p
         where p.tablename = c.relname and p.schemaname = 'public') as nb_regles
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by c.relrowsecurity asc, c.relname;
-- ⚠️ Toute ligne avec rls_activee = false est une table ouverte à tous.
-- Une table avec RLS activée mais 0 règle est FERMÉE à tous (sauf admin) — c'est l'inverse du
-- problème, mais ça casse l'application silencieusement.


-- ── 2. LES FONCTIONS QUI S'EXÉCUTENT AVEC TOUS LES DROITS ───────────────────────────────────
-- SECURITY DEFINER = la fonction ignore la RLS. C'est nécessaire (compter des jetons, supprimer
-- un compte) mais chacune doit vérifier elle-même QUI l'appelle. ensure_my_entreprise ne le
-- faisait pas : elle créait une entreprise pour un appelant anonyme.
-- La colonne `verifie_l_appelant` cherche « auth.uid() » dans le corps : ce n'est pas une preuve
-- formelle, c'est un repère pour savoir lesquelles relire.
select p.proname                                   as fonction,
       p.prosecdef                                 as security_definer,
       (pg_get_functiondef(p.oid) ilike '%auth.uid()%') as verifie_l_appelant
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('ensure_my_entreprise','sentinelle_get','sentinelle_save','sentinelle_check',
                    'enquete_ouvrir','reponse_salarie_envoyer','create_handoff',
                    'claim_my_handoffs','admin_reset_test_account','creer_facture',
                    'supprimer_mon_compte','my_entreprise','is_admin')
order by p.prosecdef desc, p.proname;
-- ⚠️ Une fonction security_definer = true ET verifie_l_appelant = false mérite une relecture.


-- ── 3. QUI PEUT APPELER QUOI ────────────────────────────────────────────────────────────────
-- « public » inclut les visiteurs NON connectés. Une fonction sensible ne devrait être ouverte
-- qu'à « authenticated », voire à personne (appelée seulement par une autre fonction).
select p.proname as fonction,
       coalesce(array_to_string(p.proacl::text[], ' | '), 'par defaut (tout le monde)') as droits
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('ensure_my_entreprise','sentinelle_save','admin_reset_test_account',
                    'creer_facture','supprimer_mon_compte','reponse_salarie_envoyer')
order by p.proname;


-- ── 4. LE PLAFOND DES RÉPONSES SALARIÉS EST-IL TENU PAR LA BASE ? ───────────────────────────
-- L'application annonce « jusqu'à 10 personnes ». Si ce plafond n'est vérifié que dans le
-- navigateur, il ne vaut rien : le lien du questionnaire est public, sans compte.
select pg_get_functiondef(p.oid) as code_reponse_salarie_envoyer
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'reponse_salarie_envoyer';
-- Chercher dans le résultat : un compte des réponses existantes et un refus au-delà de 10.
-- S'il n'y en a pas, n'importe qui ayant le lien peut envoyer mille réponses.

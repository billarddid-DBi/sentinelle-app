-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- LE QUESTIONNAIRE SALARIÉS : DOUBLON SUPPRIMÉ — 02/08/2026
--
-- ⚠️ CE FICHIER A DÉJÀ ÉTÉ EXÉCUTÉ le 02/08/2026. Il est ici pour la trace ; le rejouer ne
--    ferait rien de plus (le `drop` est `if exists`), mais relisez avant.
--
-- ═══ CE QU'ON A TROUVÉ ═════════════════════════════════════════════════════════════════════
-- DEUX versions de `reponse_salarie_envoyer` coexistaient :
--   · 8 paramètres (oid 18282) — insérait SANS la colonne `indices` ;
--   · 9 paramètres (oid 18292) — insérait `indices`, avec `p_indices … DEFAULT '{}'`.
--
-- POURQUOI C'ÉTAIT SÉRIEUX. `indices`, ce sont les 8 INDICES HUMAINS dont le MIROIR se sert
-- pour doser son plan. Une réponse passée par la mauvaise version arrive muette : le MIROIR
-- travaille alors sur les 6 domaines seuls, sans savoir ce qui coince À L'INTÉRIEUR de chacun.
-- Et le `DEFAULT` sur le 9ᵉ paramètre rendait un appel à 8 arguments compatible avec LES DEUX —
-- l'ambiguïté se serait résolue silencieusement, pas toujours du bon côté.
--
-- Vérifié avant de supprimer : les deux seuls appels de l'application (index.html, ahEnvoyer et
-- le parcours salarié) passent bien NEUF paramètres nommés.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

drop function if exists public.reponse_salarie_envoyer(
  text, text, text, jsonb, integer, integer, jsonb, jsonb);

-- ⚠️ ⚠️ LA SEULE FONCTION VOLONTAIREMENT OUVERTE AUX VISITEURS SANS COMPTE. ⚠️ ⚠️
-- Ne PAS la fermer lors d'un futur audit : le salarié n'a pas de compte, il arrive par un lien
-- `?rep=<jeton>`. C'est l'exception assumée à la fermeture du 01/08 (docs/fermer-acces-anonyme.sql),
-- et elle est bornée par la fonction elle-même :
--   · le jeton doit exister dans `enquetes_salaries` ;
--   · l'enquête doit être `active` ;
--   · le nombre de réponses doit rester sous `enquetes_salaries.plafond` (vérifié EN BASE, donc
--     un lien diffusé largement ne peut pas remplir la table).
grant execute on function public.reponse_salarie_envoyer(
  text, text, text, jsonb, integer, integer, jsonb, jsonb, jsonb) to anon, authenticated;


-- ═══ ÉTAT CONSTATÉ LE 02/08/2026 APRÈS CORRECTION ══════════════════════════════════════════
-- Une seule fonction, 9 paramètres. plafond = 10 (conforme à ce qu'annonce l'écran),
-- enquête active, 3 réponses, 0 nom en double.
--
-- ── CE QUI RESTE OUVERT, ET QUI N'EST PAS URGENT ───────────────────────────────────────────
-- Rien n'empêche un salarié de répondre DEUX FOIS sous le même nom. Deux réponses du même nom
-- faussent la mesure de la DISPERSION — et c'est la dispersion qui porte le diagnostic, pas la
-- moyenne. Constaté à 0 aujourd'hui, donc laissé tel quel. La requête de surveillance :
--
--   select e.nom as entreprise, q.plafond, q.active,
--          (select count(*) from reponses_salaries r where r.entreprise_id = q.entreprise_id) as reponses,
--          (select count(*) from (select nom from reponses_salaries r2
--                                  where r2.entreprise_id = q.entreprise_id
--                                  group by nom having count(*) > 1) x) as noms_en_double
--     from enquetes_salaries q left join entreprises e on e.id = q.entreprise_id;
--
-- Le correctif, le jour où le chiffre ne sera plus nul : un index unique
-- (entreprise_id, lower(trim(nom))) et un `on conflict do update` — la dernière réponse
-- remplace la précédente, plutôt que de s'y ajouter.

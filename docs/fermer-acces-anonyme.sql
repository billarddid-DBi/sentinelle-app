-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- FERMER L'ACCÈS ANONYME AUX QUATRE FONCTIONS OUVERTES — 01/08/2026
--
-- ⚠️ CE FICHIER MODIFIE LES DROITS. Il ne touche à aucune donnée, ne supprime rien, et se
--    défait en une ligne (voir tout en bas).
--
-- ═══ CE QU'ON A TROUVÉ ═════════════════════════════════════════════════════════════════════
-- Quatre fonctions étaient exécutables par TOUT LE MONDE, y compris sans compte :
--   sentinelle_get · sentinelle_save · sentinelle_check · create_handoff
-- Le résultat de l'audit le dit sans ambiguïté : `=X/postgres` (le rôle PUBLIC) et
-- `anon=X/postgres` (les visiteurs non connectés).
--
-- POURQUOI C'EST SÉRIEUX. Ces fonctions sont SECURITY DEFINER : elles IGNORENT la RLS. La table
-- `sentinelles` est pourtant fermée à tous sauf l'administrateur — ces fonctions sont donc le
-- seul chemin vers les analyses, et ce chemin n'avait pas de serrure.
-- La clé « anon » de Supabase est publique par construction : elle est écrite dans le code de la
-- page, lisible par n'importe qui en trois clics. Ce n'est pas un secret, ça n'a pas à en être
-- un — mais cela veut dire que « exécutable par anon » signifie littéralement « exécutable par
-- n'importe qui sur Internet ».
--
-- Concrètement, ce que ça permettait : lire l'analyse SENTINELLE de n'importe quelle entreprise
-- sans l'avoir payée, et surtout en ÉCRIRE une par-dessus celle d'un client.
--
-- ═══ POURQUOI FERMER NE CASSE RIEN ═════════════════════════════════════════════════════════
-- Vérifié dans le code avant d'écrire ce fichier : ces quatre fonctions ne sont appelées que
-- depuis index.html, dans l'application, après connexion. Jamais par les fonctions Vercel
-- (elles n'y apparaissent pas), jamais par la page du salarié (qui passe par
-- reponse_salarie_envoyer, protégée par son jeton et laissée ouverte volontairement).
-- ═══════════════════════════════════════════════════════════════════════════════════════════

revoke execute on function public.sentinelle_get(text, text)   from public, anon;
revoke execute on function public.sentinelle_save(text, text, jsonb, text, text) from public, anon;
revoke execute on function public.sentinelle_check(text, text) from public, anon;
revoke execute on function public.create_handoff(text, text, jsonb) from public, anon;

grant execute on function public.sentinelle_get(text, text)    to authenticated;
grant execute on function public.sentinelle_save(text, text, jsonb, text, text) to authenticated;
grant execute on function public.sentinelle_check(text, text)  to authenticated;
grant execute on function public.create_handoff(text, text, jsonb) to authenticated;


-- ═══ SI UNE DES LIGNES ÉCHOUE ══════════════════════════════════════════════════════════════
-- Ce sera une erreur « function does not exist » : la signature (les types des paramètres) ne
-- correspond pas. Elle se lit avec :
--
--   select p.proname, pg_get_function_identity_arguments(p.oid) as signature
--   from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--   where n.nspname = 'public'
--     and p.proname in ('sentinelle_get','sentinelle_save','sentinelle_check','create_handoff');
--
-- Recopier la signature exacte dans les lignes ci-dessus. Une ligne qui échoue n'empêche pas
-- les autres de passer, mais elle laisse SA fonction ouverte.


-- ═══ VÉRIFICATION ══════════════════════════════════════════════════════════════════════════
-- Relancer la requête de l'audit : plus aucune des quatre ne doit montrer `anon=X` ni `=X`.
--
--   select p.proname, coalesce(array_to_string(p.proacl::text[], ' | '), 'PAR DEFAUT') as droits
--   from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--   where n.nspname = 'public'
--     and p.proname in ('sentinelle_get','sentinelle_save','sentinelle_check','create_handoff');
--
-- Attendu : `postgres=X/postgres | authenticated=X/postgres | service_role=X/postgres`.
--
-- ⚠️ PUIS TESTER DANS L'APPLICATION, c'est le seul essai qui compte : lancer une SENTINELLE et
--    ouvrir un écran qui la relit. Si quelque chose casse, la ligne pour rouvrir est :
--
--   grant execute on function public.sentinelle_get(text, text) to anon;
--
--
-- ═══ CE QUE CECI NE RÈGLE PAS ══════════════════════════════════════════════════════════════
-- Fermer aux anonymes limite le risque à vos clients ENTRE EUX. Un client connecté peut encore
-- appeler sentinelle_save sur le nom d'une autre entreprise. La vraie serrure serait un contrôle
-- DANS chaque fonction — vérifier que l'entreprise visée est bien celle de l'appelant, comme le
-- fait ensure_my_entreprise depuis ce matin. Cela demande de relire leur code :
--
--   select pg_get_functiondef(p.oid) from pg_proc p
--   join pg_namespace n on n.oid = p.pronamespace
--   where n.nspname = 'public' and p.proname = 'sentinelle_save';

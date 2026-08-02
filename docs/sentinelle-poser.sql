-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- LA FICHE EST POSÉE PAR LE SERVEUR — 02/08/2026
--
-- ⚠️ CE FICHIER MODIFIE LA BASE : une fonction créée, une fonction retirée aux clients.
--    Il ne supprime aucune donnée.
--
-- ⚠️ ⚠️ CE FICHIER SE JOUE EN DEUX TEMPS, DE PART ET D'AUTRE DE LA MISE EN LIGNE. ⚠️ ⚠️
--
--    Tout exécuter d'un coup laisse une fenêtre pendant laquelle les analyses ne
--    s'enregistrent plus — dans un sens comme dans l'autre :
--      · SQL entier puis déploiement → l'ancienne application appelle `sentinelle_save`,
--        qui vient de lui être retirée. Analyse affichée, jamais rangée.
--      · Déploiement puis SQL → la nouvelle application appelle `sentinelle_poser`, qui
--        n'existe pas encore. Même résultat.
--
--    ORDRE SANS TROU :
--      1. PARTIE 1 ci-dessous (créer sentinelle_poser). Les deux versions marchent alors.
--      2. Mise en ligne de l'application.
--      3. Vérifier qu'une analyse s'enregistre bien.
--      4. PARTIE 2 tout en bas (retirer sentinelle_save aux clients) — c'est elle qui ferme.
--
-- ═══ CE QU'ON FERME ════════════════════════════════════════════════════════════════════════
-- Le navigateur recevait la fiche de `/api/sentinelle`, puis la renvoyait à Supabase. Il
-- pouvait donc en renvoyer une AUTRE. La garde posée ce matin vérifie qui appelle, la forme et
-- la taille — jamais la SINCÉRITÉ du contenu. Tant que le navigateur écrit, une fiche forgée
-- reste possible.
--
-- ═══ CE QUI DÉBLOQUAIT LE CHANTIER ═════════════════════════════════════════════════════════
-- On croyait le verrou hors de portée : `p_html` est fabriqué depuis l'écran (le radar est
-- converti en image depuis le canvas) et ne peut pas déménager côté serveur.
-- Vérification faite : PERSONNE ne lit la colonne `html`. Ni `sentinelle_get` (qui sélectionne
-- nom, ville, adresse, fiche, historique, maj_le), ni `sentinelle_check`, ni aucune fonction
-- Vercel, ni la console. C'était un PDF jamais construit.
-- En cessant de la stocker, le navigateur n'a plus RIEN à écrire — et le verrou devient simple.
-- Les fiches HTML déjà enregistrées ne sont pas touchées. Un PDF futur se rebâtira depuis
-- `fiche`, qui contient tout.
--
-- ═══ LA SERRURE, C'EST LE DROIT D'EXÉCUTION ════════════════════════════════════════════════
-- `sentinelle_poser` n'est exécutable QUE par `service_role`, dont la clé ne quitte jamais le
-- serveur Vercel. Pas besoin de garde interne sur `auth.uid()` ici : aucun client ne peut
-- atteindre la fonction. C'est plus solide qu'un contrôle dans le corps, et ça se vérifie d'un
-- coup d'œil dans `pg_proc.proacl`.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

create or replace function public.sentinelle_poser(p_nom text, p_ville text,
                                                   p_adresse text, p_fiche jsonb)
returns jsonb language plpgsql security definer set search_path to 'public' as $function$
declare v_id bigint; v_scans int; v_nn text; v_vn text; v_an text; v_cible bigint; v_n int;
begin
  if coalesce(trim(p_nom),'') = '' then return jsonb_build_object('ok', false, 'error', 'nom vide'); end if;
  if p_fiche is null or jsonb_typeof(p_fiche) <> 'object' then
    return jsonb_build_object('ok', false, 'error', 'fiche invalide');
  end if;
  if pg_column_size(p_fiche) > 400000 then
    return jsonb_build_object('ok', false, 'error', 'contenu trop volumineux');
  end if;

  v_nn := public.s_norm(p_nom);
  v_vn := regexp_replace(public.s_norm(coalesce(p_ville,'')),'[0-9]','','g');
  v_an := regexp_replace(public.s_norm(coalesce(p_adresse,'')),'[0-9]','','g');

  -- L'ABSORPTION, reprise telle quelle de sentinelle_save : un enregistrement sans adresse ne
  -- crée plus de fiche à part s'il en existe EXACTEMENT UNE avec adresse pour ce nom et cette
  -- ville. « Exactement une » n'est pas un détail : Feu Vert Chartres a trois établissements
  -- réels dans la même ville. Quand c'est ambigu, on ne devine pas.
  if v_an = '' then
    select count(*), min(id) into v_n, v_cible
      from public.sentinelles
     where nom_norm = v_nn and ville_norm = v_vn and adresse_norm <> '';
    if v_n = 1 then
      update public.sentinelles
         set historique = case when maj_le::date < current_date
               then coalesce(historique,'[]'::jsonb) || jsonb_build_array(jsonb_build_object('date', maj_le::date, 'fiche', fiche))
               else coalesce(historique,'[]'::jsonb) end,
             fiche = p_fiche, scans = scans + 1, maj_le = now(),
             maj_par = null          -- null = écrit par le SERVEUR (cf. note en bas de fichier)
       where id = v_cible
      returning id, scans into v_id, v_scans;
      return jsonb_build_object('ok', true, 'id', v_id, 'scans', v_scans, 'absorbe', true);
    end if;
  end if;

  insert into public.sentinelles(nom, ville, nom_norm, ville_norm, adresse, adresse_norm, fiche)
  values (trim(p_nom), nullif(trim(coalesce(p_ville,'')),''), v_nn, v_vn,
          nullif(trim(coalesce(p_adresse,'')),''), v_an, p_fiche)
  on conflict (nom_norm, ville_norm, adresse_norm) do update
    set historique = case
          when public.sentinelles.maj_le::date < current_date
          then public.sentinelles.historique || jsonb_build_array(jsonb_build_object('date', public.sentinelles.maj_le::date, 'fiche', public.sentinelles.fiche))
          else public.sentinelles.historique end,
        fiche = excluded.fiche, scans = public.sentinelles.scans + 1, maj_le = now(),
        maj_par = null               -- null = écrit par le SERVEUR (cf. note en bas de fichier)
  returning id, scans into v_id, v_scans;
  return jsonb_build_object('ok', true, 'id', v_id, 'scans', v_scans);
end $function$;

-- ⚠️ LA LIGNE QUI COMPTE : personne d'autre que le serveur ne peut appeler cette fonction.
revoke all on function public.sentinelle_poser(text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.sentinelle_poser(text, text, text, jsonb) to service_role;

-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- ═══ FIN DE LA PARTIE 1. S'ARRÊTER ICI, METTRE L'APPLICATION EN LIGNE, ET VÉRIFIER QU'UNE
-- ═══ ANALYSE S'ENREGISTRE BIEN AVANT D'EXÉCUTER LA PARTIE 2.
-- ═══════════════════════════════════════════════════════════════════════════════════════════


-- ═══ PARTIE 2 — CE QUI FERME RÉELLEMENT ════════════════════════════════════════════════════
-- Le navigateur n'écrit plus dans `sentinelles`. La fonction reste en place, pour pouvoir
-- rouvrir en une ligne, mais plus aucun compte client ne peut l'exécuter.
-- ⚠️ À N'EXÉCUTER QU'APRÈS avoir constaté qu'une analyse lancée depuis l'application en ligne
--    apparaît bien dans la table.

revoke execute on function public.sentinelle_save(text, text, jsonb, text, text) from authenticated;


-- ═══ POURQUOI `maj_par = null` EST ÉCRIT EXPLICITEMENT ═════════════════════════════════════
-- Première version : la fonction ne touchait pas à `maj_par`. Sur une fiche DÉJÀ existante,
-- l'ancienne valeur (l'identifiant du client, posé par sentinelle_save) restait donc en place —
-- et une écriture serveur ressemblait exactement à une écriture navigateur. La trace ne
-- distinguait rien, alors qu'on comptait dessus pour vérifier la bascule.
-- Le remettre à null à chaque écriture serveur rend la lecture sans ambiguïté :
--   maj_par renseigné = un compte client a écrit · maj_par vide = le serveur a écrit.
-- ⚠️ Les fiches d'avant le 02/08 ont aussi `maj_par` vide : ce sont les colonnes qui n'existaient
--    pas encore. Se fier à `maj_le` pour trancher, pas à la seule colonne.


-- ═══ VÉRIFICATION ══════════════════════════════════════════════════════════════════════════
-- 1. Les droits, qui SONT la serrure ici :
--      select p.proname, coalesce(array_to_string(p.proacl::text[], ' | '), 'PAR DEFAUT') as droits
--        from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--       where n.nspname = 'public' and p.proname in ('sentinelle_poser','sentinelle_save');
--    Attendu : `sentinelle_poser` → service_role SEUL (pas d'`authenticated`, pas d'`anon`).
--              `sentinelle_save`  → plus d'`authenticated`.
--
-- 2. ⚠️ PUIS LE SEUL ESSAI QUI COMPTE : lancer une SENTINELLE depuis l'application, et vérifier
--    que la fiche est bien arrivée AVEC son adresse :
--      select id, nom, coalesce(adresse,'(AUCUNE)') as adresse, scans, maj_le
--        from sentinelles order by maj_le desc limit 3;
--
-- ═══ POUR ROUVRIR (si quelque chose casse) ═════════════════════════════════════════════════
--   grant execute on function public.sentinelle_save(text, text, jsonb, text, text) to authenticated;
-- …et remettre en ligne la version précédente de l'application depuis Vercel.

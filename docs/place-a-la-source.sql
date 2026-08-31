-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- L'ÉTABLISSEMENT EST CHOISI À LA SOURCE — 31/08/2026
--
-- ⚠️ CE FICHIER AJOUTE. Il ne supprime aucune donnée. Une fonction nouvelle, une fonction
--    élargie d'un paramètre. Il peut être rejoué sans dommage.
--
-- ═══ POURQUOI ══════════════════════════════════════════════════════════════════════════════
-- Didier, 31/08/2026 : « quand je cherche une nouvelle entreprise, je veux que ce soit toi qui
-- me proposes le nom et l'adresse. Comme ça ce sera toujours la même chose : soit elle n'existe
-- pas, soit elle existe déjà. Parce que là, ça devient trop compliqué. »
--
-- Il a raison, et le constat est chiffré : dix-sept fiches dans la base pour HUIT commerces.
-- « La Romana » et « LE ROMANA (PIZZERIA ROMANA) », deux « CERIBE », « Dronavia » et
-- « DRONAVIA », cinq « Feu Vert » de Chartres. Le verrou anti-doublon comparait des NOMS
-- recollés à des adresses, en cherchant une ressemblance de texte — et le nom que tape un
-- dirigeant n'est jamais deux fois le même.
--
-- L'écran allait pourtant DÉJÀ chercher la liste chez Google et la faisait choisir. Il jetait
-- simplement l'identifiant. Toute la difficulté vient de là : il a fallu tenter de le retrouver
-- après coup à partir du seul nom, et cette recherche a accroché cinq fiches au même magasin.
--
-- ═══ CE QUI CHANGE ═════════════════════════════════════════════════════════════════════════
-- L'identifiant Google est capté AU MOMENT DU CLIC et rangé dans sa colonne. Une fiche naît
-- donc validée. Le doublon se juge sur cet identifiant, qui ne change jamais.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

-- ── 1. « CETTE ENTREPRISE EXISTE-T-ELLE DÉJÀ ? » ────────────────────────────────────────────
-- Une seule question, une seule réponse. Plus de ressemblance de texte, plus de « peut-être ».
--
-- ⚠️ LA GARDE `auth.uid() is null` EST EN PREMIÈRE LIGNE, comme dans sentinelle_check et
--    sentinelle_get : sans elle, n'importe qui sur Internet pourrait sonder le fichier
--    prospects, établissement par établissement. Ne jamais la retirer pour essayer la fonction
--    dans l'éditeur SQL — auth.uid() y vaut TOUJOURS NULL, et « found: false » y est donc
--    normal ; cela ne prouve rien.
create or replace function public.sentinelle_par_place(p_place_id text)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $function$
declare v record;
begin
  if auth.uid() is null then return jsonb_build_object('found', false); end if;
  if coalesce(trim(p_place_id),'') = '' then return jsonb_build_object('found', false); end if;
  select nom, ville, adresse, cree_le::date as d into v
    from public.sentinelles
   where coalesce(place_id, fiche->'_auraCalc'->>'place_id') = p_place_id
   order by cree_le asc limit 1;
  if v.nom is null then return jsonb_build_object('found', false); end if;
  return jsonb_build_object('found', true, 'nom', v.nom, 'ville', v.ville,
                            'adresse', v.adresse, 'date', v.d);
end $function$;

revoke all on function public.sentinelle_par_place(text) from public, anon;
grant execute on function public.sentinelle_par_place(text) to authenticated;


-- ── 2. L'IDENTIFIANT EST RANGÉ DÈS L'ÉCRITURE DE LA FICHE ───────────────────────────────────
-- Corps repris à l'identique de docs/sentinelle-poser.sql, avec UN ajout : le paramètre
-- `p_place_id`, écrit dans sa colonne. Tout le reste — l'absorption des fiches sans adresse,
-- l'archivage dans `historique`, la garde de taille, `maj_par = null` — ne bouge pas d'un mot.
--
-- ⚠️ `p_place_id` A UNE VALEUR PAR DÉFAUT : le serveur peut l'omettre — par exemple une
--    re-mesure d'une fiche dont l'identifiant n'est pas encore connu — sans que l'appel échoue.
--    Elle ne protège en revanche AUCUNE fenêtre de déploiement : voir l'avertissement plus bas.
--
-- ⚠️ ET IL N'EFFACE JAMAIS UN IDENTIFIANT DÉJÀ POSÉ : `coalesce(excluded, existant)`. Une
--    re-mesure lancée sans identifiant ne doit pas défaire une validation.
-- ⚠️ ON RETIRE D'ABORD L'ANCIENNE VERSION À QUATRE PARAMÈTRES — SINON LES DEUX COEXISTENT.
--    Ajouter un paramètre ne remplace pas une fonction : PostgreSQL en crée une SECONDE, et
--    PostgREST, appelé avec quatre paramètres, ne sait plus laquelle choisir. Il refuse alors
--    l'appel (« could not choose the best candidate function ») et PLUS AUCUNE analyse ne
--    s'enregistre. Le `create or replace` seul ne protège de rien ici.
-- ⚠️ ENTRE CE SCRIPT ET LA MISE EN LIGNE, NE LANCEZ AUCUNE ANALYSE : pendant ces quelques
--    minutes l'application en ligne appelle encore la version à quatre paramètres, qui n'existe
--    plus. L'analyse s'afficherait sans être enregistrée.
drop function if exists public.sentinelle_poser(text, text, text, jsonb);

create or replace function public.sentinelle_poser(p_nom text, p_ville text,
                                                   p_adresse text, p_fiche jsonb,
                                                   p_place_id text default null)
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

  /* ⚠️ L'IDENTIFIANT PASSE AVANT LE NOM. Si une fiche porte déjà cet établissement, c'est ELLE
     qu'on met à jour — quelle que soit l'orthographe du nom. C'est cette ligne qui empêche
     « La Romana » et « LE ROMANA (PIZZERIA ROMANA) » de vivre côte à côte. */
  if coalesce(trim(p_place_id),'') <> '' then
    select id into v_cible from public.sentinelles
     where coalesce(place_id, fiche->'_auraCalc'->>'place_id') = p_place_id
     order by cree_le asc limit 1;
    if v_cible is not null then
      update public.sentinelles
         set historique = case when maj_le::date < current_date
               then coalesce(historique,'[]'::jsonb) || jsonb_build_array(jsonb_build_object('date', maj_le::date, 'fiche', fiche))
               else coalesce(historique,'[]'::jsonb) end,
             fiche = p_fiche, scans = scans + 1, maj_le = now(), maj_par = null,
             place_id = p_place_id,
             adresse = coalesce(nullif(trim(coalesce(p_adresse,'')),''), adresse),
             adresse_norm = case when nullif(trim(coalesce(p_adresse,'')),'') is not null then v_an else adresse_norm end
       where id = v_cible
      returning id, scans into v_id, v_scans;
      return jsonb_build_object('ok', true, 'id', v_id, 'scans', v_scans, 'par_identifiant', true);
    end if;
  end if;

  -- L'ABSORPTION, inchangée : un enregistrement sans adresse ne crée plus de fiche à part s'il
  -- en existe EXACTEMENT UNE avec adresse pour ce nom et cette ville. « Exactement une » n'est
  -- pas un détail : une enseigne peut avoir plusieurs établissements dans la même ville. Quand
  -- c'est ambigu, on ne devine pas.
  if v_an = '' then
    select count(*), min(id) into v_n, v_cible
      from public.sentinelles
     where nom_norm = v_nn and ville_norm = v_vn and adresse_norm <> '';
    if v_n = 1 then
      update public.sentinelles
         set historique = case when maj_le::date < current_date
               then coalesce(historique,'[]'::jsonb) || jsonb_build_array(jsonb_build_object('date', maj_le::date, 'fiche', fiche))
               else coalesce(historique,'[]'::jsonb) end,
             fiche = p_fiche, scans = scans + 1, maj_le = now(), maj_par = null,
             place_id = coalesce(nullif(trim(coalesce(p_place_id,'')),''), place_id)
       where id = v_cible
      returning id, scans into v_id, v_scans;
      return jsonb_build_object('ok', true, 'id', v_id, 'scans', v_scans, 'absorbe', true);
    end if;
  end if;

  insert into public.sentinelles(nom, ville, nom_norm, ville_norm, adresse, adresse_norm, fiche, place_id)
  values (trim(p_nom), nullif(trim(coalesce(p_ville,'')),''), v_nn, v_vn,
          nullif(trim(coalesce(p_adresse,'')),''), v_an, p_fiche,
          nullif(trim(coalesce(p_place_id,'')),''))
  on conflict (nom_norm, ville_norm, adresse_norm) do update
    set historique = case
          when public.sentinelles.maj_le::date < current_date
          then public.sentinelles.historique || jsonb_build_array(jsonb_build_object('date', public.sentinelles.maj_le::date, 'fiche', public.sentinelles.fiche))
          else public.sentinelles.historique end,
        fiche = excluded.fiche, scans = public.sentinelles.scans + 1, maj_le = now(),
        maj_par = null,
        place_id = coalesce(excluded.place_id, public.sentinelles.place_id)
  returning id, scans into v_id, v_scans;
  return jsonb_build_object('ok', true, 'id', v_id, 'scans', v_scans);
end $function$;

-- ⚠️ LA LIGNE QUI COMPTE : personne d'autre que le serveur ne peut écrire une fiche.
revoke all on function public.sentinelle_poser(text, text, text, jsonb, text) from public, anon, authenticated;
grant execute on function public.sentinelle_poser(text, text, text, jsonb, text) to service_role;


-- ═══ VÉRIFICATION ══════════════════════════════════════════════════════════════════════════
-- 1. Les droits :
--      select p.proname || '(' || pg_get_function_arguments(p.oid) || ')' as fonction,
--             coalesce(array_to_string(p.proacl::text[], ' | '), 'PAR DEFAUT') as droits
--        from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--       where n.nspname = 'public'
--         and p.proname in ('sentinelle_par_place','sentinelle_poser');
--    Attendu : sentinelle_par_place → authenticated. sentinelle_poser → service_role SEUL.
--
-- 2. ⚠️ PUIS LE SEUL ESSAI QUI COMPTE : lancer une SENTINELLE depuis l'application et vérifier
--    que la fiche est arrivée AVEC son identifiant, sans avoir eu besoin d'aucun rattrapage :
--      select id, nom, adresse, place_id, maj_le
--        from sentinelles order by maj_le desc limit 3;

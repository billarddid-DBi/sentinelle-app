-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- LES FICHES ORPHELINES : FUSION + TARISSEMENT DE LA SOURCE — 02/08/2026
--
-- ⚠️ CE FICHIER MODIFIE DES DONNÉES. Il fait une sauvegarde avant, et ne supprime une ligne
--    qu'APRÈS avoir recopié son contenu dans celle qui reste.
--    À exécuter UNE SEULE FOIS (la partie B, elle, est rejouable sans risque).
--
-- ═══ LE DÉFAUT ═════════════════════════════════════════════════════════════════════════════
-- `sentinelle_save` range la fiche sous la clé (nom, ville, ADRESSE). Un enregistrement sans
-- adresse a donc une clé différente : au lieu de mettre à jour la fiche, la base en INSÈRE une
-- seconde. Et `sentinelle_get`, qui exige adresse_norm <> '' quand une adresse est connue, ne
-- la voit jamais — le dirigeant continue de lire son ancienne analyse.
--
-- ET LE DÉFAUT S'AUTO-ENTRETIENT. L'application mémorise sur le compte l'adresse du dernier
-- scan : une fois l'orpheline créée, le compte porte une adresse VIDE, et la dernière fiche lue
-- est l'orpheline — qui n'en a pas non plus. Le filet posé côté navigateur le 31/07 va chercher
-- l'adresse exactement là où elle vient d'être détruite. Il ne pouvait pas marcher.
--
-- D'où la correction ici, en base : il y a trop de chemins d'appel côté navigateur pour espérer
-- qu'aucun n'oublie. Un seul endroit tranche.
-- ═══════════════════════════════════════════════════════════════════════════════════════════


-- ═══ PARTIE A — LA FUSION ══════════════════════════════════════════════════════════════════

-- A0. LA SAUVEGARDE. Elle prend TOUTES les lignes concernées, orphelines et survivantes.
--     Tant que cette table existe, rien n'est irréversible.
create table if not exists public.sentinelles_avant_fusion_20260802 as
select s.* from public.sentinelles s
 where exists (
   select 1 from public.sentinelles o
    where o.adresse_norm = '' and o.nom_norm = s.nom_norm and o.ville_norm = s.ville_norm
     and exists (select 1 from public.sentinelles a
                  where a.adresse_norm <> '' and a.nom_norm = o.nom_norm and a.ville_norm = o.ville_norm));

-- A1. REPLIER, PAS ÉCRASER. La fiche la plus récente des deux devient la courante ; l'autre
--     part dans l'historique avec l'historique complet des deux lignes. Rien n'est perdu.
update public.sentinelles a
   set historique = coalesce(a.historique,'[]'::jsonb)
                 || coalesce(o.historique,'[]'::jsonb)
                 || jsonb_build_array(jsonb_build_object(
                      'date',  least(a.maj_le, o.maj_le)::date,
                      'fiche', case when o.maj_le > a.maj_le then a.fiche else o.fiche end)),
       fiche   = case when o.maj_le > a.maj_le then o.fiche  else a.fiche  end,
       html    = case when o.maj_le > a.maj_le then o.html   else a.html   end,
       maj_par = case when o.maj_le > a.maj_le then o.maj_par else a.maj_par end,
       scans   = a.scans + o.scans,
       maj_le  = greatest(a.maj_le, o.maj_le)
  from public.sentinelles o
 where o.adresse_norm = ''
   and a.adresse_norm <> ''
   and a.nom_norm = o.nom_norm
   and a.ville_norm = o.ville_norm;

-- A2. L'orpheline n'a plus rien d'unique : son contenu est dans la ligne ci-dessus.
delete from public.sentinelles o
 where o.adresse_norm = ''
   and exists (select 1 from public.sentinelles a
                where a.adresse_norm <> ''
                  and a.nom_norm = o.nom_norm and a.ville_norm = o.ville_norm);


-- ═══ PARTIE B — TARIR LA SOURCE ════════════════════════════════════════════════════════════
-- Corps identique à celui du 02/08 (gardes + traçabilité), avec UN ajout : l'absorption.
--
-- ⚠️ « EXACTEMENT UNE » EST LA CONDITION QUI COMPTE. Feu Vert Chartres a trois établissements
--    dans la même ville, à trois adresses réelles. Quand c'est ambigu, on ne devine pas : on
--    garde le comportement actuel. Deviner créerait une corruption pire que l'orpheline.
create or replace function public.sentinelle_save(p_nom text, p_ville text, p_fiche jsonb,
                                                  p_html text default null, p_adresse text default '')
returns jsonb language plpgsql security definer set search_path to 'public' as $function$
declare
  v_id bigint; v_scans int; v_uid uuid;
  v_nn text; v_vn text; v_an text;
  v_cible bigint; v_n int;
begin
  v_uid := auth.uid();
  if v_uid is null then return jsonb_build_object('ok', false, 'error', 'Aucun compte identifié.'); end if;
  if coalesce(trim(p_nom),'') = '' then return jsonb_build_object('ok', false, 'error', 'nom vide'); end if;
  if p_fiche is null or jsonb_typeof(p_fiche) <> 'object' then
    return jsonb_build_object('ok', false, 'error', 'fiche invalide');
  end if;
  if pg_column_size(p_fiche) > 400000 or pg_column_size(coalesce(p_html,'')) > 2000000 then
    return jsonb_build_object('ok', false, 'error', 'contenu trop volumineux');
  end if;

  v_nn := public.s_norm(p_nom);
  v_vn := regexp_replace(public.s_norm(coalesce(p_ville,'')),'[0-9]','','g');
  v_an := regexp_replace(public.s_norm(coalesce(p_adresse,'')),'[0-9]','','g');

  -- ── L'ABSORPTION ──────────────────────────────────────────────────────────────────────────
  if v_an = '' then
    select count(*), min(id) into v_n, v_cible
      from public.sentinelles
     where nom_norm = v_nn and ville_norm = v_vn and adresse_norm <> '';
    if v_n = 1 then
      update public.sentinelles
         set historique = case when maj_le::date < current_date
               then coalesce(historique,'[]'::jsonb) || jsonb_build_array(jsonb_build_object('date', maj_le::date, 'fiche', fiche))
               else coalesce(historique,'[]'::jsonb) end,
             fiche = p_fiche, html = p_html,
             scans = scans + 1, maj_le = now(), maj_par = v_uid
       where id = v_cible
      returning id, scans into v_id, v_scans;
      return jsonb_build_object('ok', true, 'id', v_id, 'scans', v_scans, 'absorbe', true);
    end if;
  end if;

  insert into public.sentinelles(nom, ville, nom_norm, ville_norm, adresse, adresse_norm, fiche, html,
                                 cree_par, maj_par)
  values (trim(p_nom), nullif(trim(coalesce(p_ville,'')),''), v_nn, v_vn,
          nullif(trim(coalesce(p_adresse,'')),''), v_an, p_fiche, p_html, v_uid, v_uid)
  on conflict (nom_norm, ville_norm, adresse_norm) do update
    set historique = case
          when public.sentinelles.maj_le::date < current_date
          then public.sentinelles.historique || jsonb_build_array(jsonb_build_object('date', public.sentinelles.maj_le::date, 'fiche', public.sentinelles.fiche))
          else public.sentinelles.historique end,
        fiche = excluded.fiche, html = excluded.html,
        scans = public.sentinelles.scans + 1, maj_le = now(),
        maj_par = v_uid                      -- cree_par n'est JAMAIS réécrit : c'est l'origine
  returning id, scans into v_id, v_scans;
  return jsonb_build_object('ok', true, 'id', v_id, 'scans', v_scans);
end $function$;

revoke all on function public.sentinelle_save(text, text, jsonb, text, text) from public, anon;
grant execute on function public.sentinelle_save(text, text, jsonb, text, text) to authenticated;


-- ═══ VÉRIFICATION ══════════════════════════════════════════════════════════════════════════
-- 1. Plus aucune orpheline doublonnée :
--      select nom, ville, coalesce(adresse,'(AUCUNE)') as adresse, scans, maj_le::date
--        from sentinelles
--       where nom_norm in (select nom_norm from sentinelles group by nom_norm having count(*)>1)
--       order by nom_norm;
--    Attendu : seulement les trois Feu Vert de Chartres, à trois adresses réelles.
--
-- 2. ⚠️ PUIS DANS L'APPLICATION : relancer une SENTINELLE sur votre entreprise. La fiche AVEC
--    adresse doit voir son compteur `scans` augmenter — et aucune ligne sans adresse n'apparaître.
--
-- 3. La sauvegarde reste disponible tant qu'on ne l'a pas retirée :
--      select * from sentinelles_avant_fusion_20260802;
--    À supprimer seulement une fois le point 2 vérifié :
--      drop table sentinelles_avant_fusion_20260802;

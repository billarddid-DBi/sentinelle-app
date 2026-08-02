-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- SENTINELLE : GARDE INTERNE + TRAÇABILITÉ — 02/08/2026
--
-- ⚠️ CE FICHIER MODIFIE LA BASE : deux colonnes ajoutées, trois fonctions remplacées.
--    Il ne supprime aucune donnée et ne change AUCUN comportement de l'application.
--
-- ═══ CE QU'ON A LU DANS LE CODE (et pas supposé) ═══════════════════════════════════════════
-- La table `sentinelles` n'a AUCUNE colonne de propriétaire. Ce n'est pas un cloisonnement
-- raté : c'est un corpus PARTAGÉ, voulu tel quel. Deux clients qui analysent le même concurrent
-- doivent tomber sur la même fiche — c'est ce qui fait marcher l'historique et les relances.
-- Il n'y a donc rien à partitionner, et ce fichier n'essaie pas.
--
-- Le vrai défaut est ailleurs : `sentinelle_save` ne vérifie RIEN. Ni qui appelle, ni ce qu'on
-- lui donne. `p_fiche` accepte `null`, un tableau, une chaîne de dix mégaoctets. Et aucune
-- trace n'est gardée : si une fiche est écrasée, rien ne dit par qui.
--
-- Depuis le 01/08 ces fonctions ne sont plus exécutables par les anonymes. Une fonction
-- SECURITY DEFINER doit néanmoins SE GARDER ELLE-MÊME : les droits sont une serrure sur la
-- porte, la garde interne est le verrou. Les deux, séparément — c'est la leçon de l'audit.
--
-- ═══ CE QUE CE FICHIER NE FERMAIT PAS — ET QUI A ÉTÉ FERMÉ LE JOUR MÊME ════════════════════
-- ✅ RÉGLÉ le 02/08/2026 par `docs/sentinelle-poser.sql`. Ce paragraphe est conservé parce
--    qu'il dit pourquoi on s'était trompé.
--
-- On écrivait ici : « tant que c'est le NAVIGATEUR qui envoie la fiche, un client déterminé peut
-- en envoyer une fausse ; le vrai verrou serait que la fonction Vercel écrive la fiche
-- elle-même, mais `p_html` est fabriqué depuis l'écran (radar converti en image depuis le
-- canvas) et ne peut pas déménager côté serveur sans réécrire la production ».
--
-- L'ERREUR ÉTAIT DANS LA PRÉMISSE, pas dans le raisonnement. Personne ne lit la colonne `html` :
-- ni sentinelle_get, ni sentinelle_check, ni aucune fonction Vercel, ni la console. C'était un
-- PDF jamais construit. En cessant de la stocker, le navigateur n'a plus rien à écrire, et le
-- verrou tenait en deux lignes de droits.
-- ⚠️ LA LEÇON : avant de déclarer un chantier hors de portée, vérifier que la contrainte qui le
--    bloque sert encore à quelque chose. Ici elle ne servait à rien depuis le début.
--
-- `sentinelle_save` n'est donc plus exécutable par `authenticated`. Elle reste en place pour
-- pouvoir rouvrir en une ligne, et les gardes ci-dessus restent utiles à ce titre.
-- ═══════════════════════════════════════════════════════════════════════════════════════════


-- ── LA TRACE ────────────────────────────────────────────────────────────────────────────────
alter table public.sentinelles add column if not exists cree_par uuid;
alter table public.sentinelles add column if not exists maj_par  uuid;
comment on column public.sentinelles.cree_par is 'auth.uid() du premier enregistrement';
comment on column public.sentinelles.maj_par  is 'auth.uid() du dernier enregistrement';


-- ── ENREGISTRER ─────────────────────────────────────────────────────────────────────────────
-- Corps IDENTIQUE à celui en production (historique hebdomadaire compris). Seuls trois gardes
-- et deux colonnes de trace sont ajoutés.
create or replace function public.sentinelle_save(p_nom text, p_ville text, p_fiche jsonb,
                                                  p_html text default null, p_adresse text default '')
returns jsonb language plpgsql security definer set search_path to 'public' as $function$
declare v_id bigint; v_scans int; v_uid uuid;
begin
  -- 1. QUI APPELLE. La fonction ignore la RLS : sans ce contrôle, elle n'a pas de verrou.
  v_uid := auth.uid();
  if v_uid is null then return jsonb_build_object('ok', false, 'error', 'Aucun compte identifié.'); end if;

  if coalesce(trim(p_nom),'') = '' then return jsonb_build_object('ok', false, 'error', 'nom vide'); end if;

  -- 2. LA FORME. `p_fiche` était accepté tel quel : un `null`, un tableau ou une chaîne
  --    passaient, et corrompaient silencieusement une entrée du corpus.
  if p_fiche is null or jsonb_typeof(p_fiche) <> 'object' then
    return jsonb_build_object('ok', false, 'error', 'fiche invalide');
  end if;

  -- 3. LA TAILLE. Sans plafond, une seule requête peut faire enfler la base — et la facture.
  if pg_column_size(p_fiche) > 400000 or pg_column_size(coalesce(p_html,'')) > 2000000 then
    return jsonb_build_object('ok', false, 'error', 'contenu trop volumineux');
  end if;

  insert into public.sentinelles(nom, ville, nom_norm, ville_norm, adresse, adresse_norm, fiche, html,
                                 cree_par, maj_par)
  values (trim(p_nom), nullif(trim(coalesce(p_ville,'')),''), public.s_norm(p_nom),
          regexp_replace(public.s_norm(coalesce(p_ville,'')),'[0-9]','','g'),
          nullif(trim(coalesce(p_adresse,'')),''),
          regexp_replace(public.s_norm(coalesce(p_adresse,'')),'[0-9]','','g'),
          p_fiche, p_html, v_uid, v_uid)
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


-- ── LIRE ────────────────────────────────────────────────────────────────────────────────────
-- Corps identique, garde ajoutée. Réponse volontairement muette (`found: false`) plutôt qu'une
-- erreur : l'application traite déjà ce cas partout, rien ne casse à l'écran.
create or replace function public.sentinelle_get(p_texte text, p_adresse text default '')
returns jsonb language plpgsql stable security definer set search_path to 'public' as $function$
declare
  p  text := public.s_norm(p_texte);
  pa text := regexp_replace(public.s_norm(p_adresse),'[0-9]','','g');
  v record; serie jsonb;
begin
  if auth.uid() is null then return jsonb_build_object('found', false); end if;
  if length(p) < 3 then return jsonb_build_object('found', false); end if;
  if pa <> '' then
    select nom, ville, adresse, fiche, historique, maj_le into v
    from public.sentinelles
    where length(nom_norm) >= 3 and p like '%'||nom_norm||'%'
      and (ville_norm = '' or p like '%'||regexp_replace(ville_norm,'[0-9]','','g')||'%')
      and adresse_norm <> '' and (adresse_norm like '%'||pa||'%' or pa like '%'||adresse_norm||'%')
    order by cree_le desc limit 1;
  else
    select nom, ville, adresse, fiche, historique, maj_le into v
    from public.sentinelles
    where length(nom_norm) >= 3 and p like '%'||nom_norm||'%'
      and (ville_norm = '' or p like '%'||regexp_replace(ville_norm,'[0-9]','','g')||'%')
    order by cree_le desc limit 1;
  end if;
  if v.nom is null then return jsonb_build_object('found', false); end if;
  select coalesce(jsonb_agg(jsonb_build_object(
           'date', h->>'date',
           'ive',  h->'fiche'->'indice'->>'estime',
           'couleur', h->'fiche'->'aura'->>'couleur',
           'note', h->'fiche'->'_auraCalc'->>'note_google',
           'avis', h->'fiche'->'_auraCalc'->>'nb_avis',
           'site', h->'fiche'->>'site')), '[]'::jsonb)
    into serie from jsonb_array_elements(v.historique) h;
  serie := serie || jsonb_build_array(jsonb_build_object(
           'date', v.maj_le::date, 'ive', v.fiche->'indice'->>'estime',
           'couleur', v.fiche->'aura'->>'couleur',
           'note', v.fiche->'_auraCalc'->>'note_google',
           'avis', v.fiche->'_auraCalc'->>'nb_avis', 'site', v.fiche->>'site'));
  return jsonb_build_object('found', true, 'nom', v.nom, 'ville', v.ville, 'adresse', v.adresse,
           'date', v.maj_le::date, 'dernier', v.maj_le::date, 'fiche', v.fiche, 'serie', serie);
end $function$;


-- ── VÉRIFIER LA PRÉSENCE ────────────────────────────────────────────────────────────────────
create or replace function public.sentinelle_check(p_texte text, p_adresse text default '')
returns jsonb language plpgsql stable security definer set search_path to 'public' as $function$
declare
  p  text := public.s_norm(p_texte);
  pa text := regexp_replace(public.s_norm(p_adresse),'[0-9]','','g');
  v record;
begin
  if auth.uid() is null then return jsonb_build_object('found', false); end if;
  if length(p) < 3 then return jsonb_build_object('found', false); end if;
  if pa <> '' then
    select nom, ville, adresse, cree_le::date as d into v
    from public.sentinelles
    where length(nom_norm) >= 3 and p like '%'||nom_norm||'%'
      and (ville_norm = '' or p like '%'||regexp_replace(ville_norm,'[0-9]','','g')||'%')
      and adresse_norm <> '' and (adresse_norm like '%'||pa||'%' or pa like '%'||adresse_norm||'%')
    order by cree_le desc limit 1;
  else
    select nom, ville, adresse, cree_le::date as d into v
    from public.sentinelles
    where length(nom_norm) >= 3 and p like '%'||nom_norm||'%'
      and (ville_norm = '' or p like '%'||regexp_replace(ville_norm,'[0-9]','','g')||'%')
    order by cree_le desc limit 1;
  end if;
  if v.nom is null then return jsonb_build_object('found', false); end if;
  return jsonb_build_object('found', true, 'nom', v.nom, 'ville', v.ville, 'adresse', v.adresse, 'date', v.d);
end $function$;


-- Les droits restent ceux du 01/08. On les repose explicitement : un `create or replace` ne les
-- change pas, mais le jour où quelqu'un recrée la fonction, ces lignes sont le filet.
revoke all on function public.sentinelle_save(text, text, jsonb, text, text) from public, anon;
revoke all on function public.sentinelle_get(text, text)                     from public, anon;
revoke all on function public.sentinelle_check(text, text)                   from public, anon;
grant execute on function public.sentinelle_save(text, text, jsonb, text, text) to authenticated;
grant execute on function public.sentinelle_get(text, text)                     to authenticated;
grant execute on function public.sentinelle_check(text, text)                   to authenticated;


-- ═══ APRÈS INSTALLATION ════════════════════════════════════════════════════════════════════
-- 1. Les fonctions refusent sans session (auth.uid() est NULL dans cet éditeur) :
--      select sentinelle_check('feu vert metz');
--    Attendu : {"found": false}   ← et non une fiche
--
-- 2. ⚠️ PUIS TESTER DANS L'APPLICATION, seul essai qui compte : lancer une SENTINELLE sur un
--    prospect, puis rouvrir l'écran qui la relit. Rien ne doit changer à l'écran.
--
-- 3. Une fois quelques analyses faites, la trace devient lisible :
--      select nom, ville, scans, cree_par, maj_par, maj_le
--        from sentinelles order by maj_le desc limit 20;

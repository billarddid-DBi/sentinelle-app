-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- LA RE-MESURE MENSUELLE GRATUITE + LA COURBE — 31/08/2026
--
-- ⚠️ CE FICHIER AJOUTE. Il ne supprime rien, ne vide aucune colonne, ne touche à aucune fiche.
--    Deux colonnes nouvelles, deux fonctions nouvelles, une fonction de lecture enrichie.
--    Il peut être rejoué sans dommage.
--
-- ═══ POURQUOI ══════════════════════════════════════════════════════════════════════════════
-- La courbe d'évolution existe déjà à l'écran, mais elle n'a presque rien à tracer : elle ne
-- gagne un point que le jour où quelqu'un PAIE une nouvelle analyse. Résultat, une entreprise
-- analysée une fois n'a qu'un point — et un point ne fait pas une courbe.
-- La re-mesure va relire chaque mois, gratuitement, les seuls faits qui bougent tout seuls :
-- la note Google, le nombre d'avis, la date du dernier avis, l'établissement ouvert ou fermé,
-- le site, les annonces légales. Aucun appel à l'IA, aucun jeton débité.
--
-- ═══ LA DÉCISION QUI STRUCTURE TOUT : ON NE TOUCHE PAS À LA FICHE ═══════════════════════════
-- La tentation était d'écrire les chiffres frais DANS `fiche`. On ne le fait pas : le texte de
-- l'analyse dirait « 23 avis » pendant qu'un encadré en afficherait 27. C'est la contradiction
-- exacte qui a produit trois dates fausses en août. Les points mesurés vivent donc dans leur
-- propre colonne, `mesures`, chacun avec sa date. La fiche reste ce qu'elle était le jour où
-- elle a été payée, et l'écran peut dire honnêtement : « voici ce qui a bougé depuis ».
-- ═══════════════════════════════════════════════════════════════════════════════════════════

-- ── 1. LES DEUX COLONNES ────────────────────────────────────────────────────────────────────
alter table public.sentinelles add column if not exists mesures   jsonb not null default '[]'::jsonb;
alter table public.sentinelles add column if not exists mesure_le timestamptz;


-- ── 2. QUI FAUT-IL REMESURER AUJOURD'HUI ? ──────────────────────────────────────────────────
-- Le serveur ne choisit pas : il demande. La base seule sait qui a été vu et quand.
--
-- ⚠️ TROIS CONDITIONS, ET CHACUNE ÉVITE UNE DÉPENSE INUTILE :
--   · un `place_id` enregistré — sans lui, il faudrait REFAIRE une recherche Google (payante)
--     avant de pouvoir lire quoi que ce soit ;
--   · rien de mesuré depuis p_jours — on ne relit pas deux fois le même mois ;
--   · l'analyse elle-même a plus de p_jours — inutile de remesurer une fiche produite hier,
--     ses chiffres sont ceux d'hier.
-- Les plus anciennes d'abord : personne n'est jamais oublié au profit d'un autre.
create or replace function public.sentinelle_a_remesurer(p_max int default 8, p_jours int default 30)
returns jsonb language sql stable security definer set search_path to 'public' as $function$
  select coalesce(jsonb_agg(x), '[]'::jsonb) from (
    select jsonb_build_object(
             'id',       s.id,
             'nom',      s.nom,
             'place_id', s.fiche->'_auraCalc'->>'place_id',
             'activite', coalesce(s.fiche->>'activite', s.fiche->>'secteur', s.fiche->>'archetype'),
             'couleur',  s.fiche->'aura'->>'couleur',
             'siren',    s.fiche->'_registre'->>'siren'
           ) as x
      from public.sentinelles s
     where s.fiche->'_auraCalc'->>'place_id' is not null
       and (s.mesure_le is null or s.mesure_le < now() - make_interval(days => p_jours))
       and s.maj_le < now() - make_interval(days => p_jours)
     order by coalesce(s.mesure_le, s.maj_le) asc
     limit greatest(1, least(p_max, 25))
  ) t;
$function$;


-- ── 3. RANGER UN POINT ──────────────────────────────────────────────────────────────────────
-- ⚠️ `mesure_le` EST MIS À JOUR MÊME QUAND LA DATE EXISTE DÉJÀ (le point remplace alors
--    l'ancien). Sinon une entreprise déjà mesurée aujourd'hui reviendrait en tête de liste
--    demain, puis après-demain, et occuperait indéfiniment une des huit places du tour.
-- ⚠️ ON GARDE 60 POINTS AU PLUS : cinq ans d'historique mensuel. Au-delà, la colonne enflerait
--    sans que personne ne remonte jamais aussi loin dans la courbe.
create or replace function public.sentinelle_mesure_poser(p_id bigint, p_point jsonb)
returns jsonb language plpgsql security definer set search_path to 'public' as $function$
declare v_j text; v_n int;
begin
  if p_point is null or jsonb_typeof(p_point) <> 'object' or (p_point->>'date') is null then
    return jsonb_build_object('ok', false, 'error', 'point invalide');
  end if;
  v_j := p_point->>'date';

  update public.sentinelles s
     set mesures = (
           select coalesce(jsonb_agg(u.m order by u.m->>'date'), '[]'::jsonb)
             from (
               select m from jsonb_array_elements(s.mesures) m where m->>'date' <> v_j
               union all
               select p_point
             ) u(m)
         ),
         mesure_le = now()
   where s.id = p_id;

  if not found then return jsonb_build_object('ok', false, 'error', 'introuvable'); end if;

  -- On rogne la tête si la colonne dépasse 60 points (les plus anciens partent).
  select jsonb_array_length(mesures) into v_n from public.sentinelles where id = p_id;
  if v_n > 60 then
    update public.sentinelles s
       set mesures = (select coalesce(jsonb_agg(t.m order by t.m->>'date'), '[]'::jsonb)
                        from jsonb_array_elements(s.mesures) with ordinality t(m, i)
                       where t.i > v_n - 60)
     where s.id = p_id;
    v_n := 60;
  end if;

  return jsonb_build_object('ok', true, 'points', v_n);
end $function$;


-- ── 3 bis. LE RATTRAPAGE DES IDENTIFIANTS GOOGLE MANQUANTS ──────────────────────────────────
-- Mesuré dans la vraie base le 31/08/2026 : 3 fiches sur 17 portent un `place_id`. Les 14
-- autres datent d'avant qu'on l'enregistre, et sans lui la re-mesure ne peut rien faire.
--
-- ⚠️ L'IDENTIFIANT VA DANS SA PROPRE COLONNE, PAS DANS `fiche`. Même règle que les relevés : la
--    fiche reste ce qu'elle était le jour où elle a été payée. `sentinelle_a_remesurer` lit donc
--    les deux endroits, la colonne d'abord.
-- ⚠️ ET ON GARDE CE QUE GOOGLE A RÉPONDU. Le nom et l'adresse retenus sont enregistrés à côté :
--    si la recherche est tombée sur un homonyme, l'erreur se voit en une seconde au lieu de
--    produire des chiffres faux mais cohérents. C'est la leçon du 12/08 sur les avis Google.
alter table public.sentinelles add column if not exists place_id      text;
alter table public.sentinelles add column if not exists place_nom     text;
alter table public.sentinelles add column if not exists place_adresse text;
alter table public.sentinelles add column if not exists place_le      timestamptz;
-- ⚠️ LE MOTIF DE L'ÉCHEC (ajouté le 31/08/2026, APRÈS le premier essai en vrai). Les huit
--    premières fiches ont été refusées et la base affichait huit « rien trouvé » identiques :
--    impossible de distinguer une clé Google bloquée d'un nom introuvable ou d'un garde-fou
--    trop strict. C'était le garde-fou. Un échec muet se diagnostique en modifiant le code,
--    c'est-à-dire trop tard et trop cher.
alter table public.sentinelles add column if not exists place_motif   text;

create or replace function public.sentinelle_sans_place(p_max int default 8)
returns jsonb language sql stable security definer set search_path to 'public' as $function$
  select coalesce(jsonb_agg(x), '[]'::jsonb) from (
    select jsonb_build_object('id', s.id, 'nom', s.nom, 'ville', s.ville, 'adresse', s.adresse) as x
      from public.sentinelles s
     where s.place_id is null
       and s.fiche->'_auraCalc'->>'place_id' is null
       -- Une fiche déjà cherchée SANS SUCCÈS ne sera pas rejouée tous les soirs : `place_le`
       -- retient la tentative, même quand elle n'a rien donné.
       and (s.place_le is null or s.place_le < now() - interval '90 days')
     order by s.maj_le desc
     limit greatest(1, least(p_max, 25))
  ) t;
$function$;

create or replace function public.sentinelle_place_poser(p_id bigint, p_place_id text,
                                                         p_nom text, p_adresse text,
                                                         p_motif text default null)
returns jsonb language plpgsql security definer set search_path to 'public' as $function$
begin
  /* ⚠️ UNE RECHERCHE INFRUCTUEUSE SE NOTE AUSSI. Sans cela, les fiches que Google ne sait pas
     retrouver — un nom trop générique, un établissement disparu — repartiraient en tête de
     liste CHAQUE NUIT et consommeraient un appel payant chacune, indéfiniment, sans jamais
     rien produire. On horodate donc la tentative, et `sentinelle_sans_place` la met de côté
     pour 90 jours. */
  if coalesce(trim(p_place_id),'') = '' then
    update public.sentinelles set place_le = now(), place_motif = p_motif where id = p_id;
    return jsonb_build_object('ok', false, 'error', 'introuvable chez Google', 'tentative', true);
  end if;
  update public.sentinelles
     set place_id = p_place_id, place_nom = p_nom, place_adresse = p_adresse,
         place_le = now(), place_motif = null
   where id = p_id;
  if not found then return jsonb_build_object('ok', false, 'error', 'fiche introuvable'); end if;
  return jsonb_build_object('ok', true);
end $function$;

-- La sélection à remesurer lit maintenant les DEUX endroits, la colonne d'abord.
create or replace function public.sentinelle_a_remesurer(p_max int default 8, p_jours int default 30)
returns jsonb language sql stable security definer set search_path to 'public' as $function$
  select coalesce(jsonb_agg(x), '[]'::jsonb) from (
    select jsonb_build_object(
             'id',       s.id,
             'nom',      s.nom,
             'place_id', coalesce(s.place_id, s.fiche->'_auraCalc'->>'place_id'),
             'activite', coalesce(s.fiche->>'activite', s.fiche->>'secteur', s.fiche->>'archetype'),
             'couleur',  s.fiche->'aura'->>'couleur',
             'siren',    s.fiche->'_registre'->>'siren'
           ) as x
      from public.sentinelles s
     where coalesce(s.place_id, s.fiche->'_auraCalc'->>'place_id') is not null
       and (s.mesure_le is null or s.mesure_le < now() - make_interval(days => p_jours))
       and s.maj_le < now() - make_interval(days => p_jours)
     order by coalesce(s.mesure_le, s.maj_le) asc
     limit greatest(1, least(p_max, 25))
  ) t;
$function$;

-- ── 4. LA LECTURE : LA COURBE REÇOIT LES POINTS GRATUITS ────────────────────────────────────
-- Corps repris à l'identique de docs/sentinelle-verrou.sql, avec DEUX ajouts et rien d'autre :
--   · `mesures` est lu en même temps que le reste ;
--   · ses points rejoignent `serie`, puis l'ensemble est trié par date.
-- ⚠️ LA GARDE `auth.uid() is null` RESTE EN PREMIÈRE LIGNE. C'est elle qui empêche un visiteur
--    sans compte de lire le fichier prospects. Ne jamais la retirer pour essayer la fonction
--    dans l'éditeur SQL — auth.uid() y vaut TOUJOURS NULL, la réponse `found: false` y est donc
--    normale et ne prouve rien.
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
    select nom, ville, adresse, fiche, historique, mesures, maj_le, mesure_le into v
    from public.sentinelles
    where length(nom_norm) >= 3 and p like '%'||nom_norm||'%'
      and (ville_norm = '' or p like '%'||regexp_replace(ville_norm,'[0-9]','','g')||'%')
      and adresse_norm <> '' and (adresse_norm like '%'||pa||'%' or pa like '%'||adresse_norm||'%')
    order by cree_le desc limit 1;
  else
    select nom, ville, adresse, fiche, historique, mesures, maj_le, mesure_le into v
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

  -- Les points gratuits de la re-mesure mensuelle, exactement à la même forme.
  serie := serie || coalesce((
    select jsonb_agg(jsonb_build_object(
             'date', m->>'date', 'ive', m->>'ive', 'couleur', m->>'couleur',
             'note', m->>'note', 'avis', m->>'avis', 'site', m->>'site', 'gratuite', true))
      from jsonb_array_elements(coalesce(v.mesures,'[]'::jsonb)) m), '[]'::jsonb);

  -- Un seul tri, à la fin : la courbe reçoit les points dans l'ordre du temps.
  select coalesce(jsonb_agg(e order by e->>'date'), '[]'::jsonb)
    into serie from jsonb_array_elements(serie) e;

  return jsonb_build_object('found', true, 'nom', v.nom, 'ville', v.ville, 'adresse', v.adresse,
           'date', v.maj_le::date, 'dernier', v.maj_le::date, 'fiche', v.fiche, 'serie', serie,
           'mesures', coalesce(v.mesures,'[]'::jsonb), 'mesure_le', v.mesure_le);
end $function$;


-- ── 5. LES DROITS — C'EST ICI QUE SE JOUE LA SÉCURITÉ ───────────────────────────────────────
-- Les deux fonctions de re-mesure appartiennent au SERVEUR SEUL. Sa clé (`service_role`) ne
-- quitte jamais Vercel. Aucun compte client ne peut ni déclencher une re-mesure, ni fabriquer
-- un point de courbe.
revoke all on function public.sentinelle_a_remesurer(int, int)          from public, anon, authenticated;
revoke all on function public.sentinelle_sans_place(int)                from public, anon, authenticated;
revoke all on function public.sentinelle_place_poser(bigint, text, text, text, text) from public, anon, authenticated;
grant execute on function public.sentinelle_sans_place(int)             to service_role;
grant execute on function public.sentinelle_place_poser(bigint, text, text, text, text) to service_role;
revoke all on function public.sentinelle_mesure_poser(bigint, jsonb)    from public, anon, authenticated;
grant execute on function public.sentinelle_a_remesurer(int, int)       to service_role;
grant execute on function public.sentinelle_mesure_poser(bigint, jsonb) to service_role;

-- La lecture ne change pas de régime : les comptes connectés, jamais les visiteurs.
revoke all on function public.sentinelle_get(text, text) from public, anon;
grant execute on function public.sentinelle_get(text, text) to authenticated;


-- ═══ VÉRIFICATION ══════════════════════════════════════════════════════════════════════════
-- 1. Les colonnes sont là et les droits sont les bons :
--      select p.proname, coalesce(array_to_string(p.proacl::text[], ' | '), 'PAR DEFAUT') as droits
--        from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--       where n.nspname = 'public'
--         and p.proname in ('sentinelle_a_remesurer','sentinelle_mesure_poser','sentinelle_get');
--    Attendu : les deux premières → service_role SEUL. sentinelle_get → authenticated.
--
-- 2. Combien d'entreprises la première nuit va-t-elle pouvoir remesurer ?
--      select count(*) filter (where fiche->'_auraCalc'->>'place_id' is not null) as mesurables,
--             count(*) as total
--        from sentinelles;
--    Une fiche sans place_id ne sera JAMAIS remesurée : elle date d'avant l'enregistrement de
--    l'identifiant Google. Elle le gagnera à sa prochaine analyse complète.
--
-- 3. Le lendemain de la mise en ligne, ce que le minuteur a réellement posé :
--      select nom, mesure_le, jsonb_array_length(mesures) as points,
--             mesures->-1->>'date' as dernier_point, mesures->-1->>'note' as note
--        from sentinelles where mesure_le is not null order by mesure_le desc limit 10;

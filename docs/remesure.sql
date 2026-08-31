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
             'place_id', g.pid,
             'nom',      g.nom,
             'activite', g.activite,
             'couleur',  g.couleur,
             'siren',    g.siren
           ) as x
      from (
        /* UNE LIGNE PAR ÉTABLISSEMENT, pas par fiche. Les valeurs retenues (activité, aura,
           siren) sont celles de l'analyse la PLUS RÉCENTE du groupe : si deux fiches décrivent
           le même commerce, c'est la dernière payée qui fait foi. */
        select coalesce(s.place_id, s.fiche->'_auraCalc'->>'place_id') as pid,
               max(s.maj_le)    as der_analyse,
               max(s.mesure_le) as der_mesure,
               (array_agg(s.nom order by s.maj_le desc))[1] as nom,
               (array_agg(coalesce(s.fiche->>'activite', s.fiche->>'secteur', s.fiche->>'archetype')
                          order by s.maj_le desc))[1] as activite,
               (array_agg(s.fiche->'aura'->>'couleur'      order by s.maj_le desc))[1] as couleur,
               (array_agg(s.fiche->'_registre'->>'siren'   order by s.maj_le desc))[1] as siren
          from public.sentinelles s
         where coalesce(s.place_id, s.fiche->'_auraCalc'->>'place_id') is not null
         group by 1
      ) g
     where (g.der_mesure is null or g.der_mesure < now() - make_interval(days => p_jours))
       and g.der_analyse < now() - make_interval(days => p_jours)
     order by coalesce(g.der_mesure, g.der_analyse) asc
     limit greatest(1, least(p_max, 25))
  ) t;
$function$;


-- ── 3. RANGER UN POINT ──────────────────────────────────────────────────────────────────────
-- ⚠️ `mesure_le` EST MIS À JOUR MÊME QUAND LA DATE EXISTE DÉJÀ (le point remplace alors
--    l'ancien). Sinon une entreprise déjà mesurée aujourd'hui reviendrait en tête de liste
--    demain, puis après-demain, et occuperait indéfiniment une des huit places du tour.
-- ⚠️ ON GARDE 60 POINTS AU PLUS : cinq ans d'historique mensuel. Au-delà, la colonne enflerait
--    sans que personne ne remonte jamais aussi loin dans la courbe.
-- ⚠️ LE POINT SE POSE SUR L'ÉTABLISSEMENT, PAS SUR LA LIGNE (31/08/2026, mesuré en vrai).
--    Trois établissements figuraient en double sous des noms différents — « La Romana » et
--    « LE ROMANA (PIZZERIA ROMANA) », deux « CERIBE », « Feu Vert » et « Feu Vert Chartres 3
--    Carrefour ». Même identifiant Google, même adresse : c'est le même commerce. Ligne par
--    ligne, on paierait DEUX appels Google par mois pour un seul commerce et on dessinerait
--    deux fois la même courbe. On regroupe donc sur l'identifiant — jamais sur le nom, qui est
--    précisément ce qui diverge.
-- ⚠️ ET ON NE SUPPRIME RIEN. Chaque doublon contient une analyse payée : laquelle garder est
--    une décision de Didier, pas un effet de bord d'un correctif.
drop function if exists public.sentinelle_mesure_poser(text, jsonb);
create or replace function public.sentinelle_mesure_poser(p_place_id text, p_point jsonb)
returns jsonb language plpgsql security definer set search_path to 'public' as $function$
declare v_j text; v_n int;
begin
  if coalesce(trim(p_place_id),'') = '' then
    return jsonb_build_object('ok', false, 'error', 'identifiant vide');
  end if;
  if p_point is null or jsonb_typeof(p_point) <> 'object' or (p_point->>'date') is null then
    return jsonb_build_object('ok', false, 'error', 'point invalide');
  end if;
  v_j := p_point->>'date';

  /* Une seule écriture : elle remplace le point du jour s'il existe déjà, range par date, et
     ne garde que les 60 derniers (cinq ans d'historique mensuel). */
  update public.sentinelles s
     set mesures = (
           select coalesce(jsonb_agg(z.e order by z.e->>'date'), '[]'::jsonb)
             from (
               select u.m as e, row_number() over (order by u.m->>'date' desc) as rn
                 from (
                   select m from jsonb_array_elements(s.mesures) m where m->>'date' <> v_j
                   union all
                   select p_point
                 ) u(m)
             ) z
            where z.rn <= 60
         ),
         mesure_le = now()
   where coalesce(s.place_id, s.fiche->'_auraCalc'->>'place_id') = p_place_id;

  get diagnostics v_n = row_count;
  if v_n = 0 then return jsonb_build_object('ok', false, 'error', 'aucune fiche pour cet identifiant'); end if;
  return jsonb_build_object('ok', true, 'fiches', v_n);
end $function$;


-- ── 3 bis. LE SERVEUR PROPOSE, DIDIER VALIDE ────────────────────────────────────────────────
-- Ce qui a précédé, et pourquoi on change de principe (31/08/2026). Le rattrapage accrochait
-- tout seul un établissement Google à chaque fiche. Deux garde-fous ont été ajoutés coup sur
-- coup — la ville, puis l'adresse — et à chaque fois les vraies données ont trouvé le trou
-- suivant : cinq fiches « Feu Vert » de Chartres sur un seul magasin dont deux sont ailleurs,
-- et une fiche d'essai créditée de 2 473 avis.
-- Le défaut n'est pas dans le réglage : un NOM dans un fichier prospects ne suffit pas à
-- désigner un ÉTABLISSEMENT. Or SENTINELLE ne vaut que par une chose — ne jamais afficher un
-- chiffre mesuré dont on n'est pas sûr. Une courbe fausse et crédible est pire qu'une absence
-- de courbe.
--
-- ⚠️ LA SÉPARATION QUI FAIT TOUT : `place_propose` est ce que la machine a trouvé, `place_id`
--    est ce que Didier a validé. La re-mesure ne lit QUE `place_id`. Une proposition ne peut
--    donc jamais produire un relevé, quelle que soit la suite du code.
alter table public.sentinelles add column if not exists place_id      text;
alter table public.sentinelles add column if not exists place_nom     text;
alter table public.sentinelles add column if not exists place_adresse text;
alter table public.sentinelles add column if not exists place_le      timestamptz;
alter table public.sentinelles add column if not exists place_propose jsonb;

-- Les fiches sans établissement VALIDÉ, et pas encore proposées depuis 90 jours.
create or replace function public.sentinelle_sans_place(p_max int default 8)
returns jsonb language sql stable security definer set search_path to 'public' as $function$
  select coalesce(jsonb_agg(x), '[]'::jsonb) from (
    select jsonb_build_object('id', s.id, 'nom', s.nom, 'ville', s.ville, 'adresse', s.adresse) as x
      from public.sentinelles s
     where s.place_id is null
       and s.fiche->'_auraCalc'->>'place_id' is null
       -- `place_le` retient la DATE de la recherche, qu'elle ait abouti ou non : sans cela, une
       -- fiche introuvable repartirait en tête de liste chaque nuit et brûlerait un appel
       -- payant, indéfiniment, sans rien produire.
       and (s.place_le is null or s.place_le < now() - interval '90 days')
     order by s.maj_le desc
     limit greatest(1, least(p_max, 25))
  ) t;
$function$;

-- ⚠️ CETTE FONCTION N'ÉCRIT JAMAIS `place_id`. C'est sa raison d'être.
drop function if exists public.sentinelle_place_poser(bigint, text, text, text);
drop function if exists public.sentinelle_place_poser(bigint, text, text, text, text);
create or replace function public.sentinelle_place_proposer(p_id bigint, p_propose jsonb)
returns jsonb language plpgsql security definer set search_path to 'public' as $function$
begin
  if p_propose is null or jsonb_typeof(p_propose) <> 'object' then
    return jsonb_build_object('ok', false, 'error', 'proposition invalide');
  end if;
  update public.sentinelles
     set place_propose = p_propose || jsonb_build_object('le', current_date::text),
         place_le = now()
   where id = p_id;
  if not found then return jsonb_build_object('ok', false, 'error', 'fiche introuvable'); end if;
  return jsonb_build_object('ok', true);
end $function$;

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
revoke all on function public.sentinelle_place_proposer(bigint, jsonb) from public, anon, authenticated;
grant execute on function public.sentinelle_sans_place(int)             to service_role;
grant execute on function public.sentinelle_place_proposer(bigint, jsonb) to service_role;
revoke all on function public.sentinelle_mesure_poser(text, jsonb)    from public, anon, authenticated;
grant execute on function public.sentinelle_a_remesurer(int, int)       to service_role;
grant execute on function public.sentinelle_mesure_poser(text, jsonb) to service_role;

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

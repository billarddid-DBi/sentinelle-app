-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- ensure_my_entreprise — LA CAUSE DES CENTAINES DE « Mon entreprise »
-- 01/08/2026
--
-- ⚠️ CE FICHIER MODIFIE LA BASE. Il remplace une fonction. Rien n'est supprimé, aucune donnée
--    n'est touchée — mais ce n'est plus de la lecture, contrairement au fichier de diagnostic.
--
-- ═══ CE QUE FAIT LA VERSION ACTUELLE ═══════════════════════════════════════════════════════
--   select entreprise_id into v_ent from profils where id = auth.uid();
--   if v_ent is not null then return v_ent; end if;                     ← réutilise, très bien
--   select coalesce(…, email, 'Mon entreprise') into v_nom
--     from auth.users where id = auth.uid();
--   insert into entreprises (nom) values (…) returning id into v_ent;
--   update profils set entreprise_id = v_ent where id = auth.uid();     ← 0 ligne si auth.uid()
--   return v_ent;                                                          est NULL
--
-- ═══ LE DÉFAUT ═════════════════════════════════════════════════════════════════════════════
-- La fonction est SECURITY DEFINER : elle s'exécute même sans session. Quand auth.uid() vaut
-- NULL — un appel fait avant que la session soit rétablie, ou depuis une page ouverte sans
-- compte — voici ce qui se passe, ligne par ligne :
--   · `where id = null` ne rend AUCUNE ligne  → v_ent reste NULL, donc on ne réutilise rien ;
--   · la lecture de auth.users ne rend rien non plus → v_nom reste NULL ;
--   · l'insert crée donc une entreprise nommée « Mon entreprise » (le dernier coalesce) ;
--   · l'update `where id = null` ne touche AUCUNE ligne : rien n'est mémorisé ;
--   · l'appel suivant recommence tout, à l'identique.
-- UNE ENTREPRISE « Mon entreprise » PAR APPEL SANS SESSION. C'est exactement ce que montre la
-- base de Didier : quelques dizaines de noms réels, et des centaines de « Mon entreprise ».
--
-- Le second défaut, plus rare : si le profil n'existe pas encore pour un utilisateur pourtant
-- connecté, l'update ne trouve pas sa ligne et ne mémorise rien non plus. Même conséquence.
--
-- ═══ LA CORRECTION ═════════════════════════════════════════════════════════════════════════
-- 1. Sans session, on ne crée RIEN. On rend NULL, et l'application s'en accommode déjà :
--    frEntreprise() retourne null et les écrans savent l'afficher.
-- 2. Le profil est créé s'il manque, pour que la mémorisation aboutisse toujours.
-- 3. On vérifie que la mémorisation a bien eu lieu avant de rendre l'entreprise.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

create or replace function public.ensure_my_entreprise(p_nom text default null::text)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_uid uuid;
  v_ent uuid;
  v_nom text;
begin
  -- ── LE GARDE-FOU QUI MANQUAIT ────────────────────────────────────────────────────────────
  -- Sans utilisateur identifié, cette fonction n'a rien à créer : elle ne saurait à qui
  -- rattacher l'entreprise, et c'est précisément ce qui produisait une ligne orpheline par
  -- appel. Une fonction qui ne peut pas savoir ne doit rien écrire.
  v_uid := auth.uid();
  if v_uid is null then
    return null;
  end if;

  -- ── RÉUTILISER AVANT DE CRÉER ────────────────────────────────────────────────────────────
  select entreprise_id into v_ent from public.profils where id = v_uid;
  if v_ent is not null then
    return v_ent;
  end if;

  -- ── LE NOM ───────────────────────────────────────────────────────────────────────────────
  -- Même ordre qu'avant : ce que l'application propose, sinon les métadonnées du compte,
  -- sinon l'email. « Mon entreprise » reste le dernier recours, mais il ne devrait plus jamais
  -- servir : sans utilisateur, on est déjà sorti plus haut.
  select coalesce(nullif(trim(p_nom), ''),
                  raw_user_meta_data->>'entreprise',
                  email,
                  'Mon entreprise')
    into v_nom
    from auth.users
   where id = v_uid;

  insert into public.entreprises (nom)
       values (coalesce(v_nom, 'Mon entreprise'))
    returning id into v_ent;

  -- ── MÉMORISER, ET S'EN ASSURER ───────────────────────────────────────────────────────────
  -- L'update seul ne suffisait pas : si le profil n'existe pas encore, il ne touche aucune
  -- ligne et l'entreprise créée est aussitôt orpheline — le prochain appel en refait une.
  insert into public.profils (id, entreprise_id)
       values (v_uid, v_ent)
  on conflict (id) do update set entreprise_id = excluded.entreprise_id
       where public.profils.entreprise_id is null;

  -- On relit : c'est la seule preuve que le rattachement a tenu.
  select entreprise_id into v_ent from public.profils where id = v_uid;
  return v_ent;
end;
$function$;


-- ═══ APRÈS AVOIR EXÉCUTÉ CE QUI PRÉCÈDE ════════════════════════════════════════════════════
-- Vérifier que la fonction rend bien NULL sans session, au lieu de créer une ligne.
-- Dans l'éditeur SQL, auth.uid() vaut justement NULL : c'est le cas fautif, reproduit à
-- l'identique. Le compteur AVANT et APRÈS doit être le même.
--
-- select count(*) as avant from entreprises;
-- select ensure_my_entreprise('test');   -- doit rendre NULL, et ne rien créer
-- select count(*) as apres from entreprises;
--
-- (les trois lignes ci-dessus sont volontairement en commentaire : décommentez-les pour les
--  lancer, une fois la fonction remplacée)

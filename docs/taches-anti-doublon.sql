-- ============================================================================
--  TACHES — LA BASE REFUSE DEUX FOIS LA MEME TACHE
--  A executer dans le SQL Editor Supabase :
--  https://supabase.com/dashboard/project/cpsgkfgyywljwdnfalno/sql/new
-- ============================================================================
--
--  POURQUOI (31/07/2026, sur les donnees reelles de Didier)
--  --------------------------------------------------------
--  Il avait saisi 7 taches ; l'ecran en affichait 34. Cause : la fusion des
--  anciens seaux de stockage du navigateur ne dedoublonnait que sur l'`id`. Or
--  une tache presente dans deux seaux y porte deux id DIFFERENTS — c'est
--  precisement pour cela qu'elle avait ete perdue. Les deux exemplaires
--  partent alors dans `taches` sous deux `cle` distinctes, et la contrainte
--  unique(entreprise_id, cle) ne voit rien.
--
--  Le garde-fou pose cote navigateur (pmFusion, v139) ne suffit PAS :
--   - il ne repare pas un cache qui contient DEJA les deux exemplaires ;
--   - le temoin qui empeche la fusion de se rejouer est stocke dans le
--     navigateur. Sur un deuxieme PC ou un telephone, elle repart de zero et
--     reinjecte tout. Constate : 12 taches des 20 et 28 juillet reinserees
--     d'un bloc, sous des identifiants neufs, apres nettoyage.
--
--  Donc la regle descend dans la base : elle est la seule que TOUS les
--  appareils partagent.
--
--  CE QUE FAIT LE DECLENCHEUR
--  --------------------------
--  Avant chaque INSERT, si une tache de la MEME entreprise porte deja la meme
--  forme normalisee (`norm`) ET la meme echeance (`due_le`), l'insertion est
--  ABANDONNEE en silence. L'UPDATE n'est jamais bloque : modifier une tache
--  existante reste libre.
--
--  CE QU'IL NE FAIT PAS, ET C'EST VOULU
--  ------------------------------------
--   - `norm` vide ou NULL : on ne touche a rien. Sans forme normalisee on ne
--     peut pas comparer, et refuser au hasard serait pire.
--   - echeance differente : les deux passent. « Relancer Michel » le 25 juillet
--     et le 10 aout sont deux vraies taches.
--
--  LE COMPROMIS A CONNAITRE
--  ------------------------
--  Une tache archivee compte encore. Si vous archivez « Envoyer les colis »
--  pour le 28 et voulez la redicter POUR LE MEME JOUR, elle sera refusee : il
--  faut la desarchiver, ou lui donner une autre echeance. C'est le prix d'un
--  garde-fou qui resiste aussi aux reinjections d'un vieux cache.
-- ============================================================================

create or replace function public.taches_anti_doublon()
returns trigger language plpgsql security definer set search_path = public
as $$
declare v_id bigint;
begin
  -- Sans forme normalisee, aucune comparaison fiable : on laisse passer.
  if new.norm is null or btrim(new.norm) = '' then
    return new;
  end if;

  select t.id into v_id
    from public.taches t
   where t.entreprise_id = new.entreprise_id
     and t.norm = new.norm
     and t.due_le is not distinct from new.due_le   -- NULL = NULL ici, volontairement
   limit 1;

  if v_id is null then
    return new;                 -- rien de semblable : on cree
  end if;

  return null;                  -- deja presente : on n'en cree pas une seconde
end $$;

drop trigger if exists trg_taches_anti_doublon on public.taches;

create trigger trg_taches_anti_doublon
  before insert on public.taches
  for each row execute function public.taches_anti_doublon();

-- ---------------------------------------------------------------------------
--  VERIFICATION — a lancer apres coup. Doit ne renvoyer AUCUNE ligne.
-- ---------------------------------------------------------------------------
-- select norm, count(*) as nb
--   from public.taches
--  where norm is not null and btrim(norm) <> ''
--  group by norm, due_le
-- having count(*) > 1
--  order by 2 desc;

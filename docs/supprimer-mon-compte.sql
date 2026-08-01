-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- SUPPRESSION DE SON PROPRE COMPTE PAR LE DIRIGEANT — 01/08/2026
--
-- ⚠️ CE FICHIER MODIFIE LA BASE : il crée une fonction. Il ne supprime rien par lui-même.
--    La fonction, elle, supprime DÉFINITIVEMENT et sans retour possible.
--
-- POURQUOI ELLE EXISTE. Un client doit pouvoir faire disparaître ses données sans passer par
-- nous : c'est un droit, et c'est aussi ce qui rend le reste crédible. Aujourd'hui la seule
-- fonction de suppression est admin_reset_test_account, réservée à l'administrateur et faite
-- pour supprimer un AUTRE compte que le sien.
--
-- CE QU'ELLE SUPPRIME, dans cet ordre — les enfants d'abord, sinon les clés étrangères
-- refusent :
--   1. tout ce qui pend à l'entreprise du compte : tâches, réponses de salariés, enquêtes,
--      instantanés, décisions, feuille de route, journées, bloc de sauvegarde, fiches, événements ;
--   2. l'entreprise elle-même — SEULEMENT si aucun autre profil ne la désigne (un cabinet
--      pourrait partager une entreprise entre deux comptes : on ne supprime pas le dossier
--      d'un associé parce que l'autre s'en va) ;
--   3. le profil ;
--   4. le compte d'authentification, ce qui libère l'adresse e-mail pour une réinscription.
--
-- CE QU'ELLE NE FAIT PAS : elle ne demande AUCUNE confirmation. La confirmation appartient à
-- l'écran, qui exige que le dirigeant retape son adresse. Une fonction serveur qui poserait une
-- question serait une fausse sécurité — n'importe quel appel direct la contournerait.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

create or replace function public.supprimer_mon_compte()
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_uid   uuid;
  v_ent   uuid;
  v_autre int;
  v_ent_supprimee boolean := false;
begin
  -- ── LE GARDE-FOU, D'ABORD ────────────────────────────────────────────────────────────────
  -- SECURITY DEFINER veut dire que cette fonction s'exécute avec tous les droits. Sans
  -- utilisateur identifié, elle ne sait pas QUI supprimer : elle refuse. C'est la leçon
  -- d'ensure_my_entreprise, qui créait une entreprise orpheline à chaque appel anonyme — ici
  -- l'oubli ne créerait pas du bruit, il détruirait au hasard.
  v_uid := auth.uid();
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'Aucun compte identifié.');
  end if;

  select entreprise_id into v_ent from public.profils where id = v_uid;

  -- ── 1. LES DONNÉES DE L'ENTREPRISE ───────────────────────────────────────────────────────
  if v_ent is not null then
    -- Un autre compte partage-t-il cette entreprise ? On regarde AVANT d'effacer quoi que ce
    -- soit : si oui, on ne touche ni à l'entreprise ni à ses données, elles ne sont pas qu'à
    -- celui qui part.
    select count(*) into v_autre
      from public.profils
     where entreprise_id = v_ent and id <> v_uid;

    if v_autre = 0 then
      delete from public.taches            where entreprise_id = v_ent;
      delete from public.reponses_salaries where entreprise_id = v_ent;
      delete from public.enquetes_salaries where entreprise_id = v_ent;
      delete from public.snapshots         where entreprise_id = v_ent;
      delete from public.decisions         where entreprise_id = v_ent;
      delete from public.feuille_route     where entreprise_id = v_ent;
      delete from public.journees          where entreprise_id = v_ent;
      delete from public.pm_data           where entreprise_id = v_ent;
      delete from public.fiches            where entreprise_id = v_ent;
      delete from public.events            where entreprise_id = v_ent;

      -- ── 2. L'ENTREPRISE ────────────────────────────────────────────────────────────────
      delete from public.entreprises where id = v_ent;
      v_ent_supprimee := true;
    end if;
  end if;

  -- ── 3. LE PROFIL ─────────────────────────────────────────────────────────────────────────
  delete from public.profils where id = v_uid;

  -- ── 4. LE COMPTE D'AUTHENTIFICATION ──────────────────────────────────────────────────────
  -- Libère l'adresse e-mail : le dirigeant peut se réinscrire plus tard s'il le souhaite.
  delete from auth.users where id = v_uid;

  return jsonb_build_object('ok', true,
                            'entreprise_supprimee', v_ent_supprimee,
                            'partagee', (v_ent is not null and not v_ent_supprimee));
end;
$function$;

-- Le dirigeant connecté doit pouvoir l'appeler. Personne d'autre : la fonction n'agit que sur
-- auth.uid(), donc « exécuter » ne donne le droit de supprimer QUE son propre compte.
revoke all on function public.supprimer_mon_compte() from public;
grant execute on function public.supprimer_mon_compte() to authenticated;


-- ═══ VÉRIFICATION APRÈS INSTALLATION ═══════════════════════════════════════════════════════
-- Dans l'éditeur SQL, auth.uid() vaut NULL : la fonction doit REFUSER, sans rien supprimer.
-- C'est le seul essai qu'on peut faire ici sans détruire un vrai compte.
--
--   select supprimer_mon_compte();
--
-- Résultat attendu : {"ok": false, "error": "Aucun compte identifié."}
-- Si elle rend autre chose, NE PAS la mettre en service.
--
-- ⚠️ NE PAS TESTER LA SUPPRESSION RÉELLE SUR UN COMPTE QUI COMPTE. Créez un compte d'essai
--    depuis l'application, connectez-vous avec, puis utilisez le bouton de l'écran « Mon
--    compte ». C'est le seul essai qui vérifie le chemin complet.

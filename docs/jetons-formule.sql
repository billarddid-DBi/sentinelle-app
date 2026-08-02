-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- ATTRIBUER LA FORMULE DEPUIS LA CONSOLE — 02/08/2026
--
-- ⚠️ CE FICHIER MODIFIE LA BASE : une fonction. Il ne supprime rien.
--
-- ═══ CE QU'ON SUPPRIME : UN GESTE MANUEL QUI RATE ══════════════════════════════════════════
-- Depuis le 02/08, toute ligne `jetons` naît en `mensuel / 30`, quoi qu'ait choisi le client à
-- l'écran — et c'est voulu : la formule était lue dans `raw_user_meta_data`, ÉCRIT PAR LE
-- NAVIGATEUR, donc un client pouvait s'attribuer 390 jetons. Conséquence : chaque client annuel
-- exigeait un `update jetons` à la main.
--
-- Et ce geste rate. Constaté le jour même : l'update lancé AVANT la première connexion du
-- client ne trouve aucune ligne, répond « Success » — et personne ne voit que rien n'a changé.
-- Le client reste à 30 jetons.
--
-- ═══ POURQUOI UNE FONCTION, ET PAS UN UPDATE DEPUIS LA CONSOLE ═════════════════════════════
-- La console pourrait écrire dans `jetons` directement : la politique RLS l'autorise pour
-- l'administrateur. Deux raisons de ne pas le faire :
--   1. LE CALCUL DE LA PÉRIODE. 'A2026' ou '2026-08' selon la formule. Écrit dans la console, ce
--      calcul existerait en TROIS exemplaires (SQL, index.html, console.html) et finirait par
--      diverger. Ici il reste dans `jetons_periode()`, un seul endroit.
--   2. LE BARÈME. 30 ou 390 sont décidés par la base, pas envoyés par la page — une console
--      détournée ne peut pas offrir 10 000 jetons.
--
-- ⚠️ CHANGER DE FORMULE REMET LE COMPTEUR À ZÉRO. C'est délibéré : la nouvelle formule ouvre
--    une nouvelle période. Les PACKS RACHETÉS, eux, sont conservés — ils ont été payés.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

create or replace function public.jetons_formule(p_entreprise_id uuid, p_formule text)
returns jsonb language plpgsql security definer set search_path to 'public' as $function$
declare v_inclus int; v_per text; r public.jetons%rowtype;
begin
  -- La garde interne, séparée des droits d'exécution : une fonction SECURITY DEFINER ignore
  -- la RLS, elle doit donc se garder elle-même.
  if not public.is_admin() then
    return jsonb_build_object('ok', false, 'error', 'Réservé à l''administrateur.');
  end if;
  if p_formule is null or p_formule not in ('mensuel','annuel') then
    return jsonb_build_object('ok', false, 'error', 'Formule inconnue.');
  end if;
  if not exists (select 1 from public.entreprises where id = p_entreprise_id) then
    return jsonb_build_object('ok', false, 'error', 'Entreprise inconnue.');
  end if;

  v_inclus := case when p_formule = 'annuel' then 390 else 30 end;
  v_per    := public.jetons_periode(p_formule);

  -- L'insert couvre le cas qui faisait échouer l'update manuel : le client ne s'est pas encore
  -- connecté, sa ligne n'existe pas. Ici elle est créée.
  insert into public.jetons(entreprise_id, formule, inclus, periode, utilises, packs)
       values (p_entreprise_id, p_formule, v_inclus, v_per, 0, 0)
  on conflict (entreprise_id) do update
     set formule = excluded.formule,
         inclus  = excluded.inclus,
         periode = excluded.periode,
         utilises = 0,               -- nouvelle formule = nouvelle période
         maj_le  = now();            -- `packs` n'est PAS touché : il a été payé

  select * into r from public.jetons where entreprise_id = p_entreprise_id;
  return jsonb_build_object('ok', true, 'formule', r.formule, 'inclus', r.inclus,
                            'periode', r.periode, 'utilises', r.utilises, 'packs', r.packs,
                            'reste', greatest(0, r.inclus - r.utilises) + r.packs);
end; $function$;

revoke all on function public.jetons_formule(uuid, text) from public, anon;
grant execute on function public.jetons_formule(uuid, text) to authenticated;
-- `authenticated` suffit : la fonction refuse d'elle-même quiconque n'est pas administrateur.


-- ═══ APRÈS INSTALLATION ════════════════════════════════════════════════════════════════════
-- 1. Sans session, auth.uid() est NULL dans cet éditeur, donc is_admin() est faux :
--      select jetons_formule('00000000-0000-0000-0000-000000000000','annuel');
--    Attendu : {"ok": false, "error": "Réservé à l'administrateur."}
--    ⚠️ C'est un contrôle FAIBLE : il ne prouve que la garde, pas le cloisonnement réel.
--       Le seul essai qui compte est dans la console, connecté.
--
-- 2. ⚠️ PUIS DANS LA CONSOLE : « Suivi des abonnements », colonne Formule, cliquer sur
--    « → passer en annuel ». La ligne doit afficher 390 jetons et le prix passer à 129 €.

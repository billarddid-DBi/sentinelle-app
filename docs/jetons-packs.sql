-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- CRÉDITER UN PACK RACHETÉ DEPUIS LA CONSOLE — 02/08/2026
--
-- ⚠️ CE FICHIER MODIFIE LA BASE : une fonction. Il ne supprime rien.
--
-- ═══ CE QU'ON SUPPRIME : LE DERNIER SQL À LA MAIN ══════════════════════════════════════════
-- Les packs se vendent 30 pour 7,50 € · 100 pour 20 € · 300 pour 50 €. Jusqu'ici, créditer un
-- pack acheté demandait d'écrire une requête — exactement le geste qu'on vient de supprimer
-- pour la formule, avec les mêmes façons de rater (ligne inexistante, « Success » qui ne dit
-- pas combien de lignes ont bougé).
--
-- ═══ TROIS DÉCISIONS ═══════════════════════════════════════════════════════════════════════
--
-- 1. LE JOURNAL ENREGISTRE AUSSI LES CRÉDITS, avec un `cout` NÉGATIF et le motif 'pack'.
--    C'est de l'argent : il faut pouvoir dire qui a été crédité de quoi et quand.
--    ⚠️ CONSÉQUENCE À NE PAS OUBLIER : la requête « ce que consomme un client » doit désormais
--       filtrer `where cout > 0`, sinon les crédits viennent en déduction de la consommation
--       et le coût par client paraît plus bas qu'il n'est.
--
-- 2. UN RETRAIT NE PEUT PAS RENDRE LE SOLDE NÉGATIF. La condition est DANS le `where` de
--    l'update, comme pour la consommation : la base vérifie et écrit dans le même geste.
--
-- 3. LA FONCTION CRÉE LA LIGNE si le client ne s'est pas encore connecté — le cas précis qui
--    faisait échouer les updates manuels en silence.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

create or replace function public.jetons_packs(p_entreprise_id uuid, p_nb integer)
returns jsonb language plpgsql security definer set search_path to 'public' as $function$
declare r public.jetons%rowtype; v_nb int; v_maj int; v_per text;
begin
  if not public.is_admin() then
    return jsonb_build_object('ok', false, 'error', 'Réservé à l''administrateur.');
  end if;
  v_nb := coalesce(p_nb, 0);
  if v_nb = 0 then return jsonb_build_object('ok', false, 'error', 'Nombre nul.'); end if;
  -- Un garde-fou de saisie : une faute de frappe ne doit pas créditer cent mille jetons.
  if v_nb < -10000 or v_nb > 10000 then
    return jsonb_build_object('ok', false, 'error', 'Nombre hors limites (±10 000).');
  end if;
  if not exists (select 1 from public.entreprises where id = p_entreprise_id) then
    return jsonb_build_object('ok', false, 'error', 'Entreprise inconnue.');
  end if;

  insert into public.jetons(entreprise_id, periode)
       values (p_entreprise_id, public.jetons_periode('mensuel'))
  on conflict (entreprise_id) do nothing;

  -- La clause `where` refuse d'elle-même un retrait trop grand : aucun état intermédiaire
  -- n'est lisible entre la vérification et l'écriture.
  update public.jetons set packs = packs + v_nb, maj_le = now()
   where entreprise_id = p_entreprise_id and packs + v_nb >= 0;
  get diagnostics v_maj = row_count;
  if v_maj = 0 then
    return jsonb_build_object('ok', false, 'error', 'Retrait supérieur aux packs disponibles.');
  end if;

  select periode into v_per from public.jetons where entreprise_id = p_entreprise_id;
  insert into public.jetons_mouvements(entreprise_id, cout, motif, periode)
       values (p_entreprise_id, -v_nb, 'pack', v_per);

  select * into r from public.jetons where entreprise_id = p_entreprise_id;
  return jsonb_build_object('ok', true, 'packs', r.packs, 'inclus', r.inclus,
                            'utilises', r.utilises, 'formule', r.formule,
                            'reste', greatest(0, r.inclus - r.utilises) + r.packs);
end; $function$;

revoke all on function public.jetons_packs(uuid, integer) from public, anon;
grant execute on function public.jetons_packs(uuid, integer) to authenticated;
-- `authenticated` suffit : la fonction refuse d'elle-même quiconque n'est pas administrateur.


-- ═══ APRÈS INSTALLATION ════════════════════════════════════════════════════════════════════
-- 1. Sans session, auth.uid() est NULL dans cet éditeur, donc is_admin() est faux :
--      select jetons_packs('00000000-0000-0000-0000-000000000000', 30);
--    Attendu : {"ok": false, "error": "Réservé à l'administrateur."}
--
-- 2. ⚠️ PUIS DANS LA CONSOLE : « Suivi des abonnements », colonne Jetons, bouton « + pack ».
--
-- 3. LA REQUÊTE DE CONSOMMATION, corrigée — noter le `where cout > 0` :
--      select motif, count(*) as fois, sum(cout) as jetons
--        from jetons_mouvements where cout > 0 group by motif order by jetons desc;
--
--    Et celle des crédits accordés :
--      select e.nom, -m.cout as jetons_credites, m.cree_le
--        from jetons_mouvements m join entreprises e on e.id = m.entreprise_id
--       where m.cout < 0 order by m.cree_le desc;

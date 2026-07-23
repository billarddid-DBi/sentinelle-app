-- =============================================================================
-- Réinitialiser un compte de test : supprime la fiche SENTINELLE liée + le compte.
-- Réservé à l'admin (is_admin()). Appelé par le bouton de la console.
-- =============================================================================
create or replace function public.admin_reset_test_account(p_email text)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare v_uid uuid; v_sentnom text; v_norm text; v_fiches int := 0;
begin
  if not public.is_admin() then
    return jsonb_build_object('ok', false, 'error', 'Réservé à l''administrateur');
  end if;
  select id, raw_user_meta_data->>'sent_nom'
    into v_uid, v_sentnom
    from auth.users
    where lower(email) = lower(trim(p_email));
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'Compte introuvable pour ' || coalesce(p_email,''));
  end if;
  -- Fiche SENTINELLE rattachée au compte (via le nom officiel mémorisé)
  if v_sentnom is not null then
    v_norm := public.s_norm(v_sentnom);
    if length(v_norm) >= 3 then
      delete from public.sentinelles where nom_norm = v_norm;
      get diagnostics v_fiches = row_count;
    end if;
  end if;
  -- Le compte (libère l'email). La cascade nettoie les données liées (profil, etc.).
  delete from auth.users where id = v_uid;
  return jsonb_build_object('ok', true, 'email', p_email, 'fiches_supprimees', v_fiches);
end $$;
grant execute on function public.admin_reset_test_account(text) to authenticated;

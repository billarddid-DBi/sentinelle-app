-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- LES JETONS PASSENT EN BASE — 01/08/2026
--
-- ⚠️ CE FICHIER MODIFIE LA BASE : deux tables et deux fonctions. Il ne supprime rien.
--
-- ═══ CE QU'ON CORRIGE ══════════════════════════════════════════════════════════════════════
-- Le solde vivait dans `localStorage` : modifiable en trente secondes depuis la console du
-- navigateur, et remis à neuf par un simple nettoyage. C'est de l'argent — c'était le dernier
-- gros trou de l'application.
--
-- ═══ DEUX PIÈGES QUI ONT DICTÉ LA CONCEPTION ═══════════════════════════════════════════════
--
-- 1. LE QUOTA NE VIENT PAS DES MÉTADONNÉES DU COMPTE.
--    L'application lit aujourd'hui la formule dans `raw_user_meta_data->>'ive_plan'`. Or ce
--    champ est écrit par le NAVIGATEUR (updateUser) : un client peut y mettre « annuel » et
--    s'attribuer 390 jetons au lieu de 30. Le quota vit donc dans une colonne que seul
--    l'administrateur peut écrire.
--
-- 2. LE DÉCOMPTE DOIT ÊTRE ATOMIQUE.
--    « lire le solde, vérifier, écrire le nouveau » en trois temps laisse une fenêtre : deux
--    clics rapprochés passent tous les deux le test avant que l'un des deux n'écrive. Ici la
--    vérification et l'écriture tiennent dans UN SEUL update conditionnel — la base tranche.
-- ═══════════════════════════════════════════════════════════════════════════════════════════


-- ── LE SOLDE ────────────────────────────────────────────────────────────────────────────────
create table if not exists public.jetons (
  entreprise_id uuid primary key references public.entreprises(id) on delete cascade,
  formule       text    not null default 'mensuel',   -- 'mensuel' ou 'annuel'
  inclus        integer not null default 30,          -- 30/mois ou 390/an — ADMIN SEUL
  periode       text    not null default '',          -- '2026-08' ou 'A2026'
  utilises      integer not null default 0,
  packs         integer not null default 0,           -- jetons rachetés, ils survivent au mois
  maj_le        timestamptz not null default now()
);

-- ── LE JOURNAL ──────────────────────────────────────────────────────────────────────────────
-- Une ligne par consommation. C'est ce qui manquait pour répondre à « combien me coûte un
-- client » : sans journal, on connaît le solde mais jamais ce qui l'a fait descendre.
create table if not exists public.jetons_mouvements (
  id            bigserial primary key,
  entreprise_id uuid not null references public.entreprises(id) on delete cascade,
  cout          integer not null,
  motif         text,
  periode       text,
  cree_le       timestamptz not null default now()
);
create index if not exists jetons_mvt_ent on public.jetons_mouvements(entreprise_id, cree_le desc);

alter table public.jetons enable row level security;
alter table public.jetons_mouvements enable row level security;

-- Le dirigeant LIT son solde et son journal. Il n'écrit NI l'un NI l'autre : seules les
-- fonctions ci-dessous (SECURITY DEFINER) et l'administrateur le font. C'est ce qui rend le
-- décompte infalsifiable.
drop policy if exists jetons_select on public.jetons;
create policy jetons_select on public.jetons
  for select using (is_admin() or entreprise_id = my_entreprise());
drop policy if exists jetons_admin on public.jetons;
create policy jetons_admin on public.jetons
  for all using (is_admin()) with check (is_admin());

drop policy if exists jetons_mvt_select on public.jetons_mouvements;
create policy jetons_mvt_select on public.jetons_mouvements
  for select using (is_admin() or entreprise_id = my_entreprise());
drop policy if exists jetons_mvt_admin on public.jetons_mouvements;
create policy jetons_mvt_admin on public.jetons_mouvements
  for all using (is_admin()) with check (is_admin());

grant select on public.jetons, public.jetons_mouvements to authenticated;


-- ── LA PÉRIODE COURANTE ─────────────────────────────────────────────────────────────────────
-- Mensuel : le compteur repart chaque mois. Annuel : chaque année. Les packs rachetés, eux,
-- ne sont jamais remis à zéro — ils ont été payés.
create or replace function public.jetons_periode(p_formule text)
-- `stable` et non `immutable` : la fonction dépend de now(). Déclarée immutable, PostgreSQL
-- s'autoriserait à figer sa valeur dans un plan mis en cache — et le mois ne changerait plus.
returns text language sql stable as $$
  select case when p_formule = 'annuel'
              then 'A' || to_char(now(), 'YYYY')
              else to_char(now(), 'YYYY-MM') end;
$$;


-- ── LIRE SON SOLDE (et créer la ligne au premier passage) ───────────────────────────────────
create or replace function public.jetons_solde()
returns jsonb language plpgsql security definer set search_path to 'public' as $function$
declare v_uid uuid; v_ent uuid; r public.jetons%rowtype; v_per text;
begin
  v_uid := auth.uid();
  if v_uid is null then return jsonb_build_object('ok', false, 'error', 'Aucun compte identifié.'); end if;
  select entreprise_id into v_ent from public.profils where id = v_uid;
  if v_ent is null then return jsonb_build_object('ok', false, 'error', 'Aucune entreprise.'); end if;

  select * into r from public.jetons where entreprise_id = v_ent;
  if not found then
    insert into public.jetons(entreprise_id, periode)
         values (v_ent, jetons_periode('mensuel'))
    on conflict (entreprise_id) do nothing;
    select * into r from public.jetons where entreprise_id = v_ent;
  end if;

  -- Nouvelle période : le compteur repart, les packs restent.
  v_per := jetons_periode(r.formule);
  if r.periode is distinct from v_per then
    update public.jetons set periode = v_per, utilises = 0, maj_le = now()
     where entreprise_id = v_ent;
    select * into r from public.jetons where entreprise_id = v_ent;
  end if;

  return jsonb_build_object('ok', true, 'formule', r.formule, 'inclus', r.inclus,
                            'utilises', r.utilises, 'packs', r.packs, 'periode', r.periode,
                            'reste', greatest(0, r.inclus - r.utilises) + r.packs);
end; $function$;


-- ── CONSOMMER ───────────────────────────────────────────────────────────────────────────────
-- LE CŒUR. Un seul update conditionnel : la base vérifie ET écrit dans le même geste. Deux
-- clics simultanés ne peuvent pas passer tous les deux.
create or replace function public.jetons_consommer(p_cout integer, p_motif text default null)
returns jsonb language plpgsql security definer set search_path to 'public' as $function$
declare v_uid uuid; v_ent uuid; v_per text; v_form text; v_maj int;
begin
  v_uid := auth.uid();
  if v_uid is null then return jsonb_build_object('ok', false, 'error', 'Aucun compte identifié.'); end if;
  if coalesce(p_cout,0) <= 0 then return public.jetons_solde(); end if;   -- gratuit : rien à décompter

  select entreprise_id into v_ent from public.profils where id = v_uid;
  if v_ent is null then return jsonb_build_object('ok', false, 'error', 'Aucune entreprise.'); end if;

  perform public.jetons_solde();   -- crée la ligne et remet la période à jour si besoin
  select formule, periode into v_form, v_per from public.jetons where entreprise_id = v_ent;

  /* L'UPDATE FAIT LE CONTRÔLE. La clause `where` refuse d'elle-même si le solde ne suffit pas :
     aucun état intermédiaire n'est lisible entre la vérification et l'écriture. On puise
     d'abord dans les jetons inclus, puis dans les packs rachetés. */
  update public.jetons
     set utilises = utilises + least(p_cout, greatest(0, inclus - utilises)),
         packs    = packs    - greatest(0, p_cout - greatest(0, inclus - utilises)),
         maj_le   = now()
   where entreprise_id = v_ent
     and greatest(0, inclus - utilises) + packs >= p_cout;
  get diagnostics v_maj = row_count;

  if v_maj = 0 then
    /* ⚠️ L'ORDRE DES DEUX OPÉRANDES EST LE SUJET. Avec `a || b`, c'est b qui gagne sur les clés
       communes. Écrit dans l'autre sens, le `ok:true` du solde écrasait le `ok:false` du refus —
       et le navigateur lançait l'analyse en croyant avoir payé. Le solde d'abord, le verdict
       ensuite. */
    return public.jetons_solde() || jsonb_build_object('ok', false, 'error', 'Solde insuffisant.');
  end if;

  insert into public.jetons_mouvements(entreprise_id, cout, motif, periode)
       values (v_ent, p_cout, left(coalesce(p_motif,''), 60), v_per);

  return public.jetons_solde();
end; $function$;

revoke all on function public.jetons_solde()             from public, anon;
revoke all on function public.jetons_consommer(integer, text) from public, anon;
grant execute on function public.jetons_solde()          to authenticated;
grant execute on function public.jetons_consommer(integer, text) to authenticated;


-- ═══ APRÈS INSTALLATION ════════════════════════════════════════════════════════════════════
-- 1. Vérifier que la fonction refuse sans session (auth.uid() est NULL dans cet éditeur) :
--      select jetons_solde();
--    Attendu : {"ok": false, "error": "Aucun compte identifié."}
--
-- 2. Poser la formule des clients ANNUELS — c'est vous, l'administrateur, qui le faites ; le
--    client ne peut pas se l'attribuer. Pour votre propre compte :
--      update jetons set formule = 'annuel', inclus = 390
--       where entreprise_id = (select entreprise_id from profils
--                               where id = (select id from auth.users
--                                            where email = 'billard.did@gmail.com'));
--    (la ligne n'existe qu'après un premier passage dans l'application)
--
-- 3. Et enfin, ce que personne n'avait : savoir ce que consomme un client.
--      select motif, count(*) as fois, sum(cout) as jetons
--        from jetons_mouvements group by motif order by jetons desc;

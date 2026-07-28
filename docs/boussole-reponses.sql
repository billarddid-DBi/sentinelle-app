-- =============================================================================
-- Réponses au questionnaire d'entrée BOUSSOLE (les 5 questions + l'intention).
-- NON EXÉCUTÉ pour l'instant : l'application stocke aujourd'hui dans localStorage,
-- derrière la couche iveStore (index.html). Exécuter ce script quand on voudra
-- rendre les réponses durables et exploitables (historique, observation du quotidien).
-- Après exécution, il suffira de brancher iveStore.load/save sur ces RPC.
-- =============================================================================

create table if not exists public.boussole_reponses (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  v              int         not null default 1,
  personnes      int,
  poste_principal text,
  heures_semaine int,
  retards        text[]      not null default '{}',
  nombre_retards int         not null default 0,
  cout_horaire   int,
  heures_an      int,
  euros_an       int,
  intention      text,                    -- chaud | tiede | froid
  termine_le     timestamptz,
  maj_le         timestamptz not null default now()
);

alter table public.boussole_reponses enable row level security;

-- Chacun ne voit et ne modifie que ses propres réponses.
drop policy if exists boussole_reponses_select on public.boussole_reponses;
create policy boussole_reponses_select on public.boussole_reponses
  for select using (auth.uid() = user_id);

drop policy if exists boussole_reponses_upsert on public.boussole_reponses;
create policy boussole_reponses_upsert on public.boussole_reponses
  for insert with check (auth.uid() = user_id);

drop policy if exists boussole_reponses_update on public.boussole_reponses;
create policy boussole_reponses_update on public.boussole_reponses
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Enregistrement en une seule fois (le client envoie l'objet complet).
create or replace function public.boussole_reponses_save(p jsonb)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare v_uid uuid := auth.uid();
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'Non authentifié');
  end if;
  insert into public.boussole_reponses as b (
    user_id, v, personnes, poste_principal, heures_semaine, retards, nombre_retards,
    cout_horaire, heures_an, euros_an, intention, termine_le, maj_le)
  values (
    v_uid,
    coalesce((p->>'v')::int, 1),
    nullif(p->>'personnes','')::int,
    nullif(p->>'postePrincipal',''),
    nullif(p->>'heuresSemaine','')::int,
    coalesce((select array_agg(x) from jsonb_array_elements_text(coalesce(p->'retards','[]'::jsonb)) x), '{}'),
    coalesce(nullif(p->>'nombreRetards','')::int, 0),
    nullif(p->>'coutHoraire','')::int,
    nullif(p->>'heuresAn','')::int,
    nullif(p->>'eurosAn','')::int,
    nullif(p->>'intentionChangement',''),
    nullif(p->>'termineLe','')::timestamptz,
    now())
  on conflict (user_id) do update set
    v = excluded.v, personnes = excluded.personnes, poste_principal = excluded.poste_principal,
    heures_semaine = excluded.heures_semaine, retards = excluded.retards,
    nombre_retards = excluded.nombre_retards, cout_horaire = excluded.cout_horaire,
    heures_an = excluded.heures_an, euros_an = excluded.euros_an,
    intention = excluded.intention, termine_le = excluded.termine_le, maj_le = now();
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.boussole_reponses_get()
returns jsonb language sql security definer set search_path = public
as $$
  select coalesce(to_jsonb(b), '{}'::jsonb) from public.boussole_reponses b where b.user_id = auth.uid();
$$;

grant execute on function public.boussole_reponses_save(jsonb) to authenticated;
grant execute on function public.boussole_reponses_get() to authenticated;

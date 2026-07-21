-- =============================================================================
-- FACTURATION LIVE (DBi360, micro-entreprise) — à exécuter dans le SQL Editor
-- Idempotent : ré-exécutable sans casse.
-- =============================================================================

-- 1. Infos de facturation du CLIENT (complète la table entreprises)
alter table public.entreprises add column if not exists adresse            text;
alter table public.entreprises add column if not exists siret              text;
alter table public.entreprises add column if not exists tel                text;
alter table public.entreprises add column if not exists email_facturation  text;

-- 2. RÉGLAGES ÉMETTEUR (1 seule ligne : les mentions DBi360 qui figurent sur chaque facture)
create table if not exists public.reglages_facturation (
  id     smallint primary key default 1 check (id = 1),
  data   jsonb not null default '{}'::jsonb,   -- {nom, statut, adresse, siren, email, tel, iban, bic, mention_tva, penalites}
  maj_le timestamptz not null default now()
);
alter table public.reglages_facturation enable row level security;
drop policy if exists regl_admin on public.reglages_facturation;
create policy regl_admin on public.reglages_facturation
  for all using (public.is_admin()) with check (public.is_admin());

-- 3. FACTURES — le "client" est photographié en jsonb au moment de l'émission (obligation : une
--    facture émise ne change plus, même si le client déménage ensuite)
create table if not exists public.factures (
  id            bigint generated always as identity primary key,
  numero        text not null unique,             -- LIVE-2026-0001 (chronologique, sans trou)
  entreprise_id uuid references public.entreprises(id) on delete set null,
  plan          text not null check (plan in ('mensuel','annuel')),
  type          text not null check (type in ('prorata','pleine')),
  periode_debut date not null,
  periode_fin   date not null,
  montant       numeric(10,2) not null,
  statut        text not null default 'emise' check (statut in ('emise','envoyee','payee','annulee')),
  client        jsonb not null,                   -- {nom, adresse, siret, email, tel} photographié
  emetteur      jsonb not null,                   -- réglages DBi360 photographiés
  lignes        jsonb not null default '[]'::jsonb,
  emise_le      timestamptz not null default now(),
  payee_le      timestamptz
);
create index if not exists idx_factures_ent on public.factures(entreprise_id, emise_le desc);
alter table public.factures enable row level security;
drop policy if exists fact_admin on public.factures;
create policy fact_admin on public.factures
  for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists fact_dirigeant_lit on public.factures;
create policy fact_dirigeant_lit on public.factures
  for select using (entreprise_id = public.my_entreprise());

-- 4. COMPTEUR de numérotation (garantit la séquence chronologique SANS TROU, par année)
create table if not exists public.facture_compteur (
  annee   int primary key,
  dernier int not null default 0
);
alter table public.facture_compteur enable row level security;
drop policy if exists cpt_admin on public.facture_compteur;
create policy cpt_admin on public.facture_compteur
  for all using (public.is_admin()) with check (public.is_admin());

-- 5. RPC : créer une facture (numérotation + insertion dans LA MÊME transaction → jamais de trou)
create or replace function public.creer_facture(
  p_entreprise_id uuid,
  p_plan   text,
  p_type   text,
  p_debut  date,
  p_fin    date,
  p_montant numeric,
  p_client  jsonb,
  p_emetteur jsonb,
  p_lignes  jsonb
) returns public.factures
language plpgsql security definer set search_path = public
as $$
declare
  v_an  int := extract(year from now())::int;
  v_num int;
  v_row public.factures;
begin
  if not public.is_admin() then
    raise exception 'Réservé à l''administrateur';
  end if;
  insert into public.facture_compteur(annee, dernier) values (v_an, 1)
    on conflict (annee) do update set dernier = public.facture_compteur.dernier + 1
    returning dernier into v_num;
  insert into public.factures(numero, entreprise_id, plan, type, periode_debut, periode_fin,
                              montant, client, emetteur, lignes)
  values ('LIVE-'||v_an||'-'||lpad(v_num::text,4,'0'), p_entreprise_id, p_plan, p_type,
          p_debut, p_fin, p_montant, p_client, p_emetteur, p_lignes)
  returning * into v_row;
  return v_row;
end $$;
grant execute on function public.creer_facture(uuid,text,text,date,date,numeric,jsonb,jsonb,jsonb) to authenticated;

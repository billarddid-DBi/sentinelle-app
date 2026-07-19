-- =============================================================================
--  LIVE / DBi360 — Schéma Postgres pour Supabase (base centrale multi-comptes)
--  À exécuter dans : Supabase > SQL Editor > New query > Run.
--  Ordre : extensions -> tables -> index -> vues -> RLS -> triggers.
--  Tout est idempotent autant que possible (IF NOT EXISTS / OR REPLACE).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. Extensions utiles
-- -----------------------------------------------------------------------------
create extension if not exists "pgcrypto";      -- gen_random_uuid()

-- =============================================================================
-- 1. TABLES
-- =============================================================================

-- 1.1 ENTREPRISES  — un client = une entreprise pilotée par un dirigeant
create table if not exists public.entreprises (
  id            uuid primary key default gen_random_uuid(),
  nom           text not null,
  slug          text unique,                 -- ex "LA_ROMANA" (compat clés localStorage cp_snaps_<slug>)
  secteur       text,                         -- ex "Restauration", "Automobile", "Immobilier"
  taille        text,                         -- ex "1-9", "10-49", "50-249"
  ville         text,
  code_postal   text,
  notes_admin   text,                         -- notes privées de Didier (jamais lues par le dirigeant)
  cree_le       timestamptz not null default now(),
  maj_le        timestamptz not null default now()
);
comment on table public.entreprises is 'Un client = une entreprise. notes_admin réservé à l''admin.';

-- 1.2 PROFILS  — extension applicative de auth.users (1 ligne par utilisateur connecté)
--     Le rôle vit ici. Un dirigeant est rattaché à UNE entreprise. Didier = admin.
create table if not exists public.profils (
  id            uuid primary key references auth.users(id) on delete cascade,
  entreprise_id uuid references public.entreprises(id) on delete set null,
  role          text not null default 'dirigeant'
                  check (role in ('dirigeant','admin')),
  nom_complet   text,
  email         text,
  cree_le       timestamptz not null default now()
);
comment on table public.profils is 'Lie auth.users a une entreprise + porte le role (dirigeant|admin).';

-- 1.3 SNAPSHOTS  — chaque mesure datée (reprend la structure du snapshot localStorage)
--     Un snapshot localStorage = {d,t,ive,image,pot,iat,imh,resist,piliers,indices,peurs,av}
create table if not exists public.snapshots (
  id            bigint generated always as identity primary key,
  entreprise_id uuid not null references public.entreprises(id) on delete cascade,
  auteur_id     uuid references auth.users(id) on delete set null,  -- qui a produit la mesure
  d             date not null,                -- date de la mesure (champ "d")
  t             timestamptz not null default now(), -- horodatage précis (champ "t")
  ive           smallint,                     -- indice IVE /100 (maturité technique)
  image         smallint,                     -- sous-indice image
  pot           smallint,                     -- potentiel
  iat           smallint,                     -- indice IAT /100 (maturité humaine)
  imh           smallint,                     -- indice maturité humaine
  resist        smallint,                     -- niveau de résistance
  peurs         smallint,                     -- nombre de peurs recensées
  av            smallint,                     -- % d'avancement de la feuille de route
  piliers       jsonb default '{}'::jsonb,    -- {pilier: valeur, ...}
  indices       jsonb default '{}'::jsonb,    -- {indice: valeur, ...} (les 8 indices humains)
  cree_le       timestamptz not null default now()
);
comment on table public.snapshots is 'Trajectoire : une ligne par mesure (BOUSSOLE/AURA/CONTROLE).';

-- 1.4 FEUILLE_ROUTE  — la feuille de route EN COURS d'une entreprise (1 ligne active / entreprise)
--     Structure localStorage : {steps:[{id,palier,type,titre,detail,echeance,status,note,help}], chat:[...]}
create table if not exists public.feuille_route (
  id            bigint generated always as identity primary key,
  entreprise_id uuid not null references public.entreprises(id) on delete cascade,
  steps         jsonb not null default '[]'::jsonb,  -- tableau d'étapes
  chat          jsonb not null default '[]'::jsonb,  -- historique de chat lié à la feuille
  next_point    date,                                -- date du prochain point (ex cp_next_<slug>)
  maj_le        timestamptz not null default now(),
  cree_le       timestamptz not null default now(),
  unique (entreprise_id)                              -- une seule feuille active par entreprise
);
comment on table public.feuille_route is 'Feuille de route courante (steps + chat) par entreprise.';

-- 1.5 EVENTS  — journal de fréquentation (alimente les alertes de la console)
create table if not exists public.events (
  id            bigint generated always as identity primary key,
  entreprise_id uuid not null references public.entreprises(id) on delete cascade,
  auteur_id     uuid references auth.users(id) on delete set null,
  type          text not null,                -- 'login','controle','boussole','aura','miroir','maj_feuille','ouverture'
  meta          jsonb default '{}'::jsonb,    -- infos libres (ex étape modifiée)
  cree_le       timestamptz not null default now()
);
comment on table public.events is 'Traçage de fréquentation/engagement. Base des alertes stagnation/silence.';

-- 1.6 FICHES (optionnel) — remplace à terme les JSON commités dans GitHub
create table if not exists public.fiches (
  id            bigint generated always as identity primary key,
  entreprise_id uuid references public.entreprises(id) on delete cascade,
  auteur_id     uuid references auth.users(id) on delete set null,
  kind          text not null check (kind in ('sentinelle','boussole','miroir','aura','feuille')),
  nom           text,
  contenu       jsonb not null,               -- le JSON de la fiche
  html          text,                         -- rendu HTML optionnel
  cree_le       timestamptz not null default now()
);
comment on table public.fiches is 'Fiches structurees (remplace les fichiers GitHub). Optionnel en phase 1.';

-- =============================================================================
-- 2. INDEX (accélèrent la console)
-- =============================================================================
create index if not exists idx_profils_entreprise   on public.profils(entreprise_id);
create index if not exists idx_snapshots_ent_date    on public.snapshots(entreprise_id, d desc);
create index if not exists idx_events_ent_date       on public.events(entreprise_id, cree_le desc);
create index if not exists idx_events_type           on public.events(type);
create index if not exists idx_fiches_ent            on public.fiches(entreprise_id, cree_le desc);
create index if not exists idx_entreprises_secteur   on public.entreprises(secteur);

-- =============================================================================
-- 3. FONCTION UTILITAIRE : suis-je admin ?  (évite la récursion RLS)
--    SECURITY DEFINER pour lire public.profils sans être bloqué par sa propre RLS.
-- =============================================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profils p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- Renvoie l'entreprise du user courant (pour les politiques dirigeant)
create or replace function public.my_entreprise()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select entreprise_id from public.profils where id = auth.uid();
$$;

-- =============================================================================
-- 4. ROW LEVEL SECURITY
--    Règle d'or : dirigeant => uniquement SON entreprise ; admin (Didier) => tout.
-- =============================================================================
alter table public.entreprises   enable row level security;
alter table public.profils       enable row level security;
alter table public.snapshots     enable row level security;
alter table public.feuille_route enable row level security;
alter table public.events        enable row level security;
alter table public.fiches        enable row level security;

-- ---- 4.1 ENTREPRISES --------------------------------------------------------
-- Le dirigeant lit SON entreprise ; l'admin lit toutes.
create policy entreprises_select on public.entreprises
  for select using ( public.is_admin() or id = public.my_entreprise() );
-- Seul l'admin cree/modifie/supprime une entreprise (onboarding piloté par Didier).
create policy entreprises_admin_write on public.entreprises
  for all using ( public.is_admin() ) with check ( public.is_admin() );

-- ---- 4.2 PROFILS ------------------------------------------------------------
-- Chacun lit son profil ; l'admin lit tous les profils.
create policy profils_select on public.profils
  for select using ( public.is_admin() or id = auth.uid() );
-- L'utilisateur peut mettre a jour SON profil (nom), mais PAS son role ni son entreprise
-- (ces deux colonnes ne doivent etre changees que par l'admin -> voir note ci-dessous).
create policy profils_update_self on public.profils
  for update using ( id = auth.uid() ) with check ( id = auth.uid() );
-- L'admin gere tout.
create policy profils_admin_all on public.profils
  for all using ( public.is_admin() ) with check ( public.is_admin() );
-- NOTE SECURITE : pour empecher un dirigeant de s'auto-promouvoir admin via profils_update_self,
--   ajouter un trigger BEFORE UPDATE qui rejette tout changement de role/entreprise_id
--   sauf si public.is_admin(). (Fourni en 6.3 ci-dessous.)

-- ---- 4.3 SNAPSHOTS ----------------------------------------------------------
create policy snapshots_select on public.snapshots
  for select using ( public.is_admin() or entreprise_id = public.my_entreprise() );
create policy snapshots_insert on public.snapshots
  for insert with check ( public.is_admin() or entreprise_id = public.my_entreprise() );
create policy snapshots_update on public.snapshots
  for update using ( public.is_admin() or entreprise_id = public.my_entreprise() );

-- ---- 4.4 FEUILLE_ROUTE ------------------------------------------------------
create policy feuille_select on public.feuille_route
  for select using ( public.is_admin() or entreprise_id = public.my_entreprise() );
create policy feuille_upsert on public.feuille_route
  for all using ( public.is_admin() or entreprise_id = public.my_entreprise() )
          with check ( public.is_admin() or entreprise_id = public.my_entreprise() );

-- ---- 4.5 EVENTS -------------------------------------------------------------
create policy events_select on public.events
  for select using ( public.is_admin() or entreprise_id = public.my_entreprise() );
create policy events_insert on public.events
  for insert with check ( public.is_admin() or entreprise_id = public.my_entreprise() );

-- ---- 4.6 FICHES -------------------------------------------------------------
create policy fiches_select on public.fiches
  for select using ( public.is_admin() or entreprise_id = public.my_entreprise() );
create policy fiches_insert on public.fiches
  for insert with check ( public.is_admin() or entreprise_id = public.my_entreprise() );

-- =============================================================================
-- 5. VUE CONSOLE : une ligne par client, prête à afficher (calculs faits en SQL)
--    Contient : dernier snapshot, tendance IAT/IVE, derniere activite, nb controles.
--    La RLS des tables sous-jacentes s'applique : seul l'admin verra toutes les lignes.
-- =============================================================================
create or replace view public.v_console_clients
with (security_invoker = true) as
with dernier as (   -- dernier snapshot par entreprise
  select distinct on (entreprise_id)
         entreprise_id, d as dernier_d, ive, iat, imh, av, peurs, resist
  from public.snapshots
  order by entreprise_id, d desc, t desc
),
avant as (          -- avant-dernier snapshot (pour la tendance)
  select entreprise_id, ive as ive_prec, iat as iat_prec
  from (
    select entreprise_id, ive, iat,
           row_number() over (partition by entreprise_id order by d desc, t desc) as rn
    from public.snapshots
  ) s where rn = 2
),
compteurs as (
  select entreprise_id,
         count(*) filter (where type = 'controle')                    as nb_controles,
         max(cree_le)                                                  as derniere_activite,
         count(*) filter (where cree_le > now() - interval '30 days')  as actions_30j
  from public.events group by entreprise_id
)
select
  e.id, e.nom, e.secteur, e.taille, e.ville,
  d.dernier_d, d.ive, d.iat, d.imh, d.av, d.peurs, d.resist,
  (d.iat - a.iat_prec)                         as delta_iat,
  (d.ive - a.ive_prec)                         as delta_ive,
  coalesce(c.nb_controles, 0)                  as nb_controles,
  c.derniere_activite,
  coalesce(c.actions_30j, 0)                   as actions_30j,
  fr.next_point,
  -- statut synthetique pour la pastille de la console
  case
    when c.derniere_activite is null
      or c.derniere_activite < now() - interval '45 days'      then 'silence'
    when (d.iat - a.iat_prec) < 0 or (d.ive - a.ive_prec) < 0  then 'regression'
    when a.iat_prec is not null
      and (d.iat - a.iat_prec) = 0 and (d.ive - a.ive_prec) = 0 then 'stagnation'
    else 'ok'
  end as statut
from public.entreprises e
left join dernier   d  on d.entreprise_id  = e.id
left join avant     a  on a.entreprise_id  = e.id
left join compteurs c  on c.entreprise_id  = e.id
left join public.feuille_route fr on fr.entreprise_id = e.id;

comment on view public.v_console_clients is 'Ligne par client pour la console (statut = ok|stagnation|regression|silence).';

-- =============================================================================
-- 6. TRIGGERS
-- =============================================================================

-- 6.1 Création auto du profil à l'inscription (role dirigeant par défaut)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profils (id, email, role)
  values (new.id, new.email, 'dirigeant')
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 6.2 maj_le auto (entreprises + feuille_route)
create or replace function public.touch_maj()
returns trigger language plpgsql as $$
begin new.maj_le = now(); return new; end; $$;

drop trigger if exists trg_touch_entreprises on public.entreprises;
create trigger trg_touch_entreprises before update on public.entreprises
  for each row execute function public.touch_maj();

drop trigger if exists trg_touch_feuille on public.feuille_route;
create trigger trg_touch_feuille before update on public.feuille_route
  for each row execute function public.touch_maj();

-- 6.3 Anti auto-promotion : un non-admin ne peut pas changer son role ni son entreprise
create or replace function public.guard_profil_privileges()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    if new.role is distinct from old.role
       or new.entreprise_id is distinct from old.entreprise_id then
      raise exception 'Modification de role/entreprise interdite (reservee a l''admin).';
    end if;
  end if;
  return new;
end; $$;

drop trigger if exists trg_guard_profil on public.profils;
create trigger trg_guard_profil before update on public.profils
  for each row execute function public.guard_profil_privileges();

-- =============================================================================
-- 7. (À FAIRE UNE FOIS, MANUELLEMENT) — promouvoir Didier en admin
--    Après que Didier a créé SON compte via l'app (magic link), récupérer son
--    user id dans Supabase > Authentication > Users, puis :
--
--    update public.profils set role = 'admin' where email = 'billard.did@gmail.com';
--
--    (Volontairement laissé en commentaire : action manuelle et unique.)
-- =============================================================================

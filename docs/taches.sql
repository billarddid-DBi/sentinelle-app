-- =============================================================================
--  LE QUOTIDIEN EN VRAIES LIGNES — taches, decisions, journees
--
--  Pourquoi : jusqu'ici tout le quotidien tenait dans UN SEUL bloc JSON par entreprise
--  (table pm_data). Deux appareils ouverts en meme temps ecrasaient mutuellement le bloc
--  entier : le dernier qui ecrit gagne, l'autre perd son travail sans un mot.
--  Avec une ligne par tache, deux appareils qui modifient des taches differentes ne se
--  genent plus du tout.
--
--  A coller dans le SQL Editor. Purement ADDITIF : ne touche a aucune donnee existante.
--  pm_data reste en place et continue de fonctionner (filet de securite).
-- =============================================================================

-- -----------------------------------------------------------------------------
--  1. LES TABLES
-- -----------------------------------------------------------------------------

-- « cle » = l'identifiant genere par l'application (pmUid). Il est unique PAR entreprise,
-- pas globalement : d'ou la contrainte composite plutot qu'une cle primaire directe.
create table if not exists public.taches (
  id            bigint generated always as identity primary key,
  entreprise_id uuid not null references public.entreprises(id) on delete cascade,
  auteur_id     uuid references auth.users(id) on delete set null,
  cle           text not null,
  texte         text not null,
  norm          text,                                  -- forme normalisee (detection des repetitions)
  categorie     text,
  source        text,                                  -- 'clavier' | 'voix'
  origine       text,                                  -- 'plan' quand elle vient de la feuille de route
  fr_id         text,                                  -- l'etape de feuille de route liee
  priorite      smallint not null default 0,
  echeance      date,
  rappel        timestamptz,
  rappel_code   text,
  rappel_fait   boolean not null default false,
  faite         boolean not null default false,
  faite_le      date,
  archivee      boolean not null default false,
  reports       smallint not null default 0,
  creee_le      date,
  due_le        date,
  ts            timestamptz,
  maj_le        timestamptz not null default now(),
  unique (entreprise_id, cle)
);
comment on table public.taches is 'Le quotidien du dirigeant, une ligne par tache (remplace le bloc pm_data.tasks).';

create table if not exists public.decisions (
  id            bigint generated always as identity primary key,
  entreprise_id uuid not null references public.entreprises(id) on delete cascade,
  auteur_id     uuid references auth.users(id) on delete set null,
  cle           text not null,
  texte         text not null,
  creee_le      date,
  resolue       boolean not null default false,
  maj_le        timestamptz not null default now(),
  unique (entreprise_id, cle)
);
comment on table public.decisions is 'Decisions en attente (remplace le bloc pm_data.decisions).';

-- Une ligne par jour et par entreprise : climat d'equipe, pouls tresorerie, geste du jour.
create table if not exists public.journees (
  entreprise_id uuid not null references public.entreprises(id) on delete cascade,
  jour          date not null,
  climat        smallint,
  treso         smallint,
  geste         text,
  maj_le        timestamptz not null default now(),
  primary key (entreprise_id, jour)
);
comment on table public.journees is 'Le point du matin, un jour par ligne (remplace le bloc pm_data.days).';

-- -----------------------------------------------------------------------------
--  2. INDEX — les lectures reelles de l'application
-- -----------------------------------------------------------------------------
create index if not exists idx_taches_entreprise      on public.taches (entreprise_id);
create index if not exists idx_taches_a_faire         on public.taches (entreprise_id, faite, archivee);
create index if not exists idx_taches_creee           on public.taches (entreprise_id, creee_le);
create index if not exists idx_decisions_entreprise   on public.decisions (entreprise_id);
create index if not exists idx_journees_entreprise    on public.journees (entreprise_id, jour);

-- -----------------------------------------------------------------------------
--  3. CLOISONNEMENT — mêmes regles que les autres tables : chacun chez soi.
--     (cf. la faille corrigee le 31/07 : sans ces regles, tout le monde voit tout)
-- -----------------------------------------------------------------------------
alter table public.taches    enable row level security;
alter table public.decisions enable row level security;
alter table public.journees  enable row level security;

drop policy if exists taches_tout on public.taches;
create policy taches_tout on public.taches
  for all using      ( public.is_admin() or entreprise_id = public.my_entreprise() )
      with check      ( public.is_admin() or entreprise_id = public.my_entreprise() );

drop policy if exists decisions_tout on public.decisions;
create policy decisions_tout on public.decisions
  for all using      ( public.is_admin() or entreprise_id = public.my_entreprise() )
      with check      ( public.is_admin() or entreprise_id = public.my_entreprise() );

drop policy if exists journees_tout on public.journees;
create policy journees_tout on public.journees
  for all using      ( public.is_admin() or entreprise_id = public.my_entreprise() )
      with check      ( public.is_admin() or entreprise_id = public.my_entreprise() );

-- -----------------------------------------------------------------------------
--  4. maj_le automatique
-- -----------------------------------------------------------------------------
drop trigger if exists trg_touch_taches on public.taches;
create trigger trg_touch_taches before update on public.taches
  for each row execute function public.touch_maj();

drop trigger if exists trg_touch_decisions on public.decisions;
create trigger trg_touch_decisions before update on public.decisions
  for each row execute function public.touch_maj();

drop trigger if exists trg_touch_journees on public.journees;
create trigger trg_touch_journees before update on public.journees
  for each row execute function public.touch_maj();

-- -----------------------------------------------------------------------------
--  5. VERIFICATION — les trois lignes doivent afficher 0 (tables neuves et vides)
-- -----------------------------------------------------------------------------
select 'taches' as table_creee, count(*) as lignes from public.taches
union all select 'decisions', count(*) from public.decisions
union all select 'journees',  count(*) from public.journees
order by 1;

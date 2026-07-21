-- =============================================================================
-- BASE SENTINELLE (fichier prospects) + VERROU ANTI-DOUBLON — idempotent
-- Règle : UNE entreprise = UNE SENTINELLE gratuite, à vie. Admin = passe-droit.
-- =============================================================================

-- 0. Normalisation (minuscules + alphanumérique seulement, accents conservés)
create or replace function public.s_norm(t text) returns text
language sql immutable as
$$ select regexp_replace(lower(coalesce(t,'')),'[^a-z0-9àâäéèêëîïôöùûüç]','','g') $$;

-- 1. LA TABLE — chaque scan SENTINELLE archivé pour toujours (pipeline prospect)
create table if not exists public.sentinelles (
  id            bigint generated always as identity primary key,
  nom           text not null,
  ville         text,
  nom_norm      text not null,
  ville_norm    text not null default '',
  email         text,                          -- email du dirigeant (capté à l'envoi du PDF)
  email_domaine text,                          -- domaine pro (jamais gmail/orange/free…)
  statut        text not null default 'scanne'
                check (statut in ('scanne','pdf_envoye','relance_1','relance_2','relance_3','compte_cree','abonne','desinscrit')),
  fiche         jsonb,                         -- le JSON complet du scan
  html          text,                          -- la fiche HTML (pour régénérer/renvoyer le PDF)
  scans         int not null default 1,        -- nb de fois refaite (passe-droit admin)
  cree_le       timestamptz not null default now(),
  maj_le        timestamptz not null default now()
);
create unique index if not exists uq_sentinelles_ent on public.sentinelles(nom_norm, ville_norm);
create index if not exists idx_sentinelles_email on public.sentinelles(email);
alter table public.sentinelles enable row level security;
drop policy if exists sent_admin on public.sentinelles;
create policy sent_admin on public.sentinelles
  for all using (public.is_admin()) with check (public.is_admin());

-- 2. VÉRIFICATION avant scan : cette entreprise a-t-elle déjà été diagnostiquée ?
--    (renvoie le strict minimum : trouvée + nom + ville + date)
create or replace function public.sentinelle_check(p_texte text)
returns jsonb language plpgsql stable security definer set search_path = public
as $$
declare
  p text := public.s_norm(p_texte);
  v record;
begin
  if length(p) < 3 then return jsonb_build_object('found', false); end if;
  select nom, ville, cree_le::date as d into v
  from public.sentinelles
  where length(nom_norm) >= 3
    and p like '%'||nom_norm||'%'
    and (ville_norm = '' or p like '%'||ville_norm||'%')
  order by cree_le desc limit 1;
  if v.nom is null then return jsonb_build_object('found', false); end if;
  return jsonb_build_object('found', true, 'nom', v.nom, 'ville', v.ville, 'date', v.d);
end $$;
grant execute on function public.sentinelle_check(text) to anon, authenticated;

-- 3. SAUVEGARDE en fin de scan (upsert : refaire = mise à jour + compteur scans)
create or replace function public.sentinelle_save(p_nom text, p_ville text, p_fiche jsonb, p_html text default null)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare v_id bigint; v_scans int;
begin
  if coalesce(trim(p_nom),'') = '' then return jsonb_build_object('ok', false, 'error', 'nom vide'); end if;
  insert into public.sentinelles(nom, ville, nom_norm, ville_norm, fiche, html)
  values (trim(p_nom), nullif(trim(coalesce(p_ville,'')),''), public.s_norm(p_nom), public.s_norm(p_ville), p_fiche, p_html)
  on conflict (nom_norm, ville_norm) do update
    set fiche = excluded.fiche, html = excluded.html,
        scans = public.sentinelles.scans + 1, maj_le = now()
  returning id, scans into v_id, v_scans;
  return jsonb_build_object('ok', true, 'id', v_id, 'scans', v_scans);
end $$;
grant execute on function public.sentinelle_save(text, text, jsonb, text) to anon, authenticated;

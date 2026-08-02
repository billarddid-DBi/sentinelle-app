-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- LE QUESTIONNAIRE DIRIGEANT PASSE EN BASE — 01/08/2026
--
-- ⚠️ CE FICHIER MODIFIE LA BASE : il crée une table et ses règles. Il ne supprime rien.
--
-- POURQUOI. Le questionnaire — 40 à 200 réponses, une à deux heures de travail, la matière
-- première de la BOUSSOLE et du MIROIR — vivait UNIQUEMENT dans le navigateur. Un nettoyage,
-- un autre appareil, un PC en panne, et tout était perdu sans recours. Didier, le 01/08 :
-- « je ne veux rien en local ; déjà, si mon PC a un problème, on perd tout. »
--
-- UNE LIGNE PAR CRITÈRE, PAS UN BLOC JSON. Même raison que pour les tâches : deux appareils qui
-- répondent au même questionnaire ne doivent pas s'écraser l'un l'autre. Avec un bloc, le
-- dernier qui enregistre gagne et efface le travail de l'autre. Avec une ligne par critère,
-- chacun met à jour ce qu'il a touché.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

create table if not exists public.reponses_dirigeant (
  entreprise_id uuid not null references public.entreprises(id) on delete cascade,
  critere       text not null,          -- l'identifiant du critère, tel que l'app le génère
  note          smallint,               -- 0 à 5, ou NULL pour « non concerné »
  vu            boolean not null default false,   -- le dirigeant a-t-il réellement répondu
  mode          text,                   -- 'express' ou 'complet' au moment de la réponse
  maj_le        timestamptz not null default now(),
  primary key (entreprise_id, critere)
);

-- La clé primaire (entreprise, critère) EST le garde-fou anti-doublon : la base refusera
-- physiquement deux lignes pour le même critère. C'est ce qui manquait à `entreprises`, et on a
-- vu le résultat — mille lignes.

create index if not exists reponses_dirigeant_ent on public.reponses_dirigeant(entreprise_id);

alter table public.reponses_dirigeant enable row level security;

-- Même règle que partout : on ne voit et on ne touche que son entreprise. L'administrateur voit
-- tout, comme pour les autres tables.
drop policy if exists reponses_dirigeant_select on public.reponses_dirigeant;
create policy reponses_dirigeant_select on public.reponses_dirigeant
  for select using (is_admin() or entreprise_id = my_entreprise());

drop policy if exists reponses_dirigeant_write on public.reponses_dirigeant;
create policy reponses_dirigeant_write on public.reponses_dirigeant
  for all using (is_admin() or entreprise_id = my_entreprise())
        with check (is_admin() or entreprise_id = my_entreprise());

grant select, insert, update, delete on public.reponses_dirigeant to authenticated;


-- ═══ VÉRIFICATION ══════════════════════════════════════════════════════════════════════════
-- La table doit exister, être vide, et porter ses deux règles.
--
-- select count(*) as lignes from reponses_dirigeant;
-- select policyname, cmd from pg_policies where tablename = 'reponses_dirigeant';
--
-- Attendu : 0 ligne, et deux règles (select + all).
--
-- Ensuite, dans l'application : ouvrez le questionnaire, répondez à deux ou trois critères,
-- puis relancez la première requête. Le compte doit avoir bougé. C'est le seul essai qui
-- prouve que le chemin complet fonctionne — la table seule ne prouve rien.

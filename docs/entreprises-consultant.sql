-- ═══════════════════════════════════════════════════════════════════════════════════════════
-- L'IVE DEVIENT L'ATELIER DU CONSULTANT — 08/08/2026
--
-- ⚠️ À EXÉCUTER DANS L'ÉDITEUR SQL DE LA BASE DE L'IVE (cpsgkfgyywljwdnfalno).
--    ⚠️ PAS celle de l'APP DIRIGEANT (baijblkacnioryzbnkyd) — ce sont deux bases distinctes.
--
-- POURQUOI. Didier, 08/08/2026 : « L'IVE devient mon outil de travail : je crée les entreprises
-- sans limitation, je fais SENTINELLE, BOUSSOLE, MIROIR et tout le reste, j'enregistre les
-- parcours, et je saisis l'email de l'entreprise — ce sera mon futur lien avec l'app dirigeant. »
--
-- ⚠️ CE SCRIPT N'OUVRE AUCUN DROIT. Les règles RLS disaient DÉJÀ `is_admin()` en écriture sur
-- `entreprises` : le droit de créer autant de dossiers qu'on veut existait, il manquait un écran
-- et deux colonnes. Rien n'est affaibli ici.
-- ═══════════════════════════════════════════════════════════════════════════════════════════

-- ── 1. L'EMAIL : LE FUTUR PONT VERS L'APP DIRIGEANT ─────────────────────────────────────────
-- ⚠️ CE DOIT ÊTRE L'EMAIL DU COMPTE DU DIRIGEANT, pas une adresse de standard : c'est la clé
-- sur laquelle le plan d'action retrouvera son destinataire de l'autre côté.
alter table public.entreprises add column if not exists email text;

-- ── 2. L'ADRESSE : LE PIÈGE DE LA FICHE SENTINELLE ──────────────────────────────────────────
-- Les fiches prospects ne sont pas rattachées par identifiant : elles sont reconnues sur
-- nom + ville + adresse (`unique(nom_norm, ville_norm, adresse_norm)`). Un dossier créé sans
-- adresse, puis rescanné, produit une SECONDE fiche — et l'analyse déjà payée devient invisible.
alter table public.entreprises add column if not exists adresse text;

-- ── 3. UN EMAIL = UN DOSSIER ────────────────────────────────────────────────────────────────
-- ⚠️ SANS CETTE CONTRAINTE, LE PONT DEVIENT AMBIGU : deux entreprises portant le même email, et
-- le plan d'action ne sait plus lequel des deux comptes viser. On tranche ici, pas plus tard.
-- L'index porte sur la forme minuscule : « Jean@X.fr » et « jean@x.fr » sont le même compte.
-- Les valeurs nulles n'entrent pas dans l'index : autant de dossiers sans email qu'on veut.
create unique index if not exists entreprises_email_unique
  on public.entreprises (lower(email)) where email is not null;

-- ── 4. VOTRE PROPRE QUOTA DE JETONS ─────────────────────────────────────────────────────────
-- ⚠️ SANS ÇA, LA FONCTION SE BLOQUE TOUTE SEULE AU TROISIÈME CLIENT. `jetons_consommer` débite
-- toujours l'entreprise de VOTRE profil, quelle que soit celle sur laquelle vous travaillez —
-- c'est voulu, la prospection est à votre charge. Mais un audit complet coûte ≈ 11 jetons
-- (SENTINELLE 4 + MIROIR 3 + concurrence 4) et le quota par défaut est de 30 par mois.
-- La colonne `inclus` n'est modifiable que par l'administrateur : c'est ici, à la main.
update public.jetons j
   set inclus = 600, maj_le = now()
  from public.profils p
 where p.role = 'admin'
   and j.entreprise_id = p.entreprise_id;

-- ═══ CONTRÔLES ══════════════════════════════════════════════════════════════════════════════
--   select column_name from information_schema.columns
--    where table_schema='public' and table_name='entreprises' and column_name in ('email','adresse');
--   -- attendu : 2 lignes
--
--   select p.role, j.inclus, j.utilises from public.jetons j
--     join public.profils p on p.entreprise_id = j.entreprise_id where p.role='admin';
--   -- attendu : inclus = 600
--
--   -- Contrôle négatif — l'unicité mord bien :
--   -- insert into public.entreprises (nom,email) values ('Essai A','x@y.fr'),('Essai B','X@Y.FR');
--   -- attendu : ERREUR duplicate key. Puis : delete from public.entreprises where nom like 'Essai %';

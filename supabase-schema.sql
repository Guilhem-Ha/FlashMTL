-- =============================================
-- FLASHMTL — Schéma Supabase complet
-- Colle ce SQL dans l'éditeur SQL de Supabase
-- =============================================

-- EXTENSIONS
create extension if not exists "uuid-ossp";

-- =============================================
-- TABLES
-- =============================================

-- Commerces partenaires
create table commerces (
  id uuid primary key default uuid_generate_v4(),
  nom text not null,
  adresse text not null,
  quartier text not null,
  latitude float not null,
  longitude float not null,
  photo_url text,
  categories text[] default '{}',
  contact_email text,
  contact_tel text,
  est_actif boolean default true,
  created_at timestamptz default now()
);

-- Offres flash
create table offres (
  id uuid primary key default uuid_generate_v4(),
  commerce_id uuid references commerces(id) on delete cascade,
  titre text not null,
  description text,
  categorie text not null check (categorie in ('resto', 'bar', 'show', 'activite', 'transport')),
  prix_normal numeric(8,2) not null,
  prix_flash numeric(8,2) not null,
  reduction_pct int generated always as (
    round(((prix_normal - prix_flash) / prix_normal * 100)::numeric)
  ) stored,
  code_promo text not null,
  places_disponibles int default 10,
  expire_at timestamptz not null,
  est_active boolean default true,
  created_at timestamptz default now()
);

-- Utilisateurs (extension de auth.users)
create table utilisateurs (
  id uuid primary key references auth.users(id) on delete cascade,
  prenom text,
  campus text,
  preferences text[] default '{}',
  push_token text,
  created_at timestamptz default now()
);

-- Trips (covoiturage)
create table trips (
  id uuid primary key default uuid_generate_v4(),
  destination text not null,
  date_depart timestamptz not null,
  heure_depart text not null,
  lieu_depart text not null,
  places_total int not null,
  places_restantes int not null,
  prix_par_personne numeric(8,2) not null,
  organisateur_id uuid references utilisateurs(id),
  description text,
  created_at timestamptz default now()
);

-- Participants aux trips
create table trip_participants (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid references trips(id) on delete cascade,
  user_id uuid references utilisateurs(id),
  created_at timestamptz default now(),
  unique(trip_id, user_id)
);

-- =============================================
-- FONCTIONS
-- =============================================

-- Décrémente les places d'un trip
create or replace function decrement_places_trip(trip_id uuid)
returns void language plpgsql as $$
begin
  update trips
  set places_restantes = places_restantes - 1
  where id = trip_id and places_restantes > 0;
end;
$$;

-- Crée automatiquement un profil utilisateur à l'inscription
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into utilisateurs (id, prenom, campus)
  values (
    new.id,
    new.raw_user_meta_data->>'prenom',
    new.raw_user_meta_data->>'campus'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- =============================================
-- RLS (Row Level Security)
-- =============================================

alter table offres enable row level security;
alter table commerces enable row level security;
alter table utilisateurs enable row level security;
alter table trips enable row level security;
alter table trip_participants enable row level security;

-- Offres : lisibles par tous les utilisateurs connectés
create policy "Offres visibles par tous"
  on offres for select
  using (auth.role() = 'authenticated');

-- Commerces : lisibles par tous
create policy "Commerces visibles par tous"
  on commerces for select
  using (auth.role() = 'authenticated');

-- Utilisateurs : peuvent voir et modifier leur propre profil
create policy "Users can view own profile"
  on utilisateurs for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on utilisateurs for update
  using (auth.uid() = id);

-- Trips : lisibles par tous
create policy "Trips visibles par tous"
  on trips for select
  using (auth.role() = 'authenticated');

create policy "Users can create trips"
  on trips for insert
  with check (auth.uid() = organisateur_id);

-- =============================================
-- DONNÉES DE TEST
-- =============================================

insert into commerces (nom, adresse, quartier, latitude, longitude, categories) values
  ('Chez Lévesque Bistro', '4297 rue Saint-Denis', 'Plateau-Mont-Royal', 45.5231, -73.5827, '{"resto"}'),
  ('La Sala Rossa', '4848 boul. Saint-Laurent', 'Mile-End', 45.5258, -73.5941, '{"show","bar"}'),
  ('Zone d''Aventure Escape', '2340 rue Beaubien Est', 'Rosemont', 45.5401, -73.5742, '{"activite"}');

insert into offres (commerce_id, titre, description, categorie, prix_normal, prix_flash, code_promo, places_disponibles, expire_at)
select 
  id,
  'Menu table d''hôte complet',
  'Entrée + plat + dessert. Cuisine du marché, produits locaux.',
  'resto',
  38.00,
  22.00,
  'FLASH22',
  8,
  now() + interval '6 hours'
from commerces where nom = 'Chez Lévesque Bistro';

-- ============================================================
-- Campus ARGA · esquema inicial
-- Alumnos, contenido del curso, progreso y mentorías 1 a 1
-- ============================================================

create schema if not exists private;

-- ============ PERFILES ============
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  phone       text,
  role        text not null default 'student' check (role in ('student','admin')),
  created_at  timestamptz not null default now()
);

-- El rol vive en una tabla, nunca en user_metadata (que el propio usuario puede editar).
-- La función va en un esquema no expuesto para que no sea un endpoint público.
create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  );
$$;

-- Alta del perfil en cuanto se crea la cuenta
create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- ============ ACCESO AL CURSO ============
create table if not exists public.enrollments (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null unique references auth.users(id) on delete cascade,
  status       text not null default 'active' check (status in ('active','revoked')),
  source       text not null default 'manual' check (source in ('manual','stripe')),
  purchased_at timestamptz not null default now(),
  amount_cents integer,
  notes        text
);
create index if not exists enrollments_user_idx on public.enrollments(user_id);

-- ============ CONTENIDO ============
create table if not exists public.modules (
  id          uuid primary key default gen_random_uuid(),
  position    integer not null,
  code        text not null,                 -- «1», «2»…
  title       text not null,
  description text,
  published   boolean not null default false,
  created_at  timestamptz not null default now()
);
create unique index if not exists modules_position_idx on public.modules(position);

create table if not exists public.lessons (
  id            uuid primary key default gen_random_uuid(),
  module_id     uuid not null references public.modules(id) on delete cascade,
  position      integer not null,
  code          text not null,               -- «1.1», «1.2»…
  title         text not null,
  description   text,
  video_id      text,                        -- GUID del vídeo en Bunny Stream
  duration_secs integer,
  published     boolean not null default false,
  created_at    timestamptz not null default now()
);
create index if not exists lessons_module_idx on public.lessons(module_id, position);

create table if not exists public.lesson_files (
  id         uuid primary key default gen_random_uuid(),
  lesson_id  uuid references public.lessons(id) on delete cascade,
  title      text not null,
  storage_path text not null,
  size_bytes integer,
  position   integer not null default 0,
  is_resource boolean not null default false,  -- true = va también en la zona de recursos
  created_at timestamptz not null default now()
);
create index if not exists lesson_files_lesson_idx on public.lesson_files(lesson_id, position);
create index if not exists lesson_files_resource_idx on public.lesson_files(is_resource) where is_resource;

-- ============ PROGRESO ============
create table if not exists public.lesson_progress (
  user_id      uuid not null references auth.users(id) on delete cascade,
  lesson_id    uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
create index if not exists lesson_progress_lesson_idx on public.lesson_progress(lesson_id);

-- ============ MENTORÍAS 1 A 1 ============
create table if not exists public.availability_slots (
  id         uuid primary key default gen_random_uuid(),
  starts_at  timestamptz not null,
  ends_at    timestamptz not null,
  created_at timestamptz not null default now(),
  constraint slot_order check (ends_at > starts_at)
);
create index if not exists slots_start_idx on public.availability_slots(starts_at);

create table if not exists public.bookings (
  id         uuid primary key default gen_random_uuid(),
  slot_id    uuid not null unique references public.availability_slots(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  status     text not null default 'booked' check (status in ('booked','cancelled','done')),
  topic      text,
  created_at timestamptz not null default now()
);
create index if not exists bookings_user_idx on public.bookings(user_id, created_at desc);

-- ============ FUNCIONES QUE DEPENDEN DE LAS TABLAS ============
create or replace function private.has_access()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.enrollments e
    where e.user_id = (select auth.uid()) and e.status = 'active'
  ) or private.is_admin();
$$;

-- Las 3 mentorías del bonus: se cuentan las reservas vivas del alumno
create or replace function private.calls_left(uid uuid)
returns integer language sql stable security definer set search_path = '' as $$
  select 3 - (
    select count(*) from public.bookings b
    where b.user_id = uid and b.status in ('booked','done')
  )::integer;
$$;

-- ============ RLS ============
alter table public.profiles          enable row level security;
alter table public.enrollments       enable row level security;
alter table public.modules           enable row level security;
alter table public.lessons           enable row level security;
alter table public.lesson_files      enable row level security;
alter table public.lesson_progress   enable row level security;
alter table public.availability_slots enable row level security;
alter table public.bookings          enable row level security;

-- perfiles: cada uno el suyo; el admin, todos
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select to authenticated
  using ( (select auth.uid()) = id or private.is_admin() );

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated
  using ( (select auth.uid()) = id )
  with check ( (select auth.uid()) = id and role = 'student' );

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles for all to authenticated
  using ( private.is_admin() ) with check ( private.is_admin() );

-- matrículas: el alumno ve la suya; el admin gestiona todas
drop policy if exists enrollments_select_own on public.enrollments;
create policy enrollments_select_own on public.enrollments for select to authenticated
  using ( (select auth.uid()) = user_id or private.is_admin() );

drop policy if exists enrollments_admin_all on public.enrollments;
create policy enrollments_admin_all on public.enrollments for all to authenticated
  using ( private.is_admin() ) with check ( private.is_admin() );

-- contenido: solo lo ve quien tiene acceso activo; solo el admin lo edita
drop policy if exists modules_read on public.modules;
create policy modules_read on public.modules for select to authenticated
  using ( (published and private.has_access()) or private.is_admin() );
drop policy if exists modules_admin on public.modules;
create policy modules_admin on public.modules for all to authenticated
  using ( private.is_admin() ) with check ( private.is_admin() );

drop policy if exists lessons_read on public.lessons;
create policy lessons_read on public.lessons for select to authenticated
  using ( (published and private.has_access()) or private.is_admin() );
drop policy if exists lessons_admin on public.lessons;
create policy lessons_admin on public.lessons for all to authenticated
  using ( private.is_admin() ) with check ( private.is_admin() );

drop policy if exists files_read on public.lesson_files;
create policy files_read on public.lesson_files for select to authenticated
  using ( private.has_access() );
drop policy if exists files_admin on public.lesson_files;
create policy files_admin on public.lesson_files for all to authenticated
  using ( private.is_admin() ) with check ( private.is_admin() );

-- progreso: estrictamente propio
drop policy if exists progress_own on public.lesson_progress;
create policy progress_own on public.lesson_progress for all to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

-- huecos de mentoría: los ve quien tiene acceso; los crea el admin
drop policy if exists slots_read on public.availability_slots;
create policy slots_read on public.availability_slots for select to authenticated
  using ( private.has_access() );
drop policy if exists slots_admin on public.availability_slots;
create policy slots_admin on public.availability_slots for all to authenticated
  using ( private.is_admin() ) with check ( private.is_admin() );

-- reservas: el alumno gestiona las suyas, el admin las ve todas
drop policy if exists bookings_select on public.bookings;
create policy bookings_select on public.bookings for select to authenticated
  using ( (select auth.uid()) = user_id or private.is_admin() );

drop policy if exists bookings_insert on public.bookings;
create policy bookings_insert on public.bookings for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and private.has_access()
    and private.calls_left((select auth.uid())) > 0
  );

drop policy if exists bookings_update_own on public.bookings;
create policy bookings_update_own on public.bookings for update to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );

drop policy if exists bookings_admin on public.bookings;
create policy bookings_admin on public.bookings for all to authenticated
  using ( private.is_admin() ) with check ( private.is_admin() );

-- ============ PERMISOS ============
grant usage on schema public to anon, authenticated;
grant select on public.modules, public.lessons, public.lesson_files,
                public.availability_slots to authenticated;
grant select, insert, update, delete on public.lesson_progress, public.bookings to authenticated;
grant select, update on public.profiles to authenticated;
grant select on public.enrollments to authenticated;
grant execute on function private.calls_left(uuid) to authenticated;

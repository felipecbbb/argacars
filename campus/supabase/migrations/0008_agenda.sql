-- ============================================================
-- Agenda estilo Calendly (28 sep 2026) · solo añade, no rompe lo publicado
--
-- Dos agendas: «llamada» (visitantes de la landing que quieren hablar antes
-- de pagar) y «mentoria» (alumnos, 3 incluidas). El admin no abre huecos uno
-- a uno: define REGLAS (horario semanal, duración, margen, antelación, días
-- vista, máximo al día) y EXCEPCIONES (días cerrados u horario especial), y
-- los huecos libres se calculan solos.
--
-- Las dos agendas comparten el tiempo de Alex y Rodrigo: una restricción de
-- exclusión impide que dos citas vivas se solapen, sean del tipo que sean.
-- Es la garantía real contra la doble reserva, aunque dos personas pulsen a
-- la vez sobre el mismo hueco.
-- ============================================================
create extension if not exists btree_gist;

create table if not exists public.agenda_ajustes (
  tipo             text primary key check (tipo in ('llamada','mentoria')),
  duracion_min     integer not null default 30 check (duracion_min between 10 and 180),
  margen_min       integer not null default 0  check (margen_min between 0 and 120),
  antelacion_horas integer not null default 12 check (antelacion_horas between 0 and 720),
  dias_vista       integer not null default 30 check (dias_vista between 1 and 180),
  max_dia          integer check (max_dia is null or max_dia > 0),
  zona             text not null default 'Europe/Madrid',
  activa           boolean not null default true,
  updated_at       timestamptz not null default now()
);

-- Horario semanal: varias franjas por día (p. ej. mañana y tarde). 1 = lunes … 7 = domingo.
create table if not exists public.agenda_horario (
  id          uuid primary key default gen_random_uuid(),
  tipo        text not null references public.agenda_ajustes(tipo) on delete cascade,
  dia_semana  smallint not null check (dia_semana between 1 and 7),
  desde       time not null,
  hasta       time not null,
  constraint agenda_horario_orden check (hasta > desde)
);
create index if not exists agenda_horario_tipo_idx on public.agenda_horario(tipo, dia_semana);

-- Excepciones por fecha. Sin horas = ese día cerrado. Con horas = ese día se
-- atiende SOLO en esas franjas (sustituye al horario semanal).
create table if not exists public.agenda_excepciones (
  id      uuid primary key default gen_random_uuid(),
  tipo    text not null references public.agenda_ajustes(tipo) on delete cascade,
  fecha   date not null,
  desde   time,
  hasta   time,
  motivo  text,
  constraint agenda_excepcion_horas check ((desde is null and hasta is null) or (desde is not null and hasta > desde))
);
create index if not exists agenda_excepciones_idx on public.agenda_excepciones(tipo, fecha);

create table if not exists public.citas (
  id                      uuid primary key default gen_random_uuid(),
  tipo                    text not null check (tipo in ('llamada','mentoria')),
  empieza                 timestamptz not null,
  termina                 timestamptz not null,
  estado                  text not null default 'reservada' check (estado in ('reservada','cancelada','hecha')),
  user_id                 uuid references public.profiles(id) on delete set null,  -- solo en mentorías
  nombre                  text not null,
  email                   text not null,
  telefono                text,
  mensaje                 text,
  zona_cliente            text not null default 'Europe/Madrid',  -- para escribirle en su hora
  token                   uuid not null unique default gen_random_uuid(),  -- enlace para gestionar la cita
  recordatorio_enviado_at timestamptz,
  cancelada_por           text check (cancelada_por in ('cliente','admin')),
  created_at              timestamptz not null default now(),
  constraint citas_orden check (termina > empieza),
  -- Nunca dos citas vivas a la vez
  constraint citas_sin_solape exclude using gist (tstzrange(empieza, termina) with &&) where (estado = 'reservada')
);
create index if not exists citas_empieza_idx on public.citas(empieza) where estado = 'reservada';
create index if not exists citas_user_idx on public.citas(user_id) where user_id is not null;

-- Valores de partida: lunes a viernes, 10-14 y 16-20 (hora peninsular), citas de 30 min.
insert into public.agenda_ajustes (tipo) values ('llamada'), ('mentoria') on conflict do nothing;
insert into public.agenda_horario (tipo, dia_semana, desde, hasta)
select t.tipo, d.dia, f.desde::time, f.hasta::time
from (values ('llamada'), ('mentoria')) t(tipo)
cross join generate_series(1, 5) d(dia)
cross join (values ('10:00','14:00'), ('16:00','20:00')) f(desde, hasta)
where not exists (select 1 from public.agenda_horario);

-- ============ SEGURIDAD ============
-- Todo lo escribe el servidor con la clave de servicio (que valida las reglas
-- antes). Desde el navegador: el admin lo ve todo y el alumno, sus citas.
alter table public.agenda_ajustes     enable row level security;
alter table public.agenda_horario     enable row level security;
alter table public.agenda_excepciones enable row level security;
alter table public.citas              enable row level security;

drop policy if exists agenda_ajustes_admin on public.agenda_ajustes;
create policy agenda_ajustes_admin on public.agenda_ajustes for all to authenticated
  using ( private.is_admin() ) with check ( private.is_admin() );
drop policy if exists agenda_horario_admin on public.agenda_horario;
create policy agenda_horario_admin on public.agenda_horario for all to authenticated
  using ( private.is_admin() ) with check ( private.is_admin() );
drop policy if exists agenda_excepciones_admin on public.agenda_excepciones;
create policy agenda_excepciones_admin on public.agenda_excepciones for all to authenticated
  using ( private.is_admin() ) with check ( private.is_admin() );

drop policy if exists citas_admin on public.citas;
create policy citas_admin on public.citas for all to authenticated
  using ( private.is_admin() ) with check ( private.is_admin() );
drop policy if exists citas_propias on public.citas;
create policy citas_propias on public.citas for select to authenticated
  using ( (select auth.uid()) = user_id );

grant select on public.citas to authenticated;

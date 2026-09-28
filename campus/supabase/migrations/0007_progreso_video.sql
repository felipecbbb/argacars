-- ============================================================
-- Progreso dentro de cada vídeo (28 sep 2026) · solo añade
-- lesson_progress sigue siendo «clase completada»; esta tabla guarda por
-- dónde va el alumno en el vídeo para pintar la barra de «Viendo · 40 %».
-- ============================================================
create table if not exists public.lesson_watch (
  user_id       uuid not null references public.profiles(id) on delete cascade,
  lesson_id     uuid not null references public.lessons(id) on delete cascade,
  seconds       integer not null default 0 check (seconds >= 0),
  duration_secs integer check (duration_secs is null or duration_secs > 0),
  updated_at    timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
create index if not exists lesson_watch_lesson_idx on public.lesson_watch(lesson_id);

alter table public.lesson_watch enable row level security;

drop policy if exists watch_own on public.lesson_watch;
create policy watch_own on public.lesson_watch for all to authenticated
  using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id and private.has_access() );

drop policy if exists watch_admin on public.lesson_watch;
create policy watch_admin on public.lesson_watch for select to authenticated
  using ( private.is_admin() );

grant select, insert, update, delete on public.lesson_watch to authenticated;

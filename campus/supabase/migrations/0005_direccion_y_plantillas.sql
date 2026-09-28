-- ============================================================
-- Cambios de la plataforma (26 sep 2026) · solo añade, no rompe
-- 1. Mi cuenta: el alumno guarda su dirección (el teléfono ya existía)
-- 2. Recursos: cada descargable es «recurso» o «plantilla»
-- ============================================================
alter table public.profiles add column if not exists address text;

alter table public.lesson_files add column if not exists kind text not null default 'recurso';
alter table public.lesson_files drop constraint if exists lesson_files_kind_check;
alter table public.lesson_files add constraint lesson_files_kind_check check (kind in ('recurso','plantilla'));

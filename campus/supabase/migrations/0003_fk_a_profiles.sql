-- ============================================================
-- Las tablas de usuario apuntaban a auth.users, que vive en otro
-- esquema: eso impedía cruzarlas con profiles en una sola consulta.
-- Se redirigen a public.profiles, que a su vez cuelga de auth.users
-- con borrado en cascada, así que no se pierde ninguna garantía.
-- ============================================================

alter table public.enrollments     drop constraint if exists enrollments_user_id_fkey;
alter table public.enrollments     add  constraint enrollments_user_id_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;

alter table public.bookings        drop constraint if exists bookings_user_id_fkey;
alter table public.bookings        add  constraint bookings_user_id_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;

alter table public.lesson_progress drop constraint if exists lesson_progress_user_id_fkey;
alter table public.lesson_progress add  constraint lesson_progress_user_id_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;

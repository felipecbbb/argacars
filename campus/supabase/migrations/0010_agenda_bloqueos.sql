-- ============================================================
-- Agenda · bloquear horas sueltas (4 oct 2026) · solo añade, no rompe lo publicado
--
-- Hasta ahora una excepción con horas era un «horario especial» que SUSTITUÍA
-- al semanal ese día, y no había forma de decir «este martes de 10 a 12 no
-- estamos» sin rehacer el día entero. Con «bloquea = true» esas horas se
-- restan del horario semanal y el resto del día sigue igual.
-- ============================================================
alter table public.agenda_excepciones
  add column if not exists bloquea boolean not null default false;

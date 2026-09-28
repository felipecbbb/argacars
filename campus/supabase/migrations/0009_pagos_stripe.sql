-- ============================================================
-- Pago con Stripe (28 sep 2026) · solo añade
-- La sesión de Stripe queda en la matrícula: si Stripe repite el aviso
-- (lo hace), no se da de alta dos veces.
-- ============================================================
alter table public.enrollments add column if not exists stripe_session_id text;
create unique index if not exists enrollments_stripe_session_idx
  on public.enrollments(stripe_session_id) where stripe_session_id is not null;

-- El teléfono sirve también para entrar: se guarda normalizado (+34…) y no se repite.
create unique index if not exists profiles_phone_idx on public.profiles(phone) where phone is not null;

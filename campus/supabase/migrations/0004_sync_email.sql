-- ============================================================
-- El perfil guarda una copia del correo para poder listarlo y
-- buscarlo sin tocar el esquema de autenticación. Si el correo
-- cambia allí, esta copia se queda vieja: se sincroniza sola.
-- ============================================================

create or replace function private.sync_email_perfil()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.email is distinct from old.email then
    update public.profiles set email = new.email where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row execute function private.sync_email_perfil();

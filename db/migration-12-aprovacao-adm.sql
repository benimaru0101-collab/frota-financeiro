-- ============================================================
-- migration-12 — Aprovação de novos administradores
-- ------------------------------------------------------------
-- Com o login do Google aberto para qualquer conta, quem se cadastra
-- pelo app Frota ADM não pode virar administrador sozinho.
-- 1) Novo papel 'pendente' (padrão de toda conta nova).
-- 2) Trigger no INSERT: um usuário comum só pode criar o próprio
--    perfil como 'motorista' (app do Motorista) ou 'pendente'.
--    Tentar 'administrador' vira 'pendente'.
-- 3) Um administrador aprova em Usuários (o trigger proteger_role da
--    migration-9 já impede que o próprio pendente se promova).
-- Idempotente.
-- ============================================================

do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.profiles'::regclass and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%role%'
  loop
    execute format('alter table profiles drop constraint %I', c.conname);
  end loop;
end $$;

alter table profiles add constraint profiles_role_check
  check (role in ('administrador', 'motorista', 'pendente'));
alter table profiles alter column role set default 'pendente';

create or replace function proteger_role_insert() returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not is_admin()
     and new.role not in ('motorista', 'pendente') then
    new.role := 'pendente';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_proteger_role_insert on profiles;
create trigger trg_proteger_role_insert
  before insert on profiles
  for each row execute function proteger_role_insert();

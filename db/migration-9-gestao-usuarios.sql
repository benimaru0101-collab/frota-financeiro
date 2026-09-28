-- ============================================================
-- Migração 9 — Gestão de usuários pelo administrador + proteção do papel
-- ============================================================
-- 1) Fecha uma brecha da migration-8: a policy "Usuário edita o próprio
--    perfil" deixava qualquer usuário (inclusive Motorista) alterar a
--    própria coluna role e virar administrador chamando a API direto.
--    Agora só um administrador pode mudar o papel de alguém.
-- 2) Permite que o administrador veja todos os perfis e altere o papel
--    (usado pela tela "Usuários e Papéis" no app).
--
-- Como aplicar: cole no SQL Editor do Supabase e execute uma vez,
-- depois da migração 8. Pode rodar mais de uma vez sem problema.

-- is_admin() passa a ser SECURITY DEFINER: ela lê profiles ignorando o
-- RLS, o que evita recursão quando a própria tabela profiles usa
-- is_admin() nas suas policies.
create or replace function is_admin() returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from profiles where id = auth.uid()) = 'administrador', false);
$$;

grant execute on function is_admin() to authenticated;

drop policy if exists "Administrador vê todos os perfis" on profiles;
create policy "Administrador vê todos os perfis"
  on profiles for select
  to authenticated
  using (is_admin());

drop policy if exists "Administrador edita perfis" on profiles;
create policy "Administrador edita perfis"
  on profiles for update
  to authenticated
  using (is_admin())
  with check (is_admin());

-- Trava do papel: ninguém muda role (nem o próprio) sem ser administrador.
-- Também impede que o último administrador rebaixe a si mesmo e deixe o
-- sistema sem nenhum administrador.
create or replace function proteger_role() returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    -- auth.uid() nulo = SQL Editor / Table Editor do Supabase (dono do
    -- projeto), que continua podendo ajustar papéis manualmente.
    if auth.uid() is not null and not is_admin() then
      raise exception 'Só um administrador pode alterar o papel de um usuário';
    end if;
    if old.role = 'administrador'
       and (select count(*) from profiles where role = 'administrador') <= 1 then
      raise exception 'Não é possível remover o último administrador';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_proteger_role on profiles;
create trigger trg_proteger_role
  before update of role on profiles
  for each row execute function proteger_role();

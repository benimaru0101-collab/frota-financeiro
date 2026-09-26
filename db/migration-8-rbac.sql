-- ============================================================
-- Migração 8 — Controle de acesso (RBAC): Administrador × Motorista
-- ============================================================
-- Atualização do enunciado (Parte 2): dois papéis de usuário, com
-- acesso diferente ao módulo Financeiro. O app já esconde a aba
-- Financeiro da navegação para quem é Motorista — esta migração
-- reforça a mesma regra direto no banco (RLS), então mesmo uma
-- chamada direta à API do Supabase não vaza dados financeiros pra
-- quem não é administrador.
--
-- Como aplicar: cole no SQL Editor do seu projeto Supabase
-- (Database > SQL Editor) e execute uma vez, depois da migração 7.
--
-- Limitação conhecida (documentada, não resolvida nesta entrega):
-- a tabela `motoristas` ainda não tem um vínculo com `auth.users`/
-- `profiles`, então não dá pra restringir "cada motorista só vê as
-- próprias viagens" no banco ainda — hoje o Motorista vê a Frota
-- inteira (mas nunca o Financeiro). Ficaria pra uma próxima entrega.

alter table profiles add column if not exists role text not null default 'administrador' check (role in ('administrador', 'motorista'));

-- Usuários que já existiam antes desta migração ainda não têm linha em
-- `profiles` (o app só passou a criar o perfil agora). Sem isso eles
-- perderiam o acesso ao Financeiro — então criamos o perfil de todos
-- como administrador (quem for motorista é ajustado depois).
insert into profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;

create or replace function is_admin() returns boolean
language sql
stable
as $$
  select coalesce((select role from profiles where id = auth.uid()) = 'administrador', false);
$$;

grant execute on function is_admin() to authenticated;

-- Restringe as tabelas do Financeiro a usuários com role = 'administrador'.
-- As tabelas da Frota (veiculos, motoristas, viagens, abastecimentos,
-- manutencoes, documentos) continuam com a policy antiga (qualquer
-- autenticado), pois o Motorista precisa enxergar a Frota.
do $$
declare
  tabela text;
begin
  foreach tabela in array array[
    'receitas', 'despesas', 'contas', 'categorias_financeiras', 'dividas_financiamentos'
  ]
  loop
    execute format('drop policy if exists "Usuários autenticados podem ler (%1$s)" on %1$s;', tabela);
    execute format('drop policy if exists "Usuários autenticados podem inserir (%1$s)" on %1$s;', tabela);
    execute format('drop policy if exists "Usuários autenticados podem atualizar (%1$s)" on %1$s;', tabela);
    execute format('drop policy if exists "Usuários autenticados podem excluir (%1$s)" on %1$s;', tabela);

    execute format('drop policy if exists "Só administrador lê (%1$s)" on %1$s;', tabela);
    execute format('drop policy if exists "Só administrador insere (%1$s)" on %1$s;', tabela);
    execute format('drop policy if exists "Só administrador atualiza (%1$s)" on %1$s;', tabela);
    execute format('drop policy if exists "Só administrador exclui (%1$s)" on %1$s;', tabela);

    execute format('create policy "Só administrador lê (%1$s)" on %1$s for select to authenticated using (is_admin());', tabela);
    execute format('create policy "Só administrador insere (%1$s)" on %1$s for insert to authenticated with check (is_admin());', tabela);
    execute format('create policy "Só administrador atualiza (%1$s)" on %1$s for update to authenticated using (is_admin()) with check (is_admin());', tabela);
    execute format('create policy "Só administrador exclui (%1$s)" on %1$s for delete to authenticated using (is_admin());', tabela);
  end loop;
end $$;

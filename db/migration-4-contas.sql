-- ============================================================
-- Migração 4 — tabela de Contas (financeiro)
-- ============================================================
-- O mockup do app tem uma tela de "Contas" (conta corrente, carteira,
-- cartão...) além de Receitas/Despesas — esta migração cria essa
-- tabela, com as mesmas policies de RLS (equipe única, autenticado
-- lê/escreve tudo) usadas nas demais tabelas do schema.sql.
--
-- Como aplicar: cole no SQL Editor do seu projeto Supabase
-- (Database > SQL Editor) e execute uma vez.

create table if not exists contas (
  id            uuid primary key default uuid_generate_v4(),
  nome          text not null,
  tipo          text not null default 'Conta Corrente', -- Conta Corrente, Poupança, Carteira, Cartão...
  saldo_inicial numeric(12,2) not null default 0,
  criado_em     timestamptz not null default now()
);

alter table contas enable row level security;

drop policy if exists "Usuários autenticados podem ler (contas)" on contas;
create policy "Usuários autenticados podem ler (contas)"
  on contas for select to authenticated using (true);

drop policy if exists "Usuários autenticados podem inserir (contas)" on contas;
create policy "Usuários autenticados podem inserir (contas)"
  on contas for insert to authenticated with check (true);

drop policy if exists "Usuários autenticados podem atualizar (contas)" on contas;
create policy "Usuários autenticados podem atualizar (contas)"
  on contas for update to authenticated using (true) with check (true);

drop policy if exists "Usuários autenticados podem excluir (contas)" on contas;
create policy "Usuários autenticados podem excluir (contas)"
  on contas for delete to authenticated using (true);

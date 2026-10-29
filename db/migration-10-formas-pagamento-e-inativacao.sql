-- ============================================================
-- migration-10 — Formas de Pagamento e inativação de categorias
-- Rodar no SQL Editor do Supabase depois das migrations 1 a 9.
-- Pode ser executada mais de uma vez sem duplicar nada.
--
-- 1) Categorias financeiras deixam de ser apagadas: passam a ser
--    DESATIVADAS (soft delete). Lançamentos antigos continuam
--    apontando para a categoria, então o histórico nunca quebra.
-- 2) Nova tabela formas_pagamento (Pix, Boleto, Cartão, Dinheiro,
--    Transferência...), com cadastro e inativação pelo administrador.
--    As formas ativas aparecem nos formulários de Receita e Despesa.
-- 3) Dívidas ganham o campo opcional "valor para quitação antecipada".
-- ============================================================

-- 1) Soft delete em categorias
alter table categorias_financeiras
  add column if not exists ativa boolean not null default true;

-- 1b) Dívidas: valor para quitação antecipada (opcional), pedido no
--     cadastro de dívidas de longo prazo.
alter table dividas_financiamentos
  add column if not exists valor_quitacao numeric(12,2)
  check (valor_quitacao is null or valor_quitacao > 0);

-- 2) Formas de pagamento
create table if not exists formas_pagamento (
  id         uuid primary key default uuid_generate_v4(),
  nome       text not null unique,
  icone      text,
  ativa      boolean not null default true,
  criado_em  timestamptz not null default now()
);

alter table formas_pagamento enable row level security;

-- Mesmo padrão das tabelas financeiras (migration-8): só o
-- administrador lê e altera. Não existe policy de DELETE de propósito:
-- forma de pagamento é só desativada, nunca apagada.
drop policy if exists "Só administrador lê (formas_pagamento)" on formas_pagamento;
drop policy if exists "Só administrador insere (formas_pagamento)" on formas_pagamento;
drop policy if exists "Só administrador atualiza (formas_pagamento)" on formas_pagamento;

create policy "Só administrador lê (formas_pagamento)"
  on formas_pagamento for select to authenticated using (is_admin());
create policy "Só administrador insere (formas_pagamento)"
  on formas_pagamento for insert to authenticated with check (is_admin());
create policy "Só administrador atualiza (formas_pagamento)"
  on formas_pagamento for update to authenticated using (is_admin()) with check (is_admin());

insert into formas_pagamento (nome, icone) values
  ('Pix', '⚡'),
  ('Boleto', '🧾'),
  ('Cartão', '💳'),
  ('Dinheiro', '💵'),
  ('Transferência', '🏦')
on conflict (nome) do nothing;

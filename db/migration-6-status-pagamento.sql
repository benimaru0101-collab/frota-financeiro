-- ============================================================
-- Migração 6 — Núcleo Financeiro: status, pagamento e comprovante
-- ============================================================
-- Atualização do enunciado (Parte 2): toda receita/despesa passa a
-- ter um status (Pendente ou Pago/Recebido), com data de pagamento,
-- forma de pagamento e comprovante anexado — base do Motor de Saldo
-- e da Projeção de Caixa.
--
-- Como aplicar: cole no SQL Editor do seu projeto Supabase
-- (Database > SQL Editor) e execute uma vez.

alter table receitas add column if not exists status text not null default 'concluido' check (status in ('pendente', 'concluido'));
alter table receitas add column if not exists data_pagamento date;
alter table receitas add column if not exists forma_pagamento text;
alter table receitas add column if not exists comprovante_url text;

alter table despesas add column if not exists status text not null default 'concluido' check (status in ('pendente', 'concluido'));
alter table despesas add column if not exists data_pagamento date;
alter table despesas add column if not exists forma_pagamento text;
alter table despesas add column if not exists comprovante_url text;

-- Lançamentos que já existiam antes desta migração são tratados como
-- já concluídos (dinheiro que já entrou/saiu de verdade), para não
-- zerar o saldo histórico calculado a partir de agora só com
-- status = 'concluido'. Novos lançamentos podem nascer como
-- "Pendente" e ser marcados como pagos/recebidos depois.
update receitas set data_pagamento = data_receita where status = 'concluido' and data_pagamento is null;
update despesas set data_pagamento = data_despesa where status = 'concluido' and data_pagamento is null;

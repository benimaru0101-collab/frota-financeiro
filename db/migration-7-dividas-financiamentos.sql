-- ============================================================
-- Migração 7 — Módulo de Dívidas e Financiamentos
-- ============================================================
-- Atualização do enunciado (Parte 2): nova tabela para dívidas e
-- financiamentos, com geração automática das parcelas (como despesas
-- "Pendente" vinculadas) dentro de uma função transacional — se
-- qualquer parcela falhar no meio da geração, TUDO é desfeito
-- (rollback automático de função no Postgres), nada fica gravado
-- pela metade.
--
-- Como aplicar: cole no SQL Editor do seu projeto Supabase
-- (Database > SQL Editor) e execute uma vez, depois da migração 6.

create table if not exists dividas_financiamentos (
  id           uuid primary key default uuid_generate_v4(),
  descricao    text not null,
  credor       text,
  valor_total  numeric(12,2) not null,
  num_parcelas integer not null check (num_parcelas > 0 and num_parcelas <= 360),
  taxa_juros   numeric(6,3) not null default 0, -- % ao mês, informativo
  data_inicio  date not null,
  categoria_id uuid references categorias_financeiras (id),
  veiculo_id   uuid references veiculos (id) on delete set null,
  criado_em    timestamptz not null default now()
);

alter table despesas add column if not exists divida_id uuid references dividas_financiamentos (id) on delete set null;

alter table dividas_financiamentos enable row level security;

drop policy if exists "Usuários autenticados podem ler (dividas_financiamentos)" on dividas_financiamentos;
create policy "Usuários autenticados podem ler (dividas_financiamentos)"
  on dividas_financiamentos for select to authenticated using (true);

drop policy if exists "Usuários autenticados podem inserir (dividas_financiamentos)" on dividas_financiamentos;
create policy "Usuários autenticados podem inserir (dividas_financiamentos)"
  on dividas_financiamentos for insert to authenticated with check (true);

drop policy if exists "Usuários autenticados podem atualizar (dividas_financiamentos)" on dividas_financiamentos;
create policy "Usuários autenticados podem atualizar (dividas_financiamentos)"
  on dividas_financiamentos for update to authenticated using (true) with check (true);

drop policy if exists "Usuários autenticados podem excluir (dividas_financiamentos)" on dividas_financiamentos;
create policy "Usuários autenticados podem excluir (dividas_financiamentos)"
  on dividas_financiamentos for delete to authenticated using (true);

-- ------------------------------------------------------------
-- Função transacional: cria a dívida + todas as parcelas (como
-- despesas "Pendente" vinculadas via divida_id). Funções PL/pgSQL
-- rodam dentro de uma única transação implícita — se qualquer coisa
-- der errado no meio do loop, o Postgres desfaz TUDO sozinho
-- (a dívida e as parcelas já inseridas), sem precisar de código
-- extra de rollback manual.
-- ------------------------------------------------------------
create or replace function criar_divida_com_parcelas(
  p_descricao     text,
  p_credor        text,
  p_valor_total   numeric,
  p_num_parcelas  integer,
  p_taxa_juros    numeric,
  p_data_inicio   date,
  p_categoria_id  uuid,
  p_veiculo_id    uuid
) returns uuid
language plpgsql
as $$
declare
  v_divida_id     uuid;
  v_valor_parcela numeric(12,2);
  i               integer;
begin
  if p_valor_total is null or p_valor_total <= 0 then
    raise exception 'O valor total da dívida precisa ser maior que zero';
  end if;
  if p_num_parcelas is null or p_num_parcelas < 1 or p_num_parcelas > 360 then
    raise exception 'Número de parcelas inválido (use um valor entre 1 e 360)';
  end if;

  insert into dividas_financiamentos (
    descricao, credor, valor_total, num_parcelas, taxa_juros, data_inicio, categoria_id, veiculo_id
  ) values (
    p_descricao, p_credor, p_valor_total, p_num_parcelas, coalesce(p_taxa_juros, 0), p_data_inicio, p_categoria_id, p_veiculo_id
  ) returning id into v_divida_id;

  v_valor_parcela := round(p_valor_total / p_num_parcelas, 2);

  for i in 1..p_num_parcelas loop
    insert into despesas (
      descricao, valor, categoria_id, data_despesa, status, divida_id
    ) values (
      p_descricao || ' — parcela ' || i || '/' || p_num_parcelas,
      v_valor_parcela,
      p_categoria_id,
      (p_data_inicio + ((i - 1) || ' months')::interval)::date,
      'pendente',
      v_divida_id
    );
  end loop;

  return v_divida_id;
exception
  when others then
    -- Qualquer erro aqui propaga e desfaz (rollback) tudo que essa
    -- função já tinha inserido nesta chamada — a dívida e as
    -- parcelas já geradas somem junto, nada fica gravado pela metade.
    raise exception 'Falha ao gerar as parcelas da dívida (rollback automático, nada foi salvo): %', sqlerrm;
end;
$$;

grant execute on function criar_divida_com_parcelas(text, text, numeric, integer, numeric, date, uuid, uuid) to authenticated;

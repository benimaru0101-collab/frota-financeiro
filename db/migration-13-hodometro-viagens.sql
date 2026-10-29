-- ============================================================
-- Migration 13 — Hodômetro nas viagens
-- ------------------------------------------------------------
-- A viagem passa a registrar a quilometragem do veículo na saída
-- (km_inicial) e na chegada (km_final). Com isso o app calcula os KM
-- rodados, o custo por KM e o lucro por KM no Dashboard.
--
-- Ao finalizar uma viagem, o km_atual do veículo é atualizado
-- automaticamente (nunca diminui).
--
-- Idempotente: pode rodar mais de uma vez sem erro.
-- ============================================================

alter table viagens add column if not exists km_inicial numeric(10,1);
alter table viagens add column if not exists km_final   numeric(10,1);

alter table viagens drop constraint if exists viagens_km_valido;
alter table viagens add constraint viagens_km_valido check (
  (km_inicial is null or km_inicial >= 0)
  and (km_final is null or km_final >= 0)
  and (km_inicial is null or km_final is null or km_final >= km_inicial)
);

-- Atualiza o hodômetro do veículo quando a viagem recebe km_final.
-- security definer: o motorista não pode editar veículos diretamente,
-- mas a quilometragem informada por ele precisa chegar no cadastro.
create or replace function atualizar_km_veiculo() returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.veiculo_id is not null and new.km_final is not null then
    update veiculos
       set km_atual = greatest(coalesce(km_atual, 0), new.km_final)
     where id = new.veiculo_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_atualizar_km_veiculo on viagens;
create trigger trg_atualizar_km_veiculo
  after insert or update of km_final on viagens
  for each row execute function atualizar_km_veiculo();

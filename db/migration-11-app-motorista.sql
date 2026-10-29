-- ============================================================
-- migration-11 — App do Motorista
-- ------------------------------------------------------------
-- 1) Liga cada cadastro de motorista a uma conta de login
--    (motoristas.user_id -> auth.users).
-- 2) Viagens ganham o ciclo do motorista: Agendada -> Em andamento
--    -> Concluída, com horário de início/fim, comprovante de entrega
--    (foto no bucket "documentos") e observação.
-- 3) RLS: o Motorista só vê e só atualiza as PRÓPRIAS viagens (resolve
--    a limitação anotada na migration-8). O administrador continua
--    vendo e editando tudo.
-- 4) Só administrador cria/edita/exclui cadastros de motorista (senão um
--    motorista poderia se vincular ao cadastro de outro).
-- Idempotente: pode rodar mais de uma vez sem erro.
-- ============================================================

alter table motoristas add column if not exists user_id uuid unique references auth.users (id) on delete set null;

alter table viagens add column if not exists iniciada_em timestamptz;
alter table viagens add column if not exists finalizada_em timestamptz;
alter table viagens add column if not exists comprovante_url text;
alter table viagens add column if not exists observacao_motorista text;

-- Viagens novas nascem "Agendada" (o motorista inicia e finaliza pelo
-- app). As já existentes continuam como estão.
alter table viagens alter column status set default 'Agendada';

-- id do cadastro de motorista ligado ao usuário logado (ou null).
create or replace function meu_motorista_id() returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from motoristas where user_id = auth.uid() limit 1;
$$;

grant execute on function meu_motorista_id() to authenticated;

-- ------------------------------------------------------------
-- VIAGENS
-- ------------------------------------------------------------
drop policy if exists "Usuários autenticados podem ler (viagens)" on viagens;
drop policy if exists "Usuários autenticados podem inserir (viagens)" on viagens;
drop policy if exists "Usuários autenticados podem atualizar (viagens)" on viagens;
drop policy if exists "Usuários autenticados podem excluir (viagens)" on viagens;
drop policy if exists "Admin ou motorista da viagem lê (viagens)" on viagens;
drop policy if exists "Só administrador insere (viagens)" on viagens;
drop policy if exists "Admin ou motorista da viagem atualiza (viagens)" on viagens;
drop policy if exists "Só administrador exclui (viagens)" on viagens;

create policy "Admin ou motorista da viagem lê (viagens)"
  on viagens for select to authenticated
  using (is_admin() or motorista_id = meu_motorista_id());

create policy "Só administrador insere (viagens)"
  on viagens for insert to authenticated
  with check (is_admin());

create policy "Admin ou motorista da viagem atualiza (viagens)"
  on viagens for update to authenticated
  using (is_admin() or motorista_id = meu_motorista_id())
  with check (is_admin() or motorista_id = meu_motorista_id());

create policy "Só administrador exclui (viagens)"
  on viagens for delete to authenticated
  using (is_admin());

-- O motorista só pode mexer nos campos do próprio ciclo da viagem
-- (status, horários, comprovante, observação) — nunca em valor,
-- rota, veículo ou no motorista atribuído.
create or replace function proteger_viagem_motorista() returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not is_admin() then
    if new.valor is distinct from old.valor
       or new.origem is distinct from old.origem
       or new.destino is distinct from old.destino
       or new.data_viagem is distinct from old.data_viagem
       or new.veiculo_id is distinct from old.veiculo_id
       or new.motorista_id is distinct from old.motorista_id then
      raise exception 'O motorista só pode atualizar o status, o comprovante e a observação da viagem';
    end if;
    if new.status not in ('Agendada', 'Em andamento', 'Concluída') then
      raise exception 'Status de viagem inválido';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_proteger_viagem_motorista on viagens;
create trigger trg_proteger_viagem_motorista
  before update on viagens
  for each row execute function proteger_viagem_motorista();

-- ------------------------------------------------------------
-- MOTORISTAS: todos leem (a tela de Frota lista), só admin altera.
-- ------------------------------------------------------------
drop policy if exists "Usuários autenticados podem inserir (motoristas)" on motoristas;
drop policy if exists "Usuários autenticados podem atualizar (motoristas)" on motoristas;
drop policy if exists "Usuários autenticados podem excluir (motoristas)" on motoristas;
drop policy if exists "Só administrador insere (motoristas)" on motoristas;
drop policy if exists "Só administrador atualiza (motoristas)" on motoristas;
drop policy if exists "Só administrador exclui (motoristas)" on motoristas;

create policy "Só administrador insere (motoristas)"
  on motoristas for insert to authenticated with check (is_admin());
create policy "Só administrador atualiza (motoristas)"
  on motoristas for update to authenticated using (is_admin()) with check (is_admin());
create policy "Só administrador exclui (motoristas)"
  on motoristas for delete to authenticated using (is_admin());

-- ============================================================
-- Financeiro e Frota Logística — Schema inicial (PostgreSQL/Supabase)
-- Atividade: Planejamento do App e Setup Inicial — Parte 2, item 4
-- ============================================================
-- Como aplicar: cole este arquivo no SQL Editor do seu projeto
-- Supabase (Database > SQL Editor) e execute. `auth.users` já
-- existe automaticamente no Supabase (gerenciado pelo Supabase Auth).

create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- PERFIS (1:1 com auth.users, criado no primeiro login)
-- ------------------------------------------------------------
create table if not exists profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  nome        text,
  email       text,
  avatar_url  text,
  criado_em   timestamptz not null default now()
);

-- ------------------------------------------------------------
-- FROTA
-- ------------------------------------------------------------
create table if not exists veiculos (
  id           uuid primary key default uuid_generate_v4(),
  placa        text not null unique,
  modelo       text not null,
  tipo         text not null,               -- Cavalo Mecânico, Carreta, Truck...
  status       text not null default 'Ativo', -- Ativo, Manutenção, Inativo
  km_atual     numeric(10,1) default 0,
  criado_por   uuid references profiles (id),
  criado_em    timestamptz not null default now()
);

create table if not exists motoristas (
  id            uuid primary key default uuid_generate_v4(),
  nome          text not null,
  cnh_numero    text,
  cnh_categoria text,
  cnh_validade  date,
  status        text not null default 'Ativo',
  criado_em     timestamptz not null default now()
);

create table if not exists viagens (
  id            uuid primary key default uuid_generate_v4(),
  veiculo_id    uuid references veiculos (id) on delete set null,
  motorista_id  uuid references motoristas (id) on delete set null,
  origem        text not null,
  destino       text not null,
  data_viagem   date not null,
  valor         numeric(12,2) not null default 0,
  status        text not null default 'Concluída',
  criado_em     timestamptz not null default now()
);

create table if not exists abastecimentos (
  id                 uuid primary key default uuid_generate_v4(),
  veiculo_id         uuid references veiculos (id) on delete cascade,
  litros             numeric(8,2) not null,
  valor              numeric(12,2) not null,
  posto              text,
  data_abastecimento date not null,
  criado_em          timestamptz not null default now()
);

create table if not exists manutencoes (
  id               uuid primary key default uuid_generate_v4(),
  veiculo_id       uuid references veiculos (id) on delete cascade,
  tipo             text not null,   -- Preventiva, Corretiva...
  descricao        text,
  valor            numeric(12,2) not null,
  data_manutencao  date not null,
  criado_em        timestamptz not null default now()
);

create table if not exists documentos (
  id              uuid primary key default uuid_generate_v4(),
  veiculo_id      uuid references veiculos (id) on delete cascade,
  tipo            text not null,   -- Seguro, IPVA, Licenciamento...
  numero          text,
  data_emissao    date,
  data_vencimento date,
  arquivo_url     text,
  criado_em       timestamptz not null default now()
);

-- ------------------------------------------------------------
-- FINANCEIRO
-- ------------------------------------------------------------
create table if not exists categorias_financeiras (
  id    uuid primary key default uuid_generate_v4(),
  nome  text not null,
  tipo  text not null check (tipo in ('receita', 'despesa'))
);

create table if not exists receitas (
  id            uuid primary key default uuid_generate_v4(),
  descricao     text not null,
  valor         numeric(12,2) not null,
  categoria_id  uuid references categorias_financeiras (id),
  viagem_id     uuid references viagens (id) on delete set null,
  data_receita  date not null,
  criado_em     timestamptz not null default now()
);

create table if not exists despesas (
  id            uuid primary key default uuid_generate_v4(),
  descricao     text not null,
  valor         numeric(12,2) not null,
  categoria_id  uuid references categorias_financeiras (id),
  veiculo_id    uuid references veiculos (id) on delete set null,
  data_despesa  date not null,
  criado_em     timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Segurança (RLS) — habilite e restrinja por usuário autenticado.
-- Ajuste as policies conforme o modelo de permissões da equipe
-- (ex: multi-empresa, motorista só vê suas próprias viagens etc.)
-- ------------------------------------------------------------
alter table profiles enable row level security;
alter table veiculos enable row level security;
alter table motoristas enable row level security;
alter table viagens enable row level security;
alter table abastecimentos enable row level security;
alter table manutencoes enable row level security;
alter table documentos enable row level security;
alter table receitas enable row level security;
alter table despesas enable row level security;
alter table categorias_financeiras enable row level security;

-- profiles: cada usuário só enxerga e edita o próprio perfil.
create policy "Usuário vê o próprio perfil"
  on profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Usuário edita o próprio perfil"
  on profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Usuário cria o próprio perfil"
  on profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Demais tabelas: modelo de equipe única (todo usuário autenticado
-- lê e escreve tudo). Se o app crescer para múltiplas empresas/frotas,
-- troque `using (true)` por uma checagem de "empresa_id" do usuário.
do $$
declare
  tabela text;
begin
  foreach tabela in array array[
    'veiculos', 'motoristas', 'viagens', 'abastecimentos',
    'manutencoes', 'documentos', 'receitas', 'despesas',
    'categorias_financeiras'
  ]
  loop
    execute format(
      'create policy "Usuários autenticados podem ler (%1$s)" on %1$s for select to authenticated using (true);',
      tabela
    );
    execute format(
      'create policy "Usuários autenticados podem inserir (%1$s)" on %1$s for insert to authenticated with check (true);',
      tabela
    );
    execute format(
      'create policy "Usuários autenticados podem atualizar (%1$s)" on %1$s for update to authenticated using (true) with check (true);',
      tabela
    );
    execute format(
      'create policy "Usuários autenticados podem excluir (%1$s)" on %1$s for delete to authenticated using (true);',
      tabela
    );
  end loop;
end $$;

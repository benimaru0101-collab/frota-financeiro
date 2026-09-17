-- ============================================================
-- Seed opcional — dados de exemplo (os mesmos do protótipo local)
-- ============================================================
-- Depois de ligar o app ao Supabase de verdade, o banco começa vazio
-- (nenhum veículo/motorista/etc. cadastrado ainda). Este script é
-- opcional: só preenche o banco com os mesmos dados fictícios que o
-- protótipo usava (mockData.js), pra já abrir o app com algo pra
-- mostrar na apresentação, em vez de cadastrar tudo na mão pelo app.
--
-- É seguro rodar mais de uma vez: só insere se a tabela `veiculos`
-- ainda estiver vazia.
--
-- Como aplicar: cole no SQL Editor do seu projeto Supabase
-- (Database > SQL Editor) e execute. Rode depois do schema.sql e da
-- migration-2-motoristas-cnh.sql.

do $$
declare
  v_abc uuid;
  v_def uuid;
  v_ghi uuid;
  v_jkl uuid;
  m_carlos uuid;
  m_joao uuid;
  m_marcos uuid;
  cat_frota uuid;
  cat_operacional uuid;
begin
  if exists (select 1 from veiculos) then
    raise notice 'Já existem veículos cadastrados — seed não aplicado (rode só em banco vazio).';
    return;
  end if;

  insert into veiculos (placa, modelo, tipo, status, km_atual) values
    ('ABC-1234', 'Mercedes FH 460', 'Cavalo Mecânico', 'Ativo', 175000)
    returning id into v_abc;
  insert into veiculos (placa, modelo, tipo, status, km_atual) values
    ('DEF-5678', 'Volvo FH 540', 'Carreta', 'Ativo', 98200)
    returning id into v_def;
  insert into veiculos (placa, modelo, tipo, status, km_atual) values
    ('GHI-9101', 'Scania R450', 'Carreta', 'Manutenção', 212400)
    returning id into v_ghi;
  insert into veiculos (placa, modelo, tipo, status, km_atual) values
    ('JKL-1122', 'Volvo VM 270', 'Truck', 'Ativo', 64900)
    returning id into v_jkl;

  insert into motoristas (nome, cnh, status) values
    ('Carlos Silva', 'CNH: E 22/09/1', 'Ativo') returning id into m_carlos;
  insert into motoristas (nome, cnh, status) values
    ('João Santos', 'CNH: E 14/03/1', 'Ativo') returning id into m_joao;
  insert into motoristas (nome, cnh, status) values
    ('Marcos Lima', 'CNH: E 30/11/1', 'Inativo') returning id into m_marcos;

  insert into viagens (veiculo_id, motorista_id, origem, destino, data_viagem, valor) values
    (v_abc, m_carlos, 'São Paulo', 'Curitiba', '2024-06-10', 3200.00),
    (v_def, m_joao, 'Curitiba', 'Porto Alegre', '2024-06-12', 2850.00),
    (v_ghi, m_carlos, 'Belo Horizonte', 'Vitória', '2024-06-15', 1980.00);

  insert into abastecimentos (veiculo_id, litros, valor, data_abastecimento) values
    (v_abc, 320, 2150.00, '2024-06-09'),
    (v_def, 280, 1890.00, '2024-06-11');

  insert into manutencoes (veiculo_id, tipo, valor, data_manutencao) values
    (v_ghi, 'Preventiva - Freios', 1200.00, '2024-06-05'),
    (v_abc, 'Troca de óleo', 450.00, '2024-06-01');

  insert into documentos (veiculo_id, tipo, data_vencimento) values
    (v_abc, 'Seguro', '2024-09-16'),
    (v_def, 'IPVA', '2025-01-20');

  insert into receitas (descricao, valor, data_receita) values
    ('Frota - Transporte X', 12500.00, '2024-04-10'),
    ('Frota - Empresa Y', 8900.00, '2024-05-22'),
    ('Frota - Cliente Z', 6400.00, '2024-06-05');

  insert into categorias_financeiras (nome, tipo) values ('Frota', 'despesa') returning id into cat_frota;
  insert into categorias_financeiras (nome, tipo) values ('Operacional', 'despesa') returning id into cat_operacional;

  insert into despesas (descricao, valor, categoria_id, data_despesa) values
    ('Combustível', 15200.00, cat_frota, '2024-04-08'),
    ('Manutenção', 8750.00, cat_frota, '2024-05-15'),
    ('Serviço Extra', 1300.00, cat_operacional, '2024-05-20'),
    ('Pedágio', 1500.00, cat_frota, '2024-06-03');
end $$;

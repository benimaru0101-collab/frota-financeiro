-- Campos extras para Contas e Categorias, para bater com o protótipo
-- detalhado (tela "Nova Conta" com Banco/Instituição e Descrição, tela
-- "Nova Categoria" com Ícone e Cor).
alter table contas add column if not exists banco text;
alter table contas add column if not exists descricao text;

alter table categorias_financeiras add column if not exists icone text;
alter table categorias_financeiras add column if not exists cor text;
alter table categorias_financeiras add column if not exists descricao text;

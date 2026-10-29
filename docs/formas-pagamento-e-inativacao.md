# Formas de Pagamento e inativação de categorias (migration-10)

Atende aos itens "Categorias Financeiras" (soft delete) e "Formas de Pagamento"
da Parte 1 e ao roteiro do vídeo da Parte 2 ("Exibição das telas de cadastros
base: Categorias; Formas de Pagamento").

## O que mudou

- **Categorias não são mais excluídas.** Na lista (toque e segure) ou na tela
  de edição, o botão passa a ser **Desativar / Reativar**. A categoria inativa
  fica apagada na lista com a marca "Inativa" e some dos formulários, mas as
  receitas e despesas antigas continuam ligadas a ela — o histórico não quebra.
- **Nova tela Financeiro → Formas de Pagamento.** Lista Pix, Boleto, Cartão,
  Dinheiro e Transferência com o status Ativa/Inativa; toque para desativar ou
  reativar; dá para cadastrar uma forma nova (ex.: Cheque).
- **Formulários de Receita e Despesa** mostram só as formas de pagamento
  ativas, e o de Despesa mostra só as categorias de despesa ativas.
- **Dívidas e Financiamentos:** o formulário mostra a prévia do valor de cada
  parcela (ex.: "6x de R$ 500,00") e ganhou o campo opcional **valor para
  quitação antecipada**, exibido na lista de dívidas.

## Banco de dados

Rodar `db/migration-10-formas-pagamento-e-inativacao.sql` no SQL Editor do
Supabase (depois das migrations 1 a 9). Ela:

1. adiciona `ativa boolean default true` em `categorias_financeiras`;
2. cria `formas_pagamento (id, nome, icone, ativa, criado_em)` com RLS só para
   administrador e **sem policy de DELETE** (só inativação);
3. cadastra as 5 formas padrão;
4. adiciona `valor_quitacao` (opcional) em `dividas_financiamentos`.

Testado em Postgres 16 local: todas as migrations (schema + 2 a 10) rodam em
sequência, a 10 pode rodar duas vezes, o administrador desativa forma e
categoria, o DELETE de forma de pagamento não apaga nada (não há policy), e o
Motorista não enxerga as formas de pagamento.

Sem a migration aplicada o app continua funcionando: os formulários usam a
lista padrão e a tela de Formas de Pagamento mostra essa lista só para leitura.

# Board sugerido — Trello

Board: **Financeiro e Frota Logística**

## Colunas

1. **Backlog**
2. **A Fazer (Sprint atual)**
3. **Em Andamento**
4. **Em Revisão (PR aberto)**
5. **Concluído**

## Cartões iniciais (Setup Inicial — esta atividade)

- [ ] Definir stack e justificar escolha (Parte 1.2)
- [ ] Prototipar telas principais em baixa/média fidelidade (Parte 1.3)
- [ ] Criar projeto Expo + estrutura de pastas
- [ ] Modelar banco de dados (DER) e rodar schema no Supabase (Parte 2.4)
- [ ] Configurar Supabase Auth + Google OAuth (Parte 2.5)
- [ ] Implementar tela de Login com SSO Google e testar persistência de sessão
- [ ] Criar repositório Git e configurar proteção da branch main (Parte 3.7)
- [ ] Montar board de tarefas (esta atividade)
- [ ] Preparar apresentação final com evidências

## Próximas sprints (backlog de desenvolvimento)

Concluído:

- [x] Tela Dashboard com dados calculados a partir dos lançamentos reais
- [x] CRUD de veículos (criar, listar/buscar, editar, excluir)
- [x] CRUD de motoristas (criar, listar/buscar, editar, excluir)
- [x] CRUD completo (criar, listar/buscar, editar, excluir) de viagens,
      abastecimentos, manutenções e documentos (associados a veículo —
      e, no caso de viagens, também ao motorista)
- [x] Registrar e excluir receitas e despesas, com data
- [x] Gráfico de Fluxo de Caixa com dados reais (agrupado por mês, a
      partir das receitas/despesas cadastradas)
- [x] Editar perfil e alterar senha (via Supabase Auth)
- [x] Persistir preferências de Configurações no dispositivo
- [x] Ligar todas as telas ao Supabase de verdade (o `DataContext`
      agora lê/escreve nas tabelas reais via `supabase.from(...)`,
      protegido pelas policies de RLS do schema — nada mais fica só no
      AsyncStorage do aparelho)
- [x] Upload de documentos (Supabase Storage): tela de Novo/Editar
      Documento agora deixa tirar foto ou escolher da galeria, envia
      pro bucket público `documentos` e salva a URL em
      `documentos.arquivo_url`; a lista mostra 📎 nos documentos com
      arquivo anexado e a tela de edição tem link "Ver arquivo enviado"
- [x] Telas de Contas e Categorias (módulo Financeiro): nova tabela
      `contas` (nome, tipo, saldo inicial) e tela própria pra
      `categorias_financeiras` (antes só existia por trás dos panos).
      CRUD completo nas duas, acessível pelo menu da tela Financeiro
- [x] Notificações de vencimento de documentos: aviso visual no
      Dashboard (documentos vencidos/vencendo nos próximos 30 dias) +
      notificação local agendada no aparelho via `expo-notifications`
      (sem precisar de servidor/push — funciona no Expo Go). Controlado
      pelo toggle "Notificações" em Configurações
- [x] Telas de Contas e Categorias revisadas pra bater com o protótipo
      detalhado: filtros por abas (Todas/Bancárias/Caixa e
      Todas/Receitas/Despesas), campos novos (Banco/Instituição e
      Descrição em Contas; Ícone e Cor em Categorias, com seletor de
      emoji e paleta de cores) e botão "+" no topo da lista
- [x] Módulo de Relatórios (novo): tela Relatórios com seletor de
      período, resumo geral (receitas/despesas/saldo), "Despesas por
      categoria" (barra segmentada + legenda, já que o app não usa
      biblioteca de gráficos) e "Evolução mensal"; Relatório Detalhado
      com a lista de receitas e despesas do período; Filtros do
      Relatório (período, tipo, categoria, conta). Acessível pelo menu
      Financeiro e pelo atalho "Relatórios" no Dashboard (que antes não
      fazia nada — o componente `QuickAction` não tinha o toque ligado)
- [x] Corrigido: os atalhos de "Acesso rápido" no Dashboard
      (Financeiro/Frota/Relatórios) não respondiam ao toque

## Núcleo Financeiro (atualização do enunciado — Parte 2)

- [x] Status (Pendente / Pago-Recebido), data de pagamento, forma de
      pagamento e comprovante (foto/galeria) em receitas e despesas
      (migration-6). Formulários de Nova Receita/Despesa pedem o
      status e só mostram forma de pagamento/comprovante quando já
      está pago; lista permite marcar como pago/pendente e excluir
      pelo toque-e-segure
- [x] Validação de valor > 0 nos formulários de receita/despesa
- [x] Motor de Saldo: `resumo.saldoAtual` agora só soma lançamentos
      com status concluído — Dashboard mostra "Saldo Atual" (não mais
      a soma de tudo, pendente incluído)
- [x] Projeção de Caixa: lançamentos "Pendente" agrupados por mês de
      vencimento, exibidos no Dashboard (card "Projeção de Caixa")
- [x] Módulo de Dívidas e Financiamentos (migration-7): tabela
      `dividas_financiamentos` + função `criar_divida_com_parcelas`
      no Postgres, que gera a dívida e todas as parcelas (como
      despesas "Pendente" vinculadas) dentro de uma transação — se
      algo falhar no meio, tudo é desfeito automaticamente (rollback).
      Telas "Dívidas e Financiamentos" (lista com progresso de
      parcelas pagas) e "Nova Dívida/Financiamento"
- [x] RBAC — Administrador × Motorista (migration-8): campo `role` em
      `profiles` (criado automaticamente no primeiro login), aba
      Financeiro escondida da navegação para quem é Motorista, e as
      tabelas do Financeiro (receitas, despesas, contas, categorias,
      dívidas) só ficam visíveis/editáveis por administrador — reforçado
      também via RLS no banco, não só escondendo na tela
      - Limitação conhecida: `motoristas` ainda não tem vínculo com
        `auth.users`, então o Motorista vê a Frota inteira (não só as
        próprias viagens) — fica pra uma próxima entrega

Ainda pendente:

- [ ] Rodar as migrations 6, 7 e 8 no Supabase de produção (SQL Editor,
      nessa ordem) — sem isso o app quebra ao tentar ler/gravar os
      campos novos
- [ ] Testar o login com SSO Google e a persistência de sessão em um
      dispositivo/emulador real e anexar prints como evidência (Parte 2.6)
- [ ] Gravar o vídeo demonstrativo do Núcleo Financeiro em
      emulador/dispositivo Android real
- [ ] Confirmar no GitHub que o repositório está público e que a
      proteção da branch main (PR obrigatório + 1 aprovação) está
      realmente ativa nas configurações do repositório

> Membros do grupo: atribua cada cartão a um responsável e defina
> etiquetas por módulo (Financeiro / Frota / Auth / Infra).

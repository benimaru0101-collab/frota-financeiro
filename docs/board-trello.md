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

Ainda pendente:

- [ ] Testar o login com SSO Google e a persistência de sessão em um
      dispositivo/emulador real e anexar prints como evidência (Parte 2.6)

> Membros do grupo: atribua cada cartão a um responsável e defina
> etiquetas por módulo (Financeiro / Frota / Auth / Infra).

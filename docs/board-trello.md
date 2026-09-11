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

Concluído no protótipo funcional (dados locais, persistidos no
dispositivo via AsyncStorage — ainda não ligados ao Supabase):

- [x] Tela Dashboard com dados calculados a partir dos lançamentos reais
- [x] CRUD de veículos (criar, listar/buscar, editar, excluir)
- [x] CRUD de motoristas (criar, listar/buscar, editar, excluir)
- [x] Registrar viagens, abastecimentos e manutenções (associados a
      veículo — e, no caso de viagens, também ao motorista) com
      exclusão nas listagens
- [x] Registrar receitas e despesas com data, com exclusão nas
      listagens
- [x] Gráfico de Fluxo de Caixa com dados reais (agrupado por mês, a
      partir das receitas/despesas cadastradas)
- [x] Editar perfil e alterar senha (via Supabase Auth)
- [x] Persistir preferências de Configurações no dispositivo

Ainda pendente:

- [ ] Ligar todas as telas ao Supabase de verdade (hoje usam estado
      local — trocar cada `add*/update*/delete*` do `DataContext` por
      chamadas `supabase.from(...)`)
- [ ] Editar viagens/abastecimentos/manutenções/documentos (hoje só
      criam e excluem; falta uma tela de edição como a de veículos)
- [ ] Upload de documentos (Supabase Storage)
- [ ] Notificações de vencimento de documentos/manutenções
- [ ] Testar o login com SSO Google e a persistência de sessão em um
      dispositivo/emulador real e anexar prints como evidência (Parte 2.6)

> Membros do grupo: atribua cada cartão a um responsável e defina
> etiquetas por módulo (Financeiro / Frota / Auth / Infra).

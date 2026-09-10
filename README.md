# Financeiro e Frota Logística

App mobile (React Native + Expo) para gestão financeira e de frota,
desenvolvido a partir do protótipo de baixa fidelidade da equipe.

## Stack

- **Frontend:** React Native + Expo (React Navigation para as rotas)
- **Backend / Banco de dados:** Supabase (PostgreSQL + Auth + Storage)
- **Autenticação:** Login com e-mail/senha e SSO Google via
  `expo-auth-session` + Supabase Auth (fluxo OAuth2 nativo, sem
  formulário manual)

Justificativa da stack está na apresentação da atividade (`docs/`).

## Setup do projeto

> ⚠️ Este código foi escrito em um ambiente sem acesso ao registro
> npm, então as dependências **não foram instaladas nem testadas**
> aqui. Rode os passos abaixo na máquina de vocês.

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Crie um projeto em [supabase.com](https://supabase.com), copie a
   `Project URL` e a `anon key`.
3. Rode o script `db/schema.sql` no SQL Editor do Supabase para criar
   as tabelas (veículos, motoristas, viagens, abastecimentos,
   manutenções, documentos, receitas, despesas).
4. No painel do Supabase, ative o provedor **Google** em
   `Authentication > Providers` e configure as credenciais OAuth
   criadas no [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   (tela de consentimento OAuth + Client IDs Web/Android/iOS).
5. Copie `.env.example` para `.env` e preencha com suas credenciais.
   Depois, replique esses valores em `app.json > expo.extra` (ou
   configure via `eas.json` / variáveis de ambiente em builds EAS).
6. Rode o app:
   ```bash
   npx expo start
   ```
   Escaneie o QR code com o app Expo Go, ou pressione `a`/`i` para
   abrir no emulador Android/iOS.

## Estrutura de telas

- **Autenticação:** Splash, Boas-vindas, Login, Cadastro, Recuperar
  senha, Código de verificação, Nova senha, Sucesso
- **Início:** Dashboard com saldo, receitas/despesas do mês e acesso
  rápido
- **Financeiro:** Receitas, Despesas, Fluxo de Caixa
- **Frota:** Veículos, Detalhes do veículo, Motoristas, Viagens,
  Abastecimentos, Manutenções, Documentos
- **Mais:** Perfil, Configurações

## Modelagem de dados

Veja `db/schema.sql` (script pronto para rodar no Supabase) e
`docs/DER.mmd` / `docs/DER.png` (diagrama entidade-relacionamento).

## Organização do projeto (Trello)

Board sugerido — colunas e cartões iniciais em `docs/board-trello.md`.
Crie o board em [trello.com](https://trello.com) replicando essa
estrutura (ou peça para o Claude criar automaticamente conectando o
Trello nas configurações de conectores).

## Controle de versão / regras do repositório

Depois de subir este repositório para o GitHub:

1. Vá em **Settings > Branches** no repositório.
2. Em **Branch protection rules**, adicione uma regra para `main`
   com, no mínimo:
   - "Require a pull request before merging"
   - "Require approvals" (1 aprovação)
   - "Do not allow bypassing the above settings"
3. Isso bloqueia commits diretos na `main` — todo mundo precisa abrir
   PR a partir de uma branch (`feature/...`, `fix/...`).

Sugestão de convenção de branches: `feature/nome-da-tela`,
`fix/descricao-do-bug`, `chore/tarefa-organizacional`.

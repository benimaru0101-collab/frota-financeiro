# Financeiro e Frota Logística

Aplicativo Android de **gestão financeira e logística** para pequenas transportadoras.
O projeto tem **dois apps** que usam o mesmo código e o mesmo banco de dados:

| App | Para quem | O que faz |
|---|---|---|
| **Frota ADM** | Gestor / dono da empresa | Caixa (receitas e despesas), dívidas e financiamentos, frota, manutenções, documentos, viagens, relatórios e dashboard de lucro e custo por KM |
| **Frota Motorista** | Motorista | Vê as próprias viagens, inicia e finaliza informando o KM do painel, tira foto do comprovante, registra abastecimento, abre a rota no Google Maps e salva a viagem no Google Agenda |

Os dois funcionam **sem internet**: os dados ficam salvos no aparelho e o que for lançado offline é enviado sozinho quando a conexão volta.

> **Baixar os APKs prontos:** [Releases](https://github.com/benimaru0101-collab/frota-financeiro/releases)

---

## Funcionalidades

- **Autenticação:** e-mail/senha e **Login com Google** (OAuth2 + PKCE via `expo-auth-session` + Supabase Auth). A sessão fica salva no aparelho.
- **Controle de acesso (RBAC):** papéis `administrador`, `motorista` e `pendente`. Contas novas no app ADM ficam **aguardando aprovação** até um administrador aprovar em *Usuários*. As regras valem no banco (RLS + triggers), não só na tela.
- **Caixa:** receitas e despesas com status Pendente/Pago, forma de pagamento, comprovante (foto), contas e categorias. O saldo atual considera só o que já foi pago ou recebido.
- **Projeção de caixa:** os lançamentos pendentes aparecem agrupados por mês.
- **Dívidas e financiamentos:** as parcelas são geradas automaticamente numa transação no Postgres.
- **Frota:** veículos (com hodômetro), motoristas, manutenções, abastecimentos e documentos com aviso de vencimento (notificação local).
- **Viagens e hodômetro:** KM de saída e de chegada, KM rodados e atualização automática do KM do veículo (trigger).
- **Dashboard de BI:**
  - saldo, receitas e despesas do mês;
  - **Desempenho da Frota:** lucro operacional, custo/KM, receita/KM, lucro/KM e ranking por veículo;
  - relatórios por período e categoria.
- **Resiliência offline:** cache de leitura e fila de escrita persistente com sincronização automática (detalhes abaixo).
- **Integrações Google:** rota no Maps e evento no Agenda por link direto, sem chave de API.

## Tecnologias

| Camada | Tecnologia |
|---|---|
| App | React Native 0.74 + **Expo SDK 51** (JavaScript) |
| Navegação | React Navigation 6 (abas inferiores + pilhas) |
| Estado | React Context (`AuthContext`, `DataContext`, `MotoristaContext`) |
| Backend | **Supabase**: PostgreSQL, Auth, Storage e Row Level Security |
| Offline | AsyncStorage (cache + fila) e `expo-file-system` (fotos pendentes) |
| Build | Gradle (pasta `android/` versionada) — gera os 2 APKs |

## Arquitetura (resumo)

```
src/
  screens/      telas (View)            -> só desenham e chamam ações
  contexts/     estado + regras (ViewModel) -> AuthContext, DataContext, MotoristaContext
  lib/          acesso a dados (Model/serviços) -> supabase, motorista, offline, upload, google
  components/   componentes de UI reutilizáveis (UI.js, DesempenhoFrota, BarraOffline)
  navigation/   RootNavigator decide: login | aguardando aprovação | app ADM | app Motorista
  config/       variante do app (adm | motorista), gerada pelos scripts de build
db/             schema.sql + migrations numeradas (rodar em ordem no Supabase)
```

É uma divisão em camadas no estilo **MVVM**:

- **Telas (View):** não falam com o banco.
- **Contextos (ViewModel):** guardam o estado e expõem ações (`addDespesa`, `updateViagem`…).
- **`lib/` (Model/serviços):** faz o acesso ao Supabase e ao armazenamento local.

### Estratégia offline

1. **Cache de leitura:** cada carregamento bem-sucedido é salvo no AsyncStorage. Sem rede, o app abre com a última cópia, inclusive o papel do usuário.
2. **Fila de escrita (outbox):** se uma gravação falha por falta de rede, ela vai para uma fila persistente e aparece na tela com ⏳.
   - Os registros novos já nascem com **UUID gerado no aparelho**, então não há duplicação.
   - Foto de comprovante feita offline é copiada para uma pasta do app e enviada depois.
3. **Sincronização:** a cada 15 s, ao voltar para o app ou pelo botão "Tentar agora".
   - A fila é enviada **na ordem** e depois os dados são recarregados do banco.
   - Conflito: a última gravação vence.

O código está em [`src/lib/offline.js`](src/lib/offline.js).

---

## Como rodar em desenvolvimento

**Pré-requisitos:** Node.js 18+, Git e uma conta gratuita no [Supabase](https://supabase.com). Para gerar APK, também o Android Studio (SDK + JDK).

1. Clone e instale as dependências:
   ```bash
   git clone https://github.com/benimaru0101-collab/frota-financeiro.git
   cd frota-financeiro
   npm install
   ```
2. **Banco de dados:** no Supabase, abra o *SQL Editor* e rode, nesta ordem:
   - `db/schema.sql`;
   - `db/migration-2-...sql` até `db/migration-13-hodometro-viagens.sql`;
   - (opcional) `db/seed-dados-exemplo.sql`.
3. **Login com Google:**
   1. Em *Authentication → Providers*, ative **Google** com o Client ID e o Secret criados no [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
   2. Em *Authentication → URL Configuration*, adicione as Redirect URLs `frotafinanceiro://**` e `frotamotorista://**`.
4. **Credenciais:** copie `.env.example` para `.env` e preencha `SUPABASE_URL` e `SUPABASE_ANON_KEY`. O `.env` não vai para o Git.
5. Rode:
   ```bash
   npx expo start            # Expo Go / emulador
   npx expo start --web      # versão web (rodar-app-web.bat no Windows)
   ```
   Para testar o app do Motorista em desenvolvimento, troque `src/config/variante.js` para `'motorista'`.

## Gerar os APKs e instalar no celular

### Gerar (Windows)

Com o Android Studio instalado:

1. Dê dois cliques em **`gerar-os-2-apks.bat`**, ou rode `gerar-apk-adm.bat` / `gerar-apk-motorista.bat` separadamente.
2. Os arquivos saem em **`apk/FrotaADM.apk`** e **`apk/FrotaMotorista.apk`**.

Por baixo, o script faz o seguinte:

```bat
:: grava a variante em src/config/variante.js e roda o Gradle
cd android
gradlew assembleRelease                 :: Frota ADM  (com.tempesta.frotafinanceiro)
gradlew assembleRelease -PappMotorista  :: Frota Motorista (com.tempesta.frotafinanceiro.motorista)
```

Os dois apps têm pacotes diferentes, então podem ficar instalados juntos no mesmo celular.

> Não rode `expo prebuild --clean`: ele recria a pasta `android/` e apaga a configuração das duas variantes.

### Instalar num Android físico

1. Copie o `.apk` para o celular (cabo USB, Google Drive, WhatsApp…) ou baixe direto da página de [Releases](https://github.com/benimaru0101-collab/frota-financeiro/releases).
2. Toque no arquivo. Se pedir, permita **"Instalar apps desconhecidos"** para o app que abriu o arquivo.
3. Se o Play Protect avisar, toque em **"Instalar mesmo assim"**.
4. Para atualizar, instale o APK novo **por cima** do antigo. O login é mantido.

Com cabo e depuração USB: `adb install -r apk/FrotaADM.apk`.

---

## Banco de dados

O modelo completo está em `db/schema.sql` e no DER (`docs/DER.png`). As migrations seguintes adicionaram:

| Migration | O que adiciona |
|---|---|
| 6 | Status de pagamento |
| 7 | Dívidas e parcelas |
| 8 e 9 | RBAC e gestão de usuários |
| 10 | Formas de pagamento e inativação |
| 11 | App do Motorista (vínculo usuário ↔ motorista, policies das viagens) |
| 12 | Aprovação de novos administradores |
| 13 | Hodômetro nas viagens |

## Fluxo de trabalho (Git)

- A `main` é protegida: PR obrigatório com 1 aprovação e sem *force push*.
- Branches: `feature/...`, `fix/...`, `docs/...`.
- Board da equipe: `docs/board-trello.md`.

## Documentação

- Documentação técnica da Parte 2: `docs/documentacao-parte2.pdf`
- Site público (política de privacidade e termos do login Google): https://benimaru0101-collab.github.io/frota-financeiro/

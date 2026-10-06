# Funcionalidades inspiradas no SaaS TempesT

Esta entrega aproxima o app **Financeiro e Frota Logística** do SaaS
TempesT (Fretes & Frotas), desenvolvido pelo mesmo autor: o que já
funcionava lá e fazia sentido para uma transportadora foi trazido para
cá, reaproveitando a arquitetura do app (contextos, RBAC, tema escuro).

| Recurso | No SaaS TempesT | Neste app |
|---|---|---|
| Central de alertas | Alertas de vencimento e pendências | Tela **Alertas** + bloco no Dashboard |
| Exportação de dados | CSV para Excel (`lib/export/csv.ts`) | Botão **Exportar CSV** nos Relatórios |
| Versão web instalável | PWA (manifest + service worker) | PWA via `react-native-web` |
| Regras testadas | `node:test` em funções puras | `npm test` (9 testes) |

## 1. Central de alertas

`src/utils/alertas.js` recebe documentos, receitas e despesas (os
mesmos dados que o `DataContext` já carrega) e devolve uma lista
ordenada por gravidade:

- **Documentos** (CRLV, seguro, ANTT...): aparecem 30 dias antes do
  vencimento; até 7 dias (ou vencidos) são *críticos*, o restante é *atenção*.
- **Despesas pendentes**: aparecem 7 dias antes do vencimento (*aviso*)
  e, se atrasadas, viram *críticas* (multa e juros).
- **Receitas pendentes atrasadas**: *atenção* (pedem cobrança).
- **RBAC:** o Motorista só vê alertas de documentos; os financeiros
  ficam restritos ao Administrador, igual às abas do app.

A função é pura (a data "de hoje" é injetável), então é testável sem
React nem banco. Cada alerta sabe para qual tela levar o usuário.

## 2. Exportação CSV

`src/utils/csv.js` foi portado do SaaS e segue o que o Excel em
português espera: separador `;`, BOM UTF-8 (acentos corretos), vírgula
decimal e `\r\n`. Também neutraliza *CSV/Formula Injection* (OWASP):
texto livre que começa com `=`, `+`, `-` ou `@` recebe um apóstrofo
para nunca virar fórmula. No relatório, receitas saem positivas e
despesas negativas, então o Excel soma o saldo direto.

No celular o botão abre a folha de compartilhamento (WhatsApp, e-mail,
Drive); na web baixa o arquivo. Nenhuma dependência nova.

## 3. Versão web / PWA

`app.json` ganhou a seção `web`; `public/` traz `index.html`,
`manifest.json`, ícones (192, 512 e *maskable*) e um `sw.js` mínimo
(rede primeiro, abre a "casca" offline, **nunca** guarda dados do
Supabase). O `vercel.json` define build e rotas. Pontos adaptados ao
navegador: login Google por redirecionamento, upload de comprovantes
sem `expo-file-system` e notificações locais desativadas na web.

## 4. Como validar

```bash
npm test          # 9 testes das regras de alertas e CSV
npm install       # instala react-native-web, react-dom e @expo/metro-runtime
npm run web       # testa no navegador
npm run build:web # gera dist/ para publicar (Vercel)
```

## O que foi verificado e o que falta

- Verificado: regras de alertas e CSV (`npm test`) e a sintaxe de todas
  as telas alteradas.
- **Não verificado neste ambiente** (sem acesso ao npm): compilação do
  app, `npm run web`, instalação como PWA e o login Google na web.
  Passo a passo no `README.md`.

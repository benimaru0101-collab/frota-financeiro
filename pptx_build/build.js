const pptxgen = require("pptxgenjs");

const COLORS = {
  bg: "121212",
  surface: "1E1E1E",
  surfaceAlt: "242424",
  border: "2C2C2C",
  primary: "FFC107",
  primaryDark: "E5A800",
  text: "FFFFFF",
  muted: "A0A0A0",
  success: "4CAF50",
  danger: "F44336",
  info: "2196F3",
  darkText: "1A1A1A",
};

const PROTO_IMG = "/root/.claude/uploads/4d0a2548-24b5-5918-8ad5-7f64c9d5405f/dd0097ad-image.png";
const DER_IMG = "/home/claude/frota-financeiro/docs/DER.png";

function newPres() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
  return pres;
}

function bgSlide(pres, opts = {}) {
  const slide = pres.addSlide();
  slide.background = { color: opts.bg || COLORS.bg };
  return slide;
}

function kicker(slide, text, opts = {}) {
  slide.addText(text.toUpperCase(), {
    x: opts.x ?? 0.6, y: opts.y ?? 0.45, w: opts.w ?? 8, h: 0.35,
    fontFace: "Calibri", fontSize: 12, bold: true, color: COLORS.primary,
    charSpacing: 2, isTextBox: true, margin: 0,
  });
}

function title(slide, text, opts = {}) {
  slide.addText(text, {
    x: opts.x ?? 0.6, y: opts.y ?? 0.78, w: opts.w ?? 11.5, h: opts.h ?? 0.8,
    fontFace: "Cambria", fontSize: opts.size ?? 32, bold: true, color: COLORS.text,
    isTextBox: true, margin: 0,
  });
}

function pageNum(slide, n, pres) {
  slide.addText(String(n).padStart(2, "0"), {
    x: 12.55, y: 7.05, w: 0.6, h: 0.3, fontFace: "Calibri", fontSize: 10,
    color: COLORS.muted, align: "right", isTextBox: true, margin: 0,
  });
}

function pill(slide, text, x, y, w, color) {
  slide.addShape("roundRect", {
    x, y, w, h: 0.4, rectRadius: 0.08, fill: { color: COLORS.surfaceAlt },
    line: { color: COLORS.border, width: 1 },
  });
  slide.addText(text, {
    x, y, w, h: 0.4, align: "center", valign: "middle", fontFace: "Calibri",
    fontSize: 11, bold: true, color: color || COLORS.text, isTextBox: true, margin: 0,
  });
}

const pres = newPres();

// ================= SLIDE 1 — CAPA =================
{
  const s = bgSlide(pres);
  s.addShape("roundRect", { x: 0.6, y: 0.7, w: 0.85, h: 0.85, rectRadius: 0.16, fill: { color: COLORS.primary } });
  s.addText("F", { x: 0.6, y: 0.7, w: 0.85, h: 0.85, align: "center", valign: "middle", fontFace: "Cambria", fontSize: 30, bold: true, color: COLORS.darkText, isTextBox: true, margin: 0 });

  s.addText("PLANEJAMENTO DO APP E SETUP INICIAL", {
    x: 0.6, y: 2.9, w: 10, h: 0.4, fontFace: "Calibri", fontSize: 14, bold: true,
    color: COLORS.primary, charSpacing: 2, isTextBox: true, margin: 0,
  });
  s.addText("App: Financeiro e Frota Logística", {
    x: 0.6, y: 3.3, w: 11.5, h: 1.4, fontFace: "Cambria", fontSize: 44, bold: true,
    color: COLORS.text, isTextBox: true, margin: 0,
  });
  s.addText("Apresentação da atividade — Parte 1, 2 e 3", {
    x: 0.6, y: 4.55, w: 10, h: 0.5, fontFace: "Calibri", fontSize: 16,
    color: COLORS.muted, isTextBox: true, margin: 0,
  });

  s.addShape("line", { x: 0.6, y: 5.35, w: 4.2, h: 0, line: { color: COLORS.border, width: 1 } });
  s.addText([
    { text: "Equipe: ", options: { bold: true, color: COLORS.text } },
    { text: "[Nome do grupo]", options: { color: COLORS.muted, italic: true } },
  ], { x: 0.6, y: 5.55, w: 8, h: 0.4, fontFace: "Calibri", fontSize: 14, isTextBox: true, margin: 0 });
  s.addText([
    { text: "Data: ", options: { bold: true, color: COLORS.text } },
    { text: "10/09/2026", options: { color: COLORS.muted } },
  ], { x: 0.6, y: 5.95, w: 8, h: 0.4, fontFace: "Calibri", fontSize: 14, isTextBox: true, margin: 0 });
}

// ================= SLIDE 2 — SUMÁRIO =================
{
  const s = bgSlide(pres);
  kicker(s, "Sumário");
  title(s, "O que vamos apresentar");

  const itens = [
    ["01", "Apresentação da equipe"],
    ["02", "Definição da stack tecnológica"],
    ["03", "Diretrizes de interface e protótipo"],
    ["04", "Modelagem de dados (DER)"],
    ["05", "Autenticação com Google (SSO)"],
    ["06", "Ferramenta de organização"],
    ["07", "Repositório Git e regras de proteção"],
  ];
  const colW = 5.6;
  itens.forEach((item, i) => {
    const col = i < 4 ? 0 : 1;
    const row = i < 4 ? i : i - 4;
    const x = 0.6 + col * (colW + 0.5);
    const y = 1.9 + row * 1.05;
    s.addText(item[0], { x, y, w: 0.9, h: 0.8, fontFace: "Cambria", fontSize: 26, bold: true, color: COLORS.primary, isTextBox: true, margin: 0 });
    s.addText(item[1], { x: x + 0.9, y: y + 0.08, w: colW - 0.9, h: 0.7, fontFace: "Calibri", fontSize: 16, color: COLORS.text, valign: "middle", isTextBox: true, margin: 0 });
  });
  pageNum(s, 2);
}

// ================= SLIDE 3 — PARTE 1.1 EQUIPE =================
{
  const s = bgSlide(pres);
  kicker(s, "Parte 1 · Item 1");
  title(s, "Apresentação da Equipe");
  s.addText("Preencha com o nome do grupo e o foco de cada integrante antes da entrega.", {
    x: 0.6, y: 1.55, w: 11, h: 0.4, fontFace: "Calibri", fontSize: 13, italic: true, color: COLORS.muted, isTextBox: true, margin: 0,
  });

  const membros = [
    ["[Nome do integrante 1]", "[Ex.: Front-end / UI-UX]"],
    ["[Nome do integrante 2]", "[Ex.: Backend / Banco de dados]"],
    ["[Nome do integrante 3]", "[Ex.: Integração / Autenticação]"],
    ["[Nome do integrante 4]", "[Ex.: Organização / QA]"],
  ];
  const cardW = 2.7, gap = 0.3, startX = 0.6, y = 2.3;
  membros.forEach((m, i) => {
    const x = startX + i * (cardW + gap);
    s.addShape("roundRect", { x, y, w: cardW, h: 3.4, rectRadius: 0.06, fill: { color: COLORS.surface }, line: { color: COLORS.border, width: 1 } });
    s.addShape("ellipse", { x: x + (cardW - 1.1) / 2, y: y + 0.4, w: 1.1, h: 1.1, fill: { color: COLORS.surfaceAlt }, line: { color: COLORS.primary, width: 1.5 } });
    s.addText("?", { x: x + (cardW - 1.1) / 2, y: y + 0.4, w: 1.1, h: 1.1, align: "center", valign: "middle", fontFace: "Cambria", fontSize: 28, bold: true, color: COLORS.primary, isTextBox: true, margin: 0 });
    s.addText(m[0], { x: x + 0.15, y: y + 1.75, w: cardW - 0.3, h: 0.6, align: "center", fontFace: "Calibri", fontSize: 13, bold: true, color: COLORS.text, isTextBox: true, margin: 0 });
    s.addText(m[1], { x: x + 0.15, y: y + 2.35, w: cardW - 0.3, h: 0.85, align: "center", fontFace: "Calibri", fontSize: 11, italic: true, color: COLORS.muted, isTextBox: true, margin: 0 });
  });
  pageNum(s, 3);
}

// ================= SLIDE 4 — PARTE 1.2 STACK =================
{
  const s = bgSlide(pres);
  kicker(s, "Parte 1 · Item 2");
  title(s, "Definição da Stack");

  // left: frontend
  s.addShape("roundRect", { x: 0.6, y: 1.7, w: 5.7, h: 4.9, rectRadius: 0.08, fill: { color: COLORS.surface }, line: { color: COLORS.border, width: 1 } });
  s.addText("FRONT-END", { x: 0.95, y: 1.95, w: 5, h: 0.35, fontFace: "Calibri", fontSize: 12, bold: true, color: COLORS.primary, charSpacing: 1.5, isTextBox: true, margin: 0 });
  s.addText("React Native + Expo", { x: 0.95, y: 2.3, w: 5, h: 0.55, fontFace: "Cambria", fontSize: 24, bold: true, color: COLORS.text, isTextBox: true, margin: 0 });
  const front = [
    "Um único código-base para Android e iOS — a equipe entrega mais rápido com menos manutenção duplicada.",
    "Expo elimina a etapa de configurar toolchains nativas (Android Studio/Xcode) para rodar no emulador/dispositivo.",
    "Ecossistema maduro (React Navigation, Auth Session) com grande base de documentação para times de estudo.",
    "JavaScript/React já é familiar à maioria da equipe — menor curva de aprendizado que Kotlin ou .NET MAUI.",
  ];
  let fy = 3.0;
  front.forEach((t) => {
    s.addShape("ellipse", { x: 0.95, y: fy + 0.06, w: 0.12, h: 0.12, fill: { color: COLORS.primary } });
    s.addText(t, { x: 1.25, y: fy - 0.12, w: 4.85, h: 0.75, fontFace: "Calibri", fontSize: 12.5, color: COLORS.muted, isTextBox: true, margin: 0, valign: "top" });
    fy += 0.82;
  });

  // right: backend/db
  s.addShape("roundRect", { x: 6.55, y: 1.7, w: 6.15, h: 4.9, rectRadius: 0.08, fill: { color: COLORS.surface }, line: { color: COLORS.border, width: 1 } });
  s.addText("BANCO DE DADOS & AUTENTICAÇÃO", { x: 6.9, y: 1.95, w: 5.5, h: 0.35, fontFace: "Calibri", fontSize: 12, bold: true, color: COLORS.primary, charSpacing: 1.2, isTextBox: true, margin: 0 });
  s.addText("Supabase (PostgreSQL)", { x: 6.9, y: 2.3, w: 5.5, h: 0.55, fontFace: "Cambria", fontSize: 24, bold: true, color: COLORS.text, isTextBox: true, margin: 0 });
  const back = [
    "Banco relacional (Postgres) — encaixa naturalmente no domínio: veículos, motoristas, viagens e financeiro têm relações claras entre si (ver DER).",
    "Auth pronta com provedor Google (OAuth2 nativo) já integrada ao banco — resolve o requisito de SSO sem servidor próprio.",
    "SDK oficial persiste a sessão automaticamente no dispositivo (AsyncStorage), atendendo ao item 5 da atividade.",
    "Plano gratuito suficiente para o ciclo do projeto acadêmico, com painel visual para a equipe inspecionar dados.",
  ];
  let by = 3.0;
  back.forEach((t) => {
    s.addShape("ellipse", { x: 6.9, y: by + 0.06, w: 0.12, h: 0.12, fill: { color: COLORS.primary } });
    s.addText(t, { x: 7.2, y: by - 0.12, w: 5.35, h: 0.8, fontFace: "Calibri", fontSize: 12.5, color: COLORS.muted, isTextBox: true, margin: 0, valign: "top" });
    by += 0.82;
  });
  pageNum(s, 4);
}

// ================= SLIDE 5 — PARTE 1.3 DIRETRIZES/PROTÓTIPO =================
{
  const s = bgSlide(pres);
  kicker(s, "Parte 1 · Item 3");
  title(s, "Diretrizes de Interface e Protótipo");

  // image left
  s.addImage({ path: PROTO_IMG, x: 0.6, y: 1.7, w: 7.9, h: 7.9 * (554 / 1084) });
  s.addText("Protótipo de baixa fidelidade — fluxo completo (24 telas)", {
    x: 0.6, y: 1.7 + 7.9 * (554 / 1084) + 0.1, w: 7.9, h: 0.3, fontFace: "Calibri", fontSize: 10.5, italic: true, color: COLORS.muted, isTextBox: true, margin: 0,
  });

  // right: guidelines
  const guias = [
    ["Tema escuro consistente", "Fundo #121212, cartões #1E1E1E — reduz fadiga visual em uso prolongado no veículo/escritório."],
    ["Um único acento de cor", "Amarelo (#FFC107) reservado a ações primárias e destaques — guia o olho sem poluir a tela."],
    ["Cartões com espaçamento generoso", "Conteúdo agrupado em cards com respiro interno (16-24px), evitando telas densas."],
    ["Navegação previsível", "Bottom bar fixa (Início, Financeiro, Frota, Mais) replica o padrão de apps mobile já conhecido pelo usuário."],
  ];
  let gy = 1.85;
  guias.forEach((g) => {
    s.addText(g[0], { x: 8.85, y: gy, w: 3.9, h: 0.35, fontFace: "Calibri", fontSize: 14, bold: true, color: COLORS.text, isTextBox: true, margin: 0 });
    s.addText(g[1], { x: 8.85, y: gy + 0.38, w: 3.9, h: 0.95, fontFace: "Calibri", fontSize: 11.5, color: COLORS.muted, isTextBox: true, margin: 0, valign: "top" });
    gy += 1.35;
  });
  pageNum(s, 5);
}

// ================= SLIDE 6 — PARTE 2.4 MER/DER =================
{
  const s = bgSlide(pres);
  kicker(s, "Parte 2 · Item 4");
  title(s, "Modelagem de Dados — Diagrama DER");
  s.addText("Schema completo em db/schema.sql — pronto para rodar no SQL Editor do Supabase.", {
    x: 0.6, y: 1.5, w: 11, h: 0.35, fontFace: "Calibri", fontSize: 12.5, italic: true, color: COLORS.muted, isTextBox: true, margin: 0,
  });
  const derW = 6.9, derH = derW * (1156 / 1584);
  s.addImage({ path: DER_IMG, x: (13.33 - derW) / 2, y: 2.05, w: derW, h: derH });
  pageNum(s, 6);
}

// ================= SLIDE 7 — PARTE 2.5 AUTENTICAÇÃO =================
{
  const s = bgSlide(pres);
  kicker(s, "Parte 2 · Item 5");
  title(s, "Autenticação — Login com Google (SSO)");

  const passos = [
    ["1", "Usuário toca em \"Entrar com Google\"", "expo-auth-session abre o fluxo OAuth2 nativo do Google — nenhum formulário manual pede a senha do Google."],
    ["2", "Google devolve o token à Supabase Auth", "supabase.auth.signInWithOAuth() troca o código por uma sessão válida (access + refresh token)."],
    ["3", "Sessão é salva no dispositivo", "O SDK do Supabase grava a sessão no AsyncStorage automaticamente — é o que garante login persistente."],
    ["4", "App restaura a sessão ao reabrir", "supabase.auth.getSession() é chamado no início do App.js; se houver sessão salva, o usuário cai direto no Dashboard."],
  ];
  let py = 1.85;
  passos.forEach((p) => {
    s.addShape("roundRect", { x: 0.6, y: py, w: 0.55, h: 0.55, rectRadius: 0.28, fill: { color: COLORS.primary } });
    s.addText(p[0], { x: 0.6, y: py, w: 0.55, h: 0.55, align: "center", valign: "middle", fontFace: "Cambria", fontSize: 18, bold: true, color: COLORS.darkText, isTextBox: true, margin: 0 });
    s.addText(p[1], { x: 1.35, y: py - 0.05, w: 5.5, h: 0.4, fontFace: "Calibri", fontSize: 13.5, bold: true, color: COLORS.text, isTextBox: true, margin: 0 });
    s.addText(p[2], { x: 1.35, y: py + 0.32, w: 5.5, h: 0.75, fontFace: "Calibri", fontSize: 11, color: COLORS.muted, isTextBox: true, margin: 0, valign: "top" });
    py += 1.18;
  });

  s.addShape("roundRect", { x: 7.5, y: 1.85, w: 5.2, h: 4.4, rectRadius: 0.08, fill: { color: COLORS.surface }, line: { color: COLORS.border, width: 1 } });
  s.addText("STATUS DA IMPLEMENTAÇÃO", { x: 7.85, y: 2.1, w: 4.6, h: 0.35, fontFace: "Calibri", fontSize: 11, bold: true, color: COLORS.primary, charSpacing: 1.2, isTextBox: true, margin: 0 });
  s.addText([
    { text: "✓ ", options: { color: COLORS.success, bold: true } },
    { text: "Código do fluxo OAuth2 + persistência implementado em ", options: { color: COLORS.text } },
    { text: "src/contexts/AuthContext.js", options: { color: COLORS.primary, fontFace: "Consolas" } },
    { text: "\n\n", options: {} },
    { text: "◻ ", options: { color: COLORS.muted, bold: true } },
    { text: "Pendente: criar projeto Supabase real e Client ID OAuth no Google Cloud Console (credenciais são específicas de cada equipe/conta)", options: { color: COLORS.muted } },
    { text: "\n\n", options: {} },
    { text: "◻ ", options: { color: COLORS.muted, bold: true } },
    { text: "Após configurar, capturar print da tela de login + reabertura do app já autenticado como evidência final", options: { color: COLORS.muted } },
  ], { x: 7.85, y: 2.55, w: 4.55, h: 3.5, fontFace: "Calibri", fontSize: 12, isTextBox: true, margin: 0, valign: "top", lineSpacingMultiple: 1.25 });
  pageNum(s, 7);
}

// ================= SLIDE 8 — PARTE 3.6 ORGANIZAÇÃO =================
{
  const s = bgSlide(pres);
  kicker(s, "Parte 3 · Item 6");
  title(s, "Ferramenta de Organização — Trello");

  const colunas = [
    ["Backlog", ["Preparar apresentação final"]],
    ["A Fazer", ["Modelar DER", "Configurar Auth Google"]],
    ["Em Andamento", ["Estrutura de telas", "Schema do banco"]],
    ["Em Revisão", ["PR: setup do projeto"]],
    ["Concluído", ["Stack definida", "Protótipo de telas"]],
  ];
  const colW = 2.35, gap = 0.18, startX = 0.6, y = 1.9;
  colunas.forEach((col, i) => {
    const x = startX + i * (colW + gap);
    s.addShape("roundRect", { x, y, w: colW, h: 4.6, rectRadius: 0.06, fill: { color: COLORS.surface }, line: { color: COLORS.border, width: 1 } });
    s.addText(col[0], { x: x + 0.15, y: y + 0.15, w: colW - 0.3, h: 0.35, fontFace: "Calibri", fontSize: 12.5, bold: true, color: COLORS.primary, isTextBox: true, margin: 0 });
    let cy = y + 0.65;
    col[1].forEach((card) => {
      s.addShape("roundRect", { x: x + 0.15, y: cy, w: colW - 0.3, h: 0.65, rectRadius: 0.05, fill: { color: COLORS.surfaceAlt }, line: { color: COLORS.border, width: 0.75 } });
      s.addText(card, { x: x + 0.28, y: cy, w: colW - 0.56, h: 0.65, align: "left", valign: "middle", fontFace: "Calibri", fontSize: 10.5, color: COLORS.text, isTextBox: true, margin: 0 });
      cy += 0.8;
    });
  });

  s.addText("Board completo com todos os cartões sugeridos: docs/board-trello.md — crie o board real em trello.com replicando esta estrutura.", {
    x: 0.6, y: 6.75, w: 11.5, h: 0.4, fontFace: "Calibri", fontSize: 11.5, italic: true, color: COLORS.muted, isTextBox: true, margin: 0,
  });
  pageNum(s, 8);
}

// ================= SLIDE 9 — PARTE 3.7 REPOSITÓRIO =================
{
  const s = bgSlide(pres);
  kicker(s, "Parte 3 · Item 7");
  title(s, "Repositório Git");

  s.addShape("roundRect", { x: 0.6, y: 1.8, w: 5.8, h: 4.7, rectRadius: 0.08, fill: { color: COLORS.surface }, line: { color: COLORS.border, width: 1 } });
  s.addText("JÁ CONFIGURADO", { x: 0.95, y: 2.05, w: 5, h: 0.35, fontFace: "Calibri", fontSize: 11, bold: true, color: COLORS.success, charSpacing: 1.2, isTextBox: true, margin: 0 });
  const feito = [
    "Repositório Git inicializado localmente, branch principal main",
    ".gitignore cobrindo node_modules, .env e arquivos de build",
    "Commit inicial com a base do app, schema do banco e docs",
    "Credenciais isoladas em .env (nunca versionadas — só .env.example)",
  ];
  let dy = 2.55;
  feito.forEach((t) => {
    s.addShape("ellipse", { x: 0.95, y: dy + 0.06, w: 0.12, h: 0.12, fill: { color: COLORS.success } });
    s.addText(t, { x: 1.25, y: dy - 0.12, w: 4.9, h: 0.75, fontFace: "Calibri", fontSize: 12.5, color: COLORS.muted, isTextBox: true, margin: 0, valign: "top" });
    dy += 0.88;
  });

  s.addShape("roundRect", { x: 6.7, y: 1.8, w: 6.0, h: 4.7, rectRadius: 0.08, fill: { color: COLORS.surface }, line: { color: COLORS.border, width: 1 } });
  s.addText("PRÓXIMO PASSO DA EQUIPE", { x: 7.05, y: 2.05, w: 5.3, h: 0.35, fontFace: "Calibri", fontSize: 11, bold: true, color: COLORS.primary, charSpacing: 1.2, isTextBox: true, margin: 0 });
  const fazer = [
    "Criar o repositório remoto no GitHub e dar git push",
    "Em Settings > Branches, criar regra de proteção para main",
    "Exigir Pull Request + 1 aprovação antes de merge",
    "Bloquear bypass da regra — nenhum push direto na main",
  ];
  let fy2 = 2.55;
  fazer.forEach((t, i) => {
    s.addShape("roundRect", { x: 7.05, y: fy2, w: 0.32, h: 0.32, rectRadius: 0.06, fill: { color: COLORS.surfaceAlt }, line: { color: COLORS.primary, width: 1 } });
    s.addText(String(i + 1), { x: 7.05, y: fy2, w: 0.32, h: 0.32, align: "center", valign: "middle", fontFace: "Calibri", fontSize: 12, bold: true, color: COLORS.primary, isTextBox: true, margin: 0 });
    s.addText(t, { x: 7.5, y: fy2 - 0.12, w: 5.05, h: 0.75, fontFace: "Calibri", fontSize: 12.5, color: COLORS.text, isTextBox: true, margin: 0, valign: "top" });
    fy2 += 0.88;
  });
  pageNum(s, 9);
}

// ================= SLIDE 10 — ENTREGA/LINKS =================
{
  const s = bgSlide(pres);
  kicker(s, "Entrega");
  title(s, "Resultado Esperado e Link do Repositório");

  const resultados = [
    ["Base do app rodando", "Projeto Expo completo, navegação entre as 24 telas do protótipo"],
    ["Autenticação funcional", "Fluxo Google SSO + persistência de sessão implementados"],
    ["Banco de dados configurado", "Schema relacional pronto (db/schema.sql) para rodar no Supabase"],
    ["Board de tarefas", "Estrutura de colunas e cartões definida (docs/board-trello.md)"],
  ];
  const cardW = 5.6, gap = 0.35;
  resultados.forEach((r, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.6 + col * (cardW + gap);
    const y = 1.85 + row * 1.9;
    s.addShape("roundRect", { x, y, w: cardW, h: 1.65, rectRadius: 0.08, fill: { color: COLORS.surface }, line: { color: COLORS.border, width: 1 } });
    s.addShape("ellipse", { x: x + 0.25, y: y + 0.25, w: 0.4, h: 0.4, fill: { color: COLORS.primary } });
    s.addText("✓", { x: x + 0.25, y: y + 0.25, w: 0.4, h: 0.4, align: "center", valign: "middle", fontFace: "Calibri", fontSize: 16, bold: true, color: COLORS.darkText, isTextBox: true, margin: 0 });
    s.addText(r[0], { x: x + 0.85, y: y + 0.2, w: cardW - 1.05, h: 0.4, fontFace: "Calibri", fontSize: 14.5, bold: true, color: COLORS.text, isTextBox: true, margin: 0 });
    s.addText(r[1], { x: x + 0.85, y: y + 0.62, w: cardW - 1.05, h: 0.9, fontFace: "Calibri", fontSize: 11.5, color: COLORS.muted, isTextBox: true, margin: 0, valign: "top" });
  });

  s.addShape("roundRect", { x: 0.6, y: 5.75, w: 11.7, h: 0.9, rectRadius: 0.08, fill: { color: COLORS.surfaceAlt }, line: { color: COLORS.primary, width: 1 } });
  s.addText([
    { text: "Link do repositório:  ", options: { bold: true, color: COLORS.text } },
    { text: "[cole aqui a URL do repositório no GitHub após o push]", options: { italic: true, color: COLORS.primary } },
  ], { x: 0.9, y: 5.75, w: 11.1, h: 0.9, valign: "middle", fontFace: "Calibri", fontSize: 14, isTextBox: true, margin: 0 });
  pageNum(s, 10);
}

pres.writeFile({ fileName: "/home/claude/frota-financeiro/pptx_build/output.pptx" }).then(() => {
  console.log("done");
});

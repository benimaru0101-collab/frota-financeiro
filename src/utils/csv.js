import { parseValorBR } from './money.js';

// Exportação em CSV (portado do SaaS TempesT, lib/export/csv.ts) — sem
// dependência nova, só montagem de texto. Usa ";" como separador e BOM
// UTF-8 porque é o que o Excel em português (BR) espera para abrir o
// arquivo direto, com acentuação correta.

// Proteção contra "CSV/Formula Injection" (OWASP): campo de texto livre
// que começa com =, +, -, @, tab ou CR vira fórmula ao abrir no Excel.
// O apóstrofo na frente faz o programa tratar a célula como texto.
const PRIMEIRO_CARACTERE_PERIGOSO = /^[=+\-@\t\r]/;

function neutralizarFormula(valor) {
  return PRIMEIRO_CARACTERE_PERIGOSO.test(valor) ? `'${valor}` : valor;
}

function escaparCampo(valor) {
  const seguro = neutralizarFormula(String(valor ?? ''));
  if (/[";\r\n]/.test(seguro)) return `"${seguro.replace(/"/g, '""')}"`;
  return seguro;
}

function formatarCelula(valor) {
  // Números saem com vírgula decimal (o Excel BR soma como número).
  if (typeof valor === 'number') return valor.toFixed(2).replace('.', ',');
  return escaparCampo(valor);
}

export function paraCsv(cabecalho, linhas) {
  const todas = [cabecalho, ...linhas].map((linha) => linha.map(formatarCelula).join(';'));
  return '﻿' + todas.join('\r\n') + '\r\n';
}

// CSV do relatório: uma linha por lançamento (receitas e despesas já
// filtradas), na ordem em que aparecem na tela. Valor entra como número
// (receita positiva, despesa negativa) para o Excel conseguir somar.
export function lancamentosParaCsv({ receitasFiltradas = [], despesasFiltradas = [] }) {
  const cabecalho = ['Data', 'Tipo', 'Descrição', 'Categoria', 'Situação', 'Valor (R$)'];
  const situacao = (i) => (i.status === 'pendente' ? 'Pendente' : 'Concluído');
  const linhas = [
    ...receitasFiltradas.map((r) => [r.data ?? '', 'Receita', r.descricao ?? '', r.categoria ?? '', situacao(r), parseValorBR(r.valor)]),
    ...despesasFiltradas.map((d) => [d.data ?? '', 'Despesa', d.descricao ?? '', d.categoria ?? '', situacao(d), -parseValorBR(d.valor)]),
  ];
  return paraCsv(cabecalho, linhas);
}

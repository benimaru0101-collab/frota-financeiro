// Testes das funções puras da central de alertas e do CSV.
// Rodar: npm test   (usa o test runner nativo do Node, sem dependências)
import test from 'node:test';
import assert from 'node:assert/strict';
import { montarAlertas, contarPorSeveridade } from '../src/utils/alertas.js';
import { diasAteVencimento, documentosVencendo } from '../src/utils/vencimentos.js';
import { paraCsv, lancamentosParaCsv } from '../src/utils/csv.js';

const HOJE = new Date(2026, 9, 6, 15, 30); // 06/10/2026, com hora no meio do dia

test('diasAteVencimento ignora a hora e conta dias corridos', () => {
  assert.equal(diasAteVencimento('06/10/2026', HOJE), 0);
  assert.equal(diasAteVencimento('07/10/2026', HOJE), 1);
  assert.equal(diasAteVencimento('05/10/2026', HOJE), -1);
  assert.equal(diasAteVencimento('', HOJE), null);
  assert.equal(diasAteVencimento('lixo', HOJE), null);
});

test('documentosVencendo mantém o comportamento e aceita "agora"', () => {
  const docs = [
    { id: 1, tipo: 'CRLV', placa: 'AAA', vencimento: '10/10/2026' },
    { id: 2, tipo: 'Seguro', placa: 'BBB', vencimento: '01/10/2026' },
    { id: 3, tipo: 'ANTT', placa: 'CCC', vencimento: '01/01/2027' },
  ];
  const r = documentosVencendo(docs, 30, HOJE);
  assert.deepEqual(r.map((d) => d.id), [2, 1]);
});

const documentos = [
  { id: 'd1', tipo: 'CRLV', placa: 'AAA-1111', vencimento: '01/10/2026' }, // 5 dias em atraso
  { id: 'd2', tipo: 'Seguro', placa: 'BBB-2222', vencimento: '20/10/2026' }, // 14 dias
  { id: 'd3', tipo: 'ANTT', placa: 'CCC-3333', vencimento: '10/10/2026' }, // 4 dias (urgente)
  { id: 'd4', tipo: 'IPVA', placa: 'DDD-4444', vencimento: '31/12/2026' }, // longe
];
const despesas = [
  { id: 'x1', descricao: 'Pedágio', valor: 'R$ 100,00', data: '02/10/2026', status: 'pendente' },
  { id: 'x2', descricao: 'Diesel', valor: 'R$ 2.500,00', data: '08/10/2026', status: 'pendente' },
  { id: 'x3', descricao: 'Já paga', valor: 'R$ 50,00', data: '01/10/2026', status: 'concluido' },
  { id: 'x4', descricao: 'Longe', valor: 'R$ 50,00', data: '30/11/2026', status: 'pendente' },
];
const receitas = [
  { id: 'r1', descricao: 'Frete atrasado', valor: 'R$ 1.000,00', data: '03/10/2026', status: 'pendente' },
];

test('motorista só vê alertas de documentos', () => {
  const a = montarAlertas({ documentos, receitas, despesas }, { podeVerFinanceiro: false, agora: HOJE });
  assert.ok(a.every((x) => x.tipo === 'documento'));
  assert.deepEqual(a.map((x) => x.id), ['doc-d1', 'doc-d3', 'doc-d2']);
});

test('admin vê documentos e financeiro, do mais crítico ao menos', () => {
  const a = montarAlertas({ documentos, receitas, despesas }, { podeVerFinanceiro: true, agora: HOJE });
  assert.deepEqual(a.map((x) => x.id), [
    'doc-d1', // crítico, 5 dias atrasado
    'despesa-x1', // crítico, 4 dias atrasado
    'doc-d3', // crítico, vence em 4 dias
    'receita-r1', // atenção (receita 3 dias atrasada)
    'doc-d2', // atenção (14 dias)
    'despesa-x2', // info (vence em 2 dias)
  ]);
  assert.deepEqual(contarPorSeveridade(a), { critico: 3, atencao: 2, info: 1 });
});

test('ignora lançamentos concluídos, distantes e datas inválidas', () => {
  const a = montarAlertas(
    { documentos: [{ id: 'z', tipo: 'X', placa: 'Y', vencimento: '' }], despesas: [{ id: 'q', descricao: 'a', valor: 'R$ 1', data: 'ruim', status: 'pendente' }] },
    { podeVerFinanceiro: true, agora: HOJE }
  );
  assert.deepEqual(a, []);
});

test('texto do prazo', () => {
  const a = montarAlertas({ documentos: [
    { id: 'h', tipo: 'A', placa: 'P', vencimento: '06/10/2026' },
    { id: 'm', tipo: 'A', placa: 'P', vencimento: '07/10/2026' },
    { id: 'u', tipo: 'A', placa: 'P', vencimento: '05/10/2026' },
  ] }, { agora: HOJE });
  const por = Object.fromEntries(a.map((x) => [x.id, x.detalhe]));
  assert.match(por['doc-h'], /vence hoje/);
  assert.match(por['doc-m'], /vence amanhã/);
  assert.match(por['doc-u'], /1 dia em atraso/);
});

test('paraCsv usa ; BOM, CRLF, vírgula decimal e escapa aspas', () => {
  const csv = paraCsv(['A', 'B'], [['x;y', 1234.5], ['diz "oi"', -2]]);
  assert.equal(csv.charCodeAt(0), 0xfeff);
  assert.equal(csv.slice(1), 'A;B\r\n"x;y";1234,50\r\n"diz ""oi""";-2,00\r\n');
});

test('paraCsv neutraliza fórmulas (CSV injection)', () => {
  const csv = paraCsv(['D'], [['=HYPERLINK("http://x")'], ['+1'], ['-1'], ['@soma'], ['normal']]);
  const linhas = csv.slice(1).trim().split('\r\n');
  assert.ok(linhas[1].startsWith('"\'=HYPERLINK'));
  assert.equal(linhas[2], "'+1");
  assert.equal(linhas[3], "'-1");
  assert.equal(linhas[4], "'@soma");
  assert.equal(linhas[5], 'normal');
});

test('lancamentosParaCsv: receita positiva, despesa negativa, situação', () => {
  const csv = lancamentosParaCsv({
    receitasFiltradas: [{ data: '03/10/2026', descricao: 'Frete', valor: 'R$ 1.000,00', status: 'concluido' }],
    despesasFiltradas: [{ data: '04/10/2026', descricao: 'Diesel', categoria: 'Combustível', valor: 'R$ 2.500,50', status: 'pendente' }],
  });
  const linhas = csv.slice(1).trim().split('\r\n');
  assert.equal(linhas[0], 'Data;Tipo;Descrição;Categoria;Situação;Valor (R$)');
  assert.equal(linhas[1], '03/10/2026;Receita;Frete;;Concluído;1000,00');
  assert.equal(linhas[2], '04/10/2026;Despesa;Diesel;Combustível;Pendente;-2500,50');
});

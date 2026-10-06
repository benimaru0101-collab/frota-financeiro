// Central de alertas (inspirada na central de alertas do SaaS TempesT):
// junta num lugar só tudo o que precisa de atenção — documentos da
// frota vencidos ou perto de vencer e lançamentos financeiros pendentes
// atrasados ou vencendo. É uma função pura (sem React, sem banco): recebe
// os dados que o DataContext já tem e devolve a lista pronta para a tela.
//
// Datas no formato "DD/MM/AAAA", como o resto do app. `agora` é injetável
// para os testes não dependerem do dia em que rodam.
import { diasAteVencimento } from './vencimentos.js';
import { parseValorBR } from './money.js';

// Ordem de importância: crítico aparece primeiro.
export const SEVERIDADES = { critico: 0, atencao: 1, info: 2 };

export const JANELA_DOCUMENTO_DIAS = 30; // documentos: avisa com 30 dias
export const JANELA_URGENTE_DIAS = 7; // até 7 dias vira crítico
export const JANELA_FINANCEIRO_DIAS = 7; // contas a pagar/receber: avisa com 7 dias

function textoPrazo(dias) {
  if (dias < 0) return `${Math.abs(dias)} dia${Math.abs(dias) === 1 ? '' : 's'} em atraso`;
  if (dias === 0) return 'vence hoje';
  if (dias === 1) return 'vence amanhã';
  return `vence em ${dias} dias`;
}

function alertaDeDocumento(doc, agora) {
  const dias = diasAteVencimento(doc.vencimento, agora);
  if (dias === null || dias > JANELA_DOCUMENTO_DIAS) return null;
  return {
    id: `doc-${doc.id}`,
    tipo: 'documento',
    severidade: dias <= JANELA_URGENTE_DIAS ? 'critico' : 'atencao',
    titulo: `${doc.tipo ?? 'Documento'} — ${doc.placa ?? 'sem placa'}`,
    detalhe: `Vencimento ${doc.vencimento} · ${textoPrazo(dias)}`,
    dias,
    destino: { aba: 'Frota', tela: 'Documentos' },
  };
}

function alertaFinanceiro(item, tipo, agora) {
  if (item.status !== 'pendente') return null;
  const dias = diasAteVencimento(item.data, agora);
  if (dias === null || dias > JANELA_FINANCEIRO_DIAS) return null;
  const ehDespesa = tipo === 'despesa';
  const atrasado = dias < 0;
  return {
    id: `${tipo}-${item.id}`,
    tipo,
    // Despesa atrasada é o pior caso (multa/juros); receita atrasada
    // pede cobrança, mas não é crítica.
    severidade: atrasado ? (ehDespesa ? 'critico' : 'atencao') : 'info',
    titulo: `${ehDespesa ? 'Pagar' : 'Receber'}: ${item.descricao ?? 'sem descrição'}`,
    detalhe: `${item.valor ?? ''} · ${item.data} · ${textoPrazo(dias)}`.replace(/^ · /, ''),
    dias,
    valor: parseValorBR(item.valor),
    destino: { aba: 'Financeiro', tela: ehDespesa ? 'Despesas' : 'Receitas' },
  };
}

// `podeVerFinanceiro` = isAdmin: o motorista só enxerga alertas da frota,
// igual às abas que ele pode abrir (RBAC).
export function montarAlertas({ documentos = [], receitas = [], despesas = [] }, { podeVerFinanceiro = false, agora = new Date() } = {}) {
  const lista = [];
  documentos.forEach((d) => lista.push(alertaDeDocumento(d, agora)));
  if (podeVerFinanceiro) {
    despesas.forEach((d) => lista.push(alertaFinanceiro(d, 'despesa', agora)));
    receitas.forEach((r) => lista.push(alertaFinanceiro(r, 'receita', agora)));
  }
  return lista
    .filter(Boolean)
    .sort((a, b) => SEVERIDADES[a.severidade] - SEVERIDADES[b.severidade] || a.dias - b.dias || a.id.localeCompare(b.id));
}

export function contarPorSeveridade(alertas) {
  const contagem = { critico: 0, atencao: 0, info: 0 };
  alertas.forEach((a) => { contagem[a.severidade] += 1; });
  return contagem;
}

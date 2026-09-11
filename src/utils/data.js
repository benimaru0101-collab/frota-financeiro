// Utilitários para lidar com datas no formato brasileiro ("DD/MM/AAAA")
// vindas dos formulários e dos dados mock, e para agrupar receitas e
// despesas por mês (usado no gráfico de Fluxo de Caixa).
import { parseValorBR } from './money';

const MESES_ABREV = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

// "10/04/2024" -> "2024-04" (chave ordenável). Retorna null se o texto
// não estiver no formato esperado, para não quebrar com dados incompletos.
export function chaveDoMes(dataBR) {
  if (!dataBR) return null;
  const partes = dataBR.split('/');
  if (partes.length !== 3) return null;
  const [, mes, ano] = partes;
  if (!mes || !ano) return null;
  return `${ano}-${mes.padStart(2, '0')}`;
}

// "2024-04" -> "Abr/24"
export function rotuloDoMes(chave) {
  const [ano, mes] = chave.split('-');
  const indice = parseInt(mes, 10) - 1;
  const nomeMes = MESES_ABREV[indice] ?? mes;
  return `${nomeMes}/${ano.slice(2)}`;
}

// Agrupa receitas e despesas por mês (a partir do campo `data` de cada
// item, no formato DD/MM/AAAA) e soma os valores de cada grupo.
// Retorna os meses em ordem cronológica, prontos para virar barras do
// gráfico de Fluxo de Caixa.
export function agruparPorMes(receitas, despesas) {
  const mapa = new Map();

  function registrar(lista, campo) {
    lista.forEach((item) => {
      const chave = chaveDoMes(item.data);
      if (!chave) return;
      if (!mapa.has(chave)) mapa.set(chave, { chave, receitas: 0, despesas: 0 });
      mapa.get(chave)[campo] += parseValorBR(item.valor);
    });
  }

  registrar(receitas, 'receitas');
  registrar(despesas, 'despesas');

  return Array.from(mapa.values())
    .sort((a, b) => a.chave.localeCompare(b.chave))
    .map((mes) => ({ ...mes, label: rotuloDoMes(mes.chave) }));
}

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
// "10/06/2024" -> "2024-06-10", formato que o Postgres/Supabase espera
// para colunas do tipo `date`. Se o texto vier vazio ou inválido, usa a
// data de hoje (as colunas de data no schema são `not null`).
export function dataBRParaISO(dataBR) {
  const partes = (dataBR ?? '').split('/');
  if (partes.length === 3) {
    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10);
    const ano = parseInt(partes[2], 10);
    if (dia >= 1 && dia <= 31 && mes >= 1 && mes <= 12 && ano > 1900) {
      return `${String(ano).padStart(4, '0')}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    }
  }
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
}

// "2024-06-10" (como vem do Supabase) -> "10/06/2024" (como as telas exibem).
export function dataISOParaBR(dataISO) {
  if (!dataISO) return '';
  const [ano, mes, dia] = dataISO.split('-');
  if (!ano || !mes || !dia) return dataISO;
  return `${dia}/${mes}/${ano}`;
}

// origemDestino é salvo/exibido como "Origem - Destino" numa única
// string (ver NovaViagemScreen), mas o banco guarda origem e destino em
// colunas separadas — esta função desfaz a junção.
export function separarOrigemDestino(texto) {
  const partes = (texto ?? '').split(' - ');
  if (partes.length >= 2) {
    return { origem: partes[0], destino: partes.slice(1).join(' - ') };
  }
  return { origem: texto ?? '', destino: '' };
}

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

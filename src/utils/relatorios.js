// Utilitários para a tela de Relatórios: opções de período/tipo,
// filtro de lançamentos e agrupamento de despesas por categoria
// (usado na "pizza"/lista de "Despesas por categoria").
import { parseValorBR } from './money';

export const PERIODOS = [
  { label: 'Este mês', valor: 'mes' },
  { label: 'Últimos 3 meses', valor: '3meses' },
  { label: 'Este ano', valor: 'ano' },
  { label: 'Tudo', valor: 'tudo' },
];

export const TIPOS_RELATORIO = [
  { label: 'Todos', valor: 'todos' },
  { label: 'Receitas', valor: 'receitas' },
  { label: 'Despesas', valor: 'despesas' },
];

export const FILTROS_PADRAO = {
  periodo: 'mes',
  tipo: 'todos',
  categoria: 'Todas',
  conta: 'Todas as contas',
};

const PALETA_PADRAO = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#E91E63', '#F44336'];

export function rotuloPeriodo(periodo) {
  return PERIODOS.find((p) => p.valor === periodo)?.label ?? 'Este mês';
}

// "10/06/2024" está dentro do período selecionado (relativo a hoje)?
export function estaNoPeriodo(dataBR, periodo) {
  if (periodo === 'tudo') return true;
  const partes = (dataBR ?? '').split('/');
  if (partes.length !== 3) return false;
  const dia = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10);
  const ano = parseInt(partes[2], 10);
  if (!dia || !mes || !ano) return false;
  const data = new Date(ano, mes - 1, dia);
  const hoje = new Date();

  if (periodo === 'mes') {
    return data.getFullYear() === hoje.getFullYear() && data.getMonth() === hoje.getMonth();
  }
  if (periodo === '3meses') {
    const limite = new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1);
    const fim = new Date(hoje.getFullYear(), hoje.getMonth(), 31);
    return data >= limite && data <= fim;
  }
  if (periodo === 'ano') {
    return data.getFullYear() === hoje.getFullYear();
  }
  return true;
}

// Aplica período + tipo + categoria aos lançamentos. O filtro de
// "Conta" ainda não tem efeito aqui: receitas e despesas ainda não
// são vinculadas a uma conta específica no banco (só as próprias
// Contas têm saldo inicial próprio), então por enquanto ele só existe
// na tela de Filtros para já deixar a interface pronta pro protótipo.
export function filtrarLancamentos({ receitas, despesas }, filtros) {
  const f = { ...FILTROS_PADRAO, ...filtros };

  const receitasFiltradas =
    f.tipo === 'despesas'
      ? []
      : receitas.filter((r) => estaNoPeriodo(r.data, f.periodo) && f.categoria === 'Todas');

  const despesasFiltradas =
    f.tipo === 'receitas'
      ? []
      : despesas.filter(
          (d) => estaNoPeriodo(d.data, f.periodo) && (f.categoria === 'Todas' || d.categoria === f.categoria)
        );

  return { receitasFiltradas, despesasFiltradas };
}

// Agrupa despesas por nome de categoria, somando os valores e
// calculando o percentual do total — usado no gráfico de rosca
// "Despesas por categoria" (SVG puro via react-native-svg, sem
// biblioteca de charts). A cor vem da categoria cadastrada (campo
// `cor`), com uma paleta padrão de reserva para categorias antigas
// sem cor definida.
export function agruparDespesasPorCategoria(despesas, categorias) {
  const mapa = new Map();
  despesas.forEach((d) => {
    const nome = d.categoria || 'Sem categoria';
    mapa.set(nome, (mapa.get(nome) ?? 0) + parseValorBR(d.valor));
  });

  const total = Array.from(mapa.values()).reduce((soma, v) => soma + v, 0);
  let indiceCor = 0;

  return Array.from(mapa.entries())
    .map(([nome, valor]) => {
      const categoriaInfo = categorias.find((c) => c.nome === nome && c.tipo === 'despesa');
      const cor = categoriaInfo?.cor || PALETA_PADRAO[indiceCor++ % PALETA_PADRAO.length];
      return {
        nome,
        valor,
        cor,
        percentual: total > 0 ? (valor / total) * 100 : 0,
      };
    })
    .sort((a, b) => b.valor - a.valor);
}

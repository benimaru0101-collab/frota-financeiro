// Utilitários simples para lidar com valores no formato brasileiro
// ("R$ 12.500,00") vindos dos formulários e dos dados mock.

export function parseValorBR(texto) {
  if (typeof texto === 'number') return texto;
  if (!texto) return 0;
  const limpo = texto
    .replace(/[^\d,.-]/g, '') // remove "R$", espaços etc.
    .replace(/\.(?=\d{3}(?:\D|$))/g, '') // remove separador de milhar
    .replace(',', '.'); // vírgula decimal -> ponto
  const numero = parseFloat(limpo);
  return Number.isNaN(numero) ? 0 : numero;
}

export function formatValorBR(numero) {
  return numero.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });
}

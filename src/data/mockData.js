// Dados fictícios usados apenas para popular a UI durante o
// desenvolvimento do protótipo funcional. Em produção, tudo isto
// vem do Supabase (ver db/schema.sql).

export const veiculos = [
  { id: '1', placa: 'ABC-1234', modelo: 'Mercedes FH 460', tipo: 'Cavalo Mecânico', status: 'Ativo', km: '175.000 km' },
  { id: '2', placa: 'DEF-5678', modelo: 'Volvo FH 540', tipo: 'Carreta', status: 'Ativo', km: '98.200 km' },
  { id: '3', placa: 'GHI-9101', modelo: 'Scania R450', tipo: 'Carreta', status: 'Manutenção', km: '212.400 km' },
  { id: '4', placa: 'JKL-1122', modelo: 'Volvo VM 270', tipo: 'Truck', status: 'Ativo', km: '64.900 km' },
];

export const motoristas = [
  { id: '1', nome: 'Carlos Silva', cnh: 'CNH: E 22/09/1', status: 'Ativo' },
  { id: '2', nome: 'João Santos', cnh: 'CNH: E 14/03/1', status: 'Ativo' },
  { id: '3', nome: 'Marcos Lima', cnh: 'CNH: E 30/11/1', status: 'Inativo' },
];

export const viagens = [
  { id: '1', origemDestino: 'São Paulo - Curitiba', placa: 'ABC-1234', data: '10/06/2024', valor: 'R$ 3.200,00' },
  { id: '2', origemDestino: 'Curitiba - Porto Alegre', placa: 'DEF-5678', data: '12/06/2024', valor: 'R$ 2.850,00' },
  { id: '3', origemDestino: 'Belo Horizonte - Vitória', placa: 'GHI-9101', data: '15/06/2024', valor: 'R$ 1.980,00' },
];

export const abastecimentos = [
  { id: '1', placa: 'ABC-1234', litros: '320 L', valor: 'R$ 2.150,00', data: '09/06/2024' },
  { id: '2', placa: 'DEF-5678', litros: '280 L', valor: 'R$ 1.890,00', data: '11/06/2024' },
];

export const manutencoes = [
  { id: '1', placa: 'GHI-9101', tipo: 'Preventiva - Freios', valor: 'R$ 1.200,00', data: '05/06/2024' },
  { id: '2', placa: 'ABC-1234', tipo: 'Troca de óleo', valor: 'R$ 450,00', data: '01/06/2024' },
];

export const documentos = [
  { id: '1', placa: 'ABC-1234', tipo: 'Seguro', vencimento: '16/09/2024' },
  { id: '2', placa: 'DEF-5678', tipo: 'IPVA', vencimento: '20/01/2025' },
];

export const receitas = [
  { id: '1', descricao: 'Frota - Transporte X', valor: 'R$ 12.500,00' },
  { id: '2', descricao: 'Frota - Empresa Y', valor: 'R$ 8.900,00' },
  { id: '3', descricao: 'Frota - Cliente Z', valor: 'R$ 6.400,00' },
];

export const despesas = [
  { id: '1', descricao: 'Combustível', valor: 'R$ 15.200,00', categoria: 'Frota' },
  { id: '2', descricao: 'Manutenção', valor: 'R$ 8.750,00', categoria: 'Frota' },
  { id: '3', descricao: 'Serviço Extra', valor: 'R$ 1.300,00', categoria: 'Operacional' },
  { id: '4', descricao: 'Pedágio', valor: 'R$ 1.500,00', categoria: 'Frota' },
];

// Observação: o resumo do dashboard (saldo, receitas/despesas do mês,
// veículos ativos) deixou de ser um valor fixo — agora é calculado a
// partir destes arrays em tempo real pelo DataContext (`resumo`).

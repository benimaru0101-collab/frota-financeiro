// Modo demonstração do App do Motorista: funciona sem internet e sem
// banco (dados em memória). Usado para apresentar o app quando o
// Supabase não está disponível. Nada daqui é gravado em lugar algum.

let ativo = false;
let seq = 100;

const VEICULOS = [
  { id: 'v1', placa: 'ABC-1D23', modelo: 'Volvo FH 540', status: 'Ativo', km_atual: 182450 },
  { id: 'v2', placa: 'QWE-4R56', modelo: 'Scania R450', status: 'Ativo', km_atual: 96310 },
  { id: 'v3', placa: 'JKL-7M89', modelo: 'Mercedes Actros', status: 'Ativo', km_atual: 241870 },
];

function dia(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

const CADASTRO = { id: 'm1', nome: 'Carlos Motorista (demo)', cnh: 'CNH 04512398760 · E', status: 'Ativo' };

let viagens = [
  { id: 't1', motorista_id: 'm1', origem: 'São Paulo - SP', destino: 'Curitiba - PR', data_viagem: dia(0), status: 'Agendada', veiculos: VEICULOS[0] },
  { id: 't2', motorista_id: 'm1', origem: 'Campinas - SP', destino: 'Belo Horizonte - MG', data_viagem: dia(1), status: 'Agendada', veiculos: VEICULOS[1] },
  { id: 't3', motorista_id: 'm1', origem: 'Santos - SP', destino: 'Rio de Janeiro - RJ', data_viagem: dia(2), status: 'Agendada', veiculos: VEICULOS[2] },
  { id: 't0', motorista_id: 'm1', origem: 'Sorocaba - SP', destino: 'São Paulo - SP', data_viagem: dia(-1), status: 'Concluída', veiculos: VEICULOS[0],
    iniciada_em: new Date(Date.now() - 30 * 3600e3).toISOString(), finalizada_em: new Date(Date.now() - 26 * 3600e3).toISOString(), observacao_motorista: 'Entrega sem ocorrências.', km_inicial: 182345, km_final: 182450 },
];

export const demo = {
  ativo: () => ativo,
  ligar: () => { ativo = true; },
  desligar: () => { ativo = false; },
  usuario: () => ({ id: 'demo-motorista', email: 'motorista.demo@frota.app', user_metadata: { full_name: CADASTRO.nome } }),
  cadastro: () => ({ ...CADASTRO }),
  viagens: () => viagens.map((v) => ({ ...v })),
  veiculos: () => VEICULOS.map((v) => ({ ...v })),
  atualizar(id, campos) {
    viagens = viagens.map((v) => (v.id === id ? { ...v, ...campos } : v));
    // Igual ao trigger da migration-13: km_final atualiza o hodômetro.
    const atual = viagens.find((v) => v.id === id);
    if (campos.km_final != null && atual?.veiculos) {
      const veic = VEICULOS.find((x) => x.id === atual.veiculos.id);
      if (veic) veic.km_atual = Math.max(veic.km_atual ?? 0, campos.km_final);
      viagens = viagens.map((v) => (v.veiculos?.id === veic?.id ? { ...v, veiculos: { ...veic } } : v));
    }
    return { ...viagens.find((v) => v.id === id) };
  },
  novoId: () => `d${seq++}`,
};

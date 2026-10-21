import { supabase } from './supabase';

// Acesso a dados do App do Motorista. As consultas não filtram por
// motorista no app: quem garante que o motorista só enxerga e só altera
// as próprias viagens é o banco (RLS + trigger da migration-11).

export const STATUS = {
  AGENDADA: 'Agendada',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDA: 'Concluída',
};

// Cadastro de motorista ligado à conta logada (null se ainda não foi
// vinculado pelo administrador).
export async function buscarMeuCadastro(userId) {
  const { data, error } = await supabase
    .from('motoristas')
    .select('id, nome, cnh, status')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function buscarMinhasViagens(motoristaId) {
  const { data, error } = await supabase
    .from('viagens')
    .select('*, veiculos(id, placa, modelo)')
    .eq('motorista_id', motoristaId)
    .order('data_viagem', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function iniciarViagem(id) {
  const { data, error } = await supabase
    .from('viagens')
    .update({ status: STATUS.EM_ANDAMENTO, iniciada_em: new Date().toISOString() })
    .eq('id', id)
    .select('*, veiculos(id, placa, modelo)')
    .single();
  if (error) throw error;
  return data;
}

export async function finalizarViagem(id, { comprovanteUrl, observacao }) {
  const { data, error } = await supabase
    .from('viagens')
    .update({
      status: STATUS.CONCLUIDA,
      finalizada_em: new Date().toISOString(),
      comprovante_url: comprovanteUrl ?? null,
      observacao_motorista: observacao?.trim() || null,
    })
    .eq('id', id)
    .select('*, veiculos(id, placa, modelo)')
    .single();
  if (error) throw error;
  return data;
}

export async function listarVeiculosAtivos() {
  const { data, error } = await supabase
    .from('veiculos')
    .select('id, placa, modelo, status')
    .order('placa', { ascending: true });
  if (error) throw error;
  return (data ?? []).filter((v) => v.status !== 'Inativo');
}

export async function registrarAbastecimento({ veiculoId, litros, valor, posto, dataISO }) {
  const { error } = await supabase.from('abastecimentos').insert({
    veiculo_id: veiculoId,
    litros,
    valor,
    posto: posto?.trim() || null,
    data_abastecimento: dataISO,
  });
  if (error) throw error;
}

// "2026-10-21" -> "21/10/2026"
export function dataBR(iso) {
  if (!iso) return '';
  const [a, m, d] = String(iso).slice(0, 10).split('-');
  return `${d}/${m}/${a}`;
}

// ISO com hora -> "21/10 14:35"
export function horaBR(iso) {
  if (!iso) return '';
  const dt = new Date(iso);
  const p = (n) => String(n).padStart(2, '0');
  return `${p(dt.getDate())}/${p(dt.getMonth() + 1)} ${p(dt.getHours())}:${p(dt.getMinutes())}`;
}

export function hojeISO() {
  const dt = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}`;
}

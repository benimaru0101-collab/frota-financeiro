import * as FileSystem from 'expo-file-system';
import { supabase } from './supabase';
import { demo } from './demo';
import { enviarArquivoDocumento } from './upload';
import { ehErroDeRede, enfileirar, marcarOnline, novoId, registrarExecutor, salvarCache, lerCache } from './offline';

// Finalizar viagem sem internet: a foto do comprovante fica no aparelho
// e só é enviada ao Storage quando a conexão voltar.
registrarExecutor('finalizarViagem', async ({ id, campos, fotoAsset }) => {
  let comprovante_url = campos.comprovante_url ?? null;
  if (fotoAsset && !comprovante_url) comprovante_url = await enviarArquivoDocumento(fotoAsset);
  const { error } = await supabase.from('viagens').update({ ...campos, comprovante_url }).eq('id', id);
  if (error) throw error;
});

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
  if (demo.ativo()) return demo.cadastro();
  const { data, error } = await supabase
    .from('motoristas')
    .select('id, nome, cnh, status')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    if (ehErroDeRede(error)) {
      const cache = await lerCache(`motorista_cadastro_${userId}`);
      if (cache) {
        marcarOnline(false);
        return cache.dados;
      }
    }
    throw error;
  }
  salvarCache(`motorista_cadastro_${userId}`, data);
  return data;
}

export async function buscarMinhasViagens(motoristaId) {
  if (demo.ativo()) return demo.viagens();
  const { data, error } = await supabase
    .from('viagens')
    .select('*, veiculos(id, placa, modelo, km_atual)')
    .eq('motorista_id', motoristaId)
    .order('data_viagem', { ascending: true });
  if (error) {
    if (ehErroDeRede(error)) {
      const cache = await lerCache(`motorista_viagens_${motoristaId}`);
      if (cache) {
        marcarOnline(false);
        return cache.dados;
      }
    }
    throw error;
  }
  salvarCache(`motorista_viagens_${motoristaId}`, data ?? []);
  return data ?? [];
}

// `viagemAtual` é usada para montar a versão local quando não há
// internet (a alteração vai para a fila offline).
export async function iniciarViagem(id, kmInicial, viagemAtual) {
  const campos = { status: STATUS.EM_ANDAMENTO, iniciada_em: new Date().toISOString(), km_inicial: kmInicial ?? null };
  if (demo.ativo()) return demo.atualizar(id, campos);
  const { data, error } = await supabase
    .from('viagens')
    .update(campos)
    .eq('id', id)
    .select('*, veiculos(id, placa, modelo, km_atual)')
    .single();
  if (error) {
    if (ehErroDeRede(error) && viagemAtual) {
      await enfileirar({ tipo: 'update', tabela: 'viagens', id, patch: campos, descricao: 'iniciar a viagem' });
      return { ...viagemAtual, ...campos, pendenteEnvio: true };
    }
    throw error;
  }
  marcarOnline(true);
  return data;
}

// Sem internet: guarda a finalização (e a foto, se houver) na fila e
// devolve a viagem já como concluída para a tela.
export async function finalizarViagem(id, { fotoAsset, observacao, kmFinal }, viagemAtual) {
  const campos = {
    status: STATUS.CONCLUIDA,
    finalizada_em: new Date().toISOString(),
    observacao_motorista: observacao?.trim() || null,
    km_final: kmFinal ?? null,
  };
  if (demo.ativo()) return demo.atualizar(id, { ...campos, comprovante_url: fotoAsset?.uri ?? null });
  try {
    const comprovante_url = fotoAsset ? await enviarArquivoDocumento(fotoAsset) : null;
    const { data, error } = await supabase
      .from('viagens')
      .update({ ...campos, comprovante_url })
      .eq('id', id)
      .select('*, veiculos(id, placa, modelo, km_atual)')
      .single();
    if (error) throw error;
    marcarOnline(true);
    // O trigger da migration-13 atualiza o hodômetro do veículo; o embed
    // devolvido pode ainda trazer o valor antigo, então ajusta aqui.
    if (data?.veiculos && kmFinal != null) {
      data.veiculos = { ...data.veiculos, km_atual: Math.max(Number(data.veiculos.km_atual ?? 0), kmFinal) };
    }
    return data;
  } catch (erro) {
    if (!ehErroDeRede(erro) || !viagemAtual) throw erro;
    let asset = null;
    if (fotoAsset) {
      // Copia a foto para uma pasta permanente do app: o cache da câmera
      // pode ser limpo pelo Android antes da internet voltar.
      let uri = fotoAsset.uri;
      try {
        const pasta = `${FileSystem.documentDirectory}fila-offline/`;
        await FileSystem.makeDirectoryAsync(pasta, { intermediates: true });
        const destino = `${pasta}${id}-${Date.now()}.${(uri.split('.').pop() || 'jpg').split('?')[0]}`;
        await FileSystem.copyAsync({ from: uri, to: destino });
        uri = destino;
      } catch (e) {
        console.warn('Não foi possível copiar a foto para a fila offline:', e?.message);
      }
      asset = { uri, mimeType: fotoAsset.mimeType ?? null };
    }
    await enfileirar({ tipo: 'finalizarViagem', id, campos, fotoAsset: asset, descricao: 'finalizar a viagem' });
    const veiculos = viagemAtual.veiculos && kmFinal != null
      ? { ...viagemAtual.veiculos, km_atual: Math.max(Number(viagemAtual.veiculos.km_atual ?? 0), kmFinal) }
      : viagemAtual.veiculos;
    return { ...viagemAtual, ...campos, comprovante_url: asset?.uri ?? null, veiculos, pendenteEnvio: true };
  }
}

export async function listarVeiculosAtivos() {
  if (demo.ativo()) return demo.veiculos();
  const { data, error } = await supabase
    .from('veiculos')
    .select('id, placa, modelo, status')
    .order('placa', { ascending: true });
  if (error) {
    if (ehErroDeRede(error)) {
      const cache = await lerCache('motorista_veiculos');
      if (cache) return cache.dados;
    }
    throw error;
  }
  const ativos = (data ?? []).filter((v) => v.status !== 'Inativo');
  salvarCache('motorista_veiculos', ativos);
  return ativos;
}

// Devolve { offline: true } quando ficou na fila para enviar depois.
export async function registrarAbastecimento({ veiculoId, litros, valor, posto, dataISO }) {
  if (demo.ativo()) return {};
  const linha = {
    id: novoId(),
    veiculo_id: veiculoId,
    litros,
    valor,
    posto: posto?.trim() || null,
    data_abastecimento: dataISO,
  };
  const { error } = await supabase.from('abastecimentos').insert(linha);
  if (error) {
    if (ehErroDeRede(error)) {
      await enfileirar({ tipo: 'insert', tabela: 'abastecimentos', linha, descricao: 'registrar o abastecimento' });
      return { offline: true };
    }
    throw error;
  }
  marcarOnline(true);
  return {};
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

// "12.345,6" / "12345" -> 12345.6 (null se vazio ou inválido)
export function lerKm(texto) {
  let limpo = String(texto ?? '').replace(/\s|km/gi, '');
  if (limpo.includes(',')) limpo = limpo.replace(/\./g, '').replace(',', '.'); // 182.450,5
  else if (/^\d{1,3}(\.\d{3})+$/.test(limpo)) limpo = limpo.replace(/\./g, ''); // 182.450
  if (!limpo) return null;
  const n = Number(limpo);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function formatKm(n) {
  if (n === null || n === undefined || n === '') return '—';
  return `${Number(n).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km`;
}

export function hojeISO() {
  const dt = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}`;
}

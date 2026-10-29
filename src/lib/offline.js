import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import Constants from 'expo-constants';
import { supabase } from './supabase';

// ============================================================
// Resiliência offline
// ------------------------------------------------------------
// 1. CACHE DE LEITURA: depois de cada carregamento bem-sucedido, os
//    dados ficam salvos no aparelho (AsyncStorage). Sem internet, o app
//    abre com a última cópia em vez de ficar vazio.
// 2. FILA DE ESCRITA (outbox): quando uma gravação falha por falta de
//    rede, ela vai para uma fila persistente e a tela já mostra o
//    lançamento (marcado como "aguardando envio"). Quando a conexão
//    volta, a fila é enviada ao Supabase NA ORDEM em que foi criada.
// 3. DETECÇÃO DE CONEXÃO: sem biblioteca nativa — a cada 15 s (e ao
//    voltar para o app) tentamos sincronizar/pingar o Supabase.
//
// Conflitos: a estratégia é "última gravação vence" (last write wins).
// Os registros criados offline já nascem com UUID gerado no aparelho,
// então o id local é o mesmo que fica no banco — não há duplicação se
// o envio for repetido (o insert repetido falha por chave duplicada e
// é tratado como já enviado).
// ============================================================

const FILA_KEY = '@frota_financeiro/fila_offline_v1';
const CACHE_PREFIX = '@frota_financeiro/cache_v1/';
const INTERVALO_MS = 15000;

let fila = [];
let online = true;
let sincronizando = false;
let carregada = false;
let ultimaSincronizacao = null;
const ouvintes = new Set();
const ouvintesSync = new Set();
const executores = {};

function notificar() {
  const estado = getEstado();
  ouvintes.forEach((fn) => fn(estado));
}

export function getEstado() {
  return { online, pendentes: fila.length, sincronizando, ultimaSincronizacao };
}

export function novoId() {
  return Crypto.randomUUID();
}

// Erros de "sem internet" (fetch falhou) — diferentes de erros de
// validação/permissão do banco, que não adianta tentar de novo.
export function ehErroDeRede(erro) {
  if (!erro) return false;
  if (erro.code && /^[0-9A-Z]{5}$/.test(String(erro.code))) return false; // erro do Postgres
  const msg = String(erro.message ?? erro);
  return /network request failed|failed to fetch|network ?error|timed? ?out|aborted|offline|ECONN|ENOTFOUND/i.test(msg);
}

export function marcarOnline(valor) {
  if (online !== valor) {
    online = valor;
    notificar();
  }
}

async function salvarFila() {
  try {
    await AsyncStorage.setItem(FILA_KEY, JSON.stringify(fila));
  } catch (e) {
    console.warn('Não foi possível salvar a fila offline:', e?.message);
  }
}

async function carregarFila() {
  if (carregada) return;
  carregada = true;
  try {
    const salvo = await AsyncStorage.getItem(FILA_KEY);
    fila = salvo ? JSON.parse(salvo) : [];
  } catch {
    fila = [];
  }
  notificar();
}

// op = { tipo: 'insert' | 'update' | 'delete' | <executor registrado>, ...dados }
export async function enfileirar(op) {
  await carregarFila();
  fila.push({ ...op, filaId: novoId(), criadoEm: new Date().toISOString() });
  marcarOnline(false);
  await salvarFila();
  notificar();
}

export function registrarExecutor(tipo, fn) {
  executores[tipo] = fn;
}

// Executores genéricos: os dados já vão no formato das tabelas.
registrarExecutor('insert', async ({ tabela, linha }) => {
  const { error } = await supabase.from(tabela).insert(linha);
  if (error && error.code === '23505') return; // já enviado antes (id repetido)
  if (error) throw error;
});
registrarExecutor('update', async ({ tabela, id, patch }) => {
  const { error } = await supabase.from(tabela).update(patch).eq('id', id);
  if (error) throw error;
});
registrarExecutor('delete', async ({ tabela, id }) => {
  const { error } = await supabase.from(tabela).delete().eq('id', id);
  if (error) throw error;
});

async function pingar() {
  try {
    const { supabaseUrl, supabaseAnonKey } = Constants.expoConfig?.extra ?? {};
    const r = await fetch(`${supabaseUrl}/rest/v1/`, { headers: { apikey: supabaseAnonKey } });
    return r.status > 0;
  } catch {
    return false;
  }
}

// Envia a fila na ordem. Para no primeiro erro de rede (tenta de novo
// depois). Erro de outro tipo (ex.: permissão) descarta só aquela
// operação, para não travar a fila para sempre.
export async function sincronizar() {
  await carregarFila();
  if (sincronizando) return getEstado();
  if (fila.length === 0) {
    marcarOnline(await pingar());
    return getEstado();
  }
  sincronizando = true;
  notificar();
  const descartadas = [];
  let enviadas = 0;
  try {
    while (fila.length > 0) {
      const op = fila[0];
      const exec = executores[op.tipo];
      try {
        if (!exec) throw new Error(`Operação desconhecida: ${op.tipo}`);
        await exec(op);
        enviadas += 1;
      } catch (erro) {
        if (ehErroDeRede(erro)) {
          marcarOnline(false);
          break;
        }
        console.warn('Operação offline descartada:', op.tipo, erro?.message);
        descartadas.push({ op, erro: erro?.message ?? String(erro) });
      }
      fila.shift();
      await salvarFila();
    }
    if (fila.length === 0) {
      marcarOnline(true);
      ultimaSincronizacao = new Date().toISOString();
    }
  } finally {
    sincronizando = false;
    notificar();
  }
  if (enviadas > 0 || descartadas.length > 0) {
    ouvintesSync.forEach((fn) => fn({ enviadas, descartadas }));
  }
  return getEstado();
}

// Chamado pelos contextos para recarregar os dados depois que a fila
// foi enviada (assim a tela passa a mostrar a versão oficial do banco).
export function aoSincronizar(fn) {
  ouvintesSync.add(fn);
  return () => ouvintesSync.delete(fn);
}

// ---------- Cache de leitura ----------
export async function salvarCache(chave, dados) {
  try {
    await AsyncStorage.setItem(CACHE_PREFIX + chave, JSON.stringify({ salvoEm: new Date().toISOString(), dados }));
  } catch (e) {
    console.warn('Não foi possível salvar o cache offline:', e?.message);
  }
}

export async function lerCache(chave) {
  try {
    const salvo = await AsyncStorage.getItem(CACHE_PREFIX + chave);
    return salvo ? JSON.parse(salvo) : null;
  } catch {
    return null;
  }
}

// Ao sair da conta: limpa fila e caches (não vazar dados entre contas).
export async function limparDadosOffline() {
  try {
    const chaves = await AsyncStorage.getAllKeys();
    await AsyncStorage.multiRemove(chaves.filter((k) => k.startsWith(CACHE_PREFIX)));
  } catch {}
}

// ---------- Monitor (um só para o app inteiro) ----------
let monitorAtivo = false;
function iniciarMonitor() {
  if (monitorAtivo) return;
  monitorAtivo = true;
  carregarFila().then(() => sincronizar());
  setInterval(() => {
    if (!online || fila.length > 0) sincronizar();
  }, INTERVALO_MS);
  AppState.addEventListener('change', (s) => {
    if (s === 'active') sincronizar();
  });
}

export function useStatusOffline() {
  const [estado, setEstado] = useState(getEstado());
  useEffect(() => {
    iniciarMonitor();
    ouvintes.add(setEstado);
    setEstado(getEstado());
    return () => ouvintes.delete(setEstado);
  }, []);
  return { ...estado, sincronizar };
}

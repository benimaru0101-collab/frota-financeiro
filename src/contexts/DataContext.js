import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { parseValorBR, formatValorBR } from '../utils/money';
import {
  veiculos as veiculosIniciais,
  motoristas as motoristasIniciais,
  viagens as viagensIniciais,
  abastecimentos as abastecimentosIniciais,
  manutencoes as manutencoesIniciais,
  documentos as documentosIniciais,
  receitas as receitasIniciais,
  despesas as despesasIniciais,
} from '../data/mockData';

// Estado local (com persistência em AsyncStorage) para o protótipo
// funcional. Quando o Supabase estiver configurado (ver README),
// troque cada `add*` por um `supabase.from('tabela').insert(...)` e
// derive as listas de um `useEffect` com `supabase.from('tabela').select()`
// — a essa altura, esta persistência local deixa de ser necessária.
const DataContext = createContext(null);

const STORAGE_KEY = '@frota_financeiro/dados_locais_v1';

function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function DataProvider({ children }) {
  const [veiculos, setVeiculos] = useState(veiculosIniciais);
  const [motoristas, setMotoristas] = useState(motoristasIniciais);
  const [viagens, setViagens] = useState(viagensIniciais);
  const [abastecimentos, setAbastecimentos] = useState(abastecimentosIniciais);
  const [manutencoes, setManutencoes] = useState(manutencoesIniciais);
  const [documentos, setDocumentos] = useState(documentosIniciais);
  const [receitas, setReceitas] = useState(receitasIniciais);
  const [despesas, setDespesas] = useState(despesasIniciais);
  const [hidratado, setHidratado] = useState(false);

  // Carrega o que foi salvo no dispositivo na primeira montagem. Se
  // nunca houve nada salvo (primeira instalação), mantém os dados de
  // exemplo definidos em mockData.js.
  useEffect(() => {
    (async () => {
      try {
        const salvo = await AsyncStorage.getItem(STORAGE_KEY);
        if (salvo) {
          const dados = JSON.parse(salvo);
          if (dados.veiculos) setVeiculos(dados.veiculos);
          if (dados.motoristas) setMotoristas(dados.motoristas);
          if (dados.viagens) setViagens(dados.viagens);
          if (dados.abastecimentos) setAbastecimentos(dados.abastecimentos);
          if (dados.manutencoes) setManutencoes(dados.manutencoes);
          if (dados.documentos) setDocumentos(dados.documentos);
          if (dados.receitas) setReceitas(dados.receitas);
          if (dados.despesas) setDespesas(dados.despesas);
        }
      } catch (erro) {
        console.warn('Não foi possível carregar os dados salvos:', erro);
      } finally {
        setHidratado(true);
      }
    })();
  }, []);

  // Salva a cada mudança, mas só depois que a hidratação inicial
  // terminou — evita sobrescrever o que já estava salvo com os dados
  // de exemplo no instante em que o app abre.
  const primeiraExecucao = useRef(true);
  useEffect(() => {
    if (!hidratado) return;
    if (primeiraExecucao.current) {
      primeiraExecucao.current = false;
      return;
    }
    const dados = { veiculos, motoristas, viagens, abastecimentos, manutencoes, documentos, receitas, despesas };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dados)).catch((erro) =>
      console.warn('Não foi possível salvar os dados:', erro)
    );
  }, [hidratado, veiculos, motoristas, viagens, abastecimentos, manutencoes, documentos, receitas, despesas]);

  // Helpers genéricos de update/delete por id — evitam repetir a mesma
  // lógica para cada uma das 8 coleções. `add*` continua específico
  // por entidade porque cada uma tem seu próprio valor padrão (ex.:
  // status: 'Ativo').
  function updatePorId(setter, id, alteracoes) {
    setter((atual) => atual.map((item) => (item.id === id ? { ...item, ...alteracoes } : item)));
  }
  function removerPorId(setter, id) {
    setter((atual) => atual.filter((item) => item.id !== id));
  }

  const addVeiculo = (item) => setVeiculos((atual) => [{ id: gerarId(), status: 'Ativo', ...item }, ...atual]);
  const updateVeiculo = (id, alteracoes) => updatePorId(setVeiculos, id, alteracoes);
  const deleteVeiculo = (id) => removerPorId(setVeiculos, id);

  const addMotorista = (item) => setMotoristas((atual) => [{ id: gerarId(), status: 'Ativo', ...item }, ...atual]);
  const updateMotorista = (id, alteracoes) => updatePorId(setMotoristas, id, alteracoes);
  const deleteMotorista = (id) => removerPorId(setMotoristas, id);

  const addViagem = (item) => setViagens((atual) => [{ id: gerarId(), ...item }, ...atual]);
  const updateViagem = (id, alteracoes) => updatePorId(setViagens, id, alteracoes);
  const deleteViagem = (id) => removerPorId(setViagens, id);

  const addAbastecimento = (item) => setAbastecimentos((atual) => [{ id: gerarId(), ...item }, ...atual]);
  const updateAbastecimento = (id, alteracoes) => updatePorId(setAbastecimentos, id, alteracoes);
  const deleteAbastecimento = (id) => removerPorId(setAbastecimentos, id);

  const addManutencao = (item) => setManutencoes((atual) => [{ id: gerarId(), ...item }, ...atual]);
  const updateManutencao = (id, alteracoes) => updatePorId(setManutencoes, id, alteracoes);
  const deleteManutencao = (id) => removerPorId(setManutencoes, id);

  const addDocumento = (item) => setDocumentos((atual) => [{ id: gerarId(), ...item }, ...atual]);
  const updateDocumento = (id, alteracoes) => updatePorId(setDocumentos, id, alteracoes);
  const deleteDocumento = (id) => removerPorId(setDocumentos, id);

  const addReceita = (item) => setReceitas((atual) => [{ id: gerarId(), ...item }, ...atual]);
  const deleteReceita = (id) => removerPorId(setReceitas, id);

  const addDespesa = (item) => setDespesas((atual) => [{ id: gerarId(), ...item }, ...atual]);
  const deleteDespesa = (id) => removerPorId(setDespesas, id);

  // Totais derivados dos dados reais em memória — substituem os
  // números fixos que existiam antes só para preencher a UI.
  const resumo = useMemo(() => {
    const totalReceitas = receitas.reduce((soma, r) => soma + parseValorBR(r.valor), 0);
    const totalDespesas = despesas.reduce((soma, d) => soma + parseValorBR(d.valor), 0);
    const veiculosAtivos = veiculos.filter((v) => v.status === 'Ativo').length;
    return {
      saldoTotal: formatValorBR(totalReceitas - totalDespesas),
      receitasMes: formatValorBR(totalReceitas),
      despesasMes: formatValorBR(totalDespesas),
      veiculosAtivos,
    };
  }, [receitas, despesas, veiculos]);

  const value = {
    hidratado,
    resumo,
    veiculos, addVeiculo, updateVeiculo, deleteVeiculo,
    motoristas, addMotorista, updateMotorista, deleteMotorista,
    viagens, addViagem, updateViagem, deleteViagem,
    abastecimentos, addAbastecimento, updateAbastecimento, deleteAbastecimento,
    manutencoes, addManutencao, updateManutencao, deleteManutencao,
    documentos, addDocumento, updateDocumento, deleteDocumento,
    receitas, addReceita, deleteReceita,
    despesas, addDespesa, deleteDespesa,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData precisa estar dentro de <DataProvider>');
  return ctx;
}

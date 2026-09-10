import React, { createContext, useContext, useMemo, useState } from 'react';
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

// Estado em memória para o protótipo funcional. Quando o Supabase
// estiver configurado (ver README), troque cada `add*` por um
// `supabase.from('tabela').insert(...)` e derive as listas de um
// `useEffect` com `supabase.from('tabela').select()`.
const DataContext = createContext(null);

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

  const addVeiculo = (item) => setVeiculos((atual) => [{ id: gerarId(), status: 'Ativo', ...item }, ...atual]);
  const addMotorista = (item) => setMotoristas((atual) => [{ id: gerarId(), status: 'Ativo', ...item }, ...atual]);
  const addViagem = (item) => setViagens((atual) => [{ id: gerarId(), ...item }, ...atual]);
  const addAbastecimento = (item) => setAbastecimentos((atual) => [{ id: gerarId(), ...item }, ...atual]);
  const addManutencao = (item) => setManutencoes((atual) => [{ id: gerarId(), ...item }, ...atual]);
  const addDocumento = (item) => setDocumentos((atual) => [{ id: gerarId(), ...item }, ...atual]);
  const addReceita = (item) => setReceitas((atual) => [{ id: gerarId(), ...item }, ...atual]);
  const addDespesa = (item) => setDespesas((atual) => [{ id: gerarId(), ...item }, ...atual]);

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
    resumo,
    veiculos, addVeiculo,
    motoristas, addMotorista,
    viagens, addViagem,
    abastecimentos, addAbastecimento,
    manutencoes, addManutencao,
    documentos, addDocumento,
    receitas, addReceita,
    despesas, addDespesa,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData precisa estar dentro de <DataProvider>');
  return ctx;
}

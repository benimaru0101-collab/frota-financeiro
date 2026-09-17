import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { parseValorBR, formatValorBR } from '../utils/money';
import { dataBRParaISO, dataISOParaBR, separarOrigemDestino } from '../utils/data';
import { reagendarNotificacoesVencimento, cancelarNotificacoesVencimento } from '../lib/notifications';

// Mesma chave usada em ConfiguracoesScreen — lida aqui só pra saber se
// o usuário quer as notificações de vencimento ligadas ou não.
const PREFS_KEY = '@frota_financeiro/preferencias_v1';

// Estado ligado ao Supabase de verdade: cada `add*/update*/delete*`
// chama `supabase.from('tabela')...` e só atualiza o estado local
// (o que a UI enxerga) depois que o servidor confirma a operação. As
// funções "*DaLinha" abaixo convertem entre o formato das tabelas
// (snake_case, numeric, date) e o formato que as telas já usavam
// (strings prontas para exibir, ex.: "R$ 3.200,00", "175.000 km").
const DataContext = createContext(null);

function veiculoDaLinha(l) {
  return {
    id: l.id,
    placa: l.placa,
    modelo: l.modelo,
    tipo: l.tipo,
    status: l.status,
    km: `${Number(l.km_atual ?? 0).toLocaleString('pt-BR')} km`,
  };
}

function motoristaDaLinha(l) {
  return { id: l.id, nome: l.nome, cnh: l.cnh || 'CNH: não informada', status: l.status };
}

function viagemDaLinha(l) {
  return {
    id: l.id,
    origemDestino: `${l.origem} - ${l.destino}`,
    placa: l.veiculos?.placa ?? '',
    motorista: l.motoristas?.nome ?? '',
    data: dataISOParaBR(l.data_viagem),
    valor: formatValorBR(Number(l.valor)),
  };
}

function abastecimentoDaLinha(l) {
  return {
    id: l.id,
    placa: l.veiculos?.placa ?? '',
    litros: `${Number(l.litros).toLocaleString('pt-BR')} L`,
    valor: formatValorBR(Number(l.valor)),
    data: dataISOParaBR(l.data_abastecimento),
  };
}

function manutencaoDaLinha(l) {
  return {
    id: l.id,
    placa: l.veiculos?.placa ?? '',
    tipo: l.tipo,
    valor: formatValorBR(Number(l.valor)),
    data: dataISOParaBR(l.data_manutencao),
  };
}

function documentoDaLinha(l) {
  return {
    id: l.id,
    placa: l.veiculos?.placa ?? '',
    tipo: l.tipo,
    vencimento: dataISOParaBR(l.data_vencimento),
    arquivoUrl: l.arquivo_url ?? null,
  };
}

function receitaDaLinha(l) {
  return {
    id: l.id,
    descricao: l.descricao,
    valor: formatValorBR(Number(l.valor)),
    data: dataISOParaBR(l.data_receita),
  };
}

function despesaDaLinha(l) {
  return {
    id: l.id,
    descricao: l.descricao,
    valor: formatValorBR(Number(l.valor)),
    categoria: l.categorias_financeiras?.nome ?? 'Frota',
    data: dataISOParaBR(l.data_despesa),
  };
}

function contaDaLinha(l) {
  return {
    id: l.id,
    nome: l.nome,
    tipo: l.tipo,
    banco: l.banco || '',
    descricao: l.descricao || '',
    saldo: formatValorBR(Number(l.saldo_inicial ?? 0)),
  };
}

function categoriaDaLinha(l) {
  return {
    id: l.id,
    nome: l.nome,
    tipo: l.tipo,
    icone: l.icone || '',
    cor: l.cor || '',
    descricao: l.descricao || '',
  };
}

function avisarErro(operacao, error) {
  console.warn(`Erro ao ${operacao}:`, error?.message);
  Alert.alert('Ocorreu um erro', error?.message || `Não foi possível ${operacao}. Verifique sua conexão e tente novamente.`);
}

export function DataProvider({ children }) {
  const { session } = useAuth();

  const [veiculos, setVeiculos] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [viagens, setViagens] = useState([]);
  const [abastecimentos, setAbastecimentos] = useState([]);
  const [manutencoes, setManutencoes] = useState([]);
  const [documentos, setDocumentos] = useState([]);
  const [receitas, setReceitas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [contas, setContas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [hidratado, setHidratado] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const userId = session?.user?.id ?? null;

  // Busca tudo do Supabase assim que o usuário está autenticado (as
  // policies de RLS exigem `authenticated`). Se a sessão terminar
  // (logout), limpa o estado local para não vazar dados de uma conta
  // para a próxima que logar no mesmo aparelho.
  useEffect(() => {
    let cancelado = false;

    if (!userId) {
      setVeiculos([]);
      setMotoristas([]);
      setViagens([]);
      setAbastecimentos([]);
      setManutencoes([]);
      setDocumentos([]);
      setReceitas([]);
      setDespesas([]);
      setContas([]);
      setCategorias([]);
      setHidratado(false);
      return;
    }

    (async () => {
      setCarregando(true);
      try {
        // Veículos e motoristas primeiro: viagens/abastecimentos/etc
        // trazem o nome/placa já embutidos via join do PostgREST.
        const [{ data: veiculosData, error: erroVeiculos }, { data: motoristasData, error: erroMotoristas }] =
          await Promise.all([
            supabase.from('veiculos').select('*').order('criado_em', { ascending: false }),
            supabase.from('motoristas').select('*').order('criado_em', { ascending: false }),
          ]);
        if (erroVeiculos) throw erroVeiculos;
        if (erroMotoristas) throw erroMotoristas;

        const [
          { data: viagensData, error: erroViagens },
          { data: abastecimentosData, error: erroAbastecimentos },
          { data: manutencoesData, error: erroManutencoes },
          { data: documentosData, error: erroDocumentos },
          { data: receitasData, error: erroReceitas },
          { data: despesasData, error: erroDespesas },
          { data: contasData, error: erroContas },
          { data: categoriasData, error: erroCategorias },
        ] = await Promise.all([
          supabase.from('viagens').select('*, veiculos(placa), motoristas(nome)').order('criado_em', { ascending: false }),
          supabase.from('abastecimentos').select('*, veiculos(placa)').order('criado_em', { ascending: false }),
          supabase.from('manutencoes').select('*, veiculos(placa)').order('criado_em', { ascending: false }),
          supabase.from('documentos').select('*, veiculos(placa)').order('criado_em', { ascending: false }),
          supabase.from('receitas').select('*').order('criado_em', { ascending: false }),
          supabase.from('despesas').select('*, categorias_financeiras(nome)').order('criado_em', { ascending: false }),
          supabase.from('contas').select('*').order('criado_em', { ascending: false }),
          supabase.from('categorias_financeiras').select('*').order('nome', { ascending: true }),
        ]);
        if (erroViagens) throw erroViagens;
        if (erroAbastecimentos) throw erroAbastecimentos;
        if (erroManutencoes) throw erroManutencoes;
        if (erroDocumentos) throw erroDocumentos;
        if (erroReceitas) throw erroReceitas;
        if (erroDespesas) throw erroDespesas;
        if (erroContas) throw erroContas;
        if (erroCategorias) throw erroCategorias;

        if (cancelado) return;
        setVeiculos((veiculosData ?? []).map(veiculoDaLinha));
        setMotoristas((motoristasData ?? []).map(motoristaDaLinha));
        setViagens((viagensData ?? []).map(viagemDaLinha));
        setAbastecimentos((abastecimentosData ?? []).map(abastecimentoDaLinha));
        setManutencoes((manutencoesData ?? []).map(manutencaoDaLinha));
        setDocumentos((documentosData ?? []).map(documentoDaLinha));
        setReceitas((receitasData ?? []).map(receitaDaLinha));
        setDespesas((despesasData ?? []).map(despesaDaLinha));
        setContas((contasData ?? []).map(contaDaLinha));
        setCategorias((categoriasData ?? []).map(categoriaDaLinha));
      } catch (erro) {
        console.warn('Não foi possível carregar os dados do Supabase:', erro?.message);
        Alert.alert('Erro ao carregar dados', erro?.message ?? 'Verifique sua conexão e tente novamente.');
      } finally {
        if (!cancelado) {
          setHidratado(true);
          setCarregando(false);
        }
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [userId]);

  // Notificações de vencimento: sempre que a lista de documentos muda
  // (carregou do Supabase, ou o usuário cadastrou/editou/excluiu um),
  // reagenda os avisos locais — só se a preferência "Notificações"
  // estiver ligada em Configurações. Sem servidor/push: tudo agendado
  // no próprio aparelho via expo-notifications.
  useEffect(() => {
    if (!hidratado) return;
    (async () => {
      try {
        const salvo = await AsyncStorage.getItem(PREFS_KEY);
        const notificacoesAtivas = salvo ? JSON.parse(salvo).notificacoes !== false : true;
        if (notificacoesAtivas) {
          await reagendarNotificacoesVencimento(documentos);
        } else {
          await cancelarNotificacoesVencimento();
        }
      } catch (erro) {
        console.warn('Não foi possível agendar notificações de vencimento:', erro?.message);
      }
    })();
  }, [documentos, hidratado]);

  // Helpers genéricos de update/delete por id no estado LOCAL — usados
  // depois que o Supabase já confirmou a escrita, para refletir na UI
  // sem precisar buscar tudo de novo a cada operação.
  function updatePorId(setter, id, alteracoes) {
    setter((atual) => atual.map((item) => (item.id === id ? { ...item, ...alteracoes } : item)));
  }
  function removerPorId(setter, id) {
    setter((atual) => atual.filter((item) => item.id !== id));
  }

  function idDoVeiculo(placa) {
    return veiculos.find((v) => v.placa === placa)?.id ?? null;
  }
  function idDoMotorista(nome) {
    return motoristas.find((m) => m.nome === nome)?.id ?? null;
  }

  // categorias_financeiras não tem tela própria ainda — as despesas
  // usam um conjunto fixo de nomes (ver NovaDespesaScreen), então aqui
  // buscamos a categoria pelo nome e criamos na hora se ainda não existir.
  async function obterCategoriaDespesaId(nome) {
    const { data: existente, error: erroSelect } = await supabase
      .from('categorias_financeiras')
      .select('id')
      .eq('nome', nome)
      .eq('tipo', 'despesa')
      .maybeSingle();
    if (erroSelect) throw erroSelect;
    if (existente) return existente.id;

    const { data: criada, error: erroInsert } = await supabase
      .from('categorias_financeiras')
      .insert({ nome, tipo: 'despesa' })
      .select('id')
      .single();
    if (erroInsert) throw erroInsert;
    return criada.id;
  }

  async function addVeiculo(item) {
    try {
      const { data, error } = await supabase
        .from('veiculos')
        .insert({
          placa: item.placa,
          modelo: item.modelo,
          tipo: item.tipo,
          status: item.status || 'Ativo',
          km_atual: parseValorBR(item.km),
        })
        .select()
        .single();
      if (error) throw error;
      setVeiculos((atual) => [veiculoDaLinha(data), ...atual]);
    } catch (erro) {
      avisarErro('cadastrar o veículo', erro);
    }
  }

  async function updateVeiculo(id, alteracoes) {
    try {
      const patch = {};
      if (alteracoes.placa !== undefined) patch.placa = alteracoes.placa;
      if (alteracoes.modelo !== undefined) patch.modelo = alteracoes.modelo;
      if (alteracoes.tipo !== undefined) patch.tipo = alteracoes.tipo;
      if (alteracoes.status !== undefined) patch.status = alteracoes.status;
      if (alteracoes.km !== undefined) patch.km_atual = parseValorBR(alteracoes.km);
      const { error } = await supabase.from('veiculos').update(patch).eq('id', id);
      if (error) throw error;
      updatePorId(setVeiculos, id, alteracoes);
    } catch (erro) {
      avisarErro('atualizar o veículo', erro);
    }
  }

  async function deleteVeiculo(id) {
    try {
      const { error } = await supabase.from('veiculos').delete().eq('id', id);
      if (error) throw error;
      removerPorId(setVeiculos, id);
    } catch (erro) {
      avisarErro('excluir o veículo', erro);
    }
  }

  async function addMotorista(item) {
    try {
      const { data, error } = await supabase
        .from('motoristas')
        .insert({ nome: item.nome, cnh: item.cnh, status: item.status || 'Ativo' })
        .select()
        .single();
      if (error) throw error;
      setMotoristas((atual) => [motoristaDaLinha(data), ...atual]);
    } catch (erro) {
      avisarErro('cadastrar o motorista', erro);
    }
  }

  async function updateMotorista(id, alteracoes) {
    try {
      const patch = {};
      if (alteracoes.nome !== undefined) patch.nome = alteracoes.nome;
      if (alteracoes.cnh !== undefined) patch.cnh = alteracoes.cnh;
      if (alteracoes.status !== undefined) patch.status = alteracoes.status;
      const { error } = await supabase.from('motoristas').update(patch).eq('id', id);
      if (error) throw error;
      updatePorId(setMotoristas, id, alteracoes);
    } catch (erro) {
      avisarErro('atualizar o motorista', erro);
    }
  }

  async function deleteMotorista(id) {
    try {
      const { error } = await supabase.from('motoristas').delete().eq('id', id);
      if (error) throw error;
      removerPorId(setMotoristas, id);
    } catch (erro) {
      avisarErro('excluir o motorista', erro);
    }
  }

  async function addViagem(item) {
    try {
      const { origem, destino } = separarOrigemDestino(item.origemDestino);
      const { data, error } = await supabase
        .from('viagens')
        .insert({
          veiculo_id: idDoVeiculo(item.placa),
          motorista_id: idDoMotorista(item.motorista),
          origem,
          destino,
          data_viagem: dataBRParaISO(item.data),
          valor: parseValorBR(item.valor),
        })
        .select('*, veiculos(placa), motoristas(nome)')
        .single();
      if (error) throw error;
      setViagens((atual) => [viagemDaLinha(data), ...atual]);
    } catch (erro) {
      avisarErro('registrar a viagem', erro);
    }
  }

  async function updateViagem(id, alteracoes) {
    try {
      const patch = {};
      if (alteracoes.origemDestino !== undefined) {
        const { origem, destino } = separarOrigemDestino(alteracoes.origemDestino);
        patch.origem = origem;
        patch.destino = destino;
      }
      if (alteracoes.placa !== undefined) patch.veiculo_id = idDoVeiculo(alteracoes.placa);
      if (alteracoes.motorista !== undefined) patch.motorista_id = idDoMotorista(alteracoes.motorista);
      if (alteracoes.data !== undefined) patch.data_viagem = dataBRParaISO(alteracoes.data);
      if (alteracoes.valor !== undefined) patch.valor = parseValorBR(alteracoes.valor);
      const { error } = await supabase.from('viagens').update(patch).eq('id', id);
      if (error) throw error;
      updatePorId(setViagens, id, alteracoes);
    } catch (erro) {
      avisarErro('atualizar a viagem', erro);
    }
  }

  async function deleteViagem(id) {
    try {
      const { error } = await supabase.from('viagens').delete().eq('id', id);
      if (error) throw error;
      removerPorId(setViagens, id);
    } catch (erro) {
      avisarErro('excluir a viagem', erro);
    }
  }

  async function addAbastecimento(item) {
    try {
      const { data, error } = await supabase
        .from('abastecimentos')
        .insert({
          veiculo_id: idDoVeiculo(item.placa),
          litros: parseValorBR(item.litros),
          valor: parseValorBR(item.valor),
          data_abastecimento: dataBRParaISO(item.data),
        })
        .select('*, veiculos(placa)')
        .single();
      if (error) throw error;
      setAbastecimentos((atual) => [abastecimentoDaLinha(data), ...atual]);
    } catch (erro) {
      avisarErro('registrar o abastecimento', erro);
    }
  }

  async function updateAbastecimento(id, alteracoes) {
    try {
      const patch = {};
      if (alteracoes.placa !== undefined) patch.veiculo_id = idDoVeiculo(alteracoes.placa);
      if (alteracoes.litros !== undefined) patch.litros = parseValorBR(alteracoes.litros);
      if (alteracoes.valor !== undefined) patch.valor = parseValorBR(alteracoes.valor);
      if (alteracoes.data !== undefined) patch.data_abastecimento = dataBRParaISO(alteracoes.data);
      const { error } = await supabase.from('abastecimentos').update(patch).eq('id', id);
      if (error) throw error;
      updatePorId(setAbastecimentos, id, alteracoes);
    } catch (erro) {
      avisarErro('atualizar o abastecimento', erro);
    }
  }

  async function deleteAbastecimento(id) {
    try {
      const { error } = await supabase.from('abastecimentos').delete().eq('id', id);
      if (error) throw error;
      removerPorId(setAbastecimentos, id);
    } catch (erro) {
      avisarErro('excluir o abastecimento', erro);
    }
  }

  async function addManutencao(item) {
    try {
      const { data, error } = await supabase
        .from('manutencoes')
        .insert({
          veiculo_id: idDoVeiculo(item.placa),
          tipo: item.tipo,
          valor: parseValorBR(item.valor),
          data_manutencao: dataBRParaISO(item.data),
        })
        .select('*, veiculos(placa)')
        .single();
      if (error) throw error;
      setManutencoes((atual) => [manutencaoDaLinha(data), ...atual]);
    } catch (erro) {
      avisarErro('registrar a manutenção', erro);
    }
  }

  async function updateManutencao(id, alteracoes) {
    try {
      const patch = {};
      if (alteracoes.placa !== undefined) patch.veiculo_id = idDoVeiculo(alteracoes.placa);
      if (alteracoes.tipo !== undefined) patch.tipo = alteracoes.tipo;
      if (alteracoes.valor !== undefined) patch.valor = parseValorBR(alteracoes.valor);
      if (alteracoes.data !== undefined) patch.data_manutencao = dataBRParaISO(alteracoes.data);
      const { error } = await supabase.from('manutencoes').update(patch).eq('id', id);
      if (error) throw error;
      updatePorId(setManutencoes, id, alteracoes);
    } catch (erro) {
      avisarErro('atualizar a manutenção', erro);
    }
  }

  async function deleteManutencao(id) {
    try {
      const { error } = await supabase.from('manutencoes').delete().eq('id', id);
      if (error) throw error;
      removerPorId(setManutencoes, id);
    } catch (erro) {
      avisarErro('excluir a manutenção', erro);
    }
  }

  async function addDocumento(item) {
    try {
      const { data, error } = await supabase
        .from('documentos')
        .insert({
          veiculo_id: idDoVeiculo(item.placa),
          tipo: item.tipo,
          data_vencimento: dataBRParaISO(item.vencimento),
          arquivo_url: item.arquivoUrl ?? null,
        })
        .select('*, veiculos(placa)')
        .single();
      if (error) throw error;
      setDocumentos((atual) => [documentoDaLinha(data), ...atual]);
    } catch (erro) {
      avisarErro('registrar o documento', erro);
    }
  }

  async function updateDocumento(id, alteracoes) {
    try {
      const patch = {};
      if (alteracoes.placa !== undefined) patch.veiculo_id = idDoVeiculo(alteracoes.placa);
      if (alteracoes.tipo !== undefined) patch.tipo = alteracoes.tipo;
      if (alteracoes.vencimento !== undefined) patch.data_vencimento = dataBRParaISO(alteracoes.vencimento);
      if (alteracoes.arquivoUrl !== undefined) patch.arquivo_url = alteracoes.arquivoUrl;
      const { error } = await supabase.from('documentos').update(patch).eq('id', id);
      if (error) throw error;
      updatePorId(setDocumentos, id, alteracoes);
    } catch (erro) {
      avisarErro('atualizar o documento', erro);
    }
  }

  async function deleteDocumento(id) {
    try {
      const { error } = await supabase.from('documentos').delete().eq('id', id);
      if (error) throw error;
      removerPorId(setDocumentos, id);
    } catch (erro) {
      avisarErro('excluir o documento', erro);
    }
  }

  async function addReceita(item) {
    try {
      const { data, error } = await supabase
        .from('receitas')
        .insert({
          descricao: item.descricao,
          valor: parseValorBR(item.valor),
          data_receita: dataBRParaISO(item.data),
        })
        .select()
        .single();
      if (error) throw error;
      setReceitas((atual) => [receitaDaLinha(data), ...atual]);
    } catch (erro) {
      avisarErro('registrar a receita', erro);
    }
  }

  async function deleteReceita(id) {
    try {
      const { error } = await supabase.from('receitas').delete().eq('id', id);
      if (error) throw error;
      removerPorId(setReceitas, id);
    } catch (erro) {
      avisarErro('excluir a receita', erro);
    }
  }

  async function addDespesa(item) {
    try {
      const categoriaId = await obterCategoriaDespesaId(item.categoria);
      const { data, error } = await supabase
        .from('despesas')
        .insert({
          descricao: item.descricao,
          valor: parseValorBR(item.valor),
          categoria_id: categoriaId,
          data_despesa: dataBRParaISO(item.data),
        })
        .select('*, categorias_financeiras(nome)')
        .single();
      if (error) throw error;
      setDespesas((atual) => [despesaDaLinha(data), ...atual]);
    } catch (erro) {
      avisarErro('registrar a despesa', erro);
    }
  }

  async function deleteDespesa(id) {
    try {
      const { error } = await supabase.from('despesas').delete().eq('id', id);
      if (error) throw error;
      removerPorId(setDespesas, id);
    } catch (erro) {
      avisarErro('excluir a despesa', erro);
    }
  }

  async function addConta(item) {
    try {
      const { data, error } = await supabase
        .from('contas')
        .insert({
          nome: item.nome,
          tipo: item.tipo,
          banco: item.banco || null,
          descricao: item.descricao || null,
          saldo_inicial: parseValorBR(item.saldo ?? '0'),
        })
        .select()
        .single();
      if (error) throw error;
      setContas((atual) => [contaDaLinha(data), ...atual]);
    } catch (erro) {
      avisarErro('cadastrar a conta', erro);
    }
  }

  async function updateConta(id, alteracoes) {
    try {
      const patch = {};
      if (alteracoes.nome !== undefined) patch.nome = alteracoes.nome;
      if (alteracoes.tipo !== undefined) patch.tipo = alteracoes.tipo;
      if (alteracoes.banco !== undefined) patch.banco = alteracoes.banco || null;
      if (alteracoes.descricao !== undefined) patch.descricao = alteracoes.descricao || null;
      if (alteracoes.saldo !== undefined) patch.saldo_inicial = parseValorBR(alteracoes.saldo);
      const { error } = await supabase.from('contas').update(patch).eq('id', id);
      if (error) throw error;
      updatePorId(setContas, id, alteracoes);
    } catch (erro) {
      avisarErro('atualizar a conta', erro);
    }
  }

  async function deleteConta(id) {
    try {
      const { error } = await supabase.from('contas').delete().eq('id', id);
      if (error) throw error;
      removerPorId(setContas, id);
    } catch (erro) {
      avisarErro('excluir a conta', erro);
    }
  }

  async function addCategoria(item) {
    try {
      const { data, error } = await supabase
        .from('categorias_financeiras')
        .insert({
          nome: item.nome,
          tipo: item.tipo,
          icone: item.icone || null,
          cor: item.cor || null,
          descricao: item.descricao || null,
        })
        .select()
        .single();
      if (error) throw error;
      setCategorias((atual) => [...atual, categoriaDaLinha(data)].sort((a, b) => a.nome.localeCompare(b.nome)));
    } catch (erro) {
      avisarErro('cadastrar a categoria', erro);
    }
  }

  async function updateCategoria(id, alteracoes) {
    try {
      const patch = {};
      if (alteracoes.nome !== undefined) patch.nome = alteracoes.nome;
      if (alteracoes.tipo !== undefined) patch.tipo = alteracoes.tipo;
      if (alteracoes.icone !== undefined) patch.icone = alteracoes.icone || null;
      if (alteracoes.cor !== undefined) patch.cor = alteracoes.cor || null;
      if (alteracoes.descricao !== undefined) patch.descricao = alteracoes.descricao || null;
      const { error } = await supabase.from('categorias_financeiras').update(patch).eq('id', id);
      if (error) throw error;
      updatePorId(setCategorias, id, alteracoes);
    } catch (erro) {
      avisarErro('atualizar a categoria', erro);
    }
  }

  async function deleteCategoria(id) {
    try {
      const { error } = await supabase.from('categorias_financeiras').delete().eq('id', id);
      if (error) throw error;
      removerPorId(setCategorias, id);
    } catch (erro) {
      avisarErro('excluir a categoria', erro);
    }
  }

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
    carregando,
    resumo,
    veiculos, addVeiculo, updateVeiculo, deleteVeiculo,
    motoristas, addMotorista, updateMotorista, deleteMotorista,
    viagens, addViagem, updateViagem, deleteViagem,
    abastecimentos, addAbastecimento, updateAbastecimento, deleteAbastecimento,
    manutencoes, addManutencao, updateManutencao, deleteManutencao,
    documentos, addDocumento, updateDocumento, deleteDocumento,
    receitas, addReceita, deleteReceita,
    despesas, addDespesa, deleteDespesa,
    contas, addConta, updateConta, deleteConta,
    categorias, addCategoria, updateCategoria, deleteCategoria,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData precisa estar dentro de <DataProvider>');
  return ctx;
}

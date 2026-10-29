import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { buscarMeuCadastro, buscarMinhasViagens } from '../lib/motorista';
import { aoSincronizar } from '../lib/offline';

// Estado do App do Motorista: o cadastro ligado à conta logada e as
// viagens dele. Separado do DataContext do administrador, que carrega
// o Financeiro e a Frota inteira.
const MotoristaContext = createContext(null);

export function MotoristaProvider({ children }) {
  const { user } = useAuth();
  const [cadastro, setCadastro] = useState(null);
  const [viagens, setViagens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const recarregar = useCallback(async () => {
    if (!user?.id) return;
    setCarregando(true);
    setErro(null);
    try {
      const meu = await buscarMeuCadastro(user.id);
      setCadastro(meu);
      setViagens(meu ? await buscarMinhasViagens(meu.id) : []);
    } catch (e) {
      setErro(e?.message ?? 'Erro ao carregar');
    } finally {
      setCarregando(false);
    }
  }, [user?.id]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  // Fila offline enviada -> busca a versão oficial das viagens.
  useEffect(() => aoSincronizar(({ enviadas }) => {
    if (enviadas > 0) recarregar();
  }), [recarregar]);

  // Troca uma viagem da lista pela versão que o banco devolveu. Se o
  // hodômetro do veículo mudou (viagem finalizada), as outras viagens do
  // mesmo veículo passam a sugerir o KM novo.
  function substituirViagem(linha) {
    setViagens((atual) =>
      atual.map((v) => {
        if (v.id === linha.id) return linha;
        if (linha.veiculos?.id && v.veiculos?.id === linha.veiculos.id) return { ...v, veiculos: { ...v.veiculos, ...linha.veiculos } };
        return v;
      })
    );
  }

  return (
    <MotoristaContext.Provider value={{ cadastro, viagens, carregando, erro, recarregar, substituirViagem }}>
      {children}
    </MotoristaContext.Provider>
  );
}

export function useMotorista() {
  const ctx = useContext(MotoristaContext);
  if (!ctx) throw new Error('useMotorista precisa estar dentro de <MotoristaProvider>');
  return ctx;
}

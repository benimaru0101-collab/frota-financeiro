import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import MotoristaNavigator from './MotoristaNavigator';
import { colors } from '../theme/colors';
import { APP, EH_APP_MOTORISTA } from '../config/app';
import BarraOffline from '../components/BarraOffline';

function Carregando() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

// Conta aberta no app errado (ex.: administrador no app do Motorista).
function AppErrado({ papel, onSair }) {
  const outro = papel === 'motorista' ? 'Frota Motorista' : 'Frota ADM';
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', textAlign: 'center' }}>Esta conta não é deste app</Text>
      <Text style={{ color: colors.textMuted, marginTop: 8, textAlign: 'center' }}>
        Você entrou no {APP.nome} com uma conta de {papel}. Use o app {outro}.
      </Text>
      <TouchableOpacity onPress={onSair} style={{ marginTop: 24, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10, backgroundColor: colors.primary }}>
        <Text style={{ color: colors.darkText, fontWeight: '700' }}>Sair e trocar de conta</Text>
      </TouchableOpacity>
    </View>
  );
}

// Conta nova do app ADM, ainda não aprovada por um administrador.
function AguardandoAprovacao({ email, onAtualizar, onSair }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', textAlign: 'center' }}>Aguardando aprovação</Text>
      <Text style={{ color: colors.textMuted, marginTop: 8, textAlign: 'center' }}>
        Sua conta {email ? `(${email}) ` : ''}foi criada. Um administrador precisa aprová-la em Usuários antes de você acessar o painel.
      </Text>
      <TouchableOpacity onPress={onAtualizar} style={{ marginTop: 24, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10, backgroundColor: colors.primary }}>
        <Text style={{ color: colors.darkText, fontWeight: '700' }}>Já fui aprovado, atualizar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onSair} style={{ marginTop: 12, padding: 8 }}>
        <Text style={{ color: colors.textMuted }}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function RootNavigator() {
  const { session, user, loading, role, carregandoPerfil, signOut, recarregarPapel } = useAuth();

  if (loading) return <Carregando />;
  // Espera o papel carregar para não abrir o app errado por um instante.
  if (session && (role === null || carregandoPerfil)) return <Carregando />;

  let conteudo = <AuthNavigator />;
  if (session) {
    if (role === 'pendente') {
      return <AguardandoAprovacao email={user?.email} onAtualizar={recarregarPapel} onSair={signOut} />;
    }
    const ehMotorista = role === 'motorista';
    // App do Motorista: motorista e administrador entram (o admin pode
    // usar o app como motorista se tiver um cadastro de motorista
    // vinculado). App ADM: só administrador.
    if (EH_APP_MOTORISTA) conteudo = <MotoristaNavigator />;
    else if (ehMotorista) return <AppErrado papel={role} onSair={signOut} />;
    else conteudo = <MainNavigator />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <NavigationContainer>{conteudo}</NavigationContainer>
      {/* Aviso de "sem internet / aguardando envio" (resiliência offline) */}
      {session ? <BarraOffline /> : null}
    </View>
  );
}

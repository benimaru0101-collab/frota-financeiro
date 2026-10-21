import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import MotoristaNavigator from './MotoristaNavigator';
import { colors } from '../theme/colors';

function Carregando() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

export default function RootNavigator() {
  const { session, loading, role, carregandoPerfil } = useAuth();

  if (loading) return <Carregando />;
  // Espera o papel carregar para não abrir o app errado por um instante.
  if (session && (role === null || carregandoPerfil)) return <Carregando />;

  let conteudo = <AuthNavigator />;
  if (session) conteudo = role === 'motorista' ? <MotoristaNavigator /> : <MainNavigator />;

  return <NavigationContainer>{conteudo}</NavigationContainer>;
}

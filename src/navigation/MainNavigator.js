import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/DashboardScreen';

import FinanceiroHomeScreen from '../screens/financeiro/FinanceiroHomeScreen';
import ReceitasScreen from '../screens/financeiro/ReceitasScreen';
import DespesasScreen from '../screens/financeiro/DespesasScreen';
import FluxoDeCaixaScreen from '../screens/financeiro/FluxoDeCaixaScreen';

import FrotaHomeScreen from '../screens/frota/FrotaHomeScreen';
import VeiculoDetalhesScreen from '../screens/frota/VeiculoDetalhesScreen';
import MotoristasScreen from '../screens/frota/MotoristasScreen';
import ViagensScreen from '../screens/frota/ViagensScreen';
import AbastecimentosScreen from '../screens/frota/AbastecimentosScreen';
import ManutencoesScreen from '../screens/frota/ManutencoesScreen';
import DocumentosScreen from '../screens/frota/DocumentosScreen';

import PerfilScreen from '../screens/outros/PerfilScreen';
import ConfiguracoesScreen from '../screens/outros/ConfiguracoesScreen';

import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();
const FinanceiroStack = createNativeStackNavigator();
const FrotaStack = createNativeStackNavigator();
const MaisStack = createNativeStackNavigator();

const stackOptions = { headerShown: false, contentStyle: { backgroundColor: colors.background } };

function FinanceiroStackNavigator() {
  return (
    <FinanceiroStack.Navigator screenOptions={stackOptions}>
      <FinanceiroStack.Screen name="FinanceiroHome" component={FinanceiroHomeScreen} />
      <FinanceiroStack.Screen name="Receitas" component={ReceitasScreen} />
      <FinanceiroStack.Screen name="Despesas" component={DespesasScreen} />
      <FinanceiroStack.Screen name="FluxoDeCaixa" component={FluxoDeCaixaScreen} />
    </FinanceiroStack.Navigator>
  );
}

function FrotaStackNavigator() {
  return (
    <FrotaStack.Navigator screenOptions={stackOptions}>
      <FrotaStack.Screen name="FrotaHome" component={FrotaHomeScreen} />
      <FrotaStack.Screen name="VeiculoDetalhes" component={VeiculoDetalhesScreen} />
      <FrotaStack.Screen name="Motoristas" component={MotoristasScreen} />
      <FrotaStack.Screen name="Viagens" component={ViagensScreen} />
      <FrotaStack.Screen name="Abastecimentos" component={AbastecimentosScreen} />
      <FrotaStack.Screen name="Manutencoes" component={ManutencoesScreen} />
      <FrotaStack.Screen name="Documentos" component={DocumentosScreen} />
    </FrotaStack.Navigator>
  );
}

function MaisStackNavigator() {
  return (
    <MaisStack.Navigator screenOptions={stackOptions}>
      <MaisStack.Screen name="Perfil" component={PerfilScreen} />
      <MaisStack.Screen name="Configuracoes" component={ConfiguracoesScreen} />
    </MaisStack.Navigator>
  );
}

const ICONS = { Inicio: '🏠', Financeiro: '💰', Frota: '🚚', Mais: '⚙️' };

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarIcon: () => <Text style={{ fontSize: 18 }}>{ICONS[route.name]}</Text>,
      })}
    >
      <Tab.Screen name="Inicio" component={DashboardScreen} options={{ title: 'Início' }} />
      <Tab.Screen name="Financeiro" component={FinanceiroStackNavigator} />
      <Tab.Screen name="Frota" component={FrotaStackNavigator} />
      <Tab.Screen name="Mais" component={MaisStackNavigator} />
    </Tab.Navigator>
  );
}

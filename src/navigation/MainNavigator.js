import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/DashboardScreen';

import FinanceiroHomeScreen from '../screens/financeiro/FinanceiroHomeScreen';
import ReceitasScreen from '../screens/financeiro/ReceitasScreen';
import DespesasScreen from '../screens/financeiro/DespesasScreen';
import FluxoDeCaixaScreen from '../screens/financeiro/FluxoDeCaixaScreen';
import NovaReceitaScreen from '../screens/financeiro/NovaReceitaScreen';
import NovaDespesaScreen from '../screens/financeiro/NovaDespesaScreen';
import ContasScreen from '../screens/financeiro/ContasScreen';
import NovaContaScreen from '../screens/financeiro/NovaContaScreen';
import EditarContaScreen from '../screens/financeiro/EditarContaScreen';
import CategoriasScreen from '../screens/financeiro/CategoriasScreen';
import NovaCategoriaScreen from '../screens/financeiro/NovaCategoriaScreen';
import EditarCategoriaScreen from '../screens/financeiro/EditarCategoriaScreen';
import RelatoriosScreen from '../screens/financeiro/RelatoriosScreen';
import RelatorioDetalhadoScreen from '../screens/financeiro/RelatorioDetalhadoScreen';
import FiltrosRelatorioScreen from '../screens/financeiro/FiltrosRelatorioScreen';

import FrotaHomeScreen from '../screens/frota/FrotaHomeScreen';
import VeiculoDetalhesScreen from '../screens/frota/VeiculoDetalhesScreen';
import MotoristasScreen from '../screens/frota/MotoristasScreen';
import ViagensScreen from '../screens/frota/ViagensScreen';
import AbastecimentosScreen from '../screens/frota/AbastecimentosScreen';
import ManutencoesScreen from '../screens/frota/ManutencoesScreen';
import DocumentosScreen from '../screens/frota/DocumentosScreen';
import NovoVeiculoScreen from '../screens/frota/NovoVeiculoScreen';
import EditarVeiculoScreen from '../screens/frota/EditarVeiculoScreen';
import NovoMotoristaScreen from '../screens/frota/NovoMotoristaScreen';
import EditarMotoristaScreen from '../screens/frota/EditarMotoristaScreen';
import NovaViagemScreen from '../screens/frota/NovaViagemScreen';
import EditarViagemScreen from '../screens/frota/EditarViagemScreen';
import NovoAbastecimentoScreen from '../screens/frota/NovoAbastecimentoScreen';
import EditarAbastecimentoScreen from '../screens/frota/EditarAbastecimentoScreen';
import NovaManutencaoScreen from '../screens/frota/NovaManutencaoScreen';
import EditarManutencaoScreen from '../screens/frota/EditarManutencaoScreen';
import NovoDocumentoScreen from '../screens/frota/NovoDocumentoScreen';
import EditarDocumentoScreen from '../screens/frota/EditarDocumentoScreen';

import PerfilScreen from '../screens/outros/PerfilScreen';
import ConfiguracoesScreen from '../screens/outros/ConfiguracoesScreen';
import EditarPerfilScreen from '../screens/outros/EditarPerfilScreen';
import AlterarSenhaScreen from '../screens/outros/AlterarSenhaScreen';

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
      <FinanceiroStack.Screen name="NovaReceita" component={NovaReceitaScreen} options={{ presentation: 'modal' }} />
      <FinanceiroStack.Screen name="NovaDespesa" component={NovaDespesaScreen} options={{ presentation: 'modal' }} />
      <FinanceiroStack.Screen name="Contas" component={ContasScreen} />
      <FinanceiroStack.Screen name="NovaConta" component={NovaContaScreen} options={{ presentation: 'modal' }} />
      <FinanceiroStack.Screen name="EditarConta" component={EditarContaScreen} options={{ presentation: 'modal' }} />
      <FinanceiroStack.Screen name="Categorias" component={CategoriasScreen} />
      <FinanceiroStack.Screen name="NovaCategoria" component={NovaCategoriaScreen} options={{ presentation: 'modal' }} />
      <FinanceiroStack.Screen name="EditarCategoria" component={EditarCategoriaScreen} options={{ presentation: 'modal' }} />
      <FinanceiroStack.Screen name="Relatorios" component={RelatoriosScreen} />
      <FinanceiroStack.Screen name="RelatorioDetalhado" component={RelatorioDetalhadoScreen} />
      <FinanceiroStack.Screen name="FiltrosRelatorio" component={FiltrosRelatorioScreen} options={{ presentation: 'modal' }} />
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
      <FrotaStack.Screen name="NovoVeiculo" component={NovoVeiculoScreen} options={{ presentation: 'modal' }} />
      <FrotaStack.Screen name="EditarVeiculo" component={EditarVeiculoScreen} options={{ presentation: 'modal' }} />
      <FrotaStack.Screen name="NovoMotorista" component={NovoMotoristaScreen} options={{ presentation: 'modal' }} />
      <FrotaStack.Screen name="EditarMotorista" component={EditarMotoristaScreen} options={{ presentation: 'modal' }} />
      <FrotaStack.Screen name="NovaViagem" component={NovaViagemScreen} options={{ presentation: 'modal' }} />
      <FrotaStack.Screen name="EditarViagem" component={EditarViagemScreen} options={{ presentation: 'modal' }} />
      <FrotaStack.Screen name="NovoAbastecimento" component={NovoAbastecimentoScreen} options={{ presentation: 'modal' }} />
      <FrotaStack.Screen name="EditarAbastecimento" component={EditarAbastecimentoScreen} options={{ presentation: 'modal' }} />
      <FrotaStack.Screen name="NovaManutencao" component={NovaManutencaoScreen} options={{ presentation: 'modal' }} />
      <FrotaStack.Screen name="EditarManutencao" component={EditarManutencaoScreen} options={{ presentation: 'modal' }} />
      <FrotaStack.Screen name="NovoDocumento" component={NovoDocumentoScreen} options={{ presentation: 'modal' }} />
      <FrotaStack.Screen name="EditarDocumento" component={EditarDocumentoScreen} options={{ presentation: 'modal' }} />
    </FrotaStack.Navigator>
  );
}

function MaisStackNavigator() {
  return (
    <MaisStack.Navigator screenOptions={stackOptions}>
      <MaisStack.Screen name="Perfil" component={PerfilScreen} />
      <MaisStack.Screen name="Configuracoes" component={ConfiguracoesScreen} />
      <MaisStack.Screen name="EditarPerfil" component={EditarPerfilScreen} options={{ presentation: 'modal' }} />
      <MaisStack.Screen name="AlterarSenha" component={AlterarSenhaScreen} options={{ presentation: 'modal' }} />
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

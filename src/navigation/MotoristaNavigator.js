import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MotoristaProvider } from '../contexts/MotoristaContext';
import MinhasViagensScreen from '../screens/motorista/MinhasViagensScreen';
import ViagemMotoristaScreen from '../screens/motorista/ViagemMotoristaScreen';
import AbastecerScreen from '../screens/motorista/AbastecerScreen';
import MotoristaPerfilScreen from '../screens/motorista/MotoristaPerfilScreen';
import { colors } from '../theme/colors';

// App do Motorista: navegação própria (como o Portal do Motorista), em
// vez das abas do administrador. Quem decide qual app abre é o papel
// (role) do perfil — ver RootNavigator.
const Tab = createBottomTabNavigator();
const ViagensStack = createNativeStackNavigator();
const stackOptions = { headerShown: false, contentStyle: { backgroundColor: colors.background } };

function ViagensStackNavigator() {
  return (
    <ViagensStack.Navigator screenOptions={stackOptions}>
      <ViagensStack.Screen name="MinhasViagens" component={MinhasViagensScreen} />
      <ViagensStack.Screen name="ViagemMotorista" component={ViagemMotoristaScreen} />
    </ViagensStack.Navigator>
  );
}

const ICONS = { Viagens: '🚚', Abastecer: '⛽', Perfil: '👤' };

export default function MotoristaNavigator() {
  return (
    <MotoristaProvider>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>{ICONS[route.name]}</Text>,
        })}
      >
        <Tab.Screen name="Viagens" component={ViagensStackNavigator} options={{ title: 'Minhas viagens' }} />
        <Tab.Screen name="Abastecer" component={AbastecerScreen} />
        <Tab.Screen name="Perfil" component={MotoristaPerfilScreen} />
      </Tab.Navigator>
    </MotoristaProvider>
  );
}

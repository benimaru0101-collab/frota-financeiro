import { Ionicons } from '@expo/vector-icons';
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

const ICONS = {
  Viagens: ['map', 'map-outline'],
  Abastecer: ['speedometer', 'speedometer-outline'],
  Perfil: ['person-circle', 'person-circle-outline'],
};

export default function MotoristaNavigator() {
  return (
    <MotoristaProvider>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 64, paddingBottom: 8, paddingTop: 6 },
          tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={ICONS[route.name][focused ? 0 : 1]} size={size} color={color} />
          ),
        })}
      >
        <Tab.Screen name="Viagens" component={ViagensStackNavigator} options={{ title: 'Minhas viagens' }} />
        <Tab.Screen name="Abastecer" component={AbastecerScreen} />
        <Tab.Screen name="Perfil" component={MotoristaPerfilScreen} />
      </Tab.Navigator>
    </MotoristaProvider>
  );
}

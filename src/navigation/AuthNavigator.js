import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/auth/SplashScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import CadastroScreen from '../screens/auth/CadastroScreen';
import RecuperarSenhaScreen from '../screens/auth/RecuperarSenhaScreen';
import CodigoVerificacaoScreen from '../screens/auth/CodigoVerificacaoScreen';
import NovaSenhaScreen from '../screens/auth/NovaSenhaScreen';
import AuthSuccessScreen from '../screens/auth/AuthSuccessScreen';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Cadastro" component={CadastroScreen} />
      <Stack.Screen name="RecuperarSenha" component={RecuperarSenhaScreen} />
      <Stack.Screen name="CodigoVerificacao" component={CodigoVerificacaoScreen} />
      <Stack.Screen name="NovaSenha" component={NovaSenhaScreen} />
      <Stack.Screen name="AuthSuccess" component={AuthSuccessScreen} />
    </Stack.Navigator>
  );
}

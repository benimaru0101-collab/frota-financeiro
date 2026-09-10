import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Screen, Title, Subtitle, Label, Input, PrimaryButton, GoogleButton } from '../../components/UI';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing } from '../../theme/colors';

export default function CadastroScreen({ navigation }) {
  const { signUpWithEmail, signInWithGoogle } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCadastro() {
    if (senha !== confirmar) {
      Alert.alert('As senhas não coincidem');
      return;
    }
    setLoading(true);
    try {
      await signUpWithEmail(email, senha, nome);
      navigation.replace('AuthSuccess');
    } catch (e) {
      Alert.alert('Não foi possível cadastrar', e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    try {
      const result = await signInWithGoogle();
      if (result.type === 'success') navigation.replace('AuthSuccess');
    } catch (e) {
      Alert.alert('Login com Google falhou', e.message);
    }
  }

  return (
    <Screen>
      <View style={{ marginTop: spacing.xl }}>
        <Title>Criar conta</Title>
        <Subtitle>Preencha seus dados abaixo</Subtitle>
      </View>

      <View style={{ marginTop: spacing.xl }}>
        <Label>Nome completo</Label>
        <Input placeholder="Seu nome" value={nome} onChangeText={setNome} />
        <Label>E-mail</Label>
        <Input placeholder="seu@email.com" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <Label>Senha</Label>
        <Input placeholder="••••••••" secureTextEntry value={senha} onChangeText={setSenha} />
        <Label>Confirmar senha</Label>
        <Input placeholder="••••••••" secureTextEntry value={confirmar} onChangeText={setConfirmar} />

        <PrimaryButton title="Cadastrar" onPress={handleCadastro} loading={loading} />
        <GoogleButton title="Cadastrar com Google" onPress={handleGoogle} />

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: spacing.lg, alignItems: 'center' }}>
          <Text style={styles.footerText}>Já tem uma conta? <Text style={styles.link}>Entrar</Text></Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  link: { color: colors.primary, fontWeight: '600' },
  footerText: { color: colors.textMuted },
});

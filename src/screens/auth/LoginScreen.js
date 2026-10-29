import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Screen, Title, Subtitle, Label, Input, PrimaryButton, GoogleButton } from '../../components/UI';
import { useAuth } from '../../contexts/AuthContext';
import { colors, spacing } from '../../theme/colors';
import { APP, EH_APP_MOTORISTA } from '../../config/app';

export default function LoginScreen({ navigation }) {
  const { signInWithEmail, signInWithGoogle, entrarDemoMotorista } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
      await signInWithEmail(email, senha);
      navigation.replace('AuthSuccess');
    } catch (e) {
      Alert.alert('Não foi possível entrar', e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.type === 'success') navigation.replace('AuthSuccess');
    } catch (e) {
      Alert.alert('Login com Google falhou', e.message);
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <Screen>
      <View style={{ marginTop: spacing.xl }}>
        <Title>{APP.nome}</Title>
        <Subtitle>{EH_APP_MOTORISTA ? 'Entre para ver suas viagens' : 'Faça login para gerenciar a frota'}</Subtitle>
      </View>

      <View style={{ marginTop: spacing.xl }}>
        <Label>E-mail</Label>
        <Input placeholder="seu@email.com" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <Label>Senha</Label>
        <Input placeholder="••••••••" secureTextEntry value={senha} onChangeText={setSenha} />

        <TouchableOpacity onPress={() => navigation.navigate('RecuperarSenha')} style={{ alignSelf: 'flex-end', marginBottom: spacing.md }}>
          <Text style={styles.link}>Esqueceu a senha?</Text>
        </TouchableOpacity>

        <PrimaryButton title="Entrar" onPress={handleLogin} loading={loading} />
        <GoogleButton title="Entrar com Google" onPress={handleGoogleLogin} loading={googleLoading} />

        {EH_APP_MOTORISTA && (
          <TouchableOpacity onPress={entrarDemoMotorista} style={{ marginTop: spacing.md, alignItems: 'center' }}>
            <Text style={styles.link}>Ver demonstração (sem conta)</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => navigation.navigate('Cadastro')} style={{ marginTop: spacing.lg, alignItems: 'center' }}>
          <Text style={styles.footerText}>Já tem uma conta? <Text style={styles.link}>Cadastre-se</Text></Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  link: { color: colors.primary, fontWeight: '600' },
  footerText: { color: colors.textMuted },
});

import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Screen, Title, Subtitle, Label, Input, PrimaryButton } from '../../components/UI';
import { supabase } from '../../lib/supabase';
import { spacing } from '../../theme/colors';

export default function NovaSenhaScreen({ navigation }) {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAlterar() {
    if (novaSenha !== confirmar) {
      Alert.alert('As senhas não coincidem');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: novaSenha });
      if (error) throw error;
      navigation.navigate('Login');
    } catch (e) {
      Alert.alert('Não foi possível alterar a senha', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={{ marginTop: spacing.xl }}>
        <Title>Nova senha</Title>
        <Subtitle>Crie uma nova senha para sua conta</Subtitle>
      </View>
      <View style={{ marginTop: spacing.xl }}>
        <Label>Nova senha</Label>
        <Input placeholder="••••••••" secureTextEntry value={novaSenha} onChangeText={setNovaSenha} />
        <Label>Confirmar nova senha</Label>
        <Input placeholder="••••••••" secureTextEntry value={confirmar} onChangeText={setConfirmar} />
        <PrimaryButton title="Alterar senha" onPress={handleAlterar} loading={loading} />
      </View>
    </Screen>
  );
}

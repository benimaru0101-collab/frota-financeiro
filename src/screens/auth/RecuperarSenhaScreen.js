import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Screen, Title, Subtitle, Label, Input, PrimaryButton } from '../../components/UI';
import { useAuth } from '../../contexts/AuthContext';
import { spacing } from '../../theme/colors';

export default function RecuperarSenhaScreen({ navigation }) {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleEnviar() {
    setLoading(true);
    try {
      await sendPasswordReset(email);
      navigation.navigate('CodigoVerificacao', { email });
    } catch (e) {
      Alert.alert('Não foi possível enviar', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={{ marginTop: spacing.xl }}>
        <Title>Recuperar senha</Title>
        <Subtitle>Informe seu e-mail para receber o código de recuperação</Subtitle>
      </View>
      <View style={{ marginTop: spacing.xl }}>
        <Label>E-mail</Label>
        <Input placeholder="seu@email.com" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <PrimaryButton title="Enviar código" onPress={handleEnviar} loading={loading} />
      </View>
    </Screen>
  );
}

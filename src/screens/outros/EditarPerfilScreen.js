import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Screen, Title, Subtitle, Label, Input, PrimaryButton } from '../../components/UI';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { spacing } from '../../theme/colors';

export default function EditarPerfilScreen({ navigation }) {
  const { user } = useAuth();
  const [nome, setNome] = useState(user?.user_metadata?.full_name ?? '');
  const [loading, setLoading] = useState(false);

  async function handleSalvar() {
    if (!nome.trim()) {
      Alert.alert('Informe seu nome');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: { full_name: nome.trim() } });
      if (error) throw error;
      // O AuthContext escuta onAuthStateChange, então a sessão (e o
      // nome exibido no Dashboard/Perfil) é atualizada automaticamente.
      navigation.goBack();
    } catch (e) {
      Alert.alert('Não foi possível salvar', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <View style={{ marginTop: spacing.xl }}>
        <Title>Editar Perfil</Title>
        <Subtitle>Atualize suas informações</Subtitle>
      </View>

      <View style={{ marginTop: spacing.xl }}>
        <Label>Nome completo</Label>
        <Input placeholder="Seu nome" value={nome} onChangeText={setNome} />
        <Label>E-mail</Label>
        <Input value={user?.email ?? ''} editable={false} style={{ opacity: 0.6 }} />
        <PrimaryButton title="Salvar Alterações" onPress={handleSalvar} loading={loading} />
      </View>
    </Screen>
  );
}

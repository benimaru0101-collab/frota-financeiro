import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Screen, Title, Subtitle, Label, Input, PrimaryButton } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { spacing } from '../../theme/colors';

export default function NovoMotoristaScreen({ navigation }) {
  const { addMotorista } = useData();
  const [nome, setNome] = useState('');
  const [cnh, setCnh] = useState('');

  function handleSalvar() {
    if (!nome.trim()) {
      Alert.alert('Preencha o nome do motorista');
      return;
    }
    addMotorista({ nome: nome.trim(), cnh: cnh.trim() || 'CNH: não informada' });
    navigation.goBack();
  }

  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Novo Motorista</Title>
        <Subtitle>Cadastre um motorista da frota</Subtitle>
      </View>

      <View style={{ marginTop: spacing.xl }}>
        <Label>Nome completo</Label>
        <Input placeholder="Nome do motorista" value={nome} onChangeText={setNome} />
        <Label>CNH (categoria e validade)</Label>
        <Input placeholder="Ex.: CNH E 22/09/1" value={cnh} onChangeText={setCnh} />
        <PrimaryButton title="Salvar Motorista" onPress={handleSalvar} />
      </View>
    </Screen>
  );
}

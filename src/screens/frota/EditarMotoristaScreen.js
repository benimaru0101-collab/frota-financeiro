import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Screen, Title, Subtitle, Label, Input, PrimaryButton, SecondaryButton, ChipSelect } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { colors, spacing } from '../../theme/colors';

export default function EditarMotoristaScreen({ route, navigation }) {
  const { updateMotorista, deleteMotorista } = useData();
  const motorista = route?.params?.motorista;

  const [nome, setNome] = useState(motorista?.nome ?? '');
  const [cnh, setCnh] = useState(motorista?.cnh ?? '');
  const [status, setStatus] = useState(motorista?.status ?? 'Ativo');

  if (!motorista) {
    // Tela acessada sem um motorista válido (ex.: deep link direto) —
    // evita quebrar o app com propriedades undefined.
    return (
      <Screen>
        <View style={{ marginTop: spacing.xl }}>
          <Title>Motorista não encontrado</Title>
          <SecondaryButton title="Voltar" onPress={() => navigation.goBack()} style={{ marginTop: spacing.lg }} />
        </View>
      </Screen>
    );
  }

  function handleSalvar() {
    if (!nome.trim()) {
      Alert.alert('Preencha o nome do motorista');
      return;
    }
    updateMotorista(motorista.id, {
      nome: nome.trim(),
      cnh: cnh.trim() || 'CNH: não informada',
      status,
    });
    navigation.goBack();
  }

  function handleExcluir() {
    Alert.alert('Excluir motorista', `Tem certeza que deseja excluir ${motorista.nome}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          deleteMotorista(motorista.id);
          navigation.popToTop();
        },
      },
    ]);
  }

  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Editar Motorista</Title>
        <Subtitle>Atualize os dados de {motorista.nome}</Subtitle>
      </View>

      <View style={{ marginTop: spacing.xl }}>
        <Label>Nome completo</Label>
        <Input placeholder="Nome do motorista" value={nome} onChangeText={setNome} />
        <Label>CNH (categoria e validade)</Label>
        <Input placeholder="Ex.: CNH E 22/09/1" value={cnh} onChangeText={setCnh} />
        <Label>Status</Label>
        <ChipSelect options={['Ativo', 'Inativo']} value={status} onChange={setStatus} />

        <PrimaryButton title="Salvar Alterações" onPress={handleSalvar} />
        <SecondaryButton
          title="Excluir Motorista"
          onPress={handleExcluir}
          style={{ marginTop: spacing.sm, borderColor: colors.danger }}
        />
      </View>
    </Screen>
  );
}

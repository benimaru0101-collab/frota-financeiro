import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Screen, Title, Subtitle, Label, Input, PrimaryButton, SecondaryButton, ChipSelect } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { colors, spacing } from '../../theme/colors';

const TIPOS = ['Cavalo Mecânico', 'Carreta', 'Truck', 'Van'];

export default function EditarVeiculoScreen({ route, navigation }) {
  const { updateVeiculo, deleteVeiculo } = useData();
  const veiculo = route?.params?.veiculo;

  const [placa, setPlaca] = useState(veiculo?.placa ?? '');
  const [modelo, setModelo] = useState(veiculo?.modelo ?? '');
  const [tipo, setTipo] = useState(veiculo?.tipo ?? TIPOS[0]);
  const [km, setKm] = useState((veiculo?.km ?? '').replace(/\s*km\s*$/i, ''));
  const [status, setStatus] = useState(veiculo?.status ?? 'Ativo');

  if (!veiculo) {
    // Tela acessada sem um veículo válido (ex.: deep link direto) —
    // evita quebrar o app com propriedades undefined.
    return (
      <Screen scroll>
        <View style={{ marginTop: spacing.xl }}>
          <Title>Veículo não encontrado</Title>
          <SecondaryButton title="Voltar" onPress={() => navigation.goBack()} style={{ marginTop: spacing.lg }} />
        </View>
      </Screen>
    );
  }

  function handleSalvar() {
    if (!placa.trim() || !modelo.trim()) {
      Alert.alert('Preencha ao menos a placa e o modelo');
      return;
    }
    updateVeiculo(veiculo.id, {
      placa: placa.trim().toUpperCase(),
      modelo: modelo.trim(),
      tipo,
      status,
      km: km.trim() ? `${km.trim()} km` : '0 km',
    });
    navigation.goBack();
  }

  function handleExcluir() {
    Alert.alert('Excluir veículo', `Tem certeza que deseja excluir ${veiculo.placa}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          deleteVeiculo(veiculo.id);
          navigation.popToTop();
        },
      },
    ]);
  }

  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Editar Veículo</Title>
        <Subtitle>Atualize os dados de {veiculo.placa}</Subtitle>
      </View>

      <View style={{ marginTop: spacing.xl }}>
        <Label>Placa</Label>
        <Input placeholder="ABC-1234" autoCapitalize="characters" value={placa} onChangeText={setPlaca} />
        <Label>Modelo</Label>
        <Input placeholder="Ex.: Volvo FH 540" value={modelo} onChangeText={setModelo} />
        <Label>Tipo</Label>
        <ChipSelect options={TIPOS} value={tipo} onChange={setTipo} />
        <Label>Status</Label>
        <ChipSelect options={['Ativo', 'Manutenção', 'Inativo']} value={status} onChange={setStatus} />
        <Label>Quilometragem atual</Label>
        <Input placeholder="0" keyboardType="numeric" value={km} onChangeText={setKm} />

        <PrimaryButton title="Salvar Alterações" onPress={handleSalvar} />
        <SecondaryButton
          title="Excluir Veículo"
          onPress={handleExcluir}
          style={{ marginTop: spacing.sm, borderColor: colors.danger }}
        />
      </View>
    </Screen>
  );
}

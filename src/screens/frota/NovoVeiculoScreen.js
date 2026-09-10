import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Screen, Title, Subtitle, Label, Input, PrimaryButton, ChipSelect } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { spacing } from '../../theme/colors';

const TIPOS = ['Cavalo Mecânico', 'Carreta', 'Truck', 'Van'];

export default function NovoVeiculoScreen({ navigation }) {
  const { addVeiculo } = useData();
  const [placa, setPlaca] = useState('');
  const [modelo, setModelo] = useState('');
  const [tipo, setTipo] = useState(TIPOS[0]);
  const [km, setKm] = useState('');

  function handleSalvar() {
    if (!placa.trim() || !modelo.trim()) {
      Alert.alert('Preencha ao menos a placa e o modelo');
      return;
    }
    addVeiculo({
      placa: placa.trim().toUpperCase(),
      modelo: modelo.trim(),
      tipo,
      km: km.trim() ? `${km.trim()} km` : '0 km',
    });
    navigation.goBack();
  }

  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Novo Veículo</Title>
        <Subtitle>Cadastre um veículo na frota</Subtitle>
      </View>

      <View style={{ marginTop: spacing.xl }}>
        <Label>Placa</Label>
        <Input placeholder="ABC-1234" autoCapitalize="characters" value={placa} onChangeText={setPlaca} />
        <Label>Modelo</Label>
        <Input placeholder="Ex.: Volvo FH 540" value={modelo} onChangeText={setModelo} />
        <Label>Tipo</Label>
        <ChipSelect options={TIPOS} value={tipo} onChange={setTipo} />
        <Label>Quilometragem atual</Label>
        <Input placeholder="0" keyboardType="numeric" value={km} onChangeText={setKm} />
        <PrimaryButton title="Salvar Veículo" onPress={handleSalvar} />
      </View>
    </Screen>
  );
}

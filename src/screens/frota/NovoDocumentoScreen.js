import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { Screen, Title, Subtitle, Label, Input, PrimaryButton, ChipSelect } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { spacing, colors } from '../../theme/colors';

const TIPOS = ['Seguro', 'IPVA', 'Licenciamento', 'Outro'];

export default function NovoDocumentoScreen({ navigation }) {
  const { addDocumento, veiculos } = useData();
  const [placa, setPlaca] = useState(veiculos[0]?.placa ?? '');
  const [tipo, setTipo] = useState(TIPOS[0]);
  const [vencimento, setVencimento] = useState('');

  function handleSalvar() {
    if (!placa || !vencimento.trim()) {
      Alert.alert('Preencha o veículo e a data de vencimento');
      return;
    }
    addDocumento({ placa, tipo, vencimento: vencimento.trim() });
    navigation.goBack();
  }

  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Novo Documento</Title>
        <Subtitle>Registre um documento do veículo</Subtitle>
      </View>

      <View style={{ marginTop: spacing.xl }}>
        <Label>Veículo</Label>
        {veiculos.length > 0 ? (
          <ChipSelect options={veiculos.map((v) => v.placa)} value={placa} onChange={setPlaca} />
        ) : (
          <Text style={{ color: colors.textMuted, marginBottom: spacing.md }}>Cadastre um veículo primeiro.</Text>
        )}
        <Label>Tipo de documento</Label>
        <ChipSelect options={TIPOS} value={tipo} onChange={setTipo} />
        <Label>Vencimento</Label>
        <Input placeholder="DD/MM/AAAA" value={vencimento} onChangeText={setVencimento} />
        <PrimaryButton title="Salvar Documento" onPress={handleSalvar} />
      </View>
    </Screen>
  );
}

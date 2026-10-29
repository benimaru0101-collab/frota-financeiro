import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { Screen, Title, Subtitle, Label, Input, PrimaryButton, ChipSelect } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { spacing, colors } from '../../theme/colors';

function formatarValor(texto) {
  const limpo = texto.trim();
  if (!limpo) return limpo;
  return limpo.startsWith('R$') ? limpo : `R$ ${limpo}`;
}

export default function NovaManutencaoScreen({ navigation }) {
  const { addManutencao, veiculos } = useData();
  const [placa, setPlaca] = useState(veiculos[0]?.placa ?? '');
  const [tipo, setTipo] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState('');

  function handleSalvar() {
    if (!placa || !tipo.trim() || !valor.trim()) {
      Alert.alert('Preencha o veículo, o tipo e o valor');
      return;
    }
    addManutencao({
      placa,
      tipo: tipo.trim(),
      valor: formatarValor(valor),
      data: data.trim() || new Date().toLocaleDateString('pt-BR'),
    });
    navigation.goBack();
  }

  return (
    <Screen scroll>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Nova Manutenção</Title>
        <Subtitle>Registre uma manutenção</Subtitle>
      </View>

      <View style={{ marginTop: spacing.xl }}>
        <Label>Veículo</Label>
        {veiculos.length > 0 ? (
          <ChipSelect options={veiculos.map((v) => v.placa)} value={placa} onChange={setPlaca} />
        ) : (
          <Text style={{ color: colors.textMuted, marginBottom: spacing.md }}>Cadastre um veículo primeiro.</Text>
        )}
        <Label>Tipo de manutenção</Label>
        <Input placeholder="Ex.: Preventiva - Freios" value={tipo} onChangeText={setTipo} />
        <Label>Valor</Label>
        <Input placeholder="0,00" keyboardType="decimal-pad" value={valor} onChangeText={setValor} />
        <Label>Data</Label>
        <Input placeholder="DD/MM/AAAA" value={data} onChangeText={setData} />
        <PrimaryButton title="Salvar Manutenção" onPress={handleSalvar} />
      </View>
    </Screen>
  );
}

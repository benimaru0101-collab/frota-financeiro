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

export default function NovoAbastecimentoScreen({ navigation }) {
  const { addAbastecimento, veiculos } = useData();
  const [placa, setPlaca] = useState(veiculos[0]?.placa ?? '');
  const [litros, setLitros] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState('');

  function handleSalvar() {
    if (!placa || !litros.trim() || !valor.trim()) {
      Alert.alert('Preencha o veículo, os litros e o valor');
      return;
    }
    addAbastecimento({
      placa,
      litros: `${litros.trim()} L`,
      valor: formatarValor(valor),
      data: data.trim() || new Date().toLocaleDateString('pt-BR'),
    });
    navigation.goBack();
  }

  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Novo Abastecimento</Title>
        <Subtitle>Registre um abastecimento</Subtitle>
      </View>

      <View style={{ marginTop: spacing.xl }}>
        <Label>Veículo</Label>
        {veiculos.length > 0 ? (
          <ChipSelect options={veiculos.map((v) => v.placa)} value={placa} onChange={setPlaca} />
        ) : (
          <Text style={{ color: colors.textMuted, marginBottom: spacing.md }}>Cadastre um veículo primeiro.</Text>
        )}
        <Label>Litros</Label>
        <Input placeholder="0" keyboardType="decimal-pad" value={litros} onChangeText={setLitros} />
        <Label>Valor</Label>
        <Input placeholder="0,00" keyboardType="decimal-pad" value={valor} onChangeText={setValor} />
        <Label>Data</Label>
        <Input placeholder="DD/MM/AAAA" value={data} onChangeText={setData} />
        <PrimaryButton title="Salvar Abastecimento" onPress={handleSalvar} />
      </View>
    </Screen>
  );
}

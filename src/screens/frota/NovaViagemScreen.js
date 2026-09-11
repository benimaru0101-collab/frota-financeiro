import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Screen, Title, Subtitle, Label, Input, PrimaryButton, ChipSelect } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { spacing, colors } from '../../theme/colors';
import { Text } from 'react-native';

function formatarValor(texto) {
  const limpo = texto.trim();
  if (!limpo) return limpo;
  return limpo.startsWith('R$') ? limpo : `R$ ${limpo}`;
}

export default function NovaViagemScreen({ navigation }) {
  const { addViagem, veiculos, motoristas } = useData();
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [placa, setPlaca] = useState(veiculos[0]?.placa ?? '');
  const [motorista, setMotorista] = useState(motoristas[0]?.nome ?? '');
  const [data, setData] = useState('');
  const [valor, setValor] = useState('');

  function handleSalvar() {
    if (!origem.trim() || !destino.trim() || !placa) {
      Alert.alert('Preencha origem, destino e selecione o veículo');
      return;
    }
    addViagem({
      origemDestino: `${origem.trim()} - ${destino.trim()}`,
      placa,
      motorista: motorista || 'Não informado',
      data: data.trim() || new Date().toLocaleDateString('pt-BR'),
      valor: formatarValor(valor) || 'R$ 0,00',
    });
    navigation.goBack();
  }

  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Nova Viagem</Title>
        <Subtitle>Registre uma viagem realizada</Subtitle>
      </View>

      <View style={{ marginTop: spacing.xl }}>
        <Label>Origem</Label>
        <Input placeholder="Cidade de origem" value={origem} onChangeText={setOrigem} />
        <Label>Destino</Label>
        <Input placeholder="Cidade de destino" value={destino} onChangeText={setDestino} />

        <Label>Veículo</Label>
        {veiculos.length > 0 ? (
          <ChipSelect options={veiculos.map((v) => v.placa)} value={placa} onChange={setPlaca} />
        ) : (
          <Text style={{ color: colors.textMuted, marginBottom: spacing.md }}>Cadastre um veículo primeiro.</Text>
        )}

        <Label>Motorista</Label>
        {motoristas.length > 0 ? (
          <ChipSelect options={motoristas.map((m) => m.nome)} value={motorista} onChange={setMotorista} />
        ) : (
          <Text style={{ color: colors.textMuted, marginBottom: spacing.md }}>Cadastre um motorista primeiro.</Text>
        )}

        <Label>Data</Label>
        <Input placeholder="DD/MM/AAAA" value={data} onChangeText={setData} />
        <Label>Valor</Label>
        <Input placeholder="0,00" keyboardType="decimal-pad" value={valor} onChangeText={setValor} />
        <PrimaryButton title="Salvar Viagem" onPress={handleSalvar} />
      </View>
    </Screen>
  );
}

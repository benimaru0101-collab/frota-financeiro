import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { Screen, Title, Subtitle, Label, Input, PrimaryButton, SecondaryButton, ChipSelect } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { separarOrigemDestino } from '../../utils/data';
import { lerKm } from '../../lib/motorista';
import { spacing, colors } from '../../theme/colors';

function formatarValor(texto) {
  const limpo = texto.trim();
  if (!limpo) return limpo;
  return limpo.startsWith('R$') ? limpo : `R$ ${limpo}`;
}

export default function EditarViagemScreen({ route, navigation }) {
  const { updateViagem, deleteViagem, veiculos, motoristas } = useData();
  const viagem = route?.params?.viagem;
  const iniciais = separarOrigemDestino(viagem?.origemDestino);

  const [origem, setOrigem] = useState(iniciais.origem);
  const [destino, setDestino] = useState(iniciais.destino);
  const [placa, setPlaca] = useState(viagem?.placa ?? veiculos[0]?.placa ?? '');
  const [motorista, setMotorista] = useState(viagem?.motorista ?? motoristas[0]?.nome ?? '');
  const [data, setData] = useState(viagem?.data ?? '');
  const [valor, setValor] = useState((viagem?.valor ?? '').replace(/^R\$\s*/, ''));
  const [kmInicial, setKmInicial] = useState(viagem?.kmInicial != null ? String(viagem.kmInicial) : '');
  const [kmFinal, setKmFinal] = useState(viagem?.kmFinal != null ? String(viagem.kmFinal) : '');

  if (!viagem) {
    return (
      <Screen scroll>
        <View style={{ marginTop: spacing.xl }}>
          <Title>Viagem não encontrada</Title>
          <SecondaryButton title="Voltar" onPress={() => navigation.goBack()} style={{ marginTop: spacing.lg }} />
        </View>
      </Screen>
    );
  }

  function handleSalvar() {
    if (!origem.trim() || !destino.trim() || !placa) {
      Alert.alert('Preencha origem, destino e selecione o veículo');
      return;
    }
    const kmI = lerKm(kmInicial);
    const kmF = lerKm(kmFinal);
    if (kmI != null && kmF != null && kmF < kmI) {
      Alert.alert('KM inválido', 'O KM de chegada não pode ser menor que o KM de saída.');
      return;
    }
    updateViagem(viagem.id, {
      kmInicial: kmI,
      kmFinal: kmF,
      origemDestino: `${origem.trim()} - ${destino.trim()}`,
      placa,
      motorista: motorista || 'Não informado',
      data: data.trim() || viagem.data,
      valor: formatarValor(valor) || viagem.valor,
    });
    navigation.goBack();
  }

  function handleExcluir() {
    Alert.alert('Excluir viagem', `Tem certeza que deseja excluir a viagem ${viagem.origemDestino}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          deleteViagem(viagem.id);
          navigation.popToTop();
        },
      },
    ]);
  }

  return (
    <Screen scroll>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Editar Viagem</Title>
        <Subtitle>Atualize os dados da viagem</Subtitle>
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

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Label>KM de saída</Label>
            <Input placeholder="Ex.: 182450" keyboardType="numeric" value={kmInicial} onChangeText={setKmInicial} />
          </View>
          <View style={{ flex: 1 }}>
            <Label>KM de chegada</Label>
            <Input placeholder="Ex.: 182900" keyboardType="numeric" value={kmFinal} onChangeText={setKmFinal} />
          </View>
        </View>

        <PrimaryButton title="Salvar Alterações" onPress={handleSalvar} />
        <SecondaryButton
          title="Excluir Viagem"
          onPress={handleExcluir}
          style={{ marginTop: spacing.sm, borderColor: colors.danger }}
        />
      </View>
    </Screen>
  );
}

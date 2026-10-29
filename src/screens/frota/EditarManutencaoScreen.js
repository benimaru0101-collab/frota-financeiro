import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { Screen, Title, Subtitle, Label, Input, PrimaryButton, SecondaryButton, ChipSelect } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { spacing, colors } from '../../theme/colors';

function formatarValor(texto) {
  const limpo = texto.trim();
  if (!limpo) return limpo;
  return limpo.startsWith('R$') ? limpo : `R$ ${limpo}`;
}

export default function EditarManutencaoScreen({ route, navigation }) {
  const { updateManutencao, deleteManutencao, veiculos } = useData();
  const manutencao = route?.params?.manutencao;

  const [placa, setPlaca] = useState(manutencao?.placa ?? veiculos[0]?.placa ?? '');
  const [tipo, setTipo] = useState(manutencao?.tipo ?? '');
  const [valor, setValor] = useState((manutencao?.valor ?? '').replace(/^R\$\s*/, ''));
  const [data, setData] = useState(manutencao?.data ?? '');

  if (!manutencao) {
    return (
      <Screen scroll>
        <View style={{ marginTop: spacing.xl }}>
          <Title>Manutenção não encontrada</Title>
          <SecondaryButton title="Voltar" onPress={() => navigation.goBack()} style={{ marginTop: spacing.lg }} />
        </View>
      </Screen>
    );
  }

  function handleSalvar() {
    if (!placa || !tipo.trim() || !valor.trim()) {
      Alert.alert('Preencha o veículo, o tipo e o valor');
      return;
    }
    updateManutencao(manutencao.id, {
      placa,
      tipo: tipo.trim(),
      valor: formatarValor(valor),
      data: data.trim() || manutencao.data,
    });
    navigation.goBack();
  }

  function handleExcluir() {
    Alert.alert('Excluir manutenção', `Tem certeza que deseja excluir a manutenção de ${manutencao.placa}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          deleteManutencao(manutencao.id);
          navigation.popToTop();
        },
      },
    ]);
  }

  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Editar Manutenção</Title>
        <Subtitle>Atualize os dados da manutenção de {manutencao.placa}</Subtitle>
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

        <PrimaryButton title="Salvar Alterações" onPress={handleSalvar} />
        <SecondaryButton
          title="Excluir Manutenção"
          onPress={handleExcluir}
          style={{ marginTop: spacing.sm, borderColor: colors.danger }}
        />
      </View>
    </Screen>
  );
}

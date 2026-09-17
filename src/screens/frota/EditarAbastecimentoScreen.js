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

export default function EditarAbastecimentoScreen({ route, navigation }) {
  const { updateAbastecimento, deleteAbastecimento, veiculos } = useData();
  const abastecimento = route?.params?.abastecimento;

  const [placa, setPlaca] = useState(abastecimento?.placa ?? veiculos[0]?.placa ?? '');
  const [litros, setLitros] = useState((abastecimento?.litros ?? '').replace(/\s*L\s*$/i, ''));
  const [valor, setValor] = useState((abastecimento?.valor ?? '').replace(/^R\$\s*/, ''));
  const [data, setData] = useState(abastecimento?.data ?? '');

  if (!abastecimento) {
    return (
      <Screen>
        <View style={{ marginTop: spacing.xl }}>
          <Title>Abastecimento não encontrado</Title>
          <SecondaryButton title="Voltar" onPress={() => navigation.goBack()} style={{ marginTop: spacing.lg }} />
        </View>
      </Screen>
    );
  }

  function handleSalvar() {
    if (!placa || !litros.trim() || !valor.trim()) {
      Alert.alert('Preencha o veículo, os litros e o valor');
      return;
    }
    updateAbastecimento(abastecimento.id, {
      placa,
      litros: `${litros.trim()} L`,
      valor: formatarValor(valor),
      data: data.trim() || abastecimento.data,
    });
    navigation.goBack();
  }

  function handleExcluir() {
    Alert.alert('Excluir abastecimento', `Tem certeza que deseja excluir o abastecimento de ${abastecimento.placa}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          deleteAbastecimento(abastecimento.id);
          navigation.popToTop();
        },
      },
    ]);
  }

  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Editar Abastecimento</Title>
        <Subtitle>Atualize os dados do abastecimento de {abastecimento.placa}</Subtitle>
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

        <PrimaryButton title="Salvar Alterações" onPress={handleSalvar} />
        <SecondaryButton
          title="Excluir Abastecimento"
          onPress={handleExcluir}
          style={{ marginTop: spacing.sm, borderColor: colors.danger }}
        />
      </View>
    </Screen>
  );
}

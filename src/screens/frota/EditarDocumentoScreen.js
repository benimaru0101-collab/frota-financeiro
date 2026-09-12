import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { Screen, Title, Subtitle, Label, Input, PrimaryButton, SecondaryButton, ChipSelect } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { spacing, colors } from '../../theme/colors';

const TIPOS = ['Seguro', 'IPVA', 'Licenciamento', 'Outro'];

export default function EditarDocumentoScreen({ route, navigation }) {
  const { updateDocumento, deleteDocumento, veiculos } = useData();
  const documento = route?.params?.documento;

  const [placa, setPlaca] = useState(documento?.placa ?? veiculos[0]?.placa ?? '');
  const [tipo, setTipo] = useState(documento?.tipo ?? TIPOS[0]);
  const [vencimento, setVencimento] = useState(documento?.vencimento ?? '');

  if (!documento) {
    return (
      <Screen>
        <View style={{ marginTop: spacing.xl }}>
          <Title>Documento não encontrado</Title>
          <SecondaryButton title="Voltar" onPress={() => navigation.goBack()} style={{ marginTop: spacing.lg }} />
        </View>
      </Screen>
    );
  }

  function handleSalvar() {
    if (!placa || !vencimento.trim()) {
      Alert.alert('Preencha o veículo e a data de vencimento');
      return;
    }
    updateDocumento(documento.id, { placa, tipo, vencimento: vencimento.trim() });
    navigation.goBack();
  }

  function handleExcluir() {
    Alert.alert('Excluir documento', `Tem certeza que deseja excluir ${documento.tipo} de ${documento.placa}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          deleteDocumento(documento.id);
          navigation.popToTop();
        },
      },
    ]);
  }

  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Editar Documento</Title>
        <Subtitle>Atualize os dados do documento de {documento.placa}</Subtitle>
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

        <PrimaryButton title="Salvar Alterações" onPress={handleSalvar} />
        <SecondaryButton
          title="Excluir Documento"
          onPress={handleExcluir}
          style={{ marginTop: spacing.sm, borderColor: colors.danger }}
        />
      </View>
    </Screen>
  );
}

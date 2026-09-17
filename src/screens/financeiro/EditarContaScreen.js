import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Screen, Title, Subtitle, Label, Input, PrimaryButton, SecondaryButton, ChipSelect } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { spacing, colors } from '../../theme/colors';

const TIPOS = ['Bancária', 'Caixa'];

export default function EditarContaScreen({ route, navigation }) {
  const { updateConta, deleteConta } = useData();
  const conta = route?.params?.conta;

  const [nome, setNome] = useState(conta?.nome ?? '');
  const [tipo, setTipo] = useState(TIPOS.includes(conta?.tipo) ? conta.tipo : TIPOS[0]);
  const [banco, setBanco] = useState(conta?.banco ?? '');
  const [saldo, setSaldo] = useState((conta?.saldo ?? '').replace(/^R\$\s*/, ''));
  const [descricao, setDescricao] = useState(conta?.descricao ?? '');

  if (!conta) {
    return (
      <Screen>
        <View style={{ marginTop: spacing.xl }}>
          <Title>Conta não encontrada</Title>
          <SecondaryButton title="Voltar" onPress={() => navigation.goBack()} style={{ marginTop: spacing.lg }} />
        </View>
      </Screen>
    );
  }

  function handleSalvar() {
    if (!nome.trim()) {
      Alert.alert('Preencha o nome da conta');
      return;
    }
    updateConta(conta.id, {
      nome: nome.trim(),
      tipo,
      banco: banco.trim(),
      saldo: saldo.trim() || '0',
      descricao: descricao.trim(),
    });
    navigation.goBack();
  }

  function handleExcluir() {
    Alert.alert('Excluir conta', `Tem certeza que deseja excluir "${conta.nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          deleteConta(conta.id);
          navigation.popToTop();
        },
      },
    ]);
  }

  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Editar Conta</Title>
        <Subtitle>Atualize os dados da conta</Subtitle>
      </View>

      <View style={{ marginTop: spacing.xl }}>
        <Label>Tipo de conta</Label>
        <ChipSelect options={TIPOS} value={tipo} onChange={setTipo} />
        <Label>Nome da conta</Label>
        <Input placeholder="Ex.: Banco do Brasil, Caixinha" value={nome} onChangeText={setNome} />
        <Label>Banco / Instituição (opcional)</Label>
        <Input placeholder="Ex.: Banco do Brasil" value={banco} onChangeText={setBanco} />
        <Label>Saldo inicial (opcional)</Label>
        <Input placeholder="0,00" keyboardType="decimal-pad" value={saldo} onChangeText={setSaldo} />
        <Label>Descrição (opcional)</Label>
        <Input placeholder="Observações sobre a conta" value={descricao} onChangeText={setDescricao} />

        <PrimaryButton title="Salvar Alterações" onPress={handleSalvar} />
        <SecondaryButton
          title="Excluir Conta"
          onPress={handleExcluir}
          style={{ marginTop: spacing.sm, borderColor: colors.danger }}
        />
      </View>
    </Screen>
  );
}

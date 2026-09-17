import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Screen, Title, Subtitle, Label, Input, PrimaryButton, ChipSelect } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { spacing } from '../../theme/colors';

const TIPOS = ['Bancária', 'Caixa'];

export default function NovaContaScreen({ navigation }) {
  const { addConta } = useData();
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState(TIPOS[0]);
  const [banco, setBanco] = useState('');
  const [saldo, setSaldo] = useState('');
  const [descricao, setDescricao] = useState('');

  function handleSalvar() {
    if (!nome.trim()) {
      Alert.alert('Preencha o nome da conta');
      return;
    }
    addConta({
      nome: nome.trim(),
      tipo,
      banco: banco.trim(),
      saldo: saldo.trim() || '0',
      descricao: descricao.trim(),
    });
    navigation.goBack();
  }

  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Nova Conta</Title>
        <Subtitle>Cadastre uma conta bancária ou de caixa</Subtitle>
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
        <PrimaryButton title="Salvar Conta" onPress={handleSalvar} />
      </View>
    </Screen>
  );
}

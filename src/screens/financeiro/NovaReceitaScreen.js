import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Screen, Title, Subtitle, Label, Input, PrimaryButton } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { spacing } from '../../theme/colors';

function formatarValor(texto) {
  const limpo = texto.trim();
  if (!limpo) return limpo;
  return limpo.startsWith('R$') ? limpo : `R$ ${limpo}`;
}

export default function NovaReceitaScreen({ navigation }) {
  const { addReceita } = useData();
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState('');

  function handleSalvar() {
    if (!descricao.trim() || !valor.trim()) {
      Alert.alert('Preencha a descrição e o valor');
      return;
    }
    addReceita({
      descricao: descricao.trim(),
      valor: formatarValor(valor),
      data: data.trim() || new Date().toLocaleDateString('pt-BR'),
    });
    navigation.goBack();
  }

  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Nova Receita</Title>
        <Subtitle>Registre uma nova entrada financeira</Subtitle>
      </View>

      <View style={{ marginTop: spacing.xl }}>
        <Label>Descrição</Label>
        <Input placeholder="Ex.: Frota - Transporte X" value={descricao} onChangeText={setDescricao} />
        <Label>Valor</Label>
        <Input placeholder="0,00" keyboardType="decimal-pad" value={valor} onChangeText={setValor} />
        <Label>Data</Label>
        <Input placeholder="DD/MM/AAAA" value={data} onChangeText={setData} />
        <PrimaryButton title="Salvar Receita" onPress={handleSalvar} />
      </View>
    </Screen>
  );
}

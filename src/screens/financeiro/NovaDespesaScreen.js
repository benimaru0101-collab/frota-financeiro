import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Screen, Title, Subtitle, Label, Input, PrimaryButton, ChipSelect } from '../../components/UI';
import { useData } from '../../contexts/DataContext';
import { spacing } from '../../theme/colors';

const CATEGORIAS = ['Frota', 'Operacional', 'Administrativo'];

function formatarValor(texto) {
  const limpo = texto.trim();
  if (!limpo) return limpo;
  return limpo.startsWith('R$') ? limpo : `R$ ${limpo}`;
}

export default function NovaDespesaScreen({ navigation }) {
  const { addDespesa } = useData();
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [data, setData] = useState('');

  function handleSalvar() {
    if (!descricao.trim() || !valor.trim()) {
      Alert.alert('Preencha a descrição e o valor');
      return;
    }
    addDespesa({
      descricao: descricao.trim(),
      valor: formatarValor(valor),
      categoria,
      data: data.trim() || new Date().toLocaleDateString('pt-BR'),
    });
    navigation.goBack();
  }

  return (
    <Screen>
      <View style={{ marginTop: spacing.lg }}>
        <Title>Nova Despesa</Title>
        <Subtitle>Registre uma nova saída financeira</Subtitle>
      </View>

      <View style={{ marginTop: spacing.xl }}>
        <Label>Descrição</Label>
        <Input placeholder="Ex.: Combustível" value={descricao} onChangeText={setDescricao} />
        <Label>Valor</Label>
        <Input placeholder="0,00" keyboardType="decimal-pad" value={valor} onChangeText={setValor} />
        <Label>Categoria</Label>
        <ChipSelect options={CATEGORIAS} value={categoria} onChange={setCategoria} />
        <Label>Data</Label>
        <Input placeholder="DD/MM/AAAA" value={data} onChangeText={setData} />
        <PrimaryButton title="Salvar Despesa" onPress={handleSalvar} />
      </View>
    </Screen>
  );
}
